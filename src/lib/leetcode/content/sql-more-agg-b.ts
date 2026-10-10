// Deep-dives — the SQL 50+ expansion: aggregation & reporting, part B
// (5 problems). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE_AGG_B: LcSqlDive[] = [
  {
    slug: "reported-posts",
    statement:
      "Actions logs user behavior on posts — views, likes, and reports, where a report's reason lives in the extra column ('spam', 'not spam', …). For each day, compute the average number of spam reports per post that received at least one spam report that day, rounded to two decimals.",
    examples: [
      {
        input: "2019-07-01: spam reports on posts 1, 2, 3 (3 reports, 3 posts) · 2019-07-02: spam reports on posts 1, 3 twice (2 reports, 2 posts)",
        output: "2019-07-01 1.0 · 2019-07-02 1.0",
        explanation: "Each day's reports divide by the number of DISTINCT posts involved that day — not by total posts in the table.",
      },
    ],
    constraints: ["only action='report' with extra='spam' counts", "the denominator is distinct posts per day, not all posts", "round the average to 2 decimal places"],
    breakdown: [
      "The trap is the denominator. 'Average per post' over a day means reports-that-day divided by distinct posts-that-day — and COUNT(*) / COUNT(DISTINCT post_id) computes both sides of that fraction in ONE aggregation pass. Two different aggregates over the same groups, one row per day.",
      "The filter pair (action = 'report', extra = 'spam') must be a WHERE clause, not a CASE inside the aggregate: the spec excludes non-spam rows from BOTH sides of the fraction. Filtering rows before grouping is cheaper and keeps the arithmetic honest.",
      "Integer division is the silent killer: COUNT(*) / COUNT(DISTINCT post_id) with both operands INTEGER would truncate 3/2 to 1 in many engines. Multiplying the numerator by 1.0 forces float math first — a two-character fix for a wrong-answer bug.",
    ],
    edges: [
      "Denominator = COUNT(DISTINCT post_id) per day — never the whole table's post count.",
      "Multiply by 1.0 to avoid integer division truncation.",
      "ROUND(…, 2) matches the required 2-dp output format.",
    ],
    ladder: [
      { title: "Brute force — per-day loops", body: "For each date: collect spam reports, count distinct posts, divide in code. Three passes per day; SQL does it in one grouped pass." },
      { title: "The pattern — ratio of two aggregates", body: "GROUP BY action_date with COUNT(*) as numerator and COUNT(DISTINCT post_id) as denominator. One pass, one row per day." },
      { title: "The optimal idea — float-safe rounding", body: "COUNT(*) * 1.0 / COUNT(DISTINCT post_id) then ROUND(…, 2). The 1.0 promotion is the difference between 1.5 and 1." },
    ],
    approach: "Ratio of COUNT(*) to COUNT(DISTINCT) per day, float-safe",
    schema: {
      ddl: `CREATE TABLE Actions (
  user_id     INTEGER NOT NULL,
  post_id     INTEGER NOT NULL,
  action_date TEXT NOT NULL,
  action      TEXT NOT NULL,
  extra       TEXT
);`,
      seed: `INSERT INTO Actions (user_id, post_id, action_date, action, extra) VALUES
  (1,1,'2019-07-01','report','spam'),
  (2,2,'2019-07-01','report','spam'),
  (3,3,'2019-07-01','report','spam'),
  (4,1,'2019-07-02','report','spam'),
  (5,3,'2019-07-02','report','spam'),
  (6,1,'2019-07-02','report','not spam'),
  (7,2,'2019-07-02','like',NULL),
  (8,1,'2019-07-01','view',NULL);`,
      tables: [{ name: "Actions", note: "8 events; only action=report + extra=spam count" }],
    },
    code: `SELECT
    action_date,
    ROUND(
        COUNT(*) * 1.0 / COUNT(DISTINCT post_id),   -- float-safe fraction
        2
    ) AS average_daily_reports
FROM Actions
WHERE action = 'report' AND extra = 'spam'
GROUP BY action_date
ORDER BY action_date;`,
    walkthrough: [
      "WHERE strips everything but spam reports: 3 rows on 07-01, 2 rows on 07-02 (the 'not spam' report and the like/view rows never enter the groups).",
      "For 07-01: COUNT(*) = 3, COUNT(DISTINCT post_id) = 3 (posts 1, 2, 3) → 1.0. For 07-02: 2 reports over posts {1, 3} → 1.0.",
      "The 1.0 promotion makes the division float before ROUND(…, 2) formats it — the output matches the required two-decimal contract.",
    ],
    time: "O(n) — one filtered scan + grouped aggregation",
    space: "O(d) — one row per day",
    followUps: [
      "Average spam reports per post over ALL days combined — move the DISTINCT outside the day grouping.",
      "Which single post collected the most spam reports? COUNT with ORDER BY DESC LIMIT 1.",
    ],
    related: ["daily-leads-and-partners", "find-total-time-spent-by-each-employee"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "daily-leads-and-partners",
    statement:
      "DailySales logs marketing activity per day and brand: each row is one event that touches a lead and a partner, and the same lead or partner may appear many times. For each (date, brand) pair, count how many DISTINCT leads and DISTINCT partners were involved.",
    examples: [
      {
        input: "2020-12-08 toyota: leads {0,1}, partners {1,0,2} · 2020-12-07 honda: leads {0,1,2}, partners {1,2}",
        output: "2020-12-07 honda 3 2 · 2020-12-08 toyota 2 3",
        explanation: "Duplicates collapse: toyota's three rows mention 2 unique leads but 3 unique partners.",
      },
    ],
    constraints: ["lead_id and partner_id repeat freely within a group", "output columns: date_id, make_name, unique_leads, unique_partners"],
    breakdown: [
      "COUNT and COUNT(DISTINCT …) answer different questions about the same bucket, and this report needs both side by side: raw rows are events, distinct values are entities. One GROUP BY, two flavors of the same function — that's the entire query.",
      "The composite group key (date, brand) is the report's grain. Get it wrong — group by brand alone — and seven days of activity merge into one lying row. Grain errors don't crash; they silently aggregate across the boundary you meant to keep.",
      "COUNT(DISTINCT x) ignores NULLs and dedupes within the bucket, which is exactly 'how many different things were involved'. When a stakeholder says 'unique', your fingers should already be typing DISTINCT inside the COUNT. The seed makes the two columns diverge visibly: honda's 4 rows carry 3 distinct leads but only 2 distinct partners — same bucket, different dedup results, so the aggregates never interfere.",
    ],
    edges: [
      "Group by (date_id, make_name) — the full reporting grain.",
      "COUNT(DISTINCT) per column independently: leads and partners dedupe separately.",
      "Sort deterministically by both group keys.",
    ],
    ladder: [
      { title: "Brute force — set per group", body: "Walk rows, maintain a Set of leads and a Set of partners per (day, brand), emit sizes. A hash aggregate re-implemented by hand." },
      { title: "The pattern — two distinct counts, one group", body: "GROUP BY date_id, make_name with COUNT(DISTINCT lead_id) and COUNT(DISTINCT partner_id)." },
      { title: "The optimal idea — single-pass aggregation", body: "O(n), one scan, hash on the pair. Nothing to optimize — the value is in recognizing 'unique' = COUNT(DISTINCT) instantly." },
    ],
    approach: "Two COUNT(DISTINCT …) aggregates over one composite group",
    schema: {
      ddl: `CREATE TABLE DailySales (
  date_id    TEXT NOT NULL,
  make_name  TEXT NOT NULL,
  lead_id    INTEGER NOT NULL,
  partner_id INTEGER NOT NULL
);`,
      seed: `INSERT INTO DailySales (date_id, make_name, lead_id, partner_id) VALUES
  ('2020-12-08','toyota',0,1),('2020-12-08','toyota',1,0),('2020-12-08','toyota',1,2),
  ('2020-12-07','honda',0,1),('2020-12-07','honda',1,2),('2020-12-07','honda',2,1),('2020-12-07','honda',1,2);`,
      tables: [{ name: "DailySales", note: "7 events over 2 days × 2 brands" }],
    },
    code: `SELECT
    date_id,
    make_name,
    COUNT(DISTINCT lead_id)    AS unique_leads,
    COUNT(DISTINCT partner_id) AS unique_partners
FROM DailySales
GROUP BY date_id, make_name
ORDER BY date_id, make_name;`,
    walkthrough: [
      "Two buckets form: (2020-12-07, honda) with 4 rows and (2020-12-08, toyota) with 3.",
      "Honda's rows mention leads {0,1,1,2} → 3 distinct; partners {1,2,1,2} → 2 distinct.",
      "Toyota's rows mention leads {0,1,1} → 2 distinct; partners {1,0,2} → 3 distinct.",
      "ORDER BY date, brand prints the older day first — honda 3/2, then toyota 2/3.",
    ],
    time: "O(n) — one scan + hash aggregate",
    space: "O(g) — one row per (date, brand)",
    followUps: [
      "Days where a brand reached more unique partners than leads — wrap in HAVING comparing the two aggregates.",
      "Total events per group too — add plain COUNT(*) beside the distinct counts and compare.",
    ],
    related: ["reported-posts", "find-followers-count"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-followers-count",
    statement:
      "Followers records one row per (user, follower) relationship. For each user, report how many followers they have, sorted by user id.",
    examples: [
      {
        input: "Followers: (0,1),(1,1),(2,1),(2,2),(3,1)",
        output: "0 · 1 / 1 · 1 / 2 · 2 / 3 · 1",
        explanation: "Users 0, 1 and 3 have one follower each; user 2 has two (followers 1 and 2).",
      },
    ],
    constraints: ["(user_id, follower_id) is unique", "output columns: user_id, followers_count"],
    breakdown: [
      "The smallest complete GROUP BY exercise: the group key IS the entity, COUNT(*) is the metric, ORDER BY formats the roster. If this feels too easy, notice how much of reporting it contains — grain, aggregate, sort — in three clauses. The seed's five edges collapse to four rows, with user 2's two inbound follows merging into the single count 2 while everyone else stays at 1.",
      "Direction matters and is easy to blur: the table says user_id HAS follower_id. Grouping by follower_id would answer 'how many people does each account follow' — a different business question from a one-column typo. The seed makes the flip visible: follower buckets read 1→4, 2→1 (follower 1 follows everyone), instead of the required 0→3 roster of followers per user.",
      "Every row contributes exactly one follower, so COUNT(*) is correct without DISTINCT; the PK's uniqueness guarantee is what licenses the simpler aggregate. Knowing when DISTINCT is unnecessary is as valuable as knowing when it's mandatory. If the table ever logged duplicate follow events, COUNT(*) would inflate silently and COUNT(DISTINCT follower_id) would become mandatory — the constraint, not taste, picks the aggregate.",
    ],
    edges: [
      "Group by user_id (the followed), not follower_id (the following).",
      "COUNT(*) suffices — pairs are unique by constraint.",
      "Sort by user_id for a deterministic roster.",
    ],
    ladder: [
      { title: "Brute force — map and tally", body: "Increment a counter per user while scanning. GROUP BY is the declarative version of exactly this loop." },
      { title: "The pattern — count per entity", body: "GROUP BY user_id, COUNT(*), ORDER BY user_id. Three clauses, one scan." },
      { title: "The optimal idea — already optimal", body: "O(n) hash aggregate. The only judgment call is direction — and the spec, not the schema, decides it." },
    ],
    approach: "GROUP BY the followed user + COUNT(*)",
    schema: {
      ddl: `CREATE TABLE Followers (
  user_id     INTEGER NOT NULL,
  follower_id INTEGER NOT NULL,
  PRIMARY KEY (user_id, follower_id)
);`,
      seed: `INSERT INTO Followers (user_id, follower_id) VALUES (0,1),(1,1),(2,1),(2,2),(3,1);`,
      tables: [{ name: "Followers", note: "5 edges — user 2 has two followers" }],
    },
    code: `SELECT
    user_id,
    COUNT(*) AS followers_count
FROM Followers
GROUP BY user_id
ORDER BY user_id;`,
    walkthrough: [
      "Four buckets form — users 0, 1, 2, 3 — sized 1, 1, 2, 1 respectively.",
      "COUNT(*) reads each bucket's size; the PK guarantees no double-counted follower.",
      "ORDER BY user_id prints the roster 0→3.",
    ],
    time: "O(n) — one scan + hash aggregate",
    space: "O(u) — one row per user",
    followUps: [
      "Who follows the most people? Group by follower_id instead — same query, flipped question.",
      "Mutual follows (A follows B and B follows A): self-join the table on the swapped pair.",
    ],
    related: ["actors-and-directors-who-cooperated-at-least-three-times", "daily-leads-and-partners"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-total-time-spent-by-each-employee",
    statement:
      "Logs records clock in/out pairs: (emp_id, event_day, in_time, out_time), and one employee may have several sessions on the same day. Report each employee's total minutes on the job per day, ordered by day then employee.",
    examples: [
      {
        input: "2020-11-28: emp 1 sessions (4→32),(55→200); emp 2 (3→33) · 2020-11-30: emp 1 (9→44); emp 3 (1→10)",
        output: "2020-11-28 1 173 · 2020-11-28 2 30 · 2020-11-30 1 35 · 2020-11-30 3 9",
        explanation: "Employee 1's two sessions on the 28th merge: 28 + 145 = 173 minutes.",
      },
    ],
    constraints: ["out_time > in_time in every row", "one employee can hold multiple sessions per day", "output columns: event_day, emp_id, total_time"],
    breakdown: [
      "Derived metrics beat stored metrics: duration isn't a column, it's out_time - in_time computed per row, then SUM'd per group. Computing inside the aggregate — SUM(a - b), not SUM(a) - SUM(b) (same answer here, but the per-row form is the habit that survives harder formulas).",
      "The group key is (event_day, emp_id) — the report's grain is 'per person per day', not 'per person'. One-day-per-row reports hide this; multi-session logs expose it: forget the day and two sessions on different days sum into a meaningless total.",
      "Out/in times are minutes-since-midnight integers, which makes subtraction honest. With TIMESTAMP columns you'd borrow the same shape via strftime or julianday deltas — the aggregation logic never changes, only the arithmetic layer. The seed's arithmetic stays human-checkable: emp 1's 28 + 145 merge into 173 only because both sessions share the (day, employee) bucket — group by employee alone and the 30th's 35 would melt into that same total.",
    ],
    edges: [
      "Multiple sessions per day MUST merge — group by (day, employee).",
      "Compute the duration per row inside SUM, not after grouping.",
      "Order by (event_day, emp_id) for a deterministic timesheet.",
    ],
    ladder: [
      { title: "Brute force — accumulate in code", body: "Hash map keyed (day, emp), add out-in per row. The hash aggregate, hand-rolled." },
      { title: "The pattern — derived column + grouped SUM", body: "SUM(out_time - in_time) over GROUP BY event_day, emp_id." },
      { title: "The optimal idea — single-pass reduction", body: "O(n). The grain decision (day + employee) is the whole difficulty; the aggregation is standard." },
    ],
    approach: "Derived duration + GROUP BY (day, employee)",
    schema: {
      ddl: `CREATE TABLE Logs (
  emp_id    INTEGER NOT NULL,
  event_day TEXT NOT NULL,
  in_time   INTEGER NOT NULL,
  out_time  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Logs (emp_id, event_day, in_time, out_time) VALUES
  (1,'2020-11-28',4,32),(1,'2020-11-28',55,200),(2,'2020-11-28',3,33),
  (1,'2020-11-30',9,44),(3,'2020-11-30',1,10);`,
      tables: [{ name: "Logs", note: "5 sessions; emp 1 worked twice on the 28th" }],
    },
    code: `SELECT
    event_day,
    emp_id,
    SUM(out_time - in_time) AS total_time
FROM Logs
GROUP BY event_day, emp_id
ORDER BY event_day, emp_id;`,
    walkthrough: [
      "Each row's duration computes first: 28, 145, 30, 35, 9 minutes.",
      "Buckets keyed (day, employee) merge emp 1's two sessions on the 28th: 28 + 145 = 173. The other buckets are single-session: 30, 35, 9.",
      "ORDER BY day then employee prints the timesheet in calendar order.",
    ],
    time: "O(n) — one scan + hash aggregate",
    space: "O(d × e) — one row per (day, employee)",
    followUps: [
      "Flag days where someone worked over 8 hours — HAVING SUM(out_time - in_time) > 480.",
      "Sessions spanning midnight would break in_time/out_time as minutes — how would you redesign the schema?",
    ],
    related: ["game-play-analysis-i", "reported-posts"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "number-of-rich-customers",
    statement:
      "Store logs bills as (bill_id, customer_id, amount). Count how many DISTINCT customers hold at least one bill strictly greater than 500.",
    examples: [
      {
        input: "Store: (6,1,549),(8,1,834),(4,2,394),(11,3,657),(13,3,257)",
        output: "2",
        explanation: "Customers 1 and 3 each have a bill over 500; customer 2 never does. The count is of CUSTOMERS, not bills.",
      },
    ],
    constraints: ["amount > 500 is the only 'rich' test — sums don't matter", "output: single column rich_count, single row"],
    breakdown: [
      "The question is a count of PEOPLE, but the evidence is in TRANSACTIONS. COUNT(DISTINCT customer_id) after the WHERE is the exact bridge: filter rows to the qualifying bills, then collapse the customer column to its distinct values and count them.",
      "Compare with the wrong answer, COUNT(*): the seed has 3 qualifying bills but only 2 qualifying customers. Aggregation functions differ precisely in what they collapse — rows, or distinct values of a column — and this problem flips between them with one keyword.",
      "'Strictly greater' is doing quiet work: a bill of exactly 500 does NOT qualify. Boundary semantics belong in the filter verbatim — > 500, never >= 500 — because the test data will absolutely probe the edge. The seed keeps every bill just off the line — 394 and 257 fail on size, not on the boundary — so a quiet >= would pass this seed and fail the hidden case; the discipline is checking the operator against the spec, not against one dataset.",
    ],
    edges: [
      "DISTINCT is the difference between 2 and 3 on this seed.",
      "Strictly greater than 500 — the boundary bill must fail.",
      "One customer with three rich bills still counts once.",
    ],
    ladder: [
      { title: "Brute force — set then size", body: "Collect customer ids of qualifying bills into a set; return its size. COUNT(DISTINCT) is the declarative twin." },
      { title: "The pattern — filter rows, count distinct", body: "WHERE amount > 500, then COUNT(DISTINCT customer_id). No GROUP BY: the answer is a single global scalar." },
      { title: "The optimal idea — one filtered pass", body: "O(n) with a hash set under the hood. The correctness lives entirely in WHERE + DISTINCT." },
    ],
    approach: "COUNT(DISTINCT) over a filtered scan",
    schema: {
      ddl: `CREATE TABLE Store (
  bill_id     INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  amount      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Store (bill_id, customer_id, amount) VALUES
  (6,1,549),(8,1,834),(4,2,394),(11,3,657),(13,3,257),(14,3,500);`,
      tables: [{ name: "Store", note: "6 bills; the 500 bill deliberately tests the boundary" }],
    },
    code: `SELECT
    COUNT(DISTINCT customer_id) AS rich_count
FROM Store
WHERE amount > 500;                       -- strictly greater`,
    walkthrough: [
      "WHERE keeps bills 549, 834, 657 — and rejects 394, 257, and the deliberate 500 (strict comparison).",
      "The surviving rows name customers {1, 1, 3}; DISTINCT collapses them to {1, 3}.",
      "COUNT returns 2 — customers, not bills. One row, one number.",
    ],
    time: "O(n) — one filtered scan with a distinct-set",
    space: "O(k) — the distinct customer set",
    followUps: [
      "List WHO they are, not just how many — SELECT DISTINCT customer_id with the same WHERE.",
      "Richest customer by total spend — GROUP BY + SUM flips the metric from presence to volume.",
    ],
    related: ["bank-account-summary-ii", "daily-leads-and-partners"],
    order: "any",
    xp: 10,
  },
];
