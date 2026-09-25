"use client";

// Syntax-highlighted SQL editor.
// Technique: a transparent <textarea> stacked on top of a highlighted <pre>.
// Both share identical font metrics, padding and wrapping so the text aligns.
//
// Learning-tool layer:
//  - `highlight`   → emerald glow over a clause range (diagram → text linking)
//  - `errorRange`  → rose wavy underline under the failing token
//  - `onCaretMove` → reports caret offsets so the diagram can glow back

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
  /** offset of the token start inside the SQL text */
  start: number;
  cls: string;
}

const TOKEN_RE =
  /(--[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|('(?:[^']|'')*'|"(?:[^"]|"")*"|`[^`]*`|\[[^\]]*\])|(\b\d+(?:\.\d+)?\b)|(@[A-Za-z_][A-Za-z0-9_]*|\$\d+)|([A-Za-z_][A-Za-z0-9_]*)|([(),;.=<>!+\-*/%|&~])/g;

export function tokenizeSql(sql: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  let match: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(sql)) !== null) {
    if (match.index > last) {
      tokens.push({ text: sql.slice(last, match.index), start: last, cls: "" });
    }
    const [raw, comment, str, num, variable, word, punct] = match;
    if (comment) tokens.push({ text: raw, start: match.index, cls: "text-zinc-500 italic" });
    else if (str) tokens.push({ text: raw, start: match.index, cls: "text-amber-300" });
    else if (num) tokens.push({ text: raw, start: match.index, cls: "text-orange-300" });
    else if (variable) tokens.push({ text: raw, start: match.index, cls: "text-teal-300" });
    else if (word) {
      const upper = raw.toUpperCase();
      if (KEYWORDS.has(upper))
        tokens.push({ text: raw, start: match.index, cls: "text-emerald-400 font-semibold" });
      else if (sql.slice(match.index + raw.length).match(/^\s*\(/))
        tokens.push({ text: raw, start: match.index, cls: "text-violet-300" });
      else tokens.push({ text: raw, start: match.index, cls: "" });
    } else if (punct) tokens.push({ text: raw, start: match.index, cls: "text-zinc-400" });
    else tokens.push({ text: raw, start: match.index, cls: "" });
    last = match.index + raw.length;
  }
  if (last < sql.length) tokens.push({ text: sql.slice(last), start: last, cls: "" });
  return tokens;
}

export interface TextRange {
  start: number;
  end: number;
}

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  onVisualize: () => void;
  className?: string;
  /** Clause range to glow (diagram → text linking). */
  highlight?: TextRange | null;
  /** Failing token range to underline (live parse error). */
  errorRange?: TextRange | null;
  /** Caret offset reporting (text → diagram linking). */
  onCaretMove?: (offset: number) => void;
}

const MARK_CLS = "bg-emerald-400/20 rounded-[3px] shadow-[inset_0_0_0_1px_rgba(52,211,153,0.35)]";
const ERR_CLS = "underline decoration-rose-400 decoration-wavy underline-offset-4";

export function SqlEditor({
  value,
  onChange,
  onVisualize,
  className,
  highlight,
  errorRange,
  onCaretMove,
}: SqlEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const preRef = useRef<HTMLPreElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);

  const tokens = useMemo(() => tokenizeSql(value), [value]);
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

  const reportCaret = () => {
    const ta = taRef.current;
    if (ta && onCaretMove) onCaretMove(ta.selectionStart ?? 0);
  };

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

  /** Render one token, splitting it around highlight/error boundaries. */
  const renderToken = (t: Token, key: number) => {
    const tEnd = t.start + t.text.length;
    const hlOn = highlight && t.start < highlight.end && tEnd > highlight.start;
    const errOn = errorRange && t.start < errorRange.end && tEnd > errorRange.start;
    if (!hlOn && !errOn) {
      return (
        <span key={key} className={t.cls}>
          {t.text}
        </span>
      );
    }
    // cut the token into pre / marked / post segments around each boundary
    const cuts = new Set<number>([t.start, tEnd]);
    if (highlight) {
      if (highlight.start > t.start && highlight.start < tEnd) cuts.add(highlight.start);
      if (highlight.end > t.start && highlight.end < tEnd) cuts.add(highlight.end);
    }
    if (errorRange) {
      if (errorRange.start > t.start && errorRange.start < tEnd) cuts.add(errorRange.start);
      if (errorRange.end > t.start && errorRange.end < tEnd) cuts.add(errorRange.end);
    }
    const points = [...cuts].sort((a, b) => a - b);
    const parts: React.ReactNode[] = [];
    for (let i = 0; i < points.length - 1; i++) {
      const s = points[i];
      const e = points[i + 1];
      if (e <= s) continue;
      const segCls = cn(
        t.cls,
        highlight && s >= highlight.start && e <= highlight.end && hlOn && MARK_CLS,
        errorRange && s >= errorRange.start && e <= errorRange.end && errOn && ERR_CLS,
      );
      parts.push(
        <span key={`${key}-${s}`} className={segCls}>
          {t.text.slice(s - t.start, e - t.start)}
        </span>,
      );
    }
    return <span key={key}>{parts}</span>;
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
          {tokens.map((t, i) => renderToken(t, i))}
          {"\n"}
        </pre>
        {/* input layer */}
        <textarea
          ref={taRef}
          value={value}
          onChange={handleChange}
          onScroll={syncScroll}
          onKeyDown={handleKeyDown}
          onSelect={reportCaret}
          onClick={reportCaret}
          onKeyUp={reportCaret}
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
