// Deep-dives — the BOSS LEVEL II band, file A of B (3 problems: 1 Hard,
// 2 Medium). Original time-series/finance problems authored for this app:
// running-VWAP breach detection, cash runway classification and
// cross-midnight shift pay with a night differential. Every solution is
// engine-verified against its own seed by scripts/lc-boss2-verify.ts
// before wiring.
import type { LcSqlDive } from "../types";

export const SQL_BOSS2_A: LcSqlDive[] = [
  {
    slug: "vwap-deviation-first-breach",
    statement:
      "A trading desk logs every fill in Trades (txn_id, symbol, traded_at, price, qty) — traded_at in 'YYYY-MM-DD HH:MI' text. The running VWAP of a symbol within one calendar day is the volume-weighted average price through the current fill: cumulative SUM(price*qty) divided by cumulative SUM(qty), ordered by traded_at. A fill BREACHES when its price deviates from the running VWAP (computed THROUGH that fill) by at least 2%. For each symbol-day where a breach happens, report the FIRST breaching fill: columns symbol, day (the YYYY-MM-DD prefix), first_breach_at (the traded_at) and dev_pct (the deviation in percent, rounded to 2 decimals). Symbol-days with no breach report nothing. Order by symbol, then day.",
    examples: [
      {
        input: "a symbol's first fill of the day at 100 × 10 shares",
        output: "… vwap is 100.0, deviation 0% — the first fill can never breach …",
        explanation:
          "Through the first fill, the running VWAP equals that fill's own price, so the deviation is exactly 0 — a breach can only happen from the second fill onward, once earlier fills anchor the average.",
      },
      {
        input: "fills at 100×10, 102×10, 105×10",
        output: "… vwap walks 100 → 101 → 102.33…; the 105 fill deviates 2.61% and breaches …",
        explanation:
          "Big early quantities anchor the average and absorb small deviations — that is the whole point of volume weighting, and why the seed pins every symbol with a heavy opening fill.",
      },
    ],
    constraints: [
      "one output row per symbol-day that has a breach: symbol, day, first_breach_at, dev_pct",
      "the running VWAP is computed THROUGH the current fill (inclusive cumulative window)",
      "a breach is |price − vwap| / vwap ≥ 0.02 evaluated with the vwap including this fill",
      "order rows by symbol, then day",
    ],
    breakdown: [
      "Two cumulative aggregates over the same window build the running VWAP: SUM(price*qty) and SUM(qty), each with ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, partitioned by (symbol, day) and ordered by traded_at. The day itself is derived inline as substr(traded_at, 1, 10) so the partition key and the output column come from one expression. The explicit ROWS frame matters: the default RANGE frame would fold same-timestamp fills into one frame step and stamp both with the same pre-sum, corrupting the through-current-fill semantics.",
      "The breach predicate is algebra, not SQL: |price − vwap| ≥ 0.02 × vwap, evaluated per fill against its own cumulative numbers. Writing it as ABS(price − cum_pv/cum_q) >= 0.02 * cum_pv/cum_q avoids dividing twice and keeps the float work in one place. Note the honest framing — a fill can push the vwap it is measured against (the inclusive window), so the comparison is self-referential by design, not a bug.",
      "Picking the FIRST breach per symbol-day is a row-number over the already-filtered set: filter to breaching fills, number them by traded_at inside (symbol, day), keep rn = 1. Filtering BEFORE numbering is what makes 'first' true — numbering the full stream and filtering after would keep the same row here, but the filtered-window form is the one that survives when the predicate changes.",
    ],
    edges: [
      "The first fill of every symbol-day is mathematically unable to breach — its vwap is its own price. The seed still includes symbol-days with NO breach at all (BBX's quiet first day), so a solution that emits a row per symbol-day instead of per breach inflates the output.",
      "Quantity weighting is load-bearing: CCC's opening 5000-share fill pins the vwap so hard that a 10.15 print against a 10.00 anchor reads 1.5% — under 2 — while the same price move on thin volume would breach instantly. A simple-average solution gets CCC wrong.",
      "dev_pct rounds at the very end, after the ≥ 2% gate has fired on unrounded floats: rounding first could admit a 1.996% fill as 2.0 or drop a real 2.004% breach. The gate is on raw values; ROUND decorates the output only.",
      "BBX breaches on day 2 but not day 1 — the partition by (symbol, day) must reset both the cumulative sums and the breach search per day, or BBX's clean day would inherit day 2's verdict.",
    ],
    ladder: [
      { title: "Brute force — recompute the prefix per fill", body: "For each fill, SUM(price*qty) and SUM(qty) over all fills up to its timestamp in the same symbol-day. O(n²), correct, and the definition the window form proves equivalent." },
      { title: "The pattern — two cumulative sums, one frame", body: "A named WINDOW clause (PARTITION BY symbol, day ORDER BY traded_at ROWS UNBOUNDED PRECEDING) drives both sums; vwap is their ratio row by row — O(n log n) total." },
      { title: "The optimal idea — filter, then rank", body: "Breach rows form a small subset; ROW_NUMBER inside it and rn = 1 is the 'first'. The durable rule: running-ratio metrics want the numerator and denominator accumulated SEPARATELY — averaging the ratio (or ratio of averages of raw columns) is the classic wrong answer." },
    ],
    approach: "named WINDOW with an explicit ROWS frame → cumulative price*qty and qty → ratio per fill → breach filter on raw floats → ROW_NUMBER for the first → round for display",
    schema: {
      ddl: `CREATE TABLE Trades (
  txn_id    INTEGER PRIMARY KEY,
  symbol    TEXT NOT NULL,
  traded_at TEXT NOT NULL,
  price     REAL NOT NULL,
  qty       INTEGER NOT NULL
);`,
      seed: `INSERT INTO Trades (txn_id, symbol, traded_at, price, qty) VALUES
  (1, 'AAC', '2025-01-06 09:00', 100.0, 10),
  (2, 'AAC', '2025-01-06 09:05', 102.0, 10),
  (3, 'AAC', '2025-01-06 09:10', 105.0, 10),  -- vwap 102.33 -> dev 2.61% BREACH
  (4, 'AAC', '2025-01-06 09:15', 104.0, 10),
  (5, 'BBX', '2025-01-06 10:00', 50.0, 1000),
  (6, 'BBX', '2025-01-06 10:05', 50.5, 10),
  (7, 'BBX', '2025-01-06 10:10', 49.8, 10),   -- heavy anchor absorbs everything: no breach
  (8, 'BBX', '2025-01-07 10:00', 200.0, 5),
  (9, 'BBX', '2025-01-07 10:05', 210.0, 5),   -- vwap 205 -> dev 2.44% BREACH
  (10, 'CCC', '2025-01-06 11:00', 10.0, 5000),
  (11, 'CCC', '2025-01-06 11:05', 10.15, 10), -- 1.50% - just under the gate
  (12, 'CCC', '2025-01-06 11:10', 10.4, 10);  -- vwap 10.0006 -> dev 3.99% BREACH`,
      tables: [
        { name: "Trades", note: "12 fills across 3 symbols: AAC breaches at 09:10, BBX's day-1 anchor absorbs every move but day 2 breaches at 10:05, CCC rides just under the gate until 11:10" },
      ],
    },
    code: `WITH runs AS (
    SELECT symbol,
        substr(traded_at, 1, 10) AS day,
        traded_at,
        price,
        SUM(price * qty) OVER w AS cum_pv,
        SUM(qty) OVER w AS cum_q
    FROM Trades
    WINDOW w AS (
        PARTITION BY symbol, substr(traded_at, 1, 10)
        ORDER BY traded_at
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    )
),
breaches AS (
    SELECT symbol, day, traded_at, price, cum_pv, cum_q,
        ROW_NUMBER() OVER (PARTITION BY symbol, day ORDER BY traded_at) AS rn
    FROM runs
    WHERE ABS(price - cum_pv * 1.0 / cum_q) >= 0.02 * (cum_pv * 1.0 / cum_q)
)
SELECT symbol,
    day,
    traded_at AS first_breach_at,
    ROUND(100.0 * (price - cum_pv * 1.0 / cum_q) / (cum_pv * 1.0 / cum_q), 2) AS dev_pct
FROM breaches
WHERE rn = 1
ORDER BY symbol, day;`,
    walkthrough: [
      "The runs CTE stamps each of the 12 fills with its symbol-day cumulative pair. AAC walks vwap 100 → 101 → 102.33 — the 09:10 print at 105 sits 2.61% above its running vwap, the first ≥ 2% deviation; the 09:15 print lands back under and is ignored by the first-breach filter.",
      "BBX day 1 never leaves the gate: the 1000-share anchor at 50.0 pins the vwap within ±1% of 50 through both later prints. Day 2 has no anchor — five shares at 200, then five at 210 push the vwap to 205 and the deviation to 2.44% — a breach at 10:05, the day's first and only.",
      "CCC is the weighting proof: 10.15 against a 10.0003 vwap reads 1.50% (under), but 10.40 against 10.0006 reads 3.99% (over) — the tiny late fills barely move an average anchored by 5000 shares. Three rows ship, ordered by symbol then day: AAC · 2025-01-06 · 09:10 · 2.61, BBX · 2025-01-07 · 10:05 · 2.44, CCC · 2025-01-06 · 11:10 · 3.99.",
    ],
    time: "O(n log n) — the window sort; everything after is a linear scan",
    space: "O(n) — one annotated row per fill in the CTEs",
    followUps: [
      "Report the running VWAP column alongside every fill instead of only breaches — which frame keyword keeps same-timestamp fills from sharing a pre-sum, and why?",
      "Raise the gate to 5% and require the LAST breach of the day instead of the first — which two parts of the pipeline change, and does the rounding position matter more or less?",
    ],
    related: ["amount-anomaly-zscore", "rolling-7d-actives", "sessionize-events"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "runway-months-by-burn",
    statement:
      "Cashflows (flow_id, company, month, net) holds one monthly net cash-flow row per company — month is 'YYYY-MM' text, net is negative for burn months and positive for funding or revenue months. A company's balance is the sum of all its nets. Its average monthly burn is the mean of ABS(net) over the months where net was negative (ignoring surplus months entirely). The runway is balance ÷ average burn, in months. Report one row per company: company, balance, runway_months (balance ÷ burn rounded to 1 decimal — NULL when it does not apply) and status: 'profitable' when the company had no burn months at all, 'exhausted' when the balance is zero or negative, 'comfortable' when the runway is at least 12 months, 'tight' when it is at least 6, 'critical' below that. The status compares the UNROUNDED ratio; the displayed runway_months is the rounded one. Order by company.",
    examples: [
      {
        input: "nets +180000, −20000, −30000, −25000",
        output: "… balance 105000, burn average 25000, runway 4.2 → 'critical' …",
        explanation:
          "Only the three negative months feed the burn average — the funding month is deliberately excluded, otherwise a big raise would flatter the denominator and stretch the runway fictionally.",
      },
      {
        input: "nets +50000, +20000, +30000 — never negative",
        output: "… 'profitable', runway_months NULL …",
        explanation:
          "With no burn months the average is undefined (AVG over an empty set is NULL), and dividing by it would be fiction — the status names the situation instead of forcing a number.",
      },
    ],
    constraints: [
      "one row per company: company, balance, runway_months, status",
      "burn average = AVG(−net) over rows WHERE net < 0 only; NULL when there are none",
      "status evaluates the UNROUNDED balance ÷ burn ratio; the thresholds are 12 and 6",
      "order by company",
    ],
    breakdown: [
      "The whole problem folds into one conditional aggregation: SUM(net) is the balance, and AVG(CASE WHEN net < 0 THEN −net END) is the burn average — the CASE yields NULL on surplus months, and AVG ignores NULLs, so the mean runs over burn months only. GROUP BY company does the rest. This is the honest pattern for 'average of a subset' in SQL: a filtered AVG via NULL-else, never AVG(ABS(net)) over everything.",
      "The status ladder is a CASE cascade whose ORDER matters semantically: profitable (no burn months → avg IS NULL) and exhausted (balance ≤ 0) are checked BEFORE any division, because dividing by the burn average for an exhausted company produces a number that reads like hope. Only survivors reach the ≥ 12 / ≥ 6 thresholds, evaluated on the raw ratio — rounding before comparing would shove a 5.96 into 'tight'.",
      "runway_months is displayed for survivors only and NULL otherwise. The two columns intentionally disagree in precision — status on raw, months on rounded — and the walkthrough should say so: a 5.96-month company is 'critical' and prints 6.0, and that tension is the lesson, not a bug to fix.",
    ],
    edges: [
      "Initech's balance is NEGATIVE (−140000) despite a surplus month — the exhaustion check must run on the balance, not on the presence of burn, and its runway_months is NULL because 'months of money left' is undefined when the money is gone.",
      "Hooli never burns a month: AVG over the empty CASE set is NULL, the division branch never fires, and 'profitable' wins. A COALESCE(avg_burn, 0) here would divide by zero for nobody — but it would also mask the profitable case as a 0-burn company; leave the NULL honest.",
      "Globex lands at exactly 4.2 and Acme at exactly 26.0 after rounding — the thresholds still read the raw ratios, so a company at 5.99 would print 6.0 while staying 'critical'.",
    ],
    ladder: [
      { title: "Brute force — two passes", body: "One grouped query for balances, a second over burn-month rows for the averages, then a join. Correct, but two scans and a join where one conditional aggregate suffices." },
      { title: "The pattern — conditional aggregation", body: "SUM + AVG(CASE) in a single GROUP BY: the whole ledger collapses to (balance, avg_burn) per company in one scan." },
      { title: "The optimal idea — classify before you divide", body: "The CASE ladder guards every division. The durable rule: financial ratios are meaningless until you've defined what happens in the degenerate buckets (no burn, no cash) — name those first, compute after." },
    ],
    approach: "one GROUP BY with SUM + AVG(CASE WHEN net<0 THEN −net END), a plan-year WHERE guard and a history HAVING guard → CASE cascade on NULL/≤0/12/6 → ROUND only for display",
    schema: {
      ddl: `CREATE TABLE Cashflows (
  flow_id INTEGER PRIMARY KEY,
  company TEXT NOT NULL,
  month   TEXT NOT NULL,
  net     REAL NOT NULL
);`,
      seed: `INSERT INTO Cashflows (flow_id, company, month, net) VALUES
  (1, 'Acme', '2025-01', 900000),
  (2, 'Acme', '2025-02', -30000),
  (3, 'Acme', '2025-03', -28000),
  (4, 'Acme', '2025-04', -32000),
  (5, 'Acme', '2025-05', -30000),   -- balance 780000 / burn 30000 = 26.0 comfortable
  (6, 'Globex', '2025-01', 180000),
  (7, 'Globex', '2025-02', -20000),
  (8, 'Globex', '2025-03', -30000),
  (9, 'Globex', '2025-04', -25000), -- balance 105000 / burn 25000 = 4.2 critical
  (10, 'Hooli', '2025-01', 50000),
  (11, 'Hooli', '2025-02', 20000),
  (12, 'Hooli', '2025-03', 30000),  -- never burns: profitable
  (13, 'Initech', '2025-01', -40000),
  (14, 'Initech', '2025-02', -35000),
  (15, 'Initech', '2025-03', -30000),
  (16, 'Initech', '2025-04', -45000),
  (17, 'Initech', '2025-05', 10000); -- balance -140000: exhausted despite the surplus`,
      tables: [
        { name: "Cashflows", note: "17 monthly nets across 4 companies — one comfortable, one critical, one never-burn, one exhausted-with-a-surplus-month" },
      ],
    },
    code: `SELECT company,
    SUM(net) AS balance,
    AVG(CASE WHEN net < 0 THEN -net END) AS avg_burn,
    CASE
        WHEN AVG(CASE WHEN net < 0 THEN -net END) IS NULL
             OR SUM(net) <= 0 THEN NULL
        ELSE ROUND(SUM(net) / AVG(CASE WHEN net < 0 THEN -net END), 1)
    END AS runway_months,
    CASE
        WHEN AVG(CASE WHEN net < 0 THEN -net END) IS NULL THEN 'profitable'
        WHEN SUM(net) <= 0 THEN 'exhausted'
        WHEN SUM(net) / AVG(CASE WHEN net < 0 THEN -net END) >= 12 THEN 'comfortable'
        WHEN SUM(net) / AVG(CASE WHEN net < 0 THEN -net END) >= 6 THEN 'tight'
        ELSE 'critical'
    END AS status
FROM Cashflows
WHERE month >= '2025-01'   -- the 2025 plan year; the ledger holds no earlier rows
GROUP BY company
HAVING COUNT(*) >= 3       -- a burn average over fewer than 3 months is noise
ORDER BY company;`,
    walkthrough: [
      "The single grouped SELECT folds each ledger to its numbers inline: Acme: balance 900000 − 120000 = 780000, burn average (30000+28000+32000+30000)/4 = 30000. Globex: 180000 − 75000 = 105000, burn 25000. Hooli: balance 100000, avg_burn NULL. Initech: −150000 + 10000 = −140000, burn 37500. The plan-year WHERE guard (month >= '2025-01') is a scope statement the seed satisfies trivially — its value shows the day someone loads 2024 rows into the table.",
      "The status cascade reads raw ratios: Acme 26.0 ≥ 12 → 'comfortable'; Globex 4.2 < 6 → 'critical'; Hooli's NULL routes to 'profitable' before any division; Initech's negative balance routes to 'exhausted' — its 3.7-ish raw ratio never gets a voice.",
      "runway_months rounds survivors only: 26.0 and 4.2, with NULL for Hooli and Initech. Four rows ship in company order: Acme · 780000 · 26.0 · comfortable, Globex · 105000 · 4.2 · critical, Hooli · 100000 · NULL · profitable, Initech · −140000 · NULL · exhausted.",
    ],
    time: "O(n) — one scan, one grouped aggregate",
    space: "O(k) — one row per company",
    followUps: [
      "Show only the companies whose status would CHANGE if the burn average included surplus months — which rows move, and in which direction does the runway lie?",
      "Add the month count used in the burn average as a column — why does AVG's NULL-skipping make COUNT(net < 0 rows) the wrong companion unless it counts the same subset?",
    ],
    related: ["daily-balance-interest", "mrr-waterfall", "budget-pacing"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "midnight-shift-pay-split",
    statement:
      "Shifts (shift_id, employee, started_at, ended_at) logs warehouse shifts as 'YYYY-MM-DD HH:MI' text. Pay is 30 per hour for day time and 45 per hour (time-and-a-half) for night time, where night means the minutes whose time-of-day falls in [22:00, 06:00) — the window WRAPS across midnight. Hours are paid by the exact minute (fractions of an hour), and a shift that crosses midnight splits cleanly into its two calendar nights. Every shift is at most 24 hours and crosses at most one midnight. Report one row per employee: employee and total_pay (the sum over their shifts of day-minutes × 30/60 + night-minutes × 45/60, rounded to 2 decimals), ordered by employee.",
    examples: [
      {
        input: "a shift 20:00 → 02:00 (6 hours)",
        output: "… 2 day hours × 30 + 4 night hours × 45 = 240 …",
        explanation:
          "The shift's night portion is [22:00, 24:00) plus [00:00, 02:00) — 240 night minutes — and the two calendar nights belong to ONE computation because the wrap is handled by clipping against both boundaries.",
      },
      {
        input: "a shift entirely inside the night, 23:00 → 01:00",
        output: "… 2 night hours × 45 = 90, zero day minutes …",
        explanation:
          "Both clipping terms survive: the pre-midnight stretch [23:00, 24:00) and the post-midnight stretch [00:00, 01:00) — a solution that only checks 'started before midnight' double-charges or misses one side.",
      },
    ],
    constraints: [
      "one row per employee: employee, total_pay (ROUND 2)",
      "night minutes: time-of-day in [22:00, 24:00) union [00:00, 06:00), clipped to the shift",
      "every shift ≤ 24h and crosses at most one midnight (seed guarantees)",
      "order by employee",
    ],
    breakdown: [
      "Minute-accurate night detection over a wrapping window looks like a case explosion until you pick the right single window: every shift's night minutes live inside exactly ONE wrapped window [D 22:00, D+1 06:00), where D is the calendar day of (started_at − 6 hours). The −6h shift is the trick — a 00:30 start belongs to the PREVIOUS evening's night window, and subtracting six hours pulls its anchor date back one day, while a 21:45 start keeps its own. Since every shift is ≤ 24h and crosses at most one midnight, one window suffices.",
      "With the window anchored, night minutes are ONE interval clipping: the overlap of [start, end) with [D 22:00, D+1 06:00), computed as MIN of the two ends minus MAX of the two starts, floored at 0 with SQLite's scalar MAX(0, …) — the same interval-arithmetic idiom as a sweep-line. The anchors are pure date arithmetic: julianday(date(started_at, '-6 hours'), '+22 hours') lands on the window's 22:00 start and '+1 day', '+6 hours' on its 06:00 end. No string surgery, no CASE per shift shape.",
      "Total minutes is just (julianday(ended) − julianday(started)) × 1440, and day minutes = total − night; the pay formula 30 × day/60 + 45 × night/60 then aggregates per employee. Fractional hours are preserved by dividing by 60.0 — integer division here is the classic silent bug that rounds every quarter-hour to zero.",
    ],
    edges: [
      "Dia's shift starts at 00:30 — AFTER midnight, same calendar day. Its night window is the PREVIOUS evening's [03-04 22:00, 03-05 06:00), which the −6h anchor rule derives automatically (00:30 − 6h = 03-04 18:30). A formulation that anchors on started_at's own day misses this row entirely; a two-clip formulation anchored on the start day misses it too, because its post-midnight clip would look at 03-06.",
      "Cy's 21:45 → 06:15 shift is the wrap stress test: 15 evening minutes (21:45–22:00) are DAY pay, 480 night minutes earn the differential, and the 15 post-06:00 minutes are day again — total 510 minutes, and only the clipped window gets all three segments right.",
      "Ben's second shift 22:30 → 23:30 never reaches midnight: the window clip still works — MIN(end, 06:00) is the shift's own end, MAX(start, 22:00) is its own start, and the overlap is just its 60 night minutes. The same expression is safe for shifts that don't wrap because both ends are clipped independently.",
      "Ana's second shift (09:00 → 13:00) is pure day: its −6h anchor lands on the previous day's window, which the shift never touches, and the floor-at-0 makes the overlap exactly 0 — night_min 0, all 240 minutes at the day rate.",
    ],
    ladder: [
      { title: "Brute force — minute loop", body: "Expand each shift into 60-second buckets via a recursive CTE and classify each minute. Bulletproof and O(total minutes), but 500+ rows where three arithmetic expressions would do." },
      { title: "The pattern — one wrapped window, one clip", body: "Anchor D = date(started_at, '-6 hours'); night = MAX(0, MIN(end, D+1 06:00) − MAX(start, D 22:00)). One window, one overlap, no branching." },
      { title: "The optimal idea — shift the anchor, not the logic", body: "Wrapping time windows are single intervals once the anchor date is chosen correctly. The durable rule: when a window wraps midnight, move the CALENDAR reference (−6h) so the wrap disappears — never split the computation in two." },
    ],
    approach: "anchor date = date(started_at, '-6 hours') → one clipped overlap against [D 22:00, D+1 06:00) → day = total − night → 30/60 + 45/60 blend → GROUP BY employee",
    schema: {
      ddl: `CREATE TABLE Shifts (
  shift_id   INTEGER PRIMARY KEY,
  employee   TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at   TEXT NOT NULL
);`,
      seed: `INSERT INTO Shifts (shift_id, employee, started_at, ended_at) VALUES
  (1, 'Ana', '2025-03-03 20:00', '2025-03-04 02:00'),  -- 120 day + 240 night = 240.0
  (2, 'Ana', '2025-03-04 09:00', '2025-03-04 13:00'),  -- 240 day = 120.0
  (3, 'Ben', '2025-03-03 23:00', '2025-03-04 01:00'),  -- all night = 90.0
  (4, 'Ben', '2025-03-04 22:30', '2025-03-04 23:30'),  -- same-evening night = 45.0
  (5, 'Cy',  '2025-03-03 06:00', '2025-03-03 14:00'),  -- all day = 240.0
  (6, 'Cy',  '2025-03-04 21:45', '2025-03-05 06:15'),  -- 30 day + 480 night = 375.0
  (7, 'Dia', '2025-03-05 00:30', '2025-03-05 04:30');  -- after-midnight start: 180.0`,
      tables: [
        { name: "Shifts", note: "7 shifts, 4 employees — every shift shape: evening wrap, all-day, same-evening night, after-midnight start, and the 21:45→06:15 triple-segment stress test" },
      ],
    },
    code: `WITH mins AS (
    SELECT employee,
        (julianday(ended_at) - julianday(started_at)) * 1440 AS total_min,
        MAX(0,
            MIN(julianday(ended_at),
                julianday(date(started_at, '-6 hours'), '+1 day', '+6 hours'))
          - MAX(julianday(started_at),
                julianday(date(started_at, '-6 hours'), '+22 hours'))
        ) * 1440 AS night_min
    FROM Shifts
)
SELECT employee,
    ROUND(SUM(30 * (total_min - night_min) / 60.0 + 45 * night_min / 60.0), 2) AS total_pay
FROM mins
GROUP BY employee
ORDER BY employee;`,
    walkthrough: [
      "The mins CTE anchors each shift's night window at date(started_at, '-6 hours') and clips once. Ana's wrap: start 20:00 → D = 03-03; overlap with [03-03 22:00, 03-04 06:00) reads MIN(02:00, 06:00) − MAX(20:00, 22:00) = 02:00 − 22:00 → 240 night minutes of 360 total. Ben's all-nighter: D = 03-03, overlap 23:00 → 01:00 = 120 of 120. Cy's stress shift: D = 03-04; the window's 22:00 start clips away the 15 pre-night minutes and its 06:00 end clips away the 15 morning minutes — 480 night of 510. Dia: start 00:30 03-05 → −6h anchors D = 03-04, and the overlap with [03-04 22:00, 03-05 06:00) is 00:30 → 04:30 = 240 — the row the start-day anchor rule would have lost.",
      "Pay blends at the minute: Ana (120 day + 240 night) → 60 + 180 = 240, plus her all-day 240 minutes → 120; total 360.0. Ben: 90 + 45 = 135.0. Cy: 240 for the day shift, then 15 × 0.5 + 480 × 0.75 = 15 + 360 = 375 — total 615.0. Dia: 180.0.",
      "Four rows ship in employee order: Ana · 360.0, Ben · 135.0, Cy · 615.0, Dia · 180.0 — every one of them a sum the single wrapped window produces without a single CASE on shift shape.",
    ],
    time: "O(n) — constant-time interval arithmetic per shift",
    space: "O(n) — one annotated row per shift",
    followUps: [
      "Split the report per employee per CALENDAR DAY instead of per employee — where must the GROUP BY grain change, and which of the night minutes belong to the day the shift STARTED?",
      "Add a third tier (double-time past 12 night hours in one shift) — why does a pure rate-map column stop working, and what has to become a running computation?",
    ],
    related: ["streak-week-bonus-ladder", "find-overlapping-shifts-ii", "server-utilization-time"],
    order: "exact",
    xp: 20,
  },
];
