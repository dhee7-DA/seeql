import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Display face for headlines and big numerals — the "premium" voice.
// Body stays Geist; code stays Geist Mono.
const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
    <html lang="en" className="dark theme-jet" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
