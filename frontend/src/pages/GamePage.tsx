import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const WORD_LENGTH = 5;

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

const GamePage = () => {
  const location = useLocation();
  const secretWord: string = location.state?.secretWord ?? "";

  const [currentGuess, setCurrentGuess] = useState<string[]>([]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[a-zA-Z]$/.test(e.key) && currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => [...prev, e.key.toUpperCase()]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess]);

  const handleKeyPress = (key: string) => {
    if (key === "⌫") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (key === "ENTER") {
      // submit logic comes later
    } else if (currentGuess.length < WORD_LENGTH) {
      setCurrentGuess((prev) => [...prev, key]);
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center gap-10 py-10">

      {/* Letter tiles */}
      <div className="flex gap-2">
        {Array.from({ length: WORD_LENGTH }).map((_, i) => (
          <div
            key={i}
            className="flex h-14 w-14 items-center justify-center rounded-md border-2 border-foreground/30 text-2xl font-bold uppercase"
          >
            {currentGuess[i] ?? ""}
          </div>
        ))}
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

      {/* TODO: gate behind import.meta.env.DEV before shipping */}
      {secretWord && (
        <p className="text-xs text-muted-foreground">
          (dev) secret word: <span className="font-mono font-bold">{secretWord}</span>
        </p>
      )}
    </div>
  );
};

export default GamePage;
