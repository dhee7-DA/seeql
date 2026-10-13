import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
const q = (sql: string) => db.prepare(sql).all();
const show = (label: string, rows: unknown[]) => console.log("== " + label + "\n" + JSON.stringify(rows));

// ---- Q3b: partner fold, line-level revenue (no order fan-out) ----
const Q3 = (having: string, gb: string, cnt: string, order: string) =>
  `SELECT s.name AS partner, COUNT(DISTINCT o.id) AS sessions_touched, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS watch_units FROM suppliers s JOIN products p ON p.supplier_id = s.id JOIN order_items oi ON oi.product_id = p.id JOIN orders o ON o.id = oi.order_id GROUP BY ${gb} ${having} ORDER BY watch_units ${order}`;
show("Q3b correct", q(Q3("", "s.name", "COUNT(DISTINCT o.id)", "DESC")));
show("Q3b HAVING>=34", q(Q3("HAVING COUNT(DISTINCT o.id) >= 34", "s.name", "COUNT(DISTINCT o.id)", "DESC")));
show("Q3b distractor >=35", q(Q3("HAVING COUNT(DISTINCT o.id) >= 35", "s.name", "COUNT(DISTINCT o.id)", "DESC")));
show("Q3b distractor >=25", q(Q3("HAVING COUNT(DISTINCT o.id) >= 25", "s.name", "COUNT(DISTINCT o.id)", "DESC")));
show("Q3b distractor COUNT(oi.id)", q(Q3("", "s.name", "COUNT(oi.id)", "DESC")));
show("Q3b distractor GB p.id", q(Q3("", "p.id", "COUNT(DISTINCT o.id)", "DESC")));
show("Q3b distractor ASC", q(Q3("", "s.name", "COUNT(DISTINCT o.id)", "ASC")));
show("Q3b distractor raw unit_price sum", q(`SELECT s.name, ROUND(SUM(oi.unit_price),2) w FROM suppliers s JOIN products p ON p.supplier_id=s.id JOIN order_items oi ON oi.product_id=p.id GROUP BY s.name ORDER BY w DESC`));

// ---- Q6b: cohort state-log manifest (x1, no DISTINCT+sep) ----
const Q6 = (agg: string, sep: string, having: string, order: string) =>
  `SELECT c.region AS cohort, ${agg}(DISTINCT c.id) AS viewers, GROUP_CONCAT(o.status, '${sep}') AS state_log FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ${having} ORDER BY viewers ${order}`;
show("Q6b correct", q(Q6("COUNT", ", ", "HAVING COUNT(DISTINCT c.id) >= 5", "DESC")));
show("Q6b no-HAVING", q(Q6("COUNT", ", ", "", "DESC")));
show("Q6b distractor MAX", q(Q6("MAX", ", ", "HAVING COUNT(DISTINCT c.id) >= 5", "DESC")));
show("Q6b distractor sep |", q(Q6("COUNT", " | ", "HAVING COUNT(DISTINCT c.id) >= 5", "DESC")));
show("Q6b distractor >=4", q(Q6("COUNT", ", ", "HAVING COUNT(DISTINCT c.id) >= 4", "DESC")));
show("Q6b distractor ASC", q(Q6("COUNT", ", ", "HAVING COUNT(DISTINCT c.id) >= 5", "ASC")));

// ---- cross-figures ----
show("coverage census", q(`SELECT CASE WHEN (SELECT SUM(amount_cents) FROM payments p WHERE p.invoice_id=i.id) = i.amount_cents THEN 'exact' WHEN (SELECT SUM(amount_cents) FROM payments p WHERE p.invoice_id=i.id) IS NULL THEN 'none' ELSE 'partial' END cov, COUNT(*) n, ROUND(SUM(i.amount_cents)/100.0,2) inv_usd FROM invoices i GROUP BY cov`));
show("expenses by cat", q(`SELECT category, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) total FROM expenses GROUP BY category ORDER BY total DESC`));
show("expense peak month", q(`SELECT SUBSTR(spent_on,1,7) m, ROUND(SUM(amount_cents)/100.0,2) t FROM expenses GROUP BY m ORDER BY t DESC LIMIT 2`));
show("settlement pace", q(`SELECT COUNT(DISTINCT i.id) paid_inv, ROUND(AVG(julianday(p.paid_on)-julianday(i.issued_on)),1) avg_days, MIN(CAST(julianday(p.paid_on)-julianday(i.issued_on) AS INT)) fastest, MAX(CAST(julianday(p.paid_on)-julianday(i.issued_on) AS INT)) slowest FROM invoices i JOIN payments p ON p.invoice_id=i.id WHERE i.status='paid'`));
show("rail split", q(`SELECT method, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) total FROM payments GROUP BY method ORDER BY total DESC`));

// ---- slug pool ----
const md = await Bun.file("/home/z/my-project/scripts/company-pools.md").text();
const used = new Set(["top-five-artists","percentage-of-users-attended-a-contest","challenges","rank-scores","usage-tier-percentiles","compute-the-rank-as-a-percentage","find-the-team-size","project-employees-iii","game-play-analysis-iii","confirmation-rate","second-degree-follower","employees-earning-more-than-their-managers","classes-more-than-5-students","activity-participants","customer-order-frequency","the-category-of-each-member-in-the-store","calculate-special-bonus","the-winner-university","active-users","longest-winning-streak","consecutive-numbers","game-play-analysis-iv","managers-with-at-least-5-direct-reports","second-highest-salary","user-activity-for-the-past-30-days-i","tasks-count-in-the-weekend","the-latest-login-in-2020","null-blank-audit","find-customer-referee","books-with-null-ratings","find-followers-count","employee-task-duration-and-concurrent-tasks","find-zombie-sessions","viewers-turned-streamers","sessionize-events","find-bursty-behavior","find-peak-calling-hours-for-each-city","median-time-to-convert","rolling-7d-actives","dau-wau-stickiness","number-of-accounts-that-did-not-stream","calculate-compressed-mean","game-play-analysis-v"]);
const all: string[] = [];
let nonSql = 0;
for (const line of md.split("\n")) {
  const m = line.match(/^- ([a-z0-9-]+) \| /);
  if (!m) continue;
  if (!/ \| SQL /.test(line)) { nonSql++; continue; }
  all.push(m[1]);
}
const unused = all.filter((s) => !used.has(s));
console.log("== pools: sql-rows " + all.length + " nonSql " + nonSql + " unused " + unused.length);
let line = "";
for (const s of unused) {
  line += s + " ";
  if (line.length > 190) { console.log(line.trim()); line = ""; }
}
if (line) console.log(line.trim());
