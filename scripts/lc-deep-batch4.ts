// Deep-layer batch 4: lessons 52-57 (M9 SQL for Finance).
import { readFileSync, writeFileSync } from "node:fs";

const D = (n: number, deep: string) => {
  const path = `src/lib/curriculum/lessons/lesson-${String(n).padStart(2, "0")}.ts`;
  let src = readFileSync(path, "utf8");
  if (src.includes("\n  deep: [")) {
    console.log(`skip lesson-${n}`);
    return;
  }
  const tail = src.lastIndexOf("};");
  src = src.slice(0, tail).replace(/,\s*$/, ",\n") + `  deep: [\n${deep}  ],\n` + src.slice(tail);
  writeFileSync(path, src);
  console.log(`ok lesson-${n}`);
};

// ---------------- Lesson 52 — The books ----------------
D(52, `    {
      kind: "mind",
      text: "The books are a **second schema wearing accounting rules**: invoices (what we billed), payments (what arrived), expenses (what went out), ledger_entries (the double-entry spine). The one engineering decision that makes it finance-grade: **money is INTEGER cents**. Binary floats cannot represent 0.1 exactly, so float money drifts — a few cents here, a rounding reversal there — and reconciliation dies quietly. amount_cents is 128450, not 1284.50: addition is exact, joins are exact, audits are exact, and the $ formatting happens once, at the presentation edge. The other discipline is that every table has a DATE OF RECORD (issued_on, paid_on, spent_on) separate from any operational status — revenue recognition and cash arrival are different events on different days.",
    },
    {
      kind: "engine",
      title: "you run SELECT i.number, i.amount_cents, COALESCE(SUM(p.amount_cents), 0) AS paid FROM invoices i LEFT JOIN payments p ON p.invoice_id = i.id GROUP BY i.id",
      steps: [
        "**Population first** — invoices drive the report: LEFT JOIN keeps all 27 billing records (21 paid, 6 open), even those no payment has touched.",
        "**Exact accumulation** — SUM over INTEGER cents: no float drift, ever. The COALESCE wrapper turns the unpaid invoice's NULL into 0 — arithmetic's NULL guard.",
        "**Status is derived** — 'open' vs 'paid' is computed from paid-vs-billed (or stored and reconciled against the payments join — the lesson's drill does exactly this cross-check).",
        "**Presentation edge** — divide by 100.0 ONCE, at the outermost SELECT. Formatting inside the aggregation layer is how units get mixed and cents get double-counted.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Money is a decimal number — REAL/DOUBLE is fine for amounts.\\"",
      truth: "IEEE-754 floats store binary fractions: 0.1 is a repeating expansion, and sums of \\"clean\\" cents come out as 69611.99999….INTEGER cents make every add exact by construction. The universal rule of money in databases: integers until the display layer.",
    },
    {
      kind: "edge",
      items: [
        { c: "Rounding in the middle", r: "ROUND(paid/100, 2) per payment THEN summing introduces per-row drift that never reconciles. Round once, at the end, from exact cents." },
        { c: "Overpayments", r: "SUM(paid) > amount_cents for one invoice: the LEFT JOIN + comparison surfaces it — credit balances are findings, not noise." },
        { c: "Date of record vs arrival", r: "JOIN payments ON invoice and filter paid_on's month: you report CASH months. Filter issued_on: BILLING months. Both are right; mixing them in one query is not." },
        { c: "The invoice with no payments", r: "INNER JOIN silently drops unpaid invoices — the 6 open ones vanish from \\"total billed\\". The population you're studying decides LEFT vs INNER, again." },
      ],
    },`);

// ---------------- Lesson 53 — Running balances ----------------
D(53, `    {
      kind: "mind",
      text: "An account statement is **time plus accumulation**: rows in chronological order, each carrying the balance after its event. The window form — SUM(amount) OVER (PARTITION BY account ORDER BY entry_date, id) — is the whole trick: partition is the account boundary, order is the timeline, and the ORDER-BY'd SUM becomes the snowball. Two details separate a toy from a bank-grade statement: the **tiebreak** (same-day entries post in id order; without it the statement re-shuffles between runs) and the **sign discipline** (debits and credits as signed values, or a CASE that signs them — mixing unsigned columns with subtraction logic mid-window is where balances go wrong). The seed's ledger carries 80 entries; the walk should reconcile to the raw SUM exactly — equality is the receipt.",
    },
    {
      kind: "engine",
      title: "you run SELECT entry_date, account, debit_cents - credit_cents, SUM(debit_cents - credit_cents) OVER (PARTITION BY account ORDER BY entry_date, id) AS balance FROM ledger_entries",
      steps: [
        "**Sign per row** — the signed delta (debit − credit) normalizes the two-column ledger into one additive stream. Positive = owed grows; negative = payment lands.",
        "**Stage + timeline** — PARTITION BY account isolates each account's walk; ORDER BY entry_date, id fixes same-day posting order deterministically.",
        "**Implicit frame** — ORDER BY inside OVER defaults the frame to 'start through current row': the running balance. The engine accumulates in one sort plus one pass — no self-join.",
        "**Reconcile** — final row's balance must equal SUM(delta) over the whole account. It always will, mathematically — the check is that YOUR delta expression matches the business's signing convention.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Running balance needs a cursor or application code — SQL can't keep state row to row.\\"",
      truth: "The window IS the state: the frame 'preceding through current' encodes everything accumulated so far. The pre-window idiom (correlated subquery summing all prior rows) computes the same thing at O(n²); ORDER-BY'd SUM is O(n log n) and reads like the statement it produces.",
    },
    {
      kind: "edge",
      items: [
        { c: "Same-timestamp events", r: "Opening and closing entry on one date: without the id tiebreak, their post-order is arbitrary and the EOD balance can differ run to run. (date, id) is the deterministic spine." },
        { c: "Reverse signing", r: "If the ledger stores credits as negatives already, debit - credit double-negates. Read the schema's convention FIRST — the walk is trivial; the sign contract is the exam." },
        { c: "Multi-account walk", r: "Forget the PARTITION and one account's balance opens with another's history. The partition is the wall between wallets." },
        { c: "Backdated entries", r: "An entry inserted with an OLD date lands mid-walk — every later balance shifts. That's correct double-entry behavior, but any cached statement is now stale: statements are derived, never stored." },
      ],
    },`);

// ---------------- Lesson 54 — AR aging ----------------
D(54, `    {
      kind: "mind",
      text: "AR aging is the **collections prioritizer**: for every open invoice, how many days past due, bucketed into the ladder 0 / 1–30 / 31–60 / 61–90 / 90+. Two moves build it: the day count (julianday(today) − julianday(due_on), truncated to INTEGER — an invoice due tomorrow is NEGATIVE days, not zero) and the CASE ladder whose rungs are ordered least-first so each inherits the earlier bounds (CASE stops at the first true test — the ladder is cumulative by construction). The 6 open invoices in the seed become the collections call sheet; everyone else's money is already in the door. The aging report is where SQL meets cash flow directly: which bucket sums to how much decides who gets called first.",
    },
    {
      kind: "engine",
      title: "you run the aging ladder over open invoices",
      steps: [
        "**Population** — WHERE status = 'open': 6 invoices. Aging runs on OPEN money only; paid invoices would all be ≤ 0 days and drown the signal.",
        "**Day math** — julianday('2025-03-15') − julianday(due_on) is exact float days; CAST to INTEGER truncates toward zero — 2.9 days late becomes 2, and future dues go negative.",
        "**Ladder** — CASE WHEN days <= 0 THEN 'current' WHEN <= 30 THEN '1-30' … the first true rung wins; each later rung implicitly assumes all earlier failed. Order of rungs IS the logic.",
        "**The pivot** — SUM by bucket (CASE per bucket or the lesson's GROUP BY) turns the call sheet into the exposure table: dollars at risk per lateness tier, the shape credit teams actually read.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Days late = today − due_date, rounded.\\"",
      truth: "Rounding is the wrong verb: an invoice 0.9 days late is CURRENT, not 1 day. **Truncate toward zero** so partial days don't graduate buckets early — and note that due-TOMORROW is negative days, which the ≤ 0 first rung must catch as 'current', not leak into '1-30'.",
    },
    {
      kind: "edge",
      items: [
        { c: "The 'as of' date", r: "Hard-code it ('2025-03-15' in the drills) or parameterize it — but NEVER use date('now'): the report must be reproducible; a moving today makes two runs disagree and audits impossible." },
        { c: "Paid-but-reopened", r: "A payment that arrives then a refund issued: status flips back. Aging trusts status — if the status pipeline lags, the ladder lies. Reconcile status vs payments like lesson 52 taught." },
        { c: "Ladder gaps", r: "WHEN days <= 30 / WHEN days <= 90 with no 31-60 rung silently folds 40-day invoices into '90+' heirs... no wait, into the 90 rung. Every gap in the ladder is a bucket that steals from its neighbors — rung order and completeness both matter." },
        { c: "Negative days in the report", r: "'Current' should INCLUDE future-due invoices: the ≤ 0 rung catches negatives. Filter days >= 0 and you evict not-yet-due money from the exposure table — a quiet understatement." },
      ],
    },`);

// ---------------- Lesson 55 — MoM growth ----------------
D(55, `    {
      kind: "mind",
      text: "Month-over-month growth is **a delta wearing percentages**: LAG hands you last month's revenue on this month's row, and the growth expression is (this − last) / last × 100. The fraction is where honesty lives: the FIRST month has no previous — LAG yields NULL, the growth is NULL, and that NULL is the correct answer (\\"no basis for comparison\\"), not a bug to COALESCE into fake zeros. Percent-vs-absolute is the other judgment: +$200 on a $500 month is +40% and on a $37,000 base is +0.5% — same dollars, different story. The seed's 14 months include the $3,731.97 peak of 2024-01; the growth curve around it is exactly the kind of narrative stakeholders actually read.",
    },
    {
      kind: "engine",
      title: "you run the MoM growth over monthly revenue",
      steps: [
        "**Fold to months** — GROUP BY SUBSTR(created_at,1,7): 103 orders → 14 revenue rows. The growth layer only makes sense on this staged grain.",
        "**Pair via LAG** — LAG(revenue) OVER (ORDER BY month): each row now carries its predecessor. The window's order is the timeline — same discipline as lesson 32's snowballs.",
        "**Delta and ratio** — revenue − prev is exact (integer-free floats but deterministic); dividing by prev needs the NULL guard for month one: NULLIF(prev, 0) prevents divide-by-zero on empty months too.",
        "**Read the curve** — 13 non-NULL growth values. The first month's NULL is structural: a 14-month series yields 13 growth points. Any report showing 14 is lying somewhere.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"Growth = this month − last month. The percentage is decoration.\\"",
      truth: "The percentage is the **story**, the absolute is the scale: −$1,200 from a $1,400 base is a collapse; −$1,200 on $37,000 is noise. Reports that show only one of the two systematically mislead — show both, or know exactly which question you're answering.",
    },
    {
      kind: "edge",
      items: [
        { c: "Divide by zero months", r: "A month with $0 revenue makes growth undefined: NULLIF(last, 0) returns NULL instead of erroring. An empty month is a finding; a crashed query is not." },
        { c: "The missing-month problem", r: "LAG over the OBSERVED months pairs June against July if May had no sales — the timeline must be the month SPINE (lesson 49's recursion), not the months that happened to have data." },
        { c: "Partial first/last months", r: "If the data starts mid-January, January's revenue is structurally low and its growth garbage. Trim partial edge months or annotate them — honest series have honest edges." },
        { c: "Moving-average antidote", r: "One big month whipsaws the growth curve; AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) smooths it — the lesson's antidote pairing." },
      ],
    },`);

// ---------------- Lesson 56 — Reconciliation ----------------
D(56, `    {
      kind: "mind",
      text: "Double-entry reconciliation is the **virus scan of the books**: every event posts equal debits and credits, so total debits − total credits must be exactly zero, and any sub-ledger's net must tie to the control account. The seed's 80 ledger entries should reconcile — the lesson deliberately plants a ghost payment and a refund owed so the drill finds REAL mismatches, not textbook ones. The SQL shape is group-and-compare: per account (or per document), SUM(debits) vs SUM(credits) vs the upstream source (invoice total, payment total), then a HAVING or WHERE that keeps only the disagreements. Reconciliation queries are the rare reports where the empty result is the goal — you build the query hoping it returns nothing, forever.",
    },
    {
      kind: "engine",
      title: "you run the per-invoice paid-vs-billed reconciliation",
      steps: [
        "**Two-sided staging** — one CTE sums billed (invoices), one sums paid (payments), keyed on the document. Both folds must be at the SAME grain: per invoice.",
        "**Full-outer shape** — LEFT JOIN from billed keeps unbilled-for payments invisible... which is why the lesson joins both directions (or uses FULL OUTER): the ghost payment exists in payments but has no invoice row — only a right-preserving shape can see it.",
        "**Diff and filter** — computed delta = billed − paid; WHERE delta ≠ 0 (or paid > billed, owed < 0) keeps only disagreements. The healthy books make this empty.",
        "**Verdict** — each surviving row IS a finding: the ghost payment (paid, no invoice) and the refund owed (billed, overpaid). Findings get IDs attached — reconciliation output is an action list, not a dashboard.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"If the books balance in total, they're right — the grand total tie is the audit.\\"",
      truth: "Total debits = total credits is **necessary, nowhere near sufficient**: two wrong entries that cancel still tie globally. The audit power is in the SUB-ledger ties — per invoice, per account, per month — where compensating errors can't hide behind each other.",
    },
    {
      kind: "edge",
      items: [
        { c: "The ghost payment", r: "A payment whose invoice_id points at nothing (or whose invoice was deleted): only the payment-side-preserving join sees it. INNER-join reconciliations are structurally blind to one-sided errors." },
        { c: "Refund as negative", r: "Refunds post as negative payments or reverse entries. SUM handles either — but a naive SUM(paid) > billed test flags legitimate refunds as overpayments. Know the sign convention before the query." },
        { c: "Timing boundaries", r: "An invoice issued Mar 31, paid Apr 2: monthly reconciliation must define the cutoff (cash-basis vs accrual). Both are defensible; running one and reporting the other is not." },
        { c: "Float creeping in", r: "One REAL column in a cents world re-drifts the whole reconciliation. The diff ≠ 0 test on floats needs epsilon gymnastics; on INTEGER cents it's exact. Representation is the audit's foundation." },
      ],
    },`);

// ---------------- Lesson 57 — Windows III ----------------
D(57, `    {
      kind: "mind",
      text: "The advanced window tier answers **\\"where do I stand in the distribution?\\"** — not ranked 1..n, but positioned on a 0-to-1 curve. CUME_DIST gives the share of rows at-or-below you (denominator: n, the whole stage); PERCENT_RANK gives (rank−1)/(n−1), the cheapest row sitting at exactly 0. From the curve, statistics fall out: the median is the 0.5 crossing, quartiles are the 0.25/0.75 crossings, and a z-score — (x − mean) / stddev — turns \\"August looks big\\" into \\"August is 3.3 sigma out\\", a sentence a risk committee can act on. The tier's habit of mind: raw rank is for leaderboards, distribution position is for \\"is this NORMAL?\\" — and the second question is where finance lives.",
    },
    {
      kind: "engine",
      title: "you run SELECT id, total, ROUND(100.0 * CUME_DIST() OVER (ORDER BY total), 1) AS pctile FROM orders",
      steps: [
        "**Order the stage** — the curve needs the sort spec: totals ascending. Ties share one curve point (peers included — at-or-below counts them together).",
        "**Curve math** — CUME_DIST = rows at-or-below ÷ n. The maximum row hits exactly 1.0; the minimum sits at (count of its ties) ÷ n — ABOVE zero, unlike PERCENT_RANK's 0.0 floor.",
        "**The crossings** — WHERE the curve crosses 0.5 is the median of the 103 totals (from the row just past halfway); 0.25/0.75 crossings give quartiles without NTILE's equal-count forcing.",
        "**Z-scores** — AVG and a hand-rolled stddev (the sqrt of AVG(x²) − mean²) as window columns, then (total − mean) / stddev per row. |z| > 3 is the outlier flag the lesson hunts for.",
      ],
    },
    {
      kind: "myth",
      myth: "\\"CUME_DIST and PERCENT_RANK are the same curve shifted a little — pick either.\\"",
      truth: "They answer different questions with different denominators: CUME_DIST = **at-or-below share (÷ n)**, starts above 0, hits exactly 1; PERCENT_RANK = **rank fraction (÷ n−1)**, starts at exactly 0, tops out below 1. Median-hunting via \\"the 0.5 crossing\\" gives different rows on the two curves — the choice is a definition, not a preference.",
    },
    {
      kind: "edge",
      items: [
        { c: "Ties on the curve", r: "Equal totals share ONE CUME_DIST value — peers included by definition. If your report splits tied rows into different percentiles, you've joined ROW_NUMBER to a curve that didn't ask for it." },
        { c: "stddev by hand", r: "SQLite has no STDDEV built-in: the E[x²] − E[x]² identity computes population stddev in two window aggregates. Sample stddev (n−1) needs the correction factor — decide which your report promises." },
        { c: "Small-stage sigma", r: "With 4 rows, \\"3 sigma\\" is nearly unreachable — the curves are too coarse. Distribution flags need stage sizes; state n next to every z-score or the threshold is theater." },
        { c: "Skewed distributions", r: "Z-scores assume roughly symmetric shapes: revenue is usually right-skewed, so \\"3 sigma\\" fires differently on totals vs log(totals). The flag is a sentence opener, not a verdict." },
      ],
    },`);
