import type { Lesson } from "../types";
import { mcqBank, probBank } from "./banks/m10-util";
import { ROWS as MCQS } from "./banks/l62-mcqs";
import { ROWS as PROBS } from "./banks/l62-problems";

export const lesson62: Lesson = {
  id: "lesson-62",
  num: 62,
  title: "Windows VIII — tiles, shares & relative standing",
  blurb:
    "NTILE's equal-count bands, the manual share idiom that replaces RATIO_TO_REPORT, PERCENT_RANK vs CUME_DIST, Pareto concentration and the positional-vs-value cut distinction — the distribution layer of window analytics",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "Ranking orders rows; distribution answers 'where does this row STAND'. Is this customer top-quartile? What share of revenue is this order? Above or below the median? Lesson 57 touched these from the finance side; this lesson builds the full toolkit on the storefront population — 16 customers and 103 orders, populations small enough to verify every band by eye.",
    },
    { kind: "h", text: "NTILE — equal-count bands" },
    {
      kind: "code",
      caption: "Spend quartiles — 16 customers cut into 4/4/4/4",
      sql: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend,
         NTILE(4) OVER (ORDER BY SUM(o.total) DESC) AS q
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
SELECT name, ROUND(spend, 2) AS spend, q
FROM s ORDER BY q, spend DESC;   -- q = 1 is the VIP quartile`,
    },
    {
      kind: "bullets",
      items: [
        "NTILE(n) numbers tiles from 1; remainder rows fill the EARLIER tiles — 103 orders in 4 tiles cuts 26/26/26/25, 14 months in 3 tiles cuts 5/5/4.",
        "Tiles are POSITIONAL: they always hold equal counts, whatever the values. More tiles than rows clamps — every row becomes its own tile.",
        "The filter lives outside (the two-layer law): `WHERE q = 1` for the VIP quartile, `q IN (2,3)` for the interquartile middle.",
      ],
    },
    { kind: "diagram", figure: "l62-ntile-quartiles" },
    { kind: "h", text: "Shares — the pie, partitioned" },
    {
      kind: "code",
      caption: "SQLite has no RATIO_TO_REPORT — one division replaces it",
      sql: `SELECT status,
  ROUND(SUM(total), 2) AS rev,
  ROUND(100.0 * SUM(total) / SUM(SUM(total)) OVER (), 2) AS pct
FROM orders
GROUP BY status
ORDER BY rev DESC;   -- delivered holds ~44.7% of all revenue`,
    },
    {
      kind: "bullets",
      items: [
        "The denominator's scope IS the pie: empty OVER = store-wide, `PARTITION BY region` = within-region, `PARTITION BY customer_id` = within-customer.",
        "The `100.0` is load-bearing — integer ÷ integer floors to zero in SQLite's integer math.",
        "Rounded shares drift by a few hundredths; dashboards live with it, audits re-add the raw numbers.",
      ],
    },
    { kind: "diagram", figure: "l62-share-of-total" },
    { kind: "h", text: "Percentiles — two fractions, two questions" },
    {
      kind: "table",
      headers: ["Function", "Formula", "Answers"],
      rows: [
        ["`PERCENT_RANK()`", "(rank − 1) / (n − 1)", "'how far up the ladder am I' — 0 first, 1 last"],
        ["`CUME_DIST()`", "rows at-or-below / n", "'what fraction am I at or above' — ties share, last is 1"],
      ],
      caption: "On 16 rows, PERCENT_RANK steps in 1/15ths; CUME_DIST in 1/16ths",
    },
    {
      kind: "code",
      caption: "The whale-compatible cut",
      sql: `WITH s AS (
  SELECT c.name, SUM(o.total) AS spend,
         CUME_DIST() OVER (ORDER BY SUM(o.total)) AS cd
  FROM customers c JOIN orders o ON o.customer_id = c.id
  GROUP BY c.id
)
SELECT name, ROUND(spend, 2) AS spend
FROM s WHERE cd >= 0.9 ORDER BY spend DESC;   -- the 90th-percentile gate`,
    },
    {
      kind: "bullets",
      items: [
        "Tiles cut POSITIONS; distribution cuts cut FRACTIONS. One whale doesn't move a tile edge, but it moves any dollar threshold — know which contract your report promises.",
        "PERCENT_RANK derives from RANK: tie groups share the fraction. CUME_DIST counts peers at-or-below: tie groups share too — the two differ by exactly the normalization (n−1 vs n).",
        "SQLite's single-row partition defines PERCENT_RANK as 0 — LATAM's lone customer is the worked example.",
      ],
    },
    { kind: "h", text: "Concentration — the Pareto column" },
    {
      kind: "code",
      caption: "How many orders carry 80% of the revenue?",
      sql: `WITH n AS (
  SELECT ROW_NUMBER() OVER (ORDER BY total DESC, id) AS rn,
         SUM(total) OVER (ORDER BY total DESC, id) AS run,
         SUM(total) OVER () AS grand
  FROM orders
)
SELECT MIN(rn) AS orders_to_80
FROM n WHERE 100.0 * run / grand >= 80;   -- the 80/20 detector`,
    },
    {
      kind: "warn",
      text: "Fixed thresholds (spend >= 3000) are business rules that never drift; tiles re-cut every time the population changes. A quarterly dashboard that tiles anew will reassign customers between A/B/C/D segments — that's not a bug, it's the definition. Decide which stability your stakeholders expect BEFORE shipping either.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "NTILE, PERCENT_RANK and CUME_DIST have been in SQLite since 3.25. There is no PERCENTILE_CONT/PERCENTILE_DISC aggregate — medians come from the rn-pick idiom (position (n+1)/2), shown in the problems.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres ships RATIO_TO_REPORT-style shares via windows and PERCENTILE_CONT/DISC as ordered-set aggregates — the median becomes one call.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0 matches NTILE/PERCENT_RANK/CUME_DIST; shares remain the manual division.",
    },
    {
      kind: "tip",
      text: "Segmentation reviews: tile labels (A/B/C/D) plus one value threshold column side by side tells you BOTH stories at once — who's top-quartile and who crosses the business line. When the two disagree, that's the conversation worth having in the review.",
    },
  ],
  mcqs: mcqBank("l62", MCQS),
  problems: probBank("l62", PROBS),
  takeaway:
    "NTILE cuts equal-count bands, the share idiom partitions the pie, PERCENT_RANK and CUME_DIST place rows in the distribution, and the Pareto column measures concentration — positional cuts answer 'who', value cuts answer 'how much', and good reports label which they promise.",
  deep: [
    {
      kind: "mind",
      text: "Distribution windows replace \"rank 7 of 103\" with **\"where on the curve\"**: NTILE(n) deals ordered rows into n near-equal buckets (quartiles, deciles), PERCENT_RANK computes (rank−1)/(n−1) — the 0..1 ladder with its floor at exactly 0 — and CUME_DIST computes the at-or-below share (÷ n), the curve that includes peers and lands exactly on 1.0. The three disagree by design: quartile membership is count-forced, PERCENT_RANK is rank-fraction, CUME_DIST is share-of-population. \"Top quartile by spend\" and \"top 1% by CUME_DIST\" are different sentences that overlap without coinciding — the analyst's job is picking the definition the question meant, then saying it out loud in the report.",
    },
    {
      kind: "engine",
      title: "you run SELECT id, total, NTILE(4) OVER (ORDER BY total, id) AS quartile, ROUND(CUME_DIST() OVER (ORDER BY total), 4) AS cum FROM orders",
      steps: [
        "**Deal the tiles** — NTILE(4) over 103 ordered rows: buckets of 26/26/26/25 (the remainder spreads across the earliest buckets). Count-forced by definition.",
        "**The rank curve** — PERCENT_RANK = (rank−1)/(n−1): the cheapest row is exactly 0.0, the richest is (103−1)/(103−1) = 1.0 minus its own ties… peers share the value, so the top of the curve approaches 1 and only touches it when the top row is untied.",
        "**The share curve** — CUME_DIST = at-or-below ÷ n: ties ride one point, the maximum row sits at exactly 1.0. Ties included is the definitional difference from PERCENT_RANK.",
        "**Crossing discipline** — \"the median\" = the row where CUME_DIST first reaches ≥ 0.5. With even n the crossing is the upper median — say which you computed; both are defensible, silence is not.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Top quartile = top 25% of value.\"",
      truth: "NTILE quartiles split the **COUNT of rows**, not the SUM of value: the top quartile here is the 26 biggest orders, which may hold 60% of revenue. \"Top 25% of revenue\" is a cumulative-SUM-over-running-total computation — a different query wearing a similar name.",
    },
    {
      kind: "edge",
      items: [
        { c: "NTILE with a remainder", r: "103 into 4 leaves 3: the FIRST three buckets take the extra row. Bucket sizes 26/26/26/25 — downstream \"equal quarters\" claims need the footnote." },
        { c: "Ties across tile walls", r: "Two identical totals can straddle buckets 1 and 2 — NTILE is count-blind to value ties. If peers must travel together, the bucketing needs CUME_DIST thresholds instead." },
        { c: "PERCENT_RANK on a tie at top", r: "Two rows share the max rank n: both sit at (n−1)/(n−1) = 1.0? No — both share rank n−1+1… compute it: the curve tops BELOW 1.0 when ties ride the maximum. CUME_DIST is the curve that always reaches exactly 1." },
        { c: "Pareto reads", r: "Sort by total DESC, running SUM OVER () ÷ grand total: the cumulative share curve shows how few orders carry how much revenue — the 80/20 check, built from this lesson's parts." },
      ],
    },  ],
};
