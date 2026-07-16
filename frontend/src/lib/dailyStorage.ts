// Single owner of the Daily Puzzle localStorage schema. Nothing else should
// touch this key directly — GamePage and useDailyChallenge both go through
// these functions so the record shape only needs to change in one place.
export interface DailyRecord {
  dayBucket: number;
  secretWord: string;
  guesses: string[][];
  gameWon: boolean;
  // True once won or guesses are exhausted.
  completed: boolean;
  // Written atomically with `completed` so there's never a state where a
  // finished game hasn't been credited yet — that's what stops submitResult()
  // from firing again on a later reload of the same completed game.
  resultSubmitted: boolean;
}

const storageKey = (dayBucket: number) => `wordle-ish:daily:${dayBucket}`;

export function getDailyRecord(dayBucket: number): DailyRecord | null {
  const raw = localStorage.getItem(storageKey(dayBucket));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DailyRecord;
  } catch {
    return null;
  }
}

export function saveDailyRecord(record: DailyRecord): void {
  localStorage.setItem(storageKey(record.dayBucket), JSON.stringify(record));
}
