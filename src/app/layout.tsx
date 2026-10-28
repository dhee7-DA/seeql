import type { Metadata, Viewport } from "next";
import { Chivo_Mono, Inter_Tight } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { PwaRegister } from "@/components/pwa-register";
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

// The single voice — a monospace for EVERYTHING (body, headlines, code),
// exactly like the Active Builders clone. Chivo Mono is the free
// (OFL) stand-in for Auger Mono, matched by rendering side-by-side:
// tall x-height, slightly condensed, grotesque skeleton, and it carries
// the 900-black headline weight the AB look is built on.
const chivoMono = Chivo_Mono({
  variable: "--font-chivo",
  subsets: ["latin"],
  display: "swap",
});

// The Claims Floor display voice — Inter Tight is the free (OFL) stand-in
// for Spade's proprietary Polar: same tight, slightly-softened grotesque
// skeleton that takes the 560 display weight without going brittle.
// Wired via .theme-spade's --font-display override, so every other theme
// keeps the Chivo Mono voice untouched.
const interTight = Inter_Tight({
  variable: "--font-inter-tight",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SeeQL — stop memorizing SQL. Start seeing it.",
  description:
    "A visual SQL learning lab: animated diagrams for every hard idea, live-graded queries on a real SQLite storefront, quiz questions with instant feedback, and XP-driven progress. No account, no setup.",
  keywords: [
    "SQL",
    "learn SQL",
    "SeeQL",
    "SQL visualizer",
    "SQL practice",
    "execution order",
    "joins",
    "parse tree",
    "database",
    "gamified learning",
  ],
  openGraph: {
    title: "SeeQL — stop memorizing SQL. Start seeing it.",
    description:
      "Animated SQL diagrams, live-graded queries on a real database, and a career ladder that turns practice into a habit.",
    type: "website",
    siteName: "SeeQL",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SeeQL",
  },
};

// Painted on the browser chrome so the installed app and the tab blend
// into the Claims Floor cream on every platform.
export const viewport: Viewport = {
  themeColor: "#f4faed",
};

/**
 * Pre-paint theme boot: applies the persisted theme class to <html>
 * before first render so there is no flash of the wrong theme.
 * Generated from THEMES so the registry stays the single source of truth.
 */
const themeBoot = (() => {
  const ids = THEMES.map((t) => t.id);
  const darks = Object.fromEntries(THEMES.map((t) => [t.id, t.dark]));
  return `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"${DEFAULT_THEME}";var ids=${JSON.stringify(
    ids,
  )};var darks=${JSON.stringify(darks)};var ok=ids.indexOf(t)>=0?t:"${DEFAULT_THEME}";var el=document.documentElement;ids.forEach(function(i){el.classList.remove("theme-"+i)});el.classList.add("theme-"+ok);el.classList.toggle("dark",!!darks[ok]);}catch(e){}})();`;
})();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`theme-spade ${chivoMono.variable} ${interTight.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
        <PwaRegister />
      </body>
    </html>
  );
}
