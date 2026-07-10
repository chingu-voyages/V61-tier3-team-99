CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  length INT NOT NULL,
  is_answer BOOLEAN NOT NULL DEFAULT false
);

-- The word endpoint filters on (length, is_answer); this also serves future
-- 6-letter modes and daily-word selection.
CREATE INDEX IF NOT EXISTS idx_words_length_answer ON words (length, is_answer);

CREATE TABLE IF NOT EXISTS player_stats (
  user_id VARCHAR(255) PRIMARY KEY,
  games_played INT NOT NULL DEFAULT 0,
  games_won INT NOT NULL DEFAULT 0,
  current_streak INT NOT NULL DEFAULT 0,
  max_streak INT NOT NULL DEFAULT 0,
  guess_distribution INT[] NOT NULL DEFAULT '{0,0,0,0,0,0}'
);
