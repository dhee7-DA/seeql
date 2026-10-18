// N26 — Wave-8 (Task 96), fintech domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Mobile banking across the eurozone: the storefront db read as a consumer-bank
// sandbox — customers are account holders (region = market; 8 of 16 in the EU
// home region), orders are card transactions (delivered = settled, shipped =
// captured and settling with shipped_at as the settlement stamp, pending =
// authorized awaiting capture, cancelled = declined), order_items are the
// itemized lines a terminal sends with each transaction (quantity = items,
// unit_price = per-item price), products are the merchant catalog grouped into
// seven spend categories (max typical ticket 199.99 — the premium band >= 200
// is empty), suppliers are the six acquiring partners that route card volume,
// invoices are monthly account statements (28 cycles), payments are inbound
// settlement legs on two rails (card = instant top-up, wire = SEPA transfer —
// INTEGER cents, the euro read is amount_cents / 100.0), expenses are opex and
// ledger_entries is the double-entry GL. Spaces sub-accounts, Wise-powered
// foreign-currency transfers, VideoIdent KYC status and the Standard → Metal
// tier ladder are woven through the prose, never invented into numbers.
// company-pools.md carries NO N26 section — 0 tagged rows — so
// all 10 topic slug sets and the 32-problem pool are theme-curated from the pools
// file's theme menu and say so. Case briefs quote probed figures from
// scripts/company-facts.md (probed 2026-10-12); every case slot is mechanically
// verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const n26Kit: CompanyKit = {
  id: "n26",
  domainId: "fintech",
  name: "N26",
  tagline: "Mobile banking across the eurozone",
  accent: "text-teal-200",

  brief: [
    "**N26** is the mobile bank of the eurozone — a fully licensed neobank where the phone IS the branch: accounts open over a VideoIdent video call, money is organized into Spaces sub-accounts, foreign-currency transfers ride the Wise integration, and paid tiers run Standard through Metal. The analytics reality is a consumer bank at mobile speed: every card tap either settles, settles late, or {rose:declines}, and the whole product is judged by how honestly those outcomes are counted. This kit maps the storefront db onto that world: the 16 customer rows are account holders, the 103 orders are card transactions worth **34,833.28**, and the 251 order_items rows are the itemized lines terminals send with each transaction. The status map is fixed: delivered = {emerald:settled} (52, 50.5%), shipped = captured and settling (30, 29.1%), pending = awaiting capture (14, 13.6%), cancelled = {rose:declined} (7, 6.8%).",
    "The data org splits into growth, risk and a money-movement desk, and they read the same spine at different grains. Growth opens with the two-grain census: the EU home market runs 45 transactions from 8 accounts while the US runs 19 from 2 — intensity 5.6 versus 9.5. Risk owns the decline map — 6.8% of transactions decline overall, {rose:8.1%} in APAC against 5.3% in the US — and the settlement clock: 82 of 103 transactions carry the `shipped_at` stamp, averaging **2.98 days** with a 2–4 day spread. The money desk reads statements and legs: 28 monthly statement cycles against 27 inbound legs (16 instant card top-ups worth 37,364, 11 SEPA transfers worth 32,248), all INTEGER cents where the euro read is `amount_cents / 100.0`.",
    "Interview screens are definition-first with a reconciliation tail. A typical loop opens with a conditional count (settled share — *does a declined transaction stay in your denominator?*), escalates into a rate or a leaderboard where ties are real (four accounts sit at 4 transactions each under the 24, 17, 14, 13, 5 ladder), then into the coverage classification — {emerald:exact} / {amber:partial} / {rose:never-settled} — where the statements-vs-legs anti-join lives (6 untouched statements worth 15,217). The close is the ledger: debits 181,080 against credits 181,080, delta zero, plus the standing anomalies every candidate should smell — a void cycle with a 925.00 leg (#11) and a paid cycle with none (#28, 1,756.00).",
    "Preparation strategy: the pools file carries no N26 section — **0 tagged rows, none SQL-graded** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: transaction-lifecycle censuses, honest-denominator decline shares, cents-safe money folds, coverage CASE bands and KYC string hygiene. Do the topics in order, then run all six case studies on the live storefront db: the {amber:status-versus-settlement audit} the money desk runs at every close, the {rose:one-pass decline census} risk reviews each morning, the engagement ladder, the ticket bands, the acquiring-partner chain and the grand-total statement stack. Thirty MCQs, twenty-four theory probes, six cases and thirty-two problems are built for spaced practice rather than one sitting — rotate a topic block, then a case, and let the review intervals do the compounding. The bar to clear: *state the definition and the denominator before you compute anything* — then make every lifecycle census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the settlement file. A risk analyst opens the transaction dashboard before standup: did overnight authorizations capture, did any merchant file skip its line count, does the one-pass lifecycle census reconcile — 52 settled + 30 settling + 14 awaiting + 7 declined = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. The decline map refreshes next: APAC's **8.1%** decline share against the US's **5.3%** decides whether the 3DS step-up rules get loosened or tightened before the lunchtime spend peak.",
    "**11:30 —** Midday is the deep-dive stretch. Growth wants the two-grain census re-cut — EU's 45 transactions from 8 accounts beside the US's 19 from 2 — to argue where referral incentives land; the money desk wants the FX queue walked: foreign-currency transfers priced through the **Wise** integration, checked for stale rates before customers notice; and a product manager wants Spaces allocation reads — how much of each balance sits in sub-accounts versus the main account. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the review argument*.",
    "**15:30 —** The afternoon belongs to money. The untouched-statement queue refreshes first — **6 cycles worth 15,217** with zero legs — before any customer gets chased; the coverage split reads **21 exact, 1 partial** (4,000.00 of a 6,148.00 statement) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled cycle (#11, 925.00) and a paid-status cycle with no legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settled share", what: "Settled transactions ÷ ALL transactions booked: 52 of 103 (50.5%). The lifecycle headline growth borrows from risk — the 30 still-settling and 14 awaiting rows are 'not yet', never silent zeros." },
    { name: "Decline rate", what: "Declined ÷ all booked: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The map that tunes 3DS step-up rules and issuer routing per region." },
    { name: "Time-to-settle", what: "Authorization to settlement stamp (created_at → shipped_at) over settled transactions only: 2.98-day average, range 2–4, over the 82 stamped rows. The population definition ships with the number." },
    { name: "Average ticket", what: "Book value ÷ transactions: 34,833.28 across 103, averaging 338.19 against a 25.47 to 1,088.44 spread. The spread IS the big-ticket story — one 1,088.44 authorization outweighs the smallest 42 combined." },
    { name: "Statement coverage", what: "Settled versus claimed: 21 exact settlements, 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217. The statements-vs-legs census the money desk refreshes every close." },
    { name: "Rail mix", what: "Inbound legs by rail: 16 instant card top-ups worth 37,364 versus 11 SEPA transfers worth 32,248. Five statements settle in two legs (cycles 1, 5, 12, 19, 22) — the fan-out trap is structural." },
    { name: "Account concentration", what: "Share of spend from accounts whose lifetime volume crosses 3,000: 63.5% (71.2% above 2,000). The number that staffs the premium-tier pod and sizes the Metal upsell." },
    { name: "Partner concentration", what: "Share of routed card volume carried by the top acquiring partner: 32% (11,130.25 of the book) against a 4.6 partner quality score. One partner degrading degrades a third of the card experience." },
  ],

  topics: [
    {
      name: "Transaction lifecycle counts",
      why: "Every N26 risk screen opens with the lifecycle: transactions booked, settled, captured-but-settling, declined. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a captured transaction 'settled' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "number-of-rich-customers", "maximum-transaction-each-day", "find-third-transaction", "repeat-purchase-rate"],
    },
    {
      name: "Honest-denominator decline shares",
      why: "Decline rate is the KPI risk lives by, and it is a ratio whose denominator is the whole interview: 7 declines of 103 booked is 6.8%, and APAC's 8.1% against the US's 5.3% only means something if both share the base. Integer division and dropped statuses are how these reports quietly lie.",
      slugs: ["queries-quality-and-percentage", "ads-performance", "hopper-company-queries-ii", "customer-order-frequency", "structuring-detection"],
    },
    {
      name: "Statements, legs and LEFT JOINs",
      why: "Monthly statements carry the claim; settlement legs carry the truth, and the join type decides who survives: a leg without a statement is corruption, a statement without legs is the dunning queue. The 5 legless open statements plus paid-status #28 are exactly the rows a careless INNER JOIN erases.",
      slugs: ["combine-two-tables", "bank-account-summary-ii", "employees-with-missing-information", "bank-account-summary", "balance-rollforward"],
    },
    {
      name: "Anti-joins: the untouched queue",
      why: "The dunning list is an anti-join — statements whose invoice id never appears in payments — worth 15,217 across 6 cycles on this db. N26 candidates are graded on keeping the unmatched rows alive and on proving the zero when the anti-join legitimately comes back empty.",
      slugs: ["customers-who-never-order", "dormant-reactivation", "sellers-with-no-sales", "prepayment-detection"],
    },
    {
      name: "Cents-safe money folds",
      why: "Statements, legs, opex and the ledger are INTEGER cents; every euro read is amount_cents / 100.0, exactly once, at the display edge. Rail mix (card 16 legs / 37,364 against SEPA 11 / 32,248) is the canonical fold, and the missing .0 is how odd-cent legs lose their cents.",
      slugs: ["monthly-transactions-ii", "gl-reconciliation", "trial-balance-check", "journal-gap-detection", "odd-and-even-transactions", "basket-depth-aov"],
    },
    {
      name: "Coverage CASE: exact / partial / none",
      why: "The coverage census classifies every statement — 21 exact, 1 partial (4,000.00 of 6,148.00), 6 with nothing — and the classification must key on settled money, not on the status column that claims 'paid'. Exhaustive, ordered CASE arms are how the money desk ships it.",
      slugs: ["weather-type-in-each-country", "the-winner-university", "delinquency-buckets", "ar-aging-schedule"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets settled, settling, awaiting and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin; four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "count-salary-categories", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Settlement clocks & month spines",
      why: "The 14-month transaction spine (2024-01 to 2025-02) carries the trend reads, and the settlement clock — 2.98 days average over the 82 stamped, 28.4 days average on the 20 paid statements — is date math where the population is the point. Half-open windows and '%Y-%m' keys are the graded habits.",
      slugs: ["list-the-products-ordered-in-a-period", "rising-temperature", "users-with-two-purchases-within-seven-days", "consecutive-transactions-with-increasing-amounts", "wash-trade-detection", "settlement-fails-aging"],
    },
    {
      name: "Ranking & the tier ladder",
      why: "Spend leaderboards rank accounts where ties are guaranteed — four accounts sit at 4 transactions each under the 24, 17, 14, 13, 5 ladder — and the Standard → Smart → You → Metal tier ladder is a banding policy, not a sort. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung, which is a customer-facing decision.",
      slugs: ["rank-scores", "second-highest-salary", "credit-utilization-bands", "card-launch-success"],
    },
    {
      name: "KYC & name hygiene",
      why: "Accounts open through VideoIdent with names and emails typed by humans, and a split identity is a broken join: 'acme' versus 'Acme' silently halves one customer. String shaping — case, trim, length, pattern guards — is data-quality SQL the onboarding funnel runs daily.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "find-users-with-valid-e-mails"],
    },
  ],

  theory: [
    {
      id: "n26-t1",
      q: "Your statement report joins the statement table to its settlement legs. When do you INNER and when do you LEFT — and what silently breaks if you filter a leg column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A money-moved report joins legs to statements: a leg with no statement is corruption, so INNER is honest — and worth a data-quality flag rather than a silent join. A dunning report must be LEFT from statements: the statements with no legs ARE the answer — 6 cycles worth 15,217 on this db — arriving with NULL leg columns. The classic break: filtering a leg attribute like method = 'card' in WHERE after the LEFT JOIN kills every NULL-payload statement row — the LEFT quietly became an INNER and the untouched queue vanished. The fix is moving the predicate into ON or an outer query. And the db has a built-in trap for the careless: paid-status cycle #28 (1,756.00) has zero legs, so it survives in the untouched anti-join even though its status claims otherwise — status is a claim, legs are the ledger.",
      tag: "joins",
    },
    {
      id: "n26-t2",
      q: "Four accounts tie at 4 transactions on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. On this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4. RANK gives tied counts the same rank and skips: the tie consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next count is 7. ROW_NUMBER splits ties arbitrarily, which silently decides whose account-manager gets the retention call. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer accounts (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id, written into the query comment so the leaderboard is reproducible.",
      tag: "windows",
    },
    {
      id: "n26-t3",
      q: "The lifecycle census shows 103 transactions and 16 accounts; the EU shows 45 transactions and 8 accounts. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts transaction rows after the join — one row per card tap, so an account with 24 transactions contributes 24. COUNT(DISTINCT customer_id) folds repeats back to accounts — EU's 45 transactions collapse to 8 account holders. Neither is wrong: transactions measure card engagement and interchange load, accounts measure installed base. The ratio — 5.6 transactions per account in the EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for itemized lines and COUNT(*) silently counts lines, not transactions — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "n26-t4",
      q: "shipped_at stays NULL until a transaction settles. What is your policy for the time-to-settle report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only settled transactions have a settlement latency, so the report measures authorization-to-settlement for the 82 of 103 transactions that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL transactions returns the settled-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the settled subset; the gap between it and COUNT(*) is exactly the 14 awaiting plus 7 declined rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for authorizations that have not captured. A report whose WHERE clause is doing definitional work without saying so is exactly what an N26 reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "n26-t5",
      q: "The risk review wants decline share per market, but only for markets carrying at least ten transactions. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — the decline numerator is COUNT over status = 'cancelled' rows, filtered in WHERE or inside the aggregate — and it cannot live in HAVING because statuses no longer exist once rows are grouped. The ten-transaction floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a risk line and an error, and between a threshold applied to transactions versus to declines. On this db the floor keeps EU (45), APAC (37) and US (19) and drops LATAM's 2-transaction sample — which is exactly the small-cell honesty the risk committee wants stated, not hidden.",
      tag: "pipeline",
    },
    {
      id: "n26-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the big-ticket review silently returns nothing while looking valid. On the full book that is theoretical: 103 transactions always produce a mean of 338.19, and the tickets above that line are exactly the authorizations the fraud desk wants named. On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each transaction to ITS merchant's or market's average ticket) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "n26-t7",
      q: "The spend trend buckets card volume by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's card taps, and month-end is exactly when recurring bills hit. The statement calendar adds a second clock: issued_on to due_on runs a flat 30 days on every cycle here, but actual settlement on the 20 paid statements averages 28.4 days with a 13-to-84 spread — the tail is the dunning story. The LAG: on a month-ordered spine the first row's prior value is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month.",
      tag: "dates",
    },
    {
      id: "n26-t8",
      q: "The statement table says a cycle is 'paid' but the legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN legs, keep the unmatched side — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero legs: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void cycle WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: statements and legs carry INTEGER cents, so every euro read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent leg. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000.00 of 6,148.00) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "n26-t9",
      q: "Risk's morning board gets settled, settling, awaiting and declined in one pass. Compare COUNT(*) FILTER (WHERE …) with the SUM(CASE …) twin — and what identity must hold before either ships?",
      a: "Both are single-scan branches over the same rows. COUNT(*) FILTER (WHERE status = 'delivered') is the readable native form; SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) is the portable twin that runs on any engine. What they must never be is four separate queries — four scans can drift apart mid-run, and the census is defined by its identity: 52 + 30 + 14 + 7 = 103, the whole book, by construction. A branch that breaks that identity is the day's first incident, so the reconciliation line ships in the query comment beside the fold.",
      tag: "aggregation",
    },
    {
      id: "n26-t10",
      q: "The Standard → Smart → You → Metal ladder and the coverage bands are both CASE classifications. What makes a banding CASE trustworthy — and why must coverage key on settlement legs, not the status column?",
      a: "Three properties: exhaustive arms (an ELSE catches what the edges miss), ordered WHENs so later arms cannot silently shadow earlier ones, and published edges rather than magic numbers. Coverage classifies each statement — exact when settled cents equal billed cents, partial when money moved but not enough, none when no legs exist — and the arms must key on SUM(p.amount_cents) because the status column is a claim, not a ledger. This db proves it twice: cycle #28 claims paid with zero legs and #11 claims void with one. Key the arms on the money that moved and the anomalies classify themselves where the close can see them.",
      tag: "case",
    },
    {
      id: "n26-t11",
      q: "The disputes queue wants duplicate-charge candidates: same account, same total, close together. Walk me through the self-join and the predicate that keeps it honest.",
      a: "A self-join is the table joined to itself under two aliases — o1 and o2 — with the pairing predicate doing all the work: same customer_id, same total, timestamps within two days, and o1.id < o2.id. The strict inequality is the honesty clause: it breaks symmetry so each pair appears once in one orientation and rules out the self-pair (A,A) that <= would leak in. Without it the queue double-contacts every customer. The follow-up the panel wants: pair-counting is a different grain from transaction-counting — 103 taps can produce far more pairs — so the report says 'suspect pairs', never 'suspect transactions'.",
      tag: "joins",
    },
    {
      id: "n26-t12",
      q: "A transaction's itemized lines arrive from the terminal in order_items. What happens to every aggregate when you join them in — and how do you keep the money math correct at line grain?",
      a: "The join fans out: one transaction with three lines becomes three rows, so COUNT(*) counts lines (251 across the book) where it used to count transactions (103), and SUM(o.total) multiplies each transaction's total by its line count. The discipline is naming the grain and aggregating at it. Line-level money is SUM(oi.quantity * oi.unit_price) from the line's own columns, never the parent's total. Transaction-level money either aggregates lines to one row per order first or folds per order with COUNT(DISTINCT o.id) for the census and keeps the parent total out of the line-grain sum entirely.",
      tag: "joins",
    },
    {
      id: "n26-t13",
      q: "How does a correlated subquery differ from a plain scalar one, and where do N26's screens reach for it?",
      a: "A plain scalar subquery folds once and its single value judges every row — the platform-mean gate, 338.19. A correlated subquery references the outer row, so the inner fold re-runs per row with a different scope: each transaction judged against ITS market's own average ticket, LATAM against 426.22, the US against 383.48. That answers 'above whose baseline?' — the question the big-ticket and fraud reviews actually ask, and the shape the amount-anomaly screens use. The cost is one fold per outer row, fine at 103 rows and a design conversation at scale; the empty-inner case returns NULL and makes the comparison UNKNOWN, so the population definition ships with the query.",
      tag: "subqueries",
    },
    {
      id: "n26-t14",
      q: "The money desk stages folds before judging them. Walk me through the derived-table pattern — and what a CTE buys over it.",
      a: "Two stages with names. Inner stage: fold the raw grain — STRFTIME('%Y-%m', created_at) keys, COUNT(*) transactions, SUM(total) volume per month. Outer stage: judge the staged columns — gate on the computed average, rank, or diff against the prior month with LAG, all legal because the computed columns are real columns of the derived table. The same alias that errors in WHERE is a plain column one level up. A CTE buys identical semantics with named, reusable stages: WITH monthly AS (…) reads like the close packet's table of contents, can be referenced twice without recomputing, and keeps a four-stage build legible — which is why the money desk standardizes on it.",
      tag: "subqueries",
    },
    {
      id: "n26-t15",
      q: "How do PARTITION BY windows differ from GROUP BY folds, and where does the Spaces team need the partition form?",
      a: "GROUP BY collapses — one row per group, detail gone. PARTITION BY keeps every row and attaches an aggregate computed over the row's partition: each transaction still visible, now carrying its account's running spend (SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at)) or its rank inside the account's own history. The Spaces and engagement teams need exactly that — flag taps that cross an account's lifetime thresholds while keeping the rows, or rank each account's tickets against their own baseline. The classic failure is dropping the PARTITION BY: the frame silently spans the whole table and every row reports the 34,833.28 grand total, a report of nothing.",
      tag: "windows",
    },
    {
      id: "n26-t16",
      q: "The Metal upsell queue is built from spend quartiles, not fixed thresholds. How does NTILE do that, and what does the panel expect you to say about its edge behavior?",
      a: "NTILE(4) OVER (ORDER BY total) deals the 103 transactions into four near-equal buckets by ticket — the top tile is the upsell queue, no hand-picked edges to defend. Say out loud that tiles are positional: a quarter of the ROWS, not a quarter of the value — the tail concentrates money far beyond a quarter of spend, which is exactly the 63.5%-from-3,000-plus-accounts concentration this kit quotes. With ties at a boundary, NTILE assigns arbitrarily inside the tied block, so the queue needs a stated tie-breaker (created_at, then id) to be reproducible. And like every window, it lives in a derived table if a later WHERE must filter on the tile number.",
      tag: "windows",
    },
    {
      id: "n26-t17",
      q: "The settlement clock is julianday(shipped_at) - julianday(created_at), and statements run on their own calendar. What does SQLite give you, and where do the two clocks meet?",
      a: "julianday converts a TEXT timestamp to a real day number, so the difference is fractional days — the transaction clock averages 2.98 over the 82 stamped rows with a 2-to-4 spread. The statement calendar is a second clock: issued_on to due_on runs a flat 30 days on every cycle, but actual settlement on the 20 paid statements averages 28.4 with a 13-to-84 tail — the tail is the dunning story. STRFTIME('%Y-%m', created_at) builds the 14-month spine and half-open windows (>= start AND < next start) keep the last night in the right month; BETWEEN silently drops it, and month-end is exactly when recurring activity lands. Two clocks, one rule: the population definition ships with the number.",
      tag: "dates",
    },
    {
      id: "n26-t18",
      q: "Close packets stack and subtract populations. When do you reach for UNION, UNION ALL, INTERSECT and EXCEPT — and what does each one silently do?",
      a: "UNION ALL appends everything — the statement stack (three status branches plus the TOTAL row of 28) uses it because the branches are disjoint by construction, and the argument is written in the comment. UNION appends then dedups whole rows silently — safe only when duplicates are impossible. INTERSECT keeps rows present in both branches — accounts that transacted in both January and February. EXCEPT keeps left-not-right rows — which funded statements never settled clean — and it is order-sensitive: A EXCEPT B is not B EXCEPT A. All four compare column lists positionally, so the branches must project the same columns in the same order or the comparison is fiction.",
      tag: "sets",
    },
    {
      id: "n26-t19",
      q: "Accounts open through VideoIdent with human-typed names and emails. What is the hygiene pass before any join or GROUP BY, and why does N26 call it onboarding-critical?",
      a: "Deterministic shaping before comparison: TRIM the padding, UPPER (or LOWER) for case-insensitive grouping, REPLACE for known noise, and a pattern guard for malformed rows — the same family as fix-names-in-a-table and invalid-tweets. Unshaped, one account splits into three identities and every per-market count fragments; a JOIN on raw names silently drops the mismatched halves. N26 calls it onboarding-critical because identity is the join key for everything downstream — support history, Spaces totals, dispute claims — and a split identity at signup becomes a support ticket forever. The rule: shape once in a staging step everyone shares, never ad hoc inside each analyst's query.",
      tag: "strings",
    },
    {
      id: "n26-t20",
      q: "NULLIF and COALESCE both guard money math. Give the house rules for each — and the bug each one prevents.",
      a: "NULLIF(x, 0) is the divide-by-zero guard: it turns a fatal zero into NULL so the division returns NULL — a per-statement coverage ratio on cycle #28 (zero legs) reads NULL, meaning 'no settlement event', distinct from a genuine 0.00. COALESCE(a, b, …) is the display-edge fallback, and the fallback must be a real business statement, not a habit: IFNULL(latency, 0) invents same-day settlements for transactions that never captured — the exact bug the time-to-settle report forbids. The pair composes: NULLIF first to protect the arithmetic, COALESCE last to label the display. What never ships is a silent default in the middle of the pipeline, where nobody can see the substitution happen.",
      tag: "nulls",
    },
    {
      id: "n26-t21",
      q: "WHERE can't see SELECT aliases, but ORDER BY can. Why the asymmetry — and what is the N26-legal workaround?",
      a: "Pipeline order, not engine whim: FROM and WHERE run before SELECT computes its expressions, so an alias does not exist yet where WHERE evaluates; ORDER BY runs last, after the list exists, so it can use the alias. The same rule explains why aggregates are HAVING-only and why window functions are banned from WHERE entirely. The workaround is staging: wrap the fold in a derived table or CTE so the computed column becomes a real column of the next stage, then filter it with a plain WHERE — the two-grain market census, the month gate and the top-N-per-market ladder all ship in that shape. Repeating the full expression in WHERE also works but fails the review: the expression stays defined in exactly one place.",
      tag: "pipeline",
    },
    {
      id: "n26-t22",
      q: "An analyst reports '103 transactions, 251 terminal lines' in one row. What went wrong with the grain, and what is the recovery?",
      a: "They joined orders to order_items and folded without naming the grain: COUNT(*) counted the fan-out rows — 251 lines, not 103 transactions — and any SUM over a parent column multiplied each transaction by its line count. The recovery is choosing the grain first and saying it in the column name: transaction grain keeps the parent table alone (COUNT(*) = 103, SUM(total) = 34,833.28) or folds lines per order first; line grain uses the line's own columns (SUM(quantity), SUM(quantity * unit_price)). COUNT(DISTINCT o.id) rescues a fanned-out census, but the panel grades the upstream decision, not the patch: one row per WHAT, stated before the fold.",
      tag: "aggregation",
    },
    {
      id: "n26-t23",
      q: "What is the audit-first habit at N26 — what gets checked before any number leaves the analyst's laptop?",
      a: "Three checks, in order. Reconciliation: every lifecycle census sums to the whole — 52 + 30 + 14 + 7 = 103 — and every statement fold reconciles to the 28-cycle book. Anomaly walk: the standing row-level list gets read line by line, cycle #11 (void, yet carries a 925.00 leg) and cycle #28 (paid, zero legs) being the canonical pair — a status that lies about money that moved, and one about money that never did. Population statement: the title or comment says who is inside the number — the 2.98-day clock is over the 82 stamped rows, not the book. Only then does the number travel, because at a bank a number is a decision: the decline map tunes 3DS step-up rules the same morning it is built.",
      tag: "quality",
    },
    {
      id: "n26-t24",
      q: "The lifecycle census scans slowly at production scale. What does the panel expect you to know about indexes here — and about EXPLAIN QUERY PLAN?",
      a: "First, that low-cardinality columns are poor bare indexes: status has four values, so an index on it alone rarely beats a scan — the useful composite is (customer_id, created_at) or (status, created_at), serving both the per-account walks and the filtered census as a covering index that answers without touching the table. Second, verify with EXPLAIN QUERY PLAN rather than folklore: it prints SCAN versus SEARCH and whether the index is used, and the panel wants you to read it before claiming a speedup. Third, honest scoping: at 103 rows none of this matters — index design is a production-scale answer, and saying 'at this size, measure first' is itself the strong answer.",
      tag: "performance",
    },
  ],

  mcqs: [
    {
      id: "n26-mcq-1",
      prompt: "A card transaction row's status reads 'cancelled'. In this kit's N26 lifecycle map, what happened?",
      choices: ["Declined — the authorization was refused and counts in the decline rate", "Captured — settling, not yet settled", "Settled — the money is final", "Awaiting capture — queued in the batch"],
      answer: 0,
      why: "The lifecycle map is fixed: cancelled = declined (7 of 103 transactions, 6.8%). It is the only status where the money definitively never moves.",
      notes: [
        { choice: 1, why: "Captured-and-settling is 'shipped' — 30 transactions with the settlement stamp already stamped but not final. Calling them declined poisons the decline map in the opposite direction." },
        { choice: 3, why: "Awaiting capture is 'pending' — 14 rows with no settlement stamp yet. Pending is not declined and not settled; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-2",
      prompt: "Decline rate is declined ÷ which population? The book holds 52 settled, 30 settling, 14 awaiting and 7 declined of 103 booked.",
      choices: ["Settled + declined only (7/59)", "Settled transactions only (7/52)", "All transactions booked (7/103 = 6.8%)", "Distinct accounts (7/16)"],
      answer: 2,
      why: "The house definition: declined ÷ ALL transactions booked — awaiting and settling rows stay in the denominator because 'could still decline or settle' is exactly what the rate measures. 6.8% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 44 not-yet-final rows inflates the rate to 11.9% by deleting the population still in flight — the rows the risk map exists to watch." },
        { choice: 1, why: "7/52 mixes two populations into one rate — settled is an outcome, the denominator must be bookings. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-3",
      prompt: "The card top-up rail booked 16 legs totalling 3,736,400 cents. Which expression prints the euro figure, 37364?",
      choices: ["SUM(amount_cents) / 100", "ROUND(SUM(amount_cents) / 100.0, 2)", "SUM(amount_cents) * 100", "ROUND(SUM(amount_cents), 2)"],
      answer: 1,
      why: "Dividing by 100.0 promotes to real arithmetic before any rounding: 37364 euros. The .0 is the whole fix — integer cents divided by an integer can truncate, and the euro read happens exactly once, at the display edge.",
      notes: [
        { choice: 0, why: "Integer ÷ integer is integer division in SQLite. Whole-euro totals hide the leak; the first odd-cent leg loses its cents silently. Promote before you divide." },
        { choice: 2, why: "Multiplying turns cents into a ten-thousandfold figure — units inverted. Sanity-check the magnitude: euros are smaller than cents." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to declined transactions only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the decline map reads zero everywhere and the 3DS rules get 'fixed' against a fiction." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-5",
      prompt: "Keep only markets carrying at least 10 card transactions. Where does the threshold live, and which market drops?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY — LATAM (2) drops", "GROUP BY region HAVING COUNT(*) >= 10 — LATAM (2) drops", "WHERE transactions >= 10 on the raw table — EU (45) drops", "HAVING before GROUP BY — nothing drops"],
      answer: 1,
      why: "A transaction-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU 45, APAC 37 and US 19, and drops LATAM's 2-transaction sample.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'transactions' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-6",
      prompt: "The dunning list is built as statements LEFT JOIN legs … WHERE p.method = 'SEPA'. The 6 untouched statements vanish from the report. Diagnosis?",
      choices: [
        "The statements genuinely have SEPA legs — the zero is correct",
        "The leg-column predicate in WHERE kills every NULL-payload statement row — the LEFT JOIN silently became an INNER JOIN",
        "LEFT JOIN cannot be combined with a WHERE clause at all",
        "The 6 statements were deduplicated by the join's fan-out",
      ],
      answer: 1,
      why: "Filtering a right-table column in WHERE after a LEFT JOIN discards every unmatched row — exactly the untouched statements the queue exists to show. The fix is moving the predicate into ON, or filtering in an outer query.",
      notes: [
        { choice: 0, why: "Untouched statements have NO legs by definition — no method to filter on. If the report returns fewer than 6, the join type broke, not the data." },
        { choice: 3, why: "Fan-out duplicates rows, it never deletes them. The silent deletion here is the WHERE-after-LEFT pattern, and it is the most common join bug in dunning reports." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-7",
      prompt: "The spend ladder runs 24, 17, 14, 13, 5 transactions, then FOUR accounts tied at 4. Under RANK, what rank do the two 3-transaction accounts carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-transaction accounts share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The published leaderboard policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-8",
      prompt: "A staging-table decline list uses account_id NOT IN (SELECT customer_id FROM transactions WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: [
        "The two tables genuinely share no ids — the zero is correct",
        "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties",
        "NOT IN cannot take a subquery; it needs a literal list",
        "The outer query needs DISTINCT before the comparison works",
      ],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every transaction carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty risk reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-9",
      prompt: "In the coverage census (exact / partial / no payment), cycle #28 is marked 'paid' but has ZERO settlement legs. Which CASE arm must catch it, and how is the arm keyed?",
      choices: [
        "The 'exact' arm — keyed on status = 'paid'",
        "The 'no payment' arm — keyed on the leg side being NULL (p.id IS NULL), not on status",
        "The 'partial' arm — keyed on status = 'paid' AND legs < 2",
        "No arm catches it — such cycles must be excluded from the census",
      ],
      answer: 1,
      why: "Coverage is settled money versus claimed money, so the arms must key on what the legs table actually holds. #28 has no leg rows, so the LEFT JOIN leaves NULLs and the p.id IS NULL arm catches it — that is why the db's no-payment block totals 6 statements and 15,217 even though only 5 are status-open.",
      notes: [
        { choice: 0, why: "Keying 'exact' on status launders the lie: #28 reads exact with zero euros moved. Status is the claim; the legs are the ledger." },
        { choice: 3, why: "Excluding it is exactly how a 1,756.00 hole enters the close. The anomaly belongs IN the census, flagged by the arm that caught it." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-10",
      prompt: "An analyst writes SELECT i.status, SUM(i.amount_cents) FROM statements i JOIN legs p ON p.statement_id = i.id GROUP BY i.status to total billed money — and the paid total comes out too high. What happened?",
      choices: [
        "SUM ignores NULLs, so paid cycles with no legs were dropped",
        "The join fans out: five cycles settle in two legs (#1, #5, #12, #19, #22), so each of those statement amounts is counted twice",
        "INTEGER cents overflowed the SUM",
        "GROUP BY collapsed the two-leg cycles into one row, losing money",
      ],
      answer: 1,
      why: "Join-then-sum at the wrong grain: every two-leg cycle contributes its FULL billed amount once per leg row. Five split cycles on this db means five duplicated statement amounts — the billed total is inflated by a full extra copy of each. Bill the statement table alone, or aggregate legs to one row per statement first.",
      notes: [
        { choice: 0, why: "SUM skipping NULLs would UNDERcount, not overcount — and the join here is INNER, so legless cycles were already gone. The direction of the error is the diagnostic." },
        { choice: 2, why: "SQLite SUM promotes to a wide numeric type; cents do not overflow at this scale. A too-high total with row counts intact is grain, not overflow." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-11",
      prompt: "The settlement clock report runs WHERE shipped_at IS NOT NULL over the transaction book. Which statuses are inside that population?",
      choices: ["delivered and shipped — settled plus captured-and-settling", "delivered only — the stamp marks final settlement", "shipped only — the stamp IS the capture event", "delivered, shipped and pending — everything not yet declined"],
      answer: 0,
      why: "The stamp lives on shipped_at and both advancing stages carry it: delivered (52) and shipped (30) = 82 of 103. Pending (14) has not captured and cancelled (7) never will — both stay outside, and 82 + 14 + 7 reconciles to the book by construction.",
      notes: [
        { choice: 1, why: "Delivered alone is 52 — the clean-capture bucket. The 2.98-day average over the stamped population needs all 82 rows; dropping the 30 settles-late rows biases the clock downward." },
        { choice: 3, why: "Pending rows carry no stamp by definition — they have not captured. Including them is the same population error as averaging latency over the whole book." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-12",
      prompt: "A card-volume trend built with STRFTIME('%m', created_at) returns 12 buckets across a 14-month book. Diagnosis?",
      choices: ["Two months had zero transactions and vanished", "'%m' prints month-only — January 2024 and January 2025 merge, and every month-over-month delta becomes fiction", "The timestamps lost their timezone", "GROUP BY drops buckets with equal totals"],
      answer: 1,
      why: "The spine key is '%Y-%m': year plus zero-padded month, 14 buckets from 2024-01 to 2025-02. '%m' folds the two Januaries into one bucket — the count dropping from 14 to 12 is the tell, and the trend is unreadable until the key is fixed.",
      notes: [
        { choice: 0, why: "Every month on this db carries at least 6 transactions — nothing vanished. A bucket-count change from a key change is expected; from data loss it would be an incident with a different signature." },
        { choice: 3, why: "GROUP BY merges exactly what the key tells it to. The bug is upstream of the fold, in the key expression." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-13",
      prompt: "The rail-mix read splits inbound settlement legs by method. Which fold returns the two rails with their euro totals?",
      choices: ["SELECT method, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM payments GROUP BY method", "SELECT method FROM payments WHERE method IN ('card', 'wire')", "SELECT COUNT(DISTINCT method) FROM payments", "SELECT method, SUM(amount_cents) FROM payments HAVING COUNT(*) > 1"],
      answer: 0,
      why: "One fold, one key, the cents rule at the display edge: card prints 16 legs worth 37,364 and wire prints 11 legs worth 32,248. That two-row census IS the rail-mix metric the money desk quotes.",
      notes: [
        { choice: 1, why: "A WHERE filters rows; without GROUP BY and aggregates it prints one raw row per leg — 27 rows of method names, no totals at all." },
        { choice: 3, why: "HAVING judges groups, but there is no GROUP BY to judge — and both rails clear any count floor anyway. The gate would change nothing even if it ran." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-14",
      prompt: "The dormancy anti-join — accounts LEFT JOIN transactions, keep the unmatched side — returns zero rows. The right read?",
      choices: ["The join is broken — accounts always survive a LEFT JOIN", "Zero dormant accounts is a finding: all 16 accounts carry at least one transaction — state it, then prove it with a COUNT", "DISTINCT is missing before the NULL test", "Anti-joins cannot legitimately return zero"],
      answer: 1,
      why: "A confident zero is a result. On this db every one of the 16 accounts transacts, so the anti-join is genuinely empty — the strong answer names the population (16 accounts), the predicate (p.id IS NULL), and the reconciling proof rather than distrusting the query.",
      notes: [
        { choice: 0, why: "LEFT JOINs keep unmatched left rows — when there are none, zero is correct. Treating every zero as breakage is as careless as trusting every non-zero." },
        { choice: 2, why: "DISTINCT dedups rows and has nothing to do with the NULL test. Sprinkling it to 'fix' results is cargo-cult SQL." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-15",
      prompt: "On the 103-transaction book, what is the gap between COUNT(*) and COUNT(shipped_at) — and what does it represent?",
      choices: ["0 — both count rows", "21 — the 14 awaiting-capture plus 7 declined transactions that carry no settlement stamp", "51 — the still-settling plus declined", "16 — one per account"],
      answer: 1,
      why: "COUNT(shipped_at) counts non-NULL stamps: 82. The 21-row gap to COUNT(*) is exactly the not-yet-settled (14 pending) plus never-settling (7 declined) rows — a feature the census reads on purpose, not noise to clean up.",
      notes: [
        { choice: 2, why: "Settling (shipped) rows DO carry the stamp — 30 of them. The gap is only the rows that have neither settled nor will ever settle." },
        { choice: 3, why: "16 is the account grain — a different census entirely. COUNT over a column never dedups to distinct owners." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-16",
      prompt: "Keep only markets whose average ticket beats the platform's 338.19 — but avg_ticket is not projected in the SELECT list. Which clause can still judge it?",
      choices: ["WHERE AVG(total) > 338.19", "HAVING AVG(total) > 338.19 — aggregates are judgeable after GROUP BY whether or not they are projected", "ORDER BY AVG(total) > 338.19", "Impossible without adding the column to SELECT"],
      answer: 1,
      why: "HAVING evaluates after groups form, so it folds any aggregate over the group — projected or not. On this db the gate keeps LATAM (426.22) and the US (383.48) and drops APAC (313.66) and EU (335.32).",
      notes: [
        { choice: 0, why: "WHERE runs before GROUP BY — no groups, no AVG, and the engine rejects the query. Pipeline order is the lesson." },
        { choice: 3, why: "Projection is presentation; HAVING is judgment. Confusing the two bloats every gated report with a column nobody reads." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-17",
      prompt: "An account-by-account running spend walk uses SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at). What breaks if the PARTITION BY is dropped?",
      choices: ["Nothing — PARTITION BY is cosmetic when ORDER BY is present", "The query errors — windows require a partition", "Every row carries the same grand total (34,833.28) instead of its account's running spend — the partition is what scopes the frame", "The walk deduplicates repeat transactions"],
      answer: 2,
      why: "PARTITION BY scopes the window per account: each walk restarts at that account's first tap. Drop it and the frame spans the whole table — every row prints the 34,833.28 grand total, a report of nothing that still looks plausible row by row.",
      notes: [
        { choice: 0, why: "ORDER BY alone still orders the frame — over ALL rows. The missing partition is the dangerous failure mode precisely because nothing errors." },
        { choice: 1, why: "Windows default happily to a single grand partition. Requiring PARTITION BY would break every legitimate whole-book walk." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-18",
      prompt: "Risk's one-pass census uses COUNT(*) FILTER (WHERE status = 'cancelled'). A warehouse port lacks FILTER. What is the portable twin?",
      choices: ["SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END)", "COUNT(status = 'cancelled')", "AVG(CASE WHEN status = 'cancelled' THEN 1 END)", "MAX(CASE WHEN status = 'cancelled' THEN 1 END)"],
      answer: 0,
      why: "SUM over a 0/1 CASE flag is the portable one-pass pattern — same scan, same reconciliation to 103, runs on every engine. FILTER (WHERE …) is nicer syntax where it exists; the CASE twin is the fallback that always exists.",
      notes: [
        { choice: 1, why: "COUNT(expression) counts non-NULL results — a 0/1 comparison is never NULL, so this counts every row in the group. The census reads 103 in every branch." },
        { choice: 2, why: "AVG of a 1-when-CASE returns the share (0.068), not the count (7) — a subtly different metric wearing the same name, and the risk deck's totals stop reconciling." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-19",
      prompt: "A quarter-close pulls Q1 transactions with created_at BETWEEN '2024-01-01' AND '2024-03-31'. What is wrong with the window?",
      choices: ["Nothing — BETWEEN is inclusive on both ends by design", "Timestamps carry time components, so everything after midnight on 2024-03-31 sorts past the bound and the last day drops — the window must be half-open: >= '2024-01-01' AND < '2024-04-01'", "BETWEEN cannot compare TEXT timestamps", "Quarters must be filtered with a CASE expression"],
      answer: 1,
      why: "The stored values are full timestamps and string comparison puts anything after midnight on the 31st outside the bound — month-end is exactly when recurring card activity lands. Half-open intervals [start, next-start) are the house discipline: the upper bound is the first instant you want to exclude.",
      notes: [
        { choice: 0, why: "Inclusiveness is the bug: BETWEEN is inclusive of an upper bound that is really a day-start, silently truncating the quarter's tail." },
        { choice: 2, why: "ISO-8601 TEXT timestamps compare correctly lexicographically — the format is sortable by construction. The failure is the bound, not the comparison." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-20",
      prompt: "Flag transactions above THEIR market's average ticket: total > (SELECT AVG(t2.total) FROM orders t2 JOIN customers c2 ON c2.id = t2.customer_id WHERE c2.region = c.region). What does this query do?",
      choices: ["It fails — subqueries cannot join", "It runs: the inner fold re-runs per outer row scoped to that row's market — LATAM's 426.22 baseline judges LATAM's rows, not the platform's 338.19", "It silently compares everything to the platform average", "It returns one row per market instead of the flagged transactions"],
      answer: 1,
      why: "The correlated reference to c.region is the whole point: each outer row re-runs the inner fold with a different market scope. That answers 'above whose baseline?' — the question the big-ticket review actually asks — at the cost of one fold per row.",
      notes: [
        { choice: 0, why: "Joins inside subqueries are standard — correlation is the feature. Confusing scalar-subquery rules with correlation rules is the trap." },
        { choice: 3, why: "A WHERE filters rows; it does not project aggregates. The query returns the above-baseline transactions, one row per flag." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-21",
      prompt: "The growth deck gates months by computed average ticket: the filter avg_ticket > 338.19 sits OUTSIDE the derived month spine. Why can it not live inside?",
      choices: ["WHERE cannot reference SELECT-list aliases of the same query — the fold must materialize first, then the outer query filters the staged result", "It could — HAVING works fine there", "Derived tables cannot be filtered once built", "The 338.19 constant is only visible outside a subquery"],
      answer: 0,
      why: "A WHERE clause in the same SELECT evaluates before the SELECT list computes — the alias does not exist yet. Staging the fold in a derived table (or CTE) makes the computed column a real column the outer WHERE can judge; that two-stage shape is the standard N26 escalation.",
      notes: [
        { choice: 1, why: "HAVING could judge AVG(total) directly — but the alias itself has the same visibility problem there. Staging is the general answer." },
        { choice: 2, why: "Filtering derived tables is their main job. The restriction is about WHEN an alias exists, not WHERE the table sits." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-22",
      prompt: "The duplicate-charge check pairs same-account transactions of equal total within two days: orders o1 JOIN orders o2 ON o1.customer_id = o2.customer_id AND o1.id < o2.id. Why the o1.id < o2.id?",
      choices: ["It forces the optimizer onto an index", "It breaks symmetry: without it every match returns twice — (A,B) and (B,A) — and with <= on ids the self-pair (A,A) leaks in, double-counting the disputes queue", "It deduplicates the statuses before pairing", "It is cosmetic; DISTINCT removes the extras"],
      answer: 1,
      why: "A self-join pairs every row with every row, so each true pair appears in both orders and every row pairs with itself. The strict inequality keeps exactly one orientation of each pair and no self-pairs — each suspect read once. DISTINCT cannot fix a pairing that is wrong at the join.",
      notes: [
        { choice: 0, why: "Nothing about the predicate hints the optimizer; it is a correctness constraint. Perf answers to EXPLAIN, correctness to the predicate." },
        { choice: 3, why: "(A,B) and (B,A) differ in column order, so they are different rows and both survive DISTINCT. The duplicates here are structural, not accidental." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-23",
      prompt: "The close packet stacks three per-status statement branches plus a 'TOTAL' row of 28 with UNION ALL. Why UNION ALL rather than UNION?",
      choices: ["UNION ALL is just faster — the results are identical either way", "The branches are disjoint by construction, but UNION silently dedups byte-identical rows — if two branches ever tie, a real row vanishes without a whisper; UNION ALL plus a stated disjointness argument is the auditable choice", "UNION cannot stack more than two branches", "UNION ALL preserves row order, UNION does not"],
      answer: 1,
      why: "The three branches partition by status — open, paid, void — so no cross-branch duplicates can exist, and saying WHY is the correctness argument the reviewer wants written down. UNION returns the same rows today but turns 'disjoint by construction' into an assumption the engine silently enforces by deleting data.",
      notes: [
        { choice: 0, why: "'Identical today' is the trap — UNION's dedup is invisible until two branches collide, and then it deletes a true row. Speed is the footnote; dedup semantics are the story." },
        { choice: 3, why: "Neither form guarantees order — the stack carries its own ORDER BY. Sort stability is a different, also-unguaranteed claim." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-24",
      prompt: "The acquirer-management review wants the routing partner with the highest in-app quality score. Which single-table read returns it?",
      choices: ["SELECT name, rating FROM suppliers ORDER BY rating DESC LIMIT 1 — Alpine Audio GmbH at 4.8", "SELECT MAX(name) FROM suppliers", "SELECT name FROM suppliers WHERE rating = AVG(rating)", "SELECT name, COUNT(rating) FROM suppliers GROUP BY name"],
      answer: 0,
      why: "Top-of-ladder is a sort-then-take read over the six partner rows: Alpine Audio GmbH at 4.8, ahead of Nordic Gadgets at 4.6. One partner degrading degrades a third of the card experience — the 32% Nordic concentration is the companion read.",
      notes: [
        { choice: 1, why: "MAX over names returns the alphabetically-last string — a text fold answering a numeric question. MAX(rating) returns the value but not the partner." },
        { choice: 2, why: "An aggregate cannot appear in WHERE — the engine rejects it, and even hypothetically, rating = average finds the mid-table partner, not the top." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-25",
      prompt: "The growth deck wants the three biggest tickets per market. A teammate writes WHERE total <= (SELECT third-biggest...) and it collapses. What is the fix?",
      choices: ["It works — the subquery just needs LIMIT 1", "Per-group ranking cannot live in WHERE — rank inside a derived table with ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC), then filter rn <= 3 in the outer query", "LIMIT 3 applies per group — add it to the inner query", "Move the filter to HAVING"],
      answer: 1,
      why: "Top-N-per-group is a window shape: the rank only exists after grouping, and window functions are banned from WHERE outright. Stage the ranking in a derived table, then the outer WHERE filters a plain column — the same two-stage escalation as every other computed gate in this kit.",
      notes: [
        { choice: 0, why: "Third-biggest differs per market — one scalar subquery cannot know which market the outer row belongs to, and boundary ties break it regardless. The window form handles ties explicitly." },
        { choice: 2, why: "LIMIT applies to the whole result set, once — 3 rows total, not 3 per market. It cannot see the groups at all." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-26",
      prompt: "MAX(price) over the merchant catalog returns 199.99. What does that tell the pricing pod about a 'premium, 200 and up' product band?",
      choices: ["The band is real but empty in the catalog — 199.99 is the ceiling, so every product is Standard or below", "The band holds exactly one product at 199.99", "MAX skips NULLs, so the band cannot be judged", "The band is a rounding artifact of the cents rule"],
      answer: 0,
      why: "The ceiling is 199.99 — seven categories, nothing at or above 200 — so the premium band selects zero products. That empty band is itself a finding: premium positioning at N26 lives in ticket sizes (the 814.79 Metal-band average), not in catalog shelf prices.",
      notes: [
        { choice: 1, why: "199.99 < 200 — the ceiling product sits BELOW the band edge, not inside it. Off-by-one band edges are exactly how empty bands get misread as populated." },
        { choice: 2, why: "MAX ignoring NULLs is real but irrelevant here — every catalog row carries a price. The band is empty because of arithmetic, not missing data." },
      ],
      difficulty: "easy",
    },
    {
      id: "n26-mcq-27",
      prompt: "A coverage read divides 27 settlement legs across funded statements — but cycle #28 has zero legs. Which guard divides safely?",
      choices: ["legs / NULLIF(statements, 0) — NULLIF returns NULL on the zero, the division returns NULL, and the row reports NULL instead of erroring", "COALESCE(legs / statements, 0) — zero is the honest figure for a statement with no legs", "IFNULL inside aggregates is not allowed", "AVG(legs) / COUNT(*) — aggregates cannot divide"],
      answer: 0,
      why: "NULLIF(x, 0) turns the fatal zero into NULL so the division returns NULL — reading 'no settlement event', which is a different finding from a genuine 0.00. Cycle #28 is exactly the row the guard exists for: paid-status, zero legs, and a coverage figure that must NOT read as a clean zero.",
      notes: [
        { choice: 1, why: "Zero coverage and NO coverage are different findings — one is a small statement, the other is #28 lying about its own status. Coalescing to 0 erases the anomaly the close needs to see." },
        { choice: 3, why: "IFNULL/COALESCE are scalar functions and compose with aggregates fine. The objection is invented; the real issue is what the guarded value should BE." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-28",
      prompt: "The close gate: the ledger trial balance must read debits against credits with the delta printed. Which query IS the gate?",
      choices: ["SELECT SUM(debit_cents), SUM(credit_cents), SUM(debit_cents) - SUM(credit_cents) AS delta FROM ledger_entries — the close reads the delta, not a boolean", "SELECT SUM(debit_cents) = SUM(credit_cents) AS balanced FROM ledger_entries", "SELECT account, SUM(debit_cents) FROM ledger_entries GROUP BY account", "SELECT COUNT(debit_cents), COUNT(credit_cents) FROM ledger_entries"],
      answer: 0,
      why: "The gate is the three-fold: 181,080 debits, 181,080 credits, delta 0. A boolean says balanced-but-not-by-how-much when it breaks — useless at 23:45 on close night. The delta column turns every failure into a magnitude the incident opens against.",
      notes: [
        { choice: 1, why: "True/false with no magnitude is the close-night trap: the page says 'unbalanced', the on-call asks 'by how much', and nobody knows until someone runs the real query." },
        { choice: 2, why: "Per-account folds are the diagnostic AFTER the gate fails. The gate itself is one scan, both sums side by side." },
      ],
      difficulty: "hard",
    },
    {
      id: "n26-mcq-29",
      prompt: "VideoIdent signups arrive as 'acme', 'Acme' and 'ACME'. A market report groups by raw name and the account base looks fragmented. What is the hygiene pass?",
      choices: ["GROUP BY with DISTINCT — that merges case variants", "Shape before folding: TRIM the padding, UPPER (or LOWER) the case, then GROUP BY the shaped value — one identity, one row", "JOIN on the raw names to deduplicate", "Filter WHERE name = LOWER(name) to keep only clean rows"],
      answer: 1,
      why: "String shaping — TRIM, UPPER/LOWER, the same family as fix-names-in-a-table — must run before the fold, in a staging step everyone shares. Unshaped, one account splits into three rows and every per-market count fragments with it; a JOIN on raw names drops the mismatched halves instead.",
      notes: [
        { choice: 0, why: "DISTINCT dedups whole rows — 'acme' and 'Acme' are different strings, so they are different rows and both survive. The merge has to happen at the value level, before comparison." },
        { choice: 3, why: "Filtering to already-clean rows deletes the accounts instead of merging them — the fragmentation becomes attrition, which is worse. Shape, do not discard." },
      ],
      difficulty: "medium",
    },
    {
      id: "n26-mcq-30",
      prompt: "Three shapes find accounts with NO declined transactions: NOT IN (subquery), LEFT JOIN … WHERE p.id IS NULL, and NOT EXISTS. Which is the house pick, and why?",
      choices: ["NOT IN — it is the shortest to write and read", "NOT EXISTS — the correlated probe short-circuits on first match, and a NULL in the probed column cannot poison the whole result the way it can with NOT IN", "LEFT JOIN IS NULL — it is always the fastest", "They are identical in result and cost on every input"],
      answer: 1,
      why: "NOT IN empties the entire result the moment the subquery yields one NULL — three-valued logic, silently. NOT EXISTS asks 'is there even one declined row for this account?' and stops at the first hit; NULLs simply fail the probe row-by-row without poisoning anything. On the clean core db all three agree; on staging tables only NOT EXISTS is safe by construction.",
      notes: [
        { choice: 0, why: "Shortest is not safest — the same NOT IN NULL trap as the staging decline list, now on the happy side of the predicate. One NULL and the cohort reads empty." },
        { choice: 2, why: "The anti-join shape is correct and NULL-safe too — 'always fastest' is the wrong reason and usually false; planners turn NOT EXISTS into the same anti-join anyway. Pick shapes for semantics, then measure." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-ntwentysix-1",
      tier: "easy",
      topic: "j4",
      universe: "month-close",
      title: "The status-versus-settlement audit",
      brief:
        "N26-flavored brief on the storefront db: the money desk opens every close with the status-versus-settlement audit on the 28 monthly statement cycles — the status column claims (open 6 worth 19,609, paid 21 worth 66,443, void 1 worth 925), while settlement legs carry the truth (27 legs on two rails: 16 instant card top-ups worth 37,364, 11 SEPA transfers worth 32,248, all INTEGER cents). Coverage reads 21 exact (65,612), 1 partial (4,000.00 of a 6,148.00 statement), 6 never-settled worth 15,217 — and the standing anomalies are cycle #11, void with a 925.00 leg, and cycle #28, paid with zero legs. The audit settles money by the status the statement CLAIMS, biggest settled total first.",
      ask: "Return each statement status with its cycle count and the settled euro total to 2 decimals, biggest settled total first.",
      template:
        "SELECT i.status AS status,\n       COUNT({1} i.id) AS statements,\n       ROUND(SUM(p.amount_cents) / {2}, 2) AS settled_eur\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.status\nORDER BY settled_eur {4};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the cycle deduplicator",
          why: "COUNT(DISTINCT i.id) folds the 27 legs back to cycles: paid reads 21, not 25 join rows. Plain COUNT counts legs, and the five split cycles (1, 5, 12, 19, 22) each get counted twice — a census of legs wearing a census of statements' name.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-euro divider",
          why: "Statements and legs are INTEGER cents, so the euro read is amount_cents / 100.0 exactly once at the display edge. The bare integer 100 reads the same here only because every group total happens to be a whole-euro multiple — one odd-cent leg and the missing .0 starts eating cents; 1000 rescales the whole book to thousandths.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "The LEFT JOIN keeps all 28 statement cycles — including the 6 with no leg at all, the dunning queue worth 15,217. INNER silently deletes them: paid drops to 20 cycles (the legless #28 vanishes) and open collapses to just the partial #25, so the audit hides its own exceptions.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-settled-first direction",
          why: "The close reads biggest settled total on top: paid first, open (the 4,000.00 partial) next, void last. ASC would open the review on the single void cycle — a correct query aimed at the wrong end of the checklist.",
        },
      ],
      distractors: ["INNER", "COUNT", "SUM", "1000", "ASC"],
      walkthrough:
        "One join, one fold, three rows the close is built on. The LEFT JOIN attaches every settlement leg to its statement while keeping the 6 legless cycles alive, GROUP BY status folds them, COUNT(DISTINCT i.id) reads cycles (paid 21, open 6, void 1) and ROUND(SUM(p.amount_cents) / 100.0, 2) reads settled euros: paid 64,687.00, open 4,000.00, void 925.00. The cells tell the reconciliation story straight from the probed figures: the 65,612 exact-covered euros include cycle #11's 925.00 leg sitting on a VOID statement, so the paid-status book settles to 64,687.00 — and paid-status #28 (1,756.00) contributes zero because it has no legs at all; the open row's 4,000.00 is the partial settlement of the 6,148.00 statement #25. The distractors each break differently: INNER deletes the legless rows so paid reads 20 and open collapses to the single partial; COUNT in the dedup slot or SUM in the divider slot are syntax errors; 1000 divides in INTEGER math and rescales the book to 6,468 — thousandths, not euros; ASC opens the close on the void row. The audit's rule holds: money grouped by claimed status, legs as the ledger of record, LEFT JOIN so the untouched queue can never disappear.",
    },
    {
      id: "cs-ntwentysix-2",
      tier: "medium",
      topic: "x2",
      universe: "fraud",
      title: "The one-pass decline census",
      brief:
        "N26-flavored brief on the storefront db: risk's morning read is the decline census by market, built in ONE pass so no branch can drift. Probed facts: 103 card transactions booked — 52 settled (50.5%), 30 captured-and-settling (29.1%), 14 awaiting capture (13.6%), 7 declined (6.8%) — and the regional cut reads EU 45 transactions from 8 accounts (24 settled / 12 settling / 6 awaiting / 3 declined, 6.7%), APAC 37 from 5 (21 / 8 / 5 / 3, **8.1%**), US 19 from 2 (5 / 10 / 3 / 1, 5.3%), LATAM 2 from 1 (2 / 0 / 0 / 0, 0%). Settlement context: the 82 stamped transactions average 2.98 days, 2–4 spread. Risk reads biggest decline share first.",
      ask: "Return each market with account count, transaction count, all four lifecycle counts, and decline share to 1 decimal, biggest decline share first.",
      template:
        "SELECT c.region AS region,\n       COUNT({3} o.customer_id) AS accounts,\n       COUNT(*) AS transactions,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS settled,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS settling,\n       COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting_capture,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS declined,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), {4}) AS decline_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY decline_pct {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the settled literal",
          why: "Settled is status 'delivered' — 52 of 103, and EU's 24 / APAC's 21 are the cells the risk deck prints. 'shipped' would copy the captured-but-settling column into the settled one (EU reads 12, not 24) and the US book would suddenly look majority-settled when it is majority-still-settling.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the declined literal",
          why: "Declined is status 'cancelled' — 7 transactions, concentrated 3 in APAC and 3 in EU. 'pending' would read the 14 awaiting-capture rows as declines and the step-up rule engine would tighten exactly where onboarding is merely slow.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the account deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat transactions back to accounts: EU reads 8, not 45. The two-grain pairing — 45 transactions from 8 accounts versus 19 from 2 — is the intensity read, and without DISTINCT both columns collapse to transaction counts and the pairing dies.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the decline-share precision",
          why: "The decline map prints to 1 decimal — APAC 8.1, EU 6.7, US 5.3. ROUND(…, 2) prints 8.11 / 6.67 / 5.26 and stops reconciling with the published 6.8% platform rate quoted on the same slide; ROUND(…, 0) rounds 6.67 up to 7 and invents a fake half-point shift.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the worst-first direction",
          why: "Risk reads worst decline share on top: APAC 8.1, EU 6.7, US 5.3, LATAM 0. ASC would open the morning on LATAM's clean zero — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "'pending'", "SUM", "2", "ASC"],
      walkthrough:
        "One join, one scan, four FILTER branches that must reconcile to COUNT(*) by construction. The join attaches every transaction to its market; the four COUNT(*) FILTER branches read the lifecycle (52 / 30 / 14 / 7 reconciling upward to 103) and the decline share is 100.0 × declined ÷ transactions, rounded to 1 decimal. The cells match the probed census row for row: APAC 5 accounts / 37 transactions / 21-8-5-3 at 8.1%, EU 8 / 45 / 24-12-6-3 at 6.7%, US 2 / 19 / 5-10-3-1 at 5.3%, LATAM 1 / 2 / 2-0-0-0 at 0 — and the US row is the story the census exists to catch: 10 of its 19 transactions are still settling, a majority-captured book, not a healthy settled one. The distractors each break differently: 'shipped' in the settled slot copies the settling column (EU 12, LATAM 0) while 'pending' in the declined slot invents 14 phantom declines; SUM in the dedup slot or 2 in the precision slot either error or re-print the map at 8.11 / 6.67 / 5.26; ASC flips the board to worst-last. One pass, stated denominators, and the census cannot drift.",
    },
    {
      id: "cs-ntwentysix-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The engagement ladder",
      brief:
        "N26-flavored brief on the storefront db: growth's board deck ranks the 16 accounts by lifetime transaction count — the ladder that decides where referral incentives land and whose account manager makes the retention call. Probed facts: the ladder runs 24, 17, 14, 13, 5 transactions, then FOUR accounts tied at 4 (ids 9, 11, 14, 16), then two at 3; accounts 1, 5, 7, 13 lead it. Under RANK semantics the tie block shares rank 6, consumes positions 6 through 9, and the next distinct count (3) lands on rank 10 — five phantom positions the deck must be able to explain. The gate keeps accounts carrying at least 3 transactions, so the ladder reads eleven accounts, biggest lifetime spend 7,262.35 at the top.",
      ask: "Return each account passing the three-transaction gate with its transaction count, lifetime spend to 2 decimals, and a RANK by transaction count, biggest first.",
      template:
        "SELECT customer_id AS account_id,\n       COUNT(*) AS transactions,\n       {3}() OVER (ORDER BY COUNT(*) DESC) AS ladder_rank,\n       ROUND(SUM(total), 2) AS lifetime_spend\nFROM orders\nGROUP BY {1}\nHAVING COUNT(*) >= {2}\nORDER BY ladder_rank {4};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the account grain",
          why: "GROUP BY customer_id folds 103 transactions to 16 accounts before the window ranks them. GROUP BY status would rank lifecycle stages (52, 30, 14, 7) — a different census wearing the ladder's name; the grain is named once and everything downstream inherits it.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the engagement gate",
          why: "HAVING COUNT(*) >= 3 keeps eleven accounts — the 24-17-14-13-5 lead, the four-way tie at 4, and the two 3-transaction accounts whose rank 10 makes the RANK gap visible. A gate of 4 cuts the ladder to nine and hides the gap; a gate of 5 erases the tie block, the deck's whole point.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the tie semantics",
          why: "RANK shares rungs and skips: the four-way tie at 4 all read rank 6, and the two 3-transaction accounts land on rank 10 — the gap that proves the policy. DENSE_RANK reads 6, 6, 6, 6, then 7; ROW_NUMBER splits the tie arbitrarily — and at N26 the split decides whose account manager gets the retention call, so it must be a stated policy, not a function default.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The deck reads biggest engagement on top: 24 transactions at rank 1. ASC opens the board meeting on the single-transaction accounts the gate was built to exclude.",
        },
      ],
      distractors: ["region", "DENSE_RANK", "ROW_NUMBER", "4", "5", "ASC"],
      walkthrough:
        "Fold to the account grain, gate, then rank — and the rank function is a business decision. GROUP BY customer_id folds the 103-transaction book to 16 accounts; the gate keeps eleven of them; RANK() OVER (ORDER BY COUNT(*) DESC) hands out ranks 1 through 5 on the distinct counts, one shared rank 6 to the four-way tie, and rank 10 to the two 3-transaction accounts — the skip is the visible fingerprint of RANK semantics. Lifetime spend prints beside each account: 7,262.35, 6,640.56, 4,574.23, 3,644.56 at the top, down to 985.65 and 829.09 at rank 10. The walkthrough names the policy: shared rungs for peer accounts (RANK here), an explicitly named tie-breaker if the business ever needs to split them — written into the query comment, because the ladder feeds a real call queue. The distractors each break differently: grouping on a column the table does not carry fails outright; DENSE_RANK prints 7 where RANK prints 10 and the ladder misnumbers; ROW_NUMBER splits the tie 6-7-8-9 and silently picks retention-call winners; a gate of 4 hides the gap, a gate of 5 erases the tie block; ASC reads the ladder upside down.",
    },
    {
      id: "cs-ntwentysix-4",
      tier: "medium",
      topic: "s6",
      universe: "pricing",
      title: "The ticket bands",
      brief:
        "N26-flavored brief on the storefront db: the pricing pod bands all 103 card transactions by ticket size — the spend-histogram read that decides where interchange incentives and the Metal upsell actually bite. Probed facts: at the published edges (< 100 everyday, < 300 standard, < 700 premium, else metal) the book reads everyday 15 transactions worth 868.66 (57.91 average), standard 39 worth 7,424.77 (190.38), premium 39 worth 18,391.90 (471.59), metal 10 worth 8,147.95 (814.79) — ten transactions out-spend the everyday band nine to one, and the two middle bands tie at 39 taps while premium carries more than double the value. The pod reads biggest band value first.",
      ask: "Return each band with its transaction count, total value and average ticket, both money columns to 2 decimals, biggest value first.",
      template:
        "SELECT CASE\n         WHEN total < {1} THEN 'everyday'\n         WHEN total < 300 THEN 'standard'\n         WHEN total < 700 THEN 'premium'\n         ELSE 'metal'\n       END AS band,\n       COUNT(*) AS transactions,\n       ROUND(SUM(total), 2) AS value,\n       ROUND(AVG(total), 2) AS avg_ticket\nFROM orders\nGROUP BY {2}\nORDER BY value {3};",
      slots: [
        {
          answer: "100",
          kind: "number",
          noVerify: true,
          label: "the everyday edge",
          why: "The band edges are published constants: < 100 everyday, < 300 standard, < 700 premium, else metal. An edge of 200 swallows half the standard band — everyday reads 39 taps at a blended average nobody publishes; 50 shards it further.",
        },
        {
          answer: "band",
          kind: "keyword",
          label: "the band grain",
          why: "GROUP BY band folds the 103 taps into the four CASE arms — one row per band, the histogram's bars. GROUP BY on a column the table does not carry errors out; the CASE alias is the grain, named exactly where the arms are defined.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first direction",
          why: "The pod reads premium's 18,391.90 on top, then metal's 8,147.95, standard, everyday. ASC opens the meeting on the 868.66 everyday band and the value story inverts while every count stays true.",
        },
      ],
      distractors: ["200", "50", "status", "region", "ASC"],
      walkthrough:
        "CASE-classify every tap, then fold by the classification — the banding shape the tier ladder is built on. The CASE arms are ordered so each transaction falls into exactly one band: 15 everyday taps under 100 (868.66, averaging 57.91), 39 standard (7,424.77), 39 premium (18,391.90) and 10 metal (8,147.95 at an 814.79 average) — the four values reconcile to the 34,833.28 book, and the two 39-tap middle bands are the histogram's headline: identical frequency, double the value. The arms must stay exhaustive and ordered — reorder the WHENs and every ticket re-bands silently. The distractors each break differently: an everyday edge of 200 or 50 re-bands the histogram and blends averages nobody publishes; grouping on a column the orders table does not carry fails outright; ASC reads the value story bottom-up.",
    },
    {
      id: "cs-ntwentysix-5",
      tier: "hard",
      topic: "j3",
      universe: "supplier",
      title: "The acquiring-partner chain",
      brief:
        "N26-flavored brief on the storefront db: the acquirer-management review reads routed card volume per acquiring partner — the chain runs partners (six supplier rows with their in-app quality ratings) to catalog SKUs to terminal lines to settled transactions. Probed facts: Nordic Gadgets AB routes 38 transactions / 82 units / 11,130.25 — the 32% concentration the treasury dashboard quotes — from 4.6 stars; Midwest Hardware Co routes 45 / 109 / 9,294.93 at 4.4; Alpine Audio GmbH 34 / 77 / 4,765.63 at 4.8; Andes Naturals SA 25 / 51 / 3,613.25; Shenzhen Electro 41 / 99 / 3,049.07; Pacific Textiles 35 / 80 / 2,980.15. The review gates to partners routing at least 25 transactions and reads biggest routed value first.",
      ask: "Return each partner passing the 25-transaction gate with its routed transaction count, unit count and routed value to 2 decimals, biggest routed value first.",
      template:
        "SELECT s.name AS partner,\n       s.region,\n       COUNT(DISTINCT o.id) AS transactions,\n       SUM(oi.{1}) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS routed_value\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY s.id\nHAVING COUNT(DISTINCT o.id) >= {2}\nORDER BY routed_value {3};",
      slots: [
        {
          answer: "quantity",
          kind: "keyword",
          label: "the unit column",
          why: "Units are the terminal line's quantity — SUM(oi.quantity) folds 82 units for Nordic. SUM(oi.id) adds line id codes together (a census of nothing) and SUM(oi.product_id) adds catalog codes; both print numbers that reconcile against nothing.",
        },
        {
          answer: "25",
          kind: "number",
          label: "the routing gate",
          why: "HAVING COUNT(DISTINCT o.id) >= 25 keeps all six partners — Andes Naturals sits exactly on the line at 25. A gate of 30 drops Andes (25) and Pacific stays; a gate of 45 keeps only Midwest's 45-transaction book.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first direction",
          why: "The review reads biggest routed value on top: Nordic's 11,130.25, then Midwest, Alpine, Andes, Shenzhen, Pacific. ASC opens the meeting on Pacific's 2,980.15 and the concentration story — Nordic at 32% — never gets told.",
        },
      ],
      distractors: ["id", "region", "30", "45", "ASC"],
      walkthrough:
        "One chain, four tables, two grains kept honest at once. The joins walk partner → catalog SKU → terminal line → transaction, and the fold must answer both grains: COUNT(DISTINCT o.id) de-duplicates transactions (an order carrying two partner SKUs would otherwise count once per partner line — the distinct count is what keeps the per-partner census reconcilable), while SUM(oi.quantity) and SUM(oi.quantity * oi.unit_price) aggregate at LINE grain from the line's own columns. The gate keeps all six partners, Nordic's 38 / 82 / 11,130.25 on top — the 32% concentration that makes this review exist — and the ratings ride along as context: the top router is not the top-rated partner (Alpine, 4.8, routes barely a third of Nordic's value). The distractors each break differently: SUM over id adds code numbers together and prints census-of-nothing figures, and a region column does not exist anywhere on the chain's line tables; a gate of 30 drops Andes, a gate of 45 drops everyone but Midwest; ASC buries the concentration story at the bottom of the page.",
    },
    {
      id: "cs-ntwentysix-6",
      tier: "medium",
      topic: "x3",
      universe: "month-close",
      title: "The statement stack with the grand row",
      brief:
        "N26-flavored brief on the storefront db: the money desk's close opens with the one-page statement stack — every cycle status, then the grand row that must reconcile the whole book. Probed facts: 28 monthly statement cycles in INTEGER cents — paid 21 worth 66,443.00 billed, open 6 worth 19,609.00, void 1 worth 925.00; the grand row reads 28 statements and 86,977.00, and the three branches must sum back to it by construction (21 + 6 + 1 = 28, 66,443 + 19,609 + 925 = 86,977). The standing anomalies ride along: void #11 carries a 925.00 leg and paid #28 has none. The stack reads biggest billed total first with the grand row last.",
      ask: "Return each statement status with its cycle count and billed euro total to 2 decimals, plus a grand-total row, biggest billed total first with TOTAL last.",
      template:
        "SELECT *\nFROM (\n  SELECT status,\n         COUNT(*) AS statements,\n         ROUND(SUM(amount_cents) / {2}, 2) AS billed\n  FROM invoices\n  GROUP BY status\n  UNION ALL\n  SELECT {1}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)\n  FROM invoices\n)\nORDER BY status = 'TOTAL', billed {3};",
      slots: [
        {
          answer: "'TOTAL'",
          kind: "keyword",
          label: "the grand-row label",
          why: "The appended branch carries a literal 'TOTAL' so the grand row is a labelled row, not an anonymous fourth branch — the audit's own convention. Any other label reads as a fourth status and the reconciliation identity (21 + 6 + 1 = 28) loses its anchor row.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-euro divider",
          why: "Statements are INTEGER cents, so the euro read is amount_cents / 100.0 — the .0 promotes real division. It happens to read true here only because every group total is a whole-euro multiple; one odd-cent leg and the missing .0 starts eating cents.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The status rows read biggest billed first — paid 66,443.00, open 19,609.00, void 925.00 — and the boolean key status = 'TOTAL' holds the grand row last regardless. ASC drops the void row to the top of the page the close reads top-down.",
        },
      ],
      distractors: ["'ALL'", "10.0", "1000.0", "ASC", "customer_id"],
      walkthrough:
        "Two branches, one stack, one row that must absorb the other three. The first branch folds the 28 cycles by status — paid 21 at 66,443.00, open 6 at 19,609.00, void 1 at 925.00; the second branch re-folds the whole book with no GROUP BY and labels itself 'TOTAL': 28 statements, 86,977.00. UNION ALL is the auditable join — the branches are disjoint by construction (one group, one grand row) and the argument is stated, so nothing silently dedups. The outer wrap exists because a compound SELECT cannot carry a computed ORDER BY: it re-sorts the stack by status = 'TOTAL' (grand row last) then billed DESC — and the close reads the identity straight off the page: 21 + 6 + 1 = 28 and 66,443 + 19,609 + 925 = 86,977, with #11's 925.00 leg sitting under a void status and #28's 1,756.00 contributing nothing to the paid row. The distractors each break differently: 'ALL' unanchors the grand row so the identity has no label to reconcile against; / 10.0 and / 1000.0 rescale every total by an order of magnitude; ASC reads the stack bottom-up; and grouping the grand branch by customer_id would fan it to 28 rows plus itself — the stack grows and the identity dies.",
    },
  ],

  problems: [
    { slug: "the-latest-login-in-2020", why: "The last-activity clock per account — the freshest card tap in a window — is how dormancy monitoring starts, and this problem drills the max-timestamp-with-a-cutoff shape the engagement desk runs weekly." },
    { slug: "portfolio-concentration-hhi", why: "Concentration has a formal score: HHI over partner or account shares quantifies what the 32%-top-partner read implies. This problem is the same window-share arithmetic the treasury dashboard plots." },
    { slug: "account-balance", why: "A running balance per account — every top-up and card tap applied in order — is the Spaces ledger view customers scroll daily, and window running sums are exactly how it is built." },
    { slug: "number-of-accounts-that-did-not-stream", why: "Accounts with no inbound leg in a period are the funded-base gap the growth pod hunts; the NOT EXISTS shape here is the same one that finds statements with zero settlement legs." },
    { slug: "find-churn-risk-customers", why: "Churn-risk lists are anti-joins over recency and activity thresholds — the cohort winback pushes and the retention pod calls first. This problem is that list at practice scale." },
    { slug: "fx-exposure-report", why: "Foreign-currency transfers settle through the Wise integration at named rates; normalizing balances to a base currency with a latest-rate join is exactly this problem, and stale rates are the bug it teaches you to catch." },
    { slug: "duplicate-charge-pairs", why: "Duplicate authorizations at the same merchant inside a tight window are a top customer complaint — the self-join-over-time window scan is the detection query the disputes queue actually runs." },
    { slug: "transaction-velocity", why: "Velocity bursts — too many authorizations too fast — are the classic card-fraud tell. Time-bucket counting with burst flags is the same machinery the real-time risk rules use." },
    { slug: "amount-anomaly-zscore", why: "Big-ticket review starts by scoring each transaction against the population mean (338.19 here) and its spread; z-score filtering over a baseline is how the manual-review queue gets its shortlist." },
    { slug: "chargeback-rate-ranking", why: "Dispute rates per merchant or partner, ranked with a HAVING gate so tiny volumes cannot top the ladder — the exact leaderboard the acquirer-management review reads." },
    { slug: "the-category-of-each-member-in-the-store", why: "Classifying every row into exactly one tier — Bronze/Silver/Gold there, Standard/Smart/You/Metal here — with ordered CASE arms and a catch-all is the banding discipline the tier ladder is built on." },
    { slug: "spend-histogram", why: "Ticket-size histograms — how many taps land in each amount bucket — feed the pricing and interchange models; bucketing with CASE edges is the same shape at practice scale." },
    { slug: "daily-balance-interest", why: "Savings interest accrues on daily balances across Spaces sub-accounts — a date-spine walk with running balance math, exactly the accrual engine's core query." },
    { slug: "department-top-three-salaries", why: "Top-N per group with DENSE_RANK — the three biggest spenders per market, ties sharing a rung — is the podium query the regional reviews open with, and the tie policy is the test." },
    { slug: "find-all-unique-email-domains", why: "KYC hygiene starts at the email: extracting and counting unique domains from account signups spots disposable-domain fraud patterns and broken imports before any join happens." },
    { slug: "top-percentile-fraud", why: "Decline and fraud reviews work off the worst percentile, not the average — ranking transactions into fraud-percentile buckets per market is how the rules desk decides which N26 card BINs get stepped up." },
    { slug: "bank-account-summary", why: "A pot-style summary of money in and money out per account — the LEFT JOIN plus conditional-SUM shape the Spaces ledger view is built on." },
    { slug: "consecutive-transactions-with-increasing-amounts", why: "LEAD comparisons over ordered taps — escalating tickets read as savings momentum or as fraud depending on which desk asks, and the query is identical." },
    { slug: "maximum-transaction-each-day", why: "Per-day MAX over the card feed — the daily peak ticket risk tracks against account baselines before the morning standup." },
    { slug: "find-third-transaction", why: "Ordinal filtering per account — the third-tap read that separates newly-active accounts from one-tap wonders, ROW_NUMBER discipline included." },
    { slug: "odd-and-even-transactions", why: "Conditional aggregation on a computed flag — the reflex behind the coverage CASE and the rail-mix fold, drilled at practice scale." },
    { slug: "settlement-fails-aging", why: "Stuck settlement legs bucketed by age — the 2.98-day norm with a 2-to-4 spread makes any leg outside the spread an incident, and this problem is that aging query." },
    { slug: "prepayment-detection", why: "Settled-before-billed is the mirror anomaly: legs that land with no statement yet. EXISTS probes over date pairs are how the money desk catches them." },
    { slug: "ar-aging-schedule", why: "The 6 never-settled cycles worth 15,217 bucketed by age — ordered CASE bands over days outstanding, the dunning cadence's source query." },
    { slug: "customer-order-frequency", why: "Transaction frequency per account — the histogram growth uses to separate heavy tappers from one-off users, HAVING gates included." },
    { slug: "repeat-purchase-rate", why: "Share of accounts returning within a window — the retention metric that pairs with the 45-from-8 intensity read growth quotes on the same slide." },
    { slug: "basket-depth-aov", why: "Lines per transaction and value per tap — the terminal-line histogram that prices interchange, fan-out-safe SUMs included." },
    { slug: "structuring-detection", why: "Velocity just under reporting thresholds — burst flags over sliding windows, the same alarm the 3DS step-up rules run on the authorization feed." },
    { slug: "wash-trade-detection", why: "Self-joined pairs that cancel out — the o1.id < o2.id pairing discipline behind duplicate-charge checks, pointed at circular money instead of double charges." },
    { slug: "journal-gap-detection", why: "Sequence gaps in the double-entry core — the completeness check that runs before anyone trusts the 181,080 trial balance." },
    { slug: "balance-rollforward", why: "Opening balance, movements in, closing balance — the Spaces sub-account rollforward, where a NULL-safe join decides whether a quiet account still reports." },
    { slug: "card-launch-success", why: "Adoption of a new card product versus its cohort — the launch-window funnel growth reviews with the same two-grain census discipline as the market read." },
  ],
};
