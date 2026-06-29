import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { WORD_LIST } from "../data/words";

const WORD_LENGTH = 5;
const MAX_GUESSES = 6;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const GamePage = () => {
  const location = useLocation();
  const secretWord: string = location.state?.secretWord ?? "";

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentGuess, setCurrentGuess] = useState<string[]>([]);
  const [gameWon, setGameWon] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState<string | null>(null);
  const [shakingRow, setShakingRow] = useState<number | null>(null);
  const [shakeKey, setShakeKey] = useState(0);
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so handleKeyPress never needs to change, avoiding listener churn on every keystroke
  const currentGuessRef = useRef(currentGuess);
  const guessesRef = useRef(guesses);
  const gameWonRef = useRef(gameWon);
  const secretWordRef = useRef(secretWord);

  useEffect(() => {
    currentGuessRef.current = currentGuess;
  }, [currentGuess]);
  useEffect(() => {
    guessesRef.current = guesses;
  }, [guesses]);
  useEffect(() => {
    gameWonRef.current = gameWon;
  }, [gameWon]);

  const triggerInvalid = useCallback((rowIndex: number, msg: string) => {
    if (invalidTimerRef.current) clearTimeout(invalidTimerRef.current);
    setInvalidMessage(msg);
    setShakingRow(rowIndex);
    setShakeKey((k) => k + 1);
    invalidTimerRef.current = setTimeout(() => {
      setInvalidMessage(null);
      setShakingRow(null);
    }, 2000);
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
          if (!WORD_LIST.includes(word)) {
            triggerInvalid(allGuesses.length, "Not in word list");
            return;
          }
          setGuesses((prev) => [...prev, guess]);
          if (guess.join("") === secretWordRef.current.toUpperCase()) {
            setGameWon(true);
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      handleKeyPress(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return (
    <div className="flex flex-1 flex-col items-center gap-10 py-10">
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
          const tileClass = isWinningRow
            ? "border-[3px] border-green-500"
            : isPastRow
              ? "bg-stone-100 border-2 border-foreground/20"
              : isCurrentRow
                ? "border-[3px] border-foreground/70"
                : "border-2 border-foreground/30";

          return (
            <div
              key={
                shakingRow === rowIndex ? `${rowIndex}-${shakeKey}` : rowIndex
              }
              className={`flex gap-2${shakingRow === rowIndex ? " invalid-row" : ""}`}
            >
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`flex h-14 w-14 items-center justify-center rounded-md text-2xl font-bold uppercase ${tileClass}`}
                >
                  {rowLetters[colIndex] ?? ""}
                </div>
              ))}
            </div>
          );
        })}

        {(gameWon || guesses.length >= MAX_GUESSES) && (
          <div className="absolute left-1/2 -translate-x-1/2 top-full mt-4 whitespace-nowrap">
            <p
              className={`text-sm font-semibold ${gameWon ? "text-green-600" : "text-red-600"}`}
            >
              {gameWon ? (
                `You won! You guessed the word in ${guesses.length} ${guesses.length === 1 ? "guess" : "guesses"}.`
              ) : (
                <>
                  Game over! The word was:{" "}
                  <span className="font-mono font-bold">
                    {secretWord.toUpperCase()}
                  </span>
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* On-screen keyboard */}
      <div className="flex flex-col items-center gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex gap-1.5">
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className={`flex h-14 cursor-pointer items-center justify-center rounded-md border bg-muted text-sm font-semibold uppercase transition-colors hover:bg-muted/60 active:scale-95 ${
                  key === "ENTER" || key === "⌫" ? "min-w-[64px] px-2" : "w-10"
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        ))}
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
