export type TileStatusKey = "correct" | "wrong-position" | "not-in-word";
export type TileScheme = "normal" | "highContrast";

interface TileColorTokens {
  bg: string;
  text: string;
  border: string;
  darkBg?: string;
  darkText?: string;
  darkBorder?: string;
  darkShadow?: string;
  // Overrides for the on-screen keyboard only, when it needs a dimmer dark
  // treatment than the tile face (e.g. a "ruled out" key vs. an idle one).
  // Falls back to darkBg/darkText when unset.
  keyDarkBg?: string;
  keyDarkText?: string;
}

export const TILE_COLORS: Record<TileScheme, Record<TileStatusKey, TileColorTokens>> = {
  normal: {
    correct: {
      bg: "bg-green-500",
      text: "text-white",
      border: "border-green-500",
      darkBg: "dark:bg-[#00F0FF]",
      darkText: "dark:text-[#0B0C10]",
      darkBorder: "dark:border-[#00F0FF]",
      darkShadow: "dark:shadow-[0_0_15px_rgba(0,240,255,0.6)]",
    },
    "wrong-position": {
      bg: "bg-yellow-500",
      text: "text-white",
      border: "border-yellow-500",
      darkBg: "dark:bg-[#8A00E6]",
      darkText: "dark:text-white",
      darkBorder: "dark:border-[#8A00E6]",
      darkShadow: "dark:shadow-[0_0_15px_rgba(138,0,230,0.6)]",
    },
    "not-in-word": {
      bg: "bg-stone-400",
      text: "text-white",
      border: "border-stone-400",
      darkBg: "dark:bg-[#1C1C24]",
      darkText: "dark:text-[#6E6F7B]",
      darkBorder: "dark:border-transparent",
      keyDarkBg: "dark:bg-[#13141F]",
      keyDarkText: "dark:text-zinc-500",
    },
  },
  highContrast: {
    correct: {
      bg: "bg-orange-500",
      text: "text-white",
      border: "border-orange-500",
    },
    "wrong-position": {
      bg: "bg-blue-500",
      text: "text-white",
      border: "border-blue-500",
    },
    "not-in-word": {
      bg: "bg-neutral-600",
      text: "text-white",
      border: "border-neutral-600",
    },
  },
};

export function resolveTileScheme(isHighContrast: boolean): TileScheme {
  return isHighContrast ? "highContrast" : "normal";
}

const joinClasses = (...parts: (string | undefined | false)[]) =>
  parts.filter(Boolean).join(" ");

// Tile faces: full token set, used for the revealed (back) tile face.
export function getTileFaceClass(scheme: TileScheme, status: TileStatusKey): string {
  const t = TILE_COLORS[scheme][status];
  return joinClasses(t.bg, t.text, t.border, t.darkBg, t.darkText, t.darkBorder, t.darkShadow);
}

// How-to-play legend swatches: bg/text/dark shadow, no border.
export function getTileSwatchClass(scheme: TileScheme, status: TileStatusKey): string {
  const t = TILE_COLORS[scheme][status];
  return joinClasses(t.bg, t.text, t.darkBg, t.darkText, t.darkShadow);
}

// On-screen keyboard keys: bg/text/border + a hover state matching bg, dark bg/text only.
export function getKeyClass(scheme: TileScheme, status: TileStatusKey): string {
  const t = TILE_COLORS[scheme][status];
  const hoverBg = t.bg.replace(/^bg-/, "hover:bg-");
  return joinClasses(t.bg, t.text, t.border, hoverBg, t.keyDarkBg ?? t.darkBg, t.keyDarkText ?? t.darkText);
}
