import { useEffect, useState } from "react";
import { X, Share2 } from "lucide-react";
import { getAnonymousUserId } from "../lib/statsUtils";

const STATS_API = "http://localhost:5001/api/stats";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  onShare: () => void;
  copied: boolean;
  isHourlyMode: boolean;
  nextHourFormatted?: string;
  onNewGame?: () => void;
  isNewGameLoading?: boolean;
}

const StatsModal = ({
  open,
  onClose,
  onShare,
  copied,
  isHourlyMode,
  nextHourFormatted,
  onNewGame,
  isNewGameLoading,
}: StatsModalProps) => {
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [gamesWon, setGamesWon] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [guessDistribution, setGuessDistribution] = useState<number[]>([
    0, 0, 0, 0, 0, 0,
  ]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchStats = async () => {
      try {
        const userId = getAnonymousUserId();
        const res = await fetch(`${STATS_API}/${userId}`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        setGamesPlayed(data.games_played);
        setGamesWon(data.games_won);
        setCurrentStreak(data.current_streak);
        setMaxStreak(data.max_streak);
        setGuessDistribution(data.guess_distribution);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const winPercentage =
    gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  const maxDistributionCount = Math.max(...guessDistribution, 1);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#FDFCF7]/80 backdrop-blur-sm">
      <div className="relative w-full max-w-sm bg-[#F6F4EE] rounded-[32px] p-8 mx-4 shadow-xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-[#E5E3DC] rounded-full h-8 w-8 flex items-center justify-center hover:opacity-80 transition-opacity cursor-pointer"
        >
          <X size={16} className="text-[#1C2520]" />
        </button>

        <h2 className="text-center font-bold text-lg text-[#1C2520] mb-6">
          STATISTICS
        </h2>

        <div className="grid grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto">
            <span className="font-bold text-xl text-[#1C2520]">
              {gamesPlayed}
            </span>
            <span className="text-[10px] text-[#1C2520] tracking-wide">
              PLAYED
            </span>
          </div>
          <div className="bg-white rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto">
            <span className="font-bold text-xl text-[#1C2520]">
              {winPercentage}
            </span>
            <span className="text-[10px] text-[#1C2520] tracking-wide">
              WIN %
            </span>
          </div>
          <div className="bg-white rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto">
            <span className="font-bold text-xl text-[#1C2520]">
              {currentStreak}
            </span>
            <span className="text-[10px] text-[#1C2520] tracking-wide">
              CURRENT
            </span>
          </div>
          <div className="bg-white rounded-full h-20 w-20 flex flex-col items-center justify-center mx-auto">
            <span className="font-bold text-xl text-[#1C2520]">
              {maxStreak}
            </span>
            <span className="text-[10px] text-[#1C2520] tracking-wide">
              MAX
            </span>
          </div>
        </div>

        <h3 className="font-bold text-sm text-[#1C2520] mb-3">
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
                <span className="text-xs font-bold text-[#1C2520] w-3 text-right">
                  {i + 1}
                </span>
                <div className="flex-1 bg-[#E5E3DC] rounded-sm h-5 relative overflow-hidden">
                  <div
                    className={`h-full rounded-sm flex items-center justify-end px-1 text-xs font-bold text-white transition-all ${
                      isMax ? "bg-[#53665A]" : "bg-[#707A74]"
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

        <button
          onClick={onShare}
          className="mt-6 mx-auto flex items-center gap-2 rounded-full py-3 px-8 bg-[#53665A] text-white font-bold text-sm hover:opacity-90 transition-opacity cursor-pointer"
        >
          <Share2 size={16} />
          {copied ? "Copied!" : "Share"}
        </button>

        {isHourlyMode && nextHourFormatted ? (
          <p className="text-center text-sm mt-4 text-[#1C2520]">
            NEXT WORD IN
            <br />
            <span className="font-mono font-bold text-base">
              {nextHourFormatted}
            </span>
          </p>
        ) : onNewGame ? (
          <div className="flex justify-center mt-4">
            <button
              onClick={onNewGame}
              disabled={isNewGameLoading}
              className="h-9 cursor-pointer rounded-md bg-foreground px-6 text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
            >
              {isNewGameLoading ? "Loading\u2026" : "New Game"}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default StatsModal;
