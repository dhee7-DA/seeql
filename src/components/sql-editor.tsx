"use client";

// Syntax-highlighted SQL editor.
// Technique: a transparent <textarea> stacked on top of a highlighted <pre>.
// Both share identical font metrics, padding and wrapping so the text aligns.

import {
  useEffect,
  useMemo,
  useRef,
  type ChangeEvent,
  type KeyboardEvent,
  type UIEvent,
} from "react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set(
  `SELECT FROM WHERE GROUP BY ORDER HAVING LIMIT OFFSET JOIN INNER LEFT RIGHT FULL OUTER CROSS
   ON AS AND OR NOT IN IS NULL BETWEEN LIKE ILIKE DISTINCT UNION ALL INTERSECT EXCEPT WITH
   CASE WHEN THEN ELSE END EXISTS ASC DESC INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE
   VIEW ALTER DROP PRIMARY FOREIGN KEY REFERENCES USING NATURAL ANY SOME CAST INTERVAL
   TRUE FALSE OVER PARTITION ROWS RANGE PRECEDING FOLLOWING CURRENT ROW UNBOUNDED RETURNING
   CONFLICT DO NOTHING CASCADE CONSTRAINT DEFAULT UNIQUE INDEX`
    .split(/\s+/)
    .filter(Boolean),
);

interface Token {
  text: string;
  cls: string;
}

const TOKEN_RE =
  /(--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*'|"(?:[^"]|"")*"|`[^`]*`|\[[^\]]*\])|(\b\d+(?:\.\d+)?\b)|(@[A-Za-z_][A-Za-z0-9_]*|\$\d+)|([A-Za-z_][A-Za-z0-9_]*)|([(),;.=<>!+\-*/%|&~])/g;

function tokenize(sql: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(sql)) !== null) {
    if (match.index > last) {
      tokens.push({ text: sql.slice(last, match.index), cls: "" });
    }
    const [raw, comment, str, num, variable, word, punct] = match;
    if (comment) tokens.push({ text: raw, cls: "text-zinc-500 italic" });
    else if (str) tokens.push({ text: raw, cls: "text-amber-300" });
    else if (num) tokens.push({ text: raw, cls: "text-orange-300" });
    else if (variable) tokens.push({ text: raw, cls: "text-teal-300" });
    else if (word) {
      const upper = raw.toUpperCase();
      if (KEYWORDS.has(upper)) tokens.push({ text: raw, cls: "text-emerald-400 font-semibold" });
      else if (sql.slice(match.index + raw.length).match(/^\s*\(/))
        tokens.push({ text: raw, cls: "text-violet-300" });
      else tokens.push({ text: raw, cls: "" });
    } else if (punct) tokens.push({ text: raw, cls: "text-zinc-400" });
    else tokens.push({ text: raw, cls: "" });
    last = match.index + raw.length;
  }
  if (last < sql.length) tokens.push({ text: sql.slice(last), cls: "" });
  return tokens;
}

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onVisualize: () => void;
  className?: string;
}

export function SqlEditor({ value, onChange, onVisualize, className }: SqlEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => tokenize(value), [value]);
  const lineCount = useMemo(() => value.split("\n").length, [value]);

  // keep highlight + gutter in sync with textarea scroll
  const syncScroll = (e: UIEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (preRef.current) {
      preRef.current.scrollTop = ta.scrollTop;
      preRef.current.scrollLeft = ta.scrollLeft;
    }
    if (gutterRef.current) gutterRef.current.style.transform = `translateY(${-ta.scrollTop}px)`;
  };

  useEffect(() => {
    if (preRef.current && taRef.current) {
      preRef.current.scrollTop = taRef.current.scrollTop;
    }
  }, [value]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      onVisualize();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = e.currentTarget;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const next = `${value.slice(0, start)}  ${value.slice(end)}`;
      onChange(next);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + 2;
      });
    }
  };

  return (
    <div
      className={cn(
        "sheen relative flex overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 transition-colors focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20",
        className,
      )}
    >
      {/* line-number gutter */}
      <div
        aria-hidden
        className="w-11 shrink-0 overflow-hidden border-r border-zinc-800/80 bg-zinc-900/80 py-4 text-right select-none"
      >
        <div ref={gutterRef} className="font-mono text-[13px] leading-[20px] text-zinc-600">
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i} className="pr-2.5">
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="relative min-w-0 flex-1">
        {/* highlight layer */}
        <pre
          aria-hidden
          ref={preRef}
          className="sql-code-layer pointer-events-none absolute inset-0 m-0 overflow-y-scroll whitespace-pre-wrap break-words p-4 font-mono text-[13px] leading-[20px] text-zinc-200"
        >
          {tokens.map((t, i) => (
            <span key={i} className={t.cls}>
              {t.text}
            </span>
          ))}
          {"\n"}
        </pre>
        {/* input layer */}
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label="SQL query editor"
          placeholder="-- Write a SQL query here, or pick one of the samples above"
          className="sql-code-layer absolute inset-0 h-full w-full resize-none overflow-y-scroll whitespace-pre-wrap break-words border-0 bg-transparent p-4 font-mono text-[13px] leading-[20px] text-transparent caret-emerald-400 outline-none selection:bg-emerald-400/25 placeholder:text-zinc-600"
        />
      </div>
    </div>
  );
}
