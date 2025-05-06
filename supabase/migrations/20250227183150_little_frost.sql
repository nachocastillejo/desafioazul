/*
  # Fix ambiguous column reference in get_user_strength_areas function

  1. Changes
    - Fix the "column reference category is ambiguous" error by properly qualifying all column references
    - Ensure all column references use table aliases consistently
*/

-- Fix the ambiguous column reference by properly qualifying all column references
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
      -- Only include categories with at least 1 question
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
    CASE WHEN rc.is_strength THEN 0 ELSE 1 END,
    CASE WHEN rc.is_strength THEN rc.mastery_level ELSE -rc.mastery_level END DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;