// Deep-dives — the BOSS LEVEL II band, file B of B (3 problems: 1 Hard,
// 2 Medium). Original time-series/finance problems authored for this app:
// effective-dated rate blending, bilateral netting for settlement and
// fill-forward price staleness over a minute spine. Every solution is
// engine-verified against its own seed by scripts/lc-boss2-verify.ts
// before wiring.
import type { LcSqlDive } from "../types";

export const SQL_BOSS2_B: LcSqlDive[] = [
  {
    slug: "blended-rate-over-effective-dates",
    statement:
      "RateCards (rate_id, facility, rate, effective_from) holds effective-dated lending rates: each row's rate applies from its effective_from (a 'YYYY-MM-DD' date) until the facility's NEXT rate takes effect — or indefinitely if there is no next one. The billing window is the quarter [2025-04-01, 2025-07-01), which spans exactly 91 days. For each facility, compute the duration-weighted blended rate: the sum of rate × active-days inside the window, divided by 91. Rates effective before the window simply run into it; rates effective after it contribute nothing. Report one row per facility: facility, blended_rate (rounded to 2 decimals) and days_uncovered (91 minus the days actually covered by some rate). Order by facility.",
    examples: [
      {
        input: "a facility with rates 8.0 from 2025-01-01 and 9.5 from 2025-04-15",
        output: "… 8.0 covers 14 days, 9.5 covers 77 days → (8×14 + 9.5×77)/91 = 9.27 …",
        explanation:
          "The January rate predates the window and simply runs until the April rate — its active-days are CLIPPED to the window, not zeroed, because the rate was genuinely in force.",
      },
      {
        input: "a facility whose only rate starts 2025-04-20",
        output: "… 72 covered days, 19 uncovered, blended (12×72)/91 = 9.49 …",
        explanation:
          "Uncovered days contribute zero to the numerator but stay in the denominator — the blend is per-QUARTER, not per-covered-day, and days_uncovered makes the difference visible.",
      },
    ],
    constraints: [
      "one row per facility: facility, blended_rate (ROUND 2), days_uncovered",
      "each rate's span is [effective_from, next effective_from) clipped to [2025-04-01, 2025-07-01)",
      "the window is exactly 91 days; uncovered days contribute nothing to the numerator",
      "order by facility",
    ],
    breakdown: [
      "Effective-dated rows are intervals in disguise: each rate's span ends where the NEXT rate begins, which is LEAD(effective_from) OVER (PARTITION BY facility ORDER BY effective_from) — COALESCE'd to the window end for the latest rate. The window START needs no LEAD: it comes from clipping the span's beginning with MAX(effective_from, window_start). One window function plus two scalar clips turns a rate card into a set of (from_d, to_d) day-spans.",
      "The clip is where this problem earns its badge: a span may begin before the window (running in), end after it (running out), or BOTH ends may fall outside entirely — two rates effective in 2024 produce two spans whose to_d < from_d inside the window. The guard to_d > from_d filters those dead spans BEFORE aggregation; forgetting it makes the SUM go quietly wrong with negative day counts instead of failing loudly.",
      "The blend divides by the FIXED 91.0 window length, not by the covered days — that choice IS the business question ('what did this quarter cost'), and days_uncovered (91 − CAST(SUM(days) AS INTEGER)) is the honesty column that shows when the denominator includes time no rate covered. Fractions of days never occur because every boundary is a whole date, so the CAST is safe — the walkthrough states why.",
    ],
    edges: [
      "F3's only rate predates the window by four months: its LEAD is NULL (COALESCE → window end) and its from_d clips to the window start — one span covering all 91 days, zero uncovered. A solution that drops rates effective before the window loses this facility entirely.",
      "F5 stacks TWO pre-window rates, and the seed's trap inverts: the 3.0 span dies at the to_d > from_d guard (its clipped end, 2024-11-01, precedes the window start), but the 4.5 rate — effective 2024-11-01, superseded 2025-05-01 — IS in force for April: its span clips to [04-01, 05-01), 30 days. April bills at 4.5, May and June at 6.0 (61 days): 91 covered, 0 uncovered. A solution that drops pre-window rates wholesale loses April and prints 4.02 with 30 phantom uncovered days.",
      "F1's mid-window rate switch sums to exactly 91 covered days (14 + 77) — the CAST(SUM … AS INTEGER) is exact here, but the walkthrough should note it holds only because date boundaries are whole days; a problem with intraday rates would need a different uncovered-day definition.",
      "LEAD runs over ALL the facility's rates (ORDER BY effective_from), not just in-window ones — the pre-window rate's span must terminate at the NEXT rate even when that next rate is also pre-window, which is exactly the chain F5 exercises.",
    ],
    ladder: [
      { title: "Brute force — self-join for the next date", body: "Join each rate to the earliest later rate per facility, then clip. Correct and O(n²) per facility; the LEAD window form is the same plan without the join." },
      { title: "The pattern — LEAD + interval clipping", body: "to_d = LEAD(from) COALESCE'd to window end; from_d = MAX(from, window start); keep only to_d > from_d; the rest is arithmetic." },
      { title: "The optimal idea — clip first, aggregate last", body: "Filtering dead spans BEFORE the SUM is what keeps the blend honest. The durable rule: effective-dated logic is LEAD-built intervals + clip — never per-row CASE trees on date comparisons." },
    ],
    approach: "LEAD over effective dates → COALESCE the tail to window end → MAX/MIN clip both span ends → guard to_d > from_d → weighted SUM ÷ 91.0 with an uncovered-days column",
    schema: {
      ddl: `CREATE TABLE RateCards (
  rate_id        INTEGER PRIMARY KEY,
  facility       TEXT NOT NULL,
  rate           REAL NOT NULL,
  effective_from TEXT NOT NULL
);`,
      seed: `INSERT INTO RateCards (rate_id, facility, rate, effective_from) VALUES
  (1, 'F1', 8.0,  '2025-01-01'),
  (2, 'F1', 9.5,  '2025-04-15'),  -- 14d @8.0 + 77d @9.5 -> 9.27, 0 uncovered
  (3, 'F2', 12.0, '2025-04-20'),  -- 72d @12.0 -> 9.49, 19 uncovered
  (4, 'F3', 5.0,  '2024-12-01'),  -- predates window, runs in: 91d -> 5.0
  (5, 'F4', 7.5,  '2025-05-10'),
  (6, 'F4', 11.0, '2025-06-20'),  -- 41d + 11d = 52 -> 4.71, 39 uncovered
  (7, 'F5', 3.0,  '2024-06-01'),
  (8, 'F5', 4.5,  '2024-11-01'),
  (9, 'F5', 6.0,  '2025-05-01');  -- 3.0 span dies; 4.5 covers April (30d), 6.0 covers 61d -> 5.51`,
      tables: [
        { name: "RateCards", note: "9 effective-dated rows across 5 facilities — full cover, late start, deep pre-window run-in, mid-window switch, and a double-pre-window chain whose middle rate still covers April" },
      ],
    },
    code: `WITH spans AS (
    SELECT facility,
        rate,
        MAX(julianday(effective_from), julianday('2025-04-01')) AS from_d,
        MIN(COALESCE(julianday(LEAD(effective_from) OVER (
                PARTITION BY facility ORDER BY effective_from)),
                julianday('2025-07-01')),
            julianday('2025-07-01')) AS to_d
    FROM RateCards
),
live AS (
    SELECT * FROM spans WHERE to_d > from_d
)
SELECT facility,
    ROUND(SUM(rate * (to_d - from_d)) / 91.0, 2) AS blended_rate,
    91 - CAST(SUM(to_d - from_d) AS INTEGER) AS days_uncovered
FROM live
GROUP BY facility
ORDER BY facility;`,
    walkthrough: [
      "The spans CTE converts 9 rate rows into clipped day-spans. F1: 8.0 runs from 04-01 (clipped) to 04-15 — 14 days; 9.5 from 04-15 to 07-01 — 77 days. F3's lone 2024 rate clips to one 91-day span. F5: the 3.0 span dies at the guard (clipped end 2024-11-01 < window start), but the 4.5 span CLIPS to [04-01, 05-01) — 30 days, because the rate was genuinely in force through April — and the 6.0 span runs 05-01 → 07-01, 61 days.",
      "The live guard drops exactly one dead span (F5's 3.0) before aggregation — without it, SUM would subtract its negative overlap and understate the blend. F2 keeps one 72-day span (19 uncovered); F4 keeps 41 + 11 = 52 (39 uncovered); F5 keeps 30 + 61 = 91 (0 uncovered).",
      "The blend divides by the fixed 91.0: F1 = (8×14 + 9.5×77)/91 = 843.5/91 → 9.27; F2 = 864/91 → 9.49; F3 = 455/91 → 5.0; F4 = 428.5/91 → 4.71; F5 = (4.5×30 + 6×61)/91 = 501/91 → 5.51. Five rows in facility order, with uncovered columns 0, 19, 0, 39, 0.",
    ],
    time: "O(n log n) — the LEAD sort; the rest is linear",
    space: "O(n) — one span per rate row",
    followUps: [
      "Add a fallback rate of 9.0 that prices every uncovered day — which CTE changes, and why does days_uncovered become a check column instead of an output?",
      "Bill half the quarter (2025-05-16 onward) — which clip constants move, and which facility's blend is most sensitive to the change?",
    ],
    related: ["point-in-time-asof", "daily-balance-interest", "deferred-revenue"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "bilateral-netting-settlement",
    statement:
      "Obligations (obligation_id, payer, payee, amount) records gross payment obligations between accounts — money may flow BOTH directions between the same two names on different rows. Before settlement, each unordered pair nets out: net = Σ(payer→payee) − Σ(payee→payer). Report ONE row per pair whose net is non-zero: payer (the side that owes), payee (the side that is owed) and net_amount (the absolute net, rounded to 2 decimals). Perfectly-even pairs settle to nothing and appear nowhere. Order by payer, then payee. Every row has payer ≠ payee.",
    examples: [
      {
        input: "Acme→Globex 1000, Acme→Globex 250, Globex→Acme 400",
        output: "… one row: Acme pays Globex 850 …",
        explanation:
          "Both directions aggregate into one signed net before any decision — three gross obligations collapse to a single transfer, which is the entire economic point of netting.",
      },
      {
        input: "Initech→Hooli 300 and Hooli→Initech 300",
        output: "… no row — the pair nets to zero and settles itself …",
        explanation:
          "The HAVING net ≠ 0 filter is what makes even pairs disappear; without it, a zero row would ask the settlement system to move nothing.",
      },
    ],
    constraints: [
      "one row per unordered pair with net ≠ 0: payer, payee, net_amount (ROUND 2)",
      "payer is the net debtor, payee the net creditor — direction follows the sign of the net",
      "pairs netting to exactly zero produce no row",
      "order by payer, then payee",
    ],
    breakdown: [
      "The canonical trick for unordered-pair aggregation: normalize every obligation to a fixed (lo, hi) orientation — lo = MIN(payer, payee), hi = MAX(payer, payee) — and carry a SIGNED amount: +amount when the raw direction agrees with lo→hi, −amount when it runs the other way. CASE expressions on the string comparison do all three at once. After that, GROUP BY lo, hi and SUM: one row per pair, sign tells the direction.",
      "The output pivot inverts the canonicalization: net > 0 means lo owes hi (payer = lo, payee = hi); net < 0 means hi owes lo, so the names swap and ABS(net) fixes the magnitude. The HAVING SUM(amt) <> 0 drops settled pairs before the pivot — filtering after would require re-checking the amount in the outer WHERE on an aliased expression, which SQL disallows; HAVING on the aggregate is the idiomatic gate.",
      "Why orientation-first beats the obvious alternative: a GROUP BY payer, payee aggregation produces two rows per active pair that then need a self-join to reconcile — twice the scan and an anti-join for pairs that only flowed one way. The signed-canonical form reaches the answer in one pass and cannot double-count, because each raw row maps to exactly one canonical bucket.",
    ],
    edges: [
      "The Umbrella/Initech pair nets NEGATIVE (200.5 owed to Umbrella vs 500 back): the pivot must swap BOTH names and flip the sign — shipping payer Umbrella with a negative amount would read as money owed backwards.",
      "Acme→Hooli is one-sided: the reverse direction never appears in the table, and the canonical SUM is just the single signed row — the HAVING gate passes it untouched. Netting solutions that require both directions to exist lose it.",
      "The zero pair (Initech/Hooli at exactly 300 vs 300) is the HAVING test: SUM equality on REALs is exact here because the seed uses identical values, and the pair vanishes — the walkthrough should note that a 'SUM <> 0' float comparison is a convention, not a guarantee, for genuinely messy ledgers.",
      "Name ordering is purely lexical (CASE WHEN payer < payee): it carries no business meaning and exists only so both directions of a pair land in the SAME bucket — the direction decision happens once, after aggregation, never per row.",
    ],
    ladder: [
      { title: "Brute force — two-sided aggregation", body: "GROUP BY payer, payee, then self-join the result A→B against B→A and subtract. Correct; two scans, a join, and an OUTER join to catch one-sided pairs." },
      { title: "The pattern — signed canonical pairs", body: "Map every row to (lo, hi, ±amount) in one CASE pass, GROUP BY (lo, hi), HAVING SUM ≠ 0 — one scan, no join." },
      { title: "The optimal idea — canonicalize, then decide", body: "Orientation is a grouping device, not a business fact: decide direction AFTER the net exists. The durable rule: bilateral ledgers become unilateral with a sign flip — the pivot at the end is the only place direction is spoken aloud." },
    ],
    approach: "CASE-canonicalize to (lo, hi, signed) → GROUP BY + HAVING SUM <> 0 → pivot payer/payee off the sign → ABS + ROUND for the output",
    schema: {
      ddl: `CREATE TABLE Obligations (
  obligation_id INTEGER PRIMARY KEY,
  payer         TEXT NOT NULL,
  payee         TEXT NOT NULL,
  amount        REAL NOT NULL
);`,
      seed: `INSERT INTO Obligations (obligation_id, payer, payee, amount) VALUES
  (1, 'Acme', 'Globex', 1000),
  (2, 'Acme', 'Globex', 250),
  (3, 'Globex', 'Acme', 400),    -- net 850 Acme->Globex
  (4, 'Initech', 'Hooli', 300),
  (5, 'Hooli', 'Initech', 300),  -- nets to zero: no row
  (6, 'Umbrella', 'Initech', 120),
  (7, 'Umbrella', 'Initech', 80.5),
  (8, 'Initech', 'Umbrella', 500), -- net -299.5: Initech pays Umbrella
  (9, 'Globex', 'Hooli', 75),
  (10, 'Hooli', 'Globex', 40),   -- net 35 Globex->Hooli
  (11, 'Acme', 'Hooli', 60);     -- one-sided: 60 Acme->Hooli`,
      tables: [
        { name: "Obligations", note: "11 gross obligations — a multi-row pair, a perfect zero, a negative-net pair, a small two-way pair and a one-sided pair" },
      ],
    },
    code: `WITH signed AS (
    SELECT
        CASE WHEN payer < payee THEN payer ELSE payee END AS lo,
        CASE WHEN payer < payee THEN payee ELSE payer END AS hi,
        CASE WHEN payer < payee THEN amount ELSE -amount END AS amt
    FROM Obligations
    WHERE payer <> payee   -- a self-obligation nets to nothing by definition
),
netted AS (
    SELECT lo, hi, SUM(amt) AS net
    FROM signed
    GROUP BY lo, hi
)
SELECT CASE WHEN net > 0 THEN lo ELSE hi END AS payer,
    CASE WHEN net > 0 THEN hi ELSE lo END AS payee,
    ROUND(ABS(net), 2) AS net_amount
FROM netted
WHERE net <> 0             -- settled pairs (net zero) move no money
ORDER BY payer, payee;`,
    walkthrough: [
      "The signed CTE canonically buckets all 11 rows: Acme/Globex becomes (Acme, Globex) with +1000, +250 and −400; Umbrella/Initech becomes (Initech, Umbrella) with −120, −80.5 and +500 (Umbrella > Initech lexically, so Umbrella's outflows flip sign); the rest are single-signed or offsetting.",
      "The netted SUM reads: Acme/Globex +850, Initech/Hooli 0, Initech/Umbrella −299.5, Globex/Hooli +35, Acme/Hooli +60 — and the outer WHERE net <> 0 holds the settled zero pair back from the output. Four rows advance.",
      "The pivot speaks direction: +850 → Acme pays Globex; −299.5 → the names swap, Initech pays Umbrella 299.5; +35 → Globex pays Hooli; +60 → Acme pays Hooli. Ordered by payer then payee: Acme · Globex · 850.0, Acme · Hooli · 60.0, Globex · Hooli · 35.0, Initech · Umbrella · 299.5.",
    ],
    time: "O(n) — one scan, one hash aggregate",
    space: "O(p) — one canonical row per pair",
    followUps: [
      "Add a per-payer settlement cap of 500 — which rows clip, and why does capping AFTER netting (not before) keep the ledger consistent?",
      "Include the gross two-way volume beside the net — why does that column need its own conditional aggregate, and what does it reveal about the zero pair?",
    ],
    related: ["duplicate-charge-pairs", "balance-rollforward", "gl-reconciliation"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "price-fill-forward-staleness",
    statement:
      "A price feed logs Ticks (tick_id, symbol, priced_at, price) — priced_at in 'YYYY-MM-DD HH:MI' text, at most one tick per symbol per minute, but minutes go MISSING when the feed drops. The monitoring window is [2025-03-06 10:00, 2025-03-06 10:59] — 60 consecutive minutes. For each symbol, build the full per-minute grid (a recursive spine), fill prices FORWARD through missing minutes (each missing minute shows the last known price), and report: symbol, last_price (the fill-forward value at 10:59 — the price of the symbol's latest in-window tick), stale_minutes (whole minutes from that last tick to 10:59), max_gap (the longest run of CONSECUTIVE window minutes with no tick at all — 0 if the symbol ticked every minute) and tick_count (in-window ticks). Order by symbol. Ticks outside the window are ignored entirely.",
    examples: [
      {
        input: "a symbol ticked at 10:00, 10:30 and 10:55",
        output: "… last_price 100.5, stale_minutes 4, max_gap 29 (10:01–10:29) …",
        explanation:
          "Fill-forward means 10:56–10:59 all display 100.5 — but staleness is measured from the last REAL tick, which is the honesty metric the filled grid would happily hide.",
      },
      {
        input: "a symbol whose only gap is zero — ticked every minute",
        output: "… max_gap 0 even though every other symbol has gaps …",
        explanation:
          "The islands COUNT is over an empty set for such a symbol — COALESCE(MAX(run), 0) is what turns 'no islands' into the number 0 instead of a missing row.",
      },
    ],
    constraints: [
      "one row per symbol: symbol, last_price, stale_minutes, max_gap, tick_count",
      "the window is 60 minutes [10:00, 10:59] on 2025-03-06; out-of-window ticks are ignored",
      "max_gap counts consecutive MISSING grid minutes per symbol (0 when none)",
      "stale_minutes = whole minutes from the latest in-window tick to 10:59",
      "order by symbol",
    ],
    breakdown: [
      "The minute spine is a recursive CTE anchored at '2025-03-06 10:00' that appends '+1 minute' (formatted back through strftime) while below 10:59 — 60 rows, the clock the feed should have kept. CROSS JOINing it with DISTINCT symbols and LEFT JOINing the ticks on (symbol, minute) builds the full grid: one row per symbol-minute, price NULL exactly where the feed went quiet. This grid is the standard 'time spine' pattern — the fix for every 'report the hours nobody worked' problem.",
      "max_gap is islands-and-gaps over the grid's NULL minutes: number each missing minute within its symbol with ROW_NUMBER, and subtract the minute's index-from-window-start — computed in EPOCH SECONDS (strftime('%s') difference ÷ 60), not julianday. The julian-day route is the problem's planted trap: julianday returns binary floats where ×1440 lands at 29.9999… as often as 30.0000, and CAST truncates inconsistently — consecutive-run grouping then shatters into phantom islands (the engine's first draft split a clean 49-minute hole into 40). Epoch seconds are exact integers, so index arithmetic never drift. Within a consecutive run, index and row_number advance in lockstep, so their difference is CONSTANT — group by that difference and COUNT to get run lengths; MAX over them is the longest gap. The classic islands trick, applied to MISSING rows instead of present ones.",
      "last_price and stale_minutes deliberately do NOT use the grid: the fill-forward value at 10:59 is just the latest in-window tick (ROW_NUMBER ordered by priced_at DESC, keep rn = 1), and staleness is the minute distance from that tick to the window end. tick_count counts the same in-window rows. One named window over the real ticks answers three of the five columns; the spine only exists for max_gap.",
    ],
    edges: [
      "AAA has a 09:59 tick planted just before the window: it must not count toward tick_count, must not anchor last_price, and must not break the grid — every filter in the solution is explicitly window-bounded, and the walkthrough checks the tick stays invisible.",
      "CCC ticks at the exact window endpoints (10:00 and 10:59): its last tick IS the window end, so stale_minutes is 0 — and its 58-minute hole is the max gap any symbol can approach (60 would mean zero ticks, a symbol the DISTINCT-symbols driver still reports honestly).",
      "BBB ticks 11 consecutive minutes then goes silent for 49 — its max_gap (49) EQUALS its staleness (49), which is not a coincidence but a property: when the gap runs to the window end, the two measures converge. The seed plants the case so the equivalence is visible rather than accidental.",
      "The epoch-seconds index is the quiet hero: the same islands query written with julianday × 1440 and CAST truncates binary-float wobble inconsistently and reports AAA 27 / BBB 40 / CCC 48 — every gap shattered by phantom splits. Any 'consecutive minutes' logic over datetime text should key off strftime('%s') integers; the walkthrough numbers only reproduce when the index is exact.",
      "Symbols are driven from the Ticks table itself (SELECT DISTINCT symbol) — a symbol with ticks ONLY outside the window would join the grid but show an empty last row; the seed avoids that degenerate case and the constraints say out-of-window ticks are ignored entirely.",
    ],
    ladder: [
      { title: "Brute force — per-symbol procedure", body: "For each symbol, scan minutes 0..59 in application code tracking last-seen and run lengths. Fine in a cursor; impossible in one set-based statement." },
      { title: "The pattern — recursive spine + islands", body: "The recursive CTE manufactures the missing clock; LEFT JOIN + NULL-flag + index-minus-row_number turns consecutive absences into countable islands." },
      { title: "The optimal idea — measure staleness from ticks, not from the fill", body: "Fill-forward is a DISPLAY convenience; every metric that means 'how old is this data' must read the REAL ticks. The durable rule: build the grid to see the holes, measure from the data to price them." },
    ],
    approach: "recursive minute spine → grid via LEFT JOIN → NULL-minute islands (index − ROW_NUMBER) for max_gap → latest in-window tick for last_price/staleness → COUNT for tick_count",
    schema: {
      ddl: `CREATE TABLE Ticks (
  tick_id   INTEGER PRIMARY KEY,
  symbol    TEXT NOT NULL,
  priced_at TEXT NOT NULL,
  price     REAL NOT NULL
);`,
      seed: `INSERT INTO Ticks (tick_id, symbol, priced_at, price) VALUES
  (1,  'AAA', '2025-03-06 09:59', 99.0),   -- outside the window: ignored
  (2,  'AAA', '2025-03-06 10:00', 100.0),
  (3,  'AAA', '2025-03-06 10:30', 101.5),
  (4,  'AAA', '2025-03-06 10:55', 100.5),  -- stale 4, gaps 29 & 24
  (5,  'BBB', '2025-03-06 10:00', 51.0),
  (6,  'BBB', '2025-03-06 10:01', 51.1),
  (7,  'BBB', '2025-03-06 10:02', 51.05),
  (8,  'BBB', '2025-03-06 10:03', 51.2),
  (9,  'BBB', '2025-03-06 10:04', 51.15),
  (10, 'BBB', '2025-03-06 10:05', 51.3),
  (11, 'BBB', '2025-03-06 10:06', 51.25),
  (12, 'BBB', '2025-03-06 10:07', 51.1),
  (13, 'BBB', '2025-03-06 10:08', 51.2),
  (14, 'BBB', '2025-03-06 10:09', 51.3),
  (15, 'BBB', '2025-03-06 10:10', 51.25),  -- silent 10:11-10:59: stale 49, gap 49
  (16, 'CCC', '2025-03-06 10:00', 42.0),
  (17, 'CCC', '2025-03-06 10:59', 42.25),  -- endpoints only: stale 0, gap 58
  (18, 'DDD', '2025-03-06 10:05', 77.0),
  (19, 'DDD', '2025-03-06 10:20', 77.5),
  (20, 'DDD', '2025-03-06 10:45', 77.0);   -- stale 14, gaps 5/14/24`,
      tables: [
        { name: "Ticks", note: "20 ticks across 4 symbols — a pre-window decoy, an 11-minute burst then silence, endpoint-only ticks, and a three-gap scatter" },
      ],
    },
    code: `WITH RECURSIVE spine AS (
    SELECT '2025-03-06 10:00' AS m
    UNION ALL
    SELECT strftime('%Y-%m-%d %H:%M', julianday(m), '+1 minute')
    FROM spine WHERE m < '2025-03-06 10:59'
),
grid AS (
    SELECT s.symbol, sp.m, t.price
    FROM (SELECT DISTINCT symbol FROM Ticks) s
    CROSS JOIN spine sp
    LEFT JOIN Ticks t
        ON t.symbol = s.symbol AND t.priced_at = sp.m
),
missing AS (
    SELECT symbol, m FROM grid WHERE price IS NULL
),
islands AS (
    SELECT symbol,
        (CAST(strftime('%s', m) AS INTEGER)
            - CAST(strftime('%s', '2025-03-06 10:00') AS INTEGER)) / 60
            - ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY m) AS grp
    FROM missing
),
gapmax AS (
    SELECT symbol, MAX(run) AS max_gap
    FROM (SELECT symbol, grp, COUNT(*) AS run FROM islands GROUP BY symbol, grp)
    GROUP BY symbol
),
lasts AS (
    SELECT symbol, price,
        (CAST(strftime('%s', '2025-03-06 10:59') AS INTEGER)
            - CAST(strftime('%s', priced_at) AS INTEGER)) / 60 AS stale
    FROM (
        SELECT symbol, price, priced_at,
            ROW_NUMBER() OVER (PARTITION BY symbol ORDER BY priced_at DESC) AS rn
        FROM Ticks
        WHERE priced_at BETWEEN '2025-03-06 10:00' AND '2025-03-06 10:59'
    )
    WHERE rn = 1
),
counts AS (
    SELECT symbol, COUNT(*) AS tick_count
    FROM Ticks
    WHERE priced_at BETWEEN '2025-03-06 10:00' AND '2025-03-06 10:59'
    GROUP BY symbol
)
SELECT g.symbol,
    l.price AS last_price,
    l.stale AS stale_minutes,
    COALESCE(x.max_gap, 0) AS max_gap,
    c.tick_count
FROM (SELECT DISTINCT symbol FROM Ticks) g
JOIN lasts l ON l.symbol = g.symbol
LEFT JOIN gapmax x ON x.symbol = g.symbol
JOIN counts c ON c.symbol = g.symbol
ORDER BY g.symbol;`,
    walkthrough: [
      "The spine manufactures 60 minutes; the grid holds 4 symbols × 60 = 240 rows, with price NULL exactly on the missing minutes. AAA misses 57 of them (ticks at 10:00, 10:30, 10:55): islands at indices 1–29, 31–54 and the closing 56–59, whose (index − row_number) groups run 29, 24 and 4 long — max_gap 29.",
      "BBB's burst covers indices 0–10; the silence from 10:11 to 10:59 is ONE island of 49 — max_gap 49, equal to its staleness because the hole runs to the window end. CCC misses indices 1–58 (one island of 58) but ticks at 10:59, so its staleness is 0 while its gap is enormous — the two metrics diverge exactly as designed. DDD scatters islands of 5 (10:00–10:04), 14 (10:06–10:19), 24 (10:21–10:44) and a closing 14 (10:46–10:59).",
      "The lasts CTE picks each symbol's latest in-window tick: AAA 10:55 @ 100.5 (stale 4), BBB 10:10 @ 51.25 (49), CCC 10:59 @ 42.25 (0), DDD 10:45 @ 77.0 (14) — the 09:59 decoy never surfaces. Four rows ship in symbol order: AAA · 100.5 · 4 · 29 · 3, BBB · 51.25 · 49 · 49 · 11, CCC · 42.25 · 0 · 58 · 2, DDD · 77.0 · 14 · 24 · 3.",
    ],
    time: "O(s × w) for the grid (symbols × window minutes) plus O(n log n) for the window sorts — the spine is bounded by the fixed 60-minute window",
    space: "O(s × w) — the full symbol-minute grid",
    followUps: [
      "Add a filled_price column that shows the fill-forward value on EVERY grid minute — which window construction (LAST_VALUE emulation) replaces the correlated lookup, and why does SQLite need the MAX-over-prior-rows trick?",
      "Flag symbols whose data is UNUSABLE (stale_minutes > 30 or max_gap > 45) — which seed rows flip, and should the flag read the raw ticks or the filled grid?",
    ],
    related: ["keep-latest-dedupe", "snapshot-delta-detect", "rolling-7d-actives"],
    order: "exact",
    xp: 35,
  },
];
