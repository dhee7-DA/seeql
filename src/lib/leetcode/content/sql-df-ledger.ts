// Deep-dives — Finance Core ledger SQL, the df-ledger file: settlement-fail
// aging, average-cost realized P&L and general-ledger reconciliation
// (3 problems: 2 Medium, 1 Hard, all order:"exact" reads; registry ids
// 8010-8012). Own tables, own seeds, original phrasing — never copied text.
// All money is INTEGER cents throughout.
import type { LcSqlDive } from "../types";

export const SQL_DF_LEDGER: LcSqlDive[] = [
  {
    slug: "settlement-fails-aging",
    statement:
      "The trades table logs one row per execution: (trade_id, symbol, side, qty, price_cents, trade_date, settled), where settled is 1 once the money and shares have actually moved. The desk runs US-style T+2 settlement: a trade is due two CALENDAR days after its trade date — date(trade_date, '+2 day'), with no business-day or holiday logic — and an unsettled trade whose settle date has already passed is a settlement fail. Ops ages every fail by how many days late it is as of the pinned date '2026-10-01' and watches the exposure per aging bucket. Report the columns fail_bucket, fails and fail_value_c — the count of fails and the SUM of qty * price_cents per bucket — as exactly three rows in bucket order '1-3 days', '4-7 days', '8+ days', driven with a CASE rather than alphabetical luck.",
    examples: [
      {
        input: "trade 3 — 25 TSLA bought at 21000c on 2026-09-27, still unsettled — is due date('2026-09-27', '+2 day') = 2026-09-29, two days past due at '2026-10-01'",
        output: "1-3 days · 1 · 525000",
        explanation:
          "late_days = 2 opens the first bucket and the fail carries 25 × 21000 = 525000 cents; the seed plants exactly one fail per bucket, so each row is one trade's full exposure.",
      },
      {
        input: "trade 8 — 12 NFLX bought at 70000c on 2026-09-26 — settled late with settled = 1, and trade 6 — 30 GOOG bought 2026-09-29 — is unsettled but due exactly on 2026-10-01",
        output: "(no row)",
        explanation:
          "trade 8 can never fail while settled = 1, and trade 6 needs settle_date < '2026-10-01' — due today is not yet past due — so neither piece of exposure reaches the report.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: fail_value_c = SUM(qty * price_cents) — no conversion, no rounding",
      "pinned formula: settle_date = date(trade_date, '+2 day') — T+2 CALENDAR days; there is deliberately NO business-day or holiday logic",
      "the as-of date is the fixed literal '2026-10-01'; a fail requires settled = 0 AND settle_date < '2026-10-01' — a trade due exactly on the as-of date is not a fail",
      "columns fail_bucket, fails, fail_value_c; exactly 3 rows in bucket order '1-3 days', '4-7 days', '8+ days' — CASE-driven, not alphabetical",
    ],
    breakdown: [
      "The fail test is a conjunction, and every term earns its place: settled = 0 (a settled trade can never fail, however long ago it came due — trade 8), and settle_date < '2026-10-01' (an unsettled trade not yet due is healthy — trades 6, 7 and 9). The settle date is never stored; it is derived as date(trade_date, '+2 day'), which is the T+2 rule as a one-line formula over trade_date. Reading those two filters against a derived column is the whole selection problem, and everything downstream — aging, bucketing, valuing — operates only on the surviving rows.",
      "The tempting 'improvement' is business-day T+2 — skipping the weekend of 2026-09-26 and 2026-09-27 — because real settlement works that way. The contract pins CALENDAR days, and the seed is built so the readings disagree: trade 4 is dated Thursday 2026-09-24, so calendar math settles it Saturday 2026-09-26 (late 5, '4-7 days') while business-day math settles it Monday 2026-09-28 (late 3, '1-3 days') — the 500000-cent fail would migrate buckets. Trust the pinned formula; the constraint exists precisely because intuition argues. Aging itself must be numeric: julianday() on both ends of the subtraction, because SQLite will not subtract two date strings.",
      "Bucketing maps the integer late_days through a three-branch CASE — BETWEEN 1 AND 3, BETWEEN 4 AND 7, ELSE '8+ days' — and the mapping is total because the fail predicate guarantees late_days >= 1, so no fail can escape its bucket. The ordering contract is chronological bucket order driven by a CASE sort key: on THESE labels a plain alphabetical sort happens to agree ('1' < '4' < '8'), but that is coincidence, not contract — rename the buckets 'early', 'mid' and 'aged' and an alphabetical sort scrambles the report while the CASE key holds. Aggregation is then ordinary: COUNT(*) names the fails and SUM(qty * price_cents) values them, all inside integer arithmetic.",
    ],
    edges: [
      "Trade 8 (12 NFLX at 70000c, traded 2026-09-26, settle date 2026-09-28) is past due but carries settled = 1 — drop the settled = 0 term and it joins '1-3 days' as a phantom 840000-cent fail beside trade 3, with the other settled trades piling in behind it ('1-3 days' reads 3 fails and 3,085,000 cents).",
      "Trades 6, 7 and 9 are unsettled but not yet due; trade 6 settles exactly on '2026-10-01', and loosening the gate to <= (or dropping it) pulls its 510000 cents into '8+ days' with a late_days of 0 — a bucket that should not exist — until '8+ days' reads 4 fails and 1,461,000 cents.",
      "Trade 4 is the planted business-day trap: dated Thursday 2026-09-24, its calendar settle is Saturday 2026-09-26 (late 5, '4-7 days') but a weekend-skipping settle lands Monday 2026-09-28 (late 3) — the 500000 cents would report from the wrong bucket.",
      "Bucket order is CASE-driven chronology, not collation: alphabetical order agrees on today's labels ('1-3 days' < '4-7 days' < '8+ days'), so ORDER BY fail_bucket alone would pass this seed while quietly carrying a landmine for any future rename.",
    ],
    ladder: [
      { title: "Brute force — pile the fails by hand", body: "Walk the ten trades once: derive each settle date, keep the unsettled past-due rows, count their late days, drop each into one of three piles, then total qty × price per pile. Clear and correct — and exactly what two small CTEs mechanize." },
      { title: "The pattern — derive, filter, age, CASE", body: "Derive settle_date with date(trade_date, '+2 day'); keep rows with settled = 0 AND settle_date < '2026-10-01'; age with CAST(julianday('2026-10-01') - julianday(settle_date) AS INTEGER); map late_days through the bucket CASE. GROUP BY the label, then count and sum." },
      { title: "The optimal idea — pin the clock, drive the order", body: "O(n) — one scan plus one grouped pass. The durable rules: derive the T+2 date with date() arithmetic instead of storing it, gate on the pinned as-of literal so the snapshot is reproducible, and drive required row order with a CASE key rather than trusting label collation." },
    ],
    approach: "date(trade_date, '+2 day') settle dates, settled = 0 AND settle_date < as-of, julianday aging into CASE buckets, CASE-driven ORDER BY",
    schema: {
      ddl: `CREATE TABLE trades (
  trade_id    INTEGER PRIMARY KEY,
  symbol      TEXT NOT NULL,
  side        TEXT NOT NULL,    -- 'buy' | 'sell'
  qty         INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  trade_date  TEXT NOT NULL,    -- 'YYYY-MM-DD'
  settled     INTEGER NOT NULL  -- 1 = settled, 0 = open
);`,
      seed: `-- as-of '2026-10-01' · fails: trade 3 (late 2), trade 4 (late 5), trade 5 (late 9)
-- settled rows 1, 2, 8, 10 never fail · not-yet-due rows 6, 7, 9 never fail
INSERT INTO trades (trade_id, symbol, side, qty, price_cents, trade_date, settled) VALUES
  (1,  'AAPL', 'buy',  100, 25000, '2026-09-25', 1),
  (2,  'MSFT', 'sell', 40,  43000, '2026-09-28', 1),
  (3,  'TSLA', 'buy',  25,  21000, '2026-09-27', 0),  -- settle 2026-09-29: fail, 2 days late
  (4,  'NVDA', 'sell', 10,  50000, '2026-09-24', 0),  -- settle 2026-09-26: fail, 5 days late
  (5,  'AMD',  'buy',  200,  1500, '2026-09-20', 0),  -- settle 2026-09-22: fail, 9 days late
  (6,  'GOOG', 'buy',  30,  17000, '2026-09-29', 0),  -- settles exactly ON '2026-10-01': not a fail
  (7,  'META', 'sell', 15,  33000, '2026-10-01', 0),  -- settles 2026-10-03: not yet due
  (8,  'NFLX', 'buy',  12,  70000, '2026-09-26', 1),  -- past due but SETTLED: never a fail
  (9,  'CRM',  'sell', 60,   2600, '2026-09-30', 0),  -- settles 2026-10-02: not yet due
  (10, 'AAPL', 'sell', 80,  24000, '2026-09-23', 1);`,
      tables: [
        { name: "trades", note: "10 executions around '2026-10-01' — 4 already settled, 3 unsettled but not yet due, and exactly one open fail at 2, 5 and 9 days late" },
      ],
    },
    code: `WITH settle AS (
    SELECT
        qty,
        price_cents,
        settled,
        date(trade_date, '+2 day') AS settle_date    -- T+2 CALENDAR days — no business-day logic
    FROM trades
),
aged AS (
    SELECT
        qty,
        price_cents,
        CAST(julianday('2026-10-01') - julianday(settle_date) AS INTEGER) AS late_days
    FROM settle
    WHERE settled = 0                                -- a settled trade can never fail
      AND settle_date < '2026-10-01'                 -- as-of gate: not yet due is not a fail
)
SELECT
    CASE
        WHEN late_days BETWEEN 1 AND 3 THEN '1-3 days'
        WHEN late_days BETWEEN 4 AND 7 THEN '4-7 days'
        ELSE '8+ days'                               -- fail predicate guarantees late_days >= 1: total map
    END AS fail_bucket,
    COUNT(*) AS fails,
    SUM(qty * price_cents) AS fail_value_c           -- integer cents throughout
FROM aged
GROUP BY fail_bucket
ORDER BY CASE fail_bucket                            -- chronological bucket order, not collation
             WHEN '1-3 days' THEN 1
             WHEN '4-7 days' THEN 2
             ELSE 3
         END;`,
    walkthrough: [
      "The settle CTE derives each trade's settle_date as date(trade_date, '+2 day') — trade 3 lands on '2026-09-29', trade 6 on '2026-10-01', trade 7 on '2026-10-03'. The aged CTE keeps only rows with settled = 0 AND settle_date < '2026-10-01', so trades 1, 2, 8 and 10 (already settled) and trades 6, 7 and 9 (not yet due) all drop. Exactly three rows survive: trades 3, 4 and 5.",
      "Inside aged, late_days = CAST(julianday('2026-10-01') - julianday(settle_date) AS INTEGER) reads 2 for trade 3, 5 for trade 4 and 9 for trade 5. The seed deliberately plants one fail per bucket, and none of the three values sits anywhere near a boundary. The outer CASE maps those three integers to '1-3 days', '4-7 days' and '8+ days' respectively.",
      "GROUP BY fail_bucket folds the three survivors into three one-row groups. COUNT(*) reads 1 in each, and SUM(qty * price_cents) reads 525000, 500000 and 300000. The ORDER BY CASE ships '1-3 days', then '4-7 days', then '8+ days' — bucket chronology, not alphabetical luck.",
    ],
    time: "O(n) — one scan for the derived settle dates plus one filtered, grouped pass",
    space: "O(1) beyond the three bucket groups",
    followUps: [
      "Attach each bucket's share of total fail value — where does the grand total come from (a window over the groups or a scalar subquery), and what should the report do when the fail set is empty?",
      "Break the grain down to per-symbol aging: does the bucket CASE move at all, and which deterministic ORDER BY keeps several symbols inside one bucket readable?",
      "Age against CURRENT_DATE instead of the pinned literal — why does that make the snapshot ungradeable in a sandbox, and what does it teach about reproducible reports?",
    ],
    related: ["npv-queries", "calculate-orders-within-each-interval", "bank-account-summary-ii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "realized-pnl-average-cost",
    statement:
      "The trades table records one row per execution: (trade_id, account_id, symbol, side, qty, price_cents, trade_date, seq), where seq is the unambiguous execution order within each account+symbol — the replay clock, whatever order the rows sit in. The desk values positions by the average-cost method: every buy updates a running average cost (cumulative buy cost divided by cumulative buy qty), while sells leave that average untouched and realize qty × (sell price − average cost before the sell). Report per account+symbol the columns account_id, symbol and realized_pnl_c — the total realized P&L in cents across that account+symbol's sells, rounded ONCE at the end. Order by account_id ascending.",
    examples: [
      {
        input: "account 101 buys 100 AAPL at 1000c then 100 at 1100c — running average 1050c — then sells 80 at 1200c, buys 50 more at 1150c (average 1070c) and sells 60 at 1090c",
        output: "101 · AAPL · 13200",
        explanation:
          "the first sell realizes 80 × (1200 − 1050) = 12000, the second 60 × (1090 − 1070) = 1200; the buys only refreshed the average, and the account's total lands at exactly 13200 — positive.",
      },
      {
        input: "account 102 buys 50 MSFT at 500c, sells 30 at 450c, buys 40 at 400c and sells 25 at 430c — before the second sell the average is 41000c over 90 shares ≈ 455.56c",
        output: "102 · MSFT · -2139",
        explanation:
          "sell one realizes 30 × (450 − 500) = −1500; sell two realizes 25 × (430 − 455.56) ≈ −638.89; the SUM ≈ −2138.89 rounds ONCE at the end to −2139 — a losing account, which is the interesting case.",
      },
    ],
    constraints: [
      "all money is INTEGER cents; avg_cost_before = cum_buy_cost_so_far / cum_buy_qty_so_far with FLOAT division — raw INTEGER division in SQLite truncates",
      "sells never touch the running average: only buy rows feed cum_buy_qty and cum_buy_cost",
      "realized_pnl_c = CAST(ROUND(SUM(per-sell realized)) AS INTEGER) — the ROUND fires ONCE per account+symbol, never per sell",
      "columns account_id, symbol, realized_pnl_c ordered by account_id ASC; seq (not insertion order) is the replay clock within each account+symbol",
    ],
    breakdown: [
      "The problem is a stateful replay: within each (account_id, symbol), walk the trades in seq order carrying two accumulators — cumulative buy qty and cumulative buy cost — and at every sell realize qty × (sell price − average cost so far). Average cost is a buys-only quantity, which is why account 101's two opening buys at 1000 and 1100 settle the average at 1050, and why the later 50-share buy at 1150 lifts it to 1070 before the final sell. Sells spend the average; they never move it. The output grain is account+symbol, so each group's per-sell realizations fold into one summed number — two accounts here, two independent state machines.",
      "The window misstep is trusting that a window value AT a row means BEFORE the row. The default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — it INCLUDES the current row — so cum_buy_cost evaluated at a sell row sums every buy up to and including that seq. That is exactly the buys before the sell, but only because the buys-only CASE makes the current sell contribute zero: the frame's current-row inclusion is neutralized by the row's own zero contribution. Let sells leak into the sums — count their qty or proceeds — and every average after an account's first sale is contaminated by the sale itself; the sells-also-count rewrite reports account 102 at −1438 instead of −2139.",
      "The remaining discipline is numeric and contractual. avg_cost_before needs FLOAT division: SQLite computes 41000 / 90 as 455 on two INTEGERs, silently repricing account 102's second sell, so the query nudges the numerator with * 1.0 before dividing. The rounding contract is round-ONCE-per-group: account 102's raw sum is −1500 − 638.89 = −2138.89, and CAST(ROUND(SUM(realized)) AS INTEGER) lands it on −2139; a per-sell ROUND is a different estimator that happens to agree on this seed, but the policy is pinned to the end-round. The seed's quantities were chosen so no value ever sits on a .5 tie.",
    ],
    edges: [
      "Sells must stay out of the running sums: rewriting the CASEs as plain SUM(qty) and SUM(qty * price_cents) windows prices account 102's sells against sale-contaminated averages and reports −1438 instead of −2139 — the default frame includes the current row, and only a zero contribution makes that safe.",
      "Account 102's trailing buy (trade 10, 20 MSFT at 470c on seq 100) lifts the running average to 50400 over 110 ≈ 458.18 and realizes nothing; forget WHERE side = 'sell' and buys start booking phantom realizations — account 101's second buy alone books +5000, and the totals collapse to 22200 and −4125.",
      "A sell before any buy would divide by zero, because cum_buy_qty would be 0 at that row; the seed guarantees each account's earliest row is a buy (account 101's seq 10, account 102's seq 20), and the edge stays named-not-handled.",
      "The seed inserts rows out of seq order (trade 9, seq 90, is the second row in the file while trade 3, seq 30, is seventh) — replaying by insertion order or rowid scrambles every accumulator, and duplicate seq values within a partition would smuggle peer rows into the RANGE frame.",
    ],
    ladder: [
      { title: "Brute force — replay in application code", body: "Pull one account+symbol's rows sorted by seq into application code and walk them with two running totals, pricing every sell against the live average. The engine expresses the identical replay as two windowed sums, a filter and a grouped fold." },
      { title: "The pattern — buys-only windowed accumulators", body: "Two SUM(CASE WHEN side = 'buy' ...) OVER (PARTITION BY account_id, symbol ORDER BY seq) columns carry cum_buy_qty and cum_buy_cost; a sell-only projection prices each sale as qty * price_cents − qty * (cum_buy_cost * 1.0 / cum_buy_qty). GROUP BY account_id, symbol with one final ROUND finishes each group." },
      { title: "The optimal idea — zero-contribution rows neutralize the frame", body: "O(n log n) for the window sort, with O(n) rows held. The durable rules: sells realize, buys average; a default-frame window that includes the current row is safe exactly when the current row contributes zero; force float division before dividing INTEGER accumulators; round once at the group boundary, never per row." },
    ],
    approach: "two buys-only SUM() OVER (PARTITION BY account_id, symbol ORDER BY seq) accumulators, sell-only realized projection on the float average, one CAST(ROUND(SUM)) per group",
    schema: {
      ddl: `CREATE TABLE trades (
  trade_id    INTEGER PRIMARY KEY,
  account_id  INTEGER NOT NULL,
  symbol      TEXT NOT NULL,
  side        TEXT NOT NULL,    -- 'buy' | 'sell'
  qty         INTEGER NOT NULL,
  price_cents INTEGER NOT NULL,
  trade_date  TEXT NOT NULL,    -- 'YYYY-MM-DD'
  seq         INTEGER NOT NULL  -- execution order WITHIN account+symbol: the replay clock
);`,
      seed: `-- account 101 wins (13200) · account 102 loses (-2139 after one end-round)
-- rows are INSERTED out of seq order on purpose: seq is the clock
INSERT INTO trades (trade_id, account_id, symbol, side, qty, price_cents, trade_date, seq) VALUES
  (2,  102, 'MSFT', 'buy',  50,  500,  '2026-09-02', 20),
  (9,  101, 'AAPL', 'sell', 60,  1090, '2026-09-15', 90),
  (1,  101, 'AAPL', 'buy',  100, 1000, '2026-09-02', 10),
  (6,  102, 'MSFT', 'buy',  40,  400,  '2026-09-09', 60),
  (5,  101, 'AAPL', 'sell', 80,  1200, '2026-09-08', 50),
  (10, 102, 'MSFT', 'buy',  20,  470,  '2026-09-16', 100),  -- trailing buy: moves the average, realizes nothing
  (3,  101, 'AAPL', 'buy',  100, 1100, '2026-09-04', 30),
  (8,  102, 'MSFT', 'sell', 25,  430,  '2026-09-12', 80),
  (4,  102, 'MSFT', 'sell', 30,  450,  '2026-09-05', 40),
  (7,  101, 'AAPL', 'buy',  50,  1150, '2026-09-11', 70);`,
      tables: [
        { name: "trades", note: "10 executions — accounts 101 (AAPL) and 102 (MSFT), 5 rows each with buys and sells interleaved; seq steps by 10 and insertion order is shuffled" },
      ],
    },
    code: `WITH flow AS (
    SELECT
        account_id,
        symbol,
        side,
        qty,
        price_cents,
        SUM(CASE WHEN side = 'buy' THEN qty ELSE 0 END) OVER (
            PARTITION BY account_id, symbol ORDER BY seq
        ) AS cum_buy_qty,                    -- buys only: sells NEVER move the average
        SUM(CASE WHEN side = 'buy' THEN qty * price_cents ELSE 0 END) OVER (
            PARTITION BY account_id, symbol ORDER BY seq
        ) AS cum_buy_cost                    -- default frame includes this row: safe because sells add 0
    FROM trades
),
realized AS (
    SELECT
        account_id,
        symbol,
        qty * price_cents
            - qty * (cum_buy_cost * 1.0 / cum_buy_qty) AS realized
                                          -- avg cost BEFORE the sell, with * 1.0 forcing float division
    FROM flow
    WHERE side = 'sell'
)
SELECT
    account_id,
    symbol,
    CAST(ROUND(SUM(realized)) AS INTEGER) AS realized_pnl_c   -- round ONCE, per account+symbol
FROM realized
GROUP BY account_id, symbol
ORDER BY account_id ASC;`,
    walkthrough: [
      "The flow CTE replays each (account_id, symbol) partition in seq order, and the two buys-only CASE sums build cum_buy_qty and cum_buy_cost. At account 101's first sell (seq 50) the window reads 200 and 210000 — exactly the two buys at 1000 and 1100 — because the sell row itself contributes zero to both sums. Account 102's window reads 50 and 25000 at its first sell (seq 40), then 90 and 41000 at its second (seq 80) after the 40-share buy at 400.",
      "The realized CTE keeps sell rows only and prices each sale as qty * price_cents minus qty times the running average, written qty * (cum_buy_cost * 1.0 / cum_buy_qty). The * 1.0 is load-bearing: SQLite divides 41000 / 90 as INTEGERs to 455, which would silently reprice account 102's second sell. Account 101 realizes 80 × (1200 − 1050) = 12000 on its first sell and 60 × (1090 − 1070) = 1200 on its second. Account 102 realizes 30 × (450 − 500) = −1500, then 25 × (430 − 455.56) ≈ −638.89 against the fractional average.",
      "The outer query folds realized with GROUP BY account_id, symbol and rounds once per group. SUM(realized) reads 13200.0 for account 101 and ≈ −2138.89 for account 102, and CAST(ROUND(SUM(realized)) AS INTEGER) pins 13200 and −2139. ORDER BY account_id ASC ships account 101's winning book ahead of account 102's losing one. Account 102's trailing buy (seq 100, 20 shares at 470) never reaches this stage — WHERE side = 'sell' filtered it out after it had already done its job of moving the average.",
    ],
    time: "O(n log n) — the per-partition window sort over n trades dominates",
    space: "O(n) — the windowed flow rows held until the sell filter and the fold",
    followUps: [
      "Add unrealized P&L beside realized: what share position survives all the sells (cumulative buys − cumulative sells), and at which average — the final cum_buy_cost / cum_buy_qty — should it value?",
      "Carry the method across several symbols per account: what changes in the PARTITION BY, and how would a CROSS JOIN of accounts against symbols keep zero-activity pairs on the report?",
      "Switch the desk to FIFO lots: why does average cost collapse to one pair of running accumulators while FIFO needs a lot queue, and what SQL machinery (a recursive CTE?) does the queue demand?",
    ],
    related: ["year-on-year-growth-rate", "customer-purchasing-behavior-analysis", "bank-account-summary-ii"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "gl-reconciliation",
    statement:
      "A ledger's truth lives in two places: the journal table records one row per posting line — (entry_id, account, debit_c, credit_c) — while system_balance holds the sub-ledger's stored (account, balance_c), one row per account. Reconciliation recomputes each account's net straight from the journal — SUM(debit_c) − SUM(credit_c), the debit-positive convention — and stands it against the stored balance. Report only the accounts that disagree: the columns account, ledger_net_c, system_balance_c and delta_c = ledger_net_c − system_balance_c. Order the break queue by ABS(delta_c) descending, then account ascending.",
    examples: [
      {
        input: "accounts_payable posted 9500c out on entry 8 and 1200c back in on entry 9 — net 1200 − 9500 = −8300c — while its sub-ledger row stores −8000c",
        output: "accounts_payable · -8300 · -8000 · -300",
        explanation:
          "ledger net −8300 against stored −8000 gives delta −300: the ledger sits BELOW the sub-ledger by 300 cents, and only mismatched accounts report.",
      },
      {
        input: "cash_main posted debits of 50000 and 7000 against one credit of 12000 — net 45000c — and its sub-ledger row stores 45000c",
        output: "(no row)",
        explanation:
          "delta = 45000 − 45000 = 0: a reconciled account never surfaces, however heavy its activity — the report is a break queue, not a balance list.",
      },
    ],
    constraints: [
      "all money is INTEGER cents; ledger_net_c = SUM(debit_c) − SUM(credit_c) per account — debit-positive, so credit-balance accounts are legitimately negative",
      "delta_c = ledger_net_c − system_balance_c, and only rows with delta_c <> 0 report — integer cents, so <> is an exact test (never an IS NOT comparison)",
      "columns account, ledger_net_c, system_balance_c, delta_c ordered by ABS(delta_c) DESC, then account ASC",
      "every system_balance account has journal activity on this seed — a sub-ledger account with no journal rows would need the reverse join direction and is out of scope",
    ],
    breakdown: [
      "The comparison spans two grains: journal is line-level — ten postings across five accounts — while system_balance is already account-level, so the first move is folding the journal down with GROUP BY account. The fold is signed: SUM(debit_c) − SUM(credit_c), the debit-positive convention, which is why fees_income lands at −32500 and accounts_payable at −8300 rather than as positive credit balances. The folded net joins system_balance on account, and delta_c is one subtraction. The report exists for the exceptions: delta_c <> 0.",
      "The classic missteps are join direction and float paranoia. Joining FROM system_balance — or joining raw journal lines to balances before aggregating — changes which accounts survive when a name exists on one side only: every system_balance account has journal activity here, but a sub-ledger account with no journal rows would vanish silently from a ledger-driven inner join, masking a missing-books break that the reverse direction would surface. The other misstep is dressing the comparison in ROUND or IS NOT: balances are INTEGER cents, so delta_c <> 0 is exact and rounding has nothing to protect. Keep the arithmetic integer and the comparison bare.",
      "The last discipline is a deterministic break queue. ORDER BY ABS(delta_c) DESC works the biggest break first — which is how reconciliation queues are actually consumed — with account ASC as the tie-breaker; this seed keeps the two magnitudes distinct (2000 against 300), so the tie-breaker is insurance rather than load-bearing. The sign survives into the output on purpose: cash_payroll reports +2000 (ledger ABOVE system) and accounts_payable −300 (ledger BELOW), and the two directions usually point at different failure modes — an unposted journal batch versus an unrecorded system entry. Sorting by raw delta_c would run −300 ahead of +2000 and bury the big break behind the small one.",
    ],
    edges: [
      "Both mismatch signs are planted: cash_payroll is ledger 22000 against system 20000 (+2000, ledger ABOVE) while accounts_payable is ledger −8300 against system −8000 (−300, ledger BELOW) — a WHERE delta_c > 0 reports only half the breaks.",
      "cash_main (45000 against 45000), fees_income (−32500 against −32500) and accounts_receivable (15000 against 15000) reconcile exactly; forgetting WHERE delta_c <> 0 ships five rows instead of two, and writing IS NOT instead of <> is the wrong tool for an INTEGER column.",
      "Join direction: the ledger-driven inner join drops any sub-ledger account with no journal rows — the seed guarantees all five journal accounts appear in system_balance, so the direction is safe here, but the missing-books break needs system_balance LEFT JOIN ledger.",
      "The debit-positive convention is the sign of every cell: fees_income's two credits (30000 and 2500) put its net at −32500, and flipping to SUM(credit_c) − SUM(debit_c) turns accounts_payable's −8300 into +8300 and fails every cell of all five rows.",
    ],
    ladder: [
      { title: "Brute force — five hand totals", body: "For each of the five accounts, walk the journal summing debits and credits, subtract, then look the account up in system_balance to compute a delta. Ten lines and five lookups by hand; the engine does it as one GROUP BY and one join." },
      { title: "The pattern — fold, join, subtract, filter", body: "Fold journal to per-account ledger_net_c with SUM(debit_c) − SUM(credit_c); join system_balance on account; derive delta_c and keep WHERE delta_c <> 0. ORDER BY ABS(delta_c) DESC, account ASC finishes the queue." },
      { title: "The optimal idea — signed nets, exact integers, biggest break first", body: "O(j + s) — one grouped scan of the journal plus a join against the balances. The durable rules: compare signed debit-positive nets, filter mismatches with an exact integer <> 0, and sort by ABS(delta) with a name tie-breaker so the queue is reproducible run after run." },
    ],
    approach: "GROUP BY account ledger nets (debit − credit), join system_balance, keep delta <> 0, ORDER BY ABS(delta) DESC then account ASC",
    schema: {
      ddl: `CREATE TABLE journal (
  entry_id  INTEGER PRIMARY KEY,
  account   TEXT NOT NULL,
  debit_c   INTEGER NOT NULL,   -- 0 when the posting is a credit
  credit_c  INTEGER NOT NULL    -- 0 when the posting is a debit
);
CREATE TABLE system_balance (
  account   TEXT NOT NULL,
  balance_c INTEGER NOT NULL    -- the sub-ledger's stored net for the account
);`,
      seed: `-- reconciled: cash_main 45000, fees_income -32500, accounts_receivable 15000
-- breaks: cash_payroll ledger 22000 vs stored 20000 (+2000) ·
-- accounts_payable ledger -8300 vs stored -8000 (-300)
INSERT INTO journal (entry_id, account, debit_c, credit_c) VALUES
  (1,  'cash_main',           50000, 0),
  (2,  'cash_main',           0,     12000),
  (3,  'cash_main',           7000,  0),
  (4,  'fees_income',         0,     30000),
  (5,  'fees_income',         0,     2500),
  (6,  'accounts_receivable', 18000, 0),
  (7,  'accounts_receivable', 0,     3000),
  (8,  'accounts_payable',    0,     9500),
  (9,  'accounts_payable',    1200,  0),
  (10, 'cash_payroll',        22000, 0);
-- the two breaks: accounts_payable stored -8000 (ledger BELOW by 300) · cash_payroll stored 20000 (ledger ABOVE by 2000)
INSERT INTO system_balance (account, balance_c) VALUES
  ('cash_main',           45000),
  ('fees_income',        -32500),
  ('accounts_receivable', 15000),
  ('accounts_payable',    -8000),
  ('cash_payroll',        20000);`,
      tables: [
        { name: "journal", note: "10 posting lines across 5 accounts — debit_c and credit_c in cents, one row per posting" },
        { name: "system_balance", note: "one stored balance per account — 3 match the journal's debit-minus-credit net, 2 drift in opposite directions" },
      ],
    },
    code: `WITH ledger AS (
    SELECT
        account,
        SUM(debit_c) - SUM(credit_c) AS ledger_net_c   -- debit-positive convention
    FROM journal
    GROUP BY account
),
compared AS (
    SELECT
        ledger.account,
        ledger.ledger_net_c,
        s.balance_c AS system_balance_c,
        ledger.ledger_net_c - s.balance_c AS delta_c
    FROM ledger
    JOIN system_balance s
      ON s.account = ledger.account     -- seed: every system account has journal activity
)
SELECT
    account,
    ledger_net_c,
    system_balance_c,
    delta_c
FROM compared
WHERE delta_c <> 0                       -- exact integer test: only breaks report
ORDER BY ABS(delta_c) DESC, account ASC;`,
    walkthrough: [
      "The ledger CTE folds the ten journal lines into five signed nets: cash_main 57000 − 12000 = 45000, fees_income 0 − 32500 = −32500, accounts_receivable 18000 − 3000 = 15000, accounts_payable 1200 − 9500 = −8300 and cash_payroll 22000 − 0 = 22000. Every net is debit-positive by construction. That is why the credit-balance accounts read negative, and why a positive net always means debit-heavy activity.",
      "The compared CTE joins each net to its system_balance row on account and subtracts. Cash_payroll lands at 22000 − 20000 = +2000, accounts_payable at −8300 − (−8000) = −300, and the other three come out at exactly 0. The join runs FROM the ledger sums because the seed guarantees every sub-ledger account has journal activity, so no account is lost in the join.",
      "The outer SELECT keeps only delta_c <> 0, which leaves exactly two rows. ORDER BY ABS(delta_c) DESC, account ASC ships cash_payroll (2000) ahead of accounts_payable (300 in magnitude). The three reconciled accounts never surface, and each surviving delta's sign says which side drifted — positive means the journal leads the sub-ledger, negative means it lags.",
    ],
    time: "O(j + s) — one grouped scan of j journal lines plus a join against s stored balances",
    space: "O(a) — one folded row per account",
    followUps: [
      "Report the reconciled accounts too, labeled with a status column — does the filter move into a CASE, and how does the ORDER BY keep the breaks first and the clean names alphabetical behind them?",
      "Surface the missing-books break: how does the join direction change so a system_balance account with no journal rows still reports, and which aggregate keeps its ledger_net_c at 0 instead of losing the row?",
      "Produce a suspense view of journal accounts missing from system_balance — what does a NOT EXISTS over the same two tables catch that the equality join cannot?",
    ],
    related: ["bank-account-summary-ii", "npv-queries", "calculate-product-final-price"],
    order: "exact",
    xp: 20,
  },
];
