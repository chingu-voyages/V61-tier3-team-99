import Header from "./components/Header";
import LandingFeatures from "./components/LandingFeatures";
import LandingHero from "./components/LandingHero";
import { Routes, Route } from "react-router-dom";
import GamePage from "./pages/GamePage";
import Footer from "./components/Footer";
import TeamPage from "./pages/TeamPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import { HighContrastProvider } from "./contexts/HighContrastContext";
import { DevModeProvider } from "./contexts/DevModeContext";

const App = () => {
  return (
    <HighContrastProvider>
      <DevModeProvider>
        <div className="flex min-h-screen flex-col bg-background text-foreground">
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
            </Routes>
          </main>
          <Footer />
        </div>
      </DevModeProvider>
    </HighContrastProvider>
  );
};

export default App;
