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
// 3x expansion (append-only): +2 brief paras (venue economics + prep
// roadmap), +1 dayInLife beat (**21:15 —**), +4 metrics, +5 topics,
// theory t9..t24, mcqs mcq-11..30 (3/4/3 tiers per fresh ten), cases
// cs-coinbase-3..6 (families j7/x3/t4/q6 — distinct from the kit's x2/t5),
// +16 problems. New slugs all theme-curated from company-pools.md Theme menu.

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
    "Preparation: the registry tags zero SQL problems for Coinbase — this kit is **0 tagged LC, theme-curated**: all 30 topic slugs and 16 problems are chosen to mirror exchange screens — notional folds, tie-aware rankings, running balances, custody censuses and month-bucket volume calendars. Then run all six case studies on the live db: one rebuilds the {violet:custody census} asset ops runs before the daily position meeting (per class: assets, deep positions, traded units — Accessories leading at **121** units), the other rebuilds the {emerald:class leaderboard} the growth deck ships (Audio $11,744, with four more rehearsing the same drills at other grains — the kit is built for spaced practice rather than one sitting...01 ranked first through Fitness $863.91). Say the grain, the tie rule and the cents rule before you compute anything — at an exchange, all three are load-bearing.",
    "Follow the money sideways and the venue economics appear. Six custody venues list the book's 16 assets, and concentration is the risk line: Nordic Gadgets AB carries **32%** of notional ($11,130.25) and Midwest Hardware Co another **26.7%** ($9,294.93) — a top-two share of 58.7% — while the {violet:trusted bench} (rating ≥ 4.5) holds just Nordic (4.6) and Alpine Audio (4.8). The settlement book runs 28 invoices worth **$86,977.00** — 21 paid ($66,443.00), 6 open ($19,609.00), 1 void ($925.00) — moved over two rails: {emerald:card} 16 legs / $37,364.00 against {sky:wire} 11 legs / $32,248.00, a $69,612.00 cross-foot that must equal the cash account's debits. Terms are 30 days flat, settled invoices take 28.4 days on average (13 fastest, 84 slowest), and the overhead calendar peaks in 2024-08 at $3,210.00 against a $16,800.00 full-year rent line.",
    "Preparation roadmap: four weeks, three gates. Week 1, folds and grains — notional per class, per venue, per month, saying *'one row per what?'* before every COUNT. Week 2, ranks and windows — leaderboards with stated tie policies, running settlement walks with explicit frames, LAG deltas with deterministic sorts. Week 3, the settlement stack — build the {amber:UNION ALL grand-total} report, the {emerald:coverage census} (21 exact / 1 partial / 6 with no leg), and the ledger tie ($181,080 = $181,080, delta $0.00) until each ships with its own cross-foot. Week 4, all six case studies on the live db plus the venue-fold drill (gate the listings floor and prove the boundary flips). The three gates every answer passes before it leaves your mouth: the grain is named, the divisor is `100.0`, the gate value is probed one step either side.",
  ],

  dayInLife: [
    "**08:00 —** The day starts on the trading floor's recap. First query is the volume fold: yesterday's fills folded into notional per asset class — SUM(quantity × unit_price), never COUNT of fills wearing a dollar costume — and the two-grain read alongside it: 251 fills across 103 orders, so *which number is 'volume'?* The morning anomaly check runs next: settlement legs that don't rebuild their invoice (#11, a {rose:void} carrying $925.00; #28, {emerald:paid} with nothing behind it). A mismatch is a page to custody ops, not a shrug — at an exchange the settlement file and the ledger must agree before the first user trades.",
    "**11:00 —** Midday is position surgery. Custody ops wants the {violet:position census} refreshed before the 1pm meeting: per asset class — listed assets, deep positions (balance ≥ 100 units), units traded — and the join discipline is the whole test: a fills join fans out one row per fill, so positions count with COUNT(DISTINCT) while traded units SUM over the fan-out, and mixing the two grains invents inventory. Market data wants the class leaderboard ranked for the growth deck, with the tie question answered out loud: RANK leaves gaps after ties, DENSE_RANK doesn't, and the deck's footnote changes with the choice. Each ask ships twice — once to answer, once with the definition spelled out.",
    "**15:00 —** The afternoon belongs to settlement and stakeholder cycles. Finance walks the ledger — **debits $181,080 against credits $181,080, delta $0.00** — and the per-account nets (cash $44,196, receivables $16,440) feed the close checklist. The venue review re-runs the settlement-coverage census: 21 exact, 1 {amber:partial} at $4,000.00 of $6,148.00, 6 with no settlement leg — and asks the only question that matters: *do the classes sum back to the invoice base?* A growth partner wants month-bucketed volume (SUBSTR month keys, 6–9 orders a month on this book) defended from the query, not the slide.",
    "**17:30 —** EOD is the writeup. The census ships with its survival rule in the comment (every fill matches a listed asset here, but the LEFT JOIN stays — *the day an asset lists without trading, the INNER silently deletes it*); the leaderboard ships with its tie policy; the anomaly log carries both mirror modes with queries attached. The rhythm to internalize: Coinbase SQL exists to prove that trading and custody tell the same story — *the fill is the claim, the position is the state, and the ledger is the referee between them.*",
    "**21:15 —** The late sweep is settlement-side. The stack re-runs — {emerald:paid} 21 / $66,443.00, {amber:open} 6 / $19,609.00, {rose:void} 1 / $925.00, **TOTAL 28 / $86,977.00** leading the board by sort key — and the coverage census ties behind it: 21 exact ($65,612.00) + 1 partial ($4,000.00 of $6,148.00) + 6 with no leg ($15,217.00) sum back to the banner to the cent. The rail cross-foot follows: card $37,364.00 + wire $32,248.00 = $69,612.00, the cash account's debit total, no drift. The anomaly log closes the night: #11 {rose:void-but-paid} at $925.00, #28 {emerald:paid} with zero legs at $1,756.00, five split-settled invoices folding two legs each — *the file goes out only when the three reads agree.*",
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
    { name: "Venue concentration", what: "Nordic Gadgets AB holds 32% of notional ($11,130.25), Midwest Hardware 26.7% ($9,294.93) — top-two share 58.7% across six custody venues. The trusted bench (rating ≥ 4.5) is just Nordic 4.6 and Alpine Audio 4.8; concentration is the venue-risk line custody ops walks quarterly." },
    { name: "Settlement rails", what: "Payment legs by method: card 16 legs / $37,364.00 against wire 11 / $32,248.00 — 27 legs, $69,612.00, tying to the cash account's debits. The two-way read proves the rail fold and the ledger agree before either ships." },
    { name: "Settlement velocity", what: "Terms are 30 days flat (min = max), and paid invoices settle in 28.4 days on average — fastest 13, slowest 84 — across the 20 paid invoices that carry legs. The aging curve finance quotes when open AR ($19,609.00) gets challenged." },
    { name: "Expense calendar", what: "Rent dominates the overhead book: 14 entries / $16,800.00 against Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00 — with the 2024-08 spike to $3,210.00. The month fold that flags a spend anomaly before finance does." },
  ],

  topics: [
    {
      name: "Notional folds over fills",
      why: "Every volume claim here is a fold over fills: SUM(quantity × unit_price), grouped by asset or class. The trap is the fan-out — joins multiply fill rows, and a fold over the wrong grain prints dollars that don't reconcile. Coinbase drills the fold before it lets you rank.",
      slugs: ["products-worth-over-invoices", "number-of-rich-customers", "top-earners", "customer-order-frequency", "find-third-transaction"],
    },
    {
      name: "Tie-aware ranking with RANK & DENSE_RANK",
      why: "Leaderboards are the exchange's native output — and ties are native too. RANK leaves gaps after a tie, DENSE_RANK doesn't, ROW_NUMBER deals arbitrary order; on a volume leaderboard the difference changes which class the deck calls 'second'. The tie rule is a footnote that must be chosen, not defaulted.",
      slugs: ["rank-scores", "second-highest-salary", "department-top-three-salaries", "amount-anomaly-zscore", "customers-with-maximum-number-of-transactions-on-consecutive-days", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Custody censuses with FILTER",
      why: "Position meetings open with one-pass censuses: per class, assets listed, deep positions, units moved — COUNT with FILTER (WHERE …) counting subpopulations without scanning twice. The conditional-COUNT-DISTINCT shape is the custody craft: positions are distinct assets even when the fills fan out beneath them.",
      slugs: ["recyclable-and-low-fat-products", "find-stores-with-inventory-imbalance", "snaps-analysis"],
    },
    {
      name: "Class chains: orders → fills → assets",
      why: "Asset analytics is a chain join: fills attach to assets, assets roll up to classes. The join keys are the interview — one wrong column and the chain silently pairs fills with the wrong class, and every fold downstream inherits the fiction.",
      slugs: ["product-sales-analysis-ii", "product-sales-analysis-iii", "most-frequently-ordered-product-per-customer", "investments-in-2016", "duplicate-charge-pairs"],
    },
    {
      name: "Argmax: biggest fill per day",
      why: "'What was the largest trade today?' is argmax over a fold — and the naive MAX-join-back doubles rows on ties while ROW_NUMBER picks one arbitrarily unless the tie-break is stated. Maximum-per-day shapes feed the tape, the risk alerts and the client recaps.",
      slugs: ["maximum-transaction-each-day", "the-first-day-of-the-maximum-recorded-temperature-in-each-city", "find-longest-calls", "customer-placing-the-largest-number-of-orders", "first-and-last-call-on-the-same-day"],
    },
    {
      name: "Running balances & frames",
      why: "Custody balances are walks: units in, units out, running position after each fill. Window frames (ROWS/RANGE) and running sums are the mechanics, and the frame choice — default vs explicit — decides whether the walk includes the current row or starts before it.",
      slugs: ["account-balance", "game-play-analysis-iii", "running-total-for-different-genders", "daily-balance-interest"],
    },
    {
      name: "Two-sided reads & pivots",
      why: "Taker versus maker, buys versus sells, weekday versus weekend — exchange reads compare two measures of the same population side by side. Self-joins, CASE pivots and conditional sums all do it; the interview is which shape keeps the grain stable.",
      slugs: ["apples-and-oranges", "reformat-department-table", "sales-by-day-of-the-week", "circular-transfers"],
    },
    {
      name: "Fee tiers & honest ratios",
      why: "Fee share, maker ratio, class concentration — every rate is a ratio over a fold, and both failure modes are graded: INTEGER 100 truncating small shares to zero, and a WHERE that shrinks the denominator to the numerator's population. Weighted averages (notional-weighted price) are the advanced cut.",
      slugs: ["average-selling-price", "card-launch-success", "countries-you-can-safely-invest-in", "queries-quality-and-percentage", "chargeback-rate-ranking", "calculate-compressed-mean"],
    },
    {
      name: "Volatility windows: LAG price moves",
      why: "Market data lives on deltas: this fill versus the previous one, this month's volume versus last. LAG/LEAD over ordered fills and month buckets are the mechanics, and the deterministic ORDER BY (price, then id) is what keeps a delta meaningful when rows share a timestamp.",
      slugs: ["year-on-year-growth-rate", "biggest-window-between-events", "rolling-average-steps", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "Calendar spines & WITH RECURSIVE",
      why: "Volume calendars need every day present — including the days nothing traded, which a plain GROUP BY erases. Generating the spine and LEFT-joining activity onto it is the shape WITH RECURSIVE teaches, and the zero-fill discipline is the interview's actual subject.",
      slugs: ["find-the-missing-ids", "total-sales-amount-by-year", "find-the-subtasks-that-did-not-execute", "friday-purchases-ii"],
    },
    {
      name: "Venue folds & concentration",
      why: "Custody venues are the suppliers of this exchange: each asset lists at one venue, and notional per venue is a two-hop fold — fills → assets → venue. The probed board runs Nordic $11,130.25 (32%) down to Pacific $2,980.15 (8.6%), and the concentration read (top-two 58.7%) is the venue-risk line. The listings floor — HAVING COUNT(DISTINCT asset) — is the gate custody ops argues about.",
      slugs: ["sales-analysis-i", "sales-analysis-iii", "customers-who-bought-all-products"],
    },
    {
      name: "Settlement stacks & grand totals",
      why: "The settlement report is a stack: per-status fold (paid 21 / $66,443.00, open 6 / $19,609.00, void 1 / $925.00) UNION ALL a re-folded TOTAL row (28 / $86,977.00) that leads the board by sort key. UNION ALL vs UNION is the contract — the banner must never be subject to a dedupe — and the TOTAL branch folds the table, not the stack, so the check can't re-derive its own answer.",
      slugs: ["monthly-transactions-ii", "bank-account-summary", "gl-reconciliation", "cohort-repeat-revenue"],
    },
    {
      name: "Month buckets & HAVING gates",
      why: "Volume calendars bucket by STRFTIME('%Y-%m', created_at) — 14 months, 6–9 orders each — and the desk's questions are gated: 'months with 9+ orders' keeps exactly 2024-02 ($3,609.64) and 2024-09 ($3,116.04). The gate lives in HAVING because it judges the fold, and a threshold near a boundary is probed one step either side before it ships.",
      slugs: ["list-the-products-ordered-in-a-period", "monthly-transactions-i", "unique-orders-and-customers-per-month", "calculate-orders-within-each-interval"],
    },
    {
      name: "Coverage censuses & anti-join holes",
      why: "Every invoice is exact / partial / no settlement — 21 / 1 / 6 — and the 'no settlement' class ($15,217.00) is the hole the census exists to expose. LEFT JOIN to the folded payment legs keeps the hole visible; INNER silently deletes it; NOT IN with a NULL leg empties the whole report. The fold must complete per invoice before the classification test.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "prepayment-detection"],
    },
    {
      name: "Ledger proofs & self-auditing queries",
      why: "The ledger is the referee: $181,080 debits = $181,080 credits, cash nets $44,196.00, and the rail cross-foot ($37,364.00 + $32,248.00 = $69,612.00) must tie to cash's debits. The craft is queries that prove themselves — a TOTAL row that re-folds the table, a delta column expected zero — so reconciliation ships inside the artifact, not beside it.",
      slugs: ["trial-balance-check", "balance-rollforward", "suspicious-bank-account-transactions"],
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
    {
      id: "coinbase-t9",
      q: "The settlement report stacks a per-status fold and a grand-total row. When does UNION ALL versus UNION actually matter — and what does plain UNION do to the stack?",
      a: "UNION ALL appends rows verbatim; UNION dedupes the whole result set as a final step. On this stack — paid 21/$66,443.00, open 6/$19,609.00, void 1/$925.00, TOTAL 28/$86,977.00 — every row is distinct, so plain UNION returns the same four rows today and the difference looks academic. It isn't: the day two branches legitimately coincide (a status fold where one status's count equals another's — or a TOTAL row whose values match a detail row, which happens on a one-row book), UNION silently deletes one. Set-op contracts: both branches must agree on column count and types positionally — names come from the FIRST branch only, which is why the TOTAL branch re-states the fold expressions instead of referencing aliases. At Coinbase the rule is mechanical: banners and stacks use UNION ALL, and if you reach for plain UNION you must name the exact duplicate pair you're removing — 'just in case' dedupe is how a settlement file loses a row and still balances.",
      tag: "setops",
    },
    {
      id: "coinbase-t10",
      q: "A teammate ranks venue notionals straight off the three-table join, fold and RANK in one SELECT. You stage a CTE first. What does the staging buy?",
      a: "The staged version folds per venue in a CTE (one row per venue), then ranks the fold — a few lines later the query reads top-down: fold, rank, order. The one-SELECT version forces the window to run on top of the GROUP BY fold, where the ranking expression and the fold expression are welded together — change the fold and you re-derive the rank by hand. Staging also gives you a place to inspect: SELECT * FROM venue_notional runs alone, and the probed board (Nordic $11,130.25 down to Pacific $2,980.15) can be eyeballed before it's ranked. There's a correctness angle too: the venue fold is a two-hop chain (fills → assets → venue), and staging the fold is where the fan-out dies — rank-after-fold never re-multiples rows. The Coinbase habit: a CTE with an honest name ('venue_notional', not 't1') is documentation the optimizer keeps, and when the interviewer asks 'one row per what?' at each stage, the staged query answers itself.",
      tag: "staging",
    },
    {
      id: "coinbase-t11",
      q: "Two payments land the same day and your running paid-total jumps by both at once — or doesn't. What decided that, ROWS or RANGE?",
      a: "The frame. ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW counts physical rows — each payment adds its own amount, ties stream in one at a time in the ORDER BY order. RANGE treats peers — rows sharing the ORDER BY value — as one frame unit: two payments on the same paid_on enter the running sum together. Neither is wrong; they answer different questions, and the bug is assuming one while writing the other. Invoice #5 settles in two legs ($2,642.00 card, $2,642.00 wire, different days) where the choice is invisible — the trap only fires on same-key rows, which is exactly when it's hardest to see. The Coinbase discipline: write the frame explicitly (the default RANGE UNBOUNDED PRECEDING TO CURRENT ROW surprises nobody who names it), state whether peers should move together — for money that posts in batch, RANGE is usually the honest read — and test the walk on an invoice you know has split legs.",
      tag: "frames",
    },
    {
      id: "coinbase-t12",
      q: "'Months with at least 9 orders' — one teammate writes WHERE COUNT(*) >= 9 and gets a syntax error; another wraps the fold in a subquery and filters outside. Where does the gate actually belong?",
      a: "In HAVING — the clause that exists precisely to judge aggregates after the fold. WHERE runs before grouping, where COUNT(*) doesn't exist yet: the error is the engine telling you the row count wasn't knowable at that stage. The subquery-around-it version works but buries a one-line gate in two nesting levels. This month census gates on the fold — HAVING COUNT(*) >= 9 keeps 2024-02 (9 orders, $3,609.64) and 2024-09 (9 orders, $3,116.04) and nothing else; move the gate to 8 and four more months flood in, set it to 10 and the report empties. The judgment call the interviewer grades: row-level rules (which orders count) live in WHERE, group-level rules (which months qualify) live in HAVING, and a gate near a boundary is verified by probing one step either side — at an exchange, a volume floor that silently admits the months it was meant to exclude is a deck that lies.",
      tag: "gates",
    },
    {
      id: "coinbase-t13",
      q: "The settlement manifest wants every payment method per invoice in one cell — 'card, wire'. What does GROUP_CONCAT promise, what doesn't it, and where does the order come from?",
      a: "GROUP_CONCAT(method) folds the group's values into one comma-joined string — but the order within the string is unspecified in stock SQLite (no ORDER BY inside the aggregate on older builds), so 'card, wire' versus 'wire, card' is not a contract you can ship to a reconciliation diff. What it does promise: one row per group, NULLs skipped, a custom separator via GROUP_CONCAT(method, ' | '), and a length that grows with the group — an unbounded fold that can swallow a report row. The Coinbase use is manifests and audit trails: per invoice, list its payment legs so the split-settled five (invoices 1, 5, 12, 19, 22 — two legs each) are visible at a glance. The craft: fold the legs in a CTE first so the manifest joins back 1:1, state the separator, and never parse the string back apart downstream — if the consumer needs structured legs, the fold is the wrong shape, and a proper join is the honest answer.",
      tag: "manifests",
    },
    {
      id: "coinbase-t14",
      q: "Invoice amounts are INTEGER cents; order totals are REAL dollars. Where do the two scales meet in one query, and what's the failure mode when the division is skipped or misplaced?",
      a: "They meet anywhere a settlement number touches a trade number — coverage censuses, rail cross-foots, ledger tie-outs — and the rule is one division, at the display edge: ROUND(SUM(amount_cents) / 100.0, 2). Skip the division and the stack prints 66,44300 instead of $66,443.00 (a 100× lie the eye reads as plausible); divide per row before folding and you've done 28 rounds where one would do — harmless here, a rounding-drift source when amounts carry fractional cents; divide with INTEGER 100 and truncation eats the remainder. The subtle one: the ledger is cents too, so the cross-foot card $37,364.00 + wire $32,248.00 = $69,612.00 only matches the cash account's 69,612 debit-cents because BOTH sides divided the same way. At Coinbase the audit isn't 'is the number big' — it's 'did both scales survive to the same unit', and a mismatched unit pair is the reconciliation bug that never throws.",
      tag: "units",
    },
    {
      id: "coinbase-t15",
      q: "Fee share = fee_cents / notional_cents. Notional can be zero on a quiet day. What does the database do, and what do you write instead?",
      a: "Division by zero errors in most engines; SQLite returns NULL for x/0 — which is worse, because the report keeps printing with holes that look like missing data rather than a rule firing. The guard is NULLIF on the denominator: fee_cents / NULLIF(notional_cents, 0) — zero notional becomes NULL, the ratio reads NULL, and the NULL policy applies: NULL is 'no denominator exists', a real state worth surfacing, not zero. COALESCE(ratio, 0) is the wrong reflex — it launders 'undefined' into 'no fees', which is exactly the claim a compliance read can't back. Same guard on percentage shares: 100.0 * paid_cents / NULLIF(amount_cents, 0) — and note the order: NULLIF wraps the raw column, the 100.0 promotes the arithmetic to real before the division. At Coinbase every ratio metric (fill ratio, fee share, coverage pct) carries the guard by default, because the quiet day always arrives eventually and the query should say 'undefined', not invent a number.",
      tag: "guards",
    },
    {
      id: "coinbase-t16",
      q: "Three ways to find invoices with no settlement leg: NOT IN, NOT EXISTS, LEFT JOIN … IS NULL. Rank them and defend the ranking.",
      a: "NOT EXISTS first: correlated, stops at the first match, NULL-safe — a NULL invoice_id in payments can't poison it because it never builds a value list to compare against. LEFT JOIN … IS NULL second: same NULL safety, reads as a visible 'left side kept, right side missing', and doubles as the shape that carries columns from the matched side when you need them later; the cost is materializing the join before the filter. NOT IN last, conditionally: it's the readable one and fast on tiny constant lists, but one NULL in the inner list makes every comparison UNKNOWN and the result set silently empties — the anti-join that answers 'no invoices are unpaid' while six of them ($15,217.00) sit open. The probed census — 6 invoices, $15,217.00, no payment rows — is the sanity cell: whichever shape you ship, it must reproduce 6 and $15,217.00 or it's the wrong shape. At Coinbase the ranking is policy, not taste: NOT EXISTS in shared queries, LEFT JOIN when the hole's neighbors matter, NOT IN only where the inner column is provably NOT NULL.",
      tag: "antijoins",
    },
    {
      id: "coinbase-t17",
      q: "WHERE RANK() OVER (ORDER BY notional) <= 3 — top three classes. Why does this fail, and what are the two ways to say it correctly?",
      a: "Windows are evaluated after WHERE in the logical pipeline — the SELECT's window phase runs late, so WHERE can't see a ranking that doesn't exist yet; the engine rejects the reference outright. The two correct shapes: wrap the windowed SELECT in a derived table (or CTE) and filter the rank outside — SELECT * FROM (SELECT …, RANK() OVER … AS rnk) WHERE rnk <= 3 — or, when the rule is genuinely row-level (top three by a raw column), skip the window and use ORDER BY … LIMIT 3, accepting its tie blindness. The distinction the interviewer grades: LIMIT cuts rows without understanding ties (OFFSET arithmetic on a tie returns a tie-mate), a ranked filter honors the tie policy the board promised. On the class leaderboard the probed board is tie-free today, but the query is written for the day two classes tie at the cut — the CTE shape keeps RANK's gap semantics load-bearing instead of hoping LIMIT gets lucky.",
      tag: "windoworder",
    },
    {
      id: "coinbase-t18",
      q: "A teammate 'fixes' a doubled report by sprinkling SELECT DISTINCT over it. When is DISTINCT a legitimate tool and when is it a smell?",
      a: "DISTINCT is legitimate when the population genuinely has duplicates you want collapsed to identities — a distinct-asset count (COUNT(DISTINCT p.id)) inside a fold, or distinct custody venues touched. It's a smell when it papers over a fan-out: the join emitted asset × fill rows, the counts doubled, and DISTINCT hides the doubling while leaving every OTHER aggregate over the same rows wrong — the notional still sums once per fill-line, only the count looks healthy. The tell: if removing DISTINCT changes only some of the numbers, the join is the bug and DISTINCT is the bandage. The Coinbase rule at review: a DISTINCT must be load-bearing — you can say which duplicates it collapses and why the collapsed grain is the report's grain ('one row per venue', not 'one row per whatever survived'). Sprinkled DISTINCT also masks real duplicate rows — a genuinely double-posted settlement leg looks like ordinary data, which is exactly what surveillance exists to catch.",
      tag: "distinct",
    },
    {
      id: "coinbase-t19",
      q: "LEAD(paid_on) OVER (ORDER BY paid_on) to find the gap to the next settlement — the last row comes back NULL. What is that NULL, and how do reports usually mishandle it?",
      a: "It's the frame edge, not missing data: LEAD has no next row to look at, so the last settlement's 'gap to next' is genuinely undefined. The mishandling is COALESCE-ing it to zero or to the average — suddenly the slowest invoice (84 days to settle on this book, the probed slowest) reads as a 0-day gap, and the aging report's tail is fiction. The honest shapes: leave the NULL and let the display say 'latest', guard the gap math — JULIANDAY(LEAD(paid_on)) - JULIANDAY(paid_on) — so the edge stays NULL, or name the frame explicitly so the reader sees the edge coming. LAG has the mirror problem on the first row. At Coinbase the edge NULL is a feature: the 'next settlement' of the most recent payment is a question about the future, and a report that fabricates an answer to a future question is the one thing the settlement desk will not sign.",
      tag: "leadcensor",
    },
    {
      id: "coinbase-t20",
      q: "Two runs of the same leaderboard return different row orders. No ties in the data. What's going on and what's the fix?",
      a: "An ORDER BY that isn't a total order: ordering by a column with duplicate values (status, month) leaves rows with equal keys in engine-chosen order, which can shuffle between runs as the planner picks different scan paths. Even with no ties in the ranked metric, the board may be sorted by something else — or by nothing (a CTE's natural order is not a contract). The fix is a tie-break that makes the order total: ORDER BY notional DESC, category — the second key never fires today (seven distinct notionals) but the day two classes tie, the board doesn't flicker. Same discipline on the settlement stack: the banner sorts by total_usd, and the detail rows break their (non-)ties by name. The Coinbase bar: any query a deck quotes must return byte-identical output on every run — determinism is reproducibility, and reproducibility is what lets two analysts diff their numbers instead of debating them.",
      tag: "determinism",
    },
    {
      id: "coinbase-t21",
      q: "invoices.number and invoices.id both identify an invoice. When does the choice matter — and what breaks when a report joins on the wrong one?",
      a: "id is the surrogate: integer, unique, never meaning-laden. number is the business key: human-facing, possibly reused across years, possibly NULL in staging. Analytics joins on the surrogate (payments.invoice_id → invoices.id) because it's stable and cheap to compare; reports display the business key because humans reconcile against it. The failures: joining payments to invoices on a string-matched number silently drops the rows whose formats disagree; aggregating by number across years invents collisions; and storing the surrogate in a spreadsheet that later re-imports with new ids severs every historical join. On the coverage census the join is p.invoice_id = i.id — surrogate, exact — and the label shown is the business identifier. The Coinbase habit: every query that moves money states the join key class out loud (surrogate for correctness, business key for eyes), and never the twain in the same predicate — the day someone writes WHERE number = id, both systems are lying at once.",
      tag: "keys",
    },
    {
      id: "coinbase-t22",
      q: "Ship the coverage census with a proof inside it. What does an in-query cross-foot look like?",
      a: "The census prints its own balance check as extra rows or columns: beside the three coverage classes, a TOTAL row (UNION ALL, same fold over the raw invoices table) that must read 28 invoices / $86,977.00 — and the classes sum to exactly that (21 + 6 + 1; $65,612.00 + $15,217.00 + $6,148.00), so the reader verifies reconciliation at a glance instead of trusting the author. The stronger version computes the delta as a column: total invoices minus the class-fold sum, aliased check_delta, expected 0. The craft is keeping the check cheap (one extra fold over 28 rows) and honest (the TOTAL row folds the TABLE, not the classified CTE — otherwise the check re-derives its own answer). At Coinbase this is the settlement desk's signature move: a report that can prove itself is the difference between 'trust me' and 'here is the zero', and the day the delta isn't zero, the query pages before the slide ships.",
      tag: "crossfoot",
    },
    {
      id: "coinbase-t23",
      q: "103 orders and 251 fills — does performance even matter here? What do you optimize when the data is small, and what habit survives scale?",
      a: "Small data forgives everything, which is exactly why habits matter: the queries you write on 251 rows are the ones that run in production on 251 million. What transfers: sargability (a WHERE on the raw column — created_at >= '2024-01-01' — can use an index; wrapping the column in STRFTIME('%Y', created_at) = '2024' cannot, because the function hides the column from the index), early grain reduction (filter or fold before joining, so the fan-out works on fewer rows), one scan with conditional aggregates instead of four passes (the FILTER census), and never correlating a scalar subquery into a big outer query when a staged join-back does it once. What doesn't transfer: micro-optimizations and index trivia on 16-row tables — the interviewer cares whether you know WHEN it matters. The Coinbase framing: exchanges are one of the few domains where the volume fold IS the product — fold early, filter before you fan out, and measure before you tune is the habit the desk actually hires.",
      tag: "performance",
    },
    {
      id: "coinbase-t24",
      q: "SUBSTR(created_at, 1, 7) and STRFTIME('%Y-%m', created_at) produce the same month bucket on this book. Which do you ship, and what contract does each imply?",
      a: "They agree only while created_at is fixed-width ISO 'YYYY-MM-DD …' — SUBSTR chops characters positionally and never looks at the calendar, so the moment a column arrives as 'D/M/YYYY' or with a timezone suffix, it silently buckets by garbage while STRFTIME parses the date it's given and fails loudly or shifts correctly. STRFTIME's contract is richer: '%Y' folds to years (90 orders in 2024, 13 in 2025), '%m' merges every January against every February, '%Y-%m-%d' goes to day grain — the format string IS the bucket definition, reviewable in one glance. SUBSTR's only advantages are speed and leniency, and leniency is the bug. The Coinbase rule: SUBSTR appears only in throwaway probes where the format is verified two lines up; shipped reports use STRFTIME and name the format string as the bucket — because at an exchange, a volume calendar that buckets by character position is one import away from printing a month that never traded.",
      tag: "datefns",
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
    {
      id: "coinbase-mcq-11",
      prompt: "Coverage census: invoices LEFT JOIN payments, grouped per invoice. Six invoices have no settlement leg. What do COUNT(*) and COUNT(p.amount_cents) read for those invoices?",
      choices: [
        "Both read 0 — the join found nothing",
        "COUNT(*) reads 1, COUNT(p.amount_cents) reads 0 — the LEFT JOIN's NULL row is still a row",
        "COUNT(*) reads 0, COUNT(p.amount_cents) reads 1",
        "Both read 1 — COUNT always finds the group",
      ],
      answer: 1,
      why: "A LEFT JOIN emits one row per unmatched left side with NULLs in every right column — and that row is real. COUNT(*) counts it; COUNT(p.amount_cents) skips the NULL. The probed census: six invoices (18, 21, 24, 26, 27, 28) show star=1, column=0 — the exact-versus-no-leg distinction lives in which COUNT you picked.",
      notes: [
        { choice: 0, why: "The join kept the invoice — one row, NULL legs. Zero would mean the row vanished, which only an INNER JOIN does; the whole point of the census is that LEFT keeps the hole visible." },
        { choice: 3, why: "COUNT(*) reads 1 because the unmatched row exists; COUNT(column) reads 0 because its argument is NULL on that row. The two disagreeing IS the signal." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-12",
      prompt: "SELECT STRFTIME('%Y', created_at) AS yr, COUNT(*) FROM orders GROUP BY yr — how many rows come back, and what does the biggest read?",
      choices: [
        "2 rows; 2024 reads 90",
        "14 rows; 2024-01 reads 8",
        "2 rows; 2024 reads 103",
        "1 row; the whole book folds to one count",
      ],
      answer: 0,
      why: "The format string IS the bucket definition: '%Y' folds 103 orders into two calendar years — 90 in 2024, 13 in 2025 (probed). '%Y-%m' would give 14 month buckets; GROUP BY only collapses to one row when the key is constant.",
      notes: [
        { choice: 1, why: "14 rows is the month-bucket grain — '%Y-%m', not '%Y'. The format string chose the grain; this one chose years." },
        { choice: 2, why: "103 is the whole book with no GROUP BY at all. Once you group by year, each row counts only its own bucket — 90 and 13." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-13",
      prompt: "The settlement manifest wants each invoice's rail list in one cell: GROUP_CONCAT(method, ' | '). Which promise does the function actually make?",
      choices: [
        "One row per group with the separator you asked for — but the order inside the string is unspecified",
        "Alphabetically ordered values, pipe-separated",
        "One string per row of the table, not per group",
        "Deduplicated values, comma-separated",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds the group into one value honoring your separator — 'card | wire' and 'wire | card' are both legal outputs on stock SQLite, which guarantees no order inside the string. It's a display fold: great for manifests, never a contract to parse or diff.",
      notes: [
        { choice: 1, why: "No ORDER BY inside the aggregate on older SQLite builds — alphabetization is a hope, not a promise. If the order matters, the manifest is the wrong shape." },
        { choice: 3, why: "GROUP_CONCAT keeps duplicates — a two-leg invoice shows both legs. Dedupe would hide the split-settled five (invoices 1, 5, 12, 19, 22), exactly the rows the manifest exists to expose." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-14",
      prompt: "'Months with at least 9 orders.' The month fold runs 6–9 orders across 14 months. Which months does HAVING COUNT(*) >= 9 keep?",
      choices: [
        "2024-02 and 2024-09 — both sit exactly on 9",
        "2024-01 and 2024-03 — the two 8-order months",
        "All 14 months — nothing trades fewer than 6",
        "None — 9 orders is the maximum, and HAVING is exclusive",
      ],
      answer: 0,
      why: "The probed trend tops out at 9 orders twice — 2024-02 and 2024-09 — and >= is inclusive, so both survive the gate. HAVING judges the fold (WHERE can't see COUNT), and a boundary gate is probed one step either side: 8 floods the 8-order months in, 10 empties the report.",
      notes: [
        { choice: 1, why: "The 8-order months fail >= 9. The gate keeps exactly the months sitting ON the boundary, which is why the threshold is the part ops argues about." },
        { choice: 3, why: ">= is inclusive — the months exactly on 9 are the ones it keeps. HAVING COUNT(*) > 9 is the gate that empties this report." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-15",
      prompt: "Split-settlement census: GROUP BY invoice_id over payments, HAVING COUNT(*) = 2. Which invoices come back?",
      choices: [
        "1, 5, 12, 19, 22 — the five split-settled invoices",
        "25 — the partial settlement",
        "11 and 28 — the void-but-paid and paid-with-no-legs anomalies",
        "All 22 invoiced accounts — every invoice has legs",
      ],
      answer: 0,
      why: "The probed leg fold reads 2 legs for exactly five invoices — 1, 5, 12, 19, 22, two settlement legs each. #25 is one leg against a $6,148.00 face (partial, not split), and #28 has zero legs — the anomaly visible only in its absence from the fold.",
      notes: [
        { choice: 1, why: "#25 has one payment leg ($4,000.00 of $6,148.00) — COUNT(*) = 1. Partial and split are different facts: legs count versus face coverage." },
        { choice: 2, why: "#11 settled its full $925.00 on one leg (COUNT = 1) and #28 has no legs at all (no group in the fold). Neither touches the = 2 gate." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-16",
      prompt: "Classifying settlement coverage per invoice: SUM(p.amount_cents) against face. Why must the 'no settlement' arm test SUM(...) IS NULL before the equality arm?",
      choices: [
        "NULL = anything is UNKNOWN, so an equality tested first silently drops the six no-leg invoices from every stated class",
        "NULL sorts before numbers, so the equality arm would run first anyway",
        "IS NULL is cheaper, and the arms are logically interchangeable",
        "Because SUM errors on an empty group",
      ],
      answer: 0,
      why: "On the six no-leg invoices the LEFT JOIN yields no payment rows, and SUM over nothing is NULL — NULL = face is UNKNOWN, never TRUE, so an equality-first CASE hands them to no stated class unless a final ELSE catches them. The NULL arm first turns 'no leg' into a declared class (6 invoices, $15,217.00), not an ELSE-shaped accident.",
      notes: [
        { choice: 1, why: "Sort order has nothing to do with CASE evaluation — arms run top-down and the first TRUE wins. The bug here is UNKNOWN, not ordering." },
        { choice: 3, why: "SUM over zero rows returns NULL, not an error — that NULL is the whole trap. COUNT returns 0; SUM returns NULL; the arm order decides which class sees it." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-17",
      prompt: "You need each asset ranked by notional WITHIN its custody venue. What does PARTITION BY supplier_id add to RANK() OVER (...)?",
      choices: [
        "The ranking restarts per venue — every venue's top asset reads rank 1",
        "The ranking ignores venue boundaries and ranks the whole book",
        "It deduplicates assets that appear at multiple venues",
        "It changes the sort direction inside each venue",
      ],
      answer: 0,
      why: "PARTITION BY slices the window: RANK() OVER (PARTITION BY supplier_id ORDER BY notional DESC) ranks assets inside each of the six venues, resetting at every boundary. Without the partition, one ORDER BY ranks all 16 assets globally and six venues' worth of 'rank 1' collapses to one.",
      notes: [
        { choice: 1, why: "That's the un-partitioned version — a global leaderboard. The venue cut is precisely what PARTITION BY contributes; the ORDER BY inside OVER never segments by itself." },
        { choice: 3, why: "PARTITION BY changes the frame of reference, never the direction — that's the ORDER BY's job (DESC for biggest-first)." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-18",
      prompt: "In the settlement stack, why does the TOTAL branch re-state ROUND(SUM(amount_cents) / 100.0, 2) instead of referencing the first branch's face_usd alias?",
      choices: [
        "Set-op branches align positionally and column names come from the first branch only — later branches can't see its aliases",
        "For performance — referencing aliases would re-scan the table",
        "Aliases are only visible in ORDER BY — but here it would still work",
        "Because UNION ALL renames duplicate columns",
      ],
      answer: 0,
      why: "A UNION ALL is two independent SELECTs whose columns pair by position, and the output names come from the first branch alone. The second branch has no face_usd to reference — the expression must be rebuilt there, which is also why the TOTAL row folds the raw table: the banner can't re-derive its own answer from the stack it sits on.",
      notes: [
        { choice: 3, why: "UNION ALL doesn't rename anything — it appends rows verbatim. Column identity is positional; a mismatch in count or type domain is where stacks break." },
        { choice: 2, why: "Half right, wrong conclusion: aliases survive into the same SELECT's ORDER BY, but a UNION branch is a separate SELECT — the alias is out of scope, full stop." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-19",
      prompt: "Both predicates fetch the same year of the 103-order book. Which one can use an index on orders.created_at, and why?",
      choices: [
        "created_at >= '2024-01-01' — the raw column stays comparable against the index",
        "STRFTIME('%Y', created_at) = '2024' — SQLite rewrites it into a range",
        "Both — the planner sees through scalar functions",
        "Neither — TEXT date columns are never indexable",
      ],
      answer: 0,
      why: "A function wrapped around the column hides it from the index: the planner can't know which dates STRFTIME will call '%Y' = 2024, so it scans. The range predicate keeps the bare column beside the constant — sargable, index-usable. Same rows, different access path, and on a 251-million-fill tape that difference separates a dashboard from an outage.",
      notes: [
        { choice: 2, why: "Planners see through very few rewrites; SQLite doesn't invert STRFTIME. The habit matters precisely because the rewrite doesn't happen." },
        { choice: 3, why: "ISO-8601 TEXT dates sort correctly and index fine — the blocker is the function wrap, not the type." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-20",
      prompt: "'Fill notional above this fill's asset-class average.' Which build is the one that survives review?",
      choices: [
        "Stage the per-class average in a CTE and join it back — the fold runs once, the comparison reads top-down",
        "A correlated scalar subquery re-deriving AVG per row is the only correct shape",
        "Compute the book-wide average once and compare every fill to it",
        "Filter with HAVING AVG(notional), since the rule compares averages",
      ],
      answer: 0,
      why: "The rule is per-class, so the denominator is the class fold — staging it (one AVG per class) and joining back on class keeps the fold single-pass and the query readable. The correlated version re-runs the average per fill row; the book-wide average answers a different question; HAVING is the wrong clause for a row-level comparison.",
      notes: [
        { choice: 2, why: "Book-wide flattens the rule: a quiet class's ordinary fill reads 'large' against Audio's tape. The class boundary IS the rule." },
        { choice: 3, why: "WHERE runs before grouping — no fold exists yet to compare against, and HAVING judges groups, not rows. That's why the average must be staged, not summoned inline." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-21",
      prompt: "Per-account ledger nets: cash $44,196.00, receivables $16,440.00, opex $25,416.00. Which account carries the negative net, and why is that correct?",
      choices: [
        "sales_revenue at −$86,052.00 — credits exceed debits by design",
        "cash at −$44,196.00 — the exchange is insolvent",
        "operating_expenses — expenses are stored negative",
        "accounts_receivable — unpaid invoices went negative",
      ],
      answer: 0,
      why: "Revenue accounts accumulate on the credit side: sales_revenue shows $0 of debits against $86,052.00 of credits, netting −$86,052.00 (probed). A negative net there is the ledger working; the same sign on cash or receivables would be a page-the-desk anomaly.",
      notes: [
        { choice: 1, why: "Cash nets positive here — $69,612.00 of debit legs (card $37,364.00 + wire $32,248.00) against $25,416.00 credited out. Signs are account-class semantics, not solvency." },
        { choice: 3, why: "Receivables net +$16,440.00 — billed face still open. Negative would mean collected more than billed, the mirror anomaly." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-22",
      prompt: "The probed ship latency: 2.98 days average. Which WHERE clause is the population that average was computed over?",
      choices: [
        "WHERE shipped_at IS NOT NULL — 82 completed orders (52 delivered + 30 shipped)",
        "No WHERE — all 103 orders carry a shipped_at",
        "WHERE status = 'delivered' — only delivered orders prove latency",
        "WHERE status <> 'cancelled' — everything the exchange kept",
      ],
      answer: 0,
      why: "Latency is julianday(shipped_at) − julianday(created_at), and shipped_at is NULL for the 21 uncompleted orders (14 pending + 7 cancelled). The probed 2.98-day average (range 2–4) runs over the 82 rows with a stamp — 52 delivered plus 30 still in transit.",
      notes: [
        { choice: 2, why: "Delivered-only is a defensible narrower cut, but it's a different metric — and the probed figure quotes the stamped population of 82." },
        { choice: 3, why: "That keeps the 14 pending orders with NULL stamps — AVG then silently skips them, which is exactly the population ambiguity the WHERE exists to settle." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-23",
      prompt: "The overhead calendar's crown: which expense category leads on both entry count and dollars, and by how much over the runner-up?",
      choices: [
        "Rent — 14 entries / $16,800.00, more than triple Ads' $4,570.00",
        "Ads — 14 entries, the most of any category",
        "Tools — 5 entries, the largest average per entry",
        "Travel — 3 entries but the largest single charges",
      ],
      answer: 0,
      why: "The probed fold reads Rent 14 / $16,800.00 against Ads 14 / $4,570.00, Travel 3 / $2,521.00, Tools 5 / $1,525.00. Ads TIES Rent on count (14 each) and loses on dollars by $12,230.00 — which is why the fold carries both grains: count alone crowns the wrong category.",
      notes: [
        { choice: 1, why: "The classic tie trap: 14 entries each, but Ads' dollars are a quarter of Rent's. A count-only fold ships that error to the deck." },
        { choice: 2, why: "Tools' average entry is $305.00 — high per entry, but 5 entries against Rent's 14 loses the total fold. Averages are a different leaderboard." },
      ],
      difficulty: "easy",
    },
    {
      id: "coinbase-mcq-24",
      prompt: "Month-over-month order delta via LAG(n) OVER (ORDER BY month). What does 2024-01's delta read, and what should the report do about it?",
      choices: [
        "NULL — the frame edge, honestly left NULL or labeled 'baseline'",
        "0 — no previous month means no change",
        "8 — it carries January's own count",
        "+1 — January to February is the baseline delta",
      ],
      answer: 0,
      why: "LAG has no row before the first month, so the delta is genuinely undefined — the probed walk reads NULL for 2024-01, then +1 for 2024-02 (9 vs 8). Coalescing the edge to zero launders 'no baseline' into 'flat month', which is the aging-report tail bug in miniature.",
      notes: [
        { choice: 2, why: "LAG returns the PREVIOUS row's value; with no previous row it returns NULL, not the current row's 8. Confusing LAG with the current row is the frame edge in its mildest form." },
        { choice: 3, why: "+1 is 2024-02's delta (9 − 8), not 2024-01's. January's delta asks a question about December 2023 — a row the fold doesn't contain." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-25",
      prompt: "Notional per custody venue: Nordic Gadgets AB books $11,130.25. Why can't suppliers join order_items directly?",
      choices: [
        "Fills carry product_id, not supplier_id — the asset hop (products) is the only bridge, and skipping it pairs fills with venues by coincidence or error",
        "It works but is slow — the planner warns on the missing key",
        "Because suppliers.region is TEXT and order_items keys are INTEGER",
        "Because venue notional must always be computed in a CTE",
      ],
      answer: 0,
      why: "The chain is fills → assets → venue: order_items.product_id = products.id, then products.supplier_id = suppliers.id. order_items has no supplier key, so a direct join has nothing to bind on — SQLite would either error on the missing column or, worse, bind on a coincidental numeric match and print a venue ledger nobody traded.",
      notes: [
        { choice: 3, why: "The CTE is a style choice for staging the fold; the chain itself is a correctness requirement. Two JOINs in one SELECT is the honest minimum." },
        { choice: 2, why: "SQLite happily compares TEXT to INTEGER (the comparison is just false) — but here the real issue is that there's no supplier key on fills to compare at all." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-26",
      prompt: "Deep-custody cut: balance >= 100 units. How much of the book sits there?",
      choices: [
        "10 of 16 assets",
        "8 of 16 — the mid-price band",
        "6 of 16 — one per asset class",
        "16 of 16 — every listed asset is deep",
      ],
      answer: 0,
      why: "The probed census reads 10 assets at 100+ units — from the HDMI cable's 500 down to the keyboard's 120 — against 6 below the line, including the flagship Smart Watch S at 40. The cut is the whale-versus-retail split custody ops walks daily, and it's one FILTER away inside the one-pass census.",
      notes: [
        { choice: 1, why: "8 is the mid-price band's product count (price $50–200) — a different census entirely. Balance ≥ 100 units crosses price bands; the $14.99 cable is the deepest position on the book." },
        { choice: 3, why: "Six assets sit below 100 — watch 40, mic 45, headset 60, webcam 70, hub 85, band 95. Price and custody depth are uncorrelated on this book." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-27",
      prompt: "Settlement-days fold: AVG(julianday(paid_on) − julianday(issued_on)) over a LEFT JOIN of all 28 invoices. Six invoices have no payment leg. What happens?",
      choices: [
        "The NULL deltas are skipped silently — the average runs over fewer rows than the report claims",
        "The whole AVG returns NULL",
        "NULLs enter as 0 days and drag the average down",
        "SQLite errors on date arithmetic over NULL",
      ],
      answer: 0,
      why: "Aggregate functions skip NULLs by design: the probed fold averages 27 leg rows, not 28 invoices, and prints a healthy number that never mentions the shrink. The probed metric (20 paid invoices with legs, 28.4 days, fastest 13, slowest 84) states its population; the naked AVG doesn't — pair it with a COUNT of the averaged rows or gate the population in WHERE.",
      notes: [
        { choice: 2, why: "NULLs don't become zero in AVG — they're excluded from both numerator and denominator. The danger is the missing rows, not the weighting." },
        { choice: 3, why: "julianday(NULL) is NULL, not an error — the query ships, which is the problem. Errors get fixed; silent population shrink gets quoted in decks." },
      ],
      difficulty: "medium",
    },
    {
      id: "coinbase-mcq-28",
      prompt: "Invoice #5 settles in two legs — $2,642.00 card, $2,642.00 wire. The nightly diff compares GROUP_CONCAT(method) manifests between runs. What breaks?",
      choices: [
        "The order inside the string is unspecified in stock SQLite — 'card,wire' vs 'wire,card' diffs as a change that never happened",
        "GROUP_CONCAT drops the duplicate 'card' value, so the manifest lies about leg count",
        "GROUP_CONCAT errors when a group has two rows with equal values",
        "The manifest is stable — GROUP_CONCAT sorts by rowid by default",
      ],
      answer: 0,
      why: "Stock SQLite promises one folded string per group and nothing about the order within it — same data, different scan path, different string. #5's identical $2,642.00 legs make 'card,wire' and 'wire,card' equally legal outputs, so the diff cries wolf. Fixed manifests need an explicitly ordered staged fold — which is why manifests are display folds, never diff inputs.",
      notes: [
        { choice: 1, why: "No dedupe — GROUP_CONCAT keeps both legs; the split-settled five (1, 5, 12, 19, 22) all show two entries. The instability is ordering, not loss." },
        { choice: 3, why: "No default sort exists — rowid order is what the scan happens to visit today. A manifest that depends on scan order is a manifest that changes under load." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-29",
      prompt: "Rails cross-foot: card $37,364.00 + wire $32,248.00 = $69,612.00. Which ledger figure must that equal, and which nearby figure is the trap?",
      choices: [
        "The cash account's DEBIT total, $69,612.00 — its $44,196.00 NET is the near-miss",
        "Cash's net balance, $44,196.00",
        "Receivables' debit total, $86,052.00",
        "The ledger's grand total, $181,080.00",
      ],
      answer: 0,
      why: "Every settlement leg is a cash debit in the same cents the rails folded: $69,612.00 of card+wire legs must equal the cash account's debit side ($69,612.00, probed) exactly. The net ($44,196.00) subtracts the $25,416.00 of cash credits — a legitimate number that answers a different question, and the most common wrong cross-foot in the walkthrough.",
      notes: [
        { choice: 2, why: "$86,052.00 is receivables' debit side — invoiced face, not settled cash. Rails settle a subset of the AR book (six invoices open, $15,217.00)." },
        { choice: 3, why: "$181,080.00 = $181,080.00 is the global balance proof — debits equal credits everywhere. The rail cross-foot is one account's slice of that proof, not the proof itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "coinbase-mcq-30",
      prompt: "Every invoice amount on this book is a whole-dollar multiple, so SELECT SUM(amount_cents)/100 prints the same numbers as /100.0. Why does the house rule still demand /100.0?",
      choices: [
        "The coincidence is data-dependent — the first fractional-dollar settlement truncates silently under /100, and nothing errors",
        "/100 is slower — SQLite optimizes the REAL path",
        "/100.0 rounds differently on .50 boundaries",
        "It doesn't — when results agree, either shape ships",
      ],
      answer: 0,
      why: "Integer division truncates before ROUND ever runs: 222,950 / 100 printed 2229 instead of $2,229.50 on payment #24 — caught today because that row carries odd cents. The invoice amounts happen to be whole dollars, so the bug is invisible there — which is precisely why the shape is policy: the day a fractional row lands, /100 eats the cents and the reconciliation never says why.",
      notes: [
        { choice: 2, why: "ROUND's behavior is identical in both shapes — the divergence happens in the division, before ROUND runs. 100.0's job is making the division REAL, not changing rounding." },
        { choice: 3, why: "Agreement on today's data is not a contract — the house shape exists for the data that hasn't landed yet. 'It matches today' is how 100× errors ship." },
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
    {
      id: "cs-coinbase-3",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "Venue board: notional by custody venue",
      brief:
        "Venue-review memo, ahead of the custody meeting: the board reads per custody venue at two grains from one chain — what each venue turns (fills, units moved) and what it books (notional dollars). Probed figures: Nordic Gadgets AB books **$11,130.25** on 43 fills and 82 units; Midwest Hardware turns the most fills of anyone (56) yet books $9,294.93; the quietest venue, Andes, runs 25 fills. The desk reads venues carrying **at least 40 fills** — a floor that keeps thin venues from headline-grabbing — and the board opens with the biggest book. Fill rows fan out under every venue, so listings count with COUNT(DISTINCT) while units and notional SUM over the fan.",
      ask: "Return each custody venue with listings, fills, units moved and notional (2 decimals), keeping only venues with 40+ fills, biggest book first.",
      template:
        "SELECT s.name AS venue,\n       COUNT(DISTINCT p.id) AS listings,\n       COUNT(oi.id) AS fills,\n       SUM(oi.quantity) AS units_moved,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS notional_usd\nFROM suppliers s\nJOIN products p ON p.supplier_id = {1}\nJOIN order_items oi ON oi.product_id = {2}\nGROUP BY s.id\nHAVING COUNT(oi.id) >= {3}\nORDER BY notional_usd {4};",
      slots: [
        {
          answer: "s.id",
          kind: "keyword",
          label: "the asset→venue key",
          why: "Assets hang off venues via p.supplier_id = s.id — the venue's own primary key. s.name compares an integer to text and pairs nothing; p.id compares the product to itself, fanning every venue out to every asset.",
        },
        {
          answer: "p.id",
          kind: "keyword",
          label: "the fill→asset key",
          why: "Each fill names its asset: oi.product_id = p.id. Substituting oi.product_id compares the fill to itself — every fill matches every asset and the fold multiplies by the whole catalog; s.id would match fills to venues by key coincidence.",
        },
        {
          answer: "40",
          kind: "number",
          label: "the thin-venue floor",
          why: "The desk's floor is 40 fills: five of six venues clear it (43, 56, 40, 47, 40) and Andes drops at 25. 41 or 44 would silently amputate the venues sitting exactly on 40 — the boundary the review argues about.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The custody meeting opens with the largest book: Nordic $11,130.25 down the board. ASC is a correct query answering the opposite question — it leads with Pacific's $2,980.15 and buries the venue ops actually talks to.",
        },
      ],
      distractors: ["s.name", "oi.product_id", "s.id", "41", "44", "ASC"],
      walkthrough:
        "One chain, two grains, one floor. The chain binds assets to venues (p.supplier_id = s.id) and fills to assets (oi.product_id = p.id) — each substituted key fails differently: s.name pairs integers with text and empties the board, oi.product_id self-compares and fans every fill against every asset, s.id matches fills to venues by numeric coincidence. Folded per venue: COUNT(DISTINCT p.id) is the listing grain (3, 3, 2, 2, 3, 3 — DISTINCT is immune to the fan-out), COUNT(oi.id) the fill grain (43, 56, 40, 25, 47, 40 — 251 total), SUM(oi.quantity) the units (82, 109, 77, 51, 99, 80), and SUM(quantity × unit_price) the notional — $11,130.25 Nordic, $9,294.93 Midwest, $4,765.63 Alpine, $3,613.25 Andes, $3,049.07 Shenzhen, $2,980.15 Pacific, reconciling to the probed venue ledger. Midwest turns the most fills (56) but books second — *turns and books are different metrics*, and the board shows both. HAVING COUNT(oi.id) >= 40 applies the floor after the fold (WHERE can't see aggregates): Andes' 25 fills drop it, five venues survive, and 41 or 44 would amputate the venues sitting exactly on the line. DESC opens with Nordic's book. Chain, grains, floor, direction — the venue board the custody meeting walks.",
    },
    {
      id: "cs-coinbase-4",
      tier: "hard",
      topic: "x3",
      universe: "month-close",
      title: "Settlement stack: status fold with a TOTAL banner",
      brief:
        "Month-close memo from the finance desk: the settlement stack is one page — face value folded per invoice status, then a `TOTAL` banner appended so the reader sees the whole book before the split. Probed cells: **21 paid** invoices carry $66,443.00 of face, **6 open** carry $19,609.00, **1 void** carries $925.00 — and the stack must cross-foot to **28 invoices, $86,977.00**. Face lives in INTEGER cents; the dollar read is `amount_cents / 100.0`, and the banner row is a literal, not a rollup the engine invented.",
      ask: "Return one row per invoice status with invoice count and face value in dollars (2 decimals), plus a TOTAL row, biggest face first.",
      template:
        "SELECT i.status,\n       COUNT(*) AS invoices,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS face_usd\nFROM invoices i\nGROUP BY {1}\nUNION ALL\nSELECT {2},\n       COUNT(*),\n       ROUND(SUM(i.amount_cents) / 100.0, 2)\nFROM invoices i\nORDER BY face_usd {3};",
      slots: [
        {
          answer: "i.status",
          kind: "keyword",
          label: "the fold's group key",
          why: "The stack's grain is the settlement status: GROUP BY i.status folds 28 invoices into paid/open/void. i.id would print 28 one-invoice rows (a ledger, not a stack) and i.customer_id would regroup by account — both real folds answering nobody's question.",
        },
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the banner literal",
          why: "The banner row is a string literal — 'TOTAL' — computed with the same fold over the same table, appended by UNION ALL. An unquoted TOTAL is an identifier the table doesn't have (error), and 'PAID' ships a banner that lies about what the row is.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-face-first order",
          why: "The page reads TOTAL $86,977.00, then paid $66,443.00, open $19,609.00, void $925.00. ASC buries the banner logic — void's $925.00 leads — and the reader meets the smallest number first on a page whose headline is the total.",
        },
      ],
      distractors: ["i.id", "i.customer_id", "'PAID'", "TOTAL", "ASC"],
      walkthrough:
        "A stack is two folds appended, not one fold with a magic row. The first SELECT folds 28 invoices by status — GROUP BY i.status: 21 paid / $66,443.00, 6 open / $19,609.00, 1 void / $925.00 — with face read through the cents gate, SUM(amount_cents) / 100.0, rounded once at the display edge. The second SELECT runs the identical fold with no GROUP BY (the whole table is one group) and stamps it with the 'TOTAL' literal: 28 invoices, $86,977.00. UNION ALL appends without deduplicating — here the four rows are distinct so plain UNION happens to agree, but *the banner must never be one dedupe away from vanishing*, so the stack ships UNION ALL on principle. ORDER BY face_usd DESC puts the banner first, then paid, open, void. The distractors fail at the seams: i.id in the group key prints 28 one-row folds plus a banner — a ledger wearing a stack's title; i.customer_id re-grains by account; 'PAID' mislabels the banner while computing the right number — which is worse than computing the wrong one; unquoted TOTAL is a missing column; ASC leads with void's $925.00. Three folds, one banner, cents gate throughout — the stack the close actually ships.",
    },
    {
      id: "cs-coinbase-5",
      tier: "easy",
      topic: "t4",
      universe: "funnel",
      title: "The tape calendar: slowest months on the fill clock",
      brief:
        "Market-ops memo: the tape calendar buckets the book by month and reads three grains — orders placed, fills completed, and the average fill clock (JULIANDAY(shipped_at) − JULIANDAY(created_at)) per month. The watchlist is the **three slowest months**, and the probed head of it is ugly: 2024-08 ran **3.71 days** on 7 of 7 completed, 2024-02 ran 3.25 on 8 of 9, 2024-12 ran 3.17 on 6 of 7. The book-wide clock averages 2.98 days across 82 completed orders — the watchlist exists because the average hides months like these.",
      ask: "Return the 3 slowest months by average fill days, with orders placed, fills completed and the average in days (2 decimals).",
      template:
        "SELECT SUBSTR(created_at, 1, 7) AS month,\n       COUNT(*) AS orders,\n       COUNT({1}) AS completed,\n       ROUND(AVG({2}), 2) AS avg_days\nFROM orders\nGROUP BY month\nORDER BY avg_days {3}\nLIMIT {4};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the completion counter",
          why: "Fills completed is COUNT(shipped_at) — COUNT(column) skips the NULLs the 21 uncompleted orders carry. COUNT(*) or COUNT(created_at) counts every order and reports a 100% completion rate the funnel never achieved.",
        },
        {
          answer: "julianday(shipped_at) - julianday(created_at)",
          kind: "keyword",
          label: "the fill clock",
          why: "The clock is a JULIANDAY delta between completion and creation — AVG over it gives days. The reversed delta yields negative days, and bare text subtraction coerces both stamps to ~2024 and reports a clock of zero.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the slowest-first order",
          why: "A watchlist leads with the worst month: 3.71, then 3.25, then 3.17. ASC builds the honor roll instead — 2024-07's 2.40 first — a correct query answering the opposite question.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the watchlist depth",
          why: "The memo asked for the three slowest months: LIMIT 3 after ORDER BY avg_days DESC. 5 spills the watchlist into 2024-04 (3.14) and 2024-11 (3.00) — months the desk did not ask to defend.",
        },
      ],
      distractors: ["*", "created_at", "ASC", "5"],
      walkthrough:
        "Bucket the tape, count both grains, clock the fills, cut three. SUBSTR(created_at, 1, 7) builds month keys; COUNT(*) folds orders placed (8, 9, 8 … 103 total), COUNT(shipped_at) folds fills completed by skipping the NULL stamps the 21 uncompleted orders carry — 82 across the book. The clock is AVG(julianday(shipped_at) − julianday(created_at)), rounded once: book-wide 2.98, and per month the slow end reads 2024-08 at **3.71** (7 of 7 completed), 2024-02 at **3.25** (8 of 9), 2024-12 at **3.17** (6 of 7) — the watchlist, biggest first. The distractors fail at the grains: COUNT(*) or COUNT(created_at) counts orders, not completions, and prints a 100% fill rate; the reversed JULIANDAY delta runs the clock negative; bare shipped_at − created_at subtracts coerced text and zeros the clock; ASC publishes the honor roll; LIMIT 5 pads the list with months nobody asked about. Bucket, two counts, one clock, an honest cut — the calendar ops reads every morning.",
    },
    {
      id: "cs-coinbase-6",
      tier: "hard",
      topic: "q6",
      universe: "fraud",
      title: "Settlement exception census: legs versus face",
      brief:
        "Surveillance memo, end-of-day settlement exceptions: the census reads cash against face — every invoice gets one verdict: **exact** (legs rebuild the amount), *mismatch* (legs started, face uncovered), or {rose:no leg} (nothing moved). Probed classes: 21 exact carrying $65,612.00, 6 no leg carrying $15,217.00, 1 mismatch — invoice #25, $4,000.00 settled against a $6,148.00 face. The classifier reads cash, not status: void-but-settled #11 ($925.00 paid on a $925.00 face) lands *exact*, and paid-in-status #28 ($1,756.00) lands {rose:no leg} — which is exactly why the anomaly board runs separately.",
      ask: "Return each invoice with its status, face and settled dollars (2 decimals), and its verdict — exact, mismatch, or no leg — verdict first, id order inside.",
      template:
        "WITH legs AS (\n  SELECT invoice_id,\n         COUNT(*) AS leg_count,\n         SUM(amount_cents) AS paid_cents\n  FROM payments\n  GROUP BY {1}\n)\nSELECT i.id,\n       i.status,\n       ROUND(i.amount_cents / 100.0, 2) AS face_usd,\n       COALESCE(ROUND(l.paid_cents / 100.0, 2), {2}) AS paid_usd,\n       CASE\n         WHEN l.invoice_id IS NULL THEN 'no leg'\n         WHEN l.paid_cents = i.amount_cents THEN 'exact'\n         ELSE 'mismatch'\n       END AS verdict\nFROM invoices i\n{3} legs l ON l.invoice_id = i.id\nORDER BY verdict, i.id;",
      slots: [
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the leg fold's group key",
          why: "Legs fold per invoice: GROUP BY invoice_id turns 27 payment legs into one settled total per invoice. Grouping by id folds per leg instead — split-settled #5's two $2,642.00 legs stop summing to its $5,284.00 face and honest settlements read mismatch.",
        },
        {
          answer: "0",
          kind: "number",
          label: "the no-leg read",
          why: "COALESCE(..., 0) states the no-leg position as zero settled dollars — 6 invoices, $15,217.00 of face untouched. NULL would print 'unknown' for a fact the census owns: nothing moved, and zero is the number that proves it.",
        },
        {
          answer: "LEFT JOIN",
          kind: "keyword",
          label: "the hole-keeping join",
          why: "The census exists to expose invoices with no legs, so the join must keep them: LEFT JOIN pairs every invoice with its fold and leaves NULL where nothing settled. An INNER JOIN silently deletes the six no-leg rows — $15,217.00 of face vanishing from an exception report.",
        },
      ],
      distractors: ["JOIN", "CROSS JOIN", "id", "COUNT(*)", "NULL", "i.id"],
      walkthrough:
        "Stage the fold, then judge the pair. The CTE folds 27 payment legs into one row per invoice — GROUP BY invoice_id — so paid_cents is the cash actually moved against each face. The outer query joins that fold back 1:1 and reads every number through the cents gate (amount_cents / 100.0), with COALESCE(..., 0) stating the no-leg position as a fact: six invoices, $15,217.00 of face, zero settled — including status-paid #28 at $1,756.00, because the classifier reads cash, not status. The CASE orders its arms by the NULL first: l.invoice_id IS NULL is 'no leg', then exact is paid_cents = face — 21 invoices, $65,612.00, void-but-settled #11 ($925.00) included on its cash — and everything else is mismatch: exactly one, #25, $4,000.00 of $6,148.00. ORDER BY verdict, i.id groups the page by verdict with ids readable inside each block. The distractors fail at the seams: JOIN or CROSS JOIN collapses the LEFT and deletes the six no-leg rows; id in the fold groups per leg, so #5's two $2,642.00 legs stop rebuilding $5,284.00 and five honest settlements read mismatch; COUNT(*) as the COALESCE fallback aggregates the whole query into one row; NULL as the fallback re-converts a stated zero into an unknown; i.id prints the invoice id as settled dollars. Cash versus face, one fold per invoice, the hole kept visible — the census surveillance signs.",
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
    { slug: "customer-order-frequency", why: "Order cadence per account with a monthly floor — 'accounts trading at least N months' is the HAVING gate the growth desk ships, boundary probed one step either side." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax by order count — the busiest book on the exchange, where the tie question waits behind the fold exactly as it does on the class leaderboard." },
    { slug: "duplicate-charge-pairs", why: "Same-amount, same-window pair detection — settlement surveillance's first query: two legs matching on cents and day is what the nightly diff hunts." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "Escalating-fill sequences — LAG chains over ordered fills, the wash-and-pump shape surveillance flags before a human ever sees the tape." },
    { slug: "amount-anomaly-zscore", why: "Statistical outliers on the tape — fills deviating from their class's average by standard deviations, the quant screen in interview clothing." },
    { slug: "chargeback-rate-ranking", why: "Ranking a rate, not a count — disputed-settlement share by rail, where the denominator is the fold and the tie policy is the footnote." },
    { slug: "daily-balance-interest", why: "Daily position walk from movement rows — custody balance per day with accrual math, the running-sum frame drill on a calendar spine." },
    { slug: "cohort-repeat-revenue", why: "First-trade cohorts and their repeat fold — retention by listing month, the growth read that survives the fill fan-out only if the grain is named." },
    { slug: "calculate-orders-within-each-interval", why: "Fills bucketed into session intervals — the tape's time-bucket census, counting events per window without letting the fan-out double a window." },
    { slug: "first-and-last-call-on-the-same-day", why: "Open and close per session — first fill, last fill, same day: the tape's bookends, an argmax pair with a NULL edge on quiet days." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Trading streaks — consecutive-day activity censuses, the engagement read that breaks the moment a gap day is silently dropped." },
    { slug: "find-third-transaction", why: "Nth-fill reads per account — the third trade's size against the first, an ordering drill where the sort key must be stated to be reproducible." },
    { slug: "circular-transfers", why: "Custody flow loops — movements that route back to their origin, the cycle detection that keeps venue rebalancing honest." },
    { slug: "friday-purchases-ii", why: "Same-weekday month-over-month compare — Friday volume against last month's Friday, the seasonality read that LAG-over-buckets makes one query." },
    { slug: "compute-the-rank-as-a-percentage", why: "Percentile ranks on the leaderboard — rank as a share of the field, the smoothing layer over RANK() that decks quote when raw rank reads harsh." },
    { slug: "calculate-compressed-mean", why: "Weighted means over folds — the compressed-average shape behind notional-weighted price, where the weight column is the whole interview." },
  ],
};
