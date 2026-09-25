"use client";

// First-run guided tour — a spotlight walk through the learn shell.
//
// Steps point at data-tour anchors scattered through the app (sidebar,
// course map, heatmap, toolbox, practice lab, SeeQ button). The spotlight
// is a punched hole: a transparent rounded rect over the target with a
// 9999px box-shadow dimming everything else — cheap, GPU-friendly, and it
// moves with CSS transitions (off under prefers-reduced-motion).
//
// A11y: role=dialog + aria-modal, focus lands on the card and follows Next,
// Escape closes, arrow keys step. The seen flag (seeql.tour.v1) is written
// on close — complete OR skipped — so the tour never nags twice; the
// sidebar's "Tour" button replays it on demand.

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Compass } from "lucide-react";
import { Btn, FOCUS_RING } from "./ui/kit";
import { cn } from "@/lib/utils";

export const TOUR_SEEN_KEY = "seeql.tour.v1";

export function tourSeen(): boolean {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) !== null;
  } catch {
    return true; // private mode: never auto-start
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, "done");
  } catch {
    /* ignore */
  }
}

interface TourStep {
  sel: string;
  kicker: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    sel: '[data-tour="hero-cta"]',
    kicker: "Start",
    title: "One tap to continue",
    body: "This button always points at your next unfinished lesson — pick up exactly where you left off, every visit.",
  },
  {
    sel: '[data-tour="curriculum"]',
    kicker: "Learn",
    title: "The whole course, one rail",
    body: "9 modules from beginner to expert. Progress bars fill as you go; your current module is always highlighted.",
  },
  {
    sel: '[data-tour="course-map"]',
    kicker: "Learn",
    title: "The course map",
    body: "Every module at a glance — tap one to reveal its lessons and jump straight into any of them.",
  },
  {
    sel: '[data-tour="heatmap"]',
    kicker: "Habit",
    title: "26 weeks of activity",
    body: "Each square is a day. Hit your daily goal and it lights up — streaks and the rank ladder run on this.",
  },
  {
    sel: '[data-tour="toolbox"]',
    kicker: "Tools",
    title: "The toolbox",
    body: "The data explorer, every diagram, the cheat sheet — plus your own CSV tables and the query notebook.",
  },
  {
    sel: '[data-tour="lab"]',
    kicker: "Practice",
    title: "The practice lab",
    body: "Where XP is earned: query golf, keyword drills, the error clinic, predict-the-output and more.",
  },
  {
    sel: '[data-tour="seeq"]',
    kicker: "Mascot",
    title: "Say hi to SeeQ",
    body: "Your buddy follows you across pages and reacts to your runs. Dress him up and park him anywhere.",
  },
];

const SPOT_PAD = 8;
const TOOLTIP_W = 296;

export function OnboardingTour({
  step,
  setStep,
  onClose,
}: {
  /** current step index, or null when the tour is closed */
  step: number | null;
  setStep: (n: number) => void;
  onClose: () => void;
}) {
  const open = step !== null && step >= 0 && step < STEPS.length;
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [tipPos, setTipPos] = useState<{ top: number; left: number; below: boolean } | null>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion() ?? false;

  // Track the target's rect: on step change, resize and any scroll.
  const measure = useCallback(() => {
    if (step === null) return;
    const el = document.querySelector(STEPS[step].sel);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useEffect(() => {
    if (!open) return;
    // rAF: measure after layout settles (keeps setState out of the effect
    // body — the linter's cascading-render rule — and still lands before
    // the browser paints, so the hole never flashes at a stale spot).
    const raf = requestAnimationFrame(() => measure());
    const onScroll = () => measure();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open, step, measure]);

  // Missing target (view switched underneath) → skip forward instead of
  // stranding the user on a hole in the void. Small delay lets late mounts
  // (effects that reveal sections) settle first.
  useEffect(() => {
    if (!open || rect !== null) return;
    const t = setTimeout(() => {
      if (step !== null && document.querySelector(STEPS[step].sel) === null) {
        if (step + 1 < STEPS.length) setStep(step + 1);
        else onClose();
      }
    }, 250);
    return () => clearTimeout(t);
  }, [open, rect, step, setStep, onClose]);

  // Scroll the target into view, then focus the primary action.
  useEffect(() => {
    if (!open) return;
    const el = document.querySelector(STEPS[step].sel);
    el?.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    const t = setTimeout(
      () => tipRef.current?.querySelector<HTMLButtonElement>("[data-tour-next]")?.focus(),
      120,
    );
    return () => clearTimeout(t);
    // rect in deps re-centers when the user scrolls far away via keyboard
  }, [open, step, reduced]);

  // Position the tooltip under (or over) the spotlight, clamped to viewport.
  // Runs in rAF for the same reason as the measure pass above.
  useEffect(() => {
    if (!open || !rect) return;
    const raf = requestAnimationFrame(() => {
      const tip = tipRef.current;
      if (!tip) return;
      const h = tip.offsetHeight;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const below = rect.bottom + 12 + h < vh - 12;
      const top = below ? rect.bottom + 14 : Math.max(12, rect.top - h - 14);
      const left = Math.min(Math.max(12, rect.left + rect.width / 2 - TOOLTIP_W / 2), vw - TOOLTIP_W - 12);
      setTipPos({ top, left, below });
    });
    return () => cancelAnimationFrame(raf);
  }, [open, rect, step]);

  // Keyboard: Esc closes, arrows step.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (step !== null && step + 1 < STEPS.length) setStep(step + 1);
        else onClose();
      } else if (e.key === "ArrowLeft" && step !== null && step > 0) {
        e.preventDefault();
        setStep(step - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, step, setStep, onClose]);

  if (!open || step === null) return null;

  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[70]"
      onClick={() => (last ? onClose() : setStep(step + 1))}
      data-tour-overlay="1"
    >
      {/* the punched hole */}
      <div
        aria-hidden
        className="pointer-events-none absolute rounded-xl transition-all duration-300 ease-out"
        style={{
          top: rect ? rect.top - SPOT_PAD : -9999,
          left: rect ? rect.left - SPOT_PAD : -9999,
          width: rect ? rect.width + SPOT_PAD * 2 : 0,
          height: rect ? rect.height + SPOT_PAD * 2 : 0,
          boxShadow: "0 0 0 9999px rgba(0,0,0,0.72), 0 0 0 2px rgba(52,211,153,0.55)",
          transitionDuration: reduced ? "0ms" : undefined,
        }}
      />

      {/* the card */}
      <div
        ref={tipRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Guided tour, step ${step + 1} of ${STEPS.length}: ${s.title}`}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "absolute w-[296px] max-h-[60vh] overflow-y-auto thin-scrollbar rounded-lg border border-zinc-700 bg-zinc-950 p-4 shadow-2xl",
          !reduced && "transition-[top,left] duration-300 ease-out",
        )}
        style={{
          top: tipPos ? tipPos.top : -9999,
          left: tipPos ? tipPos.left : Math.max(12, (window.innerWidth - TOOLTIP_W) / 2),
        }}
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-emerald-300">
            {s.kicker}
          </span>
          <button
            onClick={onClose}
            className={cn(
              "rounded px-1.5 py-0.5 text-[11px] text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300",
              FOCUS_RING,
            )}
          >
            Skip tour
          </button>
        </div>
        <h2 className="mt-1.5 font-display text-sm font-semibold text-zinc-50">{s.title}</h2>
        <p className="mt-1.5 text-xs leading-relaxed text-zinc-400">{s.body}</p>

        <div className="mt-3.5 flex items-center justify-between">
          <span className="tnum font-mono text-[10px] text-zinc-600">
            {step + 1} / {STEPS.length}
          </span>
          <span className="flex items-center gap-1.5">
            {step > 0 && (
              <Btn variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Btn>
            )}
            <Btn
              variant="soft"
              data-tour-next="1"
              onClick={() => (last ? onClose() : setStep(step + 1))}
            >
              {last ? "Got it" : "Next"}
            </Btn>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Sidebar footer replay chip — the tour, on demand. */
export function TourReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <Btn
      variant="ghost"
      onClick={onClick}
      title="Replay the guided tour"
      aria-label="Replay the guided tour"
      className="gap-1 text-[11px]"
    >
      <Compass className="h-3 w-3" /> Tour
    </Btn>
  );
}
