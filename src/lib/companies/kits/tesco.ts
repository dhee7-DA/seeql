// Tesco — Wave-9 (Task 98), food domain, 0 tagged pool rows — theme-curated;
// facts from scripts/company-facts.md (probed 2026-10-12).
// UK grocery at store-format scale: the storefront db read as a grocer's
// trading sandbox — customers are Clubcard members (region = UK-region bucket,
// carried as the db's EU/APAC/US/LATAM codes), orders are baskets
// (delivered = completed basket — online order or store till take, shipped =
// online order out for delivery with shipped_at as the van-dispatch stamp,
// pending = click+collect awaiting pickup, cancelled = abandoned basket),
// order_items are basket lines (quantity = units, unit_price = shelf price;
// Clubcard Prices ride as promo variants), products are grocery SKUs by aisle
// (category), suppliers are FMCG suppliers, invoices are supplier settlement
// statements, payments are tender/settlement legs, all money tables INTEGER
// cents. Pool provenance: company-pools.md carries NO Tesco section (0 tagged
// rows, none SQL-graded), so all 10 topic slug sets and all 16 problems are
// theme-curated from the pools file's theme menu — sql rows only, no w*/d*/f*
// rows — and say so. Case briefs quote probed figures from
// scripts/company-facts.md; every case slot is mechanically verified against
// db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const tescoKit: CompanyKit = {
  id: "tesco",
  domainId: "food",
  name: "Tesco",
  tagline: "UK grocery at format scale — Clubcard, vans, aisles",
  accent: "text-blue-400",

  brief: [
    "**Tesco** is the UK's largest grocer — a network that runs from Extra hypermarkets down through Superstores, Metros and Express convenience stores, plus the Tesco Online delivery business and Whoosh rapid delivery, with F&F clothing riding alongside the food. The loyalty engine is Clubcard: points on every shop, and {amber:Clubcard Prices} — member-only shelf prices that make the same SKU print two different numbers at the till. That duality is the analyst's daily reality here: *the shelf price and the paid price are different facts*, and baskets, not visits, are the unit of trade. This kit maps the storefront db onto that world: the 16 customers rows are Clubcard members, the 103 orders are baskets worth **34,833.28**, and the 251 order_items rows are basket lines — quantity = units, unit_price = the line price actually paid. The status map is fixed: delivered = {emerald:completed basket} (52, 50.5% — till take or landed online order), shipped = {sky:out for delivery} (30, 29.1%, shipped_at = the van-dispatch stamp), pending = click+collect awaiting pickup (14, 13.6%), cancelled = {rose:abandoned} (7, 6.8%).",
    "The data org splits the way a grocer's P&L does. Commercial analysts own aisles and suppliers — category revenue folds, the weekly **promo/price audit**, and the {amber:Clubcard Prices} effective-price read. Network analytics own the vans and the slots: shipped_at is the dispatch stamp, and the **82 of 103** stamped baskets average **2.98 days** created-to-dispatch with a 2–4 day spread — the latency number that decides whether the online promise holds. Clubcard and CRM analytics own segments and coupon response — **63.5%** of revenue sits with members whose lifetime spend crosses 3,000 (71.2% above 2,000), so one lapsed household moves a region. Finance ops own the supplier settlement book: 28 statements and 27 settlement legs in INTEGER cents, where the dollar read is `amount_cents / 100.0` — the missing .0 is how a settlement quietly leaks half-pennies on every odd-cent line.",
    "Interview screens are census-then-denominator, grocery-flavored. A typical loop opens with a **two-grain regional read** — EU runs 45 baskets from just 8 members while the US runs 19 from 2 — then escalates into a rate where the interviewer asks the denominator out loud (*'does an abandoned basket count in your base?'*), then into a status census where the four branches must reconcile to 103 by construction. Late rounds walk the {sky:14-month trading spine} (2024-01 to 2025-02), band the range into value versus standard with `CASE`, or rank the Clubcard ladder where four members sit tied at 4 baskets and rank semantics become a business decision. Candidates who state the status filter and the denominator before writing SQL are the ones who get callbacks.",
    "Preparation strategy: the pools file carries no Tesco section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: basket-status censuses, two-grain store reads, aisle revenue folds, promo price-band `CASE` work, and the cents-safe settlement spine. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:basket-status census} regional ops opens the Monday trade meeting with, the other rebuilds the {amber:shelf-band promo audit} commercial runs before a price move. The bar to clear: *state the definition and the denominator before you compute anything* — then make every status census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:15 —** The day starts with the overnight online read. A network analyst opens the van dashboard before the trade meeting: did the overnight `shipped_at` stamps land, is any click+collect order aging past its promised slot, does the one-pass status census reconcile — 52 completed + 30 out for delivery + 14 awaiting pickup + 7 abandoned = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If dispatch latency drifts off the **2.98-day** norm — regional reads run EU 2.94, APAC 2.93, US 3.07 — the slot plan gets pulled before the morning read ships.",
    "**11:30 —** Midday is the commercial read. The price-promo pod wants the shelf-band audit refreshed — the range splits **8 value SKUs averaging 32.06** and **8 standard SKUs averaging 111.5**, ceiling 199.99 with the 200-plus band empty — and a category manager wants aisle revenue re-cut two ways: shelf price versus the price shoppers actually paid with {amber:Clubcard Prices} live. The Clubcard desk wants the ladder re-ranked with the four-way tie at 4 baskets handled honestly — shared rungs, named policy. Each ask is a join, a conditional aggregate and one judgment call about statuses; the analyst writes the query twice — *once to answer, once with the definition spelled out so the number survives the trade-meeting argument*.",
    "**15:45 —** The afternoon tilts toward the settlement book. The AR anti-join refreshes first — **6 never-settled statements worth 15,217** — before supplier services sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148 settled) and feeds the dunning draft; and the anomaly list gets walked line by line: a void-but-settled statement (#11, 925.00) and a paid-status statement with zero settlement legs (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Basket completion mix", what: "Completed baskets (store till take or online landed) ÷ all baskets: 52 of 103 (50.5%). The headline every Monday trade meeting opens with — a status-filtered conditional count with the denominator built in." },
    { name: "Online dispatch share", what: "Baskets out for delivery (status shipped) ÷ all: 30 of 103 (29.1%), with shipped_at as the van-dispatch stamp. The online-versus-store split that drives slot capacity and van fleet planning." },
    { name: "Click+collect queue", what: "Baskets awaiting pickup (status pending): 14 of 103 (13.6%). 'Not yet' is a population, never a silent zero — these rows have no van stamp and no completion yet." },
    { name: "Abandoned-basket share", what: "Abandoned baskets ÷ all, per region: EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0.0. The honest-denominator metric — numerator and denominator must fold over the same basket base." },
    { name: "Basket value & AOV", what: "Total basket value 34,833.28 across 103 baskets, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the mission story — the 1,088.44 trolley outweighs the 25.47 smallest basket 42 times over." },
    { name: "Van dispatch latency", what: "Created_at to shipped_at over dispatched baskets only: 82 stamped, 2.98-day average, range 2–4. The population ships with the number — awaiting and abandoned baskets have no latency yet." },
    { name: "Clubcard concentration", what: "Share of revenue from members whose lifetime spend crosses 3,000: 63.5% (71.2% above 2,000). The number that staffs the CRM pod and sizes the coupon budget — one lapsed household moves a region." },
    { name: "Supplier concentration", what: "Share of the 34,833.28 shelf book by FMCG supplier: the top bench carries 32% (Nordic, rated 4.6) and 26.7% (Midwest, rated 4.4). Supplier terms and settlement priority follow this ranking." },
  ],

  topics: [
    {
      name: "Basket-status conditional counting",
      why: "Every Tesco trade read starts from the same fold: completed, out for delivery, awaiting pickup, abandoned — one status column, four business meanings. Each branch is a conditional count, and the interviewer's first question is what the denominator holds. The trap is calling an out-for-delivery order 'completed' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "monthly-transactions-i", "percentage-of-users-attended-a-contest"],
    },
    {
      name: "Two-grain store reads",
      why: "Baskets and members are different grains of the same join, and every regional read reports both: EU runs 45 baskets from 8 members while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Shelf-to-basket joins",
      why: "Aisle reporting means attaching category, supplier and shelf price to every basket line — joins across the product and demand tables where the mapping is the point. Tesco's follow-up is always about survival: does a SKU missing its supplier row still count in the aisle fold, and which join type answers honestly?",
      slugs: ["product-sales-analysis-i", "combine-two-tables", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Aisle revenue folds",
      why: "Category revenue is the commercial heartbeat: fold basket lines by aisle, round to the penny, and rank. The audits here drill exactly the join-then-aggregate shape the Monday pack is built from — with the discipline that 251 lines fold into 103 baskets, not the other way round.",
      slugs: ["sales-analysis-i", "product-sales-analysis-ii", "students-and-examinations"],
    },
    {
      name: "One-pass FILTER censuses",
      why: "The ops board gets completed, dispatched, awaiting and abandoned in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift. This kit's first case study is exactly this census.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "CASE banding on the shelf",
      why: "The range is banded — value under 50, standard at 50-plus, the premium band provably empty — and every price-tier read is a CASE classification with fixed edges the pricing page publishes. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the promo forecast.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "the-winner-university"],
    },
    {
      name: "Ranking the Clubcard ladder",
      why: "Top members by basket count and lifetime spend is leaderboard reporting where ties are guaranteed — four members sit at 4 baskets on this db, and the ladder above them runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer households, not syntax.",
      slugs: ["rank-scores", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "NULL policy at the dispatch stamp",
      why: "A basket carries a NULL shipped_at until the van rolls — 82 of 103 do, and the 14 awaiting plus 7 abandoned never will. Tesco screens check whether you treat NULL as data to report, coalesce to zero for display, or exclude with a stated reason — deliberately, not by accident.",
      slugs: ["employee-bonus", "confirmation-rate", "books-with-null-ratings"],
    },
    {
      name: "Promo windows & date math",
      why: "Promo windows make date arithmetic a daily tool: units moved in a period, the last shop before a price change, baskets inside the Clubcard Prices window. Tesco probes half-open intervals — BETWEEN on timestamps loses the last night of the promo.",
      slugs: ["list-the-products-ordered-in-a-period", "the-latest-login-in-2020", "users-with-two-purchases-within-seven-days"],
    },
    {
      name: "Basket folds & shelf-label hygiene",
      why: "The daily basket read folds each day's lines into one comma-separated cell per trade date, and shelf-label feeds arrive messy: product names in mixed case, member names in ALL CAPS. String reshaping — GROUP_CONCAT folds, case normalization, SUBSTR extraction — is the warm-up round, because a join on a dirty key silently splits one SKU into two.",
      slugs: ["group-sold-products-by-the-date", "find-cities-in-each-state", "fix-names-in-a-table"],
    },
  ],

  theory: [
    {
      id: "tesco-t1",
      q: "Your aisle P&L joins basket lines to Clubcard members through the SKU table. When do you INNER and when do you LEFT — and what silently breaks if you filter a basket column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. An aisle-revenue report joins basket lines to products and members: a line with no product row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A 'members who registered but never scanned' report must be LEFT from members: the unmatched members ARE the answer, arriving with NULL basket columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload member row — the LEFT quietly became an INNER and the lapsed-member list vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-bought members — all 16 appear in the basket table somewhere — and proving that zero is itself the analyst's job. Join type is a decision about who survives, not a habit.",
      tag: "joins",
    },
    {
      id: "tesco-t2",
      q: "Four Clubcard members sit tied at 4 baskets on the frequency ladder. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose household gets the voucher budget. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer households (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment.",
      tag: "windows",
    },
    {
      id: "tesco-t3",
      q: "The regional read shows 103 baskets and 16 members; EU shows 45 baskets from 8 members. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts basket rows after the join — one row per basket, so a member with 24 baskets contributes 24. COUNT(DISTINCT customer_id) folds those rows back to members — EU's 45 baskets collapse to 8 households. Neither is wrong: baskets measure load on tills and vans, members measure installed base and reach. The ratio — 5.6 baskets per member in EU versus 9.5 in the US on this db — is the intensity signal that says US demand concentrates in two heavy households. The trap that catches candidates is a third grain: join order_items for basket lines and COUNT(*) silently counts lines, not baskets — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades.",
      tag: "aggregation",
    },
    {
      id: "tesco-t4",
      q: "shipped_at is NULL until a van is dispatched. What is your policy for the dispatch-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only dispatched baskets have a latency, so the report measures created_at to shipped_at for the 82 of 103 baskets that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL baskets returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the dispatched subset; the gap between it and COUNT(*) is exactly the 14 awaiting pickup plus 7 abandoned rows, which is a feature, not a bug. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day dispatches for click+collect orders that have not been picked. A report whose WHERE clause is doing definitional work without saying so is exactly what a Tesco reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "tesco-t5",
      q: "Ops wants abandoned-basket share per region, but only for regions carrying at least ten baskets. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'cancelled' discards completed, dispatched and awaiting rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-basket floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; putting it in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a regional map and an error, and between a threshold applied to baskets versus to pounds. The strong answer places every filter by asking: is this a fact about one basket, or about a region? On this db the floor keeps EU 45, APAC 37 and US 19 and drops LATAM's 2.",
      tag: "pipeline",
    },
    {
      id: "tesco-t6",
      q: "Which members beat the platform-average basket value? Walk me through the scalar subquery — what is it allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison — on this db the platform mean is 338.19 across 103 baskets — and zero rows return NULL, not an error, so total > NULL is UNKNOWN and the above-average list silently returns nothing while looking valid. On the full table that is theoretical; on filtered staging tables — one region, one status, one promo month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each basket to ITS member's average) re-runs per outer row and answers a different question at a different cost — habituals against their own norm, not the platform's. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "tesco-t7",
      q: "The trading calendar buckets baskets by month on TEXT timestamps. How do you build the spine, cut a promo window without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The promo window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's baskets, and promo-end is exactly when the online shop spikes. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. Date discipline is trading discipline: the spine, the window and the edge row are where trend reports go wrong.",
      tag: "dates",
    },
    {
      id: "tesco-t8",
      q: "Finance says a supplier settlement statement is 'paid' but the payments table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: invoices LEFT JOIN payments, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero settlement legs: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a settlement leg (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes. The money rule: invoices and payments carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats half-pennies on every odd-cent line. The close's identity: coverage must read 21 exact / 1 partial (4,000 of 6,148) / 6 never-settled, and the ledger trial balance must land at 181,080 against 181,080 — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "tesco-mcq-1",
      prompt: "A basket row's status reads 'shipped'. In this kit's Tesco stage map, what happened?",
      choices: ["Completed — the shop is done and counted", "Out for delivery — online order on the van, not yet landed", "Click+collect awaiting pickup", "Abandoned basket"],
      answer: 1,
      why: "The stage map is fixed: shipped = online order out for delivery — 30 of 103 baskets (29.1%) — with shipped_at as the van-dispatch stamp. The shop is NOT complete until it lands as 'delivered'.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 of 103 (50.5%). Counting the 30 van loads as completed inflates the till before a single order lands, and the completion mix stops tying to the 103-basket base." },
        { choice: 2, why: "Click+collect is 'pending' — 14 baskets awaiting pickup. Those orders never get a van stamp; confusing the two populations corrupts both the latency read and the slot plan." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-2",
      prompt: "The click+collect queue is which status, and how many baskets sit in it on this db?",
      choices: ["pending — 14 baskets (13.6%)", "shipped — 30 baskets (29.1%)", "cancelled — 7 baskets (6.8%)", "delivered — 52 baskets (50.5%)"],
      answer: 0,
      why: "Click+collect awaiting pickup maps to 'pending' — 14 of 103. These baskets exist, have value, and must stay in every denominator; they simply have no van stamp yet.",
      notes: [
        { choice: 1, why: "30 shipped baskets are on vans — the online-dispatch population. Reading the van fleet as the collect queue doubles the slot problem and empties the dispatch board." },
        { choice: 2, why: "7 cancelled baskets are abandoned demand — gone, not waiting. Treating abandons as a queue turns a demand-quality metric into a fake ops backlog." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-3",
      prompt: "EU runs 45 baskets from 8 members. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 0,
      why: "COUNT(*) counts basket rows (45); COUNT(DISTINCT customer_id) folds repeats back to members (8). The gap between them — 5.6 baskets per member — is the intensity read.",
      notes: [
        { choice: 1, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every basket has a member. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 2, why: "SUM(total)/COUNT(*) is AOV — a value metric, not a census. It answers 'how big is the trolley', not 'how many households'." },
      ],
      difficulty: "easy",
    },
    {
      id: "tesco-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to abandoned baskets only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the abandoned share truncates toward 0 and every region reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the abandoned map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-5",
      prompt: "Keep only regions carrying at least 10 baskets. Where does the threshold live?",
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
      id: "tesco-mcq-6",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The click+collect baskets double-counted their created day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the dispatched-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 baskets.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-7",
      prompt: "The Clubcard ladder runs 24, 17, 14, 13, 5 baskets, then FOUR members tied at 4. Under RANK, what rank do the two 3-basket members carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-basket members share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The published CRM policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "tesco-mcq-8",
      prompt: "A staging-table lapsed-member list uses member_id NOT IN (SELECT customer_id FROM baskets WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every basket carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty lapsed-member lists ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "tesco-mcq-9",
      prompt: "A board stack puts value-band SKUs under standard-band SKUs in one layout, built with UNION. A reviewer says one SKU's row vanished. Diagnosis?",
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
      id: "tesco-mcq-10",
      prompt: "A dashboard walks basket value transaction by transaction: SUM(total) OVER (ORDER BY created_at). Two baskets share a created_at second, and the cumulative 'jumps two baskets at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at basket grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-tesco-1",
      tier: "easy",
      topic: "x2",
      universe: "funnel",
      title: "The basket-status census",
      brief:
        "Tesco-flavored brief on the storefront db: Monday's trade meeting opens with the basket-status census — completed baskets, online orders out for delivery, click+collect awaiting pickup, abandoned — plus the abandoned share with the population stated on the slide. Probed facts: 103 baskets worth 34,833.28; the regional grid reads EU 45 = 24 completed + 12 online + 6 collect + 3 abandoned, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1 (the only region where van loads beat tills — 10 of 19 out for delivery), LATAM 2 = 2/0/0/0; abandoned share reads EU 6.7%, APAC 8.1%, US 5.3%, LATAM 0.0. The meeting reads biggest basket count first.",
      ask: "Return each region with its basket count, the four status branches and the abandoned share to 1 decimal, biggest basket count first.",
      template:
        "SELECT c.region AS region,\n       COUNT(*) AS baskets,\n       COUNT(*) FILTER (WHERE o.status = {1}) AS completed,\n       COUNT(*) FILTER (WHERE o.status = {2}) AS online_out,\n       COUNT(*) FILTER (WHERE o.status = {3}) AS collect_wait,\n       COUNT(*) FILTER (WHERE o.status = {4}) AS abandoned,\n       ROUND(100.0 * COUNT(*) FILTER (WHERE o.status = 'cancelled') / COUNT(*), {5}) AS abandon_pct\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY baskets {6};",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed-basket status",
          why: "Completed baskets are status 'delivered' — 52 of 103 (50.5%), till takes and landed online orders alike. 'shipped' would print the 30 van loads into the completed column and the census overstates the till before the meeting opens.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the van-dispatch status",
          why: "shipped = online order out for delivery, shipped_at as the van-dispatch stamp — 30 of 103 (29.1%). 'pending' would read the 14 click+collect baskets as van loads and the dispatch board empties while the collect queue doubles.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the click+collect status",
          why: "pending = click+collect awaiting pickup — 14 baskets (13.6%). 'delivered' here double-counts the completed column and breaks the reconciliation identity every branch must satisfy against COUNT(*).",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the abandoned-basket status",
          why: "cancelled = abandoned basket — 7 of 103 (6.8%), concentrated 3 in EU and 3 in APAC. 'shipped' would count van loads as abandons and the share reads 29.1% — a demand-quality crisis that does not exist.",
        },
        {
          answer: "1",
          kind: "number",
          label: "the share precision",
          why: "The abandoned share prints to 1 decimal — EU 6.7, APAC 8.1, US 5.3 — matching the regional table ops quotes. ROUND(…, 2) prints 6.67 and the census stops tying to the deck.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-basket-first direction",
          why: "The trade meeting reads biggest first: EU 45, APAC 37, US 19, LATAM 2. ASC opens the meeting on LATAM's 2 baskets — a correct query aimed at the wrong end of the board.",
        },
      ],
      distractors: ["SUM", "COUNT", "AVG", "ASC", "2"],
      walkthrough:
        "One scan, four FILTER branches, one share — the whole census in a single pass. The join attaches every basket to its member's region, GROUP BY folds four rows, and each FILTER (WHERE o.status = …) branch counts its own fate: EU reads 45 baskets = 24 completed + 12 online + 6 collect + 3 abandoned, APAC 37 = 21/8/5/3, US 19 = 5/10/3/1, LATAM 2 = 2/0/0/0 — every row reconciles to its basket count by construction, which is the identity the meeting checks first. The abandoned share folds 'cancelled' a second time as its own FILTER because a sibling column alias cannot be referenced mid-row: ROUND(100.0 * … / COUNT(*), 1) reads 6.7 / 8.1 / 5.3 / 0.0, straight from the probed regional table. The business beat is the US row: 10 of 19 baskets are out with the vans — the only online-majority region — while EU's 45 baskets run 24 from tills. The distractors fail honestly: SUM, COUNT and AVG in a status slot compare o.status to a function name and error; ASC reverses the read onto LATAM; 2 in the precision slot drifts the share to 6.67 and breaks the tie to the deck.",
    },
    {
      id: "cs-tesco-2",
      tier: "medium",
      topic: "t6",
      universe: "pricing",
      title: "The shelf-band promo audit",
      brief:
        "Tesco-flavored brief on the storefront db: the commercial team audits where each aisle's money sits before a price move — shelf price classifies the SKU into its band, basket lines price what shoppers actually paid once Clubcard Prices and promo variants are live, so band revenue can drift from shelf expectation and the share column is where the leak shows. Probed facts: the range splits 8 value SKUs under 50 (avg shelf 32.06) and 8 standard SKUs at 50-plus (avg 111.5), ceiling 199.99 with the 200-plus premium band empty; aisle revenue folds into the 34,833.28 basket book over 251 lines. The audit reads biggest revenue first.",
      ask: "Return each aisle x shelf band with its revenue and share of the aisle's revenue to 1 decimal, biggest revenue first.",
      template:
        "WITH band AS (\n  SELECT p.category AS aisle,\n         CASE WHEN p.price < {1} THEN {2} ELSE {3} END AS band,\n         ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM products p\n  JOIN order_items oi ON oi.product_id = p.id\n  GROUP BY p.category, band\n)\nSELECT aisle,\n       band,\n       revenue,\n       ROUND(100.0 * revenue / SUM(revenue) OVER (PARTITION BY {4}), 1) AS aisle_share\nFROM band\nORDER BY revenue {5};",
      slots: [
        {
          answer: "50",
          kind: "number",
          label: "the value-line price ceiling",
          noVerify: true,
          why: "The value band is shelf price under 50 — 8 SKUs averaging 32.06 per the range audit. A 100 ceiling re-bands the 89.99 keyboard into value and re-cuts every aisle share in the audit.",
        },
        {
          answer: "'value'",
          kind: "keyword",
          label: "the value-band label",
          why: "The under-50 arm is the value band — 8 SKUs, 32.06 average shelf price. Mislabeling it 'premium' does not change the fold but poisons every downstream join to the pricing calendar, which keys on the published band names.",
        },
        {
          answer: "'standard'",
          kind: "keyword",
          label: "the standard-band label",
          why: "The 50-plus arm is the standard band — 8 SKUs averaging 111.5. Both arms reading the same label merges two band rows per aisle and the fold loses the split the audit exists to see.",
        },
        {
          answer: "aisle",
          kind: "keyword",
          label: "the partition key",
          why: "The share is of the AISLE: SUM(revenue) OVER (PARTITION BY aisle). 'category' is out of scope past the CTE — the alias is aisle — and errors; a constant partitions the whole range and every share prints 100.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "biggest-revenue-first direction",
          why: "The audit reads biggest revenue first: Audio/standard 11,744.01 leads, Fitness/value 863.91 trails. ASC buries the two heavyweight rows under ten rows of detail.",
        },
      ],
      distractors: ["'premium'", "SUM", "ASC", "100", "category"],
      walkthrough:
        "Two stages: fold, then share. The CTE joins products to basket lines, bands each SKU at the 50 shelf ceiling, and folds 251 lines into ten aisle x band rows rounded to the penny; the outer SELECT adds SUM(revenue) OVER (PARTITION BY aisle) so each band carries its share of its own aisle. The probed read: Audio/standard 11,744.01 at 100 — Audio sells entirely in the standard band — and Accessories/value 3,294.29 at 100, its mirror image in value; Video splits 3,989.97 standard / 1,208.44 value (76.8 / 23.2), Electronics is the most balanced aisle at 2,558.26 / 2,260.35 (53.1 / 46.9), Apparel runs 1,384.15 / 600.78 (69.7 / 30.3), and Fitness/value 863.91 at 100. Mono-band aisles print 100 — a share, not a bug. Everything foots: the ten revenues sum back into the 34,833.28 basket book. Note the shelf-versus-paid drift is live here — bands classify by shelf price while lines price what was paid with Clubcard Prices on, which is exactly the promo leak the audit hunts. The distractors each break differently: 100 re-bands the range at the wrong ceiling and re-cuts every share; 'premium' relabels the value arm (breaking the pricing-calendar join) or, in the ELSE slot, merges nothing and relabels standard; SUM and ASC error in their slots; category is out of scope past the CTE and errors the partition.",
    },
  ],

  problems: [
    { slug: "basket-depth-aov", why: "Basket depth and AOV are the trolley read: lines per basket beside value per basket. This problem drills the two-metric fold Tesco's trade pack opens with — online baskets versus store tills included." },
    { slug: "repeat-purchase-rate", why: "Clubcard's whole promise is that the weekly shop comes back. Share of members with 2+ baskets in a window is the repeat rate the CRM pod reports weekly — a distinct-count ratio with the denominator stated." },
    { slug: "rfm-segmentation", why: "Recency-frequency-monetary segments decide who gets the next Clubcard coupon drop. NTILE quintiles over basket recency, frequency and value are exactly the segmentation query this kit's ladder topics build toward." },
    { slug: "returns-rate-by-category", why: "Waste and returns by aisle decide next season's buying. A per-aisle rate with the category denominator handled honestly is the same shape as the abandoned-share read." },
    { slug: "weeks-of-supply", why: "Shelf cover in weeks turns a stock table into a replenishment decision. Tesco's availability analysts run this fold daily across the range — stock divided by trailing demand, per SKU." },
    { slug: "customers-who-never-order", why: "Members who registered for Clubcard but never scanned is the lapsed-list question — the LEFT JOIN + IS NULL anti-join. On this db the honest answer is a confident zero, and proving it is part of the job." },
    { slug: "customer-placing-the-largest-number-of-orders", why: "The weekly-shop household: which member carries the most baskets. An argmax over a grouped count — the opening query of every Clubcard engagement review." },
    { slug: "immediate-food-delivery-ii", why: "Whoosh and online slots live or die on the promised-window share: orders delivered within the promised window versus late. A conditional rate over a timestamp comparison — the delivery-SLA query at grocery scale." },
    { slug: "monthly-transactions-ii", why: "The month-close tender stack: completed versus abandoned baskets per month, stacked into one layout. UNION ALL branches with a status rule each — the month-end pack's core move." },
    { slug: "average-selling-price", why: "Shelf price versus what shoppers actually paid once Clubcard Prices are live — the effective-price audit. A weighted per-SKU fold where the denominator (units) makes or breaks the number." },
    { slug: "sales-by-day-of-the-week", why: "The Friday/weekend shop is the grocery rhythm: a day-of-week pivot over basket dates. CASE columns per weekday over a grouped fold — exactly the traffic-shape query store ops runs weekly." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Habitual staples: the most-bought SKU per household. Per-member argmax over basket lines — the personalization query behind Clubcard coupon targeting." },
    { slug: "product-price-at-a-given-date", why: "Price as-of a date, when promos overwrite shelf prices: the latest price at or before the promo window. A window-argmax over price history — the promo-audit screens' favorite escalation." },
    { slug: "find-churn-risk-customers", why: "Members whose shopping cadence is slipping are the churn-risk list before the lapse happens. Recency-gapped member reads over basket timestamps — the CRM save-campaign query." },
    { slug: "bank-account-summary-ii", why: "The supplier settlement book in one query: statements beside settled amounts, cents-safe. INTEGER cents and the /100.0 rule make this exact practice for the settlement true-up." },
    { slug: "customer-who-visited-but-did-not-transact", why: "Footfall without a basket: store visits that never converted. The browse-versus-buy anti-join is the conversion question every format team asks after a promo weekend." },
  ],
};
