// MCQ bank for Lesson 5 (ORDER BY & LIMIT).
// Existing inline MCQs are l5-q1..q4 — new items continue from q5.

import type { MCQ } from "../types";

export const mcqs05: MCQ[] = [
  {
    id: "l5-q5",
    prompt: "Without ORDER BY, what order do query results come in?",
    options: [
      "Always primary-key order",
      "Whatever order the engine produces — no guarantee, and it can vary",
      "Alphabetical by first column",
      "Random by design",
    ],
    answer: 1,
    explanation:
      "SQL result order is undefined without ORDER BY. It often LOOKS stable (small tables read in rowid order), which is exactly why people get burned when data grows.",
  },
  {
    id: "l5-q6",
    prompt: "ORDER BY order_date lists 2024-01-11 orders where?",
    options: [
      "Last — default is descending",
      "First — ascending is the default, and ISO dates sort correctly as text",
      "In the middle",
      "Nowhere — dates can't be sorted",
    ],
    answer: 1,
    explanation:
      "Default ASC: earliest date first (2024-01-11 is our oldest order). ISO formatting makes text sort = date sort.",
  },
  {
    id: "l5-q7",
    prompt: "Which query shows the 5 most expensive orders?",
    options: [
      "SELECT * FROM orders ORDER BY total_amount LIMIT 5",
      "SELECT * FROM orders ORDER BY total_amount DESC LIMIT 5",
      "SELECT * FROM orders LIMIT 5 ORDER BY total_amount",
      "SELECT TOP 5 FROM orders",
    ],
    answer: 1,
    explanation:
      "Biggest first needs DESC, then LIMIT 5. Option A gives the 5 CHEAPEST; option C has clauses in the wrong order; TOP is SQL Server, not SQLite.",
  },
  {
    id: "l5-q8",
    prompt: "ORDER BY country, total_amount DESC sorts primarily by…",
    options: [
      "total_amount — the last key wins",
      "country ascending; total_amount only breaks ties within the same country",
      "both equally",
      "neither — multi-key sort is invalid",
    ],
    answer: 1,
    explanation:
      "Keys apply left to right. The first key dominates; later keys order the groups of ties. Our sandbox: 5 DE customers together, each subgroup ordered by value.",
  },
  {
    id: "l5-q9",
    prompt: "In ORDER BY total DESC, id ASC, the id ASC part exists to…",
    options: [
      "make results fully deterministic when totals tie",
      "slow the query down",
      "override DESC",
      "rename the id column",
    ],
    answer: 0,
    explanation:
      "Ties on total are broken by smaller id first — a reproducible order for auto-grading, exports and screenshots. Always pin a tiebreaker for ranked lists.",
  },
  {
    id: "l5-q10",
    prompt: "How do NULL total_amounts sort in ORDER BY total_amount (ascending) in SQLite?",
    options: [
      "First — NULLs come before all values in ASC",
      "Last",
      "They're skipped entirely",
      "Randomly among equals",
    ],
    answer: 0,
    explanation:
      "SQLite puts NULLs first in ASC, last in DESC. A 'cheapest 5' report can open with 6 ghost rows — check the extremes.",
  },
  {
    id: "l5-q11",
    prompt: "ORDER BY lifetime_value DESC on customers — where do the 8 NULL LTVs land?",
    options: [
      "At the very top",
      "At the very bottom",
      "Mixed in the middle",
      "They cause an error",
    ],
    answer: 1,
    explanation:
      "DESC pushes NULLs last. Convenient here — but the top is instead hijacked by the 999999 outlier. Two different ranking poisons; filter NULLs, verify outliers.",
  },
  {
    id: "l5-q12",
    prompt: "LIMIT 10 with OFFSET 20 returns…",
    options: [
      "rows 1–10",
      "rows 21–30 of the sorted result",
      "the last 10 rows",
      "an error — OFFSET needs a subquery",
    ],
    answer: 1,
    explanation:
      "OFFSET skips that many rows first, then LIMIT takes the next batch: rows 21–30 — the classic pagination window (page 3 with page size 10).",
  },
  {
    id: "l5-q13",
    prompt: "Which is the stable 'page 2, 10 per page' recipe?",
    options: [
      "LIMIT 10 OFFSET 10 — but only meaningful WITH a deterministic ORDER BY",
      "OFFSET 2 LIMIT 10",
      "SKIP 10 TAKE 10",
      "LIMIT 2, 10 (SQLite accepts, but same missing-ORDER problem)",
    ],
    answer: 0,
    explanation:
      "Pages only make sense over a sorted sequence. Without ORDER BY, page contents can shuffle between runs — the pagination + no-ORDER bug in real apps.",
  },
  {
    id: "l5-q14",
    prompt: "What does LIMIT 0 return?",
    options: [
      "Everything",
      "Zero rows — the column names only (handy to preview a result's shape)",
      "An error",
      "The first row",
    ],
    answer: 1,
    explanation:
      "LIMIT 0 is a legit 'schema preview' trick: you see which columns WOULD come back without any data.",
  },
  {
    id: "l5-q15",
    prompt: "The top-5 LTV list needs what ORDER BY to be correct and reproducible?",
    options: [
      "ORDER BY lifetime_value DESC, id ASC",
      "ORDER BY id DESC",
      "ORDER BY lifetime_value",
      "ORDER BY lifetime_value DESC LIMIT 5 alone with no tiebreaker is always fine",
    ],
    answer: 0,
    explanation:
      "DESC ranks, id ASC breaks ties deterministically. (Also filter NULLs first — Lesson 4!) LIMIT 5 without a tiebreaker is ambiguous when values tie.",
  },
  {
    id: "l5-q16",
    prompt: "ORDER BY price * stock_quantity DESC is…",
    options: [
      "invalid — ORDER BY takes column names only",
      "valid — expressions are allowed (and aliases from SELECT also work here)",
      "valid only with GROUP BY",
      "an aggregate",
    ],
    answer: 1,
    explanation:
      "Sort keys can be expressions or output aliases (SELECT ran before ORDER BY — Lesson 8). Sorting by computed inventory value per product is a normal analyst move.",
  },
  {
    id: "l5-q17",
    prompt: "Which sorts customers by tier alphabetically then by signup date, oldest first, in one query?",
    options: [
      "ORDER BY loyalty_tier, signup_date",
      "ORDER BY signup_date, loyalty_tier",
      "ORDER BY loyalty_tier AND signup_date",
      "SORT BY loyalty_tier THEN signup_date",
    ],
    answer: 0,
    explanation:
      "Comma-separated keys: tier groups, date orders within each group. AND is boolean logic, not a key separator; SORT BY isn't SQL.",
  },
  {
    id: "l5-q18",
    prompt: "How many orders tie at the maximum total_amount 9999.99?",
    options: ["1 — ties are rare at extremes", "5", "37", "150"],
    answer: 0,
    explanation:
      "Exactly one order (also suspiciously round — another outlier signature). With a single max, no tiebreaker is needed; check anyway as a habit.",
  },
  {
    id: "l5-q19",
    prompt: "Which query gets the 10 most recent reviews with their ratings?",
    options: [
      "SELECT rating, title, review_date FROM reviews ORDER BY review_date DESC LIMIT 10",
      "SELECT rating, title FROM reviews LIMIT 10",
      "SELECT rating FROM reviews ORDER BY 10",
      "SELECT rating, review_date FROM reviews WHERE recent",
    ],
    answer: 0,
    explanation:
      "Newest first = ORDER BY date DESC; cap the list = LIMIT 10. The default LIMIT-10-without-ORDER in option B returns arbitrary rows, not recent ones.",
  },
  {
    id: "l5-q20",
    prompt: "You sort by city and see ' Madrid', 'Madrid', 'MADRID' scattered apart. The sort is…",
    options: [
      "broken — SQLite has a bug",
      "correct — sorts are character-exact: spaces and case change positions",
      "case-insensitive for text keys",
      "ignoring leading spaces",
    ],
    answer: 1,
    explanation:
      "Space sorts before letters; uppercase before lowercase in binary collation. Messy text scatters in sorts — one more reason to eyeball sorted output.",
  },
  {
    id: "l5-q21",
    prompt: "ORDER BY 2 (a number) in SQLite means…",
    options: [
      "sort by the 2nd output column — works, but explicit names are clearer",
      "sort by the value 2",
      "invalid syntax",
      "sort descending",
    ],
    answer: 0,
    explanation:
      "Ordinal sort keys exist and appear in old code, but they break when the SELECT list changes. Prefer names/aliases — future-you will thank you.",
  },
  {
    id: "l5-q22",
    prompt: "LIMIT 5 OFFSET 5 on a 40-row table returns…",
    options: ["rows 1–5", "rows 6–10", "rows 36–40", "5 random rows"],
    answer: 1,
    explanation:
      "Skip 5, take 5 → the 6th through 10th rows of the (sorted) result. Compose mentally as 'window start = OFFSET, window length = LIMIT'.",
  },
  {
    id: "l5-q23",
    prompt: "Which lists the 3 lowest-rated VALID reviews (rating between 1 and 5)?",
    options: [
      "SELECT rating, title FROM reviews WHERE rating BETWEEN 1 AND 5 ORDER BY rating LIMIT 3",
      "SELECT rating FROM reviews ORDER BY rating LIMIT 3",
      "SELECT rating FROM reviews WHERE rating < 3",
      "SELECT MIN(rating) FROM reviews LIMIT 3",
    ],
    answer: 0,
    explanation:
      "B applies to all rows including 0 and NULLs (0 would top the list). C has no ORDER/LIMIT. MIN returns one row, not 3. A filters to the valid scale, then sorts and trims.",
  },
  {
    id: "l5-q24",
    prompt: "Why pair LIMIT with ORDER BY for 'top N' questions?",
    options: [
      "LIMIT alone would return arbitrary rows — sorting defines what 'top' means",
      "LIMIT requires ORDER BY syntactically",
      "ORDER BY makes queries faster",
      "They're unrelated",
    ],
    answer: 0,
    explanation:
      "'Top' is meaningless without an order. ORDER BY defines the ranking; LIMIT slices it. The pair is the bread and butter of analyst one-liners.",
  },
  {
    id: "l5-q25",
    prompt: "An intern sorts orders by status ASC. Which status group appears first (ASCII order, clean values)?",
    options: [
      "'cancelled' — c before d, p, r, s",
      "'delivered'",
      "'pending'",
      "'shipped'",
    ],
    answer: 0,
    explanation:
      "Alphabetical: cancelled < delivered < pending < returned < shipped. Sorting by a category column groups its values — a poor man's GROUP BY preview.",
  },
  {
    id: "l5-q26",
    prompt: "Which statement about ORDER BY performance is fair at our scale?",
    options: [
      "Sorting 150–328 rows is effectively instant; correctness beats micro-optimization here",
      "ORDER BY always takes minutes",
      "SQLite forbids ORDER BY on large tables",
      "Sorting is only for DBAs",
    ],
    answer: 0,
    explanation:
      "At sandbox scale, sort cost is irrelevant — focus on the RIGHT keys and directions. Indexing (a later topic) is what large-scale sort tuning looks like.",
  },
  {
    id: "l5-q27",
    prompt: "total_amount DESC lists -155.11 (a negative order) where?",
    options: [
      "First — negatives are biggest",
      "Last — it's the smallest value, above only NULLs (which follow it in DESC)",
      "In the middle",
      "It's dropped",
    ],
    answer: 1,
    explanation:
      "Negative totals are the smallest values → bottom of DESC. But NULLs rank BELOW it in DESC. A returns-refund (negative) hiding at the bottom next to NULLs is easy to miss.",
  },
  {
    id: "l5-q28",
    prompt: "You need the single most expensive order's id. Cleanest query?",
    options: [
      "SELECT id, total_amount FROM orders ORDER BY total_amount DESC LIMIT 1",
      "SELECT MAX(id) FROM orders",
      "SELECT id FROM orders WHERE total_amount = MAX(total_amount)",
      "SELECT FIRST(id) FROM orders",
    ],
    answer: 0,
    explanation:
      "Sort + LIMIT 1 — simple, extensible to top-5, and shows the value. Option C looks clever but aggregate MAX can't appear in WHERE like that; B answers the wrong question.",
  },
  {
    id: "l5-q29",
    prompt: "Which produces a REPRODUCIBLE random sample feel of 5 products?",
    options: [
      "SELECT product_name FROM products ORDER BY id LIMIT 5 — deterministic, same 5 every run",
      "SELECT product_name FROM products LIMIT 5 — usually the same, but order is technically undefined",
      "RANDOM() everywhere — out of Foundations scope",
      "There is no such thing",
    ],
    answer: 1,
    explanation:
      "Subtle: LIMIT without ORDER usually returns storage order (rowid) in SQLite, so it's stable in practice — but the guarantee comes only from ORDER BY. Our auto-grader requires explicit ORDER for order-sensitive tasks.",
  },
  {
    id: "l5-q30",
    prompt: "For pagination over 150 orders (page size 25), which pair fetches the LAST page?",
    options: [
      "LIMIT 25 OFFSET 125 — 6th page: rows 126–150",
      "LIMIT 25 OFFSET 25",
      "LIMIT 150 OFFSET 25",
      "LIMIT 25 OFFSET 150",
    ],
    answer: 0,
    explanation:
      "150/25 = 6 pages; the last page starts at row 126 → OFFSET 125. Off-by-one on OFFSET is the most common pagination bug — count carefully.",
  },
];
