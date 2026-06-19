import Header from "./components/Header";
import LandingFeatures from "./components/LandingFeatures";
import LandingHero from "./components/LandingHero";
import { Route, Routes } from "react-router";
import GamePage from "./pages/GamePage";

const App = () => {
  return (
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
        </Routes>
      </main>
    </div>
  );
};

export default App;
