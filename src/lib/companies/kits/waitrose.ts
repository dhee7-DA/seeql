// Waitrose — Wave-10 (Task 100), food domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12, incl. the wave-8+9
// probe-derived canonical-cells section).
// UK premium grocery at branch scale: the storefront db read as a Waitrose
// trading sandbox — customers are shoppers (region = the db's four market
// buckets EU/APAC/US/LATAM), orders are baskets (delivered = completed basket
// 52, shipped = in flight with shipped_at as the checkout stamp 30, pending =
// trolley awaiting payment 14, cancelled = abandoned trolley 7), order_items
// are basket line records (quantity = units, unit_price = line price paid),
// products are grocery SKUs (the own-brand ladders read as price tiers:
// Essential Waitrose on the value shelf, Waitrose No.1 at the premium counter),
// suppliers are farm/producer partners, invoices are wholesale/settlement
// statements (finance tables store INTEGER pence — sterling read =
// amount_cents / 100.0), payments are tender rails, expenses are branch opex,
// ledger_entries is the GL. orders.total and order_items.unit_price are REAL
// dollars already. Angle kept DISTINCT from tesco (Clubcard promo bands):
// premium own-brand share, myWaitrose loyalty spend bands, branch economics.
// Pool provenance: company-pools.md carries NO Waitrose section (0 tagged
// rows, none SQL-graded), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu — sql rows only, no w*/d*/f*
// rows — and say so. Case briefs quote probed figures from
// scripts/company-facts.md (canonical cells re-verified by this kit's temp
// probe against a readonly db copy: region x premium-tier grid, loyalty
// spend-band ladder 4/68/63.5 — 1/5/7.7 — 11/30/28.8, premium revenue split
// 26,605.51 vs 8,227.77); every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const waitroseKit: CompanyKit = {
  id: "waitrose",
  domainId: "food",
  name: "Waitrose",
  tagline: "Premium UK grocery: own-brand mix, myWaitrose, branches",
  accent: "text-green-300",

  brief: [
    "**Waitrose** is the UK's premium grocer — an employee-owned branch estate where the shop is a quality statement and the basket is the unit of trade. Two own-brand ladders anchor the range: {amber:Essential Waitrose} holds the value shelf and **Waitrose No.1** sits at the premium counter, and premiumization — walking every trolley up that ladder — is the commercial number branch teams live by. This kit maps the storefront db onto that world: the 16 customers rows are shoppers (region = the four market buckets), the 103 orders are baskets worth **34,833.28**, and the 251 order_items rows are basket lines — quantity = units, unit_price = the line price actually paid. The status map is fixed: delivered = {emerald:completed basket} (52, 50.5%), shipped = {sky:in flight} (30, 29.1%, shipped_at = the checkout stamp), pending = trolley awaiting payment (14, 13.6%), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits the way the branch P&L does. Commercial analysts own the range: own-brand share and the **premium-line mix** — at the published 55 price line the book splits 268 Essential units averaging 31.01 against 230 No.1 units averaging 115.85, and No.1 lines carry **26,605.51 of the 34,833.28 book (76.4%)**. Loyalty and CRM own {sky:myWaitrose}: **63.5%** of revenue sits with households whose lifetime spend crosses 3,000 (71.2% above 2,000), so one lapsed top-tier household moves a market. Branch ops own the trolley-to-in-flight flow — **82 of 103** baskets carry the checkout stamp, averaging **2.98 days** created-to-checkout with a 2–4 day spread. Finance ops own the settlement book: 28 wholesale statements and 27 tender legs in INTEGER pence, where the sterling read is `amount_cents / 100.0` — the missing .0 is how a settlement quietly leaks pence on every odd-penny line.",
    "Interview screens are **census-then-denominator**, premium-grocer flavored. A typical loop opens with a **two-grain market read** — EU runs 45 baskets from 8 shoppers while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'does an abandoned trolley count in your base?'*), then into the **loyalty ladder** where three households sit tied at 4 baskets and rank semantics become a business decision. Late rounds band the range at the **No.1 line** with `CASE`, or walk the {sky:14-month trading spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Waitrose section — **0 tagged rows**, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: premium-mix censuses, loyalty spend-band folds, CASE tier work at the 55 line, and the pence-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the **premium-mix census** commercial opens the Monday trade meeting with, the other rebuilds the **myWaitrose ladder** the CRM pod reads before every voucher drop. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the overnight in-flight read. A branch-ops analyst opens the trading dashboard before the morning meeting: did overnight baskets get their `shipped_at` checkout stamps, is any trolley aging while awaiting payment, does the one-pass status census reconcile — 52 completed + 30 in flight + 14 awaiting payment + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If checkout latency drifts off the **2.98-day** norm — the market reads run EU 2.94, APAC 2.93, US 3.07 — the trolley-recovery queue gets pulled before the trade read ships.",
    "**11:30 —** Midday is the premiumization read. The commercial pod wants the premium-mix census refreshed — No.1 units versus Essentials per market, with EU's **100 No.1 units against 99 Essentials** flagged as *the only premium-majority market* — and a buyer wants aisle revenue re-cut against the 8-SKU price bands (Essential shelf averaging **32.06**, mid range 111.5, ceiling 199.99). The myWaitrose desk wants the ladder re-ranked with the **three-way tie at 4 baskets** handled honestly — shared rungs, named policy. Each ask is a join, a conditional aggregate and one judgment call about statuses; the analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the trade-meeting argument*.",
    "**15:30 —** The afternoon tilts toward the settlement book and branch opex. The AR anti-join refreshes first — **6 never-settled statements worth 15,217** — before supplier services sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero tender legs (#28, 1,756.00). Branch P&L closes the loop — Rent 14 entries at **16,800**, Ads 4,570, Tools 1,525, Travel 2,521 — and the day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Premium line mix", what: "Basket lines split at the published 55 No.1 line: 230 No.1 units averaging 115.85 against 268 Essential units averaging 31.01. The premiumization headline — and the CASE-band fold every commercial screen opens with." },
    { name: "Premium revenue share", what: "No.1 line revenue over the basket book: 26,605.51 of 34,833.28 = 76.4% (probe-verified; the two tier arms foot exactly to the book). The number that decides counter space and range reviews." },
    { name: "myWaitrose concentration", what: "Share of the book from households whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The top band is 4 households carrying 68 baskets and 22,121.70 — one lapsed household moves a market." },
    { name: "Basket book & AOV", what: "Total basket value 34,833.28 across 103 baskets, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the premiumization story — the 1,088.44 trolley outweighs the smallest 42 times over." },
    { name: "Checkout-stamp latency", what: "Created_at to shipped_at over stamped baskets only: 82 of 103, 2.98-day average, range 2–4. The population ships with the number — awaiting-payment and abandoned trolleys have no stamp yet." },
    { name: "Abandoned-trolley share", what: "Abandoned baskets ÷ all, per market: EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0.0. The honest-denominator metric — numerator and denominator fold over the same 103-basket base." },
    { name: "Farm-partner bench", what: "Share of the 34,833.28 book by farm/producer partner: Nordic carries 32% (rated 4.6), Midwest 26.7% (4.4); the trusted bench at rating 4.5-plus is Nordic and Alpine (4.8). Sourcing terms follow this ranking." },
    { name: "Branch P&L & the close", what: "Branch opex: Rent 14 entries / 16,800, Ads 14 / 4,570, Tools 5 / 1,525, Travel 3 / 2,521; AR 6 unpaid / 15,217; coverage 21 exact / 1 partial (4,000 of 6,148); ledger trial balance 181,080 = 181,080, delta zero." },
  ],

  topics: [
    {
      name: "Premium-tier conditional counting",
      why: "Every Waitrose commercial screen starts from the same fold: completed, in flight, awaiting payment, abandoned — one status column, four business meanings, each a conditional count with a denominator the interviewer asks about out loud. The premiumization overlay: the same conditional pattern bands lines at the 55 No.1 line. The trap is calling an in-flight basket 'completed' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "percentage-of-users-attended-a-contest", "monthly-transactions-i"],
    },
    {
      name: "Two-grain market reads",
      why: "Baskets and shoppers are different grains of the same join, and every market read reports both: EU runs 45 baskets from 8 shoppers while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining shelves to baskets",
      why: "Premium-mix reporting means attaching category, farm partner and shelf price to every basket line — joins across the product and demand tables where the mapping is the point. Waitrose's follow-up is always about survival: does a line missing its SKU row still count in the aisle fold, and which join type answers honestly?",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Counter & aisle revenue folds",
      why: "Aisle revenue is the commercial heartbeat: fold basket lines by category, round to the penny, and rank. The audits here drill exactly the join-then-aggregate shape the Monday pack is built from — with the discipline that 251 lines fold into 103 baskets (2.44 lines per basket), not the other way round.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "students-and-examinations"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, in flight, awaiting payment and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. This kit's theory rounds drill the census on both spellings.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "CASE banding the range",
      why: "The range is banded — Essential on the value shelf, No.1 at the premium counter, with the 55 line as the published split — and every premiumization read is a CASE classification with fixed edges the range plan publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the premium-mix census, and loyalty tiers band the same way.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store"],
    },
    {
      name: "Ranking the loyalty ladder",
      why: "Top shoppers by basket count and lifetime spend is leaderboard reporting where ties are guaranteed — three households sit at 4 baskets on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer households, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary"],
    },
    {
      name: "NULL policy at the checkout stamp",
      why: "A basket carries a NULL shipped_at until the trolley checks out — 82 of 103 do, and the 14 awaiting payment plus 7 abandoned never will. Waitrose screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "confirmation-rate", "find-customer-referee"],
    },
    {
      name: "Trading windows & date math",
      why: "Trading windows make date arithmetic a daily tool: units moved in a period, the last shop before a range change, baskets inside a seasonal-event window. Waitrose probes half-open intervals — BETWEEN on timestamps loses the last night of the window, and seasonal peaks land exactly there.",
      slugs: ["list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "find-golden-hour-customers"],
    },
    {
      name: "Settlement & the pence read",
      why: "Wholesale is not settled until the tender legs land — the finance tables (28 statements, 27 legs, INTEGER pence) are where the shelf world meets money. Every sterling read is amount_cents / 100.0, and the exact/partial/none coverage split (21 / 1 / 6) is one CASE away. The GL angle: trial balance in, delta zero out.",
      slugs: ["products-worth-over-invoices", "trial-balance-check", "gl-reconciliation"],
    },
  ],

  theory: [
    {
      id: "waitrose-t1",
      q: "Your premium-mix report joins basket lines to shoppers through the SKU table. When do you INNER and when do you LEFT — and what silently breaks if you filter a basket column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A premium-mix report joins basket lines to products and shoppers: a line with no product row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A 'shoppers who registered with myWaitrose but never scanned' report must be LEFT from shoppers: the unmatched shoppers ARE the answer, arriving with NULL basket columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload shopper row — the LEFT quietly became an INNER and the lapsed-shopper list vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-bought shoppers — all 16 appear in the basket table somewhere — and proving that zero is itself the analyst's job. Join type is a decision about who survives, not a habit.",
      tag: "joins",
    },
    {
      id: "waitrose-t2",
      q: "Three myWaitrose households sit tied at 4 baskets on the frequency ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the three-way tie at 4 consuming ranks 6 through 8, and the next distinct count (3) lands on 9, implying two phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose household gets the next voucher drop. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer households (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment. At Waitrose the ladder drives the seasonal voucher calendar, so a phantom gap quietly reshapes who counts as a top-tier shopper.",
      tag: "windows",
    },
    {
      id: "waitrose-t3",
      q: "The market read shows 103 baskets and 16 shoppers; EU shows 45 baskets from 8 shoppers. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts basket rows after the join — one row per basket, so a shopper with 24 baskets contributes 24. COUNT(DISTINCT customer_id) folds those rows back to shoppers — EU's 45 baskets collapse to 8 households. Neither is wrong: baskets measure load on tills and in-flight capacity, shoppers measure installed base and reach. The ratio — 5.6 baskets per shopper in EU versus 9.5 in the US on this db — is the intensity signal that says US demand concentrates in two heavy households. The trap that catches candidates is a third grain: join order_items for basket lines and COUNT(*) silently counts lines, not baskets — 251 of them, 2.44 per basket. At Waitrose a fourth grain lurks: fold units and the same query reads 498 units. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "waitrose-t4",
      q: "shipped_at is NULL until a trolley checks out. What is your policy for the checkout-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only stamped baskets have a latency, so the report measures created_at to shipped_at for the 82 of 103 baskets that carry the checkout stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL baskets returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the stamped subset; the gap between it and COUNT(*) is exactly the 14 awaiting payment plus 7 abandoned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents instant checkouts for trolleys still awaiting payment. A report whose WHERE clause is doing definitional work without saying so is exactly what a Waitrose reviewer hunts for, because the awaiting-payment queue is a population the business deliberately watches.",
      tag: "nulls",
    },
    {
      id: "waitrose-t5",
      q: "Ops wants abandoned-trolley share per market, but only for markets carrying at least ten baskets. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards completed, in-flight and awaiting rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-basket floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a market map and an error, and between a threshold applied to baskets versus to pounds. The strong answer places every filter by asking: is this a fact about one basket, or about a market? On this db the floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2 — a market whose abandoned share is a confident 0.0 precisely because the base is tiny.",
      tag: "pipeline",
    },
    {
      id: "waitrose-t6",
      q: "The loyalty board wants each spend band's share of the whole book, not just its own sum. Walk me through the scalar subquery that supplies the denominator — and what happens when the inner fold comes back empty.",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the division — on this db the book denominator is (SELECT SUM(total) FROM orders) = 34,833.28, so the top band's 22,121.70 reads 63.5 percent — and zero rows return NULL, not an error, so share = spend / NULL is NULL for every row and the whole board prints blank while looking valid. That empty-inner case is theoretical on the full table but real on staging: one status filter or one broken date range in the subquery and the shares vanish silently. The correlated cousin (compare each household to ITS band's average) re-runs per outer row and answers a different question at a different cost. The strong candidate states the denominator's population out loud — the whole 103-basket book, not the banded subset — because a share whose denominator drifts from the brief is the number that dies in the trade meeting.",
      tag: "subqueries",
    },
    {
      id: "waitrose-t7",
      q: "The trading calendar buckets baskets by month on TEXT timestamps. How do you build the spine, cut a seasonal window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The seasonal window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's baskets, and seasonal-end is exactly when the premium trolleys land. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine the book opens at 3,731.97 and the 2024-07 trough of 1,193.86 is the row an analyst must be able to find twice. Date discipline is trading discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "waitrose-t8",
      q: "Finance says a wholesale settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero tender legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a tender leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER pence, so every sterling read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly leaks pence on every odd-penny line. The close's identity: coverage must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 against 181,080 — delta zero, or the branch close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "waitrose-mcq-1",
      prompt: "A basket row's status reads 'shipped'. In this kit's Waitrose stage map, what happened?",
      choices: ["Completed — the shop is done and counted", "In flight — the trolley checked out and stamped, not yet landed", "Trolley awaiting payment", "Abandoned trolley"],
      answer: 1,
      why: "The stage map is fixed: shipped = in flight with shipped_at as the checkout stamp — 30 of 103 baskets (29.1%). The shop is NOT complete until it lands as 'delivered'.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 of 103 (50.5%). Counting the 30 in-flight baskets as completed inflates the till before a single trolley lands, and the completion mix stops tying to the 103-basket base." },
        { choice: 2, why: "Awaiting payment is 'pending' — 14 trolleys with no checkout stamp yet. Those rows never get a stamp; confusing the two populations corrupts both the latency read and the trolley-recovery queue." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-2",
      prompt: "The range is banded at the published 55 No.1 line. What does the split read on this db?",
      choices: ["230 No.1 units @ 115.85 vs 268 Essential units @ 31.01", "268 No.1 units @ 31.01 vs 230 Essential units @ 115.85", "8 No.1 SKUs @ 111.5 vs 8 Essential SKUs @ 32.06", "52 No.1 baskets vs 51 Essential baskets"],
      answer: 0,
      why: "At unit_price >= 55 the lines are the No.1 counter: 230 units averaging 115.85; below the line sit 268 Essential units averaging 31.01. The arm labels travel with the arm — swapping them flips the premiumization story.",
      notes: [
        { choice: 1, why: "That is the same split with the labels swapped — 31.01 is the value-shelf average, not a premium price. A label swap here quietly reports the premium counter as the value shelf in the board pack." },
        { choice: 2, why: "8 @ 111.5 and 8 @ 32.06 are the SHELF price bands over the 16 SKUs (8 SKUs per band), not the line-grain tier fold — a different grain and a different question." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-3",
      prompt: "EU runs 45 baskets from 8 shoppers. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts basket rows (45); COUNT(DISTINCT customer_id) folds repeats back to shoppers (8). The gap between them — 5.6 baskets per shopper — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every basket has a shopper. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "SUM(total)/COUNT(*) is AOV — a value metric, not a census. It answers 'how big is the trolley', not 'how many households'." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN unit_price >= 55 THEN quantity * unit_price ELSE 0 END) / SUM(quantity * unit_price) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to No.1 lines only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, the CASE-flag sum over the line total folds as integer division — the premium share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between a 76.4 premium share and a displayed 76.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT-shaped integer folds)*100 truncates 0.763 to 0 first, then scales — the premium map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-5",
      prompt: "Keep only markets carrying at least 10 baskets. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY region HAVING COUNT(*) >= 10", "WHERE baskets >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "A basket-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db the floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'baskets' column on the raw orders table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The awaiting-payment trolleys double-counted their created day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the stamped-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 baskets.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-7",
      prompt: "The loyalty frequency ladder runs 24, 17, 14, 13, 5 baskets, then THREE households tied at 4. Under RANK, what rank do the two 3-basket households carry?",
      choices: ["9", "7", "8", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the three-way tie consumes ranks 6 through 8, so the next distinct count lands on 9. Both 3-basket households share rank 9.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The myWaitrose desk's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "8 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-8",
      prompt: "A staging-table lapsed-shopper list uses shopper_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every basket carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty lapsed-shopper lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-9",
      prompt: "A board stack puts No.1-band SKUs under Essential-band SKUs in one layout, built with UNION. A reviewer says one SKU's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same SKU, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same SKU, same counts, no band or branch label — collapse into one, and the board loses a SKU with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-10",
      prompt: "A dashboard walks basket value trolley by trolley: SUM(total) OVER (ORDER BY created_at). Two baskets share a created_at second, and the cumulative 'jumps two trolleys at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at trolley grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-waitrose-1",
      tier: "easy",
      topic: "s6",
      universe: "pricing",
      title: "The premium-mix census",
      brief:
        "Waitrose-flavored brief on the storefront db: Monday's trade meeting opens with the premium-mix census — every market's basket lines banded at the published 55 No.1 line, with units moved and average line price per tier. Probed facts: at the 55 line the book splits 268 Essential units averaging 31.01 against 230 No.1 units averaging 115.85, and No.1 lines carry 26,605.51 of the 34,833.28 basket book (76.4%). The market grid reads APAC 96 Essential @ 31.66 plus 78 No.1 @ 110.51, EU 99 @ 31.00 plus 100 @ 120.36 — the only market where No.1 units outweigh Essentials — US 66 @ 30.02 plus 46 @ 115.73, LATAM 7 @ 30.92 plus 6 @ 104.38. The meeting reads region by region, biggest tier-units first.",
      ask: "Return each market x premium tier with units moved and average line price to 2 decimals, region ascending and biggest units first within each region.",
      template:
        "SELECT c.region AS region,\n       CASE WHEN oi.unit_price >= {1} THEN {2} ELSE {3} END AS tier,\n       SUM(oi.quantity) AS units,\n       ROUND(AVG(oi.unit_price), {4}) AS avg_line_price\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region, tier\nORDER BY region, units {5};",
      slots: [
        {
          answer: "55",
          kind: "number",
          label: "the No.1 price line",
          noVerify: true,
          why: "The premium counter starts at shelf price 55 — the published split that reads 268 Essential units @ 31.01 against 230 No.1 units @ 115.85. A 100 ceiling re-bands the 89.99 and 79.00 SKUs into the Essential arm and every market row re-cuts.",
        },
        {
          answer: "'no1_line'",
          kind: "keyword",
          label: "the premium-arm label",
          why: "The 55-plus arm is the No.1 counter — 230 units averaging 115.85 platform-wide. Mislabeling it as the value arm does not change the fold but poisons every downstream join to the range plan, which keys on the published band names.",
        },
        {
          answer: "'essential_line'",
          kind: "keyword",
          label: "the value-arm label",
          why: "The under-55 arm is the Essential shelf — 268 units averaging 31.01. Both arms reading the same label merges two tier rows per market and the fold loses the split the census exists to see.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the line-price precision",
          noVerify: true,
          why: "Line prices print to 2 decimals — EU No.1 at 120.36, APAC Essential at 31.66 — matching the price-list grain commercial quotes. ROUND(…, 1) prints 120.4 and the census drifts off the published price file.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-units-first direction",
          why: "Within each region the meeting reads the bigger tier first: EU No.1 100 units over Essential 99 — the premiumization headline — and APAC Essential 96 over No.1 78. ASC buries the headline row at the bottom of every region block.",
        },
      ],
      distractors: ["100", "1", "ASC", "SUM", "MAX"],
      walkthrough:
        "One join, one CASE, one fold — the census in a single pass. The join attaches every basket line to its market through the basket, the CASE bands each line at the 55 No.1 line, and GROUP BY region + tier folds 251 lines into eight rows where SUM(quantity) reads units and ROUND(AVG(unit_price), 2) reads the tier's average line price. The probed read: APAC 96 Essential @ 31.66 + 78 No.1 @ 110.51; EU 99 @ 31.00 + 100 @ 120.36 — the only market where premium units outweigh the value shelf, which is exactly the premiumization headline the meeting wants first in its block; US 66 @ 30.02 + 46 @ 115.73; LATAM 7 @ 30.92 + 6 @ 104.38. Reconcile upward: the region-tier units sum to 498, and the platform tier fold reads 268 Essential @ 31.01 against 230 No.1 @ 115.85 — the canonical split, with No.1 revenue at 26,605.51 of the 34,833.28 book. The distractors fail honestly: 100 as the ceiling re-bands the range; 1 as the threshold makes every line No.1 and as the precision truncates the price read; ASC reverses every region block; SUM and MAX in a label or predicate slot either error or relabel the arms into the range plan's dead keys.",
    },
    {
      id: "cs-waitrose-2",
      tier: "medium",
      topic: "q6",
      universe: "growth",
      title: "The myWaitrose ladder",
      brief:
        "Waitrose-flavored brief on the storefront db: the myWaitrose desk bands every household by lifetime spend against the published 3,000 loyalty line (the core band starts at 2,000) and reads household count, basket count and each band's share of the whole book. Probed facts: 103 baskets worth 34,833.28; the no1_tier is 4 households carrying 68 baskets and 22,121.70 (63.5% of the book — the concentration cell CRM quotes); the single core_tier household adds 5 baskets and 2,667.93 (7.7%); the 11 everyday households carry 30 baskets and 10,043.65 (28.8%). Shares fold over the WHOLE book — the denominator is the full 103-basket base, not the banded subset — and the board reads biggest share first.",
      ask: "Return each loyalty tier with household count, basket count and share of the total book to 1 decimal, biggest share first.",
      template:
        "WITH member AS (\n  SELECT o.customer_id AS member_id,\n         COUNT(*) AS baskets,\n         ROUND(SUM(o.total), 2) AS lifetime_spend\n  FROM orders o\n  GROUP BY o.customer_id\n)\nSELECT CASE WHEN lifetime_spend >= {1} THEN {2}\n            WHEN lifetime_spend >= 2000 THEN {3}\n            ELSE {4} END AS tier,\n       COUNT(*) AS members,\n       SUM(baskets) AS baskets,\n       ROUND(100.0 * SUM(lifetime_spend) / (SELECT SUM(total) FROM orders), {5}) AS book_share\nFROM member\nGROUP BY tier\nORDER BY book_share {6};",
      slots: [
        {
          answer: "3000",
          kind: "number",
          label: "the no1-tier spend line",
          noVerify: true,
          why: "The top band starts at 3,000 lifetime spend — 4 households, 68 baskets, 22,121.70. A 2,000 threshold pulls the core household into the top band and the ladder reads 5 members where the CRM book says 4.",
        },
        {
          answer: "'no1_tier'",
          kind: "keyword",
          label: "the top-band label",
          why: "The 3,000-plus arm is the no1_tier — the concentration band behind the 63.5% cell. Relabeling it breaks every downstream join to the voucher calendar, which keys on the published tier names.",
        },
        {
          answer: "'core_tier'",
          kind: "keyword",
          label: "the middle-band label",
          why: "The 2,000-plus arm is the core_tier — exactly one household (2,667.93) on this db. A merged or swapped middle label folds that household into a neighboring band and the 71.2% two-band cumulative stops tying to the concentration table.",
        },
        {
          answer: "'everyday_tier'",
          kind: "keyword",
          label: "the base-band label",
          why: "The ELSE arm catches the 11 households under 2,000 — 30 baskets, 10,043.65, 28.8% of the book. The ELSE must be the base band by construction: an empty arm would silently drop a third of the estate from the ladder.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "Shares print to 1 decimal — 63.5 / 7.7 / 28.8, footing to 100.0 across the ladder — matching the concentration table CRM quotes. ROUND(…, 0) prints 64 and the board stops reconciling with the published 63.5.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-share-first direction",
          why: "The board reads the ladder top-down by book share: 63.5, then 28.8, then 7.7. ASC opens on the single core_tier household's 7.7 — a correct query aimed at the wrong end of the deck.",
        },
      ],
      distractors: ["2000", "0", "'everyday_tier'", "'core_tier'", "ASC", "MAX"],
      walkthrough:
        "Two stages: stage the households, then band and share them. The CTE folds 103 baskets to 16 member rows — basket count and lifetime spend each; the outer CASE bands them at 3,000 and 2,000; GROUP BY tier folds three bands; and the scalar subquery (SELECT SUM(total) FROM orders) pins the denominator to the whole 34,833.28 book so shares are book shares, not banded-subset shares. The probed read: no1_tier 4 households / 68 baskets / 63.5 — four shoppers, the 24/17/14/13 ladder, carrying 22,121.70; everyday_tier 11 / 30 / 28.8; core_tier 1 / 5 / 7.7 — the single 2,667.93 household, whose members cell is also the slot's verified figure. The top two bands sum to the published 71.2% above-2,000 cell, and the three shares foot to 100.0. The distractors fail honestly: 2000 re-bands the top gate and merges the core household upward; 0 pushes every household into the top band and truncates the share read; a duplicate tier label merges two bands into one row; ASC flips the deck; MAX in any slot either errors or relabels a band into the voucher calendar's dead keys.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Trolley depth and AOV are the premiumization read: lines per basket beside value per basket — 251 lines over 103 baskets is 2.44 on this db. This problem drills the two-metric fold the trade pack opens with." },
    { slug: "repeat-purchase-rate", why: "myWaitrose's whole promise is that the weekly shop comes back. Share of shoppers with 2+ baskets in a window is the repeat rate the CRM pod reports weekly — a distinct-count ratio with the denominator stated." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary segments decide who gets the next seasonal voucher drop. NTILE quintiles over basket recency, frequency and value are exactly the loyalty-band query this kit's ladder topics build toward." },
    { slug: "customers-who-never-order", why: "Shoppers who registered for myWaitrose but never scanned is the lapsed-list question — the LEFT JOIN + IS NULL anti-join. On this db the honest answer is a confident zero, and proving it is part of the job." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The weekly-shop household: which shopper carries the most baskets — 24 on this db. An argmax over a grouped count is the opening query of every myWaitrose engagement review." },
    { slug: "immediate-food-delivery-ii", why: "The branch delivery promise lives or dies on the promised-window share: baskets landed within the slot versus late. A conditional rate over a timestamp comparison — the delivery-SLA query at premium-grocery scale." },
    { slug: "monthly-transactions-ii", why: "The branch month-close stack: completed versus abandoned trolleys per month, stacked into one layout. UNION ALL branches with a status rule each — the month-end pack's core move." },
    { slug: "average-selling-price", why: "Shelf price versus what shoppers actually paid per SKU — the own-brand price-integrity audit. A weighted per-SKU fold where the units denominator makes or breaks the number." },
    { slug: "sales-by-day-of-the-week", why: "The Friday/weekend shop is the Waitrose rhythm: a day-of-week pivot over basket dates. CASE columns per weekday over a grouped fold — exactly the traffic-shape query branch ops runs weekly." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Habitual staples: the most-bought SKU per household. Per-shopper argmax over basket lines — the personalization query behind myWaitrose offer targeting." },
    { slug: "product-price-at-a-given-date", why: "Price as-of the range-change date, when re-pricing overwrites the shelf: the latest price at or before the move. A window-argmax over price history — the range-review screens' favorite escalation." },
    { slug: "find-churn-risk-customers", why: "Shoppers whose shopping cadence is slipping are the churn-risk list before the lapse happens. Recency-gapped household reads over basket timestamps — the myWaitrose save-campaign query." },
    { slug: "weeks-of-supply", why: "Counter shelf cover in weeks turns a stock table into a replenishment decision. Waitrose availability analysts run this fold daily across the range — stock divided by trailing demand, per SKU." },
    { slug: "returns-rate-by-category", why: "Waste and returns by aisle decide next season's buying. A per-aisle rate with the category denominator handled honestly is the same shape as the abandoned-trolley share." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Footfall without a basket: branch visits that never converted. The browse-versus-buy anti-join is the conversion question every branch team asks after a tasting weekend." },
    { slug: "bank-account-summary-ii", why: "The farm-partner settlement book in one query: statements beside settled amounts, pence-safe. INTEGER pence and the /100.0 rule make this exact practice for the settlement true-up." },
  ],
};
