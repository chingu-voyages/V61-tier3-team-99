import { useState } from "react";
import { Button } from "./ui/button";
import LiveChallengeBadge from "./LiveChallengeBadge";
import DailyChallengeBadge from "./DailyChallengeBadge";
import { getRandomWord } from "../utils/randomWord";
import { fetchRandomWord } from "../lib/api";
import {
  HOURLY_GAME_CONFIG,
  DAILY_GAME_CONFIG,
  type GameConfig,
} from "../config/gameConfig";
import { useLocation, useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isStarting, setIsStarting] = useState(false);
  // Lets GamePage's Hard Mode "Change" link land straight back on this
  // sub-screen instead of the default three-button view.
  const [showInfinityOptions, setShowInfinityOptions] = useState(
    () => location.state?.openInfinityOptions ?? false,
  );
  const [infinityHardMode, setInfinityHardMode] = useState(false);

  const openInfinityOptions = () => setShowInfinityOptions(true);
  const backToMainOptions = () => setShowInfinityOptions(false);

  const startInfinityFiveLetter = async () => {
    setIsStarting(true);
    const config: GameConfig = {
      wordLength: 5,
      maxGuesses: 6,
      mode: "infinity",
      hardMode: infinityHardMode,
    };
    let secretWord: string;
    try {
      secretWord = await fetchRandomWord(config.wordLength);
    } catch {
      // Backend unreachable or unseeded — fall back to the client-side pool
      secretWord = getRandomWord();
    }
    navigate("/game", { state: { secretWord, config } });
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
          Wordle-ish
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
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
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
                className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
              >
                {isStarting ? "Starting…" : "5 Letter"}
              </Button>
              <div className="group relative">
                <Button
                  disabled
                  variant="outline"
                  className="h-12 cursor-not-allowed px-6 text-sm font-semibold uppercase tracking-wide opacity-50"
                >
                  6 Letter — Coming Soon
                </Button>
                <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-2 py-1 text-xs text-background opacity-0 group-hover:opacity-100">
                  Coming this fall
                </div>
              </div>
            </div>

            {/* Hard mode toggle — relocated from GamePage; chosen here before
                starting since there's no way to change it mid-game anymore. */}
            <button
              role="switch"
              aria-checked={infinityHardMode}
              onClick={() => setInfinityHardMode((prev) => !prev)}
              className="flex items-center gap-2 text-sm cursor-pointer select-none"
            >
              <span
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                  infinityHardMode ? "bg-foreground" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ${
                    infinityHardMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
              <span
                className={
                  infinityHardMode
                    ? "text-foreground font-medium"
                    : "text-muted-foreground"
                }
              >
                Hard mode
              </span>
            </button>

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
