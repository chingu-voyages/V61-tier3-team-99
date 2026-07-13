import { supabase } from "./supabaseClient";

export type LeaderboardEntry = {
  user_id: string;
  username: string;
  games_played: number;
  games_won: number;
};

// No-ops when Supabase isn't configured or no one is signed in — the game
// itself doesn't depend on this succeeding.
export async function submitResult(won: boolean) {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  if (!data.session) return;

  const { error } = await supabase.rpc("record_game_result", { p_won: won });
  if (error) console.error("Failed to record game result:", error.message);
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("leaderboard")
    .select("user_id, username, games_played, games_won")
    .order("games_won", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Failed to fetch leaderboard:", error.message);
    return [];
  }
  return data ?? [];
}
