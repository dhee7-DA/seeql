// Deep-dives — LeetCode Premium batch II: users, sessions & teams (6 problems, 3 Easy / 2 Medium / 1 Hard). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own names,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM2_USERS: LcSqlDive[] = [
  {
    slug: "ad-free-sessions",
    statement:
      "Playback logs every streaming session as (session_id, customer_id, customer_type, session_start, session_end) and Ads logs every served ad as (ad_id, customer_id, timestamp). An ad counts as shown during a session when its timestamp falls strictly between that session's start and end — and the session must belong to the same customer as the ad. Report customer_id for every customer, prime or free, none of whose ads ever landed inside any of their sessions. One column, customer_id, one row per qualifying customer, ordered ascending.",
    examples: [
      {
        input: "customer 2 streamed 10:15-10:45 and 16:00-17:00 · their only ad fired at 10:50",
        output: "2",
        explanation:
          "The 10:50 ad misses both windows: the first session closed at 10:45 and the second opens at 16:00. No ad inside any session — customer 2 stays.",
      },
      {
        input: "customer 3 streamed 09:00-09:30 and 12:00-13:00 · their only ad fired at 12:30",
        output: "(no row)",
        explanation:
          "12:30 sits strictly inside 12:00-13:00 — an ad during one of their own sessions disqualifies the whole customer.",
      },
    ],
    constraints: [
      "an ad is 'during' a session only when session_start < ad.timestamp AND ad.timestamp < session_end for some session of the SAME customer — touching the exact start or end does not count",
      "both customer_type values ('prime', 'free') are eligible — the type plays no role in the test",
      "one column customer_id, one row per qualifying customer, ordered ascending by customer_id",
    ],
    breakdown: [
      "The exclusion is a compound predicate, and naming it precisely is most of the work. An ad and a session interact only when they share a customer AND the ad's timestamp sits strictly inside the session's window — a join between Ads and Playback on customer_id carrying a non-equi condition, session_start < timestamp AND timestamp < session_end. Running that join yields every (customer, ad, session) hit; the customers we want are exactly the Playback customers that never appear in the hit set. That is the anti-join shape: keep the left side minus whatever the probe finds.",
      "The probe should be written with NOT EXISTS. A correlated EXISTS stops at the first hit it finds, never materializes the full hit list, and — unlike NOT IN — cannot be poisoned by a NULL: one NULL in a NOT IN list turns every comparison UNKNOWN and silently empties the whole result. In this schema both probe columns are NOT NULL, so a NOT IN against the overlap join happens to be safe; the point is that NOT EXISTS is safe by construction, and it reads like the specification sentence — 'there is no ad of theirs inside any of their sessions'.",
      "The answer's grain is the customer, not the session. Customer 2 owns two sessions and qualifies only if both are clean, so the Playback rows must collapse to customers with DISTINCT before the final ORDER BY. Notice also what the query does NOT use: customer_type is carried in the schema and mentioned in the report, but the eligibility test never reads it — a column that exists to be ignored is itself a small trap for join-happy solutions.",
    ],
    edges: [
      "Customer 2's ad at 10:50 lands after their 10:45 session end and before the 16:00 one: outside both windows — between-sessions is not during-a-session, so they qualify.",
      "Boundary strictness: customer 4's ad lands exactly at their session_end (15:00:00) — 15:00:00 < 15:00:00 is false, the ad is outside, customer 4 qualifies. A <= reading of the right edge would throw them out.",
      "NOT IN vs NOT EXISTS: safe here because customer_id is NOT NULL on both sides, but a single NULL in a NOT IN list makes the entire test UNKNOWN and the result empty — NOT EXISTS has no such failure mode, which is why it is the default habit for anti-joins.",
      "An ad whose owner has no sessions at all matches nothing — there is no window to fall inside — and such a customer would qualify trivially; the overlap join simply finds no partner.",
    ],
    ladder: [
      { title: "Brute force — one timeline per customer", body: "Plot each customer's sessions and ads on a line and eyeball every ad against every window. Correct for six rows, hopeless for six million, and it re-runs from scratch every day." },
      { title: "The pattern — anti-join over the overlap predicate", body: "For each customer, probe whether any same-customer ad falls strictly inside any of their session windows; keep the customers for whom the probe finds nothing." },
      { title: "The optimal idea — negated existence, not negated membership", body: "O(S x A) worst case — each ad checked against each same-customer window (a hash on customer_id first makes it near-linear). The durable rule: 'none' questions are NOT EXISTS questions — short-circuiting, NULL-proof, and readable." },
    ],
    approach: "NOT EXISTS anti-join over the same-customer ad-inside-session overlap",
    schema: {
      ddl: `CREATE TABLE Playback (
  session_id    INTEGER PRIMARY KEY,
  customer_id   INTEGER NOT NULL,
  customer_type TEXT NOT NULL,  -- 'prime' or 'free'
  session_start TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  session_end   TEXT NOT NULL
);
CREATE TABLE Ads (
  ad_id       INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  timestamp   TEXT NOT NULL
);`,
      seed: `INSERT INTO Playback (session_id, customer_id, customer_type, session_start, session_end) VALUES
  (101, 1, 'prime', '2024-06-01 10:00:00', '2024-06-01 11:00:00'),
  (102, 2, 'prime', '2024-06-01 10:15:00', '2024-06-01 10:45:00'),
  (103, 3, 'free',  '2024-06-01 09:00:00', '2024-06-01 09:30:00'),
  (104, 3, 'free',  '2024-06-01 12:00:00', '2024-06-01 13:00:00'),
  (105, 4, 'free',  '2024-06-01 14:00:00', '2024-06-01 15:00:00'),
  (106, 2, 'prime', '2024-06-01 16:00:00', '2024-06-01 17:00:00');
INSERT INTO Ads (ad_id, customer_id, timestamp) VALUES
  (901, 1, '2024-06-01 10:30:00'),  -- inside customer 1's 10:00-11:00 session: disqualified
  (902, 2, '2024-06-01 10:50:00'),  -- between customer 2's two sessions: outside both windows
  (903, 3, '2024-06-01 12:30:00'),  -- inside customer 3's 12:00-13:00 session: disqualified
  -- 904 fires exactly at customer 4's session_end: strict < keeps it outside
  (904, 4, '2024-06-01 15:00:00');`,
      tables: [
        { name: "Playback", note: "6 sessions for 4 customers — customer 2 and customer 3 each own two sessions" },
        { name: "Ads", note: "4 ads — 901 and 903 land inside their owner's sessions, 902 between their owner's sessions, 904 exactly at the session end" },
      ],
    },
    code: `SELECT DISTINCT p.customer_id
FROM Playback p
WHERE NOT EXISTS (
    SELECT 1
    FROM Ads a
    JOIN Playback q
      ON q.customer_id = a.customer_id  -- the ad's OWN sessions only
     AND q.session_start < a.timestamp  -- strictly after the open
     AND a.timestamp < q.session_end    -- strictly before the close
    WHERE a.customer_id = p.customer_id -- does THIS customer have any hit?
)
ORDER BY p.customer_id;`,
    walkthrough: [
      "The subquery asks, for each Playback row's customer, whether any of their ads falls inside any of their sessions. Customer 1: ad 901 at 10:30 is inside 10:00-11:00 — EXISTS fires and the NOT removes them. Customer 3: ad 903 at 12:30 is inside 12:00-13:00 — removed the same way.",
      "Customer 2's only ad (902, 10:50) is checked against both their sessions: 10:15-10:45 closed before the ad fired, 16:00-17:00 had not opened yet. No probe row exists, so they survive. Customer 4's ad 904 sits exactly at session_end 15:00:00 — 15:00:00 < 15:00:00 is false — no hit, so they survive too.",
      "Playback holds six sessions for four customers; DISTINCT folds customer 2's two rows into one. The output is customer_id 2 then 4, ascending.",
    ],
    time: "O(S x A) worst case — every ad probed against every same-customer session window",
    space: "O(S + A) — the probe holds one ad/session pair at a time",
    followUps: [
      "Count each qualifying customer's near-miss ads — serves that fell between their sessions — without breaking the anti-join: where does the COUNT go, and what does it return for customer 4?",
      "Flip the ask: list every ad that WAS served inside some session of its owner — does a plain inner join on the same overlap predicate answer it, and can one ad appear twice?",
      "Make the boundary inclusive (an ad at the exact session_end counts) — which seeded customer flips sides, and which single comparison changes?",
    ],
    related: ["customer-who-visited-but-did-not-transact", "customers-who-never-order", "unpopular-books"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-customers-with-positive-revenue-this-year",
    statement:
      "Customers holds one row per customer per earning year (customer_id, year, revenue); revenue can be negative when refunds outpace sales, or zero. A customer's 2021 result is the SUM of that customer's year-2021 rows. Report customer_id for every customer whose 2021 total is strictly greater than zero. One column, customer_id, one row per qualifying customer, ordered ascending.",
    examples: [
      {
        input: "customer 11 logged +500 and -300 in 2021, plus a +250 row for 2020",
        output: "11",
        explanation:
          "The 2021 rows sum to 200 — positive on balance. The 2020 row is out of scope; the verdict is per year.",
      },
      {
        input: "customer 14 logged +600 and -600 in 2021",
        output: "(no row)",
        explanation:
          "The rows cancel to exactly 0 and the test is strictly greater than zero — a wash is not a profit.",
      },
    ],
    constraints: [
      "the sign test applies to the 2021 TOTAL per customer — never to an individual row's revenue",
      "years other than 2021 are ignored; a customer with no 2021 rows has no total and cannot qualify",
      "one column customer_id, one row per qualifying customer, ordered ascending by customer_id",
    ],
    breakdown: [
      "The predicate lives at the customer-within-2021 grain, so the query must slice the year, then bucket by customer, then judge each bucket's SUM. That is the canonical WHERE, GROUP BY, HAVING pipeline: WHERE drops non-2021 rows one by one before any grouping happens, GROUP BY builds one bucket per customer from the survivors, and HAVING judges an aggregate of each bucket. Pushing the year filter into WHERE rather than HAVING is not just style — it shrinks the buckets to the exact population the sum should see.",
      "The planted trap is judging rows instead of sums. A WHERE revenue > 0 answers 'had at least one profitable 2021 row', which is a different question: customer 14 logged +600 and -600, so a row-level filter keeps the +600 row and re-admits a customer whose year nets to zero. Likewise MAX(revenue) > 0 inspects only the best row and repeats the mistake. The unit of judgment is the SUM — customer 11's +500 and -300 net to 200 and stay; customer 14's +600 and -600 net to 0 and go. Aggregate first, sign-test second.",
      "Two quiet edges finish the picture. Strictness: 0 > 0 is false, so a perfectly balanced year is not a profit — that is precisely why customer 14 drops. Absence: customer 15 only ever earned in 2020, and since groups are built from rows that survived WHERE, they form no 2021 bucket at all — a customer missing from the year is silently missing from the answer. No LEFT JOIN, no zero-fill, no row: the grouped pipeline simply has nothing to report about them.",
    ],
    edges: [
      "Mixed signs sum before the sign test: customer 11's 500 - 300 = 200 qualifies even though one 2021 row is negative.",
      "All-negative sums fail: customer 12's -500 - 300 = -800 is out — but so is any row-level test (WHERE revenue > 0 or MAX(revenue) > 0), which would wrongly re-admit customer 14 on its +600 row despite a net of 0.",
      "Zero is not positive: customer 14's 600 - 600 = 0 fails the strict > — the balanced customer exists to catch a >= reading.",
      "Customer 15 earned only in 2020: no 2021 rows, no 2021 group, no output row — absence is silent, not zero.",
    ],
    ladder: [
      { title: "Brute force — subtotal in a spreadsheet", body: "Filter to 2021 by eye, subtotal per customer, and read off the positives. Works once; every refresh repeats the labor and the strict-zero boundary is easy to fumble." },
      { title: "The pattern — filter, bucket, judge the bucket", body: "WHERE year = 2021, then GROUP BY customer_id, then HAVING SUM(revenue) > 0 — three phases, each doing one job." },
      { title: "The optimal idea — aggregate before you compare", body: "O(n) — one filtered scan, hash-grouped per customer. The durable rule: when a condition is stated about a total, the aggregation must happen BEFORE the comparison — HAVING judges groups, WHERE judges rows." },
    ],
    approach: "WHERE the year, GROUP BY customer, HAVING SUM(revenue) > 0 with a strict comparison",
    schema: {
      ddl: `CREATE TABLE Customers (
  customer_id INTEGER NOT NULL,  -- no PK: one customer may hold several rows per year
  year        INTEGER NOT NULL,
  revenue     INTEGER NOT NULL   -- negative = refunds outpaced sales that year
);`,
      seed: `INSERT INTO Customers (customer_id, year, revenue) VALUES
  (11, 2021, 500),
  (11, 2021, -300),  -- mixed 2021 rows: net 200, stays
  (11, 2020, 250),
  (12, 2021, -500),
  (12, 2021, -300),  -- all-negative 2021: net -800, out
  (13, 2020, 0),
  (13, 2021, 400),
  (13, 2022, -100),
  (14, 2021, 600),
  (14, 2021, -600),  -- cancels to exactly 0: strict > fails
  -- 15 earned only in 2020: no 2021 group at all
  (15, 2020, 900);`,
      tables: [
        { name: "Customers", note: "11 rows over 5 customers and 3 years — mixed-sign, all-negative, zero-net and no-2021 shapes all planted" },
      ],
    },
    code: `SELECT customer_id
FROM Customers
WHERE year = 2021        -- slice the year BEFORE grouping
GROUP BY customer_id
HAVING SUM(revenue) > 0  -- judge the total, not the rows
ORDER BY customer_id;`,
    walkthrough: [
      "WHERE year = 2021 keeps 8 of the 11 rows: customer 11's 500 and -300, customer 12's -500 and -300, customer 13's 400, customer 14's 600 and -600. The 2020 rows of customers 11, 13 and 15 and customer 13's 2022 row are gone before any bucket exists.",
      "GROUP BY builds four buckets: 11 holds {500, -300}, 12 holds {-500, -300}, 13 holds {400}, 14 holds {600, -600}. HAVING sums each — 200, -800, 400, 0 — and keeps strictly positive totals: 200 and 400 pass, -800 fails, and 0 fails because zero is not strictly positive.",
      "The output is customer_id 11 then 13, ascending. Customer 15 never formed a bucket, so no row about them can exist.",
    ],
    time: "O(n) — one filtered scan with per-customer grouping",
    space: "O(c) — one bucket per customer present in 2021",
    followUps: [
      "Return every year's verdict at once — customer_id, year, and whether that year was profitable — so customer 15 shows a 2020 row: what moves from WHERE into the grouping, and does the strict boundary survive?",
      "Report the 2021 total beside each qualifying customer — which aggregate joins the SELECT list, and should customers 12 and 14 appear with their negative and zero totals or stay hidden?",
    ],
    related: ["bank-account-summary", "monthly-transactions-i", "queries-quality-and-percentage"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "convert-date-format",
    statement:
      "Dates holds (id, day) with day stored as TEXT in 'YYYY-MM-DD' form. Reformat every row as 'DDth of Month, YYYY': DD is the day number without padding, the suffix follows English ordinals (1st, 2nd, 3rd, 21st, 22nd, 23rd, 31st — every other day takes th, including 11th, 12th and 13th), and Month is the full English month name. Output one column, day, one row per Dates row, ordered by id.",
    examples: [
      {
        input: "id 2, day '2024-03-11'",
        output: "11th of March, 2024",
        explanation:
          "11 ends in 1 but sits in the teens — the exception branch fires first and pins th where the last digit alone would suggest st.",
      },
      {
        input: "id 4, day '2024-04-21'",
        output: "21st of April, 2024",
        explanation:
          "21 is past the teens: last digit 1 means st again, exactly like the 1st but unlike the 11th.",
      },
    ],
    constraints: [
      "suffix: st for days ending in 1 (except 11), nd for 2 (except 12), rd for 3 (except 13), th for everything else",
      "month is the full English name, 'January' through 'December', matched on the month part of day",
      "one column day, one row per Dates row, ordered by id; DD carries no leading zero ('1st', not '01st')",
    ],
    breakdown: [
      "SQLite formats dates by part extraction, not by named patterns: strftime('%d', day), strftime('%m', day) and strftime('%Y', day) hand you zero-padded pieces, and assembling them is your job with the || operator. There is no ORDINAL() function and no specifier that renders '21st of April' in one call — the ordinal suffix and the month name are both things this query must construct: the suffix from arithmetic, the month from a lookup. A formatting task in SQLite is really a small string-factory task.",
      "The suffix rule is arithmetic with one famous pothole. Strip the last digit with % 10: 1 means st, 2 means nd, 3 means rd, everything else th — except 11, 12 and 13, which take th despite their last digits. In a CASE expression the exception must be tested FIRST: WHEN d IN (11, 12, 13) THEN 'th' has to precede the % 10 branches, because CASE stops at the first true branch. Order the branches the other way and the 11th renders as '11st' — a bug that survives every casual test against the 1st and the 21st.",
      "Month names have no arithmetic structure — twelve arbitrary strings — so a twelve-branch CASE inside the projection reads terribly and hides the intent. A lookup CTE of month-code to name, joined on strftime('%m'), keeps the projection down to one join and one concatenation chain, and the zero-padded codes make the join exact ('1' would never equal '01'). Casting strftime('%d') to INTEGER strips the day's leading zero at the same time, so '2024-03-01' renders as 1st of March, 2024 rather than 01st.",
    ],
    edges: [
      "Teens are the trap: 11, 12 and 13 take th even though they end in 1, 2 and 3 — seeded with the 11th (id 2) and the 13th (id 5).",
      "The st/nd/rd rule resumes after the teens: 21st, 22nd, 23rd and 31st — seeded with the 21st (id 4) and the 23rd (id 6).",
      "CASE branch order is load-bearing: putting the % 10 tests before the IN (11, 12, 13) test renders the 11th as '11st'.",
      "strftime('%d') is zero-padded ('01') — CAST to INTEGER strips the padding, which the contract requires ('1st of March, 2024', not '01st').",
    ],
    ladder: [
      { title: "Brute force — type each formatted date", body: "Read each row and hand-write '21st of April, 2024' into the report. Six rows are survivable, six million are not, and every new row repeats the work." },
      { title: "The pattern — extract, decide, look up, assemble", body: "strftime pulls day, month and year parts; a CASE computes the ordinal suffix; a lookup table names the month; || concatenates the pieces." },
      { title: "The optimal idea — formatting is part-extraction plus assembly", body: "O(n) — constant work per row over a 12-row lookup. The durable rule: build the pieces the engine cannot name for you, and keep exception branches ahead of general ones in any CASE chain." },
    ],
    approach: "strftime parts + exception-first ordinal CASE + month lookup CTE, assembled with ||",
    schema: {
      ddl: `CREATE TABLE Dates (
  id  INTEGER PRIMARY KEY,
  day TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Dates (id, day) VALUES
  (1, '2024-03-01'),  -- 1st: the base st
  (2, '2024-03-11'),  -- 11th: teen exception, th
  (3, '2024-04-02'),  -- 2nd: the base nd
  (4, '2024-04-21'),  -- 21st: st returns after the teens
  (5, '2024-05-13'),  -- 13th: teen exception, th
  -- 23rd: the rd case
  (6, '2024-05-23');`,
      tables: [
        { name: "Dates", note: "6 rows across March, April and May — the 11th and 13th carry the teen exception, the 21st and 23rd carry the post-teen st/rd" },
      ],
    },
    code: `WITH months AS (
    SELECT '01' AS mm, 'January' AS mn
    UNION ALL SELECT '02', 'February'
    UNION ALL SELECT '03', 'March'
    UNION ALL SELECT '04', 'April'
    UNION ALL SELECT '05', 'May'
    UNION ALL SELECT '06', 'June'
    UNION ALL SELECT '07', 'July'
    UNION ALL SELECT '08', 'August'
    UNION ALL SELECT '09', 'September'
    UNION ALL SELECT '10', 'October'
    UNION ALL SELECT '11', 'November'
    UNION ALL SELECT '12', 'December'
),
parts AS (
    SELECT id,
           CAST(strftime('%d', day) AS INTEGER) AS d,  -- strips the leading zero
           strftime('%m', day) AS mm,
           strftime('%Y', day) AS yyyy
    FROM Dates
)
SELECT p.d
       || CASE
              WHEN p.d IN (11, 12, 13) THEN 'th'  -- teens first: 11th, 12th, 13th
              WHEN p.d % 10 = 1 THEN 'st'
              WHEN p.d % 10 = 2 THEN 'nd'
              WHEN p.d % 10 = 3 THEN 'rd'
              ELSE 'th'
          END
       || ' of ' || m.mn || ', ' || p.yyyy AS day
FROM parts p
JOIN months m ON m.mm = p.mm
ORDER BY p.id;`,
    walkthrough: [
      "parts turns each date into a number and two codes: id 2 becomes d 11, mm '03', yyyy '2024'; id 4 becomes d 21, mm '04', yyyy '2024'. CAST strips strftime's zero padding, so id 1 carries d 1 rather than 01.",
      "The suffix CASE tests the teens first: id 2's 11 is in (11, 12, 13) so it takes th, and id 5's 13 does too. The others fall through the last digit: id 1's 1 gives st, id 3's 2 gives nd, id 4's 21 gives st again, id 6's 23 gives rd.",
      "The month join maps '03' to March, '04' to April and '05' to May. Concatenation assembles each row in id order: '1st of March, 2024', '11th of March, 2024', '2nd of April, 2024', '21st of April, 2024', '13th of May, 2024', '23rd of May, 2024'.",
    ],
    time: "O(n) — constant work per row over a fixed 12-row lookup",
    space: "O(1) beyond the output — the month table is 12 rows",
    followUps: [
      "Add a compact variant ('Mar 11th, 2024') beside the long one — which lookup column changes, and does the suffix CASE survive untouched?",
      "Order the output chronologically by the raw date instead of by id — is the original day column still usable for ORDER BY after the projection, and what would sorting the formatted text do instead?",
    ],
    related: ["the-latest-login-in-2020", "user-activity-for-the-past-30-days-i", "product-price-at-a-given-date"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "orders-with-maximum-quantity-above-average",
    statement:
      "OrdersDetails holds one row per product line (order_number, product_number, quantity). The bar is the average quantity over EVERY row of the table — all orders pooled together, not any single order's lines. An order is oversized when the largest quantity it contains is strictly greater than that global average. Report order_number for every oversized order, one row per order, ordered ascending.",
    examples: [
      {
        input: "10 line rows across 3 orders totaling 110 units, so the global average is 11.0 · order 9's largest line is 20",
        output: "9",
        explanation:
          "20 > 11.0 clears the whole-table bar. Order 9's own average (12.5) is irrelevant — the bar never shrinks to the order.",
      },
      {
        input: "order 8's largest line is 11",
        output: "(no row)",
        explanation:
          "11 > 11.0 is false — a peak equal to the global average fails the strict comparison, however much it towers over the order's own 8.67 average.",
      },
    ],
    constraints: [
      "the average pools every quantity row in OrdersDetails — 10 rows here — regardless of which order it belongs to",
      "an order is judged by its MAXIMUM line quantity against that global average, strictly greater",
      "one column order_number, one row per qualifying order, ordered ascending by order_number",
    ],
    breakdown: [
      "Two scopes share one query: a per-order maximum (the peak line within an order) and a whole-table average (every row pooled). GROUP BY alone cannot hold both — once rows are grouped by order, every aggregate sees only its own group. The clean move is to compute both scopes as columns on the ungrouped rows with window functions: MAX(quantity) OVER (PARTITION BY order_number) repeats the order's peak on each of its lines, and AVG(quantity) OVER () — an empty window — repeats the global mean on every row of the table.",
      "The wrong shape to avoid is HAVING MAX(quantity) > AVG(quantity) under GROUP BY order_number: both aggregates then live inside the order, so the comparison silently becomes 'peak vs own average', which is true for any order with unequal lines. Order 8's peak 11 beats its own 8.67 and would sneak in, even though 11 fails the real 11.0 whole-table bar. One side of the comparison must escape the group — the empty-window AVG() OVER () does exactly that, and the scalar subquery (SELECT AVG(quantity) FROM OrdersDetails) is the equivalent escape hatch.",
      "The window view returns one row per LINE, not per order — order 9's four lines each carry (20, 11.0). Filtering first keeps every line whose order qualifies; DISTINCT then collapses the repeats to one row per order, and the final ORDER BY restores the contract's ascending order. Filter, then dedupe: the WHERE runs row by row on the stamped lines, and every line of a qualifying order carries the same pair, so the collapse loses nothing.",
    ],
    edges: [
      "Global vs per-order average: order 8's own average is 8.67, and a grouped MAX > AVG test would admit it — the empty-window AVG() OVER () pins the 11.0 whole-table bar instead.",
      "Strict >: order 8's peak equals the global average exactly (11 vs 11.0) and is excluded — the seed's boundary order catches a >= reading.",
      "OVER () with an empty window means ALL rows of the result set, not the partition — swapping the two windows (AVG over the partition, MAX over ()) would compare each line's quantity to the order peak and wreck the answer.",
      "Window output is per line: 10 lines in, so DISTINCT (or GROUP BY) is required to hand back one row per order — 7 surviving lines collapse to 2 orders.",
    ],
    ladder: [
      { title: "Brute force — two spreadsheets", body: "Sum and count all quantities to get the bar, then take each order's max by hand and compare. Works once; every insert moves the average and invalidates every verdict." },
      { title: "The pattern — two windows, one pass", body: "Stamp every line with its partition max and the empty-window global average, filter on the comparison, then dedupe to orders." },
      { title: "The optimal idea — lift both scopes into columns before filtering", body: "O(n log n) — one scan for the windows, one sort for the dedupe and final order. The durable rule: when a comparison needs two different scopes, never trap them inside one GROUP BY — make them columns and compare." },
    ],
    approach: "MAX() OVER (partition) vs AVG() OVER () — both scopes as columns, filter, DISTINCT",
    schema: {
      ddl: `CREATE TABLE OrdersDetails (
  order_number   INTEGER NOT NULL,
  product_number INTEGER NOT NULL,
  quantity       INTEGER NOT NULL
);`,
      seed: `INSERT INTO OrdersDetails (order_number, product_number, quantity) VALUES
  (7, 101, 15),
  (7, 102, 9),
  (7, 103, 10),  -- order 7: 3 lines, sum 34, peak 15
  (8, 101, 11),
  (8, 104, 7),
  (8, 105, 8),   -- order 8: 3 lines, sum 26, peak 11 = the global average
  (9, 102, 6),
  (9, 103, 20),
  (9, 106, 10),
  -- order 9: 4 lines, sum 50, peak 20
  (9, 107, 14);`,
      tables: [
        { name: "OrdersDetails", note: "10 lines over 3 orders, total 110 units — the global average is exactly 11.0 and order 8's peak ties it" },
      ],
    },
    code: `SELECT DISTINCT order_number
FROM (
    SELECT
        order_number,
        MAX(quantity) OVER (PARTITION BY order_number) AS order_max,  -- the order's peak line
        AVG(quantity) OVER ()                          AS global_avg  -- ALL rows pooled
    FROM OrdersDetails
) t
WHERE order_max > global_avg  -- strict: a peak equal to the bar fails
ORDER BY order_number;`,
    walkthrough: [
      "The inner SELECT stamps every line twice: order 7's three lines all carry order_max 15, order 8's carry 11, order 9's carry 20. global_avg is 110 over 10 rows = 11.0 on every single row — the empty window ignores partitions entirely.",
      "The filter keeps lines where order_max > 11.0: order 7's three lines (15 > 11.0) and order 9's four lines (20 > 11.0) pass. Order 8's 11 > 11.0 is false — its peak ties the bar and the strict comparison rejects it, despite its own-average of 8.67.",
      "Seven surviving lines collapse through DISTINCT to one row per order: 7 then 9, ascending.",
    ],
    time: "O(n log n) — one scan for the windows, one sort for the dedupe and final order",
    space: "O(n) — the stamped line set",
    followUps: [
      "Solve it without windows, using (SELECT AVG(quantity) FROM OrdersDetails) inside HAVING — where does the DISTINCT go, and is that plan cheaper or dearer on this seed?",
      "Report the margin beside each winner — order_number, order_max, global_avg — and decide whether the bar should be rounded before display.",
      "Exclude small orders (fewer than 3 lines) from contributing to the bar — the denominator now depends on a per-order count: which window changes first?",
    ],
    related: ["queries-quality-and-percentage", "immediate-food-delivery-ii", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "group-employees-of-the-same-salary",
    statement:
      "Employees holds one row per employee (employee_id, name, salary). Employees whose salary is shared by at least one colleague form a pay team; a salary held by exactly one person is not a team and its owner is left out of the report entirely. For every team member output employee_id, name, salary, team_id — where team_id is the dense rank of their salary among the TEAM salaries from the top down: the best-paid team is 1, and no two different salaries share a number. Rows are ordered by salary DESC, then employee_id ASC.",
    examples: [
      {
        input: "employees 1 (Ann) and 2 (Ben) both earn 3000",
        output: "(1, Ann, 3000, 1) and (2, Ben, 3000, 1)",
        explanation:
          "Two members make a team; both share team_id 1, the number of the top-paid team.",
      },
      {
        input: "employee 3 (Cal) earns 2500 — nobody else does",
        output: "(no row for Cal)",
        explanation:
          "A team of one is not a team. Cal is dropped BEFORE the ranking, so his 2500 never claims a team_id of its own.",
      },
    ],
    constraints: [
      "a team is a salary held by 2 or more employees; unique salaries are excluded from the output",
      "team_id is dense over the surviving team salaries, ordered DESC — 1 for the top team, 2 for the next, no gaps, and members of the same team share their team_id",
      "one row per team member, ordered by salary DESC then employee_id ASC",
    ],
    breakdown: [
      "Two different questions share one query. Membership asks: how many people hold my salary? COUNT(*) OVER (PARTITION BY salary) answers it on every row at once — a per-partition statistic that rides along each employee row without collapsing anything. Identity asks: where does my salary sit among the teams? That is a global ordering across rows, which is DENSE_RANK() OVER (ORDER BY salary DESC). One query carries both, with a filter sandwiched between them.",
      "Phase order is the whole trick. The size window is computed in an inner query; WHERE team_size >= 2 then prunes the unique salaries; the outer query's DENSE_RANK is evaluated over the rows that SURVIVE that filter, so only team salaries receive numbers. Filter first and the teams come out 1 and 2 — consecutive, as a dense rank must be. Rank over all salaries first and Cal's 2500 — a team of one sitting between the 3000 and 2000 teams — would be numbered 2, pushing the 2000 team to 3 and leaving a gap the report never asked for.",
      "Why DENSE_RANK rather than its siblings: ROW_NUMBER hands every row a distinct number and would tear one team into members numbered 1, 2 — the same salary must share a team_id. RANK does share within a tie, but it counts rows, so after a two-member team at rank 1 the next team would arrive at rank 3. DENSE_RANK shares within ties AND counts each distinct value exactly once, which is precisely 'number the teams from the top, consecutively'.",
    ],
    edges: [
      "A unique salary BETWEEN two teams (Cal's 2500) is the trap: filtering before ranking keeps the teams at 1 and 2 — ranking first would hand out 1 and 3.",
      "ROW_NUMBER would split the 3000 team into distinct team_ids (Ann 1, Ben 2) — members of the same salary must share the number.",
      "RANK would number the 3000 pair 1, 1 and then skip: the 2000 trio would arrive at 3, not 2, because RANK counts rows while DENSE_RANK counts distinct values.",
      "The trio at 2000 shows the gate admits any size of 2 or more — Dee, Eli and Fay all share team_id 2, and the ORDER BY settles their internal order by employee_id.",
    ],
    ladder: [
      { title: "Brute force — number the teams by hand", body: "Group salaries in a spreadsheet, cross off the singletons, number the surviving teams from the top, then stitch the numbers back onto the roster. Every new hire restarts the process." },
      { title: "The pattern — size inline, filter, then rank", body: "COUNT(*) OVER (PARTITION BY salary) sizes each group on every row; WHERE keeps teams of 2 or more; DENSE_RANK() OVER (ORDER BY salary DESC) numbers the survivors." },
      { title: "The optimal idea — a rank is only as meaningful as its population", body: "O(n log n) — one window pass plus the sort behind the rank and the final ORDER BY. Filter to the rows the ranking should see BEFORE opening the window, and the numbers come out dense." },
    ],
    approach: "COUNT(*) OVER (PARTITION BY salary) gate, then DENSE_RANK() OVER (ORDER BY salary DESC) on the survivors",
    schema: {
      ddl: `CREATE TABLE Employees (
  employee_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL,
  salary      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employees (employee_id, name, salary) VALUES
  (1, 'Ann', 3000),
  (2, 'Ben', 3000),   -- team 1: two members at 3000
  (3, 'Cal', 2500),   -- unique salary BETWEEN two teams: the ranking trap
  (4, 'Dee', 2000),
  (5, 'Eli', 2000),
  (6, 'Fay', 2000),   -- team 2: three members at 2000
  -- Gus: unique salary below all teams, simply drops
  (7, 'Gus', 1500);`,
      tables: [
        { name: "Employees", note: "7 employees over 4 salaries — two teams (3000 x2, 2000 x3) and two singletons, one of them wedged between the teams" },
      ],
    },
    code: `SELECT
    employee_id,
    name,
    salary,
    DENSE_RANK() OVER (ORDER BY salary DESC) AS team_id  -- dense over TEAM salaries only
FROM (
    SELECT
        employee_id,
        name,
        salary,
        COUNT(*) OVER (PARTITION BY salary) AS team_size  -- how many share my salary?
    FROM Employees
)
WHERE team_size >= 2  -- unique salaries out BEFORE the rank: no gaps, no ghost teams
ORDER BY salary DESC, employee_id ASC;`,
    walkthrough: [
      "The inner window sizes every salary group: 3000 counts 2 (Ann, Ben), 2500 counts 1 (Cal), 2000 counts 3 (Dee, Eli, Fay), 1500 counts 1 (Gus).",
      "WHERE team_size >= 2 keeps five rows — Ann, Ben, Dee, Eli, Fay. Cal and Gus are gone before any ranking happens, so their salaries never receive a team_id and cannot open a gap.",
      "The outer DENSE_RANK orders the surviving salaries DESC: 3000 becomes 1 (shared by Ann and Ben), 2000 becomes 2 (shared by Dee, Eli and Fay) — consecutive, no gaps. Final rows: (1, Ann, 3000, 1), (2, Ben, 3000, 1), (4, Dee, 2000, 2), (5, Eli, 2000, 2), (6, Fay, 2000, 2).",
    ],
    time: "O(n log n) — one window pass plus the sorts behind DENSE_RANK and ORDER BY",
    space: "O(n) — the sized rows carried between phases",
    followUps: [
      "Add the team size as a column beside team_id — the inner window already carries it: what does the report look like if singletons are re-admitted with a NULL team_id instead of dropped?",
      "Rank teams by total payroll (salary times headcount) instead of salary — which window changes, and can a lower-salary team now outrank a small higher-salary one?",
    ],
    related: ["rank-scores", "count-salary-categories", "department-top-three-salaries"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "leetcodify-friends-recommendations",
    statement:
      "Listens logs every play as (user_id, song_id, day) and Friendship stores each confirmed pair exactly once as (user1_id, user2_id) with user1_id < user2_id. Recommend every FRIEND pair who played at least 3 DISTINCT songs in common on a single shared day — the count is judged per day and never accumulated across days. Output user1_id, user2_id with user1_id < user2_id, one row per recommended pair, ordered by user1_id then user2_id.",
    examples: [
      {
        input: "users 1 and 2 are friends; on 2024-07-01 both played songs 10, 11 and 12",
        output: "(1, 2)",
        explanation:
          "Three distinct songs on one shared day clears the bar exactly, and the Friendship row (1, 2) exists — the pair is recommended.",
      },
      {
        input: "users 3 and 4 (not friends) both played songs 20, 21 and 22 on 2024-07-01",
        output: "(no row)",
        explanation:
          "The listening matches, but there is no Friendship row to join — synchronization without friendship is not recommendable.",
      },
    ],
    constraints: [
      "a pair qualifies on a day when they share at least 3 DISTINCT songs that day; days are judged separately and never pooled",
      "the pair must exist in Friendship, which stores each pair once with user1_id < user2_id",
      "one row per pair even if it qualifies on several days, ordered by user1_id then user2_id",
    ],
    breakdown: [
      "The meeting grain is (pair, day, song). A self-join of Listens to itself on equality of BOTH day and song_id, restricted to l2.user_id > l1.user_id, produces exactly one joined row per common song per day per pair. The strict inequality does double duty: it collapses the two join directions (1 x 2 and 2 x 1) into the canonical smaller-larger order the output wants, and it stops a user from matching themselves — without it, user 1 would pair with user 1 on every song they played that day and enthusiastically recommend themselves.",
      "Grouping then happens at the pair-day grain: GROUP BY the two user ids and the day, then HAVING COUNT(DISTINCT song_id) >= 3. The DISTINCT is habit even on a replay-free seed — a user who repeats a song within a day would multiply COUNT(*) without adding a distinct song, and the bar counts SONGS, not plays. Keeping day inside the GROUP BY is what makes cross-day accumulation structurally impossible: 2 shared songs on Tuesday and 2 on Wednesday live in different groups, each below the bar, and no group ever spans days to become 4.",
      "The friendship gate is an inner join of the qualifying pair-days to Friendship on (user1_id, user2_id): synchronized strangers like users 3 and 4 die exactly there. A last wrinkle remains: a pair can clear the bar on TWO different days, and the pair-day grain would then hand back one row per qualifying day. SELECT DISTINCT (or a final pair-level GROUP BY) folds the days into the single row per pair the output contract demands.",
    ],
    edges: [
      "The friendship gate: users 3 and 4 share songs 20, 21, 22 on 2024-07-01 — three songs, same day — but no Friendship row exists, so the join drops them.",
      "Cross-day pooling: friends 4 and 5 share 2 songs on 2024-07-02 and 2 different songs on 2024-07-03 — 4 in total but never 3 on one day; GROUP BY day keeps them out, while merging days would wrongly recommend them.",
      "Self-pairs: the join condition l2.user_id > l1.user_id is strict — an = there would let every user recommend themselves off their own playlist.",
      "Multi-day qualification: a pair clearing the bar on two days yields two pair-day rows — DISTINCT folds them into the one row per pair the contract requires.",
    ],
    ladder: [
      { title: "Brute force — intersect sets in app code", body: "For each friend pair and each day, build both users' song sets, intersect them, and count. O(pairs x days x songs) outside the database, with no help from indexes." },
      { title: "The pattern — self-join, group, gate", body: "Self-join Listens on (day, song_id) with user2 > user1, GROUP BY pair and day, HAVING COUNT(DISTINCT song_id) >= 3, then join Friendship." },
      { title: "The optimal idea — count at the grain you join at", body: "Hashing Listens by (day, song_id) turns each group into within-group pairs, so the work is the sum of squared group sizes — worst case O(L^2), near-linear for a spread-out catalog. Pick the join key to be the grain you want to count at, and let GROUP BY finish." },
    ],
    approach: "Self-join on (day, song_id) with canonical user order, GROUP BY pair-day, HAVING COUNT(DISTINCT song_id) >= 3, join Friendship",
    schema: {
      ddl: `CREATE TABLE Listens (
  user_id INTEGER NOT NULL,
  song_id INTEGER NOT NULL,
  day     TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE Friendship (
  user1_id INTEGER NOT NULL,  -- always the smaller id
  user2_id INTEGER NOT NULL   -- always the larger id
);`,
      seed: `INSERT INTO Listens (user_id, song_id, day) VALUES
  -- 2024-07-01: users 1+2 share three songs (friends); users 3+4 share three (strangers)
  (1, 10, '2024-07-01'),
  (1, 11, '2024-07-01'),
  (1, 12, '2024-07-01'),
  (2, 10, '2024-07-01'),
  (2, 11, '2024-07-01'),
  (2, 12, '2024-07-01'),
  (3, 20, '2024-07-01'),
  (3, 21, '2024-07-01'),
  (3, 22, '2024-07-01'),
  (4, 20, '2024-07-01'),
  (4, 21, '2024-07-01'),
  (4, 22, '2024-07-01'),
  -- 2024-07-02: friends 4+5 share two songs; friends 2+6 share one
  (4, 30, '2024-07-02'),
  (4, 31, '2024-07-02'),
  (5, 30, '2024-07-02'),
  (5, 31, '2024-07-02'),
  (2, 12, '2024-07-02'),
  (6, 12, '2024-07-02'),
  -- 2024-07-03: friends 4+5 share two more
  (4, 40, '2024-07-03'),
  (4, 41, '2024-07-03'),
  (5, 40, '2024-07-03'),
  (5, 41, '2024-07-03');
INSERT INTO Friendship (user1_id, user2_id) VALUES
  (1, 2),
  (2, 6),  -- friends, but only one shared song
  (3, 5),  -- friends with nothing in common
  -- (4,5): friends sharing 2 + 2 songs across two days, never 3 on one day
  (4, 5);`,
      tables: [
        { name: "Listens", note: "22 plays over 3 days and 6 users — pairs 1+2 (3 same-day), 3+4 (3 same-day, strangers), 4+5 (2 + 2 across days), 2+6 (1)" },
        { name: "Friendship", note: "4 pairs, each stored once with user1_id < user2_id — (1,2), (2,6), (3,5), (4,5)" },
      ],
    },
    code: `SELECT DISTINCT f.user1_id, f.user2_id
FROM (
    SELECT
        l1.user_id AS user1_id,  -- smaller id: the join enforces canonical order
        l2.user_id AS user2_id,
        l1.day,
        COUNT(DISTINCT l1.song_id) AS shared
    FROM Listens l1
    JOIN Listens l2
      ON l2.day = l1.day
     AND l2.song_id = l1.song_id
     AND l2.user_id > l1.user_id  -- one direction per pair; no self-pairs
    GROUP BY l1.user_id, l2.user_id, l1.day
    HAVING COUNT(DISTINCT l1.song_id) >= 3  -- per pair per DAY, never pooled
) s
JOIN Friendship f
  ON f.user1_id = s.user1_id
 AND f.user2_id = s.user2_id  -- the gate: strangers never survive
ORDER BY f.user1_id, f.user2_id;`,
    walkthrough: [
      "The self-join matches listens with equal (day, song_id) across two different users. On 2024-07-01, songs 10, 11 and 12 each match user 1 with user 2 — one pair-day group holding 3 rows; songs 20, 21 and 22 each match user 3 with user 4 — another group of 3. On 2024-07-02, songs 30 and 31 match 4 with 5, and song 12 matches 2 with 6. On 2024-07-03, songs 40 and 41 match 4 with 5.",
      "HAVING counts DISTINCT songs per pair-day: (1, 2, 2024-07-01) has 3 and passes; (3, 4, 2024-07-01) has 3 and passes the count; (4, 5, 2024-07-02) has 2 and fails; (4, 5, 2024-07-03) has 2 and fails — the two days stay separate groups, so 4 total never merges; (2, 6, 2024-07-02) has 1 and fails. Two pair-days survive.",
      "The Friendship join drops (3, 4) — no such row exists — and keeps (1, 2). DISTINCT would fold a second qualifying day if one existed; here one row remains: (1, 2), in canonical order.",
    ],
    time: "sum of squared sizes of (day, song) match groups — worst case O(L^2), near-linear for a spread catalog",
    space: "O(L) — the (day, song) hash plus the pair-day table",
    followUps: [
      "Recommend friend pairs by songs shared across ANY days (drop day from the join) — which seeded pair flips, and what does the >= 3 count then mean?",
      "Return each recommended pair with the songs and days that qualified — which shape carries song ids out of the HAVING-filtered group: a join-back to the pair-day rows or an aggregation per pair?",
      "If Friendship stored both directions of every pair, how would you normalize the gate — LEAST/GREATEST pair keys or a pre-deduplicated Friendship CTE?",
    ],
    related: ["strong-friendship", "all-the-pairs-with-the-maximum-number-of-common-followers", "friend-requests-ii-who-has-the-most-friends"],
    order: "exact",
    xp: 35,
  },
];
