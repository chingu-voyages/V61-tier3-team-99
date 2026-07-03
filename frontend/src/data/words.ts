import { ANSWER_WORDS_5 } from "./answers-5";
import { VALID_GUESSES_5 } from "./valid-guesses-5";

// Curated pool the secret word is drawn from (common, non-obscure words).
export const ANSWER_WORDS: string[] = ANSWER_WORDS_5;

// Every word accepted as a guess. Set gives O(1) lookup, so validation is
// instant regardless of list size. Answers are unioned in defensively even
// though the guess list should already contain them.
export const VALID_GUESS_SET: Set<string> = new Set([
  ...VALID_GUESSES_5,
  ...ANSWER_WORDS_5,
]);
