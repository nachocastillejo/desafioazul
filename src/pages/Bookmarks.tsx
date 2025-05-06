import React, { useEffect, useState } from 'react';
import { Bookmark, Trash2, X, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

interface BookmarkedQuestion {
  id: string;
  question_id: string;
  notes: string | null;
  created_at: string;
  question: {
    id: string;
    test_type: string;
    category: string;
    text: string;
    options: string[] | { text: string; image_url?: string }[];
    correct_option: number;
    explanation: string;
    image_url?: string;
  };
}

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState<BookmarkedQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    fetchBookmarks();
  }, [user]);

  const fetchBookmarks = async () => {
    if (!user) return;

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
            image_url
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookmarks:', error);
        return;
      }

      // Transform the data to match our interface
      const transformedBookmarks = data.map(bookmark => ({
        ...bookmark,
        question: {
          ...bookmark.question,
          options: [
            bookmark.question.option1_image_url 
              ? { text: bookmark.question.option1, image_url: bookmark.question.option1_image_url }
              : bookmark.question.option1,
            bookmark.question.option2_image_url
              ? { text: bookmark.question.option2, image_url: bookmark.question.option2_image_url }
              : bookmark.question.option2,
            bookmark.question.option3_image_url
              ? { text: bookmark.question.option3, image_url: bookmark.question.option3_image_url }
              : bookmark.question.option3,
            bookmark.question.option4_image_url
              ? { text: bookmark.question.option4, image_url: bookmark.question.option4_image_url }
              : bookmark.question.option4,
          ]
        }
      }));

      setBookmarks(transformedBookmarks);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 sm:p-6 flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex items-center space-x-3 mb-4 sm:mb-6">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl flex items-center justify-center">
          <Bookmark className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-white">
          Preguntas Guardadas
        </h1>
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

      {bookmarks.length === 0 ? (
        <div className="card p-6 text-center">
          <p className="text-text-secondary dark:text-gray-400">
            No tienes preguntas guardadas. Guarda preguntas durante los tests para repasarlas más tarde.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-xs font-medium text-primary dark:text-primary/90 mb-2 block">
                    {bookmark.question.test_type} - {bookmark.question.category}
                  </span>
                  <p className="text-text-primary dark:text-white mb-4">
                    {bookmark.question.text}
                  </p>
                </div>
                <button
                  onClick={() => setConfirmDelete(bookmark.id)}
                  className="p-2 text-text-secondary hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {bookmark.question.image_url && (
                <div className="mb-4 flex justify-center">
                  <img
                    src={bookmark.question.image_url}
                    alt="Imagen de la pregunta"
                    className="max-w-[300px] h-auto rounded-lg shadow-sm"
                  />
                </div>
              )}

              <div className="space-y-2 mb-4">
                {bookmark.question.options.map((option, index) => {
                  const isCorrect = index === bookmark.question.correct_option;
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
          ))}
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
    </div>
  );
}