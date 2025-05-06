/*
  # Fix study progress threshold for analysis

  1. Changes
    - Reduce the minimum threshold for showing categories in analysis (changed to 1 question)
    - Add debug function to help diagnose study progress issues
*/

-- Reduce the minimum threshold for showing categories in analysis
-- This will allow categories with fewer questions to appear in the analysis
CREATE OR REPLACE FUNCTION get_user_strength_areas(user_id_param uuid, test_type_param text DEFAULT NULL)
RETURNS TABLE (
  category text,
  test_type text,
  mastery_level integer,
  questions_seen integer,
  questions_correct integer,
  is_strength boolean
) AS $$
BEGIN
  RETURN QUERY
  WITH ranked_categories AS (
    SELECT
      sp.category,
      sp.test_type,
      sp.mastery_level,
      sp.questions_seen,
      sp.questions_correct,
      -- Rank categories by mastery level (descending)
      ROW_NUMBER() OVER (
        PARTITION BY CASE WHEN test_type_param IS NULL THEN 'all' ELSE sp.test_type END
        ORDER BY sp.mastery_level DESC
      ) as strength_rank,
      -- Rank categories by mastery level (ascending)
      ROW_NUMBER() OVER (
        PARTITION BY CASE WHEN test_type_param IS NULL THEN 'all' ELSE sp.test_type END
        ORDER BY sp.mastery_level ASC
      ) as weakness_rank
    FROM study_progress sp
    WHERE 
      sp.user_id = user_id_param AND
      -- Only include categories with at least 1 question (changed from 3)
      sp.questions_seen >= 1 AND
      -- Filter by test_type if provided
      (test_type_param IS NULL OR sp.test_type = test_type_param)
  )
  SELECT
    rc.category,
    rc.test_type,
    rc.mastery_level,
    rc.questions_seen,
    rc.questions_correct,
    -- Mark as strength if in top 3, weakness if in bottom 2
    CASE WHEN rc.strength_rank <= 3 THEN true ELSE false END as is_strength
  FROM ranked_categories rc
  WHERE rc.strength_rank <= 3 OR rc.weakness_rank <= 2
  ORDER BY 
    CASE WHEN is_strength THEN 0 ELSE 1 END,
    CASE WHEN is_strength THEN rc.mastery_level ELSE -rc.mastery_level END DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a debug function to help diagnose study progress issues
CREATE OR REPLACE FUNCTION debug_study_progress(user_id_param uuid)
RETURNS TABLE (
  category text,
  test_type text,
  questions_seen integer,
  questions_correct integer,
  mastery_level integer,
  last_studied_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sp.category,
    sp.test_type,
    sp.questions_seen,
    sp.questions_correct,
    sp.mastery_level,
    sp.last_studied_at
  FROM study_progress sp
  WHERE sp.user_id = user_id_param
  ORDER BY sp.test_type, sp.mastery_level DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
