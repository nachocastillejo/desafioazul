/*
  # Add User Progress Tables

  1. New Tables
    - `user_profiles`
      - Extended user information and preferences
    - `test_attempts`
      - Records of each test attempt
    - `question_stats`
      - Per-user statistics for each question
    - `bookmarks`
      - User's bookmarked questions
    - `study_progress`
      - User's progress through topics

  2. Security
    - Enable RLS on all tables
    - Add policies for user data access
*/

-- User Profiles
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  settings jsonb DEFAULT '{}'::jsonb,
  study_streak int DEFAULT 0,
  total_tests_taken int DEFAULT 0,
  total_questions_answered int DEFAULT 0
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Test Attempts
CREATE TABLE test_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  test_type text NOT NULL CHECK (test_type IN ('teoria', 'psicotecnico')),
  categories text[] NOT NULL,
  questions jsonb NOT NULL,
  answers jsonb NOT NULL,
  score numeric(5,2) NOT NULL,
  correct_answers int NOT NULL,
  incorrect_answers int NOT NULL,
  unanswered int NOT NULL,
  time_taken interval NOT NULL,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own test attempts"
  ON test_attempts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test attempts"
  ON test_attempts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Question Stats
CREATE TABLE question_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  question_id text NOT NULL,
  times_seen int DEFAULT 0,
  times_correct int DEFAULT 0,
  times_incorrect int DEFAULT 0,
  last_seen_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE question_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own question stats"
  ON question_stats FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Bookmarks
CREATE TABLE bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  question_id text NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own bookmarks"
  ON bookmarks FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Study Progress
CREATE TABLE study_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  category text NOT NULL,
  questions_seen int DEFAULT 0,
  questions_correct int DEFAULT 0,
  mastery_level int DEFAULT 0,
  last_studied_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, category)
);

ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own study progress"
  ON study_progress FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Indexes for better performance
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_question_stats_user_question ON question_stats(user_id, question_id);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);
CREATE INDEX idx_study_progress_user_category ON study_progress(user_id, category);