// Funnel engine test: run the probes against the sample DB for several query shapes.

import { runFunnel } from "../src/lib/sql-funnel";

const CASES: Array<[string, string]> = [
  [
    "simple filter+limit",
    `SELECT id, full_name, email FROM customers WHERE is_active = 1 AND email LIKE '%@example.com%' ORDER BY id LIMIT 20`,
  ],
  [
    "join + group + having",
    `SELECT c.full_name, o.status, COUNT(*) AS n, SUM(o.total_amount) AS rev
     FROM customers c INNER JOIN orders o ON o.customer_id = c.id
     WHERE o.order_date >= '2024-06-01'
     GROUP BY c.full_name, o.status HAVING COUNT(*) > 3 ORDER BY rev DESC`,
  ],
  [
    "left join orphans",
    `SELECT o.id, o.customer_id FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE c.id IS NULL OR o.customer_id IS NULL`,
  ],
  [
    "distinct",
    `SELECT DISTINCT category FROM products`,
  ],
  [
    "aggregation only",
    `SELECT COUNT(*) AS n, AVG(total_amount) AS avg_total FROM orders`,
  ],
  [
    "union (not applicable)",
    `SELECT full_name FROM customers WHERE country = 'USA' UNION SELECT product_name FROM products WHERE price > 100`,
  ],
  ["update (not applicable)", `UPDATE customers SET is_active = 1 WHERE id = 1`],
  [
    "three-way join",
    `SELECT p.product_name, SUM(oi.quantity) AS qty
     FROM order_items oi
     JOIN orders o ON o.id = oi.order_id
     JOIN products p ON p.id = oi.product_id
     GROUP BY p.product_name ORDER BY qty DESC LIMIT 10`,
  ],
];

async function main() {
  for (const [label, sql] of CASES) {
    const res = await runFunnel(sql, "sqlite");
    console.log("\n===", label, "===");
    if (!res.ok) {
      console.log("  ERROR:", res.error);
      continue;
    }
    if (!res.applicable) {
      console.log("  not applicable:", res.reason, "| finalRows:", res.finalRows);
      continue;
    }
    for (const s of res.stages) {
      console.log(`  ${s.label.padEnd(28)} ${String(s.count ?? "?").padStart(6)}  ${s.delta ?? ""}  (${s.detail})`);
    }
    if (res.filters.length) {
      for (const f of res.filters) console.log(`  filter: ${f.text} | ind=${f.individual} cum=${f.cumulative}`);
    }
    for (const j of res.joins) {
      console.log(
        `  join ${j.left} <-${j.type}-> ${j.right} | ${j.before} -> ${j.after} (x${j.multiplier}) unmatchedLeft=${j.unmatchedLeft} ON ${j.on}`,
      );
    }
  }
  process.exit(0);
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
