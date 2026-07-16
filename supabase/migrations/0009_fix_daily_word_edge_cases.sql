-- Fixes two edge cases in get_daily_word (0006_daily_word.sql), left as a
-- new CREATE OR REPLACE rather than editing 0006 in place since 0006 was
-- already applied to the shared project:
--
-- 1. A NULL p_utc_offset_seconds made the range check
--    (p_utc_offset_seconds < -43200 OR p_utc_offset_seconds > 50400)
--    evaluate to NULL, which IF treats as false, silently skipping the
--    guard instead of raising -- v_bucket/v_offset then computed as NULL,
--    producing an ill-defined OFFSET. Now explicitly rejected.
-- 2. Postgres's % is remainder, not modulo: for a negative v_bucket (a
--    mocked clock in tests, or a system clock before 1970), v_bucket %
--    v_count could go negative, and a negative OFFSET raises a database
--    error. The extra +v_count/% v_count normalizes the result back into
--    [0, v_count).
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
    OR p_utc_offset_seconds < -43200
    OR p_utc_offset_seconds > 50400
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
