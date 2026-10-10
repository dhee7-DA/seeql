// Deep-dives — Retail B file: weeks of supply, return rate by category and
// the revenue cohort triangle (3 problems: Medium, Easy, Hard; all three
// order "exact" — every report sorts its rows). Unit counts are INTEGER;
// rates and percentages are the only REALs; revenue is INTEGER cents with
// the _cents suffix. Own tables, own seeds, original phrasing — never
// copied problem text. Each dive carries a primer: the domain concept
// taught from zero.
// Registry wiring (lead): 8070 weeks-of-supply ·
// 8071 returns-rate-by-category · 8072 cohort-repeat-revenue.
import type { LcSqlDive } from "../types";

export const SQL_DF_RETAIL_B: LcSqlDive[] = [
  {
    slug: "weeks-of-supply",
    statement:
      "A buyer opens the day with one question: how long does the stockroom last at the pace it is actually moving. The inventory table holds (sku, on_hand_units) and the sales table holds (sale_id, sku, sale_date, units) covering exactly the 28 days ending 2026-09-26 — the PINNED window, which is exactly 4 weeks. Report per sku: sku, on_hand_units, weekly_rate = ROUND(1.0 * SUM(units) / 4, 1) and weeks_of_supply = ROUND(on_hand_units / weekly_rate, 1). A sku with zero sales in the window has no pace: weekly_rate 0.0 and the sentinel weeks_of_supply 99.9, meaning indefinitely stocked, and its reorder reads 1. Every other sku reads reorder = 1 when weeks_of_supply < 2.0 STRICTLY — exactly 2.0 does not reorder — else 0. ORDER BY weeks_of_supply ASC.",
    examples: [
      {
        input:
          "FST-1101 holds 140 units and sold 1120 units across the pinned 28-day window",
        output: "FST-1101 · 140 · 280.0 · 0.5 · 1",
        explanation:
          "1120 units over exactly 4 weeks is 280.0 a week; 140 on hand burns out in half a week, and 0.5 < 2.0 raises the flag. The report is one division chain: SUM over the window, divide by 4, divide stock by the pace.",
      },
      {
        input:
          "BND-4477 holds 200 units and sold 400 units across the same window",
        output: "BND-4477 · 200 · 100.0 · 2.0 · 0",
        explanation:
          "400 units over the window reads 100.0 a week, and 200 on hand lasts exactly 2.0 weeks. The reorder line is STRICTLY below 2.0, so the boundary sku stays at 0 — one more week like this and it flips.",
      },
    ],
    constraints: [
      "on_hand_units and units are plain INTEGER counts; weekly_rate and weeks_of_supply are the only REALs in the output and reorder is a 0/1 flag",
      "PINNED window: the sales table holds exactly the 28 days 2026-08-30 through 2026-09-26 (ending '2026-09-26'), so 28 days = 4 weeks and weekly_rate = ROUND(1.0 * SUM(units) / 4, 1) reads every sale row — no date filter is needed or wanted",
      "PINNED guard and sentinel: zero sales in the window means no pace — weekly_rate 0.0, weeks_of_supply 99.9 (the agreed never-out-of-stock sentinel) and reorder 1; every other sku reads weeks_of_supply = ROUND(on_hand_units / weekly_rate, 1)",
      "PINNED reorder line: reorder = 1 only when weeks_of_supply < 2.0 STRICTLY (the exactly-2.0 sku stays 0), and the seed has no ties at 1dp so ORDER BY weeks_of_supply ASC is deterministic",
    ],
    primer: {
      hook:
        "Weeks of supply is the one number that tells a buyer whether today's shelf dies this week or next quarter — stock divided by the pace the shelf actually moves.",
      concept: [
        "Weeks of supply converts two raw facts — how much you hold and how fast you sell — into one countdown. Take the units on hand, divide by the units sold per week, and the quotient reads as time: 140 units selling at 280 a week is half a week of cover. That framing is why buyers love it — every sku in the aisle, whatever its size or price, becomes comparable on a single clock. A warehouse can hold 40 units of one thing and 40000 of another, and only the countdown says which one is actually in danger.",
        "The pace half of the division is a TRAILING rate, not a guess. This problem pins the window at the 28 days ending 2026-09-26, and 28 days is exactly 4 weeks, so the pace is total units sold divided by 4 — a weekly average over a month of trading. Four weeks is long enough to wash out the noise of one hot Saturday or one delivery-day spike, and short enough to notice a trend turning. The window length IS the divisor, which is why getting it wrong — a 30-day month, say — silently bends every number on the report.",
        "The countdown gets read against a reorder line. Two weeks is the classic bar: if the shelf holds less cover than the replenishment lead time, the next order placed today arrives too late and the sku gaps out. The line here is STRICTLY below 2.0 — a sku at exactly 2.0 can just cover its lead time, so it holds — and boundary cases are exactly where casual inclusive thinking breaks. Buyers treat the flag as a work queue: everything under the line gets a purchase order before lunch.",
        "Zero sales breaks the formula, and the report must still ship. A sku that sold nothing in the window has a pace of 0, and dividing stock by 0 is undefined — in SQLite it returns NULL, which would punch a hole in the buyer's morning sheet. The convention is a sentinel: report 99.9 weeks, a number no real sku would ever earn, meaning indefinitely stocked. The sentinel deliberately sorts to the bottom of the report and still raises its reorder flag, because a dead listing is usually a data problem or a delisting decision — both need a human.",
      ],
      worked: [
        "Take a sku with 90 units on hand that sold 360 units over the last 28 days.",
        "The window is exactly 4 weeks, so the pace is 360 / 4 = 90 units a week.",
        "Divide stock by pace: 90 / 90 = 1.0 weeks of supply.",
        "1.0 sits below the strict 2.0 line, so the reorder flag goes up — a purchase order placed today barely lands in time.",
        "If the same sku had sold nothing, the pace would be 0 and the division impossible; the report would print the 99.9 sentinel and flag it anyway.",
      ],
      glossary: [
        { term: "weeks of supply", def: "how many weeks the current stock lasts at the recent sales pace" },
        { term: "trailing window", def: "the look-back period the pace is measured over, here the last 28 days" },
        { term: "weekly rate", def: "average units sold per week across the window, the pace divisor" },
        { term: "reorder flag", def: "the 0/1 signal raised when supply dips under the lead-time line" },
        { term: "sentinel value", def: "a fixed stand-in number, 99.9 here, replacing a value the formula cannot produce" },
        { term: "lead time", def: "the days between placing a replenishment order and the goods arriving" },
      ],
      reallife: [
        "Inventory planners and buyers at chains like Home Depot and Best Buy run this exact report every morning before the stores open. The sheet ranks every sku by countdown, the red zone under two weeks becomes a purchase-order queue, and the overstocked tail above twenty weeks becomes a markdown-and-clearance queue. When a promotion inflates the trailing pace, the report can hide a stockout that has already been scheduled — which is why planners overlay known future demand before trusting the flag.",
        "What breaks in practice is the plumbing around the division: returns booked as negative sales, a sku whose sales feed died last month reading as infinite supply, or a window that silently includes an unusual holiday week. The decisions the number drives are physical and expensive — freight arrives whether or not the math was right — so a wrong sentinel or an inclusive boundary ships real trucks to the wrong stores. Anyone auditing the math cares about exactly the two pinned things here: the window arithmetic and what the report does when the pace is zero.",
      ],
      where:
        "Inventory planners, replenishment analysts and merchandising buyers own it, and SQL screens at Home Depot, Best Buy, Walmart and Chewy hand candidates exactly this stock-versus-pace query.",
    },
    breakdown: [
      "The whole report is one division done twice with different units. First the pace: SUM(units) over the window divided by 4, because the pinned 28-day window is exactly 4 weeks — the window length IS the divisor, and computing a 30-day month instead bends every rate down by about 7 percent. Then the countdown: on_hand_units over the pace, which converts stock into weeks. Both divisions must run in REAL land — the 1.0 multiplier before the rate division keeps SQLite from integer-truncating — and ROUND trims only at the two pinned places, pace at 1dp and countdown at 1dp.",
      "The LEFT JOIN direction carries the report. Join FROM inventory TO sales, because the driver is every sku the warehouse holds; a sku with no sale rows still needs its row, and COALESCE(SUM(s.units), 0) turns the empty side into a zero pace. An INNER JOIN here silently deletes the no-sales sku — four rows ship instead of five, and the buyer never learns that one listing is dead. The zero then hits the guard: units_28d = 0 routes that sku to the 99.9 sentinel instead of the division, because 310 / 0.0 in SQLite is NULL rather than an error — a hole in the sheet exactly where a decision is needed.",
      "The reorder flag is a two-line CASE with a strict comparison. weeks_of_supply < 2.0 fires the flag; the exactly-2.0 sku sits on the line and stays 0, which is why the seed plants one — an inclusive <= flips it and quietly inflates the work queue. The sentinel also flags, so the CASE tests the zero-sales condition first and the strict line second. Ordering by the countdown ASC puts the burning skus at the top and pools the 99.9 sentinels at the bottom, which is how the buyer reads it: fire list, watch list, investigate-why-it-never-sells list.",
    ],
    edges: [
      "Compute the pace as a 30-day month (SUM / 30 * 7) and the counts read BND-4477 2.1 instead of 2.0, OKG-2205 5.7 instead of 5.3 and OVR-3390 34.3 instead of 32.0 — the divisor IS the pinned window, 28 days = 4 weeks.",
      "Drop the sentinel guard and the no-sales sku's weeks_of_supply becomes NULL (310 / 0.0 in SQLite is NULL, not an error) with its reorder reading 0 — a hole where the buyer's decision belongs; the guard is what ships 99.9 and reorder 1.",
      "Make the reorder line inclusive (<= 2.0) and the exact-boundary sku BND-4477 flips to reorder 1 — the pinned strict line keeps it at 0.",
      "Join inventory to sales with an INNER JOIN and the no-sales sku disappears — 4 rows instead of 5 — hiding a dead listing from the morning sheet.",
    ],
    ladder: [
      {
        title: "Brute force — one sku on a napkin",
        body: "Sum one sku's units over the calendar month, divide by 4, divide stock by that. Five skus is doable by hand once; the division-by-zero case and the 1dp rounding make it exactly the kind of arithmetic a query should own.",
      },
      {
        title: "The pattern — aggregate the pace, then divide",
        body: "LEFT JOIN inventory to sales, COALESCE the pace to 0, compute ROUND(1.0 * units / 4, 1), then a CASE that either prints 99.9 or divides stock by the pace. The reorder flag reuses the same two conditions — zero sales, or strictly under 2.0.",
      },
      {
        title: "The optimal idea — one pass, guard early, round last",
        body: "O(I + S) over I skus and S sale rows: one LEFT JOIN aggregation and one projection. The durable rules — the window length is the divisor, the guard fires before the division, the boundary is strict, and rounding happens only at the two pinned places.",
      },
    ],
    approach:
      "LEFT JOIN sales under inventory, ROUND(1.0 * units / 4, 1) pace, CASE guard to the 99.9 sentinel, strict < 2.0 reorder flag, ORDER BY weeks_of_supply ASC",
    schema: {
      ddl: `CREATE TABLE inventory (
  sku           TEXT PRIMARY KEY,
  on_hand_units INTEGER NOT NULL
);
CREATE TABLE sales (
  sale_id   INTEGER PRIMARY KEY,
  sku       TEXT NOT NULL,
  sale_date TEXT NOT NULL,      -- 'YYYY-MM-DD', inside the pinned 28-day window
  units     INTEGER NOT NULL
);`,
      seed: `-- The pinned 28-day window: 2026-08-30 through 2026-09-26 (exactly 4 weeks).
-- Five skus: a fast mover (0.5 weeks), the exact-2.0 boundary, a healthy
-- middle, an overstocked tail and a no-sales sku for the sentinel.
INSERT INTO inventory (sku, on_hand_units) VALUES
  ('FST-1101',  140),
  ('BND-4477',  200),
  ('OKG-2205',  480),
  ('OVR-3390', 2400),
  ('NOS-5512',  310);
-- 4-week unit sums: FST-1101 1120, BND-4477 400, OKG-2205 360, OVR-3390 300.
INSERT INTO sales (sale_id, sku, sale_date, units) VALUES
  ( 1, 'FST-1101', '2026-08-31', 120),
  ( 2, 'FST-1101', '2026-09-03', 160),
  ( 3, 'FST-1101', '2026-09-06', 130),
  ( 4, 'FST-1101', '2026-09-09', 150),
  ( 5, 'FST-1101', '2026-09-12', 145),
  ( 6, 'FST-1101', '2026-09-16', 155),
  ( 7, 'FST-1101', '2026-09-20', 135),
  ( 8, 'FST-1101', '2026-09-24', 125),
  ( 9, 'BND-4477', '2026-08-30',  90),
  (10, 'BND-4477', '2026-09-04', 110),
  (11, 'BND-4477', '2026-09-11',  95),
  (12, 'BND-4477', '2026-09-19', 105),
  (13, 'OKG-2205', '2026-09-01',  60),
  (14, 'OKG-2205', '2026-09-05',  50),
  (15, 'OKG-2205', '2026-09-09',  70),
  (16, 'OKG-2205', '2026-09-13',  65),
  (17, 'OKG-2205', '2026-09-18',  55),
  (18, 'OKG-2205', '2026-09-23',  60),
  (19, 'OVR-3390', '2026-09-02',  80),
  (20, 'OVR-3390', '2026-09-08',  70),
  (21, 'OVR-3390', '2026-09-15',  75),
  (22, 'OVR-3390', '2026-09-22',  75);`,
      tables: [
        { name: "inventory", note: "5 skus — FST-1101 140, BND-4477 200, OKG-2205 480, OVR-3390 2400, NOS-5512 310 units on hand" },
        { name: "sales", note: "22 sale rows inside the pinned window — 4-week sums: FST-1101 1120, BND-4477 400, OKG-2205 360, OVR-3390 300, NOS-5512 none" },
      ],
    },
    code: `WITH sold AS (
    -- LEFT JOIN keeps every sku the warehouse holds. The no-sales sku's
    -- empty side becomes a zero pace via COALESCE
    SELECT
        i.sku,
        i.on_hand_units,
        COALESCE(SUM(s.units), 0) AS units_28d
    FROM inventory i
    LEFT JOIN sales s ON s.sku = i.sku
    GROUP BY i.sku, i.on_hand_units
),
calc AS (
    -- the pinned 28-day window IS 4 weeks, so the divisor is a literal 4
    SELECT
        sku,
        on_hand_units,
        units_28d,
        ROUND(1.0 * units_28d / 4, 1) AS weekly_rate
    FROM sold
)
SELECT
    sku,
    on_hand_units,
    weekly_rate,
    -- the PINNED sentinel: zero sales in the window = stocked indefinitely
    CASE WHEN units_28d = 0 THEN 99.9
         ELSE ROUND(1.0 * on_hand_units / weekly_rate, 1) END AS weeks_of_supply,
    -- strict < 2.0 reorder line — the sentinel also flags reorder
    CASE WHEN units_28d = 0 OR ROUND(1.0 * on_hand_units / weekly_rate, 1) < 2.0
         THEN 1 ELSE 0 END AS reorder
FROM calc
ORDER BY weeks_of_supply ASC;`,
    walkthrough: [
      "The sold CTE LEFT JOINs sales under inventory and groups by sku, so all five skus survive the aggregation and COALESCE(SUM(s.units), 0) hands the no-sales sku a zero. The four sellers come out at 1120, 400, 360 and 300 units for the 28 days; NOS-5512 comes out at 0. The calc CTE then computes the pace: ROUND(1.0 * 1120 / 4, 1) = 280.0 for FST-1101, 100.0 for BND-4477, 90.0 for OKG-2205 and 75.0 for OVR-3390, plus 0.0 for NOS-5512.",
      "The countdown divides stock by the pace: 140 / 280.0 = 0.5, 200 / 100.0 = 2.0 exactly, 480 / 90.0 = 5.3333 rounding to 5.3, and 2400 / 75.0 = 32.0. The zero-sales row never reaches that division — the CASE routes units_28d = 0 straight to the 99.9 sentinel, because 310 / 0.0 would be NULL, and a NULL in the countdown column is a hole in the buyer's queue rather than a number. The pace column itself stays honest at 0.0 for that sku — the guard sits on the countdown, where the impossible division lives.",
      "The reorder CASE tests the zero-sales condition first, then the strict line: 0.5 < 2.0 flags FST-1101, 2.0 < 2.0 is false so BND-4477 stays 0, and the sentinel flags NOS-5512 despite its 99.9. ORDER BY weeks_of_supply ASC ships the rows as 0.5, 2.0, 5.3, 32.0 and 99.9 — fire list first, sentinel last. Exactly the pinned five rows: (FST-1101, 140, 280.0, 0.5, 1), (BND-4477, 200, 100.0, 2.0, 0), (OKG-2205, 480, 90.0, 5.3, 0), (OVR-3390, 2400, 75.0, 32.0, 0) and (NOS-5512, 310, 0.0, 99.9, 1).",
    ],
    time: "O(I + S) over the I inventory rows and S sale rows — one LEFT JOIN aggregation and one projection pass",
    space: "O(I) — the sold and calc CTEs hold one row per sku",
    followUps: [
      "Add a per-sku lead_time_days column and flag on days of cover (weeks_of_supply * 7 against the lead time) instead of the flat 2.0 line — which seeded sku flips when its own lead time is 10 days?",
      "Net returns out of the pace — what does the rate become if the sales table also logged negative-unit rows, and which sku's countdown moves most?",
      "Tier the reorder queue with NTILE over weeks_of_supply and compare the top tile with the strict 2.0 flag — where do the two definitions disagree on this seed?",
    ],
    related: ["rolling-7d-actives", "daily-balance-interest", "dau-wau-stickiness"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "returns-rate-by-category",
    statement:
      "Return rate is the number merchandising reads before it blames a supplier: units coming back over units going out, rolled up by category. The products table maps (sku, category); the sales table logs (sale_id, sku, units) sold; the returns table logs (return_id, sku, units) sent back, and only returned skus have rows there. Report per category: category, sold_units, returned_units, return_pct = ROUND(100.0 * returned_units / sold_units, 2) and flagged. returned_units is 0 for a category whose skus have no return rows, and such a category still reports — the LEFT JOIN keeps it. flagged = 1 when return_pct > 8.0 STRICTLY — a category at exactly 8.00 sits ON the wall and stays 0 — else 0. ORDER BY return_pct DESC, category ASC.",
    examples: [
      {
        input:
          "Outerwear sold 250 units across its skus and logged 20 units of returns",
        output: "Outerwear · 250 · 20 · 8.0 · 0",
        explanation:
          "100.0 * 20 / 250 = 8.0 exactly. The wall is strictly above 8.0, so the category sits ON the line and stays unflagged — one more returned unit would cross it.",
      },
      {
        input:
          "Home sold 180 units and its skus have no rows at all in the returns table",
        output: "Home · 180 · 0 · 0.0 · 0",
        explanation:
          "No return rows is data, not absence: the LEFT JOIN keeps the category with returned_units 0 and return_pct 0.0. An INNER JOIN would erase the cleanest category on the sheet.",
      },
    ],
    constraints: [
      "sold_units and returned_units are INTEGER unit counts; return_pct is the only REAL and flagged is a 0/1 flag",
      "PINNED rate: return_pct = ROUND(100.0 * returned_units / sold_units, 2) per category, where returned_units = SUM(returns.units) over the category's skus with COALESCE 0 (only returned skus have rows in returns); pool the sums — never average per-sku rates",
      "PINNED wall: flagged = 1 when return_pct > 8.0 STRICTLY; the category at exactly 8.00 is NOT flagged; categories with sales but zero returns still report via LEFT JOIN (an INNER JOIN would silently drop them)",
      "no two categories tie at 2dp on this seed, so ORDER BY return_pct DESC, category ASC is deterministic",
    ],
    primer: {
      hook:
        "Return rate is retail's honesty metric — the share of everything sold that walks back through the door.",
      concept: [
        "Every retailer refunds some of what it sells, and the rate is simply units returned divided by units sold, printed as a percent. Sell 250 units and take 20 back, and you returned 8 percent of the business. The unit of decision-making is the CATEGORY, not the sku: a merchandising team owns footwear or outerwear, negotiates with its suppliers and fixes its product pages as a portfolio, so the report rolls skus up before it judges.",
        "The rollup must POOL, and that word carries the whole trap. The honest category rate is total returned divided by total sold — volume weighting every sku by how much it actually sold. Averaging each sku's rate instead lets a boutique sku that sold 3 and returned 2 shout as loud as the flagships, and it can push a healthy category over the wall or hide a sick one. Pooled sums and averaged rates disagree whenever sku volumes differ, and they disagree exactly on this seed.",
        "A threshold turns a rate into a work queue. The wall here is 8 percent, and it is STRICTLY greater: a category at exactly 8.00 sits on the line and is not flagged, because the rule says OVER the wall. Thresholds that fire on the boundary produce reports where the boundary case flickers every week as returns trickle in — strictly-greater keeps the line honest and reproducible.",
        "Zero returns is information, not missing data. A category whose skus have no rows in the returns table returned nothing, and the report must show it at 0.0 rather than letting an INNER JOIN erase the best performer on the sheet. The LEFT JOIN plus a COALESCE to 0 is the whole trick: keep every category that sold, and let the missing side be a zero.",
      ],
      worked: [
        "A category sold 250 units and logged 20 units of returns, so its pooled rate is 100.0 * 20 / 250 = 8.0 percent.",
        "The wall is strictly above 8.0, so the exactly-8.0 category is NOT flagged — it sits on the line.",
        "A second category sold 40 and returned 5, reading 12.5 percent — over the wall despite tiny volume.",
        "A third sold 180 units and has no return rows at all; the LEFT JOIN reports 0 returned and 0.0 percent instead of dropping it.",
      ],
      glossary: [
        { term: "return rate", def: "units returned divided by units sold, printed as a percent" },
        { term: "category rollup", def: "aggregating sku rows up to the category a merchandising team actually owns" },
        { term: "pooled rate", def: "total returned over total sold, weighting every sku by its real volume" },
        { term: "threshold wall", def: "the percent above which a category triggers investigation, 8.0 here" },
        { term: "LEFT JOIN guard", def: "keeping categories with no return rows by driving the join from the sales side" },
      ],
      reallife: [
        "At Zappos the return rate is a strategy, not a bug — free returns built the brand, and analysts watch the rate per category to price the generosity in. Apparel and footwear run double-digit return rates as a norm, which is why the wall matters: 8 percent flags a supplier or a product page, not a catastrophe. Marketplace teams at Gap, Amazon and Walmart run the same rollup to decide which suppliers get audited, which size charts get rebuilt and which categories lose digital shelf space.",
        "What breaks: return rows keyed to the wrong sku, late returns landing outside the reporting window, and the per-sku averaging bug that lets one boutique sku sink a whole category. The rate drives supplier chargebacks, sizing-chart rewrites and photo reshoots, so a weighting error redirects real money. Teams that pool correctly can also slice the other way — a flagged category's worst skus are the first thing the buyer opens.",
      ],
      where:
        "Merchandising analysts at Zappos and Gap own the weekly read, and marketplace and e-commerce teams at Amazon, Walmart and Chewy interview with exactly this returned-over-sold rollup.",
    },
    breakdown: [
      "Two aggregates per category, then one division. sold_units is SUM(sales.units) grouped by category through the products map; returned_units is SUM(returns.units) grouped the same way, and the returns side is the one that can be empty. The join direction is FROM sold TO returned — LEFT — so every selling category survives, and COALESCE(returned_units, 0) turns the missing side into a zero. The rate then divides pooled sums: 100.0 * returned / sold, with the 100.0 forcing float division before ROUND at 2dp.",
      "Pooling is where the weighting discipline lives. Category rates must be sum-over-sum, not the average of per-sku rates: on this seed the per-sku average reads Footwear 9.33 instead of 10.0 and pushes Outerwear to 8.33 — over the wall on a technicality — because it lets low-volume skus vote as loud as the flagships. The pooled version weights every sku by its actual sold units, which is the quantity the business risk actually sits on. Any read that averages per-sku percentages is answering a different question, and on this seed it also flips a flag.",
      "The wall is a strict greater-than against the ROUNDED rate: flagged = 1 when return_pct > 8.0. The seed plants a category at exactly 8.00 — 20 back on 250 sold — and it must stay 0, since the rule says over the wall, not on it. An inclusive >= flips that category and makes the boundary flicker week to week. ORDER BY return_pct DESC, category ASC reads as an investigation queue: worst first, and the zero-return category closes the sheet as proof the join kept it.",
    ],
    edges: [
      "INNER JOIN the returns side and Home vanishes — 3 rows instead of 4 — erasing the zero-return category the LEFT JOIN exists to protect.",
      "Flag with >= 8.0 and the boundary category Outerwear (exactly 8.00, 20 on 250) flips to flagged 1; the pinned strict > keeps it 0.",
      "Average per-sku rates instead of pooling and the sheet reads Accessories 11.33, Footwear 9.33 and Outerwear 8.33 instead of 12.5, 10.0 and 8.0 — and 8.33 is over the wall, so the weighting bug also flips Outerwear's flag.",
      "Drop the 100.0 multiplier and SQLite integer division truncates Accessories to 12 instead of 12.5 (Footwear's 10.0 and Outerwear's 8.0 hide the bug — exact divisions survive it).",
    ],
    ladder: [
      {
        title: "Brute force — eyeball the category",
        body: "Dump sales and returns per sku, add them up by hand per category, divide once. Four categories is fine once; the zero-return case and the weighting question are where the hand version starts lying.",
      },
      {
        title: "The pattern — two grouped aggregates, LEFT JOIN, one rate",
        body: "SUM sales by category, SUM returns by category, LEFT JOIN the second under the first, COALESCE the zero, and ROUND(100.0 * returned / sold, 2). flagged is a single CASE against the strict 8.0 wall.",
      },
      {
        title: "The optimal idea — pool, never average; keep the zeros",
        body: "O(P + S + R) over P products, S sale rows and R return rows — two aggregations and one join. The durable rules: pooled sums weight by volume, the wall is strictly greater, and categories that sold but never returned must still appear at 0.0.",
      },
    ],
    approach:
      "two category aggregates (sales, returns), LEFT JOIN with COALESCE 0, pooled ROUND(100.0 * returned / sold, 2), strict > 8.0 flag, ORDER BY return_pct DESC",
    schema: {
      ddl: `CREATE TABLE products (
  sku      TEXT PRIMARY KEY,
  category TEXT NOT NULL
);
CREATE TABLE sales (
  sale_id INTEGER PRIMARY KEY,
  sku     TEXT NOT NULL,
  units   INTEGER NOT NULL
);
CREATE TABLE returns (
  return_id INTEGER PRIMARY KEY,
  sku       TEXT NOT NULL,
  units     INTEGER NOT NULL
);`,
      seed: `-- 9 skus in 4 categories. Category sold sums: Footwear 200, Accessories 40,
-- Outerwear 250, Home 180. Returned sums: Footwear 20, Accessories 5,
-- Outerwear 20 (exactly 8.00 — the unflagged boundary), Home none.
INSERT INTO products (sku, category) VALUES
  ('FW-101', 'Footwear'),
  ('FW-102', 'Footwear'),
  ('FW-103', 'Footwear'),
  ('AC-201', 'Accessories'),
  ('AC-202', 'Accessories'),
  ('OW-301', 'Outerwear'),
  ('OW-302', 'Outerwear'),
  ('HM-401', 'Home'),
  ('HM-402', 'Home');
INSERT INTO sales (sale_id, sku, units) VALUES
  ( 1, 'FW-101',  50),
  ( 2, 'FW-101',  40),
  ( 3, 'FW-102',  70),
  ( 4, 'FW-103',  40),
  ( 5, 'AC-201',  25),
  ( 6, 'AC-202',  15),
  ( 7, 'OW-301', 150),
  ( 8, 'OW-302', 100),
  ( 9, 'HM-401', 100),
  (10, 'HM-402',  80);
-- Only returned skus have rows here. Home never appears.
INSERT INTO returns (return_id, sku, units) VALUES
  (1, 'FW-101',   7),
  (2, 'FW-101',   5),
  (3, 'FW-102',   5),
  (4, 'FW-103',   3),
  (5, 'AC-201',   4),
  (6, 'AC-202',   1),
  (7, 'OW-301',  10),
  (8, 'OW-302',  10);`,
      tables: [
        { name: "products", note: "9 skus in 4 categories — Footwear 3, Accessories 2, Outerwear 2, Home 2" },
        { name: "sales", note: "10 rows — category sums: Footwear 200, Accessories 40, Outerwear 250, Home 180" },
        { name: "returns", note: "8 rows, only returned skus — Footwear 20 (12 + 5 + 3), Accessories 5, Outerwear 20; Home none" },
      ],
    },
    code: `WITH sold AS (
    -- every category that sold anything — the driver of the report
    SELECT p.category, SUM(s.units) AS sold_units
    FROM products p
    JOIN sales s ON s.sku = p.sku
    GROUP BY p.category
),
ret AS (
    -- only returned skus have rows, so categories can go missing here
    SELECT p.category, SUM(r.units) AS returned_units
    FROM products p
    JOIN returns r ON r.sku = p.sku
    GROUP BY p.category
)
SELECT
    sold.category,
    sold.sold_units,
    COALESCE(ret.returned_units, 0) AS returned_units,
    -- pooled rate: SUM over SUM, never an average of per-sku rates
    ROUND(100.0 * COALESCE(ret.returned_units, 0) / sold.sold_units, 2) AS return_pct,
    -- PINNED wall: strictly above 8.0 — exactly 8.00 is not flagged
    CASE WHEN ROUND(100.0 * COALESCE(ret.returned_units, 0) / sold.sold_units, 2) > 8.0
         THEN 1 ELSE 0 END AS flagged
FROM sold
LEFT JOIN ret ON ret.category = sold.category
ORDER BY return_pct DESC, sold.category ASC;`,
    walkthrough: [
      "The sold CTE walks products into sales and groups by category: Footwear 200 (50 + 40 + 70 + 40 across three skus), Accessories 40, Outerwear 250 and Home 180. The ret CTE does the same over returns: Footwear 20 (12 from two rows on FW-101, plus 5 and 3), Accessories 5 and Outerwear 20 — and no Home rows at all. The LEFT JOIN keeps all four categories, and Home's missing side becomes COALESCE 0.",
      "The rate divides pooled sums with the 100.0 multiplier forcing float math: Accessories 100.0 * 5 / 40 = 12.5, Footwear 100.0 * 20 / 200 = 10.0, Outerwear 100.0 * 20 / 250 = 8.0 exactly, Home 0.0. The wall test compares each ROUNDED rate against strictly 8.0: 12.5 and 10.0 flag, the exactly-8.0 Outerwear does not, and 0.0 does not. One more returned unit on Outerwear would cross the line — which is why the boundary category sits in the seed.",
      "ORDER BY return_pct DESC, category ASC ships the investigation queue: (Accessories, 40, 5, 12.5, 1), (Footwear, 200, 20, 10.0, 1), (Outerwear, 250, 20, 8.0, 0) and (Home, 180, 0, 0.0, 0). The per-sku-averaged variant would print 11.33, 9.33 and 8.33 for the top three and flag Outerwear on its technicality; the INNER JOIN variant would ship 3 rows and lose Home. Both wrong sheets are pinned as probe targets in the check script.",
    ],
    time: "O(P + S + R) over P products, S sale rows and R return rows — two grouped aggregations and one join",
    space: "O(C) over the C categories — each aggregate CTE collapses to one row per category",
    followUps: [
      "Rebuild the report in returned REVENUE instead of units — what changes about the wall when one category's skus cost ten times another's?",
      "Add a month column and report the rate trend per category — which month boundary would a late-arriving return row smear across?",
      "Inside the flagged category, rank skus by return_pct and check whether the category rate is driven by one sku or spread across the shelf.",
    ],
    related: ["chargeback-rate-ranking", "funnel-step-conversion", "ab-test-conversion-lift"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "cohort-repeat-revenue",
    statement:
      "The revenue cohort triangle splits a business into acquisition months and asks how much money each month's buyers bring home afterwards. The orders table holds (order_id, customer_id, order_date, revenue_cents), and a customer's cohort_month is the YYYY-MM of their FIRST order. An order's month offset is (order year - cohort year) * 12 + (order month - cohort month), computed with strftime arithmetic on the date strings. Report per cohort: cohort_month, m0_revenue, m1_revenue and m2_revenue — the SUM(revenue_cents) of that cohort's customers' orders landing at month offsets 0, 1 and 2 — plus repeat_share_pct = ROUND(100.0 * (m1 + m2) / (m0 + m1 + m2), 2), 0.0 when the total is 0. Customers first ordering in the seed's LAST month (2026-07) have no m1 or m2 yet; their cohort still reports with 0 in both cells. ORDER BY cohort_month ASC.",
    examples: [
      {
        input:
          "the 2026-05 cohort — customers 101, 102 and 103 first ordered in May 2026, with repeat orders landing in June and July 2026",
        output: "2026-05 · 15000 · 2000 · 4500 · 30.23",
        explanation:
          "m0 pools the three May first orders (4000 + 6000 + 5000); m1 is customer 101's June order (2000); m2 is customer 101's July order plus customer 102's July order — June skipped entirely — at 1500 + 3000 = 4500. The share is 100.0 * 6500 / 21500 = 30.23.",
      },
      {
        input:
          "the 2026-07 cohort — customers 301 and 302 first ordered in the seed's last month, and no orders exist after July 2026",
        output: "2026-07 · 15000 · 0 · 0 · 0.0",
        explanation:
          "m0 = 9500 + 5500 = 15000; no m1 or m2 order can exist inside the seed yet, so both cells read 0 and the share reads 0.0. The cohort still reports — dropping it would flatter every average the triangle feeds.",
      },
    ],
    constraints: [
      "revenue_cents and the three mN_revenue outputs are INTEGER cents; repeat_share_pct is the only REAL",
      "PINNED cohort and offset: cohort_month = strftime('%Y-%m', MIN(order_date)) per customer; an order's month offset is (order year - cohort year) * 12 + (order month - cohort month) — month arithmetic via strftime, never day counts divided by 30",
      "m0_revenue, m1_revenue and m2_revenue = SUM(revenue_cents) of the cohort's OWN customers' orders at month offset 0, 1 and 2; the seed's last order month is 2026-07, so the 2026-07 cohort has no m1 or m2 and still reports with 0 there",
      "PINNED share: repeat_share_pct = ROUND(100.0 * (m1 + m2) / (m0 + m1 + m2), 2), 0.0 when the total is 0 (the NULLIF guard is dormant on this seed — every cohort sells in month 0); ORDER BY cohort_month ASC",
    ],
    primer: {
      hook:
        "The revenue cohort triangle answers the founder question — of the money a month's buyers brought in, how much of it was them coming back.",
      concept: [
        "A cohort is a group of customers defined by when they FIRST bought, and the first-purchase month is the standard cut. Grouping by acquisition month lines every customer up by age: each cohort's month 0 is its acquisition month, month 1 is one month later, and so on. Comparing cohorts at the same AGE rather than the same calendar date is the entire trick — it separates what the business does for a new customer from what the season was doing.",
        "An order lands at a month offset: how many calendar months after the customer's first order it happened. The arithmetic is (order year - cohort year) * 12 + (order month - cohort month) — an order in July from a customer who first bought in May reads offset 2, and a customer who skips June entirely still reports at offset 2, with the m1 bucket simply never seeing them. Day-count math divided by 30 looks tempting and drifts — 52 days divided by 30 rounds to the wrong month for an order that is plainly two calendar months later.",
        "The triangle is just the revenue pivot: m0 is acquisition revenue, m1 and m2 are the repeat money, and repeat share is the repeat slice of the total. A share above 30 percent means the cohort's second purchases are a real line of business; 0.0 means nobody has come back yet. The pivot buckets only offsets 0, 1 and 2 — money at later offsets exists, but this report measures the first two months, which is the window acquisition budgets actually decide against.",
        "The youngest cohort always reads zeros, and that is not churn — it is the calendar not having happened yet. A customer who first bought in the seed's last month cannot have an m1 order inside the data, so their cohort reports m0 only. Reports that silently drop the youngest cohort flatter the averages, because the dropped rows are exactly the ones that would drag repeat share down; keeping the zero rows is what makes the triangle honest.",
      ],
      worked: [
        "A customer first orders in March 2026, so their cohort_month is 2026-03.",
        "They order again in May: the offset is (2026 - 2026) * 12 + (5 - 3) = 2, an m2 order.",
        "A second customer from the same cohort orders in April: offset 1, an m1 order.",
        "Sum the cohort's revenue per bucket: m0 10000, m1 3000 and m2 2000 cents.",
        "Repeat share is (3000 + 2000) / (10000 + 3000 + 2000) = 33.33 percent — a third of the cohort's money is repeat business.",
      ],
      glossary: [
        { term: "cohort", def: "customers grouped by the month of their first order" },
        { term: "first-purchase month", def: "the MIN(order_date) month that defines a customer's cohort" },
        { term: "month offset", def: "how many calendar months after the first order an order landed" },
        { term: "m0 / m1 / m2", def: "revenue at offsets 0, 1 and 2 — acquisition, then two repeat windows" },
        { term: "repeat revenue", def: "money from orders at offset 1 or later, the coming-back slice" },
        { term: "repeat share", def: "repeat revenue over the cohort's total revenue, in percent" },
      ],
      reallife: [
        "Chewy runs its whole acquisition model on this triangle — autoship means repeat revenue IS the business, and each month's marketing spend is judged by what that month's cohort does at offsets 1 and 2. Warby Parker and Stitch Fix read the same shape for replenishment and styling cycles. The triangle is also the bridge table between marketing and finance: acquisition budgets are set against m0, retention work is judged against m1 and m2, and both teams sign off on the same cells.",
        "What breaks: joins that forget to match orders back to the cohort's own customers, so every cohort quietly absorbs the whole company's revenue for its offset months; day-based month math that mis-files boundary orders; and dashboards that drop the youngest cohort, painting a repeat share the calendar never earned. The cells decide budget shifts — a cohort whose m1 is strong earns its channel more spend, and a one-and-done cohort freezes it. Finance reconciles the triangle's total against booked revenue monthly, so a leak in the join shows up as revenue that exists on two cohort rows at once.",
      ],
      where:
        "Retention and lifecycle analysts at Chewy and Warby Parker own it, and growth-data interviews at Stitch Fix, Sephora and Amazon frequently hand candidates exactly this revenue-triangle query.",
    },
    breakdown: [
      "Two questions hide in one GROUP BY. Who is in which cohort — each customer's MIN(order_date) month — and how does each order map onto that cohort's clock. The month index CAST(strftime('%Y', d) AS INTEGER) * 12 + CAST(strftime('%m', d) AS INTEGER) turns every date into a running month counter, and subtracting the customer's cohort index gives the offset in one integer step. That is the pinned arithmetic: pure month math, no day counts divided by 30, which on this seed mis-files an offset-2 July order into m1.",
      "The pivot is conditional aggregation: SUM(CASE WHEN offset = 0 THEN revenue ELSE 0 END), and the same for 1 and 2. Every order joins back to its OWN customer's cohort — the customer_id equality is what keeps revenue from leaking; drop it and cohort 2026-05's m1 absorbs every June order in the company, 14500 instead of 2000. The seed's last month is 2026-07, so the youngest cohort has no observable m1 or m2; its row still ships with zeros because the report measures cohorts, not only cohorts that have had time.",
      "The share rounds last. repeat_share_pct = 100.0 * (m1 + m2) / (m0 + m1 + m2) runs on the RAW sums and only then rounds to 2dp, with a NULLIF guard standing in for the impossible all-zero total. Denominator discipline is the probe magnet: dividing by m0 alone reads 43.33 on the 2026-05 cohort instead of 30.23, because it pretends the repeat money arrived on top of nothing. A HAVING that drops zero-repeat cohorts silently deletes the youngest row — 2 rows ship instead of 3 — and the triangle's honest edge disappears.",
    ],
    edges: [
      "Compute offsets as day gaps divided by 30 and customer 102's July order (52 days after their May first order) mis-files from m2 to m1: the 2026-05 row reads m1 5000 and m2 1500 instead of 2000 and 4500 — month arithmetic via strftime is pinned.",
      "Divide the share by m0 alone and the rows read 43.33, 28.0 and 0.0 instead of 30.23, 21.88 and 0.0 — the denominator is the cohort's own total.",
      "Drop cohorts with no repeat revenue (HAVING m1 + m2 > 0) and the youngest cohort vanishes — 2 rows instead of 3 — flattering every average the triangle feeds.",
      "Join orders to cohort months without the customer link and cohort 2026-05 absorbs the whole company's calendar: m1 14500 (every June order) and m2 23000 (every July order) instead of 2000 and 4500.",
    ],
    ladder: [
      {
        title: "Brute force — sort and pencil",
        body: "Sort orders by customer and date, mark each customer's first month, count months by hand for every order. Twelve orders is one careful coffee; the skipped-month customer and the youngest cohort are where the pencil slips.",
      },
      {
        title: "The pattern — month index, cohort index, conditional SUM",
        body: "Reduce every date to a month index (year * 12 + month via strftime), MIN it per customer for the cohort, subtract to get offsets, then pivot offsets 0, 1 and 2 with SUM(CASE ...). The share is one more division on the three sums.",
      },
      {
        title: "The optimal idea — join back to the customer, round last",
        body: "O(n log n) over the n orders for the GROUP BY, then one linear tagging and pivot pass. The durable rules: offsets are month arithmetic, orders must match their OWN customer's cohort, the youngest cohort reports with zeros, and the share divides raw sums before any rounding.",
      },
    ],
    approach:
      "strftime month index, MIN per customer for the cohort, offset tagging, conditional SUM pivot for m0/m1/m2, raw-sum share with a NULLIF guard, ORDER BY cohort_month ASC",
    schema: {
      ddl: `CREATE TABLE orders (
  order_id      INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  order_date    TEXT NOT NULL,    -- 'YYYY-MM-DD'
  revenue_cents INTEGER NOT NULL
);`,
      seed: `-- 3 cohorts: 2026-05 (strong repeat, share 30.23), 2026-06 (partial — m1
-- yes, m2 in the future), 2026-07 (the youngest — m0 only, still reports).
-- Customer 102 skips June entirely: their second order lands at offset 2.
-- The seed's LAST order month is 2026-07, so no m1/m2 exists after it.
INSERT INTO orders (order_id, customer_id, order_date, revenue_cents) VALUES
  ( 1, 101, '2026-05-04', 4000),
  ( 2, 101, '2026-06-09', 2000),
  ( 3, 101, '2026-07-14', 1500),
  ( 4, 102, '2026-05-11', 6000),
  ( 5, 102, '2026-07-02', 3000),
  ( 6, 103, '2026-05-26', 5000),
  ( 7, 201, '2026-06-07', 8000),
  ( 8, 201, '2026-07-19', 2500),
  ( 9, 202, '2026-06-19', 4500),
  (10, 202, '2026-07-27', 1000),
  (11, 301, '2026-07-03', 9500),
  (12, 302, '2026-07-21', 5500);`,
      tables: [
        { name: "orders", note: "12 orders from 7 customers across 3 cohort months (2026-05, 2026-06, 2026-07) — the seed's last order month is 2026-07" },
      ],
    },
    code: `WITH base AS (
    -- every order reduced to (customer, running month counter, revenue).
    -- May 2026 reads 2026*12 + 5 = 24317, June 24318, July 24319
    SELECT
        customer_id,
        order_date,
        revenue_cents,
        CAST(strftime('%Y', order_date) AS INTEGER) * 12
            + CAST(strftime('%m', order_date) AS INTEGER) AS month_idx
    FROM orders
),
firsts AS (
    -- the cohort: each customer's first order month, as label and index
    SELECT
        customer_id,
        strftime('%Y-%m', MIN(order_date)) AS cohort_month,
        MIN(CAST(strftime('%Y', order_date) AS INTEGER) * 12
            + CAST(strftime('%m', order_date) AS INTEGER)) AS cohort_idx
    FROM orders
    GROUP BY customer_id
),
tagged AS (
    -- every order joins back to its OWN customer's cohort (the leak guard)
    SELECT
        f.cohort_month,
        b.month_idx - f.cohort_idx AS month_offset,
        b.revenue_cents
    FROM base b
    JOIN firsts f ON f.customer_id = b.customer_id
),
pivoted AS (
    -- the triangle: conditional SUM per offset bucket 0, 1, 2
    SELECT
        cohort_month,
        SUM(CASE WHEN month_offset = 0 THEN revenue_cents ELSE 0 END) AS m0_revenue,
        SUM(CASE WHEN month_offset = 1 THEN revenue_cents ELSE 0 END) AS m1_revenue,
        SUM(CASE WHEN month_offset = 2 THEN revenue_cents ELSE 0 END) AS m2_revenue
    FROM tagged
    GROUP BY cohort_month
)
SELECT
    cohort_month,
    m0_revenue,
    m1_revenue,
    m2_revenue,
    -- share divides the RAW sums. NULLIF guards the impossible all-zero total
    ROUND(COALESCE(
        100.0 * (m1_revenue + m2_revenue)
            / NULLIF(m0_revenue + m1_revenue + m2_revenue, 0), 0.0), 2) AS repeat_share_pct
FROM pivoted
ORDER BY cohort_month ASC;`,
    walkthrough: [
      "The base CTE turns every order into (customer_id, month_idx, revenue_cents), where month_idx = year * 12 + month via strftime — May 2026 reads 24317, June 24318 and July 24319. The firsts CTE groups by customer and takes MIN(order_date) for the cohort label plus the MIN month index for cohort_idx: customers 101, 102 and 103 stamp 2026-05, 201 and 202 stamp 2026-06, and 301 and 302 stamp 2026-07. The tagged CTE joins each order back to its OWN customer's cohort and subtracts: customer 102's 2026-07-02 order reads 24319 - 24317 = 2 even though June never appears for them.",
      "The pivot is three conditional SUMs per cohort_month. Cohort 2026-05 collects m0 = 4000 + 6000 + 5000 = 15000, m1 = customer 101's June 2000, and m2 = customer 101's July 1500 plus customer 102's July 3000 = 4500. Cohort 2026-06 collects m0 = 12500 and m1 = 2500 + 1000 = 3500, with m2 pointing at August 2026 where the seed has no rows. Cohort 2026-07 collects m0 = 9500 + 5500 = 15000 and nothing else — the calendar has not happened yet.",
      "The share divides raw sums before rounding: 2026-05 reads 100.0 * 6500 / 21500 = 30.2325 rounding to 30.23, 2026-06 reads 100.0 * 3500 / 16000 = 21.875 rounding to 21.88, and 2026-07 reads 0.0 with its zeros intact. ORDER BY cohort_month ASC ships the triangle left to right: (2026-05, 15000, 2000, 4500, 30.23), (2026-06, 12500, 3500, 0, 21.88) and (2026-07, 15000, 0, 0, 0.0). The missing join-back probe would read 2026-05's m1 as all of June — 14500 — and its m2 as all of July — 23000; both wrong cells are pinned in the check script.",
    ],
    time: "O(n log n) over the n orders — the per-customer GROUP BY, then one linear tagging and pivot pass",
    space: "O(n) — the base, firsts and tagged CTEs each carry one row per order",
    followUps: [
      "Extend the triangle to m3, m4 and m5 — which CTE change carries it, and what does the wider horizon do to the youngest cohort's row?",
      "Build the order-count twin beside the revenue triangle and find a cohort where the count share and the money share disagree — who buys often but cheap?",
      "Leak-audit the join: run the month-only variant against a seed with two cohorts buying in the same month and quantify exactly how much revenue double-counts.",
    ],
    related: ["cohort-retention-matrix", "vintage-default-curves", "week-over-week-churn"],
    order: "exact",
    xp: 35,
  },
];
