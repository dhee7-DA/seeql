// caselesson-figs-1 — extract EXPECTED ground truth for L36-L40, L50-L51
// (the 7 case-study lessons getting bespoke figures). Run: bun scripts/caselesson-facts.ts
import { EXPECTED } from "../src/lib/curriculum/expected";

const lessons = ["l36", "l37", "l38", "l39", "l40", "l50", "l51"];
for (const l of lessons) {
  console.log(`\n========== ${l} ==========`);
  for (let p = 1; p <= 9; p++) {
    const key = `${l}-p${p}`;
    const e = (EXPECTED as Record<string, { columns?: string[]; rows?: unknown[][] }>)[key];
    if (!e) continue;
    console.log(`\n--- ${key} (${e.rows?.length ?? 0} rows) cols: ${(e.columns ?? []).join(", ")}`);
    const rows = e.rows ?? [];
    const shown = rows.slice(0, 12);
    for (const r of shown) console.log("   " + r.map((c) => String(c)).join(" | "));
    if (rows.length > shown.length) console.log(`   … +${rows.length - shown.length} more`);
  }
}
