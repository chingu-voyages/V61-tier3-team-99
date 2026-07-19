-- Split the leaderboard into per-(user, mode) rows and add hard-mode
-- tracking, both as a bragging stat (hard_mode_games) and a scoring boost
-- (win-only bonus: 1 pt/win, 2 pt/hard-mode win, 0 for losses).

-- 1. Purge dev/test noise: single-game accounts pre-date real usage tracking.
DELETE FROM leaderboard WHERE games_played = 1;

-- 2. Reshape leaderboard into a per-(user, mode) table.
ALTER TABLE leaderboard DROP CONSTRAINT leaderboard_pkey;

ALTER TABLE leaderboard
  ADD COLUMN mode text NOT NULL DEFAULT 'infinity',
  ADD COLUMN hard_mode_games int NOT NULL DEFAULT 0,
  ADD COLUMN score int NOT NULL DEFAULT 0;

-- Backfill: surviving rows are historically 'infinity' (the only mode that
-- existed pre-refactor, applied automatically via the column default above).
-- hard_mode_games stays 0 (untracked historically); score = games_won
-- (1 pt/win, no hard-mode bonus applicable since hard mode wasn't tracked).
UPDATE leaderboard SET score = games_won;

ALTER TABLE leaderboard ADD PRIMARY KEY (user_id, mode);

-- 3. Rewrite record_game_result for per-mode, win-only-bonus scoring.
-- CREATE OR REPLACE does not replace a function when the parameter list
-- changes (Postgres treats it as a new overload), so drop the old signature
-- explicitly to avoid a dead/insecure old overload staying callable.
DROP FUNCTION IF EXISTS record_game_result(boolean);

CREATE FUNCTION record_game_result(
  p_won boolean,
  p_mode text,
  p_hard_mode boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_points int := CASE
    WHEN p_won AND p_hard_mode THEN 2
    WHEN p_won THEN 1
    ELSE 0
  END;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to record a game result';
  END IF;

  INSERT INTO leaderboard (
    user_id, username, mode, games_played, games_won, hard_mode_games, score
  )
  VALUES (
    auth.uid(),
    COALESCE(
      (SELECT raw_user_meta_data ->> 'user_name' FROM auth.users WHERE id = auth.uid()),
      'Anonymous'
    ),
    p_mode,
    1,
    CASE WHEN p_won THEN 1 ELSE 0 END,
    CASE WHEN p_hard_mode THEN 1 ELSE 0 END,
    v_points
  )
  ON CONFLICT (user_id, mode) DO UPDATE SET
    games_played = leaderboard.games_played + 1,
    games_won = leaderboard.games_won + CASE WHEN p_won THEN 1 ELSE 0 END,
    hard_mode_games = leaderboard.hard_mode_games + CASE WHEN p_hard_mode THEN 1 ELSE 0 END,
    score = leaderboard.score + v_points,
    updated_at = now();
END;
$$;

-- 4. game_history: add hard_mode tracking for parity/audit trail.
ALTER TABLE game_history ADD COLUMN hard_mode boolean NOT NULL DEFAULT false;

DROP FUNCTION IF EXISTS record_game_history(text, text[], boolean, text);

CREATE FUNCTION record_game_history(
  p_word text,
  p_guesses text[],
  p_won boolean,
  p_mode text,
  p_hard_mode boolean
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated to record game history';
  END IF;

  INSERT INTO game_history (user_id, word, guesses, won, mode, hard_mode)
  VALUES (auth.uid(), p_word, p_guesses, p_won, p_mode, p_hard_mode);
END;
$$;

-- get_game_history is `SELECT * FROM game_history`, so hard_mode is picked
-- up automatically — no change needed there.
