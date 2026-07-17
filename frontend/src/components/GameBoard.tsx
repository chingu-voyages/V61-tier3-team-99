import Tile, { type TileStatus, type TileVariant } from "./Tile";

interface GameBoardProps {
  maxGuesses: number;
  wordLength: number;
  guesses: string[][];
  currentGuess: string[];
  guessesStatuses: TileStatus[][];
  gameWon: boolean;
  invalidMessage: string | null;
  shakingRow: number | null;
  shakeKey: number;
}

const GameBoard = ({
  maxGuesses,
  wordLength,
  guesses,
  currentGuess,
  guessesStatuses,
  gameWon,
  invalidMessage,
  shakingRow,
  shakeKey,
}: GameBoardProps) => {
  return (
    <div className="relative flex flex-col gap-2">
      {/* Invalid guess toast — floats above the board, no layout shift */}
      {invalidMessage && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-background shadow-md dark:bg-[#13141F]/90 dark:border dark:border-[#1E1F2F] dark:text-zinc-300">
          {invalidMessage}
        </div>
      )}

      {Array.from({ length: maxGuesses }).map((_, rowIndex) => {
        const isCurrentRow = !gameWon && rowIndex === guesses.length;
        const rowLetters =
          guesses[rowIndex] ?? (isCurrentRow ? currentGuess : []);

        const isPastRow = rowIndex < guesses.length;
        const isWinningRow = gameWon && rowIndex === guesses.length - 1;
        const pastTileStatuses = isPastRow ? guessesStatuses[rowIndex] : [];

        return (
          <div
            key={
              shakingRow === rowIndex ? `${rowIndex}-${shakeKey}` : rowIndex
            }
            className={`flex gap-2${shakingRow === rowIndex ? " invalid-row" : ""}`}
          >
            {Array.from({ length: wordLength }).map((_, colIndex) => {
              const variant: TileVariant = isWinningRow
                ? "winning"
                : isPastRow
                  ? "past"
                  : isCurrentRow
                    ? "current"
                    : "empty";

              return (
                <Tile
                  key={colIndex}
                  letter={rowLetters[colIndex] ?? ""}
                  status={pastTileStatuses[colIndex] ?? ""}
                  variant={variant}
                  colIndex={colIndex}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default GameBoard;
