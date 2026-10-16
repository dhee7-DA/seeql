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
    "Preparation strategy: the pools file carries no Intercom section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: resolution funnels, two-grain censuses, queue-clear clocks, denominator discipline, CASE seat bands and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {violet:resolution-fate census} support ops opens Monday with, the other rebuilds the {emerald:Fin-first seat bands} the pricing pod re-cuts every cycle. The bar to clear: *state the base and the stamp filter before you compute anything* — then make every fate count reconcile to 103 by construction.",
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
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "email-engagement-funnel"],
    },
    {
      name: "Two-grain workspace censuses",
      why: "Periods and workspaces are different grains of the same join, and every census here reports both: EU runs 45 periods from 8 workspaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which column is load and which is coverage — is the habit being graded. The ratio (5.6 versus 9.5) is the intensity read that decides whether growth is broadening or concentrating.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "article-views-ii"],
    },
    {
      name: "Queue-clear clocks",
      why: "Every latency screen here runs on the stamp: a conversation opens at created_at, clears the queue at shipped_at, and the clock averages over stamped rows only. Each stage is a julianday delta with a stated population — 82 stamped of 103 booked, the 14 open excluded by definition. Writing the delta without naming the population is exactly how a 2.98-day number gets misquoted in the exec review.",
      slugs: ["average-time-of-process-per-machine", "first-and-last-call-on-the-same-day", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Denominator discipline",
      why: "Intercom's headline metric is a ratio with a contested base: 52 resolutions over 103 booked reads 50.5, over the 82 that cleared the queue it reads 63.4 — 12.9 points apart, same numerator. The drills here force the 100.0-before-division habit, the ELSE-0 arm inside AVG(CASE), and the explicit statement of what the denominator holds. Candidates who divide before promoting to real arithmetic ship a flat zero to the exec deck.",
      slugs: ["queries-quality-and-percentage", "confirmation-rate", "immediate-food-delivery-ii"],
    },
    {
      name: "Seat bands with CASE",
      why: "Seat tiers are CASE-classified — the band fold splits 251 lines into 268 sub-55 Fin-first seats and 230 expert seats, and plan SKUs band into essential/advanced/expert the same way. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the containment story, and a reordered WHEN quietly re-bands the base. The threshold is load-bearing — real line prices sit either side of the 55 cut.",
      slugs: ["calculate-special-bonus", "count-salary-categories", "loan-types"],
    },
    {
      name: "Containment leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four workspaces sit at 4 periods each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer workspaces, not syntax. The support pod publishes the policy on its boards; candidates are asked to defend it.",
      slugs: ["rank-scores", "department-top-three-salaries", "group-employees-of-the-same-salary"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month period spine (2024-01 to 2025-02) is the volume call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and the abandonment spikes (2 in July, 2 in November) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. The spine is also where STRFTIME buckets get built, and '%m' alone would merge January 2024 into January 2025.",
      slugs: ["biggest-window-between-events", "year-on-year-growth-rate", "consecutive-transactions-with-increasing-amounts"],
    },
    {
      name: "One-pass fate censuses",
      why: "The ops board wants open, served, resolved and abandoned in ONE scan — 14, 30, 52, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The reconciliation identity (branches sum to COUNT(*)) is the correctness argument the panel listens for.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "snaps-analysis"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — served-in-flight under abandoned, this quarter beside last — and EXCEPT answers 'which billed workspaces never cleared the queue'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. The billing anti-join (6 never-collected statements worth 15,217.00) is the same algebra pointed at money.",
      slugs: ["league-statistics", "customers-who-never-order", "dormant-reactivation"],
    },
    {
      name: "Billing rails & cents discipline",
      why: "Billed is not settled — the finance tables (28 statements, 27 payment legs, INTEGER cents) are where the workspace world meets money. Every dollar read is amount_cents / 100.0, and the rails split self-serve from enterprise: card legs (16, 37,364.00) against wire legs (11, 32,248.00), with 5 cycles settling on both. The exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
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
  ],
};
