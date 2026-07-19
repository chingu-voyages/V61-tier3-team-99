import { useState } from "react";
import { Button } from "./ui/button";
import LiveChallengeBadge from "./LiveChallengeBadge";
import DailyChallengeBadge from "./DailyChallengeBadge";
import { getRandomWord } from "../utils/randomWord";
import { fetchRandomWord } from "../lib/api";
import {
  HOURLY_GAME_CONFIG,
  DAILY_GAME_CONFIG,
  INFINITY_SIX_GAME_CONFIG,
  type GameConfig,
} from "../config/gameConfig";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [showInfinityOptions, setShowInfinityOptions] = useState(false);

  const openInfinityOptions = () => setShowInfinityOptions(true);
  const backToMainOptions = () => setShowInfinityOptions(false);

  const startInfinityFiveLetter = async () => {
    setIsStarting(true);
    const config: GameConfig = {
      wordLength: 5,
      maxGuesses: 6,
      mode: "infinity",
    };
    let secretWord: string;
    try {
      secretWord = await fetchRandomWord(config.wordLength);
    } catch {
      // Backend unreachable or unseeded — fall back to the client-side pool
      secretWord = getRandomWord(config.wordLength);
    }
    // ?length=5 (like ?mode=hourly/daily below) lets this survive a hard
    // refresh once on /game — router state alone doesn't.
    navigate(`/game?length=${config.wordLength}`, { state: { secretWord, config } });
  };

  const startInfinitySixLetter = async () => {
    setIsStarting(true);
    const config: GameConfig = INFINITY_SIX_GAME_CONFIG;
    let secretWord: string;
    try {
      secretWord = await fetchRandomWord(config.wordLength);
    } catch {
      // Backend unreachable or unseeded — fall back to the client-side pool
      secretWord = getRandomWord(config.wordLength);
    }
    navigate(`/game?length=${config.wordLength}`, { state: { secretWord, config } });
  };

  const startLiveChallenge = () => {
    // No secretWord in state — GamePage resolves it itself, either from a
    // stored attempt for the current hour (fresh/resumed/read-only replay)
    // or by fetching the shared word for this hour from the backend. The
    // ?mode=hourly query param (not just router state) is what lets this
    // survive a hard refresh once on /game.
    navigate("/game?mode=hourly", { state: { config: HOURLY_GAME_CONFIG } });
  };

  const startDailyChallenge = () => {
    // Same pattern as startLiveChallenge: GamePage resolves the actual word
    // itself (stored attempt for today, or a fresh fetch), and ?mode=daily
    // is what lets this survive a hard refresh once on /game.
    navigate("/game?mode=daily", { state: { config: DAILY_GAME_CONFIG } });
  };

  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-8 px-4 py-16 text-center sm:px-6 lg:py-24">
        <h1 className="text-4xl font-bold tracking-widest uppercase sm:text-5xl lg:text-6xl">
          <span className="text-[var(--accent-primary)] dark:text-[#00F0FF]">Wordle</span>
          <span className="text-[var(--accent-secondary)] dark:text-[#8A00E6]">-ish</span>
        </h1>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <DailyChallengeBadge />
          <LiveChallengeBadge />
        </div>

        {!showInfinityOptions ? (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              onClick={startDailyChallenge}
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
            >
              Daily Word
            </Button>
            <Button
              onClick={startLiveChallenge}
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
            >
              Hourly Word
            </Button>
            <Button
              onClick={openInfinityOptions}
              variant="outline"
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide hover:bg-foreground/[0.12] hover:text-foreground"
            >
              Infinity Mode
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button
                onClick={startInfinityFiveLetter}
                disabled={isStarting}
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide hover:bg-foreground/10"
              >
                {isStarting ? "Starting…" : "5 Letter"}
              </Button>
              <Button
                onClick={startInfinitySixLetter}
                disabled={isStarting}
                variant="outline"
                className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
              >
                {isStarting ? "Starting…" : "6 Letter"}
              </Button>
            </div>

            <Button
              onClick={backToMainOptions}
              variant="ghost"
              size="sm"
              className="cursor-pointer text-xs text-muted-foreground"
            >
              ← Back
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingHero;
