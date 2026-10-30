import type { Lesson } from "../types";
import { mcqBank, probBank } from "./banks/m10-util";
import { ROWS as MCQS } from "./banks/l58-mcqs";
import { ROWS as PROBS } from "./banks/l58-problems";

export const lesson58: Lesson = {
  id: "lesson-58",
  num: 58,
  title: "Windows IV — OVER from first principles",
  blurb:
    "The masterclass opens where mastery begins: what OVER really computes, where windows sit in SQL's evaluation order, how PARTITION and the sort spec interact with GROUP BY, and why every ranking query needs a deterministic tiebreaker",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "Lessons 31 and 32 taught you to *use* windows; this module teaches you to *reason* about them. The gap shows up the first time a window query returns something you didn't expect: a running total that resets mid-report, a rank that ignores your WHERE, a tie broken 'randomly'. None of those are bugs — they're the window machine's contract, and this lesson states that contract in full. Everything here runs on the same storefront: 16 customers, 103 orders across 14 months.",
    },
    { kind: "h", text: "The one rule: windows happen late" },
    {
      kind: "steps",
      items: [
        "**FROM / JOIN** — rows are gathered; the base row set exists.",
        "**WHERE** — rows are filtered. Windows do not exist yet; a window alias can never appear here.",
        "**GROUP BY / HAVING** — rows collapse into groups; each group becomes one output row.",
        "**SELECT — the window pass** — every `OVER(…)` call is computed over the rows that survived steps 1–3. This is why a window can read an aggregate like `SUM(o.total)` — the aggregate is already computed.",
        "**ORDER BY / LIMIT** — the final presentation pass, which *can* see window aliases (wrap them in a CTE or subquery when you need to filter on them).",
      ],
    },
    { kind: "diagram", figure: "l58-eval-order" },
    {
      kind: "code",
      caption: "Empty OVER — every row sees the same grand total",
      sql: `SELECT id, total,
  ROUND(total * 100.0 / SUM(total) OVER (), 1) AS pct_of_revenue
FROM orders
WHERE status = 'delivered'
ORDER BY pct_of_revenue DESC
LIMIT 3;   -- the biggest delivered order is ~1.7% of all delivered revenue`,
    },
    {
      kind: "bullets",
      items: [
        "`OVER ()` with nothing inside is the **whole survived row set** as one partition — the grand-total window. It is the shortest path to 'share of total' columns.",
        "`OVER (PARTITION BY region)` splits the rows into per-region stages; the function computes **independently on each stage** and the results are stapled back onto the original rows.",
        "`OVER (ORDER BY total)` turns the aggregate into a **running** aggregate: each row's window is 'every row up to and including me in this sort order'. That's lesson 32's running total — now you know why it works.",
        "The full shape — `OVER (PARTITION BY … ORDER BY …)` — is a per-group running computation: running revenue *within* each region, each customer, each month.",
      ],
    },
    {
      kind: "table",
      headers: ["Query shape", "Rows out", "What SUM computes"],
      rows: [
        ["`SUM(total) GROUP BY customer_id`", "one per customer (16)", "each customer's total, row collapsed"],
        ["`SUM(total) OVER ()`", "every row (103)", "the grand total, stamped on all"],
        ["`SUM(total) OVER (PARTITION BY customer_id)`", "every row (103)", "the owner's total, stamped on their rows"],
        ["`SUM(total) OVER (ORDER BY created_at)`", "every row (103)", "running total up to each order"],
      ],
      caption: "One function, four shapes — the partition and sort spec are the whole difference",
    },
    { kind: "diagram", figure: "l58-four-shapes" },
    { kind: "h", text: "Windows meet GROUP BY" },
    {
      kind: "code",
      caption: "Ranking the months — the window reads the grouped sums",
      sql: `SELECT SUBSTR(created_at, 1, 7) AS month,
  SUM(total) AS revenue,
  RANK() OVER (ORDER BY SUM(total) DESC) AS rk
FROM orders
GROUP BY month
ORDER BY rk
LIMIT 4;   -- 2024-01 ranks 1: 3,731.97 — the strongest month on the books`,
    },
    {
      kind: "bullets",
      items: [
        "When GROUP BY is present, the window runs **over the grouped rows**, not the base rows — there are only 14 monthly rows at window time, so the rank spans 14 values.",
        "That is the escape hatch for 'rank my aggregates': aggregate in GROUP BY, rank in OVER, and the window sees one row per group.",
        "Mixing both partitions — `GROUP BY month` with `OVER (PARTITION BY SUBSTR(created_at,1,4))` — ranks months within each year. The window expression must be grouped-legal: anything it references must be a GROUP BY key or an aggregate.",
      ],
    },
    { kind: "diagram", figure: "l58-group-rank" },
    { kind: "h", text: "Determinism is your job" },
    {
      kind: "code",
      caption: "A tiebreaker makes ROW_NUMBER reproducible",
      sql: `SELECT id, customer_id, total,
  ROW_NUMBER() OVER (ORDER BY total DESC, id) AS rn
FROM orders
ORDER BY rn
LIMIT 5;   -- totals are unique on this store, but the id tiebreaker costs nothing`,
    },
    {
      kind: "warn",
      text: "`ORDER BY total DESC` alone is only deterministic because no two orders share a total on this store. The moment your data has ties — statuses, regions, counts — ROW_NUMBER assigns arbitrary order among equal keys. Add a unique column (`id`, `created_at`) as the final sort key whenever the numbering will be *used* — exported, compared, or re-run.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite computes windows exactly in the evaluation order above and supports naming windows with the WINDOW clause (3.28+): `SELECT … FROM orders WINDOW w AS (PARTITION BY customer_id ORDER BY created_at)`.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres shares the model and adds frame exclusions (`EXCLUDE CURRENT ROW`) and richer tie statistics; everything in this lesson behaves identically.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0 matches the evaluation order too. Pre-8.0 has no windows at all — the correlated-subquery spellings from lessons 26–28 are the fallback, and every one of them is slower on big tables.",
    },
    {
      kind: "tip",
      text: "Debugging a window query? Strip it to the window pass: SELECT the keys, the raw value, and one window call — no joins you don't need, no filters you haven't tested. Once the column reads right, add layers back. Windows fail loudly (wrong values) more often than silently, and the culprit is usually the sort spec, not the function.",
    },
  ],
  mcqs: mcqBank("l58", MCQS),
  problems: probBank("l58", PROBS),
  takeaway:
    "Windows run after WHERE and GROUP BY, over whatever rows survived — the partition is a stage boundary, the sort spec turns aggregates into running ones, and determinism inside OVER is your responsibility, not the engine's.",
  deep: [
    {
      kind: "mind",
      text: "This masterclass starts the family from zero: **OVER is a scope declaration**. The empty form — OVER () — says \"the whole surviving row set is my stage\"; PARTITION BY cuts stages; ORDER BY sequences within a stage. Every window call is the same three-part sentence, and reading a query means parsing that sentence per function. The evaluation timing is the other foundation: windows run AFTER WHERE and GROUP BY — they see surviving (possibly grouped) rows — which is why \"filter on rank\" needs an outer layer, and why a window over a GROUP BY (\"rank the months\") ranks the GROUPS, not the raw rows. Master this one lesson's mental model and the next five are just new functions bolted to the same scope machine.",
    },
    {
      kind: "engine",
      title: "you run SELECT SUBSTR(created_at,1,7) AS month, SUM(total) AS revenue, RANK() OVER (ORDER BY SUM(total) DESC) AS rk FROM orders GROUP BY month",
      steps: [
        "**Fold first** — GROUP BY month collapses 103 orders into 14 rows; this happens BEFORE the window pass, by the standard clause order.",
        "**Window sees groups** — RANK's stage is the 14 grouped rows, not 103: the ranking \"SUM(total) DESC\" reads the ALREADY-aggregated revenue. Windows over aggregates are natural once timing is internalized.",
        "**Stamp, don't collapse** — the output keeps all 14 rows, each with rank attached. The leaderboard and the data share one result set — no self-join, no CTE round-trip.",
        "**The 103-row stamp** — the same machinery with COUNT(*) OVER (PARTITION BY status) stamps group SIZE onto every raw row: 52/30/14/7 travel with their member rows. One machinery, two grains, both honest.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Window functions are just aggregates with extra syntax — SUM is SUM.\"",
      truth: "The semantics diverge at the output contract: GROUP BY **collapses** (n rows in, one per group out), a window **stamps** (n rows in, n rows out, summary as a passenger column). Confusing them is how \"where did my 103 rows go?\" happens — the collapse is opt-in for windows, which is precisely their power.",
    },
    {
      kind: "edge",
      items: [
        { c: "Window in WHERE", r: "Rejected by the parser — not a style rule but the clause-order contract: WHERE runs before the window pass, so it cannot see the window's output. The CTE/outer-SELECT filter is the shape, in every engine." },
        { c: "PARTITION BY an aggregate", r: "PARTITION BY SUM(total) after GROUP BY is legal and occasionally meaningful — stages formed from group-level values. Readability suffers; stage with a CTE unless the one-liner earns its keep." },
        { c: "Multiple windows, one query", r: "Each OVER is independent: rank by revenue AND count per status in the same SELECT — two scope sentences, evaluated in their own passes. Name columns carefully; the stage each column saw is not visible in the output." },
        { c: "Determinism duty", r: "OVER (ORDER BY total) with tied totals is an unstable sort — the engine owes you no tie order. Every ranking that feeds pagination, dedupe, or export needs the id tiebreak. Non-determinism is YOUR bug, not the engine's." },
      ],
    },  ],
};
