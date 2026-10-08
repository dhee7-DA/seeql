// Deep-dives — LeetCode Premium batch I: time windows (6 problems, 3 Medium / 3 Hard). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM_TIME: LcSqlDive[] = [
  {
    slug: "leetflex-banned-accounts",
    statement:
      "LogInfo records streaming sessions: one row per session with the account, the IP address it connected from, and the login and logout timestamps. An account is banned when two of its sessions OVERLAP in time while coming from DIFFERENT IP addresses — sessions that merely touch (one logs out at the exact moment the other logs in) count as overlapping. Report each banned account once as account_id, ordered by account_id ascending.",
    examples: [
      {
        input:
          "account 9: session A from 10.0.0.4 logged in 09:00, out 09:40 · session B from 77.1.2.3 logged in 09:20, out 10:05",
        output: "(9)",
        explanation:
          "A and B overlap for twenty minutes from different IPs — one qualifying pair is enough to ban the account, and DISTINCT collapses the evidence to a single row.",
      },
      {
        input:
          "account 6: session A from 10.0.0.4 logged in 09:00, out 09:40 · session B from 10.0.0.4 logged in 09:30, out 10:10",
        output: "(no rows)",
        explanation:
          "The sessions overlap, but both came from the SAME address — a physical device does not teleport, so identical-IP overlap is legitimate and never bans.",
      },
    ],
    constraints: [
      "overlap is tested with a.login <= b.logout AND b.login <= a.logout — touching endpoints count as overlapping",
      "only pairs from DIFFERENT ip_address values count; same-IP overlap is legitimate and ignored",
      "output is distinct account_id values ascending — an account with many offending pairs still appears once",
    ],
    breakdown: [
      "The evidence for a ban is a PAIR of sessions, and pairs do not exist in the table — every row only knows its own interval. A self-join on account_id manufactures the pairs: alias the table as a and b, keep only rows sharing an account, and each surviving combination becomes a candidate overlap. The join is deliberately scoped to account_id equality, so an account's sessions are probed only against themselves and cross-account coincidences can never leak into the result. Every further condition simply narrows which pairs count as evidence.",
      "The overlap test is the classic closed-interval predicate: a.login <= b.logout AND b.login <= a.logout. Two intervals fail to overlap only when one ends strictly before the other starts, and negating that disjunction yields <= on both sides. The rule says touching sessions count — one session's logout at the exact second of the other's login — so both comparisons are <=, never <. Getting this backwards is the silent killer: a strict < passes every seed row whose ban comes from genuinely nested sessions and quietly drops only the touching pair, the hardest kind of bug to spot in review.",
      "The remaining guard is the IP condition: a.ip_address <> b.ip_address. It does double duty — it implements the different-address rule, and it kills the degenerate pair where a session is joined to itself, because a row's address always equals its own. Same-IP overlaps fail this guard and vanish, which is exactly the planted trap in the seed: account 2's sessions overlap heavily but both carry one address, so nothing reports. Finally DISTINCT squashes the result, because the question is about accounts and not pairs — one account can produce several qualifying pairs, and the report wants each account_id exactly once, ordered ascending.",
    ],
    edges: [
      "Account 2 is the trap: its two sessions overlap for twenty minutes but share one IP — the <> guard filters the pair, so the account never appears.",
      "Account 3's sessions touch at 09:00:00 exactly (one logs out as the other logs in) from different IPs — both <= comparisons hold, so the account IS banned.",
      "Account 1 also has a late-night session reusing a daytime address — that same-IP pair is probed and discarded, proof the join sees it and the predicate rejects it.",
      "DISTINCT matters: account 1's three offending pairs would otherwise print three identical ids and break the one-row-per-account contract.",
    ],
    ladder: [
      { title: "Brute force — compare every pair in code", body: "Pull all sessions per account, compare every two intervals in application code, and remember which accounts produced a cross-IP hit. Correct, but quadratic per account and the touching-endpoints rule is one character away from being lost in a strict less-than." },
      { title: "The pattern — a self-join builds the pairs", body: "Join LogInfo to itself on account_id with the two <= comparisons and the IP inequality in the ON clause. The database does the pairwise probing, and each surviving row IS a piece of ban evidence." },
      { title: "The optimal idea — DISTINCT collapses evidence to accounts", body: "The report asks about accounts, not pairs, so SELECT DISTINCT account_id over the join. Worst-case quadratic within an account but tiny constant work per pair — a window pass would not beat the join's simplicity here." },
    ],
    approach: "Self-join LogInfo on account_id with a closed-interval overlap test and differing IPs, then DISTINCT the account ids",
    schema: {
      ddl: `CREATE TABLE LogInfo (
  log_id     INTEGER PRIMARY KEY,
  account_id INTEGER NOT NULL,
  ip_address TEXT NOT NULL,
  login      TEXT NOT NULL,
  logout     TEXT NOT NULL
);`,
      seed: `INSERT INTO LogInfo (log_id, account_id, ip_address, login, logout) VALUES
  (1, 1, '10.0.14.7',    '2024-03-01 08:10:00', '2024-03-01 08:55:00'),
  (2, 1, '88.12.9.40',   '2024-03-01 08:30:00', '2024-03-01 09:20:00'),  -- overlaps session 1 from another IP
  (3, 1, '203.0.113.9',  '2024-03-01 08:40:00', '2024-03-01 09:05:00'),  -- overlaps 1 and 2 too: three pairs
  (4, 1, '10.0.14.7',    '2024-03-01 21:00:00', '2024-03-01 22:10:00'),  -- same IP as session 1: pair rejected
  (5, 2, '172.16.4.2',   '2024-03-01 10:00:00', '2024-03-01 10:40:00'),  -- overlaps session 6, but SAME ip
  (6, 2, '172.16.4.2',   '2024-03-01 10:20:00', '2024-03-01 11:05:00'),  -- the trap: overlap without different IPs
  (7, 3, '51.7.203.1',   '2024-03-01 08:00:00', '2024-03-01 09:00:00'),  -- ends exactly when session 8 begins
  (8, 3, '44.9.180.66',  '2024-03-01 09:00:00', '2024-03-01 10:15:00'),  -- touching endpoints still count
  (9, 4, '66.249.66.1',  '2024-03-01 07:00:00', '2024-03-01 07:50:00'),  -- account 4 stays clean: gaps everywhere
  (10, 4, '198.51.100.5','2024-03-01 08:10:00', '2024-03-01 08:35:00'),
  (11, 4, '66.249.66.1', '2024-03-01 12:00:00', '2024-03-01 12:30:00');`,
      tables: [
        { name: "LogInfo", note: "11 sessions for 4 accounts — account 1: three cross-IP overlapping pairs plus a rejected same-IP night session; account 2: heavy overlap from ONE address (the trap); account 3: two sessions touching at 09:00:00 exactly; account 4: clean, well-separated sessions" },
      ],
    },
    code: `SELECT DISTINCT a.account_id              -- one row per banned account, however many pairs proved it
FROM LogInfo a
JOIN LogInfo b
  ON a.account_id  = b.account_id         -- pair sessions within the SAME account only
 AND a.ip_address <> b.ip_address         -- different addresses required; also kills the a = b self-pair
 AND a.login      <= b.logout             -- closed-interval overlap: touching endpoints count
 AND b.login      <= a.logout
ORDER BY a.account_id;`,
    walkthrough: [
      "The self-join pairs account 1's four sessions six ways: sessions 1, 2 and 3 mutually overlap from three different addresses — three surviving pairs — while the pair (1, 4) is discarded because both carry 10.0.14.7 and every pair involving the 21:00 session fails the time test.",
      "Account 2's sessions 5 and 6 overlap from 10:20 to 10:40, but both carry 172.16.4.2, so the IP inequality rejects the pair and account 2 never appears. Account 3's sessions 7 and 8 touch at exactly 09:00:00 — a.login 08:00 <= b.logout 10:15 and b.login 09:00 <= a.logout 09:00 both hold — so the touching pair survives.",
      "Account 4's sessions are separated by gaps (07:50 → 08:10 → 12:00) and produce nothing. DISTINCT collapses account 1's three pairs and account 3's single pair into one row each: (1) then (3), ordered by account id.",
    ],
    time: "O(p) — one probe of every same-account session pair p (n² worst case inside an account); each probe is four cheap comparisons",
    space: "O(k) — the qualifying pairs before DISTINCT, k of them",
    followUps: [
      "Report the number of offending pairs per banned account alongside the id — how does replacing SELECT DISTINCT with a GROUP BY change the shape, and what does the count mean?",
      "Tighten the rule to sessions overlapping by at least five minutes — express the margin with julianday() arithmetic and recheck whether the touching seed pair still qualifies.",
    ],
    related: ["create-a-session-bar-chart", "second-most-recent-activity"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "maximum-transaction-each-day",
    statement:
      "Movements records account activity: each row is a deposit or a withdrawal with its amount and the calendar day it happened. For every day, find the single largest transaction amount of EITHER kind, then report every transaction that reaches it — a day whose maximum is attained twice contributes two rows. Output the columns day, txn_id and amount, ordered by day ascending and then txn_id ascending.",
    examples: [
      {
        input: "2024-11-03: deposit 900 (txn 1) · withdrawal 900 (txn 2) · deposit 250 (txn 3)",
        output: "(2024-11-03,1,900) · (2024-11-03,2,900)",
        explanation:
          "The day's max is 900 and two transactions hit it — kind plays no role, so a deposit and a withdrawal tie and BOTH are reported.",
      },
      {
        input: "2024-11-04: deposit 300 (txn 4) · withdrawal 1200 (txn 5) · withdrawal 700 (txn 6)",
        output: "(2024-11-04,5,1200)",
        explanation:
          "The maximum belongs to a withdrawal — MAX over amount ignores kind entirely, so deposits never win by default.",
      },
    ],
    constraints: [
      "the per-day maximum is taken over amount alone; kind (deposit or withdrawal) is never filtered",
      "every transaction equal to its day's maximum is reported — ties always produce multiple rows",
      "output ordered by day ascending, then txn_id ascending; single-transaction days report that one row",
    ],
    breakdown: [
      "This is an argmax with a join-back: first learn each day's maximum, then return the rows that attain it. The window form does it in one pass — MAX(amount) OVER (PARTITION BY day) computes the day's peak for EVERY row while keeping the row intact, so each transaction learns how its own amount compares to its day's best. Partitioning by day alone is the whole trick: kind is deliberately absent from the partition, because a withdrawal of 1200 must outrank a deposit of 300 inside the same day.",
      "The filter amount = day_peak then keeps exactly the transactions that hit the peak. An equality test — not a top-1 ranking — is what makes ties behave: two rows sharing the day's maximum both satisfy the predicate and both survive, which a ROW_NUMBER() = 1 formulation would wrongly collapse to one. The amount is an INTEGER column, so the equality is exact — no float-epsilon hand-wringing, and the comparison is stable across engines.",
      "Determinism is the last concern: the two tied transactions of one day differ in txn_id, so ORDER BY day, txn_id pins their relative order and the output is byte-stable across runs. The tiebreaker costs nothing — the id is already in the row — yet it is the difference between a graded report and a flaky one. Note what the seed also plants: a single-transaction day whose one row is trivially its own maximum, and a day whose peak is a withdrawal — both guard against an unconscious WHERE kind = 'deposit' habit or a MAX computed over the wrong grain.",
    ],
    edges: [
      "2024-11-03 ties at 900 across a deposit AND a withdrawal — the equality filter keeps both; a ROW_NUMBER() = 1 would have kept one and broken the tie contract.",
      "2024-11-04's peak is a withdrawal (1200) — filtering by kind, or anchoring on deposits, loses the day's true maximum.",
      "2024-11-06 has a single transaction (450) — it is its own day's maximum and reports exactly one row.",
      "amount is an INTEGER column, so amount = day_peak is an exact comparison — no rounding concerns anywhere.",
    ],
    ladder: [
      { title: "Brute force — two passes and a stitch", body: "GROUP BY day to collect each day's max into a temp table, then join Movements back on (day, max). Two scans and an explicit join — correct, just more machinery than the problem needs." },
      { title: "The pattern — a window computes the peer group", body: "MAX(amount) OVER (PARTITION BY day) annotates every row with its day's peak in one ordered pass, leaving the row's own values untouched for the comparison that follows." },
      { title: "The optimal idea — filter by equality, keep ties", body: "WHERE amount = day_peak selects the argmax set in one statement. O(n log n) for the partition sort; ties survive by construction because nothing ranks rows — it tests membership." },
    ],
    approach: "Annotate every transaction with MAX(amount) OVER (PARTITION BY day), then keep rows whose amount equals their day's peak",
    schema: {
      ddl: `CREATE TABLE Movements (
  txn_id INTEGER PRIMARY KEY,
  day    TEXT NOT NULL,
  kind   TEXT NOT NULL CHECK (kind IN ('deposit','withdrawal')),
  amount INTEGER NOT NULL
);`,
      seed: `INSERT INTO Movements (txn_id, day, kind, amount) VALUES
  (1, '2024-11-03', 'deposit', 900),
  (2, '2024-11-03', 'withdrawal', 900),  -- ties txn 1 at the day's max: BOTH report
  (3, '2024-11-03', 'deposit', 250),
  (4, '2024-11-04', 'deposit', 300),
  (5, '2024-11-04', 'withdrawal', 1200), -- the day's peak is a withdrawal
  (6, '2024-11-04', 'withdrawal', 700),
  -- 2024-11-06 holds a single transaction: trivially its own maximum
  (7, '2024-11-06', 'deposit', 450);`,
      tables: [
        { name: "Movements", note: "7 transactions over 3 days — 2024-11-03 ties at 900 across a deposit and a withdrawal, 2024-11-04 peaks at a 1200 withdrawal, 2024-11-06 holds a lone 450 deposit" },
      ],
    },
    code: `WITH flagged AS (
    SELECT
        day,
        txn_id,
        amount,
        MAX(amount) OVER (PARTITION BY day) AS day_peak  -- every row learns its day's maximum
    FROM Movements
)
SELECT day, txn_id, amount
FROM flagged
WHERE amount = day_peak          -- equality keeps EVERY transaction at the peak — ties included
ORDER BY day, txn_id;`,
    walkthrough: [
      "flagged annotates all seven rows: the three 2024-11-03 rows all see day_peak 900, the three 2024-11-04 rows see 1200, and the lone 2024-11-06 row sees 450.",
      "The equality filter keeps (2024-11-03, 1, 900) and (2024-11-03, 2, 900) — one deposit, one withdrawal — plus (2024-11-04, 5, 1200) and (2024-11-06, 7, 450); txns 3, 4 and 6 fall below their day's peak and drop.",
      "ORDER BY day, txn_id lays out the four survivors day by day, breaking the 900 tie by id: 1 before 2.",
    ],
    time: "O(n log n) — one partitioned sort feeds the window MAX; the filter is a linear pass",
    space: "O(n) — the annotated copy of Movements",
    followUps: [
      "Report each day's peak transaction AND the running account balance after it — which window frame makes the running total safe when deposits and withdrawals share one column?",
      "Return only the single largest transaction across ALL days, breaking ties by earliest day — how does the ranking change when the partition disappears?",
    ],
    related: ["second-most-recent-activity", "sales-by-day-of-the-week", "monthly-transactions-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "users-with-two-purchases-within-seven-days",
    statement:
      "Purchases logs one row per purchase with the buyer's id and the purchase date; users may buy several times, even twice on one day. A user qualifies when two of their purchases fall on DIFFERENT dates no more than 7 days apart — strictly more than 0 days between the dates and at most 7. Report the qualifying user_id values without duplicates, ordered ascending.",
    examples: [
      {
        input: "user 21 buys on 2024-06-01 and again on 2024-06-08",
        output: "(21)",
        explanation:
          "Exactly 7 days separate the dates — the window is inclusive at the far end, so the boundary pair qualifies.",
      },
      {
        input: "user 22 buys twice on 2024-06-05 and never on any other day",
        output: "(no rows)",
        explanation:
          "Same-day purchases sit 0 days apart, and the gap must be strictly greater than 0 — distinct dates are required, however many rows a day holds.",
      },
    ],
    constraints: [
      "the day gap between the two dates satisfies 0 < gap <= 7 — 8 days apart is already too late",
      "the two purchases must be on DIFFERENT dates; a same-day double buy never qualifies",
      "output is distinct user_id values ascending — a user with many close pairs still appears once",
    ],
    breakdown: [
      "Like any problem about two rows related by a condition, the pairs must be manufactured: a self-join of Purchases to itself on user_id produces every same-user pair of purchases. Each pair then faces the date test — julianday(b.purchase_date) − julianday(a.purchase_date) — because SQLite has no DATEDIFF; julianday turns a 'YYYY-MM-DD' string into a Julian day number, and the subtraction of two date-only values yields whole days. The join key is user_id alone, so pairing never crosses buyers and every candidate pair is honest.",
      "The gap predicate is one-sided on purpose: julianday(b) − julianday(a) > 0 AND <= 7. The strict > 0 demands DIFFERENT dates — a same-day double purchase produces a difference of exactly 0 and dies there, no matter how many rows the user has that day. The <= 7 makes the far end inclusive: exactly 7 days apart qualifies, exactly 8 does not. In a full cross join every distinct pair appears twice (once as a-b, once as b-a), but only the ordering with the later date as b has a positive gap, so each qualifying pair contributes exactly once.",
      "DISTINCT finishes the job because the question is about USERS, not pairs: a three-purchase chain within a week generates several qualifying pairs for one user, and each would otherwise emit a row. With duplicates collapsed, ORDER BY user_id ascending delivers a stable, deterministic list. The purchase_id inequality guard (a.purchase_id <> b.purchase_id) is belt-and-braces — a row paired with itself has a zero gap and already fails — but it documents the intent that two distinct purchases are being compared.",
    ],
    edges: [
      "The 2024-06-01 / 2024-06-08 pair: the gap is exactly 7 — the inclusive <= keeps the user in; 2024-06-09 would be 8 and out.",
      "The same-day double purchase (two rows on one date) yields a 0-day gap — the strict > 0 discards it even though two purchases exist.",
      "The three-purchase chain qualifies through adjacent pairs (3 days and 4 days) — DISTINCT ensures one output row, not one per pair.",
      "julianday() on date-only TEXT anchors at midnight, so day differences are exact whole numbers — no fractional drift to round away.",
    ],
    ladder: [
      { title: "Brute force — sort and scan each user's dates", body: "Fetch all dates per user in order and compare every pair, or slide a pointer while the lead stays within 7 days. Works, but the pairing logic lives in application code where the database cannot help." },
      { title: "The pattern — self-join plus date-diff predicate", body: "One self-join on user_id with a julianday gap between the bounds turns the pairing into a declarative filter — the database enumerates pairs and the predicate prunes them." },
      { title: "The optimal idea — DISTINCT over the surviving pairs", body: "SELECT DISTINCT a.user_id collapses evidence to users. Quadratic worst-case probing within a user; an index on (user_id, purchase_date) makes each probe cheap." },
    ],
    approach: "Self-join Purchases on user_id with a 0 < julianday gap <= 7 predicate, then DISTINCT the user ids",
    schema: {
      ddl: `CREATE TABLE Purchases (
  purchase_id   INTEGER PRIMARY KEY,
  user_id       INTEGER NOT NULL,
  purchase_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Purchases (purchase_id, user_id, purchase_date) VALUES
  (1, 11, '2024-06-01'),
  (2, 11, '2024-06-08'),  -- exactly 7 days later: the inclusive boundary qualifies user 11
  (3, 12, '2024-06-01'),
  (4, 12, '2024-06-09'),  -- exactly 8 days: one day too late, user 12 stays out
  (5, 13, '2024-06-05'),
  (6, 13, '2024-06-05'),  -- same-day double purchase: a 0-day gap never counts
  (7, 14, '2024-06-02'),
  (8, 14, '2024-06-05'),  -- 3 days after the first: the adjacent pair carries user 14
  (9, 14, '2024-06-09'),  -- 4 more days: the chain holds on its own, no 7-day leap needed
  -- user 15's buys sit 19 days apart: nothing within a week
  (10, 15, '2024-06-01'),
  (11, 15, '2024-06-20');`,
      tables: [
        { name: "Purchases", note: "11 purchases for 5 users — user 11: exactly 7 days apart (in); user 12: 8 days (out); user 13: two same-day buys (out); user 14: a 3-and-4-day chain (in); user 15: 19 days apart (out)" },
      ],
    },
    code: `SELECT DISTINCT a.user_id                  -- users, not pairs: one row per qualifying buyer
FROM Purchases a
JOIN Purchases b
  ON a.user_id      = b.user_id            -- pair purchases within the same user
 AND a.purchase_id <> b.purchase_id       -- two distinct purchases, never a row with itself
 AND julianday(b.purchase_date) > julianday(a.purchase_date)        -- DIFFERENT dates: b strictly later
 AND julianday(b.purchase_date) - julianday(a.purchase_date) <= 7   -- at most 7 days, boundary inclusive
ORDER BY a.user_id;`,
    walkthrough: [
      "The self-join pairs each user's purchases: user 11 gets the pair (06-01, 06-08) with a 7.0-day gap; user 12's pair spans 8.0 days and fails the <= 7 test; user 13's same-date pair computes 0.0 and dies on the strict > 0.",
      "User 14's three purchases pair up as 06-02 → 06-05 (3 days) and 06-05 → 06-09 (4 days) — two qualifying pairs, plus the 7-day leap 06-02 → 06-09 which also fits — all evidence for one user.",
      "User 15's gap of 19 days leaves nothing. DISTINCT then collapses user 14's multiple pairs: the answer is (11) then (14), ascending.",
    ],
    time: "O(n²) worst case — every same-user pair probed once; the date bounds prune most pairs before DISTINCT",
    space: "O(n) — the qualifying pairs before deduplication",
    followUps: [
      "Report the actual pair of dates that qualifies each user, choosing the earliest second purchase when several fit — which aggregate makes that choice deterministic?",
      "Flip the rule to three purchases within any 7-day span — why does a self-join stop scaling there, and which window trick replaces it?",
    ],
    related: ["user-purchase-platform", "customer-order-frequency", "the-latest-login-in-2020"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "total-sales-amount-by-year",
    statement:
      "Shipments records offers that stay active on EVERY calendar day between start_date and end_date inclusive, each moving a fixed number of units of one item; Pricelist gives each item's unit price. A shipment contributes units × price to EACH calendar year it was active in — the full amount credited to every year from the start year through the end year, never prorated by days. Build a per-year, per-item report with columns report_year, product_id and total_amount, ordered by report_year then product_id.",
    examples: [
      {
        input: "item 7 sells at 4.0 · one shipment of 5 units active 2023-04-10 through 2023-06-30",
        output: "(2023,7,20.0)",
        explanation:
          "The whole shipment lives inside 2023, so 2023 alone receives its full 5 × 4.0 = 20.0 — credited once, not split across the active months.",
      },
      {
        input: "item 9 sells at 10.5 · one shipment of 2 units active 2023-12-15 through 2025-01-10",
        output: "(2023,9,21.0) · (2024,9,21.0) · (2025,9,21.0)",
        explanation:
          "The span touches three calendar years, so each of 2023, 2024 and 2025 books the full 2 × 10.5 = 21.0 — the amount repeats per year, never divides.",
      },
    ],
    constraints: [
      "a shipment is active on every day of [start_date, end_date] and credits units × price to EVERY calendar year it spans — start year through end year, inclusive and unprorated",
      "a year/product row appears whenever at least one shipment of that item was active in that year",
      "output ordered by report_year, then product_id; total_amount is units × price summed over the shipments active in that year",
    ],
    breakdown: [
      "The data grain is wrong for the question: one row per shipment, but the answer needs one row per shipment-YEAR — a shipment spanning three years must exist three times before any totaling makes sense. WITH RECURSIVE manufactures that expansion: a base member reads each shipment with its start year CAST(strftime('%Y', start_date) AS INTEGER), and a recursive member emits yr + 1 while it has not passed the end year. After the recursion settles, a 2023 → 2025 shipment is three rows at the same units and item, one per year.",
      "Only then does the aggregation happen, and the order is the entire lesson: GROUP BY report_year, product_id with SUM(units × price). Summing before expansion is impossible — the year of a multi-year shipment is not a single value — and grouping raw rows by the start year would dump the whole amount into the start year, understating every later year it touched. Expansion first, sum second: each year's bucket receives the full units × price from every shipment alive in it, which is exactly the unprorated rule the premise states.",
      "The join to Pricelist happens after expansion, on product_id, so price multiplies each expanded row — mathematically equivalent to joining earlier, but keeping the CTEs shipment-shaped makes every stage auditable. Each year's bucket then totals independently, and a year with no active shipment for an item simply produces no row rather than a zero. The final ORDER BY report_year, product_id pins the reading order of the report; determinism needs no extra tie keys because (year, item) is the grouping grain itself, so each output row is unique by construction and the sort is total.",
    ],
    edges: [
      "Shipment 2 (item 7, 2023-11-05 → 2024-02-20) straddles New Year: 2023 AND 2024 each book its full 3 × 4.0 = 12.0 — a start-year-only grouping would hand 2023 everything and 2024 nothing.",
      "Shipment 3 spans three calendar years (2023-12-15 → 2025-01-10): the recursive member fires twice, and 21.0 lands in 2023, 2024 and 2025 alike.",
      "Shipment 1 sits inside one year — its expansion is a single row, and it behaves like any ordinary grouped sum.",
      "The recursive step stops at last_yr — without that brake the year column would grow forever; the termination condition lives in the WHERE of the recursive member.",
    ],
    ladder: [
      { title: "Brute force — expand in application code", body: "Read every shipment, loop from its start year to its end year, and append (year, item, units) rows into a list before aggregating. Straightforward, but the expansion logic lives outside SQL and the database never sees the true grain." },
      { title: "The pattern — a recursive counter per shipment", body: "WITH RECURSIVE seeds one row per shipment at its start year and appends yr + 1 until the end year — the standard interval-to-rows expansion, identical in spirit to generating a date spine." },
      { title: "The optimal idea — expand, then group", body: "SUM over the expanded rows with GROUP BY year and item. O(s × y) expanded rows for s shipments spanning y years each; the grouping sort dominates and the answer falls out per bucket." },
    ],
    approach: "WITH RECURSIVE expands each shipment into one row per calendar year it spans, then a GROUP BY year/product sums units × price",
    schema: {
      ddl: `CREATE TABLE Shipments (
  shipment_id INTEGER PRIMARY KEY,
  product_id  INTEGER NOT NULL,
  units       INTEGER NOT NULL,
  start_date  TEXT NOT NULL,
  end_date    TEXT NOT NULL
);
CREATE TABLE Pricelist (
  product_id INTEGER PRIMARY KEY,
  price      REAL NOT NULL
);`,
      seed: `INSERT INTO Shipments (shipment_id, product_id, units, start_date, end_date) VALUES
  (1, 7, 5, '2023-04-10', '2023-06-30'),  -- lives entirely inside 2023
  (2, 7, 3, '2023-11-05', '2024-02-20'),  -- crosses New Year: two years, full amount each
  (3, 9, 2, '2023-12-15', '2025-01-10');  -- touches three calendar years
INSERT INTO Pricelist (product_id, price) VALUES
  (7, 4.0),
  (9, 10.5);`,
      tables: [
        { name: "Shipments", note: "3 shipments for 2 item lines — shipment 1 inside 2023; shipment 2 across 2023–2024; shipment 3 across 2023–2025" },
        { name: "Pricelist", note: "unit prices — item 7 at 4.0, item 9 at 10.5" },
      ],
    },
    code: `WITH RECURSIVE
span AS (            -- each shipment with its start and end year as integers
    SELECT
        shipment_id,
        product_id,
        units,
        CAST(strftime('%Y', start_date) AS INTEGER) AS yr,
        CAST(strftime('%Y', end_date)   AS INTEGER) AS last_yr
    FROM Shipments
),
expanded AS (        -- one row per shipment-YEAR: yr climbs to last_yr, units repeat
    SELECT shipment_id, product_id, units, yr, last_yr FROM span
    UNION ALL
    SELECT shipment_id, product_id, units, yr + 1, last_yr
    FROM expanded
    WHERE yr + 1 <= last_yr        -- the recursion's brake: stop at the end year
)
SELECT
    e.yr                     AS report_year,
    e.product_id,
    SUM(e.units * p.price)   AS total_amount   -- full amount per year — no proration
FROM expanded e
JOIN Pricelist p ON p.product_id = e.product_id
GROUP BY e.yr, e.product_id
ORDER BY report_year, e.product_id;`,
    walkthrough: [
      "span reads three shipments: (1, 7, 5, 2023, 2023), (2, 7, 3, 2023, 2024) and (3, 9, 2, 2023, 2025). expanded then multiplies rows — shipment 1 stays one row, shipment 2 grows to 2023 and 2024, shipment 3 to 2023, 2024 and 2025: six rows in all.",
      "Joining Pricelist prices each expanded row: item 7 rows carry 5 × 4.0 = 20.0 or 3 × 4.0 = 12.0; item 9 rows carry 2 × 10.5 = 21.0 — the SAME 21.0 repeated into all three of its years.",
      "GROUP BY year and item totals the buckets: 2023 gets 20.0 + 12.0 = 32.0 for item 7 and 21.0 for item 9; 2024 gets 12.0 and 21.0; 2025 gets only item 9's 21.0 — five rows, ordered by year then product.",
    ],
    time: "O(s × y) expanded rows for s shipments spanning y years each, plus the GROUP BY sort",
    space: "O(s × y) — the expanded year-grain rows before aggregation",
    followUps: [
      "Prorate instead: credit each year only the fraction of days the shipment was actually active in it — which date arithmetic replaces the naive expansion, and what happens to the sums?",
      "Drive the expansion with a Years helper table CROSS JOINed and filtered by BETWEEN instead of recursion — compare readability and where the year bounds come from.",
    ],
    related: ["monthly-transactions-i", "sales-by-day-of-the-week", "fix-product-name-format"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "the-first-day-of-the-maximum-recorded-temperature-in-each-city",
    statement:
      "WeatherLog holds temperature readings: one row per entry with the city, the reading date and the temperature. For each city, find its maximum recorded temperature, then report the EARLIEST date on which that maximum was reached — when the peak value repeats across several dates, only the first occurrence counts. Output the columns city and first_date, ordered by city.",
    examples: [
      {
        input: "Ardmore reads 28 on 2024-07-09, 28 again on 2024-07-16 and 28 once more on 2024-07-23 — no other reading is higher",
        output: "(Ardmore,'2024-07-09')",
        explanation:
          "The maximum 28 was hit three times; the earliest date wins — one row per city, not one per peak day.",
      },
      {
        input: "Corwick reads 29 on 2024-07-01, then 33 on 2024-07-15",
        output: "(Corwick,'2024-07-15')",
        explanation:
          "The hottest day is 2024-07-15 even though the earlier 29 came first — the anchor is the date of the MAXIMUM, not the earliest date of any reading.",
      },
    ],
    constraints: [
      "the per-city maximum is over temperature alone; dates only break ties toward the earliest",
      "repeats of the maximum collapse to the first date — exactly one row per city",
      "output ordered by city ascending; every city with at least one reading appears",
    ],
    breakdown: [
      "Two answers are tangled together: the value (each city's maximum temperature) and the date (the earliest day that value occurred). A window ranking resolves both in one pass: ROW_NUMBER() OVER (PARTITION BY city ORDER BY temperature DESC, record_date ASC) sorts each city's readings hottest-first and, among equal temperatures, earliest-first. Row number 1 is therefore exactly the triple the report wants — the city, its hottest value, and the earliest date among that value's repeats.",
      "The tie handling hides in the second ORDER BY key. With temperature DESC alone, the three 28-degree Ardmore rows are numerically tied and SQLite is free to hand rank 1 to any of them — nondeterministic output that shifts with the query plan. Adding record_date ASC makes the tiebreak explicit and total within a city: the same temperature on an earlier date always sorts first. This is the canonical argmax-with-earliest-tiebreak shape, and the same result is reachable without windows — GROUP BY city for MAX(temperature), join back on (city, max value), and take MIN(record_date) of the matches — but that costs extra passes expressing the same idea.",
      "The seed's third city is the conceptual trap: its second-highest value appears BEFORE its maximum, so any query anchored on the earliest high reading or the city's first date reports the wrong day. The anchor must be computed, not assumed — sort by the value first, and only then by the date. The final ORDER BY city orders the one-row-per-city result deterministically; city is the partitioning grain, so every tie key is covered and the output is stable.",
    ],
    edges: [
      "Ardmore's maximum 28 repeats on three dates — the record_date ASC tiebreak inside the window picks 2024-07-09, the earliest.",
      "Corwick reads 29 on 2024-07-01 but only reaches its maximum 33 on 2024-07-15 — the max-DATE is the anchor, not the earliest date or the second-highest value.",
      "Dunmoor's peak repeats on just two dates — same tie rule, fewer repeats; the earliest still wins.",
      "Bexley's maximum is unique — the tiebreak never fires, and the single hottest date reports.",
    ],
    ladder: [
      { title: "Brute force — two passes over each city", body: "GROUP BY city for MAX(temperature), join the value back to WeatherLog to recover the dates that hit it, then reduce to MIN(record_date) per city. Three logical passes — correct but verbose." },
      { title: "The pattern — rank, then take row 1", body: "ROW_NUMBER over (temperature DESC, record_date ASC) per city encodes hottest-then-earliest in a single sort, and rn = 1 filters the winner out of each partition." },
      { title: "The optimal idea — make the tiebreak part of the sort", body: "One O(n log n) ordered pass replaces max-peeling entirely; every city reduces to exactly one row because the sort keys are total within a partition." },
    ],
    approach: "ROW_NUMBER per city ordered by temperature DESC then record_date ASC, keep rn = 1 — the earliest date of each city's peak",
    schema: {
      ddl: `CREATE TABLE WeatherLog (
  entry_id    INTEGER PRIMARY KEY,
  city        TEXT NOT NULL,
  record_date TEXT NOT NULL,
  temperature INTEGER NOT NULL
);`,
      seed: `INSERT INTO WeatherLog (entry_id, city, record_date, temperature) VALUES
  (1, 'Ardmore', '2024-07-02', 21),
  (2, 'Ardmore', '2024-07-09', 28),  -- the peak: first of THREE 28s
  (3, 'Ardmore', '2024-07-16', 28),
  (4, 'Ardmore', '2024-07-23', 28),
  (5, 'Ardmore', '2024-07-30', 19),
  (6, 'Bexley',  '2024-07-03', 25),
  (7, 'Bexley',  '2024-07-10', 31),  -- unique maximum: no tie to break
  (8, 'Bexley',  '2024-07-17', 22),
  (9,  'Corwick', '2024-07-01', 29),  -- second-highest value, EARLIER than the max: the decoy
  (10, 'Corwick', '2024-07-08', 27),
  (11, 'Corwick', '2024-07-15', 33),  -- the true maximum, later than the 29
  (12, 'Corwick', '2024-07-22', 29),
  (13, 'Dunmoor', '2024-08-01', 24),
  (14, 'Dunmoor', '2024-08-08', 30),  -- the peak repeats on two dates
  (15, 'Dunmoor', '2024-08-15', 30),
  (16, 'Dunmoor', '2024-08-22', 12);`,
      tables: [
        { name: "WeatherLog", note: "16 readings for 4 cities — Ardmore's 28 repeats on three dates; Bexley's 31 is unique; Corwick's 29 on 07-01 predates its true 33 maximum; Dunmoor's 30 repeats twice" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        city,
        record_date,
        ROW_NUMBER() OVER (
            PARTITION BY city
            ORDER BY temperature DESC, record_date ASC   -- hottest first; among ties, earliest
        ) AS rn
    FROM WeatherLog
)
SELECT
    city,
    record_date AS first_date    -- rn 1 = the peak value on its earliest date
FROM ranked
WHERE rn = 1
ORDER BY city;`,
    walkthrough: [
      "Each city's readings sort by temperature DESC, record_date ASC: Ardmore's three 28s order 07-09, 07-16, 07-23 with 07-09 taking rank 1, and Bexley's 31 on 07-10 outranks its neighbors outright.",
      "Corwick sorts 33 (07-15) FIRST even though the 29 on 07-01 is earlier — value dominates date in the sort keys — so rank 1 is the true maximum's date, not the earliest reading.",
      "Dunmoor's two 30s resolve to 08-08 by the date tiebreak. Keeping rn = 1 in every partition yields (Ardmore,'2024-07-09'), (Bexley,'2024-07-10'), (Corwick,'2024-07-15'), (Dunmoor,'2024-08-08'), ordered by city.",
    ],
    time: "O(n log n) — one ordered pass per city partition feeds ROW_NUMBER",
    space: "O(n) — the ranked rows before the rn = 1 filter",
    followUps: [
      "Report the earliest date of each city's SECOND-highest temperature — which ranking tweak surfaces it, and what breaks when a city's peak is unique?",
      "Solve it without any window function: GROUP BY city for the maximum, join back on (city, value) and take MIN(record_date) — count the passes and compare determinism.",
    ],
    related: ["second-most-recent-activity", "report-contiguous-dates", "the-latest-login-in-2020"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "first-and-last-call-on-the-same-day",
    statement:
      "CallLog records phone calls: caller, recipient, the start timestamp and the duration. For each caller and calendar day — the day extracted from the start timestamp — compare the FIRST call placed that day with the LAST call placed that day. Report the caller-day when those two boundary calls went to the SAME recipient; a day with a single call qualifies trivially, since its first and last call are the same call. Output the columns caller_id and call_day, ordered by call_day then caller_id.",
    examples: [
      {
        input: "caller 42 on 2024-09-03: 08:00 to recipient 12 · 09:45 to recipient 5 · 14:10 to recipient 8 · 18:05 to recipient 12",
        output: "(42,'2024-09-03')",
        explanation:
          "The day's first call (08:00) and last call (18:05) both went to recipient 12 — the different recipients in between are irrelevant.",
      },
      {
        input: "caller 41 on 2024-09-05: 09:00 to recipient 7 · 11:30 to recipient 9",
        output: "(no rows)",
        explanation:
          "First and last went to DIFFERENT recipients, so the caller-day is skipped even though both contacts are regulars.",
      },
    ],
    constraints: [
      "first and last are chosen per (caller_id, day) by call_time — earliest start and latest start",
      "a caller-day qualifies when the boundary calls share one recipient, including the single-call day where first and last coincide",
      "output ordered by call_day ascending, then caller_id ascending",
    ],
    breakdown: [
      "The unit of analysis is the caller-DAY, and days do not exist in the table — call_time is a full timestamp. DATE(call_time) buckets each timestamp into its calendar day, and GROUP BY caller_id, DATE(call_time) collapses each bucket into one row carrying MIN(call_time) and MAX(call_time). Timestamps in 'YYYY-MM-DD HH:MM:SS' format compare correctly as plain strings, so the min and max are honest chronological boundaries without any casting.",
      "Knowing WHEN the boundaries happened is not knowing WHO received them — the aggregates discard recipient_id, so a join-back is mandatory. The edges CTE joins CallLog against its own bounds, keeping only rows whose call_time equals the day's first or last time; those are the boundary calls, and their recipient_ids are the only votes that count. The single-call day needs no special case: with first_time = last_time, the lone call matches both and appears once.",
      "Qualification is a SET comparison: the boundary calls must resolve to exactly ONE distinct recipient. SELECT DISTINCT (caller, day, recipient) over the edge rows turns the test into HAVING COUNT(*) = 1 after regrouping — one distinct boundary recipient qualifies, two or more fails. That formulation is immune to middles of the day and to first and last being the same row; a ROW_NUMBER first/last alternative works too, but it must compare the two ranked rows' recipients rather than assume they differ.",
    ],
    edges: [
      "Caller 41's 2024-09-02 has ONE call — first_time = last_time, the same row is both boundaries, and the day trivially qualifies.",
      "Caller 44's 2024-09-02: first to recipient 2, last to recipient 6, with a same-recipient call in between — the middle call changes nothing; the boundary recipients differ, so the day is out.",
      "Caller 42's 2024-09-03 runs four deep with two different recipients in the middle — boundaries both to 12, so it qualifies; middles never vote.",
      "Caller 41 qualifies on 09-02 and fails on 09-05 — the verdict is per caller-DAY, never per caller.",
    ],
    ladder: [
      { title: "Brute force — sort each day and peek at both ends", body: "Pull each caller-day's calls ordered by time, read the first and last rows in application code, compare recipients. Works, but the boundary logic lives outside SQL and every day needs its own scan." },
      { title: "The pattern — MIN/MAX aggregates, then join back", body: "GROUP BY caller and DATE(call_time) for the boundary timestamps; join CallLog back on matching timestamps to recover the boundary recipients — the argmax join-back done once with a single IN predicate over both ends." },
      { title: "The optimal idea — distinct recipients among boundary rows", body: "DISTINCT the (caller, day, recipient) edge rows and keep groups with COUNT(*) = 1. O(n log n) for the grouping; a HAVING on the collapsed set answers same-recipient without ranking anything." },
    ],
    approach: "GROUP BY caller and DATE(call_time) for first/last timestamps, join back the boundary calls, keep caller-days with exactly one distinct boundary recipient",
    schema: {
      ddl: `CREATE TABLE CallLog (
  call_id      INTEGER PRIMARY KEY,
  caller_id    INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  call_time    TEXT NOT NULL,
  duration     INTEGER NOT NULL
);`,
      seed: `INSERT INTO CallLog (call_id, caller_id, recipient_id, call_time, duration) VALUES
  (101, 41, 7,  '2024-09-02 08:15:00', 240),  -- a single-call day: first = last, trivially in
  (102, 43, 3,  '2024-09-02 10:00:00', 480),
  (103, 43, 3,  '2024-09-02 17:40:00', 95),   -- two calls, both to 3: the boundaries agree
  (104, 44, 2,  '2024-09-02 07:30:00', 60),   -- first goes to 2
  (105, 44, 2,  '2024-09-02 12:00:00', 300),  -- middle, same as the first: irrelevant
  (106, 44, 6,  '2024-09-02 19:45:00', 45),   -- last goes to 6, not 2: caller 44 out
  (107, 42, 12, '2024-09-03 08:00:00', 180),  -- first goes to 12
  (108, 42, 5,  '2024-09-03 09:45:00', 65),   -- middle: a different recipient, does not vote
  (109, 42, 8,  '2024-09-03 14:10:00', 220),  -- middle: still does not vote
  (110, 42, 12, '2024-09-03 18:05:00', 330),  -- last goes to 12 again: caller 42 in
  (111, 41, 7,  '2024-09-05 09:00:00', 150),  -- first goes to 7
  (112, 41, 7,  '2024-09-05 10:15:00', 90),   -- middle: irrelevant to the verdict
  -- 113 is the day's last call, to 9 not 7: caller 41 out on this day
  (113, 41, 9,  '2024-09-05 11:30:00', 120);`,
      tables: [
        { name: "CallLog", note: "13 calls from 4 callers over 3 days — caller 41 in on 09-02 (one call) but out on 09-05; caller 43's two calls agree; caller 44's boundaries disagree; caller 42's four-call day agrees at both ends" },
      ],
    },
    code: `WITH days AS (       -- one row per caller-day with its boundary timestamps
    SELECT
        caller_id,
        DATE(call_time) AS call_day,
        MIN(call_time)  AS first_time,
        MAX(call_time)  AS last_time
    FROM CallLog
    GROUP BY caller_id, DATE(call_time)
),
edges AS (           -- the boundary calls only: those hitting the day's first or last time
    SELECT DISTINCT
        d.caller_id,
        d.call_day,
        c.recipient_id
    FROM days d
    JOIN CallLog c
      ON c.caller_id = d.caller_id
     AND DATE(c.call_time) = d.call_day
     AND c.call_time IN (d.first_time, d.last_time)
)
SELECT caller_id, call_day
FROM edges
GROUP BY caller_id, call_day
HAVING COUNT(*) = 1              -- exactly one DISTINCT recipient among the boundary calls
ORDER BY call_day, caller_id;`,
    walkthrough: [
      "days buckets five caller-days: 41/09-02 (first = last = 08:15), 43/09-02 (10:00, 17:40), 44/09-02 (07:30, 19:45), 42/09-03 (08:00, 18:05) and 41/09-05 (09:00, 11:30).",
      "edges keeps only the boundary calls: 41/09-02 → {7}; 43/09-02 → {3} (both calls, one distinct recipient); 44/09-02 → {2, 6}; 42/09-03 → {12} (the middles to 5 and 8 never match a boundary time); 41/09-05 → {7, 9}.",
      "HAVING COUNT(*) = 1 keeps the caller-days with a single distinct boundary recipient: (41,'2024-09-02'), (43,'2024-09-02'), (42,'2024-09-03') — ordered by day, then caller. Caller 41's 09-05 and every caller 44 day fail.",
    ],
    time: "O(n log n) — the per-(caller, day) grouping sort, then one join-back over the boundary timestamps",
    space: "O(n) — the bounds and the collapsed edge rows",
    followUps: [
      "Report the boundary recipients themselves alongside the caller-day — how does the query change if first and last must be shown as separate columns?",
      "Count how many calls each qualifying caller-day had in total — why does that need a third pass over CallLog, and which join key keeps it per-day?",
      "Handle two calls at the identical timestamp on one day (a tie at the boundary) — decide a deterministic winner and explain why this seed avoids the issue.",
    ],
    related: ["create-a-session-bar-chart", "second-most-recent-activity", "the-latest-login-in-2020"],
    order: "exact",
    xp: 35,
  },
];
