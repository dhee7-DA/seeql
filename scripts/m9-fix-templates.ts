// One-shot: rewrite the non-self-contained templates in fills/m09.ts so every
// completed SQL runs standalone against the seed db. Operates on raw source
// text — templates are keyed by fill id.
import * as fs from "fs";

const PATH = "src/lib/curriculum/fills/m09.ts";
let src = fs.readFileSync(PATH, "utf8");

// JS string below: \\n = literal backslash-n pair in the target file.
const REPLACEMENTS: Array<[string, string]> = [
  ["l53-f2", `SELECT d,\n       ROUND(SUM(amt) OVER ({1} d) / 100.0, 2) AS balance\nFROM (\n  SELECT issued_on AS d, amount_cents AS amt FROM invoices WHERE customer_id = 1\n  UNION ALL\n  SELECT p.paid_on, -p.amount_cents\n  FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.customer_id = 1\n) t\nORDER BY d;`],
  ["l53-f3", `SELECT name, d,\n       SUM(amt) OVER (PARTITION BY {1} ORDER BY d) / 100.0 AS balance\nFROM (\n  SELECT c.name, i.issued_on AS d, i.amount_cents AS amt\n  FROM invoices i JOIN customers c ON c.id = i.customer_id\n  UNION ALL\n  SELECT c.name, p.paid_on, -p.amount_cents\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n  JOIN customers c ON c.id = i.customer_id\n) t;`],
  ["l54-f2", `SELECT CASE\n         WHEN days_late <= 0 THEN 'current'\n         WHEN days_late <= 30 THEN '1-30'\n         WHEN days_late <= 60 THEN '31-60'\n         WHEN days_late <= 90 THEN '61-90'\n         ELSE '90+' END AS bucket\nFROM (\n  SELECT CAST(julianday('2025-03-15') - julianday(due_on) AS INTEGER) AS days_late\n  FROM invoices WHERE status = 'open'\n);`],
  ["l54-f4", `SELECT bucket, COUNT(*) AS n,\n       ROUND(SUM(outstanding) / 100.0, 2) AS total\nFROM (\n  SELECT CASE\n           WHEN days_late <= 0 THEN 'current'\n           WHEN days_late <= 30 THEN '1-30'\n           WHEN days_late <= 60 THEN '31-60'\n           WHEN days_late <= 90 THEN '61-90'\n           ELSE '90+' END AS bucket,\n         outstanding\n  FROM (\n    SELECT i.number,\n           CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER) AS days_late,\n           i.amount_cents - COALESCE((SELECT SUM(p.amount_cents)\n             FROM payments p WHERE p.invoice_id = i.id), 0) AS outstanding\n    FROM invoices i WHERE i.status = 'open'\n  )\n)\nGROUP BY bucket\nORDER BY CASE bucket WHEN 'current' THEN 0 WHEN '1-30' THEN 1\n                     WHEN '31-60' THEN 2 WHEN '61-90' THEN 3\n                     ELSE {1} END;`],
  ["l54-f5", `SELECT\n  ROUND(SUM(CASE WHEN days_late <= 0 THEN out ELSE 0 END) / 100.0, 2) AS current,\n  ROUND(SUM(CASE WHEN days_late > 90 THEN out {1} 0 END) / 100.0, 2) AS b90plus\nFROM (\n  SELECT CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER) AS days_late,\n         i.amount_cents - COALESCE((SELECT SUM(p.amount_cents)\n           FROM payments p WHERE p.invoice_id = i.id), 0) AS out\n  FROM invoices i WHERE i.status = 'open'\n);`],
  ["l55-f2", `SELECT mon, rev,\n       {1}(rev) OVER (ORDER BY mon) AS prev\nFROM (\n  SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev\n  FROM invoices WHERE status != 'void'\n  GROUP BY mon\n) monthly;`],
  ["l55-f3", `SELECT mon,\n  ROUND(100.0 * (rev - prev) / {1}, 1) AS pct\nFROM (\n  SELECT mon, rev, LAG(rev) OVER (ORDER BY mon) AS prev\n  FROM (\n    SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev\n    FROM invoices WHERE status != 'void'\n    GROUP BY mon\n  ) monthly\n) peeked\nORDER BY mon;`],
  ["l55-f4", `SELECT mon,\n  ROUND(AVG(rev) OVER (\n    ORDER BY mon\n    {1} BETWEEN 2 PRECEDING AND CURRENT ROW\n  ) / 100.0, 2) AS ma3\nFROM (\n  SELECT strftime('%Y-%m', issued_on) AS mon, SUM(amount_cents) AS rev\n  FROM invoices WHERE status != 'void'\n  GROUP BY mon\n) monthly;`],
  ["l57-f2", `SELECT AVG(spend * spend) - AVG(spend) * {1} AS var\nFROM (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n) monthly;`],
  ["l57-f3", `WITH monthly AS (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n),\nstats AS (\n  SELECT AVG(spend) AS a, AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n  FROM monthly\n),\nnewton(n, g) AS (\n  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n  UNION ALL\n  SELECT n + 1, (g + (SELECT var FROM stats) / {1}) / 2.0\n  FROM newton WHERE n < 30\n)\nSELECT n, g FROM newton WHERE n = 30;`],
  ["l57-f4", `WITH monthly AS (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n),\nstats AS (\n  SELECT AVG(spend) AS a, AVG(spend * spend) - AVG(spend) * AVG(spend) AS var\n  FROM monthly\n),\nnewton(n, g) AS (\n  SELECT 0, (SELECT var FROM stats) / 2.0 + 0.5\n  UNION ALL\n  SELECT n + 1, (g + (SELECT var FROM stats) / g) / 2.0\n  FROM newton WHERE n < 30\n)\nSELECT mon,\n       ROUND((spend - (SELECT a FROM stats))\n                   / (SELECT {1} FROM newton WHERE n = 30), 2) AS z\nFROM monthly\nORDER BY z DESC;`],
  ["l57-f5", `SELECT mon, spend,\n       {1}(spend) OVER (ORDER BY mon) AS biggest_so_far\nFROM (\n  SELECT strftime('%Y-%m', spent_on) AS mon, SUM(amount_cents) AS spend\n  FROM expenses GROUP BY mon\n) me;`],
];

let done = 0;
for (const [id, tpl] of REPLACEMENTS) {
  // raw source: \n here is the literal two-char pair, expressed as \\n in JS
  const escaped = tpl.replace(/\\/g, "\\\\").replace(/\n/g, "\\n");
  const re = new RegExp(`(id: "${id}"[\\s\\S]*?template: ")(?:[^"\\\\]|\\\\.)*(")`);
  if (!re.test(src)) { console.log(`MISS ${id}`); continue; }
  src = src.replace(re, `$1${escaped}$2`);
  done++;
}
fs.writeFileSync(PATH, src);
console.log(`rewrote ${done}/${REPLACEMENTS.length} templates`);
