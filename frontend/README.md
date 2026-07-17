# frontend

React + Vite + TypeScript single-page app for Wordle-ish. For features, tech stack, and how to run this locally against Supabase, see the [root README](../README.md).

## `src/` layout

| Directory | Contents |
| :--- | :--- |
| `pages/` | Route-level views: `GamePage`, `HistoryPage`, `LeaderboardPage`, `TeamPage` |
| `components/` | Reusable UI: `GameBoard`, `Tile`, `Header`, `Footer`, modals (`SettingsModal`, `StatsModal`, `HowToPlayModal`), badges (`DailyChallengeBadge`, `LiveChallengeBadge`), landing sections |
| `components/ui/` | Low-level UI primitives (currently just `button.tsx`) |
| `contexts/` | React context providers — `AuthContext`, `HardModeContext`, `HighContrastContext`, `DevModeContext` — each paired with a plain `*-context.ts` file holding just the context object, so components can import the context without pulling in the provider |
| `hooks/` | Custom hooks, mostly one per context/feature: `useAuth`, `useHardMode`, `useHighContrast`, `useDevMode`, `useDailyChallenge`, `useHourlyChallenge`, `useCountdown`, `useDarkMode` |
| `lib/` | Supabase client (`supabaseClient.ts`) and RPC wrapper modules: `api.ts`, `leaderboard.ts`, `dailyStats.ts`, `globalStats.ts`, `gameHistory.ts`, `statsUtils.ts`, `hourlyStorage.ts`, `dailyStorage.ts` |
| `data/` | Word lists — `answers-5.ts` and `valid-guesses-5.ts` are generated from `backend/node/db/words/*.txt` (do not hand-edit); `words.ts` is the client-side fallback used when Supabase isn't configured |
| `utils/` | Misc helpers: `timezone.ts`, `randomWord.ts`, `validateHardMode.ts` |
| `config/` | `gameConfig.ts`, `devMode.ts` |
