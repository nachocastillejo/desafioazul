import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserStats, 
  getLatestTestResults, 
  getEvolutionData,
  getUserStrengthAreas,
  getDebugStudyProgress
} from '../services/statsService';

export const useStats = (testTypeFilter = 'all') => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    bestScore: 0,
    averageTime: '00:00',
    lastResults: [],
    evolutionData: { labels: [], scores: [], types: [] },
    strengthAreas: [],
    improvementAreas: []
  });

  const fetchStats = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      console.log('[useStats] Obteniendo estadísticas para usuario:', user.id);
      
      // Obtener estadísticas generales
      const userStats = await getUserStats(user.id);
      
      if (!userStats) {
        console.log('[useStats] No se encontraron estadísticas para el usuario');
        setLoading(false);
        return;
      }

      const { profile, testAttempts } = userStats;
      console.log('[useStats] Perfil obtenido:', profile);
      console.log('[useStats] Intentos de test obtenidos:', testAttempts);
      
      const totalTests = profile?.total_tests_taken || 0;
      let averageScore = 0;
      let bestScore = 0;
      let totalTimeInMinutes = 0;
      
      if (testAttempts && testAttempts.length > 0) {
        averageScore = testAttempts.reduce((sum, test) => sum + test.score, 0) / testAttempts.length;
        bestScore = Math.max(...testAttempts.map(test => test.score));
        totalTimeInMinutes = testAttempts.reduce((sum, test) => {
          const timeString = test.time_taken;
          let minutes = 0;
          const minutesMatch = timeString.match(/(\d+)M/);
          if (minutesMatch) {
            minutes += parseInt(minutesMatch[1]);
          }
          const hoursMatch = timeString.match(/(\d+)H/);
          if (hoursMatch) {
            minutes += parseInt(hoursMatch[1]) * 60;
          }
          return sum + minutes;
        }, 0) / testAttempts.length;
      }
      
      const hours = Math.floor(totalTimeInMinutes / 60);
      const minutes = Math.floor(totalTimeInMinutes % 60);
      const averageTime = `${hours > 0 ? hours + 'h ' : ''}${minutes}m`;
      
      console.log('[useStats] Obteniendo datos de evolución');
      const evolutionData = await getEvolutionData(user.id);
      console.log('[useStats] Datos de evolución:', evolutionData);
      
      console.log('[useStats] Obteniendo áreas fuertes y débiles con filtro:', testTypeFilter);
      const { strengthAreas, improvementAreas } = await getUserStrengthAreas(user.id, testTypeFilter);
      console.log('[useStats] Áreas fuertes:', strengthAreas);
      console.log('[useStats] Áreas de mejora:', improvementAreas);
      
      console.log('[useStats] Obteniendo información de depuración');
      const debugData = await getDebugStudyProgress(user.id);
      console.log('[useStats] Información de depuración:', debugData);
      
      setStats({
        totalTests,
        averageScore: parseFloat(averageScore.toFixed(2)),
        bestScore: parseFloat(bestScore.toFixed(2)),
        averageTime,
        lastResults: testAttempts || [],
        evolutionData,
        strengthAreas,
        improvementAreas
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
   };

  useEffect(() => {
    fetchStats();
  }, [user, testTypeFilter]); // Añadimos testTypeFilter como dependencia

  return { stats, loading, refetch: fetchStats };
};
