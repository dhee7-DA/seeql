import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l71-mcqs";
import { ROWS as PROBS } from "./banks/l71-problems";

export const lesson71: Lesson = {
  id: "lesson-71",
  num: 71,
  title: "Conformed dimensions — two facts, one vocabulary",
  blurb:
    "A warehouse with one fact is a report; a warehouse with two is a model. fact_returns (14 refunds, $1,083.11) joins the SAME four dimensions fact_sales uses — so return rates, refund-adjusted net and lineage probes all read one vocabulary. The bus matrix drawn in tables, and the fact-to-fantastic fan-out trap that makes direct fact-fact joins the cardinal sin",
  minutes: 18,
  blocks: [
    {
      kind: "p",
      text: "Everything so far read ONE fact. The warehouse earns its name when facts **share dimensions**: `fact_returns` — 14 refund events, $1,083.11 — lands beside `fact_sales`, and every key it carries (`date_key`, `customer_key`, `product_key`, `store_key`) points into the **same** dimension tables. That sharing has a name (Kimball's **conformed dimensions**) and a payoff: 'return rate by department', 'refund-adjusted net', 'returns by region at return time' — all one join away, all using the same definition of Tech, region and month that sales uses.",
    },
    { kind: "h", text: "The second fact, and its lineage" },
    {
      kind: "code",
      caption: "fact_returns — keys + measure + one lineage pointer",
      sql: `SELECT id, sales_line_id,          -- lineage: WHICH sold line came back
       date_key, customer_key, product_key, store_key,
       quantity,                       -- 1 on every row in this seed
       refund_cents                    -- the money that walked out
FROM fact_returns LIMIT 3;
-- 14 rows; every sales_line_id resolves into fact_sales; every dim key resolves.`,
    },
    {
      kind: "bullets",
      items: [
        "**`sales_line_id` is the degenerate bridge** — fact-to-fact lineage BY the fact's own id. 'Which sale was returned?' is one probe; no business-key re-derivation, no guessing across orders.",
        "**The return re-resolves the customer.** Its `customer_key` was chosen at RETURN date — a buyer who moved between sale and return refunds under the new region. Two events, two as-of truths, both pre-resolved at load.",
        "**Same dims, same grammar.** Returns by month, by store, by department: every move from lesson 68 applies unchanged — the grammar reads facts, and this is a fact.",
      ],
    },
    { kind: "h", text: "Two facts, one query — the conformed join" },
    {
      kind: "code",
      caption: "Net AND refunds per department — aggregate each fact, join the AGGREGATES",
      sql: `WITH sales AS (
  SELECT d.department, SUM(f.net_cents) AS net_cents   -- fact 1, aggregated
  FROM fact_sales f JOIN dim_product d ON d.product_key = f.product_key
  GROUP BY d.department
),
refunds AS (
  SELECT d.department, SUM(r.refund_cents) AS refund_cents  -- fact 2, aggregated
  FROM fact_returns r JOIN dim_product d ON d.product_key = r.product_key
  GROUP BY d.department
)
SELECT s.department,
       ROUND(s.net_cents / 100.0, 2) AS net_dollars,
       ROUND(COALESCE(r.refund_cents, 0) / 100.0, 2) AS refund_dollars
FROM sales s
LEFT JOIN refunds r ON r.department = s.department      -- 2 rows join 2 rows
ORDER BY s.net_cents DESC;
-- Tech      30,702.42 | 984.88
-- Lifestyle  2,532.24 |  98.23`,
    },
    {
      kind: "warn",
      text: "The cardinal sin is joining fact to fact directly: `fact_sales JOIN fact_returns ON product_key` multiplies 239 sales lines by every return of the same product — double-counted money in both directions, plausible-looking totals, no error anywhere. The pattern is always: **aggregate each fact separately, join the aggregates** (or window over one fact with the other as a subquery).",
    },
    {
      kind: "bullets",
      items: [
        "**The LEFT JOIN direction matters**: sales drives, refunds ride — a department with zero returns still shows its net, with COALESCE making the zero honest rather than absent.",
        "**The return rate is the conformance dividend**: returned lines ÷ sold lines per department needs BOTH facts through dim_product — computable only because the vocabulary is shared.",
        "**The bus matrix is real**: four dims × two facts, every cell filled. A third fact (shipments, say) joins by reusing the same columns — the matrix grows a row, never a new vocabulary.",
      ],
    },
    { kind: "diagram", figure: "m14-conformed-bus" },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake warehouses commonly enforce conformance with shared dimension tables in a dedicated schema and views per business area — the bus matrix becomes access control. MERGE loads keep each fact's keys pointing at the same dim rows.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's cost model makes conformance pay visibly: one dim table scanned by many queries caches better than per-fact copies, and columnar billing rewards the star's narrow scans.",
    },
    {
      kind: "tip",
      text: "The reviewer's conformance check: pick any two facts and ask (1) do their keys point at the same dim TABLES, (2) does each fact's as-of resolution happen at ITS OWN event date, (3) do any queries join fact to fact directly? Three questions, most of the warehouse's integrity.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "Two hospitals sharing one dictionary. Each hospital (fact) sees different events — births here, surgeries there — but both write 'cardiology' in the SAME ICD codebook, both date-stamp with the SAME calendar, both file patients under the SAME registry. The moment one hospital invents its own 'cardio' spelling, cross-hospital statistics die quietly: each report is fine, the comparison is fiction. Conformed dimensions are the codebook: boring, central, and the only reason two facts can hold one conversation.",
    },
    {
      kind: "engine",
      title: "How the net-vs-refund grid executes (and why the shape matters)",
      steps: [
        "The WRONG shape first: fact_sales LEFT JOIN fact_returns ON product_key matches every sale line against every return of the same product — Tech's 227 lines × its returns inflate each refund by the product's sale-line count. Plausible totals, zero errors, wrong money.",
        "The RIGHT shape: two aggregates. sales CTE collapses 239 lines to 2 department rows; refunds CTE collapses 14 returns to (at most) 2 rows.",
        "The join is now 2 × 2 — LEFT from sales so a zero-return department survives as an honest $0.00 (COALESCE fills it).",
        "ORDER BY net reads the margin picture; the refund column prices the pain.",
        "The grammar never changed — the star grew a second spoke set, and the discipline is: aggregate facts separately, join aggregates, never fact rows.",
      ],
    },
    {
      kind: "myth",
      myth: "Conformance means one big unified fact table.",
      truth:
        "The opposite: MANY facts at their OWN grains (order line, return event, shipment leg), held together by shared dimensions. One big fact would need NULL columns for every event type's measures and would re-fight the grain war daily. Facts stay separate and honest; the DIMENSIONS do the unifying.",
    },
    {
      kind: "myth",
      myth: "A return should UPDATE the sales fact (flag the line returned).",
      truth:
        "That's the wide-table slide again: mutating facts to carry another event's state. The return is its own fact with its own grain; the sales_line_id bridge answers lineage. UPDATE-able facts break the rebuild-from-raw contract every pipeline depends on.",
    },
    {
      kind: "edge",
      items: [
        { c: "A product's department changes (Type 1). Do historical refunds re-department?", r: "Yes — dim_product is present-tense here. Both facts re-slice together, which is exactly the conformance promise: one definition, even when it moves. If history must freeze, the dim itself goes Type 2 (lesson 67) and BOTH facts' keys keep working unchanged." },
        { c: "A return references a sale that was never loaded (cancelled-order edge).", r: "The lineage probe reads non-zero — that's a load-order bug, not a data bug. Fact loads have an order: sales before returns, always. The probe is the gate that catches violations." },
        { c: "Can a fact share SOME dims and not others?", r: "Yes — partial conformance is normal (a marketing fact may share date+customer but carry its own campaign dim). The bus matrix records exactly which cells exist; empty cells are honest, forked definitions are not." },
        { c: "Refund per UNIT vs per LINE — this seed's quantity is always 1.", r: "Deliberate: the teaching contract stays additive. Real returns carry partial quantities; the measure becomes refund_cents summed over returned units, and 'rate' questions move to quantity ratios — same grammar, heavier arithmetic." },
        { c: "Why not one 'events' fact with an event_type column?", r: "The measures don't unify (net_cents vs refund_cents vs shipping_cost) and the grain fights (order lines vs return events). Type-discriminated mega-facts are the OOP inheritance trap in SQL clothing — separate facts, shared dims, wins." },
      ],
    },
  ],
  mcqs: mcqBank("l71", MCQS),
  problems: probBankX("l71", PROBS),
  takeaway:
    "Conformed dimensions = one definition, many facts: fact_returns shares all four dims (re-resolving the customer at ITS event date), lineage rides sales_line_id, cross-fact analysis aggregates-then-joins (never fact-to-fact), and the bus matrix is the warehouse's contract drawn in four columns.",
};
