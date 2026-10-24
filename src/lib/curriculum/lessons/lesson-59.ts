import type { Lesson } from "../types";
import { mcqBank, probBank } from "./banks/m10-util";
import { ROWS as MCQS } from "./banks/l59-mcqs";
import { ROWS as PROBS } from "./banks/l59-problems";

export const lesson59: Lesson = {
  id: "lesson-59",
  num: 59,
  title: "Windows V — the ranking playbook",
  blurb:
    "Top-N-per-group, deduplication, latest-event picks and tie-safe leagues: the five ranking patterns that replace 90% of correlated subqueries, drilled until the two-layer shape is reflex",
  minutes: 17,
  blocks: [
    {
      kind: "p",
      text: "Ranking is where windows earn their keep. Lesson 31 introduced the rank family; this lesson drills the *playbook* — the recurring shapes you'll ship weekly. Every pattern here is the same three moves: number the rows with a window inside an inner layer, filter the numbers outside, and tiebreak every sort spec so the answer survives a re-run. The storefront gives each pattern real stakes: 16 customers across 4 regions, 103 orders across 14 months, and ties everywhere except order totals.",
    },
    { kind: "h", text: "Pattern 1 — top-N-per-group" },
    {
      kind: "code",
      caption: "The two-layer law, in full",
      sql: `WITH ranked AS (
  SELECT c.region, c.name, SUM(o.total) AS spend,
         ROW_NUMBER() OVER (PARTITION BY c.region
                            ORDER BY SUM(o.total) DESC) AS rn
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
SELECT region, name, ROUND(spend, 2) AS spend, rn
FROM ranked
WHERE rn <= 3
ORDER BY region, rn;   -- the podium per region`,
    },
    {
      kind: "bullets",
      items: [
        "The CTE is not decoration — it is the **only** place the filter can legally live, because WHERE runs before windows exist.",
        "`PARTITION BY` chooses the contestants' groups (regions); `ORDER BY` chooses the contest (spend). Swap either and you have a different report for free.",
        "`rn <= 3` reads like an afterthought but IS the deliverable — the window computed every position and the filter kept the podium.",
      ],
    },
    { kind: "h", text: "Pattern 2 — latest event per key (window dedupe)" },
    {
      kind: "code",
      caption: "Each customer's most recent order — identity intact",
      sql: `WITH latest AS (
  SELECT c.name, o.status, o.created_at,
         ROW_NUMBER() OVER (PARTITION BY o.customer_id
                            ORDER BY o.created_at DESC, o.id DESC) AS rn
  FROM orders o JOIN customers c ON c.id = o.customer_id
)
SELECT name, status, created_at FROM latest
WHERE rn = 1 ORDER BY name;   -- a live status board`,
    },
    {
      kind: "warn",
      text: "The DESC ordering plus the `id DESC` tiebreaker is what makes this audit-safe. Two orders on the same day are a real possibility on this store — 2024-10-13 and 2024-05-12 each hold three — and without the tiebreaker, 'the latest order' changes run to run. GROUP BY + MAX cannot ship this report at all: it finds the newest *timestamp* but not the *order* that owns it.",
    },
    { kind: "h", text: "Pattern 3 — ties: pick your contract" },
    {
      kind: "table",
      headers: ["Contract", "Function", "Tie of 3 at rank 1 yields"],
      rows: [
        ["Ties share, next skips", "`RANK()`", "1, 1, 1, 4"],
        ["Ties share, next packs", "`DENSE_RANK()`", "1, 1, 1, 2"],
        ["Never tie", "`ROW_NUMBER()`", "1, 2, 3, 4 — arbitrary among equals"],
      ],
      caption: "Monthly counts on this store: 9 appears twice, 8 four times, 7 five times, 6 three times — real tie pressure",
    },
    {
      kind: "bullets",
      items: [
        "League tables where tied teams **share** a rank and the next slot skips: RANK (medal style).",
        "Tier systems where the next tier follows immediately: DENSE_RANK (gold/silver/bronze style).",
        "Anything you'll filter, export, or re-run: ROW_NUMBER — with a unique tiebreaker bolted on.",
      ],
    },
    { kind: "h", text: "Pattern 4 — relative standing" },
    {
      kind: "code",
      caption: "Where does this customer sit in the spend distribution?",
      sql: `SELECT c.name,
  ROUND(SUM(o.total), 2) AS spend,
  ROUND(PERCENT_RANK() OVER (ORDER BY SUM(o.total)), 3) AS pr,
  ROUND(CUME_DIST()   OVER (ORDER BY SUM(o.total)), 3) AS cd
FROM customers c JOIN orders o ON o.customer_id = c.id
GROUP BY c.id
ORDER BY pr DESC;   -- pr: (rank-1)/(n-1) · cd: share at-or-below`,
    },
    {
      kind: "bullets",
      items: [
        "`PERCENT_RANK` normalizes by **n − 1**: the first row is 0, the last is exactly 1.",
        "`CUME_DIST` normalizes by **n** and counts peers at-or-below: tie groups share a value, and the last row is also 1.",
        "Interview shorthand: percent_rank is 'how far up the ladder', cume_dist is 'how many people I'm at or above'.",
      ],
    },
    { kind: "h", text: "Pattern 5 — duplicates and surplus" },
    {
      kind: "code",
      caption: "Same-day repeat orders — the audit view",
      sql: `WITH d AS (
  SELECT DISTINCT customer_id, created_at,
         COUNT(*) OVER (PARTITION BY customer_id, created_at) AS n_twins
  FROM orders
)
SELECT customer_id, created_at, n_twins FROM d
WHERE n_twins > 1
ORDER BY created_at;   -- 2024-05-12 and 2024-10-13 hold triplets`,
    },
    {
      kind: "tip",
      text: "`rn > 1` on a compound partition is also the DELETE target list for deduping feeds — keep rn = 1, remove the surplus (module 7's writes bolt straight onto this shape). The same trick finds twin prices, twin timestamps, any duplicated business key.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "PERCENT_RANK, CUME_DIST and NTILE have been in SQLite since 3.25. NULLs sort first ASC / last DESC — inactive customers with NULL-ish keys land at the leaderboard floor unless you spell `NULLS LAST` (3.30+) or an `IS NULL` sort key.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Identical semantics. Postgres additionally offers `rank() FILTER`-style aggregates and `ORDER BY … NULLS FIRST|LAST` with full control — useful when porting this playbook.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "All five patterns port to MySQL 8.0 unchanged. The pre-8.0 fallback for latest-per-key is the correlated `WHERE created_at = (SELECT MAX…)` — correct but O(n²) at scale.",
    },
  ],
  mcqs: mcqBank("l59", MCQS),
  problems: probBank("l59", PROBS),
  takeaway:
    "Five shapes cover the ranking world: number-then-filter for top-N, recency picks for dedupe, a conscious tie contract (RANK / DENSE_RANK / ROW_NUMBER), relative-standing fractions, and rn > 1 as the surplus detector — every sort spec tiebroken, every filter one layer out.",
  deep: [
    {
      kind: "mind",
      text: "The ranking playbook is **three named shapes**: top-N-per-group (number inside a CTE, filter rn <= N outside), dedupe-to-latest (number newest-first, keep rn = 1), and the tie-contract choice (ROW_NUMBER breaks ties arbitrarily, RANK skips, DENSE_RANK packs). The two-layer shape is not ceremony — it is the clause-order law from Windows IV made into a pattern: WHERE cannot see window output, so the number-then-filter sandwich is THE portable idiom. The playbook's quiet superpower is replacing fragile alternatives: the \"GROUP BY customer + MAX(created_at) + re-join\" dance for latest-per-group produces wrong rows when timestamps tie, while rn = 1 with a deterministic tiebreak is stable by construction.",
    },
    {
      kind: "engine",
      title: "you run WITH n AS (… ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY total DESC, id) AS rn …) SELECT * FROM n WHERE rn <= 3",
      steps: [
        "**Inner pass** — the CTE stamps all 103 orders with their within-customer rank: customer 1's 24 orders become ranks 1..24, ordered by total DESC with the id tiebreak.",
        "**Outer filter** — WHERE rn <= 3 runs in the outer query where rn is an ordinary column: the clause-order law is satisfied by layering, not by syntax tricks.",
        "**The tie contract pays off** — two orders tied at the same total get ids as arbiter: every run returns the SAME three rows. Without the tiebreak, pagination and exports flip coins.",
        "**Shape generalization** — rn = 1 dedupes; rn BETWEEN 4 AND 6 pages; rn = 1 per (customer, month) answers first-order-per-month. One sandwich, many fillings.",
      ],
    },
    {
      kind: "myth",
      myth: "\"LIMIT N per group — just GROUP BY and LIMIT, right?\"",
      truth: "GROUP BY + LIMIT applies LIMIT to the GROUPS, not within them — \"top 3 per customer\" returns 3 rows total, not 48. There is no LIMIT-inside-group syntax in SQL; the rank-sandwich is the standard, engine-portable answer.",
    },
    {
      kind: "edge",
      items: [
        { c: "\"Top 3\" that returns 4 rows", r: "That's RANK, not a bug: ties at rank 3 all survive. If the business wants EXACTLY three per group, the contract is ROW_NUMBER — say which you promised before the stakeholder says it louder." },
        { c: "Dedupe without a deterministic tiebreak", r: "rn = 1 over ties picks an arbitrary survivor per run — the \"deleted\" row reappears tomorrow. Order by (created_at DESC, id DESC): the dedupe becomes reproducible." },
        { c: "Filtering in the same layer", r: "WHERE rn <= 3 must be OUTSIDE the window's SELECT — putting it in the same query is the parser error that teaches clause order. A derived table or CTE is the door." },
        { c: "DENSE_RANK for pagination", r: "Pages built on ROW_NUMBER skip nothing; pages built on RANK leave holes after ties (rank 3 missing → page shows 2 rows). Choose the contract the UI expects — usually ROW_NUMBER for page math, DENSE_RANK for display." },
      ],
    },  ],
};
