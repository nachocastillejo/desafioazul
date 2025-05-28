// store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

//
// Tipos y Store de test
//
export type TestType = 'Teoría' | 'Psicotécnico';

export interface Question {
  id: string;
  category: string;
  topic: string;
  text: string;
  options: (string | { text: string; image_url?: string; /* image_alt removed */ })[];
  correctOption: number;
  explanation: string;
  image_url?: string;
  testType: TestType;
  simulacros?: string[];
  created_at?: string;
  shuffledOptions?: (string | { text: string; image_url?: string; originalIndex: number })[];
  shuffledCorrectOption?: number;
}

/**
 * Store de test (uso durante simulacros, etc.)
 */
interface TestState {
  testType: TestType;
  questions: Question[];
  selectedCategories: string[];
  numberOfQuestions: number;
  currentQuestionIndex: number;
  answers: Record<string, number>;
  timeRemaining: number;
  isTestStarted: boolean;
  setTestType: (testType: TestType) => Promise<void>;
  setSelectedCategories: (categories: string[]) => void;
  setNumberOfQuestions: (number: number) => void;
  fetchTestCategories: () => Promise<void>;
  startTest: () => Promise<void>;
  answerQuestion: (questionId: string, optionIndex: number) => void;
  finishTest: () => void;
  toggleCategory: (category: string) => void;
  toggleTopicCategories: (topicCategories: string[]) => void;
}

export const useTestStore = create<TestState>((set, get) => ({
  testType: 'Teoría',
  questions: [],
  selectedCategories: [],
  numberOfQuestions: 3,
  currentQuestionIndex: 0,
  answers: {},
  timeRemaining: 60,
  isTestStarted: false,

  setTestType: async (testType) => {
    set({
      testType,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 60,
      isTestStarted: false,
      selectedCategories: [] // Resetear categorías seleccionadas
    });
    await get().fetchTestCategories();
  },

  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setNumberOfQuestions: (number) => set({ numberOfQuestions: number }),

  fetchTestCategories: async () => {
    const { testType } = get();
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('test_type', testType)
      .order('order_number', { ascending: true });
    if (error) {
      console.error('Error fetching test categories:', error);
      return;
    }
    if (data) {
      const categories = data.map((cat: any) => cat.category);
      set({ selectedCategories: categories });
    }
  },

  startTest: async () => {
    const state = get();
    if (state.selectedCategories.length === 0) return;
    const { data, error } = await supabase
      .from('questions')
      .select('*') // Select all columns to ensure image_alt fields are present
      .eq('test_type', state.testType)
      .in('category', state.selectedCategories)
      .order('created_at', { ascending: false });
    if (error || !data || data.length === 0) {
      console.error('No se encontraron preguntas o hubo un error:', error);
      return;
    }
    const transformed: Question[] = data.map((q: any) => {
      const originalOptions = [
        q.option1_image_url ? { text: q.option1, image_url: q.option1_image_url } : q.option1,
        q.option2_image_url ? { text: q.option2, image_url: q.option2_image_url } : q.option2,
        q.option3_image_url ? { text: q.option3, image_url: q.option3_image_url } : q.option3,
        q.option4_image_url ? { text: q.option4, image_url: q.option4_image_url } : q.option4,
      ];

      // Create a more robust shuffling for options
      const optionsWithOriginalIndex = originalOptions.map((option, index) => ({
        option,
        originalIndex: index
      }));
      const shuffledOptionsWithOriginalIndex = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);

      const finalShuffledOptions = shuffledOptionsWithOriginalIndex.map(item => {
        if (typeof item.option === 'object' && item.option !== null) {
          return { ...item.option, originalIndex: item.originalIndex };
        }
        // If it's a string, we convert it to the object structure for consistency in shuffledOptions
        return { text: item.option as string, originalIndex: item.originalIndex };
      });
      
      const newCorrectOptionIndex = shuffledOptionsWithOriginalIndex.findIndex(
        item => item.originalIndex === q.correct_option
      );

      return {
        id: q.id.toString(),
        testType: q.test_type,
        category: q.category,
        topic: q.topic,
        text: q.text,
        options: originalOptions,
        correctOption: q.correct_option,
        explanation: q.explanation,
        image_url: q.image_url,
        simulacros: q.simulacros,
        created_at: q.created_at,
        shuffledOptions: finalShuffledOptions,
        shuffledCorrectOption: newCorrectOptionIndex,
      };
    });
    const shuffledQuestions = transformed.sort(() => Math.random() - 0.5);
    const numQuestions = Math.min(state.numberOfQuestions, shuffledQuestions.length);
    const selected = shuffledQuestions.slice(0, numQuestions);
    set({
      questions: selected,
      isTestStarted: true,
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 60
    });
  },

  answerQuestion: (questionId, optionIndex) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: optionIndex }
    })),

  finishTest: () => {
    set({
      isTestStarted: false,
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      timeRemaining: 60,
      selectedCategories: []
    });
  },

  toggleCategory: (category: string) =>
    set((state) => ({
      selectedCategories: state.selectedCategories.includes(category)
        ? state.selectedCategories.filter((c) => c !== category)
        : [...state.selectedCategories, category]
    })),

  toggleTopicCategories: (topicCategories: string[]) =>
    set((state) => {
      const isTopicSelected = topicCategories.every(cat => state.selectedCategories.includes(cat));
      return {
        selectedCategories: isTopicSelected
          ? state.selectedCategories.filter(cat => !topicCategories.includes(cat))
          : Array.from(new Set([...state.selectedCategories, ...topicCategories]))
      };
    })
}));

//
// Store de gestión de preguntas (CRUD) – para administración
//
interface QuestionsState {
  questions: Question[];
  fetchQuestions: () => Promise<void>;
  addQuestion: (question: Omit<Question, 'id'>) => Promise<void>;
  updateQuestion: (id: string, question: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  categories: string[];
  fetchCategories: () => Promise<void>;
  addCategory: (category: string) => void;
}

export const useQuestionsStore = create<QuestionsState>((set) => ({
  questions: [],
  categories: [],
  fetchQuestions: async () => {
    const { data, error } = await supabase
      .from('questions')
      .select('*') // Select all columns
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error al obtener preguntas:', error);
    } else if (data) {
      const transformed: Question[] = data.map((q: any) => {
        const originalOptions = [
          q.option1_image_url ? { text: q.option1, image_url: q.option1_image_url } : q.option1,
          q.option2_image_url ? { text: q.option2, image_url: q.option2_image_url } : q.option2,
          q.option3_image_url ? { text: q.option3, image_url: q.option3_image_url } : q.option3,
          q.option4_image_url ? { text: q.option4, image_url: q.option4_image_url } : q.option4,
        ];

        const optionsWithOriginalIndex = originalOptions.map((option, index) => ({
          option,
          originalIndex: index
        }));
        const shuffledOptionsWithOriginalIndex = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);

        const finalShuffledOptions = shuffledOptionsWithOriginalIndex.map(item => {
          if (typeof item.option === 'object' && item.option !== null) {
            return { ...item.option, originalIndex: item.originalIndex };
          }
          return { text: item.option as string, originalIndex: item.originalIndex };
        });
        
        const newCorrectOptionIndex = shuffledOptionsWithOriginalIndex.findIndex(
          item => item.originalIndex === q.correct_option
        );

        return {
          id: q.id.toString(),
          testType: q.test_type,
          category: q.category,
          topic: q.topic,
          text: q.text,
          options: originalOptions,
          correctOption: q.correct_option,
          explanation: q.explanation,
          image_url: q.image_url,
          simulacros: q.simulacros,
          created_at: q.created_at,
          shuffledOptions: finalShuffledOptions,
          shuffledCorrectOption: newCorrectOptionIndex,
        };
      });
      set({ questions: transformed });
    }
  },
  addQuestion: async (question) => {
    const generatedId = `question-${Date.now()}`;
    // Helper to safely access option properties
    const getOptionProp = (option: string | { text: string; image_url?: string; /* image_alt removed */ }, prop: 'text' | 'image_url' /* | 'image_alt' removed */) => {
      if (typeof option === 'object') {
        return option[prop] || (prop === 'text' ? '' : null);
      }
      return prop === 'text' ? option : null;
    };

    const newQuestion = {
      id: generatedId,
      category: question.category,
      topic: question.topic,
      text: question.text,
      option1: getOptionProp(question.options[0], 'text'),
      option1_image_url: getOptionProp(question.options[0], 'image_url'),
      option2: getOptionProp(question.options[1], 'text'),
      option2_image_url: getOptionProp(question.options[1], 'image_url'),
      option3: getOptionProp(question.options[2], 'text'),
      option3_image_url: getOptionProp(question.options[2], 'image_url'),
      option4: getOptionProp(question.options[3], 'text'),
      option4_image_url: getOptionProp(question.options[3], 'image_url'),
      correct_option: question.correctOption,
      explanation: question.explanation,
      test_type: question.testType,
      image_url: question.image_url || null,
      simulacros: question.simulacros || []
    };
    const { data, error } = await supabase
      .from('questions')
      .insert(newQuestion)
      .select() // Ensure select is called to get the inserted row back
      .single();

    if (error) {
      console.error('Error al agregar la pregunta:', error);
    } else if (data) {
      const dbData = data as any; // Cast to any to bypass strict type checking for the returned data
      
      const originalOptions = [
        dbData.option1_image_url ? { text: dbData.option1, image_url: dbData.option1_image_url } : dbData.option1,
        dbData.option2_image_url ? { text: dbData.option2, image_url: dbData.option2_image_url } : dbData.option2,
        dbData.option3_image_url ? { text: dbData.option3, image_url: dbData.option3_image_url } : dbData.option3,
        dbData.option4_image_url ? { text: dbData.option4, image_url: dbData.option4_image_url } : dbData.option4,
      ];

      const optionsWithOriginalIndex = originalOptions.map((option, index) => ({
        option,
        originalIndex: index
      }));
      const shuffledOptionsWithOriginalIndex = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);
      
      const finalShuffledOptions = shuffledOptionsWithOriginalIndex.map(item => {
        if (typeof item.option === 'object' && item.option !== null) {
          return { ...item.option, originalIndex: item.originalIndex };
        }
        return { text: item.option as string, originalIndex: item.originalIndex };
      });

      const newCorrectOptionIndex = shuffledOptionsWithOriginalIndex.findIndex(
        item => item.originalIndex === dbData.correct_option
      );
      
      const newQ: Question = {
        id: dbData.id.toString(),
        testType: dbData.test_type,
        category: dbData.category,
        topic: dbData.topic,
        text: dbData.text,
        options: originalOptions,
        correctOption: dbData.correct_option,
        explanation: dbData.explanation,
        image_url: dbData.image_url,
        simulacros: dbData.simulacros,
        created_at: dbData.created_at,
        shuffledOptions: finalShuffledOptions,
        shuffledCorrectOption: newCorrectOptionIndex,
      };
      set((state) => ({
        questions: [newQ, ...state.questions]
      }));
    }
  },
  updateQuestion: async (id, question) => {
    const updateData: any = {};
    if (question.category) updateData.category = question.category;
    if (question.topic) updateData.topic = question.topic;
    if (question.text) updateData.text = question.text;
    if (question.options) {
      const opt0 = question.options[0];
      const opt1 = question.options[1];
      const opt2 = question.options[2];
      const opt3 = question.options[3];

      if (typeof opt0 === 'object') {
        updateData.option1 = opt0.text;
        updateData.option1_image_url = 'image_url' in opt0 ? (opt0.image_url ?? null) : null;
      } else {
        updateData.option1 = opt0;
        updateData.option1_image_url = null;
      }
      if (typeof opt1 === 'object') {
        updateData.option2 = opt1.text;
        updateData.option2_image_url = 'image_url' in opt1 ? (opt1.image_url ?? null) : null;
      } else {
        updateData.option2 = opt1;
        updateData.option2_image_url = null;
      }
      if (typeof opt2 === 'object') {
        updateData.option3 = opt2.text;
        updateData.option3_image_url = 'image_url' in opt2 ? (opt2.image_url ?? null) : null;
      } else {
        updateData.option3 = opt2;
        updateData.option3_image_url = null;
      }
      if (typeof opt3 === 'object') {
        updateData.option4 = opt3.text;
        updateData.option4_image_url = 'image_url' in opt3 ? (opt3.image_url ?? null) : null;
      } else {
        updateData.option4 = opt3;
        updateData.option4_image_url = null;
      }
    }
    if (question.correctOption !== undefined) updateData.correct_option = question.correctOption;
    if (question.explanation) updateData.explanation = question.explanation;
    if (question.testType) updateData.test_type = question.testType;
    if ('image_url' in question) updateData.image_url = question.image_url ?? null;
    if (question.simulacros !== undefined) updateData.simulacros = question.simulacros;

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select(); // Ensure select is called to get the updated row back for consistency

    if (error) {
      console.error('Error al actualizar la pregunta:', error);
    } else if (data) {
      // Assuming data[0] contains the updated question, or adjust if .single() was used
      set((state) => ({
        questions: state.questions.map(q =>
          q.id === id ? { 
            ...q, 
            ...question, // Apply local optimistic update
            // Optionally, overwrite with specific fields from updatedQuestionFromDb if they differ
            // For example, if a server-side trigger modifies created_at or other fields:
            // created_at: updatedQuestionFromDb.created_at
            // Re-shuffle options if they were part of the update
            ...(question.options && (() => {
              const originalOptions = question.options!; // Already checked
              const optionsWithOriginalIndex = originalOptions.map((option, index) => ({
                option,
                originalIndex: index
              }));
              const shuffledOptionsWithOriginalIndex = [...optionsWithOriginalIndex].sort(() => Math.random() - 0.5);
              const finalShuffledOptions = shuffledOptionsWithOriginalIndex.map(item => {
                if (typeof item.option === 'object' && item.option !== null) {
                  return { ...item.option, originalIndex: item.originalIndex };
                }
                return { text: item.option as string, originalIndex: item.originalIndex };
              });
              const newCorrectOptionIndex = shuffledOptionsWithOriginalIndex.findIndex(
                item => item.originalIndex === (question.correctOption !== undefined ? question.correctOption : q.correctOption)
              );
              return { 
                shuffledOptions: finalShuffledOptions, 
                shuffledCorrectOption: newCorrectOptionIndex,
                options: originalOptions, // Ensure original options are also updated
                correctOption: question.correctOption !== undefined ? question.correctOption : q.correctOption // Ensure original correctOption is also updated
              };
            })())
           } : q
        )
      }));
    }
  },
  deleteQuestion: async (id) => {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id);
    if (error) {
      console.error('Error al eliminar la pregunta:', error);
    } else {
      set((state) => ({
        questions: state.questions.filter(q => q.id !== id)
      }));
    }
  },
  addCategory: (category) => {
    set((state) => ({
      categories: [...state.categories, category]
    }));
  },
  fetchCategories: async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('test_type', 'Teoría')
      .order('order_number', { ascending: true });
    if (error) {
      console.error('Error fetching categories:', error);
    } else if (data) {
      const cats = data.map((cat: any) => cat.category);
      set({ categories: cats });
    }
  }
}));

//
// Store para gestión de tema visual (modo oscuro)
//
interface ThemeState {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

let useThemeStore;
if (typeof window !== 'undefined') {
  useThemeStore = create<ThemeState>()(
    persist(
      (set) => ({
        isDarkMode: false,
        toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode }))
      }),
      { name: 'theme-storage' }
    )
  );
} else {
  useThemeStore = create<ThemeState>()((set) => ({
    isDarkMode: false,
    toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode }))
  }));
}

export { useThemeStore };

//
// Función para calcular la puntuación del test
//
export const calculateTestScore = (
  correct: number,
  incorrect: number,
  total: number,
  alternatives: number
) => {
  const penalization = incorrect / (alternatives - 1);
  const result = ((correct - penalization) * 10) / total;
  return Math.max(0, Number(result.toFixed(2)));
};

if (typeof window !== 'undefined') {
  // Se pueden exponer funciones o variables globalmente si es necesario.
}
