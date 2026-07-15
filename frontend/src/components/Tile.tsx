import { useHighContrast } from "../hooks/useHighContrast";

export type TileStatus = "correct" | "wrong-position" | "not-in-word" | "";
export type TileVariant = "current" | "past" | "winning" | "empty";

// Exported so GamePage can time the game-over overlay to wait for the full
// staggered flip sequence to finish before appearing.
export const FLIP_DURATION_MS = 300; // keep in sync with duration-300 below
export const FLIP_STAGGER_MS = 150;

const COLOR_CLASSES: Record<"normal" | "highContrast", Record<Exclude<TileStatus, "">, string>> = {
  normal: {
    correct: "bg-green-500 text-white border-green-500 dark:bg-[#00F0FF] dark:text-[#0B0C10] dark:border-[#00F0FF] dark:shadow-[0_0_15px_rgba(0,240,255,0.6)]",
    "wrong-position": "bg-yellow-500 text-white border-yellow-500 dark:bg-[#8A00E6] dark:text-white dark:border-[#8A00E6] dark:shadow-[0_0_15px_rgba(138,0,230,0.6)]",
    "not-in-word": "bg-stone-400 text-white border-stone-400 dark:bg-[#1C1C24] dark:text-[#4A4B53] dark:border-transparent",
  },
  highContrast: {
    correct: "bg-orange-500 text-white border-orange-500",
    "wrong-position": "bg-blue-500 text-white border-blue-500",
    "not-in-word": "bg-neutral-600 text-white border-neutral-600",
  },
};

interface TileProps {
  letter: string;
  status: TileStatus;
  variant: TileVariant;
  colIndex: number;
}

const Tile = ({ letter, status, variant, colIndex }: TileProps) => {
  const { isHighContrast } = useHighContrast();
  const isRevealed = variant === "past" || variant === "winning";

  const tileColorClass = status
    ? COLOR_CLASSES[isHighContrast ? "highContrast" : "normal"][status]
    : "";
  const backBorderClass =
    variant === "winning" ? `${tileColorClass} border-[3px]` : `${tileColorClass} border-2`;
  const frontBorderClass =
    variant === "current"
      ? isHighContrast
        ? "border-[3px] border-foreground/70 dark:border-orange-500 dark:shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:text-foreground dark:bg-transparent"
        : "border-[3px] border-foreground/70 dark:border-[#00F0FF] dark:shadow-[0_0_15px_rgba(0,240,255,0.4)] dark:text-foreground dark:bg-transparent"
      : "border-2 border-foreground/30 dark:border-zinc-800 dark:bg-transparent";

  const ariaLabel = status
    ? `${letter}, ${
        status === "correct"
          ? "correct position"
          : status === "wrong-position"
            ? "wrong position"
            : "not in word"
      }`
    : letter || "empty";

  return (
    <div
      className="relative h-14 w-14 perspective-[300px]"
      aria-label={ariaLabel}
      role="img"
      aria-roledescription="tile"
    >
      <div
        className={`tile-flip relative h-full w-full transform-3d ${isRevealed ? "transition-transform duration-300 rotate-x-180" : ""}`}
        style={isRevealed ? { transitionDelay: `${colIndex * FLIP_STAGGER_MS}ms` } : undefined}
      >
        {/* front face — unrevealed */}
        <div
          className={`tile-front-face absolute inset-0 flex items-center justify-center rounded-md text-2xl font-bold uppercase backface-hidden ${frontBorderClass}`}
          aria-hidden="true"
        >
          {letter}
        </div>
        {/* back face — revealed, colored */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-md text-2xl font-bold uppercase backface-hidden rotate-x-180 ${backBorderClass}`}
          aria-hidden="true"
        >
          {letter}
          {isHighContrast && status && (
            <span
              className="absolute top-0 right-0 text-[9px] leading-none p-0.5"
              aria-hidden="true"
            >
              {status === "correct" ? "✓" : status === "wrong-position" ? "●" : "✕"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tile;
