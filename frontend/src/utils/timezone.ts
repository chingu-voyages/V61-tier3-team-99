// getTimezoneOffset() returns minutes WEST of UTC, so local_epoch =
// utc_epoch - offset*60. This is the "seconds to subtract from UTC epoch"
// value that get_daily_word / GET /api/word/daily expect, computed once
// here so it's never derived two different ways.
export function getUtcOffsetSeconds(): number {
  return new Date().getTimezoneOffset() * 60;
}
