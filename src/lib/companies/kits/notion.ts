// Notion — kit 10 of the SaaS & Enterprise domain (wave-6, task 92-c-saas).
// PLG workspace SQL: the storefront db read as a product-led-growth sandbox —
// customers are workspaces, orders are usage periods (delivered = activated,
// shipped = onboarded, activation pending, pending = evaluating on trial,
// cancelled = churned/deleted), shipped_at = the activation stamp,
// order_items = editor-event lines, products = workspace templates,
// regions = team cohorts. Invoices/payments are seat bills in INTEGER
// cents (/100.0). Angle: workspace activation, seat expansion, template
// funnels. Pool provenance: Notion carries exactly 2 cross-tagged sql rows
// in company-pools.md — feature-adoption-windows (tagged Slack, Notion) and
// plan-migration-paths (tagged Atlassian, Notion) — both used FIRST in
// topics and problems; the remaining slots are theme-curated and say so.
// Case briefs quote probed figures from scripts/company-facts.md (probed
// 2026-10-12); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.
//
// Expansion (task 94-notion, 3x append-only): brief 4→6, dayInLife +1 late
// beat, metrics 8→12, topics 10→15, theory t9–t24, mcqs 11–30, cases
// cs-notion-3..6 (topics j7/s6/t7/j5 — pairwise distinct, distinct from the
// original t5/q5), problems 16→32. New problem/topic slugs are theme-curated
// SQL rows from company-pools.md (Notion's tagged pool remains the same 2
// rows, both already used first); case number cells were re-verified against
// db/custom.db by a one-shot read-only probe run of every slot and every
// distractor×slot substitution.

import type { CompanyKit } from "../types";

export const notionKit: CompanyKit = {
  id: "notion",
  domainId: "saas",
  name: "Notion",
  tagline: "Connected workspace: docs, teams, usage",
  accent: "text-zinc-200",

  brief: [
    "**Notion** is the connected workspace — docs, wikis, projects and databases in one product that grows bottom-up: a single user starts a workspace, a team adopts it, seats expand. The analytics reality is the *activation ledger*: which workspaces crossed from signup to sustained use, and which are silently going dark. On this storefront db the mapping is honest: 16 workspaces generate 103 usage periods folded from 251 editor-event lines, and the status mix reads like the PLG funnel it is — 52 {emerald:activated} (50.5%), 30 onboarded-activation-pending (29.1%), 14 {amber:evaluating on trial} (13.6%), 7 {rose:churned} (6.8%).",
    "The data org splits three ways. Product analytics owns the activation folds: editor-event lines joined to the template catalog and aggregated per period — the top template family logs **97 uses** worth 11,744.01 of usage value, the broadest family touches 54 distinct periods. Growth owns expansion: the depth ladder runs 24, 17, 14, 13, 5 periods deep before a quartet of workspaces ties at 4, and **63.5%** of usage value sits above the 3,000 line — the expansion cohort every board deck prices. Billing owns the seat book: 28 `invoices` against 27 `payments`, INTEGER cents throughout, with 6 never-settled bills worth 15,217 — one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it.",
    "Interview style is activation-then-denominator, then the expansion join. A screen opens with a two-grain census (EU carries 45 usage periods from just 8 workspaces; the US, 19 from 2), escalates into a conditional-count activation rate with the denominator asked out loud ('do {rose:churned} workspaces sit in your base?'), then the leaderboard — where RANK's shared rungs decide whether four tied workspaces get one rank or four. Follow-ups probe the month spine (2024-01 opens at 8 periods and **3,731.97** of usage value; 2024-07 floors at 1,193.86) and the cents rule on every seat bill.",
    "Preparation strategy: the pools carry exactly **2 cross-tagged rows for Notion** (feature-adoption-windows, plan-migration-paths) — both lead this kit's topics and problem list, and the rest is theme-curated to known PLG screens: activation censuses, expansion ladders, template funnels, dormancy anti-joins and seat-billing reconciliation. Then run both case studies on the live db: one rebuilds the activation leaderboard growth reviews on Mondays, the other rebuilds the modal-month usage spine the calendar view is drawn from. The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
    "The monetization ledger is where the org's three hands meet, and its economics are unusually clean. Seat bills are issued on uniform {sky:30-day terms} — the issue-to-due window reads 30, min 30, max 30 — and settled bills actually clear in **28.4 days** on average (fastest 13, slowest 84), so cash lands almost exactly on terms. The settlement mix is the economics: 21 bills settle {emerald:exact} worth 65,612, one settles partial (4,000 against a 6,148 bill), 6 carry no settlement rows at all (15,217) — and the rails split between `card` (16 payments, 37,364) and `wire` (11 payments, 32,248), which is why the billing join keys on invoice id and aggregates the many-side before any money math.",
    "Preparation roadmap for the expanded kit, in four passes: *census first* — two-grain counts per cohort (EU 45 periods from 8 workspaces) until the fold is reflex; *rate second* — conditional counting with the denominator named (52 of 103, never 52 of 89); *windows third* — RANK ties at 4 periods and LAG walks anchored on 2024-01's 3,731.97; *money last* — cents discipline, coverage classes, the dunning anti-join. Then sit all six case studies: the activation leaderboard, the modal-month spine, the cohort value census, the settlement classifier, the month-over-month walk and the dunning list. The bar is unchanged — **denominator**, survival rule, `cents rule` — say all three before you compute anything.",
  ],

  dayInLife: [
    "**08:30 —** The morning starts on activation health. A product analyst opens the funnel dashboard before the growth standup: did last night's onboarded cohort cross the activation threshold, does the {emerald:activated} count (52 of 103) reconcile with what seat billing invoiced, and did any team cohort's churn share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — activation counts versus the seat-billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is expansion surgery. The growth review wants the depth ladder refreshed — usage periods grouped per workspace, ranked busiest-first with the tie policy in the comment: 24, 17, 14, 13, then the quartet sharing rank 6 at 4 periods each. An account lead wants the two-grain census re-cut (EU: 45 periods from 8 workspaces — intensity 5.6); a template owner wants uses and usage value side by side, because 'the gallery is popular' means nothing until uses price into value. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:00 —** The afternoon tilts toward the template gallery and stakeholder cycles. The gallery review walks the template table with SQL attached to every bar — which families log the most uses, which carry the most usage value, where the mid-price band (8 templates averaging 111.5) sits against the budget band (8 at 32.06); the billing desk walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the invoice base?* This is the hour usage numbers meet the people who convert them into seats.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The dormancy query ships with its survival rule in the comment (workspaces whose join finds no recent period ARE the churn-risk list); the anomaly log carries both mirror modes — the seat bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the void bill with one (#11, 925.00); and tomorrow's follow-ups are queued per workspace. The rhythm to internalize: Notion SQL exists to prove that activation and billing agree — *the usage period and the seat invoice are the same story told at two grains.*",
    "**19:45 —** The late beat, run from home before the ledger locks, is the reconciliation walk. The trial balance must read flat — **181,080** debits against **181,080** credits, delta {emerald:0} — and the account roll-forward gets eyeballed in the same breath: cash 44,196, accounts receivable 16,440, sales revenue -86,052, operating expenses 25,416. Then one cross-check: the seat-bill classes (21 exact, 1 partial, 6 none) against the AR anti-join (6 bills, 15,217) — any drift means tomorrow starts with an incident, not a standup. *The query that proves the books balance is the last query of the day, and it has to be boring.*",
  ],

  metrics: [
    { name: "Workspace activation rate", what: "Activated ÷ ALL usage periods: 52 of 103 (50.5%). The denominator is the interview — 52 of 89 engaged (58.4%) is a different metric with a different name." },
    { name: "Active workspaces (two grains)", what: "Periods AND workspaces per cohort — 103 periods from 16 workspaces; EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Load versus audience in one query." },
    { name: "Usage-depth ladder", what: "Periods per workspace: 24, 17, 14, 13, 5, then four workspaces tied at 4. Expansion is visible as depth — the ladder is the expansion pipeline in numbers." },
    { name: "Expansion concentration", what: "Share of usage value from the deepest workspaces: 63.5% sits above the 3,000 line, 71.2% above 2,000. Where seat-expansion revenue actually lives." },
    { name: "Template reach & value", what: "Editor-event lines joined to the catalog: the top family logs 97 uses worth 11,744.01; the broadest family touches 54 distinct periods. Gallery decisions price on this fold." },
    { name: "Usage calendar", what: "Monthly spine over usage periods: 2024-01 opens at 8 periods and 3,731.97 of usage value; 2024-07 floors at 1,193.86. The seasonality read every launch plan borrows." },
    { name: "Unsettled seat AR", what: "Seat bills with no payment rows: 6 worth 15,217 — and one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the dunning cycle runs on." },
    { name: "Seat settlement speed", what: "Days from issue to first payment on settled bills: 20 settle in 28.4 days on average, fastest 13, slowest 84 — against uniform 30-day terms." },
    { name: "Payment rails mix", what: "Seat settlements by method: card 16 payments worth 37,364 against wire 11 worth 32,248. Rail skew matters when dunning is timed to settlement speed." },
    { name: "Ledger trial balance", what: "Global debits vs credits: 181,080 = 181,080, delta 0 — with cash 44,196 and accounts receivable 16,440. The flat-line proof every close walks." },
    { name: "Settlement coverage classes", what: "Per-bill classification from the payment rows: 21 exact (65,612), 1 partial (4,000 of 6,148), 6 none (15,217). The classes must sum back to the 28-bill base or the fold leaks." },
    { name: "Terms vs settlement reality", what: "Issue-to-due is a uniform 30 days on every bill; settled bills actually pay in 28.4 days on average (13 fastest, 84 slowest). The gap is the dunning lever." },
  ],

  topics: [
    {
      name: "Workspace activation censuses",
      why: "Every Notion screen opens with a fold: usage periods, workspaces, editor events — grouped and counted without letting the grain blur. COUNT(*) counts periods, COUNT(DISTINCT customer_id) counts workspaces; 103 periods come from just 16 workspaces, and the census is where candidates prove which grain they're standing on.",
      slugs: ["unique-orders-and-customers-per-month", "find-followers-count", "article-views-ii"],
    },
    {
      name: "Activation-rate conditional counting",
      why: "Activated, onboarded, evaluating, churned — every rate here is a conditional count over a funnel state, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL periods is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-ii", "percentage-of-users-attended-a-contest", "ads-performance"],
    },
    {
      name: "Joining workspaces to usage",
      why: "Usage inherits workspace attributes through joins to the workspaces table, and the join type decides who survives: a period with no workspace is corruption; a workspace with no period is a dormancy signal. Choosing INNER versus LEFT is a business statement.",
      slugs: ["combine-two-tables", "top-travellers", "employees-with-missing-information"],
    },
    {
      name: "Template funnels & per-template value",
      why: "Editor events carry templates, and the gallery story is a join-then-weigh fold: uses × unit_price per line, the top template family logging 97 uses worth 11,744.01. The per-template census is what gets a template featured or retired.",
      slugs: ["product-sales-analysis-iii", "most-frequently-ordered-product-per-customer", "sales-by-day-of-the-week"],
    },
    {
      name: "The usage calendar",
      why: "Usage is calendar arithmetic: STRFTIME('%Y-%m') buckets over periods against the 3,731.97 peak and the 1,193.86 floor. Notion drills the month-bucket idiom because every seasonality chart hangs on that spine — and a '%m'-without-year fold merges two Januaries into one lie.",
      slugs: ["monthly-transactions-i", "the-latest-login-in-2020", "new-users-daily-count"],
    },
    {
      name: "Seat-expansion two-grain reads",
      why: "PLG growth is a seat story: periods per workspace (depth) against workspaces per cohort (spread). The two-grain shapes here — team sizes, active-workspace counts, depth-versus-breadth ratios — are how expansion gets measured without double-counting.",
      slugs: ["students-and-examinations", "find-the-team-size", "active-users"],
    },
    {
      name: "Dormancy & churn anti-joins",
      why: "Silence reads are anti-joins: workspaces with no recent period, seat bills with no payments (6 on this db). On this db the no-usage workspace anti-join returns 0 — and proving a confident zero is the job. The survival rule of the join IS the query.",
      slugs: ["number-of-accounts-that-did-not-stream", "customer-who-visited-but-did-not-transact", "dormant-reactivation"],
    },
    {
      name: "Growth leaderboards & tie policy",
      why: "Expansion boards rank workspaces by depth, and ties are real: four workspaces sit at exactly 4 periods. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "second-most-recent-activity", "find-active-users"],
    },
    {
      name: "Adoption windows & LAG transitions",
      why: "The two tagged Notion rows live here: adoption windows measure the gap between signup and sustained use, and plan-migration paths are LAG transitions across a workspace's state history. Both are window-function work — ordered, partitioned, NULL-aware.",
      slugs: ["feature-adoption-windows", "plan-migration-paths", "biggest-window-between-events"],
    },
    {
      name: "Seat billing & cents discipline",
      why: "Usage is not revenue until the seat book closes: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where PLG interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "keep-latest-dedupe"],
    },
    {
      name: "CASE-driven funnel pivots",
      why: "The weekly funnel review reads all four states side by side in one pass — activated, onboarded, evaluating, churned as columns, not four queries. SUM(CASE WHEN status …) is the idiom, and a missing ELSE quietly returns NULL instead of 0. The audit habit: the pivot's columns must sum back to the 103-period base.",
      slugs: ["daily-leads-and-partners", "actors-and-directors-who-cooperated-at-least-three-times", "count-salary-categories"],
    },
    {
      name: "Set-op segment comparisons",
      why: "Expansion questions are set questions — which workspaces used template A but never B, which cohorts overlap. UNION dedupes while UNION ALL appends, EXCEPT is the anti-join written as a set, and INTERSECT finds the both-states cohort every churn postmortem starts from.",
      slugs: ["customers-who-bought-a-and-b-not-c", "sellers-with-no-sales", "biggest-single-number"],
    },
    {
      name: "Subquery shapes: scalar, IN, EXISTS",
      why: "Above-average screens compare each workspace to a fold — the platform's or its cohort's — and the shape decides cost and correctness. NOT IN against a nullable column silently returns nothing; EXISTS is NULL-safe and short-circuits. Knowing which subquery re-runs per row is the senior tell.",
      slugs: ["second-highest-salary", "game-play-analysis-iv", "employees-earning-more-than-their-managers"],
    },
    {
      name: "Stickiness & rolling cohorts",
      why: "PLG health is ratio work over time: DAU/WAU-style stickiness, rolling 7-day actives, cohort retention matrices. The kit's two-grain reads extend naturally — the trap is a rolling window that double-counts repeat usage instead of folding it.",
      slugs: ["dau-wau-stickiness", "rolling-7d-actives", "cohort-retention-matrix"],
    },
    {
      name: "Trial-to-paid conversion math",
      why: "The evaluating-on-trial state (14 periods on this db) exists to be converted. Median-time-to-convert, winback recovery and stage-to-stage conversion are LAG-and-conditional work over the same funnel spine — the queries the growth team prices every experiment on.",
      slugs: ["trial-to-paid-funnel", "median-time-to-convert", "winback-recovery"],
    },
  ],

  theory: [
    {
      id: "notion-t1",
      q: "Your dormancy report joins workspaces to their usage periods. When do you INNER and when do you LEFT — and what silently breaks if you filter a usage column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An activity report joins periods to workspaces: a period with no workspace is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from workspaces: the workspaces with no recent periods ARE the finding — a workspace that went quiet is a churn signal — arriving with NULL usage columns. The classic break: filtering status = 'delivered' in WHERE after a LEFT JOIN kills every NULL-payload workspace row — the LEFT JOIN quietly became an INNER and the dormant workspaces vanished. The fix is moving the predicate into ON or an outer query. On this db the never-used anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "notion-t2",
      q: "The growth census shows 103 usage periods, 16 workspaces and 251 editor events. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts editor events — 251; COUNT(DISTINCT o.id) folds them back to usage periods — 103; COUNT(DISTINCT customer_id) folds further to workspaces — 16. None is wrong: events measure in-product touch volume, periods measure the engagement calendar, workspaces measure the installed base. The ratios are the reads — 2.4 events per period, 6.4 periods per workspace — and they decide whether growth is broadening (more workspaces) or deepening (more usage per workspace), which is THE PLG question. The trap that catches candidates is quoting an event count as a workspace count in a trend; one period with three editor events is one engagement row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "notion-t3",
      q: "The expansion review wants workspaces with at least ten usage periods. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The funnel-state rule is a row-level fact — status = 'delivered' discards evaluating and churned periods before any fold, in WHERE; putting it in HAVING is impossible because states no longer exist once rows are grouped. The ten-period floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an expansion-qualified list and an error, and between a threshold applied to periods versus to workspaces. On this db only the ladder tops — 24, 17, 14, 13 — clear a ten-period bar. The strong answer places every filter by asking: is this a fact about one editor event, or about a workspace's whole fold?",
      tag: "pipeline",
    },
    {
      id: "notion-t4",
      q: "You rank workspaces by usage depth and four of them tie at exactly 4 periods. RANK, DENSE_RANK or ROW_NUMBER for the growth board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied workspaces the same rank and skips — the quartet at 4 periods shares rank 6, and the next distinct depth would land at rank 10, implying phantom workspaces that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct depth is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about which workspace gets the expansion call first. On this db the tie is structural: the ladder runs 24, 17, 14, 13, 5, then the quartet at 4. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer workspaces, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "notion-t5",
      q: "A workspace is 'evaluating on trial' with no activation stamp yet. What is your NULL policy for the time-to-activation report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only activated periods have an activation latency, so the report measures activated usage and says so — on this db 82 of 103 periods carry a stamp (52 activated plus 30 onboarded-pending-verification), averaging 2.98 days from creation to activation stamp, range 2 to 4; 14 are evaluating, 7 churned. Then mechanics: AVG ignores NULLs, so AVG over ALL periods returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(activation_stamp) counts the activated subset; the gap between it and COUNT(*) IS the not-yet-activated count, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant activation for workspaces still evaluating, and a funnel report built that way is a lie with decimals.",
      tag: "nulls",
    },
    {
      id: "notion-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 periods always produce an average. On filtered staging tables — one cohort, one template family, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each period to ITS workspace's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "notion-t7",
      q: "The usage trend buckets periods by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; SUBSTR to month-only would merge January 2024 with January 2025 and the seasonality curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's usage, and month-end is exactly when trial conversions land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in a growth walk. The spine's headline is probed: 2024-01 opens at 8 periods and 3,731.97 of usage value.",
      tag: "dates",
    },
    {
      id: "notion-t8",
      q: "The billing desk says a paid seat invoice has no payment rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 4,937.00 print into 4,937 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the product's usage ledger and the seat book, and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
    {
      id: "notion-t9",
      q: "The finance partner wants a running usage-value curve down the month spine. What does the default window frame actually cover, and where do ties make ROWS versus RANGE matter?",
      a: "The default frame is RANGE UNBOUNDED PRECEDING TO CURRENT ROW — it includes every peer row tied on the ORDER BY value. On the month spine that is invisible: months are unique, so the running SUM of ROUND(SUM(total), 2) climbs cleanly from 2024-01's 3,731.97. It bites the moment the ORDER BY key repeats — order the walk by period count and four months sit at 8, so the default frame adds all four peers at once and the running value jumps in a lump. Pinning ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the walk strictly row-by-row. The habit to grade: name the frame whenever the ORDER BY key can repeat, because a running total that moves in lumps is a chart someone will misread.",
      tag: "windows",
    },
    {
      id: "notion-t10",
      q: "You need one list of EU and APAC usage periods and a separate dedupe question behind it. When is UNION the right tool versus UNION ALL — and what does each cost?",
      a: "UNION concatenates and then deduplicates the stack; UNION ALL just appends. On this db, stacking EU's 45 periods and APAC's 37 with UNION ALL returns 82 rows, guaranteed — workspaces live in one cohort, so the branches cannot overlap. UNION returns the same 82 here but pays a sort or hash to prove it, and if a workspace ever spanned cohorts it would silently collapse real duplicates into one row. The honest rule: UNION ALL when the branches are disjoint by construction — different region values, different funnel states — and UNION when the overlap is itself the finding. And never reach for set ops to dedupe a single fold; that is DISTINCT's job. Set ops combine result sets, they do not clean them.",
      tag: "setops",
    },
    {
      id: "notion-t11",
      q: "Which workspaces generated activated usage but never churned — and which did both? Write it with set operators and tell me why not anti-joins.",
      a: "Two set answers: activated EXCEPT churned gives workspaces with delivered periods and no cancelled ones — EXCEPT removes every workspace appearing in the churned branch; activated INTERSECT churned gives the both-states cohort, the workspaces that monetized and later went dark. EXCEPT is an anti-join written as a set: LEFT JOIN ... IS NULL finds the same rows with row-level predicates, while EXCEPT compares whole tuples, so both branches must project identical columns in identical order. On this db the INTERSECT branch is where the story lives — the 7 cancelled periods belong to workspaces that had also activated, and that overlap is the churn postmortem list. The trade to say out loud: set ops read cleaner in stakeholder prose; joins scale and compose better.",
      tag: "setops",
    },
    {
      id: "notion-t12",
      q: "Find every workspace whose average usage value beats its cohort's average. Correlated or derived — and what changes in the query plan?",
      a: "A correlated subquery compares each workspace to ITS cohort's fold — AVG(total) filtered to the same region — and re-runs that fold once per outer row: correct, obvious, quadratic in the worst case. The derived-table version stages one GROUP BY region fold and joins it back on region — one pass to build, one pass to compare, and the plan stays flat as the table grows. On 16 workspaces the difference is academic; on sixteen million the correlated shape is the slow query in the postmortem. The semantics differ too: the derived join makes the cohort average an explicit, auditable column, while the correlated version hides it inside the WHERE. Say which population each version defends — per-row versus per-cohort — because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "notion-t13",
      q: "Why does a NOT IN against a nullable column return an empty list, and why do shops standardize on EXISTS for these screens?",
      a: "NOT IN is a three-valued-logic trap: x NOT IN (list) evaluates as x <> value against every element, and one NULL in the subquery makes every comparison UNKNOWN — so no row survives and the report confidently ships an empty list. The classic version here: a single NULL customer_id in one order row turns the never-churned workspace list into nothing. EXISTS sidesteps the whole class — it tests for the existence of a matching row, never compares against the empty value, and short-circuits on the first hit. The NULL-safe equivalents are NOT EXISTS or a LEFT JOIN ... IS NULL anti-join, which this kit drills as the dormancy shape. The habit to grade: before trusting NOT IN, ask what the inner column's NULL rate is.",
      tag: "subqueries",
    },
    {
      id: "notion-t14",
      q: "Activation latency is julianday(shipped_at) - julianday(created_at), averaging 2.98 days. What does julianday buy that timestamp strings don't — and where do month boundaries bite?",
      a: "JULIANDAY converts a timestamp to a fractional day count, so subtraction is real arithmetic — the 2.98-day average and the 2-to-4 spread only exist because the delta is numeric, not a string difference. Calendar slicing is the other half: STRFTIME('%Y-%m', created_at) and SUBSTR(created_at, 1, 7) agree on this db — 14 buckets from 2024-01 to 2025-02 — and both beat a BETWEEN on month-end, which drops the last night's usage exactly when trial conversions land. The half-open interval — created_at >= '2024-01-01' AND created_at < '2024-04-01' — is the boundary rule that survives audits. And never bucket by month number alone: '%m' without the year merges January 2024's 3,731.97 into January 2025's 1,669.50, and the seasonality curve becomes fiction.",
      tag: "dates",
    },
    {
      id: "notion-t15",
      q: "The weekly funnel review wants activated, onboarded, evaluating and churned as four columns in one pass. Write the shape — and tell me what a missing ELSE does.",
      a: "One pass, four conditional folds: SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS activated, and the same for 'shipped', 'pending' and 'cancelled' — 52, 30, 14 and 7 on this db, summing back to 103. A missing ELSE returns NULL, not 0: SUM ignores NULLs so the column still totals right, but COUNT(CASE WHEN ... THEN 1 END) counts non-NULLs, and a NULL literal in later arithmetic poisons the whole expression to NULL. The idioms agree when written carefully — SUM(CASE ... ELSE 0 END) and COUNT(CASE WHEN ... THEN 1 END) give the same number; mixing them across columns is how a pivot ships one column that is right and one that is NULL. The audit habit: every pivot's columns must sum to the base — 52 + 30 + 14 + 7 = 103, or a CASE branch leaks.",
      tag: "case",
    },
    {
      id: "notion-t16",
      q: "Walk the logical evaluation order for a query with a JOIN, a GROUP BY, a HAVING and a window function — and explain why the window can see aggregates but WHERE cannot.",
      a: "Logical order: FROM and ON build the rows, WHERE filters rows, GROUP BY forms the folds, HAVING judges the folds, window functions evaluate over the surviving folds, SELECT projects, ORDER BY sorts, LIMIT trims. That order explains three regular failures. WHERE cannot use COUNT(*) because groups do not exist yet — that is HAVING's job. A window CAN sit over aggregates — SUM(COUNT(*)) OVER (PARTITION BY region) — because windows evaluate after GROUP BY. And a window result cannot be filtered in WHERE or HAVING because those already ran — the filter on ROW_NUMBER or LAG must be staged in a derived table or CTE and applied in the outer query, which is exactly how the modal-month spine gets built. Pipeline order is not trivia; it is the reason each clause is where it is.",
      tag: "pipeline",
    },
    {
      id: "notion-t17",
      q: "The billing desk's SUM doubled overnight. Walk me through the fan-out diagnosis on the invoices-payments join.",
      a: "Fan-out: one invoice with two payment rows becomes two rows after the join, so SUM(i.amount_cents) counts that invoice twice. On this db, 28 invoices meet 27 payments and the LEFT JOIN produces 33 rows — five split-payment invoices (1, 5, 12, 19, 22) carry two settlement rows each, six carry none, the rest one. The diagnosis is the row-count check: compare COUNT(*) on the base table to the join's row count, and the gap is your fan-out. The fix is to fold first — aggregate payments per invoice, then join the one-row-per-invoice rollup — or aggregate the many-side separately and join the aggregates. What never works is deduping with DISTINCT afterwards: the damage is arithmetic, and DISTINCT cannot undo a doubled SUM.",
      tag: "joins",
    },
    {
      id: "notion-t18",
      q: "A cohort with zero churned periods shows NULL in the churn-value column, not 0. What is going on, and what is the honest fix?",
      a: "SUM over zero rows returns NULL — aggregates are defined on multisets, the sum of an empty set is undefined, so the engine hands back NULL. COUNT is the exception: it counts and returns 0. So a workspace with no churned periods gets a NULL churn value, and any arithmetic on that column — churn share, deltas — silently propagates NULL through the whole report. The honest fix is policy, not reflex: COALESCE(SUM(...), 0) when zero is the true business reading — no churned usage means zero churned value — but never COALESCE a latency average to 0, because zero would mean instant, a fact the data does not assert. The rule to state: COALESCE expresses a business claim about what absence means, and every claim gets named in the query comment.",
      tag: "nulls",
    },
    {
      id: "notion-t19",
      q: "The dashboards are slow. Give me the three query-shape instincts you would apply before anyone buys hardware.",
      a: "One: make predicates sargable — WHERE STRFTIME('%Y-%m', created_at) = '2024-01' wraps the column in a function and forfeits any index on it; the half-open range created_at >= '2024-01-01' AND created_at < '2024-02-01' uses the index and returns the identical 8-period bucket. Two: filter and fold early — the modal-month pattern stages a 14-row fold instead of dragging 251 editor-event lines through the outer query, and the dormancy anti-join shrinks the table before the expensive join. Three: index for the join and the filter together — orders(customer_id, status) serves the per-workspace activation folds and the census at once. On 103 rows none of this matters; the interview question is whether you know the 103-row habit does not survive contact with production.",
      tag: "performance",
    },
    {
      id: "notion-t20",
      q: "Two teams report 'activation rate' — one says 50.5%, the other 88.1%. Both queried the same db. What went wrong and what do you change?",
      a: "Nothing computational: 52 activated of 103 usage periods is 50.5%; 52 of the 59 resolved periods — activated plus churned, trials and onboarded excluded — is 88.1%. Both are real metrics with different names, and the failure is that neither team wrote the denominator down. The fix is governance, not SQL: one definition per metric name, the denominator stated in the query comment, and the alternate cut renamed — resolved-funnel activation — so both numbers can coexist honestly. This kit's convention is the model: activation rate is activated over ALL periods, and every conditional count says its population out loud. The interview point: when two teams disagree on a number, the first artifact you ask for is not the query — it is the definition each query implements.",
      tag: "metrics",
    },
    {
      id: "notion-t21",
      q: "You need each workspace's period count AND its share of the cohort's periods in one query. How do you mix aggregates and windows without double-folding?",
      a: "Stage it. Fold periods per workspace with GROUP BY customer_id, then compute the share over the staged fold: 100.0 * periods / SUM(periods) OVER (PARTITION BY region). The nested aggregate — a window over COUNT(*) — is legal in one SELECT because windows evaluate after GROUP BY, but the portable, reviewable shape stages the fold in a CTE and keeps the window in the outer query where the partition is visible. On this db the read lands immediately: EU's 45 periods over 8 workspaces is intensity 5.6, while LATAM's 2 periods sit entirely in one workspace — a 100% share — a single-workspace cohort wearing a region costume. The double-fold trap: SUM(COUNT(*)) without PARTITION BY gives the platform share, not the cohort share, and both are plausible numbers on a dashboard.",
      tag: "windows",
    },
    {
      id: "notion-t22",
      q: "The status column says one thing and the payment rows say another. Which wins, and what is the triage query?",
      a: "The payment rows win — status is a claim, the settlement rows are the ledger. The two mirror modes on this db prove the point: bill #11 is void with a 925.00 payment behind it (money moved on a cancelled bill), and bill #28 is marked paid with zero settlement rows (a paid claim with no money). The triage query is row-level, not a count: invoices LEFT JOIN payments, classified by coverage — 21 exact, 1 partial, 6 none — with anomaly rows surfaced WHERE the class contradicts the status. What ships to finance is that row list with ids and amounts, because 'one anomaly' is a shrug and '#28, paid, 1,756.00, no settlements' is a ticket. The discipline: every reconciliation report names its ledger of record before it computes anything.",
      tag: "quality",
    },
    {
      id: "notion-t23",
      q: "Why does the kit store money in INTEGER cents and convert once at the fold, instead of rounding dollars on every row?",
      a: "Because rounding is a per-row tax that compounds. Convert-and-round on every line and a stack of odd-cent bills each loses or gains a fraction; SUM the drift across 28 seat bills and the total no longer reconciles with the ledger — the audit delta is nonzero and the close stalls. The kit's rule: keep amount_cents as INTEGER, aggregate in cents, convert once — SUM(amount_cents) / 100.0 at the fold — so the only rounding decision is the display one. The .0 in the divisor is the whole fix: integer divided by integer truncates, and 4,937.00 prints as 4,937 with the cents quietly gone. The same discipline explains the probe habit: every money figure in a report traces to a cents-level cell, never to a rounded display value.",
      tag: "arithmetic",
    },
    {
      id: "notion-t24",
      q: "The expansion board wants the deepest workspace per cohort. Why doesn't LIMIT work, and what is the window shape?",
      a: "LIMIT truncates the whole result set — the deepest workspace in the platform, 24 periods, full stop. Per-cohort top-N needs a ranking that resets per group: ROW_NUMBER() OVER (PARTITION BY region ORDER BY SUM(total) DESC) staged in a CTE, then the outer query filters rn = 1 and every cohort contributes exactly one row — EU's 15,089.23 champion, APAC's 11,605.45, US's 7,286.16, LATAM's 852.44. Ties are why ROW_NUMBER and not RANK: two workspaces tied on value would both survive rn = 1 under RANK and the board would double-count a cohort — if sharing is the policy, DENSE_RANK plus a named tie-break is the honest version. The staging is not optional on most engines: the window result cannot be filtered in the same SELECT that computes it, which is the pipeline-order lesson wearing a business costume.",
      tag: "windows",
    },
  ],

  mcqs: [
    {
      id: "notion-mcq-1",
      prompt: "A usage period's status column reads 'pending'. In this kit's PLG funnel, what is it?",
      choices: ["Activated and engaged", "Onboarded, activation stamp pending", "Evaluating on trial — not yet activated", "Churned / workspace deleted"],
      answer: 2,
      why: "The funnel map is fixed: delivered = activated (52 of 103 periods), shipped = onboarded with the activation stamp already applied (30), pending = evaluating on trial (14), cancelled = churned (7). 'Pending' is the trial state — the workspace exists but hasn't crossed the aha threshold.",
      notes: [
        { choice: 1, why: "Onboarded-pending-verification is 'shipped' — 30 periods that DO carry a stamp. Counting trials as onboarded inflates every activation number." },
        { choice: 3, why: "Churned is 'cancelled' — 7 periods. Evaluating workspaces are still in the funnel; churned workspaces left it. Confusing them flips the funnel's direction." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-2",
      prompt: "Activation rate is defined as activated ÷ which population? The db holds 52 activated and 7 churned of 103 usage periods.",
      choices: ["Activated + churned only (52/59 = 88.1%)", "All usage periods (52/103 = 50.5%)", "Onboarded periods only", "Distinct workspaces (52/16)"],
      answer: 1,
      why: "The house definition: activated ÷ ALL periods, trials and onboarded-pending included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-funnel activation rate — a legitimate separate metric, but calling it 'the activation rate' inflates 50.5% to 88.1% by quietly deleting 14 trials and 30 onboarded periods. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is activated periods per workspace — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-3",
      prompt: "EU carries 45 usage periods from 8 workspaces. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts period rows (45); COUNT(DISTINCT customer_id) folds repeats back to workspaces (8). The gap between the columns — 5.6 periods per workspace — is the intensity read that separates load from audience.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every period has a workspace. Without DISTINCT both columns read 45 and the census loses the spread story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts cohorts, not workspaces — a third grain nobody asked for. The census is periods AND workspaces." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued periods", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every cohort's activation share truncates toward 0 and the whole funnel map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-5",
      prompt: "Keep only workspaces with at least 10 usage periods. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY workspace HAVING COUNT(*) >= 10", "WHERE periods >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A period-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the expansion ladder — 24, 17, 14, 13 periods — clears such a bar per workspace.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'periods' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-6",
      prompt: "A seat invoice row reads amount_cents = 493700. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 4,937.00. The .0 is the entire fix — integer ÷ integer truncates, and every odd-cent seat bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "493700 / 100 is integer division = 4937 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 49,370,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-7",
      prompt: "The dormancy list is built as workspaces LEFT JOIN usage periods WHERE the period id IS NULL. What happens if a teammate rewrites it with INNER JOIN?",
      choices: ["Same list, faster — INNER JOIN is equivalent here", "Empty list — the workspaces with no periods fail the join and vanish", "All 16 workspaces — the join direction flips", "An error — INNER JOIN needs an ON clause with IS NULL"],
      answer: 1,
      why: "The dormancy list IS the anti-join: workspaces whose join finds no period survive only under LEFT JOIN + IS NULL. INNER JOIN drops exactly those rows — on this db that list is empty (every workspace has usage), and the rewrite hides the fact that the check ran at all.",
      notes: [
        { choice: 0, why: "INNER and LEFT differ precisely on the unmatched rows — which are the entire answer here. The rewrite deletes the finding, not the bug; a confident zero still needs the LEFT JOIN to be believable." },
        { choice: 2, why: "Join type never flips direction — it changes row survival. All 16 would need a CROSS JOIN, a different (and wrong) tool." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-8",
      prompt: "A teammate builds the monthly usage trend with SUBSTR(created_at, 6, 2) AS month. The db spans 2024-01 to 2025-02. What does the chart show?",
      choices: ["A correct 14-bucket trend", "12 buckets — every January merged into one, every February merged into one", "14 buckets but sorted wrong", "An error — SUBSTR cannot parse timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) grabs the two-digit month with no year: January 2024 (8 periods, 3,731.97) and January 2025 (6 periods, 1,669.50) collapse into one bucket. The spine must be '%Y-%m' — year plus zero-padded month — or the seasonality curve is fiction.",
      notes: [
        { choice: 0, why: "The db spans two calendar years — month-only bucketing silently merges same-month pairs. 14 real months compress to 12 fictional ones." },
        { choice: 3, why: "SUBSTR parses fine — that's the trap. The bug is semantic (lost year), not mechanical, so nothing errors and the chart just quietly lies." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-9",
      prompt: "RANK() OVER (ORDER BY COUNT(*) DESC) ranks the depth ladder 24, 17, 14, 13, 5, 4, 4, 4, 4. What rank does the FOURTH tied workspace at 4 periods hold?",
      choices: ["6", "5", "9", "Whatever ROW_NUMBER assigned it"],
      answer: 0,
      why: "RANK gives every tied row the same rank — the quartet shares rank 6 (after 1, 2, 3, 4, 5) — and reserves rank 10 for the next distinct depth. All four tied workspaces are rank 6, by policy, not accident.",
      notes: [
        { choice: 1, why: "Rank 5 belongs to the single workspace at 5 periods. The tie starts at 6 — counting tied rows as separate rungs is exactly the phantom-rank bug." },
        { choice: 3, why: "ROW_NUMBER would arbitrarily order the quartet 6, 7, 8, 9 — a silent judgment call about which workspace gets the expansion call first. If you use it, name the tie-breaker." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-10",
      prompt: "A month-over-month usage walk uses LAG(revenue) OVER (ORDER BY month) on the 14-month spine. What is honest to do with the first row's NULL delta?",
      choices: ["Coalesce it to 0 — the first month has no growth", "Coalesce it to the first month's revenue — that's the baseline", "Report it as NULL or label it 'baseline' — there is no prior month to differ from", "Drop the first row entirely so no NULL appears"],
      answer: 2,
      why: "The first row's prior value does not exist: LAG returns NULL and the delta is NULL by definition, not by failure. Coalescing to zero fabricates a flat month into a growth walk; dropping the row hides the spine's opening (2024-01: 8 periods, 3,731.97).",
      notes: [
        { choice: 0, why: "Zero means 'no change from last month' — a factual claim about a month that has no last month. Baseline is a label, not a zero." },
        { choice: 1, why: "Setting the delta equal to the month's own revenue invents a +100% growth month. The edge row is where growth walks most often lie." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-11",
      prompt: "ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) returns 50.5 for the platform. What does the trailing 1 in ROUND control?",
      choices: ["The number of decimal places kept in the result", "The percent base — 1 means 100%", "How many rows get rounded up", "Nothing — ROUND cannot take a second argument here"],
      answer: 0,
      why: "ROUND(x, 1) keeps one decimal place: 50.48 becomes 50.5. The scaling to percent is the 100.0 multiplier's job; the 1 only trims display precision.",
      notes: [
        { choice: 1, why: "The percent scale is the 100.0 sitting before the division — it fixes integer truncation. The 1 in ROUND is pure display: ROUND(..., 2) would print 50.48." },
        { choice: 3, why: "ROUND is a two-argument function; dropping the 1 is a different valid query that returns 50 — the truncation damage this kit drills — not an error." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-12",
      prompt: "A report stacks EU's 45 usage periods on APAC's 37. Workspaces live in exactly one cohort. What do UNION and UNION ALL each return?",
      choices: ["UNION 82, UNION ALL 82 — identical here", "UNION dedupes, so it may return fewer than 82; UNION ALL always appends 82", "UNION ALL dedupes; UNION errors on duplicates", "Both error without a matching ORDER BY"],
      answer: 1,
      why: "UNION ALL appends blindly: 45 + 37 = 82, guaranteed. UNION first dedupes — here the branches are disjoint by construction, so it also returns 82 but pays a sort or hash to prove it.",
      notes: [
        { choice: 0, why: "The counts match, but the cost and the semantics differ: UNION's dedupe is a real operator, and if a workspace ever spanned cohorts it would silently collapse real duplicates." },
        { choice: 2, why: "It is the reverse — UNION dedupes, UNION ALL does not. Neither errors on duplicates; that is exactly the difference." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-13",
      prompt: "After invoices LEFT JOIN payments and a GROUP BY invoice id: for the 6 bills with no settlement rows, what do COUNT(*) and COUNT(p.id) read?",
      choices: ["COUNT(*) reads 1, COUNT(p.id) reads 0", "Both read 0", "COUNT(*) reads 1, COUNT(p.id) reads 1", "COUNT(p.id) errors on the NULL"],
      answer: 0,
      why: "The LEFT JOIN keeps the unmatched invoice with a NULL payment payload: the row survives, so COUNT(*) counts it — while COUNT(p.id) skips NULLs and reads 0. The gap between the two columns IS the no-payment list.",
      notes: [
        { choice: 1, why: "COUNT(*) counts rows, not values — the invoice row is present with a NULL payload. Reading 0 is the classic LEFT JOIN misread that hides real bills from the dunning list." },
        { choice: 3, why: "COUNT ignores NULLs by definition — that is the entire trick. No error: the NULL simply does not get counted." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-14",
      prompt: "Which set operator returns workspaces with activated usage periods but NO cancelled periods?",
      choices: ["INTERSECT", "EXCEPT", "UNION ALL", "CROSS JOIN"],
      answer: 1,
      why: "activated EXCEPT churned keeps every workspace in the first branch that never appears in the second — the anti-join written as a set difference. Both branches must project the same columns in the same order.",
      notes: [
        { choice: 0, why: "INTERSECT is the opposite read — workspaces that did BOTH (activated and later churned), which is the churn postmortem list, not the clean list." },
        { choice: 2, why: "UNION ALL appends both lists including duplicates — it filters nothing. A set-op question is always asking which set algebra the deliverable needs." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-15",
      prompt: "A teammate's NOT IN (SELECT customer_id FROM orders WHERE ...) list comes back EMPTY on a staging copy where one order row has a NULL customer_id. What happened?",
      choices: ["NOT IN is broken in sqlite", "One NULL in the subquery makes every comparison UNKNOWN, so no outer row survives", "NOT IN requires an ORDER BY inside the subquery", "The outer query forgot DISTINCT"],
      answer: 1,
      why: "x NOT IN (list) is x <> v1 AND x <> v2 ...; comparing anything against NULL yields UNKNOWN, one UNKNOWN AND is enough, and no row passes. The NULL-safe rewrites are NOT EXISTS or a LEFT JOIN ... IS NULL anti-join.",
      notes: [
        { choice: 0, why: "sqlite implements the SQL standard here — three-valued logic is portable behavior. Blaming the engine ships the same bug to the next database." },
        { choice: 2, why: "ORDER BY inside a subquery is meaningless for membership and fixes nothing. The bug is a NULL in the compared column, not ordering." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-16",
      prompt: "SUM(i.amount_cents) over invoices LEFT JOIN payments — 28 invoices meet 27 payments and 5 bills carry two settlement rows. What does the join produce?",
      choices: ["28 rows — the join folds split payments", "33 join rows, and the 5 split bills double-count in every SUM", "An error on duplicate invoice ids", "27 rows — payments win"],
      answer: 1,
      why: "5 split bills contribute two rows each and 23 invoices contribute one (17 single-payment + 6 with NULL payload): 10 + 23 = 33 join rows. SUM(i.amount_cents) counts each split bill twice — the fan-out the row-count check catches.",
      notes: [
        { choice: 0, why: "Joins never fold — they multiply. The fold is GROUP BY's job, and doing it before the join (one rollup row per invoice) is the fix." },
        { choice: 3, why: "LEFT JOIN keeps unmatched invoices — the 6 no-payment bills survive with NULL payloads, so rows go UP to 33, not down to 27." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-17",
      prompt: "LAG(usage_value, 2) OVER (ORDER BY month) on the 14-month spine — what does the delta for 2024-02 compare against?",
      choices: ["2024-02 minus 2024-01", "2024-02 minus 2023-12 — no such row, so NULL", "2024-02 minus itself", "An error — LAG takes one argument"],
      answer: 1,
      why: "The second argument is the look-back distance: 2 rows back from 2024-02 is December 2023, which does not exist on a spine starting 2024-01 — LAG returns NULL and the delta is NULL, not an error.",
      notes: [
        { choice: 0, why: "That is LAG(..., 1). With offset 2 the immediately prior month is skipped — the walk quietly compares every month to two months ago and the seasonality story changes." },
        { choice: 2, why: "LAG(..., 0) would return the current row — every delta 0. Offsets of 0 are valid calls with useless results; they do not error." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-18",
      prompt: "A cohort fold returns NULL in a churn-value column. What does that NULL assert, and when is COALESCE(SUM(...), 0) honest?",
      choices: ["NULL is a bug — coalesce everything to 0", "No rows fed the SUM — empty sets aggregate to NULL, not 0; coalesce only when zero is the true business reading", "SUM never returns NULL — the column must be text", "NULL means the fold double-counted"],
      answer: 1,
      why: "SUM over an empty group is NULL by definition. Coalescing to 0 is a business claim — 'no churned usage means zero churned value' is true; 'no activations means instant activation' is not — and the claim belongs in the query comment.",
      notes: [
        { choice: 0, why: "Blanket coalescing is exactly the latency bug this kit drills: AVG coalesced to 0 publishes instant activation for workspaces still evaluating." },
        { choice: 2, why: "COUNT is the only aggregate that returns 0 on empty input. SUM/AVG/MIN/MAX all return NULL — that is the standard, not a type error." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-19",
      prompt: "Share of a workspace's periods within its cohort: COUNT(*) folded per workspace over SUM(COUNT(*)) OVER (PARTITION BY region). What makes this legal — and what makes it reviewable?",
      choices: ["Windows cannot see aggregates — it errors", "Nested aggregates are legal (windows evaluate after GROUP BY), but the portable shape stages the fold in a CTE first", "PARTITION BY forbids GROUP BY in the same query", "It only works without the PARTITION BY"],
      answer: 1,
      why: "Window functions evaluate after GROUP BY, so a window over an aggregate is legal in one SELECT. The reviewable version stages the per-workspace fold in a derived table or CTE and keeps the partition visible in the outer query.",
      notes: [
        { choice: 0, why: "It runs — the pipeline order is exactly what makes nested aggregates legal. The reason to stage it is reviewability and portability, not correctness." },
        { choice: 3, why: "Dropping the PARTITION BY silently changes the denominator from the cohort's periods to the platform's 103 — both numbers are plausible, only one is asked for." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-20",
      prompt: "A running-value walk orders by period count — and four months tie at 8. What differs between the default frame and ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW?",
      choices: ["Nothing — ties are handled identically", "The default RANGE frame includes tied peers, so the running sum jumps by every 8-period month at once; ROWS moves row by row", "ROWS is slower but numerically identical", "The default frame excludes the current row"],
      answer: 1,
      why: "Default frames are RANGE ... CURRENT ROW — peers tied on the ORDER BY value are all inside the frame, so the running total absorbs them in one step. ROWS pins the frame to physical rows and the walk is strictly incremental.",
      notes: [
        { choice: 1, why: "Correct — and on a month spine ordered by month (unique keys) the two agree, which is why the bug only shows up the day someone re-sorts the walk." },
        { choice: 2, why: "Performance is beside the point: the numbers differ. A running sum that moves in lumps is a chart a CFO will misread." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-21",
      prompt: "A dormancy query is written workspaces LEFT JOIN periods WHERE o.status = 'delivered'. What happened to the NULL-payload rows?",
      choices: ["They survive with NULL payloads", "The WHERE turned the LEFT JOIN into an INNER — they fail the predicate and vanish", "They error out at execution", "They sort to the bottom"],
      answer: 1,
      why: "NULL = 'delivered' is UNKNOWN, so unmatched rows are filtered after the join — the LEFT JOIN silently became an INNER. The fix: move the predicate into ON, or stage the anti-join before filtering.",
      notes: [
        { choice: 0, why: "Survival happens at join time; the WHERE runs after. This is the classic self-destructing anti-join — the query looks left, it behaves inner." },
        { choice: 3, why: "NULL rows are not deprioritized — they are deleted. Sorting is cosmetic; the rows are gone from the result entirely." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-22",
      prompt: "ORDER BY 2, 1 on a two-column fold means what?",
      choices: ["Sort by the constants 2 and 1", "Sort by the 2nd column, then the 1st — ordinals", "An error — ORDER BY needs column names", "Descending twice"],
      answer: 1,
      why: "Integers in ORDER BY are positional references to the SELECT list. It is portable but brittle: inserting a column reshuffles the sort. Named aliases are the reviewable form.",
      notes: [
        { choice: 0, why: "ORDER BY 2 is never the constant 2 — that reading would make every row equal and the clause pointless. Ordinals are the standard interpretation." },
        { choice: 2, why: "It runs fine — the brittleness, not the validity, is why code review flags it." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-23",
      prompt: "HAVING COUNT(*) >= 'shipped' on the cohort census — what comes back?",
      choices: ["Only cohorts that shipped", "Every group — integers always compare before text in sqlite, so the comparison is true", "An error — HAVING needs a number", "No groups at all"],
      answer: 1,
      why: "sqlite's type ordering puts every integer before every text value, so COUNT(*) >= 'shipped' is always true — the filter evaporates and all 16 workspace folds sail through. A quoted status in a numeric gate is a silent no-op.",
      notes: [
        { choice: 0, why: "The status never enters the comparison — COUNT(*) is a number, 'shipped' is text, and the gate is always true. The result looks like 'no floor was applied', which is exactly what happened." },
        { choice: 2, why: "sqlite happily compares across types — that is the trap. Strict engines error; sqlite returns a confident, wrong answer." },
      ],
      difficulty: "easy",
    },
    {
      id: "notion-mcq-24",
      prompt: "Billed dollars from INTEGER cents: SUM(amount_cents) / 100.0 at the fold, or ROUND(amount_cents / 100.0, 2) per row then SUM?",
      choices: ["Per-row ROUND — prettier intermediates", "Aggregate in cents, convert once — per-row rounding drifts across odd-cent bills and the total stops reconciling", "Both are always identical", "Neither — use AVG(amount_cents)"],
      answer: 1,
      why: "Rounding per row taxes every line: each odd-cent bill sheds its fraction before the SUM, and 28 rounded rows can land a cent or two off the ledger. Convert once at the fold and the only rounding is display.",
      notes: [
        { choice: 2, why: "Identical on even-cent bills, wrong on odd ones — the drift is rare enough to survive staging and visible exactly at month close." },
        { choice: 3, why: "AVG of cents is a per-bill average, not a total — a different quantity entirely. The cents rule is about where conversion happens, not which aggregate." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-25",
      prompt: "Which EXISTS query finds workspaces with at least one activated usage period?",
      choices: ["WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')", "WHERE EXISTS ('delivered')", "WHERE customer_id IN ('delivered')", "WHERE EXISTS (c.status = 'delivered')"],
      answer: 0,
      why: "EXISTS takes a subquery that probes for a matching row — correlated on the workspace id, filtered to the activated state, SELECT 1 because the payload is irrelevant. It short-circuits on the first hit and is NULL-safe.",
      notes: [
        { choice: 1, why: "EXISTS needs a subquery, not a literal — this is a syntax error, and even if it ran it would test a constant, not a workspace's usage." },
        { choice: 2, why: "IN compares values to a list; 'delivered' is a status, not an id list. The shape is IN (SELECT ... FROM orders WHERE status = ...), and it is NOT IN that carries the NULL trap." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-26",
      prompt: "julianday(shipped_at) - julianday(created_at) averages 2.98 days over the 82 stamped periods. What is julianday actually for?",
      choices: ["Formatting timestamps for display", "Converting timestamps to fractional day counts so date differences are real arithmetic", "Time zone conversion", "Extracting the month"],
      answer: 1,
      why: "JULIANDAY maps a timestamp to a continuous day number; subtraction yields fractional days — the 2.98 average and the 2-to-4 spread are only computable because the delta is numeric.",
      notes: [
        { choice: 0, why: "strftime formats; julianday computes. Confusing them is how latency reports end up string-concatenated." },
        { choice: 3, why: "That is strftime('%m', ...). julianday's whole value is arithmetic — differences, thresholds, latency bands." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-27",
      prompt: "A fold writes HAVING periods >= 8 where periods is the SELECT alias for COUNT(*). What is the honest statement?",
      choices: ["Standard SQL — portable everywhere", "sqlite accepts alias references in HAVING as an extension; portable SQL repeats the aggregate COUNT(*)", "It errors — aliases never work in HAVING", "Aliases only work in WHERE"],
      answer: 1,
      why: "Standard SQL evaluates HAVING before SELECT, so aliases do not exist there yet; sqlite's extension lets them through anyway. The portable habit — HAVING COUNT(*) >= 8 — runs everywhere and reads the same to reviewers.",
      notes: [
        { choice: 0, why: "It runs on sqlite, which is exactly the trap: the query is one engine away from breaking, and the interviewer asking 'is that portable?' knows it." },
        { choice: 2, why: "Backwards — sqlite is MORE permissive than the standard here. The error appears on strict engines, not on this one." },
      ],
      difficulty: "medium",
    },
    {
      id: "notion-mcq-28",
      prompt: "Window functions cannot sit in WHERE. How is the modal-month filter (keep months whose period count equals the modal size) correctly written?",
      choices: ["WHERE RANK() OVER (ORDER BY COUNT(*)) = 1", "Stage the fold (and any window) in a CTE or derived table, then filter in the outer query", "HAVING RANK() OVER (...) = 1", "It cannot be expressed in SQL"],
      answer: 1,
      why: "Windows evaluate after WHERE and HAVING, so filtering their output requires staging: fold the 14 months, then the outer query applies periods = 8. That two-stage shape is the modal-month case in this kit.",
      notes: [
        { choice: 0, why: "Two violations at once — a window in WHERE and an aggregate inside a window ordered by nothing grouped. The pipeline order forbids both." },
        { choice: 2, why: "HAVING runs before windows evaluate — same wall, different clause. The stage-then-filter shape is the only route." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-29",
      prompt: "The board wants the deepest workspace PER COHORT. LIMIT 1 gives one row globally. What is the per-cohort shape?",
      choices: ["LIMIT 1 PER region", "ROW_NUMBER() OVER (PARTITION BY region ORDER BY total DESC) staged in a CTE, filtered to rn = 1 in the outer query", "GROUP BY region LIMIT 1", "MAX(total) with no GROUP BY"],
      answer: 1,
      why: "Per-group top-N is a ranking that resets per partition, staged and then filtered — one row per cohort: EU's champion at 45 periods, APAC's at 37, US's at 19, LATAM's at 2. LIMIT truncates the whole result, not each group.",
      notes: [
        { choice: 2, why: "LIMIT does not compose with GROUP BY per group — it still truncates the folded result to one row total. There is no LIMIT BY in sqlite." },
        { choice: 3, why: "A bare MAX returns one global row (or, with other columns, an ungrouped mix). It answers 'deepest anywhere', not 'deepest in each cohort'." },
      ],
      difficulty: "hard",
    },
    {
      id: "notion-mcq-30",
      prompt: "ROUND(SUM(total), 2) reads 3,731.97 for 2024-01, but summing per-day values first gives 3,731.969999. What class of bug is this?",
      choices: ["Integer overflow", "Floating-point accumulation drift — aggregate first, round last, and keep money in integer cents", "Collation mismatch", "An index scan where a seek was expected"],
      answer: 1,
      why: "REAL arithmetic accumulates binary-fraction drift as rows stack; rounding early freezes it, rounding at the fold hides it. The structural fix is the kit's cents rule: INTEGER cents in, one / 100.0 at the fold.",
      notes: [
        { choice: 0, why: "Overflow saturates or errors at huge magnitudes; 3,731.97 is nowhere near it. The repeating-binary problem shows up at any scale." },
        { choice: 3, why: "Plans affect speed, not values. A numeric drift that reproduces with the same plan is arithmetic, not access-path." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-notion-1",
      tier: "medium",
      topic: "t5",
      universe: "funnel",
      title: "The activation leaderboard with honest ties",
      brief:
        "Notion-flavored brief on the storefront db: Monday's growth review opens with the activation leaderboard — every workspace ranked by usage depth, with its activated-period count shown beside the rank so expansion calls go to depth that actually activated. Probed facts: 103 usage periods across 16 workspaces; the depth ladder runs 24, 17, 14, 13, 5 and then a four-way tie at 4; activation sits at 52 of 103 periods (50.5%). The board gates at a four-period floor so every workspace on it is at least ladder-depth, and the tie policy is the headline: the quartet shares ONE rank, and the next distinct depth would skip ahead.",
      ask: "Return each qualifying workspace with its period count, activated count and shared-rank position — deepest workspace first, ties sharing one rank.",
      template:
        "SELECT c.name AS workspace,\n       COUNT(*) AS active_periods,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS activated,\n       RANK() OVER (ORDER BY COUNT(*) {1}) AS usage_rank\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id, c.name\nHAVING COUNT(*) >= {2}\nORDER BY usage_rank;",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the deepest-first window order",
          why: "The board ranks depth descending — 24 periods takes rank 1. ASC would hand rank 1 to the shallowest workspace and the expansion call would go to the smallest book.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the leaderboard floor",
          why: "The four-period floor keeps the ladder tops (24, 17, 14, 13, 5) plus the tied quartet — nine workspaces — and the floor value itself appears as the tied depth. A 5 floor amputates the quartet and the tie story; a 13 floor keeps only four workspaces.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the activated-state marker",
          why: "Activated is the delivered status — 52 of 103 periods platform-wide. 'shipped' would count onboarded-pending as activated and inflate every row; 'cancelled' would zero the column and the board loses the quality read.",
        },
      ],
      distractors: ["ASC", "13", "5", "'shipped'", "'cancelled'"],
      walkthrough:
        "A leaderboard where the tie policy IS the deliverable. Periods join to workspaces and fold per workspace; the window RANK orders by depth descending; the HAVING floor at 4 keeps nine workspaces — 24, 17, 14, 13, 5, then Isabella, Keiko, Noah and Pedro all at 4, sharing rank 6 while rank 10 is reserved for a depth that never arrives. The activated column reads 12, 4, 10, 5, 3, 2, 2, 2, 2 down the board against the probed 52-of-103 platform activation — depth without activation is the expansion-call trap this column exists to expose. The distractors each break differently: ASC crowns the shallowest workspace rank 1; a 13 floor drops Chloe and the quartet; a 5 floor amputates the tie the review exists to debate; 'shipped' counts onboarded-pending as activated and flatters every row; 'cancelled' zeroes the column entirely. The lesson under the lesson: on PLG boards, ties are cohorts, not noise — four workspaces at the same depth are one expansion conversation.",
    },
    {
      id: "cs-notion-2",
      tier: "hard",
      topic: "q5",
      universe: "growth",
      title: "The modal-month usage spine",
      brief:
        "Notion-flavored brief on the storefront db: the calendar view is drawn from the month spine, and the seasonality question is 'what does a typical month carry?'. Probed facts: the monthly trend runs 2024-01 to 2025-02 with 2024-01 the revenue peak (8 periods, 3,731.97) and 2024-07 the floor (8 periods, 1,193.86); four months carry the modal eight periods — 2024-01, 2024-03, 2024-05, 2024-07 — and the two-grain fold shows 8 periods can come from as few as 5 workspaces (January's intensity) or as many as 7 (March's spread). The spine is built in two stages: fold per month first, then filter the outer query to the modal size — never re-fold inside a WHERE.",
      ask: "Return the modal-size months with period count, distinct active workspaces and usage value — heaviest usage value first.",
      template:
        "SELECT month, periods, active_workspaces, revenue\nFROM (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS periods,\n         {2} AS active_workspaces,\n         ROUND(SUM(total), 2) AS revenue\n  FROM orders\n  GROUP BY SUBSTR(created_at, 1, 7)\n)\nWHERE periods = {1}\nORDER BY revenue {3};",
      slots: [
        {
          answer: "8",
          kind: "number",
          label: "the modal month size",
          why: "Eight is the modal month size — four months carry exactly 8 periods (2024-01, -03, -05, -07), so the equality filter keeps four rows and '8' appears in every row's periods cell. A 9 keeps only 2024-02 and 2024-09; a 7 keeps five other months.",
        },
        {
          answer: "COUNT(DISTINCT customer_id)",
          kind: "keyword",
          label: "the distinct-workspace fold",
          why: "The audience grain is distinct workspaces — January's 8 periods came from 5 workspaces, March's 8 from 7. Plain COUNT(customer_id) counts period rows (every FK is non-NULL) and the column collapses into a copy of periods; SUM of the id is a meaningless fold.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-month-first direction",
          why: "The seasonality read opens on the revenue peak: 2024-01 at 3,731.97. ASC would open on 2024-07's 1,193.86 floor — the month the launch plan is least informed by.",
        },
      ],
      distractors: ["9", "7", "COUNT(customer_id)", "SUM(customer_id)", "ASC"],
      walkthrough:
        "Two stages, two grains, one spine. The inner fold groups 103 periods into 14 month buckets — STRFTIME-safe SUBSTR('%Y-%m' shape) so no two Januaries merge — counting periods and, separately, DISTINCT workspaces, because load and audience are different columns: January runs 8 periods from 5 workspaces (intensity 1.6) while March runs the same 8 from 7 (spread). The outer stage filters to the modal size — periods = 8 keeps exactly the four probed months — and orders by usage value descending: 2024-01 at 3,731.97, 2024-05 at 2,910.31, 2024-03 at 2,617.08, 2024-07 at 1,193.86, matching the probed trend row for row. The distractors each break differently: 9 and 7 select different (equally real) month sets and the 'typical month' claim dies; COUNT(customer_id) counts period rows and the audience column becomes a copy of the load column; SUM(customer_id) folds foreign keys into arithmetic nonsense; ASC opens the read on the floor month. The lesson under the lesson: stage the fold, then filter — a modal-month question asked inside one GROUP BY is where month spines go to die.",
    },
    {
      id: "cs-notion-3",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The cohort value census",
      brief:
        "Growth review memo: the board wants the cohort value census — for every team cohort, usage periods, distinct workspaces and usage value in one fold, with low-load cohorts cut from the read. Probed facts: EU carries 45 periods from 8 workspaces worth 15,089.23; APAC 37 from 5 worth 11,605.45; US 19 from 2 worth 7,286.16; LATAM just 2 periods from 1 workspace worth 852.44. The floor sits at 19 periods, so LATAM drops and every remaining cohort is at least two-workspace.",
      ask: "Return each cohort with its period count, distinct-workspace count and usage value — heaviest usage value first, cohorts below the period floor dropped.",
      template:
        "SELECT c.region AS cohort,\n       COUNT(*) AS periods,\n       {3} AS workspaces,\n       ROUND(SUM(o.total), 2) AS usage_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {2}\nORDER BY usage_value {1};",
      slots: [
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-cohort-first order",
          why: "The board opens on where the value lives: EU's 15,089.23 takes the first row. ASC would open on the US cohort's 7,286.16 and read like a triage list instead of a value census.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the cohort period floor",
          why: "Nineteen keeps EU (45), APAC (37) and US (19) — the US cohort itself sits exactly at the floor, which is why 19 appears as a result cell. A 20 floor amputates the US; a 2 floor lets LATAM's 2-period single workspace back in.",
        },
        {
          answer: "COUNT(DISTINCT o.customer_id)",
          kind: "keyword",
          label: "the distinct-workspace fold",
          why: "The audience grain is distinct workspaces: 8, 5, 2 against period counts 45, 37, 19. Plain COUNT(customer_id) counts period rows and collapses the column into a copy of the load column; SUM(customer_id) folds foreign keys into arithmetic noise.",
        },
      ],
      distractors: ["ASC", "20", "2", "COUNT(o.customer_id)", "SUM(o.customer_id)"],
      walkthrough:
        "One join, one fold, two grains, one floor. Periods join to workspaces and group by region; the HAVING floor at 19 keeps the three cohorts the board prices — EU 45 periods / 8 workspaces / 15,089.23, APAC 37 / 5 / 11,605.45, US 19 / 2 / 7,286.16 — while LATAM (2 periods, 852.44, one workspace) falls below the gate it exists to be gated by. The distinct-workspace fold is the two-grain move this kit drills: COUNT(DISTINCT customer_id) reads 8, 5, 2 where plain COUNT reads 45, 37, 19 — collapsing the census into a copy of the load column and hiding the intensity story (EU: 5.6 periods per workspace). The distractors each break differently: ASC inverts the board and opens on the lightest cohort; a 20 floor drops the US cohort sitting exactly at 19; a 2 floor reads as no floor at all; COUNT(customer_id) erases the audience grain; SUM(customer_id) prints foreign-key noise. The lesson under the lesson: a cohort census is load AND audience — a board that ships only COUNT(*) cannot tell depth from spread.",
    },
    {
      id: "cs-notion-4",
      tier: "medium",
      topic: "s6",
      universe: "month-close",
      title: "The settlement classifier",
      brief:
        "Month-close memo: classify all 28 seat bills — each invoice labeled none, partial or exact from the payment rows behind it, with its dollar value beside it. Probed facts: 21 bills settle exact (65,612 total), 1 settles partial (4,000 paid against a 6,148 bill), 6 carry no settlement rows at all (15,217) — and bill #28 is marked paid with zero settlement rows while void bill #11 is fully paid at 925.00. Status is a claim; the coverage column reads the ledger.",
      ask: "Return every seat bill with its dollar value, status and settlement class — invoice id order, class derived from the payment rows.",
      template:
        "SELECT i.id AS invoice_id,\n       ROUND(i.amount_cents / {4}, 2) AS billed_dollars,\n       i.status,\n       CASE\n         WHEN COUNT(p.id) = 0 THEN {1}\n         WHEN SUM(p.amount_cents) < i.amount_cents THEN {2}\n         ELSE 'exact'\n       END AS coverage\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nGROUP BY i.id\nORDER BY i.id {3};",
      slots: [
        {
          answer: "'none'",
          kind: "keyword",
          label: "the never-settled class label",
          why: "Six bills have zero payment rows — COUNT(p.id) = 0 catches exactly them, including paid-status #28 whose claim no settlement backs. 'exact' here would erase the entire dunning list from the report.",
        },
        {
          answer: "'partial'",
          kind: "keyword",
          label: "the underpaid class label",
          why: "One bill (#25, 6,148) has a payment that does not cover it — SUM < billed. 'void' would mislabel the row as a status value and the class column would stop being a settlement read.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the invoice-id report order",
          why: "The close walks bills in id order so the classifier's rows reconcile line-by-line against the invoice register. DESC scrambles that walk and makes the eyeball diff against the register an exercise in patience.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "INTEGER cents divide by 100.0 — the .0 promotes real division. The divisor itself never appears in the result cells, but 4,937.00 printing as 4,937 is the bug it prevents.",
        },
      ],
      distractors: ["'exact'", "'void'", "COUNT(*)", "DESC"],
      walkthrough:
        "A CASE that reads the ledger instead of the claim. The LEFT JOIN keeps all 28 bills — 22 with settlement rows, 6 with NULL payloads — and folds per invoice: COUNT(p.id) = 0 flags the never-settled six (18, 21, 24, 26, 27 and the paid-status ghost #28), SUM(p.amount_cents) < billed flags the one partial (#25, 4,000 of 6,148), and the ELSE catches 21 exact settlements — including void #11, fully paid at 925.00, which is exactly why the anomaly list is row-level and status-blind. The classes sum back to the base: 21 + 1 + 6 = 28, or the CASE leaks. The distractors each break differently: 'exact' in the none-branch erases the dunning list; 'void' turns the class column into a status echo; COUNT(*) prints payment-row counts (0, 1, 2) as if they were classes; DESC breaks the id-ordered walk against the register. The lesson under the lesson: coverage is derived from payment rows, never from the status column — and 65,612 + 6,148 + 15,217 reconciles the whole book.",
    },
    {
      id: "cs-notion-5",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The month-over-month usage walk",
      brief:
        "Growth deck memo: the month-over-month usage walk for the seasonality slide — every month on the spine with its value and the delta against the month before. Probed facts: the spine runs 2024-01 (8 periods, 3,731.97) to 2025-02 (7 periods, 2,390.53); the largest drop is 2024-11 at -1,326.87 against 2024-10, the largest lift +1,158.21 as 2024-08 rebounds off the 1,193.86 July floor. The first row's delta is NULL by definition — no prior month exists to differ from.",
      ask: "Return the 14-month spine with period counts, usage values and month-over-month deltas — calendar order, first delta NULL.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, {2}) AS month,\n         COUNT(*) AS periods,\n         ROUND(SUM(total), {3}) AS usage_value\n  FROM orders\n  GROUP BY month\n)\nSELECT month, periods, usage_value,\n       ROUND(usage_value - {4}(usage_value, {1}) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month;",
      slots: [
        {
          answer: "1",
          kind: "number",
          noVerify: true,
          label: "the LAG look-back distance",
          why: "Month-over-month means one row back: LAG(x, 1). The offset never appears as a result cell, but a 2 silently re-points every delta at two months ago and the seasonality story changes shape.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the month-bucket width",
          why: "SUBSTR(..., 1, 7) keeps '2024-01' — year plus month, 14 distinct buckets. Six characters collapse to one '2024-0' bucket; eight keep a trailing dash and split nothing usefully. The 7 shows up as a period-count cell on the spine itself.",
        },
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value rounding digits",
          why: "ROUND(..., 2) matches the probed spine cells — 3,731.97, 1,193.86 — and keeps deltas honest to the cent. The digit count is display policy, not a result value.",
        },
        {
          answer: "LAG",
          kind: "keyword",
          label: "the look-back window function",
          why: "Delta against the PRIOR month is LAG. LEAD looks forward and flips the sign of every delta; ROW_NUMBER ranks instead of looking back and cannot subtract a prior value at all.",
        },
      ],
      distractors: ["LEAD", "ROW_NUMBER", "0"],
      walkthrough:
        "Stage the spine, then look back. The CTE folds 103 periods into 14 month buckets — SUBSTR at width 7 so no two Januaries merge — and the outer query subtracts the prior row's value: 2024-01 carries NULL (no prior month — report it as baseline, never coalesce to zero), 2024-02 drops -122.33, and the walk bottoms at the July floor 1,193.86 before 2024-08 lifts +1,158.21 and 2024-11 falls -1,326.87, the largest single drop on the spine. The distractors each break differently: LEAD flips every delta to next-month-minus-current — the same walk wearing a minus sign; ROW_NUMBER(usage_value, 1) is a ranker handed lookup arguments and errors out; offset 0 makes every month its own baseline and the walk flatlines; width 6 merges all 14 buckets into one '2024-0' row; ROUND at 0 floors the values and the cents vanish. The lesson under the lesson: a MoM walk is staged fold + LAG + named NULL policy — one SELECT trying to do all three is where the pipeline order bites.",
    },
    {
      id: "cs-notion-6",
      tier: "easy",
      topic: "j5",
      universe: "month-close",
      title: "The dunning anti-join",
      brief:
        "Billing memo: the dunning list — every seat bill with no settlement rows behind it, whatever its status claims. Probed facts: 6 bills worth 15,217 in total: #24 (open, 4,937.00), #26 (open, 3,562.00), #27 (open, 2,794.00), #28 (paid, 1,756.00), #21 (open, 1,295.00), #18 (open, 873.00). Bill #28 is the mirror-mode anomaly — claimed paid with zero payments — and it lands on this list precisely because payment rows, not the status column, decide membership.",
      ask: "Return the never-settled bills with status and dollar value — largest balance first.",
      template:
        "SELECT i.id AS invoice_id,\n       i.status,\n       ROUND(i.amount_cents / {2}, 2) AS billed_dollars\nFROM invoices i\nLEFT JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {1}\nORDER BY billed_dollars {3};",
      slots: [
        {
          answer: "NULL",
          kind: "keyword",
          label: "the anti-join survival predicate",
          why: "IS NULL keeps exactly the bills whose join found no payment — the anti-join survival rule. NOT NULL returns the settled side (27 payment matches, split bills twice); nothing else is the dunning list.",
        },
        {
          answer: "100.0",
          kind: "number",
          noVerify: true,
          label: "the cents-to-dollars divisor",
          why: "INTEGER cents ÷ 100.0 promotes real division — the .0 is the fix. The divisor never appears in the result cells; without it, 4,937.00 prints as 4,937 and cents quietly vanish.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the largest-balance-first order",
          why: "Collections work top-down: #24 at 4,937.00 first, #18 at 873.00 last. ASC buries the biggest exposure at the bottom of the list the team is working through.",
        },
      ],
      distractors: ["NOT NULL", "=", "ASC"],
      walkthrough:
        "The anti-join in its purest form: bills LEFT JOIN payments, keep the rows where no payment exists. Six survive — 24, 26, 27, 28, 21, 18 in id order, worth 15,217 together — and they arrive sorted by balance: 4,937.00, 3,562.00, 2,794.00, 1,756.00, 1,295.00, 873.00. Bill #28 sits here with status 'paid': the claim says settled, the absence of settlement rows says otherwise, and this query is the mirror of the void-but-paid #11 (925.00) that can never appear on a no-payment list. The distractors each break differently: NOT NULL flips to the settled side and returns 27 payment rows — split bills appearing twice, fan-out included; '=' is a syntax error after IS; ASC opens the dunning queue on the smallest balance. The lesson under the lesson: the survival rule IS the query — and a confident six-row list is only as honest as the LEFT JOIN that kept it.",
    },
  ],

  problems: [
    { slug: "feature-adoption-windows", why: "A tagged Notion row — adoption windows measure the gap between workspace creation and sustained use: the time-to-activation read (2.98-day average, 2-to-4 range) at query shape." },
    { slug: "plan-migration-paths", why: "A tagged Notion row — LAG over a workspace's state history to find free-to-paid transition paths: the plan-migration funnel PLG teams price expansion on." },
    { slug: "unique-orders-and-customers-per-month", why: "Monthly census at two grains: usage periods AND workspaces active per month — load versus audience in one query, the way the growth review opens." },
    { slug: "immediate-food-delivery-ii", why: "A conditional-count ratio where the denominator is the whole test — the activation-rate question in textbook clothing: 52 of 103 periods, not 52 of 89 engaged." },
    { slug: "percentage-of-users-attended-a-contest", why: "Reach share across workspaces — the percentage of workspaces a template launch touched, with the 100.0-before-division fix this kit drills." },
    { slug: "number-of-accounts-that-did-not-stream", why: "The silent-workspace anti-join — workspaces with zero usage. On this db the honest answer is 0, and proving a confident zero is the analyst's job." },
    { slug: "customers-who-never-order", why: "The anti-join grammar itself: LEFT JOIN + IS NULL as a survival rule — the exact shape of the dormancy list, drilled until it's reflex." },
    { slug: "find-the-team-size", why: "Seat-count per workspace — the two-grain fold that turns usage depth into seat expansion: depth per workspace against workspaces per cohort." },
    { slug: "active-users", why: "Weekly active workspaces — the stickiness read (periods per workspace per week) that separates broadening growth from deepening growth." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the vocabulary check before the expansion board ships, with the four-way tie at 4 periods named out loud." },
    { slug: "the-latest-login-in-2020", why: "Last-touch per workspace — the most-recent-usage read growth uses to build the dormancy watchlist before churn happens." },
    { slug: "new-users-daily-count", why: "First-event daily counts — the signup-to-first-use spine: which days produce workspaces that actually activate, not just register." },
    { slug: "bank-account-summary-ii", why: "Per-workspace debit/credit folds with NULL-safe arms — the seat-billing rollup the dunning cycle runs on, in INTEGER cents." },
    { slug: "combine-two-tables", why: "Workspace enrichment LEFT JOIN — plan and cohort attributes attached to every usage period, NULL-safe for rows the product hasn't touched." },
    { slug: "biggest-window-between-events", why: "Gaps between workspace events — the LEAD-based dormancy detector: which workspaces' usage is spacing out before they stop entirely." },
    { slug: "article-views-ii", why: "Above-threshold content folds — the template-gallery HAVING gate: which templates clear the usage floor to stay featured." },
    { slug: "movie-rating", why: "Earliest-event selection with a tie-broken fold — the first-touch read: which workspace touched a template first, ranked and de-duplicated without fanning out." },
    { slug: "user-activity-for-the-past-30-days-ii", why: "Windowed activity frames — the trailing-30-day active read PLG dashboards pin their funnels to, with the latest window winning the tie." },
    { slug: "reported-posts", why: "Conditional-count censuses by day — the flag-rate fold the trust workflow runs, shaped exactly like the churn-share read (7 of 103)." },
    { slug: "number-of-rich-customers", why: "HAVING-gated group lists — the expansion-qualified workspace census (ladder tops 24, 17, 14, 13) at query shape." },
    { slug: "queries-quality-and-percentage", why: "Ratio columns with quality weighting — rating-share queries mirror the value-share reads (EU's 15,089.23 of the 34,833.28 platform total)." },
    { slug: "average-time-of-process-per-machine", why: "Per-entity latency averages — the activation-latency read (2.98 days, 2-to-4 range) as a per-workspace rollup instead of a platform scalar." },
    { slug: "classes-more-than-5-students", why: "Simple HAVING floors — the template-featured gate: which families clear the usage bar to stay in the gallery, with the between-values trap named." },
    { slug: "list-the-products-ordered-in-a-period", why: "Period-bounded folds — the month-scoped template census (2024-01 opens at 8 periods and 3,731.97) at query shape, boundaries half-open." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "Top-of-ladder selection — the deepest workspace (24 periods) picked by fold and named tie policy, not by eyeball." },
    { slug: "products-worth-over-invoices", why: "Cross-table threshold comparisons — usage value against the seat-bill book, the two-sided money fold billing owns at close." },
    { slug: "email-engagement-funnel", why: "Step-by-step funnel rates — signup-to-activation arithmetic (52 of 103) written as a staged funnel fold with every denominator named." },
    { slug: "funnel-step-conversion", why: "Stage-to-stage conversion — the activation ladder (delivered 52, shipped 30, pending 14, cancelled 7) as drop-off math between adjacent states." },
    { slug: "growth-accounting", why: "Quick-ratio style movement — new, resurrected and churned workspaces in one pass: the expansion-versus-churn ledger growth reviews on Mondays." },
    { slug: "week-over-week-churn", why: "Weekly churn deltas — the cohort read that keeps APAC's 8.1% cancel share honest over time instead of as a one-period snapshot." },
    { slug: "null-blank-audit", why: "NULL and blank sweeps — the data-quality pass that flags a paid bill with zero settlement rows (#28, 1,756.00) before finance does." },
    { slug: "ab-test-conversion-lift", why: "Lift arithmetic on split populations — the template-launch read: did the featured gallery actually move activation, or just volume?" },
  ],
};
