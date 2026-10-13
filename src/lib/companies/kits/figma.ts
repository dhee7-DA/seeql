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
    "Preparation strategy: the pools file carries **no Figma section** — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: viewer-to-editor funnels, two-grain org censuses, seat-band CASE folds, tie-heavy adoption leaderboards and the cents-safe billing spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {pink:seat-band census} the pricing pod reads every quarter, the other rebuilds the {violet:above-the-line AR list} billing walks at every close. The bar to clear: *state the definition and the denominator before you compute anything* — and make every band fold account for all 251 seat lines by construction.",
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
      slugs: ["funnel-step-conversion", "trial-to-paid-funnel", "email-engagement-funnel"],
    },
    {
      name: "Two-grain org censuses",
      why: "Renewals and organizations are different grains of the same join, and every census here reports both: EU runs 45 renewals from 8 orgs while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded. The 5.6-versus-9.5 intensity gap is the sentence that gets quoted in the review.",
      slugs: ["daily-leads-and-partners", "find-followers-count", "students-and-examinations"],
    },
    {
      name: "Joining orgs to renewals",
      why: "Orgs carry region and created_at; renewals inherit them through joins, and the join type decides who survives. A renewal without an org is corruption; an org without renewals is whitespace — though on this db the anti-join returns a confident zero, and proving it is part of the job. DevMode handoff reads push the same join one hop further into seat lines, where fan-out quietly changes the grain.",
      slugs: ["combine-two-tables", "sales-person", "top-travellers"],
    },
    {
      name: "Adoption leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four orgs sit at 4 renewals each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer orgs, not syntax. Design-system adoption boards get published from these queries, so the tie policy ships with the query comment.",
      slugs: ["rank-scores", "compute-the-rank-as-a-percentage", "group-employees-of-the-same-salary"],
    },
    {
      name: "Seat bands with CASE",
      why: "The pricing page publishes per-seat list bands and every seat line must land in exactly one — starter, editor, premium — with the arms exhaustive and ordered. A hole in the CASE is a hole in the revenue mix, and a reordered WHEN quietly re-bands the base. On this db the premium arm stays honestly empty — max list price 199.99 — and an empty arm you can explain beats a band that invents revenue.",
      slugs: ["the-category-of-each-member-in-the-store", "type-of-triangle", "loan-types"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month renewal spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero. The same walk powers the ARR bridge finance reads at every close.",
      slugs: ["consecutive-numbers", "year-on-year-growth-rate", "mrr-waterfall"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — activated under revoked, this quarter beside last — and EXCEPT answers 'which signed orgs never activated'. UNION dedups whole rows silently, which makes it a correctness question, not a style one. On this db the never-renewed anti-join is a confident zero, and stating that with proof is the credibility move.",
      slugs: ["monthly-transactions-ii", "league-statistics", "customers-who-never-order"],
    },
    {
      name: "Above-average gates",
      why: "Screens escalate into staging: fold per-org renewal books, then judge them against a computed platform mean — the gate that catches the same five orgs as the 2,000 concentration line. Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted. The month-close AR list is the same shape: every invoice above the paid-average line.",
      slugs: ["find-expensive-cities", "second-highest-salary", "game-play-analysis-iv"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets renewed, live, scheduled and revoked in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. The census identity is the fastest data-quality check in the kit: a branch that misses 103 is an incident.",
      slugs: ["reformat-department-table", "sales-by-day-of-the-week", "odd-and-even-transactions"],
    },
    {
      name: "Billing & cents discipline",
      why: "Renewed is not collected — the finance tables (28 invoices, 27 payments, INTEGER cents) are where the seat world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. Settlement aging (28.4 days average, 13 to 84) is the lens that turns the split into a collection calendar.",
      slugs: ["ar-aging-schedule", "trial-balance-check", "duplicate-charge-pairs"],
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
  ],
};
