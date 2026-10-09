// Deep-dives — Quant Desk A file: time-weighted return, Sharpe ratio and
// Value at Risk (3 problems: 1 Hard, 2 Medium; dive 1 order:"exact", dives
// 2-3 single-row order:"any"). Every money column is INTEGER cents with the
// _cents suffix; returns and risk metrics are REAL percentages; own tables,
// own seeds, original phrasing — never copied problem text.
// Each dive carries a primer: the domain concept taught from zero.
// Registry wiring (lead): 8043 time-weighted-return ·
// 8044 sharpe-ratio · 8045 value-at-risk.
import type { LcSqlDive } from "../types";

export const SQL_DF_QUANT_A: LcSqlDive[] = [
  {
    slug: "time-weighted-return",
    statement:
      "A fund balance moves for two reasons: the market, and money clients push in or pull out. The flows table logs the client moves — (flow_id, flow_date, cash_flow_cents), deposits positive and withdrawals negative — and valuations holds (value_date, eod_value_cents) for ten dates in September 2026. Flows land at the START of their date, before that day's market move, so client money sitting inside an end-of-day value is not performance. Time-weighted return strips that money out: it cuts September at the flow dates into three sub-periods and reports each period's own return, the number a fund factsheet prints. Report period_no (1, 2, 3), period_start, period_end, flow_cents (the flow landing on the period's END boundary, 0 when none) and period_return_pct = ROUND(100.0 * r, 4), where r = (V(d1) - F(d1) - V(d0)) / V(d0), ordered by period_no ascending.",
    examples: [
      {
        input:
          "period 1 — the fund opens September at 100000 cents on 2026-09-01; a +10000 deposit lands on the morning of 2026-09-08 and that day closes at 109500 cents",
        output: "1 · 2026-09-01 · 2026-09-08 · 10000 · -0.5",
        explanation:
          "The deposit is client money, not return: the clean end value is 109500 - 10000 = 99500, so r = (99500 - 100000) / 100000 = -0.005 and period_return_pct reads -0.5 — the market actually slipped while the balance grew.",
      },
      {
        input:
          "period 2 — 109500 cents stands on 2026-09-08; a -5000 withdrawal lands on the morning of 2026-09-18 and that day closes at 100000 cents",
        output: "2 · 2026-09-08 · 2026-09-18 · -5000 · -4.1096",
        explanation:
          "A withdrawal is ADDED back before measuring growth: clean end = 100000 + 5000 = 105000, so r = (105000 - 109500) / 109500 = -0.0410958904... and the ROUND lands on -4.1096.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: cash_flow_cents and eod_value_cents are integers; period_return_pct is the only REAL in the output",
      "PINNED convention: flows land at the START of their date (before that day's market move); sub-period boundaries are PINNED — start '2026-09-01' (no flow), flow dates '2026-09-08' and '2026-09-18', end '2026-09-30'",
      "PINNED return: for a sub-period from boundary d0 to boundary d1, r = (V(d1) - F(d1) - V(d0)) / V(d0) where V(x) = eod_value_cents at date x and F(d1) = SUM of cash_flow_cents on d1 (0 when none — the deposit added that morning is not return); period_return_pct = ROUND(100.0 * r, 4)",
      "every boundary date MUST have a valuation row; only the four boundary dates are read and every other valuation row is a decoy; ORDER BY period_no ASC",
    ],
    primer: {
      hook: "Every fund factsheet prints a return number that pretends clients never move money in or out — that number is the time-weighted return, and this problem builds it from raw flows and valuations.",
      concept: [
        "A return answers one question: how much did the money GROW? Take the value at the end, divide by the value at the start, subtract one, and the answer is a percentage anyone can compare — 8 percent beats 3 percent no matter how big the fund is. The trouble is that fund balances do not only grow: clients deposit fresh cash and withdraw spending money, and every one of those moves changes the balance without the market doing anything at all. A return computed straight from the balance would praise the manager for deposits and blame the manager for withdrawals.",
        "Think of the fund as a restaurant and the manager as its chef. The chef controls how good the food is; customers arriving with bigger or smaller appetites do not make the cooking better or worse, so you judge the kitchen on the food, never on the size of the crowds. Deposits and withdrawals are the customers walking in and out — money from OUTSIDE the kitchen. The time-weighted return is the recipe for judging only the cooking: at every moment outside money enters or leaves, the scoreboard is reset, so the chef is measured on exactly the ingredients that were already on the stove.",
        "Mechanically, the month is cut into sub-periods at the flow dates, and each sub-period gets its own small return computed from clean values — the end value has the flow removed before growth is measured. Three sub-periods give three growth factors, and multiplying them together (then subtracting one) gives the full-month time-weighted return; the timing of a big deposit in week one versus week four cannot flatter or punish the manager. That timing-proof quality is the point: two managers running identical markets must print identical TWRs even if their clients behave completely differently.",
        "This is why the fund industry standardizes on TWR for factsheets and manager league tables, while a different number — the money-weighted return — exists for the investor's own experience. The money-weighted view asks what YOUR dollars earned, and a badly-timed deposit genuinely makes it worse; the time-weighted view asks how the manager's cooking performed per dollar-period, regardless of when dollars arrived. Neither is wrong — they answer different questions — but performance reporting in asset management runs on the time-weighted one.",
      ],
      worked: [
        "Say a mini fund opens at 200 cents on Monday, and a client deposits 40 cents on Tuesday morning; Tuesday closes at 254 cents.",
        "Naive read: (254 - 200) / 200 = 27 percent — but 40 of that growth is the deposit walking in, not the market.",
        "Clean the end value: 254 - 40 = 214 cents of market-only value.",
        "Divide by the untouched start: (214 - 200) / 200 = 7 percent — that is the manager's number.",
        "If 40 had instead been withdrawn and Tuesday still closed at 254, the clean end would be 254 + 40 = 294 and the return would read 47 percent — withdrawals are added back.",
      ],
      glossary: [
        { term: "time-weighted return (TWR)", def: "return computed so client deposit timing cannot flatter or punish the manager" },
        { term: "external flow", def: "cash moving into or out of the fund from outside it" },
        { term: "sub-period", def: "the stretch between two consecutive flow boundaries, measured separately" },
        { term: "growth factor", def: "one plus the period return, the number you chain by multiplying" },
        { term: "money-weighted return", def: "the return the investor's own dollars actually experienced, timing included" },
        { term: "factsheet", def: "the standard marketing report printing a fund's performance numbers monthly" },
      ],
      reallife: [
        "At an asset manager the performance team owns this number, and they compute it the moment a month closes: pull every flow, cut the timeline at flow dates, chain the pieces. Their output feeds factsheets, client letters and the consultant league tables that decide which manager keeps the mandate. A single mis-booked deposit — a client transfer stamped as market gain — inflates a period return and, once chained, every month after it in the report.",
        "What breaks in practice is data plumbing, not math: flows arriving with the wrong date, deposits netted against withdrawals so the boundaries land in the wrong place, or a valuation missing on a boundary day so a sub-period silently disappears. Auditors recompute TWR independently every year and reconcile to the basis point. The decisions the numbers drive are real money: performance fees, manager bonuses and whether a pension fund fires or hires the team.",
      ],
      where: "Asset-management performance teams, fund administrators and custodians compute it daily, and SQL interviews at BlackRock, State Street and Northern Trust hand candidates exactly this flows-and-valuations shape.",
    },
    breakdown: [
      "A balance that starts at 100000, takes a 10000 deposit and closes at 109500 grew by 9500 cents on paper, but the manager only had 100000 working and LOST 500 of it — the other 10000 walked in the door that morning. That is the whole problem: a naive (V1 - V0) / V0 treats deposits as skill and withdrawals as losses, so the reported number moves whenever clients move money, not when the market moves. Time-weighted return fixes it by cleaning the end value of each sub-period: subtract whatever flow landed on the end boundary's morning, then measure growth against the untouched start. Period 2 shows the mirror case — the -5000 withdrawal must be ADDED back, since money that left never got the chance to shrink. Clean end, subtract start, divide: each period's return is a two-line computation once the boundaries are fixed.",
      "The boundaries are pinned, not derived: '2026-09-01' opens the month, '2026-09-08' and '2026-09-18' carry the flows, '2026-09-30' closes it, and each period runs from one boundary to the next. Because flows land at the START of their date, a flow on boundary d1 sits INSIDE the period that ends at d1 — the +10000 of 09-08 belongs to period 1 as its end flow, and period 2 simply starts from the 109500 that already contains it. Each flow is therefore counted exactly once, and no period ever contains two flows. The valuations table deliberately holds decoy rows on six other dates; any read that wanders off the four boundary dates — a MAX, an AVG, a range scan — grabs a decoy and reports a number the contract never asked for.",
      "The SQL shape is a boundaries CTE of four literal rows, a periods CTE that pairs each boundary with its successor, and a LEFT JOIN from each period's end boundary onto flows — LEFT because period 3 ends on a day with no flow, and COALESCE turns the missing SUM into 0. Two more joins fetch V(d0) and V(d1) from valuations; the constraint that every boundary has a valuation row is what makes those INNER joins safe. The return expression then subtracts F(d1) from V(d1), subtracts V(d0), divides by V(d0), and lets the 100.0 literal force float division before ROUND(..., 4) trims the finished percentage. Chaining — multiplying the three growth factors — is the followUp; this report ships the three per-period returns the chain is built from.",
    ],
    edges: [
      "Treat the +10000 deposit as return and period 1 reads 9.5 instead of -0.5; treat the -5000 withdrawal as a loss and period 2 reads -8.6758 instead of -4.1096 — the naive (V1 - V0) / V0 is wrong in both directions, which is why period 2 is the probe.",
      "Delete any boundary valuation — say 2026-09-18 — and the INNER joins silently erase TWO periods (2 loses its end, 3 loses its start), shipping 1 row instead of 3; the every-boundary-has-a-valuation constraint is load-bearing.",
      "The LEFT JOIN plus COALESCE on the end-boundary flow is what prints period 3's 0: an INNER join to flows drops period 3 entirely and the report ships 2 rows.",
      "Flip the withdrawal's sign (period 2's clean end becomes 100000 - 5000) and period 2 reads -13.242 — a withdrawal is money LEAVING, so it is added back, not subtracted twice.",
    ],
    ladder: [
      { title: "Brute force — walk the boundaries by hand", body: "Print the four boundary valuations and the two flows on paper, clean each end value by hand, divide three times. Three periods is manageable; a year of daily flows is not, and the clean-and-divide step is exactly what the SQL automates." },
      { title: "The pattern — boundaries in, periods paired, flows attached", body: "Boundaries as a literal VALUES CTE, pair each boundary with its successor, LEFT JOIN the end-boundary flows, join the two boundary valuations, and compute ROUND(100.0 * ((V(d1) - F(d1)) - V(d0)) / V(d0), 4). One statement, four boundaries, three rows." },
      { title: "The optimal idea — pin the calendar, read only boundaries", body: "O(1) here — four boundaries, two flows, ten valuations — and O(B) in general over B boundaries, each period a constant number of keyed lookups. The durable rules: flows land at the start of their date, clean the END value, and never let a non-boundary row into the computation." },
    ],
    approach: "literal boundaries CTE paired into periods, LEFT JOIN end-boundary flows with COALESCE 0, join both boundary valuations, ROUND(100.0 * (V(d1) - F(d1) - V(d0)) / V(d0), 4)",
    schema: {
      ddl: `CREATE TABLE flows (
  flow_id         INTEGER PRIMARY KEY,
  flow_date       TEXT NOT NULL,      -- 'YYYY-MM-DD' - the flow lands at the START of this date
  cash_flow_cents INTEGER NOT NULL    -- deposit positive, withdrawal negative
);
CREATE TABLE valuations (
  value_date      TEXT PRIMARY KEY,   -- 'YYYY-MM-DD'
  eod_value_cents INTEGER NOT NULL
);`,
      seed: `-- September 2026, one fund. Boundaries pinned at 09-01 / 09-08 / 09-18 / 09-30.
-- Flows land at the START of their date (before that day's market move):
-- +10000 deposited on 09-08 morning, -5000 withdrawn on 09-18 morning.
-- The valuation rows BETWEEN boundaries are decoys and are never read.
INSERT INTO flows (flow_id, flow_date, cash_flow_cents) VALUES
  (1, '2026-09-08',  10000),
  (2, '2026-09-18',  -5000);
INSERT INTO valuations (value_date, eod_value_cents) VALUES
  ('2026-09-01', 100000),  -- boundary: period-1 start
  ('2026-09-02', 101200),  -- decoy
  ('2026-09-04', 104000),  -- decoy: mid-period high a naive MAX would grab
  ('2026-09-08', 109500),  -- boundary: period-1 end (includes the 09-08 deposit)
  ('2026-09-12', 112000),  -- decoy: period-2 high
  ('2026-09-15', 106500),  -- decoy
  ('2026-09-18', 100000),  -- boundary: period-2 end (after the -5000 withdrawal)
  ('2026-09-24', 111000),  -- decoy: period-3 high
  ('2026-09-28', 104800),  -- decoy
  -- boundary: period-3 end
  ('2026-09-30', 108000);`,
      tables: [
        { name: "flows", note: "2 flows — +10000 deposited on 2026-09-08, -5000 withdrawn on 2026-09-18" },
        { name: "valuations", note: "10 rows — the 4 boundary dates (09-01, 09-08, 09-18, 09-30) drive the report, 6 are decoys" },
      ],
    },
    code: `WITH boundaries(period_no, boundary_date) AS (
    -- the four PINNED calendar boundaries: month start, two flow dates, month end
    VALUES (1, '2026-09-01'),
           (2, '2026-09-08'),
           (3, '2026-09-18'),
           (4, '2026-09-30')
),
periods AS (
    -- each sub-period runs from one boundary to the next
    SELECT
        a.period_no,
        a.boundary_date AS period_start,
        b.boundary_date AS period_end
    FROM boundaries a
    JOIN boundaries b ON b.period_no = a.period_no + 1
),
flow_at_end AS (
    -- the flow landing on the period's END boundary (0 when none) — flows
    -- land at the START of their date, so the 09-08 deposit belongs to period 1
    SELECT
        p.period_no,
        COALESCE(SUM(f.cash_flow_cents), 0) AS flow_cents
    FROM periods p
    LEFT JOIN flows f ON f.flow_date = p.period_end
    GROUP BY p.period_no
)
SELECT
    p.period_no,
    p.period_start,
    p.period_end,
    fe.flow_cents,
    -- clean end = V(d1) - F(d1): the morning flow is client money, not return
    ROUND(100.0 * ((v1.eod_value_cents - fe.flow_cents) - v0.eod_value_cents) / v0.eod_value_cents, 4) AS period_return_pct
FROM periods p
JOIN flow_at_end fe ON fe.period_no = p.period_no
JOIN valuations v0 ON v0.value_date = p.period_start  -- every boundary has a valuation (pinned)
JOIN valuations v1 ON v1.value_date = p.period_end
ORDER BY p.period_no ASC;`,
    walkthrough: [
      "The boundaries CTE is four literal rows — the contract pins the dates, so no calendar arithmetic is needed and no date function can drift. periods pairs boundary n with boundary n + 1 and yields (1, 2026-09-01 → 2026-09-08), (2, 2026-09-08 → 2026-09-18) and (3, 2026-09-18 → 2026-09-30). Nothing has touched the data tables yet; the whole geometry of the report is already fixed.",
      "flow_at_end walks the three periods and LEFT JOINs flows on the END boundary: period 1 catches the +10000 of 09-08, period 2 catches the -5000 of 09-18 and period 3 finds nothing, so COALESCE stamps 0. The valuations joins then fetch V(d0) and V(d1) for each period straight off the boundary rows — 100000 → 109500, 109500 → 100000, 100000 → 108000. The six decoy valuations are never referenced; the joins are equality lookups on boundary dates.",
      "The projection computes each period's clean end and return: period 1 — (109500 - 10000) - 100000 = -500 over 100000 → -0.5; period 2 — (100000 + 5000) - 109500 = -4500 over 109500 → -4.1096 after the ROUND; period 3 — 8000 over 100000 → 8.0. The engine ships exactly three rows in period_no order: (1, 2026-09-01, 2026-09-08, 10000, -0.5), (2, 2026-09-08, 2026-09-18, -5000, -4.1096) and (3, 2026-09-18, 2026-09-30, 0, 8.0). Every money cell is an INTEGER; only period_return_pct leaves the integers.",
    ],
    time: "O(B) over the B boundaries — four here — each period a constant number of keyed lookups and one arithmetic expression",
    space: "O(B) — the boundaries, periods and flow_at_end CTEs hold one row per boundary at most",
    followUps: [
      "Chain the three growth factors into the full-month TWR — what does (1 + r1) * (1 + r2) * (1 + r3) - 1 read on this seed, and how far does it sit from the plain average of the three returns?",
      "Generalize the boundaries so every flow date starts a new period automatically — which recursive or window construction replaces the literal VALUES list, and what changes when a second flow lands on the same morning as the first?",
      "Report the money-weighted twin beside each period return — weighting by the cents actually at work — and check which period the +10000 deposit flatters under each lens.",
    ],
    related: ["max-drawdown", "daily-balance-interest", "realized-pnl-average-cost"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "sharpe-ratio",
    statement:
      "The same 10 percent can be a triumph or a recklessness — it depends on how bumpy the road was. The daily_values table holds (value_date, eod_value_cents) for all 30 calendar days of September 2026, one row per day, no gaps. The Sharpe ratio prices the bumpiness: it compares the average daily EXCESS return — return above the risk-free rate, pinned here at 4.0 percent annual over 252 trading days — against the standard deviation of those daily excess returns. Using the population standard deviation (divide by n, never n - 1), report ONE row: trading_days (the 29 return observations), mean_excess_pct = ROUND(mean, 4), daily_vol_pct = ROUND(sigma, 4) and sharpe_daily = ROUND(mean / sigma, 2).",
    examples: [
      {
        input: "2026-09-01 closes at 99805 cents and 2026-09-02 closes at 100240 cents — the first pair the LAG walk forms",
        output: "0.4358",
        explanation:
          "100.0 * (100240 - 99805) / 99805 = 0.4358 percent — one of the 29 daily returns; every return then loses the daily risk-free 4.0 / 252 = 0.015873 before it counts toward the ratio.",
      },
      {
        input: "all 29 excess returns of September 2026, aggregated with the pinned population formulas",
        output: "29 · 0.043 · 0.3874 · 0.11",
        explanation:
          "trading_days counts RETURNS (30 value rows minus the LAG-less first), mean_excess_pct and daily_vol_pct print at 4 decimals, and sharpe_daily divides the RAW mean and sigma before rounding to 0.11.",
      },
    ],
    constraints: [
      "all money is INTEGER cents (eod_value_cents); the three reported metrics are the only REALs in the output",
      "PINNED definitions: daily return r_t = 100.0 * (V_t - V_{t-1}) / V_{t-1} in percent; daily risk-free PINNED as 4.0 / 252 (annual 4.0 percent over 252 trading days); excess_t = r_t - 4.0 / 252",
      "PINNED volatility: sigma = sqrt(AVG(1.0 * excess * excess) - AVG(1.0 * excess) * AVG(1.0 * excess)) — the POPULATION standard deviation over the 29 excess returns (divide by n, never n - 1); sqrt is available in this engine",
      "the table holds all 30 calendar days 2026-09-01 through 2026-09-30 with no gaps, so LAG over the date order yields exactly 29 returns; trading_days reports those 29 return observations",
    ],
    primer: {
      hook: "Two funds can earn the same 8 percent while one sleeps at night and the other gives its investors ulcers — the Sharpe ratio is the number that tells them apart.",
      concept: [
        "A raw return has a blind spot: it says nothing about the BUMPINESS of the ride. Fund A returns 8 percent by drifting up a fraction of a percent most days; fund B also returns 8 percent but swings 3 percent up and 3 percent down along the way. Same destination, radically different experience — fund B's investors face days where their savings drop sharply, and they may bail out at the worst possible moment. Finance needed one number that rewards the smooth ride and punishes the wild one.",
        "The Sharpe ratio is that number, and it is almost embarrassingly simple: average return divided by volatility, where volatility is the standard deviation of the returns — the typical distance of a day from the average day. The one refinement: subtract the RISK-FREE rate first, the return money earns for zero risk in a bank deposit or a government bill. What is left is the EXCESS return — the part the manager actually earned by taking risk — and dividing it by volatility prices each unit of bumpiness.",
        "The volatility half deserves respect, because two standard deviations exist. The POPULATION form divides by n and is the pinned formula here; the SAMPLE form divides by n - 1 to correct for estimating the mean from the same data. On 29 observations the two differ at the fourth decimal — small, but grading is exact, and the population form is what the formula block pins. The engine's sqrt function makes the whole computation one expression: average the squares, subtract the square of the average, take the root.",
        "Why does subtracting the risk-free rate matter so much? Because showing up is free: parking money in Treasury bills earns the risk-free rate with no volatility at all, so a fund must beat that bar BEFORE its bumpiness gets judged. Sharpe measures the premium per unit of risk, not the premium per unit of effort — and that is why a 20 percent return with huge swings can score WORSE than a calm 8 percent.",
      ],
      worked: [
        "Take three daily returns in percent: 0.5, -0.3, 0.4 — their average is 0.2 percent a day.",
        "Subtract the daily risk-free bar, 0.016 percent (4.0 annual over 252 days): the excess returns are 0.484, -0.316, 0.384 and their average is 0.184.",
        "The deviations from 0.184 read 0.300, -0.500 and 0.200; the population standard deviation is sqrt((0.0900 + 0.2500 + 0.0400) / 3) = sqrt(0.1267) = 0.356.",
        "Sharpe = 0.184 / 0.356 = 0.52 for these three days — modest reward per unit of bumpiness, and a real desk would want far more than three days before trusting it.",
      ],
      glossary: [
        { term: "Sharpe ratio", def: "average excess return per unit of return volatility" },
        { term: "volatility", def: "the standard deviation of returns — how bumpy a typical day is" },
        { term: "risk-free rate", def: "what money earns with no risk, here 4.0 percent annualized" },
        { term: "excess return", def: "return above the risk-free bar, the reward for taking risk" },
        { term: "population standard deviation", def: "spread computed by dividing by n, the pinned form here" },
        { term: "annualization", def: "scaling a daily figure to a year, by sqrt for Sharpe" },
      ],
      reallife: [
        "Quantitative analysts and multi-asset fund managers live in this ratio. A fund selector comparing two candidates with similar returns will almost always take the higher Sharpe, and institutional consultants screen entire universes of funds by it. Inside a hedge fund, portfolio managers get risk budgets denominated in exactly this currency: you may take more risk only if your expected excess return per unit of risk justifies it.",
        "What breaks in practice: short windows make sigma unstable, because 20 days of calm markets can print a heroic Sharpe that collapses the moment volatility normalizes. Returns that are not independent — positions held for weeks — break the daily arithmetic entirely. The decisions it drives are allocation-sized: pension consultants move billions between strategies on Sharpe comparisons, so a desk that mis-computes sigma (sample versus population, daily versus annualized) can misprice itself out of a mandate.",
      ],
      where: "Quant researchers, fund analysts and risk teams at asset managers and hedge funds run this arithmetic daily, and SQL screens at Two Sigma, AQR and BlackRock hand candidates returns tables asking for exactly this ratio.",
    },
    breakdown: [
      "Two funds can print the same 8 percent for a month while one of them never had a day worse than -0.3 percent and the other swung -2 to +2 every other session. The Sharpe ratio turns that difference into one number: average excess return per unit of daily volatility, so a smooth 8 percent outranks a wild 8 percent. Excess means above the risk-free rate — the return a bank deposit would have paid for free — pinned here at 4.0 percent a year over 252 trading days, or 4.0 / 252 per day. Subtracting it first is what makes the ratio a reward-for-RISK measure rather than a reward-for-showing-up measure.",
      "Volatility is the standard deviation of the 29 daily excess returns: how far a typical day strays from the average day. The pinned formula is the population form — average the squares, subtract the square of the average, take the square root — with every weight 1 / n, never the sample form's 1 / (n - 1). On a 29-observation seed the two forms disagree at the fourth decimal, and the contract grades the population one. The 1.0 * multipliers keep every product in float land before the aggregation, and sqrt is available in this engine — verified, not assumed.",
      "The return series is a LAG play: order the 30 rows by value_date, pair each EOD value with the prior one, and 30 rows become 29 returns — the first day has no yesterday and its NULL drops out. One aggregate pass then computes COUNT, AVG(excess), AVG(excess squared) and the ratio in a single GROUP-less SELECT. Rounding comes last and in the pinned places: mean and sigma to 4 decimals for the display columns, but the sharpe division itself runs on the UNROUNDED mean and sigma — rounding before dividing is a documented trap.",
    ],
    edges: [
      "Use the sample standard deviation (n - 1 denominator) and daily_vol_pct reads 0.3943 instead of 0.3874 — pinned from this seed, and the check script asserts both.",
      "Skip the risk-free subtraction and mean_excess_pct reads 0.0588 instead of 0.043 — the average raw return, reward-for-showing-up edition.",
      "Annualize by multiplying the daily Sharpe by 252 and you overstate by a factor of sqrt(252) — daily Sharpe scales with the SQUARE ROOT of time, not with time; the probe pins 27.95 against the correct 1.76.",
      "Round mean and sigma BEFORE the division and sharpe_daily happens to still read 0.11 on this seed — the contract still divides the raw aggregates, and the check labels that probe HAPPENS TO AGREE honestly.",
    ],
    ladder: [
      { title: "Brute force — spreadsheet the returns", body: "Compute the 29 returns by hand, subtract 0.015873 from each, average them, take the standard deviation, divide. Perfectly doable once; unmaintainable and ungradeable in SQL form." },
      { title: "The pattern — LAG then one aggregate pass", body: "LAG builds the return series in date order, a second CTE subtracts the pinned daily risk-free rate, and one aggregate SELECT computes the mean, the population sigma and their ratio. The population form is the pinned formula — no n - 1 anywhere." },
      { title: "The optimal idea — round last, divide raw", body: "O(n log n) over the n value rows — one sort for the window, one pass for the aggregates. The durable rules: returns are percent, the risk-free rate is per-DAY, sigma is population, and every rounding happens after every division." },
    ],
    approach: "LAG-built return series, pinned 4.0/252 excess, population sigma via sqrt(AVG(x*x) - AVG(x)^2), one aggregate row, round last",
    schema: {
      ddl: `CREATE TABLE daily_values (
  value_date      TEXT PRIMARY KEY,   -- 'YYYY-MM-DD', all 30 calendar days of 2026-09
  eod_value_cents INTEGER NOT NULL
);`,
      seed: `-- September 2026, one fund, all 30 calendar days, no gaps: a mechanical
-- zigzag around a steady uptrend (drift +45 cents a day, alternating +195 /
-- -195 around the trend) chosen so every aggregate is hand-checkable.
INSERT INTO daily_values (value_date, eod_value_cents) VALUES
  ('2026-09-01',  99805),
  ('2026-09-02', 100240),
  ('2026-09-03',  99895),
  ('2026-09-04', 100330),
  ('2026-09-05',  99985),
  ('2026-09-06', 100420),
  ('2026-09-07', 100075),
  ('2026-09-08', 100510),
  ('2026-09-09', 100165),
  ('2026-09-10', 100600),
  ('2026-09-11', 100255),
  ('2026-09-12', 100690),
  ('2026-09-13', 100345),
  ('2026-09-14', 100780),
  ('2026-09-15', 100435),
  ('2026-09-16', 100870),
  ('2026-09-17', 100525),
  ('2026-09-18', 100960),
  ('2026-09-19', 100615),
  ('2026-09-20', 101050),
  ('2026-09-21', 100705),
  ('2026-09-22', 101140),
  ('2026-09-23', 100795),
  ('2026-09-24', 101230),
  ('2026-09-25', 100885),
  ('2026-09-26', 101320),
  ('2026-09-27', 100975),
  ('2026-09-28', 101410),
  ('2026-09-29', 101065),
  ('2026-09-30', 101500);`,
      tables: [
        { name: "daily_values", note: "30 rows, all calendar days 2026-09-01..2026-09-30, no gaps — 29 returns after LAG" },
      ],
    },
    code: `WITH rets AS (
    -- one return per day AFTER the first: LAG pairs each EOD value with the
    -- prior day's, ordered by value_date, so 30 rows become 29 returns
    SELECT
        100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
            / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
    FROM daily_values
),
excess AS (
    -- subtract the PINNED daily risk-free rate: annual 4.0 percent over 252 days
    SELECT r_pct - 4.0 / 252.0 AS ex
    FROM rets
    WHERE r_pct IS NOT NULL
)
SELECT
    COUNT(*) AS trading_days,
    ROUND(AVG(ex), 4) AS mean_excess_pct,
    -- population sigma: average square minus square of average, then sqrt
    ROUND(sqrt(AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex)), 4) AS daily_vol_pct,
    -- the division runs on the RAW mean and sigma - rounding comes last
    ROUND(AVG(ex) / sqrt(AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex)), 2) AS sharpe_daily
FROM excess;`,
    walkthrough: [
      "The rets CTE walks the table in value_date order and pairs every EOD value with its predecessor: 2026-09-02's return is 100.0 * (100240 - 99805) / 99805 = 0.4358 percent, 2026-09-03's is 100.0 * (99895 - 100240) / 100240 = -0.3442 percent, and so on down the month. Thirty value rows enter; twenty-nine returns leave, because 2026-09-01 has no yesterday and its LAG hands back NULL. The excess CTE subtracts the pinned 4.0 / 252 = 0.015873 from each return, so 0.4358 becomes roughly 0.42 of excess.",
      "The final SELECT aggregates the 29 excess returns in one pass: COUNT reads 29, AVG(ex) reads 0.04296477683056378 raw (printed 0.043 at 4 decimals), and the population variance AVG(1.0 * ex * ex) - AVG(1.0 * ex) * AVG(1.0 * ex) feeds sqrt for 0.3874242363097246 raw (printed 0.3874). The zigzag seed makes sigma easy to believe: returns alternate between roughly +0.43 and -0.34 percent around a +0.059 percent mean, so a typical day strays about 0.39 points from home. The sharpe division runs on those RAW aggregates — 0.0429647... / 0.3874242... = 0.1108985... — and only then rounds to 0.11.",
      "The engine ships one row: trading_days 29, mean_excess_pct 0.043, daily_vol_pct 0.3874, sharpe_daily 0.11. Every rounding happens at the very end and in the pinned places — 4 decimals for the two display aggregates, 2 for the finished ratio. A sample-sigma variant (n - 1 denominator) reads 0.3943 on this seed and a no-risk-free variant reads 0.0588, both pinned as probe targets in the check script.",
    ],
    time: "O(n log n) over the n value rows — one sort for the LAG window plus one linear aggregate pass",
    space: "O(n) — the return and excess series materialize before the final aggregate",
    followUps: [
      "Annualize the daily Sharpe the right way — multiply by sqrt(252) and compare with the naive 252 multiple; what does each print on this seed, and why do they differ by a factor of about 15.9?",
      "Add a rolling 20-day Sharpe column — which window frame turns the whole-table aggregate into a per-day figure, and what does the ratio do on the first 19 rows where the window is still filling?",
    ],
    related: ["max-drawdown", "portfolio-weights", "portfolio-concentration-hhi"],
    order: "any",
    xp: 20,
  },
  {
    slug: "value-at-risk",
    statement:
      "Risk desks answer one question every morning: on a bad day — a 1-in-20 bad day — how much can this book lose? The daily_values table holds (value_date, eod_value_cents) for exactly 101 consecutive calendar days ending 2026-09-30, which yields exactly 100 daily returns. Value at Risk at 95 percent is the return that 19 days out of 20 stay above: concretely, the 5th-WORST return of the 100, reported as a SIGNED percent where negative means a loss. Report ONE row — n_returns = 100, var95_pct = the rn = 5 return rounded to 4 decimals, worst_pct = MIN(r) rounded to 4 decimals — with the returns built by LAG over the date order.",
    examples: [
      {
        input: "2026-07-06 closes at 100300 cents; 2026-07-07 closes at 97100 cents",
        output: "-3.1904",
        explanation:
          "100.0 * (97100 - 100300) / 100300 = -3.1904 percent — the worst of the 100 returns; five such crash days form the left tail the report reads from.",
      },
      {
        input: "all 100 returns ranked worst-first; the report reads rank 5",
        output: "100 · -1.3056 · -3.1904",
        explanation:
          "n_returns counts RETURNS (LAG drops 2026-06-22), var95_pct is the 5th-worst return and worst_pct the single worst — both SIGNED, negative = a loss.",
      },
    ],
    constraints: [
      "all money is INTEGER cents (eod_value_cents); var95_pct and worst_pct are the only REALs and both are SIGNED percents (negative = a loss)",
      "PINNED definitions: daily return r_t = 100.0 * (V_t - V_{t-1}) / V_{t-1} in percent; VaR95 is the 5th-WORST return — sort ascending, ROW_NUMBER rn = 5, the empirical quantile with n = 100",
      "the table holds exactly 101 consecutive calendar rows 2026-06-22 through 2026-09-30 (no gaps) producing exactly 100 returns; n_returns counts returns, not value rows",
      "the five worst returns sit at least 10 basis points apart from each other and from the 6th-worst, so the 5th-worst pick is unambiguous",
    ],
    primer: {
      hook: "Banks print one number that tells traders how much they are ALLOWED to lose on a bad day — Value at Risk, the 1-in-20 loss line.",
      concept: [
        "Every trading desk can lose money, and no amount of skill makes losses impossible — so the honest question is not whether but HOW MUCH on a BAD day. Value at Risk answers it with a percentile: pick a confidence level, 95 percent, and report the loss threshold that bad days cross only 5 percent of the time. In everyday words: on 19 mornings out of 20, the book should lose less than the VaR number; on the 20th morning, all bets are off.",
        "The empirical version — the one this problem builds — needs no probability theory at all, just history and a sort. Take the last 100 daily returns, line them up from worst to best, and read the fifth row: that IS the 95 percent VaR when n = 100, because 5 percent of 100 is exactly 5. Bigger histories or stricter levels need distribution assumptions, but the sort-and-count version is what a SQL desk report can produce before the first coffee.",
        "Two conventions matter more than they look. First, the SIGN: VaR is usually quoted as a positive loss number in conversation ('VaR is two million') but the underlying return is negative, and a report must say which one it is printing. Second, the SCOPE: VaR says nothing about HOW BAD the bad day is — the five worst days could average -1.5 or -15, and VaR95 prints the same line for both. That blind spot has a name, expected shortfall, and regulators keep reaching for it after every crisis.",
        "Inside a bank, VaR is not a curiosity — it is a LIMIT. A trader whose book can lose 3 million on a bad day gets a smaller allocation than one capped at 1 million, and crossing the line triggers a same-day call from the risk officer. The number is computed overnight on yesterday's positions and waits on the desk manager's screen before markets open.",
      ],
      worked: [
        "Sort 20 daily returns worst-first: -3.1 first, then -2.4, -1.9, -1.2, -0.9, then fifteen mild days.",
        "At 95 percent confidence with n = 20, the quantile sits at rank 1 — five percent of twenty days is exactly one day.",
        "So VaR95 = -3.1 percent: on 19 of the 20 days the book lost less than 3.1 percent.",
        "Notice what VaR does NOT say: the worst day might have been -3.1 or -13.1 — the tail beyond the line is invisible, which is why expected shortfall exists.",
      ],
      glossary: [
        { term: "Value at Risk (VaR)", def: "the loss threshold a book stays above on 95 of 100 days" },
        { term: "confidence level", def: "the percent of days the reported threshold is designed to hold" },
        { term: "empirical quantile", def: "a percentile read directly from sorted historical data, no model" },
        { term: "left tail", def: "the worst returns at the bottom of the sorted list" },
        { term: "expected shortfall", def: "the average loss beyond VaR, answering how bad the bad day gets" },
        { term: "risk limit", def: "the maximum VaR a trader's book is allowed to carry" },
      ],
      reallife: [
        "Market-risk teams run VaR overnight across every trading book and publish a morning sheet before markets open. The numbers set position limits desk by desk, and a breach — a book whose VaR climbs over its cap — triggers a same-day conversation between the trader and the risk officer, sometimes an enforced trim. Regulators read the same numbers: bank capital requirements are calibrated against VaR-style measures.",
        "What breaks is rarely the sort — it is the inputs. Stale prices on an illiquid bond make a wild day look calm, a missing history row shifts every rank by one, and a book that grew mid-window mixes two different portfolios into one distribution. The 2008 crisis made the blind spot famous: banks whose VaR said lose at most X one day in twenty lost several X several days IN A ROW, which is why expected shortfall now sits beside VaR in the rulebooks.",
      ],
      where: "Market-risk analysts, risk-system developers and quant developers at banks and hedge funds build these reports, and SQL screens at Goldman Sachs, JPMorgan and Citi include exactly this percentile-of-returns query.",
    },
    breakdown: [
      "A VaR number is a percentile of the loss distribution, and the empirical version needs no statistics beyond sorting: line the 100 daily returns up from worst to best and read the fifth one. Nineteen days out of twenty the book loses less than that; one day in twenty it loses more, which is exactly the risk appetite a risk committee writes down. The report is SIGNED — var95_pct of -1.3056 means a loss of 1.3056 percent, and printing 1.3056 without the sign inverts the meaning entirely.",
      "The off-by-one is the classic failure: rank 4 is the 4th-worst and rank 6 is the 6th-worst, and neither is VaR95. With n = 100 the arithmetic is friendly — 5 percent of 100 is exactly 5 — so the empirical quantile IS row 5 of the ascending sort, no interpolation, no ceil, no floor. Sorting DESC instead picks the 5th BEST return, a positive number from the good days that looks plausible and is completely wrong.",
      "Mechanically the query is three small pieces: a LAG CTE that turns 101 value rows into 100 returns (day one has no yesterday and drops), a ranked CTE that stamps ROW_NUMBER over the ascending order, and a final SELECT that picks rn = 5 with a scalar subquery while MIN(r) computes the worst day in the same statement. The scalar subquery reads one row out of the ranked set without collapsing it, which is what lets the pick and the MIN share one statement. n_returns comes from COUNT(*) over the ranked set and must read 100 — counting daily_values instead reads 101 and betrays that LAG was forgotten.",
    ],
    edges: [
      "rn = 4 reads the 4th-worst crash (-1.717 pinned) instead of the 5th-worst VaR (-1.3056 pinned) — one position off in the rank, one wrong risk limit.",
      "ORDER BY r_pct DESC puts rank 5 in the GOOD tail — the 5th best day, roughly +0.0824 percent, printed where a loss belongs.",
      "Counting daily_values instead of returns makes n_returns read 101, announcing that LAG's dropped first row was forgotten; dropping the WHERE r_pct IS NOT NULL guard lets day one's NULL pollute the rank instead.",
      "The signed convention cuts both ways: worst_pct is NEGATIVE (-3.1904 pinned), and a report that prints its absolute value turns the worst day into a gain.",
    ],
    ladder: [
      { title: "Brute force — sort the returns by hand", body: "Write the 100 returns in a column, sort ascending, circle the fifth row and the first row. One hundred rows is the practical limit of eyeballing, and the desk needs this every morning in one query." },
      { title: "The pattern — LAG, rank, pick rank 5", body: "LAG builds the returns, ROW_NUMBER () OVER (ORDER BY r_pct ASC) ranks them worst-first, and a scalar subquery picks rn = 5 beside an aggregate MIN. Three CTEs, one statement, one row." },
      { title: "The optimal idea — count returns, keep the sign", body: "O(n log n) — one sort for the window rank and one scan for the MIN. The durable rules: count returns not rows, rank ascending for worst-first, keep the sign, and remember an empirical VaR is only as good as its n." },
    ],
    approach: "LAG return CTE, ROW_NUMBER ascending rank, scalar subquery picks rn = 5 beside MIN(r) in one aggregate row",
    schema: {
      ddl: `CREATE TABLE daily_values (
  value_date      TEXT PRIMARY KEY,   -- 'YYYY-MM-DD', 101 consecutive days ending 2026-09-30
  eod_value_cents INTEGER NOT NULL
);`,
      seed: `-- 101 consecutive calendar days 2026-06-22 .. 2026-09-30, no gaps: 100 returns.
-- A drifting book that suffers five engineered crashes (returns near -3.2,
-- -2.7, -2.2, -1.7 and -1.3 percent) separated by at least 10 basis points
-- from each other and from the mild days (within about +/- 0.09 percent).
INSERT INTO daily_values (value_date, eod_value_cents) VALUES
  ('2026-06-22', 100000),
  ('2026-06-23', 100060),
  ('2026-06-24', 100100),
  ('2026-06-25', 100065),
  ('2026-06-26', 100140),
  ('2026-06-27', 100120),
  ('2026-06-28', 100175),
  ('2026-06-29', 100135),
  ('2026-06-30', 100200),
  ('2026-07-01', 100230),
  ('2026-07-02', 100175),
  ('2026-07-03', 100220),
  ('2026-07-04', 100195),
  ('2026-07-05', 100265),
  ('2026-07-06', 100300),
  ('2026-07-07',  97100),  -- crash: -3200 cents, the worst return
  ('2026-07-08',  97150),
  ('2026-07-09',  97090),
  ('2026-07-10',  97170),
  ('2026-07-11',  97195),
  ('2026-07-12',  97165),
  ('2026-07-13',  97225),
  ('2026-07-14',  97265),
  ('2026-07-15',  97230),
  ('2026-07-16',  97305),
  ('2026-07-17',  97285),
  ('2026-07-18',  97340),
  ('2026-07-19',  97300),
  ('2026-07-20',  97365),
  ('2026-07-21',  97395),
  ('2026-07-22',  97340),
  ('2026-07-23',  97385),
  ('2026-07-24',  97360),
  ('2026-07-25',  94710),  -- crash: -2650 cents
  ('2026-07-26',  94745),
  ('2026-07-27',  94700),
  ('2026-07-28',  94750),
  ('2026-07-29',  94690),
  ('2026-07-30',  94770),
  ('2026-07-31',  94795),
  ('2026-08-01',  94765),
  ('2026-08-02',  94825),
  ('2026-08-03',  94865),
  ('2026-08-04',  94830),
  ('2026-08-05',  94905),
  ('2026-08-06',  94885),
  ('2026-08-07',  94940),
  ('2026-08-08',  94900),
  ('2026-08-09',  94965),
  ('2026-08-10',  94995),
  ('2026-08-11',  94940),
  ('2026-08-12',  94985),
  ('2026-08-13',  92885),  -- crash: -2100 cents
  ('2026-08-14',  92955),
  ('2026-08-15',  92990),
  ('2026-08-16',  92945),
  ('2026-08-17',  92995),
  ('2026-08-18',  92935),
  ('2026-08-19',  93015),
  ('2026-08-20',  93040),
  ('2026-08-21',  93010),
  ('2026-08-22',  93070),
  ('2026-08-23',  93110),
  ('2026-08-24',  93075),
  ('2026-08-25',  93150),
  ('2026-08-26',  93130),
  ('2026-08-27',  93185),
  ('2026-08-28',  93145),
  ('2026-08-29',  93210),
  ('2026-08-30',  93240),
  ('2026-08-31',  93185),
  ('2026-09-01',  91585),  -- crash: -1600 cents
  ('2026-09-02',  91560),
  ('2026-09-03',  91630),
  ('2026-09-04',  91665),
  ('2026-09-05',  91620),
  ('2026-09-06',  91670),
  ('2026-09-07',  91610),
  ('2026-09-08',  91690),
  ('2026-09-09',  91715),
  ('2026-09-10',  91685),
  ('2026-09-11',  91745),
  ('2026-09-12',  91785),
  ('2026-09-13',  91750),
  ('2026-09-14',  91825),
  ('2026-09-15',  91805),
  ('2026-09-16',  91860),
  ('2026-09-17',  91820),
  ('2026-09-18',  91885),
  ('2026-09-19',  91915),
  ('2026-09-20',  90715),  -- crash: -1200 cents, the VaR95 day
  ('2026-09-21',  90760),
  ('2026-09-22',  90735),
  ('2026-09-23',  90805),
  ('2026-09-24',  90840),
  ('2026-09-25',  90795),
  ('2026-09-26',  90845),
  ('2026-09-27',  90785),
  ('2026-09-28',  90865),
  ('2026-09-29',  90890),
  ('2026-09-30',  90860);`,
      tables: [
        { name: "daily_values", note: "101 rows, all calendar days 2026-06-22..2026-09-30, no gaps — 100 returns after LAG" },
      ],
    },
    code: `WITH rets AS (
    -- one return per day AFTER the first: LAG pairs each EOD value with the
    -- prior day's, ordered by value_date, so 101 rows become 100 returns
    SELECT
        100.0 * (eod_value_cents - LAG(eod_value_cents) OVER (ORDER BY value_date))
            / LAG(eod_value_cents) OVER (ORDER BY value_date) AS r_pct
    FROM daily_values
),
ranked AS (
    -- worst first: the WHERE drops day one's NULL so the rank runs 1..100
    SELECT
        r_pct,
        ROW_NUMBER() OVER (ORDER BY r_pct ASC) AS rn
    FROM rets
    WHERE r_pct IS NOT NULL
)
SELECT
    (SELECT COUNT(*) FROM ranked) AS n_returns,
    -- the 5th-WORST return: rn = 5 of the ascending sort, kept SIGNED
    ROUND((SELECT r_pct FROM ranked WHERE rn = 5), 4) AS var95_pct,
    ROUND(MIN(r_pct), 4) AS worst_pct
FROM ranked;`,
    walkthrough: [
      "The rets CTE turns 101 value rows into 100 returns: 2026-07-07 pairs 97100 against 100300 and reads 100.0 * (97100 - 100300) / 100300 = -3.1904 percent, while a mild day like 2026-06-23 (100060 against 100000) reads +0.06 percent. Day one, 2026-06-22, has no yesterday; its NULL is filtered before ranking so the rank runs exactly 1 through 100. ranked stamps ROW_NUMBER over the ascending order, putting the five crash days in ranks 1 through 5 and the mildest day at rank 100.",
      "The five crash returns read -3.1904287..., -2.7218571..., -2.2108752..., -1.7170145... and -1.3055540... — gaps of 47, 51, 49, 41 and 124 basis points down to rank 6's -0.0660465..., so rank 5 is unambiguous. The scalar subquery picks rn = 5: -1.3055540444976337, rounded to -1.3056. MIN(r_pct) over the same CTE reads the worst day, -3.1904287138584246, rounded to -3.1904, and COUNT(*) over ranked reads exactly 100 — returns, not value rows.",
      "The engine ships one row: n_returns 100, var95_pct -1.3056, worst_pct -3.1904. Both percent cells keep their sign — the report says the book lost at least 1.3056 percent on its 1-in-20 day and 3.1904 percent on its worst day. A rank-4 variant reads -1.717, a DESC variant reads +0.0824, and COUNT over daily_values reads 101 — each pinned as a probe target in the check script.",
    ],
    time: "O(n log n) over the n value rows — one sort for the LAG window and one for the ascending rank",
    space: "O(n) — the return series and the ranked copy materialize before the projection",
    followUps: [
      "Expected shortfall answers what VaR hides — compute the AVERAGE of the five worst returns beyond the 95 percent line and compare it with var95_pct; how much worse is the average bad day than the quoted one?",
      "Re-run the report at 99 percent — which rn does n = 100 point at, and why does an empirical quantile get shakier the deeper into the tail it reaches?",
    ],
    related: ["max-drawdown", "fx-exposure-report", "portfolio-concentration-hhi"],
    order: "any",
    xp: 20,
  },
];
