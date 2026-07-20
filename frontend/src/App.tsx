import Header from "./components/Header";
import LandingFeatures from "./components/LandingFeatures";
import LandingHero from "./components/LandingHero";
import { Routes, Route, useLocation } from "react-router-dom";
import GamePage from "./pages/GamePage";
import Footer from "./components/Footer";
import TeamPage from "./pages/TeamPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import HistoryPage from "./pages/HistoryPage";
import { HighContrastProvider } from "./contexts/HighContrastContext";
import { DevModeProvider } from "./contexts/DevModeContext";
import { HardModeProvider } from "./contexts/HardModeContext";
import { useHighContrast } from "./hooks/useHighContrast";

// Reads isHighContrast to pick the outer background, so it must render inside
// HighContrastProvider — a subtle gradient wash normally, but flat when high
// contrast is on since blur/translucency would otherwise fight the point of it.
const AppShell = () => {
  const { isHighContrast } = useHighContrast();
  const location = useLocation();
  // The game screen has its own copyright line below the keyboard and its
  // own links inside the Settings modal, so the full footer would be
  // redundant there — every other screen keeps it as-is.
  const isGameScreen = location.pathname === "/game";

  return (
    <div
      className={`flex min-h-screen flex-col text-foreground ${
        isHighContrast ? "bg-background" : "bg-[image:var(--gradient-app)] bg-fixed"
      }`}
    >
      <Header />
      <main className="flex flex-1 flex-col">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <LandingHero />
                <LandingFeatures />
              </>
            }
          />
          <Route path="/game" element={<GamePage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
      {!isGameScreen && <Footer />}
    </div>
  );
};

const App = () => {
  return (
    <HighContrastProvider>
      <DevModeProvider>
        <HardModeProvider>
          <AppShell />
        </HardModeProvider>
      </DevModeProvider>
    </HighContrastProvider>
  );
};

export default App;
