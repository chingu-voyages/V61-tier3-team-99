import { useEffect, useState } from "react";
import { fetchLeaderboard, type LeaderboardEntry } from "../lib/leaderboard";

const LeaderboardPage = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard()
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold tracking-widest uppercase">
        Leaderboard
      </h1>

      {loading ? (
        <p className="text-center text-sm text-muted-foreground">Loading…</p>
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
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.user_id} className="border-b border-border/60">
                <td className="py-2 font-medium">{entry.username}</td>
                <td className="py-2 text-right">{entry.games_played}</td>
                <td className="py-2 text-right">{entry.games_won}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LeaderboardPage;
