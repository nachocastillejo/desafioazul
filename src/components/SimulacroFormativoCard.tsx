import React, { useEffect } from 'react';
import { ClipboardCheck } from 'lucide-react';
import { useTestStore } from '../lib/store';
import { useQuestionsStore } from '../lib/store';
import { supabase } from '../lib/supabase';

// Función que asegura que el valor se convierte en array
const parseSimulacros = (value: any): string[] => {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    // Si es un string, asumimos que puede venir separado por comas
    const cleaned = value.replace(/[\[\]"']/g, '');
    return cleaned.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const SimulacroFormativoCard: React.FC = () => {
  // Obtenemos las preguntas y la función para cargarlas
  const { questions, fetchQuestions } = useQuestionsStore();
  const testStore = useTestStore();

  // Asegurarse de que se carguen las preguntas si aún no están
  useEffect(() => {
    if (questions.length === 0) {
      fetchQuestions();
    }
  }, [questions, fetchQuestions]);

  // Debug: mostrar en consola las preguntas y sus simulacros
  useEffect(() => {
    console.log('Preguntas cargadas en SimulacroFormativoCard:', questions);
    questions.forEach((q, i) => {
      console.log(`Pregunta ${i}: simulacros ->`, parseSimulacros(q.simulacros));
    });
  }, [questions]);

  // Extraemos valores únicos de simulacros de todas las preguntas,
  // usando parseSimulacros para asegurar que el valor es un array
  const simulacrosSet = new Set<string>();
  questions.forEach((q) => {
    const simArray = parseSimulacros(q.simulacros);
    simArray.forEach(sim => simulacrosSet.add(sim));
  });
  const simulacrosOptions = Array.from(simulacrosSet);

  // Función para iniciar un simulacro formativo filtrando por el valor seleccionado.
  const handleSimulacroStart = async (simulacro: string) => {
    // Transformamos el valor a un literal de array en formato Postgres: {simulacro}
    const filterValue = `{${simulacro}}`;
  
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .filter('simulacros', 'cs', filterValue);
  
    if (error || !data || data.length === 0) {
      console.error('No se encontraron preguntas para el simulacro:', simulacro, error);
      return;
    }
  
    // Transformar las preguntas para que tengan el formato esperado.
    const transformed = data.map((q: any) => ({
      id: q.id.toString(),
      testType: q.test_type,
      category: q.category,
      topic: q.topic,
      text: q.text,
      options: [
        q.option1_image_url ? { text: q.option1, image_url: q.option1_image_url } : q.option1,
        q.option2_image_url ? { text: q.option2, image_url: q.option2_image_url } : q.option2,
        q.option3_image_url ? { text: q.option3, image_url: q.option3_image_url } : q.option3,
        q.option4_image_url ? { text: q.option4, image_url: q.option4_image_url } : q.option4,
      ],
      correctOption: q.correct_option,
      explanation: q.explanation,
      image_url: q.image_url,
      simulacros: parseSimulacros(q.simulacros),
      created_at: q.created_at
    }));
  
    const shuffled = transformed.sort(() => Math.random() - 0.5);
  
    // Usar useTestStore.setState directamente en lugar de testStore.setState
    useTestStore.setState({
      questions: shuffled,
      isTestStarted: true,
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 60
    });
  };


  return (
    <div className="card flex flex-col p-4 sm:p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-all duration-300">
      {/* Encabezado con título e ícono */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 dark:bg-primary/20 rounded-md flex items-center justify-center">
          <ClipboardCheck className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white">
          Simulacros Formativos
        </h1>
      </div>
      {/* Explicación breve */}
      <div className="text-sm sm:text-base text-text-secondary dark:text-gray-400 mb-4 leading-snug">
        <p>
          El equipo de Desafío Azul subirá periódicamente exámenes formativos diseñados para que puedas practicar con pruebas similares a las de las convocatorias oficiales. Estos simulacros te permitirán familiarizarte con el formato y el nivel de dificultad de los exámenes reales, ayudándote a mejorar tu rendimiento y confianza para la fecha de la convocatoria.
        </p>
      </div>
      {/* Mostrar un botón por cada valor único de simulacros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {simulacrosOptions.length ? (
          simulacrosOptions.map((sim, index) => (
            <button
              key={index}
              onClick={() => handleSimulacroStart(sim)}
              className="px-3 py-1 rounded-md border transition-colors text-sm font-medium
                border-gray-300 dark:border-gray-600 text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {sim}
            </button>
          ))
        ) : (
          <p className="text-sm text-text-secondary dark:text-gray-400">No hay simulacros disponibles</p>
        )}
      </div>
      {/* Mensaje o nota informativa */}
      <div className="mt-auto">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Selecciona un simulacro para comenzar.
        </p>
      </div>
    </div>
  );
};

export default SimulacroFormativoCard;
