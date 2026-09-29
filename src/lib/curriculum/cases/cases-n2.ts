// Case batch N2 — Module 10 window-function cases cs-1726…
// Generated from archetype matrices (scripts/gen-m10-cases.py); every case
// mechanically audited against the seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";
import { m10Cases } from "./m10-util";

export const casesN2: CaseStudy[] = m10Cases("n2", 1726, [
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
    "easy", "supplier",
    "Podium in the supplier_id, heat 2",
    "The Supplier review needs standings: every products row ranked inside its own supplier_id stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its supplier_id stage by price ASC.",
    "SELECT supplier_id, price,\n  {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}) AS rk\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "RANK numbers every row inside its supplier_id stage by price ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "expense",
    "The category ladder",
    "The Expense review needs standings: every products row ranked inside its own category stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its category stage by price DESC.",
    "SELECT category, price,\n  {1}() OVER (PARTITION BY category ORDER BY price {2}) AS rk\nFROM products\nORDER BY category, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "ROW_NUMBER numbers every row inside its category stage by price DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "growth",
    "Podium in the supplier_id, heat 2",
    "The Growth review needs standings: every products row ranked inside its own supplier_id stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its supplier_id stage by price DESC.",
    "SELECT supplier_id, price,\n  {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}) AS rk\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "ROW_NUMBER numbers every row inside its supplier_id stage by price DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "fraud",
    "The category ladder",
    "The Fraud review needs standings: every products row ranked inside its own category stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its category stage by price ASC.",
    "SELECT category, price,\n  {1}() OVER (PARTITION BY category ORDER BY price {2}) AS rk\nFROM products\nORDER BY category, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "ROW_NUMBER numbers every row inside its category stage by price ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "catalog",
    "Podium in the supplier_id, heat 2",
    "The Catalog review needs standings: every products row ranked inside its own supplier_id stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its supplier_id stage by price ASC.",
    "SELECT supplier_id, price,\n  {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}) AS rk\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "ROW_NUMBER numbers every row inside its supplier_id stage by price ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "month-close",
    "The category ladder",
    "The Month Close review needs standings: every products row ranked inside its own category stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its category stage by price DESC.",
    "SELECT category, price,\n  {1}() OVER (PARTITION BY category ORDER BY price {2}) AS rk\nFROM products\nORDER BY category, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "DENSE_RANK numbers every row inside its category stage by price DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "refund-audit",
    "Podium in the supplier_id, heat 2",
    "The Refund Audit review needs standings: every products row ranked inside its own supplier_id stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its supplier_id stage by price DESC.",
    "SELECT supplier_id, price,\n  {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}) AS rk\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "ASC", "val"],
    "DENSE_RANK numbers every row inside its supplier_id stage by price DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "pricing",
    "The category ladder",
    "The Pricing review needs standings: every products row ranked inside its own category stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its category stage by price ASC.",
    "SELECT category, price,\n  {1}() OVER (PARTITION BY category ORDER BY price {2}) AS rk\nFROM products\nORDER BY category, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "DENSE_RANK numbers every row inside its category stage by price ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "inventory",
    "Podium in the supplier_id, heat 2",
    "The Inventory review needs standings: every products row ranked inside its own supplier_id stage by price, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its supplier_id stage by price ASC.",
    "SELECT supplier_id, price,\n  {1}() OVER (PARTITION BY supplier_id ORDER BY price {2}) AS rk\nFROM products\nORDER BY supplier_id, {3};",
    [
      ["DENSE_RANK", "keyword", "the ranker", "DENSE_RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["NTILE(4)", "DESC", "val"],
    "DENSE_RANK numbers every row inside its supplier_id stage by price ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "funnel",
    "The order_id ladder",
    "The Funnel review needs standings: every order_items row ranked inside its own order_id stage by quantity, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its order_id stage by quantity DESC.",
    "SELECT order_id, quantity,\n  {1}() OVER (PARTITION BY order_id ORDER BY quantity {2}) AS rk\nFROM order_items\nORDER BY order_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["ROW_NUMBER", "ASC", "val"],
    "RANK numbers every row inside its order_id stage by quantity DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "supplier",
    "Podium in the product_id, heat 2",
    "The Supplier review needs standings: every order_items row ranked inside its own product_id stage by quantity, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its product_id stage by quantity DESC.",
    "SELECT product_id, quantity,\n  {1}() OVER (PARTITION BY product_id ORDER BY quantity {2}) AS rk\nFROM order_items\nORDER BY product_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["DENSE_RANK", "ASC", "val"],
    "RANK numbers every row inside its product_id stage by quantity DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "expense",
    "The order_id ladder",
    "The Expense review needs standings: every order_items row ranked inside its own order_id stage by quantity, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its order_id stage by quantity ASC.",
    "SELECT order_id, quantity,\n  {1}() OVER (PARTITION BY order_id ORDER BY quantity {2}) AS rk\nFROM order_items\nORDER BY order_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["ROW_NUMBER", "DESC", "val"],
    "RANK numbers every row inside its order_id stage by quantity ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "growth",
    "Podium in the product_id, heat 3",
    "The Growth review needs standings: every order_items row ranked inside its own product_id stage by quantity, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its product_id stage by quantity ASC.",
    "SELECT product_id, quantity,\n  {1}() OVER (PARTITION BY product_id ORDER BY quantity {2}) AS rk\nFROM order_items\nORDER BY product_id, {3};",
    [
      ["RANK", "keyword", "the ranker", "RANK writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["ASC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["DENSE_RANK", "DESC", "val"],
    "RANK numbers every row inside its product_id stage by quantity ASC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "fraud",
    "The order_id ladder",
    "The Fraud review needs standings: every order_items row ranked inside its own order_id stage by quantity, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its order_id stage by quantity DESC.",
    "SELECT order_id, quantity,\n  {1}() OVER (PARTITION BY order_id ORDER BY quantity {2}) AS rk\nFROM order_items\nORDER BY order_id, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["RANK", "ASC", "val"],
    "ROW_NUMBER numbers every row inside its order_id stage by quantity DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
  ],
  [
    "easy", "catalog",
    "Podium in the product_id, heat 3",
    "The Catalog review needs standings: every order_items row ranked inside its own product_id stage by quantity, ties handled per the pinned contract. The rank column is drafted; the function and its ordering are the blanks.",
    "Rank every row within its product_id stage by quantity DESC.",
    "SELECT product_id, quantity,\n  {1}() OVER (PARTITION BY product_id ORDER BY quantity {2}) AS rk\nFROM order_items\nORDER BY product_id, {3};",
    [
      ["ROW_NUMBER", "keyword", "the ranker", "ROW_NUMBER writes the standings with its own tie contract — skip, pack, or arbitrary; the sibling rankers execute and number ties differently."],
      ["DESC", "keyword", "the direction", "DESC crowns the biggest, ASC the smallest — the direction decides who leads every stage."],
      ["rk", "keyword", "the display order", "Presenting by the rank column reads the league top-down; sorting by anything else buries the podium."],
    ],
    ["DENSE_RANK", "ASC", "val"],
    "ROW_NUMBER numbers every row inside its product_id stage by quantity DESC — and the three rankers differ exactly where ties appear: RANK skips, DENSE_RANK packs, ROW_NUMBER breaks arbitrarily unless a tiebreaker is pinned. The audit probes each sibling in this slot; the correct one is the contract the brief names, and every row survives the annotation untouched."
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
  [
    "easy", "pricing",
    "Delta vs the price neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Pricing sheet wants the swing on products.price at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: price at offset 1, current minus fetched.",
    "SELECT price, price AS val,\n  price - {1}(price, {2}) OVER (ORDER BY price, id) AS swing\nFROM products\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["price, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "stock"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "supplier",
    "The price swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Supplier sheet wants the swing on products.price at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: price at offset 2, current minus fetched.",
    "SELECT price, price AS val,\n  price - {1}(price, {2}) OVER (ORDER BY price, id) AS swing\nFROM products\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["price, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "stock"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "fraud",
    "Delta vs the price neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Fraud sheet wants the swing on products.price at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: price at offset 1, current minus fetched.",
    "SELECT price, price AS val,\n  price - {1}(price, {2}) OVER (ORDER BY price, id) AS swing\nFROM products\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["price, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "stock"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "refund-audit",
    "The price swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Refund Audit sheet wants the swing on products.price at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: price at offset 2, current minus fetched.",
    "SELECT price, price AS val,\n  price - {1}(price, {2}) OVER (ORDER BY price, id) AS swing\nFROM products\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["price, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "stock"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "funnel",
    "Delta vs the quantity neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Funnel sheet wants the swing on order_items.quantity at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: quantity at offset 1, current minus fetched.",
    "SELECT id, quantity AS val,\n  quantity - {1}(quantity, {2}) OVER (ORDER BY id) AS swing\nFROM order_items\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "quantity"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "growth",
    "The quantity swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Growth sheet wants the swing on order_items.quantity at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: quantity at offset 2, current minus fetched.",
    "SELECT id, quantity AS val,\n  quantity - {1}(quantity, {2}) OVER (ORDER BY id) AS swing\nFROM order_items\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "quantity"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "month-close",
    "Delta vs the quantity neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Month Close sheet wants the swing on order_items.quantity at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: quantity at offset 1, current minus fetched.",
    "SELECT id, quantity AS val,\n  quantity - {1}(quantity, {2}) OVER (ORDER BY id) AS swing\nFROM order_items\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "quantity"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "inventory",
    "The quantity swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Inventory sheet wants the swing on order_items.quantity at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: quantity at offset 2, current minus fetched.",
    "SELECT id, quantity AS val,\n  quantity - {1}(quantity, {2}) OVER (ORDER BY id) AS swing\nFROM order_items\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "quantity"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
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
]);
