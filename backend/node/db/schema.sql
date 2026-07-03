CREATE TABLE IF NOT EXISTS words (
  id SERIAL PRIMARY KEY,
  word TEXT NOT NULL UNIQUE,
  length INT NOT NULL,
  is_answer BOOLEAN NOT NULL DEFAULT false
);

-- The word endpoint filters on (length, is_answer); this also serves future
-- 6-letter modes and daily-word selection.
CREATE INDEX IF NOT EXISTS idx_words_length_answer ON words (length, is_answer);
