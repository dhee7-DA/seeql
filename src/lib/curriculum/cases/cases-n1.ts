// Case batch N1 — Module 10 window-fundamental cases cs-1676…cs-1725.
// 50 cases: OVER/PARTITION/ORDER mechanics on single tables (orders,
// customers, products, order_items) — grand totals, partition stamps,
// running seeds, evaluation-order traps. Keyword slots audited by
// distractor consequence; all figures grounded in scripts/facts-m10.txt.

import type { CaseStudy } from "./types";
import { m10Cases } from "./m10-util";

export const casesN1: CaseStudy[] = m10Cases("n1", 1676, [
  [
    "easy", "month-close",
    "Stamped with the sum",
    "The Month Close one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the sum computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["SUM", "keyword", "the reducer", "SUM over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["MIN", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, SUM reduces it to one fact, and that fact is stamped on every row — the census without the collapse. MIN in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "medium", "expense",
    "Stamped with the avg",
    "The Expense one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the avg computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["AVG", "keyword", "the reducer", "AVG over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, AVG reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "hard", "pricing",
    "Stamped with the min",
    "The Pricing one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the min computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["MIN", "keyword", "the reducer", "MIN over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["AVG", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, MIN reduces it to one fact, and that fact is stamped on every row — the census without the collapse. AVG in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "fraud",
    "Stamped with the max",
    "The Fraud one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the max computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["MAX", "keyword", "the reducer", "MAX over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, MAX reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "medium", "funnel",
    "Stamped with the count",
    "The Funnel one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the count computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["COUNT", "keyword", "the reducer", "COUNT over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["AVG", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, COUNT reduces it to one fact, and that fact is stamped on every row — the census without the collapse. AVG in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "hard", "month-close",
    "Stamped with the sum",
    "The Month Close one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the sum computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["SUM", "keyword", "the reducer", "SUM over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, SUM reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "expense",
    "Stamped with the avg",
    "The Expense one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the avg computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["AVG", "keyword", "the reducer", "AVG over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["MIN", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, AVG reduces it to one fact, and that fact is stamped on every row — the census without the collapse. MIN in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "medium", "pricing",
    "Stamped with the min",
    "The Pricing one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the min computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["MIN", "keyword", "the reducer", "MIN over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, MIN reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "hard", "fraud",
    "Stamped with the max",
    "The Fraud one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the max computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["MAX", "keyword", "the reducer", "MAX over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["AVG", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, MAX reduces it to one fact, and that fact is stamped on every row — the census without the collapse. AVG in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "funnel",
    "Stamped with the count",
    "The Funnel one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the count computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["COUNT", "keyword", "the reducer", "COUNT over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["MAX", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, COUNT reduces it to one fact, and that fact is stamped on every row — the census without the collapse. MAX in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "month-close",
    "Stamped with the sum",
    "The Month Close one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the sum computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["SUM", "keyword", "the reducer", "SUM over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["MIN", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, SUM reduces it to one fact, and that fact is stamped on every row — the census without the collapse. MIN in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "medium", "expense",
    "Stamped with the avg",
    "The Expense one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the avg computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["AVG", "keyword", "the reducer", "AVG over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, AVG reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "hard", "pricing",
    "Stamped with the min",
    "The Pricing one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the min computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["MIN", "keyword", "the reducer", "MIN over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["AVG", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, MIN reduces it to one fact, and that fact is stamped on every row — the census without the collapse. AVG in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "fraud",
    "Stamped with the max",
    "The Fraud one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the max computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["MAX", "keyword", "the reducer", "MAX over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, MAX reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "medium", "funnel",
    "Stamped with the count",
    "The Funnel one-pager annotates every orders row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every orders row with the count computed over the whole table.",
    "SELECT id, total AS val,\n  {1}(total) OVER {2} AS stamped\nFROM orders\nORDER BY {3}, id;",
    [
      ["COUNT", "keyword", "the reducer", "COUNT over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["AVG", "(ORDER BY id)", "products"],
    "One pass over orders: OVER () makes the whole table a single stage, COUNT reduces it to one fact, and that fact is stamped on every row — the census without the collapse. AVG in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "hard", "month-close",
    "Stamped with the sum",
    "The Month Close one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the sum computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["SUM", "keyword", "the reducer", "SUM over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, SUM reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "expense",
    "Stamped with the avg",
    "The Expense one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the avg computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["AVG", "keyword", "the reducer", "AVG over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["MIN", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, AVG reduces it to one fact, and that fact is stamped on every row — the census without the collapse. MIN in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "medium", "pricing",
    "Stamped with the min",
    "The Pricing one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the min computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["MIN", "keyword", "the reducer", "MIN over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["COUNT", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, MIN reduces it to one fact, and that fact is stamped on every row — the census without the collapse. COUNT in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "hard", "fraud",
    "Stamped with the max",
    "The Fraud one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the max computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["MAX", "keyword", "the reducer", "MAX over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["AVG", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, MAX reduces it to one fact, and that fact is stamped on every row — the census without the collapse. AVG in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "funnel",
    "Stamped with the count",
    "The Funnel one-pager annotates every products row with a whole-table fact computed in the same scan — no GROUP BY collapsing, no summary tab. The stamp column is drafted; the window call and its frame are the blanks.",
    "Stamp every products row with the count computed over the whole table.",
    "SELECT id, price AS val,\n  {1}(price) OVER {2} AS stamped\nFROM products\nORDER BY {3}, id;",
    [
      ["COUNT", "keyword", "the reducer", "COUNT over the grand window reduces every row to the same table-wide fact; the sibling aggregates execute and stamp a different number."],
      ["()", "keyword", "the empty window", "OVER () is the whole table as one stage — anything inside the parentheses needs a PARTITION or ORDER clause to be legal."],
      ["id", "keyword", "the row order", "A stable display order keeps the stamp readable; the window sees the same rows either way."],
    ],
    ["MAX", "(ORDER BY id)", "orders"],
    "One pass over products: OVER () makes the whole table a single stage, COUNT reduces it to one fact, and that fact is stamped on every row — the census without the collapse. MAX in the reducer slot would still execute and hand back a plausible but different number, which is precisely the consequence the audit checks before this case ships."
  ],
  [
    "easy", "month-close",
    "Slice of the total",
    "The Month Close team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["SUM(total)", "keyword", "the pool builder", "SUM over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["AVG(total)", "products", "pct ASC"],
    "The empty OVER is one stage over the whole table. SUM folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for AVG and every percent collapses to total-over-AVG — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "medium", "refund-audit",
    "Share of the total, take 1",
    "The Refund Audit team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["SUM(total)", "keyword", "the pool builder", "SUM over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct ASC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["MIN(total)", "customers", "pct DESC"],
    "The empty OVER is one stage over the whole table. SUM folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for MIN and every percent collapses to total-over-MIN — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "hard", "pricing",
    "Slice of the total",
    "The Pricing team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["SUM(total)", "keyword", "the pool builder", "SUM over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["val DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["MAX(total)", "products", "val ASC"],
    "The empty OVER is one stage over the whole table. SUM folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for MAX and every percent collapses to total-over-MAX — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "easy", "inventory",
    "Share of the total, take 1",
    "The Inventory team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["AVG(total)", "keyword", "the pool builder", "AVG over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["COUNT(total)", "customers", "pct ASC"],
    "The empty OVER is one stage over the whole table. AVG folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for COUNT and every percent collapses to total-over-COUNT — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "medium", "funnel",
    "Slice of the total",
    "The Funnel team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["AVG(total)", "keyword", "the pool builder", "AVG over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct ASC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["SUM(total)", "products", "pct DESC"],
    "The empty OVER is one stage over the whole table. AVG folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for SUM and every percent collapses to total-over-SUM — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "hard", "supplier",
    "Share of the total, take 1",
    "The Supplier team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["AVG(total)", "keyword", "the pool builder", "AVG over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["val DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["MIN(total)", "customers", "val ASC"],
    "The empty OVER is one stage over the whole table. AVG folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for MIN and every percent collapses to total-over-MIN — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "easy", "expense",
    "Slice of the total",
    "The Expense team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["MIN(total)", "keyword", "the pool builder", "MIN over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["MAX(total)", "products", "pct ASC"],
    "The empty OVER is one stage over the whole table. MIN folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for MAX and every percent collapses to total-over-MAX — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "medium", "growth",
    "Share of the total, take 2",
    "The Growth team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["MIN(total)", "keyword", "the pool builder", "MIN over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct ASC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["COUNT(total)", "customers", "pct DESC"],
    "The empty OVER is one stage over the whole table. MIN folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for COUNT and every percent collapses to total-over-COUNT — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "hard", "fraud",
    "Slice of the total",
    "The Fraud team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["MIN(total)", "keyword", "the pool builder", "MIN over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["val DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["SUM(total)", "products", "val ASC"],
    "The empty OVER is one stage over the whole table. MIN folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for SUM and every percent collapses to total-over-SUM — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "easy", "catalog",
    "Share of the total, take 2",
    "The Catalog team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["MAX(total)", "keyword", "the pool builder", "MAX over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["AVG(total)", "customers", "pct ASC"],
    "The empty OVER is one stage over the whole table. MAX folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for AVG and every percent collapses to total-over-AVG — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "medium", "month-close",
    "Slice of the total",
    "The Month Close team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["MAX(total)", "keyword", "the pool builder", "MAX over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct ASC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["MIN(total)", "products", "pct DESC"],
    "The empty OVER is one stage over the whole table. MAX folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for MIN and every percent collapses to total-over-MIN — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "hard", "refund-audit",
    "Share of the total, take 2",
    "The Refund Audit team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["MAX(total)", "keyword", "the pool builder", "MAX over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["val DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["COUNT(total)", "customers", "val ASC"],
    "The empty OVER is one stage over the whole table. MAX folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for COUNT and every percent collapses to total-over-COUNT — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "easy", "pricing",
    "Slice of the total",
    "The Pricing team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["COUNT(total)", "keyword", "the pool builder", "COUNT over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["SUM(total)", "products", "pct ASC"],
    "The empty OVER is one stage over the whole table. COUNT folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for SUM and every percent collapses to total-over-SUM — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "medium", "inventory",
    "Share of the total, take 2",
    "The Inventory team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["COUNT(total)", "keyword", "the pool builder", "COUNT over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["pct ASC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["AVG(total)", "customers", "pct DESC"],
    "The empty OVER is one stage over the whole table. COUNT folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for AVG and every percent collapses to total-over-AVG — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "hard", "funnel",
    "Slice of the total",
    "The Funnel team wants each row's slice of the whole total pool visible right on the row, so the review stops opening a second tab. The percent math is drafted; the window that pools the column and the sort are the blanks being rebuilt here.",
    "Show each row with its total as a percent of the pooled total.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1} OVER (), 2) AS pct\nFROM {2}\nORDER BY {3};",
    [
      ["COUNT(total)", "keyword", "the pool builder", "COUNT over the empty window pools the whole table as the denominator; the sibling aggregates execute too and produce a different, quietly wrong pool."],
      ["orders", "keyword", "the source table", "The total column lives in orders; any other table either lacks the column or pools the wrong population."],
      ["val DESC", "keyword", "the display order", "The sort decides which end of the share distribution the reader meets first — DESC fronts the biggest slices."],
    ],
    ["MIN(total)", "products", "val ASC"],
    "The empty OVER is one stage over the whole table. COUNT folds it into one denominator, every row divides its own total by that pool, and the ORDER BY fronts the concentration story. Swap the pool builder for MIN and every percent collapses to total-over-MIN — a plausible-looking number that is wrong on every row, which is exactly the trap this case drills and the audit verifies mechanically."
  ],
  [
    "easy", "month-close",
    "Within the status pool",
    "Store-wide shares hide the structure: the Month Close review measures every orders row against its OWN status pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own status pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} status), 2) AS pct_in_group\nFROM orders\nORDER BY status, {3};",
    [
      ["SUM", "keyword", "the pool builder", "SUM pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["status", "keyword", "the pool key", "The pool key defines the family each row competes in — status is the grouping this report promises."],
    ],
    ["AVG", "ORDER BY", "products"],
    "The partition slices orders into per-status stages, SUM pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "hard", "growth",
    "Inside the customer_id, spin 1",
    "Store-wide shares hide the structure: the Growth review measures every orders row against its OWN customer_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own customer_id pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} customer_id), 2) AS pct_in_group\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["SUM", "keyword", "the pool builder", "SUM pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["customer_id", "keyword", "the pool key", "The pool key defines the family each row competes in — customer_id is the grouping this report promises."],
    ],
    ["MIN", "ORDER BY", "products"],
    "The partition slices orders into per-customer_id stages, SUM pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "medium", "funnel",
    "Within the status pool",
    "Store-wide shares hide the structure: the Funnel review measures every orders row against its OWN status pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own status pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} status), 2) AS pct_in_group\nFROM orders\nORDER BY status, {3};",
    [
      ["AVG", "keyword", "the pool builder", "AVG pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["status", "keyword", "the pool key", "The pool key defines the family each row competes in — status is the grouping this report promises."],
    ],
    ["MAX", "ORDER BY", "products"],
    "The partition slices orders into per-status stages, AVG pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "easy", "refund-audit",
    "Inside the customer_id, spin 1",
    "Store-wide shares hide the structure: the Refund Audit review measures every orders row against its OWN customer_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own customer_id pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} customer_id), 2) AS pct_in_group\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["AVG", "keyword", "the pool builder", "AVG pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["customer_id", "keyword", "the pool key", "The pool key defines the family each row competes in — customer_id is the grouping this report promises."],
    ],
    ["COUNT", "ORDER BY", "products"],
    "The partition slices orders into per-customer_id stages, AVG pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "hard", "fraud",
    "Within the status pool",
    "Store-wide shares hide the structure: the Fraud review measures every orders row against its OWN status pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own status pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} status), 2) AS pct_in_group\nFROM orders\nORDER BY status, {3};",
    [
      ["MIN", "keyword", "the pool builder", "MIN pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["status", "keyword", "the pool key", "The pool key defines the family each row competes in — status is the grouping this report promises."],
    ],
    ["SUM", "ORDER BY", "products"],
    "The partition slices orders into per-status stages, MIN pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "medium", "supplier",
    "Inside the customer_id, spin 1",
    "Store-wide shares hide the structure: the Supplier review measures every orders row against its OWN customer_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own customer_id pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} customer_id), 2) AS pct_in_group\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["MIN", "keyword", "the pool builder", "MIN pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["customer_id", "keyword", "the pool key", "The pool key defines the family each row competes in — customer_id is the grouping this report promises."],
    ],
    ["AVG", "ORDER BY", "products"],
    "The partition slices orders into per-customer_id stages, MIN pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "easy", "pricing",
    "Within the status pool",
    "Store-wide shares hide the structure: the Pricing review measures every orders row against its OWN status pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own status pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} status), 2) AS pct_in_group\nFROM orders\nORDER BY status, {3};",
    [
      ["MAX", "keyword", "the pool builder", "MAX pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["status", "keyword", "the pool key", "The pool key defines the family each row competes in — status is the grouping this report promises."],
    ],
    ["MIN", "ORDER BY", "products"],
    "The partition slices orders into per-status stages, MAX pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "hard", "catalog",
    "Inside the customer_id, spin 1",
    "Store-wide shares hide the structure: the Catalog review measures every orders row against its OWN customer_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own customer_id pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} customer_id), 2) AS pct_in_group\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["MAX", "keyword", "the pool builder", "MAX pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["customer_id", "keyword", "the pool key", "The pool key defines the family each row competes in — customer_id is the grouping this report promises."],
    ],
    ["COUNT", "ORDER BY", "products"],
    "The partition slices orders into per-customer_id stages, MAX pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "medium", "expense",
    "Within the status pool",
    "Store-wide shares hide the structure: the Expense review measures every orders row against its OWN status pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own status pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} status), 2) AS pct_in_group\nFROM orders\nORDER BY status, {3};",
    [
      ["COUNT", "keyword", "the pool builder", "COUNT pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["status", "keyword", "the pool key", "The pool key defines the family each row competes in — status is the grouping this report promises."],
    ],
    ["SUM", "ORDER BY", "products"],
    "The partition slices orders into per-status stages, COUNT pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "easy", "inventory",
    "Inside the customer_id, spin 1",
    "Store-wide shares hide the structure: the Inventory review measures every orders row against its OWN customer_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's total as a percent of its own customer_id pool.",
    "SELECT id, total AS val,\n  ROUND(100.0 * total / {1}(total) OVER ({2} customer_id), 2) AS pct_in_group\nFROM orders\nORDER BY customer_id, {3};",
    [
      ["COUNT", "keyword", "the pool builder", "COUNT pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["customer_id", "keyword", "the pool key", "The pool key defines the family each row competes in — customer_id is the grouping this report promises."],
    ],
    ["AVG", "ORDER BY", "products"],
    "The partition slices orders into per-customer_id stages, COUNT pools each one, and every row divides its own total by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "hard", "month-close",
    "Within the category pool",
    "Store-wide shares hide the structure: the Month Close review measures every products row against its OWN category pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's price as a percent of its own category pool.",
    "SELECT id, price AS val,\n  ROUND(100.0 * price / {1}(price) OVER ({2} category), 2) AS pct_in_group\nFROM products\nORDER BY category, {3};",
    [
      ["SUM", "keyword", "the pool builder", "SUM pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["category", "keyword", "the pool key", "The pool key defines the family each row competes in — category is the grouping this report promises."],
    ],
    ["MAX", "ORDER BY", "orders"],
    "The partition slices products into per-category stages, SUM pools each one, and every row divides its own price by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "medium", "growth",
    "Inside the supplier_id, spin 2",
    "Store-wide shares hide the structure: the Growth review measures every products row against its OWN supplier_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's price as a percent of its own supplier_id pool.",
    "SELECT id, price AS val,\n  ROUND(100.0 * price / {1}(price) OVER ({2} supplier_id), 2) AS pct_in_group\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["SUM", "keyword", "the pool builder", "SUM pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["supplier_id", "keyword", "the pool key", "The pool key defines the family each row competes in — supplier_id is the grouping this report promises."],
    ],
    ["COUNT", "ORDER BY", "orders"],
    "The partition slices products into per-supplier_id stages, SUM pools each one, and every row divides its own price by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "easy", "funnel",
    "Within the category pool",
    "Store-wide shares hide the structure: the Funnel review measures every products row against its OWN category pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's price as a percent of its own category pool.",
    "SELECT id, price AS val,\n  ROUND(100.0 * price / {1}(price) OVER ({2} category), 2) AS pct_in_group\nFROM products\nORDER BY category, {3};",
    [
      ["AVG", "keyword", "the pool builder", "AVG pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["category", "keyword", "the pool key", "The pool key defines the family each row competes in — category is the grouping this report promises."],
    ],
    ["SUM", "ORDER BY", "orders"],
    "The partition slices products into per-category stages, AVG pools each one, and every row divides its own price by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "hard", "refund-audit",
    "Inside the supplier_id, spin 2",
    "Store-wide shares hide the structure: the Refund Audit review measures every products row against its OWN supplier_id pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's price as a percent of its own supplier_id pool.",
    "SELECT id, price AS val,\n  ROUND(100.0 * price / {1}(price) OVER ({2} supplier_id), 2) AS pct_in_group\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["AVG", "keyword", "the pool builder", "AVG pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["supplier_id", "keyword", "the pool key", "The pool key defines the family each row competes in — supplier_id is the grouping this report promises."],
    ],
    ["MIN", "ORDER BY", "orders"],
    "The partition slices products into per-supplier_id stages, AVG pools each one, and every row divides its own price by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
  [
    "medium", "fraud",
    "Within the category pool",
    "Store-wide shares hide the structure: the Fraud review measures every products row against its OWN category pool instead. The percent math is drafted; the partitioned window that builds the per-stage denominator is the blank.",
    "Show each row's price as a percent of its own category pool.",
    "SELECT id, price AS val,\n  ROUND(100.0 * price / {1}(price) OVER ({2} category), 2) AS pct_in_group\nFROM products\nORDER BY category, {3};",
    [
      ["MIN", "keyword", "the pool builder", "MIN pools each stage; AVG would divide every row by its stage's mean and the shares would add to nothing sensible."],
      ["PARTITION BY", "keyword", "the pool clause", "PARTITION BY builds one pool per key; without it the denominator becomes the whole table and every share shrinks."],
      ["category", "keyword", "the pool key", "The pool key defines the family each row competes in — category is the grouping this report promises."],
    ],
    ["MAX", "ORDER BY", "orders"],
    "The partition slices products into per-category stages, MIN pools each one, and every row divides its own price by its own stage's pool — shares inside a stage sum to roughly 100 with the usual rounding drift. Dropping the partition is the classic mistake the distractor set stages: the query still runs and the column quietly becomes a store-wide share, right shape, wrong denominator."
  ],
]);
