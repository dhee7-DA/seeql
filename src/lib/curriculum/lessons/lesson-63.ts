import type { Lesson } from "../types";
import { mcqBank, probBank } from "./banks/m10-util";
import { ROWS as MCQS } from "./banks/l63-mcqs";
import { ROWS as PROBS } from "./banks/l63-problems";

export const lesson63: Lesson = {
  id: "lesson-63",
  num: 63,
  title: "Windows IX — the pattern library",
  blurb:
    "The capstone: gaps-and-islands, 30-day sessionization, dedupe-then-analyze pipelines, YoY ladders with honest NULLs, and the mixed board that combines rank, frames, offsets and shares in one named pipeline",
  minutes: 18,
  blocks: [
    {
      kind: "p",
      text: "Every lesson in this module added a dial. This one assembles them into the patterns real analysts ship: consecutive-run detection, sessionization, dedupe pipelines, year-over-year ladders and the multi-lens board. The storefront stays honest — 14 months, 16 customers, real same-day triples and real 30-day silences to find. The skill being drilled is not syntax; it's decomposing a business question into window stages and naming each one.",
    },
    { kind: "h", text: "Gaps & islands — the two-numbering trick" },
    {
      kind: "code",
      caption: "Consecutive months with 8+ orders — detect, group, report",
      sql: `WITH m AS (
  SELECT SUBSTR(created_at, 1, 7) AS month,
         ROW_NUMBER() OVER (ORDER BY month) AS mno,
         COUNT(*) AS n
  FROM orders GROUP BY month
), q AS (
  SELECT month, mno,
         mno - ROW_NUMBER() OVER (ORDER BY mno) AS island
  FROM m WHERE n >= 8
)
SELECT MIN(month) AS run_start, MAX(month) AS run_end, COUNT(*) AS n_months
FROM q GROUP BY island ORDER BY run_start;`,
    },
    {
      kind: "bullets",
      items: [
        "Calendar position minus qualifying position stays EQUAL while runs are unbroken; every gap bumps the qualifying number and starts a new island.",
        "The threshold (`n >= 8`) and the unit (month) must agree — mixing day thresholds with month units is the classic islands bug.",
        "Island reports then aggregate: MIN start, MAX end, COUNT length — or feed islands into session metrics.",
      ],
    },
    { kind: "h", text: "Sessionization — flag, then cumulative-sum" },
    {
      kind: "code",
      caption: "30-day sessions per customer, numbered by the running SUM of flags",
      sql: `WITH g AS (
  SELECT customer_id, created_at,
    CASE WHEN julianday(created_at) - julianday(LAG(created_at) OVER
           (PARTITION BY customer_id ORDER BY created_at, id)) >= 30
          OR LAG(created_at) OVER (PARTITION BY customer_id
                                   ORDER BY created_at, id) IS NULL
         THEN 1 ELSE 0 END AS new_session
  FROM orders
)
SELECT customer_id, created_at,
  SUM(new_session) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS session_no
FROM g ORDER BY customer_id, created_at, id;   -- session ids self-number`,
    },
    {
      kind: "warn",
      text: "The first order has no predecessor — its LAG is NULL. Handle the edge explicitly (the OR IS NULL flag above) or the customer's first session gets misnumbered. Every sessionization query is two bugs deep: the threshold and the first-row edge.",
    },
    { kind: "h", text: "Dedupe-then-analyze" },
    {
      kind: "bullets",
      items: [
        "Windows in one SELECT share the same input rows — a dedupe (rn = 1) and a rank in the same level would rank the DIRTY rows.",
        "The pipeline: CTE 1 picks the canonical rows (latest per key, lowest id per duplicate group), CTE 2 aggregates or ranks the CLEANED set.",
        "Same for year-over-year: the LAG needs last year's rows alive — filter 2025 AFTER the window, never inside the rollup.",
      ],
    },
    { kind: "diagram", figure: "l63-dedupe-rn" },
    { kind: "h", text: "The mixed board" },
    {
      kind: "code",
      caption: "Revenue, delta, rolling average, new buyers, returning share — one pipeline",
      sql: `WITH f AS (
  SELECT SUBSTR(created_at, 1, 7) AS month, total,
    CASE WHEN LAG(created_at) OVER (PARTITION BY customer_id
                                    ORDER BY created_at, id) IS NULL
         THEN 0 ELSE 1 END AS ret
  FROM orders
), a AS (
  SELECT month, SUM(total) AS rev, SUM(total * ret) AS rev_ret, SUM(1 - ret) AS new_b
  FROM f GROUP BY month
), w AS (
  SELECT month, rev,
    rev - LAG(rev) OVER (ORDER BY month) AS delta,
    AVG(rev) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS ma3
  FROM a
)
SELECT w.month, ROUND(w.rev, 2) AS rev, ROUND(w.delta, 2) AS delta,
  ROUND(w.ma3, 2) AS ma3, a.new_b AS new_buyers,
  ROUND(100.0 * a.rev_ret / a.rev, 2) AS return_share
FROM w JOIN a ON a.month = w.month ORDER BY w.month;`,
    },
    {
      kind: "bullets",
      items: [
        "Stage 1 flags per-order facts (debut or returning); stage 2 rolls them up; stage 3 windows the rollup. One window pass per level, names end to end.",
        "Know when NOT to window: 'active all 14 months' is `HAVING COUNT(DISTINCT month) = 14`; 'orders per active day' is a grouped ratio. Sets get GROUP BY; sequences get windows.",
        "Pipelines carry invariants: the running total's last value must equal the grand total. If it doesn't, a frame or a filter is lying.",
      ],
    },
    { kind: "diagram", figure: "l63-pattern-map" },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Everything in this lesson runs on stock SQLite 3.25+ — islands, sessions, YoY ladders, all of it. No extensions, no stored procedures.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres ports as-is and can shrink pipelines with PERCENTILE_CONT and window functions in CTEs materialized once.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0 ports as-is; the day-spine (for missing days) prefers a recursive CTE just like module 8's spelling.",
    },
    {
      kind: "tip",
      text: "Code review question for any window pipeline: 'what's the partition, what's the sort, where does each filter live?' If the author can answer all three per stage, the pipeline is correct — everything else is style.",
    },
  ],
  mcqs: mcqBank("l63", MCQS),
  problems: probBank("l63", PROBS),
  takeaway:
    "The pattern library is six moves — scope, rank, offset, frame, distribute, compose — arranged into islands, sessions, dedupes, ladders and boards. Name every stage, honor the edges, and know when plain GROUP BY beats a window.",
  deep: [
    {
      kind: "mind",
      text: "The pattern library is where the family becomes **analysis**: gaps-and-islands (turn \"consecutive\" into a groupable id: global row number minus within-group row number is constant per run), sessionization (a gap threshold flags session starts; the running sum of flags is the session id), YoY ladders (LAG partitioned by year over the month spine), and the mixed board where stages stack: fold, sequence, then compare. The unifying habit: **decompose the pattern into window primitives** — every \"hard\" analysis here is two or three of the family's tools in a row, each in its own CTE layer, each auditable. If a pattern feels un-writable, the decomposition is wrong — no pattern in this lesson needs a correlated subquery or a cursor.",
    },
    {
      kind: "engine",
      title: "you run the gaps-and-islands decomposition over order days",
      steps: [
        "**Sequence globally** — DISTINCT order days, numbered by ROW_NUMBER: rn assigns each day its global position (84 days in the seed).",
        "**Sequence within group** — for each status-run (or any grouping key), a second ROW_NUMBER partitions and numbers within the run.",
        "**The island id** — rn_global − rn_local is CONSTANT inside a run and changes at every gap: the arithmetic trick that turns \"consecutive-ness\" into a GROUP BY key.",
        "**Fold the islands** — GROUP BY the island id: per-run MIN/MAX/COUNT answers \"how long was the streak, when did it start\" — the analysis falls out of the id, not from more windowing.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Gaps-and-islands needs a procedural loop — check each row against the previous, start a new group when it breaks.\"",
      truth: "That loop, written as a cursor, is the pre-window idiom — and it's slower, unparallelizable, and stateful. The two-row-number subtraction IS the loop, unfolded: the engine does the walk in one sort-plus-pass, and the \"state\" is just the difference of two sequences.",
    },
    {
      kind: "edge",
      items: [
        { c: "Sessionization threshold semantics", r: "\"Gap > 30 min starts a session\" vs \"≥ 30\": exactly-30-minute gaps are the contract edge — write the comparison deliberately and test it with a synthetic exactly-at-threshold pair." },
        { c: "YoY with sparse months", r: "LAG(revenue, 12) over OBSERVED months pairs this June with the 12th PRIOR OBSERVED month — not last June. The month spine (lesson 49) plus PARTITION BY year keeps the calendar honest." },
        { c: "Islands on ties", r: "Two same-status rows sharing a timestamp: the id tiebreak inside BOTH row numbers keeps the island walk deterministic. Tiebreaks are load-bearing in every pattern here." },
        { c: "Mixed-grain boards", r: "The final board mixes order-grain stamps with month-grain ladders: stage each grain in its own CTE, join on the shared key. One query, two grains, no fan-out — the course's grain discipline, now in window form." },
      ],
    },  ],
};
