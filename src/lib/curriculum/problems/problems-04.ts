// Problem bank for Lesson 4 — NULL detection and handling.
// Existing: l4-p1 (easy), l4-p2 (medium), l4-p3 (medium). New: l4-p4..p15.

import type { QueryProblem } from "../types";

export const problems04: QueryProblem[] = [
  {
    id: "l4-p4",
    prompt: "No destination: `id` and `total_amount` for orders whose `shipping_city` is unknown.",
    tables: ["orders"],
    difficulty: "easy",
    hints: ["Unknown = IS NULL.", "23 rows."],
    solution: "SELECT id, total_amount\nFROM orders\nWHERE shipping_city IS NULL;",
  },
  {
    id: "l4-p5",
    prompt: "Silent reviews: `id` and `title` for reviews with **no body text**.",
    tables: ["reviews"],
    difficulty: "easy",
    hints: ["WHERE body IS NULL.", "13 rows."],
    solution: "SELECT id, title\nFROM reviews\nWHERE body IS NULL;",
  },
  {
    id: "l4-p6",
    prompt: "Untracked stock: `product_name` and `stock_quantity` for products whose stock is unknown.",
    tables: ["products"],
    difficulty: "easy",
    hints: ["IS NULL again — stock_quantity IS NULL.", "5 rows."],
    solution: "SELECT product_name, stock_quantity\nFROM products\nWHERE stock_quantity IS NULL;",
  },
  {
    id: "l4-p7",
    prompt: "Known totals: `id` and `total_amount` for every order that **has** a total.",
    tables: ["orders"],
    difficulty: "easy",
    hints: ["Has a value = IS NOT NULL.", "144 rows arrive — that's the point: 6 are missing."],
    solution: "SELECT id, total_amount\nFROM orders\nWHERE total_amount IS NOT NULL;",
  },
  {
    id: "l4-p8",
    prompt: "Missing-phone audit: in **one row**, `missing_phones` = number of customers without a phone. Use the count gap, not a WHERE filter.",
    tables: ["customers"],
    difficulty: "medium",
    hints: [
      "COUNT(*) counts rows; COUNT(phone) counts known phones.",
      "Their difference IS the missing count: COUNT(*) - COUNT(phone).",
      "13 is the answer.",
    ],
    solution: "SELECT COUNT(*) - COUNT(phone) AS missing_phones\nFROM customers;",
  },
  {
    id: "l4-p9",
    prompt: "Guest checkouts: `id` and `order_date` for the 7 orders with **no customer attached**.",
    tables: ["orders"],
    difficulty: "medium",
    hints: ["customer_id IS NULL — the slot is empty.", "These differ from the 6 orphan orders (wrong id) — don't mix them up."],
    solution: "SELECT id, order_date\nFROM orders\nWHERE customer_id IS NULL;",
  },
  {
    id: "l4-p10",
    prompt: "City fallback: for the first 10 orders by id, show `id` and `ship_city` — the shipping city, or the text 'UNKNOWN' when missing.",
    tables: ["orders"],
    difficulty: "hard",
    hints: ["COALESCE(shipping_city, 'UNKNOWN') returns the city, or the fallback if NULL.", "Alias AS ship_city.", "Borrow ORDER BY id LIMIT 10."],
    solution: "SELECT id, COALESCE(shipping_city, 'UNKNOWN') AS ship_city\nFROM orders\nORDER BY id\nLIMIT 10;",
    orderMatters: true,
  },
  {
    id: "l4-p11",
    prompt: "Honest average: in one row, `avg_known_total` = average of order totals **rounded to 2**. Know what it silently skips before you run it.",
    tables: ["orders"],
    difficulty: "medium",
    hints: ["AVG skips NULLs automatically — divisor is 144, not 150.", "ROUND(AVG(total_amount), 2).", "~500.28."],
    solution: "SELECT ROUND(AVG(total_amount), 2) AS avg_known_total\nFROM orders;",
  },
  {
    id: "l4-p12",
    prompt: "Rating audit: one row with `total_reviews`, `with_rating` (reviews that chose a rating), and `missing_rating` (the gap).",
    tables: ["reviews"],
    difficulty: "hard",
    hints: [
      "COUNT(*) vs COUNT(rating) — same column trio as Lesson 7 preview.",
      "SELECT COUNT(*) AS total_reviews, COUNT(rating) AS with_rating, COUNT(*) - COUNT(rating) AS missing_rating.",
      "110 / 107 / 3.",
    ],
    solution: "SELECT COUNT(*) AS total_reviews, COUNT(rating) AS with_rating, COUNT(*) - COUNT(rating) AS missing_rating\nFROM reviews;",
  },
  {
    id: "l4-p13",
    prompt: "Everything but delivered — INCLUDING unknowns: `id` and `status` for orders whose stored status is anything other than exactly 'delivered', **and also** the orders with no status at all.",
    tables: ["orders"],
    difficulty: "hard",
    hints: [
      "The trap: WHERE status != 'delivered' silently drops NULL statuses (NOT UNKNOWN is UNKNOWN).",
      "Add them back: … != 'delivered' OR status IS NULL.",
      "99 rows.",
    ],
    solution: "SELECT id, status\nFROM orders\nWHERE status != 'delivered' OR status IS NULL;",
  },
  {
    id: "l4-p14",
    prompt: "Broken baskets: `id` for orders with **either** no total **or** no customer — either kind of missing counts.",
    tables: ["orders"],
    difficulty: "hard",
    hints: [
      "Two IS NULL tests joined with OR.",
      "AND would demand both missing in the same row.",
      "13 rows here (6 + 7, no overlap).",
    ],
    solution: "SELECT id\nFROM orders\nWHERE total_amount IS NULL OR customer_id IS NULL;",
  },
  {
    id: "l4-p15",
    prompt: "Catalog health card: one row — `products` (all), `missing_price` (no price), `missing_stock` (no stock).",
    tables: ["products"],
    difficulty: "hard",
    hints: [
      "Three aggregates in one SELECT: COUNT(*), SUM(price IS NULL) or COUNT(*) - COUNT(price).",
      "COUNT(*) - COUNT(price) is the portable gap trick.",
      "32 / 1 / 5.",
    ],
    solution: "SELECT COUNT(*) AS products, COUNT(*) - COUNT(price) AS missing_price, COUNT(*) - COUNT(stock_quantity) AS missing_stock\nFROM products;",
  },
];
