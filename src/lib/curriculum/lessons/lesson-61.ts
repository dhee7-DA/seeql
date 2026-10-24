import type { Lesson } from "../types";
import { mcqBank, probBank } from "./banks/m10-util";
import { ROWS as MCQS } from "./banks/l61-mcqs";
import { ROWS as PROBS } from "./banks/l61-problems";

export const lesson61: Lesson = {
  id: "lesson-61",
  num: 61,
  title: "Windows VII — frames in full",
  blurb:
    "The frame clause is the third dial after partition and order: ROWS vs RANGE vs GROUPS, trailing and centered rollers, forward frames, the LAST_VALUE trap, and EXCLUDE — the dials that turn one window call into a rolling report",
  minutes: 18,
  blocks: [
    {
      kind: "p",
      text: "Every window call you've written so far used an invisible frame. `SUM(total) OVER (ORDER BY created_at)` silently means `RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW` — and that default is why running totals run, why same-timestamp rows batch together, and why LAST_VALUE lies to you. This lesson makes the frame explicit. Same storefront: 103 orders, 84 distinct days, and just enough same-day traffic (two triple-order days) to make ROWS versus RANGE a real decision.",
    },
    { kind: "h", text: "The three dial positions" },
    {
      kind: "table",
      headers: ["Frame unit", "Steps by", "Use when"],
      rows: [
        ["`ROWS`", "physical rows — ties step separately", "ledgers, rolling N-order metrics, fixed widths"],
        ["`RANGE`", "VALUE distance — ties move together", "calendar windows (7-day), tie-true running totals"],
        ["`GROUPS`", "peer groups — one distinct value = one step", "tie-atomic rolling logic"],
      ],
      caption: "RANGE is the default; ROWS is the ledger; GROUPS is the middle path",
    },
    {
      kind: "code",
      caption: "One spec, three units — watch the same-date triple post",
      sql: `SELECT id, created_at, total,
  ROUND(SUM(total) OVER (ORDER BY created_at, id
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS run_rows,
  ROUND(SUM(total) OVER (ORDER BY created_at
    RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW), 2) AS run_range
FROM orders
ORDER BY created_at, id;   -- identical EXCEPT on 2024-05-12 and 2024-10-13`,
    },
    {
      kind: "bullets",
      items: [
        "On 2024-10-13's three orders, `run_rows` posts each order separately; `run_range` hands all three the same day-closed total — neither is wrong, they answer different questions.",
        "Frame bounds: `UNBOUNDED PRECEDING`, `<n> PRECEDING`, `CURRENT ROW`, `<n> FOLLOWING`, `UNBOUNDED FOLLOWING` — `BETWEEN start AND end` where start may not trail end.",
        "One-bound shorthand `ROWS UNBOUNDED PRECEDING` means end = CURRENT ROW.",
      ],
    },
    { kind: "h", text: "The roller family" },
    {
      kind: "code",
      caption: "Trailing, centered, forward — three rolling reports in one query",
      sql: `WITH n AS (
  SELECT id, total, ROW_NUMBER() OVER (ORDER BY created_at, id) AS rn
  FROM orders
)
SELECT rn,
  ROUND(SUM(total) OVER (ORDER BY rn ROWS BETWEEN 6 PRECEDING
         AND CURRENT ROW), 2) AS roll7,
  ROUND(AVG(total) OVER (ORDER BY rn ROWS BETWEEN 1 PRECEDING
         AND 1 FOLLOWING), 2) AS ma3_centered,
  ROUND(SUM(total) OVER (ORDER BY rn ROWS BETWEEN CURRENT ROW
         AND 2 FOLLOWING), 2) AS next3
FROM n ORDER BY rn;`,
    },
    {
      kind: "bullets",
      items: [
        "Rolling over ORDERS uses ROWS; rolling over CALENDAR days needs a day spine — or `RANGE BETWEEN 6 PRECEDING AND CURRENT ROW` over `julianday(d)`, which measures real day distance and survives missing days.",
        "Frames clamp at partition edges: a 3-row frame on the first row averages ONE value. `COUNT(*)` over the same frame exposes the clamp.",
        "Forward frames (`CURRENT ROW AND n FOLLOWING`) build look-ahead columns — tomorrow's load, remaining revenue.",
      ],
    },
    { kind: "warn", text: "ROWS over a sparse day series silently stretches time: six orders spread over three weeks still fit one 7-ROW frame. When the metric is 'last 7 days', either build the day spine (module 8's recursive CTEs) or switch to a RANGE frame over julianday — the calendar is the contract." },
    { kind: "h", text: "Value functions and the LAST_VALUE trap" },
    {
      kind: "code",
      caption: "FIRST_VALUE is safe by default; LAST_VALUE needs the full frame",
      sql: `SELECT customer_id, created_at,
  FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS first_total,
  ROUND(LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), 2) AS latest_total
FROM orders
ORDER BY customer_id, created_at, id;`,
    },
    {
      kind: "bullets",
      items: [
        "The default frame ENDS at the current row — so `LAST_VALUE` with defaults returns the row's own value. Extend to `UNBOUNDED FOLLOWING` and it becomes the true stage end.",
        "`FIRST_VALUE` reads the frame START, and the default start is the partition's beginning — safe in the running frame.",
        "`NTH_VALUE(x, n)` is gated by the frame too: before the frame reaches position n, you get NULL.",
        "Value functions transport whole columns — champion names, day-zero baskets, stage closers ride along for free.",
      ],
    },
    { kind: "h", text: "EXCLUDE — subtracting from the frame" },
    {
      kind: "code",
      caption: "Everyone-but-me arithmetic",
      sql: `SELECT id, created_at,
  ROUND(SUM(total) OVER (PARTITION BY SUBSTR(created_at, 1, 10)
    ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
    EXCLUDE CURRENT ROW), 2) AS others_that_day
FROM orders
ORDER BY created_at, id;   -- the day's total minus this order`,
    },
    {
      kind: "bullets",
      items: [
        "`EXCLUDE CURRENT ROW` drops self; `EXCLUDE GROUP` drops self AND value-ties; `EXCLUDE TIES` drops just the peers; `EXCLUDE NO OTHERS` is the default.",
        "This is the 'total without me' column — peer benchmarks, leave-one-out averages — in one call instead of a self-join.",
        "Frames never filter rows: everything survives to the output; only what the aggregate SEES changes. Filtering stays in WHERE, numbering in ROW_NUMBER, seeing in frames.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite 3.28+ carries the full frame grammar: GROUPS units, all four EXCLUDE modes, and the WINDOW clause to name a framed spec once.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Identical grammar. Postgres additionally rejects `RANGE` with non-orderable keys at plan time — SQLite defers to runtime.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8.0 supports ROWS/RANGE frames but NOT the GROUPS unit or EXCLUDE — port those with LAG arithmetic or correlated logic.",
    },
    {
      kind: "tip",
      text: "Reading someone else's window query? Name the three dials out loud: what's the partition, what's the sort, what's the frame? Nine out of ten surprising window results are the third dial nobody wrote — because the default RANGE running frame was doing something subtler than they thought.",
    },
  ],
  mcqs: mcqBank("l61", MCQS),
  problems: probBank("l61", PROBS),
  takeaway:
    "Partition bounds the stage, ORDER BY sequences it, the frame slices it — spell the third dial and running, rolling, centered, forward and self-exclusive columns are all one window call with different bounds.",
  deep: [
    {
      kind: "mind",
      text: "The frame is the window's **third knob**: not \"which stage\" (partition) or \"which order\" (sort spec) but **which slice of the stage the aggregate sees per row**. The default frame — RANGE from UNBOUNDED PRECEDING to CURRENT ROW — is why ORDER BY'd SUM runs at all, and why it Betrays you twice: once by folding same-value peers (RANGE compares VALUES), once by making LAST_VALUE equal the current row (the frame ends WHERE YOU STAND). The full grammar — ROWS/RANGE/GROUPS, BETWEEN x PRECEDING AND y FOLLOWING, EXCLUDE — is one sentence pattern with a vocabulary. The bank-ledger vs day-batch distinction is the canonical example: ROWS posts row-by-row (each order separate), RANGE batches value-ties (same-day orders post together) — same query shape, one keyword apart, different money.",
    },
    {
      kind: "engine",
      title: "you run SUM(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)",
      steps: [
        "**Default frame check** — ORDER BY present, frame unspecified: RANGE UNBOUNDED PRECEDING → CURRENT ROW. On 84 distinct days carrying 103 orders, 19 same-day pairs fold — the \"running\" total jumps at date boundaries.",
        "**ROWS vs RANGE** — ROWS counts physical rows: each of the 103 posts separately (bank statement). RANGE includes all PEERS of the current sort value: same-day orders batch (daily settlement). One keyword, two ledgers.",
        "**The LAST_VALUE trap** — default frame ends at CURRENT ROW, so LAST_VALUE(total) = total: the function can only see to the frame's edge. ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING widens its view to the whole stage.",
        "**Rolling frames** — ROWS BETWEEN 6 PRECEDING AND CURRENT ROW is the 7-row roller; the current row is IN its own frame (off-by-one is the classic: 7 PRECEDING spans eight rows).",
      ],
    },
    {
      kind: "myth",
      myth: "\"ROWS and RANGE are interchangeable when there are no ties — why learn both?\"",
      truth: "There are **always ties eventually**: 84 days, 103 orders, 19 shared dates in this seed alone. The bug ships on the dataset you didn't test. ROWS is \"physical rows\", RANGE is \"value peers\" — learn both, default to explicit, and never trust \"no ties in my data\" as a frame strategy.",
    },
    {
      kind: "edge",
      items: [
        { c: "Frame without ORDER BY", r: "The default frame with NO sort spec is the whole partition — SUM OVER () sums everything. The frame knobs only exist relative to the timeline; no timeline, no slice." },
        { c: "RANGE with numeric offsets", r: "RANGE BETWEEN 7 PRECEDING … compares VALUES (7 units of the sort column, e.g. days), not rows — a rolling 7-DAY window on a date column. Legal, powerful, and utterly different from 7 ROWS." },
        { c: "EXCLUDE CURRENT ROW", r: "The frame grammar can exclude the current row — the \"everyone but me\" average (peer comparison without self-influence). Rarely needed, unforgettable once seen." },
        { c: "First/last aggregates", r: "FIRST_VALUE/LAST_VALUE are frame-scoped reads; NTH_VALUE needs the n-th row to exist INSIDE the frame. Early rows legitimately yield NULL — structural, not failure." },
      ],
    },  ],
};
