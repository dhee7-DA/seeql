import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson54: Lesson = {
  id: "lesson-54",
  num: 54,
  title: "AR aging — who owes, how late",
  blurb: "julianday day-counts against a fixed AS OF date, the CASE bucket ladder, and the one-row pivot every controller lives in",
  minutes: 15,
  blocks: [
    {
      kind: "p",
      text: "An invoice isn't late or not-late — it's a **number of days late**, and the number decides who gets a phone call. The accounts-receivable aging report sorts every open invoice into buckets: *current* (not yet due), then 1–30, 31–60, 61–90 and 90+ days overdue. Controllers read it like a doctor reads vitals: money sliding rightward across the ladder is money turning from 'sale' into 'problem'. This lesson builds the whole report from two primitives you already own — `julianday` arithmetic (lesson 30) and the CASE ladder (lesson 22).",
    },
    { kind: "h", text: "The AS OF discipline" },
    {
      kind: "code",
      caption: "Age against a FIXED date — never the clock on the wall",
      sql: `SELECT i.number,
  CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER) AS days_late
FROM invoices i
WHERE i.status = 'open'
ORDER BY days_late DESC;
-- Pedro's INV-2024-018 tops the list at 107 days`,
    },
    {
      kind: "bullets",
      items: [
        "Why the literal `'2025-03-15'` and not `date('now')`? **Reproducibility.** A report that changes every time you run it can't be checked, compared or defended in a meeting. Finance reports are frozen *as of* a date — that's what the phrase means.",
        "`julianday(a) − julianday(b)` is fractional days as a float; CAST to INTEGER for whole-day buckets. Future due dates come out negative — that's the *current* bucket knocking.",
        "The store's books close 2025-02; '2025-03-15' is the reporting date every lesson in this module shares. One date, six invoices, $15,609.00 of open AR.",
      ],
    },
    { kind: "diagram", figure: "fin3-aging-ladder" },
    { kind: "h", text: "The bucket ladder" },
    {
      kind: "code",
      caption: "CASE turns days-late into a label — one scan, six rows bucketed",
      sql: `SELECT CASE
         WHEN days_late <= 0 THEN 'current'
         WHEN days_late <= 30 THEN '1-30'
         WHEN days_late <= 60 THEN '31-60'
         WHEN days_late <= 90 THEN '61-90'
         ELSE '90+'
       END AS bucket, ...
FROM ( /* …days_late computed as above… */ )`,
    },
    {
      kind: "bullets",
      items: [
        "**Order matters.** CASE evaluates top-down and stops at the first true test — `'31-60'` never needs `AND days_late > 30` because the `'1-30'` line already caught everything ≤ 30. Write the ladder in ascending order or the ELSE swallows everything.",
        "`<= 0` (not `= 0`) sends all future due dates to *current* — an invoice due tomorrow is not late today, full stop.",
        "The negative-days floor: `MAX(days_late, 0)` is the other idiom for 'no negative aging' — use the CASE ladder for labels, the floor for arithmetic.",
      ],
    },
    { kind: "h", text: "Two shapes of the same report" },
    {
      kind: "code",
      caption: "Shape 1 — tall: one row per bucket, GROUP BY the ladder",
      sql: `SELECT bucket, COUNT(*) AS n,
       ROUND(SUM(outstanding)/100.0, 2) AS total
FROM ( /* …detail with the CASE label… */ )
GROUP BY bucket
ORDER BY CASE bucket WHEN 'current' THEN 0
                     WHEN '1-30'  THEN 1
                     WHEN '31-60' THEN 2
                     WHEN '61-90' THEN 3
                     ELSE 4 END;
-- current 1 · 2794.0  |  1-30 2 · 5710.0  |  31-60 1 · 4937.0
-- 61-90 1 · 1295.0    |  90+ 1 · 873.0`,
    },
    {
      kind: "code",
      caption: "Shape 2 — wide: one row, one column per bucket (the pivot)",
      sql: `SELECT
  ROUND(SUM(CASE WHEN days_late <= 0      THEN out ELSE 0 END)/100.0, 2) AS current,
  ROUND(SUM(CASE WHEN days_late BETWEEN 1 AND 30 THEN out ELSE 0 END)/100.0, 2) AS b1_30,
  ROUND(SUM(CASE WHEN days_late BETWEEN 31 AND 60 THEN out ELSE 0 END)/100.0, 2) AS b31_60,
  ROUND(SUM(CASE WHEN days_late BETWEEN 61 AND 90 THEN out ELSE 0 END)/100.0, 2) AS b61_90,
  ROUND(SUM(CASE WHEN days_late > 90      THEN out ELSE 0 END)/100.0, 2) AS b90plus
FROM ( /* …the same detail… */ );
-- 2794.0 | 5710.0 | 4937.0 | 1295.0 | 873.0`,
    },
    {
      kind: "bullets",
      items: [
        "Same scan, two presentations. The **tall** shape feeds charts and further GROUP BYs; the **wide** shape drops into a spreadsheet cell range and gets pasted into the Monday meeting. Lesson 23 built both patterns on order data — this is the finance transplant.",
        "The wide shape's `ELSE 0` is load-bearing: without it, non-matching rows contribute NULL and the SUM dies for empty buckets.",
        "Alphabetical `ORDER BY bucket` would walk '1-30, 31-60, 61-90, 90+, current' — gibberish. Custom-key sort (the CASE) restores the ladder.",
      ],
    },
    {
      kind: "warn",
      text: "Age OUTSTANDING amounts, not invoice face values. Alice's INV-2025-025 sits in the 1–30 bucket at $2,148.00 — her $4,000.00 partial payment already left the building. Aging the full $6,148.00 would double-count $4,000.00 of money already received.",
    },
    { kind: "h", text: "Reading the report" },
    {
      kind: "p",
      text: "The store's ladder reads healthy-ish: $2,794.00 current (Isabella, due in six days), $5,710.00 fresh-late (Alice's partial and Liam's week-old slip), $4,937.00 at 36 days (Emma — one polite call), $1,295.00 at 64 days (Chloe), and $873.00 at **107 days** (Pedro — that's a decision, not an oversight). The headline metric hiding inside: 82.1% of open AR is overdue. Analysts compress the whole report to one number — **DSO**, days sales outstanding: AR ÷ invoiced revenue × 365 = 15,609 ÷ 86,052 × 365 ≈ **66 days**. The store waits two months, on average, to be paid.",
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "julianday is SQLite's day-count workhorse. No BETWEEN on dates needed — the ISO-text ordering does the comparing, julianday only does the arithmetic.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Real date types make it cleaner: `(DATE '2025-03-15' - due_on)` is already an integer day count, and `AGE(due_on, DATE '2025-03-15')` renders a human interval. The CASE ladder ports unchanged.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "DATEDIFF('2025-03-15', due_on) is the day count. MySQL 8 also offers `INTERVAL` arithmetic everywhere the store used julianday offsets.",
    },
    {
      kind: "tip",
      text: "Aging = detail (days_late + outstanding) → bucket ladder (CASE) → tall or wide presentation. Freeze the AS OF date, age the outstanding, and the collections call list writes itself — Pedro first.",
    },
  ],
  mcqs: [
    {
      id: "l54-q1",
      prompt: "Why does the aging report compare against a hardcoded '2025-03-15' instead of date('now')?",
      choices: [
        "date('now') doesn't exist in SQLite",
        "A frozen AS OF date makes the report reproducible — two runs in one meeting must agree",
        "The literals are faster to parse",
        "due_on can't be compared to a computed date",
      ],
      answer: 1,
      why: "Finance reports are anchored: 'AR as of March 15' is a fact that can be audited, diffed and defended. date('now') would quietly rewrite history every midnight.",
      notes: [
        { choice: 0, why: "It exists — that's precisely the danger. A report that changes under you is worse than one you can't run." },
      ],
    },
    {
      id: "l54-q2",
      prompt: "An open invoice is due 2025-03-21 (six days after the AS OF). What does CAST(julianday('2025-03-15') − julianday(due_on) AS INTEGER) return, and which bucket catches it?",
      choices: [
        "6 — the '1-30' bucket",
        "−6 — the 'current' bucket, via the <= 0 test",
        "0 — dates clamp at zero",
        "NULL — future dates break julianday",
      ],
      answer: 1,
      why: "julianday subtraction is signed: not-yet-due comes out negative, and the ladder's first test `<= 0` routes every negative to 'current'. Isabella's $2,794.00 is healthy — for six more days.",
      notes: [
        { choice: 2, why: "Nothing clamps automatically — without the `<= 0` (or MAX(days_late, 0) floor) the negative would fall through the ladder into '90+' via ELSE. The most common aging-bug shape there is." },
      ],
    },
    {
      id: "l54-q3",
      prompt: "Why does the CASE ladder test `days_late <= 60` for '31-60' WITHOUT also checking `days_late > 30`?",
      choices: [
        "SQLite infers the lower bound from the label",
        "CASE stops at the first true test — the '1-30' line above already caught everything ≤ 30",
        "> 30 is implied by BETWEEN",
        "It doesn't — the ladder is buggy without the extra check",
      ],
      answer: 1,
      why: "Top-down evaluation with early exit: by the time '31-60' is tested, days ≤ 30 is already impossible. Ascending order + first-match-wins = the whole lower bound for free.",
      notes: [
        { choice: 3, why: "It's correct — but ONLY while the ladder ascends. Reorder the branches and the first line swallows every row; ELSE-based ladders fail silently, not loudly." },
      ],
    },
    {
      id: "l54-q4",
      prompt: "Alice's INV-2025-025: face $6,148.00, $4,000.00 already paid, 22 days late. What belongs in the aging report?",
      choices: [
        "$6,148.00 in 1-30 — age the face value",
        "$2,148.00 in 1-30 — age the OUTSTANDING, net of the partial payment",
        "$4,000.00 — age what arrived",
        "Nothing — partial payments leave aging",
      ],
      answer: 1,
      why: "Aging answers 'how much money is at risk, how late'. The $4,000.00 already arrived — aging it again would double-count collection. Outstanding = amount − payments, always.",
      notes: [
        { choice: 0, why: "Face-value aging is the classic AR-report bug. It inflates risk by exactly the money that already landed — here, 65% of that invoice." },
      ],
    },
    {
      id: "l54-q5",
      prompt: "Which invoices belong in the aging report at all?",
      choices: [
        "Every invoice ever issued — history matters",
        "Only 'open' ones — paid invoices are settled, and void invoices never were real",
        "Only overdue ones — that's what 'aging' means",
        "Only invoices above $1,000",
      ],
      answer: 1,
      why: "status = 'open' is the AR population: not yet settled, definitely real. Including paid invoices pollutes the report with settled history; including void books cancelled billing as risk.",
      notes: [
        { choice: 2, why: "Current (not-yet-due) invoices are aging too — the 'current' bucket exists precisely so tomorrow's overdue doesn't ambush you." },
      ],
    },
    {
      id: "l54-q6",
      prompt: "The tall bucket report sorted alphabetically walks '1-30, 31-60, 61-90, 90+, current'. What fixes the walk?",
      choices: [
        "ORDER BY total DESC",
        "ORDER BY MIN(days_late) — the minimum late-days per bucket restores ladder order",
        "Rename the buckets 0a, 0b, 0c…",
        "It can't be fixed in SQL",
      ],
      answer: 1,
      why: "Each bucket's minimum days_late ascends exactly along the ladder (−∞ for current, 1, 31, 61, 91) — one aggregate, and the labels sort themselves honestly. A CASE key works too.",
      notes: [
        { choice: 0, why: "That sorts by money, not time — a $571 bucket would leap over a $5,710 one. The walk is about RISK ORDER, which is age order." },
      ],
    },
    {
      id: "l54-q7",
      prompt: "In the wide pivot, every SUM(CASE …) carries an `ELSE 0`. What breaks without it?",
      choices: [
        "Nothing — CASE defaults to 0",
        "The syntax fails — ELSE is mandatory",
        "Non-matching rows contribute NULL, and SUM over all-NULL inputs returns NULL — an empty bucket blanks its whole column",
        "The buckets double-count",
      ],
      answer: 2,
      why: "CASE without ELSE yields NULL. One row per bucket here keeps SUMs alive, but the pattern must survive EMPTY buckets — and SUM of all-NULL is NULL, not 0. ELSE 0 is the pivot's seatbelt.",
      notes: [
        { choice: 0, why: "CASE defaults to NULL, not 0 — the exact COUNT-vs-SUM family of surprises from lesson 4." },
      ],
    },
    {
      id: "l54-q8",
      prompt: "The store's open AR is $15,609.00; non-void invoiced revenue is $86,052.00. DSO ≈ 66 days. What does that number TELL the owner?",
      choices: [
        "Customers pay, on average, about two months after sale — cash is locked in receivables for a quarter-year",
        "The store is 66 days from bankruptcy",
        "Invoices are due in 66 days",
        "The store should raise prices 66%",
      ],
      answer: 0,
      why: "DSO converts the aging report into one sentence: 'we finance two months of every sale'. Term is net-30; collecting at ~66 means the store is an unpaid lender — the reason the collections list is ordered by bucket.",
      notes: [
        { choice: 2, why: "Terms are net-30 (due_on = issued + 30). DSO measures how far PAST the promise reality lands — the gap IS the finding." },
      ],
    },
    {
      id: "l54-q9",
      prompt: "Pedro's invoice: 107 days overdue, $873.00 outstanding — the sole '90+' row. What's the standard reading?",
      choices: [
        "A rounding error — too small to matter",
        "Collections escalation territory: at 90+ days, statistical collectability craters; it's a decision (escalate, negotiate, or write off), not a reminder",
        "Pay him immediately",
        "Move it to the current bucket so the report looks better",
      ],
      answer: 1,
      why: "The 90+ bucket is qualitatively different — most of it never collects without escalation. The dollar amount is small; the PATTERN (a customer 107 days silent) is the signal.",
      notes: [
        { choice: 3, why: "Re-bucketing to flatter the report is how companies end up on the news. The ladder exists to make bad news visible early." },
      ],
    },
    {
      id: "l54-q10",
      prompt: "The aging detail computes outstanding with the lesson-52 correlated subquery, THEN buckets it. Why not bucket the face amounts and subtract payments later?",
      choices: [
        "Subqueries are required before CASE",
        "The bucket is a property of the INVOICE (its due date), but the money at risk is the OUTSTANDING — compute both per invoice row first, then summarize",
        "CASE can't handle large numbers",
        "Later subtraction is impossible in SQL",
      ],
      answer: 1,
      why: "Two facts, one row: HOW LATE (from due_on) and HOW MUCH (amount − payments). Only after the detail row carries both can any GROUP BY or pivot summarize honestly. Detail first, aggregation second — the course's oldest rule.",
      notes: [
        { choice: 3, why: "Subtraction after aggregation is exactly how partial payments get aged at face value — the $4,000 lands on the wrong side of the bucket." },
      ],
    },
    {
      id: "l54-q11",
      prompt: "The aging shows $12,815.00 overdue of $15,609.00 total AR. One query returns both numbers. Which shape?",
      choices: [
        "Two separate queries pasted together",
        "The wide pivot: SUM(CASE WHEN overdue > 0 …) AS overdue beside SUM(outstanding) AS total — one scan, both figures",
        "GROUP BY overdue/non-overdue, take the first row",
        "AVG(outstanding) × COUNT(*)",
      ],
      answer: 1,
      why: "Same detail rows, two conditional aggregates — the wide shape again. 82.1% overdue is the ratio the owner actually reads; both numbers come from one pass over six rows.",
      notes: [
        { choice: 2, why: "GROUP BY gives a tall report — you'd still need a second pass to divide the two groups. The pivot keeps it one query." },
      ],
    },
  ],
  problems: [
    {
      id: "l54-p1",
      title: "The collections list",
      brief: "Open invoices, most-late first: `number`, `name`, `overdue` = days late as of '2025-03-15' (floor at 0), `outstanding` in dollars. Six rows; Pedro tops it at 107.",
      hints: [
        "Compute days_late with julianday against the fixed date, floor with MAX(…, 0), net the outstanding with the lesson-52 subquery, sort by the floored lateness.",
        "Shape: SELECT i.number, c.name, MAX(CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER), 0) AS overdue, ROUND((i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0))/100.0, 2) AS outstanding FROM invoices i JOIN customers c ON c.id = i.customer_id WHERE i.status = 'open' ORDER BY overdue DESC, i.number; — MAX(x, 0) with two arguments is SQLite's SCALAR max, no GROUP BY needed.",
      ],
      difficulty: "medium",
      solution:
        "SELECT i.number, c.name,\n  MAX(CAST(julianday('2025-03-15') - julianday(i.due_on) AS INTEGER), 0) AS overdue,\n  ROUND((i.amount_cents - COALESCE(\n    (SELECT SUM(p.amount_cents)\n     FROM payments p WHERE p.invoice_id = i.id), 0)) / 100.0, 2) AS outstanding\nFROM invoices i\nJOIN customers c ON c.id = i.customer_id\nWHERE i.status = 'open'\nORDER BY overdue DESC, i.number;",
      mistakes: [
        { test: "date\\s*\\(\\s*'now'\\s*\\)", message: "The clock moves; the report must not — anchor the age math to the fixed AS OF date '2025-03-15'." },
        { test: "status\\s*!=\\s*'open'", message: "Aging is an OPEN-invoice report — paid history nets out and void never was real." },
        { test: "amount_cents\\s*\\/\\s*100\\.0\\s+as\\s+outstanding", message: "That's the face value — Alice's $4,000 partial must be netted out via the payments subquery before the dollar conversion." },
      ],
      expected: EXPECTED["l54-p1"],
      ordered: true,
    },
    {
      id: "l54-p2",
      title: "The bucket ladder",
      brief: "The tall aging report: `bucket` ('current','1-30','31-60','61-90','90+'), `n`, `total` (dollars), walked in ladder order — not alphabetical. Five rows.",
      hints: [
        "Build the detail (days_late + outstanding) in a derived table, CASE-label it, GROUP BY the label, and order by a CASE key that knows the ladder.",
        "Shape: SELECT bucket, COUNT(*) AS n, ROUND(SUM(out)/100.0, 2) AS total FROM (SELECT CASE WHEN d <= 0 THEN 'current' WHEN d <= 30 THEN '1-30' WHEN d <= 60 THEN '31-60' WHEN d <= 90 THEN '61-90' ELSE '90+' END AS bucket, outstanding AS out FROM (…detail…)) GROUP BY bucket ORDER BY CASE bucket WHEN 'current' THEN 0 WHEN '1-30' THEN 1 WHEN '31-60' THEN 2 WHEN '61-90' THEN 3 ELSE 4 END;",
      ],
      difficulty: "hard",
      solution:
        "SELECT bucket, COUNT(*) AS n,\n  ROUND(SUM(out) / 100.0, 2) AS total\nFROM (\n  SELECT CASE\n           WHEN d <= 0 THEN 'current'\n           WHEN d <= 30 THEN '1-30'\n           WHEN d <= 60 THEN '31-60'\n           WHEN d <= 90 THEN '61-90'\n           ELSE '90+'\n         END AS bucket,\n         out\n  FROM (\n    SELECT CAST(julianday('2025-03-15') - julianday(due_on) AS INTEGER) AS d,\n      amount_cents - COALESCE(\n        (SELECT SUM(p.amount_cents) FROM payments p\n         WHERE p.invoice_id = invoices.id), 0) AS out\n    FROM invoices WHERE status = 'open'\n  )\n)\nGROUP BY bucket\nORDER BY CASE bucket WHEN 'current' THEN 0 WHEN '1-30' THEN 1\n                     WHEN '31-60' THEN 2 WHEN '61-90' THEN 3 ELSE 4 END;",
      mistakes: [
        { test: "order\\s+by\\s+bucket\\s*(;|asc)", message: "Alphabetical walks '1-30, 31-60, 61-90, 90+, current' — the ladder needs the CASE sort key (or MIN(days_late))." },
        { test: "when\\s+d\\s*<\\s*0\\s*then\\s*'90|when\\s+d\\s*>\\s*90\\s*then.*when\\s+d\\s*<", message: "Ladder order matters — CASE exits at the first true test, so the branches must ascend: current (<= 0), 1-30, 31-60, 61-90, ELSE 90+." },
        { test: "amount_cents\\s+as\\s+out|sum\\s*\\(\\s*amount_cents", message: "Age the OUTSTANDING, not the face — Alice's partial payment must net out in the detail layer." },
      ],
      expected: EXPECTED["l54-p2"],
      ordered: true,
    },
    {
      id: "l54-p3",
      title: "The controller's one-row pivot",
      brief: "The wide aging report, one row: `current`, `b1_30`, `b31_60`, `b61_90`, `b90plus` — outstanding dollars per bucket, five SUM(CASE …) columns over the same detail.",
      hints: [
        "One scan, five conditional aggregates: each column sums the outstanding only for its day-range, ELSE 0.",
        "Shape: SELECT ROUND(SUM(CASE WHEN d <= 0 THEN out ELSE 0 END)/100.0,2) AS current, … SUM(CASE WHEN d > 90 THEN out ELSE 0 END) … AS b90plus FROM (…detail as in l54-p2…);",
      ],
      difficulty: "hard",
      solution:
        "SELECT\n  ROUND(SUM(CASE WHEN d <= 0 THEN out ELSE 0 END) / 100.0, 2) AS current,\n  ROUND(SUM(CASE WHEN d BETWEEN 1 AND 30 THEN out ELSE 0 END) / 100.0, 2) AS b1_30,\n  ROUND(SUM(CASE WHEN d BETWEEN 31 AND 60 THEN out ELSE 0 END) / 100.0, 2) AS b31_60,\n  ROUND(SUM(CASE WHEN d BETWEEN 61 AND 90 THEN out ELSE 0 END) / 100.0, 2) AS b61_90,\n  ROUND(SUM(CASE WHEN d > 90 THEN out ELSE 0 END) / 100.0, 2) AS b90plus\nFROM (\n  SELECT CAST(julianday('2025-03-15') - julianday(due_on) AS INTEGER) AS d,\n    amount_cents - COALESCE(\n      (SELECT SUM(p.amount_cents) FROM payments p\n       WHERE p.invoice_id = invoices.id), 0) AS out\n  FROM invoices WHERE status = 'open'\n);",
      mistakes: [
        { test: "group\\s+by", message: "No grouping — the pivot is one row with five columns. GROUP BY would rebuild the tall shape." },
        { test: "case[^)]*then\\s+out(?!\\s+else)", message: "Missing ELSE 0 — non-matching rows become NULL, and an all-NULL bucket NULLs its entire column." },
        { test: "between\\s+0\\s+and\\s+30", message: "0 belongs to 'current', not '1-30' — the day-30 boundary: BETWEEN 1 AND 30 (or d > 0 AND d <= 30)." },
      ],
      expected: EXPECTED["l54-p3"],
    },
    {
      id: "l54-p4",
      title: "Worst bucket per customer",
      brief: "Each open-invoice customer's deepest late stage: `name` and `bucket` (same labels), ordered by true days-late DESC then name. Six rows — Alice and Liam share '1-30'.",
      hints: [
        "Detail again (days_late + label), then GROUP BY customer taking MAX(days_late) — and derive the label from that max so ties label consistently.",
        "Shape: SELECT name, CASE WHEN m <= 0 THEN 'current' … ELSE '90+' END AS bucket FROM (SELECT c.name, MAX(d) AS m FROM …detail joined to customers… GROUP BY c.name) ORDER BY m DESC, name; — wrap once more to label the max.",
      ],
      difficulty: "hard",
      solution:
        "SELECT name,\n  CASE WHEN m <= 0 THEN 'current' WHEN m <= 30 THEN '1-30'\n       WHEN m <= 60 THEN '31-60' WHEN m <= 90 THEN '61-90'\n       ELSE '90+' END AS bucket\nFROM (\n  SELECT c.name, MAX(d) AS m\n  FROM (\n    SELECT customer_id,\n      CAST(julianday('2025-03-15') - julianday(due_on) AS INTEGER) AS d\n    FROM invoices WHERE status = 'open'\n  ) i\n  JOIN customers c ON c.id = i.customer_id\n  GROUP BY c.name\n)\nORDER BY m DESC, name;",
      mistakes: [
        { test: "max\\s*\\(\\s*bucket", message: "MAX over the LABEL sorts alphabetically ('current' > '90+' as text!) — take MAX of the DAYS, then label the max." },
        { test: "group\\s+by\\s+[^;]*order\\s+by\\s+bucket\\s+desc", message: "Alphabetical again — the risk order comes from the underlying days: ORDER BY the max days DESC." },
        { test: "having\\s+m\\s*>\\s*0|where\\s+d\\s*>\\s*0", message: "That erases Isabella's 'current' row — the report wants every open customer's stage, including the not-yet-late." },
      ],
      expected: EXPECTED["l54-p4"],
      ordered: true,
    },
    {
      id: "l54-p5",
      title: "The exposure number",
      brief: "How much open AR is already past due? One column `overdue_total` = ROUND(SUM(outstanding)/100.0, 2) over open invoices with days_late > 0.",
      hints: [
        "The lesson-52 outstanding subquery plus one WHERE on computed lateness — detail first, single aggregate after.",
        "Shape: SELECT ROUND(SUM(amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = invoices.id), 0))/100.0, 2) AS overdue_total FROM invoices WHERE status = 'open' AND julianday('2025-03-15') - julianday(due_on) > 0;",
      ],
      difficulty: "medium",
      solution:
        "SELECT ROUND(SUM(amount_cents - COALESCE(\n  (SELECT SUM(p.amount_cents) FROM payments p\n   WHERE p.invoice_id = invoices.id), 0)) / 100.0, 2) AS overdue_total\nFROM invoices\nWHERE status = 'open'\n  AND julianday('2025-03-15') - julianday(due_on) > 0;",
      mistakes: [
        { test: ">=\\s*0", message: "Boundary — days_late = 0 is due TODAY, not yet late. Strictly > 0; Isabella's −6 must stay out." },
        { test: "\\bcurrent\\b.*union|status\\s*=\\s*'current'", message: "There's no 'current' status — currency is derived from dates. Filter status = 'open' and let the julianday math pick the late ones." },
        { test: "\\bcount\\s*\\(", message: "The exposure is MONEY, not invoice count — SUM of outstanding, converted once at the edge." },
      ],
      expected: EXPECTED["l54-p5"],
    },
    {
      id: "l54-p6",
      title: "Current vs late, one row",
      brief: "The board slide: one row, `current_pct` and `overdue_pct` — each ROUND(100.0 * bucket / total outstanding, 1). Answer: 17.9 vs 82.1.",
      hints: [
        "Two conditional sums over the same detail (current = days_late <= 0), wrapped once more so the division sees finished aggregates.",
        "Shape: SELECT ROUND(100.0*cur/total, 1) AS current_pct, ROUND(100.0*(total-cur)/total, 1) AS overdue_pct FROM (SELECT SUM(CASE WHEN d <= 0 THEN out ELSE 0 END) AS cur, SUM(out) AS total FROM (…detail…));",
      ],
      difficulty: "hard",
      solution:
        "SELECT ROUND(100.0 * cur / total, 1) AS current_pct,\n  ROUND(100.0 * (total - cur) / total, 1) AS overdue_pct\nFROM (\n  SELECT SUM(CASE WHEN d <= 0 THEN out ELSE 0 END) AS cur,\n    SUM(out) AS total\n  FROM (\n    SELECT CAST(julianday('2025-03-15') - julianday(due_on) AS INTEGER) AS d,\n      amount_cents - COALESCE(\n        (SELECT SUM(p.amount_cents) FROM payments p\n         WHERE p.invoice_id = invoices.id), 0) AS out\n    FROM invoices WHERE status = 'open'\n  )\n);",
      mistakes: [
        { test: "\\bcount\\b", message: "Percent of MONEY, not of invoices — one $4,937 invoice outweighs four small ones. Weight by outstanding." },
        { test: "100\\.0\\s*\\*\\s*sum\\s*\\(", message: "Dividing a raw SUM by another raw SUM inside the same SELECT can't reference sibling aggregates — wrap the sums in a derived table, then compute the ratio outside." },
        { test: "overdue_pct[^;]*(cur\\s*\\/|current_pct)", message: "Overdue share = (total − current) / total, not current/total — mind which numerator the brief assigned to which column." },
      ],
      expected: EXPECTED["l54-p6"],
    },
  ],
  takeaway: "Freeze the AS OF date, compute days-late with julianday, net to outstanding, then let the CASE ladder sort risk — tall for charts, wide for the Monday meeting, and Pedro's phone number first.",
  deep: [
    {
      kind: "mind",
      text: "AR aging is the **collections prioritizer**: for every open invoice, how many days past due, bucketed into the ladder 0 / 1–30 / 31–60 / 61–90 / 90+. Two moves build it: the day count (julianday(today) − julianday(due_on), truncated to INTEGER — an invoice due tomorrow is NEGATIVE days, not zero) and the CASE ladder whose rungs are ordered least-first so each inherits the earlier bounds (CASE stops at the first true test — the ladder is cumulative by construction). The 6 open invoices in the seed become the collections call sheet; everyone else's money is already in the door. The aging report is where SQL meets cash flow directly: which bucket sums to how much decides who gets called first.",
    },
    {
      kind: "engine",
      title: "you run the aging ladder over open invoices",
      steps: [
        "**Population** — WHERE status = 'open': 6 invoices. Aging runs on OPEN money only; paid invoices would all be ≤ 0 days and drown the signal.",
        "**Day math** — julianday('2025-03-15') − julianday(due_on) is exact float days; CAST to INTEGER truncates toward zero — 2.9 days late becomes 2, and future dues go negative.",
        "**Ladder** — CASE WHEN days <= 0 THEN 'current' WHEN <= 30 THEN '1-30' … the first true rung wins; each later rung implicitly assumes all earlier failed. Order of rungs IS the logic.",
        "**The pivot** — SUM by bucket (CASE per bucket or the lesson's GROUP BY) turns the call sheet into the exposure table: dollars at risk per lateness tier, the shape credit teams actually read.",
      ],
    },
    {
      kind: "myth",
      myth: "\"Days late = today − due_date, rounded.\"",
      truth: "Rounding is the wrong verb: an invoice 0.9 days late is CURRENT, not 1 day. **Truncate toward zero** so partial days don't graduate buckets early — and note that due-TOMORROW is negative days, which the ≤ 0 first rung must catch as 'current', not leak into '1-30'.",
    },
    {
      kind: "edge",
      items: [
        { c: "The 'as of' date", r: "Hard-code it ('2025-03-15' in the drills) or parameterize it — but NEVER use date('now'): the report must be reproducible; a moving today makes two runs disagree and audits impossible." },
        { c: "Paid-but-reopened", r: "A payment that arrives then a refund issued: status flips back. Aging trusts status — if the status pipeline lags, the ladder lies. Reconcile status vs payments like lesson 52 taught." },
        { c: "Ladder gaps", r: "WHEN days <= 30 / WHEN days <= 90 with no 31-60 rung silently folds 40-day invoices into '90+' heirs... no wait, into the 90 rung. Every gap in the ladder is a bucket that steals from its neighbors — rung order and completeness both matter." },
        { c: "Negative days in the report", r: "'Current' should INCLUDE future-due invoices: the ≤ 0 rung catches negatives. Filter days >= 0 and you evict not-yet-due money from the exposure table — a quiet understatement." },
      ],
    },  ],
};
