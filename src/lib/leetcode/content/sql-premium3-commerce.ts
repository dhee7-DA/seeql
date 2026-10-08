// Deep-dives — LeetCode Premium batch III, file 2 of 6: a destructive purge,
// discount eligibility, ride roles and per-buyer champions (6 problems:
// 3 Easy, 3 Medium). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM3_COMMERCE: LcSqlDive[] = [
  {
    slug: "drop-type-1-orders-for-customers-with-type-0-orders",
    statement:
      "Orders tracks every purchase as one row (order_id, customer_id, order_type, order_date). order_type is the TEXT '0' or '1' — call '0' a standard order and '1' a backorder. Write a single DELETE that removes every backorder (order_type '1') belonging to a customer who has placed at least one standard order (order_type '0'). Customers with no standard order keep every row they have, backorders included. The grader inspects the remaining rows of Orders afterwards.",
    examples: [
      {
        input:
          "customer 301 holds order 1 (type '0', 2024-07-01) and order 2 (type '1', 2024-07-02)",
        output: "after the delete: order 2 is gone, order 1 remains",
        explanation:
          "301 owns a standard order, so the backorder loses its shelter — and the standard order itself is never a deletion candidate.",
      },
      {
        input:
          "customer 303 holds exactly one row, order 4 (type '1', 2024-07-04), and no order of type '0' anywhere",
        output: "order 4 survives",
        explanation:
          "The rule removes backorders OF customers with a type-0 history; with no such history, 303's backorder is untouchable.",
      },
    ],
    constraints: [
      "every order_type '1' row of a qualifying customer is removed — customer 304 loses BOTH of its backorders in one statement",
      "rows of customers with no order_type '0' row survive even when they are type '1' (customer 303's lone backorder stays)",
      "one DELETE statement; the grader compares the post-delete table via the order_id column ordered ascending",
    ],
    breakdown: [
      "The victim set is an intersection of two conditions that live on DIFFERENT rows of the same table. The row being deleted must itself be a backorder — a plain, row-local WHERE arm. But its customer must also own some other row of type '0' — a property of the customer, not of this row, and no arm of a single WHERE can see another row. So the statement needs two layers: the row-local guard order_type = '1', plus a membership test that asks the table about the customer's wider history.",
      "The membership test has two standard shapes. customer_id IN (SELECT customer_id FROM Orders WHERE order_type = '0') materializes the qualifying-customer set once and probes each candidate row against it; EXISTS (SELECT 1 FROM Orders other WHERE other.customer_id = Orders.customer_id AND other.order_type = '0') is the correlated twin, re-evaluated per candidate row and free to stop at the first hit. On small data they agree exactly — here both hand over the set {301, 304}. The scale argument favors the uncorrelated IN (one pass to build, one pass to probe) or an index-backed EXISTS, and the honest engineering answer is to measure rather than guess.",
      "The disaster mode is scope creep, not performance. Drop the outer order_type = '1' guard and the predicate turns on customers alone: customer 301's order 1 and customer 304's order 6 — the very type-0 rows that qualified them — are destroyed along with everything else they own. Same-table reads are the other worry: some engines refuse to read and modify one table in one breath and force a derived-table wrapper, but SQLite materializes the subquery before deleting a single row, so the direct form runs as written. The predicate is re-checked per row, which is why both of 304's backorders (orders 5 and 7) fall in the same statement — no first-match-only behavior exists.",
    ],
    edges: [
      "Scope-creep punisher: DELETE FROM Orders WHERE customer_id IN (SELECT customer_id FROM Orders WHERE order_type = '0') — no row-local arm — deletes the qualifying rows themselves (orders 1 and 6) along with the backorders, leaving only orders 3 and 4 of seven.",
      "Missing subquery filter: customer_id IN (SELECT customer_id FROM Orders) matches every customer who ordered at all, so order 4 dies although customer 303 never placed a type-0 row — the subquery must keep its own order_type = '0' arm.",
      "Under-deletion punisher: a first-match mental model that removes one backorder per qualifying customer would stop after order 5 and leave order 7 — the IN predicate re-tests every candidate row, and 304 owns two victims.",
      "The writeVerify SELECT (SELECT order_id FROM Orders ORDER BY order_id) grades the surviving table, so deleting too little or too much both fail: the expected survivors here are exactly orders 1, 3, 4 and 6.",
    ],
    ladder: [
      { title: "Brute force — two passes from the app", body: "Query the set of customers holding a type-0 row, then loop one DELETE per customer (or per row). Works, but it is N round trips, non-atomic, and races with concurrent writers between the read and the deletes." },
      { title: "The pattern — membership delete", body: "Fold both passes into one statement: the row-local guard order_type = '1' plus customer_id IN (the qualifying set). The subquery computes the customer-level property; the outer arms apply it row by row." },
      { title: "The optimal idea — row-local half, group half, stated separately", body: "O(n). The durable rule: a cross-row deletion is a row-local WHERE arm plus a membership subquery, written so each half is individually readable — and the row-local guard is never dropped, because a predicate about a customer is not a predicate about the row." },
    ],
    approach: "DELETE with the row-local guard order_type='1' plus customer_id IN (SELECT customers holding a type-0 row)",
    schema: {
      ddl: `CREATE TABLE Orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_type  TEXT NOT NULL CHECK (order_type IN ('0', '1')),  -- '0' standard | '1' backorder
  order_date  TEXT NOT NULL   -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO Orders (order_id, customer_id, order_type, order_date) VALUES
  (1, 301, '0', '2024-07-01'),  -- 301: the standard order that qualifies the customer
  (2, 301, '1', '2024-07-02'),  -- 301's backorder: DELETED (301 owns a type-0 row)
  (3, 302, '0', '2024-07-03'),  -- 302: type-0 only, nothing to delete
  (4, 303, '1', '2024-07-04'),  -- 303: backorder with NO type-0 history, so it survives
  (5, 304, '1', '2024-07-05'),  -- 304's first backorder: DELETED
  (6, 304, '0', '2024-07-06'),  -- 304's qualifying standard order; its backorders 5 and 7 BOTH die
  (7, 304, '1', '2024-07-07');`,
      tables: [
        { name: "Orders", note: "7 rows over 4 customers — 301 mixed, 302 type-0 only, 303 type-1 only, 304 with two backorders and one standard order" },
      ],
    },
    code: `DELETE FROM Orders
WHERE order_type = '1'                       -- row-local arm: only backorders are candidates
  AND customer_id IN (
      SELECT customer_id                     -- customers owning at least one standard order
      FROM Orders
      WHERE order_type = '0'                 -- materialized once before any row is touched
  );`,
    writeVerify: "SELECT order_id FROM Orders ORDER BY order_id;",
    walkthrough: [
      "The subquery scans all seven rows and returns {301, 304} — the only customers holding an order_type '0' row (orders 1 and 6). SQLite materializes that set before deleting anything.",
      "The outer scan then applies both arms per row: order 2 passes (backorder, owner 301 in the set), orders 5 and 7 pass (backorders, owner 304 in the set); order 4 fails the membership arm because 303 is absent from the set, and orders 1, 3 and 6 fail the row-local arm. Three rows are deleted.",
      "writeVerify ships the survivors in order_id order — 1, 3, 4, 6 — with customer 303's lone backorder still sitting in the table precisely because no standard order ever qualified its owner.",
    ],
    time: "O(n) — one pass to build the customer set, one pass to test and delete",
    space: "O(c) — one entry per qualifying customer",
    followUps: [
      "Flip the rule to 'delete every type 0 order of customers who have never placed a type 1 order' — which membership keyword flips, which rows survive on this seed, and what NULL trap does the flipped form carry?",
      "Rewrite the membership arm with EXISTS — which side does the correlated column bind to, and at what table size would you expect the uncorrelated IN to stop winning?",
    ],
    related: ["delete-duplicate-emails", "swap-salary", "customers-who-never-order"],
    // write problem: grading keys on the writeVerify result set, so "any"
    // (the DELETE statement itself carries no ORDER BY)
    order: "any",
    xp: 20,
  },
  {
    slug: "the-number-of-users-that-are-eligible-for-discount",
    statement:
      "Purchase logs one row per checkout: (purchase_id, user_id, purchase_date, amount). A user is eligible for a discount when they made at least one purchase with amount at least 1000 on exactly '2024-06-15' — both conditions on the same purchase. Report a single column eligible_users holding the NUMBER of distinct eligible users: one row, one integer.",
    examples: [
      {
        input: "user 502 checks out twice on 2024-06-15 — amounts 1000 and 1300",
        output: "the count grows by exactly 1 for user 502",
        explanation:
          "Both rows qualify, but the report counts users, not purchases — the pair collapses to one distinct user.",
      },
      {
        input: "user 503 checks out for 999 on 2024-06-15 and for 2000 on 2024-06-14",
        output: "no contribution to the count",
        explanation:
          "No single purchase carries both the campaign date and the threshold; the conditions pair per row, never across a user's history.",
      },
    ],
    constraints: [
      "eligibility is per purchase: purchase_date = '2024-06-15' AND amount >= 1000 must hold on one and the same row",
      "the output is the count of distinct qualifying users — one row, one column named eligible_users",
      "amount exactly 1000 qualifies (>= is inclusive); any date other than '2024-06-15' disqualifies regardless of amount",
    ],
    breakdown: [
      "Eligibility is a property of a purchase, and only afterwards of a user. SQL evaluates WHERE predicates row by row against the base table, so the honest first step is shrinking Purchase to the rows that carry both arms at once: purchase_date = '2024-06-15' AND amount >= 1000. Nothing user-shaped happens yet — user 503's history contains a 999 purchase on the day and a 2000 purchase the day before, and each of those rows fails one arm, so neither survives the shrink.",
      "After the filter, the rows overcount the unit the question asks about. The surviving set here holds three rows but only two users, because 502 checked out twice on the campaign day; COUNT(user_id) answers 3 and COUNT(DISTINCT user_id) answers 2. Counting is an act of choosing the measurement unit: the report is about people, so the aggregate must be told to deduplicate the person column. COUNT(DISTINCT ...) is the smallest possible expression of that choice.",
      "The tempting alternative is grouping users first and testing aggregates in HAVING — and it quietly changes the question. HAVING MAX(purchase_date) = '2024-06-15' AND MAX(amount) >= 1000 pairs two independent maxima: 503's newest purchase IS on the campaign day and its largest amount IS 2000, so the aggregate pairing declares 503 eligible even though no single row deserved it, inflating the count to 3. MAX over a column knows nothing about which row its value came from — the same blindness as any bare-column pairing. Same-row truth can only be enforced before grouping (WHERE) or by carrying row identity through the aggregate and testing the pair afterwards.",
    ],
    edges: [
      "The 999 boundary: user 503's 2024-06-15 row fails amount >= 1000 by a single unit — and the inclusivity matters in the other direction too, because user 502's amount-1000 row qualifies, which a strict > would wrongly drop.",
      "The DISTINCT trap is worth one whole count: three qualifying rows (501 once, 502 twice) make COUNT(user_id) report 3 where the truth is 2.",
      "A month-wide date LIKE '2024-06%' would promote user 503's 2000 purchase (2024-06-14), user 504's 2500 (2024-06-10) and user 506's 1500 (2024-06-16) into eligibility — the report would read 5 instead of 2, so the campaign day must be matched exactly, and TEXT dates make equality exact.",
      "Empty-eligibility safety: if nobody qualified, COUNT(DISTINCT ...) still ships one row holding 0 — the aggregate-over-nothing contract — rather than an empty result set.",
    ],
    ladder: [
      { title: "Brute force — a jot list of ids", body: "Read every purchase, note the user id of each row that carries both the campaign date and 1000 or more, then report how many distinct ids the list holds. Manual, but it names the two stages the SQL must reproduce: row filter, then distinct count." },
      { title: "The pattern — filter rows, count people", body: "WHERE purchase_date = '2024-06-15' AND amount >= 1000 shrinks the table to qualifying rows; COUNT(DISTINCT user_id) then counts people instead of rows." },
      { title: "The optimal idea — same-row truth before any grouping", body: "O(n). The durable rule: enforce same-row truth with WHERE before any grouping, then count the unit the question names — and never let HAVING pair per-column maxima, because an aggregate cannot remember which row its value came from." },
    ],
    approach: "Two-arm row filter (exact date + inclusive amount), then COUNT(DISTINCT user_id)",
    schema: {
      ddl: `CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  amount        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Purchase (purchase_id, user_id, purchase_date, amount) VALUES
  (1, 501, '2024-06-15', 1200),  -- qualifies: right day, 1200 >= 1000
  (2, 502, '2024-06-15', 1000),  -- qualifies: exactly at the inclusive boundary
  (3, 502, '2024-06-15', 1300),  -- qualifies again: same user, so DISTINCT must dedupe
  (4, 503, '2024-06-15', 999),   -- right day, one unit under the threshold
  (5, 504, '2024-06-10', 2500),  -- big amount, five days early
  (6, 505, '2024-06-15', 850),   -- right day, well under the threshold
  (7, 503, '2024-06-14', 2000),  -- 503 again: big amount but the wrong day
  (8, 506, '2024-06-16', 1500);`,
      tables: [
        { name: "Purchase", note: "8 checkouts over 6 users — 502 has two qualifying rows, 503 straddles the two arms (999 on the day, 2000 the day before)" },
      ],
    },
    code: `-- a single-row count; the ORDER BY keeps the exact-order contract uniform
SELECT COUNT(DISTINCT user_id) AS eligible_users
FROM Purchase
WHERE purchase_date = '2024-06-15'  -- arm 1: exact campaign day (TEXT equality)
  AND amount >= 1000                -- arm 2: inclusive threshold, SAME row
ORDER BY eligible_users;`,
    walkthrough: [
      "The WHERE shrinks eight rows to three: purchase 1 (501, 1200) and purchases 2 and 3 (502, 1000 and 1300), all on 2024-06-15. Purchase 4 (999) fails the amount arm by one unit; purchases 5, 7 and 8 fail the date arm; purchase 6 fails the amount arm.",
      "The three survivors cover exactly two distinct users — {501, 502} — because 502's pair collapses under DISTINCT. COUNT(user_id) would have answered 3 here.",
      "The aggregate ships one row: eligible_users = 2. User 503's split history never found a single row carrying both arms, and the HAVING-MAX pairing that would have admitted 503 is exactly the mistake the WHERE avoids.",
    ],
    time: "O(n) — one filtering pass, then a distinct count over the survivors",
    space: "O(u) — the distinct qualifying user ids held under the count",
    followUps: [
      "Report the eligible user ids themselves instead of the count — which part of the SELECT changes, and what must appear at the end for the grader's exact-order check?",
      "Count users eligible on ANY day of June 2024 — which arm loosens and how, and why does COUNT(DISTINCT user_id) still protect the answer?",
    ],
    related: ["user-activity-for-the-past-30-days-i", "customer-placing-the-largest-number-of-orders", "article-views-i"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "the-users-that-are-eligible-for-discount",
    statement:
      "The same Purchase table (purchase_id, user_id, purchase_date, amount) logs checkouts for the same '2024-06-15' campaign: a user is eligible when at least one purchase carries amount at least 1000 on that exact date. This time report the users THEMSELVES: one column user_id, one row per eligible user, ordered by user_id ascending. A user with several qualifying purchases appears exactly once.",
    examples: [
      {
        input: "user 502 checks out twice on 2024-06-15 — amounts 1000 and 1300",
        output: "one row: 502",
        explanation:
          "Both purchases qualify, but the output is a user list, not a purchase list — the dedup happens in the SELECT, and the pair ships once.",
      },
      {
        input: "user 503 checks out for 999 on 2024-06-15 and for 2000 on 2024-06-14",
        output: "503 does not appear",
        explanation:
          "No purchase of 503 carries both arms on one row; a user-level glance at their biggest amount and their latest date would wrongly include them.",
      },
    ],
    constraints: [
      "one row per eligible user — the twice-qualifying user 502 appears exactly once",
      "single column user_id, ordered ascending; the order is graded exactly",
      "eligibility is identical to the counting twin: purchase_date = '2024-06-15' AND amount >= 1000 on one row",
    ],
    breakdown: [
      "The row-level work is unchanged from the counting twin: WHERE purchase_date = '2024-06-15' AND amount >= 1000 keeps the rows that carry both arms. Nothing about eligibility loosens just because the answer is a list instead of a number. What changes is the projection — instead of folding survivors into a count, the query must emit the user ids themselves, deduplicated.",
      "DISTINCT and GROUP BY both deduplicate, and the choice is about what else the query owes. SELECT DISTINCT user_id is a pure collapse: it dedups the projected column and stops. GROUP BY user_id produces the same rows but opens the door to per-user aggregates — a sibling report that adds each user's qualifying total (502's pair sums 2300) is one keyword away. On this seed both forms ship exactly (501, 502); the engine plans differ marginally, and readability should decide.",
      "Ordering is part of the deliverable. Eligibility answers are sets, and sets ship in no particular order until an ORDER BY says otherwise — the grader compares rows in order, so ORDER BY user_id is not cosmetic. One DISTINCT subtlety: once you dedupe the projection, ORDER BY should reference selected expressions only, because a collapsed row no longer represents any single underlying purchase — ordering by a non-selected column would be ambiguous exactly when two different purchases collapse into one user.",
    ],
    edges: [
      "Forgetting DISTINCT prints user 502 twice — the qualifying pair (1000, 1300) doubles the row count and breaks the one-row-per-user contract.",
      "The same-row rule again: 503's 999 on the day plus 2000 the day before never combine — a HAVING MAX(purchase_date) = '2024-06-15' AND MAX(amount) >= 1000 grouping would wrongly list 503.",
      "The inclusive boundary has a body: 502's amount-1000 row is in the list, so a strict > would shrink the answer to 501 alone.",
      "The one-armed failures bracket the filter: 505's 850 on the right day and 504's 2500 five days early both stay out, and a month-wide LIKE would grow the list by 503, 504 and 506.",
    ],
    ladder: [
      { title: "Brute force — a hand-sorted list", body: "Scan purchases, note each user with a row carrying both the date and 1000 or more, and write the noted ids into a sorted list by hand, skipping repeats. The three manual disciplines — filter, dedupe, sort — map one-to-one onto the SQL." },
      { title: "The pattern — DISTINCT over the filtered projection", body: "WHERE both arms, then SELECT DISTINCT user_id; GROUP BY user_id is the drop-in equivalent when per-user aggregates enter the picture." },
      { title: "The optimal idea — filter, collapse, order — in that order", body: "O(n log u). The durable rule: a deduplicated listing is filter, collapse, order. DISTINCT collapses the projection; GROUP BY collapses and aggregates; and ORDER BY closes the contract only after the row set is final." },
    ],
    approach: "Two-arm row filter, then SELECT DISTINCT user_id with a result-level ORDER BY",
    schema: {
      ddl: `CREATE TABLE Purchase (
  purchase_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  purchase_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  amount        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Purchase (purchase_id, user_id, purchase_date, amount) VALUES
  (1, 501, '2024-06-15', 1200),  -- qualifies: right day, 1200 >= 1000
  (2, 502, '2024-06-15', 1000),  -- qualifies: exactly at the inclusive boundary
  (3, 502, '2024-06-15', 1300),  -- qualifies again: the list must ship 502 ONCE
  (4, 503, '2024-06-15', 999),   -- right day, one unit under the threshold
  (5, 504, '2024-06-10', 2500),  -- big amount, five days early
  (6, 505, '2024-06-15', 850),   -- right day, well under the threshold
  (7, 503, '2024-06-14', 2000),  -- 503 again: big amount but the wrong day
  (8, 506, '2024-06-16', 1500);`,
      tables: [
        { name: "Purchase", note: "the same 8 checkouts as the counting twin — 502 qualifies twice, 503 straddles the two arms, 504 and 506 fail on the date" },
      ],
    },
    code: `-- the grader reads the list in ascending user_id order
SELECT DISTINCT user_id             -- collapse repeat qualifiers (502 ships once)
FROM Purchase
WHERE purchase_date = '2024-06-15'  -- arm 1: exact campaign day
  AND amount >= 1000                -- arm 2: inclusive threshold on the SAME row
ORDER BY user_id;`,
    walkthrough: [
      "The filter keeps purchases 1, 2 and 3 — user 501 once and user 502 twice; 503's 999 and 505's 850 fail the amount arm, and 504, 503-again and 506 fail the date arm.",
      "DISTINCT collapses the three surviving rows onto their user ids: {501, 502}. GROUP BY user_id would land on the identical pair.",
      "ORDER BY user_id ships the list (501), (502) — the counting twin's answer 2, unfolded into the people it counts.",
    ],
    time: "O(n log u) — one filter pass plus dedup and sort over the surviving users",
    space: "O(u) — one row per eligible user",
    followUps: [
      "Carry each user's qualifying total beside the id — which keyword replaces DISTINCT, and what total does 502's pair (1000 + 1300) produce?",
      "Order by each user's LARGEST qualifying purchase instead of by id — why can that column not ride along a bare DISTINCT, and which form (GROUP BY with MAX, or a window over the filtered rows) makes it legal?",
    ],
    related: ["recyclable-and-low-fat-products", "article-views-i", "user-activity-for-the-past-30-days-ii"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "number-of-times-a-driver-was-a-passenger",
    statement:
      "User lists every account (user_id, user_name). Ride logs each trip as one row (ride_id, driver_id, passenger_id), and no ride ever has the same person on both sides — every row's passenger_id differs from its driver_id. For every user in User, report how many rides they rode as a PASSENGER — the number of Ride rows whose passenger_id is their id. Users who never sat as a passenger report 0, including users who only ever drive and users absent from Ride entirely. Output columns user_id, passenger_rides, ordered by user_id ascending.",
    examples: [
      {
        input: "user 901 drives ride 1 and sits as passenger on rides 2 and 3",
        output: "901 · 2",
        explanation:
          "Only the passenger rows count; driving ride 1 adds nothing to passenger_rides.",
      },
      {
        input: "user 905 exists in User but appears in no Ride row at all",
        output: "905 · 0",
        explanation:
          "The spine is the User table, so users absent from Ride still ship a row — the LEFT JOIN fills the ride side with NULL and COUNT reads NULLs as nothing.",
      },
    ],
    constraints: [
      "one row per User row, ordered by user_id; users with no passenger rides report 0 and never vanish",
      "the count covers Ride rows where the user is the passenger — driving history (901 drives ride 1, 902 drives ride 2) never adds to it",
      "no ride has passenger_id = driver_id (stated), so no ride can count for its own driver",
    ],
    breakdown: [
      "Decide the spine before touching the join. The question 'for every user' is a population question, and only the User table knows the whole population: user 905 appears in no ride whatsoever, so an aggregation over Ride could not even name them. FROM User LEFT JOIN Ride ON r.passenger_id = u.user_id keeps all five users and attaches each user's riding rows; unmatched users carry NULLs on the ride side. Building the spine as DISTINCT drivers UNION DISTINCT passengers would work too, but it is a two-step reconstruction of a table that already exists.",
      "The aggregate choice is the zero-case again. COUNT(r.passenger_id) counts non-NULL attachments only, so 902 and 905 — whose joined rows are all-NULL — count exactly 0, while 901's two attachments count 2. COUNT(*) counts the ROWS the LEFT JOIN kept, and an unmatched user still keeps one (the NULL-filled) row, so both zero cases would report 1. The one-column difference between two aggregates is the entire bug, and it only shows on users with no matches — which is exactly the users this report exists to include.",
      "What the count must NOT include is driving. The join key binds the ride side to the sitting role — switching it to r.driver_id = u.user_id produces the rides-DRIVEN report, which on this seed reads (1, 1, 1, 1, 0) instead of (2, 0, 1, 1, 0) and looks plausible until compared role by role. The no-self-ride guarantee removes one more ambiguity: a hypothetical (901, 901) row would otherwise count as a passenger ride for 901 while they drove, so the stated invariant is what lets the passenger join be the whole story.",
    ],
    edges: [
      "COUNT(*) punisher: users 902 and 905 report 1 instead of 0 — the NULL-filled LEFT JOIN row is still a row.",
      "Role-swap punisher: joining on r.driver_id = u.user_id ships (901, 1), (902, 1), (903, 1), (904, 1), (905, 0) — every driver credited with one driven ride, none with their passenger history.",
      "Population punisher: aggregating FROM Ride ships at most four groups and loses user 905 entirely — five output rows is the contract.",
      "Every Ride row has passenger_id != driver_id (rides 1 through 4 all satisfy it), so no user's own driving contaminates their passenger count; a self-ride row would need an explicit exclusion decision.",
    ],
    ladder: [
      { title: "Brute force — sweep per user", body: "For each user in the list, scan Ride and tally rows where passenger_id matches. Correct and quadratic per user, and it re-derives the population the User table already states." },
      { title: "The pattern — spine LEFT JOIN, count the matched column", body: "FROM User LEFT JOIN Ride ON r.passenger_id = u.user_id, GROUP BY u.user_id, COUNT(r.passenger_id): the join attaches riding history (or NULL), the count measures attachments, zeros included." },
      { title: "The optimal idea — population question, then measurement question", body: "O(u + r). The durable rule: separate who must appear (the spine) from what to count (the matched side), then count a ride-side column so NULLs read as zero. That is the general counts-with-zeros shape." },
    ],
    approach: "User-table spine LEFT JOIN Ride ON passenger_id, GROUP BY user, COUNT the ride-side column",
    schema: {
      ddl: `CREATE TABLE User (
  user_id   INTEGER PRIMARY KEY,
  user_name TEXT NOT NULL
);
CREATE TABLE Ride (
  ride_id      INTEGER PRIMARY KEY,
  driver_id    INTEGER NOT NULL,
  passenger_id INTEGER NOT NULL
);`,
      seed: `INSERT INTO User (user_id, user_name) VALUES
  (901, 'Ada'),
  (902, 'Bram'),
  (903, 'Cleo'),
  (904, 'Dov'),
  (905, 'Esme');
INSERT INTO Ride (ride_id, driver_id, passenger_id) VALUES
  (1, 901, 904),  -- Ada drives Dov: counts for 904 only
  (2, 902, 901),  -- Bram drives Ada: passenger hit 1 of 2 for 901
  (3, 903, 901),  -- Cleo drives Ada: passenger hit 2 of 2 for 901
  (4, 904, 903);`,
      tables: [
        { name: "User", note: "5 users — the full population the report must name, including 905 who is in no ride" },
        { name: "Ride", note: "4 rides, no self-rides — 902 only ever drives, 905 appears in no row at all" },
      ],
    },
    code: `SELECT
    u.user_id,
    COUNT(r.passenger_id) AS passenger_rides  -- matched rows only; NULLs read as 0
FROM User u
LEFT JOIN Ride r
  ON r.passenger_id = u.user_id               -- the SITTING role, never the driving one
GROUP BY u.user_id
ORDER BY u.user_id;`,
    walkthrough: [
      "The spine keeps all five users; the LEFT JOIN attaches riding rows only where passenger_id matches: 901 attracts rides 2 and 3, 903 attracts ride 4, 904 attracts ride 1, while 902 and 905 keep a NULL ride side.",
      "COUNT(r.passenger_id) per user: 901 gives 2, 903 and 904 give 1, and the NULL rows count as nothing, so 902 and 905 give 0. Nobody's driving (901 drove ride 1, 902 drove ride 2) adds a single unit.",
      "ORDER BY user_id ships (901, 2), (902, 0), (903, 1), (904, 1), (905, 0) — five rows for five users, with COUNT(*) having wrongly promised 1 for both zero cases.",
    ],
    time: "O(u + r) — one pass over rides to attach, one grouped pass to count",
    space: "O(u) — one output row per user",
    followUps: [
      "Report rides DRIVEN beside rides SAT as two columns — why can two LEFT JOINs onto the same Ride table not simply be stacked (fan-out), and how does pre-aggregating each role into its own CTE fix the arithmetic?",
      "Restrict the report to users who have driven at least once — which filter changes the spine, and does 905 still ship a row?",
    ],
    related: ["top-travellers", "the-number-of-employees-which-report-to-each-employee", "friend-requests-ii-who-has-the-most-friends"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "product-sales-analysis-iv",
    statement:
      "Sales records each purchase as one row (sale_id, product_id, buyer_id, quantity, sale_date); Product lists each catalog item (product_id, name). For every buyer, report the product they bought the MOST of across all their sales, measured by TOTAL quantity — columns buyer_id, product_name, one row per buyer, ordered by buyer_id ascending. When a buyer's top totals tie, the LOWEST product_id wins; the seed contains one such tie and the rule decides it.",
    examples: [
      {
        input:
          "buyer 701 buys product 10 for 5 units on 2024-09-01 and 3 units on 2024-09-03, and product 20 for 7 units on 2024-09-02",
        output: "701 · Espresso",
        explanation:
          "Totals 8 against 7 — the margin of exactly 1 exists only after SUMming; no single sale row carries the winning 8.",
      },
      {
        input: "buyer 703 buys product 20 for 4 then 2 units, and product 40 for 6 units",
        output: "703 · Grinder",
        explanation:
          "6 against 6 — the stated lowest-product_id rule picks product 20 (Grinder) over product 40 (Mug).",
      },
    ],
    constraints: [
      "one row per buyer present in Sales, ordered by buyer_id ascending",
      "ranking is over per-product total quantity within each buyer; ties resolve to the lowest product_id",
      "the output column is product_name joined from Product — the raw product_id never ships",
    ],
    breakdown: [
      "The problem stacks two grains. Sales is one row per purchase; the ranking unit is one row per (buyer, product) — so the first stage groups by buyer and product and SUMs quantity. Only then does a second, buyer-level comparison make sense: which of a buyer's product totals is largest. Skipping the first stage and scanning raw rows would rank by single-sale quantities, and 701's winner (8 total across two sales) is invisible in any single row.",
      "Turning 'the product of the maximum total' into SQL is the top-1-per-group shape. ROW_NUMBER() OVER (PARTITION BY buyer_id ORDER BY total_qty DESC, product_id ASC) numbers each buyer's product rows from the best; keeping rn = 1 names the winner. The second ORDER BY key is not decoration: buyer 703's two totals are equal at 6, and without the product_id tie-break ROW_NUMBER's choice between Grinder and Mug is engine-fate — the stated rule must live in the window's ORDER BY to be real.",
      "The alternative that fails instructively is asking MAX to carry identity. MAX(total_qty) answers 'how much' but never 'which product'; a bare product_id beside it in the same SELECT is borrowed from an unspecified row of the group. SQLite's single-aggregate quirk happens to pair them correctly when there is exactly one aggregate — and stays silent about which peer it chose when 703's totals tie, and breaks the moment any second aggregate or join enters the SELECT. The name adds one more dependency: it lives in Product, so the winner row must be joined back to Product AFTER the ranking, not during it.",
    ],
    edges: [
      "The tie is the test: 703's product 20 (4 + 2) and product 40 (6) both total 6 — an ORDER BY total_qty DESC alone leaves rn = 1 arbitrary between Grinder and Mug; the product_id ASC key pins Grinder.",
      "The margin-1 winner is invisible per row: 701's product 10 wins with total 8 (5 + 3) while the single largest sale is product 20's 7 — a query ranking by per-row quantity ships Grinder and is wrong.",
      "Single-product buyer: 704 bought only product 40 (9 units) — the window holds one row for that buyer and still ships a rn = 1; no special case is needed, but a HAVING COUNT(*) > 1 filter would drop 704 from the report.",
      "The bare-MAX quirk: SELECT buyer_id, product_id, MAX(total_qty) FROM totals GROUP BY buyer_id returns the right pairing on SQLite here — except 703's tie, where the engine owes no particular row, so the portability lesson stands.",
    ],
    ladder: [
      { title: "Brute force — a ledger per buyer", body: "For each buyer, walk their sales accumulating per-product totals, then scan the ledger for the largest (lowest id on ties). Two nested accumulations the engine expresses as a grouped CTE plus a numbered window." },
      { title: "The pattern — grouped totals, then top-1 per buyer", body: "GROUP BY buyer_id, product_id with SUM builds the totals; ROW_NUMBER() OVER (PARTITION BY buyer_id ORDER BY total_qty DESC, product_id) ranks them; rn = 1 keeps each buyer's winner." },
      { title: "The optimal idea — argmax with the tie rule inside the window", body: "O(s log s). The durable rule: an argmax over a grouped value is a top-1-per-group — and the tie-break must be an explicit key inside the ORDER BY, because a bare MAX returns a number without identity and the engine's peer choice on ties is nobody's contract." },
    ],
    approach: "Per-(buyer, product) SUM in a CTE, ROW_NUMBER over buyer with (total DESC, product_id ASC), keep rn=1, join names",
    schema: {
      ddl: `CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  buyer_id   INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  sale_date  TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE Product (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, name) VALUES
  (10, 'Espresso'),
  (20, 'Grinder'),
  (30, 'Kettle'),
  (40, 'Mug');
INSERT INTO Sales (sale_id, product_id, buyer_id, quantity, sale_date) VALUES
  (1, 10, 701, 5, '2024-09-01'),  -- 701 / p10 leg 1 of 2 (total 8)
  (2, 20, 701, 7, '2024-09-02'),  -- 701's single largest sale, yet the LOSER (7 < 8)
  (3, 10, 701, 3, '2024-09-03'),  -- 701 / p10 leg 2 of 2: winner by margin 1
  (4, 30, 702, 6, '2024-09-01'),
  (5, 10, 702, 2, '2024-09-02'),
  (6, 30, 702, 4, '2024-09-04'),  -- 702: p30 totals 10 against p10's 2
  (7, 20, 703, 4, '2024-09-02'),  -- 703 / p20 leg 1 of 2
  (8, 40, 703, 6, '2024-09-03'),  -- the tie partner: p40 totals 6
  (9, 20, 703, 2, '2024-09-05'),  -- 703: p20 6 == p40 6, lowest id 20 wins
  (10, 40, 704, 9, '2024-09-06');`,
      tables: [
        { name: "Sales", note: "10 sales over 4 buyers — 701 wins by margin 1, 703 ties 6-6 (lowest id decides), 704 bought a single product" },
        { name: "Product", note: "4 catalog items whose names the answer joins back for" },
      ],
    },
    code: `WITH totals AS (
    SELECT
        buyer_id,
        product_id,
        SUM(quantity) AS total_qty        -- spend per (buyer, product) pair
    FROM Sales
    GROUP BY buyer_id, product_id
),
ranked AS (
    SELECT
        buyer_id,
        product_id,
        ROW_NUMBER() OVER (
            PARTITION BY buyer_id
            ORDER BY total_qty DESC, product_id ASC   -- lowest id breaks ties
        ) AS rn
    FROM totals
)
SELECT
    rk.buyer_id,
    p.name AS product_name               -- the display name joins back at the end
FROM ranked rk
JOIN Product p ON p.product_id = rk.product_id
WHERE rk.rn = 1                          -- each buyer's single best product
ORDER BY rk.buyer_id;`,
    walkthrough: [
      "The totals CTE folds ten sales into nine (buyer, product) groups: 701 holds 10:8 and 20:7; 702 holds 30:10 and 10:2; 703 holds 20:6 and 40:6; 704 holds 40:9.",
      "The window ranks each buyer's groups: rn = 1 lands on 701's product 10, 702's product 30, 703's product 20 (the 6-6 tie broken toward the lower id) and 704's product 40.",
      "The join to Product swaps ids for names and ORDER BY buyer_id ships (701, Espresso), (702, Kettle), (703, Grinder), (704, Mug) — one row per buyer, tie decided, margin-1 winner intact.",
    ],
    time: "O(s log s) — grouping pass plus a partitioned sort for the numbering",
    space: "O(g) — one row per (buyer, product) group held through the ranking",
    followUps: [
      "Report each buyer's top TWO products beside their totals — which constant changes, and what does 702's second-place row become?",
      "Detect buyers whose favorite product changed between the first and second half of the month — how does the partition key grow, and does the tie rule survive per period?",
    ],
    related: ["product-sales-analysis-i", "product-sales-analysis-iii", "market-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "product-sales-analysis-v",
    statement:
      "The same Sales table (sale_id, product_id, buyer_id, quantity, sale_date) feeds a leaderboard: rank buyers by the TOTAL quantity they purchased across all their sales and report the top two. Output columns buyer_id, total_quantity, ordered by total_quantity descending, then buyer_id ascending for equal totals. The seed contains one such tie — and it sits exactly at the boundary the LIMIT cuts, so the stated rule decides who takes second place.",
    examples: [
      {
        input: "buyer 801 buys 12 units of product 10 and 13 units of product 20",
        output: "801 · 25",
        explanation:
          "The two sales merge into one total under GROUP BY, and 25 tops the board.",
      },
      {
        input: "buyers 802 and 803 both total 19 — 802 across two sales, 803 in one 19-unit sale",
        output: "802 takes second place; 803 misses the cut",
        explanation:
          "Equal totals fall back to ascending buyer_id, so the shipped pair is (801, 802).",
      },
    ],
    constraints: [
      "exactly two rows output; total_quantity is the buyer's SUM(quantity) across all their sales",
      "ordered by total_quantity DESC then buyer_id ASC — both keys are graded exactly",
      "the cut is LIMIT 2 applied AFTER the full ordering; a tie at the boundary resolves by the second key",
    ],
    breakdown: [
      "The leaderboard is an aggregate ranking, and aggregation comes first: GROUP BY buyer_id with SUM(quantity) collapses the sales into one row per buyer. Here seven sales fold into four buyers — 801 to 25, 802 to 19, 803 to 19, 804 to 8. Nothing is filtered yet; the ranking operates on the grouped rows, which is why LIMIT in the outer query is safe: it cuts aggregate rows, not underlying sales.",
      "The cut is an ordered cut. ORDER BY total_quantity DESC, buyer_id ASC sorts the four groups by the stated contract, and LIMIT 2 keeps the first two — sorting fully precedes limiting, so the second key is not decoration. 802 and 803 tie at 19, and that tie sits at the boundary: without buyer_id ASC, which of them survives LIMIT 2 is engine-fate. The general law is that any nondeterminism INSIDE the LIMIT window must be resolved by an explicit key before the query is trustworthy.",
      "ORDER BY accepts the SELECT alias (ORDER BY total_quantity) or the recomputed aggregate (ORDER BY SUM(quantity) DESC) — SQLite resolves both to the same values. The form that fails is a bare column: ORDER BY quantity with GROUP BY borrows one arbitrary row's quantity per group, so 803's lone 19-unit sale tops a board where 801's group shows 12 or 13 — the shipped pair becomes (803, 801) instead of (801, 802), a fully plausible wrong answer. Name the aggregated value and order by that name.",
    ],
    edges: [
      "The boundary tie: 802's 19 (two sales) against 803's 19 (one sale) — ORDER BY total_quantity DESC alone makes the second row engine-fate; buyer_id ASC pins 802 and pushes 803 out of the LIMIT.",
      "Bare-column ORDER BY punisher: ordering by quantity (a raw sale row) ranks 803's single 19 first and 801's arbitrary 12 or 13 second — the pair (803, 801) ships instead of (801, 802).",
      "Totals compare SUMs, not rows: 803 reaches 19 with a single sale while 802 needs two — a COUNT-based board (2, 2, 1, 2) would rank 804 above 803 and shuffle the leaders entirely.",
      "Ties at the cut are dropped, not both kept: 803's total equals 802's but LIMIT 2 ships one row of the pair; a report that must include all tied buyers switches to RANK() OVER (ORDER BY total_quantity DESC) <= 2 and grows to three rows.",
    ],
    ladder: [
      { title: "Brute force — a hand ledger", body: "Add up each buyer's quantities on paper, sort the totals, read off the top two and break the 19-19 tie by hand. The engine does all three steps with one GROUP BY, one ORDER BY and one LIMIT." },
      { title: "The pattern — group, sort by the stated keys, cut", body: "GROUP BY buyer_id with SUM(quantity) builds the totals; ORDER BY total_quantity DESC, buyer_id ASC imposes the full contract; LIMIT 2 keeps the podium." },
      { title: "The optimal idea — the tie-break lives inside the ORDER BY", body: "O(n + b log b). The durable rule: LIMIT is only as deterministic as the ORDER BY above it — every tie that could straddle the cut needs an explicit secondary key, and the ORDER BY should name the aggregate (alias or re-computed SUM), never a bare column." },
    ],
    approach: "GROUP BY buyer with SUM(quantity), ORDER BY total DESC then buyer_id ASC, LIMIT 2",
    schema: {
      ddl: `CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  buyer_id   INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  sale_date  TEXT NOT NULL  -- 'YYYY-MM-DD'
);
CREATE TABLE Product (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, name) VALUES
  (10, 'Espresso'),
  (20, 'Grinder'),
  (30, 'Kettle'),
  (40, 'Mug');
INSERT INTO Sales (sale_id, product_id, buyer_id, quantity, sale_date) VALUES
  (1, 10, 801, 12, '2024-10-01'),  -- 801 leg 1: 12
  (2, 20, 801, 13, '2024-10-02'),  -- 801 leg 2: total 25, the clear leader
  (3, 30, 802, 11, '2024-10-01'),  -- 802 leg 1: 11
  (4, 10, 802, 8, '2024-10-03'),   -- 802 leg 2: total 19 across two sales
  (5, 40, 803, 19, '2024-10-02'),  -- 803: 19 in ONE sale — the tie partner
  (6, 20, 804, 3, '2024-10-01'),
  (7, 30, 804, 5, '2024-10-04');`,
      tables: [
        { name: "Sales", note: "7 sales over 4 buyers — totals 25, 19, 19, 8 with the 19-19 tie straddling the LIMIT 2 boundary" },
        { name: "Product", note: "same 4 catalog items; the leaderboard itself never shows product data" },
      ],
    },
    code: `-- the LIMIT cut runs AFTER the full ordering
SELECT
    buyer_id,
    SUM(quantity) AS total_quantity     -- the grouped value the board ranks by
FROM Sales
GROUP BY buyer_id
ORDER BY total_quantity DESC,           -- the leaderboard key
         buyer_id ASC                   -- the tie-break: 19 vs 19 decided here
LIMIT 2;`,
    walkthrough: [
      "GROUP BY folds seven sales into four buyers: 801 gives 12 + 13 = 25, 802 gives 11 + 8 = 19, 803 gives 19 in one sale, 804 gives 3 + 5 = 8.",
      "ORDER BY total_quantity DESC, buyer_id ASC lines them up 25, then 19 (802), then 19 (803), then 8 — the equal 19s split toward the lower id.",
      "LIMIT 2 ships (801, 25), (802, 19): 803 misses by the stated rule despite the equal total, and 804's 8 never contended.",
    ],
    time: "O(n + b log b) — one grouped pass over sales, then a sort of the b buyer totals",
    space: "O(b) — one aggregated row per buyer",
    followUps: [
      "Keep every buyer tied at the cut — which window function replaces LIMIT, and how many rows ship on this seed?",
      "Print a rank column beside the totals for ALL buyers — does DENSE_RANK merge the two 19s or leave a gap, and what rank does 804 carry?",
    ],
    related: ["product-sales-analysis-ii", "top-travellers", "customer-placing-the-largest-number-of-orders"],
    order: "exact",
    xp: 10,
  },
];
