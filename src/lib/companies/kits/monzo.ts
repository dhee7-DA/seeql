// Monzo — Wave-8 (Task 96), fintech domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Coral-card neobanking SQL: the storefront db read as a money-movement sandbox —
// customers are account holders (region = market), orders are card authorizations
// (delivered = settled clean, shipped = settled with the settlement stamp, pending =
// pre-auth in flight, cancelled = declined by fraud/risk controls), order_items are
// the itemized basket lines behind each authorization (quantity = units, unit_price =
// shelf price), products are the merchant catalog SKUs, suppliers are the six
// savings-marketplace partner providers (rating = in-app stars, listings = products
// offered), invoices are bill-pot obligations, payments are the funding legs against
// them (INTEGER cents — the dollar read is amount_cents / 100.0), expenses are ops
// spend and ledger_entries are the double-entry core. Pool provenance:
// company-pools.md carries NO Monzo section — 0 tagged LC rows (dormant-reactivation
// is the lone Monzo-named slug, used in the problem pool) — so all 10 topic slug
// sets and the rest of the 16 problems are theme-curated from the theme menu and
// say so. Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const monzoKit: CompanyKit = {
  id: "monzo",
  domainId: "fintech",
  name: "Monzo",
  tagline: "Coral-card neobanking, pot by pot",
  accent: "text-rose-300",

  brief: [
    "**Monzo** is the coral-card neobank that turned the current account into software: savings live in pots, the salary sorter splits payday into bills and spending the moment money lands, and bill pots hold exactly enough for each upcoming bill. Around that core sit paid tiers (Plus, Perks, Max), a savings marketplace of partner providers, overdrafts, and a fraud stack that freezes the card in one tap. This kit maps the storefront db onto that world: 16 customers rows are account holders, 103 orders are **card authorizations** worth 34,833.28, and 251 order_items rows are the itemized basket lines behind them. The status map is fixed: delivered = {emerald:settled} (52, 50.5%), shipped = settled-with-stamp (30, 29.1%), pending = pre-auth in flight (14), cancelled = {rose:declined} (7, 6.8%).",
    "The data org reads one money spine at three grains. An authorization books at created_at and stamps shipped_at the day it settles against the balance — **82 of 103** carry the stamp, averaging **2.98 days** to settle with a 2–4 day spread, and the 14 pending rows have none yet (*a population definition, not a cleanup job*). Money sits one layer down: bill-pot obligations in invoices, funding legs in payments, both INTEGER cents — the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of spend sits with holders whose lifetime spend crosses 3,000 (71.2% above 2,000), which is why the Plus/Perks/Max upsell queue is a SQL artifact before it is a marketing one.",
    "Interview screens are census-then-denominator, and the interviewer asks the denominator out loud. A typical loop opens with a **two-grain market census** — EU runs 45 authorizations from 8 holders (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a decline share where the base is the whole test (*'does a pre-auth count in your denominator?'*), then into the engagement ladder where four holders sit tied at 4 authorizations and rank semantics become a product decision. Late rounds walk the {sky:14-month spend spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the base before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Monzo section — 0 tagged LC rows — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: authorization funnels, decline maps, pot-coverage classification, tie-heavy ladders and the cents-safe bill book. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {rose:decline map} the fraud pod opens Monday with, the other rebuilds the {emerald:split-settlement ladder} the month-close pod reads at every close. The bar to clear: *state the denominator and the definition before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:45 —** The day starts with the settlement feed. The analyst opens the money dashboard before standup: did the overnight funding legs post, does the one-pass status census reconcile — 52 settled + 30 stamped + 14 pre-auth + 7 declined = **103 by construction**? A branch that breaks that identity is *the day's first incident*, not a rounding note. If settlement latency drifts off the **2.98-day** norm, the {sky:pre-auth backlog} gets pulled before the risk standup, because a growing in-flight queue is either a rail problem or a fraud-hold problem and the SQL has to say which.",
    "**11:30 —** Midday tilts toward risk and product. The fraud pod wants the decline map re-cut — {rose:8.1% of APAC authorizations declined} against 5.3 in the US — with velocity windows beside it; the pots squad wants the concentration re-read, {amber:63.5% of spend} from 3,000-plus holders; the marketplace pod wants per-provider reads joined through to the bill book. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes every query twice — *once to answer, once with the denominator spelled out so the number survives the risk-review argument*.",
    "**15:30 —** The afternoon belongs to the close. The AR anti-join refreshes first — **6 never-funded bills worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-funded bill (#11, 925.00) and a paid-status bill with zero funding legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Settlement latency", what: "Authorization to settle (created_at → shipped_at) over the 82 of 103 authorizations that carry the stamp: 2.98-day average, 2–4 spread. The population definition ships with the number — pre-auth rows have no cycle yet and must not dilute it." },
    { name: "Decline rate", what: "Cancelled share of booked authorizations: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The fraud stack's first read every Monday, and a conditional count whose denominator is the whole interview." },
    { name: "Card spend (GTV)", what: "Total authorized value: 34,833.28 across 103 authorizations, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — the tail is where Plus, Perks and Max live." },
    { name: "Pre-auth backlog", what: "Authorizations with no settlement stamp yet: 14 of 103 (13.6%). 'Not yet' is a population definition, never a silent zero — the 13.6% queue is either a rail delay or a fraud hold, and the census must say which." },
    { name: "Holder concentration", what: "Share of spend from holders whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The number that staffs the premium pod and sizes the paid-tier upsell queue." },
    { name: "Bill-pot coverage", what: "Funded versus billed: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-funded worth 15,217. The AR anti-join the bill-pot pod refreshes at every close." },
    { name: "Split-settlement share", what: "Bills funded by more than one pot-sweep leg: 5 of 28, each with exactly 2 legs. The multi-sweep pattern the salary-sorter plumbing review confirms at every close." },
    { name: "Ledger integrity", what: "Trial balance: 181,080 debits against 181,080 credits, delta zero. A branch here is a page, not a shrug — the close does not ship until the identity holds." },
  ],

  topics: [
    {
      name: "Authorization funnels & honest denominators",
      why: "Every Monzo screen opens with the money funnel: authorizations booked, settled with a stamp, declined by the fraud stack. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a pre-auth 'settled' — 14 versus 82 on this db.",
      slugs: ["trial-to-paid-funnel", "immediate-food-delivery-ii", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain market censuses",
      why: "Authorizations and cardholders are different grains of the same join, and every census here reports both: EU runs 45 authorizations from 8 holders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining holders to authorizations",
      why: "Holders carry market and join date; authorizations inherit them through joins, and the join type decides who survives. An authorization without a holder is corruption; a holder without authorizations is dormancy — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "employees-with-missing-information", "students-and-examinations"],
    },
    {
      name: "Tie-heavy engagement ladders",
      why: "Ladders are rank-window reporting where ties are guaranteed — four holders sit at 4 authorizations each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about who gets the paid-tier call first.",
      slugs: ["rank-scores", "top-earners", "the-most-recent-three-orders"],
    },
    {
      name: "Tier banding with CASE",
      why: "Paid tiers are CASE-classified — Plus, Perks, Max — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the tier P&L, and a reordered WHEN quietly re-bands the base.",
      slugs: ["the-winner-university", "the-category-of-each-member-in-the-store", "weather-type-in-each-country"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month spend spine (2024-01 to 2025-02) is the money review's home turf: prior month beside current, delta rounded, the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "average-time-of-process-per-machine", "second-day-confirmation"],
    },
    {
      name: "Coverage set algebra",
      why: "Close packets stack populations — settled under declined, this month beside last — and EXCEPT answers 'which funded bills never settled clean'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "league-statistics"],
    },
    {
      name: "Nested folds & average gates",
      why: "Screens escalate into staging: fold ticket sizes, then judge them against the computed platform mean (338.19 here). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "market-analysis-i"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets settled, stamped, pre-auth and declined in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "find-stores-with-inventory-imbalance", "calculate-orders-within-each-interval"],
    },
    {
      name: "Billing & cents discipline",
      why: "Billed is not funded — the finance tables (28 bills, 27 legs, INTEGER cents) are where the account world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/never-funded coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "monzo-t1",
      q: "Your account report joins holders to card authorizations. When do you INNER and when do you LEFT — and what silently breaks if you filter a settlement column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A spend report joins authorizations to holders: an authorization with no holder row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from holders: the holders with no authorizations ARE the answer, arriving with NULL authorization columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload holder row — the LEFT quietly became an INNER and the dormant cohort vanished. The fix is moving the predicate into ON or an outer query. On this db the holder anti-join returns a confident zero — all 16 holders authorize somewhere — and proving that zero rather than assuming it is exactly the instinct a Monzo reviewer is grading.",
      tag: "joins",
    },
    {
      id: "monzo-t2",
      q: "Four holders tie at 4 authorizations on the engagement ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which silently decides whose pot gets the paid-tier upsell call first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer holders (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment, because at Monzo the ladder feeds a real call queue.",
      tag: "windows",
    },
    {
      id: "monzo-t3",
      q: "The census shows 103 authorizations and 16 holders; EU shows 45 authorizations and 8 holders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts authorization rows after the join — one row per authorization, so a holder with 24 authorizations contributes 24. COUNT(DISTINCT customer_id) folds those rows back to holders — EU's 45 authorizations collapse to 8 logos. Neither is wrong: authorizations measure load and engagement, holders measure installed base and coverage. The ratio — 5.6 authorizations per holder in EU versus 9.5 in the US on this db — is the intensity signal that decides whether the coral card is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for basket lines and COUNT(*) silently counts basket lines, not authorizations — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "monzo-t4",
      q: "shipped_at is NULL until an authorization settles. What is your policy for the settlement-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only settled authorizations have a latency, so the report measures booking-to-settlement for the 82 of 103 authorizations that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL authorizations returns the settled-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the settled subset; the gap between it and COUNT(*) is exactly the 14 pre-auth plus 7 declined rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day settlements for authorizations that have not even completed. A report whose WHERE clause is doing definitional work without saying so is exactly what a Monzo reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "monzo-t5",
      q: "The risk review wants decline share per market for markets carrying at least ten authorizations. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards settled and pre-auth rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-authorization floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; on this db it keeps EU (45), APAC (37) and the US (19) and drops LATAM's 2 — a stated scope, not a silent one. Putting the floor in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a risk line and an error, and between a threshold applied to authorizations versus to value. The strong answer places every filter by asking: is this a fact about one authorization, or about a market?",
      tag: "pipeline",
    },
    {
      id: "monzo-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 authorizations always produce a mean (338.19 platform-wide on this db). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average gate is how it hides. The correlated cousin (compare each authorization to ITS holder's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "monzo-t7",
      q: "The spend trend buckets authorizations by month on TEXT timestamps. How do you build the spine, cut a month without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The month window: half-open intervals — created_at >= '2024-07-01' AND created_at < '2024-08-01' — because BETWEEN '2024-07-01' AND '2024-07-31' silently drops the last night's authorizations, and payday is exactly when they land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is money discipline: the spine, the window and the edge row are where spend trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "monzo-t8",
      q: "Finance says a bill is 'paid' but the funding-legs table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: bills LEFT JOIN legs, keep p.id IS NULL — on this db that returns 6 never-funded bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why funding legs are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: bills and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-funded, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "monzo-mcq-1",
      prompt: "An authorization row's status reads 'cancelled'. In this kit's Monzo stage map, what happened?",
      choices: ["The fraud/risk rules declined it — refused at authorization", "It settled but the ledger has not posted it yet", "It is a pre-auth check awaiting capture", "The cardholder reversed it after settlement"],
      answer: 0,
      why: "The stage map is fixed: cancelled = declined (7 of 103 authorizations, 6.8%) — the fraud stack or risk rules refused the authorization, so nothing settles.",
      notes: [
        { choice: 1, why: "That stage does not exist here — the db's pending is pre-auth IN FLIGHT (14 rows), not post-settlement lag. Inventing stages is how reconciliations drift." },
        { choice: 2, why: "Pre-auth is 'pending' — 14 rows carrying no stamp. Pre-auth is not declined; it stays in the denominator as 'not yet'." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-2",
      prompt: "Settlement share is stamped authorizations ÷ which population? The db holds 82 stamped, 14 pre-auth and 7 declined of 103 booked.",
      choices: ["Stamped + declined only (82/89 = 92.1%)", "All authorizations booked (82/103 = 79.6%)", "Delivered captures only (52/82)", "Distinct cardholders (82/16)"],
      answer: 1,
      why: "The house definition: settled ÷ ALL authorizations booked — the 14 pre-auth rows stay in the denominator because 'not yet settled' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pre-auth inflates the rate to 92.1% by deleting the population still in flight — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two stages into one rate — delivered is the clean-capture bucket, the stamp marks settlement. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-3",
      prompt: "EU carries 45 authorizations from 8 cardholders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts authorization rows (45); COUNT(DISTINCT customer_id) folds repeats back to holders (8). The gap between them — 5.6 authorizations per holder — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every authorization carries a holder. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not holders — a third grain nobody asked for. The census is authorizations AND cardholders." },
      ],
      difficulty: "easy",
    },
    {
      id: "monzo-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to declined authorizations only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the decline share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the decline map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-5",
      prompt: "Keep only markets carrying at least 10 authorizations. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE authorizations >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "An authorization-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US (19) clear a 10-authorization bar; LATAM's 2 do not.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'authorizations' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-6",
      prompt: "The engagement ladder runs 24, 17, 14, 13, 5 authorizations, then FOUR holders tied at 4. Under RANK, what rank do the two 3-authorization holders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-authorization holders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The ladder's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pre-auth authorizations double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the settled-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 authorizations.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "monzo-mcq-8",
      prompt: "A staging-table fraud list uses holder_id NOT IN (SELECT customer_id FROM authorizations WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every authorization carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty fraud reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-9",
      prompt: "A close packet puts settled authorizations under declined authorizations in one layout, built with UNION. A reviewer says one holder's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same holder, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same holder, same counts, no market or branch label — collapse into one, and the packet loses a holder with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "monzo-mcq-10",
      prompt: "A dashboard walks pot balance leg by leg: SUM(amount) OVER (ORDER BY posted_at). Two legs share a posted_at second, and the cumulative 'jumps two legs at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict leg-by-leg walk", "Rounding accumulated on the tied legs and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so legs tied on posted_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly leg by leg. On a day spine ties are rare; at funding-leg grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-monzo-1",
      tier: "easy",
      topic: "j7",
      universe: "fraud",
      title: "The decline map",
      brief:
        "Monzo-flavored brief on the storefront db: Monday's risk review opens with the decline map — card authorizations, distinct cardholders and the share the fraud stack refused, per market. Probed facts: 103 authorizations worth 34,833.28; 7 declined platform-wide (6.8%), and the market split reads EU 45 authorizations from 8 cardholders at a 335.32 average ticket with 6.7% declined, APAC 37 from 5 at 313.66 with 8.1%, US 19 from 2 at 383.48 with 5.3%, LATAM 2 from 1 at 426.22 with none. The review reads the biggest authorization book first.",
      ask: "Return each market with its authorization count, distinct cardholder count, average ticket to 2 decimals and decline share to 1 decimal, biggest book first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) AS authorizations,\n       COUNT({1} o.customer_id) AS cardholders,\n       ROUND(AVG(o.total), {2}) AS avg_ticket,\n       ROUND(100.0 * SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) / COUNT(*), {4}) AS decline_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY authorizations {5};",
      slots: [
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the cardholder deduplicator",
          why: "COUNT(DISTINCT o.customer_id) folds repeat authorizations back to holders: EU reads 8, not 45. SUM(DISTINCT …) adds the id codes together and MAX(DISTINCT …) reports the largest id — neither is a census.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the ticket precision",
          why: "Average tickets report to 2 decimals — EU's 335.32. ROUND(…, 1) prints 335.3 and the market map stops reconciling with the 338.19 platform average the review quotes on the same slide.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the declined literal",
          why: "Declined authorizations are status 'cancelled' — 7 on the db, 3 of them APAC. 'delivered' would count the 52 settled captures into the decline column and the fraud map reads an invented 53.3% crisis exactly where the card worked.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Decline shares report to 1 decimal — APAC 8.1, EU 6.7, US 5.3. ROUND(…, 0) collapses the ladder to 8 / 7 / 5 and the APAC-versus-US gap the risk pod acts on disappears.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The review reads the biggest authorization book on top: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's 2 rows — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "MAX", "'delivered'", "0", "ASC"],
      walkthrough:
        "One join, one fold, four columns. The join attaches every authorization to its holder's market and GROUP BY folds them into four rows where COUNT(*) reads the book (EU 45, APAC 37, US 19, LATAM 2), COUNT(DISTINCT o.customer_id) reads holder coverage (8 / 5 / 2 / 1), ROUND(AVG(o.total), 2) reads the average ticket (335.32 / 313.66 / 383.48 / 426.22) and the CASE share reads declines (6.7 / 8.1 / 5.3 / 0) — all straight from the probed census, and the decline column reconciles upward to 7 of 103 platform-wide. The distractors fail honestly: SUM in the holder slot adds customer ids together and MAX reports the largest id — a census of nothing; 0 as either precision truncates the ticket to whole units and the share ladder to 7 / 8 / 5; 'delivered' counts the 52 settled captures as declines and invents a 53.3% crisis in EU; ASC opens the review on LATAM's 2 rows. The two-grain pairing is the read: EU's 45-from-8 (5.6 authorizations per holder) is breadth, the US's 19-from-2 (9.5) is concentration — one query, two different growth stories for the coral card.",
    },
    {
      id: "cs-monzo-2",
      tier: "medium",
      topic: "t5",
      universe: "month-close",
      title: "The split-settlement ladder",
      brief:
        "Monzo-flavored brief on the storefront db: the bill-pot pod's month-close wants the split-settlement ladder — bills funded by MORE THAN ONE pot-sweep leg, biggest first — to confirm the multi-sweep plumbing is doing its job. Probed facts: the book holds 28 bills against 27 funding legs, money in INTEGER cents; exactly 5 bills settled in 2 legs — ids 1, 5, 12, 19, 22 — at 4,860.00 / 5,284.00 / 4,723.00 / 5,614.00 / 4,459.00; the traps are known: bill #28 claims paid with ZERO legs (1,756.00) and bill #11 claims void yet carries one leg (925.00). The ladder reads biggest amount first.",
      ask: "Return each split-settled bill with its status, dollar amount to 2 decimals, funding-leg count and a RANK ordered by amount, biggest first.",
      template:
        "SELECT i.id AS bill_id,\n       i.status AS status,\n       ROUND(i.amount_cents / {1}.0, 2) AS amount,\n       COUNT(p.id) AS settlement_legs,\n       RANK() OVER (ORDER BY i.amount_cents {2}) AS split_rank\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE i.status = {3}\nGROUP BY i.id\nHAVING COUNT(p.id) > {4}\nORDER BY split_rank;",
      slots: [
        {
          answer: "100",
          kind: "keyword",
          label: "the cents-to-dollars divisor",
          why: "Bills carry INTEGER cents, so the dollar read is amount_cents / 100.0 — bill #19 prints 5,614.00. / 10.0 would print 56,140.00 and / 1000.0 would print 561.40; neither reconciles against anything on the ledger.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-bill-first direction",
          why: "The close reads the ladder biggest amount first: 5,614.00 down to 4,459.00. ASC hands the review the smallest bill on rank 1 and the review order inverts while every other cell stays true.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the paid-book scope",
          why: "The ladder reads the paid book — but status is a claim, legs are the truth: bill #28 says paid with zero legs and #11 says void with one. 'open' empties the ladder to zero rows; the legs gate, not the status, defines a split settlement.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the split gate",
          why: "HAVING COUNT(p.id) > 1 keeps exactly the bills funded by more than one pot-sweep leg — the five split settlements (1, 5, 12, 19, 22), each with 2 legs. > 2 empties the ladder; > 0 floods it with every paid bill carrying any leg at all.",
        },
      ],
      distractors: ["10", "1000", "'open'", "ASC", "2"],
      walkthrough:
        "Two stages in one pass: scope the paid book, then rank it. The LEFT JOIN attaches every funding leg to its bill, GROUP BY folds legs per bill, and the legs gate keeps only bills funded by more than one pot sweep — exactly the five split settlements the probe knows, ids 1, 5, 12, 19, 22, each with 2 legs — while RANK() OVER (ORDER BY amount_cents DESC) hands the close a biggest-first ladder: 5,614.00, 5,284.00, 4,860.00, 4,723.00, 4,459.00. The cents rule does the money: amount_cents / 100.0, because the raw book is INTEGER cents — the missing .0 is how a bill prints a hundredth of its value. The status scope is belt-and-braces, and the walkthrough says why: #28 claims paid with zero legs and #11 claims void with one — status is a claim, legs are the ledger, so the split definition lives in the legs gate. The distractors each break differently: / 10.0 and / 1000.0 reprice every bill by ten times or a tenth; 'open' empties the ladder to zero rows; ASC hands rank 1 to the 4,459.00 bill; and > 2 dissolves the split cohort entirely — the multi-sweep pattern this close exists to confirm would be reported as nonexistent.",
    },
  ],

  problems: [
    { slug: "customer-placing-the-largest-number-of-orders", why: "The heavy-user census: which account holders authorize the most. The concentration read (63.5% of spend from 3,000-plus holders) starts exactly here — one fold, one ORDER BY, one honest tie policy." },
    { slug: "queries-quality-and-percentage", why: "Decline shares and ticket quality are ratios with denominators — this problem drills the weighted-percentage shape the fraud pod ships weekly, integer-division traps included." },
    { slug: "dormant-reactivation", why: "Dormancy is Monzo's silent churn: a holder whose last authorization slides away drifts off the card. This problem IS the reactivation-risk read — an existence test over the activity spine." },
    { slug: "find-churn-risk-customers", why: "Savings-marketplace partners and pots go stale quietly. Anti-join risk lists are how the lifecycle pod picks its winback batch before the overdraft becomes a loss." },
    { slug: "duplicate-charge-pairs", why: "Self-join over the authorization feed to catch the same merchant charging twice — the duplicate-charge check every Monzo support escalation starts with." },
    { slug: "suspicious-bank-account-transactions", why: "Velocity bursts are the fraud stack's first alarm: too many authorizations inside a sliding window. This problem is that alarm at practice scale." },
    { slug: "amount-anomaly-zscore", why: "Declines and fraud both live in the tails: amount anomalies against a holder's own baseline are a Z-score away, and this problem drills exactly that fold." },
    { slug: "bank-account-summary", why: "A pot is a running story of money in and money out — this LEFT JOIN summary is the balance-per-account shape the pots squad ships every sprint." },
    { slug: "account-balance", why: "Running totals over a ledger of credits and debits — the daily pot-balance walk, NULL-safe ordering included." },
    { slug: "total-traveled-distance", why: "Conditional SUM over grouped movement — exactly how bill-pot funding is folded: sweeps in, bills out, per holder per month." },
    { slug: "monthly-transactions-i", why: "The bill book buckets by month on TEXT timestamps — SUBSTR month keys over the INTEGER-cents tables are this problem, cents rule included." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Fraud patterns are set logic: holders who hit merchant A and B but never C. Conditional aggregation over presence-and-absence is the pattern the risk team codes weekly." },
    { slug: "keep-latest-dedupe", why: "Settlement feeds resend rows; ROW_NUMBER dedupe keeps the latest leg. The transaction feed's hygiene problem, every single day." },
    { slug: "fix-names-in-a-table", why: "Merchant name hygiene before any join: 'AMZN MKTP' versus 'Amzn Mktp' silently splits one merchant into two and breaks every category budget." },
    { slug: "null-blank-audit", why: "The audit-first habit: a NULL and blank sweep across the account tables before anyone aggregates. Monzo treats a NULL policy as a design decision, not an accident." },
    { slug: "trial-balance-check", why: "The close gate: debits must equal credits — 181,080 against 181,080, delta zero. This problem IS that conditional-SUM check at practice scale." },
  ],
};
