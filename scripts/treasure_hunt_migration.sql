-- ==============================================================================
-- Treasure Hunt (Scavenger Hunt) DB Migration for goMed
-- ==============================================================================

-- 1. Add hunt progress tracking fields to lobby_participants
ALTER TABLE lobby_participants
ADD COLUMN IF NOT EXISTS completed_quiz_ids TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS quizzes_completed_count INT DEFAULT 0;

-- 2. Create atomic RPC function to record a completed hunt quiz station
CREATE OR REPLACE FUNCTION record_hunt_quiz_completion(
  p_lobby_id UUID,
  p_user_id UUID,
  p_quiz_id TEXT,
  p_points INT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update participant score, quiz count, and completed quiz ID list atomically
  UPDATE lobby_participants
  SET 
    current_score = COALESCE(current_score, 0) + p_points,
    completed_quiz_ids = ARRAY_APPEND(
      COALESCE(completed_quiz_ids, '{}'::TEXT[]),
      p_quiz_id
    ),
    quizzes_completed_count = COALESCE(quizzes_completed_count, 0) + 1
  WHERE 
    lobby_id = p_lobby_id
    AND user_id = p_user_id
    AND NOT (p_quiz_id = ANY(COALESCE(completed_quiz_ids, '{}'::TEXT[])));
END;
$$;
