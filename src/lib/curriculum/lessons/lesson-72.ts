import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l72-mcqs";
import { ROWS as PROBS } from "./banks/l72-problems";

export const lesson72: Lesson = {
  id: "lesson-72",
  num: 72,
  title: "The metrics mart — from star to one-pager, gated",
  blurb:
    "The capstone: a metrics mart is a fact about facts — one row per quarter × department, materialized with its share columns, reconciled to the star by three quality gates (grain receipt, measure reconciliation, share sums), carrying margin, refund-adjusted net and the concentration line. Dashboards read it blind; the gates make that safe",
  minutes: 22,
  blocks: [
    {
      kind: "p",
      text: "The star is flexible; the board wants a **page**. A metrics mart is the warehouse's last layer: the specific sentences the business asks — quarter × department net with shares, margin, refund-adjusted bottom line, buyer concentration — **materialized** as a table the dashboards read blind. Flexibility costs a scan per question; the mart pays once at build time. The discipline that makes that safe is the same one this module has run since lesson 65: **declare the grain, derive deterministically, and gate the handoff** — three post-conditions every build must pass before it replaces the published table.",
    },
    { kind: "diagram", figure: "m14-mart-layers" },
    { kind: "h", text: "The build: the grammar, materialized" },
    {
      kind: "code",
      caption: "mart_department_quarter — lesson 68's grid, made durable",
      sql: `CREATE TABLE mart_department_quarter AS
SELECT dd.year, dd.quarter, d.department,
       SUM(f.net_cents) AS net_cents,          -- additive base, integer cents
       ROUND(SUM(f.net_cents) * 100.0
             / SUM(SUM(f.net_cents)) OVER (PARTITION BY dd.quarter), 1)
         AS share_of_quarter_pct               -- the share rides the grouped scan
FROM fact_sales f
JOIN dim_date dd ON dd.date_key = f.date_key
JOIN dim_product d ON d.product_key = f.product_key
WHERE dd.year = 2024
GROUP BY dd.year, dd.quarter, d.department;    -- grain: year × quarter × department (8 rows)`,
    },
    {
      kind: "bullets",
      items: [
        "**The grain sentence comes first**: 'one row per quarter × department, 2024.' Eight rows — provable, and the first gate checks exactly that.",
        "**Measures stay integer cents**; the share is a derived column. Dollars are a display conversion at read time — one ROUND at the edge, never mid-pipeline.",
        "**The build is a SELECT**: deterministic, re-runnable, and auditable — the same contract as the staging pipeline (lesson 70), one layer up.",
      ],
    },
    { kind: "h", text: "The three gates" },
    {
      kind: "table",
      caption: "The handoff contract — the build ships only when all three hold",
      headers: ["gate", "checks", "catches"],
      rows: [
        ["1 · grain", "mart rows (8) = distinct quarter×department pairs (8)", "fan-out, dropped cells, double-built quarters"],
        ["2 · reconciliation", "mart total net = fact total net (2024)", "a filter or join that silently ate rows"],
        ["3 · shares", "each quarter's shares sum to 100 ± 0.1", "the wrong parent — a partition that doesn't match the brief"],
      ],
    },
    {
      kind: "code",
      caption: "Gate 2 in SQL — the mart's bond to the star",
      sql: `SELECT
  (SELECT SUM(net_cents) FROM mart_department_quarter) AS mart_total_cents,
  (SELECT SUM(f.net_cents) FROM fact_sales f
     JOIN dim_date dd ON dd.date_key = f.date_key
     WHERE dd.year = 2024) AS fact_total_cents;
-- Equal, or the build doesn't replace the published table.`,
    },
    {
      kind: "bullets",
      items: [
        "**A failing gate never publishes.** The previous mart stays live until the build passes — stale-but-true beats fresh-and-wrong, and the dashboard never shows an error because it never sees a bad table.",
        "**Gates are post-conditions, not tests of faith**: each one is a SELECT the reviewer can run in five seconds, forever.",
      ],
    },
    { kind: "h", text: "The one-pager: two facts, one row per department" },
    {
      kind: "code",
      caption: "Net · margin · refunds · adjusted net · company share",
      sql: `WITH sales AS (
  SELECT d.department,
         SUM(f.net_cents) AS net_cents,
         SUM(f.net_cents - f.quantity * d.unit_cost_cents) AS margin_cents
  FROM fact_sales f JOIN dim_product d ON d.product_key = f.product_key
  GROUP BY d.department
),
refunds AS (
  SELECT d.department, SUM(r.refund_cents) AS refund_cents
  FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key
  GROUP BY d.department
)
SELECT s.department,
       ROUND(s.net_cents / 100.0, 2)    AS net_dollars,
       ROUND(s.margin_cents / 100.0, 2) AS margin_dollars,
       ROUND(COALESCE(r.refund_cents, 0) / 100.0, 2) AS refund_dollars,
       ROUND((s.net_cents - COALESCE(r.refund_cents, 0)) / 100.0, 2) AS adjusted_net_dollars,
       ROUND(s.net_cents * 100.0 / SUM(s.net_cents) OVER (), 1) AS share_of_company_pct
FROM sales s
LEFT JOIN refunds r ON r.department = s.department
ORDER BY s.net_cents DESC;`,
    },
    {
      kind: "warn",
      text: "The one fan-out left in the world: joining fact to fact. Tech's 227 sale lines × its 12 returns would price every refund twelve-fold — plausible numbers, no error, wrong money. The CTEs above exist precisely so the facts meet at the GRAIN (2 rows × 2 rows), never at the rows.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake materializes marts as tables maintained by TASKS + STREAMS (change-data-capture from the star), with MERGE for incremental refresh — the gates run as ASSERT-style checks inside the same task, aborting the swap on failure.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's materialized views auto-maintain simple aggregates, but shares and cross-fact adjustments need scheduled-query marts — where the gates become assertion queries in the same pipeline.",
    },
    {
      kind: "tip",
      text: "The analytics-engineering loop, whole: measure the source (69), clean with gates (70), model the star (65–67), read with the grammar (68), publish a mart whose gates bind the handoff (72). Every layer derived from the one below; every number countable at every layer.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A restaurant's pass, not its kitchen. The kitchen (the star) can cook anything — the grammar (68) is the chefs. The pass is where plates are FINISHED and checked: every dish matched to its ticket, sauces tasted, counts verified against the order — and nothing reaches the dining room that fails the check. The mart is the pass: pre-built, gated, and the only surface the dining room (dashboards) ever sees. Diners don't watch the sauté; they trust the pass. Gates are what make that trust earned instead of naive.",
    },
    {
      kind: "engine",
      title: "A mart refresh, end to end",
      steps: [
        "Trigger: nightly schedule (or a stream on the star's tables).",
        "Build: the grid SELECT runs into a staging mart table — never directly over the published one.",
        "Gates: grain receipt (8 = 8), reconciliation (mart cents = fact cents), share sums (100 ± 0.1 per quarter).",
        "Swap: only on green — the published table is replaced atomically; dashboards read either the old or the new, never a half-built one.",
        "Log: the gate outputs land in the build log — every published number has a receipt trail back through the star to the source.",
      ],
    },
    {
      kind: "myth",
      myth: "Marts are denormalized copies — a cache of the star.",
      truth:
        "A cache mirrors its source; a mart is a DIFFERENT grain with its own contract. The grid is not 'the fact, cached' — it's a new fact about quarters, with its own gates. That's why the mart can be trusted blind: its correctness was proven at build time, not assumed from inheritance.",
    },
    {
      kind: "myth",
      myth: "Gates are bureaucracy — the queries are obviously right.",
      truth:
        "Every fan-out bug in history ran a query that was 'obviously right'. Gates encode the reconciliation the reviewer would do by hand — count the rows, sum the money, check the shares — and run it on every build, forever, without getting tired.",
    },
    {
      kind: "edge",
      items: [
        { c: "A new department launches with zero sales in Q1.", r: "The grid only contains groups that EXIST — the new department is absent until it sells. If the one-pager must show it at $0.00, drive from dim_product (all 2 departments) with LEFT JOIN — the honest-zero pattern, decided by the brief and gated like everything else." },
        { c: "Two builds run concurrently (nightly + manual).", r: "Both build into their own staging tables; the gates judge each; the swap is atomic per build. Concurrent PUBLISH is serialized by the swap — last green build wins, and the log says which." },
        { c: "The business changes the share definition (share of H1, not quarter).", r: "New column, new gate, versioned alongside — the mart's columns carry their parent in the NAME (share_of_quarter_pct). Old columns deprecate on a schedule; silent redefinition is the unforgivable version." },
        { c: "The star re-loads mid-build.", r: "The build reads a snapshot (SQLite's transaction, or the engine's MVCC): the gates judge a CONSISTENT star. Two-phase builds — star version pinned, mart built, swapped — keep the receipt chain valid." },
        { c: "A gate fails at 2 a.m. Who sees it?", r: "The pipeline's owner — the gate's failure IS the alert (build aborted, previous mart still live, log line names the gate). Dashboards never see anything but green; that's the design working." },
      ],
    },
  ],
  mcqs: mcqBank("l72", MCQS),
  problems: probBankX("l72", PROBS),
  takeaway:
    "Declare the mart's grain, materialize the grammar's answers in integer cents, and gate the handoff — grain receipt, measure reconciliation, share sums — so dashboards read blind and every published number has a receipt chain back through the star to the source.",
};
