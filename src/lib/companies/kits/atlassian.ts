// Atlassian — kit 4 of the SaaS & Enterprise domain (Batch I).
// Dev-tool adoption across Jira and Confluence: seat funnels, issue-flow
// velocity, plan migrations and the billing runs underneath. Registry tags
// are thin — exactly 2 tagged sql rows (deferred-revenue, plan-migration-paths)
// — so the pool is mostly theme-curated: every problem mirrors an adoption or
// monetization workflow Atlassian screens are known to probe.
// Case studies run on the storefront db mapped as customers=tenants,
// orders=subscription periods, order_items=seat/usage lines, invoices/
// payments=billing runs — probed figures from scripts/company-facts.md
// (no invented volumes).

import type { CompanyKit } from "../types";

export const atlassianKit: CompanyKit = {
  id: "atlassian",
  domainId: "saas",
  name: "Atlassian",
  tagline: "Dev-tool adoption across Jira and Confluence",
  accent: "text-blue-300",

  brief: [
    "Atlassian is the dev-tool platform behind Jira, Confluence, Jira Service Management, Bitbucket and Trello — sold seat-first, adopted team by team, and monetized through a plan ladder that customers migrate up (and occasionally down). The analytics reality is adoption breadth over depth: a tenant with **500 purchased seats and 40 weekly active** ones is the {rose:churn} story Atlassian's data org exists to see first. On this storefront db the mapping is direct — 16 tenants carry 103 subscription months with 251 seat/usage lines underneath; statuses read like an issue lifecycle (52 delivered, 30 shipped, 14 pending, 7 cancelled), and the product families behave like the product lines they are: Accessories touches **54 of the 103 months** (broad adoption), Audio books **11,744.01 of the 34,833.28** (deep monetization).",
    "The data org splits across growth, product and monetization analytics. Growth models the seat-adoption funnel — purchased seats to activated seats to weekly-active teams — and {violet:cross-product attach} (does a Jira tenant ever open Confluence?). Product analytics owns issue-flow velocity: created, triaged, resolved, the funnel every delivery metric hangs on. Monetization runs the plan ladder and the billing runs: 28 `invoices` against 27 payment rows, with 6 billing runs that {rose:never collected} — **15,217** sitting unresolved — and one partial payment (**4,000 against a 6,148 invoice**) that the reconciliation queries flag by name.",
    "Interview style is funnel-then-definition, twice over: **the adoption funnel AND the money funnel**. A screen walks from a warm-up join to a per-product-family fold (usage lines, distinct tenants, revenue in one `GROUP BY`), then escalates into a `LEFT JOIN` coverage read or a `LAG` transition question — plan migrations, sprint-over-sprint velocity. Follow-ups probe survival: 'does a tenant with an open invoice count as active?', 'is that adoption rate per purchased seat or per activated seat?' *State the denominator twice and you're already ahead.*",
    "Preparation strategy: the registry tags exactly two sql rows for Atlassian (`deferred-revenue`, `plan-migration-paths`) — both drilled in this kit's topics. The rest of the pool is theme-curated around its known screens: seat censuses, issue-funnel conditional counts, adoption windows, **billing-run coverage**. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the product-family adoption fold its growth reviews open with, the other rebuilds the billing-run coverage read its finance close runs every month.",
  ],

  dayInLife: [
    "**08:30 —** The morning starts on two dashboards at once — adoption and money. The adoption side opens with the seat funnel: tenants carrying product lines, activation share per family, the Accessories-style breadth read (**54 of 103** months touched) against the Audio-style depth read (**11,744.01 of 34,833.28**). The money side opens with the billing run: 28 invoices issued, 21 paid, 6 runs that {rose:never collected} — and the first query of the day is the coverage reconciliation that proves those two counts again, because a billing run that silently misses an invoice is next month's escalated ticket.",
    "**10:30 —** Midday is adoption surgery. A growth PM wants {violet:cross-product attach} per tenant — who runs one family and never touches the second; a platform lead wants plan-migration paths (which tier tenants moved from and to, via a `LAG` over their subscription months); a CS manager wants the tenants whose usage dropped month-over-month before their renewal call. Each ask is a join at a stated grain, a conditional aggregate, and a denominator argument — purchased seats or activated seats, all months or kept months — and the analyst ships the query with the definition in the comment.",
    "**14:30 —** The afternoon is the stakeholder loop. Weekly delivery reviews walk the issue funnel with SQL attached to every number; finance closes the month against the coverage read — exact-payment invoices (21), the partial (**4,000 of 6,148**), the void that a payment row touched anyway — and every mismatch is *a named incident, not a footnote*. This is where the two funnels collide in front of an audience: adoption claims on one slide, billing truth on the next, and the analyst owns the join between them.",
    "**17:00 —** End of day writes down what the loops proved. The migration-path query gets saved with its transition `CASE` annotated — new, upgrade, downgrade, flat; the coverage census is rerun once more so tomorrow's close starts from a clean count; and the adoption deck's denominators get a final read — *purchased seats or activated seats, stated on every chart*. The rhythm to internalize: Atlassian SQL exists to defend two funnels at once, and the analyst who can rebuild both from raw tables in one sitting is the one the renewal review wants in the room.",
  ],

  metrics: [
    { name: "Seat adoption rate", what: "Activated seats ÷ purchased seats, per tenant and product family. THE Atlassian efficiency metric — a two-table join at two grains where the denominator choice changes the story entirely." },
    { name: "Issue funnel completion", what: "Issues created → triaged → resolved per period. The delivery-health funnel; each stage is a conditional count over the same population, and drop-off between stages is the sprint story." },
    { name: "Deployment velocity", what: "Releases per tenant-month, trended. The velocity leaderboard read — a ranking-window question with tie-handling, because teams ship in bursts." },
    { name: "Cross-product attach", what: "Share of tenants active in 2+ product families. The expansion signal — on this db, families like Accessories touch 54 of 103 months while Fitness touches 13, and attach is the difference read." },
    { name: "Plan migration rate", what: "Tenants changing tier per quarter, upgrade vs downgrade. The tagged problem drills the LAG-transition grammar; the CASE classification of the move is the interview's real test." },
    { name: "Billing-run coverage", what: "Invoices with a settled payment ÷ all invoices — 21 of 28 exact, one partial (4,000 of 6,148), six with no payment at all (15,217 outstanding). A LEFT JOIN census finance reruns every close." },
    { name: "Family revenue depth vs breadth", what: "Revenue per family against months touched: Audio monetizes deep (11,744.01 over 46 months), Accessories spreads wide (3,294.29 over 54). The two-column read that decides where adoption work pays." },
    { name: "Kept-month rate", what: "Delivered subscription months ÷ all billed months — 52 of 103 (50.5%), with 6.8% cancelled before close. Atlassian's orders-placed vs orders-kept read on its own book." },
  ],

  topics: [
    {
      name: "Tenant and seat censuses",
      why: "Every growth review opens with a two-grain census: subscription months AND tenants per family or region. COUNT(*) counts months; COUNT(DISTINCT customer_id) counts tenants — Accessories' 54 touched months collapse to 14 tenants. The kit's first case study rebuilds this fold, and screens probe whether you can hold both grains without fanning the join.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "product-sales-analysis-ii"],
    },
    {
      name: "Issue-funnel conditional counts",
      why: "The issue funnel is all conditional counting: created, resolved, cancelled — branches of one population. A resolution rate computed over the wrong denominator (all issues vs issues with a resolution) is not a small error; it's a different delivery story. Atlassian drills SUM-over-flag until the denominator question is reflexive.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "number-of-rich-customers"],
    },
    {
      name: "Join enrichment across the product graph",
      why: "Seat lines carry no tenant or family name — enrichment joins two attributes deep, and the interview question is always about what survives the join: does a seat line with a stale mapping appear in the adoption census, silently inflating it?",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "students-and-examinations"],
    },
    {
      name: "Adoption windows and cohort stickiness",
      why: "Atlassian growth asks windowed questions: did the tenant activate within 30 days of purchase, are they active in week N after signup. DAU/WAU stickiness and cohort matrices are the weekly grammar — and the half-open interval is the recurring trap.",
      slugs: ["feature-adoption-windows", "cohort-retention-matrix", "dau-wau-stickiness"],
    },
    {
      name: "Plan migrations and tier transitions",
      why: "The registry-tagged plan-migration-paths problem is the exact screen: LAG over a tenant's subscription months, then classify the move — new, upgrade, downgrade, flat. The CASE on the transition is where candidates wobble, and the self-join twin is where they fan out.",
      slugs: ["plan-migration-paths", "growth-accounting", "week-over-week-churn"],
    },
    {
      name: "Velocity leaderboards",
      why: "Deployment velocity and issue throughput are leaderboard reporting: top teams per family, second-fastest per tier. Atlassian drills the rank trio because ties are routine and the LIMIT-1-OFFSET-1 habit silently drops them.",
      slugs: ["rank-scores", "department-top-three-salaries", "the-most-recent-three-orders"],
    },
    {
      name: "Billing runs and deferred revenue",
      why: "The tagged deferred-revenue problem is Atlassian's money grammar: revenue recognized over the months a subscription covers, not when the invoice lands. On this db the billing layer is 28 invoices and 27 payments — folds that demand cents-safe arithmetic and status-aware filters.",
      slugs: ["deferred-revenue", "bank-account-summary-ii", "monthly-transactions-ii"],
    },
    {
      name: "Coverage reads with LEFT JOIN",
      why: "Seats purchased with no activation, invoices with no payment, tenants with no second product — coverage is a LEFT JOIN + IS NULL census. On this db it's honest: 6 billing runs never collected, 15,217 outstanding. The trap is filtering the right table in WHERE and silently downgrading to an INNER.",
      slugs: ["bank-account-summary", "count-student-number-in-departments", "number-of-times-a-driver-was-a-passenger"],
    },
    {
      name: "Deployment cadence and date math",
      why: "Velocity is calendar arithmetic: releases within 7 days, latest deploy per team, activity inside a contract month. Atlassian screens probe the interval edges — BETWEEN on a boundary loses the last day, and the missing sprint reads as a stall that isn't there.",
      slugs: ["users-with-two-purchases-within-seven-days", "the-latest-login-in-2020", "list-the-products-ordered-in-a-period"],
    },
    {
      name: "Tracker hygiene",
      why: "Issue imports arrive messy: titles in mixed case, keys with stray whitespace, empty components. Atlassian screens warm up with string reshaping because a join on a dirty key fans the adoption census — and the fan-out ships to a growth review before anyone notices.",
      slugs: ["fix-names-in-a-table", "invalid-tweets", "null-blank-audit"],
    },
  ],

  theory: [
    {
      id: "atl-t1",
      q: "Growth wants 'subscription months AND tenants per product family.' Why do those two columns need different expressions, and what does the gap between them tell the business?",
      a: "COUNT(*) after the join counts seat lines at month grain — Accessories' 54 touched months; COUNT(DISTINCT o.customer_id) folds repeats back to tenants — 14. Compute both with COUNT(*) and the census prints one number twice, and the breadth-vs-depth signal dies: 54 months over 14 tenants is broad adoption, while Audio's 46 months over 14 tenants at 11,744.01 revenue is deep monetization. The gap between the columns IS the expansion story — months per tenant is usage intensity, and Atlassian's whole growth motion is raising it family by family.",
      tag: "aggregation",
    },
    {
      id: "atl-t2",
      q: "A resolution-rate query must exclude cancelled issues from BOTH the numerator and the denominator. Where does each exclusion live and why?",
      a: "The numerator is a conditional aggregate — SUM(CASE WHEN status='resolved' THEN 1 ELSE 0 END) — computed over whatever rows survive; the denominator question decides the WHERE. If cancelled issues leave the population entirely, the status filter belongs in WHERE, discarding those rows before the fold. If cancelled issues must stay counted in the denominator (placed-vs-kept framing), they stay in the table and the numerator's CASE simply doesn't flag them. What never works is putting the numerator's condition in WHERE and expecting the denominator to stay whole — the rows are already gone. Atlassian's follow-up is always 'state your denominator', because both versions are defensible and only one is what the PM asked for.",
      tag: "filtering",
    },
    {
      id: "atl-t3",
      q: "How would you build the plan-migration report — which tier each tenant moved from and to each quarter — and why is LAG the right tool over a self-join?",
      a: "Stage one fold per tenant's timeline: order their subscription months, LAG(plan_tier) OVER (PARTITION BY tenant ORDER BY month) pulls the previous tier beside the current one, then CASE classifies the transition — NULL prior means new, prior < current is an upgrade, prior > current a downgrade. LAG keeps every row, states the intent in one clause, and never drops the first period; a self-join needs an anti-condition for the baseline month and fans out on any tenant with two months in one period. The migration report is Atlassian's tagged workflow precisely because the transition CASE is where candidates stall — the strong answer narrates the window before the classification.",
      tag: "windows",
    },
    {
      id: "atl-t4",
      q: "Your seat-adoption join returned 700 rows for 251 seat lines. What happened and what's the two-query diagnosis?",
      a: "Fan-out: the join key wasn't unique on one side, so each seat line matched multiple attribute rows and the census multiplied. Diagnosis is two counts: rows after the join versus COUNT(DISTINCT seat_line_id) on the same result — if distinct is 251 but rows are 700, the join is the multiplier and no amount of DISTINCT in the final SELECT saves the sum columns. The fix is grain discipline: pre-aggregate the many side to one row per key, or join on the true key. Atlassian hammers this because a fanned adoption census overstates usage silently — and an overstated adoption number in a renewal deck is a promise CS can't keep.",
      tag: "joins",
    },
    {
      id: "atl-t5",
      q: "Finance wants billing-run coverage: invoices with a settled payment, including the partial (4,000 of 6,148) and the runs that never collected. Sketch the query shape.",
      a: "LEFT JOIN invoices to payments on the invoice key, then classify coverage per invoice — GROUP BY the invoice and compare SUM(payments) to the invoice amount: exact, partial (the 4,000-against-6,148 case), or none (the 6 runs totaling 15,217). The critical discipline is keeping the invoice row even when no payment exists — that's the LEFT, and the IS NULL arm is where the outstanding money lives. Filter the right table's columns in WHERE after that LEFT and you've silently converted to an INNER and deleted the 6 runs from the report — the exact bug this coverage read exists to prevent.",
      tag: "joins",
    },
    {
      id: "atl-t6",
      q: "When does a correlated subquery beat a join for a per-tenant adoption read, and what's the performance instinct?",
      a: "A correlated subquery earns its keep when the comparison is per-row against a group statistic — tenants whose active seats exceed their plan-family's average, months above the tenant's own baseline. The inner query runs once per outer row: correct, readable, and quadratic on big tables. The join-or-derived-table twin computes the group stats once and joins back — the shape you reach for when the outer side is large. Atlassian's instinct: on tenant-sized populations (16 rows here, thousands in production) the correlated shape is fine and clearer; on seat-line grain, pre-aggregate. The interview target is knowing both shapes AND when each becomes the wrong one.",
      tag: "subqueries",
    },
    {
      id: "atl-t7",
      q: "A sprint board exports NULL for 'unassigned estimate' on 30% of issues. Your velocity average looks too high. Why, and what do you do?",
      a: "AVG ignores NULLs — it averages only the estimated issues, so the 70% that carry estimates set the bar and the unestimated 30% vanish from the denominator. That's not a velocity, it's a survivorship bias. The fix depends on the ask: if unestimated work is real work, COALESCE the estimate to the team's default size so the denominator is all issues; if unestimated issues aren't comparable, report the estimate-coverage share (7 of 10) next to the average so nobody mistakes a biased mean for a team metric. Atlassian's rule: never let an aggregate's silent NULL-exclusion define a population — the coverage stat ships with the metric or the metric doesn't ship.",
      tag: "nulls",
    },
    {
      id: "atl-t8",
      q: "The monthly adoption report disagrees with the billing report by exactly the cancelled months. Walk me through the reconciliation query you run first.",
      a: "Diff the populations before the numbers: month-bucket both reports' source tables and compare three identities — row counts per month, status mix (52 delivered, 30 shipped, 14 pending, 7 cancelled on this db), and revenue sums to 2 decimals. The giveaway for a definition drift is structural: one side's WHERE excludes cancelled months and the other's doesn't, so the gap equals the cancelled count every single month — a pattern, not noise. The reconciliation query's job is to print that gap per month with its cause column attached, because 'adoption counts kept months, billing counts placed months' is a sentence that must come with a number, not a theory.",
      tag: "data-quality",
    },
  ],

  mcqs: [
    {
      id: "atl-mcq-1",
      prompt: "The Accessories family touches 54 of 103 subscription months but only 14 tenants. Which expression returns the 14?",
      choices: [
        "COUNT(oi.order_id)",
        "COUNT(DISTINCT o.customer_id)",
        "SUM(o.customer_id)",
        "COUNT(*) / COUNT(DISTINCT o.customer_id)",
      ],
      answer: 1,
      why: "COUNT(DISTINCT customer_id) folds repeat months back to people — 14 — while COUNT(*) counts the 54 month-touches. The gap between the two columns is the breadth-vs-depth signal growth reviews open with.",
      notes: [
        { choice: 0, why: "COUNT(order_id) counts non-NULL order keys — with the join fanned per line, that's the line count again, not tenants." },
        { choice: 2, why: "SUM over an id column is a nonsense number that happens to execute — the classic silent-garbage aggregate." },
      ],
      difficulty: "easy",
    },
    {
      id: "atl-mcq-2",
      prompt: "The Audio family shows 97 units across its seat lines. Which expression returns 97 (not the line count)?",
      choices: [
        "COUNT(oi.quantity)",
        "COUNT(*)",
        "SUM(oi.quantity)",
        "AVG(oi.quantity) * COUNT(*)",
      ],
      answer: 2,
      why: "SUM(quantity) folds seat counts across lines — 97 for Audio. COUNT and COUNT(*) both count lines (how many rows), which is a different grain than how many seats moved.",
      notes: [
        { choice: 0, why: "COUNT(quantity) counts non-NULL quantities — one per line. It reports adoption events, not seats." },
        { choice: 3, why: "AVG × COUNT happens to reconstruct SUM here — cute, but it breaks the moment any quantity is NULL and reads like an accident in review." },
      ],
      difficulty: "easy",
    },
    {
      id: "atl-mcq-3",
      prompt: "`SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE i.status = 'open'` — which rows can this query never return, and why?",
      choices: [
        "Paid invoices — the WHERE excludes them",
        "Invoices whose LEFT JOIN found no payment — wait, it can return those; nothing is lost",
        "Open invoices with no payment rows — their p.* is NULL but i.status is 'open', so they survive",
        "None — LEFT JOIN guarantees every invoice survives any WHERE",
      ],
      answer: 0,
      why: "The WHERE filters the LEFT table's own column, so LEFT JOIN survival logic still holds: every open invoice appears, paid ones are excluded by the status test itself. The subtle read is choice 3 — LEFT guarantees survival only from the right table's filters, not from filters on the left table.",
      notes: [
        { choice: 1, why: "Half right, half asleep: unmatched invoices DO survive — but the question is which rows the query can NEVER return, and the status filter already answered that." },
        { choice: 3, why: "The classic overgeneralization. LEFT JOIN protects rows from right-table predicates in WHERE; it does nothing about left-table predicates, which is exactly what makes choice 0 correct." },
      ],
      difficulty: "medium",
    },
    {
      id: "atl-mcq-4",
      prompt: "6 of 28 invoices have no payment rows (15,217 outstanding). A teammate rewrites the coverage query with an INNER JOIN 'for performance'. What does it return?",
      choices: [
        "The same 6 unpaid invoices, faster",
        "0 rows — unpaid invoices have no payment match, and INNER JOIN drops them",
        "All 28 invoices — INNER JOIN is the same as LEFT here",
        "Only the partial-payment invoice",
      ],
      answer: 1,
      why: "The entire point of the coverage census is the unmatched arm. INNER JOIN keeps only invoice-payment pairs — the 6 never-collected runs vanish, and the report reads 'nothing outstanding' on a month with 15,217 open. Performance tuning that deletes the finding is not tuning.",
      notes: [
        { choice: 2, why: "INNER keeps only matches — 22 of 28 invoices have payment rows, so the rewrite returns those 22 matched invoices, not 28." },
        { choice: 3, why: "The partial invoice (#25) HAS a payment row (4,000), so it survives an INNER — but so do the other 21 paid ones. The rewrite doesn't isolate partials; it deletes the unpaid." },
      ],
      difficulty: "medium",
    },
    {
      id: "atl-mcq-5",
      prompt: "Two teams tie at 14 resolved issues for the velocity crown; the next team has 13. `DENSE_RANK() OVER (ORDER BY resolved DESC)` gives the 13-issue team rank…",
      choices: ["1", "2", "3", "4"],
      answer: 1,
      why: "DENSE_RANK shares rank 1 across the tie and hands the next distinct value rank 2 — no gaps. RANK would say 3 (gap kept), ROW_NUMBER would arbitrarily split the leaders.",
      notes: [
        { choice: 2, why: "That's RANK's answer: ties share 1, next jumps to 3. The gap implies a missing second-place team that doesn't exist." },
        { choice: 0, why: "Rank 1 for a strictly-lower count means the ORDER BY direction flipped — a leaderboard that crowns the wrong team entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "atl-mcq-6",
      prompt: "Invoice amounts are stored as INTEGER cents (invoice #1 = 486,000). Which expression prints 4,860.00 dollars?",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100, 2)",
        "ROUND(amount_cents / 100.0, 2)",
        "amount_cents * 0.01",
      ],
      answer: 2,
      why: "The 100.0 divisor promotes to floating point before the division. With INTEGER 100, cents/100 is integer division — safe when cents divide evenly (486,000 does), lethal on odd cents where the remainder silently vanishes.",
      notes: [
        { choice: 0, why: "Integer division returns an integer — 4860 here by luck, but 4,861 cents would print 48.00 not 48.61. The bug ships on the first odd-cent row." },
        { choice: 1, why: "ROUND arrives after the division has already truncated to an integer — it rounds a number that lost its cents two operations earlier." },
      ],
      difficulty: "medium",
    },
    {
      id: "atl-mcq-7",
      prompt: "You classify plan migrations with `CASE WHEN prev_tier IS NULL THEN 'new' WHEN prev_tier < current THEN 'upgrade' …` where prev_tier comes from LAG. What does LAG return on a tenant's first month, and why does the CASE need that arm first?",
      choices: [
        "0 — the arm is defensive but never fires",
        "NULL — the first month has no prior tier, and 'new' must be classified before the < / > comparisons, which are UNKNOWN against NULL",
        "The current tier — LAG defaults to the current row",
        "It errors — LAG cannot be used inside CASE",
      ],
      answer: 1,
      why: "LAG on the partition's first row returns NULL, and every comparison with NULL is UNKNOWN — so prev_tier < current would silently fall through every arm and land in ELSE. The IS NULL arm must come first or 'new' tenants classify as something else (or nothing).",
      notes: [
        { choice: 0, why: "Only LAG(x, 1, 0) with an explicit default returns 0. The bare LAG returns NULL — and NULL-poisoned comparisons are the whole reason for arm ordering." },
        { choice: 2, why: "LAG never defaults to the current row. If it did, every migration would read 'flat' and the report would show zero movement in a churning book." },
      ],
      difficulty: "hard",
    },
    {
      id: "atl-mcq-8",
      prompt: "Per-tenant active-seat counts vs that tenant's family average: which query shape recomputes the family average for EVERY tenant row?",
      choices: [
        "A derived table joining pre-aggregated family averages",
        "A correlated subquery in the SELECT or WHERE referencing the outer tenant",
        "A GROUP BY on family with the average in HAVING",
        "A window: AVG(seats) OVER (PARTITION BY family) — it's per-row too",
      ],
      answer: 1,
      why: "The correlated subquery executes once per outer row — that's its definition. The derived-table shape computes family averages once and joins; the window computes the partition average in one pass per row but without a nested execution.",
      notes: [
        { choice: 0, why: "Pre-aggregation is the performance fix precisely because it computes each family average once — the opposite of the correlated pattern." },
        { choice: 3, why: "The window IS a strong answer for same-shape comparisons — but it's not 'recomputing a subquery per row'; the interview target is knowing the correlated shape's cost profile." },
      ],
      difficulty: "hard",
    },
    {
      id: "atl-mcq-9",
      prompt: "Which WHERE clause correctly selects subscription months activated in February 2024, including the last day of the month?",
      choices: [
        "WHERE activated_at BETWEEN '2024-02-01' AND '2024-02-29'",
        "WHERE activated_at >= '2024-02-01' AND activated_at < '2024-03-01'",
        "WHERE STRFTIME('%Y-%m', activated_at) = '2024-2'",
        "WHERE activated_at LIKE '2024-02%'",
      ],
      answer: 1,
      why: "The half-open interval [Feb 1, Mar 1) is exact for any timestamp precision: the 29th's 23:59:59 lands inside, March 1 at 00:00 falls out. BETWEEN with a date literal caps at midnight — the month's last day vanishes, and the missing activations read as a stall.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive of both ends — '2024-02-29' as a timestamp is midnight, so every activation later that day is silently cut." },
        { choice: 2, why: "'%m' zero-pads: February prints '2024-02', and this predicate matches nothing — an empty report that looks like a clean month." },
      ],
      difficulty: "easy",
    },
    {
      id: "atl-mcq-10",
      prompt: "The adoption census must count tenants with a Confluence seat who NEVER activated Jira. The registry db's anti-join for never-ordered customers returns 0. What does that 0 actually tell you?",
      choices: [
        "The query is broken — every tenant has gaps somewhere",
        "The population is genuinely fully covered: every customer has order rows, so a customer-grain anti-join here is structurally empty — move the anti-join to a dimension where gaps exist (invoices without payments)",
        "It means all 16 tenants churned",
        "Anti-joins always return 0 on subscription data",
      ],
      answer: 1,
      why: "A 0 from an anti-join is a finding about the schema's referential coverage, not a bug: every customer row has orders, so the customer-order anti-join is empty by construction. The discipline is knowing where gaps CAN live — on this db, invoices without payments (6) is the anti-join that carries signal.",
      notes: [
        { choice: 0, why: "Zero is a valid result. Hunting for a bug because an anti-join returned empty inverts the diagnostic — verify the grain, then trust the number." },
        { choice: 2, why: "Conflating an empty anti-join with churn confuses two grains: absence of orders per customer is coverage; status counts are lifecycle. They're different queries." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-atl-1",
      tier: "medium",
      topic: "j7",
      universe: "funnel",
      title: "The product-family adoption fold",
      brief:
        "Atlassian-flavored brief on the storefront db: the growth review opens with the product-family fold — every family's usage lines folded into three columns at once, because breadth and depth argue with each other and the PM wants both on one row. The memo is explicit: 'units is seats moved, tenants is reach, revenue is monetization — three grains, one GROUP BY, and I read them against each other.' Probed facts: 251 seat/usage lines fold to Audio at 97 units and 11,744.01 revenue; Accessories touches breadth-first with 121 units over just 3,294.29; Fitness sits at the bottom with 27 units, 863.91. The fold joins usage to the product catalog and back to the tenant, and every column must fold the SAME rows — a census whose reach and revenue disagree about population is how adoption numbers end up in a shouting match.",
      ask: "Return each product family with units moved, distinct tenants reached, and revenue (2 decimals), biggest revenue first.",
      template:
        "SELECT p.category AS product_family,\n       {1}(oi.quantity) AS units,\n       COUNT({2} o.customer_id) AS tenants,\n       ROUND(SUM(oi.quantity * oi.unit_price), {3}) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nJOIN orders o ON o.id = oi.order_id\nGROUP BY p.category\nORDER BY revenue {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the seats-moved fold",
          why: "SUM(quantity) folds seat counts across lines — Audio's 97. COUNT would count adoption events (lines), a different grain; MAX would report the single biggest line and call it the family total.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the reach fold",
          why: "COUNT(DISTINCT o.customer_id) collapses repeat months to tenants — Audio reaches 14. Without DISTINCT the column echoes the line count, and breadth reads as reach: the exact inflation this fold exists to prevent.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the cent-precision cut",
          noVerify: true,
          why: "Revenue prints to cents — 11,744.01 for Audio — because finance joins this census to the billing run. At 1 decimal the family total stops reconciling against the invoice fold by visible pennies.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the depth-first direction",
          why: "The review reads monetization-first: Audio 11,744.01, Wearables 6,929.12, down to Fitness 863.91. ASC would open the deck with the smallest family — a correct query leading with the weakest argument.",
        },
      ],
      distractors: ["COUNT", "MAX", "1", "ASC"],
      walkthrough:
        "One fold, three grains, one population. The two joins walk each of 251 seat lines to its product family and its tenant; GROUP BY family folds them once, and every column aggregates the same rows — that's the audit the PM asked for. SUM(quantity) reads 97 for Audio and 121 for Accessories; COUNT(DISTINCT customer_id) reads 14 tenants for both — and the divergence between those columns is the whole story: Accessories is breadth (121 units spread over 54 touched months), Audio is depth (97 units concentrated into 11,744.01). COUNT in the units slot silently reports line counts instead of seats — 251 lines total, a number that looks plausible for exactly one review. The revenue column reconciles against the facts-file family crowns by construction, and ORDER BY revenue DESC makes the deck's first row the deepest-monetizing family. Drop the DISTINCT and tenants reads 97 for Audio too — reach and volume collapsed into one number, which is precisely the conflation this census is built to catch.",
    },
    {
      id: "cs-atl-2",
      tier: "easy",
      topic: "j4",
      universe: "month-close",
      title: "The billing runs that never collected",
      brief:
        "Atlassian-flavored brief on the storefront db: finance's month-close starts with the coverage census — billing runs that issued an invoice and never collected a payment. The controller's memo is blunt: 'LEFT JOIN, IS NULL, count and sum. If your rewrite uses INNER JOIN you will report nothing outstanding on a month with real money sitting open.' Probed facts: 28 invoices against 27 payment rows; 21 settled exact, 1 partial (4,000 against a 6,148 invoice — that run HAS a payment, so it is NOT in this census), and exactly 6 invoices with no payment row at all, carrying 15,217. The census must count invoice rows, not payment rows — the join fans only one way here, but the discipline is the habit.",
      ask: "Return one row: the count of invoices with no payment and their total amount in dollars (2 decimals).",
      template:
        "SELECT COUNT(*) AS unpaid_invoices,\n       ROUND({1}(i.amount_cents) / {2}, 2) AS unpaid_amount\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {4};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the outstanding-money fold",
          why: "SUM(i.amount_cents) adds the 6 unmatched invoices to 1,521,700 cents. COUNT would divide 6 by 100 and print 0.06 — a report that says fifteen cents is outstanding on fifteen thousand dollars of AR.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents-to-dollars divisor",
          noVerify: true,
          why: "The ledger stores cents, so the dollar read divides by 100.0 — the .0 forces real division. A bare 100 would work on even cents and silently truncate odd ones; the divisor is policy, not arithmetic.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the keep-the-invoice join",
          why: "LEFT JOIN keeps every invoice even when no payment matches — the 6 unpaid rows survive with NULL payloads. INNER would drop exactly the rows the census exists to find: the coverage report would read zero outstanding.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the never-collected test",
          why: "p.id IS NULL keeps only unmatched invoices — 6 of them. IS NOT NULL would return the settled 22 instead: the complement, printed as if it were the finding.",
        },
      ],
      distractors: ["COUNT", "10.0", "INNER", "NOT NULL"],
      walkthrough:
        "The anti-join census in its cleanest form. LEFT JOIN invoices to payments keeps all 28 invoice rows; the 22 that matched carry payment payloads, the 6 that never collected carry NULLs — and p.id IS NULL is the filter that keeps exactly those 6. The fold sums their cents: 1,521,700, divided by 100.0 into 15,217.00 dollars, reconciling against the facts-file AR probe (6 unpaid invoices, 15,217). Two traps live in this query's mirror world: INNER JOIN would silently delete the finding — the report ships 'nothing outstanding' while the money sits open — and IS NOT NULL would print the settled side as if it were the gap. Note what the census deliberately excludes: the partial run (invoice #25, 4,000 paid against 6,148) HAS a payment row, so it never appears here; partial-payment detection is a sibling query with its own threshold logic. COUNT in the money slot is the classic grain error — 6 divided by 100 is a report that rounds a five-figure receivable down to a nickel.",
    },
  ],

  problems: [
    { slug: "plan-migration-paths", why: "One of Atlassian's two registry-tagged problems: LAG over a tenant's tier timeline, then classify the move — the plan-migration screen verbatim." },
    { slug: "deferred-revenue", why: "The other tagged problem: revenue recognized over the months a subscription covers — the money grammar underneath every Atlassian billing read." },
    { slug: "feature-adoption-windows", why: "Adoption measured inside a window after purchase — the activation-window question growth asks per product family." },
    { slug: "daily-leads-and-partners", why: "Two-grain census in one GROUP BY — months touched AND tenants reached, the fold the kit's first case study rebuilds." },
    { slug: "immediate-food-delivery-ii", why: "A kept-share rate with an honest denominator — the resolution-rate shape where cancelled issues must not leak into either side." },
    { slug: "bank-account-summary", why: "LEFT JOIN coverage with deposit/withdrawal classification — the billing-run census pattern: exact, partial, never-collected." },
    { slug: "dau-wau-stickiness", why: "Weekly-over-daily activity ratio — seat stickiness per tenant, the adoption health metric Atlassian growth watches weekly." },
    { slug: "week-over-week-churn", why: "LAG-based period churn — the tenant-loss walk CS runs before renewal calls." },
    { slug: "rank-scores", why: "Tie-aware velocity leaderboards — teams ship in bursts, so the rank trio's tie behavior is a real requirement." },
    { slug: "null-blank-audit", why: "Null/blank field census — tracker-hygiene triage before any join on imported issue keys." },
    { slug: "number-of-rich-customers", why: "Counting tenants above a spend line — the tier-census warm-up; 63.5% of this book's value sits with tenants over 3,000." },
    { slug: "students-and-examinations", why: "Three-way join with per-group counts and averages — the cross-product attach read across tenants, families and months." },
    { slug: "monthly-transactions-ii", why: "Month-bucketed status classification — the delivered/shipped/pending/cancelled fold that mirrors the issue lifecycle." },
    { slug: "the-latest-login-in-2020", why: "Latest activity per actor inside a year — the freshest-deploy and freshest-billing reads that staleness dashboards run." },
    { slug: "fix-names-in-a-table", why: "Case-normalizing names before joins — dirty keys fan the adoption census silently; hygiene comes first." },
    { slug: "count-student-number-in-departments", why: "LEFT JOIN with counts that must include empty arms — departments with zero students = families with zero adoption, the coverage read." },
  ],
};
