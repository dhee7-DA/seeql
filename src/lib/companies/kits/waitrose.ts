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
    "Preparation strategy: the pools file carries no Waitrose section — **0 tagged rows**, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: premium-mix censuses, loyalty spend-band folds, CASE tier work at the 55 line, and the pence-safe settlement spine. Do the topics in order, then run the **six case studies** on the live storefront db, spaced across the week rather than in one sitting: the **premium-mix census** commercial opens the Monday trade meeting with, the **myWaitrose ladder** the CRM pod reads before every voucher drop, the **14-month book pulse** the growth review walks, the **never-settled exposure ledger** finance closes on, the **one-pass till census** the 08:15 huddle runs, and the **farm-partner bench** sourcing negotiates from. This expanded kit is built for spaced practice: run each case once to pass it, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
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
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "customer-order-frequency", "find-the-team-size"],
    },
    {
      name: "Joining shelves to baskets",
      why: "Premium-mix reporting means attaching category, farm partner and shelf price to every basket line — joins across the product and demand tables where the mapping is the point. Waitrose's follow-up is always about survival: does a line missing its SKU row still count in the aisle fold, and which join type answers honestly?",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier", "product-sales-analysis-iii", "customers-who-bought-all-products", "warehouse-manager"],
    },
    {
      name: "Counter & aisle revenue folds",
      why: "Aisle revenue is the commercial heartbeat: fold basket lines by category, round to the penny, and rank. The audits here drill exactly the join-then-aggregate shape the Monday pack is built from — with the discipline that 251 lines fold into 103 baskets (2.44 lines per basket), not the other way round.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "students-and-examinations", "orders-with-maximum-quantity-above-average"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, in flight, awaiting payment and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. This kit's theory rounds drill the census on both spellings.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "transactions-per-visit-histogram", "running-total-for-different-genders"],
    },
    {
      name: "CASE banding the range",
      why: "The range is banded — Essential on the value shelf, No.1 at the premium counter, with the 55 line as the published split — and every premiumization read is a CASE classification with fixed edges the range plan publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the premium-mix census, and loyalty tiers band the same way.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-category-of-each-member-in-the-store", "count-salary-categories"],
    },
    {
      name: "Ranking the loyalty ladder",
      why: "Top shoppers by basket count and lifetime spend is leaderboard reporting where ties are guaranteed — three households sit at 4 baskets on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer households, not syntax.",
      slugs: ["rank-scores", "top-earners", "second-highest-salary", "department-top-three-salaries", "find-loyal-customers"],
    },
    {
      name: "NULL policy at the checkout stamp",
      why: "A basket carries a NULL shipped_at until the trolley checks out — 82 of 103 do, and the 14 awaiting payment plus 7 abandoned never will. Waitrose screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "confirmation-rate", "find-customer-referee"],
    },
    {
      name: "Trading windows & date math",
      why: "Trading windows make date arithmetic a daily tool: units moved in a period, the last shop before a range change, baskets inside a seasonal-event window. Waitrose probes half-open intervals — BETWEEN on timestamps loses the last night of the window, and seasonal peaks land exactly there.",
      slugs: ["list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "find-golden-hour-customers", "active-users", "report-contiguous-dates"],
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
    {
      id: "waitrose-t9",
      q: "COUNT(*), COUNT(shipped_at) and COUNT(DISTINCT customer_id) all run over the basket read. What does each count, and where does the business need each one?",
      a: "COUNT(*) counts rows — 103 baskets, or 251 lines the moment order_items joins in. COUNT(shipped_at) counts non-NULL stamps only: 82, and the 21-row gap to COUNT(*) is exactly the 14 awaiting payment plus 7 abandoned trolleys — a feature the ops board reads as the queue. COUNT(DISTINCT customer_id) folds repeats back to households: 16 across the book, 8 in EU's 45 baskets. The habit being graded is saying the grain out loud before the number ships: rows, stamped rows, people — three claims that sound identical and read completely differently in the trade pack.",
      tag: "aggregation",
    },
    {
      id: "waitrose-t10",
      q: "The huddle board needs the four-stage census in one pass. FILTER (WHERE …) or SUM(CASE …) — which do you write, and when does the choice matter?",
      a: "Both are one scan, one denominator, four reconciling branches — 52, 30, 14, 7 over the same 103. FILTER (WHERE …) is the readable spelling where SQLite and Postgres both run it; SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) is the portable twin that runs anywhere and makes the 0/1 fold explicit. The choice matters in review: a branch whose ELSE is missing folds NULLs silently, and COUNT of a boolean flag counts everything non-NULL — 103 — instead of the stage. Whichever spelling ships, the census identity is the proof: the four branches must sum to COUNT(*) by construction, or the board lies.",
      tag: "case-when",
    },
    {
      id: "waitrose-t11",
      q: "The premium ladder bands every line at the published 55 No.1 line. How do you write the CASE so the bands survive review?",
      a: "Order the arms from the top of the ladder down and let CASE's first-match semantics do the work: WHEN unit_price >= 55 THEN 'no1_line', the mid arm if the plan carries one, ELSE 'essential_line' as the base band. The edges are published numbers, so they go in as literals — or better, as a named parameter the range plan owns — and the boundary gets tested on both sides: a 54.99 line is Essential, a 55.00 line is No.1, and a reordered arm silently re-bands everything between. The ELSE is the base band by construction; an arm left implicit is a hole in the census. Reviewers read the arms as the definition, so the arms must read like the range plan's own language.",
      tag: "case-when",
    },
    {
      id: "waitrose-t12",
      q: "When is UNION the bug and UNION ALL the honest stack in branch reporting?",
      a: "UNION ALL concatenates; UNION adds a distinct pass over the combined set. The dedupe is only correct when you can say which duplicated rows deserve collapsing — and in branch stacks the branches are disjoint by design (detail rows over a TOTAL row, completed over abandoned), so the dedupe buys nothing, costs a sort, and becomes a silent bug the day two branches emit byte-identical rows: the board loses a row with no error anywhere. The discipline is UNION ALL plus a comment stating why duplicates are impossible — the comment is the correctness argument. A vanishing TOTAL row or a vanished market is how the dedupe announces itself, usually in the meeting after the deck shipped.",
      tag: "set-ops",
    },
    {
      id: "waitrose-t13",
      q: "Which range questions do EXCEPT and INTERSECT answer more honestly than a join — and what do they silently do to duplicates?",
      a: "Set-level diffs across snapshots: SKUs in the new range feed but not the old one is SELECT sku FROM new EXCEPT SELECT sku FROM old — no join gymnastics, and the intent reads off the page; INTERSECT answers the mirror, SKUs present in both. The silent behavior: both inputs are deduplicated first, so a pipeline-retry duplicate collapses before the compare and the diff reads clean while the ingest anomaly stands. When duplicates ARE the signal, the row-honest tool is a GROUP BY the key HAVING COUNT(*) > 1 census or an anti-join on the full multiset. Column discipline still applies — both sides need matching column counts and compatible types — and EXCEPT for snapshot diffs, anti-joins for row-level forensics is the split to state out loud.",
      tag: "set-ops",
    },
    {
      id: "waitrose-t14",
      q: "When does the loyalty query grow past two grains, and what does naming the CTEs buy the next analyst?",
      a: "The moment the query stages households (basket count and lifetime spend per member), bands them (CASE at 3,000 and 2,000) and shares them (scalar subquery for the book denominator), it has three grains and one shot at being audited. Named CTEs — member, banded — read like the loyalty process instead of a nested subquery, each one is a checkpoint you can SELECT from while debugging, and one staging step can feed several later references without being written twice. Correctness under review is the real buy: a CTE named repeat_candidates forces the definition (2+ baskets) to live where the reviewer can see it instead of in a deck footnote. The performance note: CTEs are logical staging, not guaranteed materialization, so filter early inside each step and the outer stages carry fewer rows.",
      tag: "ctes",
    },
    {
      id: "waitrose-t15",
      q: "The board wants each market's share of the book beside its own fold. How do you build the denominator without a second query?",
      a: "In a query grouped by market, the denominator is the grand total across groups — written as SUM(SUM(o.total)) OVER (): the window aggregates the already-aggregated per-group sums over the whole partition. EU's 15,089.23 divided by the 34,833.28 total-of-totals reads 43.3, and the 100.0 multiplier goes in front of the division to force real arithmetic. The trap is writing SUM(o.total) OVER () as if it referenced base rows — at the grouped grain the window must fold the group sums, not the rows the group no longer has. Grain-mixing inside one expression is the entire trick, and saying which grain each SUM reads is the answer.",
      tag: "windows",
    },
    {
      id: "waitrose-t16",
      q: "The trolley-by-trolley cumulative book jumps two baskets in one step. What happened, and what is the fix?",
      a: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE treats ORDER BY ties as peers — two baskets sharing a created_at second enter the cumulative together, so the step doubles. The fix is declaring the frame: ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW walks strictly row by row regardless of ties. The distinction is calendar-true versus row-true — RANGE peers 'six days back' on a date axis, ROWS peers six rows back, which is wrong when a day is missing. On a month spine ties are rare; at trolley grain they are guaranteed, so the frame goes in the query, not in the reviewer's memory.",
      tag: "windows",
    },
    {
      id: "waitrose-t17",
      q: "Give me three ways to answer 'each market's heaviest trolley' — and how each behaves on ties.",
      a: "Window argmax: ROW_NUMBER() OVER (PARTITION BY region ORDER BY o.total DESC, o.id) = 1 in a CTE — one deterministic row per market even when two trolleys tie, because the second key breaks the tie. Join-back on the maximum: join markets to a per-market MAX(total) derived table — honest, but it returns BOTH tied trolleys, which is a feature when the brief says report co-leaders and noise when it says one row per market. Correlated filter: WHERE total = (SELECT MAX(…) for that market) — same tie behavior as the join-back, with per-row re-evaluation cost. The complete answer names the divergence: ROW_NUMBER decides, the join-back reports, the correlated form simplifies — and 'which one does the brief want' is the question that earns the follow-up.",
      tag: "windows",
    },
    {
      id: "waitrose-t18",
      q: "The finance tables store INTEGER pence. Where do numeric bugs bite, and what is your rounding policy?",
      a: "Three bite points. Scale: amount_cents = 175600 divided by 100 is integer division — 1756 flat; divide by 100.0 or convert once at the presentation edge. Mid-pipeline rounding: ROUND inside the calculation discards precision a later SUM still needed — round only what a human reads. Float drift: REALs are IEEE doubles, so compare money with a tolerance or keep it in integer pence to the last step. The policy I state in review: aggregate in pence, convert once, round at the edge, and let the trial balance prove it — 181,080 debits against 181,080 credits, delta zero, which is only checkable because nothing was rounded away en route.",
      tag: "numbers",
    },
    {
      id: "waitrose-t19",
      q: "Why is averaging the four markets' AOVs wrong, and what do you compute instead?",
      a: "Because it weights every market equally regardless of size: EU's 45 baskets and LATAM's 2 would each count as one vote. The honest all-book AOV is SUM(total)/COUNT(*) over the base rows — 338.19 on this book — where LATAM's two baskets barely register. The blends that work are re-aggregation from the base (sum the numerators, divide by the summed denominators) or a weighted average — SUM(aov * baskets)/SUM(baskets) — the same arithmetic one level up. The interview move is saying where the weighting lives: an average of averages is only correct when every group has equal counts, and that is a claim to defend, not assume.",
      tag: "aggregation",
    },
    {
      id: "waitrose-t20",
      q: "What makes a predicate sargable, and which habits keep the Monday-pack queries cheap?",
      a: "Sargable means the predicate compares the bare column to a value so an index can serve it. Wrapping the column in a function — SUBSTR(created_at, 1, 7) = '2024-03' — forces a scan of every basket; the sargable twin is the half-open range created_at >= '2024-03-01' AND created_at < '2024-04-01', same rows, index-usable. The habits that compound: filter early inside each CTE so later stages carry fewer rows, name columns instead of SELECT *, probe with LIMIT before committing to the full run, and aggregate on the smallest table that answers the question rather than joining first and filtering after. At branch scale they read as manners; at chain scale they are the difference between a pack that renders and one that times out in the meeting.",
      tag: "performance",
    },
    {
      id: "waitrose-t21",
      q: "The trade meeting asks for 'our premium share'. What do you pin down before writing SQL?",
      a: "The definition, in writing, before the FROM clause. Four decisions: the numerator (line revenue on lines priced at or above the 55 No.1 line — 26,605.51), the denominator (the whole 34,833.28 book, not the banded subset), the grain (basket LINES, not SKUs and not baskets), and the status filter (do abandoned trolleys' lines count in the base?). Then the discipline move: encode the definition as a named CTE — premium_lines AS (…WHERE unit_price >= 55…) — so the SQL IS the definition and the reviewer audits it instead of arguing. Waitrose's metric culture punishes vibes-based definitions; the analyst who says 'No.1 line revenue at the 55 line, over the placed-basket book, lines grain' owns the room.",
      tag: "metrics",
    },
    {
      id: "waitrose-t22",
      q: "A buyer quotes a SKU's price from last quarter's range plan, but the shelf has re-priced since. How do you read the price as of a date?",
      a: "The as-of shape: for each SKU, the latest price whose effective date is at or before the quote date — product-price-at-a-given-date logic. In SQL that is a window argmax (ROW_NUMBER OVER (PARTITION BY sku ORDER BY effective_from DESC) = 1 after filtering effective_from <= the as-of date) or a correlated MAX on the same predicate. The half-open discipline carries over: a price row is in force from its effective_from until the next row's effective_from, so the read must not assume today's row applies backward. As-of reads are the difference between 'the shelf says 12.99' and 'the plan said 11.49 when the buyer signed' — pricing audits live and die on that distinction.",
      tag: "dates",
    },
    {
      id: "waitrose-t23",
      q: "The Monday pack's premium share moved overnight. Which SQL checks run in the first ten minutes?",
      a: "Five, in order. Freshness: MAX(created_at) per source table — a feed that stopped at 02:00 explains most surprises alone. Volume: today's row count versus the 7-day average, because a half-loaded feed halves every downstream fold. Keys: GROUP BY the natural key HAVING COUNT(*) > 1 for pipeline-retry duplicates. Orphans: an anti-join of line product_ids against the range table to catch a reference break. NULL spikes: COUNT(unit_price) versus COUNT(*) — a column that went sparse empties every conditional fold built on it. On this book the sixth check is configuration: the 55 line itself — a moved banding edge re-cuts the premium fold with no data change at all. The deliverable is not 'it looks fine'; it is which check passed and when it last ran.",
      tag: "quality",
    },
    {
      id: "waitrose-t24",
      q: "When is DISTINCT a bug report rather than a feature in the basket fold?",
      a: "When it is papering over a fan-out nobody diagnosed. SELECT DISTINCT market, basket_total returning sane-looking rows usually means a join multiplied baskets by lines and DISTINCT is de-duplicating the damage — while the revenue SUM beside it is still wrong. The honest sequence: notice the DISTINCT, run the counts with and without it, find the multiplicity (GROUP BY the key HAVING COUNT(*) > 1), and fix the join or pre-aggregate. Legitimate DISTINCT exists: collapsing a dimension's value set — 4 market buckets from 103 baskets, 16 cities from 16 shoppers — or de-duplicating a deliberately over-joined enrichment. The tell is intentionality: a DISTINCT you can justify in one sentence is a feature; one you cannot is a bug report filed against your own query.",
      tag: "joins",
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
    {
      id: "waitrose-mcq-11",
      prompt: "The huddle board ships as ONE scan: completed, in flight, awaiting payment, abandoned in four columns over the same 103 baskets. Which expression fills the awaiting-payment column (14 trolleys)?",
      choices: ["COUNT(*) FILTER (WHERE status = 'pending')", "COUNT(status = 'pending')", "SUM(*) FILTER (WHERE status = 'pending')", "COUNT(*) GROUP BY 'pending'"],
      answer: 0,
      why: "FILTER (WHERE …) skips rows failing the predicate for that aggregate only, so four columns share one scan and one denominator — the census reconciles to 103 by construction, which is the identity the huddle checks before reading anything else.",
      notes: [
        { choice: 1, why: "COUNT of a 0/1 boolean counts every non-NULL flag — 103, the whole board. The condition needs FILTER, or the flag needs SUM." },
        { choice: 2, why: "SUM(*) is not SQL — SUM takes an expression, not the * wildcard. The portable twin is SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-12",
      prompt: "Statement #28 reads amount_cents = 175600 in the finance tables. Which expression prints 1,756.00 in the settlement memo?",
      choices: ["amount_cents / 100", "amount_cents / 100.0", "ROUND(amount_cents, 2)", "CAST(amount_cents AS TEXT)"],
      answer: 1,
      why: "The finance tables store INTEGER pence; INTEGER / 100 is integer division and returns 1756 flat — the pence are gone before any rounding could matter. Dividing by the float literal 100.0 forces real arithmetic: 1756.0, the sterling read the memo quotes.",
      notes: [
        { choice: 0, why: "1,756 exactly — wrong on every odd-pence statement in the book. The missing .0 is how a settlement quietly leaks pence." },
        { choice: 2, why: "ROUND of an INTEGER is the INTEGER — it never converts scale. The fix is the divisor, not a wrapper." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-13",
      prompt: "created_at is TEXT like '2025-02-14 09:31:00'. Which expression buckets every basket onto the 14-month trading spine (2024-01 through 2025-02)?",
      choices: ["SUBSTR(created_at, 1, 7)", "strftime('%m', created_at)", "SUBSTR(created_at, 6, 2)", "MONTH(created_at)"],
      answer: 0,
      why: "Positions 1–7 of an ISO-8601 timestamp are exactly 'YYYY-MM' — year plus zero-padded month, so the 14 buckets stay distinct. '%m' alone yields '02' and merges January 2024 with January 2025 into one bucket — the spine collapses to 12 fictional months.",
      notes: [
        { choice: 1, why: "Correct function, wrong format code — '%m' is month-only. The year has to ride along: '%Y-%m' would also work, and SUBSTR(…, 1, 7) is the same key cheaper." },
        { choice: 3, why: "MONTH() is not a SQLite function — the date toolkit here is strftime, julianday and plain string slicing." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-14",
      prompt: "The seasonal promo window covers every basket checked out in March 2024, through the last night of the month. Which WHERE clause catches '2024-03-31 21:14:00'?",
      choices: ["WHERE created_at BETWEEN '2024-03-01' AND '2024-03-31'", "WHERE created_at >= '2024-03-01' AND created_at < '2024-04-01'", "WHERE created_at LIKE '2024-03-31%'", "WHERE julianday(created_at) = '2024-03-31'"],
      answer: 1,
      why: "Timestamps compare as strings, and '2024-03-31 21:14:00' sorts AFTER '2024-03-31' — BETWEEN's inclusive upper bound drops the last night exactly when seasonal trolleys land. The half-open range ends at April's midnight and catches every second of March with no boundary judgment.",
      notes: [
        { choice: 0, why: "Inclusive on both ends — but the stored strings carry times, so the 31st's own evening baskets sort past the bound and vanish. Half-open intervals end at the NEXT period's start." },
        { choice: 2, why: "That keeps only the 31st itself — the other 30 days are gone. LIKE on timestamps is also format-fragile and non-sargable." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-15",
      prompt: "The myWaitrose desk re-publishes the frequency ladder with shared rungs and no gaps: 24, 17, 14, 13, 5 baskets, then three households tied at 4. Under DENSE_RANK, what does the next household (3 baskets) carry?",
      choices: ["9", "7", "6", "5"],
      answer: 1,
      why: "DENSE_RANK gives tied rows the same rank and never skips: the 4-basket tie is rank 6 three times, so the next distinct count lands on 7. The no-gap property is the tier guarantee — no phantom positions between rungs.",
      notes: [
        { choice: 0, why: "That is RANK's answer — it consumes ranks 6, 7, 8 on the tie and skips to 9. Gaps are RANK semantics; the desk asked for no gaps." },
        { choice: 2, why: "6 is the tie's own rank, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-16",
      prompt: "Inside the grouped loyalty query (GROUP BY tier), the board computes each band's share of the whole 34,833.28 book. Which expression is the honest denominator?",
      choices: ["SUM(lifetime_spend) — the CTE already spans every household", "(SELECT SUM(total) FROM orders) — the unfiltered book", "COUNT(*) * AVG(total)", "MAX(lifetime_spend) — the biggest household's spend"],
      answer: 1,
      why: "Inside GROUP BY tier, SUM(lifetime_spend) is the BAND's own total — dividing it by itself prints 100.0 for every tier. The scalar subquery pins the denominator to the whole 103-basket book, so the top band reads 63.5, not 100.0.",
      notes: [
        { choice: 0, why: "It spans every household in the CTE — but the fold has already grouped them, so at division time it is one tier's sum. Share-of-itself is the silent bug." },
        { choice: 3, why: "MAX is one household's spend — a share of nothing. The denominator must be the book, not an extreme." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-17",
      prompt: "The analyst wants only the months whose book value fell month-over-month: `SELECT month, book, LAG(book) OVER (ORDER BY month) AS prev FROM monthly WHERE book < prev` fails. Why — and what is the fix?",
      choices: ["LAG cannot appear next to a comparison — wrap it in ROUND first", "Window functions evaluate in the SELECT stage, after WHERE — stage the LAG in a CTE or subquery and filter outside", "Falling months need HAVING, not WHERE", "The ORDER BY inside OVER must be DESC to see falls"],
      answer: 1,
      why: "WHERE runs before SELECT computes the window, so prev does not exist at filter time — the engine rejects the alias, not the idea. The fix is two stages: fold the spine in a CTE with the LAG attached, then filter book < prev in the outer query. The same rule governs filtering on RANK or a running total.",
      notes: [
        { choice: 0, why: "The comparison itself is fine — ROUND changes nothing. The failure is evaluation order, not arithmetic." },
        { choice: 2, why: "HAVING filters groups, and no grouping is happening — the filter is about a window value that does not exist yet. Stage, then filter." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-18",
      prompt: "Month-end: list every wholesale statement with zero tender legs — all 6, including the one marked 'paid' with no payments (#28, 1,756.00). Which query returns exactly that list?",
      choices: ["SELECT i.number FROM invoices i JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents IS NULL", "SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.id IS NULL", "SELECT number FROM invoices WHERE status != 'paid'", "SELECT i.number FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id WHERE p.amount_cents = 0"],
      answer: 1,
      why: "The anti-join keeps all 28 statements and holds the 6 whose payment payload never arrived (p.id IS NULL) — status is a claim, payment rows are the ledger of record, so the paid-status anomaly surfaces here and nowhere else.",
      notes: [
        { choice: 0, why: "INNER JOIN deletes the six before the WHERE can see them — the result is empty, since payments never carry NULL amounts while existing." },
        { choice: 2, why: "The status column is exactly what lies on #28 — and status != 'paid' also sweeps in the void-but-settled statement (#11 carries a 925.00 tender leg). Filter the payment side, not the claim." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-19",
      prompt: "Range review: each aisle's most expensive shelf SKU. Two aisles have SKUs tied at the top price. Which query returns exactly one row per aisle, deterministically?",
      choices: ["Join products to a per-aisle MAX(price) subquery", "ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, id) = 1, keep rn = 1", "DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) = 1", "WHERE price = MAX(price) GROUP BY category"],
      answer: 1,
      why: "ROW_NUMBER with a named tie-breaker (id) keeps exactly one row per partition even when prices tie — the deterministic pick the range plan needs. The MAX join-back and DENSE_RANK = 1 both keep EVERY tied SKU; MAX in WHERE is not valid SQL.",
      notes: [
        { choice: 0, why: "Right shape, wrong cardinality on ties — the join-back returns both tied SKUs and the aisle block doubles. A tie-breaker is just ROW_NUMBER spelled out." },
        { choice: 3, why: "An aggregate in WHERE is a hard error — aggregates do not exist before groups form. The aisle ceiling needs a window or a join-back." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-20",
      prompt: "The range plan prints every price band — including the premium band (>= 200) where this db stocks nothing. Which query still prints that band's row?",
      choices: ["GROUP BY the banding CASE — empty bands fold too", "A bands spine LEFT JOINed to the fold (or UNION ALL'd), with COUNT COALESCEd to 0", "HAVING COUNT(*) >= 0 keeps every band", "WHERE price >= 200 IS NOT NULL"],
      answer: 1,
      why: "GROUP BY only materializes groups that own rows — an empty band vanishes from the fold, and a report that omits empty buckets lies by omission. The zero-fill comes from a bands spine: LEFT JOIN from the dimension side (or UNION ALL the zero band) and the COUNT reads 0 honestly.",
      notes: [
        { choice: 0, why: "Folding groups rows that EXIST — the premium CASE arm produces no rows to fold, so no group materializes. The arm must be printed, not folded." },
        { choice: 2, why: "COUNT(*) >= 0 is always true and keeps only the bands that exist — the empty one is already gone before HAVING runs." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-21",
      prompt: "`SELECT COUNT(DISTINCT c.region) FROM orders o JOIN customers c ON c.id = o.customer_id` runs on the trading db. What returns?",
      choices: ["4 — EU, APAC, US, LATAM", "103", "16", "45"],
      answer: 0,
      why: "The join fans 103 baskets out across shoppers, but COUNT(DISTINCT region) folds the fan-out back to the four market buckets that buy. DISTINCT's output size is the column's cardinality — 4 — not the row count it started from.",
      notes: [
        { choice: 1, why: "103 is the joined row count — COUNT(*)'s answer. The DISTINCT keyword is doing all the work." },
        { choice: 2, why: "16 is the shopper count. Regions are coarser than households — there is no region-level duplication to leave behind." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-22",
      prompt: "A basket join to its lines fans 103 baskets into 251 rows. What does COUNT(*) read on the joined table — and what reads 103 again?",
      choices: ["103 either way — the join is lossless", "251 lines; COUNT(DISTINCT o.id) reads 103 baskets", "251 baskets; the join duplicated every basket", "498 — the units ride along"],
      answer: 1,
      why: "After the fan-out, COUNT(*) counts the FINEST grain present — basket lines, 251 of them. COUNT(DISTINCT o.id) folds the lines back to baskets: 103. Choosing between them IS choosing the grain the trade meeting will argue about.",
      notes: [
        { choice: 0, why: "The join is lossless for baskets but multiplicative for rows — every multi-line trolley repeats. Row count and basket count part ways the moment a trolley holds two SKUs." },
        { choice: 3, why: "498 is SUM(quantity) — units moved, a third grain. Lines, baskets and units are three different claims about the same trolley." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-23",
      prompt: "Abandoned-trolley share per market: EU reads 6.7%. Which rows sit in the denominator?",
      choices: ["Completed baskets only (52)", "Stamped baskets only (82)", "All placed baskets (103) — abandoned included", "Awaiting payment only (14)"],
      answer: 2,
      why: "Numerator and denominator must fold over the same base: 3 abandoned of EU's 45 placed baskets = 6.7%. Dropping the abandoned rows from the denominator is the definition quietly rigging itself — the share inflates exactly where abandonment hurts.",
      notes: [
        { choice: 0, why: "52 completed is a different funnel stage — that denominator measures completion mix, not abandonment. Name the population on the slide." },
        { choice: 1, why: "The 82 stamped rows are the latency population — a different metric wearing a similar name. Abandonment is share of everything placed." },
      ],
      difficulty: "easy",
    },
    {
      id: "waitrose-mcq-24",
      prompt: "In a query grouped by market, which expression computes EU's share of the whole book (15,089.23 of 34,833.28 — 43.3%)?",
      choices: ["SUM(o.total) / COUNT(*)", "SUM(o.total) / SUM(SUM(o.total)) OVER ()", "AVG(o.total) / SUM(o.total)", "SUM(o.total) / 103"],
      answer: 1,
      why: "The numerator is the per-market sum at the GROUP BY grain; the denominator is the grand total — written as SUM of the per-group SUM across the whole partition: SUM(SUM(x)) OVER () is the windowed total-of-totals. Mixing the two grains in one expression is the entire trick: 15,089.23 / 34,833.28 → 43.3%.",
      notes: [
        { choice: 0, why: "That is AOV — revenue per basket, not a share of the book. The denominator needs every market's money, not a row count." },
        { choice: 2, why: "A mean over a total is dimensionally meaningless — a share of nothing. The grand total is another SUM, layered over the groups." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-25",
      prompt: "The range snapshot diff runs `SELECT sku FROM products_new EXCEPT SELECT sku FROM products_old`. Both feeds describe the same 16 SKUs — but a pipeline retry wrote one SKU twice in new. What comes back?",
      choices: ["1 row — the duplicated SKU looks like a difference", "0 rows — EXCEPT deduplicates both inputs first, and the duplicate collapses before the compare", "16 rows — every SKU differs", "An error — EXCEPT requires unique keys"],
      answer: 1,
      why: "EXCEPT is a set operation: both sides are deduplicated before the compare, so the retry duplicate collapses and the diff reads empty — hiding the ingest anomaly the diff was supposed to catch. When duplicates ARE the signal, the row-honest tool is a GROUP BY the key HAVING COUNT(*) > 1 census, not a set diff.",
      notes: [
        { choice: 0, why: "A multiset diff would say that — sets don't. The dedupe happens before the comparison, which is precisely why the anomaly vanishes." },
        { choice: 3, why: "EXCEPT is happy with duplicate rows — dedupes them, even. No uniqueness requirement exists on either side." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-26",
      prompt: "mom_pct = ROUND(100.0 * (book - LAG(book) OVER (ORDER BY month)) / LAG(book) OVER (ORDER BY month), 1). What is the opening month's (2024-01) value?",
      choices: ["0.0 — the spine starts flat", "NULL — LAG has no prior row, and NULL propagates through the arithmetic", "A division-by-zero error", "3,731.97 — the month's own book"],
      answer: 1,
      why: "LAG returns NULL on the first row of the window, and any arithmetic with NULL yields NULL — so 2024-01's change is honestly 'no baseline', not zero. Coalescing it to 0.0 silently asserts a flat month where the truth is 'unknown'; if the deck wants a label, that is an explicit decision, written down.",
      notes: [
        { choice: 0, why: "Nothing coerces the NULL to 0 automatically — a displayed 0.0 is a COALESCE someone chose, and it lies about the baseline." },
        { choice: 2, why: "NULL is not zero — the denominator never evaluates, so no error is raised. The row simply carries NULL." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-27",
      prompt: "The whitespace report LEFT JOINs every registered shopper to their baskets; the stakeholder wants 0.00 where no basket exists, not a blank. Which expression is honest?",
      choices: ["WHERE o.total IS NOT NULL — blanks only confused them", "COALESCE(SUM(o.total), 0.0) — guard the aggregate's NULL result, not its inputs", "SUM(IFNULL(o.total, 1)) so unmatched rows contribute", "An INNER JOIN — shoppers with no baskets aren't in the book anyway"],
      answer: 1,
      why: "An unmatched LEFT JOIN row folds to SUM = NULL; COALESCE after the aggregate prints the requested 0.00 and the shopper stays on the report. IFNULL inside the sum fabricates a pound per missing row, and the inner-join version deletes the very households the report exists to watch.",
      notes: [
        { choice: 0, why: "That deletes the never-bought households entirely — the opposite of showing them with a zero. The blank was the honest data; the fix is display, not deletion." },
        { choice: 2, why: "Each missing basket just contributed 1.00 of invented spend — guard the RESULT of the aggregate, never its inputs." },
      ],
      difficulty: "hard",
    },
    {
      id: "waitrose-mcq-28",
      prompt: "The banding CASE reads: WHEN price >= 55 THEN 'no1' WHEN price >= 30 THEN 'mid' ELSE 'essential'. Where does the 199.99 flagship land?",
      choices: ["essential — ELSE catches everything unlisted", "no1 — CASE evaluates arms in order and the first true arm wins", "mid — because 199.99 also satisfies the 30 arm", "An error — overlapping arms are rejected"],
      answer: 1,
      why: "CASE is first-match: the 55 arm is tested first, so 199.99 stops there and never reaches the 30 arm. That ordering IS the banding — reorder the arms and the premium counter re-bands itself down the ladder with no error anywhere.",
      notes: [
        { choice: 0, why: "ELSE only runs when every WHEN is false — the flagship matched the first arm. The ELSE is the base band by construction." },
        { choice: 2, why: "Both arms are true, but only the first fires. Order the arms from the top of the ladder down, or the bands drift." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-29",
      prompt: "The branch P&L stack appends a labelled TOTAL row under the per-category fold. Which operator joins the branches, and why?",
      choices: ["UNION — it dedupes the TOTAL row against the categories", "UNION ALL — every row belongs; a bare UNION pays a dedupe pass and could silently drop a future duplicate row", "INTERSECT — only rows common to both branches survive", "CROSS JOIN — it pairs every category with the total"],
      answer: 1,
      why: "UNION ALL is a raw concatenation — the honest stack when every row is meant to ship. A bare UNION adds a distinct sort over the combined set: it happens to return the same rows here (all distinct) while paying for the dedupe and betting the report's future on no two branches ever emitting an identical row.",
      notes: [
        { choice: 0, why: "The categories and the TOTAL row are never identical — the dedupe protects nothing here and costs a sort. It becomes a bug the day two branches collide." },
        { choice: 2, why: "INTERSECT keeps the OVERLAP of the two branches — the detail rows and the TOTAL row share nothing, so the stack empties." },
      ],
      difficulty: "medium",
    },
    {
      id: "waitrose-mcq-30",
      prompt: "Reconcile the trolley read: 103 baskets, 251 lines, 498 units. Which expression reads UNITS moved per market?",
      choices: ["COUNT(*) on the joined basket lines", "SUM(quantity) over the basket lines", "COUNT(DISTINCT o.id)", "SUM(o.total)"],
      answer: 1,
      why: "Units live on the lines: SUM(oi.quantity) adds the quantity column — 498 across the book. COUNT(*) reads lines (251), COUNT(DISTINCT o.id) reads baskets (103), and SUM(o.total) reads pounds, not units.",
      notes: [
        { choice: 0, why: "That is the LINE census — a coffee plus a cake is two rows regardless of how many units each carries." },
        { choice: 3, why: "Total is money — the book value fold. The premiumization story needs units and pounds kept apart." },
      ],
      difficulty: "easy",
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
    {
      id: "cs-waitrose-3",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The fourteen-month book pulse",
      brief:
        "Trading-spine brief, Waitrose-flavored on the storefront db: the growth review walks the monthly basket book — each month's value, the month before it, and the percentage move — so the trend narrative writes itself from the table. Probed on the storefront db: 14 months of trading from 2024-01 to 2025-02 across 103 baskets worth 34,833.28; the book opens at 3,731.97, and the first six months run 3,731.97 → 3,609.64 → 2,617.08 → 2,468.91 → 2,910.31 → 2,047.43, with the May→June fade costing -29.6 and the 2024-07 trough sitting at 1,193.86. LAG carries the prior month; the first month's move is honestly NULL — no baseline exists. The opener cut keeps six months.",
      ask: "Return month, baskets, book value, the prior month's book value, and the month-over-month percentage to 1 decimal, for the first six months, chronological.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         COUNT(*) AS baskets,\n         SUM(total) AS book\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       baskets,\n       ROUND(book, 2) AS book_value,\n       {1}(book) OVER (ORDER BY month) AS prev_book,\n       ROUND(100.0 * (book - LAG(book) OVER (ORDER BY month))\n             / LAG(book) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(book) walks the window back one row — February's prev_book is January's 3,731.97. LEAD would read forward and hand February March's book, silently re-labeling the future as history; the first row's NULL is the honest no-baseline.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month read is chronological: ASC keeps 2024-01 on top so each row compares against the row above. DESC presents the newest month first with its baseline below — the numbers survive, the story doesn't.",
        },
        {
          answer: "6",
          kind: "number",
          label: "the opener cut",
          why: "LIMIT 6 returns the first six months — the run the deck opens with, ending on the -29.6 June fade. The figure 6 is also June's basket count sitting in the output, and the fade is the row the narrative quotes.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "3"],
      walkthrough:
        "Staged windows over the trading spine. The CTE folds 103 baskets into 14 monthly rows — SUBSTR month key, COUNT for volume, SUM(total) for the book — and the outer query reads each month against its neighbor: LAG(book) brings January's 3,731.97 into February's row, and the percentage divides the delta by that same LAG — -3.3 for the February ease, then 2,617.08 (-27.5), 2,468.91 (-5.7), the May lift to 2,910.31 (+17.9), and the June fade to 2,047.43 (-29.6). The first month is NULL by design: no prior row, no baseline, no invented zero. The spine is also where the deeper reads start — the 2024-07 trough of 1,193.86 and the 3,731.97 peak both sit on this same fold. LEAD would read the future; SUM would pile a running total into prev_book; DESC tells the story backwards; LIMIT 3 amputates the fade the memo quotes. Every chip changes what the review would conclude.",
    },
    {
      id: "cs-waitrose-4",
      tier: "medium",
      topic: "j5",
      universe: "month-close",
      title: "The never-settled exposure ledger",
      brief:
        "Month-close brief, in-world: before supplier services sends a single reminder, finance pulls the never-settled exposure — every wholesale statement with zero tender legs — and walks it line by line. Probed on the storefront db: 28 statements, 22 settled (21 exact, 1 partial at 4,000 of 6,148) and 6 with no payment rows at all, worth 1,521,700 pence (15,217.00): INV-2025-024 (4,937.00 — the largest exposure), INV-2025-026 (3,562.00), INV-2025-027 (2,794.00), INV-2025-028 (1,756.00 — marked 'paid' with zero payment rows), INV-2024-021 (1,295.00) and INV-2024-018 (873.00). The ledger prints cents, biggest exposure first, with the exposure statement count beside every row.",
      ask: "Return number, status and billed cents for every statement with no tender legs, biggest exposure first, with the exposure statement count beside each row.",
      template:
        "SELECT i.number,\n       i.status,\n       i.amount_cents,\n       COUNT(*) OVER () AS statements\nFROM invoices i\n{1} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id {2} NULL\nORDER BY i.amount_cents {3};",
      slots: [
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the statement-preserving join",
          why: "LEFT JOIN keeps all 28 statements and hands the 6 with no tender legs a NULL payment payload. INNER JOIN silently deletes those 6 rows — including the paid-status anomaly this ledger exists to expose.",
        },
        {
          answer: "IS",
          kind: "keyword",
          label: "the unmatched-payload test",
          why: "p.id IS NULL keeps exactly the unmatched rows — the anti-join half of the shape. IS NOT NULL would flip the query to the 22 settled statements, and p.id = NULL matches nothing (NULL equality is UNKNOWN).",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-exposure-first direction",
          why: "Biggest exposure first is descending: 493,700 at the top and the anomaly 175,600 mid-list, which is the order the dunning draft walks. ASC opens on the smallest statement (873.00) — a correct query aimed at the wrong end of the queue.",
        },
      ],
      distractors: ["INNER", "NOT NULL", "NOT", "ASC"],
      walkthrough:
        "An anti-join with a window stamp. The LEFT JOIN preserves all 28 statements; the 22 with tender legs match, and the 6 without arrive carrying NULL payment payloads — WHERE p.id IS NULL keeps exactly those 6, ordered biggest exposure first: 493,700 / 356,200 / 279,400 / 175,600 / 129,500 / 87,300, footing to 1,521,700 pence (15,217.00). The window COUNT(*) OVER () folds the result's own cardinality back into every row — 6 — so the ledger's headline number travels with its evidence. Two anomalies ride this list: INV-2025-028 is marked 'paid' with zero tender legs (a status that lies — payment rows are the ledger of record), and the void-but-settled statement (#11, 925.00) never appears here at all, which is why the anomaly walk runs the mirror query too. INNER JOIN deletes the six rows the ledger exists to show; IS NOT NULL flips to the settled book; the bare NOT breaks the parse; ASC opens the ledger on its smallest exposure.",
    },
    {
      id: "cs-waitrose-5",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The one-pass till census",
      brief:
        "Branch-ops memo, Waitrose-flavored on the storefront db: the 08:15 huddle reads the estate as a one-pass census — each market's baskets split by stage in four columns that must reconcile to the market's total by construction. Probed on the storefront db: EU runs 24 completed / 12 in flight / 6 awaiting payment / 3 abandoned (45 baskets), APAC 21 / 8 / 5 / 3 (37), US 5 / 10 / 3 / 1 (19), LATAM 2 / 0 / 0 / 0 (2). The US block is the one ops leans on: 10 of its 19 baskets are still in flight — the heaviest in-flight concentration in the estate — while LATAM prints honest zeros across the quiet columns. The board reads biggest completed count first, and the abandoned column ships in the portable SUM(CASE …) spelling beside its FILTER twins.",
      ask: "Return one row per market: completed, in-flight, awaiting-payment and abandoned basket counts, one scan, biggest completed count first.",
      template:
        "SELECT c.region AS market,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE o.status = 'shipped') AS in_flight,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS awaiting_payment,\n       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS abandoned\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY completed {3};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed literal",
          why: "Completed is status 'delivered' — 52 baskets estate-wide, 24 of them EU. 'shipped' in this arm folds the 30 in-flight baskets into the completed column and the in-flight read doubles as a phantom completion.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the awaiting-payment literal",
          why: "Awaiting payment is status 'pending' — 14 trolleys with no checkout stamp yet. 'cancelled' here would merge the abandoned arm into the awaiting column (7 rows), and 'delivered' double-counts the completed stage.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-completed-first direction",
          why: "The board reads the busiest completion first: EU 24, APAC 21, US 5, LATAM 2. ASC opens on LATAM's 2 — a correct query aimed at the quietest end of the estate.",
        },
      ],
      distractors: ["'shipped'", "'cancelled'", "'completed'", "ASC", "MAX"],
      walkthrough:
        "One scan, four reconciling columns. The join attaches every basket to its market, and the four aggregates read the same 103 rows through different lenses: three FILTER (WHERE …) counts for the status stages and the SUM(CASE …) twin for abandoned — the portable spelling ops keeps beside the FILTER form so the census survives on engines without FILTER. The read: EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — each market's four columns sum to its basket count (45/37/19/2), which is the reconcile-by-construction check the huddle runs before the deck ships. The US row is the operational flag: 10 of 19 baskets still in flight is over half the market's trolley base waiting to land, against EU's 12 of 45. The distractors each corrupt one column: 'shipped' swaps completed for in-flight, 'cancelled' and 'completed' fold the wrong stages into the arms, ASC flips the board to LATAM-first, and MAX in any slot either errors or turns a literal into an aggregate misuse.",
    },
    {
      id: "cs-waitrose-6",
      tier: "medium",
      topic: "j7",
      universe: "supplier",
      title: "The farm-partner bench",
      brief:
        "Sourcing brief, Waitrose-flavored on the storefront db: range reviews open with the farm-partner bench — every producer partner's basket-book contribution, units moved, SKU count and the trusted-bench flag at the published 4.5 rating line. Probed on the storefront db: Nordic carries 11,130.25 of the 34,833.28 book (31.9%) over 82 units from 3 SKUs at rating 4.6; Midwest 9,294.93 (26.7%) over 109 units at 4.4; Alpine 4,765.63 (13.7%) over 77 units at 4.8 — the trusted bench at 4.5-plus is exactly Nordic and Alpine, with Andes (4.0), Shenzhen (4.1) and Pacific (3.9) on the watch list. The bench reads biggest revenue first.",
      ask: "Return each partner with rating, SKU count, units moved and basket-book revenue to 2 decimals, plus a trusted/watch flag at the 4.5 line, biggest revenue first.",
      template:
        "SELECT s.name AS partner,\n       s.rating,\n       COUNT(DISTINCT p.id) AS skus,\n       SUM(oi.quantity) AS units,\n       ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue,\n       CASE WHEN s.rating >= {1} THEN {2} ELSE {3} END AS bench_flag\nFROM suppliers s\nJOIN products p ON p.supplier_id = s.id\nJOIN order_items oi ON oi.product_id = p.id\nGROUP BY s.id\nORDER BY revenue {4};",
      slots: [
        {
          answer: "4.5",
          kind: "number",
          noVerify: true,
          label: "the trusted-bench rating line",
          why: "The trusted bench starts at rating 4.5 — on this book that is exactly Nordic (4.6) and Alpine (4.8). A 4.0 line pulls Andes onto the bench and the sourcing terms the flag drives shift with it.",
        },
        {
          answer: "'trusted'",
          kind: "keyword",
          label: "the bench label",
          why: "The 4.5-plus arm is the trusted bench — the partners whose terms renew without renegotiation. Relabeling it breaks every downstream join to the sourcing calendar, which keys on the published flag names.",
        },
        {
          answer: "'watch'",
          kind: "keyword",
          label: "the off-bench label",
          why: "The ELSE arm catches the watch list — Andes 4.0, Shenzhen 4.1, Pacific 3.9 on this book. Both arms reading one label collapses the flag and the watch list stops existing.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-revenue-first direction",
          why: "Sourcing reads the heaviest partner first: Nordic 11,130.25, then Midwest 9,294.93, Alpine 4,765.63, Andes 3,613.25, Shenzhen 3,049.07, Pacific 2,980.15. ASC opens on the smallest book — a correct query aimed at the wrong end of the negotiation.",
        },
      ],
      distractors: ["4.0", "'bench'", "'avoid'", "ASC", "MAX"],
      walkthrough:
        "A three-table chain that ends in a sourcing flag. Partner joins shelf (products on supplier_id) and shelf joins demand (order_items on product_id); GROUP BY s.id folds each partner's lines into SKU count, units and revenue — the six revenue cells foot to the 34,833.28 book, which is the reconcile check before the meeting. The CASE bands the bench at 4.5: Nordic 11,130.25 / 82 units / 3 SKUs and Alpine 4,765.63 / 77 / 2 are trusted; Midwest carries the second-heaviest book (9,294.93, 26.7%) at 4.4 and sits on the watch list — the tension the sourcing meeting exists to resolve. The distractors each break differently: a 4.0 line re-flags Andes as trusted; 'bench' or 'avoid' relabels the flags into dead keys the calendar cannot join to; ASC flips the read to Pacific-first; MAX in any slot either errors or turns a literal into an aggregate misuse. Fold at partner grain, flag at the published line, read biggest first.",
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
    { slug: "rank-scores", why: "The rank trio in miniature: scores with guaranteed ties, ranks shared and gaps kept — the vocabulary drill before the myWaitrose ladder escalates it to a voucher-policy decision." },
    { slug: "second-highest-salary", why: "The tier below the peak: second-highest shelf price, second-heaviest trolley. LIMIT-OFFSET breaks on ties — the DENSE_RANK or MAX-below-MAX habit this kit's ladder topics keep drilling." },
    { slug: "top-earners", why: "Leaderboard cuts at a threshold: the top-N fold behind every 'top shoppers this season' slide, with the tie policy named before the LIMIT lands." },
    { slug: "department-top-three-salaries", why: "Per-group top-N with a join-back for names — the aisle's top-three SKUs by price. Composition under a business rule, the late-round escalation of the loyalty ladder." },
    { slug: "find-loyal-customers", why: "Threshold reads over repeat behavior: shoppers who cleared the loyalty bar in a window. The myWaitrose save-campaign list is exactly this fold with a date range attached." },
    { slug: "customer-order-frequency", why: "Visit cadence per household: who shops weekly, who lapsed. The frequency column of every loyalty read on this kit — COUNT per customer with the window stated." },
    { slug: "count-salary-categories", why: "Band counts with the empty bands printed: the premium band is empty on this shelf and the range plan must still see a 0. UNION ALL zero-fill against a CASE fold." },
    { slug: "active-users", why: "Consecutive-day windows over shopping dates: the weekly-shop streak the myWaitrose desk wants counted honestly, gaps and all." },
    { slug: "report-contiguous-dates", why: "Gaps-and-islands over dates: contiguous runs become reportable windows — the availability-streak shape behind every 'we never missed a slot' claim." },
    { slug: "transactions-per-visit-histogram", why: "Zero-filled histogram of visits per shopper: bins with no households must print 0, not vanish — the honest distribution read the loyalty ladder generalizes." },
    { slug: "orders-with-maximum-quantity-above-average", why: "Bulk-shop detection: orders whose units clear the average. A subquery-threshold fold over basket lines — the catering-trolley question at branch scale." },
    { slug: "product-sales-analysis-iii", why: "Aggregate-then-rank per SKU: the top periods behind each product's curve. The aisle fold escalates into a window ranking — aggregate first, rank second." },
    { slug: "customers-who-bought-all-products", why: "AND-semantics over basket lines: households that carried the whole range. The full-basket audit behind 'complete shop' campaigns — a double NEGATION over EXISTS." },
    { slug: "find-the-team-size", why: "COUNT() OVER (PARTITION BY …) enrichment: attach market size to every basket row without collapsing rows — the two-grain read in window clothing." },
    { slug: "running-total-for-different-genders", why: "Running totals partitioned by a dimension: the cumulative book that walks trolley by trolley without mixing populations — frame discipline included." },
    { slug: "warehouse-manager", why: "The stock report fold: units on shelf against units moved, per SKU — the availability half of every range review, drilled against the same inventory shape." },
  ],
};
