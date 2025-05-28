import { useEffect, useMemo, useState } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { useTestStore } from '../lib/store';
import { supabase } from '../lib/supabase';

// Define an interface for category objects if not already defined elsewhere
interface Category {
  id: string | number;
  category: string;
  test_type: string;
  topic?: string; // Optional, as it's used for 'Teoría'
  order_number?: number;
  // Add any other relevant fields for a category object
}

interface CategorySelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (selectedCategories: string[]) => void;
  availableCategoriesOverride?: Category[]; // Added prop
}

export default function CategorySelectionModal({
  isOpen,
  onClose,
  onStart,
  availableCategoriesOverride // Added
}: CategorySelectionModalProps) {
  const { testType, selectedCategories, toggleCategory, toggleTopicCategories, setSelectedCategories } = useTestStore();
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    if (availableCategoriesOverride) {
      setDbCategories(availableCategoriesOverride);
    } else {
      const fetchCategories = async () => {
        const { data, error } = await supabase
          .from('categories')
          .select('*')
          .order('order_number', { ascending: true });
        if (error) {
          console.error('Error fetching categories:', error);
        } else {
          setDbCategories(data as Category[]);
        }
      };
      fetchCategories();
    }
  }, [availableCategoriesOverride]); // Depend on availableCategoriesOverride

  const availableCategories = useMemo(() => {
    if (availableCategoriesOverride) {
      // If override is provided, filter it by testType if testType is also relevant here
      // Otherwise, just use the override as is if it's already pre-filtered or doesn't need testType filtering.
      // For the bookmarks use case, availableCategoriesOverride will be pre-filtered.
      return availableCategoriesOverride;
    }
    return dbCategories.filter(cat => cat.test_type === testType);
  }, [testType, dbCategories, availableCategoriesOverride]);

  // Para test de Teoría: agrupar por topic
  const groupedCategories = useMemo(() => {
    // Only group if not using override OR if override still needs grouping by topic
    if (testType === 'Teoría' && !availableCategoriesOverride) { // Adjusted condition
      return availableCategories.reduce((groups, cat) => {
        const topic = cat.topic || 'General'; // Fallback topic if undefined
        if (!groups[topic]) groups[topic] = [];
        groups[topic].push(cat);
        return groups;
      }, {} as Record<string, Category[]>);
    }
    // If using override, and it's for bookmarks, we might not need grouping by topic
    // or the structure might be simpler. For now, let's assume no grouping for override.
    // This part might need adjustment based on how bookmarked categories should be displayed.
    if (availableCategoriesOverride && testType === 'Teoría') {
        // If you still want grouping for overridden theory questions, implement similar logic here.
        // For now, let's treat them as a flat list like Psicotecnico for simplicity with override.
         return null; // Or handle grouping if needed for overridden theory categories
    }
    return null;
  }, [testType, availableCategories, availableCategoriesOverride]);

  useEffect(() => {
    if (isOpen && availableCategories.length > 0) {
      // When modal opens, select all *available* categories (could be from override or fetched)
      setSelectedCategories(availableCategories.map(cat => cat.category));
    }
  }, [isOpen, availableCategories, setSelectedCategories]); // availableCategories now correctly reflects override or fetched

  const allSelected = useMemo(() => {
    if (availableCategories.length === 0) return false; // Handle empty available categories
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
        className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden"
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
          {(testType === 'Teoría' && groupedCategories && !availableCategoriesOverride) ? (
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
                    {(cats as Category[]).map((cat) => { // Explicitly cast cats to Category[]
                      // const isAvailable = availableCategories.some(c => c.category === cat.category); // isAvailable check might be redundant if cats are from availableCategories
                      const isSelected = selectedCategories.includes(cat.category);
                      return (
                        <button
                          key={cat.id}
                          onClick={() => toggleCategory(cat.category)} // Removed isAvailable check here as cats are already filtered
                          // disabled={!isAvailable} // This might be re-enabled if there's a sub-selection logic
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
                                {cat.order_number || '-'} {/* Fallback for order_number */}
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
            // For Psicotécnico testType OR when availableCategoriesOverride is used (e.g., for bookmarks test)
            <div className="mb-2 rounded-md overflow-hidden">
              {availableCategories.map((cat) => {
                // const isAvailable = availableCategories.some(c => c.category === cat.category); // Redundant as we are mapping over availableCategories
                const isSelected = selectedCategories.includes(cat.category);
                return (
                  <button
                    key={cat.id}
                    onClick={() => toggleCategory(cat.category)} // Simplified, as cat is from availableCategories
                    // disabled={!isAvailable} // Redundant
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
                          {cat.order_number || '-'} {/* Fallback for order_number */}
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
