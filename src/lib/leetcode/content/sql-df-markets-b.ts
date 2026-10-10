// Deep-dives — Data & Finance markets file B: dividend income calendar,
// max drawdown and duplicate-charge pairs (3 problems: 2 Medium, 1 Hard,
// all order:"exact"). Money is INTEGER minor units; nav/dps are REAL with
// pinned rounding. Original finance phrasing — never copied problem text.
// Registry wiring (lead): 8022 dividend-income-calendar ·
// 8023 max-drawdown · 8024 duplicate-charge-pairs.
import type { LcSqlDive } from "../types";

export const SQL_DF_MARKETS_B: LcSqlDive[] = [
  {
    slug: "dividend-income-calendar",
    statement:
      "The holdings table records one row per account position: (account_id, symbol, shares), and the dividends table lists each symbol's payout events with ex_date, pay_date and dps in USD per share. An income calendar projects the cash still UPCOMING as of the fixed date '2026-10-01': a payout counts only while it is strictly future on its EX date — ex_date > '2026-10-01' — because ownership transfers at the ex-date, and a dividend going ex ON the as-of date has already locked every holder in. For every (account, dividend) pair that passes the gate, report account_id, symbol, pay_date, shares and income_cents = CAST(ROUND(shares * dps * 100) AS INTEGER). Order by pay_date ascending, then account_id ascending, then symbol ascending — a symbol with two upcoming payouts legitimately fans each of its holdings out to two rows.",
    examples: [
      {
        input: "account 2 holds 75 JNJ shares; JNJ goes ex 2026-11-24 and pays 2026-12-08 at 1.30 dollars per share",
        output: "2 · JNJ · 2026-12-08 · 75 · 9750",
        explanation:
          "75 * 1.30 = 97.50 dollars and the ×100 scale turns that into 9750 cents; the 2026-11-24 ex-date is strictly future on the as-of, so the position is not yet locked and the cash is genuinely upcoming.",
      },
      {
        input: "account 1 holds 200 O shares; O's only dividend went ex 2026-09-15 and pays 2026-10-15 at 0.63 dollars per share",
        output: "no row — the calendar is silent on O",
        explanation:
          "The ex-date sits behind '2026-10-01', so this position is already locked for its 200 * 0.63 = 126.00 dollar payment; gating on the future pay date instead would resurrect it as a phantom 12600-cent row at the very top of the calendar.",
      },
    ],
    constraints: [
      "the as-of date is the fixed literal '2026-10-01' written directly into the SQL, and the gate is STRICTLY future — ex_date > '2026-10-01' — because a dividend going ex on the as-of date has already locked the holder: that cash is earned, not upcoming",
      "income_cents = CAST(ROUND(shares * dps * 100) AS INTEGER) — dps is a REAL USD-per-share amount, the ×100 converts to integer minor units, and ROUND fires on the finished product before the CAST",
      "one row per (holding, upcoming dividend): a symbol carrying two future ex-dates fans each of its holdings out to two honest rows, and a holding whose symbol has no qualifying dividend simply does not appear",
      "ORDER BY pay_date ASC, account_id ASC, symbol ASC",
    ],
    primer: {
      hook:
        "An income calendar turns share ownership into a promise of cash — it is the what-will-I-collect view a broker puts on the portfolio page, and the ex-date decides every line in it.",
      concept: [
        "Companies that earn more than they need to reinvest often hand part of the profit back to their owners, and that payment is a dividend. Owning 40 shares of a company that pays 1.30 dollars per share means the company owes you 52 dollars for that event, whatever the stock price does that week. A dividend is an event with dates, not a line in a bank account: the company announces it, ownership is measured on a deadline, and the cash moves days later. An income calendar lines up every future payout against the positions that will receive it — the projected cash view a wealth platform shows its customers.",
        "Every payout runs on a four-date timeline. The declaration date is the announcement itself; the ex-date is the ownership deadline, the day the stock trades without the dividend attached; the record date, typically the following business day, is when the company photographs its shareholder roll; and the pay date is when the cash finally lands. The ex-date is the whole game: buy the share before it and the dividend is yours, buy on or after it and you are out — holding on the wrong side of that single day loses the entire payment. That is why ownership of a dividend transfers at the ex-date, not at the pay date.",
        "The timeline is what makes a calendar honest about the word upcoming. Once a dividend has gone ex, every holder on the right side of the deadline is locked in — the cash is earned even while it sits weeks from landing — so counting it as upcoming would promise money that is already owed. A projection taken on 2026-10-01 therefore keeps only payouts whose ex-date is strictly in the future: a stock going ex ON the as-of day has already closed its window when the day opens, so it joins the past with everything older. The pay date plays no role in the gate; it only says when the surviving rows will actually pay.",
        "The arithmetic is per share, then scaled. A payout's dps — dividend per share — is a dollar amount, and an account's cash for the event is shares times dps; reports keep money in integer minor units, the smallest coin of the currency, so 75 shares at 1.30 dollars reads 97.50 dollars and then 9750 cents, with the times-100 scale, the rounding and the integer cast happening in that order. One symbol can carry several live payouts at once — quarterly payers often have two ahead at any moment — and each one is its own row: two future payouts, two honest lines for the same holding.",
      ],
      worked: [
        "Take account 2's 75 JNJ shares with the as-of date 2026-10-01: JNJ's December event goes ex 2026-11-24, strictly after the as-of, so the position still qualifies.",
        "The cash is 75 * 1.30 = 97.50 dollars; the times-100 scale turns that into 9750 cents, payable 2026-12-08.",
        "The same file holds 200 O shares in account 1, but O's only event went ex 2026-09-15 — before the as-of — so those holders are already locked for 200 * 0.63 = 126.00 dollars and the calendar says nothing.",
        "KO has two future events, so account 1's 150 KO shares fan out to two rows: 150 * 0.48 = 72.00 dollars, 7200 cents, on 2026-12-11, and 150 * 0.52 = 78.00 dollars, 7800 cents, on 2027-03-12.",
        "The boundary is the ex-date itself: a payout ex-ing exactly on 2026-10-01 has already locked its holders by the time the day opens, so the gate is strictly greater than, never greater-or-equal.",
      ],
      glossary: [
        { term: "ex-date", def: "the trading day on which ownership of a dividend is decided — buy before it and the payout is yours" },
        { term: "record date", def: "the day the company photographs its shareholder roll to determine who is paid" },
        { term: "pay date", def: "the day the dividend cash actually lands in the holder's account" },
        { term: "dps", def: "dividend per share — the dollar amount paid for each share held in one payout event" },
        { term: "income calendar", def: "a projection of the dividend cash a book of positions will still receive" },
        { term: "minor units", def: "the smallest coin of a currency — cents when dollars are the unit — so money stays integral" },
      ],
      reallife: [
        "Wealth platforms run this feature at scale: portfolio-product teams at brokers like Fidelity and Schwab build the projected-income view from the corporate-actions feed, and the same projection powers cash forecasting for advisors who plan client withdrawals around dividend-heavy months. Treasury desks at insurers and endowments run the identical query against far larger books, because scheduled dividends are part of the money they must put to work. The engineering effort sits less in the SQL than in keeping the corporate-actions feed correct — every row of the calendar is only as good as the dividend record behind it.",
        "What breaks in practice: issuers revise payout amounts or move ex-dates after a calendar is built, a stock split rewrites the per-share math overnight, and suspended dividends leave stale rows promising cash that will never arrive. Gating logic is the classic silent bug — projecting on the pay date instead of the ex-date resurrects payments that are already earned, overstating future income the moment more payouts are pending than paid. The numbers drive real decisions: advisors time withdrawals, cash managers size overnight reinvestments, and product teams judge the income feature by whether its projection survives contact with the actual payments.",
      ],
      where:
        "Portfolio and wealth-management analytics interviews — Fidelity, Schwab, Robinhood, Vanguard — ask projected-dividend-income SQL for portfolio-data and cash-forecasting roles.",
    },
    breakdown: [
      "An income calendar answers one question — what cash is still coming in — and the honest gate is the EX date, not the pay date. Ownership of a dividend transfers when the stock goes ex: on the morning of 2026-09-15, O's holders were locked in and the 2026-10-15 payment became earned income with cash timing still in the future. A calendar that gates on pay_date > '2026-10-01' therefore resurrects O as two phantom rows (12600 cents for account 1) at the very top of the report, misstating what is actually upcoming. The strictly-future test ex_date > '2026-10-01' is the whole contract: by the time the as-of day opens, a payout ex-ing that very day has already locked its holders too, so it is excluded with the same stroke.",
      "The report is a gated join with per-share scaling: keep the dividends whose ex_date is strictly beyond the as-of, join them to holdings on symbol, and multiply. The multiply is where the money convention lives — dps is a REAL amount in whole dollars per share while the output is INTEGER minor units, so CAST(ROUND(shares * dps * 100) AS INTEGER) scales first, rounds second and casts last. Rounding the finished product is safe on this seed because every shares × dps × 100 lands on a whole cent (75 * 1.30 = 9750), never on a half-cent tie. Skipping the ×100 is the classic silent bug: the JNJ rows read 52 and 98 instead of 5200 and 9750 — the 97.5 even rounds up to 98 — off by two orders of magnitude and easy to miss in a spot check.",
      "The join fans out honestly: KO carries two future ex-dates, so each KO holding appears twice — once per payout — and that is the correct reading of every (account, dividend) pair. A GROUP BY cleanup that folds those rows together mangles the calendar: it sums account 1's 7200 and 7800 into a single 15000-cent row stamped with the far payout's date. Absence is a feature too — BRKB holds 5 shares in account 1 but has no dividend rows at all, and O's only dividend already went ex, so neither appears no matter which join flavor you pick. The report ships six rows: two JNJ payouts, two December KO payouts and two March KO payouts.",
    ],
    edges: [
      "O's dividend is the pay-date trap in the flesh: ex 2026-09-15 is past but pay 2026-10-15 is future, and gating on pay_date resurrects it as two phantom rows — (1, O, 2026-10-15, 200, 12600) would lead the wrong report — while the honest ex-date gate ships exactly 6 rows.",
      "The boundary is strict: a payout with ex_date exactly '2026-10-01' is excluded — its holders are already locked when the as-of day opens — so the contract is ex_date > '2026-10-01', never >=. No seeded dividend sits on the boundary; the pin lives in the constraint and in this line, not in the data.",
      "BRKB (5 shares, account 1) has no dividend rows at all: an INNER JOIN misses it silently, and a LEFT JOIN written with the gate in WHERE collapses to the same INNER behavior because a NULL ex_date fails the predicate — the equivalence is probed, and either way the report stays silent on non-payers.",
      "ROUND before the ×100 cannot tie on this seed: every shares × dps × 100 product (5200, 9750, 7200, 14400, 7800, 15600) is a whole cent, so CAST(ROUND(...)) never meets a half-cent case — a seed like 3 shares at 0.175 dollars would, and the pinned order (scale, then round, then cast) is what keeps the cell deterministic.",
    ],
    ladder: [
      { title: "Brute force — eyeball every payout", body: "Read each dividend, check its ex-date against the calendar by hand, multiply by every holder's shares and copy the rows into a ledger. Four payouts and seven holdings is traceable; a real book of symbols is not, and the hand version silently skips the fanout question." },
      { title: "The pattern — gated join, per-share scale", body: "One CTE keeps dividends with ex_date > '2026-10-01', and the outer query joins holdings on symbol and computes CAST(ROUND(shares * dps * 100) AS INTEGER). The gate lives in exactly one place, so pay-date confusion cannot leak into it." },
      { title: "The optimal idea — the ex-date owns the calendar", body: "O(h × d) over the join — the gate trims the dividend side to the still-upcoming set before any multiplication happens. The durable rules: gate on ex, scale to minor units last, and let a multi-payout symbol fan out rather than folding it away." },
    ],
    approach: "gate dividends on strictly-future ex_date, join to holdings on symbol, CAST(ROUND(shares * dps * 100) AS INTEGER), ordered pay_date then account then symbol",
    schema: {
      ddl: `CREATE TABLE holdings (
  account_id INTEGER NOT NULL,
  symbol     TEXT NOT NULL,
  shares     INTEGER NOT NULL,
  PRIMARY KEY (account_id, symbol)
);
CREATE TABLE dividends (
  symbol   TEXT NOT NULL,
  ex_date  TEXT NOT NULL,  -- 'YYYY-MM-DD', the ownership-transfer date
  pay_date TEXT NOT NULL,  -- 'YYYY-MM-DD', when cash actually lands
  dps      REAL NOT NULL   -- USD per share
);`,
      seed: `-- as-of 2026-10-01 · KO carries TWO upcoming payouts (the fanout) ·
-- O's only dividend went ex 2026-09-15 but pays 2026-10-15: past ex, future pay ·
-- BRKB is a non-payer with no dividend rows at all
INSERT INTO dividends (symbol, ex_date, pay_date, dps) VALUES
  ('KO',  '2026-11-27', '2026-12-11', 0.48),
  ('KO',  '2027-02-26', '2027-03-12', 0.52),
  ('O',   '2026-09-15', '2026-10-15', 0.63),   -- past ex, future pay: the trap
  ('JNJ', '2026-11-24', '2026-12-08', 1.30);

-- 2 accounts x 3 symbols, plus account 1's 5-share BRKB stub that never pays
INSERT INTO holdings (account_id, symbol, shares) VALUES
  (1, 'BRKB',   5),
  (1, 'JNJ',   40),
  (1, 'KO',   150),
  (1, 'O',    200),
  (2, 'JNJ',   75),
  (2, 'KO',   300),
  (2, 'O',    100);`,
      tables: [
        { name: "holdings", note: "7 positions across 2 accounts — KO, O and JNJ held in both, plus account 1's 5-share BRKB stub that never pays" },
        { name: "dividends", note: "4 payout events — KO carries two upcoming ex-dates, O's single event went ex 2026-09-15, JNJ pays 2026-12-08" },
      ],
    },
    code: `WITH upcoming AS (
    -- dividends that have NOT yet gone ex: ownership locks at the EX date,
    -- so only strictly-future ex_dates are still upcoming income
    SELECT
        symbol,
        pay_date,
        dps
    FROM dividends
    WHERE ex_date > '2026-10-01'             -- strictly future: no lock-in yet
)
SELECT
    h.account_id,
    h.symbol,
    u.pay_date,
    h.shares,
    CAST(ROUND(h.shares * u.dps * 100) AS INTEGER) AS income_cents  -- dollars to cents
FROM holdings h
JOIN upcoming u ON u.symbol = h.symbol
ORDER BY u.pay_date ASC, h.account_id ASC, h.symbol ASC;`,
    walkthrough: [
      "The upcoming CTE filters the four dividend rows down to three: KO's 2026-11-27 and 2027-02-26 events and JNJ's 2026-11-24 event survive, while O's 2026-09-15 ex-date fails ex_date > '2026-10-01' and never enters the join. That single predicate is the whole calendar gate — pay dates (2026-12-11, 2027-03-12, 2026-12-08 and O's future 2026-10-15) play no role in filtering. BRKB is absent from dividends entirely, so it has nothing to match even before the gate runs.",
      "The join multiplies the surviving payouts across the seven holdings: JNJ matches 2 holdings (one row each), KO matches 2 holdings × 2 payouts (four rows), and O and BRKB match nothing — six rows in, six rows out. The income column scales and rounds each one: 40 × 1.30 × 100 = 5200 for account 1's JNJ and 75 × 1.30 × 100 = 9750 for account 2's, 150 × 0.48 × 100 = 7200 and 300 × 0.48 × 100 = 14400 for the December KO, then 7800 and 15600 for the March KO at 0.52. Every product lands on a whole cent, so CAST(ROUND(...)) is a formality — but the formality is the contract.",
      "ORDER BY pay_date ASC, account_id ASC, symbol ASC stacks 2026-12-08's JNJ rows first (account 1 then account 2), then 2026-12-11's KO pair, then 2027-03-12's KO pair. The two O holdings and the BRKB stub are silent — three of the seven holdings produce no row, and that silence is the report telling the truth about locked-in and non-paying positions. The snapshot is 6 rows of 5 columns, every cell integer or text, engine-pinned.",
    ],
    time: "O(h × d) — the gated join touches each holding against the surviving dividends (7 holdings × 3 upcoming payouts here); the ORDER BY sorts the 6-row result",
    space: "O(k) — the three upcoming payout rows plus the six joined result rows",
    followUps: [
      "Annualize the calendar: project each holding's yearly cash as the sum of its last four dividends × shares — which window or self-join collects a symbol's last four ex-dates, and what does account 2's KO read with only two events on file?",
      "Add a cost_basis_cents column to holdings and report yield on cost for every upcoming payout — where does the ×100 go when the denominator is already in cents, and how should zero-basis stubs like BRKB behave?",
      "Build a missing-dividend alert with an anti-join: which holdings' symbols have no strictly-future ex-date at all, and which three holdings does it flag on this seed (both O positions and the BRKB stub)?",
    ],
    related: ["portfolio-weights", "realized-pnl-average-cost", "settlement-fails-aging"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "max-drawdown",
    statement:
      "The nav table holds one row per portfolio per day: (portfolio_id, snap_date, nav), with nav a REAL USD value. Drawdown measures how far a day sits below the running peak — the largest nav seen so far THROUGH that day, window-ordered by snap_date — so a fresh high reads exactly 0.0 drawdown on the day it prints. For each portfolio, find the trough: the day whose drawdown_pct = 100.0 * (nav - running_peak) / running_peak is the most negative across the whole date range, plus the peak_date where that trough's running-peak value was FIRST reached. Report portfolio_id, max_drawdown_pct (the trough drawdown rounded to 2 decimals, a negative REAL), trough_date and peak_date, ordered by portfolio_id ascending.",
    examples: [
      {
        input: "portfolio 1 — 108.20 peak printed 2026-09-08, then 104.50 on 2026-09-10",
        output: "1 · -3.42 · 2026-09-10 · 2026-09-08",
        explanation:
          "drawdown_pct reads 100.0 * (104.50 - 108.20) / 108.20 = about -3.4196, and ROUND(..., 2) lands on -3.42; the trough's running peak of 108.20 was first reached on 2026-09-08, so that is the peak_date — not the trough's own date.",
      },
      {
        input: "portfolio 2 — 250.00 high on 2026-09-09, collapse to 229.75 on 2026-09-11",
        output: "2 · -8.1 · 2026-09-11 · 2026-09-09",
        explanation:
          "100.0 * (229.75 - 250.00) / 250.00 = -8.10 with no rounding needed; the recovery to 234.10 on 2026-09-12 still sits 6.36 below the peak, so the trough stays 2026-09-11.",
      },
    ],
    constraints: [
      "running_peak = MAX(nav) OVER (PARTITION BY portfolio_id ORDER BY snap_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) — the CURRENT day is included in its own peak, so every new high reads drawdown 0.0 on the day it prints",
      "drawdown_pct = 100.0 * (nav - running_peak) / running_peak, unrounded, negative or zero; the trough per portfolio is the MINIMUM drawdown_pct (most negative) and this seed guarantees a unique trough — no ties",
      "max_drawdown_pct = ROUND(trough drawdown_pct, 2) as a negative REAL; peak_date = MIN(snap_date) over days whose nav equals the trough row's running_peak with snap_date <= trough_date — argmax-by-value with an earliest-date tiebreak, always <= trough_date",
      "ORDER BY portfolio_id ASC — exactly one row per portfolio",
    ],
    primer: {
      hook:
        "Max drawdown is the number an investor checks before sleeping — the deepest fall from the highest peak the portfolio ever printed, the gap between the top of its equity curve and the floor beneath it.",
      concept: [
        "A fund's net asset value, written NAV, is the market value of everything it holds divided among its shares — here, simply one dollar figure marked once per day. Rising NAV tells the story of gains; it does not tell you what the ride felt like. Two portfolios can end a month at the same level while one never dipped more than a point and the other lost a tenth of its value on the way — and the investor who bailed out at the bottom lived through two entirely different products. Drawdown exists to measure that pain: how far the value sits below its best mark so far.",
        "The comparison is against the running peak, the largest NAV seen so far through the current day. The window includes the day itself, so every fresh high prints a drawdown of exactly 0.0 — a portfolio cannot sit below a record it just set — and day one is its own first peak. Any other day reads 100.0 * (NAV - running peak) / running peak, a negative percentage: 104.50 against a 108.20 peak is about -3.42 percent. The running peak only ever moves up, so the measure remembers every old high forever — a portfolio can claw back for years and still sit below water, underwater in the traders' phrase.",
        "The max drawdown is the most negative drawdown across the whole window — the deepest peak-to-trough fall, the pair of days where the equity curve, the value drawn day by day, dropped furthest below its running-max line. The two dates matter as much as the depth: the peak date says where the fall started, the trough date says where it landed, and the peak is found by looking back to the first day the trough's running-peak value was printed. A recovery that never regains the old high does not heal the number; the max drawdown stands until a new peak is set. That is why the report carries four columns — the depth, the trough, the peak behind it, and the portfolio they belong to.",
        "Two design choices keep the measure honest. Drawdown is stated in percent, not dollars, so a two-hundred-dollar portfolio and a two-million-dollar one compare on the same scale — the seed's -8.10 is worse than -3.42 no matter how large either book is. And the running peak turns the computation from comparing every pair of days — the fall from one day to a later day versus every other fall — into a single forward pass that carries one number per day, the best mark so far. State, not pairs, is the whole trick.",
      ],
      worked: [
        "Walk portfolio 1 from its seed rows: the NAV climbs 100.00, 101.30, 102.85 and keeps printing fresh highs, so each of those days reads a drawdown of exactly 0.0.",
        "The climb tops out at 108.20 on 2026-09-08 — its own running peak, so that day reads 0.0 too.",
        "On 2026-09-10 the NAV prints 104.50: drawdown = 100.0 * (104.50 - 108.20) / 108.20 = -3.4196 before rounding, the deepest reading of the twelve days.",
        "The recovery days 106.30 and 107.90 still sit below the 108.20 high, reading about -1.76 and -0.28 — better than the trough, so the trough stays 2026-09-10 and the answer rounds to -3.42.",
        "The peak date comes from looking back: 108.20 was first printed on 2026-09-08 and never again on or before the trough, so the row reads (1, -3.42, 2026-09-10, 2026-09-08).",
      ],
      glossary: [
        { term: "NAV", def: "net asset value — the market value of a portfolio expressed per share, marked once per day" },
        { term: "running peak", def: "the largest NAV observed so far through the current day, the day itself included" },
        { term: "drawdown", def: "how far below the running peak a day sits, stated as a negative percentage" },
        { term: "equity curve", def: "the portfolio's value plotted day by day — the line whose dips drawdown measures" },
        { term: "peak-to-trough", def: "the full fall from a highest mark to the lowest point reached before recovery" },
        { term: "trough", def: "the deepest day of a drawdown — the minimum of the drawdown curve" },
      ],
      reallife: [
        "Risk teams at asset managers and brokerages compute drawdown daily, and the number reaches the public: fund fact sheets print maximum drawdown beside volatility, and advisor dashboards at firms like Fidelity and Schwab show it for every model portfolio. Hedge funds live by a cousin of the same idea — the high-water mark, the running peak that decides when performance fees may be charged again, so a manager cannot bill twice for the same gains. The arithmetic behind it concentrates minds: a fund that loses 30 percent must earn roughly 43 percent just to get back to even.",
        "What breaks in practice: missing days make the running peak skip a high that should have counted, corporate actions reset the NAV series and fake a cliff, and funds that mark only at month-end hide the pain that happened in between. Analysts also argue about the window — since inception versus a rolling three years — and about close marks versus intraday lows, which can nearly double the measured depth. The decisions the number drives are hard ones: risk limits that force de-risking at a drawdown threshold, gate provisions that suspend withdrawals, and the plain question of whether a strategy's worst fall is one an investor would actually sit through.",
      ],
      where:
        "Portfolio-risk and quant analytics interviews — Fidelity, Schwab, Robinhood, BlackRock, Two Sigma — ask running-peak and max-drawdown SQL for risk and wealth-performance roles.",
    },
    breakdown: [
      "Drawdown is state, not pairs: each day's drawdown depends on one number, the largest nav seen up to and including that day, and a window MAX over an ordered partition computes exactly that. The frame matters — ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW includes the current row, which is what makes a fresh high read 0.0 on the day it prints: on 2026-09-08 portfolio 1 prints 108.20, its own running peak, and 100.0 * (108.20 - 108.20) / 108.20 = 0.0. P2's climb tells the same story at 250.00 on 2026-09-09. A peak that excluded the current day would turn every new high into a positive pseudo-drawdown and hand day 1 a NULL peak — wrong state, probed below.",
      "The trough is an argmin over a negative-or-zero column: MIN(drawdown_pct) per portfolio picks the most negative day, and the seed guarantees that value is unique so the join-back stays single-row. The classic misstep runs the aggregation the wrong way — MAX(drawdown_pct) on a column where every new-high day reads exactly 0.0 ties seven days per portfolio and blows the two-row report into fourteen. Selecting on the ROUNDED drawdown is subtler: ROUND is monotone, so the argmin can never flip, but it can TIE — two troughs inside one cent would both match. This seed keeps every rounded candidate drawdown distinct (-3.42 against -1.34, -8.10 against -3.36), so rounding first coincides here; the unrounded selection is still the contract.",
      "peak_date is the join-back's real work: the trough row carries its running_peak value, and the first date that value was reached is MIN(snap_date) over days whose nav equals it on or before the trough date. Equality on REALs is safe here for a structural reason — MAX over a window hands back one of the stored nav values bit-for-bit, and the correlated subquery compares that same stored double, so 108.20 matches 108.20 exactly. The same discipline picks the trough row itself: joining dd back on drawdown_pct = MIN(drawdown_pct) compares a computed double against the MIN of the identical expression, which is the same double. Swap the comparison to the trough's own nav and both peak_dates collapse onto the trough dates — the documented misstep, probed.",
    ],
    edges: [
      "Dates are unique here, so the default RANGE frame agrees with ROWS — the dangerous variant is a frame that EXCLUDES the current row: portfolio 1's 2026-09-08 new high then reads 100.0 * (108.20 - 107.25) / 107.25 = about +0.8858 instead of 0.00, and portfolio 2's 2026-09-09 reads about +1.4199. The final answer survives that misstep on this seed only because a positive drawdown can never win a MIN — probed, coincidence documented.",
      "Day 1 under the excluded frame has no prior rows, so MAX returns NULL and drawdown_pct goes NULL — MIN silently ignores it, one more reason the wrong frame can look harmless.",
      "MAX instead of MIN is the loudest failure: every new-high day reads exactly 0.0, seven days tie per portfolio, and the report ships fourteen zero-drawdown rows instead of two troughs (probed).",
      "Rounding before selecting cannot flip the argmin (ROUND is monotone) but it can tie it: this seed keeps every rounded candidate distinct, so the round-first variant coincides here (probed) — a seed with two candidates inside one cent would need the unrounded MIN to stay single-row.",
      "The peak-equality join is exact only because MAX returns a stored value: any arithmetic on the peak (re-rounding, recomputing, averaging) would produce a nearby-but-different double and the correlated subquery would silently find no match.",
    ],
    ladder: [
      { title: "Brute force — scan every pair", body: "For every pair of days i <= j, treat day i's nav as a peak candidate and compute (nav_j - nav_i) / nav_i, keeping the most negative across all pairs. Twelve days means 78 pairs per portfolio by hand; the pair count squares as history grows, and nothing in the scan remembers that the peak only ever moves forward." },
      { title: "The pattern — running max, then argmin, then join back", body: "One window pass stamps running_peak on every row, a second layer turns it into drawdown_pct, and a GROUP BY MIN finds each portfolio's trough. Joining the trough value back to the drawdown rows recovers the trough date, and a correlated MIN(snap_date) recovers the peak date." },
      { title: "The optimal idea — drawdown is state, not pairs", body: "A running max converts the O(n^2) pair scan into one ordered pass per portfolio, because the best peak for any day is always the max of everything before and including it. The join-back touches only two rows, so the whole report is linear in the snapshot count plus one sort." },
    ],
    approach: "window MAX as a running peak (current day included), unrounded drawdown_pct, per-portfolio MIN as the trough, join back on the value for trough_date and a correlated MIN(snap_date) for peak_date",
    schema: {
      ddl: `CREATE TABLE nav (
  portfolio_id INTEGER NOT NULL,
  snap_date    TEXT NOT NULL,  -- 'YYYY-MM-DD', one snapshot per day
  nav          REAL NOT NULL   -- USD, 2dp values
);`,
      seed: `-- P1 climbs to a 108.20 peak on 2026-09-08, dips to 104.50 on 09-10 and
-- recovers only to 107.90: trough dd = 100.0 * (104.50 - 108.20) / 108.20
-- P2 climbs to 250.00 on 2026-09-09 then collapses to 229.75 on 09-11:
-- 100.0 * (229.75 - 250.00) / 250.00 = -8.10 exactly
INSERT INTO nav (portfolio_id, snap_date, nav) VALUES
  (1, '2026-09-01', 100.00),
  (1, '2026-09-02', 101.30),
  (1, '2026-09-03', 102.85),
  (1, '2026-09-04', 102.10),
  (1, '2026-09-05', 104.40),
  (1, '2026-09-06', 105.90),
  (1, '2026-09-07', 107.25),
  (1, '2026-09-08', 108.20),   -- P1 peak
  (1, '2026-09-09', 106.75),
  (1, '2026-09-10', 104.50),   -- P1 trough
  (1, '2026-09-11', 106.30),
  (1, '2026-09-12', 107.90),
  (2, '2026-09-01', 232.40),
  (2, '2026-09-02', 235.10),
  (2, '2026-09-03', 238.65),
  (2, '2026-09-04', 237.20),
  (2, '2026-09-05', 241.30),
  (2, '2026-09-06', 243.85),
  (2, '2026-09-07', 246.50),
  (2, '2026-09-08', 244.10),
  (2, '2026-09-09', 250.00),   -- P2 peak
  (2, '2026-09-10', 241.60),
  (2, '2026-09-11', 229.75),   -- P2 trough
  (2, '2026-09-12', 234.10);`,
      tables: [
        { name: "nav", note: "24 daily snapshots — 12 days per portfolio over 2026-09-01 to 2026-09-12, every nav distinct inside a portfolio" },
      ],
    },
    code: `WITH seq AS (
    -- the running peak INCLUDES the current day: a fresh high sits at 0.0
    -- drawdown on the day it prints, and day 1 is its own first peak
    SELECT
        portfolio_id,
        snap_date,
        nav,
        MAX(nav) OVER (
            PARTITION BY portfolio_id
            ORDER BY snap_date
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS running_peak
    FROM nav
),
dd AS (
    -- unrounded drawdown in percent: negative below the peak, 0.0 at highs
    SELECT
        portfolio_id,
        snap_date,
        nav,
        running_peak,
        100.0 * (nav - running_peak) / running_peak AS drawdown_pct
    FROM seq
),
trough AS (
    -- the most negative drawdown per portfolio — the seed pins a unique trough
    SELECT
        portfolio_id,
        MIN(drawdown_pct) AS max_dd
    FROM dd
    GROUP BY portfolio_id
)
SELECT
    t.portfolio_id,
    ROUND(t.max_dd, 2) AS max_drawdown_pct,
    p.snap_date AS trough_date,
    (
        -- first day the trough's peak value was reached, on or before the trough
        SELECT MIN(n2.snap_date)
        FROM nav n2
        WHERE n2.portfolio_id = p.portfolio_id
          AND n2.nav = p.running_peak
          AND n2.snap_date <= p.snap_date
    ) AS peak_date
FROM trough t
JOIN dd p ON p.portfolio_id = t.portfolio_id AND p.drawdown_pct = t.max_dd
ORDER BY t.portfolio_id ASC;`,
    walkthrough: [
      "Portfolio 1's window walks the climb: 100.00 opens as its own peak (drawdown 0.0), 101.30 and 102.85 print fresh highs, the 102.10 dip on 09-04 reads about -0.73, and then 104.40, 105.90, 107.25 and 108.20 each reset the peak to a zero drawdown in turn. After the 108.20 high on 09-08 the declines stack against it: 106.75 reads about -1.34, and 09-10's 104.50 reads 100.0 * (104.50 - 108.20) / 108.20 = about -3.4196 before rounding, the deepest value in the partition. The recovery never repairs the damage — 106.30 and 107.90 stay below the old high — so the trough is 2026-09-10 and its rounded drawdown is -3.42.",
      "Portfolio 2 runs the same machine with a harder fall: the climb to 250.00 on 09-09 keeps every new high at 0.0 (the 237.20 and 244.10 dips read about -0.61 and -0.97 against earlier peaks), then 241.60 reads exactly -3.36 and 09-11's 229.75 reads 100.0 * (229.75 - 250.00) / 250.00 = -8.10 with no rounding needed. The bounce to 234.10 on 09-12 still sits 6.36 below the peak, so the trough stays 2026-09-11. P2's -8.10 is deeper than P1's -3.42, but the report is per portfolio — each row answers for its own history.",
      "The join-back pins both dates: trough holds each portfolio's raw minimum double, and joining dd on drawdown_pct = max_dd lands on exactly one row per portfolio — 09-10 for P1, 09-11 for P2. peak_date runs the correlated MIN(snap_date) against the trough row's running_peak: P1's 108.20 was first printed on 09-08 and never again on or before 09-10, and P2's 250.00 on 09-09. ROUND(..., 2) fires once at the end, so the snapshot reads (1, -3.42, 2026-09-10, 2026-09-08) and (2, -8.1, 2026-09-11, 2026-09-09) — two rows, engine-pinned cell by cell.",
    ],
    time: "O(n log n) over the n snapshot rows — one ordered window pass, one GROUP BY over 24 rows, two join-backs on 2-row sets",
    space: "O(n) — the seq and dd layers materialize 24 rows each before the trough fold",
    followUps: [
      "Add a recovery_date: the first day after the trough on which nav regains the running peak — what window or self-join finds it, and does either portfolio recover inside this window?",
      "Emit the full underwater curve: every day's drawdown_pct rounded to 2 decimals beside its date — how many rows does each portfolio contribute, and which day is P2's second-deepest?",
      "Roll the computation up from positions: join a daily marks table to weights and compute a portfolio-of-portfolios drawdown — where must the peak reset between constituents?",
    ],
    related: ["year-on-year-growth-rate", "portfolio-weights", "rolling-average-steps"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "duplicate-charge-pairs",
    statement:
      "The charges table logs one row per card authorization: (charge_id, card_id, merchant, amount_cents, charged_at), and a double-submission slip re-runs the exact same charge within seconds. Flag every POSSIBLE double-charge: two DISTINCT charges with the same card_id, the same merchant and the same amount_cents whose charged_at values sit 0 to 120 seconds apart — inclusive on both ends, measured as strftime('%s', charged_at) epoch seconds, integers rather than julianday floats. Report the ordered pairs as charge_id_a, charge_id_b and seconds_apart, with a always the earlier-or-tied side and the charge_id tiebreak keeping each unordered pair unique even when two timestamps are identical. A pair 121 seconds apart is outside the window, and charges differing on any of the three equality keys never pair. Order by the a-side charged_at ascending, then charge_id_a, then charge_id_b — the sort key charged_at_a need not be projected.",
    examples: [
      {
        input: "card 1 taps the same Coffee merchant for 425 cents at 10:00:00, 10:01:30 and 10:03:20",
        output: "101 · 102 · 90, then 102 · 103 · 110",
        explanation:
          "A-B sits 90 seconds apart and B-C 110 — both inside the window — but A-C is 200 seconds, so the chain yields two pairs, not the three a clique-read would claim.",
      },
      {
        input: "card 5 submits two Taxi charges for 3200 cents at the identical instant 2026-10-07 08:15:00",
        output: "170 · 171 · 0",
        explanation:
          "Zero seconds apart still qualifies (0 is the inclusive floor) and the charge_id tiebreak — 170 < 171 at equal timestamps — reports the double-submission exactly once.",
      },
    ],
    constraints: [
      "seconds_apart = strftime('%s', b.charged_at) - strftime('%s', a.charged_at) — INTEGER epoch seconds, never julianday floats; the window is 0 <= seconds_apart <= 120, inclusive on both ends (a pair exactly 120 apart qualifies, 121 does not)",
      "pair identity: a.charged_at <= b.charged_at AND (a.charged_at < b.charged_at OR a.charge_id < b.charge_id) AND a.charge_id <> b.charge_id — each unordered pair exactly once, even when the two timestamps tie",
      "the equality triple must all hold: same card_id, same merchant, same amount_cents — a mismatch on any one of the three kills the pair",
      "output exactly charge_id_a, charge_id_b, seconds_apart; ORDER BY a.charged_at ASC (the unprojected sort key), then charge_id_a ASC, then charge_id_b ASC",
    ],
    primer: {
      hook:
        "A duplicate charge is the same purchase landing twice, seconds apart — the pair detector is the safety net that catches it before the customer opens their banking app and gets angry.",
      concept: [
        "Every card payment begins as an authorization: the merchant asks the card network to reserve money, and the approval becomes a charge row stamped with a timestamp. A duplicate happens when that request fires twice — a double-tap on a kiosk screen, a retry after a timeout, a form submitted again — and the network sees two identical reservations for one real purchase. Identical means all three fingerprints match: same card, same merchant, same amount, the equality triple. The cost of a missed duplicate is a support ticket; the cost of a false accusation is a declined legitimate purchase — so the detector has to be precise about what it compares.",
        "Time is the discriminator. The same card buying the same coffee for the same price on Monday and on Thursday is a habit, not an error — so duplicates are flagged only when the two charges sit inside a short window, here 0 to 120 seconds, inclusive on both ends. Both edges carry meaning: the floor of 0 admits a true double-submission, which prints two rows at the very same second, and the inclusive ceiling means a pair exactly 120 seconds apart still counts while 121 seconds does not. Channels tune the window — tap-to-pay retries land within seconds, while a human re-entering payment details might take minutes.",
        "Comparing every charge with every other produces each pair twice — A against B and B against A — so a detector needs a pair identity rule that prints each unordered pair once: order the two sides by time, and when the timestamps tie, order them by charge id, so a same-second pair reports as 170 then 171 and never both ways. Windows also do not chain. Three taps at 10:00:00, 10:01:30 and 10:03:20 put each neighbor inside 120 seconds of the next, yet the outer pair sits 200 seconds apart — a chain of near neighbors is not a clique, one big group where everything pairs with everything, and the first and third taps are different shopping trips. Each pair is judged on its own gap, never on transitive proximity.",
        "The clock arithmetic is where naive implementations leak. Timestamps arrive as text, and float date math can drift by a fraction of a second — enough to turn a true 90-second gap into 89.99999 and flip a boundary decision. Converting each timestamp to epoch seconds — the count of whole seconds since 1970-01-01 00:00:00 — makes every gap an integer, and integer minus integer is exact: 90 reads as 90, and a 120-second pair reads as exactly 120. Exact integers are what make the window's edges sharp, which is the entire point of an inclusive boundary.",
      ],
      worked: [
        "Card 1 taps the same Coffee merchant for 425 cents at 10:00:00, 10:01:30 and 10:03:20 — charges 101, 102 and 103, identical on all three equality keys.",
        "The gaps: 101 to 102 is 90 seconds and 102 to 103 is 110, both inside 0 to 120, so both pair; 101 to 103 is 200 seconds, outside, so it never does — two pairs from a three-tap chain, not three.",
        "Card 6's Grocer pair sits exactly 120 seconds apart, 09:30:00 to 09:32:00: the inclusive ceiling keeps it, while card 7's Books pair at 14:00:00 to 14:02:01 reads 121 and dies at the wall.",
        "Card 5's Taxi double-submission prints two rows at the identical second: the gap is 0, the inclusive floor keeps it, and the charge-id tiebreak orders it 170 before 171 so it reports exactly once.",
        "The survivors: (101, 102, 90), (102, 103, 110), (110, 111, 45), (120, 121, 120) and (170, 171, 0) — five rows, with the Ride pair's 45-second gap the ordinary quick-retry case.",
      ],
      glossary: [
        { term: "authorization", def: "the moment a merchant asks the card network to reserve money, producing one charge row" },
        { term: "double-submission", def: "the same payment request fired twice within moments, creating two identical charges" },
        { term: "equality triple", def: "the three keys that must all match for two charges to compare at all — card, merchant, amount" },
        { term: "duplicate window", def: "the maximum seconds two charges may sit apart and still count as possible duplicates — here 120, inclusive" },
        { term: "epoch seconds", def: "seconds elapsed since 1970-01-01 00:00:00 — an integer clock that makes gaps exact" },
        { term: "pair identity", def: "the ordering rule — earlier timestamp first, charge-id tiebreak on ties — that prints each unordered pair once" },
      ],
      reallife: [
        "Payments-risk teams at processors and acquirers — Stripe, Adyen, PayPal and their peers — run duplicate detection as a standing sweep between authorization and settlement, because a duplicate that settles becomes a refund request and a dispute, a chargeback, that the merchant may lose. The same query shape powers consumer-facing features: banking apps that badge a likely double-tap before the customer notices it, and merchant dashboards that hold a suspicious charge for review. Volume makes the engineering real — one hot card or busy merchant can produce thousands of same-amount charges a day — so the equality keys prune the comparison long before the clock runs.",
        "What breaks in practice: legitimate retried payments — a parking meter re-billing after a gateway timeout — look exactly like duplicates, so teams tune the window per merchant category and route flagged pairs to review rather than auto-refund. Chains are the quiet miss: a burst of three identical taps yields two pairs, and an incident team that counts pairs undercounts the event unless it clusters the chain first. The numbers drive hard decisions — block the second charge before capture, refund proactively, or fight the dispute — and every one of them is only as good as the pair rule's handling of ties and window edges.",
      ],
      where:
        "Payments and risk-analytics interviews — Stripe, Adyen, PayPal, Square, Chime — ask duplicate-charge and pair-detection SQL for payments-risk and fraud-operations roles.",
    },
    breakdown: [
      "Double-charge detection is a self-join with an equality triple and a clock: charges a and b pair when card_id, merchant and amount_cents all match and the epoch-seconds gap between them stays within 120. The clock is where the epoch lesson pays off — strftime('%s', charged_at) returns INTEGER epoch seconds, so a 90-second gap reads as exactly 90, while the julianday path subtracts two ~2.4-million-day REALs and reads the same gap as 89.99999463558197 — not 90. Integer gaps make the boundary clean: BETWEEN 0 AND 120 includes the exact-120 pair and excludes the 121-second one without a float in sight. The zero floor matters as much as the ceiling — a true double-submission prints twice at the same second, gap 0, and must still pair.",
      "The pair-identity rule is the craft: a.charged_at <= b.charged_at orders the pair, and (a.charged_at < b.charged_at OR a.charge_id < b.charge_id) breaks the tie when timestamps are equal, so every unordered pair prints exactly once. Drop the ordering rule and the symmetric self-join prints both (101, 102) and (102, 101) — ten rows instead of five. Drop only the tiebreak (keeping a.charged_at < b.charged_at strict) and the same-second pair on card 5 vanishes, because 08:15:00 < 08:15:00 is false in both directions. The charge_id inequality a.charge_id <> b.charge_id guarantees a never pairs with itself.",
      "The window is a chain, not a clique: card 1's three Coffee taps sit 90, 110 and 200 seconds apart end to end, and only the two adjacent hops fit inside 120 — A-C at 200 seconds is a different shopping session, not a double. That is where duplicate detection quietly differs from clustering: two charges pair on their OWN gap, never on transitive proximity. The boundary itself gets planted data — one pair exactly 120 seconds apart (which qualifies, the inclusive ceiling) and one at 121 (which does not) — so the seed grades the difference between <= and <. Write the upper bound as seconds_apart < 120 and the 120-second pair silently disappears.",
    ],
    edges: [
      "The chain teaches window ≠ clique: A-B (90s) and B-C (110s) qualify, A-C (200s) does not — the report carries two card-1 rows, and a transitive-closure read would claim three.",
      "The inclusive ceiling is graded by data: charges 120 and 121 sit exactly 120 seconds apart and pair, while 130 and 131 at 121 seconds never do — a strict < 120 rewrite drops the 120 pair (probed).",
      "Same-second duplicates need the charge_id tiebreak: card 5's pair shares the timestamp 2026-10-07 08:15:00 exactly, and a.charged_at < b.charged_at alone can never order it (probed — the pair vanishes).",
      "Cross-card look-alikes must not pair: charges 140 and 141 share merchant, amount_cents and even the timestamp, but card_id 3 vs 4 fails the triple — the equality is on all three keys, never on the timestamp alone.",
      "Dropping the merchant key re-pairs the whole group rather than adding one row: Cafe's 160 pairs with 101 (20 seconds) as a b-side AND with 102 (70 seconds) as an a-side — 7 rows instead of 5 (probed).",
    ],
    ladder: [
      { title: "Brute force — every pair by hand", body: "Sort each card's charges by time and compare every pair within two minutes, checking merchant and amount as you go. Fifteen charges is traceable; a production day of authorizations is not, and the hand scan double-counts the moment you forget to keep pairs ordered." },
      { title: "The pattern — equality self-join with an ordered pair rule", body: "Join charges to itself on card_id, merchant and amount_cents, order the pair with the charged_at-then-charge_id rule, and filter the epoch gap to BETWEEN 0 AND 120. One statement, no window functions needed — the pair rule does the deduplication." },
      { title: "The optimal idea — pair identity and exact integers", body: "O(n^2) worst case on a single hot card, but the equality triple prunes most of the grid before the clock runs. The durable rules: integer epoch seconds for clocks, an explicit asymmetric ordering rule for pair identity, and data planted at both window edges so the boundary grades itself." },
    ],
    approach: "self-join on card_id + merchant + amount_cents, ordered by charged_at then charge_id so each pair prints once, epoch-seconds gap BETWEEN 0 AND 120 inclusive, sorted by the a-side timestamp",
    schema: {
      ddl: `CREATE TABLE charges (
  charge_id    INTEGER PRIMARY KEY,
  card_id      INTEGER NOT NULL,
  merchant     TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  charged_at   TEXT NOT NULL   -- 'YYYY-MM-DD HH:MM:SS'
);`,
      seed: `-- the chain: 3 identical Coffee taps on card 1 — the 90s and 110s hops fit
-- the window, the 200s A-C span does not (a chain, not a clique) ·
-- 120/121 plant the inclusive ceiling (120s pairs, 121s does not) ·
-- 130/131 sit 121s apart and never pair · 140/141 are a cross-card decoy ·
-- 150 is an amount mismatch, 160 a merchant mismatch · 170/171 are the
-- same-second double-submission
INSERT INTO charges (charge_id, card_id, merchant, amount_cents, charged_at) VALUES
  (101, 1, 'Coffee',  425, '2026-10-05 10:00:00'),
  (102, 1, 'Coffee',  425, '2026-10-05 10:01:30'),
  (103, 1, 'Coffee',  425, '2026-10-05 10:03:20'),
  (110, 2, 'Ride',   1899, '2026-10-05 12:05:00'),
  (111, 2, 'Ride',   1899, '2026-10-05 12:05:45'),
  (120, 6, 'Grocer', 5500, '2026-10-06 09:30:00'),
  (121, 6, 'Grocer', 5500, '2026-10-06 09:32:00'),
  (130, 7, 'Books',  2200, '2026-10-06 14:00:00'),
  (131, 7, 'Books',  2200, '2026-10-06 14:02:01'),
  (140, 3, 'Stream', 1499, '2026-10-06 18:00:00'),
  (141, 4, 'Stream', 1499, '2026-10-06 18:00:00'),
  (150, 2, 'Ride',   1850, '2026-10-05 12:06:00'),
  (160, 1, 'Cafe',    425, '2026-10-05 10:00:20'),
  (170, 5, 'Taxi',   3200, '2026-10-07 08:15:00'),
  (171, 5, 'Taxi',   3200, '2026-10-07 08:15:00');`,
      tables: [
        { name: "charges", note: "15 authorizations — a 3-tap Coffee chain on card 1, a clean Ride pair on card 2, a 120s boundary pair (Grocer), a 121s miss (Books), a cross-card decoy (Stream), an amount mismatch, a merchant mismatch and a same-second Taxi double" },
      ],
    },
    code: `SELECT
    a.charge_id AS charge_id_a,
    b.charge_id AS charge_id_b,
    strftime('%s', b.charged_at) - strftime('%s', a.charged_at) AS seconds_apart
FROM charges a
JOIN charges b
  ON a.card_id = b.card_id               -- the equality triple, all three keys
 AND a.merchant = b.merchant
 AND a.amount_cents = b.amount_cents
 AND a.charged_at <= b.charged_at        -- order the pair: a is earlier or tied
 AND (a.charged_at < b.charged_at OR a.charge_id < b.charge_id)  -- the tiebreak
 AND a.charge_id <> b.charge_id          -- never pair a charge with itself
WHERE strftime('%s', b.charged_at) - strftime('%s', a.charged_at) BETWEEN 0 AND 120
ORDER BY a.charged_at ASC, a.charge_id ASC, b.charge_id ASC;`,
    walkthrough: [
      "The join keys on the equality triple first: card 1's Coffee group holds charges 101, 102 and 103 (425 cents each), card 2's Ride group holds 110 and 111 (1899), card 6's Grocer pair 120 and 121 (5500), card 7's Books pair 130 and 131 (2200) and card 5's Taxi pair 170 and 171 (3200) — while 140 and 141 split across cards 3 and 4, 150 carries 1850 against Ride's 1899, and 160 carries Cafe against Coffee. The candidate set is small precisely because the triple prunes before the clock runs — nothing outside a group ever reaches the gap filter. The ordering rule then deduplicates directions: within the Coffee group, (101, 102), (101, 103) and (102, 103) are the only ordered candidates, each printed once.",
      "The epoch window then filters the candidates: 102 minus 101 reads 90 and 103 minus 102 reads 110, both inside 0 to 120, but 103 minus 101 reads 200 and drops — the chain contributes two rows, not three. Ride's gap reads 45, Grocer's 121 minus 120 reads exactly 120 and survives the inclusive ceiling, Books' 131 minus 130 reads 121 and dies at the wall, and Taxi's 171 minus 170 reads 0 — the double-submission, kept by the charge_id tiebreak when the strict timestamp comparison cannot order it. Five rows survive: (101, 102, 90), (102, 103, 110), (110, 111, 45), (120, 121, 120) and (170, 171, 0).",
      "ORDER BY a.charged_at ASC, a.charge_id ASC, b.charge_id ASC sorts by the a-side timestamp without projecting it — 10:00:00 puts (101, 102) first, 10:01:30 puts (102, 103) second, then 12:05:00, then 2026-10-06 09:30:00 and finally the 2026-10-07 same-second pair. seconds_apart is an INTEGER in every row because strftime('%s') returns integer-valued seconds and integer minus integer stays integer. The decoys stay quiet: no cross-card, wrong-amount, wrong-merchant or 121-second row appears anywhere in the snapshot.",
    ],
    time: "O(n^2) worst case over the n charges inside one card-merchant-amount group (3 Coffee taps here); the equality triple prunes every cross-group cell before the clock is consulted",
    space: "O(p) — the p surviving pairs (five here), ordered at the end",
    followUps: [
      "Label clusters instead of pairs: run islands over the pair graph so A-B-C becomes one incident — which recursive CTE or window walks the chain, and does the Ride pair stay its own cluster?",
      "Track a duplicate rate per card per day: duplicates divided by total charges — which denominator counts charges 150 and 160 even though they pair with nothing, and what does card 1's rate read on 2026-10-05?",
      "Exclude refund-linked reversals: pair each charge with a negative amount_cents entry and drop pairs where either side was reversed — which anti-join keeps the report honest without losing the true double-submission?",
    ],
    related: ["top-percentile-fraud", "settlement-fails-aging", "gl-reconciliation"],
    order: "exact",
    xp: 20,
  },
];
