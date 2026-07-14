-- Aggregate, anonymized read over player_stats for the landing page's public
-- stats strip. Does NOT expose per-user rows (no public SELECT policy is
-- added to player_stats, intentionally -- see 0003_player_stats.sql's
-- comment on guest enumeration). Returns only summed/derived totals.
CREATE OR REPLACE FUNCTION get_global_game_stats()
RETURNS TABLE (
  total_games_played bigint,
  total_games_won bigint,
  average_guesses numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_games_played bigint;
  v_games_won bigint;
  v_weighted_guesses numeric;
BEGIN
  SELECT
    COALESCE(SUM(games_played), 0),
    COALESCE(SUM(games_won), 0),
    COALESCE(SUM(
      1 * guess_distribution[1] + 2 * guess_distribution[2] +
      3 * guess_distribution[3] + 4 * guess_distribution[4] +
      5 * guess_distribution[5] + 6 * guess_distribution[6]
    ), 0)
  INTO v_games_played, v_games_won, v_weighted_guesses
  FROM player_stats;

  RETURN QUERY SELECT
    v_games_played,
    v_games_won,
    CASE WHEN v_games_won > 0
      THEN ROUND(v_weighted_guesses / v_games_won, 2)
      ELSE NULL
    END;
END;
$$;
