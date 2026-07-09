import { useEffect, useMemo, useState } from "react";
import { getHourlyRecord } from "../lib/hourlyStorage";

const HOUR_MS = 3_600_000;
const currentHourBucket = () => Math.floor(Date.now() / HOUR_MS);

// Single source of truth for "has the user already played this hour",
// shared by the Home badge and the Live Challenge button so hour-bucket
// logic doesn't get duplicated between them.
//
// The bucket here is computed client-side, which is fine for this read: it's
// advisory UI only. The actual gameplay/scoring path always uses the
// server-returned hourBucket (see lib/api.ts fetchHourlyWord), so a skewed
// client clock can at worst show a stale badge for a moment, not affect
// correctness.
export function useHourlyChallenge() {
  const [hourBucket, setHourBucket] = useState(currentHourBucket);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setHourBucket((prev) => {
        const next = currentHourBucket();
        return next !== prev ? next : prev;
      });
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  // hourBucket only changes once an hour, but this hook re-renders every
  // second (LiveChallengeBadge also ticks a countdown) — memoize so the
  // localStorage read + JSON.parse doesn't repeat on every one of those.
  const record = useMemo(() => getHourlyRecord(hourBucket), [hourBucket]);
  const hasPlayedThisHour = record?.completed ?? false;
  const nextHourAtMs = (hourBucket + 1) * HOUR_MS;

  return { hourBucket, hasPlayedThisHour, nextHourAtMs };
}
