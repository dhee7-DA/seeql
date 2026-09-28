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
};
