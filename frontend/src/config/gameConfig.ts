// Central game configuration. Difficulty modes (6-letter words, 8 tries, etc.)
// can later be added as presets here and passed through router state.
export interface GameConfig {
  wordLength: number;
  maxGuesses: number;
}

export const DEFAULT_GAME_CONFIG: GameConfig = {
  wordLength: 5,
  maxGuesses: 6,
};
