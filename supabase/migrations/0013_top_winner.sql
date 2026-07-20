-- Server-side aggregation for the landing page's "top winner" stat.
-- leaderboard has one row per (user_id, mode); summing across modes on the
-- client meant shipping the entire table to the browser on every page load.
-- This does the GROUP BY in Postgres and returns just the winner.
CREATE OR REPLACE FUNCTION get_top_winner()
RETURNS TABLE (
  user_id uuid,
  username text,
  games_played bigint,
  games_won bigint,
  score bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    l.user_id,
    -- A user's username can differ across mode rows if they renamed
    -- themselves between sessions; take the most recently updated one.
    (array_agg(l.username ORDER BY l.updated_at DESC))[1],
    SUM(l.games_played),
    SUM(l.games_won),
    SUM(l.score)
  FROM leaderboard l
  GROUP BY l.user_id
  ORDER BY SUM(l.score) DESC, SUM(l.games_won) DESC
  LIMIT 1;
END;
$$;
