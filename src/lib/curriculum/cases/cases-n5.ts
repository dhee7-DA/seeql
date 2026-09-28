// Case batch N5 — Module 10 window-function cases cs-1876…
// Generated from archetype matrices (scripts/gen-m10-cases.py); every case
// mechanically audited against the seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";
import { m10Cases } from "./m10-util";

export const casesN5: CaseStudy[] = m10Cases("n5", 1876, [
  [
    "easy", "month-close",
    "Standing by total",
    "Distribution questions need every row to carry its standing. The Month Close report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(4)", "keyword", "the standing function", "NTILE(4) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(5)", "ASC", "id"],
    "NTILE(4) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "catalog",
    "The total station, cut 1",
    "Distribution questions need every row to carry its standing. The Catalog report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(4)", "keyword", "the standing function", "NTILE(4) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["PERCENT_RANK()", "DESC", "id"],
    "NTILE(4) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "fraud",
    "Standing by total",
    "Distribution questions need every row to carry its standing. The Fraud report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(5)", "keyword", "the standing function", "NTILE(5) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["CUME_DIST()", "ASC", "id"],
    "NTILE(5) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "growth",
    "The total station, cut 1",
    "Distribution questions need every row to carry its standing. The Growth report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(5)", "keyword", "the standing function", "NTILE(5) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(2)", "DESC", "id"],
    "NTILE(5) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "expense",
    "Standing by total",
    "Distribution questions need every row to carry its standing. The Expense report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its percent_rank standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["PERCENT_RANK()", "keyword", "the standing function", "PERCENT_RANK() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(3)", "ASC", "id"],
    "PERCENT_RANK() over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "supplier",
    "The total station, cut 1",
    "Distribution questions need every row to carry its standing. The Supplier report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its percent_rank standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["PERCENT_RANK()", "keyword", "the standing function", "PERCENT_RANK() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(4)", "DESC", "id"],
    "PERCENT_RANK() over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "funnel",
    "Standing by total",
    "Distribution questions need every row to carry its standing. The Funnel report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its cume_dist standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["CUME_DIST()", "keyword", "the standing function", "CUME_DIST() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(5)", "ASC", "id"],
    "CUME_DIST() over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "inventory",
    "The total station, cut 1",
    "Distribution questions need every row to carry its standing. The Inventory report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its cume_dist standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["CUME_DIST()", "keyword", "the standing function", "CUME_DIST() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["PERCENT_RANK()", "DESC", "id"],
    "CUME_DIST() over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "pricing",
    "Standing by total",
    "Distribution questions need every row to carry its standing. The Pricing report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(2)", "keyword", "the standing function", "NTILE(2) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["CUME_DIST()", "ASC", "id"],
    "NTILE(2) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "refund-audit",
    "The total station, cut 1",
    "Distribution questions need every row to carry its standing. The Refund Audit report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(2)", "keyword", "the standing function", "NTILE(2) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(3)", "DESC", "id"],
    "NTILE(2) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "month-close",
    "Standing by total",
    "Distribution questions need every row to carry its standing. The Month Close report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(3)", "keyword", "the standing function", "NTILE(3) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(4)", "ASC", "id"],
    "NTILE(3) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "catalog",
    "The total station, cut 1",
    "Distribution questions need every row to carry its standing. The Catalog report stamps orders rows along total: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along total.",
    "SELECT id, total AS val,\n  {1} OVER (ORDER BY total {2}) AS standing\nFROM orders\nORDER BY {3}, val;",
    [
      ["NTILE(3)", "keyword", "the standing function", "NTILE(3) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(5)", "DESC", "id"],
    "NTILE(3) over the total-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "fraud",
    "Standing by price",
    "Distribution questions need every row to carry its standing. The Fraud report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(4)", "keyword", "the standing function", "NTILE(4) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["CUME_DIST()", "ASC", "id"],
    "NTILE(4) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "growth",
    "The price station, cut 2",
    "Distribution questions need every row to carry its standing. The Growth report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(4)", "keyword", "the standing function", "NTILE(4) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(2)", "DESC", "id"],
    "NTILE(4) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "expense",
    "Standing by price",
    "Distribution questions need every row to carry its standing. The Expense report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(5)", "keyword", "the standing function", "NTILE(5) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(3)", "ASC", "id"],
    "NTILE(5) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "supplier",
    "The price station, cut 2",
    "Distribution questions need every row to carry its standing. The Supplier report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(5)", "keyword", "the standing function", "NTILE(5) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(4)", "DESC", "id"],
    "NTILE(5) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "funnel",
    "Standing by price",
    "Distribution questions need every row to carry its standing. The Funnel report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its percent_rank standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["PERCENT_RANK()", "keyword", "the standing function", "PERCENT_RANK() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(5)", "ASC", "id"],
    "PERCENT_RANK() over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "inventory",
    "The price station, cut 2",
    "Distribution questions need every row to carry its standing. The Inventory report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its percent_rank standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["PERCENT_RANK()", "keyword", "the standing function", "PERCENT_RANK() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["CUME_DIST()", "DESC", "id"],
    "PERCENT_RANK() over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "pricing",
    "Standing by price",
    "Distribution questions need every row to carry its standing. The Pricing report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its cume_dist standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["CUME_DIST()", "keyword", "the standing function", "CUME_DIST() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(2)", "ASC", "id"],
    "CUME_DIST() over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "refund-audit",
    "The price station, cut 2",
    "Distribution questions need every row to carry its standing. The Refund Audit report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its cume_dist standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["CUME_DIST()", "keyword", "the standing function", "CUME_DIST() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(3)", "DESC", "id"],
    "CUME_DIST() over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "month-close",
    "Standing by price",
    "Distribution questions need every row to carry its standing. The Month Close report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(2)", "keyword", "the standing function", "NTILE(2) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(4)", "ASC", "id"],
    "NTILE(2) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "catalog",
    "The price station, cut 2",
    "Distribution questions need every row to carry its standing. The Catalog report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(2)", "keyword", "the standing function", "NTILE(2) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(5)", "DESC", "id"],
    "NTILE(2) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "fraud",
    "Standing by price",
    "Distribution questions need every row to carry its standing. The Fraud report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(3)", "keyword", "the standing function", "NTILE(3) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["PERCENT_RANK()", "ASC", "id"],
    "NTILE(3) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "growth",
    "The price station, cut 2",
    "Distribution questions need every row to carry its standing. The Growth report stamps products rows along price: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along price.",
    "SELECT id, price AS val,\n  {1} OVER (ORDER BY price {2}) AS standing\nFROM products\nORDER BY {3}, val;",
    [
      ["NTILE(3)", "keyword", "the standing function", "NTILE(3) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["CUME_DIST()", "DESC", "id"],
    "NTILE(3) over the price-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "expense",
    "Standing by quantity",
    "Distribution questions need every row to carry its standing. The Expense report stamps order_items rows along quantity: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along quantity.",
    "SELECT id, quantity AS val,\n  {1} OVER (ORDER BY quantity {2}) AS standing\nFROM order_items\nORDER BY {3}, val;",
    [
      ["NTILE(4)", "keyword", "the standing function", "NTILE(4) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(3)", "ASC", "id"],
    "NTILE(4) over the quantity-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "supplier",
    "The quantity station, cut 3",
    "Distribution questions need every row to carry its standing. The Supplier report stamps order_items rows along quantity: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along quantity.",
    "SELECT id, quantity AS val,\n  {1} OVER (ORDER BY quantity {2}) AS standing\nFROM order_items\nORDER BY {3}, val;",
    [
      ["NTILE(4)", "keyword", "the standing function", "NTILE(4) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(5)", "DESC", "id"],
    "NTILE(4) over the quantity-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "funnel",
    "Standing by quantity",
    "Distribution questions need every row to carry its standing. The Funnel report stamps order_items rows along quantity: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along quantity.",
    "SELECT id, quantity AS val,\n  {1} OVER (ORDER BY quantity {2}) AS standing\nFROM order_items\nORDER BY {3}, val;",
    [
      ["NTILE(5)", "keyword", "the standing function", "NTILE(5) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["PERCENT_RANK()", "ASC", "id"],
    "NTILE(5) over the quantity-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "easy", "inventory",
    "The quantity station, cut 3",
    "Distribution questions need every row to carry its standing. The Inventory report stamps order_items rows along quantity: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its ntile standing along quantity.",
    "SELECT id, quantity AS val,\n  {1} OVER (ORDER BY quantity {2}) AS standing\nFROM order_items\nORDER BY {3}, val;",
    [
      ["NTILE(5)", "keyword", "the standing function", "NTILE(5) computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["CUME_DIST()", "DESC", "id"],
    "NTILE(5) over the quantity-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "hard", "pricing",
    "Standing by quantity",
    "Distribution questions need every row to carry its standing. The Pricing report stamps order_items rows along quantity: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its percent_rank standing along quantity.",
    "SELECT id, quantity AS val,\n  {1} OVER (ORDER BY quantity {2}) AS standing\nFROM order_items\nORDER BY {3}, val;",
    [
      ["PERCENT_RANK()", "keyword", "the standing function", "PERCENT_RANK() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["DESC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(2)", "ASC", "id"],
    "PERCENT_RANK() over the quantity-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
  ],
  [
    "medium", "refund-audit",
    "The quantity station, cut 3",
    "Distribution questions need every row to carry its standing. The Refund Audit report stamps order_items rows along quantity: tiles promise equal-count bands, percent-rank and cumulative distance promise 0..1 ladders — the pinned function decides which contract ships.",
    "Stamp every row with its percent_rank standing along quantity.",
    "SELECT id, quantity AS val,\n  {1} OVER (ORDER BY quantity {2}) AS standing\nFROM order_items\nORDER BY {3}, val;",
    [
      ["PERCENT_RANK()", "keyword", "the standing function", "PERCENT_RANK() computes the standing with its own normalization; the sibling functions parse too and produce a different scale entirely."],
      ["ASC", "keyword", "the ladder direction", "The direction decides which end of the distribution is 'first' — flipping it flips every standing."],
      ["standing", "keyword", "the display order", "Sorting by the standing reads the distribution like a ladder; sorting by value hides it."],
    ],
    ["NTILE(3)", "DESC", "id"],
    "PERCENT_RANK() over the quantity-ordered stage places every row on its promised scale: tiles count positions, percent-rank normalizes by (n-1), cumulative distance by n. The audit substitutes the sibling functions — each parses, each draws a different distribution, and only the pinned one answers the brief's question. That is the whole discipline of relative standing: pick the contract, then spell it."
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
]);
