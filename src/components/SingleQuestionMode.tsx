import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import {
  BookmarkCheck,
  ChevronRight,
  X,
  CircleDot,
  Bookmark
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { TestType, Question } from '../lib/store';
import { useAuth } from '../contexts/AuthContext';

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
  initialQuestions?: Question[]; // Added
  modeTitle?: string; // Added
  modeDescription?: string; // Added
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
  confirmExit = true,
  initialQuestions, // Added
  modeTitle, // Added
  modeDescription // Added
}: SingleQuestionModeProps) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [corrected, setCorrected] = useState(false);
  const [bookmarkedQuestionsDb, setBookmarkedQuestionsDb] = useState<Set<string>>(new Set());

  // State for just-in-time shuffled options for the current question
  const [displayOptions, setDisplayOptions] = useState<(string | { text: string; image_url?: string; originalIndex: number })[]>([]);
  const [displayCorrectOption, setDisplayCorrectOption] = useState<number | null>(null);

  const { user } = useAuth();

  const shuffleAndSetDisplayQuestion = (questionToDisplay: Question | null) => {
    if (questionToDisplay) {
      setCurrentQuestion(questionToDisplay); // Set current question first

      const originalOptions = questionToDisplay.options;
      const optionsWithOriginalIndex = originalOptions.map((option, index) => ({
        option,
        originalIndex: index
      }));
      const shuffledOptionsWithOriginalIndex = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);

      const finalShuffledOptions = shuffledOptionsWithOriginalIndex.map(item => {
        if (typeof item.option === 'object' && item.option !== null) {
          return { ...(item.option as {text: string, image_url?: string}), originalIndex: item.originalIndex };
        }
        return { text: item.option as string, originalIndex: item.originalIndex };
      });
      
      const newCorrectOptionIndex = shuffledOptionsWithOriginalIndex.findIndex(
        item => item.originalIndex === questionToDisplay.correctOption
      );
      
      setDisplayOptions(finalShuffledOptions);
      setDisplayCorrectOption(newCorrectOptionIndex);
      // Reset answer state for the new question presentation
      setSelectedAnswer(null);
      setShowExplanation(false);
      setCorrected(false);
    } else {
      setCurrentQuestion(null);
      setDisplayOptions([]);
      setDisplayCorrectOption(null);
    }
  };

  useEffect(() => {
    async function fetchQuestionsAndBookmarks() {
      let questionsToUse: Question[] = [];

      if (initialQuestions && initialQuestions.length > 0) {
        questionsToUse = initialQuestions.filter(q => selectedCategories.includes(q.category));
      } else if (testType && selectedCategories.length > 0) {
        const { data, error } = await supabase
          .from('questions')
          .select('*')
          .eq('test_type', testType)
          .in('category', selectedCategories);

        if (error || !data || data.length === 0) {
          console.error('No se encontraron preguntas:', error);
          setFilteredQuestions([]);
          shuffleAndSetDisplayQuestion(null); // Clear display if no questions
          return;
        }
        questionsToUse = data.map((q: any) => ({
          id: q.id.toString(),
          category: q.category,
          topic: q.topic,
          text: q.text,
          image_url: q.image_url,
          options: [
            q.option1_image_url ? { text: q.option1, image_url: q.option1_image_url } : q.option1,
            q.option2_image_url ? { text: q.option2, image_url: q.option2_image_url } : q.option2,
            q.option3_image_url ? { text: q.option3, image_url: q.option3_image_url } : q.option3,
            q.option4_image_url ? { text: q.option4, image_url: q.option4_image_url } : q.option4,
          ],
          correctOption: q.correct_option,
          explanation: q.explanation,
          testType: q.test_type as TestType,
          simulacros: q.simulacros,
          created_at: q.created_at,
        }));
      } else {
        setFilteredQuestions([]);
        shuffleAndSetDisplayQuestion(null); // Clear display
        return;
      }
      
      if (questionsToUse.length === 0) {
        setFilteredQuestions([]);
        shuffleAndSetDisplayQuestion(null); // Clear display
        return;
      }

      setFilteredQuestions(questionsToUse);

      // Logic to decide if we need to set a new question or stick with the current one
      if (currentQuestion && questionsToUse.some(q => q.id === currentQuestion.id)) {
        // Current question is still in the filtered list. Do nothing to avoid re-shuffling / changing it.
        // If bookmarks need to be re-fetched for the current user, that can be a separate effect or handled carefully.
      } else if (questionsToUse.length > 0) {
        // No current question, or current question is no longer valid, pick a new one.
        const randomIndex = Math.floor(Math.random() * questionsToUse.length);
        shuffleAndSetDisplayQuestion(questionsToUse[randomIndex]);
      } else {
        // No questions available
        shuffleAndSetDisplayQuestion(null);
      }

      // Fetch bookmarks (conditionally, if user exists)
      if (user && questionsToUse.length > 0) {
        const questionIds = questionsToUse.map(q => q.id);
        const { data: bookmarksData, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('question_id')
          .eq('user_id', user.id)
          .in('question_id', questionIds);
        if (bookmarksError) {
          console.error('Error fetching bookmarks for single questions:', bookmarksError);
        } else if (bookmarksData) {
          setBookmarkedQuestionsDb(new Set(bookmarksData.map(b => b.question_id)));
        }
      }
    }
    fetchQuestionsAndBookmarks();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testType, selectedCategories, user?.id, initialQuestions]);

  const handleAnswerSelect = (optionIndex: number) => {
    if (corrected) return;
    setSelectedAnswer(optionIndex);
  };

  const handleCorrect = () => {
    if (!currentQuestion || displayCorrectOption === null) return;
    if (corrected) return;
    setShowExplanation(true);
    setCorrected(true);

    const newStats = { ...stats };
    if (selectedAnswer === null) {
      newStats.unanswered += 1;
    } else if (selectedAnswer === displayCorrectOption) {
      newStats.correct += 1;
    } else {
      newStats.incorrect += 1;
    }
    newStats.totalCorrected = newStats.correct + newStats.incorrect + newStats.unanswered;
    const nAlternatives = displayOptions.length || 4;
    let rawScore = 0;
    if (newStats.totalCorrected > 0) {
      const penalized = newStats.correct - (newStats.incorrect / (nAlternatives - 1));
      rawScore = (penalized * 10) / newStats.totalCorrected;
    }
    newStats.finalScore = Math.max(0, rawScore).toFixed(2);
    setStats(newStats);
  };

  const handleNextQuestion = () => {
    if (filteredQuestions.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredQuestions.length);
      shuffleAndSetDisplayQuestion(filteredQuestions[randomIndex]);
    } else {
      // If no more questions, perhaps show a message or call onExit
      shuffleAndSetDisplayQuestion(null); // Clear current question display
    }
  };

  const handleBookmark = async () => {
    if (!user || !currentQuestion) return;
    const questionId = currentQuestion.id;
    try {
      const isBookmarked = bookmarkedQuestionsDb.has(questionId);
      if (isBookmarked) {
        const { error: deleteError } = await supabase.from('bookmarks').delete().eq('user_id', user.id).eq('question_id', questionId);
        if (deleteError) throw deleteError;
        setBookmarkedQuestionsDb(prev => { const newSet = new Set(prev); newSet.delete(questionId); return newSet; });
      } else {
        const { error: insertError } = await supabase.from('bookmarks').insert({ user_id: user.id, question_id: questionId });
        if (insertError) throw insertError;
        setBookmarkedQuestionsDb(prev => new Set(prev).add(questionId));
      }
    } catch (error) {
      console.error('Error toggling bookmark in single question mode:', error);
    }
  };

  if (!currentQuestion || displayCorrectOption === null) { // Check both currentQuestion and displayCorrectOption for loading/no question state
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        <div className="card p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <p className="text-center text-text-secondary dark:text-gray-400">
            {filteredQuestions.length === 0 && (initialQuestions || testType) // Only show no questions if we attempted to load
              ? (initialQuestions && initialQuestions.length > 0 && selectedCategories.length === 0 
                ? "Selecciona categorías para empezar con tus preguntas guardadas."
                : (initialQuestions && initialQuestions.length > 0 && selectedCategories.length > 0 
                    ? "No hay preguntas guardadas para las categorías seleccionadas."
                    : "No hay preguntas disponibles para las categorías seleccionadas."))
              : "Cargando preguntas..." // Or a general loading/initial state message
            }
          </p>
          {filteredQuestions.length === 0 && (initialQuestions || testType) && (
            <button
              onClick={onExitConfirm} // Or onExit if it is more appropriate for this state
              className="mt-4 w-full btn-primary py-2 rounded-md"
            >
              Volver
            </button>
          )}
          {!(filteredQuestions.length === 0 && (initialQuestions || testType)) && currentQuestion === null && (
             <div className="flex items-center justify-center min-h-[10vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
             </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Encabezado del test - MODIFIED to add border */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-4 mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 dark:bg-primary/20 rounded-full relative">
            <CircleDot className="w-6 h-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
              {modeTitle || 'Preguntas Sueltas'}
            </h1>
            <p className="text-sm sm:text-base text-text-secondary dark:text-gray-400">
              {modeDescription || 'Practica preguntas individuales sin límite de tiempo'}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => { if (!confirmExit) { onExitConfirm(); } else { onExit(); } }}
            className="w-10 h-10 flex items-center justify-center rounded-xl text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-red-500 dark:hover:text-red-400"
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
              className={`w-10 h-10 flex items-center justify-center rounded-xl bg-primary/10 dark:bg-primary/20 transition-colors ${                bookmarkedQuestionsDb.has(currentQuestion.id)
                  ? 'text-primary' // Already has bg-primary/10 from base
                  : 'text-text-secondary dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' // Adjusted hover for non-bookmarked
              }`}
            >
              {bookmarkedQuestionsDb.has(currentQuestion.id) ? (
                <BookmarkCheck className="w-5 h-5" />
              ) : (
                <Bookmark className="w-5 h-5" /> // MODIFIED: Changed BookmarkPlus to Bookmark
              )}
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
              alt={`Imagen de la pregunta`}
              className="max-w-[300px] h-auto rounded-lg shadow-sm"
              loading="lazy"
            />
          </div>
        )}

        <div className="space-y-3 mb-6">
          {displayOptions.map((option: any, index: number) => { // Use displayOptions
            const optionText = option.text;
            let optionClasses =
              'w-full text-left p-4 rounded-lg border transition-colors ';
            if (corrected) {
              if (index === displayCorrectOption) { // Use displayCorrectOption
                optionClasses += 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-400 text-green-700 dark:text-green-400';
              } else if (index === selectedAnswer && index !== displayCorrectOption) { // Use displayCorrectOption
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
                key={option.originalIndex} // Use originalIndex from the shuffled item for a stable key if text can repeat
                onClick={() => handleAnswerSelect(index)} // index is from displayOptions
                disabled={corrected}
                className={optionClasses}
              >
                <div className="flex items-center">
                  <span className="text-primary dark:text-primary font-semibold mr-3">
                    {String.fromCharCode(65 + index)}. 
                  </span>
                  <div className="flex flex-col">
                    <span className="font-medium">{optionText}</span>
                    {option.image_url && (
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

        {showExplanation && currentQuestion.explanation && (
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
