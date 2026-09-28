// Drill set — Non-equi & range joins (Module 6, secondary, 15 questions).
// Engine-verified receipts (db/custom.db, scripts/thin-facts.ts + thin-facts2.ts):
// product price ladder 0/30/60/120 → entry 3, core 6, pro 4, elite 3 (Σ 16,
// prices 14.99–199.99, none exactly on a boundary at 30/60/120);
// deliberately overlapping bands 0–100 + 50–150 → under-100 12 rows,
// mid-band 7 rows, 4 products matched BOTH (12+7−4 = 15 matched, 1 product ≥ 150);
// same-supplier price pairs p1.price < p2.price = 14 (suppliers hold 2–3
// products each); tightened to ratio < 1.5 = 5 pairs (sample: HDMI Cable
// 14.99 → USB-C Hub 49.00); near-twin orders |Δtotal| ≤ 1.00 with
// o1.id < o2.id = 14 pairs; order totals have NO ties (103 distinct of 103);
// expenses bands 0/40k/80k cents → petty 17, modest 4, major 15 (Σ 36, min
// 22,000 / max 168,000 cents); customer lifetime spend tiers 0/200/500/900
// → silver 1, gold 6, platinum 9 (all 16 customers have orders).

import type { DrillQ } from "../types";

const KW = "Non-equi joins";

export const NON_EQUI_JOINS: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr6-neq-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which ON clause correctly matches each order to its ONE value band in a bands(lo, hi, label) ladder?",
    choices: [
      "`ON o.total >= b.lo`",
      "`ON o.total >= b.lo AND o.total < b.hi`",
      "`ON o.total BETWEEN b.lo`",
      "`ON o.total = b.lo OR o.total = b.hi`",
    ],
    answer: 1,
    why: "A range join needs BOTH bounds: `>= lo AND < hi` makes each order match exactly one band (when the bands tile the range without overlapping). One bound matches every lower band too; BETWEEN needs two operands; equality only hits the exact boundary values.",
    notes: [
      { choice: 0, why: "Half a ladder: an order of 500 also matches the 0–50 and 50–200 bands — the join fans out and every count inflates." },
      { choice: 2, why: "BETWEEN takes both bounds in one keyword (`x BETWEEN a AND b`); with a single operand it's a syntax error." },
    ],
  },
  { id: "dr6-neq-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "A VALUES ladder joined by range needs column names for its anonymous rows. Which WITH line is legal SQLite?",
    choices: [
      "`WITH bands AS (VALUES (0, 30, 'entry'), …)` — names come from the first row",
      "`WITH bands(lo, hi, label) AS (VALUES (0, 30, 'entry'), …)`",
      "`WITH bands(lo, hi, label) INSERT VALUES (0, 30, 'entry')`",
      "`VALUES bands(lo, hi, label) (0, 30, 'entry')`",
    ],
    answer: 1,
    why: "A CTE built from VALUES has no column names until you give them: `WITH bands(lo, hi, label) AS (VALUES …)` names the three columns in the CTE header. Without names you'd reference anonymous columns column1/column2 — and the first row is data, never a header.",
    notes: [
      { choice: 0, why: "SQLite names VALUES columns `column1`, `column2`… — `b.label` would error with 'no such column'. Names go in the WITH header, not the data." },
    ],
  },
  { id: "dr6-neq-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which query counts products per price band using a range join to a VALUES ladder?",
    choices: [
      "`SELECT b.label, COUNT(*) FROM products p JOIN bands b ON p.price >= b.lo AND p.price < b.hi GROUP BY b.label;`",
      "`SELECT b.label, COUNT(*) FROM products p JOIN bands b ON p.price >= b.lo GROUP BY b.label;`",
      "`SELECT b.label, COUNT(*) FROM products p JOIN bands b ON p.price = b.label GROUP BY b.label;`",
      "`SELECT b.label, COUNT(*) FROM products p, bands b WHERE p.price IN bands;`",
    ],
    answer: 0,
    why: "The closed-open pair `>= lo AND < hi` matches each product exactly once; GROUP BY b.label then counts per band. The engine-verified ladder on the storefront (0/30/60/120) yields entry 3, core 6, pro 4, elite 3 — summing back to all 16 products.",
    notes: [
      { choice: 1, why: "Drops the upper bound: a 199.99 product matches every band from entry upward — 4 rows instead of 1, and the counts sum to far more than 16." },
      { choice: 3, why: "`IN bands` isn't SQL — IN takes a list or a subquery, not a table. The range match needs a real predicate in ON or WHERE." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr6-neq-04", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What makes a join “non-equi”?",
    choices: [
      "The join uses more than two tables",
      "The join predicate connects rows with an inequality or range test (</>/BETWEEN) instead of key equality",
      "The join returns no NULL rows by definition",
      "The ON clause is omitted",
    ],
    answer: 1,
    why: "Equi-joins match keys with `=` (customer_id = customer_id). Non-equi joins match on ranges or inequalities — price ladders, date spans, between-bands. Same FROM…JOIN machinery, but the predicate is a boolean range test rather than an equality.",
    notes: [
      { choice: 3, why: "Omitting ON gives you a CROSS JOIN (every pairing) — a specific degenerate case, and you'd spell it deliberately, not accidentally." },
    ],
  },
  { id: "dr6-neq-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Products joined to a 0/30/60/120 ladder with `price >= lo AND price < hi` gave entry 3, core 6, pro 4, elite 3. What property of the bounds guarantees those counts sum back to exactly 16?",
    choices: [
      "GROUP BY deduplicates products automatically",
      "The bands are contiguous and half-open — every price falls in exactly one band",
      "COUNT(*) ignores duplicate prices",
      "The ORDER BY keeps the counts aligned",
    ],
    answer: 1,
    why: "Contiguous (each hi is the next lo) plus half-open (`>= lo AND < hi`) means each price matches exactly one band — a partition, not a fanout. 3+6+4+3 = 16 with no product lost or doubled. That reconciliation is the sanity check for any band join.",
    notes: [
      { choice: 0, why: "GROUP BY groups matched rows; it never undoes a fanout. If a product matched two bands it would be counted twice, once per group." },
    ],
  },
  { id: "dr6-neq-06", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: bands (0,40000,'petty'), (40000,80000,'modest'), (80000,999999999,'major') joined to 36 expenses by `amount_cents >= lo AND amount_cents < hi`. Petty 17, modest 4 — how many rows does major show?",
    choices: ["15", "19", "7", "36"],
    answer: 0,
    why: "36 expenses − 17 petty − 4 modest = 15 major. The three bands partition the whole range, so the ladder reconciles: every expense lands in exactly one band (verified on the live db: 17 + 4 + 15 = 36).",
    notes: [
      { choice: 3, why: "36 is the total expense count, not one band's — the ladder SPLITS the table, it doesn't repeat it." },
    ],
  },

  // ---------- edge ----------
  { id: "dr6-neq-07", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The ladder uses `>= lo AND < hi`. A product priced exactly 30 lands in…",
    choices: [
      "The 0–30 band, because the lower bound is inclusive",
      "The 30–60 band, because the upper bound is exclusive",
      "Both bands — boundaries always double-match",
      "Neither — exact boundary values fall through the cracks",
    ],
    answer: 1,
    why: "`>= 0 AND < 30` rejects 30 (30 < 30 is false); `>= 30 AND < 60` accepts it. The closed-open contract puts every boundary value in exactly the band ABOVE the boundary. Storefront check: no product sits exactly on 30/60/120 — but if one did, this is where it lands.",
    notes: [
      { choice: 2, why: "That's the overlapping-bands disease, not this contract — half-open bounds deliberately kill the double match." },
      { choice: 3, why: "Fall-through happens when bounds are GAPPY (hi of one band ≠ lo of the next), not when they're half-open and contiguous." },
    ],
  },
  { id: "dr6-neq-08", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Two bands overlap on purpose: under-100 (0–100) and mid-band (50–150). 12 products match under-100, 7 match mid-band, 4 match both. What does the joined row count tell you?",
    choices: [
      "19 rows — the fanout double-counts the 4 overlap products (19 = 16 + 3 extra rows)",
      "19 rows — the catalog grew",
      "12 rows — the smaller band wins",
      "4 rows — only the overlap survives",
    ],
    answer: 0,
    why: "Non-equi joins emit one row PER TRUE PREDICATE: 12 + 7 = 19 matched rows, with the 4 in-between products appearing twice. A COUNT per band looks fine; a COUNT(*) over the whole join (19) betrays the fanout against 16 real products. Overlapping bounds are how reports quietly double-count.",
    notes: [
      { choice: 1, why: "The catalog is still 16 products — the join's output row count (19) is not the entity count. Joins multiply rows; they never invent products." },
    ],
  },
  { id: "dr6-neq-09", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "An order total of 100.00 joins a ladder whose bands are (0,50,'small'), (50,200,'medium'), (200,500,'large'). How many rows come back?",
    choices: [
      "One — 'medium'",
      "Two — 'small' and 'medium'",
      "None — 100 misses every band boundary",
      "Three — every band matches some range",
    ],
    answer: 0,
    why: "With the closed-open contract, 100 is `>= 50 AND < 200` → exactly one match: medium. The lesson-34 ladder was designed so exactly one predicate is true per order — sloppy bounds (overlap or gap) would fan it out or drop it.",
    notes: [
      { choice: 1, why: "100 >= 0 is true, but 100 < 50 is false — 'small' requires BOTH bounds. A single true bound isn't a match." },
    ],
  },

  // ---------- errors ----------
  { id: "dr6-neq-10", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "A band report's counts sum to 41 for a 16-product catalog. Which bound bug is the classic cause?",
    choices: [
      "Bands written `>= lo AND < hi` — too strict",
      "Overlapping bands (or a missing upper bound) — products match several bands at once",
      "ORDER BY MIN(b.lo) scrambling the ladder",
      "COUNT(*) instead of COUNT(DISTINCT p.id)",
    ],
    answer: 1,
    why: "Sums far ABOVE the entity count mean fanout: overlapping ranges or a dropped `hi` bound let one product match several bands. The fix is the half-open contiguous contract — not masking it with COUNT(DISTINCT), which hides real multi-band rows you might legitimately want to see.",
    notes: [
      { choice: 3, why: "COUNT(DISTINCT) across the whole join would collapse to 16 — but per-band counts still double-report the overlap products. Fix the bounds, don't drug the metric." },
    ],
  },
  { id: "dr6-neq-11", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`… JOIN bands b ON p.price > b.lo` — beyond the fanout, what's silently wrong at a boundary that IS a real price?",
    choices: [
      "Nothing — > and >= differ only at the boundary",
      "The exactly-at-lo price drops out — strict > excludes the boundary row from that band",
      "SQLite rewrites > to = automatically",
      "The CTE materializes twice",
    ],
    answer: 1,
    why: "Strict `>` excludes exactly-at-lo rows from the band above the boundary. On this catalog it's invisible at 0 (min price 14.99) — but the same slip at a real price point silently loses rows from one band and hands them to none. Closed-open (`>= lo`, `< hi`) never loses or doubles a boundary.",
    notes: [
      { choice: 0, why: "The boundary difference is exactly the bug class: one row in (or out) that your reconciliation count will catch — or worse, that it won't." },
    ],
  },

  // ---------- predict ----------
  { id: "dr6-neq-12", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `SELECT COUNT(*) AS n FROM products p1 JOIN products p2 ON p1.supplier_id = p2.supplier_id AND p1.price < p2.price`. Suppliers carry 2–3 products each. What lands in n?",
    choices: ["14", "16", "6", "28"],
    answer: 0,
    why: "This is a self non-equi join: within each supplier, count cheaper→pricier orderings. Six suppliers with 2–3 products each produce 14 such pairs on the live db — the inequality both matches and breaks symmetry (no product pairs with itself, no double mirror).",
    notes: [
      { choice: 3, why: "28 would be the count WITHOUT the direction guard (14 ordered pairs × 2 mirrors). `p1.price < p2.price` keeps exactly one direction." },
      { choice: 2, why: "6 is the supplier count — pairs live WITHIN suppliers, and most suppliers hold more than 2 products' worth of orderings." },
    ],
  },
  { id: "dr6-neq-13", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Tighten it: same join plus `AND p2.price < p1.price * 1.5` (the pricier item costs less than 1.5× the cheaper). On the live db that census reads…",
    choices: ["5", "14", "9", "0"],
    answer: 0,
    why: "The ratio bound keeps only the 5 close-in-price same-supplier pairs (like an HDMI cable at 14.99 against a 49.00 hub). Stacking inequalities is the whole trick of non-equi joins — each extra predicate just shrinks the surviving pair set.",
    notes: [
      { choice: 1, why: "14 is the unbounded pair count; the 1.5× filter is a genuine second predicate that most pairs fail (cheapest-to-flagship within one supplier often doubles the price)." },
    ],
  },
  { id: "dr6-neq-14", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Storefront receipt: `SELECT COUNT(*) AS n FROM orders o1 JOIN orders o2 ON o1.id < o2.id AND ABS(o1.total - o2.total) <= 1.0`. The 103 order totals are all distinct. What is n?",
    choices: ["14", "0", "103", "1"],
    answer: 0,
    why: "Distinct totals rule out exact ties, but near-twins survive: 14 order pairs sit within one unit of each other. The `o1.id < o2.id` guard both halves the mirror pairs and prevents self-matching — a two-predicate non-equi match on a table with no key relationship at all.",
    notes: [
      { choice: 1, why: "0 would follow from exact equality — but the window is ±1.00, and 14 pairs of orders are that close. DISTINCT isn't UNIQUE-within-a-window." },
    ],
  },
  { id: "dr6-neq-15", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "You need each customer binned by lifetime spend (bronze/silver/gold). When is the range-join to a tiers ladder the RIGHT tool over a CASE expression?",
    choices: [
      "Never — CASE is always the honest tool",
      "When the tiers live in DATA (a table you can extend, reuse, join elsewhere, or hand to non-SQL owners) instead of being frozen in query text",
      "Only when there are more than four tiers",
      "When the spend column is TEXT",
    ],
    answer: 1,
    why: "A CASE ladder is perfect for a one-off label. The join earns its keep when the ladder is a first-class table: shared across reports, auditable, extendable without touching every query. Same engine-verified census either way (storefront: silver 1, gold 6, platinum 9) — the difference is maintainability, not output.",
    notes: [
      { choice: 0, why: "Too absolute — the ladder-as-data pattern is exactly how pricing tiers and tax brackets live in real systems. Judgment means knowing which maintenance story you're signing up for." },
    ],
  },
];
