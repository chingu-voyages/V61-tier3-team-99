-- Game history: one row per finished game, so logged-in players can review
-- their past games and guesses.
CREATE TABLE IF NOT EXISTS game_history (
  id serial PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  word text NOT NULL,
  guesses text[] NOT NULL,
  won boolean NOT NULL,
  mode text NOT NULL DEFAULT 'infinity',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE game_history ENABLE ROW LEVEL SECURITY;

-- Private: only the user can read their own history.
CREATE POLICY "Users can read own game history"
  ON game_history FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE policies: record_game_history is SECURITY DEFINER and is
-- the only way to write to this table.
CREATE OR REPLACE FUNCTION record_game_history(
  p_word text,
  p_guesses text[],
  p_won boolean,
  p_mode text
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

  INSERT INTO game_history (user_id, word, guesses, won, mode)
  VALUES (auth.uid(), p_word, p_guesses, p_won, p_mode);
END;
$$;

CREATE OR REPLACE FUNCTION get_game_history(
  p_limit int DEFAULT 50,
  p_offset int DEFAULT 0
)
RETURNS SETOF game_history
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM game_history
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
$$;
