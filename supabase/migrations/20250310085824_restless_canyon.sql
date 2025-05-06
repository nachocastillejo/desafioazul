/*
  # Create questions table and insert initial data

  1. New Tables
    - `questions` table for storing test questions
      - `id` (uuid, primary key)
      - `test_type` (text) - Type of test (teoria/psicotecnico)
      - `category` (text) - Question category
      - `text` (text) - Question text
      - `options` (jsonb) - Array of answer options
      - `correct_option` (integer) - Index of correct answer
      - `explanation` (text) - Explanation of the correct answer
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on questions table
    - Add policy for authenticated users to read questions
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_type text NOT NULL,
  category text NOT NULL,
  text text NOT NULL,
  options jsonb NOT NULL,
  correct_option integer NOT NULL,
  explanation text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;

-- Create policy for reading questions
CREATE POLICY "Questions are viewable by all authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial questions
DO $$ 
BEGIN
  INSERT INTO questions (test_type, category, text, options, correct_option, explanation)
  VALUES 
    (
      'psicotecnico',
      'Razonamiento numérico',
      'Si un trabajador gana 12 € por hora y trabaja 7 horas al día durante 5 días a la semana, ¿cuál es su sueldo semanal?',
      '["84 €", "420 €", "12 €", "588 €"]'::jsonb,
      1,
      'Se multiplica la tarifa horaria (12 €) por las horas diarias (7) y por los días a la semana (5): 12 × 7 × 5 = 420 €.'
    ),
    (
      'psicotecnico',
      'Razonamiento verbal',
      'Encuentra el antónimo más adecuado de la palabra ''optimista''.',
      '["Alegre", "Pesimista", "Seguro", "Despreocupado"]'::jsonb,
      1,
      'El antónimo de ''optimista'' es ''pesimista'', ya que describe la visión negativa frente a los hechos.'
    );
END $$;