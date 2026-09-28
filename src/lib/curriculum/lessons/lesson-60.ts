import type { Lesson } from "../types";
import { mcqBank, probBank } from "./banks/m10-util";
import { ROWS as MCQS } from "./banks/l60-mcqs";
import { ROWS as PROBS } from "./banks/l60-problems";

export const lesson60: Lesson = {
  id: "lesson-60",
  num: 60,
  title: "Windows VI — LAG & LEAD mastery",
  blurb:
    "Offsets that reach across rows: previous and next values, defaults at the edges, MoM deltas and growth rates, per-customer timelines, gap analysis, streaks and the islands trick that counts consecutive runs",
  minutes: 17,
  blocks: [
    {
      kind: "p",
      text: "Aggregates see MANY rows; offsets see exactly ONE — the neighbor at a given position. LAG fetches the previous row's value onto the current row; LEAD fetches the next. That single move powers month-over-month deltas, 'days since last order', streak detection and every 'this vs last time' column in analytics. The storefront's 14-month series (revenue from $3,731.97 down to $1,193.86 and back up) and its per-customer timelines make every edge case real: first rows, last rows, ties and silences.",
    },
    { kind: "h", text: "The offset contract" },
    {
      kind: "code",
      caption: "Each month beside last month",
      sql: `SELECT SUBSTR(created_at, 1, 7) AS month,
  ROUND(SUM(total), 2) AS rev,
  ROUND(LAG(SUM(total)) OVER (ORDER BY month), 2) AS prev_rev
FROM orders
GROUP BY month
ORDER BY month;   -- 2024-01 shows NULL: nothing came before it`,
    },
    {
      kind: "bullets",
      items: [
        "`LAG(x) OVER (ORDER BY k)` — the value of x on the row BEFORE this one in k-order. First row: NULL. `LEAD` mirrors it forward; last row: NULL.",
        "Second argument = offset: `LAG(rev, 12)` reads TWELVE positions back (the YoY fetch). Third argument = edge default: `LAG(rev, 1, 0)` hands 0 to the first row.",
        "The sort spec is the direction. `ORDER BY month DESC` makes LAG read FORWARD in time — the sign-flip trap. Partition keeps timelines private: `PARTITION BY customer_id ORDER BY created_at, id`.",
        "LAG/LEAD take NO frames — they are positional. Frames belong to aggregates and value functions.",
      ],
    },
    { kind: "h", text: "Deltas and growth" },
    {
      kind: "code",
      caption: "The growth line — delta and percent, NULL edge left honest",
      sql: `WITH m AS (
  SELECT SUBSTR(created_at, 1, 7) AS month, SUM(total) AS rev
  FROM orders GROUP BY month
)
SELECT month,
  ROUND(rev, 2) AS rev,
  ROUND(rev - LAG(rev) OVER (ORDER BY month), 2) AS delta,
  ROUND(100.0 * (rev - LAG(rev) OVER (ORDER BY month))
        / LAG(rev) OVER (ORDER BY month), 1) AS pct
FROM m ORDER BY month;   -- Feb 2024: -122.33 · -3.3% vs Jan`,
    },
    {
      kind: "bullets",
      items: [
        "The delta is THIS month minus the fetched PREVIOUS — `rev - LAG(rev) OVER w`, not the reverse.",
        "Percent growth divides by the LAG value; the first month stays NULL — no predecessor, no rate. Defaulting the denominator to 0 divides by zero; COALESCE the DISPLAY, not the math.",
        "Deltas of deltas (acceleration) need two stages: deltas in a CTE, LAG over the delta column in the next — one window pass per level.",
      ],
    },
    { kind: "h", text: "Timelines, gaps and streaks" },
    {
      kind: "code",
      caption: "Days since the customer's previous order",
      sql: `SELECT customer_id, created_at,
  CAST(julianday(created_at)
       - julianday(LAG(created_at) OVER (PARTITION BY customer_id
                                         ORDER BY created_at, id)) AS INTEGER) AS gap_days
FROM orders
ORDER BY customer_id, created_at, id;   -- NULL on their first order`,
    },
    {
      kind: "bullets",
      items: [
        "julianday converts ISO timestamps into day numbers — the subtraction becomes real arithmetic. Without it, text dates subtract unpredictably.",
        "The gap crossing a threshold (30, 60, 90 days) is reactivation logic; MAX(gap) per customer is the dormancy report; AVG(gap) is their rhythm.",
        "Streaks use LAG twice: once for the up/down flag, once inside the islands trick — consecutive qualifying rows share `calendar_index - qualifying_index`.",
      ],
    },
    {
      kind: "warn",
      text: "LAG without a tiebreaker on a tied sort key is arbitrary — two orders on the same day (2024-10-13 has three) make 'previous order' ambiguous. Bolt `id` onto the OVER's ORDER BY: `ORDER BY created_at, id`.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "LAG/LEAD arrived with windows in 3.25 — full offsets, defaults and partitions included. The WINDOW clause names shared specs: `WINDOW w AS (PARTITION BY customer_id ORDER BY created_at, id)`.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Identical semantics, plus LAG/LEAD on any orderable type and named-window reuse everywhere.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0 matches. Pre-8.0 emulates previous-row logic with correlated subqueries or session variables — both slower and harder to audit than one LAG.",
    },
    {
      kind: "tip",
      text: "Debug recipe: SELECT the key, the raw value, the LAG, and the delta — four columns, nothing else. The neighbor fetch is either right (the math is wrong) or wrong (the over-spec is wrong). One look tells you which layer to fix.",
    },
  ],
  mcqs: mcqBank("l60", MCQS),
  problems: probBank("l60", PROBS),
  takeaway:
    "LAG and LEAD move one decision — 'previous' or 'next at this position' — into the sort spec; defaults own the edges, partitions own the timelines, and deltas, gaps, streaks and YoY ladders are all that one fetch wearing different math.",
};
