// SeeQL theme registry — 5 hand-tuned themes. Flat by design: no gradients,
// no glows — solid surfaces, hairline borders, one restrained accent each.
//
// How theming works (Tailwind 4): every palette color is a real CSS custom
// property (--color-zinc-900 etc.) that utilities reference, including
// opacity variants via color-mix(). A theme is one class on <html>
// (`.theme-<id>`) that redefines the zinc (surfaces/text) + emerald/teal
// (brand accent) ramps + the shadcn token set — the whole chrome re-skins
// with zero component churn.
//
// Actual color values live in globals.css under the matching class; this
// file is the single source of truth for IDs, names, swatches and whether
// a theme is dark (drives the `dark` class for shadcn dark: variants).
//
// Keep in sync with: globals.css theme blocks + the boot script in
// layout.tsx (generated from this file).

export type ThemeId =
  | "carbon"
  | "paper"
  | "marine"
  | "oxblood"
  | "gallery";

export interface ThemeDef {
  id: ThemeId;
  /** Display name in the switcher. */
  name: string;
  /** One-word persona badge. */
  tag: string;
  /** Short flavor line shown under the name. */
  blurb: string;
  /** Drives the `dark` class on <html> (shadcn dark: variants). */
  dark: boolean;
  /** [background, surface, accent] — flat solid swatches. */
  swatch: [string, string, string];
}

export const THEMES: ThemeDef[] = [
  {
    id: "carbon",
    name: "Carbon",
    tag: "Sleek",
    blurb: "Graphite, hairline borders, signal green",
    dark: true,
    swatch: ["#09090b", "#1b1b1f", "#3ecf8e"],
  },
  {
    id: "paper",
    name: "Paper",
    tag: "Classic",
    blurb: "Warm paper, ink text, forest green",
    dark: false,
    swatch: ["#f6f5f0", "#fdfcf8", "#3f7d4e"],
  },
  {
    id: "marine",
    name: "Marine",
    tag: "Modern",
    blurb: "Deep navy, steel cyan highlights",
    dark: true,
    swatch: ["#0a1120", "#131f36", "#62c1e5"],
  },
  {
    id: "oxblood",
    name: "Oxblood",
    tag: "Statement",
    blurb: "Warm noir with a deep red accent",
    dark: true,
    swatch: ["#141010", "#231a19", "#d97b6c"],
  },
  {
    id: "gallery",
    name: "Gallery",
    tag: "Minimal",
    blurb: "White walls, black ink, persimmon",
    dark: false,
    swatch: ["#ffffff", "#ffffff", "#d1532b"],
  },
];

export const DEFAULT_THEME: ThemeId = "carbon";

export const THEME_STORAGE_KEY = "seeql-theme-v1";

export function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
