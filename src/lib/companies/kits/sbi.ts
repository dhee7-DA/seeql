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
    "Preparation strategy: the pools file carries no SBI section — **0 tagged rows** — so all thirty topic slug sets and all thirty-two problems here are **theme-curated** to this kit's known screen shapes: fate censuses, two-grain circle folds, disbursement clocks, priority-sector bands, rails and the GL tie-out. Do the topics in order, then run all six case studies on the live storefront db: the {sky:deposit-mobilization spine} the zonal planning review opens with, the {violet:branch opex walk} the network office ships at every close, the premier-desk ladder, the one-pass fate census, the never-settled anti-join and the verification-targeting bench. The bar to clear: *state the status filter and the denominator before you compute anything* — then make the fate census reconcile to 103 by construction, and every paise fold divide by 100.0 exactly once.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the reads SBI screens rehearse most: the deposit-mobilization spine walk, the branch opex walk that must tie to the GL, the premier-desk ladder with its published tie policy, the one-pass fate census that reconciles to 103 by construction, the never-settled anti-join that feeds dunning, and the verification-targeting bench that stages the network cadence once and chases four. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the 'state your denominator' follow-up tests.",
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
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "recyclable-and-low-fat-products", "immediate-food-delivery-iii"],
    },
    {
      name: "Two-grain circle censuses",
      why: "Events and holders are different grains of the same join, and every circle census reports both: EU runs 45 events from 8 holders while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides where the next verification desk goes.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "customers-who-never-order"],
    },
    {
      name: "The disbursement clock",
      why: "A sanction books at created_at and shipped_at stamps the day cash actually moved — the branch network's service clock. Each stage is a julianday delta averaged over the 82 stamped rows only, with the 14 unstamped YONO applications excluded by definition. Date arithmetic with a stated population is the shape being graded; the silent-shrink version is the bug being hunted.",
      slugs: ["average-time-of-process-per-machine", "find-golden-hour-customers", "users-with-two-purchases-within-seven-days", "settlement-fails-aging", "customers-with-maximum-number-of-transactions-on-consecutive-days"],
    },
    {
      name: "Withdrawal & funnel rates",
      why: "The withdrawal share — 6.8% network-wide, 8.1% in APAC — is a conditional rate whose denominator is the placed book, never the closed book. The YONO digital funnel reads the same way: applications await branch verification, and the conversion base is all applications, not just the decided ones. Dividing by the wrong base is how a healthy circle gets flagged.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "queries-quality-and-percentage", "dormant-reactivation"],
    },
    {
      name: "Priority-sector CASE bands",
      why: "Priority-sector reporting is CASE-classified: the ticket-band fold splits 16 SKUs into 8 small-ticket lines (32.06 average) and 8 big-ticket lines (111.5), and scheme families band the same way. The arms must be exhaustive and ordered — a hole in the CASE is a hole in the priority-sector return, and a reordered WHEN quietly re-bands the book. Regulators read the bands, so the bands must foot.",
      slugs: ["calculate-special-bonus", "weather-type-in-each-country", "count-salary-categories", "credit-utilization-bands", "loan-amortization-schedule"],
    },
    {
      name: "The deposit spine & LAG walks",
      why: "The 14-month mobilization spine (2024-01 to 2025-02) is the trend call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. Withdrawn applications concentrate in July and November, 2 each of 7, and the walk is how that pattern gets defended.",
      slugs: ["second-day-confirmation", "biggest-window-between-events", "year-on-year-growth-rate", "vintage-default-curves", "daily-balance-interest"],
    },
    {
      name: "Holder ladders & rank semantics",
      why: "Concentration reporting is rank-window work where ties are guaranteed — four holders sit at 4 events each on this db, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer holders, not syntax. The premier-desk list publishes the policy; candidates are asked to defend it.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "portfolio-concentration-hhi"],
    },
    {
      name: "Statements, advices & the two rails",
      why: "Billed is not settled — the finance tables (28 statements, 27 legs, INTEGER cents) are where the branch world meets money. Every rupee read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The rails matter too: YONO digital legs (16, 37,364) self-serve, branch/NEFT legs (11, 32,248) ride the counter, and five statements ride both.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices", "ar-aging-schedule", "expected-credit-loss"],
    },
    {
      name: "Branch opex walks",
      why: "The branch-cost desk walks opex month by month — premises, campaigns, inspection, tools — through STRFTIME buckets over INTEGER cents with the /100.0 read. The walk must land on the GL's operating_expenses fold (25,416) or the cost board ships wrong. Date bucketing and zero-guarded folds are the daily mechanics; '%m' instead of '%Y-%m' merges two Januarys and the trend becomes fiction.",
      slugs: ["monthly-transactions-i", "sales-by-day-of-the-week", "restaurant-growth", "journal-gap-detection"],
    },
    {
      name: "Nested gates & HAVING floors",
      why: "Screens escalate into staging: fold per-holder event counts, then judge them against a computed platform mean (6.44 here — exactly four holders clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. Verification targeting is exactly this: which holders run above the network's cadence.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "suspicious-bank-account-transactions", "top-percentile-fraud"],
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
    {
      id: "sbi-t9",
      q: "The zonal review wants a 3-month moving average of mobilized value beside every month of the spine. How do you frame the window, and where do ROWS and RANGE disagree?",
      a: "AVG(mobilized) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — three rows including the current one, so the first two months print partial windows and say so. ROWS counts rows; RANGE peers over VALUES, so a tied or gapped month key makes the frame reach further than three calendar months. On a '%Y-%m' spine with no gaps the two agree; at event grain, where created_at ties are guaranteed, they diverge and the frame must be stated. The strong answer names the frame out loud and never ships the default.",
      tag: "windows",
    },
    {
      id: "sbi-t10",
      q: "The close pack stacks the settled arm, the in-flight arm and a grand-total row into one result set. Walk me through building it so no row silently vanishes.",
      a: "Two folds, one spine: GROUP BY the status arms separately, then UNION ALL them together — ALL, not plain UNION, because UNION dedupes and two arms with identical figures would collapse into one row. The grand-total row is a third SELECT with no GROUP BY, its label column hard-coded so the pack can find it. Every branch must project the same column list in the same order, and the reconciliation check is the point: the three branches add back to 103 events and 34,833.28, or the pack does not ship.",
      tag: "pipeline",
    },
    {
      id: "sbi-t11",
      q: "LATAM's withdrawal cell prints 0 while a circle's YONO stage cell prints NULL. Defend the difference — when is each the right print?",
      a: "Zero and NULL answer different questions. LATAM's 0 is a measured fact: two events ran, none was withdrawn — COUNT over a matched population. NULL means no measurement happened: a SUM over an empty LEFT JOIN payload, or a stage that cannot exist for that row. Zero-filling a true NULL invents a fact (the never-settled statements would read as settled-at-zero); leaving a real zero as NULL hides a finding. The policy: COALESCE only where zero is the honest value — settled cents on a no-leg advice — and let NULL stand where the population is undefined.",
      tag: "nulls",
    },
    {
      id: "sbi-t12",
      q: "Derived tables, correlated subqueries and window functions can all answer 'how does this holder's cadence compare to the network's'. When do you reach for each?",
      a: "The derived table (or CTE) stages the per-holder fold once and joins back — right when many rows need the comparison and you want to inspect the staging set itself. The correlated subquery re-runs per outer row — readable for a one-off comparison on small data, wrong for a 103-event book at branch scale. The window (AVG(events) OVER ()) computes the network mean once and attaches it to every row without a self-join — right when the mean must ride beside each ladder row, which is exactly the verification-targeting bench in this kit. State the re-evaluation cost out loud and the choice makes itself.",
      tag: "subqueries",
    },
    {
      id: "sbi-t13",
      q: "Five statements settle on both rails at once. How do you find them with a self-join, and what stops every pair printing twice?",
      a: "Join payments to itself on invoice_id: SELECT a.invoice_id FROM payments a JOIN payments b ON a.invoice_id = b.invoice_id AND a.method < b.method — the strict inequality on the method (or id) keeps one row per unordered pair, never a leg against itself. GROUP BY invoice_id HAVING COUNT(DISTINCT method) = 2 is the fold-based twin and is easier to read. Both return the same five statements. What breaks it: joining on <> (keeps both orderings) or on nothing at all — the cross product of the rails tables.",
      tag: "joins",
    },
    {
      id: "sbi-t14",
      q: "Your staging table's chase list uses NOT IN against a loaded subquery and returns zero rows. Walk me through the diagnosis and the query you rewrite it to.",
      a: "Diagnosis first: NOT IN over a list containing one NULL is never TRUE — every comparison lands UNKNOWN, and the list empties while looking valid. Check the inner fold for NULLs (the 14 YONO applications are the natural suspects — unverified rows are where identifiers go missing). The rewrite is NOT EXISTS: SELECT … FROM holders h WHERE NOT EXISTS (SELECT 1 FROM staging s WHERE s.customer_id = h.customer_id) — the correlated probe short-circuits on the first match, treats NULL as just another non-matching row, and returns the honest chase list. The two-step answer — name the NULL, then name the EXISTS — is what the panel listens for.",
      tag: "subqueries",
    },
    {
      id: "sbi-t15",
      q: "The disbursement clock averages 2.98 days. Rebuild that number for me — every decision that keeps it honest.",
      a: "Population first: only stamped events carry a clock, so WHERE shipped_at IS NOT NULL — the 82 of 103 events; the 14 YONO applications and 7 withdrawn rows have no disbursement and must not dilute the base. Then the arithmetic: julianday(shipped_at) - julianday(created_at) converts TEXT timestamps to day floats — subtracting the raw TEXT values coerces them to their numeric prefixes and prints garbage zeros. AVG over the deltas reads 2.98, with a 2-to-4-day spread; per circle it drifts (US 3.07, APAC 2.93) and the drift is the alert. Finally the print: ROUND(..., 2) at the display edge, and the population stated in the title — a clock without its population is a rumor.",
      tag: "dates",
    },
    {
      id: "sbi-t16",
      q: "The account-holder master arrives from a core-banking migration with case-broken and padded names — 'SHARMA R' as 'sharma r ', 'Iyer Ltd' as 'IYER LTD'. What breaks downstream, and what is the hygiene pass?",
      a: "Everything that groups or joins on name: the holder ladder splits one relationship into two, the premier-desk list double-counts, and COUNT(DISTINCT customer_id) quietly overstates coverage. The hygiene pass runs once, upstream of the folds: TRIM(name) to strip the padding, an explicit casing rule (INITCAP for display, UPPER for the join KEY only if the key is a name — it never should be), and a dedupe staged on the natural key with ROW_NUMBER keeping the freshest row. Names are display artifacts, never join keys — the honest fix keys on customer_id and treats the text as cargo.",
      tag: "quality",
    },
    {
      id: "sbi-t17",
      q: "The desk wants holders tiered into quartiles by lifetime value — but peers tied at the edge keep landing in different tiers. What is happening and what do you ship instead?",
      a: "NTILE(4) deals buckets by row position: with 16 holders it deals 4-4-4-4, and the four-way tie at 4 events straddles the 8/9 boundary — three peers in quartile 2, one in quartile 3. Nothing is broken; position-based tiering just has no tie semantics. If peers must share a tier, ship explicit CASE bands with fixed rupee edges (0-1,000 / 1,000-3,000 / 3,000-plus — the edges the concentration read already quotes), or PERCENT_RANK with a stated rounding policy. The reviewer's question is always 'why is this peer in a different tier than that one' — position is not an answer, an edge is.",
      tag: "windows",
    },
    {
      id: "sbi-t18",
      q: "Make every fate census reconcile to 103 by construction. What does that identity look like in SQL, and why does the one-pass version beat four queries?",
      a: "The identity: SUM of the branch counts equals COUNT(*) — 52 delivered + 30 shipped + 14 pending + 7 cancelled = 103, checked in the same query as a CASE that adds the arms, or by summing the printed columns. One pass does it: COUNT(*) FILTER (WHERE status = 'delivered') and its siblings, or SUM(CASE WHEN status = … THEN 1 ELSE 0 END) — the portable twin — all over the same scan. Four sequential queries are four chances to drift: different WHERE filters, different run times, no shared denominator. The one-pass census cannot disagree with itself, and the ELSE 0 (or the FILTER's implicit zero) keeps empty arms printed instead of vanished.",
      tag: "aggregation",
    },
    {
      id: "sbi-t19",
      q: "'Give me the trough month' and 'give me each holder's biggest draw' — how do you write argmax queries whose answers survive review?",
      a: "An argmax is a fold plus a tie policy. The trough: ORDER BY mobilized ASC LIMIT 1 returns July's 1,193.86 — but only because no other month ties; if two months tie, LIMIT 1 picks one arbitrarily. The survivor-proof shape is the window: RANK() OVER (ORDER BY mobilized ASC) = 1 keeps every tied row, and the review sees the whole tie set. Per-holder biggest draws are the same pattern partitioned by holder: ROW_NUMBER with a named tie-breaker (created_at, then id) when exactly one row is wanted and the tie-breaker is published; RANK when peers should share the call. The failing pattern is ORDER BY inside a correlated subquery with LIMIT 1 and no stated tie rule — it works until the day it silently changes its mind.",
      tag: "windows",
    },
    {
      id: "sbi-t20",
      q: "The month-close pack re-runs the same circle folds against 103 events in milliseconds — but a colleague's version takes minutes. Walk me through making it fast.",
      a: "Read the plan first: EXPLAIN QUERY PLAN shows seeks versus scans. The usual culprits are all self-inflicted — a function wrapped around the join or filter column (UPPER(region), STRFTIME('%Y', created_at) in WHERE) defeats the index, so every query degrades to a full scan; SELECT * drags columns the fold never uses; and correlated subqueries re-run per row where a GROUP BY fold once would do. The fixes are boring and compounding: compare columns bare, filter on ranges the index can seek (half-open date bounds), pre-stage the per-circle fold in a CTE and let the outer query read it once. At 103 events the difference is milliseconds; at branch-network scale it is the batch window.",
      tag: "indexes",
    },
    {
      id: "sbi-t21",
      q: "The ladder export re-runs nightly and reviewers noticed the four tied holders swap positions between runs. How do you make a query's output reproducible?",
      a: "Ties leave the within-tie order undefined, so the engine's scan order decides — and plans shift with statistics and schema changes. The fix is a named, deterministic tie-breaker appended to every ORDER BY that matters: events DESC, lifetime DESC, holder id — stable columns, unique at the tail. The same discipline applies to LIMIT cuts (top-5 lists) and to GROUP_CONCAT rosters (concatenate in the published order or the email reads differently every night). Reproducibility is a query property: the ORDER BY is the policy, and the policy comment beside it is what the review defends.",
      tag: "windows",
    },
    {
      id: "sbi-t22",
      q: "Where does COALESCE belong in the circle reads — and where does it belong nowhere?",
      a: "It belongs where zero is the honest value: COALESCE(SUM(p.amount_cents), 0) on the LEFT JOIN payload keeps the six never-settled statements on the coverage board at zero settled instead of vanishing into NULL; the same guard belongs on display columns a stakeholder will subtract against. It belongs nowhere in the clocks: IFNULL-ing a NULL disbursement latency to zero invents same-day disbursements and poisons the 2.98-day baseline every drift alert keys off — and it belongs nowhere in the LAG baseline, where the first row's NULL is the definition, not a gap. The test is one sentence: is zero a measurement, or an invention?",
      tag: "nulls",
    },
    {
      id: "sbi-t23",
      q: "The close ships only when four proofs pass. Name the four checks you run before the pack goes out, and what each would catch.",
      a: "One: the fate census — 52 + 30 + 14 + 7 = 103 by construction; it catches any WHERE that dropped a status arm. Two: the coverage census — 21 exact, 1 partial, 6 none footing to 28 statements, settled value 65,612.00; it catches a fan-out double-count and a LEFT JOIN quietly turned INNER. Three: the GL tie — debits 181,080.00 against credits 181,080.00, delta 0 across 80 entries; it catches a half-loaded batch and a cents-divisor error. Four: the opex fold — 25,416.00 tying to the GL's operating_expenses account; it catches a '%m' bucket that merged two Januarys. Four proofs, each one query, each one number — the pack ships on zero deltas.",
      tag: "quality",
    },
    {
      id: "sbi-t24",
      q: "Every rate the desk quotes gets challenged on its denominator. Walk me through the denominator decisions behind withdrawal share, kept share and intensity.",
      a: "Withdrawal share: cancelled events over ALL booked events — 7 of 103, 6.8% network-wide — never over the closed book, which is the flattering denominator the panel baits you toward; per circle the same base gives APAC 8.1% and LATAM a true 0. Kept share: delivered events (or value) over the circle's own book — EU 53.3%, LATAM 100.0 on a two-event denominator that must be footnoted every time. Intensity: events per holder — EU 45 from 8 is 5.6, the US 19 from 2 is 9.5 — the ratio that decides where verification capacity goes. The discipline is the same: state the numerator's population, state the denominator's population, and put the 100.0 before the division or integer truncation flattens the share to zero.",
      tag: "aggregation",
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
    {
      id: "sbi-mcq-11",
      prompt: "The zonal pack quotes two headline numbers — 103 account events and 34,833.28 mobilized. Which fold pair produces both in one GROUP BY circle pass?",
      choices: ["COUNT(*) for the census, SUM(total) for the book", "COUNT(total) for the census, SUM(*) for the book", "SUM(*) for the census, COUNT(DISTINCT total) for the book", "AVG(total) for the census, COUNT(*) for the book"],
      answer: 0,
      why: "COUNT(*) counts event rows — the census the whole kit reconciles to 103. SUM(total) folds the draw values — the 34,833.28 book. They are different grains of the same GROUP BY and both belong on the slide.",
      notes: [
        { choice: 1, why: "SUM(*) does not exist — SUM takes an expression, not the star. And COUNT(total) still reads 103 since every event carries a value; the pair is a syntax error wearing a plausible shape." },
        { choice: 3, why: "AVG(total) prints 338.19, the mean ticket — a per-event read, not the census. Swapping it into the census column makes the pack quote averages where counts belong." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-12",
      prompt: "A junior joins account events to their itemized draw legs and reports COUNT(*) = 251 as the event census. What actually happened?",
      choices: [
        "The join fanned out to leg grain — 251 itemized legs across the 103 events, so the census must fold back with COUNT(DISTINCT order_id)",
        "148 events were double-ingested by the pipeline and must be deduplicated",
        "The leg table carries 251 events and the census was understated before",
        "GROUP BY collapsed the events and 251 is the distinct-event count",
      ],
      answer: 0,
      why: "The events-to-legs join is 1:N: 103 events carry 251 legs (2.44 per event). COUNT(*) after the join counts legs, not events — the third-grain trap the panel grades on every census follow-up.",
      notes: [
        { choice: 1, why: "Nothing was double-ingested — the multiplication is the join's honest shape. Deduping it would delete real legs and the draw detail would shrink." },
        { choice: 3, why: "GROUP BY cannot reduce a fan-out below the grain it grouped at — 251 legs fold to 103 events only via COUNT(DISTINCT order_id) or a pre-aggregated derived table." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-13",
      prompt: "Which status arm is the census's drawn-and-closed bucket, and what share of the 103 events does it hold?",
      choices: [
        "delivered — 52 events, 50.5% of the book",
        "shipped — 30 events, 29.1% of the book",
        "pending — 14 events, 13.6% of the book",
        "cancelled — 7 events, 6.8% of the book",
      ],
      answer: 0,
      why: "The stage map is fixed: delivered = drawn-and-closed, 52 of 103 (50.5%). The arms must reconcile to 103 by construction — 52 + 30 + 14 + 7 — and calling in-flight disbursements closed inflates the settled book by 30 events.",
      notes: [
        { choice: 1, why: "shipped is disbursed-in-flight: the stamp landed but the event is not closed. Promoting it to closed adds 29.1 points the branch has not earned." },
        { choice: 2, why: "pending is the 14 YONO digital applications awaiting branch verification — a conversion population, not a closure." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-14",
      prompt: "The premier desk pulls a top-5 holder list with LIMIT 5 and no ORDER BY. Reviewers report different names between nightly runs. Why?",
      choices: [
        "LIMIT without ORDER BY is nondeterministic — the engine returns whichever rows the scan reached first, and scan order shifts between runs",
        "The holders table is being rewritten nightly by the ingest job",
        "LIMIT 5 always returns the five lowest rowids, so the names are stable but wrong",
        "The ladder has ties, so any top-5 list must differ between runs",
      ],
      answer: 0,
      why: "SQL gives no row order without ORDER BY, and LIMIT cuts whatever order the plan produced. The fix is ORDER BY events DESC (with a named tie-breaker) before the LIMIT — reproducibility is a query property, not a data property.",
      notes: [
        { choice: 2, why: "Scan order commonly follows rowid, which is why the bug hides in testing — but nothing in the contract guarantees it, and a plan change reshuffles the list." },
        { choice: 3, why: "Ties make the top-5 cut itself fragile, but with no ORDER BY the instability goes deeper: even untied data can reorder. State the tie-breaker too." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-15",
      prompt: "The coverage report LEFT JOINs statements to settlement legs; the 6 never-settled advices print NULL in the settled column. How do you display them without losing the dunning rows?",
      choices: [
        "COALESCE(SUM(p.amount_cents), 0) — zero-fill the miss so the row survives the fold",
        "INNER JOIN instead — statements without legs are noise",
        "WHERE amount_cents > 0 to hide the empties from the board",
        "Replace NULL with the billed amount — a statement is worth what it claims",
      ],
      answer: 0,
      why: "The NULL payload IS the answer — the six advices no rail ever touched, worth 15,217.00. COALESCE to 0 keeps them on the board at zero settled, which is the honest print that feeds the dunning queue.",
      notes: [
        { choice: 1, why: "The INNER JOIN silently deletes exactly the rows the dunning letter needs — the queue would read clean while 15,217.00 goes unchased." },
        { choice: 3, why: "Substituting the billed amount turns 'never settled' into 'settled' — #28's 1,756.00 paid-status lie would look reconciled. Zero-fill, never fill-from-claims." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-16",
      prompt: "A candidate writes WHERE RANK() OVER (ORDER BY COUNT(*) DESC) <= 5 to keep the top five circles and the engine rejects the query. What is the rule?",
      choices: [
        "Window functions cannot run in WHERE — rank after the fold, then filter in an outer query or CTE",
        "RANK needs a PARTITION BY clause before it is legal anywhere",
        "COUNT(*) inside a window requires GROUP BY, which WHERE forbids",
        "The comparison must be >=, never <=, on ranked columns",
      ],
      answer: 0,
      why: "WHERE evaluates before the fold and before windows are computed, so a window call there is a semantic error, not a style issue. The working shape stages the ranked set in a CTE or derived table and filters rung <= 5 in the outer SELECT.",
      notes: [
        { choice: 1, why: "PARTITION BY is optional — the real defect is the clause placement. Adding one would not make the query legal." },
        { choice: 2, why: "Windows over aggregates are fine in the SELECT of a grouped query. The rejection has nothing to do with COUNT(*) — it is WHERE's position in the pipeline." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-17",
      prompt: "A quarter cut reads created_at BETWEEN '2024-01-01' AND '2024-03-31' and the zonal pack's Q1 mobilization looks light. What is the defect?",
      choices: [
        "Timestamped events on March 31 after midnight fall outside BETWEEN — the honest cut is half-open: >= '2024-01-01' AND < '2024-04-01'",
        "BETWEEN cannot compare TEXT timestamps — the query needs DATE()",
        "The quarter needs 92 days exactly; BETWEEN counts 91",
        "Nothing — BETWEEN is inclusive on both ends and the cut is correct",
      ],
      answer: 0,
      why: "created_at carries a time component, so '2024-03-31' matches only midnight exactly and the last night's draws vanish from the quarter. Month-end is exactly when counters book their heaviest activity — the half-open range is the house rule.",
      notes: [
        { choice: 1, why: "SQLite compares TEXT timestamps lexicographically and BETWEEN works — the defect is the inclusive upper bound, not the function." },
        { choice: 3, why: "Inclusive on both ends is precisely the bug: it reads as safe but drops every event stamped 2024-03-31T00:00:01 onward." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-18",
      prompt: "The priority-sector band reads CASE WHEN unit_price < 50 THEN 'small' WHEN unit_price < 100 THEN 'mid' ELSE 'big' END. A colleague swaps the first two WHEN arms. What changes?",
      choices: [
        "Everything below 100 re-bands: the < 100 arm now fires first, so small-ticket lines report 'mid' and the priority-sector return misstates the book",
        "Nothing — CASE arms are independent and order never matters",
        "Only rows exactly at 50 change bands",
        "The ELSE arm disappears and NULLs appear for big-ticket rows",
      ],
      answer: 0,
      why: "CASE evaluates WHEN arms top-down and fires the first match, so arm order IS the banding. A row at 32.06 matches < 100 first after the swap and reports 'mid' — the 8-line small-ticket book (32.06 average) quietly migrates into the wrong band on a regulator-facing return.",
      notes: [
        { choice: 2, why: "The boundary row is the least of it — every row under 100 moves. Overlapping predicates make arm order load-bearing." },
        { choice: 3, why: "ELSE still catches everything the WHENs miss — the swap leaves ELSE untouched. The damage is silent re-banding, not NULLs." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-19",
      prompt: "A verification list built as customer_id NOT IN (SELECT customer_id FROM staging_slice) returns zero rows even though most holders qualify. First diagnosis?",
      choices: [
        "One NULL customer_id in the staging slice poisons NOT IN — every comparison becomes UNKNOWN and the list empties; rewrite as NOT EXISTS",
        "The staging slice is empty, so NOT IN returns everything by definition",
        "NOT IN requires an index on customer_id to return rows",
        "The outer query needs DISTINCT before the membership test works",
      ],
      answer: 0,
      why: "NOT IN with a NULL in the list can never be true — x NOT IN (1, 2, NULL) is UNKNOWN for every x. The unverified 14 YONO applications are exactly where a NULL holder id would hide, which is why the house pattern is NOT EXISTS: it short-circuits and never trips on NULL.",
      notes: [
        { choice: 1, why: "An empty slice makes NOT IN trivially TRUE for all rows — the opposite symptom. Zero rows with a populated slice points at NULL in the list." },
        { choice: 2, why: "Membership tests do not need indexes to be correct — this is a semantics bug, not a performance one." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-20",
      prompt: "The close pack wants all six never-settled advice numbers folded into ONE cell for the dunning email draft. Which fold does it?",
      choices: [
        "GROUP_CONCAT(i.number) over the anti-join result — one comma-separated cell listing the advices",
        "SUM(i.number) — one number that encodes all six",
        "COUNT(i.number) || ' advices' — a count wearing a list's clothes",
        "MAX(i.number) — the alphabetically-last advice stands for the set",
      ],
      answer: 0,
      why: "GROUP_CONCAT folds a column into one delimited string cell — the roster read. Over the six-row anti-join it prints the dunning list the ops desk copies straight into the email, biggest exposure first if the ORDER BY is already set.",
      notes: [
        { choice: 1, why: "SUM on text ids coerces them to numbers or zero — the 'total' is meaningless and unrecoverable. Lists concatenate; they do not add." },
        { choice: 3, why: "MAX picks one advice and throws away five exposures. The email that quotes only INV-2025-024 misses 10,280.00 of the 15,217.00 queue." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-21",
      prompt: "The circle dashboard's filter reads UPPER(region) = 'EU' and the overnight batch that used to run in seconds now takes minutes. What happened?",
      choices: [
        "Wrapping the column in UPPER() defeats sargability — the planner cannot use a region index and scans the table; compare the column bare",
        "UPPER() is O(n²) on long columns and must be replaced by LOWER()",
        "The index was dropped by the last migration and must be rebuilt",
        "Text comparisons are always slower than numeric ones by an order of magnitude",
      ],
      answer: 0,
      why: "An index stores the column's stored form; a function wrapped around the column hides it from the planner, so every query degrades to a full scan. If casing is unreliable, fix the stored values once (a hygiene pass) or index the expression — never pay the scan on every read.",
      notes: [
        { choice: 1, why: "UPPER and LOWER cost the same per row; the collapse is the lost index seek, not the function's arithmetic." },
        { choice: 3, why: "Text-vs-numeric cost is noise next to scan-versus-seek. The two-orders-of-magnitude gap is the missing index, not the datatype." },
      ],
      difficulty: "medium",
    },
    {
      id: "sbi-mcq-22",
      prompt: "Set algebra on the statement book: which EXCEPT direction isolates the paid-status advice that carries zero settlement legs (#28, 1,756.00)?",
      choices: [
        "paid_claims EXCEPT statements_with_legs — claims on the left that no rail ever evidenced on the right",
        "statements_with_legs EXCEPT paid_claims — legs on the left that no claim ever covered",
        "paid_claims INTERSECT statements_with_legs — the claims that settled",
        "The direction does not matter; EXCEPT is symmetric",
      ],
      answer: 0,
      why: "EXCEPT keeps left-side rows absent from the right. Claims EXCEPT evidence is the no-evidence queue — #28 surfaces exactly, because its paid label has no leg behind it. The reverse direction returns reconciled legs without matching claims (the void-but-settled #11) — the mirror anomaly.",
      notes: [
        { choice: 1, why: "Legs EXCEPT claims returns the opposite population: rail evidence behind a non-paid label — #11's 925.00. Both directions are useful; only one is the dunning queue." },
        { choice: 2, why: "INTERSECT returns claims WITH legs — the honest settled core. It can never surface a no-leg claim by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-23",
      prompt: "Circle mean tickets: EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. Their average is 364.67, but the platform mean ticket is 338.19. Why do both numbers exist?",
      choices: [
        "The average-of-averages weights each circle equally; the platform mean weights each event — they diverge whenever circle sizes differ (45 events versus 2)",
        "The platform mean is stale — 364.67 is the corrected figure",
        "One of the circle averages is miscomputed and the true mean sits between them",
        "Rounding drift accumulated across the four divisions",
      ],
      answer: 0,
      why: "AVG of circle AVGs is a different statistic: LATAM's 426.22 on two events counts as much as EU's 335.32 on forty-five. The platform mean folds all 103 events once — 338.19 — and it is the number the ticket-band analysis keys off. Name the denominator before quoting either.",
      notes: [
        { choice: 1, why: "Neither number is wrong — they answer different questions. Replacing the weighted mean with the unweighted one flatters the book by 26.48." },
        { choice: 3, why: "The gap is 26.48 — far too large for double-precision drift. It is a weighting difference, visible in any spreadsheet." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-24",
      prompt: "NTILE(4) runs over the 16-holder ladder ordered by events DESC. The ladder carries a four-way tie at 4 events. What prints at the quartile boundary?",
      choices: [
        "The tied block splits across buckets — three of the 4-event holders land in quartile 2 and one in quartile 3, so peers read in different tiers",
        "All four tied holders share a quartile because NTILE respects ties",
        "The query errors — NTILE cannot run over tied order keys",
        "The tie stretches quartile 2 to six rows and quartile 3 shrinks to none",
      ],
      answer: 0,
      why: "NTILE assigns buckets by row position, not by value ties — with 16 rows it deals 4 per quartile, and the tie block straddles the 8/9 boundary. Peer holders end up in different tiers, which is why tier reporting at SBI prefers explicit CASE bands with fixed edges over NTILE when ties matter.",
      notes: [
        { choice: 1, why: "That is DENSE_RANK-style thinking — NTILE has no tie semantics at all. Probing the ladder confirms the 4-event block splits three-and-one." },
        { choice: 3, why: "NTILE's bucket sizes are fixed by the row count — 4/4/4/4 for 16 rows. Ties shift membership, never bucket sizes." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-25",
      prompt: "The settlement desk hunts split-rail statements by self-joining payments to itself. Every pair prints twice and every leg pairs with itself. What fixes it?",
      choices: [
        "Join on a.id < b.id — the strict inequality pairs each leg once, never with itself",
        "Add DISTINCT to the SELECT — duplicates are the engine's fault",
        "GROUP BY a.invoice_id after the join — folding hides the double count",
        "Join on a.id <> b.id — excluding equality is enough",
      ],
      answer: 0,
      why: "A self-join produces every ordered pair: (x, y) and (y, x) both appear, plus (x, x). The strict < keeps exactly one of each unordered pair — the canonical pair-once shape behind the five dual-rail statements this book carries.",
      notes: [
        { choice: 1, why: "DISTINCT dedupes identical output rows, but (x, y) and (y, x) differ as rows — DISTINCT cannot see the symmetry. Only the ordered inequality removes it." },
        { choice: 3, why: "<> removes self-pairs but keeps both orderings — the double count survives. The direction of the inequality is the whole fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-26",
      prompt: "The premier list re-runs nightly and the four holders tied at 4 events swap positions between runs. What makes the ladder reproducible?",
      choices: [
        "A named, deterministic tie-breaker — ORDER BY events DESC, lifetime DESC, holder id — published with the list so peers order the same way every run",
        "ROW_NUMBER instead of RANK — numbering the rows fixes the order",
        "An index on events — indexes force row order on output",
        "Sorting in the application layer after the query returns",
      ],
      answer: 0,
      why: "Ties leave the order within the tie block undefined, so the engine's scan order decides it — and that shifts with plans and statistics. A published tie-breaker keyed on stable columns (lifetime, then id) makes the list reproducible, and the policy comment is what the review defends.",
      notes: [
        { choice: 1, why: "ROW_NUMBER numbers the rows but does not say WHICH row gets which number — the arbitrary split remains, now hidden behind clean integers." },
        { choice: 3, why: "Sorting in the app moves the arbitrariness out of SQL without removing it — and now two layers must agree on the rule. One ORDER BY, stated in the query, is the audit artifact." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-27",
      prompt: "A staging slice holds exactly ONE event and feeds WHERE total > (SELECT AVG(total) FROM staging_slice). The report returns zero rows. Bug or truth?",
      choices: [
        "Truth — one row's total can never strictly exceed its own average, so a one-row slice always returns empty under >",
        "Bug — the scalar subquery returned NULL and emptied the report",
        "Bug — AVG over one row is undefined and poisoned the comparison",
        "Truth — the slice's event is cancelled, and cancelled events compare as zero",
      ],
      answer: 0,
      why: "The mean of a single value is that value, and x > x is false — the empty result is arithmetically correct. The diagnosis matters at SBI because verification targeting stages one circle or one status at a time, and a one-event slice is exactly where an above-average screen goes legitimately blank.",
      notes: [
        { choice: 1, why: "The empty-inner NULL trap empties a populated slice too — but here the inner fold returned one row and one value. Different failure, different lesson: check the inner row count before either diagnosis." },
        { choice: 3, why: "Cancelled events carry real totals on this book — 1,152.49 across the 7. Status has nothing to do with a mean-of-one." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-28",
      prompt: "Concentration reads 63.5% of the 34,833.28 book riding holders above 3,000 lifetime. Which window shape computes the cumulative-share ladder behind that number?",
      choices: [
        "SUM(SUM(total)) OVER (ORDER BY lifetime DESC) / SUM(SUM(total)) OVER () — running fold over the ladder divided by the grand fold",
        "AVG(total) OVER (ORDER BY lifetime DESC) — the moving mean carries the share",
        "PERCENT_RANK() OVER (ORDER BY lifetime) — the percentile IS the share",
        "ROW_NUMBER() OVER (ORDER BY lifetime DESC) divided by COUNT(*) — position over population",
      ],
      answer: 0,
      why: "A share needs money over money: the running SUM of per-holder totals over the grand total, computed in one pass with two windows. Ordered by lifetime DESC, the row where the running share crosses 63.5% is exactly the 3,000 line the premier desk quotes.",
      notes: [
        { choice: 2, why: "PERCENT_RANK returns a row's relative POSITION (0 to 1), not the share of value it carries. The two coincide only when every holder books the same lifetime." },
        { choice: 3, why: "Row position over population is the head-count concentration — a different lens. The 63.5% is a money share, and money concentrates harder than head-count here." },
      ],
      difficulty: "hard",
    },
    {
      id: "sbi-mcq-29",
      prompt: "The SKU master carries 16 deposit/lending products. Which fold counts the distinct scheme families behind them, and what does it return on this book?",
      choices: [
        "COUNT(DISTINCT category) — 7 families from Electronics to Fitness",
        "COUNT(category) — 7, because categories never repeat",
        "COUNT(*) / COUNT(DISTINCT category) — 2.29 families per SKU",
        "SUM(DISTINCT category) — a numeric fold over the family codes",
      ],
      answer: 0,
      why: "COUNT(DISTINCT category) folds the 16 SKUs to their distinct families — 7 on this book — which is the cross-sell census's column count. COUNT(category) counts rows (16), not families; the distinction is the same two-grain discipline the circle census drills.",
      notes: [
        { choice: 1, why: "16 SKUs share 7 families, so COUNT(category) reads 16. The distinct fold is what makes the holder-by-family grid square up." },
        { choice: 3, why: "SUM over category codes adds labels together — a number with no meaning. Family counts are DISTINCT counts, full stop." },
      ],
      difficulty: "easy",
    },
    {
      id: "sbi-mcq-30",
      prompt: "A one-pass fate census adds a fifth arm — COUNT(*) FILTER (WHERE status = 'disbursing') — for a status the stage map does not carry. What does the column print, and what is the fix?",
      choices: [
        "Zero for every circle — a status literal that matches nothing folds to a silent 0; the fix is deleting the arm or mapping it to a real status",
        "NULL for every circle — FILTER returns NULL when no rows match",
        "A syntax error — FILTER cannot compare against a missing status",
        "The full 103 — FILTER ignores its WHERE when the status is unknown",
      ],
      answer: 0,
      why: "'disbursing' is not a status on this book — the stored values are delivered / shipped / pending / cancelled — so the FILTER arm counts zero rows everywhere and the census still reconciles to 103, hiding the dead column. The missing-arm lesson generalizes: every CASE or FILTER arm must be checked against the actual value domain, not the slide's vocabulary.",
      notes: [
        { choice: 1, why: "COUNT never returns NULL — it returns 0 on an empty match set. The silent zero is precisely why the dead arm survives review." },
        { choice: 3, why: "FILTER's WHERE is a real predicate — an unmatched status counts nothing. A census that still foots to 103 with a dead arm is the dangerous kind of wrong." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-sbi-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The premier-desk ladder",
      brief:
        "SBI-flavored brief on the storefront db: the zonal staffing review ranks every account holder by events booked, because the premier desk's call list is staffed off one ladder and the tie policy is a published rule. Probed facts: the 103 events fold into 16 holders and the ladder reads 24, 17, 14, 13, 5 — Alice Chen 24 events booking 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56, Chloe Dubois 5 / 2,667.93 — then a FOUR-way tie at 4 events (Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi 985.65, Noah Meyer 737.68) and two holders at 3 (Farid Nasser 1,458.97, Hiro Tanaka 829.09). The desk's published policy is RANK with gaps: the tie holds rung 6 four times and the next distinct count lands on rung 10, not 7 — peer holders get peer rungs, and the gap is the honest cost of the tie. The floor is 3-plus events so the tie block and the gap both stay on the board; the review reads biggest event count first.",
      ask: "Return each holder carrying at least three account events with circle, event count, lifetime value to 2 decimals and a RANK-semantics ladder rung, biggest event count first, deepest book breaking ties.",
      template:
        "WITH ladder AS (\n  SELECT c.name AS holder,\n         c.region AS circle,\n         COUNT(o.id) AS events,\n         ROUND(SUM(o.total), 2) AS lifetime\n  FROM orders o\n  JOIN customers c ON c.id = o.{1}\n  GROUP BY c.id\n)\nSELECT holder,\n       circle,\n       events,\n       lifetime,\n       {2}() OVER (ORDER BY events DESC) AS rung\nFROM ladder\nWHERE events >= {3}\nORDER BY events DESC, lifetime {4};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the ladder join key",
          why: "The ladder rides o.customer_id = c.id — every event attaches to the holder that booked it, all 103 survive the join, and GROUP BY c.id gives one row per holder. c.name would compare an integer FK against text and match nothing: the ladder empties before the first rung is dealt.",
        },
        {
          answer: "RANK",
          kind: "keyword",
          label: "the gap-preserving policy",
          why: "The desk's published policy is RANK with gaps: after the four-way tie at rung 6 the next distinct count (3) lands on rung 10 — the tie costs three rungs, and the 10-vs-7 gap is the visible policy. ROW_NUMBER hands the tie an arbitrary 6-7-8-9; DENSE_RANK compresses the tail to 7; neither is the ladder the review ships.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the ladder floor",
          why: "The floor keeps every rung the policy debate needs — the four-way tie at 4 AND the two 3-event holders whose rows expose the gap. Raise the floor to 4 and both rank policies agree on the survivors: the gap vanishes and the tie policy looks like a non-issue exactly when it should be argued.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the tie display order",
          why: "Within the tie block the display order is lifetime: Pedro Alvarez 1,686.17, Keiko Sato 1,098.60, Isabella Rossi 985.65, Noah Meyer 737.68. ASC flips the block and the desk calls Noah first — a shared rung with an arbitrary call order, which is precisely what the published policy exists to prevent.",
        },
      ],
      distractors: ["4", "DENSE_RANK", "ROW_NUMBER", "name", "13"],
      walkthrough:
        "Fold events per holder first, then rank once. The ladder CTE joins events to holders and groups by holder: 16 holders, 103 events, with ROUND(SUM(o.total), 2) carrying lifetime beside the count — Alice Chen 24 / 7,262.35 down to Olivia Brown 1 / 444.80. The floor WHERE events >= 3 keeps 11 of the 16 holders, deliberately including the two 3-event rows: they are the whole tie-policy lesson, because RANK and DENSE_RANK only disagree when a gap follows a tie. The window shares one ORDER BY events DESC with the outer sort, so the board reads deterministically: rungs 1 through 5, then the four-way tie at rung 6 (6, 6, 6, 6), then rung 10 twice — RANK's gap in the open where the staffing argument can see it. The distractors each break differently: 4 in the floor slot keeps 9 rows and hides the gap so the tie looks costless; DENSE_RANK compresses the next rung to 7 and quietly promotes the 3-event tail; ROW_NUMBER splits peer holders arbitrarily by scan order; name in the join key matches an integer FK against text and empties the ladder; 13 floors the board to three rows. One fold, one policy, one stated floor — and the rung the tie costs is the number the desk publishes.",
    },
    {
      id: "cs-sbi-4",
      tier: "easy",
      topic: "x2",
      universe: "month-close",
      title: "The one-pass circle fate census",
      brief:
        "SBI-flavored brief on the storefront db: finance control opens every close with the circle fate census — drawn-and-closed, disbursing, awaiting verification and withdrawn per circle in ONE scan, because four sequential queries are four ways to drift off the 103 identity. Probed facts: the census reads EU 45 events (24 drawn / 12 disbursing / 6 awaiting / 3 withdrawn, kept value 6,656.18, share 53.3), APAC 37 (21 / 8 / 5 / 3, kept 6,617.68, share 56.8), US 19 (5 / 10 / 3 / 1, kept 1,444.77, share 26.3) and LATAM 2 (both drawn, value 852.44, share 100.0). Platform-wide the arms reconcile 52 + 30 + 14 + 7 = 103 by construction — a census that breaks that identity is the day's first incident. The board reads biggest circle first, and the US row is the one ops circles: only 26.3 percent drawn, with 10 of 19 events still disbursing.",
      ask: "Return each circle with its event count, drawn / disbursing / awaiting / withdrawn counts, kept value to 2 decimals and kept share of the circle to 1 decimal, biggest circle first.",
      template:
        "WITH census AS (\n  SELECT c.region AS circle,\n         COUNT(*) AS events,\n         COUNT(*) FILTER (WHERE o.status = {1}) AS drawn,\n         COUNT(*) FILTER (WHERE o.status = {2}) AS disbursing,\n         COUNT(*) FILTER (WHERE o.status = 'pending') AS awaiting,\n         COUNT(*) FILTER (WHERE o.status = 'cancelled') AS withdrawn,\n         ROUND(SUM(o.total) FILTER (WHERE o.status = 'delivered'), 2) AS kept_value\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT circle,\n       events,\n       drawn,\n       disbursing,\n       awaiting,\n       withdrawn,\n       kept_value,\n       ROUND({3} * drawn / events, 1) AS kept_share\nFROM census\nORDER BY events {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the drawn-and-closed literal",
          why: "'Drawn-and-closed' is the status-filtered conditional count: o.status = 'delivered', the 52 completed events. 'drawn' itself is not a status on the book — the FILTER would silently count zero — and 'shipped' would label in-flight disbursements as money landed.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the disbursing literal",
          why: "Disbursing is the 'shipped' branch — 30 events platform-wide with shipped_at as the disbursement stamp — never the 'cancelled' arm, which is the 7 withdrawn applications. Swap them and the board reports withdrawn applications as cash that moved.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the percent multiplier",
          why: "Shares print as percent: 100.0 * drawn / events gives EU 53.3 and LATAM its full 100.0 on a two-event denominator. Drop the multiplier and the board prints fractions (0.533) nobody can reconcile against the quoted 52-of-103 closed rate — and with integer flags the division truncates before it scales.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-circle-first direction",
          why: "The board reads EU 45, APAC 37, US 19, LATAM 2 — biggest circle first, the US row third where ops circles the 26.3 percent. ASC buries the US under LATAM's confident-looking 100.0, a two-event denominator that flatters to deceive.",
        },
      ],
      distractors: ["pending", "10.0", "ASC", "cancelled"],
      walkthrough:
        "One scan, four FILTER branches, one identity. The census CTE groups all 103 events by circle and counts each fate branch in the same pass: COUNT(*) FILTER (WHERE o.status = 'delivered') is drawn, 'shipped' is disbursing, 'pending' is awaiting verification, 'cancelled' is withdrawn — EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0. Add each circle's branches and you get 45, 37, 19, 2; add the circles and you get 103 — the reconciliation is by construction, which is why the close ships this query and not four sequels. The outer SELECT carries the money and the rate: kept_value sums event total only over the delivered branch (EU 6,656.18 / APAC 6,617.68 / US 1,444.77 / LATAM 852.44), and kept_share divides drawn by the circle's own event count, times 100.0, rounded to one decimal: 53.3, 56.8, 26.3, 100.0. The story the board tells: LATAM's 100.0 is a two-event denominator, the US 26.3 is the real operational fire with 10 of 19 events still disbursing, and APAC quietly closes more than the EU. The distractors each corrupt a different branch: 'pending' in the drawn slot zeroes every circle's closed count; 'cancelled' in the disbursing slot rewrites withdrawn applications as cash in the circle; 10.0 in the multiplier prints 5.3 and 10.0 where 53.3 and 100.0 belong; ASC flips the board and hides the US row under the LATAM flatterer. Census in one pass, denominators out loud, 103 or it does not ship.",
    },
    {
      id: "cs-sbi-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-settled advices",
      brief:
        "SBI-flavored brief on the storefront db: before any reminder letter fires, finance control refreshes its anti-join — statements that NO settlement rail ever touched, YONO digital or branch/NEFT alike. Probed facts: exactly 6 statements worth 15,217.00 in total have zero settlement legs — INV-2025-024 Emma Wilson US open 4,937.00 (the biggest exposure), INV-2025-026 Liam O'Brien EU open 3,562.00, INV-2025-027 Isabella Rossi EU open 2,794.00, INV-2025-028 Hiro Tanaka APAC paid 1,756.00, INV-2024-021 Chloe Dubois EU open 1,295.00 and INV-2024-018 Pedro Alvarez EU open 873.00 (the oldest). The queue reads biggest owed first. Two facts get walked line by line in every review: #28 is paid-STATUS with zero legs — a status that lies — and the EU circle carries four of the six, so the reminder batch starts there. Statements that DO carry a leg (even the void advice at 925.00) are reconciliations, not dunning.",
      ask: "Return each never-settled statement with its number, holder, circle, status, issue date and owed amount in rupees to 2 decimals, biggest owed first.",
      template:
        "SELECT i.number AS advice,\n       c.name AS holder,\n       c.region AS circle,\n       i.status AS claim,\n       i.issued_on,\n       ROUND(i.amount_cents / {4}, 2) AS owed\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nLEFT JOIN payments p ON p.invoice_id = {1}\nWHERE p.id {2} {3}\nORDER BY owed DESC;",
      slots: [
        {
          answer: "i.id",
          kind: "keyword",
          label: "the anti-join key",
          why: "The LEFT JOIN must ride the statement's own id: ON p.invoice_id = i.id keeps every statement and attaches its legs, leaving NULL payloads where no rail ever touched. p.invoice_id = p.invoice_id compares a leg to itself — always true — and the WHERE below then empties the queue of every row it was built for.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the unmatched test",
          why: "Unmatched legs leave p.id NULL, and NULL needs the IS test: p.id IS NULL selects exactly the never-settled rows. p.id = NULL evaluates to NULL for every row — even the ones you want — and the queue silently empties to zero rows.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the no-leg marker",
          why: "The anti-join's answer set is the NULL payload from the LEFT JOIN — statements with zero settlement legs. NOT NULL here flips to the opposite queue: every statement a rail HAS touched, the reconciliation list including the void-but-settled advice, not the dunning list.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divisor",
          noVerify: true,
          why: "Statements carry INTEGER paise-cents — the house read is amount_cents / 100.0, printing Emma Wilson's 493,700 cents as 4,937.00. Divide by 10.0 and every figure inflates tenfold; the reminder letter quotes 49,370.00 and the batch stops reconciling with the 15,217.00 queue total.",
        },
      ],
      distractors: ["NOT NULL", "=", "p.invoice_id", "10.0"],
      walkthrough:
        "A LEFT JOIN anti-join, then a cents-safe fold. Join statements to holders INNER — every statement has an owner — then LEFT JOIN payments ON p.invoice_id = i.id: statements with legs carry their payment rows, the never-settled six carry NULL payloads, and WHERE p.id IS NULL keeps exactly those. Six statements survive, biggest first because the ORDER BY owed DESC is hardcoded: Emma Wilson's INV-2025-024 at 4,937.00 opens the batch, down to Pedro Alvarez's 873.00, the oldest exposure. The pad is INTEGER paise-cents, so owed = ROUND(amount_cents / 100.0, 2) — 493,700 cents prints 4,937.00, 87,300 prints 873.00, and the six rows cross-foot to 15,217.00, the number finance control quotes in every review. The rows that make it interesting: INV-2025-028 is paid-STATUS with zero legs — a status that lies, so dunning proceeds on legs, not labels; and the EU circle holds four of the six (3,562.00 + 2,794.00 + 1,295.00 + 873.00), which is where the batch starts. The distractors each break differently: p.invoice_id in the key slot compares a leg to itself, the join matches everything, and the IS NULL filter empties the queue; = in the test slot turns the WHERE into p.id = NULL, which is NULL for every row — the classic anti-join kill; NOT NULL in the marker slot flips to the settled list, the void-but-settled advice included; 10.0 in the divisor inflates every figure tenfold and breaks the 15,217.00 cross-foot. LEFT JOIN for coverage, IS NULL for the miss, cents over one hundred, biggest first — that is the reminder refresh.",
    },
    {
      id: "cs-sbi-6",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "Verification targeting: the above-cadence bench",
      brief:
        "SBI-flavored brief on the storefront db: the verification desk does not chase all 16 holders equally — it stages the per-holder fold, computes the network cadence once, and chases only the holders running above it. Probed facts: events per holder average 6.44 (103 events over 16 holders), and exactly FOUR holders clear that line — Alice Chen 24 events / 7,262.35, Emma Wilson 17 / 6,640.56, Grace Kim 14 / 4,574.23, Maya Patel 13 / 3,644.56. The next holder down is Chloe Dubois at 5 events / 2,667.93 — comfortably below the line, which is what makes the cut a census and not a vibe. The bench prints its own threshold in every row (a scalar subquery over the staged fold) so the reviewer can see the bar beside every survivor, deepest book first.",
      ask: "Return each holder above the network cadence with circle, event count, lifetime value to 2 decimals and the 6.44 cadence printed beside every row, biggest event count first.",
      template:
        "WITH per_holder AS (\n  SELECT c.name AS holder,\n         c.region AS circle,\n         COUNT(o.id) AS events,\n         ROUND(SUM(o.total), 2) AS lifetime\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.{1}\n  GROUP BY c.id\n)\nSELECT holder,\n       circle,\n       events,\n       lifetime,\n       (SELECT ROUND({2}(events), 2) FROM per_holder) AS network_cadence\nFROM per_holder\nWHERE events > {3}\nORDER BY events {4}, lifetime DESC;",
      slots: [
        {
          answer: "id",
          kind: "keyword",
          label: "the fold join key",
          why: "The fold rides o.customer_id = c.id — events attach to the holder that booked them and GROUP BY c.id stages one row per holder. Comparing the FK to c.name matches an integer against text: the staged fold comes back empty and the bench prints nothing while looking valid.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the cadence fold",
          why: "The network cadence is AVG(events) over the staged fold — 103 events across 16 holders, 6.44. SUM prints 103.0 (the whole book as a 'cadence'), MAX prints 24.0 (Alice's own count as the bar) — every survivor would clear a bar that means nothing.",
        },
        {
          answer: "6.44",
          kind: "number",
          label: "the cadence cut",
          why: "The cut is the mean itself: 6.44 sits above Chloe Dubois's 5 and below Maya Patel's 13, so exactly four holders survive — Alice 24, Emma 17, Grace 14, Maya 13. Threshold 13 drops Maya and the bench under-covers; 3 floods it with the 4-event tie block the desk has no capacity for.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-bench-first direction",
          why: "The desk works the bench biggest first: Alice 24 events, then Emma 17, Grace 14, Maya 13 — lifetime DESC breaks nothing today because the event order already orders the money. ASC opens the queue on Maya and reads like a different bank's priorities.",
        },
      ],
      distractors: ["name", "SUM", "13", "3", "ASC"],
      walkthrough:
        "Stage the fold once, then compare every row to a mean computed once. The per_holder CTE joins all 103 events to their holders and groups to 16 rows — events and lifetime side by side, Alice Chen 24 / 7,262.35 down to Olivia Brown 1 / 444.80. The scalar subquery (SELECT ROUND(AVG(events), 2) FROM per_holder) prints 6.44 beside every row — the bar lives IN the output, so no reviewer has to ask what the cut was. WHERE events > 6.44 keeps exactly four rows: Alice 24, Emma 17, Grace 14, Maya 13 — the same four the concentration read calls the 3,000-plus cohort, which is the cross-check that makes the bench credible. The distractors each break differently: name in the join key matches an integer FK against text and empties the staged fold; SUM as the cadence prints 103.0, a bar nobody fails; MAX prints 24.0 and the bench reduces to Alice alone; 13 as the cut drops Maya and the desk under-covers the very holder it exists for; 3 floods the bench with the 4-event tie block; ASC inverts the worklist. Stage once, print the bar, chase four — verification targeting is a derived table with its denominator worn on its sleeve.",
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
    { slug: "expected-credit-loss", why: "Provisioning folds over the statement book: exposure bucketed by stage with a weighted loss fold. The NPA-return shape the branch credit review ships every quarter, in cents-safe SQL." },
    { slug: "delinquency-roll-rates", why: "Bucket-to-bucket migration: open statements aging from current into 30-plus. Roll rates are how the branch worklist proves the book is healing — or isn't — month over month." },
    { slug: "loan-amortization-schedule", why: "EMI schedules per retail draw: interest and principal split by month over INTEGER cents. The priority-sector return's supporting schedule is exactly this query." },
    { slug: "daily-balance-interest", why: "Interest accrues on daily balances — the per-day fold with the /100.0 rule, run over the same month spine the zonal review opens with. One odd cent and the accrual stops footing." },
    { slug: "credit-utilization-bands", why: "CASE-banded utilization with fixed edges — the headroom read the branch manager quotes before any new draw is sanctioned. A hole in the band is a hole in the return." },
    { slug: "ar-aging-schedule", why: "The 15,217.00 never-settled queue aged into 30/60/90 buckets over due dates. This is the dunning letter's spine — the aging fold the branch collection desk re-runs weekly." },
    { slug: "settlement-fails-aging", why: "Legs that missed their value date age into fails buckets over shipped_at — T+2 style aging behind the 2.98-day disbursement clock the branch network is judged on." },
    { slug: "suspicious-bank-account-transactions", why: "Burst patterns in settlement legs — two legs on one statement is the dual-rail signature, and sliding-window burst logic is how the sweep generalizes across the rails." },
    { slug: "top-percentile-fraud", why: "Draw anomalies concentrate in the tail: the 1,088.44-to-25.47 spread means percentile screens, not averages, are how the desk hunts suspicious bookings." },
    { slug: "portfolio-concentration-hhi", why: "A concentration index over the 34,833.28 book: 63.5% rides the 3,000-plus cohort, and HHI turns that story into one defensible number the zonal review can trend." },
    { slug: "immediate-food-delivery-iii", why: "The third stage of the service read: late versus on-time per customer preference — the escalation cut the branch runs when the 2.98-day clock drifts past tolerance." },
    { slug: "customers-who-never-order", why: "The never-drawn holder anti-join. On this db the answer is a confident zero — all 16 holders appear in the event table — and proving that zero is the KYC-follow-up exercise itself." },
    { slug: "journal-gap-detection", why: "Missing entry ids in the 80-entry GL break the 181,080-against-181,080 tie. Gap detection is how a half-loaded batch gets caught before the close ships." },
    { slug: "vintage-default-curves", why: "Draws booked in the same quarter tracked as one cohort over the months that follow — the agricultural-lending view of the book, read on the same 14-month spine." },
    { slug: "dormant-reactivation", why: "Holders whose last event aged past the season — the whitespace census that decides which circle gets the reactivation visit instead of a new-branch budget." },
    { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "Consecutive-day activity streaks: the YONO engagement read the digital team pulls before any verification-capacity decision. Window math over event timestamps." },
  ],
};
