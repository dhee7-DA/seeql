"use client";

// SeeQL shell kit — the primitive layer between the CSS utilities and the
// app's components. Every control in the shell renders through one of these
// so padding, radius, hover, disabled and keyboard-focus styles stay
// identical everywhere.
//
// The visuals encode the Active Builders language: flat surfaces, hairline
// borders, ink buttons that flip with the theme, numbered nav rows with an
// arrow on the active one, real-green accent. No glow, no sheen — flat.

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

/** Shared keyboard-focus ring. Raw elements only — shadcn primitives set
    their own `outline-none` + ring, and a class beats this zero-specificity
    utility, so the two systems never double up. */
export const FOCUS_RING =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400/80";

/* ------------------------------------------------------------------ */
/* Panel — the raised surface: hairline border, flat fill.             */
/* ------------------------------------------------------------------ */

export function Panel({
  tone = "shell",
  pad = 4,
  rounded = "xl",
  hover = false,
  id,
  className,
  children,
}: {
  /** "nested" = a panel sitting inside another panel (one step lighter). */
  tone?: "shell" | "nested";
  /** 0 = children manage their own padding. */
  pad?: 0 | 3.5 | 4 | 5;
  rounded?: "lg" | "xl";
  hover?: boolean;
  /** DOM anchor for in-page step navigation. */
  id?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      id={id}
      className={cn(
        "sheen border border-zinc-800",
        rounded === "xl" ? "rounded-xl" : "rounded-lg",
        tone === "nested" ? "bg-zinc-900/50" : "bg-zinc-950",
        pad === 3.5 && "p-3.5",
        pad === 4 && "p-4",
        pad === 5 && "p-5",
        hover && "card-hover",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* ProgressBar — flat track + green fill. value: 0..1                  */
/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  fine = false,
  className,
}: {
  value: number;
  /** fine = the 2px in-row variant used under sidebar/module titles. */
  fine?: boolean;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, value * 100));
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-zinc-800",
        fine ? "h-0.5" : "h-1.5",
        className,
      )}
    >
      <div
        className={cn(
          "h-full rounded-full bg-emerald-400 transition-[width] ease-out",
          fine ? "duration-500" : "duration-700",
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chip — small stat lozenge: muted key + tabular value.               */
/* ------------------------------------------------------------------ */

export function Chip({
  k,
  v,
  className,
}: {
  k: string;
  v: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "rounded-md border border-zinc-800 bg-zinc-900/60 px-2.5 py-1.5 text-[11px]",
        className,
      )}
    >
      <span className="text-zinc-500">{k} </span>
      <span className="tnum font-medium text-zinc-200">{v}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* SectionLabel — mono uppercase group heading (Toolbox, Practice lab) */
/* ------------------------------------------------------------------ */

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("px-1 font-mono text-[10px] uppercase tracking-[0.14em] text-zinc-500", className)}>
      {children}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Btn — the unified button. Five variants cover the shell's needs.    */
/* ------------------------------------------------------------------ */

type BtnVariant = "primary" | "soft" | "outline" | "ghost" | "pill";

const BTN_VARIANTS: Record<BtnVariant, (active?: boolean, danger?: boolean) => string> = {
  /** Ink CTA — flips with the theme (ink-on-paper / paper-on-ink), the
      AB primary button. Hero "Continue", header "Start learning". */
  primary: () =>
    "bg-foreground px-4 py-2 text-xs font-medium text-background hover:bg-foreground/85",
  /** Soft green — "Start module — lesson N". */
  soft: () =>
    "border border-emerald-400/30 bg-emerald-400/[0.06] px-3 py-1.5 text-[11px] text-emerald-300 hover:bg-emerald-400/[0.12]",
  /** Small bordered action — reset confirm (tone flips to danger rose). */
  outline: (_active, danger) =>
    danger
      ? "border border-rose-400/50 px-2 py-1 text-[11px] text-rose-300 hover:bg-rose-400/10"
      : "border border-zinc-700 px-2 py-1 text-[11px] text-zinc-400 hover:bg-zinc-900",
  /** Quiet icon button — sidebar expand/collapse. */
  ghost: () => "p-1.5 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300 disabled:opacity-30",
  /** Rounded rail chip — mobile ToolRail. */
  pill: (active) =>
    cn(
      "shrink-0 rounded-full border px-3 py-1.5 text-[11px] font-medium",
      active
        ? "border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300"
        : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200",
    ),
};

export interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant;
  /** Active state (pill chips). */
  active?: boolean;
  /** Danger tone (outline). */
  danger?: boolean;
}

export function Btn({
  variant = "outline",
  active = false,
  danger = false,
  className,
  type = "button",
  ...rest
}: BtnProps) {
  return (
    <button
      type={type}
      {...rest}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium transition-all duration-150 select-none",
        "active:translate-y-px disabled:active:translate-y-0",
        "disabled:cursor-not-allowed disabled:opacity-40",
        FOCUS_RING,
        BTN_VARIANTS[variant](active, danger),
        className,
      )}
    />
  );
}

/* ------------------------------------------------------------------ */
/* ToolRow — sidebar destination row, AB anatomy: a two-digit index,    */
/* the label, and an arrow that appears on the active row.             */
/* ------------------------------------------------------------------ */

export function ToolRow({
  index,
  label,
  note,
  active = false,
  onClick,
}: {
  /** 1-based position in its group — rendered AB-style as 01, 02, … */
  index: number;
  label: string;
  note?: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left transition-colors",
        active ? "bg-emerald-400/[0.08]" : "hover:bg-zinc-900/70",
        FOCUS_RING,
      )}
    >
      {/* same active language as the lesson rows: accent tick + tinted bg */}
      {active && <span aria-hidden className="absolute inset-y-1 left-0 w-0.5 rounded-full bg-emerald-400" />}
      <span
        className={cn(
          "tnum shrink-0 text-[10px]",
          active ? "text-emerald-300/90" : "text-zinc-600",
        )}
      >
        {String(index).padStart(2, "0")}
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-xs font-medium", active ? "text-zinc-100" : "text-zinc-300")}>
          {label}
        </span>
        {note && <span className="block text-[10px] text-zinc-600">{note}</span>}
      </span>
      <ArrowRight
        className={cn(
          "h-3.5 w-3.5 shrink-0 transition-opacity",
          active ? "text-emerald-300 opacity-100" : "text-zinc-400 opacity-0",
        )}
      />
    </button>
  );
}
