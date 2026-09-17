// Case studies cs9–cs13 for the Foundations module.

import type { CaseStudy } from "./types";

export const caseStudiesC: CaseStudy[] = [
  {
    id: "cs9",
    title: "Case study — Geography cleanup prep",
    subtitle: "26 countries. There are not 26 countries.",
    minutes: 14,
    scenario:
      "The BI team wants to launch a country filter. You know the `country` column is a graveyard of codes, full names, casings and spaces. Build the evidence pack: the true list, the variant list, and the merge targets. Lessons 1–8, single table.",
    parts: [
      {
        id: "cs9-p1",
        prompt:
          "The raw truth: count **distinct stored country values**. One row, one column: `raw_countries`.",
        tables: ["customers"],
        hints: ["COUNT(DISTINCT country).", "26 — the number that made BI cancel the filter launch."],
        solution: "SELECT COUNT(DISTINCT country) AS raw_countries\nFROM customers;",
      },
      {
        id: "cs9-p2",
        prompt:
          "The population view: `country` and `customers` per stored value, **only values with 2+ customers**, biggest first, ties A→Z.",
        tables: ["customers"],
        hints: [
          "GROUP BY country HAVING COUNT(*) >= 2.",
          "ORDER BY customers DESC, country.",
          "9 rows — Germany 5, India 4, then the 2-row club.",
        ],
        solution: "SELECT country, COUNT(*) AS customers\nFROM customers\nWHERE country IS NOT NULL\nGROUP BY country\nHAVING COUNT(*) >= 2\nORDER BY customers DESC, country;",
      },
      {
        id: "cs9-p3",
        prompt:
          "Singletons: how many stored country values appear **exactly once**? One row: `single_use_values`.",
        tables: ["customers"],
        hints: [
          "GROUP BY country HAVING COUNT(*) = 1 — wrapped in an outer count.",
          "SELECT COUNT(*) FROM (SELECT country FROM customers WHERE country IS NOT NULL GROUP BY country HAVING COUNT(*) = 1).",
          "Subqueries in FROM are new — the shape matters more than the number.",
        ],
        solution: "SELECT COUNT(*) AS single_use_values\nFROM (SELECT country FROM customers WHERE country IS NOT NULL GROUP BY country HAVING COUNT(*) = 1);",
      },
      {
        id: "cs9-p4",
        prompt:
          "The US question: `country` and `customers` counts for every stored value that **starts with 'US'** (case-insensitive), alphabetical.",
        tables: ["customers"],
        hints: [
          "LIKE 'US%' — case-insensitive in SQLite, so 'us', 'US', 'USA', 'United States'… careful: 'United States' does NOT start with 'US' (it starts with 'Un').",
          "WHERE country LIKE 'US%' GROUP BY country — see exactly which spellings the prefix catches.",
        ],
        solution: "SELECT country, COUNT(*) AS customers\nFROM customers\nWHERE country LIKE 'US%'\nGROUP BY country\nORDER BY country;",
      },
      {
        id: "cs9-p5",
        prompt:
          "Missingness check: one row — `with_country` (customers that have a country value) and `coverage_pct` = with_country × 100.0 ÷ all customers, rounded to 1. Interpret: is the mess in missing VALUES or wrong VALUES?",
        tables: ["customers"],
        hints: [
          "COUNT(country) skips NULLs; COUNT(*) counts rows.",
          "ROUND(COUNT(country) * 100.0 / COUNT(*), 1) — multiply by 100.0 before dividing (integer-division trap).",
          "The answer is 100.0 — every customer HAS a country; the chaos is in the VALUES, not the gaps. That distinction decides your cleanup strategy.",
        ],
        solution: "SELECT COUNT(country) AS with_country, ROUND(COUNT(country) * 100.0 / COUNT(*), 1) AS coverage_pct\nFROM customers;",
      },
    ],
    debrief: [
      "A launch-blocking mess became a merge map: 9 real groups plus a long singletons tail — with 100% coverage, the fix is value-merging, not backfilling.",
      "LIKE 'US%' teaches prefix behavior — 'United States' escapes it. Patterns have edges; test them.",
      "HAVING = 1 for singletons inverts the usual 'biggest first' instinct — small groups are where variants hide.",
      "With CASE expressions (later module) you'll write the actual merge; today you sized the problem.",
    ],
  },
  {
    id: "cs10",
    title: "Case study — Fulfillment scorecard",
    subtitle: "The ops dashboard says 55 delivered. You say more.",
    minutes: 15,
    scenario:
      "Ops reports “55 delivered orders”. But you've seen the status column: trailing spaces, UPPERCASE duplicates, a 'cancelld' typo, and a NULL bucket. Build the corrected scorecard on `orders`, Lessons 1–8.",
    parts: [
      {
        id: "cs10-p1",
        prompt:
          "The naive number: count orders where status **equals exactly 'delivered'**. One row: `exact_delivered`.",
        tables: ["orders"],
        hints: ["WHERE status = 'delivered'.", "55 — ops's number, reproduced."],
        solution: "SELECT COUNT(*) AS exact_delivered\nFROM orders\nWHERE status = 'delivered';",
      },
      {
        id: "cs10-p2",
        prompt:
          "The full picture: count orders that are delivered **under any stored spelling** — 'delivered', 'delivered ', 'DELIVERED', 'Delivered'. One row: `delivered_any`.",
        tables: ["orders"],
        hints: [
          "Filter first: WHERE LOWER(TRIM(status)) = 'delivered'.",
          "65 orders — 10 more than ops knew about.",
        ],
        solution: "SELECT COUNT(*) AS delivered_any\nFROM orders\nWHERE LOWER(TRIM(status)) = 'delivered';",
      },
      {
        id: "cs10-p3",
        prompt:
          "Typo hunt: `id` and `status` for orders whose status **starts with 'cancel'** (case-sensitively!) but is NOT the clean 'cancelled'. The 'cancelld' file.",
        tables: ["orders"],
        hints: [
          "LIKE is case-INSENSITIVE in SQLite — 'cancel%' would also catch 'CANCELLED' and 'Cancelled'.",
          "Use GLOB, the case-sensitive pattern matcher: status GLOB 'cancel*' AND status != 'cancelled'.",
          "Exactly 2 rows of 'cancelld' — the pipeline bug in the flesh.",
        ],
        solution: "SELECT id, status\nFROM orders\nWHERE status GLOB 'cancel*' AND status != 'cancelled';",
      },
      {
        id: "cs10-p4",
        prompt:
          "Normalized scorecard: count orders per **normalized status** (LOWER(TRIM(status))) as `status` + `order_count`, biggest first, ties A→Z — NULL bucket included.",
        tables: ["orders"],
        hints: [
          "GROUP BY LOWER(TRIM(status)) — the bucket key IS the normalization.",
          "ORDER BY order_count DESC, status.",
          "7 clean buckets now instead of 18 spellings.",
        ],
        solution: "SELECT LOWER(TRIM(status)) AS status, COUNT(*) AS order_count\nFROM orders\nGROUP BY LOWER(TRIM(status))\nORDER BY order_count DESC, status;",
      },
      {
        id: "cs10-p5",
        prompt:
          "Delivery quality: one row — `delivered` count (normalized), `avg_delivered_total` (their average total, 2 dp), `avg_all_total` (everyone's average, 2 dp).",
        tables: ["orders"],
        hints: [
          "ROUND(AVG(CASE …)) is next module — instead: two aggregates over the filtered set won't mix… so run them as one SELECT with FILTER? Not in SQLite. Correct single-row shape: SELECT COUNT(*), ROUND(AVG(total_amount), 2), (SELECT ROUND(AVG(total_amount), 2) FROM orders) — a scalar subquery. Simpler accepted answer: computed over delivered rows only for the first two, and use the known 500.28 via subselect.",
          "Scalar subqueries are preview material — the shape: (SELECT ROUND(AVG(total_amount), 2) FROM orders) AS avg_all_total.",
        ],
        solution: "SELECT COUNT(*) AS delivered, ROUND(AVG(total_amount), 2) AS avg_delivered_total, (SELECT ROUND(AVG(total_amount), 2) FROM orders) AS avg_all_total\nFROM orders\nWHERE LOWER(TRIM(status)) = 'delivered';",
      },
    ],
    debrief: [
      "55 → 65 delivered with one LOWER(TRIM) — normalization isn't cosmetics, it's revenue visibility.",
      "The 'cancelld' rows were unreachable by equality and invisible to dashboards; GLOB caught the family.",
      "Grouping by an expression is your first true cleaning query — the scorecard shrank from 18 buckets to 7.",
      "Every fix here is temporary until the pipeline is repaired — your report is the ticket, not the cure.",
    ],
  },
  {
    id: "cs11",
    title: "Case study — Margin police",
    subtitle: "Two products lose money on every sale.",
    minutes: 14,
    scenario:
      "Merchandise planning wants a margin review before the pricing refresh. `products` holds price and cost — plus one missing price and a suspicious cost>price pair. Lessons 1–8.",
    parts: [
      {
        id: "cs11-p1",
        prompt:
          "The loss-makers: `product_name`, `price`, `cost` for products where **cost exceeds price**, worst margin first (most negative (price − cost) first).",
        tables: ["products"],
        hints: [
          "WHERE cost > price.",
          "ORDER BY price - cost — ascending puts the worst (most negative) first.",
          "2 rows.",
        ],
        solution: "SELECT product_name, price, cost\nFROM products\nWHERE cost > price\nORDER BY price - cost;",
        orderMatters: true,
      },
      {
        id: "cs11-p2",
        prompt:
          "Margin league: `product_name` and `margin_pct` = (price − cost) ÷ cost × 100 rounded to 1 — **top 5 highest**, known price and cost only, ties by smaller id.",
        tables: ["products"],
        hints: [
          "WHERE price IS NOT NULL AND cost IS NOT NULL (and cost > 0 to be safe — divide-by-zero).",
          "ORDER BY margin_pct DESC, id LIMIT 5 with the expression aliased.",
        ],
        solution: "SELECT product_name, ROUND((price - cost) * 100.0 / cost, 1) AS margin_pct\nFROM products\nWHERE price IS NOT NULL AND cost IS NOT NULL AND cost > 0\nORDER BY margin_pct DESC, id\nLIMIT 5;",
        orderMatters: true,
      },
      {
        id: "cs11-p3",
        prompt:
          "Typical margin: one row — `avg_margin` = average of (price − cost) over known pairs, 2 dp.",
        tables: ["products"],
        hints: ["AVG(price - cost) skips NULL pairs automatically.", "ROUND(..., 2) — roughly 110."],
        solution: "SELECT ROUND(AVG(price - cost), 2) AS avg_margin\nFROM products\nWHERE price IS NOT NULL AND cost IS NOT NULL;",
      },
      {
        id: "cs11-p4",
        prompt:
          "Priced-but-costless: `product_name` and `price` for products with a price but **no cost recorded** — margin unknowable.",
        tables: ["products"],
        hints: ["WHERE price IS NOT NULL AND cost IS NULL.", "Beware NULL > price comparisons — they're UNKNOWN, which is exactly what you want here."],
        solution: "SELECT product_name, price\nFROM products\nWHERE price IS NOT NULL AND cost IS NULL;",
      },
      {
        id: "cs11-p5",
        prompt:
          "Margin floor: how many products earn **less than 20 margin** (price − cost < 20) among known pairs? One row: `thin_margins`.",
        tables: ["products"],
        hints: ["WHERE price IS NOT NULL AND cost IS NOT NULL AND (price - cost) < 20 — count them.", "SUM(condition) also works: SUM((price - cost) < 20) over known pairs misses nothing."],
        solution: "SELECT COUNT(*) AS thin_margins\nFROM products\nWHERE price IS NOT NULL AND cost IS NOT NULL AND (price - cost) < 20;",
      },
    ],
    debrief: [
      "Margin analysis is arithmetic + NULL hygiene — every part was WHERE/ORDER/expression practice.",
      "cost > price found the scandals; margin_pct ranked the heroes; the floor count sized the worry list.",
      "Notice how many parts needed IS NOT NULL guards — margins live and die by data completeness.",
      "When the refresh lands, rerun all five queries: before/after evidence in 30 seconds.",
    ],
  },
  {
    id: "cs12",
    title: "Case study — Growth cohort snapshot",
    subtitle: "When did our 40 shoppers actually arrive?",
    minutes: 13,
    scenario:
      "Marketing wants a cohort view of signups before planning a re-engagement campaign. `signup_date` is ISO text — and one value is impossible. Cohort = signup year. Lessons 1–8 plus one substring trick we'll hand you.",
    parts: [
      {
        id: "cs12-p1",
        prompt:
          "The envelope: one row — `earliest` and `latest` stored signup dates (as MIN/MAX — yes, the impossible date will show itself).",
        tables: ["customers"],
        hints: ["MIN(signup_date), MAX(signup_date).", "MAX returns '2024-13-45' — the impossible date is your max. Flag it."],
        solution: "SELECT MIN(signup_date) AS earliest, MAX(signup_date) AS latest\nFROM customers;",
      },
      {
        id: "cs12-p2",
        prompt:
          "Founding cohort: customers who signed up in **2023** — `id` and `signup_date`, chronological (ties by id).",
        tables: ["customers"],
        hints: ["WHERE signup_date LIKE '2023%'.", "ORDER BY signup_date, id — 37 rows; the store grew up fast."],
        solution: "SELECT id, signup_date\nFROM customers\nWHERE signup_date LIKE '2023%'\nORDER BY signup_date, id;",
        orderMatters: true,
      },
      {
        id: "cs12-p3",
        prompt:
          "Cohort census: count customers per signup **year** — bucket with `substr(signup_date, 1, 4)` as `cohort`, chronological order.",
        tables: ["customers"],
        hints: [
          "GROUP BY substr(signup_date, 1, 4) ORDER BY cohort.",
          "Two big cohorts (2023, 2024) — plus wherever the impossible date lands.",
        ],
        solution: "SELECT substr(signup_date, 1, 4) AS cohort, COUNT(*) AS customers\nFROM customers\nGROUP BY substr(signup_date, 1, 4)\nORDER BY cohort;",
        orderMatters: true,
      },
      {
        id: "cs12-p4",
        prompt:
          "Re-engagement pool: active customers (is_active = 1) whose **LTV is known and at most 500** — `full_name`, `lifetime_value`, ascending by value.",
        tables: ["customers"],
        hints: [
          "Three conditions: is_active = 1 AND lifetime_value IS NOT NULL AND lifetime_value <= 500.",
          "ORDER BY lifetime_value, id.",
        ],
        solution: "SELECT full_name, lifetime_value\nFROM customers\nWHERE is_active = 1 AND lifetime_value IS NOT NULL AND lifetime_value <= 500\nORDER BY lifetime_value, id;",
        orderMatters: true,
      },
      {
        id: "cs12-p5",
        prompt:
          "Campaign size: one row — `targets` (count from the re-engagement pool) and `pool_ltv` (their total lifetime value, 2 dp).",
        tables: ["customers"],
        hints: [
          "Same WHERE as the previous part, then COUNT(*) and ROUND(SUM(lifetime_value), 2).",
          "A campaign pitch in two numbers: how many, worth how much.",
        ],
        solution: "SELECT COUNT(*) AS targets, ROUND(SUM(lifetime_value), 2) AS pool_ltv\nFROM customers\nWHERE is_active = 1 AND lifetime_value IS NOT NULL AND lifetime_value <= 500;",
      },
    ],
    debrief: [
      "substr + GROUP BY turned a text column into cohorts — the same trick powers monthly reporting forever.",
      "The '2024-13-45' row rode MAX to the surface: envelope checks catch what dashboards hide.",
      "The campaign list is pure Foundations: filter, sort, count, sum. No magic, just discipline.",
      "When dates get proper functions (later module), these queries get shorter — the logic stays identical.",
    ],
  },
  {
    id: "cs13",
    title: "Case study — The 10 AM meeting (capstone)",
    subtitle: "Five asks, fifteen minutes, everything you've learned.",
    minutes: 20,
    scenario:
      "The founder pings: “Board pre-read in an hour. Give me the state of the store — real numbers, and flag anything that smells.” This capstone pulls from all five tables with nothing but Lessons 1–8. No hints unless you ask for them.",
    parts: [
      {
        id: "cs13-p1",
        prompt:
          "Store size: one row — `customers`, `products`, `orders` (row counts of the three tables). Three aggregates, three tables — three tiny queries or UNION tricks not needed: just run three SELECTs? No — deliver ONE row: you may use scalar subqueries: SELECT (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM orders) AS orders.",
        tables: ["customers", "products", "orders"],
        hints: [
          "Scalar subqueries in SELECT: (SELECT COUNT(*) FROM customers).",
          "One row, three named columns — the store's vital signs.",
        ],
        solution: "SELECT (SELECT COUNT(*) FROM customers) AS customers, (SELECT COUNT(*) FROM products) AS products, (SELECT COUNT(*) FROM orders) AS orders;",
      },
      {
        id: "cs13-p2",
        prompt:
          "Revenue to date: one row — `gross_revenue` (SUM of positive totals, 2 dp), `orders_counted` (rows that qualified).",
        tables: ["orders"],
        hints: ["WHERE total_amount > 0, then COUNT(*) and ROUND(SUM(total_amount), 2).", "The > 0 guard quietly excludes refunds and NULLs — state that in the slide footnote."],
        solution: "SELECT COUNT(*) AS orders_counted, ROUND(SUM(total_amount), 2) AS gross_revenue\nFROM orders\nWHERE total_amount > 0;",
      },
      {
        id: "cs13-p3",
        prompt:
          "Best sellers: `product_id` and `units` = SUM(quantity) from order_items — **top 5**, biggest first, ties by product_id. (NULL product lines will fail nothing — they group into a NULL bucket; exclude unknown products.)",
        tables: ["order_items"],
        hints: [
          "WHERE product_id IS NOT NULL, GROUP BY product_id, ORDER BY units DESC, product_id LIMIT 5.",
          "The 5-row leaderboard merch will actually read.",
        ],
        solution: "SELECT product_id, SUM(quantity) AS units\nFROM order_items\nWHERE product_id IS NOT NULL\nGROUP BY product_id\nORDER BY units DESC, product_id\nLIMIT 5;",
        orderMatters: true,
      },
      {
        id: "cs13-p4",
        prompt:
          "Trust signal: one row — `valid_reviews` (ratings 1–5), `avg_valid_rating` (2 dp). The defensible star rating.",
        tables: ["reviews"],
        hints: ["WHERE rating BETWEEN 1 AND 5, then COUNT(*) and ROUND(AVG(rating), 2).", "98 reviews, 3.49 stars — versus the raw 4.44 fantasy."],
        solution: "SELECT COUNT(*) AS valid_reviews, ROUND(AVG(rating), 2) AS avg_valid_rating\nFROM reviews\nWHERE rating BETWEEN 1 AND 5;",
      },
      {
        id: "cs13-p5",
        prompt:
          "The smell list: count the defects in one row — `null_order_totals` (orders w/o total), `orphan_999` (orders pointing at customer 999), `impossible_ratings` (rating < 1 OR > 5), `null_review_bodies`. Four SUM(condition) counts, four tables' worth of honesty.",
        tables: ["orders", "reviews"],
        hints: [
          "SUM(condition) counts matches: SUM(total_amount IS NULL) over orders; SUM(rating < 1 OR rating > 5) over reviews.",
          "Two scalar-subquery columns needed: (SELECT SUM(total_amount IS NULL) FROM orders) AS null_order_totals, (SELECT SUM(customer_id = 999) FROM orders) AS orphan_999, (SELECT SUM(rating < 1 OR rating > 5) FROM reviews) AS impossible_ratings, (SELECT SUM(body IS NULL) FROM reviews) AS null_review_bodies.",
          "One row, four defect counts — the founder's 'smells' slide, done.",
        ],
        solution: "SELECT (SELECT SUM(total_amount IS NULL) FROM orders) AS null_order_totals, (SELECT SUM(customer_id = 999) FROM orders) AS orphan_999, (SELECT SUM(rating < 1 OR rating > 5) FROM reviews) AS impossible_ratings, (SELECT SUM(body IS NULL) FROM reviews) AS null_review_bodies;",
      },
    ],
    debrief: [
      "Five asks, five queries, zero joins — Foundations really does cover the daily toolkit.",
      "You used scalar subqueries to blend tables in one row; Module 2 replaces them with joins (and explains the cost).",
      "Every number carries a footnote: positive-only revenue, valid-only ratings, known-only buyers. That's what 'trustworthy' means.",
      "You've finished the Foundations gauntlet: 240 quiz questions and 120+ live queries ago, SELECT was a stranger. Onward to Joins.",
    ],
  },
];
