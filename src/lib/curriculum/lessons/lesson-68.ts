import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l68-mcqs";
import { ROWS as PROBS } from "./banks/l68-problems";

export const lesson68: Lesson = {
  id: "lesson-68",
  num: 68,
  title: "The OLAP grammar — rollups, drill-downs, pivots, ratio-to-parent",
  blurb:
    "Four moves that read the star: rollup UP the hierarchy (quarters), drill-down DOWN it (months), the CASE-ladder pivot that turns rows into columns, and ratio-to-parent — the window over the grouped set that prices each child against its parent. Every board deck you've ever seen is these four moves wearing charts",
  minutes: 22,
  blocks: [
    {
      kind: "p",
      text: "The star is built; now the reading grammar. Every analytical report — every one, in every BI tool — decomposes into four moves over a fact: **rollup** (aggregate up a hierarchy), **drill-down** (the opposite), **pivot** (rows into columns) and **ratio-to-parent** (price each child against its parent). None of them need new tables; three of them need nothing but GROUP BY, and the fourth needs one window function riding the grouped scan. This lesson drills all four against numbers you can already recite: Tech $30,702.42 against Lifestyle $2,532.24, and five quarters of history.",
    },
    { kind: "h", text: "Rollup and drill-down: the same GROUP BY, opposite directions" },
    {
      kind: "code",
      caption: "UP: five quarters. DOWN: the months inside one of them.",
      sql: `-- ROLLUP: net per quarter (5 rows)
SELECT dd.year, dd.quarter,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key
GROUP BY dd.year, dd.quarter ORDER BY dd.year, dd.quarter;

-- DRILL-DOWN into 2024-Q1: the same query, one level deeper (3 rows)
SELECT dd.month, dd.month_name,
       ROUND(SUM(f.net_cents) / 100.0, 2) AS net_dollars
FROM fact_sales f JOIN dim_date dd ON dd.date_key = f.date_key
WHERE dd.year = 2024 AND dd.quarter = 1
GROUP BY dd.month, dd.month_name ORDER BY dd.month;`,
    },
    {
      kind: "bullets",
      items: [
        "**The hierarchy lives on the spine.** year → quarter → month → day are COLUMNS on dim_date; drilling is adding one to the GROUP BY. No date math, ever — the drill-down joins and reads.",
        "**The board's conversation is literally these two queries**: 'Q3 was our worst quarter' (rollup) — 'WHICH month?' (drill) — 'was it one product?' (drill again, into dim_product). The grammar follows the meeting.",
        "**SQLite has no ROLLUP/GROUPING SETS.** The portable total-plus-detail shape is UNION ALL: detail rows stacked over a hand-built total row — lesson 63's set grammar, reused for analytics.",
      ],
    },
    { kind: "h", text: "The pivot: CASE is the keyword you don't have" },
    {
      kind: "code",
      caption: "Departments as columns — the one-pager's grid",
      sql: `SELECT dd.year, d.department,
       ROUND(SUM(CASE WHEN dd.quarter = 1 THEN f.net_cents END) / 100.0, 2) AS q1,
       ROUND(SUM(CASE WHEN dd.quarter = 2 THEN f.net_cents END) / 100.0, 2) AS q2,
       ROUND(SUM(CASE WHEN dd.quarter = 3 THEN f.net_cents END) / 100.0, 2) AS q3,
       ROUND(SUM(CASE WHEN dd.quarter = 4 THEN f.net_cents END) / 100.0, 2) AS q4
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.year, d.department;          -- Tech: 8718.16 · 6951.57 · 6017.34 · 5429.17`,
    },
    {
      kind: "bullets",
      items: [
        "**One CASE per output column.** The pivot is mechanical: each dimension value that becomes a column gets its own conditional SUM. Verbose? Yes. Explicit, portable, and debuggable? Also yes.",
        "**No ELSE 0** — SUM skips NULLs, so a quarter with no rows reads NULL ('nothing happened here') instead of 0 ('things happened and summed to zero'). Honest absence is a feature.",
      ],
    },
    { kind: "h", text: "Ratio-to-parent: the window over the grouped set" },
    {
      kind: "code",
      caption: "Each department's share of its QUARTER — the parent in the PARTITION",
      sql: `SELECT dd.quarter, d.department,
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1) AS share_of_quarter_pct
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.quarter, d.department
ORDER BY dd.quarter, net_dollars DESC;   -- every quarter's shares sum to 100`,
    },
    {
      kind: "bullets",
      items: [
        "**The double SUM is the grammar.** The inner SUM is the GROUP BY's aggregate (the child); the outer SUM windows across those group results (the parent). Windows evaluate after grouping — this is the evaluation order from lesson 58, earning its keep.",
        "**PARTITION BY picks the parent.** `OVER (PARTITION BY dd.quarter)` shares against the quarter; `OVER ( )` shares against the company. The parent definition is ONE clause — and the shares-sum-to-100 check proves you chose the one you meant.",
        "**Ratios of sums, never sums of ratios.** Compute on the additive base (cents), round once at the end — averaging per-line percentages overweights tiny lines, the same trap module 5 flagged.",
      ],
    },
    {
      kind: "warn",
      text: "Top-N per group is where the grammar gets layered. WHERE runs BEFORE window functions — so `WHERE rn = 1` must live in an OUTER query, and any window that needs 'all the rows' (like a year total under a rank-1 filter) must compute in a MIDDLE layer. The concentration query is three layers deep, and every layer exists because of evaluation order.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery adds PIVOT/UNPIVOT operators (still writing the CASE ladder under the hood), and GROUPING SETS/ROLLUP in GROUP BY. Its QUALIFY clause — next lesson's star — also cleans up the top-N-per-group layering.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake carries GROUP BY ROLLUP/CUBE and QUALIFY natively; RATIO_TO_REPORT is a window shorthand for exactly this lesson's share-of-parent grammar (it even takes the parent as an argument).",
    },
    {
      kind: "tip",
      text: "The reviewer's checklist for any grammar query: (1) say the grain of the output row, (2) name the parent for every share, (3) check shares sum to ~100 per partition, (4) confirm top-N filters live in an outer layer. Four sentences catch ninety percent of analytical bugs.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A camera zoom, a spreadsheet turn, and a price tag. Rollup and drill-down are the ZOOM: same scene, wider or tighter framing — the data never changes, the GROUP BY's altitude does. The pivot is the TURN: the same table rotated so a dimension's values become headers, because humans compare across more easily than down. Ratio-to-parent is the PRICE TAG: a child's number means nothing until it's priced against its parent — 5,429 dollars means 'big' only when the quarter held 6,142. Four moves, one fact table, every dashboard ever shipped.",
    },
    {
      kind: "engine",
      title: "How the share query executes (evaluation order, applied)",
      steps: [
        "FROM/JOIN: fact (239 lines) joined to dim_date and dim_product — the star's usual two spokes.",
        "WHERE: 2024 filters the raw rows before any grouping (year is a raw column).",
        "GROUP BY: (quarter, department) collapses 239 lines into 8 group rows; inner SUM(net_cents) computes per group.",
        "WINDOW: SUM(SUM(net_cents)) OVER (PARTITION BY quarter) adds the parent total across each quarter's two group rows — after grouping, before ORDER BY.",
        "SELECT/ORDER BY: the ratio rounds once; the output orders quarter then department. Shares sum to 100.0 per quarter — the parent definition, proven.",
      ],
    },
    {
      kind: "myth",
      myth: "Ratios should be stored as columns for speed.",
      truth:
        "Stored shares go stale the moment any component changes and fork wherever the denominator's definition drifts. Ratios are DERIVED grammar: one window over the additive base, computed fresh, definition readable in the query. Store additive measures; compute relationships.",
    },
    {
      kind: "myth",
      myth: "PIVOT is a database feature you're missing out on.",
      truth:
        "BigQuery/Snowflake's PIVOT operators expand to the same conditional aggregation — the CASE ladder isn't a workaround, it IS the implementation. The advantage of writing it by hand: the column list is explicit, so a missing quarter is visible in review, not hidden in an operator.",
    },
    {
      kind: "edge",
      items: [
        { c: "A share partition sums to 99.9 — bug?", r: "Rounding, almost certainly: each row rounds to 0.1 independently. Sum the UNROUNDED shares to verify the parent; report rounding slack rather than 'fixing' it with a forced remainder row." },
        { c: "The drill-down returns a month with no rows.", r: "It can't — GROUP BY only outputs groups that exist. Honest zeros on a time axis need the spine LEFT JOINed (lesson 66's complete-calendar principle): 14 months exist even where Tech sold nothing." },
        { c: "Top-N per group with ties at the boundary.", r: "ROW_NUMBER keeps exactly one (arbitrarily); RANK keeps all tied winners. The brief's tie contract picks the function — and the keep-rule belongs in the review, not in luck." },
        { c: "Moving average over months with no sales.", r: "A sales-derived monthly set SKIPS empty months and the 3-row frame lies. Anchor on the spine: LEFT JOIN the 14-month calendar, then the window counts real months. (The seed has all 14 — production data won't.)" },
        { c: "Share of what — the parent keeps being ambiguous.", r: "That ambiguity is the number one analytical bug. The fix is rhetorical: every share column's name carries the parent (share_of_quarter_pct, share_of_company_pct) — a column named just share_pct is a bug report waiting to happen." },
      ],
    },
  ],
  mcqs: mcqBank("l68", MCQS),
  problems: probBankX("l68", PROBS),
  takeaway:
    "Rollup and drill-down are GROUP BY altitude changes on the spine's hierarchy; the pivot is a CASE ladder per column; ratio-to-parent is child ÷ SUM(child) OVER (parent partition) — with top-N and concentration layered strictly by evaluation order, and shares that must sum to 100 per partition.",
};
