import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useHighContrast } from "../hooks/useHighContrast";
import type { GameHistoryEntry } from "../lib/gameHistory";

const getTileStatuses = (
  guess: string[],
  secret: string,
  wordLength: number,
): ("correct" | "wrong-position" | "not-in-word")[] => {
  const secretUpper = secret.toUpperCase();
  const remaining = secretUpper.split("");
  const statuses: ("correct" | "wrong-position" | "not-in-word")[] =
    new Array(wordLength).fill("not-in-word");

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
    }
  }

  return statuses;
};

const formatRelativeDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
};

const GameHistoryItem = ({ entry }: { entry: GameHistoryEntry }) => {
  const [expanded, setExpanded] = useState(false);
  const { isHighContrast } = useHighContrast();

  const wordLength = entry.word.length;
  const guessCount = entry.guesses.length;
  const maxGuesses = 6;

  const emojiMap = isHighContrast
    ? { correct: "🟧", "wrong-position": "🟦", "not-in-word": "⬛" }
    : { correct: "🟩", "wrong-position": "🟨", "not-in-word": "⬜" };

  const emojiGrid = entry.guesses.map((guess) => {
    const statuses = getTileStatuses(
      guess.toUpperCase().split(""),
      entry.word.toUpperCase(),
      wordLength,
    );
    return statuses.map((s) => emojiMap[s]).join("");
  });

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer"
      >
        {expanded ? (
          <ChevronDown size={16} className="text-muted-foreground shrink-0" />
        ) : (
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        )}
        <span
          className={`font-mono font-bold ${
            entry.won ? "text-green-600" : "text-red-600"
          }`}
        >
          {entry.word.toUpperCase()}
        </span>
        <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground uppercase tracking-wide">
          {entry.mode === "hourly" ? "Hourly" : "Infinity"}
        </span>
        <span className="text-sm text-muted-foreground">
          {entry.won ? `Won in ${guessCount}/${maxGuesses}` : `Lost`}
        </span>
        {entry.created_at && (
          <span className="ml-auto text-xs text-muted-foreground">
            {formatRelativeDate(entry.created_at)}
          </span>
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-3 pt-1 border-t border-border/50">
          <div className="font-mono text-sm leading-relaxed">
            {emojiGrid.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHistoryItem;
