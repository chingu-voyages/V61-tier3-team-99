import { supabase } from "./supabaseClient";
import { getAnonymousUserId } from "./statsUtils";

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

// Records this player's result for today's word so they count toward
// get_daily_puzzle_stats -- uses the same per-browser anonymous ID as
// statsUtils' player stats (getAnonymousUserId), so guests are counted too,
// not just authenticated players.
export async function recordDailyPuzzleResult(
  word: string,
  won: boolean,
  guessCount: number,
): Promise<void> {
  if (!supabase) return;

  const { error } = await supabase.rpc("record_daily_puzzle_result", {
    p_user_id: getAnonymousUserId(),
    p_word: word,
    p_won: won,
    p_guess_count: guessCount,
  });

  if (error) {
    console.error("Failed to record daily puzzle result:", error.message);
  }
}
