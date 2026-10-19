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
    "Preparation strategy: the pools file carries no KFC section — fewer than 2 tagged rows, none SQL-graded — so all thirty-two problems and every topic slug here are **theme-curated** to this kit's known screen shapes: digital order funnels, two-grain market censuses, tie-heavy guest leaderboards, bucket-band CASE folds and the cents-safe franchise ledger. Do the topics in order, then run all six case studies on the live storefront db: they rebuild the reads KFC teams make most — the {emerald:market fate census} ops opens Monday with, the {rose:never-remitted royalty list} franchise finance reads at every close, the super-fan revenue base, the tender-rail stack, the guest leaderboard tiers, and the booked-value month pulse. The bar to clear: *state the definition and the denominator before you compute anything* — then make every fate census reconcile to 103 by construction.",
    "This expanded kit is built for spaced practice rather than one sitting. **Six case studies** now span the asks KFC interviewers rehearse most: the market fate census, the never-remitted royalty list, the super-fan revenue share, the tender-rail grand-total stack, the no-gap guest leaderboard, and the LAG-driven month pulse ending at the 1,193.86 July trough. Run each on the live storefront database, then re-run it a week later from a blank editor — *the second pass is where recall actually forms*. Pair the cases with the **32-problem pool** and the theory bank below, and treat the walkthroughs as the real content: they narrate the failure each wrong chip causes, which is exactly the muscle the denominator follow-up tests.",
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
      slugs: ["immediate-food-delivery-i", "immediate-food-delivery-ii", "funnel-step-conversion", "most-frequently-ordered-product-per-customer"],
    },
    {
      name: "Two-grain market censuses",
      why: "Orders and guests are different grains of the same join, and every census here reports both: EU runs 45 orders from 8 guests while the US runs 19 from 2. COUNT(*) beside COUNT(DISTINCT customer_id) — and saying out loud which is load and which is coverage — is the habit being graded.",
      slugs: ["unique-orders-and-customers-per-month", "daily-leads-and-partners", "number-of-rich-customers", "customer-order-frequency", "trips-and-users", "find-loyal-customers"],
    },
    {
      name: "Joining guests to orders",
      why: "Guests carry market and signup; orders inherit them through joins, and the join type decides who survives. An order without a guest is corruption; a guest without orders is a dormant app account — though on this db the anti-join returns a confident zero, and proving that zero is part of the job.",
      slugs: ["combine-two-tables", "product-sales-analysis-i", "replace-employee-id-with-unique-identifier"],
    },
    {
      name: "Guest leaderboards",
      why: "Leaderboards are rank-window reporting where ties are guaranteed — four guests sit at 4 orders each on this db, under a ladder that runs 24, 17, 14, 13, 5. RANK, DENSE_RANK and ROW_NUMBER differ in who shares a rung and whether gaps follow, which is a policy about peer guests, not syntax.",
      slugs: ["rank-scores", "top-earners", "department-top-three-salaries", "second-highest-salary"],
    },
    {
      name: "Bucket-band menus with CASE",
      why: "The menu is engineered in bands — budget sides, core buckets, premium drops — and the band fold is a CASE histogram: budget 8 SKUs at 32.06 average, core 8 at 111.5, premium empty at max price 199.99. The arms must be exhaustive and ordered: a hole in the CASE is a hole in the mix forecast, and a reordered WHEN quietly re-bands the base.",
      slugs: ["weather-type-in-each-country", "calculate-special-bonus", "spend-histogram", "count-salary-categories", "average-selling-price", "repeat-purchase-rate"],
    },
    {
      name: "Month walks & LAG momentum",
      why: "The 14-month order spine (2024-01 to 2025-02) is the growth call's home turf: prior month beside current, delta rounded, the 1,193.86 July trough named. LAG drives the walk; the first row is NULL by definition — the baseline, never a zero to coalesce away.",
      slugs: ["restaurant-growth", "monthly-transactions-i", "biggest-window-between-events", "fix-product-name-format"],
    },
    {
      name: "Franchisee settlement coverage",
      why: "Billed is not remitted — the franchise ledger (28 statements, 27 remittance legs, INTEGER cents) is where the store world meets money. The exact/partial/none coverage split (21 / 1 / 6) is one LEFT JOIN and one CASE away, and the anti-join's 6 never-remitted statements worth 15,217 feed the dunning calendar.",
      slugs: ["customers-who-never-order", "sellers-with-no-sales", "count-student-number-in-departments", "duplicate-charge-pairs"],
    },
    {
      name: "Nested folds & tier gates",
      why: "Screens escalate into staging: fold per-guest order counts, then judge them against a computed platform mean (6.44 here — exactly four guests clear it). Scalar, correlated and derived shapes each carry an empty-inner-query answer you are expected to give unprompted.",
      slugs: ["managers-with-at-least-5-direct-reports", "orders-with-maximum-quantity-above-average", "average-salary-of-departments", "percentage-of-users-attended-a-contest", "confirmation-rate", "basket-depth-aov"],
    },
    {
      name: "One-pass status censuses",
      why: "The ops board gets completed, fired, queued and aborted in ONE scan — 52, 30, 14, 7, reconciling to 103 by construction. FILTER (WHERE …) branches per aggregate, SUM(CASE …) is the portable twin, and four sequential queries are four ways to drift.",
      slugs: ["active-businesses", "create-a-session-bar-chart", "user-activity-for-the-past-30-days-ii", "top-travellers", "queries-quality-and-percentage"],
    },
    {
      name: "Cents-safe billing discipline",
      why: "Royalty statements and remittances carry INTEGER cents, so every dollar read is amount_cents / 100.0 — the missing .0 turns a 1,756.00 print into 1,756 and quietly eats cents on every odd-cent row. Tender-rail folds (card 16 legs / 37,364 versus wire 11 / 32,248) are the daily reconciliation reads.",
      slugs: ["monthly-transactions-ii", "products-worth-over-invoices", "bank-account-summary-ii", "group-sold-products-by-the-date"],
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
    {
      id: "kfc-t9",
      q: "Walk me through the supplier → products → order_items chain. Where does the fan-out live, and which aggregates survive it untouched?",
      a: "The fan-out lives at the products-to-order_items hop: one recipe joins once per line record, so the chain's finest grain is the line. Revenue survives untouched because SUM(oi.quantity * oi.unit_price) counts each line's value exactly once — Nordic's 11,130.25 is built from its 3 recipes' lines and every line earns its seat. Recipe count must fold the fan-out back: COUNT(DISTINCT p.id) reads 3, where COUNT(*) reads Nordic's line count and wears a recipe's name. The silent killer is a product-grain column: SUM(p.stock) after the join counts each recipe's pantry once per line record. The fix is staging — fold per recipe in a CTE, then roll to the partner — the same two-stage discipline the month-close ledger uses.",
      tag: "joins",
    },
    {
      id: "kfc-t10",
      q: "Your running booked-value tile breaks with SUM(o.total) OVER (ORDER BY month) on a query that already GROUP BY month. Explain the failure and the fix.",
      a: "Windows evaluate after grouping, and after GROUP BY month the only values left in the row are the group aggregates — o.total at order grain no longer exists to reference. The fix is to aggregate inside the window: SUM(SUM(o.total)) OVER (ORDER BY month) — the inner SUM folds orders into months, the outer SUM walks the fold into a running total. It reads odd and it is exactly correct, and on this db the walk opens at 3,731.97 for January. While you are there, say the frame out loud: the default with ORDER BY is RANGE, which pulls tied peers into the same step — at month grain ties are rare, at order grain they are guaranteed, so ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW is the strict row-by-row walk. The interviewer's follow-up is 'one row per what?' again: one row per month, running over monthly sums.",
      tag: "windows",
    },
    {
      id: "kfc-t11",
      q: "When is GROUP_CONCAT the right shape for a KFC read, and what does the fold cost you?",
      a: "It is right when the consumer wants an inventory in one glance — the kitchen prep sheet folds each order day's menu items into a comma-joined cell, one row per day, and store managers print exactly that. What it costs is everything you folded away: order boundaries vanish (items from different guests merge into one cell), counts inside the cell are invisible, and string order is engine-dependent unless the build supports GROUP_CONCAT(name ORDER BY name) — on older SQLite the append order is whatever the scan produced, so the same query can print two different sheets. The discipline: GROUP_CONCAT is a presentation fold, not a data model — keep the underlying GROUP BY grain honest (day, not 'everything'), state the separator, and never join on the folded cell afterward. If a stakeholder asks 'how many items?', that is COUNT(*) at the pre-fold grain, not a comma count on the string.",
      tag: "aggregation",
    },
    {
      id: "kfc-t12",
      q: "What is your COALESCE policy — when is a default a display guard and when is it a definition change?",
      a: "COALESCE is a display guard when the NULL is legitimately absent and the business asks for a printable zero — a guest with no remittances shows 0 in the dunning memo, that is presentation. It becomes a definition change the moment the default feeds a metric: COALESCE(julianday(shipped_at) - julianday(created_at), 0) invents same-day fires for the 21 unstamped orders — 14 queued, 7 aborted — and flatters the 2.98-day fire clock precisely where nothing happened. The honest shape is separate census arms: COUNT(*) and COUNT(shipped_at) side by side so the 82-stamped population is visible, and the unstamped 21 reported as their own column, not laundered through a default. The one place a default IS the definition is NULLIF for division guards — NULLIF(denominator, 0) turns a divide-by-zero into a deliberate NULL — and even then you say so in the query comment.",
      tag: "nulls",
    },
    {
      id: "kfc-t13",
      q: "The fate census must reconcile to 103 by construction. How do you build a census whose arms cannot drift?",
      a: "One pass, one population, arms over the same scan. The market fate census folds 103 orders with four SUM(CASE WHEN status = …) arms — or the FILTER (WHERE …) twin — and every arm counts from the same COUNT(*) population, so 52 + 30 + 14 + 7 = 103 holds by construction: the identity is the query's shape, not a coincidence to check afterward. The failure modes are all drift: four sequential queries are four chances for a different WHERE clause, a stale extract, or an added market filter to sneak in; a CASE arm that omits a status value silently zero-fills; a HAVING floor applied before the arms are computed breaks the reconciliation for the markets it drops. The discipline I ship: the arms, the total, and the identity in a comment — '- 52 + 30 + 14 + 7 = 103 by construction' — so the next analyst inherits the invariant, not just the number.",
      tag: "pipeline",
    },
    {
      id: "kfc-t14",
      q: "IN versus EXISTS — how do you choose between them, and what breaks each one?",
      a: "IN tests membership against a materialized list, so it shines when the set is small and static — status IN ('pending', 'cancelled') over four known fates is the clearest filter you can write. Its failure mode is the NULL set: x NOT IN (subquery) goes UNKNOWN for every row the moment one NULL enters the list, silently emptying the report — the fix is NOT EXISTS, which asks a per-row existence question and never compares against a poisoned set. EXISTS wins when the subquery is large and the outer is small, because it probes per row and stops at the first match instead of materializing anything. The scalar subquery is the third sibling with a 0-or-1-row contract: one row drives the comparison, zero rows return NULL and the comparison empties quietly. My rule of thumb: membership = IN over a guarded list, existence = EXISTS, one value = scalar with its population stated, staging = a named CTE.",
      tag: "subqueries",
    },
    {
      id: "kfc-t15",
      q: "Month buckets from TEXT dates: how do you build the spine, defend the bounds, and read the LAG edge?",
      a: "The spine is the year-plus-month slice — SUBSTR(created_at, 1, 7) or STRFTIME('%Y-%m', created_at) — because the '%Y-%m' key sorts lexicographically and never collides: slicing month alone folds 2024-01 into 2025-01 and the 14-bucket spine (2024-01 to 2025-02) becomes fiction. The bounds are half-open: created_at >= '2024-01-01' AND created_at < '2024-02-01' survives the timestamp migration, where BETWEEN '2024-01-01' AND '2024-01-31' stops at midnight on the last day. The LAG edge is definitional: the first month's prev is NULL because no baseline exists — report it as NULL or label it 'baseline', never coalesce to zero, which reads as a flat month. And one grain rule: placed-time buckets use created_at, dispatched-time buckets use shipped_at — merging the two spines is how a kitchen slip gets reported as a demand dip.",
      tag: "dates",
    },
    {
      id: "kfc-t16",
      q: "The AR ledger must land at delta zero. What does the trial balance prove, and what does it miss?",
      a: "It proves the plumbing: SUM(debit_cents) = SUM(credit_cents) — 181,080 against 181,080 on this ledger, delta zero — means every entry that touched one side touched the other, so double-entry held at write time. It proves nothing about classification: a remittance booked against the wrong statement still balances perfectly, which is exactly the paid-claim anomaly #28 — status 'paid', 1,756.00 billed, zero remittance legs — a row the trial balance waves through and the coverage census catches. So the close is two artifacts, not one: the trial balance for the plumbing, and the coverage split — 21 exact, 1 partial (4,000 of 6,148), 6 never-remitted worth 15,217 — plus the row-level anomaly list for the judgment calls. The cents rule rides under all of it: finance stores INTEGER cents, the dollar read is amount_cents / 100.0, divide once and round once at the read boundary.",
      tag: "quality",
    },
    {
      id: "kfc-t17",
      q: "You LEFT JOIN guests to orders, then filter status = 'delivered' in WHERE. What silently breaks, and what are the two fixes?",
      a: "The WHERE on the right table's column kills the NULL-payload rows: a guest with no orders carries NULL status, NULL = 'delivered' evaluates UNKNOWN, and the row is discarded — the LEFT JOIN has quietly become an INNER JOIN and the dormant accounts your report exists to find are gone, with no error anywhere. Fix one: move the predicate into the ON clause — ON o.customer_id = g.id AND o.status = 'delivered' — which filters the match, not the survival. Fix two: wrap the LEFT JOIN in an outer query and filter there, when the predicate genuinely belongs after the join. The exception that proves the rule: the anti-join pattern — LEFT JOIN … WHERE p.id IS NULL — filters the right column on purpose, because NULL-ness IS the answer; on this db it returns a confident zero never-ordering guests, and stating that zero's denominator is part of the deliverable.",
      tag: "joins",
    },
    {
      id: "kfc-t18",
      q: "RANK, DENSE_RANK, ROW_NUMBER — the board asks for a tie policy on the guest leaderboard. What do you say?",
      a: "The trio differs exactly at ties, and ties are guaranteed here — four guests sit at 4 orders under a ladder that runs 24, 17, 14, 13, 5. RANK shares rungs and skips: the four-way tie consumes ranks 6 through 9 and the next distinct count lands on 10, implying phantom positions that do not exist. DENSE_RANK shares rungs without gaps: the tie reads 6, 6, 6, 6 and the 3-order guests are tier 7. ROW_NUMBER splits the tie arbitrarily — a silent judgment about whose account gets the app-loyalty offer first — unless you name a tiebreaker (created_at, then id) and make the pick reproducible. The answer is a policy, stated before the query runs: peer guests share rungs, the published board uses RANK semantics with gaps, selection uses ROW_NUMBER with a named tiebreaker — and the policy goes in the query comment so the CRM export reproduces byte for byte.",
      tag: "windows",
    },
    {
      id: "kfc-t19",
      q: "Why are four sequential COUNT queries four ways to drift, and what is the one-pass alternative?",
      a: "Each sequential query re-scans the table with its own WHERE clause, so each is a fresh chance for a different filter, a missed market, or a stale extract to enter — and the four results carry no structural promise of summing to anything. The one-pass census folds once: GROUP BY region with four FILTER (WHERE status = …) arms, or the portable SUM(CASE …) twin, counting every fate from the same population so 52 + 30 + 14 + 7 = 103 by construction. The same discipline extends to keyed counts: COUNT(DISTINCT CASE WHEN status = 'cancelled' THEN region END) reads the three markets that carry aborts in the same pass, because the CASE maps aborts to their market and COUNT skips the NULL arms. Reviewers here read the reconciliation identity first — if the arms cannot drift, the board cannot lie; if they can, no amount of eyeballing saves the deck.",
      tag: "aggregation",
    },
    {
      id: "kfc-t20",
      q: "Build the fire-clock read so the population gap shows instead of hides. What do COUNT(*) and COUNT(shipped_at) each tell the ops room?",
      a: "Side by side, always: COUNT(*) reads 103 booked orders, COUNT(shipped_at) reads 82 fire-stamped ones, and the 21-row gap is not missing data — it is the 14 queued and 7 aborted orders that have no fire stamp because no fire happened. That gap IS a metric: it is the still-in-flight population the kitchen queue watches, and printing it as its own column means nobody has to subtract two tiles to find it. The AVG rides the stamped population with or without a WHERE clause — AVG ignores NULLs, so the WHERE-less version returns the same 2.98-day average wearing the wrong name, which is why the WHERE ships anyway: not to change the number, but to state the population in code. What never ships is COALESCE to zero — it invents 21 same-day fires and drags the clock toward fiction. Population in the title, gap as a column, average over the stated 82: that read survives the ops review.",
      tag: "nulls",
    },
    {
      id: "kfc-t21",
      q: "The market report filters status = 'delivered' and keeps markets with at least ten orders. Place every filter by grain, and say what breaks when one moves.",
      a: "Two facts, two clauses. The status rule is a row-level fact — it discards fired, queued and aborted rows before any fold exists — so it lives in WHERE; moving it to HAVING is impossible because statuses no longer exist once rows are grouped. The ten-order floor is a group-level fact — it judges markets that only exist after GROUP BY — so it lives in HAVING COUNT(*) >= 10; on this db EU (45), APAC (37) and the US (19) clear it and LATAM's 2 orders drop. Putting the floor in WHERE errors because COUNT(*) does not exist at filter time, and referencing the SELECT alias there fails too — WHERE runs before SELECT names anything. The pipeline order FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY is not trivia here; it is the difference between a forecast line and an error, and the strong answer places every filter by asking: is this a fact about one order, or about a market?",
      tag: "pipeline",
    },
    {
      id: "kfc-t22",
      q: "Correlated versus derived subqueries — how do cost and semantics differ, and when do you reach for each?",
      a: "A correlated subquery re-runs per outer row: 'each order beside its guest's average ticket' executes the inner fold once per order, answering a per-context question at a per-row cost — basket context, not platform context. A derived table or CTE folds once and joins: stage per-guest averages in a FROM subquery, then compare every order to a single materialized fold — same rows possible, very different scan profile, and the plan is visible in EXPLAIN QUERY PLAN instead of guessed. Semantically, the correlated form answers 'compared to MY guest's habit' and the derived form answers 'compared to a named population' — those are different business questions wearing similar SQL. The traps ride both: an empty correlated inner returns NULL comparisons silently, and a derived table that pre-filters differently from the outer query produces a plausible wrong number. My rule: correlation for genuine per-row context, CTE when the fold deserves a name the memo can cite.",
      tag: "subqueries",
    },
    {
      id: "kfc-t23",
      q: "Dispatch latency on this db: compute it, state its population, and name its unit — what does the strong answer cover?",
      a: "Compute: AVG(julianday(shipped_at) - julianday(created_at)) over the orders that carry a stamp — 82 of 103, averaging 2.98 days on a 2-to-4 spread. Population: the 14 queued and 7 aborted orders are excluded by definition, not by cleanup — no fire, no latency — and the WHERE shipped_at IS NOT NULL ships with the query to say so in code even though AVG would skip the NULLs anyway. Unit: julianday returns fractional days, and on date-only TEXT stamps the differences are whole calendar days, so 2.98 is days, not hours — say it in the title, because production streams the identical query in hours against the cold-chain SLA and a misread unit is a 24x error. The follow-ups write themselves: why not COALESCE to zero (it invents same-day fires), why not median-vs-average debates before the population is stated, and what changes if the spine buckets by shipped_at instead of created_at — a different report at a different grain.",
      tag: "dates",
    },
    {
      id: "kfc-t24",
      q: "Two remittance legs land on one statement. How do you detect it, and when is it a finding versus a design?",
      a: "Detection is a self-join with a strict inequality: payments p1 JOIN payments p2 ON p1.invoice_id = p2.invoice_id AND p1.id < p2.id — the id guard pairs each split once and never a row with itself. On this db it surfaces five statements (1, 5, 12, 19, 22) each carrying a card leg and a wire leg — and that is the judgment call the query cannot make for you: split settlement across two rails is legitimate design here, which is why 27 legs settle 28 statements without alarm. The actual findings live elsewhere: the paid-claim anomaly #28 (status 'paid', zero legs) and the void-but-remitted #11 — status columns disagreeing with row reality. The discipline: detection SQL is mechanical and reruns nightly, but every detected pair gets a classification step — expected split, duplicate capture, or anomaly — because a detector without a classifier pages finance for the five healthy splits and misses the quiet lie. Pairs change the coverage census arithmetic too: COUNT(p.id) counts legs, so paid_cents must SUM, or split statements flip class.",
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
    {
      id: "kfc-mcq-11",
      prompt: "The order spine buckets with SUBSTR(created_at, 1, 7). A teammate switches to SUBSTR(created_at, 6, 2) to 'shorten the key'. What breaks?",
      choices: [
        "Nothing — both slice a month key",
        "The key loses the year, so 2024-01 and 2025-01 fold into one bucket and the 14-month spine collapses to 12",
        "It keeps the year and drops the month",
        "January orders return NULL and drop from the spine",
      ],
      answer: 1,
      why: "On '2024-01-05' the position-6 slice reads '01' — month without year. The '%Y-%m' key sorts lexicographically and never collides across years; the short key merges the two Januarys and the trend becomes fiction, silently.",
      notes: [
        { choice: 0, why: "Both 'work' — that is the trap. A key that executes is not a key that identifies; 14 buckets becoming 12 is the tell nobody re-counts." },
        { choice: 3, why: "No NULLs anywhere — the slice succeeds, which is exactly why the bug ships quietly instead of erroring." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-12",
      prompt: "orders holds 103 rows; the join to order_items fans out to 251. What does COUNT(*) return on the joined table?",
      choices: [
        "103 — the join preserves the left table's row count",
        "251 — the join's row grain",
        "16 — DISTINCT is implied",
        "It errors — COUNT needs a column",
      ],
      answer: 1,
      why: "COUNT(*) counts rows at the join's finest grain — 251 line records. Order count needs COUNT(DISTINCT o.id), guest count COUNT(DISTINCT o.customer_id); the 251-over-103 ratio (2.44 lines per order) is the basket-depth read.",
      notes: [
        { choice: 0, why: "103 is the pre-join count. After the join, COUNT(*) follows the multiplied table — quoting it as 'orders' inflates every funnel tile." },
        { choice: 2, why: "DISTINCT is never implied — COUNT(*) and COUNT(DISTINCT customer_id) are different metrics that happen to live in one SELECT." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-13",
      prompt: "The kitchen prep sheet runs SELECT o.created_at, GROUP_CONCAT(p.name) FROM order_items oi JOIN orders o ON o.id = oi.order_id JOIN products p ON p.id = oi.product_id GROUP BY o.created_at. What shape comes back?",
      choices: [
        "One row per menu item per day",
        "One row per order day with the day's items comma-joined in a single cell",
        "One row per order",
        "A single row for the whole table",
      ],
      answer: 1,
      why: "GROUP_CONCAT is an aggregate: it folds the group's values into one delimited string, one row per GROUP BY key — the order day. The item detail survives only inside the cell, which is the point of a prep sheet.",
      notes: [
        { choice: 0, why: "That is the pre-fold shape. GROUP_CONCAT's entire job is collapsing the per-item rows into one cell per group." },
        { choice: 2, why: "The GROUP BY key is the day, not the order — folding by day erases order boundaries, which is fine for prep and fatal for guest-level reads." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-14",
      prompt: "Royalty statement #28 carries amount_cents = 175600. Which SELECT prints 1,756.00?",
      choices: [
        "SELECT amount_cents",
        "SELECT amount_cents / 100",
        "SELECT amount_cents / 100.0",
        "SELECT CAST(amount_cents AS TEXT)",
      ],
      answer: 2,
      why: "Finance stores INTEGER cents, so the dollar read is amount_cents / 100.0 — the .0 forces real division at the dollar scale. The raw column prints 175600, and integer /100 prints 1756 with the decimal gone and odd cents eaten.",
      notes: [
        { choice: 1, why: "Integer division truncates: right-looking digits, wrong type — and on any odd-cent row the cents vanish before rounding ever runs." },
        { choice: 3, why: "A CAST changes the type, not the scale — 175600 stays 175600, now as text. Only the /100.0 divide converts." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-15",
      prompt: "The one-pass fate census uses COUNT(*) FILTER (WHERE o.status = 'delivered') beside three more FILTER arms. What does FILTER do?",
      choices: [
        "Filters rows out of the whole query before grouping",
        "Applies a per-aggregate WHERE so each aggregate counts only its branch — 52 here — while every arm scans the same 103 rows",
        "Rounds the count to delivered orders only",
        "Replaces GROUP BY",
      ],
      answer: 1,
      why: "FILTER (WHERE …) branches a single aggregate over its own predicate — 52 / 30 / 14 / 7 in one pass, reconciling to 103 by construction. SUM(CASE …) is the portable twin; four sequential queries are four ways to drift.",
      notes: [
        { choice: 0, why: "Rows stay in the scan — the other FILTER arms still see them. Removing rows per-aggregate is exactly what makes it a census instead of four queries." },
        { choice: 3, why: "GROUP BY still folds the markets; FILTER shapes individual aggregates inside the fold — the two compose, they don't substitute." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-16",
      prompt: "How many of the 103 booked orders sit in the live funnel — every fate EXCEPT aborted?",
      choices: [
        "96 — status <> 'cancelled' keeps delivered, fired and queued (52 + 30 + 14)",
        "103 — all orders stay live until delivered",
        "89 — 103 minus the 14 queued",
        "82 — only the fire-stamped orders",
      ],
      answer: 0,
      why: "103 − 7 aborted = 96. The <> predicate excludes only the aborted fate; the live funnel is everything a courier could still complete, queued and in-kitchen rows included.",
      notes: [
        { choice: 2, why: "The queued 14 are exactly the rows a kitchen queue exists for — excluding them empties the funnel's middle and the ops board goes blind." },
        { choice: 3, why: "82 is the fire-stamped population (delivered + fired), not the not-aborted population — two different denominators that both sound like 'active'." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-17",
      prompt: "SELECT DISTINCT region FROM customers — what comes back on this db?",
      choices: [
        "16 rows — one per guest",
        "4 rows — EU, APAC, US, LATAM",
        "103 rows — one per order",
        "1 row — regions collapse to one",
      ],
      answer: 1,
      why: "DISTINCT folds duplicates in the output columns: 16 guests live across 4 markets. It operates on the result set, not on any table's row count.",
      notes: [
        { choice: 0, why: "16 is the pre-DISTINCT guest count; repeats within a region collapse. DISTINCT after a join to orders would still return 4 — the regions, not the guests." },
        { choice: 2, why: "customers carries no orders — that grain comes from the orders table, and DISTINCT(region) can never produce it." },
      ],
      difficulty: "easy",
    },
    {
      id: "kfc-mcq-18",
      prompt: "created_at is date-only TEXT today ('2024-03-08'); the production feed migrates to full timestamps. Which March filter still counts every March order after the migration?",
      choices: [
        "BETWEEN '2024-03-01' AND '2024-03-31'",
        "created_at >= '2024-03-01' AND created_at < '2024-04-01'",
        "SUBSTR(created_at, 1, 6) = '2024-3'",
        "created_at LIKE '2024-03%'",
      ],
      answer: 1,
      why: "Half-open bounds survive the migration: < '2024-04-01' includes every moment of March 31, where the BETWEEN upper bound '2024-03-31' stops at midnight and drops the last day's evening orders. On date-only data both read 8 — the trap only fires after the migration.",
      notes: [
        { choice: 0, why: "It happens to match today because the stamps carry no time — 'happens to' is the bug's favorite schedule. Bound conventions are for the data you will have, not the data you have." },
        { choice: 2, why: "Two breaks at once: the slice loses the day entirely, and the month is zero-padded — March is '03', never '3'." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-19",
      prompt: "A one-market staging table feeds SELECT * FROM orders WHERE total > (SELECT AVG(total) FROM staging_orders). The staging extract returns zero rows. What does the report do?",
      choices: [
        "Errors — the subquery must return a value",
        "Returns every order — the threshold reads as zero",
        "Returns nothing silently — AVG over zero rows is NULL and total > NULL is UNKNOWN",
        "Falls back to the platform average of 338.19",
      ],
      answer: 2,
      why: "A scalar subquery is contractually 0-or-1 rows; zero rows make the comparison value NULL, and every UNKNOWN comparison discards its row — the report empties while looking valid. The fix is stating the inner fold's population and guarding the empty case.",
      notes: [
        { choice: 0, why: "The empty case is silent, not loud — no error, no warning. That silence is exactly why empty-staging incidents ship to prod." },
        { choice: 1, why: "NULL is not zero: nothing is 'greater than NULL'. A report that returned everything would at least be visible — this one fails invisible." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-20",
      prompt: "Count the royalty statements with zero remittance legs: 28 statements, 27 payment rows, five statements carrying two legs each. What does the LEFT JOIN payments … WHERE p.id IS NULL pattern return?",
      choices: [
        "1 — the one unmatched payment row",
        "6 — six statements never remitted, worth 15,217",
        "5 — the split-payment statements",
        "0 — every statement has money behind it",
      ],
      answer: 1,
      why: "The anti-join keeps statement rows whose payment side stayed NULL: 28 statements minus 22 remitted = 6 never-remitted (15,217.00, including the paid-claim anomaly #28). Row-count arithmetic can't get there — 27 legs over 23 matched statements is why counts lie and the IS NULL guard is the tool.",
      notes: [
        { choice: 2, why: "The 5 split statements have legs — they sit on the matched side. The leg surplus (27 vs 23) is precisely why COUNT(payment rows) cannot substitute for the anti-join." },
        { choice: 0, why: "IS NULL tests the LEFT side's unmatched rows, not the right table's leftovers — and no payment row is orphaned here." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-21",
      prompt: "Four guests tie at 4 orders and the app-loyalty offer goes to exactly ONE of them. Which query makes that pick defensible?",
      choices: [
        "ROW_NUMBER() OVER (ORDER BY orders DESC) — first row wins",
        "ROW_NUMBER() OVER (ORDER BY orders DESC, created_at, id) — the named tiebreaker makes the pick reproducible",
        "RANK() — ties share the offer",
        "WHERE orders = 4 AND ROWNUM = 1",
      ],
      answer: 1,
      why: "An unbroken ROW_NUMBER tie resolves however the engine feels during that scan — rerun and the offer can change hands. A named tiebreaker (signup time, then id) makes the pick deterministic and auditable; RANK shares the rung and offers to nobody.",
      notes: [
        { choice: 0, why: "'First row' is undefined under ties — the query is a lottery ticket. The panel asks 'who decided the tie?' and 'arbitrary' is the wrong answer." },
        { choice: 2, why: "RANK gives all four rank 6 — a shared rung is a display policy, not a selection mechanism." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-22",
      prompt: "The menu-band fold runs CASE WHEN price < 50 THEN 'budget' ELSE 'core' END. A new 199.99 premium drop lands. Where does it read?",
      choices: [
        "premium — the band matches the price",
        "core — the ELSE arm catches everything the WHENs didn't",
        "NULL — no arm matches",
        "The query errors on the unmapped band",
      ],
      answer: 1,
      why: "ELSE is the catch-all: 199.99 fails price < 50 and falls into 'core', so the premium band reads empty forever while the core average drifts up. Exhaustive ordered arms — WHEN < 50, WHEN < 200, ELSE premium — are the fix, and the band mix stops lying.",
      notes: [
        { choice: 0, why: "There is no premium arm to match. The band label is whatever the arms compute, not what the menu team calls the item." },
        { choice: 2, why: "CASE returns NULL only when no arm matches AND there is no ELSE — here the ELSE exists, so 199.99 reads 'core' with total confidence." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-23",
      prompt: "One pass over orders joined to markets: COUNT(DISTINCT CASE WHEN o.status = 'cancelled' THEN c.region END) — what does it read?",
      choices: [
        "7 — one per aborted order",
        "3 — EU, APAC and US carry aborts; the NULL arms drop out",
        "4 — every market counts once",
        "0 — the CASE returns NULL for non-aborted rows",
      ],
      answer: 1,
      why: "The CASE maps aborted orders to their market and everything else to NULL; COUNT skips NULLs and DISTINCT folds repeats — 3 markets (EU 3, APAC 3, US 1; LATAM carries none). It is the aborted-map in one aggregate, riding the same scan as the fate census.",
      notes: [
        { choice: 0, why: "DISTINCT folds the 7 aborts by market — the answer is 'how many markets', which is a different question than 'how many aborts'." },
        { choice: 3, why: "The NULL arms are skipped by COUNT, not returned — that silence is exactly what makes the pattern work." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-24",
      prompt: "SELECT region, c.name, COUNT(*) FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY region — SQLite runs it without complaint. What is the catch?",
      choices: [
        "name gets averaged — SQLite aggregates text silently",
        "It is standard SQL — name is functionally dependent on region",
        "SQLite hands back an arbitrary guest's name per market — standard SQL rejects the bare column, so the read is neither portable nor reproducible",
        "GROUP BY must list every SELECT column in every engine",
      ],
      answer: 2,
      why: "SQLite's leniency permits non-aggregated columns outside GROUP BY and returns an unspecified row's value. The census works because region is the grouping key; name is a lottery ticket — a different guest's name every run, in every other engine an outright error.",
      notes: [
        { choice: 0, why: "No implicit aggregation happens — it is a raw row's value wearing an aggregate's clothing." },
        { choice: 3, why: "The engine doesn't error, which is precisely the portability trap: the query that runs here fails the code review in Postgres, and 'it worked on the training db' is not a defense." },
      ],
      difficulty: "medium",
    },
    {
      id: "kfc-mcq-25",
      prompt: "The published guest ladder reads 24, 17, 14, 13, 5, then four guests tied at 4, then two at 3. Under DENSE_RANK() OVER (ORDER BY orders DESC), what tier do the 3-order guests carry?",
      choices: ["10", "7", "9", "8"],
      answer: 1,
      why: "DENSE_RANK packs ties without gaps: 24→1 … 5→5, the four 4s share tier 6, and the next distinct value lands on 7. RANK would hand the 3s rank 10 — same data, different tie policy, different number on the board.",
      notes: [
        { choice: 0, why: "10 is RANK's answer — the tie block consumed ranks 6-9 and the gap-following policy jumps past them. The two functions disagree exactly at this row." },
        { choice: 3, why: "8 would mean one phantom tier between the 4s and the 3s — no order count occupies it, and DENSE_RANK never invents one." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-26",
      prompt: "Partner revenue joins suppliers → products → order_items. Nordic's 3 recipes fan into many line records. Why is Nordic's recipe count COUNT(DISTINCT p.id) and not COUNT(*)?",
      choices: [
        "COUNT(*) cannot run across a three-table join",
        "COUNT(*) counts line records — 3 recipes × their lines — while DISTINCT folds the fan-out back to the 3 recipes",
        "DISTINCT is needed because p.id is text",
        "COUNT(*) double-counts the supplier row",
      ],
      answer: 1,
      why: "The chain's finest grain is the line record: every order line re-joins its recipe. COUNT(*) reads the fan-out; COUNT(DISTINCT p.id) reads 3. Revenue escapes untouched because SUM(oi.quantity * oi.unit_price) counts each line's value once — the one aggregate that WANTS the fan-out.",
      notes: [
        { choice: 2, why: "p.id is an integer key. The DISTINCT is about multiplicity, not type." },
        { choice: 3, why: "The supplier row doesn't duplicate — each Nordic product re-joins once per line. The multiplication lives at the products-to-lines hop." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-27",
      prompt: "After GROUP BY month you want a running booked-value tile: SUM(o.total) OVER (ORDER BY month). It fails. Why — and what is the fix?",
      choices: [
        "Windows can't ORDER BY a text month — cast it first",
        "After GROUP BY, o.total no longer exists at row grain — the window must run over the aggregated fold: SUM(SUM(o.total)) OVER (ORDER BY month)",
        "Running totals need ROWS BETWEEN, not ORDER BY",
        "SUM cannot be nested — rewrite as a self-join",
      ],
      answer: 1,
      why: "Windows evaluate after grouping, and the only values left are group aggregates — so the running sum must sum the aggregate. SUM(SUM(total)) reads odd and is exactly correct: fold to months, then walk the fold, opening at January's 3,731.97.",
      notes: [
        { choice: 2, why: "Frames shape which rows the window sees; they don't repair a reference to a pre-fold column. The error fires before frames matter." },
        { choice: 3, why: "Nesting aggregates inside windows is legal and standard at aggregated grain — the self-join rewrite is slower and harder to read for the same answer." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-28",
      prompt: "The month walk uses LAG(booked) OVER (ORDER BY month). A teammate sorts the window DESC 'so the newest month prints first'. What happens to prev_booked?",
      choices: [
        "Nothing — LAG is direction-agnostic",
        "Every row's prev becomes the NEWER month — the walk silently reads the future and every delta flips sign",
        "The first row errors out",
        "The NULLs move to the last row",
      ],
      answer: 1,
      why: "LAG reads the previous row of the window's own ordering — reorder the window and 'previous' means newer. February's prev_booked becomes March's value and every month-over-month delta inverts; the output's ORDER BY cannot repair a window ordered backwards.",
      notes: [
        { choice: 0, why: "LAG is ordering-dependent by definition — the window's ORDER BY is the metric's timeline, not a presentation choice." },
        { choice: 2, why: "No error anywhere — a smooth, plausible, backwards walk. The worst failure mode a review can face." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-29",
      prompt: "The staging dormant-guest list broke: guest_id NOT IN (SELECT customer_id FROM import_orders) returned zero rows, and import_orders.customer_id carries NULLs. Which rewrite is immune?",
      choices: [
        "NOT IN (SELECT DISTINCT customer_id …) — dedupe fixes the NULL",
        "NOT EXISTS (SELECT 1 FROM import_orders io WHERE io.customer_id = g.guest_id) — existence probing never compares against the NULL set",
        "LEFT JOIN import_orders … WHERE customer_id IS NULL — joins are immune",
        "COALESCE(guest_id, 0) NOT IN (SELECT customer_id …)",
      ],
      answer: 1,
      why: "NOT EXISTS asks a per-row existence question — no materialized list, so a NULL in the subquery can't poison the comparison set. NOT IN with one NULL makes every row UNKNOWN; DISTINCT dedupes values, not UNKNOWNs.",
      notes: [
        { choice: 2, why: "A plain LEFT JOIN … IS NULL can work, but the join itself must be NULL-safe and it fans out on repeats — the three-valued risk didn't leave, it moved into the ON clause." },
        { choice: 3, why: "COALESCE invents a guest 0 that matches nothing — the report still returns zero rows, now with a cast to hide behind." },
      ],
      difficulty: "hard",
    },
    {
      id: "kfc-mcq-30",
      prompt: "COUNT(*) OVER (PARTITION BY c.region) paints market size onto every order row. What does an EU order row show, and what happened to the other markets?",
      choices: [
        "45 — its market's size; the other markets still exist in the result, each painted with their own count",
        "45 — and the result collapsed to one row per market",
        "103 — PARTITION BY is ignored without ORDER BY",
        "The row's own market only — the others vanish from the output",
      ],
      answer: 0,
      why: "PARTITION BY computes the aggregate over the region's rows and paints it on each: EU's 45 orders each read 45, APAC's each read 37 — no folding, every row survives. It is per-group context without the collapse, which is how per-order share divides: 1/45 within EU, not 1/103 network-wide.",
      notes: [
        { choice: 1, why: "Collapsing to one row per market is GROUP BY's job — windows exist precisely to keep every row while carrying the group's context." },
        { choice: 2, why: "ORDER BY changes the window's sequencing, not the partition's existence — the count is computed over the partition either way." },
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
    {
      id: "cs-kfc-3",
      tier: "medium",
      topic: "q1",
      universe: "growth",
      title: "The super-fan revenue base",
      brief:
        "Growth-board brief, in-world: guest concentration is the dial the CRM pod watches — one lost super-fan moves a quarter. The board wants the super-fan base isolated: guests whose LIFETIME booked value crosses 3,000, their combined order value, and their share of the 34,833.28 network book. Probed on the storefront db: exactly 4 of the 16 guests clear the bar — Alice at 7,262.35, Emma at 6,640.56, Grace at 4,574.23, Maya at 3,644.56 — and their 22,121.70 of booked value is 63.5% of the network book. The threshold judges a per-guest aggregate, so it lives in a HAVING inside the subquery, and the outer query folds the surviving guests' orders.",
      ask: "Return one row: super_fans (distinct guests at or above the 3,000 lifetime threshold), their booked revenue, and their share of the whole book to 1 decimal.",
      template:
        "SELECT {1}(DISTINCT o.customer_id) AS super_fans,\n       ROUND(SUM(o.total), 2) AS revenue,\n       ROUND({2} * SUM(o.total) / (SELECT SUM(total) FROM orders), 1) AS share_pct\nFROM orders o\nWHERE o.customer_id IN (\n  SELECT customer_id FROM orders\n  GROUP BY customer_id\n  {3} SUM(total) >= {4}\n);",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the guest counter",
          why: "COUNT(DISTINCT o.customer_id) folds repeat orders back to people: 4 super-fans. SUM(DISTINCT customer_id) runs but adds their id codes — a meaningless number that changes if a guest re-registers.",
        },
        {
          answer: "100.0",
          kind: "number",
          label: "the share scaler",
          noVerify: true,
          why: "The share must be real arithmetic BEFORE the division: 100.0 × 22,121.70 / 34,833.28 = 63.5. A bare 100 promotes integer division, truncating the ratio toward 0 and printing a flat share no market would believe.",
        },
        {
          answer: "HAVING",
          kind: "keyword",
          label: "the lifetime gate",
          why: "SUM(total) >= 3000 judges a per-guest aggregate that only exists after GROUP BY, so the gate is HAVING. WHERE SUM(total) is a syntax error — no groups exist at row-filter time.",
        },
        {
          answer: "3000",
          kind: "number",
          label: "the super-fan threshold",
          noVerify: true,
          why: "3,000 is the published CRM bar: exactly 4 guests clear it — the ladder tops 7,262.35 and the next guest sits at 2,667.93, a 333-dollar gap to the threshold. 2,000 would sweep a fifth guest in and re-cut the board's cohort mid-quarter.",
        },
      ],
      distractors: ["SUM", "WHERE", "10.0", "2000"],
      walkthrough:
        "Two layers, two grains, one board stat. The inner query folds all 103 orders to the guest grain — GROUP BY customer_id, HAVING SUM(total) >= 3000 — and keeps exactly the 4 guests the CRM ladder names: 7,262.35, 6,640.56, 4,574.23, 3,644.56, with the fifth guest (2,667.93) a clean 333 short of the bar. The outer query folds only those guests' orders: COUNT(DISTINCT o.customer_id) reads 4 people, SUM(o.total) reads 22,121.70, and the share divides against the full 34,833.28 book with the 100.0 scaler forcing real division first — 63.5%, the concentration number the growth memo quotes. Every distractor fails differently: SUM as the counter adds id codes into nonsense; WHERE before GROUP BY errors the gate; 10.0 prints a 6.4 share the board cannot reconcile with the 63.5 everyone has memorized; and 2,000 sweeps a fifth guest into the cohort, quietly redefining 'super-fan' mid-quarter. The subquery is the definition made executable — the cohort, the bar, and the denominator all live in one statement.",
    },
    {
      id: "cs-kfc-4",
      tier: "easy",
      topic: "x3",
      universe: "month-close",
      title: "The tender-rail stack",
      brief:
        "Month-close brief, in-world: franchise finance settles 28 royalty and ad-fund statements through 27 remittance legs across two tender rails — card captures and wire transfers — and the close deck wants the rail census with a grand TOTAL row underneath, one query, no spreadsheet math. Probed on the storefront db: the card rail carries 16 legs worth 37,364.00, the wire rail 11 legs worth 32,248.00, and the rails together settle 69,612.00 of billed value. Finance stores amounts as INTEGER cents, so every dollar read is amount_cents / 100.0 — and the TOTAL branch must scan the unfiltered payments table so the stack reconciles against the remittance book by construction.",
      ask: "Return legs and dollars per tender rail, plus a labelled TOTAL row for the whole remittance book, biggest dollars first.",
      template:
        "SELECT method AS rail,\n       {1}(*) AS legs,\n       SUM(amount_cents) / 100.0 AS dollars\nFROM payments\nGROUP BY method\n{2}\nSELECT 'TOTAL', {3}, SUM(amount_cents) / 100.0\nFROM payments\nORDER BY dollars {4};",
      slots: [
        {
          answer: "COUNT",
          kind: "keyword",
          label: "the leg counter",
          why: "COUNT(*) reads one per remittance leg: card 16, wire 11. SUM(*) and AVG(*) are not valid SQLite — the fold errors — and any column inside the parentheses counts amounts wearing a count's name.",
        },
        {
          answer: "UNION ALL",
          kind: "keyword",
          label: "the stacker",
          why: "UNION ALL concatenates the TOTAL branch onto the rail rows without a dedupe pass — the honest stack for a report where every row belongs. EXCEPT returns only the detail rows and quietly deletes the TOTAL the ask requires.",
        },
        {
          answer: "27",
          kind: "number",
          label: "the all-rails leg count",
          why: "The TOTAL row must count the whole book — 27 remittance legs, not one rail's 16 or 11 — because its dollars column (69,612.00) is the unfiltered grand total. The five split-payment statements are why legs (27) outnumber matched statements (23): each split carries a card leg and a wire leg.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the biggest-first sort",
          why: "The close reads the biggest rail on top: TOTAL 69,612.00, then card 37,364.00, then wire 32,248.00. ASC floats the wire rail to the top of the stack — a correct query aimed at the wrong end of the memo.",
        },
      ],
      distractors: ["SUM", "AVG", "EXCEPT", "28", "ASC"],
      walkthrough:
        "Two branches, one stack, cents-safe throughout. The detail branch GROUP BY method folds the 27 legs into two rails — card 16 legs / 37,364.00, wire 11 legs / 32,248.00 — each dollar read through the /100.0 cents rule. The TOTAL branch re-scans the unfiltered payments table: 27 legs and 69,612.00, so the stack shows the rails against the whole remittance book without a second query. UNION ALL is the join between grains — no dedupe, and the outer ORDER BY dollars DESC floats the TOTAL row to the top: 69,612.00, then card, then wire. The split-payment statements are the quiet star: five statements settle with a card leg plus a wire leg, which is why 27 legs exceed the 23 matched statements — and why the TOTAL row's 27 must be counted, not derived from one rail. The distractors fail honestly: SUM or AVG as the counter are invalid folds outright; EXCEPT deletes the TOTAL row the memo requires; 28 in the leg slot quotes the statement count where the leg count belongs — the exact rails-versus-statements confusion the close exists to police; ASC flips the stack so the smallest rail leads.",
    },
    {
      id: "cs-kfc-5",
      tier: "medium",
      topic: "t5",
      universe: "growth",
      title: "The guest leaderboard tiers",
      brief:
        "Growth-board brief, in-world: the app-loyalty pod publishes a guest leaderboard and the tie policy is part of the definition — tied guests share a tier, and no phantom tiers may appear. Probed on the storefront db: the frequency ladder runs 24, 17, 14, 13, 5, then FOUR guests tied at 4 orders (Isabella, Keiko, Noah, Pedro), then two at 3. The published cut keeps guests with at least 4 orders — 9 guests — so the four-way tie stays visible in the output and the tier arithmetic can be checked against the board. DENSE_RANK is the published semantics: shared tiers, no gaps, because a tier gap implies a count nobody holds.",
      ask: "Return guest name, order count, and a no-gap tier for every guest with at least 4 orders, busiest first with a deterministic name tiebreak.",
      template:
        "SELECT c.name,\n       COUNT(*) AS orders,\n       {1}() OVER (ORDER BY COUNT(*) {2}) AS ladder\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY o.customer_id, c.name\nHAVING COUNT(*) >= {3}\nORDER BY ladder, c.name;",
      slots: [
        {
          answer: "DENSE_RANK",
          kind: "keyword",
          label: "the no-gap tier function",
          why: "DENSE_RANK shares rungs without gaps: 24→1, 17→2, 14→3, 13→4, 5→5, then the four 4s all read tier 6. RANK would print the same 6s here — the tie sits at the bottom of the cut — but the published policy is DENSE_RANK because it cannot invent a strata; ROW_NUMBER would number the tied guests 6 through 9 as if peers could be split.",
        },
        {
          answer: "DESC",
          kind: "keyword",
          label: "the busiest-first direction",
          why: "Tier 1 is the biggest count, so the window ORDER BY runs descending. ASC crowns the four 4-order guests tier 1 and pushes Alice's 24 to the bottom — a correct-looking query answering the opposite question.",
        },
        {
          answer: "4",
          kind: "number",
          label: "the published cut",
          why: "HAVING COUNT(*) >= 4 keeps exactly 9 guests — the ladder down to 5 orders plus the four-way tie — so the tie block is visible and the tier arithmetic auditable. A floor of 5 amputates the tie and the board loses the cohort the loyalty pod is actively courting.",
        },
      ],
      distractors: ["ROW_NUMBER", "COUNT", "ASC", "5"],
      walkthrough:
        "A census, a cut, and a tie policy made executable. GROUP BY the guest grain folds 103 orders into 16 guests; HAVING COUNT(*) >= 4 keeps the published 9; the window hands out tiers over the aggregated counts. DENSE_RANK with COUNT(*) DESC reads 1, 2, 3, 4, 5 — Alice 24, Emma 17, Grace 14, Maya 13, Chloe 5 — and then the four 4-order guests share tier 6, six, six, six, with the name tiebreak making the row order reproducible. That gap-free property is the policy: RANK happens to agree HERE because the tie block sits at the bottom of the cut — no gap follows it — but the board publishes DENSE_RANK because it cannot manufacture a phantom tier on a different db, and ROW_NUMBER would split four peer guests into ranks 6-9 by scan luck. Flip the direction and ASC crowns the tie block tier 1; raise the floor to 5 and the four guests the loyalty pod wants disappear from the query before the window ever runs. The cut, the direction, and the function are three policy levers, and this case makes each one visible in the output.",
    },
    {
      id: "cs-kfc-6",
      tier: "hard",
      topic: "t7",
      universe: "growth",
      title: "The booked-value month pulse",
      brief:
        "Growth-board brief, in-world: the review wants the monthly booked-value pulse — each month's order value, the prior month's value beside it, and the percentage change — so the narrative writes itself from the table. Probed on the storefront db: 14 months of orders from 2024-01 to 2025-02 totalling 34,833.28; the book opens at 3,731.97, and the first seven months run 3,731.97 → 3,609.64 → 2,617.08 → 2,468.91 → 2,910.31 → 2,047.43 → 1,193.86 — the July trough the memo names. LAG carries the prior month; the first month's change is honestly NULL — no baseline exists. The walk is chronological and the cut is the first seven months, ending exactly at the trough.",
      ask: "Return month, booked value, the prior month's booked value, and the month-over-month percentage change to 1 decimal, for the first seven months.",
      template:
        "WITH monthly AS (\n  SELECT SUBSTR(created_at, 1, 7) AS month,\n         ROUND(SUM(total), 2) AS booked\n  FROM orders\n  GROUP BY month\n)\nSELECT month,\n       booked,\n       {1}(booked) OVER (ORDER BY month) AS prev_booked,\n       ROUND(100.0 * (booked - LAG(booked) OVER (ORDER BY month))\n             / LAG(booked) OVER (ORDER BY month), 1) AS mom_pct\nFROM monthly\nORDER BY month {2}\nLIMIT {3};",
      slots: [
        {
          answer: "LAG",
          kind: "keyword",
          label: "the prior-month reader",
          why: "LAG(booked) walks the window backwards one row — February's prev_booked is January's 3,731.97. LEAD would read forward and hand February March's 2,617.08, silently re-labeling the future as history; the first row's NULL is the honest 'no baseline'.",
        },
        {
          answer: "ASC",
          kind: "keyword",
          label: "the chronological direction",
          why: "A month-over-month read is chronological: ASC keeps 2024-01 on top so each row compares against the row above it, ending at the July trough. DESC would present 2024-07 first with its baseline below — the numbers survive, the story doesn't.",
        },
        {
          answer: "7",
          kind: "number",
          label: "the trough-bound cut",
          noVerify: true,
          why: "LIMIT 7 returns the first seven months — the run the deck opens with, ending on 1,193.86 and the -41.7% June→July collapse. The cut is the memo's: anything past July restarts the recovery story the growth board deliberately reads second.",
        },
      ],
      distractors: ["LEAD", "SUM", "DESC", "3"],
      walkthrough:
        "Staged windows over a month spine. The CTE folds 103 orders into 14 monthly buckets (SUBSTR month key, SUM rounded to cents); the outer query reads each month with its neighbor: LAG(booked) OVER (ORDER BY month) brings January's 3,731.97 into February's row, and the percentage divides the delta by that same LAG — 100.0 × (3,609.64 − 3,731.97) / 3,731.97 = -3.3%, then -27.5, -5.7, +17.9, -29.6 and the -41.7 collapse into the 1,193.86 July trough. The first month is NULL by design: no prior row, no baseline, no invented zero. The two-step matters — window output isn't visible to sibling expressions in the same SELECT, so the CTE stages the grain and the outer SELECT layers the windows; the 100.0 scaler forces real division before any truncation. LEAD would read the future (February's prev becomes March's 2,617.08); SUM would pile a running total into prev_booked; DESC tells the story backwards from the trough; LIMIT 3 amputates the fade the memo quotes. Every chip changes what the growth review would conclude.",
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
    { slug: "immediate-food-delivery-ii", why: "The kept-rate drill at scale: share of orders delivered immediately with the denominator argued out loud — 52 of 103 here, and the panel wants the queued-and-aborted rows defended, not dropped." },
    { slug: "funnel-step-conversion", why: "Booked → fired → completed step conversion over the digital funnel — each stage a conditional count on status or shipped_at, which is exactly the funnel digital analytics refreshes every morning." },
    { slug: "unique-orders-and-customers-per-month", why: "The two-grain census at its native grain: orders beside distinct guests per month — EU 45 from 8, US 19 from 2 — the load-versus-coverage pair every KFC board prints." },
    { slug: "number-of-rich-customers", why: "Threshold census over per-guest folds: guests above a spend bar, HAVING-judged. The super-fan cohort (4 guests, 63.5% of the book) is this shape with a 3,000 bar." },
    { slug: "combine-two-tables", why: "The LEFT JOIN warm-up that paints guests onto orders without dropping the unmatched side — the join-type-as-business-decision habit KFC screens open with." },
    { slug: "rank-scores", why: "Pure RANK semantics on ties — the 1,1,3 vocabulary check before the guest-leaderboard escalation. Say the shared-rung pattern out loud." },
    { slug: "top-earners", why: "Straight leaderboard at order grain: top counts per group with ties handled — the app-loyalty export's core query." },
    { slug: "department-top-three-salaries", why: "Top-three per group with a join back for names and a NULL-group guard — the hard screen closer mapped to top guests per market." },
    { slug: "weather-type-in-each-country", why: "CASE labeling per market — pause-heavy, fire-heavy, healthy — with exhaustive ordered arms. The readout-friendly column every ops deck wants." },
    { slug: "count-salary-categories", why: "Bands with zero rows must print 0, not vanish — the premium band (>= 200) is empty on this menu and the mix read still owes the board a 0." },
    { slug: "restaurant-growth", why: "Rolling 7-day averages over consecutive dates — the smoothing discipline behind the booked-value trend tiles the growth board reads weekly." },
    { slug: "sellers-with-no-sales", why: "Partner hygiene anti-join: suppliers (or menu SKUs) with zero activity in a window — the supply-bench read that must stay honest about empty result sets." },
    { slug: "managers-with-at-least-5-direct-reports", why: "HAVING threshold on a per-group count — 'groups big enough to matter' is the shape of every market-floor filter in this kit's censuses." },
    { slug: "average-salary-of-departments", why: "Compare each group to a computed mean — the above-average fold that hides an empty-inner NULL when the staging table is filtered. The tier-gate drill." },
    { slug: "create-a-session-bar-chart", why: "One-pass bucketed census — sessions (orders) folded into defined bins in a single scan, the fate-census shape at bin grain." },
    { slug: "monthly-transactions-i", why: "Statements issued in one month with cents-safe arithmetic — the /100.0 dollar read and the half-open month bound are the exact house mechanics." },
  ],
};
