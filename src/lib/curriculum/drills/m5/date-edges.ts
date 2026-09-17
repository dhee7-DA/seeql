// Drill set — Date math edges (Module 5, secondary, 45 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): 21 of 103 orders have
// shipped_at NULL; AVG(julianday(shipped_at)-julianday(created_at)) = 2.98
// days (raw 2.975610; min 2, max 4) over 82 rows — identical with or without
// the IS NOT NULL guard; gap census 2:27, 3:30, 4:25 (all diffs whole floats —
// timestamps are date-only), diff > 3 → 25, exactly 3 → 30, CAST(AVG) = 2 vs
// ROUND(AVG,0) = 3; JULIANDAY('2024-01-01') = 2460310.5 but JULIANDAY('2024-01')
// = NULL (month-only refused) and unpadded '2024-3-1' / '2024-01-5' all NULL;
// JULIANDAY('2024') = 2024 (bare number = raw Julian day; DATE(2024) =
// '-4707-06-09') and
// JULIANDAY('1000000') = 1000000; impossible dates ROLL OVER silently:
// DATE('2024-02-30') = '2024-03-01', DATE('2023-02-29') = '2023-03-01'
// (= 2460004.5 = JULIANDAY('2023-03-01')), strftime('%Y-%m','2024-02-30') =
// '2024-03'; invalid modifiers fail silent-NULL (DATE('2024-01-05','nonsense')
// = NULL, julianday('2024-01-05','2024-01-10') = NULL — 2nd arg is a modifier);
// %Y-%m census 14 buckets 2024-01:8 … 2025-02:7 (2024:90, 2025:13; busiest
// 2024-02 and 2024-09 at 9; quietest 2024-06, 2024-11, 2025-01 at 6);
// %m alone = 12 buckets, Jan merged 8+6 = 14; SUBSTR(created_at,1,7) and
// DATE(created_at,'start of month') both give byte-identical 14 buckets
// (8, 9, 8, 7, 8 …); GROUP BY raw created_at = 84 buckets (103 rows on 84
// distinct days: 15 days hold 2 orders, 2024-10-13 and 2024-05-12 hold 3);
// TEXT traps: '2024-10-12' < '2024-3-1' is TRUE (padding lost), '2024-02-15'
// = '2024-2-15' is FALSE, shipped_at - created_at = 0 for ALL 82 shipped rows
// (coerces to 2024-2024), typeof(strftime(...)) = text; boundaries: Feb-2024
// half-open >= '2024-02-01' AND < '2024-03-01' = 9 = LIKE '2024-02-%' = 9 =
// BETWEEN '…02-01' AND '…02-28' = 9 (ZERO orders on 2024-02-29 or
// 2024-03-01 — the BETWEEN pattern is right-by-luck); LIKE '2024-2-%' = 0;
// DATE('2024-01-31','+1 month') = '2024-03-02' (overflow spill);
// DATE('2024-01-05','weekday 1') = '2024-01-08' (next Monday);
// DATE('2024-02-11','start of month','+1 month','-1 day') = '2024-02-29'
// (2025-02-11 → '2025-02-28'); %w: 0=Sunday, 2024-01-05 (Friday) → '5',
// census 0:16 1:20 2:16 3:16 4:9 5:18 6:8; CAST truncates 4.75 → 4
// (ROUND → 5) and −4.75 → −4; %j: '2024-02-29' → '060' vs '2025-02-28' →
// '059'; invoices: 28 rows in 13 buckets from 2024-02 (2024-01 has ZERO;
// first issued_on 2024-02-05), due_on−issued_on = exactly 30.0 over all 28;
// expenses: 14 buckets 2024-01…2025-02, 2024-08 spikes at 3210 (others
// 1440–1974); verbatim errors: no such function: YEAR / MONTH / DATEDIFF /
// DATE_TRUNC.

import type { DrillQ } from "../types";

const KW = "Date math edges";

export const DATE_EDGES_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-de-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which expression slices orders into one bucket per calendar month?",
    choices: [
      "`strftime('%Y-%m', created_at)`",
      "`strftime('%m', created_at)`",
      "`DATE(created_at)`",
      "`MONTH(created_at)`",
    ],
    answer: 0,
    why: "'%Y-%m' keeps the year AND the zero-padded month — the canonical bucket key. Probed: it forms exactly 14 buckets spanning 2024-01 through 2025-02.",
    notes: [
      { choice: 1, why: "'%m' alone renders '01' for both Januarys — 12 buckets with Jan-2024 (8) and Jan-2025 (6) merged into one." },
      { choice: 3, why: "MONTH() doesn't exist in SQLite — verbatim error 'no such function: MONTH'. The extractor is the format code %m." },
    ],
  },
  { id: "dr5-de-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which function turns a stored date like '2024-01-05' into a number you can subtract for gap math?",
    choices: [
      "`julianday(created_at)`",
      "`EPOCH(created_at)`",
      "`created_at + 0`",
      "`NUM(created_at)`",
    ],
    answer: 0,
    why: "julianday maps ISO text onto a fractional day count — probed: julianday('2024-01-01') = 2460310.5. Subtract two of them and the difference is the gap in days.",
    notes: [
      { choice: 2, why: "Adding zero coerces the text to its LEADING integer: '2024-01-05' becomes 2024 — the year, not a day count. Every such gap computes to 0." },
      { choice: 1, why: "EPOCH() isn't SQLite — verbatim error 'no such function'. Unix seconds would be strftime('%s', …) territory, not EPOCH." },
    ],
  },
  { id: "dr5-de-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which call lands on the FIRST day of the NEXT month?",
    choices: [
      "`DATE(d, 'start of month', '+1 month')`",
      "`DATE(d, 'next month')`",
      "`DATE(d, '+30 days')`",
      "`DATE(d, 'start of next month')`",
    ],
    answer: 0,
    why: "Modifiers chain left to right: 'start of month' snaps to the 1st (probed: 2024-01-05 → 2024-01-01), then '+1 month' steps forward — '2024-02-01'.",
    notes: [
      { choice: 1, why: "'next month' is not a modifier SQLite knows — and unknown modifiers don't error, they return NULL silently (probed with 'nonsense')." },
      { choice: 2, why: "+30 days drifts with month length: Jan 5 + 30 days = Feb 4, not Feb 1. Calendar snapping is modifier territory, not day arithmetic." },
    ],
  },
  { id: "dr5-de-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which GROUP BY works on SQLite, Postgres AND MySQL for the month-bucket report?",
    choices: [
      "`GROUP BY strftime('%Y-%m', created_at)` — the expression",
      "`GROUP BY mon` — the SELECT alias",
      "`GROUP BY 1` — the output position",
      "`GROUP BY created_at` — the raw column",
    ],
    answer: 0,
    why: "Repeating the expression is accepted by all three engines, always. Alias and position grouping are SQLite/MySQL leniencies that Postgres rejects — probed on SQLite all three alias/position forms give the same 14 buckets, which is why the habit spreads.",
    notes: [
      { choice: 3, why: "Grouping the raw timestamp makes a bucket per distinct day — 84 of them here, not 14. Slice first, then group." },
    ],
  },
  { id: "dr5-de-05", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which WHERE clause selects every February 2024 order regardless of day?",
    choices: [
      "`WHERE created_at >= '2024-02-01' AND created_at < '2024-03-01'`",
      "`WHERE created_at = '2024-02'`",
      "`WHERE created_at LIKE '2024-02'`",
      "`WHERE created_at IN ('2024-02-01', '2024-02-02')`",
    ],
    answer: 0,
    why: "The half-open range [Feb 1, Mar 1) catches the whole month — probed: 9 orders. B and C compare a 10-character date against a 7-character label; byte-exact text comparison never matches.",
    notes: [
      { choice: 3, why: "IN lists explicit values — two days out of twenty-nine. Dates need ranges, and ranges need the < next-month upper bound." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr5-de-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `julianday('2024-01-01')` return?",
    choices: [
      "2460310.5 — a fractional day count",
      "'2024-01-01' — the text passes through",
      "1970 — days since the Unix epoch",
      "An error — dates aren't numbers",
    ],
    answer: 0,
    why: "Probed exactly: 2460310.5. The .5 is the Julian convention of counting days from noon — the point is that a date has become a NUMBER, so subtraction measures gaps.",
    notes: [
      { choice: 2, why: "1970-epoch seconds are unixepoch()/strftime('%s') territory. julianday uses its own scale — day 2460310.5 for New Year 2024." },
    ],
  },
  { id: "dr5-de-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`julianday(shipped_at) - julianday(created_at)` evaluates to 4. What does the 4 mean?",
    choices: [
      "Four days elapsed from order to shipment",
      "The order ships in month 04",
      "Four units of the Julian epoch",
      "Four weeks until shipment",
    ],
    answer: 0,
    why: "The difference of two Julian day counts is a DURATION in days — decimals included when times exist. Probed census on the 82 shipped orders: gaps run 2, 3 and 4 days only (27/30/25 orders each).",
  },
  { id: "dr5-de-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`AVG(julianday(shipped_at) - julianday(created_at))` over all 103 orders returns 2.98. What happened to the 21 unshipped orders?",
    choices: [
      "julianday(NULL) is NULL and AVG skips NULLs — they left the denominator, leaving 82 rows",
      "They counted as 0 days, dragging the average down",
      "One NULL made the entire AVG NULL",
      "SQLite substituted today's date for each NULL",
    ],
    answer: 0,
    why: "NULL propagates through julianday and aggregates ignore NULLs by law — probed, the average is 2.98 over exactly 82 rows, with or without an IS NOT NULL guard. The value is honest; the denominator is what people misread.",
    notes: [
      { choice: 1, why: "NULL never coerces to 0 inside aggregates. If you WANT zero-day treatment you must COALESCE explicitly — and that fabricates instant shipments." },
    ],
  },
  { id: "dr5-de-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `typeof(strftime('%Y-%m', created_at))` return?",
    choices: ["text", "integer", "real", "date"],
    answer: 0,
    why: "strftime builds a STRING — '2024-01' is text, probed. SQLite has no date storage class; the bucket is text that sorts chronologically only because every field is zero-padded. SUBSTR and DATE(created_at,'start of month') are text too.",
    notes: [
      { choice: 3, why: "'date' isn't among SQLite's storage classes (NULL, INTEGER, REAL, TEXT, BLOB). The ISO discipline in the FORMAT is the only type system dates have." },
    ],
  },
  { id: "dr5-de-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `DATE(created_at, 'start of month')` do to order 1 (created 2024-01-05)?",
    choices: [
      "Returns '2024-01-01' — snaps back to the first of that order's month",
      "Returns '2024-01-05' — the modifier is a no-op",
      "Returns '2024-02-01' — advances to the next month",
      "Returns NULL — 'start of month' isn't a valid modifier",
    ],
    answer: 0,
    why: "Probed: 2024-01-05 → 2024-01-01. GROUP BY it and the buckets are byte-identical to strftime('%Y-%m') — 2024-01-01:8, 2024-02-01:9, 2024-03-01:8 … two spellings, one bucket.",
    notes: [
      { choice: 2, why: "'start of month' rewinds within the SAME month — stepping forward needs a second modifier, '+1 month', chained after it." },
    ],
  },
  { id: "dr5-de-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "What does `strftime('%m', created_at)` return for a Jan-2024 order vs a Jan-2025 order?",
    choices: [
      "'01' for both — the year is gone",
      "'2024-01' and '2025-01'",
      "'1' and '1' — unpadded",
      "'01-2024' and '01-2025'",
    ],
    answer: 0,
    why: "'%m' is the zero-padded month number alone: both Januarys render '01', so GROUP BY merges them. Probed: 12 distinct '%m' values, with bucket '01' holding the merged pair — 8 + 6 = 14 orders.",
    notes: [
      { choice: 1, why: "That's '%Y-%m' — the full key. The year in the label is exactly what keeps the two Januarys in separate buckets." },
    ],
  },
  { id: "dr5-de-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`DATE('2024-01-31', '+1 month')` returns…",
    choices: [
      "'2024-03-02' — Feb 31 doesn't exist, so the overflow spills into March",
      "'2024-02-29' — clamped to the month's last day",
      "'2024-02-31' — the impossible date, returned as-is",
      "NULL — the result would be invalid",
    ],
    answer: 0,
    why: "Probed: '2024-03-02'. SQLite computes Jan 31 + 1 month = Feb 31, then normalizes the overflow — and 2024 is a leap year, so Feb ends on the 29th, spilling 2 days into March. Month arithmetic has edges.",
    notes: [
      { choice: 1, why: "Clamping to month-end is what many application libraries do. SQLite spills instead — neither is wrong, but the two conventions disagree, and reports disagree with them." },
    ],
  },
  { id: "dr5-de-13", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`SELECT shipped_at - created_at FROM orders WHERE shipped_at IS NOT NULL` — what comes back?",
    choices: [
      "0 for every row — both texts coerce to their leading integer, 2024 − 2024",
      "The gap in days — ISO text dates subtract cleanly",
      "NULL for every row — text can't be subtracted",
      "An error — subtraction needs numbers",
    ],
    answer: 0,
    why: "Subtraction is arithmetic, so both sides coerce using the leading-digits rule: '2024-01-18' becomes 2024. Probed: every one of the 82 shipped rows evaluates to 0. The gap requires julianday() on both sides first.",
    notes: [
      { choice: 3, why: "It doesn't error — that's the danger. A silent wall of zeros beats a crash for corrupting reports unnoticed." },
    ],
  },
  { id: "dr5-de-14", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`DATE('2024-01-05', 'weekday 1')` returns…",
    choices: [
      "'2024-01-08' — the NEXT Monday",
      "'2024-01-01' — the Monday of that week",
      "'2024-01-05' — Friday is already a weekday",
      "'2024-01-12' — seven days later",
    ],
    answer: 0,
    why: "Probed: '2024-01-08'. 'weekday N' advances to the next occurrence of weekday N (C convention, 0 = Sunday, so 1 = Monday). From a Friday, that's forward to the 8th — never backward to the week's start.",
    notes: [
      { choice: 3, why: "+7 days would land on the 12th. 'weekday 1' is calendar-aware — it stops at the next Monday, 3 days out." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-de-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`julianday('2024-01')` — a month-only label — returns…",
    choices: [
      "NULL — the ruler refuses partial dates",
      "2460310.5 — it defaults to the 1st",
      "2024 — the leading integer",
      "An error: incomplete date",
    ],
    answer: 0,
    why: "Probed: NULL, while the full '2024-01-01' yields 2460310.5. Bucket labels are for grouping and sorting; gap math belongs on the original full timestamps — measure first, bucket second.",
    notes: [
      { choice: 2, why: "A bare numeric string IS accepted — but as a raw Julian day NUMBER: julianday('2024') = 2024, a date around 13 BC. Different trap, same family." },
    ],
  },
  { id: "dr5-de-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "One load came in as unpadded text: '2024-3-1'. `julianday('2024-3-1')` returns…",
    choices: [
      "NULL — ISO zero-padding is load-bearing",
      "2460379.5 — it parses fine",
      "'2024-3-1' — the text passes through",
      "0 — nothing valid to convert",
    ],
    answer: 0,
    why: "Probed: NULL — and the same for '2024-01-5' and '2024-1-05'. The padded form is what makes text sort as time AND what the date parser accepts. Fixed-width ISO or a real date type; anything else is a time bomb.",
  },
  { id: "dr5-de-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Comparing dates AS TEXT after the padding is lost — which comparison is TRUE?",
    choices: [
      "`'2024-10-12' < '2024-3-1'` — October sorts before March",
      "`'2024-3-1' < '2024-10-12'`",
      "`'2024-3-1' = '2024-03-01'` — same date, same text",
      "Text values can't be compared with < at all",
    ],
    answer: 0,
    why: "Probed: 1 — text comparison is character-by-character, and at the month digit '1' (from 10) sorts before '3'. The same probe shows '2024-02-15' = '2024-2-15' is FALSE: byte-exact, no numeric normalization. Padding isn't cosmetic; it IS the sort order.",
    notes: [
      { choice: 2, why: "Text equality never numeric-normalizes — padded and unpadded forms are different strings forever, which is how dedup checks silently miss rows." },
    ],
  },
  { id: "dr5-de-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "For the 21 orders with shipped_at NULL, `julianday(shipped_at) - julianday(created_at)` is…",
    choices: [
      "NULL — neither zero nor an error",
      "0 — no shipment, no gap",
      "A negative number — the gap can't be computed",
      "A runtime error that halts the query",
    ],
    answer: 0,
    why: "julianday(NULL) is NULL and one NULL poisons the whole expression — probed on the unshipped rows (ids 1, 5, 7 …). They crash nothing and count as nothing: COUNT(*) = 103 but COUNT(julianday(shipped_at) - julianday(created_at)) = 82.",
    notes: [
      { choice: 1, why: "Zero would CLAIM the order shipped instantly. NULL is the honest 'unknown' — the distinction is exactly what the 2.98-vs-denominator argument hinges on." },
    ],
  },
  { id: "dr5-de-19", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`julianday('2024')` — just a year — returns…",
    choices: [
      "2024 — a numeric string is read as a RAW Julian day number",
      "2460310.5 — the year 2024 CE",
      "NULL — the input is too short",
      "An error: unrecognized date format",
    ],
    answer: 0,
    why: "Probed: 2024 — date functions accept a bare number as an ALREADY-Julian day count (julianday('1000000') = 1000000 confirms it; the calendar rendering DATE(2024) = '-4707-06-09' shows where that lands). Your year just became an ancient date, silently.",
    notes: [
      { choice: 1, why: "The year 2024 CE needs the full padded form: julianday('2024-01-01') = 2460310.5. '2024' parses as day-number 2024, not as a calendar year." },
    ],
  },
  { id: "dr5-de-20", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`DATE('2024-01-05', 'nonsense')` returns…",
    choices: [
      "NULL — an unrecognized modifier fails silently",
      "'2024-01-05' — unknown modifiers are ignored",
      "'nonsense' — the modifier passes through",
      "An error naming the bad modifier",
    ],
    answer: 0,
    why: "Probed: NULL, no error. The same silent-NULL family: DATE('2024-01-05','%Y-%m') = NULL, and julianday('2024-01-05','2024-01-10') = NULL because the second argument is read as a modifier. Silent NULLs are date functions' ONLY failure mode — verify modifiers before trusting a NULL-heavy report.",
    notes: [
      { choice: 1, why: "SQLite never 'ignores and continues' a modifier — the whole call becomes NULL, and one NULL in a chain nulls everything downstream." },
    ],
  },
  { id: "dr5-de-21", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`DATE('2024-02-30')` — a day that doesn't exist — returns…",
    choices: [
      "'2024-03-01' — the impossible date normalizes, rolling over",
      "NULL — February 30th is invalid",
      "'2024-02-30' — the text passes through",
      "An error: day out of range",
    ],
    answer: 0,
    why: "Probed: '2024-03-01' — and DATE('2023-02-29') = '2023-03-01', whose julianday (2460004.5) matches the rolled input exactly. Calendar overflow spills FORWARD, the same normalization as '+1 month' past a month end.",
    notes: [
      { choice: 1, why: "NULL is reserved for FORMAT failures (partial, unpadded, garbage). CALENDAR failures roll over instead — two different failure modes, and only one of them leaves a trace." },
    ],
  },
  { id: "dr5-de-22", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`CAST(julianday('2024-03-20 06:00:00') - julianday('2024-03-15 12:00:00') AS INTEGER)` returns…",
    choices: [
      "4 — CAST truncates 4.75 toward zero",
      "5 — CAST rounds to nearest",
      "4.75 — CAST keeps the decimals",
      "An error — CAST rejects floats",
    ],
    answer: 0,
    why: "Probed: the raw diff is 4.75; CAST gives 4, ROUND gives 5. On THIS store every timestamp is date-only, so all 82 gaps are whole floats and the hazard hides — it wakes up the day real times get logged. Truncation also bites negatives: CAST(-4.75 AS INTEGER) = −4, not −5.",
    notes: [
      { choice: 1, why: "Rounding is ROUND()'s job — CAST(-4.75) = −4 proves CAST never rounds. Confusing the two shifts every boundary filter by a day." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-de-23", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT YEAR(created_at) FROM orders` fails. The error, and the fix?",
    choices: [
      "'no such function: YEAR' — extract years with strftime('%Y', created_at)",
      "'wrong number of arguments' — YEAR takes two",
      "It runs but returns NULL for every row",
      "'syntax error near FROM' — YEAR is a reserved word",
    ],
    answer: 0,
    why: "Verbatim probed error: no such function: YEAR. SQLite's year extractor is a format code, not a function: strftime('%Y', created_at) — the census it produces is 2024:90, 2025:13. MONTH() and DAY() fail identically ('%m', '%d').",
    notes: [
      { choice: 2, why: "Bad INPUT yields silent NULLs; an unknown FUNCTION name is a hard parse error. The two failure modes look nothing alike — know which one you're reading." },
    ],
  },
  { id: "dr5-de-24", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT DATEDIFF(shipped_at, created_at) FROM orders` — what happens?",
    choices: [
      "'no such function: DATEDIFF' — SQLite measures gaps with julianday differences",
      "It returns the gap in days, NULLs included",
      "It returns NULL for the unshipped rows only",
      "'ambiguous column name: shipped_at'",
    ],
    answer: 0,
    why: "DATEDIFF is MySQL/SQL Server spelling — verbatim probed error: no such function: DATEDIFF. The SQLite idiom is julianday(a) - julianday(b): probed, that averages 2.98 days across the 82 shipped orders.",
  },
  { id: "dr5-de-25", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT DATE_TRUNC('month', created_at) FROM orders` — verdict?",
    choices: [
      "'no such function: DATE_TRUNC' — the SQLite spelling is DATE(created_at, 'start of month')",
      "It returns '2024-01-01' per row — works fine",
      "'type error: expected a timestamp'",
      "It returns '2024-01' — month text only",
    ],
    answer: 0,
    why: "DATE_TRUNC is Postgres — verbatim probed error: no such function: DATE_TRUNC. SQLite's snap-to-month is the modifier form: probed, DATE('2024-01-05','start of month') = '2024-01-01', and its buckets match strftime('%Y-%m') exactly (8, 9, 8 …).",
    notes: [
      { choice: 3, why: "'2024-01' is strftime('%Y-%m') output — the snap-to-month keeps a full DATE ('2024-01-01'), which still sorts and shifts with date modifiers." },
    ],
  },
  { id: "dr5-de-26", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "Your month report returns 84 rows instead of 14. Which mistake did you make?",
    choices: [
      "`GROUP BY created_at` — a bucket per distinct day, and orders share days",
      "`GROUP BY strftime('%Y-%m', created_at)`",
      "`GROUP BY mon` where mon is the strftime alias",
      "`ORDER BY created_at` — the sort split the groups",
    ],
    answer: 0,
    why: "Probed: 103 orders sit on only 84 distinct created_at values — 15 days carry two orders and 2024-10-13, 2024-05-12 carry three. Grouping the raw timestamp makes a bucket per instant. Slice with strftime('%Y-%m', …) first: 14 buckets is the calendar's answer.",
    notes: [
      { choice: 3, why: "ORDER BY never changes grouping — the 84 rows are grouped wrong, not sorted wrong. Fix the GROUP BY, not the ORDER." },
    ],
  },
  { id: "dr5-de-27", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WHERE shipped_at - created_at > 3` returns 0 rows — but orders visibly take days. Diagnosis?",
    choices: [
      "The text subtraction coerces both sides to 2024; every gap computes 0",
      "> excludes boundary rows — use >= instead",
      "shipped_at is NULL on those orders",
      "The 3 needs quotes to compare against dates",
    ],
    answer: 0,
    why: "Probed: all 82 shipped rows evaluate shipped_at - created_at to exactly 0 — '2024-01-18' - '2024-01-15' is 2024 − 2024 after coercion — so > 3 keeps nothing. Wrap both sides in julianday(): the real census is 25 orders over 3 days.",
    notes: [
      { choice: 1, why: "Nothing reached the boundary — every row was 0. The bug is coercion upstream of the comparison; strictness tweaks are noise." },
    ],
  },
  { id: "dr5-de-28", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WHERE created_at LIKE '2024-2-%'` returns 0 rows, though February 2024 has orders. Why?",
    choices: [
      "The stored text is zero-padded — the month is '02', so '2024-2-%' matches nothing",
      "LIKE can't match date columns",
      "The dash must be escaped in LIKE patterns",
      "% matches exactly one character — you needed _",
    ],
    answer: 0,
    why: "LIKE is byte matching: probed, LIKE '2024-02-%' finds the 9 February orders while LIKE '2024-2-%' finds 0 — one character is the whole bug. (And % is the MULTI-char wildcard; _ is the single-char one.)",
    notes: [
      { choice: 1, why: "LIKE matches any text — it finds 90 orders for '2024-%'. The operator is fine; the pattern text was wrong." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-de-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) FROM orders WHERE created_at >= '2024-02-01' AND created_at < '2024-03-01'`.",
    choices: ["9", "8", "10", "0"],
    answer: 0,
    why: "Probed: 9 — the half-open window catches all of February 2024, matching the bucket census (2024-02 = 9, tied with 2024-09 for busiest). March's own window catches 8.",
    notes: [
      { choice: 3, why: "0 would mean the text comparison failed — it doesn't. Padded ISO compares correctly as plain text; that's the whole ISO payoff." },
    ],
  },
  { id: "dr5-de-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the FIRST row of `SELECT strftime('%Y-%m', created_at) mon, COUNT(*) n FROM orders GROUP BY mon ORDER BY mon`.",
    choices: ["2024-01 | 8", "2024-01 | 103", "2024-02 | 9", "2025-02 | 7"],
    answer: 0,
    why: "ORDER BY mon walks the calendar: the store opens with 8 orders in 2024-01 (probed). The walk is 14 rows — 2024-01:8 … 2024-02:9 … 2025-02:7 — over the span 2024-01-01 to 2025-02-27.",
  },
  { id: "dr5-de-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(DISTINCT strftime('%m', created_at)) FROM orders`.",
    choices: ["12 — years merged into month buckets", "14 — one per year-month", "2 — one per year", "24 — one per year-month pair"],
    answer: 0,
    why: "Probed: 12 distinct month labels ('01'…'12'). The two Januarys — 8 orders in 2024, 6 in 2025 — collapse into the single '01' bucket holding 14. The '%Y-%m' version of this query returns 14.",
    notes: [
      { choice: 1, why: "14 is what '%Y-%m' gives. '%m' alone cannot see years — that's the merge, not a bonus bucket." },
    ],
  },
  { id: "dr5-de-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) FROM orders WHERE shipped_at IS NOT NULL`.",
    choices: ["2.98", "3.0 exactly", "2.0", "NULL"],
    answer: 0,
    why: "Probed: 2.98 over 82 rows (min 2, max 4; gaps 2/3/4 days at 27/30/25 orders). The WHERE guard is redundant — NULLs are skipped regardless — but it documents the denominator you're averaging over.",
    notes: [
      { choice: 1, why: "3.0 is ROUND(avg, 0) — rounding away the grain. Two decimals keeps the honest 2.98. NULL is impossible too: 82 real values average fine." },
    ],
  },
  { id: "dr5-de-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(*) FROM orders WHERE shipped_at IS NOT NULL AND julianday(shipped_at) - julianday(created_at) > 3`.",
    choices: ["25", "30", "55", "0"],
    answer: 0,
    why: "Probed: 25 — exactly the four-day shipments clear the bar. The 30 exactly-3-day orders are excluded (strict > vs >= moves 30 rows), and CAST to INTEGER would give the same 25 because the gaps are whole floats here.",
  },
  { id: "dr5-de-34", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT CAST(AVG(julianday(shipped_at) - julianday(created_at)) AS INTEGER) FROM orders WHERE shipped_at IS NOT NULL`.",
    choices: ["2", "3", "2.98", "NULL"],
    answer: 0,
    why: "Probed: the raw average is 2.9756…; CAST truncates toward zero → 2, while ROUND(avg, 0) gives 3. Neither equals the 2.98 truth — cast for display only, after the aggregate has spoken.",
    notes: [
      { choice: 1, why: "Rounding is ROUND's job. CAST never rounds — 2.9756 becomes 2 no matter how close the fraction is to 3." },
    ],
  },
  { id: "dr5-de-35", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(DISTINCT strftime('%Y-%m', issued_on)), MIN(issued_on) FROM invoices`.",
    choices: ["13 buckets, first invoice 2024-02-05", "14 buckets, first invoice 2024-01-…", "13 buckets, first invoice 2024-01-…", "12 buckets, first invoice 2024-02-…"],
    answer: 0,
    why: "Probed: 28 invoices spread over 13 year-month buckets running 2024-02 … 2025-02 — January 2024 has ZERO invoices, and the first issued_on is 2024-02-05. Buckets materialize from data: orders have a 2024-01 bucket, invoices don't.",
  },
  { id: "dr5-de-36", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT ROUND(SUM(amount_cents)/100.0, 2) FROM expenses WHERE strftime('%Y-%m', spent_on) = '2024-08'`.",
    choices: ["3210.0", "1974.0", "1440.0", "0.0"],
    answer: 0,
    why: "Probed: August 2024 is the expense spike — 3210 against a 1440–1974 range in every other month of the 14-bucket census. One strftime filter isolates it; the same query for 2024-11 returns 1974.",
    notes: [
      { choice: 1, why: "That's 2024-11, the runner-up. The spike belongs to August alone — month filters earn their keep exactly here." },
    ],
  },
  { id: "dr5-de-37", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT strftime('%w', '2024-01-05')` — order 1's day of week.",
    choices: ["'5' — a Friday", "'4' — a Thursday", "'6' — a Saturday", "'friday' — the name"],
    answer: 0,
    why: "Probed: '5'. %w is the C convention — 0 = Sunday through 6 = Saturday — so Friday is 5. Storewide census: 0:16, 1:20, 2:16, 3:16, 4:9, 5:18, 6:8 (Monday busiest, Saturday quietest). And it's TEXT: '5', not 5.",
    notes: [
      { choice: 1, why: "Thursday would be 4 — the Monday-first misreading. Sunday owns the zero; every downstream 'quietest day' conclusion flips if you forget." },
    ],
  },
  { id: "dr5-de-38", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT DATE('2024-02-11', 'start of month', '+1 month', '-1 day')`.",
    choices: ["'2024-02-29'", "'2024-02-28'", "'2024-03-11'", "'2024-03-10'"],
    answer: 0,
    why: "Probed: '2024-02-29' — the classic end-of-month recipe: snap to the 1st, step forward a month, step back a day. 2024 is a leap year, so February ends on the 29th; the same recipe on '2025-02-11' yields '2025-02-28'.",
    notes: [
      { choice: 1, why: "28 is 2025's answer. Leap-year arithmetic is exactly why this recipe beats hard-coding day counts." },
    ],
  },
  { id: "dr5-de-39", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict: `SELECT COUNT(DISTINCT SUBSTR(created_at, 1, 7)) FROM orders`.",
    choices: ["14 — byte-identical to strftime('%Y-%m')", "84 — one per distinct day", "12 — one per month number", "103 — one per order"],
    answer: 0,
    why: "Probed: 14. Fixed-width ISO text means the 7-character prefix IS the year-month — the bucket counts (2024-01:8, 2024-02:9, 2024-03:8 …) match strftime exactly, and so do DATE(created_at,'start of month') buckets. Three spellings, one answer.",
    notes: [
      { choice: 1, why: "84 is the raw-day count — SUBSTR(created_at, 1, 10) would find it. Length 7 stops at the month dash." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr5-de-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A teammate 'fixes' the lead-time metric: `AVG(COALESCE(julianday(shipped_at) - julianday(created_at), 0))`. Honest verdict?",
    choices: [
      "It fabricates 21 zero-day shipments — report the 82-row shipped-only mean (2.98) and the unshipped count separately",
      "Good practice — NULLs must never reach an aggregate",
      "No change — COALESCE is a no-op inside AVG",
      "It errors on the 21 unshipped rows",
    ],
    answer: 0,
    why: "julianday(NULL) is NULL, so the COALESCE substitutes a 0-day gap for every unshipped order — the denominator jumps back to 103 with 21 fake instant shipments. The shipped-only truth is 2.98 over 82 (min 2, max 4). Choosing zero is a business decision, and here it's a misleading one.",
    notes: [
      { choice: 1, why: "Aggregates skip NULLs by design — that IS the honest default. The alternatives are exclusion (this report) or an explicit, labeled zero-day policy, never a silent one." },
    ],
  },
  { id: "dr5-de-41", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The monthly trend chart shows January holding 14 orders — roughly double every other winter month. Most likely cause?",
    choices: [
      "The bucket key is strftime('%m') alone — Jan-2024 (8) and Jan-2025 (6) merged into one '01' bucket",
      "The orders table contains duplicate rows",
      "The chart sorted by count instead of by month",
      "January genuinely spiked both years",
    ],
    answer: 0,
    why: "Probed: '%m' renders '01' for both Januarys — 8 + 6 = 14 merged — while '%Y-%m' keeps them apart (12 buckets vs 14). Trend lines need the full '%Y-%m' key; '%m' alone is only safe inside a single calendar year.",
    notes: [
      { choice: 3, why: "The data says otherwise: the quietest months on record are 2024-06, 2024-11 and 2025-01, at 6 orders each. The spike is an artifact of the merge." },
    ],
  },
  { id: "dr5-de-42", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "A standing daily report filters `WHERE created_at LIKE '2024-02-%'`. What's the long-term concern?",
    choices: [
      "LIKE can't use an index and hard-couples the filter to exact text storage — a half-open range (>= / <) is the durable shape",
      "LIKE returns wrong counts on date columns",
      "Nothing — LIKE is the fastest filter for dates",
      "LIKE only works in SQLite",
    ],
    answer: 0,
    why: "Probed: today LIKE '2024-02-%' and the half-open range both find 9 — the counts agree. But the range is a sargable scan that survives added time components ('2024-02-15 09:30') and non-TEXT date types, while the LIKE pattern is string surgery on one exact storage format. One-off exports: either. Standing queries: the range.",
    notes: [
      { choice: 1, why: "It doesn't return wrong counts — that's not the failure mode. The cost is performance plus brittleness to format drift, both invisible on day one." },
    ],
  },
  { id: "dr5-de-43", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "`WHERE created_at BETWEEN '2024-02-01' AND '2024-02-28'` returns 9 — the right February count. Verdict?",
    choices: [
      "Right answer, wrong reason — BETWEEN includes both ends and would drop Feb-29 orders; this seed just happens to have none",
      "Correct pattern — always end a month's range at the 28th",
      "BETWEEN excludes the endpoints, so the 9 is luck",
      "It should error — February 2024 has 29 days",
    ],
    answer: 0,
    why: "Probed: BETWEEN '…02-01' AND '…02-28' = 9 and the half-open < '2024-03-01' = 9 — because ZERO orders sit on 2024-02-29 (and none on 2024-03-01). One leap-day order and the report silently loses it. Half-open ranges never need to know month lengths.",
    notes: [
      { choice: 1, why: "Ending at the 28th bakes the shortest February into every query. The whole point of < next-month-01 is that the engine, not the author, owns month lengths." },
    ],
  },
  { id: "dr5-de-44", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Finance wants every calendar month listed — including 2024-01 with zero invoices. What do you tell them?",
    choices: [
      "GROUP BY can only count rows that exist (invoices start 2024-02 — 13 buckets); zero-months need manufactured rows, e.g. a calendar table joined in",
      "Add a HAVING COUNT(*) = 0 clause to surface empty buckets",
      "Switch from strftime to DATE(issued_on, 'start of month')",
      "The invoices table must be missing data — escalate",
    ],
    answer: 0,
    why: "Probed: 28 invoices spread over 13 buckets from 2024-02 — no 2024-01 bucket exists because no row carries it. GROUP BY divides existing rows; absence leaves no group. Making absence VISIBLE requires supplying the missing months from outside the data (a calendar spine — a module-6 move).",
    notes: [
      { choice: 3, why: "The data is fine — January simply had no invoices. A report that can't show a zero is a reporting gap, not a data-integrity incident." },
    ],
  },
  { id: "dr5-de-45", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Where does `CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER)` belong in a lead-time report?",
    choices: [
      "Display only — compare and average on the raw float diff; CAST after the number is decided",
      "Wrap every diff before AVG so the average stays an integer",
      "Nowhere — CAST breaks date arithmetic entirely",
      "In the WHERE clause only, never in SELECT",
    ],
    answer: 0,
    why: "CAST truncates: probed, 4.75 → 4 and the 2.9756 average → 2 (ROUND says 3). Casting BEFORE averaging biases the metric, and casting before comparing shifts > 3 boundaries. On this seed the gaps are whole floats (2/3/4 days) so it hides — with logged times it wouldn't.",
    notes: [
      { choice: 1, why: "That's averaging the floors — and the same move in WHERE is worse: a 3.75-day order truncates to 3 and slips a 'more than 3 days' filter." },
    ],
  },
];
