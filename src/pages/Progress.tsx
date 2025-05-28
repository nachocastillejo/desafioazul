import React, { useState, useEffect, useRef } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  TooltipItem,
  ChartOptions
} from 'chart.js';
import {
  TrendingUp,
  Clock,
  Target,
  Brain,
  Calendar,
  Filter,
  ChevronDown,
  Info,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { useStats } from '../hooks/useStats';
import { useAuth } from '../contexts/AuthContext';
import { resetUserStats } from '../services/statsService';

// Registrar los componentes necesarios para Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define interfaces for cleaner type management
interface DropdownOption {
  value: string;
  label: string;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  isDarkMode: boolean;
}

interface TestResult {
  completed_at: string; // Assuming it's a date string
  test_type: 'Teoría' | 'Psicotécnico' | string; // Or a more general string if other types exist
  score: number;
  time_taken: string;
  correct_answers: number;
  incorrect_answers: number;
  // Add any other properties that result objects might have
}

interface AreaStat {
  topic: string;
  score: number;
  questions_correct: number;
  questions_seen: number;
  type: 'Teoría' | 'Psicotécnico' | string; // Match TestResult['test_type']
}

interface EvolutionData {
  labels: string[];
  scores: number[];
  types?: Array<'Teoría' | 'Psicotécnico' | string>;
}

interface StatsData {
  lastResults: TestResult[];
  evolutionData: EvolutionData;
  strengthAreas: AreaStat[];
  improvementAreas: AreaStat[];
}

// Componente Dropdown personalizado
const Dropdown: React.FC<DropdownProps> = ({ options, value, onChange, isDarkMode }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cierra el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((option) => option.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center space-x-2 p-2 rounded-lg shadow-sm transition-colors focus:outline-none ${
          isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
        } ${open ? 'ring-2 ring-primary' : ''}`}
      >
        <Filter className="w-4 h-4 text-current" />
        <span className="text-sm">{selectedOption ? selectedOption.label : 'Select...'}</span>
        <ChevronDown className="w-4 h-4 text-current" />
      </button>
      {open && (
        <div
          className={`absolute right-0 mt-2 w-full rounded-lg shadow-lg z-10 overflow-hidden ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}
        >
          {options.map((option: DropdownOption) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`cursor-pointer px-4 py-2 text-sm transition-colors ${
                isDarkMode
                  ? 'text-white hover:bg-gray-700'
                  : 'text-gray-900 hover:bg-gray-100'
              } ${option.value === value ? 'font-bold' : ''}`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Progress() {
  // Actualizamos el tipo para testTypeFilter: "all" | "Teoría" | "Psicotécnico"
  const [testsCount, setTestsCount] = useState(5);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [testTypeFilter, setTestTypeFilter] = useState<'all' | 'Teoría' | 'Psicotécnico'>('all');
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Ahora pasamos testTypeFilter al hook useStats
  const { stats, loading, refetch } = useStats(testTypeFilter);
  const { user } = useAuth();

  // Detectar cambios en el modo oscuro
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };

    // Comprobar el estado inicial
    checkDarkMode();

    // Observar cambios en la clase 'dark' del elemento html
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Recargar estadísticas cuando cambie el filtro
  useEffect(() => {
    console.log('[Progress] Filtro cambiado a:', testTypeFilter);
    refetch();
  }, [testTypeFilter]);

  // Filtro de datos según el tipo de test seleccionado
  const filteredResults: TestResult[] = stats.lastResults.filter((result: TestResult) => 
    testTypeFilter === 'all' || result.test_type === testTypeFilter
  );

  // Calcular estadísticas filtradas
  const filteredStats = {
    totalTests: filteredResults.length,
    averageScore: filteredResults.length > 0 
      ? parseFloat((filteredResults.reduce((sum, test) => sum + test.score, 0) / filteredResults.length).toFixed(2))
      : 0,
    bestScore: filteredResults.length > 0
      ? parseFloat(Math.max(...filteredResults.map(test => test.score)).toFixed(2))
      : 0,
    averageTime: filteredResults.length > 0
      ? calculateAverageTime(filteredResults)
      : '0m'
  };

  // Función actualizada para calcular el tiempo promedio con segundos
  function calculateAverageTime(tests: TestResult[]) {
    const totalTimeInSeconds = tests.reduce((sum: number, test: TestResult) => {
      const timeString = test.time_taken || "";
      let seconds = 0;
      const hoursMatch = timeString.match(/(\d+)H/i);
      if (hoursMatch) {
        seconds += parseInt(hoursMatch[1]) * 3600;
      }
      const minutesMatch = timeString.match(/(\d+)M/i);
      if (minutesMatch) {
        seconds += parseInt(minutesMatch[1]) * 60;
      }
      const secondsMatch = timeString.match(/(\d+)S/i);
      if (secondsMatch) {
        seconds += parseInt(secondsMatch[1]);
      }
      return sum + seconds;
    }, 0) / tests.length;
  
    const hours = Math.floor(totalTimeInSeconds / 3600);
    const minutes = Math.floor((totalTimeInSeconds % 3600) / 60);
    const seconds = Math.floor(totalTimeInSeconds % 60);
  
    let result = "";
    if (hours > 0) result += `${hours}h `;
    if (minutes > 0 || hours > 0) result += `${minutes}m `;
    result += `${seconds}s`;
  
    return result.trim();
  }

  // Preparar datos para el gráfico según el filtro
  const filteredEvolutionData: EvolutionData = {
    labels: [],
    scores: [],
    types: []
  };

  if (stats.evolutionData.labels.length > 0) {
    console.log('[Progress] Datos de evolución disponibles:', stats.evolutionData);
    
    const evolutionWithTypes = stats.evolutionData.labels.map((label, index) => ({
      label,
      score: stats.evolutionData.scores[index],
      type: stats.evolutionData.types?.[index] || 'all' // Default to 'all' if type is missing
    }));
    
    console.log('[Progress] Datos de evolución con tipos:', evolutionWithTypes);
  
    const filteredEvolution = evolutionWithTypes.filter(item =>
      testTypeFilter === 'all' || item.type === testTypeFilter
    );
    
    console.log('[Progress] Datos de evolución filtrados:', filteredEvolution);
  
    filteredEvolutionData.labels = filteredEvolution.map(item => item.label);
    filteredEvolutionData.scores = filteredEvolution.map(item => item.score);
    filteredEvolutionData.types = filteredEvolution.map(item => item.type as ('Teoría' | 'Psicotécnico' | 'all'));
  }

  const chartData = {
    labels: filteredEvolutionData.labels.slice(-testsCount),
    datasets: [
      {
        label: 'Puntuación',
        data: filteredEvolutionData.scores.slice(-testsCount),
        fill: true,
        borderColor: '#004cac',
        backgroundColor: 'rgba(0, 76, 172, 0.1)',
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#004cac',
        pointBorderColor: isDarkMode ? '#1F2937' : '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      }
    ]
  };

  const chartOptions: ChartOptions<'line'> = { // Explicitly type chartOptions
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: {
        right: 0
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? '#374151' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDarkMode ? '#F9FAFB' : '#1F2937',
        bodyColor: isDarkMode ? '#F9FAFB' : '#1F2937',
        borderColor: isDarkMode ? '#4B5563' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        displayColors: false,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        callbacks: {
          label: (context: TooltipItem<'line'>) => {
            const score = context.parsed.y.toFixed(2);
            return `Puntuación: ${score}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          display: false
        },
        ticks: {
          color: isDarkMode ? '#9CA3AF' : '#6B7280'
        }
      },
      y: {
        min: 0,
        max: 10,
        ticks: {
          stepSize: 2,
          color: isDarkMode ? '#9CA3AF' : '#6B7280',
          font: {
            size: 12
          }
        },
        grid: {
          display: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index' as 'index' // Added 'as const' for stricter typing if needed, or 'as 'index''
    }
  };

  // Opciones para el dropdown de tipo de test actualizadas
  const testOptions: DropdownOption[] = [
    { value: 'all', label: 'Todos los tests' },
    { value: 'Teoría', label: 'Solo Teoría' },
    { value: 'Psicotécnico', label: 'Solo Psicotécnicos' }
  ];

  // Puedes usar el Dropdown si lo deseas; actualmente está comentado.
  // Ejemplo:
  // <Dropdown options={testOptions} value={testTypeFilter} onChange={setTestTypeFilter} isDarkMode={isDarkMode} />

  console.log('[Progress] Filtrando áreas por tipo de test:', testTypeFilter);
  console.log('[Progress] Áreas de fortaleza disponibles:', stats.strengthAreas);
  console.log('[Progress] Áreas de mejora disponibles:', stats.improvementAreas);
  
  const filteredStrengthAreas: AreaStat[] = stats.strengthAreas.filter((area: AreaStat) => {
    const matches = testTypeFilter === 'all' || area.type === testTypeFilter;
    console.log(`[Progress] Área fuerte "${area.topic}" (tipo: ${area.type}) ${matches ? 'coincide' : 'no coincide'} con filtro ${testTypeFilter}`);
    return matches;
  });
  
  const filteredImprovementAreas: AreaStat[] = stats.improvementAreas.filter((area: AreaStat) => {
    const matches = testTypeFilter === 'all' || area.type === testTypeFilter;
    console.log(`[Progress] Área de mejora "${area.topic}" (tipo: ${area.type}) ${matches ? 'coincide' : 'no coincide'} con filtro ${testTypeFilter}`);
    return matches;
  });

  const handleResetStats = async () => {
    if (!user) return;
    
    setResetting(true);
    try {
      await resetUserStats(user.id);
      setShowResetConfirmation(false);
      await refetch();
    } catch (error) {
      console.error('Error al resetear estadísticas:', error);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Título de la página con filtro */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
              Progreso y Estadísticas
            </h1>
            <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400">
              Seguimiento detallado de tu rendimiento
            </p>
          </div>
        </div>
        
        {/* Filtro de tipo de test y botón de reseteo */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowResetConfirmation(true)}
            className="flex items-center space-x-1 p-2 rounded-lg text-text-secondary dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            title="Resetear estadísticas"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Resetear</span>
          </button>
          {/* Puedes habilitar el Dropdown si deseas cambiar el filtro */}
          {/* <Dropdown
            options={testOptions}
            value={testTypeFilter}
            onChange={setTestTypeFilter}
            isDarkMode={isDarkMode}
          /> */}
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Tests Completados</p>
              <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
                {filteredStats.totalTests}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-primary dark:text-primary" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Nota Media</p>
              <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
                {filteredStats.averageScore}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Mejor Nota</p>
              <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
                {filteredStats.bestScore}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-2 sm:mb-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-100 dark:bg-orange-900/30 rounded-xl flex items-center justify-center">
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-text-secondary dark:text-gray-400">Tiempo Medio</p>
              <p className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
                {filteredStats.averageTime}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico de Evolución */}
      <div className="card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white mb-2 sm:mb-0">
            Evolución del Rendimiento
          </h2>
          <div className="flex space-x-2">
            {[3, 5, 10].map((count) => (
              <button
                key={count}
                onClick={() => setTestsCount(count)}
                className={`px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  testsCount === count
                    ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                    : 'text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {count} tests
              </button>
            ))}
          </div>
        </div>
        <div className="w-full h-56 sm:h-72">
          {filteredEvolutionData.labels.length > 0 ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-text-secondary dark:text-gray-400">
              <p>No hay suficientes datos para mostrar la evolución</p>
            </div>
          )}
        </div>
      </div>

      {/* Últimos Resultados y Áreas de Mejora */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Tabla de Últimos Resultados */}
        <div className="lg:col-span-2 card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white mb-4">
            Últimos Resultados
          </h2>
          {filteredResults.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 text-text-secondary dark:text-gray-400 font-medium">Fecha</th>
                    <th className="text-left py-2 px-3 text-text-secondary dark:text-gray-400 font-medium">Tipo</th>
                    <th className="text-left py-2 px-3 text-text-secondary dark:text-gray-400 font-medium">Nota</th>
                    <th className="text-left py-2 px-3 text-text-secondary dark:text-gray-400 font-medium">Tiempo</th>
                    <th className="text-left py-2 px-3 text-text-secondary dark:text-gray-400 font-medium">Aciertos/Fallos</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredResults.slice(0, 5).map((result: TestResult, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 last:border-0"
                    >
                      <td className="py-2 px-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-text-secondary dark:text-gray-400" />
                          <span className="dark:text-gray-300">{new Date(result.completed_at).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 dark:text-gray-300">
                        {result.test_type}
                      </td>
                      <td className="py-2 px-3">
                        <span className="font-medium text-primary">{result.score.toFixed(2)}</span>
                      </td>
                      <td className="py-2 px-3 dark:text-gray-300">
                        {result.time_taken
                          .replace('PT', '')
                          .replace('H', 'h ')
                          .replace('M', 'm ')
                          .replace('S', 's')}
                      </td>
                      <td className="py-2 px-3">
                        <span className="text-green-600 dark:text-green-400">{result.correct_answers}</span>
                        <span className="mx-1 dark:text-gray-400">/</span>
                        <span className="text-red-600 dark:text-red-400">{result.incorrect_answers}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 text-center text-text-secondary dark:text-gray-400">
              <p>No hay resultados disponibles para el filtro seleccionado</p>
            </div>
          )}
        </div>

        {/* Áreas de Mejora */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-text-primary dark:text-white mb-4 flex items-center">
            Análisis por Áreas
            <div className="relative group ml-2">
              <Info className="w-4 h-4 text-text-secondary dark:text-gray-400" />
              <div className="absolute left-0 bottom-full mb-2 w-64 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-xs text-text-secondary dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                El análisis se basa en tu rendimiento en cada categoría. Se necesitan al menos 3 preguntas por categoría para mostrar resultados precisos.
              </div>
            </div>
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">
                Puntos Fuertes
              </h3>
              <div className="space-y-2">
                {filteredStrengthAreas.length > 0 ? (
                  filteredStrengthAreas.map((area: AreaStat, index) => (
                    <div key={index} className="bg-green-50 dark:bg-green-900/20 p-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-text-primary dark:text-white">
                          {area.topic}
                        </span>
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">
                          {area.score}%
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-text-secondary dark:text-gray-400">
                        {area.questions_correct} correctas de {area.questions_seen} preguntas
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <p className="text-xs text-text-secondary dark:text-gray-400">
                      {filteredStats.totalTests > 0 
                        ? "Completa más preguntas de cada categoría para ver tus puntos fuertes" 
                        : "Completa algunos tests para ver tus puntos fuertes"}
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-2">
                Áreas de Mejora
              </h3>
              <div className="space-y-2">
                {filteredImprovementAreas.length > 0 ? (
                  filteredImprovementAreas.map((area: AreaStat, index) => (
                    <div key={index} className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-text-primary dark:text-white">
                          {area.topic}
                        </span>
                        <span className="text-xs font-bold text-orange-600 dark:text-orange-400">
                          {area.score}%
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-text-secondary dark:text-gray-400">
                        {area.questions_correct} correctas de {area.questions_seen} preguntas
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg">
                    <p className="text-xs text-text-secondary dark:text-gray-400">
                      {filteredStats.totalTests > 0 
                        ? "Completa más preguntas de cada categoría para identificar áreas de mejora" 
                        : "Completa algunos tests para identificar áreas de mejora"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación para resetear estadísticas */}
      {showResetConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center space-x-3 mb-4 text-yellow-600 dark:text-yellow-500">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold">¿Resetear estadísticas?</h3>
            </div>
            
            <p className="text-text-secondary dark:text-gray-400 mb-6">
              Esta acción eliminará permanentemente todas tus estadísticas y no se puede deshacer. 
              Perderás todo tu historial de tests, progreso y análisis de rendimiento.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowResetConfirmation(false)}
                className="px-4 py-2 rounded-lg text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                disabled={resetting}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetStats}
                className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors flex items-center space-x-2"
                disabled={resetting}
              >
                {resetting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Reseteando...</span>
                  </>
                ) : (
                  <span>Sí, resetear todo</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
