"use client";

// Figure audit harness — QA tool for the visual sweep. Renders any batch of
// figures by id (?ids=a,b,c) stacked vertically at lesson width (max-w-3xl),
// with a theme rail (?theme=jet|plum|noir|pastel, applied via classList only —
// never persisted to localStorage) so every figure can be checked in all four
// themes. Unknown ids render a red MISSING box instead of silently vanishing.

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Figure, hasFigure } from "@/components/learn/diagrams";
import {
  THEMES,
  DEFAULT_THEME,
  getTheme,
  isThemeId,
  type ThemeId,
} from "@/lib/themes";
import type { FigureId } from "@/lib/curriculum/types";
import { cn } from "@/lib/utils";

function applyTheme(id: ThemeId) {
  const el = document.documentElement;
  for (const t of THEMES) el.classList.remove(`theme-${t.id}`);
  el.classList.add(`theme-${id}`);
  el.classList.toggle("dark", getTheme(id).dark);
}

function AuditInner() {
  const sp = useSearchParams();
  const raw = sp.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const themeParam = sp.get("theme");
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME);
  // Figures mount client-side only, AFTER __FIG_STATIC__ is set — otherwise the
  // server would render live-motion props and hydration would mismatch.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Static-by-default: freeze scroll reveals at their final state so
    // screenshots and layout probes capture finished figures. ?static=0
    // restores live motion.
    (window as any).__FIG_STATIC__ =
      new URLSearchParams(window.location.search).get("static") !== "0";
    // ?theme wins; otherwise read the user's stored theme without writing it.
    let t: ThemeId = DEFAULT_THEME;
    if (themeParam && isThemeId(themeParam)) t = themeParam;
    else {
      const v = window.localStorage.getItem("seeql-theme-v1");
      if (isThemeId(v)) t = v;
    }
    applyTheme(t);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- QA harness: ?theme/?static are URL-driven and unknowable during SSR, so state must sync post-mount (client-only figure mount is what prevents hydration mismatch).
    setThemeState(t);
    setReady(true);
  }, [themeParam]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-baseline gap-3">
            <span className="text-sm font-semibold tracking-tight text-zinc-100">
              FIGURE AUDIT
            </span>
            <span className="text-xs text-zinc-500">
              {ids.length} figure{ids.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  applyTheme(t.id);
                  setThemeState(t.id);
                }}
                className={cn(
                  "rounded border px-2 py-1 text-[11px] transition-colors",
                  theme === t.id
                    ? "border-zinc-400 bg-zinc-800 text-zinc-100"
                    : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                )}
              >
                {t.id}
              </button>
            ))}
            <Link
              href="/"
              className="ml-2 text-[11px] text-zinc-500 hover:text-zinc-300"
            >
              ← app
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {ids.length === 0 && (
          <p className="pt-16 text-center text-sm text-zinc-500">
            Append ?ids=l1-anatomy,j2-inner-match to audit figures.
          </p>
        )}
        {ids.map((id, i) => {
          const known = hasFigure(id as FigureId);
          return (
            <section
              key={`${id}-${i}`}
              id={`fig-${id}`}
              data-fig={id}
              className="border-b border-zinc-900 py-5"
            >
              <div className="mb-2 flex items-baseline justify-between">
                <span className="font-mono text-[11px] text-zinc-500">
                  {String(i + 1).padStart(2, "0")} · {id}
                </span>
                {!known && (
                  <span className="rounded bg-red-950 px-1.5 py-0.5 font-mono text-[10px] text-red-400">
                    MISSING COMPONENT
                  </span>
                )}
              </div>
              {known && ready ? (
                <Figure id={id as FigureId} />
              ) : known ? (
                <div className="h-24 animate-pulse rounded-lg border border-zinc-900 bg-zinc-900/40" />
              ) : (
                <div className="rounded-lg border border-red-900 bg-red-950/40 p-6 text-center text-xs text-red-400">
                  No component registered for “{id}”
                </div>
              )}
            </section>
          );
        })}
      </main>
    </div>
  );
}

export default function FigureAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-sm text-zinc-500">
          loading audit…
        </div>
      }
    >
      <AuditInner />
    </Suspense>
  );
}
