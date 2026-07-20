import { getAnswerWords } from "../data/words";

// Client-side fallback for when the backend is unreachable. Draws from the
// curated answer pool, not the full guess list, so the secret word stays common.
export const getRandomWord = (length: number): string => {
  const pool = getAnswerWords(length);
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};
