import type { TileStatus } from "../components/Tile";

export function validateHardModeGuess(
  candidate: string[],
  guesses: string[][],
  guessesStatuses: TileStatus[][],
  wordLength: number,
): string | null {
  const greens = new Map<number, string>();
  const yellows = new Map<string, Set<number>>();
  const eliminated = new Set<string>();
  const foundInWord = new Set<string>();

  for (let i = 0; i < guesses.length; i++) {
    const guess = guesses[i];
    const statuses = guessesStatuses[i];

    for (let j = 0; j < wordLength; j++) {
      const letter = guess[j];
      const status = statuses[j];

      if (status === "correct") {
        greens.set(j, letter);
        foundInWord.add(letter);
      } else if (status === "wrong-position") {
        if (!yellows.has(letter)) yellows.set(letter, new Set());
        yellows.get(letter)!.add(j);
        foundInWord.add(letter);
      } else if (status === "not-in-word") {
        eliminated.add(letter);
      }
    }
  }

  for (const letter of foundInWord) {
    eliminated.delete(letter);
  }

  for (const [index, letter] of greens) {
    if (candidate[index] !== letter) {
      return `Hard mode: must use ${letter} at position ${index + 1}`;
    }
  }

  for (const [letter] of yellows) {
    if (!candidate.includes(letter)) {
      return `Hard mode: must include letter ${letter}`;
    }
  }

  for (const letter of candidate) {
    if (eliminated.has(letter)) {
      return `Hard mode: letter ${letter} has been eliminated`;
    }
  }

  return null;
}
