import { useEffect, useState } from "react";
import { BarChart3, ShieldCheck, Zap } from "lucide-react";
import {
  fetchLeaderboard,
  fetchTotalGamesPlayed,
  type LeaderboardEntry,
} from "../lib/leaderboard";
import { fetchGlobalGameStats } from "../lib/globalStats";

const featureCards = [
  {
    title: "Live Hourly Challenge",
    description:
      "Everyone gets the same word each hour. Jump in anytime, finish where you left off, and race the countdown to the next puzzle.",
    icon: Zap,
  },
  {
    title: "Hard Mode",
    description:
      "Raise the difficulty: lock in green letters, reuse every yellow you've found, and lose access to letters you've ruled out.",
    icon: ShieldCheck,
  },
  {
    title: "Track Your Progress",
    description:
      "See your win rate, streaks, and guess distribution after every game — then share your results with a tap.",
    icon: BarChart3,
  },
];

const LandingFeatures = () => {
  const [totalGamesPlayed, setTotalGamesPlayed] = useState<number | null>(
    null,
  );
  const [topWinner, setTopWinner] = useState<LeaderboardEntry | null>(null);
  const [averageGuesses, setAverageGuesses] = useState<number | null>(null);

  useEffect(() => {
    fetchTotalGamesPlayed().then(setTotalGamesPlayed);
    fetchLeaderboard().then((entries) => setTopWinner(entries[0] ?? null));
    fetchGlobalGameStats().then((stats) =>
      setAverageGuesses(stats.averageGuesses),
    );
  }, []);

  const stats = [
    {
      value:
        totalGamesPlayed !== null ? totalGamesPlayed.toLocaleString() : "—",
      label: "games played",
    },
    {
      value: topWinner ? topWinner.username : "—",
      label: topWinner ? `top winner · ${topWinner.games_won} wins` : "top winner",
    },
    {
      value: averageGuesses !== null ? averageGuesses.toFixed(1) : "—",
      label: "avg. guesses to win",
    },
  ];

  return (
    <section className="w-full border-t border-border/70 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Experience Wordplay Differently
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            An open source Wordle clone, with a few extra modes.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-stretch">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="flex w-full max-w-sm flex-1 flex-col items-center gap-4 rounded-2xl border bg-card p-4 text-center shadow-sm lg:max-w-none lg:items-start lg:p-5 lg:text-left"
            >
              <div className="flex h-10 w-10 self-center items-center justify-center rounded-lg border bg-muted lg:self-start">
                <feature.icon className="h-5 w-5 text-foreground/80" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium tracking-tight sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 border-t border-border/70 pt-8 lg:justify-between">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-32 flex-1 text-center">
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
