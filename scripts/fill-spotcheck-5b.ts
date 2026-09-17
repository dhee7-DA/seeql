// Task 5-b honesty spot-check: run the COMPLETED SQL of selected m02 fills
// (answers substituted exactly like scripts/fill-audit.ts) and print results,
// so the `why` texts' factual claims can be eyeballed against the seed db.
import { db } from "../src/lib/db";
import { resetDatabase } from "../src/lib/sample-db";
import { FILLS_BY_LESSON } from "../src/lib/curriculum/fills/m02";

const SPOT: Array<[number, string]> = [
  [9, "l9-f3"],   // fix-the-broken: 103 rows, not 1648
  [10, "l10-f1"], // fanout census: 251 rows
  [12, "l12-f5"], // shipped dossier: 36 rows (30 + 6 gaps)
  [13, "l13-f1"], // never delivered: exactly 1 customer
  [14, "l14-f3"], // pair count fix: 39
  [15, "l15-f5"], // heavy users: 4 customers over 10 orders
  [16, "l16-f3"], // damage report: honest/inflated/ratio
  [36, "l36-f5"], // region mates: 39
];

function complete(template: string, answers: string[]): string {
  let sql = template;
  answers.forEach((a, i) => {
    sql = sql.replace(new RegExp(`\\{${i + 1}\\}`), a);
  });
  return sql;
}

async function main() {
  await resetDatabase();
  for (const [lesson, id] of SPOT) {
    const fill = (FILLS_BY_LESSON[lesson] ?? []).find((f) => f.id === id);
    if (!fill) {
      console.log(`${id}: NOT FOUND`);
      continue;
    }
    const sql = complete(fill.template, fill.answers);
    try {
      const rows = (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
      const clean = rows.map((r) => {
        const o: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(r)) o[k] = typeof v === "bigint" ? Number(v) : v;
        return o;
      });
      console.log(`\n=== ${id} (${clean.length} rows) ===`);
      console.log(sql.replace(/\n/g, " | "));
      console.log(JSON.stringify(clean.slice(0, 6)));
    } catch (err) {
      console.log(`${id}: ERROR ${(err as Error).message.split("\n")[0]}`);
    }
  }
  process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
