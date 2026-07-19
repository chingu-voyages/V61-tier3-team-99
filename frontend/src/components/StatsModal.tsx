import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { fetchPlayerStats } from "../lib/statsUtils";

interface LatestStats {
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
  guess_distribution: number[];
}

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  latestStats?: LatestStats | null;
}

const StatsModal = ({ open, onClose, latestStats }: StatsModalProps) => {
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [guessDistribution, setGuessDistribution] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);

  useEffect(() => {
    if (!open) return;

    if (latestStats) {
      setTimeout(() => {
        setGamesPlayed(latestStats.games_played);
        setGamesWon(latestStats.games_won);
        setCurrentStreak(latestStats.current_streak);
        setMaxStreak(latestStats.max_streak);
        setGuessDistribution(latestStats.guess_distribution);
      }, 0);
      return;
    }

    let cancelled = false;

    const loadStats = async () => {
      const data = await fetchPlayerStats();
      if (cancelled) return;
      setGamesPlayed(data.games_played);
      setGamesWon(data.games_won);
      setCurrentStreak(data.current_streak);
      setMaxStreak(data.max_streak);
      setGuessDistribution(data.guess_distribution);
    };

    loadStats();

    return () => {
      cancelled = true;
    };
  }, [open, latestStats]);

  const winPercentage =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  const maxDistributionCount = Math.max(...guessDistribution, 1);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-[var(--modal-overlay)]/80 backdrop-blur-sm dark:bg-[#0B0C10]/80" />
      <div
        className="relative w-full max-w-sm bg-card rounded-[32px] p-8 shadow-xl border border-border dark:bg-[#13141F] dark:border-[#1E1F2F] dark:text-[#F4F6F9]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 cursor-pointer text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-center font-bold text-lg text-[var(--stats-text)] dark:text-[#F4F6F9] mb-6">
          STATISTICS
        </h2>

        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-[var(--stats-surface)] rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto dark:bg-[#1C1C24]">
            <span className="font-bold text-xl text-[var(--stats-text)] dark:text-[#F4F6F9]">
              {gamesPlayed}
            </span>
            <span className="text-[10px] text-[var(--stats-text)] dark:text-zinc-400 tracking-wide">
              PLAYED
            </span>
          </div>
          <div className="bg-[var(--stats-surface)] rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto dark:bg-[#1C1C24]">
            <span className="font-bold text-xl text-[var(--stats-text)] dark:text-[#F4F6F9]">
              {winPercentage}
            </span>
            <span className="text-[10px] text-[var(--stats-text)] dark:text-zinc-400 tracking-wide">
              WIN %
            </span>
          </div>
          <div className="bg-[var(--stats-surface)] rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto dark:bg-[#1C1C24]">
            <span className="font-bold text-xl text-[var(--stats-text)] dark:text-[#F4F6F9]">
              {currentStreak}
            </span>
            <span className="text-[10px] text-[var(--stats-text)] dark:text-zinc-400 tracking-wide">
              CURRENT
            </span>
          </div>
          <div className="bg-[var(--stats-surface)] rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto dark:bg-[#1C1C24]">
            <span className="font-bold text-xl text-[var(--stats-text)] dark:text-[#F4F6F9]">
              {maxStreak}
            </span>
            <span className="text-[10px] text-[var(--stats-text)] dark:text-zinc-400 tracking-wide">
              MAX
            </span>
          </div>
        </div>

        <h3 className="font-bold text-sm text-[var(--stats-text)] dark:text-[#F4F6F9] mb-3">
          GUESS DISTRIBUTION
        </h3>
        <div className="space-y-1.5">
          {guessDistribution.map((count, i) => {
            const barWidth =
              maxDistributionCount > 0
                ? (count / maxDistributionCount) * 100
                : 0;
            const isMax =
              count === maxDistributionCount && maxDistributionCount > 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--stats-text)] dark:text-zinc-400 w-3 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 bg-[var(--stats-bar-bg)] rounded-sm h-5 relative overflow-hidden dark:bg-[#1C1C24]">
                  <div
                    className={`h-full rounded-sm flex items-center justify-end px-1 text-xs font-bold text-white transition-all ${
                      isMax
                        ? "bg-[var(--stats-bar-win)] dark:bg-[#00F0FF] dark:text-[#0B0C10]"
                        : "bg-[var(--stats-bar)] dark:bg-[#3A3B47]"
                    }`}
                    style={{
                      width: `${Math.max(barWidth, count > 0 ? 8 : 0)}%`,
                    }}
                  >
                    {count > 0 && <span className="leading-none">{count}</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
