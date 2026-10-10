// Deep-dives — Retail Analytics A file: basket economics and customer
// segmentation (3 problems: 2 Easy, 1 Medium; all three outputs are
// multi-row with ORDER BY, so every dive grades order:"exact"). Every
// money column is INTEGER cents with the _cents suffix; rates and depths
// are REAL; own tables, own seeds, original phrasing — never copied
// problem text. Each dive carries a primer: the domain concept taught
// from zero.
// Registry wiring (lead): 8067 basket-depth-aov ·
// 8068 repeat-purchase-rate · 8069 rfm-segmentation.
import type { LcSqlDive } from "../types";

export const SQL_DF_RETAIL_A: LcSqlDive[] = [
  {
    slug: "basket-depth-aov",
    statement:
      "Two numbers headline every retail merchandising review: what the average basket is worth (average order value) and how many units it carries (basket depth). The orders table holds (order_id, order_date, revenue_cents) and order_items holds (item_id, order_id, qty), one row per basket line. Some order rows carry zero item rows — cancelled or test checkouts — and they must vanish from every column, because the items join DEFINES the basket (PINNED). Per month (strftime('%Y-%m') of order_date), report month, orders (the count of distinct orders WITH items), aov_cents = ROUND(AVG revenue over those orders, 0) and items_per_order = ROUND(1.0 * SUM(qty) / COUNT(DISTINCT order), 1) — the ratio of the month's total units to its basket count. ORDER BY month ascending.",
    examples: [
      {
        input:
          "July 2026 — three baskets with items: a 4500-cent order whose two lines carry 2 + 1 units, a 1200-cent single-line order, a 7800-cent order with two 2-unit lines; a fourth 999-cent order sits in orders with zero item rows",
        output: "2026-07 · 3 · 4500 · 2.7",
        explanation:
          "The 999-cent order never enters any column — the items join defines the basket — so orders reads 3, aov_cents = 13500 / 3 = 4500 and items_per_order = 8 units over 3 baskets = 2.6667, printed 2.7.",
      },
      {
        input:
          "September 2026 — a 1500-cent 1-unit order, a 90000-cent bulk order whose single line carries 12 units, a 3200-cent 3-unit order and a 2800-cent order with two 1-unit lines",
        output: "2026-09 · 4 · 24375 · 4.5",
        explanation:
          "The bulk basket skews both headlines: aov_cents = 97500 / 4 = 24375 and depth = 18 / 4 = 4.5 — exactly the skew numbers merchandising reads before a pricing change.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: revenue_cents is an INTEGER column, aov_cents reports INTEGER cents, and items_per_order is the only REAL in the output",
      "PINNED basket definition: the order_items join DEFINES the basket — an order with zero item rows is excluded from orders, aov_cents and items_per_order alike (INNER JOIN, never LEFT JOIN)",
      "PINNED formulas: orders = COUNT(DISTINCT order) over orders WITH items; aov_cents = ROUND(AVG(revenue over those orders), 0); items_per_order = ROUND(1.0 * SUM(qty) / COUNT(DISTINCT order), 1) — the ratio of the month's total units to its basket count",
      "months are strftime('%Y-%m') of order_date; ORDER BY month ASC",
    ],
    primer: {
      hook: "Every retail merchandising meeting opens with two numbers — what the average basket is worth and how many units it carries — and this problem computes both in one query.",
      concept: [
        "Average order value, AOV for short, is total revenue divided by the number of orders: if a store rings up 13500 cents across 3 orders, the average basket is worth 4500 cents. It is the first health metric of a retail P&L because it multiplies directly into revenue — traffic times conversion times AOV is the whole top line. AOV moves for two very different reasons: prices moved, or shoppers put more stuff in the cart, and a business that cannot tell those apart cannot steer either lever.",
        "That is why AOV never travels alone: basket depth, the average number of UNITS per order, separates the two stories. If AOV rises while depth stays flat, prices or mix got richer; if depth rises too, merchandising genuinely sold more items per visit. Cross-sell programs, bundles and free-shipping thresholds are all judged on depth, while price tests are judged on AOV — reading one without the other misattributes every win.",
        "The trap hiding under both numbers is the denominator: what exactly is an order? The honest definition here is behavioral — an order IS its item lines, so a row in orders with zero matching rows in order_items is a cancelled or test checkout, not a basket. The items join therefore DEFINES the basket (the pinned rule): inner-join first, and every count, average and ratio in the report is computed over baskets that actually exist.",
        "The second trap is line-weighting. Joining orders to order_items duplicates the order row once per line, so AVG(revenue) over the joined rows silently weighs a 3-line basket three times as much as a 1-line basket. The fix is to aggregate per ORDER first — one row per basket carrying its total units — and only then average across baskets. Likewise, depth is a ratio of sums (total units over basket count), not an average of per-basket numbers over some other population.",
      ],
      worked: [
        "July has four order rows but only three carry items: a 4500-cent basket with lines of 2 and 1 units, a 1200-cent basket with one line of 1 unit, and a 7800-cent basket with two lines of 2 units each — plus a 999-cent row with no items at all.",
        "The empty row drops at the join: baskets = 3 and revenue = 4500 + 1200 + 7800 = 13500 cents.",
        "AOV = 13500 / 3 = 4500 cents — no rounding needed at zero decimals.",
        "Units: 3 + 1 + 4 = 8 across the three baskets, so depth = 8 / 3 = 2.6667, printed 2.7 at one decimal.",
        "Had the 999-cent row been kept by a LEFT JOIN, AOV would read 14499 / 4 = 3624.75, rounded to 3625 — a basket that never existed, warping the month by 875 cents.",
      ],
      glossary: [
        { term: "average order value (AOV)", def: "total revenue divided by the number of orders, the worth of the typical basket" },
        { term: "basket depth", def: "average number of units per order, the how-many-items read" },
        { term: "line item", def: "one row in order_items: a single product line with its own quantity" },
        { term: "zero-item order", def: "an order row with no item lines — a cancelled or test checkout that is not a basket" },
        { term: "line-weighted average", def: "the wrong average that counts an order once per item line instead of once per basket" },
        { term: "ratio of sums", def: "total units divided by basket count, the pinned depth formula" },
      ],
      reallife: [
        "Merchandising and pricing teams at big-box and grocery retailers run this exact report monthly, usually straight off the transaction warehouse. Before any pricing change, the AOV and depth trend is the baseline they promise to protect; after a bundle launch, depth is the number that decides whether the bundle lived. Category managers also read the gap between mean and median basket value — one bulk order like this seed's 90000-cent basket can move a mean while leaving the typical shopper untouched.",
        "What breaks in practice is order hygiene, not arithmetic: test orders from staff devices, checkouts abandoned before payment but logged anyway, and returns posted as negative-quantity lines all contaminate the basket definition. The other classic failure is the line-weighted average — a report that looks plausible, ships for months, and quietly overweights multi-line baskets. The decisions downstream are real: pricing bands, bundle design, free-shipping thresholds and supplier negotiations all quote these two numbers.",
      ],
      where: "Merchandising analysts, pricing teams and category managers own these metrics at Walmart and Target, and SQL screens for retail analytics roles at both open with exactly this orders-to-items basket join.",
    },
    breakdown: [
      "The zero-item order is the whole exam. A 999-cent order row with no item lines is a checkout that never became a basket, and a LEFT JOIN keeps it in every aggregate: July then reads 4 orders and aov_cents 3625 (14499 / 4 = 3624.75 rounded) instead of 3 and 4500 — both pinned wrong values from this seed. The pinned rule says the items join DEFINES the basket, so the INNER JOIN is not a style choice, it is the contract. Every number downstream inherits whatever population the join admits, which is why the definition comes first in the constraints.",
      "The second trap is averaging over the join instead of over baskets. July's three baskets have 2, 1 and 2 lines, so the raw join holds 5 rows and AVG(revenue) over them reads 5160 (25800 / 5) while COUNT(order_id) reads 5 — a line-weighted report that weighs the 2-line baskets twice; September's numbers betray it even harder (5 rows, aov 20060 instead of 4 and 24375). The cure is a per-order CTE: GROUP BY the order once, carry its revenue and its total quantity, and the monthly layer then averages one row per basket. Depth stays a ratio of sums — SUM(qty) over COUNT(distinct basket) — so a two-line basket contributes its units, not its line count.",
      "The SQL shape is two small layers: a per-order CTE that inner-joins items, stamps the strftime month and sums qty; then a monthly GROUP BY producing COUNT(*) as orders (one row per basket makes the distinct count free), CAST(ROUND(AVG(revenue_cents), 0) AS INTEGER) for the money column, and ROUND(1.0 * SUM(order_qty) / COUNT(*), 1) for depth. The 1.0 literal forces float division before the round, and rounding happens only at the pinned places — 0 decimals for AOV, 1 for depth. Read the two outputs as a pair: September's 24375 against 4.5 units is a bulk-order month, August's 2525 against 2.0 is a normal one.",
    ],
    edges: [
      "LEFT JOIN keeps the 999-cent zero-item order and July reads orders 4 with aov_cents 3625 (14499 / 4 = 3624.75 rounded) instead of 3 and 4500 — the items join defines the basket, pinned.",
      "Averaging revenue over the RAW join rows weighs each basket by its line count: July reads orders 5 (item rows, not baskets) and aov_cents 5160 (25800 / 5) instead of 3 and 4500, and September reads 5 and 20060 (100300 / 5) instead of 4 and 24375 — pinned.",
      "Counting item ROWS instead of units: items_per_order reads 1.7, 1.0 and 1.3 for July through September (line counts 5/3, 4/4, 5/4) instead of 2.7, 2.0 and 4.5 — that measures basket lines, not basket depth, pinned.",
      "Averaging per-basket depths over a pool that includes the empty basket as zero reads July 2.0 (8 units over 4 orders) instead of 2.7 — the per-order average and the ratio of sums agree only on the same basket population, pinned.",
    ],
    ladder: [
      { title: "Brute force — eyeball one month on paper", body: "List the month's orders, cross out the ones without items, sum revenue, divide by the surviving count, then sum units and divide again. Three months of twelve orders is manageable; a year of a real catalog is not, and the cross-out step is exactly what the join automates." },
      { title: "The pattern — baskets first, months second", body: "Inner-join items onto orders, collapse to one row per basket with its total quantity and month, then run one monthly GROUP BY for COUNT, AVG and the ratio of sums. Two aggregation layers, each with a single job, no DISTINCT gymnastics." },
      { title: "The optimal idea — the join defines the population", body: "O(n) over the n item rows — one join pass and two grouped passes. The durable rules: the items join defines the basket, aggregate per order before averaging across orders, keep depth as SUM(qty) over basket count, and round only at the pinned decimals." },
    ],
    approach: "per-order CTE over the items INNER JOIN, then one monthly GROUP BY: COUNT(*) baskets, CAST(ROUND(AVG revenue, 0) AS INTEGER) aov, ROUND(1.0 * SUM(qty) / COUNT(*), 1) depth",
    schema: {
      ddl: `CREATE TABLE orders (
  order_id      INTEGER PRIMARY KEY,
  order_date    TEXT NOT NULL,      -- 'YYYY-MM-DD'
  revenue_cents INTEGER NOT NULL
);
CREATE TABLE order_items (
  item_id       INTEGER PRIMARY KEY,
  order_id      INTEGER NOT NULL,   -- one row per basket line
  qty           INTEGER NOT NULL    -- units carried on this line
);`,
      seed: `-- One quarter (2026-07 .. 2026-09). July carries the zero-item order
-- (999 cents, no lines), September carries the bulk basket (one line of
-- 12 units at 90000 cents). August is the plain baseline month.
INSERT INTO orders (order_id, order_date, revenue_cents) VALUES
  (1,  '2026-07-03',  4500),
  (2,  '2026-07-11',  1200),
  (3,  '2026-07-19',  7800),
  (4,  '2026-07-25',   999),  -- zero-item order: never a basket
  (5,  '2026-08-02',  2600),
  (6,  '2026-08-09',  3100),
  (7,  '2026-08-15',  2400),
  (8,  '2026-08-21',  2000),
  (9,  '2026-09-05',  1500),
  (10, '2026-09-12', 90000),  -- the bulk basket
  (11, '2026-09-19',  3200),
  (12, '2026-09-26',  2800);
INSERT INTO order_items (item_id, order_id, qty) VALUES
  (1, 1, 2), (2, 1, 1),        -- order 1: 3 units over 2 lines
  (3, 2, 1),                   -- order 2: 1 unit
  (4, 3, 2), (5, 3, 2),        -- order 3: 4 units over 2 lines
  (6, 5, 1),
  (7, 6, 3),
  (8, 7, 2),
  (9, 8, 2),
  (10, 9, 1),
  (11, 10, 12),
  -- order 10 is the bulk basket: 12 units on ONE line
  (12, 11, 3),
  -- order 12: 2 units over 2 lines
  (13, 12, 1), (14, 12, 1);`,
      tables: [
        { name: "orders", note: "12 orders across 2026-07..2026-09 — order 4 (999 cents) has zero item rows and must drop" },
        { name: "order_items", note: "14 basket lines — order 10 is the bulk basket (12 units on one line), orders 1, 3 and 12 are 2-line baskets" },
      ],
    },
    code: `WITH per_order AS (
    -- one row per basket: the INNER JOIN is the PINNED basket definition,
    -- so the zero-item order drops out before any aggregate sees it
    SELECT
        o.order_id,
        strftime('%Y-%m', o.order_date) AS month,
        o.revenue_cents,
        SUM(i.qty) AS order_qty
    FROM orders o
    JOIN order_items i ON i.order_id = o.order_id
    GROUP BY o.order_id, o.order_date, o.revenue_cents
)
SELECT
    month,
    COUNT(*) AS orders,                                            -- one row per basket: the distinct count for free
    CAST(ROUND(AVG(revenue_cents), 0) AS INTEGER) AS aov_cents,    -- money stays INTEGER cents
    ROUND(1.0 * SUM(order_qty) / COUNT(*), 1) AS items_per_order   -- the PINNED ratio of sums
FROM per_order
GROUP BY month
ORDER BY month ASC;`,
    walkthrough: [
      "The per_order CTE inner-joins order_items onto orders and collapses each basket to one row carrying its month, revenue and total units. Order 4 has no matching item rows, so the join erases it before anything aggregates; orders 1, 3 and 12 each collapse their two lines into one row with order_qty 3, 4 and 2; order 10 becomes a single row with order_qty 12. The CTE holds 11 rows — twelve orders minus the empty one — and the report's population is already fixed.",
      "The monthly GROUP BY then reads straight off those rows. July: baskets 1, 2, 3 — COUNT(*) 3, AVG(4500, 1200, 7800) = 13500 / 3 = 4500, units 8 over 3 = 2.6667 rounded to 2.7. August: four single-line baskets — 4, (2600 + 3100 + 2400 + 2000) / 4 = 2525, units 8 over 4 = 2.0. September: 4 baskets, (1500 + 90000 + 3200 + 2800) / 4 = 24375, units 18 over 4 = 4.5 — the bulk basket doubling the depth and multiplying the AOV.",
      "The engine ships three rows in month order: (2026-07, 3, 4500, 2.7), (2026-08, 4, 2525, 2.0) and (2026-09, 4, 24375, 4.5). The wrong variants are pinned from this seed: a LEFT JOIN July reads 4 and 3625, a line-weighted July reads 5 and 5160 (September 5 and 20060), and a line-count depth reads 1.7 / 1.0 / 1.3. Only items_per_order leaves the number line as a REAL — aov_cents is CAST back to INTEGER cents after the ROUND.",
    ],
    time: "O(n) over the n item rows — one join pass, one per-order GROUP BY, one monthly GROUP BY",
    space: "O(b) — one row per basket with items in the per_order CTE",
    followUps: [
      "Split AOV into its two drivers — report revenue per UNIT beside units per order, and check which of the two the September bulk basket actually moved.",
      "Add a big-basket share with a conditional SUM — what percent of each month's revenue sits in baskets above 20000 cents, and would a median basket tell a fairer story than the mean on this seed?",
    ],
    related: ["usage-tier-percentiles", "dau-wau-stickiness", "ab-test-conversion-lift"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "repeat-purchase-rate",
    statement:
      "The cheapest revenue a retailer earns is the second order, and repeat purchase rate says how often it happens. The orders table holds (order_id, customer_id, order_date); a month is the strftime('%Y-%m') of order_date. Per month, report month, customers = COUNT(DISTINCT customer_id) ordering that month, repeaters = the customers with COUNT(*) >= 2 orders IN that month (a buyer with four orders still counts once), and repeat_pct = ROUND(100.0 * repeaters / customers, 2) — the denominator is CUSTOMERS, never orders (PINNED). A customer buying in two different months is two independent monthly observations; there is no cross-month carryover. ORDER BY month ascending.",
    examples: [
      {
        input:
          "July 2026 — customer 1 orders on 07-02 and 07-18, customer 3 on 07-09 and 07-21, and customers 2, 4 and 5 order once each",
        output: "2026-07 · 5 · 2 · 40.0",
        explanation:
          "customers counts distinct buyers (5), repeaters counts buyers with 2 or more orders in the month (customers 1 and 3), and 100.0 * 2 / 5 = 40.0.",
      },
      {
        input:
          "August 2026 — the promo month: eight orders from seven distinct buyers; only customer 1 orders twice (08-08 and 08-27), everyone else once",
        output: "2026-08 · 7 · 1 · 14.29",
        explanation:
          "The promo pulled one-time deal hunters: 100.0 * 1 / 7 = 14.2857, printed 14.29 — the lowest repeat read of the quarter and the story the retention team tells.",
      },
    ],
    constraints: [
      "the orders table is the only input; month is strftime('%Y-%m') of order_date",
      "PINNED definitions: customers = COUNT(DISTINCT customer_id) ordering in the month; repeaters = customers with COUNT(*) >= 2 IN that month (four orders still count their buyer once); repeat_pct = ROUND(100.0 * repeaters / customers, 2) — the denominator is CUSTOMERS, never orders",
      "a customer ordering in two different months forms two independent monthly observations; there is no cross-month carryover",
      "ORDER BY month ASC",
    ],
    primer: {
      hook: "The cheapest revenue a retailer can earn is the second order — repeat purchase rate is the number that says how often it actually happens.",
      concept: [
        "Repeat purchase rate asks one question per month: of the people who bought from us, what share bought MORE THAN ONCE? If 5 customers placed 7 orders and 2 of them bought twice, the rate is 40 percent. It is a habit metric — the probability that a first visit turns into a pattern — and it behaves nothing like volume: a promo can double orders while halving the rate, because the new buyers it pulls are deal hunters who never return.",
        "The denominator is where every implementation goes wrong. The rate is about PEOPLE, so the base must be COUNT(DISTINCT customer_id) — the number of buyers — while the numerator counts buyers whose order count in the month reaches 2. Using orders as the base answers a different question (what share of ORDERS belong to repeat trips?) and always understates the habit read, because heavy buyers inflate the order count they are being divided by.",
        "Scope matters as much as the denominator. This pinned read is same-month repeat: a customer who buys in July and again in September contributes one non-repeat observation to July and one to September — there is no cross-month carryover. Cross-month comeback tracking exists (retention cohorts measure it), but it is a different report with different arithmetic; mixing the two scopes is how teams end up arguing about two numbers that were never the same metric.",
        "Why businesses defend this number: acquisition is expensive and the second order is where unit economics turn. Loyalty programs quote lift against it, promo post-mortems read it to separate habit buyers from one-time deal seekers, and a falling repeat rate with flat volume is often the first visible symptom that quality or delivery slipped before any survey says so. It is also the cheapest number in the building to move: a reminder email or a bundle costs nothing next to a new-customer campaign, which is why retention teams guard this metric so fiercely.",
      ],
      worked: [
        "July has seven orders from five buyers: buyer 1 orders twice, buyer 3 orders twice, buyers 2, 4 and 5 once each.",
        "customers = 5 (distinct people) — not 7, the order count.",
        "repeaters = buyers whose monthly order count reaches 2 — buyers 1 and 3, so 2. A buyer with four orders would still count once here.",
        "repeat_pct = 100.0 * 2 / 5 = 40.0.",
        "Using orders as the base would print 100.0 * 2 / 7 = 28.57 — the classic understatement this problem pins as a trap.",
      ],
      glossary: [
        { term: "repeat purchase rate", def: "the share of a month's buyers who placed two or more orders in that month" },
        { term: "repeater", def: "a buyer whose order count within the month is at least 2, counted once regardless of order volume" },
        { term: "one-time buyer", def: "a buyer with exactly one order in the month, the promo-month signature" },
        { term: "distinct customer count", def: "COUNT(DISTINCT customer_id), the people-denominator the pinned formula demands" },
        { term: "promo spike", def: "a volume jump from discounted one-time buyers that depresses the repeat rate" },
        { term: "HAVING", def: "the filter that runs AFTER grouping — applying it too early collapses the customer pool" },
      ],
      reallife: [
        "Retention and CRM analysts at frequency businesses — coffee chains, quick-service restaurants, grocery — run this monthly per market and per channel. A loyalty-card launch is approved on the promise of moving this number, and promo calendars are negotiated against it: a coupon that buys volume at a 14 percent repeat read is priced very differently from one that holds a 40. The metric also gates media spend — channels whose new buyers never repeat get cut even when their first-order volume looks great.",
        "What breaks in practice: duplicate customer ids from a signup glitch (one human counted twice deflates the rate), staff and test accounts ordering monthly, and refunds that delete the second order after the report ran. The decisions it drives are budget-sized — loyalty tiers, promo depth, CRM email frequency — so a denominator slip silently re-prices all of them. That is why the pinned convention counts people, not orders, and why a 4-order buyer still counts once.",
      ],
      where: "Retention, CRM and loyalty analytics teams own this metric at Starbucks and Chipotle, and SQL screens for those roles hand candidates exactly this orders-table repeat read.",
    },
    breakdown: [
      "The metric is a ratio over people, and every wrong variant is a denominator mistake in disguise. July: 7 orders, 5 buyers, 2 repeaters — the correct row reads 5, 2, 40.0. Counting orders as customers (COUNT(customer_id) without DISTINCT over the raw rows) inflates the base to 7 and drops the read to 28.57; dividing repeaters by orders while keeping the customer column prints 28.57 beside a truthful 5. Both wrong values are pinned from this seed, and both trace to the same root: the rate asks about buyers, so only buyer rows may enter the fraction.",
      "The clean implementation makes the mistake structurally impossible: a monthly CTE groups orders once per (month, customer) and keeps COUNT(*) as order_cnt. Over that CTE, COUNT(*) IS the distinct customer count — one row per buyer — and repeaters is a conditional SUM of a 1/0 flag on order_cnt >= 2. The HAVING trap dies here too: filtering the CTE with HAVING COUNT(*) >= 2 before the outer aggregate collapses each month's pool to its repeaters, and every month prints 100.0 (July 2 of 2, August 1 of 1, September 1 of 1) — pinned wrong values that look like a perfect business.",
      "Month-scoping is the third axis. A buyer active in two months is two independent observations — customer 1 is a repeater in July, a one-time buyer in August and invisible in September; no state carries across the strftime boundary. Forgetting the month GROUP BY entirely collapses the quarter into one row: 10 customers, 6 of whom reach 2 or more orders across the window (customers 1, 2, 3, 4, 5 and 10), printing 60.0 — a cross-window number wearing the same column names, pinned as the fourth trap. Rounding runs once, at the end, at 2 decimals, on the RAW fraction.",
    ],
    edges: [
      "Counting ORDERS as customers: July reads 7 customers and repeat_pct 28.57 (2 of 7) instead of 5 and 40.0, and August reads 8 and 12.5 instead of 7 and 14.29 — the base is people, pinned.",
      "Dividing by orders while keeping the customer column: August prints 12.5 (1 of 8 orders) in the slot where 14.29 belongs while customers still reads 7, and July prints 28.57 beside a truthful 5 — pinned.",
      "Filtering repeaters with HAVING COUNT(*) >= 2 before the denominator collapses every pool: each month reads repeaters equal to customers and repeat_pct 100.0 (July 2 of 2, August 1 of 1, September 1 of 1) instead of 40.0, 14.29 and 25.0 — pinned.",
      "Dropping the month grouping collapses the quarter to ONE row: 10 customers, 6 repeaters (customers 1, 2, 3, 4, 5 and 10 all reach 2 or more orders across the window) and 60.0 instead of three monthly rows — pinned.",
    ],
    ladder: [
      { title: "Brute force — tally buyers on paper", body: "For each month, list the buyers, tally each buyer's orders, circle the ones at 2 or more, then divide. Honest and slow, and it breaks the moment someone asks for the same read per store or per channel." },
      { title: "The pattern — counts first, then one conditional SUM", body: "Group orders once per month and customer, keep the per-buyer count, then aggregate: COUNT(*) for customers, SUM of a case flag for repeaters, one rounded division. Two passes, no self-join, no DISTINCT on the outer layer." },
      { title: "The optimal idea — keep the denominator whole", body: "O(n) over the n order rows — one grouped pass and one aggregate pass. The durable rules: the base is distinct buyers, repeaters are counted from the same unfiltered pool, months never share state, and the fraction rounds once at the end." },
    ],
    approach: "per-customer-per-month COUNT CTE, then monthly COUNT(*) customers, conditional-SUM repeaters, ROUND(100.0 * repeaters / customers, 2)",
    schema: {
      ddl: `CREATE TABLE orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date  TEXT NOT NULL        -- 'YYYY-MM-DD', month = strftime('%Y-%m')
);`,
      seed: `-- One quarter (2026-07 .. 2026-09). July is the habit month (2 of 5
-- buyers repeat, 40.0), August the promo month (7 buyers, 8 orders, one
-- repeater — 14.29), September steady with customer 3 ordering 4 times
-- (still one repeater). Ten customers in total, several active in
-- multiple months.
INSERT INTO orders (order_id, customer_id, order_date) VALUES
  (1,  1,  '2026-07-02'),
  (2,  2,  '2026-07-05'),
  (3,  3,  '2026-07-09'),
  (4,  4,  '2026-07-14'),
  (5,  1,  '2026-07-18'),
  (6,  3,  '2026-07-21'),
  (7,  5,  '2026-07-25'),
  (8,  6,  '2026-08-01'),
  (9,  1,  '2026-08-08'),
  (10, 7,  '2026-08-10'),
  (11, 8,  '2026-08-15'),
  (12, 2,  '2026-08-19'),
  (13, 9,  '2026-08-22'),
  (14, 1,  '2026-08-27'),
  (15, 10, '2026-08-29'),
  (16, 3,  '2026-09-03'),
  (17, 4,  '2026-09-06'),
  (18, 10, '2026-09-11'),
  (19, 3,  '2026-09-12'),
  (20, 5,  '2026-09-18'),
  (21, 3,  '2026-09-20'),
  -- customer 3: 4 orders this month, still one repeater
  (22, 3,  '2026-09-28');`,
      tables: [
        { name: "orders", note: "22 orders, 10 customers, 3 months — July 7 orders / 5 buyers, August 8 / 7 (promo), September 7 / 4 with customer 3 ordering 4 times" },
      ],
    },
    code: `WITH monthly AS (
    -- one row per customer per month: how many orders that buyer placed
    -- in that month alone (no cross-month carryover)
    SELECT
        strftime('%Y-%m', order_date) AS month,
        customer_id,
        COUNT(*) AS order_cnt
    FROM orders
    GROUP BY month, customer_id
)
SELECT
    month,
    COUNT(*) AS customers,                                        -- one row per buyer: DISTINCT for free
    SUM(CASE WHEN order_cnt >= 2 THEN 1 ELSE 0 END) AS repeaters, -- counted from the WHOLE pool
    ROUND(100.0 * SUM(CASE WHEN order_cnt >= 2 THEN 1 ELSE 0 END)
        / COUNT(*), 2) AS repeat_pct                              -- denominator is CUSTOMERS (pinned)
FROM monthly
GROUP BY month
ORDER BY month ASC;`,
    walkthrough: [
      "The monthly CTE folds 22 order rows into 16 customer-month rows: July holds buyers 1 (2 orders), 2, 3 (2), 4 and 5; August holds buyers 6, 1 (2), 7, 8, 2, 9 and 10; September holds buyer 3 with 4 orders plus buyers 4, 10 and 5. Customer 1 shows how the scoping works — a repeater in July, a one-time buyer in August, invisible in September. Nothing has been filtered — every buyer of the month is present exactly once, which is what keeps the denominator whole.",
      "The outer GROUP BY then reads one number per month off those rows. July: COUNT(*) 5 customers, the case flag sums to 2 repeaters, 100.0 * 2 / 5 = 40.0. August: 7 customers, 1 repeater (buyer 1), 100.0 * 1 / 7 = 14.2857 rounded to 14.29 — the promo story. September: 4 customers, 1 repeater (buyer 3, whose four orders still count once), 100.0 * 1 / 4 = 25.0.",
      "The engine ships three rows: (2026-07, 5, 2, 40.0), (2026-08, 7, 1, 14.29) and (2026-09, 4, 1, 25.0). The pinned wrong variants: orders-as-customers reads July 7 / 28.57 and August 8 / 12.5, the orders-denominator prints 12.5 in August with customers still 7, the HAVING-collapse prints 100.0 in all three months, and the monthless rollup prints one row (10, 6, 60.0). Only repeat_pct is REAL; customers and repeaters stay INTEGER.",
    ],
    time: "O(n) over the n order rows — one grouped pass for customer-months, one aggregate pass per month",
    space: "O(c) — one row per customer-month pair in the monthly CTE",
    followUps: [
      "Add revenue to the table and build the repeat REVENUE share — are the promo month's one-time buyers worth more per head than the habit buyers, and does the money read contradict the people read?",
      "Build the cross-month cousin — for each month, the share of PRIOR-month buyers who order again within 30 days, and compare that cohort read against the same-month rate pinned here.",
    ],
    related: ["dau-wau-stickiness", "cohort-retention-matrix", "week-over-week-churn"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "rfm-segmentation",
    statement:
      "RFM is marketing's classic segmentation: score every customer on Recency (days since their last order), Frequency (order count) and Monetary (total spend), cut each axis into quintiles with NTILE, and map the three tile scores to one named segment. The orders table holds (order_id, customer_id, order_date, revenue_cents) and the as-of date is PINNED at 2026-09-30, so recency_days = CAST(julianday('2026-09-30') - julianday(MAX(order_date)) AS INTEGER). Per customer report customer_id, recency_days, frequency = COUNT(*), monetary_cents = SUM(revenue_cents), then the three tile scores with PINNED directions: r = NTILE(5) OVER (ORDER BY recency_days DESC) so the most-recent customers land in tile 5, f = NTILE(5) OVER (ORDER BY frequency ASC) and m = NTILE(5) OVER (ORDER BY monetary_cents ASC) so the most frequent and the biggest spenders land in tile 5. Map tiles to segments with the PINNED first-match-wins ladder: r >= 4 AND f >= 4 AND m >= 4 is champion; r >= 4 AND f >= 4 is loyal; r >= 4 is promising; r <= 2 AND f >= 4 is at risk; r <= 2 is hibernating; anything else is core. The seed carries exactly 12 customers, so NTILE(5) deals tile sizes 3, 3, 2, 2, 2 with the remainder in the FIRST tiles. ORDER BY customer_id ascending.",
    examples: [
      {
        input:
          "customer 1 — twelve orders of 13500 cents each, the latest on 2026-09-28; the seed's 12 customers give NTILE(5) tile sizes 3, 3, 2, 2, 2",
        output: "1 · 2 · 12 · 162000 · 5 · 5 · 5 · champion",
        explanation:
          "Recency 2 days is the second-smallest of 12 (tile 5 on the DESC order), frequency 12 and monetary 162000 are the largest (tile 5 on both ASC orders), so r 5 f 5 m 5 clears every champion gate.",
      },
      {
        input:
          "customer 3 — ten small orders of 420 cents each, the latest on 2026-09-21, totalling 4200 cents",
        output: "3 · 9 · 10 · 4200 · 4 · 4 · 1 · loyal",
        explanation:
          "Recency 9 and frequency 10 both sit in tile 4, but 4200 cents is the SMALLEST monetary of all 12 customers (tile 1), so the champion rule fails its m gate and the loyal row catches the customer — that gate is what keeps low-spend regulars out of champion.",
      },
    ],
    constraints: [
      "all money is INTEGER cents: revenue_cents and monetary_cents are integers; recency_days, frequency, r, f and m are INTEGERs and segment is the only TEXT column in the output",
      "PINNED as-of date '2026-09-30': recency_days = CAST(julianday('2026-09-30') - julianday(MAX(order_date)) AS INTEGER)",
      "PINNED tile directions: r = NTILE(5) OVER (ORDER BY recency_days DESC) so the most-recent customers land in tile 5; f = NTILE(5) OVER (ORDER BY frequency ASC) and m = NTILE(5) OVER (ORDER BY monetary_cents ASC) so the most frequent and the biggest spenders land in tile 5; 12 customers deal tile sizes 3, 3, 2, 2, 2",
      "PINNED segment ladder, first match wins: r >= 4 AND f >= 4 AND m >= 4 is champion; r >= 4 AND f >= 4 is loyal; r >= 4 is promising; r <= 2 AND f >= 4 is at risk; r <= 2 is hibernating; else core; ORDER BY customer_id ASC",
    ],
    primer: {
      hook: "RFM is the forty-year-old three-number score that still decides who gets the win-back email, who gets the VIP treat, and who gets left alone.",
      concept: [
        "Every customer summarizes into three numbers. Recency: how many days since their last order — small is hot, large is cold. Frequency: how many orders they have placed — a habit read. Monetary: how much they have spent in total — a value read. Any single axis misleads (a big spender who vanished, a frequent buyer of tiny items), and RFM's whole trick is reading the three TOGETHER as a coordinate that locates the customer on a map of the business.",
        "Raw values are incomparable across businesses, so each axis is cut into quintiles — five equal-ish buckets scored 1 through 5. SQL deals the buckets with NTILE(5) OVER (ORDER BY ...): the ordered rows are dealt like cards into 5 tiles, and with 12 rows the sizes run 3, 3, 2, 2, 2 because the remainder lands in the FIRST tiles. Directions are a convention you must pin: here r sorts recency DESCENDING so the most-recent customers land in tile 5, while f and m sort ASCENDING so the most frequent and biggest spenders land in tile 5 — 5 is always best.",
        "The 125 possible r-f-m combinations collapse into a handful of named segments through a first-match-wins CASE ladder, and ladder ORDER is logic, not style. Champion (r, f and m all 4+) is the head of the list; loyal is recent and frequent but not top-spend — the m gate is what keeps a low-spend regular out of champion; promising is recent but infrequent; at risk is stale but was frequent; hibernating is stale and infrequent; core catches the middle. Swap two rows of the ladder and customers silently change campaigns.",
        "Each segment maps to an action: champions get recognition and early access, loyal customers get cross-sell, promising ones get a second-visit nudge, at-risk customers get the win-back offer while there is still time, hibernating ones get cheap reactivation only. The scores are relative to YOUR customer base — a tile 5 recency in a weekly-grocery business is days, in a furniture store months — which is exactly why the quintile cut, not raw thresholds, is the standard. And because the cut is relative, the same query re-runs every period and the segments re-shuffle as the base changes: a customer can slide from champion to core without changing their own behavior at all.",
      ],
      worked: [
        "Five customers make the hand math exact: NTILE(5) over 5 rows deals tile sizes 1, 1, 1, 1, 1 — one customer per tile.",
        "Recencies run 3, 10, 25, 60 and 120 days; sorted DESCENDING the tiles go 120, 60, 25, 10, 3, so the 3-day customer reads r 5 and the 120-day customer r 1.",
        "Frequencies run 1, 2, 3, 6, 9 and monetaries 4000, 9000, 20000, 45000, 120000 cents; both sort ASCENDING, so the most frequent and biggest spender read f 5 and m 5.",
        "Customer A (3 days, 9 orders, 120000 cents) reads r 5 f 5 m 5 and the first ladder row names them champion; customer B (10 days, 6 orders, 9000 cents) reads r 4 f 4 but m 2 — the champion gate fails and loyal catches them.",
        "Customer E spent 45000 cents (m 4) but last ordered 120 days ago (r 1): hibernating, not champion — money without recency never reaches the top of the ladder.",
      ],
      glossary: [
        { term: "recency", def: "days since the customer's last order, measured against a pinned as-of date" },
        { term: "frequency", def: "the customer's total order count in the window" },
        { term: "monetary", def: "the customer's total spend in the window" },
        { term: "NTILE", def: "a window function dealing ordered rows into N near-equal tiles, remainder tiles first" },
        { term: "quintile", def: "one of five equal-ish buckets of a scored axis, labeled 1 through 5" },
        { term: "first match wins", def: "the CASE ladder rule — the FIRST true row assigns the segment, so order is logic" },
      ],
      reallife: [
        "CRM and lifecycle teams at beauty, apparel and specialty retail run RFM monthly, typically inside the email platform: each segment is a saved query feeding a campaign. Champions get early access and recognition, at-risk customers get the win-back discount while the relationship is warm, hibernating customers get cheap reactivation only — the whole point of the segmentation is that different coordinates deserve different spend. Sephora's and Nike's loyalty stacks are famous expressions of exactly this map.",
        "What breaks in practice: ties at tile boundaries (two customers with identical spend straddling tiles 3 and 4 make the cut nondeterministic — this seed keeps every axis key distinct), refunds distorting monetary after the fact, and as-of drift, where one team scores against today and another against month-end and the segments never reconcile. The decisions are budget-allocation sized — which segment gets the discount, which gets nothing — so a flipped NTILE direction does not just move labels, it moves money. Teams therefore freeze the as-of date, pin the tile directions in the query itself, and keep a changelog for the ladder text, exactly the conventions this problem pins.",
      ],
      where: "CRM, lifecycle and loyalty marketers run RFM at Sephora and Nike, and SQL screens for retail and subscription analytics use exactly this NTILE-plus-CASE segmentation shape.",
    },
    breakdown: [
      "Three aggregates build the raw scores: recency is as-of minus MAX(order_date) in days, frequency is COUNT(*), monetary is SUM(revenue_cents) — all against the pinned as-of 2026-09-30. Then NTILE(5) turns each axis into a 1-to-5 score. The tile arithmetic on this seed is the heart of the problem: 12 rows into 5 tiles is 12 = 5 * 2 + 2, so every tile gets 2 rows and the first 2 tiles get one extra — sizes 3, 3, 2, 2, 2. On the r axis (DESC) that deals tile 1 the three coldest customers (recencies 151, 104, 82), tile 2 the next three (67, 53, 41), tile 3 the middle two (27, 20), tile 4 (14, 9) and tile 5 the two hottest (5, 2).",
      "The ladder is order-sensitive and the m gate is its sharpest edge. Customers 1 and 2 read r 5 f 5 m 5 and clear all three champion gates; customer 3 reads r 4 f 4 but m 1 (4200 cents is the smallest spend of the twelve), so the champion row fails and loyal catches it — drop the m gate and customer 3 is promoted to champion, a low-spend regular re-labeled as a VIP (pinned wrong value). Customer 5 reads r 4 with f 3, so it falls through champion and loyal into promising. Under the pinned ladder the coverage lands as: 2 champions, 1 loyal, 1 promising, 1 at risk, 5 hibernating, 2 core — the stale tiles are large, so hibernating sweeps every stale customer below frequency tile 4.",
      "The stale side of the ladder splits the 6 coldest customers by frequency: customer 4 (r 2, f tile 4) is the one at-risk read; the other five (r 2 or 1, f tile 3 or below) are hibernating. Core only reaches r exactly 3 — customers 6 and 7. Two build rules keep the output honest. First-match-wins means the ladder order is logic: the stale rows sit BELOW the recent ones on purpose, and dropping them entirely (an ELSE core where they belong) re-brands customer 4 as core while hibernating ships 0 rows — pinned. And NTILE needs distinct keys: this seed keeps all 12 recencies, frequencies and monetaries distinct, so every tile boundary is deterministic.",
    ],
    edges: [
      "Flip the r direction (ORDER BY recency_days ASC) and the champions vanish: customers 1 and 2 land in tile 1 and read at risk (r <= 2 with f >= 4) while customers 9 through 12 read promising — champion count 0 instead of 2, pinned.",
      "Drop the stale branches (an ELSE core sitting where they belong) and customer 4 reads core instead of at risk while hibernating ships 0 rows and core ships 8 — first match wins is load-bearing, pinned.",
      "Remove the m gate from the champion rule and low-spend customer 3 (m tile 1, 4200 cents) reads champion instead of loyal — champion count 3, loyal count 0, pinned.",
      "Switch to quartiles (NTILE(4), tile sizes 3, 3, 3, 3) and customer 4 falls to f tile 3, reading hibernating instead of at risk, while customer 5 falls to r tile 3 and reads core instead of promising — pinned.",
    ],
    ladder: [
      { title: "Brute force — sort and deal by hand", body: "Write the 12 customers on cards, sort by recency and deal into five piles, repeat for frequency and spend, then look up each r-f-m triple in the ladder table. One pass teaches the mechanics; doing it next month, or for 10 million customers, is what the windows automate." },
      { title: "The pattern — aggregate, tile, ladder", body: "One CTE per stage: per-customer aggregates, then three NTILE(5) window scores over the pinned orderings, then a first-match CASE for the segment. Each stage is independently checkable, which is how tile-boundary bugs get caught." },
      { title: "The optimal idea — pin directions, keep keys distinct", body: "O(n) to aggregate the orders plus one sort per window over the customers. The durable rules: 5 is always best (r DESC, f and m ASC), the ladder order is logic, distinct axis keys make tiles deterministic, and every stage reads from the same as-of date." },
    ],
    approach: "per-customer RFM aggregate, three NTILE(5) window scores with pinned directions, first-match CASE ladder, ORDER BY customer_id",
    schema: {
      ddl: `CREATE TABLE orders (
  order_id      INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  order_date    TEXT NOT NULL,      -- 'YYYY-MM-DD'
  revenue_cents INTEGER NOT NULL
);`,
      seed: `-- 12 customers, 78 orders, all activity on or before 2026-09-28.
-- Per-customer design (frequency / last order / total cents):
--   c1  12 orders, ends 2026-09-28, 162000  -> champion
--   c2  11 orders, ends 2026-09-25, 148500  -> champion
--   c3  10 orders, ends 2026-09-21,   4200  -> loyal (frequent, tiny baskets)
--   c4   9 orders, ends 2026-08-20,  41500  -> at risk (frequent, gone stale)
--   c5   8 orders, ends 2026-09-16,  22600  -> promising
--   c6   7 orders, ends 2026-09-10,  34200  -> core
--   c7   6 orders, ends 2026-09-03,  28900  -> core
--   c8   5 orders, ends 2026-08-08,  18700  -> hibernating
--   c9   4 orders, ends 2026-07-25,  15800  -> hibernating
--   c10  3 orders, ends 2026-07-10,  12400  -> hibernating
--   c11  2 orders, ends 2026-06-18,   9100  -> hibernating
--   c12  1 order,  ends 2026-05-02,   6800  -> hibernating
-- All recency, frequency and monetary values are distinct, so every
-- NTILE boundary is deterministic.
INSERT INTO orders (order_id, customer_id, order_date, revenue_cents) VALUES
  -- c1: the 28th of every month 2025-10 .. 2026-09, 13500 each (12 x 13500 = 162000)
  (1, 1, '2025-10-28', 13500), (2, 1, '2025-11-28', 13500), (3, 1, '2025-12-28', 13500),
  (4, 1, '2026-01-28', 13500), (5, 1, '2026-02-28', 13500), (6, 1, '2026-03-28', 13500),
  (7, 1, '2026-04-28', 13500), (8, 1, '2026-05-28', 13500), (9, 1, '2026-06-28', 13500),
  (10, 1, '2026-07-28', 13500), (11, 1, '2026-08-28', 13500), (12, 1, '2026-09-28', 13500),
  -- c2: the 25th of every month 2025-11 .. 2026-09, 13500 each (11 x 13500 = 148500)
  (13, 2, '2025-11-25', 13500), (14, 2, '2025-12-25', 13500), (15, 2, '2026-01-25', 13500),
  (16, 2, '2026-02-25', 13500), (17, 2, '2026-03-25', 13500), (18, 2, '2026-04-25', 13500),
  (19, 2, '2026-05-25', 13500), (20, 2, '2026-06-25', 13500), (21, 2, '2026-07-25', 13500),
  (22, 2, '2026-08-25', 13500), (23, 2, '2026-09-25', 13500),
  -- c3: the 21st of every month 2025-12 .. 2026-09, 420 each (10 x 420 = 4200)
  (24, 3, '2025-12-21', 420), (25, 3, '2026-01-21', 420), (26, 3, '2026-02-21', 420),
  (27, 3, '2026-03-21', 420), (28, 3, '2026-04-21', 420), (29, 3, '2026-05-21', 420),
  (30, 3, '2026-06-21', 420), (31, 3, '2026-07-21', 420), (32, 3, '2026-08-21', 420),
  (33, 3, '2026-09-21', 420),
  -- c4: the 20th of every month 2025-12 .. 2026-08, 4500 each except the last 5500 (41500)
  (34, 4, '2025-12-20', 4500), (35, 4, '2026-01-20', 4500), (36, 4, '2026-02-20', 4500),
  (37, 4, '2026-03-20', 4500), (38, 4, '2026-04-20', 4500), (39, 4, '2026-05-20', 4500),
  (40, 4, '2026-06-20', 4500), (41, 4, '2026-07-20', 4500), (42, 4, '2026-08-20', 5500),
  -- c5: the 16th of every month 2026-02 .. 2026-09, 2825 each (8 x 2825 = 22600)
  (43, 5, '2026-02-16', 2825), (44, 5, '2026-03-16', 2825), (45, 5, '2026-04-16', 2825),
  (46, 5, '2026-05-16', 2825), (47, 5, '2026-06-16', 2825), (48, 5, '2026-07-16', 2825),
  (49, 5, '2026-08-16', 2825), (50, 5, '2026-09-16', 2825),
  -- c6: the 10th of every month 2026-03 .. 2026-09, 4900 each except the last 4800 (34200)
  (51, 6, '2026-03-10', 4900), (52, 6, '2026-04-10', 4900), (53, 6, '2026-05-10', 4900),
  (54, 6, '2026-06-10', 4900), (55, 6, '2026-07-10', 4900), (56, 6, '2026-08-10', 4900),
  (57, 6, '2026-09-10', 4800),
  -- c7: the 3rd of every month 2026-04 .. 2026-09, 4800 each except the first 4900 (28900)
  (58, 7, '2026-04-03', 4900), (59, 7, '2026-05-03', 4800), (60, 7, '2026-06-03', 4800),
  (61, 7, '2026-07-03', 4800), (62, 7, '2026-08-03', 4800), (63, 7, '2026-09-03', 4800),
  -- c8: the 8th of every month 2026-04 .. 2026-08, 3740 each (5 x 3740 = 18700)
  (64, 8, '2026-04-08', 3740), (65, 8, '2026-05-08', 3740), (66, 8, '2026-06-08', 3740),
  (67, 8, '2026-07-08', 3740), (68, 8, '2026-08-08', 3740),
  -- c9: the 25th of every month 2026-04 .. 2026-07, 3950 each (4 x 3950 = 15800)
  (69, 9, '2026-04-25', 3950), (70, 9, '2026-05-25', 3950), (71, 9, '2026-06-25', 3950),
  (72, 9, '2026-07-25', 3950),
  -- c10: three orders (4000 + 4200 + 4200 = 12400)
  (73, 10, '2026-05-10', 4000), (74, 10, '2026-06-10', 4200), (75, 10, '2026-07-10', 4200),
  -- c11: two orders (4500 + 4600 = 9100)
  (76, 11, '2026-05-18', 4500), (77, 11, '2026-06-18', 4600),
  -- c12: one order
  (78, 12, '2026-05-02', 6800);`,
      tables: [
        { name: "orders", note: "78 orders from 12 customers — recency days run 2, 5, 9, 14, 20, 27, 41, 53, 67, 82, 104, 151 and frequencies run 12 down to 1, all distinct so NTILE boundaries are deterministic" },
      ],
    },
    code: `WITH per_customer AS (
    -- one row per customer: the three raw RFM aggregates against the
    -- PINNED as-of date 2026-09-30
    SELECT
        customer_id,
        CAST(julianday('2026-09-30') - julianday(MAX(order_date)) AS INTEGER) AS recency_days,
        COUNT(*) AS frequency,
        SUM(revenue_cents) AS monetary_cents
    FROM orders
    GROUP BY customer_id
),
scored AS (
    -- PINNED directions: r sorts recency DESC so the most-recent land in
    -- tile 5, f and m sort ASC so the most frequent and biggest spenders
    -- land in tile 5. 12 rows deal NTILE(5) sizes 3, 3, 2, 2, 2.
    SELECT
        customer_id,
        recency_days,
        frequency,
        monetary_cents,
        NTILE(5) OVER (ORDER BY recency_days DESC) AS r,
        NTILE(5) OVER (ORDER BY frequency ASC) AS f,
        NTILE(5) OVER (ORDER BY monetary_cents ASC) AS m
    FROM per_customer
)
SELECT
    customer_id,
    recency_days,
    frequency,
    monetary_cents,
    r,
    f,
    m,
    -- PINNED ladder, first match wins: the m gate keeps low-spend
    -- regulars out of champion, and the stale branches sit BELOW the
    -- recent ones on purpose
    CASE
        WHEN r >= 4 AND f >= 4 AND m >= 4 THEN 'champion'
        WHEN r >= 4 AND f >= 4 THEN 'loyal'
        WHEN r >= 4 THEN 'promising'
        WHEN r <= 2 AND f >= 4 THEN 'at risk'
        WHEN r <= 2 THEN 'hibernating'
        ELSE 'core'
    END AS segment
FROM scored
ORDER BY customer_id ASC;`,
    walkthrough: [
      "The per_customer CTE folds 78 orders into 12 rows, and the seed design makes every aggregate hand-checkable: customer 1 is 12 orders of 13500 ending 2026-09-28 (recency 2, frequency 12, monetary 162000), customer 3 is 10 orders of 420 ending 2026-09-21 (9, 10, 4200), customer 4 is 8 orders of 4500 plus a 5500 ending 2026-08-20 (41, 9, 41500), down to customer 12 with a single 6800-cent order on 2026-05-02 (151, 1, 6800). The tile arithmetic then runs three times. On r (DESC), sorted recencies 151, 104, 82, 67, 53, 41, 27, 20, 14, 9, 5, 2 deal as tiles (12, 11, 10), (9, 8, 4), (7, 6), (5, 3), (2, 1) — sizes 3, 3, 2, 2, 2 with the remainder tiles first.",
      "On f (ASC), frequencies 1 through 12 deal as (12, 11, 10), (9, 8, 7), (6, 5), (4, 3), (2, 1) — so customers 4, 3, 2, 1 carry f 4 or 5 and everyone else sits at 3 or below. On m (ASC), sorted monetaries 4200, 6800, 9100, 12400, 15800, 18700, 22600, 28900, 34200, 41500, 148500, 162000 deal as (3, 12, 11), (10, 9, 8), (5, 7), (6, 4), (2, 1) — the two champions are the only 162000 and 148500, and customer 3's 4200 is the smallest monetary in the base. No axis has a tie, so all three dealings are deterministic.",
      "The ladder then reads each r-f-m triple top down. Customers 1 and 2 (5, 5, 5) clear all three gates: champion. Customer 3 (4, 4, 1) fails the champion m gate: loyal. Customer 5 (4, 3, 3) fails f: promising. Customer 4 (2, 4, 4) fails the recent rows but clears r <= 2 with f >= 4: at risk. Customers 8 through 12 sit r <= 2 with f <= 3: hibernating, five of them. Customers 6 and 7 read r 3, matching nothing until ELSE: core. The engine ships 12 rows in customer order — champion twice, loyal, at risk, promising, core twice, hibernating five times — and the pinned wrong variants each move a named customer: flipped r sends 1 and 2 to at risk, the dropped stale branches send 4 to core, the removed m gate promotes 3 to champion, and NTILE(4) demotes 4 to hibernating and 5 to core.",
    ],
    time: "O(n + c log c) — one pass to aggregate the n orders, then one sort per window function over the c customers",
    space: "O(c) — one row per customer at each CTE level",
    followUps: [
      "Add a fourth axis — tenure, the days since each customer's FIRST order — and decide which ladder rules it should gate; does any champion turn out to be a brand-new account?",
      "Swap NTILE for PERCENT_RANK or CUME_DIST buckets and check which customers change segments — the boundaries move when bucketing keys tie or the customer count is prime.",
    ],
    related: ["usage-tier-percentiles", "cohort-retention-matrix", "ab-test-conversion-lift"],
    order: "exact",
    xp: 20,
  },
];
