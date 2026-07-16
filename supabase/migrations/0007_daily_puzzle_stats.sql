-- Aggregate, anonymized "how's everyone doing on today's puzzle" stats for
-- Daily mode, keyed off the actual secret word for the caller's current
-- day_bucket rather than a shared calendar date -- players in different
-- timezones can get different words "on the same day" (see
-- get_daily_word's comment in 0006_daily_word.sql), so grouping by word is
-- what correctly scopes this to players who actually received today's
-- specific puzzle. SECURITY DEFINER, same bypass-RLS pattern already used
-- by get_global_game_stats (0004_global_game_stats.sql) to read across all
-- users despite game_history's own-row-only SELECT policy.
--
-- Only reflects authenticated players: game_history never receives guest
-- rows (record_game_history in 0005_game_history.sql requires auth.uid()),
-- the same limitation any other game_history-derived stat has. This is a
-- known, accepted gap, not a bug.
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
    ROUND(AVG(array_length(guesses, 1)) FILTER (WHERE won), 2) AS average_guesses
  FROM game_history
  WHERE mode = 'daily' AND upper(word) = upper(p_word);
$$;
