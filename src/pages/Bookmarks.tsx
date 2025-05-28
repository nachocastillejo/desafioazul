import { useEffect, useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Bookmark, Trash2, ChevronDown, ChevronRight, AlertTriangle, Brain } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import SingleQuestionMode from '../components/SingleQuestionMode';
import CategorySelectionModal from '../components/CategorySelectionModal';
import { Question, TestType } from '../lib/store';

// This interface should align with the fields selected from the 'questions' table
// and the current definition of 'Question' in store.ts (which excludes image_alt)
interface BookmarkedQuestion {
  id: string;
  question_id: string;
  notes: string | null;
  created_at: string;
  question: Question;
}

// Define a minimal Category type for use in this component
interface SimpleCategory {
  id: string | number;
  category: string;
  test_type: string;
}

export default function Bookmarks() {
  const { user } = useAuth();
  const location = useLocation();
  // Get the navigation signal from location.state
  const navigationSignal = (location.state as { navigatedToBookmarksSignal?: number } | null)?.navigatedToBookmarksSignal;

  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [expandedBookmarkId, setExpandedBookmarkId] = useState<string | null>(null);

  // State for Bookmark Test Mode
  const [showBookmarkTestCategoryModal, setShowBookmarkTestCategoryModal] = useState(false);
  const [bookmarkTestSelectedCategories, setBookmarkTestSelectedCategories] = useState<string[]>([]);
  const [isBookmarkTestModeActive, setIsBookmarkTestModeActive] = useState(false);
  const [bookmarkTestQuestions, setBookmarkTestQuestions] = useState<Question[]>([]);
  const [bookmarkTestStats, setBookmarkTestStats] = useState({
    correct: 0,
    incorrect: 0,
    unanswered: 0,
    totalCorrected: 0,
    finalScore: '0.00'
  });

  // ADDED: useEffect to handle navigation back to /bookmarks while test mode is active
  useEffect(() => {
    if (location.pathname === '/bookmarks' && isBookmarkTestModeActive) {
      handleExitBookmarkTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [location.pathname]); // CORRECTED Dependency: Only location.pathname

  // const fetchBookmarks = async () => { // Ensure this is defined or correctly referenced
  //   if (!user) return;
  //   fetchBookmarks();
  // };

  // Ensure fetchBookmarks is defined in the scope if it was commented out above
  const fetchBookmarks = async () => {
    if (!user) return;
    setLoading(true); // Added to manage loading state during re-fetch
    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select(`
          *,
          question:question_id (
            id,
            test_type,
            category,
            text,
            option1,
            option2,
            option3,
            option4,
            option1_image_url,
            option2_image_url,
            option3_image_url,
            option4_image_url,
            correct_option,
            explanation,
            image_url,
            topic,
            simulacros,
            created_at 
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error);
        setLoading(false);
        return;
      }

      const bookmarksData = data as any[];
      const transformedBookmarks = bookmarksData.map(bookmark => {
        const questionData = bookmark.question;
        const originalOptions = [
          questionData.option1_image_url ? { text: questionData.option1, image_url: questionData.option1_image_url } : questionData.option1,
          questionData.option2_image_url ? { text: questionData.option2, image_url: questionData.option2_image_url } : questionData.option2,
          questionData.option3_image_url ? { text: questionData.option3, image_url: questionData.option3_image_url } : questionData.option3,
          questionData.option4_image_url ? { text: questionData.option4, image_url: questionData.option4_image_url } : questionData.option4,
        ];
        const optionsWithOriginalIndex = originalOptions.map((option, index) => ({ option, originalIndex: index }));
        const shuffledOptionsWithOriginalIndex = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);
        const finalShuffledOptions = shuffledOptionsWithOriginalIndex.map(item => {
          if (typeof item.option === 'object' && item.option !== null) {
            return { ...item.option, originalIndex: item.originalIndex };
          }
          return { text: item.option as string, originalIndex: item.originalIndex };
        });
        const newCorrectOptionIndex = shuffledOptionsWithOriginalIndex.findIndex(item => item.originalIndex === questionData.correct_option);
        const mappedQuestion: Question = {
          id: questionData.id.toString(),
          testType: questionData.test_type as TestType,
          category: questionData.category,
          text: questionData.text,
          options: originalOptions,
          correctOption: questionData.correct_option,
          explanation: questionData.explanation,
          image_url: questionData.image_url,
          topic: questionData.topic || null,
          simulacros: questionData.simulacros || [],
          created_at: questionData.created_at,
          shuffledOptions: finalShuffledOptions,
          shuffledCorrectOption: newCorrectOptionIndex,
        };
        return { ...bookmark, question: mappedQuestion };
      });
      setBookmarks(transformedBookmarks);
    } catch (error) {
      console.error('Error in fetchBookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Existing useEffect for initial fetchBookmarks
  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setBookmarks(prev => prev.filter(b => b.id !== id));
      setConfirmDelete(null);
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    }
  };

  const handleDeleteAll = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setBookmarks([]); // Clear local state
      setShowDeleteAllConfirm(false); // Close modal
    } catch (error) {
      console.error('Error deleting all bookmarks:', error);
      // Optionally, show an error message to the user
    }
  };

  const handleUpdateNotes = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookmarks')
        .update({ notes: noteText })
        .eq('id', id);

      if (error) throw error;

      setBookmarks(prev => prev.map(b => 
        b.id === id ? { ...b, notes: noteText } : b
      ));
      setEditingNotes(null);
      setNoteText('');
    } catch (error) {
      console.error('Error updating notes:', error);
    }
  };

  const toggleExpandBookmark = (id: string) => {
    setExpandedBookmarkId(prevId => (prevId === id ? null : id));
  };

  // --- Bookmark Test Mode Functions ---
  const uniqueCategoriesFromBookmarks = useMemo((): SimpleCategory[] => {
    if (bookmarks.length === 0) return [];
    const categoriesMap = new Map<string, SimpleCategory>();
    bookmarks.forEach(bm => {
      if (!categoriesMap.has(bm.question.category)) {
        categoriesMap.set(bm.question.category, {
          id: bm.question.category,
          category: bm.question.category,
          test_type: bm.question.testType
        });
      }
    });
    return Array.from(categoriesMap.values());
  }, [bookmarks]);

  const handleStartBookmarkTest = () => {
    if (bookmarks.length > 0) {
      setBookmarkTestStats({
        correct: 0,
        incorrect: 0,
        unanswered: 0,
        totalCorrected: 0,
        finalScore: '0.00'
      });
      setShowBookmarkTestCategoryModal(true);
    }
  };

  const handleBookmarkTestCategorySelection = (selectedCats: string[]) => {
    setBookmarkTestSelectedCategories(selectedCats);
    const questionsForTest = bookmarks
      .filter(bm => selectedCats.includes(bm.question.category))
      .map(bm => bm.question);
    
    setBookmarkTestQuestions(questionsForTest);
    setIsBookmarkTestModeActive(true);
    setShowBookmarkTestCategoryModal(false);
  };

  const handleExitBookmarkTest = () => {
    setIsBookmarkTestModeActive(false);
    setBookmarkTestSelectedCategories([]);
    setBookmarkTestQuestions([]);
    fetchBookmarks();
  };
  // --- End Bookmark Test Mode Functions ---

  useEffect(() => {
    fetchBookmarks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // useEffect to handle explicit navigation to /bookmarks while test mode is active
  useEffect(() => {
    if (navigationSignal && isBookmarkTestModeActive) {
      // A navigation with the signal occurred, and test mode was active.
      // This indicates user explicitly clicked "Guardados" in sidebar.
      handleExitBookmarkTest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [navigationSignal]); // Depend on the navigationSignal

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If Bookmark Test Mode is active, render SingleQuestionMode
  if (isBookmarkTestModeActive) {
    return (
      <SingleQuestionMode
        testType={null}
        selectedCategories={bookmarkTestSelectedCategories}
        initialQuestions={bookmarkTestQuestions}
        stats={bookmarkTestStats}
        setStats={setBookmarkTestStats}
        onExit={handleExitBookmarkTest}
        showExitConfirmation={false}
        setShowExitConfirmation={() => {}}
        onExitConfirm={handleExitBookmarkTest}
        confirmExit={false}
        modeTitle="Test con Guardadas"
        modeDescription="Practica con tus preguntas guardadas."
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
            <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
            Preguntas Guardadas
          </h1>
        </div>
      </div>

      {/* Descriptive Box Card */}
      <div className="w-full bg-white dark:bg-gray-800 p-5 rounded-xl shadow-md mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-text-primary dark:text-white mb-2">
          Guarda tus preguntas y repásalas cuando quieras
        </h2>
        <ul className="list-disc list-outside ml-5 space-y-1 text-sm sm:text-base text-text-secondary dark:text-gray-400">
          <li>
            En este apartado podrás encontrar todas las preguntas que hayas decidido guardar durante tu práctica. Ya sea porque te resultaron difíciles, las consideraste interesantes o quieres revisarlas más tarde, aquí tendrás un espacio personalizado para acceder a ellas cuando lo necesites. 
            ¡Una excelente manera de repasar y afianzar aquellas áreas que requieren más atención!
          </li>
        </ul>
      </div>

      {/* Action Buttons - Moved here */} 
      {bookmarks.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-end items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-4"> {/* Adjusted for responsiveness and spacing */}
          <button
            onClick={handleStartBookmarkTest}
            className="btn-primary-outline w-full sm:w-auto flex items-center justify-center text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-md"
            title="Practicar con tus preguntas guardadas"
          >
            <Brain className="w-4 h-4 mr-2" />
            Practica {/* Changed label */}
          </button>
          <button 
            onClick={() => setShowDeleteAllConfirm(true)}
            className="btn-danger-outline w-full sm:w-auto flex items-center justify-center text-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-md"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Borrar Todo
          </button>
        </div>
      )}

      {bookmarks.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-text-secondary dark:text-gray-400">
            No tienes preguntas guardadas. Guarda preguntas durante los tests para repasarlas más tarde.
          </p>
        </div>
      ) : (
        <div className="card p-0 space-y-0 divide-y divide-gray-200 dark:divide-gray-700 shadow-lg rounded-xl overflow-hidden">
          {bookmarks.map((bookmark) => {
            const isExpanded = expandedBookmarkId === bookmark.id;
            return (
              <div key={bookmark.id} className="">
                <div 
                  className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() => toggleExpandBookmark(bookmark.id)}
                >
                  <div className="flex-1 pr-4">
                    <span className="text-xs font-medium text-primary dark:text-primary/90 mb-1 block">
                      {bookmark.question.testType} - {bookmark.question.category}
                    </span>
                    <p className="text-text-primary dark:text-white line-clamp-2">
                      {bookmark.question.text}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={(e) => { 
                        e.stopPropagation();
                        setConfirmDelete(bookmark.id); 
                      }}
                      className="p-2 text-text-secondary hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 mr-2"
                      aria-label="Eliminar pregunta guardada"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    {isExpanded ? <ChevronDown className="w-5 h-5 text-text-secondary dark:text-gray-400" /> : <ChevronRight className="w-5 h-5 text-text-secondary dark:text-gray-400" />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    {bookmark.question.image_url && (
                      <div className="mb-4 flex justify-center">
                        <img
                          src={bookmark.question.image_url}
                          alt={`Imagen de la pregunta ${bookmark.question.text.substring(0,30)}...`}
                          className="max-w-[300px] h-auto rounded-lg shadow-sm"
                        />
                      </div>
                    )}

                    <div className="space-y-2 mb-4">
                      {bookmark.question.shuffledOptions?.map((option, index) => {
                        const isCorrect = index === bookmark.question.shuffledCorrectOption;
                        const optionText = typeof option === 'string' ? option : option.text;
                        const optionImage = typeof option === 'object' ? option.image_url : undefined;

                        return (
                          <div
                            key={index}
                            className={`p-3 rounded-lg border ${
                              isCorrect
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <div className="flex items-center">
                              <span className={`font-medium mr-2 ${
                                isCorrect ? 'text-green-700 dark:text-green-400' : 'text-text-primary dark:text-white'
                              }`}>
                                {String.fromCharCode(65 + index)}.
                              </span>
                              <div className="flex flex-col">
                                <span className={isCorrect ? 'text-green-700 dark:text-green-400' : 'text-text-primary dark:text-white'}>
                                  {optionText}
                                </span>
                                {optionImage && (
                                  <img
                                    src={optionImage}
                                    alt={`Opción ${String.fromCharCode(65 + index)}`}
                                    className="mt-2 max-w-[150px] h-auto rounded"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <h3 className="font-medium text-text-primary dark:text-white mb-2">Explicación</h3>
                      <p className="text-text-secondary dark:text-gray-300">{bookmark.question.explanation}</p>
                    </div>

                    {editingNotes === bookmark.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={noteText}
                          onChange={(e) => setNoteText(e.target.value)}
                          placeholder="Escribe tus notas aquí..."
                          className="w-full p-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-text-primary dark:text-white"
                          rows={3}
                        />
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingNotes(null);
                              setNoteText('');
                            }}
                            className="px-3 py-1 text-text-secondary dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            Cancelar
                          </button>
                          <button
                            onClick={() => handleUpdateNotes(bookmark.id)}
                            className="px-3 py-1 bg-primary text-white rounded hover:bg-primary-hover"
                          >
                            Guardar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="cursor-pointer group"
                        onClick={() => {
                          setEditingNotes(bookmark.id);
                          setNoteText(bookmark.notes || '');
                        }}
                      >
                        {bookmark.notes ? (
                          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-medium text-text-primary dark:text-white">Notas</h3>
                              <span className="text-xs text-text-secondary dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                Click para editar
                              </span>
                            </div>
                            <p className="text-text-secondary dark:text-gray-300">{bookmark.notes}</p>
                          </div>
                        ) : (
                          <div className="text-center py-2 text-text-secondary dark:text-gray-400 hover:text-primary dark:hover:text-primary/90">
                            + Añadir notas
                          </div>
                        )}
                      </div>
                    )}

                    <div className="text-xs text-text-secondary dark:text-gray-400 mt-4">
                      Guardado el {new Date(bookmark.created_at).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          message="¿Estás seguro de eliminar esta pregunta guardada?"
          onConfirm={() => handleDelete(confirmDelete)}
          onCancel={() => setConfirmDelete(null)}
          isDanger
        />
      )}

      {showDeleteAllConfirm && (
        <ConfirmModal
          title="Confirmar Eliminación Total"
          message="¿Estás absolutamente seguro de que quieres eliminar TODAS tus preguntas guardadas? Esta acción no se puede deshacer."
          onConfirm={handleDeleteAll}
          onCancel={() => setShowDeleteAllConfirm(false)}
          confirmText="Sí, Borrar Todo"
          cancelText="Cancelar"
          isDanger
          icon={<AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />}
        />
      )}

      {/* Category Selection Modal for Bookmark Test */}
      {showBookmarkTestCategoryModal && uniqueCategoriesFromBookmarks.length > 0 && (
        <CategorySelectionModal
          isOpen={showBookmarkTestCategoryModal}
          onClose={() => setShowBookmarkTestCategoryModal(false)}
          onStart={handleBookmarkTestCategorySelection}
          availableCategoriesOverride={uniqueCategoriesFromBookmarks}
        />
      )}
    </div>
  );
}