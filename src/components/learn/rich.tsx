"use client";

// Tiny rich-text renderer for curriculum prose: **bold**, *italic*, `code`,
// and bold/italic that wraps code (e.g. **`COUNT(*)` counts rows**).
//
// RichNodes emits spans only — safe to drop inside <p>, <span> or <button>
// without invalid p-in-p nesting. Rich wraps the same nodes in a <p>.

import { Fragment, type ReactNode } from "react";
import { SqlNodes } from "./sql-code";

/** Innermost layer: split out `code` spans (SQL-colorized), pass the rest through. */
function Codes({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  text.split(/(`[^`]+`)/g).forEach((part, i) => {
    if (part.startsWith("`") && part.endsWith("`") && part.length > 1) {
      nodes.push(
        <code
          key={i}
          className="rounded-[4px] border border-zinc-800 bg-zinc-900 px-1.5 py-0.5 font-mono text-[0.85em] text-emerald-300"
        >
          <SqlNodes text={part.slice(1, -1)} />
        </code>,
      );
    } else if (part) {
      nodes.push(<Fragment key={i}>{part}</Fragment>);
    }
  });
  return <>{nodes}</>;
}

/** Parse rich text into inline nodes — no wrapper element. */
export function RichNodes({ text }: { text: string }) {
  const nodes: ReactNode[] = [];
  // top layer: **bold** and *italic* (inner text may contain `code`)
  text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).forEach((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      nodes.push(
        <strong key={i} className="font-semibold text-zinc-100">
          <Codes text={part.slice(2, -2)} />
        </strong>,
      );
    } else if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      nodes.push(
        <em key={i} className="italic text-zinc-200">
          <Codes text={part.slice(1, -1)} />
        </em>,
      );
    } else if (part) {
      nodes.push(<Codes key={i} text={part} />);
    }
  });
  return <>{nodes}</>;
}

export function Rich({ text, className }: { text: string; className?: string }) {
  return (
    <p className={className}>
      <RichNodes text={text} />
    </p>
  );
}
