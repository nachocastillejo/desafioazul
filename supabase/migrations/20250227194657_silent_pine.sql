-- Fix RLS policies for study_progress table

-- First, ensure RLS is enabled
ALTER TABLE study_progress ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own study progress" ON study_progress;
DROP POLICY IF EXISTS "Users can insert their own study progress" ON study_progress;
DROP POLICY IF EXISTS "Users can update their own study progress" ON study_progress;
DROP POLICY IF EXISTS "Users can view their own study progress" ON study_progress;

-- Create comprehensive policies for each operation
CREATE POLICY "Users can view their own study progress"
  ON study_progress FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own study progress"
  ON study_progress FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own study progress"
  ON study_progress FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own study progress"
  ON study_progress FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());