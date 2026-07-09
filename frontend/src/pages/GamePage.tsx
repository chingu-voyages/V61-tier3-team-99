import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { Share2 } from "lucide-react";
import { VALID_GUESS_SET } from "../data/words";
import {
  DEFAULT_GAME_CONFIG,
  HOURLY_GAME_CONFIG,
  type GameConfig,
} from "../config/gameConfig";
import { submitResult } from "../lib/leaderboard";
import { fetchRandomWord, fetchHourlyWord } from "../lib/api";
import { getRandomWord } from "../utils/randomWord";
import { useHighContrast } from "../hooks/useHighContrast";
import { Button } from "../components/ui/button";
import { getHourlyRecord, saveHourlyRecord } from "../lib/hourlyStorage";
import { useCountdown } from "../hooks/useCountdown";
import GameBoard from "../components/GameBoard";
import { FLIP_DURATION_MS, FLIP_STAGGER_MS } from "../components/Tile";

const HOUR_MS = 3_600_000;
const KEYBOARD_FLIP_DURATION_MS = 500; // keep in sync with duration-500 on the keyboard card below
// Small gap after keys turn color before the keyboard itself starts flipping,
// so the color change is briefly visible instead of happening at the exact
// instant the keyboard begins rotating away.
const KEYBOARD_FLIP_EXTRA_DELAY_MS = 75;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const getTileStatuses = (
  guess: string[],
  secret: string,
  wordLength: number,
): ("correct" | "wrong-position" | "not-in-word" | "")[] => {
  const secretUpper = secret.toUpperCase();
  const remaining = secretUpper.split("");
  const statuses: ("correct" | "wrong-position" | "not-in-word" | "")[] =
    new Array(wordLength).fill("");

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === remaining[i]) {
      statuses[i] = "correct";
      remaining[i] = "";
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (statuses[i] === "correct") continue;
    const idx = remaining.indexOf(guess[i]);
    if (idx !== -1) {
      statuses[i] = "wrong-position";
      remaining[idx] = "";
    } else if (guess[i]) {
      statuses[i] = "not-in-word";
    }
  }

  return statuses;
};

const generateShareText = (
  guesses: string[][],
  guessesStatuses: ("correct" | "wrong-position" | "not-in-word" | "")[][],
  gameWon: boolean,
  maxGuesses: number,
  isHighContrast: boolean,
): string => {
  const guessCount = gameWon ? guesses.length.toString() : "X";
  const lines = [`Wordle-ish ${guessCount}/${maxGuesses}`];

  const emojiMap = isHighContrast
    ? { correct: "🟧" as const, "wrong-position": "🟦" as const, "not-in-word": "⬛" as const }
    : { correct: "🟩" as const, "wrong-position": "🟨" as const, "not-in-word": "⬜" as const };

  for (const statuses of guessesStatuses) {
    lines.push(statuses.map((s) => emojiMap[s as keyof typeof emojiMap] ?? "⬜").join(""));
  }

  return lines.join("\n");
};

const GamePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // A hard refresh loses router state, so ?mode=hourly (set by the Live
  // Challenge button) is what lets hourly mode survive a real page reload —
  // router state alone only survives client-side navigation.
  const config: GameConfig =
    location.state?.config ??
    (searchParams.get("mode") === "hourly"
      ? HOURLY_GAME_CONFIG
      : DEFAULT_GAME_CONFIG);
  const isHourlyMode = config.mode === "hourly";
  const { wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES } = config;

  const [secretWord, setSecretWord] = useState<string>(() =>
    isHourlyMode ? "" : (location.state?.secretWord ?? ""),
  );
  // Stays null until the server confirms the current hour bucket (see the
  // hydration effect below) — the client clock can't be trusted for this,
  // so nothing reads/writes localStorage until we have the real value.
  const [hourBucket, setHourBucket] = useState<number | null>(null);
  const [isReadOnlyReplay, setIsReadOnlyReplay] = useState(false);
  const [hourlyLoadError, setHourlyLoadError] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [isNewGameLoading, setIsNewGameLoading] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  // The keyboard's own 3D flip must wait for the board's tiles to finish
  // their staggered reveal, otherwise the keyboard flips away and sits
  // blank while tiles are still mid-animation, which reads as a bug.
  const [keyboardFlipped, setKeyboardFlipped] = useState(false);
  // How many submitted guesses' letters are allowed to color the on-screen
  // keyboard — lags behind guesses.length by one tile-flip sequence so a key
  // doesn't turn green/yellow/gray before that guess's own tiles do.
  const [revealedGuessCount, setRevealedGuessCount] = useState(0);
  const { isHighContrast } = useHighContrast();
  const [copied, setCopied] = useState(false);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so handleKeyPress never needs to change, avoiding listener churn on every keystroke
  const currentGuessRef = useRef(currentGuess);
  const guessesRef = useRef(guesses);
  const gameWonRef = useRef(gameWon);
  const secretWordRef = useRef(secretWord);
  const revealedGuessCountRef = useRef(revealedGuessCount);
  // Guards against submitting the same game's result twice (e.g. rapid
  // double Enter before React re-renders); reset whenever a new game starts.
  const hasSubmittedResultRef = useRef(false);

  useEffect(() => {
    hasSubmittedResultRef.current = false;
  }, [secretWord]);
  useEffect(() => {
    secretWordRef.current = secretWord;
  }, [secretWord]);
  useEffect(() => {
    currentGuessRef.current = currentGuess;
  }, [currentGuess]);
  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);
  useEffect(() => {
    gameWonRef.current = gameWon;
  }, [gameWon]);
  useEffect(() => {
    revealedGuessCountRef.current = revealedGuessCount;
  }, [revealedGuessCount]);

  // Wait for the board's staggered tile flip to fully finish, plus a short
  // extra beat so the keys' new colors are visible before the keyboard
  // itself starts flipping over, then wait for that flip to finish before
  // showing the overlay — a longer word takes longer for its last tile
  // column to reveal, so this is word-length aware rather than fixed.
  useEffect(() => {
    if (gameWon || guesses.length >= MAX_GUESSES) {
      const tileFlipSequenceMs =
        (WORD_LENGTH - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS;
      const keyboardFlipDelayMs = tileFlipSequenceMs + KEYBOARD_FLIP_EXTRA_DELAY_MS;
      const flipTimer = setTimeout(
        () => setKeyboardFlipped(true),
        keyboardFlipDelayMs,
      );
      const overlayTimer = setTimeout(
        () => setShowGameOver(true),
        keyboardFlipDelayMs + KEYBOARD_FLIP_DURATION_MS,
      );
      return () => {
        clearTimeout(flipTimer);
        clearTimeout(overlayTimer);
        setKeyboardFlipped(false);
        setShowGameOver(false);
      };
    }
  }, [gameWon, guesses.length, MAX_GUESSES, WORD_LENGTH]);

  // Every submitted guess reveals its letters on the on-screen keyboard only
  // once that row's own tile flip finishes — not the instant it's submitted
  // — so a key never turns color ahead of the tile that justified it.
  // (Resetting to 0 for a new game happens synchronously in handleNewGame;
  // this timer re-confirming 0 afterward is a harmless no-op.)
  useEffect(() => {
    const tileFlipSequenceMs =
      (WORD_LENGTH - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS;
    const timer = setTimeout(
      () => setRevealedGuessCount(guesses.length),
      tileFlipSequenceMs,
    );
    return () => clearTimeout(timer);
  }, [guesses.length, WORD_LENGTH]);

  const letterStatuses = useMemo(() => {
    const statusMap: Record<
      string,
      "correct" | "wrong-position" | "not-in-word"
    > = {};

    for (const guess of guesses.slice(0, revealedGuessCount)) {
      const statuses = getTileStatuses(guess, secretWord, WORD_LENGTH);
      for (let i = 0; i < guess.length; i++) {
        const letter = guess[i];
        const status = statuses[i];
        if (!status) continue;

        const priority: Record<string, number> = {
          correct: 3,
          "wrong-position": 2,
          "not-in-word": 1,
        };
        const current = statusMap[letter];
        if (!current || priority[status] > priority[current]) {
          statusMap[letter] = status;
        }
      }
    }

    return statusMap;
  }, [guesses, revealedGuessCount, secretWord, WORD_LENGTH]);

  const guessesStatuses = useMemo(() => {
    return guesses.map((guess) =>
      getTileStatuses(guess, secretWord, WORD_LENGTH),
    );
  }, [guesses, secretWord, WORD_LENGTH]);

  const getKeyClass = useCallback(
    (key: string) => {
      if (key === "ENTER" || key === "⌫") return "";
      const status = letterStatuses[key];
      if (status === "correct")
        return isHighContrast
          ? "bg-orange-500 text-white border-orange-500 hover:bg-orange-500"
          : "bg-green-500 text-white border-green-500 hover:bg-green-500";
      if (status === "wrong-position")
        return isHighContrast
          ? "bg-blue-500 text-white border-blue-500 hover:bg-blue-500"
          : "bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-500";
      if (status === "not-in-word")
        return isHighContrast
          ? "bg-neutral-600 text-white border-neutral-600 hover:bg-neutral-600"
          : "bg-stone-400 text-white border-stone-400 hover:bg-stone-400";
      return "";
    },
    [letterStatuses, isHighContrast],
  );

  const triggerInvalid = useCallback((rowIndex: number, msg: string) => {
    if (invalidTimerRef.current) clearTimeout(invalidTimerRef.current);
    if (shakeTimerRef.current) clearTimeout(shakeTimerRef.current);
    setInvalidMessage(msg);
    setShakingRow(rowIndex);
    setShakeKey((k) => k + 1);
    // remove the animation class as soon as the animation finishes
    shakeTimerRef.current = setTimeout(() => setShakingRow(null), 500);
    // toast lingers a bit longer so the user can read it
    invalidTimerRef.current = setTimeout(() => setInvalidMessage(null), 1500);
  }, []);

  const handleKeyPress = useCallback(
    (key: string) => {
      // Locks both the physical keyboard and the on-screen keyboard, since
      // both funnel through this handler — a completed Hourly attempt is a
      // read-only replay, not an editable board.
      if (isReadOnlyReplay) return;

      const won = gameWonRef.current;
      const guess = currentGuessRef.current;
      const allGuesses = guessesRef.current;

      if (won || allGuesses.length >= MAX_GUESSES) return;
      // The previous guess's tiles are still flipping — block all input
      // (including backspace) until that row finishes revealing, so the
      // new line can't start mid-animation.
      if (allGuesses.length > revealedGuessCountRef.current) return;

      if (key === "⌫" || key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (key === "ENTER" || key === "Enter") {
        if (guess.length === WORD_LENGTH) {
          const word = guess.join("").toLowerCase();
          if (!VALID_GUESS_SET.has(word)) {
            triggerInvalid(allGuesses.length, "Not in word list");
            return;
          }
          setGuesses((prev) => [...prev, guess]);
          if (guess.join("") === secretWordRef.current.toUpperCase()) {
            setGameWon(true);
            if (!hasSubmittedResultRef.current) {
              hasSubmittedResultRef.current = true;
              submitResult(true);
            }
          } else if (allGuesses.length + 1 >= MAX_GUESSES) {
            if (!hasSubmittedResultRef.current) {
              hasSubmittedResultRef.current = true;
              submitResult(false);
            }
          }
          setCurrentGuess([]);
        }
      } else if (/^[a-zA-Z]$/.test(key)) {
        setCurrentGuess((prev) =>
          prev.length < WORD_LENGTH ? [...prev, key.toUpperCase()] : prev,
        );
      }
    },
    [triggerInvalid, isReadOnlyReplay],
  );

  const handleNewGame = useCallback(async () => {
    setIsNewGameLoading(true);
    let newWord: string;
    try {
      newWord = await fetchRandomWord(WORD_LENGTH);
    } catch {
      newWord = getRandomWord();
    }
    setSecretWord(newWord);
    setGuesses([]);
    setCurrentGuess([]);
    setGameWon(false);
    setInvalidMessage(null);
    setShakingRow(null);
    setRevealedGuessCount(0);
    hasSubmittedResultRef.current = false;
    setIsNewGameLoading(false);
  }, [WORD_LENGTH]);

  const handleShare = useCallback(() => {
    const text = generateShareText(
      guesses,
      guessesStatuses,
      gameWon,
      MAX_GUESSES,
      isHighContrast,
    );
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text)
        .then(() => {
          setCopied(true);
          if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
          shareTimerRef.current = setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Failed to copy text to clipboard:", err);
        });
    } else {
      console.warn("Clipboard API is not available.");
    }
  }, [guesses, guessesStatuses, gameWon, MAX_GUESSES, isHighContrast]);

  useEffect(() => {
    return () => {
      if (shareTimerRef.current) clearTimeout(shareTimerRef.current);
    };
  }, []);

  // Direct navigation to /game (bookmark, refresh, shared link) has no router
  // state, so secretWord starts empty — start a fresh game instead of
  // leaving the board unplayable. Hourly mode has its own start/resume
  // effect below since it must never hand out a random Infinity word.
  useEffect(() => {
    if (!isHourlyMode && !secretWord) {
      queueMicrotask(() => handleNewGame());
    }
  }, [secretWord, isHourlyMode, handleNewGame]);

  // Hourly mode always asks the server which hour bucket it is, rather than
  // computing it from the client clock — a skewed client clock would
  // otherwise read/write the wrong localStorage key (a different bucket than
  // the one the server just served), silently wiping progress on refresh or
  // locking a player out of an hour they should have access to. Once the
  // server confirms the real bucket, we hydrate from *that* bucket's
  // record: completed → read-only replay, in-progress → resume, absent →
  // fresh game with the word we just fetched. The persistence effect below
  // performs the actual first write once state settles.
  useEffect(() => {
    if (!isHourlyMode || hourBucket !== null) return;

    let cancelled = false;
    (async () => {
      try {
        const { word, hourBucket: bucket } = await fetchHourlyWord(WORD_LENGTH);
        if (cancelled) return;

        const existing = getHourlyRecord(bucket);
        if (existing) {
          setSecretWord(existing.secretWord);
          setGuesses(existing.guesses);
          setGameWon(existing.gameWon);
          setIsReadOnlyReplay(existing.completed);
        } else {
          setSecretWord(word);
        }
        setHourBucket(bucket);
      } catch {
        if (!cancelled) {
          setHourlyLoadError(
            "Couldn't load the live challenge. Please try again shortly.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isHourlyMode, hourBucket, WORD_LENGTH]);

  // Persist Hourly progress after every guess so a mid-attempt refresh
  // resumes instead of rerolling, and so a completed game replays read-only
  // on the next visit within the same hour. Skipped while already replaying
  // read-only to avoid rewriting storage with hydration-time state.
  useEffect(() => {
    if (!isHourlyMode || isReadOnlyReplay || hourBucket === null) return;
    saveHourlyRecord({
      hourBucket,
      secretWord,
      guesses,
      gameWon,
      completed: gameWon || guesses.length >= MAX_GUESSES,
      resultSubmitted: hasSubmittedResultRef.current,
    });
  }, [
    isHourlyMode,
    isReadOnlyReplay,
    hourBucket,
    secretWord,
    guesses,
    gameWon,
    MAX_GUESSES,
  ]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyPress(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const { formatted: nextHourFormatted } = useCountdown(
    isHourlyMode && hourBucket !== null ? (hourBucket + 1) * HOUR_MS : null,
  );

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-3 py-10">
      {/* Game board: 6 rows × 5 columns, relative so the toast can float above it */}
      <GameBoard
        maxGuesses={MAX_GUESSES}
        wordLength={WORD_LENGTH}
        guesses={guesses}
        currentGuess={currentGuess}
        guessesStatuses={guessesStatuses}
        gameWon={gameWon}
        invalidMessage={invalidMessage}
        shakingRow={shakingRow}
        shakeKey={shakeKey}
      />

      {hourlyLoadError && (
        <p className="text-sm font-semibold text-red-600">
          {hourlyLoadError}
        </p>
      )}

      {/* Card flip: keyboard flips away, game-over message overlays on top.
          A completed Hourly replay starts with gameWon/guesses already
          hydrated from storage, so it renders flipped from the first paint —
          no separate read-only styling needed on the keyboard itself. */}
      <div className="relative w-full max-w-[500px] perspective-[800px]">
        <div
          className={`relative transition-transform duration-500 transform-3d ${
            keyboardFlipped ? "rotate-y-180" : ""
          }`}
        >
          {/* Front face — keyboard */}
          <div
            className="backface-hidden flex w-full flex-col items-stretch gap-1.5 sm:gap-2"
            inert={gameWon || guesses.length >= MAX_GUESSES || undefined}
          >
            {KEYBOARD_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex w-full gap-1 sm:gap-1.5">
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyPress(key)}
                    className={`flex h-12 min-w-0 cursor-pointer touch-manipulation items-center justify-center rounded-md border text-xs font-semibold uppercase transition-colors active:scale-95 select-none sm:h-14 sm:text-sm ${
                      key === "ENTER" || key === "⌫" ? "flex-[1.6]" : "flex-1"
                    } ${getKeyClass(key) || "bg-muted hover:bg-muted/60"}`}
                  >
                    {key}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Back face — blank (no secret word) */}
          <div
            className="backface-hidden absolute inset-0 rotate-y-180"
            inert={gameWon || guesses.length >= MAX_GUESSES ? undefined : true}
          />
        </div>

        {/* Game-over overlay — appears after the flip animation completes */}
        {showGameOver && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-100">
            <p
              className={
                "text-sm font-semibold " +
                (gameWon ? "text-green-600" : "text-red-600")
              }
            >
              {gameWon ? (
                "You won! You guessed the word in " +
                guesses.length +
                " " +
                (guesses.length === 1 ? "guess" : "guesses") +
                "."
              ) : (
                <>
                  Game over! The word was:{" "}
                  <span className="font-mono font-bold">
                    {secretWord.toUpperCase()}
                  </span>
                </>
              )}
            </p>
            <div className="flex flex-col items-center gap-3">
              <Button variant="outline" size="sm" onClick={handleShare} className="cursor-pointer">
                <Share2 />
                {copied ? "Copied!" : "Share"}
              </Button>
              {isHourlyMode ? (
                <p className="text-sm text-muted-foreground">
                  Next live challenge in{" "}
                  <span className="font-mono font-semibold">
                    {nextHourFormatted}
                  </span>
                </p>
              ) : (
                <button
                  onClick={handleNewGame}
                  disabled={isNewGameLoading}
                  className="h-9 cursor-pointer rounded-md bg-foreground px-6 text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                >
                  {isNewGameLoading ? "Loading\u2026" : "New Game"}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* uncomment for testing: */}
      {secretWord && (
        <p className="text-xs text-muted-foreground">
          (dev) secret word:{" "}
          <span className="font-mono font-bold">{secretWord}</span>
        </p>
      )}
      {/* uncomment for production:
      {import.meta.env.DEV && secretWord && (
        <p className="text-xs text-muted-foreground">
          (dev) secret word: <span className="font-mono font-bold">{secretWord}</span>
        </p>
      )}
      */}
    </div>
  );
};

export default GamePage;
