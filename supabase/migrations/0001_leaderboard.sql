-- Leaderboard: one row per authenticated user, updated via the
-- record_game_result RPC after each finished game.
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  username text NOT NULL,
  games_played int NOT NULL DEFAULT 0,
  games_won int NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- Public read so the leaderboard page works for signed-out visitors too.
CREATE POLICY "Leaderboard is publicly readable"
  ON leaderboard FOR SELECT
  USING (true);

-- No INSERT/UPDATE policies: record_game_result is SECURITY DEFINER and is
-- the only way to write to this table. Adding direct-write policies here
-- would let any signed-in user set their own games_won to anything via the
-- client SDK, bypassing the game entirely.

-- Atomic upsert-and-increment so two concurrent games from the same user
-- (e.g. two tabs) can't clobber each other's counts.
CREATE OR REPLACE FUNCTION record_game_result(p_won boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to record a game result';
  END IF;

  INSERT INTO leaderboard (user_id, username, games_played, games_won)
  VALUES (
    auth.uid(),
    COALESCE(
      (SELECT raw_user_meta_data ->> 'user_name' FROM auth.users WHERE id = auth.uid()),
      'Anonymous'
    ),
    1,
    CASE WHEN p_won THEN 1 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE SET
    games_played = leaderboard.games_played + 1,
    games_won = leaderboard.games_won + CASE WHEN p_won THEN 1 ELSE 0 END,
    updated_at = now();
END;
$$;
