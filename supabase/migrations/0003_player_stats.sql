-- Superseded PR #115's Express/pg implementation, same reason the leaderboard
-- and word-selection features moved to Supabase: the Express backend has no
-- production deployment (see README's "Legacy backend" note).
CREATE TABLE IF NOT EXISTS player_stats (
  user_id text PRIMARY KEY,
  games_played int NOT NULL DEFAULT 0,
  games_won int NOT NULL DEFAULT 0,
  current_streak int NOT NULL DEFAULT 0,
  max_streak int NOT NULL DEFAULT 0,
  guess_distribution int[] NOT NULL DEFAULT '{0,0,0,0,0,0}'
);

ALTER TABLE player_stats ENABLE ROW LEVEL SECURITY;

-- Public read so a guest can fetch their own stats by ID from the client.
-- Note: unlike the old Express GET /api/stats/:userId (point lookup only),
-- this policy can't scope by caller identity (guests aren't authenticated,
-- so there's no auth.uid() to check) -- anyone with the anon key could
-- SELECT * without a filter and enumerate all guests' stats. Data is just
-- anonymized counters and the leaderboard table already has the same
-- USING (true) public-read shape, so this isn't a new bar for the repo, but
-- it's called out explicitly in the PR description as a conscious tradeoff.
DROP POLICY IF EXISTS "Player stats are publicly readable" ON player_stats;
CREATE POLICY "Player stats are publicly readable"
  ON player_stats FOR SELECT
  USING (true);

-- No INSERT/UPDATE policies: record_player_stat is SECURITY DEFINER and is
-- the only way to write to this table. It can't verify a caller "owns" a
-- given guest_id (no auth for anonymous users) -- same trust model the
-- Express endpoint already had; not a new weakness.
CREATE OR REPLACE FUNCTION record_player_stat(p_user_id text, p_won boolean, p_guess_count int)
RETURNS player_stats
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result player_stats;
BEGIN
  IF p_user_id IS NULL OR length(trim(p_user_id)) = 0 OR length(p_user_id) > 255 THEN
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  IF p_won AND (p_guess_count IS NULL OR p_guess_count < 1 OR p_guess_count > 6) THEN
    RAISE EXCEPTION 'guess_count must be between 1 and 6 when p_won is true';
  END IF;

  INSERT INTO player_stats (user_id) VALUES (p_user_id)
  ON CONFLICT (user_id) DO NOTHING;

  IF p_won THEN
    UPDATE player_stats SET
      games_played = games_played + 1,
      games_won = games_won + 1,
      current_streak = current_streak + 1,
      max_streak = GREATEST(max_streak, current_streak + 1),
      guess_distribution[p_guess_count] = guess_distribution[p_guess_count] + 1
    WHERE user_id = p_user_id
    RETURNING * INTO result;
  ELSE
    UPDATE player_stats SET
      games_played = games_played + 1,
      current_streak = 0
    WHERE user_id = p_user_id
    RETURNING * INTO result;
  END IF;

  RETURN result;
END;
$$;
