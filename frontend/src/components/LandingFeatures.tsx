const featureCards = [
  {
    title: "Matte Aesthetic",
    description:
      "Calming paper-and-ink tones that are gentle on your eyes for long sessions.",
  },
  {
    title: "Timed Zen",
    description:
      "Choose between competitive timed modes or a relaxed zen experience.",
  },
  {
    title: "Tactile Stats",
    description:
      "Visualize your vocabulary growth with beautiful, minimalist progress charts.",
  },
];

const stats = [
  { value: "1.2M+", label: "puzzles solved" },
  { value: "4.9/5", label: "user rating" },
  { value: "24h", label: "fresh challenges" },
  { value: "Zero", label: "intrusive ads" },
];

const PlaceholderIcon = () => {
  return (
    <div className="flex h-10 w-10 self-center items-center justify-center rounded-lg border bg-muted lg:self-start">
      <div className="grid h-4 w-4 grid-cols-2 gap-0.5">
        <span className="rounded-sm bg-foreground/60" />
        <span className="rounded-sm bg-foreground/40" />
        <span className="rounded-sm bg-foreground/40" />
        <span className="rounded-sm bg-foreground/60" />
      </div>
    </div>
  );
};

const LandingFeatures = () => {
  return (
    <section className="w-full border-t border-border/70 bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Experience Wordplay Differently
          </h2>
          <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
            Focus-driven features designed to reduce digital noise.
          </p>
        </div>

        <div className="flex flex-col items-center gap-4 lg:flex-row lg:items-stretch">
          {featureCards.map((feature) => (
            <div
              key={feature.title}
              className="flex w-full max-w-sm flex-1 flex-col items-center gap-4 rounded-2xl border bg-card p-4 text-center shadow-sm lg:max-w-none lg:items-start lg:p-5 lg:text-left"
            >
              <PlaceholderIcon />
              <div className="space-y-2">
                <h3 className="text-lg font-medium tracking-tight sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-6 text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-6 border-t border-border/70 pt-8 lg:justify-between">
          {stats.map((stat) => (
            <div key={stat.label} className="min-w-30 flex-1 text-center">
              <p className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingFeatures;
