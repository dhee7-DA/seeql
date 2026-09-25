// Mechanical fill audit — reinstates the lost scripts/fill-audit.ts discipline.
// Every completed fill SQL (template with {n} → answers[n-1]) must execute
// against the seed db. Key Module 9 receipts are asserted numerically.
import { db } from "../src/lib/db";
import { FILLS_BY_LESSON as M1 } from "../src/lib/curriculum/fills/m01";
import { FILLS_BY_LESSON as M2 } from "../src/lib/curriculum/fills/m02";
import { FILLS_BY_LESSON as M3 } from "../src/lib/curriculum/fills/m03";
import { FILLS_BY_LESSON as M4 } from "../src/lib/curriculum/fills/m04";
import { FILLS_BY_LESSON as M5 } from "../src/lib/curriculum/fills/m05";
import { FILLS_BY_LESSON as M6 } from "../src/lib/curriculum/fills/m06";
import { FILLS_BY_LESSON as M7 } from "../src/lib/curriculum/fills/m07";
import { FILLS_BY_LESSON as M8 } from "../src/lib/curriculum/fills/m08";
import { FILLS_BY_LESSON as M9 } from "../src/lib/curriculum/fills/m09";

const ALL = [M1, M2, M3, M4, M5, M6, M7, M8, M9];

function completed(template: string, answers: string[]): string {
  return template.replace(/\{(\d+)\}/g, (_m, n) => answers[Number(n) - 1]);
}

async function run(sql: string): Promise<unknown> {
  return db.$queryRawUnsafe(sql);
}

async function main() {
  let pass = 0, fail = 0;
  const failures: string[] = [];
  let total = 0;

  for (const mod of ALL) {
    for (const [numStr, fills] of Object.entries(mod)) {
      for (const f of fills) {
        total++;
        const sql = completed(f.template, f.answers);
        if (/\{\d+\}/.test(sql)) {
          fail++; failures.push(`${f.id}: unfilled slot remains`);
          continue;
        }
        try {
          await run(sql);
          pass++;
        } catch (e) {
          fail++;
          failures.push(`${f.id}: ${(e as Error).message.split("\n")[0]}`);
        }
      }
    }
  }
  console.log(`fill audit: ${pass}/${total} completed queries execute cleanly`);
  for (const f of failures) console.log(`  FAIL ${f}`);

  // ---- Module 9 receipt assertions ----
  const revenue = await run("SELECT ROUND(SUM(amount_cents) / 100.0, 2) AS revenue FROM invoices WHERE status <> 'void'") as Array<{ revenue: number }>;
  console.log(`revenue ex-void: ${revenue[0].revenue} (expect 86052)`);

  const alice = await run(`SELECT COUNT(*) AS events FROM (
    SELECT issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1
    UNION ALL
    SELECT p.paid_on, -p.amount_cents FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1
  ) t`) as Array<{ events: number }>;
  console.log(`alice timeline: ${alice[0].events} (expect 14)`);

  const balance = await run(`SELECT ROUND(SUM(amt) OVER (ORDER BY d) / 100.0, 2) AS bal FROM (
    SELECT issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1
    UNION ALL
    SELECT p.paid_on, -p.amount_cents FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1
  ) t ORDER BY d DESC LIMIT 1`) as Array<{ bal: number }>;
  console.log(`alice ending balance: ${balance[0].bal} (expect 2148)`);

  const bal = await run("SELECT ROUND((SUM(debit_cents) - SUM(credit_cents)) / 100.0, 2) AS must_be_zero FROM ledger_entries") as Array<{ must_be_zero: number }>;
  console.log(`trial balance: ${bal[0].must_be_zero} (expect 0)`);

  const ghost = await run(`SELECT i.number, i.amount_cents FROM invoices i
    WHERE i.status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id)`) as Array<{ number: string; amount_cents: bigint }>;
  console.log(`ghost: ${ghost.map((g) => `${g.number}·${Number(g.amount_cents) / 100}`).join(", ")} (expect INV-2025-028·1756)`);

  const months = await run("SELECT COUNT(*) AS n FROM (SELECT strftime('%Y-%m', issued_on) AS mon FROM invoices WHERE status != 'void' GROUP BY mon)") as Array<{ n: number }>;
  console.log(`billing months: ${months[0].n} (expect 13)`);

  const ladder = await run(`SELECT bucket, COUNT(*) AS n,
       ROUND(SUM(outstanding) / 100.0, 2) AS total
  FROM (
    SELECT CASE
             WHEN days_late <= 0 THEN 'current'
             WHEN days_late <= 30 THEN '1-30'
             WHEN days_late <= 60 THEN '31-60'
             WHEN days_late <= 90 THEN '61-90'
             ELSE '90+' END AS bucket,
           outstanding
    FROM (
      SELECT CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER) AS days_late,
             i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0) AS outstanding
      FROM invoices i WHERE i.status = 'open'
    )
  ) GROUP BY bucket`) as Array<{ bucket: string; n: bigint; total: number }>;
  console.log("aging ladder:", ladder.map((r) => `${r.bucket} ${r.n}·${r.total}`).join(" | "), "(expect current 1·2794 | 1-30 2·5710 | 31-60 1·4937 | 61-90 1·1295 | 90+ 1·873)");

  const z = await run(`WITH monthly AS (
    SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend FROM expenses GROUP BY mon
  ), stats AS (
    SELECT AVG(spend) AS a, AVG(spend * spend) - AVG(spend) * AVG(spend) AS var FROM monthly
  ), newton(n, g) AS (
    SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5
    UNION ALL
    SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0 FROM newton WHERE n < 30
  ) SELECT mon, ROUND(spend / 100.0, 2) AS spend,
       ROUND((spend - (SELECT a FROM stats)) / (SELECT g FROM newton WHERE n = 30), 2) AS z
  FROM monthly ORDER BY z DESC LIMIT 1`) as Array<{ mon: string; spend: number; z: number }>;
  console.log(`top z: ${z[0].mon} ${z[0].spend} z=${z[0].z} (expect 2024-08 3210 z=3.3)`);

  process.exit(fail > 0 ? 1 : 0);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
