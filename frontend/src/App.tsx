import Header from "./components/Header";
import LandingFeatures from "./components/LandingFeatures";
import LandingHero from "./components/LandingHero";

const App = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="flex flex-1 flex-col">
        <LandingHero />
        <LandingFeatures />
      </main>
    </div>
  );
};

export default App;
