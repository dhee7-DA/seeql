// Case batch N3 — Module 10 window-function cases cs-1776…
// Generated from archetype matrices (scripts/gen-m10-cases.py); every case
// mechanically audited against the seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";
import { m10Cases } from "./m10-util";

export const casesN3: CaseStudy[] = m10Cases("n3", 1776, [
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
  [
    "medium", "month-close",
    "The price neighbor, 2 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Month Close sheet wants every products row to carry the price of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the price from 2 position(s) ahead onto every row.",
    "SELECT price, price AS val,\n  {1}(price, {2}) OVER (ORDER BY price, id) AS next_price\nFROM {3}\nORDER BY price, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["products", "keyword", "the source table", "The timeline lives in products; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "3", "orders"],
    "LEAD(price, %(o)d) OVER (ORDER BY price, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "inventory",
    "LEAD peek 2",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Inventory sheet wants every products row to carry the price of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the price from 3 position(s) ahead onto every row.",
    "SELECT price, price AS val,\n  {1}(price, {2}) OVER (ORDER BY price, id) AS next_price\nFROM {3}\nORDER BY price, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["products", "keyword", "the source table", "The timeline lives in products; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "4", "suppliers"],
    "LEAD(price, %(o)d) OVER (ORDER BY price, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "expense",
    "The quantity neighbor, 1 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Expense sheet wants every order_items row to carry the quantity of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the quantity from 1 position(s) back onto every row.",
    "SELECT id, quantity AS val,\n  {1}(quantity, {2}) OVER (ORDER BY id) AS prev_quantity\nFROM {3}\nORDER BY id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["order_items", "keyword", "the source table", "The timeline lives in order_items; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "2", "orders"],
    "LAG(quantity, %(o)d) OVER (ORDER BY id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "catalog",
    "LAG peek 2",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Catalog sheet wants every order_items row to carry the quantity of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the quantity from 2 position(s) back onto every row.",
    "SELECT id, quantity AS val,\n  {1}(quantity, {2}) OVER (ORDER BY id) AS prev_quantity\nFROM {3}\nORDER BY id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["order_items", "keyword", "the source table", "The timeline lives in order_items; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "3", "suppliers"],
    "LAG(quantity, %(o)d) OVER (ORDER BY id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "pricing",
    "The quantity neighbor, 3 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Pricing sheet wants every order_items row to carry the quantity of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the quantity from 3 position(s) back onto every row.",
    "SELECT id, quantity AS val,\n  {1}(quantity, {2}) OVER (ORDER BY id) AS prev_quantity\nFROM {3}\nORDER BY id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["order_items", "keyword", "the source table", "The timeline lives in order_items; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "4", "orders"],
    "LAG(quantity, %(o)d) OVER (ORDER BY id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "supplier",
    "LEAD peek 2",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Supplier sheet wants every order_items row to carry the quantity of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the quantity from 1 position(s) ahead onto every row.",
    "SELECT id, quantity AS val,\n  {1}(quantity, {2}) OVER (ORDER BY id) AS next_quantity\nFROM {3}\nORDER BY id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["order_items", "keyword", "the source table", "The timeline lives in order_items; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "2", "suppliers"],
    "LEAD(quantity, %(o)d) OVER (ORDER BY id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "fraud",
    "The quantity neighbor, 2 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Fraud sheet wants every order_items row to carry the quantity of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the quantity from 2 position(s) ahead onto every row.",
    "SELECT id, quantity AS val,\n  {1}(quantity, {2}) OVER (ORDER BY id) AS next_quantity\nFROM {3}\nORDER BY id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["order_items", "keyword", "the source table", "The timeline lives in order_items; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "3", "orders"],
    "LEAD(quantity, %(o)d) OVER (ORDER BY id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "refund-audit",
    "LEAD peek 2",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Refund Audit sheet wants every order_items row to carry the quantity of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the quantity from 3 position(s) ahead onto every row.",
    "SELECT id, quantity AS val,\n  {1}(quantity, {2}) OVER (ORDER BY id) AS next_quantity\nFROM {3}\nORDER BY id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["order_items", "keyword", "the source table", "The timeline lives in order_items; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "4", "suppliers"],
    "LEAD(quantity, %(o)d) OVER (ORDER BY id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "funnel",
    "The rating neighbor, 1 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Funnel sheet wants every suppliers row to carry the rating of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the rating from 1 position(s) back onto every row.",
    "SELECT rating, rating AS val,\n  {1}(rating, {2}) OVER (ORDER BY rating, id) AS prev_rating\nFROM {3}\nORDER BY rating, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["suppliers", "keyword", "the source table", "The timeline lives in suppliers; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "2", "orders"],
    "LAG(rating, %(o)d) OVER (ORDER BY rating, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "growth",
    "LAG peek 3",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Growth sheet wants every suppliers row to carry the rating of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the rating from 2 position(s) back onto every row.",
    "SELECT rating, rating AS val,\n  {1}(rating, {2}) OVER (ORDER BY rating, id) AS prev_rating\nFROM {3}\nORDER BY rating, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["suppliers", "keyword", "the source table", "The timeline lives in suppliers; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "3", "products"],
    "LAG(rating, %(o)d) OVER (ORDER BY rating, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "month-close",
    "The rating neighbor, 3 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Month Close sheet wants every suppliers row to carry the rating of the row %(o)d position(s) back in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the rating from 3 position(s) back onto every row.",
    "SELECT rating, rating AS val,\n  {1}(rating, {2}) OVER (ORDER BY rating, id) AS prev_rating\nFROM {3}\nORDER BY rating, id;",
    [
      ["LAG", "keyword", "the fetch direction", "LAG reaches backwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["suppliers", "keyword", "the source table", "The timeline lives in suppliers; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LEAD", "4", "orders"],
    "LAG(rating, %(o)d) OVER (ORDER BY rating, id) transports the value from %(o)d position(s) back onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LAG for LEAD turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "easy", "inventory",
    "LEAD peek 3",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Inventory sheet wants every suppliers row to carry the rating of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the rating from 1 position(s) ahead onto every row.",
    "SELECT rating, rating AS val,\n  {1}(rating, {2}) OVER (ORDER BY rating, id) AS next_rating\nFROM {3}\nORDER BY rating, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["1", "keyword", "the offset distance", "The second argument counts positions: 1 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["suppliers", "keyword", "the source table", "The timeline lives in suppliers; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "2", "products"],
    "LEAD(rating, %(o)d) OVER (ORDER BY rating, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "medium", "expense",
    "The rating neighbor, 2 away",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Expense sheet wants every suppliers row to carry the rating of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the rating from 2 position(s) ahead onto every row.",
    "SELECT rating, rating AS val,\n  {1}(rating, {2}) OVER (ORDER BY rating, id) AS next_rating\nFROM {3}\nORDER BY rating, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["2", "keyword", "the offset distance", "The second argument counts positions: 2 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["suppliers", "keyword", "the source table", "The timeline lives in suppliers; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "3", "orders"],
    "LEAD(rating, %(o)d) OVER (ORDER BY rating, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
  ],
  [
    "hard", "catalog",
    "LEAD peek 3",
    "Offsets answer 'compared to the row before/after?' without a self-join. The Catalog sheet wants every suppliers row to carry the rating of the row %(o)d position(s) ahead in the sort; the fetch, the distance and the sequence are the blanks.",
    "Fetch the rating from 3 position(s) ahead onto every row.",
    "SELECT rating, rating AS val,\n  {1}(rating, {2}) OVER (ORDER BY rating, id) AS next_rating\nFROM {3}\nORDER BY rating, id;",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD reaches forwards in the sort; its mirror reaches the other way and the column reports the wrong neighbor."],
      ["3", "keyword", "the offset distance", "The second argument counts positions: 3 here. Offset 1 is the default; a different distance fetches a different row entirely."],
      ["suppliers", "keyword", "the source table", "The timeline lives in suppliers; any other table either lacks the columns or walks the wrong rows."],
    ],
    ["LAG", "4", "products"],
    "LEAD(rating, %(o)d) OVER (ORDER BY rating, id) transports the value from %(o)d position(s) ahead onto the current row. The edge rows stay NULL — nothing exists that far back or ahead — and that honesty is the feature, not a bug. Swapping LEAD for LAG turns the same query into the opposite timeline; the audit runs that substitution and keeps the case honest about the consequence."
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
    "easy", "expense",
    "Delta vs the rating neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Expense sheet wants the swing on suppliers.rating at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: rating at offset 1, current minus fetched.",
    "SELECT rating, rating AS val,\n  rating - {1}(rating, {2}) OVER (ORDER BY rating, id) AS swing\nFROM suppliers\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["rating, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "name"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "catalog",
    "The rating swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Catalog sheet wants the swing on suppliers.rating at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: rating at offset 2, current minus fetched.",
    "SELECT rating, rating AS val,\n  rating - {1}(rating, {2}) OVER (ORDER BY rating, id) AS swing\nFROM suppliers\nORDER BY {3};",
    [
      ["LAG", "keyword", "the fetch direction", "LAG pulls the previous row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["rating, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LEAD", "OFFSET 2", "name"],
    "LAG fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "pricing",
    "Delta vs the rating neighbor",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Pricing sheet wants the swing on suppliers.rating at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: rating at offset 1, current minus fetched.",
    "SELECT rating, rating AS val,\n  rating - {1}(rating, {2}) OVER (ORDER BY rating, id) AS swing\nFROM suppliers\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["1", "keyword", "the offset distance", "Offset 1 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["rating, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "name"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
  ],
  [
    "easy", "supplier",
    "The rating swing, offset 2",
    "'How different is this row from its neighbor?' — a delta question, one subtraction past the offset fetch. The Supplier sheet wants the swing on suppliers.rating at offset %(o)d; the fetch, the distance and the direction are the blanks.",
    "Add the swing column: rating at offset 2, current minus fetched.",
    "SELECT rating, rating AS val,\n  rating - {1}(rating, {2}) OVER (ORDER BY rating, id) AS swing\nFROM suppliers\nORDER BY {3};",
    [
      ["LEAD", "keyword", "the fetch direction", "LEAD pulls the next row's value onto this one; its mirror fetches the other side and flips every sign."],
      ["2", "keyword", "the offset distance", "Offset 2 is the pinned distance; the default 1 would compare against the adjacent row instead."],
      ["rating, id", "keyword", "the sequence", "The offset rides this order; the id tiebreak is what keeps 'previous' deterministic when values tie."],
    ],
    ["LAG", "OFFSET 2", "name"],
    "LEAD fetches the neighbor %(o)d away, the subtraction writes the swing. Mind the sign: current minus fetched looks backward, fetched minus current looks forward. The edge rows keep NULL — no predecessor exists — and a wrong direction is the audit's favorite substitution: same table, same column, opposite meaning, zero ambiguity about which one is wrong."
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
]);
