// Intercom — Wave-11 (Task 102), saas domain, no tagged pool — theme-curated; facts from scripts/company-facts.md.
// Customer-messaging SQL: the storefront db read as a resolution-funnel sandbox — customers are workspace
// accounts (region = market buckets), orders are conversation-billed periods (delivered = resolved 52,
// shipped = served in flight with shipped_at as the queue-clear stamp 30, pending = open, no stamp yet 14,
// cancelled = closed without resolution 7), order_items are seat/usage line records (quantity = seats,
// unit_price = per-seat rate), products = plan SKUs (essential/advanced/expert plus the Fin resolution
// meter; db category codes = SKU families), suppliers = integration/marketplace partners, invoices =
// subscription statements, payments = payment rails (card = self-serve, wire = enterprise-invoiced),
// expenses = platform opex, ledger_entries = GL. Finance tables store INTEGER cents (dollar read =
// amount_cents / 100.0); orders.total and order_items.unit_price are REAL dollars. Angle kept DISTINCT
// from zendesk (human-agent SLA ticketing) and gong (revenue intelligence): the open→served→resolved
// funnel as conditional counts, the two-base resolution rate (50.5 over the booked base vs 63.4 over the
// served base), Fin AI containment and the Fin-first-vs-expert seat-band mix. Pool provenance:
// company-pools.md carries NO Intercom section (0 tagged rows) — all 10 topic slug sets and all 16
// problems are theme-curated from the theme menu's sql rows (no w*/d*/f* rows) and say so in brief P4.
// Case briefs quote probed figures from scripts/company-facts.md (canonicalized wave-8+9 cells included);
// probe-derived cells — 63.4 = 52/82 served-base rate, band shares 53.8/46.2, band line counts 133/118 —
// were probed read-only against db/custom.db and are mechanically verified per slot by scripts/case-audit.ts.
// NOTE for the wave-11 registry wiring agent: intercom is NOT yet in registry COMPANY_META — wire id
// "intercom", domainId "saas", name "Intercom", tagline "Customer messaging SQL: resolution funnels,
// Fin containment, honest denominators", accent "text-blue-500" to match this header exactly.

import type { CompanyKit } from "../types";

export const intercomKit: CompanyKit = {
  id: "intercom",
  domainId: "saas",
  name: "Intercom",
  tagline: "Customer messaging SQL: resolution funnels, Fin containment, honest denominators",
  accent: "text-blue-500",

  brief: [
    "**Intercom** is the customer-messaging platform that turned support from a ticket queue into a conversation — the Messenger in the corner of the page, the Fin AI agent resolving whole conversations without a human, and an outbound engine that messages customers before they ask. Monetization is per seat across essential, advanced and expert plans plus a per-resolution meter on Fin, so every growth number in the building is a conditional count over the same small object set. This kit maps the storefront db onto that world: the 16 customers rows are workspace accounts, the 103 orders are **conversation-billed periods** worth 34,833.28, and the 251 order_items rows are seat/usage lines — quantity = seats, unit_price = per-seat rate. The resolution-fate map is fixed: delivered = {emerald:resolved} (52, 50.5%), shipped = served and in flight (30, 29.1%), pending = {amber:open, nobody home yet} (14, 13.6%), cancelled = {rose:closed without resolution} (7, 6.8%).",
    "The data org splits into support ops, growth and a small finance pod, and they argue about one thing more than any other: the denominator. A conversation opens at created_at and clears the queue when its stamp lands — **82 of 103 periods** carry the shipped_at stamp (79.6% queue-clear coverage), averaging **2.98 days** open-to-clear with a 2–4 day spread, while the 14 open conversations have none yet — a population definition, not a cleanup job. That single stamp splits the headline rate in two: 52 resolutions over ALL booked conversations reads **50.5%**, but over the 82 that actually cleared the queue it reads *63.4%* — and which one a dashboard shows decides whether the open queue looks like a backlog or a rounding error. Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`.",
    "Interview screens are census-then-denominator with a resolution-funnel accent. A typical loop opens with a **two-grain workspace census** — EU runs 45 periods from just 8 workspaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the base out loud (*'do the never-served conversations stay in your resolution rate?'*), then into the containment read where four workspaces sit tied at 4 periods and rank semantics become a policy call about peer accounts. Late rounds walk the {sky:14-month period spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or band seats into Fin-first versus expert arms with CASE and probe the arm that silently swallows rows. Candidates who state the stamp filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Intercom section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: resolution funnels, two-grain censuses, queue-clear clocks, denominator discipline, CASE seat bands and the cents-safe billing spine. Do the topics in order, then run the **six case studies** on the live storefront db — built for spaced practice rather than one sitting: the {violet:resolution-fate census} support ops opens Monday with, the {emerald:Fin-first seat bands} the pricing pod re-cuts every cycle, the containment leaderboard and market fate grid the reviews argue over, the dunning queue finance chases at close, and the above-cadence bench growth quotes. Run each, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the base and the stamp filter before you compute anything* — then make every fate count reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the queue-clear refresh. A support-ops analyst opens the resolution dashboard before standup: did overnight stamps land, does any conversation clear the queue without an owning workspace, does the one-pass fate census reconcile — 14 open + 30 in flight + 52 resolved + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the **2.98-day** open-to-clear average drifts — the US already runs 3.07 against APAC's 2.93 — the open queue (14 conversations nobody has touched) gets pulled before the containment report ships.",
    "**11:30 —** Midday is the denominator fight. The exec deck wants the headline resolution rate and the analyst has to defend the base on the slide — **50.5 over everything booked** versus 63.4 over the 82 queue-clearers — because *a rate without its base is a lie the reviewer catches*. A regional VP wants the two-grain census re-cut (EU 45-from-8 versus US 19-from-2); the pricing pod wants the seat bands — **268 Fin-first seats at 31.01** against 230 expert seats at 115.85 — to argue where containment actually lives; a manager wants the leaderboard's four-way tie at 4 handled honestly. Each ask is a join, a conditional aggregate and one judgment call about statuses.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected statements worth 15,217.00**, one of them (#28, 1,756.00) claiming paid with zero settlement legs — before billing sends a single dunning email; the void-but-settled mirror (#11, 925.00) goes to finance as a matching anomaly. Then the rail split reads card legs (16, 37,364.00) self-serve against wire legs (11, 32,248.00) enterprise-invoiced, with 5 cycles settling on both. The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Resolution rate (booked base)", what: "Resolved conversations over ALL periods booked: 52 of 103 = 50.5%. The denominator is the interview — the 14 open and 7 abandoned stay in, because 'not yet resolved' is exactly what the metric watches." },
    { name: "Resolution rate (served base)", what: "The same 52 resolutions over the 82 periods that cleared the queue = 63.4%. The 12.9-point gap between the two bases is the whole denominator argument — dashboards that don't name their base get caught in review." },
    { name: "Queue-clear coverage", what: "Stamped periods over ALL booked: 82 of 103 (79.6%). COUNT(shipped_at) beside COUNT(*) IS the report — the gap of 21 splits into 14 open conversations and 7 closed without resolution." },
    { name: "Time-to-resolution", what: "Days from open to queue-clear stamp over stamped rows only: 82 periods, 2.98-day average, 2–4 spread. Regional cut: EU 36 at 2.94, APAC 29 at 2.93, US 15 at 3.07, LATAM 2 at 3.5 — the drift map that routes the Fin-escalation queue." },
    { name: "Open-queue census", what: "14 pending periods (13.6%) — conversations opened, never stamped, still in every funnel denominator. The Fin-first auto-responder's inbox, and the population definition the time-to-resolution report must state." },
    { name: "Abandonment share", what: "Closed without resolution over booked: 7 of 103 (6.8%) — EU 3 (6.7%), APAC 3 (8.1%), US 1 (5.3%), LATAM 0. The premature-exit tax; dropped from the served-base rate but kept in the booked-base rate by design." },
    { name: "Fin-first seat mix", what: "The pricing pod's containment proxy: 268 seats ride sub-55 line rates (31.01 average) against 230 expert-tier seats (115.85) — 53.8% of the 498-seat book. One CASE fold, and the first chart re-cut every cycle." },
    { name: "Workspace intensity", what: "Periods AND workspaces per market — EU 45 from 8 (5.6), APAC 37 from 5 (7.4), US 19 from 2 (9.5), LATAM 2 from 1 — with 63.5% of billed value sitting above the 3,000 lifetime line. Load versus installed base in one query." },
  ],

  topics: [
    {
      name: "Resolution funnels & stage rates",
      why: "The fate map — open, served-in-flight, resolved, closed-without-resolution — is one CASE away in every dashboard, and each stage is a conditional count over a status or timestamp. The trap is calling a served period 'resolved' — 30 versus 52 on this db — and the second trap is the base: the never-served stay in a booked-base rate (50.5) and drop out of a served-base rate (63.4), and the panel wants you to say which before writing SQL.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "email-engagement-funnel", "repeat-purchase-rate", "week-over-week-churn"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides whether growth is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "article-views-ii", "rolling-7d-actives", "dau-wau-stickiness", "customer-order-frequency"],
    },
    {
      name: "Queue-clear clocks",
      why: "Every latency screen here runs on the stamp: a conversation opens at created_at, clears the queue at shipped_at, and the clock averages over stamped rows only. Each stage is a julianday delta with a stated population — 82 stamped of 103 booked, the 14 open excluded by definition. Writing the delta without naming the population is exactly how a 2.98-day number gets misquoted in the exec review.",
      slugs: ["average-time-of-process-per-machine", "first-and-last-call-on-the-same-day", "users-with-two-purchases-within-seven-days", "median-time-to-convert", "calculate-orders-within-each-interval", "second-day-confirmation"],
    },
    {
      name: "Denominator discipline",
      why: "Intercom's headline metric is a ratio with a contested base: 52 resolutions over 103 booked reads 50.5, over the 82 that cleared the queue it reads 63.4 — 12.9 points apart, same numerator. The drills here force the 100.0-before-division habit, the ELSE-0 arm inside AVG(CASE), and the explicit statement of what the denominator holds. Candidates who divide before promoting to real arithmetic ship a flat zero to the exec deck.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "immediate-food-delivery-ii"],
    },
    {
      name: "Seat bands with CASE",
      why: "Seat tiers are CASE-classified — the band fold splits 251 lines into 268 sub-55 Fin-first seats and 230 expert seats, and plan SKUs band into essential/advanced/expert the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the containment story, and a reordered WHEN quietly re-bands the base. The threshold is load-bearing — real line prices sit either side of the 55 cut.",
      slugs: ["calculate-special-bonus", "count-salary-categories", "loan-types", "usage-tier-percentiles", "spend-histogram", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "Containment leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax. The support pod publishes the policy on its boards; candidates are asked to defend it.",
      slugs: ["rank-scores", "department-top-three-salaries", "group-employees-of-the-same-salary", "premier-league-table-ranking", "second-highest-salary"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the volume call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and the abandonment spikes (2 in July, 2 in November) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. The spine is also where STRFTIME buckets get built, and '%m' alone would merge January 2024 into January 2025.",
      slugs: ["biggest-window-between-events", "year-on-year-growth-rate", "consecutive-transactions-with-increasing-amounts", "the-latest-login-in-2020"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board wants open, served, resolved and abandoned in ONE scan — 14, 30, 52, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "snaps-analysis", "sessionize-events"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — served-in-flight under abandoned, this quarter beside last — and EXCEPT answers 'which billed workspaces never cleared the queue'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The billing anti-join (6 never-collected statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["league-statistics", "customers-who-never-order", "dormant-reactivation"],
    },
    {
      name: "Billing rails & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the rails split self-serve from enterprise: card legs (16, 37,364.00) against wire legs (11, 32,248.00), with 5 cycles settling on both. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices", "null-blank-audit"],
    },
  ],

  theory: [
    {
      id: "intercom-t1",
      q: "Your queue-clear report joins workspaces to conversation periods. When do you INNER and when do you LEFT — and what silently breaks if you filter the stamp column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A fate census joins periods to workspaces: a period with no workspace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from workspaces: the workspaces with no periods ARE the answer, arriving with NULL period columns. The classic break: filtering status = 'shipped' in WHERE after the LEFT JOIN kills every NULL-payload workspace row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-billing workspaces — all 16 workspaces appear in the period table somewhere — and proving that zero is itself the analyst's job, because a confident zero you did not verify is how whitespace reports die in review. Intercom's twist: the open queue is not whitespace — those 14 conversations belong to real workspaces — so the LEFT JOIN question is about coverage, not about the queue.",
      tag: "joins",
    },
    {
      id: "intercom-t2",
      q: "The exec dashboard wants each workspace's share of the whole seat book beside its share of its own region. How do the two window shapes differ, and what does COUNT(*) OVER () buy you?",
      a: "Two windows, two denominators. SUM(line_seats) OVER (PARTITION BY customer_id) repeats each workspace's total down its rows; leaving the partition empty — COUNT(*) OVER () — repeats the platform-wide fold instead, so the ratio of the two IS the share, computed without a single GROUP BY or join-back. The trap candidates miss: a partitioned aggregate is a GHOST VALUE repeated on every row of the partition — EU's 45 appears on all 45 EU rows — so summing it again double-counts, and filtering on it in WHERE does nothing because windows evaluate after WHERE. On this db the same move bands seats: SUM(quantity) OVER (PARTITION BY band) puts 268 beside every Fin-first line and 230 beside every expert line, with SUM(quantity) OVER () = 498 as the shared base — 53.8 against 46.2. Say which denominator each column carries out loud; the exec deck's credibility hangs on that sentence, and so does the panel's follow-up.",
      tag: "windows",
    },
    {
      id: "intercom-t3",
      q: "The census says EU carries 45 conversation periods from 8 workspaces, but the usage fold says the platform holds 251 seat lines. Why do the grains disagree, and which one prices the bill?",
      a: "They disagree because each counts a different object after the same join. COUNT(*) at the period grain counts billing cycles — 45 in EU; COUNT(DISTINCT customer_id) folds repeats back to workspaces — 8 logos; joining order_items drops the grain again to seat/usage lines — 251 platform-wide, averaging 2.44 lines per period with a max of 3 seats on a line. None is wrong; each answers a different question: periods measure load, workspaces measure installed base, lines measure what the seat bill actually prices. The classic bug is the silent third grain: aggregate after joining order_items and COUNT(*) counts lines, not periods — 251 wearing a census name. On this db the line grain is where money lives — the 498 seats at their line rates — so the pricing pod reads lines, the growth pod reads workspaces, and support ops reads periods. Saying 'one row per what?' for every COUNT is the habit the panel grades, and quoting the wrong grain's number is how an analyst loses the room.",
      tag: "aggregation",
    },
    {
      id: "intercom-t4",
      q: "shipped_at is NULL until a conversation clears the queue. What is your policy for the time-to-resolution report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped periods have a clock, so the report measures open-to-clear for the 82 of 103 periods that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 open conversations plus 7 abandoned ones — 21 rows, and that gap IS the queue report. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day resolutions for conversations nobody has touched, and it poisons the 2.98 baseline every regional drift alert keys off. The open 14 are not dirty data; they are the denominator question in physical form. A report whose WHERE clause is doing definitional work without saying so is exactly what an Intercom reviewer hunts for; the strong candidate states the 82-row population before the panel asks.",
      tag: "nulls",
    },
    {
      id: "intercom-t5",
      q: "The growth review wants Fin-first seats per plan band, for workspaces carrying at least ten periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The band rule is a row-level fact — CASE WHEN unit_price < 55 classifies each line before any fold, in the SELECT or a staged CTE, not in HAVING. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY customer_id; putting it in WHERE errors because COUNT does not exist before groups form. On this db only the top tier — 24, 17, 14 and 13 periods — clears a 10-period bar, which is exactly the expansion cohort the pod targets. The third trap is the rate: 100.0 * SUM(CASE WHEN band = 'fin' THEN quantity ELSE 0 END) / SUM(quantity) puts the 100.0 BEFORE the division, because SUM of integer flags over an integer fold is integer division and the containment share truncates toward zero — on this db it is the difference between 53.8 and a displayed 0. The strong answer places every filter by asking: is this a fact about one line, or about a workspace?",
      tag: "pipeline",
    },
    {
      id: "intercom-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce a mean (338.19 of booked value per period here). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The nested-count cousin is where Intercom actually lives: fold periods per workspace (the mean is 6.44), then keep the logos above it — exactly four workspaces clear that bar — and the same empty-inner behavior returns when a workspace's staging slice is empty. The NOT IN variant is worse: one NULL in the subquery list poisons every comparison and the whole escalation list empties. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "intercom-t7",
      q: "The volume trend buckets conversations by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 (8 periods, 3,731.97) with January 2025 (6 periods, 1,669.50) and the volume trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's conversations, and queue-end is exactly when stamps land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the story the cells tell is concrete: the book opens at 3,731.97 in January, troughs at 1,193.86 in July — a month that also carries 2 of the 7 abandoned conversations — and November repeats the 2-abandonment pattern at 1,648.80. Date discipline is volume discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "intercom-t8",
      q: "Billing says a subscription statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217.00, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a payment leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage census must read 21 exact (65,612.00 both sides — void-but-settled #11 folds in by construction, paid-status #28 folds out), 1 partial (4,000.00 of 6,148.00), 6 none — footing to 28 or the close does not ship. The money rule: statements and legs carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Close culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "intercom-t9",
      q: "The month walk uses ORDER BY month — why can the default window frame still lie, and when do you write ROWS out loud?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE admits PEERS: every row tied on the ORDER BY key enters the running fold together. On the '%Y-%m' spine that is harmless — month keys are unique, so RANGE and ROWS agree. At period or seat-line grain it is not: two periods sharing a created_at second join the cumulative in one step, and the board shows a jump that never happened. The professional habit is writing the frame whenever the walk matters: SUM(total) OVER (ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) for a strict row-by-row walk, ROWS BETWEEN 6 PRECEDING AND CURRENT ROW for a 7-period trend. ROWS is rows-true, RANGE is value-true — say which one the stakeholder asked for before you compute.",
      tag: "windows",
    },
    {
      id: "intercom-t10",
      q: "Finance wants card rails stacked on wire rails in one report. When is UNION ALL the correct stack, and when does plain UNION quietly delete rows?",
      a: "UNION ALL is a raw concatenation — cheap, order-preserving, and honest when the branches are logically disjoint. The rails census is the clean case: card legs (16, 37,364.00) stacked on wire legs (11, 32,248.00), each branch carrying a literal rail label so nothing can collapse. UNION adds a distinct pass over the combined set, and that pass is a business decision, not decoration: two branches that emit byte-identical rows — same cycle, same counts, no label — silently become one, and the board loses a cycle with no error anywhere. Five cycles on this db settle on BOTH rails; if the branch labels ever fail to distinguish them, UNION eats the overlap. The discipline: default to UNION ALL, carry a distinguishing column in every branch, and state in a comment why duplicates are impossible — the comment is the correctness argument a reviewer audits.",
      tag: "set-ops",
    },
    {
      id: "intercom-t11",
      q: "Which workspaces hold a served-in-flight conversation but never a resolved one — and why is EXCEPT the honest tool for that question?",
      a: "Two population shapes, one operator. At period grain: SELECT id FROM orders WHERE status = 'shipped' EXCEPT SELECT id FROM orders WHERE status = 'delivered' returns the 30 in-flight periods. At workspace grain the same shape returns exactly one logo — Liam O'Brien, the account whose conversations all sit served-but-unresolved — and that single row is the escalation list. EXCEPT compares WHOLE rows, deduplicates both inputs first, and its direction is the question: A EXCEPT B is 'in A, never in B', so swapping the operands answers the mirror and reads as a different memo. Know its limits too: the dedupe pass means EXCEPT answers set questions, not multiset forensics — if duplicated rows are themselves the anomaly, the LEFT JOIN … IS NULL anti-join is the row-honest tool. Set-level diffs across statuses, anti-joins for row-level chases.",
      tag: "set-ops",
    },
    {
      id: "intercom-t12",
      q: "The growth pod wants workspaces whose conversation cadence beats the platform mean. Give me three query shapes, and say where each breaks.",
      a: "Shape one, the scalar subquery: WHERE COUNT(*)-per-workspace > (SELECT AVG over the per-workspace fold) — the inner mean (6.44 on this db) computes once and the comparison keeps exactly four workspaces: 24, 17, 14 and 13 periods. It breaks on staging slices: an empty inner fold returns NULL, and periods > NULL is UNKNOWN — the bench silently empties. Shape two, the derived table: stage the per-workspace counts and the mean as CTEs, join back on nothing — readable, auditable, and the mean is visible as its own column. Shape three, the window: AVG(periods) OVER () prints the mean beside every row — but you cannot filter on it in WHERE, because windows evaluate in the SELECT stage; wrap it in an outer query. The wrong version is the correlated rewrite that re-runs the mean per workspace — correct answer, wasted scans. All three agree on clean data; the interview question is which one survives the messy slice.",
      tag: "subqueries",
    },
    {
      id: "intercom-t13",
      q: "The ops board wants every market's fate census in ONE scan. How do FILTER branches keep that census honest, and what is the reconciliation identity?",
      a: "One scan, many lenses: COUNT(*) FILTER (WHERE o.status = 'delivered') per branch, or the portable twin SUM(CASE WHEN status = '…' THEN 1 ELSE 0 END) when the engine lacks FILTER. The branches PARTITION the rows — every conversation lands in exactly one fate — so the branches must foot to COUNT(*): EU reads 24 resolved + 12 in-flight + 6 open + 3 abandoned = 45 booked, and the platform grid foots to 103. That identity is the correctness argument: a branch that drifts (a missing ELSE arm, a reordered WHEN, a status literal typo'd) breaks the footing and the census stops reconciling — which is exactly the failure four sequential queries hide, because nothing forces their separate WHERE clauses to partition anything. The second prize is the shared denominator: every rate computed from sibling branches carries the same base, so two dashboards cannot disagree by accident.",
      tag: "case-when",
    },
    {
      id: "intercom-t14",
      q: "NOT EXISTS, LEFT JOIN … IS NULL, or NOT IN — three anti-join shapes. Which do you reach for on the dunning queue, and why?",
      a: "NOT EXISTS first: SELECT … FROM invoices i WHERE NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id) — it short-circuits on the first matching row, never trips on NULLs, and states the business rule in the WHERE clause. LEFT JOIN … IS NULL is the twin: same answer, and the unmatched payload is visible, which is why it anchors the close's coverage ledger — on this db it returns 6 never-collected statements worth 15,217.00, one of them (#28, 1,756.00) claiming status 'paid' with zero settlement legs. NOT IN is the one to refuse: x NOT IN (a list containing NULL) is UNKNOWN for every row, so one NULL in the subquery silently empties the dunning queue while looking valid. The supporting habit is proving the confident zero: all 16 workspaces appear in the period table, so the never-billing anti-join returns 0 — but a zero you did not verify is how whitespace reports die in review.",
      tag: "joins",
    },
    {
      id: "intercom-t15",
      q: "How do you turn the open-to-clear clock into reportable buckets — and which population decisions does the CAST hide?",
      a: "The clock is julianday(shipped_at) - julianday(created_at): fractional days over the 82 of 103 periods that carry the stamp, averaging 2.98 with a 2-to-4 spread. For buckets, CAST the delta AS INTEGER — SQLite CAST truncates toward zero, and since no same-hour stamp exists the fractional loss is harmless; the distribution reads 27 conversations at 2 days, 30 at 3, 25 at 4, footing to 82. The population decisions are the report: only stamped rows have a clock (the 14 open and 7 abandoned are populations by definition, not dirty data), the average ships with '82 stamped periods' in the title, and the regional cut — EU 36 at 2.94, APAC 29 at 2.93, US 15 at 3.07, LATAM 2 at 3.5 — needs the same filter or it silently averages a shrunken base. What never ships: IFNULL-ing the latency to zero to 'fix' the average, which invents same-day resolutions for conversations nobody has touched.",
      tag: "dates",
    },
    {
      id: "intercom-t16",
      q: "A workspace appears twice in the roster — 'Keiko Sato' and 'Keiko Sato '. What is the SQL hygiene pass, and why is it join integrity rather than cosmetics?",
      a: "Because the string IS the join key downstream: GROUP BY name, GROUP_CONCAT rosters, and any manual match all treat those as two workspaces, splitting one logo's 4 periods across two rows and quietly breaking every census that foots to 16. The pass is normalize-then-key: TRIM and UPPER (or a disciplined INITCAP) in a staging CTE, dedupe on the normalized key with ROW_NUMBER over updated_at, and only then join — never clean inside the GROUP BY of the report itself, where the normalization hides from review. The same discipline guards the roster folds: GROUP_CONCAT(DISTINCT c.name) prints EU's eight-workspace roster once per logo instead of once per period, and LENGTH or INSTR checks flag padding before it ships. On a messaging platform the workspace master is small and hand-edited, which is exactly why hygiene passes are cheap now and forensic later.",
      tag: "casing",
    },
    {
      id: "intercom-t17",
      q: "The deck says 'quartile the workspaces by conversation volume'. Does NTILE give the pricing pod what it wants, or do you band with CASE?",
      a: "They answer different questions, and the tie decides. NTILE(4) counts ROWS: over the 16-workspace ladder it deals four tiles of four — and the four-way tie at 4 periods splits three workspaces into tile 2 and one into tile 3, because tile size, not value, is the only thing NTILE respects. CASE bands VALUES: the seat fold classifies every line at the 55-dollar cut and lands 268 Fin-first seats against 230 expert seats — stable no matter how the ladder reshuffles, and defensible because the threshold is written in the query. If the pod wants 'four equal-headcount tiers', NTILE with a stated tie policy; if it wants 'seats riding sub-55 rates', CASE. What fails silently is using NTILE and reading the tiles as value bands — the tied-at-4 peer group lands on both sides of a boundary that does not exist in the data, and the expansion list splits mid-tie for no business reason.",
      tag: "windows",
    },
    {
      id: "intercom-t18",
      q: "Which plan SKU does each workspace lean on most — and how do the three argmax shapes behave when two SKUs tie?",
      a: "Three shapes, three tie behaviors. ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY seat_lines DESC, product_id) = 1 inside a CTE DECIDES: one deterministic row per workspace even on ties, because the second key breaks them — right when the deck needs exactly one SKU per logo. The join-back on MAX reports: join per-workspace totals to their maximum and BOTH tied SKUs survive — right when co-leaders are the honest answer, wrong when the row count feeds a rate. The correlated filter (WHERE lines = the per-workspace MAX) simplifies to the same tie behavior as the join-back, at per-row evaluation cost. The interview move is naming the divergence out loud — ROW_NUMBER decides, join-back reports, correlated simplifies — and then stating which policy the workspace board publishes, because 'their top SKU' is a definition the account team will argue about the moment a tie appears.",
      tag: "windows",
    },
    {
      id: "intercom-t19",
      q: "What makes a predicate sargable on this schema, and which habits keep the queue reports cheap?",
      a: "Sargable means the predicate compares the bare column to a value and can use an index: created_at >= '2024-03-01' AND created_at < '2024-04-01' is sargable; SUBSTR(created_at, 1, 7) = '2024-03' wraps the column in a function and forces a scan of every conversation to build the same 25-row slice. The habits that compound: filter early inside each CTE so later stages carry fewer rows (the stamp filter belongs in the staging step, not after the window); probe with LIMIT before committing to the full run; name columns instead of SELECT * so payload you never read stops crossing the wire; and aggregate on the smallest table that answers the question — the fate census needs orders alone, not orders joined to lines. EXPLAIN QUERY PLAN is the receipt: SCAN means the predicate wrapped the column, SEARCH means it didn't. On a small db these are style; at support-ops scale they are the difference between a dashboard that renders and one that times out mid-standup.",
      tag: "performance",
    },
    {
      id: "intercom-t20",
      q: "The leaderboard prints the four tied-at-4 workspaces in a different order every run. What is the fix, and what does it buy beyond stability?",
      a: "A tie-break key in the ORDER BY: ORDER BY COUNT(*) DESC, c.name (or c.id) — every window function and every top-N cut inherits it, so Isabella Rossi, Keiko Sato, Noah Meyer and Pedro Alvarez print in the same order every run and LIMIT stops amputating an arbitrary member of the tie. The deeper buy is reproducibility: a board whose order is a policy — biggest first, then alphabetical by workspace — can be screenshotted, compared across days, and defended in review, while an unspecified sort is an artifact of the query planner's mood. The discipline generalizes: every deterministic report carries a total order, every tie has a stated rule, and the rule lives IN the query where the next analyst can see it. Pagination is the silent beneficiary — without a total order, OFFSET pages can repeat or drop tied rows, and the support pod's touch list loses conversations between runs.",
      tag: "pipeline",
    },
    {
      id: "intercom-t21",
      q: "When is COALESCE an honest display choice on this schema, and when does it manufacture data?",
      a: "Honest: giving a display default to a value that is legitimately absent for presentation — COALESCE(SUM(p.amount_cents), 0) so a never-paid statement reads 0 instead of NULL on the coverage board, or a band label defaulting when a CASE arm was genuinely exhaustive elsewhere. Manufactured: COALESCE on the clock — IFNULL(julianday(shipped_at) - julianday(created_at), 0) turns the 14 open conversations (and 7 abandoned) into same-day resolutions, drags the 2.98-day average toward fiction, and poisons every drift alert keyed to it. The test is what the NULL MEANS: 'zero' (no money settled — display it as zero) versus 'not yet' (no stamp — the absence IS the datum, report it as NULL or label it 'baseline'). Intercom's funnel lives on that distinction: the 14 open periods are the queue, and a report that coalesced them away reports an empty queue — a lie the standup catches by 08:30.",
      tag: "nulls",
    },
    {
      id: "intercom-t22",
      q: "A slide averages the four market resolution rates — 53.3, 56.8, 26.3, 100.0 — and prints 59.1. Defend or kill the number.",
      a: "Kill it. The average of rates weights every market equally regardless of size: LATAM's 2 conversations count like EU's 45, so a 2-of-2 read prints 100.0 and drags the blend up 8.6 points. The honest booked-base rate re-aggregates from the base — 52 resolutions over 103 periods = 50.5 — or weights the rates by their denominators: SUM(rate × booked)/SUM(booked), the same arithmetic one level up. The slide's 59.1 describes a platform where every market books the same volume; this one books 45/37/19/2. The same defense guards the intensity read: EU's 5.6 periods-per-workspace and the US's 9.5 are per-market ratios that must never be averaged into 'the platform intensity' — the platform number is 103 periods over 16 workspaces = 6.44, computed from the base. The interview move is asking WHERE the weighting lives before arguing about the decimals.",
      tag: "aggregation",
    },
    {
      id: "intercom-t23",
      q: "Walk me through the four checks you run before the close ships — and what each one proves.",
      a: "Four, in order, each a different proof. The fate foot: 14 open + 30 in-flight + 52 resolved + 7 abandoned = 103 by construction — proves the census partitions every conversation, catching any CASE arm that drifted. The stamp check: COUNT(shipped_at) = 82 beside COUNT(*) = 103 — proves queue-clear coverage (79.6%) and that the 14 open conversations still exist as a population, not as coalesced zeros. The money anti-join: 6 never-collected statements worth 15,217.00, walked number by number with the paid-status liar #28 (1,756.00) on the anomaly list — proves the dunning queue is row-honest before billing sends a single email. The trial balance: ledger debits 181,080 against credits 181,080, delta zero — proves nothing was rounded away or double-booked en route. The deliverable is not 'looks fine'; it is each check, its figure, and when it last ran — the close ships on receipts, not vibes.",
      tag: "quality",
    },
    {
      id: "intercom-t24",
      q: "A VP quotes the resolution rate at 63.4; the exec deck says 50.5. Both come from your numbers. What do you do?",
      a: "Name the bases and put them in the titles. Both rates share one numerator — 52 resolutions — and differ only in the denominator: 63.4 runs over the 82 periods that cleared the queue (the served base), 50.5 runs over all 103 booked (where the 14 open and 7 abandoned stay in, because 'not yet resolved' is what the metric watches). Neither number is wrong; a rate WITHOUT its base is wrong, so the fix is definitional, not arithmetic: every chart carries 'resolution rate — booked base (103)' or '— served base (82)', and the delta between them (12.9 points) becomes a stated feature of the funnel, not a discrepancy to chase. The same defense guards the Fin containment share (name the 55-dollar cut), queue-clear coverage (82 of 103), and every ratio the pricing pod ships. The analyst who states the base before computing is the one whose numbers survive the review — the one who doesn't spends the meeting defending two right numbers that read as a contradiction.",
      tag: "metrics",
    },
  ],

  mcqs: [
    {
      id: "intercom-mcq-1",
      prompt: "A conversation-billed period's status reads 'cancelled'. In this kit's resolution-fate map, what happened?",
      choices: ["Closed without resolution — the conversation never cleared the queue", "Resolved and billed — the conversation completed its cycle", "Open — no agent or Fin response has landed yet", "Served in flight — a response landed, resolution pending"],
      answer: 0,
      why: "The fate map is fixed: cancelled = closed without resolution — 7 of 103 periods (6.8%), the abandonment tax. It never carried a queue-clear stamp and it stays in the booked-base denominator.",
      notes: [
        { choice: 1, why: "Resolved-and-billed is 'delivered' — 52 periods. Calling abandoned conversations resolved inflates the 50.5% headline before a single queue is cleared." },
        { choice: 2, why: "Open is 'pending' — 14 periods with no stamp yet. Pending is 'not yet'; cancelled is 'never'. Both stay in the booked base, but they route to different queues." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-2",
      prompt: "The db holds 103 booked conversation periods, 52 resolved, 82 queue-clear stamps. Which fraction is the booked-base resolution rate?",
      choices: ["52/82 = 63.4% — resolved over queue-clearers", "52/103 = 50.5% — resolved over ALL periods booked", "52/96 = 54.2% — resolved over booked-minus-abandoned", "52/16 = 325% — resolved over workspaces"],
      answer: 1,
      why: "The booked base holds everything: 103. The 14 open and 7 abandoned stay in because 'not yet resolved' is exactly what the metric watches. 50.5% is the headline the exec deck carries — with the base named.",
      notes: [
        { choice: 0, why: "63.4% is the SERVED-base rate — a different metric with a different name. Quoting it as the booked rate inflates the story by 12.9 points." },
        { choice: 2, why: "Dropping the 7 abandoned is the comfortable lie — it deletes the population the funnel exists to watch. Abandoned conversations are outcomes, not noise." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-3",
      prompt: "EU carries 45 conversation periods from 8 workspaces. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between them — 5.6 periods per workspace — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period carries a workspace. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts markets, not workspaces — a third grain nobody asked for. The census is periods AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-4",
      prompt: "AVG(CASE WHEN status = 'delivered' THEN 1 END) * 100 runs on the 103-period table and prints 100.0. What happened?",
      choices: ["Every period really is resolved", "The CASE has no ELSE arm, so unmatched rows return NULL and AVG skips them — the average runs over the 52 delivered rows alone", "AVG rounds up to 100 by default", "The * 100 promotes the average to a percentage before truncation"],
      answer: 1,
      why: "Without ELSE 0, non-delivered rows produce NULL, AVG ignores NULLs, and the denominator silently shrinks to the 52 matched rows — 52/52 = 100%. The fix is the ELSE 0 arm: 52/103 = 0.505, printing 50.5 with the booked base intact.",
      notes: [
        { choice: 0, why: "The db says 52 of 103 — 50.5%. A 100% containment read is the bug, not the news; this is how the exec deck reports a fully-resolved queue that does not exist." },
        { choice: 3, why: "The * 100 is cosmetic scaling here — the damage happened inside AVG's denominator. Promoting to real arithmetic never restores the missing 51 rows." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-5",
      prompt: "Keep only workspaces carrying at least 10 conversation periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the top tier — 24, 17, 14 and 13 periods — clears a 10-period bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'periods' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-6",
      prompt: "On the 103-period table, what does COUNT(*) - COUNT(shipped_at) return, and what does the number mean?",
      choices: ["21 — the never-stamped queue: 14 open conversations plus 7 abandoned", "103 — COUNT(shipped_at) counts NULLs too", "14 — only the open conversations have NULL stamps", "82 — the stamped subset, double-counted"],
      answer: 0,
      why: "COUNT(shipped_at) skips NULLs, so the gap is exactly the rows with no queue-clear stamp: 14 open plus 7 closed-without-resolution = 21. That subtraction IS the queue report — no separate query needed.",
      notes: [
        { choice: 1, why: "COUNT(column) ignores NULLs; only COUNT(*) counts every row. Believing both read 103 hides the queue inside a full census." },
        { choice: 2, why: "Abandoned conversations carry NULL stamps too — they closed without ever clearing the queue. The gap splits 14 and 7, and both halves matter." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-7",
      prompt: "A monthly volume spine built with SUBSTR(created_at, 6, 2) — month only — shows January with 14 periods. Diagnosis?",
      choices: ["January 2024 (8 periods, 3,731.97) merged with January 2025 (6, 1,669.50) — the bucket dropped the year", "The db double-books January", "SUBSTR cannot slice TEXT timestamps", "8 + 6 = 14 is wrong arithmetic somewhere"],
      answer: 0,
      why: "A month-only bucket collapses every January in the table: '%m'-style slicing merges 2024-01 and 2025-01 into one fictional month. The spine needs STRFTIME('%Y-%m', created_at) — 14 buckets on this db, none overlapping.",
      notes: [
        { choice: 1, why: "The db is fine — the bucket is lossy. Any month-only fold on a two-year table double-counts twelve pairs of months, not just January." },
        { choice: 2, why: "SUBSTR slices TEXT fine — 2024-01's sixth-and-seventh characters are the month. The failure is semantic (which characters), not mechanical." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-8",
      prompt: "A staging-table escalation list uses workspace_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["Every workspace really has an abandoned conversation — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "On the clean core db every period carries a customer_id, so the zero would be suspicious rather than right — but staging tables are exactly where NULLs sneak in, and empty escalation lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-9",
      prompt: "A board stack puts served-in-flight periods under abandoned periods in one layout, built with UNION. A reviewer says one workspace's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same workspace, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same workspace, same counts, no region or branch label — collapse into one, and the board loses a workspace with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate repeat exists, UNION is the bug, and 'performance choice' is how it survives review." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-10",
      prompt: "A dashboard walks booked value period by period: SUM(total) OVER (ORDER BY created_at). Two periods share a created_at second, and the cumulative 'jumps two periods at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at period grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-11",
      prompt: "The seat-bill report joins conversation periods to their seat lines and runs COUNT(*). What does it return on this db?",
      choices: ["251 — one row per seat/usage line", "103 — one row per conversation period", "498 — one row per billed seat", "16 — one row per workspace"],
      answer: 0,
      why: "After the join the grain is the line: 251 rows across the 103 periods (2.44 lines per period). The 498 seats live in SUM(quantity) — COUNT never sums quantity, and knowing which grain COUNT(*) returns is the first habit this kit drills.",
      notes: [
        { choice: 1, why: "103 is COUNT(DISTINCT oi.order_id) after the join — the fold back to period grain. Useful, but it is a different expression, not the same number." },
        { choice: 2, why: "498 is the seat meter, not a row count. Counting rows after joining lines gives lines — the census and the meter are different folds." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-12",
      prompt: "A payment leg carries 6,148 cents. What does `SELECT amount_cents / 100` print — and what is the dollar-correct form?",
      choices: ["61 — integer division; the dollar read is amount_cents / 100.0, which prints 61.48", "61.48 — SQLite promotes the division automatically", "0.61 — the divisor should be 10000", "6148 — division on INTEGER columns is a no-op"],
      answer: 0,
      why: "Both operands are INTEGERs, so 6148 / 100 is integer division: 61 flat, and 48 cents vanish. The 100.0 promotes the fold to real arithmetic first — 61.48 — which is the only form the dunning email and the coverage ledger may print.",
      notes: [
        { choice: 1, why: "SQLite never auto-promotes INTEGER / INTEGER. The missing .0 is the exact bug that eats cents on every odd-cent row — and it survives review because 61 looks plausible." },
        { choice: 2, why: "Cents-to-dollars divides by 100, not 10000. The 0.61 answer is the classic overcorrection after being burned by an integer-division bug once." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-13",
      prompt: "`SELECT customer_id, COUNT(*) FROM orders GROUP BY customer_id LIMIT 5` returns five workspaces — but the same query run twice returns them in different orders, and the expansion pod's list keeps changing. Diagnosis?",
      choices: [
        "LIMIT without ORDER BY returns an arbitrary five — the fix is ORDER BY COUNT(*) DESC (with a tie-break) before the cut",
        "GROUP BY scrambles ids; add ORDER BY customer_id",
        "LIMIT 5 is losing rows to the four-way tie — raise it to 10",
        "The query needs DISTINCT to stabilize the order",
      ],
      answer: 0,
      why: "No ORDER BY means no defined order — SQL result sets are unordered by contract, and the planner may hand back different rows each run. Top-N without a sort is not a leaderboard; ORDER BY COUNT(*) DESC, then the tie-break, makes the five deterministic.",
      notes: [
        { choice: 2, why: "Raising the LIMIT papers over the real bug: with ties at 4 periods, even an ordered top-5 needs a stated tie-break or the cut stays arbitrary." },
        { choice: 1, why: "Sorting by customer_id is deterministic but answers the wrong question — the pod wants the heaviest workspaces, not the lowest ids." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-14",
      prompt: "Which expression computes the open-to-clear clock for a stamped conversation?",
      choices: [
        "julianday(shipped_at) - julianday(created_at)",
        "shipped_at - created_at",
        "DATEDIFF(day, created_at, shipped_at)",
        "julianday(created_at) - julianday(shipped_at)",
      ],
      answer: 0,
      why: "julianday converts each TEXT timestamp to a fractional day number; the difference is elapsed days (the 82 stamped rows average 2.98). TEXT minus TEXT coerces to a numeric jumble, and DATEDIFF is not SQLite — it fails the dialect check before it runs.",
      notes: [
        { choice: 1, why: "Direct subtraction of TEXT timestamps is not date math — SQLite coerces the strings to numbers ('2024-…' → 2024) and the 'days' are nonsense like 0.25." },
        { choice: 3, why: "Right functions, wrong direction — this clock reads negative, and the drift alert keys off an absolute 2.98-day baseline." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-15",
      prompt: "The workspace ladder runs 24, 17, 14, 13, 5, then FOUR workspaces tie at 4. Under RANK() OVER (ORDER BY COUNT(*) DESC), what rank does the last of the tied four carry?",
      choices: ["6 — all four share rank 6", "9 — each tied workspace increments", "7 — the tie shares 6 and skips one", "4 — the tie consumes ranks 3 and 4"],
      answer: 0,
      why: "RANK gives tied rows the same rank and skips forward by the tie's size: ranks run 1, 2, 3, 4, 5, then 6, 6, 6, 6 — every tied workspace carries 6. The support pod's published policy is RANK semantics: shared rungs, honest gaps.",
      notes: [
        { choice: 1, why: "That is ROW_NUMBER's behavior — 6, 7, 8, 9 — which splits peer workspaces arbitrarily and turns a tie into a fake order." },
        { choice: 2, why: "No rank is 'skipped by one': after a four-way tie at 6, the next DISTINCT value would land on 10 — the gap equals the tie's size, not one." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-16",
      prompt: "`SELECT customer_id FROM orders WHERE status = 'shipped' EXCEPT SELECT customer_id FROM orders WHERE status = 'delivered'` — what does this return on this db?",
      choices: [
        "One workspace — the logo holding served-in-flight conversations but never a resolution",
        "Zero rows — every workspace with an in-flight conversation also has a resolved one",
        "30 rows — the served-in-flight periods",
        "82 rows — every stamped period",
      ],
      answer: 0,
      why: "EXCEPT keeps left-side values with no right-side match: workspaces that have shipped status but never delivered status. At workspace grain that is exactly one logo (Liam O'Brien) — the escalation list, not the 30 in-flight periods the period-grain version returns.",
      notes: [
        { choice: 2, why: "30 is the PERIOD-grain answer. The query folds customer_id, and EXCEPT dedupes — 30 periods collapse to distinct workspaces, of which exactly one never resolved." },
        { choice: 3, why: "82 is the stamp census. The operands are status populations, not stamp populations — 'shipped' matches 30 rows, not 82." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-17",
      prompt: "A one-pass market census counts open conversations per region. Which branch is valid SQLite?",
      choices: [
        "COUNT(*) FILTER (WHERE o.status = 'pending')",
        "COUNT(o.status = 'pending')",
        "COUNT(*) WHERE (o.status = 'pending')",
        "SUM(FILTER (o.status = 'pending'))",
      ],
      answer: 0,
      why: "FILTER (WHERE …) is the per-aggregate clause: COUNT(*) FILTER (WHERE o.status = 'pending') counts only the matching rows inside the group — 6 in EU, 5 in APAC, 3 in the US, 0 in LATAM. The other three are syntax inventions that fail before they count anything.",
      notes: [
        { choice: 1, why: "COUNT takes an expression, not a boolean filter — COUNT(o.status = 'pending') counts every non-NULL result of the comparison, which is every row. The portable twin is SUM(CASE WHEN … THEN 1 ELSE 0 END)." },
        { choice: 3, why: "FILTER is a clause attached to an aggregate, not a function of its own — SUM(FILTER (…)) parses as nothing." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-18",
      prompt: "A colleague filters March with `SUBSTR(created_at, 1, 7) = '2024-03'` and the report times out. The sargable rewrite is:",
      choices: [
        "WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "WHERE MONTH(created_at) = 3 AND YEAR(created_at) = 2024",
        "WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'",
        "WHERE STRFTIME('%m', created_at) = '03' AND created_at LIKE '2024%'",
      ],
      answer: 0,
      why: "Wrapping the column in a function defeats any index; the half-open range compares the bare column and scans only March. It also catches the last second of March 31 — which BETWEEN's 31-date endpoint silently drops, exactly when late-night conversations land.",
      notes: [
        { choice: 2, why: "BETWEEN is still sargable-ish on a bare column, but the endpoint '2024-03-31' excludes everything after midnight — the boundary bug dressed as an optimization." },
        { choice: 3, why: "Still function-wrapped (STRFTIME + LIKE), so still a full scan — two wrapped predicates instead of one." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-19",
      prompt: "The EU roster fold — GROUP_CONCAT(c.name) over periods joined to workspaces — lists 'Alice Chen' many times. The fix?",
      choices: [
        "GROUP_CONCAT(DISTINCT c.name) — dedupe inside the fold; EU prints its 8 workspaces once each",
        "SELECT DISTINCT around the whole query — duplicate rows disappear",
        "GROUP BY c.name in addition to region — one row per workspace",
        "CONCAT before GROUP_CONCAT — collapsing happens automatically",
      ],
      answer: 0,
      why: "The duplicate lives inside the aggregate: a 24-period workspace contributes 24 rows to the fold. DISTINCT inside GROUP_CONCAT folds names to logos — EU's roster is 8 names, not 45. Whole-row DISTINCT changes nothing because each period row is unique.",
      notes: [
        { choice: 1, why: "SELECT DISTINCT dedups output ROWS; the cell itself still contains Alice 24 times. The dedupe must happen inside the aggregate." },
        { choice: 2, why: "Adding c.name to the GROUP BY changes the grain — 8 roster rows instead of 1, and the census stops being a census." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-20",
      prompt: "Per-market resolution rates read EU 53.3, APAC 56.8, US 26.3, LATAM 100.0. A slide averages them to 59.1 and calls it the platform rate. What is the real booked-base number?",
      choices: [
        "50.5 — 52 resolutions over all 103 booked; the 59.1 weights LATAM's 2 conversations like EU's 45",
        "59.1 is correct — averaging rates is the honest blend",
        "63.4 — the served-base rate is the platform number",
        "56.8 — the APAC rate is the median market and best represents the platform",
      ],
      answer: 0,
      why: "Rates are ratios, not additive facts: the average of four market rates weights each market equally regardless of size, and LATAM's 2-of-2 prints 100.0. Re-aggregating from the base — 52 over 103 — gives 50.5, the number whose denominator the whole kit defends.",
      notes: [
        { choice: 1, why: "Averaging rates is only honest when every group has equal counts — 45/37/19/2 is the opposite. The 8.6-point gap between 59.1 and 50.5 is exactly the LATAM distortion." },
        { choice: 2, why: "63.4 is a different metric with a different name (served base, 82). Quoting it as the platform booked rate inflates the story by 12.9 points." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-21",
      prompt: "A colleague writes `WHERE RANK() OVER (ORDER BY COUNT(*) DESC) <= 5` to keep the top five workspaces. What happens?",
      choices: [
        "Error — window functions evaluate in the SELECT stage and cannot appear in WHERE; stage the rank in a CTE and filter outside",
        "It works — RANK is computed before WHERE like any aggregate",
        "It silently returns every row — the comparison is always true",
        "It works only if GROUP BY precedes the WHERE clause",
      ],
      answer: 0,
      why: "The pipeline runs FROM → WHERE → GROUP BY → SELECT (windows) → ORDER BY: WHERE cannot see window output that does not exist yet. The fix is staging — CTE or subquery computing the rank, then the outer query filters rank <= 5.",
      notes: [
        { choice: 1, why: "Aggregates need GROUP BY and HAVING; windows always run in SELECT. Confusing the two stages is the single most common pipeline-order failure in screens." },
        { choice: 2, why: "If it returned everything silently you might catch it in review — the engine's rejection is actually the friendlier failure mode." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-22",
      prompt: "NTILE(4) runs over the 16-workspace volume ladder. The four-way tie at 4 periods — how does NTILE split it?",
      choices: [
        "Three workspaces land in tile 2, one in tile 3 — NTILE counts rows, not values",
        "All four land in tile 2 — NTILE keeps ties together",
        "All four land in tile 3 — the tie falls to the next tile",
        "Two in tile 2, two in tile 3 — ties split evenly",
      ],
      answer: 0,
      why: "NTILE deals fixed-size tiles over the ordered rows: 16 rows make four tiles of four, and the ladder's shape puts three of the tied-at-4 workspaces at tile 2's tail and one at tile 3's head. Tile size is the only thing NTILE respects — a peer group split across a boundary that does not exist in the values is the function's signature artifact.",
      notes: [
        { choice: 1, why: "No window function protects ties except RANK/DENSE_RANK sharing rungs — NTILE ignores values entirely, which is why banding by value wants CASE instead." },
        { choice: 3, why: "There is no even-split instinct inside NTILE — it fills tile 2 to its quota (rows 5–8) before opening tile 3 (rows 9–12)." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-23",
      prompt: "`SELECT COUNT(*) FROM customers a JOIN customers b ON a.region = b.region AND a.id < b.id` counts same-market workspace pairs. What does dropping the `a.id < b.id` guard change?",
      choices: [
        "78 instead of 39 — every pair counted twice (and 94 with no guard at all, adding 16 self-pairs)",
        "39 either way — the guard is cosmetic",
        "16 — the guard was hiding all matches",
        "39 but unordered — the guard only affects sort order",
      ],
      answer: 0,
      why: "Without the guard every unordered pair matches in both directions — EU's 28 pairs become 56 — and with no pair-guard at all each workspace also matches itself, adding 16 self-rows: 94. The half-open guard (a.id < b.id) is the pair-once discipline that keeps self-joins honest.",
      notes: [
        { choice: 1, why: "The guard halves the count — direction is exactly what it removes. 39 is the a.id < b.id answer only." },
        { choice: 2, why: "16 is the self-pair add-on, not the total — the cross-products between different workspaces survive any guard change." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-24",
      prompt: "The support pod's touch list must print the four tied-at-4 workspaces in the same order every run. Which ORDER BY guarantees it?",
      choices: [
        "ORDER BY COUNT(*) DESC, c.name — a total order: volume first, then a stated tie-break",
        "ORDER BY COUNT(*) DESC — the tie is fine, databases keep insertion order",
        "GROUP BY c.name — grouping imposes alphabetical order",
        "ORDER BY RANDOM() — stable within a run",
      ],
      answer: 0,
      why: "Ties need a tie-break key to form a TOTAL order: volume DESC, then name, is a policy the next run reproduces exactly. Unspecified order is the planner's mood — the ladder above the tie (24, 17, 14, 13, 5) looks stable only because its values are distinct.",
      notes: [
        { choice: 1, why: "SQL result order is undefined without ORDER BY over distinct values — tied rows may print in any order on any run, and OFFSET pagination then repeats or drops members of the tie." },
        { choice: 3, why: "RANDOM is the opposite of stability — the touch list would shuffle every refresh and the pod would chase different accounts daily." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-25",
      prompt: "The month walk's first row shows prev_orders = NULL, and an analyst COALESCEs it to 0 so the first delta prints +800%. What is the honest treatment?",
      choices: [
        "Leave it NULL or label it 'baseline' — no prior month exists, so no delta exists",
        "COALESCE to 0 is fine — the first month genuinely starts from nothing",
        "COALESCE to the first month's own value — the delta then reads 0, the honest no-change",
        "Drop the first row from the query",
      ],
      answer: 0,
      why: "The LAG boundary NULL means 'no baseline', not 'zero baseline': January 2024's 8 periods did not grow 800% from an empty platform. Delta versus nothing is undefined — report NULL, or a labeled baseline row, and never let a percentage divide by a coalesced zero.",
      notes: [
        { choice: 1, why: "Zero is a measurement ('nothing booked'); NULL is an absence of measurement. Coalescing manufactures a +800% story from an artifact of the window edge." },
        { choice: 2, why: "Self-baselining hides the boundary too — a 0% delta reads as stability when the honest answer is 'unknown, first period'." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-26",
      prompt: "`SUM(total) OVER (ORDER BY created_at ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)` runs over period-ordered rows. What do the FIRST TWO rows print?",
      choices: [
        "Row 1: its own total alone; row 2: rows 1–2 summed — the frame clips at the partition edge",
        "Row 1: three rows summed anyway — frames pad with zeros",
        "Row 1: NULL — the frame is incomplete",
        "Both rows: the grand total — the frame expands to what exists",
      ],
      answer: 0,
      why: "A bounded frame is honest at the edge: there is no row before the first, so the window sums what exists — one row, then two. Only at the third row does the full 3-row window apply. This is why trailing-window metrics on short series need the edge behavior stated, not assumed.",
      notes: [
        { choice: 1, why: "Frames never pad — there is no zero row to absorb. The clip is the definition of ROWS at a boundary." },
        { choice: 3, why: "That describes UNBOUNDED PRECEDING, not a 2-row trailing frame — a different metric wearing the same syntax." },
      ],
      difficulty: "medium",
    },
    {
      id: "intercom-mcq-27",
      prompt: "`SELECT COUNT(*) FROM customers` returns 16; `SELECT SUM(active)` returns 14. What does the 2-row gap mean?",
      choices: [
        "Two workspaces carry active = 0 — SUM counts the flag, COUNT(*) counts rows",
        "Two workspaces have NULL active — SUM skipped them",
        "The active column is corrupted — the two queries must agree",
        "14 workspaces, 16 periods — the queries hit different tables",
      ],
      answer: 0,
      why: "active is a 0/1 flag and never NULL, so SUM(active) counts the flagged-ON rows: 14 of 16 workspaces are active. The gap is a conditional count in disguise — SUM(flag) over COUNT(*) — the same shape as every fate branch in the census.",
      notes: [
        { choice: 1, why: "The column is NOT NULL by definition — no NULLs exist to skip. Reading the gap as missingness sends the analyst hunting a data bug that isn't there." },
        { choice: 2, why: "No corruption: the two queries measure different things — rows versus flagged rows. Forcing them to 'agree' usually means deleting the inactive workspaces from the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-28",
      prompt: "The Q1-2024 volume read uses `BETWEEN '2024-01-01' AND '2024-03-31'`. Which Q1 does the deck actually show?",
      choices: [
        "A short Q1 — everything after midnight on March 31 is dropped; the half-open range (>= 01-01 AND < 04-01) captures all 25 periods worth 9,958.69",
        "The full Q1 — BETWEEN includes both endpoints as full days",
        "Q1 plus one day — BETWEEN overshoots by midnight April 1",
        "Empty — BETWEEN cannot compare TEXT timestamps",
      ],
      answer: 0,
      why: "BETWEEN with a bare date endpoint excludes '2024-03-31 23:59:59' — the last night's conversations, which is exactly when queue stamps land. Half-open ranges compose at month ends with no boundary judgment: Q1-2024 is 25 periods and 9,958.69 booked, and the boundary policy is stated before the WHERE is written.",
      notes: [
        { choice: 1, why: "BETWEEN includes the endpoints as INSTANTS, not days — '2024-03-31' means midnight of that day, so the day itself is 99.99% missing." },
        { choice: 3, why: "TEXT timestamps compare fine — ISO format sorts lexicographically. The failure is the boundary, never the comparison." },
      ],
      difficulty: "easy",
    },
    {
      id: "intercom-mcq-29",
      prompt: "The drift alert keys off per-market clocks — the US at 3.07 days against APAC's 2.93. A colleague computed AVG(julianday(shipped_at) - julianday(created_at)) once and pasted it onto every region's row. What did they forget?",
      choices: [
        "PARTITION BY region (or GROUP BY region) — one global average (2.98) pasted everywhere erases the drift the alert exists to catch",
        "Nothing — 2.98 is the regional average too",
        "The stamp filter — unstamped rows should count as 0 days",
        "ROUND — the alert needs 4 decimals",
      ],
      answer: 0,
      why: "The per-market clock is a per-group fold: GROUP BY region with the stamp filter, or AVG(...) OVER (PARTITION BY region) beside each row. The global 2.98 is one number for one platform; the drift lives BETWEEN partitions — US 3.07 versus APAC 2.93 — and a ghost value pasted everywhere makes the alert fire on nothing.",
      notes: [
        { choice: 2, why: "The stamp filter is already right in their expression — AVG ignores the NULL clocks. The failure is grain, not population." },
        { choice: 3, why: "Rounding changes display, not meaning — the alert would drift by the same 0.14 days with prettier decimals." },
      ],
      difficulty: "hard",
    },
    {
      id: "intercom-mcq-30",
      prompt: "The forecast tab needs NEXT month's booked value beside each month's row. Which function, and what does the LAST row print?",
      choices: [
        "LEAD(billed) OVER (ORDER BY month) — the last row is NULL: no future exists yet",
        "LAG(billed) OVER (ORDER BY month) — the last row is NULL",
        "LEAD(billed, 0) — the last row repeats its own value",
        "NEXT(billed) OVER (ORDER BY month) — the last row errors",
      ],
      answer: 0,
      why: "LEAD reads forward one row; LAG reads backward. On the 14-month spine the walk's first row is LAG's NULL baseline and the last row is LEAD's — and that terminal NULL is honest: February 2025 has no March to forecast from. Direction is meaning: LEAD beside a month is the future, LAG beside it is history.",
      notes: [
        { choice: 1, why: "LAG hands each month the PRIOR month's value — that's the month-over-month walk, not the forecast tab. Swapping the two silently re-labels history as future." },
        { choice: 2, why: "LEAD(billed, 0) reads the current row — every 'next month' cell becomes the month itself and the forecast tab shows the present, twice." },
      ],
      difficulty: "easy",
    },
  ],

  cases: [
    {
      id: "cs-intercom-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The resolution-fate census",
      brief:
        "Intercom-flavored brief on the storefront db: Monday's support-ops review opens with the resolution-fate census — every conversation-billed period booked last cycle folded into ONE row, with both resolution rates on the slide and the base of each named. Probed facts: 103 conversation-billed periods; 52 resolved (50.5% of everything booked), 30 served-in-flight, 14 open with no stamp yet, 7 closed without resolution; 82 periods carry the queue-clear stamp, so the same 52 resolutions read 63.4 over the served base. The exec read wants every fate reconciling to 103 by construction.",
      ask: "Return the one-row fate census — booked, resolved, open, served-in-flight, closed-unresolved — plus both resolution rates to 1 decimal.",
      template:
        "SELECT\n       COUNT(*) AS booked_conversations,\n       SUM(CASE WHEN status = {1} THEN 1 ELSE 0 END) AS resolved,\n       SUM(CASE WHEN status = {2} THEN 1 ELSE 0 END) AS open_queue,\n       SUM(CASE WHEN status = {3} THEN 1 ELSE 0 END) AS served_in_flight,\n       SUM(CASE WHEN status = {4} THEN 1 ELSE 0 END) AS closed_unresolved,\n       ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), {5}) AS resolution_rate,\n       ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(shipped_at), 1) AS resolution_rate_served\nFROM orders;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the resolved arm",
          why: "delivered = resolved — 52 of 103 periods, the 50.5% headline's numerator. 'shipped' here reads 30 (served, not resolved) and 'pending' reads 14 — one status literal moves a whole fate between arms and the census stops footing to the stage map.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the open-queue arm",
          why: "pending = open, no stamp yet — the 14-conversation queue the Fin-first auto-responder owns. 'shipped' would print 30 and relabel in-flight work as untouched, hiding the queue the standup routes first.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the served-in-flight arm",
          why: "shipped = served, resolution pending — 30 periods stamped but not closed. 'delivered' would fold resolved work into this arm and the two-stage funnel (52 then 30) collapses into a flat 82.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandonment arm",
          why: "cancelled = closed without resolution — 7 periods, the 6.8% abandonment tax that stays in the booked base by design. 'pending' here moves the open queue into abandoned and the 14-conversation incident queue reads 7.",
        },
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the rate precision",
          why: "Rates print to 1 decimal — 50.5 booked-base, matching the probed stage shares. ROUND(…, 2) prints 50.49 and the slide stops reconciling with the 50.5 every other deck quotes; ROUND(…, 0) flattens to 50.",
        },
      ],
      distractors: ["0", "2", "AVG", "COUNT"],
      walkthrough:
        "One table, one scan, seven cells — the census discipline is that every fate is a conditional count and the branches must sum to COUNT(*). The four CASE arms split 103 into 52 resolved + 14 open + 30 served-in-flight + 7 closed-unresolved = 103 by construction, and the two rate columns price the denominator question in a single row: 100.0 × 52 / 103 = 50.5 over everything booked, 100.0 × 52 / COUNT(shipped_at) = 63.4 over the 82 that cleared the queue — same numerator, 12.9 points apart, and the slide shows both with bases named. The 14 open periods have no stamp and still sit in the booked denominator; that is the definition, not an oversight. The distractors fail honestly: 0 or 2 in a status arm compares text to a number, matches nothing, and that fate reads 0 while the branch sum quietly stops footing to 103; 2 in the precision slot prints 50.49 and breaks reconciliation with every other deck; AVG or COUNT in a status literal is a misuse-of-aggregate error before the query runs. The two-grain habit this census feeds: the 82-stamp count beside the 103 booked count IS the queue-clear coverage metric — 79.6% — computed in the same breath as the rates.",
    },
    {
      id: "cs-intercom-2",
      tier: "hard",
      topic: "t6",
      universe: "pricing",
      title: "The Fin-first seat bands",
      brief:
        "Intercom-flavored brief on the storefront db: the pricing pod re-cuts the seat mix every cycle with Fin on the page — seats ride essential/advanced/expert rates and Fin resolutions meter separately, so the containment proxy is the line-rate band. Probed facts: 251 seat/usage lines across the 103 periods carry 498 seats (2.44 lines per period, max 3 seats a line); the sub-55 Fin-first band holds 268 seats at a 31.01 average line rate, the expert band 230 seats at 115.85 — 53.8% of the seat book rides Fin-first. The pod wants every line kept, bands partitioned, shares to 1 decimal, biggest band on top.",
      ask: "Return every seat line with its band, band seat total, band share of the 498-seat book and average line rate, biggest band first.",
      template:
        "WITH lines AS (\n  SELECT CASE WHEN unit_price < {1} THEN {2} ELSE 'expert_growth' END AS band,\n         quantity AS line_seats,\n         unit_price\n  FROM order_items\n)\nSELECT band,\n       line_seats,\n       unit_price,\n       SUM(line_seats) OVER (PARTITION BY band) AS band_seats,\n       ROUND({3} * SUM(line_seats) OVER (PARTITION BY band) / SUM(line_seats) OVER (), {4}) AS band_share_pct,\n       ROUND(AVG(unit_price) OVER (PARTITION BY band), 2) AS avg_line_rate,\n       SUM(line_seats) OVER () AS platform_seats\nFROM lines\nORDER BY band {5}, unit_price DESC;",
      slots: [
        {
          answer: "55",
          kind: "number",
          noVerify: true,
          label: "the containment line",
          why: "The 55 cut is load-bearing, not cosmetic: real line prices sit either side of it (40.39–50.84 below, 57.16–59.85 above), so 40 or 60 re-bands whole SKUs and the 268/230 mix — and the 53.8 containment share — moves with it.",
        },
        {
          answer: "'fin_selfserve'",
          kind: "keyword",
          label: "the Fin-first band label",
          why: "Names the sub-55 arm the pricing pod reads as Fin-eligible self-serve seats. 'expert_growth' here collapses both arms into one partition — every line shows 498 band seats and a 100.0 share, and the containment read disappears.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the share scaler",
          why: "100.0 BEFORE the division promotes integer seat folds to real arithmetic — 100.0 × 268 / 498 = 53.8. Bare 100 keeps the fold integer, the share truncates toward zero, and the containment chart reads flat zeros.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Shares print to 1 decimal — 53.8 and 46.2, footing to 100.0 across the book. ROUND(…, 2) prints 53.82 and the band chart stops reconciling with the 53.8 the pricing deck quotes; 0 flattens to 54/46.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first direction",
          why: "The pod reads the bigger arm on top: fin_selfserve (268 seats) before expert_growth (230). ASC opens the deck on the smaller band — a correct query aimed at the wrong end of the pricing page.",
        },
      ],
      distractors: ["40", "60", "COUNT", "ASC", "'expert_growth'"],
      walkthrough:
        "Two stages: band each line, then let windows carry the fold to every row. The CTE CASE-classifies 251 lines at the 55 cut — 133 lines become fin_selfserve, 118 expert_growth — and the partition windows repeat the folds down the rows: fin_selfserve shows 268 band seats at a 31.01 average line rate, expert_growth 230 at 115.85, with SUM(line_seats) OVER () = 498 as the shared platform base. The share column is the containment read: 100.0 × 268 / 498 = 53.8 for the Fin-first band against 46.2 — 53.8 + 46.2 = 100.0 by construction, and the ghost-value rule holds (each band's cells repeat per line; never sum them again). DESC puts the bigger band on top. The distractors each break differently: 40 re-bands the 40.39–50.84 lines into expert and the Fin-first share collapses below half; 60 pulls the 57.16–59.85 lines down and inflates it; COUNT folds seats into line counts (a band reads 133, not 268) and every share drifts; ASC opens on expert_growth; 'expert_growth' in the label slot merges the partitions — 498 everywhere, 100.0 shares, no containment story. The pricing take: 268 seats at 31.01 against 230 at 115.85 is the expansion engine in one fold — and the threshold is a policy the pod can defend at 55, not a rounding convenience.",
    },
    {
      id: "cs-intercom-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The containment leaderboard",
      brief:
        "Intercom-flavored brief on the storefront db: the growth review ranks workspace accounts by conversation volume, and the panel wants rank semantics treated as a POLICY, not a default — four workspaces sit tied at 4 periods and the pod publishes shared rungs. Probed facts: 16 workspaces carry 103 periods; the ladder reads Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13, Chloe Dubois 5, then Isabella Rossi / Keiko Sato / Noah Meyer / Pedro Alvarez all at 4, with Farid Nasser and Hiro Tanaka at 3. A HAVING floor of 3 keeps 11 rows, and RANK prints 1, 2, 3, 4, 5, 6, 6, 6, 6, 10, 10 — the tie visible, the gap after it honest.",
      ask: "Return each workspace carrying at least 3 conversation periods with its region, period count and rank, biggest volume first.",
      template:
        "SELECT c.name,\n       c.region,\n       COUNT(*) AS periods,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS period_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name, c.region\nHAVING COUNT(*) >= {3}\nORDER BY period_rank, periods DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the shared-rung ranker",
          why: "RANK gives the four tied-at-4 workspaces the same rung (6, 6, 6, 6) and stamps the next distinct value 10 — shared rungs with honest gaps, the pod's published policy. ROW_NUMBER would split the peers 6-7-8-9, inventing an order the business never drew, and DENSE_RANK would compress the after-tie rung to 7 and hide that four positions were consumed.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The leaderboard crowns volume, so the window ORDER BY runs descending — Alice Chen's 24 takes rank 1. ASC would rank the two 3-period workspaces first and hand Alice rank 11: a correct query crowning the wrong end of the ladder.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the bench floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 of 16 workspaces — through the four-way tie AND the two 3s behind it, so the after-tie gap (rank 10) stays visible in the output. A floor of 4 amputates the 3s and the tie becomes the last block, hiding the very rung behavior the review is debating.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "4"],
      walkthrough:
        "A census, a floor, and a rank policy. GROUP BY workspace folds 103 periods into 16 logos; HAVING COUNT(*) >= 3 keeps the 11-workspace bench; and the window ranks the folded counts: 1 Alice Chen 24, 2 Emma Wilson 17, 3 Grace Kim 14, 4 Maya Patel 13, 5 Chloe Dubois 5 — then the four-way tie at 4 all carrying rank 6 (Rossi, Sato, Meyer, Alvarez), and the two 3s at rank 10. The three rankers disagree exactly where the ties are: RANK shares rungs and skips (6,6,6,6 then 10), DENSE_RANK shares without gaps (6,6,6,6 then 7), ROW_NUMBER splits the tie arbitrarily (6 through 9). The floor is load-bearing too: at >= 3 the tie sits mid-ladder with the gap visible behind it; raise it to 4 and the tie becomes the last block, where RANK and DENSE_RANK print identical output and the review would have nothing to argue about. Ordering by rank then periods gives the deterministic print the pod republishes every cycle.",
    },
    {
      id: "cs-intercom-4",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The market fate grid",
      brief:
        "Intercom-flavored brief on the storefront db: the Monday review wants the resolution-fate census sliced by market in ONE scan — every fate a FILTER branch, every branch footing to its region's booked total. Probed facts: EU books 45 conversations (24 resolved, 12 served-in-flight, 6 open, 3 abandoned), APAC 37 (21/8/5/3), US 19 (5/10/3/1), LATAM 2 (2/0/0/0 — the honest-zero row: both conversations resolved, nothing anywhere else). The branches partition the rows, so 24+12+6+3 must equal 45, and the platform grid must foot to 103 — the reconciliation identity the four-sequential-queries version never proves.",
      ask: "Return one row per market: booked conversations, resolved, served-in-flight, open queue and closed-unresolved counts, heaviest market first.",
      template:
        "SELECT c.region,\n       COUNT(*) AS booked,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS resolved,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS served_in_flight,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS open_queue,\n       COUNT(*) FILTER (WHERE o.status = {4}) AS closed_unresolved\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY booked {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the resolved branch",
          why: "delivered = resolved — EU 24, APAC 21, US 5, LATAM 2. 'shipped' here would read 12/8/10/0 and the resolved column would describe in-flight work; one status literal moves a whole fate between arms and the grid stops footing to the stage map.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight branch",
          why: "shipped = served, resolution pending — and the grid exposes the US inversion: 10 in-flight against 5 resolved, the only market where the queue is heavier than the resolutions. 'delivered' in this arm would fold resolved work into in-flight and hide the inversion the standup escalates.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the open-queue branch",
          why: "pending = open, no stamp yet — 6 in EU, 5 in APAC, 3 in the US, 0 in LATAM: the Fin-first auto-responder's routing table. Any other literal empties the arm and the open queue reads as staffed, which is how a backlog hides inside a healthy-looking census.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandonment branch",
          why: "cancelled = closed without resolution — EU 3, APAC 3, US 1, LATAM 0. The zeros are honest: LATAM genuinely books and resolves everything, and the ELSE-less truth of FILTER is that no arm is padded — each literal either matches real rows or prints a defensible 0.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-market direction",
          why: "The review reads the heaviest market on top — EU 45, APAC 37, US 19, LATAM 2 — matching the book's weight order. ASC would open on LATAM's two conversations and the grid's story (EU carries 43.7% of everything booked) starts from its quietest line.",
        },
      ],
      distractors: ["'resolved'", "'served'", "ASC", "AVG"],
      walkthrough:
        "One scan, five lenses, and the footings are the correctness argument. COUNT(*) counts booked rows per market; the four FILTER branches each count one status — and because the statuses partition the table, the branches must sum to booked: EU 24+12+6+3 = 45, APAC 21+8+5+3 = 37, US 5+10+3+1 = 19, LATAM 2+0+0+0 = 2, platform 103. The grid's story writes itself off the cells: the US runs inverted (10 in-flight vs 5 resolved — the only market where in-flight outweighs resolutions), LATAM is the honest-zero row proving the branches aren't padded, and EU's 43.7% booked share explains why the review opens there. The distractors fail honestly: 'resolved' and 'served' are NOT statuses on this table — the branch matches zero rows and prints a column of lying zeros; ASC flips the read to start from LATAM; AVG in a status comparison or the ORDER BY is either all-zeros or a syntax error before the grid renders. Filter branches, one denominator, footing identity — the same census four sequential queries can never prove.",
    },
    {
      id: "cs-intercom-5",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The dunning queue",
      brief:
        "Intercom-flavored brief on the storefront db: before billing sends a single dunning email, finance refreshes the anti-join — every subscription statement with NO settlement legs. Probed facts: 6 statements worth 15,217.00, led by INV-2025-024 at 4,937.00, then 3,562.00 and 2,794.00; the list's fourth row is the paid-status liar INV-2025-028 (1,756.00 — marked 'paid', zero payments), and the oldest exposure is INV-2024-018 (873.00, due 2024-11-28). The status column is a claim; the payment rows are the ledger of record — the anti-join is how the close proves the difference.",
      ask: "Return the never-collected statements: number, status, due date and dollar amount, biggest exposure first.",
      template:
        "SELECT i.number,\n       i.status,\n       i.due_on,\n       i.amount_cents / 100.0 AS dollars\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2}\nORDER BY i.amount_cents {3};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 with no payments a NULL payload for the WHERE to catch. INNER JOIN deletes exactly those 6 rows — including the paid-status liar #28, the anomaly this queue exists to expose — and the dunning email never goes out.",
        },
        {
          answer: "IS NULL",
          kind: "keyword",
          label: "the no-legs test",
          why: "p.id IS NULL reads the unmatched payload — the definition of 'never collected'. Writing = NULL instead compares to an unknown and is never true: the queue silently empties, the closest thing SQL has to a bug that files no report.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-exposure direction",
          why: "The queue is worked biggest-first: 4,937.00, 3,562.00, 2,794.00, then the 1,756.00 liar. ASC would open the dunning run on the 873.00 tail and the exposure that actually moves the close (a third of the 15,217.00) sits unworked at the bottom.",
        },
      ],
      distractors: ["INNER", "= NULL", "ASC"],
      walkthrough:
        "An anti-join with a liar in it. The LEFT JOIN attaches each statement's payment legs — 22 statements match, 6 arrive with a NULL payload — and WHERE p.id IS NULL keeps exactly the unmatched: INV-2025-024 (4,937.00), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00, status 'paid' — the claim the payment rows refute), INV-2024-021 (1,295.00) and INV-2024-018 (873.00, due 2024-11-28, the aging tail). The cents rule rides along: amount_cents / 100.0 prints 4,937.00 where the bare /100 would print 4,937 flat. The mirror anomaly this query can never catch is #11 — void status WITH a 925.00 settlement leg — which is why finance runs the coverage census (21 exact / 1 partial / 6 none, footing to 28) alongside the anti-join: the two reads reconcile to each other or the close doesn't ship. INNER JOIN deletes the queue; = NULL empties it; ASC inverts the work order — every distractor breaks a different promise of the memo.",
    },
    {
      id: "cs-intercom-6",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The above-cadence bench",
      brief:
        "Intercom-flavored brief on the storefront db: the growth pod benchmarks expansion against the platform's own cadence — workspaces whose conversation count beats the mean. Probed facts: 16 workspaces carry 103 periods, a mean cadence of 6.4375 (printed 6.44); the bench holds EXACTLY four logos — Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 — with Chloe Dubois's 5 the near-miss below the line. The mean must be COMPUTED from the same CTE the bench filters on, never hardcoded, and the scalar subquery's population (all 16 workspaces, staged before any filter) is the whole correctness argument.",
      ask: "Return the workspaces whose conversation count beats the platform's mean cadence: name, region and period count, heaviest first.",
      template:
        "WITH cadence AS (\n  SELECT customer_id, COUNT(*) AS periods\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name,\n       c.region,\n       cadence.periods\nFROM cadence\nJOIN customers c ON c.id = cadence.customer_id\nWHERE cadence.periods {2} (SELECT {1}(periods) FROM cadence)\nORDER BY cadence.periods {3};",
      slots: [
        {
          answer: "AVG",
          kind: "keyword",
          label: "the mean over the staged fold",
          why: "AVG over the 16 staged cadences computes the platform mean — 6.4375, printed 6.44 — inside the comparison, so the bench re-derives itself every run. SUM would compare against 103 (empty bench), MAX against 24 (Alice can't beat herself), COUNT against 16 (a bench of two that changes whenever a workspace crosses the line).",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-mean comparison",
          why: "The ask is 'beats the mean' — strictly greater. '<' answers the mirror (the 12-workspace sub-mean bench) and '=' matches nothing because no workspace carries exactly 6.4375 periods; the comparison operator IS the population definition, and swapping it changes who gets targeted before any number prints.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The bench reads 24, 17, 14, 13 — biggest expansion first, because the pod works the crown account first. ASC would open the memo on Maya's 13 and bury Alice's 24 at the bottom — a correct query narrated backwards.",
        },
      ],
      distractors: ["SUM", "MAX", "<", "ASC"],
      walkthrough:
        "Stage the grain, compute the mean, filter above it. The CTE folds 103 periods into 16 per-workspace cadences — the mean of that fold is 6.4375, and the scalar subquery (SELECT AVG(periods) FROM cadence) computes it from the SAME staged rows the outer query filters, so the bench can never drift from its own baseline. Four workspaces clear 6.4375: Alice Chen 24, Emma Wilson 17, Grace Kim 14, Maya Patel 13 — exactly the logos the expansion pod targets — with Chloe Dubois's 5 the near-miss that proves the cut is real (5 < 6.4375). The scalar shape matters: it runs ONCE, not per workspace (that's the correlated rewrite, same answer, wasted scans), and its population is all 16 workspaces because it reads the CTE before any filter — an empty staging slice would return NULL and the bench would silently empty, which is why the population ships in the brief. SUM/MAX collapse the bench to nothing; '<' inverts it; ASC tells the story backwards. One fold, one mean, four logos — and the mean is a computation the reviewer can audit, not a constant to trust.",
    },
  ],

  problems: [
    { slug: "product-sales-analysis-ii", why: "Per-SKU line revenue is the pricing page's first chart — fold seat/usage lines to plan-SKU grain and rank. This problem drills the exact fold the Fin-first band report re-cuts weekly." },
    { slug: "sales-analysis-i", why: "Plan-SKU revenue beside units sold is how essential-versus-expert mix gets defended — 268 Fin-first seats at 31.01 against 230 expert seats at 115.85 is this problem's shape at db scale." },
    { slug: "classes-more-than-5-students", why: "HAVING floors are everywhere in workspace targeting — which accounts carry at least N conversation periods. This problem drills the group-level gate the expansion pod sets weekly." },
    { slug: "number-of-employees-who-met-the-target", why: "Teams clearing the queue-clear target is a conditional count against a bar — support ops' weekly pulse and this problem's fold are the same query in different clothes." },
    { slug: "game-play-analysis-i", why: "First touch per workspace anchors every cohort Intercom builds — the trial's first logged conversation. MIN-over-window is the shape." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The 24-period workspace is the intensity crown on this db. Argmax with a subquery guard is exactly how the top-of-ladder read is written." },
    { slug: "find-users-with-high-token-usage", why: "Usage-line outliers flag workspaces outgrowing their plan — the expansion-signal query is a threshold fold over per-account usage, this problem's exact shape." },
    { slug: "combine-two-tables", why: "Workspaces LEFT JOINed to conversation periods: the whitespace read. A workspace with no period is whitespace, a period with no workspace is corruption — choosing the join type is the business statement." },
    { slug: "find-churn-risk-customers", why: "Churn risk is an anti-join over dormancy — workspaces with no recent conversations against a dated cutoff. The same shape drives the winback calendar." },
    { slug: "net-revenue-retention", why: "NRR is the metric Intercom's board actually manages — cohort revenue walks with expansion and churn netted. This problem is that walk at practice scale." },
    { slug: "mrr-waterfall", why: "Seat adds, seat drops and churn roll into a movement waterfall — LAG over period status transitions, the expansion story in one query." },
    { slug: "growth-accounting", why: "New, retained, resurrected, churned — the workspace-accounting identity that reconciles 16 workspaces period over period. LAG status classification, exactly this problem." },
    { slug: "list-the-products-ordered-in-a-period", why: "Outbound campaigns read against period windows — which plan SKUs moved inside the window. Period-bounded folds, exactly this shape." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Which plan SKU a workspace leans on most is the Fin-suggestion read — argmax per account over seat lines, this problem's exact shape." },
    { slug: "the-most-recent-three-orders", why: "Recency windows — a workspace's latest conversation periods — drive the success pod's touch list. Top-N-per-group with ROW_NUMBER, exactly this drill." },
    { slug: "keep-latest-dedupe", why: "Conversation records arrive with restatements — keep-latest dedupe by key is the hygiene pass before any fate census reconciles to 103." },
    { slug: "sessionize-events", why: "Raw touches become conversations by a gap rule — sessionization is the intake step behind every period census Intercom reads, rehearsed at practice scale." },
    { slug: "rolling-7d-actives", why: "Weekly active workspaces is the engagement pulse on the Messenger's front page — a distinct-fold over a rolling window with the population stated." },
    { slug: "dau-wau-stickiness", why: "DAU/WAU is the stickiness ratio support ops quotes beside the resolution rate — two conditional counts sharing one denominator, the Intercom way." },
    { slug: "median-time-to-convert", why: "Median open-to-first-response is the SLA number Fin's containment claims rest on — julianday deltas at the right grain, median not mean." },
    { slug: "customer-order-frequency", why: "Conversations per workspace per month is cadence — the same fold that makes the 24-period workspace the intensity crown on this db." },
    { slug: "repeat-purchase-rate", why: "Workspaces returning with a second conversation in-window is the repeat read over a stated booked base — 50.5-versus-63.4 discipline at practice scale." },
    { slug: "usage-tier-percentiles", why: "Percentile cuts over seat usage are how the pricing pod sketches new Fin bands — window arithmetic that must name its tie policy." },
    { slug: "spend-histogram", why: "Seat-volume histograms need their empty bins printed — the honest zero-fill habit the LATAM fate row proves on this db." },
    { slug: "premier-league-table-ranking", why: "Points, ties, shared rungs — the leaderboard-with-ties drill behind the four-workspaces-at-4 policy the pod publishes." },
    { slug: "second-highest-salary", why: "Second-highest breaks on duplicates — the classic tie trap that motivates DENSE_RANK and the MAX-below-MAX shape on any conversation ladder." },
    { slug: "calculate-orders-within-each-interval", why: "Conversations landing inside response-interval windows is the SLA-compliance fold — half-open buckets, no boundary drift." },
    { slug: "second-day-confirmation", why: "Did the conversation that served yesterday resolve today — the day-after confirmation read Fin's containment story is built on." },
    { slug: "null-blank-audit", why: "Auditing NULL and blank fields across the workspace master is the hygiene pass that keeps every census footing to 103 and 16." },
    { slug: "the-latest-login-in-2020", why: "Latest event inside a fixed window is the recency cut behind winback lists — a max-per-group fold with the boundary stated." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Seat lines above the platform's average quantity flag workspaces outgrowing their plan — the expansion signal in one comparison." },
    { slug: "week-over-week-churn", why: "WoW churn walks the abandonment arm across the spine — LAG beside current week, first row NULL as baseline, exactly this kit's month-walk canon." },
  ],
};
