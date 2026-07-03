import { ANSWER_WORDS } from "../data/words";

// Client-side fallback for when the backend is unreachable. Draws from the
// curated answer pool, not the full guess list, so the secret word stays common.
export const getRandomWord = (): string => {
  const randomIndex = Math.floor(Math.random() * ANSWER_WORDS.length);
  return ANSWER_WORDS[randomIndex];
};
