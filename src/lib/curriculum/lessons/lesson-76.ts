import type { Lesson } from "../types";
import { mcqBank, probBankX } from "./banks/l64-util";
import { ROWS as MCQS } from "./banks/l76-mcqs";
import { ROWS as PROBS } from "./banks/l76-problems";

export const lesson76: Lesson = {
  id: "lesson-76",
  num: 76,
  title: "One language, many accents — the dialect map",
  blurb:
    "The same SQL sentence, five engines, five spellings: DATEDIFF vs DATE_DIFF vs julianday subtraction, CONCAT vs ||, TOP vs LIMIT vs FETCH, ISNULL vs NVL vs IFNULL vs COALESCE — the dialect map that turns 'identify the engine, extract the meaning, write the SQLite form' into a graded, runnable skill",
  minutes: 20,
  blocks: [
    {
      kind: "p",
      text: "Everything you've written so far runs on SQLite — and most of it would run on Postgres, MySQL, BigQuery and Snowflake unchanged, because the **core** of SQL is genuinely standard. The edges aren't: date differences, string concatenation, missing-value functions, row limits and identifier quoting all fork per engine. This lesson builds the dialect map — not to memorize four engines, but to practice the one skill that survives them all: **read a query, identify its dialect, extract its meaning, and write the equivalent that runs where YOU are.** Every problem here translates a real spelling from BigQuery, SQL Server, MySQL, Oracle or Postgres into runnable SQLite, graded against the storefront you already know.",
    },
    { kind: "diagram", figure: "l76-dialect-map" },
    { kind: "h", text: "The five families, on one board" },
    {
      kind: "table",
      headers: ["idea", "SQLite (this course)", "the forks you'll meet"],
      rows: [
        ["date difference", "`julianday(a) - julianday(b)`", "BigQuery DATE_DIFF(a, b, DAY) · SQL Server/Snowflake DATEDIFF · Postgres AGE() and date subtraction"],
        ["concatenate", "`a || b` (operator)", "MySQL CONCAT(a, b) — where `||` means OR! · Postgres both (CONCAT skips NULLs, || doesn't)"],
        ["missing value", "`IFNULL(x, y)` · `COALESCE(x, y, …)`", "Oracle NVL · SQL Server ISNULL · COALESCE is the standard, everywhere"],
        ["row limit", "`LIMIT n [OFFSET m]`", "SQL Server TOP n · standard FETCH FIRST n ROWS ONLY · Oracle ROWNUM"],
        ["identifier quoting", "`\"x\"` (also accepts `` `x` `` and `[x]`)", "MySQL `` `x` `` (where \"x\" means string!) · SQL Server [x] · Postgres \"x\""],
      ],
      caption: "Five ideas, one course engine, ~15 spellings — and the concepts port perfectly",
    },
    {
      kind: "bullets",
      items: [
        "**Translate meaning, not tokens.** SQL Server's DATEDIFF(day, a, b) counts day BOUNDARIES crossed; julianday subtraction measures ELAPSED time — for time-bearing timestamps they can disagree by one. Find-and-replace between dialects silently changes semantics; find-the-concept-then-rewrite doesn't.",
        "**The month clamp is a semantics fork, not a syntax one.** date('2024-01-31', '+1 month') returns 2024-03-02 here — SQLite rolls the overflow instead of clamping like Oracle's ADD_MONTHS. The portable spelling does month arithmetic on the 1st: date('2024-01-01', '+1 month', '-1 day').",
        "**Booleans are storage, not syntax.** SQLite stores 0/1 integers; Postgres stores true booleans; the predicates port (active = 1 works in both) — but the idiomatic spellings differ, and migrations read the schema first.",
      ],
    },
    { kind: "h", text: "The translation method" },
    {
      kind: "steps",
      items: [
        "**Identify the dialect** — DATEDIFF with a quoted unit? SQL Server/Snowflake. Backtick identifiers? MySQL. SAFE_CAST? BigQuery. The map above covers 90% of what arrives.",
        "**Extract the meaning** — 'day count between order and shipment', 'missing becomes not shipped', 'top three by total'. Write the sentence in English; the SQL is its translation into whichever engine you're on.",
        "**Write the local spelling** — julianday subtraction, IFNULL, LIMIT. If the concept has no local function (CONCAT), compose it from the operator (||).",
        "**Run and verify against known answers** — the storefront's numbers are old friends; a translation that moves 52/30/14/7 has moved something else too.",
      ],
    },
    {
      kind: "warn",
      text: "The loudest trap on the board: MySQL's || is LOGICAL OR, not concatenation. The same characters that join strings in SQLite silently turn a filter into a logic bug in MySQL — WHERE name || ' ' || surname becomes WHERE name OR ' ' OR surname, which matches almost everything. Divergence runs BOTH directions; never assume a spelling is harmless somewhere else.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite's parser accepts \"x\", `x` and [x] for identifiers and both SUBSTR and SUBSTRING — deliberately forgiving, because its job is importing data from everywhere. Forgiveness is an import feature, not a portability target: write the standard spelling anyway.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres speaks both SUBSTR and the standard SUBSTRING(x FROM y FOR z), both || and CONCAT (with different NULL behavior!), and adds ::type cast shorthand — CAST(x AS integer) and x::integer are the same call. Its date arithmetic uses INTERVAL literals: created_at + INTERVAL '3 days'.",
    },
    {
      kind: "dialect",
      db: "bigquery",
      text: "BigQuery's dates are types (DATE vs DATETIME vs TIMESTAMP — casting between them is explicit), DATEDIFF is DATE_DIFF with a quoted unit, and SAFE_CAST replaces errors with NULL. There is no || ambiguity: string concatenation is ||, and CONCAT exists too.",
    },
    {
      kind: "tip",
      text: "The habit that compounds: when you meet new SQL, name its dialect before you read it — the map tells you what each token MEANS, and meaning survives translation. Every problem below is a real spelling, translated and graded against the storefront you already know by heart.",
    },
  ],
  deep: [
    {
      kind: "mind",
      text: "SQL dialects are like driving in different countries: the road rules (the standard) are 90% shared, but which side of the road, which units, which hand signals — those fork. A good driver doesn't relearn driving in London; they learn the five local deltas and apply them consciously. This lesson is the delta list: five rows on a board, fifteen spellings, one skill — arrive, identify where you are, translate your intent, check the local rules (the clamp surprise, the NULL concat, the || that means OR), and drive.",
    },
    {
      kind: "engine",
      title: "One translation, end to end",
      steps: [
        "Arrive: `SELECT TOP 3 id, total FROM orders ORDER BY total DESC` — TOP says SQL Server immediately.",
        "Meaning: 'the three heaviest orders, heaviest first' — a sentence any engine's planner understands.",
        "Local spelling: LIMIT 3 — SQLite's (and MySQL's, Postgres's) row limit.",
        "Semantics check: ORDER BY total DESC before LIMIT — clause order is identical here, no reordering needed.",
        "Verify against known data: 1088.44, 945.21, 39845.92 — the storefront's heavy hitters, unchanged. Translation complete and PROVEN.",
      ],
    },
    {
      kind: "myth",
      myth: "Standard SQL means my query runs everywhere unchanged.",
      truth:
        "The core does; the edges don't — and the edges (dates, strings, NULLs, casts) are where business logic lives. Portability is a practice: write the core by default, and when you must touch an edge, isolate and test it per engine.",
    },
    {
      kind: "myth",
      myth: "If it compiles, it means the same thing.",
      truth:
        "date('2024-01-31', '+1 month') compiles everywhere the function exists and returns different answers by engine. '12,500' > '1500' is FALSE here and TRUE in engines that parse numbers first. Compile-success is the START of the dialect question, not the end.",
    },
    {
      kind: "edge",
      items: [
        { c: "The same query, two engines, different ROW ORDER", r: "Without ORDER BY, row order is undefined — SQLite often returns rowid order, Postgres returns heap order. 'It worked on dev' was never a guarantee; every graded problem here pins its order explicitly." },
        { c: "MySQL says 1/2 = 0 — so does SQLite. So why the fuss?", r: "Because SQL Server's 1/2 is also 0 but BigQuery's is 0.5 (its INT64 division still truncates, but literals differ) — and because the FIX (multiply by 1.0) must land in the right place. Division semantics are 'mostly shared' — the dangerous kind of shared." },
        { c: "A query uses DATEDIFF(day, start, end) with TIME components", r: "SQL Server counts boundary crossings: same-day 23:00→23:30 is 0 days, 23:59→00:01 is 1. Elapsed julianday gives 0.02 and 0.014. Translate the MEANING (billing-day count?) not the tokens — the unit quoted tells you which contract you're honoring." },
        { c: "The team standardizes on COALESCE everywhere", r: "Good — it's standard AND variadic: COALESCE(a, b, c, 'default'). The dialect spellings (IFNULL/NVL/ISNULL) are two-argument cousins. One function to remember, one NULL policy to state." },
        { c: "Someone writes `\"name\"` in MySQL and gets a column called name", r: "MySQL treats double quotes as STRINGS by default (ANSI_QUOTES flips it) — so \"name\" is the literal 'name', not the identifier. The same characters, the opposite meaning: quote identifiers per the dialect you're IN, not the one you came from." },
      ],
    },
  ],
  mcqs: mcqBank("l76", MCQS),
  problems: probBankX("l76", PROBS),
  takeaway:
    "Five ideas, fifteen spellings, one skill: identify the dialect, extract the meaning, write the local form, verify against known data — and when month arithmetic or NULL concat is involved, check the SEMANTICS table too, because that's where compile-success quietly lies.",
};
