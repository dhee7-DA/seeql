// Substack — Wave-8 (Task 96), media domain, 0 tagged LC — theme-curated; facts from scripts/company-facts.md.
// Publishing-economics SQL: the storefront db read as a newsletter graph — customers are
// publications, orders are posts booked onto the publishing calendar (delivered = landed in
// every inbox and the archive, shipped = sent with shipped_at as the send stamp, pending =
// scheduled for a future slot, cancelled = killed before send), order_items are the tier
// lines each post ships across (free list, paid list — quantity = sends, unit_price = tier
// price), and the finance tables are the payout rails (28 payout runs, 27 settlements,
// INTEGER cents) under "landed". Delivery-funnel censuses, two-grain publication reads,
// tie-heavy cadence leaderboards, the 14-month publishing spine. Pool provenance:
// company-pools.md carries NO Substack section — 0 tagged rows — so all 10 topic slug sets
// and all 32 problems are theme-curated from the pools file's theme menu and say so. Case
// briefs quote probed figures from scripts/company-facts.md (probed 2026-10-12); every case
// slot is mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const substackKit: CompanyKit = {
  id: "substack",
  domainId: "media",
  name: "Substack",
  tagline: "Writer economics across publications and posts",
  accent: "text-orange-300",

  brief: [
    "**Substack** turned the newsletter into a business: writers own the list, readers pay the author, and the platform rides along on the fee. Every growth number in the building is a conditional count over the same small set of objects. This kit maps the storefront db onto that world: the 16 customers rows are publications, the 103 orders are posts booked onto the publishing calendar worth **34,833.28** in subscription revenue, and the 251 order_items rows are the tier lines each post ships across — free list, paid list. The status map is fixed: delivered = {emerald:landed} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%), pending = scheduled (14), cancelled = {rose:killed} (7, 6.8%).",
    "The data org splits into growth (the {orange:recommendations network}, publishing cadence), monetization (free-versus-paid tiers, the platform fee) and a small payouts pod, and all three read the same spine at different grains. The cadence funnel is the heartbeat: a post books at created_at as a draft, and shipped_at is stamped the day the send actually fires — **82 of 103 posts** carry the stamp, averaging **2.98 days** of draft-to-send with a 2–4 day spread, and the 14 scheduled posts have none yet (a population definition, not a cleanup job). Money sits one layer down: payout runs and settlements in INTEGER cents, where the dollar read is `amount_cents / 100.0`. Concentration is the third story: **63.5%** of the book sits with publications whose lifetime revenue crosses 3,000 (71.2% above 2,000) — one writer going dormant moves a quarter.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain publication census** — EU runs 45 posts from just 8 publications (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'does a killed post count in your base?'*), then into the cadence leaderboard where four publications sit tied at 4 posts and rank semantics become a business decision. Late rounds walk the {sky:14-month publishing spine} (2024-01 to 2025-02) with `LAG` deltas — the **1,193.86** July trough, the +1,158.21 August jump — and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Substack section — zero tagged rows — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: delivery-funnel censuses, two-grain publication reads, tie-heavy cadence leaderboards, tier-band CASE logic and the cents-safe payout spine. This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the reads Substack teams rehearse most: the {emerald:one-pass delivery census} publishing ops opens Monday with, the {violet:above-the-mean read} monetization takes into every pricing review, the never-sent set the coverage packet diffs with `EXCEPT`, the revenue spine walked month over month to the {sky:1,193.86 July trough}, the draft-to-send latency read with its 2.98-day norm, and the regional tier-line ledger the pricing review reads the free and paid lists against. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool**, the thirty-MCQ bank and the theory bank below. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:40 —** The day starts with the delivery-funnel refresh. A growth analyst opens the publishing dashboard before standup: did overnight sends fire, did any post get its `shipped_at` stamp without a send-slot owner, does the one-pass status census reconcile — 52 landed + 30 in flight + 14 scheduled + 7 killed = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If draft-to-send latency drifts off the **2.98-day** norm, the cadence queue gets pulled before the morning Letter ships.",
    "**11:30 —** Midday is the network read. The recommendations team wants the cadence leaderboard with the four-way tie at 4 posts handled honestly — shared rungs, named policy; the monetization pod wants the concentration re-cut, {rose:63.5% of the book} from 3,000-plus publications; a regional VP wants posts per publication beside publication counts (EU 45-from-8 versus US 19-from-2). Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the metrics-review argument*.",
    "**15:30 —** The afternoon tilts toward money. The payouts anti-join refreshes first — **6 never-settled payout runs worth 15,217** — before a single writer reminder goes out; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled run (#11, 925.00) and a paid-status run with zero settlement rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Send rate", what: "Posts with shipped_at stamped ÷ all posts booked: 82 of 103 (79.6%). The top-of-funnel number growth reads every Monday — the 14 scheduled rows are 'not yet', never a silent zero." },
    { name: "Draft-to-send latency", what: "Booking to send (created_at → shipped_at) over sent posts only: 2.98-day average, range 2–4. The population definition ships with the number — scheduled posts have no cycle yet and must not dilute it." },
    { name: "Landed rate", what: "Delivered ÷ ALL posts booked: 52 of 103 (50.5%). 'Landed' is a status-filtered conditional count, and the denominator — in-flight sends included — is the whole interview." },
    { name: "Kill rate", what: "Cancelled share of booked posts: 7 of 103 (6.8%), sliced by region — APAC 8.1%, EU 6.7%, US 5.3%. The churn cohort map that drives the win-back and reactivation calendars." },
    { name: "Subscription book", what: "Total revenue booked: 34,833.28 across 103 posts, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the tiering story — free-list volume at one end, a 1,088.44 flagship issue at the other." },
    { name: "Tier lines per post", what: "Send lines ÷ posts: 251 order_items across 103 posts — the free-list and paid-list lines each issue ships across. Paid expansion shows up here first: a post added to a paid tier is a new line, not a new post." },
    { name: "Publication concentration", what: "Share of the book from publications with 3,000-plus lifetime revenue: 63.5% (71.2% above 2,000). The number that staffs writer partnerships and sizes the top-writer pod." },
    { name: "Payout coverage", what: "Booked versus settled: 21 exact settlements, 1 partial (4,000 of 6,148), 6 never-settled worth 15,217. The payouts anti-join the finance pod refreshes every close." },
  ],

  topics: [
    {
      name: "Send-funnel counts",
      why: "Every Substack growth screen opens with the funnel: posts booked, sent (shipped_at stamped), landed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling an in-flight send 'landed' — 30 versus 52 on this db.",
      slugs: ["trial-to-paid-funnel", "funnel-step-conversion", "immediate-food-delivery-i"],
    },
    {
      name: "Two-grain publication censuses",
      why: "Posts and publications are different grains of the same join, and every census here reports both: EU runs 45 posts from 8 publications while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is volume and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "article-views-i", "number-of-rich-customers"],
    },
    {
      name: "Joining publications to posts",
      why: "Publications carry region and created_at; posts inherit them through joins, and the join type decides who survives. A post without a publication is corruption; a publication without posts is a dormant blog — though on this db the anti-join returns a confident zero, and proving it is part of the job.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employee-bonus"],
    },
    {
      name: "Cadence leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four publications sit at 4 posts each on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer writers, not syntax.",
      slugs: ["rank-scores", "top-five-artists", "department-top-three-salaries"],
    },
    {
      name: "Tier banding with CASE",
      why: "Subscription tiers are CASE-classified — paid, free, founding — with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the revenue forecast, and a reordered WHEN quietly re-bands the list.",
      slugs: ["triangle-judgement", "weather-type-in-each-country", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Month walks & LAG deltas",
      why: "The 14-month publishing spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, trough (1,193.86 in July) and jump (+1,158.21 into August) named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero.",
      slugs: ["biggest-window-between-events", "second-day-confirmation", "year-on-year-growth-rate"],
    },
    {
      name: "Coverage set algebra",
      why: "Board packets stack populations — landed under killed, this quarter beside last — and EXCEPT answers 'which booked posts never sent'. UNION dedups whole rows silently, which makes it a correctness question, not a style one.",
      slugs: ["team-scores-in-football-tournament", "the-airport-with-the-most-flights", "customers-who-never-order"],
    },
    {
      name: "Nested folds & platform means",
      why: "Screens escalate into staging: fold per-publication post counts, then judge them against a computed platform mean (6.44 posts here — exactly four publications clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "second-highest-salary"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets landed, in-flight, scheduled and killed in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "snaps-analysis"],
    },
    {
      name: "Payout rails & cents discipline",
      why: "Landed is not paid — the finance tables (28 payout runs, 27 settlements, INTEGER cents) are where the publication world meets money. Every dollar read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away.",
      slugs: ["bank-account-summary-ii", "monthly-transactions-ii", "products-worth-over-invoices"],
    },
  ],

  theory: [
    {
      id: "substack-t1",
      q: "Your publication report joins customers to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter a post column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins posts to publications: a post with no publication row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A whitespace report must be LEFT from publications: the publications with no posts ARE the answer (a dormant blog), arriving with NULL post columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload publication row — the LEFT quietly became an INNER and the dormant list vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-posting publications, and proving that zero is itself the analyst's job: all 16 publications appear in the posts table somewhere.",
      tag: "joins",
    },
    {
      id: "substack-t2",
      q: "Four publications tie at 4 posts on the cadence leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose publication gets the recommendation boost. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer publications (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "substack-t3",
      q: "The census shows 103 posts and 16 publications; EU shows 45 posts and 8 publications. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts post rows after the join — one row per post, so a publication with 24 posts contributes 24. COUNT(DISTINCT customer_id) folds those rows back to publications — EU's 45 posts collapse to 8 mastheads. Neither is wrong: posts measure publishing volume and cadence, publications measure installed base and coverage. The ratio — 5.6 posts per publication in EU versus 9.5 in the US on this db — is the intensity signal that decides whether growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for tier lines and COUNT(*) silently counts send lines, not posts — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "substack-t4",
      q: "shipped_at is NULL until a send fires. What is your policy for the draft-to-send report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only sent posts have a latency, so the report measures booking-to-send for the 82 of 103 posts that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL posts returns the sent-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the sent subset; the gap between it and COUNT(*) is exactly the 14 scheduled plus 7 killed rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day sends for drafts that have not entered a send slot. A report whose WHERE clause is doing definitional work without saying so is exactly what a Substack reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "substack-t5",
      q: "The growth review wants landed revenue per region for regions carrying at least ten posts. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards in-flight, scheduled and killed rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-post floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to posts versus to dollars. The strong answer places every filter by asking: is this a fact about one post, or about a region?",
      tag: "pipeline",
    },
    {
      id: "substack-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 posts always produce a mean (6.44 posts per publication, and exactly four publications clear it). On filtered staging tables — one region, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each post to ITS publication's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "substack-t7",
      q: "The publishing trend buckets posts by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's posts, and newsletter sends cluster exactly at month boundaries. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. The spine's story here: the book opens at 3,731.97, troughs at 1,193.86 in July, then jumps +1,158.21 into August — those deltas are how cadence conversations start.",
      tag: "dates",
    },
    {
      id: "substack-t8",
      q: "Finance says a payout run is 'paid' but the settlements table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: payout runs LEFT JOIN settlements, keep the settlement id NULL — on this db that returns 6 runs worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement rows: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void run WITH a settlement row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: payout runs and settlements carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the coverage split must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
    {
      id: "substack-t9",
      q: "COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) — what does each return on the posts table, and when does the newsroom want each?",
      a: "Three grains, one table. COUNT(*) counts rows — 103 posts booked on the publishing calendar, scheduled and killed included. COUNT(shipped_at) counts send stamps — 82 posts that actually fired — and the 21-row gap (14 scheduled, 7 killed) is a feature: the population still queued, not dirt. COUNT(DISTINCT customer_id) folds back to publications — 16 mastheads — the coverage number beside the volume number. Join order_items for tier lines and COUNT(*) silently counts send lines instead — 251 — which is why saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "substack-t10",
      q: "A revenue SUM doubles after you join order_items to orders. Walk me through diagnosing the fan-out and fixing it.",
      a: "Diagnose by counts: 103 posts alone, 251 tier lines after the join — the jump IS the fan-out, each post's total repeating once per line it ships across. Confirm with GROUP BY order_id HAVING COUNT(*) > 1 to see which posts carry multiple lines. The fix depends on the grain owed: post-grain revenue means pre-aggregating lines per order in a CTE before joining, or staying at line grain and counting entities with COUNT(DISTINCT o.id) while every ratio names its denominator. On this db the careless join inflates the 34,833.28 book by roughly 2.4x — and the wrong number still looks plausible, which is what makes it dangerous in a pricing review.",
      tag: "joins",
    },
    {
      id: "substack-t11",
      q: "When do you stage a WITH (CTE) instead of nesting subqueries — and what does a well-named CTE buy a publishing team?",
      a: "Three buys. Readability: monthly, sent_posts, growth_accounting reads like the ops pipeline instead of a Russian-doll subquery, and each step is a checkpoint to SELECT from while debugging. Reuse: one CTE feeds several downstream references — the per-publication fold written once, joined twice. Definition-as-code: naming a CTE sent_posts forces the population (shipped_at IS NOT NULL, 82 of 103) to live where the reviewer sees it, which is how growth accounting stays honest — new, retained and resurrected must reconcile to the total or the deck ships wrong. Filter early inside each step; a CTE is staging, not guaranteed materialization.",
      tag: "ctes",
    },
    {
      id: "substack-t12",
      q: "Board packets stack and diff populations. Where are UNION, UNION ALL and EXCEPT each the honest tool?",
      a: "UNION ALL concatenates and is the default: the landed census stacked under the killed census are disjoint populations and every row belongs. UNION adds a distinct pass — correct only when duplicated rows would double-count, and a silent bug when a legitimate repeat (same publication, same counts, no branch label) collapses; that vanishing row is how packets lose a masthead with no error anywhere. EXCEPT diffs sets: which booked posts never sent — 103 booked ids minus the 82 sent ids leaves 21, splitting into 14 scheduled and 7 killed. Both inputs dedupe first, so if a double-booked post is the anomaly being hunted, the row-honest diff is a LEFT JOIN … IS NULL anti-join instead.",
      tag: "set-ops",
    },
    {
      id: "substack-t13",
      q: "Where do conditional aggregates — CASE inside SUM and COUNT — beat writing separate queries?",
      a: "Anywhere one scan must produce many lenses. The delivery census is the canonical one: four SUM(CASE WHEN status …) branches per region print landed 52, in-flight 30, scheduled 14, killed 7 from 103 posts in a single pass, and the branches reconcile to COUNT(*) by construction — which is why the one-pass version is the only one publishing ops ships. The same shape builds tier bands (free, standard, founding, with published edges), explicit zero buckets for LATAM's empty queues, and share percentages with the 100.0 fix. Separate queries stitched in a spreadsheet lose the shared grain, and the numbers stop adding up on exactly the slide everyone screenshots.",
      tag: "case-when",
    },
    {
      id: "substack-t14",
      q: "How do LAG and LEAD power the revenue spine — and where do candidates usually stumble?",
      a: "LAG(revenue) OVER (ORDER BY month) puts the prior month beside the current one — and the story names itself: the book opens at 3,731.97, slides 853.57 into the 1,193.86 July trough, then jumps +1,158.21 into August. LEAD reads forward and would silently re-label the future as history. The first row's LAG is NULL and that NULL is honest — no baseline, never an invented zero. The two stumbles: filtering window output in WHERE (windows evaluate in the SELECT stage — stage the LAG in a CTE and filter outside), and referencing the LAG's alias in a sibling expression (prev_revenue doesn't exist for the delta column — repeat the window or stage a CTE). Windows over a GROUP BY are legal: the fold happens first, the window walks the folded rows.",
      tag: "windows",
    },
    {
      id: "substack-t15",
      q: "How do you bucket posts into months, cut a quarter without losing its last night, and measure draft-to-send in days?",
      a: "The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets here from 2024-01 to 2025-02; '%m' alone merges January 2024 with January 2025 and the trend becomes fiction. The quarter cut: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night, and newsletter sends cluster exactly at month boundaries. Draft-to-send: julianday(shipped_at) − julianday(created_at) over the 82 stamped posts — 2.98 days average, 2-to-4 spread — with the population stated, because AVG ignores NULLs and would quietly report the same number over an unnamed base. Date bugs are boundary bugs; state the policy before the WHERE clause.",
      tag: "dates",
    },
    {
      id: "substack-t16",
      q: "Payout runs and settlements live in integer cents. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: amount_cents = 493700 is $4,937.00, and amount_cents / 100 is integer division — 4,937 flat; divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding discards precision a later SUM still needed — round only what a human reads. Float drift: REALs accumulate IEEE error, integer cents don't. The policy: aggregate in cents, convert once, round at the edge — and let the ledger prove it, because the trial balance landing at 181,080 against 181,080, delta zero, is only checkable when nothing was rounded away en route. The payout book is 8,697,700 cents across 28 runs; a summary that doesn't foot to that is wrong by construction.",
      tag: "numbers",
    },
    {
      id: "substack-t17",
      q: "What keeps a growth query cheap on a platform reading millions of sends?",
      a: "Sargability first: compare the bare column to a value. WHERE STRFTIME('%Y-%m', created_at) = '2024-03' scans every row; the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01' reads the same rows through an index. Then the compounding habits: filter early inside each CTE so later stages carry fewer rows; name columns instead of SELECT *; probe with LIMIT before the full run; aggregate on the smallest table that answers the question rather than joining first and filtering after. On a platform where every read is a funnel census over the publishing calendar, these are the difference between a dashboard that renders and one that times out during the metrics review.",
      tag: "performance",
    },
    {
      id: "substack-t18",
      q: "In a review you are asked for 'the send rate'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator (posts with a shipped_at stamp — 82), the denominator (ALL posts booked — 103 — because 'not yet sent' is exactly what the metric measures; dropping the 14 scheduled inflates 79.6% to 92.1%), the window (calendar month or trailing 30 days), and the killed-post policy (in the base or out, stated either way). Then the discipline move: encode the definition as a named CTE so the SQL IS the definition and the reviewer audits it instead of arguing with you. The analyst who says 'sent means stamped, over booked, killed included, trailing month' owns the room.",
      tag: "metrics",
    },
    {
      id: "substack-t19",
      q: "How do NULLs behave in filters, joins and aggregates — and what is the NULL policy for scheduled posts?",
      a: "Three behaviors to narrate. In filters, NULL fails both x = value and x != value — WHERE status != 'killed' silently drops NULL-status rows; add OR status IS NULL if they should survive. In joins, NULL keys never match: a post with no publication vanishes from an INNER JOIN and survives a LEFT JOIN only on the left. In aggregates, NULL inputs are ignored — AVG over all posts returns the sent-only 2.98-day average over an unnamed 82-row base, and COUNT(shipped_at) shrinks to 82 while COUNT(*) stays 103. The policy for scheduled posts: they are 'not yet', never zero — report them as their own bucket, never IFNULL their latency to 0, and treat NOT IN over an unguarded column as a bug (one NULL empties the result; NOT EXISTS is the safe shape).",
      tag: "nulls",
    },
    {
      id: "substack-t20",
      q: "Walk me through the logical evaluation order of a SELECT — and name the bug each stage explains.",
      a: "FROM and JOIN assemble rows; WHERE filters them; GROUP BY folds them; HAVING filters groups; SELECT computes output expressions including windows; ORDER BY sorts; LIMIT cuts. Every classic screen bug is a stage violation: an alias referenced in WHERE (it does not exist yet), COUNT(*) in WHERE (groups do not exist yet), a filter on LAG output in WHERE (windows run in SELECT — wrap the query). The publishing-flavored sibling: the delta column cannot reference prev_revenue, an alias born in the same SELECT — repeat the LAG or stage a CTE, because aliases are invisible to siblings. Saying the order out loud before writing is the cheapest debugging tool an analyst has.",
      tag: "pipeline",
    },
    {
      id: "substack-t21",
      q: "IN (SELECT …) versus EXISTS versus a derived table — which do you reach for on the publishing graph, and what is the empty-inner contract?",
      a: "EXISTS is an existence probe — it short-circuits on the first match and never trips on NULLs, which is why NOT EXISTS is the safe anti-join; NOT IN over a column carrying one NULL silently empties the win-back list. IN is a membership test, fine for small static sets. A derived table is neither — it stages a new grain (per-publication averages, per-month buckets) the outer query judges, exactly like the above-the-mean read: fold, then compare each masthead to the platform mean of 338.19. The contract to state unprompted: a scalar subquery returns 0-or-1 rows, and zero rows yield NULL — so an above-average gate over an empty staging fold (one region, one month) passes nobody while looking valid. The strong candidate names the inner fold's population and its empty case.",
      tag: "subqueries",
    },
    {
      id: "substack-t22",
      q: "Finance says a payout run is 'paid' but the settlements table has no rows for it. Which checks run first — and what reconciles the close?",
      a: "The anti-join first: payout runs LEFT JOIN settlements, keep the settlement id NULL — 6 runs worth 15,217, one of them (#28, 1,756.00) marked paid with zero settlement rows: a status that lies, which is why settlement rows are the ledger of record and the status column is a claim. Then the mirror anomaly: a void run WITH a settlement row (#11 at 925.00) never appears in that anti-join — the two error modes reconcile to a row-level anomaly list, not to vibes. Then the five fast checks: freshness (MAX timestamps), volume versus the 7-day average, duplicate keys, orphaned references, NULL spikes. The close ships only when the coverage split reads 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled and the trial balance lands at 181,080 against 181,080 — delta zero.",
      tag: "quality",
    },
    {
      id: "substack-t23",
      q: "Why is an average of averages wrong, and what do you compute instead?",
      a: "Because it weights every group equally regardless of size. The regional reads: EU averages 335.32 an issue over 45 posts, APAC 313.66 over 37, US 383.48 over 19, LATAM 426.22 over 2 — averaging those four gives 364.67, a platform that does not exist. The honest mean re-aggregates from the base: 34,833.28 over 103 posts = 338.19, where LATAM's two issues barely register. The honest blends are re-aggregation from base rows or a weighted average — SUM(avg * posts) / SUM(posts) — the same arithmetic one level up. The interview move is saying WHERE the weighting lives: equal weights are a claim you should have to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "substack-t24",
      q: "When is DISTINCT a bug report rather than a feature?",
      a: "When it is papering over a fan-out nobody diagnosed. SELECT DISTINCT publication_name, post_total FROM … returning sane-looking rows usually means the join multiplied posts by tier lines and DISTINCT is de-duplicating the damage — while the revenue SUM next to it is still wrong. The honest sequence: notice the DISTINCT, run the counts with and without it, find the multiplicity (GROUP BY the key HAVING COUNT(*) > 1), fix the join or pre-aggregate. Legitimate DISTINCT exists: collapsing a dimension's value set — 16 publications, 4 regions on this db — or de-duplicating a deliberately over-joined enrichment. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
    },
  ],

  mcqs: [
    {
      id: "substack-mcq-1",
      prompt: "A post row's status reads 'delivered'. In this kit's Substack stage map, what happened?",
      choices: ["Landed — the send completed and counts as fully delivered", "In flight — sent, not yet confirmed", "Killed — pulled before send", "Scheduled — queued for a future send slot"],
      answer: 0,
      why: "The stage map is fixed: delivered = landed (52 of 103 posts, 50.5%). It is the only status where the send has completed end to end.",
      notes: [
        { choice: 1, why: "In flight is 'shipped' — 30 posts sent but not confirmed landed. Calling them landed inflates the delivery rate before a single send confirms." },
        { choice: 3, why: "Scheduled is 'pending' — 14 posts with no shipped_at yet. Scheduled is not killed and not landed; it is 'not yet', and it stays in the denominator." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-2",
      prompt: "Send rate is shipped_at IS NOT NULL ÷ which population? The db holds 82 sent, 14 scheduled and 7 killed of 103 booked.",
      choices: ["Sent + killed only (82/89 = 92.1%)", "All posts booked (82/103 = 79.6%)", "Landed posts only (52/82)", "Distinct publications (82/16)"],
      answer: 1,
      why: "The house definition: sent ÷ ALL posts booked — scheduled drafts stay in the denominator because 'not yet sent' is exactly what the metric measures. 79.6% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 scheduled inflates the rate to 92.1% by deleting the population still queued — the rows the funnel exists to watch." },
        { choice: 2, why: "52/82 mixes two funnel steps into one rate — landed is delivery completion, shipped_at is the send firing. Different steps, different names." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-3",
      prompt: "EU carries 45 posts from 8 publications. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts post rows (45); COUNT(DISTINCT customer_id) folds repeats back to publications (8). The gap between them — 5.6 posts per publication — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every post has a publication. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not publications — a third grain nobody asked for. The census is posts AND mastheads." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to killed posts only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the kill share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the kill map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-5",
      prompt: "Keep only publications carrying at least 10 posts. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY publication HAVING COUNT(*) >= 10", "WHERE posts >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A post-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db only the embedded tier — 24, 17, 14 and 13 posts — clears a 10-post bar per publication.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'posts' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-6",
      prompt: "The cadence ladder runs 24, 17, 14, 13, 5 posts, then FOUR publications tied at 4. Under RANK, what rank do the two 3-post publications carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-post publications share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The network board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The scheduled posts double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the sent-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 posts.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-8",
      prompt: "A staging win-back list uses publication_id NOT IN (SELECT customer_id FROM posts WHERE status = 'killed') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the win-back list empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every post carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-9",
      prompt: "A board stack puts in-flight posts under killed posts in one layout, built with UNION. A reviewer says one publication's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same publication, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same publication, same counts, no region or branch label — collapse into one, and the board loses a publication with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-10",
      prompt: "A dashboard walks subscription revenue issue by issue: SUM(total) OVER (ORDER BY published_at). Two posts share a published_at second, and the cumulative 'jumps two posts at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on published_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at post grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-11",
      prompt: "order_items holds 251 tier lines across the 103 posts. What does `SELECT COUNT(DISTINCT order_id) FROM order_items` return?",
      choices: ["251 — one per tier line", "103 — the posts shipping across at least one tier", "16 — the publications", "498 — the sends"],
      answer: 1,
      why: "DISTINCT folds the tier-line fan-out back to the post grain: 103 posts ship across at least one list. COUNT(*) would count 251 lines — and that fan-out is exactly why the SUM-after-join doubling this kit drills happens at all.",
      notes: [
        { choice: 0, why: "251 is COUNT(*)'s answer — the raw line count. DISTINCT is what folds lines back to posts." },
        { choice: 3, why: "498 is SUM(quantity) — sends, a third grain nobody asked for in a post census." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-12",
      prompt: "A cadence query buckets posts by month: created_at reads '2025-02-11 08:14:00'. What does `SUBSTR(created_at, 1, 7)` return for that row?",
      choices: ["'2025-2'", "'2025-02'", "'2025-02-11'", "'02-11'"],
      answer: 1,
      why: "SUBSTR is character-based and 1-indexed: positions 1 through 7 of an ISO-8601 timestamp are exactly the 'YYYY-MM' bucket. It's the trick behind the 14-month publishing spine (2024-01 through 2025-02) every trend read in this kit walks on.",
      notes: [
        { choice: 0, why: "SUBSTR slices stored characters — no reformatting happens. The stored string already carries the zero-padded month." },
        { choice: 2, why: "Positions 1–10 give the full date; length 7 stops right after the month." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-13",
      prompt: "The payouts ledger LEFT JOINs settlements to payout runs; the 6 never-settled runs show a NULL paid column. The dunning draft wants those displayed as 0. What's the fix?",
      choices: ["WHERE paid_cents IS NOT NULL", "COALESCE(SUM(s.amount_cents), 0)", "SUM(IFNULL(s.amount_cents, 100))", "Switch to INNER JOIN"],
      answer: 1,
      why: "COALESCE wraps the aggregate AFTER it returns: the NULL sum of the 6 never-settled runs (1,521,700 cents booked) displays as 0 while the rows stay in the report. Filtering or inner-joining deletes exactly the rows the payouts pod needs to see; IFNULL inside SUM fabricates settlements.",
      notes: [
        { choice: 0, why: "That deletes the never-settled runs from the ledger — the opposite of showing them with a 0." },
        { choice: 2, why: "IFNULL inside SUM turns each missing settlement into 100 cents of fake money. Guard the aggregate's result, not its inputs." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-14",
      prompt: "A payout run books amount_cents = 493700. Which expression prints the booked value in dollars?",
      choices: ["amount_cents / 100", "amount_cents / 100.0", "ROUND(amount_cents)", "CAST(amount_cents AS TEXT) || ' dollars'"],
      answer: 1,
      why: "INTEGER / 100 is integer division: 493700/100 = 4937. Dividing by the float literal 100.0 forces real division: 4937.00. Every payout read — runs, settlements, the ledger's 181,080-cent trial balance — is integer cents, so the .0 literal is the house rule.",
      notes: [
        { choice: 0, why: "4,937 dollars, not $4,937.00 — the cents are gone. The .0 literal is the whole fix." },
        { choice: 3, why: "CAST to TEXT concatenates a label onto the integer; no scale conversion happens at all." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-15",
      prompt: "created_at is TEXT like '2025-02-11 08:14:00'. Does `ORDER BY created_at` give chronological order?",
      choices: ["Yes — ISO-8601 timestamps sort lexicographically into chronological order while the format stays uniform", "No — text always sorts alphabetically, never chronologically", "Only if you CAST to INTEGER first", "Only with julianday() — text dates are unordered"],
      answer: 0,
      why: "The ISO-8601 layout is big-endian — year, then month, then day — so string order and time order coincide. The real risk is format drift (mixed date-only and full-timestamp rows), which is a data-quality question, not an ORDER BY one.",
      notes: [
        { choice: 3, why: "julianday is for arithmetic — the 2.98-day draft-to-send latency — not for ordering uniform ISO strings." },
        { choice: 1, why: "Alphabetical IS chronological here; that is the entire point of the ISO format. 'Feb 11, 2025' would break it." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-16",
      prompt: "The db holds 103 posts booked, 82 carrying the shipped_at stamp. What does the gap `COUNT(*) - COUNT(shipped_at)` measure, and why is it a feature?",
      choices: [
        "21 — data corruption to clean up before reporting",
        "21 — the 14 scheduled plus 7 killed posts: the population still queued or withdrawn, which any honest funnel denominator keeps",
        "21 — the number of publications with no posts",
        "0 — both counts always agree",
      ],
      answer: 1,
      why: "COUNT(shipped_at) counts the 82 stamped sends; COUNT(*) counts all 103 booked rows; the 21-row gap is exactly the 14 scheduled ('not yet') plus 7 killed ('withdrawn') posts. The gap is a population definition, not dirt — which is why the send rate's denominator is argued out loud.",
      notes: [
        { choice: 0, why: "Calling the gap corruption is the real bug — scheduled posts are the queue the funnel exists to watch." },
        { choice: 3, why: "COUNT(column) skips NULLs while COUNT(*) doesn't — on a sparse timestamp column they disagree by design." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-17",
      prompt: "The board packet wants each region's masthead roster as one cell — 'Alice Chen,Chloe Dubois,…' per region. Which fold builds it?",
      choices: ["GROUP_CONCAT(name) with GROUP BY region", "CONCAT(name) with GROUP BY region", "STRING_AGG is the only aggregate that folds text in SQLite", "SUM(name) with GROUP BY region"],
      answer: 0,
      why: "GROUP_CONCAT folds a group's values into one comma-joined string — the roster cell. EU's eight mastheads become one label the packet prints without a second pass. Plain CONCAT joins fixed arguments per row, and SUM coerces text to 0.",
      notes: [
        { choice: 1, why: "CONCAT concatenates its arguments for each row — it never folds a group of rows into one value." },
        { choice: 3, why: "SUM over text yields 0 — arithmetic cannot fold names." },
      ],
      difficulty: "easy",
    },
    {
      id: "substack-mcq-18",
      prompt: "Which query lists the payout runs that never settled a cent — including the paid-status anomaly #28?",
      choices: [
        "SELECT i.number FROM invoices i INNER JOIN settlements s ON s.invoice_id = i.id WHERE s.amount_cents IS NULL",
        "SELECT i.number FROM invoices i LEFT JOIN settlements s ON s.invoice_id = i.id WHERE s.id IS NULL",
        "SELECT i.number FROM invoices WHERE settlement_id IS NULL",
        "SELECT i.number FROM invoices i LEFT JOIN settlements s ON s.invoice_id = i.id",
      ],
      answer: 1,
      why: "The anti-join: LEFT JOIN keeps all 28 payout runs and hands the 6 unmatched a NULL payload; WHERE s.id IS NULL keeps exactly them — 5 open runs plus #28, marked paid while carrying zero settlement rows. This is the query the payouts pod refreshes before a single writer reminder goes out.",
      notes: [
        { choice: 0, why: "INNER JOIN discards the unmatched rows before the WHERE can see them — the result is empty, since settlement amounts are never NULL." },
        { choice: 3, why: "The bare LEFT JOIN returns every run once per settlement — the 22 matched runs come along for the ride." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-19",
      prompt: "The churn walk computes prev_week with LAG, then you filter: `... FROM weekly WHERE delta < 0`. It fails. Why?",
      choices: ["LAG cannot appear next to SUM(*)", "Window output is computed in the SELECT stage — WHERE runs first; stage the window and filter outside", "delta must be re-aliased with AS", "LAG needs PARTITION BY to compute deltas"],
      answer: 1,
      why: "Logical evaluation order: WHERE executes before SELECT, and window functions are SELECT-stage work — delta doesn't exist yet at filter time. The fix is the two-step every spine and churn walk uses: compute the LAG in a CTE or derived table, apply the threshold outside.",
      notes: [
        { choice: 0, why: "LAG over aggregates is legal — windows evaluate after GROUP BY, which is why the spine works at all." },
        { choice: 3, why: "PARTITION BY is for per-entity series. The platform-wide churn walk is one global series ordered by week." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-20",
      prompt: "`SELECT COUNT(*) FROM orders WHERE total > (SELECT AVG(total) FROM orders WHERE region = 'ANTARCTICA')` returns 0 — the staging fold is empty. What happened?",
      choices: ["Antarctic posts have the highest totals, so nothing clears them", "An empty scalar subquery returns NULL; total > NULL is UNKNOWN, so every row fails and the report empties silently", "COUNT(*) cannot run over a comparison", "AVG over an empty set errors and aborts the query"],
      answer: 1,
      why: "A scalar subquery contracts to 0-or-1 rows; zero rows yield NULL, and comparisons against NULL are UNKNOWN — the above-average filter passes nobody while looking valid. This is the empty-inner-query bug, and it ships regularly on filtered staging tables.",
      notes: [
        { choice: 0, why: "The mechanism is NULL, not a high bar — any empty staging fold produces it, whatever the totals would have been." },
        { choice: 2, why: "AVG of no rows is NULL, not an error — the failure is silent by design, which is exactly what makes it dangerous." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-21",
      prompt: "You join order_items to orders and run AVG(o.total). The db holds 103 posts and 251 tier lines. What did you actually compute?",
      choices: ["The true per-post average — joins don't change averages", "An order average weighted by tier-line count — posts on more lists count more than once", "The average line value, not the post average", "NULL — AVG cannot run across a join"],
      answer: 1,
      why: "The join fans 103 posts out to 251 lines, so o.total repeats once per tier line and AVG divides by 251, not 103 — heavily-distributed posts dominate. Compute the per-post average on orders alone, or pre-aggregate lines per order before averaging.",
      notes: [
        { choice: 2, why: "AVG(o.total) still averages the POST total column, just over fanned-out rows; line value would be AVG(unit_price * quantity)." },
        { choice: 3, why: "Joins don't inject NULLs here — totals are NOT NULL. The distortion is duplication, not NULL drift." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-22",
      prompt: "Draft states churn: the same publication_id appears many times with different statuses. Which query keeps exactly the freshest row per publication, even when two imports share a timestamp?",
      choices: [
        "SELECT DISTINCT publication_id FROM drafts",
        "ROW_NUMBER() OVER (PARTITION BY publication_id ORDER BY updated_at DESC, id DESC) = 1 in a CTE, keep rn = 1",
        "GROUP BY publication_id with MAX(*)",
        "ORDER BY updated_at DESC LIMIT 1",
      ],
      answer: 1,
      why: "ROW_NUMBER with a deterministic tie-breaker (id DESC after updated_at) keeps exactly one row per publication even on timestamp ties — the pipeline-safe dedupe. This is the shape that de-churns draft state before any cadence join.",
      notes: [
        { choice: 0, why: "DISTINCT returns one id per publication but drops every other column — the draft state you needed is gone." },
        { choice: 2, why: "MAX(*) isn't valid SQL, and even MAX(updated_at) joined back returns both rows when timestamps tie." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-23",
      prompt: "A quarterly cadence read must include a send that fires at '2025-03-31 23:59:59'. Which WHERE clause keeps it in Q1?",
      choices: [
        "WHERE created_at BETWEEN '2025-01-01' AND '2025-03-31'",
        "WHERE created_at >= '2025-01-01' AND created_at < '2025-04-01'",
        "WHERE SUBSTR(created_at, 6, 2) IN ('01', '02', '03')",
        "WHERE QUARTER(created_at) = 1",
      ],
      answer: 1,
      why: "The half-open interval [Jan 1, Apr 1) catches every timestamp in the quarter: '2025-03-31 23:59:59' < '2025-04-01' is TRUE. BETWEEN '2025-01-01' AND '2025-03-31' compares string-wise and drops everything after midnight on the 31st — precisely when month-end sends cluster.",
      notes: [
        { choice: 0, why: "BETWEEN is inclusive on both ends — the quarter's last night vanishes and lands in no quarter at all." },
        { choice: 2, why: "SUBSTR works but wraps the column in a function — format-fragile and index-hostile. The range comparison is sargable." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-24",
      prompt: "Pricing screen: issues whose revenue beats THEIR OWN publication's average. Which shape re-evaluates per outer row — and what replaces it at scale?",
      choices: [
        "A correlated subquery re-runs per issue; AVG(total) OVER (PARTITION BY customer_id) computes each publication's average once and keeps every row",
        "GROUP BY publication with HAVING total > AVG(total)",
        "A CROSS JOIN of posts to publications",
        "DISTINCT on (customer_id, total)",
      ],
      answer: 0,
      why: "The correlated form compares each issue to a per-publication average recomputed row by row — correct, but it re-scans per outer row. The window partition computes every masthead's average once and keeps every row, which is the enrichment shape the recommendations network ships on.",
      notes: [
        { choice: 1, why: "HAVING judges groups, not rows — it cannot keep individual above-average issues; it filters whole publications." },
        { choice: 2, why: "CROSS JOIN pairs every post with every publication — a fan-out, not a filter." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-25",
      prompt: "The growth read filters `WHERE STRFTIME('%Y-%m', created_at) = '2024-03'` and times out on the full post table. What's the sargable twin?",
      choices: [
        "WHERE created_at LIKE '2024-03%'",
        "WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "WHERE CAST(created_at AS DATE) BETWEEN '2024-03-01' AND '2024-03-31'",
        "Add an index on STRFTIME('%Y-%m', created_at)",
      ],
      answer: 1,
      why: "Wrapping the column in a function forces a scan of every row; the half-open range compares the bare column and can use an index — same rows, same boundary semantics (the last night of March included), a fraction of the cost. Sargability is a functional-index conversation you rarely get to have.",
      notes: [
        { choice: 0, why: "LIKE still applies a pattern over the raw column — closer, but not a range; the half-open interval is the professional default." },
        { choice: 2, why: "CAST wraps the column again, and BETWEEN still drops the last night of the month." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-26",
      prompt: "The coverage packet diffs two boost-eligible id exports: Export A carries 42 ids, three of them exact duplicates of each other; Export B carries 30 ids and shares 25 with A. What does `SELECT id FROM a EXCEPT SELECT id FROM b` return?",
      choices: ["17 rows", "14 rows — EXCEPT deduplicates A first, so the internal duplicates collapse before the diff", "20 rows — duplicates count twice", "An error — EXCEPT requires unique keys"],
      answer: 1,
      why: "EXCEPT is a set operation: both inputs are deduplicated first — A's 39 distinct ids minus the 25 shared = 14. If the duplicate ingest itself is the anomaly being hunted, the row-honest diff is a LEFT JOIN … IS NULL anti-join on the full multiset, not EXCEPT.",
      notes: [
        { choice: 0, why: "17 is the multiset answer (42 − 25). Sets collapse duplicates before comparing: 39 distinct − 25 shared = 14." },
        { choice: 3, why: "EXCEPT happily takes duplicates — that is exactly the behavior being tested. No uniqueness requirement exists." },
      ],
      difficulty: "medium",
    },
    {
      id: "substack-mcq-27",
      prompt: "The ledger closes at debits 181,080 and credits 181,080, delta zero. Which rounding policy makes that provable in SQL?",
      choices: [
        "Round every intermediate SUM to 2 decimals so the ledger looks tidy",
        "Aggregate in integer cents, convert to dollars once at the presentation edge, round only what a human reads",
        "Store dollars as REAL and round at the end",
        "TRUNCATE every amount before summing",
      ],
      answer: 1,
      why: "Cents are integers — summing them is exact, so a trial balance that lands at 181,080 against 181,080 is proof, not luck. Mid-pipeline rounding discards precision a later SUM still needed; the /100.0 conversion happens once, at the edge, on what a human reads.",
      notes: [
        { choice: 0, why: "Rounding mid-pipeline is how ledgers stop reconciling — the delta becomes your bug, discovered during the close." },
        { choice: 2, why: "REAL dollars accumulate IEEE drift across millions of rows; integer cents don't drift." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-28",
      prompt: "Tier banding: `CASE WHEN total < 25 THEN 'free' WHEN total < 1000 THEN 'standard' ELSE 'founding' END`. A 1,088.44 flagship issue lands as 'founding' but a 25.47 issue lands as 'standard', and the deck is wrong. Why?",
      choices: [
        "CASE requires an ELSE on every branch",
        "CASE arms evaluate top-down and stop at the first match — the arm order or the edges don't match the pricing page's published tiers",
        "Comparing REAL to INTEGER fails silently",
        "CASE cannot appear outside WHERE",
      ],
      answer: 1,
      why: "First match wins: every arm is tested in order, so a 25.47 issue clears < 1000 before any finer edge can fire. Banding bugs are almost always arm order or edge drift — the fix is publishing the edges in one direction and testing the boundary values (25.47, 1,088.44 — the db's actual spread), not adding arms.",
      notes: [
        { choice: 0, why: "ELSE is optional — it defaults to NULL. A missing ELSE hides rows; it doesn't mis-band them." },
        { choice: 2, why: "SQLite compares numeric storage classes fine. The arm order is the entire story." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-29",
      prompt: "A spine query computes `LAG(revenue) OVER (ORDER BY month) AS prev_revenue` and then, in the same SELECT, `ROUND(revenue - prev_revenue, 2) AS delta`. It errors. Why?",
      choices: [
        "ROUND cannot mix a column and an alias",
        "SELECT aliases are invisible to sibling expressions — prev_revenue doesn't exist yet inside the same SELECT; repeat the LAG or stage a CTE",
        "LAG must be aliased with a quoted identifier",
        "Arithmetic on window output is prohibited",
      ],
      answer: 1,
      why: "The SELECT list computes as one stage: an alias born in the same list can't be referenced by a sibling — only ORDER BY sees the aliases, because it runs after. The spine's delta repeats the LAG expression (or the CTE stages prev_revenue so the outer query can reference it).",
      notes: [
        { choice: 0, why: "ROUND mixes columns and literals freely — the failure is alias visibility, not the function signature." },
        { choice: 3, why: "Arithmetic on window output is fine — one stage later. In the same SELECT list, the sibling alias simply isn't there yet." },
      ],
      difficulty: "hard",
    },
    {
      id: "substack-mcq-30",
      prompt: "A growth analyst argues: 'EU averages 335.32 an issue (15,089.23/45), APAC 313.66 (11,605.45/37), US 383.48 (7,286.16/19), LATAM 426.22 (852.44/2) — so the platform average is the mean of those four.' What's wrong?",
      choices: [
        "Nothing — regional averages blend cleanly",
        "It's an average of averages: each region weighted equally regardless of size; the honest mean re-aggregates from the base — 34,833.28 over 103 posts = 338.19",
        "The per-region averages are computed wrong",
        "338.19 is the median, not the mean",
      ],
      answer: 1,
      why: "The four-region mean weights LATAM's 2-post book as heavily as EU's 45-post book — it averages to 364.67, a platform that doesn't exist. The honest mean is SUM(total)/COUNT(*) over the base rows: 338.19, the exact figure this kit quotes — where LATAM's two issues barely register.",
      notes: [
        { choice: 2, why: "The regional averages are right — the crime is blending them unweighted." },
        { choice: 3, why: "338.19 is the arithmetic fold over the base, not a median of anything." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-substack-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The one-pass delivery census",
      brief:
        "Publishing-ops memo on the storefront db: Monday's review opens with the delivery census — per region, posts landed, in flight, scheduled and killed in ONE scan, and the four branches must reconcile to the region's post total by construction. Probed facts: 103 posts booked; the platform split reads 52 delivered / 30 shipped / 14 pending / 7 cancelled; by region it is EU 24 / 12 / 6 / 3 of 45, APAC 21 / 8 / 5 / 3 of 37, US 5 / 10 / 3 / 1 of 19, LATAM 2 / 0 / 0 / 0 of 2 — every LATAM post landed, none still queued. The board reads biggest publishing volume first.",
      ask: "Return each region with landed, in-flight, scheduled and killed post counts plus the region total, biggest volume first.",
      template:
        "SELECT c.region AS region,\n       SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS landed,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS in_flight,\n       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS scheduled,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS killed,\n       COUNT(*) AS all_posts\nFROM orders o\nJOIN customers c ON c.id = {2}\nGROUP BY c.region\nORDER BY {3} {4};",
      slots: [
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the in-flight status literal",
          why: "In-flight posts are status 'shipped' — 12 in EU, 8 in APAC, 10 in US, 0 in LATAM. 'sent' matches no status on this db, so the column zeroes out; 'delivered' duplicates the landed column and the census double-counts its own sends.",
        },
        {
          answer: "o.customer_id",
          kind: "keyword",
          label: "the publication join column",
          why: "Posts attach to publications through o.customer_id = c.id. Joining on o.id pairs each post with whoever shares its row number and silently reassigns every region's counts — a census of nothing that still adds up per row.",
        },
        {
          answer: "all_posts",
          kind: "keyword",
          label: "the volume-first sort key",
          why: "The board reads biggest publishing volume first — 45, 37, 19, 2. Sorting by region alphabetizes the census and the biggest market scrolls off the top; sorting by a status column re-frames the whole meeting around one stage.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first direction",
          why: "DESC puts EU's 45 posts on top. ASC would open the meeting on LATAM's 2 posts — a correct query aimed at the wrong end of the board, with the market that pays for the meeting buried in row four.",
        },
      ],
      distractors: ["'sent'", "'delivered'", "o.id", "ASC", "region"],
      walkthrough:
        "One scan, four CASE branches, one reconciliation identity. The join attaches every post to its publication's region; the four SUM(CASE …) branches count delivered (52 platform-wide → EU 24, APAC 21, US 5, LATAM 2), shipped (30 → 12, 8, 10, 0), pending (14 → 6, 5, 3, 0) and cancelled (7 → 3, 3, 1, 0), and COUNT(*) prints the totals — 45, 37, 19, 2 — that each row must sum back to: 24+12+6+3 = 45 by construction, and LATAM's 2+0+0+0 = 2 explains why no reactivation budget goes there. The chips each guard a failure: 'sent' matches no status and zeroes the in-flight column; 'delivered' in the in-flight slot duplicates the landed column so sends double-count; o.id joins posts to whoever shares their row number and reassigns every region; region alphabetizes the census; and ASC opens the meeting on LATAM's 2 posts instead of EU's 45. The read underneath: the US is the only region where in-flight (10) outruns landed (5) — a delivery-confirmation backlog, not a publishing gap.",
    },
    {
      id: "cs-substack-2",
      tier: "hard",
      topic: "q2",
      universe: "pricing",
      title: "The above-the-mean read",
      brief:
        "Monetization memo on the storefront db: the pricing review opens with the above-the-mean read — which publications' average issue revenue clears the platform-wide mean — because the recommendations network should be boosting writers the economics already reward. Probed facts: 103 posts worth 34,833.28, so the mean issue books 338.19; the spread runs 25.47 to 1,088.44; the top publication by lifetime book books 7,262.35 over 24 posts while a 17-post publication books 6,640.56. Definitions are pinned: the mean is the platform fold (SELECT AVG(total) FROM orders), not the filtered base's.",
      ask: "Return each publication above the platform mean with its post count and average issue value to 2 decimals, highest average first.",
      template:
        "SELECT c.name AS publication,\n       c.region AS region,\n       COUNT(*) AS posts,\n       ROUND(AVG(o.total), {1}) AS avg_issue_value\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY {2}\nHAVING AVG(o.total) > (SELECT {3}(total) FROM orders)\nORDER BY avg_issue_value {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          label: "the average's precision",
          why: "Issue-value reports read to 2 decimals — 390.62, 533.59. ROUND(…, 1) prints 390.6 and the cells stop reconciling with the 338.19 mean monetization quotes on the same slide.",
        },
        {
          answer: "c.id",
          kind: "keyword",
          label: "the publication grouping key",
          why: "GROUP BY c.id folds posts to their publication — 16 groups before the gate. GROUP BY o.id makes every post its own group, so the average equals the post's own total and the mean-comparison becomes a tautology.",
        },
        {
          answer: "AVG",
          kind: "keyword",
          label: "the mean-issue fold",
          why: "The platform mean is AVG(total) — 338.19 over all 103 posts. SUM returns the whole 34,833.28 book and the gate empties; MIN returns 25.47 and everything passes; MAX returns 1,088.44 and nothing does.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the highest-average-first order",
          why: "The review reads best economics first: 705.39, 533.59, 486.32, down to 390.62. ASC would open on the barely-above-mean tail instead of the head the recommendations network should boost.",
        },
      ],
      distractors: ["0", "MIN", "c.customer_id", "SUM", "ASC"],
      walkthrough:
        "A fold, a gate, a scalar. The join folds each publication's posts into one row — post count beside average issue value rounded to 2 decimals — and the HAVING gate compares each publication's average to the platform fold (SELECT AVG(total) FROM orders): 338.19, the mean over ALL 103 posts, not the filtered base's. Seven publications clear it: 705.39 on a single post, 533.59 over 5, 486.32 over 3, 444.8 over 1, 426.22 over 2, 421.54 over 4, and 390.62 over 17 — the only high-volume masthead in the head, which is why the network pod reads this list before boosting. The chips each break differently: 0 in the precision slot truncates to whole dollars and the cells stop reconciling with the 338.19 slide; GROUP BY anything but c.id re-partitions the base so the comparison stops comparing publications; c.customer_id is no column and errors; SUM in the scalar returns the 34,833.28 book so the gate empties; MIN returns 25.47 so all sixteen pass; ASC reads the tail first. The scalar subquery's contract is the point: 0-or-1 rows, 1 column — and on a filtered staging table an empty inner fold returns NULL, so the gate passes nobody while looking valid.",
    },
    {
      id: "cs-substack-3",
      tier: "medium",
      topic: "s4",
      universe: "funnel",
      title: "The never-sent set",
      brief:
        "Coverage-packet brief, in-world: publishing ops closes each review by diffing the booked calendar against the actually-sent set — 'which posts were booked and never fired' — because the answer splits into two populations the ops board treats differently: 14 scheduled posts (pending, queued for future slots) and 7 killed posts (cancelled before send). Probed on the storefront db: 103 posts booked, 82 carry the shipped_at send stamp, so the never-sent set is 21 — EXCEPT is the packet's set algebra, booked ids minus sent ids, and the count must reconcile: 82 sent + 21 never-sent = 103 booked by construction.",
      ask: "Return one row: the count of posts that were booked but never sent.",
      template:
        "SELECT {1}(*) AS never_sent\nFROM (\n  SELECT id FROM orders\n  {2}\n  SELECT id FROM orders\n  WHERE shipped_at IS {3}\n);",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the set counter",
          why: "COUNT(*) counts the diffed rows — the 21 booked-but-never-sent posts. SUM would add the post ids themselves into a meaningless five-figure id-sum wearing a count's name, and the packet's headline would stop being a population.",
        },
        {
          answer: "EXCEPT",
          kind: "keyword",
          label: "the coverage differ",
          why: "EXCEPT returns ids in the booked set that never appear in the sent set — exactly the packet's question. INTERSECT would return the sent 82, and flipping the operands would diff the wrong direction.",
        },
        {
          answer: "NOT NULL",
          kind: "keyword",
          label: "the sent-set stamp",
          why: "The sent set is defined by the send stamp: shipped_at IS NOT NULL keeps the 82 fired posts. IS NULL would flip the right side to the 21 never-sent posts themselves, and EXCEPT would return the 82 sent ids — the mirror-image answer.",
        },
      ],
      distractors: ["SUM", "INTERSECT", "NULL"],
      walkthrough:
        "Set algebra with a reconcile check. The right branch builds the sent set — ids where shipped_at IS NOT NULL, 82 posts; the left branch is the whole booked calendar, 103 ids; EXCEPT subtracts the sets and keeps the 21 booked-but-never-sent posts, which COUNT folds into one number for the packet. The reconcile is the audit: 82 sent + 21 never-sent = 103 booked by construction, and the 21 split into 14 scheduled (pending — 'not yet') and 7 killed (cancelled before send), populations the ops board funds differently. The chips each break the diff: SUM(id) adds primary keys into a five-figure nothing; INTERSECT answers the opposite question — the 82 posts that did send; and IS NULL on the stamp flips the right operand to the never-sent set itself, so EXCEPT hands back the 82 sent posts and the packet's headline inverts. EXCEPT also dedupes both inputs first — if a double-booked post id were the anomaly being hunted, the row-honest diff would be a LEFT JOIN … IS NULL anti-join instead.",
    },
    {
      id: "cs-substack-4",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The revenue-spine walk",
      brief:
        "Growth-call brief, in-world: the monthly revenue walk is how every cadence conversation starts — each month's booked revenue, the prior month's beside it, and the dollar delta — so the trough and the jump are named from the table, not from memory. Probed on the storefront db: 14 months from 2024-01 to 2025-02 over 103 posts worth 34,833.28; the book opens at 3,731.97, slides 853.57 into the 1,193.86 July trough, then jumps +1,158.21 into August (2,352.07). LAG carries the baseline; the first month's delta is honestly NULL — no prior row, no invented zero.",
      ask: "Return month, revenue, the prior month's revenue and the dollar delta, for every month of the spine.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), {1}) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       revenue,\n       LAG(revenue) OVER (ORDER BY month) AS prev_revenue,\n       ROUND(revenue - LAG(revenue) OVER (ORDER BY month), 2) AS delta\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the revenue precision",
          why: "Revenue reports to the cent — 3,731.97, 1,193.86. ROUND(…, 1) prints 3732.0 and the cells stop reconciling with the 2-dp figures the call quotes (the +1,158.21 August jump).",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A spine walk is chronological: ASC keeps 2024-01 on top so each delta reads against the row above it. DESC tells the story backwards — the trough arrives before the slide that caused it.",
        },
        {
          answer: "14",
          kind: "number",
          noVerify: true,
          label: "the full-spine cut",
          why: "LIMIT 14 is the whole spine — all 14 months from 2024-01 to 2025-02, trough and jump included. Cutting earlier amputates exactly the rows the call narrates.",
        },
      ],
      distractors: ["DESC", "0", "SUM"],
      walkthrough:
        "Stage the grain, then walk it. The CTE folds 103 posts into 14 monthly revenue rows (SUBSTR month key, SUM rounded to the cent); the outer query reads each month beside its neighbor: LAG(revenue) OVER (ORDER BY month) brings January's 3,731.97 into February's row, and the delta is pure subtraction — -122.33 into February, -992.56 into March, -853.57 into the July trough at 1,193.86, then +1,158.21 into August. The first month is NULL by design: no prior row, no baseline, no zero dressed up as flat. The staging matters twice over — the window isn't visible to WHERE, and the alias prev_revenue isn't visible to its sibling expression, which is why the delta repeats the LAG instead of referencing the alias. LEAD would read the future; DESC walks backwards; LIMIT 0 empties the walk; SUM in the precision slot errors. Every chip changes what the call would conclude about cadence.",
    },
    {
      id: "cs-substack-5",
      tier: "easy",
      topic: "t3",
      universe: "funnel",
      title: "The draft-to-send latency read",
      brief:
        "Publishing-ops brief, in-world: the cadence queue gets pulled whenever draft-to-send latency drifts off norm, so the Monday read states the population and the spread in one row. Probed on the storefront db: 82 of 103 posts carry the shipped_at send stamp (the 14 scheduled and 7 killed have none — a population definition, not a cleanup job); over those 82 the draft-to-send latency averages 2.98 days with a 2-to-4-day spread — 27 posts at 2 days, 30 at 3, 25 at 4. The number ships with its population in the title, or it doesn't ship.",
      ask: "Return the sent-post population, the average draft-to-send latency to 2 decimals, and the fastest/slowest spread in whole days.",
      template:
        "SELECT COUNT(*) AS sent_posts,\n       ROUND(AVG(julianday({1}) - julianday(created_at)), {2}) AS avg_days,\n       MIN(CAST(julianday(shipped_at) - julianday(created_at) AS INT)) AS fastest_days,\n       MAX(CAST(julianday(shipped_at) - julianday(created_at) AS INT)) AS slowest_days\nFROM orders\nWHERE shipped_at IS {3};",
      slots: [
        {
          answer: "shipped_at",
          kind: "keyword",
          label: "the send-stamp operand",
          why: "Latency is booking to send: julianday(shipped_at) − julianday(created_at). julianday(created_at) against itself computes zero for every row and the average reads 0.0 — a real number answering a question nobody asked.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the latency precision",
          why: "The norm is quoted to 2 decimals — 2.98, matching the figure every metric card in this kit carries. One decimal prints 3.0 and the drift conversation starts from the wrong baseline.",
        },
        {
          answer: "NOT NULL",
          kind: "keyword",
          label: "the sent-population filter",
          why: "WHERE shipped_at IS NOT NULL keeps the 82 stamped posts — scheduled and killed rows carry no stamp and no latency, and mixing them in would shrink the average's population silently. The WHERE clause is doing definitional work and says so.",
        },
      ],
      distractors: ["created_at", "1", "NULL"],
      walkthrough:
        "One row, three commitments. The WHERE clause fixes the population: shipped_at IS NOT NULL keeps the 82 posts that actually fired — the 14 scheduled and 7 killed stay out, and the title says 'sent posts only' because the filter is doing definitional work. julianday() parses each TEXT timestamp into a fractional day count, so the subtraction is real arithmetic: AVG lands at 2.98 days, and the CAST-to-INT MIN/MAX bracket the spread at 2 and 4 — 27 posts at two days, 30 at three, 25 at four, a distribution the queue team can act on. The chips each break a commitment: julianday(created_at) measures zero days against itself and 'proves' instant sends; 1 decimal rounds the norm to 3.0 and drift detection starts from the wrong baseline; IS NULL keeps the 21 unstamped posts, whose latency is NULL — an average of nothing wearing the funnel's name.",
    },
    {
      id: "cs-substack-6",
      tier: "medium",
      topic: "j7",
      universe: "pricing",
      title: "The tier-line ledger",
      brief:
        "Monetization brief, in-world: the pricing review reads the tier lines — every send line each issue ships across, free list and paid list — because paid expansion shows up here first: a post added to a paid tier is a new line, not a new post. Probed on the storefront db: 251 tier lines over 103 posts carrying 498 sends; by region, EU runs 105 lines / 199 sends / 15,089.23 of value, APAC 88 / 174 / 11,605.45, US 53 / 112 / 7,286.16, LATAM 5 / 13 / 852.44. The floor in the query keeps regions carrying at least five tier lines, so every region survives the cut — and the floor is verifiable because LATAM sits exactly on it.",
      ask: "Return each region with its tier-line count, send volume and line value to 2 decimals, biggest line value first, keeping regions with at least five lines.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS lines,\n       SUM(oi.quantity) AS sends,\n       ROUND(SUM(oi.unit_price * oi.quantity), {1}) AS line_value\nFROM order_items oi\nJOIN orders o ON o.id = {2}\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nHAVING COUNT(*) >= {3}\nORDER BY line_value {4};",
      slots: [
        {
          answer: "2",
          kind: "number",
          noVerify: true,
          label: "the value precision",
          why: "Line value reports to the cent — 15,089.23 reconciling with the EU book quoted in the leaderboard read. ROUND(…, 1) prints 15089.2 and the cells stop footing with the 2-dp regional totals.",
        },
        {
          answer: "oi.order_id",
          kind: "keyword",
          label: "the line-to-post key",
          why: "Each tier line attaches to its post through oi.order_id = o.id. Joining on o.id pairs every line with every post sharing nothing — a 251 × 103 fan-out that reassigns every region's counts before the fold.",
        },
        {
          answer: "5",
          kind: "number",
          label: "the line floor",
          why: "HAVING COUNT(*) >= 5 keeps every region — LATAM sits exactly on the floor with 5 lines, and keeping it visible is the point: a region one line away from the cut is a live pricing question. The figure 5 is also LATAM's own line count in the output.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-value-first order",
          why: "The pricing review reads best economics first: 15,089.23, 11,605.45, 7,286.16, 852.44. ASC would open on LATAM's 852.44 — the tail the memo footnotes, not the head it prices.",
        },
      ],
      distractors: ["LEFT", "ASC", "MAX(amount_cents)"],
      walkthrough:
        "Two joins, one fold, a stated floor. order_items joins to orders on oi.order_id (251 lines attach to their 103 posts) and to customers for the region; GROUP BY c.region folds the lines into four rows — EU 105 lines / 199 sends / 15,089.23, APAC 88 / 174 / 11,605.45, US 53 / 112 / 7,286.16, LATAM 5 / 13 / 852.44 — and the SUMs foot to the platform book: 251 lines, 498 sends, 34,833.28. The HAVING floor is a group-level fact — five lines minimum — and LATAM sits exactly on it, which is why the floor is 5 and not 6: the cut is verifiable in the output, not assumed. The value column is line-grain (unit_price × quantity), so no fan-out doubling — the trap this kit's join theory drills — because the multiplication happens on the line's own columns. The chips each break the read: LEFT in the join key is a syntax error, ASC opens on the tail, and MAX(amount_cents) — the money column from the neighboring billing tables — errors in every slot it touches, a reminder that this ledger's money lives in unit_price × quantity, not amount_cents.",
    },
  ],

  problems: [
    { slug: "analyze-subscription-conversion", why: "Free list to paid conversion via LEFT JOIN with the NULL arm named: readers who never upgrade are the answer, not an artifact — the exact shape of the tier-conversion read." },
    { slug: "email-engagement-funnel", why: "Open and click stages with denominators printed per step — the open-rate funnel email ops ships weekly; the drop-off between send and open is the deliverability story." },
    { slug: "winback-recovery", why: "Writers who stopped publishing and came back — the win-back window measured over timestamps, the reactivation calendar's core query." },
    { slug: "cohort-retention-matrix", why: "Subscribers bucketed by signup month and tracked forward — the retention matrix that decides whether a publication's paid tier is compounding or leaking." },
    { slug: "week-over-week-churn", why: "Unsubscribes walked week over week with LAG — the churn pulse that fires the win-back campaign before a list goes cold." },
    { slug: "growth-accounting", why: "New, retained and resurrected readers reconciled in one pass — Substack-style growth accounting where the identity must close to the total or the board deck ships wrong." },
    { slug: "net-revenue-retention", why: "Paid-tier expansion versus churn rolled into NRR — the number the monetization pod actually manages, cohort revenue walked with LAG." },
    { slug: "dau-wau-stickiness", why: "DAU over WAU as a habit read — for a newsletter, opens-per-week is the stickiness curve, and the ratio drill is identical." },
    { slug: "rolling-7d-actives", why: "Rolling distinct reader counts over a 7-day frame — the notes-feed engagement read: distinct counting over a moving window, drift-proof by construction." },
    { slug: "article-views-ii", why: "Posts above a view threshold with HAVING — the viral-issue census; the filter lives after the fold or it does not exist." },
    { slug: "invalid-tweets", why: "Length-gated content validation — notes carry a character budget, enforced with LENGTH before anything joins." },
    { slug: "fix-names-in-a-table", why: "Publication name hygiene before any join: imports arrive title-case-broken, and 'the morning ledger' versus 'The Morning Ledger' silently splits one masthead into two." },
    { slug: "find-followers-count", why: "Subscriber counts per publication — the audience-size leaderboard's raw fold, one GROUP BY away from the network board." },
    { slug: "number-of-comments-per-post", why: "Comment threads folded per post — the engagement-depth read that decides which issues the recommendations network amplifies." },
    { slug: "ltv-cac-payback", why: "Writer acquisition spend versus lifetime paid revenue — the payback window that prices the recommendations program." },
    { slug: "mrr-waterfall", why: "Paid-subscriber movement decomposed — new, churned, downgraded — the subscription-revenue waterfall beneath every number this kit quotes." },
    { slug: "funnel-step-conversion", why: "Per-step denominators printed beside each stage — the send funnel (booked → sent → landed) with no silent shrink between steps." },
    { slug: "immediate-food-delivery-i", why: "Share of sends fired on the booking day itself — the same-day-publish rate, a conditional ratio at post grain." },
    { slug: "unique-orders-and-customers-per-month", why: "Posts and publications per month in one row — the two-grain cadence census growth opens every review with, drilled at practice scale." },
    { slug: "combine-two-tables", why: "Publications LEFT JOINed to posts: dormant mastheads ARE the answer. Choosing the join type is the business statement." },
    { slug: "employee-bonus", why: "A bonus below 100 or NULL must both survive — the NULL-payload drill behind every never-settled payout row on the rails." },
    { slug: "rank-scores", why: "Pure tie semantics — the cadence ladder's shared-rungs-versus-gaps decision, made explicit before the leaderboard ships." },
    { slug: "top-five-artists", why: "The top-five shelf: rank then cut — with the follow-up always being what happens to ties at the boundary." },
    { slug: "the-category-of-each-member-in-the-store", why: "Customers banded by spend with CASE — the free/standard/founding tier classification at practice scale, edges published or it's fiction." },
    { slug: "weather-type-in-each-country", why: "CASE labels per group inside a join — the region readout format the network board actually reads, codes translated into business words." },
    { slug: "year-on-year-growth-rate", why: "The spine walked year over year — same-month baselines, NULL on the first row, no invented zeros. The publishing trend's home drill." },
    { slug: "the-airport-with-the-most-flights", why: "Coverage set algebra: which destinations never saw a flight — the EXCEPT/anti-join shape behind 'booked but never sent'." },
    { slug: "customers-who-never-order", why: "Dormant-publication anti-join: on this db a confident zero, and proving the zero — not assuming it — is part of the job." },
    { slug: "managers-with-at-least-5-direct-reports", why: "Fold per publication, judge against a cadence tier — HAVING on a derived count, the escalation every growth screen runs." },
    { slug: "second-highest-salary", why: "The second rung: LIMIT OFFSET breaks on ties, DENSE_RANK doesn't — the leaderboard follow-up Substack's panel loves." },
    { slug: "monthly-transactions-ii", why: "Payout runs per month split settled/void with zero-buckets printed — the rails census the payouts pod closes with, in INTEGER cents." },
    { slug: "bank-account-summary-ii", why: "Per-writer settlements and bookings in INTEGER cents — the /100.0 discipline the payout true-up reports run on." },
  ],
};
