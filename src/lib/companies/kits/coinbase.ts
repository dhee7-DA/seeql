// Coinbase — kit 10 of the Fintech & Payments domain (Batch L, wave 6).
// Crypto exchange SQL: the storefront db read as an exchange sandbox —
// orders are trade orders, order_items are fills (each fill = one asset
// line: quantity x unit_price = notional), products are listed assets,
// categories are asset classes, suppliers are custody venues, stock is the
// custody balance in units, and invoices/payments are settlement objects
// (INTEGER cents) over a double-entry ledger. Trade volume, class
// leaderboards, custody censuses and settlement reconciliation.
// Pool provenance: 0 tagged LC rows for Coinbase — the whole pool is
// theme-curated to known exchange/market-data screen shapes and says so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const coinbaseKit: CompanyKit = {
  id: "coinbase",
  domainId: "fintech",
  name: "Coinbase",
  tagline: "Crypto exchange: orders, books, custody",
  accent: "text-blue-500",

  brief: [
    "Coinbase is the exchange where retail and institutional flow meets crypto markets — order books on one side, custody vaults on the other, and a settlement layer that has to prove every trade cleared. The analytics reality is two ledgers glued together: the trading ledger (orders, fills, notionals) and the custody ledger (units held, units moved, debits equaling credits). On this storefront db the mapping is honest: `orders` are trade orders (103 of them worth **$34,833.28**, averaging $338.19), order_items are fills (251 lines where quantity × unit_price is the notional), products are listed assets grouped into 7 asset classes, suppliers are custody venues, and products.stock is the custody balance in units. Settlement objects — `invoices` and `payments` — are INTEGER cents; the dollar read is `amount_cents / 100.0`.",
    "The data org splits into market data, custody ops, and the finance desk that reconciles both. Market data owns the volume folds: one asset class trades **$11,744.01** of notional on 97 units while the quietest does $863.91 on 27 — and the units-versus-dollars distinction is the first thing a screen tests. Custody ops owns the position census: 16 assets, balances from 40 units of the flagship to 500 of the settlement workhorse, with the {violet:deep-custody} cut (balances ≥ 100 units) separating whale inventory from retail float. Finance owns the exceptions the exchange never wants: settlement #11 is {rose:void} yet carries a $925.00 payment, #28 reads {emerald:paid} with no settlement leg at all ($1,756.00), and one venue settled $4,000.00 against a $6,148.00 invoice — {amber:partial}, open, and watched.",
    "Interview style is grain-then-rank, then the reconciliation. A screen opens with a fold (notional per asset class — `SUM(quantity * unit_price)` over fills, never a count of rows wearing a dollar costume), moves to a leaderboard (rank the classes, and *what happens to RANK when two classes tie?*), escalates into a census where FILTER or CASE counts positions in one pass, and lands on custody-versus-traded: units held against units moved, joined without letting the fill fan-out inflate a single position. Candidates who say **'one row per what?'** before every COUNT are the ones who get callbacks.",
    "Preparation: the registry tags zero SQL problems for Coinbase — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror exchange screens — notional folds, tie-aware rankings, running balances, custody censuses and month-bucket volume calendars. Then run both case studies on the live db: one rebuilds the {violet:custody census} asset ops runs before the daily position meeting (per class: assets, deep positions, traded units — Accessories leading at **121** units), the other rebuilds the {emerald:class leaderboard} the growth deck ships (Audio $11,744.01 ranked first through Fitness $863.91). Say the grain, the tie rule and the cents rule before you compute anything — at an exchange, all three are load-bearing.",
  ],

  dayInLife: [
    "**08:00 —** The day starts on the trading floor's recap. First query is the volume fold: yesterday's fills folded into notional per asset class — SUM(quantity × unit_price), never COUNT of fills wearing a dollar costume — and the two-grain read alongside it: 251 fills across 103 orders, so *which number is 'volume'?* The morning anomaly check runs next: settlement legs that don't rebuild their invoice (#11, a {rose:void} carrying $925.00; #28, {emerald:paid} with nothing behind it). A mismatch is a page to custody ops, not a shrug — at an exchange the settlement file and the ledger must agree before the first user trades.",
    "**11:00 —** Midday is position surgery. Custody ops wants the {violet:position census} refreshed before the 1pm meeting: per asset class — listed assets, deep positions (balance ≥ 100 units), units traded — and the join discipline is the whole test: a fills join fans out one row per fill, so positions count with COUNT(DISTINCT) while traded units SUM over the fan-out, and mixing the two grains invents inventory. Market data wants the class leaderboard ranked for the growth deck, with the tie question answered out loud: RANK leaves gaps after ties, DENSE_RANK doesn't, and the deck's footnote changes with the choice. Each ask ships twice — once to answer, once with the definition spelled out.",
    "**15:00 —** The afternoon belongs to settlement and stakeholder cycles. Finance walks the ledger — **debits $181,080 against credits $181,080, delta $0.00** — and the per-account nets (cash $44,196, receivables $16,440) feed the close checklist. The venue review re-runs the settlement-coverage census: 21 exact, 1 {amber:partial} at $4,000.00 of $6,148.00, 6 with no settlement leg — and asks the only question that matters: *do the classes sum back to the invoice base?* A growth partner wants month-bucketed volume (SUBSTR month keys, 6–9 orders a month on this book) defended from the query, not the slide.",
    "**17:30 —** EOD is the writeup. The census ships with its survival rule in the comment (every fill matches a listed asset here, but the LEFT JOIN stays — *the day an asset lists without trading, the INNER silently deletes it*); the leaderboard ships with its tie policy; the anomaly log carries both mirror modes with queries attached. The rhythm to internalize: Coinbase SQL exists to prove that trading and custody tell the same story — *the fill is the claim, the position is the state, and the ledger is the referee between them.*",
  ],

  metrics: [
    { name: "Notional volume", what: "SUM(quantity × unit_price) over fills — the dollar volume read: $34,833.28 across the book. The one fold every other exchange metric divides out of, and the units-times-price shape screens open with." },
    { name: "Fill count vs order count", what: "251 fills across 103 orders (2.4 fills per order). The two-grain census — counting fills as orders inflates trade counts by 2.4×, and the interviewer asks which one you printed." },
    { name: "Class concentration", what: "Notional share by asset class: Audio 33.7% of volume ($11,744.01), top class against Fitness's $863.91. Concentration is the exchange's market-risk line — and a rank with a tie policy attached." },
    { name: "Custody balance", what: "Units held per asset (stock): 40 units of the flagship against 500 of the workhorse. The position state every withdrawal, staking and insurance claim starts from." },
    { name: "Deep-custody cut", what: "Positions with balance ≥ 100 units, per class: 3 of 3 Accessories assets but 0 of 2 Wearables. The whale-versus-retail split custody ops walks daily." },
    { name: "Net units traded", what: "Units moved through fills per class — Accessories 121, Audio 97, Fitness 27. Traded flow against custody state; the gap is the position delta finance explains." },
    { name: "Settlement coverage", what: "Invoices classified exact / partial / no settlement: 21 / 1 / 6. The census finance opens with — and the CASE branches must reconcile to 28 before anyone reads them." },
    { name: "Ledger balance delta", what: "Total debits − total credits: $0.00 ($181,080 = $181,080 here). Custody proof in one number — the only metric at an exchange allowed to be boring." },
  ],

  topics: [
    {
      name: "Notional folds over fills",
      why: "Every volume claim here is a fold over fills: SUM(quantity × unit_price), grouped by asset or class. The trap is the fan-out — joins multiply fill rows, and a fold over the wrong grain prints dollars that don't reconcile. Coinbase drills the fold before it lets you rank.",
      slugs: ["products-worth-over-invoices", "number-of-rich-customers", "top-earners"],
    },
    {
      name: "Tie-aware ranking with RANK & DENSE_RANK",
      why: "Leaderboards are the exchange's native output — and ties are native too. RANK leaves gaps after a tie, DENSE_RANK doesn't, ROW_NUMBER deals arbitrary order; on a volume leaderboard the difference changes which class the deck calls 'second'. The tie rule is a footnote that must be chosen, not defaulted.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries"],
    },
    {
      name: "Custody censuses with FILTER",
      why: "Position meetings open with one-pass censuses: per class, assets listed, deep positions, units moved — COUNT with FILTER (WHERE …) counting subpopulations without scanning twice. The conditional-COUNT-DISTINCT shape is the custody craft: positions are distinct assets even when the fills fan out beneath them.",
      slugs: ["recyclable-and-low-fat-products", "find-stores-with-inventory-imbalance", "snaps-analysis"],
    },
    {
      name: "Class chains: orders → fills → assets",
      why: "Asset analytics is a chain join: fills attach to assets, assets roll up to classes. The join keys are the interview — one wrong column and the chain silently pairs fills with the wrong class, and every fold downstream inherits the fiction.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Argmax: biggest fill per day",
      why: "'What was the largest trade today?' is argmax over a fold — and the naive MAX-join-back doubles rows on ties while ROW_NUMBER picks one arbitrarily unless the tie-break is stated. Maximum-per-day shapes feed the tape, the risk alerts and the client recaps.",
      slugs: ["maximum-transaction-each-day", "the-first-day-of-the-maximum-recorded-temperature-in-each-city", "find-longest-calls"],
    },
    {
      name: "Running balances & frames",
      why: "Custody balances are walks: units in, units out, running position after each fill. Window frames (ROWS/RANGE) and running sums are the mechanics, and the frame choice — default vs explicit — decides whether the walk includes the current row or starts before it.",
      slugs: ["account-balance", "game-play-analysis-iii", "running-total-for-different-genders"],
    },
    {
      name: "Two-sided reads & pivots",
      why: "Taker versus maker, buys versus sells, weekday versus weekend — exchange reads compare two measures of the same population side by side. Self-joins, CASE pivots and conditional sums all do it; the interview is which shape keeps the grain stable.",
      slugs: ["apples-and-oranges", "reformat-department-table", "sales-by-day-of-the-week"],
    },
    {
      name: "Fee tiers & honest ratios",
      why: "Fee share, maker ratio, class concentration — every rate is a ratio over a fold, and both failure modes are graded: INTEGER 100 truncating small shares to zero, and a WHERE that shrinks the denominator to the numerator's population. Weighted averages (notional-weighted price) are the advanced cut.",
      slugs: ["average-selling-price", "card-launch-success", "countries-you-can-safely-invest-in"],
    },
    {
      name: "Volatility windows: LAG price moves",
      why: "Market data lives on deltas: this fill versus the previous one, this month's volume versus last. LAG/LEAD over ordered fills and month buckets are the mechanics, and the deterministic ORDER BY (price, then id) is what keeps a delta meaningful when rows share a timestamp.",
      slugs: ["year-on-year-growth-rate", "biggest-window-between-events", "rolling-average-steps"],
    },
    {
      name: "Calendar spines & WITH RECURSIVE",
      why: "Volume calendars need every day present — including the days nothing traded, which a plain GROUP BY erases. Generating the spine and LEFT-joining activity onto it is the shape WITH RECURSIVE teaches, and the zero-fill discipline is the interview's actual subject.",
      slugs: ["find-the-missing-ids", "total-sales-amount-by-year", "find-the-subtasks-that-did-not-execute"],
    },
  ],

  theory: [
    {
      id: "coinbase-t1",
      q: "A fill is 'large' if its notional crosses a threshold. In a query reporting large-fill share by asset class, where does that rule live — and what breaks when it lands in the wrong clause?",
      a: "Notional is a row-level fact — quantity × unit_price on one fill — so the threshold belongs in WHERE (if large fills are the population) or inside the aggregate as CASE/FILTER (if the share compares large to all). Once folded by class, the row-level comparison no longer exists: HAVING can only judge group aggregates like SUM or COUNT. The classic failure is summing all notional per class and trying to subtract 'the small fills' in HAVING — they're already inside the total, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every rule by asking: is this a fact about one fill, or about a class? At an exchange that question is risk policy: a threshold in the wrong clause doesn't error, it reports a tape that never traded.",
      tag: "pipeline",
    },
    {
      id: "coinbase-t2",
      q: "You join assets to fills and positions triple overnight. What happened, and how do you report positions and traded units from the same fan-out without lying about either?",
      a: "The join fanned out: one asset row per matching fill, so COUNT(*) counts fill lines, not assets. The craft is naming the grain per column: COUNT(DISTINCT asset_id) for positions, SUM(quantity) for traded units, and conditional COUNT(DISTINCT asset_id) FILTER (WHERE stock >= 100) for the deep-custody cut — all three from one scan of the same fan-out. The dangerous version is SUMming a position column over the fan-out: stock × fills-per-asset invents inventory out of proportion to activity. Guardrails: pre-aggregate the fills per asset in a CTE, then join 1:1 — the fan-out dies at the staging step — and reconcile COUNT(DISTINCT) against the plain asset count before publishing. At Coinbase the follow-up is always 'one row per what?', because custody numbers that can't answer it don't survive the position meeting.",
      tag: "joins",
    },
    {
      id: "coinbase-t3",
      q: "251 fills clear 103 orders. Narrate every count in that sentence — and how you'd report both grains in one query.",
      a: "COUNT(*) over fills reads 251 — fill events, the rows the tape printed. COUNT(DISTINCT order_id) reads 103 — orders traded, the business object. COUNT(quantity) also reads 251 because the FK is never NULL — NULL-skipping is not deduplication. The two-grain report folds once and counts twice: per class, fills AND distinct orders side by side, because a class with 62 fill-lines might be 30 orders or 60, and fills-per-order is the gap between the columns. The habit the interviewer grades: before any COUNT, say 'one row per what?' — fill event, order, class bucket. At Coinbase the distinction is money: counting fills as orders inflates trade counts 2.4×; counting orders as fills hides burst activity. Both numbers ship to different teams on purpose, and the query prints both or prints a footnote.",
      tag: "aggregation",
    },
    {
      id: "coinbase-t4",
      q: "products.stock is NULL-able in staging, and a LEFT JOIN to fills leaves some assets with no fill rows. What is your NULL policy for the position census — filter, coalesce, or report?",
      a: "NULL stock means 'unknown position' and NULL fill columns mean 'no trade yet' — two different NULLs with two different policies. The census keeps every asset: COALESCE(SUM(quantity), 0) turns no-trade into zero units traded (a real state, not missingness), while NULL stock is reported AS NULL — coalescing it to zero launders an unknown position into a claim custody ops can't back. The shape: LEFT JOIN so newly listed assets survive (on this book every asset has traded, but the query is written for the day one hasn't), IS NULL to detect the no-trade class, and the NULL policy stated in the query comment. The rule the interviewer grades: zero is a fact you can stand on, NULL is a question you escalate — and a census that quietly converts one into the other is the artifact exchange audit hunts for.",
      tag: "nulls",
    },
    {
      id: "coinbase-t5",
      q: "Rank asset classes by traded notional. When do RANK and DENSE_RANK diverge, and which belongs in a client-facing leaderboard?",
      a: "They diverge exactly at ties: RANK gives the tied rows the same rank and skips (1, 1, 3), DENSE_RANK compacts (1, 1, 2), ROW_NUMBER deals 1, 2, 3 arbitrarily. On this book's class leaderboard there are no ties — $11,744.01 down to $863.91, seven distinct values — so all three agree, and the interviewer's real question is whether you know when they wouldn't. Client-facing, the choice is a disclosure: RANK says 'two classes tied for first and the next is third', which is honest but confusing; DENSE_RANK reads cleanly but hides the tie; ROW_NUMBER without a stated tie-break is a lawsuit-shaped default. The strong answer picks one, states the ORDER BY including its tie-break column (notional DESC, then class name), and notes that ORDER BY inside OVER is what makes the ranking deterministic at all — at an exchange, a leaderboard that reshuffles between runs is worse than a wrong one.",
      tag: "windows",
    },
    {
      id: "coinbase-t6",
      q: "WHERE unit_price > (SELECT AVG(unit_price) FROM fills WHERE class = 'memecoin') — this exchange lists no memecoin class. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and price > NULL is UNKNOWN, so WHERE passes nothing: an above-average-print report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and it ships on filtered staging tables far more often than on full ones — 'it worked on my class' is the bug report. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise the inner fold's GROUP BY has to keep. The correlated cousin — above THIS class's own average, re-run per outer row — is a different question with a different cost profile. At Coinbase the follow-up is always: what population did the inner fold cover, and what does an empty result mean for the desk that asked? Silence reads as good news, which is exactly the problem.",
      tag: "subqueries",
    },
    {
      id: "coinbase-t7",
      q: "Volume calendars bucket by month. How do you build the buckets, and what does a plain GROUP BY quietly delete?",
      a: "Buckets: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — the SUBSTR shortcut is safe only while the column stays fixed-width ISO, a convention nothing in the column enforces, so say it before you lean on it. This book runs 6–9 orders a month across 14 months, and the calendar is where the honesty lives: a plain GROUP BY only prints months with activity, so a zero-volume month vanishes and the trend line lies by omission. The fix is a spine — generate the month range (WITH RECURSIVE off a calendar seed) and LEFT JOIN the fold onto it, zero-filling the gaps with COALESCE. Window order matters too: LAG over the bucketed fold gives month-over-month deltas, and the ORDER BY month is what makes 'delta' mean anything. At an exchange the empty bucket is the story — a zero-volume day on a major class is either a holiday or an outage, and the query should say which.",
      tag: "dates",
    },
    {
      id: "coinbase-t8",
      q: "The custody ledger must prove debits equal credits: $181,080 each side. How do you prove it in one query — and localize the break when it doesn't?",
      a: "One pass, two conditional sums: SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — dollars via /100.0, delta printed beside the totals. Zero is the only acceptable value; the query is the proof and a non-zero delta is the page. Localization is the same shape one level down: GROUP BY venue account and read per-account nets — cash $44,196, receivables $16,440, revenue −$86,052, opex $25,416 here — because a broken balance shows up as an account whose debit/credit pairing drifted. The traps are self-inflicted: COUNT where you meant SUM, SUMming dollars over cents (a 100× error the eye never catches), or auditing only the grand total while an offsetting error hides across two accounts. At an exchange this is the custody proof users' insurance assumes — reconcile the total, then reconcile the parts, and treat 'two accounts both moved by the same amount' as the anomaly it usually is.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "coinbase-mcq-1",
      prompt: "A settlement leg of 222,950 cents (real row: payment #24) is reported as ROUND(amount_cents / 100, 2). What prints?",
      choices: [
        "2229.50 — integer division keeps the cents",
        "2229 — the .50 was truncated before ROUND ran",
        "2230 — SQLite rounds the division up",
        "2229.00 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Two INTEGERs divide with truncation: 222950 / 100 = 2229 before ROUND ever runs. The house shape is amount_cents / 100.0 — real division first, ROUND last — which prints the true 2229.50.",
      notes: [
        { choice: 0, why: "Integer division discards the remainder entirely — 222950/100 is 2229, and this is a real odd-cent settlement row, so the loss is on the books." },
        { choice: 2, why: "Nothing rounds the division — SQLite truncates it. ROUND runs downstream on the already-truncated 2229 and can only leave it there." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-2",
      prompt: "16 assets across 7 classes. SELECT category, COUNT(*) FROM products GROUP BY category returns how many rows?",
      choices: ["7", "16", "2", "112"],
      answer: 0,
      why: "GROUP BY folds to one row per distinct class — 7 rows whose counts sum to 16. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 1, why: "16 is the input row count. GROUP BY collapses it; you'd only see 16 rows folding on a 16-distinct-value column." },
        { choice: 3, why: "112 is 16 × 7 — a cross join, not a fold. GROUP BY never multiplies; it collapses." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-3",
      prompt: "Which expression counts ORDERS traded (not fill lines) from the fills table?",
      choices: ["COUNT(*)", "COUNT(quantity)", "COUNT(DISTINCT order_id)", "SUM(order_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(quantity) both read 251 — one row per fill. COUNT(DISTINCT order_id) folds the fan back to 103 orders. Both grains are real; the report must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — with a NOT NULL FK it equals COUNT(*) at 251. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes when any order gains a fill. Keys are for joining, never for folding." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-4",
      prompt: "Assets LEFT JOIN fills, then GROUP BY class. Why does COUNT(*) read 62 for a class with 3 assets?",
      choices: [
        "The class genuinely lists 62 assets",
        "The fill fan-out: COUNT(*) counts asset × fill pairs — positions need COUNT(DISTINCT p.id)",
        "COUNT(*) counts NULLs after a LEFT JOIN",
        "Rounding: the join divides by 100.0 twice",
      ],
      answer: 1,
      why: "The join emits one row per (asset, fill) pair; COUNT(*) counts pairs. On this book Accessories prints 62 pair-rows for its 3 assets. Positions are COUNT(DISTINCT p.id); units traded are SUM(quantity) — one scan, three grains, each named.",
      notes: [
        { choice: 2, why: "COUNT(*) counts everything, NULLs included; COUNT(column) is the one that skips NULLs. The inflation here is fan-out, not NULL handling." },
        { choice: 3, why: "Division never enters a COUNT. 62 = 3 assets × their fill rows — the multiplicative signature of an un-aggregated join." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-5",
      prompt: "Large-fill share per class: which expression is safe against integer division AND denominator drift?",
      choices: [
        "SUM(CASE WHEN qty*price > 500 THEN 1 ELSE 0 END) / COUNT(*) * 100",
        "100.0 * SUM(CASE WHEN qty*price > 500 THEN 1 ELSE 0 END) / COUNT(*)",
        "100 * COUNT(qty*price > 500) / COUNT(*)",
        "The same CASE share over rows pre-filtered to one class in WHERE",
      ],
      answer: 1,
      why: "100.0 promotes to real arithmetic BEFORE the division, and COUNT(*) runs over the same unfiltered fold as the numerator — no drift. Filtering to one class first shrinks the denominator to that class and every other share vanishes.",
      notes: [
        { choice: 0, why: "The logic is right but the INTEGER 100 multiplies after an integer division that already truncated — any share under 1% collapses to 0." },
        { choice: 2, why: "COUNT(boolean) counts non-NULL results, and the comparison returns 0 or 1, never NULL — the 'share' reads ~100 for every class." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-6",
      prompt: "You need 'second-busiest asset class by units traded'. Two classes tie for the most units. Which query returns the actual runner-up?",
      choices: [
        "ORDER BY units DESC LIMIT 1 OFFSET 1",
        "MIN(units) over the classes",
        "DENSE_RANK() OVER (ORDER BY units DESC) = 2",
        "MAX(units) minus one",
      ],
      answer: 2,
      why: "DENSE_RANK gives both tied leaders rank 1 and the next distinct class rank 2 — the runner-up even with ties. OFFSET 1 skips the second tied row and returns the third; MIN returns the quietest class; MAX−1 is arithmetic hoping a class exists exactly one unit below.",
      notes: [
        { choice: 0, why: "OFFSET skips ROWS, not rank values — with two tied leaders, offset 1 lands on the second tie, which is still rank 1, not the runner-up." },
        { choice: 1, why: "MIN(units) is the smallest class on the board — the opposite end of the ranking from the runner-up." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-7",
      prompt: "Assets LEFT JOIN fills for the position census; then WHERE oi.quantity > 0. What happens to newly listed assets with no fills?",
      choices: [
        "Nothing — the join already kept them",
        "They vanish: NULL quantity fails the test, the LEFT JOIN collapses to an INNER, and the census loses exactly the assets it exists to list",
        "They appear once with quantity = 0",
        "SQLite keeps them and fills quantity with 1",
      ],
      answer: 1,
      why: "Unfilled assets carry NULL in every joined column; NULL > 0 is UNKNOWN, so WHERE discards them. Put the threshold in ON, or filter a pre-aggregated fold — on this book every asset has traded, but the census is written for the day one hasn't.",
      notes: [
        { choice: 0, why: "The join kept them; the WHERE deleted them. Filter placement, not join type, decided the population — the classic silent INNER conversion." },
        { choice: 2, why: "A WHERE can't rewrite NULLs to zero — that's COALESCE's job, and only when the NULL genuinely means zero. Here it means 'not yet traded', a different fact." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-8",
      prompt: "WHERE asset_id NOT IN (SELECT product_id FROM halted_assets) — halted_assets.product_id is nullable in staging. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL empties the entire result — every asset fails the test",
        "NULL product_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'tradeable assets' list that looks like an outage to whoever reads it." },
        { choice: 2, why: "NOT IN has no 'treat as unmatched' mode. UNKNOWN poisons the whole list; only NOT EXISTS or the IS NULL anti-join is NULL-safe." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-9",
      prompt: "Asset 3 has two fills (qty 2, qty 3) and stock = 40. You join fills to assets and SELECT SUM(oi.quantity) AS units_traded, SUM(p.stock) AS custody_shown. What prints?",
      choices: [
        "units_traded = 5 and custody_shown = 40, both correct",
        "units_traded = 5 and custody_shown = 80 — the fan-out doubled the position column",
        "units_traded = 10 and custody_shown = 40",
        "Both read 5 — SQLite dedupes the fan-out",
      ],
      answer: 1,
      why: "The join emits one row per fill: SUM(oi.quantity) = 2 + 3 = 5 folds the fills correctly, but SUM(p.stock) repeats asset 3's position once per fill row — 40 + 40 = 80 of invented custody. Positions must be folded before the join (staged per asset) or counted with COUNT(DISTINCT), never SUMmed over a fan-out.",
      notes: [
        { choice: 0, why: "custody_shown = 40 would require one row per asset — but this join emits one row per fill, and a bare SUM over the fanned position column repeats per fill." },
        { choice: 2, why: "Backwards: the fill fold (5) is the honest one; 10 would be quantity double-counted — the signature of an extra join, not this one." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-10",
      prompt: "You need a running notional per order, fill by fill, ordered by fill time — including the current fill in each running value. Which frame is correct?",
      choices: [
        "SUM(notional) OVER (PARTITION BY order_id ORDER BY filled_at ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING)",
        "SUM(notional) OVER (PARTITION BY order_id ORDER BY filled_at)",
        "SUM(notional) OVER (PARTITION BY order_id)",
        "SUM(notional) OVER (ORDER BY filled_at ROWS UNBOUNDED PRECEDING) without partitioning",
      ],
      answer: 1,
      why: "The default frame with ORDER BY is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — running total including the current row, restarting per partition. Option A excludes the current fill (lag-style), C has no ORDER BY so the frame is the whole partition (grand total per order), and D runs one continuous total across every order in the book.",
      notes: [
        { choice: 0, why: "…AND 1 PRECEDING stops before the current fill — that's the previous-cumulative column, useful for delta math, wrong for a running balance." },
        { choice: 3, why: "Partitioning is what restarts the walk per order. Without it, one order's fill inherits every earlier order's notional — a running total of the whole tape." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-cb-1",
      tier: "medium",
      topic: "x2",
      universe: "inventory",
      title: "Custody census: positions, deep custody, traded units",
      brief:
        "Position-meeting memo from asset ops: the daily census goes out per asset class, and it reads at three grains from one scan — listed assets, {violet:deep-custody} positions (balance ≥ 100 units), and units traded through fills. Probed figures to reconcile against: 16 listed assets across 7 classes; the Accessories class trades 121 units, Audio 97, Fitness 27. Fills fan out one row per fill, so positions count with COUNT(DISTINCT) while traded units SUM over the fan-out — mixing the grains is how censuses invent inventory.",
      ask: "Return each asset class with its listed assets, deep-custody positions (stock >= 100) and traded units, busiest class by traded units first.",
      template:
        "SELECT p.category,\n       COUNT(DISTINCT p.id) AS assets,\n       COUNT(DISTINCT p.id) {1} (WHERE p.stock >= 100) AS deep_positions,\n       COALESCE(SUM({2}), 0) AS units_traded\nFROM products p\nLEFT JOIN order_items oi ON oi.product_id = {3}\nGROUP BY p.category\nORDER BY units_traded {4};",
      slots: [
        {
          answer: "FILTER",
          kind: "keyword",
          label: "the one-pass subcount",
          why: "FILTER (WHERE …) counts the deep-custody subpopulation inside the same scan as the total: COUNT(DISTINCT p.id) FILTER (WHERE p.stock >= 100). SUM or MAX in this position is a syntax error — the census must be one pass, not two queries stapled together.",
        },
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the traded-units fold",
          why: "Units traded fold from the fill lines: SUM(oi.quantity). The asset's own stock column would sum custody inventory over the fan-out — filling each unit once per fill — and unit_price would print dollars where the census promised units.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the join key",
          why: "Each fill attaches to its asset via oi.product_id = p.id. Substituting oi.product_id makes the ON condition compare the fill to itself — every fill matches every asset, the fan-out multiplies by all 16 assets, and traded units inflate to 1,494 per triple-size class.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The position meeting opens with flow: Accessories 121 units down to Fitness 27. ASC is a correct query answering the opposite question — it opens with the quietest class and buries the one ops acts on.",
        },
      ],
      distractors: ["SUM", "MAX", "oi.product_id", "p.category", "ASC"],
      walkthrough:
        "One LEFT JOIN, one scan, three grains — each named. The join fans each asset out to one row per fill; the census then folds carefully: COUNT(DISTINCT p.id) counts listed assets per class (3, 3, 3, 2, 2, 2, 1 — the fan-out can't inflate a DISTINCT), the same count wrapped in FILTER (WHERE p.stock >= 100) counts deep positions per class (Accessories 3 of 3, Wearables 0 of 2 — the whale-versus-retail cut), and SUM(oi.quantity) folds traded units over the fan (Accessories 121, Audio 97, Electronics 85, Video 61, Apparel 54, Wearables 53, Fitness 27 — the probed figures). COALESCE absorbs the no-trade asset into 0 units rather than NULL — *zero is a fact, NULL is a question*. The LEFT JOIN survives on purpose: every asset trades today, but the day one lists without trading, the census must show it, not delete it. The distractors fail at the grains: SUM or MAX in the FILTER slot is a syntax error, SUM(stock) or SUM(unit_price) folds the wrong column into 'units', the self-comparing join key fans fills against every asset and triples every count, p.category matches integers to text and empties the fold, and ASC opens the meeting with Fitness. Three grains, one scan, zero invented inventory — that's the census ops walks in with.",
    },
    {
      id: "cs-cb-2",
      tier: "hard",
      topic: "t5",
      universe: "growth",
      title: "Class leaderboard: ranked notional",
      brief:
        "Growth-deck memo: the leaderboard slide ranks the 7 asset classes by traded notional, and the footnote must state the tie policy because *the deck gets quoted*. Notional is SUM(quantity × unit_price) over fills — probed figures: Audio $11,744.01 through Fitness $863.91, seven distinct values this quarter. The build stages a per-class fold, ranks with a window function, and orders the board by rank — deterministic, reproducible, no silent re-shuffles between renders.",
      ask: "Return each asset class with its notional in dollars (2 decimals) and its rank, ranked by notional descending, board ordered by rank.",
      template:
        "WITH class_volume AS (\n  SELECT p.category,\n         SUM(oi.quantity * oi.unit_price) AS notional\n  FROM order_items oi\n  JOIN products p ON p.id = {1}\n  GROUP BY {2}\n)\nSELECT category,\n       ROUND(notional, 2) AS notional_usd,\n       RANK() OVER (ORDER BY notional {3}) AS rnk\nFROM class_volume\nORDER BY {4};",
      slots: [
        {
          answer: "oi.product_id",
          kind: "keyword",
          label: "the chain's join key",
          why: "Each fill attaches to its asset via oi.product_id = p.id. p.id compares the asset to itself — every fill pairs with every asset, notional per class becomes the book total times class size, and three classes 'tie' at ~$104,500 the tape never traded.",
        },
        {
          answer: "p.category",
          kind: "keyword",
          label: "the fold's group key",
          why: "The leaderboard's grain is the class, so the fold groups by p.category. Grouping by p.id yields 16 asset rows instead of 7 classes — a leaderboard where every asset competes only with itself and every rank reads 1.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rank direction",
          why: "Rank 1 is the biggest class: ORDER BY notional DESC. ASC hands rank 1 to Fitness ($863.91) and the deck's headline inverts — a correct query publishing the wrong board, which is the most expensive kind of correct.",
        },
        {
          answer: "rnk",
          kind: "keyword",
          label: "the board's ordering",
          why: "The slide reads top-down by rank: ORDER BY rnk. Ordering by the raw notional column would also need DESC to match — leaving it ASC prints the board upside down, and ordering by category alphabetizes the deck.",
        },
      ],
      distractors: ["p.id", "oi.order_id", "ASC", "quantity", "p.supplier_id"],
      walkthrough:
        "Stage the fold, then rank the fold — never rank raw rows. The CTE joins each of the 251 fills to its asset and folds notional per class: SUM(quantity × unit_price), grouped by p.category — seven rows, $11,744.01 (Audio) down to $863.91 (Fitness), matching the probed crowns exactly. The outer SELECT ranks with RANK() OVER (ORDER BY notional DESC): seven distinct values, so ranks run 1 through 7 with no gaps — but the footnote still names the tie policy, because the day two classes tie, RANK skips to 3 and DENSE_RANK doesn't, and *the deck gets quoted*. ROUND(notional, 2) happens once, at the display edge. The distractors fail at the seams: p.id in the join key compares the asset to itself and fans the fold into class-size multiples with fake ties, oi.order_id joins fills to the wrong side of the chain entirely, grouping by p.id turns 7 classes into 16 solo entries each ranked 1, ASC crowns Fitness, ORDER BY quantity re-ranks the board by unit count, and p.supplier_id regroups by custody venue — six boards, five of them fiction. Stage, rank, order — the leaderboard the deck actually ships.",
    },
  ],

  problems: [
    { slug: "products-worth-over-invoices", why: "Notional per asset from fill lines — quantity × unit_price folded without letting the fan-out or the units/dollars confusion corrupt the number." },
    { slug: "number-of-rich-customers", why: "COUNT(DISTINCT) over a money threshold — the large-order census: how many accounts traded past a notional floor, counted once no matter how many fills." },
    { slug: "top-earners", why: "Top-N by accumulated value — the class leaderboard warm-up: fold, order, cut, with the tie question waiting right behind it." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over fill amounts — the largest trade in each session window, the tape's daily headline in one query." },
    { slug: "rank-scores", why: "Ranking with explicit tie semantics — the leaderboard drill where RANK, DENSE_RANK and ROW_NUMBER stop agreeing, which is exactly when the footnote matters." },
    { slug: "second-highest-salary", why: "Second-distinct-value under ties — the runner-up class read, where OFFSET-by-one returns a tie-mate instead of the actual number two." },
    { slug: "account-balance", why: "Running balance per account — the custody walk: units in, units out, position after each movement, frame choice deciding whether the current row counts." },
    { slug: "sales-by-day-of-the-week", why: "Weekday volume pivot — Monday's flow against Saturday's, a CASE-pivoted calendar the market-data team ships with every weekly recap." },
    { slug: "apples-and-oranges", why: "Two measures of one population side by side — taker versus maker, buys versus sells — the two-sided compare that keeps the grain stable while the metrics multiply." },
    { slug: "find-stores-with-inventory-imbalance", why: "Imbalance scans across locations — custody venues holding lopsided positions, the concentration alert in graded form." },
    { slug: "average-selling-price", why: "Notional-weighted average price per asset — the VWAP-adjacent fold where weighting by the wrong column quietly reprices the tape." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — the honest-denominator habit every fee share and fill ratio needs." },
    { slug: "year-on-year-growth-rate", why: "LAG against the same bucket a year back — the YoY volume read that separates seasonality from trend on a young asset's tape." },
    { slug: "rolling-average-steps", why: "RANGE-frame rolling averages — the smoothed volume curve market data overlays on raw fills, frame edges and all." },
    { slug: "product-sales-analysis-iii", why: "Per-asset first/last activity by period — listing-to-latest-trading arcs, the lifecycle view asset ops runs on every new listing." },
    { slug: "investments-in-2016", why: "Same-value, same-window pair detection — the wash-trade shape: two fills matching on amount and timing is the pattern surveillance runs nightly." },
  ],
};
