import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l75-mcqs";
import { ROWS as PROBS } from "./banks/l75-problems";

export const lesson75: Lesson = {
  id: "lesson-75",
  num: 75,
  title: "Scale-proof SQL — anti-patterns and the rewrite",
  blurb:
    "The four anti-patterns, priced at a million rows: the TEXT comparison that invents 49,075 rows, the function-wrapped column that forecloses every tree, the SELECT * that ships what no one asked for, and the raw SUM that silently zeroes 402 rows — each with its rewrite, each rewrite verified against identical outputs, and the staging census that closes the module the way the gates closed the mart",
  minutes: 22,
  blocks: [
    {
      kind: "p",
      text: "Every trap in this lesson is invisible at 103 rows and **measurable** at 1,010,317. That's the point of the firehose: the anti-patterns you learned to spot by shape (lesson 64's table of index-hostile patterns) now have numbers attached — the TEXT comparison that counts 49,075 rows too many, the SUBSTR bucket that costs a tree forever, the star that ships six columns nobody reads, the SUM that quietly swallows 402 rows. Each one gets the same treatment: **run the wrong version, count what it lies about, write the rewrite, prove the outputs identical.**",
    },
    { kind: "diagram", figure: "l75-anti-patterns" },
    { kind: "h", text: "The four, with receipts" },
    {
      kind: "table",
      headers: ["anti-pattern", "what it costs here", "the rewrite"],
      rows: [
        ["TEXT compared as magnitude (`amount_cents > '1500'`)", "362,311 counted vs 313,236 true — refunds '300'–'999' sort above '1500' char-by-char, dirty strings sort above digits", "`GLOB '[0-9]*'` guard + `CAST(amount_cents AS INTEGER)`"],
        ["function on the column (`SUBSTR(event_ts,1,7) = '2025-06'`)", "same 84,482 rows, but the shape can never use a tree — the SCAN is permanent", "bare-column half-open range `>= '2025-06-01' AND < '2025-07-01'`"],
        ["`SELECT *` at scale", "six TEXT-heavy columns × 1,010,317 rows shipped, cached and parsed for nothing", "name the columns — and let covering indexes answer"],
        ["raw `SUM(amount_cents)` over mixed TEXT", "402 dirty rows silently zeroed — right total here, an exception on Postgres, a different guess on MySQL", "`GLOB` guard + CAST, with the exclusion counted"],
      ],
      caption: "Same four shapes as lesson 64's table — now with million-row receipts",
    },
    {
      kind: "bullets",
      items: [
        "**The comparison trap is about ORDER, not parsing.** '999' > '1500' is true character-by-character ('9' wins at position 0) while 999 < 1500 numerically — and 'n/a' beats every digit string because letters sort after digits. The honest filter declares the trust boundary BEFORE comparing.",
        "**The SUBSTR rewrite is about options, not correctness.** Both month spellings count 84,482 today; only the bare-column range is the shape an index can serve tomorrow. Rewriting before you index is how lesson 74's trees stay possible.",
        "**The SUM surprise cuts both ways.** SQLite zeroes non-numeric text in silence — the total is right HERE and throws on Postgres. The GLOB+CAST spelling isn't about this engine; it's about every engine, and about being able to SAY what was excluded (402, counted).",
      ],
    },
    { kind: "h", text: "The set-based habit — the rewrite that beats them all" },
    {
      kind: "code",
      caption: "The naive per-row lookup vs the grouped census",
      sql: `-- the row-by-row mindset: 1,010,317 probes, each asking the same table
SELECT id, (SELECT COUNT(*) FROM events_scale e2
            WHERE e2.user_id = e1.user_id) AS user_rows
FROM events_scale e1 LIMIT 5;                       -- quadratic-shaped

-- the set mindset: one sweep, every user's count at once
SELECT user_id, COUNT(*) AS user_rows
FROM events_scale
WHERE user_id IS NOT NULL
GROUP BY user_id;                                   -- linear, same answers`,
    },
    {
      kind: "bullets",
      items: [
        "**Row-by-row thinking scales as N×M; set thinking scales as N.** The correlated probe is the shape ORMs emit and dashboards ship — one grouped query replaces a million of them, and it's SHORTER, not just faster.",
        "**The OR family splits by shape.** Same-column OR folds to IN (one tree, two descents); cross-column OR needs UNION ALL of two indexed probes — with the overlap measured, not assumed. Here user 4321 never refunds (198 + 202,062 − 0 = 202,260, verified).",
        "**The capstone is the habit compounded:** count everything and sum the trusted in ONE grouped pass — `SUM(CASE WHEN amount_cents GLOB '[0-9]*' THEN CAST(…) ELSE 0 END)` — five rows that carry the module's whole census.",
      ],
    },
    {
      kind: "warn",
      text: "A rewrite that changes the answer is not an optimization — it's a bug with better timing. Every rewrite in this lesson was verified against identical outputs: 84,482 either way for June, 202,069 either way for page_view, 1,000,000 fingerprints either way. The discipline: before/after row counts compared explicitly, diffs explained, then — and only then — the clock consulted.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres refuses the silence: comparing a TEXT column to a number errors outright, and SUM over non-numeric text throws — the trap becomes a build failure instead of a wrong report. Same lesson, earlier feedback.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's SAFE_CAST returns NULL instead of throwing — the GLOB-guard pattern becomes WHERE SAFE_CAST(x AS INT64) IS NOT NULL. The trust boundary survives; only the guard's spelling changes per engine.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite's GLOB is the guard for numeric-prefix checks, and CAST is total (never errors — it truncates '3,140.50' to 3). That totality is why the guard must come FIRST: CAST alone never tells you it dropped the cents.",
    },
    {
      kind: "tip",
      text: "The module's loop, whole: census the dirt, read the plan, run the wrong version ONCE to measure the lie, ship the rewrite, prove identical outputs, re-measure. Every number in this lesson re-queries identically — deterministic dirt, honest arithmetic, and 49,075 reasons to keep the CAST.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A kitchen inspector's rule: taste the dish before you trust the recipe. The anti-patterns are recipes that work at home (103 rows) and poison at scale. TEXT comparison is 'alphabetical cooking' — it follows the character order, not the number line, and a million rows expose every inversion. The rewrite is re-reading the recipe with units: cast first, guard the pan, then compare. The per-row lookup is stirring each grain individually; the GROUP BY is the pot that cooks them together. And the staging census is the taste at the end — 1,000,000 clean from 1,010,317 raw, or the recipe doesn't leave the kitchen.",
    },
    {
      kind: "engine",
      title: "How SQLite compares '999' > '1500' — and why 362,311 rows agree",
      steps: [
        "Both operands are TEXT: the comparison is memcmp-style, character by character.",
        "Position 0: '9' (0x39) vs '1' (0x31) — '9' wins; the rest is never examined. '999' > '1500' is TRUE.",
        "Dirty strings ride the same rule past the digits: 'n' (0x6E) and '—' (0xE2) sort above every digit, so 'n/a' > '1500' is TRUE too.",
        "The honest filter converts first: GLOB '[0-9]*' keeps only digit-led strings, CAST makes them integers, and 1500 compares as a number — 313,236 rows.",
        "The 49,075-row gap is the audit: refunds '300'–'999' plus the dirty strings, every one a phantom the text comparison invented.",
      ],
    },
    {
      kind: "myth",
      myth: "The rewrite always changes the number — that's how you know it worked.",
      truth:
        "The opposite: a rewrite that changes outputs has changed MEANING. Every honest rewrite here verified identical counts first (84,482 = 84,482, 202,069 = 202,069). The wins are in the PLAN and the CLOCK — the outputs are the invariant that makes speed safe to buy.",
    },
    {
      kind: "myth",
      myth: "SQLite's silent zeroing means the raw SUM was fine all along.",
      truth:
        "It was fine HERE — deterministic data, this engine version. Port the query and Postgres throws, MySQL coerces differently, and the total silently moves. 'Worked on my machine' is not a data contract; the GLOB boundary is the contract.",
    },
    {
      kind: "edge",
      items: [
        { c: "The GLOB guard excludes a real amount", r: "GLOB '[0-9]*' accepts any digit-led string, including '1500abc' — CAST then truncates it to 1500. For feed-grade honesty the stricter guard is a full GLOB '[0-9]*' match on the WHOLE value plus a length check; the census tells you whether the difference is zero rows or a scandal." },
        { c: "CAST('12,500' AS INTEGER) returns 12", r: "SQLite's CAST parses the longest numeric PREFIX: '12' then stops at the comma. Truncation, not error — which is exactly why guard-then-cast is one move, never CAST alone." },
        { c: "The UNION ALL rewrite counts 202,260 but the OR counted 202,259", r: "The arms overlap in exactly one row somewhere — the OR dedupes automatically, UNION ALL doesn't. Measure the overlap (INTERSECT) and subtract it; the discipline is reconciliation, not faith." },
        { c: "The correlated version 'seems fine' with LIMIT 5", r: "LIMIT caps the outer rows, not the shape — 5 probes × 1M-row scans each. Ship it without the LIMIT and it's a million probes. Read the plan: the correlated subquery is the SCAN that never ends." },
        { c: "Someone adds an index on amount_cents to fix the CAST filter", r: "It can't: the predicate is about CAST(amount_cents), not amount_cents. The tree is sorted by text; the filter asks about integers. Fix the PIPELINE (stage money as INTEGER at load) — the only rewrite this filter ever obeys." },
      ],
    },
  ],
  mcqs: mcqBank("l75", MCQS),
  problems: probBankX("l75", PROBS),
  takeaway:
    "Four anti-patterns, four receipts: guard and CAST the money, bare-column the ranges, name the columns, fold the row-by-row into one grouped pass — every rewrite proven output-identical before the clock is believed, and the staging census (1,000,000 clean + 10,317 quarantined = 1,010,317 raw) closing the gate the mart taught you to build.",
};
