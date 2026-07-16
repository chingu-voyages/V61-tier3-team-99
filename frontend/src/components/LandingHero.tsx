import { useState } from "react";
import { Button } from "./ui/button";
import LiveChallengeBadge from "./LiveChallengeBadge";
import DailyChallengeBadge from "./DailyChallengeBadge";
import { getRandomWord } from "../utils/randomWord";
import { fetchRandomWord } from "../lib/api";
import {
  DEFAULT_GAME_CONFIG,
  HOURLY_GAME_CONFIG,
  DAILY_GAME_CONFIG,
} from "../config/gameConfig";
import { useNavigate } from "react-router-dom";

const LandingHero = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);

  const startInfinityMode = async () => {
    setIsStarting(true);
    let secretWord: string;
    try {
      secretWord = await fetchRandomWord(DEFAULT_GAME_CONFIG.wordLength);
    } catch {
      // Backend unreachable or unseeded — fall back to the client-side pool
      secretWord = getRandomWord();
    }
    navigate("/game", { state: { secretWord, config: DEFAULT_GAME_CONFIG } });
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
          <LiveChallengeBadge />
          <DailyChallengeBadge />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            onClick={startLiveChallenge}
            className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
          >
            Live Challenge
          </Button>
          <Button
            onClick={startDailyChallenge}
            className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
          >
            Daily Puzzle
          </Button>
          <Button
            onClick={startInfinityMode}
            disabled={isStarting}
            variant="outline"
            className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
          >
            {isStarting ? "Starting…" : "Infinity Mode"}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
