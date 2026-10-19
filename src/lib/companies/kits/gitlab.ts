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
    "Preparation strategy: the pools file carries no GitLab section — **0 tagged rows** — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: fleet status censuses, two-grain namespace counts, tie-heavy leaderboards, CASE tier bands and the cents-safe billing spine. Do the topics in order, then run all six case studies on the live storefront db — spaced practice rather than one sitting: the {emerald:fleet status census} the reliability review opens with every Monday, the {orange:five-plus concentration read} the accounts team runs before every renewal call, the RANK tie ladder, the DORA lead-time board, the above-the-mean fleet scan, and the anchor-account renewal pulse. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "percentage-of-users-attended-a-contest", "active-users", "find-users-with-persistent-behavior-patterns", "second-day-confirmation", "immediate-food-delivery-ii", "analyze-subscription-conversion"],
    },
    {
      name: "Two-grain namespace censuses",
      why: "Renewals and namespaces are different grains of the same join, and every census here reports both: EU runs 45 renewals from 8 namespaces while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "find-followers-count", "customer-order-frequency"],
    },
    {
      name: "Joining namespaces to renewals",
      why: "Namespaces carry region and created_at; renewals inherit them through joins, and the join type decides who survives. A renewal without a namespace is corruption; a namespace without renewals is expansion whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-i", "employees-with-missing-information", "confirmation-rate"],
    },
    {
      name: "Leaderboards & tie policy",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four namespaces sit at 4 renewals each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer accounts, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "top-earners", "the-most-recent-three-orders"],
    },
    {
      name: "Tier banding with CASE",
      why: "Seat tiers are CASE-classified — Free, Premium, Ultimate — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "count-salary-categories", "the-category-of-each-member-in-the-store", "user-purchase-platform", "plan-migration-paths"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month renewal spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["mrr-waterfall", "year-on-year-growth-rate", "biggest-window-between-events", "rolling-7d-actives", "customers-with-strictly-increasing-purchases"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — running under churned, this quarter beside last — and EXCEPT answers 'which signed namespaces never went live'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["customers-who-never-order", "monthly-transactions-ii", "the-airport-with-the-most-flights", "find-churn-risk-customers", "dormant-reactivation", "drop-type-1-orders-for-customers-with-type-0-orders"],
    },
    {
      name: "Nested folds & mean gates",
      why: "Screens escalate into staging: fold per-namespace renewal counts, then judge them against a computed platform mean (6.44 here — exactly four namespaces clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["orders-with-maximum-quantity-above-average", "second-highest-salary", "average-salary-of-departments"],
    },
    {
      name: "One-pass fleet censuses",
      why: "The ops board gets renewed, running, queued and churned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "user-activity-for-the-past-30-days-ii", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-i"],
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
    {
      id: "gitlab-t9",
      q: "The reliability call wants a 3-month moving average of the renewal book on the 14-month spine. Walk me through the frame — and what the first two rows of the chart are allowed to show.",
      a: "The frame is the contract: SUM(book) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) sums each month with its two predecessors. ROWS (not RANGE) is deliberate — the spine key is unique per month, but ROWS states the row-intent explicitly, and at renewal grain where created_at ties exist RANGE would silently absorb peers. The edge rows truncate honestly: month one's window is itself, month two's is two rows wide, and only month three onward is a true 3-month sum. What is never acceptable is padding the two edge rows with zeros to make the chart 'full' — that invents two flat months into exactly the release-train trough the call is about to discuss. On this spine the moving average smooths the July trough (1,193.86) and the August rebound (2,352.07) into the trend the DORA narrative actually quotes.",
      tag: "windows",
    },
    {
      id: "gitlab-t10",
      q: "Board packets stack populations — renewed-to-term beside running-on-fleet beside the whole book. When do you reach for UNION ALL, plain UNION, EXCEPT and INTERSECT — and which choice is a correctness decision rather than a style one?",
      a: "UNION ALL concatenates and keeps everything — the default for stacking disjoint arms (detail rows plus a TOTAL row, per-status packets) because every row belongs and dedupe would be a silent lie. Plain UNION deduplicates whole rows across both branches: reaching for it is a correctness claim that duplicates are impossible, and when they are not, it deletes data without an error. EXCEPT answers 'in the first set but not the second' — signed namespaces that never went live — and dedupes first, which makes it a set-difference tool, not a census tool. INTERSECT answers 'in both'. The interview move is saying which operator's dedupe behavior you are relying on, out loud, because the row counts the board quotes depend on it.",
      tag: "sets",
    },
    {
      id: "gitlab-t11",
      q: "The tier-band CASE fold prints Free and Premium but no Ultimate row at all — the top per-seat price is 199.99. Why does GROUP BY drop the tier, and how do you make an empty arm print as zero?",
      a: "GROUP BY folds existing rows into groups; an arm that matches zero rows produces no group, so the tier is absent from the output — not zero, not NULL, simply not there. The empty-arm honesty options: seed the tier names from a dimension (a VALUES list or a UNION ALL seed of 'Free','Premium','Ultimate') and LEFT JOIN the fold onto it, COALESCE-ing missing counts to 0; or accept the absent row and say so in the read. What you cannot do is conjure the row inside the CASE — ELSE labels existing rows, it does not create them. The same logic explains why GROUP BY treats NULLs as one group: a tier key of NULL (a hole in the CASE) would print as a NULL-named row rather than disappear — which is exactly how CASE holes announce themselves in review.",
      tag: "groupby",
    },
    {
      id: "gitlab-t12",
      q: "'Which namespaces carry a renewal book above the platform per-namespace mean?' — compare the derived-table shape, the correlated shape and the window shape, and say what each costs.",
      a: "Derived table: fold per-namespace books once (SELECT customer_id, SUM(total) AS book … GROUP BY customer_id), then judge book > (SELECT AVG(book) FROM that fold) — on this db the mean is 2,177.08 and exactly five namespaces clear it, the same five above the 2,000 concentration line carrying 71.2% of the book. Correlated: the inner query re-runs once per outer row — sixteen times here — and worse, it drifts semantics: comparing each namespace's book to ITS OWN average renewal is a different question. Window: AVG(SUM(total)) OVER () needs the fold staged first, so you end up in a CTE anyway. The derived-table shape wins for the same reason it wins in interviews: it names its grain (per-namespace book) and its baseline (mean of those books) in two lines the reviewer can audit before the renewal-call calendar is built on them.",
      tag: "subqueries",
    },
    {
      id: "gitlab-t13",
      q: "Marketing wants namespaces that renewed in the same month paired up for a co-adoption study. How do you self-join orders so each pair appears exactly once?",
      a: "Self-join on the shared attribute — orders a JOIN orders b ON SUBSTR(a.created_at,1,7) = SUBSTR(b.created_at,1,7) — then kill the two degenerate cases with a strict inequality on the pairing key: AND a.customer_id < b.customer_id. Without it you get self-pairs (every namespace paired with itself) and mirror duplicates (A-B and B-A both counted), which inflate the co-renewal census combinatorially. The inequality keeps each unordered pair exactly once and hands you a canonical direction for free — the smaller id is 'first'. Say the pair-count math out loud in the interview: the bug version counts n-squared-ish rows, the fixed version counts actual pairs, and the difference is the difference between a study and noise.",
      tag: "joins",
    },
    {
      id: "gitlab-t14",
      q: "The expansion-whitespace report — signed namespaces with zero go-live stamps — is written as NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL). What is the failure mode, and what do you ship instead?",
      a: "NOT IN with a NULL anywhere in the subquery returns zero rows, permanently: x NOT IN (…, NULL) evaluates to UNKNOWN for every outer row, and NOT UNKNOWN is still UNKNOWN. The report reads 'no whitespace' while lying. Ship NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.shipped_at IS NOT NULL) — existence probes short-circuit and never trip on NULLs — or the LEFT JOIN + IS NULL anti-join with the same NULL-safety. On this db the honest answer is a confident zero: all 16 namespaces appear among the 82 stamped renewals, and proving that zero (running the anti-join, showing the empty set is real) is part of the credibility of every other number in the packet.",
      tag: "nulls",
    },
    {
      id: "gitlab-t15",
      q: "Lead time for changes is AVG(julianday(shipped_at) - julianday(created_at)) over the renewals that carry a stamp. Walk me through the NULL behavior, the cast to whole days, and the population statement the DORA chart must carry.",
      a: "julianday(NULL) is NULL, so each unstamped renewal contributes a NULL lead time, and AVG skips NULLs — the aggregate runs over the 82 stamped rows and reads 2.98 days, range 2 to 4. That skipping is correct only because the chart says 'over go-live-stamped renewals': the 14 queued and 7 churned rows have no cycle yet, and a silent WHERE-less AVG returns the same number over an unnamed population. Whole days come from CAST(diff AS INT) or ROUND(diff, 0) — julianday diffs are real days with fractional parts, and '2.98' versus '3' is a presentation decision to make once, in one place. The never-do is IFNULL(diff, 0), which invents 14 same-day go-lives and drags the DORA lead time to near zero — a metric-destroying 'fix' that any reviewer who has run a release train will catch on sight.",
      tag: "dates",
    },
    {
      id: "gitlab-t16",
      q: "Two exports spell the same namespace 'acme-corp' and 'ACME-Corp ' — with a trailing space. What breaks, and what is the string-hygiene pass every join key needs?",
      a: "The join key matches byte-for-byte, so one namespace becomes two in every census, its book splits across both spellings, and no error ever fires — the fold just disagrees with billing. The hygiene pass: normalize with UPPER(TRIM(name)) on both sides of the join (or a stored normalized column), decide the canonical key once, and audit before merging with GROUP BY the normalized key HAVING COUNT(DISTINCT raw) > 1 to list the collisions. GROUP_CONCAT deserves the same sentence: it folds runner tags or component names into one manifest cell but its order is not guaranteed without an explicit ORDER BY inside the aggregate, so treat cells as sets. DevOps framing: a pipeline definition cannot have two sources of truth, and neither can a namespace key that joins four tables.",
      tag: "strings",
    },
    {
      id: "gitlab-t17",
      q: "The monetization pod wants seat SKUs cut into quartiles by per-seat price. How do NTILE, and its PERCENT_RANK cousin, behave — especially with ties at a band edge?",
      a: "NTILE(4) OVER (ORDER BY price) assigns each row a tile number 1 through 4 with near-equal membership — with 16 SKUs, four per tile. Ties do not split: rows equal on the ORDER BY key land in the same tile, which can make neighboring tiles lopsided — that is a feature, not a bug, because a tier edge that splits identical prices is unexplainable to a customer. PERCENT_RANK is the continuous cousin: each row's (rank − 1)/(rows − 1) share, useful when the deck wants 'this SKU sits above 87% of the catalog' instead of a tile number. Both are computed after ordering, invisible to WHERE of the same SELECT — stage in a CTE if the pod wants to filter to the top tile. The publishing rule: quartile boundaries are computed from data, but the pricing page prints human tiers (Free, Premium, Ultimate) — someone must own the mapping between the two.",
      tag: "windows",
    },
    {
      id: "gitlab-t18",
      q: "The Monday reliability check is one query: renewed, running, queued, churned — 52, 30, 14, 7. Walk me through the one-pass construction and why four sequential queries are a data-quality risk.",
      a: "One pass, one scan: COUNT(*) FILTER (WHERE status = 'delivered') AS at_term, and three FILTER siblings for 'shipped', 'pending', 'cancelled' — the portable twin is SUM(CASE WHEN status = … THEN 1 ELSE 0 END) per arm. The audit anchor is COUNT(*) beside the arms: every branch must reconcile, 52 + 30 + 14 + 7 = 103 by construction, and a branch that misses 103 is the day's first incident, not a rounding note. Four sequential queries drift independently — a new status value lands in one branch and not the others, the queries run seconds apart against a moving table, and no error anywhere announces the disagreement. The one-pass version has exactly one failure surface and one identity, which is why this kit treats the fleet census as the fastest data-quality check in the building.",
      tag: "aggregation",
    },
    {
      id: "gitlab-t19",
      q: "'Each namespace's most-ordered SKU' — walk me through the argmax shape, the tie policy, and why the filter cannot live in the same SELECT as the window.",
      a: "Two layers. Inner: fold seat lines per namespace-SKU (SUM(quantity) seats, GROUP BY customer_id, product_id). Outer: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY seats DESC, product_id) = 1 keeps each namespace's top SKU — with the tie-breaker NAMED, because two SKUs at the same seat count must not rotate between runs; RANK or DENSE_RANK if the business wants ties to share the crown. The filter cannot sit beside the window: window functions are computed in the SELECT stage, after WHERE, so WHERE rn = 1 is either an error or a re-read of a column that does not exist yet. Stage the window in a CTE or derived table, filter in the outer query. This shape is the seed of tiering reads and the interview's favorite 'can you compose two grains' probe.",
      tag: "windows",
    },
    {
      id: "gitlab-t20",
      q: "The lead-time query filters with julianday(created_at) >= julianday('2024-10-01') and the plan shows a full scan. What is sargability, and how do you rewrite for the index?",
      a: "Sargability = searchable-argument: the predicate must leave the indexed column bare so the planner can seek a range. Wrapping the column in any function — julianday(created_at), UPPER(name), SUBSTR(key, 1, 7) — turns the predicate into per-row computation and the index into dead weight; the scan is invisible at 103 rows and career-defining at millions. The rewrite moves the function to the constant side or drops it: created_at >= '2024-10-01' AND created_at < '2024-11-01' — half-open, seam-honest, and seekable. Verify with EXPLAIN QUERY PLAN: SEARCH … USING INDEX is the win, SCAN is the tell. The GitLab-flavored rule of thumb: express the business question (which renewals landed in October) as a range over the raw column, never as a computation over the wrapped one.",
      tag: "indexes",
    },
    {
      id: "gitlab-t21",
      q: "The engagement leaderboard reshuffles between runs — same numbers, different order. What does a reproducible ORDER BY look like, and why is LIMIT without ORDER BY worse than useless?",
      a: "A reproducible ORDER BY names every tie-breaker: ORDER BY renewals DESC, spend DESC, name — with the four-way tie at 4 renewals, the block still permutes unless a later key (and finally the unique name) pins it. Sorting on position (ORDER BY 2) or on an unmentioned engine habit is the same bug wearing syntax. LIMIT without ORDER BY is worse than useless: it takes five ARBITRARY rows and prints them under a 'busiest' heading — the query is not wrong-looking, it is wrong, and it can change between executions on identical data. The GitLab framing: runner and adoption leaderboards get screenshotted into pipeline reviews, and a board that reshuffles between runs reads as data corruption. Determinism is a deliverable, not a nicety.",
      tag: "pipeline",
    },
    {
      id: "gitlab-t22",
      q: "Where is COALESCE allowed in the fleet-economics reports — and where does it quietly invent data?",
      a: "COALESCE belongs at the display layer: a namespace with no renewals shows book = 0 instead of NULL on the whitespace report — honest, because the row exists and the payload is genuinely empty. It does not belong inside metric definitions: IFNULL-ing lead time to 0 invents 14 same-day go-lives for provisioning that has not started; coalescing a NULL seat price to list price silently fabricates discounts. The three-valued-logic trap rides along: WHERE status != 'cancelled' silently drops NULL-status rows (NULL != anything is UNKNOWN), so 'churned plus everything else' needs OR status IS NULL or NOT EXISTS-shaped logic. And GROUP BY treats NULLs as one group — NULL keys cluster together, which makes IS NULL a legitimate cohort in the census. The policy sentence the interviewer wants: decide per column whether NULL means 'zero so far', 'not yet', or 'corrupt', and let the query show which.",
      tag: "nulls",
    },
    {
      id: "gitlab-t23",
      q: "Month-close at a DevOps vendor: walk me through the billing reconciliation ritual — the anti-join, the coverage split, the anomaly list, and the identity that must hold before anything ships.",
      a: "Four moves, same order every close. First the anti-join: invoices LEFT JOIN payments WHERE p.id IS NULL — 6 never-collected invoices worth 15,217, including #28 (1,756.00), which is marked 'paid' with zero settlement rows: payment rows are the ledger of record, statuses are claims. Second, the coverage split: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected — each bucket countable in one CASE pass, read against net-30 terms and the 28.4-day average settlement. Third, the anomaly list walked line by line, both directions: paid-with-no-rows (#28) and void-with-a-payment (#11, 925.00) — mirror-image error modes that the anti-join catches one of and misses the other. Fourth, the identity: the ledger trial balance must read 181,080 against 181,080, delta zero — cents in INTEGER columns, dollars read as amount_cents / 100.0. The close ships when the identity holds and every anomaly has a name attached.",
      tag: "quality",
    },
    {
      id: "gitlab-t24",
      q: "The board reads go-live rate 79.6% and renewal kept rate 50.5% side by side. Why are both 'correct', and how do you defend each denominator in the room?",
      a: "Because they answer different questions with different denominators, and the defensibility is the whole interview. Go-live rate = renewals with a shipped_at stamp ÷ ALL renewals booked: 82 of 103 — the denominator deliberately includes the 14 queued, because 'not yet live' is exactly what the metric watches; dropping them inflates the read to 92.1% and hides the provisioning queue the reliability pod owns. Kept rate = delivered ÷ ALL renewals booked: 52 of 103 — running-on-fleet is NOT kept, it is 30 renewals at an earlier stage, and calling running seats renewed inflates the term-completion story before a single contract finishes. The general habit: state the numerator's filter, the denominator's population, and why each excluded row is excluded — then the ratio-of-aggregates (SUM over SUM) versus average-of-ratios question answers itself: platform rates are pooled, regional rates are quoted beside their sizes.",
      tag: "aggregation",
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
    {
      id: "gitlab-mcq-11",
      prompt: "The seats-by-namespace read joins orders to order_items and returns 251 rows for 103 renewals. On the joined rows, what does COUNT(*) measure — and what counts renewals?",
      choices: [
        "COUNT(*) counts renewals; add DISTINCT to count seat lines",
        "COUNT(*) counts seat lines (251); COUNT(DISTINCT o.id) folds back to renewals (103)",
        "COUNT(*) counts renewals (103) — the join collapses to one row per renewal",
        "Both return 251 — DISTINCT is meaningless on a primary key",
      ],
      answer: 1,
      why: "After a join fan-out, COUNT(*) counts the finest grain in the result — seat lines, 251 of them, the exact surface where expansion lands first. Renewal count needs COUNT(DISTINCT o.id) to fold back to 103. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      notes: [
        { choice: 0, why: "Backwards — DISTINCT on the line grain would dedupe SKUs, not fold to renewals. The fold key is the renewal id." },
        { choice: 2, why: "Joins never collapse rows — one renewal carrying 3 seat lines contributes 3 rows. Only a DISTINCT or a pre-aggregate restores the renewal grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-12",
      prompt: "'Busiest runners by jobs this week' — a teammate ships `SELECT runner, jobs FROM runner_stats LIMIT 5` and calls it a leaderboard. What is wrong?",
      choices: [
        "Nothing — SQLite returns rows in insertion order, which is workload order",
        "LIMIT 5 without ORDER BY returns five arbitrary rows — the 'busiest' list can change between runs",
        "LIMIT must be written TOP 5 in SQLite",
        "The query errors — LIMIT requires a WHERE clause",
      ],
      answer: 1,
      why: "Without ORDER BY, SQL promises no order — the five rows are whatever the scan produced, and they can permute between executions. The runner leaderboard needs ORDER BY jobs DESC before LIMIT 5 means what its title claims.",
      notes: [
        { choice: 0, why: "Insertion order is an implementation detail, not a contract — a rebuilt stats table silently reshuffles the 'top' list." },
        { choice: 3, why: "LIMIT stands alone; the bug is semantic (no sort), not syntactic. The query runs and prints plausible-looking wrong rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-13",
      prompt: "Tier banding: `CASE WHEN price < 200 THEN 'Premium' WHEN price < 50 THEN 'Free' ELSE 'Ultimate' END`. What lands in 'Premium'?",
      choices: [
        "Only prices from 50 to 199.99 — the arms correct each other",
        "Every price under 200, including the Free-tier lines — the first WHEN wins and 'Free' is unreachable",
        "Only prices over 200 — ELSE catches the rest",
        "It errors — WHEN arms must be written lowest bound first",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and stops at the first true WHEN. With < 200 first, every under-50 seat line matches 'Premium' and the Free arm never fires — a reorder that silently re-tiers the base and inflates the Premium forecast. Cheapest bound first, or mutually exclusive ranges.",
      notes: [
        { choice: 0, why: "No correction happens — CASE is not a constraint solver. The first matching arm claims the row; the rest are never evaluated." },
        { choice: 2, why: "ELSE only catches what fell through every WHEN — nothing does here, because < 200 already caught the whole Free range." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-14",
      prompt: "`julianday(shipped_at) - julianday(created_at)` runs over all 103 renewals. What does the expression return for the 14 provisioning-queued rows?",
      choices: [
        "0 — queued rows are counted as same-day go-lives",
        "NULL — julianday(NULL) is NULL, and NULL poisons the subtraction",
        "-1 — the engine treats a missing stamp as day minus one",
        "The expression errors on the first queued row",
      ],
      answer: 1,
      why: "julianday(NULL) returns NULL, and NULL minus anything is NULL — queued rows carry a NULL lead time, not a zero. That is exactly why AVG over the column reads 2.98 days over the 82 stamped rows: the NULLs are skipped, never counted as zero days.",
      notes: [
        { choice: 0, why: "Counted as zeros the average would read near 2.37 — the NULL-skipping behavior is what keeps the stamped-only number honest." },
        { choice: 2, why: "No sentinels in SQL date math — a missing timestamp propagates as NULL through every expression it touches." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-15",
      prompt: "The runner-ops changelog folds each namespace's runner tags into one cell: `GROUP_CONCAT(tag)` with GROUP BY namespace. What does the cell hold?",
      choices: [
        "One tag — GROUP_CONCAT keeps only the first",
        "All tags comma-separated — a manifest like 'docker,kubernetes,protected'",
        "A count of tags folded into a string",
        "NULL — GROUP_CONCAT cannot run on a grouped query",
      ],
      answer: 1,
      why: "GROUP_CONCAT concatenates every value in the group with the default ',' separator — one scan, one manifest cell per namespace. The order is not guaranteed unless the aggregate carries ORDER BY (newer SQLite), so treat the cell as a set, not a sequence.",
      notes: [
        { choice: 0, why: "That is MAX or a bare column under GROUP BY — GROUP_CONCAT keeps every value in the fold." },
        { choice: 2, why: "COUNT counts, GROUP_CONCAT concatenates — a runner inventory printed as a number serves nobody." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-16",
      prompt: "A fleet census returns one namespace twice with identical values; a teammate wraps the SELECT in DISTINCT to 'fix it'. What actually happened?",
      choices: [
        "DISTINCT is the right fix — duplicates are normal in reporting",
        "The duplicate is a symptom — a join fan-out or double-ingested renewal; DISTINCT hides the bug and keeps the wrong grain",
        "The engine deduplicates automatically unless DISTINCT is present",
        "DISTINCT removes the namespace from the result entirely",
      ],
      answer: 1,
      why: "DISTINCT silences the symptom and keeps the wrong grain. A namespace appearing twice means the FROM layer fans out — a second seat line, a retried ingest — and that inflated row count feeds every SUM and COUNT downstream. Find the fan-out; never launder it.",
      notes: [
        { choice: 0, why: "A duplicated namespace row is never 'normal' — it is the data-quality ticket the census exists to catch." },
        { choice: 2, why: "The engine only deduplicates when told to — the real question is why the fold produced two identical rows, which DISTINCT answers for nobody." },
      ],
      difficulty: "easy",
    },
    {
      id: "gitlab-mcq-17",
      prompt: "One pass: `COUNT(*) FILTER (WHERE status = 'delivered') AS at_term`. A reviewer demands portability. What is the twin?",
      choices: [
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS at_term",
        "COUNT(status = 'delivered') AS at_term",
        "SUM(status = 'delivered') AS at_term",
        "COUNT(*) WHERE status = 'delivered' GROUP BY at_term",
      ],
      answer: 0,
      why: "SUM over a 0/1 CASE flag is the portable conditional count — same 52, same fleet census, runs on any engine. The identity still holds either way: 52 renewed + 30 running + 14 queued + 7 churned = 103 by construction.",
      notes: [
        { choice: 1, why: "COUNT of a boolean expression counts non-NULL results — every row qualifies (1 or 0), so the census reads 103 per branch." },
        { choice: 2, why: "SUM of a bare boolean works in some dialects and errors in others — the CASE wrapper is the portable spelling." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-18",
      prompt: "'Which signed namespaces never went live?' — `WHERE id NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL)`. When does this query lie?",
      choices: [
        "When the subquery returns more than 100 rows",
        "Never — NOT IN is the standard anti-join",
        "If one customer_id in the subquery is NULL, the NOT IN returns zero rows — ever",
        "When the namespaces table holds exactly one row",
      ],
      answer: 2,
      why: "x NOT IN (…, NULL) can never be TRUE: the NULL comparison is UNKNOWN, and NOT UNKNOWN is still UNKNOWN. One stray NULL in the subquery silently empties the anti-join — the expansion-whitespace report reads clean while namespaces are missing. NOT EXISTS (or LEFT JOIN + IS NULL) is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "Row count is a performance note, not a correctness one — the trap is an empty result that looks perfectly reasonable." },
        { choice: 1, why: "NOT IN is standard until a NULL lands in the list — a WHEN, not an IF, on tables that ingest from pipelines." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-19",
      prompt: "The ARR pulse wants each month's book beside the PRIOR month's. A teammate writes LEAD(book) OVER (ORDER BY month). What ships?",
      choices: [
        "The same table — LAG and LEAD are aliases",
        "Each row shows the NEXT month's book — February's prev reads March; the future is wearing history's name",
        "An error — LEAD requires PARTITION BY",
        "NULLs down the entire column",
      ],
      answer: 1,
      why: "LEAD reads forward, LAG reads backward. With LEAD the first row carries a real value and the last is NULL — every month-over-month delta is computed against the wrong baseline. A LAG walk's first row is NULL by design: no prior month, no baseline.",
      notes: [
        { choice: 0, why: "The direction is the whole metric — swap the functions and every delta in the walk flips sign and shifts a month." },
        { choice: 2, why: "PARTITION BY is optional in both functions; the query runs fine and tells the growth story backwards." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-20",
      prompt: "The board packet asks: which namespaces renewed in 2024-01 but NOT in 2024-02? You write `SELECT customer_id … WHERE month = '2024-01' EXCEPT SELECT … '2024-02'`. What does EXCEPT do?",
      choices: [
        "Returns first-set rows with no match in the second — and deduplicates both sides first",
        "Returns the union of both months minus their intersection, keeping duplicates",
        "Errors — EXCEPT needs identical column counts",
        "Returns only the namespaces present in both months",
      ],
      answer: 0,
      why: "A EXCEPT B keeps first-set rows with no second-set match, deduplicating first — renewal rows collapse to distinct namespaces before the diff. INTERSECT answers the mirror question 'renewed in both'. The dedupe is why EXCEPT answers set questions, not census questions.",
      notes: [
        { choice: 1, why: "That is symmetric difference, which SQL has no direct operator for — EXCEPT is one-sided by definition." },
        { choice: 3, why: "'In both' is INTERSECT. The wrong set operator answers the board's question with its opposite." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-21",
      prompt: "A teammate keys the ARR spine with `STRFTIME('%m', created_at)` 'because we only need months'. The chart still renders. What is wrong?",
      choices: [
        "Nothing — '%m' is the standard month key",
        "January 2024 and January 2025 merge into one '01' bucket — 14 spine months collapse to 12 and the trend is fiction",
        "'%m' returns the month name, breaking the sort",
        "STRFTIME needs a third argument for the year",
      ],
      answer: 1,
      why: "The spine key must carry the year: STRFTIME('%Y-%m', …) or SUBSTR(created_at, 1, 7). This db spans 2024-01 to 2025-02, so '%m' alone folds two Januaries into one bucket and every LAG delta silently crosses a year seam.",
      notes: [
        { choice: 0, why: "It renders — that is the trap. The chart is not wrong-looking, it is wrong: 12 buckets instead of 14, months merged." },
        { choice: 2, why: "'%m' returns the zero-padded number ('01'-'12'); '%Y-%m' is what makes buckets year-safe." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-22",
      prompt: "A 3-month moving sum on the 14-month spine: `SUM(book) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. What does the FIRST row's cell hold?",
      choices: [
        "The sum of months 1 through 3",
        "Just month 1's book — the frame truncates where the partition starts",
        "NULL — the frame needs three rows before it computes",
        "The grand total of the whole spine",
      ],
      answer: 1,
      why: "ROWS frames truncate at the partition edge: row one's window is itself, row two sums two months, row three onward sums three. That is the honest rolling read — no invented zeros padding the early rows of the ARR trend chart.",
      notes: [
        { choice: 0, why: "That is what the THIRD row holds. The first row cannot see months after it — frames look backward, not forward." },
        { choice: 2, why: "Frames compute on whatever rows exist — waiting for full width would be an invented NULL, exactly what the frame rules prevent." },
      ],
      difficulty: "medium",
    },
    {
      id: "gitlab-mcq-23",
      prompt: "`SELECT name, renewals FROM (namespace fold) WHERE RANK() OVER (ORDER BY renewals DESC) <= 3` — the reviewer rejects it. Why, and what is the fix?",
      choices: [
        "RANK is deprecated — use ROW_NUMBER",
        "Window output is computed after WHERE — the rank does not exist at filter time; stage the window in a CTE, then filter the outer query",
        "Nothing is wrong — the query runs as written",
        "RANK cannot take an ORDER BY inside OVER",
      ],
      answer: 1,
      why: "The logical pipeline evaluates WHERE before the SELECT stage, and windows are computed with SELECT — a rank is invisible to WHERE (and to sibling expressions). The fix is staging: a CTE or derived table carries the window, the outer query filters rn <= 3. 'Top N per group' is always a two-layer query.",
      notes: [
        { choice: 0, why: "Both functions live in the same stage — swapping them hits the identical wall." },
        { choice: 2, why: "It errors at parse time (window in WHERE), and the error message is the pipeline-order lesson itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-24",
      prompt: "Above-mean seat lines, written correlated: `WHERE quantity > (SELECT AVG(o2.quantity) FROM order_items o2 WHERE o2.order_id = o.id)`. What is wrong beyond the cost?",
      choices: [
        "Nothing — correlated forms are the fastest shape",
        "The inner query re-runs per outer row AND answers a different question — 'above this renewal's own line average', not above the platform per-line mean",
        "It errors — you cannot reference the outer table from a subquery",
        "It returns the platform mean because aggregates flatten everything",
      ],
      answer: 1,
      why: "A correlated subquery re-evaluates once per outer row — 251 inner queries here — and it also drifts semantics: comparing each seat line to ITS OWN renewal's average is a different question than expansion lines above the platform mean. The decorrelated shapes: a derived table of per-renewal seat sums, or AVG(quantity) OVER (PARTITION BY order_id) — each fold computed once.",
      notes: [
        { choice: 0, why: "Correlated forms re-run per row, and the semantics are wrong before the cost even matters." },
        { choice: 3, why: "Aggregates only flatten inside the subquery — the correlation drags the outer row's key in, which is exactly what makes it per-renewal." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-25",
      prompt: "The tier-band fold prints Premium and Free but no Ultimate row (top per-seat price 199.99), yet the forecast deck needs the tier VISIBLE as zero. Which construction works?",
      choices: [
        "Change the ELSE branch to print 0 — the tier row will appear",
        "Seed the tiers from a dimension list (VALUES or a UNION ALL seed) and LEFT JOIN the fold onto it — empty tiers survive as zeros",
        "Add WHERE Ultimate IS NOT NULL to force the row",
        "It is impossible — GROUP BY cannot show an empty group",
      ],
      answer: 1,
      why: "GROUP BY only prints groups that exist — an empty tier is an absent row, and no CASE tweak conjures it. The zero-fill shapes are a LEFT JOIN from a tier dimension with COALESCE to 0, or a UNION ALL seed of tier names. An empty arm you can point at beats a tier that silently vanishes from the forecast.",
      notes: [
        { choice: 0, why: "ELSE only labels rows that exist — with no Ultimate lines there is no group to label. The row is absent at the fold, not mislabeled." },
        { choice: 2, why: "Filtering FOR the missing row guarantees it stays missing — the predicate matches zero rows by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-26",
      prompt: "Pair namespaces that renewed in the same month for a co-adoption study: `FROM orders a JOIN orders b ON a.month = b.month`. Which two bugs follow?",
      choices: [
        "None — the join is correct as written",
        "Every namespace pairs with itself, and every pair appears twice (A-B and B-A) — fix with AND a.customer_id < b.customer_id",
        "The join errors — orders cannot join to itself",
        "Only the first pair per month survives",
      ],
      answer: 1,
      why: "An unordered self-join produces self-pairs (a = b) and mirror duplicates — 45 EU renewals balloon into hundreds of rows. The pair-once idiom adds a strict inequality on the pairing key: a.customer_id < b.customer_id keeps each unordered pair exactly once. This is the shape behind co-renewal and shared-runner reads.",
      notes: [
        { choice: 0, why: "The month equality is necessary but not sufficient — without the inequality the census counts namespaces against themselves." },
        { choice: 2, why: "Self-joins are ordinary SQL — the failure here is combinatorial, not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-27",
      prompt: "Lead-time triage: `WHERE julianday(created_at) >= julianday('2024-10-01')` scans the table. What keeps an index usable?",
      choices: [
        "Wrap the other side too — julianday on both columns balances the plan",
        "Keep the column bare: created_at >= '2024-10-01' — the half-open range predicate is sargable, the function-wrapped column is not",
        "Add an index on julianday(created_at)",
        "Use BETWEEN, which is optimized differently",
      ],
      answer: 1,
      why: "A function wrapped around the indexed column turns the predicate into per-row computation — the planner cannot seek a range. Moving the function to the constant side (or dropping it) restores the seek; pairing it with the half-open habit (>= start AND < end) makes the filter both fast and seam-honest.",
      notes: [
        { choice: 0, why: "Symmetry does not help — the planner needs a BARE indexed column to range-seek; wrapping either side forces the scan." },
        { choice: 2, why: "An expression index exists but is a workaround with its own write cost — the simple fix is to stop wrapping the column." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-28",
      prompt: "Four namespaces tie at 4 renewals. The engagement leaderboard's ORDER BY renewals DESC alone — why does the review call it a bug?",
      choices: [
        "It errors when more than one row ties",
        "Tied rows come back in arbitrary order — the board reshuffles between runs; name every tie-breaker (book DESC, name) so the print is reproducible",
        "Ties are auto-broken by rowid, which is deterministic",
        "ORDER BY cannot sort on an aggregate",
      ],
      answer: 1,
      why: "SQL gives no order guarantee among ties — the four-way block can permute between executions, and a screenshot-based review reads that as the data changing. A deterministic ORDER BY names every tie-breaker explicitly (renewals DESC, spend DESC, name), which is also a policy statement about peer accounts, not just syntax.",
      notes: [
        { choice: 0, why: "Ties sort fine — they just sort STABLY-UNSPECIFIED. Nothing errors; the order drifts." },
        { choice: 2, why: "Even where a rowid tiebreak happens to exist, relying on it is undocumented behavior — the query, not the engine, must own the policy." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-29",
      prompt: "A teammate computes the platform average renewal as the AVERAGE of the four regional means. EU carries 45 renewals, LATAM 2. Why does the board reject the figure?",
      choices: [
        "Averages of averages are always exactly the overall average — the board is wrong",
        "Each regional mean is weighted equally regardless of size — LATAM's 2 renewals count as much as EU's 45; the platform truth is the pooled AVG(total) over all 103 rows",
        "Regional means cannot be averaged — the operation is undefined",
        "The error only appears when regions have equal sizes",
      ],
      answer: 1,
      why: "The mean-of-means re-weights every region to equal size — a small expensive region drags the figure away from the pooled truth. The platform number is AVG(total) over all 103 renewals (338.19), or SUM(total)/COUNT(*), which agree. State which weighting you intend before the deck prints either.",
      notes: [
        { choice: 0, why: "They only agree when every group is the same size — exactly what fails here, with 45 versus 2." },
        { choice: 2, why: "It is perfectly defined — it is just a different, size-blind statistic wearing the platform name." },
      ],
      difficulty: "hard",
    },
    {
      id: "gitlab-mcq-30",
      prompt: "The fleet board stacks per-status detail rows and a grand TOTAL row in one result. Why does the reviewer reject a plain UNION between the two branches?",
      choices: [
        "UNION has a two-SELECT limit",
        "UNION deduplicates across branches — fine here by luck, but it silently sorts and drops legitimate duplicate rows in other stacks; UNION ALL appends honestly and cheaply",
        "UNION cannot combine branches with different column counts",
        "UNION reverses the row order",
      ],
      answer: 1,
      why: "UNION ALL concatenates without a dedupe pass — the honest, cheap stack for a report where every row belongs. Plain UNION adds a distinct-sort and silently removes duplicate rows, turning 'are these rows really identical?' into an accident. Same shape, different contract.",
      notes: [
        { choice: 0, why: "UNION chains arbitrarily — the objection is the hidden dedupe, not the count of branches." },
        { choice: 2, why: "Both require matching column lists — that rule is shared, not the differentiator." },
      ],
      difficulty: "medium",
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
    {
      id: "cs-gitlab-3",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The RANK tie ladder",
      brief:
        "GitLab-flavored brief on the storefront db: the quarterly adoption board publishes the engagement leaderboard — namespaces ranked by renewal count, and the published policy is RANK: ties share a rung AND the gaps stay, because skipped rungs make the tie block's size visible. Probed facts: the renewal ladder runs 24, 17, 14, 13, 5, then a four-way tie at 4 (Pedro Alvarez, Noah Meyer, Keiko Sato, Isabella Rossi), then two namespaces at 3 (Farid Nasser 1,458.97, Hiro Tanaka 829.09). Under RANK the tie block consumes rungs 6 through 9, so the 3-renewal pair lands on rung 10 — the gap IS the policy. The board keeps namespaces at three-plus renewals so the tie behavior is visible in the output, and the biggest book breaks remaining order.",
      ask: "Return each namespace with three or more renewals: name, renewal count, lifetime book to 2 decimals, and the RANK-policy ladder, busiest first.",
      template:
        "SELECT c.name AS namespace,\n       COUNT(*) AS renewals,\n       ROUND(SUM(o.total), 2) AS book,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY ladder, book DESC;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the published tie function",
          why: "The board's policy is RANK: shared rungs WITH gaps — the four-way tie at 4 consumes rungs 6 through 9, and the 3-renewal pair reads 10, 10. DENSE_RANK would print 7, 7 and hide the tie block's width; the gap is the published story, not a bug.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The ladder ranks the most-adopted namespace 1: 24, 17, 14, 13, 5, 4, 4, 4, 4, 3, 3. ASC would crown the 3-renewal namespaces rung 1 and bury the adoption leaders at the bottom — a correct query aimed at the wrong end of the board.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 namespaces — through the tie block AND the 3-tie, so the gap from rung 9 to rung 10 is visible in the output. 5 would amputate everything below the tie block and the review could not see what policy it published.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "5"],
      walkthrough:
        "A fold, a threshold, a published policy. GROUP BY c.id folds 103 renewals into 16 namespaces, SUM(o.total) is the book beside the count, and HAVING COUNT(*) >= 3 keeps 11 rows — 24, 17, 14, 13, 5, then the four-way tie at 4, then the pair at 3. The window ranks the aggregated counts: RANK shares rungs and then skips — 1, 2, 3, 4, 5, then 6, 6, 6, 6, then 10, 10 — and ORDER BY ladder, book DESC keeps the tie block ordered by money (Pedro 1,686.17, Keiko 1,098.60, Isabella 985.65, Noah 737.68) without pretending the tie was broken. The distractors each break differently: DENSE_RANK prints 7, 7 where the board's policy prints 10, 10 — correct arithmetic wearing the wrong policy; ROW_NUMBER numbers the tied namespaces 6 through 9 as if renewal counts could break a tie; ASC crowns the quiet namespaces; 5 cuts the output at the tie block's edge and the gap — the whole point of RANK — disappears from the print. The board ships this query verbatim: the tie policy is SQL, not a footnote.",
    },
    {
      id: "cs-gitlab-4",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The DORA lead-time board",
      brief:
        "GitLab-flavored brief on the storefront db: the reliability review's Monday board folds the renewal fleet per region in ONE pass — renewals booked, renewed-to-term, churned, and the DORA lead-time analog (booking to go-live) averaged over the rows that carry a shipped_at stamp. Probed facts: 103 renewals — EU 45 (24 at term, 3 churned, lead 2.94 days over 36 stamped), APAC 37 (21 at term, 3 churned, lead 2.93 over 29 stamped), US 19 (5 at term, 1 churned, lead 3.07 over 15 stamped), LATAM 2 (2 at term, 0 churned, lead 3.50 over 2 stamped). The 2.98 platform average hides the spread: the US runs the slowest go-live at regional grain. The board keeps every region and reads the biggest fleet first.",
      ask: "Return each region with its renewal count, renewed-to-term count, churned count, and average lead time in days to 2 decimals, biggest fleet first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS renewals,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS at_term,\n       COUNT(*) FILTER (WHERE o.status = 'cancelled') AS churned,\n       ROUND(AVG(julianday(o.shipped_at) - julianday(o.created_at)), 2) AS avg_lead_days\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY renewals {4};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the renewed-to-term literal",
          why: "Renewed-to-term is status 'delivered' — 24 EU, 21 APAC, 5 US, 2 LATAM (52 platform-wide). 'shipped' would read the 30 running rows into the term column and the review would book go-lives as term completions.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the join key",
          why: "The join attaches each renewal to its namespace: c.id = o.customer_id. o.id pairs order N with customer N and scrambles every regional cell; c.id = c.id is always true and cross-products 103 renewals against all 16 namespaces.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the keep-everyone floor",
          why: "HAVING COUNT(*) >= 2 keeps all four regions — LATAM's 2 renewals included, because a region vanishing from the DORA board IS the incident. 10 would cut the US and LATAM rows and the slowest lead time (US 3.07) would vanish from the review.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-fleet-first direction",
          why: "The board reads the biggest fleet on top: EU 45, APAC 37, US 19, LATAM 2. ASC would open on LATAM's 2 renewals — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["'shipped'", "o.id", "10", "ASC"],
      walkthrough:
        "One scan, three conditional counts, one lead-time average. The join attaches every renewal to its namespace's region, GROUP BY region folds 103 rows into four, and the FILTER arms count inside the same pass: at_term reads 24 / 21 / 5 / 2 (the 52 delivered), churned reads 3 / 3 / 1 / 0 (the 7 cancelled). The lead-time arm averages julianday(shipped_at) − julianday(created_at) — NULL for unstamped rows, which AVG skips — and reads 2.94 / 2.93 / 3.07 / 3.50 over the 36 / 29 / 15 / 2 stamped rows; the US runs slowest at 3.07 against APAC's 2.93, the spread the platform 2.98 hides. COUNT(*) is the audit anchor — 45 / 37 / 19 / 2, summing to 103 by construction. The distractors each break differently: 'shipped' in the term slot misbooks go-lives as term completions; o.id joins order N to customer N and scrambles the regional split; 10 in the floor slot deletes the US row — the very region the lead-time story is about; ASC opens the board on LATAM. One query, one pass, and the DORA board defends every cell.",
    },
    {
      id: "cs-gitlab-5",
      tier: "medium",
      topic: "q5",
      universe: "growth",
      title: "The above-the-mean fleet",
      brief:
        "GitLab-flavored brief on the storefront db: before the enterprise pod plans its quarter it runs the above-the-mean scan — which namespaces carry a lifetime book bigger than the platform per-namespace mean. Probed on the storefront db: 103 renewals fold into 16 namespaces; the mean namespace book is 2,177.08, and exactly five clear it — Alice Chen (24 renewals, 7,262.35), Emma Wilson (17, 6,640.56), Grace Kim (14, 4,574.23), Maya Patel (13, 3,644.56), Chloe Dubois (5, 2,667.93). These are the same five logos the 2,000-plus concentration line flags, carrying 71.2% of the 34,833.28 book. The scan prints the biggest book first and stops at five.",
      ask: "Return each namespace whose lifetime book exceeds the platform per-namespace mean: name, renewal count, and lifetime spend to 2 decimals, biggest spend first, top five.",
      template:
        "WITH org AS (\n  SELECT customer_id, SUM(total) AS book, COUNT(*) AS renewals\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT c.name AS namespace,\n       o2.renewals,\n       ROUND(o2.book, 2) AS lifetime_spend\nFROM org o2\nJOIN customers c ON c.id = o2.customer_id\nWHERE o2.book {1} (SELECT AVG(book) FROM org)\nORDER BY lifetime_spend {2}\nLIMIT {3};",
      slots: [
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-mean operator",
          why: "The scan lists namespaces ABOVE the per-namespace mean — the enterprise pod's call list. '<' returns the below-mean complement (11 namespaces) and '=' returns zero rows, since no book sits exactly on the 2,177.08 line.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-book-first direction",
          why: "The pod reads the list biggest book first: 7,262.35 down to 2,667.93. ASC would open the planning call on the smallest above-mean logo and bury the anchor account.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the call-list cut",
          noVerify: true,
          why: "Exactly five namespaces clear the mean, so LIMIT 5 prints the whole cohort — the cut is a guard, not a filter: if a sixth logo crossed the line tomorrow, the list would silently truncate. The cut only means anything downstream of the ORDER BY.",
        },
      ],
      distractors: ["<", "=", "ASC", "3"],
      walkthrough:
        "Stage the fold, then judge it against its own mean. The CTE folds 103 renewals into 16 per-namespace books — the grain the mean lives at — and the outer query joins back for names, keeps every book strictly above (SELECT AVG(book) FROM org): the mean is 2,177.08, five namespaces clear it, and ORDER BY lifetime_spend DESC prints 7,262.35, 6,640.56, 4,574.23, 3,644.56, 2,667.93. The read is the concentration story: these five are the 2,000-plus cohort carrying 71.2% of the book — the renewal-call calendar and the enterprise pod's staffing both trace to this list. The distractors each break differently: '<' serves the below-mean complement — eleven namespaces the pod explicitly did NOT ask for; '=' returns zero rows because no book equals the mean exactly, an empty list that looks like a clean bill of health; ASC opens on the smallest logo; LIMIT 3 amputates two logos off a five-logo call list. One CTE, one scalar baseline, one direction, one cut — and the quarter plan starts from a defensible list.",
    },
    {
      id: "cs-gitlab-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The anchor-account pulse",
      brief:
        "GitLab-flavored brief on the storefront db: before the enterprise pod dials into the anchor-account QBR it walks the namespace's renewal-by-renewal pulse — every booking beside the prior one, delta attached — because the account's story lives in the sequence, not the sum. Probed on the storefront db: Alice Chen is the anchor — 24 renewals worth 7,262.35, booked 2024-01-02 through 2025-02-19. The walk opens at 152.52, jumps to 767.64 (+615.12, the seat-block expansion), then settles 705.23 (-62.41) and 632.29 (-72.94). LAG carries the prior renewal; the first row's delta is honestly NULL — no baseline exists. Chronological order, smallest granularity the book has.",
      ask: "Return the anchor namespace's renewals in booking order: date, renewal value to 2 decimals, the prior renewal's value, and the delta to 2 decimals.",
      template:
        "SELECT o.created_at AS booked_on,\n       ROUND(o.total, 2) AS renewal_value,\n       {1}(o.total) OVER (ORDER BY o.created_at) AS prev_value,\n       ROUND(o.total - LAG(o.total) OVER (ORDER BY o.created_at), 2) AS delta\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE c.name = {2}\nORDER BY booked_on {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-renewal reader",
          why: "LAG(o.total) walks the account's history backwards one row — January 22nd's prev_value is January 2nd's 152.52. LEAD would read forward and hand each row the NEXT booking, re-labeling the future as history; the first row's NULL is the honest 'no baseline', never a coalesced zero.",
        },
        {
          answer: "'Alice Chen'",
          kind: "keyword",
          label: "the anchor namespace",
          why: "The anchor is Alice Chen — 24 renewals, 7,262.35 lifetime, the platform's biggest book. 'Emma Wilson' returns a different account (17 renewals, 6,640.56) and the QBR would walk someone else's expansion story with this deck's title on it.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "An account pulse is chronological: ASC keeps the 2024-01-02 opener on top so each delta compares against the row above. DESC starts at 2025-02-19 with no context — the numbers survive, the expansion-then-settle narrative does not.",
        },
      ],
      distractors: ["LEAD", "'Emma Wilson'", "DESC"],
      walkthrough:
        "One account, one window, one story. The join filters to the anchor namespace, and the window walks the bookings in created_at order: LAG(o.total) brings each prior renewal up, and the delta divides nothing — it subtracts, printing the account's history as movements, not levels: 152.52 (NULL — no baseline) → 767.64 (+615.12, the expansion block) → 705.23 (-62.41) → 632.29 (-72.94) → 317.49 (-314.80) — 24 rows ending at the 2025-02-19 booking. This is the shape behind the NRR conversation: expansion shows up as a positive run, contraction as a negative one, and the SUM (7,262.35) is the footnote, not the story. The two-layer shape matters — window output is invisible to WHERE and to sibling expressions, which is why both windows re-state the full OVER clause rather than aliasing. The distractors each break differently: LEAD reads the future (each row's prev becomes the NEXT booking, and the +615.12 expansion lands on the wrong side of the jump); 'Emma Wilson' walks a different account; DESC tells the story backwards from the newest booking. One join, one filter, one direction — and the QBR opens on a defensible sequence.",
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
    { slug: "user-activity-for-the-past-30-days-i", why: "Adoption windows: namespaces active in the trailing 30 days, counted with the window stated — the rollout-health read the CS pod runs after every go-live." },
    { slug: "find-users-with-persistent-behavior-patterns", why: "Persistent CI usage is the adoption signal that predicts renewal — repeated daily activity over a streak window, exactly the pattern this problem drills." },
    { slug: "active-users", why: "Five-day consecutive activity is the developer-adoption bar DevOps vendors quote — streak logic over daily active namespaces, in miniature." },
    { slug: "rolling-7d-actives", why: "Rolling actives smooth the bursty CI graph into an honest trend — the frame discipline (7-day window, stated grain) the reliability dashboards run on." },
    { slug: "customer-order-frequency", why: "Renewal cadence per namespace: who renews at least N times in a period — a HAVING-threshold fold that sizes the renewal-call calendar." },
    { slug: "second-day-confirmation", why: "Did CI run the day after signup? Consecutive-day logic is the activation confirmation read — the 'second day' milestone every onboarding funnel watches." },
    { slug: "confirmation-rate", why: "LEFT JOIN + rounded ratio where unmatched rows must count as 0% — the NULL-policy and 100.0-division habits behind every go-live rate on this db." },
    { slug: "immediate-food-delivery-ii", why: "Share of orders meeting the promise on the first pass — the conditional-rate-with-stated-denominator shape behind 'share of renewals live within a week'." },
    { slug: "customers-with-strictly-increasing-purchases", why: "Seat expansion as a monotone run: renewals that grow booking over booking are the expansion cohort — LAG-comparison logic over the account history." },
    { slug: "analyze-subscription-conversion", why: "Trial-to-paid conversion is the front door of the funnel — the same stage-share arithmetic growth ops runs on signed → provisioned → running." },
    { slug: "find-churn-risk-customers", why: "Dormancy before the renewal date is the churn-risk list — recency logic over activity stamps, the cohort that feeds the winback calendar." },
    { slug: "dormant-reactivation", why: "Resurrected namespaces — active again after a gap — are the growth-accounting 'resurrected' bucket; gap detection over event timestamps is exactly this shape." },
    { slug: "user-purchase-platform", why: "SaaS versus self-managed preference split — platform-preference reads drive the deployment-mode pitch; this problem is that segmentation at practice scale." },
    { slug: "the-most-recent-three-orders", why: "Latest renewals per namespace with ties handled by an explicit rule — the account-timeline read the QBR deck opens with." },
    { slug: "drop-type-1-orders-for-customers-with-type-0-orders", why: "Set algebra with a twist — drop the managed-mode renewals for namespaces that self-host: layered set logic is how deployment-mode overlaps get untangled." },
    { slug: "plan-migration-paths", why: "Free → Premium → Ultimate migrations are the tier-motion story the monetization pod manages — LAG over plan changes is exactly this problem's shape." },
  ],
};
