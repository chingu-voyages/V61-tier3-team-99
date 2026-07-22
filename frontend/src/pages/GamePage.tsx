import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import { History, Share2 } from "lucide-react";
import { Button } from "../components/ui/button";
import { getValidGuessSet } from "../data/words";
import {
  DEFAULT_GAME_CONFIG,
  HOURLY_GAME_CONFIG,
  DAILY_GAME_CONFIG,
  INFINITY_SIX_GAME_CONFIG,
  type GameConfig,
} from "../config/gameConfig";
import { submitResult } from "../lib/leaderboard";
import { fetchRandomWord, fetchHourlyWord, fetchDailyWord } from "../lib/api";
import { getRandomWord } from "../utils/randomWord";
import { getUtcOffsetSeconds } from "../utils/timezone";
import { useHighContrast } from "../hooks/useHighContrast";
import { useHardMode } from "../hooks/useHardMode";
import { resolveTileScheme, getKeyClass as getKeyColorClass } from "../lib/tileColors";
import { useAuth } from "../hooks/useAuth";
import { useDevMode } from "../hooks/useDevMode";
import { isDevModeAllowed } from "../config/devMode";
import { getHourlyRecord, saveHourlyRecord } from "../lib/hourlyStorage";
import { getDailyRecord, saveDailyRecord } from "../lib/dailyStorage";
import { useCountdown } from "../hooks/useCountdown";
import {
  fetchDailyPuzzleStats,
  recordDailyPuzzleResult,
  type DailyPuzzleStats,
} from "../lib/dailyStats";
import GameBoard from "../components/GameBoard";
import { FLIP_DURATION_MS, FLIP_STAGGER_MS } from "../components/Tile";
import { validateHardModeGuess } from "../utils/validateHardMode";
import StatsModal from "../components/StatsModal";
import { saveGameResult } from "../lib/statsUtils";
import { saveGameHistory } from "../lib/gameHistory";

interface GameStats {
  games_played: number;
  games_won: number;
  current_streak: number;
  max_streak: number;
  guess_distribution: number[];
}

const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
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
    ? {
        correct: "🟧" as const,
        "wrong-position": "🟦" as const,
        "not-in-word": "⬛" as const,
      }
    : {
        correct: "🟩" as const,
        "wrong-position": "🟨" as const,
        "not-in-word": "⬜" as const,
      };

  for (const statuses of guessesStatuses) {
    lines.push(
      statuses
        .map((s) => emojiMap[s as keyof typeof emojiMap] ?? "⬜")
        .join(""),
    );
  }

  return lines.join("\n");
};

const GamePage = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  // A hard refresh loses router state, so ?mode=hourly/daily (set by the
  // Live Challenge / Daily Puzzle buttons) is what lets periodic modes
  // survive a real page reload — router state alone only survives
  // client-side navigation.
  const config: GameConfig =
    location.state?.config ??
    (searchParams.get("mode") === "hourly"
      ? HOURLY_GAME_CONFIG
      : searchParams.get("mode") === "daily"
        ? DAILY_GAME_CONFIG
        : searchParams.get("length") === "6"
          ? INFINITY_SIX_GAME_CONFIG
          : DEFAULT_GAME_CONFIG);
  const isHourlyMode = config.mode === "hourly";
  const isDailyMode = config.mode === "daily";
  const isPeriodicMode = isHourlyMode || isDailyMode;
  const { wordLength: WORD_LENGTH, maxGuesses: MAX_GUESSES } = config;

  const [secretWord, setSecretWord] = useState<string>(() =>
    isPeriodicMode ? "" : (location.state?.secretWord ?? ""),
  );
  // Stays null until the server confirms the current hour/day bucket (see
  // the hydration effect below) — the client clock can't be trusted for
  // this, so nothing reads/writes localStorage until we have the real
  // value. Shared by both periodic modes since a session is only ever in
  // one mode at a time.
  const [periodBucket, setPeriodBucket] = useState<number | null>(null);
  const [isReadOnlyReplay, setIsReadOnlyReplay] = useState(false);
  const [periodicLoadError, setPeriodicLoadError] = useState<string | null>(
    null,
  );
  const [dailyPuzzleStats, setDailyPuzzleStats] =
    useState<DailyPuzzleStats | null>(null);

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
  const { user } = useAuth();
  const { enabled: devModeEnabled } = useDevMode();
  const canPreview = devModeEnabled && isDevModeAllowed(user?.user_metadata?.user_name);
  const [showSecretPreview, setShowSecretPreview] = useState(false);
  const { enabled: hardModeSetting } = useHardMode();
  // Tracks the live Settings toggle only until the first guess is
  // submitted — flipping Hard Mode mid-game must not retroactively change
  // enforcement once guesses are in flight (mirrors the old per-game
  // toggle's post-first-guess lock), but before any guess exists there's
  // nothing to protect yet, so it stays live and locks in automatically
  // the moment guesses.length leaves 0. Also re-unlocks on "new game"
  // (handleNewGame resets guesses to []), so the next round picks up
  // whatever the setting is at that point. Set during render (React's
  // documented "adjust state when a value changes" pattern) rather than
  // in an effect, so there's no extra cascading re-render.
  const [hardMode, setHardMode] = useState(hardModeSetting);
  if (guesses.length === 0 && hardMode !== hardModeSetting) {
    setHardMode(hardModeSetting);
  }
  const [copied, setCopied] = useState(false);
  const [latestStats, setLatestStats] = useState<GameStats | null>(null);
  const [statsModalOpen, setStatsModalOpen] = useState(false);
  const shareTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const shakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so handleKeyPress never needs to change, avoiding listener churn on every keystroke
  const currentGuessRef = useRef(currentGuess);
  const guessesRef = useRef(guesses);
  const gameWonRef = useRef(gameWon);
  const secretWordRef = useRef(secretWord);
  const revealedGuessCountRef = useRef(revealedGuessCount);
  const hardModeRef = useRef(hardMode);
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
  useEffect(() => {
    hardModeRef.current = hardMode;
  }, [hardMode]);

  // Wait for the board's staggered tile flip to fully finish, plus a short
  // extra beat so the keys' new colors are visible before the keyboard
  // itself starts flipping over, then wait for that flip to finish before
  // showing the overlay — a longer word takes longer for its last tile
  // column to reveal, so this is word-length aware rather than fixed.
  // Skipped for a completed Hourly replay — that case is handled by the
  // hydration bypass below, which sets both instantly with no animation.
  useEffect(() => {
    if ((gameWon || guesses.length >= MAX_GUESSES) && !isReadOnlyReplay) {
      const tileFlipSequenceMs =
        (WORD_LENGTH - 1) * FLIP_STAGGER_MS + FLIP_DURATION_MS;
      const keyboardFlipDelayMs =
        tileFlipSequenceMs + KEYBOARD_FLIP_EXTRA_DELAY_MS;
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
  }, [gameWon, guesses.length, MAX_GUESSES, WORD_LENGTH, isReadOnlyReplay]);

  // Every submitted guess reveals its letters on the on-screen keyboard only
  // once that row's own tile flip finishes — not the instant it's submitted
  // — so a key never turns color ahead of the tile that justified it.
  // (Resetting to 0 for a new game happens synchronously in handleNewGame;
  // this timer re-confirming 0 afterward is a harmless no-op. Hourly mode's
  // hydration bypasses this timer entirely — see that effect below — since
  // guesses loaded from a previous session have nothing left to "reveal.")
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

  const validGuessSet = useMemo(
    () => getValidGuessSet(WORD_LENGTH),
    [WORD_LENGTH],
  );

  const getKeyClass = useCallback(
    (key: string) => {
      if (key === "ENTER" || key === "⌫") return "";
      const status = letterStatuses[key];
      if (!status) return "";
      const scheme = resolveTileScheme(isHighContrast);
      return getKeyColorClass(scheme, status);
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
          if (!validGuessSet.has(word)) {
            triggerInvalid(allGuesses.length, "Not in word list");
            return;
          }
          if (hardModeRef.current) {
            const allStatuses = allGuesses.map((g) =>
              getTileStatuses(g, secretWordRef.current, WORD_LENGTH),
            );
            const violation = validateHardModeGuess(
              guess,
              allGuesses,
              allStatuses,
              WORD_LENGTH,
            );
            if (violation) {
              triggerInvalid(allGuesses.length, violation);
              return;
            }
          }
          setGuesses((prev) => [...prev, guess]);
          if (guess.join("") === secretWordRef.current.toUpperCase()) {
            setGameWon(true);
            if (!hasSubmittedResultRef.current) {
              hasSubmittedResultRef.current = true;
              submitResult(true, config.mode, hardModeRef.current);
              saveGameResult(true, allGuesses.length + 1).then((stats) => {
                if (stats) setLatestStats(stats);
              });
              saveGameHistory(
                secretWordRef.current.toUpperCase(),
                [...allGuesses.map((g) => g.join("")), guess.join("")],
                true,
                config.mode,
                hardModeRef.current,
                user,
              );
              if (isDailyMode) {
                recordDailyPuzzleResult(
                  secretWordRef.current,
                  true,
                  allGuesses.length + 1,
                );
              }
            }
          } else if (allGuesses.length + 1 >= MAX_GUESSES) {
            if (!hasSubmittedResultRef.current) {
              hasSubmittedResultRef.current = true;
              submitResult(false, config.mode, hardModeRef.current);
              saveGameResult(false, allGuesses.length + 1).then((stats) => {
                if (stats) setLatestStats(stats);
              });
              saveGameHistory(
                secretWordRef.current.toUpperCase(),
                [...allGuesses.map((g) => g.join("")), guess.join("")],
                false,
                config.mode,
                hardModeRef.current,
                user,
              );
              if (isDailyMode) {
                recordDailyPuzzleResult(
                  secretWordRef.current,
                  false,
                  allGuesses.length + 1,
                );
              }
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
    [
      triggerInvalid,
      isReadOnlyReplay,
      MAX_GUESSES,
      WORD_LENGTH,
      hardModeRef,
      validGuessSet,
    ],
  );

  const handleNewGame = useCallback(async () => {
    setIsNewGameLoading(true);
    let newWord: string;
    try {
      newWord = await fetchRandomWord(WORD_LENGTH);
    } catch {
      newWord = getRandomWord(WORD_LENGTH);
    }
    setSecretWord(newWord);
    setGuesses([]);
    setCurrentGuess([]);
    setGameWon(false);
    setInvalidMessage(null);
    setShakingRow(null);
    setRevealedGuessCount(0);
    setShowSecretPreview(false);
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
      navigator.clipboard
        .writeText(text)
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
  // leaving the board unplayable. Periodic modes have their own start/resume
  // effect below since they must never hand out a random Infinity word.
  useEffect(() => {
    if (!isPeriodicMode && !secretWord) {
      queueMicrotask(() => handleNewGame());
    }
  }, [secretWord, isPeriodicMode, handleNewGame]);

  // Periodic modes always ask the server which hour/day bucket it is,
  // rather than computing it from the client clock — a skewed client clock
  // would otherwise read/write the wrong localStorage key (a different
  // bucket than the one the server just served), silently wiping progress
  // on refresh or locking a player out of a period they should have access
  // to. Once the server confirms the real bucket, we hydrate from *that*
  // bucket's record: completed → read-only replay, in-progress → resume,
  // absent → fresh game with the word we just fetched. The persistence
  // effect below performs the actual first write once state settles.
  useEffect(() => {
    if (!isPeriodicMode || periodBucket !== null) return;

    let cancelled = false;
    (async () => {
      try {
        let word: string;
        let bucket: number;
        if (isHourlyMode) {
          const result = await fetchHourlyWord(WORD_LENGTH);
          word = result.word;
          bucket = result.hourBucket;
        } else {
          const result = await fetchDailyWord(WORD_LENGTH, getUtcOffsetSeconds());
          word = result.word;
          bucket = result.dayBucket;
        }
        if (cancelled) return;

        const existing = isHourlyMode
          ? getHourlyRecord(bucket)
          : getDailyRecord(bucket);
        if (existing) {
          setSecretWord(existing.secretWord);
          setGuesses(existing.guesses);
          setGameWon(existing.gameWon);
          setIsReadOnlyReplay(existing.completed);
          // These guesses happened in a previous session, so there's
          // nothing left to "reveal" — skip straight to the final state
          // instead of replaying the stagger animation and freezing input
          // while the board "catches up."
          setRevealedGuessCount(existing.guesses.length);
          if (existing.gameWon || existing.guesses.length >= MAX_GUESSES) {
            setKeyboardFlipped(true);
            setShowGameOver(true);
          }
        } else {
          setSecretWord(word);
        }
        setPeriodBucket(bucket);
      } catch {
        if (!cancelled) {
          setPeriodicLoadError(
            isHourlyMode
              ? "Couldn't load the hourly word. Please try again shortly."
              : "Couldn't load today's word. Please try again shortly.",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isPeriodicMode, isHourlyMode, periodBucket, WORD_LENGTH, MAX_GUESSES]);

  // Persist periodic-mode progress after every guess so a mid-attempt
  // refresh resumes instead of rerolling, and so a completed game replays
  // read-only on the next visit within the same period. Skipped while
  // already replaying read-only to avoid rewriting storage with
  // hydration-time state.
  useEffect(() => {
    if (!isPeriodicMode || isReadOnlyReplay || periodBucket === null) return;
    const completed = gameWon || guesses.length >= MAX_GUESSES;
    if (isHourlyMode) {
      saveHourlyRecord({
        hourBucket: periodBucket,
        secretWord,
        guesses,
        gameWon,
        completed,
        resultSubmitted: hasSubmittedResultRef.current,
      });
    } else {
      saveDailyRecord({
        dayBucket: periodBucket,
        secretWord,
        guesses,
        gameWon,
        completed,
        resultSubmitted: hasSubmittedResultRef.current,
      });
    }
  }, [
    isPeriodicMode,
    isHourlyMode,
    isReadOnlyReplay,
    periodBucket,
    secretWord,
    guesses,
    gameWon,
    MAX_GUESSES,
  ]);

  // Fetches how everyone else did on today's specific puzzle (issue #46).
  // Gated to daily mode + game-over so it can never leak difficulty info
  // (e.g. average guesses) before the player has finished on their own.
  useEffect(() => {
    if (!isDailyMode || !showGameOver || !secretWord) return;
    let cancelled = false;
    fetchDailyPuzzleStats(secretWord).then((stats) => {
      if (!cancelled) setDailyPuzzleStats(stats);
    });
    return () => {
      cancelled = true;
    };
  }, [isDailyMode, showGameOver, secretWord]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Enter natively activates whatever button currently has focus (e.g.
      // the dark mode toggle) — skip the game's own Enter handling in that
      // case so one keypress doesn't both flip a setting and submit a guess.
      // Scoped to Enter (not all keys) and to button-like elements only, so
      // clicking an on-screen keyboard key — which focuses it — doesn't
      // block subsequent physical typing.
      if (e.key === "Enter") {
        const target = e.target as HTMLElement | null;
        const isInteractive =
          target?.tagName === "BUTTON" ||
          target?.tagName === "A" ||
          target?.getAttribute("role") === "button";
        if (isInteractive) return;
      }
      handleKeyPress(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  const dailyUtcOffsetSeconds = useMemo(() => getUtcOffsetSeconds(), []);
  const nextPeriodAtMs =
    isHourlyMode && periodBucket !== null
      ? (periodBucket + 1) * HOUR_MS
      : isDailyMode && periodBucket !== null
        ? (periodBucket + 1) * DAY_MS + dailyUtcOffsetSeconds * 1000
        : null;
  const { formatted: nextPeriodFormatted } = useCountdown(nextPeriodAtMs);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-3 py-10">
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

      {periodicLoadError && (
        <p className="text-sm font-semibold text-[var(--error)]">{periodicLoadError}</p>
      )}

      {/* Hard mode is a global Settings preference now, applied to any mode —
          this is just an indicator, not a toggle. */}
      {hardMode && (
        <span className="rounded-full bg-foreground/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-foreground">
          Hard Mode
        </span>
      )}

      {/* Card flip: keyboard flips away, game-over message overlays on top.
          A completed Hourly replay starts with gameWon/guesses already
          hydrated from storage, so it renders flipped from the first paint —
          no separate read-only styling needed on the keyboard itself. */}
      <div className="relative w-full max-w-125 perspective-midrange">
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
                    className={`flex h-12 min-w-0 cursor-pointer touch-manipulation items-center justify-center rounded-md border text-xs font-semibold uppercase transition-colors active:scale-95 active:bg-gray-300 active:border-gray-500 select-none sm:h-14 sm:text-sm ${
                      key === "ENTER" || key === "⌫" ? "flex-[1.6]" : "flex-1"
                    } ${
                      getKeyClass(key) ||
                      (key === "ENTER" || key === "⌫"
                        ? "bg-muted hover:bg-muted/60 " +
                          (isHighContrast
                            ? "dark:bg-orange-500 dark:hover:bg-orange-600 dark:text-white"
                            : "dark:bg-[#8A00E6] dark:text-white dark:hover:bg-[#a11aff]")
                        : "bg-muted hover:bg-muted/60 dark:bg-[#1C1C24] dark:text-white dark:hover:bg-[#252530]")
                    }`}
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
                (gameWon ? "text-[var(--success)]" : "text-[var(--error)]")
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
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="cursor-pointer"
              >
                <Share2 size={16} />
                {copied ? "Copied!" : "Share"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatsModalOpen(true)}
                className="cursor-pointer uppercase tracking-wide"
              >
                Stats
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer uppercase tracking-wide"
                asChild
              >
                <Link to="/history">
                  <History size={16} />
                  History
                </Link>
              </Button>
              {isPeriodicMode ? (
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm text-muted-foreground">
                    Next {isHourlyMode ? "hourly word" : "daily word"} in{" "}
                    <span className="font-mono font-semibold">
                      {nextPeriodFormatted}
                    </span>
                  </p>
                  {isDailyMode && dailyPuzzleStats?.totalWins != null && (
                    <p className="text-xs text-muted-foreground">
                      {dailyPuzzleStats.totalWins} player
                      {dailyPuzzleStats.totalWins === 1 ? "" : "s"} solved
                      today's word
                      {dailyPuzzleStats.averageGuesses != null &&
                        ` · avg ${dailyPuzzleStats.averageGuesses} guesses`}
                    </p>
                  )}
                </div>
              ) : (
                <Button
                  size="sm"
                  onClick={handleNewGame}
                  disabled={isNewGameLoading}
                  className="cursor-pointer uppercase tracking-wide"
                >
                  {isNewGameLoading ? "Loading…" : "New Game"}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer is hidden on this screen (see App.tsx) — this is its
          replacement, since the game board eats the vertical space the
          footer would normally sit below. */}
      <p className="text-xs text-muted-foreground">© {new Date().getFullYear()}</p>

      {canPreview && secretWord && (
        <div className="flex flex-col items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSecretPreview((v) => !v)}
            className="cursor-pointer text-xs"
          >
            {showSecretPreview ? "Hide" : "Preview"} secret word
          </Button>
          {showSecretPreview && (
            <p className="text-xs text-muted-foreground">
              (dev) secret word:{" "}
              <span className="font-mono font-bold">{secretWord}</span>
            </p>
          )}
        </div>
      )}

      <StatsModal
        open={statsModalOpen}
        onClose={() => setStatsModalOpen(false)}
        latestStats={latestStats}
      />
    </div>
  );
};

export default GamePage;
