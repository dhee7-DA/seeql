import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l69-mcqs";
import { ROWS as PROBS } from "./banks/l69-problems";

export const lesson69: Lesson = {
  id: "lesson-69",
  num: 69,
  title: "The hand-me-down log — triage before cleaning",
  blurb:
    "A vendor hands you 627 rows of event data with replays, anonymous traffic, bot ids, format drift, whitespace and broken money planted exactly where real logs have them. The discipline that makes it usable: census every dirt class BEFORE touching a row — each class gets a count, a treatment and an owner — and define the fingerprint that decides what 'same event' means",
  minutes: 20,
  blocks: [
    {
      kind: "p",
      text: "Module 11 taught you to read plans; this lesson applies the same measure-first instinct to **data quality**. The vendor's log lands: **627 rows**, one month of January, the shape every analytics team inherits. It works — mostly. It deduplicates itself — mostly. Running the census before any cleaning turns 'the data is messy' into six named findings with exact counts: **45 replay rows** (38 single pairs and one 8-copy burst), **26 anonymous** events, **17 bot orphans**, **89 drifted timestamps**, **163 whitespace pages**, **5 broken-money amounts**. **Triage is measurement; cleaning is the next lesson.**",
    },
    { kind: "diagram", figure: "l69-dirty-census" },
    { kind: "h", text: "The fingerprint: what 'same event' means" },
    {
      kind: "code",
      caption: "The identity contract — declared before it's used",
      sql: `-- Two rows are THE SAME EVENT when all five agree:
--   event_ts                    (exact string, both formats count as written)
--   user_id                     (NULL counts as its own user)
--   lower(trim(action))         (canonical: 9 spellings → 4 actions)
--   trim(page)                  (canonical: 8 spellings → 6 pages)
--   amount_cents                (the value as arrived, text or integer)
SELECT COUNT(DISTINCT event_ts || '|' || COALESCE(user_id, -1) || '|' ||
             lower(trim(action)) || '|' || trim(page) || '|' ||
             COALESCE(amount_cents, 'none')) AS fingerprints   -- 582
FROM events_dirty;`,
    },
    {
      kind: "bullets",
      items: [
        "**Canonicalize BEFORE fingerprinting.** `Page_View` and `'page_view '` are one event wearing two costumes; fingerprinting raw rows counts ghosts. The canonical form (lower, trim) is part of the identity, not a cleanup.",
        "**NULL is a user.** COALESCE(user_id, -1) keeps anonymous events distinct — a bare concatenation would collapse every NULL-user row into one phantom key.",
        "**The prediction is testable**: 582 distinct fingerprints. Lesson 70's pipeline doesn't 'hope' to clean 582 — it MUST, and the publish gate checks.",
      ],
    },
    { kind: "h", text: "The six classes, counted" },
    {
      kind: "table",
      caption: "The triage board — count · treatment · owner",
      headers: ["class", "count", "treatment", "owner"],
      rows: [
        ["replays (38 pairs + 1 burst of 8)", "45 surplus rows", "fingerprint dedupe, keep-first", "data team"],
        ["anonymous (user_id NULL)", "26", "keep, flag 'anonymous'", "product analytics"],
        ["bot orphans (id ≥ 900)", "17", "keep, flag 'bot'", "web team"],
        ["drifted timestamps (space not T)", "89", "REPLACE to 'T' at standardization", "vendor"],
        ["whitespace pages", "163", "trim at canonicalization", "vendor"],
        ["broken money (text amounts)", "5", "quarantine for vendor fix; never coerce", "vendor"],
      ],
    },
    {
      kind: "bullets",
      items: [
        "**Classes classify findings, not rows.** One row can be drifted AND padded AND anonymous — the class counts deliberately don't sum to 627. Only the user classes partition: 584 known + 26 anonymous + 17 bots = 627.",
        "**The money baseline is guarded**: SUM(CASE WHEN typeof = 'integer' THEN amount END) = 3,217,147 cents. A bare SUM would silently coerce `'12,500'` → 12 and `'980'` → 980 — money theft by implicit cast (module 11's anti-pattern, wearing a data-quality costume).",
        "**The burst is a producer bug, not bad luck.** One fingerprint × 8 copies means retries stuck in a loop — that finding goes to the vendor with a timestamp attached, not into a dedupe bucket quietly.",
      ],
    },
    {
      kind: "code",
      caption: "The duplicate shape — 39 groups hold all 45 surplus rows",
      sql: `SELECT n_copies, COUNT(*) AS groups
FROM (
  SELECT event_ts, user_id, action, page, amount_cents, COUNT(*) AS n_copies
  FROM events_dirty
  GROUP BY event_ts, user_id, action, page, amount_cents
  HAVING COUNT(*) > 1
)
GROUP BY n_copies ORDER BY n_copies;
-- 2 copies × 38 groups  ·  8 copies × 1 group (the burst, user 5, add_to_cart)`,
    },
    {
      kind: "warn",
      text: "The strongest taboos, in order: (1) never clean before the census — every class count is the acceptance test for the fix; (2) never DELETE in triage — anonymous and bots are kept, flagged; (3) never let a bare SUM near the mixed-type money column. Each taboo has a body count in production postmortems.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres triage adds row-level statistics (pg_stats.n_distinct) and bloom filters for quick class sketches on big logs; the census SQL itself is identical. TRY_CAST makes the money probe a one-liner instead of the typeof guard.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery profiles tables for you (INFORMATION_SCHEMA.COLUMN_FIELD_STATISTICS) and SAFE_CAST returns NULL instead of coercing — the broken-money class surfaces as NULL counts. The discipline is the same: measure, don't mutate.",
    },
    {
      kind: "tip",
      text: "The habit: a class without an owner is a finding that never gets fixed. '45 replays — dedupe keep-first — data team' is a work item. 'Duplicates exist' is a shrug.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "The ER triage nurse, not the surgeon. The nurse's first hour is pure measurement: vitals, allergies, counts of everything — because the surgeon's plan is only as good as the census. Cutting first and measuring later isn't speed; it's malpractice with a clock. Your log is the patient: 627 arrivals, six injury classes, each with a count and a chart. The cleaning (next lesson) is the surgery — and it starts only when the chart is signed.",
    },
    {
      kind: "engine",
      title: "How the census queries run (and why they're cheap)",
      steps: [
        "Every count is one scan: LIKE, IS NULL, typeof — no joins, no windows, 627 rows.",
        "The spelling counts are DISTINCT aggregates — the 9→4 and 8→6 deltas quantify the canonicalization workload before it's written.",
        "The duplicate census is one GROUP BY over all five raw columns; HAVING COUNT(*) > 1 keeps only fingerprint groups with witnesses.",
        "The parse probe wraps julianday around the standardized form — zero NULLs licenses the REPLACE lesson 70 runs.",
        "Everything lands in one board row (the final problem) — the pipeline's acceptance test, computed before the pipeline exists.",
      ],
    },
    {
      kind: "myth",
      myth: "Dirty data is a vendor problem — just bounce the file back.",
      truth:
        "Bouncing costs a month; triage costs an afternoon and ships a usable log TODAY with flags on the classes the vendor owns. The board's owner column is the negotiation: counts with owners get fixed at the source; counts without owners get re-litigated forever.",
    },
    {
      kind: "myth",
      myth: "NULLs and bots should be filtered on arrival — clean in, clean out.",
      truth:
        "Filtering at the door makes the log lie: session counts, funnel volumes and bot traffic are TRUE WITH those rows. Flag, don't filter — then every metric declares its population (WHERE user_class = 'known') instead of inheriting a silent assumption.",
    },
    {
      kind: "edge",
      items: [
        { c: "A replay differs in ONE field (amount updated).", r: "Different fingerprint — two claims, not a replay. Same-key-different-payload is a CORRECTION class (new triage row): keep both, latest wins by declared rule, and tell the vendor their retries aren't byte-identical." },
        { c: "The vendor sends February's log next week.", r: "The census re-runs untouched — classes are predicates, not one-off scripts. New classes (say, emoji in pages) ADD a board row; existing numbers reproduce or the vendor changed something." },
        { c: "Why keep the 8-copy burst instead of one row?", r: "Triage keeps everything; cleaning (next lesson) collapses by fingerprint with keep-first provenance. The burst's 7 surplus rows land in quarantine — countable, reviewable, explainable to the vendor." },
        { c: "A class count is 0. Is the board wrong?", r: "Zero is a finding too — 'no broken money in February' is exactly what the gate asserts. Honest zeros are the board working, not failing." },
        { c: "Can the census itself be wrong?", r: "Yes — which is why every predicate is reviewable SQL, not a vendor tool's black box. The board's queries fit on one screen; the vendor can run them against their own feed before shipping." },
      ],
    },
  ],
  mcqs: mcqBank("l69", MCQS),
  problems: probBankX("l69", PROBS),
  takeaway:
    "Census before cleaning: six classes with counts, treatments and owners; a fingerprint defined as (timestamp, user, canonical action, trimmed page, amount); guarded money (3,217,147 cents — never a bare SUM on mixed types); and a testable prediction — 582 clean fingerprints — that the pipeline must hit exactly.",
};
