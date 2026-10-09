// Deep-dives — Quant desk B file: beta vs benchmark, split-adjusted positions
// and wash-trade pairs (3 problems: 1 Hard, 2 Medium; dive 1 is a single-row
// order:"any" read, dives 2-3 are order:"exact" reads). Every money column is
// INTEGER cents with the _cents suffix, timestamps are INTEGER epoch seconds,
// and REAL is reserved for returns and percentages; own tables, own seeds,
// original phrasing — never copied problem text.
// Registry wiring (lead): 8046 beta-benchmark ·
// 8047 split-adjusted-position · 8048 wash-trade-detection.
import type { LcSqlDive } from "../types";

export const SQL_DF_QUANT_B: LcSqlDive[] = [
  {
    slug: "beta-benchmark",
    statement:
      "The daily_returns table holds 24 consecutive trading days: (r_date, asset_return_pct, benchmark_return_pct), both return columns in percent. Beta is the risk dial that says how many percent the asset tends to move for every 1 percent the benchmark moves, estimated here as the slope of asset returns on benchmark returns. Using the POPULATION moments over all n rows (divide by n, never n - 1), report covariance = (SUM(x*y) - SUM(x) * SUM(y) / n) / n, benchmark_variance = (SUM(y*y) - SUM(y) * SUM(y) / n) / n and beta = (n * SUM(x*y) - SUM(x) * SUM(y)) / (n * SUM(y*y) - SUM(y) * SUM(y)), with x the asset column and y the benchmark column. Style classifies the RAW, unrounded beta: above 1.05 reads 'aggressive', below 0.95 reads 'defensive', otherwise 'market-like' — the ROUND(beta, 4) lives only in the projection. Output exactly ONE row: n_days, covariance rounded to 6 decimals, benchmark_variance rounded to 6 decimals, beta rounded to 4 decimals and style.",
    examples: [
      {
        input:
          "the full 24-day window — the benchmark alternates mild moves (+1.2, -0.8, +0.5, -1.1 with variation) while the asset tracks at roughly 1.4 times the benchmark plus noise no larger than 0.15",
        output: "24 · 1.207988 · 0.845399 · 1.4289 · aggressive",
        explanation:
          "The pinned aggregates over all 24 rows are SUM(x) = -1.21, SUM(y) = -0.7, SUM(y*y) = 20.31 and SUM(x*y) = 29.027, giving covariance 1.207987847, benchmark_variance 0.845399306 and raw beta 1.4288962 — the projected row reads 24, 1.207988, 0.845399, 1.4289 and style 'aggressive' because the RAW ratio clears 1.05.",
      },
      {
        input: "the style gate — the raw beta ratio computes to 1.4288962, comfortably past the 1.05 aggressive line",
        output: "1.4289 · aggressive",
        explanation:
          "The CASE tests the RAW ratio 1.4288962 against 1.05 and 0.95 before any rounding; the projection then displays the same ratio as 1.4289 at 4 decimals, so rounding never feeds back into the label.",
      },
    ],
    constraints: [
      "population moments only: every pinned formula divides by n (n = 24 here), never by n - 1 — the sample (n-1) variant moves the covariance and variance cells but leaves beta itself unchanged, since the n/(n-1) factor cancels in the ratio",
      "pinned formulas: covariance = (SUM(x*y) - SUM(x) * SUM(y) / n) / n, benchmark_variance = (SUM(y*y) - SUM(y) * SUM(y) / n) / n, and beta computed in the one-step raw form (n * SUM(x*y) - SUM(x) * SUM(y)) / (n * SUM(y*y) - SUM(y) * SUM(y))",
      "style reads the RAW beta with exclusive thresholds: > 1.05 'aggressive', < 0.95 'defensive', else 'market-like' — rounding to 4 decimals happens only in the projection and must not feed the CASE",
      "both return columns are REAL percents (1.2 means +1.2 percent); the window is the whole table with no date filtering, and exactly one row ships",
    ],
    primer: {
      hook: "Beta is the one number that tells a client whether their money rides the market's swings or shrugs them off.",
      concept: [
        "Every portfolio lives next to a benchmark — an index, like a broad market average, that stands in for 'the market' as a whole. Some holdings amplify whatever the market does, others dampen it, and beta is the number that measures which. Read it as an exchange rate: a beta of 1.4 says that when the benchmark moves 1 percent, the portfolio tends to move 1.4 percent in the same direction, while a beta of 0.6 says it tends to move only 0.6 percent. The word 'tends' carries weight — beta summarizes an average relationship over many days, not a promise about any single day.",
        "The estimate comes from two window statistics. Covariance asks: on days the benchmark moved above its own average, did the asset also move above its own average, and by how much did they move in concert? Variance asks the narrower question of how far the benchmark itself swings around its mean. Dividing the first by the second yields the slope of the straight line that best fits asset returns against benchmark returns — the picture is a scatter cloud of daily pairs and beta is the tilt of the line through it. Because the division cancels the benchmark's units, beta is a pure multiplier with no units of its own.",
        "The bands make it a risk dial. A beta near 1.0 is market-like: the portfolio behaves like a plain slice of the market's ups and downs. Above 1.0 (aggressive) the portfolio borrows the market's moves and multiplies them — bigger gains in rallies, deeper losses in drawdowns — while below 1.0 (defensive) it mutes them. A negative beta, rare and much sought after, would move against the market and act as a natural hedge.",
        "CAPM, the Capital Asset Pricing Model, turns the dial into a one-line promise: expected return = risk-free rate + beta × market premium, where the premium is the extra return the whole market is expected to pay above the risk-free rate for bearing its risk. High-beta capital should therefore earn more on average, because it suffers more in bad times and the extra expected return is the compensation. Treat the model as a benchmark for thinking rather than a law of nature: betas are estimated from noisy history and drift as businesses and leverage change.",
      ],
      worked: [
        "Take a tiny 4-day window: benchmark returns +2, -1, +1, -2 percent and asset returns +3, -1.5, +1.5, -3 percent — the asset visibly moves 1.5 times the benchmark every single day.",
        "Both means are 0, so the population covariance is the average of the daily products: (2*3 + (-1)*(-1.5) + 1*1.5 + (-2)*(-3)) / 4 = 15 / 4 = 3.75.",
        "The benchmark's population variance is the average of its squares: (4 + 1 + 1 + 4) / 4 = 2.5.",
        "Beta = 3.75 / 2.5 = 1.5 — exactly the exchange rate the raw numbers show, with no regression machinery needed.",
        "Classify by the bands: 1.5 sits above 1.05, so this window labels the asset 'aggressive' — and the displayed beta would be 1.5 exactly, rounding or not.",
      ],
      glossary: [
        { term: "beta", def: "the slope of a portfolio's returns against its benchmark's returns" },
        { term: "benchmark", def: "the market index a portfolio is measured against, such as a broad equity index" },
        { term: "covariance", def: "how two return series move together around their respective averages" },
        { term: "variance", def: "the average squared distance of a series from its own mean" },
        { term: "CAPM", def: "a one-line pricing model: expected return equals the risk-free rate plus beta times the market premium" },
        { term: "market premium", def: "the extra return the whole market is expected to pay above the risk-free rate" },
      ],
      reallife: [
        "At an asset manager this number is produced nightly by the risk team, one beta per portfolio per benchmark, feeding the morning reports portfolio managers read before the open. A fund mandated to be defensive gets challenged the moment its rolling beta drifts above its band, and a leveraged fund wears its 1.8 openly. The same print decides hedge sizing: to neutralize market risk a desk shorts roughly beta times the portfolio's notional in index futures.",
        "What breaks: betas estimated on a quiet two-month window look tame and then explode in a selloff, when everything correlates toward 1 at once. Rebalancing, new positions or borrowed leverage move the dial without anyone touching the report, so desks track rolling windows and alarm on drift. The number drives real decisions — capital charges, fund labeling, margin calls and who gets blamed when a defensive book loses like the market.",
      ],
      where: "Risk analysts, portfolio managers and quant researchers at asset managers, hedge funds and robo-advisors are asked to compute, interpret and defend beta.",
    },
    breakdown: [
      "The ask is one row of window moments, and the two statistics behind it have crisp meanings. Covariance is the average co-movement of the (asset, benchmark) pairs around their own means — it is large when above-average benchmark days line up with above-average asset days. Variance is the benchmark's average squared distance from its mean — the yardstick every covariance gets divided by. Their ratio, beta, is the slope of the best-fit line through the daily scatter: with the seed's asset trading at roughly 1.4 times the benchmark plus small noise, the slope must land near 1.4, and 1.4288962 is exactly that story told in one number.",
      "The classic missteps all produce confident nonsense. Computing correlation instead of beta answers a different question — correlation is the unit-free tightness of the cloud (0.9973 on this seed), while beta carries the asset's extra volatility in its scale (1.4289); same data, different numbers. Dividing by n - 1 instead of n inflates the two reported aggregates (covariance to 1.260509, variance to 0.882156) but cancels out of the beta ratio entirely. Swapping the columns answers 'how does the benchmark move with the asset' — 0.6961 here, close to but not exactly 1 / 1.4289 = 0.6998, because the equality would force a perfect linear fit and the asset's noise breaks it.",
      "The shape is one aggregate CTE and a projection that does arithmetic. The CTE reduces 24 rows to five sums — n, SUM(x), SUM(y), SUM(y*y), SUM(x*y) — and every output column is a closed form over those sums, so no second scan and no window function is needed. The style CASE repeats the RAW ratio expression three times rather than reading the rounded beta alias, because the contract pins the label to the unrounded value: rounding lives in the projection, never in the predicate. The one-step raw form and the covariance-over-variance form are algebraically the same slope — multiplying both by n / n cancels — but the one-step form is what the contract pins.",
    ],
    edges: [
      "Correlation is not beta: cov / sqrt(var_x * var_y) reads 0.9973 on this seed while beta reads 1.4289 — correlation is the unit-free tightness of the scatter, beta scales it by the asset's extra volatility. When the ask is a slope or an exchange rate, report beta; when the ask is tightness, report correlation — never reuse one for the other.",
      "The sample (n-1) variant reports covariance 1.260509 and benchmark_variance 0.882156 — both inflated by 24/23 — yet beta still reads 1.4289 because the factor cancels in the ratio; only the two aggregate cells catch the slip, which is why both are pinned outputs.",
      "Swapping x and y answers the reverse question, the beta of the benchmark against the asset: 0.6961 here — near 1 / beta (0.6998) but not equal, since equality would force a perfect linear fit and the asset's independent noise breaks it. Column order is part of the formula's contract.",
      "Testing the ROUNDED beta in the style CASE (1.4289 > 1.05) happens to land the same 'aggressive' label on this seed — a HAPPENS TO AGREE coincidence that a window seeded near the 1.05 or 0.95 boundary would expose; the contract's raw-test rule stands regardless.",
    ],
    ladder: [
      { title: "Brute force — plot it and read the slope", body: "Lay the 24 (benchmark, asset) pairs on graph paper, draw the best straight line by eye and read its tilt, then recompute covariance and variance on a calculator to check. Honest for one window, unrunnable per client per night, and it never explains why the slope formula works." },
      { title: "The pattern — five sums, three closed forms", body: "One aggregate pass computes n, SUM(x), SUM(y), SUM(x*y) and SUM(y*y); the pinned closed forms turn them into covariance, benchmark_variance and beta with no second scan and no row-level output. The CASE then labels the RAW ratio before any rounding is displayed." },
      { title: "The optimal idea — label before you round", body: "O(n) over the return rows in a single scan with O(1) state. The durable rules: population moments divide by n, the ratio rides the one-step raw form, and classification tests the unrounded value — rounding is a display concern and stays in the projection." },
    ],
    approach: "one aggregate CTE of the five population sums, closed-form covariance/variance/beta in the projection, and a CASE that labels the RAW ratio before any ROUND",
    schema: {
      ddl: `CREATE TABLE daily_returns (
  r_date               TEXT PRIMARY KEY,  -- 'YYYY-MM-DD', one row per trading day
  asset_return_pct     REAL NOT NULL,     -- the asset's daily return, in percent
  benchmark_return_pct REAL NOT NULL      -- the benchmark's daily return, in percent
);`,
      seed: `-- 24 consecutive trading days · the benchmark alternates mild moves
-- (+1.2, -0.8, +0.5, -1.1 pattern with variation) · the asset rides at
-- 1.4 * benchmark plus independent noise capped at 0.15, so the raw beta
-- lands near 1.43 ('aggressive')
INSERT INTO daily_returns (r_date, asset_return_pct, benchmark_return_pct) VALUES
  ('2026-08-28',  1.78,  1.2),
  ('2026-08-31', -1.00, -0.8),
  ('2026-09-01',  0.56,  0.5),
  ('2026-09-02', -1.62, -1.1),
  ('2026-09-03',  1.67,  1.3),
  ('2026-09-04', -1.09, -0.7),
  ('2026-09-07',  0.61,  0.4),
  ('2026-09-08', -1.27, -1.0),
  ('2026-09-09',  1.42,  1.1),
  ('2026-09-10', -1.32, -0.9),
  ('2026-09-11',  0.87,  0.6),
  ('2026-09-14', -1.83, -1.2),
  ('2026-09-15',  1.77,  1.2),
  ('2026-09-16', -1.22, -0.8),
  ('2026-09-17',  0.83,  0.5),
  ('2026-09-18', -1.59, -1.1),
  ('2026-09-21',  2.07,  1.4),
  ('2026-09-22', -0.98, -0.6),
  ('2026-09-23',  0.41,  0.3),
  ('2026-09-24', -1.17, -0.9),
  ('2026-09-25',  1.46,  1.0),
  ('2026-09-28', -1.05, -0.7),
  ('2026-09-29',  0.92,  0.6),
  ('2026-09-30', -1.44, -1.0);`,
      tables: [
        { name: "daily_returns", note: "24 rows — the benchmark alternates mild moves (+1.2, -0.8, +0.5, -1.1 with variation) and the asset rides at roughly 1.4 times it plus noise within 0.15" },
      ],
    },
    code: `WITH agg AS (
    -- one pass over the window: the five population sums beta needs
    SELECT
        COUNT(*)                                         AS n,
        SUM(asset_return_pct)                            AS sx,
        SUM(benchmark_return_pct)                        AS sy,
        SUM(benchmark_return_pct * benchmark_return_pct) AS syy,
        SUM(asset_return_pct * benchmark_return_pct)     AS sxy
    FROM daily_returns
)
SELECT
    n                                                   AS n_days,
    ROUND((sxy - sx * sy / n) / n, 6)                   AS covariance,
    ROUND((syy - sy * sy / n) / n, 6)                   AS benchmark_variance,
    -- the pinned one-step raw ratio: population covariance over population variance
    ROUND((n * sxy - sx * sy) / (n * syy - sy * sy), 4) AS beta,
    -- style reads the RAW ratio — rounding lives only in the projection above
    CASE
        WHEN (n * sxy - sx * sy) / (n * syy - sy * sy) > 1.05 THEN 'aggressive'
        WHEN (n * sxy - sx * sy) / (n * syy - sy * sy) < 0.95 THEN 'defensive'
        ELSE 'market-like'
    END                                                 AS style
FROM agg;`,
    walkthrough: [
      "agg folds the whole window into five numbers in one scan: n = 24, SUM(x) = -1.21, SUM(y) = -0.7, SUM(y*y) = 20.31 and SUM(x*y) = 29.027. Once those sums exist the problem is closed-form arithmetic — no row-level output survives, which is why exactly one row ships. Both return columns are REAL percents, so every aggregate downstream is REAL and no integer truncation can bite.",
      "Covariance and benchmark_variance re-derive the means implicitly: (sxy - sx * sy / n) / n is the average co-movement around the two means and reads 1.207987847 before its 6-decimal round, while (syy - sy * sy / n) / n lands at 0.845399306. Beta rides the pinned one-step form: (24 * 29.027 - 0.847) / (24 * 20.31 - 0.49) = 695.801 / 486.95 = 1.4288962 — algebraically the same slope as covariance over variance, because multiplying both by n / n cancels. The seed's asset was built as 1.4 times the benchmark plus noise, and the estimate honors it.",
      "The CASE repeats the raw ratio three times — 1.4288962 clears the strict 1.05 line on the first arm, so style ships 'aggressive' — and the projection rounds the same ratio to 1.4289 for display only. One row, five columns, order-independent by construction. Had the ratio landed between 0.95 and 1.05 the ELSE arm would have shipped 'market-like' through the identical code path, and a ratio under 0.95 would have taken the 'defensive' arm instead.",
    ],
    time: "O(n) — one aggregate scan of the 24 return rows, then constant-time closed-form arithmetic over the five sums",
    space: "O(1) — the CTE holds five scalar sums, never the rows themselves",
    followUps: [
      "Add a corr_4dp column computed as covariance over the square root of var_x times var_y and check that its rank across windows need not match beta's rank — which number should a risk desk rank portfolios by, and why?",
      "Re-run the window as a sample estimator (divide by n - 1) and prove that beta is invariant while covariance and benchmark_variance each inflate by 24/23 — when could the distinction ever move a reported slope?",
      "Roll a per-calendar-month beta with one row per month — which parts of the single-window CTE generalize unchanged, and which constant has to move?",
    ],
    related: ["max-drawdown", "portfolio-concentration-hhi", "fx-exposure-report"],
    order: "any",
    xp: 35,
  },
  {
    slug: "split-adjusted-position",
    statement:
      "The trades table logs one row per fill: (trade_id, account_id, symbol, trade_date, side, shares, price_cents), and the splits table holds corporate actions: (symbol, split_date, ratio_num, ratio_den) — ratio_num 2 with ratio_den 1 is a two-for-one split. A split is effective before that day's trading, so trades ON or AFTER the split_date already change hands at post-split terms and stay untouched, while trades strictly BEFORE the date get restated: adjusted_shares = shares * ratio_num / ratio_den and adjusted_price_cents = price_cents * ratio_den / ratio_num. Both restatements are exact on this data because pre-split ACME share counts and prices are constrained to be even. A symbol with no split row — ZYGO here — never adjusts, whatever its dates. Output one row per trade with trade_id, symbol, raw_shares, adjusted_shares, raw_price_cents, adjusted_price_cents and adjustment ('split-adjusted' or 'as-traded'), ordered by trade_id ascending.",
    examples: [
      {
        input:
          "trade 1 — buy 100 ACME at 20000 cents on 2026-09-01, two weeks before ACME's 2026-09-15 two-for-one",
        output: "1 · ACME · 100 · 200 · 20000 · 10000 · split-adjusted",
        explanation:
          "Pre-split restating doubles the shares and halves the price: 100 shares at 20000 cents and 200 shares at 10000 cents both hold 2000000 cents of position value, so the adjustment moves the units and never the money.",
      },
      {
        input: "trade 4 — buy 50 ACME at 10200 cents on 2026-09-15, the split date itself",
        output: "4 · ACME · 50 · 50 · 10200 · 10200 · as-traded",
        explanation:
          "The split is effective before the opening of 2026-09-15, so trade 4 already trades at post-split terms — the join's strict split_date > trade_date condition leaves it unmatched and the raw numbers pass through labeled 'as-traded'.",
      },
    ],
    constraints: [
      "the effective-date rule: only trades with trade_date strictly before the symbol's split_date adjust — trades ON the split date and after keep their raw numbers",
      "pinned restatement: adjusted_shares = shares * ratio_num / ratio_den and adjusted_price_cents = price_cents * ratio_den / ratio_num — integer math kept exact by the even pre-split ACME share counts and even prices",
      "the adjustment is per symbol: a LEFT JOIN on symbol plus the date rule keeps every trade row, and trades of symbols with no split row ship raw under the 'as-traded' label",
      "ORDER BY trade_id ASC; the adjustment label reads 'split-adjusted' exactly when the trade was restated and 'as-traded' otherwise",
    ],
    primer: {
      hook: "A stock split rewinds nothing — it multiplies share counts and divides prices, and every number recorded before it must be rewritten or every comparison lies.",
      concept: [
        "A split is a bookkeeping move: the company prints more shares and hands each shareholder proportionally more certificates, each worth proportionally less. In a two-for-one split every old share becomes two new shares and the market price halves the same morning. Nothing economic happens — owning 100 shares at 20000 cents is the same slice of the company as owning 200 at 10000 cents, exactly like cutting one pizza slice into two thinner slices while still eating the same pizza.",
        "What changes is every per-share number in history. Share counts double, per-share prices halve, per-share earnings halve, and a chart drawn on raw prices shows a fake 50 percent crash on the split morning that no investor ever experienced. To keep history comparable, data providers back-adjust: every record dated before the effective date is restated by the ratio, so one continuous, comparable series emerges.",
        "The effective date matters to the hour. A split is effective before the market opens on its effective date — trades printed that day already change hands at post-split terms, so only strictly earlier records restate. Miss the boundary in either direction and positions, cost bases and charts corrupt on one side of the line.",
        "The arithmetic generalizes to any ratio: shares multiply by num over den and prices divide by it. A reverse split runs the movie backwards — a one-for-ten reverse split merges ten old shares into one and multiplies the price by ten, a move companies use to lift a beaten-down quote above exchange listing minimums. Either way the two sides of the ratio move in lockstep, and the position's value survives both directions unchanged.",
      ],
      worked: [
        "A ledger shows a buy of 50 shares at 4000 cents on Monday, and a two-for-one split is effective Thursday.",
        "Restate the old trade: shares multiply by 2 over 1 — 50 becomes 100 — and the price divides by the same ratio — 4000 becomes 2000 cents.",
        "Check the money: 50 times 4000 and 100 times 2000 are both 200000 cents, so the position value is untouched.",
        "Thursday's own trade — 40 shares at 1980 cents — is already a post-split print, so it stays exactly as traded.",
        "Averaging the restated 100 shares at 2000 cents with Thursday's 40 shares at 1980 cents is now apples to apples — averaging 50 with 40 across the boundary was not.",
      ],
      glossary: [
        { term: "stock split", def: "a corporate action multiplying share counts and dividing the per-share price by the same ratio" },
        { term: "split ratio", def: "the num-over-den conversion rate applied to shares and prices on the effective date" },
        { term: "effective date", def: "the day a split starts trading at post-split terms, before the open" },
        { term: "back-adjusted history", def: "older records restated by the ratio so a price series reads continuous through splits" },
        { term: "cost basis", def: "the average cents per share an account paid for its holdings, used to compute gains" },
        { term: "reverse split", def: "a ratio below one share per old share that merges shares and raises the quote" },
      ],
      reallife: [
        "Brokers and custodians run corporate-actions jobs overnight on effective dates: the feed of announced splits drives an adjustment sweep over every customer position, tax lot and historical fill, and reconciliation compares pre- and post-sweep share counts. When the job misfires the damage is loud — customers wake to doubled or halved positions, average costs that no longer match their statements, and support tickets by the thousand. The engineer's job is to make the rewrite deterministic, keyed on symbol and effective date, with the strict boundary that trades printed on the day already count as post-split.",
        "The numbers drive real decisions: gains and tax lots are computed on adjusted cost bases, backtests demand adjusted price series because an unadjusted chart hands a strategy a phantom 50 percent crash, and per-share metrics like earnings or dividends line up across a split only after restatement. Reverse splits add a reputational wrinkle — they repair a quote's optics without repairing the business, and desks flag them because they cluster around distressed names. When a large index constituent splits, index providers restate their divisor math the same night, and a missed linkage resurfaces days later as a tracking error nobody can explain.",
      ],
      where: "Back-office and corporate-actions engineers at brokers, custodians and market-data vendors get asked this, alongside quant developers who need clean adjusted history for backtests.",
    },
    breakdown: [
      "The ask is a point-in-time unit conversion: the same economic position exists before and after the split, and the report shows both spellings side by side. A two-for-one split multiplies every old share into two new ones, so share counts double and the price per share halves — 100 shares at 20000 cents and 200 at 10000 cents are the same 2000000-cent position. Restating only the numbers the split's mechanics touch, and only on the side of the boundary that needs it, is the whole job. The raw columns ride along untouched so a reader can see both worlds in one row.",
      "Two missteps corrupt the report silently. Adjusting by date alone — ignoring the symbol match — reaches across into ZYGO and multiplies trade 7 into 240 shares at 3750 cents, inventing history that never happened. Getting the date direction wrong is the second: restating trades ON or after the effective date rewrites already-post-split fills (trade 4 would read 100 shares at 5100 cents), while the strict split_date > trade_date join condition encodes 'effective before that day's trading'. Both errors type-check, run clean and print confident nonsense.",
      "The shape is one LEFT JOIN and three CASE-driven projections. Each trade joins to its symbol's split row only when the trade strictly precedes the effective date; a miss — post-split ACME fills, all ZYGO fills — leaves s.symbol NULL and the CASEs pass raw numbers through with 'as-traded'. Integer division stays honest here because the seed constrains pre-split ACME prices and shares to be even, a constraint the edges call out since an odd 19501-cent price would truncate silently. At most one split row exists per symbol in this seed, so the join cannot fan out.",
    ],
    edges: [
      "Trade 4 sits ON the split date and ships unchanged: 'effective before that day's trading' is the strict inequality split_date > trade_date. Loosening it to >= additionally restates trade 4 into 100 shares at 5100 cents, while flipping the join to split_date <= trade_date restates every post-split fill instead — trades 4, 5 and 6 would read 100 @ 5100, 120 @ 5200 and 50 @ 5400.",
      "The three ZYGO trades bracket the split date (09-02, 09-16, 09-21) yet never adjust — the join keys on symbol first, so a symbol with no split row is immune wherever its dates fall; a date-only join corrupts trade 7 into 240 shares at 3750 cents.",
      "Exactness is a constraint, not luck: pre-split ACME prices (20000, 21000, 19500) and shares (100, 40, 30) are all even, so the halving divisions never truncate — an odd price would silently floor and the raw-versus-adjusted value identity would break by a cent.",
      "This seed holds one split row per symbol, so each trade matches at most one split and no fanout is possible — a second ACME split would demand chained multiplicative adjustment rather than a plain join (see the follow-up).",
    ],
    ladder: [
      { title: "Brute force — retype history by hand", body: "Open the split calendar, walk every pre-2026-09-15 ACME fill and rewrite each share count and price with a calculator, then file the corrected ledger. Nine trades is manageable; a decade of fills across every listing is not, and hand edits leave no audit trail." },
      { title: "The pattern — a gated join", body: "Join each trade to its symbol's split row under the strict date rule, then CASE the projection between raw and restated numbers per row. The join does the filtering; the CASE does the arithmetic." },
      { title: "The optimal idea — one pass, two worlds", body: "O(T) over the trades with an indexed symbol lookup, every row emitted exactly once carrying both spellings of history. The durable rule: the effective date belongs in the JOIN condition, not the WHERE, so unmatched symbols survive untouched." },
    ],
    approach: "LEFT JOIN trades to their symbol's split row under split_date > trade_date, then CASE raw versus doubled-shares, halved-price projections per row",
    schema: {
      ddl: `CREATE TABLE trades (
  trade_id    INTEGER PRIMARY KEY,
  account_id  INTEGER NOT NULL,
  symbol      TEXT NOT NULL,
  trade_date  TEXT NOT NULL,     -- 'YYYY-MM-DD'
  side        TEXT NOT NULL,     -- 'buy' or 'sell'
  shares      INTEGER NOT NULL,  -- pre-split ACME counts stay even (constraint)
  price_cents INTEGER NOT NULL   -- pre-split ACME prices stay even (constraint)
);
CREATE TABLE splits (
  symbol     TEXT NOT NULL,
  split_date TEXT NOT NULL,      -- effective BEFORE this day's trading
  ratio_num  INTEGER NOT NULL,   -- 2 with ratio_den 1 = two-for-one
  ratio_den  INTEGER NOT NULL,
  PRIMARY KEY (symbol, split_date)
);`,
      seed: `-- ACME splits two-for-one effective 2026-09-15 (before that day's trading) ·
-- trades 1-3 pre-split (restated) · trade 4 ON the date and 5-6 after (untouched) ·
-- ZYGO trades have no split row and never adjust
INSERT INTO trades (trade_id, account_id, symbol, trade_date, side, shares, price_cents) VALUES
  (1, 501, 'ACME', '2026-09-01', 'buy',  100, 20000),
  (2, 501, 'ACME', '2026-09-04', 'sell',  40, 21000),
  (3, 501, 'ACME', '2026-09-10', 'buy',   30, 19500),
  (4, 501, 'ACME', '2026-09-15', 'buy',   50, 10200),
  (5, 501, 'ACME', '2026-09-18', 'sell',  60, 10400),
  (6, 501, 'ACME', '2026-09-22', 'buy',   25, 10800),
  (7, 502, 'ZYGO', '2026-09-02', 'buy',  120,  7500),
  (8, 502, 'ZYGO', '2026-09-16', 'sell',  70,  7800),
  (9, 502, 'ZYGO', '2026-09-21', 'buy',   90,  8100);
INSERT INTO splits (symbol, split_date, ratio_num, ratio_den) VALUES
  ('ACME', '2026-09-15', 2, 1);`,
      tables: [
        { name: "trades", note: "9 fills — six ACME trades straddling the 2026-09-15 two-for-one (3 pre, 1 on, 2 post) and three ZYGO trades with no split row" },
        { name: "splits", note: "1 row — ACME two-for-one effective 2026-09-15, ratio_num 2 and ratio_den 1" },
      ],
    },
    code: `SELECT
    t.trade_id,
    t.symbol,
    t.shares                                            AS raw_shares,
    -- pre-split trades restate: each old share becomes ratio_num / ratio_den shares
    CASE WHEN s.symbol IS NULL THEN t.shares
         ELSE t.shares * s.ratio_num / s.ratio_den END  AS adjusted_shares,
    t.price_cents                                       AS raw_price_cents,
    -- the price DIVIDES by the ratio: the position's value is invariant
    CASE WHEN s.symbol IS NULL THEN t.price_cents
         ELSE t.price_cents * s.ratio_den / s.ratio_num END AS adjusted_price_cents,
    CASE WHEN s.symbol IS NULL THEN 'as-traded'
         ELSE 'split-adjusted' END                      AS adjustment
FROM trades t
LEFT JOIN splits s
    ON s.symbol = t.symbol
   AND s.split_date > t.trade_date   -- effective BEFORE that day's trading: strict
ORDER BY t.trade_id ASC;`,
    walkthrough: [
      "The LEFT JOIN attaches ACME's single split row to exactly the trades that strictly precede 2026-09-15 — trades 1, 2 and 3 — and leaves every other row unmatched: trade 4 sits ON the effective date, trades 5 and 6 fall after it, and the ZYGO trades share no symbol with any split row. One strict inequality carries the whole effective-date rule. Nothing is filtered; all nine trades reach the projection.",
      "For matched rows the CASEs restate: trade 1 becomes 100 * 2 / 1 = 200 shares at 20000 * 1 / 2 = 10000 cents, trade 2 becomes 80 at 10500 and trade 3 becomes 60 at 9750 — the 2000000-cent, 840000-cent and 585000-cent position values are identical on both sides of the restatement. For unmatched rows s.symbol is NULL, so all three CASEs pass the raw numbers through under the 'as-traded' label. The integer divisions never truncate because the evenness constraint holds on every pre-split fill.",
      "The projection orders by trade_id ascending and ships nine rows: three 'split-adjusted' ACME fills (200, 80 and 60 shares at 10000, 10500 and 9750 cents), three 'as-traded' ACME fills on or after the effective date, and three 'as-traded' ZYGO fills no split ever touched. Every cell is an INTEGER — share counts and prices both start and stay integral. The raw columns ride beside the adjusted ones so both spellings of history read side by side in a single row.",
    ],
    time: "O(T + S) — every trade probes its symbol's split rows once (a single split row here), plus the tiny ORDER BY over 9 rows",
    space: "O(S) — the join holds the splits table in memory; the output is one row per trade",
    followUps: [
      "Chain a second ACME split (say a three-for-one on 2026-11-01) and make the adjustment multiplicative across every split a trade precedes — which join shape survives without fanning rows out?",
      "Add adjusted_notional_cents = adjusted_shares * adjusted_price_cents and verify it equals shares * price_cents on every row — where would the identity wobble once a ratio produced fractional shares?",
      "Restate a per-account average cost basis in post-split terms for the ACME lots — does summing adjusted notionals over buys and dividing by adjusted shares land on the same cents-per-share the raw books show before the split?",
    ],
    related: ["realized-pnl-average-cost", "dividend-income-calendar", "max-drawdown"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "wash-trade-detection",
    statement:
      "The trades table logs one row per fill: (trade_id, account_id, symbol, trade_ts, side, quantity, price_cents), with trade_ts in INTEGER epoch seconds. A wash pair is a BUY followed by a SELL of the same symbol from the same account in the same quantity whose timestamps sit 1 to 3600 seconds apart, both bounds inclusive — a round trip that changes no real ownership while printing volume. When one buy matches several candidate sells inside the window, report only the EARLIEST sell, ranked by sell trade_ts then sell trade_id — one economic round trip per buy, never a fanout. Output account_id, symbol, buy_trade_id, sell_trade_id, seconds_apart (sell ts minus buy ts) and round_trip_pct = ROUND(100.0 * (sell price - buy price) / buy price, 2), ordered by seconds_apart ascending, then buy_trade_id ascending.",
    examples: [
      {
        input:
          "account 704 buys 400 WLT at 2500 cents (ts 7000000), then sells 400 at 2525 cents (ts 7000300) and 400 at 2540 cents (ts 7000800) — two candidate sells, both inside the hour",
        output: "704 · WLT · 13 · 14 · 300 · 1.0",
        explanation:
          "Both sells match the buy on every key, but only the earliest — trade 14, 300 seconds later — ships as the round trip; the 800-second sell is absorbed by the rn = 1 rank and never reports.",
      },
      {
        input: "account 701 buys 300 NVI at 5000 cents (ts 3000000) and sells 300 at 5050 cents exactly 3600 seconds later — the window's far bound",
        output: "701 · NVI · 5 · 6 · 3600 · 1.0",
        explanation:
          "The 3600-second bound is inclusive, so the pair survives with round_trip_pct 1.0; account 703's ZED pair one second further out (3601) misses the window and reports nothing.",
      },
    ],
    constraints: [
      "pairing keys: same account_id, same symbol, same quantity, with the buy strictly before the sell — the side filters are the join's compass and a trade can never pair with itself",
      "window: 1 <= sell.trade_ts - buy.trade_ts <= 3600, INCLUSIVE on both ends, computed on INTEGER epoch seconds (never julianday floats) — the 1-second floor blocks zero-gap degenerate pairs",
      "one row per buy: ROW_NUMBER() OVER (PARTITION BY buy trade_id ORDER BY sell trade_ts, sell trade_id) keeps only rn = 1, the earliest sell",
      "round_trip_pct = ROUND(100.0 * (sell price - buy price) / buy price, 2), rounded once at the projection; ORDER BY seconds_apart ASC, buy_trade_id ASC",
    ],
    primer: {
      hook: "Wash trading is volume theater — a player trading with themselves to print activity that no real investor ever provided.",
      concept: [
        "Volume — the number of shares that changed hands — is read by the market as a health signal: a busy tape means liquidity, tight spreads and somewhere to trade in size. A wash trade manufactures that signal for free: the same account (or friendly accounts) buys and promptly sells the same instrument in the same size, ending where it started while the tape prints two fills. No new owner, no price discovery, no risk taken — just volume that exists only on paper.",
        "Exchanges and regulators ban it outright because faked volume corrodes everything built on top of it: investors sizing orders against a phantom crowd, liquidity rankings and rebate programs paying on activity that never happened, and charts whose apparent interest is one wallet high-fiving itself. Detecting it is pattern recognition — a buy and a matching sell, same account, same instrument, same size, seconds or minutes apart. The tight loop is the tell: genuine investors rarely exit the exact position at the exact size within the hour without a reason.",
        "Detection systems hunt round trips. The naive join pairs every buy with every qualifying sell and drowns the alert queue in duplicates when one buy meets several sells (a ladder of exits), so real systems keep one round trip per buy — the earliest exit — and rank candidates deterministically. A one-second floor keeps degenerate zero-gap artifacts out of the match, and the window's far bound (here one hour) separates the suspicious loop from the patient investor who simply changed their mind.",
        "False positives are the operational tax: market makers legitimately flip inventory in seconds, and a fast genuine round trip looks exactly like a wash on paper. That is why a detector ships a queue, not a verdict — analysts triage flagged pairs by severity, size and repetition. Not every flagged pair is guilt; every unflagged ladder is a blind spot.",
      ],
      worked: [
        "One account prints a buy of 100 shares at 1000 cents at 09:00:00 and a sell of 100 shares at 1000 cents at 09:20:00 — same size, flat price, 1200 seconds apart.",
        "The keys match (same account, symbol and quantity), the sell follows the buy, and 1200 sits inside the 1-to-3600 window: this is a round trip.",
        "The percent prices it at ROUND(100.0 * 0 / 1000, 2) = 0.0 — a flat trip, the pure-volume signature with no attempt at profit.",
        "A second sell of 100 shares at 1005 cents the NEXT morning sits outside the window and pairs with nothing — patient exits are not wash pairs.",
        "Had the account also sold 100 shares at 1002 cents at 09:35, only the 09:20 exit would ship: one buy, one reported trip, the earliest sell wins.",
      ],
      glossary: [
        { term: "wash trade", def: "a buy and matching sell by the same interest that fakes volume without changing ownership" },
        { term: "round trip", def: "a matched buy-sell pair in the same size inside a short window, netting zero position" },
        { term: "volume", def: "the number of shares printed as traded in a period, read by the market as liquidity" },
        { term: "market surveillance", def: "the desk and software that mine the trade tape for manipulation patterns like washes" },
        { term: "maker-taker rebate", def: "an exchange fee schedule paying a rebate to the liquidity-posting side, a wash-trading motive" },
        { term: "false positive", def: "a flagged pair that turns out to be legitimate fast trading once an analyst reviews it" },
      ],
      reallife: [
        "Exchange surveillance teams — and the vendors built for regulators — run detectors over every print, and the wash-pair query is the first gate in the alert queue. What breaks in production is volume: naive pair joins produce tens of thousands of rows a day, so desks invest in exactly the deduplication this problem teaches — one trip per buy, deterministic tiebreaks, typed windows. From there analysts triage: repeat offenders, oversized trips and rebate-era clustering jump the queue.",
        "The downstream decisions are real money: accounts get suspended, listings get delisted, market-maker agreements get clawed back, and exchanges publish enforcement statistics to keep other traders honest. Brokerages run the same detection on their own clients to satisfy market-abuse rules, and crypto venues — where self-matching and volume-shaped tokens were endemic — staff entire teams on this pattern. The number drives the question every investigator asks first: is this wallet printing activity, or taking risk?",
      ],
      where: "Market-surveillance analysts at exchanges, compliance engineers at brokers and crypto venues, and regulatory-technology teams hiring for tape-pattern work.",
    },
    breakdown: [
      "Wash trading fakes activity: the same wallet buys and promptly sells the same instrument in matched size, so ownership ends where it started while the tape shows two prints. Surveillance reads that pattern as a round trip — a matched buy-sell pair inside a short window — and the SQL shape is a self-join of the trades table against itself, buys on one side, sells on the other, with equality on account, symbol and quantity. The window does the temporal work: 1 second keeps the join from degenerating, and 3600 seconds bounds how fast a round trip can be and still look suspicious. Both bounds are inclusive, so a pair spaced exactly 3600 seconds ships and 3601 does not.",
      "The subtle half is deduplication. One buy can match several sells inside the hour — a partial-exit ladder prints as multiple same-quantity sells — and every extra match is a phantom round trip that inflates the alert count. Ranking candidate sells per buy by timestamp, with trade_id as the deterministic tiebreak, and keeping rn = 1 ships exactly one economic round trip per buy: the earliest exit. Dropping the rank fans the output out and double-counts the WLT buy in this seed.",
      "round_trip_pct prices the trip: how many percent the exit cleared the entry by, computed once at the projection with a single ROUND. A flat trip reads 0.0 — the signature of a pure volume print with no attempt at profit — while small positives like 0.5 or 1.0 suggest rebate capture or gentle price support. The join's equality on quantity keeps trips same-size; anything looser pairs partial fills into imaginary round trips, which is exactly what the MNO seed rows exercise.",
    ],
    edges: [
      "The 3600 boundary is inclusive: NVI's exactly-3600-second pair ships, and a BETWEEN 1 AND 3599 variant silently drops it — while the ZED pair at 3601 stays out under either reading.",
      "The 1-second floor: a window open at 0 invites zero-gap pairings, and with the side filters removed a bad join can even pair a buy with ITSELF — the shipped join cannot (one trade carries one side), but the floor plus the side filters together keep the pairing degenerate-proof.",
      "Earliest-sell dedupe: WLT's buy 13 matches sells 14 (300 seconds) and 15 (800 seconds); without the rn = 1 rank the output fans out to five rows and reports a second, invented round trip on trade 15 at 1.6 percent.",
      "Direction and size are join guards, not CASEes: the PQR sell that prints BEFORE its buy never pairs (its negative delta fails the window), and the MNO 60-versus-50 quantity mismatch fails the join — an ABS(delta) variant resurrects the reversed pair, and a dropped quantity key resurrects MNO.",
    ],
    ladder: [
      { title: "Brute force — eyeball the tape", body: "Sort each account's fills by time and scan for a buy whose matching sell lands within the hour, remembering which buys you have already explained. Seventeen trades is doable; a day of exchange volume is not, and the eyeball version double-counts laddered exits." },
      { title: "The pattern — a filtered self-join with a rank", body: "Buys join sells on account, symbol, quantity and the inclusive window; ROW_NUMBER per buy keeps the earliest sell. The join states what a pair is, and the rank states that a buy owns exactly one." },
      { title: "The optimal idea — one pass, one trip per buy", body: "Hash-friendly equality keys (account, symbol, quantity) keep the join proportional to the candidates that actually match, and the rank trims it to the alert set. The durable rules: epoch-integer windows, inclusive bounds, deterministic tiebreaks, and a rank wherever one economic event must not print twice." },
    ],
    approach: "self-join buys to same-key sells inside the inclusive 1-to-3600-second window, rank candidate sells per buy by ts then id, ship rn = 1 with a once-rounded round-trip percent",
    schema: {
      ddl: `CREATE TABLE trades (
  trade_id    INTEGER PRIMARY KEY,
  account_id  INTEGER NOT NULL,
  symbol      TEXT NOT NULL,
  trade_ts    INTEGER NOT NULL,  -- epoch seconds, never a float
  side        TEXT NOT NULL,     -- 'buy' or 'sell'
  quantity    INTEGER NOT NULL,
  price_cents INTEGER NOT NULL
);`,
      seed: `-- 3 matched pairs: 1s flat (1-2), 600s at +0.5 (3-4), exactly 3600s (5-6) ·
-- excluded: 3601s (7-8), quantity 60 vs 50 (9-10), sell before buy (11-12), ·
-- laddered double-sell after one buy (13-15, only the earliest ships), 3-day hold (16-17)
INSERT INTO trades (trade_id, account_id, symbol, trade_ts, side, quantity, price_cents) VALUES
  (1,  701, 'QUA', 1000000, 'buy',  500, 10000),
  (2,  701, 'QUA', 1000001, 'sell', 500, 10000),
  (3,  702, 'ORB', 2000000, 'buy',  200, 20000),
  (4,  702, 'ORB', 2000600, 'sell', 200, 20100),
  (5,  701, 'NVI', 3000000, 'buy',  300,  5000),
  (6,  701, 'NVI', 3003600, 'sell', 300,  5050),
  (7,  703, 'ZED', 4000000, 'buy',  100,  9000),
  (8,  703, 'ZED', 4003601, 'sell', 100,  9050),
  (9,  703, 'MNO', 5000000, 'buy',   60,  3300),
  (10, 703, 'MNO', 5000100, 'sell',  50,  3333),
  (11, 702, 'PQR', 6000000, 'sell', 150,  7000),
  (12, 702, 'PQR', 6000050, 'buy',  150,  7000),
  (13, 704, 'WLT', 7000000, 'buy',  400,  2500),
  (14, 704, 'WLT', 7000300, 'sell', 400,  2525),
  (15, 704, 'WLT', 7000800, 'sell', 400,  2540),
  (16, 704, 'KAP', 8000000, 'buy',   80, 12000),
  (17, 704, 'KAP', 8259200, 'sell',  80, 12300);`,
      tables: [
        { name: "trades", note: "17 fills across 4 accounts and 8 symbols — 3 clean wash pairs (1s, 600s, exactly 3600s), one laddered buy with two candidate sells, and 4 excluded near-misses (3601s, quantity, direction, 3-day hold)" },
      ],
    },
    code: `WITH pairs AS (
    -- every candidate round trip: same account, symbol and quantity,
    -- sell strictly after the buy, inside the INCLUSIVE 1..3600-second window
    SELECT
        b.account_id                                            AS account_id,
        b.symbol                                                AS symbol,
        b.trade_id                                              AS buy_trade_id,
        s.trade_id                                              AS sell_trade_id,
        s.trade_ts - b.trade_ts                                 AS seconds_apart,
        100.0 * (s.price_cents - b.price_cents) / b.price_cents AS trip_pct_raw,
        ROW_NUMBER() OVER (
            PARTITION BY b.trade_id
            ORDER BY s.trade_ts ASC, s.trade_id ASC)            AS rn
    FROM trades b
    JOIN trades s
      ON s.account_id = b.account_id
     AND s.symbol     = b.symbol
     AND s.quantity   = b.quantity
     AND s.side       = 'sell'
     AND s.trade_ts - b.trade_ts BETWEEN 1 AND 3600
    WHERE b.side = 'buy'
)
SELECT
    account_id,
    symbol,
    buy_trade_id,
    sell_trade_id,
    seconds_apart,
    ROUND(trip_pct_raw, 2) AS round_trip_pct
FROM pairs
WHERE rn = 1                       -- one economic round trip per buy
ORDER BY seconds_apart ASC, buy_trade_id ASC;`,
    walkthrough: [
      "The join matches buys to sells on the four equality keys plus the window, and the seed yields exactly five candidate pairs: QUA at 1 second, ORB at 600, NVI at 3600 (the inclusive far bound), and WLT's buy 13 against BOTH sells 14 and 15. Everything else fails a guard — ZED misses the window by one second, MNO fails the quantity key, PQR's sell prints before its buy, and KAP holds for three days. Five candidates enter the rank; four trips leave it.",
      "ROW_NUMBER partitions by the buy's trade_id and orders candidate sells by timestamp then trade_id, so WLT's buy 13 ranks sell 14 (300 seconds) ahead of sell 15 (800 seconds) and keeps rn = 1 only. That is the whole deduplication: one buy, one economic round trip, the earliest exit. Without the rank the fanout ships five rows and invents a 1.6 percent trip on trade 15 that the contract refuses to call a distinct event.",
      "The projection rounds each surviving trip's percent once: QUA reads 0.0 (a flat 10000-out, 10000-in print — pure volume), WLT reads 1.0, ORB reads 0.5, and NVI reads 1.0. The ORDER BY walks seconds_apart ascending, then buy_trade_id, so the 1-second flat print leads and the boundary-riding 3600-second pair closes the report. Four rows, every cell typed — INTEGER ids and gaps, one REAL percent.",
    ],
    time: "O(B * S) worst case over matched (account, symbol, quantity) keys — a handful of candidates on this seed, since the equality keys hash cleanly",
    space: "O(P) — P candidate pairs enter the rank before rn = 1 trims it to the alert set",
    followUps: [
      "Catch allied-account wash (the buy in one account, the sell in its sister) by joining through an account-groups map — which of the four equality keys still makes sense unchanged, and which one bends?",
      "Report wash share per symbol per day — wash volume over printed volume — and decide which CTE generalizes and what new time bucket the denominator needs.",
      "Consume sells so each sell serves at most one buy (an exhaustion matching) — how does the rank change when the rule flips from 'earliest sell per buy' to 'earliest buy per sell'?",
    ],
    related: ["duplicate-charge-pairs", "settlement-fails-aging", "realized-pnl-average-cost"],
    order: "exact",
    xp: 20,
  },
];
