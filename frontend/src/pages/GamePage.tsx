import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Share2 } from "lucide-react";
import { VALID_GUESS_SET } from "../data/words";
import { DEFAULT_GAME_CONFIG, type GameConfig } from "../config/gameConfig";
import { submitResult } from "../lib/leaderboard";
import { fetchRandomWord } from "../lib/api";
import { getRandomWord } from "../utils/randomWord";
import { useHighContrast } from "../hooks/useHighContrast";
import { Button } from "../components/ui/button";

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
  const [secretWord, setSecretWord] = useState<string>(
    location.state?.secretWord ?? ""
  );
  const config: GameConfig = location.state?.config ?? DEFAULT_GAME_CONFIG;
  const { wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES } = config;

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const [isNewGameLoading, setIsNewGameLoading] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const { isHighContrast } = useHighContrast();
  const [copied, setCopied] = useState(false);
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so handleKeyPress never needs to change, avoiding listener churn on every keystroke
  const currentGuessRef = useRef(currentGuess);
  const guessesRef = useRef(guesses);
  const gameWonRef = useRef(gameWon);
  const secretWordRef = useRef(secretWord);
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

  // Show overlay right when the flip animation finishes
  useEffect(() => {
    if (gameWon || guesses.length >= MAX_GUESSES) {
      const timer = setTimeout(() => setShowGameOver(true), 500);
      return () => {
        clearTimeout(timer);
        setShowGameOver(false);
      };
    }
  }, [gameWon, guesses.length, MAX_GUESSES]);

  const letterStatuses = useMemo(() => {
    const statusMap: Record<
      string,
      "correct" | "wrong-position" | "not-in-word"
    > = {};

    for (const guess of guesses) {
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
  }, [guesses, secretWord, WORD_LENGTH]);

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
      const won = gameWonRef.current;
      const guess = currentGuessRef.current;
      const allGuesses = guessesRef.current;

      if (won || allGuesses.length >= MAX_GUESSES) return;

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
    [triggerInvalid],
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
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [guesses, guessesStatuses, gameWon, MAX_GUESSES, isHighContrast]);

  // Direct navigation to /game (bookmark, refresh, shared link) has no router
  // state, so secretWord starts empty — start a fresh game instead of
  // leaving the board unplayable.
  useEffect(() => {
    if (!secretWord) {
      queueMicrotask(() => handleNewGame());
    }
  }, [secretWord, handleNewGame]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyPress(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return (
    <div className="flex flex-1 flex-col items-center gap-10 px-3 py-10">
      {/* Game board: 6 rows × 5 columns, relative so the toast can float above it */}
      <div className="relative flex flex-col gap-2">
        {/* Invalid guess toast — floats above the board, no layout shift */}
        {invalidMessage && (
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-md">
            {invalidMessage}
          </div>
        )}

        {Array.from({ length: MAX_GUESSES }).map((_, rowIndex) => {
          const isCurrentRow = !gameWon && rowIndex === guesses.length;
          const rowLetters =
            guesses[rowIndex] ?? (isCurrentRow ? currentGuess : []);

          const isPastRow = rowIndex < guesses.length;
          const isWinningRow = gameWon && rowIndex === guesses.length - 1;
          const pastTileStatuses = isPastRow
            ? guessesStatuses[rowIndex]
            : [];

          return (
            <div
              key={
                shakingRow === rowIndex ? `${rowIndex}-${shakeKey}` : rowIndex
              }
              className={`flex gap-2${shakingRow === rowIndex ? " invalid-row" : ""}`}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                const status = pastTileStatuses[colIndex];
                const tileColorClass = isHighContrast
                  ? status === "correct"
                    ? "bg-orange-500 text-white border-orange-500"
                    : status === "wrong-position"
                      ? "bg-blue-500 text-white border-blue-500"
                      : status === "not-in-word"
                        ? "bg-neutral-600 text-white border-neutral-600"
                        : ""
                  : status === "correct"
                    ? "bg-green-500 text-white border-green-500"
                    : status === "wrong-position"
                      ? "bg-yellow-500 text-white border-yellow-500"
                      : status === "not-in-word"
                        ? "bg-stone-400 text-white border-stone-400"
                        : "";
                const tileClass = isWinningRow
                  ? `${tileColorClass} border-[3px]`
                  : isPastRow
                    ? `${tileColorClass} border-2`
                    : isCurrentRow
                      ? "border-[3px] border-foreground/70"
                      : "border-2 border-foreground/30";

                const letter = rowLetters[colIndex] ?? "";
                const ariaLabel = status
                  ? `${letter}, ${
                      status === "correct"
                        ? "correct position"
                        : status === "wrong-position"
                          ? "wrong position"
                          : "not in word"
                    }`
                  : letter || undefined;

                return (
                  <div
                    key={colIndex}
                    className={`flex h-14 w-14 items-center justify-center rounded-md text-2xl font-bold uppercase relative ${tileClass}`}
                    aria-label={ariaLabel}
                  >
                    {letter}
                    {isHighContrast && status && (
                      <span
                        className="absolute top-0 right-0 text-[9px] leading-none p-0.5"
                        aria-hidden="true"
                      >
                        {status === "correct"
                          ? "✓"
                          : status === "wrong-position"
                            ? "●"
                            : "✕"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Card flip: keyboard flips away, game-over message overlays on top */}
      <div className="relative w-full max-w-[500px] perspective-[800px]">
        <div
          className={`relative transition-transform duration-500 transform-3d ${
            gameWon || guesses.length >= MAX_GUESSES ? "rotate-y-180" : ""
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
              <button
                onClick={handleNewGame}
                disabled={isNewGameLoading}
                className="h-9 cursor-pointer rounded-md bg-foreground px-6 text-sm font-semibold uppercase tracking-wide text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                {isNewGameLoading ? "Loading\u2026" : "New Game"}
              </button>
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
