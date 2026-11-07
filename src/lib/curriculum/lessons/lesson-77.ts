import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l77-mcqs";
import { ROWS as PROBS } from "./banks/l77-problems";

export const lesson77: Lesson = {
  id: "lesson-77",
  num: 77,
  title: "Types, casts & NULLs across engines",
  blurb:
    "The quietest dialect differences are semantic: 1/2 is 0 nearly everywhere but 0.5 in BigQuery, 1/0 is NULL here and an error in Postgres, CAST forgives here and throws there, NULLs sort first here and last in Postgres — the type-system fork, the guard-then-cast pattern that survives all of it, and the three-valued logic that = can never see",
  minutes: 20,
  blocks: [
    {
      kind: "p",
      text: "Lesson 76 mapped the loud differences — function names you can see. This lesson maps the quiet ones: **type systems and NULL semantics**, where the same query compiles everywhere and returns different answers. SQLite is dynamically typed (a column suggests, the value decides); Postgres is strict (the type is the law); MySQL coerces in comparisons; BigQuery bills by type. None of them agree on division by zero, on what CAST('abc') should do, or on where NULLs sort. The defense is one pattern — **guard, then cast, then substitute explicitly** — plus the three-valued logic you learned in lesson 4, now with engines attached.",
    },
    { kind: "diagram", figure: "l77-type-ladders" },
    { kind: "h", text: "The type-system fork" },
    {
      kind: "table",
      headers: ["expression", "SQLite (here)", "the forks"],
      rows: [
        ["`1/2`", "0 — integer division", "0 in Postgres/SQL Server/Oracle/MySQL too; BigQuery's INT64 division also truncates — the trap is assuming REAL"],
        ["`1/0`", "NULL — no error", "Postgres, MySQL, Oracle, BigQuery: ERROR. SQL Server: error (NULL only inside certain settings). Never rely on the quiet path"],
        ["`CAST('129.90' AS INTEGER)`", "129 — prefix-parse + truncate", "Postgres: ERROR (can't parse the full string as integer) · BigQuery: error too · the portable route goes through REAL/NUMERIC"],
        ["`CAST('abc' AS INTEGER)`", "0 — silent zero", "BigQuery SAFE_CAST: NULL · SQL Server TRY_CAST: NULL · Postgres: error — three failure modes, zero consensus"],
        ["`1 = '1'`", "FALSE — different storage classes", "MySQL: TRUE (coerces) · Postgres: type error · three engines, three answers"],
      ],
      caption: "Five expressions, five verdicts here, fifteen across engines — guard, don't guess",
    },
    {
      kind: "bullets",
      items: [
        "**The guard-then-cast pattern is the portable safe cast.** `WHERE amount_cents GLOB '[0-9]*' AND CAST(amount_cents AS INTEGER) > 1500` — the guard decides which rows attempt conversion, the cast does the conversion, and the failure mode is YOURS (explicit, counted, identical everywhere). SAFE_CAST/TRY_CAST are the same idea as a built-in.",
        "**CAST stops at the comma: '12,500' → 12.** Prefix parsing makes dirty money convert to WRONG numbers with no error — the lesson-75 trap as a type-system fact. Truncation without a guard is how 12,500 cents becomes 12.",
        "**The strict-typing alternative**: Postgres would have rejected 'n/a' into an INTEGER column at the door — the door-guard instead of the read-guard. Neither is wrong; they're different walls, and your queries must not care which one the warehouse built.",
      ],
    },
    { kind: "h", text: "NULL semantics, engines attached" },
    {
      kind: "table",
      headers: ["behavior", "here", "the fork"],
      rows: [
        ["NULL || 'x' (concat)", "NULL — propagates", "Postgres CONCAT('a', NULL) = 'a' (skips NULLs) — same engine, different operator, different rule"],
        ["NULLs in ORDER BY (ASC)", "first — NULLs sort smallest", "Postgres: last (NULLS FIRST/LAST spelled explicitly is the portable answer)"],
        ["MAX/MIN/AVG over NULLs", "skip them (all-NULL → NULL)", "universal — the aggregate contract IS standard"],
        ["COUNT(*) vs COUNT(col)", "rows vs values: 103 vs 82", "universal — the poster child of portable NULL arithmetic"],
        ["NULL = NULL", "UNKNOWN — invisible to =", "universal — three-valued logic everywhere; IS NULL is the only sight"],
      ],
      caption: "Half the NULL rules are standard; the other half fork — know which half you're in",
    },
    {
      kind: "warn",
      text: "The dashboard hazard: division by zero. Here it returns NULL — which a dashboard renders as an empty cell, a blank, a plausible nothing. Postgres throws, which at least STOPS the pipeline. Silent divergence is the theme of this lesson: the engine that errors tells you the data broke; the engine that returns NULL lets the broken number ship. Portability discipline means choosing the loud failure on purpose — guard the denominator, print the quarantine, never let the engine decide what your error page looks like.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Strict types end-to-end: TEXT→INTEGER casts that can't fully parse raise errors; comparisons across types are type errors, not coercions; real BOOLEAN columns take IS TRUE; and NULLS FIRST/LAST is spelled, not defaulted. The same guard-then-cast pattern works — the guard just throws earlier.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "SAFE_CAST returns NULL on bad conversions, and its type census is financial: every column read is billed, so types are contracts with a price. INT64/STRING are explicit in schemas; JSON access uses JSON_VALUE/JSON_QUERY with SQL/JSON path syntax.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "Dynamic typing end-to-end: typeof() reports the storage class per VALUE (the firehose's amount_cents is 'text' for all 1,010,317 rows), CAST is total (never errors — prefix-parse, truncate, silent zero), and STRICT tables (3.37+) opt INTO Postgres-like enforcement when you want the wall.",
    },
    {
      kind: "tip",
      text: "One pattern to pack: guard (make failure explicit and counted) → cast (convert what survived) → substitute (COALESCE/IFNULL where zero-like behavior is intended). Three steps, every engine, no silent divergence — and the problems below prove each step against data you already know.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "Two customs offices. SQLite's is a self-service kiosk: everything gets through, mislabeled goods and all — fast, forgiving, and your problem later (the typeof census is the audit). Postgres's is a full inspection: mislabeled goods are rejected at the border, loud and early — stricter, slower to load, and your problem EARLIER (the error is the audit). The guard-then-cast pattern is hiring your own inspector: whatever the border does, YOU decide what enters the calculation, and you keep the manifest (the quarantine count). Engines differ on enforcement; the discipline doesn't.",
    },
    {
      kind: "engine",
      title: "What CAST('12,500' AS INTEGER) actually does",
      steps: [
        "Take the longest numeric PREFIX: '12' — parsing stops at the comma, no error, no rounding.",
        "Convert: 12. The ',500' is dropped like a comment — silently, deterministically, wrongly.",
        "The guard's job: GLOB '[0-9]*' would have REJECTED this string outright (the comma is not a digit) — wait, it wouldn't: '[0-9]*' matches any string STARTING with a digit. The stricter full-match guard GLOB '*[0-9]' or a double-sided check catches it. Read the census before trusting any single guard.",
        "Compare: 12 > 1500 is FALSE — the row vanishes from the money, silently, at the cast.",
        "The portable conclusion: guard (stricter than you think), cast, and COUNT what the guard rejected — the trio from lesson 75, now justified by the type system itself.",
      ],
    },
    {
      kind: "myth",
      myth: "NULL handling is the same everywhere — it's in the standard.",
      truth:
        "Three-valued logic is standard; everything AROUND it isn't: concat propagation, sort placement, safe-cast behavior and division-by-zero all fork. The standard covers the logic; the engines cover the edges — and dashboards live on the edges.",
    },
    {
      kind: "myth",
      myth: "SQLite's dynamic typing means types don't matter here.",
      truth:
        "They matter MORE, because the column won't enforce them: every trust boundary you'd get free in Postgres must be built by hand (GLOB guards, typeof censuses, CAST contracts). Dynamic typing is deferred enforcement — the bill arrives at query time, with interest.",
    },
    {
      kind: "edge",
      items: [
        { c: "CAST('12abc' AS INTEGER) returns 12", r: "Prefix parsing again: digits until the first non-digit. Useful for '42 items' — catastrophic for '12,500'. The guard's strictness must match the data's dirt: know the census before choosing GLOB '[0-9]*' vs a full-match pattern." },
        { c: "1 = '1' is FALSE here but TRUE in MySQL", r: "Storage-class strictness vs coercion. The portable comparison CASTs both sides to one type first — three extra characters that buy identical behavior across every engine you'll ship to." },
        { c: "AVG over a column with NULLs feels wrong", r: "AVG skips NULLs by contract — 'average of non-NULL values'. If zero-belongs-in-the-average, COALESCE(col, 0) INSIDE the AVG, explicitly. The aggregate contract is universal; the business rule is yours to write down." },
        { c: "ORDER BY total puts a NULL total first", r: "NULLs sort smallest here, largest-by-default in Postgres. The shim ORDER BY (total IS NULL), total groups NULLs deterministically before the real sort — two sort keys, no dialect." },
        { c: "Someone 'fixes' division by zero with IFNULL(x/y, 0)", r: "It works here (NULL propagates → rescued) and errors in Postgres before IFNULL runs. The portable fix guards the DENOMINATOR: CASE WHEN y = 0 THEN 0 ELSE x/y END — the same three-valued logic, applied where it can't be skipped." },
      ],
    },
  ],
  mcqs: mcqBank("l77", MCQS),
  problems: probBankX("l77", PROBS),
  takeaway:
    "Types and NULLs fork quietly: guard then cast then substitute, spell your sort placement, and remember the aggregate contract (skip NULLs, NULL if empty) — the pattern is three steps long and identical in every engine, which is exactly why it's worth memorizing.",
};
