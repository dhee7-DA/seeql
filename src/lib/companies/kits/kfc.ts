// KFC — Wave-9 (Task 98), food domain, no tagged pool (0 rows) — theme-curated; facts from scripts/company-facts.md.
// Franchise-QSR SQL: the storefront db read as a fried-chicken franchise sandbox — customers are
// digital guests (app/web accounts; region = market), orders are guest orders (delivered =
// completed-and-settled 52, shipped = handed to kitchen/delivery partner with shipped_at as the
// fired-kitchen stamp 30, pending = in queue 14, cancelled = aborted 7), order_items are order lines
// (quantity = units, unit_price = menu price; buckets/meals à la carte), products are menu items
// (buckets/meals/sides), suppliers are the six franchisee & distribution partners (unit-level
// counterparties), invoices are the franchise royalty + ad-fund billing statements, payments are the
// tender rails / remittance legs (card vs wire), expenses are opex, ledger_entries the GL. Money
// tables are INTEGER cents — the dollar read is amount_cents / 100.0. Pool provenance:
// company-pools.md carries NO KFC section — fewer than 2 tagged rows and none SQL-graded — so all
// 10 topic slug sets and all 16 problems are theme-curated from the pools file's theme menu and say
// so. Case briefs quote probed figures from scripts/company-facts.md; every case slot is
// mechanically verified against db/custom.db by scripts/case-audit.ts.

import type { CompanyKit } from "../types";

export const kfcKit: CompanyKit = {
  id: "kfc",
  domainId: "food",
  name: "KFC",
  tagline: "Fried chicken at planetary scale: buckets, franchisees, digital orders",
  accent: "text-red-400",

  brief: [
    "**KFC** is the world's largest fried-chicken quick-service brand — the Yum! Brands flagship with roughly 30,000 restaurants across 150+ countries and one of the most heavily franchised systems in food (about 99% franchised). Demand arrives as the bucket: combo meals, family buckets and à-la-carte sides, priced in bands and sold through the app, web, in-store and delivery partners. This kit maps the storefront db onto that world: the 16 customers rows are digital guests (app/web accounts, region = market), the 103 orders are guest orders worth **34,833.28**, and the 251 order_items rows are order lines — quantity = units, unit_price = menu price. The status map is fixed: delivered = {emerald:completed-and-settled} (52, 50.5%), shipped = {sky:fired-to-kitchen-or-courier} (30, 29.1%), pending = in queue (14), cancelled = {rose:aborted} (7, 6.8%).",
    "The data org splits into digital analytics, franchise finance and a small menu-mix pod, and all three read the same spine at different grains. Digital analytics owns the order-fate funnel and the fire clock — `shipped_at` is the fired-kitchen stamp carried by 82 of 103 orders, averaging **2.98 days** on a 2–4 day spread. Franchise finance owns the royalty and ad-fund book: 28 statements billed against 27 remittance legs, where every dollar read is `amount_cents / 100.0`. The franchisee bench is concentrated — the top distribution partner carries **32%** of network revenue (11,130.25) and the top two 58.7% — and guest concentration is the growth dial: 63.5% of the book sits with guests whose lifetime spend crosses 3,000 (71.2% above 2,000), so *one lost super-fan moves a quarter*.",
    "Interview screens are census-then-denominator. A typical loop opens with a **two-grain market census** — EU runs 45 orders from just 8 guests (intensity 5.6) while the US runs 19 from 2 (9.5) — then escalates into a rate where the interviewer asks the denominator question out loud (*'do aborted orders belong in your kept rate?'*), then into the guest leaderboard where four guests sit tied at 4 orders and rank semantics become a business decision. Late rounds walk the {sky:14-month order spine} (2024-01 to 2025-02) with `LAG` deltas and probe the first row's NULL, or open the franchise ledger where the coverage census — 21 exact, 1 partial, 6 never-remitted — is one CASE away.",
    "Preparation strategy: the pools file carries no KFC section — fewer than 2 tagged rows, none SQL-graded — so all sixteen problems and every topic slug here are **theme-curated** to this kit's known screen shapes: digital order funnels, two-grain market censuses, tie-heavy guest leaderboards, bucket-band CASE folds and the cents-safe franchise ledger. Do the topics in order, then run both case studies on the live storefront db: one rebuilds the {emerald:market fate census} ops opens Monday with, the other rebuilds the {rose:never-remitted royalty list} franchise finance reads at every close. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
  ],

  dayInLife: [
    "**08:30 —** The day starts with the digital order-fate refresh. A digital analytics analyst opens the funnel dashboard before standup: did overnight app orders land, did any order get its `shipped_at` fire stamp without a courier assignment, does the one-pass fate census reconcile — 52 completed + 30 fired + 14 queued + 7 aborted = **103 by construction**? A branch that fails that identity is *the day's first incident*, not a rounding note. If the fire clock drifts off the **2.98-day** norm the kitchen queue gets pulled before marketing's weekly read ships, and the aborted map (APAC 8.1%, EU 6.7%, US 5.3%) goes straight to the delivery-partner call.",
    "**11:30 —** Midday is the concentration read. Franchise finance wants the partner bench re-cut — {rose:32% of network revenue} through one distribution partner is a negotiating position and a risk position at once; regional ops wants the two-grain census beside it (EU 45 orders from 8 guests, US 19 from 2); menu analytics asks whether core-band SKUs at **111.5 average** are pulling their weight against the 32.06 budget band. Each ask is a join, a conditional aggregate and one judgment call about statuses. The analyst writes the query twice — *once to answer, once with the denominator spelled out so the number survives the franchisee council argument*.",
    "**15:30 —** The afternoon tilts toward money. The AR anti-join refreshes first — **6 never-remitted royalty statements worth 15,217** — before finance sends a single reminder; the coverage split reads **21 exact, 1 partial** (4,000 of 6,148) and feeds the franchisee dunning draft; and the anomaly list gets walked line by line: a void-but-remitted statement (#11, 925.00) and a paid-claim statement with zero remittance rows (#28, 1,756.00). The day ends the way every close does: the ledger trial balance must read **181,080 against 181,080**, delta zero — {emerald:the close ships} or tomorrow starts with an incident.",
  ],

  metrics: [
    { name: "Digital order book", what: "Guest orders booked across app, web and delivery partners: 103 orders worth 34,833.28, average 338.19 against a 25.47 to 1,088.44 spread. The spread IS the banding story — one 1,088.44 family-bucket night outweighs the smallest order forty-fold." },
    { name: "Order kept rate", what: "Delivered ÷ ALL orders booked: 52 of 103 (50.5%). 'Kept' is a status-filtered conditional count, and the denominator — queued and in-kitchen orders included — is the whole interview." },
    { name: "Kitchen-fire latency", what: "Booking to kitchen-fire/courier handoff (created_at → shipped_at) over the 82 stamped orders: 2.98-day average, range 2–4. The population definition ships with the number — queued and aborted orders have no fire stamp and must not dilute it." },
    { name: "Aborted-order share", what: "Cancelled share of booked orders: 7 of 103 (6.8%), sliced by market — APAC 8.1%, EU 6.7%, US 5.3%. The aborted cohort map that drives the delivery-partner scorecards and the winback calendar." },
    { name: "Franchisee revenue concentration", what: "Share of network revenue by distribution partner: the top partner carries 11,130.25 (32%), the top two 58.7%. Concentration is a supply-risk dial, and it folds from order lines through the menu — a three-table chain with fan-out discipline." },
    { name: "Guest concentration", what: "Share of the book from guests spending 3,000-plus lifetime: 63.5% (71.2% above 2,000). The number that staffs CRM and sizes the app-loyalty pod — one lost super-fan moves a quarter." },
    { name: "Royalty coverage", what: "Billed versus remitted: 21 exact settlements (65,612), 1 partial (4,000 of 6,148), 6 never-remitted worth 15,217. The AR anti-join franchise finance refreshes every close." },
    { name: "Menu band mix", what: "SKU count and average price per band: budget (< 50) 8 SKUs @ 32.06, core (50–200) 8 @ 111.5, premium (>= 200) empty — max menu price 199.99. A 50/50 budget-core menu is the pricing story; a premium band that doesn't exist is the trap." },
  ],

  topics: [
    {
      name: "Digital order funnels",
      why: "Every KFC digital screen opens with the funnel: orders booked, fired (shipped_at stamped), completed. Each stage is a conditional count over a status or timestamp, and the interviewer's first question is what the denominator holds. The trap is calling a fired order 'completed' — 30 versus 52 on this db.",
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "funnel-step-conversion"],
    },
    {
      name: "Two-grain market censuses",
      why: "Orders and guests are different grains of the same join, and every census here reports both: EU runs 45 orders from 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers"],
    },
    {
      name: "Joining guests to orders",
      why: "Guests carry market and signup; orders inherit them through joins, and the join type decides who survives. An order without a guest is corruption; a guest without orders is a dormant app account — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Guest leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four guests sit at 4 orders each on this db, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries"],
    },
    {
      name: "Bucket-band menus with CASE",
      why: "The menu is engineered in bands — budget sides, core buckets, premium drops — and the band fold is a CASE histogram: budget 8 SKUs at 32.06 average, core 8 at 111.5, premium empty at max price 199.99. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the mix forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "spend-histogram"],
    },
    {
      name: "Month walks & LAG momentum",
      why: "The 14-month order spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero to coalesce away.",
      slugs: ["restaurant-growth", "monthly-transactions-i", "biggest-window-between-events"],
    },
    {
      name: "Franchisee settlement coverage",
      why: "Billed is not remitted — the franchise ledger (28 statements, 27 remittance legs, INTEGER cents) is where the store world meets money. The exact/partial/none coverage split (21 / 1 / 6) is one LEFT JOIN and one CASE away, and the anti-join's 6 never-remitted statements worth 15,217 feed the dunning calendar.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "count-student-number-in-departments"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-guest order counts, then judge them against a computed platform mean (6.44 here — exactly four guests clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, fired, queued and aborted in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii"],
    },
    {
      name: "Cents-safe billing discipline",
      why: "Royalty statements and remittances carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Tender-rail folds (card 16 legs / 37,364 versus wire 11 / 32,248) are the daily reconciliation reads.",
      slugs: ["monthly-transactions-ii", "products-worth-over-invoices", "bank-account-summary-ii"],
    },
  ],

  theory: [
    {
      id: "kfc-t1",
      q: "Your market report joins guests to orders. When do you INNER and when do you LEFT — and what silently breaks if you filter an order column in WHERE after a LEFT JOIN?",
      a: "Decide from the survival rule the question implies. A revenue report joins orders to guests: an order with no guest row is corruption, so INNER is honest — and worth a data-quality flag rather than a silent inner join. A dormant-account report must be LEFT from guests: the guests with no orders ARE the answer, arriving with NULL order columns. The classic break: filtering status = 'delivered' in WHERE after the LEFT JOIN kills every NULL-payload guest row — the LEFT quietly became an INNER and the dormant accounts vanished. The fix is moving the predicate into ON or an outer query. On this db the anti-join returns a confident zero never-ordering guests — all 16 app accounts have ordered somewhere — and proving that zero is itself the analyst's job, because an app-signup wave with zero conversion would look identical to a bug until you run the query and state the denominator.",
      tag: "joins",
    },
    {
      id: "kfc-t2",
      q: "Four guests tie at 4 orders each on the frequency leaderboard. RANK, DENSE_RANK or ROW_NUMBER — and who decides?",
      a: "The rank trio is a business decision about shared rungs and gaps, and the interviewer wants you to say that out loud. RANK gives tied counts the same rank and skips — on this db the ladder is 24, 17, 14, 13, 5, then the four-way tie at 4 consuming ranks 6 through 9, and the next distinct count (3) lands on 10, implying five phantom positions that do not exist. DENSE_RANK shares rungs without gaps — the tie reads 6, 6, 6, 6 and the next distinct count is 7. ROW_NUMBER splits ties arbitrarily, which is a silent judgment call about whose account gets the app-loyalty offer first. The wrong answer is picking a function; the right answer is picking a policy — shared rungs for peer guests (RANK or DENSE_RANK), or an explicitly named tie-breaker like created_at, then id — and writing it in the query comment so the CRM export reproduces.",
      tag: "windows",
    },
    {
      id: "kfc-t3",
      q: "The census shows 103 orders and 16 guests; EU shows 45 orders and 8 guests. Why do the two columns disagree, and what does each mean to the business?",
      a: "They disagree because they count at different grains. COUNT(*) counts order rows after the join — one row per order, so a guest with 24 orders contributes 24. COUNT(DISTINCT customer_id) folds those rows back to guests — EU's 45 orders collapse to 8 accounts. Neither is wrong: orders measure load and app momentum, guests measure installed base and coverage. The ratio — 5.6 orders per guest in EU versus 9.5 in the US on this db — is the intensity signal that decides whether digital growth is broadening or concentrating. The trap that catches candidates is a third grain: join order_items for order lines and COUNT(*) silently counts lines, not orders — 251 of them. Saying 'one row per what?' for every COUNT is the habit the panel grades, because every KFC board mixes order load, guest coverage and basket depth on the same slide.",
      tag: "aggregation",
    },
    {
      id: "kfc-t4",
      q: "shipped_at is NULL until the kitchen fires or the courier takes the bag. What is your policy for the fire-latency report, and how do NULLs behave in the aggregates it uses?",
      a: "Policy first: only fired orders have a latency, so the report measures booking-to-fire for the 82 of 103 orders that carry the stamp — averaging 2.98 days, range 2 to 4 — and says so in the title. Then mechanics: AVG ignores NULLs, so AVG over ALL orders returns the fired-only average over a silently shrunken population — a real number wearing the wrong name. COUNT(shipped_at) counts the fired subset; the gap between it and COUNT(*) is exactly the 14 queued plus 7 aborted rows, which is a feature, not a bug — it is the still-in-flight population the ops room watches. What is never acceptable is IFNULL-ing the latency to zero to 'fix' the average — that invents same-day fires for orders that have not entered the kitchen. A report whose WHERE clause is doing definitional work without saying so is exactly what a KFC reviewer hunts for.",
      tag: "nulls",
    },
    {
      id: "kfc-t5",
      q: "The ops review wants completed order value per market for markets carrying at least ten orders. Where does each filter live, and why does the wrong clause either error or lie?",
      a: "Two filters, two clauses. The status rule is a row-level fact — status = 'delivered' discards fired, queued and aborted rows before any fold, in WHERE; putting it in HAVING is impossible because statuses no longer exist once rows are grouped. The ten-order floor is a group-level fact — HAVING COUNT(*) >= 10 after GROUP BY; on this db EU (45), APAC (37) and the US (19) clear it while LATAM's 2 orders drop. Putting the floor in WHERE errors because COUNT does not exist before groups form. The pipeline order — FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY — is not trivia here; it is the difference between a forecast line and an error, and between a threshold applied to orders versus to dollars. The strong answer places every filter by asking: is this a fact about one order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "kfc-t6",
      q: "WHERE total > (SELECT AVG(total) FROM orders) — what is that scalar subquery allowed to return, and what happens when the inner fold comes back empty?",
      a: "A scalar subquery is contractually 0-or-1 rows, 1 column. One row drives the comparison; zero rows return NULL — not an error — and total > NULL is UNKNOWN, so the above-average report silently returns nothing while looking valid. On the full table that is theoretical: 103 orders always produce a mean (338.19 on this db, the number every ticket-band conversation starts from). On filtered staging tables — one market, one status, one month — the empty-inner-query bug ships regularly, and the above-average filter is how it hides. The correlated cousin (compare each order to ITS guest's average) re-runs per outer row and answers a different question at a different cost — basket context, not platform context. The strong candidate states the inner fold's population and its empty-case behavior unprompted, because that is the follow-up the panel is fishing for.",
      tag: "subqueries",
    },
    {
      id: "kfc-t7",
      q: "The order trend buckets bookings by month on TEXT timestamps. How do you build the spine, cut a quarter without losing its last night, and read the first row of the LAG?",
      a: "Three moves. The spine: STRFTIME('%Y-%m', created_at) — year plus zero-padded month, 14 buckets on this db from 2024-01 to 2025-02; '%m' alone would merge January 2024 with January 2025 and the trend becomes fiction. The quarter window: half-open intervals — created_at >= '2024-01-01' AND created_at < '2024-04-01' — because BETWEEN '2024-03-01' AND '2024-03-31' silently drops the last night's orders, and quarter-end is exactly when franchise promos spike bookings. The LAG: on a month-ordered spine the first row's prior value is NULL, so the first movement is NULL by definition — report it as NULL or label it 'baseline', never coalesce it to zero, which reads as a flat month. On this spine that matters: the book opens at 3,731.97, troughs at 1,193.86 in July, and the deltas tell the year's story — the NULL edge row is where the walk starts, not a data gap.",
      tag: "dates",
    },
    {
      id: "kfc-t8",
      q: "Finance says a royalty statement is 'paid' but the remittances table has no rows for it. Walk me through the reconciliation query you write first — and the money rule you never break while writing it.",
      a: "First the anti-join: statements LEFT JOIN remittances, keep p.id IS NULL — on this db that returns 6 statements worth 15,217, and one of them (#28, 1,756.00) is marked 'paid' with zero remittance rows: a status that lies, which is why payment rows are the ledger of record and the status column is a claim. Then the anomaly flip: a void statement WITH a remittance row (this db has one, #11 at 925.00) never appears in that anti-join — the two error modes are mirrors, and both reconcile to the row-level anomaly list, not to vibes; meanwhile #25 (open, 6,148) carries a 4,000 partial remittance, which is why the coverage census reads 21 exact / 1 partial / 6 never-remitted. The money rule: statements and remittances carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Reconciliation culture here: the ledger trial balance must land at 181,080 debits against 181,080 credits — delta zero, or the close does not ship.",
      tag: "quality",
    },
  ],

  mcqs: [
    {
      id: "kfc-mcq-1",
      prompt: "A guest order's status reads 'shipped'. In this kit's KFC stage map, what happened?",
      choices: ["Completed and settled — counts as kept", "Fired to kitchen or handed to a courier — in flight, not yet settled", "Aborted before the kitchen fired it", "Sitting in the order queue, no fire stamp yet"],
      answer: 1,
      why: "The stage map is fixed: shipped = fired-to-kitchen-or-courier (30 of 103 orders, 29.1%). The bag has left the pass but the order has not completed.",
      notes: [
        { choice: 0, why: "Completed is 'delivered' — 52 orders. Calling fired orders completed inflates the kept rate before a single bag lands." },
        { choice: 2, why: "Aborted is 'cancelled' — 7 orders that never fired. Shipped orders are past the fire point; the two never overlap." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-2",
      prompt: "Order kept rate is delivered ÷ which population? The db holds 52 delivered, 30 shipped, 14 pending and 7 cancelled of 103 booked.",
      choices: ["Delivered + shipped only (52/82 = 63.4%)", "All orders booked (52/103 = 50.5%)", "Delivered + cancelled only (52/59)", "Distinct guests (52/16)"],
      answer: 1,
      why: "The house definition: kept ÷ ALL orders booked — queued and in-kitchen orders stay in the denominator because 'not yet completed' is exactly what the funnel watches. 50.5% is the honest read.",
      notes: [
        { choice: 0, why: "Dropping the 14 queued and 7 aborted inflates the rate to 63.4% by deleting the rows the funnel exists to watch — denominator engineering, not analysis." },
        { choice: 3, why: "52/16 mixes grains — orders over guests. The kept rate is a per-order rate; per-guest rates are a different metric with a different name." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-3",
      prompt: "EU carries 45 orders from 8 guests. Which column pair reports both grains in one row?",
      choices: ["COUNT(*) and COUNT(customer_id)", "SUM(total) and COUNT(*)", "COUNT(*) and COUNT(DISTINCT customer_id)", "COUNT(DISTINCT region) and COUNT(*)"],
      answer: 2,
      why: "COUNT(*) counts order rows (45); COUNT(DISTINCT customer_id) folds repeats back to guests (8). The gap between them — 5.6 orders per guest — is the intensity read.",
      notes: [
        { choice: 0, why: "COUNT(customer_id) counts non-NULL FKs — 45 again, since every order has a guest. Without DISTINCT both columns read 45 and the coverage story disappears." },
        { choice: 3, why: "COUNT(DISTINCT region) counts territories, not guests — a third grain nobody asked for. The census is orders AND accounts." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-4",
      prompt: "100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*) — why does the 100.0 sit BEFORE the division?",
      choices: ["It rounds the result to a percentage", "It promotes the division to real arithmetic before integer truncation", "It filters to cancelled orders only", "It is cosmetic — moving it after the division changes nothing"],
      answer: 1,
      why: "Without it, SUM of 0/1 flags over COUNT is integer division — the aborted share truncates toward 0 and every market reads flat. The 100.0 multiplier forces real division first; on this db it is the difference between 6.8 and a displayed 6.",
      notes: [
        { choice: 0, why: "ROUND is the rounding step and happens AFTER the damage if the division already truncated. The multiplier is about arithmetic type, not presentation." },
        { choice: 3, why: "Moving it changes everything: (SUM/COUNT)*100 truncates 0.068 to 0 first, then scales — the aborted map reads zero everywhere." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-5",
      prompt: "Keep only markets carrying at least 10 guest orders. Where does the threshold live?",
      choices: ["WHERE COUNT(*) >= 10, before GROUP BY", "GROUP BY market HAVING COUNT(*) >= 10", "WHERE orders >= 10 on the raw table", "HAVING before GROUP BY, wherever it fits"],
      answer: 1,
      why: "An order-count floor is a group-level fact: groups must exist before they can be judged, so HAVING follows GROUP BY. On this db EU (45), APAC (37) and the US (19) clear the bar; LATAM's 2 orders drop.",
      notes: [
        { choice: 0, why: "COUNT(*) does not exist at WHERE time — no groups have formed. The engine's rejection is the pipeline-order lesson itself." },
        { choice: 2, why: "There is no 'orders' column on the raw table — the count only materializes at the fold. Same error, different disguise." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-6",
      prompt: "The frequency ladder runs 24, 17, 14, 13, 5 orders, then FOUR guests tied at 4. Under RANK, what rank do the two 3-order guests carry?",
      choices: ["10", "7", "9", "6"],
      answer: 0,
      why: "RANK shares rungs and then skips: 1, 2, 3, 4, 5, then the four-way tie consumes ranks 6 through 9, so the next distinct count lands on 10. Both 3-order guests share rank 10.",
      notes: [
        { choice: 1, why: "7 is the DENSE_RANK answer — shared rungs without gaps. The board's published policy is RANK semantics, gaps included." },
        { choice: 2, why: "9 is the LAST rank the tie block occupies, not the next one handed out. Off-by-one on the tie block is the classic leaderboard bug." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-7",
      prompt: "AVG(julianday(shipped_at) - julianday(created_at)) run WITHOUT the WHERE clause still prints 2.98 days. What actually happened?",
      choices: ["AVG silently skipped the 21 NULL-latency rows — same number, 82-row population, unnamed", "NULLs were counted as zero days and dragged the average down", "SQLite errored on the NULL arithmetic and returned the last good value", "The queued orders double-counted their booking day"],
      answer: 0,
      why: "AVG ignores NULLs, so the no-WHERE version returns the fired-only average over a silently shrunken population — a real number wearing the wrong name. The fix is stating the filter: WHERE shipped_at IS NOT NULL, 82 of 103 orders.",
      notes: [
        { choice: 1, why: "NULLs are not zeros — counted as 0 days the average would read 2.98 × 82/103 ≈ 2.37, not 2.98. The two numbers matching is exactly the trap." },
        { choice: 2, why: "No error anywhere — that is the point. Silent population shrink is the failure mode, not a crash." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-8",
      prompt: "A staging-table dormant-guest list uses guest_id NOT IN (SELECT customer_id FROM orders WHERE status = 'cancelled') and returns ZERO rows. First suspicion?",
      choices: ["The two tables genuinely share no ids — the zero is correct", "One NULL customer_id in the subquery poisons every NOT IN comparison — the whole result silently empties", "NOT IN cannot take a subquery; it needs a literal list", "The outer query needs DISTINCT before the comparison works"],
      answer: 1,
      why: "NOT IN compares every outer row against a materialized list, and x NOT IN (…) is UNKNOWN the moment a NULL enters the comparison — one NULL in the subquery makes every row UNKNOWN and the report empties while looking valid. Policy: EXISTS for existence tests, and never NOT IN over a column that has not been NULL-guarded.",
      notes: [
        { choice: 0, why: "A confident zero is sometimes right — on the clean core db every order carries a customer_id. But staging tables are exactly where NULLs sneak in, and empty reports ship from there." },
        { choice: 2, why: "NOT IN takes subqueries fine. The failure is not syntax, it is three-valued logic." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-9",
      prompt: "A board stack puts the completed-fate census under the aborted-fate census in one layout, built with UNION. A reviewer says one market's row vanished. Diagnosis?",
      choices: ["UNION ALL is only a performance choice — the results would be identical", "The branches forgot the distinguishing column, so two identical rows (same market, same counts) collapsed — UNION dedups whole rows silently", "UNION truncates the stack to the first branch's row count", "UNION cannot stack two SELECTs over the same table"],
      answer: 1,
      why: "UNION dedups whole rows across branches. Two branches that emit byte-identical rows — same market, same counts, no fate label — collapse into one, and the board loses a market with no error anywhere. The discipline: UNION ALL plus a comment stating WHY duplicates are impossible; the comment is the correctness argument.",
      notes: [
        { choice: 0, why: "The dedup is not free decoration — it deletes rows. On stacks where a legitimate total or a repeated count exists, UNION is the bug." },
        { choice: 2, why: "UNION never truncates by count. It collapses only exact duplicate rows — which is worse, because nothing announces the loss." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-10",
      prompt: "A dashboard walks booked order value order by order: SUM(total) OVER (ORDER BY created_at). Two orders share a created_at second, and the cumulative 'jumps two orders at once'. What is happening?",
      choices: ["The default frame is RANGE — tied rows enter the running sum together; write ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW for a strict row-by-row walk", "Rounding accumulated on the tied rows and doubled the step", "LAG should be used instead of SUM for running totals", "The frame must extend to UNBOUNDED FOLLOWING to absorb ties"],
      answer: 0,
      why: "With ORDER BY, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — and RANGE includes peers, so rows tied on created_at join the cumulative in one step. The fix is saying the frame out loud: ROWS walks strictly row by row. On a month spine ties are rare; at order grain they are guaranteed.",
      notes: [
        { choice: 2, why: "LAG gives the previous row's value, not the running sum — swapping functions changes the metric, not the frame semantics." },
        { choice: 3, why: "UNBOUNDED FOLLOWING widens the frame to the whole partition — every row would print the grand total, which is a different report, not a fix." },
      ],
      difficulty: "hard",
    },
  ],

  cases: [
    {
      id: "cs-kfc-1",
      tier: "easy",
      topic: "s6",
      universe: "funnel",
      title: "The market order-fate census",
      brief:
        "KFC-flavored brief on the storefront db: Monday's digital ops review opens with the market order-fate census — per market, how many guest orders completed, how many are fired to kitchen or courier, how many sit in queue, how many aborted, with the average ticket beside the counts. Definition is fixed: the four fates are the four status values, one SUM(CASE) arm each, and the arms must reconcile to the 103-order book worth 34,833.28 by construction. Probed facts: the fate split runs 52 completed / 30 fired / 14 queued / 7 aborted; the market grid reads EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0; market tickets run EU 335.32, APAC 313.66, US 383.48, LATAM 426.22. The review reads the biggest completed column first.",
      ask: "Return each market with completed, fired-to-kitchen, in-queue and aborted order counts plus average ticket to 2 decimals, biggest completed count first.",
      template:
        "SELECT c.region AS market,\n       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS completed,\n       SUM(CASE WHEN o.status = {2} THEN 1 ELSE 0 END) AS fired_kitchen,\n       SUM(CASE WHEN o.status = {3} THEN 1 ELSE 0 END) AS in_queue,\n       SUM(CASE WHEN o.status = {4} THEN 1 ELSE 0 END) AS aborted,\n       ROUND(AVG(o.total), {5}) AS avg_ticket\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY completed DESC;",
      slots: [
        {
          answer: "'delivered'",
          kind: "keyword",
          label: "the completed fate",
          why: "Completed-and-settled orders are status 'delivered' — 52 on the db, led by EU's 24. 'completed' is not a status value on this db: the arm zero-fills and the census reconciles to nothing.",
        },
        {
          answer: "'shipped'",
          kind: "keyword",
          label: "the fired fate",
          why: "Fired-to-kitchen-or-courier is 'shipped' — 30 orders carrying the shipped_at stamp, US-heavy at 10. 'delivered' here would double-book the completed arm and the fate identity 52+30+14+7 breaks.",
        },
        {
          answer: "'pending'",
          kind: "keyword",
          label: "the queue fate",
          why: "In-queue orders are 'pending' — 14 with no fire stamp yet. Calling them fired inflates kitchen load before a single bag is handed over; calling them aborted deletes live demand from the funnel.",
        },
        {
          answer: "'cancelled'",
          kind: "keyword",
          label: "the aborted fate",
          why: "Aborted orders are 'cancelled' — 7, concentrated APAC 3 / EU 3 / US 1. 'refunded' invents a fate the ops map doesn't carry and the aborted column reads zero while real aborts go uncounted.",
        },
        {
          answer: "2",
          kind: "number",
          label: "the ticket precision",
          why: "Market tickets report to 2 decimals — EU 335.32, APAC 313.66. ROUND(…, 1) prints 335.3 and the market board stops reconciling with the 338.19 platform average digital analytics quotes on the same slide.",
        },
      ],
      distractors: ["MAX", "COUNT", "0", "'refunded'", "ASC"],
      walkthrough:
        "One join, one fold, five columns at two grains. The join attaches every guest order to its market, GROUP BY region folds 103 orders into four rows, and the four SUM(CASE) arms read completed / fired / queued / aborted straight from the probed grid — EU 24/12/6/3, APAC 21/8/5/3, US 5/10/3/1, LATAM 2/0/0/0 — reconciling upward to the fate split of 52 + 30 + 14 + 7 = 103 by construction. ROUND(AVG(o.total), 2) reads the market ticket beside the counts: 335.32 / 313.66 / 383.48 / 426.22. The distractors fail honestly: MAX or COUNT inside the CASE comparison errors the fold outright; 0 never matches a text status so every arm silently reads zero; 'refunded' invents a fate the ops map doesn't carry and zero-fills the board; 1 in the precision slot truncates the ticket off the 335.32 cells; ASC in the sort opens the review on LATAM's 2 orders instead of EU's 24. The read: US demand is fire-heavy — 10 of its 19 orders still in kitchen or courier hands against EU's 12 of 45 — while LATAM's single guest has nothing in flight at all.",
    },
    {
      id: "cs-kfc-2",
      tier: "medium",
      topic: "j4",
      universe: "month-close",
      title: "The paid claim that never settled",
      brief:
        "KFC-flavored brief on the storefront db: month-end close at franchise finance — 28 royalty and ad-fund statements billed to franchisees and distribution partners, settled through 27 remittance legs across two tender rails (card 16 legs / 37,364; wire 11 / 32,248). The close opens with the never-remitted list: statements carrying zero remittance rows, the probed anti-join of **6 statements worth 15,217** — and one of them, #28, claims status 'paid' at 1,756.00 with no remittance behind it, which is why the payments table is the ledger of record and the status column is a claim. The close wants the never-remitted book grouped by claimed status — statement count and billed dollars, cents read as amount_cents / 100.0 — biggest dollars first.",
      ask: "Group the never-remitted statements by claimed status with a statement count and billed dollars to 2 decimals, biggest dollars first.",
      template:
        "SELECT i.status AS claimed_status,\n       {1}(*) AS statements,\n       ROUND(SUM(i.amount_cents) / {2}, 2) AS billed_usd\nFROM invoices i\n{3} JOIN payments p ON p.invoice_id = i.id\nWHERE p.id IS {4}\nGROUP BY i.status\nORDER BY billed_usd {5};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the statement counter",
          why: "The close counts statements, not remittance legs: COUNT(*) reads one per unmatched statement row. SUM(*) and AVG(*) are not valid SQLite — the fold errors — and any column name here counts legs, which double-counts the split-payment statements.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the cents divider",
          noVerify: true,
          why: "Statements bill in INTEGER cents: #28's 175,600 cents prints as 1,756.00 only through amount_cents / 100.0. A 10 divider inflates the column a hundred-fold; dropping the divider entirely is the classic 100x incident on every statement row.",
        },
        {
          answer: "LEFT",
          kind: "keyword",
          label: "the survival join",
          why: "The anti-join needs the unmatched statement rows to survive: LEFT keeps all 28 statements and lets the IS NULL guard do the filtering. INNER evaporates the six never-remitted statements — the exact rows the case exists to find.",
        },
        {
          answer: "NULL",
          kind: "keyword",
          label: "the zero-remittance guard",
          why: "p.id IS NULL keeps statements with no remittance leg. IS NOT NULL flips to the has-remittances side, where COUNT(*) counts joined (statement, remittance) pairs and the split-payment statements double-count.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-dollars-first sort",
          why: "The close reads biggest dollars on top — the open cohort leads and the paid lie lands second. ASC re-sorts the close to open on the 1,756.00 anomaly and bury the cohort finance is actively dunning.",
        },
      ],
      distractors: ["SUM", "AVG", "10", "INNER", "NOT", "ASC"],
      walkthrough:
        "Stage one is survival: the LEFT JOIN keeps every one of the 28 statements and the IS NULL guard keeps only those with zero remittance legs — the probed anti-join of **6 statements worth 15,217**. Stage two is the fold: GROUP BY claimed status splits them into the open cohort and the paid row — and the paid row is exactly the #28 anomaly, one statement claiming {rose:paid} at **1,756.00** with zero remittance rows, which is why the payments table is the ledger of record and the status column is a claim. The statements that drop out matter too: #25 (open, 6,148) carries a 4,000 partial remittance, and #11 (void, 925.00) was remitted despite being void — the mirror-image error the coverage census (21 exact / 1 partial / 6 none) catches and the status column never will. The distractors fail honestly: SUM or AVG as the counter error the fold outright; 10 as the cents divider inflates the billed column a hundred-fold against the /100.0 rule; INNER evaporates the six statements the case exists to find; NOT breaks the IS guard into a syntax error; ASC re-sorts the close so the paid lie headlines the review.",
    },
  ],

  problems: [
    { slug: "percentage-of-users-attended-a-contest", why: "Share of digital guests who hit the first-order milestone out of all signups — a distinct-count share with the denominator stated, the app-funnel's weekly pulse." },
    { slug: "customer-order-frequency", why: "HAVING gates on repeat frequency — which guests ordered in enough periods to join the app-loyalty cohort. Frequency gates are how the CRM calendar is actually built here." },
    { slug: "most-frequently-ordered-product-per-customer", why: "Per-guest argmax: the default bucket each guest reorders. Ties on the argmax are the follow-up, because 'their usual' must resolve to one menu item." },
    { slug: "average-selling-price", why: "Weighted menu price per window — bucket-versus-side mix shifts the average even when prices never change. The weighting choice is the whole read on the 32.06-versus-111.5 band story." },
    { slug: "product-price-at-a-given-date", why: "As-of promo pricing: which menu price was in force when the order landed. Promo calendars make menu pricing a point-in-time question, and this problem drills the as-of fold." },
    { slug: "trips-and-users", why: "Delivery-partner cancellations versus guest aborts in one join — the delivery SLA read where the denominator (partner-trips, not all orders) is the entire test." },
    { slug: "top-travellers", why: "The guest spend leaderboard with zero-order guests surviving the LEFT JOIN at zero — the leaderboard shape franchise finance and CRM both run, one grain apart." },
    { slug: "confirmation-rate", why: "Delivery confirmation rate per guest — a ratio whose zeros matter. Guests with no deliveries yet must read 0.00, not vanish, and this problem drills exactly that guard." },
    { slug: "second-highest-salary", why: "Second-priciest menu item — and the honest NULL when the band has no runner-up. Band-edge questions on the bucket menu always end at this shape." },
    { slug: "fix-product-name-format", why: "Menu item name hygiene before any join: exports arrive title-case-broken, and 'kfc bucket' versus 'KFC Bucket' silently splits one SKU into two on the mix board." },
    { slug: "group-sold-products-by-the-date", why: "The kitchen prep sheet: menu items sold per day folded into one comma-joined cell. GROUP_CONCAT over the order-line fold is the daily read the store managers actually print." },
    { slug: "duplicate-charge-pairs", why: "Duplicate tender captures on the remittance rails — the reconciliation first responder. Pairing logic over (statement, amount) is how finance catches double-charged royalty legs." },
    { slug: "find-loyal-customers", why: "Repeat guests — the frequency cohort the app push calendar targets. 'Loyal' needs a definition and a stated window, which is the interview, not the query." },
    { slug: "basket-depth-aov", why: "Basket depth and AOV — lines per order and the attach story. 251 lines over 103 orders is the db's basket-depth read, and this problem drills the two-grain fold behind it." },
    { slug: "repeat-purchase-rate", why: "Repeat rate with the denominator stated — the loyalty read that decides whether app growth is broadening or concentrating. Denominator discipline is the whole metric." },
    { slug: "queries-quality-and-percentage", why: "Rating percentages per franchisee partner — the quality bench read. Percentage-of-total folds over ratings are how the partner scorecards are built each cycle." },
  ],
};
