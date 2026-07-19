import { useHighContrast } from "../hooks/useHighContrast";
import { resolveTileScheme, getTileFaceClass } from "../lib/tileColors";

export type TileStatus = "correct" | "wrong-position" | "not-in-word" | "";
export type TileVariant = "current" | "past" | "winning" | "empty";

// Exported so GamePage can time the game-over overlay to wait for the full
// staggered flip sequence to finish before appearing.
export const FLIP_DURATION_MS = 300; // keep in sync with duration-300 below
export const FLIP_STAGGER_MS = 150;

// Glass tint for the unrevealed tile face — skipped under high contrast,
// since blur/translucency would reduce the contrast that mode exists for.
const FRONT_FACE_GLASS = "bg-card/25 backdrop-blur-sm backdrop-saturate-150";

interface TileProps {
  letter: string;
  status: TileStatus;
  variant: TileVariant;
  colIndex: number;
}

const Tile = ({ letter, status, variant, colIndex }: TileProps) => {
  const { isHighContrast } = useHighContrast();
  const scheme = resolveTileScheme(isHighContrast);
  const isRevealed = variant === "past" || variant === "winning";

  const tileColorClass = status ? getTileFaceClass(scheme, status) : "";
  const backBorderClass =
    variant === "winning" ? `${tileColorClass} border-[3px]` : `${tileColorClass} border-2`;
  const frontFaceBg = isHighContrast ? "bg-transparent dark:bg-transparent" : FRONT_FACE_GLASS;
  const frontBorderClass =
    variant === "current"
      ? isHighContrast
        ? `border-[3px] border-foreground/70 dark:border-orange-500 dark:shadow-[0_0_15px_rgba(249,115,22,0.3)] dark:text-foreground ${frontFaceBg}`
        : `border-[3px] border-foreground/70 dark:border-[#00F0FF] dark:shadow-[0_0_15px_rgba(0,240,255,0.4)] dark:text-foreground ${frontFaceBg}`
      : `border-2 border-foreground/30 dark:border-zinc-800 ${frontFaceBg}`;

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
