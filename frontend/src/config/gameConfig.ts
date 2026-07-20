// Central game configuration. Difficulty modes (6-letter words, 8 tries, etc.)
// can later be added as presets here and passed through router state.
export type GameMode = "infinity" | "infinity6" | "hourly" | "daily";

export interface GameConfig {
  wordLength: number;
  maxGuesses: number;
  mode: GameMode;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  wordLength: 5,
  maxGuesses: 6,
  mode: "infinity",
};

export const INFINITY_SIX_GAME_CONFIG: GameConfig = {
  wordLength: 6,
  maxGuesses: 6,
  mode: "infinity6",
};

export const HOURLY_GAME_CONFIG: GameConfig = {
  wordLength: 5,
  maxGuesses: 6,
  mode: "hourly",
};

export const DAILY_GAME_CONFIG: GameConfig = {
  wordLength: 5,
  maxGuesses: 6,
  mode: "daily",
};
