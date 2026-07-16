-- 1. get_daily_word's UTC-offset range check had its bounds backwards.
-- p_utc_offset_seconds follows JS's Date.getTimezoneOffset() convention:
-- seconds WEST of UTC, positive when local time is behind UTC. UTC-12 (the
-- westmost real timezone) is +43200; UTC+14 (the eastmost, e.g. Kiribati,
-- or New Zealand during DST at UTC+13) is -50400. The previous bound
-- (-43200..50400, carried over unchanged from 0006 into 0009) rejected
-- every real timezone east of UTC+12, including UTC+13/+14. Left as a new
-- CREATE OR REPLACE rather than editing 0006/0009 in place, since both were
-- already applied to the shared project.
CREATE OR REPLACE FUNCTION get_daily_word(p_length int, p_utc_offset_seconds int)
RETURNS TABLE(word text, day_bucket bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
  v_bucket bigint;
  v_offset int;
BEGIN
  IF p_utc_offset_seconds IS NULL
    OR p_utc_offset_seconds < -50400
    OR p_utc_offset_seconds > 43200
  THEN
    RAISE EXCEPTION 'p_utc_offset_seconds out of range';
  END IF;

  v_bucket := floor((extract(epoch FROM now()) - p_utc_offset_seconds) / 86400)::bigint;

  SELECT count(*) INTO v_count FROM words
  WHERE words.length = p_length AND words.is_answer = true;

  IF v_count = 0 THEN
    RETURN;
  END IF;

  v_offset := ((v_bucket % v_count) + v_count) % v_count;

  RETURN QUERY
  SELECT w.word, v_bucket
  FROM words w
  WHERE w.length = p_length AND w.is_answer = true
  ORDER BY w.id
  LIMIT 1 OFFSET v_offset;
END;
$$;

-- 2. get_daily_puzzle_stats filters daily_puzzle_results by word alone, but
-- the table's only index is the composite UNIQUE (user_id, word) -- not
-- usable for a word-only lookup since user_id is the leading column. Adds a
-- dedicated index so this stays fast as the table grows.
CREATE INDEX IF NOT EXISTS daily_puzzle_results_word_idx
  ON daily_puzzle_results (word);
