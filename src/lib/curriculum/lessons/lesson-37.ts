import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson37: Lesson = {
  id: "lesson-37",
  num: 37,
  title: "Case study — the quarterly merchandising review",
  blurb: "Module 3's operators under one brief: labeled stacks, shared shelves, the region × status pivot and a workflow-ordered report",
  minutes: 17,
  blocks: [
    {
      kind: "p",
      text: "Quarter-end. The merchandising lead needs the review pack, and it's all Module 3: two populations compared as sets, one pivot that turns 103 order rows into a region × status grid, a value census computed in a single pass, and a status report ordered by *workflow* — not by the alphabet the data was born with. Four deliverables, one rule throughout: set operators compare whole result sets, and CASE is the branch that lives inside a query.",
    },
    {
      kind: "bullets",
      items: [
        "**In-flight vs complete** — two labeled count arms, stacked with UNION ALL so the arithmetic can't lie.",
        "**Shared shelves** — which categories do Alice and Emma BOTH buy? INTERSECT answers it; EXCEPT answers 'Alice's exclusives' (exactly one category: Fitness).",
        "**The pivot** — one row per region, four CASE columns, one per status. The cross-tab is hand-built; no engine does it for you.",
        "**The value census** — SUM(CASE …) per status in one pass: 15,571.07 delivered, 11,996.72 shipped, 6,113.00 pending, 1,152.49 cancelled — they sum to the honest 34,833.28.",
      ],
    },
    { kind: "diagram", figure: "l37-setop-pivot" },
    {
      kind: "warn",
      text: "The custom sort's hidden cliff: `ORDER BY CASE status WHEN 'pending' THEN 1 … ` — forget the ELSE and every unmapped status becomes NULL, which SQLite sorts FIRST in ascending order. Your cancelled bucket would leap to the top of the report. Always close the CASE.",
    },
    {
      kind: "tip",
      text: "Wrap compound SELECTs (UNION/INTERSECT/EXCEPT) in an outer query when you need ORDER BY on the final stack — the outer query sees the whole set as one table, and the sort applies to everything, deterministically.",
    },
  ],
  mcqs: [
    {
      id: "l37-q1",
      prompt: "The in-flight arm counts 44 orders (pending + shipped), the complete arm 52. Which operator, and why?",
      choices: [
        "UNION — the arms might overlap, dedupe protects us",
        "UNION ALL — two labeled counts that must both survive; dedupe could only ever delete honest rows",
        "INTERSECT — we want orders in both states",
        "EXCEPT — complete minus in-flight",
      ],
      answer: 1,
      why: "The labels differ ('in_flight' vs 'complete'), so the rows can't even collide — but UNION ALL is chosen on principle: stacked COUNTS must add up, and ALL never subtracts. 44 + 52 = 96 checks out against 103 minus 7 cancelled.",
      notes: [
        { choice: 0, why: "The arms can't overlap today (labels differ), but 'might overlap' is exactly why UNION is wrong here: if a refactor ever made two arms collide, UNION would silently swallow the duplicate and the pack's arithmetic would rot." },
      ],
    },
    {
      id: "l37-q2",
      prompt: "Alice buys 7 of the 7 categories; Emma buys 6. What does EXCEPT (Alice's list EXCEPT Emma's list) return — and what if the arms were swapped?",
      choices: [
        "Both return Fitness — INTERSECT in disguise",
        "Alice EXCEPT Emma: Fitness (her exclusive) · Emma EXCEPT Alice: nothing",
        "Alice EXCEPT Emma: nothing · Emma EXCEPT Alice: Fitness",
        "Both return nothing — EXCEPT needs identical tables",
      ],
      answer: 1,
      why: "EXCEPT keeps what the left arm has and the right arm lacks. Emma's six categories are all inside Alice's seven, so only Alice-minus-Emma has content: the single Fitness row. Swap the arms and the set difference is empty.",
      notes: [
        { choice: 3, why: "EXCEPT works on ANY aligned result sets — the arms just need matching column counts and types, not identical sources. Set difference is directional; that asymmetry IS the answer here." },
      ],
    },
    {
      id: "l37-q3",
      prompt: "In the region × status pivot, what does ONE of the four CASE columns contribute per row of the underlying data?",
      choices: [
        "The status text, so the column can group later",
        "A 1 when that row's status matches the column's status, else 0 — SUM turns the 1/0 stream into a per-region count",
        "The order's id — SUM collapses ids",
        "NULL everywhere — CASE can't compare text",
      ],
      answer: 1,
      why: "The pivot is four parallel counters wearing four CASE expressions. Per region row: pending's CASE summed to one number, shipped's to another — 14/30/52/7 across the whole store, split four ways by region.",
      notes: [
        { choice: 2, why: "SUM over ids adds up keys — meaningless. The CASE must produce a COUNT-like 1/0 (or the actual total, for a value pivot) before SUM means anything." },
      ],
    },
    {
      id: "l37-q4",
      prompt: "The workflow sort puts pending → shipped → delivered → cancelled. What breaks if the CASE mapping omits the ELSE for cancelled?",
      choices: [
        "Cancelled rows vanish from the report",
        "Cancelled becomes NULL and sorts FIRST in SQLite's ascending order — jumping the queue it was meant to close",
        "The query errors — CASE requires full coverage",
        "Nothing — unmapped values sort last by default",
      ],
      answer: 1,
      why: "A branchless CASE yields NULL, and NULL sorts before everything in SQLite's ASC. The 7 cancelled orders would top the workflow report — the exact opposite of 'closed last'. The ELSE 4 (or NULLS LAST) is the fix.",
      notes: [
        { choice: 3, why: "Backwards for SQLite — that's PostgreSQL's habit. Defaults differ across engines; the portable spell is an explicit ELSE or an explicit NULLS LAST." },
      ],
    },
  ],
  problems: [
    {
      id: "l37-p1",
      title: "In-flight vs complete",
      brief: "Two labeled counts, stacked: `'in_flight'` = orders still pending or shipped (one arm), `'complete'` = delivered orders (second arm). Output `label`, `n` — expect 44 and 52.",
      hints: [
        "Two complete queries, each producing a labeled count, joined by UNION ALL.",
        "Shape: SELECT 'in_flight' AS label, COUNT(*) AS n FROM orders WHERE status IN ('pending','shipped') UNION ALL SELECT 'complete', COUNT(*) FROM orders WHERE status = 'delivered';",
      ],
      difficulty: "easy",
      solution: "SELECT 'in_flight' AS label, COUNT(*) AS n\nFROM orders WHERE status IN ('pending', 'shipped')\nUNION ALL\nSELECT 'complete', COUNT(*)\nFROM orders WHERE status = 'delivered';",
      mistakes: [
        { test: "\\bunion\\b(?!\\s+all)", message: "Plain UNION would dedupe the stack — harmless while the labels differ, but ALL is the honest default for counts that must add up." },
        { test: "\\bintersect\\b|\\bexcept\\b", message: "The brief stacks two INDEPENDENT counts side by side — not a comparison of two sets. UNION ALL piles rows; INTERSECT/EXCEPT diff them." },
        { test: "\\bgroup\\s+by\\b", message: "GROUP BY status would emit all four statuses — the brief wants two hand-labeled buckets covering five statuses' worth of work." },
      ],
      expected: EXPECTED["l37-p1"],
      ordered: true,
    },
    {
      id: "l37-p2",
      title: "Shared shelves",
      brief: "Which **categories do BOTH Alice Chen and Emma Wilson buy**? Build each shopper's category list from orders → items → products, then INTERSECT. Output `category`, alphabetical — six rows.",
      hints: [
        "Each arm is a DISTINCT category list for one customer; wrap the INTERSECT in an outer query to sort the final set.",
        "Shape: SELECT category FROM (SELECT DISTINCT p.category … WHERE c.name = 'Alice Chen' INTERSECT SELECT DISTINCT p.category … WHERE c.name = 'Emma Wilson') ORDER BY category;",
      ],
      difficulty: "hard",
      solution: "SELECT category FROM (\n  SELECT DISTINCT p.category\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN customers c ON c.id = o.customer_id\n  WHERE c.name = 'Alice Chen'\n  INTERSECT\n  SELECT DISTINCT p.category\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN customers c ON c.id = o.customer_id\n  WHERE c.name = 'Emma Wilson'\n)\nORDER BY category;",
      mistakes: [
        { test: "\\bunion\\b", message: "UNION merges both shoppers' categories into one pile (7 ∪ 6 = 7 rows) — the ask is the SHARED six, which is INTERSECT's job." },
        { test: "\\bexcept\\b", message: "EXCEPT answers 'Alice's exclusives' — one row. The shared-shelf question is the intersection of the two lists." },
        { test: "c\\.name\\s*=\\s*'(grace|olivia|bruno)", message: "Wrong shopper — the brief names Alice Chen and Emma Wilson specifically; their two category lists are what intersect." },
      ],
      expected: EXPECTED["l37-p2"],
      ordered: true,
    },
    {
      id: "l37-p3",
      title: "Alice's exclusives",
      brief: "Which categories does **Alice buy that Emma never does**? Same two lists, spelled with EXCEPT. Output `category` — expect exactly one row.",
      hints: [
        "Alice's list first, Emma's second — set difference is directional.",
        "Shape: SELECT category FROM (SELECT DISTINCT … 'Alice Chen' EXCEPT SELECT DISTINCT … 'Emma Wilson') ORDER BY category;",
      ],
      difficulty: "hard",
      solution: "SELECT category FROM (\n  SELECT DISTINCT p.category\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN customers c ON c.id = o.customer_id\n  WHERE c.name = 'Alice Chen'\n  EXCEPT\n  SELECT DISTINCT p.category\n  FROM orders o\n  JOIN order_items oi ON oi.order_id = o.id\n  JOIN products p ON p.id = oi.product_id\n  JOIN customers c ON c.id = o.customer_id\n  WHERE c.name = 'Emma Wilson'\n)\nORDER BY category;",
      mistakes: [
        { test: "\\bintersect\\b", message: "INTERSECT finds the six SHARED shelves — the brief wants Alice's exclusive, which lives in the difference." },
        { test: "'emma wilson'\\s*\\n?\\s*except|\\bexcept\\s*[\\s\\S]*'alice'", message: "Arm order matters: EXCEPT keeps Alice-minus-Emma. Swapped, the answer is empty because Emma bought nothing Alice didn't." },
        { test: "\\bnot\\s+in\\b", message: "NOT IN can express the same difference — but this review drills the set-operator spelling: two aligned lists, one EXCEPT." },
      ],
      expected: EXPECTED["l37-p3"],
      ordered: true,
    },
    {
      id: "l37-p4",
      title: "The region × status pivot",
      brief: "One row per region with four status counters beside it: `region`, `pending`, `shipped`, `delivered`, `cancelled` — regions alphabetical. The 103 orders become four rows.",
      hints: [
        "Four SUM(CASE …) columns in the SELECT list, GROUP BY region. Each CASE contributes 1 for its status, 0 otherwise.",
        "Shape: SELECT c.region, SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending, … FROM orders o JOIN customers c ON c.id = o.customer_id GROUP BY c.region ORDER BY c.region;",
      ],
      difficulty: "hard",
      solution: "SELECT c.region,\n  SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS pending,\n  SUM(CASE WHEN o.status = 'shipped' THEN 1 ELSE 0 END) AS shipped,\n  SUM(CASE WHEN o.status = 'delivered' THEN 1 ELSE 0 END) AS delivered,\n  SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.region\nORDER BY c.region;",
      mistakes: [
        { test: "\\bgroup\\s+by\\s+c\\.region\\s*,\\s*o\\.status|\\bgroup\\s+by\\s+region\\s*,\\s*status", message: "Grouping by BOTH region and status rebuilds the long format (16 rows) — the pivot's whole point is collapsing status into four COLUMNS of one row." },
        { test: "\\bcount\\s*\\(\\s*\\*\\s*\\)\\s+as\\s+(pending|shipped)", message: "A bare COUNT(*) counts every row in the bucket regardless of status — each column needs its own CASE filter inside the aggregate." },
        { test: "\\bpivot\\b|\\bcrosstab\\b", message: "No pivot keyword exists in SQLite — the cross-tab is hand-built from CASE expressions, which is exactly the drill." },
      ],
      expected: EXPECTED["l37-p4"],
      ordered: true,
    },
    {
      id: "l37-p5",
      title: "The status value census",
      brief: "One row, four money columns: `delivered_value`, `shipped_value`, `pending_value`, `cancelled_value` — each the SUM of order totals for that status (2 decimals). One pass over orders.",
      hints: [
        "Same CASE counter shape — but the votes are the order's total, not a 1.",
        "Shape: SELECT ROUND(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 2) AS delivered_value, … FROM orders;",
      ],
      difficulty: "medium",
      solution: "SELECT ROUND(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 2) AS delivered_value,\n  ROUND(SUM(CASE WHEN status = 'shipped' THEN total ELSE 0 END), 2) AS shipped_value,\n  ROUND(SUM(CASE WHEN status = 'pending' THEN total ELSE 0 END), 2) AS pending_value,\n  ROUND(SUM(CASE WHEN status = 'cancelled' THEN total ELSE 0 END), 2) AS cancelled_value\nFROM orders;",
      mistakes: [
        { test: "\\bcount\\b", message: "Counts answer 'how many orders' — the census asks what each status is WORTH. The CASE votes with `total`, not with 1." },
        { test: "\\bgroup\\s+by\\s+status\\b", message: "GROUP BY status gives the four values as four ROWS — the deliverable is one row of four columns, one pass, no buckets." },
        { test: "\\bjoin\\b", message: "Totals live on orders — no join needed, and joining items would only introduce the fan-out trap." },
      ],
      expected: EXPECTED["l37-p5"],
    },
    {
      id: "l37-p6",
      title: "The workflow-ordered report",
      brief: "Status counts in WORKFLOW order — pending, shipped, delivered, cancelled — not alphabetical. Output `status`, `n`; drive the sort with a CASE.",
      hints: [
        "COUNT per status is the easy part; the ORDER BY maps each status to a rank number via CASE.",
        "Shape: SELECT status, COUNT(*) AS n FROM orders GROUP BY status ORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'shipped' THEN 2 WHEN 'delivered' THEN 3 ELSE 4 END;",
      ],
      difficulty: "medium",
      solution: "SELECT status, COUNT(*) AS n\nFROM orders\nGROUP BY status\nORDER BY CASE status WHEN 'pending' THEN 1 WHEN 'shipped' THEN 2 WHEN 'delivered' THEN 3 ELSE 4 END;",
      mistakes: [
        { test: "\\border\\s+by\\s+status\\b\\s*;|\\border\\s+by\\s+status\\s+asc", message: "Sorting the status text gives alphabetical — cancelled first. The CASE rewrites text into workflow rank numbers for the sort to use." },
        { test: "\\belse\\s*$|when\\s+'cancelled'\\s+then", message: "Cancelled is the ELSE bucket — mapping it to its own WHEN works, but the discipline is: every unmapped value must land somewhere deliberate, or it becomes NULL (and sorts first!).", },
        { test: "\\blimit\\b", message: "No cap — the report shows all four buckets, in workflow order." },
      ],
      expected: EXPECTED["l37-p6"],
      ordered: true,
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "Quarter-end is where modules **collide on one page**: the comparison section wants set operators (this region's products minus last quarter's — EXCEPT; the overlap — INTERSECT), the summary table wants a CASE pivot (one row per region, one column per status), and the printed order wants a CASE sort (pending first, because that's the workflow, not the alphabet). The mental model is a **report pipeline**: population moves → shape moves → presentation moves. Writing them in that order, as separate verifiable layers, is what makes a quarter-end query auditable at all.",
    },
    {
      kind: "engine",
      title: "you assemble the quarter-end page",
      steps: [
        "**Populations** — the region censuses come straight from GROUP BY: EU 45 orders / APAC 37 / US 19 / LATAM 2; the pending-money pivot lands 2,675.29 / 1,966.28 / 1,471.43 / 0.00 — LATAM's zero is a *finding* (both its orders delivered).",
        "**Comparisons** — `order statuses EXCEPT invoice statuses` returns 4 rows (two disjoint lifecycles: pending/shipped/delivered/cancelled vs open/paid/void) — a vocabulary check, run in one line.",
        "**Ordering** — the closed CASE in ORDER BY (`pending→0, shipped→1, delivered→2, cancelled→3`) prints the pipeline in workflow order — probed: pending, shipped, delivered, cancelled, exactly.",
        "**Verify each layer** — every number above traces to a COUNT/SUM with the same WHERE; the quarter-end habit is *layers first, decoration last*.",
      ],
    },
    {
      kind: "myth",
      myth: "\"A quarter-end query is one big query — assembling it from layers means the parts can drift apart.\"",
      truth: "The opposite: **layers are what keep it honest**. A monolith can't be partially verified — you check the final grid and hope. Layered, each stage has its own headcount: the population WHERE, the pivot's ELSE 0 columns, the stack's literal labels, the sort's closed CASE. Drift becomes a per-layer diff (EXCEPT the two layers and see), not a mystery. The composite is only as trustworthy as its cheapest checkpoint — give it several.",
    },
    {
      kind: "edge",
      items: [
        { c: "Open CASE in a printed sort", r: "`ORDER BY CASE status WHEN 'pending' THEN 0 ...` without the final ELSE sends any unexpected status (a new lifecycle value) to NULL — sorting before or after everything, engine-dependent. Close the switch (`ELSE 3`) so surprises sort predictably." },
        { c: "EXCEPT over REAL money", r: "Region sums built two ways can differ at the 3rd decimal; ROUND both arms before the EXCEPT or the audit screams over phantom cents." },
        { c: "Pivot columns that never fire", r: "A status column for a status the quarter never saw prints all zeros — correct, not dead code. Column set is part of the report's *contract*; keep it stable quarter over quarter." },
        { c: "Stack label collisions", r: "If the TOTAL row's literal collides with a real region name, downstream filters can't tell frame from data — label literals should be names no arm can produce ('—— TOTAL ——')." },
      ],
    },
  ],
  takeaway: "Quarter-end reporting is Module 3 in miniature: set operators compare populations, CASE builds pivots and value censuses in one pass, and a closed-CASE custom sort keeps the report in workflow order.",
};
