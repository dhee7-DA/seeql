// Lesson 66 — star schema problems: facts, dimensions, surrogate keys, spine.

export const ROWS: import("./l64-util").ProbRowX[] = [
  ["Prove the spine", "The date dimension is 425 consecutive days. Return its row count, its first date_key and its last — one row proving the calendar spine is complete and ordered.", ["COUNT(*), MIN(date_key), MAX(date_key) — whole-table verdicts on dim_date.", "Keys are integers: 20240101 … 20250228."], "easy",
    `SELECT COUNT(*) AS spine_days,
       MIN(date_key) AS first_key,
       MAX(date_key) AS last_key
FROM dim_date;`,
    [["strftime", "The spine already stores everything — COUNT/MIN/MAX need no date math."], ["iso_date", "The KEY is the join handle; iso_date is the display form."]]],
  ["Key anatomy", "date_key 20240215 is an integer that reads as a date. Pull its spine row: iso_date, month, month_name, quarter, dow, is_weekend — the pre-computed calendar the fact joins to.", ["One-row pick by primary key — the star's cheapest join, no computation.", "dow: 0 = Sunday … 6 = Saturday."], "easy",
    `SELECT iso_date, month, month_name, quarter, year, dow, is_weekend
FROM dim_date
WHERE date_key = 20240215;`,
    [["strftime\\(", "Nothing to derive — the spine carries month, quarter and weekend flags at load."], ["date\\(", "date_key IS the date, encoded; no cast needed."]]],
  ["The weekend flag", "How many spine days are weekends, and how many weekdays? Two numbers, one row — the flag the board's 'weekend question' reads instead of re-deriving day-of-week per query.", ["SUM(is_weekend) counts flagged days; COUNT(*) − SUM(is_weekend) the rest.", "The flag exists so queries never touch strftime."], "easy",
    `SELECT SUM(is_weekend) AS weekend_days,
       COUNT(*) - SUM(is_weekend) AS weekday_days
FROM dim_date;`,
    [["strftime\\('%w'", "Re-deriving per query is the wide-table habit — the spine pre-computed it."], ["dow\\s+in", "The flag IS that predicate, baked at load."]]],
  ["The rollup column", "dim_product carries a department its source never had: a merchandising rollup. Count products per department — Tech towers in product count too.", ["GROUP BY department on the 16-row dim; no fact needed.", "The mapping: Electronics/Audio/Video/Accessories/Wearables → Tech; Apparel/Fitness → Lifestyle."], "easy",
    `SELECT department, COUNT(*) AS products
FROM dim_product
GROUP BY department
ORDER BY products DESC, department;`,
    [["products", "The dim's own table is products — use dim_product to avoid self-confusion."], ["fact_sales", "Product count is a DIMENSION attribute question — the fact would fan it out."]], true],
  ["Surrogate keys, counted", "dim_customer carries 21 rows for 16 buyers: the surrogate key (customer_sk) versions each buyer. Return the sk range, distinct buyers, and version rows — three numbers proving the SCD shape.", ["MIN/MAX(customer_sk) = 1..21; COUNT(DISTINCT customer_id) = 16; COUNT(*) = 21.", "One SELECT of three aggregates over the same dim."], "medium",
    `SELECT MIN(customer_sk) AS first_sk,
       MAX(customer_sk) AS last_sk,
       COUNT(DISTINCT customer_id) AS buyers,
       COUNT(*) AS versions
FROM dim_customer;`,
    [["customer_sk\\s*=\\s*customer_id", "The surrogate is NOT the natural id — that's the whole design; versioning needs its own handle."], ["where\\s+is_current", "Counting versions means counting ALL rows — the current flag filters, never here."]]],
  ["Region at two dates", "Bruno (customer_id 2) moved. Probe his dimension at 2024-07-15 and at 2024-09-15 — the half-open windows answer both in one row, no CASE logic.", ["Two scalar subqueries with the window predicate: >= valid_from AND < valid_to.", "The move date is 2024-08-01 — the probe dates straddle it."], "medium",
    `SELECT (SELECT region FROM dim_customer
         WHERE customer_id = 2 AND '2024-07-15' >= valid_from AND '2024-07-15' < valid_to) AS region_july,
       (SELECT region FROM dim_customer
         WHERE customer_id = 2 AND '2024-09-15' >= valid_from AND '2024-09-15' < valid_to) AS region_september;`,
    [["between", "BETWEEN is inclusive on both ends — on a change date it would match TWO versions. The windows are half-open: [from, to)."], ["is_current\\s*=\\s*1", "is_current answers 'now'; the probes ask about specific past dates."]]],
  ["Revenue by store", "The fact's store_key opens the location slice: net dollars per store, biggest first — store name joined from dim_store.", ["Join dim_store ON store_key; GROUP BY name; ORDER BY net DESC.", "Money: ROUND(SUM(net_cents)/100.0, 2)."], "medium",
    `SELECT s.name,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_store s ON s.store_key = f.store_key
GROUP BY s.name
ORDER BY net_dollars DESC, s.name;`,
    [["city", "Group by the store's name (or key) — city is an attribute for slicing, not the grain of this report."], ["quantity", "Net dollars, not units sold."]], true],
  ["The wide-table counterfactual", "If departments melted onto the fact, 239 lines would each carry the string. Prove the economy: fact lines vs distinct department rows the dim needs — the redundancy the star avoids.", ["Two scalar subqueries: COUNT(*) on fact_sales, COUNT(DISTINCT department) on dim_product.", "239 copies vs 2 rows — the numbers make the argument."], "medium",
    `SELECT (SELECT COUNT(*) FROM fact_sales) AS fact_lines_carrying_attrs,
       (SELECT COUNT(DISTINCT department) FROM dim_product) AS department_rows_needed;`,
    [["join", "Two independent counts — scalar subqueries, no join."], ["group\\s+by", "Neither answer is per-group; both are whole-table verdicts."]]],
  ["The degenerate order", "order_id sits on the fact pointing at no dimension. Count distinct order ids on the fact and non-cancelled orders in the source — the drill-through handle survives the load unchanged.", ["COUNT(DISTINCT order_id) on fact_sales; source side counts orders WHERE status != 'cancelled'.", "Two scalar subqueries, one row."], "medium",
    `SELECT (SELECT COUNT(DISTINCT order_id) FROM fact_sales) AS fact_orders,
       (SELECT COUNT(*) FROM orders WHERE status != 'cancelled') AS source_orders;`,
    [["join", "No join — the fact's order_id is compared to nothing but the source's own count."], ["distinct\\s+order_id.*orders", "orders.id is already unique; the DISTINCT belongs to the fact side where orders repeat per line."]]],
  ["No orphans", "The star's integrity contract: every fact key resolves. Count fact rows whose product, store or customer key fails to join — the answer must be zero across all three.", ["Three NOT EXISTS (or LEFT JOIN … IS NULL) checks ORed together.", "dim_customer joins on customer_sk — the surrogate, not customer_id."], "hard",
    `SELECT COUNT(*) AS orphaned_lines
FROM fact_sales f
WHERE NOT EXISTS (SELECT 1 FROM dim_product d WHERE d.product_key = f.product_key)
   OR NOT EXISTS (SELECT 1 FROM dim_store s WHERE s.store_key = f.store_key)
   OR NOT EXISTS (SELECT 1 FROM dim_customer c WHERE c.customer_sk = f.customer_key);`,
    [["left\\s+join.*group", "A LEFT JOIN + IS NULL works too — but three correlated probes in one WHERE keeps the verdict one row."], ["customer_id", "Joining on customer_id would MISREAD the SCD design — the fact carries the surrogate sk."]]],
  ["Store × department grid", "Eight cells: 2024 net dollars for every quarter × department, quarters ascending then departments alphabetically — the one-pager skeleton, two dims deep.", ["Join dim_date AND dim_product; GROUP BY year, quarter, department; keep 2024.", "ORDER BY year, quarter, department — reading order, not size order."], "medium",
    `SELECT dd.year, dd.quarter, d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.year, dd.quarter, d.department
ORDER BY dd.year, dd.quarter, d.department;`,
    [["strftime|substr\\(.*date_key", "The spine already carries quarter — one join to dim_date beats re-deriving buckets from the integer key."], ["order\\s+by\\s+net_dollars\\s+desc", "The grid reads left-to-right, top-to-bottom: calendar and alphabet, not ranked by size."]], true],
  ["The spine's month bucket", "January's fact lines: use the spine's month column (not strftime) to count them, and return the month_name next to the count to prove the dim carries the calendar.", ["Join dim_date, WHERE dd.month = '2024-01'; the name comes free from the same row.", "COUNT(*) and a scalar MAX(month_name) — or just select the constant from the spine."], "medium",
    `SELECT dd.month_name,
       COUNT(*) AS fact_lines
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
WHERE dd.month = '2024-01'
GROUP BY dd.month_name;`,
    [["strftime\\('%Y", "Deriving the month from the key re-implements the spine — the dim exists so queries don't."], ["like\\s+'2024-01%'", "The month column is exact ('2024-01'); LIKE is a fuzzy substitute that scans."]], true],
  ["Margin per line", "unit_cost_cents lives on dim_product — margin is a JOIN, not a stored column. Product 13 (Smart Watch S): return lines sold, net dollars and margin dollars (net − qty × unit cost).", ["Join dim_product; margin = SUM(net_cents − quantity * unit_cost_cents).", "Both money answers via ROUND(x/100.0, 2)."], "medium",
    `SELECT COUNT(*) AS lines,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars,
       ROUND(SUM(f.net_cents - f.quantity * d.unit_cost_cents) / 100.0, 2) AS margin_dollars
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
WHERE f.product_key = 13;`,
    [["gross", "Margin compares against NET (post-promo) — gross would overstate profit by the promo amount."], ["sum\\(d\\.unit_cost", "Cost multiplies by the LINE's quantity — summing the dim column alone ignores how many units each line sold."]]],
  ["Top five products", "The star's daily bread: top five products by net dollars — name and department from the dim, biggest first, ties by earlier product_key.", ["Join dim_product, GROUP BY key/name/department, ORDER BY net DESC, key ASC, LIMIT 5.", "Group by the KEY to be safe — names can repeat across products."], "medium",
    `SELECT d.product_key, d.name, d.department,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_product d ON d.product_key = f.product_key
GROUP BY d.product_key, d.name, d.department
ORDER BY net_dollars DESC, d.product_key
LIMIT 5;`,
    [["group\\s+by\\s+d\\.name\\s*$", "Names can collide between products — group by the key, display the name."], ["limit\\s+3", "Five, as briefed."]], true],
  ["Inactive buyers, real sales", "active = 0 buyers DID buy before going dark. Count fact lines whose customer version is inactive — the dimension attribute slicing the fact.", ["Join dim_customer ON customer_sk; WHERE active = 0; COUNT(*).", "The fact carries versions — Dmitri's and Keiko's lines are all inactive-version rows."], "hard",
    `SELECT COUNT(*) AS inactive_lines,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f
JOIN dim_customer c ON c.customer_sk = f.customer_key
WHERE c.active = 0;`,
    [["customers", "Join the DIMENSION — the operational customers table is not the star's copy."], ["is_current", "The fact's key picks the as-of version; is_current is for 'now' questions."]]],
  ["The star map, queried", "The whole anatomy in one row: fact lines, date spine rows, product rows, customer versions, store rows. Five counts, one SELECT — the schema as numbers.", ["Five scalar subqueries, one per table, no joins.", "dim_customer counts ALL rows (versions), dim_date all 425 spine days."], "easy",
    `SELECT (SELECT COUNT(*) FROM fact_sales) AS fact_lines,
       (SELECT COUNT(*) FROM dim_date) AS spine_days,
       (SELECT COUNT(*) FROM dim_product) AS product_rows,
       (SELECT COUNT(*) FROM dim_customer) AS customer_versions,
       (SELECT COUNT(*) FROM dim_store) AS store_rows;`,
    [["join", "Five independent counts never touch each other — scalar subqueries keep it one row."], ["distinct", "Every count is a plain COUNT(*) — the tables have no duplicates to collapse."]]],
];
