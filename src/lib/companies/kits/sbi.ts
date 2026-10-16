// SBI — Wave-11 (Task 102-sbi), banking domain, 0 tagged sql rows — theme-curated.
// Public-sector banking at India scale (distinct from icici's private tech-first bank and
// hdfc's cards-and-mortgage franchise): the census read where the base is everything and the
// 14-month spine is the deposit trend. The storefront db maps honestly: customers are account
// holders (region = circle, carried as EU / APAC / US / LATAM codes), orders are account events
// and product draws (delivered = drawn-and-closed 52, shipped = disbursed-in-flight with
// shipped_at as the disbursement stamp 30, pending = YONO digital applications awaiting branch
// verification 14, cancelled = withdrawn 7), order_items are the itemized legs of each draw,
// products are deposit/lending SKUs (db category codes = scheme families), suppliers are the
// correspondent/outsourcing partner bench, invoices are statements/advices the branch bills,
// payments are settlement rails (card = YONO digital legs, wire = branch/NEFT legs), expenses
// are branch opex (premises / campaigns / inspection / core-banking), ledger_entries is the GL.
// Finance tables store INTEGER cents — the rupee read is amount_cents / 100.0; orders.total and
// order_items.unit_price are REAL already. The disbursement clock maps created_at -> shipped_at
// (82 of 103 events stamped, 2.98-day average, 2–4 spread) and the ticket-band fold
// (unit_price < 50: small-ticket priority SKUs @ 32.06; >= 50: big-ticket retail @ 111.5) onto
// the priority-sector read.
// Pool provenance: company-pools.md carries NO SBI section (0 tagged rows) — all 10 topic slug
// sets and all 16 problems are theme-curated from the theme menu's sql rows (no w*/d*/f* module
// topics) and say so in brief P4.
// Facts source: scripts/company-facts.md (probed 2026-10-12); case cells re-probed read-only
// against db/custom.db before authoring; every case slot is mechanically verified by
// scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: sbi is NOT yet in registry COMPANY_META (banking
// companies array and COMPANY_META both lack it) — wire id "sbi", domainId "banking", name "SBI",
// tagline "Public-sector banking at scale: branch censuses, priority-sector books, the deposit spine",
// accent "text-blue-400" to match this header exactly.

import type { CompanyKit } from "../types";

export const sbiKit: CompanyKit = {
  id: "sbi",
  domainId: "banking",
  name: "SBI",
  tagline: "Public-sector banking at scale: branch censuses, priority-sector books, the deposit spine",
  accent: "text-blue-400",

  brief: [
    "**SBI** — the State Bank of India — is India's public-sector banking giant: a branch network that reaches from metro counters to village service points, a deposit book measured in hundreds of millions of accounts, and a mandate that runs from retail deposits to priority-sector lending. The analyst's reality here is *the base is everything*: at this scale every read is a census, and every census is only as good as its denominator. On this training db the mapping is honest — the 16 customers rows are account holders across four circles (the db carries them as region codes EU / APAC / US / LATAM), the 103 orders are account events and product draws worth **34,833.28** (average ticket 338.19 against a 25.47 to 1,088.44 spread), and the 251 order_items rows are the itemized legs of each draw. The status map is fixed: delivered = {emerald:drawn and closed} (52, 50.5%), shipped = disbursed-in-flight (30, 29.1%), pending = a YONO digital application awaiting branch verification (14, 13.6%), cancelled = {rose:withdrawn} (7, 6.8%).",
    "The data org splits into a zonal analytics cell, a deposits-and-priority-sector pod and a small branch-cost desk, and all three read the same spine at different grains. An event books at created_at; shipped_at is the disbursement stamp — **82 of 103 events** carry it, averaging a 2.98-day sanction-to-cash lag with a 2–4 day spread, and the 14 YONO applications have none yet (a population definition, not a cleanup job). Money sits one layer down in INTEGER cents, where the rupee read is `amount_cents / 100.0`: 28 statements — 21 paid for 66,443, 6 open at 19,609, 1 void at 925 — settle on two rails, the {emerald:YONO digital rail} (16 legs for 37,364) and the {sky:branch/NEFT rail} (11 legs for 32,248), five of them on split plans crossing both. The GL is the book of record: **181,080 debits against 181,080 credits across 80 entries, delta 0** — a number that cannot tie is a rumor, not a read.",
    "Interview screens are census-then-denominator, with a reconciliation chaser. A loop opens with the **two-grain circle census** — EU runs 45 events from just 8 holders (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into the withdrawal map where the interviewer asks the denominator out loud (*do withdrawn applications count in your circle base?*), then into the {rose:priority-sector cut}, where CASE bands separate small-ticket priority lines from big-ticket retail SKUs. The {sky:14-month deposit spine} is the trend read every zonal review opens with: the book mobilizes 3,731.97 in the opening month, troughs at 1,193.86 in July, jumps +1,158.21 into August — and the withdrawn arm, 7 applications with 2 each in July and November, rides the same query. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no SBI section — **0 tagged rows** — so all thirty topic slugs and all sixteen problems here are **theme-curated** to this kit's known screen shapes: fate censuses, two-grain circle folds, disbursement clocks, priority-sector bands, rails and the GL tie-out. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {sky:deposit-mobilization spine} the zonal planning review opens with every month, the other rebuilds the {violet:branch opex walk} the network office ships at every close. The bar to clear: *state the status filter and the denominator before you compute anything* — then make the fate census reconcile to 103 by construction, and every paise fold divide by 100.0 exactly once.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the census proof. A zonal analyst opens the circle dashboard before standup: did overnight disbursements stamp, does any YONO application sit verified-but-unstamped, does the one-pass fate census reconcile — 52 drawn-and-closed + 30 disbursing + 14 awaiting verification + 7 withdrawn = **103 by construction**? A circle that fails that identity is *the day's first incident*, not a rounding note. If the **2.98-day** disbursement average drifts — the US already runs 3.07 against APAC's 2.93 — the branch-verification queue gets pulled before the mobilization report ships.",
    "**11:30 —** Midday is the deposit-mobilization deep-dive. The zonal review wants the 14-month spine with July's **1,193.86** trough and the +1,158.21 August jump annotated, the holder ladder with the four-way tie at 4 events handled honestly — shared rungs, named policy — and the {rose:priority-sector cut} re-banded: small-ticket SKUs averaging 32.06 against big-ticket retail at 111.5. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the denominator spelled out so the number survives the zonal-review argument*.",
    "**15:30 —** The afternoon tilts toward money and the close. The statement anti-join refreshes first — **6 never-settled statements worth 15,217** — before any reminder fires; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the dunning draft; the anomaly pair gets walked line by line: a void-but-settled statement (925.00) and a paid-status statement with zero legs (1,756.00). Branch opex goes to the cost board — the August peak of 3,210 against July's 1,794 — and the day ends the way every close does: the GL trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Deposit mobilization", what: "Monthly fold of account events: 14 buckets from 2024-01 to 2025-02 totaling 34,833.28 — opening month 3,731.97, July trough 1,193.86, +1,158.21 into August. The spine every zonal review opens with; the denominator (all booked events) ships with the number." },
    { name: "Draw-fate census", what: "52 drawn-and-closed (50.5%), 30 disbursed-in-flight (29.1%), 14 YONO applications awaiting verification (13.6%), 7 withdrawn (6.8%) — 103 by construction. Every stage is a conditional count over a status or timestamp, and the reconciliation identity is the correctness argument." },
    { name: "Disbursement clock", what: "created_at → shipped_at over stamped events only: 82 of 103, 2.98-day average, range 2–4. The sanction-to-cash read the branch network is judged on — the 14 YONO applications have no clock yet and must not dilute it." },
    { name: "Circle census", what: "Events beside holders per circle: EU 45 from 8 (5.6 per holder), APAC 37 from 5, US 19 from 2 (9.5), LATAM 2 from 1. COUNT(*) beside COUNT(DISTINCT customer_id) — load versus coverage, and the intensity read that decides where verification capacity goes." },
    { name: "Withdrawal share", what: "Withdrawn applications ÷ all booked events, per circle: APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The funnel-hygiene map — 100.0 goes BEFORE the division or every circle reads zero." },
    { name: "Book concentration", what: "63.5% of the 34,833.28 book sits with holders whose lifetime value crosses 3,000 (71.2% above 2,000); the ladder reads 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56 over 24 / 17 / 14 / 13 events. One relationship moves a circle." },
    { name: "Statement coverage & rails", what: "Billed versus settled by rail evidence: 21 exact (65,612.00 both sides), 1 partial (4,000.00 of 6,148.00), 6 never-settled worth 15,217.00 — cleared on the YONO digital rail (16 legs, 37,364) and the branch/NEFT rail (11 legs, 32,248), five statements on split plans." },
    { name: "Branch opex walk", what: "36 opex lines across 14 months totaling 25,416 — premises 14 lines / 16,800, campaigns 14 / 4,570, inspection travel 3 / 2,521, core-banking tools 5 / 1,525 — peaking at 3,210 in 2024-08. The fold must tie to the GL's operating_expenses debit of 25,416 or the cost board does not ship." },
  ],

  topics: [
    {
      name: "The draw-fate census",
      why: "Every SBI screen opens with the fate census: drawn-and-closed, disbursing, awaiting verification, withdrawn — each a conditional count over a status or timestamp, reconciling to 103 by construction. The trap is calling a disbursing event 'closed' — 30 versus 52 on this db — and the second trap is the denominator: YONO applications stay in a conversion base and drop out of a cycle-time base, and the panel wants you to say which before writing SQL.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "recyclable-and-low-fat-products"],
    },
    {
      name: "Two-grain circle censuses",
      why: "Events and holders are different grains of the same join, and every circle census reports both: EU runs 45 events from 8 holders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides where the next verification desk goes.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "The disbursement clock",
      why: "A sanction books at created_at and shipped_at stamps the day cash actually moved — the branch network's service clock. Each stage is a julianday delta averaged over the 82 stamped rows only, with the 14 unstamped YONO applications excluded by definition. Date arithmetic with a stated population is the shape being graded; the silent-shrink version is the bug being hunted.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Withdrawal & funnel rates",
      why: "The withdrawal share — 6.8% network-wide, 8.1% in APAC — is a conditional rate whose denominator is the placed book, never the closed book. The YONO digital funnel reads the same way: applications await branch verification, and the conversion base is all applications, not just the decided ones. Dividing by the wrong base is how a healthy circle gets flagged.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "queries-quality-and-percentage"],
    },
    {
      name: "Priority-sector CASE bands",
      why: "Priority-sector reporting is CASE-classified: the ticket-band fold splits 16 SKUs into 8 small-ticket lines (32.06 average) and 8 big-ticket lines (111.5), and scheme families band the same way. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the priority-sector return, and a reordered WHEN quietly re-bands the book. Regulators read the bands, so the bands must foot.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories"],
    },
    {
      name: "The deposit spine & LAG walks",
      why: "The 14-month mobilization spine (2024-01 to 2025-02) is the trend call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Withdrawn applications concentrate in July and November, 2 each of 7, and the walk is how that pattern gets defended.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate"],
    },
    {
      name: "Holder ladders & rank semantics",
      why: "Concentration reporting is rank-window work where ties are guaranteed — four holders sit at 4 events each on this db, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer holders, not syntax. The premier-desk list publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Statements, advices & the two rails",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the branch world meets money. Every rupee read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: YONO digital legs (16, 37,364) self-serve, branch/NEFT legs (11, 32,248) ride the counter, and five statements ride both.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
    {
      name: "Branch opex walks",
      why: "The branch-cost desk walks opex month by month — premises, campaigns, inspection, tools — through STRFTIME buckets over INTEGER cents with the /100.0 read. The walk must land on the GL's operating_expenses fold (25,416) or the cost board ships wrong. Date bucketing and zero-guarded folds are the daily mechanics; '%m' instead of '%Y-%m' merges two Januarys and the trend becomes fiction.",
      slugs: ["monthly-transactions-i", "sales-by-day-of-the-week", "restaurant-growth"],
    },
    {
      name: "Nested gates & HAVING floors",
      why: "Screens escalate into staging: fold per-holder event counts, then judge them against a computed platform mean (6.44 here — exactly four holders clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Verification targeting is exactly this: which holders run above the network's cadence.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
  ],

  theory: [
    {
      id: "sbi-t1",
      q: "Your circle census joins account holders to their events. When do you INNER and when do you LEFT — and what silently breaks if you filter a status column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A mobilization report joins events to holders: an event with no holder row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A coverage report must be LEFT from holders: a holder with no events IS the answer, arriving with NULL event columns. The classic break: filtering status = 'cancelled' in WHERE after the LEFT JOIN kills every NULL-payload holder row — the LEFT quietly became an INNER and the never-transacted holders vanished. On this db the anti-join returns a confident zero never-drawn holders — all 16 account holders appear in the event table somewhere — and proving that zero is itself the analyst's job, because at a bank a confident zero you did not verify is how a KYC-follow-up list dies in review.",
      tag: "joins",
    },
    {
      id: "sbi-t2",
      q: "The holder ladder runs 24, 17, 14, 13, 5 events, then FOUR holders tie at 4. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the tie block consumes ranks 6 through 9 and the next distinct count (3) lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, a silent judgment call about whose household gets the premier desk's call first. The second layer SBI candidates get asked: the same tie problem lives inside a running mobilization walk — SUM(total) OVER (ORDER BY created_at) uses a default RANGE frame, so events tied on the same timestamp enter the cumulative together. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer holders, or an explicitly named tie-breaker like created_at then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "sbi-t3",
      q: "The census shows 103 events and 16 holders; EU shows 45 events and 8 holders. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts event rows after the join — one row per account event, so a holder with 24 events contributes 24. COUNT(DISTINCT customer_id) folds those rows back to holders — EU's 45 events collapse to 8 relationships. Neither is wrong: events measure load and cadence, holders measure the installed base — and at a public-sector bank the installed base IS the franchise, so both columns ship on the same slide. The ratio — 5.6 events per holder in EU versus 9.5 in the US on this db — is the intensity signal, and the network mean (6.44, with exactly four holders above it) is the gate verification targeting actually uses. The trap that catches candidates is a third grain: join order_items for the draw legs and COUNT(*) silently counts legs, not events — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "sbi-t4",
      q: "shipped_at stays NULL until the disbursement stamp lands. What is your policy for the service-clock report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped events have a clock, so the report measures sanction-to-cash for the 82 of 103 events that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL events returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 YONO applications plus 7 withdrawn rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day disbursements for applications still sitting in branch verification, and it poisons the 2.98 baseline every circle drift alert keys off. At a bank whose service clocks feed regulatory reviews, a WHERE clause doing definitional work without saying so is the finding — the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "sbi-t5",
      q: "The circle review wants booked value per circle for circles carrying at least ten events. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards disbursing, pending and withdrawn rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-event floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is the difference between a mobilization line and an error, and between a threshold applied to events versus to rupees. One more placement rule SBI screens love: the withdrawal share — 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — puts the 100.0 BEFORE the division, because SUM of 0/1 flags over COUNT is integer division and the share truncates toward zero; on this db it is the difference between 6.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one event, or about a circle?",
      tag: "pipeline",
    },
    {
      id: "sbi-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 events always produce a mean ticket of 338.19. On filtered staging tables — one circle, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly where it hides. The correlated cousin (compare each event to ITS holder's average ticket) re-runs per outer row and answers a different question — which holders run hot against their own baseline — at a different cost, and it inherits the same empty-inner behavior when a holder's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole verification list empties, which is why the policy is EXISTS for existence tests. The strong candidate states the inner fold's population and its empty-case behavior unprompted.",
      tag: "subqueries",
    },
    {
      id: "sbi-t7",
      q: "The mobilization trend buckets events by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the mobilization trend becomes twelve fiction buckets. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's events, and month-end is exactly when counters book their heaviest draws. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the deltas tell a concrete story: the book opens at 3,731.97, troughs at 1,193.86 in July, jumps +1,158.21 into August, then takes its steepest drop, −1,326.87, into November. Date discipline is mobilization discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "sbi-t8",
      q: "Finance says a statement is 'paid' but it has no settlement legs, while a VOID statement did draw its leg. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOINed to their settlement legs, keep the NULL side — on this db that returns 6 never-settled statements worth 15,217.00, and one of them (1,756.00) is marked 'paid' with zero legs: a status that lies, which is why leg rows are the ledger of record and the status column is a claim. Then the mirror error: the void statement that still drew its 925.00 leg never appears in that anti-join — the two failure modes point in opposite directions, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — the void-but-settled statement folds in by construction, the paid-status one folds out), 1 partial (4,000.00 of 6,148.00), 6 none. The money rule: statements and legs carry INTEGER cents, so every rupee read is amount_cents / 100.0 — and the close culture ties outward too: the GL trial balance must land at 181,080 debits against 181,080 credits, delta zero, and the opex fold at 25,416 must tie to the operating_expenses account, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "sbi-mcq-1",
      prompt: "An account event's status reads 'shipped'. In this kit's SBI stage map, what happened?",
      choices: ["Disbursed in flight — the disbursement stamp shipped_at has landed", "Drawn and closed — the event completed at the counter", "Withdrawn before sanction", "A YONO digital application still awaiting branch verification"],
      answer: 0,
      why: "The stage map is fixed: shipped = disbursed-in-flight (30 of 103 events), with shipped_at as the disbursement stamp. Cash has moved but the event is not closed.",
      notes: [
        { choice: 1, why: "Drawn-and-closed is 'delivered' — 52 events. Calling in-flight disbursements closed inflates the settled book before a single event completes." },
        { choice: 3, why: "YONO applications awaiting verification are 'pending' — 14 events with no shipped_at yet. Pending is not disbursement and not withdrawal; it is 'not yet'." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-2",
      prompt: "The disbursement clock averages 2.98 days. Over which population is that honestly computed?",
      choices: ["82 stamped events of 103 booked — the 14 YONO applications have no stamp and no clock yet", "All 103 booked events", "52 drawn-and-closed events only", "16 holders, one clock each"],
      answer: 0,
      why: "The house definition: the clock runs on stamped events only — created_at to shipped_at — and the 14 unstamped applications stay out by definition. The population ships with the number.",
      notes: [
        { choice: 1, why: "Averaging over all 103 silently dilutes the clock with events that have no disbursement yet — the AVG skips NULLs and the number survives, wearing the wrong name." },
        { choice: 2, why: "52/82 mixes funnel steps — delivered is closure, shipped_at is the disbursement stamp. Different stages, different clocks." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-3",
      prompt: "EU carries 45 account events from 8 holders. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts event rows (45); COUNT(DISTINCT customer_id) folds repeats back to holders (8). The gap between them — 5.6 events per holder — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every event carries a holder. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts circles, not holders — a third grain nobody asked for. The census is events AND relationships." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to withdrawn events only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the withdrawal share truncates toward 0 and every circle reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 0.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the withdrawal map reads zero everywhere, including APAC's 8.1%." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-5",
      prompt: "Keep only circles carrying at least 10 account events. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY circle HAVING COUNT(*) >= 10", "WHERE events >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "An event-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the top of the ladder — 24, 17, 14 and 13 events per holder — clears a 10-event bar.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'events' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-6",
      prompt: "The holder ladder runs 24, 17, 14, 13, 5 events, then FOUR holders tie at 4. Under RANK, what rank do the two 3-event holders carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-event holders share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The premier list's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-7",
      prompt: "A junior buckets the mobilization spine with STRFTIME('%m', created_at) and gets 12 tidy rows. What is wrong?",
      choices: ["Nothing — 12 rows matches the calendar", "'%m' drops the year, so January 2024 merges with January 2025 — the 14-bucket spine collapses into 12 fiction buckets", "SQLite caps month buckets at 12", "The trend needs DATE() instead of STRFTIME()"],
      answer: 1,
      why: "The spine needs '%Y-%m' — year plus zero-padded month — to hold 14 distinct buckets from 2024-01 to 2025-02. With '%m', January 2024's 3,731.97 lands in the same bucket as January 2025's 1,669.50 and the trend lies.",
      notes: [
        { choice: 0, why: "Twelve tidy rows is exactly the tell — the db spans fourteen months, so a 12-row result is a merge, not a summary. Row counts are the first sanity check." },
        { choice: 3, why: "DATE() buckets by full day, not month — 103 rows. The directive string is the fix, not a different function." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-8",
      prompt: "A paid-status statement carries zero settlement legs; a VOID statement did draw its 925.00 leg. Which membership rule keeps the coverage census honest?",
      choices: ["Rail evidence: legs summing to billed cents make 'exact' — the void-but-settled 925.00 folds IN, the paid-status 1,756.00 folds OUT", "Status column: anything marked 'paid' is exact by definition", "Any statement with at least one leg is exact", "Statements past due are 'none' regardless of legs"],
      answer: 0,
      why: "Coverage is computed from legs, not claims: 21 exact (65,612.00 both sides — the void-but-settled statement folds in because its one leg matches its billed cents), 1 partial (4,000.00 of 6,148.00), 6 none (15,217.00). The status column is a claim; a rail hit is evidence.",
      notes: [
        { choice: 1, why: "The status column lies by construction here — #28 reads 'paid' with zero legs. Classifying by claim makes the census agree with itself and miss the anomaly." },
        { choice: 2, why: "The partial statement has a leg (4,000.00 of 6,148.00) and is not exact. Any-leg membership collapses two different buckets into one." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-9",
      prompt: "The branch opex walk computes LAG(opex) OVER (ORDER BY month); the first month's delta prints NULL. Correct handling?",
      choices: ["Report the NULL — it is the baseline; there is no prior month", "COALESCE it to 0 so the column stays numeric", "Drop the first row from the walk", "Replace it with the running total"],
      answer: 0,
      why: "NULL is the honest value: no prior month exists, so there is no movement to report. The walk opens at 1,719.00 with a NULL delta and that is the story — January 2024 is the baseline of the 14-month opex walk.",
      notes: [
        { choice: 1, why: "A zeroed baseline reads as a flat month and poisons every average of the delta column downstream — the oldest lie in trend reporting." },
        { choice: 2, why: "Dropping the row shifts the baseline to February and every delta re-anchors against the wrong month. The walk loses its first step, not just a row." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-10",
      prompt: "A dashboard walks booked value event by event: SUM(total) OVER (ORDER BY created_at). Two events share a created_at second, and the cumulative 'jumps two events at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at event grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-sbi-1",
      tier: "easy",
      topic: "t4",
      universe: "growth",
      title: "The deposit-mobilization spine",
      brief:
        "SBI-flavored brief on the storefront db: the zonal planning review opens with the deposit-mobilization spine — account events booked and value drawn per month, with withdrawn applications flagged in the same pass. Probed facts: 14 buckets from 2024-01 to 2025-02 totaling 34,833.28 across 103 events; the opening month draws 3,731.97 on 8 events; July is the trough at 1,193.86 with 2 withdrawn; November reads 1,648.80 on 6 events, also 2 withdrawn; withdrawals total 7 of 103. The review reads the spine oldest first, money to 2 decimals.",
      ask: "Return month, event count, mobilized value to 2 decimals and withdrawn count for every month of the spine, chronological.",
      template:
        "SELECT STRFTIME({1}, created_at) AS month,\n       COUNT(*) AS events,\n       ROUND(SUM({2}), {3}) AS mobilized,\n       SUM(CASE WHEN status = {4} THEN 1 ELSE 0 END) AS withdrawn\nFROM orders\nGROUP BY month\nORDER BY month {5};",
      slots: [
        {
          answer: "'%Y-%m'",
          kind: "keyword",
          label: "the month bucket",
          why: "'%Y-%m' keeps year plus zero-padded month so the spine reads 14 buckets, 2024-01 to 2025-02. '%m' merges January 2024 into January 2025 and the trend collapses to 12 fiction buckets; a directive-free literal folds all 103 events into one row.",
        },
        {
          answer: "total",
          kind: "keyword",
          label: "the value fold",
          why: "SUM(total) folds the draw values — the mobilized rupees. SUM(1) folds a constant and prints 103 regardless of mix, and the shelf column unit_price does not exist on orders at all: the fold must name the money column the table actually carries.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the money precision",
          why: "ROUND(..., 2) prints 3,731.97 the way the facts line carries it. Precision 1 prints 3,732.0 and the spine stops reconciling with the numbers the zonal pack quotes — the trough reads 1,193.9 and nobody can foot it back.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the withdrawn arm",
          why: "status = 'cancelled' flags the 7 withdrawn applications — 2 each in July and November, the months the review annotates. 'pending' flags the 14 YONO applications instead: a different population with a different owner, printed under the wrong column name.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronology",
          why: "The spine reads oldest first so the 3,731.97 opening leads and the 1,193.86 trough lands mid-walk. DESC opens the review on 2025-02 and the trend reads backwards — a correct query aimed at the wrong end of the room.",
        },
      ],
      distractors: ["'%m'", "unit_price", "1", "'pending'", "DESC", "DATE"],
      walkthrough:
        "One table, one fold, one flag arm — the census read where the base is everything. STRFTIME('%Y-%m') buckets all 103 events into the 14-month spine; GROUP BY month folds each bucket to event count and ROUND(SUM(total), 2) prints the mobilized book; the CASE arm flags withdrawn applications beside the fold, foot to 7. The walk reads: 3,731.97 on 8 events in the opening month, the 1,193.86 trough in July with its 2 withdrawals, November at 1,648.80 on 6 events with 2 more, closing at 2,390.53 on 7 events in 2025-02. The distractors each break differently: '%m' merges the two Januarys into one bucket and the spine prints 12 rows; unit_price inside SUM is a no-such-column error — orders carries total, not shelf price; 1 in the precision slot rounds the trough to 1,193.9 and the pack stops footing; 'pending' flags the 14 YONO applications instead of the 7 withdrawals; DESC opens the review on 2025-02; DATE as the format is a no-such-column error before a single bucket forms. The two-column pairing is the read: July's trough coincides with the withdrawn spike, and the review argues about whether the funnel is thinning or the base is — the query cannot answer that, but it must be built so the question can be asked.",
    },
    {
      id: "cs-sbi-2",
      tier: "hard",
      topic: "t8",
      universe: "month-close",
      title: "The branch opex walk",
      brief:
        "SBI-flavored brief on the storefront db: at every month-end the network office walks branch opex month by month — staged, then windowed, so each month carries its line count, its rupee total and its month-over-month move beside a running total. Probed facts: 36 opex lines across the same 14 months totaling 25,416 — premises 14 lines / 16,800, campaigns 14 / 4,570, inspection travel 3 / 2,521, core-banking tools 5 / 1,525; the walk opens at 1,719.00, peaks at 3,210.00 in 2024-08 (+1,416.00 on July's 1,794.00), and the running total must land on the GL's operating_expenses debit fold of 25,416 or the cost board does not ship. Opex stores INTEGER cents; the rupee read is amount_cents / 100.0.",
      ask: "Return month, line count, opex, month-over-month delta and running total in rupees for every month of the walk, chronological.",
      template:
        "WITH monthly AS (\n  SELECT STRFTIME('%Y-%m', e.{1}) AS month,\n         COUNT(*) AS lines,\n         ROUND(SUM(e.amount_cents) / {2}, 2) AS opex\n  FROM expenses e\n  GROUP BY month\n)\nSELECT month,\n       lines,\n       opex,\n       ROUND(opex - {3}(opex) OVER (ORDER BY month), 2) AS mom_delta,\n       ROUND(SUM(opex) OVER (ORDER BY month), 2) AS running\nFROM monthly\nORDER BY month {4};",
      slots: [
        {
          answer: "spent_on",
          kind: "keyword",
          label: "the spend date",
          why: "Opex lines timestamp on spent_on — that is the spend clock the walk buckets. created_at and issued_on live on other tables entirely, and the wrong column is a no-such-column error, not a silent zero: the walk never starts.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents divider",
          why: "Opex stores INTEGER cents; /100.0 is the rupee read that prints 1,719.00 from 171,900 cents. The .0 forces real division — on this whole-cent book every fold lands on the digit, and the guard is the house style that keeps one odd cent from eating a column.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the lookback",
          why: "LAG reads the prior month beside the current — the +1,416.00 jump into the 3,210.00 August peak and the −1,665.00 retreat after. LEAD reads forward and flips every sign; the first row stays NULL by construction — the baseline, never a zero.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the walk direction",
          why: "A walk reads forward: the running total accumulates toward the 25,416.00 GL tie. DESC reverses both the delta walk and the running total's meaning — it would read remaining spend, a different report wearing the same columns.",
        },
      ],
      distractors: ["created_at", "issued_on", "LEAD", "DESC", "1000", "10"],
      walkthrough:
        "Two stages: fold the cents per month, then window the walk. The CTE buckets 36 opex lines on STRFTIME('%Y-%m', spent_on) into 14 monthly rows — line counts of 2 and 3 — and converts cents to rupees with the /100.0 read: 1,719.00, 1,440.00, 1,917.00, 1,749.00, 1,480.00, 1,510.00, 1,794.00, then the August peak 3,210.00. The outer SELECT windows the walk: LAG produces the month-over-month delta (+1,416.00 into August, −1,665.00 out of it) with the first row NULL by construction, and SUM(opex) OVER (ORDER BY month) accumulates the running fold — 11,609.00 through July, 14,819.00 through August — landing on 25,416.00, tying the cost board to the GL's operating_expenses debit exactly. The distractors each break differently: created_at and issued_on are no-such-column errors before the walk starts; LEAD flips every delta sign and hands the board a walk that runs backwards; 1000 and 10 in the divider rescale the whole board ten- or a hundred-fold; DESC reverses the chronology so the running total reads as remaining spend. The reconciliation rule holds: a fold that ties to the GL is the argument, and every window on this board has its frame stated, never implied.",
    },
  ],

  problems: [
    { slug: "delinquency-buckets", why: "The 6 never-settled statements worth 15,217 age into collection buckets before any reminder fires — this problem drills the exact aging fold the branch worklist follows." },
    { slug: "gl-reconciliation", why: "Debits against credits, reconciled line by line: the 181,080 = 181,080 proof as a repeatable query. Delta zero or the close does not ship — this problem is that gate in miniature." },
    { slug: "trial-balance-check", why: "One pass, two conditional sums: total debits beside total credits with a zero-delta test. The close's make-or-break check is exactly this shape, run against the GL's 80 entries." },
    { slug: "balance-rollforward", why: "Opening plus movements equals closing: the GL walk the network office re-runs every month-end. This problem drills the movement algebra the branch proof depends on." },
    { slug: "portfolio-weights", why: "Each holder's share of the 34,833.28 book via window partitions — the concentration board's base read, where 63.5% of value concentrates in the 3,000-plus cohort." },
    { slug: "customer-purchasing-behavior-analysis", why: "Lifetime value cut into spend tiers: the premier-desk list is a tiering query over the same ladder that runs 7,262.35 / 6,640.56 / 4,574.23 / 3,644.56." },
    { slug: "bank-account-summary", why: "Monthly credits and debits per account with LEFT JOIN zero arms — deposits in, withdrawals out, and no month silently vanishing from the household statement." },
    { slug: "duplicate-charge-pairs", why: "Self-join over the rails hunting duplicate debits: the twin-leg screen a reversal request must pass. The five split-rail statements make this the discipline the settlement desk lives by." },
    { slug: "amount-anomaly-zscore", why: "Ticket z-scores against the 338.19 mean: the outlier read that flags the 1,088.44 draw for a second look — the fraud spot-check's statistical spine." },
    { slug: "loan-types", why: "CASE-classifying SKUs into loan and deposit families: the priority-sector tag applied at line grain, where a mis-banded arm is a hole in the regulator's return." },
    { slug: "running-total-for-different-genders", why: "Running totals partitioned by segment: per-circle mobilization walked beside the network total — the two-pane view the zonal review opens with, windows drilled properly." },
    { slug: "maximum-transaction-each-day", why: "Argmax windows over a day spine: the peak draw per day is the counter-load read that staffs the branch — one query, every day's heaviest moment." },
    { slug: "the-most-recent-orders-for-each-product", why: "Latest draw per SKU family: the 'who drew last' read the counter actually asks before a cross-sell call. Row-number deduplication with a stated tie policy." },
    { slug: "students-and-examinations", why: "Holder by scheme-family grid with zero-fill counts: the cross-sell completeness census that names which household holds no term deposit — whitespace at line grain." },
    { slug: "second-highest-salary", why: "Nested-subquery runner-ups: what sits under the 1,088.44 head draw. Second-place logic is where LIMIT, ties and empty results collide — exactly the ladder interview follow-up." },
    { slug: "median-employee-salary", why: "Median emulation via windows: the median ticket beside the 338.19 mean — the skew read that says whether the average flatters the circle. The concentration story's statistical check." },
  ],
};
