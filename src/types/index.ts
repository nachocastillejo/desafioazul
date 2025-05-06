export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface Question {
  id: string;
  topic_id: string;
  question_text: string;
  image_url?: string; // URL opcional de la imagen
  image_alt?: string; // Texto alternativo para la imagen
  options: string[];
  correct_option: number;
  explanation: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
}

export interface ExamResult {
  id: string;
  user_id: string;
  score: number;
  total_questions: number;
  time_taken: number;
  created_at: string;
  questions: {
    question_id: string;
    selected_option: number;
    is_correct: boolean;
  }[];
}