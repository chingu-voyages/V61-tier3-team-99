import { useEffect, useState } from "react";
import { fetchLeaderboard, type LeaderboardEntry } from "../lib/leaderboard";
import { useAuth } from "../hooks/useAuth";
import type { GameMode } from "../config/gameConfig";

const tabs: { label: string; value: GameMode }[] = [
  { label: "Daily", value: "daily" },
  { label: "Hourly", value: "hourly" },
  { label: "Infinity", value: "infinity" },
  { label: "Infinity (6)", value: "infinity6" },
];

const LeaderboardPage = () => {
  const { configured } = useAuth();
  const [mode, setMode] = useState<GameMode>("daily");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  // Tracks which mode `entries` was fetched for, so loading can be derived
  // (mode !== loadedMode) instead of set synchronously inside the effect.
  const [loadedMode, setLoadedMode] = useState<GameMode | null>(null);
  const loading = loadedMode !== mode;

  useEffect(() => {
    fetchLeaderboard(mode).then((data) => {
      setEntries(data);
      setLoadedMode(mode);
    });
  }, [mode]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold tracking-widest uppercase">
        Leaderboard
      </h1>

      <div className="flex justify-center gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setMode(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-md cursor-pointer transition-colors ${
              mode === tab.value
                ? "bg-foreground text-background font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
      ) : !configured ? (
        <p className="text-center text-sm text-muted-foreground">
          Leaderboard is currently unavailable.
        </p>
      ) : entries.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No games recorded yet. Sign in and play a round!
        </p>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground">
              <th className="py-2">Player</th>
              <th className="py-2 text-right">Played</th>
              <th className="py-2 text-right">Won</th>
              <th className="py-2 text-right">Score</th>
              <th className="py-2 text-right">Hard Mode</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.user_id} className="border-b border-border/60">
                <td className="py-2 font-medium">{entry.username}</td>
                <td className="py-2 text-right">{entry.games_played}</td>
                <td className="py-2 text-right">{entry.games_won}</td>
                <td className="py-2 text-right">{entry.score}</td>
                <td className="py-2 text-right">
                  {entry.hard_mode_games} / {entry.games_played}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaderboardPage;
