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
  ],

  dayInLife: [
    "**08:30 —** The morning starts on activation health. A product analyst opens the funnel dashboard before the growth standup: did last night's onboarded cohort cross the activation threshold, does the {emerald:activated} count (52 of 103) reconcile with what seat billing invoiced, and did any team cohort's churn share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — activation counts versus the seat-billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:00 —** Midday is expansion surgery. The growth review wants the depth ladder refreshed — usage periods grouped per workspace, ranked busiest-first with the tie policy in the comment: 24, 17, 14, 13, then the quartet sharing rank 6 at 4 periods each. An account lead wants the two-grain census re-cut (EU: 45 periods from 8 workspaces — intensity 5.6); a template owner wants uses and usage value side by side, because 'the gallery is popular' means nothing until uses price into value. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**15:00 —** The afternoon tilts toward the template gallery and stakeholder cycles. The gallery review walks the template table with SQL attached to every bar — which families log the most uses, which carry the most usage value, where the mid-price band (8 templates averaging 111.5) sits against the budget band (8 at 32.06); the billing desk walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected — and asks the only question that matters at close: *do the classes sum back to the invoice base?* This is the hour usage numbers meet the people who convert them into seats.",
    "**17:30 —** End of day is the writeup that keeps tomorrow's numbers defensible. The dormancy query ships with its survival rule in the comment (workspaces whose join finds no recent period ARE the churn-risk list); the anomaly log carries both mirror modes — the seat bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the void bill with one (#11, 925.00); and tomorrow's follow-ups are queued per workspace. The rhythm to internalize: Notion SQL exists to prove that activation and billing agree — *the usage period and the seat invoice are the same story told at two grains.*",
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
  ],
};
