// Central game configuration. Difficulty modes (6-letter words, 8 tries, etc.)
// can later be added as presets here and passed through router state.
export type GameMode = "infinity" | "hourly" | "daily";

export interface GameConfig {
  wordLength: number;
  maxGuesses: number;
  mode: GameMode;
  hardMode?: boolean;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  wordLength: 5,
  maxGuesses: 6,
  mode: "infinity",
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
