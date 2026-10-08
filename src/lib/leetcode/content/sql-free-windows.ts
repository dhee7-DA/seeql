// Deep-dives — free new-gen SQL batch 10, file 2 of 5: the window/island
// readers (5 problems: 1 Hard, 4 Medium). Every dive is an order:"exact" READ
// with a result-level ORDER BY. Re-authored from the canonical free tasks:
// own tables, own seeds, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_FREE_WINDOWS: LcSqlDive[] = [
  {
    slug: "human-traffic-of-stadium",
    statement:
      "VenueDay tracks one row per day for a concert venue: (day, visitors), where day is a contiguous integer calendar — every day from 1 through N appears exactly once. A day is BUSY when it drew at least 100 visitors. Report every day that belongs to a busy STREAK of three or more consecutive days: columns day, visitors, one row per qualifying day, ordered by day ascending. Isolated busy days and short busy stretches never appear.",
    examples: [
      {
        input: "days 14 to 17 draw 160, 155, 150 and 170 visitors — four consecutive days, every one at or above the 100 line",
        output: "14 · 160 · 15 · 155 · 16 · 150 · 17 · 170",
        explanation:
          "A four-day streak reports all four of its days, not just the first: every day inside a qualifying run is part of the answer.",
      },
      {
        input: "day 10 draws 145, day 11 draws exactly 100 and day 12 draws 118",
        output: "10 · 145 · 11 · 100 · 12 · 118",
        explanation:
          "Exactly 100 meets the at-least-100 bar, so the three-day run holds and day 11 reports with the rest.",
      },
    ],
    constraints: [
      "day is a contiguous integer calendar (1..N, no gaps), so consecutive means day = previous day + 1",
      "a day qualifies when visitors >= 100 — exactly 100 is in; a streak must hold on three or more consecutive days",
      "columns day, visitors — every day of every qualifying streak appears, ordered by day ascending",
    ],
    breakdown: [
      "The hard part is not the 100 threshold but the word consecutive: GROUP BY can count busy days and WHERE can find them, yet neither can see whether two busy days touch. A run of three busy days is a property of NEIGHBOURING rows, so the query must first make adjacency computable and only then measure run lengths. The gaps-and-islands pattern does exactly that: mark each day with a busy flag, then collapse every unbroken stretch of flagged days into one group identified by a single key. Once the key exists, the whole question shrinks to counting group members.",
      "The island key is an arithmetic identity: number the busy days in day order while a running sum accumulates how many busy days have gone by, and inside an unbroken stretch the two climb in lockstep so their difference stays flat, while every gap pushes the difference up a step for the rest of the timeline. This query keys with day minus the running flag sum, which is safe here because the calendar is contiguous — day climbs exactly as a row number would. The busy filter must ride along wherever the key is used: computed over every row, a non-busy day lands on the same key as the first busy day after it, and a run-length count that swallows such cold rows inflates short stretches into fake streaks.",
      "The final rule decides who reports: every row of a qualifying run, not just its start. Grouping the keyed rows and keeping keys with at least three members identifies the streaks; the outer query then emits each member row in day order. A tempting shortcut reports one row per streak — the earliest day of each group — which satisfies the eye but breaks the contract, because the report is day-grain: someone staffing the venue needs all ten seed rows, and a start-days-only query ships three.",
    ],
    edges: [
      "Day 5 draws 250 — the busiest single day in the seed — but sits between a 55 and a 60, so its streak is one day long: a bare WHERE visitors >= 100 ships it, and only the run-length test removes it.",
      "Day 11 sits at exactly 100 inside the 10-12 run and stays; day 8 also sits at exactly 100 but its stretch (days 7-8) is two long and goes — exactly 100 earns a place only when the run around it qualifies, and a > 100 comparison would also delete day 11 and strand its neighbours as singletons.",
      "The seed holds 13 busy days in five stretches of 3, 1, 2, 3 and 4: a report of run starts would print days 1, 10 and 14 — three rows where the contract demands ten.",
      "Key computed without the busy filter: day 6 (60 visitors) lands on the same key as days 7-8, so a run-length count over all rows reads that group as three members and leaks the two-day pair into the output — the filter belongs on every use of the key, not just the final SELECT.",
    ],
    ladder: [
      { title: "Brute force — check every triple", body: "Self-join the table so each day looks at day+1 and day+2, keep the triples where all three visitors counts clear 100, and then expand each surviving start back into its full run. Correct, but the expansion is a second query hiding inside the first, and the triple join stops helping the moment a run runs longer than three." },
      { title: "The pattern — flag the busy days, key the stretches", body: "A CASE flag marks visitors >= 100; filtering to flagged rows and subtracting the running flag sum from the day number assigns every busy day a stretch id that stays constant inside a run and jumps across every gap." },
      { title: "The optimal idea — count members per key, then emit them all", body: "O(n log n). Group the keyed busy days, keep keys with at least three members, and emit every member row in day order — the transferable shape for any request of the form 'report every member of a qualifying consecutive block'." },
    ],
    approach: "gaps-and-islands on the busy flag: day minus running flag sum keys each stretch, keys with >= 3 members qualify, all member rows report",
    schema: {
      ddl: `CREATE TABLE VenueDay (
  day      INTEGER PRIMARY KEY,
  visitors INTEGER NOT NULL
);`,
      seed: `INSERT INTO VenueDay (day, visitors) VALUES
  (1, 120),   -- busy run opens
  (2, 115),
  (3, 130),   -- days 1-3 form a 3-day streak, every row reports
  (4, 55),    -- cold gap
  (5, 250),   -- busiest day of the month but ISOLATED: streak of one, out
  (6, 60),    -- cold gap
  (7, 105),   -- a two-day stretch starts here
  (8, 100),   -- exactly 100 again, yet the stretch is 2 long: out
  (9, 75),    -- cold gap
  (10, 145),  -- 3-day streak with the boundary day inside
  (11, 100),  -- exactly 100: stays in
  (12, 118),
  (13, 40),   -- cold gap
  (14, 160),  -- 4-day streak
  (15, 155),
  (16, 150),
  (17, 170);`,
      tables: [
        { name: "VenueDay", note: "17 contiguous days — busy stretches of 3 (days 1-3), 1 (day 5), 2 (days 7-8), 3 (days 10-12) and 4 (days 14-17)" },
      ],
    },
    code: `WITH flagged AS (
    SELECT
        day,
        visitors,
        CASE WHEN visitors >= 100 THEN 1 ELSE 0 END AS hot   -- exactly 100 is busy
    FROM VenueDay
),
islands AS (
    SELECT
        day,
        visitors,
        day - SUM(hot) OVER (ORDER BY day) AS grp   -- constant inside a streak
    FROM flagged
    WHERE hot = 1                                   -- key only on busy rows
)
SELECT day, visitors
FROM islands
WHERE grp IN (
    SELECT grp
    FROM islands
    GROUP BY grp
    HAVING COUNT(*) >= 3                            -- the streak-length test
)
ORDER BY day;`,
    walkthrough: [
      "The flag paints 13 of the 17 days busy; filtering to them leaves 13 rows, and the running flag sum numbers them 1..13 in day order, so the key sorts the busy days into stretches of sizes 3, 1, 2, 3 and 4.",
      "The HAVING keeps keys with at least three members: days 1-3, days 10-12 and days 14-17 — day 5's singleton and the 7-8 pair die here.",
      "Ten rows ship ordered by day: (1, 120), (2, 115), (3, 130), (10, 145), (11, 100), (12, 118), (14, 160), (15, 155), (16, 150), (17, 170) — day 5's 250 and the exactly-100 day 8 never surface.",
    ],
    time: "O(n log n) — one ordered pass to key the flags plus a grouped pass over the busy rows",
    space: "O(n) — the keyed busy rows held until the final filter",
    followUps: [
      "Report each streak as one row — its start day, end day and length — instead of member rows: which aggregate per key produces the bounds, and how do the 1-day and 2-day stretches show up if the report must list every streak, not just qualifying ones?",
      "Generalise the threshold to a value that arrives as a parameter (busy = at least k visitors): which spots in the query change, and does the contiguity of day still carry the key if the calendar ever sprouts gaps — or must the key switch to ROW_NUMBER()?",
    ],
    related: ["consecutive-available-seats", "consecutive-available-seats-ii", "game-play-analysis-iv"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "customers-who-bought-all-products",
    statement:
      "Product is the shop's full catalogue — one row per item sold (product_id, name). ShopperCart logs one row per purchase event (shopper_id, product_id), and a shopper may buy the same item on separate occasions, leaving duplicate rows. Report the shopper_ids who have bought EVERY product in the catalogue at least once: one column, shopper_id, ordered ascending. The catalogue total must be read from the Product table, never assumed.",
    examples: [
      {
        input: "shopper 2's cart holds product 1 once, product 2 on two separate rows and product 3 once — four rows, three distinct products",
        output: "2",
        explanation:
          "The duplicate row collapses under COUNT(DISTINCT product_id), and three distinct products equals the catalogue's three — shopper 2 qualifies.",
      },
      {
        input: "shopper 3 bought products 1 and 2 and never product 3",
        output: "(no row — two of three is not every product)",
        explanation:
          "The comparison is equality with the full catalogue count, so near-misses like 2-of-3 fail the HAVING and vanish.",
      },
    ],
    constraints: [
      "every catalogue product must appear at least once in a qualifying shopper's cart; duplicates neither help nor hurt",
      "the target count is (SELECT COUNT(*) FROM Product) — a literal catalogue size answers only today's data",
      "one column shopper_id, one row per qualifying shopper, ordered by shopper_id ascending",
    ],
    breakdown: [
      "This is relational division wearing a shopping trolley: the question is 'for every product, does this shopper have a row?', and SQL has no FOR ALL keyword. The standard translation turns the universal quantifier into arithmetic — count how many DISTINCT products each shopper's cart touches, and compare that count with the size of the catalogue. A shopper qualifies exactly when the two numbers meet, because their distinct products form a subset of the catalogue, and a subset equals the whole set precisely when their sizes match.",
      "A comparison is only as honest as both of its operands. The shopper side must count DISTINCT product_id: shopper 2's cart holds four rows but only three products, and a plain COUNT(*) would read 4 against a catalogue of 3 and throw away a legitimate buyer. The catalogue side must come from the Product table — (SELECT COUNT(*) FROM Product) — because the number three is a property of today's stock, not of the question; a literal survives this seed and silently rots the moment a fourth product launches and nobody re-tunes the query.",
      "The gate direction matters as much as the operands. HAVING with equality is what makes near-misses fail: shopper 3's two distinct products sit below the catalogue's three, and any permissive reading — at least one product, at least two, more than the average — promotes partial coverage into a pass. The GROUP BY is over the cart alone, so shoppers with no rows at all form no group and cannot leak in; and a join to Product is unnecessary here, though the mirrored report — products nobody ever bought — is where a Product-to-cart LEFT JOIN becomes the right tool.",
    ],
    edges: [
      "Shopper 2's second (2, 2) row is the planted duplicate: COUNT(*) reads 4 against the catalogue's 3 and drops the one shopper who truly bought everything — only COUNT(DISTINCT product_id) reads the truth.",
      "Shopper 3 holds exactly two of three: a HAVING of >= 1 or >= 2 admits them — the >= 2 form returns shoppers 1, 2 and 3 — so equality with the full catalogue count is the only correct gate.",
      "A literal 3 in place of the subquery agrees on this seed and keeps agreeing until the catalogue changes — the trap is that nothing errors, the query just stops being an answer to the question asked.",
      "Shopper 4 bought only product 3: a confused report that groups by product_id instead of shopper_id answers a different question entirely, emitting per-product coverage rows about the catalogue rather than per-shopper completeness.",
    ],
    ladder: [
      { title: "Brute force — cross-check every shopper against every product", body: "For each shopper, walk the catalogue and search their cart rows for each product one by one, keeping those with no miss. The double loop is relational division by hand, and the engine expresses it as one grouped count against a catalogue total." },
      { title: "The pattern — count distinct, compare with the catalogue", body: "GROUP BY shopper_id, COUNT(DISTINCT product_id), and HAVING that count equal to a scalar subquery reading the catalogue size from Product." },
      { title: "The optimal idea — division as an equality of two data-driven counts", body: "O(c + p). The durable rule: 'bought every X' compares a per-customer DISTINCT count against (SELECT COUNT(*) FROM X) — both operands queried, neither literal; the double NOT EXISTS form is the equivalent shape when membership must check a condition rather than a count." },
    ],
    approach: "GROUP BY shopper with COUNT(DISTINCT product_id) compared to the Product-table total via scalar subquery",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL
);
CREATE TABLE ShopperCart (
  shopper_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES Product(product_id)
);`,
      seed: `INSERT INTO Product (product_id, name) VALUES
  (1, 'Kettle'),
  (2, 'Mug'),      -- shopper 2 buys it twice: the duplicate-row trap
  (3, 'Plate');
INSERT INTO ShopperCart (shopper_id, product_id) VALUES
  (1, 1), (1, 2), (1, 3),          -- shopper 1: all three, clean
  (2, 1), (2, 2), (2, 2), (2, 3),  -- shopper 2: all three PLUS a duplicate Mug
  (3, 1), (3, 2),                  -- shopper 3: 2 of 3, the near-miss
  -- shopper 4: one product only
  (4, 3);`,
      tables: [
        { name: "Product", note: "the FULL catalogue — 3 items; the qualifying bar is exactly this table's row count" },
        { name: "ShopperCart", note: "10 purchase rows over 4 shoppers — shopper 2 carries a duplicate Mug row" },
      ],
    },
    code: `SELECT shopper_id
FROM ShopperCart
GROUP BY shopper_id
HAVING COUNT(DISTINCT product_id) = (SELECT COUNT(*) FROM Product)  -- division gate
ORDER BY shopper_id;`,
    walkthrough: [
      "The GROUP BY folds ten cart rows into four shoppers with distinct-product counts of 3, 3, 2 and 1 — shopper 2's four raw rows collapse to 3 under DISTINCT.",
      "The scalar subquery reads the bar straight from Product: 3 items, whatever the stock happens to be that day.",
      "HAVING keeps only the counts that meet 3 — shoppers 1 and 2 — and ORDER BY ships (1), (2); shopper 3's 2 and shopper 4's 1 fall short.",
    ],
    time: "O(c + p) — one grouped pass over the cart plus one catalogue count",
    space: "O(s) — one count per shopper",
    followUps: [
      "Rewrite the same answer with double negation — NOT EXISTS a product for which NOT EXISTS a cart row for this shopper — and compare which form degrades more gracefully when 'bought' must also mean 'bought after a given date'.",
      "Report the mirrored failure: catalogue products that NO shopper ever bought — which table drives the FROM, and what does COUNT over the cart side read for them?",
    ],
    related: ["students-and-examinations", "classes-more-than-5-students", "customers-who-never-order"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "restaurant-growth",
    statement:
      "CafeDay holds one row per day of trading: (visited_on, amount), where visited_on is a TEXT date in 'YYYY-MM-DD' form and the rows form a contiguous calendar — no missing days. The cafe wants its growth trajectory: a 7-day rolling average of amount ENDING at each day. The first six days of data cannot host a full week, so they are absent from the report entirely. Report visited_on and rolling_avg — the 7-day average rounded to two decimal places — one row per day from the seventh onward, ordered by visited_on ascending.",
    examples: [
      {
        input: "the first seven days 2024-06-01 through 2024-06-07 draw 90, 110, 130, 120, 140, 100 and 130 — a window total of 820",
        output: "2024-06-07 · 117.14",
        explanation:
          "820 * 1.0 / 7 is 117.142857..., which ROUND folds to 117.14; days 1 through 6 never report because their week is not full.",
      },
      {
        input: "the window ending 2024-06-10 covers 2024-06-04 through 2024-06-10: 120, 140, 100, 130, 150, 95 and 105 — a total of 840",
        output: "2024-06-10 · 120.0",
        explanation:
          "840 divides by 7 exactly, so the rolling average is a clean 120.0 — the * 1.0 promotion is what keeps the quotient REAL before rounding.",
      },
    ],
    constraints: [
      "each reported day's window is exactly that day plus the six before it — a full 7-day frame; days with less than a week of history never appear",
      "the divisor is the constant 7, not however many rows happen to sit in the frame",
      "rolling_avg is rounded to two decimal places; columns visited_on, rolling_avg, ordered by visited_on ascending",
    ],
    breakdown: [
      "A moving average that ENDS at each day is a window frame, not a GROUP BY: the report keeps one row per day and computes over the six predecessors plus the current row. SUM(amount) OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) is that frame spelled out — six physical rows back, current row in. ROWS rather than RANGE is deliberate: dates are unique here so the two would agree, but ROWS counts rows, which is what 'seven days of trading' means, and the spelling stops a future duplicate date from silently widening the window.",
      "The window cannot filter its own output: it runs over every row, so days one through six carry frames of one to six rows and divide by 7 anyway, printing nonsense like 90 over 7 for day one. The remedy is a post-aggregation filter — compute a frame-row counter alongside the sum with the same frame, and keep only rows where it reads 7. That counter is the frame's own testimony about how much history it saw; a WHERE on the date placed before the window maims the input instead, shrinks every surviving frame, and reprints the same degenerate averages over the trimmed set.",
      "The arithmetic needs two guards. Multiplying by 1.0 promotes the division to REAL: without it, 820 / 7 is integer division, which floors to 117 before ROUND ever runs, and the report prints 117.0 wearing two decimals it never earned. ROUND(..., 2) then folds 117.142857... to 117.14 — and the seed's second flavour, a window total of 840, divides exactly and ships 120.0, the clean anchor in a row of repeating decimals. Dividing by the frame's own row count instead would be a different and wrong report on the early days — 90 over a 1-row frame — which is precisely why the frame-row filter, not a variable divisor, is the fix.",
    ],
    edges: [
      "Days 2024-06-01 through 2024-06-06 are absent: drop the frame_rows filter and the report grows to ten rows whose day-one value is ROUND(90 * 1.0 / 7, 2) = 12.86 — a one-row frame pretending to be a week.",
      "A WHERE visited_on >= '2024-06-07' placed BEFORE the window keeps four rows but recomputes their frames on the trimmed input: 2024-06-07's frame holds one row and prints 18.57, 2024-06-08's prints 40.0 — the boundary filter must run after the window, which the frame_rows counter enforces structurally.",
      "Without the * 1.0 promotion the four rows read 117.0, 125.0, 123.0 and 120.0: 820 / 7, 880 / 7 and 865 / 7 all floor to integers inside SQLite before ROUND sees them.",
      "The window totals run 820, 880, 865, 840 across the four reported days — 840 lands exactly on 120.0, while its neighbours carry the repeating 0.142857... pattern that ROUND must fold to 117.14, 125.71 and 123.57.",
    ],
    ladder: [
      { title: "Brute force — sum each week by hand", body: "For each day, find its six predecessors in sorted order, add the seven amounts, divide and round. Seven lookups per row is the ROWS frame rewritten in application code." },
      { title: "The pattern — one window, two measures", body: "A single OVER (ORDER BY visited_on ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) computes both the sliding SUM and a COUNT of the frame, so every row knows whether its week was full." },
      { title: "The optimal idea — filter on the frame's own testimony", body: "O(n log n). The durable rule: a window cannot drop its underfilled rows, so compute the frame size alongside the aggregate and filter afterwards — never shrink the window input to fake the boundary." },
    ],
    approach: "ROWS 6 PRECEDING..CURRENT ROW sliding SUM divided by 7 with * 1.0 and ROUND, kept only where the same frame's COUNT reads 7",
    schema: {
      ddl: `CREATE TABLE CafeDay (
  visited_on TEXT PRIMARY KEY,  -- 'YYYY-MM-DD', contiguous calendar
  amount     INTEGER NOT NULL
);`,
      seed: `INSERT INTO CafeDay (visited_on, amount) VALUES
  ('2024-06-01', 90),
  ('2024-06-02', 110),
  ('2024-06-03', 130),
  ('2024-06-04', 120),
  ('2024-06-05', 140),
  ('2024-06-06', 100),  -- six days of history: NOT enough to report
  ('2024-06-07', 130),  -- first full week: 90+110+130+120+140+100+130 = 820
  ('2024-06-08', 150),  -- week 110+130+120+140+100+130+150 = 880
  ('2024-06-09', 95),   -- week 130+120+140+100+130+150+95 = 865
  -- week 120+140+100+130+150+95+105 = 840 -> exactly 120.0
  ('2024-06-10', 105);`,
      tables: [
        { name: "CafeDay", note: "10 contiguous days — only 2024-06-07 onward hosts a full 7-day window" },
      ],
    },
    code: `WITH windows AS (
    SELECT
        visited_on,
        ROUND(
            SUM(amount) OVER (
                ORDER BY visited_on
                ROWS BETWEEN 6 PRECEDING AND CURRENT ROW  -- the week ending here
            ) * 1.0 / 7,                                  -- REAL division, constant divisor
            2
        ) AS rolling_avg,
        COUNT(*) OVER (
            ORDER BY visited_on
            ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
        ) AS frame_rows                                   -- how much history this row saw
    FROM CafeDay
)
SELECT visited_on, rolling_avg
FROM windows
WHERE frame_rows = 7        -- the first six days host no full week
ORDER BY visited_on;`,
    walkthrough: [
      "The frame slides down ten contiguous days: its sum reads 820 ending 2024-06-07, 880 ending 2024-06-08, 865 ending 2024-06-09 and 840 ending 2024-06-10, while days one through six hold frames of one to six rows.",
      "frame_rows separates the two worlds — 7 for the last four days, 1..6 for the rest — and WHERE frame_rows = 7 keeps exactly the full weeks.",
      "The divisions ship as 117.14, 125.71, 123.57 and 120.0, ordered by date; without the promotion the first three would print 117.0, 125.0 and 123.0, and without the filter day one would print 12.86.",
    ],
    time: "O(n log n) — one date-ordered pass feeding two same-framed window measures",
    space: "O(n) — one windowed row per day until the filter",
    followUps: [
      "Report the 7-day average as a GROWTH column beside each day's raw amount — which frame arithmetic changes, and what happens to the first six days under a LEFT JOIN that insists every day appears?",
      "The cafe closes on Mondays, so the calendar sprouts gaps: does ROWS 6 PRECEDING still mean 'seven calendar days', and which window variant (RANGE over a numeric day index, or a self-join on date arithmetic) survives the gaps?",
    ],
    related: ["average-selling-price", "monthly-transactions-i", "game-play-analysis-v"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-students-who-improved",
    statement:
      "TestScore records exactly two attempts per (student, subject): one row per attempt, attempt numbered 1 or 2, score an integer. A student IMPROVED in a subject when their attempt 2 score is strictly greater than their attempt 1 score in that subject. Report one row per improved subject — student_id, subject, first_score, second_score — ordered by student_id ascending, then subject ascending. Students with no improved subject appear nowhere; students with two improved subjects appear twice.",
    examples: [
      {
        input: "student 4 scored 84 in Math on attempt 1 and 84 on attempt 2, and 59 in Physics on attempt 1 and 60 on attempt 2",
        output: "4 · Physics · 59 · 60",
        explanation:
          "Math's equal pair is not improvement — only Physics, up by exactly one point, qualifies.",
      },
      {
        input: "student 1 moved 70 to 85 in Math and 80 to 92 in Physics",
        output: "1 · Math · 70 · 85 · 1 · Physics · 80 · 92",
        explanation:
          "Improvement is per subject: the student is not deduped across subjects and reports once per improved one.",
      },
    ],
    constraints: [
      "exactly two attempts exist per (student, subject); attempt 1 is the first and attempt 2 the second",
      "a subject qualifies only when second_score > first_score — equal scores are not improvement",
      "columns student_id, subject, first_score, second_score — one row per improved subject, ordered by student_id then subject",
    ],
    breakdown: [
      "The two scores being compared live on different rows, so the query is a pairing problem before it is a comparison problem. A self-join on TestScore with the attempt numbers pinned in the ON clause — t1.attempt = 1 and t2.attempt = 2 — pairs each subject's first attempt with its second, and the join key must include subject: keyed on student_id alone, Math's attempt 1 would meet Physics's attempt 2 and fabricate cross-subject pairs out of unrelated scores. With exactly two attempts guaranteed, the pair is unique once the subject is in the key.",
      "The improvement test is strict, and the seed spends a whole student proving it. Student 4's Math pair reads 84 and 84 — no movement — while their Physics climbs 59 to 60; a >= comparison would promote the flat pair into a pass and print a row the report must not contain. Strictness is also what makes the one-point improvement count: 60 > 59 clears the bar by the smallest margin integer scores allow, so no 'meaningful improvement' threshold belongs in the predicate.",
      "Grain decides the output shape. The join produces one row per (student, subject) pair, the WHERE keeps the improved ones, and no aggregation ever collapses students — a student with two improved subjects ships twice, and a student with none simply survives no pair. The alternative shape is a pivot: GROUP BY student_id, subject with MAX(CASE WHEN attempt = 1 THEN score END) and its attempt-2 twin, then HAVING second > first. The pivot generalises to N attempts (max becomes the latest, min the earliest), while the self-join stays the most direct reading when the two-attempt guarantee holds.",
    ],
    edges: [
      "Student 4's Math pair (84, 84) is the planted equal: swapping the predicate to >= prints a fifth row, 4 · Math · 84 · 84, that the strict report must withhold.",
      "Student 4's Physics pair (59, 60) improves by exactly one point and stays in — a 'rose by more than 1' reading deletes a genuine improvement.",
      "Drop subject from the join key and the pairing goes cross-eyed: student 1's Math attempt 1 meets Physics attempt 2 (70 against 92) and the report grows from four rows to nine, including a fabricated resurrection of student 3, whose Chemistry 77 is compared against Math's attempt-2 81.",
      "Student 3 declined in both subjects (88 to 81, 77 to 70) and must vanish entirely: a predicate of <> counts any CHANGE as improvement and would print both of student 3's rows.",
    ],
    ladder: [
      { title: "Brute force — sort and compare in pairs", body: "Pull each (student, subject)'s two rows, sort by attempt, and compare score 2 against score 1 in application code. A keyed walk the engine already expresses as a two-attempt self-join." },
      { title: "The pattern — attempt 1 joined to attempt 2", body: "Self-join TestScore on (student_id, subject) with attempt pinned to 1 on the left side and 2 on the right, then keep pairs where the second score is strictly greater." },
      { title: "The optimal idea — pair on the natural key, keep the predicate strict", body: "O(n). The durable rules: compare rows only through their natural key (student AND subject), encode 'improved' as a strict inequality, and reach for the MAX(CASE) pivot only when attempts stop being exactly two." },
    ],
    approach: "self-join attempt 1 to attempt 2 on (student_id, subject), WHERE second score strictly greater, no aggregation",
    schema: {
      ddl: `CREATE TABLE TestScore (
  student_id INTEGER NOT NULL,
  subject    TEXT NOT NULL,
  attempt    INTEGER NOT NULL CHECK (attempt IN (1, 2)),
  score      INTEGER NOT NULL,
  PRIMARY KEY (student_id, subject, attempt)
);`,
      seed: `INSERT INTO TestScore (student_id, subject, attempt, score) VALUES
  (1, 'Math', 1, 70), (1, 'Math', 2, 85),            -- improved
  (1, 'Physics', 1, 80), (1, 'Physics', 2, 92),      -- improved: student 1 ships twice
  (2, 'Math', 1, 65), (2, 'Math', 2, 78),            -- improved
  (2, 'Biology', 1, 90), (2, 'Biology', 2, 88),      -- declined: one improved subject only
  (3, 'Math', 1, 88), (3, 'Math', 2, 81),            -- declined
  (3, 'Chemistry', 1, 77), (3, 'Chemistry', 2, 70),  -- declined twice: absent entirely
  (4, 'Math', 1, 84), (4, 'Math', 2, 84),            -- equal pair: NOT improvement
  -- improved by exactly 1 point
  (4, 'Physics', 1, 59), (4, 'Physics', 2, 60);`,
      tables: [
        { name: "TestScore", note: "16 rows — 4 students, 2 subjects each, exactly two attempts per (student, subject)" },
      ],
    },
    code: `SELECT
    t1.student_id,
    t1.subject,
    t1.score AS first_score,      -- attempt 1
    t2.score AS second_score      -- attempt 2
FROM TestScore t1
JOIN TestScore t2
  ON t1.student_id = t2.student_id
 AND t1.subject    = t2.subject    -- the subject must be IN the key
 AND t1.attempt    = 1
 AND t2.attempt    = 2
WHERE t2.score > t1.score          -- STRICT: an equal pair is not improvement
ORDER BY t1.student_id, t1.subject;`,
    walkthrough: [
      "The self-join pairs all eight (student, subject) groups: (1, Math, 70, 85), (1, Physics, 80, 92), (2, Math, 65, 78), (2, Biology, 90, 88), (3, Math, 88, 81), (3, Chemistry, 77, 70), (4, Math, 84, 84), (4, Physics, 59, 60).",
      "WHERE t2.score > t1.score withholds (2, Biology, 90, 88), both of student 3's pairs and the (4, Math, 84, 84) flat pair — four rows survive.",
      "ORDER BY student_id, subject ships (1, Math, 70, 85), (1, Physics, 80, 92), (2, Math, 65, 78), (4, Physics, 59, 60): student 1 twice, student 3 nowhere.",
    ],
    time: "O(n) — one hash join over the attempt-1 and attempt-2 row sets",
    space: "O(p) — one paired row per (student, subject)",
    followUps: [
      "Rewrite the report as a pivot — GROUP BY student_id, subject with MAX(CASE WHEN attempt = 1 THEN score END) for both scores — and state which form survives a third retake attempt without multiplying rows.",
      "Report the DECLINED subjects beside the improved ones in one query: does a UNION of two predicates or a single paired row with CASE flags keep the (student, subject) grain, and where does the equal pair land?",
    ],
    related: ["average-time-of-process-per-machine", "count-salary-categories", "tree-node"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-consistently-improving-employees",
    statement:
      "PerformanceReview holds one row per review: (review_id, employee_id, rating), where rating runs 1 through 10 and review_id is globally chronological — an employee's reviews ordered by review_id are their history in time order. An employee is CONSISTENTLY IMPROVING when every consecutive pair of their ratings strictly rises AND their history holds at least three reviews. Report employee_id and review_count for every consistently improving employee, ordered by employee_id ascending.",
    examples: [
      {
        input: "employee 4's five reviews read 2, 4, 6, 8 and then 5",
        output: "(no row — the final dip poisons the whole history)",
        explanation:
          "Consistency tolerates zero failures: one falling step at the end disqualifies the sequence no matter how strong its start was.",
      },
      {
        input: "employee 2's three reviews read 4, 6 and 8",
        output: "2 · 3",
        explanation:
          "Exactly three strictly rising reviews is the minimum that qualifies — two rising reviews would be history too short to count as a trend.",
      },
    ],
    constraints: [
      "every consecutive pair in review_id order must satisfy next_rating > previous_rating — equal ratings break the streak",
      "at least three reviews are required; a shorter strictly-rising history does not qualify",
      "columns employee_id, review_count — one row per qualifying employee, ordered by employee_id ascending",
    ],
    breakdown: [
      "'Every consecutive pair strictly rises' is a property of ADJACENT rows inside each employee's history, which makes it LAG territory. Partition by employee_id, order by review_id, and LAG(rating) hands each review its predecessor's rating; the first review of a history has no predecessor, and its NULL comparison must read as clean rather than as a failure. The sequence test then collapses into a per-row flag: mark a step bad when the previous rating is greater than OR EQUAL to the current one, because both a fall and a plateau violate strict improvement.",
      "A sequence qualifies only if it contains zero bad steps, and 'zero anywhere in my history' is a partition-level fact — no single row knows it alone. MAX(bad_step) OVER (PARTITION BY employee_id) folds the flag upward: one bad step anywhere paints every row of that employee, so an outer WHERE ever_bad = 0 keeps only whole clean histories. The filtering order is structural: the window must see each employee's complete history, so the reviews that break the streak cannot be deleted by an early WHERE before their damage is recorded.",
      "The review-count gate is a separate requirement with its own teeth. Any two distinct ratings strictly rise — employee 5's 1-then-3 is a perfect two-review streak — so without a length test the report would crown two data points as a trend. COUNT(*) after the clean filter delivers each survivor's history length, and HAVING COUNT(*) >= 3 draws the line; employee 2's exactly-three history is the boundary case that a > 3 reading would erase. Both tests live in the same grouped pass, and the ORDER BY employee_id finishes the contract.",
    ],
    edges: [
      "Employee 5's history is 1 then 3 — strictly rising and perfectly clean: without the HAVING COUNT(*) >= 3 gate the report ships (5, 2), crowning a two-review pair as a trend.",
      "Employee 3's ratings run 5, 7, 7 — the plateau is the trap: a bad-step test written as LAG > rating (strictly falling only) keeps employee 3 and prints (3, 3) alongside the real answers.",
      "Employee 4's five reviews climb 2, 4, 6, 8 and then sink to 5: a MIN < MAX (or first < last) heuristic reads 2 < 5 and admits them — the LAG flag is what catches a failure ANYWHERE, and one late dip erases a long history.",
      "Employee 2's exactly three reviews sit on the gate's boundary: HAVING COUNT(*) > 3 leaves employee 1 alone and wrongly drops (2, 3).",
    ],
    ladder: [
      { title: "Brute force — walk each history by hand", body: "Sort each employee's reviews by review_id, loop the pairs, bail on the first non-rising step, and remember the length. Per-employee state the engine expresses as one LAG flag plus a partition-wide fold." },
      { title: "The pattern — LAG flag folded with MAX", body: "CASE WHEN LAG(rating) >= rating marks the bad steps; MAX(bad_step) OVER (PARTITION BY employee_id) spreads any single failure across the whole history." },
      { title: "The optimal idea — whole-history flag plus an explicit length gate", body: "O(n log n). The durable rules: streak properties are per-pair flags folded to the partition (MAX = 0 or SUM = 0), and 'enough history' is a HAVING COUNT gate that must be stated separately — strictness and length fail independently." },
    ],
    approach: "LAG flag for non-rising steps folded by MAX over the partition, then COUNT >= 3 in HAVING",
    schema: {
      ddl: `CREATE TABLE PerformanceReview (
  review_id   INTEGER PRIMARY KEY,  -- globally chronological
  employee_id INTEGER NOT NULL,
  rating      INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 10)
);`,
      seed: `INSERT INTO PerformanceReview (review_id, employee_id, rating) VALUES
  (1, 1, 3),   -- employee 1 opens
  (2, 2, 4),
  (3, 3, 5),
  (4, 4, 2),
  (5, 5, 1),
  (6, 1, 5),
  (7, 2, 6),
  (8, 3, 7),
  (9, 4, 4),
  (10, 5, 3),  -- employee 5 stops at two reviews: 1 -> 3, rising but too short
  (11, 1, 6),
  (12, 2, 8),  -- employee 2 completes 4 -> 6 -> 8: exactly three, the boundary
  (13, 3, 7),  -- employee 3 plateaus 7 -> 7: OUT
  (14, 4, 6),
  (15, 4, 8),
  (16, 1, 9),  -- employee 1 completes 3 -> 5 -> 6 -> 9
  -- employee 4 dips at the END: 2 -> 4 -> 6 -> 8 -> 5, OUT
  (17, 4, 5);`,
      tables: [
        { name: "PerformanceReview", note: "17 reviews over 5 employees — histories of 4, 3, 3, 5 and 2 reviews" },
      ],
    },
    code: `WITH flagged AS (
    SELECT
        employee_id,
        rating,
        CASE
            WHEN LAG(rating) OVER (PARTITION BY employee_id ORDER BY review_id) >= rating
            THEN 1 ELSE 0                    -- NULL predecessor (first review) reads as clean
        END AS bad_step
    FROM PerformanceReview
),
safe AS (
    SELECT
        employee_id,
        rating,
        MAX(bad_step) OVER (PARTITION BY employee_id) AS ever_bad  -- one failure poisons all
    FROM flagged
)
SELECT
    employee_id,
    COUNT(*) AS review_count      -- the full (clean) history length
FROM safe
WHERE ever_bad = 0
GROUP BY employee_id
HAVING COUNT(*) >= 3              -- two rising ratings are not a trend
ORDER BY employee_id;`,
    walkthrough: [
      "LAG paints the steps: employee 1's 3 -> 5 -> 6 -> 9 and employee 2's 4 -> 6 -> 8 carry no bad flags, employee 3's 7 -> 7 step flags one review, employee 4's final 8 -> 5 flags another, and employee 5's 1 -> 3 is clean but short.",
      "MAX(bad_step) OVER the partition spreads each failure across its whole history: WHERE ever_bad = 0 leaves employees 1, 2 and 5 — with history lengths of 4, 3 and 2.",
      "HAVING COUNT(*) >= 3 removes employee 5, and ORDER BY employee_id ships (1, 4), (2, 3) — the plateau, the late dip and the short streak each failed a different test.",
    ],
    time: "O(n log n) — one partitioned ordered pass feeding two window folds, then a grouped pass",
    space: "O(n) — flagged rows held until the filter and the grouping",
    followUps: [
      "Report the employees who ALMOST qualified — exactly one bad step in a history of at least three — and order them by how late their failure came: which window gives the first bad review_id, and does the plateau employee rank above or below the dip?",
      "Generalise strict improvement to 'never worse on average across every window of three reviews': does a 3-row moving frame with AVG still fit the LAG-flag shape, and what does employee 4's 2, 4, 6, 8, 5 read frame by frame?",
    ],
    related: ["customer-order-frequency", "the-number-of-employees-which-report-to-each-employee", "team-scores-in-football-tournament"],
    order: "exact",
    xp: 20,
  },
];
