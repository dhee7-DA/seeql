// Drill set — CAST & typeof (Module 5, secondary, 45 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): CAST(price AS
// INTEGER) truncates toward zero — 89.99→89, 34.5→34, 199.99→199,
// 42.5→42 — while whole-dollar rows pass through (49→49, 129→129); 10 of
// 16 products lose cents, 6 keep equality (49, 119, 129, 79, 65, 32).
// Text coercion never errors: '42'→42, 'abc'→0, '3.9'→3, ''→0, '42abc'→42
// (leading digits parse), 'abc42'→0, '-34.5'→-34, ' 42 '→42 (whitespace
// skipped), '+42'→42, '- 42'→0 (space after the sign breaks the parse),
// '1e3'→1 (stops at the e), '0x1A'→0. typeof census: customers
// id/name/region/active/created_at = integer/text/text/integer/text;
// orders id/total/status/created_at = integer/real/text/text;
// products.price real, stock integer; typeof(NULL) = 'null'; the five
// classes are null/integer/real/text/blob. active is INTEGER 0/1: 14
// ones, 2 zeros (Dmitri Volkov, Keiko Sato), SUM=14, COUNT=16,
// AVG=0.875, WHERE active='true' → 0 rows vs active=1 → 14 rows.
// Money: 103 orders, SUM(total)=34833.28, AVG=338.1871844660194,
// MIN=25.47, MAX=1088.44; casts give 34833/338/25/1088; only 2 orders
// have whole-dollar totals; Chloe Dubois's raw 5-order SUM prints
// 2667.9300000000003 (binary-float artifact; Alice's 7262.35 prints
// clean). Arithmetic coercion: '42'+8=50 (integer), '3.9'+0=3.9 (real),
// 'abc'+0=0, 'Alice Chen'+'Berlin'=0, '42abc'+0=42, 'abc42'+0=0,
// '1e3'+0=1000.0 (real), '0x1A'+0=0. CAST AS TEXT renders 89→'89',
// 89.0→'89.0', 34.5→'34.5', 1088.44→'1088.44'; CAST('abcdef' AS
// VARCHAR(3)) = 'abcdef' (length ignored); unknown type names are
// silently accepted — CAST(89.99 AS INGEGER) = 89.99 real, CAST(90 AS
// BOOLEAN) = 90 integer. Comparisons: WHERE total > '999' finds the
// 1088.44 row (numeric affinity converts the literal), total='1088.44'
// matches 1 row, total='abc' matches 0; '1088.44' < '25.47' is TRUE as
// text. Aggregates: typeof(COUNT(*)) = 'integer', AVG/SUM/MAX over REAL
// = 'real', SUM(active) = 'integer'. 7/2 = 3 (integer division),
// 7.0/2 = 3.5, 1/0 = NULL, 0/0 = NULL. ROUND is half-away-from-zero and
// returns REAL (2.5→3.0, 3.5→4.0, -2.5→-3.0, -34.5→-35.0, ROUND(89.99)
// = 90, ROUND(338.19,1) = 338.2, ROUND(25.47,1) = 25.5); CAST truncates
// (CAST(2.5)=2, CAST(3.5)=3, CAST(-34.5)=-34). PRINTF('%.2f', 1088.44)
// = '1088.44' (typeof text); PRINTF('%04d', 1) = '0001'. NULL poisons:
// LENGTH(NULL), UPPER(NULL), CAST(NULL AS INTEGER), 'x'||NULL all NULL.
// Expression slots: GROUP BY CAST(total AS INTEGER) buckets all 103
// orders (top buckets tie at 2), WHERE CAST(total AS INTEGER) >= 1000
// keeps 1 row, ORDER BY CAST(price AS INTEGER) sorts the shelf;
// lowercase cast(...) and TYPEOF(...) both parse. Verbatim errors:
// CAST(price) → near ")": syntax error; typeof() / typeof(a,b) → wrong
// number of arguments to function typeof(); price::INTEGER →
// unrecognized token: ":"; INTEGER(price) → no such function: INTEGER;
// typeif(total) → no such function: typeif; CAST(price AS) parses
// without error; CAST(price AS INGEGER) → no error at all.
// Writable-copy probes: UPDATE orders SET total = CAST(total AS TEXT)
// leaves typeof 'real' on all 103 rows (REAL column affinity
// re-converts on write; total > 500 still finds 25 rows); UPDATE
// customers SET region = CAST(region AS INTEGER) leaves 16 rows of text
// '0' (CAST junks EU→0, the TEXT affinity re-renders it); SUBSTR year
// prefix '2024' is text until CAST makes it integer 2024; CAST(3.7 AS
// INT) = 3 (INT is an accepted alias).

import type { DrillQ } from "../types";

const KW = "CAST & typeof";

export const TYPE_CAST_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-cs-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which is the correct SQLite spelling for forcing a value's type?",
    choices: [
      "`CAST(price AS INTEGER)`",
      "`CAST(price, INTEGER)`",
      "`price::INTEGER`",
      "`INTEGER(price)`",
    ],
    answer: 0,
    why: "CAST takes exactly one form: CAST(value AS type). Probed on products: 89.99 → 89. The comma form dies at 'near \")\": syntax error', :: is Postgres shorthand ('unrecognized token: \":\"'), and INTEGER(price) is 'no such function: INTEGER'.",
    notes: [
      { choice: 2, why: "Postgres' :: shorthand — SQLite answers 'unrecognized token: \":\"'. One spelling per engine; know which one you're typing." },
      { choice: 3, why: "It looks like a function call, so SQLite literally looks up a function named INTEGER and answers 'no such function: INTEGER'." },
    ],
  },
  { id: "dr5-cs-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which target-type names does SQLite accept for whole-number casts?",
    choices: [
      "Only the full word INTEGER",
      "Only the short INT",
      "Both — INT and INTEGER are accepted aliases",
      "Neither — whole numbers need INT8",
    ],
    answer: 2,
    why: "Probed: CAST(3.7 AS INT) = 3 with typeof 'integer' — identical to AS INTEGER. The target name is matched by substring rules, and both spellings select the same integer storage class.",
  },
  { id: "dr5-cs-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "You want whole-dollar order buckets. Where can `CAST(total AS INTEGER)` legally appear?",
    choices: [
      "Only in the SELECT list",
      "Only inside WHERE",
      "Any expression slot — SELECT, WHERE, GROUP BY, and ORDER BY all take it",
      "Only inside an aggregate function",
    ],
    answer: 2,
    why: "CAST is an ordinary expression. Probed: GROUP BY CAST(total AS INTEGER) buckets all 103 orders (top buckets tie at 2), WHERE CAST(total AS INTEGER) >= 1000 keeps 1 row, and ORDER BY CAST(price AS INTEGER) sorts the shelf.",
  },
  { id: "dr5-cs-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which typeof() call is valid grammar?",
    choices: [
      "`typeof(total)`",
      "`typeof()`",
      "`typeof(total, status)`",
      "`typeof *`",
    ],
    answer: 0,
    why: "typeof takes exactly one argument — any expression, any storage class. Probed: typeof(total) = 'real'; both the 0-arg and 2-arg forms die with 'wrong number of arguments to function typeof()' (verbatim).",
    notes: [
      { choice: 2, why: "One value in, one class name out. To compare two columns' types, select typeof() twice as two result columns." },
    ],
  },
  { id: "dr5-cs-05", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which statement about spelling and case is true for the type toolkit?",
    choices: [
      "Keywords and functions are case-insensitive: cast(price as integer) and TYPEOF(total) both parse",
      "CAST must be uppercase — lowercase cast is a syntax error",
      "typeof must be lowercase — TYPEOF is an unknown function",
      "SQLite rejects mixed-case SQL with a warning",
    ],
    answer: 0,
    why: "Probed: cast('42' as integer) = 42 and TYPEOF(total) = 'real' — identifiers fold case. House style keeps SQL readable, but the engine itself doesn't enforce any casing.",
  },

  // ---------- semantics ----------
  { id: "dr5-cs-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `CAST(89 AS REAL)` change?",
    choices: [
      "The storage class — typeof flips from 'integer' to 'real'",
      "Nothing — 89 is 89 in every class",
      "The value becomes the text '89.0'",
      "It errors — 89 is already numeric",
    ],
    answer: 0,
    why: "Probed: typeof(CAST(89 AS REAL)) = 'real'. The value is now a floating-point number, eligible for fractional arithmetic. Casts change the storage class first; the value follows the class.",
    notes: [
      { choice: 2, why: "Casting TO TEXT is what renders '89' as a string (probed CAST(89 AS TEXT) = '89'). Casting to REAL keeps it numeric — typeof is what changed." },
    ],
  },
  { id: "dr5-cs-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Which values can typeof() return?",
    choices: [
      "The column's declared type, like 'INTEGER' or 'VARCHAR'",
      "'null', 'integer', 'real', 'text', or 'blob' — the five storage classes",
      "'number', 'string', 'boolean' — JavaScript-style names",
      "NULL whenever the inspected value is NULL",
    ],
    answer: 1,
    why: "typeof reports the per-value storage class. Probed census: orders.total 'real', status 'text', customers.active 'integer' — and typeof(NULL) is the string 'null', not NULL. Declared types are fiction in SQLite; this is the ground truth.",
    notes: [
      { choice: 0, why: "Any column can hold any class — typeof inspects values, not schemas. That's exactly why it's the first diagnostic when behavior confuses." },
      { choice: 3, why: "The result is the four-letter text 'null' describing the missing value — the result itself is never NULL." },
    ],
  },
  { id: "dr5-cs-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `'42' + 8` return, and why?",
    choices: [
      "50 — numeric-looking text coerces to a number for arithmetic",
      "'428' — + concatenates the operands",
      "42 — the text operand wins",
      "An error — mixed types can't combine",
    ],
    answer: 0,
    why: "Probed: '42' + 8 = 50, typeof 'integer'. + is arithmetic only, and SQLite converts numeric-looking text rather than failing. Concatenation is || — the two operators never swap jobs.",
    notes: [
      { choice: 1, why: "That's ||'s job — and the mirror trap: 'Alice Chen' + 'Berlin' does arithmetic, coercing both alpha texts to 0 (probed)." },
    ],
  },
  { id: "dr5-cs-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`'3.9' + 0` vs `CAST('3.9' AS INTEGER)` — what comes back?",
    choices: [
      "3.9 and 3",
      "3 and 3 — both truncate",
      "3.9 and 3.9",
      "0 and 3",
    ],
    answer: 0,
    why: "Probed: the arithmetic coercion parses the full number and returns real 3.9; CAST AS INTEGER truncates to integer 3. Same input text, two different converters — arithmetic coerces, CAST converts and discards the fraction.",
  },
  { id: "dr5-cs-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `CAST(89.0 AS TEXT)` return?",
    choices: [
      "'89.0' — the REAL rendering keeps its decimal point",
      "'89' — trailing zeros are trimmed",
      "89 — numeric values pass through untouched",
      "NULL — REALs can't be rendered as text",
    ],
    answer: 0,
    why: "Probed: CAST(89.0 AS TEXT) = '89.0' while CAST(89 AS TEXT) = '89' — the rendering mirrors the storage class, decimals and all. CAST(34.5 AS TEXT) = '34.5' with no padded zero. Text keys built from REALs inherit these quirks.",
  },
  { id: "dr5-cs-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT COUNT(*) FROM orders WHERE total > '999'` — how many rows?",
    choices: [
      "0 — numbers never compare against text",
      "1 — the '999' literal converts to the number 999 first",
      "103 — every order passes",
      "87",
    ],
    answer: 1,
    why: "Probed: 1 row — the 1088.44 order. When a REAL-affinity column meets a text literal, SQLite applies numeric affinity to the literal: '999' becomes 999 and the comparison is numeric. total = 'abc' finds nothing (probed 0) — alpha text has no numeric form to convert to.",
    notes: [
      { choice: 0, why: "Cross-type comparisons never fail — one side converts if it can. total = '1088.44' even matches (probed 1 row): well-formed numeric text always converts." },
    ],
  },
  { id: "dr5-cs-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What storage classes do the aggregates over orders return?",
    choices: [
      "COUNT(*) integer; AVG, SUM, and MAX over total all real",
      "All four integer — orders are countable",
      "All four real — money is always real",
      "COUNT real; the rest integer",
    ],
    answer: 0,
    why: "Probed: typeof(COUNT(*)) = 'integer', typeof(AVG(total)) = 'real', typeof(SUM(total)) = 'real', typeof(MAX(total)) = 'real'. An aggregate's class follows its input: SUM over the integer active column stays 'integer' (probed), SUM over REAL money stays 'real'.",
  },
  { id: "dr5-cs-13", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "customers.active stores booleans as what — and what does COUNT(active) count?",
    choices: [
      "INTEGER 0/1; COUNT(active) counts every non-NULL — 16 here, the two 0s included",
      "TEXT 'true'/'false'; COUNT returns 14",
      "INTEGER 0/1; COUNT skips the 0s and returns 14",
      "A dedicated BOOLEAN storage class; COUNT returns 16",
    ],
    answer: 0,
    why: "Probed: typeof(active) = 'integer'; census is 14 ones and 2 zeros (Dmitri Volkov, Keiko Sato). COUNT(active) = 16 because 0 is a value, not a missing one; SUM(active) = 14 is the actual count of trues.",
    notes: [
      { choice: 2, why: "COUNT only skips NULL — and no active value is NULL. When you want just the trues, that's SUM(active) = 14 or WHERE active = 1 (also probed 14)." },
    ],
  },
  { id: "dr5-cs-14", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What is `7 / 2` in SQLite, and what decides it?",
    choices: [
      "3 — both operands are INTEGER, so the division is integer division",
      "3.5 — division always promotes to REAL",
      "4 — SQLite rounds the result to nearest",
      "An error — integers can't divide",
    ],
    answer: 0,
    why: "Probed: 7/2 = 3 (typeof 'integer'), 7.0/2 = 3.5 (typeof 'real'). Operand classes drive the operator: one REAL promotes the whole expression. The 1.0 * trick exists to force that promotion before the damage is done.",
    notes: [
      { choice: 1, why: "Promotion only happens when a REAL is actually present. Two integers in, integer math out — the fraction is gone before rounding could matter." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-cs-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "What does `CAST(NULL AS INTEGER)` return?",
    choices: [
      "NULL — casts propagate missing values; typeof still reports 'null'",
      "0 — casts manufacture a zero",
      "'' — the empty string",
      "An error — NULL has no type to cast",
    ],
    answer: 0,
    why: "Probed: CAST(NULL AS INTEGER) = NULL and typeof(CAST(NULL AS INTEGER)) = 'null'. NULL rides through every cast untouched — only COALESCE makes the decision to substitute. CAST(NULL AS TEXT) is equally NULL (probed).",
    notes: [
      { choice: 1, why: "The zero instinct confuses junk text ('abc' → 0) with missing data. NULL in, NULL out — the value is unknown, not zero." },
    ],
  },
  { id: "dr5-cs-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "CAST('abc' AS INTEGER) returns 0. What does typeof() say about that result?",
    choices: [
      "'integer' — a genuine typed zero was manufactured",
      "'text' — the input's class persists",
      "'null' — junk casts to nothing",
      "typeof errors on cast results",
    ],
    answer: 0,
    why: "Probed: typeof(CAST('abc' AS INTEGER)) = 'integer'. The junk didn't stay text — CAST produced a real integer 0 that passes IS NOT NULL, adds into SUMs, and looks exactly like a legitimate zero. That's how cast-then-aggregate poisons money silently.",
    notes: [
      { choice: 1, why: "The entire point of CAST is to change the class — the output is integer even when the input was unparseable." },
    ],
  },
  { id: "dr5-cs-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`CAST(-34.5 AS INTEGER)` returns…",
    choices: [
      "-34 — truncation is toward zero on both sides of the axis",
      "-35 — the fraction is floored",
      "-34.5 — a no-op on negatives",
      "-4 — it rounds away from zero",
    ],
    answer: 0,
    why: "Probed: -34.5 → -34 and -3.9 → -3 — the fraction is discarded toward zero, like int() in most languages. FLOOR would give -35; ROUND(-34.5) gives -35.0 (probed). Three functions, three different negative answers.",
    notes: [
      { choice: 3, why: "Half-away-from-zero rounding is ROUND's contract (probed -34.5 → -35.0), not CAST's — CAST never looks at the fraction's size." },
    ],
  },
  { id: "dr5-cs-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "One customer's spend SUM prints 2667.9300000000003 before any ROUND. What happened?",
    choices: [
      "A SUM bug — report it to the engine vendor",
      "REALs accumulate binary-float error across additions — .93 isn't exactly representable",
      "The total column stored too many decimals",
      "A NULL leaked into the sum",
    ],
    answer: 1,
    why: "Probed raw: Chloe Dubois, 5 orders, SUM(total) = 2667.9300000000003 — most 2-decimal money has no exact binary representation and additions accumulate the drift (Alice's 7262.35 happens to print clean). Fix at the edge with ROUND(..., 2) for display; never write 'corrected' values back.",
    notes: [
      { choice: 0, why: "It's IEEE-754, not a defect — the same in every language. You can't predict which sums will wobble, which is why display rounding is routine." },
    ],
  },
  { id: "dr5-cs-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Which pair matches the engine on the half-values 2.5 and 3.5?",
    choices: [
      "CAST gives 2 and 3 (truncate); ROUND gives 3.0 and 4.0 (half away from zero)",
      "CAST gives 3 and 4 (round); ROUND gives 2 and 3 (truncate)",
      "Both give 3 and 4",
      "Both give 2 and 3",
    ],
    answer: 0,
    why: "Probed: CAST(2.5 AS INTEGER) = 2, CAST(3.5 AS INTEGER) = 3, ROUND(2.5) = 3.0, ROUND(3.5) = 4.0 — and ROUND(-2.5) = -3.0, away from zero. Truncation drops the fraction blindly; rounding looks at the neighbors.",
    notes: [
      { choice: 2, why: "That's ROUND-only behavior. CAST never rounds — a label that must show 90 for 89.99 needs ROUND (probed 90), not CAST (probed 89)." },
    ],
  },
  { id: "dr5-cs-20", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "What is `'abc42' + 0`?",
    choices: [
      "0 — coercion reads the leading numeric prefix, and 'abc' has none",
      "42 — the trailing digits are found and used",
      "'abc42' — text passes through arithmetic unchanged",
      "An error — malformed number",
    ],
    answer: 0,
    why: "Probed: 'abc42' + 0 = 0 (typeof 'integer'). Text-to-number coercion is left-anchored: it reads the longest prefix that looks like a number, so leading-alpha text yields 0. The mirror case '42abc' + 0 = 42 (probed) — leading digits parse, trailing junk is ignored.",
    notes: [
      { choice: 1, why: "There's no scan-and-find — parsing starts at position 1 or not at all. That's why 'EU' and 'APAC' style keys both coerce to 0 (probed)." },
    ],
  },
  { id: "dr5-cs-21", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "What does `CAST(' 42 ' AS INTEGER)` return (the literal includes the spaces)?",
    choices: [
      "42 — leading and trailing whitespace is skipped by the parser",
      "0 — the spaces count as junk",
      "An error — the literal is malformed",
      "NULL — whitespace means the value is missing",
    ],
    answer: 0,
    why: "Probed: CAST(' 42 ' AS INTEGER) = 42, and CAST('+42' AS INTEGER) = 42 — the text-to-integer parser tolerates surrounding whitespace and an explicit sign. One boundary: '- 42' (space after the sign) parses to 0 (probed).",
    notes: [
      { choice: 1, why: "Junk means unparseable characters — padding spaces are tolerated. Don't lean on it: TRIM at the source keeps keys honest." },
    ],
  },
  { id: "dr5-cs-22", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`CAST('1e3' AS INTEGER)` and `'1e3' + 0` — what do they return?",
    choices: [
      "1 and 1000.0 — the cast stops at the 'e', the arithmetic parses the exponent",
      "1000 and 1000 — both parse the scientific form fully",
      "1 and 1 — both stop at the 'e'",
      "Both error — scientific notation is unsupported",
    ],
    answer: 0,
    why: "Probed: the integer cast reads the leading '1' and stops at the letter → 1; arithmetic coercion parses the full scientific form → real 1000.0 (typeof 'real'). Hex fares no better in either: CAST('0x1A' AS INTEGER) = 0 and '0x1A' + 0 = 0 (probed). Same string, two converters, two answers.",
    notes: [
      { choice: 1, why: "Only the arithmetic path understands exponents — expect 1, not 1000, from the cast. The classic 'why is my metric a thousandth of itself' receipt." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-cs-23", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT CAST(price) FROM products` — what does SQLite say?",
    choices: [
      "'near \")\": syntax error' — CAST requires AS plus a type name",
      "'no such function: CAST'",
      "It runs — price passes through unchanged",
      "'ambiguous column name: price'",
    ],
    answer: 0,
    why: "Probed verbatim: near \")\": syntax error. CAST's grammar is rigid — value, AS, type — and the parser hits the closing paren before any type appears. There is no argument-list form of CAST to fall back on.",
    notes: [
      { choice: 1, why: "CAST is syntax, not a function — that's why the complaint comes from the parser ('near ...') and not the function resolver." },
    ],
  },
  { id: "dr5-cs-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT typeof() FROM orders` — what's the failure?",
    choices: [
      "'wrong number of arguments to function typeof()'",
      "'no such function: typeof'",
      "It runs and returns 'null'",
      "'near \"()\": syntax error'",
    ],
    answer: 0,
    why: "Probed verbatim on both the 0-arg call and the 2-arg call typeof(total, status): wrong number of arguments to function typeof(). typeof takes exactly one argument — and the message names the function for you, which makes it a fast fix.",
  },
  { id: "dr5-cs-25", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "You typo the target: `SELECT CAST(89.99 AS INGEGER)`. What happens?",
    choices: [
      "No error — SQLite accepts any type name, and 89.99 comes back REAL, untruncated",
      "'near \"INGEGER\": syntax error'",
      "'no such type: INGEGER'",
      "It truncates to 89 anyway — type names are fuzzy",
    ],
    answer: 0,
    why: "Probed: CAST(89.99 AS INGEGER) = 89.99 with typeof 'real' — unknown type names are silently tolerated (the same probe passes for BANANA), and non-integral values pass through unchanged. The typo'd cast looks identical to a working one until typeof() says otherwise.",
    notes: [
      { choice: 3, why: "Only names containing INT trigger integer conversion — INGEGER doesn't. The engine won't guess your intent; verify casts with typeof()." },
    ],
  },
  { id: "dr5-cs-26", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT typeif(total) FROM orders` — the function name is mistyped. Result?",
    choices: [
      "'no such function: typeif'",
      "It silently returns total unchanged",
      "NULL for every row",
      "'near \"typeif\": syntax error'",
    ],
    answer: 0,
    why: "Probed verbatim: no such function: typeif. Unknown functions fail loudly — unlike unknown CAST type names, which are tolerated (probed). That asymmetry is worth memorizing: typo the function, you hear about it; typo the type, you don't.",
  },
  { id: "dr5-cs-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT price::INTEGER FROM products` — the Postgres shorthand. What does SQLite say?",
    choices: [
      "'unrecognized token: \":\"'",
      "It works — :: is standard SQL everywhere",
      "'no such function: ::'",
      "It treats :: as a column alias separator",
    ],
    answer: 0,
    why: "Probed verbatim: unrecognized token: \":\". SQLite has exactly one cast spelling — CAST(x AS T) — and the tokenizer rejects the colon before the type is even reached. Dialect shorthand is the most portable-shaped syntax error there is.",
  },
  { id: "dr5-cs-28", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT 1 / 0` — division by zero. What does SQLite return?",
    choices: [
      "NULL — no error; division by zero yields NULL and propagates",
      "An error: division by zero",
      "0",
      "Infinity",
    ],
    answer: 0,
    why: "Probed: 1/0 = NULL and 0/0 = NULL, typeof 'null'. SQLite refuses to crash on arithmetic — it hands back NULL instead, which then quietly nulls whatever it touches. The failure mode is silence, not a stack trace.",
    notes: [
      { choice: 2, why: "Zero would lie about a computation that never happened. NULL says 'undefined' — which is why denominators get NULLIF'd or filtered first." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-cs-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) FROM products WHERE price != CAST(price AS INTEGER)`.",
    choices: ["10", "16", "6", "0"],
    answer: 0,
    why: "Probed: 10 of the 16 products carry cents and lose them to truncation (89.99 → 89, 34.5 → 34, 59.99 → 59 …). The other 6 are whole-dollar prices (49, 119, 129, 79, 65, 32) where the cast is a no-op and equality survives.",
  },
  { id: "dr5-cs-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT CAST(SUBSTR(created_at, 1, 4) AS INTEGER) FROM orders LIMIT 1`.",
    choices: [
      "2024 — a real integer",
      "'2024' — a text string",
      "24 — the century is dropped",
      "An error — dates can't cast",
    ],
    answer: 0,
    why: "Probed: SUBSTR returns the text '2024' (typeof 'text'), and the cast converts it to the integer 2024 (typeof 'integer'). That's the text→number bridge: a year prefix sliced from a date string becomes arithmetic-capable.",
    notes: [
      { choice: 1, why: "Without the CAST you'd keep typeof 'text' (probed) — fine for display, but the value is a string, and string behavior follows it everywhere." },
    ],
  },
  { id: "dr5-cs-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT CAST(MIN(total) AS INTEGER), CAST(MAX(total) AS INTEGER) FROM orders`.",
    choices: [
      "25 and 1088",
      "25.47 and 1088.44",
      "26 and 1089",
      "NULL and NULL",
    ],
    answer: 0,
    why: "Probed: MIN(total) = 25.47 → 25, MAX(total) = 1088.44 → 1088. The cast applies to each aggregate's result — truncation cuts the cents in both directions and never rounds 25.47 up to 26.",
  },
  { id: "dr5-cs-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT CAST(AVG(total) AS INTEGER) FROM orders`.",
    choices: ["338", "338.19", "339", "NULL"],
    answer: 0,
    why: "Probed: AVG(total) = 338.1871844660194 across the 103 orders; the cast truncates to 338. ROUND(AVG(total), 2) would print 338.19 — but CAST's mechanism is fraction-dropping, so even 338.9 would cast to 338.",
  },
  { id: "dr5-cs-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT SUM(active), COUNT(active) FROM customers`.",
    choices: [
      "14 and 16",
      "16 and 16",
      "14 and 14",
      "2 and 16",
    ],
    answer: 0,
    why: "Probed: SUM of the 0/1 flags adds only the trues → 14; COUNT(active) counts every non-NULL value — the two 0s included → 16. Same column, two aggregates, two different questions answered.",
  },
  { id: "dr5-cs-34", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT AVG(active) FROM customers`.",
    choices: ["0.875", "1", "0.5", "14"],
    answer: 0,
    why: "Probed: 14 trues out of 16 non-NULL flags → 14/16 = 0.875. Averages treat 0/1 boolean flags as plain numbers, handing you the active share for free — no CASE expression needed.",
  },
  { id: "dr5-cs-35", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT typeof(ROUND(338.19, 1)), ROUND(338.19, 1)`.",
    choices: [
      "'real' and 338.2",
      "'integer' and 338",
      "'text' and '338.2'",
      "'real' and 338.19",
    ],
    answer: 0,
    why: "Probed: ROUND(338.19, 1) = 338.2 with typeof 'real' — ROUND always returns REAL, while CAST AS INTEGER would give 338 as an integer. Round for readers, cast for type logic; they answer different questions.",
    notes: [
      { choice: 1, why: "That's CAST's answer (probed: CAST(AVG(total) AS INTEGER) = 338). ROUND looks at neighbors; CAST drops the fraction — and the output types differ too (real vs integer)." },
    ],
  },
  { id: "dr5-cs-36", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT typeof(PRINTF('%.2f', total)) FROM orders LIMIT 1`.",
    choices: ["'text'", "'real'", "'integer'", "'null'"],
    answer: 0,
    why: "Probed: PRINTF('%.2f', 1088.44) returns the string '1088.44' — typeof 'text'. Formatting is a type change: after PRINTF the value can't be summed or numerically sorted without coercing back. Format at the display edge; keep REAL at rest.",
  },
  { id: "dr5-cs-37", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT '42abc' + 0, typeof('42abc' + 0)`.",
    choices: [
      "42 and 'integer'",
      "0 and 'integer'",
      "'42abc' and 'text'",
      "42 and 'text'",
    ],
    answer: 0,
    why: "Probed: arithmetic coercion takes the leading numeric prefix — 42 — and returns an integer; the trailing 'abc' is ignored without a whisper. Only leading-alpha text like 'abc42' collapses to 0 (probed).",
  },
  { id: "dr5-cs-38", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT typeof(created_at) FROM orders LIMIT 1`.",
    choices: [
      "'text' — ISO date strings are TEXT, not a date type",
      "'date' — SQLite has a DATE storage class",
      "'integer' — dates are stored as epoch numbers",
      "'real' — dates are stored as Julian day numbers",
    ],
    answer: 0,
    why: "Probed census: created_at is 'text' in both orders and customers. SQLite has no DATE storage class — dates are ISO strings that date functions parse at read time. The year prefix is TEXT until you CAST it (probed '2024' → 2024 integer).",
    notes: [
      { choice: 2, why: "Epoch integers are a convention some schemas choose — this one didn't. typeof() tells you which world you're in before any date math." },
    ],
  },
  { id: "dr5-cs-39", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT CAST(SUM(total) AS INTEGER) FROM orders`.",
    choices: ["34833", "34833.28", "34834", "NULL"],
    answer: 0,
    why: "Probed: SUM(total) = 34833.28 over the 103 orders; the cast truncates the .28 away — 33 cents of ledger vanish without a trace. Whole-unit counts are a legitimate cast; money display should ROUND instead, which would keep 34833.28 honest.",
  },

  // ---------- judgment ----------
  { id: "dr5-cs-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Shelf labels must show whole dollars (89.99 → 89). Where does the cast belong?",
    choices: [
      "In the display query's SELECT list — the REAL price stays intact at rest",
      "In a one-time UPDATE: SET price = CAST(price AS INTEGER)",
      "Inside SUM(price), before any averaging",
      "In the CREATE TABLE column default",
    ],
    answer: 0,
    why: "Probed truncation: 89.99 → 89, 34.5 → 34, 199.99 → 199. Cast at read time for that one label; the stored REAL keeps funding every future aggregate exactly. Rewriting storage bakes the truncation into history.",
    notes: [
      { choice: 1, why: "That's one-way data loss — the cents can never be recovered, and every future report inherits the truncation. Display transforms belong in display queries." },
    ],
  },
  { id: "dr5-cs-41", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A column 'looks numeric but compares like text'. What's the first diagnostic?",
    choices: [
      "typeof(col) — ask the engine what storage class the values actually are",
      "CAST the column to INTEGER everywhere it's used",
      "Re-index the table",
      "Add a WHERE clause filtering NULLs",
    ],
    answer: 0,
    why: "typeof is the X-ray: probed census shows total 'real', status 'text', active 'integer', created_at 'text' — declared types are fiction, per-value classes are fact. Casting first hides the diagnosis and manufactures zeros for junk (probed 'abc' → 0).",
    notes: [
      { choice: 1, why: "A blind CAST changes behavior everywhere it lands and never tells you what was wrong. Diagnose with typeof, then decide deliberately." },
    ],
  },
  { id: "dr5-cs-42", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "customers.active is INTEGER 0/1. A teammate writes WHERE active = 'true'. Verdict?",
    choices: [
      "0 rows — 'true' is text with no numeric form; the flag compares against 1/0",
      "14 rows — text booleans compare fine",
      "An error — type mismatch",
      "All 16 rows",
    ],
    answer: 0,
    why: "Probed: WHERE active = 'true' → 0 rows, while WHERE active = 1 → 14. The integer flag values can't convert 'true' into a number, so nothing matches — and SQLite doesn't error, it just finds nothing. SQL booleans here are integers: compare with 1/0.",
    notes: [
      { choice: 1, why: "The silent-zero-rows trap: the query runs, returns nothing, and looks like missing data. typeof(active) = 'integer' (probed) ends the debate." },
    ],
  },
  { id: "dr5-cs-43", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Totals were cast to TEXT for a 'sort fix'. Which sorts first as text: '25.47' or '1088.44'?",
    choices: [
      "'1088.44' — text compares character by character, and '1' < '2'",
      "'25.47' — numbers compare by value even when cast to text",
      "They tie — equal after the cast",
      "Unpredictable — text order is arbitrary",
    ],
    answer: 0,
    why: "Probed: '1088.44' < '25.47' is TRUE as text — lexical comparison walks characters, so 1 beats 2 regardless of magnitude. Numeric order needs numeric storage; CAST AS TEXT doesn't fix sorting, it breaks it.",
    notes: [
      { choice: 1, why: "Once values are TEXT, the engine compares strings — full stop. If a sort looks wrong, typeof() the sort key before rewriting the query." },
    ],
  },
  { id: "dr5-cs-44", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate 'cleans' regions: UPDATE customers SET region = CAST(region AS INTEGER). What's in the column after?",
    choices: [
      "16 rows of '0' — CAST junks every region to integer 0, then the TEXT column re-renders it as text",
      "EU/APAC/US/LATAM intact — UPDATEs refuse lossy casts",
      "Integer 0 in every row — typeof reports 'integer'",
      "NULL in every row",
    ],
    answer: 0,
    why: "Probed on a scratch copy: CAST('EU' AS INTEGER) = 0, and the region column's TEXT affinity converts the stored 0 back to '0' — all 16 rows, typeof still 'text', no error anywhere. Affinity has the final word on write (the same trick on orders.total re-converts to real). The regions are gone.",
    notes: [
      { choice: 2, why: "Close — CAST does produce integer 0 — but the column's affinity is applied before storage, so what lands is text '0'. typeof() after the damage proves it." },
    ],
  },
  { id: "dr5-cs-45", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The spec says 89.99 displays as 90 (nearest dollar). The dev used CAST(price AS INTEGER) and got 89. The fix?",
    choices: [
      "ROUND(price, 0) — nearest-dollar is a value change; CAST is a type change",
      "CAST(price AS REAL) — promote it, then it rounds",
      "LENGTH(price) — measure it, then adjust",
      "Store 90 in the products table",
    ],
    answer: 0,
    why: "Probed: ROUND(89.99) = 90 while CAST(89.99 AS INTEGER) = 89. The spec asks a value question ('nearest'); CAST answers a type question ('drop the fraction'). Same input, different functions, different contracts — and ROUND returns REAL (typeof 'real') ready for display.",
    notes: [
      { choice: 3, why: "Hard-coding a display decision into storage corrupts the source of truth — the same price feeds labels, receipts, and sums." },
    ],
  },
];
