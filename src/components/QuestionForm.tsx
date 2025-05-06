import React, { useState } from 'react';
import { Image as ImageIcon, X, Camera } from 'lucide-react';

interface Option {
  text: string;
  image_url?: string;
}

export interface Question {
  id: string;
  testType: string;
  category: string;
  topic: string;
  text: string;
  options: (Option | string)[];
  correctOption: number;
  explanation: string;
  image_url?: string;
  simulacros?: string[];
}

interface QuestionFormProps {
  testType: string;
  setTestType: (value: string) => void;
  currentQuestion: Partial<Question>;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<Partial<Question>>>;
  isEditing: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleFileUpload: (file: File) => Promise<void>;
  handleOptionFileUpload: (file: File, optionIndex: number) => Promise<void>;
  resetForm: () => void;
  dbCategories: any[];
}

const QuestionForm: React.FC<QuestionFormProps> = ({
  testType,
  setTestType,
  currentQuestion,
  setCurrentQuestion,
  isEditing,
  handleSubmit,
  imageFile,
  setImageFile,
  handleFileUpload,
  handleOptionFileUpload,
  resetForm,
  dbCategories,
}) => {
  // Filtra las categorías obtenidas de Supabase según el test seleccionado
  const availableCategories = dbCategories.filter(cat => cat.test_type === testType);

  // Para test de teoría: agrupar por el campo "topic"
  const groupedCategories = testType === 'Teoría'
    ? availableCategories.reduce((groups, cat) => {
        const topic = cat.topic;
        if (!groups[topic]) groups[topic] = [];
        groups[topic].push(cat);
        return groups;
      }, {} as { [key: string]: any[] })
    : null;

  // Estado local para el input de tags de simulacros
  const [tagInput, setTagInput] = useState('');

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    const simulacros = Array.isArray(currentQuestion.simulacros) ? currentQuestion.simulacros : [];
    if (!simulacros.includes(tag)) {
      setCurrentQuestion(prev => ({ ...prev, simulacros: [...simulacros, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    const simulacros = Array.isArray(currentQuestion.simulacros) ? currentQuestion.simulacros : [];
    setCurrentQuestion(prev => ({
      ...prev,
      simulacros: simulacros.filter(tag => tag !== tagToRemove)
    }));
  };

  // --- Estados y funciones para el modal de imagen ---
  // imageModalTarget: 'question' o el índice de la opción
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageModalTarget, setImageModalTarget] = useState<'question' | number | null>(null);
  // Para link manual
  const [modalImageUrl, setModalImageUrl] = useState('');
  // Para archivo subido y su preview
  const [modalFile, setModalFile] = useState<File | null>(null);
  const [modalPreview, setModalPreview] = useState('');

  const openImageModal = (target: 'question' | number) => {
    setImageModalTarget(target);
    // Reiniciamos estados del modal
    setModalImageUrl('');
    setModalFile(null);
    setModalPreview('');
    setShowImageModal(true);
  };

  const handleModalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModalFile(file);
      setModalPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setModalFile(file);
      setModalPreview(URL.createObjectURL(file));
    }
  };

  const handleModalSubmit = async () => {
    if (modalFile) {
      if (imageModalTarget === 'question') {
        await handleFileUpload(modalFile);
      } else if (typeof imageModalTarget === 'number') {
        await handleOptionFileUpload(modalFile, imageModalTarget);
      }
    } else if (modalImageUrl.trim() !== '') {
      if (imageModalTarget === 'question') {
        setCurrentQuestion(prev => ({ ...prev, image_url: modalImageUrl.trim() }));
      } else if (typeof imageModalTarget === 'number') {
        const newOptions = currentQuestion.options!.map((opt, idx) => {
          if (idx !== imageModalTarget) return opt;
          return typeof opt === 'string'
            ? { text: opt, image_url: modalImageUrl.trim() }
            : { ...opt, image_url: modalImageUrl.trim() };
        });
        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
      }
    }
    setModalImageUrl('');
    setModalFile(null);
    setModalPreview('');
    setShowImageModal(false);
  };
  // --- Fin funciones modal ---

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow-md">
        {/* Selección del tipo de test */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary dark:text-gray-200">
            Tipo de test
          </label>
          <select
            value={testType}
            onChange={(e) => {
              const selected = e.target.value;
              setTestType(selected);
              setCurrentQuestion(prev => ({
                ...prev,
                testType: selected,
                category: '',
                topic: ''
              }));
            }}
            className="input-field"
            required
          >
            <option value="">Selecciona un tipo de test</option>
            <option value="Teoría">Teoría</option>
            <option value="Psicotécnico">Psicotécnico</option>
          </select>
        </div>

        {/* Selección de categoría */}
        {testType && (
          <div>
            <label className="block text-sm font-medium mb-2 text-text-primary dark:text-gray-200">
              Categoría
            </label>
            <select
              value={currentQuestion.category || ''}
              onChange={(e) =>
                setCurrentQuestion(prev => ({ ...prev, category: e.target.value }))
              }
              className="input-field"
              required
            >
              <option value="">Selecciona una categoría</option>
              {testType === 'Teoría' && groupedCategories
                ? Object.entries(groupedCategories).map(([topic, cats]) => (
                    <optgroup key={topic} label={topic}>
                      {cats.map(cat => (
                        <option key={cat.id} value={cat.category}>
                          {cat.category}
                        </option>
                      ))}
                    </optgroup>
                  ))
                : testType === 'Psicotécnico' &&
                  availableCategories.map(cat => (
                    <option key={cat.id} value={cat.category}>
                      {cat.category}
                    </option>
                  ))
              }
            </select>
          </div>
        )}

        {/* Pregunta y selección de imagen */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary dark:text-gray-200">
            Pregunta
          </label>
          <div className="flex items-start gap-4">
            <textarea
              value={currentQuestion.text || ''}
              onChange={(e) =>
                setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))
              }
              className="input-field h-24 flex-1"
              placeholder="Escribe la pregunta aquí..."
              required
            />
            <div className="flex flex-col items-center">
              <button type="button" onClick={() => openImageModal('question')} className="btn-secondary p-2">
                <ImageIcon className="w-5 h-5" />
              </button>
              {(imageFile || currentQuestion.image_url) && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setCurrentQuestion(prev => ({ ...prev, image_url: undefined }));
                    }}
                    className="text-red-500 hover:text-red-600 mt-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-1 text-xs text-text-secondary dark:text-gray-400">
                    {imageFile ? imageFile.name : 'Imagen'}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Opciones de respuesta */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary dark:text-gray-200">
            Opciones
          </label>
          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => {
              const optionObj = typeof option === 'string' ? option : (option as { text: string; image_url?: string });
              return (
                <div key={index} className="border p-3 rounded-md">
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={currentQuestion.correctOption === index}
                      onChange={() =>
                        setCurrentQuestion(prev => ({ ...prev, correctOption: index }))
                      }
                      className="w-4 h-4 text-primary dark:border-gray-600 dark:bg-gray-700"
                    />
                    <input
                      type="text"
                      value={typeof optionObj === 'string' ? optionObj : optionObj.text}
                      onChange={(e) => {
                        const newOptions = currentQuestion.options!.map((opt, idx) => {
                          if (idx !== index) return opt;
                          return typeof opt === 'string' ? e.target.value : { ...opt, text: e.target.value };
                        });
                        setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                      }}
                      className="flex-1 input-field"
                      placeholder={`Opción ${index + 1}`}
                      required
                    />
                    <button type="button" onClick={() => openImageModal(index)} className="btn-secondary p-2">
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    {typeof optionObj !== 'string' && optionObj.image_url && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            const newOptions = currentQuestion.options!.map((opt, idx) => {
                              if (idx !== index) return opt;
                              return typeof opt === 'string' ? opt : { ...opt, image_url: undefined };
                            });
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="text-red-500 hover:text-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Explicación */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary dark:text-gray-200">
            Explicación
          </label>
          <textarea
            value={currentQuestion.explanation || ''}
            onChange={(e) =>
              setCurrentQuestion(prev => ({ ...prev, explanation: e.target.value }))
            }
            className="input-field h-24"
            placeholder="Explica por qué esta es la respuesta correcta..."
            required
          />
        </div>

        {/* Simulacros formativos (opcional) */}
        <div>
          <label className="block text-sm font-medium mb-2 text-text-primary dark:text-gray-200">
            Simulacros formativos (opcional)
          </label>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(currentQuestion.simulacros) ? currentQuestion.simulacros : []).map((tag, idx) => (
              <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} className="ml-1 text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Escribe y presiona Enter para agregar"
            className="input-field mt-2"
          />
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          {isEditing && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancelar
            </button>
          )}
          <button type="submit" className="btn-primary">
            {isEditing ? 'Actualizar' : 'Insertar Pregunta'}
          </button>
        </div>
      </form>

      {/* Modal de imagen actualizado */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
            <h3 className="text-2xl font-bold text-center mb-6">Subir fotos</h3>
            <div
              className="border-4 border-dashed border-gray-300 rounded-lg h-64 flex justify-center items-center mb-6 cursor-pointer relative"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              {modalPreview ? (
                <img src={modalPreview} alt="Preview" className="max-h-full object-contain" />
              ) : (
                <div className="flex flex-col items-center">
                  <Camera className="w-12 h-12 text-gray-500 mb-4" />
                  <span className="text-2xl text-gray-600">Subir fotos</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleModalFileSelect}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">O ingresa el link:</label>
              <input
                type="text"
                className="input-field w-full"
                value={modalImageUrl}
                onChange={(e) => setModalImageUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <div className="flex justify-end space-x-4">
              <button type="button" onClick={() => setShowImageModal(false)} className="btn-secondary">
                Cancelar
              </button>
              <button type="button" onClick={handleModalSubmit} className="btn-primary">
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuestionForm;
