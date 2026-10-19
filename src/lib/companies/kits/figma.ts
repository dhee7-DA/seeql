// Figma — Wave-8 (Task 96), saas domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Seat-economics SQL: the storefront db read as a design-org sandbox — customers are
// organizations on the enterprise agreement, orders are license renewals (delivered =
// renewed to term, shipped = editor seats live in multiplayer with shipped_at as the
// go-live stamp, pending = rollout scheduled, cancelled = seats revoked to free viewers),
// order_items are the seat lines on each renewal (quantity = seats, unit_price =
// per-seat price). Viewer-to-editor funnels, two-grain org censuses, seat-band CASE
// folds, tie-heavy adoption leaderboards, the 14-month renewal spine, and the billing
// tables (INTEGER cents) that sit under "renewed". Pool provenance: company-pools.md
// carries NO Figma section — fewer than 2 tagged rows and none SQL-graded — so all 10
// topic slug sets and all 16 problems are theme-curated from the pools file's theme
// menu and say so. Case briefs quote probed figures from scripts/company-facts.md
// (probed 2026-10-12); the band-fold and above-the-line AR cells were additionally
// verified with a one-off read-only probe (scripts/tmp-probe-96-figma.ts, deleted
// after authoring), and every case slot is mechanically verified against db/custom.db
// by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const figmaKit: CompanyKit = {
  id: "figma",
  domainId: "saas",
  name: "Figma",
  tagline: "Design files, components and multiplayer canvases",
  accent: "text-pink-300",

  brief: [
    "**Figma** is the design platform where the product IS the canvas — design files and pages, components and variants, and multiplayer editing sessions where a dozen cursors work the same file at once. It monetizes through editor seats while viewers ride free, so every growth number in the building is a conditional count over seat objects. This kit maps the storefront db onto that world: the 16 customers rows are organizations on the enterprise agreement, the 103 orders are license renewals worth **34,833.28**, and the 251 order_items rows are seat lines — quantity = seats, unit_price = per-seat price. The status map is fixed: delivered = {emerald:renewed to term} (52, 50.5%), shipped = {sky:live in multiplayer} (30, 29.1%), pending = rollout scheduled (14), cancelled = {rose:seats revoked} (7, 6.8%).",
    "The data org splits into growth, monetization and a design-systems analytics pod, and they read the same renewal spine at different grains. Activation is the heartbeat: a renewal books at created_at, and shipped_at is stamped the day the seats actually go live in multiplayer — **82 of 103 renewals** carry the stamp, averaging **2.98 days** to activate with a 2–4 day spread, and the 14 pending rows have none yet (a population definition, not a cleanup job). Money sits one layer down: invoices and payments in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with orgs whose lifetime spend crosses 3,000 (71.2% above 2,000) — *one lost logo moves a quarter*.",
    "Interview screens are census-then-denominator, with a Figma twist: design-system adoption and {violet:DevMode handoff} coverage are counted right next to seat economics. A typical loop opens with a **two-grain org census** — EU runs 45 renewals from 8 orgs (5.6 per logo) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator out loud (*'do pending rollouts dilute your activation rate?'*), then into the seat-band census where CASE arms must partition the catalog without holes. Late rounds walk the {sky:14-month renewal spine} (2024-01 to 2025-02) with LAG deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries **no Figma section** — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: viewer-to-editor funnels, two-grain org censuses, seat-band CASE folds, tie-heavy adoption leaderboards and the cents-safe billing spine. Do the topics in order, then run all six case studies on the live storefront db — spaced practice rather than one sitting: the {pink:seat-band census} the pricing pod reads every quarter, the {violet:above-the-line AR list} billing walks at every close, the Monday one-pass activation census, the adoption tie ladder, the never-collected dunning stack, and the month-over-month renewal pulse. The bar to clear: *state the definition and the denominator before you compute anything* — and make every band fold account for all 251 seat lines by construction.",
  ],

  dayInLife: [
    "**09:00 —** The day opens with the multiplayer health check. A growth analyst pulls the activation refresh before standup: did overnight seat blocks land, did any org get its `shipped_at` stamp without a rollout owner, does the one-pass status census reconcile — 52 renewed + 30 live + 14 scheduled + 7 revoked = **103 by construction**? A branch that misses that identity is *the day's first incident*, not a rounding note. If time-to-first-edit drifts off the **2.98-day** norm, the rollout queue gets pulled before the design-systems pod's weekly adoption read ships.",
    "**12:30 —** Midday is the seat-economics block. The pricing pod wants the quarterly seat-band census re-run — {rose:starter} lines under 50, {sky:editor} lines 50 to 200, the premium arm that must keep returning an honest zero — and the design-systems pod wants the adoption leaderboard with the four-way tie at 4 renewals handled by a named policy, not a silent tiebreak. A regional VP wants renewals per org beside org counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional fold and one judgment call about which grain the number lives at; the analyst writes every query twice — *once to answer, once with the definition spelled out so the number survives the review argument*.",
    "**16:30 —** The afternoon tilts toward handoff and money. DevMode asks first: which orgs' engineers pulled specs this week, and which component libraries went stale — the anti-join of libraries with no refresh. Then the close: the AR anti-join refreshes — **6 never-collected invoices worth 15,217** — before billing sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; the anomaly list gets walked line by line: a void-but-paid invoice (#11, 925.00) and a paid-status invoice with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Editor-seat activation rate", what: "Renewals with shipped_at stamped ÷ all renewals booked: 82 of 103 (79.6%). The top-of-funnel number growth reads every Monday — the 14 pending rows are 'rollout scheduled', never a silent zero." },
    { name: "Time-to-first-edit", what: "Booking to go-live (created_at → shipped_at) over activated renewals only: 2.98-day average, range 2–4. The population definition ships with the number — open rollouts have no cycle yet and must not dilute it." },
    { name: "Renewal kept rate", what: "Delivered ÷ ALL renewals booked: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count, and the denominator — live rollouts included — is the whole interview." },
    { name: "Seat revocation rate", what: "Cancelled share of booked renewals: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%. The churn cohort map that drives the winback and downgrade calendar, since revoked editor seats become free viewers." },
    { name: "Seat book (ARR)", what: "Total renewal value booked: 34,833.28 across 103 renewals, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — one 1,088.44 renewal outweighs the smallest 42 combined." },
    { name: "Org concentration", what: "Share of the book from orgs spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs customer success and sizes the enterprise pod." },
    { name: "Seat-line fan-out", what: "Seat lines ÷ renewals: 251 order_items across 103 renewals. Expansion shows up here first — seats added mid-term are new lines, not new renewals; the grain trap every census here grades." },
    { name: "Collections coverage", what: "Renewed versus collected: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected worth 15,217. The AR anti-join the billing pod refreshes every close." },
  ],

  topics: [
    {
      name: "The viewer-to-editor funnel",
      why: "Figma monetizes editor seats while viewers ride free, so the headline funnel is signed org → seats live → renewed to term, each stage a conditional count over a status or timestamp. The interviewer's first question is what the denominator holds, and the trap is calling an activated renewal 'renewed' — 30 live versus 52 kept on this db. This problem family drills the share-with-stated-denominator shape the funnel report uses every single week.",
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "email-engagement-funnel", "game-play-analysis-v", "median-time-to-convert", "find-loyal-customers", "unique-orders-and-customers-per-month", "dau-wau-stickiness"],
    },
    {
      name: "Two-grain org censuses",
      why: "Renewals and organizations are different grains of the same join, and every census here reports both: EU runs 45 renewals from 8 orgs while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded. The 5.6-versus-9.5 intensity gap is the sentence that gets quoted in the review.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations", "number-of-comments-per-post", "number-of-rich-customers"],
    },
    {
      name: "Joining orgs to renewals",
      why: "Orgs carry region and created_at; renewals inherit them through joins, and the join type decides who survives. A renewal without an org is corruption; an org without renewals is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job. DevMode handoff reads push the same join one hop further into seat lines, where fan-out quietly changes the grain.",
      slugs: ["combine-two-tables", "sales-person", "top-travellers", "find-the-team-size", "find-customers-with-positive-revenue-this-year"],
    },
    {
      name: "Adoption leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four orgs sit at 4 renewals each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer orgs, not syntax. Design-system adoption boards get published from these queries, so the tie policy ships with the query comment.",
      slugs: ["rank-scores", "compute-the-rank-as-a-percentage", "group-employees-of-the-same-salary", "customer-placing-the-largest-number-of-orders", "second-most-recent-activity", "department-top-three-salaries", "biggest-window-between-events", "keep-latest-dedupe"],
    },
    {
      name: "Seat bands with CASE",
      why: "The pricing page publishes per-seat list bands and every seat line must land in exactly one — starter, editor, premium — with the arms exhaustive and ordered. A hole in the CASE is a hole in the revenue mix, and a reordered WHEN quietly re-bands the base. On this db the premium arm stays honestly empty — max list price 199.99 — and an empty arm you can explain beats a band that invents revenue.",
      slugs: ["the-category-of-each-member-in-the-store", "type-of-triangle", "loan-types", "count-salary-categories", "consecutive-available-seats", "percentage-of-users-attended-a-contest", "net-revenue-retention", "average-selling-price"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month renewal spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. The same walk powers the ARR bridge finance reads at every close.",
      slugs: ["consecutive-numbers", "year-on-year-growth-rate", "mrr-waterfall", "rolling-7d-actives", "cohort-repeat-revenue", "employee-bonus", "calculate-special-bonus", "growth-accounting", "null-blank-audit"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — activated under revoked, this quarter beside last — and EXCEPT answers 'which signed orgs never activated'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. On this db the never-renewed anti-join is a confident zero, and stating that with proof is the credibility move.",
      slugs: ["monthly-transactions-ii", "league-statistics", "customers-who-never-order", "sales-analysis-iii", "customers-who-bought-all-products", "customers-who-bought-a-and-b-not-c"],
    },
    {
      name: "Above-average gates",
      why: "Screens escalate into staging: fold per-org renewal books, then judge them against a computed platform mean — the gate that catches the same five orgs as the 2,000 concentration line. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. The month-close AR list is the same shape: every invoice above the paid-average line.",
      slugs: ["find-expensive-cities", "second-highest-salary", "game-play-analysis-iv", "group-sold-products-by-the-date"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets renewed, live, scheduled and revoked in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The census identity is the fastest data-quality check in the kit: a branch that misses 103 is an incident.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "odd-and-even-transactions"],
    },
    {
      name: "Billing & cents discipline",
      why: "Renewed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the seat world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. Settlement aging (28.4 days average, 13 to 84) is the lens that turns the split into a collection calendar.",
      slugs: ["ar-aging-schedule", "trial-balance-check", "duplicate-charge-pairs", "monthly-transactions-i", "product-price-at-a-given-date"],
    },
  ],

  theory: [
    {
      id: "figma-t1",
      q: "The design-systems pod wants every organization with its renewal activity, and engineering wants every renewal tagged with the org's region. When do you INNER and when do you LEFT — and what silently breaks if you filter a renewal column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A renewal report joins renewals to orgs: a renewal with no org row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from customers: the orgs with no renewals ARE the answer, arriving with NULL renewal columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload org row — the LEFT quietly became an INNER and the whitespace vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-renewing orgs — all 16 organizations appear in the renewal table somewhere — and proving that zero is itself the analyst's job, because the same query on a staging table is exactly where silent empties ship.",
      tag: "joins",
    },
    {
      id: "figma-t2",
      q: "Four organizations sit tied at 4 renewals on the adoption leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder runs 24, 17, 14, 13, 5, then the four-way tie at 4 consumes ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose org keeps its named customer-success owner. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer orgs (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "figma-t3",
      q: "The census shows 103 renewals and 16 organizations; EU shows 45 renewals and 8 orgs. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts renewal rows after the join — one row per renewal, so an org with 24 renewals contributes 24. COUNT(DISTINCT customer_id) folds those rows back to orgs — EU's 45 renewals collapse to 8 logos. Neither is wrong: renewals measure load and seat momentum, orgs measure installed base and coverage. The ratio — 5.6 renewals per org in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for seat lines and COUNT(*) silently counts seat lines, not renewals — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, and here it has a real cost: a seat-line count wearing a renewal name misfiles the expansion story.",
      tag: "aggregation",
    },
    {
      id: "figma-t4",
      q: "shipped_at stays NULL until an org's editor seats actually go live in multiplayer. What is your policy for the time-to-first-edit report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only activated renewals have a latency, so the report measures booking-to-go-live for the 82 of 103 renewals that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL renewals returns the activated-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the activated subset; the gap between it and COUNT(*) is exactly the 14 pending plus 7 revoked rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day activations for rollouts that have not started. A report whose WHERE clause is doing definitional work without saying so is exactly what a Figma reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "figma-t5",
      q: "The growth review wants renewed value per region for regions carrying at least ten renewals. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards live, scheduled and revoked rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-renewal floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; on this db it keeps EU (45), APAC (37) and the US (19) and drops LATAM (2). Putting the floor in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to renewals versus to dollars. The strong answer places every filter by asking: is this a fact about one renewal, or about a region?",
      tag: "pipeline",
    },
    {
      id: "figma-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 renewals always produce a mean, and the per-org version — average org book near 2,177 — is cleared by exactly five orgs, the same five that sit above the 2,000 concentration line and carry 71.2% of the book. On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average gate is how it hides. The correlated cousin (compare each renewal to ITS org's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "figma-t7",
      q: "The renewal trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's bookings, and quarter-end is exactly when renewals land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The walk itself tells the story on this db: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August before the steepest drop, -1,326.87, lands in November. Date discipline is growth discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "figma-t8",
      q: "Finance says an invoice is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 invoices worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void invoice WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-collected, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — and the .0 is policy, not decoration: it is the only thing standing between a clean print and silent truncation the day an odd-cent feed lands. Settlement discipline belongs in the same breath: 20 paid invoices settle in 28.4 days on average, fastest 13, slowest 84 — the aging lens that turns the coverage split into a collection calendar.",
      tag: "quality",
    },
    {
      id: "figma-t9",
      q: "The growth call wants a 3-month moving average of the renewal book on the 14-month spine. Walk me through the frame — and what the first two rows of the chart are allowed to show.",
      a: "The frame is the contract: SUM(book) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) sums each month with its two predecessors. ROWS (not RANGE) is deliberate — the spine key is unique per month, but ROWS states the row-intent explicitly, and at renewal grain where created_at ties exist RANGE would silently absorb peers. The edge rows truncate honestly: month one's window is itself, month two's is two rows wide, and only month three onward is a true 3-month sum. What is never acceptable is padding the two edge rows with zeros to make the chart 'full' — that invents two flat months into the trough the call is about to discuss. On this spine the moving average smooths the July trough (1,193.86) and the August rebound (2,352.07) into the trend the narrative actually quotes.",
      tag: "windows",
    },
    {
      id: "figma-t10",
      q: "Board packets stack populations — renewed-to-term beside live-in-multiplayer beside the whole book. When do you reach for UNION ALL, plain UNION, EXCEPT and INTERSECT — and which choice is a correctness decision rather than a style one?",
      a: "UNION ALL concatenates and keeps everything — the default for stacking disjoint arms (detail rows plus a TOTAL row, per-status packets) because every row belongs and dedupe would be a silent lie. Plain UNION deduplicates whole rows across both branches: reaching for it is a correctness claim that duplicates are impossible, and when they are not, it deletes data without an error. EXCEPT answers 'in the first set but not the second' — signed orgs that never went live — and dedupes first, which makes it a set-difference tool, not a census tool. INTERSECT answers 'in both'. The interview move is saying which operator's dedupe behavior you are relying on, out loud, because the row counts the board quotes depend on it.",
      tag: "sets",
    },
    {
      id: "figma-t11",
      q: "The seat-band CASE fold prints starter and editor but no premium row at all — the top list price is 199.99. Why does GROUP BY drop the band, and how do you make an empty arm print as zero?",
      a: "GROUP BY folds existing rows into groups; an arm that matches zero rows produces no group, so the band is absent from the output — not zero, not NULL, simply not there. The empty-arm honesty options: seed the band names from a dimension (a VALUES list or a UNION ALL seed of 'starter','editor','premium') and LEFT JOIN the fold onto it, COALESCE-ing missing counts to 0; or accept the absent row and say so in the read. What you cannot do is conjure the row inside the CASE — ELSE labels existing rows, it does not create them. The same logic explains why GROUP BY treats NULLs as one group: a band key of NULL (a hole in the CASE) would print as a NULL-named row rather than disappear — which is exactly how CASE holes announce themselves in review.",
      tag: "groupby",
    },
    {
      id: "figma-t12",
      q: "'Which organizations carry a renewal book above the platform per-org mean?' — compare the derived-table shape, the correlated shape and the window shape, and say what each costs.",
      a: "Derived table: fold per-org books once (SELECT customer_id, SUM(total) AS book … GROUP BY customer_id), then judge book > (SELECT AVG(book) FROM that fold) — on this db the mean is 2,177.08 and exactly five orgs clear it, the same five above the 2,000 concentration line carrying 71.2% of the book. Correlated: the inner query re-runs once per outer row, sixteen times here, and worse, it drifts semantics — comparing each org's book to ITS OWN average renewal is a different question. Window: AVG(SUM(total)) OVER () needs the fold staged first, so you end up in a CTE anyway. The derived-table shape wins on this db for the same reason it wins in interviews: it names its grain (per-org book) and its baseline (mean of those books) in two lines the reviewer can audit.",
      tag: "subqueries",
    },
    {
      id: "figma-t13",
      q: "Marketing wants orgs that renewed in the same month paired up for a co-adoption study. How do you self-join orders so each pair appears exactly once?",
      a: "Self-join on the shared attribute — orders a JOIN orders b ON SUBSTR(a.created_at,1,7) = SUBSTR(b.created_at,1,7) — then kill the two degenerate cases with a strict inequality on the pairing key: AND a.customer_id < b.customer_id. Without it you get self-pairs (every org paired with itself) and mirror duplicates (A-B and B-A both counted), which inflate the co-renewal census combinatorially. The inequality keeps each unordered pair exactly once and hands you a canonical direction for free — the smaller id is 'first'. Say the pair-count math out loud in the interview: the bug version counts n-squared-ish rows, the fixed version counts actual pairs, and the difference is the difference between a study and noise.",
      tag: "joins",
    },
    {
      id: "figma-t14",
      q: "The whitespace report — signed orgs with zero activated renewals — is written as NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL). What is the failure mode, and what do you ship instead?",
      a: "NOT IN with a NULL anywhere in the subquery returns zero rows, permanently: x NOT IN (…, NULL) evaluates to UNKNOWN for every outer row, and NOT UNKNOWN is still UNKNOWN. The report reads 'no whitespace' while lying. Ship NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.shipped_at IS NOT NULL) — existence probes short-circuit and never trip on NULLs — or the LEFT JOIN + IS NULL anti-join with the same NULL-safety. On this db the honest answer is a confident zero: all 16 organizations appear among the 82 stamped renewals, and proving that zero (running the anti-join, showing the empty set is real) is part of the credibility of every other number in the packet.",
      tag: "nulls",
    },
    {
      id: "figma-t15",
      q: "Time-to-first-edit is AVG(julianday(shipped_at) - julianday(created_at)) over the renewals that carry a stamp. Walk me through the NULL behavior, the cast to whole days, and the population statement the title must carry.",
      a: "julianday(NULL) is NULL, so each unstamped renewal contributes a NULL latency, and AVG skips NULLs — the aggregate runs over the 82 stamped rows and reads 2.98 days, range 2 to 4. That skipping is correct only because the title says 'over activated renewals': the 14 pending and 7 revoked rows have no cycle yet, and a silent WHERE-less AVG returns the same number over an unnamed population. Whole days come from CAST(diff AS INT) or ROUND(diff, 0) — julianday diffs are real days with fractional parts, and '2.98' versus '3' is a presentation decision to make once, in one place. The never-do is IFNULL(diff, 0), which invents 14 same-day activations and drags the average to near zero — a metric-destroying 'fix' that any reviewer who has closed a quarter will catch on sight.",
      tag: "dates",
    },
    {
      id: "figma-t16",
      q: "Two exports spell the same organization 'acme design co' and 'Acme Design Co ' — with a trailing space. What breaks, and what is the string-hygiene pass every join key needs?",
      a: "The join key matches byte-for-byte, so one org becomes two in every census, its book splits across both spellings, and no error ever fires — the fold just disagrees with finance. The hygiene pass: normalize with UPPER(TRIM(name)) on both sides of the join (or a stored normalized column), decide the canonical key once, and audit before merging with GROUP BY the normalized key HAVING COUNT(DISTINCT raw) > 1 to list the collisions. GROUP_CONCAT deserves the same sentence: it folds names into one manifest cell but its order is not guaranteed without an explicit ORDER BY inside the aggregate, so treat cells as sets. Figma-flavored framing: a design-system component library cannot have two sources of truth, and neither can an org name that joins four tables.",
      tag: "strings",
    },
    {
      id: "figma-t17",
      q: "The pricing pod wants seat SKUs cut into quartiles by list price. How do NTILE, and its PERCENT_RANK cousin, behave — especially with ties at a band edge?",
      a: "NTILE(4) OVER (ORDER BY price) assigns each row a tile number 1 through 4 with near-equal membership — with 16 SKUs, four per tile. Ties do not split: rows equal on the ORDER BY key land in the same tile, which can make neighboring tiles lopsided — that is a feature, not a bug, because a band edge that splits identical prices is unexplainable to a customer. PERCENT_RANK is the continuous cousin: each row's (rank − 1)/(rows − 1) share, useful when the deck wants 'this SKU sits above 87% of the catalog' instead of a tile number. Both are computed after ordering, invisible to WHERE of the same SELECT — stage in a CTE if the pod wants to filter to the top tile. The publishing rule: quartile boundaries are computed from data, but the pricing page prints human bands — someone must own the mapping between the two.",
      tag: "windows",
    },
    {
      id: "figma-t18",
      q: "The Monday multiplayer health check is one query: renewed, live, scheduled, revoked — 52, 30, 14, 7. Walk me through the one-pass construction and why four sequential queries are a data-quality risk.",
      a: "One pass, one scan: COUNT(*) FILTER (WHERE status = 'delivered') AS at_term, and three FILTER siblings for 'shipped', 'pending', 'cancelled' — the portable twin is SUM(CASE WHEN status = … THEN 1 ELSE 0 END) per arm. The audit anchor is COUNT(*) beside the arms: every branch must reconcile, 52 + 30 + 14 + 7 = 103 by construction, and a branch that misses 103 is the day's first incident, not a rounding note. Four sequential queries drift independently — a new status value lands in one branch and not the others, the queries run seconds apart against a moving table, and no error anywhere announces the disagreement. The one-pass version has exactly one failure surface and one identity, which is why this kit treats the census as the fastest data-quality check in the building.",
      tag: "aggregation",
    },
    {
      id: "figma-t19",
      q: "'Each organization's most-ordered SKU' — walk me through the argmax shape, the tie policy, and why the filter cannot live in the same SELECT as the window.",
      a: "Two layers. Inner: fold seat lines per org-SKU (SUM(quantity) seats, GROUP BY customer_id, product_id). Outer: ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY seats DESC, product_id) = 1 keeps each org's top SKU — with the tie-breaker NAMED, because two SKUs at the same seat count must not rotate between runs; RANK or DENSE_RANK if the business wants ties to share the crown. The filter cannot sit beside the window: window functions are computed in the SELECT stage, after WHERE, so WHERE rn = 1 is either an error or, worse, a re-read of a column that does not exist yet. Stage the window in a CTE or derived table, filter in the outer query. This shape is the seed of personalization reads and the interview's favorite 'can you compose two grains' probe.",
      tag: "windows",
    },
    {
      id: "figma-t20",
      q: "The activation-trend query filters with julianday(created_at) >= julianday('2024-10-01') and the plan shows a full scan. What is sargability, and how do you rewrite for the index?",
      a: "Sargability = searchable-argument: the predicate must leave the indexed column bare so the planner can seek a range. Wrapping the column in any function — julianday(created_at), UPPER(name), SUBSTR(key, 1, 7) — turns the predicate into per-row computation and the index into dead weight; the scan is invisible at 103 rows and career-defining at millions. The rewrite moves the function to the constant side or drops it: created_at >= '2024-10-01' AND created_at < '2024-11-01' — half-open, seam-honest, and seekable. Verify with EXPLAIN QUERY PLAN: SEARCH … USING INDEX is the win, SCAN is the tell. The Figma-flavored rule of thumb: express the business question (which renewals landed in October) as a range over the raw column, never as a computation over the wrapped one.",
      tag: "indexes",
    },
    {
      id: "figma-t21",
      q: "The adoption leaderboard reshuffles between runs — same numbers, different order. What does a reproducible ORDER BY look like, and why is LIMIT without ORDER BY worse than useless?",
      a: "A reproducible ORDER BY names every tie-breaker: ORDER BY renewals DESC, spend DESC, name — with the four-way tie at 4 renewals, the block still permutes unless a later key (and finally the unique name) pins it. Sorting on position (ORDER BY 2) or on an unmentioned engine habit is the same bug wearing syntax. LIMIT without ORDER BY is worse than useless: it takes five ARBITRARY rows and prints them under a 'top' heading — the query is not wrong-looking, it is wrong, and it can change between executions on identical data. The Figma framing: design-system adoption boards get screenshotted into QBR decks, and a board that reshuffles between runs reads as data corruption. Determinism is a deliverable, not a nicety.",
      tag: "pipeline",
    },
    {
      id: "figma-t22",
      q: "Where is COALESCE allowed in the seat-economics reports — and where does it quietly invent data?",
      a: "COALESCE belongs at the display layer: an org with no renewals shows book = 0 instead of NULL on the whitespace report — honest, because the row exists and the payload is genuinely empty. It does not belong inside metric definitions: IFNULL-ing time-to-first-edit to 0 invents 14 same-day activations for rollouts that have not started; coalescing a NULL seat price to list price silently fabricates discounts. The three-valued-logic trap rides along: WHERE status != 'cancelled' silently drops NULL-status rows (NULL != anything is UNKNOWN), so 'revoked plus everything else' needs OR status IS NULL or NOT EXISTS-shaped logic. And GROUP BY treats NULLs as one group — NULL keys cluster together, which makes IS NULL a legitimate cohort in the census. The policy sentence the interviewer wants: decide per column whether NULL means 'zero so far', 'not yet', or 'corrupt', and let the query show which.",
      tag: "nulls",
    },
    {
      id: "figma-t23",
      q: "Month-close at a design-company: walk me through the billing reconciliation ritual — the anti-join, the coverage split, the anomaly list, and the identity that must hold before anything ships.",
      a: "Four moves, same order every close. First the anti-join: invoices LEFT JOIN payments WHERE p.id IS NULL — 6 never-collected invoices worth 15,217, including #28 (1,756.00), which is marked 'paid' with zero settlement rows: payment rows are the ledger of record, statuses are claims. Second, the coverage split: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-collected — each bucket countable in one CASE pass. Third, the anomaly list walked line by line, both directions: paid-with-no-rows (#28) and void-with-a-payment (#11, 925.00) — mirror-image error modes that the anti-join catches one of and misses the other. Fourth, the identity: the ledger trial balance must read 181,080 against 181,080, delta zero — cents in INTEGER columns, dollars read as amount_cents / 100.0. The close ships when the identity holds and every anomaly has a name attached.",
      tag: "quality",
    },
    {
      id: "figma-t24",
      q: "The board reads activation 79.6% and kept 50.5% side by side. Why are both 'correct', and how do you defend each denominator in the room?",
      a: "Because they answer different questions with different denominators, and the defensibility is the whole interview. Activation = renewals with a shipped_at stamp ÷ ALL renewals booked: 82 of 103 — the denominator deliberately includes the 14 pending, because 'not yet live' is exactly what the metric watches; dropping them inflates the read to 92.1% and hides the queue the rollout team owns. Kept = delivered ÷ ALL renewals booked: 52 of 103 — live-in-multiplayer is NOT kept, it is 30 renewals at an earlier funnel stage, and calling live seats renewed inflates the term-completion story before a single contract finishes. The general habit: state the numerator's filter, the denominator's population, and why each excluded row is excluded — then the ratio-of-aggregates (SUM over SUM) versus average-of-ratios question answers itself: platform rates are pooled, regional rates are quoted beside their sizes.",
      tag: "aggregation",
    },
  ],

  mcqs: [
    {
      id: "figma-mcq-1",
      prompt: "A renewal row's status reads 'shipped'. In this kit's Figma stage map, what happened?",
      choices: ["Renewed — the term completed and counts as kept", "Live in multiplayer — seats activated, not yet at term end", "Revoked — editor seats downgraded to free viewers", "Rollout scheduled — activation pending"],
      answer: 1,
      why: "The stage map is fixed: shipped = live in multiplayer (30 of 103 renewals, 29.1%). shipped_at is the go-live stamp, not term completion.",
      notes: [
        { choice: 0, why: "Renewed is 'delivered' — 52 renewals at term end. Calling live seats renewed inflates the kept rate before a single contract finishes." },
        { choice: 3, why: "Rollout-scheduled is 'pending' — 14 renewals with no shipped_at yet. Pending is not churn and not kept; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-2",
      prompt: "Editor-seat activation rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 activated, 14 pending and 7 revoked of 103 booked.",
      choices: ["Activated + revoked only (82/89 = 92.1%)", "All renewals booked (82/103 = 79.6%)", "Delivered renewals only (52/82)", "Distinct organizations (82/16)"],
      answer: 1,
      why: "The house definition: activated ÷ ALL renewals booked — pending rollouts stay in the denominator because 'not yet live' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 pending inflates the rate to 92.1% by deleting the population still in rollout — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — delivered is term completion, shipped_at is activation. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-3",
      prompt: "APAC carries 37 renewals from 5 organizations. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts renewal rows (37); COUNT(DISTINCT customer_id) folds repeats back to organizations (5). The gap between them — 7.4 renewals per org — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 37 again, since every renewal has an org. Without DISTINCT both columns read 37 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not organizations — a third grain nobody asked for. The census is renewals AND logos." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to revoked renewals only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the revocation share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the revocation map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-5",
      prompt: "Keep only regions carrying at least 10 renewals. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE renewals >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A renewal-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU (45), APAC (37) and the US (19) and drops LATAM (2).",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'renewals' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-6",
      prompt: "The adoption ladder runs 24, 17, 14, 13, 5 renewals, then FOUR organizations tied at 4. Under RANK, what rank do the two 3-renewal orgs carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-renewal orgs share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The pending renewals double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the activated-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 renewals.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-8",
      prompt: "A month-slice staging table filters renewals to one region-status-month combination and comes back EMPTY. The above-average gate — total > (SELECT AVG(total) FROM staging) — runs next. What ships?",
      choices: ["Every staging row — the threshold degrades to 0", "No rows and no error — the scalar subquery returns NULL, total > NULL is UNKNOWN, and the report empties while looking valid", "A divide-by-zero error from the AVG fold", "The unfiltered platform average, with a warning"],
      answer: 1,
      why: "An empty inner fold makes the scalar subquery return NULL — the contract is 0-or-1 rows, and 0 rows means NULL, not zero and not an error. total > NULL is UNKNOWN, so the gate silently removes everything. On staging slices this is the most common silent-empty bug there is; the fix is stating the inner population and guarding the empty case.",
      notes: [
        { choice: 0, why: "The threshold never degrades to 0 — it degrades to NULL, which is worse: zero would at least return rows." },
        { choice: 2, why: "AVG over zero rows is NULL by design, not a crash — the danger is precisely that nothing announces it." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-9",
      prompt: "A teammate 'fixes' the billing read by writing ROUND(amount_cents / 100, 2) — integer 100, no .0. On THIS db, what changes?",
      choices: ["Every dollar truncates — the cents vanish on every printed row", "Nothing visible: all 28 stored amounts are whole-dollar multiples of 100, so the division is exact — but /100.0 stays the house rule because the first odd-cent feed will silently truncate", "SQLite raises a type error on integer division", "The column comes back NULL wherever cents are nonzero"],
      answer: 1,
      why: "Every one of the 28 stored amounts ends in 00 — 614800, 175600, 92500 — so integer division by 100 is exact and the print is identical today. The .0 is policy, not decoration: the day an odd-cent amount lands (a proration, a credit), the integer path silently floors it. The rule exists for the data you will get, not the data you have.",
      notes: [
        { choice: 0, why: "That is the bug pattern — but on this db there are no odd-cent rows to trigger it. The trap is assuming the bug is visible today; the correct answer separates current data from policy." },
        { choice: 3, why: "Integer division never yields NULL — it floors. NULL is the division-by-zero behavior, a different bug entirely." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-10",
      prompt: "A dashboard walks the seat book renewal by renewal: SUM(total) OVER (ORDER BY created_at). Two renewals share a created_at second, and the cumulative 'jumps two renewals at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at renewal grain on a multiplayer platform they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-11",
      prompt: "A renewal-expansion read joins orders to order_items and returns 251 rows for 103 renewals. On the joined rows, what does COUNT(*) measure — and what counts renewals?",
      choices: [
        "COUNT(*) counts renewals; add DISTINCT to count seat lines",
        "COUNT(*) counts seat lines (251); COUNT(DISTINCT o.id) folds back to renewals (103)",
        "COUNT(*) counts renewals (103) — the join collapses to one row per renewal",
        "Both return 251 — DISTINCT is meaningless on a primary key",
      ],
      answer: 1,
      why: "After a join fan-out, COUNT(*) counts the finest grain in the result — seat lines, 251 of them. Renewal count needs COUNT(DISTINCT o.id), which folds the fan-out back to 103. Expansion shows up in the lines first; choosing the grain IS the answer.",
      notes: [
        { choice: 0, why: "Backwards — DISTINCT on the line grain would dedupe SKUs, not fold to renewals. The fold key is the renewal id." },
        { choice: 2, why: "Joins never collapse rows — one renewal with 3 seat lines contributes 3 rows. Only a DISTINCT or a pre-aggregate restores the renewal grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-12",
      prompt: "'Top 5 seat SKUs by list price' — a teammate ships `SELECT id, name, price FROM products LIMIT 5` and the deck calls it a leaderboard. What is wrong?",
      choices: [
        "Nothing — SQLite returns rows in insertion order, which is price order",
        "LIMIT 5 without ORDER BY returns five arbitrary rows — the 'top' list can change between runs",
        "LIMIT must be written TOP 5 in SQLite",
        "The query errors — LIMIT requires a WHERE clause",
      ],
      answer: 1,
      why: "Without ORDER BY, SQL promises no order at all — the five rows are whatever the scan produced, and they can permute between executions. The leaderboard needs ORDER BY price DESC before LIMIT 5 means what its title claims.",
      notes: [
        { choice: 0, why: "Insertion order is an implementation detail, not a contract — with 16 SKUs and a rebuilt table the 'top 5' silently reshuffles." },
        { choice: 3, why: "LIMIT stands alone; the bug is semantic (no sort), not syntactic. The query runs and prints plausible-looking wrong rows." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-13",
      prompt: "Seat bands are folded with `CASE WHEN price < 200 THEN 'editor' WHEN price < 50 THEN 'starter' ELSE 'premium' END`. What lands in 'editor'?",
      choices: [
        "Only prices from 50 to 199.99 — the arms correct each other",
        "Every price under 200, including the ~32 starter SKUs — the first WHEN wins and 'starter' is unreachable",
        "Only prices over 200 — ELSE catches the rest",
        "It errors — WHEN arms must be written lowest bound first",
      ],
      answer: 1,
      why: "CASE evaluates arms top-down and stops at the first true WHEN. With < 200 first, every under-50 seat line matches 'editor' and the starter arm never fires — a reorder that silently re-bands 133 of the 251 seat lines. Cheapest bound first, or mutually exclusive ranges.",
      notes: [
        { choice: 0, why: "No correction happens — CASE is not a constraint solver. The first matching arm claims the row and the rest are never evaluated." },
        { choice: 2, why: "ELSE only catches what fell through every WHEN — but nothing falls through here, because < 200 already caught the whole starter range." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-14",
      prompt: "`julianday(shipped_at) - julianday(created_at)` runs over all 103 renewals. What does the expression return for the 14 pending rows?",
      choices: [
        "0 — pending rows are counted as same-day go-lives",
        "NULL — julianday(NULL) is NULL, and NULL poisons the subtraction",
        "-1 — the engine treats a missing stamp as day minus one",
        "The expression errors on the first pending row",
      ],
      answer: 1,
      why: "julianday(NULL) returns NULL, and NULL minus anything is NULL — pending rows carry a NULL latency, not a zero. That is exactly why AVG over the column reads 2.98 over the 82 stamped rows: the NULLs are skipped, never counted as zero days.",
      notes: [
        { choice: 0, why: "Counted as zeros the average would read near 2.37, not 2.98 — the NULL-skipping behavior is what keeps the activated-only number honest." },
        { choice: 2, why: "No sentinel values exist in SQL date math — a missing timestamp propagates as NULL through every arithmetic expression it touches." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-15",
      prompt: "The design-systems changelog folds each renewal's SKUs into one cell: `GROUP_CONCAT(p.name)` with GROUP BY oi.order_id. What does the cell hold?",
      choices: [
        "One SKU name — GROUP_CONCAT keeps only the first",
        "All SKU names comma-separated — a manifest like 'Shape Library,Icon Set,Token Sheet'",
        "A count of SKUs folded into a string",
        "NULL — GROUP_CONCAT cannot run on a joined table",
      ],
      answer: 1,
      why: "GROUP_CONCAT concatenates every value in the group with the default ',' separator — one scan, one manifest cell per renewal. The order is not guaranteed unless the aggregate carries ORDER BY (newer SQLite), so treat the cell as a set, not a sequence.",
      notes: [
        { choice: 0, why: "That is MAX or a bare column under GROUP BY — GROUP_CONCAT keeps every value in the fold." },
        { choice: 2, why: "COUNT counts, GROUP_CONCAT concatenates — folding a manifest into a number destroys the changelog's whole point." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-16",
      prompt: "A seat census returns one organization twice with identical values; a teammate wraps the SELECT in DISTINCT to 'fix it'. What actually happened?",
      choices: [
        "DISTINCT is the right fix — duplicates are normal in reporting",
        "The duplicate is a symptom — a join fan-out or double-ingested renewal; DISTINCT hides the bug and keeps the wrong grain",
        "The engine deduplicates automatically unless DISTINCT is present",
        "DISTINCT removes the organization from the result entirely",
      ],
      answer: 1,
      why: "DISTINCT silences the symptom and keeps the wrong grain. The census returning an org twice means the FROM layer fans out — a second seat line, a retried ingest — and that inflated row count feeds every SUM and COUNT downstream. Find the fan-out; never launder it.",
      notes: [
        { choice: 0, why: "A duplicated org row is never 'normal' — it is the data-quality ticket the census exists to catch." },
        { choice: 2, why: "The engine only deduplicates when told to — the real question is why the fold produced two identical rows, which DISTINCT answers for nobody." },
      ],
      difficulty: "easy",
    },
    {
      id: "figma-mcq-17",
      prompt: "'Which signed orgs never went live?' — `WHERE id NOT IN (SELECT customer_id FROM orders WHERE shipped_at IS NOT NULL)`. When does this query lie?",
      choices: [
        "When the subquery returns more than 100 rows",
        "Never — NOT IN is the standard anti-join",
        "If one customer_id in the subquery is NULL, the NOT IN returns zero rows — ever",
        "When the orgs table holds exactly one row",
      ],
      answer: 2,
      why: "x NOT IN (…, NULL) can never be TRUE: the NULL comparison is UNKNOWN, and NOT UNKNOWN is still UNKNOWN. One stray NULL in the subquery silently empties the anti-join — the whitespace report reads clean while orgs are missing. NOT EXISTS (or LEFT JOIN + IS NULL) is the NULL-proof shape.",
      notes: [
        { choice: 0, why: "Row count is a performance note, not a correctness one — the trap here is that the result can be empty and look perfectly reasonable." },
        { choice: 1, why: "NOT IN is standard until a NULL lands in the list — which is a WHEN, not an IF, on a table that ingests from pipelines." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-18",
      prompt: "The renewal pulse wants each month's book beside the PRIOR month's. A teammate writes LEAD(book) OVER (ORDER BY month). What ships?",
      choices: [
        "The same table — LAG and LEAD are aliases",
        "Each row shows the NEXT month's book — February's prev reads March; the future is wearing history's name",
        "An error — LEAD requires PARTITION BY",
        "NULLs down the entire column",
      ],
      answer: 1,
      why: "LEAD reads forward, LAG reads backward. With LEAD the first row carries a real value and the last is NULL — every month-over-month delta is computed against the wrong baseline. A LAG walk's first row is NULL by design: no prior month, no baseline, and reporting that NULL is the honest move.",
      notes: [
        { choice: 0, why: "The direction is the whole metric — swap the functions and every delta in the walk flips sign and shifts a month." },
        { choice: 2, why: "PARTITION BY is optional in both functions; the query runs fine and tells the growth story backwards." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-19",
      prompt: "A 3-month moving sum on the 14-month spine: `SUM(book) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)`. What does the FIRST row's cell hold?",
      choices: [
        "The sum of months 1 through 3",
        "Just month 1's book — the frame truncates where the partition starts",
        "NULL — the frame needs three rows before it computes",
        "The grand total of the whole spine",
      ],
      answer: 1,
      why: "ROWS frames truncate at the partition edge: row one's window is itself, row two sums two months, row three onward sums three. That is the honest rolling read — no invented zeros padding the early rows of the activation-trend chart.",
      notes: [
        { choice: 0, why: "That is what the THIRD row holds. The first row cannot see months that come after it — frames look backward, not forward." },
        { choice: 2, why: "Frames do not wait for full width — they compute on whatever rows exist. Waiting would be an invented NULL, the exact dishonesty the frame rules prevent." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-20",
      prompt: "The board packet asks: which orgs renewed in 2024-01 but NOT in 2024-02? You write `SELECT customer_id … WHERE month = '2024-01' EXCEPT SELECT … '2024-02'`. What does EXCEPT do?",
      choices: [
        "Returns first-set rows with no match in the second — and deduplicates both sides first",
        "Returns the union of both months minus their intersection, keeping duplicates",
        "Errors — EXCEPT needs identical column counts",
        "Returns only the orgs present in both months",
      ],
      answer: 0,
      why: "A EXCEPT B keeps first-set rows with no second-set match, deduplicating first — 45 renewal rows collapse to distinct orgs before the diff. INTERSECT answers the mirror question 'renewed in both'. The dedupe is why EXCEPT answers set questions, not census questions.",
      notes: [
        { choice: 1, why: "That is a description of symmetric difference, which SQL has no direct operator for — EXCEPT is one-sided by definition." },
        { choice: 3, why: "'In both' is INTERSECT. Reaching for the wrong set operator answers the board's question with its opposite." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-21",
      prompt: "A teammate keys the renewal spine with `STRFTIME('%m', created_at)` 'because we only need months'. The chart still renders. What is wrong?",
      choices: [
        "Nothing — '%m' is the standard month key",
        "January 2024 and January 2025 merge into one '01' bucket — 14 spine months collapse to 12 and the trend is fiction",
        "'%m' returns the month name, breaking the sort",
        "STRFTIME needs a third argument for the year",
      ],
      answer: 1,
      why: "The spine key must carry the year: STRFTIME('%Y-%m', …) or SUBSTR(created_at, 1, 7). This db spans 2024-01 to 2025-02, so '%m' alone folds two Januaries into one bucket and every LAG delta silently crosses a year seam.",
      notes: [
        { choice: 0, why: "It renders — that is the trap. The chart is not wrong-looking, it is wrong: 12 buckets instead of 14, and merged months." },
        { choice: 2, why: "'%m' returns the zero-padded number ('01'-'12'); '%Y-%m' is what makes buckets year-safe." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-22",
      prompt: "One pass: `COUNT(*) FILTER (WHERE status = 'delivered') AS at_term`. A reviewer demands portability. What is the twin?",
      choices: [
        "SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS at_term",
        "COUNT(status = 'delivered') AS at_term",
        "SUM(status = 'delivered') AS at_term",
        "COUNT(*) WHERE status = 'delivered' GROUP BY at_term",
      ],
      answer: 0,
      why: "SUM over a 0/1 CASE flag is the portable conditional count — same 52, same census, runs on any engine. The identity still holds either way: 52 delivered + 30 live + 14 scheduled + 7 revoked = 103 by construction.",
      notes: [
        { choice: 1, why: "COUNT of a boolean expression counts non-NULL results — every row qualifies (1 or 0), so the census reads 103 per branch." },
        { choice: 2, why: "SUM of a bare boolean works in some dialects and errors in others — the CASE wrapper is the portable spelling." },
      ],
      difficulty: "medium",
    },
    {
      id: "figma-mcq-23",
      prompt: "`SELECT name, renewals FROM (org fold) WHERE RANK() OVER (ORDER BY renewals DESC) <= 3` — the reviewer rejects it. Why, and what is the fix?",
      choices: [
        "RANK is deprecated — use ROW_NUMBER",
        "Window output is computed after WHERE — the rank does not exist at filter time; stage the window in a CTE, then filter the outer query",
        "Nothing is wrong — the query runs as written",
        "RANK cannot take an ORDER BY inside OVER",
      ],
      answer: 1,
      why: "The logical pipeline evaluates WHERE before the SELECT stage, and windows are computed with SELECT — so a rank is invisible to WHERE (and to sibling expressions). The fix is staging: a CTE or derived table carries the window, the outer query filters rn <= 3. 'Top N per group' is always a two-layer query.",
      notes: [
        { choice: 0, why: "Both functions live in the same stage — swapping them hits the identical wall." },
        { choice: 2, why: "It errors at parse time (aggregate/window in WHERE), and the error message is the pipeline-order lesson itself." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-24",
      prompt: "Above-platform-mean books, written correlated: `WHERE SUM(o.total) > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)`. What is wrong beyond the cost?",
      choices: [
        "Nothing — correlated forms are the fastest shape",
        "The inner query re-runs per outer group AND answers a different question — 'above their own org's average renewal', not above the platform per-org mean",
        "It errors — you cannot reference the outer table from a subquery",
        "It returns the platform mean because aggregates flatten everything",
      ],
      answer: 1,
      why: "A correlated subquery re-evaluates once per outer row — and here it compares each org's book to that org's OWN average renewal value, a category error that inflates the list. The decorrelated shapes: a derived table of per-org SUMs judged against AVG(book), or AVG(total) OVER (PARTITION BY customer_id) — each fold computed once.",
      notes: [
        { choice: 0, why: "Correlated forms re-run per row — on the org fold that is 16 inner queries, and the semantics are wrong before the cost even matters." },
        { choice: 3, why: "Aggregates only flatten inside the subquery — the correlation drags the outer row's key in, which is exactly what makes it per-org." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-25",
      prompt: "The seat-band fold prints no premium row (top list price 199.99), but the pricing deck needs the band VISIBLE as zero. Which construction works?",
      choices: [
        "Change the ELSE branch to print 0 — the band row will appear",
        "Seed the bands from a dimension list (VALUES or a UNION ALL seed) and LEFT JOIN the fold onto it — empty bands survive as zeros",
        "Add WHERE premium IS NOT NULL to force the row",
        "It is impossible — GROUP BY cannot show an empty group",
      ],
      answer: 1,
      why: "GROUP BY only prints groups that exist — an empty band is an absent row, and no CASE tweak conjures it. The zero-fill shapes are a LEFT JOIN from a band dimension with COALESCE to 0, or a UNION ALL seed of band names. An empty arm you can point at beats a band that silently vanishes from the revenue mix.",
      notes: [
        { choice: 0, why: "ELSE only labels rows that exist — with no premium lines there is no group to label. The row is absent at the fold, not mislabeled." },
        { choice: 2, why: "Filtering FOR the missing row guarantees it stays missing — the predicate is satisfied by zero rows by construction." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-26",
      prompt: "Pair orgs that renewed in the same month for a co-adoption study: `FROM orders a JOIN orders b ON a.month = b.month`. Which two bugs follow?",
      choices: [
        "None — the join is correct as written",
        "Every org pairs with itself, and every pair appears twice (A-B and B-A) — fix with AND a.customer_id < b.customer_id",
        "The join errors — orders cannot join to itself",
        "Only the first pair per month survives",
      ],
      answer: 1,
      why: "An unordered self-join produces self-pairs (a = b) and mirror duplicates — 45 EU renewals balloon into hundreds of rows. The pair-once idiom adds a strict inequality on the pairing key: a.customer_id < b.customer_id keeps each unordered pair exactly once. This is the shape behind co-renewal and 'designed-together' reads.",
      notes: [
        { choice: 0, why: "The month equality is necessary but not sufficient — without the inequality the census counts orgs against themselves." },
        { choice: 2, why: "Self-joins are ordinary SQL — the failure here is combinatorial, not syntactic." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-27",
      prompt: "Latency triage: `WHERE julianday(created_at) >= julianday('2024-10-01')` scans the table. What keeps an index usable?",
      choices: [
        "Wrap the other side too — julianday on both columns balances the plan",
        "Keep the column bare: created_at >= '2024-10-01' — the half-open range predicate is sargable, the function-wrapped column is not",
        "Add an index on julianday(created_at)",
        "Use BETWEEN, which is optimized differently",
      ],
      answer: 1,
      why: "A function wrapped around the indexed column turns the predicate into a per-row computation — the planner cannot seek a range. Moving the function to the constant side (or dropping it) restores the seek; pairing it with the half-open habit (>= start AND < end) makes the filter both fast and seam-honest.",
      notes: [
        { choice: 0, why: "Symmetry does not help — the planner needs a BARE indexed column to range-seek; wrapping either side in a function forces the scan." },
        { choice: 2, why: "An expression index exists but is a workaround with its own write cost — the simple fix is to stop wrapping the column." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-28",
      prompt: "Four orgs tie at 4 renewals. The adoption leaderboard's ORDER BY renewals DESC alone — why does the review call it a bug?",
      choices: [
        "It errors when more than one row ties",
        "Tied rows come back in arbitrary order — the board reshuffles between runs; name every tie-breaker (book DESC, name) so the print is reproducible",
        "Ties are auto-broken by rowid, which is deterministic",
        "ORDER BY cannot sort on an aggregate",
      ],
      answer: 1,
      why: "SQL gives no order guarantee among ties — the four-way block can permute between executions, and a screenshot-based review reads that as the data changing. A deterministic ORDER BY names every tie-breaker explicitly (renewals DESC, spend DESC, name), which is also a policy statement about peer orgs, not just syntax.",
      notes: [
        { choice: 0, why: "Ties sort fine — they just sort STABLY-UNSPECIFIED. Nothing errors; the order drifts." },
        { choice: 2, why: "Even where a rowid tiebreak happens to exist, relying on it is undocumented behavior — the query, not the engine, must own the policy." },
      ],
      difficulty: "hard",
    },
    {
      id: "figma-mcq-29",
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
      id: "figma-mcq-30",
      prompt: "The renewal board stacks per-status detail rows and a grand TOTAL row in one result. Why does the reviewer reject a plain UNION between the two branches?",
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
      id: "cs-figma-1",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The seat-band census",
      brief:
        "Figma-flavored brief on the storefront db: the pricing pod's quarterly seat-mix review wants every seat line classified by its SKU's per-seat list price into the bands the pricing page publishes — {rose:starter} under 50, {sky:editor} 50 to 200, {violet:premium} 200 and up — then folded per band to distinct SKUs, total seats and average seat price. Probed facts: the catalog carries 16 SKUs — 8 budget (under 50, avg 32.06) and 8 mid (50–200, avg 111.5) — and the premium band is empty: the top list price is 199.99. The book underneath is 251 seat lines across 103 renewals worth 34,833.28. The review reads the heaviest seat band first.",
      ask: "Return each band with its distinct SKU count, total seats and average per-seat price to 2 decimals, heaviest seat count first.",
      template:
        "SELECT CASE\n         WHEN p.price < {1} THEN 'starter'\n         WHEN p.price < {2} THEN 'editor'\n         ELSE 'premium'\n       END AS band,\n       COUNT(DISTINCT p.id) AS skus,\n       SUM({3}) AS seats,\n       ROUND(AVG(oi.unit_price), 2) AS avg_seat_price\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY band\nORDER BY seats {4};",
      slots: [
        {
          answer: "50",
          kind: "keyword",
          label: "the starter ceiling",
          why: "The pricing page draws the starter line under 50 per seat: the fold reads 8 SKUs and 268 seats. 100 re-bands three mid SKUs into starter (12 SKUs, 368 seats) and 20 guts the band to 2 SKUs — the mix story changes shape, not just scale.",
        },
        {
          answer: "200",
          kind: "keyword",
          label: "the editor ceiling",
          why: "Editor runs 50 to under 200: 8 SKUs, 230 seats, 115.85 average. 150 shoves the 199.99 SKU into premium — a band that must stay empty while the max list price is 199.99 — and 100 amputates three SKUs from the editor fold.",
        },
        {
          answer: "oi.quantity",
          kind: "keyword",
          label: "the seat counter",
          why: "Seats are the line quantity: SUM(oi.quantity) reads 268 and 230. SUM(oi.unit_price) prints a dollar total (13,669.80) where a seat count belongs, and SUM(p.price) re-prices seats at catalog list instead of line price.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-band-first direction",
          why: "The review reads the heaviest seat band on top: starter's 268 seats, then editor's 230. ASC would open the meeting on the lighter band — a correct query aimed at the wrong end of the deck.",
        },
      ],
      distractors: ["100", "20", "150", "oi.unit_price", "p.price", "ASC"],
      walkthrough:
        "One join, one CASE, one fold. The join attaches every seat line to its SKU's list price, the CASE arms partition the catalog — starter under 50, editor 50 to 200, premium 200 and up — and GROUP BY band folds 251 lines into two rows, because the premium arm returns no row at all: the top list price on this db is 199.99, and an empty premium band IS the finding. The cells reconcile to the whole book: starter reads 8 SKUs, 268 seats, 31.01 average seat price; editor reads 8 SKUs, 230 seats, 115.85 — 498 seats across the 251 lines. Note the catalog-versus-fold distinction: the catalog prices the average SKU at 32.06 and 111.5, while the fold averages actual line prices (31.01, 115.85) weighted by what orgs really ordered. The distractors each break differently: 100 re-bands the starter line to 12 SKUs and 368 seats; 20 guts it to 2 SKUs and 71 seats; 150 pushes the 199.99 SKU into a premium band that should not exist; SUM(oi.unit_price) prints a dollar total (13,669.80) where a seat count belongs; SUM(p.price) re-prices seats at catalog list instead of line price; and ASC flips the review to open on the lighter band. The read for the pricing pod: the starter band carries more seats (268) at a third of the unit economics — the mix story in two rows.",
    },
    {
      id: "cs-figma-2",
      tier: "hard",
      topic: "q2",
      universe: "month-close",
      title: "The above-the-line list",
      brief:
        "Figma-flavored brief on the storefront db: at month-close, billing walks the AR book and wants the above-the-line list — every invoice whose dollar amount clears the average PAID invoice — to prioritize collection calls before the close locks. Probed facts: 28 invoices — 21 paid worth 66,443, 6 open worth 19,609, 1 void worth 925; the coverage split reads 21 exact, 1 partial (4,000 of 6,148 settled), 6 never-collected worth 15,217; the settlement clock averages 28.4 days (13 to 84). The paid average is the line, and the memo should surface the open partial and the largest never-collected invoices on top.",
      ask: "Return each above-the-line invoice with its id, status and dollar amount to 2 decimals, biggest amount first.",
      template:
        "SELECT i.id AS invoice_id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS amount_usd\nFROM invoices i\nWHERE i.amount_cents / 100.0 {2} (SELECT AVG(amount_cents) / 100.0 FROM invoices WHERE status = {3})\nORDER BY amount_usd {4};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents divisor",
          why: "Invoices and payments carry INTEGER cents, so the dollar read is amount_cents / 100.0. The bare 100 happens to be exact on this db — all 28 amounts are whole-dollar multiples of 100 — but the .0 is the house rule: the first odd-cent feed silently floors without it.",
        },
        {
          answer: ">",
          kind: "keyword",
          label: "the above-the-line operator",
          why: "The memo lists invoices ABOVE the paid-average line — collection calls, not context. '<' returns the below-the-line complement and '=' returns zero rows, since no invoice sits exactly on a 21-invoice mean.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the baseline population",
          why: "The line is the average PAID invoice — 21 of them worth 66,443. 'void' re-baselines to the lone 925 void invoice and floods the memo with 24 rows; 'shipped' matches no invoice, the scalar returns NULL, and the list empties while looking valid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "The close reads the memo biggest amount first: 6,148 on top. ASC opens it on the smallest above-line invoice — a correct query aimed at the wrong end of the list.",
        },
      ],
      distractors: ["10.0", "1000.0", "'void'", "'shipped'", "<", "ASC"],
      walkthrough:
        "Two stages: compute the line, then walk the book. The inner fold averages the 21 paid invoices — 66,443 across them, so the line sits near 3,164 — and the outer scan keeps every invoice whose dollar read clears it, printing 12 rows, biggest first. The list is exactly what the close needs: it tops out at 6,148 — the open partial (4,000 of 6,148 settled) — and catches 4,937 and 3,562 from the 6 never-collected invoices worth 15,217, while the paid-but-unsettled #28 (1,756.00) and the void-but-paid #11 (925.00) both sit below the line, where the anti-join — not this read — is the tool that finds them. The distractors each break differently: 10.0 inflates every dollar tenfold (61,480 on top); 1000.0 shrinks them tenfold (61.48); 'void' re-baselines to the single 925 void invoice and floods the memo with 24 rows; 'shipped' matches no invoice at all, the scalar returns NULL, and the list empties while looking valid; '<' returns the below-the-line complement; '=' returns zero rows; ASC opens the memo on the smallest invoice. The cents rule holds throughout: the divisor is 100.0 with the .0 — policy, because the first odd-cent feed will not announce itself.",
    },
    {
      id: "cs-figma-3",
      tier: "medium",
      topic: "x2",
      universe: "funnel",
      title: "The Monday activation census",
      brief:
        "Figma-flavored brief on the storefront db: the Monday multiplayer health check is one query over the renewal fleet, folded per region — renewals booked, renewed-to-term, live-in-multiplayer, and the dollar value churned away — every branch reconciling to 103 by construction. Probed facts: 103 renewals — EU 45 (24 at term, 12 live, 3 revoked worth 494.82), APAC 37 (21 at term, 8 live, 3 revoked worth 513.81), US 19 (5 at term, 10 live, 1 revoked worth 143.86), LATAM 2 (both at term, nothing live, nothing revoked). The review reads the biggest renewal base first and keeps every region — the floor sits low on purpose, because a quiet region vanishing from the census is exactly the incident this query exists to catch.",
      ask: "Return each region with its renewal count, renewed-to-term count, live-in-multiplayer count and churned dollar value to 2 decimals, biggest renewal base first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS renewals,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS at_term,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS live,\n       ROUND({2}(o.total) FILTER (WHERE o.status = 'cancelled'), 2) AS churned_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY renewals DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the renewed-to-term literal",
          why: "Renewed-to-term is status 'delivered' — 24 EU, 21 APAC, 5 US, 2 LATAM (52 platform-wide). 'shipped' would copy the live column underneath it (30 running renewals, not kept ones) and the review would book activations as term completions before a single contract finished.",
        },
        {
          answer: "SUM",
          kind: "keyword",
          label: "the churned-value folder",
          why: "SUM(o.total) folds the revoked renewals into dollars — 494.82 / 513.81 / 143.86 / 0. COUNT would print a row count (3, 3, 1, 0) wearing a money name and the winback budget would be sized in invoices instead of dollars.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the keep-everyone floor",
          why: "HAVING COUNT(*) >= 2 keeps all four regions — LATAM's 2 renewals included, because a region dropping out of the census IS the finding. 20 would cut the US and LATAM rows and the review would open on a fleet that looks two regions larger than it is.",
        },
      ],
      distractors: ["'shipped'", "COUNT", "20"],
      walkthrough:
        "One scan, four arms, one identity. The join attaches every renewal to its org's region, GROUP BY region folds 103 rows into four, and each FILTER branch counts inside the same pass: at_term reads 24 / 21 / 5 / 2 (the 52 delivered), live reads 12 / 8 / 10 / 0 (the 30 shipped), and the money arm SUMs churned renewals to 494.82 / 513.81 / 143.86 / 0. COUNT(*) is the audit anchor — 45 / 37 / 19 / 2, summing to 103 by construction, which is the identity the Monday check exists to enforce. The distractors each break differently: 'shipped' in the term slot makes at_term a copy of the live column and quietly deletes the 52-renewal kept story; COUNT in the money slot prints invoice counts (3, 3, 1, 0) where the winback dollars belong; 20 in the floor slot deletes the US and LATAM rows, and a fleet census that sheds regions between runs is precisely the drift the one-pass construction was chosen to prevent. The read the review wants: the US runs the youngest fleet (5 of 19 at term but 10 live) while LATAM renewed everything it ever booked — and owns zero multiplayer hours.",
    },
    {
      id: "cs-figma-4",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The adoption tie ladder",
      brief:
        "Figma-flavored brief on the storefront db: the quarterly design-systems review publishes the adoption leaderboard — organizations ranked by renewal count, ties sharing a rung with NO gaps, because peer orgs must not be split by arithmetic. Probed facts: the renewal ladder runs 24, 17, 14, 13, 5, then a four-way tie at 4 (Pedro Alvarez, Noah Meyer, Keiko Sato, Isabella Rossi), then two orgs at 3. The published policy is DENSE_RANK — the tie block reads 6, 6, 6, 6 and the next distinct count lands on 7, no phantom rungs. The board keeps orgs at three-plus renewals so the tie policy is visible in the output, and the biggest book breaks remaining order.",
      ask: "Return each organization with three or more renewals: name, renewal count, lifetime book to 2 decimals, and a no-gap tie ladder rank, busiest first.",
      template:
        "SELECT c.name AS org,\n       COUNT(*) AS renewals,\n       ROUND(SUM(o.total), 2) AS book,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS tie_ladder\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {3}\nORDER BY tie_ladder, book DESC;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tie function",
          why: "DENSE_RANK packs the four-way tie at 4 into rung 6 (6, 6, 6, 6) and hands the two 3-renewal orgs rung 7 — no invented gaps. RANK would stamp them 10, implying four phantom leaderboard positions that no org occupies.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "The ladder ranks the most-adopted org 1: 24, 17, 14, 13, 5, 4, 4, 4, 4, 3, 3. ASC would crown the 3-renewal orgs rank 1 and bury the adoption leaders at the bottom — a correct query aimed at the wrong end of the board.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the visibility floor",
          why: "HAVING COUNT(*) >= 3 keeps 11 orgs — through the tie block AND the 3-tie, so the no-gap policy shows its work (rungs 6 and 7 both doubled). 5 would amputate the tie block entirely and the review could not see what policy it published.",
        },
      ],
      distractors: ["RANK", "ROW_NUMBER", "ASC", "5"],
      walkthrough:
        "A fold, a threshold, a policy. GROUP BY c.id folds 103 renewals into 16 orgs, SUM(o.total) is the book beside the count, and HAVING COUNT(*) >= 3 keeps 11 rows — 24, 17, 14, 13, 5, then the four-way tie at 4, then two orgs at 3. The window ranks the aggregated counts: DENSE_RANK shares rungs without gaps — 1, 2, 3, 4, 5, then 6, 6, 6, 6, then 7, 7 — and ORDER BY tie_ladder, book DESC keeps the tied block ordered by money (Pedro 1,686.17, Keiko 1,098.60, Isabella 985.65, Noah 737.68) without pretending the tie was broken. The distractors each break differently: RANK prints 10, 10 where DENSE_RANK prints 7, 7 — four phantom rungs implying a fifth placed org that does not exist; ROW_NUMBER numbers the tied orgs 6 through 9 as if renewal counts could break a tie; ASC crowns the quiet orgs; 5 cuts the output exactly above the tie block and the published policy becomes invisible in its own report. The board publishes this query verbatim — the tie policy ships as SQL, not as a footnote.",
    },
    {
      id: "cs-figma-5",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-collected stack",
      brief:
        "Month-close brief, in-world: before billing sends a single reminder, the AR anti-join refreshes — every invoice with NO settlement rows at all. Probed on the storefront db: 28 invoices, 22 of them carrying at least one payment row, 6 arriving with none — worth 15,217 total: INV-2025-024 (4,937.00, open), INV-2025-026 (3,562.00, open), INV-2025-027 (2,794.00, open), INV-2025-028 (1,756.00, PAID — the status that lies), INV-2024-021 (1,295.00, open), INV-2024-018 (873.00, open). The dunning draft opens with the biggest balances first and stops at three.",
      ask: "Return the three never-collected invoices with the biggest balances: number, status, and dollar amount to 2 decimals.",
      template:
        "SELECT i.number,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS amount_usd\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {2}\nORDER BY amount_usd {3}\nLIMIT {4};",
      slots: [
        {
          answer: "100.0",
          kind: "keyword",
          label: "the cents divisor",
          why: "Invoices carry INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 is the house rule. On this db every stored amount happens to be a whole-dollar multiple of 100, so the bare 100 prints identically today; the first odd-cent feed floors silently without it.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join marker",
          why: "IS NULL on the joined payment key keeps exactly the invoices no settlement ever touched — 6 of 28. NOT NULL flips the report to the 22 collected invoices and the dunning draft would chase customers who already paid.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-balance-first direction",
          why: "The draft opens on 4,937.00, then 3,562.00, then 2,794.00 — the balances worth a phone call. ASC would open on 873.00 and the three biggest exposures would sit unsent at the bottom of the queue.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the dunning cut",
          noVerify: true,
          why: "LIMIT 3 takes the top of the sorted stack — the three calls billing makes today. The cut only means anything downstream of the ORDER BY: an unsorted LIMIT 3 is three arbitrary invoices wearing a priority label.",
        },
      ],
      distractors: ["10.0", "1000.0", "NOT NULL", "ASC", "1", "6"],
      walkthrough:
        "An anti-join with a cut. The LEFT JOIN keeps all 28 invoices and hands the 22 with payment rows a match; the 6 with no settlement rows carry a NULL payload, and WHERE p.id IS NULL is the filter that keeps exactly them — 15,217 of exposure, INV-2025-028 among them with its lying 'paid' status, which is precisely why the payment tables and not the status column drive this list. The cents rule divides by 100.0, ORDER BY amount_usd DESC floats the big balances, and LIMIT 3 cuts the dunning draft to today's calls: 4,937.00, 3,562.00, 2,794.00. The distractors each break differently: 10.0 inflates every balance tenfold (49,370.00 on top); 1000.0 shrinks them tenfold (4.94); NOT NULL serves the 22 collected invoices — dunning customers who already settled; ASC opens on the smallest balance and buries the exposure; LIMIT 1 sends one email; LIMIT 6 sends the whole stack when the memo said three. One join type, one NULL test, one sort, one cut — and the close's first email is defensible line by line.",
    },
    {
      id: "cs-figma-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The renewal book pulse",
      brief:
        "Growth-board brief, in-world: the review opens with the monthly renewal pulse — each month's book beside the prior month's, and the percentage change — so the trough and the rebound are quotable from the table. Probed on the storefront db: 14 spine months, 2024-01 through 2025-02, 103 renewals worth 34,833.28. The walk opens at 3,731.97, drifts down to the July trough of 1,193.86 (8 renewals, the -41.7% June-to-July fade), then rebounds to 2,352.07 in August — +1,158.21, a +97.0% jump on the trough. LAG carries the prior month; the first row's change is honestly NULL — no baseline exists.",
      ask: "Return the first eight spine months with month, renewal book, the prior month's book, and the month-over-month percentage change to 1 decimal.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS book\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       book,\n       {1}(book) OVER (ORDER BY month) AS prev_book,\n       ROUND(100.0 * (book - LAG(book) OVER (ORDER BY month))\n             / LAG(book) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(book) walks the window backwards one row — February's prev_book is January's 3,731.97. LEAD would read forward and hand February March's 2,617.08, re-labeling the future as history; the first row's NULL is the honest 'no baseline', never a coalesced zero.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A pulse is chronological: ASC keeps 2024-01 on top so each row compares against the row above it, ending the first eight months on the August rebound. DESC presents the newest month first with its baseline below — the numbers survive, the trough-and-rebound story does not.",
        },
        {
          answer: "8",
          kind: "number",
          label: "the trough-and-rebound cut",
          noVerify: true,
          why: "LIMIT 8 lands exactly on 2024-08 — the walk ends on the rebound the narrative quotes: the July trough 1,193.86 and the +97.0% August jump. A cut of 4 amputates both; 14 dilutes the opener with six months the deck does not need yet.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "4"],
      walkthrough:
        "Staged grain, then windows. The CTE folds 103 renewals into 14 monthly buckets on the year-safe SUBSTR key — '%m' alone would merge the two Januaries — and ROUND pins the book to cents. The outer SELECT reads each month beside its neighbor: LAG(book) OVER (ORDER BY month) brings the prior month up, and the percentage divides the delta by that same LAG — the walk prints 3,731.97 → 3,609.64 (-3.3) → 2,617.08 (-27.5) → 2,468.91 (-5.7) → 2,910.31 (+17.9) → 2,047.43 (-29.6) → 1,193.86 (-41.7, the trough) → 2,352.07 (+97.0, the rebound). The first row's mom_pct is NULL by design: no prior month, no baseline, no invented zero. The two-layer shape matters — window output is invisible to WHERE and to sibling expressions, so the CTE stages the grain and the outer SELECT layers the windows. The distractors each break differently: LEAD reads the future (February's prev becomes March's book); SUM piles a running total into prev_book; DESC tells the story backwards and LIMIT 8 then serves the LAST eight months; 4 cuts the walk before the trough and the deck quotes a fade that was about to reverse. Every chip changes what the review concludes.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Share of orgs that hit the first-edit milestone (the multiplayer 'aha') out of all signed — a distinct-count share with the denominator stated. This is the weekly pulse of the viewer-to-editor funnel." },
    { slug: "unique-orders-and-customers-per-month", why: "The monthly two-grain census — renewals booked AND orgs active per month — is the chart growth ops opens every review with; this problem is that chart at practice scale." },
    { slug: "employee-bonus", why: "The DevMode handoff read: LEFT JOIN keeps orgs whose renewal lines carry no add-on — the NULL-payload rows ARE the finding. Choosing the join type is the business statement." },
    { slug: "department-top-three-salaries", why: "The regional adoption podium: top three orgs by renewal count per region. Window ranking over a grouped fold, exactly the shape of the quarterly design-system review." },
    { slug: "calculate-special-bonus", why: "Loyalty pricing runs as a CASE gate — orgs that qualify keep their discount, everyone else reads NULL. One missing ELSE and the pricing file lies silently." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-product adoption: orgs on Figma Design seats but never on FigJam. The cross-sell list is a conditional segmentation query, not a vibe." },
    { slug: "group-sold-products-by-the-date", why: "Component publishing is a daily fold: which variants shipped per release day, folded into one cell. GROUP_CONCAT is how the library changelog gets written." },
    { slug: "number-of-rich-customers", why: "Orgs whose seat book crosses a spend line — a distinct count over a filtered fold with the threshold published. The concentration read in miniature." },
    { slug: "second-day-confirmation", why: "Multiplayer collaboration telemetry: did the org edit on consecutive days? Streak logic over daily activity is how adoption health is actually measured here." },
    { slug: "biggest-window-between-events", why: "Dormancy detection: the largest gap between editor sessions flags the churn-risk cohort before the renewal date arrives. Window math over event timestamps." },
    { slug: "keep-latest-dedupe", why: "DevMode publishes the latest component version per node key — ROW_NUMBER dedupe over update time is exactly the 'keep latest' shape the spec feed needs." },
    { slug: "dau-wau-stickiness", why: "Design-system adoption is judged on stickiness: weekly actives over daily editors. A ratio of aggregates with the window spelled out — the DAU/WAU shape." },
    { slug: "net-revenue-retention", why: "Seat expansion and contraction roll up to NRR — the metric Figma's board actually manages. Cohort revenue walks with LAG are exactly this problem's shape." },
    { slug: "growth-accounting", why: "Org analytics classifies every renewal movement — new, expansion, contraction, churn — with LAG over the renewal spine. The same accounting identity Figma's growth pod publishes monthly." },
    { slug: "null-blank-audit", why: "Before any handoff or close: the NULL/blank audit over seat lines and org names. 'acme org' versus 'Acme Org' splits one logo into two and corrupts every downstream census." },
    { slug: "average-selling-price", why: "Realized per-seat price against list — a join-and-ratio fold that surfaces the discount leakage the pricing pod chases every quarter." },
    { slug: "find-loyal-customers", why: "Loyal orgs are the ones that keep renewing seat after seat — consecutive-qualification logic over the renewal log, the retention cohort the winback calendar is built around." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Argmax at org grain: which logo books the most renewals. On this db that is the 24-renewal anchor account — the single row the enterprise pod circles first." },
    { slug: "find-customers-with-positive-revenue-this-year", why: "The expansion shortlist: orgs whose renewals generated value in the current window — a filtered fold with the period bounds stated, exactly how the whitespace report is cut." },
    { slug: "monthly-transactions-i", why: "Billing months in INTEGER cents with a category filter — the same cents discipline (divide by 100.0, fold by month) the close runs against invoices and payments." },
    { slug: "number-of-comments-per-post", why: "Comments are the multiplayer heartbeat: count per file with zeros kept visible — files with no comments are the silent-collaboration finding, not missing rows." },
    { slug: "consecutive-available-seats", why: "Editor-seat capacity as runs: consecutive availability windows are gaps-and-islands over seat state — the provisioning read when a rollout needs N contiguous seats." },
    { slug: "game-play-analysis-v", why: "Day-1 return logic: first event, then did they come back — the shape behind 'org signed, then edited again within a week', the activation metric Figma actually watches." },
    { slug: "find-the-team-size", why: "COUNT() OVER (PARTITION BY …) enrichment: attach seat count to every renewal line without collapsing rows — per-org context on every row, the two-grain census made a column." },
    { slug: "sales-analysis-iii", why: "Period-bounded exclusive sets: SKUs renewed in one quarter and never after — the half-open-interval + set-difference shape the quarterly mix review runs." },
    { slug: "product-price-at-a-given-date", why: "As-of seat pricing: the per-seat price in force on the renewal date, not today's — list changes must not rewrite history, and this problem drills exactly that instinct." },
    { slug: "rolling-7d-actives", why: "Rolling active windows over multiplayer sessions — the honest version of a 'weekly active' chart when activity is bursty and the frame must move with the data." },
    { slug: "second-most-recent-activity", why: "Latest-touch reads per org: the second-most-recent comment or edit flags accounts going quiet before the renewal date — keep-newest with a twist." },
    { slug: "cohort-repeat-revenue", why: "Revenue by cohort and repeat behavior — the staging-fold shape behind NRR: first renewals versus expansion dollars, folded twice, reconciled once." },
    { slug: "median-time-to-convert", why: "Time-to-convert needs a median, not a mean — activation latency is skewed, and the median is the number the rollout team quotes when one org waits twice as long as the rest." },
    { slug: "customers-who-bought-all-products", why: "Full-suite adoption: orgs on every product line — Design AND FigJam AND DevMode. The all-products AND is the cross-sell-complete list, built as layered set logic." },
    { slug: "count-salary-categories", why: "Band censuses with zero-buckets printed honestly — the premium-band-returns-no-row lesson generalized: an empty band must read 0, not vanish from the mix." },
  ],
};
