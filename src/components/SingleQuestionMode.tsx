import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  BookmarkPlus,
  BookmarkCheck,
  RefreshCw,
  ChevronRight,
  X,
  CircleDot
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TestType } from '../lib/store';

interface SingleQuestionModeProps {
  testType: TestType | null;
  selectedCategories: string[];
  stats: {
    correct: number;
    incorrect: number;
    unanswered: number;
    totalCorrected: number;
    finalScore: string;
  };
  setStats: (stats: {
    correct: number;
    incorrect: number;
    unanswered: number;
    totalCorrected: number;
    finalScore: string;
  }) => void;
  onExit: () => void;
  showExitConfirmation: boolean;
  setShowExitConfirmation: (value: boolean) => void;
  onExitConfirm: () => void;
  confirmExit?: boolean; // Si es false, no se muestra warning al salir
}

export default function SingleQuestionMode({
  testType,
  selectedCategories,
  stats,
  setStats,
  onExit,
  showExitConfirmation,
  setShowExitConfirmation,
  onExitConfirm,
  confirmExit = true
}: SingleQuestionModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [corrected, setCorrected] = useState(false);
  const [bookmarkedQuestions, setBookmarkedQuestions] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchQuestions() {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('test_type', testType)
        .in('category', selectedCategories);
      if (error || !data || data.length === 0) {
        console.error('No se encontraron preguntas:', error);
        return;
      }
      // Transformar los datos para incluir imagen de la pregunta y de las opciones
      const transformed = data.map((q: any) => ({
        id: q.id.toString(),
        category: q.category,
        topic: q.topic,
        text: q.text,
        image_url: q.image_url,        // Imagen principal de la pregunta
        image_alt: q.image_alt,        // Alt de la imagen principal
        options: [
          q.option1_image_url
            ? { text: q.option1, image_url: q.option1_image_url, image_alt: q.option1_image_alt }
            : q.option1,
          q.option2_image_url
            ? { text: q.option2, image_url: q.option2_image_url, image_alt: q.option2_image_alt }
            : q.option2,
          q.option3_image_url
            ? { text: q.option3, image_url: q.option3_image_url, image_alt: q.option3_image_alt }
            : q.option3,
          q.option4_image_url
            ? { text: q.option4, image_url: q.option4_image_url, image_alt: q.option4_image_alt }
            : q.option4,
        ],
        correctOption: q.correct_option,
        explanation: q.explanation,
        testType: q.test_type,
      }));
      setFilteredQuestions(transformed);
      const randomIndex = Math.floor(Math.random() * transformed.length);
      setCurrentQuestion(transformed[randomIndex]);
    }
    fetchQuestions();
  }, [testType, selectedCategories]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (corrected) return;
    setSelectedAnswer(optionIndex);
  };

  const handleCorrect = () => {
    if (corrected) return;
    setShowExplanation(true);
    setCorrected(true);

    const newStats = { ...stats };

    if (selectedAnswer === null) {
      newStats.unanswered += 1;
    } else if (selectedAnswer === currentQuestion.correctOption) {
      newStats.correct += 1;
    } else {
      newStats.incorrect += 1;
    }

    newStats.totalCorrected = newStats.correct + newStats.incorrect + newStats.unanswered;
    const nAlternatives = 4;
    let rawScore = 0;
    if (newStats.totalCorrected > 0) {
      const penalized = newStats.correct - (newStats.incorrect / (nAlternatives - 1));
      rawScore = (penalized * 10) / newStats.totalCorrected;
    }
    newStats.finalScore = Math.max(0, rawScore).toFixed(2);

    setStats(newStats);
  };

  const handleNextQuestion = () => {
    if (filteredQuestions.length) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      setCurrentQuestion(filteredQuestions[randomIndex]);
    }
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrected(false);
  };

  const handleBookmark = () => {
    setBookmarkedQuestions(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(currentQuestion.id)) {
        newBookmarks.delete(currentQuestion.id);
      } else {
        newBookmarks.add(currentQuestion.id);
      }
      return newBookmarks;
    });
  };

  const resetQuestion = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    setCorrected(false);
  };

  if (!currentQuestion) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="card p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <p className="text-center text-text-secondary dark:text-gray-400">
            No hay preguntas disponibles para las categorías seleccionadas.
          </p>
          <button
            onClick={onExitConfirm}
            className="mt-4 w-full btn-primary py-2 rounded-md"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Encabezado del test */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full relative">
            <CircleDot className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
              Preguntas Sueltas
            </h1>
            <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400">
              Practica preguntas individuales sin límite de tiempo
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              if (!confirmExit) {
                onExitConfirm();
              } else {
                onExit();
              }
            }}
            className="btn-secondary p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Pregunta Actual */}
      <div className="card p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
        <div className="flex justify-between items-start mb-4">
          <div className="text-xs text-primary dark:text-primary/90">
            {currentQuestion.category}
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleBookmark}
              className={`p-2 rounded transition-colors ${
                bookmarkedQuestions.has(currentQuestion.id)
                  ? 'text-primary bg-primary/10 dark:bg-primary/20'
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {bookmarkedQuestions.has(currentQuestion.id) ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <BookmarkPlus className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={resetQuestion}
              className="p-2 rounded transition-colors text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              disabled={!selectedAnswer && !corrected}
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-lg text-text-primary dark:text-white mb-6">
          {currentQuestion.text}
        </p>

        {currentQuestion.image_url && (
          <div className="mb-6 flex justify-center">
            <img
              src={currentQuestion.image_url}
              alt={currentQuestion.image_alt || 'Imagen de la pregunta'}
              className="max-w-[300px] h-auto rounded-lg shadow-sm"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option: any, index: number) => {
            const optionText = typeof option === 'object' ? option.text : option;
            let optionClasses =
              'w-full text-left p-4 rounded-lg border transition-colors ';
            if (corrected) {
              if (index === currentQuestion.correctOption) {
                optionClasses += 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-700 dark:text-green-400';
              } else if (index === selectedAnswer && index !== currentQuestion.correctOption) {
                optionClasses += 'bg-red-50 dark:bg-red-900/20 border-red-500 dark:border-red-400 text-red-700 dark:text-red-400';
              } else {
                optionClasses += 'border-gray-200 dark:border-gray-700 text-text-secondary dark:text-gray-400';
              }
            } else {
              if (selectedAnswer === index) {
                optionClasses += 'bg-blue-100 dark:bg-blue-900/20 border-blue-500 ';
              } else {
                optionClasses += 'border-gray-200 dark:border-gray-700 hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-700 ';
              }
              optionClasses += 'text-text-primary dark:text-white';
            }
            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={corrected}
                className={optionClasses}
              >
                <div className="flex items-center">
                  <span className="text-primary dark:text-primary font-semibold mr-3">
                    {String.fromCharCode(65 + index)}.
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{optionText}</span>
                    {typeof option === 'object' && option.image_url && (
                      <img
                        src={option.image_url}
                        alt={option.image_alt || 'Imagen de la opción'}
                        className="mt-2 max-w-[150px] h-auto rounded"
                      />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {!corrected ? (
          <button
            onClick={handleCorrect}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-2 rounded-md"
          >
            <span>Corregir</span>
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="w-full btn-primary flex items-center justify-center space-x-2 py-2 rounded-md"
          >
            <span>Siguiente pregunta</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {showExplanation && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mt-6">
            <h3 className="font-medium text-text-primary dark:text-white mb-2">Explicación</h3>
            <p className="text-text-secondary dark:text-gray-300">{currentQuestion.explanation}</p>
          </div>
        )}
      </div>

      {confirmExit && showExitConfirmation &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[9999]">
            <div className="bg-white dark:bg-gray-800 rounded-md p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold mb-2 text-text-primary dark:text-white">
                ¿Estás seguro/a?
              </h3>
              <p className="text-text-secondary dark:text-gray-400 mb-4">
                Si cierras ahora, perderás el progreso del examen actual.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowExitConfirmation(false)}
                  className="px-4 py-2 rounded-md text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  onClick={onExitConfirm}
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
