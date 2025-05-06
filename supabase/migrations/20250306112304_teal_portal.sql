/*
  # Questions Database Schema

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `test_type` (text) - either 'teoria' or 'psicotecnico'
      - `category` (text) - question category
      - `topic` (text) - broader topic grouping
      - `text` (text) - question text
      - `options` (text[]) - array of possible answers
      - `correct_option` (integer) - index of correct answer
      - `explanation` (text) - explanation of the correct answer
      - `image_url` (text, optional) - URL to question image
      - `image_alt` (text, optional) - alt text for image
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on questions table
    - Add policies for:
      - Authenticated users can read questions
      - Only admins can create/update/delete questions

  3. Functions
    - Add function to get questions by test type and categories
    - Add function to get available categories by test type
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type text NOT NULL CHECK (test_type IN ('teoria', 'psicotecnico')),
  category text NOT NULL,
  topic text NOT NULL,
  text text NOT NULL,
  options text[] NOT NULL,
  correct_option integer NOT NULL,
  explanation text NOT NULL,
  image_url text,
  image_alt text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read questions"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert questions"
  ON questions
  FOR INSERT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can update questions"
  ON questions
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin')
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Only admins can delete questions"
  ON questions
  FOR DELETE
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');

-- Create function to get questions by test type and categories
CREATE OR REPLACE FUNCTION get_questions_by_type_and_categories(
  p_test_type text,
  p_categories text[] DEFAULT NULL
)
RETURNS SETOF questions
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF p_categories IS NULL THEN
    RETURN QUERY
    SELECT *
    FROM questions
    WHERE test_type = p_test_type;
  ELSE
    RETURN QUERY
    SELECT *
    FROM questions
    WHERE test_type = p_test_type
    AND category = ANY(p_categories);
  END IF;
END;
$$;

-- Create function to get available categories by test type
CREATE OR REPLACE FUNCTION get_categories_by_test_type(p_test_type text)
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

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();