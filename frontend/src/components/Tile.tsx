import { useHighContrast } from "../hooks/useHighContrast";

export type TileStatus = "correct" | "wrong-position" | "not-in-word" | "";
export type TileVariant = "current" | "past" | "winning" | "empty";

const FLIP_STAGGER_MS = 150;

interface TileProps {
  letter: string;
  status: TileStatus;
  variant: TileVariant;
  colIndex: number;
}

const Tile = ({ letter, status, variant, colIndex }: TileProps) => {
  const { isHighContrast } = useHighContrast();
  const isRevealed = variant === "past" || variant === "winning";

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
  const backBorderClass =
    variant === "winning" ? `${tileColorClass} border-[3px]` : `${tileColorClass} border-2`;
  const frontBorderClass =
    variant === "current"
      ? "border-[3px] border-foreground/70"
      : "border-2 border-foreground/30";

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
    <div className="relative h-14 w-14 perspective-[300px]" aria-label={ariaLabel}>
      <div
        className={`tile-flip relative h-full w-full transition-transform duration-300 transform-3d ${isRevealed ? "rotate-x-180" : ""}`}
        style={isRevealed ? { transitionDelay: `${colIndex * FLIP_STAGGER_MS}ms` } : undefined}
      >
        {/* front face — unrevealed */}
        <div
          className={`absolute inset-0 flex items-center justify-center rounded-md text-2xl font-bold uppercase backface-hidden ${frontBorderClass}`}
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
