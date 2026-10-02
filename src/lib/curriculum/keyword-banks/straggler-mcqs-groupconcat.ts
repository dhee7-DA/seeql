// Straggler bank MCQs — GROUP_CONCAT (kb-gc-q01..q12). Receipts from
// scripts/m8b-facts.ts (region folds, per-category name lists, separators,
// length 297 receipt).
import type { Mcq } from "../types";

const m = (v: Omit<Mcq, "why"> & { why: string }): Mcq => v;

export const stragglerMcqsGroupConcat: Mcq[] = [
  m({
    id: "kb-gc-q01", difficulty: "easy",
    prompt: "What does GROUP_CONCAT(region) return on the seed's 16 customers (no GROUP BY)?",
    choices: [
      "One comma-joined string of all 16 region values, e.g. 'EU,US,APAC,…'",
      "Four rows — one per distinct region",
      "NULL — GROUP_CONCAT requires GROUP BY",
      "16 — the count of regions",
    ],
    answer: 0,
    why: "Without GROUP BY the whole table is one bucket, and GROUP_CONCAT folds that bucket into a single comma-separated string — one row out. The string-aggregation fold is the text mirror of SUM: many rows in, one value out.",
  }),
  m({
    id: "kb-gc-q02", difficulty: "easy",
    prompt: "What is the default separator inside a GROUP_CONCAT fold?",
    choices: [",", "' | '", "'; '", "'-'"],
    answer: 0,
    why: "The probe's region receipt read 'EU,LATAM,US,APAC' — commas, no spaces. A custom separator is the optional second argument: GROUP_CONCAT(region, ' | ') produced 'APAC | EU | LATAM | US'. The string fold is comma-first unless you say otherwise.",
  }),
  m({
    id: "kb-gc-q03", difficulty: "easy",
    prompt: "`SELECT category, GROUP_CONCAT(name) FROM products GROUP BY category` returns…",
    choices: [
      "One row per category with that category's product names comma-joined",
      "One row per product with its category",
      "One row with every product name in the table",
      "An error — GROUP_CONCAT cannot follow GROUP BY",
    ],
    answer: 0,
    why: "GROUP BY carves the buckets (seven categories on the seed), and the fold compresses each bucket's names into one cell — Accessories 'HDMI 2.1 Cable 2m,Laptop Stand Aluminum,Desk Mat Extended'. The string aggregation is the per-budget summarizer that COUNT can only number.",
  }),
  m({
    id: "kb-gc-q04", difficulty: "easy",
    prompt: "The receipt `GROUP_CONCAT(DISTINCT region)` returned 'EU,LATAM,US,APAC' — 4 values for 16 customers. What did DISTINCT do?",
    choices: [
      "Deduplicated inside the fold — each region appears once",
      "Sorted the regions alphabetically",
      "Limited the fold to 4 rows",
      "Counted only distinct customers",
    ],
    answer: 0,
    why: "DISTINCT inside GROUP_CONCAT collapses repeats before the join — 16 values became 4. Note what it did NOT do: the order 'EU,LATAM,US,APAC' is encounter order, not alphabetical (the custom-separator probe with a sorted subquery produced 'APAC | EU | LATAM | US' — the sort came from the subquery, not the function).",
  }),
  m({
    id: "kb-gc-q05", difficulty: "easy",
    prompt: "Which query folds each customer's order STATUSES into one distinct, comma-joined cell?",
    choices: [
      "SELECT customer_id, GROUP_CONCAT(DISTINCT status) FROM orders GROUP BY customer_id",
      "SELECT customer_id, GROUP_CONCAT(status) FROM orders",
      "SELECT customer_id, GROUP_CONCAT(DISTINCT status) FROM orders GROUP BY status",
      "SELECT GROUP_CONCAT(status) FROM orders GROUP BY customer_id, status",
    ],
    answer: 0,
    why: "The seed receipt: customer 1 folded to 'shipped,cancelled,delivered,pending' — distinct because repeat statuses would double in. Choice B folds ALL customers into one cell (no GROUP BY); D groups by status too, shattering the fold. Bucket by customer, fold distinct statuses.",
  }),
  m({
    id: "kb-gc-q06", difficulty: "medium",
    prompt: "The per-category fold came out 'HDMI 2.1 Cable 2m,Laptop Stand Aluminum,Desk Mat Extended' — not alphabetical. What is the portable way to get a SORTED fold?",
    choices: [
      "Feed GROUP_CONCAT from an ordered subquery: SELECT category, GROUP_CONCAT(name) FROM (SELECT category, name FROM products ORDER BY category, name) GROUP BY category",
      "GROUP_CONCAT(name ORDER BY name) — SQLite supports the ORDER BY inside since 3.44",
      "GROUP_CONCAT(SORT(name))",
      "GROUP_CONCAT(name) GROUP BY category ORDER BY name",
    ],
    answer: 0,
    why: "The sorted receipt — 'Desk Mat Extended,HDMI 2.1 Cable 2m,Laptop Stand Aluminum' — came from the ordered-subquery form, which works on every SQLite build. The trailing ORDER BY on the outer query only orders the ROWS, never the fold inside a cell. Fold order follows encounter order unless you stage it.",
    notes: [{ choice: 1, why: "That is PostgreSQL's string_agg grammar — this engine build rejects ORDER BY inside the aggregate." }],
  }),
  m({
    id: "kb-gc-q07", difficulty: "medium",
    prompt: "`SELECT LENGTH(GROUP_CONCAT(name)) FROM products` returned 297. What does the 297 measure?",
    choices: [
      "The characters of the joined string INCLUDING the 15 separator commas",
      "The total characters of the names only",
      "The number of products",
      "The longest single name",
    ],
    answer: 0,
    why: "The fold is one string: 16 names plus 15 commas. 297 minus the separators is the raw name mass — the receipt is a quick data fingerprint (the string-aggregation fold makes column vocabularies measurable in one cell). LENGTH reads the RESULT of the fold, not its inputs.",
  }),
  m({
    id: "kb-gc-q08", difficulty: "medium",
    prompt: "A fold cell must read 'delivered: 52' style — status and count in one string. Which expression does it?",
    choices: [
      "status || ': ' || COUNT(*) with GROUP BY status",
      "GROUP_CONCAT(status || ': ' || COUNT(*))",
      "GROUP_CONCAT(status) || COUNT(*)",
      "CONCAT(status, ': ', COUNT(*)) — SQLite's CONCAT",
    ],
    answer: 0,
    why: "The receipt shows the rows: 'delivered: 52', 'shipped: 30', 'pending: 14', 'cancelled: 7' — plain concatenation of the grouped column and its aggregate, one row per bucket. No GROUP_CONCAT needed: folding is for MANY values into ONE cell; here each bucket is already one row.",
    notes: [{ choice: 1, why: "Inside GROUP_CONCAT the COUNT(*) is a bucket-wide aggregate mixed into a per-row fold — the engine rejects aggregates nested that way." }],
  }),
  m({
    id: "kb-gc-q09", difficulty: "medium",
    prompt: "What happens when a folded bucket contains a NULL value?",
    choices: [
      "NULL values are SKIPPED — the fold joins only the non-NULL members",
      "The whole fold becomes NULL",
      "NULL appears as the text 'null' in the cell",
      "The fold errors",
    ],
    answer: 0,
    why: "GROUP_CONCAT shares SUM's NULL hygiene: unknowns drop out of the fold. Contrast the empty bucket — zero non-NULL members yields NULL (not ''), the same aggregate-over-nothing rule that made SUM(CASE…) pivots need COALESCE. Skip versus collapse is the distinction the null-handling module drilled.",
  }),
  m({
    id: "kb-gc-q10", difficulty: "medium",
    prompt: "Why does `GROUP_CONCAT(name, '')` matter as an idiom?",
    choices: [
      "The empty separator CONCATENATES with no glue — the fold becomes pure concatenation of the bucket",
      "It strips NULLs — the default separator does not",
      "It sorts the values — commas would not",
      "It errors — the separator must be at least one character",
    ],
    answer: 0,
    why: "The second argument is the glue; empty glue means no commas — 'HDMI 2.1 Cable 2mLaptop Stand Aluminum…'. The idiom builds hash-like fingerprints of a bucket (often with a length() wrapper). The separator is fully caller-owned — commas are just the default.",
  }),
  m({
    id: "kb-gc-q11", difficulty: "hard",
    prompt: "The audit needs 'how many DISTINCT regions per supplier's products' alongside the region list. Which pair of expressions works in one SELECT?",
    choices: [
      "COUNT(DISTINCT region) for the number and GROUP_CONCAT(DISTINCT region) for the list — two aggregates over the same bucket",
      "GROUP_CONCAT(region) then COUNT in the app — SQL cannot do both",
      "COUNT(region) and GROUP_CONCAT(region) — DISTINCT is implied",
      "Two separate queries — aggregates cannot share a bucket",
    ],
    answer: 0,
    why: "A single SELECT over the joined bucket can carry both the count-of-unique and the fold-of-unique — the same DISTINCT discipline keeps them consistent (3 vs 'APAC,EU'). Mixing aggregates freely over one GROUP BY is exactly the census pattern the module-33 clinic taught.",
  }),
  m({
    id: "kb-gc-q12", difficulty: "hard",
    prompt: "A folded cell holds 5000 names and the UI truncates at 200 characters. What is the SQL-side move?",
    choices: [
      "substr(GROUP_CONCAT(name), 1, 200) — trim the FOLDED string, plus a marker for the cut",
      "GROUP_CONCAT with a LIMIT keyword inside the fold",
      "WHERE name LIMIT 200 — the fold respects the row limit",
      "It cannot be done — folds must be shown whole",
    ],
    answer: 0,
    why: "The fold happens first, then substr trims the single cell — GROUP_CONCAT has no built-in limit on this engine. The honest cell labels the cut ('…+4800 more' via a companion COUNT). String aggregation scales with the bucket, so trimming at the edge is a presentation contract, not an afterthought.",
    notes: [{ choice: 2, why: "LIMIT caps ROWS before grouping — it would shrink the BUCKET, silently folding a sample and calling it the whole." }],
  }),
];
