import type { CaseStudy } from "./types";
import { caseStudiesB } from "./case-studies-b";
import { caseStudiesC } from "./case-studies-c";

const core: CaseStudy[] = [
  {
    id: "cs1",
    title: "Case study — The Monday morning customer report",
    subtitle: "Marketing needs numbers before the 10 AM growth meeting",
    minutes: 15,
    scenario:
      "Monday, 9:04 AM. Priya from marketing pings you: “Growth meeting at 10 — I need our customer picture. Nothing fancy, just the real numbers from the database.” She sends five asks. Everything you need is Lessons 1–8, all on the `customers` table. Answer each ask with a query — your result is auto-checked against the true numbers.",
    parts: [
      {
        id: "cs1-p1",
        prompt:
          "Ask 1 — “How many customers do we have in total?” One row, one column: `total_customers`.",
        tables: ["customers"],
        hints: ["COUNT(*) counts rows — no WHERE needed for 'all'."],
        solution: "SELECT COUNT(*) AS total_customers\nFROM customers;",
      },
      {
        id: "cs1-p2",
        prompt:
          "Ask 2 — “And how many are currently active?” Active customers have `is_active = 1`. Column name: `active_customers`.",
        tables: ["customers"],
        hints: [
          "Same COUNT(*), but filtered with WHERE is_active = 1.",
          "is_active is an INTEGER flag — compare with the number 1, no quotes.",
        ],
        solution: "SELECT COUNT(*) AS active_customers\nFROM customers\nWHERE is_active = 1;",
      },
      {
        id: "cs1-p3",
        prompt:
          "Ask 3 — “How many customers can't receive our emails?” — i.e. customers with **no email on file**. Column name: `missing_email`.",
        tables: ["customers"],
        hints: [
          "'No email' means the email is missing: IS NULL.",
          "COUNT(*) with WHERE email IS NULL.",
        ],
        solution: "SELECT COUNT(*) AS missing_email\nFROM customers\nWHERE email IS NULL;",
      },
      {
        id: "cs1-p4",
        prompt:
          "Ask 4 — “Break our customers down by loyalty tier, biggest group first.” Show `loyalty_tier` and `customers` (the count), as stored — no cleaning.",
        tables: ["customers"],
        hints: [
          "One row per tier: GROUP BY loyalty_tier with COUNT(*) AS customers.",
          "Biggest first: ORDER BY customers DESC.",
          "'bronze', 'BRONZE' and 'bronze ' will each get their own row — that's the honest-as-stored picture Priya asked for.",
        ],
        solution:
          "SELECT loyalty_tier,\n       COUNT(*) AS customers\nFROM customers\nGROUP BY loyalty_tier\nORDER BY customers DESC;",
      },
      {
        id: "cs1-p5",
        prompt:
          "Ask 5 — “Who are our 5 highest lifetime-value customers?” Show `full_name` and `lifetime_value`, biggest value first, **skipping customers with no value**, ties broken by smaller `id` first.",
        tables: ["customers"],
        hints: [
          "Skip missing values: WHERE lifetime_value IS NOT NULL.",
          "ORDER BY lifetime_value DESC, id ASC — the tiebreaker makes it reproducible.",
          "LIMIT 5.",
        ],
        solution:
          "SELECT full_name, lifetime_value\nFROM customers\nWHERE lifetime_value IS NOT NULL\nORDER BY lifetime_value DESC, id ASC\nLIMIT 5;",
        orderMatters: true,
      },
    ],
    debrief: [
      "Every ask was one query — but each used a different lesson: COUNT, IS NULL, GROUP BY, top-N with a tiebreaker.",
      "Priya's tier chart will look odd until the spelling variants ('bronze' vs 'BRONZE' vs 'bronze ') are merged — flag it, don't fix it silently.",
      "The top-LTV list has a suspicious 999999 — that's a data-entry error, not a whale. Always sanity-check the extreme values you put in front of stakeholders.",
      "Next module you'll answer her follow-up: 'how much has each customer spent?' — that needs orders joined to customers.",
    ],
  },
  {
    id: "cs2",
    title: "Case study — Catalog & pricing review",
    subtitle: "Quarter-end inventory checks on the products table",
    minutes: 12,
    scenario:
      "Quarter-end. The ops team reviews the catalog before the pricing refresh goes live. Four checks, all on the `products` table, all Lessons 1–8. The data is the same messy store as always — expect gaps and glitches, and *report* them rather than working around them.",
    parts: [
      {
        id: "cs2-p1",
        prompt:
          "Check 1 — “How many products sit in each category?” Show `category` and `products` (count), categories as stored, biggest count first.",
        tables: ["products"],
        hints: [
          "GROUP BY category with COUNT(*) AS products.",
          "ORDER BY products DESC — don't clean the category spellings for this one.",
        ],
        solution:
          "SELECT category,\n       COUNT(*) AS products\nFROM products\nGROUP BY category\nORDER BY products DESC;",
      },
      {
        id: "cs2-p2",
        prompt:
          "Check 2 — “What's our total inventory value?” One row, one column: `inventory_value` = SUM of `price * stock_quantity` across all products, rounded to 2 decimals.",
        tables: ["products"],
        hints: [
          "Build the expression inside the aggregate: SUM(price * stock_quantity).",
          "Products with a NULL price or NULL stock contribute NULL rows to the SUM — and SUM skips NULLs. Think about whether ops would agree with that choice.",
        ],
        solution:
          "SELECT ROUND(SUM(price * stock_quantity), 2) AS inventory_value\nFROM products;",
      },
      {
        id: "cs2-p3",
        prompt:
          "Check 3 — “Which products need a stock check?” List `product_name` and `stock_quantity` for products with **fewer than 10 units** — negative stock absolutely counts (that's a data bug we want on the list). Lowest stock first.",
        tables: ["products"],
        hints: [
          "WHERE stock_quantity < 10 — NULL stock can't satisfy it, so those rows drop silently.",
          "ORDER BY stock_quantity, id puts the worst offenders (negatives) on top.",
        ],
        solution:
          "SELECT product_name, stock_quantity\nFROM products\nWHERE stock_quantity < 10\nORDER BY stock_quantity, id;",
        orderMatters: true,
      },
      {
        id: "cs2-p4",
        prompt:
          "Check 4 — “Pricing can't publish these: every product with a **missing or zero** price.” Show `product_name` and `price`, ordered by id.",
        tables: ["products"],
        hints: [
          "Two kinds of broken price: IS NULL, or = 0. Combine with OR.",
          "ORDER BY id gives a stable order.",
        ],
        solution:
          "SELECT product_name, price\nFROM products\nWHERE price IS NULL OR price = 0\nORDER BY id;",
        orderMatters: true,
      },
    ],
    debrief: [
      "The category counts are inflated by spelling chaos — 'electronics', 'ELECTRONICS' and 'Electronics' are three rows. Real cleanup arrives with CASE expressions in a later module.",
      "The inventory value silently skips products with missing price or stock — worth a footnote in any report built on this number.",
      "Negative stock is impossible in reality; queries are how you *find* such impossibilities, then a data engineer fixes the pipeline that caused them.",
      "You've finished the Foundations curriculum — next stop, Module 2: Joins, where these tables start talking to each other.",
    ],
  },
];

export const caseStudies: CaseStudy[] = [...core, ...caseStudiesB, ...caseStudiesC];
