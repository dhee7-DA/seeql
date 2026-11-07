import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l78-mcqs";
import { ROWS as PROBS } from "./banks/l78-problems";

export const lesson78: Lesson = {
  id: "lesson-78",
  num: 78,
  title: "Portability — QUALIFY, arrays and the playbook",
  blurb:
    "The graduation: Snowflake's QUALIFY rewritten as the standard CTE, BigQuery's ARRAY/STRUCT becoming json_extract and json_each against the webhook payloads, INTERVAL becoming the modifier string, NULLS LAST becoming the boolean shim — the portable core named, the seams isolated, and every translation proven output-identical against data you already know",
  minutes: 22,
  blocks: [
    {
      kind: "p",
      text: "Two lessons of dialect map, one lesson of practice at the hard edge. This is where the module's questions live: Snowflake's **QUALIFY** (filter on a window result — the sugar every engine except Snowflake and BigQuery lacks), BigQuery's **ARRAY/STRUCT** types (native nested data, against SQLite's JSON-text shim), Postgres's **INTERVAL** literals (against SQLite's modifier strings), and the **NULLS LAST** spelling SQLite doesn't have. Each one gets the treatment: the dialect form, the meaning, the portable rewrite — graded live on the storefront and webhook data, where every expected answer is an old friend.",
    },
    { kind: "diagram", figure: "l78-portable-playbook" },
    { kind: "h", text: "QUALIFY — the sugar, and its standard body" },
    {
      kind: "code",
      caption: "Snowflake's spelling vs the rewrite that runs everywhere windows do",
      sql: `-- Snowflake / BigQuery: filter ON the window result directly
SELECT id, customer_id FROM orders
QUALIFY ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) = 1;

-- the standard body (SQLite, MySQL, Postgres, every engine):
WITH ranked AS (
  SELECT id, customer_id,
         ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) AS rn
  FROM orders
)
SELECT id, customer_id FROM ranked WHERE rn = 1;   -- each buyer's latest order`,
    },
    {
      kind: "bullets",
      items: [
        "**Why the rewrite is the standard**: WHERE evaluates BEFORE windows, so a window's output can't be filtered in its own scope — wrap and filter is the grammar's honest answer. QUALIFY is a convenience shim over it; when you write the CTE body you're writing what the sugar compiles to.",
        "**The faithful translation detail**: ROW_NUMBER with a full ORDER BY beats GROUP BY + MAX(created_at) when dates tie — MAX returns an arbitrary row among ties; ROW_NUMBER returns a DETERMINISTIC one. Translation must preserve the tie contract, not just the happy path.",
        "**Arrays and structs, shimmed**: BigQuery's `payload.email` is json_extract(payload, '$.email') here; its `UNNEST(items)` is `json_each(items)` joined in FROM; `ARRAY_LENGTH` is json_array_length. The webhook tier planted real nested data — 230 two-item carts, 16 string-typed totals — so the shim is graded against truth.",
      ],
    },
    { kind: "h", text: "The portable core, named" },
    {
      kind: "table",
      headers: ["always portable (write freely)", "portable with care (test both)", "isolate behind a seam"],
      rows: [
        ["SELECT/project · WHERE · GROUP BY/HAVING · standard joins · set operators (UNION/INTERSECT/EXCEPT, set semantics) · ORDER BY · LIMIT-ish paging · CTEs · window functions", "string functions (SUBSTR vs SUBSTRING vs SUBSTRING(x FROM y)) · COALESCE-family · CASE ladders · ROUND/date constructors · boolean expressions in ORDER BY", "date arithmetic (INTERVAL vs modifiers vs DATE_ADD) · safe casts (SAFE_CAST/TRY_CAST vs guard+CAST) · QUALIFY-style sugar · array/struct access (json_* shims) · month arithmetic (the clamp)"],
      ],
      caption: "The core is wide — most business queries never leave the left column",
    },
    {
      kind: "bullets",
      items: [
        "**Seams are architecture**: one CTE (or one function) owns the engine-specific piece, with the portable contract documented and tested against two engines' behaviors. Migrations then touch ONE seam, not two hundred queries.",
        "**The NULLS LAST shim** is the pattern in miniature: `ORDER BY (shipped_at IS NULL), shipped_at DESC` — a two-key sort where the first key is a boolean every engine can compute. No dialect syntax, identical output everywhere.",
        "**Set operators are the safest port of all**: UNION dedupes, UNION ALL preserves, INTERSECT/EXCEPT dedupe — the same in every engine. The customer×store region questions below prove it in two queries.",
      ],
    },
    {
      kind: "warn",
      text: "The module's closing discipline: PROVE the translation, don't hope it. Every rewrite in these lessons was verified output-identical — 16 latest orders either way, 230 two-item carts either way, 52/30/14/7 either way. A translation that changes the answer changed the MEANING somewhere (ties, NULLs, boundaries) — and 'it compiles' was never the test. Compare the outputs explicitly; then the dialect is safe to retire.",
    },
    {
      kind: "dialect",
      db: "snowflake",
      text: "Snowflake ships QUALIFY for real, VARIANT for semi-structured (col:field dot access!), and ADD_MONTHS that clamps like Oracle. Its date arithmetic uses DATEADD(day, 3, col) — the argument order is its own dialect: unit first, not column first.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's ARRAY<INT64>/STRUCT<INT64> are real nested types with columnar billing; UNNEST is the standard join shape; SAFE_CAST never throws. Its DATE_ADD takes the unit as an INTERVAL literal — and DATETIME vs DATE vs TIMESTAMP distinctions are enforced, not suggested.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres has native ARRAY columns (col && col overlap operators, unnest()), real JSONB with indexing, INTERVAL literals (created_at + INTERVAL '3 days') and NULLS FIRST/LAST spelled. It's the closest mainstream engine to the standard — and the shim target the portability seams usually aim at.",
    },
    {
      kind: "tip",
      text: "The playbook, whole: core by default · seams at the edges · translate on arrival (identify → extract → rewrite) · verify against known data · pin every date, name every order. Run it on the twelve problems below — and you've graduated from the map to the practice.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "A UN interpreter, not a translator. The novice translates word by word (DATEDIFF → julianday) and hopes. The professional listens for the MEANING ('days between order and shipment'), holds it, and re-expresses it natively — checking the two places interpreters get fired: ties (ROW_NUMBER vs MAX), and boundaries (month-end overflow, day-crossing vs elapsed). The playbook is the interpreter's prep: know the standard core cold, keep the dialect phrasebook for the edges, and always test the rendering against a listener who knows the expected sentence.",
    },
    {
      kind: "engine",
      title: "Compiling QUALIFY, step by step",
      steps: [
        "Read the sugar: QUALIFY <expr> filters rows AFTER the window pass — a new clause between window and final result.",
        "Ask what the standard grammar can express: a window can't be filtered in its own scope (WHERE runs before it) — so the window's output must become a TABLE first.",
        "Wrap: the CTE computes id, customer_id, rn over the full partition — a derived table with the window's answer materialized per row.",
        "Filter outside: WHERE rn = 1 in the outer SELECT — now it's a plain predicate on a plain column.",
        "Verify the tie contract: ORDER BY created_at DESC inside the window is total (ids break nothing here) — the rewrite returns the same 16 rows the sugar promised. Proven, not hoped.",
      ],
    },
    {
      kind: "myth",
      myth: "Portability means avoiding everything engine-specific.",
      truth:
        "It means ISOLATING everything engine-specific. The QUALIFY rewrite avoids nothing — it expresses the same idea in the standard grammar. Arrays can't be avoided; they're shimmed through json_extract with the access pattern (path, type, explode) kept identical. Avoidance is denial; isolation is architecture.",
    },
    {
      kind: "myth",
      myth: "The rewrite is always slower than the dialect sugar.",
      truth:
        "QUALIFY's CTE body is exactly what the sugar compiles to — same plan, same cost. The json_* shims DO cost more than native arrays (parsing per read) — that's the honest seam price, paid per access, and worth it exactly until the data is big enough to justify a native-type migration. Portability is a cost curve, not a religion.",
    },
    {
      kind: "edge",
      items: [
        { c: "GROUP BY + MAX(created_at) 'works' for latest-per-customer", r: "Until two orders tie on created_at — then it returns an arbitrary one while ROW_NUMBER returns the ordered one. Faithful translation preserves the tie contract; the lesson's rewrite carries the window ordering explicitly for exactly this reason." },
        { c: "json_extract(payload, '$.email') is NULL — but which NULL?", r: "Absent key and explicit null both read NULL from json_extract; json_type distinguishes them ('null' = present-as-null, NULL = absent). The webhook tier planted 12 absent and 1 null — the census is gradeable, the fork is real." },
        { c: "The INTERSECT result has no duplicates but the inputs did", r: "Set semantics: INTERSECT/EXCEPT/UNION dedupe by definition. If the question needed duplicates preserved, UNION ALL is the spelling — set operators are portable AND precise; know which precision you asked for." },
        { c: "date('2024-01-31', '+1 month') returns March 2 — someone calls it a bug", r: "It's a semantics choice: SQLite rolls overflow, Oracle clamps. The portable month arithmetic works on the 1st: date('2024-01-01', '+1 month', '-1 day'). Both spellings are correct; only the family is portable." },
        { c: "The shim is slower than the native type", r: "True and priced: json_extract parses per read where BigQuery reads the column once. The seam makes the cost visible and movable — when the data outgrows the shim, the seam is the ONLY code that changes." },
      ],
    },
  ],
  mcqs: mcqBank("l78", MCQS),
  problems: probBankX("l78", PROBS),
  takeaway:
    "QUALIFY's body is a CTE, arrays are json shims, INTERVAL is a modifier string, NULLS LAST is a boolean first key — write the wide portable core by default, isolate the edges behind tested seams, and prove every translation output-identical before the dialect retires.",
};
