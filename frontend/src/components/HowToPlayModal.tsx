import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Lock, ListX } from "lucide-react";
import { useHighContrast } from "../hooks/useHighContrast";
import { resolveTileScheme, getTileSwatchClass, type TileScheme, type TileStatusKey } from "../lib/tileColors";

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TileColor = TileStatusKey;

const TileExample = ({
  letter,
  color,
  label,
  description,
  scheme,
}: {
  letter: string;
  color: TileColor;
  label: string;
  description: string;
  scheme: TileScheme;
}) => {
  const colorClass = getTileSwatchClass(scheme, color);

  return (
    <div className="flex items-center gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-lg font-bold ${colorClass}`}
      >
        {letter}
      </div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-sm text-muted-foreground dark:text-zinc-400">{description}</p>
      </div>
    </div>
  );
};

const HardModeRule = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground dark:bg-[#1C1C24] dark:text-zinc-300">
        {icon}
      </div>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground dark:text-zinc-400">{description}</p>
      </div>
    </div>
  );
};

const HowToPlayModal = ({ isOpen, onClose }: HowToPlayModalProps) => {
  const { isHighContrast } = useHighContrast();
  const scheme = resolveTileScheme(isHighContrast);
  const [page, setPage] = useState(0);
  const prevIsOpenRef = useRef(isOpen);

  useEffect(() => {
    if (prevIsOpenRef.current && !isOpen) {
      setPage(0);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const exampleColors: TileColor[] = ["not-in-word", "wrong-position", "correct", "not-in-word", "not-in-word"];

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="fixed inset-0 bg-[var(--modal-overlay)]/80 backdrop-blur-sm dark:bg-[#0B0C10]/80" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={page === 0 ? "How to Play" : "Hard Mode Rules"}
        className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm dark:bg-[#13141F] dark:border-[#1E1F2F] dark:text-[#F4F6F9]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 cursor-pointer text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {page === 0 ? (
          <>
            <h2 className="text-2xl font-bold tracking-tight">How to Play</h2>
            <p className="mt-2 text-muted-foreground dark:text-zinc-400">
              Guess the five-letter word in six attempts.
            </p>

            <div className="mt-6 space-y-4">
              <TileExample
                letter="M"
                color="correct"
                label="Correct Spot"
                description="The letter is in the word and in the correct position."
                scheme={scheme}
              />
              <TileExample
                letter="O"
                color="wrong-position"
                label="Wrong Spot"
                description="The letter is in the word but in a different position."
                scheme={scheme}
              />
              <TileExample
                letter="X"
                color="not-in-word"
                label="Not in Word"
                description="The letter is not part of the hidden word at all."
                scheme={scheme}
              />
            </div>

            <div className="mt-6 flex items-center justify-center gap-2">
              {["W", "O", "R", "D", "Y"].map((letter, i) => (
                <div
                  key={i}
                  className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold ${getTileSwatchClass(scheme, exampleColors[i])}`}
                >
                  {letter}
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold tracking-tight">Hard Mode</h2>
            <p className="mt-2 text-muted-foreground dark:text-zinc-400">
              Enable hard mode before your first guess to activate these rules:
            </p>

            <div className="mt-6 space-y-4">
              <HardModeRule
                icon={<Lock size={20} />}
                title="Fixed Letters"
                description="Green tiles must stay in their exact position in subsequent guesses."
              />
              <HardModeRule
                icon={
                  <div className="flex gap-0.5">
                    {["A", "B"].map((l, i) => (
                      <div
                        key={i}
                        className={`flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold ${i === 0 ? getTileSwatchClass(scheme, "wrong-position") : "bg-muted text-muted-foreground dark:bg-[#1C1C24] dark:text-zinc-300"}`}
                      >
                        {l}
                      </div>
                    ))}
                  </div>
                }
                title="Include Letters"
                description="Yellow tiles must appear somewhere in your guess."
              />
              <HardModeRule
                icon={<ListX size={20} />}
                title="No Eliminated Letters"
                description="Gray tiles cannot be used in future guesses."
              />
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={() => setPage(0)}
            disabled={page === 0}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(0)}
              className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${page === 0 ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
              aria-label="Go to page 1"
            />
            <button
              onClick={() => setPage(1)}
              className={`h-2 w-2 cursor-pointer rounded-full transition-colors ${page === 1 ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
              aria-label="Go to page 2"
            />
          </div>

          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default HowToPlayModal;
