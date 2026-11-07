import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson34: Lesson = {
  id: "lesson-34",
  num: 34,
  title: "Every join shape — RIGHT, FULL, CROSS & beyond",
  blurb: "The completes-the-course clinic: outer joins from both sides and neither, the deliberate cartesian, and joins with no equality at all",
  minutes: 14,
  blocks: [
    {
      kind: "p",
      text: "You've written hundreds of INNER and LEFT joins; this clinic finishes the atlas. **RIGHT JOIN** keeps the right table the way LEFT keeps the left. **FULL OUTER JOIN** keeps both. **CROSS JOIN** pairs everything with everything — on purpose this time. And **non-equi joins** drop the `=` entirely, matching on ranges. None of these are exotic: they're the shapes that make the LEFT-only habit look like what it is — a choice, not a limit.",
    },
    { kind: "diagram", figure: "x2-join-atlas" },
    { kind: "h", text: "RIGHT JOIN — the flipped lens" },
    {
      kind: "code",
      caption: "Same cancelled-orders probe, kept from the other side: 19 rows",
      sql: `SELECT c.name, o.id AS order_id
FROM orders o
RIGHT JOIN customers c
  ON c.id = o.customer_id AND o.status = 'cancelled'
ORDER BY c.name;   -- the 4 cancelled pairs + 12 NULL-filled customers`,
    },
    {
      kind: "bullets",
      items: [
        "This query is `customers LEFT JOIN orders` with the FROM list swapped — identical 19 rows. That's the whole secret: **RIGHT is LEFT, read backwards**.",
        "So why does it exist? Chained queries: when the LEFT table is a derived table or a long join you've already written, `A RIGHT JOIN customers` spares you rewriting the chain to put customers first.",
        "Notice the AND living in ON: it filters only the order arm, so unmatched customers still survive with NULLs. Moving `status = 'cancelled'` to WHERE would kill the 12 NULL rows and turn this into an INNER join — lesson 12's WHERE-vs-ON trap, now from the right side.",
      ],
    },
    { kind: "h", text: "FULL OUTER — the audit join" },
    {
      kind: "code",
      caption: "Keep EVERYTHING from both sides: 115 rows and the story of each",
      sql: `SELECT o.id AS order_id, c.name
FROM orders o
FULL OUTER JOIN customers c
  ON c.id = o.customer_id AND o.status = 'cancelled';   -- 115 rows`,
    },
    {
      kind: "bullets",
      items: [
        "The 115 decomposes cleanly: **7** matched cancelled pairs, **96** orders kept unmatched (the AND-in-ON excluded them from matching but not from surviving), and **12** customers with no cancelled order, NULL-filled. Full outer never discards.",
        "It's the audit join: *show me everything, and mark what didn't line up*. Data-quality checks, reconciliation reports, migration diffs — anywhere 'what's missing on either side' is the question.",
        "MySQL has no FULL OUTER JOIN at all. The lesson-13 toolkit emulates it: a LEFT arm UNION ALL'd with the reversed LEFT-JOIN-…-IS-NULL anti-join arm.",
      ],
    },
    { kind: "h", text: "CROSS JOIN — the deliberate cartesian" },
    {
      kind: "code",
      caption: "Every product against every supplier: 16 × 6 = 96 pairings",
      sql: `SELECT COUNT(*) AS pairings
FROM products CROSS JOIN suppliers;   -- 96`,
    },
    {
      kind: "bullets",
      items: [
        "No ON, no matching — every row of A pairs with every row of B. Lesson 10 met this as the *accident* (a JOIN with no ON degenerates into one); spelled deliberately, it's a generator.",
        "Real uses: every product × every price band (the what-if grid), every day × every store (the calendar skeleton), every customer × every campaign (the mail-merge matrix). Lesson 30's 'empty months' problem — buckets missing from GROUP BY — is solved by CROSS JOINing a calendar table in.",
        "Filter it and it becomes an old-school INNER join: `CROSS JOIN … WHERE …` predates the ON keyword entirely. Same rows as INNER; the modern spelling just says what it means next to what it does.",
      ],
    },
    { kind: "diagram", figure: "x4-range-join" },
    { kind: "h", text: "Non-equi joins — matching without =" },
    {
      kind: "code",
      caption: "A band ladder built from VALUES, joined by BETWEEN: 8 · 30 · 40 · 25",
      sql: `WITH bands(lo, hi, label) AS (
  VALUES (0, 50, 'small'), (50, 200, 'medium'),
         (200, 500, 'large'), (500, 9999, 'jumbo')
)
SELECT b.label, COUNT(*) AS n
FROM orders o
JOIN bands b ON o.total >= b.lo AND o.total < b.hi
GROUP BY b.label ORDER BY MIN(b.lo);   -- small 8 · medium 30 · large 40 · jumbo 25`,
    },
    {
      kind: "bullets",
      items: [
        "No foreign key connects orders to bands — the join predicate is a **range**. Each order matches every band its total falls inside; the half-open bounds (>= lo, < hi) guarantee exactly one match per order.",
        "Fanout awareness: a looser ladder (overlapping bounds, or only a lower bound) would match orders to MULTIPLE bands — the row multiplication you've learned to smell. Bounds are the design.",
        "Self non-equi is the classic: `products a JOIN products b ON a.category = b.category AND a.price > b.price` — every pricier/cheaper same-category pair, **12** on this catalog. Lesson 14's mirror-dedupe (a.id < b.id) was this shape all along.",
      ],
    },
    {
      kind: "warn",
      text: "Two shapes this schema can't exercise, for honest reasons: **composite-key joins** (`ON a.k1 = b.k1 AND a.k2 = b.k2`) need multi-column foreign keys — every FK here is single-column — and **NATURAL JOIN** (implicit column-name matching) is best avoided anyway: one renamed column silently changes the join. Spell joins out; future-you is the teammate who reads them.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "RIGHT JOIN and FULL OUTER JOIN landed in SQLite 3.39 (2022) — this app's engine runs both natively. Before that release, flip to LEFT and emulate FULL with the UNION ALL pair.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL: RIGHT JOIN yes, FULL OUTER JOIN no — emulate with LEFT arm UNION ALL reversed-anti arm. CROSS JOIN is a synonym for the comma join there (and INNER JOIN without ON parses — a foot-gun PostgreSQL refuses).",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres has had every shape forever, plus LATERAL joins (a FROM-subquery that may reference earlier FROM items — the correlated derived table) and the strict no-condition rule: a bare JOIN without ON is a syntax error. Say CROSS JOIN when you mean it.",
    },
    {
      kind: "tip",
      text: "Default to LEFT even now: flip the tables instead of writing RIGHT, and reach for FULL only when 'everything from both sides' is literally the brief. The rarer the shape, the more the join deserves a comment saying why.",
    },
  ],
  mcqs: [
    {
      id: "l34-q1",
      prompt: "`A RIGHT JOIN B` returns exactly the same rows as…",
      choices: ["A LEFT JOIN B", "B LEFT JOIN A — with the select list adjusted", "A INNER JOIN B", "A FULL OUTER JOIN B"],
      answer: 1,
      why: "RIGHT keeps B's unmatched rows; LEFT keeps the FROM-first table's. Swap the operands and RIGHT becomes LEFT — identical rows, different spelling.",
      notes: [
        { choice: 3, why: "FULL keeps BOTH sides' unmatched rows — strictly more than RIGHT (which still discards A's orphans). Right's keep is one-sided." },
      ],
    },
    {
      id: "l34-q2",
      prompt: "The FULL OUTER join with `ON c.id = o.customer_id AND o.status = 'cancelled'` returns 115 rows. Where do the 96 non-cancelled orders come from?",
      choices: [
        "They don't — the count is wrong",
        "FULL keeps ALL left rows: the AND excluded them from matching, not from surviving",
        "They match customers who happen to have cancelled orders too",
        "CROSS JOIN leakage",
      ],
      answer: 1,
      why: "Outer joins preserve the kept side unconditionally; ON decides who MATCHES, not who SURVIVES. 7 pairs + 96 surviving orders + 12 NULL-filled customers = 115.",
      notes: [
        { choice: 0, why: "The surprising count is the lesson — the same ON over LEFT gives 103 and over INNER gives 7. FULL is the only one keeping every row of both sides." },
      ],
    },
    {
      id: "l34-q3",
      prompt: "Which engine needs the UNION-ALL emulation because it has no FULL OUTER JOIN?",
      choices: ["SQLite", "PostgreSQL", "MySQL", "All of them — nobody ships it"],
      answer: 2,
      why: "MySQL has RIGHT but no FULL — the LEFT-arm-UNION-ALL-reversed-anti-arm stack is the standard emulation. SQLite gained FULL in 3.39; Postgres always had it.",
      notes: [
        { choice: 0, why: "Only pre-3.39 SQLite lacks it — the engine this app runs is newer and executes FULL OUTER JOIN natively." },
      ],
    },
    {
      id: "l34-q4",
      prompt: "`products CROSS JOIN suppliers` over 16 products and 6 suppliers returns…",
      choices: ["6 rows", "16 rows", "96 rows — every pairing", "22 rows"],
      answer: 2,
      why: "CROSS multiplies: 16 × 6 = 96 pairings, no conditions. It's the deliberate cartesian — the generator for grids, calendars and campaign matrices.",
      notes: [
        { choice: 1, why: "That's what a one-to-many LEFT would give (16 products, each with its suppliers). CROSS doesn't match — it multiplies." },
      ],
    },
    {
      id: "l34-q5",
      prompt: "How does a CROSS JOIN + WHERE filter relate to an INNER JOIN?",
      choices: [
        "Different results — CROSS can't filter",
        "Same rows — the WHERE re-implements the ON condition (the pre-1992 spelling)",
        "CROSS + WHERE is a syntax error",
        "INNER is faster on every engine",
      ],
      answer: 1,
      why: "`FROM a CROSS JOIN b WHERE a.x = b.y` is the comma-join era spelling of `a JOIN b ON a.x = b.y`. Modern code says ON — but the equivalence explains why the accidental cartesian looks like a broken INNER.",
      notes: [
        { choice: 3, why: "Engines optimize them identically — the difference is human: ON documents intent at the join, WHERE buries it below." },
      ],
    },
    {
      id: "l34-q6",
      prompt: "In the band ladder, why does order #12 (148.28) match exactly ONE band and not all four?",
      choices: [
        "The engine picks the closest band",
        "The half-open bounds (>= lo AND < hi) tile the range — only medium contains 148.28",
        "GROUP BY collapses the extras",
        "Bands with lo > 148.28 are NULL-filled instead",
      ],
      answer: 1,
      why: "Non-equi matching hits EVERY true predicate — the bounds' design (0–50, 50–200, 200–500, 500–∞) makes exactly one true per order. Sloppy bounds would fan the join out.",
      notes: [
        { choice: 2, why: "GROUP BY would hide duplicates in the count, not prevent them — the bounds prevent the fanout; the GROUP BY just counts survivors." },
      ],
    },
    {
      id: "l34-q7",
      prompt: "A real-world orders table joins a shipments table on BOTH order_id AND line_no. What does that teach about the ON clause?",
      choices: [
        "ON accepts only one equality",
        "Composite keys need every key column matched: ON a.order_id = b.order_id AND a.line_no = b.line_no",
        "That's what NATURAL JOIN is for",
        "You must CROSS JOIN then filter",
      ],
      answer: 1,
      why: "ON is an arbitrary predicate — composite joins chain the equalities with AND. (This store's schema is single-column by design, which is exactly why the shape never came up until now.)",
      notes: [
        { choice: 2, why: "NATURAL JOIN matches by column NAMES — invisible coupling that breaks when someone renames a column. Composite joins are spelled out, not divined." },
      ],
    },
    {
      id: "l34-q8",
      prompt: "When is RIGHT JOIN genuinely the better spelling over flipping to LEFT?",
      choices: [
        "Never — RIGHT is always wrong",
        "When the left operand is a long derived table or join chain you'd have to rewrite to put the keeper first",
        "When you need extra rows",
        "When the right table is smaller",
      ],
      answer: 1,
      why: "RIGHT exists for chain readability: `big_written_once RIGHT JOIN customers` avoids rebuilding the FROM list. Row-for-row it's a flipped LEFT — the choice is ergonomics, not semantics.",
      notes: [
        { choice: 0, why: "Too absolute — the team-comment point stands (LEFT reads forward), but chaining long derived tables is RIGHT's honest niche." },
      ],
    },
    {
      id: "l34-q9",
      prompt: "`orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'` — why 19 rows and not 7?",
      choices: [
        "RIGHT JOIN multiplies matches by region count",
        "RIGHT keeps every customer: the 7 matched cancelled pairs plus 12 customers with no cancelled order, NULL-filled",
        "The status filter failed and every order survived",
        "7 was the INNER count — RIGHT doubles it",
      ],
      answer: 1,
      why: "RIGHT JOIN preserves the right table exactly as LEFT preserves the left. All 16 customers survive: the 4 cancelled customers own 7 cancelled orders (7 matched pairs), and the other 12 customers ride along NULL-filled — 7 + 12 = 19.",
      notes: [
        { choice: 2, why: "The AND-in-ON filters only the order arm — customers never get filtered by it. Moving status to WHERE would kill the NULL rows and collapse the query to an INNER 7." },
      ],
    },
    {
      id: "l34-q10",
      prompt: "`orders o FULL OUTER JOIN customers c ON c.id = o.customer_id AND o.status = 'cancelled'` = 115 rows. What's the decomposition?",
      choices: [
        "103 orders + 12 never-cancelled customers — every order survives unmatched included, every customer too",
        "115 cancelled pairs",
        "103 customers + 12 orders",
        "7 INNER rows + 108 NULL rows",
      ],
      answer: 0,
      why: "FULL = LEFT arm + reversed-anti arm. From the orders side all 103 survive (only 7 found a cancelled match); from the customers side the 12 with no cancelled order arrive NULL-filled. 103 + 12 = 115 — nothing discarded from either side.",
      notes: [
        { choice: 1, why: "Only 7 orders are cancelled — the other 96 order rows survive UNmatched (the AND-in-ON excluded them from matching, not from existing). That's the audit join's whole story." },
      ],
    },
    {
      id: "l34-q11",
      prompt: "Why does NATURAL JOIN get flagged as a foot-gun even though it 'saves writing the ON'?",
      choices: [
        "It's deprecated syntax that errors in SQLite",
        "It joins on EVERY identically named column pair — one stray shared name (like region, or created_at) silently changes which rows match",
        "It only works on primary keys",
        "It's slower — nothing more",
      ],
      answer: 1,
      why: "NATURAL infers the join condition from column names. This store's customers and suppliers both have name and region — a natural join between them would pair on two meaningless matches. Explicit ON is the safety harness.",
      notes: [
        { choice: 3, why: "The danger isn't speed, it's semantics: the join condition changes the moment a column is added or renamed. 'Saved keystrokes' is a terrible trade for that." },
      ],
    },
    {
      id: "l34-q12",
      prompt: "In the band ladder, `WITH bands(lo, hi, label) AS (VALUES (0, 50, 'small'), (50, 200, 'medium'), …)` — what IS `VALUES` here?",
      choices: [
        "A system table that must exist beforehand",
        "An inline table constructor — rows you type directly in SQL, given names by the CTE header",
        "A function that generates ranges",
        "A stand-in for the orders table",
      ],
      answer: 1,
      why: "VALUES (…),(…) builds a literal table on the fly; the CTE names it and its columns: bands(lo, hi, label). Four typed thresholds become a joinable table — no DDL, no temp table, one query.",
      notes: [
        { choice: 2, why: "No generation logic exists here — every row is hand-typed. That's the point: thresholds you can read and edit next to the query that uses them." },
      ],
    },
    {
      id: "l34-q13",
      prompt: "The ladder joins `ON o.total >= b.lo AND o.total < b.hi` — bands 0/50, 50/200, 200/500, 500/9999. Why half-open `[lo, hi)` and what does 'medium' count?",
      choices: [
        "Half-open prevents double-counting at the seams — medium (50 ≤ total < 200) holds 30 orders",
        "Half-open is a style choice; medium holds 30 either way",
        "It drops boundary rows — 4 orders go missing",
        "medium holds 50 — everything below 200",
      ],
      answer: 0,
      why: "If both ranges were closed, an order totaling exactly 50.00 would match 'small' AND 'medium' — fan-out inflating the sum past 103. Half-open intervals tile the number line: 8 + 30 + 40 + 25 = 103, no orphans, no doubles.",
      notes: [
        { choice: 1, why: "Not a style choice — with closed bands the counts stop summing to 103 the moment an order sits exactly on a seam. The equation 8 + 30 + 40 + 25 = 103 is the proof that [lo, hi) tiles perfectly." },
      ],
    },
    {
      id: "l34-q14",
      prompt: "NATURAL JOIN vs `USING (region)` — what's the precise relationship?",
      choices: [
        "They're identical spellings",
        "NATURAL is USING-everything: it auto-detects ALL shared column names — USING (region) matches only the one column you name",
        "USING is stricter about types only",
        "NATURAL needs the columns to be primary keys",
      ],
      answer: 1,
      why: "USING (region) pins the match to region alone; NATURAL infers the whole list from shared names — customers ⋈ suppliers share name AND region, so a natural join would silently match both. Naming the columns (ON or USING) keeps the semantics yours.",
      notes: [
        { choice: 0, why: "One stray shared column ('name' is everywhere) makes them diverge completely — that's exactly why NATURAL is a foot-gun while USING is merely terse." },
      ],
    },
  ],
  problems: [
    {
      id: "l34-p1",
      title: "From the right side",
      brief: "The cancelled-orders probe, spelled with RIGHT JOIN: output `name` and `order_id` — one row per customer (NULL order_id when they have no cancelled order), name order, then order id. Nineteen rows.",
      hints: [
        "orders is the FROM table, customers the RIGHT one; the status condition lives in ON so the unmatched customers survive.",
        "Shape: SELECT c.name, o.id AS order_id FROM orders o RIGHT JOIN customers c ON c.id = o.customer_id AND o.status = '<status>' ORDER BY c.name, o.id;",
      ],
      difficulty: "easy",
      solution:
        "SELECT c.name, o.id AS order_id\nFROM orders o\nRIGHT JOIN customers c\n  ON c.id = o.customer_id AND o.status = 'cancelled'\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bwhere\\s+o\\.?status\\s*=\\s*'cancelled'", message: "The status belongs in ON — a WHERE would discard the 12 unmatched customers and shrink this to the 7 INNER rows." },
        { test: "\\bleft\\s+join\\b", message: "Same rows, different spelling — this drill reads the join from the right side: orders FROM, customers RIGHT JOINed." },
        { test: "\\binner\\s+join\\b", message: "INNER drops the 12 NULL-filled customers — the brief wants every customer present, cancelled order or not." },
      ],
      expected: EXPECTED["l34-p1"],
      ordered: true,
    },
    {
      id: "l34-p2",
      title: "Counting the everything",
      brief: "How many rows does the FULL OUTER JOIN of orders to customers (with AND o.status = 'cancelled' in ON) produce? Output one column `full_rows`. Let the number surprise you, then explain it to yourself.",
      hints: [
        "FULL keeps every order AND every customer — the ON condition only decides who matches.",
        "Shape: SELECT COUNT(*) AS full_rows FROM orders o FULL OUTER JOIN customers c ON c.id = o.customer_id AND o.status = '<status>';",
      ],
      difficulty: "easy",
      solution:
        "SELECT COUNT(*) AS full_rows\nFROM orders o\nFULL OUTER JOIN customers c\n  ON c.id = o.customer_id AND o.status = 'cancelled';",
      mistakes: [
        { test: "\\bleft\\s+outer\\s+join\\b|\\bleft\\s+join\\b", message: "LEFT keeps only the left side — 103 rows. FULL keeps the customers too: +12 gap rows = 115." },
        { test: "\\binner\\s+join\\b", message: "INNER keeps only the 7 matched pairs — the audit join's whole point is everything else surviving too." },
        { test: "\\bwhere\\s+o\\.?status", message: "The condition belongs in ON — moving it to WHERE filters after the keep and collapses the audit into an INNER count." },
      ],
      expected: EXPECTED["l34-p2"],
    },
    {
      id: "l34-p3",
      title: "The flip proof",
      brief: "Prove the equivalence: the same 19-row result spelled with LEFT JOIN (customers FROM, orders LEFT JOINed). Output `name` and `order_id`, name order then order id.",
      hints: [
        "Swap the FROM list, RIGHT becomes LEFT — the ON clause is untouched.",
        "Shape: SELECT c.name, o.id AS order_id FROM customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.status = '<status>' ORDER BY c.name, o.id;",
      ],
      difficulty: "medium",
      solution:
        "SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o\n  ON c.id = o.customer_id AND o.status = 'cancelled'\nORDER BY c.name, o.id;",
      mistakes: [
        { test: "\\bright\\s+join\\b", message: "That's where you came FROM — the proof is the flip: customers first, orders LEFT JOINed, same ON." },
        { test: "\\bwhere\\s+o\\.?status", message: "Keep the status filter in ON — the WHERE move deletes the 12 NULL rows and the proof collapses." },
        { test: "\\bfull\\s+outer\\b", message: "FULL adds the unmatched orders (96 of them) — the target here is exactly the 19-row two-sided-kept picture of RIGHT." },
      ],
      expected: EXPECTED["l34-p3"],
      ordered: true,
    },
    {
      id: "l34-p4",
      title: "The pairing census",
      brief: "Every product × every supplier pairing, deliberately: output one column `pairings` with the CROSS JOIN count.",
      hints: [
        "No ON, no matching — CROSS JOIN multiplies: 16 products × 6 suppliers.",
        "Shape: SELECT COUNT(*) AS pairings FROM products CROSS JOIN suppliers;",
      ],
      difficulty: "medium",
      solution:
        "SELECT COUNT(*) AS pairings\nFROM products\nCROSS JOIN suppliers;",
      mistakes: [
        { test: "\\bon\\b", message: "CROSS JOIN takes no ON — the moment you add one you've written an INNER join and the census shrinks to real relationships." },
        { test: "\\binner\\s+join\\b", message: "INNER matches on supplier_id — 16 rows (every product has a supplier). The deliberate cartesian is CROSS: 16 × 6." },
        { test: "\\bwhere\\b", message: "No filter asked — the census counts every theoretical pairing, matched relationship or not." },
      ],
      expected: EXPECTED["l34-p4"],
    },
    {
      id: "l34-p5",
      title: "The band ladder",
      brief: "Build the order-value ladder: a VALUES CTE of (lo, hi, label) — 0/50 small, 50/200 medium, 200/500 large, 500/9999 jumbo — joined to orders by range. Output `label` and `n`, ladder order. The counts sum to 103.",
      hints: [
        "The join predicate is a range: o.total >= b.lo AND o.total < b.hi. Group by the label, order by MIN(b.lo) to keep the ladder upright.",
        "Shape: WITH bands(lo, hi, label) AS (VALUES (0, 50, 'small'), …) SELECT b.label, COUNT(*) AS n FROM orders o JOIN bands b ON o.total >= b.lo AND o.total < b.hi GROUP BY b.label ORDER BY MIN(b.lo);",
      ],
      difficulty: "hard",
      solution:
        "WITH bands(lo, hi, label) AS (\n  VALUES (0, 50, 'small'), (50, 200, 'medium'),\n         (200, 500, 'large'), (500, 9999, 'jumbo')\n)\nSELECT b.label, COUNT(*) AS n\nFROM orders o\nJOIN bands b ON o.total >= b.lo AND o.total < b.hi\nGROUP BY b.label\nORDER BY MIN(b.lo);",
      mistakes: [
        { test: ">\\s*b\\.lo", message: "A bare > against lo matches EVERY lower band too — the fanout. Pair the bounds: >= lo AND < hi, one match per order." },
        { test: "(?<![<>])=\\s*b\\.(lo|hi)", message: "No equality exists between orders and bands — this join matches on a RANGE, not a key." },
        { test: "order\\s+by\\s+n\\s+desc", message: "Sorting by count scrambles the ladder — ORDER BY MIN(b.lo) keeps small → jumbo." },
      ],
      expected: EXPECTED["l34-p5"],
      ordered: true,
    },
    {
      id: "l34-p6",
      title: "Pricier than its neighbor",
      brief: "Same-category price pairs: every pair where a is pricier than b. Output `pricier`, `cheaper`, and `gap` = ROUND(a.price − b.price, 2), biggest gap first (then pricier name). Twelve pairs.",
      hints: [
        "The self-join's condition is an inequality: a.category = b.category AND a.price > b.price. No dedupe needed — price > price is already one-directional.",
        "Shape: SELECT a.name AS pricier, b.name AS cheaper, ROUND(a.price - b.price, 2) AS gap FROM products a JOIN products b ON a.category = b.category AND a.price > b.price ORDER BY gap DESC, pricier;",
      ],
      difficulty: "hard",
      solution:
        "SELECT a.name AS pricier, b.name AS cheaper,\n  ROUND(a.price - b.price, 2) AS gap\nFROM products a\nJOIN products b\n  ON a.category = b.category AND a.price > b.price\nORDER BY gap DESC, pricier;",
      mistakes: [
        { test: "<\\s*b\\.price", message: "That finds the CHEAPER a-side — the brief wants a pricier than b: a.price > b.price." },
        { test: "a\\.id\\s*<\\s*b\\.id", message: "The lesson-14 mirror-dedupe removes pairing duplicates — here the price inequality is already one-directional; the id guard would delete real pairs." },
        { test: "\\bcategory\\s*=\\s*'", message: "No literal category — the pairs come from the equality a.category = b.category matching WITHIN whatever category both sides belong to." },
      ],
      expected: EXPECTED["l34-p6"],
      ordered: true,
    },
    {
      id: "l34-p7",
      title: "The MySQL emulation",
      brief: "Build FULL OUTER the portable way: a LEFT arm over orders→customers UNION ALL'd with the reversed anti-join arm (customers LEFT JOIN orders, keeping only unmatched). Count the result: output one column `emulated_full`.",
      hints: [
        "Arm one: every order with its matched-or-NULL customer (103 rows). Arm two: customers whose probe found no cancelled order (12 rows). Count the union: 115.",
        "Shape: SELECT COUNT(*) AS emulated_full FROM (SELECT o.id, c.name FROM orders o LEFT JOIN customers c ON c.id = o.customer_id AND o.status = '<status>' UNION ALL SELECT o.id, c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id AND o.status = '<status>' WHERE o.id IS NULL) e;",
      ],
      difficulty: "hard",
      solution:
        "SELECT COUNT(*) AS emulated_full\nFROM (\n  SELECT o.id, c.name\n  FROM orders o\n  LEFT JOIN customers c\n    ON c.id = o.customer_id AND o.status = 'cancelled'\n  UNION ALL\n  SELECT o.id, c.name\n  FROM customers c\n  LEFT JOIN orders o\n    ON c.id = o.customer_id AND o.status = 'cancelled'\n  WHERE o.id IS NULL\n) e;",
      mistakes: [
        { test: "\\bunion\\b(?!\\s+all\\b)", message: "Bare UNION dedupes — two NULL-named rows would collide and the count would drop below the true 115." },
        { test: "\\bfull\\s+outer\\b", message: "That's the point of the drill — the emulation stands in for FULL where engines (MySQL) don't ship it. No FULL keyword allowed." },
        { test: "where\\s+o\\.id\\s+is\\s+not\\s+null", message: "The second arm keeps only the UNMATCHED customers (IS NULL) — IS NOT NULL would re-add the matched pairs and double-count them." },
      ],
      expected: EXPECTED["l34-p7"],
    },
    {
      id: "l34-p8",
      title: "The campaign matrix",
      brief: "Mail-merge grid: every ACTIVE customer paired with every Electronics product. CROSS JOIN with a WHERE — output one column `campaign_rows`.",
      hints: [
        "Generate the full pairing first, filter to the campaign: 14 active customers × 3 Electronics products.",
        "Shape: SELECT COUNT(*) AS campaign_rows FROM customers c CROSS JOIN products p WHERE c.active = 1 AND p.category = '<cat>';",
      ],
      difficulty: "medium",
      solution:
        "SELECT COUNT(*) AS campaign_rows\nFROM customers c\nCROSS JOIN products p\nWHERE c.active = 1 AND p.category = 'Electronics';",
      mistakes: [
        { test: "\\bjoin\\b(?!\\s+\\bproducts)", message: "No relationship join exists between customers and products — that's the signal for CROSS: pair everything, then filter the campaign." },
        { test: "active\\s*=\\s*0", message: "0 is the INACTIVE flag — the campaign targets the 14 active customers: active = 1." },
        { test: "\\bcategory\\s*=\\s*'(audio|video)'", message: "The campaign shelf is Electronics (3 products) — Audio or Video would draw from a different stockroom." },
      ],
      expected: EXPECTED["l34-p8"],
    },
    {
      id: "l34-p9",
      title: "The price ladder",
      brief: "Catalog pricing bands as a VALUES ladder — (0, 30, 'entry'), (30, 60, 'core'), (60, 120, 'pro'), (120, 99999, 'elite') — joined to products by the closed-open rule. Output `label` and `n`, ladder order. The counts must sum to 16.",
      hints: [
        "Closed-open means >= lo AND < hi — each price matches exactly one band. Order by MIN(b.lo) to keep the ladder upright.",
        "Shape: WITH bands(lo, hi, label) AS (VALUES (0, 30, 'entry'), …) SELECT b.label, COUNT(*) AS n FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label ORDER BY MIN(b.lo);",
      ],
      difficulty: "hard",
      solution:
        "WITH bands(lo, hi, label) AS (\n  VALUES (0, 30, 'entry'), (30, 60, 'core'),\n         (60, 120, 'pro'), (120, 99999, 'elite')\n)\nSELECT b.label, COUNT(*) AS n\nFROM products p\nJOIN bands b ON p.price >= b.lo AND p.price < b.hi\nGROUP BY b.label\nORDER BY MIN(b.lo);",
      mistakes: [
        { test: ">\\s*=\\s*b\\.hi|<\\s*=\\s*b\\.hi", message: "The upper bound is OPEN (< hi, never <=) — a price exactly at a boundary must belong to the band above, not both." },
        { test: ">\\s*b\\.lo", message: "Strict > at the lower bound silently drops exactly-at-lo prices — closed-open is >= lo AND < hi, the contract that never loses or doubles a boundary." },
        { test: "order\\s+by\\s+b\\.label", message: "Alphabetical order scrambles the ladder (core < elite < entry < pro) — ORDER BY MIN(b.lo) keeps small → large." },
      ],
      expected: EXPECTED["l34-p9"],
      ordered: true,
    },
    {
      id: "l34-p10",
      title: "The supplier price gap",
      brief: "Within each supplier, how many cheaper→pricier product pairs exist? A self non-equi join on products: same supplier, strictly lower price on the left. Output one column `pairs`.",
      hints: [
        "Two conditions in ON: p1.supplier_id = p2.supplier_id AND p1.price < p2.price. The inequality is already one-directional — no id guard needed.",
        "Shape: SELECT COUNT(*) AS pairs FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price;",
      ],
      difficulty: "medium",
      solution:
        "SELECT COUNT(*) AS pairs\nFROM products p1\nJOIN products p2\n  ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price;",
      mistakes: [
        { test: "p1\\.id\\s*<\\s*p2\\.id", message: "The id guard halves legitimate pairs — the price inequality ALREADY breaks symmetry (a product can't be cheaper than itself, and only one direction of each pair survives)." },
        { test: "<=\\s*p2\\.price", message: "Equal prices would self-pair and double-count ties — the brief says strictly cheaper: <." },
        { test: "\\bwhere\\b", message: "Both conditions join the two COPIES of products — they belong in ON. A WHERE after the cross product computes the same rows here, but the ON is where the pairing logic lives." },
      ],
      expected: EXPECTED["l34-p10"],
    },
    {
      id: "l34-p11",
      title: "Close cousins",
      brief: "Tighten the supplier gap: keep only pairs where the pricier item costs less than 1.5× the cheaper one — same supplier, p1.price < p2.price < p1.price * 1.5. Output one column `close_pairs`.",
      hints: [
        "Stack a third predicate in ON: AND p2.price < p1.price * 1.5. Each extra inequality shrinks the surviving set.",
        "Shape: SELECT COUNT(*) AS close_pairs FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price AND p2.price < p1.price * 1.5;",
      ],
      difficulty: "hard",
      solution:
        "SELECT COUNT(*) AS close_pairs\nFROM products p1\nJOIN products p2\n  ON p1.supplier_id = p2.supplier_id\n AND p1.price < p2.price\n AND p2.price < p1.price * 1.5;",
      mistakes: [
        { test: "1\\.5\\s*<\\s*p2|p2\\.price\\s*>\\s*p1\\.price\\s*\\*\\s*1\\.5", message: "The ratio test keeps pairs CLOSE in price — p2 must be UNDER 1.5× p1, not over it. Reversed, the filter keeps only the widest gaps." },
        { test: "\\bwhere\\s+p2\\.price", message: "All three predicates participate in the PAIRING — they belong in ON together. Splitting them into WHERE still computes the same count here, but the ON is the contract." },
        { test: "round\\s*\\(\\s*p1\\.price", message: "No rounding — the ratio test runs on raw prices. Rounding belongs in output columns, never in join predicates." },
      ],
      expected: EXPECTED["l34-p11"],
    },
    {
      id: "l34-p12",
      title: "The expense ladder",
      brief: "Finance wants the spend ladder in cents: (0, 40000, 'petty'), (40000, 80000, 'modest'), (80000, 999999999, 'major') joined to expenses by range. Output `label` and `n`, ladder order. Counts must sum to 36.",
      hints: [
        "Same closed-open join as the price ladder, on amount_cents: >= lo AND < hi. GROUP BY the label.",
        "Shape: WITH bands(lo, hi, label) AS (VALUES (0, 40000, 'petty'), …) SELECT b.label, COUNT(*) AS n FROM expenses e JOIN bands b ON e.amount_cents >= b.lo AND e.amount_cents < b.hi GROUP BY b.label ORDER BY MIN(b.lo);",
      ],
      difficulty: "medium",
      solution:
        "WITH bands(lo, hi, label) AS (\n  VALUES (0, 40000, 'petty'), (40000, 80000, 'modest'),\n         (80000, 999999999, 'major')\n)\nSELECT b.label, COUNT(*) AS n\nFROM expenses e\nJOIN bands b ON e.amount_cents >= b.lo AND e.amount_cents < b.hi\nGROUP BY b.label\nORDER BY MIN(b.lo);",
      mistakes: [
        { test: "/\\s*100", message: "No dividing — the ladder is declared in CENTS to match amount_cents exactly. Mixing units (dividing by 100) breaks the comparison silently." },
        { test: "<\\s*=\\s*b\\.hi", message: "Open upper bound: an expense of exactly 40,000 cents belongs to modest, not petty — both bands would claim it if the hi were inclusive." },
        { test: "\\bsum\\s*\\(", message: "The brief wants COUNTS per band, not sums — COUNT(*) counts the matched rows; SUM(amount_cents) would answer a different memo." },
      ],
      expected: EXPECTED["l34-p12"],
      ordered: true,
    },
    {
      id: "l34-p13",
      title: "The loyalty tiers",
      brief: "Bin every customer by lifetime spend: stage per-customer SUM(total) in a CTE, then range-join a tiers ladder — (0, 200, 'bronze'), (200, 500, 'silver'), (500, 900, 'gold'), (900, 999999, 'platinum'). Output `label` and `n`, tier order.",
      hints: [
        "Stage first: WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders GROUP BY customer_id). Then join spend to the tiers by s >= lo AND s < hi.",
        "Shape: WITH spend AS (…), tiers(lo, hi, label) AS (VALUES …) SELECT t.label, COUNT(*) AS n FROM spend s JOIN tiers t ON s.s >= t.lo AND s.s < t.hi GROUP BY t.label ORDER BY MIN(t.lo);",
      ],
      difficulty: "hard",
      solution:
        "WITH spend AS (\n  SELECT customer_id, SUM(total) AS s\n  FROM orders\n  GROUP BY customer_id\n),\ntiers(lo, hi, label) AS (\n  VALUES (0, 200, 'bronze'), (200, 500, 'silver'),\n         (500, 900, 'gold'), (900, 999999, 'platinum')\n)\nSELECT t.label, COUNT(*) AS n\nFROM spend s\nJOIN tiers t ON s.s >= t.lo AND s.s < t.hi\nGROUP BY t.label\nORDER BY MIN(t.lo);",
      mistakes: [
        { test: "join\\s+tiers[^;]*sum\\s*\\(\\s*total\\s*\\)\\s*over", message: "No window needed — the grain is one row per CUSTOMER. Aggregate to per-customer spend in the CTE first; joining raw orders to tiers would count orders, not customers." },
        { test: "\\bbronze\\b.*\\b0\\s*,\\s*\\d", message: "Check the tier bounds match the brief (0/200/500/900) — inventing your own boundaries answers a different loyalty program." },
        { test: "count\\s*\\(\\s*distinct\\s+customer_id", message: "COUNT(*) over the staged CTE is already one row per customer — the DISTINCT would be a symptom of joining raw orders instead of the rollup." },
      ],
      expected: EXPECTED["l34-p13"],
      ordered: true,
    },
    {
      id: "l34-p14",
      title: "The overlap audit",
      brief: "Two marketing bands overlap on purpose: under-100 (0–100) and mid-band (50–150). Join products to BOTH and count the full matched output: one column `matched_rows`. (Reconciliation: the counts per band sum to more than the catalog — that's the fanout you're measuring.)",
      hints: [
        "One product can match BOTH bands — the join emits one row per true predicate. 12 + 7 = 19 matched rows for 16 products.",
        "Shape: WITH bands(lo, hi, label) AS (VALUES (0, 100, 'under-100'), (50, 150, 'mid-band')) SELECT COUNT(*) AS matched_rows FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi;",
      ],
      difficulty: "medium",
      solution:
        "WITH bands(lo, hi, label) AS (\n  VALUES (0, 100, 'under-100'), (50, 150, 'mid-band')\n)\nSELECT COUNT(*) AS matched_rows\nFROM products p\nJOIN bands b ON p.price >= b.lo AND p.price < b.hi;",
      mistakes: [
        { test: "count\\s*\\(\\s*distinct\\s+p\\.id", message: "DISTINCT would collapse the double-matched products back to 16 and erase the very fanout this audit measures — the brief wants the RAW matched-row count (19)." },
        { test: "\\bgroup\\s+by\\b", message: "One number, not per-band rows — the audit's whole point is the TOTAL (12 + 7 = 19) against the catalog's 16. GROUP BY would hand back two innocent-looking counts and hide the overlap." },
        { test: "\\bwhere\\s+b\\.label", message: "No label filter — both bands participate. Filtering to one band would read 12 or 7 and miss the 4 products that count twice." },
      ],
      expected: EXPECTED["l34-p14"],
    },
  ],
  takeaway: "RIGHT is LEFT read backwards, FULL keeps both sides (the 115-row audit), CROSS generates the grid on purpose, and non-equi joins match on ranges — every shape is now yours, with the bounds discipline that keeps fanout out.",
  deep: [
    {
      kind: "mind",
      text: "INNER and LEFT cover 95% of work; the remaining shapes exist for the **remaining 5% of questions**. RIGHT JOIN is LEFT JOIN with the tables swapped (preserve the right population) — SQLite makes you rewrite it as a LEFT, which is why left-first habit matters. FULL OUTER preserves BOTH populations, each padding the other's absences — the \"show me everything and mark who's missing\" audit. CROSS JOIN is the deliberate explosion: every pair, no ON clause, n×m rows — 16 products × 6 suppliers = 96 combos, the honest backbone for grid reports and price-matrix comparisons. Non-equi joins (ON a.x BETWEEN b.lo AND b.hi) generalize the machinery beyond equality — and inherit fan-out in its most dramatic form.",
    },
    {
      kind: "engine",
      title: "you run SELECT p.name, s.name FROM products p CROSS JOIN suppliers s",
      steps: [
        "**No ON, no pruning** — the nested loop emits every combination: 16 outer rows × 6 inner rows = 96. The join IS the product; the filter would come later, in WHERE, if wanted.",
        "**RIGHT by rewrite** — SQLite's RIGHT JOIN support arrived late; the portable form flips the tables: A RIGHT JOIN B ≡ B LEFT JOIN A. Reading right-joins as \"swapped lefts\" keeps one mental model.",
        "**FULL OUTER mechanics** — match pairs emit once; unmatched lefts pad right columns with NULL; unmatched rights pad left columns. Two pad sources, one result — the audit's microscope.",
        "**Non-equi cost** — range conditions can't use hash probes: nested loops with per-pair tests, 251 × 103 at worst. Bounds discipline (narrowing ranges, staging) keeps it survivable.",
      ],
    },
    {
      kind: "myth",
      myth: "\"FULL OUTER JOIN and UNION of two LEFT JOINs are the same.\"",
      truth: "The UNION rewrite (A LEFT JOIN B UNION A RIGHT JOIN B) approximates it but **can drop matched pairs' duplicates** or double them depending on UNION vs UNION ALL — correctness depends on the data, which is exactly what you don't want in an edge-case tool. Use the real FULL OUTER where the engine has one; here, stage it explicitly.",
    },
    {
      kind: "edge",
      items: [
        { c: "Accidental cross join", r: "Comma-FROM with a WHERE typo, or an ON that's always true (1 = 1 pasted in) — the result set silently multiplies: 251 × 103 = 25,853 rows here. Row-count sanity checks exist for this." },
        { c: "CROSS JOIN as a generator", r: "The legit use: months × regions grids so empty cells appear as 0 instead of vanishing. 14 months × 4 regions = 56 spine rows — the LEFT JOIN onto facts fills the rest." },
        { c: "Non-equi fan-out", r: "A BETWEEN join where one row's range swallows 50 rows yields 50 output rows from 1 — sums inflate exactly like lesson 15's trap, times fifty. Range joins demand narrow, non-overlapping bounds." },
        { c: "RIGHT JOIN readability", r: "Right-joins read backwards to most humans; reviewers mis-eyetrack them. Rewrite as LEFT — same plan, same rows, fewer confused code reviews." },
      ],
    },  ],
};
