import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson40: Lesson = {
  id: "lesson-40",
  num: 40,
  title: "Case study — the executive one-pager",
  blurb: "Module 6's finishing moves under one brief: a FILTER census, a folded region string, the grand-total stack, a typed band ladder and a deliberate cross join",
  minutes: 17,
  blocks: [
    {
      kind: "p",
      text: "The board meets in an hour and wants **one page**. Not twelve queries — one page with five artifacts: a four-number census, the supplier footprint as a single string, category revenue with its grand total, the catalog banded by price, and proof the supply network covers every sales region. This is Module 6's toolkit doing what it was built for: the aggregates that don't collapse, the string that folds a table, the stack that appends a total row, the ladder typed with VALUES, and the cartesian you choose on purpose.",
    },
    {
      kind: "table",
      headers: ["Artifact", "The spell"],
      rows: [
        ["Census: 52 · 30 · 14 · 7", "COUNT(*) FILTER (WHERE …) — four counts, one scan"],
        ["Supplier regions: 'APAC,EU,LATAM,US'", "GROUP_CONCAT(DISTINCT region ORDER BY region)"],
        ["Category revenue + GRAND TOTAL row", "UNION ALL stack, wrapped for the final sort"],
        ["Budget 8 · mid 4 · premium 4", "VALUES band ladder, half-open [lo, hi)"],
        ["6 suppliers × 4 regions = 24", "CROSS JOIN against DISTINCT regions"],
      ],
      caption: "The one-pager's bill of materials — every number seed-verified",
    },
    { kind: "diagram", figure: "l40-exec-onepager" },
    {
      kind: "warn",
      text: "The grand-total stack's sort rule: ORDER BY after a compound SELECT needs the outer wrapper — and sort by the VALUE, not the label, or 'GRAND TOTAL' files alphabetically between Fitness and Accessories.",
    },
    {
      kind: "tip",
      text: "Half-open bands [lo, hi) are what let the ladder's counts be trusted: 8 + 4 + 4 = 16 products, no doubles at the seams, no gaps. The moment a band closes both ends, boundary rows multiply.",
    },
    {
      kind: "p",
      text: "The debrief: this one-pager is the module-6 skill check — the exotic shapes doing real work. String aggregation produced the readable summary rows, the grand-total stack layered subtotals under detail without a UNION in sight, RIGHT/FULL OUTER preserved populations that INNER would have dropped, and the non-equi range join mapped items into price bands without a single equality. The executive takeaway matters as much as the SQL: every “unusual” shape here exists to answer a question the common shapes answer badly or not at all. When a reviewer asks “why FULL OUTER here?”, the answer is a population — “because rows with no match are the finding” — never “because it's fancier”. Expert SQL is judged by the fit between shape and question.",
    },
  ],
  mcqs: [
    {
      id: "l40-q1",
      prompt: "Why is `COUNT(*) FILTER (WHERE status = 'delivered')` the right census spell instead of four separate queries?",
      choices: [
        "It's shorter to type, that's all",
        "One scan of orders yields all four counts with private WHEREs each — guaranteed-consistent numbers from one snapshot of the data",
        "FILTER is faster because it caches",
        "Four queries would return different columns",
      ],
      answer: 1,
      why: "The one-pager needs numbers that agree with each other. Four queries run at four instants — a row inserted between them shifts one count but not its siblings. One scan, one snapshot, four FILTERed counts: 52/30/14/7 by construction.",
      notes: [
        { choice: 0, why: "Readability is a bonus, not the argument — the guarantee is consistency. Four separate queries can legitimately disagree with each other; one FILTERed scan cannot." },
      ],
    },
    {
      id: "l40-q2",
      prompt: "The grand-total row comes from `SELECT 'GRAND TOTAL', ROUND(SUM(…)) FROM order_items` stacked under the category rows. Which operator — and why does UNION ALL beat UNION here?",
      choices: [
        "UNION — the grand row is unique so dedupe is free",
        "UNION ALL — the stack must append, never audit; if a category row ever collided with the grand row, that's a bug you want to SEE",
        "INTERSECT — the grand row intersects all categories",
        "Either — they're identical for one extra row",
      ],
      answer: 1,
      why: "A grand total must equal the sum of the parts (34,833.28 across 7 categories + itself = 8 rows). UNION silently deletes duplicates — the failure mode where your grand row coincidentally equals a category row and vanishes. ALL appends blindly; that's the contract a total needs.",
      notes: [
        { choice: 2, why: "INTERSECT keeps only rows present in BOTH arms — it would return nothing here. Set difference and set intersection are comparisons; a total is an append." },
      ],
    },
    {
      id: "l40-q3",
      prompt: "The price ladder uses bands (0,50), (50,100), (100,9999) joined `ON price >= lo AND price < hi`. A product priced exactly 50.00 lands where — and why does the join shape guarantee it lands in only ONE band?",
      choices: [
        "Both budget and mid — the seams always double",
        "Exactly mid: 50 satisfies budget's `>= 0 AND < 50`? No — it fails `< 50` and passes mid's `>= 50 AND < 100`. Half-open [lo, hi) tiles the line with no overlap and no gap",
        "Premium — 50 rounds up",
        "Nowhere — boundary prices are dropped by BETWEEN joins",
      ],
      answer: 1,
      why: "Each band owns [lo, hi): budget owns 0 ≤ p < 50, mid owns 50 ≤ p < 100. The product at 50.00 fails the first band's `< 50` and passes the second's `>= 50` — one row, one band. That's why the ladder's counts sum to 16.",
      notes: [
        { choice: 0, why: "Doubling happens only when bands CLOSE both ends (<= hi). The half-open spelling is precisely what makes seams clean — and 8 + 4 + 4 = 16 proves it on this catalog." },
      ],
    },
    {
      id: "l40-q4",
      prompt: "The coverage check is `suppliers CROSS JOIN (SELECT DISTINCT region FROM customers)` = 24 rows. When is a cartesian the RIGHT tool?",
      choices: [
        "Whenever two tables have no shared column",
        "When the deliverable IS every pairing — 6 suppliers × 4 regions — and the absence of a match condition is the statement, not an accident",
        "Never — CROSS JOIN is always a bug",
        "Only for small tables",
      ],
      answer: 1,
      why: "CROSS JOIN says 'every combination, deliberately'. The coverage grid needs exactly that: each supplier against each region we sell to — 24 cells a planner fills in. A forgotten ON multiplies by accident; a written CROSS JOIN multiplies on purpose.",
      notes: [
        { choice: 3, why: "Size doesn't make a cartesian right or wrong — INTENT does. 6×4 is safe; 251×103 items-orders pairs would be a 25,853-row accident without an ON." },
      ],
    },
  ],
  problems: [
    {
      id: "l40-p1",
      title: "The four-number census",
      brief: "One row, four FILTERed counts: `delivered`, `shipped`, `pending`, `cancelled` — the store's whole pipeline in a single scan.",
      hints: [
        "Each COUNT gets its own FILTER clause — four private WHEREs over the same rows.",
        "Shape: SELECT COUNT(*) FILTER (WHERE status = 'delivered') AS delivered, COUNT(*) FILTER (WHERE status = 'shipped') AS shipped, … FROM orders;",
      ],
      difficulty: "medium",
      solution: "SELECT\n  COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,\n  COUNT(*) FILTER (WHERE status = 'shipped') AS shipped,\n  COUNT(*) FILTER (WHERE status = 'pending') AS pending,\n  COUNT(*) FILTER (WHERE status = 'cancelled') AS cancelled\nFROM orders;",
      mistakes: [
        { test: "\\bgroup\\s+by\\s+status", message: "GROUP BY returns four ROWS — the one-pager wants four COLUMNS of one row, which is what FILTER gives without buckets." },
        { test: "\\bsum\\s*\\(\\s*case\\b", message: "The CASE counter works — but this clinic drills FILTER, the readable spelling of the same conditional aggregate." },
        { test: "count\\(\\*\\)\\s+as\\s+delivered\\s+from\\s+orders\\s+where", message: "A top-level WHERE would filter the TABLE, collapsing the other counts to zero — each count needs its own FILTER, not a shared WHERE." },
      ],
      expected: EXPECTED["l40-p1"],
    },
    {
      id: "l40-p2",
      title: "Supplier regions, folded",
      brief: "The supplier footprint as one string: `regions` — every supplier region, deduped, comma-joined **alphabetically**. Expect 'APAC,EU,LATAM,US'.",
      hints: [
        "GROUP_CONCAT over the whole table; the ORDER BY lives INSIDE the aggregate so the string is deterministic.",
        "Shape: SELECT GROUP_CONCAT(DISTINCT region ORDER BY region) AS regions FROM suppliers;",
      ],
      difficulty: "easy",
      solution: "SELECT GROUP_CONCAT(DISTINCT region ORDER BY region) AS regions\nFROM suppliers;",
      mistakes: [
        { test: "\\bgroup\\s+by\\s+region", message: "GROUP BY region gives one ROW per region — the fold's whole point is one CELL containing all of them." },
        { test: "distinct\\s+region\\s+\\)", message: "GROUP_CONCAT(DISTINCT region) alone concatenates in arbitrary row order — the alphabetical promise needs ORDER BY region inside the aggregate." },
        { test: "\\bjoin\\b", message: "The footprint is supplier-side only — regions come straight from the suppliers table, no join required." },
      ],
      expected: EXPECTED["l40-p2"],
    },
    {
      id: "l40-p3",
      title: "Category revenue with the grand row",
      brief: "Seven category revenues plus a **'GRAND TOTAL'** row appended by UNION ALL. Output `category`, `revenue` (2 decimals), value order — the grand row (34,833.28) tops the list.",
      hints: [
        "Arm one: category revenue from items × products. Arm two: one labeled row summing all items. Wrap the stack and sort by value.",
        "Shape: SELECT category, revenue FROM (SELECT p.category AS category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue … GROUP BY p.category UNION ALL SELECT 'GRAND TOTAL', ROUND(SUM(oi.quantity * oi.unit_price), 2) FROM order_items oi) ORDER BY revenue DESC;",
      ],
      difficulty: "hard",
      solution: "SELECT category, revenue FROM (\n  SELECT p.category AS category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  GROUP BY p.category\n  UNION ALL\n  SELECT 'GRAND TOTAL', ROUND(SUM(oi.quantity * oi.unit_price), 2)\n  FROM order_items oi\n)\nORDER BY revenue DESC;",
      mistakes: [
        { test: "\\bunion\\b(?!\\s+all)", message: "Plain UNION audits for duplicates — a stack that appends a TOTAL wants UNION ALL, whose failures are visible instead of silent." },
        { test: "\\brollup\\b", message: "SQLite has no ROLLUP — the grand-total stack is the hand-built spelling of exactly what ROLLUP would give you. That's the clinic's point." },
        { test: "\\bgroup\\s+by\\s+rollup|with\\s+rollup", message: "No ROLLUP support in this engine — append the grand row with a second UNION ALL arm computing the ungrouped SUM." },
      ],
      expected: EXPECTED["l40-p3"],
      ordered: true,
    },
    {
      id: "l40-p4",
      title: "The catalog, banded",
      brief: "Type a **VALUES band ladder** — (0,50,'budget'), (50,100,'mid'), (100,9999,'premium') — and join products to it by range. Output `label`, `n`, ladder order. Counts must sum to 16.",
      hints: [
        "The CTE names the typed rows: WITH bands(lo, hi, label) AS (VALUES …). Join on price >= lo AND price < hi, count per label, order by MIN(lo).",
        "Shape: WITH bands(lo, hi, label) AS (VALUES (0,50,'budget'), (50,100,'mid'), (100,9999,'premium')) SELECT b.label, COUNT(*) AS n FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label ORDER BY MIN(b.lo);",
      ],
      difficulty: "hard",
      solution: "WITH bands(lo, hi, label) AS (\n  VALUES (0, 50, 'budget'), (50, 100, 'mid'), (100, 9999, 'premium')\n)\nSELECT b.label, COUNT(*) AS n\nFROM products p\nJOIN bands b ON p.price >= b.lo AND p.price < b.hi\nGROUP BY b.label\nORDER BY MIN(b.lo);",
      mistakes: [
        { test: "between\\s+b\\.lo\\s+and\\s+b\\.hi", message: "BETWEEN closes both ends — a 50.00 product would hit budget AND mid. The half-open `>= lo AND < hi` is what keeps every product in exactly one band." },
        { test: "\\bcase\\s+when\\b", message: "The CASE banding works — but this artifact drills VALUES: thresholds typed as a literal table, joinable and reusable without touching the SELECT." },
        { test: "\\border\\s+by\\s+label\\b", message: "Alphabetical would file premium first — ladder order is threshold order, ORDER BY MIN(b.lo)." },
      ],
      expected: EXPECTED["l40-p4"],
      ordered: true,
    },
    {
      id: "l40-p5",
      title: "Every supplier meets every region",
      brief: "The coverage grid: `supplier`, `region` — every supplier against every DISTINCT customer region, spelled with CROSS JOIN. 24 rows, supplier then region order.",
      hints: [
        "CROSS JOIN takes no ON — it pairs everything. The right arm is the deduped region list from customers.",
        "Shape: SELECT s.name AS supplier, r.region FROM suppliers s CROSS JOIN (SELECT DISTINCT region FROM customers) r ORDER BY s.name, r.region;",
      ],
      difficulty: "medium",
      solution: "SELECT s.name AS supplier, r.region\nFROM suppliers s\nCROSS JOIN (SELECT DISTINCT region FROM customers) r\nORDER BY s.name, r.region;",
      mistakes: [
        { test: "\\bon\\b", message: "CROSS JOIN takes no ON — adding a condition turns it into an inner join and the grid loses its 'every pairing' meaning." },
        { test: "\\bjoin\\s+customers\\b", message: "Joining customers directly fans out per customer row (96 pairs with repeats) — the grid wants DISTINCT regions, 4 columns not 16 rows' worth." },
        { test: "\\bgroup\\s+by\\b|\\bdistinct\\s+s\\.", message: "No dedupe needed downstream — the cross of 6 suppliers with 4 regions is exactly 24 unique pairs by construction." },
      ],
      expected: EXPECTED["l40-p5"],
      ordered: true,
    },
  ],
  takeaway: "The one-pager is Module 6 assembled: FILTER for the consistent census, GROUP_CONCAT for the folded footprint, UNION ALL for the grand total, VALUES for the typed ladder and CROSS JOIN for the coverage grid — every number provable, every spell chosen on purpose.",
  deep: [
    {
      kind: "mind",
      text: "A case study is **requirements engineering in miniature**: the brief arrives in stakeholder language and your job is to translate it into Module 6's expert shapes — string aggregation, grand-total stacks and every join variant — the executive one-pager, where exotic shapes answer questions common ones can't. The professional habit this trains: before any SQL, restate each ask as a shape (\"that's a filter\", \"that's a fold at month grain\", \"that's a preservation problem\") and name the grain of the promised output. Most wrong answers in real analyst work are not syntax errors; they are right answers to a slightly different question — the translation step is where they die. Work the brief top to bottom, reconcile every number you can against another (count vs sum, detail vs summary), and treat any mismatch as a finding, not a nuisance.",
    },
    {
      kind: "edge",
      items: [
        { c: "The ask behind the ask", r: "\"How many customers do we have?\" often means \"how many can we market to\" — the active flag, the region filter, the dedupe. Ask which population the stakeholder means; the SQL is easy once the noun is exact." },
        { c: "Empty results are findings", r: "A brief that expects holes may find none (this seed's anti-joins return zero rows). Report \"checked, none found\" with the query attached — silence in the result set is evidence too." },
        { c: "Grain mixing in one report", r: "Customer counts beside order sums in one table: stage each grain in its own CTE and join on the shared dimension. One query, two grains, no fan-out — the case studies quietly drill this every time." },
        { c: "The reproducibility test", r: "Hard-code the as-of date, avoid date('now'), and keep every number re-derivable from the seed. A founder-facing snapshot that can't be re-run and matched is a screenshot, not a report." },
      ],
    },  ],
};
