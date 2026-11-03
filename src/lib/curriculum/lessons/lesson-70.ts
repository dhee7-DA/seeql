import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l70-mcqs";
import { ROWS as PROBS } from "./banks/l70-problems";

export const lesson70: Lesson = {
  id: "lesson-70",
  num: 70,
  title: "Cleaning at scale — the staging pattern",
  blurb:
    "The census is done; now the transform. Raw stays immutable while a staging SELECT canonicalizes, deduplicates (ROW_NUMBER keep-first), standardizes and flags — 627 rows become 582 clean events plus 45 quarantined replays, with the money total and the class census as publish-gate proofs",
  minutes: 20,
  blocks: [
    {
      kind: "p",
      text: "Lesson 69 measured the dirt; this lesson moves it — without ever deleting a row. The staging pattern: **raw lands once and never changes**; a derived table (`stg_events`) holds the clean shape; a quarantine holds what was excluded and why. The pipeline is five declared stages — profile, canonicalize, dedupe, standardize, stage+flag — and each stage's output must reproduce a triage number. 627 rows in, **582 clean + 45 quarantined** out, $32,171.47 of purchase money intact on both sides.",
    },
    { kind: "diagram", figure: "l70-clean-pipeline" },
    { kind: "h", text: "Dedupe: ROW_NUMBER, keep-first" },
    {
      kind: "code",
      caption: "The staging build — canonicalize, standardize and dedupe in one declared SELECT",
      sql: `CREATE TABLE stg_events AS
SELECT id,
       REPLACE(event_ts, ' ', 'T') AS event_ts,   -- standardize (both parse: triage proved it)
       user_id,
       lower(trim(action)) AS action,             -- canonicalize 9 → 4
       trim(page) AS page,
       amount_cents
FROM (
  SELECT *,
         ROW_NUMBER() OVER (
           PARTITION BY event_ts, user_id, lower(trim(action)), trim(page), amount_cents
           ORDER BY id) AS rn                     -- first arrival wins
  FROM events_dirty
)
WHERE rn = 1;                                    -- 582 rows; rn > 1 is the quarantine's 45`,
    },
    {
      kind: "bullets",
      items: [
        "**ROW_NUMBER keeps ROWS; DISTINCT collapses VALUES.** The clean table must keep a real row — original id and all — so every clean event stays joinable to its raw provenance and to the 7 replays behind it. 'Which duplicate survived?' must always be answerable: the first arrival, by declared rule.",
        "**Canonicalize before the fingerprint** — the partition expression carries lower(trim(action)) and trim(page), so 'Page_View' and 'page_view ' were one event before the count. Reversing the order dedupes 9 spellings' worth of ghosts that never existed.",
        "**Standardize with a license**: REPLACE(' ' → 'T') runs because the triage proved all 627 parse under both formats (`julianday` never NULL). Bytes change; instants don't — and the transform is one line in a SELECT, re-runnable forever.",
      ],
    },
    { kind: "h", text: "Flag, don't DELETE" },
    {
      kind: "code",
      caption: "The class verdict becomes a column — the flagged staging table",
      sql: `CREATE TABLE stg_events_flagged AS
SELECT id, REPLACE(event_ts, ' ', 'T') AS event_ts, user_id,
       lower(trim(action)) AS action, trim(page) AS page, amount_cents,
       CASE WHEN user_id IS NULL THEN 'anonymous'
            WHEN user_id >= 900 THEN 'bot'
            ELSE 'known' END AS user_class
FROM ( …the same deduped set… )
WHERE rn = 1;
-- known 539 · anonymous 26 · bot 17  (was 584/26/17 raw: all 45 surplus rows were known-class)`,
    },
    {
      kind: "bullets",
      items: [
        "**Anonymous and bots are KEPT** — flagged, not filtered. Every per-user metric now states its convention explicitly (`WHERE user_class = 'known'`) instead of silently assuming the data was clean.",
        "**The −45 delta is the proof**: knowns went 584 → 539 because every surplus row (38 pair-twins + the burst's 7) belonged to a known user. The class census after cleaning must differ from the triage's by exactly the quarantine — that's the transform's blast radius, verified.",
        "**Quarantine is explained exclusion**: 45 rows, each the rn > 1 twin of a kept fingerprint. The ledger — kept id, dropped count, biggest first — puts the burst's 7 at the top of the review queue.",
      ],
    },
    { kind: "h", text: "The publish gate" },
    {
      kind: "code",
      caption: "Four post-conditions — the build ships only when all four hold",
      sql: `-- 1. count:      clean rows (582) = triage's fingerprint count
-- 2. grain:      distinct clean fingerprints = clean rows (one event per fingerprint)
-- 3. money:      purchase total unchanged: $32,171.47 before and after (guarded SUM)
-- 4. format:     zero non-standard timestamps remain
-- Any failure means the transform disagreed with the census — fix the transform.`,
    },
    {
      kind: "warn",
      text: "Never clean in place. `UPDATE events_dirty SET action = lower(trim(action))` destroys the 9-spelling evidence the triage just built, makes re-runs impossible, and turns every future pipeline change into archaeology. Raw is the court of appeal: derived layers are disposable BY DESIGN, which is exactly what makes them safe to rebuild.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres pipelines express this as INSERT … SELECT with ON CONFLICT for idempotent re-runs, and ANALYZE after the staging load keeps the planner honest for downstream joins. MERGE makes the keep-first rule declarative when staging feeds an existing table.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "MySQL 8 carries the same window dedupe; INSERT … ON DUPLICATE KEY UPDATE is the idempotence idiom. Materialized staging usually becomes a real table + scheduled event, since MySQL lacks native matviews.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "CREATE TABLE AS SELECT does the whole build in one statement here; the EXPLAIN QUERY PLAN of the staging SELECT shows the SCAN + temp b-tree the window sort costs — module 11's measure-design-verify loop, applied to a pipeline instead of a dashboard. The Scale Lab runs the same trade at 1.2M rows.",
    },
    {
      kind: "tip",
      text: "The habit that scales: every cleaning step is a SELECT with a post-condition. Write the assertion (count, sum, class delta) BEFORE the transform, and the pipeline reviews itself. At 627 rows or 6 million, the discipline is identical — only the machinery changes (watermarks and incremental staging replace full rebuilds).",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A surgical theater, not a battlefield medic. The medic at the scene stabilizes and moves — speed over perfection, and what's cut is cut. The surgical theater is the opposite: the patient (raw) is prepped once, everything that happens is recorded, every removed item is photographed into a tray (quarantine), and the count of sponges before and after must match (publish gate). The difference is reversibility: the medic's decisions end at the ambulance door; the surgeon's are auditable for years. Your pipeline is a theater, not a battlefield — the raw log must walk out alive, whatever the staging table says.",
    },
    {
      kind: "engine",
      title: "What the dedupe costs, plan-wise",
      steps: [
        "EXPLAIN QUERY PLAN the staging SELECT: SCAN events_dirty feeds the window function.",
        "The PARTITION BY fingerprint forces a temp b-tree: SQLite sorts all 627 rows by (ts, user, action, page, amount, id) — the plan says 'USE TEMP B-TREE FOR ORDER BY' twice (partition + top-level).",
        "At 627 rows: one pass, milliseconds. The same plan at 6M rows makes the sort the cost center — module 11's loop says measure, then design.",
        "Design option: an index on the fingerprint columns turns the sort into a pre-ordered scan — the Scale Lab's INDEX DUEL is precisely this decision at 720k events.",
        "Verify: re-run EXPLAIN after the index; accept the write cost knowingly — staging runs nightly, so its read speed compounds.",
      ],
    },
    {
      kind: "myth",
      myth: "Dedupe = SELECT DISTINCT.",
      truth:
        "DISTINCT collapses value-tuples and returns rows that exist in no source — no id, no provenance, no join back to raw. ROW_NUMBER keep-first returns a REAL row with an auditable rule ('the first arrival'). At stake isn't the count (both give 582) — it's whether the clean table can testify about where it came from.",
    },
    {
      kind: "myth",
      myth: "Clean once and the data stays clean.",
      truth:
        "The vendor sends tomorrow's log with the same producer bugs. The pipeline re-runs nightly BY DESIGN — which is why nothing may be deleted in place and every rule must be idempotent (same raw in, same stg out). One-off cleaning is a janitor; a declared pipeline is a filter that never sleeps.",
    },
    {
      kind: "edge",
      items: [
        { c: "Two rows, same fingerprint, different ids — which is 'the event'?", r: "Keep-first answers by rule; the deeper question is whether the second arrival could be a CORRECTION (a re-send with updated fields). Same fingerprint with different payload = two claims, not a replay — the fingerprint's equality is what makes 'replay' provable rather than assumed." },
        { c: "The staging build fails halfway at 6M rows", r: "Non-issue by design: staging is a full rebuild from immutable raw. Fix the rule, drop stg, re-run. The publish gate re-checks all four post-conditions on the new build — recovery is just another run." },
        { c: "A new dirt class appears next month (say, emoji in pages)", r: "The triage board gains a row, the fingerprint may need a new canonicalizer (trim won't fix emoji), and the pipeline changes in ONE declared place. The class system makes drift additive, not destabilizing." },
        { c: "The keep-first rule keeps a row whose LATER twin has better data", r: "Then the rule is wrong for that class — and the ledger shows it: kept id vs dropped ids are both visible. Changing keep-first to keep-last is a one-word edit with the same publish gate; the raw log never knew the difference." },
        { c: "Money total moved by $0.01 after dedupe", r: "A replay carried a different amount — impossible by fingerprint (amount is IN the fingerprint), so the real cause is a filter difference between the two sums. The gate catching it is the system working: fix the query, not the data." },
      ],
    },
  ],
  mcqs: mcqBank("l70", MCQS),
  problems: probBankX("l70", PROBS),
  takeaway:
    "Raw immutable, transforms in declared SELECTs, dedupe by fingerprint with keep-first provenance, classes flagged not deleted — and a publish gate of four post-conditions (count, grain, money, format) that must reproduce the triage's numbers exactly.",
};
