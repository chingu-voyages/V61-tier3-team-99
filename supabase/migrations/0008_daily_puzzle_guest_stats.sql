-- Extends daily puzzle stats (0007_daily_puzzle_stats.sql) to include guest
-- players, not just authenticated ones. game_history -- what 0007 originally
-- read from -- is auth-gated (record_game_history requires auth.uid()), so
-- guest plays, which are the overwhelming majority of traffic, never
-- counted toward "how did everyone else do on today's puzzle." This mirrors
-- player_stats' approach (0003_player_stats.sql): a per-browser anonymous
-- ID with no auth required, written through a SECURITY DEFINER RPC. No
-- SELECT policy, same reasoning as player_stats -- a public read would let
-- anyone enumerate every guest's per-puzzle result.
CREATE TABLE IF NOT EXISTS daily_puzzle_results (
  id serial PRIMARY KEY,
  user_id text NOT NULL,
  word text NOT NULL,
  won boolean NOT NULL,
  guess_count int,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, word)
);

ALTER TABLE daily_puzzle_results ENABLE ROW LEVEL SECURITY;

-- One row per (user, word): a replay/refresh re-recording the same
-- already-finished puzzle updates in place instead of double-counting.
CREATE OR REPLACE FUNCTION record_daily_puzzle_result(
  p_user_id text,
  p_word text,
  p_won boolean,
  p_guess_count int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_user_id IS NULL OR length(trim(p_user_id)) = 0 OR length(p_user_id) > 255 THEN
    RAISE EXCEPTION 'Invalid user_id';
  END IF;

  INSERT INTO daily_puzzle_results (user_id, word, won, guess_count)
  VALUES (p_user_id, lower(p_word), p_won, p_guess_count)
  ON CONFLICT (user_id, word) DO UPDATE SET
    won = EXCLUDED.won,
    guess_count = EXCLUDED.guess_count,
    created_at = now();
END;
$$;

-- Supersedes 0007's game_history-backed version: same signature and return
-- shape, now reading from daily_puzzle_results so guest results count too.
CREATE OR REPLACE FUNCTION get_daily_puzzle_stats(p_word text)
RETURNS TABLE (
  total_players bigint,
  total_wins bigint,
  average_guesses numeric
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    COUNT(*) AS total_players,
    COUNT(*) FILTER (WHERE won) AS total_wins,
    ROUND(AVG(guess_count) FILTER (WHERE won), 2) AS average_guesses
  FROM daily_puzzle_results
  WHERE word = lower(p_word);
$$;
