// Canva — kit 14 of the SaaS & Enterprise domain (Batch L, wave 7).
// Design-SaaS SQL: the storefront db read as a design-team ledger —
// customers are design teams, orders are design cycles (delivered =
// published, shipped = exported and awaiting review, pending = still
// drafting, cancelled = abandoned), shipped_at = the publish/export stamp,
// order_items = template-use lines, products = template SKUs (price =
// pro-tier list), suppliers = content partners, regions = team cohorts.
// Invoices/payments are team billings in INTEGER cents (/100.0). Angle:
// template adoption, team collaboration depth, education-vs-pro tiers,
// engagement depth.
// Pool provenance: Canva carries 0 tagged pool rows in company-pools.md —
// all 46 sql slugs in this kit (30 topic + 16 problem) are theme-curated
// from the theme menu (the menu's ltv-cac-payback row does carry a Canva
// tag — it leads the problem list) and say so. Case briefs quote probed
// figures from scripts/company-facts.md (probed 2026-10-12), re-probed per
// slot against db/custom.db; every case slot is mechanically verified by
// scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const canvaKit: CompanyKit = {
  id: "canva",
  domainId: "saas",
  name: "Canva",
  tagline: "Design SaaS: teams, templates and usage",
  accent: "text-fuchsia-300",

  brief: [
    "**Canva** is design SaaS at consumer scale: templates that pull teams in, collaboration that keeps them, and usage that either deepens or goes dark. The analytics reality is the *adoption ledger* — which teams keep publishing, which templates actually get used, and which drafts silently die. On this storefront db the mapping is honest: 16 design teams generate 103 design cycles folded from 251 template-use lines, worth 34,833.28 of billed value at a 338.19 average. The engagement mix reads like the adoption funnel it is — 52 {emerald:published} (50.5%), 30 exported-awaiting-review (29.1%), 14 {amber:still drafting} (13.6%), 7 {rose:abandoned} (6.8%).",
    "The data org splits three ways. Adoption analytics owns the template fold: the top family logs **97 uses** worth 11,744.01, the broadest family's lines touch 54 distinct cycles — gallery decisions price on that census. Growth owns engagement depth: the cycle ladder runs 24, 17, 14, 13 deep before a four-way tie at 4, and **63.5%** of billed value sits above the 3,000 line — the expansion cohort every board deck prices. Monetization owns the tier ladder: 8 education-friendly templates average 32.06, 8 pro templates average 111.5, and the premium band above 200 is empty — the catalog ceiling is 199.99, so tier memos state the ceiling honestly. Billing owns the team book: 28 `invoices` against 27 `payments`, INTEGER cents throughout, with 6 never-settled bills worth 15,217 — one of them (#28, 1,756.00) claims {emerald:paid} with zero settlement rows behind it.",
    "Interview style is census-then-denominator, then the template join. A screen opens with a two-grain census (EU carries 45 design cycles from just 8 teams; the US, 19 from 2), escalates into a conditional-count publish rate with the denominator asked out loud ('do {rose:abandoned} cycles sit in your base?'), then the family board — where uses and uses-times-list-price must both appear, because 'the gallery is popular' means nothing until uses price into value. Follow-ups probe the month spine (2024-01 opens at 8 cycles and **3,731.97** of billed value; 2024-07 floors at 1,193.86) and the cents rule on every team bill.",
    "Preparation strategy: the pools carry **0 tagged rows for Canva** — every one of this kit's 46 slugs is theme-curated to known design-SaaS screens: two-grain team censuses, template-family folds, adoption floors, tier banding and team-billing reconciliation. Then run both case studies on the live db: one rebuilds the template-variety board the growth review runs on Mondays, the other rebuilds the one-pass family census the catalog review is drawn from. The bar to clear: state the **denominator**, the join's survival rule, and the **cents rule** before you compute anything.",
  ],

  dayInLife: [
    "**08:40 —** The morning starts on adoption health. A product analyst opens the gallery dashboard before the growth standup: did last night's exported cohort clear its review queue, does the {emerald:published} count (52 of 103) reconcile with what team billing invoiced, and did any cohort's abandon share cross its band — APAC's 8.1% is the one to watch? The first query is almost always a reconciliation — publish counts versus the billing snapshot, `orders` against `invoices` at two grains — and the two numbers must agree or the standup starts with an incident.",
    "**11:30 —** Midday is template surgery. The gallery review wants the family board refreshed — use lines folded from `order_items`, uses and uses-times-list-price side by side, gated to real adoption floors and ranked heaviest-first: the crown family at **97 uses / 11,744.01**, the broadest touching 54 distinct cycles. A regional lead wants the two-grain census re-cut (EU: 45 cycles from 8 teams — intensity 5.6); a catalog owner wants variety and volume separated, because 'the team is busy' means nothing until lines split into distinct templates. *Every ask is a join, a conditional aggregate and one stated denominator.*",
    "**16:15 —** The afternoon tilts toward the tier memo and the writeup that keeps tomorrow's numbers defensible. The education-vs-pro review walks the price ladder — 8 budget templates at 32.06 average against 8 pro templates at 111.5, with the honest sentence that nothing prices above the 199.99 ceiling — and billing close walks settlement — 21 exact, 1 partial at 4,000 of 6,148, 6 never-collected worth 15,217 — asking *do the classes sum back to the invoice base?* The anomaly log carries both mirror modes — the bill claimed {emerald:paid} with no settlement (#28, 1,756.00) and the {rose:void} bill with one (#11, 925.00) — and the ledger tie prints 181,080 = 181,080. The rhythm to internalize: Canva SQL exists to prove that adoption, engagement and billing agree — *the template-use line and the team invoice are the same story told at two grains.*",
  ],

  metrics: [
    { name: "Publish rate", what: "Published ÷ ALL design cycles: 52 of 103 (50.5%). The denominator is the interview — 52 of 89 engaged cycles is a different metric with a different name." },
    { name: "Template adoption crown", what: "Use lines joined to the catalog: the top family logs 97 uses worth 11,744.01; the broadest family's lines touch 54 distinct cycles. Gallery decisions price on this fold." },
    { name: "Two-grain team census", what: "Cycles AND teams per cohort — EU 45 from 8, APAC 37 from 5, US 19 from 2, LATAM 2 from 1. Load versus audience in one query." },
    { name: "Time-to-publish", what: "Days from cycle start to publish/export stamp: 82 of 103 cycles stamped, avg 2.98, range 2-to-4 — US cohort slowest at 3.07, APAC fastest at 2.93." },
    { name: "Engagement-depth ladder", what: "Cycles per team: 24, 17, 14, 13, 5, then four teams tied at 4. Depth is the adoption pipeline — the ladder growth reviews every Monday." },
    { name: "Design-value concentration", what: "Share of billed value from the deepest teams: 63.5% above the 3,000 line, 71.2% above 2,000. Where seat-expansion revenue actually lives." },
    { name: "Education-vs-pro tier ladder", what: "8 budget templates average 32.06; 8 pro templates average 111.5; the premium band above 200 is empty at the 199.99 ceiling. Tier memos state the void honestly." },
    { name: "Unsettled team AR", what: "Bills with no payment rows: 6 worth 15,217 — one of them (#28, 1,756.00) claims paid with zero settlements. The anti-join the dunning cycle runs on." },
  ],

  topics: [
    {
      name: "Adoption censuses & floors",
      why: "Every Canva screen opens with a fold: use lines, design cycles, teams — grouped, counted and gated without letting the grain blur. COUNT(*) counts lines, COUNT(DISTINCT customer_id) counts teams; 251 lines come from just 103 cycles across 16 teams, and HAVING floors decide which families or teams are 'real adoption'.",
      slugs: ["article-views-ii", "classes-more-than-5-students", "activity-participants"],
    },
    {
      name: "Publish-rate conditional counts",
      why: "Published, exported, drafting, abandoned — every rate here is a conditional count over an engagement state, and the interviewer's first question is 'what's in the denominator?'. SUM(CASE WHEN status …) over ALL cycles, with the 100.0 before the division, is the shape that survives scrutiny.",
      slugs: ["immediate-food-delivery-i", "friend-requests-i-overall-acceptance-rate", "get-highest-answer-rate-question"],
    },
    {
      name: "Joining teams to design cycles",
      why: "Design cycles inherit team attributes through joins to the teams table, and the join type decides who survives: a cycle with no team is corruption; a team with no cycle is an idle seat. Choosing INNER versus LEFT is a business statement about the installed base.",
      slugs: ["combine-two-tables", "top-travellers", "product-sales-analysis-i"],
    },
    {
      name: "Per-template value folds",
      why: "Use lines carry template SKUs and list prices, and the gallery story is a join-then-weigh fold: quantity × unit_price per line, the top family logging 97 uses worth 11,744.01. The per-family census is what gets a template featured, repriced or retired.",
      slugs: ["product-sales-analysis-iii", "products-worth-over-invoices", "average-selling-price"],
    },
    {
      name: "The design calendar",
      why: "Design activity is calendar arithmetic: STRFTIME('%Y-%m') buckets over cycles against the 3,731.97 peak and the 1,193.86 floor. Canva drills the month-bucket idiom because every launch chart hangs on that spine — and a '%m'-without-year fold merges two Januaries into one lie.",
      slugs: ["monthly-transactions-i", "user-activity-for-the-past-30-days-i", "the-latest-login-in-2020"],
    },
    {
      name: "Engagement depth & variety",
      why: "Collaboration is a two-sided read: cycles per team (depth) against distinct templates per team (variety). The shapes here — lines per cycle, templates per team, depth-versus-breadth ratios — separate the teams that deep-dive one template from the teams exploring the whole gallery.",
      slugs: ["students-and-examinations", "find-the-team-size", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Dormant teams & abandoned drafts",
      why: "Silence reads are anti-joins: teams with no recent cycle, team bills with no payments (6 on this db). On this db the never-used-team anti-join returns 0 — and proving a confident zero is the job. The survival rule of the join IS the query.",
      slugs: ["customer-who-visited-but-did-not-transact", "customers-who-never-order", "dormant-reactivation"],
    },
    {
      name: "Adoption leaderboards & tie policy",
      why: "Growth boards rank teams by cycle depth and templates by uses, and ties are real: four teams sit at exactly 4 cycles. RANK and friends are a business decision about shared rungs, not syntax trivia — every board ships with its tie policy named.",
      slugs: ["rank-scores", "top-earners", "compute-the-rank-as-a-percentage"],
    },
    {
      name: "Education-vs-pro tiering",
      why: "The catalog splits into education-friendly and pro tiers by price, and every tier memo is a CASE band with the boundaries stated out loud. The honest wrinkle: the premium band above 200 is empty — the ceiling is 199.99 — so tiering work is about proving a band's void, not inventing one.",
      slugs: ["the-category-of-each-member-in-the-store", "the-winner-university", "calculate-special-bonus"],
    },
    {
      name: "Team billing & cents discipline",
      why: "Design usage is not revenue until the team book closes: 28 invoices against 27 payments, INTEGER cents throughout, coverage classified exact / partial / none. The billing join is where design-SaaS interviews land — and where the cents rule (`/ 100.0`) gets graded.",
      slugs: ["bank-account-summary-ii", "ar-aging-schedule", "account-balance"],
    },
  ],

  theory: [
    {
      id: "canva-t1",
      q: "Your dormant-teams report joins design teams to their design cycles. When do you INNER and when do you LEFT — and what silently breaks if you filter a cycle column in WHERE after the LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An activity report joins cycles to teams: a cycle with no team is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormancy report must be LEFT from teams: the teams with no recent cycles ARE the finding — a seat that stopped publishing is the churn signal — arriving with NULL cycle columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload team row — the LEFT JOIN quietly became an INNER and the dormant teams vanished. The fix is moving the predicate into ON or an outer query. On this db the never-used anti-join returns zero, and proving a confident zero is itself the analyst's job.",
      tag: "joins",
    },
    {
      id: "canva-t2",
      q: "The adoption census shows 251 template-use lines, 103 design cycles and 16 teams. Why do those counts disagree and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) over the joined lines counts template-use lines — 251; COUNT(DISTINCT o.id) folds them back to design cycles — 103; COUNT(DISTINCT customer_id) folds further to teams — 16. None is wrong: lines measure gallery-touch volume, cycles measure the collaboration calendar, teams measure the installed base. The ratios are the reads — 2.4 lines per cycle, 6.4 cycles per team — and they decide whether growth is broadening (more teams) or deepening (more design per team), which is THE design-SaaS question. The trap that catches candidates is quoting a line count as a cycle count in a trend; one cycle with three template lines is one collaboration row, not three. Saying 'one row per what?' for every COUNT is the habit the interviewer grades.",
      tag: "aggregation",
    },
    {
      id: "canva-t3",
      q: "The gallery review wants template families with at least fifty uses. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The engagement-state rule is a row-level fact — status = 'delivered' discards drafting and abandoned cycles before any fold, in WHERE; putting it in HAVING is impossible because states no longer exist once rows are grouped. The fifty-use floor is a group-level fact — HAVING SUM(quantity) >= 50 after GROUP BY; putting it in WHERE errors because SUM does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between an adoption-qualified board and an error, and between a threshold applied to lines versus to uses. On this db six of seven families clear a 53-use floor — only Fitness, at 27 uses, falls below. The strong answer places every filter by asking: is this a fact about one use line, or about a family's whole fold?",
      tag: "pipeline",
    },
    {
      id: "canva-t4",
      q: "You rank templates by total uses and three of them tie at exactly 30. RANK, DENSE_RANK or ROW_NUMBER for the gallery board — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied templates the same rank and skips — the trio at 30 uses shares one rung, and the next distinct use count skips ahead by three, implying phantom templates that do not exist. DENSE_RANK shares rungs without gaps — the tie reads as three consecutive rows at one rank and the next distinct count follows immediately. ROW_NUMBER splits ties arbitrarily, which silently decides which template gets the gallery feature slot first. On this db the tie is structural — the units ladder runs 47, 46, 38, then a pair at 36 and a trio at 30. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer templates, or an explicitly named tie-breaker — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "canva-t5",
      q: "A design cycle is still drafting with no publish stamp yet. What is your NULL policy for the time-to-publish report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped cycles have a publish latency, so the report measures the stamped population and says so — on this db 82 of 103 cycles carry a stamp (52 published plus 30 exported-awaiting-review), averaging 2.98 days from start to stamp, range 2 to 4; 14 are still drafting, 7 abandoned. Then mechanics: AVG ignores NULLs, so AVG over ALL cycles returns the stamped-only average with a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) IS the unstamped backlog, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that publishes instant design for cycles still drafting, and an engagement report built that way is a lie with decimals.",
      tag: "nulls",
    },
    {
      id: "canva-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average screen silently returns nothing while looking valid. On the full table that is theoretical: 103 cycles always produce the 338.19 average. On filtered staging tables — one cohort, one template family, one month — the empty-inner-query bug ships regularly, and the above-average filter is exactly how it hides. The correlated cousin (compare each cycle to ITS team's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "canva-t7",
      q: "The adoption trend buckets design cycles by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; SUBSTR to month-only would merge January 2024 with January 2025 and the launch curve becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's publishes, and month-end is exactly when template launches land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first delta is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month in an adoption walk. The spine's headline is probed: 2024-01 opens at 8 cycles and 3,731.97 of billed value.",
      tag: "dates",
    },
    {
      id: "canva-t8",
      q: "The billing desk says a paid team invoice has no settlement rows behind it. Walk me through the reconciliation query you write first — and the money-handling rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 bills worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why the payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void bill WITH a payment row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1756 and quietly eats cents on every odd-cent bill. Reconciliation culture: counts and sums must agree between the adoption ledger and the team book — the trial balance ties 181,080 to 181,080 — and when they do not, the query that shows WHICH rows disagree is the deliverable.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "canva-mcq-1",
      prompt: "A design cycle's status column reads 'shipped'. In this kit's adoption funnel, what is it?",
      choices: ["Published to the team", "Exported — awaiting review", "Still drafting", "Abandoned"],
      answer: 1,
      why: "The funnel map is fixed: delivered = published (52 of 103 cycles), shipped = exported with the stamp already applied, awaiting review (30), pending = still drafting (14), cancelled = abandoned (7). 'Shipped' is the exported-but-unreviewed state — the work exists and carries a stamp, but the team hasn't signed off.",
      notes: [
        { choice: 0, why: "Published is 'delivered' — 52 cycles. Counting exported-unreviewed as published inflates every adoption number on the board." },
        { choice: 2, why: "Drafting is 'pending' — 14 cycles that carry NO stamp. Exported-awaiting-review is a different, later stage; confusing them corrupts the time-to-publish denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-2",
      prompt: "Publish rate is defined as published ÷ which population? The db holds 52 published and 7 abandoned of 103 design cycles.",
      choices: ["Published + abandoned only (52/59 = 88.1%)", "All design cycles (52/103 = 50.5%)", "Exported cycles only", "Distinct teams (52/16)"],
      answer: 1,
      why: "The house definition: published ÷ ALL cycles, drafting and exported included in the denominator. 50.5% is the honest read; every other denominator computes a real but differently-named metric.",
      notes: [
        { choice: 0, why: "That's the RESOLVED-funnel publish rate — a legitimate separate metric, but calling it 'the publish rate' inflates 50.5% to 88.1% by quietly deleting 14 drafts and 30 exported cycles. Name the denominator or the number is a claim, not a metric." },
        { choice: 3, why: "52/16 is published cycles per team — an intensity ratio, not a rate. Rates divide populations of the same grain." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-7",
      prompt: "The tier memo asks how many templates price in the premium band (200 and above). The catalog ceiling is the 199.99 template. What does the honest query return?",
      choices: ["8 — the pro band", "0 — the band is empty, and the memo must say so", "16 — all templates", "It errors — CASE cannot band an empty set"],
      answer: 1,
      why: "The premium band is genuinely empty: 8 education-friendly templates average 32.06, 8 pro templates average 111.5, and the priciest SKU stops at 199.99. Returning zero rows is the finding — the memo states the ceiling honestly instead of inventing a tier the catalog cannot staff.",
      notes: [
        { choice: 0, why: "The pro band (50 up to but not including 200) holds the 8 templates averaging 111.5 — but 'premium 200+' is a different band, and it holds nothing. Band boundaries are definitions; sliding them silently re-segments the catalog." },
        { choice: 3, why: "CASE bands an empty set just fine — it returns zero rows for that arm, which is exactly the honest answer. Expecting an error is how people convince themselves the band must exist." },
      ],
      difficulty: "easy",
    },
    {
      id: "canva-mcq-3",
      prompt: "EU carries 45 design cycles from 8 teams. Which column pair reports both grains?",
      choices: ["COUNT(*) and COUNT(customer_id)", "COUNT(*) and COUNT(DISTINCT customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 1,
      why: "COUNT(*) counts cycle rows (45); COUNT(DISTINCT customer_id) folds repeats back to teams (8). The gap between the columns — 5.6 cycles per team — is the intensity read that separates load from audience.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every cycle has a team. Without DISTINCT both columns read 45 and the census loses the spread story." },
        { choice: 3, why: "COUNT(DISTINCT region) counts cohorts, not teams — a third grain nobody asked for. The census is cycles AND teams." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to percentage-valued cycles", "It is cosmetic — moving it changes nothing"],
      answer: 1,
      why: "Without it, SUM/COUNT of two integers is integer division — every cohort's publish share truncates toward 0 and the whole funnel map reads as flat. The 100.0 multiplier forces real division first; on this db it is the difference between 50.5 and a displayed 50.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step, and it happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates first, then scales — 0.505 became 0 at the fold. Order of operations is the metric." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-5",
      prompt: "Keep only template families with at least 53 total uses (uses = SUM of line quantities). Where does the threshold live?",
      choices: ["WHERE SUM(quantity) >= 53, before GROUP BY", "GROUP BY category HAVING SUM(quantity) >= 53", "WHERE uses >= 53 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A uses floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db six of seven families clear the 53-use bar — only Fitness, at 27 uses, falls below — and 53 lands exactly on Wearables' own uses cell.",
      notes: [
        { choice: 0, why: "SUM(quantity) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline order teaching itself." },
        { choice: 2, why: "There is no 'uses' column on the raw table — the fold only materializes at GROUP BY. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-6",
      prompt: "A team invoice row reads amount_cents = 175600. Which expression prints its dollar value?",
      choices: ["amount_cents / 100", "ROUND(amount_cents / 100.0, 2)", "amount_cents * 100", "ROUND(amount_cents, 2)"],
      answer: 1,
      why: "INTEGER cents ÷ 100.0 promotes to real arithmetic: 1,756.00 — the exact value on the infamous #28 bill. The .0 is the entire fix; integer ÷ integer truncates, and every odd-cent team bill leaks its cents into the floor.",
      notes: [
        { choice: 0, why: "175600 / 100 is integer division = 1756 — on round-dollar bills the bug hides; the first odd-cent row exposes it. Promote before you divide." },
        { choice: 2, why: "Multiplying gives 17,560,000 — units inverted. Sanity-check magnitude: dollars are smaller than cents." },
      ],
      difficulty: "medium",
    },
    {
      id: "canva-mcq-8",
      prompt: "One query must return, per template family: total uses AND published uses. Why is SUM(quantity) FILTER (WHERE status = 'delivered') the right tool instead of WHERE status = 'delivered'?",
      choices: ["FILTER is just faster syntax for the same thing", "WHERE filters rows before the fold — total uses would collapse to published-only; FILTER conditional-aggregates inside one scan", "FILTER can only be used on TEXT columns", "They differ only when the table is empty"],
      answer: 1,
      why: "WHERE discards rows before GROUP BY, so every aggregate in the query would fold the published subset only — total uses becomes published uses and the census loses its denominator. FILTER (WHERE …) branches per aggregate inside one pass: total over all rows, published over delivered rows, one scan, two truths.",
      notes: [
        { choice: 0, why: "They are NOT the same thing — one filters the input rows for every aggregate, the other filters per aggregate. The whole one-pass census idiom lives in that difference." },
        { choice: 3, why: "The divergence shows on any table with mixed states — which is every real cycle table. The empty-table case is the least of it." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-9",
      prompt: "The template-variety board ranks teams by distinct templates used: the top two teams both show 15, the next shows 14. What rank does the 14-template team hold under RANK()?",
      choices: ["2", "3", "1", "Whatever ROW_NUMBER assigned it"],
      answer: 1,
      why: "RANK gives tied rows the same rank and skips: the pair at 15 shares rank 1, and the next distinct count lands at rank 3 — rank 2 is reserved for a 15-template team that doesn't exist. The shared rung and the gap are both the policy, not a bug.",
      notes: [
        { choice: 0, why: "Rank 2 would imply the pair split — that's ROW_NUMBER behavior, an arbitrary ordering of peers. If you use it, name the tie-breaker." },
        { choice: 2, why: "Rank 1 belongs only to tied rows AT the top count. Handing rank 1 to the 14-template team erases the tie and the gap in one move." },
      ],
      difficulty: "hard",
    },
    {
      id: "canva-mcq-10",
      prompt: "A teammate builds the monthly adoption trend with SUBSTR(created_at, 6, 2) AS month. The db spans 2024-01 to 2025-02. What does the chart show?",
      choices: ["A correct 14-bucket trend", "12 buckets — every January merged into one, every February merged into one", "14 buckets but sorted wrong", "An error — SUBSTR cannot parse timestamps"],
      answer: 1,
      why: "SUBSTR(created_at, 6, 2) grabs the two-digit month with no year: January 2024 (8 cycles, 3,731.97) and January 2025 (6 cycles, 1,669.50) collapse into one bucket. The spine must be '%Y-%m' — year plus zero-padded month — or the seasonality curve is fiction.",
      notes: [
        { choice: 0, why: "The db spans two calendar years — month-only bucketing silently merges same-month pairs. 14 real months compress to 12 fictional ones." },
        { choice: 3, why: "SUBSTR parses fine — that's the trap. The bug is semantic (lost year), not mechanical, so nothing errors and the chart just quietly lies." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-canva-1",
      tier: "medium",
      topic: "j7",
      universe: "growth",
      title: "The template-variety board",
      brief:
        "Canva-flavored brief on the storefront db: Monday's growth review opens with the template-variety board — every team with its design cycles, raw template-use lines, DISTINCT templates used and billed design value, gated to real adoption. Probed facts: 251 use lines fold into 103 design cycles across 16 teams worth 34,833.28; the cycle ladder runs 24, 17, 14, 13; the variety ladder is a different ranking — 15, 15, 14, 13 distinct templates for the top four, while Chloe Dubois runs 10 templates on just 5 cycles and Pedro Alvarez squeezes 11 into 4. The board gates at 10+ distinct templates so one-off experiments never set policy.",
      ask: "Return each qualifying team with its design cycles, template lines, distinct templates and design value — heaviest value first.",
      template:
        "SELECT c.name AS team,\n       COUNT({3} o.id) AS design_cycles,\n       COUNT(*) AS template_lines,\n       COUNT(DISTINCT oi.product_id) AS distinct_templates,\n       ROUND(SUM({4}), 2) AS design_value\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nJOIN order_items oi ON oi.order_id = o.id\nGROUP BY c.id, c.name\nHAVING COUNT(DISTINCT oi.product_id) >= {1}\nORDER BY design_value {2};",
      slots: [
        {
          answer: "10",
          kind: "number",
          label: "the variety floor",
          why: "The 10-template floor keeps exactly the six boards-qualified teams — Alice 15, Emma 15, Grace 14, Maya 13, Pedro 11, Chloe 10 — and 10 appears as Chloe's own distinct_templates cell. An 11 floor amputates Chloe; a 5 floor admits thirteen teams and the board becomes the whole account list.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The board ranks billed design value descending — 7,262.35 takes row 1. ASC would crown the smallest book (Olivia Brown's 444.80) as the top adopter and the expansion conversation would start from the wrong end of the ladder.",
        },
        {
          answer: "DISTINCT",
          kind: "keyword",
          label: "the distinct-cycle fold",
          why: "COUNT(*) and COUNT(ALL o.id) both count template-use lines — 50 for Alice — while COUNT(DISTINCT o.id) folds them back to the 24 design cycles that actually carried them. Dropping DISTINCT makes the two grains identical and the board loses its collaboration-cadence read.",
        },
        {
          answer: "oi.quantity * oi.unit_price",
          kind: "keyword",
          label: "the design-value fold",
          why: "Billed value is usage weighed by list price — quantity times unit_price per line, summed. Quantity alone prints raw units untethered from pricing; unit_price alone prints list-price sums that ignore how much of each template a team actually used.",
        },
      ],
      distractors: ["11", "5", "ASC", "ALL", "oi.quantity", "oi.unit_price"],
      walkthrough:
        "Two grains, one fold, one gate — with variety as the star column. Use lines join to cycles and to teams, fold per team, and the HAVING floor at 10 keeps six rows: Alice Chen (EU) at 24 distinct cycles but 50 raw lines and 15 templates for 7,262.35; Emma Wilson (US) at 17, 46, 15 for 6,640.56; Grace Kim (APAC) at 14, 34, 14 for 4,574.23; Maya Patel (APAC) at 13, 30, 13 for 3,644.56; Chloe Dubois (EU) at 5, 14, 10 for 2,667.93; Pedro Alvarez (EU) at 4, 13, 11 for 1,686.17. The read the board exists for: Pedro is the collage experimenter — 11 templates across only 4 cycles — while Maya runs 13 templates across 13 cycles, and Alice's 50-lines-versus-24-cycles gap (2.1 lines per cycle) is the fan-out intensity. Alice and Emma tie at 15 templates, so a ranked variant needs its tie policy named. The distractors each break differently: an 11 floor drops Chloe; a 5 floor floods the board; ASC crowns the 444.80 book; ALL makes cycles a copy of lines; quantity prints units as value; unit_price prints list sums untethered from usage. The lesson under the lesson: depth and variety are different adoption stories — a board that reports only one answers only half the growth question.",
    },
    {
      id: "cs-canva-2",
      tier: "hard",
      topic: "x2",
      universe: "catalog",
      title: "The one-pass template census",
      brief:
        "Canva-flavored brief on the storefront db: the catalog review needs a one-query census of template families — template lines, total uses, published uses and distinct teams — without folding four times and risking four drifting denominators. Probed facts: Audio is the crown family at 97 uses worth 11,744.01; Accessories is the workhorse at 121 uses; Fitness is the smallest at 27 uses. The review keeps families carrying at least 53 uses — a boundary that lands exactly on Wearables, the premium-list family whose ceiling SKU prices at 199.99.",
      ask: "Return each qualifying family with its template lines, total uses, published uses and distinct teams — heaviest use count first.",
      template:
        "SELECT p.category AS template_family,\n       COUNT(*) AS template_lines,\n       SUM(oi.quantity) AS uses,\n       SUM(oi.quantity) FILTER (WHERE o.status = {3}) AS published_uses,\n       COUNT(DISTINCT o.customer_id) AS teams\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nHAVING SUM(oi.quantity) >= {1}\nORDER BY uses {2};",
      slots: [
        {
          answer: "53",
          kind: "number",
          label: "the adoption floor",
          why: "The 53-use floor keeps six of the seven families and 53 appears as Wearables' own uses cell — the gate value shows up in the result. A 54 floor amputates Wearables too; a 27 floor admits all seven; a 61 floor keeps only the four heaviest.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the heaviest-first direction",
          why: "The census ranks families by total uses descending — Accessories at 121 takes row 1. ASC would open on Fitness's 27 uses and the catalog conversation would start from the smallest family on the shelf.",
        },
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the published-state marker",
          why: "Published is the delivered status — 52 of 103 cycles platform-wide. 'shipped' counts exported-awaiting-review as published and inflates every family by its review queue; 'cancelled' zeroes the column and the census loses its adoption read.",
        },
      ],
      distractors: ["54", "27", "61", "ASC", "'shipped'", "'cancelled'"],
      walkthrough:
        "One scan, many truths. Use lines join to cycles and to the catalog, fold per family, and FILTER (WHERE status = 'delivered') conditional-aggregates the published arm inside the same pass. The 53-use floor keeps six rows: Accessories 62 lines / 121 uses / 48 published / 14 teams, Audio 51 / 97 / 56 / 14, Electronics 44 / 85 / 40 / 12, Video 32 / 61 / 34 / 11, Apparel 24 / 54 / 30 / 10, Wearables 25 / 53 / 15 / 12 — Fitness gated out at 13 lines / 27 uses / 7 teams. The reads the review came for: Audio publishes the most (56 of 97) while Wearables — the premium-list family under the 199.99 ceiling — publishes just 15 of its 53 uses, and Accessories touches all 14 teams with the largest line count but only the second-largest published share. The distractors each break differently: 54 drops Wearables on the boundary, 27 re-admits Fitness, 61 halves the board, ASC opens on the smallest family, 'shipped' refiles review queues as published, 'cancelled' zeroes the arm. The lesson under the lesson: conditional aggregation is the census idiom — one scan, several denominators, and every arm's state named out loud.",
    },
  ],

  problems: [
    { slug: "ltv-cac-payback", why: "The theme menu tags this row Canva — LTV against CAC with payback months: the education-to-pro unit-economics question the monetization deck is built on." },
    { slug: "trial-to-paid-funnel", why: "Education-to-pro conversion counted conditionally with the denominator named — the upgrade funnel the tier ladder exists to price." },
    { slug: "funnel-step-conversion", why: "Funnel pivot with FIRST_VALUE — draft, export, publish step rates per team: the collaboration pipeline the growth review opens with." },
    { slug: "email-engagement-funnel", why: "Invite-to-collaboration funnel — team invites that convert to shared designs: the viral-loop read Canva's growth model runs on." },
    { slug: "growth-accounting", why: "LAG status pivot — new, retained, resurrected, churned teams month over month: the movement walk the board deck is drawn from." },
    { slug: "cohort-retention-matrix", why: "Cohort offset matrix — team signup cohorts tracked against their publish behavior months later: the retention surface every template launch is judged on." },
    { slug: "winback-recovery", why: "Winback window — dormant teams that resume publishing inside the recovery window: the reactivation list the education tier is priced to refill." },
    { slug: "net-revenue-retention", why: "Cohort revenue retention — billed value this period versus last per team cohort: the NRR read design boards price expansion on." },
    { slug: "median-time-to-convert", why: "Median emulation — the middle team's draft-to-publish clock, not the mean the outliers drag: the honest latency read for the 82-of-103 stamped book." },
    { slug: "keep-latest-dedupe", why: "Keep-latest ROW_NUMBER dedupe — one current engagement state per team from a messy cycle history, the dedupe the adoption board runs nightly." },
    { slug: "plan-migration-paths", why: "LAG tier transitions — teams moving education to pro across cycle history: the upgrade path that justifies the two-tier catalog." },
    { slug: "customers-who-bought-all-products", why: "Relational division — full-gallery adoption: teams that have used every template family, the completeness check behind the 'whole-team deployment' claim." },
    { slug: "customers-who-bought-a-and-b-not-c", why: "Multi-template adoption logic — teams with drafts AND exports but no publish: the stuck-in-review list the gallery pod works on Mondays." },
    { slug: "feature-adoption-windows", why: "Adoption windows measure the gap between team start and sustained use — the time-to-publish read (2.98-day average, 2-to-4 range) at query shape." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV — template lines per design cycle against the 338.19 average: the attach-depth read behind every engagement board." },
    { slug: "repeat-purchase-rate", why: "Repeat purchase rate — teams returning cycle over cycle: the renewal share the team book is actually graded on." },
  ],
};
