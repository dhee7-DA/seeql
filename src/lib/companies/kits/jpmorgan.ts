// JPMorgan Chase — kit 2 of the Banking & Capital Markets domain (Batch H).
// The consumer bank meets institutional scale: card rails and deposit books on
// one side, wires and treasury operations on the other. The storefront db maps
// on honestly: payments are the settlement rails (method card / wire — card is
// the consumer read, wire the institutional one), invoices are the booked
// confirmations they clear against, ledger_entries is the double-entry ledger,
// expenses are op-cost lines on the treasury calendar. Money in those tables
// is INTEGER cents — the dollar read is always amount_cents / 100.0.
// Pool provenance: JPMorgan has 2 tagged sql rows in the band
// (countries-you-can-safely-invest-in, structuring-detection); the rest of the
// pool and topic slugs are theme-curated from company-pools.md — provenance
// stated per problem below. Case figures: scripts/company-facts.md
// (probed 2026-10-12).

import type { CompanyKit } from "../types";

export const jpmorganKit: CompanyKit = {
  id: "jpmorgan",
  domainId: "banking",
  name: "JPMorgan Chase",
  tagline: "Consumer banking meets institutional scale",
  accent: "text-cyan-500",

  brief: [
    "JPMorgan Chase runs two businesses at once and the SQL reflects both: **Chase**, the consumer bank — branches, cards, deposits, the biggest consumer book in the country — and the institutional side, where treasury services, markets and payments move value that makes the consumer numbers look like rounding errors. The in-house data platform (**COIN**) and the blockchain rail (**Kinexys**) exist because at this scale the firm's edge is how fast a fact about money becomes a queryable fact. The interview culture follows the same split: you will be asked to fold a consumer book AND to defend an institutional control, *often in the same hour*.",
    "The data org sits close to the books of record. Every booked confirmation carries an amount the settlement rails must clear — card on the consumer read, wire on the institutional one — and every settled dollar posts twice into the double-entry ledger, debit and credit, stored as INTEGER cents with the dollar read always `cents / 100.0`. The rails reconcile to the confirmations before anything publishes: **27 settlement rows against 28 booked confirmations**, card carrying 16 of them for **37364.00** and wire 11 for **32248.00**. Op-cost lines run on a treasury calendar — 36 lines, Rent 16800.00 of a 25416.00 total, a monthly band from 1440.00 to 3210.00 — and the month's walk, this month beside last month, is the artifact treasury actually reviews.",
    "Interview style is threshold-minded and exceptions-first. Screens start with a fold — rail volumes and values, coverage classes, cost buckets by month — then escalate into a guard: a `HAVING` wall that flags counts crossing a review threshold (the {amber:structuring-detection} pattern), a CASE ladder with a boundary someone will argue about, an anti-join that defines {violet:dormancy}. The follow-ups are about denominators and edge rows: 'does that share include the partial?', 'which arm catches exactly 90 days?'. Candidates who state the filter's population and the bucket's boundary before writing SQL do well; *the interviewers have all shipped a report where a boundary was silent and it mattered*.",
    "Preparation strategy: JPMorgan has **two tagged problems** in this app's band — the country-investment ratio screen and the structuring-detection `HAVING` wall — and the rest of the pool is theme-curated to its known question families: rail folds, CASE buckets, dormancy anti-joins, month walks, LAG transitions and threshold screens (provenance stated per problem). Do the topics in order, then run both case studies on the live storefront database: one rebuilds the {sky:two-rail settlement census} the ops review opens with, the other rebuilds the {amber:op-cost calendar walk} treasury runs every month.",
  ],

  dayInLife: [
    "**08:30 —** the day opens on the rails dashboard. Overnight settlements post in two streams — **card**, the consumer read, and **wire**, the institutional one — and the first queries reconcile both against the booked confirmations they clear: 27 rail hits against 28 bookings, zero orphans, and the coverage exceptions (one partial cover at 4000.00 of 6148.00, six confirmations with no rail hit at all) classified before the ops standup. The morning read is a pair of numbers per rail — count and value, **16 and 37364.00** on card, **11 and 32248.00** on wire — because volume is load and value is exposure, and the ops floor manages them with different muscles.",
    "**11:30 —** midday is exceptions and threshold work. The {amber:structuring}-style screens run: fold the small-ticket counts, judge them against the review wall in `HAVING`, route the flags. The {violet:dormancy} anti-join refreshes — which books show no activity this cycle — and the CASE bucket ladders rebuild with their boundaries documented, because the account at exactly **90 days** is the one the review argues about.",
    "**14:30 —** then the treasury walk takes its hour. 36 op-cost lines folded onto the `'%Y-%m'` spine, `LAG` parking last month beside this one, the 2024-08 peak of **3210.00** explained in one sentence before anyone asks. Each query ships with its definition attached — the wall's threshold, the bucket's operator, the walk's window order — because *a number without its definition is a rumor at this firm too*.",
    "**17:00 —** the afternoon closes with stakeholders on both sides of the bank. The consumer teams want the card book's cost lines by category and month; the institutional side wants the wire coverage pack and the exception queue {amber:aged} against terms. There are rituals: a weekly ops review where every rail number carries its query, a cost review where the walk's deltas are pre-annotated, and a standing rule that the display layer never launders a NULL into a zero the business will act on. The rhythm to internalize: *fold, guard, walk, defend* — and know which clause each step lives in.",
  ],

  metrics: [
    { name: "Card spend", what: "The consumer rail's volume and value — 16 settlements for 37364.00 here. Count is load on the card network, value is consumer exposure; the review reads them as a pair." },
    { name: "Wire value", what: "The institutional rail's settled value — 11 settlements for 32248.00. Fewer, larger movements: the rail where a single row moves consumer-scale money." },
    { name: "Rail coverage", what: "Settlements that reconcile to booked confirmations — 27 of 27 rail hits attached, with the exception queue (1 partial at 4000.00 of 6148.00, 6 untouched at 15217.00) aged and owned." },
    { name: "Op-cost run rate", what: "Monthly operating cost against its band — 1440.00 to 3210.00 across the 14-month calendar, Rent carrying 16800.00 of the 25416.00 total. The number treasury defends line by line." },
    { name: "MoM cost delta", what: "This month's cost beside last month's, from a LAG walk over the '%Y-%m' spine. The 2024-08 step-up (+1416.00 against July) is the kind of move the walk exists to surface." },
    { name: "Threshold flags", what: "Counts that cross a review wall — the structuring-detection pattern: fold, then HAVING. Every flag ships with its threshold printed beside it." },
    { name: "Dormancy count", what: "Books with no activity this cycle — the anti-join population. Dormant is not closed: the count decides outreach, not write-offs, and the definition (zero rows, not zero dollars) is the metric." },
    { name: "Precision index", what: "Cents-vs-dollars integrity across consumer reports — integer cents in, /100.0 reads out, ROUND at the edge. The cross-foot that catches a 373.64 where the card book meant 37364.00." },
  ],

  topics: [
    {
      name: "Folds on the consumer book",
      why: "The consumer read starts with GROUP BY folds: activity per account, spend per month, counts per bucket. JPMorgan screens drill the two-grain habit early — volume (COUNT(*)) and value (SUM of cents, read in dollars) are different numbers about the same rows, and the interviewer listens for which one you are quoting.",
      slugs: ["number-of-rich-customers", "monthly-transactions-i", "unique-orders-and-customers-per-month"],
    },
    {
      name: "Rails and confirmations joins",
      why: "Every settlement must reconcile to a booked confirmation, so the join is a control before it is an enrichment. The two-table fold — rails folded beside the books they clear — is the opening query of the ops review, and its cardinality (many-to-one) is the reason the totals survive it.",
      slugs: ["bank-account-summary-ii", "employee-bonus", "combine-two-tables"],
    },
    {
      name: "CASE buckets: coverage and delinquency",
      why: "Bucket ladders are everywhere in consumer banking: coverage classes (exact / partial / none), aging buckets, spend tiers. The skill is boundary discipline — first matching arm wins, the ELSE arm is exhaustiveness, and the account sitting exactly on a boundary is the one the review argues about.",
      slugs: ["count-salary-categories", "delinquency-buckets", "loan-types"],
    },
    {
      name: "Dormancy anti-joins",
      why: "Dormancy is 'no activity rows', not 'zero activity' — an anti-join definition. LEFT JOIN plus IS NULL on the join key (and its NOT EXISTS twin) is the shape, and the classic WHERE-placement trap that silently converts it to an INNER is the bug this screen exists to catch.",
      slugs: ["customers-who-never-order", "dormant-reactivation", "number-of-accounts-that-did-not-stream"],
    },
    {
      name: "Statement-cycle date math",
      why: "Statement cycles run on calendar months and the '%Y-%m' key is the spine. Screens probe the edges: half-open intervals that keep the cycle's last day, SUBSTR versus STRFTIME on TEXT dates, and the weekday and window filters that decide what a 'cycle' even contains.",
      slugs: ["friday-purchases-i", "the-latest-login-in-2020", "users-that-actively-request-confirmation-messages"],
    },
    {
      name: "Running balances and walks",
      why: "Deposits and cost books are read as walks: running balance per account, cumulative spend per month. Window running sums with explicit frames — and the frame discipline that keeps same-timestamp rows from double-counting — is the daily muscle here.",
      slugs: ["account-balance", "restaurant-growth", "running-total-for-different-genders"],
    },
    {
      name: "LAG and LEAD state transitions",
      why: "Movement analysis is LAG/LEAD work: month-over-month deltas, transaction-to-transaction checks, status flips between cycles. The window's ORDER BY is the direction of time and the display's ORDER BY is not — screens love the gap between the two.",
      slugs: ["consecutive-transactions-with-increasing-amounts", "second-day-confirmation", "growth-accounting"],
    },
    {
      name: "Rates with honest denominators",
      why: "Acceptance rates, coverage shares, utilization — consumer banking is ratios, and ratios here are 100.0-before-division discipline. The denominator's population is decided before the ratio exists; integer division that prints 0 is the classic shipped bug.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "HAVING walls and threshold screens",
      why: "The structuring-detection pattern is the firm's signature screen: fold small-ticket counts per customer, then judge the fold against a review wall in HAVING. WHERE cannot see the count, ON fires pre-fold, and the wall's threshold is a printed constant someone signed off on.",
      slugs: ["structuring-detection", "customer-order-frequency", "managers-with-at-least-5-direct-reports"],
    },
    {
      name: "KYC-grade text hygiene",
      why: "Consumer data arrives messy — names in ALL CAPS, emails with free-text noise — and a join on a dirty key is a silent fan-out or a silent miss. Screens warm up with SUBSTR/UPPER/TRIM reshaping because 'know your customer' begins with 'match your customer'.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "find-all-unique-email-domains"],
    },
  ],

  theory: [
    {
      id: "jpm-t1",
      q: "Card and wire live in one payments table. Fold the rails for the ops review — and tell me what each rail's pair of numbers means.",
      a: "One GROUP BY, two rows, four numbers with two meanings each. SELECT method, COUNT(*), SUM(amount_cents)/100.0 folded per rail reads card 16 / 37364.00 and wire 11 / 32248.00. The COUNT is load — how many settlements the rail processed, the number that sizes ops queues — and the SUM is exposure — what value moved, the number the risk side defends. They are different metrics about the same rows and the review reads them as a pair; quoting one and calling it 'rail volume' is how value gets discussed in unit-less meetings. The fold also carries a built-in cross-check: 37364.00 + 32248.00 = 69612.00, which must equal the cash account's debit side in the ledger — if the rails and the books disagree, the fold's input population is wrong, not the ledger. And the units rule rides along: the column stores integer cents, the /100.0 happens inside the fold, and 373.64 — a row count divided by a hundred — is the signature of someone who divided the wrong aggregate.",
      tag: "aggregation",
    },
    {
      id: "jpm-t2",
      q: "Dormancy is 'accounts with no activity this cycle'. LEFT JOIN or INNER — and where does the activity filter go?",
      a: "LEFT, and the activity predicate goes in the ON clause — this is the question's whole point. The dormant population IS the unmatched population: accounts LEFT JOINed to activity that returns no rows carry NULL activity columns, and WHERE activity_id IS NULL names them. Put the activity filter in WHERE instead — WHERE activity_date >= cycle_start — and every NULL-payload row fails the comparison (NULL >= anything is UNKNOWN), the LEFT JOIN silently becomes an INNER, and the dormancy report ships with zero dormant accounts on the exact day the review needed them. The two honest shapes: keep the filter in ON (ON a.account_id = b.account_id AND b.date >= cycle_start) so the LEFT-ness survives, or wrap the filtered activity in a derived table and anti-join against that. The consumer-bank stakes are real: dormant is not closed — the count drives outreach and escheatment timelines — so a definition that quietly excludes its own population is a control failure. Say the survival rule out loud: who survives this join, and where does each filter live.",
      tag: "joins",
    },
    {
      id: "jpm-t3",
      q: "Treasury wants month-over-month deltas on the op-cost calendar. LAG or LEAD — and where does the window's order come from?",
      a: "LAG, over the calendar order — and the two ORDER BYs in the query are different objects. The window's ORDER BY defines the direction of time: LAG(SUM(amount_cents)) OVER (ORDER BY month_key) reaches one bucket back and parks last month beside this one, so the delta is current minus LAG and the first month carries NULL — the honest 'no prior'. LEAD points forward: it computes next month and labels it 'prior', flipping every delta's sign and sending the review chasing phantom swings. The trap that catches seniors: the display's ORDER BY is independent. ORDER BY month DESC prints the walk newest-first while the window still walks oldest-first — the numbers are right and the read is disorienting, which is why the window's ORDER BY is written out in full, never inherited, never abbreviated to position. On the '%Y-%m' spine the buckets sort as a calendar (year-first, zero-padded), the LAG pairs are the 14 months of the book, and the peak month's delta — 3210.00 against 1794.00 — is the sentence the walk exists to produce. Window order is time; display order is layout. Confusing them is not a style bug.",
      tag: "windows",
    },
    {
      id: "jpm-t4",
      q: "The structuring wall: flag customers whose small-ticket count crosses the review threshold. WHERE or HAVING — and why does the compiler care?",
      a: "HAVING, because the threshold judges a folded count — a group-level fact that does not exist until GROUP BY runs. The pipeline order is the explanation: FROM builds rows, WHERE filters rows pre-fold (WHERE COUNT(*) >= 5 fails to compile — aggregates have no meaning row-by-row), GROUP BY folds, HAVING judges the folded groups, SELECT projects, ORDER BY displays. The structuring screen is exactly this shape: filter the small tickets in WHERE (cheap, row-level — date window, channel), GROUP BY customer, then HAVING COUNT(*) >= wall so only the populations that crossed the threshold survive. The consumer-bank nuance worth saying: the wall's threshold is a printed, owned constant — it belongs in the query as a literal with a comment, not in someone's memory. And the anti-pattern to name: bolting the threshold into the join's ON clause, which fires pre-fold per row pair and filters the wrong population entirely. The interviewer is testing whether you know WHEN each fact becomes true in the engine — because that is when it can be judged.",
      tag: "pipeline",
    },
    {
      id: "jpm-t5",
      q: "First-deposit cohort: customers whose FIRST transaction landed in the promo window. What subquery shapes get you there, and what breaks each one?",
      a: "Three shapes, one trap. The IN shape: WHERE customer_id IN (SELECT customer_id FROM txns GROUP BY customer_id HAVING MIN(txn_date) >= promo_start) — fold first-transaction dates per customer, then membership-test them; readable and set-shaped. The EXISTS/NOT EXISTS shape: customers with a txn in the window AND NO txn before it — two membership tests instead of one fold; it survives NULLs better and scales differently. The correlated scalar: txn_date = (SELECT MIN(txn_date) FROM txns t2 WHERE t2.customer_id = t.customer_id) — 'this row IS their first txn' — re-runs per outer row and is the clearest to read and the most expensive to run. The shared trap: the scalar shape is contractually 0-or-1 rows, and an empty inner fold yields NULL — the comparison is UNKNOWN and the cohort silently empties on staging data where the customer has no txns yet. Tie-handling is the follow-up: two txns on the same first date are both 'first', so the IN and EXISTS shapes return the customer once while the correlated shape can return two rows — dedupe or accept it, but say it. Cohort definitions are denominators for the promo's entire ROI story; the shape that quietly changes the population changes the story.",
      tag: "subqueries",
    },
    {
      id: "jpm-t6",
      q: "Statement cycles run on calendar months. Build the month key, the cycle-over-cycle delta, and keep February whole while you do it.",
      a: "The key is STRFTIME('%Y-%m', txn_date) — year-first, zero-padded: '2025-02'. That string sorts as a calendar, which is what makes every walk and every GROUP BY on this spine trustworthy. The alternatives fail in instructive ways: '%m-%Y' prints '02-2025' and string order sorts '01-2025' before '02-2024' — the walk reads backwards across the year boundary; SUBSTR(txn_date, 6, 2) is a bare month and merges Februaries across years; and on TEXT timestamps the half-open interval is the boundary discipline — txn_date >= '2025-02-01' AND < '2025-03-01' keeps February's last day whole, while BETWEEN '2025-02-01' AND '2025-02-28' drops the evening of the 28th, which on a card book is the dinner rush. The delta is LAG over the same key, computed once, rounded once. And the population statement rides on top: this cycle's fold counts POSTED activity — pending authorizations are a different table and a different metric. Date conventions are definitions here; the month key is the smallest unit of trust in a consumer report.",
      tag: "dates",
    },
    {
      id: "jpm-t7",
      q: "Dormant accounts show NULL balances after the LEFT JOIN; the letter campaign wants 0.00. Where does COALESCE belong, and where must it never go?",
      a: "COALESCE is a display decision: wrap the SELECT expression at the report's edge — COALESCE(balance, 0.00) — so the letter prints a number while the pipeline above keeps NULL, the honest 'no activity this cycle'. What must never happen is coalescing mid-pipeline: WHERE COALESCE(cnt, 0) > 0 confuses 'no rows' with 'zero-valued rows' — two populations the bank keeps apart, because one is outreach and the other is a data-quality question — and a COALESCE'd count that flows into a ratio silently changes the denominator's population. The companion guard is NULLIF for division: balance / NULLIF(months, 0), so an empty-tenure row yields NULL (the honest gap) instead of a database-specific zero-or-error. The discipline the interviewer wants stated: NULL means unknown-or-absent and survives until the display edge; 0 means measured-zero and is a claim about the world. The letter campaign can print 0.00; the pipeline that computed it never lost the distinction. At this firm that sentence is the difference between a report and a rumor.",
      tag: "nulls",
    },
    {
      id: "jpm-t8",
      q: "Money is stored as integer cents here. Walk me through every place a precision bug can enter a consumer-bank report.",
      a: "Five doors, one policy. Integer division: amount_cents / 100 truncates — 92500 happens to survive, 486150 prints 4861 and the report is half a dollar light on every odd-cent row; the read is / 100.0, the .0 promoting real arithmetic at the first operation. Unit swaps: dividing a COUNT by 100 because the SUM nearby did — 373.64 where the card book meant 37364.00 — is the signature of copy-pasted arithmetic with the wrong aggregate. Ordering: ROUND only at the display edge; rounding per row then re-summing compounds the drift, and shares computed from rounded parts no longer sum to 100. Population: the fold's denominator decided before the ratio exists — partial covers (4000.00 of 6148.00) in or out of the coverage rate is a definition, printed beside the number. Cross-footing: the cheap test that catches all of it — card 37364.00 plus wire 32248.00 must equal the ledger's cash debit side of 69612.00, and the trial balance's 181080.00-equals-181080.00 proof must hold underneath. The policy: integer cents end to end, one conversion at the edge, one rounding at the edge, and a cross-foot on every report that money will move on. A candidate who enumerates the doors is describing the controls this firm actually runs.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "jpm-mcq-1",
      prompt: "The ops review needs each rail's volume and value. Which fold prints card 16 / 37364.00 and wire 11 / 32248.00?",
      choices: [
        "SELECT method, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM payments GROUP BY method",
        "SELECT method, SUM(*), ROUND(COUNT(amount_cents)/100.0, 2) FROM payments GROUP BY method",
        "SELECT method, COUNT(*) FROM payments WHERE method",
        "SELECT method, COUNT(*), SUM(amount_cents) FROM payments",
      ],
      answer: 0,
      why: "GROUP BY method folds the two rails; COUNT(*) reads volume (16, 11) and SUM(amount_cents)/100.0 reads value in dollars (37364.00, 32248.00). Count and value, one pass, one fold.",
      notes: [
        { choice: 1, why: "SUM(*) is not SQL, and COUNT(amount_cents)/100.0 divides a ROW COUNT by 100 — '16' would print as 0.16. The aggregates are swapped; the units follow them." },
        { choice: 2, why: "WHERE method compares a column to itself and no value is given — the statement is malformed. Filters need a predicate, not a column name." },
        { choice: 3, why: "No GROUP BY: the fold collapses all 27 rows into one rail-less row. The rails disappear exactly when the review needs them." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-2",
      prompt: "Settlements join confirmations many-to-one (each settlement sits on one booking). What does the join do to the card rail's 37364.00 total?",
      choices: [
        "Doubles it — joins always fan out",
        "Leaves it at 37364.00 — each settlement matches exactly one confirmation",
        "Halves it — the join deduplicates",
        "NULLs it — cross-table SUMs are illegal",
      ],
      answer: 1,
      why: "Fan-out needs many-to-many. Here each settlement row matches exactly one confirmation, so the fold's input is unchanged: card still sums 37364.00. The dangerous direction is the reverse join — confirmations to settlements fans split bookings to two rows each.",
      notes: [
        { choice: 0, why: "'Joins always fan out' is the instinct this question exists to break — cardinality and direction decide, not the JOIN keyword." },
        { choice: 2, why: "Joins never deduplicate. INNER merely drops non-matches; with referential integrity there are none to drop." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-3",
      prompt: "A coverage CASE reads: WHEN days_late >= 90 THEN '90+' WHEN days_late >= 31 THEN '31-89' ELSE 'current' END. An account sits at exactly 90 days. Where does it land — and what would re-bucket it?",
      choices: [
        "'31-89' — only a swapped arm order would move it",
        "'90+' — first matching arm wins; swapping >= to > on the first arm is what would move it",
        "NULL — boundary values belong to no arm",
        "'current' — CASE evaluates all arms and takes the last match",
      ],
      answer: 1,
      why: "CASE returns the FIRST true arm in written order: 90 satisfies days_late >= 90 and stops. The silent re-bucketing bug is the boundary operator — >= versus > on the first arm shifts exactly the boundary accounts (90, 60, 30) into the wrong bucket.",
      notes: [
        { choice: 0, why: "Arm order is top-down; the 31-89 arm never sees a 90. What moves boundary accounts is the operator, not the order." },
        { choice: 2, why: "CASE with a terminating ELSE has no NULLs — 90 matches the first arm and stops there." },
        { choice: 3, why: "CASE is first-match, not last-match. The ELSE arm exists precisely for everything the WHENs missed." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-4",
      prompt: "spent_on is TEXT like '2025-01-17'. Which expression builds the calendar spine key '2025-01'?",
      choices: [
        "STRFTIME('%Y-%m', spent_on)",
        "SUBSTR(spent_on, 6, 7)",
        "STRFTIME('%m-%Y', spent_on)",
        "MONTH(spent_on)",
      ],
      answer: 0,
      why: "'%Y-%m' prints year-first, zero-padded: '2025-01' — the key that sorts as a calendar and folds 36 lines into 14 buckets. This is the spine every month walk here rides.",
      notes: [
        { choice: 1, why: "SUBSTR(spent_on, 6, 7) grabs 7 characters from position 6 — '01-17' plus overflow. The month alone is SUBSTR(spent_on, 6, 2), and a bare month loses the year." },
        { choice: 2, why: "'%m-%Y' prints '01-2025' — and string order sorts '01-2025' before '02-2024'. The walk would read backwards across the year boundary." },
        { choice: 3, why: "There is no MONTH() in SQLite. STRFTIME, SUBSTR and friends are the toolkit — portability is part of the answer." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-5",
      prompt: "The treasury walk shows each month's spend beside the PRIOR month's. Which window does that?",
      choices: [
        "LAG(SUM(x)) OVER (ORDER BY month)",
        "LEAD(SUM(x)) OVER (ORDER BY month)",
        "LAG(SUM(x)) OVER ()",
        "SUM(x) OVER (ORDER BY month)",
      ],
      answer: 0,
      why: "LAG reaches one row back in the window's order — the prior month rides beside the current one. The window's ORDER BY is the calendar; the first month carries NULL, the honest 'no prior'.",
      notes: [
        { choice: 1, why: "LEAD points forward — next month mislabeled as prior. Every delta flips sign and the review chases phantom swings." },
        { choice: 2, why: "No ORDER BY means no defined order — the 'prior' row is engine-arbitrary and the walk is noise. LAG without direction is not a walk." },
        { choice: 3, why: "That is a running total, not a prior read: each row carries the cumulative sum so far. A walk and a cumulative are different deliverables." },
      ],
      difficulty: "easy",
    },
    {
      id: "jpm-mcq-6",
      prompt: "The structuring screen flags any customer whose small-ticket count crosses the review threshold. Where does COUNT(*) >= 5 live?",
      choices: [
        "HAVING COUNT(*) >= 5, after the fold",
        "WHERE COUNT(*) >= 5, before the fold",
        "In the ON clause of the join",
        "LIMIT 5 on the result",
      ],
      answer: 0,
      why: "The threshold judges a folded count — a group-level fact — so it lives in HAVING, which runs after GROUP BY. WHERE judges rows before the fold and cannot see COUNT; the engine throws a misuse-of-aggregate error.",
      notes: [
        { choice: 1, why: "WHERE filters rows before grouping; aggregates do not exist yet. This fails to compile — and the concept fails even where it compiles." },
        { choice: 2, why: "ON runs during the join, per row pair — pre-fold. Thresholds on folded counts have one home: HAVING." },
        { choice: 3, why: "LIMIT truncates output rows; it never judges groups. The screen would ship five arbitrary customers, not the five-time ones." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-7",
      prompt: "The clean-merchant screen runs `WHERE merchant_id NOT IN (SELECT id FROM watchlist)`. One watchlist row has id = NULL. What ships?",
      choices: [
        "The clean list, minus NULL merchants",
        "An empty result — silently",
        "Only rows whose merchant_id is NULL",
        "Every merchant — NULL fails the IN, so NOT IN passes",
      ],
      answer: 1,
      why: "x NOT IN (…, NULL) can never be TRUE — the comparison is UNKNOWN and NOT UNKNOWN stays UNKNOWN. One NULL id empties the screen while the query looks healthy. The consumer-bank-safe shape is NOT EXISTS or LEFT JOIN + IS NULL.",
      notes: [
        { choice: 0, why: "NOT IN does not skip NULLs; one NULL contaminates every row's test. The result is not smaller — it is gone." },
        { choice: 3, why: "Backwards: NULL fails IN, but NOT UNKNOWN is still UNKNOWN, so NOT IN fails too. Both directions collapse on the same NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "jpm-mcq-8",
      prompt: "The dormancy LEFT JOIN leaves inactive accounts with NULL activity counts; the letter campaign wants 0.00. Where does COALESCE go?",
      choices: [
        "At the display edge — wrap the final SELECT expression only",
        "Inside WHERE, to filter NULLs early",
        "Inside the ON clause, to pre-fill the join",
        "Coalesce the column in the table once, at load",
      ],
      answer: 0,
      why: "COALESCE is a display decision: wrap the SELECT expression so reports print 0.00, while the pipeline above keeps NULL — the honest 'no activity'. Coalescing mid-pipeline launders missing data into fake zeros that read as 'active at zero'.",
      notes: [
        { choice: 1, why: "WHERE COALESCE(x, 0) = 0 confuses 'no activity' with 'zero activity' — outreach versus data-quality, two populations the bank keeps apart. Filter on IS NULL if you mean missing." },
        { choice: 2, why: "ON joins on keys; COALESCE there fabricates join keys and attaches wrong matches. The join stays honest and unmatched." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-9",
      prompt: "Confirmations LEFT JOIN settlements returns 33 rows: 27 matched, 6 unmatched. What do COUNT(*) and COUNT(p.id) read?",
      choices: [
        "33 and 27",
        "27 and 33",
        "33 and 33",
        "6 and 27",
      ],
      answer: 0,
      why: "COUNT(*) counts rows — all 33, matched or not. COUNT(p.id) skips NULLs — the 6 unmatched rows carry NULL settlement ids — so it reads 27, the settled subset. The 6-row gap IS the receivables watchlist.",
      notes: [
        { choice: 1, why: "Inverted. The star is NULL-blind to nothing; the column is NULL-blind by design. Both orderings exist in the wild — only one reconciles to the books." },
        { choice: 2, why: "That would mean no unmatched rows exist — the anti-join said otherwise. COUNT(p.id) is NULL-blind, not NULL-proof." },
        { choice: 3, why: "6 is the unmatched subset — COUNT(*) FILTER (WHERE p.id IS NULL) or a SUM(CASE …) flag reads it, not the plain COUNT pair." },
      ],
      difficulty: "medium",
    },
    {
      id: "jpm-mcq-10",
      prompt: "Folding settlements back onto the confirmations they clear — which pair is the join key?",
      choices: [
        "payments.invoice_id = invoices.id",
        "payments.id = payments.invoice_id",
        "payments.method = invoices.status",
        "payments.paid_on = invoices.issued_on",
      ],
      answer: 0,
      why: "The settlement's invoice_id references the confirmation's primary key — that equality is the books' referential spine: 27 settlements, zero orphans. Every census on this pair inherits its honesty from this one predicate.",
      notes: [
        { choice: 1, why: "That compares a settlement's own id to its invoice reference — two different identifier spaces. It matches rows by accident of numbering, which is worse than not matching." },
        { choice: 2, why: "Method is a rail name ('card'/'wire'); status is a booking state ('paid'/'open'). Cross-domain keys match nothing and the census ships empty." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-jpm-1",
      tier: "easy",
      topic: "j1",
      universe: "month-close",
      title: "The two-rail settlement census",
      brief:
        "JPMorgan-flavored memo on the storefront db: the payments book moves on two rails — card, the consumer-bank read, and wire, the institutional one — and the weekly ops review opens with both folded side by side. Probed facts: 27 settlement rows in total; card carries 16 of them worth 37364.00 and wire carries 11 worth 32248.00 (37364.00 + 32248.00 = 69612.00, the cash ledger's debit side). Every settlement must sit on a booked confirmation — the join to the confirmations table is the control that proves no rail hit dangles before the census folds. Rail first, biggest settled value first.",
      ask: "Return each settlement rail with its settlement count and settled value in dollars (2 decimals), biggest value first.",
      template:
        "SELECT p.method,\n       {1}(*) AS settlements,\n       ROUND(SUM(p.amount_cents) / 100.0, 2) AS settled\nFROM payments p\nJOIN invoices i ON i.id = p.{2}\nGROUP BY p.method\nORDER BY settled {3};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the per-rail settlement counter",
          why: "COUNT(*) counts the settlement rows folded into each rail — 16 card, 11 wire. SUM would try to fold a star and error; the count is the volume read, the SUM below it is the value read.",
        },
        {
          answer: "invoice_id",
          kind: "keyword",
          label: "the rail-to-confirmation key",
          why: "p.invoice_id = i.id is the control join: every settlement must reconcile to a booked confirmation before it counts. p.method is TEXT against an integer id and matches nothing — the census would ship empty.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-rail-first direction",
          why: "Card's 37364.00 leads the read, wire's 32248.00 follows. ASC would open the ops review with the institutional rail — a correct fold with the emphasis inverted.",
        },
      ],
      distractors: ["SUM", "status", "AVG", "method"],
      walkthrough:
        "The consumer bank reads card, the institutional side reads wire — one fold, two rows, no drama. The join is the control: payments.invoice_id → invoices.id attaches all 27 settlement rows to booked confirmations with zero orphans, which is what licenses the census. GROUP BY p.method folds the rails: card 16 settlements / 37364.00, wire 11 / 32248.00 — and the pair cross-foots to 69612.00, the value the cash account's debit side carries in the ledger, so the census reconciles before it publishes. The cents rule holds: the column stores integer cents, so the /100.0 happens once, inside the fold, before the ROUND. Swap the join key to method and the TEXT-versus-integer comparison matches nothing — an empty census, shipped silently. COUNT(*) and SUM live at the same grain here: 16 and 37364.00 both describe the card rail — count and value, load and exposure — and the review reads them as a pair.",
    },
    {
      id: "cs-jpm-2",
      tier: "medium",
      topic: "t7",
      universe: "expense",
      title: "The op-cost calendar walk",
      brief:
        "JPMorgan-flavored memo on the storefront db: treasury runs the op-cost calendar on a month spine and reviews it as a walk — this month beside last month, deltas visible, no month skipped. Probed facts: 36 expense lines across 14 months, 2024-01 (1719.00) through 2025-02 (1650.00); the calendar peaks at 2024-08 with 3210.00 against July's 1794.00, and the month buckets ride the '%Y-%m' key. The walk is a window job: each month carries the PRIOR month's total beside it, computed over the calendar order — not the display order. All 14 months on the walk, oldest first.",
      ask: "Return the 14-month op-cost walk: '%Y-%m' month, spend and prior-month spend in dollars (2 decimals), calendar order.",
      template:
        "SELECT STRFTIME({1}, e.spent_on) AS month,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend,\n       ROUND({2}(SUM(e.amount_cents)) OVER (ORDER BY STRFTIME('%Y-%m', e.spent_on)) / 100.0, 2) AS prior_month\nFROM expenses e\nGROUP BY month\nORDER BY month {3}\nLIMIT {4};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month-bucket key",
          why: "'%Y-%m' prints '2024-08' — the year-first key that sorts as a calendar. '%Y' collapses the walk to two year rows; '%m' merges Januaries with Februaries across years.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the backward-looking window",
          why: "LAG hands each month the row before it in the window's order — the prior month's fold. LEAD would point forward and label NEXT month as 'prior'; the first row carries NULL, the honest 'no prior'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the calendar order",
          why: "Oldest first is how a walk reads: 2024-01 on top through 2025-02. DESC would print the calendar backwards — and the LAG column would still reference the true prior month, exposing the mismatch.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the full-calendar cut",
          why: "The spine has exactly 14 buckets, 2024-01 through 2025-02 — the walk ships complete or it hides a month. Any shorter LIMIT truncates the calendar mid-year.",
        },
      ],
      distractors: ["'%Y'", "LEAD", "DESC", "7"],
      walkthrough:
        "A walk is a fold plus a window, and the two orders are different things. The fold: STRFTIME('%Y-%m', spent_on) buckets 36 expense lines into 14 month keys, SUM(amount_cents)/100.0 prices each — 1719.00 to open, a 3210.00 peak at 2024-08, 1650.00 to close. The window: LAG(SUM(…)) OVER (ORDER BY the same '%Y-%m' key) reaches one bucket back IN CALENDAR ORDER and parks that total beside the current month — so 2024-09 carries 3210.00 as its prior, the clearest step-down on the walk, and August's own prior reads July's 1794.00, the +1416.00 move the review annotates. The first row's prior_month is NULL: no bucket exists before 2024-01, and NULL is the honest print. The LIMIT 14 is the audit that the spine is complete. Note the trap the display order sets: ORDER BY month DESC would reverse the rows while the window still walks forward — the numbers would not move, but the read would lie, which is why the window's ORDER BY is written out in full and never inherited from the display.",
    },
  ],

  problems: [
    { slug: "countries-you-can-safely-invest-in", why: "Tagged JPMorgan problem: the ratio screen with a deduped, gated population — eligible-before-percentage logic that mirrors the bank's coverage-share reads." },
    { slug: "structuring-detection", why: "Tagged JPMorgan problem: the HAVING wall over small-ticket counts — the structuring screen in textbook form, threshold judged after the fold." },
    { slug: "delinquency-buckets", why: "DPD-style CASE buckets — the aging ladder with a boundary someone will argue about; exactly-90-days discipline in graded form." },
    { slug: "bank-account-summary-ii", why: "Credit/debit folds per account — the double-entry read: money in, money out, net per book, cents read honestly." },
    { slug: "trial-balance-check", why: "The one-query proof that debits equal credits — the control under every consumer report this firm ships." },
    { slug: "dormant-reactivation", why: "Dormancy as a NOT-EXISTS read — 'no activity rows, not zero activity' — the anti-join definition behind the outreach list." },
    { slug: "count-salary-categories", why: "CASE tiers stacked with UNION ALL totals — the coverage census (exact / partial / none) where branch totals must reconcile to the whole." },
    { slug: "account-balance", why: "Running totals per account — the balance walk with explicit frames, the deposits-book daily read." },
    { slug: "running-total-for-different-genders", why: "Cumulative folds over population segments — the monthly spend walk shape treasury rides, one bucket at a time." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded share where unmatched rows count as zero — the honest-denominator drill with the NULL policy attached." },
    { slug: "monthly-transactions-ii", why: "Two-population month packets via UNION — settled versus unsettled by month, the stitched exception-report shape." },
    { slug: "daily-balance-interest", why: "Interest over a daily balance spine — the calendar-complete walk where a missing day silently under-accrues." },
    { slug: "fix-names-in-a-table", why: "KYC-grade name normalization — ALL-CAPS feeds fold to proper case before any per-customer match can work." },
    { slug: "customers-who-never-order", why: "The anti-join watchlist in textbook form — books with no rail hit are this query with the table names swapped." },
    { slug: "suspicious-bank-account-transactions", why: "Sliding-window screening over transaction streams — the surveillance read that pairs with the structuring wall." },
    { slug: "transaction-velocity", why: "Burst detection over timestamps — velocity counts in time buckets, the consumer-fraud twin of the HAVING threshold screen." },
  ],
};
