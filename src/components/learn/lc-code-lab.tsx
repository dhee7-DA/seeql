"use client";

// Code lab — the verified path for the Python deep-dive problems. The
// reference solution is Python (engine-verified offline by scripts/lc-verify),
// but the interview reality is language-agnostic, so this lab runs YOUR
// JavaScript against the problem's REAL verify cases inside a Blob worker
// (js-runner.ts — same harness vocabulary the offline verifier speaks:
// ListNode chains, binary trees, class op-sequences, codec round-trips).
//
// Solving here pays the full LC_XP — verified, not claimed. Drafts persist
// per problem so a half-finished idea survives navigation.

import { useEffect, useRef, useState } from "react";
import { Check, Play, RotateCcw, SquareCode } from "lucide-react";
import { runJsSpec, type JsRunOutcome } from "@/lib/leetcode/js-runner";
import { LC_XP, lcSolveKey, type LcDeepDive, type LcRef } from "@/lib/leetcode/types";
import { useProgress } from "@/lib/curriculum/progress";
import { celebrate } from "./celebrate";
import { Btn, Panel, SectionLabel } from "./ui/kit";
import { cn } from "@/lib/utils";

const draftKey = (slug: string) => `seeql.codelab.${slug}`;

function loadDraft(slug: string): string {
  try {
    return localStorage.getItem(draftKey(slug)) ?? "";
  } catch {
    return "";
  }
}

export function LcCodeLab({ p, deep }: { p: LcRef; deep: LcDeepDive }) {
  const awardXp = useProgress((s) => s.awardXp);
  const scheduleReview = useProgress((s) => s.scheduleReview);
  const solvedAt = useProgress((s) => s.xpEvents[lcSolveKey(p.slug)]);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [outcome, setOutcome] = useState<JsRunOutcome | null>(null);
  const hydrated = useRef(false);
  const xp = LC_XP[p.difficulty];

  useEffect(() => {
    hydrated.current = true;
    // restore after paint (async — the hydration pass renders the empty draft)
    const draft = loadDraft(p.slug);
    if (draft) {
      const raf = requestAnimationFrame(() => setCode(draft));
      return () => cancelAnimationFrame(raf);
    }
  }, [p.slug]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      localStorage.setItem(draftKey(p.slug), code);
    } catch {
      /* quota — ignore, drafts are best-effort */
    }
  }, [code, p.slug]);

  const run = () => {
    if (busy || !code.trim()) return;
    setBusy(true);
    setOutcome(null);
    void runJsSpec(code, deep.verify).then((oc) => {
      setOutcome(oc);
      setBusy(false);
      if (oc.ok) {
        if (awardXp(lcSolveKey(p.slug), xp)) {
          scheduleReview(`lcm:${p.slug}`, true);
          celebrate({
            kind: "xp",
            title: `+${xp} XP — ${p.title}`,
            sub: "Code lab · all test cases green",
          });
        }
      } else {
        scheduleReview(`lcm:${p.slug}`, false);
      }
    });
  };

  const reset = () => {
    setCode("");
    setOutcome(null);
    try {
      localStorage.removeItem(draftKey(p.slug));
    } catch {
      /* ignore */
    }
  };

  return (
    <Panel pad={4} id="dive-codelab" className="scroll-mt-16">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SquareCode className="h-4 w-4 text-cyan-300" />
          <h3 className="text-sm font-semibold text-zinc-100">Code lab — solve it for real</h3>
        </div>
        {solvedAt !== undefined ? (
          <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/30 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
            <Check className="h-3 w-3" /> Verified · {solvedAt} XP
          </span>
        ) : (
          <span className="rounded-md border border-cyan-400/25 bg-cyan-400/[0.07] px-2.5 py-1 text-[11px] font-medium text-cyan-300">
            +{xp} XP when every case is green
          </span>
        )}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
        The reference below is Python — the sandbox speaks JavaScript. Port the idea and run it against{" "}
        <span className="text-zinc-300">{deep.verify.cases.length} real test cases</span> (the exact ones the
        offline engine verified the Python against). Everything runs in a sandboxed worker: no DOM, 3-second
        time limit, ListNode/tree/class harness included. Your draft is saved per problem.
      </p>
      <div className="mt-3">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Tab") {
              e.preventDefault();
              const el = e.currentTarget;
              const [s, e2] = [el.selectionStart, el.selectionEnd];
              const next = `${code.slice(0, s)}  ${code.slice(e2)}`;
              setCode(next);
              requestAnimationFrame(() => {
                el.selectionStart = el.selectionEnd = s + 2;
              });
            }
          }}
          spellCheck={false}
          rows={10}
          aria-label="JavaScript solution editor"
          placeholder={`// define function ${deep.verify.fn}(...)\nfunction ${deep.verify.fn}(input) {\n  // port the Python idea here\n}`}
          className="w-full rounded-md border border-zinc-800 bg-zinc-950 p-3 font-mono text-[12px] leading-5 text-zinc-200 placeholder:text-zinc-600 focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <Btn variant="primary" disabled={busy || !code.trim()} onClick={run}>
          <Play className="h-3.5 w-3.5" /> {busy ? "Running…" : "Run cases"}
        </Btn>
        <Btn variant="outline" onClick={reset} disabled={!code && !outcome}>
          <RotateCcw className="h-3 w-3" /> Reset draft
        </Btn>
        <span className="font-mono text-[10px] text-zinc-600">
          fn {deep.verify.fn} · wrap {deep.verify.wrap}
        </span>
      </div>

      {outcome && (
        <div className="mt-3 space-y-2">
          {outcome.error ? (
            <div className="rounded-lg border border-rose-400/30 bg-rose-400/[0.06] p-3">
              <p className="font-mono text-[10px] uppercase tracking-wider text-rose-300">Sandbox said no</p>
              <p className="mt-1 font-mono text-[12px] leading-relaxed text-zinc-300">{outcome.error}</p>
            </div>
          ) : (
            <>
              <div
                className={cn(
                  "rounded-lg border p-3",
                  outcome.ok ? "border-emerald-400/30 bg-emerald-400/[0.06]" : "border-amber-400/30 bg-amber-400/[0.06]",
                )}
              >
                <p
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-wider",
                    outcome.ok ? "text-emerald-300" : "text-amber-300",
                  )}
                >
                  {outcome.ok ? "All cases green" : `${outcome.passed}/${outcome.total} cases passing`}
                </p>
                {outcome.ok && (
                  <p className="mt-1 text-[12px] text-zinc-400">
                    Verified solve — the ledger pays {xp} XP, no honor claim needed.
                  </p>
                )}
              </div>
              {!outcome.ok && (
                <div className="overflow-hidden rounded-lg border border-zinc-800">
                  {outcome.results.slice(0, 6).map((r) => (
                    <div
                      key={r.i}
                      className="border-b border-zinc-800/60 p-2.5 last:border-b-0"
                    >
                      <p className="flex items-center gap-2 font-mono text-[10px]">
                        <span className={r.pass ? "text-emerald-300" : "text-rose-300"}>
                          case {r.i + 1} {r.pass ? "✓" : "✗"}
                        </span>
                        {r.error && <span className="truncate text-zinc-500">{r.error}</span>}
                      </p>
                      {!r.pass && (r.got || r.expected) && (
                        <div className="mt-1 grid gap-1 font-mono text-[10px] leading-4">
                          <span className="truncate text-zinc-500">got: <span className="text-zinc-300">{r.got}</span></span>
                          <span className="truncate text-zinc-500">want: <span className="text-zinc-300">{r.expected}</span></span>
                        </div>
                      )}
                    </div>
                  ))}
                  {outcome.results.length > 6 && (
                    <p className="border-t border-zinc-800/60 px-2.5 py-2 text-[10px] text-zinc-600">
                      +{outcome.results.length - 6} more cases hidden
                    </p>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!outcome && (
        <SectionLabel className="mt-3">stuck? the ladder above walks the idea — port rung three</SectionLabel>
      )}
    </Panel>
  );
}
