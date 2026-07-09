import { useHourlyChallenge } from "../hooks/useHourlyChallenge";
import { useCountdown } from "../hooks/useCountdown";

const LiveChallengeBadge = () => {
  const { hasPlayedThisHour, nextHourAtMs } = useHourlyChallenge();
  const { formatted } = useCountdown(hasPlayedThisHour ? nextHourAtMs : null);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      <span
        className={`h-2 w-2 rounded-full ${
          hasPlayedThisHour ? "bg-foreground/30" : "bg-green-500"
        }`}
      />
      {hasPlayedThisHour ? `Next challenge in ${formatted}` : "Live challenge available"}
    </div>
  );
};

export default LiveChallengeBadge;
