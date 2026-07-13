import { useLayoutEffect, useState } from "react";

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
//
// Calling Date.now() directly in the render body is disallowed here (React's
// render-purity lint rule — a render function must be a deterministic
// function of props/state), so remainingMs lives in state. The lazy
// useState initializer only runs on mount though, so if targetMs changes
// afterward (e.g. null -> a real timestamp once hourly data loads),
// remainingMs would otherwise still hold its old value for one render,
// flashing "00:00:00". useLayoutEffect (not useEffect) closes that gap: it
// re-syncs remainingMs synchronously before the browser paints, so the
// stale value is never actually shown on screen.
export function useCountdown(targetMs: number | null) {
  const [remainingMs, setRemainingMs] = useState(() =>
    targetMs === null ? 0 : Math.max(0, targetMs - Date.now()),
  );

  useLayoutEffect(() => {
    const tick = () =>
      setRemainingMs(targetMs === null ? 0 : Math.max(0, targetMs - Date.now()));
    tick();
    if (targetMs === null) return;
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [targetMs]);

  return { remainingMs, formatted: formatDuration(remainingMs) };
}
