import { supabase } from "./supabaseClient";

export type GlobalGameStats = {
  averageGuesses: number | null;
};

const EMPTY_GLOBAL_STATS: GlobalGameStats = { averageGuesses: null };

export async function fetchGlobalGameStats(): Promise<GlobalGameStats> {
  if (!supabase) return EMPTY_GLOBAL_STATS;

  const { data, error } = await supabase
    .rpc("get_global_game_stats")
    .single();

  if (error) {
    console.error("Failed to fetch global game stats:", error.message);
    return EMPTY_GLOBAL_STATS;
  }
  // No generated Database types are wired up for this project (see
  // lib/api.ts), so the RPC response comes back untyped.
  const row = data as { average_guesses: number | null } | null;
  return { averageGuesses: row?.average_guesses ?? null };
}
