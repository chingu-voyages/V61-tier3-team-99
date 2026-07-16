import { useEffect, useMemo, useState } from "react";
import { getDailyRecord } from "../lib/dailyStorage";
import { getUtcOffsetSeconds } from "../utils/timezone";

const DAY_SECONDS = 86_400;
// Bucket math mirrors get_daily_word's SQL formula exactly (see
// supabase/migrations/0006_daily_word.sql): local_epoch = utc_epoch -
// offset, then floor to a day index. Keep the two in sync if either changes.
const currentDayBucket = () =>
  Math.floor((Date.now() / 1000 - getUtcOffsetSeconds()) / DAY_SECONDS);

// Single source of truth for "has the user already played today's puzzle",
// shared by the Home badge and the Daily Puzzle button so day-bucket logic
// doesn't get duplicated between them.
//
// The bucket here is computed client-side, which is fine for this read: it's
// advisory UI only. The actual gameplay/scoring path always uses the
// server-returned dayBucket (see lib/api.ts fetchDailyWord), so a skewed
// client clock can at worst show a stale badge for a moment, not affect
// correctness.
export function useDailyChallenge() {
  const [dayBucket, setDayBucket] = useState(currentDayBucket);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDayBucket((prev) => {
        const next = currentDayBucket();
        return next !== prev ? next : prev;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // dayBucket only changes once a day, but this hook re-renders every
  // second (DailyChallengeBadge also ticks a countdown) — memoize so the
  // localStorage read + JSON.parse doesn't repeat on every one of those.
  const record = useMemo(() => getDailyRecord(dayBucket), [dayBucket]);
  const hasPlayedToday = record?.completed ?? false;
  const nextDayAtMs =
    (dayBucket + 1) * DAY_SECONDS * 1000 + getUtcOffsetSeconds() * 1000;

  return { dayBucket, hasPlayedToday, nextDayAtMs };
}
