-- 1. Add missing columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS activities_count INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS streak INT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_date TIMESTAMPTZ;

-- 2. Create the record_activity function
CREATE OR REPLACE FUNCTION record_activity(xp_earned INT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  -- Get the UUID of the authenticated user calling the function
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch the current last_activity_date
  SELECT (last_activity_date AT TIME ZONE 'UTC')::DATE INTO v_last_date 
  FROM profiles 
  WHERE id = v_user_id;

  -- Update logic
  UPDATE profiles
  SET 
    points = COALESCE(points, 0) + xp_earned,
    activities_count = COALESCE(activities_count, 0) + 1,
    streak = CASE 
      -- If they never had an activity, streak starts at 1
      WHEN v_last_date IS NULL THEN 1
      -- If they already did an activity today, streak stays the same
      WHEN v_last_date = v_today THEN COALESCE(streak, 0)
      -- If their last activity was yesterday, increment streak
      WHEN v_last_date = v_today - INTERVAL '1 day' THEN COALESCE(streak, 0) + 1
      -- If their last activity was earlier than yesterday, streak resets to 1
      ELSE 1 
    END,
    last_activity_date = NOW()
  WHERE id = v_user_id;
END;
$$;

-- 3. Create the get_user_rank function
CREATE OR REPLACE FUNCTION get_user_rank()
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_rank INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN 0;
  END IF;

  SELECT rank INTO v_rank
  FROM (
    SELECT id, RANK() OVER (ORDER BY COALESCE(points, 0) DESC, COALESCE(streak, 0) DESC) as rank
    FROM profiles
  ) ranked_profiles
  WHERE id = v_user_id;

  RETURN COALESCE(v_rank, 0);
END;
$$;
