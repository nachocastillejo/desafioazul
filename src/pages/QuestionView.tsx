import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  ClipboardCheck,
  CircleDot,
  RefreshCw // <-- Para resetear score
} from 'lucide-react';
import { useTestStore, TestType } from '../lib/store';
import CategorySelectionModal from "../components/CategorySelectionModal";
import { useAuth } from '../contexts/AuthContext';
// import { registerCompletedTest } from '../services/statsService'; // Unused
import TestSimulator from '../components/TestSimulator';
import SingleQuestionMode from '../components/SingleQuestionMode';
import SimulacroFormativoCard from '../components/SimulacroFormativoCard';
import { supabase } from '../lib/supabase'; // Added Supabase import

// Define interfaces for props to fix 'any' type errors and improve clarity
interface TestCardProps {
  title: string;
  icon: React.ElementType;
  onStart: () => void;
  numberOfQuestions: number;
  setNumberOfQuestions: (num: number) => void;
  description?: string; // Optional description prop
}

interface SingleQuestionCardProps {
  title: string;
  icon: React.ElementType;
  stats: {
    correct: number;
    incorrect: number;
    unanswered: number;
    totalCorrected: number;
    finalScore: string;
  };
  onStart: () => void;
  onResetStats: () => void;
  description?: string;
}

// Componente para las tarjetas de test
const TestCard: React.FC<TestCardProps> = ({ title, icon: Icon, onStart, numberOfQuestions, setNumberOfQuestions, description }) => {
  return (
    <div className="w-full card flex flex-col p-4 sm:p-5 bg-white dark:bg-gray-800 shadow-md rounded-lg transition-all duration-300">
      {/* Encabezado interno con título e ícono */}
      <div className="flex items-center space-x-3 mb-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 dark:bg-primary/20 rounded-md flex items-center justify-center">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <h1 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white">
          {title}
        </h1>
      </div>
      {/* Explicación del test */}
      <div className="text-sm sm:text-base text-text-secondary dark:text-gray-400 mb-4 leading-snug">
        <p>
          {description ? description : (title === 'Teoría'
            ? 'El temario para el examen oficial de teoría de Policía Nacional Escala Básica consta de 45 temas divididos en ciencias jurídicas, sociales y técnico-científicas. Cada prueba tiene 100 preguntas en 50 minutos, y si eliges menos, el tiempo se ajustará proporcionalmente.'
            : 'Simulacro del ejercicio 1 de aptitudes: evalúa razonamiento, comprensión y aptitudes numérica, verbal y espacial; el número de preguntas (4 opciones, 1 correcta) y el tiempo varían, ajustándose proporcionalmente si eliges menos preguntas.')}
        </p>
      </div>
      {/* Selector de número de preguntas */}
      <div className="flex items-center gap-3 mb-4">
        {[15, 25, 50, 100].map((num) => (
          <button
            key={num}
            onClick={() => setNumberOfQuestions(num)}
            className={`px-3 py-1 rounded-md border transition-colors text-sm font-medium ${
              numberOfQuestions === num
                ? 'border-primary bg-primary/10 text-primary dark:bg-primary/20'
                : 'border-gray-300 dark:border-gray-600 text-text-secondary dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            {num}
          </button>
        ))}
      </div>
      {/* Botón principal al final */}
      <div className="mt-auto">
        <button
          onClick={onStart}
          className="w-full py-2 text-sm sm:text-base font-medium border border-text-secondary dark:border-gray-400 rounded-md text-text-primary dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Simulacro
        </button>
      </div>
    </div>
  );
};

// Componente para las tarjetas de preguntas sueltas
const SingleQuestionCard: React.FC<SingleQuestionCardProps> = ({ title, icon: Icon, stats, onStart, onResetStats, description }) => {
  const [showResetConfirmation, setShowResetConfirmation] = useState(false);
  
  const correctPercent = stats.totalCorrected ? ((stats.correct / stats.totalCorrected) * 100).toFixed(0) : '0';
  const incorrectPercent = stats.totalCorrected ? ((stats.incorrect / stats.totalCorrected) * 100).toFixed(0) : '0';
  const unansweredPercent = stats.totalCorrected ? ((stats.unanswered / stats.totalCorrected) * 100).toFixed(0) : '0';

  return (
    <div className="w-full relative card p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl">
      <button
        onClick={() => setShowResetConfirmation(true)}
        className="absolute top-4 right-4 p-2 rounded-full text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        title="Resetear Score"
      >
        <RefreshCw className="w-5 h-5" />
      </button>
      {/* Encabezado interno con título e ícono */}
      <div className="flex items-center space-x-3 mb-2">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 dark:bg-primary/20 rounded-md flex items-center justify-center">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white">
          {title}
        </h2>
      </div>
      {/* Descripción adicional */}
      {description && (
        <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400 mb-4">
          {description}
        </p>
      )}
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">{stats.finalScore}</div>
            <div className="text-xs text-text-secondary dark:text-gray-400">Puntuación</div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card p-4 bg-green-50 dark:bg-green-900/20 text-center rounded-xl">
          <p className="text-sm font-medium text-green-700 dark:text-green-400">Correctas</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-400">{stats.correct}</p>
          <p className="text-xs text-green-600 dark:text-green-500">{correctPercent}%</p>
        </div>
        <div className="card p-4 bg-red-50 dark:bg-red-900/20 text-center rounded-xl">
          <p className="text-sm font-medium text-red-700 dark:text-red-400">Incorrectas</p>
          <p className="text-2xl font-bold text-red-700 dark:text-red-400">{stats.incorrect}</p>
          <p className="text-xs text-red-600 dark:text-red-500">{incorrectPercent}%</p>
        </div>
        <div className="card p-4 bg-gray-50 dark:bg-gray-700 text-center rounded-xl">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No respondidas</p>
          <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">{stats.unanswered}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">{unansweredPercent}%</p>
        </div>
      </div>
      <div className="flex">
        <button
          onClick={onStart}
          className="w-full py-2 text-sm sm:text-base font-medium border border-text-secondary dark:border-gray-400 rounded-md text-text-primary dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Preguntas Sueltas
        </button>
      </div>

      {/* Popup de confirmación para resetear score */}
      {showResetConfirmation &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10000]">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-bold text-text-primary dark:text-white mb-4">
                ¿Seguro que quieres resetear el score?
              </h3>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowResetConfirmation(false)}
                  className="px-4 py-2 rounded-md text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    onResetStats();
                    setShowResetConfirmation(false);
                  }}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Resetear
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }
    </div>
  );
};

export default function QuestionView() {
  const {
    // testType, // Unused from store, singleQuestionType is used for mode
    // questions, // Unused from store
    isTestStarted,
    setNumberOfQuestions,
    startTest,
    finishTest,
    setTestType,
    selectedCategories,
    setSelectedCategories
  } = useTestStore();

  const { user } = useAuth();
  // const DB_PRACTICE_STATS_KEY = 'PSICOTECNICO_SUELTAS'; // No longer needed for table/row identification

  // Estados locales para número de preguntas en Teoría y Psicotécnico
  const [teoriaNumQuestions, /* setTeoriaNumQuestions */] = useState(15); // setTeoriaNumQuestions unused
  const [psicoNumQuestions, setPsicoNumQuestions] = useState(15);

  // Estados para gestionar la vista
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSingleQuestionMode, setShowSingleQuestionMode] = useState(false);
  const [singleQuestionType, setSingleQuestionType] = useState<TestType | null>(null);

  // Estados compartidos para ambos modos
  const [startTime, /* setStartTime */] = useState<Date | null>(null); // setStartTime unused
  const [showResults, setShowResults] = useState(false);
  const [resultsSaved, setResultsSaved] = useState(false);
  const [showExitConfirmation, setShowExitConfirmation] = useState(false);

  // Estados para estadísticas de preguntas sueltas (específicamente para Psicotécnico en la tarjeta)
  const initialPracticeStats = {
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    totalCorrected: 0,
    finalScore: '0.00'
  };
  const [singleQuestionStats, setSingleQuestionStats] = useState(initialPracticeStats);

  // Load practice stats from DB
  useEffect(() => {
    if (user) {
      const fetchPracticeStats = async () => {
        const { data, error } = await supabase
          .from('user_profiles') // Changed to user_profiles
          .select('preguntas_sueltas_correct, preguntas_sueltas_incorrect, preguntas_sueltas_unanswered, preguntas_sueltas_total_corrected, preguntas_sueltas_final_score') // Select specific columns with new names
          .eq('id', user.id) // Assuming user_profiles uses 'id' as PK linked to auth.users.id
          .single();

        if (data && !error) {
          setSingleQuestionStats({
            correct: data.preguntas_sueltas_correct || 0,
            incorrect: data.preguntas_sueltas_incorrect || 0,
            unanswered: data.preguntas_sueltas_unanswered || 0,
            totalCorrected: data.preguntas_sueltas_total_corrected || 0,
            finalScore: data.preguntas_sueltas_final_score || '0.00'
          });
        } else if (error && error.code !== 'PGRST116') { // PGRST116: 'No rows found' (user might not have a profile yet or no stats saved)
          console.warn('User profile or practice stats not found, or error fetching:', error);
          // Optionally, create a profile row here if it doesn't exist, or ensure it's created on sign-up.
          // For now, we just use initial stats.
          setSingleQuestionStats(initialPracticeStats);
        }
      };
      fetchPracticeStats();
    } else {
      // If user logs out, reset stats to initial
      setSingleQuestionStats(initialPracticeStats);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const savePracticeStatsToDb = async (statsToSave: typeof initialPracticeStats) => {
    if (!user) return;
    const { error } = await supabase
      .from('user_profiles') // Changed to user_profiles
      .update({ // Using update, assuming profile row exists. Upsert could also be used if id is unique.
        preguntas_sueltas_correct: statsToSave.correct,
        preguntas_sueltas_incorrect: statsToSave.incorrect,
        preguntas_sueltas_unanswered: statsToSave.unanswered,
        preguntas_sueltas_total_corrected: statsToSave.totalCorrected,
        preguntas_sueltas_final_score: statsToSave.finalScore,
        preguntas_sueltas_last_updated_at: new Date().toISOString(),
      })
      .eq('id', user.id); // Match the user's profile row

    if (error) {
      console.error('Error saving practice stats to user_profiles:', error);
    }
  };

  // Función para iniciar el test según el tipo
  const handleTestStart = (type: TestType) => {
    setTestType(type);
    setShowSingleQuestionMode(false);
    if (type === 'Teoría') {
      setNumberOfQuestions(teoriaNumQuestions);
    } else {
      setNumberOfQuestions(psicoNumQuestions);
    }
    setShowCategoryModal(true);
  };

  // Función para iniciar preguntas sueltas
  const handleSingleQuestionStart = (type: TestType) => {
    setSingleQuestionType(type);
    setTestType(type);
    setShowSingleQuestionMode(true);
    setShowCategoryModal(true);
  };

  // Cuando el usuario confirma la selección de categorías
  const handleStartTestModal = (selectedCats: string[]) => {
    setSelectedCategories(selectedCats);
    startTest(); // This sets isTestStarted to true
    setShowCategoryModal(false);
  };

  const handleNewTest = () => {
    finishTest();
    setShowResults(false);
    setResultsSaved(false);
    setShowSingleQuestionMode(false);
  };

  const resetSingleQuestionStats = () => {
    setSingleQuestionStats(initialPracticeStats);
    if (user) {
      savePracticeStatsToDb(initialPracticeStats);
    }
  };

  // Wrapped setter for SingleQuestionMode stats
  const handleSetSingleQuestionModeStats = (newStats: typeof initialPracticeStats) => {
    setSingleQuestionStats(newStats); // Update local state for display

    // Persist only if the current single question mode is for Psicotécnico
    // singleQuestionType is set by handleSingleQuestionStart
    if (user && singleQuestionType === 'Psicotécnico') {
      savePracticeStatsToDb(newStats);
    }
  };

  const handleExit = () => setShowExitConfirmation(true);

  // Modo de preguntas sueltas
  if (showSingleQuestionMode && isTestStarted) {
    return (
      <SingleQuestionMode 
        testType={singleQuestionType}
        selectedCategories={selectedCategories}
        stats={singleQuestionStats}
        setStats={handleSetSingleQuestionModeStats} // Use the wrapped setter
        confirmExit={false}
        onExit={() => onExitConfirmWrapper()}  
        showExitConfirmation={showExitConfirmation}
        setShowExitConfirmation={setShowExitConfirmation}
        onExitConfirm={() => {
          setShowSingleQuestionMode(false);
          finishTest();
          setShowExitConfirmation(false);
        }}
      />
    );
  }

  // Modo test (simulacros)
  if (isTestStarted) {
    return (
      <TestSimulator
        user={user}
        showResults={showResults}
        setShowResults={setShowResults}
        startTime={startTime}
        resultsSaved={resultsSaved}
        setResultsSaved={setResultsSaved}
        onNewTest={handleNewTest}
        onExit={handleExit}
        showExitConfirmation={showExitConfirmation}
        setShowExitConfirmation={setShowExitConfirmation}
      />
    );
  }

  // Vista de selección inicial
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Cabecera */}
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
          <ClipboardCheck className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
          Tests Psicotécnicos
        </h1>
      </div>

      {/* Tarjetas en orden */}
      <div className="space-y-6">
        {/* 1. Tarjeta de Practica y mejora tus conocimientos */}
        <div className="w-full bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white">
              Practica y supera tus límites
            </h2>
            <div className="text-sm sm:text-base text-text-secondary dark:text-gray-400 mt-2">
              <ul className="list-disc list-outside ml-5 space-y-1">
                <li>Realiza tests adaptados a tus necesidades para mejorar constantemente.</li>
                <li>Elige el número de preguntas, simula las condiciones del examen o revisa tus respuestas para aprender de cada intento.</li>
                <li>Cada práctica te acerca más a tu objetivo.</li>
              </ul>
            </div>
          </div>
          <div className="flex justify-center">
            <img
              src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-1.2.1&auto=format&fit=crop&w=1050&q=80"
              alt="Representación de un test"
              className="max-w-[150px] sm:max-w-[200px] h-auto rounded-lg"
            />
          </div>
        </div>

        {/* 2. Tarjeta de Preguntas Sueltas con descripción */}
        <SingleQuestionCard
          title="Preguntas Sueltas"
          icon={CircleDot}
          stats={singleQuestionStats}
          onStart={() => handleSingleQuestionStart('Psicotécnico')}
          onResetStats={resetSingleQuestionStats}
          description="Realiza preguntas de psicotécnicos de forma aleatoria, eligiendo qué categorías deseas practicar, sin límite de tiempo ni final. Ideal para reforzar tus conocimientos y mejorar a tu propio ritmo, ¡sin presiones!"
        />

        {/* 3. Tarjeta de Simulacros */}
        <TestCard
          title="Simulacros"
          icon={ClipboardCheck}
          numberOfQuestions={psicoNumQuestions}
          setNumberOfQuestions={setPsicoNumQuestions}
          onStart={() => handleTestStart('Psicotécnico')}
          description="Crea tu propio simulacro de examen y haz de la práctica tu mejor aliada. Ajusta qué cantidad de preguntas deseas realizar, así como las áreas en las que quieras enfocarte para mejorar tus conocimientos. Cada pregunta tiene cuatro posibilidades de respuesta de las cuales solo una es correcta. ¡A por ello!"
        />

        {/* 4. Tarjeta de Simulacros Formativos */}
        <SimulacroFormativoCard />
      </div>

      {/* Modal de selección de categorías */}
      <CategorySelectionModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onStart={handleStartTestModal}
      />
    </div>
  );
}

// Helper para salir sin warning en preguntas sueltas
function onExitConfirmWrapper() {
  // Se invoca desde SingleQuestionMode cuando confirmExit es false.
}
