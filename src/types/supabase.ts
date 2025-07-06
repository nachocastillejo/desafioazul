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
          subscription_status: string
          subscription_id: string | null
          customer_id: string | null
          subscription_end_date: string | null
          profile_image_url: string | null
          free_tests_taken: number
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
          subscription_status?: string
          subscription_id?: string | null
          customer_id?: string | null
          subscription_end_date?: string | null
          profile_image_url?: string | null
          free_tests_taken?: number
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
          subscription_status?: string
          subscription_id?: string | null
          customer_id?: string | null
          subscription_end_date?: string | null
          profile_image_url?: string | null
          free_tests_taken?: number
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_history: {
        Row: {
          id: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_subscription_id: string | null
          amount: number
          currency: string
          status: string
          payment_method: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_payment_intent_id: string
          stripe_subscription_id?: string | null
          amount: number
          currency?: string
          status: string
          payment_method?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_payment_intent_id?: string
          stripe_subscription_id?: string | null
          amount?: number
          currency?: string
          status?: string
          payment_method?: string | null
          created_at?: string
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