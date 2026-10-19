"use client";

// Your sharpest companies — the universe leaderboard. Ranks the top 8
// company kits by their best signal: the best mock-screen percentage from
// the universe mock history, or kit MCQ accuracy (kit-tab + mock answers
// merged by kitMcqAccuracy). Rows deep-link to the kit page through the
// same seeql:nav event every other learn-shell jump uses.

import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { useProgress } from "@/lib/curriculum/progress";
import { COMPANY_KITS } from "@/lib/companies/registry";
import { kitMcqAccuracy, useUniverse } from "@/lib/universe/progress";
import { ProgressBar } from "./ui/kit";

const TOP_N = 8;

interface Row {
  id: string;
  name: string;
  domainId: string;
  /** best signal, 0..100 */
  pct: number;
  /** how much answers back the signal (answered MCQs vs one mock run) */
  evidence: number;
}

export function CompanyLeaderboard() {
  const mcqAttempts = useProgress((s) => s.mcqAttempts);
  const mockMcq = useUniverse((s) => s.mockMcq);
  const mocks = useUniverse((s) => s.mocks);

  const rows = useMemo(() => {
    // best mock percentage per kit across the mock history (per-kit + omni)
    const bestMock = new Map<string, number>();
    for (const m of mocks) {
      for (const id of m.kitIds) {
        const best = bestMock.get(id);
        if (best === undefined || m.pct > best) bestMock.set(id, m.pct);
      }
    }
    const out: Row[] = [];
    for (const kit of Object.values(COMPANY_KITS)) {
      const ids = kit.mcqs.map((m) => m.id);
      const acc = kitMcqAccuracy(kit.id, ids, mcqAttempts, mockMcq);
      const mcqPct = acc.attempted > 0 ? (acc.correct / acc.attempted) * 100 : -1;
      const mockPct = bestMock.get(kit.id) ?? -1;
      const pct = Math.max(mcqPct, mockPct);
      if (pct < 0) continue;
      out.push({
        id: kit.id,
        name: kit.name,
        domainId: kit.domainId,
        pct,
        evidence: Math.max(acc.attempted, mockPct >= 0 ? 1 : 0),
      });
    }
    return out.sort((a, b) => b.pct - a.pct || b.evidence - a.evidence).slice(0, TOP_N);
  }, [mcqAttempts, mockMcq, mocks]);

  return (
    <div className="sheen mt-6 rounded-lg border border-zinc-800 bg-zinc-950 p-4">
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="font-display text-sm font-semibold text-zinc-100">Your sharpest companies</h3>
        {rows.length > 0 && (
          <p className="text-[11px] text-zinc-500">best mock or kit accuracy · top {TOP_N}</p>
        )}
      </div>
      {rows.length === 0 ? (
        <p className="mt-2.5 text-[11px] leading-relaxed text-zinc-500">Run a mock to rank your first company.</p>
      ) : (
        <div className="mt-2 flex flex-col divide-y divide-zinc-800/60">
          {rows.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() =>
                window.dispatchEvent(
                  new CustomEvent("seeql:nav", { detail: { kind: "companies", domain: r.domainId, company: r.id } }),
                )
              }
              aria-label={`Open the ${r.name} kit`}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-left transition-colors hover:bg-zinc-900"
            >
              <span className="tnum w-4 shrink-0 font-mono text-[10px] text-zinc-600">{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-zinc-200">{r.name}</span>
                <ProgressBar value={r.pct / 100} fine className="mt-1.5" />
              </span>
              <span className="tnum w-9 shrink-0 text-right font-mono text-[10px] text-zinc-400">
                {Math.round(r.pct)}%
              </span>
              <ArrowRight className="h-3 w-3 shrink-0 text-zinc-600 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
