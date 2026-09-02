import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson38: Lesson = {
  id: "lesson-38",
  num: 38,
  title: "Case study — the VIP shortlist",
  blurb: "Module 4's shapes under one brief: staged spends, per-row probes, status veterans and a readable pipeline",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "Marketing wants a **VIP shortlist**, and the naive query dies on contact: *'customers whose spending beats average'* — average of WHAT? The average ORDER is 338.19; the average CUSTOMER's lifetime spend is 2,177.08. Those are different bars over different units, and only one of them defines a VIP. This is Module 4's territory: when a question has two levels (rows vs. summaries of rows, customers vs. summaries of customers), you answer it in stages — a subquery, a derived table, a CTE — and each stage is a query you can run alone.",
    },
    {
      kind: "bullets",
      items: [
        "**The bar** — five of the sixteen customers outspend the 2,177.08 average lifetime spend. Alice Chen (7,262.35), Emma Wilson (6,640.56) and Grace Kim (4,574.23) lead it.",
        "**Above the household bar** — 45 orders beat their OWN customer's average (the correlated probe); only 42 beat the storewide one. Same data, different baselines.",
        "**Pending right now** — 8 customers hold at least one pending order; EXISTS finds them NULL-safe.",
        "**Status veterans** — three customers have experienced all four statuses: Alice, Emma, Maya.",
      ],
    },
    {
      kind: "warn",
      text: "The classic VIP-list bug: `WHERE SUM(o.total) > AVG(o.total)` in one level — aggregates can't compare against aggregates in a single SELECT. The average customer spend needs the per-customer spends STAGED first (derived table or CTE), then compared.",
    },
    {
      kind: "tip",
      text: "Name your stages like you'd name variables: `spends`, then `vips`. A CTE chain reads top-down as a recipe — stage, stage, final SELECT — which is why it survives code review when the same query nested three deep does not.",
    },
  ],
  mcqs: [
    {
      id: "l38-q1",
      prompt: "'Customers whose spending beats average' — why can't one flat query compute the average customer spend inline?",
      choices: [
        "It can — AVG works anywhere",
        "The bar is an aggregate of aggregates (average of per-customer SUMs) — one SELECT level can't nest them; stage the spends first",
        "AVG fails on money columns",
        "It would need DISTINCT",
      ],
      answer: 1,
      why: "The VIP bar is 34,833.28 spread over 16 customers — an average of per-customer totals, not of 103 order rows. You stage per-customer spends in a derived table/CTE, then compare each row of the stage against the stage's own average.",
      notes: [
        { choice: 0, why: "AVG(total) over orders computes 338.19 — the average ORDER, a different bar over different units. Five customers clear 2,177.08; a very different set clears per-order bars." },
      ],
    },
    {
      id: "l38-q2",
      prompt: "For 'customers holding a pending order', EXISTS and IN (SELECT …) return the same 8 names here. When does the choice actually matter?",
      choices: [
        "Never — they're aliases",
        "When the probed column can hold NULL: NOT IN dies on one NULL, NOT EXISTS probes row-existence and stays NULL-safe",
        "EXISTS only works on indexed columns",
        "IN is always faster, so it always wins",
      ],
      answer: 1,
      why: "This schema's customer_id is NOT NULL, so both spellings agree today. The discipline: on nullable columns (or untrusted data), EXISTS is the probe that can't be poisoned.",
      notes: [
        { choice: 3, why: "Performance flips back and forth across engines and data shapes — the durable difference is the NULL semantics, and that's what you choose on." },
      ],
    },
    {
      id: "l38-q3",
      prompt: "`HAVING COUNT(DISTINCT o.status) = 4` finds the status veterans. What does the DISTINCT change, concretely?",
      choices: [
        "Nothing — COUNT is COUNT",
        "It counts DIFFERENT status values: 4 distinct means every status occurred at least once — COUNT(o.status) = 4 would pass a customer with four delivered orders",
        "It sorts the statuses before counting",
        "It removes duplicate customers",
      ],
      answer: 1,
      why: "Alice owns 24 orders but only COUNT(DISTINCT status) tests breadth of experience: delivered, shipped, pending AND cancelled each at least once. Three customers pass — Alice, Emma, Maya.",
      notes: [
        { choice: 0, why: "The gap is real: any customer with four orders of the same status would flunk the DISTINCT test while passing the bare one. Breadth ≠ volume." },
      ],
    },
    {
      id: "l38-q4",
      prompt: "In the CTE chain `WITH spends AS (…), vips AS (SELECT * FROM spends WHERE …) SELECT … FROM vips` — what does the final SELECT read from?",
      choices: [
        "The orders table directly",
        "The `vips` stage — the CTEs are named, runnable steps and the final query consumes the last one",
        "Both tables, via an implicit join",
        "A materialized view that must exist first",
      ],
      answer: 1,
      why: "Each CTE is a named result the next step can query like a table. The final SELECT only knows `vips` — which is what makes the chain readable top-down and testable stage by stage.",
      notes: [
        { choice: 0, why: "Reaching back to orders inside the final SELECT would tangle the two levels again — the staging exists precisely to keep levels apart." },
      ],
    },
  ],
  problems: [
    {
      id: "l38-p1",
      title: "Above the household bar",
      brief: "For each customer, count their orders that beat **their own average order**: output the top 4 as `name`, `stellar_orders`. (45 orders qualify storewide — Alice, Emma and Maya each own 8 of them.)",
      hints: [
        "The correlated probe: compare each order to an average computed over THAT customer's orders, then count per customer and cap at 4.",
        "Shape: SELECT c.name, COUNT(*) AS stellar_orders FROM orders o JOIN customers c ON c.id = o.customer_id WHERE o.total > (SELECT AVG(o2.total) FROM orders o2 WHERE o2.customer_id = o.customer_id) GROUP BY c.id ORDER BY stellar_orders DESC, c.name LIMIT 4;",
      ],
      difficulty: "hard",
      solution: "SELECT c.name, COUNT(*) AS stellar_orders\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nWHERE o.total > (\n  SELECT AVG(o2.total) FROM orders o2\n  WHERE o2.customer_id = o.customer_id\n)\nGROUP BY c.id\nORDER BY stellar_orders DESC, c.name\nLIMIT 4;",
      mistakes: [
        { test: "avg\\s*\\(\\s*o2?\\.total\\s*\\)\\s*\\)\\s*$|from\\s+orders\\s*\\)\\s*$", message: "A storewide average inside the probe compares everyone to 338.19 — the household bar re-asks 'average of WHO' per row via the correlated customer_id." },
        { test: "\\bwhere\\s+o2\\.customer_id\\s*=\\s*o2\\.", message: "The probe must tie to the OUTER row's customer (o.customer_id) — correlating o2 to itself computes a constant and the baseline collapses." },
        { test: "\\bhaving\\b", message: "HAVING filters groups after counting — but the stellar filter is per-ROW (each order vs its household mean), so it belongs in WHERE before the grouping." },
      ],
      expected: EXPECTED["l38-p1"],
      ordered: true,
    },
    {
      id: "l38-p2",
      title: "The big spenders",
      brief: "Stage each customer's **lifetime spend** in a derived table, then keep those beating the average CUSTOMER spend (2,177.08). Output `name`, `spend` (2 decimals), richest first — five rows.",
      hints: [
        "Stage: customer id/name → SUM(total). Then filter the stage against its own AVG(spend) via a scalar subquery.",
        "Shape: WITH spends AS (SELECT c.id, c.name, SUM(o.total) AS spend FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id) SELECT name, ROUND(spend, 2) AS spend FROM spends WHERE spend > (SELECT AVG(spend) FROM spends) ORDER BY spend DESC;",
      ],
      difficulty: "hard",
      solution: "WITH spends AS (\n  SELECT c.id, c.name, SUM(o.total) AS spend\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n)\nSELECT name, ROUND(spend, 2) AS spend\nFROM spends\nWHERE spend > (SELECT AVG(spend) FROM spends)\nORDER BY spend DESC;",
      mistakes: [
        { test: "\\bavg\\s*\\(\\s*o\\.total\\s*\\)", message: "AVG(o.total) is the average ORDER (338.19) — the VIP bar is the average CUSTOMER's lifetime spend (2,177.08), which only exists after staging the per-customer sums." },
        { test: ">\\s*2177|>\\s*2000", message: "Never hardcode the bar — the stage's own AVG(spend) recomputes it live, so the list survives tomorrow's orders." },
        { test: "\\bgroup\\s+by\\s+c\\.id\\s*$", message: "The GROUP BY builds the stage — the final SELECT runs against `spends`, not against the raw join. Two levels, two queries." },
      ],
      expected: EXPECTED["l38-p2"],
      ordered: true,
    },
    {
      id: "l38-p3",
      title: "Pending right now",
      brief: "Which customers hold **at least one pending order** this instant? Spell it with EXISTS. Output `name`, alphabetical — eight rows.",
      hints: [
        "The probe asks: does ANY row exist in orders for this customer with status pending? EXISTS stops at the first hit.",
        "Shape: SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') ORDER BY c.name;",
      ],
      difficulty: "medium",
      solution: "SELECT c.name FROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id AND o.status = 'pending'\n)\nORDER BY c.name;",
      mistakes: [
        { test: "\\bcount\\s*\\(\\s*\\*?\\s*\\)\\s*>\\s*0", message: "COUNT(*) > 0 works but drags every order into the count — EXISTS short-circuits at the first matching row, which is both cleaner and the drill." },
        { test: "'(shipped|delivered|cancelled)'", message: "Wrong status — the live pipeline is 'pending': 14 orders across 8 customers. Shipped would list 10 names, delivered 15." },
        { test: "\\bgroup\\s+by\\b", message: "No buckets needed — the membership question ('any pending at all?') is exactly what EXISTS answers per customer row." },
      ],
      expected: EXPECTED["l38-p3"],
      ordered: true,
    },
    {
      id: "l38-p4",
      title: "Status veterans",
      brief: "True VIPs have **experienced every status**: customers whose orders include all four statuses. Output `name`, alphabetical — three rows. (COUNT(DISTINCT …) is the breadth test.)",
      hints: [
        "Bucket orders per customer, then gate on the number of DIFFERENT statuses — 4 means the full experience.",
        "Shape: SELECT c.name FROM customers c JOIN orders o ON o.customer_id = c.id GROUP BY c.id HAVING COUNT(DISTINCT o.status) = 4 ORDER BY c.name;",
      ],
      difficulty: "medium",
      solution: "SELECT c.name FROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nHAVING COUNT(DISTINCT o.status) = 4\nORDER BY c.name;",
      mistakes: [
        { test: "count\\(\\s*o\\.status\\s*\\)\\s*=\\s*4", message: "COUNT(o.status) = 4 passes anyone with four orders — even four delivered. The DISTINCT makes it four DIFFERENT statuses, which is the veteran test." },
        { test: "\\bwhere\\b[^;]*status\\s*=\\s*'", message: "Filtering one status before grouping defeats the breadth test — all four statuses must survive into each customer's bucket." },
        { test: ">\\s*=\\s*4|>\\s*4", message: "There are exactly four statuses — `> 4` matches nobody and `>= 4` equals `= 4`. The brief's 'all four' pins the equality." },
      ],
      expected: EXPECTED["l38-p4"],
      ordered: true,
    },
    {
      id: "l38-p5",
      title: "The VIP pipeline",
      brief: "Assemble the shortlist as a **CTE chain**: stage per-customer spends → filter to above-average → output the top 3 as `name`, `spend` (2 decimals). Two named stages, one final SELECT.",
      hints: [
        "Stage 1 `spends` is l38-p2's derived table; stage 2 `vips` applies the above-average filter; the final SELECT orders and caps.",
        "Shape: WITH spends AS (…), vips AS (SELECT * FROM spends WHERE spend > (SELECT AVG(spend) FROM spends)) SELECT name, ROUND(spend, 2) AS spend FROM vips ORDER BY spend DESC LIMIT 3;",
      ],
      difficulty: "hard",
      solution: "WITH spends AS (\n  SELECT c.id, c.name, SUM(o.total) AS spend\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n),\nvips AS (\n  SELECT * FROM spends\n  WHERE spend > (SELECT AVG(spend) FROM spends)\n)\nSELECT name, ROUND(spend, 2) AS spend\nFROM vips\nORDER BY spend DESC\nLIMIT 3;",
      mistakes: [
        { test: "\\bwith\\s+\\w+\\s+as\\s*\\([^)]*\\)\\s*,?\\s*select", message: "One CTE then straight to SELECT skips the named VIP stage — the brief wants two named steps so each is runnable alone." },
        { test: "\\blimit\\s+5\\b", message: "The shortlist is three — the cap rides on the FINAL select, after the vip stage has already filtered to five." },
        { test: "\\bavg\\s*\\(\\s*o\\.total\\s*\\)", message: "Average order ≠ average customer again — the bar lives in the vips stage comparing against AVG(spend) of the staged rows." },
      ],
      expected: EXPECTED["l38-p5"],
      ordered: true,
    },
  ],
  takeaway: "Two-level questions die in one level: stage the summary (spends), compare against the staged average, probe existence with EXISTS, test breadth with COUNT(DISTINCT) — and let the CTE names document the recipe.",
};
