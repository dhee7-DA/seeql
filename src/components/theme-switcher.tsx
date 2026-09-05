"use client";

// Theme switcher — a flat swatch button that opens a menu of the SeeQL
// themes. Uses useSyncExternalStore over a tiny custom event bus so
// switching re-renders only this control, not the whole app tree.

import { useSyncExternalStore } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { THEMES, DEFAULT_THEME, THEME_STORAGE_KEY, getTheme, isThemeId, type ThemeId } from "@/lib/themes";
import { cn } from "@/lib/utils";

/* ---- tiny event bus so every switcher instance stays in sync ---- */

const EVENT = "seeql:theme-change";

function readTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_THEME;
  const v = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isThemeId(v) ? v : DEFAULT_THEME;
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function setTheme(id: ThemeId) {
  window.localStorage.setItem(THEME_STORAGE_KEY, id);
  const el = document.documentElement;
  for (const t of THEMES) el.classList.remove(`theme-${t.id}`);
  el.classList.add(`theme-${id}`);
  el.classList.toggle("dark", getTheme(id).dark);
  window.dispatchEvent(new Event(EVENT));
}

/* ---- flat three-cell swatch (solid blocks, no gradient) ---- */

function Swatch({ theme, size = 18 }: { theme: ThemeId; size?: number }) {
  const [bg, surface, accent] = getTheme(theme).swatch;
  return (
    <span
      className="inline-grid shrink-0 overflow-hidden rounded-[5px] border border-zinc-700"
      style={{ width: size, height: size, gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr" }}
      aria-hidden="true"
    >
      <span style={{ background: bg }} />
      <span style={{ background: surface }} />
      <span style={{ background: accent }} className="col-span-2" />
    </span>
  );
}

export function ThemeSwitcher({ className }: { className?: string }) {
  const current = useSyncExternalStore(subscribe, readTheme, () => DEFAULT_THEME);
  const active = getTheme(current);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "btn-quiet h-9 w-9 rounded-md border-zinc-800 bg-zinc-950 hover:bg-zinc-900",
            className,
          )}
          aria-label={`Change theme — current: ${active.name}`}
          title="Theme"
        >
          <Swatch theme={current} size={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="sheen w-72 border-zinc-800 bg-zinc-950">
        {THEMES.map((t) => (
          <DropdownMenuItem
            key={t.id}
            onClick={() => setTheme(t.id)}
            className="gap-3 rounded-md px-3 py-2.5"
          >
            <Swatch theme={t.id} />
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="flex items-baseline gap-2">
                <span className="text-sm font-medium text-zinc-100">{t.name}</span>
                <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
                  {t.tag}
                </span>
              </span>
              <span className="truncate text-xs text-zinc-500">{t.blurb}</span>
            </span>
            {t.id === current && <Check className="h-4 w-4 shrink-0 text-emerald-400" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
