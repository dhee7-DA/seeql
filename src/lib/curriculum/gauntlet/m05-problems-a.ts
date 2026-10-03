// M5 Gauntlet — graded problems, easy tier (gm5-p01..p30).
// Direct single-window reads over the seed storefront: stamps, ladders, tiles,
// neighbors, value functions, text/CAST/round reshapes. All facts probed via
// scripts/m5-facts{,2,3}.ts; gen-expected verifies every target.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const m05ProblemsEasy: Problem[] = [
  p({
    id: "gm5-p01", difficulty: "easy", ordered: true, title: "The row-keeper stamp",
    brief: "Warm-up on the gentlest window: stamp every order with COUNT(*) OVER() so each row carries the ledger's full size — 103 — without collapsing anything. First three rows of the walk.",
    hints: ["COUNT(*) OVER () keeps every row and repeats the grand count on each.", "SELECT id, total, COUNT(*) OVER () AS all_rows FROM orders ORDER BY id LIMIT 3."],
    solution: "SELECT id, total, COUNT(*) OVER () AS all_rows FROM orders ORDER BY id LIMIT 3;",
  }),
  p({
    id: "gm5-p02", difficulty: "easy", ordered: true, title: "Cohort sizes on every row",
    brief: "PARTITION BY slices without collapsing: each order stamped with how many tickets share its status — the 52 delivered, 30 shipped, 14 pending, 7 cancelled spreads visible on the rows themselves. First four ids.",
    hints: ["COUNT(*) OVER (PARTITION BY status) restarts the count per status cohort.", "SELECT id, status, COUNT(*) OVER (PARTITION BY status) AS status_rows FROM orders ORDER BY id LIMIT 4."],
    solution: "SELECT id, status, COUNT(*) OVER (PARTITION BY status) AS status_rows FROM orders ORDER BY id LIMIT 4;",
  }),
  p({
    id: "gm5-p03", difficulty: "easy", ordered: true, title: "The biggest-three ladder",
    brief: "ROW_NUMBER over total DESC hands out 1..103 with no ties — order 74 (1088.44) takes the crown, 945.21 and 845.92 follow. Stage the window, keep rungs one to three.",
    hints: ["Stage: SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) rn FROM orders.", "Outer: WHERE rn <= 3 ORDER BY rn."],
    solution: "SELECT rn, id, total FROM (SELECT id, total, ROW_NUMBER() OVER (ORDER BY total DESC) AS rn FROM orders) WHERE rn <= 3 ORDER BY rn;",
  }),
  p({
    id: "gm5-p04", difficulty: "easy", ordered: true, title: "Alphabet positions",
    brief: "The directory numbered: customers ranked by name ascending, so Alice Chen holds position 1, Bruno Silva 2, Chloe Dubois 3. ROW_NUMBER makes the phone book's index column.",
    hints: ["ROW_NUMBER() OVER (ORDER BY name) numbers the directory alphabetically.", "SELECT name, ROW_NUMBER() OVER (ORDER BY name) AS pos FROM customers ORDER BY pos LIMIT 3."],
    solution: "SELECT name, ROW_NUMBER() OVER (ORDER BY name) AS pos FROM customers ORDER BY pos LIMIT 3;",
  }),
  p({
    id: "gm5-p05", difficulty: "easy", ordered: true, title: "Price rank, ties allowed",
    brief: "RANK over the catalog by price descending. No two products share a price on this seed, so the ranks run 1, 2, 3 cleanly — Smart Watch S at 199.99 opens the ladder.",
    hints: ["RANK() OVER (ORDER BY price DESC) — RANK would skip after ties, but none exist here.", "SELECT name, price, RANK() OVER (ORDER BY price DESC) AS rk FROM products ORDER BY rk LIMIT 3."],
    solution: "SELECT name, price, RANK() OVER (ORDER BY price DESC) AS rk FROM products ORDER BY rk LIMIT 3;",
  }),
  p({
    id: "gm5-p06", difficulty: "easy", ordered: true, title: "Dense ranks, no gaps",
    brief: "Same catalog, DENSE_RANK flavor: identical ladder on tie-free data — 1, 2, 3 — but DENSE_RANK never skips a rung even when ties appear. Compare it mentally against the RANK column.",
    hints: ["Swap RANK for DENSE_RANK — the ordering clause is unchanged.", "SELECT name, price, DENSE_RANK() OVER (ORDER BY price DESC) AS drk FROM products ORDER BY drk LIMIT 3."],
    solution: "SELECT name, price, DENSE_RANK() OVER (ORDER BY price DESC) AS drk FROM products ORDER BY drk LIMIT 3;",
  }),
  p({
    id: "gm5-p07", difficulty: "easy", ordered: true, title: "Quartile one by id",
    brief: "NTILE(4) deals sixteen customers into four even buckets of four, ordered by id. Tile 1 holds the first four ids on the roster — the head of the deal.",
    hints: ["Stage: SELECT id, name, NTILE(4) OVER (ORDER BY id) tile FROM customers.", "Outer: WHERE tile = 1 ORDER BY id."],
    solution: "SELECT id, name, tile FROM (SELECT id, name, NTILE(4) OVER (ORDER BY id) AS tile FROM customers) WHERE tile = 1 ORDER BY id;",
  }),
  p({
    id: "gm5-p08", difficulty: "easy", title: "The halves census",
    brief: "Cut the 103-order book into two buckets by total. NTILE(2) deals 52 into the bigger-value half and 51 into the rest — the census proves the odd row lands in tile 1.",
    hints: ["Stage NTILE(2) OVER (ORDER BY total), then GROUP BY the tile column.", "SELECT tile, COUNT(*) AS n FROM (…) GROUP BY tile ORDER BY tile."],
    solution: "SELECT tile, COUNT(*) AS n FROM (SELECT NTILE(2) OVER (ORDER BY total) AS tile FROM orders) GROUP BY tile ORDER BY tile;",
  }),
  p({
    id: "gm5-p09", difficulty: "easy", ordered: true, title: "The previous ticket",
    brief: "LAG shows each order the ticket that came just before it in calendar order. The very first row has no predecessor — its LAG reads NULL, the window's way of saying the walk starts here.",
    hints: ["LAG(total) OVER (ORDER BY created_at, id) — the id tiebreak fixes row order on same-day tickets.", "SELECT id, total, LAG(total) OVER (ORDER BY created_at, id) AS prev_total FROM orders ORDER BY created_at, id LIMIT 3."],
    solution: "SELECT id, total, LAG(total) OVER (ORDER BY created_at, id) AS prev_total FROM orders ORDER BY created_at, id LIMIT 3;",
  }),
  p({
    id: "gm5-p10", difficulty: "easy", ordered: true, title: "The next ticket",
    brief: "LEAD is LAG's mirror: it peeks forward at the following ticket's total. Same calendar walk, same NULL — but the NULL lands on the book's final row instead of its first.",
    hints: ["LEAD(total) OVER (ORDER BY created_at, id) peers one row ahead.", "SELECT id, total, LEAD(total) OVER (ORDER BY created_at, id) AS next_total FROM orders ORDER BY created_at, id LIMIT 3."],
    solution: "SELECT id, total, LEAD(total) OVER (ORDER BY created_at, id) AS next_total FROM orders ORDER BY created_at, id LIMIT 3;",
  }),
  p({
    id: "gm5-p11", difficulty: "easy", ordered: true, title: "The opening stamp",
    brief: "FIRST_VALUE over the calendar walk puts the storefront's opening ticket — order 6 at 752.96, placed 2024-01-01 — onto every row. One value, the whole book's anchor.",
    hints: ["FIRST_VALUE(total) OVER (ORDER BY created_at, id) reads the partition's first row.", "SELECT id, total, FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS opening FROM orders ORDER BY created_at, id LIMIT 3."],
    solution: "SELECT id, total, FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS opening FROM orders ORDER BY created_at, id LIMIT 3;",
  }),
  p({
    id: "gm5-p12", difficulty: "easy", ordered: true, title: "The latest stamp",
    brief: "LAST_VALUE needs the full frame to tell the truth: without ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING it stops at the current row. Stretched wide, it stamps the book's latest ticket — 585.79 — on every row.",
    hints: ["LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).", "SELECT id, total, … AS latest FROM orders ORDER BY created_at, id LIMIT 3."],
    solution: "SELECT id, total, LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS latest FROM orders ORDER BY created_at, id LIMIT 3;",
  }),
  p({
    id: "gm5-p13", difficulty: "easy", ordered: true, title: "The running ledger",
    brief: "The storefront's cumulative revenue walk, order by calendar order: 752.96 opens, the second ticket lifts it to 1478.30, and the walk climbs from there. SUM over an ordered window is the running total.",
    hints: ["SUM(total) OVER (ORDER BY created_at, id) accumulates as rows arrive; ROUND(…, 2) keeps the cents honest.", "SELECT id, total, ROUND(SUM(total) OVER (ORDER BY created_at, id), 2) AS rt FROM orders ORDER BY created_at, id LIMIT 5."],
    solution: "SELECT id, total, ROUND(SUM(total) OVER (ORDER BY created_at, id), 2) AS rt FROM orders ORDER BY created_at, id LIMIT 5;",
  }),
  p({
    id: "gm5-p14", difficulty: "easy", ordered: true, title: "The customer load stamp",
    brief: "Every order stamped with how many tickets its customer has placed overall — heavy accounts show 20-plus, light ones just a pair. The partition count turns the ledger into a load report.",
    hints: ["COUNT(*) OVER (PARTITION BY customer_id) counts within each customer's slice.", "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS cust_orders FROM orders ORDER BY id LIMIT 4."],
    solution: "SELECT id, customer_id, COUNT(*) OVER (PARTITION BY customer_id) AS cust_orders FROM orders ORDER BY id LIMIT 4;",
  }),
  p({
    id: "gm5-p15", difficulty: "easy", ordered: true, title: "The uppercase directory",
    brief: "UPPER reshapes text wholesale: the first three directory names shouted into capitals. Text functions never drop rows — they re-dress the values in place.",
    hints: ["UPPER(name) capitalizes every letter.", "SELECT UPPER(name) AS uname FROM customers ORDER BY name LIMIT 3."],
    solution: "SELECT UPPER(name) AS uname FROM customers ORDER BY name LIMIT 3;",
  }),
  p({
    id: "gm5-p16", difficulty: "easy", ordered: true, title: "The length census",
    brief: "LENGTH counts characters: Isabella Rossi leads at 14, with Dmitri Volkov and Pedro Alvarez tied at 13. The name-ascending tiebreak fixes their order deterministically.",
    hints: ["LENGTH(name) returns the character count.", "SELECT name, LENGTH(name) AS len FROM customers ORDER BY len DESC, name LIMIT 3."],
    solution: "SELECT name, LENGTH(name) AS len FROM customers ORDER BY len DESC, name LIMIT 3;",
  }),
  p({
    id: "gm5-p17", difficulty: "easy", title: "The prefix shelf",
    brief: "SUBSTR slices category names to their first three letters — a quick fingerprint of the seven shelf labels, from Acc through Wea. Distinct keeps one row per prefix.",
    hints: ["SUBSTR(category, 1, 3) takes three characters from position 1.", "SELECT DISTINCT SUBSTR(category, 1, 3) AS prefix FROM products ORDER BY prefix."],
    solution: "SELECT DISTINCT SUBSTR(category, 1, 3) AS prefix FROM products ORDER BY prefix;",
  }),
  p({
    id: "gm5-p18", difficulty: "easy", title: "The dash cleanup",
    brief: "REPLACE swaps every hyphen in catalog names for a space — Noise-Canceling Headset reads as two calm words. The LIKE guard keeps the census to names that actually carry a dash.",
    hints: ["REPLACE(name, '-', ' ') swaps every occurrence.", "SELECT name, REPLACE(name, '-', ' ') AS cleaned FROM products WHERE name LIKE '%-%' ORDER BY name."],
    solution: "SELECT name, REPLACE(name, '-', ' ') AS cleaned FROM products WHERE name LIKE '%-%' ORDER BY name;",
  }),
  p({
    id: "gm5-p19", difficulty: "easy", title: "The truncated price list",
    brief: "CAST(price AS INTEGER) chops the cents clean off — 89.99 becomes 89, 199.99 becomes 199. The truncation is toward zero, never rounded: the type system's blunt knife.",
    hints: ["CAST(price AS INTEGER) truncates the decimal part.", "SELECT name, price, CAST(price AS INTEGER) AS whole FROM products ORDER BY id."],
    solution: "SELECT name, price, CAST(price AS INTEGER) AS whole FROM products ORDER BY id;",
  }),
  p({
    id: "gm5-p20", difficulty: "easy", ordered: true, title: "The cents ledger",
    brief: "Accounting thinks in integer cents: multiply each order total by 100 and CAST away the decimal dust — 576.54 becomes 57654. The first three tickets show the conversion.",
    hints: ["CAST(total * 100 AS INTEGER) — multiply first, then truncate.", "SELECT id, total, CAST(total * 100 AS INTEGER) AS cents FROM orders ORDER BY id LIMIT 3."],
    solution: "SELECT id, total, CAST(total * 100 AS INTEGER) AS cents FROM orders ORDER BY id LIMIT 3;",
  }),
  p({
    id: "gm5-p21", difficulty: "easy", title: "The rounded mean",
    brief: "The store-wide average ticket is 338.19 once ROUND trims the fourth decimal. Aggregation gives the number; ROUND gives the presentation the finance deck wants.",
    hints: ["ROUND(AVG(total), 2) rounds to two decimal places.", "SELECT ROUND(AVG(total), 2) AS avg_total FROM orders."],
    solution: "SELECT ROUND(AVG(total), 2) AS avg_total FROM orders;",
  }),
  p({
    id: "gm5-p22", difficulty: "easy", ordered: true, title: "Distance from the mean",
    brief: "ABS erases the sign of deviation: each order's distance from the 338.19 average, whether above or below. First three tickets of the distance report.",
    hints: ["ABS(total - (SELECT AVG(total) FROM orders)) removes the direction, keeps the size.", "SELECT id, ROUND(ABS(total - (SELECT AVG(total) FROM orders)), 2) AS gap FROM orders ORDER BY id LIMIT 3."],
    solution: "SELECT id, ROUND(ABS(total - (SELECT AVG(total) FROM orders)), 2) AS gap FROM orders ORDER BY id LIMIT 3;",
  }),
  p({
    id: "gm5-p23", difficulty: "easy", title: "The monthly load",
    brief: "strftime('%Y-%m', created_at) buckets orders into fourteen calendar months, from 2024-01 through 2025-02. The GROUP BY census shows each month's ticket count.",
    hints: ["strftime('%Y-%m', created_at) yields the 'YYYY-MM' bucket key.", "SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m."],
    solution: "SELECT strftime('%Y-%m', created_at) AS m, COUNT(*) AS n FROM orders GROUP BY m ORDER BY m;",
  }),
  p({
    id: "gm5-p24", difficulty: "easy", title: "The year split",
    brief: "One strftime change and the calendar folds in half: 2024 carries 90 orders, 2025 just 13. Year buckets are the coarsest honest slice of the timeline.",
    hints: ["strftime('%Y', created_at) keeps only the year.", "SELECT strftime('%Y', created_at) AS y, COUNT(*) AS n FROM orders GROUP BY y ORDER BY y."],
    solution: "SELECT strftime('%Y', created_at) AS y, COUNT(*) AS n FROM orders GROUP BY y ORDER BY y;",
  }),
  p({
    id: "gm5-p25", difficulty: "easy", ordered: true, title: "The percentile head",
    brief: "PERCENT_RANK over total DESC starts at exactly 0 for the champion and climbs in 1/102 steps — the top three tickets read 0, 0.0098, 0.0196. The head of the percentile board.",
    hints: ["ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr.", "SELECT id, total, … FROM orders ORDER BY total DESC LIMIT 3."],
    solution: "SELECT id, total, ROUND(PERCENT_RANK() OVER (ORDER BY total DESC), 4) AS pr FROM orders ORDER BY total DESC LIMIT 3;",
  }),
  p({
    id: "gm5-p26", difficulty: "easy", ordered: true, title: "The cumulative share head",
    brief: "CUME_DIST counts peers inclusively: the top ticket carries 1/103 ≈ 0.0097 of the population at or above it, the runner-up 2/103 ≈ 0.0194. Head of the cumulative ladder.",
    hints: ["ROUND(CUME_DIST() OVER (ORDER BY total DESC), 4) AS cd.", "SELECT id, total, … FROM orders ORDER BY total DESC LIMIT 3."],
    solution: "SELECT id, total, ROUND(CUME_DIST() OVER (ORDER BY total DESC), 4) AS cd FROM orders ORDER BY total DESC LIMIT 3;",
  }),
  p({
    id: "gm5-p27", difficulty: "easy", title: "The status champions",
    brief: "RANK inside each status cohort crowns four champions — the biggest delivered, shipped, pending and cancelled tickets. The pending crown is order 74's 1088.44, the book's overall ceiling.",
    hints: ["Stage RANK() OVER (PARTITION BY status ORDER BY total DESC) AS rk.", "Outer: WHERE rk = 1 ORDER BY total DESC."],
    solution: "SELECT status, id, total FROM (SELECT status, id, total, RANK() OVER (PARTITION BY status ORDER BY total DESC) AS rk FROM orders) WHERE rk = 1 ORDER BY total DESC;",
  }),
  p({
    id: "gm5-p28", difficulty: "easy", ordered: true, title: "The filtered stamp",
    brief: "Windows see the rows WHERE left behind: inside the delivered-only filter, COUNT(*) OVER() reads 52 on every surviving row — the cohort's own census, not the book's 103.",
    hints: ["WHERE runs before windows, so OVER() counts only delivered rows.", "SELECT id, total, COUNT(*) OVER () AS delivered_rows FROM orders WHERE status = 'delivered' ORDER BY id LIMIT 2."],
    solution: "SELECT id, total, COUNT(*) OVER () AS delivered_rows FROM orders WHERE status = 'delivered' ORDER BY id LIMIT 2;",
  }),
  p({
    id: "gm5-p29", difficulty: "easy", ordered: true, title: "The floor stamp",
    brief: "MIN over a customer partition stamps each ticket with its owner's cheapest purchase — every row of a light buyer reads the same small floor. First three ledger rows.",
    hints: ["MIN(total) OVER (PARTITION BY customer_id) reads each customer's cheapest.", "SELECT id, customer_id, total, MIN(total) OVER (PARTITION BY customer_id) AS floor_total FROM orders ORDER BY id LIMIT 3."],
    solution: "SELECT id, customer_id, total, MIN(total) OVER (PARTITION BY customer_id) AS floor_total FROM orders ORDER BY id LIMIT 3;",
  }),
  p({
    id: "gm5-p30", difficulty: "easy", ordered: true, title: "The average stamp",
    brief: "AVG over the customer partition stamps each ticket with its owner's mean spend — the per-customer baseline every row can be compared against without a join or a GROUP BY.",
    hints: ["AVG(total) OVER (PARTITION BY customer_id); ROUND(…, 2) for presentation.", "SELECT id, customer_id, ROUND(AVG(total) OVER (PARTITION BY customer_id), 2) AS cust_avg FROM orders ORDER BY id LIMIT 3."],
    solution: "SELECT id, customer_id, ROUND(AVG(total) OVER (PARTITION BY customer_id), 2) AS cust_avg FROM orders ORDER BY id LIMIT 3;",
  }),
];
