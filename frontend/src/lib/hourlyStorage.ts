// Single owner of the Hourly Challenge localStorage schema. Nothing else
// should touch this key directly — GamePage and useHourlyChallenge both go
// through these functions so the record shape only needs to change in one
// place.
export interface HourlyRecord {
  hourBucket: number;
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

const storageKey = (hourBucket: number) => `wordle-ish:hourly:${hourBucket}`;

export function getHourlyRecord(hourBucket: number): HourlyRecord | null {
  const raw = localStorage.getItem(storageKey(hourBucket));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as HourlyRecord;
  } catch {
    return null;
  }
}

export function saveHourlyRecord(record: HourlyRecord): void {
  localStorage.setItem(storageKey(record.hourBucket), JSON.stringify(record));
}
