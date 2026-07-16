-- Mirrors GET /api/word/daily: a word shared by every caller within the
-- same LOCAL calendar day, changing at local midnight. Unlike
-- get_hourly_word, this takes a client-supplied UTC offset because midnight
-- (unlike an hour boundary) isn't the same instant everywhere, and the
-- server has no other way to know a visitor's timezone -- see
-- lib/api.ts fetchDailyWord for the full tradeoff writeup. The offset is
-- clamped to a real timezone range (UTC-12..UTC+14) so a bogus/huge value
-- can't be used to jump arbitrarily far into the answer list. One
-- consequence: day_bucket is a per-timezone personal day index, not a
-- shared calendar date -- two players in different timezones can
-- legitimately get different words "on the same UTC day," matching how
-- real Wordle's daily puzzle number works. ORDER BY id (not random()) keeps
-- the offset deterministic, same as get_hourly_word.
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
  IF p_utc_offset_seconds < -43200 OR p_utc_offset_seconds > 50400 THEN
    RAISE EXCEPTION 'p_utc_offset_seconds out of range';
  END IF;

  v_bucket := floor((extract(epoch FROM now()) - p_utc_offset_seconds) / 86400)::bigint;

  SELECT count(*) INTO v_count FROM words
  WHERE words.length = p_length AND words.is_answer = true;

  IF v_count = 0 THEN
    RETURN;
  END IF;

  v_offset := v_bucket % v_count;

  RETURN QUERY
  SELECT w.word, v_bucket
  FROM words w
  WHERE w.length = p_length AND w.is_answer = true
  ORDER BY w.id
  LIMIT 1 OFFSET v_offset;
END;
$$;
