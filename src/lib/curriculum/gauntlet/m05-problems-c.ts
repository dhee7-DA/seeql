// M5 Gauntlet — graded problems, hard tier (gm5-p61..p90).
// Window-over-window staging, per-group crowns, frames, percentile banding,
// partition-scoped shares, and capstone compositions. Facts probed via
// scripts/m5-facts{,2,3}.ts.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const m05ProblemsHard: Problem[] = [
  p({
    id: "gm5-p61", difficulty: "hard", ordered: true, title: "The double crown",
    brief: "Two windows, one stage: global RANK over total DESC and per-customer ROW_NUMBER ride side by side. The book's top three — 1088.44, 945.21, 845.92 — each hold global rank 1..3 AND crank 1 for their own account.",
    hints: ["One stage: RANK() OVER (ORDER BY total DESC) AS grk, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS crank.", "Outer: WHERE grk <= 3 ORDER BY grk."],
    solution: "SELECT grk, id, customer_id, total, crank FROM (SELECT id, customer_id, total, RANK() OVER (ORDER BY total DESC) AS grk, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS crank FROM orders) WHERE grk <= 3 ORDER BY grk;",
  }),
  p({
    id: "gm5-p62", difficulty: "hard", ordered: true, title: "The regional champions",
    brief: "ROW_NUMBER partitioned by region crowns one top spender per region — four champions across EU, APAC, US and LATAM. Partitioned top-one-per-group, staged over a spend ladder.",
    hints: ["Stage spend per customer+region (GROUP BY c.region, c.name), then ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY spend DESC) AS rn.", "Outer: WHERE rn = 1 ORDER BY spend DESC."],
    solution: "SELECT region, name, ROUND(spend, 2) AS spend, rn FROM (SELECT c.region, c.name, SUM(o.total) AS spend, ROW_NUMBER() OVER (PARTITION BY c.region ORDER BY SUM(o.total) DESC) AS rn FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.name) WHERE rn = 1 ORDER BY spend DESC;",
  }),
  p({
    id: "gm5-p63", difficulty: "hard", title: "The monthly champions",
    brief: "Fourteen months, fourteen biggest tickets: ROW_NUMBER partitioned by the month bucket keeps each month's ceiling. The month spine becomes a crown board.",
    hints: ["Stage: ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY total DESC) AS rn over id, total, month key.", "Outer: WHERE rn = 1 ORDER BY m."],
    solution: "SELECT m, id, total FROM (SELECT strftime('%Y-%m', created_at) AS m, id, total, ROW_NUMBER() OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY total DESC) AS rn FROM orders) WHERE rn = 1 ORDER BY m;",
  }),
  p({
    id: "gm5-p64", difficulty: "hard", ordered: true, title: "The first-crossing hunt",
    brief: "The day-level running ledger crosses 5000 exactly once for the first time somewhere in the first weeks of trading. Build the cumulative walk by calendar order and catch its first offender with LIMIT 1.",
    hints: ["Stage: ROUND(SUM(total) OVER (ORDER BY created_at, id), 2) AS rt over created_at.", "Outer: WHERE rt > 5000 ORDER BY created_at LIMIT 1."],
    solution: "SELECT created_at, ROUND(rt, 2) AS rt FROM (SELECT created_at, SUM(total) OVER (ORDER BY created_at, id) AS rt FROM orders) WHERE rt > 5000 ORDER BY created_at LIMIT 1;",
  }),
  p({
    id: "gm5-p65", difficulty: "hard", title: "The cumulative share walk",
    brief: "Compose the monthly running total with the grand 34833.28: each month's cumulative revenue as a percentage of the whole year-and-a-bit. Windows compose because each stage is just a column.",
    hints: ["Stage: SUM(SUM(total)) OVER (ORDER BY m) AS rt from the monthly spine.", "Outer: ROUND(100.0 * rt / SUM(rt) OVER (), 4) AS pct — or divide by (SELECT SUM(total) FROM orders); ORDER BY m."],
    solution: "SELECT m, ROUND(rt, 2) AS rt, ROUND(100.0 * rt / SUM(rt) OVER (), 4) AS pct FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt FROM orders GROUP BY m) ORDER BY m;",
  }),
  p({
    id: "gm5-p66", difficulty: "hard", title: "The quartile labels",
    brief: "NTILE deals the book into four total bands; CASE dresses the tiles as labels. The census lands 26/26/26/25 — the remainder rule leaving the last quartile a row short.",
    hints: ["Stage: NTILE(4) OVER (ORDER BY total DESC) AS tile, CASE tile WHEN 1 THEN 'Q1' … END AS band.", "Outer: SELECT band, COUNT(*) FROM (…) GROUP BY band ORDER BY band."],
    solution: "SELECT band, COUNT(*) AS n FROM (SELECT NTILE(4) OVER (ORDER BY total DESC) AS tile, CASE NTILE(4) OVER (ORDER BY total DESC) WHEN 1 THEN 'Q1' WHEN 2 THEN 'Q2' WHEN 3 THEN 'Q3' ELSE 'Q4' END AS band FROM orders) GROUP BY band ORDER BY band;",
  }),
  p({
    id: "gm5-p67", difficulty: "hard", title: "The opening-flag census",
    brief: "FIRST_VALUE can act as a flag: rows where FIRST_VALUE(id) OVER (PARTITION BY customer_id ORDER BY created_at, id) equals their own id ARE the opening tickets — sixteen of them, one per account.",
    hints: ["Stage: FIRST_VALUE(id) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS fid, keep id.", "Outer: SELECT COUNT(*) FROM (…) WHERE id = fid."],
    solution: "SELECT COUNT(*) AS openers FROM (SELECT id, FIRST_VALUE(id) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS fid FROM orders) WHERE id = fid;",
  }),
  p({
    id: "gm5-p68", difficulty: "hard", title: "The per-status last tickets",
    brief: "LAST_VALUE with the full frame, partitioned by status, deduplicated: each cohort's final ticket — cancelled closes on 95, delivered on 100, pending on 97, shipped on 98. Four ids, the whole book's endings.",
    hints: ["Stage: LAST_VALUE(id) OVER (PARTITION BY status ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lid.", "Outer: SELECT DISTINCT status, lid FROM (…) ORDER BY status."],
    solution: "SELECT DISTINCT status, lid FROM (SELECT status, LAST_VALUE(id) OVER (PARTITION BY status ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS lid FROM orders) ORDER BY status;",
  }),
  p({
    id: "gm5-p69", difficulty: "hard", ordered: true, title: "The clean-book quartiles",
    brief: "Re-deal lifetime spend after excluding cancelled orders: the floor quartile reshuffles — Keiko Sato 700.61 replaces Liam at the tile-4 head. Filters BEFORE the window change the deal.",
    hints: ["Stage spend with WHERE o.status <> 'cancelled' before NTILE(4) OVER (ORDER BY spend DESC).", "Outer: WHERE tile = 4 ORDER BY spend DESC."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, tile FROM (SELECT c.name, SUM(o.total) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS tile FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.status <> 'cancelled' GROUP BY c.name) WHERE tile = 4 ORDER BY spend DESC;",
  }),
  p({
    id: "gm5-p70", difficulty: "hard", ordered: true, title: "The EU middle tiles",
    brief: "Scope the deal to Europe: eight EU customers quartiled among themselves put Noah Meyer 737.68 and Liam O'Brien 705.39 in tile 3 — the region's middle class, invisible in the store-wide deal.",
    hints: ["Stage EU-only spend (WHERE c.region = 'EU'), then NTILE(4) OVER (ORDER BY spend DESC) AS tile.", "Outer: WHERE tile = 3 ORDER BY spend DESC."],
    solution: "SELECT name, ROUND(spend, 2) AS spend, tile FROM (SELECT c.name, SUM(o.total) AS spend, NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS tile FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' GROUP BY c.name) WHERE tile = 3 ORDER BY spend DESC;",
  }),
  p({
    id: "gm5-p71", difficulty: "hard", title: "The region share board",
    brief: "Two-level share: each customer's lifetime spend as a percentage of their REGION's total — EU's 15089.23 pool, APAC's 11605.45, and the rest. SUM OVER (PARTITION BY region) builds the local denominator.",
    hints: ["Stage spend per customer+region; add SUM(spend) OVER (PARTITION BY region) AS region_total in a second stage.", "Outer: ROUND(100.0 * spend / region_total, 4) AS share; ORDER BY region, spend DESC."],
    solution: "SELECT region, name, ROUND(spend, 2) AS spend, ROUND(100.0 * spend / SUM(spend) OVER (PARTITION BY region), 4) AS share FROM (SELECT c.region, c.name, SUM(o.total) AS spend FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region, c.name) ORDER BY region, spend DESC;",
  }),
  p({
    id: "gm5-p72", difficulty: "hard", ordered: true, title: "The widest swing",
    brief: "MAX minus MIN over the customer partition measures each account's ticket spread: Alice spans 767.64 to 45.36, Bruno 752.96 to 99.48. Deduplicated to one row per customer, the swing board ranks restraint against splurge.",
    hints: ["Stage: MAX(total) OVER (PARTITION BY customer_id) AS mx, MIN(total) OVER (PARTITION BY customer_id) AS mn.", "Outer: SELECT DISTINCT customer_id, ROUND(mx - mn, 2) AS swing FROM (…) ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, ROUND(mx - mn, 2) AS swing FROM (SELECT customer_id, MAX(total) OVER (PARTITION BY customer_id) AS mx, MIN(total) OVER (PARTITION BY customer_id) AS mn FROM orders) ORDER BY customer_id;",
  }),
  p({
    id: "gm5-p73", difficulty: "hard", ordered: true, title: "Rows versus ranges",
    brief: "Two orders share 2024-01-02. The ROWS frame walks row by row — 752.96, 1478.30, 1630.82 — while the default RANGE frame would stamp BOTH same-day peers with 1630.82. Force the ROWS frame and watch the tie disappear.",
    hints: ["SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — ROWS, not RANGE.", "SELECT id, created_at, total, ROUND(…, 2) AS rt FROM orders ORDER BY created_at, id LIMIT 3."],
    solution: "SELECT id, created_at, total, ROUND(SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS rt FROM orders ORDER BY created_at, id LIMIT 3;",
  }),
  p({
    id: "gm5-p74", difficulty: "hard", ordered: true, title: "The trailing two-ticket average",
    brief: "A frame that EXCLUDES the current row: AVG over ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING averages the two tickets before each one — customer 1 reads NULL, 152.52, 460.08, 736.43. The smooth line that never sees today.",
    hints: ["AVG(total) OVER (ORDER BY created_at, id ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING).", "SELECT id, total, ROUND(…, 2) AS t2 FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4."],
    solution: "SELECT id, total, ROUND(AVG(total) OVER (ORDER BY created_at, id ROWS BETWEEN 2 PRECEDING AND 1 PRECEDING), 2) AS t2 FROM orders WHERE customer_id = 1 ORDER BY created_at, id LIMIT 4;",
  }),
  p({
    id: "gm5-p75", difficulty: "hard", ordered: true, title: "The day-revenue board",
    brief: "Aggregate to days, then rank: 2024-10-04's 1362.08 is the storefront's richest single day, with 2024-05-12 and 2024-03-06 on the podium. A GROUP BY feeding a RANK window — aggregation first, ranking second.",
    hints: ["Stage: SELECT created_at, SUM(total) AS rev FROM orders GROUP BY created_at; RANK() OVER (ORDER BY rev DESC) AS rk.", "Outer: WHERE rk <= 3 ORDER BY rk."],
    solution: "SELECT rk, created_at, ROUND(rev, 2) AS rev FROM (SELECT created_at, SUM(total) AS rev, RANK() OVER (ORDER BY SUM(total) DESC) AS rk FROM orders GROUP BY created_at) WHERE rk <= 3 ORDER BY rk;",
  }),
  p({
    id: "gm5-p76", difficulty: "hard", title: "The percentile bands",
    brief: "CASE folds PERCENT_RANK into four bands and the census counts each — the book's spread across quarters of the percentile ladder. Band membership is a CASE over a window column, staged.",
    hints: ["Stage: ROUND(PERCENT_RANK() OVER (ORDER BY total), 4) AS pr, CASE WHEN pr < 0.25 THEN 'b1' … END AS band.", "Outer: SELECT band, COUNT(*) FROM (…) GROUP BY band ORDER BY band."],
    solution: "SELECT band, COUNT(*) AS n FROM (SELECT total, CASE WHEN PERCENT_RANK() OVER (ORDER BY total) < 0.25 THEN 'b1' WHEN PERCENT_RANK() OVER (ORDER BY total) < 0.5 THEN 'b2' WHEN PERCENT_RANK() OVER (ORDER BY total) < 0.75 THEN 'b3' ELSE 'b4' END AS band FROM orders) GROUP BY band ORDER BY band;",
  }),
  p({
    id: "gm5-p77", difficulty: "hard", ordered: true, title: "The median hunt",
    brief: "103 rows — an odd book — has no exact 0.5 cumulative share. The first CUME_DIST past the line belongs to the 52nd-cheapest ticket at 0.5049: the practical median the textbook never warns you about.",
    hints: ["Stage: CUME_DIST() OVER (ORDER BY total) AS cd.", "Outer: WHERE cd > 0.5 ORDER BY total LIMIT 1 — the first row past the halfway share."],
    solution: "SELECT id, total, ROUND(cd, 4) AS cd FROM (SELECT id, total, CUME_DIST() OVER (ORDER BY total) AS cd FROM orders) WHERE cd > 0.5 ORDER BY total LIMIT 1;",
  }),
  p({
    id: "gm5-p78", difficulty: "hard", ordered: true, title: "The category totals stamp",
    brief: "SUM over a category partition stamps every product with its shelf's total price mass — Electronics 173.49 on its three rows, Audio 328.98 on its pair. The partition denominator, no GROUP BY collapse.",
    hints: ["ROUND(SUM(price) OVER (PARTITION BY category), 2) AS cat_total.", "SELECT name, price, … FROM products ORDER BY id LIMIT 5."],
    solution: "SELECT name, price, ROUND(SUM(price) OVER (PARTITION BY category), 2) AS cat_total FROM products ORDER BY id LIMIT 5;",
  }),
  p({
    id: "gm5-p79", difficulty: "hard", title: "The category share list",
    brief: "Divide each product's price by its category's stamped total: each item's weight on its own shelf. Audio splits 328.98 two ways; Fitness's 32 has exactly one claimant at 100 percent.",
    hints: ["Same stamped stage; outer division ROUND(100.0 * price / cat_total, 4) AS share.", "ORDER BY category, share DESC."],
    solution: "SELECT category, name, ROUND(100.0 * price / cat_total, 4) AS share FROM (SELECT category, name, price, SUM(price) OVER (PARTITION BY category) AS cat_total FROM products) ORDER BY category, share DESC;",
  }),
  p({
    id: "gm5-p80", difficulty: "hard", ordered: true, title: "The cancelled exposure walk",
    brief: "Running SUM inside the cancelled cohort accumulates the money that died — seven tickets, walking from the first cancellation to the cohort's full loss. The partition frame keeps the walk local.",
    hints: ["SUM(total) OVER (PARTITION BY status ORDER BY created_at, id) with WHERE status = 'cancelled'.", "SELECT id, created_at, total, ROUND(…, 2) AS lost_so_far FROM orders WHERE … ORDER BY created_at, id."],
    solution: "SELECT id, created_at, total, ROUND(SUM(total) OVER (ORDER BY created_at, id), 2) AS lost_so_far FROM orders WHERE status = 'cancelled' ORDER BY created_at, id;",
  }),
  p({
    id: "gm5-p81", difficulty: "hard", ordered: true, title: "The pending watchlist walk",
    brief: "Fourteen pending tickets accumulate the undecided money in calendar order — the walk ends at the pool's full exposure. The watchlist's closing balance is the number finance watches.",
    hints: ["Same running-SUM shape, WHERE status = 'pending'.", "ORDER BY created_at, id; the final row's walk column IS the exposure."],
    solution: "SELECT id, created_at, total, ROUND(SUM(total) OVER (ORDER BY created_at, id), 2) AS exposure FROM orders WHERE status = 'pending' ORDER BY created_at, id;",
  }),
  p({
    id: "gm5-p82", difficulty: "hard", title: "The growth flags census",
    brief: "LAG over the monthly spine, CASE the movement: five month-over-month gains against eight declines across thirteen deltas. The storefront's rhythm, counted — up or down, nothing else survives the filter.",
    hints: ["Stage monthly rev, then CASE WHEN rev > LAG(rev) OVER (ORDER BY m) THEN 'up' WHEN rev < LAG(rev) … THEN 'down' END AS direction.", "Outer: WHERE direction IS NOT NULL; GROUP BY direction."],
    solution: "SELECT direction, COUNT(*) AS n FROM (SELECT CASE WHEN rev > LAG(rev) OVER (ORDER BY m) THEN 'up' WHEN rev < LAG(rev) OVER (ORDER BY m) THEN 'down' END AS direction FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m)) WHERE direction IS NOT NULL GROUP BY direction ORDER BY direction;",
  }),
  p({
    id: "gm5-p83", difficulty: "hard", ordered: true, title: "The longest rest",
    brief: "Customer 1's biggest gap between consecutive orders, found by sorting the LAG-derived day differences descending. One row: the quiet spell before the account's next ticket.",
    hints: ["Stage gap_days as in the cadence problem: julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)).", "Outer: WHERE gap_days IS NOT NULL ORDER BY gap_days DESC LIMIT 1."],
    solution: "SELECT id, created_at, ROUND(gap_days, 1) AS gap_days FROM (SELECT id, created_at, julianday(created_at) - julianday(LAG(created_at) OVER (ORDER BY created_at, id)) AS gap_days FROM orders WHERE customer_id = 1) WHERE gap_days IS NOT NULL ORDER BY gap_days DESC LIMIT 1;",
  }),
  p({
    id: "gm5-p84", difficulty: "hard", ordered: true, title: "The EU rank ladder",
    brief: "RANK inside Europe: Alice 1 at 7262.35 down to Olivia 8 at 444.80 — eight distinct spends, eight clean rungs. Regional leaderboards are the partition story customers actually feel.",
    hints: ["Stage EU spend (GROUP BY c.name with WHERE c.region = 'EU'), RANK() OVER (ORDER BY spend DESC) AS rk.", "Outer: ORDER BY rk."],
    solution: "SELECT rk, name, ROUND(spend, 2) AS spend FROM (SELECT c.name, SUM(o.total) AS spend, RANK() OVER (ORDER BY SUM(o.total) DESC) AS rk FROM orders o JOIN customers c ON c.id = o.customer_id WHERE c.region = 'EU' GROUP BY c.name) ORDER BY rk;",
  }),
  p({
    id: "gm5-p85", difficulty: "hard", title: "The crown share",
    brief: "How much of a customer's lifetime rode on their single biggest ticket? Stage per-customer MAX and SUM side by side and divide — heavy concentrated books near 100, steady spreaders sit lower.",
    hints: ["Stage: MAX(total) OVER (PARTITION BY customer_id) AS top_ticket, SUM(total) OVER (PARTITION BY customer_id) AS lifetime.", "Outer: SELECT DISTINCT customer_id, ROUND(100.0 * top_ticket / lifetime, 4) AS crown_share FROM (…) ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, ROUND(100.0 * top_ticket / lifetime, 4) AS crown_share FROM (SELECT customer_id, MAX(total) OVER (PARTITION BY customer_id) AS top_ticket, SUM(total) OVER (PARTITION BY customer_id) AS lifetime FROM orders) ORDER BY customer_id;",
  }),
  p({
    id: "gm5-p86", difficulty: "hard", title: "The status quartile heads",
    brief: "NTILE(4) restarts inside every status cohort, so tile 1 holds 13 delivered, 8 shipped, 4 pending and 2 cancelled tickets — the ceiling rule (ceil(n/4)) visible in a census.",
    hints: ["Stage: NTILE(4) OVER (PARTITION BY status ORDER BY total DESC) AS tile.", "Outer: WHERE tile = 1; SELECT status, COUNT(*) FROM (…) GROUP BY status ORDER BY status."],
    solution: "SELECT status, COUNT(*) AS head_count FROM (SELECT status, NTILE(4) OVER (PARTITION BY status ORDER BY total DESC) AS tile FROM orders) WHERE tile = 1 GROUP BY status ORDER BY status;",
  }),
  p({
    id: "gm5-p87", difficulty: "hard", ordered: true, title: "The spine's head",
    brief: "LAG proves continuity: over the fourteen-month spine, exactly one month has no predecessor — January 2024, the ledger's first page. NULL detection as a boundary finder.",
    hints: ["Stage: LAG(m) OVER (ORDER BY m) AS pm over the monthly spine.", "Outer: WHERE pm IS NULL — the one row the walk starts on."],
    solution: "SELECT m FROM (SELECT m, LAG(m) OVER (ORDER BY m) AS pm FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev FROM orders GROUP BY m)) WHERE pm IS NULL ORDER BY m;",
  }),
  p({
    id: "gm5-p88", difficulty: "hard", ordered: true, title: "The month triptych",
    brief: "One staged query, three windows: monthly revenue, its running walk (3731.97 → 7341.61 → 9958.69) and its rank on the revenue board (1, 2, 6). Composition is the whole point of staging.",
    hints: ["One stage: SUM(total) rev, SUM(SUM(total)) OVER (ORDER BY m) rt, RANK() OVER (ORDER BY SUM(total) DESC) rk — GROUP BY m.", "Outer: ORDER BY m LIMIT 3."],
    solution: "SELECT m, ROUND(rev, 2) AS rev, ROUND(rt, 2) AS rt, rk FROM (SELECT strftime('%Y-%m', created_at) AS m, SUM(total) AS rev, SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS rt, RANK() OVER (ORDER BY SUM(total) DESC) AS rk FROM orders GROUP BY m) ORDER BY m LIMIT 3;",
  }),
  p({
    id: "gm5-p89", difficulty: "hard", title: "The decile head count",
    brief: "NTILE(10) over 103 orders deals eleven into the first three tiles and ten thereafter — the head decile carries 11 tickets. A census of the top tile pins the remainder rule on real data.",
    hints: ["Stage: NTILE(10) OVER (ORDER BY total DESC) AS tile.", "Outer: SELECT COUNT(*) FROM (…) WHERE tile = 1."],
    solution: "SELECT COUNT(*) AS head_decile FROM (SELECT NTILE(10) OVER (ORDER BY total DESC) AS tile FROM orders) WHERE tile = 1;",
  }),
  p({
    id: "gm5-p90", difficulty: "hard", ordered: true, title: "The capstone triptych",
    brief: "Everything at once, top three: global rank, per-customer rung, and each ticket's percentage share of the 34833.28 book. Three windows composed in one stage — the gauntlet's final shape.",
    hints: ["One stage: RANK() OVER (ORDER BY total DESC) grk, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) crank, 100.0 * total / SUM(total) OVER () share.", "Outer: WHERE grk <= 3 ORDER BY grk."],
    solution: "SELECT grk, id, customer_id, total, crank, ROUND(share, 4) AS share FROM (SELECT id, customer_id, total, RANK() OVER (ORDER BY total DESC) AS grk, ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC) AS crank, 100.0 * total / SUM(total) OVER () AS share FROM orders) WHERE grk <= 3 ORDER BY grk;",
  }),
];
