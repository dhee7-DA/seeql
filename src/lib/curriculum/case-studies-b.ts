// Case studies cs3–cs8 for the Foundations module (appended to the
// original two). Every part is auto-graded against the live sandbox DB.

import type { CaseStudy } from "./types";

export const caseStudiesB: CaseStudy[] = [
  {
    id: "cs3",
    title: "Case study — Review fraud & trust audit",
    subtitle: "The ratings look great. Too great.",
    minutes: 18,
    scenario:
      "A marketplace partner wants to badge the store “4.4★ trusted seller” based on your average rating. Before that badge ships, you audit the reviews table — because you already know it hides zeros, a 99, future dates and copy-pasted spam. Six checks, all Lessons 1–8, all on `reviews`.",
    parts: [
      {
        id: "cs3-p1",
        prompt:
          "Check 1 — Baseline: one row with `total_reviews` (all reviews) and `avg_raw` (average rating, 2 dp, as stored).",
        tables: ["reviews"],
        hints: ["COUNT(*) and ROUND(AVG(rating), 2) in one SELECT."],
        solution: "SELECT COUNT(*) AS total_reviews, ROUND(AVG(rating), 2) AS avg_raw\nFROM reviews;",
      },
      {
        id: "cs3-p2",
        prompt:
          "Check 2 — The honest average: same two columns, but the average only over **valid ratings (1–5)**, as `avg_valid`.",
        tables: ["reviews"],
        hints: [
          "Filter first: WHERE rating BETWEEN 1 AND 5.",
          "AVG then skips nothing problematic — 98 valid reviews, average 3.49.",
        ],
        solution: "SELECT COUNT(*) AS valid_reviews, ROUND(AVG(rating), 2) AS avg_valid\nFROM reviews\nWHERE rating BETWEEN 1 AND 5;",
      },
      {
        id: "cs3-p3",
        prompt:
          "Check 3 — The fraud list: `id`, `rating`, `review_date` for reviews with **impossible ratings** (below 1 or above 5), lowest rating first, ties by id.",
        tables: ["reviews"],
        hints: [
          "rating < 1 OR rating > 5.",
          "ORDER BY rating, id.",
          "9 rows — including the legendary 99.",
        ],
        solution: "SELECT id, rating, review_date\nFROM reviews\nWHERE rating < 1 OR rating > 5\nORDER BY rating, id;",
        orderMatters: true,
      },
      {
        id: "cs3-p4",
        prompt:
          "Check 4 — Copy-paste spam: how many reviews have a body containing 'GREAT PRODUCT'? One row, one column: `spam_count`.",
        tables: ["reviews"],
        hints: ["body LIKE '%GREAT PRODUCT%'.", "3 rows of pure enthusiasm."],
        solution: "SELECT COUNT(*) AS spam_count\nFROM reviews\nWHERE body LIKE '%GREAT PRODUCT%';",
      },
      {
        id: "cs3-p5",
        prompt:
          "Check 5 — The missing voice: reviews with **no rating at all** — show `id` and `title`. These never counted in any average.",
        tables: ["reviews"],
        hints: ["rating IS NULL — the dedicated emptiness test.", "3 rows."],
        solution: "SELECT id, title\nFROM reviews\nWHERE rating IS NULL;",
      },
      {
        id: "cs3-p6",
        prompt:
          "Check 6 — Distribution: count reviews per stored `rating` value, ordered by rating ascending (NULL row included as an empty rating cell).",
        tables: ["reviews"],
        hints: [
          "GROUP BY rating ORDER BY rating.",
          "The distribution is the receipt: 29 fives, 8 ones, 3 zeros, one 99, one NULL bucket…",
        ],
        solution: "SELECT rating, COUNT(*) AS reviews\nFROM reviews\nGROUP BY rating\nORDER BY rating;",
      },
    ],
    debrief: [
      "Raw 4.44★ vs valid 3.49★ — a full star of difference manufactured by one 99, some 7s and three zeros.",
      "Every check was single-table SQL you already know: BETWEEN, IS NULL, LIKE, GROUP BY.",
      "The badge request isn't wrong — it's built on an unexamined average. Your audit is the deliverable.",
      "Detection queries like these run nightly in real pipelines; you just wrote three of them.",
    ],
  },
  {
    id: "cs4",
    title: "Case study — Orphan order triage",
    subtitle: "Finance can't reconcile 13 orders. Trace them.",
    minutes: 15,
    scenario:
      "Month-end close: finance found orders that don't balance against any customer account. Your job: pull the exact defect lists so the data team can fix the pipeline. Two defect classes exist — orders with NO customer attached, and orders pointing at a customer id that doesn't exist. All on `orders`, Lessons 1–8.",
    parts: [
      {
        id: "cs4-p1",
        prompt:
          "Class A — Guest/unknown: `id`, `order_date`, `total_amount` for orders whose `customer_id` is **missing entirely**.",
        tables: ["orders"],
        hints: ["customer_id IS NULL.", "7 rows."],
        solution: "SELECT id, order_date, total_amount\nFROM orders\nWHERE customer_id IS NULL;",
      },
      {
        id: "cs4-p2",
        prompt:
          "Class B — The 999 file: `id`, `order_date`, `total_amount` for orders pointing at **customer 999** — an id that exists in no customer record.",
        tables: ["orders"],
        hints: ["WHERE customer_id = 999 — a plain equality on the broken value.", "1 row."],
        solution: "SELECT id, order_date, total_amount\nFROM orders\nWHERE customer_id = 999;",
      },
      {
        id: "cs4-p3",
        prompt:
          "Either-way broken: `id` for orders with **either** a missing customer_id **or** customer_id 999. One list for the data team's ticket.",
        tables: ["orders"],
        hints: ["Two conditions, OR.", "8 rows total (7 + 1, no overlap)."],
        solution: "SELECT id\nFROM orders\nWHERE customer_id IS NULL OR customer_id = 999;",
      },
      {
        id: "cs4-p4",
        prompt:
          "Exposure estimate: one row — `broken_orders` (count from Check 3 style conditions), `value_at_risk` = their SUM of total_amount (2 dp, NULLs skip).",
        tables: ["orders"],
        hints: [
          "WHERE customer_id IS NULL OR customer_id = 999, then COUNT(*) and ROUND(SUM(total_amount), 2).",
          "Aggregates over a filtered subset — the Lesson 7 + 3 combo.",
        ],
        solution: "SELECT COUNT(*) AS broken_orders, ROUND(SUM(total_amount), 2) AS value_at_risk\nFROM orders\nWHERE customer_id IS NULL OR customer_id = 999;",
      },
      {
        id: "cs4-p5",
        prompt:
          "Health score: one row — `all_orders`, `with_customer` (orders with a non-null customer_id), `pct_linked` = with_customer × 100.0 ÷ all_orders rounded to 1.",
        tables: ["orders"],
        hints: [
          "COUNT(*), COUNT(customer_id), then the percentage expression with ROUND(..., 1).",
          "Integer division warning: multiply by 100.0 BEFORE dividing, or the percentage truncates.",
        ],
        solution: "SELECT COUNT(*) AS all_orders, COUNT(customer_id) AS with_customer, ROUND(COUNT(customer_id) * 100.0 / COUNT(*), 1) AS pct_linked\nFROM orders;",
      },
    ],
    debrief: [
      "NULL and orphan are different diseases: one is absence, the other is a lie. Both break reconciliation.",
      "The percentage trick (× 100.0 before ÷) dodges SQLite's integer division — a bug you now recognize on sight.",
      "96% linkage sounds healthy until you count the 8 orders finance can't match — absolute counts tell the operational story.",
      "Module 2 (Joins) is where orphan detection becomes a one-liner with LEFT JOIN … IS NULL.",
    ],
  },
  {
    id: "cs5",
    title: "Case study — The discount column disaster",
    subtitle: "Two teams, two scales, one column.",
    minutes: 16,
    scenario:
      "Pricing swears discounts are stored as fractions (0.15 = 15%). The mobile team swears they're whole numbers (15 = 15%). They're both right, and that's the problem. Audit `order_items.discount` and quantify the damage before the teams meet.",
    parts: [
      {
        id: "cs5-p1",
        prompt:
          "The lineup: every **distinct discount value** stored, ascending (NULL included as one empty row).",
        tables: ["order_items"],
        hints: ["SELECT DISTINCT discount … ORDER BY discount.", "49 rows — the visual that ends the argument."],
        solution: "SELECT DISTINCT discount\nFROM order_items\nORDER BY discount;",
      },
      {
        id: "cs5-p2",
        prompt:
          "Team fraction: count lines where discount is a **fraction between 0 and 1** — one row, one column: `fraction_scale`.",
        tables: ["order_items"],
        hints: ["BETWEEN 0 AND 1 — inclusive, so plain 0 counts as fraction-scale.", "92 rows."],
        solution: "SELECT COUNT(*) AS fraction_scale\nFROM order_items\nWHERE discount BETWEEN 0 AND 1;",
      },
      {
        id: "cs5-p3",
        prompt:
          "Team whole-number: count lines with **discount >= 1** — the percent-scale camp. One row: `percent_scale`.",
        tables: ["order_items"],
        hints: ["WHERE discount >= 1.", "53 rows, including the absurd 120s."],
        solution: "SELECT COUNT(*) AS percent_scale\nFROM order_items\nWHERE discount >= 1;",
      },
      {
        id: "cs5-p4",
        prompt:
          "The unrecorded: how many lines have **no discount value at all**? One row: `null_discounts`.",
        tables: ["order_items"],
        hints: ["COUNT(*) - COUNT(discount) — the gap trick.", "183 lines: the majority never recorded a discount."],
        solution: "SELECT COUNT(*) - COUNT(discount) AS null_discounts\nFROM order_items;",
      },
      {
        id: "cs5-p5",
        prompt:
          "Damage report: one row — `total_lines`, `fraction_scale`, `percent_scale`, `null_discounts`. The four numbers pricing and mobile will stare at in silence.",
        tables: ["order_items"],
        hints: [
          "COUNT(*) plus the three counts from Checks 2–4, all in one SELECT.",
          "SUM(CASE WHEN …) isn't needed — SUM(discount BETWEEN 0 AND 1) works in SQLite (1 per matching row). Prefer COUNT with WHERE? That needs one scan per count — but a single SELECT can't re-filter per column. Simplest correct form: SELECT COUNT(*), SUM(discount BETWEEN 0 AND 1), SUM(discount >= 1), COUNT(*) - COUNT(discount).",
        ],
        solution: "SELECT COUNT(*) AS total_lines, SUM(discount BETWEEN 0 AND 1) AS fraction_scale, SUM(discount >= 1) AS percent_scale, COUNT(*) - COUNT(discount) AS null_discounts\nFROM order_items;",
      },
    ],
    debrief: [
      "49 distinct values where 2 conventions should exist — DISTINCT is the fastest conflict-resolver you own.",
      "The >= 1 test quietly catches NULL-free rows only because NULL fails comparisons — Lesson 4 paying rent.",
      "Neither team was wrong about their own rows; they were wrong about the column. Shared definitions need audits like this.",
      "The SUM(condition) trick counts matching rows in one pass — a SQLite specialty worth remembering.",
    ],
  },
  {
    id: "cs6",
    title: "Case study — Money outliers before the board meeting",
    subtitle: "One negative total can derail a slide.",
    minutes: 14,
    scenario:
      "The CFO deck claims “average order 500.28”. You have 20 minutes to stress-test the money column: negatives, NULLs, one absurd maximum. All on `orders.total_amount`, Lessons 1–8.",
    parts: [
      {
        id: "cs6-p1",
        prompt:
          "The extremes: one row with `min_total` and `max_total` of order totals.",
        tables: ["orders"],
        hints: ["MIN(total_amount), MAX(total_amount) in one SELECT.", "-155.11 and 9999.99 — both need explanations."],
        solution: "SELECT MIN(total_amount) AS min_total, MAX(total_amount) AS max_total\nFROM orders;",
      },
      {
        id: "cs6-p2",
        prompt:
          "The refunds/negatives: `id`, `order_date`, `total_amount` for orders with **negative totals**, lowest first.",
        tables: ["orders"],
        hints: ["WHERE total_amount < 0.", "NULLs fail the test and stay out — fine, this list is for known negatives.", "ORDER BY total_amount."],
        solution: "SELECT id, order_date, total_amount\nFROM orders\nWHERE total_amount < 0\nORDER BY total_amount;",
        orderMatters: true,
      },
      {
        id: "cs6-p3",
        prompt:
          "The suspicious maximum: `id`, `order_date`, `total_amount` for orders **above 5000**.",
        tables: ["orders"],
        hints: ["WHERE total_amount > 5000.", "One row — the 9999.99 order. Who buys that quietly?"],
        solution: "SELECT id, order_date, total_amount\nFROM orders\nWHERE total_amount > 5000;",
      },
      {
        id: "cs6-p4",
        prompt:
          "Defensible average: one row — `avg_positive` = average total over **positive totals only**, 2 dp. The number that should go on the slide.",
        tables: ["orders"],
        hints: [
          "WHERE total_amount > 0, then ROUND(AVG(total_amount), 2).",
          "This excludes negatives, NULLs, and the 9999.99 — the honest middle of the book.",
        ],
        solution: "SELECT ROUND(AVG(total_amount), 2) AS avg_positive\nFROM orders\nWHERE total_amount > 0;",
      },
      {
        id: "cs6-p5",
        prompt:
          "Data-loss note: one row — `all_orders`, `null_totals` (orders with no total at all). Finance must know what the average never saw.",
        tables: ["orders"],
        hints: ["COUNT(*) and the gap: COUNT(*) - COUNT(total_amount).", "150 and 6."],
        solution: "SELECT COUNT(*) AS all_orders, COUNT(*) - COUNT(total_amount) AS null_totals\nFROM orders;",
      },
    ],
    debrief: [
      "Three numbers defended the deck: minimum (negative refunds), maximum (one absurd order), and the NULL count.",
      "Averages are summaries of choices — 'average of positive totals' is a different, defensible metric.",
      "Outlier handling is a communication skill: state the filter, show the count you excluded.",
      "MIN/MAX take seconds and routinely save meetings. Run them before anyone else does.",
    ],
  },
  {
    id: "cs7",
    title: "Case study — Stockroom risk sweep",
    subtitle: "Negative stock is a story, not a number.",
    minutes: 13,
    scenario:
      "Ops does a physical count next week. Before they walk the aisles, produce the risk lists from `products`: impossible stock, near-zero stock, unknown stock, and the shelf-value at stake. Lessons 1–8, one table.",
    parts: [
      {
        id: "cs7-p1",
        prompt:
          "Impossible inventory: `product_name` and `stock_quantity` for products with **negative stock** — worst first.",
        tables: ["products"],
        hints: ["WHERE stock_quantity < 0.", "One product at -3 — you can't sell what doesn't exist."],
        solution: "SELECT product_name, stock_quantity\nFROM products\nWHERE stock_quantity < 0\nORDER BY stock_quantity;",
        orderMatters: true,
      },
      {
        id: "cs7-p2",
        prompt:
          "Shelf-out risk: `product_name` and `stock_quantity` for products with stock **below 10 but not negative** (0–9), lowest first.",
        tables: ["products"],
        hints: [
          "Two conditions: stock_quantity >= 0 AND stock_quantity < 10.",
          "BETWEEN 0 AND 9 is the tidy equivalent (integers!).",
        ],
        solution: "SELECT product_name, stock_quantity\nFROM products\nWHERE stock_quantity BETWEEN 0 AND 9\nORDER BY stock_quantity, id;",
        orderMatters: true,
      },
      {
        id: "cs7-p3",
        prompt:
          "The uncounted: `product_name` for products with **no stock figure at all** — ops must hand-count these.",
        tables: ["products"],
        hints: ["stock_quantity IS NULL.", "5 products go on the manual-count clipboard."],
        solution: "SELECT product_name\nFROM products\nWHERE stock_quantity IS NULL;",
      },
      {
        id: "cs7-p4",
        prompt:
          "Value at stake: one row — `inventory_value` = SUM(price × stock) over products with **known price and positive-or-zero stock**, 2 dp.",
        tables: ["products"],
        hints: [
          "WHERE price IS NOT NULL AND stock_quantity >= 0.",
          "Then ROUND(SUM(price * stock_quantity), 2).",
          "NULL rows fail the filter and never reach the sum — say so in the report.",
        ],
        solution: "SELECT ROUND(SUM(price * stock_quantity), 2) AS inventory_value\nFROM products\nWHERE price IS NOT NULL AND stock_quantity >= 0;",
      },
      {
        id: "cs7-p5",
        prompt:
          "Risk scoreboard: one row — `negative_stock` count, `low_stock` (0–9) count, `unknown_stock` (NULL) count.",
        tables: ["products"],
        hints: [
          "Three filtered counts in one SELECT: SUM(condition) counts matches in SQLite.",
          "SUM(stock_quantity < 0), SUM(stock_quantity BETWEEN 0 AND 9), SUM(stock_quantity IS NULL).",
          "1 / 1 / 5.",
        ],
        solution: "SELECT SUM(stock_quantity < 0) AS negative_stock, SUM(stock_quantity BETWEEN 0 AND 9) AS low_stock, SUM(stock_quantity IS NULL) AS unknown_stock\nFROM products;",
      },
    ],
    debrief: [
      "Three risk classes, three different owners: negative = pipeline bug, low = purchasing decision, NULL = process gap.",
      "The BETWEEN 0 AND 9 framing is exact for integers — and reads like the ops rule it encodes.",
      "Filtered SUMs and SUM(condition) give you a scoreboard in one query — no spreadsheets harmed.",
      "Next module these checks get proper names: LEFT JOIN and IS NULL comparisons across tables.",
    ],
  },
  {
    id: "cs8",
    title: "Case study — Contact hygiene for the CRM migration",
    subtitle: "You can't email 'not-an-email'.",
    minutes: 15,
    scenario:
      "The CRM vendor imports customers next week. Marketing wants a contact-quality report: what's missing, what's malformed, what duplicates. All on `customers` — email and phone are the battleground. Lessons 1–8.",
    parts: [
      {
        id: "cs8-p1",
        prompt:
          "The unreachable: `id` and `full_name` for customers with **no email**.",
        tables: ["customers"],
        hints: ["email IS NULL.", "3 rows — small but they anchor the report."],
        solution: "SELECT id, full_name\nFROM customers\nWHERE email IS NULL;",
      },
      {
        id: "cs8-p2",
        prompt:
          "The malformed: `id`, `full_name`, `email` for customers whose email does **not contain an @**.",
        tables: ["customers"],
        hints: [
          "WHERE email IS NOT NULL AND email NOT LIKE '%@%'.",
          "The IS NOT NULL guard matters: NULLs fail NOT LIKE too (UNKNOWN) — but conceptually 'no email' is a separate list from Check 1; keeping them out avoids double-counting.",
          "One row: the legendary 'not-an-email'.",
        ],
        solution: "SELECT id, full_name, email\nFROM customers\nWHERE email IS NOT NULL AND email NOT LIKE '%@%';",
      },
      {
        id: "cs8-p3",
        prompt:
          "The UPPERCASE crew: `email` values stored **entirely in uppercase** — pattern-match them. Show `id` and `email`.",
        tables: ["customers"],
        hints: [
          "LIKE is case-INSENSITIVE in SQLite, so '%@EXAMPLE.COM' matches lowercase too — useless here.",
          "You need case sensitivity: use GLOB — email GLOB '*[A-Z]*@*' won't isolate all-caps exactly; simpler analyst shortcut: WHERE email = UPPER(email) AND email LIKE '%@%'.",
          "2 rows.",
        ],
        solution: "SELECT id, email\nFROM customers\nWHERE email = UPPER(email) AND email LIKE '%@%';",
      },
      {
        id: "cs8-p4",
        prompt:
          "Phone silence: one row — `customers`, `with_phone`, `missing_phone`. The coverage number marketing signs off on.",
        tables: ["customers"],
        hints: ["COUNT(*), COUNT(phone), COUNT(*) - COUNT(phone).", "40 / 27 / 13."],
        solution: "SELECT COUNT(*) AS customers, COUNT(phone) AS with_phone, COUNT(*) - COUNT(phone) AS missing_phone\nFROM customers;",
      },
      {
        id: "cs8-p5",
        prompt:
          "Format zoo: how many **distinct phone formats** are we storing? One row: `phone_formats` = COUNT(DISTINCT phone) — knowing it's nonzero chaos is the point.",
        tables: ["customers"],
        hints: ["COUNT(DISTINCT phone) skips NULLs and counts stored variants.", "27 formats for 27 phone numbers — perfect uniqueness, terrible consistency."],
        solution: "SELECT COUNT(DISTINCT phone) AS phone_formats\nFROM customers;",
      },
      {
        id: "cs8-p6",
        prompt:
          "Duplicate radar: which email values (lowercased, trimmed) appear **more than once**? Show `email_norm` and `copies`, biggest copies first.",
        tables: ["customers"],
        hints: [
          "Normalize in the key: GROUP BY LOWER(TRIM(email)) HAVING COUNT(*) > 1.",
          "SELECT LOWER(TRIM(email)) AS email_norm, COUNT(*) AS copies …",
          "2 duplicate groups — the seed of a merge list.",
        ],
        solution: "SELECT LOWER(TRIM(email)) AS email_norm, COUNT(*) AS copies\nFROM customers\nWHERE email IS NOT NULL\nGROUP BY LOWER(TRIM(email))\nHAVING COUNT(*) > 1\nORDER BY copies DESC, email_norm;",
      },
    ],
    debrief: [
      "Missing, malformed, inconsistent, duplicated — four defect classes, four queries, one migration gate.",
      "GLOB vs LIKE: SQLite's case-insensitive LIKE forced the UPPER(email) equality trick. Know your engine's defaults.",
      "Normalization before counting (LOWER/TRIM in GROUP BY) is cleaning-lite — full cleaning arrives with CASE and UPDATE.",
      "The CRM import will thank you: every query here maps to a validation rule in the import config.",
    ],
  },
];
