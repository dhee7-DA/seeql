// Marriott — kit 7 of the Travel & Hospitality domain (Batch H).
// Global hotel chains: property performance, loyalty tiers and ADR/RevPAR
// reads over a franchised portfolio. Pool provenance: Marriott has NO
// registry tags in this app's pools — 0 tagged LC problems — so every topic
// and problem slug is theme-curated from scripts/company-pools.md's theme
// menu, mirroring the workflows Marriott screens are known to probe (rate
// reads, tier CASE rolls, occupancy windows, operator audits). Case studies
// run on the storefront db with probed figures from
// scripts/company-facts.md — mapped honestly as suppliers=property operators
// (ownership groups), products=room categories, orders=stays/bookings,
// customers=Bonvoy guests, shipped_at=check-in, region=market.

import type { CompanyKit } from "../types";

export const marriottKit: CompanyKit = {
  id: "marriott",
  domainId: "travel",
  name: "Marriott",
  tagline: "Global hotel chains: properties, stays, loyalty",
  accent: "text-red-300",

  brief: [
    "**Marriott** is the world's largest hotel company by rooms — a portfolio of brands operated under management and franchise agreements, which means the analytics reality is *portfolio math*: thousands of properties the company mostly doesn't own, run to one standard and one loyalty stack. In this app's training db the mapping is honest: `suppliers` are property operators (ownership groups), products are room categories, orders are stays, customers are Bonvoy guests, and shipped_at is check-in. Probed scale: **6 operators carrying 16 room categories**, 103 stays worth **34833.28** across 251 line items, and operator quality ratings from 3.9 to 4.8.",
    "The data org mirrors the operating model. Portfolio analytics owns the property read — revenue and stay pace per operator, where the top group (Nordic Gadgets AB, **32%** of portfolio revenue) is watched like a flagship asset. Loyalty owns the tier stack: Bonvoy-style bands cut on lifetime guest spend, and the db is concentrated — **63.5%** of stay value comes from guests whose lifetime spend crosses 3000, **71.2%** from the 2000 line. Revenue analytics owns the rate read — average selling price per market, US baskets at 383.48 against APAC's 313.66. Finance reconciles operator settlements where money sits as integer cents.",
    "The SQL screens are live-db and grain-obsessed. You get `order_items` joined through products to operators and asked for room nights, revenue and coverage per operator — and the audit is whether you counted LINES, units or room types. Checks-in are {emerald:state-based}: 82 of 103 stays carry a check-in, 14 sit {amber:pending}, 7 are {rose:cancelled}, and the completion read must keep all 103 in the denominator. Traps are honest ones: every guest and every room category has moved at least once, so dead-inventory anti-joins return **zero rows** — the real leaks live in status mix and settlement states.",
    "Prep for definition-first questions: ADR as an average-selling-price fold, occupancy and completion as conditional counts over ALL placed stays, tier rolls as `CASE` over folded lifetime spend with the boundary values stated out loud. Drill `julianday` for the **2.98-day** booking-to-check-in lead, month buckets for the 2024-01 to 2025-02 pace trend, and window ranks for property boards where ties are real. Then rehearse the sentence this company actually grades: *the numerator is stays that checked in, the denominator is every stay placed — 82 of 103, and I can show both*.",
    "Below the dashboards sits the pipeline the queries actually ride. Property systems push stay events nightly; the warehouse lands them as the tables here — `orders` carry a booking stamp in created_at and a check-in stamp in shipped_at, `order_items` hold booked room nights at line rates, and six operator rows are what the whole portfolio rolls up to. Money lands separately in {rose:integer cents}: invoices, payments and the ledger all divide by 100.0 before they print, and the closing assertion is the ledger tying **181080 against 181080**. *Analysts who quote a cents figure as dollars do not get a second meeting.*",
    "Senior screens add three moves on top of the basics: set-op comparisons — markets you're winning versus markets you're merely present in, built with `UNION` and `EXCEPT` — share-of-portfolio windows that compute the **32%** operator concentration live instead of quoting it, and latest-state picks that pull each room category's most recent booking with a windowed `ROW_NUMBER` instead of a fragile `MAX` join. The tier above entry screens runs the same portfolio with one extra demand: *name the denominator your number protects before you show the number itself*."
  ],

  dayInLife: [
    "**08:00 —** Portfolio pace first: last night's board — 103 stays placed, 82 checked in, 14 {amber:pending} arrivals, 7 {rose:cancelled} — and operator revenue ranks, where Nordic's **32%** share is either the flagship holding or the concentration risk depending on the week. *The board is read twice: once as performance, once as exposure.*",
    "**11:00 —** Deep work: the rate and tier cut. ADR by market — `SUM(revenue) over room nights` folded per region, US 383.48 against APAC's 313.66 — then the Bonvoy roll: guests at 3000-plus lifetime spend are **63.5%** of stay value from four names. `julianday` lead-time buckets run alongside: the **2.98-day** network average, APAC fastest at 2.93.",
    "**14:30 —** Owner-services call: operator coverage and quality — the four groups running at least three room categories, the **4.5**-plus trusted bench (two of six operators), and settlement aging where one invoice shows a payment against a {rose:void} status. The asset lead asks for the check-in rate *with its denominator*; the slide gets 82-of-103, not a filtered rate.",
    "**17:30 —** EOD writeup: the tier roll ships with its CASE boundaries documented — who is ambassador at exactly 3000 — and the data-quality queue takes tomorrow's first ticket: two operator feeds double-logging rate changes, queued for a `ROW_NUMBER` dedupe. Definitions first, numbers second; that order is the whole job here.",
    "**19:45 —** Night audit, analyst edition: the batch feed lands and the sanity pack runs before anyone trusts tomorrow's board — the 103-stay census with its status mix intact, the 82-of-103 check-in read recomputed from raw rows, the ledger still tying **181080 to 181080**. A {rose:cancelled} spike in one market or a tier-band shift gets logged as a feed suspect, not a business fact, before the 08:00 read inherits it. *Boring boards are the KPI* — nightly discipline is how they stay boring."
  ],

  metrics: [
    { name: "ADR (average daily rate)", what: "Rate realization: stay revenue over room nights, folded per market and property class — US 383.48 versus APAC 313.66 on the db. The rate conversation starts where ADR drifts." },
    { name: "RevPAR", what: "Revenue per available room night — ADR times occupancy. It punishes empty nights the way ADR can't, which is why portfolio reviews lead with it." },
    { name: "Stay completion (check-in) rate", what: "Stays that checked in over ALL stays placed — 82 of 103. COUNT(shipped_at) over COUNT(*); filtering the denominator first prints a flattering 100% that owner services will catch." },
    { name: "Cancellation share", what: "Cancelled stays over placed stays — 6.8% network, 8.1% APAC. Group blocks and long leads cancel late, so pace forecasts carry this haircut explicitly." },
    { name: "Booking-to-check-in lead", what: "julianday(check-in) minus julianday(booking) — 2.98 days average, range 2 to 4. Lead length drives staffing, overbooking buffers and pre-arrival upsell windows." },
    { name: "Bonvoy tier mix", what: "Guests rolled into spend bands on lifetime value — on the db: 4 ambassador-tier guests (3000-plus), 1 platinum (2000-2999), 11 members. Tier mix per property decides upgrade inventory." },
    { name: "Guest value concentration", what: "Share of stay value from guests above a lifetime threshold — 63.5% at the 3000 line, 71.2% at 2000. A loyalty program is only as durable as this curve is steep." },
    { name: "Operator concentration", what: "Portfolio revenue share per operator — the top group at 32%, the bottom two under 9% each. Franchised portfolios read this as both performance and exposure." },
    { name: "Monthly pace (stays & revenue)", what: "Stays folded into SUBSTR(created_at, 1, 7) month buckets — 8 stays / 3731.97 in 2024-01 through 7 / 2390.53 in 2025-02, thirteen buckets. The board deck's first chart; bucket by booking stamp, not check-in, or the trend re-anchors itself." },
    { name: "Lead-time mix", what: "The **2.98-day** average booking-to-check-in lead is a mean over a mix that only spans 2, 3 and 4 days. Averages hide the buckets staffing actually plans against, so the ops pack prints the mix beside the mean." },
    { name: "Settlement coverage (AR)", what: "Invoices settled exact / open / partial — 21 / 6 / 1 on this ledger, with 15217 unpaid and the one partial at 4000 of 6148. Integer cents divide by 100.0 once, at the edge, or the close prints truncated dollars." },
    { name: "Operator quality bench", what: "Operators rated 4.5-plus: Nordic Gadgets AB at 4.6 (3 categories) and Alpine Audio GmbH at 4.8 (2). A quality gate, deliberately distinct from the 3-category coverage bar that drops 4.8-rated Alpine." },
  ],

  topics: [
    {
      name: "Operator & property joins",
      why: "The portfolio is a join graph: stays to guests, line items to room categories to operators. Grain discipline through that chain — bookings versus lines versus room types — is the first thing a Marriott screen tests, and missing-profile survival rules come with it.",
      slugs: ["combine-two-tables", "sales-analysis-ii", "employees-with-missing-information"],
    },
    {
      name: "ADR & rate reads",
      why: "Average selling price IS average daily rate once you map units to nights. Rate reads mean weighted-average folds, as-of price lookups for parity disputes, and properties pricing above the portfolio benchmark.",
      slugs: ["average-selling-price", "find-expensive-cities", "product-price-at-a-given-date"],
    },
    {
      name: "RevPAR-style conditional folds",
      why: "One pass, many counters: stayed, pending, cancelled, revenue — folded per market or per operator. Conditional aggregation over status, day-of-week demand and stay-length buckets are the portfolio-review workhorses.",
      slugs: ["immediate-food-delivery-ii", "sales-by-day-of-the-week", "calculate-orders-within-each-interval"],
    },
    {
      name: "Bonvoy tier CASE",
      why: "Loyalty tiers are CASE expressions over folded lifetime spend, and the boundaries (3000, 2000) are program definitions someone owns. Mis-set a boundary and guests migrate tiers without ever booking again.",
      slugs: ["the-category-of-each-member-in-the-store", "type-of-triangle", "customer-purchasing-behavior-analysis"],
    },
    {
      name: "Tier migration with LAG",
      why: "Members move between tiers and inactivity decays them; both reads compare a guest's state to their previous state. LAG transitions, growth accounting and year-over-year deltas are the loyalty-health drills.",
      slugs: ["plan-migration-paths", "growth-accounting", "year-on-year-growth-rate"],
    },
    {
      name: "Property ranking boards",
      why: "Property scorecards rank folded metrics where ties are common — two operators at three room types, two stays at the same rate. RANK versus DENSE_RANK versus second-highest logic is a board-design decision, not syntax trivia.",
      slugs: ["rank-scores", "second-highest-salary", "group-employees-of-the-same-salary"],
    },
    {
      name: "Occupancy & overbooking windows",
      why: "Rooms are perishable and inventory is double-sold on purpose: overbooking detection, capacity-greedy boarding and concurrent-stay counting are the supply-side drills that map directly to revenue-management work.",
      slugs: ["find-overbooked-employees", "last-person-to-fit-in-the-bus", "employee-task-duration-and-concurrent-tasks"],
    },
    {
      name: "Stay overlaps & intervals",
      why: "A stay is an interval, so portfolio questions are interval questions: which date ranges overlap, which halls (properties) host overlapping events, which bookings collide. Half-open-interval joins are the drill.",
      slugs: ["find-overlapping-shifts", "merge-overlapping-events-in-the-same-hall", "leetflex-banned-accounts"],
    },
    {
      name: "NULL & data-quality discipline",
      why: "A NULL check-in is a business state — not yet arrived — and COUNT(col) versus COUNT(*) is the difference between an honest completion rate and a 100% fairy tale. Null audits and NULL-safe filters keep the portfolio read defensible.",
      slugs: ["books-with-null-ratings", "null-blank-audit", "find-customer-referee", "number-of-rich-customers"],
    },
    {
      name: "Settlement & ledger reads",
      why: "Operator money settles in integer cents across invoices, payments and a ledger that must tie to zero. Month-bucketed pace, conditional-SUM reconciliations and AR aging are the finance-side screens.",
      slugs: ["trial-balance-check", "monthly-transactions-i", "ar-aging-schedule"],
    },
    {
      name: "Pace & month buckets",
      why: "The pace trend is a bucketing drill with a stamp choice: the booking date anchors demand, the check-in stamp anchors arrivals, and the two boards disagree by design. Month keys built with `SUBSTR` sort correctly as text and keep the 2024-01 to 2025-02 window honest.",
      slugs: ["list-the-products-ordered-in-a-period", "unique-orders-and-customers-per-month", "user-activity-for-the-past-30-days-i"],
    },
    {
      name: "Set ops & matched pools",
      why: "Portfolio reviews live on comparisons — markets with arrivals versus markets with only intent, rate plans in both systems versus one. `UNION` stacks, `EXCEPT` diffs and the ALL-versus-dedup choice are the grammar of 'versus', and a cancellation-free market (LATAM, at zero) is exactly what an EXCEPT surfaces.",
      slugs: ["monthly-transactions-ii", "count-salary-categories", "team-scores-in-football-tournament"],
    },
    {
      name: "Latest-state & argmax reads",
      why: "The most recent booking per room category, the top-selling category per market — argmax shapes that a `MAX` join fumbles whenever two rows tie on the timestamp. Window picks with deterministic tiebreakers are the reliable build, and ties are real on this db.",
      slugs: ["the-most-recent-orders-for-each-product", "most-frequently-ordered-product-per-customer", "highest-grade-for-each-student", "top-travellers"],
    },
    {
      name: "Share-of-portfolio windows",
      why: "Concentration is a window job: each operator's revenue over the portfolio total, each guest's share of stay value — the **32%** flagship and the **63.5%** top-band facts computed live, not quoted. `PARTITION BY` and window aggregates turn one fold into a board.",
      slugs: ["portfolio-weights", "portfolio-concentration-hhi", "find-the-team-size"],
    },
    {
      name: "Catalog text hygiene",
      why: "Feed discipline is string discipline: category labels arriving with casing drift, room names padded before they join, codes that need `SUBSTR` before they compare. Text-func cleanups decide whether the portfolio read matches the books or quietly splits one category into three.",
      slugs: ["fix-product-name-format", "invalid-tweets", "fix-names-in-a-table"],
    },
  ],

  theory: [
    {
      id: "marriott-t1",
      q: "You join line items to room categories to operators for the operator scorecard. What grain are you on, and how do you keep the three counts straight?",
      a: "The join grain is LINES: every row is one booked line item, so COUNT(*) counts room nights booked (56 for the biggest operator on this db), COUNT(DISTINCT product_id) counts room types (3, 3, 2 …), and SUM(quantity) counts units. Three different business questions live in the same rows, and the scorecard that confuses them ships nonsense — '43 room nights across 43 room types' is possible only if every line booked a distinct category once. My rule: state the grain per column in the SELECT, and when a metric needs a different grain, aggregate to that grain first in a CTE instead of hoping DISTINCT saves the fold.",
      tag: "joins",
    },
    {
      id: "marriott-t2",
      q: "A property board ranks operators by revenue, and two of them tie exactly. What changes between RANK, DENSE_RANK and ROW_NUMBER — and which do you ship?",
      a: "ROW_NUMBER assigns arbitrary distinct rungs inside the tie — the board looks precise and is actually ordered by rowid luck. RANK gives tied operators the same rung and skips the consumed slots (3, 3, then 5), which is honest about how many operators sit above the next one. DENSE_RANK numbers rungs consecutively (3, 3, then 4), which reads cleaner but hides how deep the tie was. For an owner-facing scorecard I ship RANK with a deterministic tiebreaker — operator id — and say the policy out loud, because 'tied at 3' is a fact owner services will ask about, and 'why is this one fifth' is a question ROW_NUMBER answers with a shrug.",
      tag: "windows",
    },
    {
      id: "marriott-t3",
      q: "Compute portfolio completion rate — stays that checked in over stays placed — so it survives the owner-services review.",
      a: "COUNT(o.shipped_at) over COUNT(*) after the operator or market join: 82 of 103 on this db, about 79.6%. The numerator rides COUNT's NULL-blindness — shipped_at is NULL until check-in — so the 14 pending and 7 cancelled stays stay in the denominator. The traps I pre-empt in the walkthrough: filtering WHERE status IN ('delivered','shipped') first collapses the denominator to 82 and prints 100%; excluding cancelled only (96) claims pending arrivals have happened; and multiplying by 100.0 BEFORE the division, not after, keeps integer folds from truncating to 79 or 0. The rate, the base, and the definition all travel together on the slide.",
      tag: "aggregation",
    },
    {
      id: "marriott-t4",
      q: "The tier roll shows an empty platinum band. Is that a data problem or a query problem?",
      a: "A query problem wearing a data costume. With boundaries at 3000 and 2000, one guest (2667.93 lifetime) is platinum — an empty band means the CASE boundaries or the spend fold changed: spend computed per booking instead of per guest, a WHERE that leaked guests out, or the BETWEEN/>= boundary at 2000 flipped to exclude its edge. On this db the roll reads 4 ambassador / 1 platinum / 11 member, and 63.5% of value sits in the top band — so an empty platinum band contradicts known facts and the roll gets re-audited, not explained. Empty bands from definitions are legitimate; empty bands that contradict a verified census are bugs, and the discipline is knowing which one you're looking at.",
      tag: "nulls",
    },
    {
      id: "marriott-t5",
      q: "Why does WHERE COUNT(*) > 10 fail, and what does the fix cost you conceptually?",
      a: "Because WHERE runs before GROUP BY — the fold doesn't exist yet where the row filter executes, so the reference is an error (or worse, silently resolved against something else). The gate on a fold is HAVING. The conceptual cost: you must hold the pipeline in your head — FROM/JOIN build rows, WHERE filters rows, GROUP BY folds, HAVING filters groups, SELECT projects, ORDER BY sorts last — and place each condition at the stage where its inputs exist. On a portfolio read the market filter stays in WHERE (row-level), the small-N gate on stay counts moves to HAVING (fold-level), and mixing them up either crashes the query or quietly evaluates a column you didn't mean.",
      tag: "pipeline",
    },
    {
      id: "marriott-t6",
      q: "ADR needs the rate as of each booking date, not today's rack rate. How do you build that read?",
      a: "An as-of join: for each stay, pick the rate row whose effective window contains the booking date — the highest effective_from that is <= the booking date, via a correlated subquery, a windowed pick (ROW_NUMBER over effective_from descending, filtered to rn = 1) or a range join on half-open intervals. The discipline that matters: never join to 'current price', because parity disputes are settled against the price the guest SAW, and rates move. On this db the analogous read is product-price-at-a-given-date — price effective at booking time for every line — and the interview follow-up is always the boundary: a rate effective exactly on the booking date belongs in the window, so the predicate is <=, not <.",
      tag: "subqueries",
    },
    {
      id: "marriott-t7",
      q: "Monthly pace for the board deck and lead time for the ops pack — both from the same stays table. What date machinery does each need?",
      a: "Pace is bucketing: SUBSTR(created_at, 1, 7) builds a '2024-01' month key that GROUP BY folds and sorts correctly as text — the 13-bucket trend from 2024-01 (8 stays, 3731.97) through 2025-02. Lead time is arithmetic: julianday(shipped_at) - julianday(created_at) over the 82 checked-in stays, averaged to 2.98 days with the 2-to-4 range quoted beside it. The traps I name: bucketing by the raw timestamp gives 103 groups of one; julianday over a NULL check-in NULLs the row — which is the definition (no check-in, no lag), not dirt; and rounding happens once, at the edge, so the deck's 2.98 matches the query's 2.98.",
      tag: "dates",
    },
    {
      id: "marriott-t8",
      q: "An operator invoice is marked void but carries a payment row; another is marked paid with no payments at all. How do you surface these before the tie-out?",
      a: "Reconcile the states against each other instead of trusting one column. A conditional-count query per invoice — payment rows counted, status carried beside the fold — surfaces both patterns at once: the void-with-payment (invoice 11, 925.00 on this db) and the paid-with-no-payments (invoice 28, 1756.00), plus the split-settlement invoices where multiple payment rows sum to the total. Then the money check: integer cents divided by 100.0, never by 100, and the ledger's debits-versus-credits folded to zero (181080 against 181080 here) as the closing assertion. The habit this company grades: status columns are claims, payment rows are evidence, and a settlement read cross-examines one against the other.",
      tag: "quality",
    },
    {
      id: "marriott-t9",
      q: "The board wants a rolling three-month revenue pace printed beside each month. What machinery delivers it — and which frame detail decides whether it's right?",
      a: "A window SUM with an explicit frame: SUM(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW). Two details carry the read. First the frame: ROWS counts rows, RANGE counts peers — with any tie on the month key, RANGE silently pulls same-key duplicates into the roll, so ROWS is the honest choice once the bucket key is unique. Second the edge: the first two months have shorter windows, and the board should either label them or start the roll at month three, not let a 1-month figure masquerade as a 3-month pace. On the 13-bucket trend — 2024-01 at 3731.97 through 2025-02 at 2390.53 — the rolling column turns a jagged monthly chart into the pace story the deck actually leads with.",
      tag: "windows",
    },
    {
      id: "marriott-t10",
      q: "Which markets placed stays but logged zero cancellations — and what does the query that proves it look like?",
      a: "A set difference: distinct markets from the stay-to-market join EXCEPT distinct markets from stays where status = 'cancelled'. On this db that returns LATAM — 2 stays, 0 cancelled — while APAC, EU and US all carry cancellations (3, 3 and 1). The discipline the answer grades: UNION deduplicates and UNION ALL concatenates, and stacking two censuses (a total row, two reports) wants ALL because dedup would silently merge identical counts that came from different sources; EXCEPT and INTERSECT define the 'versus' reads, and both sides must be folded to the same grain first or the difference compares markets against stay-lines. Set ops are where 'versus' becomes executable — but only when each side is a finished, single-grain result.",
      tag: "setops",
    },
    {
      id: "marriott-t11",
      q: "The settlement board prints NULL settled value for 2025-01. Ship it as-is, guard it, or both?",
      a: "Understand it first, then decorate. SUM over zero paid rows returns NULL — 2025-01 billed 11085.00 with both invoices still open, so the NULL means 'nothing settled yet', which is a fact, not dirt. For the stakeholder deck I wrap it: COALESCE(SUM(...), 0) prints 0.00 and the board stops looking broken — but the working query keeps the raw NULL, because NULL (no settlement event) and 0 (a settlement event worth nothing) are different claims a reconciliation can act on. The same family guards division: NULLIF(denominator, 0) turns a divide-by-zero into a NULL the COALESCE already handles. Guard at the display edge, preserve truth in the core — that order is the whole policy.",
      tag: "nulls",
    },
    {
      id: "marriott-t12",
      q: "Your HAVING clause references a SELECT alias and SQLite accepts it. Do you ship that?",
      a: "Not into shared code. SQLite resolves output aliases almost everywhere as an extension; PostgreSQL and most engines resolve them in ORDER BY and GROUP BY only, and WHERE never sees an alias because it runs before SELECT projects anything. A query that runs on my laptop and fails in the warehouse is a support ticket with my name on it. The portable build either repeats the expression — HAVING SUM(total)/COUNT(*) >= a bar — or stages the fold in a CTE and filters the staged column. I allow dialect sugar in throwaway probes, keep portability in anything that ships, and hold the pipeline map cold: FROM/JOIN build rows, WHERE filters rows, GROUP BY folds, HAVING filters folds, SELECT projects, ORDER BY sorts last.",
      tag: "pipeline",
    },
    {
      id: "marriott-t13",
      q: "For each room category, the timestamp of its most recent booking. Correlated subquery, MAX-join, or window pick — and what breaks each one?",
      a: "The correlated subquery (SELECT MAX(created_at) FROM stays s2 WHERE s2.category = s1.category) is correct and the slowest — it re-executes per outer row, fine at 16 categories and fatal on a stay ledger of hundreds of millions. The MAX-join is the classic bug: on ties — two bookings in the same category at the same timestamp, which happens nightly at portfolio scale — it returns BOTH rows and the board double-counts the category. The window pick is the default: ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC, id DESC) filtered to rn = 1 — one row per category, deterministic tiebreak, one pass. I name the tiebreaker out loud, because the id DESC clause is what makes the answer reviewable instead of lucky.",
      tag: "subqueries",
    },
    {
      id: "marriott-t14",
      q: "Where would a CROSS JOIN actually earn its keep in a hotel portfolio?",
      a: "Grid reads. Markets crossed with room categories builds the full 4-by-7 cell map — 28 cells on this db — and LEFT-joining actual stay lines onto it exposes the white space an INNER join deletes: 5 empty cells, four of them LATAM (Video, Wearables, Apparel, Fitness — its 852.44 of demand sits entirely in Accessories, Audio and Electronics) and one US-Fitness. That census is a growth slide: it says the small market isn't buying four categories at all, which 'no rows returned' would have hidden. CROSS JOIN is almost always wrong when accidental — a forgotten comma, a missing predicate that multiplies rows — and exactly right when the grid IS the question. Same move, opposite intents, and the interview is checking that you know which one you're holding.",
      tag: "joins",
    },
    {
      id: "marriott-t15",
      q: "Operator services wants one row per operator with its room categories listed inline. What's the fold — and what are its limits?",
      a: "GROUP_CONCAT after the join: GROUP_CONCAT(DISTINCT p.category) folds the line-item grain — where each category repeats across bookings — into one label list per operator, so a 3-category operator prints one cell instead of 43 rows. DISTINCT is not cosmetic: without it the fold prints every repetition and the cell reads like a feed dump. Order the labels for determinism (sort in a subquery, or the ORDER BY inside the aggregate where the engine supports it) and pick a readable separator. Then respect the limits: a string fold is for display — you cannot re-aggregate it, sort it numerically, or build ratios on it. The numeric scorecard ships beside it; the concat column is the annotation, never the metric.",
      tag: "fold",
    },
    {
      id: "marriott-t16",
      q: "One query, five numbers: delivered, shipped, pending, cancelled, total. What's the modern shape, and what's the audit on the result?",
      a: "Conditional aggregation in one pass: COUNT(*) FILTER (WHERE status = 'delivered') and friends — on this db 52, 30, 14, 7 beside COUNT(*) = 103 — instead of four scans or a CASE pivot. The fallback for engines without FILTER is the SUM(CASE WHEN status = ... THEN 1 ELSE 0 END) idiom, the same fold spelled longer. The audit that makes it an answer: the conditional counters must re-sum to the total — 52 + 30 + 14 + 7 = 103 — and I assert that with a check column, because a status value missing from the filter list (a new feed state, a typo) would shrink the sum and the board would never notice. Census shape plus a tie-out is what makes the 82-of-103 completion read defensible in front of owner services.",
      tag: "census",
    },
    {
      id: "marriott-t17",
      q: "Why does finance store money as INTEGER cents, and where do analysts most often break it?",
      a: "Integers don't drift: cents sum exactly no matter how many rows, while REAL dollars accumulate binary-float error across millions of additions — a settlement fold off by one cent is a reconciliation failure nobody can explain. The classic breaks, all seen in reviews: dividing by 100 instead of 100.0, which is integer division — 66443 cents prints 664, not 664.43; converting to dollars per-row and then summing the REALs, which reintroduces the drift the cents design exists to prevent; and AVG on cents followed by another division, which rounds twice. The house rule: fold in cents, convert once at the display edge, ROUND once — 92500 cents is 925.00 exactly, once, at the edge, and the ledger ties because nothing drifted on the way.",
      tag: "money",
    },
    {
      id: "marriott-t18",
      q: "The settlement board joins invoices to payments and the billed total jumps from 86977 to 111917. Diagnose it before the close meeting.",
      a: "Fan-out, and the number proves it: 86977.00 is the true billed fold — 19609.00 open + 66443.00 paid + 925.00 void — and the jump is 24940.00, exactly the sum of invoices 1, 5, 12, 19 and 22 (4860 + 5284 + 4723 + 5614 + 4459): the five split-settlement invoices that carry two payment rows each. The join multiplies each parent row by its child count, so SUM(amount_cents) over the joined rows double-counts every split invoice. The fix is staging: fold payments per invoice in a derived table first, then join — or fold invoices alone and carry payment counts separately. I quote both figures in the walkthrough, because the delta matching the five invoices' sum is what turns 'a bug' into 'the bug, proven' in one slide.",
      tag: "fanout",
    },
    {
      id: "marriott-t19",
      q: "Two operator feeds double-log rate changes. Build the dedupe that ships.",
      a: "ROW_NUMBER over the natural key: ROW_NUMBER() OVER (PARTITION BY property_id, rate_key ORDER BY effective_from DESC, feed_id DESC), keep rn = 1 — the latest rate per property-rate key, ties broken by a rule someone can state, not rowid luck. The alternatives fail in ways reviews catch: SELECT DISTINCT cannot collapse rows whose rate values differ; GROUP BY with MAX(effective_from) leaves the other columns filled from an arbitrary row — latest timestamp beside a stale rate; a global MAX subquery keeps one row for the whole network, not one per key. And I ship the discard count beside the keep — rows in, duplicates dropped, rows out — because ops reconciles feeds by counts, and a dedupe that cannot show its arithmetic is just a quieter bug.",
      tag: "dedupe",
    },
    {
      id: "marriott-t20",
      q: "Stays are date ranges. Where do BETWEEN-based overlap checks go wrong in a hotel portfolio?",
      a: "At midnight. BETWEEN is closed on both ends, so a checkout and the next check-in on the same date count as overlapping — and in a portfolio with 2-to-4-day leads and same-day turnarounds, the midnight edge fires weekly until someone mutes the double-booking alarm. The correct shape is half-open intervals: a.arrival < b.departure AND a.departure > b.arrival — ranges collide only if each starts strictly before the other ends. The deeper point is that boundary semantics are business decisions, not syntax: housekeeping wants the turnover gap to count as free, revenue wants the occupied night to count as sold, and the predicate you write is where that policy lives. I state the boundary rule in a query comment, because the next analyst will 'simplify' it to BETWEEN otherwise.",
      tag: "dates",
    },
    {
      id: "marriott-t21",
      q: "The deck wants 'dead demand' — guests who never booked. The anti-join returns zero rows. Now what?",
      a: "You report the zero — with the census that makes it credible. On this db every one of the 16 guests has booked (never_ordered = 0) and every room category has moved (0 on the product side too), so anti-joins on those dimensions are honestly empty; the portfolio has no dead stock to write down. The audit instinct then aims the same pattern where gaps actually live: 6 unpaid invoices (15217.00) with no payment rows, 5 empty market-category cells, 21 stays with no check-in. 'Zero rows' is a finding when you can show WHY it is zero — the saturated dimension — and a bug when you can't. The weak answer treats an empty result as a failed query; the strong one treats it as a saturated dimension and moves the hunt to dimensions with real gaps.",
      tag: "antijoins",
    },
    {
      id: "marriott-t22",
      q: "LATAM shows the highest average order value (426.22) and the slowest lead (3.5 days). Does the headline ship?",
      a: "Not without its denominator on the slide. LATAM is 2 stays from 1 buyer — Bruno Silva's two bookings, 852.44 — so both 'records' are anecdotes with decimals attached: one modest booking moves the AOV, one airport delay moves the lead. Rates over tiny bases are noise that decorates itself as signal, and the failure mode is real: someone budgets against LATAM's 426.22 and next quarter's 2 stays print 280. The honest builds: print n beside every rate (n=2 says it all), or gate the board with HAVING COUNT(*) >= a stay floor so small markets land in a footnote, not beside US's 383.48 on 19 stays. I ship the row with 'n=2' printed larger than the rate — that version survives the meeting.",
      tag: "sampling",
    },
    {
      id: "marriott-t23",
      q: "RevPAR equals ADR times occupancy. Why do analytics teams keep fighting about that formula?",
      a: "Because both factors hide a denominator choice, and the product multiplies the hiding. Occupancy over AVAILABLE rooms punishes unsold inventory; over SOLD rooms it is a tautology near 100%. ADR over room nights versus over stays diverges the moment a booking holds two rooms. So RevPAR is only as honest as its worst denominator — change one base and the same nights print a different portfolio. Teams fight because the number moves money: owner settlements and management quotes ride RevPAR, so whoever owns the definition owns the payout. The discipline I bring: write the definition as a query — numerator column, denominator column, both visible — the way the check-in rate lives as COUNT(shipped_at) over COUNT(*) across all 103 placed stays, and publish it beside every printed figure.",
      tag: "kpis",
    },
    {
      id: "marriott-t24",
      q: "The loyalty budget is finite. Which query decides where it goes?",
      a: "The concentration curve, built in one window pass: fold lifetime spend per guest, rank the ladder, run a cumulative SUM over the ranked rows and divide by the portfolio total. On this db the curve is brutally steep — 4 of 16 guests (3000-plus lifetime: 7262.35, 6640.56, 4574.23, 3644.56) hold 22121.70, which is 63.5% of the 34833.28; widen the line to 2000 and the share is 71.2% with one more guest. The read for the budget: the ambassador band IS the program — benefits that price against a quarter of the guests are really pricing against 63.5% of the value — while the 11-guest member tail is reach, not revenue. The identical fold per operator (Nordic at 32%) is the portfolio version of the same question: where does concentration say the next dollar works hardest.",
      tag: "concentration",
    },
  ],

  mcqs: [
    {
      id: "marriott-mcq-1",
      prompt: "The operator scorecard joins line items → room categories → operators. What does COUNT(*) measure on that grain?",
      choices: [
        "Number of operators",
        "Number of distinct room categories",
        "Booked line items (room nights)",
        "Sum of quantities",
      ],
      answer: 2,
      why: "The join's grain is the line item — COUNT(*) counts booked lines (room nights): 43, 56, 47, 40 … for the gated operators. Room types need COUNT(DISTINCT p.id); units need SUM(quantity).",
      notes: [
        { choice: 1, why: "Distinct room types is COUNT(DISTINCT p.id) — 3, 3, 2, 2. COUNT(*) can't deduplicate; it counts every row the join produced." },
        { choice: 3, why: "SUM(quantity) is the unit census — a different column, not a count. Confusing the three is exactly the grain trap the scorecard is built around." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-2",
      prompt: "Completion rate must keep every placed stay in the denominator. Which query prints the honest 82-of-103 read?",
      choices: [
        "COUNT(*) / COUNT(shipped_at) FROM orders",
        "COUNT(shipped_at) / COUNT(*) FROM orders",
        "COUNT(*) FROM orders WHERE shipped_at IS NOT NULL",
        "AVG(shipped_at IS NOT NULL) * 100 FROM orders",
      ],
      answer: 1,
      why: "COUNT(shipped_at) is the numerator (82 non-NULL check-ins); COUNT(*) is the base (103 placed stays). The NULL-blind counter over the full fold — about 79.6%.",
      notes: [
        { choice: 0, why: "Inverted: 103 over 82 prints 125.6% — a completion rate above 100% that any owner would bounce out of the room in one glance." },
        { choice: 2, why: "Filtering first collapses the base to the numerator — the query prints 82 stays and the rate silently becomes 100%. Denominator filters are the classic flattery bug." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-3",
      prompt: "Bonvoy roll: ambassador at lifetime spend >= 3000, platinum at >= 2000, else member. On this db the band sizes are:",
      choices: [
        "4 / 1 / 11",
        "5 / 0 / 11",
        "4 / 0 / 12",
        "1 / 4 / 11",
      ],
      answer: 0,
      why: "Lifetime spend per guest: four guests cross 3000 (22121.70 together, 63.5% of value), one sits at 2000-2999 (2667.93), eleven stay below 2000. The 4/1/11 roll is what the CASE must print.",
      notes: [
        { choice: 1, why: "Five at 3000-plus happens when the platinum boundary (2000) is applied to BOTH branches — the second WHEN never fires. Test boundaries against known band sizes." },
        { choice: 2, why: "Dropping the platinum band entirely means the 2000 boundary was never in the CASE — a definition change disguised as a refactor." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-4",
      prompt: "ADR by market with a small-N gate: markets with fewer than 10 stays drop out. Where does each condition go?",
      choices: [
        "Market filter in WHERE; stay-count gate in HAVING",
        "Both in WHERE",
        "Market filter in HAVING; stay-count gate in WHERE",
        "Both in HAVING",
      ],
      answer: 0,
      why: "The market filter is row-level — WHERE runs before grouping. The stay-count gate is a fold — it exists only after GROUP BY, so HAVING. Pipeline order decides placement.",
      notes: [
        { choice: 1, why: "WHERE COUNT(...) references a fold that doesn't exist yet — an error at best. The gate on an aggregate is always HAVING." },
        { choice: 3, why: "Filtering the market in HAVING works but folds every market first — wasted work and a query that reads backwards. Row predicates belong in WHERE." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-5",
      prompt: "Two operators tie at the top of the coverage board — both run the most room categories. What does RANK() OVER (ORDER BY room_types DESC) print for the pair and the next operator?",
      choices: [
        "Rungs 1 and 2 — arbitrary but distinct",
        "Rung 1 twice, then rung 3 — ties share, next skips by tie size",
        "Rung 1 twice, then rung 2 — consecutive numbering",
        "Rung 2 twice — ties take the last slot",
      ],
      answer: 1,
      why: "RANK gives tied operators the same rung and the next operator a rank that jumps past the whole tie block: 1, 1, then 1 + 2 = 3. ROW_NUMBER would hand out 1 and 2 arbitrarily; DENSE_RANK would number 1, 1, then 2.",
      notes: [
        { choice: 0, why: "That's ROW_NUMBER — the board invents an order inside the tie. Owner services will ask why the tied operators differ and the query has no answer." },
        { choice: 2, why: "That's DENSE_RANK — clean rungs that hide how many slots the tie consumed. Both are defensible; only one is what was asked for." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-6",
      prompt: "Operator settlements are stored in INTEGER cents. Invoice 6148 cents must print as 61.48 dollars:",
      choices: [
        "amount_cents / 100",
        "ROUND(amount_cents / 100, 2)",
        "amount_cents / 100.0",
        "amount_cents * 0.01 AS TEXT",
      ],
      answer: 2,
      why: "Division by 100.0 promotes to real arithmetic before truncation: 6148 cents → 61.48. Integer 100 truncates at the division — 61 — and rounding after truncation can't recover the cents.",
      notes: [
        { choice: 1, why: "The damage happens inside: 6148/100 truncates to 61 before ROUND sees it. Rounding a truncated number just polishes the wrong figure." },
        { choice: 3, why: "0.01 in binary floating point lands next to, not on, 0.01 — and casting to TEXT turns a number into a string the ledger can't sum. Keep money numeric: cents / 100.0." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-7",
      prompt: "Which read finds stays whose booking and check-in dates overlap ANOTHER stay's range at the same property?",
      choices: [
        "GROUP BY property HAVING COUNT(*) > 1",
        "Self-join on property with date-range predicates (arrival < other departure AND departure > other arrival)",
        "WHERE shipped_at IS NULL",
        "ORDER BY arrival, departure with a LAG comparison only",
      ],
      answer: 1,
      why: "Overlaps are interval logic: two ranges collide when each starts before the other ends. A self-join with the half-open predicates (a.arrival < b.departure AND a.departure > b.arrival) finds every colliding pair.",
      notes: [
        { choice: 0, why: "Two stays at a property is normal, not an overlap. Counting rows can't see whether the date RANGES collide — intervals need interval predicates." },
        { choice: 2, why: "NULL check-ins are not-yet-arrived stays — a state, not a collision. The overlap question is about pairs of date ranges, not about missing timestamps." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-8",
      prompt: "'Stays still in play' = not checked in and not cancelled. Which predicate returns exactly the 14 pending stays?",
      choices: [
        "WHERE status <> 'cancelled' — 96 stays",
        "WHERE shipped_at IS NULL — 21 stays",
        "WHERE shipped_at IS NULL AND status <> 'cancelled' — 14 stays",
        "WHERE status = 'pending' OR cancelled — 21 stays",
      ],
      answer: 2,
      why: "The 21 not-yet-checked-in stays (shipped_at IS NULL) split into 14 pending and 7 cancelled. In-play keeps only the pending arm — both conditions stated, because each alone over-counts.",
      notes: [
        { choice: 0, why: "status <> 'cancelled' keeps the 82 checked-in stays too — 96 counts arrivals as in-play. 'Not cancelled' is not 'still pending'." },
        { choice: 1, why: "shipped_at IS NULL is the not-yet-checked-in set, but it includes the 7 cancelled stays. Without the status arm, the funnel claims cancelled demand is still live." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-9",
      prompt: "The tier roll needs lifetime spend per guest, then bands, then one row per band. The safest build is:",
      choices: [
        "CASE over orders rows grouped by tier, SUM(total) directly",
        "Derived table folding spend per customer, then CASE over the fold and GROUP BY the band",
        "Correlated subquery per guest inside the CASE",
        "Window function over orders partitioned by customer, CASE in the same SELECT",
      ],
      answer: 1,
      why: "Tiering needs the PER-GUEST fold to exist before the CASE runs — stage it in a derived table (or CTE): fold spend by customer, then classify and GROUP BY the band. Two clean stages, each with its own grain.",
      notes: [
        { choice: 0, why: "CASE on orders rows classifies per BOOKING, not per guest — a guest with one 900-stay and one 2500-stay lands in two bands and the roll double-counts them." },
        { choice: 3, why: "A window keeps every booking row — the CASE then fires per booking and GROUP BY tier double-counts multi-booking guests. Windows don't fold rows away; the tier needs the fold first." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-10",
      prompt: "Operator coverage board: keep only operators running at least 3 room categories. On this db the gate keeps:",
      choices: [
        "All 6 operators",
        "4 operators — Nordic, Midwest, Shenzhen, Pacific",
        "2 operators — Nordic and Alpine",
        "1 operator — Nordic only",
      ],
      answer: 1,
      why: "Operators carry 3, 3, 2, 2, 3, 3 room types. HAVING COUNT(DISTINCT p.id) >= 3 keeps the four 3-category groups and drops Alpine (4.8-rated, 2 categories) and Andes — a coverage gate, not a quality gate.",
      notes: [
        { choice: 2, why: "Nordic and Alpine is the RATING bench (4.5-plus) — a different gate on a different column. Coverage counts room types; quality reads ratings. Don't swap the definitions." },
        { choice: 0, why: "All six survive only if the gate is >= 2. At 3 the two 2-category operators drop — that's the point of the gate, and why the board has four rows." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-11",
      prompt: "The market board folds stays per region and prints US: 19 stays. How many DISTINCT buyers does that fold hide?",
      choices: [
        "19 — every stay is its own buyer",
        "2 — the fold counts stays, not people",
        "16 — the full guest census",
        "5 — the APAC buyer count",
      ],
      answer: 1,
      why: "US books 19 stays through 2 guests (Emma Wilson and Jamal Wright are the US names on the spender board). COUNT(DISTINCT o.customer_id) is the buyer counter; COUNT(*) is the stay counter — 19 bookings fold to 2 people.",
      notes: [
        { choice: 0, why: "19 is the stay count — the same guests book repeatedly, which is exactly why buyer-count and stay-count are different columns on the board." },
        { choice: 2, why: "16 is the whole customer table; the market fold only sees guests who booked here, and every US stay came from 2 of them." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-12",
      prompt: "Ledger check: 181080 debits against 181080 credits, delta zero. What does that actually assert?",
      choices: [
        "The hotel made zero profit",
        "Total cash on hand is 181080",
        "Every entry has an offsetting entry — the books tie",
        "Revenue equals exactly 181080",
      ],
      answer: 2,
      why: "A trial balance asserts arithmetic symmetry, not performance: debits minus credits = 0 means every posting has its offset. What the entries say (sales_revenue 86052, operating_expenses 25416, cash netting 44196) is a per-account read, not the delta.",
      notes: [
        { choice: 1, why: "Cash nets to 44196 on this ledger — 181080 is gross movement across all accounts, not a balance anyone holds." },
        { choice: 0, why: "Profit is a P&L fold (revenue less expenses); the trial-balance delta says nothing about it — zero delta is bookkeeping hygiene, not earnings." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-13",
      prompt: "Revenue asks for every room category priced at 200 or above. The query returns zero rows. What do you report?",
      choices: [
        "A bug — retry with a LEFT JOIN",
        "The truth: the premium band is empty — the priciest category tops out at 199.99",
        "Lower the threshold to 150 and relabel",
        "Report the mid band (50-200) as premium",
      ],
      answer: 1,
      why: "The catalog's max price is 199.99 (Smart Watch S) — a >= 200 band is legitimately empty. The db splits 8 budget categories (under 50, avg 32.06) and 8 mid (50-200, avg 111.5); premium simply doesn't exist yet, and saying so is the finding.",
      notes: [
        { choice: 0, why: "Join mechanics can't create rows that don't exist — the band is empty because the rate card is, and an anti-join census won't change that." },
        { choice: 3, why: "Relabeling mid as premium invents a segment the rate card doesn't support — definition drift the revenue team catches the moment they price against it." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-14",
      prompt: "Same raw count — 3 cancelled stays each in APAC and EU. Which market's cancellation SHARE is worse, and why?",
      choices: [
        "Identical — 3 is 3",
        "EU — more stays means more cancellations to fix",
        "APAC — 3 of 37 (8.1%) against EU's 3 of 45 (6.7%)",
        "Cannot tell without order ids",
      ],
      answer: 2,
      why: "Share is a ratio, not a census: APAC's base is 37, EU's is 45, so equal counts print unequal rates — 8.1% versus 6.7%. The full board: US 5.3% (1 of 19), LATAM 0.0% (0 of 2).",
      notes: [
        { choice: 0, why: "Counts feed pace; rates feed decisions. Same numerator, different denominator — the fold must divide before it compares." },
        { choice: 1, why: "Bigger bases usually mean LOWER shares — the intuition inverts the moment you divide." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-15",
      prompt: "Card settlements total 37364 cents. What prints from ROUND(SUM(amount_cents) / 100, 2)?",
      choices: [
        "373.64",
        "373",
        "37.36",
        "NULL",
      ],
      answer: 1,
      why: "Integer 100 forces integer division first: 37364/100 = 373, and ROUND(373, 2) just polishes it. The fix is /100.0 — promote to real arithmetic BEFORE the cut, and 373.64 prints.",
      notes: [
        { choice: 0, why: "That's what /100.0 prints. The integer literal truncates before ROUND ever runs — rounding can't recover cents that never survived the division." },
        { choice: 2, why: "Off by a factor of ten — that's /1000 thinking. The cents scale is 100; the failure mode here is truncation, not scaling." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-16",
      prompt: "The monthly pace table flags months with exactly 2 cancelled stays. Which months are they?",
      choices: [
        "2024-01 and 2025-01",
        "2024-07 and 2024-11",
        "Only 2024-07",
        "None — no month reached 2",
      ],
      answer: 1,
      why: "The 13-bucket trend logs 2 cancellations in 2024-07 (8 stays) and 2024-11 (6 stays); 1 + 1 + 2 + 2 + 1 across 2024-01, 2024-03, 2024-07, 2024-11 and 2025-01 accounts for all 7 network cancellations.",
      notes: [
        { choice: 0, why: "January shows 1 cancellation in both 2024 and 2025 — single months, not doubles." },
        { choice: 2, why: "2024-07 is one of the two; a read that stops at the first hit undercounts the pattern and misses the November cluster." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-17",
      prompt: "Lead-time board: LATAM 3.5 days, US 3.07, EU 2.94, APAC 2.93. Which line gets quoted as fastest — and which gets flagged?",
      choices: [
        "LATAM fastest (3.5); APAC flagged",
        "APAC fastest (2.93); LATAM flagged — its 3.5 rests on 2 stays",
        "EU fastest — biggest sample",
        "US — 3.07 is the median of the four",
      ],
      answer: 1,
      why: "APAC's 2.93 is the network's fastest fold on 29 checked-in stays; LATAM's 3.5 is the slowest number AND the weakest evidence — n=2. Rates over tiny bases are anecdotes with decimals; the flag is the sample size, not the value.",
      notes: [
        { choice: 0, why: "3.5 is the largest value on the board, not the smallest — and its base is the smallest too. Double miss." },
        { choice: 2, why: "EU's 36 checked-in stays make it the most trustworthy read, not the fastest — trust and speed are different claims." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-18",
      prompt: "The settlement board LEFT-joins invoices to payments and prints billed = 111917.00. The status census says 19609 open + 66443 paid + 925 void. What happened?",
      choices: [
        "Rounding drift across 28 invoices",
        "Five invoices settle in two payment rows — the join duplicates them (86977.00 + 24940.00)",
        "The void invoice (925.00) was counted twice",
        "Payments include 25000 of refunds",
      ],
      answer: 1,
      why: "Invoices 1, 5, 12, 19 and 22 each carry two payment rows, so the join prints each twice: 86977.00 true billed + 24940.00 duplicated (4860 + 5284 + 4723 + 5614 + 4459) = 111917.00. Pre-aggregate payments per invoice before joining.",
      notes: [
        { choice: 2, why: "Invoice 11 (void, 925.00) has ONE payment row — it's an anomaly, not the 24940 gap. The gap is the five split-settlement invoices." },
        { choice: 0, why: "Drift doesn't produce a clean +24940.00 — duplicated parent rows do. Count payment rows per invoice and the pattern is exact." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-19",
      prompt: "Latest booking per room category: two bookings in one category logged the same timestamp. Which build survives the tie?",
      choices: [
        "MAX(created_at) joined back on the timestamp",
        "ROW_NUMBER() OVER (PARTITION BY category ORDER BY created_at DESC, id DESC) kept at rn = 1",
        "GROUP BY category with MAX(created_at) and SELECT *",
        "SELECT DISTINCT category, MAX(created_at) from the join",
      ],
      answer: 1,
      why: "The window pick deduplicates deterministically: partition per category, order by the timestamp plus an id tiebreaker, keep one row. The MAX-join returns BOTH tied rows; GROUP BY-with-* fills non-aggregated columns from an arbitrary row.",
      notes: [
        { choice: 0, why: "The MAX-join is the classic tie bug — equality on the timestamp matches every row that shares it, and the category appears twice on the board." },
        { choice: 3, why: "DISTINCT answers 'when', never 'which stay' — it drops the identifying columns, and if two rows tie on the timestamp both survive the dedup." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-20",
      prompt: "A revenue read joins orders to order_items and SUMs order totals: it prints 103244.55 against the books' 34833.28. Diagnosis?",
      choices: [
        "order_items carries refunded lines — filter them out",
        "Fan-out: 251 booked lines over 103 stays repeats each stay's total per line",
        "The books are wrong — 34833.28 is stale",
        "unit_price and total are double-counted together",
      ],
      answer: 1,
      why: "The join multiplies stays by their line count — 251 lines over 103 stays — so each stay's total repeats per line: 103244.55 of inflated SUM against the verified 34833.28. Revenue folds at the stay grain (SUM(total) over orders) or at the line grain (SUM(unit_price * quantity) over order_items); never through the unaggregated join.",
      notes: [
        { choice: 2, why: "Both figures are probed — 34833.28 is the verified stay-value fold. The query is wrong, not the books." },
        { choice: 0, why: "Nothing about status or refunds changes the arithmetic: the inflation factor is the line count, present in every status bucket." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-21",
      prompt: "ADR is revenue over room nights. Which fold prints the realized rate?",
      choices: [
        "AVG(unit_price) over the line items",
        "SUM(unit_price * quantity) / SUM(quantity)",
        "MAX(unit_price) per market",
        "SUM(quantity) / COUNT(DISTINCT order_id)",
      ],
      answer: 1,
      why: "ADR weights by nights: total stay revenue divided by total room nights. AVG(unit_price) averages the rate CARD — a 149.99 line and a 14.99 line count equally regardless of nights booked — so it drifts from realized revenue the moment quantities differ.",
      notes: [
        { choice: 0, why: "Unweighted AVG is the rate-card read — exactly the drift the weighting question is testing whether you can see." },
        { choice: 3, why: "That's a nights-per-booking ratio, not a rate — right columns, wrong question." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-22",
      prompt: "COUNT(*) FROM orders WHERE shipped_at IS NULL returns:",
      choices: [
        "14",
        "7",
        "21",
        "82",
      ],
      answer: 2,
      why: "21 = 14 pending arrivals + 7 cancelled stays — everything not yet checked in. The in-play subset (14) needs the status <> 'cancelled' arm on top of the NULL check.",
      notes: [
        { choice: 0, why: "14 is pending only — the NULL-check-in set also holds the 7 cancelled." },
        { choice: 3, why: "82 is the checked-in set — COUNT(shipped_at), the exact complement of this query." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-23",
      prompt: "Two months tie as the pace trend's peak at 9 stays each. Which pair?",
      choices: [
        "2024-01 and 2024-03",
        "2024-02 and 2024-09",
        "2024-07 and 2024-11",
        "2025-01 and 2025-02",
      ],
      answer: 1,
      why: "February 2024 (3609.64) and September 2024 (3116.04) each logged 9 stays — the trend's twin peaks. 2024-01 and 2024-03 sit at 8; the 6-stay trough trio is 2024-06, 2024-11 and 2025-01.",
      notes: [
        { choice: 0, why: "January and March 2024 both logged 8 stays — high, but a tie for third, not the 9-peak." },
        { choice: 2, why: "July and November are the months with 2 cancellations each — a different board entirely." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-24",
      prompt: "Using EXCEPT only: which set difference prints exactly the 14 pending stays?",
      choices: [
        "SELECT id FROM orders EXCEPT SELECT id FROM orders WHERE shipped_at IS NOT NULL",
        "SELECT id FROM orders WHERE shipped_at IS NULL EXCEPT SELECT id FROM orders WHERE status = 'cancelled'",
        "SELECT id FROM orders EXCEPT SELECT id FROM orders WHERE status = 'cancelled'",
        "SELECT id FROM orders WHERE shipped_at IS NULL EXCEPT SELECT id FROM orders WHERE status = 'pending'",
      ],
      answer: 1,
      why: "Start from the 21 not-checked-in stays (shipped_at IS NULL), EXCEPT the 7 cancelled: 21 - 7 = 14. Option A stops at the NULL-check-in set (21 — cancelled still inside); option C only removes cancelled from the FULL table (96 — arrivals stay in); option D subtracts pending from the NULL set and returns the 7 cancelled.",
      notes: [
        { choice: 0, why: "21 is the not-checked-in census — the cancelled 7 ride the same NULL shipped_at, so one EXCEPT isn't enough." },
        { choice: 3, why: "That inverts the logic: subtracting pending from the NULL-check-in set isolates the 7 cancelled, not the 14 you want." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-25",
      prompt: "The quality bench is operators rated 4.5 or higher. Who's on it?",
      choices: [
        "Nordic Gadgets AB and Alpine Audio GmbH",
        "Nordic Gadgets AB and Midwest Hardware Co",
        "Alpine Audio GmbH only",
        "All six operators",
      ],
      answer: 0,
      why: "Ratings run Nordic 4.6, Alpine 4.8, Midwest 4.4, Andes 4.0, Shenzhen 4.1, Pacific 3.9 — the 4.5 cut keeps exactly two. Coverage (category count) is a different gate that keeps four; the two benches deliberately disagree.",
      notes: [
        { choice: 1, why: "Midwest carries 9294.93 of revenue at 4.4 — big and just under the bar. Revenue is not rating." },
        { choice: 3, why: "The full roster averages 4.3 — 'everyone's fine' is how a bench gets diluted into uselessness." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-26",
      prompt: "Invoice 25 sits open at 6148.00 with 4000.00 of payments against it. What's the outstanding AR, and its coverage class?",
      choices: [
        "6148.00 — no payment",
        "2148.00 — partial",
        "4000.00 — overpaid",
        "0 — open invoices aren't AR",
      ],
      answer: 1,
      why: "6148.00 billed - 4000.00 settled = 2148.00 outstanding, and the coverage class is partial — the only one on this ledger among 21 exact and 6 unpaid. The read prints billed, paid and class together or the class is a guess.",
      notes: [
        { choice: 0, why: "6148.00 is billed; a payment row exists, so 'no payment' misclassifies it and AR overstates the receivable by the 4000 already settled." },
        { choice: 2, why: "4000.00 is what settled, not what's owed — quoting settled as outstanding flips the sign of the receivable." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-27",
      prompt: "The pace trend buckets SUBSTR(created_at, 1, 7). What changes if you bucket SUBSTR(shipped_at, 1, 7) instead?",
      choices: [
        "Nothing — both stamps fall in the same months",
        "The trend re-anchors to check-in month: arrivals slip forward and the window extends to 2025-03",
        "Cancelled stays drop out of the fold",
        "The month count doubles",
      ],
      answer: 1,
      why: "created_at buckets demand (when it was booked); shipped_at buckets arrivals (when guests showed). First check-in 2024-01-04, last 2025-03-01 — booking pace ends 2025-02, the arrival view reaches 2025-03, and every stay whose arrival slipped a month moves buckets. Both boards are honest — for different questions.",
      notes: [
        { choice: 0, why: "The 2-to-4-day lead guarantees slippage at month edges — the boards agree in aggregate, not by row." },
        { choice: 2, why: "True — cancelled stays have NULL check-ins and drop from a shipped_at COUNT — but that's a denominator change stacked on top of the re-anchor, and it's not the headline." },
      ],
      difficulty: "medium",
    },
    {
      id: "marriott-mcq-28",
      prompt: "Two operator feeds double-log rate changes. The dedupe that ships is:",
      choices: [
        "SELECT DISTINCT property_id, rate_key, effective_from, rate",
        "ROW_NUMBER() OVER (PARTITION BY property_id, rate_key ORDER BY effective_from DESC, feed_id DESC) = 1",
        "GROUP BY property_id, rate_key with MAX(effective_from) and SELECT *",
        "WHERE effective_from = (SELECT MAX(effective_from) FROM rate_changes)",
      ],
      answer: 1,
      why: "Partition per property-rate key, order newest-first with a deterministic tiebreaker, keep rn = 1 — one row per key, latest wins, ties settle by stated rule. DISTINCT can't collapse rows whose rates differ; GROUP BY-with-* picks arbitrary values; the global MAX keeps only the single newest row network-wide.",
      notes: [
        { choice: 2, why: "SQLite fills the non-aggregated columns from an arbitrary row — 'latest effective_from' beside a stale rate. The tiebreaker must live in the window ORDER BY." },
        { choice: 3, why: "That filters the whole table to one row — the newest change anywhere. Per-key latest needs PARTITION BY, not a global scalar." },
      ],
      difficulty: "hard",
    },
    {
      id: "marriott-mcq-29",
      prompt: "Which column stores money as INTEGER cents rather than REAL dollars?",
      choices: [
        "orders.total — 1088.44 max",
        "products.price — 199.99 max",
        "invoices.amount_cents — 92500 prints as 925.00",
        "order_items.unit_price — line rates",
      ],
      answer: 2,
      why: "The finance tables (invoices, payments, expenses, ledger_entries) hold integer cents and divide by 100.0 at the edge; the storefront tables (orders.total, products.price, order_items.unit_price) are REAL dollars as-is. Two scales in one portfolio — the read names its scale before it folds.",
      notes: [
        { choice: 0, why: "1088.44 is the largest stay total and it's REAL dollars — no division needed, and dividing it again prints 10.88." },
        { choice: 3, why: "Line rates are REAL dollars too — mixing them into cents math is the 100-versus-100.0 bug wearing a join." },
      ],
      difficulty: "easy",
    },
    {
      id: "marriott-mcq-30",
      prompt: "A UNION ALL stack appends one row per stay status plus a 'TOTAL' row. What does TOTAL print for stays?",
      choices: [
        "82 — arrivals only",
        "96 — everything not cancelled",
        "103 — every placed stay",
        "14 — the in-play set",
      ],
      answer: 2,
      why: "The TOTAL row folds what the stacked arms sum to: 52 + 30 + 14 + 7 = 103 — every stay placed. Quoting 82 or 96 in the TOTAL row swaps the completion-rate denominator in through the back door.",
      notes: [
        { choice: 0, why: "82 is the checked-in numerator — a TOTAL of 82 quietly redefines placement as arrival." },
        { choice: 1, why: "96 keeps pending but drops cancelled — a denominator someone chose, not one the status column states. The stack sums ALL arms." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-mar-1",
      tier: "medium",
      topic: "s6",
      universe: "growth",
      title: "The Bonvoy tier roll-up",
      brief:
        "Marriott-flavored brief on the storefront db (orders = stays, customers = Bonvoy guests): the loyalty review wants the tier roll-up — guests banded by LIFETIME stay value, with band size and band value beside each tier. The loyalty lead states the boundaries like a contract: 'ambassador at 3000 lifetime and above, platinum at 2000 to 2999, member below 2000 — and the bands are per GUEST, never per stay.' Probed facts: 16 guests, 34833.28 of stay value; lifetime spend concentrates hard — 63.5% of value sits with guests at 3000-plus (Alice Chen 7262.35, Emma Wilson 6640.56, Grace Kim 4574.23, Maya Patel 3644.56), 71.2% at the 2000 line (Chloe Dubois 2667.93 is the only platinum). Expect ambassador 4 / 22121.7, member 11 / 10043.65, platinum 1 / 2667.93.",
      ask: "Return one row per tier: tier name, guest count, and the tier's total lifetime value (2dp), biggest value first.",
      template:
        "SELECT CASE WHEN g.spend >= {1} THEN 'ambassador'\n            WHEN g.spend >= 2000 THEN 'platinum'\n            ELSE 'member' END AS tier,\n       {2}(*) AS guests,\n       ROUND(SUM(g.spend), 2) AS tier_value\nFROM (SELECT customer_id, SUM(total) AS spend\n      FROM orders\n      GROUP BY customer_id) g\nGROUP BY tier\nORDER BY tier_value {3};",
      slots: [
        {
          answer: "3000",
          kind: "number",
          label: "the ambassador boundary",
          noVerify: true,
          why: "3000 is the program's stated line: four guests cross it and carry 22121.7 — 63.5% of portfolio value. At 2500 Chloe Dubois (2667.93) migrates into ambassador and platinum goes empty; at 2000 the top band absorbs her and the 4/1/11 roll becomes 5/0/11.",
        },
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the band-size counter",
          why: "COUNT(*) counts guests per tier — 4, 1, 11. SUM(*) and MAX(*) are syntax errors: only COUNT folds a star, and band size is a census of guests, not a value.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-band-first order",
          why: "The review leads with where the value lives: ambassador 22121.7, member 10043.65, platinum 2667.93. ASC would open the slide with the one-guest band and bury the concentration story the deck exists to tell.",
        },
      ],
      distractors: ["SUM", "2500", "2000", "ASC"],
      walkthrough:
        "A tier roll is a two-stage build: fold first, classify second. The derived table reduces 103 stays to 16 rows — one per guest, SUM(total) as lifetime spend — because tiering is a guest-level definition and classifying per stay would double-count every multi-stay guest into two bands. The CASE then cuts at the stated boundaries; GROUP BY tier folds the bands; COUNT(*) sizes them (4 / 1 / 11) and ROUND(SUM(g.spend), 2) values them (22121.7 / 2667.93 / 10043.65) — the 63.5% concentration fact made visible in one query. ORDER BY tier_value DESC leads with the ambassador band. The distractors fail honestly: SUM in the counter slot is a syntax error, 2500 or 2000 in the boundary slot re-draws the program (5/0/11 and an empty platinum band), and ASC buries the value story under the one-guest band. The habit being graded: boundaries are definitions — write them as stated, or the loyalty team's tier benefits ship to the wrong guests.",
    },
    {
      id: "cs-mar-2",
      tier: "hard",
      topic: "j3",
      universe: "supplier",
      title: "The operator coverage audit",
      brief:
        "Marriott-flavored brief on the storefront db (suppliers = property operators, products = room categories, order_items = booked room nights): the portfolio audit wants the operator scorecard — room nights, revenue and room-type coverage per operator, gated to groups running at least THREE room categories, because the coverage bar is a franchise requirement. Probed facts: 6 operators carrying 16 categories between them (3 / 3 / 2 / 2 / 3 / 3); revenue runs Nordic Gadgets AB 11130.25 (32% of portfolio), Midwest Hardware Co 9294.93, Alpine Audio GmbH 4765.63, Andes Naturals SA 3613.25, Shenzhen Electro 3049.07, Pacific Textiles 2980.15. The 3-category gate keeps exactly four operators — and drops Alpine, the highest-rated group at 4.8, which is precisely why the audit separates coverage from quality.",
      ask: "Return operators with at least 3 room categories: name, room nights, revenue (2dp), category count — biggest revenue first.",
      template:
        "SELECT s.name,\n       {1}(*) AS room_nights,\n       ROUND(SUM({2} * oi.quantity), 2) AS room_revenue,\n       COUNT(DISTINCT p.id) AS room_types\nFROM order_items oi\nJOIN products p ON p.id = oi.{3}\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id\nHAVING COUNT(DISTINCT p.id) >= {4}\nORDER BY room_revenue {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the room-night counter",
          why: "COUNT(*) counts the join's rows — booked line items, i.e. room nights: 43 for Nordic. SUM(*) and MAX(*) are syntax errors, and SUM(quantity) would count UNITS, a different column on the same grain.",
        },
        {
          answer: "oi.unit_price",
          kind: "keyword",
          label: "the revenue line",
          why: "Room revenue is SUM(unit_price * quantity) — price times nights at the line grain, which reproduces the audited figures: Nordic 11130.25, Midwest 9294.93. p.id would multiply id numbers by quantities and print 544 for Nordic — arithmetic with no business meaning.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the category key",
          why: "The chain runs order_items → products on the product key, then products → suppliers. Joining on order_id would bolt room categories onto booking ids — every operator's revenue changes and the audit grades a random graph.",
        },
        {
          answer: "3",
          kind: "number",
          label: "the coverage gate",
          why: "Three room categories is the franchise bar: operators run 3, 3, 2, 2, 3, 3, so the gate keeps the four 3-category groups and drops Alpine and Andes. At 2 all six pass; at 4 the board goes empty.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the revenue-first order",
          why: "The audit reads biggest exposure first: Nordic 11130.25, Midwest 9294.93, Shenzhen 3049.07, Pacific 2980.15. ASC would lead with Pacific and frame the meeting around the smallest operator.",
        },
      ],
      distractors: ["SUM", "quantity", "order_id", "2", "ASC"],
      walkthrough:
        "A three-table chain where the grain IS the audit. order_items joins to products on the product key and products to suppliers on the supplier key — 251 booked lines attach to 16 categories and 6 operators. On that line grain, COUNT(*) is room nights (43, 56, 47, 40 for the survivors), SUM(unit_price * quantity) is revenue matching the books (11130.25, 9294.93, 3049.07, 2980.15), and COUNT(DISTINCT p.id) is coverage — three distinct categories, the same number as the gate, printed beside itself so the audit can see the bar was met. HAVING applies the 3-category bar to the fold, keeping Nordic, Midwest, Shenzhen and Pacific and dropping the 2-category groups — including 4.8-rated Alpine, which is the audit's point: coverage and quality are different gates. The distractors all move a number: SUM can't fold a star, quantity-squared revenue invents 255 for Nordic, the wrong join key rebuilds the portfolio around booking ids, a gate of 2 admits everyone, 4 empties the board, and ASC flips the meeting's agenda. State the grain, gate the fold, order by exposure.",
    },
    {
      id: "cs-mar-3",
      tier: "medium",
      topic: "j7",
      universe: "inventory",
      title: "The thin-inventory board",
      brief:
        "Marriott-flavored brief on the storefront db (products = room categories, order_items = booked room nights, stock = the operator's allocated allotment): the ops pack wants the thin-inventory board — categories whose unsold allotment (stock minus nights sold) has drained to 17 or fewer, the watch line where revenue management starts re-leasing blocks. Probed facts: 16 room categories moved 251 booked lines; the three that cross the line are Noise-Canceling Headset (60 allocated, 46 nights sold, 14 left), Studio Desktop Mic (45 allocated, 30 sold, 15 left) and Smart Watch S (40 allocated, 23 sold, 17 left). The next-healthiest block is the 4K Webcam Pro at 39 left — the gate at 17 is what keeps this board to three rows, and each column is its own fold: nights sold is SUM(quantity) at line grain, remaining is a per-category figure, never a per-booking one.",
      ask: "Return room categories with 17 or fewer unsold allotments: name, nights sold, remaining — thinnest first.",
      template:
        "SELECT p.name,\n       SUM(oi.quantity) AS nights_sold,\n       p.stock - SUM(oi.quantity) AS remaining\nFROM order_items oi\nJOIN products p ON p.id = oi.{1}\nGROUP BY p.id\nHAVING remaining <= {2}\nORDER BY remaining {3};",
      slots: [
        {
          answer: "product_id",
          kind: "keyword",
          label: "the category key",
          why: "Booked lines attach to room categories on the product key — the only key that lands each night on its category. order_id would weld booking ids onto category ids and produce a random portfolio the audit can't read.",
        },
        {
          answer: "17",
          kind: "number",
          label: "the watch-line gate",
          why: "17 is the watch line AND a verified cell: Smart Watch S prints remaining = 17, and the kept rows are 14, 15, 17. A gate of 14 keeps only the headset; 40 admits the webcam at 39 left — the board re-draws either way.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the urgency order",
          why: "Thinnest first is the urgency order: 14, 15, 17. DESC leads with the healthiest block on the board — the opposite of what a re-leasing meeting reads top-down.",
        },
      ],
      distractors: ["order_id", "14", "40", "DESC"],
      walkthrough:
        "A two-fold read on the line grain. Join booked lines to room categories on the product key, fold SUM(quantity) per category — 46, 30, 23 for the survivors — and subtract from the allotment to get remaining: 14, 15, 17. HAVING applies the watch line to the fold, not to rows, and ORDER BY remaining ASC leads with the thinnest block, which is the order the re-leasing meeting reads in. The distractors each move a number: joining on order_id welds booking ids to category ids and invents a portfolio nobody allocated; a gate of 14 keeps only the headset and hides the mic and the watch from the very meeting that needs them; 40 admits the webcam at 39 left and dilutes the board past its purpose; DESC leads with the healthiest block — the opposite of urgency. State the fold, gate the fold, order by urgency.",
    },
    {
      id: "cs-mar-4",
      tier: "hard",
      topic: "t5",
      universe: "supplier",
      title: "The coverage rung board",
      brief:
        "Marriott-flavored brief on the storefront db (suppliers = property operators, products = room categories, order_items = booked room nights): franchise ops wants the coverage rung board — every operator ranked by how many distinct room categories it runs, because coverage is the franchise bar and ties on this portfolio are real. Probed facts: 6 operators carry 16 categories — Nordic Gadgets AB, Midwest Hardware Co, Shenzhen Electro and Pacific Textiles all run 3 (behind 43, 56, 47 and 40 booked room nights respectively), while Alpine Audio GmbH (the 4.8-rated group, 4765.63 of revenue) and Andes Naturals SA run 2. The board must print rungs 1, 1, 1, 1 then 5: the skipped rungs are the tie's footprint, and shrinking them to 1, 1, 1, 1 then 2 is a different editorial claim about the same numbers.",
      ask: "Return all 6 operators: name, distinct room categories, coverage rung — rung first, name as the tiebreaker.",
      template:
        "SELECT s.name,\n       COUNT(DISTINCT p.id) AS room_types,\n       {1}() OVER (ORDER BY COUNT(DISTINCT p.id) {2}) AS coverage_rung\nFROM order_items oi\nJOIN products p ON p.id = oi.{3}\nJOIN suppliers s ON s.id = p.supplier_id\nGROUP BY s.id\nORDER BY coverage_rung, s.name;",
      slots: [
        {
          answer: "RANK",
          kind: "keyword",
          label: "the rung function",
          why: "RANK shares rungs inside a tie and skips the consumed slots: four operators at 3 categories print 1,1,1,1 and the 2-category pair prints 5. DENSE_RANK prints 2 and hides the tie's size; ROW_NUMBER invents 1-through-6 from rowid luck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the coverage order",
          why: "Coverage ranks most-first: the 3-category operators take rung 1, the 2-category pair lands on 5. ASC inverts the board — Alpine and Andes take rung 1 and the franchise leaders print 5, which reads as a demotion.",
        },
        {
          answer: "product_id",
          kind: "keyword",
          label: "the category key",
          why: "Room categories are counted through the product key: order_items to products to suppliers. supplier_id isn't on order_items at all, and any other join key counts something other than categories.",
        },
      ],
      distractors: ["DENSE_RANK", "ROW_NUMBER", "ASC", "supplier_id"],
      walkthrough:
        "A board where the window function IS the finding. Fold coverage per operator — COUNT(DISTINCT p.id) over the line-to-category-to-operator chain — and the census is 3, 3, 2, 2, 3, 3: a four-way tie at the top, a two-way tie at the bottom. RANK() OVER (ORDER BY coverage DESC) prints 1,1,1,1 then 5 — the skipped rungs 2, 3, 4 are the tie's footprint, which is exactly what owner services asks about. The distractors distort the finding rather than the arithmetic: DENSE_RANK prints 2 for the pair and the tie looks one rung deep; ROW_NUMBER orders the tied four by rowid and the board invents a pecking order nobody can defend; ASC hands rung 1 to the 2-category operators and demotes the leaders to 5; supplier_id in the join key errors out because order_items doesn't carry it. Ties are real on this portfolio — the rank function is the editorial policy.",
    },
    {
      id: "cs-mar-5",
      tier: "easy",
      topic: "q5",
      universe: "pricing",
      title: "The market rate ladder",
      brief:
        "Marriott-flavored brief on the storefront db (orders = stays, customers = Bonvoy guests, region = market): the revenue review wants the market rate ladder — ADR per market, gated to markets with at least 19 stays so a rate quote always has a base. Probed facts: US books 19 stays worth 7286.16 (ADR 383.48), EU 45 stays worth 15089.23 (335.32), APAC 37 stays worth 11605.45 (313.66) — and LATAM's 852.44 over 2 stays from 1 buyer prints 426.22, the highest rate on the board and the least trustworthy. The bar sits at exactly 19: US survives on the boundary, LATAM drops to the footnote. The definition matters as much as the gate — the market fold must exist before the gate filters it, or the census reads a filtered world.",
      ask: "Return markets with at least 19 stays: market, stays, ADR (2dp) — highest rate first.",
      template:
        "SELECT m.market,\n       m.stays,\n       ROUND(m.revenue / m.stays, 2) AS adr\nFROM (SELECT c.region AS market,\n             COUNT(*) AS stays,\n             SUM(o.total) AS revenue\n      FROM orders o\n      JOIN customers c ON c.id = o.{1}\n      GROUP BY c.region) m\nWHERE m.stays >= {2}\nORDER BY adr {3};",
      slots: [
        {
          answer: "customer_id",
          kind: "keyword",
          label: "the guest key",
          why: "Stays attach to guests on customer_id — the key that carries region onto every booking. Joining on the booking id would pair guests to stays by coincidence of id numbers and rebuild the market fold around noise.",
        },
        {
          answer: "19",
          kind: "number",
          label: "the small-sample bar",
          why: "19 is the bar AND a verified cell: US prints stays = 19 and survives on the boundary. At 20 the US row drops — >= versus > is the whole decision — and LATAM's 2 stays never had a chance either way.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the rate order",
          why: "Highest rate first: US 383.48, EU 335.32, APAC 313.66 — the ladder the rate conversation reads top-down. ASC would open on APAC and bury the US premium story the deck exists to make.",
        },
      ],
      distractors: ["id", "20", "ASC"],
      walkthrough:
        "Two stages, two grains, one boundary. The derived table folds the stay-to-guest join to market grain — 45 / 37 / 19 / 2 stays carrying 15089.23 / 11605.45 / 7286.16 / 852.44 — and only then does the outer query gate and rate: stays >= 19 keeps US, EU and APAC, and ROUND(revenue / stays, 2) prints 383.48, 335.32, 313.66, matching the books to the cent. The order of operations matters as much as the numbers: the fold exists before the gate (a WHERE inside the inner query would filter rows before the census), and the boundary at exactly 19 is a decision — a distractor of 20 quietly deletes the second-highest-ADR market and the deck's whole comparison. id as the join key reroutes every stay to the wrong guest, and ASC inverts the ladder so the meeting opens on the cheapest market. Fold to the grain the definition needs, then gate, then order.",
    },
    {
      id: "cs-mar-6",
      tier: "medium",
      topic: "x2",
      universe: "month-close",
      title: "The settlement month board",
      brief:
        "Marriott-flavored brief on the storefront db (invoices = operator settlement bills, amount_cents = INTEGER cents): the month-close wants the settlement board — one row per invoice-issue month with the invoice census, billed value in dollars, and settled value counting only paid-status cents. Probed facts: 28 invoices — 21 paid (66443.00), 6 open (19609.00), 1 void (925.00); the biggest billed month is 2025-01 at 11085.00 with NOTHING settled (both invoices still open), while 2024-11 billed 8297.00 and settled it in full. The void-with-payment anomaly (invoice 11, 925.00 settled against a void status) lives in this ledger and is the follow-up probe, not this board; the board's job is the per-month exposure read, in dollars that survived the cents conversion.",
      ask: "Return per issue month: month, invoice count, billed (2dp), settled (2dp, paid status only) — biggest billed first.",
      template:
        "SELECT SUBSTR(i.issued_on, 1, {1}) AS month,\n       COUNT(*) AS invoices,\n       ROUND(SUM(i.amount_cents) / 100.0, 2) AS billed,\n       ROUND(SUM(i.amount_cents) FILTER (WHERE i.status = {2}) / 100.0, 2) AS settled\nFROM invoices i\nGROUP BY month\nORDER BY billed {3};",
      slots: [
        {
          answer: "7",
          kind: "number",
          noVerify: true,
          label: "the month-key width",
          why: "SUBSTR(issued_on, 1, 7) cuts '2024-01-15' to the '2024-01' month key the close reports at. At 4 the fold collapses to two years; at 10 it dissolves into 28 one-invoice months and the board loses its grain.",
        },
        {
          answer: "'paid'",
          kind: "keyword",
          label: "the settled filter",
          why: "Settled means the status says paid — 21 invoices, 66443.00 across the ledger. 'open' would print the 19609.00 of receivables as settled and flip the close into fiction; 'void' isolates the 925.00 anomaly instead of the exposure read.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the exposure order",
          why: "Biggest billed first: 2025-01 at 11085.00 leads the close because unsettled exposure leads the conversation. ASC would open on the smallest month and bury the nothing-settled story under routine rows.",
        },
      ],
      distractors: ["4", "10", "'open'", "'void'", "ASC"],
      walkthrough:
        "A one-pass census with money discipline on top. SUBSTR(issued_on, 1, 7) builds the month key; GROUP BY folds 28 invoices into 13 months; COUNT(*) is the census, SUM(amount_cents) / 100.0 converts cents exactly once, and FILTER (WHERE status = 'paid') is the settled fold — 2024-11 prints 8297.00 settled against 8297.00 billed, while 2025-01 prints 11085.00 billed against NULL settled, because SUM over zero paid rows is NULL (COALESCE(..., 0) is the display polish if the close wants zeros). ORDER BY billed DESC leads with exposure. The distractors each bend the board: a 4-char key collapses the fold to two years, a 10-char key dissolves it into one-invoice months, 'open' books receivables as settled cash, 'void' swaps the board for the anomaly hunt, and ASC buries the biggest exposure under the smallest rows. One pass, one conversion, one filter — and the NULL is information.",
    },
  ],

  problems: [
    { slug: "combine-two-tables", why: "LEFT JOIN guest profiles onto stays: the survival-rule drill — who stays in the report when the right side is missing — the join every Bonvoy-level read starts from." },
    { slug: "sales-analysis-ii", why: "Products with sales versus without, via LEFT JOIN and NULL checks — the operator-catalog read: which room categories moved and which never did (spoiler on this db: all of them did)." },
    { slug: "employees-with-missing-information", why: "FULL-picture anti-join: rows missing on either side. The property-profile hygiene read — stays whose operator or category data doesn't reconcile." },
    { slug: "average-selling-price", why: "Revenue-per-unit with a weighting choice — ADR in graded form: weighting by room nights changes the rate and the revenue-management argument." },
    { slug: "find-expensive-cities", why: "Markets pricing above the portfolio average — the ADR-versus-benchmark screen, group-versus-global logic on a catalog that averages 71.78." },
    { slug: "product-price-at-a-given-date", why: "The rate effective at booking time, not today's — as-of price logic, the exact query that settles rate-parity disputes with owners." },
    { slug: "immediate-food-delivery-ii", why: "Conditional share of orders meeting a flag — the completion-rate shape: numerator a state, denominator ALL stays, 82-of-103 in textbook form." },
    { slug: "sales-by-day-of-the-week", why: "Pivot demand by weekday — the Friday-arrival skew read: one row per day, conditional folds per column, the pace table every revenue meeting wants." },
    { slug: "calculate-orders-within-each-interval", why: "CASE buckets over a numeric range — the 2/3/4-day lead-time buckets this portfolio's check-in lags actually fall into, printed in one pass." },
    { slug: "the-category-of-each-member-in-the-store", why: "CASE bands over customer activity — the Bonvoy tier roll in miniature: boundaries are definitions, and the band sizes prove the boundaries." },
    { slug: "type-of-triangle", why: "CASE rubric with boundary classes — the tier-edge exercise: which band a guest lands in at exactly 2000 or 3000, decided by >= versus >." },
    { slug: "customer-purchasing-behavior-analysis", why: "Spend-tier classification over folded customer history — the concentration read behind 63.5% / 71.2%: who the loyalty program is actually built for." },
    { slug: "plan-migration-paths", why: "LAG over member states to trace transitions — tier upgrades and downgrades as a path table, the loyalty-health query this portfolio runs monthly." },
    { slug: "growth-accounting", why: "New / returning / resurrected classification from period-over-period states — the member-base waterfall LAG read that explains tier-mix drift." },
    { slug: "year-on-year-growth-rate", why: "LAG prior-period comparison for YoY deltas — pace versus the same month last year, the board deck's first chart and its favorite follow-up." },
    { slug: "rank-scores", why: "Score ladders where ties share rungs: RANK versus DENSE_RANK as a board-design decision — the property-scorecard tie problem in graded form." },
    { slug: "second-highest-salary", why: "The rate just below the top — second-highest logic with the empty-set edge: what the board prints when no second tier exists, the exact shape behind a 'next rate band' read." },
    { slug: "group-employees-of-the-same-salary", why: "Fold peers into shared rungs — operators and categories that tie on a metric get grouped, not ordered arbitrarily; the tie-handling discipline the property boards run on." },
    { slug: "find-overbooked-employees", why: "Concurrent-booking detection — overbooking is a policy, not a bug; the window logic that finds doubled occupancy is the revenue-management drill in graded form." },
    { slug: "last-person-to-fit-in-the-bus", why: "Running-total gate over an ordered queue — the overbooking buffer logic: keep admitting until capacity, then stop; a cumulative SUM with a condition." },
    { slug: "employee-task-duration-and-concurrent-tasks", why: "Concurrent interval counting at scale — how many stays overlap at once per property, the occupancy-depth read behind overbooking tolerance." },
    { slug: "find-overlapping-shifts", why: "Pairwise interval collision — the housekeeping and hall-assignment read: which booking pairs collide at the same property, stated as half-open-interval logic." },
    { slug: "merge-overlapping-events-in-the-same-hall", why: "Gaps-and-islands over intervals — merging back-to-back block bookings into occupied spans, the length-of-stay aggregation revenue analytics ships monthly." },
    { slug: "leetflex-banned-accounts", why: "A state change mid-window — the rate-changed-during-stay audit: did the guest's price move while they held the room, detectable only by interval logic." },
    { slug: "books-with-null-ratings", why: "NULL as absence versus zero — unrated content and un-checked-in stays are states, not scores; the census that keeps them visible without breaking averages." },
    { slug: "null-blank-audit", why: "Feed hygiene as a query — the null/blank sweep that runs before the nightly board trusts a column, exactly the 19:45 sanity pack in graded form." },
    { slug: "find-customer-referee", why: "Filter on a nullable attribute without losing rows — guest-preference fields are sparse; the WHERE that keeps the denominator honest while selecting on the flag." },
    { slug: "trial-balance-check", why: "Conditional SUM to zero as an assertion — the ledger ties 181080 against 181080; the graded drill that turns 'books balance' into a queryable fact." },
    { slug: "monthly-transactions-i", why: "Month-bucketed conditional folds — the 2024-01 to 2025-02 pace table with a status arm, built from SUBSTR keys and conditional aggregation." },
    { slug: "ar-aging-schedule", why: "Aging buckets over receivables — 6 open invoices worth 15217 and one partial at 4000 of 6148, aged into the buckets the month-close actually reports." },
    { slug: "top-travellers", why: "Rank guests by cumulative value with survival through the join — the Bonvoy spender ladder in graded form: Alice Chen 7262.35 at the top, the one-stay tail below." },
    { slug: "number-of-rich-customers", why: "Count buyers above a spend threshold — the concentration census behind 63.5%: how many guests carry the portfolio, printed as one conditional count." },
  ],
};
