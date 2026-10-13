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
// Pool provenance: company-pools.md carries NO N26 section — 0 tagged rows — so
// all 10 topic slug sets and all 16 problems are theme-curated from the pools
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
    "Preparation strategy: the pools file carries no N26 section — **0 tagged rows, none SQL-graded** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: transaction-lifecycle censuses, honest-denominator decline shares, cents-safe money folds, coverage CASE bands and KYC string hygiene. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {amber:status-versus-settlement audit} the money desk runs at every close, the other rebuilds the {rose:one-pass decline census} risk reviews each morning. The bar to clear: *state the definition and the denominator before you compute anything* — then make every lifecycle census reconcile to 103 by construction.",
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
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "number-of-rich-customers"],
    },
    {
      name: "Honest-denominator decline shares",
      why: "Decline rate is the KPI risk lives by, and it is a ratio whose denominator is the whole interview: 7 declines of 103 booked is 6.8%, and APAC's 8.1% against the US's 5.3% only means something if both share the base. Integer division and dropped statuses are how these reports quietly lie.",
      slugs: ["queries-quality-and-percentage", "ads-performance", "hopper-company-queries-ii"],
    },
    {
      name: "Statements, legs and LEFT JOINs",
      why: "Monthly statements carry the claim; settlement legs carry the truth, and the join type decides who survives: a leg without a statement is corruption, a statement without legs is the dunning queue. The 5 legless open statements plus paid-status #28 are exactly the rows a careless INNER JOIN erases.",
      slugs: ["combine-two-tables", "bank-account-summary-ii", "employees-with-missing-information"],
    },
    {
      name: "Anti-joins: the untouched queue",
      why: "The dunning list is an anti-join — statements whose invoice id never appears in payments — worth 15,217 across 6 cycles on this db. N26 candidates are graded on keeping the unmatched rows alive and on proving the zero when the anti-join legitimately comes back empty.",
      slugs: ["customers-who-never-order", "dormant-reactivation", "sellers-with-no-sales"],
    },
    {
      name: "Cents-safe money folds",
      why: "Statements, legs, opex and the ledger are INTEGER cents; every euro read is amount_cents / 100.0, exactly once, at the display edge. Rail mix (card 16 legs / 37,364 against SEPA 11 / 32,248) is the canonical fold, and the missing .0 is how odd-cent legs lose their cents.",
      slugs: ["monthly-transactions-ii", "gl-reconciliation", "trial-balance-check"],
    },
    {
      name: "Coverage CASE: exact / partial / none",
      why: "The coverage census classifies every statement — 21 exact, 1 partial (4,000.00 of 6,148.00), 6 with nothing — and the classification must key on settled money, not on the status column that claims 'paid'. Exhaustive, ordered CASE arms are how the money desk ships it.",
      slugs: ["weather-type-in-each-country", "the-winner-university", "delinquency-buckets"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets settled, settling, awaiting and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate and SUM(CASE …) is the portable twin; four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "count-salary-categories", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Settlement clocks & month spines",
      why: "The 14-month transaction spine (2024-01 to 2025-02) carries the trend reads, and the settlement clock — 2.98 days average over the 82 stamped, 28.4 days average on the 20 paid statements — is date math where the population is the point. Half-open windows and '%Y-%m' keys are the graded habits.",
      slugs: ["list-the-products-ordered-in-a-period", "rising-temperature", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Ranking & the tier ladder",
      why: "Spend leaderboards rank accounts where ties are guaranteed — four accounts sit at 4 transactions each under the 24, 17, 14, 13, 5 ladder — and the Standard → Smart → You → Metal tier ladder is a banding policy, not a sort. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung, which is a customer-facing decision.",
      slugs: ["rank-scores", "second-highest-salary", "credit-utilization-bands"],
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
  ],
};
