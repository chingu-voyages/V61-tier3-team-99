import { supabase } from "./supabaseClient";

export interface GameHistoryEntry {
  id?: number;
  word: string;
  guesses: string[];
  won: boolean;
  mode: string;
  created_at?: string;
}

const LOCAL_STORAGE_KEY = "game_history";
const MAX_LOCAL_ENTRIES = 50;

const getLocalHistory = (): GameHistoryEntry[] => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveLocalHistory = (entry: GameHistoryEntry): void => {
  try {
    const history = getLocalHistory();
    history.unshift({ ...entry, created_at: new Date().toISOString() });
    if (history.length > MAX_LOCAL_ENTRIES) history.pop();
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.warn("Failed to save game history to localStorage:", e);
  }
};

export const saveGameHistory = async (
  word: string,
  guesses: string[],
  won: boolean,
  mode: string,
  user?: { id: string } | null,
): Promise<void> => {
  if (user && supabase) {
    const { error } = await supabase.rpc("record_game_history", {
      p_word: word,
      p_guesses: guesses,
      p_won: won,
      p_mode: mode,
    });
    if (error) console.error("Failed to save game history to Supabase:", error.message);
    return;
  }

  saveLocalHistory({ word, guesses, won, mode });
};

export const fetchGameHistory = async (
  user?: { id: string } | null,
  limit = 50,
  offset = 0,
): Promise<GameHistoryEntry[]> => {
  if (user && supabase) {
    const { data, error } = await supabase.rpc("get_game_history", {
      p_limit: limit,
      p_offset: offset,
    });
    if (error) {
      console.error("Failed to fetch game history from Supabase:", error.message);
      return [];
    }
    return (data as GameHistoryEntry[]) || [];
  }

  const history = getLocalHistory();
  return history.slice(offset, offset + limit);
};
