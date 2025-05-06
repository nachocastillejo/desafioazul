/*
  # Questions Database Schema

  1. New Tables
    - `topics`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamptz)
    
    - `questions`
      - `id` (uuid, primary key)
      - `topic_id` (uuid, foreign key to topics)
      - `test_type` (text) - either 'teoria' or 'psicotecnico'
      - `category` (text)
      - `text` (text)
      - `options` (jsonb)
      - `correct_option` (integer)
      - `explanation` (text)
      - `image_url` (text, optional)
      - `image_alt` (text, optional)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read
    - Add policies for admin users to manage
*/

-- Create enum for test types
DO $$ BEGIN
  CREATE TYPE test_type AS ENUM ('teoria', 'psicotecnico');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create topics table
CREATE TABLE IF NOT EXISTS topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id uuid REFERENCES topics(id),
  test_type test_type NOT NULL,
  category text NOT NULL,
  text text NOT NULL,
  options jsonb NOT NULL,
  correct_option integer NOT NULL,
  explanation text NOT NULL,
  image_url text,
  image_alt text,
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_questions_test_type ON questions(test_type);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_topic_id ON questions(topic_id);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid()
    AND raw_user_meta_data->>'role' = 'admin'
  );
$$;

-- Policies for topics
CREATE POLICY "Topics are viewable by authenticated users"
  ON topics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Topics are manageable by admin users"
  ON topics
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Policies for questions
CREATE POLICY "Questions are viewable by authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Questions are manageable by admin users"
  ON questions
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Helper functions for questions
CREATE OR REPLACE FUNCTION get_questions_by_type_and_categories(
  p_test_type test_type,
  p_categories text[] DEFAULT NULL
)
RETURNS SETOF questions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_categories IS NULL THEN
    RETURN QUERY
    SELECT q.*
    FROM questions q
    WHERE q.test_type = p_test_type;
  ELSE
    RETURN QUERY
    SELECT q.*
    FROM questions q
    WHERE q.test_type = p_test_type
    AND q.category = ANY(p_categories);
  END IF;
END;
$$;

-- Function to get available categories by test type
CREATE OR REPLACE FUNCTION get_categories_by_test_type(p_test_type test_type)
RETURNS TABLE (category text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT q.category
  FROM questions q
  WHERE q.test_type = p_test_type
  ORDER BY q.category;
END;
$$;