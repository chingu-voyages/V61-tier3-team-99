import { supabase } from "./supabaseClient";

export type DailyPuzzleStats = {
  totalPlayers: number | null;
  totalWins: number | null;
  averageGuesses: number | null;
};

const EMPTY_DAILY_PUZZLE_STATS: DailyPuzzleStats = {
  totalPlayers: null,
  totalWins: null,
  averageGuesses: null,
};

export async function fetchDailyPuzzleStats(
  word: string,
): Promise<DailyPuzzleStats> {
  if (!supabase) return EMPTY_DAILY_PUZZLE_STATS;

  const { data, error } = await supabase
    .rpc("get_daily_puzzle_stats", { p_word: word })
    .single();

  if (error) {
    console.error("Failed to fetch daily puzzle stats:", error.message);
    return EMPTY_DAILY_PUZZLE_STATS;
  }
  // No generated Database types are wired up for this project (see
  // lib/api.ts), so the RPC response comes back untyped.
  const row = data as {
    total_players: number | null;
    total_wins: number | null;
    average_guesses: number | null;
  } | null;
  return {
    totalPlayers: row?.total_players ?? null,
    totalWins: row?.total_wins ?? null,
    averageGuesses: row?.average_guesses ?? null,
  };
}
