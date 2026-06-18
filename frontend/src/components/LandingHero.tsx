import { Button } from "./ui/button";
import { getRandomWord } from "../utils/randomWord";

const progressTiles = [false, false, true, false, false];

// for now console log the random word to the console for new game button
const LandingHero = () => {
  const selectSecretWord = () => {
    const secretWord = getRandomWord();
    console.log("Secret word:", secretWord);
  };

  return (
    <section className="w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:gap-12 lg:px-8 lg:py-16 xl:py-20">
        <div className="flex flex-1 flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <div className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-foreground/70" />
            Live challenge available
          </div>

          <div className="flex flex-col items-center gap-4 lg:items-start">
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              Find your <span className="text-muted-foreground">rhythm</span> in
              every word.
            </h1>

            <p className="max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              A tactile, meditative word experience designed for the modern
              mind. Solve the daily matrix and sharpen your focus in a workspace
              that breathes.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
            <Button
              onClick={selectSecretWord}
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
            >
              Start Game
            </Button>
            <Button
              variant="outline"
              className="h-12 cursor-pointer px-6 text-sm font-semibold uppercase tracking-wide"
            >
              Daily Stats
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {progressTiles.map((isActive, index) => (
              <div
                key={index}
                className={`h-6 w-6 rounded-md border border-foreground/25 ${
                  isActive ? "bg-foreground/25" : "bg-foreground/8"
                }`}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-1 justify-center lg:justify-end">
          <div className="w-full max-w-xl rounded-[2rem] border bg-card p-3 shadow-sm">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border bg-muted/30">
              <img
                src="/heroimage.png"
                alt="MatrixWord hero preview"
                className="h-full w-full object-cover"
              />

              <div className="absolute inset-0 p-4 sm:p-6">
                <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                  <div className="rounded-2xl border border-border/60 bg-background/60 p-3 shadow-sm backdrop-blur-sm sm:p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-muted">
                        <div className="flex h-4 w-4 flex-col items-center justify-center gap-1">
                          <div className="h-1 w-3 rounded-full bg-foreground/60" />
                          <div className="h-1 w-2 rounded-full bg-foreground/40" />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                          Daily Tip
                        </p>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Master the tactile rhythm of every keystroke.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingHero;
