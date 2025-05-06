import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { useQuestionsStore } from '../lib/store';
import { supabase } from '../lib/supabase';
import QuestionForm, { Question } from '../components/QuestionForm';
import ImageManager from '../components/ImageManager';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminQuestions() {
  const { questions, fetchQuestions, addQuestion, updateQuestion, deleteQuestion, addCategory } = useQuestionsStore();

  // Estado para manejar la pestaña activa: "preguntas" o "imagenes"
  const [activeTab, setActiveTab] = useState<'preguntas' | 'imagenes'>('preguntas');

  // Estados y variables de preguntas
  const [testType, setTestType] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Partial<Question>>({
    testType: '',
    category: '',
    topic: '',
    text: '',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctOption: 0,
    explanation: '',
    simulacros: []
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [newCategory, setNewCategory] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [importMessage, setImportMessage] = useState('');
  const [selectedExcelFile, setSelectedExcelFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const questionsPerPage = 10;

  // Estados para confirmaciones personalizadas
  const [confirmDeleteQuestion, setConfirmDeleteQuestion] = useState<string | null>(null);
  const [confirmDeleteAllQuestions, setConfirmDeleteAllQuestions] = useState(false);

  // Obtener preguntas
  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Obtener categorías desde Supabase
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_number', { ascending: true });
      if (error) {
        console.error('Error fetching categories:', error);
      } else {
        setDbCategories(data);
      }
    };

    fetchCategories();
  }, []);

  const sortedCategories = [...dbCategories].sort((a, b) => {
    if (a.test_type === b.test_type) {
      return a.order_number - b.order_number;
    } else {
      return a.test_type.localeCompare(b.test_type);
    }
  });

  // Función para procesar la importación del Excel
  const handleImportExcel = async () => {
    if (!selectedExcelFile) {
      setImportMessage('Debe seleccionar un archivo primero.');
      setTimeout(() => setImportMessage(''), 3000);
      return;
    }
    setIsImporting(true);
    let localQuestions = [...questions];

    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = evt.target?.result;
      if (!data) {
        setIsImporting(false);
        return;
      }
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: '' });

      for (const row of jsonData) {
        const rawTestType = String(row['test_type'] || "").trim().toLowerCase();
        let testTypeOption = "";
        if (rawTestType === "teoria" || rawTestType === "teoría") {
          testTypeOption = "Teoría";
        } else if (rawTestType === "psicotecnico" || rawTestType === "psicotécnico") {
          testTypeOption = "Psicotécnico";
        } else {
          console.warn(`Test type inválido: ${row['test_type']}. Se omitirá la fila.`);
          continue;
        }

        const newQuestionSignature = JSON.stringify({
          text: String(row['text'] || "").trim(),
          correctOption: Number(row['correct_option']) - 1,
          options: [
            String(row['option1'] || "").trim(),
            String(row['option2'] || "").trim(),
            String(row['option3'] || "").trim(),
            String(row['option4'] || "").trim()
          ]
        });

        const duplicateIndex = localQuestions.findIndex(q => {
          const existingSignature = JSON.stringify({
            text: String(q.text || "").trim(),
            correctOption: q.correctOption,
            options: q.options.map(opt =>
              typeof opt === 'string' ? String(opt).trim() : String(opt.text || "").trim()
            )
          });
          return existingSignature === newQuestionSignature;
        });

        const simulacrosString = String(row['simulacros'] || "");
        const simulacros = simulacrosString
          ? simulacrosString.split(',').map(s => s.trim()).filter(s => s !== "")
          : [];

        const newQuestionFromExcel: Question = {
          id: duplicateIndex !== -1 ? localQuestions[duplicateIndex].id : `question-${Date.now()}-${Math.random()}`,
          testType: testTypeOption,
          category: String(row['category'] || "").trim(),
          topic: String(row['topic'] || "").trim(),
          text: String(row['text'] || ""),
          options: [
            { text: String(row['option1'] || ""), image_url: row['option1_image_url'] || null },
            { text: String(row['option2'] || ""), image_url: row['option2_image_url'] || null },
            { text: String(row['option3'] || ""), image_url: row['option3_image_url'] || null },
            { text: String(row['option4'] || ""), image_url: row['option4_image_url'] || null },
          ],
          correctOption: Number(row['correct_option']) - 1 || 0,
          explanation: String(row['explanation'] || ""),
          image_url: row['image_url'] || null,
          simulacros: simulacros
        };

        if (duplicateIndex !== -1) {
          await updateQuestion(localQuestions[duplicateIndex].id, newQuestionFromExcel);
          localQuestions[duplicateIndex] = { ...localQuestions[duplicateIndex], ...newQuestionFromExcel };
        } else {
          await addQuestion(newQuestionFromExcel);
          localQuestions.push(newQuestionFromExcel);
        }
      }
      setImportMessage('Preguntas importadas correctamente.');
      document.getElementById('importExcelDialog')?.close();
      fetchQuestions();
      setSelectedExcelFile(null);
      setIsImporting(false);
      setTimeout(() => setImportMessage(''), 3000);
    };

    reader.readAsBinaryString(selectedExcelFile);
  };

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Plantilla');
    const headers = [
      'test_type',
      'category',
      'topic',
      'text',
      'image_url',
      'option1',
      'option1_image_url',
      'option2',
      'option2_image_url',
      'option3',
      'option3_image_url',
      'option4',
      'option4_image_url',
      'correct_option',
      'explanation',
      'simulacros',
      'created_at'
    ];
    worksheet.addRow(headers);
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'plantilla_preguntas.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const headers = [
      'test_type',
      'category',
      'topic',
      'text',
      'image_url',
      'option1',
      'option1_image_url',
      'option2',
      'option2_image_url',
      'option3',
      'option3_image_url',
      'option4',
      'option4_image_url',
      'correct_option',
      'explanation',
      'simulacros',
      'created_at'
    ];
    const data = (filterCategory ? questions.filter(q => q.category === filterCategory) : questions).map(q => ({
      test_type: q.testType,
      category: q.category,
      topic: q.topic,
      text: q.text,
      option1: typeof q.options[0] === 'object' ? q.options[0].text : q.options[0],
      option1_image_url: typeof q.options[0] === 'object' ? q.options[0].image_url : '',
      option2: typeof q.options[1] === 'object' ? q.options[1].text : q.options[1],
      option2_image_url: typeof q.options[1] === 'object' ? q.options[1].image_url : '',
      option3: typeof q.options[2] === 'object' ? q.options[2].text : q.options[2],
      option3_image_url: typeof q.options[2] === 'object' ? q.options[2].image_url : '',
      option4: typeof q.options[3] === 'object' ? q.options[3].text : q.options[3],
      option4_image_url: typeof q.options[3] === 'object' ? q.options[3].image_url : '',
      correct_option: q.correctOption + 1,
      explanation: q.explanation,
      image_url: q.image_url || '',
      simulacros: (q.simulacros || []).join(', '),
      created_at: q.created_at || ''
    }));
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Preguntas");
    XLSX.writeFile(workbook, "preguntas.xlsx");
  };

  const handleFileUpload = async (file: File) => {
    const filePath = `images/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('my-bucket').upload(filePath, file);
    if (error) {
      console.error('Error uploading file:', error);
      return;
    }
    const { data } = supabase.storage.from('my-bucket').getPublicUrl(filePath);
    if (data?.publicUrl) {
      setCurrentQuestion(prev => ({
        ...prev,
        image_url: data.publicUrl
      }));
      setImageFile(file);
    }
  };

  const handleOptionFileUpload = async (file: File, optionIndex: number) => {
    const filePath = `images/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from('my-bucket').upload(filePath, file);
    if (error) {
      console.error('Error uploading option file:', error);
      return;
    }
    const { data } = supabase.storage.from('my-bucket').getPublicUrl(filePath);
    if (data?.publicUrl) {
      const newOptions = currentQuestion.options!.map((opt, idx) => {
        if (idx !== optionIndex) return opt;
        return typeof opt === 'string'
          ? { text: opt, image_url: data.publicUrl }
          : { ...opt, image_url: data.publicUrl };
      });
      setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !currentQuestion.testType ||
      !currentQuestion.category ||
      !currentQuestion.text ||
      !currentQuestion.options ||
      currentQuestion.options.some(opt => typeof opt === 'string' ? opt.trim() === '' : !opt.text?.trim()) ||
      currentQuestion.correctOption === undefined ||
      !currentQuestion.explanation
    ) {
      alert('Completa todos los campos requeridos');
      return;
    }
    const newQuestionObj: Question = {
      id: currentQuestion.id as string,
      testType: currentQuestion.testType as string,
      category: currentQuestion.category as string,
      topic: currentQuestion.topic as string,
      text: currentQuestion.text as string,
      options: currentQuestion.options as any,
      correctOption: currentQuestion.correctOption as number,
      explanation: currentQuestion.explanation as string,
      image_url: currentQuestion.image_url,
      simulacros: currentQuestion.simulacros || []
    };
    if (isEditing && currentQuestion.id) {
      await updateQuestion(currentQuestion.id, newQuestionObj);
    } else {
      await addQuestion(newQuestionObj);
    }
    resetForm();
    fetchQuestions();
  };

  // Maneja el clic para eliminar una pregunta (muestra el modal de confirmación)
  const handleDeleteQuestionClick = (id: string) => {
    setConfirmDeleteQuestion(id);
  };

  // Acción al confirmar eliminación de pregunta
  const confirmDeleteQuestionAction = async () => {
    if (confirmDeleteQuestion) {
      await deleteQuestion(confirmDeleteQuestion);
      fetchQuestions();
      setConfirmDeleteQuestion(null);
    }
  };

  // Para eliminar todas las preguntas, muestra el modal de confirmación
  const handleDeleteAll = () => {
    setConfirmDeleteAllQuestions(true);
  };

  // Acción al confirmar eliminación de todas las preguntas
  const confirmDeleteAllQuestionsAction = async () => {
    for (const question of questions) {
      await deleteQuestion(question.id);
    }
    fetchQuestions();
    setConfirmDeleteAllQuestions(false);
  };

  const handleEdit = (question: Question) => {
    const simulacrosArray = typeof question.simulacros === 'string'
      ? question.simulacros.split(',').map(s => s.trim()).filter(s => s !== '')
      : question.simulacros || [];
    setCurrentQuestion({ ...question, simulacros: simulacrosArray });
    setTestType(question.testType);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setCurrentQuestion({
      testType: '',
      category: '',
      topic: '',
      text: '',
      options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
      correctOption: 0,
      explanation: '',
      simulacros: []
    });
    setTestType('');
    setIsEditing(false);
    setImageFile(null);
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategory(newCategory.trim());
    setNewCategory('');
    document.getElementById('newCategoryDialog')?.close();
  };

  const filteredQuestions = filterCategory ? questions.filter(q => q.category === filterCategory) : questions;
  const sortedQuestions = filteredQuestions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  const indexOfLastQ = currentPage * questionsPerPage;
  const indexOfFirstQ = indexOfLastQ - questionsPerPage;
  const currentQuestions = sortedQuestions.slice(indexOfFirstQ, indexOfLastQ);
  const totalPages = Math.ceil(sortedQuestions.length / questionsPerPage);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      {/* Cabecera con navegación de pestañas */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={() => setActiveTab('preguntas')}
          className={`px-4 py-2 rounded ${activeTab === 'preguntas' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Gestión de Preguntas
        </button>
        <button
          onClick={() => setActiveTab('imagenes')}
          className={`px-4 py-2 rounded ${activeTab === 'imagenes' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
        >
          Gestor de Imágenes
        </button>
      </div>

      {activeTab === 'preguntas' ? (
        <>
          <h1 className="text-2xl md:text-3xl font-bold mb-4 text-text-primary dark:text-white">
            Gestión de Preguntas
          </h1>

          <QuestionForm
            testType={testType}
            setTestType={setTestType}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
            isEditing={isEditing}
            handleSubmit={handleSubmit}
            imageFile={imageFile}
            setImageFile={setImageFile}
            handleFileUpload={handleFileUpload}
            handleOptionFileUpload={handleOptionFileUpload}
            resetForm={resetForm}
            dbCategories={dbCategories}
          />

          <div className="mt-8 mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex flex-col md:flex-row md:items-center">
              <h2 className="text-xl md:text-2xl font-semibold text-text-primary dark:text-white">
                Preguntas existentes
              </h2>
              <div className="ml-4 mt-2 md:mt-0">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="input-field w-auto text-sm px-2 py-1"
                >
                  <option value="">Todas</option>
                  {sortedCategories.map(cat => (
                    <option key={cat.id} value={cat.category}>
                      {cat.order_number} - {cat.test_type} - {cat.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="btn-secondary"
                onClick={() => document.getElementById('importExcelDialog')?.showModal()}
              >
                Importar Excel
              </button>
              <button onClick={handleDownloadExcel} className="btn-secondary">
                Descargar Preguntas
              </button>
              <button onClick={handleDeleteAll} className="btn-secondary" title="Borrar todas las preguntas">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          {importMessage && (
            <div style={{
              position: 'fixed',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              backgroundColor: 'green',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
              zIndex: 9999
            }}>
              {importMessage}
            </div>
          )}

          <div className="space-y-4">
            {currentQuestions.length === 0 ? (
              <p className="text-text-secondary dark:text-gray-400">
                No hay preguntas para la categoría seleccionada.
              </p>
            ) : (
              currentQuestions.map(question => (
                <div key={question.id} className="card p-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-primary mb-1">
                        {question.testType} - {question.category}
                      </div>
                      <p className="text-text-primary dark:text-gray-200 mb-2">
                        {question.text}
                      </p>
                      {question.image_url && (
                        <img
                          src={question.image_url}
                          alt="Imagen de la pregunta"
                          className="mb-2 max-h-32 w-full object-contain rounded-lg"
                        />
                      )}
                      <div className="mt-2">
                        <p className="font-semibold text-text-primary dark:text-white">
                          Respuestas:
                        </p>
                        <ul className="list-disc ml-6">
                          {question.options.map((opt, index) => {
                            const text = typeof opt === 'string' ? opt : opt.text;
                            const optImgUrl = typeof opt === 'string' ? undefined : opt.image_url;
                            return (
                              <li
                                key={index}
                                className={index === question.correctOption ? "text-green-600" : "text-text-secondary"}
                              >
                                {text}
                                {optImgUrl && (
                                  <img
                                    src={optImgUrl}
                                    alt="Imagen de la opción"
                                    className="inline-block ml-2 h-8 w-auto rounded"
                                  />
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                      <div className="mt-2 text-sm text-text-secondary dark:text-gray-400">
                        <strong className="text-text-primary dark:text-gray-300">
                          Explicación:
                        </strong> {question.explanation}
                      </div>
                      {question.simulacros && question.simulacros.length > 0 && (
                        <div className="mt-2">
                          <strong className="text-text-primary dark:text-gray-300">Simulacros:</strong> {question.simulacros.join(', ')}
                        </div>
                      )}
                      {question.created_at && (
                        <div className="mt-2 text-sm text-gray-500">
                          <strong>Creada:</strong> {new Date(question.created_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 mt-4 md:mt-0">
                      <button
                        onClick={() => handleEdit(question)}
                        className="p-2 text-text-secondary hover:text-primary dark:text-gray-400 dark:hover:text-primary rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestionClick(question.id)}
                        className="p-2 text-text-secondary hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center items-center space-x-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
                className={`btn-secondary ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Anterior
              </button>
              <span className="text-sm text-text-secondary dark:text-gray-400">
                Página {currentPage} de {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
                className={`btn-secondary ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Siguiente
              </button>
            </div>
          )}

          <dialog id="newCategoryDialog" className="modal p-6 rounded-xl shadow-xl bg-white dark:bg-gray-800">
            <h3 className="text-lg font-semibold mb-4 text-text-primary dark:text-white">
              Nueva categoría
            </h3>
            <div className="mb-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="input-field w-full"
                placeholder="Nombre de la categoría"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setNewCategory('');
                  document.getElementById('newCategoryDialog')?.close();
                }}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button onClick={handleAddCategory} className="btn-primary">
                Añadir
              </button>
            </div>
          </dialog>

          <dialog id="importExcelDialog" className="modal p-6 rounded-xl shadow-xl bg-white dark:bg-gray-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-text-primary dark:text-white">Importar Excel</h3>
              <button
                onClick={() => document.getElementById('importExcelDialog')?.close()}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5 text-text-secondary dark:text-gray-400" />
              </button>
            </div>
            <p className="mb-4 text-sm text-text-secondary">
              El archivo Excel debe tener las columnas especificadas en la plantilla.
              <br /><br />
              <button
                className="btn-secondary inline-block ml-2"
                onClick={handleDownloadTemplate}
              >
                Descargar la plantilla Excel
              </button>{' '}
              para usarla como modelo.
            </p>
            <input
              type="file"
              accept=".xlsx, .xls"
              className="mb-4"
              onChange={(e) => setSelectedExcelFile(e.target.files?.[0] || null)}
            />
            <button
              onClick={handleImportExcel}
              className="btn-primary w-full"
              disabled={isImporting}
            >
              {isImporting ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Importando...
                </div>
              ) : (
                "Importar"
              )}
            </button>
          </dialog>
        </>
      ) : (
        <ImageManager />
      )}

      {/* Modal de confirmación para eliminar una pregunta */}
      {confirmDeleteQuestion && (
        <ConfirmModal
          message="¿Estás seguro de eliminar la pregunta?"
          onConfirm={confirmDeleteQuestionAction}
          onCancel={() => setConfirmDeleteQuestion(null)}
          isDanger
        />
      )}

      {/* Modal de confirmación para eliminar TODAS las preguntas */}
      {confirmDeleteAllQuestions && (
        <ConfirmModal
          message="¿Estás seguro de eliminar TODAS las preguntas?"
          onConfirm={confirmDeleteAllQuestionsAction}
          onCancel={() => setConfirmDeleteAllQuestions(false)}
          isDanger
        />
      )}
    </div>
  );
}
