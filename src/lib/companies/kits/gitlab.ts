// GitLab — Wave-8 (Task 96), saas domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// DevOps-platform SQL: the storefront db read as a subscription fleet sandbox — customers are
// namespaces (self-managed instances or SaaS top-level groups), orders are seat subscription
// renewals (delivered = renewed to term, shipped = running on the fleet with shipped_at as the
// go-live stamp, pending = provisioning queued, cancelled = churned mid-term), order_items are
// the seat lines on each renewal (quantity = seats, unit_price = per-seat price). The DORA read
// maps onto the go-live stamps: created_at -> shipped_at is the lead-time analog (2.98-day
// average over the 82 stamped rows). One-pass fleet censuses, two-grain namespace counts,
// tie-heavy renewal leaderboards, Free/Premium/Ultimate CASE banding, the 14-month renewal
// spine, and the INTEGER-cents billing tables under "renewed". Pool provenance: company-pools.md
// carries NO GitLab section — 0 tagged rows — so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's sql rows and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against db/custom.db by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const gitlabKit: CompanyKit = {
  id: "gitlab",
  domainId: "saas",
  name: "GitLab",
  tagline: "DevOps pipelines from idea to production",
  accent: "text-orange-400",

  brief: [
    "**GitLab** is the DevOps platform that runs the whole software lifecycle in one application — repositories and merge requests, CI/CD pipelines, security scanning, packaging and release tooling — so a change travels from idea to production inside a single data model. It monetizes per seat across Free, Premium and Ultimate tiers, which means every growth number in the building is a conditional count over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are namespaces, the 103 orders are seat subscription renewals worth **34,833.28**, and the 251 order_items rows are seat lines — quantity = seats, unit_price = per-seat price. The status map is fixed: delivered = {emerald:renewed to term} (52, 50.5%), shipped = {sky:running on the fleet} (30, 29.1%), pending = provisioning queued (14, 13.6%), cancelled = {rose:churned mid-term} (7, 6.8%).",
    "The data org splits into growth, monetization and a small reliability pod that lives on {sky:DORA metrics} — deployment frequency, lead time for changes, change failure rate — and the storefront db carries the lead-time analog perfectly: a renewal books at the created_at timestamp and shipped_at is stamped the day the namespace actually goes live. **82 of 103 renewals** carry the stamp, averaging **2.98 days** booking-to-go-live with a 2–4 day spread, and the 14 pending rows have none yet — a population definition, not a cleanup job. Money sits one layer down: 28 invoices and 27 payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with namespaces whose lifetime spend crosses 3,000 (71.2% above 2,000) — one lost logo moves a quarter, which is exactly the enterprise-account reality a DevOps vendor lives in.",
    "Interview screens are census-then-denominator, then tier economics. A typical loop opens with a **two-grain namespace census** — EU runs 45 renewals from just 8 namespaces (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a queued renewal count in your base?'*), then into the renewal leaderboard where four namespaces sit tied at 4 and rank semantics become a business decision about peer accounts. Late rounds walk the {sky:14-month renewal spine} (2024-01 to 2025-02) with `LAG` deltas, or band namespaces into tiers with CASE and probe the arm that silently swallows rows. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no GitLab section — **0 tagged rows** — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fleet status censuses, two-grain namespace counts, tie-heavy leaderboards, CASE tier bands and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:fleet status census} the reliability review opens with every Monday, the other rebuilds the {orange:five-plus concentration read} the accounts team runs before every renewal call. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the fleet census refresh. A reliability analyst opens the DORA dashboard before standup: did overnight go-live stamps land, does any namespace run on the fleet without a provisioning owner, does the one-pass status census reconcile — 52 renewed + 30 running + 14 queued + 7 churned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the **2.98-day** lead-time average drifts — the US already runs 3.07 against APAC's 2.93 — the provisioning queue gets pulled before the release-train report ships.",
    "**11:30 —** Midday is the expansion read. Customer success wants the renewal leaderboard with the four-way tie at 4 handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus namespaces; a regional VP wants renewals per namespace beside namespace counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the pipeline-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-collected invoices worth 15,217** — before billing sends a single dunning email; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) against net-30 terms and a 28.4-day average settlement; and the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Lead time for changes", what: "Booking to go-live (created_at → shipped_at) over stamped renewals only: 82 of 103, 2.98-day average, range 2–4. The DORA analog the reliability pod reads daily — the population definition ships with the number, because queued renewals have no cycle yet." },
    { name: "Go-live rate", what: "Renewals with shipped_at stamped ÷ all renewals booked: 82 of 103 (79.6%). The top-of-funnel number growth reads every Monday — the 14 pending rows are 'not yet', never a silent zero." },
    { name: "Renewal kept rate", what: "Delivered ÷ ALL renewals booked: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count, and the denominator — queued rollouts included — is the whole interview." },
    { name: "Seats under contract", what: "Seat lines ÷ renewals: 251 order_items across 103 renewals. Expansion shows up here first — seats added mid-term are new line items, not new renewals." },
    { name: "Logo churn", what: "Cancelled share of booked renewals: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%, LATAM 0. The churn cohort map that drives the winback and dunning calendars." },
    { name: "Renewal book (ARR)", what: "Total renewal value booked: 34,833.28 across 103 renewals, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 renewal outweighs the smallest 42 combined." },
    { name: "Namespace concentration", what: "Share of the book from namespaces spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs the enterprise pod and sizes the renewal-call calendar." },
    { name: "Collections coverage", what: "Renewed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217 — against net-30 terms (30/30/30) and a 28.4-day average settlement, fastest 13, slowest 84. The AR anti-join billing refreshes every close." },
  ],

  topics: [
    {
      name: "Pipeline status funnels",
      why: "Every GitLab growth screen opens with the funnel: renewals booked, go-live stamped, renewed to term. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a running renewal 'renewed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain namespace censuses",
      why: "Renewals and namespaces are different grains of the same join, and every census here reports both: EU runs 45 renewals from 8 namespaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count"],
    },
    {
      name: "Joining namespaces to renewals",
      why: "Namespaces carry region and created_at; renewals inherit them through joins, and the join type decides who survives. A renewal without a namespace is corruption; a namespace without renewals is expansion whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employees-with-missing-information"],
    },
    {
      name: "Leaderboards & tie policy",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four namespaces sit at 4 renewals each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "top-earners"],
    },
    {
      name: "Tier banding with CASE",
      why: "Seat tiers are CASE-classified — Free, Premium, Ultimate — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "count-salary-categories", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month renewal spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["mrr-waterfall", "year-on-year-growth-rate", "biggest-window-between-events"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — running under churned, this quarter beside last — and EXCEPT answers 'which signed namespaces never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["customers-who-never-order", "monthly-transactions-ii", "the-airport-with-the-most-flights"],
    },
    {
      name: "Nested folds & mean gates",
      why: "Screens escalate into staging: fold per-namespace renewal counts, then judge them against a computed platform mean (6.44 here — exactly four namespaces clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["orders-with-maximum-quantity-above-average", "second-highest-salary", "average-salary-of-departments"],
    },
    {
      name: "One-pass fleet censuses",
      why: "The ops board gets renewed, running, queued and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "user-activity-for-the-past-30-days-ii", "create-a-session-bar-chart"],
    },
    {
      name: "Billing & cents discipline",
      why: "Renewed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the namespace world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-i", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "gitlab-t1",
      q: "Your fleet report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a renewal column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins renewals to namespaces: a renewal with no namespace row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from customers: the namespaces with no renewals ARE the answer — seat-expansion candidates, not dead rows — and they arrive with NULL renewal columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload namespace row, the LEFT quietly became an INNER, and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-renewing namespaces — all 16 appear in the renewal table somewhere — and proving that zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "gitlab-t2",
      q: "Four namespaces tie at 4 renewals on the engagement leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose customer-success pod gets the account. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer namespaces (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment where the account team can see it.",
      tag: "windows",
    },
    {
      id: "gitlab-t3",
      q: "The census shows 103 renewals and 16 namespaces; EU shows 45 renewals and 8 namespaces. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts renewal rows after the join — one row per renewal, so a namespace with 24 renewals contributes 24. COUNT(DISTINCT customer_id) folds those rows back to namespaces — EU's 45 renewals collapse to 8 logos. Neither is wrong: renewals measure load and seat momentum, namespaces measure installed base and coverage. The ratio — 5.6 renewals per namespace in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for seat lines and COUNT(*) silently counts seat lines, not renewals — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "gitlab-t4",
      q: "shipped_at is NULL until a namespace goes live. What is your policy for the lead-time report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only go-live-stamped renewals have a lead time, so the report measures booking-to-go-live for the 82 of 103 renewals that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title, exactly like a DORA lead-time chart that only counts completed deployments. Then mechanics: AVG ignores NULLs, so AVG over ALL renewals returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 churned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day go-lives for provisioning that has not started. A report whose WHERE clause is doing definitional work without saying so is exactly what a GitLab reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "gitlab-t5",
      q: "The growth review wants renewed value per region for regions carrying at least ten renewals. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards running, queued and churned rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-renewal floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to renewals versus to dollars. The churn share makes the trap concrete: 100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) reads 6.8% platform-wide and 8.1% in APAC — every piece of that expression must survive the pipeline in the right order. The strong answer places every filter by asking: is this a fact about one renewal, or about a region?",
      tag: "pipeline",
    },
    {
      id: "gitlab-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 renewals always produce a mean (6.4375 per namespace, 6.44 rounded — exactly four logos clear it; the mean renewal value itself is 338.19). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. And the failure has a louder sibling: write (SELECT total FROM orders) without the aggregate and the subquery fans out to 103 rows — a hard cardinality error. The correlated cousin (compare each renewal to ITS namespace's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "gitlab-t7",
      q: "The renewal trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and month-end is exactly when renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The same discipline prices the billing side: net-30 terms are DATE(issue_date, '+30 day'), and settlement latency is julianday(paid_on) - julianday(issued). Date discipline is release-train discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "gitlab-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "gitlab-mcq-1",
      prompt: "A renewal row's status reads 'pending'. In this kit's GitLab stage map, what is true?",
      choices: ["Provisioning queued — no go-live stamp yet; it stays in every funnel denominator", "Running on the fleet with shipped_at stamped", "Term completed and renewed", "Churned mid-term — exclude it from the base"],
      answer: 0,
      why: "Pending is 'not yet': 14 of 103 renewals (13.6%) queued for provisioning with no shipped_at stamp. They stay in every denominator the funnel reports, because 'not yet live' is exactly what the funnel watches.",
      notes: [
        { choice: 1, why: "Running-on-fleet is 'shipped' — 30 renewals stamped and live but not at term end. Pending rows have no stamp at all." },
        { choice: 3, why: "Churned is 'cancelled' — 7 rows (6.8%). Pending is not churn and not kept; excluding it from the base inflates every rate the funnel publishes." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-2",
      prompt: "Lead time for changes reads 2.98 days. Over which population was it computed?",
      choices: ["All 103 renewals, with NULL latencies counted as 0 days", "The 82 renewals carrying a shipped_at stamp", "The 52 delivered renewals only", "The 30 shipped-status renewals only"],
      answer: 1,
      why: "Only go-live-stamped rows have a latency: 82 of 103 (52 delivered + 30 shipped), averaging 2.98 days with a 2–4 spread. The population definition ships with the number — that is the DORA read.",
      notes: [
        { choice: 0, why: "NULLs are not zeros — AVG skips them, so the arithmetic happens to match, but the label 'all 103' is the lie. The number only ever covered 82 rows." },
        { choice: 2, why: "Delivered is term completion (52) — a different funnel stage than go-live. Restricting to delivered changes the population and the story." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-3",
      prompt: "One query, two grains: which SELECT pair makes the US row read renewals 19, namespaces 2?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts renewal rows (19 in the US); COUNT(DISTINCT customer_id) folds repeats back to namespaces (2). The gap between them — 9.5 renewals per namespace — is the intensity read the board actually wants.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 19 again, since every renewal has a namespace. Without DISTINCT both columns read 19 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not namespaces — a third grain nobody asked for." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-4",
      prompt: "A payment row carries amount_cents = 69612. The dashboard prints amount_cents / 100. What shows?",
      choices: ["696.12", "696", "69612.00", "0"],
      answer: 1,
      why: "Both operands are INTEGER, so SQLite divides integrally: 69612 / 100 = 696 — twelve cents silently gone. The safe dollar read is amount_cents / 100.0, which promotes to real division: 696.12.",
      notes: [
        { choice: 0, why: "696.12 is the CORRECT read — that is what /100.0 prints. The bare /100 is the bug being diagnosed." },
        { choice: 2, why: "69612.00 would require a cast and a format step — printing raw cents as dollars overstates the payment a hundredfold. Different failure, same sloppiness." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-5",
      prompt: "The one-pass fleet census must reconcile: 52 + 30 + 14 + 7 = 103. Which construction guarantees it?",
      choices: ["Four separate COUNT queries summed by hand in the dashboard", "COUNT(*) beside exhaustive SUM(CASE WHEN status = … THEN 1 ELSE 0 END) arms, one per status", "COUNT(DISTINCT status) grouped by region", "A delivered-only SUM, then a second query with the WHERE flipped for the rest"],
      answer: 1,
      why: "Exhaustive CASE arms partition the rows without overlap, and COUNT(*) sits beside them as the audit anchor — every branch must sum back to it: 52 + 30 + 14 + 7 = 103 by construction. One scan cannot drift; four queries can.",
      notes: [
        { choice: 0, why: "Four queries drift independently — a status added to the enum lands in one branch and not the others, and the census is wrong with no error anywhere." },
        { choice: 2, why: "COUNT(DISTINCT status) counts status VALUES (4), not rows (103) — the census collapses to a constant." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-6",
      prompt: "The ARR spine keys months with SUBSTR(created_at, 1, 7). A teammate keys with SUBSTR(created_at, 6, 2) 'to get the month'. What breaks?",
      choices: ["Nothing — both keys bucket identically", "Same-month buckets from different years merge — 14 buckets become 12 and the trend is fiction", "The spine still works but sorts by day-of-month", "SQLite rejects two-argument SUBSTR calls"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) extracts '01' from both 2024-01 and 2025-01 — two years collapse into one bucket. The spine must carry the year: YYYY-MM keeps all 14 buckets, 2024-01 through 2025-02, distinct and ordered.",
      notes: [
        { choice: 0, why: "They differ exactly when the data spans a year boundary — which this db does (2024-01 to 2025-02). The merge is silent and the chart still renders." },
        { choice: 2, why: "Sorting is downstream of bucketing — once two Januaries share a key, no ORDER BY can unmerge them." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-7",
      prompt: "On the renewals table, COUNT(*) - COUNT(shipped_at) returns what — and what is that gap?",
      choices: ["0 — every row carries a stamp", "21 — the 14 pending plus 7 cancelled rows with no go-live stamp", "14 — only pending rows lack stamps", "82 — the stamped rows counted twice"],
      answer: 1,
      why: "COUNT(shipped_at) skips NULLs, so it reads 82 while COUNT(*) reads 103 — the gap is 21: the 14 queued plus the 7 churned rows, none of which ever went live. The difference of two COUNTs is a free population read.",
      notes: [
        { choice: 0, why: "21 rows never shipped — the stamp exists for exactly 82 of 103. A zero gap would mean every booked renewal went live, which contradicts the funnel." },
        { choice: 2, why: "Cancelled rows have no stamp either — the 7 churned renewals died before go-live. Forgetting them undercounts the gap by a third." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-8",
      prompt: "A teammate rewrites the mean gate as WHERE total > (SELECT total FROM orders) and gets 'more than one row returned by a subquery'. Why here, when AVG(total) worked in the same slot?",
      choices: ["AVG is an aggregate — it folds to one row; bare total is per-row — 103 rows — and a scalar subquery must return exactly 0 or 1", "The subquery needs LIMIT 1 in every dialect", "WHERE cannot compare against a subquery at all", "The outer query must be aggregated before any comparison"],
      answer: 0,
      why: "The scalar-subquery contract is 0-or-1 rows, 1 column. AVG(total) is a fold — always exactly one row. The bare column fans out to one row per renewal (103), and the comparison explodes at cardinality, not at types.",
      notes: [
        { choice: 1, why: "LIMIT 1 hides the error but picks an arbitrary renewal — the gate now compares against one random row's total, which is a worse bug because it ships silently." },
        { choice: 2, why: "WHERE compares against subqueries constantly — the scalar shape is the workhorse. The failure is row count, not placement." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-9",
      prompt: "A running-ARR walk was meant to restart per region: SUM(total) OVER (ORDER BY month). The output is one never-resetting climb that ends at 34,833.28. Diagnosis?",
      choices: ["The window needs PARTITION BY region — without it the frame spans the whole table and the walk never resets", "SUM cannot be used as a window function", "ORDER BY inside OVER must reference the same column as PARTITION BY", "The frame must start at CURRENT ROW to reset"],
      answer: 0,
      why: "With no PARTITION BY, the window's partition is the entire result set — one continuous walk ending at the grand total, 34,833.28, regardless of region boundaries. PARTITION BY region restarts the frame at each region's first month.",
      notes: [
        { choice: 1, why: "SUM is a first-class window aggregate — the walk itself is fine. Only the partition boundary is missing." },
        { choice: 3, why: "A frame starting at CURRENT ROW makes every row's sum its own value — a different wrong report, not a reset." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-10",
      prompt: "The unpaid-invoice list is invoices LEFT JOIN payments … WHERE p.invoice_id IS NULL (6 invoices, 15,217). A teammate adds AND p.method = 'wire' to the same WHERE to scope to wires. Result?",
      choices: ["Still 6 invoices — the extra predicate is harmless", "0 rows — the wire test sits on NULL payment columns and kills every anti-join row; move it into ON or a wrapping query", "Only the voided invoices survive", "It errors — method cannot be referenced after a LEFT JOIN"],
      answer: 1,
      why: "Anti-join rows carry NULL payment columns, and NULL = 'wire' is UNKNOWN — never true. Adding any payment-column predicate beyond the IS NULL test turns the LEFT JOIN back into an INNER JOIN, and the anti-join empties while looking valid.",
      notes: [
        { choice: 0, why: "The 6-and-15,217 read only survives when the WHERE carries no payment-column predicates. Scoping by rail belongs in the join condition or an outer filter." },
        { choice: 2, why: "The void invoice (#11) HAS a payment row, so it never passed the IS NULL test in the first place — the scope change neither adds nor keeps it." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-gitlab-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The fleet status census",
      brief:
        "GitLab-flavored brief on the storefront db: Monday's reliability review opens with the fleet census — one scan of the 103 subscription renewals, split by namespace region into renewed-to-term, running-on-fleet and churned, every branch reconciling to 103 by construction. Probed facts: 52 delivered (EU 24, APAC 21, US 5, LATAM 2), 30 shipped (EU 12, APAC 8, US 10, LATAM 0), 7 cancelled (APAC 3, EU 3, US 1) and 14 pending — pending is read off as the remainder and must land on EU 6, APAC 5, US 3, LATAM 0. The review reads the biggest renewal base first.",
      ask: "Return each region with its renewal count, renewed-to-term count, running-on-fleet count and churned count, biggest renewal base first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS renewals,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS at_term,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS running,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS churned\nFROM orders o\nJOIN customers c ON c.id = {4}\nGROUP BY c.region\nORDER BY renewals {5};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the renewed-to-term literal",
          why: "Renewed-to-term is status 'delivered' — 52 renewals, EU 24 / APAC 21 / US 5 / LATAM 2. 'shipped' would count the 30 running rows and the census would call activations renewals before a single term finished.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the running-on-fleet literal",
          why: "Running on the fleet is status 'shipped' — 30 renewals with a go-live stamp. 'pending' would read the 14 queued rows into the live column and provisioning success would be overstated on every slide.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the churned literal",
          why: "Churned mid-term is status 'cancelled' — 7 renewals, APAC 3 / EU 3 / US 1. The remainder column then reads pending as EU 6 / APAC 5 / US 3 / LATAM 0, reconciling the census to 103 by construction.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the join key",
          why: "The join attaches each renewal to its namespace: c.id = o.customer_id. c.id = c.id is always true and cross-products 103 renewals against all 16 namespaces; c.id = o.id pairs order N with customer N — both silently wreck the regional split.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-base-first direction",
          why: "The review reads the biggest renewal base on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open the meeting on LATAM's 2 renewals — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'pending'", "MAX", "ASC", "o.id", "c.id"],
      walkthrough:
        "One join, one fold, one scan. The join attaches every renewal to its namespace's region, GROUP BY region folds 103 rows into four, and each CASE branch is a conditional count: at_term reads 24 / 21 / 5 / 2 (52 delivered), running reads 12 / 8 / 10 / 0 (30 shipped), churned reads 3 / 3 / 1 / 0 (7 cancelled) — all straight from the probed status-by-region table. COUNT(*) reads 45 / 37 / 19 / 2, and the remainder per region is the pending column: 6 / 5 / 3 / 0 — the census reconciles to 103 by construction, which is the point of building it in one pass. The distractors fail honestly: 'pending' in a status slot mislabels a stage (queued renewals would read as renewed, running or churned); MAX collapses each branch to 1 wherever the status occurs; o.id joins order N to customer N and scrambles the regional split; c.id = c.id is always true and cross-products the fleet to 1,648 joined rows; ASC opens the review on LATAM. The read the review wants: APAC churns hardest (3 of 37, 8.1%) while the US runs lean (10 of 19 live but only 5 renewed) — one query, four business claims.",
    },
    {
      id: "cs-gitlab-2",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The five-plus concentration read",
      brief:
        "GitLab-flavored brief on the storefront db: before the accounts team dials into a renewal call it runs the concentration read — which namespaces carry five-plus renewals, and what their lifetime spend looks like. Probed facts: the renewal ladder runs 24, 17, 14, 13, 5 then a four-way tie at 4; the five five-plus namespaces hold lifetime spends of 7,262.35, 6,640.56, 4,574.23, 3,644.56 and 2,667.93. These are the same five logos the enterprise pod flags above 2,000 lifetime — 71.2% of the 34,833.28 book sits with them (63.5% above 3,000). Spend rounds to cents; biggest book first.",
      ask: "Return each namespace with five or more renewals, its renewal count and lifetime spend to 2 decimals, biggest spend first.",
      template:
        "SELECT c.name AS namespace,\n       COUNT(*) AS renewals,\n       ROUND({1}(o.total), {2}) AS lifetime_spend\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {3}\nHAVING COUNT(*) >= {4}\nORDER BY lifetime_spend {5};",
      slots: [
        {
          answer: "SUM",
          kind: "keyword",
          label: "the spend fold",
          why: "Lifetime spend is the SUM of renewal totals per namespace. AVG would print the mean renewal (~302.60 for the biggest logo) and MAX would print the single largest renewal — 1,088.44 platform max — neither is a lifetime read.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the spend precision",
          noVerify: true,
          why: "Money reports to 2 decimals — 7,262.35, not 7,262.4 or 7,262. ROUND(…, 1) drifts the print off the probed figures and the reconciliation against the 34,833.28 book stops adding up on the slide.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the fold grain",
          why: "The fold grain is the namespace key: GROUP BY c.id. GROUP BY c.region would collapse 16 namespaces into 4 regions; GROUP BY o.id would fold to one row per renewal and the >= 5 gate would return nothing.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the five-plus gate",
          why: "The renewal ladder runs 24, 17, 14, 13, 5, then a four-way tie at 4 — so HAVING COUNT(*) >= 5 keeps exactly five namespaces. Raising it to 13 drops two logos; dropping it to 4 floods the list with the tie block and dilutes the concentration story.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The accounts team reads biggest book first: 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93. ASC would open the call on the smallest of the five logos and bury the concentration headline.",
        },
      ],
      distractors: ["0", "ASC", "c.region", "AVG"],
      walkthrough:
        "One join, one fold, one gate, one order. The join attaches every renewal to its namespace; GROUP BY c.id folds 103 renewals into 16 namespaces where SUM(o.total) is lifetime spend; HAVING COUNT(*) >= 5 keeps the five-plus cohort — 24, 17, 14, 13 and 5 renewals — and ORDER BY DESC reads 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93, exactly the probed top-spenders cells. The concentration claim sits in the read: these five are the same logos the enterprise pod flags above 2,000 lifetime, carrying 71.2% of the 34,833.28 book (63.5% above 3,000) — the renewal-call calendar starts here. The distractors each break differently: 0 in the precision slot truncates to whole dollars and the print stops matching the probed figures; ASC flips the read and opens on 2,667.93; c.region collapses the fold to regions and answers a question nobody asked; AVG swaps lifetime spend for mean renewal value — every row shrinks by two orders of magnitude and the >= 5 gate quietly keeps gating on counts while the money column lies. One query, one cohort, one calendar.",
    },
  ],

  problems: [
    { slug: "trial-to-paid-funnel", why: "Namespaces move signed → provisioned → running CI in week one. This problem drills the stage-share shape growth ops uses for the activation funnel every single Monday." },
    { slug: "funnel-step-conversion", why: "Stage-to-stage conversion — MR opened to merged, merged to deployed — is the pipeline-health read; conversion between consecutive steps is exactly this problem's shape." },
    { slug: "percentage-of-users-attended-a-contest", why: "Share of namespaces that hit the go-live milestone out of all signed — a distinct-count share with the denominator stated, the activation pulse." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain census — renewals booked AND namespaces live per month — is the chart that opens every growth review here; this problem is that chart at practice scale." },
    { slug: "combine-two-tables", why: "Namespaces LEFT JOINed to renewals: the whitespace read. A renewal without a namespace is corruption, a namespace without renewals is expansion pipeline — and on this db the anti-join returns a confident zero." },
    { slug: "rank-scores", why: "Renewal leaderboards tie — four namespaces sit at 4 on this db. Shared rungs versus gaps is a policy decision about peer accounts, and this problem forces you to make it." },
    { slug: "department-top-three-salaries", why: "Top-three reads per region — the three biggest renewals in each region, ties handled by an explicit rule. The accounts team's QBR deck is this exact shape." },
    { slug: "weather-type-in-each-country", why: "Tier banding — Free, Premium, Ultimate — is CASE-classified per namespace with ordered, exhaustive arms. A hole in the CASE is a hole in the forecast." },
    { slug: "active-businesses", why: "One-pass fleet census: renewed, running, queued, churned in a single scan that reconciles to 103 by construction. Four sequential queries drift; one pass cannot." },
    { slug: "bank-account-summary-ii", why: "The billing pod's per-namespace money rollup in INTEGER cents. The /100.0 rule makes this exact practice for the settlement true-ups." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Seat-expansion reads: which renewals carry seat lines above the platform mean. A two-stage fold — compute the mean, then filter against it — the tier-gate screen." },
    { slug: "net-revenue-retention", why: "Cohort revenue walks with LAG are how NRR lands on the board deck here — expansion, contraction and churn rolled into one number." },
    { slug: "feature-adoption-windows", why: "Did the namespace run CI within N days of go-live? Adoption windows over event timestamps are how rollout health is graded." },
    { slug: "growth-accounting", why: "New, resurrected and churned namespaces per month — LAG-status transitions are the namespace-movement read that feeds the concentration conversation." },
    { slug: "ar-aging-schedule", why: "Six invoices worth 15,217 sit unpaid on this db. Aging buckets over those balances are the billing pod's dunning calendar, built exactly this way." },
    { slug: "usage-tier-percentiles", why: "Seat-utilization percentiles set tier upgrades — PERCENT_RANK over usage is how the Premium-to-Ultimate upsell list gets cut." },
  ],
};
