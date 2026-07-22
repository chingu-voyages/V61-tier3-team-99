import { supabase } from "./supabaseClient";
import type { GameMode } from "../config/gameConfig";

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  mode: GameMode;
  games_played: number;
  games_won: number;
  hard_mode_games: number;
  score: number;
};

// No-ops when Supabase isn't configured or no one is signed in — the game
// itself doesn't depend on this succeeding.
export async function submitResult(won: boolean, mode: GameMode, hardMode: boolean) {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const { error } = await supabase.rpc("record_game_result", {
    p_won: won,
    p_mode: mode,
    p_hard_mode: hardMode,
  });
  if (error) console.error("Failed to record game result:", error.message);
}

export async function fetchLeaderboard(mode: GameMode): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, username, mode, games_played, games_won, hard_mode_games, score")
    .eq("mode", mode)
    .order("score", { ascending: false })
    .order("games_won", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to fetch leaderboard:", error.message);
    return [];
  }
  return data ?? [];
}

export type TopWinner = {
  user_id: string;
  username: string;
  games_played: number;
  games_won: number;
  score: number;
};

// leaderboard has one row per (user_id, mode); get_top_winner sums each
// user's rows across every mode server-side and returns just the winner.
export async function fetchTopWinner(): Promise<TopWinner | null> {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("get_top_winner").maybeSingle();

  if (error) {
    console.error("Failed to fetch top winner:", error.message);
    return null;
  }
  // No generated Database types are wired up for this project (see
  // lib/api.ts), so the RPC response comes back untyped.
  return data as TopWinner | null;
}
