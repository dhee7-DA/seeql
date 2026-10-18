"use client";

// Command palette — ⌘K / Ctrl+K (or the header Search button) opens one
// overlay over the whole learn app: tools, lessons, every live company kit
// and the domains. Type two letters, arrow, Enter — you are there. The
// palette navigates through the same seeql:nav event every other jump uses,
// so deep links, tour suppression and scroll-reset all behave identically.

import { useEffect, useMemo, useRef, useState } from "react";
import { Building2, CornerDownLeft, Layers, Map as MapIcon, Search, Zap } from "lucide-react";
import { COMPANY_DOMAINS, COMPANY_KITS, COMPANY_META } from "@/lib/companies/registry";
import { LESSONS } from "@/lib/curriculum/lessons";
import { TOOLS } from "./tools";
import type { View } from "./learn-app";
import { cn } from "@/lib/utils";

interface PaletteItem {
  id: string;
  group: "Tools" | "Companies" | "Lessons" | "Domains";
  title: string;
  sub?: string;
  keywords: string;
  view: View;
}

const GROUP_ORDER: PaletteItem["group"][] = ["Companies", "Tools", "Lessons", "Domains"];

const GROUP_ICON: Record<PaletteItem["group"], React.ComponentType<{ className?: string }>> = {
  Companies: Building2,
  Tools: Zap,
  Lessons: Layers,
  Domains: MapIcon,
};

function buildIndex(): PaletteItem[] {
  const items: PaletteItem[] = [];
  for (const t of TOOLS) {
    items.push({
      id: `tool-${t.kind}`,
      group: "Tools",
      title: t.label,
      sub: t.note,
      keywords: `${t.label} ${t.note} ${t.short} ${t.kind}`.toLowerCase(),
      view: { kind: t.kind } as View,
    });
  }
  for (const kit of Object.values(COMPANY_KITS)) {
    const domain = COMPANY_DOMAINS.find((d) => d.id === kit.domainId);
    items.push({
      id: `kit-${kit.id}`,
      group: "Companies",
      title: kit.name,
      sub: `${domain?.name ?? ""} · ${kit.tagline}`,
      keywords: `${kit.name} ${kit.tagline} ${domain?.name ?? ""} company kit interview`.toLowerCase(),
      view: { kind: "companies", domain: kit.domainId, company: kit.id },
    });
  }
  for (const d of COMPANY_DOMAINS) {
    items.push({
      id: `domain-${d.id}`,
      group: "Domains",
      title: d.name,
      sub: d.blurb,
      keywords: `${d.name} ${d.blurb} domain industry`.toLowerCase(),
      view: { kind: "companies", domain: d.id },
    });
  }
  for (const l of LESSONS) {
    items.push({
      id: `lesson-${l.id}`,
      group: "Lessons",
      title: `${l.num}. ${l.title}`,
      sub: "course lesson",
      keywords: `lesson ${l.num} ${l.title}`.toLowerCase(),
      view: { kind: "lesson", id: l.id },
    });
  }
  return items;
}

const INDEX = buildIndex();

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // ⌘K / Ctrl+K opens; the header Search button dispatches seeql:palette.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onPalette = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("seeql:palette", onPalette);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("seeql:palette", onPalette);
    };
  }, []);

  // focus + reset on open
  useEffect(() => {
    if (open) {
      setQ("");
      setSel(0);
      // wait a tick so the input exists before focus
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const sep = needle ? " " : "";
    const filtered: Array<{ it: PaletteItem; rank: number }> = needle
      ? INDEX.map((it): { it: PaletteItem; rank: number } => {
          const hay = `${sep}${it.keywords}`;
          const tIdx = it.title.toLowerCase().indexOf(needle);
          // startsWith ranks above contains, which ranks above keyword hits
          const rank = tIdx === 0 ? 0 : tIdx > 0 ? 1 : hay.includes(` ${needle}`) ? 2 : hay.includes(needle) ? 3 : -1;
          return { it, rank };
        })
          .filter((r) => r.rank >= 0)
          .sort((a, b) => a.rank - b.rank)
      : INDEX.filter((it) => it.group !== "Domains").map((it) => ({ it, rank: 0 }));
    // group the flat ranked list, keeping rank order inside each group
    const byGroup = GROUP_ORDER.map((g) => ({ g, items: filtered.filter((r) => r.it.group === g).map((r) => r.it) })).filter(
      (g) => g.items.length > 0,
    );
    return byGroup;
  }, [q]);

  const flat = useMemo(() => results.flatMap((g) => g.items), [results]);

  useEffect(() => {
    setSel(0);
  }, [q]);

  // keep the selection in view
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-idx="${sel}"]`)?.scrollIntoView({ block: "nearest" });
  }, [sel]);

  const go = (item: PaletteItem) => {
    setOpen(false);
    window.dispatchEvent(new CustomEvent("seeql:nav", { detail: { ...item.view } }));
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
      onMouseDown={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Command palette — search tools, companies and lessons"
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-xl border border-zinc-700 bg-zinc-950 shadow-2xl shadow-black/50"
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-zinc-800 px-4 py-3">
          <Search className="h-4 w-4 shrink-0 text-zinc-500" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setSel((s) => Math.min(s + 1, flat.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSel((s) => Math.max(s - 1, 0));
              } else if (e.key === "Enter" && flat[sel]) {
                e.preventDefault();
                go(flat[sel]);
              }
            }}
            placeholder="Search companies, tools, lessons…"
            className="w-full bg-transparent text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none"
            aria-label="Search companies, tools and lessons"
            autoComplete="off"
          />
          <kbd className="shrink-0 rounded border border-zinc-700 bg-zinc-900 px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">esc</kbd>
        </div>

        <div ref={listRef} className="max-h-[46vh] overflow-y-auto thin-scrollbar">
          {flat.length === 0 && (
            <p className="px-4 py-6 text-center text-xs text-zinc-500">
              Nothing matches &ldquo;{q}&rdquo; — try a company, a tool or a lesson.
            </p>
          )}
          {results.map((g) => (
            <div key={g.g}>
              <p className="px-4 pb-1 pt-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-600">{g.g}</p>
              {g.items.map((item) => {
                const idx = flat.indexOf(item);
                const Icon = GROUP_ICON[item.group];
                return (
                  <button
                    key={item.id}
                    data-idx={idx}
                    onMouseEnter={() => setSel(idx)}
                    onClick={() => go(item)}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      idx === sel ? "bg-zinc-800/80" : "hover:bg-zinc-900",
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", idx === sel ? "text-sky-300" : "text-zinc-500")} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-zinc-100">{item.title}</span>
                      {item.sub && <span className="block truncate text-[11px] text-zinc-500">{item.sub}</span>}
                    </span>
                    {idx === sel && <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-zinc-500" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-zinc-800 px-4 py-2 text-[10px] text-zinc-600">
          <span>
            {COMPANY_KITS ? `${Object.keys(COMPANY_KITS).length} company kits` : ""} · {LESSONS.length} lessons · {TOOLS.length} tools
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-zinc-700 bg-zinc-900 px-1 font-mono">↑↓</kbd> navigate
            <kbd className="ml-1.5 rounded border border-zinc-700 bg-zinc-900 px-1 font-mono">↵</kbd> open
          </span>
        </div>
      </div>
    </div>
  );
}

/** Header chip that opens the palette — gives ⌘K a visible, tappable home. */
export function SearchButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new CustomEvent("seeql:palette"))}
      aria-label="Search — open the command palette (Control K)"
      title="Search everything — ⌘K"
      className="flex min-h-[36px] cursor-pointer items-center gap-1.5 rounded-md border border-zinc-800 px-2.5 py-1.5 text-sm text-zinc-300 transition-colors hover:bg-zinc-900"
    >
      <Search className="h-3.5 w-3.5" />
      <span className="hidden md:inline">Search</span>
      <kbd className="hidden rounded border border-zinc-700 bg-zinc-900 px-1 font-mono text-[10px] text-zinc-500 md:inline">⌘K</kbd>
    </button>
  );
}
