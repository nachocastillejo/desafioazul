/*
  # Add test_type column to study_progress table

  1. Changes
    - Add test_type column to study_progress table
    - Update unique constraint to include test_type
    - Backfill existing records with default test_type value
*/

-- Add test_type column to study_progress table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'study_progress' AND column_name = 'test_type'
  ) THEN
    ALTER TABLE study_progress ADD COLUMN test_type text NOT NULL DEFAULT 'teoria';
  END IF;
END
$$;

-- Drop the old unique constraint
ALTER TABLE study_progress DROP CONSTRAINT IF EXISTS study_progress_user_id_category_key;

-- Add new unique constraint including test_type
ALTER TABLE study_progress ADD CONSTRAINT study_progress_user_id_category_test_type_key 
  UNIQUE (user_id, category, test_type);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_study_progress_test_type ON study_progress(test_type);