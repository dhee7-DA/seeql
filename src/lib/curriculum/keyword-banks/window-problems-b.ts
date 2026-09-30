// Keyword Mastery bank — PERCENT_RANK/CUME_DIST problems (kb-pr-i01..i12)
// + Running totals problems (kb-rt-i01..i05).
// Probed facts: spend ranking desc — Alice 7262.35 (pr 0, cd 0.0625), Emma
// 6640.56 (0.0667/0.125), Grace 4574.23 (0.1333/0.1875), Maya 3644.56
// (0.2/0.25); monthly running total crosses 20000 in Aug (20931.27); grand
// 34833.28. Running-totals problems carry the prose triggers ("running
// total"/"cumulative"/"balance walk") the taxonomy scanner requires.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const windowProblemsB: Problem[] = [
  p({
    id: "kb-pr-i01", difficulty: "easy",
    title: "The percentile roster",
    brief: "Every customer ranked with both percentile dials: PERCENT_RANK (share of rows strictly below, 0-based) and CUME_DIST (share at or above, peer-inclusive). Lifetime spend drives the descending ranking; sixteen customers, sixteen positions.",
    hints: ["Stage spend: SELECT c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name (derived table).", "Add ROUND(PERCENT_RANK() OVER (ORDER BY spend DESC), 4) AS pr and ROUND(CUME_DIST() OVER (ORDER BY spend DESC), 4) AS cd; ORDER BY spend DESC."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, ROUND(PERCENT_RANK() OVER (ORDER BY spend DESC), 4) AS pr, ROUND(CUME_DIST() OVER (ORDER BY spend DESC), 4) AS cd FROM (SELECT c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) ORDER BY spend DESC;",
  }),
  p({
    id: "kb-pr-i02", difficulty: "easy",
    title: "The champion's standing",
    brief: "The top spender's exact position: percent_rank 0 (nobody strictly below) and cume_dist 0.0625 (one of sixteen at or above). One row, both dials, the head of the distribution.",
    hints: ["Same staged spend ranking as the roster; ORDER BY spend DESC LIMIT 1 keeps the head row.", "Both window columns ride the same OVER (ORDER BY spend DESC)."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, ROUND(PERCENT_RANK() OVER (ORDER BY spend DESC), 4) AS pr, ROUND(CUME_DIST() OVER (ORDER BY spend DESC), 4) AS cd FROM (SELECT c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) ORDER BY spend DESC LIMIT 1;",
  }),
  p({
    id: "kb-pr-i03", difficulty: "easy",
    title: "The cheap end's cumulative share",
    brief: "Walk the five cheapest orders with CUME_DIST over total ASC — the cumulative population share as the ladder climbs off the floor. The 25.47 opener carries 1/103; each rung adds its share.",
    hints: ["ROUND(CUME_DIST() OVER (ORDER BY total), 4) AS cd — ascending order accumulates from the cheapest.", "SELECT id, total, cd FROM orders ORDER BY total LIMIT 5."],
    solution: "SELECT id, total, ROUND(CUME_DIST() OVER (ORDER BY total), 4) AS cd FROM orders ORDER BY total LIMIT 5;",
  }),
  p({
    id: "kb-pr-i04", difficulty: "medium",
    title: "The top-quartile cohort",
    brief: "The share-based cut: customers in the top 25% of lifetime spend. CUME_DIST over spend DESC stays at or under 0.25 for the first four rungs (1/16 through 4/16) — the percentile form of 'top quartile', exact where NTILE approximates.",
    hints: ["Stage spend + ROUND(CUME_DIST() OVER (ORDER BY spend DESC), 4) AS cd in a derived table.", "Outer: SELECT name, spend FROM (…) WHERE cd <= 0.25 ORDER BY spend DESC."],
    solution: "SELECT name, ROUND(spend, 2) AS spend FROM (SELECT c.name, SUM(o.total) AS spend, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC), 4) AS cd FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE cd <= 0.25 ORDER BY spend DESC;",
  }),
  p({
    id: "kb-pr-i05", difficulty: "medium",
    title: "The median customer",
    brief: "The customer standing exactly at the distribution's halfway mark: cume_dist 0.5 means eight of sixteen at or above — the median position by population. One row, found by the share rather than by counting.",
    hints: ["Derived table stages spend and ROUND(CUME_DIST() OVER (ORDER BY spend DESC), 4) AS cd.", "Outer: WHERE cd = 0.5 — the median share of a 16-row population."],
    solution: "SELECT name, ROUND(spend, 2) AS spend FROM (SELECT c.name, SUM(o.total) AS spend, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC), 4) AS cd FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE cd = 0.5;",
  }),
  p({
    id: "kb-pr-i06", difficulty: "medium",
    title: "Above the line, priced in",
    brief: "Orders above 900 with each ticket's PERCENT_RANK over total DESC — the champion reads 0, the runner-up reads its share of the 103-row field. Percentiles position tickets against the whole book, not just the premium slice.",
    hints: ["ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr over all orders.", "WHERE total > 900; ORDER BY total DESC."],
    solution: "SELECT id, total, ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr FROM orders WHERE total > 900 ORDER BY total DESC;",
  }),
  p({
    id: "kb-pr-i07", difficulty: "medium",
    title: "The quartile boundary",
    brief: "Exactly who stands at the 0.25 share? The fourth-biggest spender carries cume_dist 4/16 = 0.25 — the boundary row of the top quartile. Fetching it by share (not by row count) is the percentile habit this bank teaches.",
    hints: ["Stage spend + cd (CUME_DIST over spend DESC).", "Outer: WHERE cd = 0.25."],
    solution: "SELECT name, ROUND(spend, 2) AS spend FROM (SELECT c.name, SUM(o.total) AS spend, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC), 4) AS cd FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE cd = 0.25;",
  }),
  p({
    id: "kb-pr-i08", difficulty: "hard",
    title: "Region-scoped percentiles",
    brief: "Percentiles within populations: PARTITION BY region re-runs the distribution inside each region, so EU's eight customers climb their own 1/8-to-1 ladder while the US pair climbs a 1/2 ladder. One query, several distributions.",
    hints: ["Stage spend, then ROUND(CUME_DIST() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC), 4) AS cd.", "SELECT region, name, spend, cd … ORDER BY region, spend DESC."],
    solution: "SELECT region, name, ROUND(spend, 2) AS spend, ROUND(cd, 4) AS cd FROM (SELECT c.region, c.name, SUM(o.total) AS spend, CUME_DIST() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS cd FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.name) ORDER BY region, spend DESC;",
  }),
  p({
    id: "kb-pr-i09", difficulty: "hard",
    title: "The Pareto read",
    brief: "Concentration: what share of revenue do the top-quartile tickets carry? Flag orders whose CUME_DIST over total DESC sits at or under 0.25 (the biggest 26 of 103), sum their totals, and divide by the grand 34833.28 — the concentration percentage in one staged pass.",
    hints: ["Derived: SELECT id, total, ROUND(CUME_DIST() OVER (ORDER BY total DESC), 4) AS cd FROM orders.", "Outer: SELECT ROUND(100.0 * SUM(CASE WHEN cd <= 0.25 THEN total END) / SUM(total), 2) AS top_quartile_share FROM (…)."],
    solution: "SELECT ROUND(100.0 * SUM(CASE WHEN cd <= 0.25 THEN total END) / SUM(total), 2) AS top_quartile_share FROM (SELECT id, total, ROUND(CUME_DIST() OVER (ORDER BY total DESC), 4) AS cd FROM orders);",
  }),
  p({
    id: "kb-pr-i10", difficulty: "hard",
    title: "The pending ladder",
    brief: "The fourteen pending tickets ranked with PERCENT_RANK over total DESC — the undecided money positioned within its own cohort. The champion of pending reads 0; the ladder walks to 1 across fourteen rungs.",
    hints: ["ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr over all orders — the WHERE trims the field to pending BEFORE the window runs.", "WHERE status = 'pending'; ORDER BY total DESC."],
    solution: "SELECT id, total, ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr FROM orders WHERE status = 'pending' ORDER BY total DESC;",
  }),
  p({
    id: "kb-pr-i11", difficulty: "hard",
    title: "Months on the percentile board",
    brief: "Rank the fourteen months by revenue with both dials: PERCENT_RANK and CUME_DIST over the monthly revenue, descending. January's 3731.97 opens at zero; the worst month closes at one — the calendar's shape as a percentile ladder.",
    hints: ["Stage monthly revenue: SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m (derived).", "Add ROUND(PERCENT_RANK() OVER (ORDER BY rev DESC), 4) AS pr, ROUND(CUME_DIST() OVER (ORDER BY rev DESC), 4) AS cd; ORDER BY rev DESC."],
    solution: "SELECT m, ROUND(rev, 2) AS rev, ROUND(PERCENT_RANK() OVER (ORDER BY rev DESC), 4) AS pr, ROUND(CUME_DIST() OVER (ORDER BY rev DESC), 4) AS cd FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m) ORDER BY rev DESC;",
  }),
  p({
    id: "kb-pr-i12", difficulty: "hard",
    title: "The population-half check",
    brief: "Two medians, one table: the customer whose cume_dist reads 0.5 (population median) beside the average spend (value mean). The row proves they are different animals — the median POSITION is not the mean VALUE.",
    hints: ["Derived stages spend + ROUND(CUME_DIST() OVER (ORDER BY spend DESC), 4) AS cd; scalar subquery computes AVG(spend).", "SELECT name, ROUND(spend, 2) AS spend, ROUND((SELECT AVG(spend) FROM (SELECT c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name)), 2) AS avg_spend FROM (…) WHERE cd = 0.5."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, ROUND((SELECT AVG(spend) FROM (SELECT c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name)), 2) AS avg_spend FROM (SELECT c.name, SUM(o.total) AS spend, ROUND(CUME_DIST() OVER (ORDER BY SUM(o.total) DESC), 4) AS cd FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE cd = 0.5;",
  }),
  p({
    id: "kb-rt-i01", difficulty: "easy",
    title: "The revenue walk",
    brief: "The canonical running total: monthly revenue accumulated across the fourteen-month timeline. SUM(SUM(total)) OVER (ORDER BY month) walks 3731.97 in January up to the 34833.28 grand total — the cumulative ledger of the whole storefront.",
    hints: ["Stage monthly revenue: SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m.", "Walk it: SUM(rev) OVER (ORDER BY m) AS running_total in the outer SELECT; ORDER BY m."],
    solution: "SELECT m, ROUND(rev, 2) AS rev, ROUND(SUM(rev) OVER (ORDER BY m), 2) AS running_total FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m) ORDER BY m;",
  }),
  p({
    id: "kb-rt-i02", difficulty: "easy",
    title: "The strict count walk",
    brief: "Customer 1's running ORDER COUNT, forced row-by-row with a ROWS frame: 1, 2, 3… across their 24 orders. The default RANGE frame would leap over same-date peers; the ROWS frame counts rows, not values — the cumulative census done precisely.",
    hints: ["COUNT(*) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_count.", "WHERE customer_id = 1; ORDER BY created_at, id."],
    solution: "SELECT id, created_at, total, COUNT(*) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_count FROM orders WHERE customer_id = 1 ORDER BY created_at, id;",
  }),
  p({
    id: "kb-rt-i03", difficulty: "medium",
    title: "Crossing the 20000 line",
    brief: "Which month does the running revenue total first cross 20000? Build the walk, then filter the CUMULATIVE column outside the window level — the derived-table staging is mandatory because WHERE runs before windows. August's 20931.27 is the answer to find.",
    hints: ["Stage the walk: SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt FROM orders GROUP BY m — the aggregate-of-aggregate running total.", "Outer: SELECT m, ROUND(rt, 2) FROM (…) WHERE rt > 20000 ORDER BY m LIMIT 1."],
    solution: "SELECT m, ROUND(rt, 2) AS rt FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt FROM orders GROUP BY m) WHERE rt > 20000 ORDER BY m LIMIT 1;",
  }),
  p({
    id: "kb-rt-i04", difficulty: "medium",
    title: "The balance walk",
    brief: "Customer 5's ledger as a bank book: every order stamped with the running BALANCE after it — SUM(total) walking across the account's 17 orders, ending at their 3644.56 lifetime. The balance walk is the running total wearing a per-partition key.",
    hints: ["SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS balance — partition restarts the walk per account.", "WHERE customer_id = 5; ORDER BY created_at, id."],
    solution: "SELECT id, created_at, total, ROUND(SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at, id), 2) AS balance FROM orders WHERE customer_id = 5 ORDER BY created_at, id;",
  }),
  p({
    id: "kb-rt-i05", difficulty: "hard",
    title: "The trailing average",
    brief: "Smooth the calendar: a 3-month TRAILING average of monthly revenue, where each month averages itself and its two predecessors. The frame clause — ROWS BETWEEN 2 PRECEDING AND CURRENT ROW — turns the running total's endless walk into a sliding window; edge months simply see less history.",
    hints: ["Stage monthly revenue first (GROUP BY m).", "AVG(rev) OVER (ORDER BY m ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS trailing_avg — a 3-row frame; ORDER BY m; ROUND(…, 2)."],
    solution: "SELECT m, ROUND(rev, 2) AS rev, ROUND(AVG(rev) OVER (ORDER BY m ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 2) AS trailing_avg FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m) ORDER BY m;",
  }),
];
