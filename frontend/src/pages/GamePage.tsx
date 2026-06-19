import { useLocation } from "react-router";

type SecretWordLocationState = {
  secretWord?: string;
};

const GamePage = () => {
  const location = useLocation();
  const locationState = location.state as SecretWordLocationState | null;
  const secretWord = locationState?.secretWord;

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
      <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
        New Game Page
      </h2>
      <p className="mt-3 text-sm text-muted-foreground sm:text-base">
        Secret Word (temporarily here for demo only) = {secretWord ?? "N/A"}
      </p>
    </section>
  );
};

export default GamePage;
