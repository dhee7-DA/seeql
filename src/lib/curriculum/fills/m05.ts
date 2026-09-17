// Fill drills for Module 5 — scalar & window toolkit (lessons 29-32 + capstone 39).
// See m01.ts for the golden example: template slots {1}..{n}, answers[i]
// completes slot i+1, every completed SQL must run on the seed db.
// Facts quoted in `why`/notes were verified against the seed: 14 month buckets
// (2024-01: 8 … 2025-02: 7), Monday leads with 20 orders / Saturday quietest
// at 8, avg lead 2.98 days over 82 shipped orders (max 4), year split
// 2024: 90 / 30773.25 and 2025: 13 / 4060.03, Alice Chen spend-leader at
// 7262.35, best-order-per-customer tops at #74 / 1088.44, APAC's 5-way region
// tie (EU at RANK 6 / DENSE_RANK 2), Feb + Sep 2024 tie at 9 orders,
// running total 3731.97 → 34833.28, ma3 8.00 / 8.50 / 8.33, top spend quartile
// Alice/Emma/Grace/Maya, Alice's gaps NULL then 20/29/5/9/13, NTILE(4) over
// 103 orders = 26/26/26/25, 43 order-to-order drops, Berlin matches exactly
// one customer, Smart Watch S 199.99 → CAST 199, SUBSTR keeps the @ without -1.
import type { Fill } from "../types";

export const FILLS_BY_LESSON: Record<number, Fill[]> = {
  // Lesson 29 — Text & type toolkit — reshape any value
  29: [
    {
      id: "l29-f1",
      prompt: "Email handles: slice each customer's email into everything before the @. Three blanks — the slicer, the 1-based start, and the position finder.",
      template: "SELECT name,\n  {1}(email, {2}, {3}(email, '@') - 1) AS handle\nFROM customers\nLIMIT 4;",
      chips: ["SUBSTR", "INSTR", "1", "0", "LENGTH", "TRIM"],
      answers: ["SUBSTR", "1", "INSTR"],
      why: "SUBSTR cuts from the 1-based start — position 1, the email's first character — for as many characters as INSTR says sit before the @: the minus one drops the separator itself. The LIMIT 4 sample confirms the pipeline: Alice Chen → alice.chen.",
      notes: [
        { slot: 1, why: "LENGTH counts characters; it can't slice. The cutting tool is SUBSTR — and TRIM only shaves edges, it doesn't cut at a position." },
        { slot: 2, why: "SQL string positions are 1-based, always. A 0 start shifts everything one character left — '2024' becomes '202' territory." },
        { slot: 3, why: "LENGTH tells you how long the string is, not where the @ sits. INSTR is the position finder — the two are easy to grab in the wrong order." },
      ],
    },
    {
      id: "l29-f2",
      prompt: "A teammate's handle column keeps ending with a stray @ — 'alice.chen@'. The slice is one character too generous. Pick the operator that trims it.",
      template: "SELECT name, SUBSTR(email, 1, INSTR(email, '@') {1} 1) AS handle\nFROM customers\nLIMIT 3;",
      chips: ["-", "+", "||", "*", "AND"],
      answers: ["-"],
      why: "INSTR reports where the @ sits, so the slice must stop one character BEFORE it: minus one. Verified on this seed — the + spelling returns 'alice.chen@e', the @ plus a stowaway.",
      notes: [
        { slot: 1, why: "+1 overshoots the other way — you'd keep the @ AND the character after it. || glues strings into a length argument the engine then coerces, which is a different kind of garbage." },
      ],
    },
    {
      id: "l29-f3",
      prompt: "Shelf tags drop the cents by truncation: build the whole-price column from price — 199.99 must come out 199, not 200.",
      template: "SELECT name, price, CAST(price {1} {2}) AS whole\nFROM products\nLIMIT 4;",
      chips: ["AS", "IS", "INTEGER", "TEXT", "REAL"],
      answers: ["AS", "INTEGER"],
      why: "CAST changes the type and truncates toward zero — the Smart Watch S's 199.99 becomes 199, no rounding, ever. AS INTEGER is the grammar; ROUND(price, 0) would be a value change and print 200.",
      notes: [
        { slot: 1, why: "IS compares values — the CAST grammar is CAST(expr AS type)." },
        { slot: 2, why: "TEXT would render prices as strings ('199.99' the text); the shelf wants the truncated number: INTEGER." },
      ],
    },
    {
      id: "l29-f4",
      prompt: "Import guard: regions sometimes arrive as empty strings instead of NULL. Map empties to 'unknown' while real regions like 'EU' pass through untouched.",
      template: "SELECT name, COALESCE({1}(region, ''), 'unknown') AS region_clean\nFROM customers\nLIMIT 6;",
      chips: ["NULLIF", "IFNULL", "TRIM", "UPPER", "REPLACE"],
      answers: ["NULLIF"],
      why: "The two-step classic: NULLIF turns the bad value ('') into NULL, then COALESCE replaces that NULL with 'unknown'. Real regions fail the equality test and sail through unchanged — this seed's first three rows all do.",
      notes: [
        { slot: 1, why: "IFNULL would compare the whole region column to '' in the wrong shape — and it's the two-argument fallback, not the manufacture-NULLs guard. NULLIF(a, b) yields NULL exactly when a equals b." },
      ],
    },
    {
      id: "l29-f5",
      prompt: "The contact-line export prints 0 for every row — the strings were glued with +, which SQLite reads as arithmetic on text. Pick the chip that spells the concatenation properly.",
      template: "SELECT {1} AS contact\nFROM customers\nLIMIT 2;",
      chips: ["name || ' <' || email || '>'", "name + ' <' + email + '>'", "CONCAT(name, ' <', email, '>')", "name || email", "name & email"],
      answers: ["name || ' <' || email || '>'"],
      why: "|| glues strings exactly as given — the ' <' and '>' literals ARE the decoration, and the output reads 'Alice Chen <alice.chen@example.com>'. The + spelling is arithmetic in disguise: text operands coerce to numbers, so every line collapsed to 0.",
      notes: [
        { slot: 1, why: "CONCAT runs on newer engines (and is MySQL's spelling) — but || is the operator form this lesson, SQLite core and Postgres all share. Bare `name || email` would run too — and print 'Alice Chenalice.chen@example.com', because the glue adds no spaces you didn't type." },
      ],
    },
  ],

  // Lesson 30 — Dates & buckets — slicing the calendar
  30: [
    {
      id: "l30-f1",
      prompt: "The trend skeleton: one bucket per year-month, orders counted, calendar order. Two blanks — the format string and the sort key.",
      template: "SELECT strftime({1}, created_at) AS mon, COUNT(*) AS n\nFROM orders\nGROUP BY mon\nORDER BY {2};",
      chips: ["'%Y-%m'", "'%y-%M'", "'%m-%Y'", "mon", "n"],
      answers: ["'%Y-%m'", "mon"],
      why: "'%Y-%m' renders '2024-01' — four-digit year, zero-padded month — and 103 orders collapse into 14 sortable buckets from 2024-01 to 2025-02. Ordering by the bucket key walks the calendar; ordering by n would answer 'busiest months' instead.",
      notes: [
        { slot: 1, why: "'%m-%Y' builds buckets like '01-2024' — which sort January 2025 before February 2024. Year first, then zero-padded month; and %M is not the month code at all." },
        { slot: 2, why: "n sorts by count — a different report. The calendar walk sorts by the bucket key itself." },
      ],
    },
    {
      id: "l30-f2",
      prompt: "The weekday ledger prints 30 different codes — the format string grabbed the day-of-MONTH. Swap in the weekday code (0 = Sunday).",
      template: "SELECT strftime({1}, created_at) AS dow, COUNT(*) AS n\nFROM orders\nGROUP BY dow\nORDER BY dow;",
      chips: ["'%w'", "'%d'", "'%W'", "'%j'", "'%D'"],
      answers: ["'%w'"],
      why: "%d is day-of-month — up to 31 buckets that repeat every month. %w is the weekday code '0'..'6' with 0 = Sunday: on this store Monday ('1') leads with 20 orders and Saturday ('6') is quietest at 8.",
      notes: [
        { slot: 1, why: "%W is the week-of-year number and %j the day-of-year — neither answers 'which weekday'. The C-strftime convention puts Sunday at 0." },
      ],
    },
    {
      id: "l30-f3",
      prompt: "Fulfillment speed: average days from order to ship, rounded to 2 decimals, over the orders that actually shipped.",
      template: "SELECT ROUND(AVG({1}(shipped_at) - julianday(created_at)), 2) AS avg_lead_days\nFROM orders\nWHERE shipped_at IS {2};",
      chips: ["julianday", "strftime", "date", "NOT NULL", "NULL"],
      answers: ["julianday", "NOT NULL"],
      why: "julianday converts both dates to fractional day counts, so the subtraction is the gap in days — 2.98 on average across the 82 shipped orders. The IS NOT NULL guard keeps the 21 never-shipped rows out; AVG would skip their NULLs anyway, but the guard says what you mean.",
      notes: [
        { slot: 1, why: "strftime reformats text and date() reshapes it — neither turns a date into a number you can subtract. julianday is the bridge to number-land." },
        { slot: 2, why: "IS NULL selects the opposite crowd — the 21 unshipped orders, whose NULL lead times would poison the average you're building." },
      ],
    },
    {
      id: "l30-f4",
      prompt: "The year in two rows: order count AND revenue per year — the bucket can carry several aggregates at once.",
      template: "SELECT strftime('%Y', created_at) AS y, COUNT(*) AS n, ROUND({1}(total), 2) AS rev\nFROM orders\nGROUP BY {2}\nORDER BY y;",
      chips: ["SUM", "AVG", "COUNT", "y", "created_at"],
      answers: ["SUM", "y"],
      why: "One bucket per year with three columns riding it: 2024 holds 90 orders worth 30773.25, 2025 has 13 worth 4060.03. SUM adds each bucket's money; GROUP BY rides the '%Y' bucket key, not the raw timestamp.",
      notes: [
        { slot: 1, why: "AVG would report the average order value — the brief wants the revenue sum." },
        { slot: 2, why: "GROUP BY created_at makes a bucket per instant — 103 of them. Group by the '%Y' slice (the alias y) so a year's orders collapse together." },
      ],
    },
    {
      id: "l30-f5",
      prompt: "A teammate's lead-time report crashed with `no such column: created`. The order-date column is spelled something else — fix it so the gap computes.",
      template: "SELECT id,\n  julianday(shipped_at) - julianday({1}) AS lead_days\nFROM orders\nORDER BY lead_days DESC\nLIMIT 3;",
      chips: ["created_at", "created", "order_date", "createdAt", "made_at"],
      answers: ["created_at"],
      why: "The column is created_at — orders carries id, customer_id, status, total, created_at, shipped_at. With both sides in julianday the subtraction is honest days, and the three slowest (4-day) shipments rise to the top of the board.",
      notes: [
        { slot: 1, why: "createdAt is the app-layer field name — the SQL column is snake_case created_at. When a `no such column` error fires, PRAGMA table_info or the schema map settles the spelling." },
      ],
    },
  ],

  // Lesson 31 — Windows I — rank without collapsing
  31: [
    {
      id: "l31-f1",
      prompt: "The spend leaderboard: rank every customer by lifetime spend, biggest first — 16 rows in, 16 out, each wearing its position.",
      template: "SELECT c.name,\n  ROUND(SUM(o.total), 2) AS spend,\n  {1}() OVER (ORDER BY SUM(o.total) {2}) AS rk\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY rk;",
      chips: ["RANK", "DENSE_RANK", "ROW_NUMBER", "DESC", "ASC"],
      answers: ["RANK", "DESC"],
      why: "RANK() OVER (ORDER BY SUM(o.total) DESC) computes across all 16 spends yet keeps every row: Alice Chen's 7262.35 leads at rank 1. The DESC is what puts the biggest spender on top — the window's ORDER BY is the ranking, the outer ORDER BY just presents it.",
      notes: [
        { slot: 1, why: "ROW_NUMBER works on tie-free data, but the leaderboard contract is RANK — when ties DO appear, tied rows share a rank and the next one skips. DENSE_RANK packs instead of skipping." },
        { slot: 2, why: "ASC crowns the SMALLEST spender — Olivia Brown's 444.80 would top the board. 'Biggest first' is DESC." },
      ],
    },
    {
      id: "l31-f2",
      prompt: "A teammate's best-order-per-customer query crashed with `misuse of window function` — they filtered `rn = 1` in the same SELECT as the ROW_NUMBER. The CTE shape is the cure: fill the table the window walks and the column the outer filter reads.",
      template: "WITH ranked AS (\n  SELECT o.customer_id, o.id AS order_id, o.total,\n    ROW_NUMBER() OVER (PARTITION BY o.customer_id ORDER BY o.total DESC, o.id) AS rn\n  FROM {1}\n)\nSELECT order_id, total FROM ranked\nWHERE {2} = 1\nORDER BY total DESC;",
      chips: ["orders o", "ranked o", "customers c", "rn", "prev"],
      answers: ["orders o", "rn"],
      why: "The window ranks each customer's orders inside the CTE — PARTITION BY customer_id restarts the numbering per person — and the rn = 1 filter only works OUTSIDE, because WHERE runs before any window is computed. Sixteen rows survive, one best order each, and #74 (1088.44) tops the list.",
      notes: [
        { slot: 1, why: "ranked is the CTE being defined, not a source table — and customers has no customer_id column, so `FROM customers c` crashes the CTE the moment it compiles. The window walks orders." },
        { slot: 2, why: "rn is the alias the SELECT list gave the ROW_NUMBER — the outer query reads the CTE's output columns. prev belongs to the next lesson's offsets." },
      ],
    },
    {
      id: "l31-f3",
      prompt: "The tie laboratory: every customer's region rank with the skipping ranker and the packing ranker side by side. Watch the APAC block.",
      template: "SELECT name, region,\n  {1}() OVER (ORDER BY region) AS rk,\n  {2}() OVER (ORDER BY region) AS drk\nFROM customers\nORDER BY rk, name;",
      chips: ["RANK", "DENSE_RANK", "ROW_NUMBER", "NTILE", "LAG"],
      answers: ["RANK", "DENSE_RANK"],
      why: "Five APAC customers tie at rank 1 — RANK then lands the EU block at 6 (positions 1–5 taken), while DENSE_RANK packs it at 2. Same query, one word apart: the gap IS the message versus gapless tiers.",
      notes: [
        { slot: 1, why: "ROW_NUMBER would break the tie with arbitrary order and hide the gap — the lab exists to show tie behavior, and RANK is the skipper." },
        { slot: 2, why: "NTILE deals buckets (quartiles) and LAG reads the previous row — neither is a ranker. The gapless partner of RANK is DENSE_RANK." },
      ],
    },
    {
      id: "l31-f4",
      prompt: "Regional podiums: spend rank WITHIN each region — the ranks restart, the customers don't collapse. Fill the partition column and the grouping column.",
      template: "SELECT c.name, c.region,\n  RANK() OVER (PARTITION BY {1} ORDER BY SUM(o.total) DESC) AS rk_in_region\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY {2}\nORDER BY c.region, rk_in_region;",
      chips: ["c.region", "c.name", "c.id", "o.customer_id", "c.city"],
      answers: ["c.region", "c.id"],
      why: "PARTITION BY c.region builds four independent leagues — each region's ranks run 1..N afresh — while GROUP BY c.id still collapses each customer's orders for the SUM. Segmentation without collapsing: GROUP BY's cousin that keeps every row.",
      notes: [
        { slot: 1, why: "PARTITION BY c.name gives a league of one — everyone is rank 1. The partition is the group the ranking resets inside: the region." },
        { slot: 2, why: "GROUP BY c.region would collapse the customers away entirely — group by the person (c.id), partition the window by the region." },
      ],
    },
    {
      id: "l31-f5",
      prompt: "Rank the monthly buckets by order count, most orders first — study the tie: two months share rank 1 and the next one skips.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n, RANK() OVER (ORDER BY {1}) AS rk\nFROM monthly\nORDER BY rk, mon;",
      chips: ["n DESC", "n ASC", "mon", "rk DESC", "COUNT(*)"],
      answers: ["n DESC"],
      why: "The CTE builds the 14 monthly buckets first; the window then ranks the buckets. February and September 2024 tie at 9 orders — both wear rank 1, and the next month lands on rank 3, RANK's gap on full display.",
      notes: [
        { slot: 1, why: "ORDER BY mon ranks the calendar (14 unique keys, no ties to study), and n ASC crowns the QUIETEST month. rk doesn't exist inside its own OVER, and COUNT(*) is an aggregate, not a sort key here — the ranking rides the bucket's count, n." },
      ],
    },
  ],

  // Lesson 32 — Windows II — offsets & running totals
  32: [
    {
      id: "l32-f1",
      prompt: "Month-over-month: put the PREVIOUS month's order count beside each month. First month has no predecessor — and that's the honest answer.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon, n,\n  {1}(n) OVER (ORDER BY {2}) AS prev\nFROM monthly\nORDER BY mon;",
      chips: ["LAG", "LEAD", "mon", "DESC", "n"],
      answers: ["LAG", "mon"],
      why: "LAG fetches the immediately previous bucket as ordered by mon — 2024-02 sees January's 8 beside its own 9. The first month has no predecessor and shows NULL; LEAD would read the future instead.",
      notes: [
        { slot: 1, why: "LEAD is the mirror — it fetches the NEXT row, which answers 'how did the next month do', not 'compared to last month'." },
        { slot: 2, why: "DESC flips the timeline — LAG would then read the future. And ORDER BY n would define 'previous' as 'the next-smaller count', a shuffle of the calendar." },
      ],
    },
    {
      id: "l32-f2",
      prompt: "The revenue snowball: each month's revenue plus everything before it — the last row must land on the store's lifetime total.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, ROUND(SUM(total), 2) AS rev\n  FROM orders GROUP BY mon\n)\nSELECT mon, rev,\n  {1}(rev) OVER (ORDER BY mon) AS running\nFROM monthly\nORDER BY mon;",
      chips: ["SUM", "AVG", "COUNT", "LAG", "NTILE"],
      answers: ["SUM"],
      why: "SUM with an ORDER BY inside OVER accumulates from the first row through the current one — the default frame IS the running total — and the last row lands on 34833.28, exactly the plain storewide SUM. Every intermediate step stays visible: that's what makes it a report.",
      notes: [
        { slot: 1, why: "AVG would produce a running average, COUNT a running month-counter, LAG a single neighbor — the accumulating aggregate is SUM." },
      ],
    },
    {
      id: "l32-f3",
      prompt: "The 3-month moving average came back as 8.00 on EVERY row — the window never slid. Fill in the frame that makes it a sliding slice.",
      template: "WITH monthly AS (\n  SELECT strftime('%Y-%m', created_at) AS mon, COUNT(*) AS n\n  FROM orders GROUP BY mon\n)\nSELECT mon,\n  ROUND(AVG(n) OVER (ORDER BY mon\n    ROWS {1}), 2) AS ma3\nFROM monthly\nORDER BY mon;",
      chips: [
        "BETWEEN 2 PRECEDING AND CURRENT ROW",
        "BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW",
        "BETWEEN 2 FOLLOWING AND CURRENT ROW",
        "BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING",
      ],
      answers: ["BETWEEN 2 PRECEDING AND CURRENT ROW"],
      why: "The sliding frame takes the current month plus the two before it: January averages one month (8.00), February two (8.50), March three (8.33) — frames clip honestly at the data edge. UNBOUNDED PRECEDING is the running-total frame, which is exactly why nothing moved.",
      notes: [
        { slot: 1, why: "2 FOLLOWING looks AHEAD — the smoothing window trails the current month. The UNBOUNDED spellings anchor to an edge; only the n PRECEDING form slides." },
      ],
    },
    {
      id: "l32-f4",
      prompt: "Spender quartiles: cut the 16 customers into four buckets, biggest spenders in bucket 1 — Alice, Emma, Grace and Maya should share the top tile.",
      template: "WITH spend AS (\n  SELECT c.name AS name, SUM(o.total) AS s\n  FROM customers c\n  JOIN orders o ON o.customer_id = c.id\n  GROUP BY c.id\n)\nSELECT name, {1}({2}) OVER (ORDER BY s DESC) AS quartile\nFROM spend\nORDER BY quartile, s DESC;",
      chips: ["NTILE", "RANK", "ROW_NUMBER", "4", "16"],
      answers: ["NTILE", "4"],
      why: "NTILE(4) deals the 16 spenders into four near-equal buckets — exactly four per tile here — with the window's ORDER BY deciding who lands in bucket 1: the top spenders, Alice, Emma, Grace and Maya.",
      notes: [
        { slot: 1, why: "RANK numbers every row 1..16 and ROW_NUMBER the same — sixteen positions is not four quartiles. NTILE assigns BUCKET labels." },
        { slot: 2, why: "NTILE(16) makes sixteen tiles of one row each — the argument is the number of tiles, not the row count." },
      ],
    },
    {
      id: "l32-f5",
      prompt: "A teammate's streak report crashed with `misuse of window function` — they filtered `total < prev_total` in the same SELECT as the LAG. The CTE staging is the cure: fill the two columns the window's timeline needs.",
      template: "WITH t AS (\n  SELECT id, customer_id, total,\n    LAG(total) OVER (PARTITION BY {1} ORDER BY {2}) AS prev_total\n  FROM orders\n)\nSELECT id, customer_id, total, prev_total\nFROM t\nWHERE total < prev_total\nORDER BY id;",
      chips: ["customer_id", "id", "total", "status", "prev_total"],
      answers: ["customer_id", "id"],
      why: "LAG(total) needs to know whose timeline it walks (PARTITION BY customer_id) and which way time flows (ORDER BY id — ids increase chronologically). The drop filter then runs in the outer query, because WHERE finishes before any window is computed — 43 order-to-order drops survive on this seed.",
      notes: [
        { slot: 1, why: "Without the partition, order #2's 'previous order' belongs to a different customer — each buyer needs their own independent timeline." },
        { slot: 2, why: "ORDER BY total inside the partition breaks the time line — 'previous' would mean 'next-cheaper', not 'the order before'. And prev_total is the alias being defined, invisible to its own OVER." },
      ],
    },
  ],

  // Lesson 39 — Case study capstone: Module 5's toolkit under one brief
  39: [
    {
      id: "l39-f1",
      prompt: "The calendar brief, first panel: order counts per month — all 14 buckets, calendar order. Pick the format key that keeps the months unique.",
      template: "SELECT strftime({1}, created_at) AS mon, COUNT(*) AS n\nFROM orders\nGROUP BY mon\nORDER BY mon;",
      chips: ["'%Y-%m'", "'%m'", "'%Y-%M'", "'%m-%Y'", "'%y%m'"],
      answers: ["'%Y-%m'"],
      why: "'%Y-%m' keeps year AND zero-padded month: 14 unique, sortable buckets from 2024-01 to 2025-02. A bare '%m' would merge January 2024's 8 orders into the same bucket as January 2025's 6 — wrong totals and a 12-row report.",
      notes: [
        { slot: 1, why: "%M is minutes, not months, and '%m-%Y' sorts '01-2025' before '02-2024'. Year first, then zero-padded month — that ordering is the whole trick." },
      ],
    },
    {
      id: "l39-f2",
      prompt: "The running line: stage the monthly sums in a derived table, then accumulate them — revenue through each month, January 3731.97 out to 34833.28.",
      template: "SELECT mon, ROUND(rev, 2) AS revenue,\n  ROUND({1}(rev) OVER (ORDER BY {2}), 2) AS running\nFROM (\n  SELECT strftime('%Y-%m', created_at) AS mon, SUM(total) AS rev\n  FROM orders\n  GROUP BY mon\n)\nORDER BY mon;",
      chips: ["SUM", "LAG", "mon", "COUNT(*)", "n DESC"],
      answers: ["SUM", "mon"],
      why: "Two aggregations, two stages: the derived table GROUP BYs 103 orders into 14 monthly sums, then the window accumulates those 14 rows. Staging keeps both steps readable; the dense `SUM(SUM(total)) OVER (…)` runs the same math without the reviewability.",
      notes: [
        { slot: 1, why: "LAG fetches a neighbor instead of accumulating, and COUNT counts rows — the running line is a cumulative SUM." },
        { slot: 2, why: "The derived table exposes only mon and rev — ordering the window by n DESC reaches for a column that doesn't exist out here, and COUNT(*) is not a sort key." },
      ],
    },
    {
      id: "l39-f3",
      prompt: "Shipping speed: one row — average days to ship and how many orders actually carry a ship date.",
      template: "SELECT ROUND(AVG(julianday(shipped_at) - {1}(created_at)), 2) AS avg_ship_days,\n  {2}(*) AS shipped_orders\nFROM orders\nWHERE shipped_at IS NOT NULL;",
      chips: ["julianday", "strftime", "COUNT", "SUM", "AVG"],
      answers: ["julianday", "COUNT"],
      why: "julianday turns both dates into day numbers so the subtraction is the lead time — 2.98 days on average — and COUNT(*) over the guarded rows reports the 82 orders that actually shipped. The IS NOT NULL guard makes the denominator explicit, even though AVG skips NULLs by law.",
      notes: [
        { slot: 1, why: "strftime reshapes text; it can't hand you a number to subtract. julianday is the date-to-number bridge the whole module leans on." },
        { slot: 2, why: "SUM(*) isn't valid SQL, and AVG(*) neither — the row count is COUNT's job; the average already happened in the first column." },
      ],
    },
    {
      id: "l39-f4",
      prompt: "Alice's rhythm: the gap in whole days between her consecutive orders — NULL for the first one, honest numbers after. Fill the converter and the customer key.",
      template: "SELECT strftime('%Y-%m-%d', created_at) AS order_date,\n  CAST(julianday(created_at) - LAG({1}(created_at)) OVER (ORDER BY created_at, id) AS INTEGER) AS gap_days\nFROM orders\nWHERE {2} = 1\nORDER BY created_at, id;",
      chips: ["julianday", "strftime", "customer_id", "id", "total"],
      answers: ["julianday", "customer_id"],
      why: "LAG(julianday(created_at)) fetches the previous order's day-number, so the subtraction is whole days: Alice's gaps run NULL, then 20, 29, 5, 9, 13 days. The first order keeps its NULL — substituting 0 would fabricate a same-day repeat.",
      notes: [
        { slot: 1, why: "LAG(strftime(created_at)) would fetch text, and text can't subtract into days. The gap math happens in julian day numbers, THEN the CAST trims the fraction." },
        { slot: 2, why: "The brief pinned Alice by id — customer_id = 1. Filtering on id = 1 would grab ORDER #1, and total = 1 matches nothing." },
      ],
    },
    {
      id: "l39-f5",
      prompt: "The quartile panel came back as 103 tiles of one order apiece — NTILE was handed the row count instead of the tile count. Fix the dealer's argument, and set the deal order so the priciest quarter lands in tile 4.",
      template: "SELECT ntile, COUNT(*) AS orders_in_tile\nFROM (\n  SELECT NTILE({1}) OVER (ORDER BY {2}) AS ntile\n  FROM orders\n)\nGROUP BY ntile\nORDER BY ntile;",
      chips: ["4", "103", "total", "id", "COUNT(*)"],
      answers: ["4", "total"],
      why: "NTILE(4) is the dealer: the argument is the number of tiles, and ORDER BY total deals cheapest-first, so tile 4 collects the priciest quarter. The outer query counts the labels: 26/26/26/25 — the remainder row goes to the earliest bucket.",
      notes: [
        { slot: 1, why: "NTILE(103) makes one tile per row — the report you were handed. Four quartiles want NTILE(4)." },
        { slot: 2, why: "Ordering by id deals by order number, not spend — the tiles would stop being spend quartiles. The distribution is cut along total." },
      ],
    },
  ],
};
