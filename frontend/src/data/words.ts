import { ANSWER_WORDS_5 } from "./answers-5";
import { VALID_GUESSES_5 } from "./valid-guesses-5";
import { ANSWER_WORDS_6 } from "./answers-6";
import { VALID_GUESSES_6 } from "./valid-guesses-6";

// Curated pools the secret word is drawn from (common, non-obscure words),
// keyed by word length.
const ANSWER_WORDS_BY_LENGTH: Record<number, string[]> = {
  5: ANSWER_WORDS_5,
  6: ANSWER_WORDS_6,
};

// Every word accepted as a guess, keyed by word length. Set gives O(1)
// lookup, so validation is instant regardless of list size. Answers are
// unioned in defensively even though the guess list should already contain
// them.
const VALID_GUESS_SET_BY_LENGTH: Record<number, Set<string>> = {
  5: new Set([...VALID_GUESSES_5, ...ANSWER_WORDS_5]),
  6: new Set([...VALID_GUESSES_6, ...ANSWER_WORDS_6]),
};

export const getAnswerWords = (wordLength: number): string[] =>
  ANSWER_WORDS_BY_LENGTH[wordLength] ?? ANSWER_WORDS_5;

export const getValidGuessSet = (wordLength: number): Set<string> =>
  VALID_GUESS_SET_BY_LENGTH[wordLength] ?? VALID_GUESS_SET_BY_LENGTH[5];
