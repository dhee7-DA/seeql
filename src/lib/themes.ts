// SeeQL theme registry — 4 hand-tuned themes (v2 set). Flat by design: no
// gradients, no glows — solid surfaces, hairline borders, one restrained
// accent each.
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
  | "jet"
  | "plum"
  | "noir"
  | "pastel";

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
    id: "jet",
    name: "Jet Black",
    tag: "Mono",
    blurb: "True black, silver hairlines, zero noise",
    dark: true,
    swatch: ["#050507", "#0c0c10", "#ededf0"],
  },
  {
    id: "plum",
    name: "Cream & Plum",
    tag: "Warm",
    blurb: "Cream paper, plum ink, soft luxe",
    dark: false,
    swatch: ["#f3edde", "#f9f5ea", "#8a4d74"],
  },
  {
    id: "noir",
    name: "Black & Pink",
    tag: "Bold",
    blurb: "Ink black with a rose-pink signal",
    dark: true,
    swatch: ["#0c080f", "#140e18", "#f16fae"],
  },
  {
    id: "pastel",
    name: "Matte Pastels",
    tag: "Soft",
    blurb: "Powdered sage on fog, muted all over",
    dark: false,
    swatch: ["#ecf0e6", "#f3f6ef", "#7c9a68"],
  },
];

export const DEFAULT_THEME: ThemeId = "jet";

export const THEME_STORAGE_KEY = "seeql-theme-v1";

export function isThemeId(v: unknown): v is ThemeId {
  return THEMES.some((t) => t.id === v);
}

export function getTheme(id: ThemeId): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
