const palettes = [
  {
    name: "1. Coral + Navy",
    colors: [
      { hex: "#E07A5F", label: "Coral 600" },
      { hex: "#F4978E", label: "Coral 400" },
      { hex: "#F4C7AB", label: "Coral 200" },
      { hex: "#3D405B", label: "Navy 800" },
      { hex: "#545A7A", label: "Navy 600" },
      { hex: "#8B8FA8", label: "Navy 400" },
    ],
    hero: { primary: "#E07A5F", secondary: "#3D405B" },
  },
  {
    name: "2. Indigo + Rose",
    colors: [
      { hex: "#3730A3", label: "Indigo 800" },
      { hex: "#4338CA", label: "Indigo 700" },
      { hex: "#818CF8", label: "Indigo 400" },
      { hex: "#BE185D", label: "Rose 700" },
      { hex: "#EC4899", label: "Rose 500" },
      { hex: "#F9A8D4", label: "Rose 300" },
    ],
    hero: { primary: "#4338CA", secondary: "#EC4899" },
  },
  {
    name: "3. Ocean + Mint",
    colors: [
      { hex: "#075985", label: "Ocean 800" },
      { hex: "#0284C7", label: "Ocean 600" },
      { hex: "#7DD3FC", label: "Ocean 400" },
      { hex: "#047857", label: "Mint 700" },
      { hex: "#10B981", label: "Mint 500" },
      { hex: "#6EE7B7", label: "Mint 300" },
    ],
    hero: { primary: "#0284C7", secondary: "#10B981" },
  },
  {
    name: "4. Rose + Slate",
    colors: [
      { hex: "#BE123C", label: "Rose 700" },
      { hex: "#E11D48", label: "Rose 600" },
      { hex: "#FB7185", label: "Rose 400" },
      { hex: "#334155", label: "Slate 700" },
      { hex: "#475569", label: "Slate 600" },
      { hex: "#94A3B8", label: "Slate 400" },
    ],
    hero: { primary: "#E11D48", secondary: "#475569" },
  },
  {
    name: "5. Rust + Cream",
    colors: [
      { hex: "#9A3412", label: "Rust 800" },
      { hex: "#C2410C", label: "Rust 600" },
      { hex: "#FB923C", label: "Rust 400" },
      { hex: "#FEF3C7", label: "Cream 200" },
      { hex: "#FEF9C3", label: "Cream 100" },
      { hex: "#FFFBEB", label: "Cream 50" },
    ],
    hero: { primary: "#C2410C", secondary: "#FEF3C7" },
  },
];

const Swatch = ({ hex, label }: { hex: string; label: string }) => (
  <div className="flex flex-col items-center gap-1.5">
    <div
      className="h-16 w-16 rounded-xl shadow-md border border-black/5"
      style={{ backgroundColor: hex }}
    />
    <span className="text-[10px] font-mono text-muted-foreground">{hex}</span>
    <span className="text-[10px] text-muted-foreground">{label}</span>
  </div>
);

const HeroPreview = ({
  primary,
  secondary,
}: {
  primary: string;
  secondary: string;
}) => (
  <div className="mt-4 flex flex-col items-center gap-2">
    <div className="flex items-center gap-0.5">
      <span
        className="text-3xl font-black tracking-widest uppercase"
        style={{ color: primary }}
      >
        Wordle
      </span>
      <span
        className="text-3xl font-black tracking-widest uppercase"
        style={{ color: secondary }}
      >
        -ish
      </span>
    </div>
    <div className="flex gap-1">
      <div
        className="h-3 w-6 rounded-sm"
        style={{ backgroundColor: primary }}
      />
      <div
        className="h-3 w-6 rounded-sm"
        style={{ backgroundColor: secondary }}
      />
    </div>
  </div>
);

export default function PalettesPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 px-4 py-10">
      <h1 className="text-center text-2xl font-bold tracking-tight">
        Theme Palettes
      </h1>

      {palettes.map((palette) => (
        <div
          key={palette.name}
          className="rounded-2xl border border-border bg-card/60 p-6 shadow-sm"
        >
          <h2 className="mb-4 text-lg font-semibold">{palette.name}</h2>

          <div className="flex flex-wrap justify-center gap-4">
            {palette.colors.map((c) => (
              <Swatch key={c.hex + c.label} hex={c.hex} label={c.label} />
            ))}
          </div>

          <HeroPreview
            primary={palette.hero.primary}
            secondary={palette.hero.secondary}
          />
        </div>
      ))}
    </div>
  );
}
