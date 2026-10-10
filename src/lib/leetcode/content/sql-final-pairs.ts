// Deep-dives — the final-pairs band: the 2025-wave problems that count PAIRS
// and STREAKS (co-purchase category pairs, zombie session fingerprints,
// consecutive course transitions, dominant-reaction shares, and gaps-and-
// islands behavior streaks). Solutions are SQLite dialect, one statement
// each, engine-verified against the per-problem seed in this file.
//
// Engine lesson baked into dives 3673/3832: julianday() is a float — a clean
// 35-minute span computes as 34.999999… days (CAST truncates to 34!). All
// date arithmetic here therefore runs on strftime('%s', …) epoch seconds,
// which stay exact integers.
import type { LcSqlDive } from "../types";

export const SQL_FINAL_PAIRS: LcSqlDive[] = [
  {
    slug: "find-category-recommendation-pairs",
    statement:
      "A marketplace logs which customer bought which product and in what quantity, while a catalog assigns every product to a category. Find every pair of DISTINCT categories — reported with the lexicographically smaller name as category1 — and count the customers who purchased from BOTH categories in the pair; keep only pairs with at least 3 such customers, ordered by that count descending, then category1 ascending and category2 ascending.",
    examples: [
      {
        input:
          "ProductPurchases: users 1–5 hold the official 20 rows (user 1 buys 101, 102, 201, 301 · user 2 buys 101, 102, 103, 201 · user 3 buys 101, 103, 301, 401 · user 4 buys 101, 201, 301, 401 · user 5 buys 102, 103, 201, 202) + TRAPS — user 6 buys 201 and 301, user 7 buys 102 and 103 (two products, ONE category), user 8 buys 401 plus product 999 which has no catalog row. ProductInfo: 101 Electronics · 102/103 Books · 201/202 Clothing · 301 Sports · 401 Kitchen",
        output:
          "Books Clothing 3 · Books Electronics 3 · Clothing Electronics 3 · Clothing Sports 3 · Electronics Sports 3",
        explanation:
          "The four official pairs hold at 3 customers each, and the user-6 trap lifts Clothing–Sports from 2 to EXACTLY 3 — the reportable boundary. With every count tied, the category1/category2 tie-break sorts the five rows lexicographically. User 7 adds nothing (two products, one category — no pair exists, and a < b makes (Books, Books) impossible), and user 8's orphan product 999 dies at the catalog join before it could invent a NULL category.",
      },
    ],
    constraints: [
      "(user_id, product_id) is the unique key of ProductPurchases; product_id is the unique key of ProductInfo",
      "a pair is reportable only with at least 3 DIFFERENT customers who purchased from both of its categories",
      "category1 < category2 lexicographically; output is ordered by customer_count DESC, then category1 ASC, then category2 ASC",
    ],
    breakdown: [
      "What's really asked is a co-purchase graph between categories: nodes are categories, and each edge's weight is the number of CUSTOMERS who touched both endpoints. The unit of counting is the customer, never the purchase — one user buying five different Books products contributes one Books membership, not five. And the pair itself must be canonicalized (category1 < category2) so each edge is reported exactly once, in one direction.",
      "The core mechanism is a two-step projection. First, purchases join the catalog to translate product ids into categories — that join multiplies rows (users 2 and 5 each own two Books products), so DISTINCT collapses each user's basket down to a set of (user_id, category) memberships. Second, that membership relation self-joins on user_id with an a.category < b.category gate. The gate does double duty: it forbids (Books, Books) self-pairs AND it kills the (A, B) / (B, A) mirror duplicates before they can split a pair's count in half.",
      "Why naive fails: joining ProductPurchases to itself on user_id and pairing product categories row-by-row creates brutal fan-out — user 5's two Books rows times two Clothing rows yield four identical (Books, Clothing) tuples. COUNT(*) on that mess counts (user, product-pair) combinations, not customers, and same-category pairs like (Books, Books) leak through unless the gate is a strict < (an <> filter still allows the mirror and the self-pair's siblings). The threshold must also sit in HAVING on the distinct-customer count, not in a WHERE on raw row counts.",
      "Assembly: the membership CTE feeds a self-join keyed on user_id, GROUP BY the ordered pair, HAVING COUNT(DISTINCT user_id) >= 3, and finally the three-key ORDER BY the facts mandate (count DESC, then the two names ASC). COUNT(DISTINCT ...) is belt-and-braces here — the CTE is already distinct — but it makes the intent explicit and keeps the query correct even if the membership CTE were rewritten with extra columns.",
    ],
    edges: [
      "Same category twice for one user counts once: users 2 and 5 each buy two Books products, and user 5 owns both Clothing products — the DISTINCT membership CTE folds each basket to one row per category.",
      "The a < b gate is structural: without it, (Books, Electronics) and (Electronics, Books) both survive and split the count, while multi-product categories manufacture (Books, Books) self-pairs.",
      "The threshold is >= 3, and the seed pins both sides: Clothing–Sports reaches exactly 3 (trap user 6) and stays, while Books–Sports stalls at exactly 2 (users 1 and 3) and dies at HAVING.",
      "A purchase whose product_id is missing from ProductInfo vanishes at the INNER join (user 8's product 999) — a LEFT join would invent a NULL category and start pairing it against real ones.",
    ],
    ladder: [
      {
        title: "Brute force — check every category pair against every user",
        body: "Enumerate all category pairs (N² of them), and for each pair scan every user's purchases twice to test membership in both categories. The counting unit drifts easily — you must remember to count users, not purchases, and to canonicalize the pair order by hand.",
      },
      {
        title: "The pattern — membership relation, then a less-than self-join",
        body: "Project purchases + catalog down to DISTINCT (user_id, category) memberships, then join that relation to itself on user_id with b.category > a.category. GROUP BY the pair and count distinct users; the gate removes mirrors and self-pairs for free.",
      },
      {
        title: "The optimal idea — one pass to memberships, one pass to pairs",
        body: "The CTE + self-join IS the optimal shape: O(p) to build memberships over p purchases, then a hash join on user_id pairs each user's categories (Σ mᵤ² work, tiny — users hold a handful of categories). COUNT(DISTINCT) guards any residual fan-out, HAVING applies the threshold, and the mandated ORDER BY needs no extra pass.",
      },
    ],
    approach: "Distinct user×category memberships + canonical-pair self-join + HAVING threshold",
    schema: {
      ddl: `CREATE TABLE ProductPurchases (
  user_id    INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (user_id, product_id)
);
CREATE TABLE ProductInfo (
  product_id INTEGER PRIMARY KEY,
  category   TEXT NOT NULL,
  price      REAL NOT NULL
);`,
      seed: `INSERT INTO ProductInfo (product_id, category, price) VALUES
  (101, 'Electronics', 100),
  (102, 'Books', 20),
  (103, 'Books', 35),
  (201, 'Clothing', 45),
  (202, 'Clothing', 60),
  (301, 'Sports', 75),
  (401, 'Kitchen', 50); -- official catalog
INSERT INTO ProductPurchases (user_id, product_id, quantity) VALUES
  (1, 101, 2), (1, 102, 1), (1, 201, 3), (1, 301, 1), -- official users 1-5
  (2, 101, 1), (2, 102, 2), (2, 103, 1), (2, 201, 5),
  (3, 101, 2), (3, 103, 1), (3, 301, 4), (3, 401, 2),
  (4, 101, 1), (4, 201, 3), (4, 301, 1), (4, 401, 2),
  (5, 102, 2), (5, 103, 1), (5, 201, 2), (5, 202, 3),
  (6, 201, 1), (6, 301, 2), -- TRAP: lifts Clothing-Sports to exactly 3 (the >= boundary)
  (7, 102, 1), (7, 103, 2), -- TRAP: two products, one category -> zero pairs from this user
  (8, 999, 1), (8, 401, 2); -- TRAP: product 999 has no catalog row -> dropped by the join`,
      tables: [
        { name: "ProductPurchases", note: "26 rows — users 1–5 official, 6/7/8 are the traps (boundary, one-category, orphan product)" },
        { name: "ProductInfo", note: "7 official products; note Books and Clothing each own TWO product ids" },
      ],
    },
    code: `WITH user_categories AS (
  -- one row per (user, category): a user who bought three different Books
  -- products still counts as a single Books member
  SELECT DISTINCT pp.user_id, pi.category
  FROM ProductPurchases pp
  JOIN ProductInfo pi
    ON pi.product_id = pp.product_id   -- INNER: orphan products can't invent categories
)
SELECT
  a.category               AS category1,
  b.category               AS category2,
  COUNT(DISTINCT a.user_id) AS customer_count
FROM user_categories a
JOIN user_categories b
  ON  b.user_id = a.user_id
  AND b.category > a.category          -- canonical pair: no (X,X), no (B,A) mirror
GROUP BY a.category, b.category
HAVING COUNT(DISTINCT a.user_id) >= 3 -- reportable = at least 3 shared customers
ORDER BY customer_count DESC, category1 ASC, category2 ASC;`,
    order: "exact",
    walkthrough: [
      "The membership CTE joins all 26 purchases to the catalog and dedupes: user 1 becomes {Electronics, Books, Clothing, Sports}; users 2 and 5 each collapse their two Books products into one Books row (and user 5 folds 201/202 into one Clothing row); user 8's product 999 finds no catalog row and disappears, leaving user 8 as Kitchen-only; user 7 ends up holding just Books.",
      "The self-join pairs each user's memberships under the b > a gate: user 1 alone emits (Books, Clothing), (Books, Electronics), (Books, Sports), (Clothing, Electronics), (Clothing, Sports) and (Electronics, Sports); user 7's lone Books row finds no partner; and (Books, Books) can never form because 'Books' > 'Books' is false.",
      "GROUP BY accumulates per pair: Books/Clothing collects users 1, 2 and 5 → 3; Clothing/Sports collects users 1, 4 and trap user 6 → exactly 3, crossing the reportability line the official data left at 2; Books/Sports stops at users 1 and 3 → 2 and is the HAVING casualty, alongside Books/Kitchen (1), Clothing/Kitchen (1), Electronics/Kitchen (2) and Kitchen/Sports (2).",
      "All five survivors tie at customer_count = 3, so the tie-break takes over: category1 sorts Books < Clothing < Electronics, and category2 separates the two Books rows. The printed order — Books Clothing, Books Electronics, Clothing Electronics, Clothing Sports, Electronics Sports — matches the documented snapshot exactly.",
    ],
    time: "O(p) to build the membership CTE over p purchases, then Σ mᵤ² pair emissions per user's mᵤ categories — a hash join on user_id keeps it linear-ish in practice",
    space: "O(m) for the distinct memberships plus the pair hash table",
    followUps: [
      "How would you also report, for each pair, the number of customers who bought exactly ONE of the two categories (an affinity denominator)? (Aggregate memberships per category first, then LEFT JOIN the pair counts against the per-category totals.)",
      "What about three-way category combos — triples bought by at least 3 customers? (Extend the self-join to three aliased copies with a < b < c; watch the fan-out grow and consider pre-aggregating rare categories first.)",
    ],
    related: ["find-product-recommendation-pairs", "customers-who-bought-all-products", "students-and-examinations"],
    xp: 35,
  },
  {
    slug: "find-zombie-sessions",
    statement:
      "An analytics table records every app event — opens, clicks, scrolls, purchases and closes — each stamped with a time and the session it belongs to. A session is a 'zombie' when ALL four hold: it spans more than 30 minutes from its first event to its last, it logs at least 5 scroll events, its click-to-scroll ratio is strictly below 0.20, and it contains no purchases. Report each zombie's session_id, user_id, duration in whole minutes and scroll count, ordered by scroll_count descending then session_id ascending.",
    examples: [
      {
        input:
          "app_events: 65 events across 9 sessions — S001–S004 are the official 28 rows (S001: 10:00→10:35, 6 scrolls, 0 clicks · S002: 20 min, 2 clicks, 2 scrolls, one purchase · S003: 12:00→13:00, 5 scrolls, 1 click · S004: 12 min, 2 scrolls) + TRAPS — S005 spans exactly 30:00 with 5 scrolls and no clicks · S006 spans 50 min with 6 scrolls, 1 click and no purchase · S007 spans 45 min with 5 scrolls, no clicks, but one purchase · S008 spans 55 min with only 4 scrolls · S009 is 7 bare scrolls from 19:10 to 20:10, no app_open/app_close rows, and its event ids are stored out of time order",
        output: "S009 209 60 7 · S001 201 35 6 · S006 206 50 6",
        explanation:
          "S001 is the official zombie (35 min, 6 scrolls, 0/6 = 0.00 ratio, no purchases). Every trap dies of exactly one cause: S005 at exactly 30 minutes (needs MORE), S003 at a ratio of exactly 1/5 = 0.20 (needs LESS), S007 at the purchase veto, S008 at 4 scrolls. S006 passes everything (1/6 ≈ 0.17) and ties S001 at 6 scrolls — session_id ASC breaks the tie. S009 tops the list at 60 min / 7 scrolls even without open/close rows, because boundaries come from MIN/MAX over ALL events, not from app_open/app_close.",
      },
    ],
    constraints: [
      "event_type is one of app_open, click, scroll, purchase, app_close; event_value holds dollars for purchases, pixels for scrolls, NULL otherwise",
      "session duration = last event timestamp minus first event timestamp within the session (any event types count as boundaries)",
      "zombie gates: duration > 30 minutes AND >= 5 scrolls AND clicks/scrolls < 0.20 AND zero purchases; output ordered by scroll_count DESC, session_id ASC",
    ],
    breakdown: [
      "What's really asked is a per-session behavioral fingerprint — duration plus a count of each event type — followed by a four-condition veto gate. The gate is conjunctive: one failed criterion kills the session no matter how extreme the others are. And because the report itself must PRINT duration and scroll_count, the aggregation can't be buried in a subquery you can't select from; it has to be a first-class per-session row.",
      "The core mechanism is a single GROUP BY over session_id. MAX and MIN of the timestamps give the span; SUM(event_type = 'scroll') counts scrolls because SQLite evaluates the boolean to 1 or 0 per row — three of these boolean sums replace three CASE expressions. For duration, CAST(strftime('%s', ts) AS INTEGER) converts each timestamp to exact epoch seconds, so the difference and the / 60 are pure INTEGER arithmetic — no rounding drift anywhere.",
      "Why naive fails in three classic ways. First, measuring from the app_open row to the app_close row: sessions without explicit open/close rows (S009) then vanish or mis-measure, even though the definition only says first-to-last event. Second, computing the ratio as clicks / scrolls in integers: 1/6 is 0 in integer-aware engines, so EVERY ratio looks like 0.00 and everything with 5+ scrolls qualifies — the 1.0 multiplier is what makes 1/6 = 0.1667. Third, typing < as <=: S003 sits at exactly 1/5 = 0.20 and must be rejected, and S005 at exactly 30 minutes must be rejected, because both facts say 'more than' and 'less than'.",
      "Assembly: a sessions CTE computes the fingerprint once per (session_id, user_id) — grouping by both makes user_id a real group key instead of a bare column riding along. The outer WHERE then reads almost like the spec: four named gates over named columns, one line per trap in the seed. ORDER BY scroll_count DESC, session_id ASC reproduces the mandated ordering, including the tie between S001 and S006.",
    ],
    edges: [
      "Both boundaries are strict: 30 minutes exactly (S005) fails 'more than 30', and a ratio of exactly 0.20 (S003's 1/5) fails 'less than 0.20'.",
      "No app_open/app_close rows is fine — S009's span comes from its first and last scroll events, and its out-of-order event ids change nothing because MAX/MIN read values, not insertion order.",
      "The purchase veto is absolute: S007 nails duration (45), scrolls (5) and ratio (0.00) and still dies on one purchase row.",
      "The ratio needs the 1.0 multiplier (clicks * 1.0 / scrolls) — integer 1/6 would floor to 0 and fake-qualify every session; and scroll_count >= 5 is guaranteed by the time the ratio is computed, so no division-by-zero case reaches it.",
    ],
    ladder: [
      {
        title: "Brute force — replay each session by hand",
        body: "For each session, walk its events in time order, note the first and last timestamps, tally scrolls/clicks/purchases, then apply the four checks. The manual algorithm is exactly the query; the risk is anchoring the duration on open/close rows instead of the true min/max.",
      },
      {
        title: "The pattern — one GROUP BY builds the fingerprint",
        body: "GROUP BY session_id (and user_id) computes MAX(ts), MIN(ts) and boolean-SUM counts per type in a single pass. A CTE holds the fingerprint so the outer query can filter on readable, named columns instead of repeating aggregate expressions.",
      },
      {
        title: "The optimal idea — exact integers for time, booleans for counts",
        body: "strftime('%s', …) keeps timestamps as exact epoch seconds: the difference is an integer, / 60 is integer division, and 35 minutes prints as 35 — no julianday() float drift (a real 35-minute span computes as 34.999999… days and CASTs to 34!). One scan, one group, four flat gates — nothing left to optimize.",
      },
    ],
    approach: "Per-session fingerprint CTE (MIN/MAX + boolean SUMs) + four-gate filter",
    schema: {
      ddl: `CREATE TABLE app_events (
  event_id        INTEGER PRIMARY KEY,
  user_id         INTEGER NOT NULL,
  event_timestamp TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM:SS'
  event_type      TEXT NOT NULL
    CHECK (event_type IN ('app_open','click','scroll','purchase','app_close')),
  session_id      TEXT NOT NULL,
  event_value     INTEGER          -- dollars (purchase), pixels (scroll), NULL otherwise
);`,
      seed: `INSERT INTO app_events (event_id, user_id, event_timestamp, event_type, session_id, event_value) VALUES
  (1, 201, '2024-03-01 10:00:00', 'app_open', 'S001', NULL),   -- official sessions
  (2, 201, '2024-03-01 10:05:00', 'scroll',   'S001', 500),    -- S001..S004
  (3, 201, '2024-03-01 10:10:00', 'scroll',   'S001', 750),
  (4, 201, '2024-03-01 10:15:00', 'scroll',   'S001', 600),
  (5, 201, '2024-03-01 10:20:00', 'scroll',   'S001', 800),
  (6, 201, '2024-03-01 10:25:00', 'scroll',   'S001', 550),
  (7, 201, '2024-03-01 10:30:00', 'scroll',   'S001', 900),
  (8, 201, '2024-03-01 10:35:00', 'app_close', 'S001', NULL),
  (9, 202, '2024-03-01 11:00:00', 'app_open',  'S002', NULL),
  (10, 202, '2024-03-01 11:02:00', 'click',    'S002', NULL),
  (11, 202, '2024-03-01 11:05:00', 'scroll',   'S002', 400),
  (12, 202, '2024-03-01 11:08:00', 'click',    'S002', NULL),
  (13, 202, '2024-03-01 11:10:00', 'scroll',   'S002', 350),
  (14, 202, '2024-03-01 11:15:00', 'purchase', 'S002', 50),
  (15, 202, '2024-03-01 11:20:00', 'app_close', 'S002', NULL),
  (16, 203, '2024-03-01 12:00:00', 'app_open',  'S003', NULL),
  (17, 203, '2024-03-01 12:10:00', 'scroll',    'S003', 1000),
  (18, 203, '2024-03-01 12:20:00', 'scroll',    'S003', 1200),
  (19, 203, '2024-03-01 12:25:00', 'click',     'S003', NULL),
  (20, 203, '2024-03-01 12:30:00', 'scroll',    'S003', 800),
  (21, 203, '2024-03-01 12:40:00', 'scroll',    'S003', 900),
  (22, 203, '2024-03-01 12:50:00', 'scroll',    'S003', 1100),
  (23, 203, '2024-03-01 13:00:00', 'app_close', 'S003', NULL),
  (24, 204, '2024-03-01 14:00:00', 'app_open',  'S004', NULL),
  (25, 204, '2024-03-01 14:05:00', 'scroll',    'S004', 600),
  (26, 204, '2024-03-01 14:08:00', 'scroll',    'S004', 700),
  (27, 204, '2024-03-01 14:10:00', 'click',     'S004', NULL),
  (28, 204, '2024-03-01 14:12:00', 'app_close', 'S004', NULL),
  (29, 205, '2024-03-01 15:00:00', 'app_open',  'S005', NULL),  -- TRAP: exactly 30 min
  (30, 205, '2024-03-01 15:05:00', 'scroll',    'S005', 300),   -- (duration must be > 30)
  (31, 205, '2024-03-01 15:10:00', 'scroll',    'S005', 320),
  (32, 205, '2024-03-01 15:15:00', 'scroll',    'S005', 310),
  (33, 205, '2024-03-01 15:20:00', 'scroll',    'S005', 330),
  (34, 205, '2024-03-01 15:25:00', 'scroll',    'S005', 340),
  (35, 205, '2024-03-01 15:30:00', 'app_close', 'S005', NULL),
  (36, 206, '2024-03-01 16:00:00', 'app_open',  'S006', NULL),  -- TRAP: second zombie
  (37, 206, '2024-03-01 16:02:00', 'click',     'S006', NULL),  -- 50 min, 6 scrolls,
  (38, 206, '2024-03-01 16:06:00', 'scroll',    'S006', 420),   -- 1 click (ratio 0.17),
  (39, 206, '2024-03-01 16:12:00', 'scroll',    'S006', 440),   -- no purchase; ties S001
  (40, 206, '2024-03-01 16:18:00', 'scroll',    'S006', 460),   -- at 6 scrolls ->
  (41, 206, '2024-03-01 16:24:00', 'scroll',    'S006', 480),   -- session_id tie-break
  (42, 206, '2024-03-01 16:30:00', 'scroll',    'S006', 500),
  (43, 206, '2024-03-01 16:36:00', 'scroll',    'S006', 520),
  (44, 206, '2024-03-01 16:50:00', 'app_close', 'S006', NULL),
  (45, 207, '2024-03-01 17:00:00', 'app_open',  'S007', NULL),  -- TRAP: purchase veto
  (46, 207, '2024-03-01 17:05:00', 'scroll',    'S007', 200),   -- 45 min, 5 scrolls,
  (47, 207, '2024-03-01 17:10:00', 'scroll',    'S007', 210),   -- 0 clicks, but one
  (48, 207, '2024-03-01 17:15:00', 'scroll',    'S007', 220),   -- purchase at 17:28
  (49, 207, '2024-03-01 17:20:00', 'scroll',    'S007', 230),
  (50, 207, '2024-03-01 17:25:00', 'scroll',    'S007', 240),
  (51, 207, '2024-03-01 17:28:00', 'purchase',  'S007', 25),
  (52, 207, '2024-03-01 17:45:00', 'app_close', 'S007', NULL),
  (53, 208, '2024-03-01 18:00:00', 'app_open',  'S008', NULL),  -- TRAP: only 4 scrolls
  (54, 208, '2024-03-01 18:10:00', 'scroll',    'S008', 150),   -- 55 min but the scroll
  (55, 208, '2024-03-01 18:20:00', 'scroll',    'S008', 160),   -- gate wants >= 5
  (56, 208, '2024-03-01 18:30:00', 'scroll',    'S008', 170),
  (57, 208, '2024-03-01 18:40:00', 'scroll',    'S008', 180),
  (58, 208, '2024-03-01 18:55:00', 'app_close', 'S008', NULL),
  (59, 209, '2024-03-01 19:10:00', 'scroll',    'S009', 900),   -- TRAP: no open/close,
  (60, 209, '2024-03-01 20:10:00', 'scroll',    'S009', 960),   -- ids out of time order;
  (61, 209, '2024-03-01 19:20:00', 'scroll',    'S009', 910),   -- 19:10 -> 20:10 = 60 min,
  (62, 209, '2024-03-01 19:30:00', 'scroll',    'S009', 920),   -- 7 scrolls, 0 clicks ->
  (63, 209, '2024-03-01 19:40:00', 'scroll',    'S009', 930),   -- the top zombie
  (64, 209, '2024-03-01 19:50:00', 'scroll',    'S009', 940),
  (65, 209, '2024-03-01 20:00:00', 'scroll',    'S009', 950);`,
      tables: [
        { name: "app_events", note: "65 events, 9 sessions — S001–S004 official; S005–S009 each fail (or pass) exactly one distinguishing criterion" },
      ],
    },
    code: `WITH sessions AS (
  SELECT
    session_id,
    user_id,
    (CAST(strftime('%s', MAX(event_timestamp)) AS INTEGER)
       - CAST(strftime('%s', MIN(event_timestamp)) AS INTEGER)) / 60
      AS session_duration_minutes,    -- first -> last event, exact whole minutes
    SUM(event_type = 'scroll')   AS scroll_count,   -- booleans sum as 1/0
    SUM(event_type = 'click')    AS click_count,
    SUM(event_type = 'purchase') AS purchase_count
  FROM app_events
  GROUP BY session_id, user_id        -- user_id is a real group key, not a rider
)
SELECT session_id, user_id, session_duration_minutes, scroll_count
FROM sessions
WHERE session_duration_minutes > 30            -- strictly more than half an hour
  AND scroll_count >= 5                        -- at least five scrolls
  AND click_count * 1.0 / scroll_count < 0.20  -- 1.0: integer 1/6 would floor to 0
  AND purchase_count = 0                       -- never monetized
ORDER BY scroll_count DESC, session_id ASC;`,
    order: "exact",
    walkthrough: [
      "The sessions CTE collapses all 65 events into 9 fingerprint rows. S001 measures 10:00→10:35 = 2100 seconds / 60 = 35 minutes with 6 scrolls, 0 clicks, 0 purchases; S009's scrambled event ids (59–65 stored out of time order) still measure 19:10→20:10 = 60 minutes because MAX and MIN read values, and its missing open/close rows cost it nothing.",
      "Gate one (duration > 30) executes first in spirit: S002 (20 min) and S004 (12 min) die, and S005 — five scrolls, zero clicks, zero purchases, otherwise a perfect zombie — dies at exactly 30 because the facts demand MORE than 30.",
      "Gates two and three split the rest: S008 fails at 4 scrolls (< 5), and S003 fails the ratio — 1 click over 5 scrolls is exactly 0.20, and the comparison is strictly <. S001 passes at 0/6 = 0.00 and S006 passes at 1 × 1.0 / 6 ≈ 0.17 (integer 1/6 would have floored to 0 for the wrong reason).",
      "Gate four (purchase_count = 0) finally kills S007 despite its 45 minutes, 5 scrolls and 0.00 ratio. Three sessions survive: S009 (7 scrolls) leads, and S001 and S006 tie at 6 — session_id ASC prints S001 before S006, matching the documented output exactly.",
    ],
    time: "O(e) — one pass over all events for the GROUP BY, then one pass over s session fingerprints for the gates",
    space: "O(s) for the session fingerprint rows",
    followUps: [
      "How would you catch sessions where a purchase arrives AFTER the app_close row (post-end activity)? (LEFT JOIN each session's purchase events against its app_close timestamp and filter ts > close — the fingerprint CTE gives you the anchor for free.)",
      "What if the 0.20 ratio threshold were adaptive — the bottom quartile of sessions by click share? (Replace the constant with a PERCENT_RANK()/NTILE() window over the sessions CTE.)",
    ],
    related: ["average-time-of-process-per-machine", "find-overbooked-employees", "trips-and-users"],
    xp: 35,
  },
  {
    slug: "most-common-course-pairs",
    statement:
      "A learning platform stores course completions with the completion date and the learner's 1–5 rating. First narrow the field to top performers — learners with at least 5 completions whose average rating is 4 or higher — then walk each performer's completions in chronological order and tally every CONSECUTIVE pair (course A followed immediately by course B). Return each pair with its transition count, ordered by count descending, then first_course ascending, then second_course ascending.",
    examples: [
      {
        input:
          "course_completions: users 1–4 hold the official 18 rows (user 1: six courses Python Basics → SQL Fundamentals → JavaScript → React Basics → Node.js → Docker, avg 4.5 · user 2: five courses avg 4.4 · user 3: five courses avg 2.8 · user 4: only three courses) + TRAPS — user 5 completes exactly 5 courses with ratings 4,4,5,3,4 (avg exactly 4.0) and takes SQL Fundamentals on 01-05 BEFORE Python Basics on 02-05 · user 6 takes 5 courses with avg 3.8 · user 7 takes 4 courses all rated 5",
        output:
          "Node.js Docker 2 · React Basics Node.js 2 · Docker AWS Fundamentals 1 · Docker Data Science 1 · JavaScript Docker 1 · JavaScript React Basics 1 · Python Basics JavaScript 1 · Python Basics React Basics 1 · Python Basics SQL Fundamentals 1 · SQL Fundamentals JavaScript 1 · SQL Fundamentals Python Basics 1",
        explanation:
          "Users 1 and 2 are the official top performers: their shared transitions Node.js → Docker and React Basics → Node.js each hit 2. User 5 qualifies at BOTH boundaries (5 courses, avg exactly 4.0) and contributes four singleton pairs — including SQL Fundamentals → Python Basics, proof that pairing follows completion_date, not course_id order. Users 6 (avg 3.8) and 7 (perfect 5.0 average but only 4 courses) are excluded BEFORE pairing; pairing them first would push React Basics → Node.js and Node.js → Docker to a phantom 3.",
      },
    ],
    constraints: [
      "(user_id, course_id) uniquely identifies a completion — one row per course per learner; ratings are integers 1–5",
      "top performer = at least 5 completions AND average rating >= 4 (both bounds inclusive)",
      "only consecutive pairs within each performer's chronological sequence count; output ordered by transition_count DESC, first_course ASC, second_course ASC",
    ],
    breakdown: [
      "What's really asked is NOT unordered co-enrollment (that would be the canonical a < b pairs of the category-pairs family) — it's ordered transitions: within one learner's timeline, which course immediately followed which. 'Immediately' is the operative word: a pair is two ADJACENT rows in the date-ordered sequence, so a 6-course learner yields exactly 5 pairs, never 15. Two gates must also be passed BEFORE any pairing: count >= 5 and average rating >= 4, both inclusive.",
      "The core mechanism is a three-CTE pipeline. top_performers is a plain GROUP BY/HAVING gate. sequenced stamps each performer's completions with ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY completion_date, course_id) — window in a CTE, consumed outside, the standard idiom for 'give every row a position in its partition'. transitions then pairs row k with row k + 1 via a self-join on (user_id, step + 1), which is the set-based way of walking adjacent elements.",
      "Why naive fails: pairing without sequencing (all C(6,2) unordered pairs per user) inflates counts and invents pairs nobody took back-to-back. Qualifying performers AFTER pairing is worse than wasteful — non-performers' transitions leak into the GROUP BY: user 6 would push React Basics → Node.js to 3 and Node.js → Docker to 3, and user 7 would add three more phantom singletons. Ordering by completion_date alone is also non-deterministic if two courses share a date — the course_id tiebreak makes the sequence reproducible, though the PK (user_id, course_id) already guarantees no duplicate course rows within a user.",
      "Assembly: top_performers → sequenced → transitions → GROUP BY first_course, second_course with COUNT(*) AS transition_count → ORDER BY transition_count DESC, first_course ASC, second_course ASC. The final ordering is mandated by the facts, so the sort keys must be output columns — COUNT(*) is aliased precisely so the ORDER BY can reference it cleanly.",
    ],
    edges: [
      "Both qualifier bounds are inclusive and the seed pins both: user 5's exactly-5 courses and exactly-4.0 average pass, while user 7's perfect 5.0 average still dies at 4 courses.",
      "Chronological ≠ id order: user 5 completes SQL Fundamentals (01-05) before Python Basics (02-05), producing SQL Fundamentals → Python Basics — sort by completion_date, never by course_id.",
      "Filter performers BEFORE pairing: user 6's and user 7's rows must never reach the transitions join, or Node.js → Docker and React Basics → Node.js jump to a phantom count of 3.",
      "Same-day completions have no order in the facts — the ROW_NUMBER tiebreak on course_id is a determinism choice; it can flip which of two same-day courses is 'first', so document it (this seed has no same-day pairs).",
    ],
    ladder: [
      {
        title: "Brute force — sort and walk each learner by hand",
        body: "For each learner, sort completions by date, walk adjacent pairs into a tally dictionary, but only for learners passing the 5-course / 4.0-average screen. Doing the screen after the tally is the classic bug that lets non-performers vote.",
      },
      {
        title: "The pattern — HAVING gate, ROW_NUMBER sequencing, step+1 join",
        body: "Three CTEs mirror the manual algorithm: GROUP BY/HAVING qualifies performers; ROW_NUMBER OVER (PARTITION BY user_id ORDER BY completion_date) numbers their steps; a self-join on b.step = a.step + 1 emits each consecutive pair.",
      },
      {
        title: "The optimal idea — one window sort, one hash join, one tally",
        body: "The pipeline is already optimal-shaped: O(n log n) for the per-user window sorts (n = completions of performers only, thanks to the pre-filter), a hash join on (user_id, step) for pairs, and one GROUP BY tally. LEAD(course_name) OVER the same ordering is an equally good one-pass variant — the self-join just makes the pairing visually explicit.",
      },
    ],
    approach: "HAVING-qualified performers + ROW_NUMBER sequencing + step+1 self-join",
    schema: {
      ddl: `CREATE TABLE course_completions (
  user_id         INTEGER NOT NULL,
  course_id       INTEGER NOT NULL,
  course_name     TEXT NOT NULL,
  completion_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  course_rating   INTEGER NOT NULL CHECK (course_rating BETWEEN 1 AND 5),
  PRIMARY KEY (user_id, course_id)
);`,
      seed: `INSERT INTO course_completions (user_id, course_id, course_name, completion_date, course_rating) VALUES
  (1, 101, 'Python Basics',    '2024-01-05', 5),  -- official users 1-4
  (1, 102, 'SQL Fundamentals', '2024-02-10', 4),
  (1, 103, 'JavaScript',       '2024-03-15', 5),
  (1, 104, 'React Basics',     '2024-04-20', 4),
  (1, 105, 'Node.js',          '2024-05-25', 5),
  (1, 106, 'Docker',           '2024-06-30', 4),
  (2, 101, 'Python Basics',    '2024-01-08', 4),
  (2, 104, 'React Basics',     '2024-02-14', 5),
  (2, 105, 'Node.js',          '2024-03-20', 4),
  (2, 106, 'Docker',           '2024-04-25', 5),
  (2, 107, 'AWS Fundamentals', '2024-05-30', 4),
  (3, 101, 'Python Basics',    '2024-01-10', 3),  -- official: 5 courses, avg 2.8
  (3, 102, 'SQL Fundamentals', '2024-02-12', 3),
  (3, 103, 'JavaScript',       '2024-03-18', 3),
  (3, 104, 'React Basics',     '2024-04-22', 2),
  (3, 105, 'Node.js',          '2024-05-28', 3),
  (4, 101, 'Python Basics',    '2024-01-12', 5),  -- official: only 3 courses
  (4, 108, 'Data Science',     '2024-02-16', 5),
  (4, 109, 'Machine Learning', '2024-03-22', 5),
  (5, 102, 'SQL Fundamentals', '2024-01-05', 4),  -- TRAP: 5 courses, avg exactly
  (5, 101, 'Python Basics',    '2024-02-05', 4),  -- 4.0 (both bounds inclusive);
  (5, 103, 'JavaScript',       '2024-03-05', 5),  -- SQL taken BEFORE Python ->
  (5, 106, 'Docker',           '2024-04-05', 3),  -- date order != course_id order
  (5, 108, 'Data Science',     '2024-05-05', 4),
  (6, 101, 'Python Basics',    '2024-01-20', 5),  -- TRAP: 5 courses but avg 3.8
  (6, 102, 'SQL Fundamentals', '2024-02-20', 4),  -- -> must not contribute pairs
  (6, 104, 'React Basics',     '2024-03-20', 4),
  (6, 105, 'Node.js',          '2024-04-20', 3),
  (6, 106, 'Docker',           '2024-05-20', 3),
  (7, 101, 'Python Basics',    '2024-01-25', 5),  -- TRAP: all ratings 5 but only
  (7, 102, 'SQL Fundamentals', '2024-02-25', 5),  -- 4 courses -> count gate kills
  (7, 103, 'JavaScript',       '2024-03-25', 5),
  (7, 104, 'React Basics',     '2024-04-25', 5);`,
      tables: [
        { name: "course_completions", note: "33 rows — users 1–4 official; user 5 boundary-qualifier, users 6/7 near-miss exclusions" },
      ],
    },
    code: `WITH top_performers AS (
  -- the gate, applied FIRST: at least 5 completions AND avg rating >= 4
  SELECT user_id
  FROM course_completions
  GROUP BY user_id
  HAVING COUNT(*) >= 5
     AND AVG(course_rating) >= 4
),
sequenced AS (
  -- each qualifying learner's completions in chronological order
  SELECT
    user_id,
    course_name,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY completion_date, course_id  -- course_id: deterministic same-day tiebreak
    ) AS step
  FROM course_completions
  WHERE user_id IN (SELECT user_id FROM top_performers)
),
transitions AS (
  -- pair each course with the one completed IMMEDIATELY after
  SELECT
    a.course_name AS first_course,
    b.course_name AS second_course
  FROM sequenced a
  JOIN sequenced b
    ON  b.user_id = a.user_id
    AND b.step = a.step + 1
)
SELECT
  first_course,
  second_course,
  COUNT(*) AS transition_count
FROM transitions
GROUP BY first_course, second_course
ORDER BY transition_count DESC, first_course ASC, second_course ASC;`,
    order: "exact",
    walkthrough: [
      "top_performers filters before anything pairs: users 1 (6 courses, avg 4.5) and 2 (5 courses, avg 4.4) pass as in the official example, and trap user 5 passes at both boundaries — 5 courses, ratings 4+4+5+3+4 = exactly 4.0. Users 3 (2.8), 4 (3 courses), 6 (3.8) and 7 (4 courses) never reach sequencing, so user 6's React Basics → Node.js and user 7's Python Basics → SQL Fundamentals are never emitted.",
      "sequenced numbers each survivor's rows by date: user 1 gets steps 1–6 (Python Basics → Docker), user 2 steps 1–5, and user 5's numbering puts SQL Fundamentals (01-05) at step 1 with Python Basics (02-05) at step 2 — date order, deliberately not course_id order.",
      "transitions pairs adjacent steps per user: user 1 contributes 5 pairs, user 2 contributes 4, user 5 contributes 4 — SQL Fundamentals → Python Basics, Python Basics → JavaScript, JavaScript → Docker and Docker → Data Science. That's 13 pairs total.",
      "The final GROUP BY tallies 11 distinct pairs: Node.js → Docker and React Basics → Node.js reach 2 (users 1 and 2 both took that road); the nine singletons sort by first_course then second_course — Docker's two pairs share their first name, so AWS Fundamentals precedes Data Science, and the three Python Basics pairs sort JavaScript < React Basics < SQL Fundamentals.",
    ],
    time: "O(n log n) for the windowed sorts over n performer completions (the pre-filter keeps n small), plus O(n) for the pairing join and tally",
    space: "O(n) for the sequenced rows and the pair hash table",
    followUps: [
      "How would you report each performer's single most common outgoing transition instead of a global tally? (Window the pair counts with ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY cnt DESC) and keep rk = 1.)",
      "What if completions could share a date and the 'immediately after' semantics had to respect the course's position in a syllabus rather than the wall clock? (Order by a syllabus_order column instead of the date; the step+1 join shape is unchanged.)",
    ],
    related: ["find-students-who-improved", "queries-quality-and-percentage", "rank-scores"],
    xp: 35,
  },
  {
    slug: "find-emotionally-consistent-users",
    statement:
      "Users react to content items with labels such as like, wow, sad or love; each user can react to a given item at most once. Report the users who reacted to at least 5 DIFFERENT content items and whose single most-used reaction accounts for at least 60% of all their reactions — showing the dominant reaction label and its share rounded to 2 decimals, ordered by share descending then user_id ascending.",
    examples: [
      {
        input:
          "reactions: users 1–3 hold the official 15 rows (user 1: four like + one wow · user 2: two like, two wow, one sad · user 3: five love) + TRAPS — user 4 reacts love ×4 (one short of five items) · user 5 reacts six times, four like · user 6 reacts five times, three wow · user 7 reacts seven times, four like · user 8 reacts love ×3 AND Love ×3 (a case split)",
        output: "3 love 1 · 1 like 0.8 · 5 like 0.67 · 6 wow 0.6",
        explanation:
          "User 3's perfect 5/5 = 1 and user 1's official 4/5 = 0.8 lead the table. User 5's 4/6 rounds to 0.67 and clears the bar; user 6's 3/5 sits EXACTLY on 0.6 and survives because the rule is 'at least 60%'. Every trap dies of one cause: user 4 never reaches five items (its ratio would be a perfect 1.0 — irrelevant), user 7's 4/7 ≈ 0.57 falls short, and user 8's split of love ×3 vs Love ×3 caps the max share at 3/6 = 0.5 — case-blind grouping would wrongly see 6/6 love and print a fake 1.00.",
      },
    ],
    constraints: [
      "(user_id, content_id) is the primary key — one reaction per user per content item, so a user's row count IS their distinct content-item count",
      "eligibility: at least 5 reacted content items; consistency: dominant reaction covers at least 60% of all the user's reactions",
      "reaction_ratio is rounded to 2 decimal places for display; output ordered by reaction_ratio DESC, then user_id ASC",
    ],
    breakdown: [
      "What's really asked is a per-user mode (most frequent reaction label) plus two gates: eligibility (at least 5 distinct content items) and consistency (mode share >= 60%). The output needs the mode LABEL and its share together — so the aggregation must keep the label attached to its count, not just produce a bare MAX.",
      "The core mechanism is two-level aggregation. The counts CTE aggregates reactions per (user_id, reaction). A windowed ROW_NUMBER ordered by cnt DESC (reaction ASC to break ties deterministically) ranks each user's labels — built in a CTE and filtered with rk = 1 outside, the standard window-then-filter idiom. A totals subquery sums the counts back up per user; because (user_id, content_id) is the primary key, SUM(cnt) for a user equals the number of distinct content items they reacted to, so one number serves both the eligibility gate and the ratio's denominator.",
      "Why naive fails: MAX(cnt) finds the biggest count but loses which label owns it, so you can't print dominant_reaction without a second self-join on (user_id, cnt) that still needs tie handling. Comparing the ROUNDED ratio to 0.6 is subtly wrong — the facts round for DISPLAY; the 'at least 60%' test runs on the true fraction (this seed avoids the ambiguity, but a 0.596 share rounding to 0.60 would flip if you compared after rounding). And grouping case-blindly (UPPER(reaction), or a case-insensitive collation) merges 'Love' into 'love' — user 8 would print a fake 6/6 = 1.00 instead of the true 3/6 = 0.5.",
      "Assembly: counts → ranked (window) and totals (group-by) in parallel → join them, keep rk = 1 rows, apply total >= 5 and 1.0 * cnt / total >= 0.6 on the UNROUNDED share, and only then ROUND(1.0 * cnt / total, 2) once for output. ORDER BY reaction_ratio DESC, user_id ASC matches the mandated ordering — and ROUND's result is what sorts, which is safe here because rounding is monotonic.",
    ],
    edges: [
      "The 5-item gate is about content items, not reaction types: user 4's four loves would win any ratio contest (1.00) but never reach the gate.",
      "0.6 is inclusive: user 6's 3/5 = 0.60 survives — and the boundary must be tested against the UNROUNDED fraction, with ROUND applied only for display.",
      "Reaction labels compare case-sensitively ('Love' ≠ 'love'): user 8's max share is 3/6 = 0.5 and it's excluded — LOWER() or a CI collation would fabricate a perfect 1.00.",
      "Dominant-label ties are broken alphabetically for determinism ('like' over 'wow' for user 2): the choice is unobservable here because tied users fail the 0.6 bar anyway, but the code must stay deterministic.",
    ],
    ladder: [
      {
        title: "Brute force — tally each user's labels by hand",
        body: "For each user, build a dict of label → count, find the max label, compute its share, check the two gates. The SQL translation needs the label+count pairing done explicitly — a bare MAX(cnt) can't tell you what label owned it.",
      },
      {
        title: "The pattern — rank the label counts, then filter rank 1",
        body: "Aggregate per (user, reaction), rank labels within each user with ROW_NUMBER (cnt DESC, label ASC), and separately SUM the counts per user. Joining rank-1 rows to totals gives dominant label, dominant count and denominator in one flat result.",
      },
      {
        title: "The optimal idea — one scan feeding both the window and the totals",
        body: "The counts CTE is scanned once and feeds two consumers (the windowed ranking and the totals), so the whole query is one aggregation pass plus one hash join. Gates run on the unrounded share; ROUND fires exactly once, in the SELECT list.",
      },
    ],
    approach: "Dominant label via ROW_NUMBER over per-label counts + unrounded-share gates",
    schema: {
      ddl: `CREATE TABLE reactions (
  user_id    INTEGER NOT NULL,
  content_id INTEGER NOT NULL,
  reaction   TEXT NOT NULL,
  PRIMARY KEY (user_id, content_id)
);`,
      seed: `INSERT INTO reactions (user_id, content_id, reaction) VALUES
  (1, 101, 'like'), (1, 102, 'like'), (1, 103, 'like'),   -- official users 1-3
  (1, 104, 'wow'),  (1, 105, 'like'),
  (2, 201, 'like'), (2, 202, 'wow'),  (2, 203, 'sad'),
  (2, 204, 'like'), (2, 205, 'wow'),
  (3, 301, 'love'), (3, 302, 'love'), (3, 303, 'love'),
  (3, 304, 'love'), (3, 305, 'love'),
  (4, 401, 'love'), (4, 402, 'love'),                     -- TRAP: only 4 items
  (4, 403, 'love'), (4, 404, 'love'),                     -- (perfect 1.0 ratio, moot)
  (5, 501, 'like'), (5, 502, 'like'), (5, 503, 'like'),   -- TRAP: 4/6 = 0.67 qualifies
  (5, 504, 'like'), (5, 505, 'wow'),  (5, 506, 'sad'),
  (6, 601, 'wow'),  (6, 602, 'wow'),  (6, 603, 'wow'),    -- TRAP: exactly 3/5 = 0.6
  (6, 604, 'like'), (6, 605, 'sad'),                      -- (>= keeps it)
  (7, 701, 'like'), (7, 702, 'like'), (7, 703, 'like'),   -- TRAP: 4/7 = 0.57 ->
  (7, 704, 'like'), (7, 705, 'wow'),  (7, 706, 'sad'),    -- just below the bar
  (7, 707, 'angry'),
  (8, 801, 'love'), (8, 802, 'love'), (8, 803, 'love'),   -- TRAP: 'love' x3 + 'Love' x3
  (8, 804, 'Love'), (8, 805, 'Love'), (8, 806, 'Love');   -- case-split -> max 3/6 = 0.5`,
      tables: [
        { name: "reactions", note: "34 rows — users 1–3 official; users 4–8 are the gate, boundary, near-miss and case-sensitivity traps" },
      ],
    },
    code: `WITH counts AS (
  -- reactions per (user, label)
  SELECT user_id, reaction, COUNT(*) AS cnt
  FROM reactions
  GROUP BY user_id, reaction
),
ranked AS (
  -- rank each user's labels by frequency; ties fall back to alphabetical
  -- so the pick is deterministic even when the user fails the bar anyway
  SELECT
    user_id,
    reaction,
    cnt,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY cnt DESC, reaction ASC
    ) AS rk
  FROM counts
),
totals AS (
  -- PK (user_id, content_id) means one row per content item:
  -- SUM(cnt) IS the distinct content-item count
  SELECT user_id, SUM(cnt) AS total
  FROM counts
  GROUP BY user_id
)
SELECT
  r.user_id,
  r.reaction AS dominant_reaction,
  ROUND(1.0 * r.cnt / t.total, 2) AS reaction_ratio  -- display-only rounding
FROM ranked r
JOIN totals t
  ON t.user_id = r.user_id
WHERE r.rk = 1                          -- only the dominant label
  AND t.total >= 5                      -- at least 5 different content items
  AND 1.0 * r.cnt / t.total >= 0.6      -- consistency bar, on the TRUE fraction
ORDER BY reaction_ratio DESC, r.user_id ASC;`,
    order: "exact",
    walkthrough: [
      "counts reduces 34 rows to 15 label tallies: user 1 → like 4, wow 1; user 2 → like 2, wow 2, sad 1; user 3 → love 5; user 4 → love 4; user 5 → like 4, wow 1, sad 1; user 6 → wow 3, like 1, sad 1; user 7 → like 4, wow 1, sad 1, angry 1; user 8 → love 3 AND Love 3 as two separate labels.",
      "ranked assigns rk 1 per user: 'like' for users 1, 5 and 7; 'love' for user 3; 'wow' for user 6; 'like' (alphabetical, over 'wow') for user 2; and 'Love' for user 8 — capital 'L' sorts before lowercase 'l' in binary order, though the choice is moot at 0.5.",
      "totals + gates: user 1 → 4/5 = 0.8 ≥ 0.6 ✓; user 2 → 0.4 ✗; user 3 → 1.0 ✓; user 4 → total 4 < 5 ✗ (its 1.0 share never matters); user 5 → 4/6 ≈ 0.6667 ✓; user 6 → 3/5 = 0.60 exactly, and 'at least 60%' keeps it; user 7 → 4/7 ≈ 0.5714 ✗; user 8 → 3/6 = 0.5 ✗.",
      "Four survivors get their display ratio — 1, 0.8, 0.67, 0.6 — and ORDER BY sorts them 3, 1, 5, 6: ratio descending, then user_id. Exactly the documented snapshot.",
    ],
    time: "O(r) — one pass over r reactions for the counts CTE, then linear passes for the window, totals and join",
    space: "O(u · k) for u users holding k distinct labels each",
    followUps: [
      "How would you measure consistency over a user's LAST 5 reactions instead of their lifetime? (Number each reaction per user with ROW_NUMBER over the arrival order and restrict the aggregation to steps > max(step) - 5.)",
      "What if you had to report ALL mode labels when several tie for the dominant count? (Replace the rk = 1 filter with RANK() and keep every row whose count equals MAX(cnt) — then decide which label, if any, 'dominant_reaction' names.)",
    ],
    related: ["find-books-with-polarized-opinions", "percentage-of-users-attended-a-contest", "queries-quality-and-percentage"],
    xp: 20,
  },
  {
    slug: "find-users-with-persistent-behavior-patterns",
    statement:
      "An activity log records which action each user performed on each date; a user may perform several DIFFERENT actions on the same day. A user is behaviorally stable when some streak of at least 5 consecutive calendar days exists in which they performed exactly ONE action per day and it was the same action on every one of those days. Report each stable user once — their longest such streak with its action, length, first date and last date — ordered by streak_length descending, then user_id ascending.",
    examples: [
      {
        input:
          "activity: users 1–3 hold the official 17 rows (user 1: login 01-01→01-05 then logout on 01-06 · user 2: click 01-01→01-04 · user 3: view 01-01→01-07) + TRAPS — user 4 logs in 02-01→02-05 but ALSO clicks on 02-03 · user 5 views 01-29→02-02, straight across the month boundary · user 6 logs in 03-01→03-06 AND views 03-10→03-14 · user 7 scrolls 04-01→04-05",
        output:
          "3 view 7 2024-01-01 2024-01-07 · 6 login 6 2024-03-01 2024-03-06 · 1 login 5 2024-01-01 2024-01-05 · 5 view 5 2024-01-29 2024-02-02 · 7 scroll 5 2024-04-01 2024-04-05",
        explanation:
          "User 3's 7-day view run leads, user 1's official 5-day login run survives (logout lives on its own single-action day), and user 2's 4-day click run misses the minimum. The traps: user 4's login run LOOKS like 5 days but the extra click on 02-03 means that day had two actions — 'exactly one action per day' snaps the run to 2 + 2; user 5's run crosses Jan→Feb unharmed; user 6 has two qualifying streaks and only the maximum (login, 6) is reported; user 7 ties user 5 at 5 and user_id ASC puts 5 before 7.",
      },
    ],
    constraints: [
      "(user_id, action_date, action) is the primary key — the same action can never repeat on one date, so a two-row day means two DIFFERENT actions",
      "stable = at least 5 consecutive calendar days with exactly one action per day and that action identical throughout",
      "report one row per stable user — the maximum-length qualifying sequence; output ordered by streak_length DESC, then user_id ASC",
    ],
    breakdown: [
      "What's really asked is a per-(user, action) run of consecutive CALENDAR days — but with a precondition that's easy to skim past: every day of the run must contain EXACTLY ONE action. The primary key allows a user to hold several different actions on one date, and the definition's 'exactly one action per day' bullet exists precisely to judge those days: a day with two actions can't sit inside any qualifying streak, for any action.",
      "The core mechanism is the classic gaps-and-islands, in two stages. Stage one is a windowed COUNT(*) OVER (PARTITION BY user_id, action_date) that flags multi-action days; those rows drop before islanding, because they can never belong to a streak. Stage two keys each island by day_number − ROW_NUMBER: CAST(strftime('%s', action_date) AS INTEGER) / 86400 turns each date into an exact integer day number, and subtracting the per-(user, action) rank leaves a constant group id exactly while dates advance one day per row — any gap re-bumps the rank and starts a new group.",
      "Why naive fails in three ways. Ignoring the one-action clause and islanding raw rows would report user 4's 02-01→02-05 login as a clean 5-run when the 02-03 click snaps it to 2 + 2. Using julianday() for the day number is a float trap — a real 35-minute span computes as 34.999999… days and CASTs to 34; epoch seconds stay integral. And grouping dates by month or formatting them as strings breaks exactly at month boundaries — user 5's 01-29→02-02 run must survive the Jan→Feb rollover, which pure day-number arithmetic handles silently.",
      "Assembly: one_action_days → streaks (island keys) → runs (MIN/MAX dates and COUNT per island) → best, where ROW_NUMBER per user ordered by streak_length DESC picks the maximum-length sequence (start_date ASC, action ASC as deterministic tiebreaks for a case the facts leave unspecified) → the final SELECT prints the rk = 1 row per user, ORDER BY streak_length DESC, user_id ASC as mandated.",
    ],
    edges: [
      "Exactly-one-action rule: user 4's extra click on 02-03 means that date holds two actions — BOTH of its rows drop, and the login run collapses to 2 + 2, under the 5-day bar.",
      "The PK already forbids the same action twice on one date — the only way a day gets two rows is two different actions, which is exactly what the one-action filter must catch.",
      "Month boundary: user 5's 01-29 → 02-02 run survives because epoch day numbers 19751…19755 are simply adjacent integers — no month-aware logic exists to break.",
      "Multiple qualifying streaks: user 6 keeps only the 6-day login run; if a user's two runs ever TIED at max length, the ROW_NUMBER tiebreak (earlier start_date, then action name) picks one deterministically — this seed avoids that case, as the facts don't specify it.",
    ],
    ladder: [
      {
        title: "Brute force — walk each user's calendar day by day",
        body: "For each user and action, walk dates checking that date + 1 exists with the same action and that the day carries exactly one row. O(rows × run length) and awkward to express in set-based SQL — the classic shape is loops, not queries.",
      },
      {
        title: "The pattern — gaps-and-islands on day numbers",
        body: "Turn each date into an integer day number, subtract the per-(user, action) ROW_NUMBER, and consecutive days share a constant island key. GROUP BY the island to get MIN/MAX dates and COUNT = streak length.",
      },
      {
        title: "The optimal idea — pre-filter impure days, then island on integers",
        body: "A windowed COUNT(*) OVER (PARTITION BY user_id, action_date) drops multi-action days BEFORE islanding (no self-join needed), epoch-second day numbers keep the arithmetic float-free, and ROW_NUMBER per user picks the longest run in one more pass — one sort plus two hash group-bys overall.",
      },
    ],
    approach: "One-action-day pre-filter + gaps-and-islands streaks + per-user max via ROW_NUMBER",
    schema: {
      ddl: `CREATE TABLE activity (
  user_id     INTEGER NOT NULL,
  action_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  action      TEXT NOT NULL,
  PRIMARY KEY (user_id, action_date, action)
);`,
      seed: `INSERT INTO activity (user_id, action_date, action) VALUES
  (1, '2024-01-01', 'login'), (1, '2024-01-02', 'login'),   -- official users 1-3
  (1, '2024-01-03', 'login'), (1, '2024-01-04', 'login'),
  (1, '2024-01-05', 'login'), (1, '2024-01-06', 'logout'),
  (2, '2024-01-01', 'click'), (2, '2024-01-02', 'click'),   -- official: 4-day run,
  (2, '2024-01-03', 'click'), (2, '2024-01-04', 'click'),   -- one short of 5
  (3, '2024-01-01', 'view'),  (3, '2024-01-02', 'view'),
  (3, '2024-01-03', 'view'),  (3, '2024-01-04', 'view'),
  (3, '2024-01-05', 'view'),  (3, '2024-01-06', 'view'),
  (3, '2024-01-07', 'view'),
  (4, '2024-02-01', 'login'), (4, '2024-02-02', 'login'),   -- TRAP: login 02-01..02-05
  (4, '2024-02-03', 'login'), (4, '2024-02-03', 'click'),   -- but TWO actions on 02-03
  (4, '2024-02-04', 'login'), (4, '2024-02-05', 'login'),   -- -> run snaps to 2 + 2
  (5, '2024-01-29', 'view'),  (5, '2024-01-30', 'view'),    -- TRAP: 5-day run across
  (5, '2024-01-31', 'view'),  (5, '2024-02-01', 'view'),    -- the Jan/Feb boundary
  (5, '2024-02-02', 'view'),
  (6, '2024-03-01', 'login'), (6, '2024-03-02', 'login'),   -- TRAP: two separate
  (6, '2024-03-03', 'login'), (6, '2024-03-04', 'login'),   -- streaks (6-day login,
  (6, '2024-03-05', 'login'), (6, '2024-03-06', 'login'),   -- 5-day view, 3-day gap):
  (6, '2024-03-10', 'view'),  (6, '2024-03-11', 'view'),    -- only the max is reported
  (6, '2024-03-12', 'view'),  (6, '2024-03-13', 'view'),
  (6, '2024-03-14', 'view'),
  (7, '2024-04-01', 'scroll'), (7, '2024-04-02', 'scroll'), -- TRAP: 5-day run tying
  (7, '2024-04-03', 'scroll'), (7, '2024-04-04', 'scroll'), -- user 5's length ->
  (7, '2024-04-05', 'scroll');                              -- user_id ASC breaks the tie`,
      tables: [
        { name: "activity", note: "44 rows — users 1–3 official; users 4–7 are the impure-day, month-boundary, two-streak and ordering-tie traps" },
      ],
    },
    code: `WITH one_action_days AS (
  -- keep only (user, date) days with EXACTLY one action: a day holding two
  -- different actions can never belong to a qualifying streak
  SELECT user_id, action_date, action
  FROM (
    SELECT
      user_id, action_date, action,
      COUNT(*) OVER (PARTITION BY user_id, action_date) AS actions_that_day
    FROM activity
  ) checked
  WHERE actions_that_day = 1
),
streaks AS (
  -- gaps-and-islands: consecutive calendar days of one action share a group id
  SELECT
    user_id,
    action,
    action_date,
    CAST(strftime('%s', action_date) AS INTEGER) / 86400
      - ROW_NUMBER() OVER (
          PARTITION BY user_id, action
          ORDER BY action_date
        ) AS grp  -- day number minus rank: constant while dates step +1 per row
  FROM one_action_days
),
runs AS (
  SELECT
    user_id,
    action,
    MIN(action_date) AS start_date,
    MAX(action_date) AS end_date,
    COUNT(*)         AS streak_length
  FROM streaks
  GROUP BY user_id, action, grp
),
best AS (
  -- one winner per user: the LONGEST run (ties -> earliest start, then name)
  SELECT
    user_id, action, start_date, end_date, streak_length,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY streak_length DESC, start_date ASC, action ASC
    ) AS rk
  FROM runs
  WHERE streak_length >= 5   -- the persistence bar
)
SELECT user_id, action, streak_length, start_date, end_date
FROM best
WHERE rk = 1
ORDER BY streak_length DESC, user_id ASC;`,
    order: "exact",
    walkthrough: [
      "one_action_days filters 44 rows to 42: only user 4's (4, 02-03) carries COUNT 2 — login plus click — so both of its rows drop. Everything else survives, including user 1's logout (its own single-action day) and all of user 6's two runs.",
      "streaks builds island keys: user 1's logins 01-01…01-05 take ranks 1–5 against day numbers 19723–19727, leaving grp = 19722 for all five; the 01-06 logout islands alone under a different (user, action) partition; user 5's 01-29…02-02 spans day numbers 19751–19755 — the month rollover is invisible because the numbers simply increment.",
      "runs collapses islands: user 6's logins form a 6-run (03-01→03-06) and views a 5-run (03-10→03-14), the 03-07…03-09 gap keeping them separate; user 4's surviving logins regroup to a 2-run and a 2-run; user 2's click run tops out at 4.",
      "best keeps runs >= 5 and ROW_NUMBER picks one winner per user: user 6's login 6 beats its view 5. The final print — user 3 (view, 7), user 6 (login, 6), then the three 5-runs by user_id (1, 5, 7) with user 5's end_date showing 2024-02-02 — matches the documented output exactly.",
    ],
    time: "O(n log n) — one window sort per partition (day-purity count, island ranks, per-user max), everything else linear",
    space: "O(n) for the filtered rows, island keys and run table",
    followUps: [
      "How would you tolerate a single missed day inside a streak (runs may have one-day gaps)? (LAG the previous date per (user, action) and start a new island only when the gap exceeds 1 day — date(prev, '+1 day') < current.)",
      "What about alternating daily rituals, like login → purchase → login → purchase? (Pair each day with LEAD(action) OVER the user's date order and treat (action, next_action) tuples as the island key instead of action alone.)",
    ],
    related: ["find-loyal-customers", "active-users", "human-traffic-of-stadium"],
    xp: 35,
  },
];
