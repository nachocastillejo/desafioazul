import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

/**
 * Obtiene las estadísticas generales del usuario
 * @returns Estadísticas del usuario
 */
export const getUserStats = async (userId: string) => {
  try {
    console.log('[getUserStats] userId recibido:', userId);
    // Obtener el perfil del usuario con las estadísticas
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error al obtener el perfil:', profileError);
      return null;
    }

    // Obtener los intentos de test
    const { data: testAttempts, error: attemptsError } = await supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    if (attemptsError) {
      console.error('Error al obtener los intentos de test:', attemptsError);
      return {
        profile,
        testAttempts: []
      };
    }

    return {
      profile,
      testAttempts
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return null;
  }
};

/**
 * Registra un test completado de manera optimizada
 */
export const registerCompletedTest = async (
  userId: string,
  testData: {
    test_type: string;
    categories: string[];
    questions: any[];
    answers: Record<string, number>;
    score: number;
    correct_answers: number;
    incorrect_answers: number;
    unanswered: number;
    time_taken: string;
  }
) => {
  try {
    console.log('[registerCompletedTest] userId recibido:', userId);
    console.log('[registerCompletedTest] testData:', testData);
    
    // 1. Registrar el intento de test y actualizar estadísticas del usuario en paralelo
    const [testAttemptResult] = await Promise.all([
      // Registrar el intento de test
      supabase
        .from('test_attempts')
        .insert({
          user_id: userId,
          test_type: testData.test_type,
          categories: testData.categories,
          questions: testData.questions,
          answers: testData.answers,
          score: testData.score,
          correct_answers: testData.correct_answers,
          incorrect_answers: testData.incorrect_answers,
          unanswered: testData.unanswered,
          time_taken: testData.time_taken,
        })
        .select()
        .single(),
      
      // Actualizar las estadísticas del usuario (en paralelo)
      supabase.rpc('increment_user_stat', {
        user_id: userId,
        stat_name: 'total_tests_taken',
        increment_by: 1
      }),
      
      // Llamar a la nueva función si el usuario es gratuito
      (async () => {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('subscription_status')
          .eq('id', userId)
          .single();

        if (profile && profile.subscription_status !== 'active' && profile.subscription_status !== 'premium') {
          return supabase.rpc('increment_free_test_counter', {
            p_user_id: userId,
          });
        }
      })(),

      // Actualizar el total de preguntas respondidas (en paralelo)
      supabase.rpc('increment_user_stat', {
        user_id: userId,
        stat_name: 'total_questions_answered',
        increment_by: testData.correct_answers + testData.incorrect_answers + testData.unanswered
      })
    ]);

    // Verificar errores en la operación principal
    if (testAttemptResult.error) {
      console.error('Error al registrar el test:', testAttemptResult.error);
      return { success: false, error: testAttemptResult.error };
    }

    // 2. Actualizar estadísticas por categoría esperando a que termine la operación
    try {
      await updateCategoryStats(userId, testData);
    } catch (error) {
      console.error('Error al actualizar estadísticas por categoría:', error);
    }

    return { success: true, data: testAttemptResult.data };
  } catch (error) {
    console.error('Error al registrar test completado:', error);
    return { success: false, error };
  }
};

/**
 * Actualiza las estadísticas por categoría de forma optimizada
 */
const updateCategoryStats = async (
  userId: string,
  testData: {
    test_type: string;
    categories: string[];
    questions: any[];
    answers: Record<string, number>;
  }
) => {
  try {
    console.log('[updateCategoryStats] userId recibido:', userId);
    console.log('[updateCategoryStats] testData:', testData);
    // 1. Analizar las preguntas y respuestas para obtener estadísticas por categoría
    const categoryStats: Record<string, { correct: number; incorrect: number; total: number }> = {};

    // Contar aciertos y fallos por categoría
    testData.questions.forEach((question: any) => {
      const category = question.category;
      const userAnswer = testData.answers[question.id];
      
      if (!categoryStats[category]) {
        categoryStats[category] = { correct: 0, incorrect: 0, total: 0 };
      }
      
      categoryStats[category].total++;
      
      if (userAnswer !== undefined) {
        if (userAnswer === question.correctOption) {
          categoryStats[category].correct++;
        } else {
          categoryStats[category].incorrect++;
        }
      }
    });
    console.log('[updateCategoryStats] categoryStats calculadas:', categoryStats);

    // 2. Obtener todas las categorías existentes de una sola vez
    const { data: existingCategories, error: fetchError } = await supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('test_type', testData.test_type)
      .in('category', Object.keys(categoryStats));

    if (fetchError) {
      console.error('Error al obtener categorías existentes:', fetchError);
      return;
    }
    console.log('[updateCategoryStats] Categorías existentes:', existingCategories);

    // Mapear categorías existentes por nombre para acceso rápido
    const existingCategoriesMap = existingCategories?.reduce((map, cat) => {
      map[cat.category] = cat;
      return map;
    }, {}) || {};

    // 3. Preparar actualizaciones e inserciones
    const updates = [];
    const inserts = [];

    for (const [category, stats] of Object.entries(categoryStats)) {
      const existingCategory = existingCategoriesMap[category];
      
      if (existingCategory) {
        // Actualizar categoría existente
        updates.push({
          id: existingCategory.id,
          user_id: userId,
          category,
          test_type: testData.test_type,
          questions_seen: existingCategory.questions_seen + stats.total,
          questions_correct: existingCategory.questions_correct + stats.correct,
          last_studied_at: new Date().toISOString(),
          mastery_level: Math.round(
            ((existingCategory.questions_correct + stats.correct) / 
            (existingCategory.questions_seen + stats.total)) * 100
          )
        });
      } else {
        // Crear nueva categoría
        inserts.push({
          user_id: userId,
          category,
          test_type: testData.test_type,
          questions_seen: stats.total,
          questions_correct: stats.correct,
          mastery_level: Math.round((stats.correct / stats.total) * 100),
          last_studied_at: new Date().toISOString()
        });
      }
    }
    console.log('[updateCategoryStats] Updates a realizar:', updates);
    console.log('[updateCategoryStats] Inserts a realizar:', inserts);

    // 4. Ejecutar actualizaciones e inserciones en paralelo
    const promises = [];
    
    if (updates.length > 0) {
      promises.push(
        supabase
          .from('study_progress')
          .upsert(updates)
      );
    }
    
    if (inserts.length > 0) {
      promises.push(
        supabase
          .from('study_progress')
          .insert(inserts)
      );
    }

    if (promises.length > 0) {
      const results = await Promise.all(promises);
      results.forEach((result, index) => {
        if (result.error) {
          console.error(`Error en la operación ${index}:`, result.error);
        } else {
          console.log(`Operación ${index} completada correctamente:`, result.data);
        }
      });
    } else {
      console.log('No se requieren actualizaciones o inserciones en study_progress.');
    }
  } catch (error) {
    console.error('Error al actualizar estadísticas por categoría:', error);
    throw error;
  }
};

/**
 * Obtiene los últimos resultados de tests
 */
export const getLatestTestResults = async (userId: string, limit = 5, testType?: string) => {
  try {
    let query = supabase
      .from('test_attempts')
      .select('*')
      .eq('user_id', userId);
    
    // Si se especifica un tipo de test, filtrar por él
    if (testType && testType !== 'all') {
      query = query.eq('test_type', testType);
    }
    
    const { data, error } = await query
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error al obtener resultados recientes:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error al obtener resultados recientes:', error);
    return [];
  }
};

/**
 * Obtiene datos para el gráfico de evolución
 */
export const getEvolutionData = async (userId: string, limit = 10, testType?: string) => {
  try {
    let query = supabase
      .from('test_attempts')
      .select('completed_at, score, test_type');
    
    // Si se especifica un tipo de test, filtrar por él
    if (testType && testType !== 'all') {
      query = query.eq('test_type', testType);
    }
    
    const { data, error } = await query
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error al obtener datos de evolución:', error);
      return { labels: [], scores: [] };
    }

    // Invertir para que estén en orden cronológico
    const reversedData = [...data].reverse();

    return {
      labels: reversedData.map(item => new Date(item.completed_at).toLocaleDateString()),
      scores: reversedData.map(item => item.score),
      types: reversedData.map(item => item.test_type)
    };
  } catch (error) {
    console.error('Error al obtener datos de evolución:', error);
    return { labels: [], scores: [] };
  }
};

/**
 * Obtiene las áreas fuertes y débiles del usuario
 */

interface StrengthAreaData {
  is_strength: boolean;
  category: string;
  mastery_level: number;
  test_type: string;
  questions_seen: number;
  questions_correct: number;
}

export const getUserStrengthAreas = async (userId: string, testType?: string) => {
  try {
    console.log('[getUserStrengthAreas] userId:', userId, 'testType:', testType);
    
    // Usar la función RPC para obtener las áreas de fortaleza y debilidad
    const { data, error } = await supabase.rpc('get_user_strength_areas', {
      user_id_param: userId,
      test_type_param: testType === 'all' ? null : testType
    });

    if (error) {
      console.error('Error al obtener áreas de fortaleza:', error);
      console.log('Intentando método alternativo...');
      
      // Si la función RPC falla, intentar con el método alternativo
      return await getFallbackStrengthAreas(userId, testType);
    }

    console.log('[getUserStrengthAreas] Datos obtenidos de RPC:', data);

    // Separar áreas fuertes y débiles
    const strengthAreas = data
      .filter((area: StrengthAreaData) => area.is_strength)
      .map((area: StrengthAreaData) => ({
        topic: area.category,
        score: area.mastery_level,
        type: area.test_type,
        questions_seen: area.questions_seen,
        questions_correct: area.questions_correct
      }));
    
    const improvementAreas = data
      .filter((area: StrengthAreaData) => !area.is_strength)
      .map((area: StrengthAreaData) => ({
        topic: area.category,
        score: area.mastery_level,
        type: area.test_type,
        questions_seen: area.questions_seen,
        questions_correct: area.questions_correct
      }));

    console.log('[getUserStrengthAreas] Áreas fuertes:', strengthAreas);
    console.log('[getUserStrengthAreas] Áreas de mejora:', improvementAreas);

    return { strengthAreas, improvementAreas };
  } catch (error) {
    console.error('Error al obtener áreas de fortaleza:', error);
    return await getFallbackStrengthAreas(userId, testType);
  }
};

/**
 * Método alternativo para obtener áreas fuertes y débiles
 * (se usa como fallback si la función RPC falla)
 */
const getFallbackStrengthAreas = async (userId: string, testType?: string) => {
  try {
    console.log('[getFallbackStrengthAreas] userId:', userId, 'testType:', testType);
    
    // Consultar directamente la tabla study_progress para obtener estadísticas por categoría
    let query = supabase
      .from('study_progress')
      .select('*')
      .eq('user_id', userId);
    
    // Si se especifica un tipo de test, filtrar por él
    if (testType && testType !== 'all') {
      query = query.eq('test_type', testType);
    }
    
    const { data, error } = await query;

    if (error) {
      console.error('Error al obtener áreas de fortaleza (fallback):', error);
      return { strengthAreas: [], improvementAreas: [] };
    }

    console.log('[getFallbackStrengthAreas] Datos obtenidos:', data);

    // Filtrar categorías con suficientes preguntas para ser significativas (al menos 1)
    const significantCategories = data.filter(cat => cat.questions_seen >= 1);
    console.log('[getFallbackStrengthAreas] Categorías significativas:', significantCategories);
    
    // Ordenar por nivel de dominio (mastery_level)
    const sortedCategories = significantCategories.sort((a, b) => b.mastery_level - a.mastery_level);
    
    // Mapear a formato esperado
    const categoriesWithScores = sortedCategories.map(cat => ({
      topic: cat.category,
      score: cat.mastery_level,
      type: cat.test_type,
      questions_seen: cat.questions_seen,
      questions_correct: cat.questions_correct
    }));

    // Dividir en fortalezas (top 3) y áreas de mejora (bottom 2)
    const strengthAreas = categoriesWithScores.slice(0, 3);
    const improvementAreas = categoriesWithScores.slice(-2).reverse();

    console.log('[getFallbackStrengthAreas] Áreas fuertes:', strengthAreas);
    console.log('[getFallbackStrengthAreas] Áreas de mejora:', improvementAreas);

    return { strengthAreas, improvementAreas };
  } catch (error) {
    console.error('Error al obtener áreas de fortaleza (fallback):', error);
    return { strengthAreas: [], improvementAreas: [] };
  }
};

/**
 * Obtiene información de depuración sobre el progreso de estudio
 */
export const getDebugStudyProgress = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('debug_study_progress', {
      user_id_param: userId
    });

    if (error) {
      console.error('Error al obtener información de depuración:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error al obtener información de depuración:', error);
    return [];
  }
};

/**
 * Resetea todas las estadísticas del usuario
 */
export const resetUserStats = async (userId: string) => {
  try {
    console.log('[resetUserStats] Reseteando estadísticas para usuario:', userId);
    
    // Ejecutar todas las operaciones en paralelo para mayor eficiencia
    const [testAttemptsResult, studyProgressResult, profileUpdateResult] = await Promise.all([
      // 1. Eliminar todos los intentos de test
      supabase
        .from('test_attempts')
        .delete()
        .eq('user_id', userId),
      
      // 2. Eliminar todo el progreso de estudio
      supabase
        .from('study_progress')
        .delete()
        .eq('user_id', userId),
      
      // 3. Resetear contadores en el perfil de usuario
      supabase
        .from('user_profiles')
        .update({
          total_tests_taken: 0,
          total_questions_answered: 0,
          study_streak: 0
        })
        .eq('id', userId)
    ]);
    
    // Verificar si hubo errores
    if (testAttemptsResult.error) {
      console.error('Error al eliminar intentos de test:', testAttemptsResult.error);
    }
    
    if (studyProgressResult.error) {
      console.error('Error al eliminar progreso de estudio:', studyProgressResult.error);
    }
    
    if (profileUpdateResult.error) {
      console.error('Error al actualizar perfil:', profileUpdateResult.error);
    }
    
    // Si alguna operación falló, lanzar error
    if (testAttemptsResult.error || studyProgressResult.error || profileUpdateResult.error) {
      throw new Error('Error al resetear estadísticas');
    }
    
    console.log('[resetUserStats] Estadísticas reseteadas correctamente');
    return true;
  } catch (error) {
    console.error('Error al resetear estadísticas:', error);
    throw error;
  }
};