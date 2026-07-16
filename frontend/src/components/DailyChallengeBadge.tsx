import { useDailyChallenge } from "../hooks/useDailyChallenge";
import { useCountdown } from "../hooks/useCountdown";

const DailyChallengeBadge = () => {
  const { hasPlayedToday, nextDayAtMs } = useDailyChallenge();
  const { formatted } = useCountdown(hasPlayedToday ? nextDayAtMs : null);

  return (
    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
      <span
        className={`h-2 w-2 rounded-full ${
          hasPlayedToday ? "bg-foreground/30" : "bg-green-500"
        }`}
      />
      {hasPlayedToday ? `Next puzzle in ${formatted}` : "Daily puzzle available"}
    </div>
  );
};

export default DailyChallengeBadge;
