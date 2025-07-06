import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  Bookmark,
  X,
  ArrowLeft,
  ArrowRight,
  Timer,
  Trophy,
  BookmarkCheck
} from 'lucide-react';
import { useTestStore, calculateTestScore} from '../lib/store';
import { registerCompletedTest } from '../services/statsService';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { User } from '@supabase/supabase-js';

// Define an interface for the component props
interface TestSimulatorProps {
  showResults: boolean;
  setShowResults: (value: boolean) => void;
  startTime: Date | null;
  resultsSaved: boolean;
  setResultsSaved: (value: boolean) => void;
  onNewTest: () => void;
  onExit: () => void;
  showExitConfirmation: boolean;
  setShowExitConfirmation: (value: boolean) => void;
}

export default function TestSimulator({
  showResults,
  setShowResults,
  startTime,
  resultsSaved,
  setResultsSaved,
  onNewTest,
  onExit,
  showExitConfirmation,
  setShowExitConfirmation
}: TestSimulatorProps) {
  const {
    questions,
    currentQuestionIndex,
    answers,
    timeRemaining,
    answerQuestion,
    finishTest
  } = useTestStore();

  const { user, refreshProfile } = useAuth();

  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<string[]>([]);
  const [timeExpired, setTimeExpired] = useState(false);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [savingResults, setSavingResults] = useState(false);

  // Reloj
  useEffect(() => {
    if (timeRemaining > 0 && !showResults) {
      const timer = setInterval(() => {
        useTestStore.setState((state) => ({
          timeRemaining: state.timeRemaining - 1
        }));
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeRemaining === 0 && !timeExpired) {
      setTimeExpired(true);
      setShowResults(true);
    }
  }, [timeRemaining, showResults, timeExpired, setShowResults]);

  // Fetch existing bookmarks for the current user and questions
  useEffect(() => {
    const fetchBookmarkedQuestions = async () => {
      if (!user || !questions || questions.length === 0) {
        setBookmarkedQuestions([]);
        return;
      }
      try {
        const questionIds = questions.map(q => q.id);
        const { data, error } = await supabase
          .from('bookmarks')
          .select('question_id')
          .eq('user_id', user.id)
          .in('question_id', questionIds);

        if (error) {
          console.error('Error fetching bookmarks:', error);
          setBookmarkedQuestions([]);
          return;
        }
        if (data) {
          setBookmarkedQuestions(data.map(b => b.question_id));
        }
      } catch (error) {
        console.error('Error in fetchBookmarkedQuestions:', error);
        setBookmarkedQuestions([]);
      }
    };

    fetchBookmarkedQuestions();
  }, [user, questions]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBookmark = async (questionId: string) => {
    if (!user) {
      console.warn('User not logged in. Cannot bookmark.');
      // Optionally, prompt user to login or show a message
      return;
    }

    try {
      const isBookmarked = bookmarkedQuestions.includes(questionId);
      if (isBookmarked) {
        // Remove bookmark
        const { error: deleteError } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId);

        if (deleteError) {
          console.error('Error removing bookmark:', deleteError);
          return;
        }
        setBookmarkedQuestions((prev) => prev.filter((id) => id !== questionId));
      } else {
        // Add bookmark
        const { error: insertError } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, question_id: questionId });

        if (insertError) {
          // Handle potential unique constraint violation if needed, though UI should prevent double-add.
          console.error('Error adding bookmark:', insertError);
          return;
        }
        setBookmarkedQuestions((prev) => [...prev, questionId]);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const calculateResults = () => {
    let correct = 0,
      incorrect = 0,
      blank = 0;
    questions.forEach((question) => {
      if (answers[question.id] === question.shuffledCorrectOption) {
        correct++;
      } else if (answers[question.id] !== undefined) {
        incorrect++;
      } else {
        blank++;
      }
    });
    const score = calculateTestScore(correct, incorrect, questions.length, 4);
    return {
      correct,
      incorrect,
      blank,
      score
    };
  };

  const handleFinishTest = async () => {
    setShowResults(true);
    
    // Calcular resultados
    const results = calculateResults();
    
    // Calcular tiempo transcurrido
    const endTime = new Date();
    const elapsedTime = startTime ? (endTime.getTime() - startTime.getTime()) / 1000 : 0; // en segundos
    
    // Formatear tiempo para ISO 8601 Duration (PT1H30M15S)
    const hours = Math.floor(elapsedTime / 3600);
    const minutes = Math.floor((elapsedTime % 3600) / 60);
    const seconds = Math.floor(elapsedTime % 60);
    
    let timeTaken = 'PT';
    if (hours > 0) timeTaken += `${hours}H`;
    if (minutes > 0) timeTaken += `${minutes}M`;
    if (seconds > 0) timeTaken += `${seconds}S`;
    
    // Guardar resultados en Supabase
    if (user) {
      setSavingResults(true);
      try {
        await registerCompletedTest(user.id, {
          // Se actualiza el fallback a "Teoría" (o según corresponda)
          test_type: questions[0]?.testType || 'Teoría',
          categories: questions.map(q => q.category).filter((v, i, a) => a.indexOf(v) === i),
          questions: questions,
          answers: answers,
          score: results.score,
          correct_answers: results.correct,
          incorrect_answers: results.incorrect,
          unanswered: results.blank,
          time_taken: timeTaken
        });
        setResultsSaved(true);
        if (refreshProfile) {
          refreshProfile();
        }
      } catch (error) {
        console.error('Error al guardar resultados:', error);
      } finally {
        setSavingResults(false);
      }
    }
  };

  const handleAnswerQuestion = (questionId: string, optionIndex: number) => {
    answerQuestion(questionId, optionIndex);
  };

  // Estilo base para las tarjetas
  const cardStyle =
    'card p-4 sm:p-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl transition-all duration-300';

  // 1. Si no hay preguntas disponibles
  if (!questions.length) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
              Tests
            </h1>
            <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400">
              Realiza tests para evaluar tus conocimientos
            </p>
          </div>
        </div>
        <div className={cardStyle}>
          <p className="text-center text-text-secondary dark:text-gray-400">
            No hay preguntas disponibles para las categorías seleccionadas.
          </p>
          <button
            onClick={() => {
              finishTest();
            }}
            className="mt-4 w-full btn-primary py-2 rounded-md"
          >
            Volver a intentar
          </button>
        </div>
      </div>
    );
  }

  // 2. Vista de resultados
  if (showResults) {
    const results = calculateResults();
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
              Resultados del Test
            </h2>
            {timeExpired && (
              <div className="flex items-center text-yellow-600 dark:text-yellow-500 ml-auto">
                <Timer className="w-5 h-5 mr-2" />
                <span className="font-medium">Tiempo agotado</span>
              </div>
            )}
          </div>
          <hr className="border-gray-200 dark:border-gray-700 mt-4" />
        </div>
        <div className={cardStyle}>
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary">{results.score}</div>
                <div className="text-sm text-text-secondary dark:text-gray-400">Puntuación</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
              <p className="text-sm font-medium text-green-700 dark:text-green-400">Correctas</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                {results.correct}
              </p>
              <p className="text-xs text-green-600 dark:text-green-500">
                de {questions.length}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl text-center">
              <p className="text-sm font-medium text-red-700 dark:text-red-400">Incorrectas</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-400">
                {results.incorrect}
              </p>
              <p className="text-xs text-red-600 dark:text-red-500">
                Penalización: -{(results.incorrect / 3).toFixed(2)}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-xl text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Sin contestar</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                {results.blank}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400">preguntas</p>
            </div>
          </div>
          <div className="mb-6 overflow-x-auto overflow-y-visible relative">
            <div className="flex flex-wrap gap-2 justify-center px-2 py-2">
              {questions.map((question, index) => {
                let pillColor = 'bg-gray-400';
                if (answers[question.id] !== undefined) {
                  pillColor =
                    answers[question.id] === question.shuffledCorrectOption
                      ? 'bg-green-500'
                      : 'bg-red-500';
                }
                const isSelected = selectedQuestionIndex === index;
                return (
                  <button
                    key={question.id}
                    onClick={() => setSelectedQuestionIndex(index)}
                    className={`
                      relative z-10 w-8 h-8 flex-none rounded-full flex items-center justify-center text-white
                      transition-all duration-200
                      ${pillColor}
                      ${
                        isSelected
                          ? 'scale-105 ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-gray-800 shadow-md shadow-primary/30'
                          : 'hover:scale-105 hover:shadow-md hover:shadow-gray-300 dark:hover:shadow-gray-600'
                      }
                    `}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 border rounded-md p-4">
            <p className="font-medium text-text-primary dark:text-white mb-2">
              {selectedQuestionIndex + 1}. {questions[selectedQuestionIndex].text}
            </p>
            {questions[selectedQuestionIndex].image_url && (
              <div className="mb-4 flex justify-center">
                <img
                  src={questions[selectedQuestionIndex].image_url}
                  alt={`Imagen de la pregunta ${selectedQuestionIndex + 1}`}
                  className="max-w-full h-auto rounded-md shadow-sm"
                  loading="lazy"
                />
              </div>
            )}
            <div className="space-y-2 mb-4">
              {questions[selectedQuestionIndex].shuffledOptions?.map((option, index) => {
                const isCorrect = index === questions[selectedQuestionIndex].shuffledCorrectOption;
                const userAnswer = answers[questions[selectedQuestionIndex].id];
                const isUserWrong =
                  userAnswer !== undefined && userAnswer === index && !isCorrect;
                let optionClasses =
                  'p-4 rounded-md transition-colors border ';
                if (isCorrect) {
                  optionClasses += 'bg-green-50 dark:bg-green-900/20 border-green-700 dark:border-green-400 text-green-700 dark:text-green-400';
                } else if (isUserWrong) {
                  optionClasses += 'bg-red-50 dark:bg-red-900/20 border-red-700 dark:border-red-400 text-red-700 dark:text-red-400';
                } else {
                  optionClasses += 'border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400';
                }
                const optionText = typeof option === 'object' ? option.text : option;
                return (
                  <div key={index} className={optionClasses}>
                    <div className="flex items-center">
                      <span className="font-semibold mr-3 text-primary">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary dark:text-white">
                          {optionText}
                        </span>
                        {typeof option === 'object' && option.image_url && (
                          <img
                            src={option.image_url}
                            alt={`Imagen de la opción ${String.fromCharCode(65 + index)}`}
                            className="mt-2 h-12 w-auto rounded"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-sm text-text-secondary dark:text-gray-400">
              <strong className="text-text-primary dark:text-gray-300">Explicación:</strong>{' '}
              {questions[selectedQuestionIndex].explanation}
            </div>
          </div>
          <div className="mt-8 flex justify-center">
            {savingResults ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                <span className="text-text-secondary dark:text-gray-400">Guardando resultados...</span>
              </div>
            ) : (
              <button onClick={onNewTest} className="btn-primary px-8 py-3 rounded-xl">
                {resultsSaved ? "Nuevo Test" : "Continuar"}
              </button>
            )}
          </div>
          
          {resultsSaved && (
            <div className="mt-4 text-center text-sm text-green-600 dark:text-green-400">
              Resultados guardados correctamente
            </div>
          )}
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
            Pregunta {currentQuestionIndex + 1} de {questions.length}
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <div
            className={`flex items-center px-4 py-2 rounded-md ${
              timeRemaining <= 10
                ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-gray-400'
            }`}
          >
            <Timer className="w-4 h-4 mr-2" />
            <span className="font-medium">{formatTime(timeRemaining)}</span>
          </div>
          <button
            onClick={onExit}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      <div className={cardStyle}>
        <div className="p-2">
          <div className="flex justify-between items-start mb-4">
            <div className="text-xs text-primary dark:text-primary/90">
              {currentQuestion.category} 
            </div>
            <button
              onClick={() => toggleBookmark(currentQuestion.id)}
              className={`w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 transition-colors ${                bookmarkedQuestions.includes(currentQuestion.id)
                  ? 'text-primary'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {bookmarkedQuestions.includes(currentQuestion.id) ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
          <div className="mb-6">
            <p className="text-lg text-text-primary dark:text-white mb-4">
              {currentQuestion.text}
            </p>
            {currentQuestion.image_url && (
              <div className="mb-6 flex justify-center">
                <img
                  src={currentQuestion.image_url}
                  alt={`Imagen de la pregunta ${currentQuestionIndex + 1}`}
                  className="max-w-[300px] h-auto rounded-lg shadow-sm"
                  loading="lazy"
                />
              </div>
            )}
            <div className="space-y-3">
              {currentQuestion.shuffledOptions?.map((option, index) => {
                const optionText = typeof option === 'object' ? option.text : option;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswerQuestion(currentQuestion.id, index)}
                    className={`w-full text-left p-4 rounded-md border transition-colors ${
                      answers[currentQuestion.id] === index
                        ? 'border-primary bg-primary/10 dark:bg-primary/20 text-primary'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-primary font-semibold mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      <div className="flex flex-col">
                        <span className="font-medium text-text-primary dark:text-white">
                          {optionText}
                        </span>
                        {typeof option === 'object' && option.image_url && (
                          <img
                            src={option.image_url}
                            alt={`Imagen de la opción ${String.fromCharCode(65 + index)}`}
                            className="mt-2 max-w-[150px] h-auto rounded"
                          />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex justify-between mt-8">
            <button
              onClick={() =>
                useTestStore.setState({ currentQuestionIndex: currentQuestionIndex - 1 })
              }
              disabled={currentQuestionIndex === 0}
              className="flex items-center text-text-secondary dark:text-gray-400 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              <span className="font-medium">Anterior</span>
            </button>
            {currentQuestionIndex === questions.length - 1 ? (
              <button onClick={handleFinishTest} className="btn-primary px-6 py-2 rounded-md">
                Finalizar Test
              </button>
            ) : (
              <button
                onClick={() =>
                  useTestStore.setState({ currentQuestionIndex: currentQuestionIndex + 1 })
                }
                className="flex items-center text-text-secondary dark:text-gray-400"
              >
                <span className="font-medium">Siguiente</span>
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
      {showExitConfirmation &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-md p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-white">
                ¿Estás seguro/a?
              </h3>
              <p className="text-text-secondary dark:text-gray-400 mb-4">
                Si cierras ahora, perderás todo el progreso del test actual.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExitConfirmation(false)}
                  className="px-4 py-2 rounded-md text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    finishTest();
                    setShowExitConfirmation(false);
                  }}
                  className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                >
                  Salir
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
