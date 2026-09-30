// M5 Gauntlet — graded problems, medium tier (gm5-p31..p60).
// Staged window-over-derived-table reads: per-group top slices, tile audits,
// running-total crossings, LAG/LEAD deltas, percentile cuts, value-function
// ledgers. All facts probed via scripts/m5-facts{,2,3}.ts.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const m05ProblemsMedium: Problem[] = [
  p({
    id: "gm5-p31", difficulty: "medium", title: "The biggest ticket per customer",
    brief: "The classic top-one-per-group: ROW_NUMBER partitioned by customer, ordered by total descending, keeping rung 1. Sixteen rows — one flagship per account, from Alice's 767.64 to the book-wide 1088.44.",
    hints: ["Stage: SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) rn FROM orders.", "Outer: WHERE rn = 1 ORDER BY customer_id."],
    solution: "SELECT customer_id, id, total FROM (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rn FROM orders) WHERE rn = 1 ORDER BY customer_id;",
  }),
  p({
    id: "gm5-p32", difficulty: "medium", title: "The runner-up slice",
    brief: "Move one rung down the per-customer ladder: rn = 2 keeps every account's second-biggest ticket. Same stage, different WHERE — the window did the work once.",
    hints: ["Same stage as the rn = 1 audit; change the filter to rn = 2.", "ORDER BY customer_id."],
    solution: "SELECT customer_id, id, total FROM (SELECT customer_id, id, total, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS rn FROM orders) WHERE rn = 2 ORDER BY customer_id;",
  }),
  p({
    id: "gm5-p33", difficulty: "medium", ordered: true, title: "The whale quartile",
    brief: "Lifetime spend dealt into quartiles: tile 1 holds Alice Chen 7262.35, Emma Wilson 6640.56, Grace Kim 4574.23 and Maya Patel 3644.56. NTILE over a staged spend ladder names the whales.",
    hints: ["Stage: SELECT c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name.", "Outer: NTILE(4) OVER (ORDER BY spend DESC) AS tile, WHERE tile = 1 ORDER BY spend DESC."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, tile FROM (SELECT c.name, SUM(o.total) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE tile = 1 ORDER BY spend DESC;",
  }),
  p({
    id: "gm5-p34", difficulty: "medium", ordered: true, title: "The floor quartile",
    brief: "Tile 4 of the same deal: Liam O'Brien 705.39, Jamal Wright 645.60, Dmitri Volkov 599.26 and Olivia Brown 444.80 — the four lightest books. Flip the tile filter, keep the ladder.",
    hints: ["Same staged quartile; WHERE tile = 4.", "ORDER BY spend DESC."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, tile FROM (SELECT c.name, SUM(o.total) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS tile FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE tile = 4 ORDER BY spend DESC;",
  }),
  p({
    id: "gm5-p35", difficulty: "medium", title: "The decile census",
    brief: "NTILE(10) over sixteen customers cannot deal evenly: six tiles of two, then four singletons. The census makes the remainder rule visible — early tiles absorb the extras.",
    hints: ["Stage NTILE(10) OVER (ORDER BY id), then GROUP BY tile.", "SELECT tile, COUNT(*) AS n FROM (…) GROUP BY tile ORDER BY tile."],
    solution: "SELECT tile, COUNT(*) AS n FROM (SELECT NTILE(10) OVER (ORDER BY id) AS tile FROM customers) GROUP BY tile ORDER BY tile;",
  }),
  p({
    id: "gm5-p36", difficulty: "medium", ordered: true, title: "Crossing 15000",
    brief: "The monthly running revenue walk passes 15000 in May 2024 — 15337.91 after five months. Build the walk with SUM(SUM(total)) OVER (ORDER BY m), then filter the cumulative column outside the window level.",
    hints: ["Stage: SELECT strftime('%Y-%m', created_at) AS m, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt FROM orders GROUP BY m.", "Outer: WHERE rt > 15000 ORDER BY m LIMIT 1."],
    solution: "SELECT m, ROUND(rt, 2) AS rt FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt FROM orders GROUP BY m) WHERE rt > 15000 ORDER BY m LIMIT 1;",
  }),
  p({
    id: "gm5-p37", difficulty: "medium", ordered: true, title: "Crossing 30000",
    brief: "Push the same walk further: the cumulative ledger clears 30000 in December 2024 at 30773.25. Same stage, higher line — the walk is reusable infrastructure.",
    hints: ["Same monthly walk; change the line to rt > 30000.", "ORDER BY m LIMIT 1."],
    solution: "SELECT m, ROUND(rt, 2) AS rt FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt FROM orders GROUP BY m) WHERE rt > 30000 ORDER BY m LIMIT 1;",
  }),
  p({
    id: "gm5-p38", difficulty: "medium", ordered: true, title: "The month-over-month delta",
    brief: "LAG turns the monthly revenue spine into a movement report: February sheds 122.33, March sheds 992.56, and January reads NULL because nothing precedes it. Delta is rev minus its LAG.",
    hints: ["Stage monthly revenue: SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m.", "Outer: ROUND(rev - LAG(rev) OVER (ORDER BY m), 2) AS delta; ORDER BY m."],
    solution: "SELECT m, ROUND(rev, 2) AS rev, ROUND(rev - LAG(rev) OVER (ORDER BY m), 2) AS delta FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m) ORDER BY m;",
  }),
  p({
    id: "gm5-p39", difficulty: "medium", ordered: true, title: "Share of the grand total",
    brief: "SUM(total) OVER () computes the 34833.28 grand on every row, so each ticket's percentage share is one division away. The three biggest tickets lead the share board.",
    hints: ["ROUND(100.0 * total / SUM(total) OVER (), 4) AS share — the 100.0 keeps it real.", "SELECT id, total, … FROM orders ORDER BY total DESC LIMIT 3."],
    solution: "SELECT id, total, ROUND(100.0 * total / SUM(total) OVER (), 4) AS share FROM orders ORDER BY total DESC LIMIT 3;",
  }),
  p({
    id: "gm5-p40", difficulty: "medium", ordered: true, title: "Share within the status pool",
    brief: "Partition the grand-total trick by status: each pending ticket's share of the pending pool's own revenue. The denominator restarts per cohort — share becomes a local concept.",
    hints: ["ROUND(100.0 * total / SUM(total) OVER (PARTITION BY status), 4) AS status_share.", "SELECT id, status, total, … FROM orders WHERE status = 'pending' ORDER BY total DESC."],
    solution: "SELECT id, total, ROUND(100.0 * total / SUM(total) OVER (PARTITION BY status), 4) AS status_share FROM orders WHERE status = 'pending' ORDER BY total DESC;",
  }),
  p({
    id: "gm5-p41", difficulty: "medium", title: "The opening ledger",
    brief: "One row per customer with the ticket that opened their account: FIRST_VALUE partitioned by customer over the calendar walk, deduplicated to sixteen rows. Alice opened at 152.52; Bruno's opener was a 752.96 statement.",
    hints: ["Stage: SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders.", "Join customers, SELECT DISTINCT name + opening, ORDER BY name."],
    solution: "SELECT DISTINCT c.name, ROUND(f.ft, 2) AS opening_total FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders) f JOIN customers c ON c.id = f.customer_id ORDER BY c.name;",
  }),
  p({
    id: "gm5-p42", difficulty: "medium", title: "The big openers",
    brief: "Filter on the window value: four customers opened with a ticket above 500 — Bruno Silva 752.96, Grace Kim 725.34, Liam O'Brien 705.39 and Pedro Alvarez 576.54. The WHERE must live outside the window stage.",
    hints: ["Same opening stage as the ledger; outer WHERE ft > 500.", "Join customers for names; ORDER BY ft DESC."],
    solution: "SELECT c.name, ROUND(f.ft, 2) AS opening_total FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders) f JOIN customers c ON c.id = f.customer_id WHERE f.ft > 500 ORDER BY f.ft DESC;",
  }),
  p({
    id: "gm5-p43", difficulty: "medium", title: "Opening versus latest",
    brief: "Two value functions on one partition: FIRST_VALUE reads the account's opening ticket, LAST_VALUE with the full frame reads its latest. Sixteen rows of open-to-close shape.",
    hints: ["Both stamps in one stage: FIRST_VALUE(total) … and LAST_VALUE(total) … ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.", "SELECT DISTINCT customer_id, opening, latest, ORDER BY customer_id; join for names."],
    solution: "SELECT DISTINCT c.name, ROUND(f.op, 2) AS opening, ROUND(f.cl, 2) AS latest FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl FROM orders) f JOIN customers c ON c.id = f.customer_id ORDER BY c.name;",
  }),
  p({
    id: "gm5-p44", difficulty: "medium", title: "The wide-open closers",
    brief: "Flip the comparison: which customers opened bigger than they closed? The latest stamp undercut the opener for Alice (152.52 → 125.88), Bruno (752.96 → 99.48) and Grace (725.34 → 585.79) among others — the fade list.",
    hints: ["Same opening/latest stage; outer WHERE cl < op.", "Join for names; ORDER BY op - cl DESC puts the deepest fade first."],
    solution: "SELECT c.name, ROUND(f.op, 2) AS opening, ROUND(f.cl, 2) AS latest FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl FROM orders) f JOIN customers c ON c.id = f.customer_id WHERE f.cl < f.op ORDER BY f.op - f.cl DESC;",
  }),
  p({
    id: "gm5-p45", difficulty: "medium", ordered: true, title: "The spend ladder ranks",
    brief: "RANK over the staged lifetime spend: Alice 1, Emma 2, Grace 3, Maya 4, Chloe 5. Distinct spend values mean RANK and ROW_NUMBER agree — and the rank column survives into the outer query.",
    hints: ["Stage spend (GROUP BY c.name), then RANK() OVER (ORDER BY spend DESC) AS rk.", "Outer: WHERE rk <= 5 ORDER BY rk."],
    solution: "SELECT rk, name, ROUND(spend, 2) AS spend FROM (SELECT c.name, SUM(o.total) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.name) WHERE rk <= 5 ORDER BY rk;",
  }),
  p({
    id: "gm5-p46", difficulty: "medium", ordered: true, title: "The month board, dense",
    brief: "DENSE_RANK the fourteen months by revenue: January 3731.97 holds rank 1, February 3609.64 rank 2, and September's 3116.04 takes rank 3. The dense form never skips after ties.",
    hints: ["Stage monthly revenue; DENSE_RANK() OVER (ORDER BY rev DESC) AS drk.", "Outer: WHERE drk <= 3 ORDER BY drk."],
    solution: "SELECT drk, m, ROUND(rev, 2) AS rev FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev, DENSE_RANK() OVER (ORDER BY SUM(total) DESC) AS drk FROM orders GROUP BY m) WHERE drk <= 3 ORDER BY drk;",
  }),
  p({
    id: "gm5-p47", difficulty: "medium", ordered: true, title: "The three-row walk",
    brief: "A centered frame: SUM over ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING makes each row the sum of its neighbor trio — 1478.30 opens, then 1630.82, 1454.40, 1145.87, 1175.03. Edges simply see fewer peers.",
    hints: ["SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING).", "SELECT id, total, ROUND(…, 2) AS trio FROM orders ORDER BY created_at, id LIMIT 5."],
    solution: "SELECT id, total, ROUND(SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING), 2) AS trio FROM orders ORDER BY created_at, id LIMIT 5;",
  }),
  p({
    id: "gm5-p48", difficulty: "medium", ordered: true, title: "The look-ahead sum",
    brief: "A partial frame reaches forward: UNBOUNDED PRECEDING to 2 FOLLOWING accumulates history plus a two-row preview — 1630.82, 2207.36, 2624.17, 2805.85, 2964.33 over the first five tickets.",
    hints: ["SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND 2 FOLLOWING).", "SELECT id, total, ROUND(…, 2) AS pf FROM orders ORDER BY created_at, id LIMIT 5."],
    solution: "SELECT id, total, ROUND(SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND 2 FOLLOWING), 2) AS pf FROM orders ORDER BY created_at, id LIMIT 5;",
  }),
  p({
    id: "gm5-p49", difficulty: "medium", ordered: true, title: "The rest-day gaps",
    brief: "julianday plus LAG measures the calendar: customer 1's early ordering runs NULL, 20 days, 29 days, 5 days between tickets. The gap column is the cadence report purchasing never wrote down.",
    hints: ["ROUND(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)), 1) AS gap_days.", "SELECT id, created_at, … FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4."],
    solution: "SELECT id, created_at, ROUND(julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)), 1) AS gap_days FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4;",
  }),
  p({
    id: "gm5-p50", difficulty: "medium", title: "The up-tick census",
    brief: "How many orders were followed by a bigger one? LEAD over the calendar walk answers in one stage: 48 of the 103 tickets have a richer successor. The NULL tail simply fails the comparison.",
    hints: ["Stage: SELECT total, LEAD(total) OVER (ORDER BY created_at, id) AS nt FROM orders.", "Outer: SELECT COUNT(*) FROM (…) WHERE nt > total."],
    solution: "SELECT COUNT(*) AS up_ticks FROM (SELECT total, LEAD(total) OVER (ORDER BY created_at, id) AS nt FROM orders) WHERE nt > total;",
  }),
  p({
    id: "gm5-p51", difficulty: "medium", title: "The big jumps",
    brief: "LAG as a detector: count the tickets that jumped more than 100 above their calendar predecessor. The book has 42 such leaps — spikes the fraud desk would eyeball first.",
    hints: ["Stage LAG(total) OVER (ORDER BY created_at, id) AS pt; guard pt IS NOT NULL.", "Outer: SELECT COUNT(*) FROM (…) WHERE total - pt > 100."],
    solution: "SELECT COUNT(*) AS big_jumps FROM (SELECT total, LAG(total) OVER (ORDER BY created_at, id) AS pt FROM orders) WHERE pt IS NOT NULL AND total - pt > 100;",
  }),
  p({
    id: "gm5-p52", difficulty: "medium", title: "The top-quartile tickets",
    brief: "CUME_DIST at or under 0.25 marks the top quartile of the 103-ticket book: 25 orders carry a quarter of the population's share. The percentile cut, counted.",
    hints: ["Stage ROUND(CUME_DIST() OVER (ORDER BY total DESC), 4) AS cd.", "Outer: SELECT COUNT(*) FROM (…) WHERE cd <= 0.25."],
    solution: "SELECT COUNT(*) AS top_quartile FROM (SELECT total, CUME_DIST() OVER (ORDER BY total DESC) AS cd FROM orders) WHERE cd <= 0.25;",
  }),
  p({
    id: "gm5-p53", difficulty: "medium", title: "The bottom decile",
    brief: "PERCENT_RANK at or above 0.9 is the book's floor: 11 tickets sit in the bottom ten percent by total. The percentile ladder read from the cheap end.",
    hints: ["Stage ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr.", "Outer: SELECT COUNT(*) FROM (…) WHERE pr >= 0.9."],
    solution: "SELECT COUNT(*) AS bottom_decile FROM (SELECT total, PERCENT_RANK() OVER (ORDER BY total DESC) AS pr FROM orders) WHERE pr >= 0.9;",
  }),
  p({
    id: "gm5-p54", difficulty: "medium", ordered: true, title: "The invoice dollars",
    brief: "Finance stores integer cents; readers want dollars. CAST(amount_cents AS REAL) before dividing — the first three invoices convert 486000, 214300 and 342000 cents into clean dollars.",
    hints: ["CAST(amount_cents AS REAL) / 100 — cast FIRST or integer division truncates.", "SELECT number, amount_cents, CAST(amount_cents AS REAL) / 100 AS dollars FROM invoices ORDER BY id LIMIT 3."],
    solution: "SELECT number, amount_cents, CAST(amount_cents AS REAL) / 100 AS dollars FROM invoices ORDER BY id LIMIT 3;",
  }),
  p({
    id: "gm5-p55", difficulty: "medium", title: "The integer-division fence",
    brief: "One query, three divisions: 7 / 2 truncates to 3, 7 / 2.0 yields 3.5, and CAST(7 AS REAL) / 2 also yields 3.5. The type fence every analyst trips over once — then never again.",
    hints: ["SELECT 7 / 2, 7 / 2.0, CAST(7 AS REAL) / 2 with aliases int_div, real_div, cast_div.", "No FROM needed — but alias every column."],
    solution: "SELECT 7 / 2 AS int_div, 7 / 2.0 AS real_div, CAST(7 AS REAL) / 2 AS cast_div;",
  }),
  p({
    id: "gm5-p56", difficulty: "medium", title: "The type row",
    brief: "typeof exposes the storage classes under one order row: integer id, text status, real total, and a NULL shipped_at until shipping happens. One row, four type receipts.",
    hints: ["typeof(x) returns 'integer', 'real', 'text' or 'null'.", "SELECT typeof(id) AS t_id, typeof(status) AS t_status, typeof(total) AS t_total, typeof(shipped_at) AS t_ship FROM orders ORDER BY id LIMIT 1."],
    solution: "SELECT typeof(id) AS t_id, typeof(status) AS t_status, typeof(total) AS t_total, typeof(shipped_at) AS t_ship FROM orders ORDER BY id LIMIT 1;",
  }),
  p({
    id: "gm5-p57", difficulty: "medium", title: "The coercion receipt",
    brief: "SQLite's flexible typing on display: '1' + 1 coerces to 2, CAST('42' AS INTEGER) parses to 42, and CAST('abc' AS INTEGER) fails politely to 0. Three literals, three conversion rules.",
    hints: ["SELECT '1' + 1, CAST('42' AS INTEGER), CAST('abc' AS INTEGER) — alias them coerced, parsed, failed.", "Single-row query; no FROM required."],
    solution: "SELECT '1' + 1 AS coerced, CAST('42' AS INTEGER) AS parsed, CAST('abc' AS INTEGER) AS failed;",
  }),
  p({
    id: "gm5-p58", difficulty: "medium", ordered: true, title: "The region directory tags",
    brief: "Concatenation builds display strings: name || ' (' || region || ')' turns the directory into 'Alice Chen (EU)' and friends. The first three tags make the label format concrete.",
    hints: ["name || ' (' || region || ')' — the || operator glues text.", "SELECT name || ' (' || region || ')' AS tag FROM customers ORDER BY name LIMIT 3."],
    solution: "SELECT name || ' (' || region || ')' AS tag FROM customers ORDER BY name LIMIT 3;",
  }),
  p({
    id: "gm5-p59", difficulty: "medium", title: "The domain census",
    brief: "INSTR finds the @, SUBSTR slices past it: every customer email lives on example.com, so the census returns one row of sixteen. String surgery feeding a GROUP BY.",
    hints: ["SUBSTR(email, INSTR(email, '@') + 1) extracts the domain.", "SELECT … AS dom, COUNT(*) AS n FROM customers GROUP BY dom."],
    solution: "SELECT SUBSTR(email, INSTR(email, '@') + 1) AS dom, COUNT(*) AS n FROM customers GROUP BY dom;",
  }),
  p({
    id: "gm5-p60", difficulty: "medium", title: "The rounding rule",
    brief: "SQLite rounds halves away from zero: ROUND(2.5) is 3, ROUND(3.5) is 4, and ROUND(-2.5) is -3. Three literals nail the rule before it matters on money.",
    hints: ["SELECT ROUND(2.5), ROUND(3.5), ROUND(-2.5) — alias them a, b, c.", "Single-row query; compare against banker's-rounding expectations."],
    solution: "SELECT ROUND(2.5) AS a, ROUND(3.5) AS b, ROUND(-2.5) AS c;",
  }),
];
