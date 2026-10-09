// Deep-dives — Data & Finance markets file A: FX exposure, HHI concentration
// and daily-balance interest accrual (3 problems: 2 Medium, 1 Hard, all
// order:"exact"). Money is INTEGER minor units; rates/pcts are REAL. Original
// finance phrasing — never copied problem text; dates are fixed literals so
// the snapshot is stable.
// Registry wiring (lead): 8019 fx-exposure-report ·
// 8020 portfolio-concentration-hhi · 8021 daily-balance-interest.
import type { LcSqlDive } from "../types";

export const SQL_DF_MARKETS_A: LcSqlDive[] = [
  {
    slug: "fx-exposure-report",
    statement:
      "The accounts table holds the firm's cash book — one row per account with account_name, its native currency and balance_minor, the balance counted in MINOR units (cents) of that currency. The fx_rates table keeps a dated conversion grid: usd_per_unit is USD per ONE major unit, so 1.1720 means 1 EUR = 1.1720 USD. Because balance_minor already counts cents of its own currency, balance_minor * usd_per_unit lands directly in USD cents — no dividing by 100 anywhere. Revalue every account as of the fixed date '2026-10-01', using for each currency the LATEST rate whose rate_date is on or before that day, and report the columns account_id, account_name, currency, balance_minor and usd_value_cents. Order by usd_value_cents descending, then account_id ascending.",
    examples: [
      {
        input:
          "account 1 — Frankfurt Operating, EUR, balance_minor 250000, revalued as of '2026-10-01'",
        output: "1 · Frankfurt Operating · EUR · 250000 · 293000",
        explanation:
          "EUR's latest rate on or before the as-of is 2026-09-28 at 1.1720 (the 2026-09-01 row at 1.1640 is stale and the 2026-10-05 row at 1.1810 is future), and 250000 * 1.1720 = 293000 USD cents straight from the minor-unit multiply.",
      },
      {
        input:
          "account 2 — London Trading, GBP, balance_minor 89000; GBP's only rate row is 2026-08-15 at 1.3410",
        output: "2 · London Trading · GBP · 89000 · 119349",
        explanation:
          "Latest-per-currency, not latest-global: 2026-08-15 is the newest GBP row the table owns, so it drives — 89000 * 1.3410 = 119349 USD cents, while a join keyed to the global latest date would leave GBP unmatched entirely.",
      },
    ],
    constraints: [
      "money scale is one step by contract: usd_value_cents = CAST(ROUND(balance_minor * usd_per_unit) AS INTEGER) — balance_minor is minor units of the native currency, usd_per_unit is USD per one major unit, so the product is ALREADY USD cents and no /100 or *100 appears anywhere",
      "the as-of date is the fixed literal '2026-10-01' written into the SQL; per currency, the driving rate is the row with the LATEST rate_date that is <= '2026-10-01' — future-dated rows and older rows never touch the arithmetic",
      "one row per account with exactly the five columns account_id, account_name, currency, balance_minor, usd_value_cents; usd_value_cents is an INTEGER",
      "ORDER BY usd_value_cents DESC, account_id ASC — a computed-column sort on the converted figure",
    ],
    breakdown: [
      "The report is a point-in-time translation: every native-currency balance becomes USD as the world looked on '2026-10-01', and the problem splits into two halves — choose the right rate row per currency, then multiply. The choice half is a latest-<=-date selection: EUR shows three dated rows (2026-09-01 at 1.1640, 2026-09-28 at 1.1720 and a future 2026-10-05 at 1.1810), and only the 1.1720 row may drive, because it is the newest one the as-of can see. The multiply half is pure scale bookkeeping: balance_minor counts cents of its own currency and usd_per_unit prices one whole unit in USD, so the product is USD cents in one step — 250000 EUR cents times 1.1720 reads 293000 USD cents with no /100 on either side. Scale slips here are silent killers: a two-step divide-by-100-then-times-100 dance truncates 43750 to 437 under integer division and misprices the Paris account by 59 cents.",
      "The rate selection is where the traps live. Drop the rate_date <= '2026-10-01' gate and the future 2026-10-05 row wins EUR, revaluing Frankfurt at 1.1810 instead of 1.1720 — 295250 instead of 293000. Flip the ranking to MIN(rate_date) and the stale 1.1640 row drives instead, reading 291000. A join that forgets the currency equality fans the book out: every account pairs with every as-of-valid rate row, 5 accounts times 5 surviving rates, 25 rows instead of 5, with EUR balances multiplied by GBP and CAD prices. GBP stresses the semantics from the other side — its only row is 2026-08-15 at 1.3410, old but still the latest GBP fact the table owns: latest-per-currency, never latest-global.",
      "The engine separates the two halves cleanly. A rates CTE gates fx_rates to rate_date <= '2026-10-01' and ranks each currency's surviving rows by rate_date DESC with ROW_NUMBER, keeping rn = 1 — the per-currency latest. The outer query joins accounts to that CTE on currency and computes usd_value_cents = CAST(ROUND(balance_minor * usd_per_unit) AS INTEGER) in one expression, so the ROUND fires once on the finished product and the CAST makes every cell an integer. The final ORDER BY sorts on the computed column itself — usd_value_cents DESC, account_id ASC — a computed-column sort that needs no intermediate table.",
    ],
    edges: [
      "The as-of gate is the whole defense against the future: EUR's 2026-10-05 row at 1.1810 sits in the table and is real, and dropping the gate revalues Frankfurt at 295250 and Paris at 51669 instead of 293000 and 51275.",
      "MIN(rate_date) is the opposite poison: it picks EUR's 2026-09-01 row at 1.1640 and reads 291000 for Frankfurt and 50925 for Paris — the ranking must be rate_date DESC among the rows the gate lets through.",
      "GBP's only rate is 2026-08-15 at 1.3410 — old, singular, and still the driving rate; a join keyed to the GLOBAL latest date (2026-09-30, a CAD row) matches nothing but Toronto and ships a 1-row report.",
      "A join without the currency equality is a cross join in disguise: 5 accounts against the 5 gate-surviving rate rows yields 25 rows, each EUR account multiplied by every currency's price.",
      "The scale is one step by contract: the two-step integer-division variant (balance_minor / 100) * rate * 100 truncates Paris's 43750 to 437 and reads 51216 instead of 51275 — the ROUND belongs on the one-step product.",
    ],
    ladder: [
      { title: "Brute force — pick rates by hand", body: "Open the rate table, eyeball each currency's newest on-or-before rate, multiply every balance on a calculator and sort the results. Correct for five accounts, hopeless for a revaluation run over thousands — and it never says how to express latest-per-key in SQL." },
      { title: "The pattern — gate, rank, then join", body: "A rates CTE filters rate_date <= '2026-10-01' and ROW_NUMBERs each currency by rate_date DESC; rn = 1 is the driving rate. Join accounts to it on currency and the arithmetic is a one-line multiply." },
      { title: "The optimal idea — the as-of join", body: "Every point-in-time report is a latest-<=-date selection BEFORE any arithmetic: revaluations, price books, credit curves and slowly-changing-dimension lookups are all this one shape. O(A + R log R) — a sort over the rate rows dominates, the join and multiply are linear." },
    ],
    approach:
      "per-currency latest-rate CTE (as-of gate + ROW_NUMBER by rate_date DESC), join on currency, one-step CAST(ROUND(balance_minor * usd_per_unit) AS INTEGER), sorted by the computed USD column",
    schema: {
      ddl: `CREATE TABLE accounts (
  account_id    INTEGER PRIMARY KEY,
  account_name  TEXT NOT NULL,
  currency      TEXT NOT NULL,
  balance_minor INTEGER NOT NULL   -- minor units (cents) of the NATIVE currency
);
CREATE TABLE fx_rates (
  currency     TEXT NOT NULL,
  rate_date    TEXT NOT NULL,      -- 'YYYY-MM-DD'
  usd_per_unit REAL NOT NULL,      -- USD per ONE major unit (1.1720 = 1 EUR buys 1.1720 USD)
  PRIMARY KEY (currency, rate_date)
);`,
      seed: `-- 5 accounts, one per market desk · balances in native MINOR units ·
-- fx_rates plants three traps: EUR has a stale 09-01 row (1.1640), the
-- driving 09-28 row (1.1720) AND a future 10-05 row (1.1810) the as-of
-- gate must exclude · GBP's only row is old (2026-08-15 at 1.3410) and
-- still drives · Paris at 43750 is not a round hundred, so the two-step
-- /100 scale slip truncates it
INSERT INTO accounts (account_id, account_name, currency, balance_minor) VALUES
  (1, 'Frankfurt Operating', 'EUR', 250000),
  (2, 'London Trading',      'GBP',  89000),
  (3, 'Toronto Payroll',     'CAD', 500000),
  (4, 'NY Treasury',         'USD', 125000),
  (5, 'Paris Marketing',     'EUR',  43750);
INSERT INTO fx_rates (currency, rate_date, usd_per_unit) VALUES
  ('EUR', '2026-09-01', 1.1640),  -- stale
  ('EUR', '2026-09-28', 1.1720),  -- drives the EUR rows
  ('EUR', '2026-10-05', 1.1810),  -- FUTURE: the as-of gate must exclude it
  ('GBP', '2026-08-15', 1.3410),  -- old but GBP's only row: still drives
  ('CAD', '2026-09-30', 0.7240),
  ('USD', '2026-01-01', 1.0);`,
      tables: [
        { name: "accounts", note: "5 accounts across EUR, GBP, CAD and USD — balances in minor units of the native currency, from 43750 (Paris) up to 500000 (Toronto)" },
        { name: "fx_rates", note: "6 dated rows — EUR carries a stale 09-01 rate, the driving 09-28 rate and a FUTURE 10-05 rate; GBP's only row is old (2026-08-15); CAD and USD carry one row each" },
      ],
    },
    code: `WITH latest_rates AS (
    -- the driving rate per currency: the newest row the as-of can see.
    -- EUR must pick 2026-09-28 at 1.1720 -- not the stale 09-01 row and
    -- not the future 2026-10-05 row the gate throws out
    SELECT
        currency,
        rate_date,
        usd_per_unit,
        ROW_NUMBER() OVER (
            PARTITION BY currency
            ORDER BY rate_date DESC
        ) AS rn
    FROM fx_rates
    WHERE rate_date <= '2026-10-01'             -- the fixed as-of literal
)
SELECT
    a.account_id,
    a.account_name,
    a.currency,
    a.balance_minor,
    CAST(ROUND(a.balance_minor * r.usd_per_unit) AS INTEGER) AS usd_value_cents
    -- minor units * USD-per-unit = USD cents in ONE step, no /100 anywhere
FROM accounts a
JOIN latest_rates r
    ON r.currency = a.currency
   AND r.rn = 1                                 -- the per-currency latest
-- a computed-column sort on the converted figure
ORDER BY usd_value_cents DESC, account_id ASC;`,
    walkthrough: [
      "The rates CTE sees five rows after the gate: EUR's 2026-09-01 (1.1640) and 2026-09-28 (1.1720), GBP's lone 2026-08-15 (1.3410), CAD's 2026-09-30 (0.7240) and USD's 2026-01-01 (1.0). The future 2026-10-05 EUR row at 1.1810 never enters — the gate is a WHERE on rate_date applied before the ranking, so it cannot win even though it is the newest EUR row in the table. ROW_NUMBER then orders each currency's survivors newest-first, and rn = 1 keeps exactly one row per currency: 2026-09-28 for EUR, 2026-08-15 for GBP, 2026-09-30 for CAD and 2026-01-01 for USD.",
      "The join hands each account its currency's driving rate and the multiply runs in one step: Toronto's 500000 CAD cents times 0.7240 reads 362000, Frankfurt's 250000 EUR cents times 1.1720 reads 293000, NY Treasury's 125000 USD cents times 1.0 reads 125000, London's 89000 GBP cents times 1.3410 reads 119349, and Paris's 43750 EUR cents times 1.1720 reads 51275. ROUND rounds the finished product to the nearest cent and the CAST makes it an integer — the float dust just under 119349 never survives to the output. Five accounts in, five rows out: the join adds no rows because latest_rates holds exactly one row per currency.",
      "The final SELECT orders by the computed column: usd_value_cents DESC stacks Toronto (362000) over Frankfurt (293000), then NY Treasury (125000), London (119349) and Paris (51275), with account_id ASC as the tie-breaker this seed never triggers — every converted figure is distinct. The output is five rows of five columns, all money cells INTEGER. EUR appears twice at the same 1.1720 rate with different exposures — 293000 against 51275 — which is exactly the shape a treasury desk reads off such a report.",
    ],
    time: "O(A + R log R) — the rate CTE sorts the R surviving rate rows for the window ranking; the join probes once per account",
    space: "O(A + C) — one driving-rate row per currency (four here) plus the five-row report",
    followUps: [
      "Roll the exposure up per currency — which GROUP BY sums usd_value_cents into a per-currency USD figure, and what does the EUR line read once Frankfurt and Paris merge?",
      "A currency with NO rate row on or before the as-of: should the report LEFT JOIN and stamp 0, or fail loudly? Which join change lets a missing-rate account survive, and what does COALESCE owe it?",
      "Time-travel the report: re-run the same query as of '2026-09-15' — which EUR rate drives then, and how far does the Frankfurt line move?",
    ],
    related: ["calculate-product-final-price", "gl-reconciliation", "portfolio-weights"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "portfolio-concentration-hhi",
    statement:
      "The positions table holds one row per symbol inside a portfolio: (portfolio_id, symbol, market_value_cents). Concentration asks how top-heavy each portfolio is, and the standard instrument is the Herfindahl-Hirschman Index: express every position as a PERCENT weight of its own portfolio, square the weights, and sum the squares on the 0-10000 scale. Report one row per portfolio with the columns portfolio_id, positions, largest_pct, hhi and concentration, where hhi above 2500 reads 'concentrated', 1500 through 2500 reads 'moderate', and anything below reads 'diversified'. The thresholds are the antitrust ones — strict above 2500, inclusive at 1500 — so a portfolio landing exactly on 2500 is moderate, not concentrated. Order by portfolio_id ascending.",
    examples: [
      {
        input:
          "portfolio 1 — AAPL 500000, MSFT 250000, NVDA 150000, TSLA 100000 cents against a 1000000-cent book",
        output: "1 · 4 · 50.0 · 3450 · concentrated",
        explanation:
          "Weights read 50/25/15/10 percent exactly, the squares sum to 2500 + 625 + 225 + 100 = 3450, and 3450 clears the strict 2500 line.",
      },
      {
        input:
          "portfolio 2 — XOM, JNJ, PG and KO each at 250000 cents (four equal weights over the same 1000000-cent book)",
        output: "2 · 4 · 25.0 · 2500 · moderate",
        explanation:
          "4 × 25 squared = 2500 exactly ON the boundary — the strict > keeps it moderate; reading >= 2500 would mislabel it concentrated while every other cell stays identical.",
      },
    ],
    constraints: [
      "hhi = CAST(ROUND(SUM(w * w)) AS INTEGER) with w = 100.0 * market_value_cents / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) — weights in PERCENT, squared, summed on the 0-10000 scale (the 0-1 fractional scale reads 10000 times smaller)",
      "largest_pct = ROUND(100.0 * MAX(market_value_cents) / SUM(market_value_cents), 1) — the largest position's share of its OWN portfolio, a 1-decimal REAL",
      "concentration pins the antitrust thresholds: hhi > 2500 → 'concentrated' (strict), hhi >= 1500 → 'moderate' (inclusive), else 'diversified' — 2500 exactly is moderate",
      "one row per portfolio with positions = COUNT(*), ORDER BY portfolio_id ASC",
    ],
    breakdown: [
      "HHI is the antitrust and portfolio-theory standard for concentration, and in SQL it is the portfolio-weights machinery with a square bolted on: the same window-share denominator attaches each position's percent weight to its own row, and the new step sums the squares. Portfolio 1's weights read 50, 25, 15 and 10 percent, and 50 squared + 25 squared + 15 squared + 10 squared = 2500 + 625 + 225 + 100 = 3450 — a book worth about 2.9 effective positions (10000 / 3450) spread over four real ones. Portfolio 2's four equal weights each square to 625 and land the sum on exactly 2500, the boundary itself. The square is the point: it penalizes size super-linearly, so a 50 percent whale contributes 2500 alone while a 10 percent minnow contributes 100.",
      "The classic misstep is scale: computing the index on decimal FRACTIONS (0.5 squared + 0.25 squared and so on) yields the 0-1 flavor — portfolio 1 reads about 0.345 instead of 3450, off by exactly the 10000 the percent scale contributes. The second is grouping: writing the weight denominator as SUM(...) OVER () without PARTITION BY portfolio_id divides every position by the 2250000-cent grand total of all three books, collapsing every HHI into the low hundreds and relabeling every portfolio 'diversified'. The third is the boundary itself: a >= 2500 read flips portfolio 2 to 'concentrated' on the strength of an exact tie. And largest_pct has its own denominator trap — dividing the largest position by the whole-table total reads 22.2 for portfolio 1 instead of its true 50.0.",
      "The engine runs two standard motions in sequence. The weights CTE is a projection: 100.0 * market_value_cents / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) stamps each portfolio's book total onto every one of its rows without collapsing anything — the seed's market values are whole multiples of 2500 per percent point, so every weight lands exact and no float noise reaches the squares. The scored CTE then groups by portfolio_id over those rows: COUNT(*) counts positions, MAX(w) reads the largest weight (the same share 100.0 * MAX(market_value_cents) / SUM(market_value_cents) names, since the denominator is constant inside a partition) and SUM(w * w) accumulates the index. The final SELECT rounds and casts — ROUND(largest_w, 1) for the REAL percent, CAST(ROUND(hhi_raw) AS INTEGER) for the integer index — and the CASE reads its thresholds from the top.",
    ],
    edges: [
      "Portfolio 2 is the boundary made flesh: 4 × 625 = 2500 exactly, and the strict > keeps it 'moderate' — writing >= 2500 for the top band flips the label while every other number stays identical.",
      "The 0-1 scale trap: weights as fractions read about 0.345, 0.25 and 0.1364 for the three portfolios — the contract's 0-10000 scale is 10000 times larger, and no ROUND hides the difference.",
      "SUM(...) OVER () with no PARTITION BY divides by the 2250000-cent grand total: portfolio 1's HHI collapses to 681, portfolio 2's to 494 and portfolio 3's to 17, and all three portfolios relabel 'diversified'.",
      "largest_pct must divide by the portfolio's own book: against the whole-table total it reads 22.2, 11.1 and 2.2 instead of 50.0, 25.0 and 20.0 — same numerator, wrong denominator.",
      "The seed is exact on purpose — every market value is its percent point times 2500, so weights, squares and sums carry zero float noise; a messier book needs the identical machinery with noisier digits, which is why the ROUND and CAST sit exactly where the contract pins them.",
    ],
    ladder: [
      { title: "Brute force — one book, one pencil", body: "Divide each position by its book total, square by hand, add, and compare the sum against 2500. Three portfolios are tractable; the method dies at scale and never says how to keep per-symbol rows alive while the total is computed." },
      { title: "The pattern — window share, then grouped score", body: "Compute w = 100.0 * market_value_cents / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) — the portfolio-weights shape — then GROUP BY portfolio_id for COUNT, MAX(w) and SUM(w * w). Two motions, each the standard one." },
      { title: "The optimal idea — share, square, sum", body: "O(n log n) over n positions: one window sort for the shares and one group sort for the scores. The durable reading: an index is a projection followed by an aggregation, and 10000 / hhi — the effective number of positions — is the one-number summary the index was built for." },
    ],
    approach:
      "window percent-share per position (PARTITION BY portfolio_id), then GROUP BY portfolio for COUNT, MAX(w) and SUM(w*w), CAST(ROUND()) to the 0-10000 integer and a CASE against the 2500/1500 thresholds",
    schema: {
      ddl: `CREATE TABLE positions (
  portfolio_id       INTEGER NOT NULL,
  symbol             TEXT NOT NULL,
  market_value_cents INTEGER NOT NULL,
  PRIMARY KEY (portfolio_id, symbol)
);`,
      seed: `-- weights are EXACT percents by construction: market_value_cents is the
-- percent point times 2500 (P1 and P2 books total 1000000, P3 totals 250000)
-- P1 50/25/15/10 → hhi 2500+625+225+100 = 3450 · P2 four equal 25s → 2500,
-- exactly ON the strict line · P3 20/15/14/13/12/10/9/7 → hhi 1364
INSERT INTO positions (portfolio_id, symbol, market_value_cents) VALUES
  (1, 'AAPL', 500000),
  (1, 'MSFT', 250000),
  (1, 'NVDA', 150000),
  (1, 'TSLA', 100000),
  (2, 'XOM',  250000),
  (2, 'JNJ',  250000),
  (2, 'PG',   250000),
  (2, 'KO',   250000),
  (3, 'AAPL', 50000),
  (3, 'MSFT', 37500),
  (3, 'NVDA', 35000),
  (3, 'AVGO', 32500),
  (3, 'META', 30000),
  (3, 'AMD',  25000),
  (3, 'NFLX', 22500),
  (3, 'INTC', 17500);`,
      tables: [
        { name: "positions", note: "16 rows over 3 portfolios — P1 splits 50/25/15/10, P2 is four equal 250000s, P3 spreads eight names from 20 down to 7 percent" },
      ],
    },
    code: `WITH weights AS (
    -- each position's percent weight of its OWN portfolio (0-100 scale):
    -- the window denominator rides every row, nothing collapses
    SELECT
        portfolio_id,
        100.0 * market_value_cents
            / SUM(market_value_cents) OVER (PARTITION BY portfolio_id) AS w
    FROM positions
),
scored AS (
    -- one row per portfolio: count, largest share, sum of squared shares
    SELECT
        portfolio_id,
        COUNT(*) AS positions,
        MAX(w) AS largest_w,
        SUM(w * w) AS hhi_raw
    FROM weights
    GROUP BY portfolio_id
)
SELECT
    portfolio_id,
    positions,
    ROUND(largest_w, 1) AS largest_pct,
    CAST(ROUND(hhi_raw) AS INTEGER) AS hhi,
    CASE
        WHEN hhi_raw > 2500 THEN 'concentrated'   -- strict: 2500 exactly is moderate
        WHEN hhi_raw >= 1500 THEN 'moderate'      -- inclusive lower band
        ELSE 'diversified'
    END AS concentration
FROM scored
ORDER BY portfolio_id ASC;`,
    walkthrough: [
      "The weights CTE stamps each portfolio's book total onto its rows: portfolio 1's book is 1000000 cents, so its weights read 100.0 * 500000 / 1000000 = 50.0, then 25.0, 15.0 and 10.0; portfolio 2's four 250000-cent positions each read 25.0 against the same 1000000 total; portfolio 3's book is 250000 cents and its eight weights read 20.0, 15.0, 14.0, 13.0, 12.0, 10.0, 9.0 and 7.0. Every value is an exact percent because every market value is its percent point times 2500 — the seed was built that way. Sixteen rows in, sixteen rows out: the window added a column, not a collapse.",
      "The scored CTE folds each portfolio to one row: portfolio 1 counts 4 positions, keeps MAX(w) = 50.0 and sums the squares 2500 + 625 + 225 + 100 = 3450.0; portfolio 2 counts 4, MAX 25.0, squares 625 four times over for 2500.0; portfolio 3 counts 8, MAX 20.0, squares 400 + 225 + 196 + 169 + 144 + 100 + 81 + 49 = 1364.0. The CASE then reads from the top: 3450.0 clears the strict 2500 line into 'concentrated', 2500.0 fails the strict test but clears the inclusive 1500 into 'moderate', and 1364.0 falls through to 'diversified'. CAST(ROUND(...)) turns each float sum into the contract's integer index — 3450, 2500 and 1364.",
      "largest_pct rounds the kept maximum to one decimal — 50.0, 25.0 and 20.0, the same figures 100.0 * MAX(market_value_cents) / SUM(market_value_cents) would name, because the denominator is constant inside each partition. ORDER BY portfolio_id ASC ships the three rows in contract order. The report reads the way a risk desk wants it: one whale book flagged concentrated, one perfectly equal book sitting exactly on the moderate line, and one eight-name spread that is genuinely diversified.",
    ],
    time: "O(n log n) over the n positions — one sort for the window partition plus the GROUP BY fold",
    space: "O(n) — the weight rows held until the scored fold",
    followUps: [
      "Add the effective-number read-out: 10000 / hhi per portfolio — what does each book's effective position count come to, and which seeded book lands nearest a whole number of effective positions?",
      "Rank the symbols inside the most concentrated book by share — which ORDER BY over the weights CTE lists portfolio 1's four names biggest-first, and where does the cumulative share cross 75?",
      "Time-series HHI: given a dated positions snapshot, how would the weights CTE extend so each date scores independently, and which PARTITION BY grows by one column?",
    ],
    related: ["portfolio-weights", "realized-pnl-average-cost", "delinquency-buckets"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "daily-balance-interest",
    statement:
      "The ledger table logs cash movements — (account_id, txn_date, amount_cents), deposits positive and withdrawals negative — and every account's opening balance on 2026-09-01, before any transaction, is 0. Interest accrues DAILY across September 2026 on each day's END-OF-DAY balance: EOD of a day is the sum of every amount with txn_date on or before that day, so same-day transactions all land in one EOD however they interleave. Each day earns EOD_cents * apy_pct / 100.0 / 365 under the 365-day convention with no daily rounding, and the month's interest_cents is that daily stream summed over the 30 days from 2026-09-01 through 2026-09-30 and rounded ONCE at the end. Report account_id, apy_pct, interest_cents and end_balance_cents (the EOD on 2026-09-30), ordered by account_id ascending.",
    examples: [
      {
        input:
          "account 1 at 4.0 percent APY — 200000 cents in on 2026-09-01, 50000 out on 2026-09-15, 30000 in on 2026-09-20",
        output: "1 · 4.0 · 606 · 180000",
        explanation:
          "EOD holds 200000 for 14 days, 150000 for 5 and 180000 for 11 — 5530000 cent-days times 4.0 / 100 / 365 = 606.03, rounded once to 606; the end balance is 180000.",
      },
      {
        input:
          "account 2 at 3.5 percent — 80000 in on 09-05, then +120000 AND -120000 both on 09-10, 20000 out on 09-25",
        output: "2 · 3.5 · 188 · 60000",
        explanation:
          "The same-day pair nets to a 0 day and the EOD stays 80000 through 09-24 — 1960000 cent-days times 3.5 / 100 / 365 = 187.95, rounded once to 188; a per-txn read would book the 200000 interim balance and double-count the pair.",
      },
    ],
    constraints: [
      "every account opens 2026-09-01 at 0 before any txn (no seed row writes it — the accrual owns the zero); EOD(d) = SUM(amount_cents) over txn_date <= d with ALL same-day txns included — order within a day is irrelevant",
      "daily_interest = EOD_cents * apy_pct / 100.0 / 365 — the 365-day convention, NO daily rounding; interest_cents = CAST(ROUND(SUM(daily_interest) over the 30 days 2026-09-01 through 2026-09-30) AS INTEGER), the only rounding, applied once at the end",
      "every account crossed with every calendar day of September 2026 must exist — 30 account-days each — with no-activity days carrying the prior EOD (a 0 balance earns 0, and the carry is the point)",
      "end_balance_cents is the 2026-09-30 EOD (the sum of ALL the account's amounts), ORDER BY account_id ASC",
    ],
    breakdown: [
      "The ledger is event data — rows exist only where money moved — but accrual is state over time: every one of September's 30 days owes interest on the balance it ends with, including the days nothing happened. That gap is the whole problem: account 3 transacts once (150000 cents in on 2026-09-15) yet accrues on 16 days, and its first 14 silent days accrue on a 0 balance the ledger never writes down. EOD is defined over ALL txns up to the day — txn_date <= d — so a same-day deposit and withdrawal (account 2's 120000 pair on 09-10) net into a single end-of-day fact and the order inside the day is irrelevant. The unit story: balances are INTEGER cents, apy_pct is a REAL percent, and daily_interest = EOD * apy_pct / 100.0 / 365 stays a float — the ONLY rounding in the contract is the one CAST(ROUND(...)) at the very end.",
      "The missteps all buy time cheaply. Accruing per TRANSACTION instead of per day both drops the silent days and double-counts busy ones — account 2's 09-10 pair accrues on 200000 and then on 80000 where the day owns one 80000 EOD, and the whole month reads 40 instead of 188. Accruing on the OPENING balance (the prior EOD) shifts every day's earnings back a day: account 1's day 1 earns on 0 instead of 200000 and the month reads 586 instead of 606. Rounding daily instead of at the end drifts account 1 to 608, and the 360-day banker's year inflates it to 614. Dropping the calendar spine — accruing only on dates the ledger mentions — collapses account 3 from 329 to 21, because 15 of its 16 earning days exist only as carry.",
      "The engine builds the time it needs. A WITH RECURSIVE days spine walks '2026-09-01' forward one date('+1 day') at a time to '2026-09-30' — 30 rows that exist whether or not money moved. Crossing that spine with accounts and LEFT JOINing the per-day nets (SUM(amount_cents) grouped by account_id and txn_date) under COALESCE 0 gives every account a full 30-day daily-net series, and a running window SUM over it — SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d) — is the EOD walk, carrying balances forward through silent days for free. The final GROUP BY account sums EOD * apy_pct / 100.0 / 365 across the 30 days and rounds once; the same pass sums net_cents for end_balance_cents, which equals the 2026-09-30 EOD by construction.",
    ],
    edges: [
      "Same-day pairs are one EOD fact: account 2's +120000 and -120000 on 09-10 net to 0, the EOD stays 80000, and any per-txn read books an extra 200000-balance day — the pair exists to catch exactly that.",
      "The spine owns the silent days: account 3's 09-01 through 09-14 rows must exist at balance 0 — COALESCE writes the 0 explicitly rather than leaning on the window SUM's NULL-skipping — and dropping the spine drops those days from the accrual entirely.",
      "Rounding fires once: per-day ROUND inflates account 1 to 608, account 2 to 196 and account 3 to 336 — the contract's single end-of-month ROUND is what keeps 606, 188 and 329.",
      "The 365-day denominator is pinned: a 360-day banker's year reads 614, 191 and 333 — about 1.4 percent fatter, the classic convention slip.",
      "end_balance_cents is the 2026-09-30 EOD, not the month's peak: account 2's balance touches 80000 for twenty days but ends at 60000 after the 09-25 withdrawal — a MAX(eod) read would ship 80000 and be wrong.",
    ],
    ladder: [
      { title: "Brute force — a spreadsheet month", body: "Thirty rows per account: write each day's EOD, multiply by APY over 100 over 365, sum the daily column and round once. Three accounts is a napkin exercise; a book of accounts over a year is a spreadsheet nobody trusts." },
      { title: "The pattern — recursive date spine, running balance", body: "The days CTE manufactures September's 30 dates; cross it with accounts, LEFT JOIN the daily nets, and a window SUM ordered by day turns the net stream into the EOD walk. Silent days ride along at COALESCE 0 instead of vanishing." },
      { title: "The optimal idea — a calendar spine turns event data into state data", body: "Accrual is state × rate × time, and the spine owns the time: once every account-day exists, the interest formula is a plain per-row multiply and the total is a plain GROUP BY. O(A × D) — 90 rows here — with the spine reusable for any daily-state problem: interest, overdrafts, limits, stale balances." },
    ],
    approach:
      "recursive September date spine cross-joined to accounts, daily nets LEFT JOINed on with COALESCE 0, a window running SUM as the EOD walk, SUM(EOD * apy_pct / 100.0 / 365) rounded ONCE, net-sum as end balance",
    schema: {
      ddl: `CREATE TABLE accounts (
  account_id INTEGER PRIMARY KEY,
  apy_pct    REAL NOT NULL      -- annual percentage yield, in percent
);
CREATE TABLE ledger (
  account_id   INTEGER NOT NULL,
  txn_date     TEXT NOT NULL,    -- 'YYYY-MM-DD'
  amount_cents INTEGER NOT NULL  -- deposits positive, withdrawals negative
);`,
      seed: `-- A1 walks 200000 → 150000 → 180000 · A2 carries a SAME-DAY +120000/-120000
-- pair on 09-10 (nets to zero EOD impact, breaks per-txn accrual) ·
-- A3 transacts once, so 14 of its 30 days accrue on a carried 0 balance
INSERT INTO accounts (account_id, apy_pct) VALUES
  (1, 4.0),
  (2, 3.5),
  (3, 5.0);
INSERT INTO ledger (account_id, txn_date, amount_cents) VALUES
  (1, '2026-09-01',  200000),
  (1, '2026-09-15',  -50000),
  (1, '2026-09-20',   30000),
  (2, '2026-09-05',   80000),
  (2, '2026-09-10',  120000),  -- same-day pair: in
  (2, '2026-09-10', -120000),  -- same-day pair: out
  (2, '2026-09-25',  -20000),
  (3, '2026-09-15',  150000);`,
      tables: [
        { name: "accounts", note: "3 accounts at 4.0, 3.5 and 5.0 percent APY — opening balances are 0 by contract, never stored" },
        { name: "ledger", note: "8 txns — A1 walks 200000 down to 180000, A2 books an offsetting same-day pair on 09-10, A3 moves once on 09-15" },
      ],
    },
    code: `WITH RECURSIVE days(d) AS (
    -- September 2026, one row per calendar day: the time the ledger lacks
    SELECT '2026-09-01'
    UNION ALL
    SELECT date(d, '+1 day') FROM days WHERE d < '2026-09-30'
),
daily_net AS (
    -- one row per account-day that has activity (same-day txns fold here)
    SELECT account_id, txn_date AS d, SUM(amount_cents) AS net_cents
    FROM ledger
    GROUP BY account_id, txn_date
),
balance_days AS (
    -- spine x accounts: EVERY account exists on ALL 30 days, active or not
    SELECT a.account_id, a.apy_pct, days.d,
        COALESCE(n.net_cents, 0) AS net_cents   -- silent days carry 0 movement
    FROM accounts a
    CROSS JOIN days
    LEFT JOIN daily_net n
        ON n.account_id = a.account_id AND n.d = days.d
),
running AS (
    -- the EOD walk: the running SUM of daily nets carries balances forward
    SELECT
        account_id,
        apy_pct,
        d,
        net_cents,
        SUM(net_cents) OVER (PARTITION BY account_id ORDER BY d) AS eod_cents
    FROM balance_days
)
SELECT
    account_id,
    apy_pct,
    -- 30 daily floats summed, then rounded ONCE: the only rounding
    CAST(ROUND(SUM(eod_cents * apy_pct / 100.0 / 365)) AS INTEGER) AS interest_cents,
    SUM(net_cents) AS end_balance_cents   -- the 09-30 EOD = all nets summed
FROM running
GROUP BY account_id, apy_pct
ORDER BY account_id ASC;`,
    walkthrough: [
      "The spine emits 30 dates and the CROSS JOIN gives each of the 3 accounts a full 90-row month; daily_net contributes just 7 rows — A1's 09-01, 09-15 and 09-20, A2's 09-05, 09-10 (the +120000/-120000 pair already folded into one 0 net) and 09-25, and A3's lone 09-15. COALESCE fills the other 83 account-days with 0 net. That LEFT JOIN is what turns event data into state data: A3's first two weeks are not missing, they simply read 0.",
      "The running window walks the balances: A1 holds 200000 across 09-01 through 09-14 (14 days), 150000 across 09-15 through 09-19 (5 days) and 180000 across 09-20 through 09-30 (11 days) — 5530000 cent-days, times 4.0 / 100 / 365 = 606.03 unrounded, landing on 606 after the one ROUND. A2 accrues on 0 for 4 days, 80000 for 20 days (09-05 through 09-24 — the 09-10 pair day nets 0 and changes nothing) and 60000 for 6 days: 1960000 cent-days times 3.5 / 100 / 365 reads 187.95 → 188. A3's 14 zero days earn exactly 0 and its 16 days at 150000 give 2400000 cent-days times 5.0 / 100 / 365 reads 328.77 → 329.",
      "The final SELECT folds the 30 rows per account: interest_cents = CAST(ROUND(SUM of the 30 daily floats)) lands on 606, 188 and 329, and end_balance_cents = SUM(net_cents) reads 180000, 60000 and 150000 — A2's 60000, not the 80000 peak the balance touched for twenty days. ORDER BY account_id ASC ships (1, 4.0, 606, 180000), (2, 3.5, 188, 60000) and (3, 5.0, 329, 150000). Every money cell is an INTEGER — a single CAST fired after one and only one ROUND.",
    ],
    time: "O(A × D) — the spine builds A accounts × D days (3 × 30 = 90 rows here) and each row is a constant-time window step",
    space: "O(A × D) — the full account-day grid held through the running window",
    followUps: [
      "Compound it: credit each day's interest into the balance at month-end and re-run — which piece of the pipeline changes first, and how many output cells move?",
      "Overdrafts at a different rate: negative EODs accrue at apy_pct + 6 instead — what does the daily multiply grow into, and does any seeded day ever go negative?",
      "Leap years: February 2028 has 29 days and the convention says 366 — what does the spine's end literal become, and where does the 365 hard-code hide in your version?",
    ],
    related: ["loan-amortization-schedule", "restaurant-growth", "rolling-average-steps"],
    order: "exact",
    xp: 35,
  },
];
