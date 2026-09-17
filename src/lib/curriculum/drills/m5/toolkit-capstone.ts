// Drill set — Toolkit capstone (Module 5, secondary, 40 questions).
// Engine-verified receipts (db/custom.db, SQLite 3.53): the ops-calendar
// pipeline whole — month census 14 buckets 2024-01…2025-02, counts
// 8/9/8/7/8/6/8/7/9/7/6/7/6/7, spends 3731.97/3609.64/2617.08/2468.91/
// 2910.31/2047.43/1193.86/2352.07/3116.04/2975.67/1648.8/2101.47/1669.5/
// 2390.53; staged running line 3731.97 → 7341.61 → 9958.69 → … → 34833.28
// whose last row equals the plain storewide SUM (grand: 103 orders, AVG
// 338.19, MIN 25.47, MAX 1088.44) — the free reconciliation; the one-liner
// SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) is legal and
// number-identical, but the alias inside OVER dies with 'no such column: mon';
// SUM(rev) OVER () with no ORDER BY paints 34833.28 on all 14 rows; MoM
// deltas start NULL, 2024-02 −122.33, biggest drop −1326.87 (2024-11, −45%),
// biggest jump +1158.21 (2024-08, +97%); shipping 2.98 days avg over the 82
// shipped rows (21 unshipped NULLs exit; lags whole days: 2×27, 3×30, 4×25;
// min 2, max 4); Alice's LAG gaps NULL, 20, 29, 5, 9, 13 … over 24 orders;
// NTILE(4) over 103 orders 26/26/26/25 (ASC: premium 25 in tile 4; DESC:
// tile 1 spans 489.33–1088.44 incl. the max) and over the 14 buckets 4/4/3/3;
// SUBSTR(created_at,1,7) buckets identical to strftime's, bare %m merges to
// 12 buckets ('01' = 14, '02' = 16); JULIANDAY('2024-01') = NULL vs
// '2024-01-01' = 2460310.5; 17 created_at dates are shared by multiple
// orders; the ledger (debit_cents/credit_cents) nets to 0.00 (debits
// 181080.00 = credits) with its running line visiting 7076.00 on 2025-02-28,
// while the opex running runs 1719 → 3159 → 5076 → 6825 → 8305 (Jan–May
// 2024, ending 25416.00) and expenses categories total Rent 16800 / Ads
// 4570 / Travel 2521 / Tools 1525; top month by avg order 2024-01 at
// 466.50 (8 orders) ahead of 2024-10's 425.10; PRINTF polish: '%.2f' →
// '1088.44', '%04d' → '0001', bare '%d' → '1'; Alice's handle
// SUBSTR(email,1,INSTR(email,'@')-1) = 'alice.chen' (the @ sits at position
// 11); all 16 emails share example.com; strftime('%y-%M', created_at) is
// NULL (date-only timestamps have no minutes).

import type { DrillQ } from "../types";

const KW = "Toolkit capstone";

export const TOOLKIT_CAPSTONE_DRILL: DrillQ[] = [
  // ---------- syntax ----------
  { id: "dr5-tc-01", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Ops wants the 14-bucket month census in calendar order: `mon` ('2024-01'), `n`. Which query delivers it?",
    choices: [
      "`SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon`",
      "`SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders ORDER BY mon`",
      "`SELECT strftime('%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY mon ORDER BY mon`",
      "`SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n FROM orders GROUP BY n ORDER BY mon`",
    ],
    answer: 0,
    why: "Slice → fold → sort: bucket on the zero-padded '%Y-%m' key, GROUP BY to count, ORDER BY the key for calendar order. Probed: 14 rows, 2024-01 first (8 orders) through 2025-02 last (7).",
    notes: [
      { choice: 1, why: "Without GROUP BY the COUNT folds all 103 orders into ONE row — the census needs the bucket key inside the GROUP BY." },
      { choice: 2, why: "'%m' alone merges the years — probed, 12 buckets where '01' holds Jan-2024's 8 AND Jan-2025's 6." },
      { choice: 3, why: "GROUP BY n points the fold at the COUNT itself — probed error: 'aggregate functions are not allowed in the GROUP BY clause'." },
    ],
  },
  { id: "dr5-tc-02", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "The running-revenue deliverable: stage the monthly sums, then accumulate. Which shape is the reviewable form?",
    choices: [
      "`WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT mon, SUM(rev) OVER (ORDER BY mon) AS running FROM m`",
      "`SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS running FROM orders GROUP BY mon`",
      "`SELECT mon, SUM(rev) OVER (ORDER BY mon) AS running FROM orders`",
      "`WITH m AS (SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev FROM orders GROUP BY mon) SELECT mon, SUM(rev) AS running FROM m ORDER BY mon`",
    ],
    answer: 0,
    why: "The CTE folds 103 orders into 14 monthly rows; the window then walks the stage, accumulating row by row. Probed: 3731.97 → 7341.61 → … → 34833.28 — the one-liner's numbers, in SQL a reviewer can actually read.",
    notes: [
      { choice: 2, why: "mon and rev exist only inside the stage — on raw orders this dies immediately (probed: 'no such column: rev')." },
      { choice: 3, why: "SUM without OVER is the plain fold again: 14 monthly totals, no accumulation — the OVER clause IS the running part." },
    ],
  },
  { id: "dr5-tc-03", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "Which strftime format code turns created_at into the sortable bucket key '2024-01'?",
    choices: [
      "`'%y-%M'`",
      "`'%Y-%m'`",
      "`'%Y-%M'`",
      "`'%m-%Y'`",
    ],
    answer: 1,
    why: "%Y is the 4-digit year, %m the zero-padded month — '2024-01'. %M is MINUTES: probed, on this db's date-only timestamps strftime('%y-%M', created_at) returns NULL outright. And month-first keys sort '01-…' before '02-…' regardless of year.",
    notes: [
      { choice: 0, why: "%y truncates the year to 2 digits and %M asks for minutes — on date-only timestamps the engine returns NULL, not an error." },
      { choice: 2, why: "%M is minutes, not months — probed, the key NULLs out on every row of this table." },
      { choice: 3, why: "The year must LEAD for calendar order: a '%m-%Y' key sorts by month first and scrambles the years. '%Y-%m' is unique AND lexicographically chronological." },
    ],
  },
  { id: "dr5-tc-04", keyword: KW, tier: "secondary", aspect: "syntax",
    prompt: "The rhythm report needs each order's gap from its predecessor. Which expression computes it?",
    choices: [
      "`julianday(created_at) - LAG(julianday(created_at)) OVER (ORDER BY created_at, id)`",
      "`LAG(created_at - julianday(created_at)) OVER (ORDER BY created_at, id)`",
      "`LAG(julianday(created_at) OVER (ORDER BY created_at, id))`",
      "`LEAD(julianday(created_at)) OVER (ORDER BY created_at, id)`",
    ],
    answer: 0,
    why: "LAG fetches the previous row's day-number and OVER attaches the sort; subtract current minus previous. Probed on Alice: NULL, 20, 29, 5, 9, 13 days across her 24 orders. The ', id' tie-breaker matters — 17 created_at dates are shared by multiple orders.",
    notes: [
      { choice: 2, why: "OVER is part of the window call, not an argument — nested like this, SQLite reads julianday as the window function and refuses: probed 'julianday() may not be used as a window function'." },
      { choice: 3, why: "LEAD looks to the NEXT order — the rhythm line would run backwards, every gap paired with the wrong neighbor." },
    ],
  },

  // ---------- semantics ----------
  { id: "dr5-tc-05", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "A teammate ships you the staged pipeline's 14 rows: mon, rev, running. In business English, what does the LAST row's running value say?",
    choices: [
      "'2025-02 alone brought in 2,390.53'",
      "'The store's entire revenue to date is 34,833.28'",
      "'The average month brings in 338.19'",
      "'Orders average 338.19 each'",
    ],
    answer: 1,
    why: "The window walked the whole stage — the final row's frame holds all 14 months, so its running IS the storewide total. Probed: 34833.28, exactly the plain SUM(total) over 103 orders. 2390.53 is rev's job; 338.19 is the per-order average.",
    notes: [
      { choice: 2, why: "338.19 is AVG(total) per ORDER, not per month — and the running column accumulates, it never averages." },
    ],
  },
  { id: "dr5-tc-06", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The stage folds 103 orders into 14 rows, then the window adds its column. How many rows leave the pipeline?",
    choices: [
      "103 — the window restores every raw order",
      "1 — only the final total survives",
      "14 — the window adds context per row, it never collapses",
      "4 — one row per quartile",
    ],
    answer: 2,
    why: "GROUP BY does the collapsing (103 → 14); the window decorates each staged row with its accumulation. That's the Module 5 signature: the aggregate answers 'how much total', the window answers 'how did we get here'.",
    notes: [
      { choice: 0, why: "Nothing un-folds — the window only ever sees the 14 staged rows; NTILE over this stage deals 4/4/3/3, not 26/26/26/25." },
    ],
  },
  { id: "dr5-tc-07", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "In `SUM(rev) OVER (ORDER BY mon)` over the 14-month stage, what does the frame hold for the 2024-02 row?",
    choices: [
      "Just 2024-02's own 3609.64",
      "All 14 months — 34833.28",
      "2024-01 and 2024-02 — 7341.61",
      "Nothing — a frame needs PARTITION BY",
    ],
    answer: 2,
    why: "The default frame with ORDER BY runs from the first row through the current one. Probed: row one shows 3731.97, row two 3731.97 + 3609.64 = 7341.61 — the line grows by one month per row.",
    notes: [
      { choice: 0, why: "That's what bare SUM(rev) would show — the OVER frame is precisely what makes it a running line." },
      { choice: 1, why: "All-14 is the frame of SUM(rev) OVER () with NO ORDER BY — probed, that paints 34833.28 on every row." },
    ],
  },
  { id: "dr5-tc-08", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "The MoM column `rev - LAG(rev) OVER (ORDER BY mon)` — what does the FIRST row show, and what does it mean?",
    choices: [
      "0 — the line starts flat",
      "NULL — no previous month exists to subtract",
      "3731.97 — January's own revenue",
      "−122.33 — the first real move",
    ],
    answer: 1,
    why: "LAG has nothing behind row one, so the subtraction is NULL (probed: 2024-01's delta is NULL; the first real delta is 2024-02's −122.33). The NULL honestly says 'no prior month' — it's the line's anchor, not a defect.",
    notes: [
      { choice: 0, why: "Coalescing to 0 fabricates a flat month — same discipline as the rhythm report's first gap: the missing predecessor is data, not dirt." },
    ],
  },
  { id: "dr5-tc-09", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`NTILE(4) OVER (ORDER BY total)` deals the 103 orders. What's the deal?",
    choices: [
      "26/26/26/25 — cheapest 26 land in tile 1, priciest 25 in tile 4",
      "25/26/26/26 — priciest dealt first",
      "26/26/26/26 — every tile equal",
      "An error — 103 doesn't divide by 4",
    ],
    answer: 0,
    why: "Probed: 26/26/26/25 — NTILE deals in sort order and the earlier tiles take the extras. ORDER BY total ASC makes tile 1 the budget quartile; the premium 25 sit in tile 4 (flip to DESC and tile 1 spans 489.33–1088.44, including the max).",
    notes: [
      { choice: 1, why: "That's ORDER BY total DESC's deal — direction flips the tiles, which is why a quartile brief must state its sort." },
      { choice: 3, why: "NTILE handles non-dividing counts fine — it deals whole rows and hands the remainder to the earliest tiles." },
    ],
  },
  { id: "dr5-tc-10", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`AVG(julianday(shipped_at) - julianday(created_at))` over all 103 orders returns 2.98. What did the 21 unshipped orders do?",
    choices: [
      "Counted as 0 days, dragging the average down",
      "Errored the query — AVG can't mix NULL",
      "Made the result NULL — one NULL poisons AVG",
      "Nothing — their NULL lags were skipped; the mean is over 82 rows",
    ],
    answer: 3,
    why: "julianday(NULL) is NULL and AVG ignores NULLs: probed, the mean is 2.98 days over the 82 rows that shipped (min 2, max 4). The 21 unshipped rows neither bias nor block the metric — they just don't vote.",
    notes: [
      { choice: 0, why: "NULL-as-0 is a COALESCE decision the engine never makes silently — and it would falsify the metric." },
    ],
  },
  { id: "dr5-tc-11", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "Why is the running line's last row called a 'free audit'?",
    choices: [
      "SQLite re-runs the query twice and compares",
      "It marks rows that failed the GROUP BY",
      "It prints an execution plan for reviewers",
      "It must equal the plain SUM(total) — any gap exposes a frame or stage bug",
    ],
    answer: 3,
    why: "The final frame holds everything, so the last running value IS the total: probed, 34833.28 — identical to the one-number storewide SUM. A whole-pipeline checksum without a second query; the expense ledger's opex line reconciles the same way (25,416.00 final).",
    notes: [
      { choice: 0, why: "The engine does no comparing — the equality is a property of the math: the last frame literally contains every staged row." },
    ],
  },
  { id: "dr5-tc-12", keyword: KW, tier: "secondary", aspect: "semantics",
    prompt: "`strftime('%Y-%m', created_at)` vs `SUBSTR(created_at, 1, 7)` as bucket keys — what's the relationship?",
    choices: [
      "Different — strftime rounds to the month, SUBSTR truncates the day",
      "Identical buckets — both cut the ISO timestamp into the same zero-padded 'YYYY-MM'",
      "SUBSTR fails — created_at isn't text",
      "Only strftime can appear in a GROUP BY",
    ],
    answer: 1,
    why: "Probed: both produce the same 14 buckets with identical counts (8, 9, 8 … 7). The bucket is computed, not stored — no month column, no calendar table. The discipline is the KEY DESIGN (zero-padded, year-leading), not which function cuts it.",
    notes: [
      { choice: 0, why: "Neither rounds — both are pure text surgery on an already-ISO string, which is why they agree byte for byte." },
    ],
  },

  // ---------- edge ----------
  { id: "dr5-tc-13", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "`JULIANDAY('2024-01')` — what comes back when you hand the ruler a bucket label?",
    choices: [
      "2460310.5",
      "0",
      "NULL",
      "An error — invalid date",
    ],
    answer: 2,
    why: "Probed: bucket labels aren't dates — JULIANDAY('2024-01') is NULL, while the full '2024-01-01' gives 2460310.5. If a gap column comes back all-NULL, you're measuring labels instead of timestamps; day math needs the full date.",
    notes: [
      { choice: 0, why: "That value belongs to the full date — '%Y-%m' lacks the day the Julian ruler needs, and NULL (not a guess) is the engine's verdict." },
    ],
  },
  { id: "dr5-tc-14", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Alice's rhythm reads NULL, 20, 29, 5, 9, 13 days. A teammate rewrites it COALESCE(gap, 0). What broke?",
    choices: [
      "Nothing — NULL and 0 are interchangeable in reports",
      "The other gaps shifted by one row",
      "Row one now claims a same-day repeat — a fabricated rhythm point",
      "The query errors — COALESCE can't wrap window output",
    ],
    answer: 2,
    why: "The NULL means 'no previous order' (probed first gap: NULL, then 20, 29, 5 …). Substituting 0 invents a 0-day repeat and drags any downstream gap-average down with a synthetic zero. Display can dress the NULL ('—' or 'first order'); the data stays NULL.",
    notes: [
      { choice: 1, why: "COALESCE only touches the NULLs — but row one is exactly the row whose truth the rhythm report depends on." },
    ],
  },
  { id: "dr5-tc-15", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "NTILE(4) over the 14-BUCKET stage instead of the 103 raw orders — what's the deal now?",
    choices: [
      "26/26/26/25 — same as always",
      "4/4/3/3 — earlier tiles take the remainder",
      "3.5/3.5/3.5/3.5 — even split",
      "4/4/4/2 — the last tile takes the remainder",
    ],
    answer: 1,
    why: "Probed: 4/4/3/3 over the staged 14 months. Tile size is a function of the stage's row count — 14 = 3×4 + 2, and the FIRST tiles take the extras. Quartiles of months and quartiles of orders are different questions with different numbers.",
    notes: [
      { choice: 3, why: "The remainder goes to the earliest tiles, not the last — the same dealing rule that puts 26 in tiles 1–3 over the 103 orders." },
      { choice: 2, why: "NTILE deals whole rows; it never returns fractional tile sizes." },
    ],
  },
  { id: "dr5-tc-16", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The bucket key is '%m' — month number alone. What does the census become?",
    choices: [
      "12 buckets — '01' merges Jan-2024's 8 orders with Jan-2025's 6",
      "14 buckets, unchanged — grouping ignores the format",
      "24 buckets — one per month per year, automatically",
      "An error — '%m' isn't a valid format code",
    ],
    answer: 0,
    why: "Probed: 12 keys, where '01' holds 14 orders (8 + 6 across two different Januaries) and '02' holds 16 (9 + 7). '%Y-%m' keeps 14 unique buckets — the zero-padded, year-leading key IS the cross-year correctness story.",
    notes: [
      { choice: 2, why: "Nothing auto-splits — the key IS the group; a 2-character key can't tell 2024 from 2025." },
    ],
  },
  { id: "dr5-tc-17", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "Ship lags run min 2, max 4 — every single lag a whole day — yet the average prints 2.98. How?",
    choices: [
      "The 21 NULL rows dragged it off the whole numbers",
      "Some lags must be fractional after all",
      "The average summarizes — 27×2-day, 30×3-day and 25×4-day shipments give 244 ÷ 82 → 2.98, a value no single order has",
      "The engine miscounted — min, max and AVG disagree",
    ],
    answer: 2,
    why: "Probed distribution over the 82 shipped rows: 2 days ×27, 3 days ×30, 4 days ×25 — zero fractional lags. 244 ÷ 82 = 2.98 at two decimals: the mean is a summary, not a member of the data. julianday differences are REAL-typed even when whole.",
    notes: [
      { choice: 0, why: "The NULLs were excluded before the math — 82 rows voted, and 82 whole-day votes can still average to a fraction." },
    ],
  },
  { id: "dr5-tc-18", keyword: KW, tier: "secondary", aspect: "edge",
    prompt: "The ledger running line `SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date, id) / 100` — what does its TRUE final row show, and why not the 7076.00 it visits on 2025-02-28?",
    choices: [
      "7076.00 — the last row's balance, the audit checkpoint",
      "0.00 — the books fully balance: debits 181,080.00 = credits 181,080.00",
      "44,196.00 — the cash account total",
      "NULL — cents can't run through a window",
    ],
    answer: 1,
    why: "Probed: the running line visits 7076.00 on 2025-02-28 (a mid-swing row) but LANDS on 0.00 at the final row — grand debits equal grand credits, so the free reconciliation is zero by design. The account nets tell the story: cash +44196, opex +25416, AR +16440, revenue −86052.",
    notes: [
      { choice: 0, why: "7076.00 is real but it's the second-to-last row — the reconciliation is the LAST row, and here it's the balanced 0.00." },
    ],
  },

  // ---------- errors ----------
  { id: "dr5-tc-19", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`SELECT SUM(rev) OVER (ORDER BY mon) FROM orders` — the stage was skipped. What does SQLite say?",
    choices: [
      "It runs — windows resolve any column",
      "'no such table: m'",
      "'misuse of window function SUM()'",
      "'no such column: rev'",
    ],
    answer: 3,
    why: "Probed verbatim: 'no such column: rev' — rev only exists inside the stage; on raw orders the window's argument can't resolve. Fix: build the WITH-stage first (or repeat the full aggregate expression inside the window).",
    notes: [
      { choice: 2, why: "SUM is a legal window function — the failure is name resolution, not window misuse." },
    ],
  },
  { id: "dr5-tc-20", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`WHERE NTILE(4) OVER (ORDER BY total) = 4` — filtering on the tile directly. What happens?",
    choices: [
      "Returns the premium quartile — 25 rows",
      "Returns all 103 rows — the filter is ignored",
      "'misuse of window function NTILE()'",
      "NULLs out the un-tiled rows",
    ],
    answer: 2,
    why: "Probed verbatim: 'misuse of window function NTILE()' — the tile label doesn't exist until the window runs, so WHERE can't see it. Stage the label in an inner query (or CTE) and filter the alias outside: the same staging rule as ROW_NUMBER.",
    notes: [
      { choice: 0, why: "Tempting — but the engine refuses before any rows flow: window calls are banned in WHERE outright." },
    ],
  },
  { id: "dr5-tc-21", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`NTILE(0) OVER (ORDER BY total)` — what does the engine do?",
    choices: [
      "One big tile — everything lands together",
      "'argument of ntile must be a positive integer'",
      "Zero tiles — empty result, no error",
      "Treats 0 like 1",
    ],
    answer: 1,
    why: "Probed verbatim: 'argument of ntile must be a positive integer' — the tile count is validated at runtime, not clamped. The argument is the NUMBER OF TILES (4 for quartiles), never a row count and never zero.",
    notes: [
      { choice: 0, why: "A friendly collapse would hide the typo — refusing is the behavior you want when a dashboard build parameterizes the tile count." },
    ],
  },
  { id: "dr5-tc-22", keyword: KW, tier: "secondary", aspect: "errors",
    prompt: "`LAG(julianday(created_at) OVER (ORDER BY created_at, id))` — the OVER slid inside the parentheses. What's the verdict?",
    choices: [
      "Runs fine — SQLite forgives clause position",
      "'misuse of window function LAG()'",
      "'julianday() may not be used as a window function'",
      "NULL for every row — the LAG resolves to nothing",
    ],
    answer: 2,
    why: "Probed verbatim — and it's a trap: the misplaced OVER makes SQLite parse julianday(...) as the window call, so the error names JULIANDAY, not LAG. The shape is LAG(expr) OVER (…): the OVER belongs outside the argument list.",
    notes: [
      { choice: 1, why: "Close guess — LAG with no OVER at all gives 'misuse of window function LAG()', but here the OVER exists, just nested: julianday is the function wearing it." },
    ],
  },

  // ---------- predict ----------
  { id: "dr5-tc-23", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the running line's first two values (stage the monthly sums, then SUM(rev) OVER (ORDER BY mon)).",
    choices: ["3731.97 then 7341.61", "3731.97 then 3609.64", "7341.61 then 9958.69", "338.19 then 676.38"],
    answer: 0,
    why: "Probed: row one's frame holds only 2024-01 (3731.97); row two adds February — 3731.97 + 3609.64 = 7341.61. 338.19 is the per-ORDER average — a different denominator entirely.",
    notes: [
      { choice: 1, why: "Those are the two monthly rev values — the running column accumulates the fold, it doesn't repeat it." },
    ],
  },
  { id: "dr5-tc-24", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the running line's LAST value.",
    choices: ["338.19", "2390.53", "4060.03", "34833.28"],
    answer: 3,
    why: "Probed: the final frame holds all 14 buckets — 34833.28, the plain storewide SUM(total) over 103 orders. 2390.53 is 2025-02's own rev; 4060.03 is the two 2025 months combined.",
    notes: [
      { choice: 1, why: "That's the last rev — the running column has already absorbed everything up to and including it." },
    ],
  },
  { id: "dr5-tc-25", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the month census's first and last rows (GROUP BY the '%Y-%m' key, ORDER BY mon).",
    choices: [
      "2024-01 → 8 orders; 2025-02 → 7",
      "2024-01 → 9 orders; 2025-02 → 6",
      "2024-01 → 8 orders; 2025-01 → 6",
      "2023-12 → 7 orders; 2025-02 → 7",
    ],
    answer: 0,
    why: "Probed: 14 buckets from 2024-01 (8 orders) to 2025-02 (7). The ISO text key sorts AS calendar order — no date parsing needed. 2025-01 also has 6 orders, but it's the 13th bucket, not the last.",
    notes: [
      { choice: 1, why: "The two 9-order months are 2024-02 and 2024-09 — neither is the first bucket." },
    ],
  },
  { id: "dr5-tc-26", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the delta line's anchor points: first row, 2024-02, and the year's biggest drop.",
    choices: [
      "NULL · −122.33 · −1326.87 (2024-11)",
      "0 · −122.33 · +1158.21 (2024-08)",
      "NULL · +122.33 · −1326.87 (2024-11)",
      "3731.97 · −122.33 · −1326.87 (2024-11)",
    ],
    answer: 0,
    why: "Probed: row one has no predecessor (NULL); February shed 122.33 off January; November fell 1326.87 from October (2975.67 → 1648.8) — the biggest drop. The biggest JUMP is a separate row: 2024-08's +1158.21 (+97%).",
    notes: [
      { choice: 2, why: "Sign flip — the delta is current MINUS previous, so a falling month reads negative." },
    ],
  },
  { id: "dr5-tc-27", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the tile sizes: NTILE(4) OVER (ORDER BY total) over the 103 raw orders.",
    choices: ["26/26/26/25", "25/25/26/27", "26/26/26/26", "24/26/27/26"],
    answer: 0,
    why: "Probed: 26/26/26/25 — 103 = 3×26 + 25; the earliest three tiles take an extra row and the last takes what's left. 26/26/26/26 doesn't even sum to 103.",
    notes: [
      { choice: 2, why: "Tiles hold whole rows — 104 rows' worth of dealing can't come from a 103-row stage." },
    ],
  },
  { id: "dr5-tc-28", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Same NTILE(4), but over the 14-row month stage. Predict the tile sizes.",
    choices: ["3/4/4/3", "4/4/3/3", "4/4/4/2", "26/26/26/25"],
    answer: 1,
    why: "Probed: 4/4/3/3 — 14 = 2×4 + 2×3; the earliest tiles take the extras. The 26/26/26/25 numbers belong to the 103-row order stage; tiling the buckets asks 'which quarter of MONTHS'.",
    notes: [
      { choice: 3, why: "Different population entirely — change the stage's row count and the deal changes with it." },
    ],
  },
  { id: "dr5-tc-29", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the shipping-speed row: `ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2)` and `COUNT(*)` under the `shipped_at IS NOT NULL` fence.",
    choices: ["2.98 and 103", "2.00 and 82", "2.98 and 82", "3.98 and 103"],
    answer: 2,
    why: "Probed: mean lag 2.98 days over the 82 rows that actually shipped (min 2, max 4; the split is 2×27, 3×30, 4×25). The fence makes the denominator explicit — without it the AVG is unchanged but the COUNT would claim 103.",
    notes: [
      { choice: 0, why: "103 is the fence-less COUNT(*) — the 21 NULL rows would inflate a denominator the metric never used." },
    ],
  },
  { id: "dr5-tc-30", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict Alice's first four gap_days values (LAG on julianday, ORDER BY created_at, id; customer_id 1).",
    choices: ["0, 20, 29, 5", "20, 29, 5, 9", "NULL, 20, 29, 5", "NULL, 29, 20, 5"],
    answer: 2,
    why: "Probed: NULL first (no predecessor), then 20, 29, 5 — whole days after the CAST, across her 24 orders starting 2024-01-02. The NULL anchor is the report's first-row signature.",
    notes: [
      { choice: 1, why: "That's the list shifted up one — dropping the first row hides the anchor and misaligns every date." },
    ],
  },
  { id: "dr5-tc-31", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Predict the running revenue standing after March 2024 (third row of the line).",
    choices: ["2617.08", "7341.61", "12427.60", "9958.69"],
    answer: 3,
    why: "Probed: 3731.97 + 3609.64 + 2617.08 = 9958.69. 12427.60 is the APRIL standing — one fold late; 7341.61 is February's; 2617.08 is March's own rev.",
    notes: [
      { choice: 2, why: "Off by one month — running answers 'through this month', so April's row already carries March's money." },
    ],
  },
  { id: "dr5-tc-32", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "Ops asks which month had the richest AVERAGE order. Predict the top row.",
    choices: [
      "2024-05 — 363.79 across 8 orders",
      "2024-02 — 401.07 across 9 orders",
      "2024-10 — 425.10 across 7 orders",
      "2024-01 — 466.50 across 8 orders",
    ],
    answer: 3,
    why: "Probed ranking: 2024-01 tops at 466.50 (3731.97 over 8 orders), ahead of 2024-10's 425.10 and 2024-02's 401.07. The trap: the busiest months (9 orders) aren't the richest per order — bucket + AVG answers a different question than bucket + COUNT.",
    notes: [
      { choice: 2, why: "2024-10 is second — and it also holds the single biggest order (1088.44), but average ≠ max." },
    ],
  },
  { id: "dr5-tc-33", keyword: KW, tier: "secondary", aspect: "predict",
    prompt: "The deliverable needs order ids like '0001' and Alice's handle pulled from her email. Predict the polish pair.",
    choices: [
      "'1' and 'alice.chen@example.com'",
      "'0001' and 'alice.chen'",
      "'0001' and 'alice'",
      "'   1' and 'alice.chen'",
    ],
    answer: 1,
    why: "Probed: PRINTF('%04d', 1) = '0001' (zero-pad to width 4; bare %d gives '1') and SUBSTR(email, 1, INSTR(email,'@') - 1) = 'alice.chen' — the @ sits at position 11, so the slice takes 10 characters. Same polish family as PRINTF('%.2f', 1088.44) = '1088.44' for money.",
    notes: [
      { choice: 2, why: "'alice' would come from cutting at the dot — INSTR finds the '@' (position 11), and the handle is everything before IT." },
      { choice: 0, why: "The handle slice must stop BEFORE the @; run to the end and you've shipped the whole email. And %d without the 0-width prints bare digits." },
    ],
  },

  // ---------- judgment ----------
  { id: "dr5-tc-34", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "`SUM(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at))` with GROUP BY mon is legal — the inner SUM is the fold, the outer the window. When do you ship it?",
    choices: [
      "Always — fewer lines is always better SQL",
      "Never — nested aggregate + window is illegal in SQLite",
      "Almost never as-is — stage the 14 sums first; identical numbers, reviewable SQL",
      "Only when the brief forbids CTEs",
    ],
    answer: 2,
    why: "Probed: the one-liner's 14 rows match the staged form exactly (final 34833.28 both ways). But it can't even use the alias — ORDER BY mon inside OVER dies with 'no such column: mon', so it must repeat the full expression. Stage → measure is the form a reviewer can trust.",
    notes: [
      { choice: 1, why: "It runs — legality was never the issue. The cost is human: two aggregations braided into one line." },
    ],
  },
  { id: "dr5-tc-35", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Your running line's last row comes up SHORT of the plain SUM(total). First suspect?",
    choices: [
      "Floating-point rounding drift inside the window",
      "AVG was used instead of SUM somewhere",
      "A month dropped out of the stage — a WHERE or PARTITION crept into the pipeline",
      "The database needs a VACUUM",
    ],
    answer: 2,
    why: "The last frame must contain every staged row, so the free audit is exact: probed, a healthy line ends at 34833.28 — matching the storewide SUM to the cent. A shortfall means the stage lost a bucket before the window ever ran; hunt for filters that snuck into the fold.",
    notes: [
      { choice: 0, why: "Rounding wouldn't produce a clean shortfall — the probed healthy line matches the plain SUM exactly. Money missing means ROWS missing." },
    ],
  },
  { id: "dr5-tc-36", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Ops says 'split our orders into spend quartiles'. A teammate tiles the 14 month buckets instead. Verdict?",
    choices: [
      "Fine — quartiles are quartiles, the stage doesn't matter",
      "Wrong stage — order quartiles are 26/26/26/25 over the 103 rows; the 14-row stage answers 4/4/3/3, a different question",
      "Right call — 14 rows is easier to read than 103",
      "NTILE can't run over orders at all",
    ],
    answer: 1,
    why: "Probed: NTILE(4) over 103 orders deals 26/26/26/25; over the 14-bucket stage it deals 4/4/3/3. Same function, different population — the tile you land in depends entirely on the stage you feed it, so the stage IS the spec.",
    notes: [
      { choice: 0, why: "'Quartile' is only defined once you say quartile OF WHAT — the stage's row count decides every boundary." },
    ],
  },
  { id: "dr5-tc-37", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The dashboard prints 'avg ship: 2.98 days' right next to '103 orders'. Reviewer flag?",
    choices: [
      "2.98 must be rounded to a whole day",
      "The average must be computed in the display layer",
      "Nothing to flag",
      "The denominator — the 2.98 is over the 82 shipped rows; pair the metric with its true cohort",
    ],
    answer: 3,
    why: "Probed: 21 of the 103 rows have NULL shipped_at and AVG silently skips them — the mean is over 82. Honest reporting states the cohort: '2.98 days over 82 shipped orders'. When the denominator matters, fence with WHERE shipped_at IS NOT NULL so the SQL carries its own count.",
    notes: [
      { choice: 2, why: "The number is right; the PRESENTATION lies by adjacency — 103 reads as the denominator of the 2.98." },
    ],
  },
  { id: "dr5-tc-38", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "The rhythm line sorts by created_at alone. Why does the shipped version add `, id` as a tie-breaker?",
    choices: [
      "Style — id makes the SQL look professional",
      "It speeds up the window sort",
      "17 created_at dates are shared by multiple orders — without the tie-breaker, 'previous' is engine-arbitrary",
      "LAG requires two sort keys by syntax",
    ],
    answer: 2,
    why: "Probed: 17 of the order dates are duplicated across orders. LAG's 'previous row' is whatever the sort put there — without a deterministic tie-breaker the same query can pair different orders across runs. `(ORDER BY created_at, id)` pins it.",
    notes: [
      { choice: 1, why: "Performance isn't the point — the tie-breaker is about DETERMINISM: stable 'previous' and 'next' across runs." },
    ],
  },
  { id: "dr5-tc-39", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Ops wants the month census AND the running line in one deliverable. What's the tightest honest structure?",
    choices: [
      "Two separate full scans — one for counts, one for sums — glued in a spreadsheet",
      "Add a stored month column so future queries skip the slicing",
      "NTILE(4) the orders, then group tiles by month",
      "One staged pipeline: slice '%Y-%m', fold COUNT(*) + SUM(total) in a single GROUP BY, then measure — the window reads the same 14-row stage",
    ],
    answer: 3,
    why: "Probed: one GROUP BY carries both numbers (2024-01: 8 orders AND 3731.97), and the window adds the running column over the same 14-row stage. One fold, many measures — the Module 5 spine — keeps every deliverable on identical bucket definitions.",
    notes: [
      { choice: 1, why: "The bucket is computed, not stored (probed: strftime and SUBSTR agree byte for byte) — a migration to save a SELECT is cost without correctness." },
      { choice: 0, why: "Two scans drift: different filters, different snapshots, no shared reconciliation. One stage means one audit." },
    ],
  },
  { id: "dr5-tc-40", keyword: KW, tier: "secondary", aspect: "judgment",
    prompt: "Read the ops brief back into tools: distribution across months · cumulative revenue standing · shipping speed · order rhythm · spend quartiles. Which mapping is right?",
    choices: [
      "NTILE · LAG · julianday AVG · GROUP BY · SUM OVER",
      "LAG · NTILE · SUM OVER · julianday AVG · GROUP BY",
      "GROUP BY for all five — every brief question is a fold",
      "slice+fold (census) · stage+SUM OVER (running) · julianday AVG (shipping) · LAG (rhythm) · NTILE (quartiles)",
    ],
    answer: 3,
    why: "Each deliverable is one move of the spine: the 14-bucket census is slice+fold (8/9/8 … 7, probed); the running line is stage+measure (3731.97 → 34833.28); shipping is julianday math over the 82-row cohort (2.98); rhythm is LAG's NULL-then-gaps line (20, 29, 5 …); quartiles are NTILE's deal (26/26/26/25).",
    notes: [
      { choice: 2, why: "Folds answer 'how much per group' — but 'where does cumulative revenue STAND' and 'what's the rhythm' need the row-by-row context only windows give." },
    ],
  },
];
