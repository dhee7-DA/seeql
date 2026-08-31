// MCQ bank for Lesson 8 (GROUP BY & HAVING + execution order).
// Existing inline MCQs are l8-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs08: MCQ[] = [
  {
    id: "l8-q5",
    prompt: "GROUP BY category with COUNT(*) produces…",
    options: [
      "one row per product",
      "one row per unique stored category value, with the count of its rows",
      "one row total",
      "the category with the most rows only",
    ],
    answer: 1,
    explanation:
      "Buckets: each unique value becomes one output row. On raw products that's ~20 buckets (the mess!), on clean data it would be 6.",
  },
  {
    id: "l8-q6",
    prompt: "How many buckets does GROUP BY status produce on our orders?",
    options: ["5 — the clean statuses", "18 — every stored spelling including NULL as one group", "150", "55"],
    answer: 1,
    explanation:
      "GROUP BY uses exact values: 'delivered', 'delivered ', 'DELIVERED', 'Delivered' are separate buckets. NULL forms its own bucket of 4. The 18-row result IS your data-quality report.",
  },
  {
    id: "l8-q7",
    prompt: "Which columns can appear in SELECT alongside GROUP BY category?",
    options: [
      "any column",
      "only category itself and aggregates",
      "only numeric columns",
      "only the primary key",
    ],
    answer: 1,
    explanation:
      "Each output row represents a whole bucket, so only the bucket key and per-bucket aggregates are well-defined. A bare product_name has 32 answers — the engine refuses to guess.",
  },
  {
    id: "l8-q8",
    prompt: "WHERE vs HAVING — which is TRUE?",
    options: [
      "WHERE filters buckets; HAVING filters rows",
      "WHERE filters rows before grouping; HAVING filters buckets after aggregation",
      "They're interchangeable",
      "HAVING can't use aggregates",
    ],
    answer: 1,
    explanation:
      "The timeline: rows → WHERE → buckets → HAVING. WHERE never sees aggregates (they don't exist yet); HAVING judges SUM/COUNT/AVG per bucket.",
  },
  {
    id: "l8-q9",
    prompt: "'Show only categories with more than 3 products' needs…",
    options: [
      "WHERE COUNT(*) > 3",
      "GROUP BY category HAVING COUNT(*) > 3",
      "LIMIT 3",
      "ORDER BY COUNT(*) DESC",
    ],
    answer: 1,
    explanation:
      "The condition is about a GROUP property (its count) — that's HAVING's job. WHERE can't see COUNT because it runs before buckets exist.",
  },
  {
    id: "l8-q10",
    prompt: "On our data, GROUP BY customer_id HAVING COUNT(*) >= 5 (excluding NULLs) returns 7 customers. Changing to >= 6 returns…",
    options: ["7", "6", "10", "42"],
    answer: 1,
    explanation:
      "Tightening the threshold shrinks the bucket list: 7 customers have ≥5 orders, 6 of them have ≥6. Threshold choices are how you tune 'our heaviest buyers'.",
  },
  {
    id: "l8-q11",
    prompt: "Why does ORDER BY COUNT(*) DESC usually follow a GROUP BY count report?",
    options: [
      "required syntax",
      "puts the biggest buckets first — the reader's eye wants the ranking",
      "it merges small buckets",
      "it removes NULLs",
    ],
    answer: 1,
    explanation:
      "A count table is a ranking. Sort it descending and the 'top categories/statuses/customers' story reads itself. (Ties stay ambiguous — pin a tiebreaker.)",
  },
  {
    id: "l8-q12",
    prompt: "GROUP BY loyalty_tier returns 11 rows. GROUP BY LOWER(TRIM(loyalty_tier)) returns…",
    options: [
      "11 — functions don't change grouping",
      "4 — gold, silver, bronze and NULL, after normalizing case and spaces",
      "40",
      "3",
    ],
    answer: 1,
    explanation:
      "Group by an EXPRESSION: the normalized value is the bucket key. 11 chaotic buckets collapse to 4 clean ones — your first real data-cleaning query.",
  },
  {
    id: "l8-q13",
    prompt: "Which query shows average order total per status (clean status values only)?",
    options: [
      "SELECT status, AVG(total_amount) FROM orders WHERE status IN ('delivered','shipped','pending','cancelled','returned') GROUP BY status",
      "SELECT AVG(total_amount) FROM orders GROUP BY AVG(status)",
      "SELECT status, AVG(total_amount) FROM orders HAVING status",
      "SELECT * FROM orders GROUP BY status",
    ],
    answer: 0,
    explanation:
      "WHERE narrows to the 5 canonical spellings first, then GROUP BY averages each bucket. Option B tries to group by an aggregate — illegal.",
  },
  {
    id: "l8-q14",
    prompt: "What does the execution order FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT explain?",
    options: [
      "why you can't use SELECT aliases in WHERE but can in ORDER BY",
      "why HAVING runs first",
      "why LIMIT applies before sorting",
      "the typing order matters more than logic",
    ],
    answer: 0,
    explanation:
      "SELECT (aliases) runs after WHERE but before ORDER BY. Hence WHERE revenue > 100 fails while ORDER BY revenue works — the pipeline explains a dozen syntax mysteries.",
  },
  {
    id: "l8-q15",
    prompt: "Which query lists cities with 2+ customers, including the messy variants as-is?",
    options: [
      "SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING n >= 2",
      "SELECT city, COUNT(*) AS n FROM customers GROUP BY city HAVING COUNT(*) >= 2",
      "SELECT city FROM customers WHERE COUNT(*) >= 2",
      "SELECT city, COUNT(*) AS n FROM customers HAVING city >= 2",
    ],
    answer: 1,
    explanation:
      "HAVING judges the aggregate — write COUNT(*) >= 2. SQLite happens to ALLOW the alias in HAVING (option A works here!) but it's non-standard; B is the portable habit. Option C is the classic illegal WHERE-aggregate.",
  },
  {
    id: "l8-q16",
    prompt: "SELECT payment_method, COUNT(*) FROM orders GROUP BY payment_method — how many rows and which is largest?",
    options: [
      "8 rows; credit_card (36)",
      "2 rows",
      "150 rows",
      "8 rows; NULL (12) is largest",
    ],
    answer: 0,
    explanation:
      "8 buckets (6 spellings + debit + NULL). credit_card leads with 36; NULL is a bucket too — 12 orders with unknown payment. Never let the NULL bucket surprise you in a pie chart.",
  },
  {
    id: "l8-q17",
    prompt: "GROUP BY customer_id, status — what does one output row represent?",
    options: [
      "one customer",
      "one status",
      "one customer's count of orders in one specific status",
      "one order",
    ],
    answer: 2,
    explanation:
      "Multi-column grouping buckets by the COMBINATION: customer × status. It answers 'which customers have multiple pending orders?' — a segment-style question.",
  },
  {
    id: "l8-q18",
    prompt: "The rule 'every selected column is aggregated or grouped' exists because…",
    options: [
      "SQL is pedantic",
      "an output row is a bucket summary — non-aggregated, non-key columns have many values inside the bucket and no single honest answer",
      "columns must be sorted",
      "it saves memory",
    ],
    answer: 1,
    explanation:
      "Semantics, not bureaucracy: a bucket row can only show values that are constant across the bucket (the key) or collapsed (aggregates). Everything else is undefined behavior — so it's forbidden.",
  },
  {
    id: "l8-q19",
    prompt: "Which finds product categories whose AVERAGE price exceeds 100 (canonical spellings only)?",
    options: [
      "SELECT category, AVG(price) AS avg_p FROM products GROUP BY category HAVING AVG(price) > 100",
      "SELECT category FROM products WHERE AVG(price) > 100",
      "SELECT category, AVG(price) FROM products HAVING price > 100 GROUP BY category",
      "SELECT AVG(category) FROM products",
    ],
    answer: 0,
    explanation:
      "HAVING with an aggregate inside — the standard pattern. (Run it: the Electronics-ish buckets qualify, Accessories doesn't. Note the messy spellings split buckets!)",
  },
  {
    id: "l8-q20",
    prompt: "What's the difference between the NULL bucket and other buckets in GROUP BY?",
    options: [
      "NULLs are excluded from grouping",
      "NULL rows form their own single bucket — NULL is treated as one value for grouping",
      "NULL rows go to every bucket",
      "NULLs error",
    ],
    answer: 1,
    explanation:
      "Same asymmetry as DISTINCT: comparisons fail on NULL, grouping unifies them. GROUP BY status shows a NULL row with its 4 orders — your 'unknown status' bucket.",
  },
  {
    id: "l8-q21",
    prompt: "HAVING COUNT(*) >= 1 is equivalent to…",
    options: [
      "no HAVING at all — every bucket has at least one row by construction",
      "LIMIT 1",
      "WHERE COUNT(*) >= 1",
      "DISTINCT",
    ],
    answer: 0,
    explanation:
      "Buckets only exist because they contain rows — every GROUP BY row has COUNT >= 1. HAVING earns its keep with thresholds >= 2, > 3, != 5, etc.",
  },
  {
    id: "l8-q22",
    prompt: "Which pipeline is correct?",
    options: [
      "SELECT → WHERE → GROUP BY → ORDER BY",
      "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT",
      "FROM → GROUP BY → WHERE → HAVING",
      "WHERE → FROM → SELECT → LIMIT",
    ],
    answer: 1,
    explanation:
      "The logical execution order. You WRITE select-first, the ENGINE reads from-first. Memorize the arrow order — it explains every 'why can't I use X here' question.",
  },
  {
    id: "l8-q23",
    prompt: "GROUP BY strftime('%Y-%m', order_date) buckets orders by…",
    options: [
      "day",
      "month (e.g. '2025-01') — the classic monthly-trend bucket key",
      "year only",
      "the raw date string",
    ],
    answer: 1,
    explanation:
      "Expressions make great keys: strftime truncates each date to its month, so all of January's orders land in one '2025-01' bucket. (Full date functions come in a later module — here's the shape.)",
  },
  {
    id: "l8-q24",
    prompt: "Why prefer filtering with WHERE status = 'delivered' over HAVING status = 'delivered' (ungrouped query)?",
    options: [
      "WHERE runs on rows early — cheaper and clearer; HAVING on the single collapsed row is a roundabout row filter",
      "HAVING is slower to type",
      "No difference at all ever",
      "WHERE can't compare text",
    ],
    answer: 0,
    explanation:
      "Both return the same single-row aggregate here, but the WHERE version shrinks the data before collapsing. Rule: row-level conditions → WHERE; only bucket-level conditions → HAVING.",
  },
  {
    id: "l8-q25",
    prompt: "You GROUP BY city and also SELECT customer_id. The engine says: error. Why?",
    options: [
      "customer_id isn't in the GROUP BY and isn't aggregated — inside a city bucket it has many values",
      "customer_id is text",
      "you need ORDER BY",
      "it's fine actually",
    ],
    answer: 0,
    explanation:
      "The bare-column rule in action. Want one row per city? Then customer_id must hide inside an aggregate (COUNT, MAX, GROUP_CONCAT) — pick the question first.",
  },
  {
    id: "l8-q26",
    prompt: "Which query counts orders per customer INCLUDING the 7 guest orders with no customer?",
    options: [
      "GROUP BY customer_id — NULL becomes its own bucket automatically",
      "WHERE customer_id IS NOT NULL GROUP BY customer_id",
      "COUNT(*) always includes them separately",
      "GROUP BY customer_id HAVING customer_id IS NULL",
    ],
    answer: 0,
    explanation:
      "GROUP BY keeps a NULL bucket (7 guest orders) unless you filter it. Whether to include 'unknown' as a segment is a REPORTING decision — now you can make it consciously.",
  },
  {
    id: "l8-q27",
    prompt: "The 10-step pipeline in the Playground's Flow tab shows funnel counts per stage. At which stage would '6 orphan orders pointing at missing customers' still be visible?",
    options: [
      "after WHERE — orphans survive row filters; only JOINs (Module 2) drop them",
      "after GROUP BY",
      "after LIMIT",
      "orphans vanish in every query",
    ],
    answer: 0,
    explanation:
      "Orphans are normal rows — WHERE on status/total keeps them. Single-table Foundations queries can't remove them; INNER JOIN in Module 2 is where they finally fall out.",
  },
  {
    id: "l8-q28",
    prompt: "SELECT category, COUNT(*) FROM products GROUP BY category ORDER BY 2 DESC — the '2' means…",
    options: [
      "the column named 2",
      "the 2nd output column (the count) — ordinal ORDER BY",
      "descending by 2",
      "two categories",
    ],
    answer: 1,
    explanation:
      "Ordinals work (ORDER BY COUNT(*) DESC is identical) but break when the SELECT list changes. Alias the count AS n and write ORDER BY n DESC — readable and stable.",
  },
  {
    id: "l8-q29",
    prompt: "Your manager asks: 'average items per order line and lines per order — two different grains.' Which pairs the right aggregates?",
    options: [
      "AVG(quantity) on order_items (line grain) vs COUNT(*) GROUP BY order_id then averaged (order grain)",
      "both are AVG(quantity)",
      "COUNT(*) on orders",
      "SUM(order_id)",
    ],
    answer: 0,
    explanation:
      "Grain awareness: AVG(quantity) averages 328 line quantities (~1.92); lines-per-order needs per-order COUNT first (avg ~2.2 lines). Same data, different bucket keys, different stories.",
  },
  {
    id: "l8-q30",
    prompt: "Final boss: which single query returns 'top 3 cities by number of customers, clean city spellings only'?",
    options: [
      "SELECT city, COUNT(*) AS n FROM customers GROUP BY city ORDER BY n DESC LIMIT 3",
      "SELECT city FROM customers WHERE COUNT(*) > 1 LIMIT 3",
      "SELECT TOP 3 city FROM customers",
      "SELECT city, SUM(id) FROM customers GROUP BY city LIMIT 3",
    ],
    answer: 0,
    explanation:
      "GROUP BY → alias the count → ORDER BY alias DESC → LIMIT 3. Every Foundations clause in one line: projection, bucketing, ranking, trimming. (The stored spellings make ' Mumbai' vs 'Mumbai' separate — a footnote for the manager!)",
  },
];
