# frontend

React + Vite + TypeScript single-page app for Wordle-ish. For features, tech stack, and how to run this locally against Supabase, see the [root README](../README.md).

## `src/` layout

| Directory | Contents |
| :--- | :--- |
| `pages/` | Route-level views: `GamePage`, `HistoryPage`, `LeaderboardPage`, `TeamPage`; `PalettesPage` is a color-palette preview, not wired into any route |
| `components/` | Reusable UI: `GameBoard`, `Tile`, `Header`, `Footer`, modals (`SettingsModal`, `StatsModal`, `HowToPlayModal`), badges (`DailyChallengeBadge`, `LiveChallengeBadge`), landing sections |
| `components/ui/` | Low-level UI primitives (currently just `button.tsx`) |
| `contexts/` | React context providers — `AuthContext`, `HardModeContext`, `HighContrastContext`, `DevModeContext` — each paired with a plain `*-context.ts` file holding just the context object, so components can import the context without pulling in the provider |
| `hooks/` | Custom hooks, mostly one per context/feature: `useAuth`, `useHardMode`, `useHighContrast`, `useDevMode`, `useDailyChallenge`, `useHourlyChallenge`, `useCountdown`, `useDarkMode`, `useTheme` (light theme selection: sage/teal/coral/rose/ocean, persisted to `localStorage`) |
| `lib/` | Supabase client (`supabaseClient.ts`) and RPC wrapper modules: `api.ts`, `leaderboard.ts` (per-mode leaderboard + Hard Mode score submission), `dailyStats.ts`, `globalStats.ts`, `gameHistory.ts`, `statsUtils.ts`, `hourlyStorage.ts`, `dailyStorage.ts`, `tileColors.ts` (tile/keyboard color tokens per state, normal + high-contrast) |
| `data/` | Word lists per length — `answers-5.ts`/`valid-guesses-5.ts` and `answers-6.ts`/`valid-guesses-6.ts` are generated from `backend/node/db/words/*.txt` (do not hand-edit); `words.ts` exposes `getAnswerWords(length)`/`getValidGuessSet(length)`, the client-side fallback used for Infinity Mode's random word selection when Supabase isn't configured (Daily and Hourly have no client-side fallback and are simply unavailable without Supabase) |
| `utils/` | Misc helpers: `timezone.ts`, `randomWord.ts` (`getRandomWord(length)`), `validateHardMode.ts` |
| `config/` | `gameConfig.ts` — game mode presets, including `DEFAULT_GAME_CONFIG` (5-letter), `INFINITY_SIX_GAME_CONFIG` (6-letter), `HOURLY_GAME_CONFIG`, `DAILY_GAME_CONFIG`; `devMode.ts` |
