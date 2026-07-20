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

// leaderboard has one row per (user_id, mode), so an overall top player
// means summing each user's rows across every mode client-side — there's
// no single "all modes" row to query.
export async function fetchTopWinner(): Promise<TopWinner | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, username, games_played, games_won, score");

  if (error) {
    console.error("Failed to fetch top winner:", error.message);
    return null;
  }
  if (!data || data.length === 0) return null;

  const totals = new Map<string, TopWinner>();
  for (const row of data) {
    const existing = totals.get(row.user_id);
    if (existing) {
      existing.games_played += row.games_played;
      existing.games_won += row.games_won;
      existing.score += row.score;
    } else {
      totals.set(row.user_id, { ...row });
    }
  }

  return [...totals.values()].sort(
    (a, b) => b.score - a.score || b.games_won - a.games_won,
  )[0];
}
