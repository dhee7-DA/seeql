// Robinhood — kit 8 of the Fintech & Payments domain (Batch F, wave-5 slot).
// Retail trading from the platform side: order tickets, fills, session
// engagement and the first-trade funnel — where a fill rate is a ratio with a
// denominator, a leaderboard is a window function, and the settlement spine
// still has to balance to zero. Pool provenance: the registry tags 2 Robinhood
// SQL problems — both land in this kit's problems; the remaining slots are
// theme-curated fills from the SQL band (funnels, streaks, leaderboards,
// retention cohorts), stated here per spec. Case studies run on the storefront
// db with probed figures from scripts/company-facts.md (probed 2026-10-12).
// The mapping is honest: orders = order tickets (trading sessions), order_items
// = fill legs, customers = accounts, invoices = settlement batches, payments =
// cash movements for fills, expenses/ledger_entries = internal money movement.
// orders/order_items carry REAL dollars; invoices/payments/expenses/ledger are
// INTEGER cents — the facts file prints dollars, the read is amount_cents /
// 100.0 on the money spine.
//
// 3x EXPANSION (append-only — every original entry kept byte-identical):
// brief 4->6, dayInLife 4->5, metrics 8->12, topics 10->15, theory 8->24
// (rh-t9..t24), mcqs 10->30 (rh-mcq-11..30), cases 2->6 (cs-rh-3..6; topic
// families j7/s6/q5/x3 — all distinct from the kit's original l8/t5 pair),
// problems 16->32. The registry still tags only 2 Robinhood SQL problems
// (both already in problems); all new topic slugs and problem fills are
// theme-curated sql rows from company-pools.md's theme menu (money-spine,
// calendar, subquery and window-frame bands), stated here per spec. All new
// case figures re-probed against db/custom.db; every number slot is a
// verified result cell (threshold/LIMIT constants ship noVerify).

import type { CompanyKit } from "../types";

export const robinhoodKit: CompanyKit = {
  id: "robinhood",
  domainId: "fintech",
  name: "Robinhood",
  tagline: "Retail trading: orders, fills and engagement",
  accent: "text-green-200",

  brief: [
    "Robinhood is retail trading at consumer scale: order tickets in, fills out, engagement looped back into the next trade. The data org reads like the product — funnel analytics on acquisition and first trades, engagement analytics on session rhythm, and a settlement spine that still has to balance to the penny. On this app's storefront db the mapping is one-to-one: `orders` are order tickets (103 of them across 16 accounts), `order_items` are fill legs (251), customers are accounts, and the money spine is `invoices` as settlement batches (28), payments as cash movements for fills (27 rows covering 22 batches), with `ledger_entries` the clearing ledger (80 rows, debits $181,080 equal to credits $181,080). Tickets carry REAL dollars; the spine is INTEGER cents — every spine dollar read is `amount_cents / 100.0`.",
    "The funnel numbers the growth team lives in: of 103 tickets, **52 delivered** fills (50.5%), 30 shipped through routing (29.1%), 14 pending (13.6%), 7 cancelled (6.8%) — and shares must sum to 100 or the page is broken. Engagement is a distribution, not an average: 2 accounts traded once and stopped, 3 traded twice, 4 hit four tickets, and four power accounts ran 13, 14, 17 and 24 tickets — with **63.5%** of notional coming from accounts whose lifetime spend crosses $3,000. The {sky:fill clock}: 82 tickets carry a fill timestamp, averaging **2.98 days** ticket-to-fill, range 2 to 4 — the 21 without one (pending + cancelled) never entered that average, and saying so out loud is the interview.",
    "The settlement spine is where fintech rigor shows: **21 exact** batches ($65,612.00), **1 partial** (#25, $4,000.00 of $6,148.00), **6 with no cash movement** ($15,217.00), a {rose:void}-batch-with-cash (#11, $925.00), and a paid batch with no movement (#28, $1,756.00). Interview style mirrors the loop: a fold with a definition attached (fill rate — 82 of 103, denominator stated), a window over the engagement leaderboard, an anti-join for the un-moved batches, and a census whose branches must reconcile to 103 or 28 before it ships. Rounding lands once; {violet:100.0} precedes every division; the NULL policy is stated, not implied.",
    "Preparation: the registry tags 2 Robinhood SQL problems and both land in this kit's problems; the remaining slots are theme-curated from the SQL band — funnel steps, streaks, leaderboards, retention cohorts — because that is what the screens probe. Do the topics in order, then run all six case studies on the live storefront db — built for spaced practice rather than one sitting: one rebuilds the {emerald:fill-status census} the weekly funnel page opens with (52 / 30 / 14 / 7 of 103, shares at 1 decimal), another rebuilds the {violet:engagement leaderboard} retention reads every Monday — accounts ranked by ticket count with lifetime notional (Alice Chen, 24 tickets, $7,262.35 on top). Say the units and the denominator out loud before you compute anything; in retail trading the funnel IS the interview.",
    "The money spine gets its own expansion reads. The rails stack: **card 16 movements / $37,364.00** against wire 11 / $32,248.00, appended with a `TOTAL` row — 27 movements, $69,612.00 — because treasury reads the whole book before the split. The coverage census folds cash against face per batch: 21 exact ($65,612.00), 1 partial (#25, $4,000.00 of $6,148.00), 6 unmoved ($15,217.00) — classes that must reconcile to 28. The anomaly board carries two standing rows — a {rose:void-but-moved} batch (#11, $925.00) and a {sky:paid-but-unmoved} one (#28, $1,756.00) — while five batches (#1, 5, 12, 19, 22) settle in two legs apiece, exactly the installment shape the leg census isolates.",
    "The deeper rounds go past the census: window frames that absorb tied timestamps, set ops (`UNION ALL` stacks and the dedupe tax `UNION` pays), derived-table staging — fold per batch, *then* classify — and anomaly triage, where the answer is a definition, not a number. Prep the same way: run the four new cases on the live db — regional notional rollup, leg census, {violet:anomaly board}, {sky:rails stack} — each rebuilt from slots, each figure a verified result cell. Keep the zero-delta contract taped to the monitor: debits $181,080.00 equal credits $181,080.00, or the page does not ship.",
  ],

  dayInLife: [
    "**08:00 —** The day starts with the funnel page, not a dashboard: last night's tickets bucketed — **52 delivered / 30 shipped / 14 pending / 7 cancelled** — shares recomputed at one decimal and checked against 100.0, then the fill clock (**2.98-day average** over the 82 tickets that filled, range 2 to 4) compared to the promise shown at order time. The exception queue rides the same scan: settlement batches whose cash movements disagree with status — {rose:void-but-moved} (#11, $925.00) and {sky:paid-but-unmoved} (#28, $1,756.00) are one row each and enormous in consequence. A funnel that doesn't reconcile to 103 is a page, not a report.",
    "**11:00 —** Midday is deep-dive work with definitions attached. Retention wants the engagement distribution re-cut (**2 one-ticket accounts, 3 two-ticket, 4 four-ticket, power tails at 13 / 14 / 17 / 24** — is the middle hollowing out?); product wants the {violet:leaderboard} rebuilt deterministically — ROW_NUMBER with a stated tiebreak, not whatever order the engine feels like; finance wants unmoved exposure priced (**$15,217.00 across 6 batches** — of ALL batches, not moved ones, and the analyst says so). Each ask is a join, a conditional aggregate, and one judgment call about where the status filter lives — written twice: once to answer, once with the definition explicit so the number survives the growth review.",
    "**15:00 —** The afternoon belongs to cohort reads and the people who consume them. The first-trade funnel gets its week-over-week look — accounts whose first ticket converted into a second (on this book only **2 of 16** never came back), stickiness ratios, and the cancellation gradient by region (**APAC 8.1%**, EU 6.7%, US 5.3%) defended from the query, not the slide. The clearing ledger closes the loop: trial balance **debits $181,080, credits $181,080, delta $0.00**, per-account nets (cash $44,196, receivables $16,440) reconciled from SQL because a funnel number that can't be re-derived is a number nobody trades on.",
    "**17:30 —** EOD is the writeup. The census ships with its branch counts reconciled to 103 and 28; every rate carries its denominator in the caption; every re-run is {emerald:idempotent}; every open question carries the query that would answer it tomorrow. The rhythm to internalize: in retail trading, engagement isn't a vibe the interview rewards — it's a ratio with a stated denominator, and the SQL is just where the honesty becomes visible.",
    "**22:00 —** Month-close nights are spine nights. The trial balance runs first — **debits $181,080, credits $181,080, delta $0.00** — then the per-account nets (cash $44,196, receivables $16,440) are re-derived from SQL, not from the close binder, because a delta that can't be re-queried is a delta nobody signs. The coverage census has to reconcile — 21 exact + 1 partial + 6 unmoved = 28 batches — and the anomaly board gets one last look: {rose:void-but-moved} #11 ($925.00) and {sky:paid-but-unmoved} #28 ($1,756.00) either have owners by morning or they become tomorrow's 08:00 exception queue. *The close ships when the spine says zero*, not when the calendar says so.",
  ],

  metrics: [
    { name: "Fill rate", what: "Tickets reaching a fill state ÷ all tickets — 82 of 103 on the db (52 delivered + 30 shipped). The funnel's core ratio, and the denominator (all tickets, not filled ones) is the whole test." },
    { name: "First-trade conversion", what: "Accounts whose first ticket leads to a second. On this book only 2 of 16 accounts traded exactly once — the first-trade funnel's leak list, and the smallest number with the loudest story." },
    { name: "Session frequency", what: "Tickets per account: 103 across 16 accounts, distribution 1/2/3/4/5/13/14/17/24. The engagement histogram retention reads weekly — a power tail, not an average." },
    { name: "Fill latency", what: "Ticket → fill in days over the 82 tickets with a fill timestamp: 2.98 average, 2 to 4 range. Pending and cancelled tickets carry no fill timestamp and never enter the population — say so." },
    { name: "Cancellation rate", what: "Cancelled ÷ all tickets — 7 of 103, graded by region (APAC 8.1%, EU 6.7%, US 5.3%). The classic 100.0-before-division ratio, watched per cohort." },
    { name: "Notional per ticket", what: "Average ticket value — $338.19 across $34,833.28 of notional on the db. The engagement-quality counterweight: frequency without notional is noise." },
    { name: "Whale concentration", what: "Share of notional from accounts above a lifetime threshold — 63.5% from $3,000-plus accounts, 71.2% from $2,000-plus. The dependency metric the growth team debates." },
    { name: "Ledger balance delta", what: "Total debits − total credits on the clearing ledger. Must read $0.00 ($181,080 = $181,080 here) — the one metric allowed, and required, to be boring." },
    { name: "Rail mix", what: "Cash movements by rail — card 16 movements / $37,364.00 vs wire 11 / $32,248.00 (27 / $69,612.00 total). The stack treasury opens with; a rail swinging past 60% share is a concentration conversation." },
    { name: "Coverage class mix", what: "Settlement batches by cash coverage — 21 exact ($65,612.00), 1 partial (#25, $4,000.00 of $6,148.00), 6 unmoved ($15,217.00). Three classes that must reconcile to 28 or the close page is broken." },
    { name: "AR exposure", what: "Batches with no cash movement and their face — 6 batches carrying $15,217.00. The anti-join number finance prices weekly; the denominator is ALL batches, not moved ones, and the analyst says so." },
    { name: "Settlement cycle time", what: "Issue-to-cash on paid batches — 20 paid invoices average 28.4 days, fastest 13, slowest 84, on flat 30-day terms. The aging clock the partial batch (#25) is measured against." },
  ],

  topics: [
    {
      name: "Folds over order flow",
      why: "Every headline is a fold over the ticket table: fills per status, notional per account, legs per order. Robinhood's twist is that orders carry REAL dollars while the settlement spine is INTEGER cents — knowing which fold needs /100.0 is the standing trap. Drill the fold-then-share shape until it's reflex.",
      slugs: ["product-sales-analysis-ii", "article-views-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "The fill funnel & honest shares",
      why: "The weekly funnel page is a conditional aggregate: fills, cancels and their shares from one scan, with the denominator (103 tickets) stated. Both failure modes are graded here — integer division (100 must be 100.0) and denominator drift (the WHERE that filters the numerator's population out of the denominator).",
      slugs: ["queries-quality-and-percentage", "funnel-step-conversion", "confirmation-rate", "bank-account-summary-ii", "bank-account-summary", "number-of-rich-customers", "spend-histogram"],
    },
    {
      name: "Session engagement windows",
      why: "Engagement is read through windows: tickets per account side by side with the fleet average, rolling actives, partition counts. The power tail (13/14/17/24 tickets) makes PARTITION BY and frame math daily tools, not interview trivia.",
      slugs: ["find-the-team-size", "active-users", "rolling-7d-actives"],
    },
    {
      name: "First-trade funnels & day-one retention",
      why: "The first trade is the product: did the account come back? Day-2 return queries (second-day confirmation, next-day login), first-event detection and step conversion are the drills — and the follow-up is always the edge case: what does the funnel do when a cohort's step is empty?",
      slugs: ["second-day-confirmation", "game-play-analysis-iv", "new-users-daily-count", "chargeback-rate-ranking", "transaction-velocity", "suspicious-bank-account-transactions"],
    },
    {
      name: "Streaks & consecutive sessions",
      why: "Trading habits are streak-shaped: consecutive-day tickets, gaps between sessions, win runs. Gaps-and-islands (row number minus date) and LAG deltas are the tools, and the tie discipline (ORDER BY day, id) keeps the streak deterministic when two tickets share a day.",
      slugs: ["find-loyal-customers", "longest-winning-streak", "fifteen-days-of-learning"],
    },
    {
      name: "Leaderboards & ranking",
      why: "The engagement leaderboard ranks accounts by ticket count with notional alongside — ROW_NUMBER for boards, DENSE_RANK for tiers, PERCENT_RANK for where-am-I views. The craft is the deterministic tiebreak: two accounts at the same count must rank the same way on every run.",
      slugs: ["rank-scores", "usage-tier-percentiles", "compute-the-rank-as-a-percentage", "uber-first-transaction"],
    },
    {
      name: "Argmax & latest tickets",
      why: "The recent-activity widgets are per-entity latest-N rails: biggest notional per day, most recent tickets per account. ROW_NUMBER with a stated tiebreak is the shape, and the aggregate-fold alternative (MAX per day) is the cheaper twin when you only need the timing.",
      slugs: ["maximum-transaction-each-day", "the-most-recent-three-orders", "game-play-analysis-ii"],
    },
    {
      name: "Notional economics",
      why: "Frequency without money is noise: notional per ticket, realized gain/loss framing, weighted averages across fills. The drills mix REAL-dollar folds on tickets with the cents discipline of the settlement spine — two unit systems in one analyst, stated out loud.",
      slugs: ["average-selling-price", "top-travellers", "capital-gain-loss", "realized-pnl-average-cost", "split-adjusted-position", "portfolio-concentration-hhi", "portfolio-weights", "customer-who-visited-but-did-not-transact"],
    },
    {
      name: "NULL policy & data quality on fills",
      why: "21 of 103 tickets carry no fill timestamp — pending and cancelled — and they silently drop out of every latency average. The drills: NULL-safe filters, COUNT(column) versus COUNT(*), and the null/blank audit that keeps the funnel page honest before it ships.",
      slugs: ["find-customer-referee", "null-blank-audit", "books-with-null-ratings", "duplicate-charge-pairs"],
    },
    {
      name: "Cohorts & retention",
      why: "The growth team reads retention as a matrix: accounts bucketed by first-trade week, activity tracked forward, stickiness ratios (DAU/WAU-style) beside the cohort grid. The SQL is a date-bucket fold plus a window — and the honest version states its denominators per cohort.",
      slugs: ["cohort-retention-matrix", "dau-wau-stickiness", "week-over-week-churn"],
    },
    {
      name: "Window frames & running notional",
      why: "The monthly trend page wants a running column — notional cumulative by month — and the default frame is quietly RANGE, so two tickets sharing a timestamp both absorb each other. Frames (ROWS versus RANGE), running sums and cumulative folds are the difference between a trend and a coincidence. Drill until the frame is a sentence you say out loud.",
      slugs: ["account-balance", "find-cumulative-salary-of-an-employee", "game-play-analysis-iii"],
    },
    {
      name: "Set ops over the money spine",
      why: "The rails stack is a UNION ALL: card row, wire row, then a TOTAL row computed the same way — one page, two grains appended. UNION's dedupe looks safer and is actually a silent row-deleter the day two stack rows agree. INTERSECT and EXCEPT do population diffing on the spine (paid versus moved), which is how the anomaly queue gets built.",
      slugs: ["monthly-transactions-ii", "count-apples-and-oranges", "league-statistics"],
    },
    {
      name: "Subquery shapes on the book",
      why: "Above-average tickets, second-largest fills, argmax-by-group — the screens keep asking for comparisons the outer row can't see, and each shape (scalar, IN, derived) has a different failure mode when the inner fold is empty or doubled. The discipline: name the inner fold's population before trusting the outer filter.",
      slugs: ["investments-in-2016", "second-highest-salary", "department-highest-salary"],
    },
    {
      name: "Month buckets & the trading calendar",
      why: "Every trend on the book is a month bucket — SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m') — and the bucket key is TEXT that happens to sort chronologically because ISO is fixed-width. Date math (gaps between fills, T+2-style aging windows) turns the calendar into a filter; BETWEEN is the trap that eats the last day.",
      slugs: ["monthly-transactions-i", "users-with-two-purchases-within-seven-days", "settlement-fails-aging"],
    },
    {
      name: "Ledger folds & the zero-delta contract",
      why: "The clearing ledger is a conditional-aggregation drill: debits and credits folded side by side in one scan, delta computed, and $0.00 required ($181,080 = $181,080 on this book). Per-account nets (cash $44,196, receivables $16,440) are the same fold with a GROUP BY — reconciliation SQL is just honest folding with the population stated.",
      slugs: ["trial-balance-check", "gl-reconciliation", "balance-rollforward"],
    },
  ],

  theory: [
    {
      id: "rh-t1",
      q: "A ticket is placed, routed, filled, then maybe cancelled. In a query reporting fill volume, where does each lifecycle rule live — and what breaks when a row-level rule lands in the wrong clause?",
      a: "Lifecycle states are row-level facts, so they belong in WHERE — 'fill volume' filters to routed-and-filled tickets before any aggregation touches them. Once folded, the states no longer exist per row: HAVING can only judge group aggregates like SUM or COUNT, not recover rows you already summed. The classic failure is summing all 103 tickets and trying to subtract the 7 cancelled in HAVING — those tickets are already inside the fold, and no post-aggregation clause can un-mix them. The strong answer recites the pipeline — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — and places every filter by asking: is this a fact about one row, or about a group? On a retail funnel that question is the job, because a lifecycle rule in the wrong clause doesn't error — the page still sums to something, it just isn't the population the caption claims.",
      tag: "pipeline",
    },
    {
      id: "rh-t2",
      q: "Accounts LEFT JOIN order tickets: when does an INNER JOIN give the identical answer, and when does it silently delete the rows you were hunting?",
      a: "On this book, every one of the 16 accounts has at least one ticket — never-ordered accounts are zero — so per-account INNER and LEFT return identical rows, and the strong candidate SAYS that population fact instead of defaulting to LEFT on vibes. The difference appears wherever the right side can be empty, and on this db that's the settlement spine: batches with no cash movement (6 of them, $15,217.00) survive only under LEFT JOIN, with IS NULL as the detection. The silent killer is filtering the right table's column in WHERE — p.method = 'card' discards NULL-payload rows (NULL = 'card' is UNKNOWN), collapsing the LEFT JOIN to an INNER and deleting exactly the exception rows the sweep exists to find. Join type is a decision about who survives; state who survives, and why, out loud.",
      tag: "joins",
    },
    {
      id: "rh-t3",
      q: "103 tickets, 251 fill legs, 16 accounts. Narrate every count in that sentence — and how you'd report the grains side by side without mixing them.",
      a: "COUNT(*) over orders reads 103 — tickets, the funnel's event grain. COUNT(DISTINCT customer_id) reads 16 — accounts, the engagement grain. COUNT(*) over order_items reads 251 — fill legs, the execution grain, and the fan-out fact that makes naive SUMs over a joined ticket-leg query inflate by the legs-per-ticket ratio. The discipline is one fold per grain: tickets folded per status (52/30/14/7), accounts folded per ticket-count bucket (2/3/2/4/1 plus the power tail 13/14/17/24), legs folded per ticket only when execution depth is the question. The habit the interviewer grades: before any COUNT, say 'one row per what?' — ticket, account, fill leg. A leaderboard that folds tickets through their legs reads 251-ish sessions for a 16-account fleet; the number ships, someone screenshots it, and the funnel page is wrong for a week.",
      tag: "aggregation",
    },
    {
      id: "rh-t4",
      q: "21 of 103 tickets carry no fill timestamp. When you compute fill latency, what is your NULL policy — filter, coalesce, or report?",
      a: "The NULL means 'this ticket never filled' — pending or cancelled — and that is data, not missingness to clean. The policy: classify, don't discard silently. The latency population is the 82 tickets where shipped_at is set, averaging 2.98 days with a 2-to-4 range, and the caption says 'over filled tickets only' because the average's denominator is the definition. Equality never detects the NULLs — NULL fails every test including against itself — the arm is IS NULL, and the same arm is how the funnel reports the 21 as their own bucket. COALESCE belongs at the display edge only: a coalesced zero mid-pipeline launders never-filled tickets into a 0.00-day average somebody will celebrate. And if the ask truly wants filled-only, filter in WHERE and say the population changed — 'this report covers the 82 filled tickets' — because 103 minus 82 is the story the filter just deleted.",
      tag: "nulls",
    },
    {
      id: "rh-t5",
      q: "The engagement leaderboard ranks accounts by ticket count. How do you build it so rank 1 is the same account on every run — and what changes when two accounts tie?",
      a: "ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC, <deterministic tiebreak>) — and the tiebreak is the answer: without it, two accounts at the same count are ordered by whatever the engine feels like, and the leaderboard flips between runs. With ties, the choice of function is the choice of story: ROW_NUMBER deals distinct ranks (a leaderboard), DENSE_RANK shares ranks without gaps (a tier view), RANK shares ranks with gaps. The board also needs its population stated — all 16 accounts traded on this book — and its column grains separated: ticket count is a COUNT fold, lifetime notional is a SUM over REAL dollars rounded once at the end. Choose the function by output, name the tiebreak out loud, and the Monday page stops being a lottery.",
      tag: "windows",
    },
    {
      id: "rh-t6",
      q: "WHERE o.total > (SELECT AVG(o.total) FROM orders WHERE status = 'cancelled') — the staging copy has no cancelled tickets this week. Walk me through what happens.",
      a: "A scalar subquery is contractually zero-or-one rows, one column. One row: its value joins the comparison. Zero rows: it yields NULL — not an error, not zero — and total > NULL is UNKNOWN, so WHERE passes nothing: an above-average report that returns empty while looking perfectly healthy. That's the empty-inner-query bug, and on a funnel-driven product it ships constantly — a cohort with no cancels this week, a segment with no volume after a re-launch. The strong answer also names the other contract edge: two rows from a scalar subquery IS an error, so 'scalar' is a promise you verify with the fold's GROUP BY, not an assumption. The follow-up is always: what population did the inner fold cover, and what does the page do when that population is empty? A growth team does not accept silence as an answer.",
      tag: "subqueries",
    },
    {
      id: "rh-t7",
      q: "Fill latency averages 2.98 days with a 2-to-4 range, and sessions get reported by month. How do you compute the latency, bucket the months, and where does BETWEEN break?",
      a: "Latency: JULIANDAY(shipped_at) - JULIANDAY(created_at) over rows WHERE shipped_at IS NOT NULL — average, then ROUND(..., 2) exactly once at the outermost fold; 2.98 is a single final round, not a per-row one, and the population (82 tickets) is part of the definition. Buckets: STRFTIME('%Y-%m', created_at) or SUBSTR(created_at, 1, 7) — the SUBSTR shortcut is safe only while the column stays fixed-width ISO, a convention nothing in the column enforces, so say it before you lean on it. Windows: half-open intervals — created_at >= '2024-03-01' AND < '2024-04-01' — never BETWEEN, which is inclusive both ends and drops everything after midnight on the last day, exactly when retail session volume spikes. And the range check itself is a query: min 2, max 4, verified not assumed — a 40-day outlier would be the finding, not the exception you skip.",
      tag: "dates",
    },
    {
      id: "rh-t8",
      q: "The funnel page claims shares of 50.5%, 29.1%, 13.6% and 6.8%. How do you prove the page in one query — and what do you check before it ships?",
      a: "One scan, three checks: the branch counts (52 delivered, 30 shipped, 14 pending, 7 cancelled) must sum to 103 — the whole population, no holes; the shares (100.0 * COUNT(*) / 103.0, one decimal, rounded once) must sum to 100.0 within rounding tolerance — 50.5 + 29.1 + 13.6 + 6.8 does; and every NULL-sensitive column gets an explicit policy — the 21 never-filled tickets are a bucket, not a silent drop. The same discipline scales to the settlement spine: 21 + 1 + 6 coverage classes reconcile to 28 batches, and the ledger's debits ($181,080) equal its credits. The traps are self-inflicted: integer division flattening small shares to zero, a WHERE that shrank the denominator to the numerator's population, COUNT where you meant SUM. A funnel that reconciles is a funnel a CFO reads; one that doesn't is a screenshot waiting to embarrass someone.",
      tag: "quality",
    },
    {
      id: "rh-t9",
      q: "You add a running-notional column: SUM(o.total) OVER (ORDER BY created_at). Two tickets share one created_at. What does the second tied row read — and what do you change?",
      a: "The default frame when ORDER BY is present is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE assigns peers the same frame, so both tied rows read the sum INCLUDING both tickets: the running total jumps by two rows' worth at once, then continues. If the page promises a per-row walk — every row plus exactly the rows before it — the fix is an explicit frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, plus a deterministic ORDER BY (created_at, id) so the walk itself is reproducible. The strong candidate says the frame out loud instead of trusting the default, because the default is answerable but rarely intended. On a fill ledger where timestamps cluster — sessions! — ties are common, and a running total that absorbs ties is silently wrong in exactly the months the product team zooms into. Frame choice is a definition, like every denominator on this book.",
      tag: "frames",
    },
    {
      id: "rh-t10",
      q: "The rails stack appends a grand-total row under the card and wire rows. Why UNION ALL — and when would UNION, INTERSECT or EXCEPT be the right move?",
      a: "UNION ALL concatenates; the stack's three rows (card 16 / $37,364.00, wire 11 / $32,248.00, TOTAL 27 / $69,612.00) are distinct by construction, and ALL skips the dedupe pass UNION runs — cheaper, and honest about intent. UNION's dedupe is also a silent row-deleter: the day two stack rows legitimately agree, one vanishes and the page still sums to something plausible. INTERSECT and EXCEPT are the population-diffing moves: paid batches INTERSECT moved batches is the healthy book; paid EXCEPT moved is #28 — the paid-but-unmoved anomaly — as a set operation instead of a LEFT JOIN. The contract worth reciting: set ops align columns positionally, apply to the whole SELECT, and every branch must project the same shape — a stack is three queries wearing one coat.",
      tag: "setops",
    },
    {
      id: "rh-t11",
      q: "Coverage classes: exact, partial, none — 21, 1, 6 over 28 batches. Build that census in one scan and tell me what proves it is complete.",
      a: "Fold per batch first — a LEFT JOIN to payments with SUM and COUNT grouped by invoice — classify with CASE (no cash is none, short cash is partial, full cash is exact), then GROUP BY the class and count. The proof is reconciliation: 21 + 1 + 6 = 28, the whole population, no holes — the same check the fill-status census runs against 103. The conditional-aggregation twin (SUM(CASE WHEN ... THEN 1 ELSE 0 END) as columns) is the one-row shape when a dashboard wants the classes side by side instead of down the page. The trap is filtering before classifying: a WHERE that removes unmoved batches before the fold turns 'none' into an empty class and the census into 22 rows that still sum to 22, confidently wrong. Classify on the full population, then let the reader filter.",
      tag: "census",
    },
    {
      id: "rh-t12",
      q: "orders.total is REAL dollars; invoices.amount_cents is INTEGER cents. Where does the /100.0 live, and what is the failure mode when it lives in the wrong place?",
      a: "The division lives at the read edge — ROUND(SUM(amount_cents) / 100.0, 2) at the outermost fold — and nowhere else. One book, two unit systems: tickets carry REAL dollars (SUM them raw, round once), the spine carries INTEGER cents (divide by 100.0 — the .0 is the difference between real division and integer truncation — then round once). The wrong place is mid-pipeline: a per-row /100 before a join mixes units inside one expression tree and every downstream comparison is silently off by two orders of magnitude; integer division is worse because it truncates before ROUND ever sees the value. The tell an interviewer listens for: you can name which tables are cents and which are dollars without checking — payments, invoices, expenses, ledger are cents; orders and order_items are dollars. Units are schema facts, not style choices.",
      tag: "units",
    },
    {
      id: "rh-t13",
      q: "Find the settlement batches with no cash movement. Give me the three anti-join shapes — and the one that can silently lie.",
      a: "LEFT JOIN payments ON p.invoice_id = i.id WHERE p.id IS NULL — the visible shape: unmoved batches keep their row with a NULL payload, and 6 rows carrying $15,217.00 come back. NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — the NULL-proof semi-join that reads like the question. NOT IN (SELECT invoice_id FROM payments) — the one that can silently lie: if the subquery ever returns a NULL, x NOT IN (...NULL...) is UNKNOWN for every row and the report ships empty; it survives here only because payments.invoice_id is NOT NULL, which is a schema fact you verify, not assume. The discipline: pick the shape by its failure mode, and on this book the anti-join IS a money number — 6 batches, $15,217.00 — so an empty result isn't a quiet bug, it's a mispriced close.",
      tag: "antijoin",
    },
    {
      id: "rh-t14",
      q: "Tickets above their own account's average notional: correlated subquery or derived table — and what changes at scale?",
      a: "The correlated form — WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) — re-runs the inner fold per outer row: 103 scans of the book, correct, and fine at this size. The derived form folds once (per-account averages staged in FROM) and joins back — one pass, then a comparison; identical answer, better shape, and the only version that survives when the book is 103 million tickets instead of 103. The correlated form also has the emptier edge case: an account with one ticket compares against itself and never qualifies — say that out loud, because it is the same empty-inner-fold contract as every scalar subquery. On a trading book the interviewer is really asking whether you know where the work happens: per-row execution is a cost model, not a style choice. Small book, either works; the strong answer prices both.",
      tag: "correlated",
    },
    {
      id: "rh-t15",
      q: "You are building the anomaly board: fold per batch, then classify, then filter. Where do CTEs earn their place?",
      a: "The board is a pipeline, and a WITH stage per step makes the query read like the memo: fold batches (LEFT JOIN, SUM, COUNT per invoice), then classify (exact / partial / none plus the two anomaly arms), then order by exposure. Each stage gets a name a stakeholder recognizes, and the final SELECT is small enough to review in one glance. The fold-once-then-filter shape also stops the classification logic from being duplicated across branches — write the fold once, reference it twice. The honest caveat: a CTE is not automatically materialized — SQLite may inline it — so the CTE buys readability and deduplication of LOGIC, not guaranteed performance; the perf answer is filter placement, not a WITH keyword. And the fold inside carries the units rule: SUM(amount_cents) with the /100.0 at the presentation edge, once, exactly like every spine read on this book.",
      tag: "ctes",
    },
    {
      id: "rh-t16",
      q: "First-session detection and session gaps: where do LAG and LEAD earn their keep on a trading book?",
      a: "LAG hands you the previous row in a partition — LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) — and LAG(...) IS NULL is exactly one row per account: the first, deterministically, even when two tickets share a timestamp, because the id tiebreak guarantees the order. That is the first-trade funnel's anchor row. Session gaps are the same machinery pointed forward: JULIANDAY(created_at) - JULIANDAY(LAG(created_at) OVER (...)) is the days-between-sessions column retention buckets, and LEAD gives the next event when the question is 'what did they do after'. The trap is framing: LAG needs the full ordered partition, so filters that remove rows change what 'previous' means — previous DELIVERED ticket is a different question than previous ticket. Name the partition, the order, the tiebreak and the population — the four-part contract — and the window does what the memo says.",
      tag: "laglead",
    },
    {
      id: "rh-t17",
      q: "Two cash movements with the same amount on the same day — how do you pair them without pairing a row with itself or counting every pair twice?",
      a: "Self-join payments p1 JOIN payments p2 ON p1.id < p2.id AND p1.amount_cents = p2.amount_cents AND p1.paid_on = p2.paid_on — the strict less-than does three jobs at once: blocks self-pairs, breaks mirror symmetry so each pair appears once, and keeps the output deterministic. p1.id <> p2.id is the classic bug: every surviving pair comes back twice, (a,b) and (b,a), and the duplicate count doubles. p1.id <= p2.id is worse — it keeps the self-pairs, so every movement matches itself and the sweep reports the whole book as suspicious. The tight inequality generalizes: duplicate-charge sweeps, symmetric-follower pairs, consecutive-seat checks — all the same shape with different equality columns. On the money spine the sweep is cheap and the discipline is expensive: one duplicated leg is a customer conversation, so the pair logic has to be right the first time.",
      tag: "selfjoin",
    },
    {
      id: "rh-t18",
      q: "The monthly trend buckets SUBSTR(created_at, 1, 7) and sorts by that key. Why does alphabetical order equal chronological order here — and when does it stop?",
      a: "It equals because ISO 8601 is fixed-width and big-endian: '2024-07' compares as a string exactly as July compares as a date, so ORDER BY month is correct by construction — and GROUP BY output comes back ordered by the key, which is why the trend page never needs an explicit sort. It stops when the format changes: a '7/2024' string sorts 10/2024 before 2/2024, a two-digit year breaks at the century, and any variable-width bucket (day names, 'Week 3') is alphabetically random. The second edge is missing months: GROUP BY emits buckets that EXIST — a month with zero tickets is absent from the trend, and the line chart silently connects across the hole; the fix is a calendar spine (a VALUES list or recursive CTE) LEFT JOINed to the fold. STRFTIME('%Y-%m', created_at) is the portable twin — same key, no fixed-width assumption to apologize for. Say which you picked and why; the bucket key is a contract with the chart.",
      tag: "calendar",
    },
    {
      id: "rh-t19",
      q: "103 tickets, 251 fill legs. You join them and SUM the ticket totals — what does the number become?",
      a: "Not the notional: the join fans out to the leg grain, so each ticket's total is added once per leg — the SUM inflates by the legs-per-ticket ratio and lands somewhere north of the true $34,833.28, confidently wrong and still plausible-looking. The rule is one fold per grain: fold tickets to accounts first (SUM over orders, grouped), fold legs separately (COUNT over order_items), and only join results that share a grain — the derived-table shape. COUNT is the tell: COUNT(*) after the join reads 251, not 103, and if your leaderboard claims sessions per account while counting legs, every account with multi-leg fills is over-weighted. The audit habit that catches it: run the naive join's COUNT(*) against the ticket count before trusting any SUM that rides on it. Fan-out is the first bug an execution-data analyst learns to smell.",
      tag: "fanout",
    },
    {
      id: "rh-t20",
      q: "Beyond 'HAVING filters groups': the cancelled-subtraction trap. Why doesn't SUM(tickets) - cancelled work, and what is the honest shape?",
      a: "Because after the fold the rows are gone — SUM(tickets) over all 103 has already mixed the 7 cancelled in, and no HAVING expression can un-mix a fold; the pipeline runs FROM, WHERE, GROUP BY, HAVING, SELECT, and HAVING only sees group aggregates. The honest shapes: filter in WHERE before the fold when the whole query wants the smaller population (and say the denominator changed); or keep the full population and carry the classes as conditional aggregates — SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) beside COUNT(*) — so one scan yields the whole book AND its branches, and every share (100.0 * branch / total, one decimal) is computed from one consistent denominator. That is the shape the funnel page actually ships: 52 / 30 / 14 / 7 with shares of 103, not three queries stitched together by the chart layer. HAVING's real job is group-population gates — HAVING COUNT(*) >= 2 — and it should keep it.",
      tag: "having",
    },
    {
      id: "rh-t21",
      q: "The ledger reconciles to the penny but the dashboard's rails share drifts by a cent. Walk me through where rounding went wrong.",
      a: "Two different contracts. The spine never rounds: amounts live as INTEGER cents, SUM(amount_cents) is exact integer arithmetic, and debits $181,080.00 minus credits $181,080.00 is zero with no float in sight — that is why the trial balance can be a hard gate. The dashboard rounds, and the bug is rounding twice or in the wrong order: per-row ROUND before a SUM perturbs every input, and the drifted sum is not ROUND(SUM(raw), 2) — the error compounds across 27 movements. The house shape: fold raw, convert once (/100.0), ROUND once at the outermost SELECT, and never re-round a rounded number. The cousin trap is sharing rounded intermediates — a share of a rounded total is a double rounding the reader can't audit. One book, one rounding decision per number, made once, at the edge where the number meets the page.",
      tag: "rounding",
    },
    {
      id: "rh-t22",
      q: "The growth page says 63.5% whale concentration. The VP asks 'is that good?' — what do you actually answer?",
      a: "You answer the definition first, because 'good' is not a property of the number, it is a property of the threshold and the denominator. 63.5% is notional from accounts whose lifetime spend crosses $3,000 — move the threshold to $2,000 and the same book reads 71.2%, so the KPI is really a sensitivity curve, not a point. The denominator is all notional on the book — $34,833.28 — not all accounts, and the four power accounts (13 / 14 / 17 / 24 tickets) are visible behind the number. Then the honest second layer: concentration is a risk metric — the week Alice Chen (24 tickets, $7,262.35) goes quiet, the book loses its top line, and that is what 'good' is measuring against. The strong analyst hands back the trend of the metric, its threshold sensitivity, and the named accounts driving it — three queries, one conversation — instead of a bare percentage and a shrug.",
      tag: "kpis",
    },
    {
      id: "rh-t23",
      q: "Same query, 400ms on your machine, 4 seconds on a colleague's. What do you look at first?",
      a: "Filter placement and sargability, in that order. A predicate that wraps the column — JULIANDAY(shipped_at) - JULIANDAY(created_at) > 2, or SUBSTR(created_at, 1, 7) = '2024-07' — computes per row and uses no index; the sargable rewrite (shipped_at >= '2024-07-01' AND shipped_at < '2024-08-01') seeks. Then check the join shape: is the fold happening before or after the fan-out — aggregating the many-side in a derived table before joining is often the whole win on execution data. Then volume: is the WHERE shrinking the big table early, or is the engine dragging 251 legs into a fold that needed 40 rows? EXPLAIN QUERY PLAN is the habit that turns guesses into rows — scan versus seek, temp b-tree versus index. On a book this small everything is instant; the interview is really asking whether your instincts are sized for the day the book isn't. Filter early, fold late, keep columns bare.",
      tag: "performance",
    },
    {
      id: "rh-t24",
      q: "The anomaly board: void-but-moved #11 ($925.00), paid-but-unmoved #28 ($1,756.00), five splits (1, 5, 12, 19, 22), one partial (#25, $4,000.00 of $6,148.00). Order them by severity and defend it.",
      a: "Cash that moved against a batch marked void (#11, $925.00) is first: money and ledger disagree about reality, and both a refund and a journal correction are live possibilities — severity is 'the books are wrong', which outranks 'the books are slow'. Paid-but-unmoved (#28, $1,756.00) is second: status claims settled, the spine shows no cash — either a missed posting or a wrong status, but no money moved yet, so it is a truth problem with a day's deadline, not a cash problem. The five splits are not anomalies at all — two legs summing to face is the installment shape the coverage census expects, and the board lists them so the census reconciles. The partial (#25, $4,000.00 of $6,148.00, open) is an aging watch: $2,148.00 short against 30-day terms, escalating only when it ages past the slowest observed settle (84 days). The defense is the definition: severity means cash and status disagree about money that MOVED.",
      tag: "recon",
    },
  ],

  mcqs: [
    {
      id: "rh-mcq-1",
      prompt: "A cash movement of 41,237 cents is reported as ROUND(amount_cents / 100, 2). What lands on the settlement page?",
      choices: [
        "412.37 — integer division keeps the cents",
        "412 — the .37 was truncated away before ROUND ran",
        "412.00 — SQLite rounds to the nearest cent",
        "412.37 — ROUND heals the truncation",
      ],
      answer: 1,
      why: "Division of two INTEGERs truncates BEFORE ROUND ever sees the value: 41237 / 100 = 412, and ROUND(412, 2) is still 412. The house shape is amount_cents / 100.0 — real division first, ROUND last, exactly once.",
      notes: [
        { choice: 0, why: "Integer division never 'keeps cents' — it discards the remainder entirely. 41237/100 is 412, not 412.37; the 37 cents vanished at the division." },
        { choice: 3, why: "ROUND runs after the damage: its input is already the truncated 412. No function downstream of a truncation recovers the truncated remainder." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-2",
      prompt: "103 tickets: 52 delivered, 30 shipped, 14 pending, 7 cancelled. SELECT status, COUNT(*) FROM orders GROUP BY status returns how many rows?",
      choices: ["1", "4", "103", "82"],
      answer: 1,
      why: "GROUP BY folds to one row per distinct status — delivered, shipped, pending, cancelled — so 4 rows whose counts sum to 103. The fold's output grain is the group, not the input row.",
      notes: [
        { choice: 2, why: "103 is the input row count. GROUP BY collapses it to statuses; you'd only see 103 rows from a GROUP BY on a 103-distinct-value column." },
        { choice: 3, why: "82 is the filled population (52 + 30) — a filtered sub-population, not the fold's output. The census keeps all four buckets." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-3",
      prompt: "The orders table holds 103 tickets across 16 accounts. Which expression counts ACCOUNTS that traded, not tickets?",
      choices: ["COUNT(*)", "COUNT(total)", "COUNT(DISTINCT customer_id)", "SUM(customer_id)"],
      answer: 2,
      why: "COUNT(*) and COUNT(total) both read 103 — one row per ticket, and total is never NULL. COUNT(DISTINCT customer_id) folds the tickets back to 16 accounts. Both grains are real; the leaderboard must name which one it prints.",
      notes: [
        { choice: 1, why: "COUNT(column) skips NULLs, not duplicates — total is NOT NULL here, so it equals COUNT(*) at 103. DISTINCT is the fold; NULL-skipping isn't." },
        { choice: 3, why: "SUM adds primary keys — a meaningless number that changes with every new ticket. Keys are for joining, never for folding." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-4",
      prompt: "Fill share: 52 of 103 tickets delivered. Which expression prints 50.5?",
      choices: [
        "COUNT(*) / 103 * 100",
        "100 * 52 / 103",
        "100.0 * COUNT(*) / 103.0",
        "ROUND(COUNT(*), 1) / 103 * 100.0",
      ],
      answer: 2,
      why: "100.0 promotes to real arithmetic BEFORE the division: 100.0 * 52 / 103.0 = 50.5. The integer variants divide first — 52/103 = 0, 5200/103 = 50 — and the share collapses.",
      notes: [
        { choice: 0, why: "Integer division strikes before the multiply: 52/103 truncates to 0, and 0 * 100 is still 0 — the funnel reads zero fills." },
        { choice: 1, why: "100 * 52 = 5200, then 5200 / 103 truncates to 50 — close, but the .5 is gone, and every share on the page now under-reports." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-5",
      prompt: "Fill latency: AVG(JULIANDAY(shipped_at) - JULIANDAY(created_at)) over all 103 tickets returns 2.98. What's wrong with the caption?",
      choices: [
        "Nothing — all 103 tickets have fill timestamps",
        "The average runs over 82 tickets — the 21 with NULL shipped_at silently drop out, so the caption must say 'over filled tickets'",
        "JULIANDAY cannot handle this date format",
        "The range 2-to-4 proves the average is wrong",
      ],
      answer: 1,
      why: "Aggregate functions skip NULL rows: only the 82 tickets with a fill timestamp enter the fold. The number is right; the caption's denominator is wrong — and on a funnel page the denominator is the definition.",
      notes: [
        { choice: 0, why: "21 tickets (14 pending + 7 cancelled) carry no fill timestamp — the average never saw them, which is exactly why the caption needs the population." },
        { choice: 3, why: "A 2-to-4 range around a 2.98 average is perfectly consistent — the range is a separate check, not a contradiction." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-6",
      prompt: "WHERE ticket_id NOT IN (SELECT ticket_id FROM fills_staging) — fills_staging.ticket_id is nullable in the copy growth loaded. What can happen?",
      choices: [
        "It runs slower but stays correct",
        "One NULL in the subquery empties the entire result — every row fails the test",
        "NULL ticket_ids are treated as unmatched and kept",
        "SQLite rewrites NOT IN as an anti-join automatically",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN is still UNKNOWN. One stray NULL silently returns zero rows. The NULL-proof shapes: NOT EXISTS, or LEFT JOIN … IS NULL.",
      notes: [
        { choice: 0, why: "The failure is correctness, not latency — an empty 'never-filled tickets' report that looks like good news to the funnel page." },
        { choice: 2, why: "NULLs don't 'fail through' to kept rows — they poison the whole membership test for every row, kept or not." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-7",
      prompt: "WHERE o.total > (SELECT AVG(o.total) FROM orders WHERE status = 'cancelled') — this week's staging copy has no cancelled tickets. What does the query return?",
      choices: [
        "Every ticket — the threshold reads 0",
        "No rows, silently — the empty scalar subquery yields NULL and every comparison against NULL is UNKNOWN",
        "An error: scalar subqueries must return exactly one row",
        "Only tickets with NULL totals",
      ],
      answer: 1,
      why: "A scalar subquery is contractually 0-or-1 rows; zero rows evaluates to NULL, not an error and not 0. total > NULL is UNKNOWN, so WHERE passes nothing — an above-average report that ships empty. The reflex: sanity-check the inner fold's population before trusting the outer filter.",
      notes: [
        { choice: 0, why: "NULL is not 0 — nothing compares TRUE against it; the report is empty, not unfiltered." },
        { choice: 2, why: "Zero rows is inside the scalar contract (0-or-1); only two or more rows would error." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-8",
      prompt: "Two accounts tie at 4 tickets each. ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC) assigns their ranks…",
      choices: [
        "Both get rank 1",
        "Ranks 1 and 2, in a deterministic order guaranteed by the query",
        "Ranks 1 and 2 — but WHICH account gets 1 can change between runs without a tiebreak column",
        "Both get rank 4",
      ],
      answer: 2,
      why: "ROW_NUMBER deals distinct ranks 1 and 2, but with a tied ORDER BY the assignment is engine-dependent — the leaderboard can flip between runs. The fix is a deterministic tiebreak (ORDER BY COUNT(o.id) DESC, name or id); RANK would instead give both rank 1.",
      notes: [
        { choice: 0, why: "That's RANK's contract, not ROW_NUMBER's — and it's also why the function choice is the story choice: boards deal, tiers share." },
        { choice: 1, why: "The ranks are 1 and 2, but 'deterministic' is exactly what's missing — a tied ORDER BY leaves the pick to the engine, so the Monday page isn't reproducible." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-9",
      prompt: "Notional per ticket averages 338.19 across the book. Where should the ROUND happen?",
      choices: [
        "Per row: ROUND each ticket's total to 2 decimals, then AVG",
        "Once, at the end: ROUND(AVG(total), 2)",
        "Twice — per row and again at the end, for safety",
        "Never; let the client render precision",
      ],
      answer: 1,
      why: "Rounding is a display decision — make it once, at the outermost fold. Per-row rounding perturbs the inputs before the average, and the aggregate drifts from the truth; the audited shape rounds exactly once, at the outer SELECT.",
      notes: [
        { choice: 0, why: "Rounded inputs average to a different value than ROUND(AVG(raw), 2) whenever any ticket's raw total carries more precision than the display — systematic drift, not noise." },
        { choice: 3, why: "Shipping full float precision isn't honesty, it's noise — pick the precision deliberately and round exactly once." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-10",
      prompt: "The growth team wants the fill-status census restricted to accounts with at least 3 tickets. Where does the 'at least 3' live?",
      choices: [
        "In WHERE: WHERE COUNT(*) >= 3",
        "In HAVING: GROUP BY customer_id HAVING COUNT(*) >= 3",
        "In ORDER BY, filtering while sorting",
        "Nowhere — aggregate the whole book and subtract in the app",
      ],
      answer: 1,
      why: "'At least 3 tickets' is a property of the GROUP, so it lives in HAVING after GROUP BY. WHERE filters rows before folding — COUNT doesn't even exist yet there. And keep status filters in WHERE, population filters in HAVING; mixing them is how denominators drift.",
      notes: [
        { choice: 0, why: "WHERE runs before GROUP BY — there are no groups yet, so COUNT(*) is invalid there. The two clauses filter different things: rows versus groups." },
        { choice: 3, why: "Moving the filter to the app hides the definition from the query — the number stops being re-derivable, and at Robinhood a number that can't be re-derived doesn't ship." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-11",
      prompt: "The rails stack appends a grand-total row over the cash movements — card 16, wire 11. What does the TOTAL row's count cell read?",
      choices: ["27", "28", "16", "22"],
      answer: 0,
      why: "The TOTAL row folds the whole payments table the same way the rails did: 16 card + 11 wire = 27 movements, appended by UNION ALL, never stored.",
      notes: [
        { choice: 1, why: "28 is the settlement-batch census (invoices) — a different table and a different grain; the spine has 27 cash movements against 28 batches." },
        { choice: 3, why: "22 is the count of batches WITH cash movement (28 minus the 6 unmoved) — a population fact, not this fold's output." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-12",
      prompt: "COUNT(shipped_at) over the 103-ticket orders table returns…",
      choices: [
        "103 — COUNT never skips rows",
        "82 — the 21 tickets with NULL shipped_at are skipped by COUNT(column)",
        "21 — COUNT counts the NULLs",
        "52 — only delivered tickets carry timestamps",
      ],
      answer: 1,
      why: "COUNT(column) counts non-NULL values only: 82 tickets carry a fill timestamp (52 delivered + 30 shipped); the 21 pending + cancelled drop out. COUNT(*) would read 103.",
      notes: [
        { choice: 0, why: "That's COUNT(*)'s contract — COUNT(column) skips NULLs, which is exactly why the two disagree by 21 here." },
        { choice: 2, why: "21 is the NULL complement — found with COUNT(*) - COUNT(shipped_at) or an IS NULL bucket, never by COUNT(shipped_at) itself." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-13",
      prompt: "Which query surfaces the void-but-moved anomaly — a batch whose status says void while its cash moved?",
      choices: [
        "SELECT i.id FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'void'",
        "SELECT i.id FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "SELECT i.id FROM invoices i WHERE i.status = 'void' AND i.amount_cents > 0",
        "SELECT i.id FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents = 0",
      ],
      answer: 0,
      why: "Void-but-moved means BOTH facts on one batch: status = 'void' AND a payment row exists. The INNER JOIN pairs batch #11 with its $925.00 movement and the status filter keeps it — one row, the anomaly.",
      notes: [
        { choice: 1, why: "That's the opposite sweep — LEFT JOIN … IS NULL finds batches with NO movements (#28 and the 6 unmoved). The two anomalies need opposite joins." },
        { choice: 2, why: "Every batch has a positive face, so this returns all void batches regardless of cash — it cannot tell 'moved' from 'unmoved'." },
        { choice: 3, why: "No movement is ever $0.00 — legs are positive, so this is an empty result, not an anomaly report." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-14",
      prompt: "Card movements: 16 of 27, $37,364.00 of $69,612.00. Which expression prints card's dollar share, 53.7?",
      choices: [
        "100 * 37364 / 69612",
        "ROUND(100.0 * 37364.0 / 69612.0, 1)",
        "37364 / 69612 * 100.0",
        "ROUND(37364.0 / 69612.0, 1)",
      ],
      answer: 1,
      why: "100.0 promotes the arithmetic to real first: 100.0 * 37364.0 / 69612.0 = 53.674…, then ROUND lands 53.7 exactly once at the edge. The integer variants truncate before ROUND ever sees the value.",
      notes: [
        { choice: 0, why: "Integer division: 100 * 37364 = 3736400, then / 69612 truncates to 53 — the .7 is gone, and every share on the page under-reports." },
        { choice: 2, why: "The first division is integer: 37364 / 69612 = 0, and 0 * 100.0 is still 0 — the share reads zero." },
        { choice: 3, why: "That's the RATIO (0.5), not the percentage — the ×100 belongs inside the fold, not after the round." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-15",
      prompt: "Finance wants the batches with NO cash movement and their total face. Which shape returns 6 batches / $15,217.00?",
      choices: [
        "FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL",
        "FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents = 0",
        "FROM invoices i WHERE i.id NOT IN (SELECT invoice_id FROM payments) AND i.status = 'open'",
      ],
      answer: 0,
      why: "LEFT JOIN keeps the unmoved batches with a NULL payload; WHERE p.id IS NULL keeps exactly those — 6 batches, $15,217.00 face. The AR exposure number, of ALL batches.",
      notes: [
        { choice: 1, why: "INNER JOIN deletes the NULL-payload rows before the filter — the anti-join's whole population — so this returns zero rows." },
        { choice: 2, why: "p.amount_cents = 0 matches nothing: unmoved batches have no payment ROW at all. The test for 'no row' is p.id IS NULL, not a zero amount." },
        { choice: 3, why: "The status filter shrinks the denominator: 5 rows / $13,461.00 — it silently drops paid #28 from its own anomaly report." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-16",
      prompt: "Batch #25 shows $4,000.00 moved against $6,148.00 face; five other batches settle in two exact legs. Which HAVING (per-batch fold) flags ONLY the true partial?",
      choices: [
        "HAVING SUM(p.amount_cents) < MAX(i.amount_cents)",
        "HAVING COUNT(p.id) = 1",
        "HAVING MAX(p.amount_cents) < MAX(i.amount_cents)",
        "HAVING SUM(p.amount_cents) > 0",
      ],
      answer: 0,
      why: "Per batch, the legs' SUM below the face is true only for #25 (400000 < 614800 cents) — the five splits sum exactly to face, so they fail the test. MAX(i.amount_cents) is just the face under GROUP BY i.id.",
      notes: [
        { choice: 1, why: "Single-leg matches every batch that paid in one exact leg (16 of them) and #28 has zero — this flags the healthy book, not the partial." },
        { choice: 2, why: "Leg-wise comparison: every leg of a split batch is below face, so all five splits get flagged too — leg grain masquerading as batch grain." },
        { choice: 3, why: "True for all 22 moved batches — this has no idea what 'partial' means." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-17",
      prompt: "Prove the clearing ledger balances in one scan: debits = credits = $181,080.00, delta $0.00. Which SELECT does it?",
      choices: [
        "SELECT ROUND(SUM(debit_cents)/100.0, 2) AS debits, ROUND(SUM(credit_cents)/100.0, 2) AS credits, ROUND((SUM(debit_cents)-SUM(credit_cents))/100.0, 2) AS delta FROM ledger_entries",
        "SELECT account, SUM(debit_cents) - SUM(credit_cents) AS net FROM ledger_entries GROUP BY account",
        "SELECT SUM(debit_cents - credit_cents) AS delta FROM ledger_entries",
        "SELECT ROUND(SUM(debit_cents)/100.0, 2) AS debits, ROUND(SUM(credit_cents)/100.0, 2) AS credits FROM ledger_entries WHERE account = 'cash'",
      ],
      answer: 0,
      why: "One scan, both sides folded from the full population, delta computed from the SAME folds — the page prints 181080.00 / 181080.00 / 0.00 and the zero is proven, not assumed.",
      notes: [
        { choice: 1, why: "Per-account nets are the next query, not the proof — four nets never show the global zero." },
        { choice: 2, why: "It prints only the delta — balance 'proven' without the sides means a reviewer can't see WHAT balanced, and the close needs both." },
        { choice: 3, why: "The WHERE shrank the population to one account: $69,612.00 / $25,416.00 — two real numbers proving nothing about the book." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-18",
      prompt: "The monthly trend groups on SUBSTR(created_at, 1, 7) and orders by that key. Why is the sort chronologically correct?",
      choices: [
        "SQLite detects date-like strings and sorts them as dates",
        "ISO 8601 is fixed-width and big-endian, so lexicographic order equals chronological order",
        "GROUP BY returns rows in insertion order, which happens to be chronological",
        "It isn't — you must ORDER BY JULIANDAY(month) instead",
      ],
      answer: 1,
      why: "'2024-07' < '2024-08' as strings because ISO packs the most significant digits first at fixed width — the trick is a property of the FORMAT, not the engine. It silently breaks the day the format changes.",
      notes: [
        { choice: 0, why: "SQLite stores TEXT as TEXT — no date affinity, no magic; the sort is plain BINARY string comparison." },
        { choice: 2, why: "GROUP BY output order is an implementation detail; here it works only because SQLite sorts by the key and the key is ISO — insertion order guarantees nothing." },
        { choice: 3, why: "It IS correct here — and a JULIANDAY cast on a 'YYYY-MM' string would fail outright; the fix for non-ISO keys is normalizing the key, not casting." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-19",
      prompt: "Running notional: SUM(o.total) OVER (ORDER BY created_at). Two tickets share one created_at. The second tied row reads…",
      choices: [
        "The sum through the first tied ticket only — frames are ROWS by default",
        "The sum including BOTH tied tickets — the default frame is RANGE up to the current row, and ties are peers",
        "An error: ORDER BY in OVER requires a unique key",
        "NULL — window functions skip tied rows",
      ],
      answer: 1,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE makes peers share a frame: both tied rows read the sum through the LAST peer. For a per-row walk, say ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW with a deterministic tiebreak.",
      notes: [
        { choice: 0, why: "That's the explicit ROWS frame — the default is RANGE, which is exactly the silent difference the question is about." },
        { choice: 2, why: "Ties are legal; the engine just needs the frame semantics stated — uniqueness is something you add with a tiebreak column, not something the syntax demands." },
        { choice: 3, why: "Windows never drop rows — every input row appears exactly once in the output; ties change values, not row counts." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-20",
      prompt: "Why does the rails stack use UNION ALL rather than UNION to append the TOTAL row?",
      choices: [
        "UNION would sort the stack alphabetically",
        "UNION dedupes — slower here, and the day two stack rows are identical it silently deletes one",
        "UNION ALL is required after GROUP BY",
        "They're identical — UNION ALL is just older syntax",
      ],
      answer: 1,
      why: "The three rows are distinct by construction, so ALL skips UNION's dedupe pass — cheaper and honest about intent. UNION's dedupe is a silent row-deleter the day a rail row legitimately equals another.",
      notes: [
        { choice: 0, why: "Dedupe isn't a sort guarantee — neither form promises alphabetical output; the stack's order comes from its own ORDER BY." },
        { choice: 2, why: "No such rule — set ops append whole SELECTs regardless of GROUP BY; the real difference is the dedupe pass." },
        { choice: 3, why: "They differ by exactly the dedupe — which is a correctness decision on a page that must reconcile to $69,612.00." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-21",
      prompt: "SELECT method, COUNT(*) FROM payments GROUP BY method returns how many rows?",
      choices: ["27", "2", "3", "16"],
      answer: 1,
      why: "One row per distinct method — card and wire. The fold's output grain is the group: 2 rows whose counts are 16 and 11.",
      notes: [
        { choice: 0, why: "27 is the input row count; GROUP BY folds it to the distinct keys." },
        { choice: 2, why: "3 would be true if a TOTAL row lived in the table — it doesn't; the TOTAL row is appended by the stack's UNION ALL, never stored." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-22",
      prompt: "SELECT invoice_id FROM invoices WHERE status = 'paid' EXCEPT SELECT invoice_id FROM payments — how many rows?",
      choices: ["0", "1", "6", "21"],
      answer: 1,
      why: "21 paid batches minus those with cash movements: #28 is paid with zero payment rows, so exactly 1 row survives — the paid-but-unmoved anomaly as a set operation.",
      notes: [
        { choice: 2, why: "6 is ALL unmoved batches — but 5 of them are open, never in the paid set; EXCEPT only sees paid batches." },
        { choice: 0, why: "That would mean every paid batch moved cash — #28 ($1,756.00) is the standing counterexample the board exists to catch." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-23",
      prompt: "Whale concentration: 63.5% of notional comes from accounts with lifetime spend of at least $3,000. Which computation is honest?",
      choices: [
        "AVG(lifetime_spend >= 3000) * 100",
        "100.0 * SUM(CASE WHEN lifetime_spend >= 3000 THEN notional ELSE 0 END) / SUM(notional)",
        "100 * SUM(notional) / COUNT(*)",
        "COUNT(CASE WHEN lifetime_spend >= 3000 THEN 1 END) / 16 * 100",
      ],
      answer: 1,
      why: "The numerator is notional FROM whales; the denominator is ALL notional — $34,833.28. The CASE carries each account's notional in or out, and 100.0 keeps the division real before ROUND.",
      notes: [
        { choice: 0, why: "AVG of a boolean is the share of ACCOUNTS above the threshold — a different KPI; the whale number weights by dollars, not headcount." },
        { choice: 2, why: "Total notional over the account count is neither whales nor a share — a ratio with no definition behind it." },
        { choice: 3, why: "That's the whale COUNT as a share of 16 accounts — headcount again; 4 of 16 accounts is nothing like 63.5%." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-24",
      prompt: "Tickets above their own account's average notional — correlated subquery vs derived table. Which claim is TRUE?",
      choices: [
        "The correlated form is per-row — the inner AVG re-runs for each outer row; the derived form folds once and joins back",
        "Both are per-row — SQLite always re-evaluates subqueries",
        "The derived form is per-row — derived tables re-scan per outer row",
        "The correlated form folds once — the engine caches AVG per account automatically",
      ],
      answer: 0,
      why: "Correlated subqueries carry a dependency on the outer row (o.customer_id), so the fold re-runs per row; a derived table is folded once in FROM and joined — same answer, one pass, and the only shape that scales past a toy book.",
      notes: [
        { choice: 1, why: "SQLite may optimize some correlated cases into joins, but the CONTRACT is per-row — pricing by contract is the habit being tested." },
        { choice: 2, why: "Derived tables are folded once into a temp structure, then joined — that is their entire reason to exist." },
        { choice: 3, why: "Caching a correlated fold per group is an optimizer feat, not a language guarantee — writing the derived form is how you guarantee it." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-25",
      prompt: "The coverage census over the 28 settlement batches reads exact / partial / none as…",
      choices: ["21 / 1 / 6", "21 / 6 / 1", "20 / 1 / 7", "22 / 1 / 5"],
      answer: 0,
      why: "21 exact ($65,612.00), 1 partial (#25, $4,000.00 of $6,148.00), 6 with no movement ($15,217.00) — and 21 + 1 + 6 = 28 is the reconciliation that proves the census complete.",
      notes: [
        { choice: 2, why: "That's the 20 from the settlement-cycle query (first-payment population) colliding with the census — the census counts 21 exact batches; payment-row populations are a different fold." },
        { choice: 3, why: "22 is the count of batches WITH cash (28 − 6) — it belongs to the moved/unmoved split, not the exact/partial/none census." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-26",
      prompt: "Treasury wants the split-payment batch ids as ONE cell: 1,5,12,19,22. Which shape builds it?",
      choices: [
        "GROUP_CONCAT(i.id) over the per-batch fold WHERE legs = 2",
        "SUM(i.id) over the per-batch fold WHERE legs = 2",
        "CONCAT(i.id) over the per-batch fold WHERE legs = 2",
        "i.id || ',' over the per-batch fold WHERE legs = 2",
      ],
      answer: 0,
      why: "GROUP_CONCAT is the fold that turns many rows into one string cell — five batch ids, comma-separated, one read. The derived fold (legs = 2 per batch) feeds it exactly the split population.",
      notes: [
        { choice: 1, why: "SUM adds them: 1+5+12+19+22 = 59 — a number that means nothing and changes with every new split." },
        { choice: 2, why: "SQLite has no set-wise CONCAT — this errors; string-building over rows is GROUP_CONCAT's whole job." },
        { choice: 3, why: "Per-row concatenation returns five rows of 'id,' — a cell per batch, not the single cell treasury asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-27",
      prompt: "Flag EXACTLY ONE row per account as its first ticket — even when two tickets share a timestamp. Which expression does it?",
      choices: [
        "MIN(created_at) OVER (PARTITION BY customer_id) = created_at",
        "LAG(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) IS NULL",
        "COUNT(*) OVER (PARTITION BY customer_id) = 1",
        "ROW_NUMBER() OVER (PARTITION BY customer_id) = 1",
      ],
      answer: 1,
      why: "LAG with a deterministic ORDER BY (created_at, id) makes exactly one row have no predecessor — the first, tie-proof. LAG(...) IS NULL is the first-session flag the first-trade funnel is built on.",
      notes: [
        { choice: 0, why: "With a tied timestamp BOTH rows equal the MIN — two flags on one account; only a sequential comparison like LAG is tie-proof." },
        { choice: 2, why: "That flags only accounts with ONE ticket total — 2 accounts — the opposite of 'every account's first'." },
        { choice: 3, why: "Without an ORDER BY, ROW_NUMBER's assignment among tied rows is engine-dependent — the flag can land on either ticket; the tiebreak inside ORDER BY is what makes it exact." },
      ],
      difficulty: "hard",
    },
    {
      id: "rh-mcq-28",
      prompt: "Duplicate-charge sweep: pair cash movements sharing amount and day, each pair once, never a row with itself. The join predicate is…",
      choices: [
        "p1.id <> p2.id AND p1.amount_cents = p2.amount_cents AND p1.paid_on = p2.paid_on",
        "p1.id < p2.id AND p1.amount_cents = p2.amount_cents AND p1.paid_on = p2.paid_on",
        "p1.id <= p2.id AND p1.amount_cents = p2.amount_cents AND p1.paid_on = p2.paid_on",
        "p1.amount_cents = p2.amount_cents AND p1.paid_on = p2.paid_on",
      ],
      answer: 1,
      why: "Strict < does three jobs at once: blocks self-pairs, breaks mirror symmetry (each pair survives once), and keeps output deterministic — the canonical pair-detection shape.",
      notes: [
        { choice: 0, why: "<> keeps both mirrors — every pair returns as (a,b) and (b,a), and the duplicate count doubles." },
        { choice: 2, why: "<= keeps self-pairs — every movement matches itself and the sweep reports the whole book as suspicious." },
        { choice: 3, why: "No id predicate at all: every row pairs with itself (and its mirror) — the <= bug and the <> bug in one." },
      ],
      difficulty: "medium",
    },
    {
      id: "rh-mcq-29",
      prompt: "The exception queue's two standing anomalies on this book are…",
      choices: [
        "void-but-moved #11 ($925.00) and paid-but-unmoved #28 ($1,756.00)",
        "open-but-moved #25 ($6,148.00) and void-but-unmoved #11 ($925.00)",
        "partial #25 and a negative balance on cash",
        "two cancelled batches carrying fill timestamps",
      ],
      answer: 0,
      why: "The gold set: one batch with status void whose cash moved anyway (#11, $925.00) and one paid batch with zero payment rows (#28, $1,756.00) — one row each, enormous in consequence.",
      notes: [
        { choice: 1, why: "#25 is OPEN with a partial $4,000.00 — an aging watch, not an anomaly; and '#11 void-but-unmoved' is the opposite of its actual disease." },
        { choice: 2, why: "The cash account nets +$44,196.00 — a negative balance would be a trial-balance failure, and the ledger's delta is $0.00." },
      ],
      difficulty: "easy",
    },
    {
      id: "rh-mcq-30",
      prompt: "The anomaly board's WHERE, over the per-batch fold (id, status, amount_cents, paid_cents). Which clause surfaces BOTH standing anomalies?",
      choices: [
        "WHERE status IN ('void', 'paid')",
        "WHERE (status = 'void' AND paid_cents > 0) OR (status = 'paid' AND paid_cents = 0)",
        "WHERE status = 'void' AND paid_cents = 0 AND paid_cents > 0",
        "WHERE paid_cents <> amount_cents",
      ],
      answer: 1,
      why: "Two OR arms, each one anomaly's definition over the folded row: cash on a dead batch (#11, $925.00) and a paid batch with no cash (#28, $0.00 moved). Each arm names both facts its anomaly needs.",
      notes: [
        { choice: 0, why: "That's 22 rows — every void and paid batch; an anomaly board with no filter on it." },
        { choice: 2, why: "Contradictory on its face AND wrong: #11's cash DID move (paid_cents = 92500), so this arm can never fire." },
        { choice: 3, why: "Catches #28 but misses #11 (its legs sum exactly to face) and drags in the partial #25 — over- and under-inclusive at once." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-rh-1",
      tier: "easy",
      topic: "l8",
      universe: "funnel",
      title: "The session funnel: fill-status census",
      brief:
        "Growth memo: the weekly funnel page opens with the fill-status census — every ticket the platform routed, bucketed by outcome with its share of the book. The book: 52 delivered (50.5%), 30 shipped (29.1%), 14 pending (13.6%), 7 cancelled (6.8%) — of 103 tickets. Shares are 100.0 * COUNT / 103.0 — the 100.0 and the .0 are the difference between a rate and a rounding bug — and the census must keep every bucket: floor the HAVING at the smallest bucket so nothing silently disappears from the page.",
      ask: "Return per-status ticket counts with share of all 103 (1 decimal), biggest first, all buckets kept.",
      template:
        "SELECT status,\n       COUNT(*) AS tickets,\n       ROUND(100.0 * COUNT(*) / {1}, 1) AS share_pct\nFROM orders\nGROUP BY {2}\nHAVING COUNT(*) >= {3}\nORDER BY tickets {4};",
      slots: [
        {
          answer: "103.0",
          kind: "number",
          noVerify: true,
          label: "the census denominator",
          why: "The share's denominator is the 103 placed tickets — a population constant, not a result cell. 103.0 (not 103) keeps the arithmetic real; 1000 or 10.0 rescales every share and the funnel reads fiction.",
        },
        {
          answer: "status",
          kind: "keyword",
          label: "the funnel bucket key",
          why: "The page buckets by outcome — GROUP BY status folds 103 tickets into 4 statuses (52/30/14/7). GROUP BY customer_id answers a different question (16 accounts) and shreds the funnel into noise.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the keep-every-bucket floor",
          why: "The HAVING floor must sit at the smallest bucket — cancelled is 7 — so all four statuses survive and the counts reconcile to 103. A floor of 14 deletes the cancelled bucket from the page while looking like a legitimate filter.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first order",
          why: "Funnels read biggest-first: delivered 52 on top, cancelled 7 at the bottom. ASC is a correct query answering the opposite question — it opens the page with the smallest bucket.",
        },
      ],
      distractors: ["1000", "customer_id", "ASC", "14"],
      walkthrough:
        "The funnel census is one fold with a stated denominator. GROUP BY status folds the 103 tickets into four buckets — delivered 52, shipped 30, pending 14, cancelled 7 — and the share is 100.0 * COUNT(*) / 103.0: the 100.0 promotes the arithmetic to real before the division (50.5, 29.1, 13.6, 6.8 — summing to 100.0 within a decimal's tolerance), and the .0 on the denominator is the same promise. HAVING COUNT(*) >= 7 is the keep-every-bucket guard: it sits at the smallest bucket deliberately, so the floor is a no-op today and a silent-deletion bug the day a bucket shrinks below an arbitrary threshold. ORDER BY tickets DESC puts the page in funnel order. The distractors fail exactly where the craft lives: 1000 rescales every share to ~5% and the page reads fiction, customer_id re-grains the fold to 16 account rows (a different report entirely), 14 deletes the cancelled bucket the page exists to surface, and ASC hands the reader the 7-ticket bucket first. Four buckets, one denominator, one guard — the census growth actually ships.",
    },
    {
      id: "cs-rh-2",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement leaderboard: tickets and notional",
      brief:
        "Product memo: the engagement leaderboard ranks accounts by ticket count with lifetime notional alongside — retention reads ranks 1-5 every Monday. Top of book: Alice Chen, 24 tickets, $7,262.35; Emma Wilson, 17 / $6,640.56; Grace Kim, 14 / $4,574.23. Ranking must be deterministic — window order DESC with the board capped at 5 — and notional is a REAL-dollar fold on the tickets table (ROUND(SUM(o.total), 2); no cents conversion lives on orders).",
      ask: "Return the top 5 accounts ranked by ticket count, with region, ticket count and notional (2 decimals).",
      template:
        "SELECT {1}() OVER (ORDER BY COUNT(o.id) {2}) AS rnk,\n       c.name,\n       c.region,\n       COUNT(o.id) AS tickets,\n       ROUND(SUM(o.total), 2) AS notional_usd\nFROM customers c\nJOIN orders o ON o.customer_id = c.{3}\nGROUP BY c.id\nORDER BY rnk\nLIMIT {4};",
      slots: [
        {
          answer: "ROW_NUMBER",
          kind: "keyword",
          label: "the board's dealing function",
          why: "A leaderboard deals unique ranks — ROW_NUMBER. LAG needs an argument (syntax error in this slot) and SUM() OVER (ORDER BY …) is a running total, not a rank: it would print cumulative counts where ranks belong.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the most-engaged-first order",
          why: "The board ranks most tickets first (24 down to 5). ASC crowns the 5-ticket account rank 1 — a correct query answering the opposite question, and retention's Monday page upside-down.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the account join key",
          why: "Tickets attach to accounts via c.id — the account's own PK. c.customer_id doesn't exist on customers: the wrong-side key fails instantly instead of silently mis-ranking.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the board cap",
          why: "The Monday page is a top-5: LIMIT 5 caps after ORDER BY rnk. 3 truncates the page, 10 spills into the long tail — with 16 accounts, the cap is the difference between a board and a dump.",
        },
      ],
      distractors: ["LAG", "SUM", "ASC", "customer_id", "3"],
      walkthrough:
        "A leaderboard is a window over a fold. The join attaches each of the 103 tickets to its account (all 16 accounts have traded on this book — INNER and LEFT agree here, and the analyst says why); GROUP BY c.id folds to one row per account with COUNT(o.id) as the ticket grain and ROUND(SUM(o.total), 2) as lifetime notional — REAL dollars on orders, no cents conversion, rounded once. ROW_NUMBER() OVER (ORDER BY COUNT(o.id) DESC) deals ranks 1 through 5 deterministically at the top because the counts are distinct (24 / 17 / 14 / 13 / 5) — with ties, the board would need an explicit tiebreak column, and stating that contract is part of the answer. ORDER BY rnk plus LIMIT 5 caps the page after ranking. The distractors fail exactly where the craft lives: LAG() and SUM() in the window slot are errors (LAG needs an argument; SUM() OVER is a running total), ASC crowns the quietest account, customer_id doesn't exist on the customers side, and LIMIT 3 cuts the board retention asked for. Five ranks, one fold, one cap — the leaderboard retention actually reads.",
    },
    {
      id: "cs-rh-3",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "Regional notional rollup: tickets and dollars per region",
      brief:
        "Growth memo: the regional rollup under the leaderboard — every region's ticket count, active buyers and notional, biggest book first. Probed: EU 45 tickets / 8 buyers / $15,089.23; APAC 37 / 5 / $11,605.45; US 19 / 2 / $7,286.16; LATAM 2 / 1 / $852.44 — of 103 tickets and $34,833.28. The fold is join-then-aggregate over REAL dollars (orders carries no cents — no /100.0 lives here), grouped per region, floored at the smallest region so no row disappears, ordered biggest-first. The HAVING floor parks AT the smallest bucket — that's a keep-every-region guard, not a filter.",
      ask: "Return per-region ticket counts, distinct buyers and notional (2 decimals), biggest notional first, all four regions kept.",
      template:
        "SELECT c.{1} AS region,\n       COUNT(o.id) AS tickets,\n       COUNT(DISTINCT o.customer_id) AS buyers,\n       ROUND(SUM(o.total), 2) AS notional_usd\nFROM customers c\nJOIN orders o ON o.customer_id = c.{2}\nGROUP BY c.region\nHAVING COUNT(o.id) >= {3}\nORDER BY notional_usd {4};",
      slots: [
        {
          answer: "region",
          kind: "keyword",
          label: "the region key",
          why: "The page buckets per region — c.region is both the label and the fold's key. city or name answers a different question: 16 city rows (or 16 accounts) instead of 4 regions, and every share against 103 stops adding up.",
        },
        {
          answer: "id",
          kind: "keyword",
          label: "the account join key",
          why: "Tickets attach to accounts via c.id — the account's own primary key. c.customer_id doesn't exist on customers; c.name matches text against numeric ids and returns an empty book.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the keep-every-region floor",
          why: "The HAVING floor parks at the smallest region — LATAM's 2 tickets — so all four rows survive and the counts reconcile to 103. 3 deletes LATAM from the page while the other three rows still sum to something plausible.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first order",
          why: "Growth reads biggest-first: EU's $15,089.23 on top, LATAM's $852.44 at the bottom. ASC is a correct query answering the opposite question — it opens the memo with the smallest book.",
        },
      ],
      distractors: ["city", "name", "3", "ASC"],
      walkthrough:
        "A regional rollup is join-then-fold: the join attaches each of the 103 tickets to its account (all 16 accounts traded — INNER and LEFT agree here, and the analyst says why), GROUP BY c.region folds to four rows, COUNT(o.id) counts tickets (orders is one row per ticket — joining order_items here would fan the SUM out by the legs-per-ticket ratio), COUNT(DISTINCT o.customer_id) counts buyers, and ROUND(SUM(o.total), 2) folds REAL dollars with no cents conversion, rounded once. EU 45 / 8 / $15,089.23 leads, then APAC 37 / 5 / $11,605.45, US 19 / 2 / $7,286.16, LATAM 2 / 1 / $852.44 — $34,833.28 across the four, reconciling to the book total. HAVING COUNT(o.id) >= 2 is the keep-every-region guard parked at the smallest bucket (LATAM's 2) — a no-op today, a silent row-deleter the day a region thins out. The distractors fail exactly where the craft lives: city relabels the region column with arbitrary per-group city values while still grouping by region, name joins on a text column orders.customer_id can never match (empty book), 3 drops LATAM from the page, and ASC opens the memo with the smallest book.",
    },
    {
      id: "cs-rh-4",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The leg census: how settlement batches collect their cash",
      brief:
        "Treasury memo: before the close ships, the coverage question gets a leg-grain answer — one row per cash movement against a batch, classified as it lands. On this book: 16 legs cover their batch exactly ($40,672.00 moved), 11 legs are short — the installment shape from the five two-leg batches (#1, 5, 12, 19, 22) plus the true partial (#25, $4,000.00 of $6,148.00) — and 6 batches show no movement at all ($15,217.00 face). Classes must reconcile: 16 + 11 + 6 = 33 JOIN rows (27 movements plus 6 NULL payloads), batches 16 + 6 + 6 = 28. The census keeps every class; the floor sits at 1.",
      ask: "Return the leg census: class label, leg count, batch count and cash moved (2 decimals), biggest class first, all classes kept.",
      template:
        "SELECT CASE\n         WHEN p.id IS NULL THEN {1}\n         WHEN p.amount_cents < i.amount_cents THEN {2}\n         ELSE {3}\n       END AS leg_class,\n       COUNT(*) AS legs,\n       COUNT(DISTINCT i.id) AS batches,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS moved_usd\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nGROUP BY {4}\nHAVING COUNT(*) >= {5}\nORDER BY legs DESC;",
      slots: [
        {
          answer: "'no movement'",
          kind: "keyword",
          label: "the empty-payload class",
          why: "A LEFT JOIN keeps unmoved batches with a NULL payload — 6 of them, $15,217.00 face. The WHEN p.id IS NULL arm is the only test that sees them; the label names them for the page.",
        },
        {
          answer: "'short leg'",
          kind: "keyword",
          label: "the installment-leg class",
          why: "A leg below face is an installment: ten legs across the five two-leg splits plus #25's $4,000.00 of $6,148.00. Leg-grain language keeps the five healthy splits distinct from a true partial batch.",
        },
        {
          answer: "'exact leg'",
          kind: "keyword",
          label: "the one-shot class",
          why: "ELSE catches the legs that cover their batch in one movement — 16 of them, $40,672.00. The ELSE must be the residual class, not a re-test that shadows the WHENs above it.",
        },
        {
          answer: "leg_class",
          kind: "keyword",
          label: "the class fold key",
          why: "The census folds per class — GROUP BY the CASE's alias (SQLite honors it). GROUP BY i.status re-grains the page to open/paid/void; GROUP BY p.id explodes it to one row per leg.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the keep-every-class floor",
          why: "The floor sits at 1 so no class silently disappears — a no-op today (smallest class has 6 rows), a silent row-deleter the day a class thins out. A threshold constant, not a result cell.",
        },
      ],
      distractors: ["i.status", "p.id", "14"],
      walkthrough:
        "The leg census folds the JOIN grain — one row per cash movement, plus one NULL-payload row per unmoved batch. The CASE reads each leg: NULL payload goes to no movement (6 rows, 6 batches, $15,217.00 face); a leg below face goes to short leg (11 rows across 6 batches — the ten legs of the five two-leg splits #1, 5, 12, 19, 22 plus #25's $4,000.00 of $6,148.00); otherwise exact leg (16 rows, 16 batches, $40,672.00). The reconciliations are the proof: 16 + 11 + 6 = 33 JOIN rows (27 movements + 6 unmoved), batches 16 + 6 + 6 = 28, and moved dollars $40,672.00 + $28,940.00 = $69,612.00 — every cent on the book. The no-movement class moves no cash, so its moved_usd cell is NULL — the honest answer, not a zero to launder. GROUP BY leg_class folds per class; HAVING >= 1 is the keep-every-class guard; ORDER BY legs DESC puts the biggest class first. The distractors fail exactly where the craft lives: i.status as a label turns the class column into statuses while still counting legs, and as the group key re-grains the whole page to open/paid/void; p.id labels rows with payment ids and explodes the fold to one row per leg; 14 in the HAVING keeps only the exact class and silently deletes the two classes the memo exists to see.",
    },
    {
      id: "cs-rh-5",
      tier: "hard",
      topic: "q5",
      universe: "refund-audit",
      title: "The anomaly board: void-but-moved and paid-but-unmoved",
      brief:
        "Audit memo: the board keeps the two rows where status and cash disagree. From the per-batch fold: #11 is VOID with a $925.00 movement against it — cash moved on a batch marked dead; #28 is PAID with zero movement rows — the ledger claims settled and the spine shows nothing. Everything else stays quiet by definition: 21 exact, the 5 splits (1, 5, 12, 19, 22) summing to face across two legs, and open #25 partial at $4,000.00 of $6,148.00. Two rows out of 28 — the board exists so they never ship as a clean close.",
      ask: "Return the anomaly rows: batch id, status, face and cash moved (2 decimals), highest batch id first.",
      template:
        "SELECT f.id,\n       f.status,\n       ROUND(f.amount_cents / 100.0, 2) AS invoiced_usd,\n       ROUND(f.paid_cents / 100.0, 2) AS moved_usd\nFROM (\n  SELECT i.id, i.status, i.amount_cents,\n         COALESCE(SUM(p.amount_cents), 0) AS paid_cents\n  FROM invoices i\n  LEFT JOIN payments p ON p.invoice_id = i.id\n  GROUP BY i.id\n) {1}\nWHERE (f.status = {2} AND f.paid_cents > {3})\n   OR (f.status = {4} AND f.paid_cents = 0)\nORDER BY {5} DESC;",
      slots: [
        {
          answer: "f",
          kind: "keyword",
          label: "the derived fold's alias",
          why: "The derived table folds once per batch (COALESCE makes unmoved read 0, not NULL) and the outer query classifies. The alias is the fold's handle — rename it here and every f. reference orphans into an error.",
        },
        {
          answer: "'void'",
          kind: "keyword",
          label: "the dead-batch status",
          why: "Void means dead: ANY cash against it is the anomaly (#11, $925.00 moved). 'open' would drag #25's partial onto the board and miss the real disease — the arm must name the status it polices.",
        },
        {
          answer: "0",
          kind: "number",
          noVerify: true,
          label: "the any-cash threshold",
          why: "ANY cash on a void batch is the finding, so the threshold is zero — and > 0, not >= 0, or every dead batch qualifies. A definition constant, not a result cell.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled-batch status",
          why: "The mirror arm: status says paid, cash says nothing (#28 — $1,756.00 face, $0.00 moved). 'open' here floods the board with the five healthy unmoved-open batches.",
        },
        {
          answer: "f.id",
          kind: "keyword",
          label: "the board's row order",
          why: "ORDER BY f.id DESC reads the board newest-batch first — #28 above #11, deterministic on every run. A bare column or a different f. field reshuffles rows the audit expects stable.",
        },
      ],
      distractors: ["i", "'open'", "92500", "f.paid_cents", "status"],
      walkthrough:
        "The board is a two-stage query. The derived table folds once per batch — LEFT JOIN payments, SUM(amount_cents) wrapped in COALESCE so unmoved batches read 0 (not NULL), GROUP BY i.id — 28 folded rows carrying id, status, face and cash. The outer query classifies with two OR arms, each arm one anomaly's definition: void with cash over zero (#11 — $925.00 moved against a dead batch), paid with zero cash (#28 — $1,756.00 face, $0.00 moved). Result: exactly two rows, ORDER BY f.id DESC — #28 first, #11 last. Everything else stays quiet by construction: 21 exact batches sum to face, the five splits sum to face across two legs, #25 is open. The distractors fail exactly where the craft lives: i as the alias orphans every f. reference into unbound-column errors; 'open' in the first arm drags #25's partial onto the board while missing #11; 92500 as the threshold pushes it above #11's 92,500 cents so the board prints only #28; f.paid_cents in the ORDER BY re-orders by cash (925.00 before 0.00); the bare status in ORDER BY sorts by status text — every variant ships a board whose rows move run to run. Definitions first, then the fold that proves them — that's the board.",
    },
    {
      id: "cs-rh-6",
      tier: "hard",
      topic: "x3",
      universe: "month-close",
      title: "The rails stack: card, wire and the grand total",
      brief:
        "Month-close memo, final page: the rails stack. One fold over the cash movements split by method — card: 16 movements, $37,364.00; wire: 11, $32,248.00 — then the same fold appended as a TOTAL row: 27 movements, $69,612.00, the whole book in one cell. The stack reads total-first: the whole book anchors the top, rails under it in method order. Three rows, one fold, zero hand arithmetic — if TOTAL does not equal card plus wire to the penny ($37,364.00 + $32,248.00), the page does not ship.",
      ask: "Return the stack: method, movement count and dollars (2 decimals) per rail, plus the TOTAL row, total anchored first, capped at 3 rows.",
      template:
        "SELECT method,\n       COUNT(*) AS movements,\n       ROUND(SUM(amount_cents) / 100.0, 2) AS total_usd\nFROM payments\nGROUP BY method\nUNION ALL\nSELECT {1},\n       COUNT(*),\n       ROUND(SUM(amount_cents) / 100.0, 2)\nFROM payments\nORDER BY {2} {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-total label",
          why: "The appended row is the grand total: the literal 'TOTAL' is its label, matched exactly by every downstream consumer. A lowercase variant looks identical to a human and breaks every string match — labels are contract cells, like statuses.",
        },
        {
          answer: "method",
          kind: "keyword",
          label: "the stack's order key",
          why: "The method key with ASC is the convention: the uppercase TOTAL literal sorts before lowercase rails in BINARY order, so the stack reads TOTAL, card, wire — the total anchors the top. total_usd would bury the total at the bottom; movements inverts the page (wire's 11 on top).",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the total-first direction",
          why: "ASC with the method key lands TOTAL, card, wire — the uppercase literal sorts before lowercase rails in BINARY order. DESC reverses to wire, card, TOTAL: the page opens with the smallest rail and ends on the number that should lead.",
        },
        {
          answer: "3",
          kind: "number",
          noVerify: true,
          label: "the row cap",
          why: "Three rows exist — two rails plus the total — so LIMIT 3 caps the page exactly. 2 deletes the wire row and the stack stops reconciling to $69,612.00. The cap is a constant, not a result cell — it ships noVerify.",
        },
      ],
      distractors: ["'total'", "movements", "DESC", "2"],
      walkthrough:
        "The grand-total stack is one fold said twice. The first SELECT folds payments by method: card 16 movements / $37,364.00, wire 11 / $32,248.00. UNION ALL appends the same fold ungrouped — COUNT(*) reads 27, SUM reads $69,612.00 — labelled 'TOTAL' so the page reads as a stack. The reconciliation is mechanical and mandatory: 16 + 11 = 27 and $37,364.00 + $32,248.00 = $69,612.00, to the penny, because both branches fold the same INTEGER-cents column with the same /100.0 at the read edge. ORDER BY method ASC lands TOTAL first (the uppercase literal sorts before lowercase rails in BINARY order), then card, wire — the total anchors the top of the page. The distractors fail exactly where the craft lives: 'total' in lowercase breaks every consumer matching the exact label cell; movements as the sort key hands the page wire-first (11 is the smallest count); DESC buries the total under the rails; and LIMIT 2 silently deletes the wire row — a stack that no longer sums. UNION instead of UNION ALL would pass today and silently delete a rail row the day two rows agree, which is why the memo mandates ALL.",
    },
  ],

  problems: [
    { slug: "realized-pnl-average-cost", why: "Robinhood-tagged: average-cost fill accounting — the realized P&L walk every retail position shows, built from fill-by-fill buys and sells." },
    { slug: "split-adjusted-position", why: "Robinhood-tagged: corporate-action adjustments to a held position — the share-count restatement that keeps the engagement history comparable across splits." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of a population participating — the platform-wide engagement read: what fraction of accounts traded this week, denominator stated." },
    { slug: "queries-quality-and-percentage", why: "Two rates in one pass with the 100.0-before-division fix — the honest-denominator habit every fill-rate percentage here needs." },
    { slug: "funnel-step-conversion", why: "Step-to-step conversion with gaps — the first-trade funnel drill: placed → routed → filled, each step's survival measured against the step before it." },
    { slug: "second-day-confirmation", why: "Day-2 return detection — the first-trade funnel's moment of truth: which accounts came back the next session, counted deterministically." },
    { slug: "active-users", why: "Consecutive-session detection — the streak finder engagement reads weekly: which accounts traded day after day, and for how long." },
    { slug: "rolling-7d-actives", why: "Rolling distinct actives over a 7-day frame — the engagement baseline every funnel share is measured against, window-first." },
    { slug: "maximum-transaction-each-day", why: "Argmax per day over ticket notional — the biggest trade in each session window, fold and window in one query." },
    { slug: "the-most-recent-three-orders", why: "Per-entity latest-3 rail via ROW_NUMBER with a deterministic tiebreak — the recent-activity widget on every account page, in graded form." },
    { slug: "rank-scores", why: "Ranking with gaps versus dense — the leaderboard drill: what rank 3 means when two accounts tie, and why the function choice is the story choice." },
    { slug: "capital-gain-loss", why: "Realized gain/loss per holding — the portfolio read beneath the engagement loop: what the trading actually earned, folded per asset." },
    { slug: "find-customer-referee", why: "NULL-safe filtering — the drill behind the 21 never-filled tickets: rows that fail every equality and vanish unless the arm is IS NULL." },
    { slug: "null-blank-audit", why: "Null and blank census across columns — the pre-ship data-quality pass the funnel page gets: NULLs counted as a bucket, not dropped silently." },
    { slug: "cohort-retention-matrix", why: "Cohort grid with forward offsets — accounts bucketed by first-trade week, activity tracked forward, the retention matrix retention reads every Monday." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU-style stickiness ratio — the engagement heartbeat: daily actives as a share of weekly, with the rolling frames done in one pass." },
    { slug: "monthly-transactions-i", why: "Month-bucket CASE read over the money spine — batch status by month with the CASE flag, the close's calendar slice, in graded form." },
    { slug: "monthly-transactions-ii", why: "UNION ALL stacks over month buckets — the rails-stack shape the close page ships: two grains appended, TOTAL-row discipline." },
    { slug: "bank-account-summary-ii", why: "Per-account cash summary from movements — the per-account spine read: aggregates with zero-fill columns beside them." },
    { slug: "bank-account-summary", why: "LEFT JOIN running balance with NULL-safe zero-fill — the account rollup that must show $0.00, not NULL, for quiet accounts." },
    { slug: "duplicate-charge-pairs", why: "Self-join pair detection on cash movements — the duplicate-leg sweep treasury runs before anything reconciles, a.id < b.id discipline." },
    { slug: "gl-reconciliation", why: "Ledger reconciliation with a delta column — the zero-delta contract ($181,080 = $181,080) as a repeatable query, not a hope." },
    { slug: "trial-balance-check", why: "Conditional SUM debits-vs-credits in one scan — the trial balance drill: both sides folded together, delta proven, not assumed." },
    { slug: "chargeback-rate-ranking", why: "Rate computation with honest denominators, then ranked — dispute-rate shares per cohort with the 100.0-before-division fix." },
    { slug: "number-of-rich-customers", why: "COUNT(DISTINCT) whale census — how many accounts cross the threshold: the headcount twin of the 63.5% notional concentration." },
    { slug: "uber-first-transaction", why: "Per-entity first event — the first-fill detection rail: argmax by account with a deterministic tiebreak, LAG-ready." },
    { slug: "transaction-velocity", why: "Burst detection over time buckets — movement velocity on the spine: when cash arrives in clusters and what that does to the daily fold." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window anomaly scan — the exception-queue builder: movements flagged by pattern across a rolling frame, severity ordered." },
    { slug: "portfolio-concentration-hhi", why: "Concentration scoring — the HHI behind the whale-concentration conversation: one number that prices dependency on the power accounts." },
    { slug: "portfolio-weights", why: "Window shares per holding — allocation percentages done right: each slice over the stated total, 100.0 before the division." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Visited-but-didn't-transact anti-join — the session-without-trade sweep: accounts that showed up and never placed a ticket." },
    { slug: "spend-histogram", why: "Bucket census over spend — the notional histogram: tickets sliced into bands with counts, the distribution behind the $338.19 average." },
  ],
};
