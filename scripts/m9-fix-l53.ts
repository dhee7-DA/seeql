// One-shot: repair the L53 template/answer alignment in fills/m09.ts.
// f2 = UNION ALL staging (slot between arms), f3 = the walk (slot in OVER),
// f4 = partitioned walk (slot in PARTITION BY).
import * as fs from "fs";

const PATH = "src/lib/curriculum/fills/m09.ts";
let src = fs.readFileSync(PATH, "utf8");

const T = {
  staging: `SELECT 'invoice' AS kind, issued_on AS d, amount_cents AS amt\nFROM invoices\nWHERE customer_id = 1\n{1}\nSELECT 'payment', p.paid_on, -p.amount_cents\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nWHERE i.customer_id = 1;`,
  walk: `SELECT d,\n       ROUND(SUM(amt) OVER ({1} d) / 100.0, 2) AS balance\nFROM (\n  SELECT issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1\n  UNION ALL\n  SELECT p.paid_on, -p.amount_cents\n  FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1\n) t\nORDER BY d;`,
  partition: `SELECT name, d,\n       SUM(amt) OVER (PARTITION BY {1} ORDER BY d) / 100.0 AS balance\nFROM (\n  SELECT c.name, i.issued_on AS d, i.amount_cents AS amt\n  FROM invoices i JOIN customers c ON c.id = i.customer_id\n  UNION ALL\n  SELECT c.name, p.paid_on, -p.amount_cents\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n) t;`,
};

for (const [id, tpl] of [["l53-f2", T.staging], ["l53-f3", T.walk], ["l53-f4", T.partition]] as const) {
  const escaped = tpl.replace(/\n/g, "\\n");
  const re = new RegExp(`(id: "${id}"[\\s\\S]*?template: ")(?:[^"\\\\]|\\\\.)*(")`);
  if (!re.test(src)) { console.log(`MISS ${id}`); continue; }
  src = src.replace(re, `$1${escaped}$2`);
  console.log(`fixed ${id}`);
}
fs.writeFileSync(PATH, src);
