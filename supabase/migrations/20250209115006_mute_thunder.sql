/*
  # Initial Schema for Police Exam Platform

  1. New Tables
    - users (managed by Supabase Auth)
    - topics
      - id: Topic identifier
      - name: Topic name
      - description: Topic description
    - questions
      - id: Question identifier
      - topic_id: Reference to topics
      - question_text: The actual question
      - options: Array of possible answers
      - correct_option: Index of correct answer
      - explanation: Explanation for the correct answer
    - exam_results
      - id: Result identifier
      - user_id: Reference to users
      - score: Number of correct answers
      - total_questions: Total number of questions
      - time_taken: Time taken in seconds
      - questions: JSONB array of answered questions
    
  2. Security
    - Enable RLS on all tables
    - Add policies for user access
*/

-- Topics table
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE topics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Topics are viewable by all authenticated users"
  ON topics FOR SELECT
  TO authenticated
  USING (true);

-- Questions table
CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id),
  question_text text NOT NULL,
  options text[] NOT NULL,
  correct_option integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Questions are viewable by all authenticated users"
  ON questions FOR SELECT
  TO authenticated
  USING (true);

-- Exam Results table
CREATE TABLE exam_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  score integer NOT NULL,
  total_questions integer NOT NULL,
  time_taken integer NOT NULL,
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE exam_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own exam results"
  ON exam_results FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own exam results"
  ON exam_results FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);