import { supabase } from "./supabaseClient";

export type PlayerStats = {
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
  guess_distribution: number[];
};

const EMPTY_STATS: PlayerStats = {
  games_played: 0,
  games_won: 0,
  current_streak: 0,
  max_streak: 0,
  guess_distribution: [0, 0, 0, 0, 0, 0],
};

let memoryId: string | null = null;

const getAnonymousUserId = (): string => {
  try {
    let anonymousId = localStorage.getItem("anonymous_user_id");
    if (!anonymousId) {
      anonymousId = "guest_" + Math.random().toString(36).substring(2, 11);
      localStorage.setItem("anonymous_user_id", anonymousId);
    }
    return anonymousId;
  } catch (e) {
    console.warn("localStorage unavailable, falling back to in-memory ID", e);
    if (!memoryId) {
      memoryId = "guest_" + Math.random().toString(36).substring(2, 11);
    }
    return memoryId;
  }
};

export const saveGameResult = async (
  didWin: boolean,
  guessCount: number,
): Promise<PlayerStats | null> => {
  if (!supabase) return null;

  const { data, error } = await supabase.rpc("record_player_stat", {
    p_user_id: getAnonymousUserId(),
    p_won: didWin,
    p_guess_count: guessCount,
  });

  if (error) {
    console.error("Failed to save game result:", error.message);
    return null;
  }
  return data as PlayerStats;
};

export const fetchPlayerStats = async (): Promise<PlayerStats> => {
  if (!supabase) return EMPTY_STATS;

  const { data, error } = await supabase.rpc("get_player_stats", {
    p_user_id: getAnonymousUserId(),
  });

  if (error) {
    console.error("Failed to fetch player stats:", error.message);
    return EMPTY_STATS;
  }
  // A brand-new guest has no row yet: get_player_stats returns a row of
  // nulls rather than no row at all, so fall back explicitly.
  if (!data || data.games_played == null) return EMPTY_STATS;
  return data as PlayerStats;
};

export { getAnonymousUserId };
