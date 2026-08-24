-- Create a function to fetch the contextual leaderboard
-- It returns up to 5 users: the target user, 2 above them, and 2 below them.

CREATE OR REPLACE FUNCTION get_leaderboard_context(p_user_id UUID)
RETURNS TABLE (
  id UUID,
  display_name TEXT,
  points INT,
  streak INT,
  rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH RankedUsers AS (
    SELECT 
      p.id,
      p.display_name,
      p.points,
      p.streak,
      -- We use ROW_NUMBER() instead of RANK() so that ties don't result in 
      -- duplicate ranks, guaranteeing we always get exactly 5 rows in our window.
      ROW_NUMBER() OVER (ORDER BY COALESCE(p.points, 0) DESC, COALESCE(p.streak, 0) DESC, p.id ASC) as rank
    FROM profiles p
  ),
  TargetUser AS (
    SELECT r.rank FROM RankedUsers r WHERE r.id = p_user_id
  )
  SELECT 
    r.id,
    r.display_name,
    r.points,
    r.streak,
    r.rank
  FROM RankedUsers r, TargetUser t
  WHERE r.rank BETWEEN (t.rank - 2) AND (t.rank + 2)
  ORDER BY r.rank ASC
  LIMIT 5;
END;
$$ LANGUAGE plpgsql;
