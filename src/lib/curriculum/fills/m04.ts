// Fill drills for Module 4 — subqueries & CTEs (lessons 25-28 + capstone 38).
// See m01.ts for the golden example: template slots {1}..{n}, answers[i]
// completes slot i+1, every completed SQL must run on the seed db.
// Facts quoted in `why`/notes were verified against the seed: catalog avg
// 71.78 (6 products above), 7 cancelled orders / 4 customers, 12 Electronics
// buyers, 45 orders above their own household bar, 8 spenders over 1000,
// region spends EU 15089.23 / APAC 11605.45 / US 7286.16 / LATAM 852.44,
// avg customer spend 2177.08 vs avg order 338.19 (5 VIPs), veterans
// Alice/Emma/Maya, pending holders 8.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 25 — Subqueries inside WHERE — ask in two steps
  25: [
    {
      id: "l25-f1",
      prompt: "List the products priced above the catalog average — computed live, never hardcoded.",
      template: "SELECT name, price\nFROM products\nWHERE price > (SELECT {1}(price) FROM {2});",
      chips: ["AVG", "SUM", "MAX", "products", "orders", "customers"],
      answers: ["AVG", "products"],
      why: "The inner query averages all 16 catalog prices into one number — 71.78 on this seed — and the outer query keeps the six products that clear it. An aggregate is what guarantees the subquery returns exactly one row, which is what makes the comparison legal.",
      notes: [
        { slot: 1, why: "SUM would add the prices into a total no single price can beat (zero rows); MAX sets the bar at the priciest product, so nothing qualifies. The question asks for the average." },
        { slot: 2, why: "orders has no price column — that crash is the `misuse of aggregate: AVG()` report. The average must come from the table that stores prices." },
      ],
    },
    {
      id: "l25-f2",
      prompt: "Which customers have a cancelled order on their record? Answer with a membership test over the cancelled list.",
      template: "SELECT name\nFROM customers\nWHERE id {1} (SELECT {2} FROM orders WHERE status = 'cancelled')\nORDER BY name;",
      chips: ["IN", "NOT IN", "=", "customer_id", "id", "status"],
      answers: ["IN", "customer_id"],
      why: "The inner query lists the customer_ids on the seven cancelled orders, and IN keeps every customer whose id is on that list — four of them. Duplicates in the list are harmless: IN is a membership test, not a counter.",
      notes: [
        { slot: 1, why: "NOT IN answers the opposite crowd — the twelve customers with a clean record. And `=` wants exactly one value on the right; the list holds seven ids (PostgreSQL throws, SQLite quietly keeps the first)." },
        { slot: 2, why: "orders.id numbers the orders, not the customers — the membership list must be customer_id, the column that points back at customers.id." },
      ],
    },
    {
      id: "l25-f3",
      prompt: "A teammate's above-average report crashes with `misuse of aggregate: AVG()` — their inner query scans a table with no prices. Pick the chip that puts the right table inside the subquery.",
      template: "SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM {1});",
      chips: ["products", "orders", "customers", "suppliers", "order_items"],
      answers: ["products"],
      why: "The bar is the catalog's own average, so the inner query must read products — the only table with a price column. Every other chip leaves price unresolvable inside the subquery, which is exactly the crash quoted in the prompt.",
      notes: [
        { slot: 1, why: "order_items comes closest — it has unit_price, not price — but the average of sticker prices lives on products. Run the inner query alone first: if it doesn't return one number by itself, the wrapped version can't be right." },
      ],
    },
    {
      id: "l25-f4",
      prompt: "Which customers have ever bought something from the Electronics category? The three-table walk belongs inside the parenthesized subquery — the outer query stays join-free.",
      template: "SELECT name\nFROM customers\nWHERE id IN (\n  SELECT o.customer_id FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON {1}\n  WHERE {2} = 'Electronics'\n)\nORDER BY name;",
      chips: ["p.id = oi.product_id", "o.customer_id = c.id", "p.category", "p.name", "c.id"],
      answers: ["p.id = oi.product_id", "p.category"],
      why: "The inner query is a full query — joins and all: it walks orders → order_items → products and returns the ids of the twelve customers who bought Electronics. The outer query only tests membership against that list.",
      notes: [
        { slot: 1, why: "`o.customer_id = c.id` is the correlation spelling — but there is no c inside this subquery to correlate against. Here the join links the subquery's own tables: the line item to the product it points at." },
        { slot: 2, why: "The shelf is stored in category — no product is named 'Electronics', so p.name would filter the list down to nothing." },
      ],
    },
    {
      id: "l25-f5",
      prompt: "Which categories price above the catalog average? Compare each category's mean against the storewide scalar subquery — inside HAVING.",
      template: "SELECT category, ROUND(AVG(price), 2) AS avg_price\nFROM products\nGROUP BY {1}\nHAVING AVG(price) > {2}\nORDER BY avg_price DESC;",
      chips: ["category", "supplier_id", "price", "(SELECT AVG(price) FROM products)", "(SELECT price FROM products)", "avg_price"],
      answers: ["category", "(SELECT AVG(price) FROM products)"],
      why: "The GROUP BY averages price per category, and HAVING compares each group's mean against the storewide average computed live by the scalar subquery — three categories qualify: Wearables, Audio and Video.",
      notes: [
        { slot: 1, why: "GROUP BY price would make one bucket per distinct price — sixteen groups answering nothing. The report is per category." },
        { slot: 2, why: "(SELECT price FROM products) returns sixteen rows, not one: PostgreSQL throws an error and SQLite quietly grabs the first price. A scalar subquery must provably return one row — an aggregate is the easiest guarantee." },
      ],
    },
  ],

  // Lesson 26 — EXISTS & correlated subqueries — the per-row probe
  26: [
    {
      id: "l26-f1",
      prompt: "Who has a shipped order in flight right now? Ask it as a yes/no probe — one verdict per customer.",
      template: "SELECT c.name\nFROM customers c\nWHERE {1} (\n  SELECT 1 FROM orders o\n  WHERE {2} = c.id AND o.status = 'shipped'\n)\nORDER BY c.name;",
      chips: ["EXISTS", "NOT EXISTS", "IN", "o.customer_id", "c.customer_id", "o.id"],
      answers: ["EXISTS", "o.customer_id"],
      why: "EXISTS asks per customer: does even one shipped order exist for this id? It stops scanning at the first hit and answers TRUE — ten customers pass on this seed. The correlation o.customer_id = c.id is what plugs each customer into the probe.",
      notes: [
        { slot: 1, why: "NOT EXISTS flips the verdict — it would list the six customers with no shipped order at all. Bare IN is also out of place here: after WHERE it needs a left-hand column to test." },
        { slot: 2, why: "The probe scans orders, so the column is o.customer_id — customers has no customer_id column (the crash reads `no such column: c.customer_id`), and o.id is the order's own key." },
      ],
    },
    {
      id: "l26-f2",
      prompt: "The signature move: every order judged against its OWN customer's average total, not the storewide one.",
      template: "SELECT o.id, o.total\nFROM orders o\nWHERE o.total > (\n  SELECT {1}(o2.total) FROM orders o2\n  WHERE {2}\n)\nORDER BY o.total DESC;",
      chips: ["AVG", "SUM", "COUNT", "o2.customer_id = o.customer_id", "o2.customer_id = o2.customer_id", "customer_id = c.id"],
      answers: ["AVG", "o2.customer_id = o.customer_id"],
      why: "The correlation reaches out to the outer row — o2.customer_id = o.customer_id — so the bar is recomputed as that order's own household mean, and 45 of the 103 orders survive. One level of GROUP BY could never compare each row to its group's average; the correlated scalar is the tool.",
      notes: [
        { slot: 1, why: "SUM(total) is 34,833.28 — no single order comes close, the report would return zero rows. The bar is the average of the customer's orders." },
        { slot: 2, why: "`o2.customer_id = o2.customer_id` is always true — it quietly recomputes the storewide average and answers the lesson-25 question (42 orders). The tie must reach out to o, the outer row." },
      ],
    },
    {
      id: "l26-f3",
      prompt: "A teammate's 'no shipped order' report suddenly returns NOTHING — a legacy import just grew a NULL in the compared column, poisoning their NOT IN. Pick the chip that asks the same question without comparing against the list.",
      template: "SELECT c.name\nFROM customers c\nWHERE {1} (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'shipped'\n)\nORDER BY c.name;",
      chips: ["NOT EXISTS", "NOT IN", "EXISTS", "IN", "IS NOT NULL"],
      answers: ["NOT EXISTS"],
      why: "NOT EXISTS probes for rows and never compares values against the list, so a NULL in the data can't poison the verdict — the six customers with no shipped order come out correct no matter what the import does.",
      notes: [
        { slot: 1, why: "Bare EXISTS answers the opposite question — the ten customers who DO have a shipped order. The negative needs the NOT." },
        { slot: 2, why: "IS NOT NULL would belong inside the subquery's WHERE as a guard on the list — alone in the outer WHERE it isn't a test of the orders at all." },
      ],
    },
    {
      id: "l26-f4",
      prompt: "One row per customer with their personal average order total — computed by a correlated scalar in the SELECT list, no GROUP BY.",
      template: "SELECT c.name,\n  (SELECT {1}(o.total) FROM orders o\n   WHERE o.customer_id = {2}) AS avg_total\nFROM customers c\nORDER BY avg_total DESC;",
      chips: ["AVG", "SUM", "COUNT", "c.id", "o.id", "c.customer_id"],
      answers: ["AVG", "c.id"],
      why: "The correlated scalar runs once per customer row and stamps that customer's own mean into the output — sixteen annotated rows, with Liam O'Brien's 705.39 average on top. In WHERE the subquery filters; in the SELECT list it annotates.",
      notes: [
        { slot: 1, why: "COUNT returns how many orders a customer has, not their mean — the brief wants the average." },
        { slot: 2, why: "o.id is the order's own key — the tie must reach the OUTER row, the customer's c.id, for each average to be that customer's." },
      ],
    },
    {
      id: "l26-f5",
      prompt: "How many customers hold at least one cancelled order? Probe with EXISTS, count the survivors.",
      template: "SELECT {1}(*) AS with_cancelled\nFROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = {2}\n);",
      chips: ["COUNT", "SUM", "'cancelled'", "cancelled", "'canceled'", "o.status"],
      answers: ["COUNT", "'cancelled'"],
      why: "COUNT(*) over the surviving customer rows counts TRUE verdicts: four customers hold a cancelled order, even though seven cancelled orders exist. EXISTS guarantees one verdict per customer, so no DISTINCT repair is needed.",
      notes: [
        { slot: 1, why: "SUM(*) is not valid SQL — and the outer query counts customer rows; the orders stay inside the probe." },
        { slot: 2, why: "The status is quoted text: unquoted cancelled would be read as a column (`no such column: cancelled`), and the one-l spelling 'canceled' matches no stored value." },
      ],
    },
  ],

  // Lesson 27 — Derived tables — a query in FROM
  27: [
    {
      id: "l27-f1",
      prompt: "Lifetime spend above 1000, the staged way: collapse the orders to one spend row per customer FIRST, then join customers for the names.",
      template: "SELECT c.name, d.spend\nFROM customers c\nJOIN (\n  SELECT customer_id, SUM(total) AS {1}\n  FROM {2}\n  GROUP BY customer_id\n) {3} ON d.customer_id = c.id\nWHERE d.spend > 1000\nORDER BY d.spend DESC;",
      chips: ["spend", "total", "SUM", "orders", "customers", "d"],
      answers: ["spend", "orders", "d"],
      why: "Stage one aggregates the 103 order rows into one spend row per customer — aliasing the total AS spend — and the 1:1 join then attaches names without any fanout. Eight customers clear 1000, Alice Chen (7,262.35) first. The d names the derived table itself.",
      notes: [
        { slot: 1, why: "The outer query reads d.spend — if the inner aggregate ships under any other name, that reference never resolves (`no such column: d.spend`)." },
        { slot: 2, why: "customers holds no totals — stage one aggregates the order rows; customers only enters at the join, for the name." },
        { slot: 3, why: "PostgreSQL and MySQL reject an unnamed derived table; SQLite merely tolerates it. Name it — the alias is how the outer query reaches the summary's columns." },
      ],
    },
    {
      id: "l27-f2",
      prompt: "Regions whose total revenue exceeds 5000: the summary is already grouped inside the parentheses. Reach its columns through the stage, and give the derived table the alias the outer query references.",
      template: "SELECT {1}, d.spend\nFROM (\n  SELECT c.region AS region, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n) {2}\nWHERE d.spend > 5000\nORDER BY d.spend DESC;",
      chips: ["d.region", "d", "c.region", "o.region", "d.spend"],
      answers: ["d.region", "d"],
      why: "The outer query treats the grouped summary exactly like a table named d: d.region for the label, d.spend for the money. Three regions clear 5000 — EU 15,089.23, APAC 11,605.45, US 7,286.16 — and LATAM's 852.44 drops out.",
      notes: [
        { slot: 1, why: "d.spend would run — but the brief asks for the region label first, and the same column twice answers nothing. The projection is region then spend." },
        { slot: 2, why: "c.region and o.region belong to the INNER query's scope — the outer query sees only the summary, so its tables must be named through d." },
      ],
    },
    {
      id: "l27-f3",
      prompt: "Fix the broken report: it crashes with `no such column: d.big_spend` because the inner aggregate was never named what the outer query calls it. Pick the chip that repairs the reference.",
      template: "SELECT c.name, d.big_spend\nFROM customers c\nJOIN (\n  SELECT customer_id, SUM(total) AS {1}\n  FROM orders\n  GROUP BY customer_id\n) d ON d.customer_id = c.id\nWHERE d.big_spend > 1000\nORDER BY d.big_spend DESC;",
      chips: ["big_spend", "spend", "total", "SUM(total)", "s"],
      answers: ["big_spend"],
      why: "An aggregate has no name until you give it one with AS — and the name must match what the outside calls. The outer query reads d.big_spend, so the inner SELECT must end `AS big_spend`; any other alias reproduces the exact crash quoted in the prompt.",
      notes: [
        { slot: 1, why: "`AS spend` builds the derived table happily — and the outer query still dies, because it reads d.big_spend. Read the outer references first, then name the inner column to match." },
      ],
    },
    {
      id: "l27-f4",
      prompt: "Delivered-only revenue per region: push the status filter DOWN into the derived table, before the grouping, so the SUM only sees delivered rows.",
      template: "SELECT d.region, d.delivered_spend\nFROM (\n  SELECT c.region AS region, SUM(o.total) AS delivered_spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  WHERE {1} = 'delivered'\n  GROUP BY {2}\n) d\nWHERE d.delivered_spend > 3000\nORDER BY d.delivered_spend DESC;",
      chips: ["o.status", "d.status", "c.region", "c.city", "c.id", "o.customer_id"],
      answers: ["o.status", "c.region"],
      why: "Pre-filtering inside the parentheses means the aggregation sees only delivered rows — the groups are honest before the join-less outer query ever runs. Two regions clear 3000: EU (6,656.18) and APAC (6,617.68).",
      notes: [
        { slot: 1, why: "d.status can't appear inside the derived table — d is the name the OUTER query gives these rows. Inside the parentheses, the tables are still o and c." },
        { slot: 2, why: "c.city would build one bucket per city — the report is per region. And c.id would stage per customer, resurrecting rows the summary was meant to collapse." },
      ],
    },
    {
      id: "l27-f5",
      prompt: "Products priced above their OWN category's average: stage one averages price per category, then the join hands each product its shelf's average to beat.",
      template: "SELECT p.name, p.price, p.category\nFROM products p\nJOIN (\n  SELECT category, AVG(price) AS avg_price\n  FROM products\n  GROUP BY category\n) a ON {1}\nWHERE p.price > {2}\nORDER BY p.price DESC;",
      chips: ["a.category = p.category", "a.category = category", "p.category = p.category", "a.avg_price", "p.price", "AVG(price)"],
      answers: ["a.category = p.category", "a.avg_price"],
      why: "Stage one is seven rows — one average per category — and joining on matching category hands each product its own shelf's bar. Seven products beat their category, led by Smart Watch S over the Wearables average.",
      notes: [
        { slot: 1, why: "A bare `category` is ambiguous once both sides carry the column (`ambiguous column name: category`), and p.category = p.category is always true — it would join every product to all seven summary rows." },
        { slot: 2, why: "p.price > p.price is never true — zero rows forever. The comparison is against the borrowed average from stage one, a.avg_price; a bare AVG(price) in the outer WHERE is a misuse-of-aggregate error." },
      ],
    },
  ],

  // Lesson 28 — CTEs — WITH, the readable subquery
  28: [
    {
      id: "l28-f1",
      prompt: "Rebuild the region-spend report as a CTE: declare the staging query first, then read it in the final SELECT.",
      template: "{1} region_spend AS (\n  SELECT c.region AS region, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region, spend FROM region_spend\nORDER BY {2} DESC;",
      chips: ["WITH", "AS", "SELECT", "spend", "region", "c.spend"],
      answers: ["WITH", "spend"],
      why: "WITH opens the definition — `WITH region_spend AS (…)` — and the final SELECT then reads region_spend like any table, sorting the four region rows by money: EU, APAC, US, LATAM. One statement: WITH clause and SELECT together, no semicolon between.",
      notes: [
        { slot: 1, why: "AS is the connector inside the definition (name AS (…)); WITH is the clause that opens it. `AS region_spend AS (…)` doesn't parse." },
        { slot: 2, why: "ORDER BY region would sort names, not money — and c.spend has no scope here: the final query reads the CTE's own columns, bare." },
      ],
    },
    {
      id: "l28-f2",
      prompt: "Chain two CTEs: stage the per-customer spend, then keep only the big spenders from that stage — the second CTE must build on the first.",
      template: "WITH spend AS (\n  SELECT customer_id, SUM(total) AS s\n  FROM orders GROUP BY customer_id\n), {1} AS (\n  SELECT * FROM {2} WHERE {3} > 2000\n)\nSELECT c.name, b.s\nFROM big b JOIN customers c ON c.id = b.customer_id\nORDER BY b.s DESC;",
      chips: ["big", "vips", "spend", "orders", "s", "customer_id"],
      answers: ["big", "spend", "s"],
      why: "The second CTE builds on the first: big selects the s > 2000 rows out of spend, and the final query joins big to customers for names — five customers clear the bar, Alice (7,262.35) to Chloe (2,667.93). Later CTEs can read earlier ones, never the reverse.",
      notes: [
        { slot: 1, why: "Any stage name compiles, but the final SELECT reads FROM big — name the second CTE big or the chain ends at a table that doesn't exist." },
        { slot: 2, why: "Chaining means building on the named stage: FROM orders here would re-scan raw rows that have no s column at all." },
        { slot: 3, why: "customer_id is the grouping key, not the money — the 2000 bar applies to the summed column s." },
      ],
    },
    {
      id: "l28-f3",
      prompt: "Fix the broken chain: it dies with `near \";\": syntax error` because someone terminated the first CTE like its own statement. Pick the chip that joins the two definitions into one WITH clause.",
      template: "WITH spend AS (\n  SELECT customer_id, SUM(total) AS s\n  FROM orders GROUP BY customer_id\n) {1} big AS (\n  SELECT * FROM spend WHERE s > 2000\n)\nSELECT c.name, b.s\nFROM big b JOIN customers c ON c.id = b.customer_id\nORDER BY b.s DESC;",
      chips: [",", ";", "WITH", "AND", "THEN", "UNION ALL"],
      answers: [","],
      why: "One WITH, two definitions: a comma separates CTE declarations inside the clause, and the single semicolon closes the entire statement only at the very end. WITH + final SELECT is one statement — five customers clear 2000 through the chain.",
      notes: [
        { slot: 1, why: "A semicolon there splits the statement in half — the WITH is left with no final SELECT, and `big` becomes an orphaned definition. Commas join CTEs; one semicolon at the end." },
      ],
    },
    {
      id: "l28-f4",
      prompt: "Extend the region CTE with each region's share of total revenue — compute the grand total from the CTE itself, referenced a second time, not by re-scanning orders.",
      template: "WITH region_spend AS (\n  SELECT c.region AS region, SUM(o.total) AS spend\n  FROM orders o JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.region\n)\nSELECT region, ROUND(spend, 2) AS spend,\n  ROUND(spend * 100.0 / (SELECT {1}(spend) FROM {2}), 1) AS share_pct\nFROM region_spend;",
      chips: ["SUM", "AVG", "COUNT", "region_spend", "orders", "customers"],
      answers: ["SUM", "region_spend"],
      why: "SUM(spend) over the CTE's four summary rows is the whole store's revenue — 34,833.28 — so EU's share lands at 43.3%, APAC 33.3%, US 20.9%, LATAM 2.4%. One name, many uses: the CTE is referenced twice without pasting the query twice.",
      notes: [
        { slot: 1, why: "AVG(spend) would divide every region by an average, not the total — shares must sum to ~100%." },
        { slot: 2, why: "orders has no spend column — that column only exists in the named stage. The divisor reads the summary rows the CTE already computed." },
      ],
    },
    {
      id: "l28-f5",
      prompt: "Which months ran more than 8 orders? Bucket the orders by month in the CTE, then filter and list in the main query — calendar order.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', {1}) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n FROM monthly\nWHERE n > 8\nORDER BY {2};",
      chips: ["created_at", "shipped_at", "total", "mon", "n", "COUNT(*)"],
      answers: ["created_at", "mon"],
      why: "The CTE buckets every order into a YYYY-MM month via strftime and counts; the main query keeps the tall ones — two months ran 9 orders each, 2024-02 and 2024-09. Sorting by mon lists them in calendar order, as the brief asks.",
      notes: [
        { slot: 1, why: "The bucket is when the order was PLACED — created_at. shipped_at is empty on this seed, so it would collapse everything into one NULL month." },
        { slot: 2, why: "ORDER BY n answers 'which month was biggest' — the brief wants calendar order. (The 9-vs-9 tie is exactly why the lesson teaches sorting on the bucket key.)" },
      ],
    },
  ],

  // Lesson 38 — Case study — the VIP shortlist (Module 4 capstone)
  38: [
    {
      id: "l38-f1",
      prompt: "Assemble the VIP pipeline as a CTE chain: stage per-customer spends, filter to above-average, then cap the shortlist at three.",
      template: "WITH spends AS (\n  SELECT c.id, c.name, SUM(o.total) AS spend\n  FROM customers c JOIN orders o ON o.customer_id = c.id\n  GROUP BY {1}\n), vips AS (\n  SELECT * FROM spends\n  WHERE spend > (SELECT AVG(spend) FROM {2})\n)\nSELECT name, ROUND(spend, 2) AS spend\nFROM vips\nORDER BY spend DESC\n{3};",
      chips: ["c.id", "o.id", "spends", "orders", "LIMIT 3", "LIMIT 5"],
      answers: ["c.id", "spends", "LIMIT 3"],
      why: "Two named stages: spends collapses the join to one row per customer, vips keeps the five whose lifetime spend beats the staged average (2,177.08 here) — and the final SELECT sorts and caps the shortlist at three: Alice 7,262.35, Emma 6,640.56, Grace 4,574.23.",
      notes: [
        { slot: 1, why: "GROUP BY o.id stages per-ORDER sums — the exact average-order confusion the brief warns about (42 pseudo-vips instead of 5). The customer list needs one row per customer: c.id." },
        { slot: 2, why: "The bar averages the stage's OWN spend column — orders doesn't even have a spend column; re-scanning it would be a `no such column: spend` crash." },
        { slot: 3, why: "LIMIT 5 is the whole vip stage — the shortlist is the top three of those five." },
      ],
    },
    {
      id: "l38-f2",
      prompt: "Status veterans have experienced every status. Bucket the orders per customer, then gate on the number of DIFFERENT statuses.",
      template: "SELECT c.name\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\n{1} COUNT({2} o.status) = 4\nORDER BY c.name;",
      chips: ["HAVING", "WHERE", "DISTINCT", "ALL", "GROUP"],
      answers: ["HAVING", "DISTINCT"],
      why: "COUNT(DISTINCT o.status) counts different status values per customer — 4 means delivered, shipped, pending AND cancelled each occurred at least once. HAVING applies that test to each customer's finished bucket: three veterans — Alice, Emma, Maya.",
      notes: [
        { slot: 1, why: "WHERE runs before grouping and can't see COUNT — the breadth test judges each bucket after it's built, which is HAVING's job." },
        { slot: 2, why: "ALL is the default — COUNT(ALL o.status) = 4 passes anyone with four orders, even four delivered. DISTINCT is what makes it four DIFFERENT statuses." },
      ],
    },
    {
      id: "l38-f3",
      prompt: "Which customers hold at least one pending order this instant? Ask it as an existence probe — one verdict per customer.",
      template: "SELECT c.name\nFROM customers c\nWHERE {1} (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = {2}\n)\nORDER BY c.name;",
      chips: ["EXISTS", "NOT EXISTS", "IN", "'pending'", "pending", "'shipped'"],
      answers: ["EXISTS", "'pending'"],
      why: "EXISTS asks per customer: is there even one pending order? It stops at the first hit and returns a verdict — eight customers hold live pipelines right now. The status literal is quoted text: unquoted pending would be read as a column name.",
      notes: [
        { slot: 1, why: "NOT EXISTS answers the complement — the customers with nothing pending. And bare IN after WHERE needs a left-hand column to test." },
        { slot: 2, why: "'shipped' probes yesterday's news — ten customers hold shipped orders; the live pipeline is pending. Unquoted pending crashes with `no such column: pending`." },
      ],
    },
    {
      id: "l38-f4",
      prompt: "Fix the classic VIP bug: the first draft died with `misuse of aggregate function AVG()` because it compared SUM to AVG in one flat level. Stage the spends first, then compare against the staged average.",
      template: "WITH spends AS (\n  SELECT customer_id, SUM(total) AS spend\n  FROM orders\n  GROUP BY {1}\n)\nSELECT COUNT(*) AS vips FROM spends\nWHERE spend > (SELECT {2}(spend) FROM spends);",
      chips: ["customer_id", "o.total", "total", "AVG", "SUM", "COUNT"],
      answers: ["customer_id", "AVG"],
      why: "Stage one turns 103 orders into sixteen lifetime sums, and the bar is the average of those staged sums — 2,177.08, the average CUSTOMER, not the 338.19 average order. Five customers clear it; that's the two-level question finally expressed in two levels.",
      notes: [
        { slot: 1, why: "GROUP BY total buckets by money value, not by owner — the stage must collapse to one row per customer (customer_id) before any average-of-customers exists. o.total doesn't even resolve: the stage reads orders without an alias." },
        { slot: 2, why: "SUM(spend) is the grand total 34,833.28 — no customer beats the whole store. The bar is the average of the staged sums." },
      ],
    },
    {
      id: "l38-f5",
      prompt: "Count each customer's stellar orders — the ones that beat their OWN household's average — then rank and cap at four names.",
      template: "SELECT c.name, COUNT(*) AS stellar_orders\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (\n  SELECT {1}(o2.total) FROM orders o2\n  WHERE {2}\n)\nGROUP BY c.id\nORDER BY stellar_orders DESC, c.name\nLIMIT 4;",
      chips: ["AVG", "SUM", "MAX", "o2.customer_id = o.customer_id", "o2.customer_id = o2.id", "customer_id = 1"],
      answers: ["AVG", "o2.customer_id = o.customer_id"],
      why: "The probe ties the average to the outer order's own customer — o2.customer_id = o.customer_id — so every order is judged against its household's bar: 45 orders are stellar, Alice, Emma and Maya own 8 apiece, and Grace's 6 rounds out the top four.",
      notes: [
        { slot: 1, why: "MAX sets the bar at the customer's biggest order — strictly greater than the maximum is impossible, zero rows. The bar is the household mean." },
        { slot: 2, why: "o2.customer_id = o2.id correlates the probe to itself — it computes a per-order constant and the baseline collapses (7 rows, wrong crowd). The tie must reach the OUTER row, o." },
      ],
    },
  ],
};
