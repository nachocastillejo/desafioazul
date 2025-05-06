import React, { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useTestStore } from '../lib/store';
import { supabase } from '../lib/supabase';

export default function CategorySelectionModal({ isOpen, onClose, onStart }) {
  const { testType, selectedCategories, toggleCategory, toggleTopicCategories, setSelectedCategories } = useTestStore();
  const [dbCategories, setDbCategories] = useState([]);

  // Consulta las categorías desde Supabase ordenadas por order_number
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

  // availableCategories: array de objetos filtrados por testType
  const availableCategories = useMemo(() => {
    return dbCategories.filter(cat => cat.test_type === testType);
  }, [testType, dbCategories]);

  // Para test de Teoría: agrupar por topic
  const groupedCategories = useMemo(() => {
    if (testType === 'Teoría') {
      return availableCategories.reduce((groups, cat) => {
        const topic = cat.topic;
        if (!groups[topic]) groups[topic] = [];
        groups[topic].push(cat);
        return groups;
      }, {});
    }
    return null;
  }, [testType, availableCategories]);

  // Al abrir el modal, asigna todas las categorías disponibles (por default)
  useEffect(() => {
    if (isOpen && availableCategories.length > 0) {
      setSelectedCategories(availableCategories.map(cat => cat.category));
    }
  }, [isOpen, availableCategories, setSelectedCategories]);

  // Verifica si todas las categorías están seleccionadas (compara por nombre)
  const allSelected = useMemo(() => {
    return availableCategories.every(cat => selectedCategories.includes(cat.category));
  }, [availableCategories, selectedCategories]);

  const handleSelectAll = () => {
    if (allSelected) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(availableCategories.map(cat => cat.category));
    }
  };

  const handleStart = () => {
    if (selectedCategories.length === 0) {
      alert('Por favor, selecciona al menos una categoría');
      return;
    }
    onStart(selectedCategories);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/50 dark:bg-black/70 flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-text-primary dark:text-white">Temas</h2>
              <p className="text-xs text-text-secondary dark:text-gray-400">Selecciona categorías</p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5 text-text-secondary dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="px-4 flex-1 overflow-y-auto">
          {/* Botón "TODOS LOS TEMAS" */}
          <div className="py-2">
            <button
              onClick={handleSelectAll}
              className={`w-full flex items-center justify-between py-2 px-3 rounded-md transition-colors text-sm ${
                allSelected
                  ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                  : 'bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
            >
              <span className="font-semibold">TODOS LOS TEMAS</span>
              <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${allSelected ? 'bg-current' : ''}`} />
              </div>
            </button>
          </div>

          {/* Listado de categorías según el tipo de test */}
          {testType === 'Teoría' && groupedCategories ? (
            Object.entries(groupedCategories).map(([sectionName, cats]) => {
              if (!cats.length) return null;
              const selectedCount = cats.filter(cat => selectedCategories.includes(cat.category)).length;
              const allTopicSelected = selectedCount === cats.length;

              return (
                <div key={sectionName} className="mb-2 rounded-md overflow-hidden">
                  <button
                    onClick={() => {
                      toggleTopicCategories(cats.map(cat => cat.category));
                    }}
                    className={`w-full flex items-center justify-between py-2 px-3 transition-colors text-sm ${
                      allTopicSelected
                        ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                        : 'bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-semibold">{sectionName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-50 dark:bg-gray-700 text-text-secondary dark:text-white">
                        {selectedCount}/{cats.length}
                      </span>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${allTopicSelected ? 'bg-current' : ''}`} />
                    </div>
                  </button>
                  <div className="mt-1 space-y-1">
                    {cats.map((cat) => {
                      const isAvailable = availableCategories.some(c => c.category === cat.category);
                      const isSelected = selectedCategories.includes(cat.category);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => isAvailable && toggleCategory(cat.category)}
                          disabled={!isAvailable}
                          className="w-full flex items-center justify-between py-1 px-3 transition-colors text-xs text-text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="flex-1 mr-2">
                            <div className="grid grid-cols-[auto,1fr] gap-2 items-start">
                              <span
                                className={`w-4 h-4 flex items-center justify-center rounded text-xs font-medium ${
                                  isSelected
                                    ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                    : 'bg-gray-50 dark:bg-gray-700'
                                }`}
                              >
                                {cat.order_number}
                              </span>
                              <span className="text-left">{cat.category}</span>
                            </div>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                            <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : ''}`} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // Para test Psicotécnico
            <div className="mb-2 rounded-md overflow-hidden">
              {availableCategories.map((cat) => {
                const isAvailable = availableCategories.some(c => c.category === cat.category);
                const isSelected = selectedCategories.includes(cat.category);
                return (
                  <button
                    key={cat.id}
                    onClick={() => isAvailable && toggleCategory(cat.category)}
                    disabled={!isAvailable}
                    className="w-full flex items-center justify-between py-1 px-3 transition-colors text-xs text-text-secondary dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex-1 mr-2">
                      <div className="grid grid-cols-[auto,1fr] gap-2 items-start">
                        <span
                          className={`w-4 h-4 flex items-center justify-center rounded text-xs font-medium ${
                            isSelected
                              ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                              : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          {cat.order_number}
                        </span>
                        <span className="text-left">{cat.category}</span>
                      </div>
                    </div>
                    <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                      <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-current' : ''}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 sticky bottom-0 bg-white dark:bg-gray-800">
          <button onClick={handleStart} className="w-full btn-primary px-6 py-2.5 rounded-xl text-sm">
            Empezar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
