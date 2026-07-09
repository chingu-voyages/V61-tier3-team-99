import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

const formatDuration = (ms: number) => {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// Ticks once a second until targetMs is reached. Generic over the target
// timestamp (rather than hourly-specific) so it can be reused for any
// "come back at X" display.
export function useCountdown(targetMs: number | null) {
  const [remainingMs, setRemainingMs] = useState(() =>
    targetMs === null ? 0 : Math.max(0, targetMs - Date.now()),
  );

  useEffect(() => {
    if (targetMs === null) return;

    const tick = () => setRemainingMs(Math.max(0, targetMs - Date.now()));
    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [targetMs]);

  return { remainingMs, formatted: formatDuration(remainingMs) };
}
