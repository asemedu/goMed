-- 1. Create the user_activities table for tracking history logs
CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  xp_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;

-- 3. Security policies
CREATE POLICY "Users can view their own activities" 
ON user_activities FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activities" 
ON user_activities FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 4. Update the record_activity RPC function to automatically log the activity
CREATE OR REPLACE FUNCTION record_activity(xp_earned INT, activity_title TEXT DEFAULT 'Activity Completed')
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_last_date DATE;
  v_today DATE := CURRENT_DATE;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Insert activity entry
  INSERT INTO user_activities (user_id, title, xp_earned, created_at)
  VALUES (v_user_id, activity_title, xp_earned, NOW());

  -- Fetch current last_activity_date
  SELECT (last_activity_date AT TIME ZONE 'UTC')::DATE INTO v_last_date 
  FROM profiles 
  WHERE id = v_user_id;

  -- Update profile metrics
  UPDATE profiles
  SET 
    points = COALESCE(points, 0) + xp_earned,
    activities_count = COALESCE(activities_count, 0) + 1,
    streak = CASE 
      WHEN v_last_date IS NULL THEN 1
      WHEN v_last_date = v_today THEN COALESCE(streak, 0)
      WHEN v_last_date = v_today - INTERVAL '1 day' THEN COALESCE(streak, 0) + 1
      ELSE 1 
    END,
    last_activity_date = NOW()
  WHERE id = v_user_id;
END;
$$;
