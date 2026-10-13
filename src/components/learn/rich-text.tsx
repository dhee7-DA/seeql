"use client";

// Rich inline formatting for Company Universe prose (brief + day-in-the-life).
// Kit authors write plain strings with lightweight markers; this component
// turns them into styled React nodes. Kept intentionally tiny and dependency-
// free so it renders inside any Panel without hydration surprises.
//
// Supported markers:
//   **bold**             -> strong, near-white, semibold
//   *italic*             -> em, slightly lifted tone
//   `code`               -> mono chip (tables, columns, KPI expressions)
//   {amber:text}         -> colored semibold span — palette below
//   {emerald:text} {sky:text} {rose:text} {violet:text} {orange:text} {pink:text}
//
// Markers do not nest; write them flat. Colors are the -300 step so they stay
// readable on the dark zinc background.

import React from "react";

const COLOR_MAP: Record<string, string> = {
  amber: "text-amber-300",
  emerald: "text-emerald-300",
  sky: "text-sky-300",
  rose: "text-rose-300",
  violet: "text-violet-300",
  orange: "text-orange-300",
  pink: "text-pink-300",
};

const TOKEN_RE =
  /\*\*([^*]+)\*\*|\*([^*]+)\*|`([^`]+)`|\{(amber|emerald|sky|rose|violet|orange|pink):([^}]+)\}/g;

export function RichText({ text }: { text: string }) {
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(TOKEN_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) nodes.push(text.slice(last, idx));
    if (m[1] !== undefined) {
      nodes.push(
        <strong key={key++} className="font-semibold text-zinc-50">
          {m[1]}
        </strong>
      );
    } else if (m[2] !== undefined) {
      nodes.push(
        <em key={key++} className="italic text-zinc-200">
          {m[2]}
        </em>
      );
    } else if (m[3] !== undefined) {
      nodes.push(
        <code
          key={key++}
          className="rounded border border-zinc-700/70 bg-zinc-800/80 px-1 py-0.5 font-mono text-[0.82em] text-amber-200"
        >
          {m[3]}
        </code>
      );
    } else if (m[4] !== undefined) {
      nodes.push(
        <strong key={key++} className={`font-semibold ${COLOR_MAP[m[4]]}`}>
          {m[5]}
        </strong>
      );
    }
    last = idx + m[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span>{nodes}</span>;
}
