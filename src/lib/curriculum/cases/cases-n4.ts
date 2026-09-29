// Case batch N4 — Module 10 window-function cases cs-1826…
// Generated from archetype matrices (scripts/gen-m10-cases.py); every case
// mechanically audited against the seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";
import { m10Cases } from "./m10-util";

export const casesN4: CaseStudy[] = m10Cases("n4", 1826, [
  [
    "easy", "month-close",
    "Through the 1 Preceding And Current Row frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Month Close case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 1 PRECEDING AND CURRENT ROW makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "growth",
    "Framed sum, pass 1",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Growth case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "funnel",
    "Through the Current Row And Unbounded Following frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Funnel case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "refund-audit",
    "Framed sum, pass 1",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Refund Audit case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "fraud",
    "Through the Unbounded Preceding And Current Row frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Fraud case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "supplier",
    "Framed sum, pass 1",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Supplier case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "pricing",
    "Through the Unbounded Preceding And Unbounded Following frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Pricing case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "catalog",
    "Framed sum, pass 1",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Catalog case pins the frame on orders: same sum, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: sum over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(SUM(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW makes the SUM(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "expense",
    "Through the 1 Preceding And Current Row frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Expense case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 1 PRECEDING AND CURRENT ROW makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "inventory",
    "Framed avg, pass 2",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Inventory case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "month-close",
    "Through the Current Row And Unbounded Following frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Month Close case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "growth",
    "Framed avg, pass 2",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Growth case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "funnel",
    "Through the Unbounded Preceding And Current Row frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Funnel case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "refund-audit",
    "Framed avg, pass 2",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Refund Audit case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "fraud",
    "Through the Unbounded Preceding And Unbounded Following frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Fraud case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "supplier",
    "Framed avg, pass 2",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Supplier case pins the frame on orders: same avg, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: avg over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(AVG(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW makes the AVG(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "pricing",
    "Through the 1 Preceding And Current Row frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Pricing case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 1 PRECEDING AND CURRENT ROW makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "catalog",
    "Framed max, pass 3",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Catalog case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "expense",
    "Through the Current Row And Unbounded Following frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Expense case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "inventory",
    "Framed max, pass 3",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Inventory case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "month-close",
    "Through the Unbounded Preceding And Current Row frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Month Close case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "growth",
    "Framed max, pass 3",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Growth case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: GROUPS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "funnel",
    "Through the Unbounded Preceding And Unbounded Following frame",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Funnel case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
  ],
  [
    "easy", "refund-audit",
    "Framed max, pass 3",
    "The aggregate is half the story — WHICH rows it sees is the other half. This Refund Audit case pins the frame on orders: same max, different bounds, a completely different column. The bounds and the ordering spine are the blanks.",
    "Compute the framed column: max over the pinned frame on orders.",
    "SELECT id, ROUND(total, 2) AS total,\n  ROUND(MAX(total) OVER (ORDER BY created_at, id {1}), 2) AS framed\nFROM {2}\nORDER BY created_at, {3};",
    [
      ["ROWS BETWEEN 6 PRECEDING AND CURRENT ROW", "keyword", "the frame bounds", "These bounds make the aggregate see exactly the intended slice — any other legal frame computes a different column with the same function name."],
      ["orders", "keyword", "the source table", "The framed arithmetic runs over orders; any other table lacks total and the query fails loudly."],
      ["id", "keyword", "the row order", "The id tiebreak keeps same-timestamp rows in a stable order so the frame arithmetic is reproducible."],
    ],
    ["ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING", "products", "total"],
    "Read the frame aloud — unit, start bound, end bound — and the column's meaning follows: ROWS BETWEEN 6 PRECEDING AND CURRENT ROW makes the MAX(total) cover exactly that slice of the stage. Frames never drop rows; they choose what the aggregate SEES. Every sibling frame the audit substitutes either fails to parse or produces a different column — that consequence check is the case's teeth, and the same discipline guards your production reports."
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
    "easy", "month-close",
    "Delta vs the total neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Month Close sheet wants the swing on orders.total at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: total at offset 1, current minus fetched.",
    "SELECT created_at, total AS val,\n  total - {1}(total, {2}) OVER (ORDER BY created_at, id) AS swing\nFROM orders\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["created_at, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "total"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "inventory",
    "The total swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Inventory sheet wants the swing on orders.total at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: total at offset 2, current minus fetched.",
    "SELECT created_at, total AS val,\n  total - {1}(total, {2}) OVER (ORDER BY created_at, id) AS swing\nFROM orders\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["created_at, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "total"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "expense",
    "Delta vs the total neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Expense sheet wants the swing on orders.total at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: total at offset 1, current minus fetched.",
    "SELECT created_at, total AS val,\n  total - {1}(total, {2}) OVER (ORDER BY created_at, id) AS swing\nFROM orders\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["created_at, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "total"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "catalog",
    "The total swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Catalog sheet wants the swing on orders.total at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: total at offset 2, current minus fetched.",
    "SELECT created_at, total AS val,\n  total - {1}(total, {2}) OVER (ORDER BY created_at, id) AS swing\nFROM orders\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["created_at, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "total"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
]);
