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
