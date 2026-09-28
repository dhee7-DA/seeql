// Case batch N6 — Module 10 window-function cases cs-1926…
// Generated from archetype matrices (scripts/gen-m10-cases.py); every case
// mechanically audited against the seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";
import { m10Cases } from "./m10-util";

export const casesN6: CaseStudy[] = m10Cases("n6", 1926, [
  [
    "easy", "month-close",
    "Grouped then ranked: RANK",
    "Windows run AFTER grouping — this Month Close case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "catalog",
    "The status league, spin 1",
    "Windows run AFTER grouping — this Catalog case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "fraud",
    "Grouped then ranked: RANK",
    "Windows run AFTER grouping — this Fraud case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "growth",
    "The substr league, spin 1",
    "Windows run AFTER grouping — this Growth case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then DENSE_RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "expense",
    "Grouped then ranked: DENSE_RANK",
    "Windows run AFTER grouping — this Expense case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then DENSE_RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "supplier",
    "The customer_id league, spin 1",
    "Windows run AFTER grouping — this Supplier case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then DENSE_RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "funnel",
    "Grouped then ranked: ROW_NUMBER",
    "Windows run AFTER grouping — this Funnel case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then ROW_NUMBER ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "inventory",
    "The status league, spin 1",
    "Windows run AFTER grouping — this Inventory case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then ROW_NUMBER ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "pricing",
    "Grouped then ranked: ROW_NUMBER",
    "Windows run AFTER grouping — this Pricing case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then ROW_NUMBER ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "refund-audit",
    "The substr league, spin 1",
    "Windows run AFTER grouping — this Refund Audit case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["PERCENT_RANK", "keyword", "the ranker", "PERCENT_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["CUME_DIST()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then PERCENT_RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "month-close",
    "Grouped then ranked: PERCENT_RANK",
    "Windows run AFTER grouping — this Month Close case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["PERCENT_RANK", "keyword", "the ranker", "PERCENT_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["CUME_DIST()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then PERCENT_RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "catalog",
    "The customer_id league, spin 1",
    "Windows run AFTER grouping — this Catalog case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["PERCENT_RANK", "keyword", "the ranker", "PERCENT_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["CUME_DIST()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then PERCENT_RANK ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "fraud",
    "Grouped then ranked: CUME_DIST",
    "Windows run AFTER grouping — this Fraud case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["CUME_DIST", "keyword", "the ranker", "CUME_DIST numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then CUME_DIST ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "growth",
    "The status league, spin 1",
    "Windows run AFTER grouping — this Growth case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["CUME_DIST", "keyword", "the ranker", "CUME_DIST numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then CUME_DIST ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "expense",
    "Grouped then ranked: CUME_DIST",
    "Windows run AFTER grouping — this Expense case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(SUM(total), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["CUME_DIST", "keyword", "the ranker", "CUME_DIST numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["SUM(total)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then CUME_DIST ranks those survivors by SUM(total). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "supplier",
    "The substr league, spin 2",
    "Windows run AFTER grouping — this Supplier case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "funnel",
    "Grouped then ranked: RANK",
    "Windows run AFTER grouping — this Funnel case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "inventory",
    "The customer_id league, spin 2",
    "Windows run AFTER grouping — this Inventory case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "pricing",
    "Grouped then ranked: DENSE_RANK",
    "Windows run AFTER grouping — this Pricing case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then DENSE_RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "refund-audit",
    "The status league, spin 2",
    "Windows run AFTER grouping — this Refund Audit case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then DENSE_RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "month-close",
    "Grouped then ranked: DENSE_RANK",
    "Windows run AFTER grouping — this Month Close case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then DENSE_RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "catalog",
    "The substr league, spin 2",
    "Windows run AFTER grouping — this Catalog case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then ROW_NUMBER ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "medium", "fraud",
    "Grouped then ranked: ROW_NUMBER",
    "Windows run AFTER grouping — this Fraud case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT status AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then ROW_NUMBER ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "hard", "growth",
    "The customer_id league, spin 2",
    "Windows run AFTER grouping — this Growth case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT customer_id AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["PERCENT_RANK()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then ROW_NUMBER ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "expense",
    "Grouped then ranked: PERCENT_RANK",
    "Windows run AFTER grouping — this Expense case ranks the rolled-up rows in the same query. The GROUP BY folds orders into one row per key; the OVER ranks what survived. The rollup key, the metric and the ranker are the blanks.",
    "Group by the key, then rank the groups by the aggregate — one SELECT.",
    "SELECT SUBSTR(created_at, 1, 7) AS grp, ROUND(COUNT(*), 2) AS metric,\n  {1}() OVER (ORDER BY {2} DESC) AS rk\nFROM orders\nGROUP BY grp\nORDER BY {3};",
    [
      ["PERCENT_RANK", "keyword", "the ranker", "PERCENT_RANK numbers the grouped rows with its own tie contract; the siblings parse and draw different leagues."],
      ["COUNT(*)", "keyword", "the group metric", "The rank reads this aggregate — the window sees it only because GROUP BY ran first."],
      ["rk", "keyword", "the display order", "Presenting by rank reads the league top-down; any other order buries the podium."],
    ],
    ["CUME_DIST()", "AVG(total)", "grp"],
    "Evaluation order does the work: GROUP BY collapses to one row per key, then PERCENT_RANK ranks those survivors by COUNT(*). Alias-free aggregates inside OVER are the portable spelling — engines resolve them after grouping. The audit swaps in sibling rankers and metrics; each either breaks the grouped grammar or builds a different league, which is exactly the consequence the case teaches and the reason the two-layer CTE shape from the lessons stays in your fingers."
  ],
  [
    "easy", "month-close",
    "The status ladder",
    "The Month Close review needs standings: every orders row ranked inside its own status stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its status stage by total DESC.",
    "SELECT status, total,\n  {1}() OVER (PARTITION BY status ORDER BY total {2}) AS rk\nFROM orders\nORDER BY status, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "RANK numbers every row inside its status stage by total DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "refund-audit",
    "Podium in the customer_id, heat 1",
    "The Refund Audit review needs standings: every orders row ranked inside its own customer_id stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its customer_id stage by total DESC.",
    "SELECT customer_id, total,\n  {1}() OVER (PARTITION BY customer_id ORDER BY total {2}) AS rk\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "RANK numbers every row inside its customer_id stage by total DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "pricing",
    "The status ladder",
    "The Pricing review needs standings: every orders row ranked inside its own status stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its status stage by total ASC.",
    "SELECT status, total,\n  {1}() OVER (PARTITION BY status ORDER BY total {2}) AS rk\nFROM orders\nORDER BY status, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "RANK numbers every row inside its status stage by total ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "inventory",
    "Podium in the customer_id, heat 1",
    "The Inventory review needs standings: every orders row ranked inside its own customer_id stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its customer_id stage by total ASC.",
    "SELECT customer_id, total,\n  {1}() OVER (PARTITION BY customer_id ORDER BY total {2}) AS rk\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "RANK numbers every row inside its customer_id stage by total ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "funnel",
    "The status ladder",
    "The Funnel review needs standings: every orders row ranked inside its own status stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its status stage by total DESC.",
    "SELECT status, total,\n  {1}() OVER (PARTITION BY status ORDER BY total {2}) AS rk\nFROM orders\nORDER BY status, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "ROW_NUMBER numbers every row inside its status stage by total DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "supplier",
    "Podium in the customer_id, heat 1",
    "The Supplier review needs standings: every orders row ranked inside its own customer_id stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its customer_id stage by total DESC.",
    "SELECT customer_id, total,\n  {1}() OVER (PARTITION BY customer_id ORDER BY total {2}) AS rk\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "ROW_NUMBER numbers every row inside its customer_id stage by total DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "expense",
    "The status ladder",
    "The Expense review needs standings: every orders row ranked inside its own status stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its status stage by total ASC.",
    "SELECT status, total,\n  {1}() OVER (PARTITION BY status ORDER BY total {2}) AS rk\nFROM orders\nORDER BY status, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "ROW_NUMBER numbers every row inside its status stage by total ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "growth",
    "Podium in the customer_id, heat 1",
    "The Growth review needs standings: every orders row ranked inside its own customer_id stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its customer_id stage by total ASC.",
    "SELECT customer_id, total,\n  {1}() OVER (PARTITION BY customer_id ORDER BY total {2}) AS rk\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "ROW_NUMBER numbers every row inside its customer_id stage by total ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "fraud",
    "The status ladder",
    "The Fraud review needs standings: every orders row ranked inside its own status stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its status stage by total DESC.",
    "SELECT status, total,\n  {1}() OVER (PARTITION BY status ORDER BY total {2}) AS rk\nFROM orders\nORDER BY status, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "DENSE_RANK numbers every row inside its status stage by total DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "catalog",
    "Podium in the customer_id, heat 1",
    "The Catalog review needs standings: every orders row ranked inside its own customer_id stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its customer_id stage by total DESC.",
    "SELECT customer_id, total,\n  {1}() OVER (PARTITION BY customer_id ORDER BY total {2}) AS rk\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "DENSE_RANK numbers every row inside its customer_id stage by total DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "month-close",
    "The status ladder",
    "The Month Close review needs standings: every orders row ranked inside its own status stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its status stage by total ASC.",
    "SELECT status, total,\n  {1}() OVER (PARTITION BY status ORDER BY total {2}) AS rk\nFROM orders\nORDER BY status, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "DENSE_RANK numbers every row inside its status stage by total ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "refund-audit",
    "Podium in the customer_id, heat 1",
    "The Refund Audit review needs standings: every orders row ranked inside its own customer_id stage by total, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its customer_id stage by total ASC.",
    "SELECT customer_id, total,\n  {1}() OVER (PARTITION BY customer_id ORDER BY total {2}) AS rk\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "DENSE_RANK numbers every row inside its customer_id stage by total ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "pricing",
    "The category ladder",
    "The Pricing review needs standings: every products row ranked inside its own category stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its category stage by price DESC.",
    "SELECT category, price,\n  {1}() OVER (PARTITION BY category ORDER BY price {2}) AS rk\nFROM products\nORDER BY category, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "RANK numbers every row inside its category stage by price DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "inventory",
    "Podium in the supplier_id, heat 2",
    "The Inventory review needs standings: every products row ranked inside its own supplier_id stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its supplier_id stage by price DESC.",
    "SELECT supplier_id, price,\n  {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}) AS rk\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "RANK numbers every row inside its supplier_id stage by price DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "funnel",
    "The category ladder",
    "The Funnel review needs standings: every products row ranked inside its own category stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its category stage by price ASC.",
    "SELECT category, price,\n  {1}() OVER (PARTITION BY category ORDER BY price {2}) AS rk\nFROM products\nORDER BY category, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "RANK numbers every row inside its category stage by price ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "month-close",
    "The total neighbor, 1 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Month Close sheet wants every orders row to carry the total of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the total from 1 position(s) back onto every row.",
    "SELECT created_at, total AS val,\n  {1}(total, {2}) OVER (ORDER BY created_at, id) AS prev_total\nFROM {3}\nORDER BY created_at, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["orders", "keyword", "the source table", "The timeline lives in orders; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "2", "products"],
    "LAG(total, %(o)d) OVER (ORDER BY created_at, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "inventory",
    "LAG peek 1",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Inventory sheet wants every orders row to carry the total of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the total from 2 position(s) back onto every row.",
    "SELECT created_at, total AS val,\n  {1}(total, {2}) OVER (ORDER BY created_at, id) AS prev_total\nFROM {3}\nORDER BY created_at, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["orders", "keyword", "the source table", "The timeline lives in orders; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "3", "customers"],
    "LAG(total, %(o)d) OVER (ORDER BY created_at, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "expense",
    "The total neighbor, 3 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Expense sheet wants every orders row to carry the total of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the total from 3 position(s) back onto every row.",
    "SELECT created_at, total AS val,\n  {1}(total, {2}) OVER (ORDER BY created_at, id) AS prev_total\nFROM {3}\nORDER BY created_at, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["orders", "keyword", "the source table", "The timeline lives in orders; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "4", "products"],
    "LAG(total, %(o)d) OVER (ORDER BY created_at, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "catalog",
    "LEAD peek 1",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Catalog sheet wants every orders row to carry the total of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the total from 1 position(s) ahead onto every row.",
    "SELECT created_at, total AS val,\n  {1}(total, {2}) OVER (ORDER BY created_at, id) AS next_total\nFROM {3}\nORDER BY created_at, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["orders", "keyword", "the source table", "The timeline lives in orders; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "2", "customers"],
    "LEAD(total, %(o)d) OVER (ORDER BY created_at, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "pricing",
    "The total neighbor, 2 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Pricing sheet wants every orders row to carry the total of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the total from 2 position(s) ahead onto every row.",
    "SELECT created_at, total AS val,\n  {1}(total, {2}) OVER (ORDER BY created_at, id) AS next_total\nFROM {3}\nORDER BY created_at, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["orders", "keyword", "the source table", "The timeline lives in orders; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "3", "products"],
    "LEAD(total, %(o)d) OVER (ORDER BY created_at, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "supplier",
    "LEAD peek 1",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Supplier sheet wants every orders row to carry the total of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the total from 3 position(s) ahead onto every row.",
    "SELECT created_at, total AS val,\n  {1}(total, {2}) OVER (ORDER BY created_at, id) AS next_total\nFROM {3}\nORDER BY created_at, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["orders", "keyword", "the source table", "The timeline lives in orders; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "4", "customers"],
    "LEAD(total, %(o)d) OVER (ORDER BY created_at, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "fraud",
    "The price neighbor, 1 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Fraud sheet wants every products row to carry the price of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the price from 1 position(s) back onto every row.",
    "SELECT price, price AS val,\n  {1}(price, {2}) OVER (ORDER BY price, id) AS prev_price\nFROM {3}\nORDER BY price, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["products", "keyword", "the source table", "The timeline lives in products; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "2", "orders"],
    "LAG(price, %(o)d) OVER (ORDER BY price, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "refund-audit",
    "LAG peek 1",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Refund Audit sheet wants every products row to carry the price of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the price from 2 position(s) back onto every row.",
    "SELECT price, price AS val,\n  {1}(price, {2}) OVER (ORDER BY price, id) AS prev_price\nFROM {3}\nORDER BY price, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["products", "keyword", "the source table", "The timeline lives in products; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "3", "suppliers"],
    "LAG(price, %(o)d) OVER (ORDER BY price, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "funnel",
    "The price neighbor, 3 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Funnel sheet wants every products row to carry the price of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the price from 3 position(s) back onto every row.",
    "SELECT price, price AS val,\n  {1}(price, {2}) OVER (ORDER BY price, id) AS prev_price\nFROM {3}\nORDER BY price, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["products", "keyword", "the source table", "The timeline lives in products; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "4", "orders"],
    "LAG(price, %(o)d) OVER (ORDER BY price, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "growth",
    "LEAD peek 2",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Growth sheet wants every products row to carry the price of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the price from 1 position(s) ahead onto every row.",
    "SELECT price, price AS val,\n  {1}(price, {2}) OVER (ORDER BY price, id) AS next_price\nFROM {3}\nORDER BY price, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["products", "keyword", "the source table", "The timeline lives in products; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "2", "suppliers"],
    "LEAD(price, %(o)d) OVER (ORDER BY price, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
]);
