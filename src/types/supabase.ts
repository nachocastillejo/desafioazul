export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          full_name: string
          created_at: string
          last_login: string | null
          settings: Json | null
          study_streak: number | null
          total_tests_taken: number | null
          total_questions_answered: number | null
        }
        Insert: {
          id: string
          full_name: string
          created_at?: string
          last_login?: string | null
          settings?: Json | null
          study_streak?: number | null
          total_tests_taken?: number | null
          total_questions_answered?: number | null
        }
        Update: {
          id?: string
          full_name?: string
          created_at?: string
          last_login?: string | null
          settings?: Json | null
          study_streak?: number | null
          total_tests_taken?: number | null
          total_questions_answered?: number | null
        }
      }
      test_attempts: {
        Row: {
          id: string
          user_id: string
          test_type: string
          categories: string[]
          questions: Json
          answers: Json
          score: number
          correct_answers: number
          incorrect_answers: number
          unanswered: number
          time_taken: string
          completed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          test_type: string
          categories: string[]
          questions: Json
          answers: Json
          score: number
          correct_answers: number
          incorrect_answers: number
          unanswered: number
          time_taken: string
          completed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          test_type?: string
          categories?: string[]
          questions?: Json
          answers?: Json
          score?: number
          correct_answers?: number
          incorrect_answers?: number
          unanswered?: number
          time_taken?: string
          completed_at?: string
          created_at?: string
        }
      }
      question_stats: {
        Row: {
          id: string
          user_id: string
          question_id: string
          times_seen: number
          times_correct: number
          times_incorrect: number
          last_seen_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          times_seen?: number
          times_correct?: number
          times_incorrect?: number
          last_seen_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          times_seen?: number
          times_correct?: number
          times_incorrect?: number
          last_seen_at?: string | null
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          question_id: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          notes?: string | null
          created_at?: string
        }
      }
      study_progress: {
        Row: {
          id: string
          user_id: string
          category: string
          test_type: string
          questions_seen: number
          questions_correct: number
          mastery_level: number
          last_studied_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category: string
          test_type: string
          questions_seen?: number
          questions_correct?: number
          mastery_level?: number
          last_studied_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category?: string
          test_type?: string
          questions_seen?: number
          questions_correct?: number
          mastery_level?: number
          last_studied_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment: {
        Args: {
          x: number
        }
        Returns: number
      }
      increment_user_stat: {
        Args: {
          user_id: string
          stat_name: string
          increment_by?: number
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}