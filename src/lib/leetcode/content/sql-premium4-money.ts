// Deep-dives — SeeQL premium batch IV, file 2 of 6: money-flavored reads —
// a salary-tier gap, a calendar rolling average, a year anti-join, cities
// above a global mean, students below a subject mean and loan classification
// (6 problems: 3 Easy, 3 Medium). Engine-verified by scripts/tmp-68b2-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM4_MONEY: LcSqlDive[] = [
  {
    slug: "highest-salaries-difference",
    statement:
      "Salary stores payroll entries as one row per (salary_id, employee_id, amount). Report a single column, salary_gap: the highest amount in the table minus the second-highest DISTINCT amount — the largest amount strictly below the top tier. Several employees can share the top amount; they form one tier, and the runner-up is the next tier down, not the next row. If the table holds only ONE distinct amount, salary_gap is NULL.",
    examples: [
      {
        input: "the four entries amount at 95000, 95000, 87000 and 81000 — two employees share the top",
        output: "8000",
        explanation:
          "The top tier is 95000 (two rows, one tier) and the runner-up tier is 87000, so the gap is 95000 - 87000 = 8000 — the duplicate top must not collapse the difference to 0.",
      },
      {
        input: "the duplicate pair itself: salary_id 1 and salary_id 2, both at 95000",
        output: "8000 (the same single result row — a tie at the top produces no 0-gap row)",
        explanation:
          "Both rows occupy rank 1 under a dense ranking; the query measures tier 1 against tier 2 (87000), so the second 95000 row never becomes a second-highest of its own.",
      },
    ],
    constraints: [
      "salary_gap is one row, one column: the largest amount minus the largest amount strictly below that top tier",
      "duplicate amounts form one tier — the runner-up is the second-highest DISTINCT amount, never the second row",
      "if only one distinct amount exists, report NULL — an absent runner-up tier yields NULL, not 0",
    ],
    breakdown: [
      "The request looks like a one-liner and hides a definition: second-highest must mean the second distinct TIER, not the second row. This seed's top is held by two rows (both 95000), so any formulation that takes the next row down — a ROW_NUMBER 2 read, a LIMIT 1 OFFSET 1 over unordered rows — lands on the other 95000 and reports a gap of 0. The runner-up is the largest amount strictly below the maximum, which on this seed is 87000. Getting the definition right is the whole problem; the computation after it is a subtraction.",
      "The tempting shortcut fails for a structural reason. MAX(DISTINCT amount) is a no-op: DISTINCT inside an aggregate that already collapses to one value changes nothing, so MAX(DISTINCT amount) - MAX(amount) prints 0 on any table, duplicates or not. Distinctness has to act BEFORE aggregation — either by ranking rows into dense tiers (DENSE_RANK over amount DESC gives both 95000 rows rank 1 and gives 87000 rank 2) or by restricting the comparison set to amounts strictly below the max. Both shapes convert second-highest-distinct from a phrase into a set operation the engine can execute.",
      "The NULL path is arithmetic, not a special case. If only one distinct amount exists, the runner-up tier is empty: MAX over a set holding no non-NULL values returns NULL, and 60000 - NULL is NULL, so the subtraction itself reports NULL without a CASE. (The same collapse threatens the NOT IN formulation — restricting to amounts NOT IN the top tier — which is safe on this schema only because amount is declared NOT NULL; a single NULL in a compared set makes NOT IN never-true and quietly NULLs the result.) The DENSE_RANK form never touches that minefield, which is why it ships here.",
    ],
    edges: [
      "The duplicate top — salary_id 1 and salary_id 2, both 95000 — punishes MAX(DISTINCT amount) - MAX(amount) (prints 0) and punishes a ROW_NUMBER 2 read (the second 95000 row is rank 2, gap 0 again); distinctness must live before aggregation, in the ranking.",
      "salary_id 4's 81000 punishes MAX(amount) - MIN(amount): 95000 - 81000 = 14000 reports the spread of the table, not the gap to the runner-up tier (87000).",
      "Had the seed held only salary_id 1 and salary_id 2 (both 95000), the runner-up tier would be empty: the rank-2 CASE finds no non-NULL value, MAX returns NULL, and the subtraction ships NULL — the single-distinct contract, delivered by arithmetic instead of a branch.",
      "The NOT IN single-row pitfall stays dormant here because amount is NOT NULL, but a scratch set holding one NULL makes NOT IN never-true and the gap NULL — the DENSE_RANK form has no such trapdoor.",
    ],
    ladder: [
      { title: "Brute force — dedupe in app code", body: "Pull every amount, dedupe with a set, sort descending, subtract the second value from the first, and hand-code the one-distinct guard. Three manual steps the ranking folds into one query." },
      { title: "The pattern — strict-less runner-up", body: "One scalar subquery computes the top; a second computes MAX over amounts strictly below that top; the subtraction is the report. Correct, but it scans the table twice and leans on the NOT NULL column." },
      { title: "The optimal idea — dense tiers in one pass", body: "O(n log n). DENSE_RANK over amount DESC builds the distinct tiers in one sorted pass; MAX(CASE rnk = k) pivots any tier, and an absent tier propagates NULL for free — the definition, the dedup and the NULL path in one shape." },
    ],
    approach: "DENSE_RANK over amount DESC builds distinct tiers; MAX(CASE) pivots tiers 1 and 2; an empty tier 2 makes the subtraction NULL",
    schema: {
      ddl: `CREATE TABLE Salary (
  salary_id   INTEGER PRIMARY KEY,
  employee_id INTEGER NOT NULL,
  amount      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Salary (salary_id, employee_id, amount) VALUES
  (1, 11, 95000),  -- top tier, row one of two
  (2, 12, 95000),  -- top tier again: the duplicate-max trap
  (3, 13, 87000),  -- tier 2: the true runner-up
  -- (4, 14, 81000) is the smallest: it punishes MAX - MIN
  (4, 14, 81000);`,
      tables: [
        { name: "Salary", note: "4 payroll entries over 4 employees — the top amount 95000 is held twice, the runner-up tier is 87000" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        amount,
        DENSE_RANK() OVER (ORDER BY amount DESC) AS rnk  -- one rank per DISTINCT tier
    FROM Salary
)
SELECT
    MAX(CASE WHEN rnk = 1 THEN amount END)   -- 95000 (both top rows feed it)
  - MAX(CASE WHEN rnk = 2 THEN amount END)   -- 87000, or NULL if tier 2 never forms
    AS salary_gap
FROM ranked
ORDER BY salary_gap;  -- one row, ordered to keep the exact contract uniform`,
    walkthrough: [
      "DENSE_RANK folds four rows into three tiers: the 95000 pair shares rank 1, 87000 takes rank 2, 81000 rank 3 — the duplicate top can no longer masquerade as a second place.",
      "The two pivots read 95000 off rank 1 (both top rows feed the MAX) and 87000 off rank 2; rank 3 never enters the report.",
      "One row ships: salary_gap 8000. Had the seed held only the two 95000 rows, the rank-2 CASE would find nothing, MAX would return NULL, and the subtraction would print NULL — the single-distinct contract.",
    ],
    time: "O(n log n) — the window sorts the amounts once; the pivot is a single pass",
    space: "O(n) — one ranked row per salary entry",
    followUps: [
      "Report the gap between every ADJACENT pair of distinct tiers (tier 1 minus tier 2, tier 2 minus tier 3) — how does LAG over the deduplicated ladder reshape the query, and what does the last tier's row show?",
      "List the employee_ids whose amount equals the runner-up tier — does the tier join stay correct when that set is empty, and how does the report say nobody?",
    ],
    related: ["second-highest-salary", "biggest-single-number", "calculate-salaries"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "rolling-average-steps",
    statement:
      "Steps records one row per user per walking day: (user_id, walk_date, steps); walk_date is 'YYYY-MM-DD' text and a day with no row is a genuinely missing day, not a zero-step day. For each row report the two-day rolling average of steps covering that day and the PREVIOUS CALENDAR day — walk_date minus one day. When the previous calendar day has no row, the average covers today alone; it never reaches back to the last available row across the hole. Output columns user_id, walk_date, rolling_avg (the average rounded to 2 decimal places), ordered by user_id, then walk_date.",
    examples: [
      {
        input: "user 201 walks four consecutive days from 2024-06-01: 6000, 7000, 8000, 9000 steps",
        output: "2024-06-01 · 6000 — 2024-06-02 · 6500 — 2024-06-03 · 7500 — 2024-06-04 · 8500",
        explanation:
          "Every day after the first has a calendar predecessor, so each row averages that day with yesterday; the first day's frame degenerates to itself.",
      },
      {
        input: "user 202 logs 4000 on 2024-06-01 and 5000 on 2024-06-02, then nothing on 2024-06-03, then 7000 on 2024-06-04 and 8000 on 2024-06-05",
        output: "2024-06-04 · 7000",
        explanation:
          "06-04's calendar predecessor is missing, so its frame holds today alone — 7000, NOT (5000 + 7000) / 2 = 6000; the 06-02 row is two calendar days back and stays outside.",
      },
    ],
    constraints: [
      "the frame is today plus the previous CALENDAR day; a missing previous day shrinks the frame to today and never stretches it to the last available row",
      "one row per existing (user_id, walk_date); missing days produce no rows and count no steps — they are not zeros",
      "columns user_id, walk_date, rolling_avg = ROUND(average, 2) — ordered by user_id, then walk_date",
    ],
    breakdown: [
      "The report keeps the row grain and attaches an average of the row's neighbourhood, which is window territory: AVG(steps) OVER (PARTITION BY user_id ORDER BY ...) never collapses a user's days into one row. Everything hard about this task lives in the frame — the rule that decides which rows join the current row's average. The stated definition is calendar-shaped: today plus yesterday, where yesterday means the DATE one day before walk_date, not the previous row that happens to exist.",
      "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW implements the WRONG definition here: it counts physical rows, so across the 06-03 hole it reaches two calendar days back and averages user 202's 06-04 with the 06-02 row — 6000 instead of the true 7000. A value-bounded frame (RANGE) fixes exactly this: it admits rows whose ORDER BY value lies between current - 1 and current. But walk_date is TEXT, and the engine has no date arithmetic on a text column — ordering the window by walk_date directly with RANGE 1 PRECEDING silently degrades to current-row-only frames (06-02 would print 7000, not 6500) — so the query first bridges to a numeric day number, CAST(julianday(walk_date) AS INTEGER), which increments by exactly 1 per calendar day, and takes RANGE BETWEEN 1 PRECEDING AND CURRENT ROW on that number. With one row per user per day there are no value peers, so the frame holds at most today and yesterday.",
      "Two more defaults need naming. A window with ORDER BY and NO explicit frame defaults to RANGE UNBOUNDED PRECEDING through CURRENT ROW — the user's entire history, not two days — so the frame must be spelled out even when it is not the headline fix. And ROUND(avg, 2) sits OUTSIDE the window because rounding is not a window function: two-day averages of integers end in .0 or .5 on any seed, so the rounding here is contract insurance that becomes load-bearing the moment a follow-up widens the frame to three days or admits fractional steps.",
    ],
    edges: [
      "The gap day — user 202's 2024-06-04 row — is the whole test: ROWS BETWEEN 1 PRECEDING averages (5000 + 7000) / 2 = 6000.00, the calendar RANGE frame reports 7000.00; this single row separates the two definitions.",
      "The pre-gap row (202's 06-02, steps 5000) prints 4500.00 under BOTH definitions — a wrong solution still gets 7 of 8 rows right, which is exactly why the hole must be planted deliberately rather than discovered in review.",
      "First days have no predecessor at all: user 201's 06-01 and user 202's 06-01 frames degenerate to one row and print 6000.00 and 4000.00 — not NULL, not zero.",
      "The missing 06-03 is not a zero-steps day: reading the hole as 0 steps would average (7000 + 0) / 2 = 3500.00 for 06-04 — a missing row and a stored 0 are different facts.",
    ],
    ladder: [
      { title: "Brute force — look up yesterday", body: "For each row, scan the user's rows for the date one day earlier and average the pair, with an if for the miss. An O(n squared) date lookup the frame expresses in one clause." },
      { title: "The pattern — a frame that counts ROWS", body: "AVG OVER (PARTITION BY user_id ORDER BY walk_date ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) is the intuitive write — and it is wrong across holes, because it counts rows, not days." },
      { title: "The optimal idea — bound by VALUE, on a numeric bridge", body: "O(n log n). Map the text date to an integer day number, then RANGE BETWEEN 1 PRECEDING AND CURRENT ROW: the frame bounds by value, so one calendar day back is exact and holes shrink the frame instead of stretching it." },
    ],
    approach: "AVG OVER (PARTITION BY user_id ORDER BY CAST(julianday(walk_date) AS INTEGER) RANGE 1 PRECEDING..CURRENT ROW), rounded outside",
    schema: {
      ddl: `CREATE TABLE Steps (
  user_id   INTEGER NOT NULL,
  walk_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  steps     INTEGER NOT NULL,
  PRIMARY KEY (user_id, walk_date)
);`,
      seed: `INSERT INTO Steps (user_id, walk_date, steps) VALUES
  (201, '2024-06-01', 6000),  -- frame is today alone
  (201, '2024-06-02', 7000),  -- (6000 + 7000) / 2
  (201, '2024-06-03', 8000),  -- (7000 + 8000) / 2
  (201, '2024-06-04', 9000),  -- (8000 + 9000) / 2
  (202, '2024-06-01', 4000),  -- frame is today alone
  (202, '2024-06-02', 5000),  -- (4000 + 5000) / 2
  (202, '2024-06-04', 7000),  -- the hole: 06-03 missing, frame is today alone
  -- (202, '2024-06-05', 8000) blends with 06-04 for 7500
  (202, '2024-06-05', 8000);`,
      tables: [
        { name: "Steps", note: "8 rows over 2 users — user 201 walks 06-01 through 06-04 consecutively, user 202 skips 06-03 entirely (no row, not a zero)" },
      ],
    },
    code: `SELECT
    user_id,
    walk_date,
    ROUND(
        AVG(steps) OVER (
            PARTITION BY user_id
            ORDER BY CAST(julianday(walk_date) AS INTEGER)  -- numeric day number: +1 per calendar day
            RANGE BETWEEN 1 PRECEDING AND CURRENT ROW       -- value frame = yesterday-or-today only
        ), 2) AS rolling_avg
FROM Steps
ORDER BY user_id, walk_date;`,
    walkthrough: [
      "PARTITION BY user_id splits eight rows into two timelines, and the ORDER BY key is the numeric day number so the frame can step in whole calendar days.",
      "User 201 walks four consecutive days: the first frame holds only itself (6000.00), then each day pairs with yesterday — 6500.00, 7500.00, 8500.00.",
      "User 202's 06-04 frame searches day numbers for 06-03 through 06-04 and finds only today, so it prints 7000.00 (a ROWS frame would have printed 6000.00); 06-05 pairs with 06-04 for 7500.00, and ORDER BY user_id, walk_date ships all eight rows.",
    ],
    time: "O(n log n) — one sort per partition feeding the framed average",
    space: "O(n) — one output row per walk",
    followUps: [
      "Widen the frame to a three-calendar-day average — which RANGE bound changes, and at what point does ROUND(x, 2) start trimming digits a two-day frame of integer steps can never produce?",
      "Flag each row whose calendar predecessor is missing — would you detect the hole with a self-join on the previous date or with LAG over the day number, and what does each show for the first day of a user's history?",
    ],
    related: ["game-play-analysis-iii", "running-total-for-different-genders", "find-total-time-spent-by-each-employee"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "market-analysis-iii",
    statement:
      "OrderItem logs purchased line items: (order_id, item_id, order_date, quantity), with order_date as 'YYYY-MM-DD' text. Report the items bought at least once in 2022 that were NEVER bought in 2021 — a single column, item_id, one row per qualifying item no matter how many 2022 orders it has, ordered by item_id ascending.",
    examples: [
      {
        input: "item 504 sold on 2022-01-05, 2022-06-30 and 2022-12-24, and never in 2021",
        output: "504",
        explanation:
          "Three qualifying orders collapse to one DISTINCT item row — the report is per item, not per order.",
      },
      {
        input: "item 502 sold on 2021-11-02 and again on 2022-05-20",
        output: "(absent — a single 2021 purchase disqualifies the item for good)",
        explanation:
          "Its 2022 order is exactly what a year-blind query would latch onto; the never-in-2021 half of the rule reads the item's WHOLE history.",
      },
    ],
    constraints: [
      "an item qualifies only with at least one order dated in 2022 AND zero orders dated in 2021",
      "one output row per qualifying item (DISTINCT), even when several 2022 orders exist",
      "single column item_id — ordered by item_id ascending",
    ],
    breakdown: [
      "This is an anti-join wearing a date mask. The two halves of the rule live on different row sets of the same table — has-a-2022-row and has-no-2021-row — and the second half is negative existence: no single row can prove it, because it is a property of the item's entire partition. The honest shape builds the 2022 item set and the 2021 item set separately and subtracts, with DISTINCT in both so the subtraction works on membership, not on row counts.",
      "Year extraction has a type trap of its own. strftime('%Y', order_date) returns the year as TEXT — '2022', not 2022 — and SQLite compares across types by type order, where every TEXT value outranks every INTEGER, so strftime('%Y', order_date) = 2022 matches NOTHING and both arms come back empty. CASTing the extraction to INTEGER (or comparing against the text '2022') is load-bearing, not cosmetic. With the years extracted cleanly, the 2022 set holds 501, 502 and 504 and the 2021 set holds 502 and 503.",
      "The subtraction itself comes down to NOT IN versus NOT EXISTS. NOT IN is safe on THIS schema because item_id is declared NOT NULL — but one stray NULL in the compared set would make the predicate never-true and the report would silently print zero rows, which is why NOT EXISTS (correlated on item_id and year) is the NULL-immune spelling of the same logic. The DISTINCT matters on the output side too: item 504 holds three 2022 rows, and a set built without DISTINCT would print it three times. An equivalent one-pass form — GROUP BY item_id with HAVING SUM(year = 2022) > 0 AND SUM(year = 2021) = 0 — dedupes by construction and scales better when the year list grows.",
    ],
    edges: [
      "Item 504's three 2022 rows (orders 5, 6, 7) punish the missing DISTINCT: the output becomes 501, 504, 504, 504 — four rows where two belong.",
      "Item 502's 2021 row (order 2, 2021-11-02) punishes the year-blind query: filtering to 2022 rows and reporting everything found prints 501, 502, 504 — the both-years item leaks in on the strength of its 2022 order.",
      "Item 503 (order 4, 2021-only) never qualifies, and must never surface: a query reporting items absent from 2022 would print it — the POSITIVE 2022 arm has to run first, and 503 fails it.",
      "The type-ordered comparison fails silently: strftime('%Y', order_date) = 2022 returns zero rows on every seed row at once — no error, just an empty report — so the CAST to INTEGER must be checked before anything else.",
    ],
    ladder: [
      { title: "Brute force — two passes and a set difference", body: "Collect the items sold in 2022 into one set, the items sold in 2021 into another, subtract, dedupe. Correct, manual, and blind to the NULL and type traps the SQL form forces you to face." },
      { title: "The pattern — two DISTINCT sets minus an anti-filter", body: "A CTE per year extracts CAST(strftime('%Y', order_date) AS INTEGER) and dedupes item_id; the outer query keeps 2022 items whose id is NOT IN the 2021 set." },
      { title: "The optimal idea — anti-join as a per-item predicate", body: "O(n). The durable rule: never-in-year-Y is a property of the item's whole partition, so it must be evaluated per set or per GROUP — never per row — and NOT EXISTS is the spelling that survives NULLs." },
    ],
    approach: "DISTINCT 2022-item CTE filtered NOT IN the 2021-item CTE (NULL-safe here: item_id is NOT NULL)",
    schema: {
      ddl: `CREATE TABLE OrderItem (
  order_id   INTEGER PRIMARY KEY,
  item_id    INTEGER NOT NULL,
  order_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  quantity   INTEGER NOT NULL
);`,
      seed: `INSERT INTO OrderItem (order_id, item_id, order_date, quantity) VALUES
  (1, 501, '2022-03-15', 2),  -- 2022 only: qualifies
  (2, 502, '2021-11-02', 1),  -- 2021 history: disqualifies item 502
  (3, 502, '2022-05-20', 4),  -- its 2022 row cannot wash the 2021 row out
  (4, 503, '2021-07-08', 3),  -- 2021 only: never qualifies
  (5, 504, '2022-01-05', 1),  -- item 504: three 2022 rows
  (6, 504, '2022-06-30', 2),  -- still one output row
  (7, 504, '2022-12-24', 5);`,
      tables: [
        { name: "OrderItem", note: "7 line items over 4 products — item 504 sold three times in 2022, item 502 sold in both years, item 503 only in 2021" },
      ],
    },
    code: `WITH y2022 AS (
    SELECT DISTINCT item_id
    FROM OrderItem
    WHERE CAST(strftime('%Y', order_date) AS INTEGER) = 2022  -- TEXT year must be CAST
),
y2021 AS (
    SELECT DISTINCT item_id
    FROM OrderItem
    WHERE CAST(strftime('%Y', order_date) AS INTEGER) = 2021
)
SELECT item_id
FROM y2022
WHERE item_id NOT IN (SELECT item_id FROM y2021)  -- safe: item_id is NOT NULL
ORDER BY item_id;`,
    walkthrough: [
      "The 2022 CTE extracts each row's year via the CAST and dedupes item_ids: 501, 502, 504; the 2021 CTE holds 502, 503.",
      "The NOT IN filter drops 502 (it sits in the 2021 set) and keeps 501 and 504 — item 503 never applied because it never entered the 2022 set.",
      "ORDER BY item_id ships (501), (504): item 504's three orders collapsed to one row, and item 502's 2022 order failed to rescue it from its 2021 history.",
    ],
    time: "O(n) — one pass per year set plus a hashed subtraction",
    space: "O(u) — one row per distinct item per year set",
    followUps: [
      "Report the items that sold in BOTH years beside their 2022 order count — how does the anti-join flip into an intersection, and which aggregate counts rows versus distinct orders?",
      "Generalize to any pair of years passed as parameters — what breaks if the years arrive as TEXT literals, and where must the CAST move to keep both arms type-consistent?",
    ],
    related: ["market-analysis-i", "market-analysis-ii", "sales-analysis-iii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-expensive-cities",
    statement:
      "Listing records rental listings: (listing_id, city, price). A city is expensive when its average listing price is STRICTLY greater than the global average price — the mean over every listing row in the table, all cities mixed. Report columns city, city_avg (the city's mean price rounded to 2 decimal places) for every expensive city, ordered by city_avg descending, then city ascending.",
    examples: [
      {
        input: "Alder's two listings price at 240 and 180",
        output: "Alder · 210",
        explanation:
          "The city mean is 210, and the global mean over all ten listings is exactly 150.0 — 210 clears it strictly, so Alder ships.",
      },
      {
        input: "Corton's single listing prices at exactly 150",
        output: "(absent — 150 EQUALS the global average, and the comparison is strict)",
        explanation:
          "Equality fails a strict greater-than; a city sitting exactly on the benchmark is neither above nor below it, so it prints nothing.",
      },
    ],
    constraints: [
      "the benchmark is the average over ALL listing rows — a scalar over the whole table — never the average of the city averages",
      "a city qualifies only when its mean price is STRICTLY above the benchmark; equality excludes",
      "columns city, city_avg = ROUND(avg, 2) — ordered by city_avg descending, then city ascending",
    ],
    breakdown: [
      "Two averages at two grains share one query: a per-city GROUP BY mean, and a whole-table scalar. A WHERE cannot compare against an aggregate at the same query level — the grouped rows do not exist yet where the filter runs — so the global mean is computed as a scalar subquery, (SELECT AVG(price) FROM Listing), which is fully evaluated before the outer filter ever sees it. The city means are computed in a CTE one level up, and the comparison between them becomes a plain predicate on plain columns.",
      "The seed engineers the boundary to be exact. Ten listings total 1500, so the global mean is exactly 150.0; Corton holds a single listing priced exactly 150, so its city mean is exactly 150.00. Strict > therefore excludes Corton, while a >= would ship it beside Alder and the report would grow a phantom row. The comparison runs on RAW means — the CTE keeps AVG(price) unrounded and ROUND is applied only in the final SELECT — because rounding is presentation, and filtering on a rounded value could flip a city that sits within half a cent of the benchmark.",
      "The word global is load-bearing because the cities hold different numbers of listings — 2, 7 and 1. The mean over all ten rows is 150.0, while the mean of the three city means is (210 + 132.86 + 150) / 3 = about 164.29: a different number that misprices the benchmark whenever city sizes differ, because it counts each city once instead of each listing once. The ORDER BY finishes the contract — city_avg DESC, then city ASC as the deterministic tie-break — and stays in the query even when only one row qualifies, because the guarantee and the grading are the same sentence.",
    ],
    edges: [
      "Corton's lone listing (id 910, price 150) punishes >=: two rows ship instead of one, and the phantom row claims the benchmark exactly.",
      "Bexley's skewed ladder (60, 65, 70, 75, 80, 85, then a 495) punishes the row-filter rewrite — WHERE price > (SELECT AVG...) applied before grouping: the filter deletes six of Bexley's seven rows, its mean is rebuilt as 495, and Bexley wrongly ships as expensive (and first); the aggregate must form BEFORE any comparison.",
      "Bexley's true mean is 930 / 7 = 132.85714285714286, so dropping ROUND ships that raw float as city_avg — and the unequal 2 / 7 / 1 listing counts are the same machinery that makes the global mean (150.0) and the mean-of-means (about 164.29) different numbers.",
      "The exactness is designed, not lucky: 420 (Alder) + 930 (Bexley) + 150 (Corton) = 1500 over ten rows makes the global mean exactly 150.0 — which is what lets Corton's boundary test be a clean equality instead of a float hair-splitter.",
    ],
    ladder: [
      { title: "Brute force — eyeball the benchmark", body: "Average every city in app code, average the whole table, compare, sort. The comparison and the sort are the engine's GROUP BY, scalar subquery and ORDER BY." },
      { title: "The pattern — grouped CTE, scalar benchmark", body: "A CTE computes AVG(price) per city at raw precision; the outer WHERE compares it to (SELECT AVG(price) FROM Listing); ROUND and ORDER BY finish the display." },
      { title: "The optimal idea — filter raw, round last", body: "O(n). The durable rules: the global benchmark is a scalar over ALL rows (unequal group sizes make mean-of-means a different number), the comparison is strict and runs at raw precision, and rounding is the last step before display." },
    ],
    approach: "Grouped AVG in a CTE compared (strictly, raw) to a whole-table scalar subquery; ROUND applied only in the outer SELECT",
    schema: {
      ddl: `CREATE TABLE Listing (
  listing_id INTEGER PRIMARY KEY,
  city       TEXT NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Listing (listing_id, city, price) VALUES
  (901, 'Alder', 240),   -- Alder: mean 210
  (902, 'Alder', 180),
  (903, 'Bexley', 60),   -- Bexley: 7 skewed rows, sum 930
  (904, 'Bexley', 65),
  (905, 'Bexley', 70),
  (906, 'Bexley', 75),
  (907, 'Bexley', 80),
  (908, 'Bexley', 85),
  (909, 'Bexley', 495),  -- the one survivor of a price pre-filter
  -- (910, 'Corton', 150) is the boundary: exactly the global mean
  (910, 'Corton', 150);`,
      tables: [
        { name: "Listing", note: "10 listings over 3 cities — Alder holds 2 (mean 210), Bexley 7 skewed rows (mean 132.86 rounded), Corton exactly 1 at 150; the global mean is exactly 150.0" },
      ],
    },
    code: `WITH city_avg AS (
    SELECT
        city,
        AVG(price) AS avg_price          -- RAW mean: the filter compares at full precision
    FROM Listing
    GROUP BY city
)
SELECT
    city,
    ROUND(avg_price, 2) AS city_avg      -- rounding is presentation, applied last
FROM city_avg
WHERE avg_price > (SELECT AVG(price) FROM Listing)  -- global scalar: strict > excludes the 150.00 city
ORDER BY city_avg DESC, city ASC;`,
    walkthrough: [
      "The CTE groups ten listings into three cities: Alder (240 + 180) / 2 = 210, Bexley 930 / 7 = 132.85714285714286, Corton 150 / 1 = 150.",
      "The scalar subquery fixes the benchmark at 1500 / 10 = 150.0 exactly; the strict > keeps Alder (210 is above) and rejects Bexley (132.86 is below) and Corton (150.00 is equal, not above).",
      "One row ships — Alder with city_avg 210 — ordered by city_avg DESC; a >= would have shipped Corton too, and a price-level pre-filter would have shipped Bexley first at a fabricated 495.",
    ],
    time: "O(n) — one grouped pass plus one scalar pass over the table",
    space: "O(c) — one raw mean per city",
    followUps: [
      "Report every city with an above / at / below flag against the global mean — where does the CASE live, and which cities can the at class hold under a raw versus rounded comparison?",
      "Rank cities by their gap above the benchmark — what does the gap expression look like beside the scalar, and does the ordering contract survive ties at the same gap?",
    ],
    related: ["orders-with-maximum-quantity-above-average", "average-salary-of-departments", "the-report"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "class-performance",
    statement:
      "Score holds one row per student per subject: (student_id, name, subject, score). A student needs help in a subject when their score is BELOW that subject's average — the mean over every student who took that subject. Report columns student_id, name, subject, score, subject_avg (the subject mean rounded to 2 decimal places) for every (student, subject) pair that needs help, ordered by student_id, then subject.",
    examples: [
      {
        input: "Anya (41) scored 55 in Algebra and 60 in Biology",
        output: "41 · Anya · Algebra · 55 · 79 — 41 · Anya · Biology · 60 · 76",
        explanation:
          "Algebra's mean is 79.0 and Biology's is 76.0; Anya sits below both, so both rows ship — each carrying its OWN subject's benchmark.",
      },
      {
        input: "Bram (42) scored 90 in Algebra and exactly 76 in Biology",
        output: "(absent — 90 clears Algebra's 79.0, and 76 EQUALS Biology's mean)",
        explanation:
          "The rule is strictly below, so the row that sits exactly on its subject's average is excluded; equality reads as keeping up, not needing help.",
      },
    ],
    constraints: [
      "the benchmark is per subject — the mean over that subject's rows — never the mean over the whole table",
      "a (student, subject) row qualifies only when score is STRICTLY below its subject mean; equality excludes",
      "columns student_id, name, subject, score, subject_avg = ROUND(mean, 2) — ordered by student_id, then subject",
    ],
    breakdown: [
      "The report compares each row to an aggregate of the row's own GROUP while keeping the row — window territory, not GROUP BY territory. AVG(score) OVER (PARTITION BY subject) stamps every row with its subject's mean (79.0 on the four Algebra rows, 76.0 on the four Biology rows), so the row grain survives and the comparison becomes an ordinary predicate. A GROUP BY subject would collapse the table to two rows and the students would vanish along with their names and scores.",
      "Where the filter lives is the whole bug farm. WHERE score < AVG(score) OVER (...) is illegal — window functions execute after WHERE has already chosen rows — and so is WHERE score < subject_avg naming a SELECT alias, because aliases are computed after filtering too. The legal shape is one level up: the window runs in a CTE, tagging every row with its subject's mean, and the outer query filters the tagged rows. SQLite has no QUALIFY clause, so the CTE is not a convenience here — it is the only spelling.",
      "The seed aims two traps at the comparison itself. Bram's Biology 76 equals Biology's mean of 76.0, so a <= brands him as needing help — the equality boundary is exact because the subject totals were engineered to divide cleanly (316 and 304 over four rows each). And the class-wide mean (620 over 8 rows = 77.5) is a different benchmark: a partition-less window stamps 77.5 everywhere and wrongly flags Bram's 76 (at his own subject's mean) and Dov's Biology 77 (above Biology's mean of 76.0) — five rows where three belong. PARTITION BY subject is what keeps each row judged by its own subject.",
    ],
    edges: [
      "Bram's Biology row (42, score 76) punishes <=: the exact-mean row joins the output and the report grows to four rows — the 304-sum seed makes the equality exact.",
      "Dov's Biology row (44, score 77) punishes the partition-less window: 77 is ABOVE Biology's mean (76.0) but BELOW the class-wide 77.5, so dropping PARTITION BY flags it — five rows ship where three belong.",
      "Cleo (43) is above both means (95 Algebra, 91 Biology) and must be absent everywhere; a flipped comparison (score above the mean) would drag her in alongside Bram's Algebra row.",
      "The rounding is display-only: subject_avg prints 79 and 76 exactly here, but the FILTER compares raw means — filtering the rounded value would misclassify rows sitting within a rounding step of the boundary.",
    ],
    ladder: [
      { title: "Brute force — two passes per subject", body: "Compute each subject's mean by hand, then walk every row comparing score to its subject's benchmark. The engine does both passes in one windowed scan." },
      { title: "The pattern — window tag, then filter outside", body: "AVG(score) OVER (PARTITION BY subject) in a CTE paints each row with its subject's mean; the outer WHERE keeps strictly-below rows and the display rounds." },
      { title: "The optimal idea — the benchmark rides the row", body: "O(n log n). The durable rules: a per-group aggregate that must sit BESIDE each row is a window with PARTITION BY, and any filter over that aggregate lives one query level up — WHERE can see neither windows nor SELECT aliases." },
    ],
    approach: "AVG OVER (PARTITION BY subject) in a CTE tags each row with its subject mean; outer WHERE score < mean, strict",
    schema: {
      ddl: `CREATE TABLE Score (
  student_id INTEGER NOT NULL,
  name       TEXT NOT NULL,
  subject    TEXT NOT NULL,
  score      INTEGER NOT NULL,
  PRIMARY KEY (student_id, subject)
);`,
      seed: `INSERT INTO Score (student_id, name, subject, score) VALUES
  (41, 'Anya', 'Algebra', 55),  -- below Algebra's 79
  (41, 'Anya', 'Biology', 60),  -- below Biology's 76
  (42, 'Bram', 'Algebra', 90),  -- above
  (42, 'Bram', 'Biology', 76),  -- EXACTLY the Biology mean: excluded
  (43, 'Cleo', 'Algebra', 95),  -- above
  (43, 'Cleo', 'Biology', 91),  -- above
  (44, 'Dov', 'Algebra', 76),   -- below Algebra's 79 only
  -- (44, 'Dov', 'Biology', 77) is above Biology's 76: the partition trap
  (44, 'Dov', 'Biology', 77);`,
      tables: [
        { name: "Score", note: "8 rows — 4 students x 2 subjects; Algebra averages 79.0 (sum 316), Biology averages 76.0 (sum 304), and the class-wide mean of 77.5 matches neither" },
      ],
    },
    code: `WITH tagged AS (
    SELECT
        student_id,
        name,
        subject,
        score,
        AVG(score) OVER (PARTITION BY subject) AS subject_avg  -- the subject's mean on every row
    FROM Score
)
SELECT
    student_id,
    name,
    subject,
    score,
    ROUND(subject_avg, 2) AS subject_avg  -- round for display only
FROM tagged
WHERE score < subject_avg               -- strict: AT the mean is not BELOW it
ORDER BY student_id, subject;`,
    walkthrough: [
      "The window stamps each row with its subject's mean: Algebra rows carry 79.0 (55 + 90 + 95 + 76 = 316 over four), Biology rows carry 76.0 (60 + 76 + 91 + 77 = 304 over four).",
      "The outer filter keeps strictly-below rows: Anya's 55 and 60, Dov's 76 — Bram's Biology 76 sits exactly on 76.0 and is excluded, and Cleo never dips below either mean.",
      "Three rows ship ordered by student then subject — (41, Anya, Algebra, 55, 79), (41, Anya, Biology, 60, 76), (44, Dov, Algebra, 76, 79); Dov's Biology 77 stayed out even though it is below the class-wide 77.5.",
    ],
    time: "O(n log n) — one partitioned sort feeding the window, then one filtered pass",
    space: "O(n) — the tagged rows held until the filter",
    followUps: [
      "Flag each student's WEAKEST subject (the one holding their minimum score) — how does a second window (ROW_NUMBER per student) layer on top of this one, and what breaks on a tie?",
      "Report each subject's mean beside the COUNT of students below it — does the counting query reuse the same tagged CTE, and why can the count not be a HAVING over the raw mean?",
    ],
    related: ["find-the-quiet-students-in-all-exams", "the-report", "average-selling-price"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "loan-types",
    statement:
      "Two tables hold a lender's book. User lists customers: (user_id, name). Loan lists disbursed loans: (loan_id, user_id, loan_type), where loan_type is 'personal' or 'business'. Classify every user as 'both' when they hold at least one loan of EACH type, 'personal' or 'business' when every loan they hold is of that one type, and 'none' when they hold no loans at all. Output columns user_id, name, loan_type — one row per user, ordered by user_id ascending.",
    examples: [
      {
        input: "Ana, user 601, holds loan 1 (personal) and loan 2 (business)",
        output: "601 · Ana · both",
        explanation:
          "One loan of each type is the definition of 'both' — coverage decides, not counts.",
      },
      {
        input: "Bram, user 602, holds two loans — 3 and 4 — both 'personal'",
        output: "602 · Bram · personal",
        explanation:
          "Two loans of the same type never upgrade to 'both'; the classifier reads the number of DISTINCT types, not the number of loans.",
      },
    ],
    constraints: [
      "every user in User appears exactly once — including users with no loans, reported as 'none'",
      "'both' requires at least one loan of each type; same-type multiples never upgrade a single-type user",
      "columns user_id, name, loan_type — ordered by user_id ascending",
    ],
    breakdown: [
      "The first decision is join direction, and the output contract makes it: EVERY user appears, so the report drives FROM User LEFT JOIN Loan. An INNER join through Loan erases user 604 outright — the none class vanishes without an error, which is the worst kind of bug. The LEFT JOIN hands every user a row and fills the loan side with NULLs for the empty user; the classifier then has to read those NULLs as none rather than as data.",
      "The classifier is COUNT(DISTINCT l.loan_type) per user: 2 distinct types means both, 1 means the type itself (MAX(l.loan_type) reads it, legal beside the grouped COUNT), and 0 — all-NULL, the unmatched user — means none. The DISTINCT is load-bearing twice. Bram's two personal loans must count as ONE type, which a plain COUNT(l.loan_type) (= 2) or a row-existence test cannot distinguish from one-of-each; and COUNT over a column ignores the NULL row entirely, so user 604 totals 0 where COUNT(*) would count the left-joined NULL row itself and report 1.",
      "The CASE branches test 2, then 1, then fall through to the manufactured none — mutually exclusive, but written headline-first so the report's hardest class reads first. Taking a bare l.loan_type in the single-type branch would be illegal beside the grouped aggregate; MAX is the honest reader because the count test has already proven only one distinct value exists, so MIN would do equally well. Grouping is by (user_id, name): the seed's two users named Ana share nothing but a name, and grouping by name alone would fuse 601's both with 605's personal into one mislabeled row.",
    ],
    edges: [
      "User 604 (Dov) punishes both classic bugs at once: an INNER join deletes his row (four rows where five belong), and COUNT(*) over the LEFT JOIN counts his NULL row as 1 — the classifier would then take the = 1 branch and read MAX over all-NULLs, printing a NULL label instead of none.",
      "Bram's pair (loans 3 and 4, both personal) punishes the plain COUNT: COUNT(l.loan_type) = 2 takes the both branch — same-type multiples must collapse to one DISTINCT type.",
      "User 605 (Ana, one personal loan) is where the label comes from the data — MAX(loan_type) reads personal; a hardcoded fallback or a case-flipped 'Personal' comparison would print wrong, since loan_type stores exact lowercase literals (the CHECK constraint keeps the seed honest).",
      "The second Ana (605) shares her name with 601 but nothing else: a GROUP BY name merges them into one row labelled both (their loans union to personal + business) — identity lives in user_id, so the grouping must carry it.",
    ],
    ladder: [
      { title: "Brute force — sweep per user", body: "Walk every user, collect their loans into a set, check its size and contents, print none for the empty one. A loop-shaped GROUP BY with the empty case handled by hand." },
      { title: "The pattern — LEFT JOIN spine, counted types", body: "LEFT JOIN Loan onto User, GROUP BY the user's identity, count DISTINCT loan types, and let the CASE translate 2 / 1 / 0 into both / that type / none." },
      { title: "The optimal idea — join direction and aggregate choice ARE the contract", body: "O(u + l). The durable rules: who must appear decides the join direction (LEFT keeps the empty side), what counts decides the aggregate (COUNT(DISTINCT) collapses same-type stacks and ignores join-NULLs), and manufactured classes like none come from ELSE, not from data." },
    ],
    approach: "LEFT JOIN Loan onto User, GROUP BY (user_id, name), CASE on COUNT(DISTINCT loan_type) over 2 / 1 / 0",
    schema: {
      ddl: `CREATE TABLE User (
  user_id INTEGER PRIMARY KEY,
  name    TEXT NOT NULL
);
CREATE TABLE Loan (
  loan_id   INTEGER PRIMARY KEY,
  user_id   INTEGER NOT NULL REFERENCES User(user_id),
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'business'))
);`,
      seed: `INSERT INTO User (user_id, name) VALUES
  (601, 'Ana'),
  (602, 'Bram'),
  (603, 'Cleo'),
  (604, 'Dov'),   -- no loans at all
  -- (605, 'Ana') is a second Ana: the name-only grouping trap
  (605, 'Ana');
INSERT INTO Loan (loan_id, user_id, loan_type) VALUES
  (1, 601, 'personal'),  -- Ana 601: one of each type
  (2, 601, 'business'),
  (3, 602, 'personal'),  -- Bram: TWO same-type loans
  (4, 602, 'personal'),  -- still personal, never both
  (5, 603, 'business'),  -- Cleo: business only
  (6, 605, 'personal');`,
      tables: [
        { name: "User", note: "5 customers — Dov (604) holds no loans, and 605 shares Ana's name with 601" },
        { name: "Loan", note: "6 loans — Ana 601 one of each type, Bram 602 two personal loans, Cleo 603 business, Ana 605 personal" },
      ],
    },
    code: `SELECT
    u.user_id,
    u.name,
    CASE
        WHEN COUNT(DISTINCT l.loan_type) = 2 THEN 'both'            -- at least one of each
        WHEN COUNT(DISTINCT l.loan_type) = 1 THEN MAX(l.loan_type)  -- the single type present
        ELSE 'none'                                                 -- all-NULL: no loans at all
    END AS loan_type
FROM User u
LEFT JOIN Loan l ON l.user_id = u.user_id
GROUP BY u.user_id, u.name          -- identity: the two Anas stay separate
ORDER BY u.user_id;`,
    walkthrough: [
      "The LEFT JOIN threads all five users through: Dov keeps his row with NULLs on the loan side, while Ana 601 collects two loans, Bram two, Cleo one, Ana 605 one.",
      "Per user the distinct-type count reads: 601 two types to both, 602 one (two personal rows collapse) to MAX = personal, 603 one to business, 604 zero (COUNT over the NULL side) to none, 605 one to personal.",
      "ORDER BY user_id ships five rows — (601, Ana, both), (602, Bram, personal), (603, Cleo, business), (604, Dov, none), (605, Ana, personal) — the two Anas separate because grouping carried user_id.",
    ],
    time: "O(u + l) — one scan of each table, hashed on user_id",
    space: "O(u) — one group per user",
    followUps: [
      "Report the loan COUNT beside the class — where do both-with-2-loans and both-with-many diverge, and does COUNT(*) versus COUNT(l.loan_type) now bite inside the counted class?",
      "Add a secured flag to Loan and classify on the (type, secured) pair — how does the CASE scale to four distinct value combinations, and does COUNT(DISTINCT) over an expression still suffice?",
    ],
    related: ["user-purchase-platform", "count-salary-categories", "the-category-of-each-member-in-the-store"],
    order: "exact",
    xp: 10,
  },
];
