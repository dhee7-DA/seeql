import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson26: Lesson = {
  id: "lesson-26",
  num: 26,
  title: "EXISTS & correlated subqueries — the per-row probe",
  blurb: "Boolean membership that stops at the first match, and inner queries that read the outer row",
  minutes: 13,
  blocks: [
    {
      kind: "p",
      text: "`EXISTS (SELECT …)` asks a yes/no question: *does this subquery return at least one row?* It never hands back data — just a verdict per outer row. The moment the inner query mentions a column from the outside, it becomes **correlated**: the database must re-run it once per candidate row, with that row's values plugged in. Slower-looking on paper, but it buys you comparisons no flat join can express — like *above this customer's own average*.",
    },
    { kind: "diagram", figure: "q2-probe" },
    {
      kind: "code",
      caption: "EXISTS: who has a shipped order in flight right now?",
      sql: `SELECT c.name
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id      -- ← the correlation
    AND o.status = 'shipped'
) ORDER BY c.name;   -- 10 customers; NOT EXISTS gives the other 6`,
    },
    { kind: "h", text: "Reading the correlation" },
    {
      kind: "bullets",
      items: [
        "`o.customer_id = c.id` is the pivot: for **each** customer row, the inner scan runs against *that* customer's orders. Alice's probe sees her 24 orders; Bruno's sees his 3.",
        "`SELECT 1` is the convention — EXISTS discards the select list entirely and answers *row exists / no row*. `SELECT *` means the same thing here.",
        "The engine can **stop at the first match**: Alice's shipped order is found on the way in, so the rest of her scan is skipped. That short-circuit is EXISTS's superpower over counting.",
        "Correlation is a spectrum: `EXISTS` / `NOT EXISTS` for verdicts, and a **correlated scalar** `(SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)` when you need that customer's own number as a value.",
      ],
    },
    { kind: "diagram", figure: "q6-correlated" },
    {
      kind: "code",
      caption: "The signature move: each order against its owner's own average — 45 of 103 survive",
      sql: `SELECT o.id, o.total
FROM orders o
WHERE o.total > (
  SELECT AVG(o2.total) FROM orders o2
  WHERE o2.customer_id = o.customer_id   -- outer row's own crowd
)
ORDER BY o.total DESC;`,
    },
    { kind: "h", text: "EXISTS vs IN — when the list can lie" },
    {
      kind: "bullets",
      items: [
        "On this store both spellings agree: the 4 cancelled-order customers via `IN` are the same 4 via `EXISTS`. Verified both routes.",
        "They part ways on **NULL**: `NOT IN` over a list containing NULL returns nothing (lesson 25's landmine); `NOT EXISTS` just probes rows and NULLs never match — the 6 no-shipped-order customers come out correct either way here, but only NOT EXISTS is *structurally* safe.",
        "Rule of thumb: membership over a **NOT NULL key** → `IN` reads cleanly. Existence of **any matching row**, especially with extra conditions or nullable columns → `EXISTS`.",
        "Lesson 13 met NOT EXISTS as the third anti-join spelling. Now you know why it's the one to reach for when the data gets hairy.",
      ],
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres offers `= ANY (SELECT …)` / `<> ALL (SELECT …)` as IN-family cousins, and it errors on multi-row scalar subqueries — pair that with its strictness and NOT EXISTS becomes the idiomatic anti-join.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "Older MySQL (5.x) optimized uncorrelated IN far better than correlated EXISTS; 8.0 rewrote both into semi-joins and the gap essentially closed. On any modern engine, write the readable one.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite materializes the IN list once (fast membership) and re-evaluates correlated EXISTS per outer row (fast exit). Both are fine here — 16 customers and 103 orders are ant-sized for either.",
    },
    {
      kind: "tip",
      text: "To debug a correlated subquery, run the inner query alone with a literal pasted in place of the outer reference — `(SELECT AVG(total) FROM orders WHERE customer_id = 2)` — and check the number it returns for that one row. If the single-row version is right, the correlated version is right.",
    },
  ],
  mcqs: [
    {
      id: "l26-q1",
      prompt: "What does EXISTS return for an outer row whose inner query finds 5 matching rows?",
      choices: ["5", "TRUE", "The first matching row", "An error — too many rows"],
      answer: 1,
      why: "EXISTS is a boolean: at least one row means TRUE, zero rows means FALSE. Any count above zero collapses to the same verdict — and the engine may stop scanning after the first hit.",
      notes: [
        { choice: 0, why: "That's COUNT's territory. EXISTS never returns numbers — that's exactly why `SELECT 1` is the conventional select list." },
      ],
    },
    {
      id: "l26-q2",
      prompt: "What makes the subquery in `WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id)` correlated?",
      choices: [
        "It uses AVG",
        "It references o.customer_id — an outer column",
        "It sits inside parentheses",
        "It compares against >",
      ],
      answer: 1,
      why: "Correlation = the inner query reads the outer row. Each of the 103 orders plugs its own customer_id in, so the average is that customer's personal one — 16 different averages, not one storewide figure.",
      notes: [
        { choice: 0, why: "AVG alone makes it a plain aggregate. The outer reference is what forces the per-row re-run — the two together are what make 'above MY average' expressible." },
      ],
    },
    {
      id: "l26-q3",
      prompt: "How many distinct averages does the correlated scalar compute while the outer query scans all 103 orders?",
      choices: ["One — the storewide average", "103 — one per order", "16 — one per customer", "45 — one survivor"],
      answer: 2,
      why: "Customers have different averages (Alice 302.60, Emma 390.62, Chloe 533.59…), so SQLite computes up to 16 distinct ones — each reused for every order that customer owns.",
      notes: [
        { choice: 1, why: "Naively one per outer row, but the average only depends on customer_id — same customer, same average. 16 values cover 103 rows." },
      ],
    },
    {
      id: "l26-q4",
      prompt: "A `NOT IN` list contains one NULL. Which spelling still answers 'rows with no match' correctly?",
      choices: ["NOT IN — it ignores NULLs", "NOT EXISTS — probes never match NULLs", "Both — they're equivalent", "Neither — the data is unrecoverable"],
      answer: 1,
      why: "NOT IN's comparisons against NULL are unknown, poisoning every row. NOT EXISTS asks 'is there a row where the condition holds?' — a NULL in the probed column simply never satisfies it, so the verdict stays sane.",
      notes: [
        { choice: 2, why: "They're equivalent ONLY when the compared column is guaranteed NULL-free. One NULL splits them dramatically: empty result vs correct answer." },
      ],
    },
    {
      id: "l26-q5",
      prompt: "Why write `SELECT 1` inside EXISTS instead of `SELECT *`?",
      choices: [
        "It's faster because less data is fetched",
        "Pure convention — EXISTS ignores the select list entirely",
        "SELECT * is a syntax error inside EXISTS",
        "It forces the engine to stop at the first row",
      ],
      answer: 1,
      why: "The verdict only depends on whether any row exists; the select list is discarded. `SELECT 1` just signals to human readers that the contents are irrelevant.",
      notes: [
        { choice: 3, why: "The short-circuit comes from the EXISTS semantics themselves, not the select list — engines stop at the first row either way." },
      ],
    },
    {
      id: "l26-q6",
      prompt: "'Customers with no shipped order' — 6 people here. Which anti-join spelling is structurally immune to NULL surprises?",
      choices: [
        "id NOT IN (SELECT customer_id …)",
        "LEFT JOIN … WHERE o.id IS NULL",
        "NOT EXISTS (SELECT 1 … WHERE o.customer_id = c.id …)",
        "All three — they always agree",
      ],
      answer: 2,
      why: "NOT EXISTS probes for a matching row and never compares against a NULL-bearing list. Here customer_id is NOT NULL so all three agree — but only NOT EXISTS stays correct if the data grows a NULL.",
      notes: [
        { choice: 3, why: "They agree on this seed precisely because every orders.customer_id is populated. The question was which one is safe BY STRUCTURE — that's NOT EXISTS." },
      ],
    },
    {
      id: "l26-q7",
      prompt: "Order #74 totals 1088.44; Farid's five orders average 486.32. Under a correlated 'above own average' rule, does it survive?",
      choices: [
        "Yes — 1088.44 > 486.32",
        "No — it's below the storewide average of… wait, it isn't",
        "Only with a JOIN",
        "Can't tell without GROUP BY",
      ],
      answer: 0,
      why: "The comparison bar is Farid's own 486.32, not the storewide 338.19. 45 of the 103 orders clear their owner's bar — big spenders' big orders, and modest customers' best days alike.",
      notes: [
        { choice: 1, why: "The storewide average is irrelevant here — correlation swaps it for the customer's own. That's the entire point of the correlated scalar." },
      ],
    },
    {
      id: "l26-q8",
      prompt: "Which task CANNOT be written as a plain GROUP BY query and needs a correlated subquery (or derived table)?",
      choices: [
        "Total revenue per status",
        "Orders above their own customer's average total",
        "Order count per customer",
        "Average rating of suppliers",
      ],
      answer: 1,
      why: "One level of GROUP BY produces one aggregation level; comparing each order to its owner's average mixes two levels (order vs customer-summary). Correlated scalar or a derived-table join — never a single GROUP BY.",
      notes: [
        { choice: 0, why: "`GROUP BY status` with SUM is the lesson-8 bread and butter — one level, no comparison against another level. The 'above own average' shape is the two-level one." },
      ],
    },
    {
      id: "l26-q9",
      prompt: "What exactly makes a subquery 'correlated'?",
      choices: [
        "It returns multiple rows",
        "It references a column from the outer query — so it must be re-evaluated (conceptually) once per outer row",
        "It uses an aggregate function",
        "It sits in the SELECT list rather than WHERE",
      ],
      answer: 1,
      why: "Correlation is about shared names: the moment the inner query reads an outer column (like o.customer_id), its answer depends on the outer row — one probe per row instead of one list up front.",
      notes: [
        { choice: 2, why: "Aggregates appear in uncorrelated subqueries constantly (the AVG-price probe). The tell is the outer reference, not the function." },
      ],
    },
    {
      id: "l26-q10",
      prompt: "Why is `EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id)` written with a 1?",
      choices: [
        "1 is faster than any other literal",
        "EXISTS only asks 'did any row come back?' — the projected value is irrelevant, and SELECT 1 says so out loud",
        "SELECT * is illegal inside EXISTS",
        "1 is the lowest allowed id",
      ],
      answer: 1,
      why: "The engine never materializes the subquery's columns for EXISTS — it stops at the first matching row. `SELECT 1` is the convention that tells readers nothing else was intended.",
      notes: [
        { choice: 2, why: "SELECT * works identically inside EXISTS. Either spelling is fine; the convention just makes the intent unmistakable." },
      ],
    },
    {
      id: "l26-q11",
      prompt: "How many orders total more than their OWN customer's average order — and why isn't it the same count as 'above the storewide average'?",
      choices: [
        "42 — the two baselines coincide",
        "45 — each customer is judged against their own mean (338.19 storewide is irrelevant), so different orders qualify",
        "45 — storewide is the stricter bar",
        "0 — an order can't exceed its own average",
      ],
      answer: 1,
      why: "The correlated probe swaps the baseline per row: big spenders like Alice (24 orders, 7,262.35 total) set a high internal bar while small buyers set a low one. 45 orders clear their own household's bar; 42 clear the storewide 338.19.",
      notes: [
        { choice: 0, why: "42 is the uncorrelated answer — one bar for everyone. The correlated version re-asks 'average of WHO?' 103 times, and the answer shifts." },
      ],
    },
  ],
  problems: [
    {
      id: "l26-p1",
      title: "No shipments on record",
      brief: "Customers with **no shipped order**, spelled with `NOT EXISTS`. Output `name`, alphabetical. Six names expected.",
      hints: [
        "The probe scans orders for this customer with status 'shipped'; keep customers whose probe finds nothing.",
        "Shape: SELECT c.name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = '<status>') ORDER BY c.name;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name FROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'shipped'\n)\nORDER BY c.name;",
      mistakes: [
        { test: "\\bnot\\s+in\\b", message: "NOT IN would work on this NULL-free column, but the brief drills the EXISTS probe — the spelling that stays correct even when the data grows NULLs." },
        { test: "\\bleft\\s+join\\b", message: "The lesson-13 anti-join works too — this task practices the correlated spelling: probe each customer's orders, keep the empty verdicts." },
        { test: "\\bexists\\b(?<!not\\s+exists)", message: "Bare EXISTS keeps the customers who HAVE a shipped order (10 of them) — the brief wants the six with none: NOT EXISTS." },
      ],
      expected: EXPECTED["l26-p1"],
      ordered: true,
    },
    {
      id: "l26-p2",
      title: "Count the cancelled club",
      brief: "How many customers hold at least one cancelled order? Answer with `EXISTS` and a count. Output one column `with_cancelled`.",
      hints: [
        "Probe each customer for a cancelled order, keep the TRUE verdicts, count the survivors.",
        "Shape: SELECT COUNT(*) AS with_cancelled FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = '<status>');",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS with_cancelled FROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'cancelled'\n);",
      mistakes: [
        { test: "count\\s*\\(\\s*o?\\.?id\\s*\\)\\s+from\\s+orders", message: "Counting orders would give 7 — three customers own two cancellations each. Probe customers and count the survivors: 4." },
        { test: "\\bdistinct\\b", message: "DISTINCT repairs a join-based count — EXISTS already guarantees one verdict per customer, so a plain COUNT(*) over the outer rows is exact." },
        { test: "\\bin\\s*\\(", message: "IN would give the same 4 — but this drill is the EXISTS probe: ask for a row, keep the TRUE verdicts." },
      ],
      expected: EXPECTED["l26-p2"],
    },
    {
      id: "l26-p3",
      title: "Above their own bar",
      brief: "The signature correlated query: every order whose total beats **its own customer's average**. Output `order_id` and `total`, biggest first. 45 orders qualify.",
      hints: [
        "The bar isn't the storewide 338.19 — the scalar subquery re-computes the average filtered to this order's customer.",
        "Shape: SELECT o.id AS order_id, o.total FROM orders o WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) ORDER BY o.total DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT o.id AS order_id, o.total\nFROM orders o\nWHERE o.total > (\n  SELECT AVG(o2.total) FROM orders o2\n  WHERE o2.customer_id = o.customer_id\n)\nORDER BY o.total DESC;",
      mistakes: [
        { test: "select\\s+avg\\s*\\(\\s*total\\s*\\)\\s+from\\s+orders\\s*\\)\\s*$|customer_id\\s*=\\s*o\\.customer_id\\s*\\)\\s*$", message: "The inner WHERE must tie the average to the outer row's customer — without `o2.customer_id = o.customer_id` you get the storewide 338.19 and a different (42-row) answer." },
        { test: "\\bgroup\\s+by\\b", message: "A single GROUP BY can't compare each order to its owner's average — that's two levels. The correlated scalar is the tool; GROUP BY belongs to the next lesson's derived tables." },
        { test: "\\bjoin\\b", message: "No join needed — both the order and its owner's average come from orders; only the correlation links them." },
      ],
      expected: EXPECTED["l26-p3"],
      ordered: true,
    },
    {
      id: "l26-p4",
      title: "Electronics, the EXISTS route",
      brief: "Same crowd as lesson 25's IN drill — customers who bought **Electronics** — now via a correlated `EXISTS` whose inner query may join. Output `name`, alphabetical. Twelve names.",
      hints: [
        "Probe: does THIS customer have at least one order line whose product is Electronics? The inner query carries the joins; the correlation is one equality.",
        "Shape: SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o JOIN order_items oi ON … JOIN products p ON … WHERE o.customer_id = c.id AND p.category = '<cat>') ORDER BY name;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name FROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  WHERE o.customer_id = c.id AND p.category = 'Electronics'\n)\nORDER BY c.name;",
      mistakes: [
        { test: "\\bin\\s*\\(", message: "The IN route is correct SQL but not this drill — the probe form puts the three-table walk inside EXISTS with a single correlation equality." },
        { test: "^select\\b[^;]*\\bjoin\\b(?!\\s*(order_items|products))", message: "Keep the outer query naked — one table, one EXISTS. The joins live in the probe, not beside it." },
        { test: "category\\s*=\\s*'(audio|video)'", message: "Wrong shelf — Electronics is the brief; Audio would return 11 names and Video only 7." },
      ],
      expected: EXPECTED["l26-p4"],
      ordered: true,
    },
    {
      id: "l26-p5",
      title: "The empty ledger",
      brief: "Products that have **never appeared on any order line**, via `NOT EXISTS`. Output `name`, alphabetical. Run it and read the result with care — on this store the honest answer is a special one.",
      hints: [
        "Probe order_items for any line pointing at this product; keep products whose probe finds nothing.",
        "Shape: SELECT p.name FROM products p WHERE NOT EXISTS (SELECT 1 FROM order_items oi WHERE oi.product_id = p.id) ORDER BY p.name;",
      ],
      difficulty: "hard",
      solution:
        "SELECT p.name FROM products p\nWHERE NOT EXISTS (\n  SELECT 1 FROM order_items oi\n  WHERE oi.product_id = p.id\n)\nORDER BY p.name;",
      mistakes: [
        { test: "\\bcount\\s*\\(", message: "Counting lines per product answers popularity, not existence — the probe asks a yes/no question: does ANY line point here?" },
        { test: "\\bnot\\s+in\\b", message: "Fine on this NULL-free column — but the drill is NOT EXISTS, and only it survives if product_id ever grows a NULL." },
        { test: "\\binner\\s+join\\b(?!.*\\bis\\s+null\\b)", message: "A plain INNER JOIN keeps products WITH order lines — the opposite crowd. Existence-of-nothing is the probe's job." },
      ],
      expected: EXPECTED["l26-p5"],
      ordered: true,
    },
    {
      id: "l26-p6",
      title: "Everyone's own average",
      brief: "One row per customer with their personal mean: `name` and `avg_total` (2 decimals) — the average computed by a **correlated scalar in the SELECT list**, not GROUP BY. Order by avg_total, highest first.",
      hints: [
        "For each customer row, the inner query averages that customer's orders. Left-join thinking isn't needed — the correlation does the matching.",
        "Shape: SELECT c.name, (SELECT ROUND(AVG(o.total), 2) FROM orders o WHERE o.customer_id = c.id) AS avg_total FROM customers c ORDER BY avg_total DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name,\n  (SELECT ROUND(AVG(o.total), 2) FROM orders o\n   WHERE o.customer_id = c.id) AS avg_total\nFROM customers c\nORDER BY avg_total DESC;",
      mistakes: [
        { test: "\\bgroup\\s+by\\b", message: "GROUP BY + JOIN is the lesson-27 shape — this drill computes the per-row number with a correlated scalar in the SELECT list instead." },
        { test: "\\bjoin\\b", message: "No join — the correlation `o.customer_id = c.id` already ties each customer to their own orders." },
        { test: "^select\\s+count|\\bcount\\s*\\(", message: "Counts answer 'how many', the brief wants the mean — AVG(total) inside the correlated scalar." },
      ],
      expected: EXPECTED["l26-p6"],
      ordered: true,
    },
    {
      id: "l26-p7",
      title: "Outspending LATAM",
      brief: "Customers whose **lifetime spend** exceeds the ENTIRE LATAM region's spend. Compare each customer's SUM against a scalar subquery over the region — inside HAVING. Output `name` and `spend` (2 decimals), biggest first.",
      hints: [
        "LATAM's whole region spent one number; each customer's total is another. HAVING compares them — the scalar subquery may use IN for the region's customers.",
        "Shape: SELECT c.name, ROUND(SUM(o.total), 2) AS spend FROM customers c JOIN orders o ON … GROUP BY c.id HAVING SUM(o.total) > (SELECT SUM(total) FROM orders WHERE customer_id IN (SELECT id FROM customers WHERE region = '<region>')) ORDER BY spend DESC;",
      ],
      difficulty: "hard",
      solution:
        "SELECT c.name, ROUND(SUM(o.total), 2) AS spend\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING SUM(o.total) > (\n  SELECT SUM(total) FROM orders\n  WHERE customer_id IN (SELECT id FROM customers WHERE region = 'LATAM')\n)\nORDER BY spend DESC;",
      mistakes: [
        { test: "\\bwhere\\s+sum\\s*\\(", message: "WHERE runs before grouping — it can't see SUM(total). The comparison against the regional total belongs in HAVING." },
        { test: "\\bmax\\s*\\(|\\bavg\\s*\\(", message: "The bar is the region's SUM — every order Bruno (the only LATAM buyer with orders) ever placed, added up. Not the biggest or the average." },
        { test: "region\\s*=\\s*'(eu|us|apac)'", message: "Wrong region — LATAM is the small pond (852.44 total); beating EU or APAC would demand far more." },
      ],
      expected: EXPECTED["l26-p7"],
      ordered: true,
    },
    {
      id: "l26-p8",
      title: "Audio, but picky",
      brief: "Suppliers who (a) supply **Audio** products and (b) rate above the **supplier average**. One query, two subqueries: an IN over products and a scalar over suppliers. Output `name` and `rating`, best first.",
      hints: [
        "The supplier average is a scalar over suppliers; the Audio condition is a membership list over products. Both live in WHERE, joined by AND.",
        "Shape: SELECT name, rating FROM suppliers WHERE rating > (SELECT AVG(rating) FROM suppliers) AND id IN (SELECT supplier_id FROM products WHERE category = '<cat>') ORDER BY rating DESC;",
      ],
      difficulty: "medium",
      solution:
        "SELECT name, rating FROM suppliers\nWHERE rating > (SELECT AVG(rating) FROM suppliers)\n  AND id IN (SELECT supplier_id FROM products WHERE category = 'Audio')\nORDER BY rating DESC;",
      mistakes: [
        { test: "\\bjoin\\b", message: "No join required — supplier_id inside products is the membership list, and the rating bar is a scalar over suppliers. Two subqueries, zero joins." },
        { test: ">\\s*4\\.3", message: "Hardcoding 4.3 works today and dies tomorrow — compute the supplier average with the scalar subquery, live." },
        { test: "\\bgroup\\s+by\\b", message: "Nothing to group — every supplier is one row with one rating, compared against two subquery results." },
      ],
      expected: EXPECTED["l26-p8"],
      ordered: true,
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "EXISTS is a **per-row phone call**: for every outer row, dial the inner query with that row's key and listen for a single bit — *anyone home?* The inner query never ships data back; the projection (`SELECT 1`) is a placeholder the engine ignores, because the only product of the call is true or false. That reframing explains every EXISTS quirk at once: why `SELECT 1` is enough, why the call stops early, and why a NULL in some other column can't poison it the way it poisons NOT IN — a verdict about row *existence* has no NULL value to trip over.",
    },
    {
      kind: "engine",
      title: "you run SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped')",
      steps: [
        "**Outer scan** — EXPLAIN QUERY PLAN leads with `SCAN c`: the 16 customers stream past, one probe each.",
        "**The probe gets an index** — the plan continues `BLOOM FILTER ON o (customer_id=?, status=?)` then `SEARCH o EXISTS USING AUTOMATIC PARTIAL COVERING INDEX`: SQLite builds a transient index so every phone call is a seek, not a scan.",
        "**Short-circuit** — the seek stops at the first matching row. Customer 2 holds two orders, neither shipped — their call ends after two misses; nobody ever walks all 103 orders per customer.",
        "**Tally** — 10 customers hear yes (Alice through Pedro), 6 hear no, and NOT EXISTS flips the tally without re-running anything. The projection was never read — `SELECT 1`, `SELECT *`, even `SELECT NULL` all return the same 10 names.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Correlated subqueries re-run the whole inner query for every row — they're inherently slow.\"",
      truth: "The inner query re-*fires* per row but doesn't re-*do* the work: with the correlation key indexed (here, automatically), each firing is one seek that stops at the first hit. The 45-of-103 'above their own bar' query compares each order against its own household — a job a storewide average literally cannot express — and the plan labels it `CORRELATED SCALAR SUBQUERY`, one indexed pass per outer row. Slow correlated SQL is a missing-index smell, not a verdict on the shape.",
    },
    {
      kind: "edge",
      items: [
        { c: "Probing for a status that never occurs", r: "`EXISTS (… status = 'refunded')` returns **0** customers — every call comes back false. Flip to NOT EXISTS and all 16 pass. A vacuum probe is the cleanest way to check which side of EXISTS you're reading." },
        { c: "A one-row crowd can never clear its own bar", r: "2 customers own exactly one order; that order IS their own average, and `total > own-average` is false for it. Both contribute **0** to the 45 stellar orders — correlated self-comparisons need a crowd of at least two rows to fire." },
        { c: "The two bars are not nested sets", r: "37 orders clear both their household bar and the storewide 338.19; 8 more clear their own but not the storewide; 5 clear the storewide but not their own. 37 + 8 = 45 (household), 37 + 5 = 42 (storewide) — neither list contains the other." },
        { c: "NOT EXISTS is the NULL-proof anti-join", r: "`id NOT IN (SELECT shipped_at FROM orders)` collapses to 0 rows (NULLs poison it), while `NOT EXISTS (…)` on the same nullable column answers happily — existence verdicts have no NULL to trip on. Lesson 13's LEFT JOIN … IS NULL is the third spelling of the same question." },
      ],
    },
  ],
  takeaway: "EXISTS asks a yes/no question per outer row and stops at the first match; correlate it and the inner query reads the outer row — the only clean way to compare each row against its own crowd's summary.",
};
