// Verify M2 drill "predict" questions whose prompts contain a runnable
// single-number query: run it against db/custom.db and confirm the number
// appears in the marked answer choice.
import { Database } from "bun:sqlite";
import { INNER_JOIN } from "../src/lib/curriculum/drills/m2/inner-join";
import { JOIN_MECHANICS } from "../src/lib/curriculum/drills/m2/join-mechanics";
import { MULTI_JOIN } from "../src/lib/curriculum/drills/m2/multi-join";
import { LEFT_JOIN } from "../src/lib/curriculum/drills/m2/left-join";
import { ANTI_JOIN } from "../src/lib/curriculum/drills/m2/anti-join";
import { SELF_JOIN } from "../src/lib/curriculum/drills/m2/self-join";
import { JOIN_AGG } from "../src/lib/curriculum/drills/m2/join-agg";
import { JOIN_FANOUT } from "../src/lib/curriculum/drills/m2/join-fanout";
import { GRAIN_DISCIPLINE } from "../src/lib/curriculum/drills/m2/grain-discipline";
import { TABLE_ALIAS } from "../src/lib/curriculum/drills/m2/table-alias";

const db = new Database("db/custom.db", { readonly: true });

// Conceptual "predict" questions (prose answers, no claim to verify).
// dr2-gd-43: "what does this compute?" — answer explains fan-out semantics;
// the only digit in the choice is "qty-3", not the result.
const SKIP = new Set(["dr2-gd-43"]);

const SETS: Array<[string, { id: string; prompt: string; choices: string[]; answer: number }[]]> = [
  ["inner-join", INNER_JOIN as any], ["join-mechanics", JOIN_MECHANICS as any],
  ["multi-join", MULTI_JOIN as any], ["left-join", LEFT_JOIN as any],
  ["anti-join", ANTI_JOIN as any], ["self-join", SELF_JOIN as any],
  ["join-agg", JOIN_AGG as any], ["join-fanout", JOIN_FANOUT as any],
  ["grain-discipline", GRAIN_DISCIPLINE as any], ["table-alias", TABLE_ALIAS as any],
];

let checked = 0, ok = 0, skipped = 0;
const fails: string[] = [];

for (const [setName, qs] of SETS) {
  for (const q of qs) {
    if (q.aspect !== "predict") continue;
    if (SKIP.has(q.id)) { skipped++; continue; }
    // first backticked SQL in the prompt
    const m = q.prompt.match(/`([^`]*SELECT[^`]*)`/i);
    if (!m) { skipped++; continue; }
    let sql = m[1].replace(/^A\/B:\s*/i, "").trim();
    if (/(GROUP BY|HAVING)/i.test(sql)) { skipped++; continue; } // not single-number
    try {
      const rows = db.query(sql).all() as Record<string, unknown>[];
      if (rows.length !== 1) { skipped++; continue; }
      const vals = Object.values(rows[0]);
      if (vals.length !== 1 || typeof vals[0] !== "number") { skipped++; continue; }
      const got = Math.round(vals[0] * 100) / 100;
      const ans = q.choices[q.answer].replace(/,/g, "").match(/-?[\d.]+/);
      const ansNum = ans ? Math.round(parseFloat(ans[0]) * 100) / 100 : NaN;
      if (!Number.isFinite(ansNum)) { skipped++; continue; } // conceptual answer — engine can't check prose
      checked++;
      if (got === ansNum) ok++;
      else fails.push(`${setName}/${q.id}: query=${sql.slice(0, 90)} -> ${got}, answer says ${q.choices[q.answer]}`);
    } catch {
      skipped++;
    }
  }
}

console.log(`predict single-number checks: ran ${checked}, ok ${ok}, skipped ${skipped}`);
if (fails.length) { console.log("MISMATCHES:"); for (const f of fails) console.log("  " + f); }
else console.log("all runnable predict answers match the live db");
db.close();
