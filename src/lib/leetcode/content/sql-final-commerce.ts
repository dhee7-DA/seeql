// Deep-dives — the SQL Final band: COMMERCE (LC 3521 / 3564 / 3570 / 3626 /
// 3642 / 3657). Solutions are SQLite dialect, one statement each, engine-
// verified against the per-problem seeds (the 4th co-purchaser, the year-
// straddling Winter bucket, the zero-copy never-loaned book, the ratio tie,
// the exactly-0.60 split and the refund-denominator flip are the traps).
import type { LcSqlDive } from "../types";

export const SQL_FINAL_COMMERCE: LcSqlDive[] = [
  {
    slug: "find-product-recommendation-pairs",
    statement:
      "A store logs one row per customer-product purchase, keyed uniquely by (user_id, product_id). Build the 'frequently bought together' shortlist: every distinct product pair, smaller id first, that at least three DIFFERENT customers have both bought — reporting both products' categories and the shared-customer count. Rank pairs by shared customers descending, breaking ties by product1_id then product2_id ascending.",
    examples: [
      {
        input:
          "ProductPurchases: user 1 → 101,102,103 · user 2 → 101,102,104 · user 3 → 101,103,105 · user 4 → 101,102,103,104 · user 5 → 102,104 — plus trap user 6 → 101,102,103 · ProductInfo: 101 Electronics · 102 Books · 103 Clothing · 104 Kitchen · 105 Sports",
        output:
          "(101, 102, Electronics, Books, 4) · (101, 103, Electronics, Clothing, 4) · (102, 103, Books, Clothing, 3) · (102, 104, Books, Kitchen, 3)",
        explanation:
          "The official pairs (101,102)/(101,103)/(102,104) each had 3 shared customers; trap user 6 lifts (101,102) and (101,103) to 4 AND pushes (102,103) from 2 to exactly 3 — the ≥ 3 boundary — while (101,104) stalls at two customers and stays out. Equal customer_counts break by product1_id, then product2_id.",
      },
    ],
    constraints: [
      "(user_id, product_id) is the table's unique key — one row per customer-product; quantity plays no role in pairing",
      "a pair qualifies when ≥ 3 distinct customers bought BOTH products; emit product1_id < product2_id only",
      "output order: customer_count DESC, then product1_id ASC, then product2_id ASC",
    ],
    breakdown: [
      "What's really asked: for every unordered pair of products, how many customers bought BOTH — then keep the pairs with at least three such customers. The pairing unit is the CUSTOMER, not the transaction: quantity, price and repeat purchases are noise (the facts even pin (user_id, product_id) as the unique key, so each customer owns at most one row per product). And 'distinct pairs' means canonical shapes only — (101,102) and (102,101) are one pair, which is exactly what product1_id < product2_id enforces.",
      "The core mechanism is the co-purchase self-join: alias ProductPurchases twice (a and b), join on the same user_id, and emit a.product_id < b.product_id. Each customer contributes one row per unordered pair they own — user 4, who bought four products, fans out to all C(4,2) = 6 pairs. Then it's a plain GROUP BY the pair, COUNT(DISTINCT user_id), HAVING >= 3.",
      "Why naive fails: people reach for COUNT(*) and get away with it HERE because the key is unique — but paste the same query onto a purchase LOG (one row per transaction) and repeat buyers silently count twice. The other classic miss is pairing on CATEGORY instead of product — that changes the grain entirely (it is literally the sibling problem, Find Category Recommendation Pairs). Categories belong at the END, as a label lookup.",
      "Assembly: pairs CTE → shared CTE (group, count, HAVING) → join ProductInfo twice, once per slot, aliased i1/i2 so 101's category lands in product1_category and 102's in product2_category. The facts mandate the ranking (customer_count DESC, then pair ids ascending), so the ORDER BY is part of the answer, not decoration.",
    ],
    edges: [
      "The ≥ 3 bar is inclusive: trap user 6 lifts (102,103) from 2 to EXACTLY 3 — in — while (101,104) stalls at two and stays out.",
      "Symmetry dedupe is the join predicate itself: a.product_id < b.product_id means (102,101) is never generated, so no trailing SELECT DISTINCT is needed.",
      "COUNT(DISTINCT user_id), not COUNT(*): with the unique key they agree, but on a per-transaction log COUNT(*) would count a repeat purchase twice.",
      "Categories are joined LAST, once per slot (i1/i2); pairing on category instead of product changes the problem (that's Find Category Recommendation Pairs, 3554).",
    ],
    ladder: [
      {
        title: "Brute force — enumerate pairs in application code",
        body: "Pull every customer's product set and count pair memberships in a hash map, or self-join without the < predicate and dedupe symmetric twins afterward. Correct, but quadratic in products per customer and fiddly about symmetry.",
      },
      {
        title: "The pattern — canonical self-join + group",
        body: "JOIN ProductPurchases to itself on user_id with a.product_id < b.product_id; GROUP BY the pair, COUNT(DISTINCT user_id), HAVING >= 3. The < in the ON clause IS the dedupe — each unordered pair is generated exactly once per shared customer.",
      },
      {
        title: "The optimal idea — aggregate narrow, label wide",
        body: "Do all counting on the narrow purchase table, then join ProductInfo twice purely to fetch display categories. Same complexity, but the wide text columns never touch the grouping — and the mandated ORDER BY falls out of the final SELECT.",
      },
    ],
    approach: "Canonical co-purchase self-join (p1 < p2) + HAVING count >= 3",
    schema: {
      ddl: `CREATE TABLE ProductPurchases (
  user_id    INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  quantity   INTEGER NOT NULL,
  PRIMARY KEY (user_id, product_id)   -- the official unique key: one row per customer-product
);
CREATE TABLE ProductInfo (
  product_id INTEGER PRIMARY KEY,
  category   TEXT NOT NULL,
  price      REAL NOT NULL
);`,
      seed: `INSERT INTO ProductPurchases (user_id, product_id, quantity) VALUES
  (1, 101, 2), (1, 102, 1), (1, 103, 3),   -- official rows
  (2, 101, 1), (2, 102, 5), (2, 104, 1),
  (3, 101, 2), (3, 103, 1), (3, 105, 4),
  (4, 101, 1), (4, 102, 1), (4, 103, 2), (4, 104, 3),
  (5, 102, 2), (5, 104, 1),
  (6, 101, 1), (6, 102, 1), (6, 103, 1);   -- TRAP: lifts (101,102)/(101,103) to 4, (102,103) to exactly 3
INSERT INTO ProductInfo (product_id, category, price) VALUES
  (101, 'Electronics', 100),
  (102, 'Books', 20),
  (103, 'Clothing', 35),
  (104, 'Kitchen', 50),
  (105, 'Sports', 75);`,
      tables: [
        { name: "ProductPurchases", note: "18 rows — the official 15 plus trap user 6 (buys 101, 102, 103)" },
        { name: "ProductInfo", note: "5 products with category + price (labels only — never grouped on)" },
      ],
    },
    code: `WITH pairs AS (
    -- one row per (customer, unordered product pair); p1 < p2 kills the mirror
    SELECT
        a.user_id,
        a.product_id AS product1_id,
        b.product_id AS product2_id
    FROM ProductPurchases a
    JOIN ProductPurchases b
      ON b.user_id = a.user_id
     AND a.product_id < b.product_id      -- canonical order: no (B,A) twins
),
shared AS (
    SELECT
        product1_id,
        product2_id,
        COUNT(DISTINCT user_id) AS customer_count  -- DISTINCT: one customer counts once
    FROM pairs
    GROUP BY product1_id, product2_id
    HAVING COUNT(DISTINCT user_id) >= 3            -- the "at least 3 customers" bar (inclusive)
)
SELECT
    s.product1_id,
    s.product2_id,
    i1.category AS product1_category,    -- labels fetched AFTER the counting
    i2.category AS product2_category,
    s.customer_count
FROM shared s
JOIN ProductInfo i1 ON i1.product_id = s.product1_id
JOIN ProductInfo i2 ON i2.product_id = s.product2_id
ORDER BY s.customer_count DESC, s.product1_id ASC, s.product2_id ASC;`,
    walkthrough: [
      "The self-join walks each customer's product set: user 1 owns {101,102,103} → three canonical pairs; user 4 owns four products → six pairs; trap user 6 adds (101,102), (101,103) and (102,103). Every emitted row already satisfies product1 < product2, so (102,101)-shaped twins never exist.",
      "The GROUP BY collapses everything to eight distinct pairs. Counting shared customers: (101,102) draws users 1, 2, 4 and trap user 6 → 4; (101,103) likewise → 4; (102,103) hits exactly 3 (users 1, 4, 6) — the ≥ 3 boundary — and (102,104) keeps its official 3. (101,104) stops at two and dies in HAVING, along with (103,104), (101,105) and (103,105).",
      "The two ProductInfo joins stamp the labels: 101 → Electronics, 102 → Books, 103 → Clothing, 104 → Kitchen — i1 feeds product1_category, i2 feeds product2_category, and nothing about the counts changes.",
      "The ORDER BY sorts customer_count DESC (4, 4, 3, 3) and breaks ties by the pair ids: (101,102) before (101,103), then (102,103) before (102,104) — the four-row recommendation list.",
    ],
    time: "O(Σ_c k_c²) — the self-join emits every unordered pair per customer (k = products per customer), then a linear group-by over the emitted pairs",
    space: "O(pairs) — the canonical pair rows before aggregation",
    followUps: [
      "Pair CATEGORIES instead of products — where does the ≥ 3 threshold's meaning change, and why does the canonical-ordering trick now need two inequality keys? (cf. Find Category Recommendation Pairs)",
      "Return, for every product, its single best partner (a per-product top-1): does ROW_NUMBER over the pairs CTE beat a correlated subquery on this seed?",
    ],
    related: ["customers-who-bought-all-products", "find-category-recommendation-pairs", "most-common-course-pairs"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "seasonal-sales-analysis",
    statement:
      "Sales rows record the product, the date, units sold and unit price. Name each season's most popular category — popularity is total UNITS sold that season (Winter = Dec+Jan+Feb, Spring = Mar–May, Summer = Jun–Aug, Fall = Sep–Nov, calendar year ignored) — breaking ties by total revenue and then by the lexicographically smaller category name. Return one row per season, seasons in ascending order.",
    examples: [
      {
        input:
          "sales: 15 official rows across 2023 (Jan–Dec) plus 2024-02-14 — plus trap sale 16: product 6 'Dumbbell Set' (Fitness), 2023-04-10, 3 × 18.00 · products: 5 official + Dumbbell Set (Fitness)",
        output:
          "Fall · Apparel · 10 · 120.00 / Spring · Fitness · 3 · 54.00 / Summer · Tech · 5 · 100.00 / Winter · Apparel · 9 · 110.00",
        explanation:
          "Winter folds Dec 2023 (Cutting Boards, Speakers) together WITH Jan/Feb 2024 into one bucket — Apparel wins on 9 units. Summer's 5 = 5 tie between Tech and Fitness goes to revenue (100 vs 60). Spring's trap ties Fitness with Kitchen at 3 units AND 54.00, so the lexicographic key crowns Fitness — flipping the official Kitchen answer. Fall is Apparel's alone.",
      },
    ],
    constraints: [
      "seasons wrap the year: Winter = Dec+Jan+Feb, so a December and the next January land in ONE bucket — no year anywhere in the grouping",
      "popularity = SUM(quantity) per (season, category); ties → SUM(quantity × price); still tied → lexicographically smaller category",
      "one row per season, ordered by season ascending (Fall, Spring, Summer, Winter — plain text order)",
    ],
    breakdown: [
      "The report's grain is (season, category) but the winner is per season: fold every sale into its season bucket, aggregate units and revenue per bucket, then pick ONE bucket per season by a three-key priority — quantity DESC, revenue DESC, category ASC. Popularity is UNITS, not money; revenue exists only to break exact quantity ties.",
      "Season bucketing is calendar arithmetic with a twist: Winter = Dec + Jan + Feb, so the season WRAPS the new year. The seed makes you feel it — 2023-12-05, 2023-12-22, 2024-01-15, 2024-01-20 and 2024-02-14 all land in one Winter bucket across two different years. CASE over strftime('%m', sale_date) with all twelve months enumerated does the mapping; no year component appears anywhere.",
      "Tie handling is where the exam lives. Summer has Tech and Fitness dead even at 5 units — revenue (100.00 vs 60.00) picks Tech. The engineered Spring trap goes one deeper: Dumbbell Set's sale ties Kitchen at BOTH 3 units AND 54.00, so the third key — lexicographic category ('Fitness' < 'Kitchen') — decides. All three keys must sit in the ranking's ORDER BY in exactly that priority.",
      "Mechanics: you can't filter on a window function in WHERE, so ROW_NUMBER runs in a CTE over the folded buckets and the outer query keeps rn = 1. And 'ordered by season ascending' is alphabetical on the TEXT season (Fall, Spring, Summer, Winter — exactly what the official output shows), not calendar order.",
    ],
    edges: [
      "The Winter bucket straddles the year: 2023-12-05/22 and 2024-01-15/02-14 aggregate together — any GROUP BY year is wrong by construction.",
      "Quantity ties go to REVENUE (Summer: Tech 100.00 beats Fitness 60.00 at 5 units each); revenue ties go to the lexicographically smaller name (Spring: Fitness edges Kitchen at 3 units AND 54.00 each).",
      "A category with no sales in a season has no bucket — nothing is zero-filled; a season with no sales at all would print no row.",
      "Popularity is UNITS: a category can win money while losing units — revenue is only ever the tie-breaker, never the primary key.",
    ],
    ladder: [
      {
        title: "Brute force — rescan per season",
        body: "For each of the four seasons, scan all sales in its months, aggregate per category, and compare winners in application code. Four full scans, with the tie rules living in fragile hand-written logic.",
      },
      {
        title: "The pattern — tag, fold, then rank per season",
        body: "CASE-tag each sale with its season, GROUP BY (season, category) for units and revenue, then rank each season's buckets with a window ordered by the three-key priority. One scan to tag, one fold, one sort.",
      },
      {
        title: "The optimal idea — ROW_NUMBER + rn = 1",
        body: "ROW_NUMBER() OVER (PARTITION BY season ORDER BY units DESC, revenue DESC, category) computed in a CTE, filtered to rn = 1 outside. Deterministic through every tie level, and 'season ascending' is a plain text ORDER BY.",
      },
    ],
    approach: "Season CASE-tag + per-season ROW_NUMBER over folded buckets",
    schema: {
      ddl: `CREATE TABLE sales (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  sale_date  TEXT NOT NULL,          -- 'YYYY-MM-DD'
  quantity   INTEGER NOT NULL,
  price      REAL NOT NULL
);
CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  category     TEXT NOT NULL
);`,
      seed: `INSERT INTO sales (sale_id, product_id, sale_date, quantity, price) VALUES
  (1,  1, '2023-01-15', 5, 10.00),  -- official Winter (Jan)
  (2,  2, '2023-01-20', 4, 15.00),  -- official Winter (Jan)
  (3,  3, '2023-03-10', 3, 18.00),  -- official Spring
  (4,  4, '2023-04-05', 1, 20.00),  -- official Spring
  (5,  1, '2023-05-20', 2, 10.00),  -- official Spring
  (6,  2, '2023-06-12', 4, 15.00),  -- official Summer
  (7,  5, '2023-06-15', 5, 12.00),  -- official Summer: Fitness ties Tech on units
  (8,  3, '2023-07-24', 2, 18.00),  -- official Summer
  (9,  4, '2023-08-01', 5, 20.00),  -- official Summer: Tech wins the tie on revenue
  (10, 5, '2023-09-03', 3, 12.00),  -- official Fall
  (11, 1, '2023-09-25', 6, 10.00),  -- official Fall
  (12, 2, '2023-11-10', 4, 15.00),  -- official Fall
  (13, 3, '2023-12-05', 6, 18.00),  -- official Winter (Dec 2023)...
  (14, 4, '2023-12-22', 3, 20.00),  -- ...same Winter bucket
  (15, 5, '2024-02-14', 2, 12.00),  -- official Feb 2024: SAME Winter bucket, year ignored
  (16, 6, '2023-04-10', 3, 18.00);  -- TRAP: Spring Fitness ties Kitchen at (3, 54.00) -> lexicographic
INSERT INTO products (product_id, product_name, category) VALUES
  (1, 'Warm Jacket', 'Apparel'),
  (2, 'Designer Jeans', 'Apparel'),
  (3, 'Cutting Board', 'Kitchen'),
  (4, 'Smart Speaker', 'Tech'),
  (5, 'Yoga Mat', 'Fitness'),
  (6, 'Dumbbell Set', 'Fitness');   -- TRAP product: exists only to forge the Spring tie`,
      tables: [
        { name: "sales", note: "16 rows — the official 15 plus trap sale 16 (2023-04-10, Fitness, 3 × 18.00)" },
        { name: "products", note: "6 products — the official 5 plus Dumbbell Set (Fitness)" },
      ],
    },
    code: `WITH tagged AS (
    SELECT
        p.category,
        s.quantity,
        s.quantity * s.price AS revenue,
        CASE strftime('%m', s.sale_date)   -- month number as TEXT: '01'..'12'
            WHEN '12' THEN 'Winter'        -- Winter WRAPS the new year:
            WHEN '01' THEN 'Winter'        -- Dec + Jan + Feb is one bucket
            WHEN '02' THEN 'Winter'
            WHEN '03' THEN 'Spring'
            WHEN '04' THEN 'Spring'
            WHEN '05' THEN 'Spring'
            WHEN '06' THEN 'Summer'
            WHEN '07' THEN 'Summer'
            WHEN '08' THEN 'Summer'
            WHEN '09' THEN 'Fall'
            WHEN '10' THEN 'Fall'
            WHEN '11' THEN 'Fall'
        END AS season                      -- no year component on purpose
    FROM sales s
    JOIN products p ON p.product_id = s.product_id
),
per_bucket AS (
    SELECT
        season,
        category,
        SUM(quantity) AS total_quantity,
        SUM(revenue)  AS total_revenue
    FROM tagged
    GROUP BY season, category
),
ranked AS (
    SELECT
        per_bucket.*,
        ROW_NUMBER() OVER (
            PARTITION BY season
            ORDER BY total_quantity DESC,  -- popularity is UNITS first...
            total_revenue  DESC,           -- ...money breaks exact ties...
            category       ASC             -- ...then the lexicographic key
        ) AS rn
    FROM per_bucket
)
SELECT
    season,
    category,
    total_quantity,
    ROUND(total_revenue, 2) AS total_revenue   -- round once, for display
FROM ranked
WHERE rn = 1                                   -- the winner per season
ORDER BY season ASC;                           -- Fall, Spring, Summer, Winter (text order)`,
    walkthrough: [
      "The CASE tags all sixteen sales: the Decembers (2023-12-05, 2023-12-22) and the 2024 dates (01-15, 01-20, 02-14) all become Winter — the year boundary is invisible to the bucket; trap sale 16 (2023-04-10) becomes Spring Fitness.",
      "The fold produces ten (season, category) buckets: Winter Apparel 9/110.00 and Winter Kitchen 6/108.00; Spring Kitchen 3/54.00, Spring Fitness 3/54.00 (the trap), Spring Apparel 2/20.00, Spring Tech 1/20.00; Summer Tech 5/100.00, Summer Fitness 5/60.00, Summer Apparel 4/60.00, Summer Kitchen 2/36.00; Fall Apparel 10/120.00.",
      "ROW_NUMBER orders each season's buckets: Winter → Apparel (9 units, clear); Summer → Tech over Fitness (5 = 5, then 100.00 > 60.00); Fall → Apparel alone; Spring → the full tie chain — Kitchen and Fitness sit level on 3 units AND 54.00, so the third key (category ASC) crowns 'Fitness'.",
      "rn = 1 keeps one row per season and ORDER BY season prints Fall, Spring, Summer, Winter — with Spring's winner flipped from the official Kitchen to Fitness by the engineered lexicographic tie.",
    ],
    time: "O(n + c log c) — one pass to tag n sales, a fold into c season-category buckets, then a per-season sort for ROW_NUMBER",
    space: "O(c) — the folded buckets",
    followUps: [
      "Zero-fill the report: LEFT JOIN the folded buckets onto a four-row season spine so a sales-less season still prints (with what totals?) — the same move as Count Salary Categories' VALUES spine.",
      "Re-run the ranking with revenue as the PRIMARY key — which seasons flip, and does the lexicographic tie-breaker ever fire?",
    ],
    related: ["monthly-transactions-i", "list-the-products-ordered-in-a-period", "product-price-at-a-given-date"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-books-with-no-available-copies",
    statement:
      "A library stores each title's owned-copy count, while the loan log leaves return_date NULL for every book still checked out. List the titles that are completely checked out — at least one open loan AND zero available copies — showing how many borrowers hold each. Most-borrowed first, ties by title ascending.",
    examples: [
      {
        input:
          "library_books: 6 official titles + trap Wuthering Heights (total_copies 0, NEVER loaned) + trap Animal Farm (1 copy) · borrowing_records: 10 official loans + trap record 11: Animal Farm → Klara Neumann, return_date NULL",
        output:
          "(1, The Great Gatsby, F. Scott, Fiction, 1925, 3) · (3, 1984, George Orwell, Dystopian, 1949, 1) · (8, Animal Farm, George Orwell, Satire, 1945, 1)",
        explanation:
          "Gatsby: 3 copies, 3 open loans → 0 available. 1984: 1 copy, 1 open loan → 0. Animal Farm's trap loan makes its single copy 0-available too, tying 1984 at one borrower — '1984' prints first because digits sort before letters. Wuthering Heights computes 0 − 0 = 0 available but has NO open loan, so the 'currently borrowed' gate excludes it. Catcher's only loan was returned; Mockingbird and Pride & Prejudice still have spares.",
      },
    ],
    constraints: [
      "return_date IS NULL marks a still-open loan; a returned loan stops counting the day it's returned",
      "available copies = total_copies − open loans; report only books with 0 available AND at least one open loan",
      "current_borrowers = count of open loans; output order: current_borrowers DESC, then title ASC",
    ],
    breakdown: [
      "Two conditions must BOTH hold: the book has at least one open loan (return_date IS NULL), and available copies — total_copies minus open loans — is exactly zero. The output metric current_borrowers is just the count of those open loans. So the whole query is 'count active loans per book, then compare each book against its own capacity'.",
      "The active-loan filter must live in the JOIN's ON clause, not in WHERE. A WHERE r.return_date IS NULL after a LEFT JOIN degrades the join to an inner one (the all-NULL book rows fail the predicate and vanish) — survivable in this particular problem, but the shape collapses the moment you need books that own no loans at all. ON keeps every book row alive and lets the aggregate see zeros.",
      "The trap the seed sets: Wuthering Heights owns ZERO copies and ZERO loan rows. Its available count computes to 0 − 0 = 0 — the arithmetic 'works' — but nobody is borrowing it, so it must not appear. A single HAVING (total_copies − COUNT) = 0 includes it; the second gate COUNT(r.record_id) > 0 is what enforces 'currently borrowed'.",
      "Assembly: LEFT JOIN gated in ON, GROUP BY the book's columns, HAVING both gates, then the mandated ranking — current_borrowers DESC, title ASC. The tie-break is real in this seed: 1984 and Animal Farm both sit at one borrower, and '1984' sorts before 'Animal Farm' because digit characters precede letters.",
    ],
    edges: [
      "Wuthering Heights: zero copies AND zero loans — available computes to 0 but nobody is borrowing it; the COUNT(r.record_id) > 0 gate is what excludes it.",
      "Returned loans stop counting immediately: Catcher's only loan closed 2024-02-10, so 1 copy − 0 open = 1 available — out.",
      "Partial availability is out even one spare copy short of the trap: Mockingbird's 2 open loans against 3 copies leave 1 available — out; Gatsby's 3 against 3 is in.",
      "The tie-break is on TEXT: '1984' < 'Animal Farm' because digits sort before letters — the seed puts both at one borrower to make the second ORDER BY key earn its keep.",
    ],
    ladder: [
      {
        title: "Brute force — probe per book",
        body: "For each book, run a correlated count of open loans (return_date IS NULL), then compare against total_copies. Two scans' worth of work and an easy place to forget the 'must be currently borrowed' requirement entirely.",
      },
      {
        title: "The pattern — LEFT JOIN gated in ON",
        body: "LEFT JOIN borrowing_records ON book_id AND return_date IS NULL — the gate lives in ON so book rows without loans survive as COUNT = 0 rows. Group by book and compare the count against total_copies.",
      },
      {
        title: "The optimal idea — a two-gate HAVING",
        body: "HAVING COUNT(r.record_id) > 0 AND total_copies − COUNT(r.record_id) = 0 encodes BOTH conditions explicitly: currently borrowed AND zero available. One linear pass over the loans, and the display columns ride along.",
      },
    ],
    approach: "ON-gated LEFT JOIN + two-gate HAVING",
    schema: {
      ddl: `CREATE TABLE library_books (
  book_id          INTEGER PRIMARY KEY,
  title            TEXT NOT NULL,
  author           TEXT NOT NULL,
  genre            TEXT NOT NULL,
  publication_year INTEGER NOT NULL,
  total_copies     INTEGER NOT NULL
);
CREATE TABLE borrowing_records (
  record_id     INTEGER PRIMARY KEY,
  book_id       INTEGER NOT NULL,
  borrower_name TEXT NOT NULL,
  borrow_date   TEXT NOT NULL,
  return_date   TEXT                  -- NULL = still checked out
);`,
      seed: `INSERT INTO library_books (book_id, title, author, genre, publication_year, total_copies) VALUES
  (1, 'The Great Gatsby', 'F. Scott', 'Fiction', 1925, 3),      -- official
  (2, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 1960, 3),
  (3, '1984', 'George Orwell', 'Dystopian', 1949, 1),
  (4, 'Pride and Prejudice', 'Jane Austen', 'Romance', 1813, 2),
  (5, 'The Catcher in the Rye', 'J.D. Salinger', 'Fiction', 1951, 1),
  (6, 'Brave New World', 'Aldous Huxley', 'Dystopian', 1932, 4),
  (7, 'Wuthering Heights', 'Emily Bronte', 'Gothic', 1847, 0),  -- TRAP: zero copies, ZERO loans
  (8, 'Animal Farm', 'George Orwell', 'Satire', 1945, 1);       -- TRAP: fully loaned, ties 1984 at 1 borrower
INSERT INTO borrowing_records (record_id, book_id, borrower_name, borrow_date, return_date) VALUES
  (1,  1, 'Alice Smith',   '2024-01-15', NULL),   -- official
  (2,  1, 'Bob Johnson',   '2024-01-20', NULL),
  (3,  2, 'Carol White',   '2024-01-10', '2024-01-25'),
  (4,  3, 'David Brown',   '2024-02-01', NULL),
  (5,  4, 'Emma Wilson',   '2024-01-05', NULL),
  (6,  5, 'Frank Davis',   '2024-01-18', '2024-02-10'),
  (7,  1, 'Grace Miller',  '2024-02-05', NULL),
  (8,  6, 'Henry Taylor',  '2024-01-12', NULL),
  (9,  2, 'Ivan Clark',    '2024-02-12', NULL),
  (10, 2, 'Jane Adams',    '2024-02-15', NULL),
  (11, 8, 'Klara Neumann', '2024-02-18', NULL);  -- TRAP loan: Animal Farm's only copy is out`,
      tables: [
        { name: "library_books", note: "8 books — the official 6 + Wuthering Heights (0 copies, never loaned) + Animal Farm (1 copy, out)" },
        { name: "borrowing_records", note: "11 loan rows — the official 10 + Animal Farm's open loan; return_date NULL = still out" },
      ],
    },
    code: `SELECT
    b.book_id,
    b.title,
    b.author,
    b.genre,
    b.publication_year,
    COUNT(r.record_id) AS current_borrowers   -- open loans only (the ON clause filters them)
FROM library_books b
LEFT JOIN borrowing_records r
       ON r.book_id = b.book_id
      AND r.return_date IS NULL               -- the active-loan gate lives in ON, not WHERE
GROUP BY
    b.book_id, b.title, b.author, b.genre,
    b.publication_year, b.total_copies
HAVING COUNT(r.record_id) > 0                 -- gate 1: CURRENTLY borrowed (kills the never-loaned trap)
   AND b.total_copies - COUNT(r.record_id) = 0 -- gate 2: every copy is out -> 0 available
ORDER BY current_borrowers DESC, b.title ASC; -- most-borrowed first, ties by title A->Z`,
    walkthrough: [
      "The LEFT JOIN attaches each book's OPEN loans only: Gatsby gets Alice, Bob and Grace (3 rows), 1984 gets David, trap Animal Farm gets Klara, Mockingbird gets Ivan and Jane, while Wuthering Heights and Catcher attach nothing at all (their only mentions in the loan log are returned, or absent).",
      "The GROUP BY counts open loans: Gatsby 3, 1984 1, Animal Farm 1, Mockingbird 2, Brave New World 1, and 0 for the two books with no open loans.",
      "The HAVING gates: Gatsby (3 − 3 = 0 available, 3 > 0 borrowers) passes; 1984 (1 − 1 = 0) and Animal Farm (1 − 1 = 0) pass; Mockingbird (3 − 2 = 1 available) fails the availability gate, as do Brave New World (4 − 1 = 3) and Catcher (1 − 0 = 1); and Wuthering Heights (0 − 0 = 0 available but COUNT = 0) fails the currently-borrowed gate — the trap.",
      "ORDER BY current_borrowers DESC, title ASC prints Gatsby (3), then the one-borrower tie with '1984' ahead of 'Animal Farm' — digits sort before letters.",
    ],
    time: "O(b + r) — one LEFT JOIN pass over b books and r loan records with hash grouping",
    space: "O(b) — one aggregate row per book",
    followUps: [
      "Return EVERY book with its available_copies (0 for fully-loaned, total_copies for never-touched) — one COALESCE and both HAVING gates dissolve; what replaces them?",
      "Redefine 'active' as overdue (borrow_date older than 30 days and still out) — why does keeping the gate in the ON clause make that a one-line change?",
    ],
    related: ["customers-who-never-order", "employees-with-missing-information", "market-analysis-i"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-stores-with-inventory-imbalance",
    statement:
      "Inventory rows pair each store's products with a unit price and a stocked quantity. Surface the imbalanced stores — those carrying at least three products where the PRICIEST product is stocked LOWER than the CHEAPEST — reporting both products plus the ratio cheapest-quantity ÷ priciest-quantity rounded to two decimals. Most imbalanced first, ties by store name ascending.",
    examples: [
      {
        input:
          "stores: 5 official + trap Harbor Goods (3 products) + trap Riverside Roast (3 products) · inventory: 15 official rows + Harbor Goods (Espresso Machine 899.99 × 40, Kettle 49.99 × 30, Mug 9.99 × 20) + Riverside Roast (Espresso Grinder 449.99 × 2, Cup 24.99 × 9, Syrup 12.99 × 20)",
        output:
          "(3, City Center, Los Angeles, Tablet, Stylus, 40.00) · (2, Suburb Mall, Chicago, Phone, Case, 25.00) · (1, Downtown Tech, New York, Laptop, Mouse, 10.00) · (7, Riverside Roast, Portland, Espresso Grinder, Syrup, 10.00)",
        explanation:
          "Official stores 4 and 5 carry only two products — under the 3-product floor. Harbor Goods has three but its priciest line OUT-stocks its cheapest (40 ≥ 20): no imbalance, out. Riverside Roast qualifies (2 < 20) and ties Downtown Tech at ratio 10.00 — the store_name ASC tie-break puts Downtown Tech first.",
      },
    ],
    constraints: [
      "most expensive = the store's highest-price product; cheapest = the lowest-price product (per store)",
      "imbalance means qty(most expensive) < qty(cheapest), strictly; ratio = cheapest_qty ÷ priciest_qty, rounded to 2 decimals",
      "stores need ≥ 3 different products to qualify; output order: imbalance_ratio DESC, then store_name ASC",
    ],
    breakdown: [
      "Per store you need four facts from the same table: the priciest product's name and quantity, and the cheapest product's name and quantity — plus one derived judgment, priciest_qty < cheapest_qty, and the ratio cheapest_qty ÷ priciest_qty. That's two independent 'top-1 per store' lookups in opposite price directions and one product-count gate, all glued back to stores for the display columns.",
      "Window functions are the clean tool: ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY price DESC) marks the expensive extreme, the same window over an ASC sort marks the cheap one, and COUNT(*) OVER (PARTITION BY store_id) carries the product count. The catch is sequencing — window outputs aren't visible to WHERE — so the ranked rows are computed in a CTE and filtered outside: the window-in-CTE-then-filter idiom.",
      "The ratio divides two INTEGER columns, and integer division truncates before ROUND ever runs — 7/2 would floor to 3 and print 3.0, not 3.5. Multiply by 1.0 (or CAST to REAL) first, then ROUND(…, 2) once at the end. Every quotient in this seed (80/2, 75/3, 50/5, 20/2) lands exact, which is exactly why the missing *1.0 bug survives so long: it passes this seed and detonates on the next one.",
      "Why not MIN(price)/MAX(price) self-joins? They work, but joining inventory back on price = MAX(price) fans out if two products ever tie on price — duplicate output rows. ROW_NUMBER pins exactly one row per extreme, the ≥ 3-products gate and the strict directional < do the rest, and the mandated ranking (ratio DESC, store_name ASC) orders the survivors — my seed manufactures a 10.00 tie between Downtown Tech and Riverside Roast to make that secondary key earn its keep.",
    ],
    edges: [
      "The ≥ 3-products gate is where official stores 4 and 5 die — both hold only two products, whatever their stock shapes look like.",
      "Harbor Goods has three products but its priciest line OUT-stocks its cheapest (40 ≥ 20): the imbalance test is strict AND directional — expensive must be strictly lower.",
      "Riverside Roast ties Downtown Tech at 10.00; the mandated store_name ASC tie-break ('D' < 'R') fixes the order.",
      "ROW_NUMBER pins one product per extreme even if prices tie; a self-join on price = MAX(price) would print a duplicate row per tied product.",
    ],
    ladder: [
      {
        title: "Brute force — correlated extremes",
        body: "Per store, subquery the row with MAX(price), the row with MIN(price), and a COUNT of products: three correlated probes per store, re-reading inventory every time.",
      },
      {
        title: "The pattern — rank both directions in one pass",
        body: "Two ROW_NUMBERs (price DESC and price ASC) partitioned by store, computed in a CTE, then joined back on store with rn = 1 on each side. The CTE is mandatory — WHERE cannot see window outputs.",
      },
      {
        title: "The optimal idea — filter extremes, then divide",
        body: "Keep rn_exp = 1 AND rn_cheap = 1 rows, apply n_products >= 3 and exp_qty < cheap_qty, output ROUND(cheap * 1.0 / exp, 2). One sort of the inventory table serves every store at once.",
      },
    ],
    approach: "Dual-direction ROW_NUMBER CTE + boundary filters",
    schema: {
      ddl: `CREATE TABLE stores (
  store_id   INTEGER PRIMARY KEY,
  store_name TEXT NOT NULL,
  location   TEXT NOT NULL
);
CREATE TABLE inventory (
  inventory_id INTEGER PRIMARY KEY,
  store_id     INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  quantity     INTEGER NOT NULL,
  price        REAL NOT NULL
);`,
      seed: `INSERT INTO stores (store_id, store_name, location) VALUES
  (1, 'Downtown Tech', 'New York'),      -- official
  (2, 'Suburb Mall', 'Chicago'),
  (3, 'City Center', 'Los Angeles'),
  (4, 'Corner Shop', 'Miami'),
  (5, 'Plaza Store', 'Seattle'),
  (6, 'Harbor Goods', 'Boston'),         -- TRAP: 3 products but NO imbalance (40 >= 20)
  (7, 'Riverside Roast', 'Portland');    -- TRAP: exactly 3 products, ties ratio 10.00 with store 1
INSERT INTO inventory (inventory_id, store_id, product_name, quantity, price) VALUES
  (1,  1, 'Laptop',   5,  999.99),   -- official
  (2,  1, 'Mouse',    50, 19.99),
  (3,  1, 'Keyboard', 25, 79.99),
  (4,  1, 'Monitor',  15, 299.99),
  (5,  2, 'Phone',    3,  699.99),
  (6,  2, 'Charger',  100, 25.99),
  (7,  2, 'Case',     75, 15.99),
  (8,  2, 'Headphones', 20, 149.99),
  (9,  3, 'Tablet',   2,  499.99),
  (10, 3, 'Stylus',   80, 29.99),
  (11, 3, 'Cover',    60, 39.99),
  (12, 4, 'Watch',    10, 299.99),
  (13, 4, 'Band',     25, 49.99),
  (14, 5, 'Camera',   8,  599.99),
  (15, 5, 'Lens',     12, 199.99),
  (16, 6, 'Espresso Machine', 40, 899.99),  -- TRAP store: priciest line OUT-stocks its cheapest
  (17, 6, 'Kettle',   30, 49.99),
  (18, 6, 'Mug',      20, 9.99),
  (19, 7, 'Espresso Grinder', 2, 449.99),   -- priciest, starved (qty 2)
  (20, 7, 'Cup',      9,  24.99),
  (21, 7, 'Syrup',    20, 12.99);           -- cheapest, hoarded (qty 20) -> ratio 10.00`,
      tables: [
        { name: "stores", note: "7 stores — the official 5 + Harbor Goods (no imbalance) + Riverside Roast (ratio tie at 10.00)" },
        { name: "inventory", note: "21 rows — the official 15 + Harbor Goods' 3 + Riverside Roast's 3; one row per product per store" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        store_id,
        product_name,
        quantity,
        ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY price DESC) AS rn_exp,   -- priciest first
        ROW_NUMBER() OVER (PARTITION BY store_id ORDER BY price ASC)  AS rn_cheap, -- cheapest first
        COUNT(*)     OVER (PARTITION BY store_id)                     AS n_products
    FROM inventory
),
edges AS (
    SELECT
        e.store_id,
        e.product_name AS most_exp_product,
        e.quantity     AS exp_qty,
        c.product_name AS cheapest_product,
        c.quantity     AS cheap_qty,
        e.n_products   AS n_products
    FROM ranked e
    JOIN ranked c
      ON c.store_id = e.store_id
     AND c.rn_cheap = 1        -- glue the two extremes of the same store together
    WHERE e.rn_exp = 1
)
SELECT
    s.store_id,
    s.store_name,
    s.location,
    x.most_exp_product,
    x.cheapest_product,
    ROUND(x.cheap_qty * 1.0 / x.exp_qty, 2) AS imbalance_ratio  -- *1.0: integer / would truncate
FROM edges x
JOIN stores s ON s.store_id = x.store_id
WHERE x.n_products >= 3        -- the 3-product floor (window results filter only AFTER the CTE)
  AND x.exp_qty < x.cheap_qty  -- strict + directional: priciest stocked LOWER than cheapest
ORDER BY imbalance_ratio DESC, s.store_name ASC;`,
    walkthrough: [
      "The ranked CTE sorts every store's rows both ways and counts them: store 1's Laptop (999.99) tops its price-DESC list and Mouse (19.99) the ASC list with n_products = 4; store 7's Espresso Grinder leads DESC and Syrup leads ASC with n_products = 3; Harbor Goods pairs Espresso Machine with Mug, also at three products.",
      "The ranked-to-ranked join glues each store's two extremes together, and the outer filters apply: Corner Shop and Plaza Store die on n_products = 2; Harbor Goods dies on 40 < 20 being false — the priciest line out-stocks the cheapest, so no imbalance; the three official stores plus Riverside Roast survive (2 < 20 there).",
      "The ratio lands exactly: 80/2 = 40.00 (City Center), 75/3 = 25.00 (Suburb Mall), 50/5 = 10.00 (Downtown Tech) and 20/2 = 10.00 (Riverside Roast) — each computed as quantity * 1.0 before dividing, then ROUNDed once.",
      "ORDER BY imbalance_ratio DESC, store_name ASC: 40, 25, then the 10.00 tie resolved by name — Downtown Tech ('D') ahead of Riverside Roast ('R').",
    ],
    time: "O(m log m) — one sort of m inventory rows feeds both ROW_NUMBER directions and the count window",
    space: "O(m) — the ranked CTE",
    followUps: [
      "Prices can tie: add a tie-break to both ROW_NUMBERs (say product_name), then show the duplicate rows a price = MAX(price) self-join would emit on that data.",
      "Weigh imbalance by revenue at risk (quantity × price) instead of raw units — which store's rank moves?",
    ],
    related: ["bank-account-summary-ii", "average-selling-price", "confirmation-rate"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-books-with-polarized-opinions",
    statement:
      "Every reading session carries a 1–5 rating for one book. A book's opinions are polarized when it has at least five sessions, at least one rating ≥ 4 AND at least one ≤ 2, and at least 60% of its sessions are extreme (≤ 2 or ≥ 4) — report the rating spread (max − min) and that extreme share rounded to two decimals. Highest share first, ties by title descending.",
    examples: [
      {
        input:
          "books: 5 official + trap Lord of the Flies (all-low ratings) + trap Norwegian Wood (thin extreme share) + trap Middlemarch (exactly 0.60) + trap Empty Shelf (no sessions) · reading_sessions: 20 official + 16 trap sessions covering books 6–8",
        output:
          "(1, The Great Gatsby, F. Scott, Fiction, 180, 4, 1.00) · (3, 1984, George Orwell, Dystopian, 328, 4, 1.00) · (8, Middlemarch, George Eliot, Fiction, 880, 2, 0.60)",
        explanation:
          "Mockingbird is all 4s/5s — no low pole; Lord of the Flies is all 1s/2s — no high pole; both die on the existence gates. Norwegian Wood has both poles and 5 sessions but only 2/5 = 0.40 extreme. Middlemarch lands EXACTLY on 3/5 = 0.60 — the inclusive floor keeps it. Empty Shelf has no sessions, so it never even aggregates. Score DESC then title DESC puts Gatsby over 1984.",
      },
    ],
    constraints: [
      "session_rating is an integer 1–5; extreme means ≤ 2 or ≥ 4",
      "books need ≥ 5 sessions, at least one rating ≥ 4 AND one ≤ 2, and extreme share ≥ 0.6 (inclusive)",
      "rating_spread = max − min rating; the score is rounded to 2 decimals; order: score DESC, then title DESC",
    ],
    breakdown: [
      "Four gates stack: at least 5 sessions total, at least one rating ≥ 4, at least one rating ≤ 2, and extreme share = COUNT(ratings ≤ 2 or ≥ 4) ÷ COUNT(*) ≥ 0.6. The output adds rating_spread = MAX − MIN. Note the ≥ 4 and ≤ 2 tests are existence tests on RAW ratings, while the 0.6 test is on the SHARE — conflating them (say, testing the share of highs separately) builds a different, wrong filter.",
      "Conditional aggregation is the whole machine: GROUP BY book, then MIN/MAX for the poles and SUM(rating <= 2 OR rating >= 4) as the extreme counter — SQLite sums booleans as 0/1. Every gate is then a comparison on those per-book aggregates, computed in a stats CTE because the outer WHERE cannot see aggregates.",
      "The threshold's boundary is engineered into the seed: Middlemarch's 4,2,4,3,3 give exactly 3/5 = 0.6 — in. Norwegian Wood's 5,1,3,3,3 also has both poles but only 2/5 = 0.4 — out. The 5-session minimum is why official books 4 and 5 die whatever their ratings; book 9, with zero sessions, dies without ever entering the aggregate.",
      "The ranking has a twist: score DESC then title DESC (Z→A), so the two 1.00 books — 'The Great Gatsby' and '1984' — print Gatsby first because 'T' > '1'. And ROUND appears exactly once, in the SELECT for display: the HAVING-side comparison runs on the RAW share, so a 0.596 share cannot masquerade as 0.6.",
    ],
    edges: [
      "One pole alone is not polarization: book 2 is all 4s and 5s (no ≤ 2), book 6 is all 1s and 2s (no ≥ 4) — both die on the existence gates.",
      "The 0.6 boundary is inclusive and computed on the RAW share: Middlemarch's 3/5 = 0.6 passes; rounding before comparing would let a 0.596-style share sneak through.",
      "Norwegian Wood has both poles and five sessions — it dies ONLY on the share (2/5 = 0.4), the subtlest of the four gates.",
      "Empty Shelf has no sessions at all: it forms no group, so the inner join to books emits nothing — no COALESCE heroics needed.",
    ],
    ladder: [
      {
        title: "Brute force — fetch sessions, decide in code",
        body: "Pull all sessions per book and scan for poles while counting extremes in the application. Works, but pushes four threshold rules out of the database where they can't be tested as SQL.",
      },
      {
        title: "The pattern — conditional aggregation",
        body: "GROUP BY book with MIN/MAX for the poles and SUM(rating <= 2 OR rating >= 4) for the extreme count. The share is one division away; the session-count gate is COUNT(*).",
      },
      {
        title: "The optimal idea — stats CTE + gate stack",
        body: "Fold everything into a per-book stats CTE, then a single WHERE with all four gates and the mandated ORDER BY (score DESC, title DESC). ROUND appears exactly once, for display.",
      },
    ],
    approach: "Conditional-aggregation stats CTE + four-gate filter",
    schema: {
      ddl: `CREATE TABLE books (
  book_id INTEGER PRIMARY KEY,
  title   TEXT NOT NULL,
  author  TEXT NOT NULL,
  genre   TEXT NOT NULL,
  pages   INTEGER NOT NULL
);
CREATE TABLE reading_sessions (
  session_id     INTEGER PRIMARY KEY,
  book_id        INTEGER NOT NULL,
  reader_name    TEXT NOT NULL,
  pages_read     INTEGER NOT NULL,
  session_rating INTEGER NOT NULL      -- 1..5
);`,
      seed: `INSERT INTO books (book_id, title, author, genre, pages) VALUES
  (1, 'The Great Gatsby', 'F. Scott', 'Fiction', 180),          -- official
  (2, 'To Kill a Mockingbird', 'Harper Lee', 'Fiction', 281),
  (3, '1984', 'George Orwell', 'Dystopian', 328),
  (4, 'Pride and Prejudice', 'Jane Austen', 'Romance', 432),
  (5, 'The Catcher in the Rye', 'J.D. Salinger', 'Fiction', 277),
  (6, 'Lord of the Flies', 'William Golding', 'Fiction', 224),  -- TRAP: ALL low ratings, no high pole
  (7, 'Norwegian Wood', 'Haruki Murakami', 'Fiction', 296),     -- TRAP: both poles but only 40% extreme
  (8, 'Middlemarch', 'George Eliot', 'Fiction', 880),           -- TRAP: lands EXACTLY on 0.60
  (9, 'Empty Shelf', 'Nora Reed', 'Meta', 100);                 -- TRAP: zero sessions
INSERT INTO reading_sessions (session_id, book_id, reader_name, pages_read, session_rating) VALUES
  (1,  1, 'Alice',  50,  5),   -- official
  (2,  1, 'Bob',    60,  1),
  (3,  1, 'Carol',  40,  4),
  (4,  1, 'David',  30,  2),
  (5,  1, 'Emma',   45,  5),
  (6,  2, 'Frank',  80,  4),
  (7,  2, 'Grace',  70,  4),
  (8,  2, 'Henry',  90,  5),
  (9,  2, 'Ivy',    60,  4),
  (10, 2, 'Jack',   75,  4),
  (11, 3, 'Kate',   100, 2),
  (12, 3, 'Liam',   120, 1),
  (13, 3, 'Mia',    80,  2),
  (14, 3, 'Noah',   90,  1),
  (15, 3, 'Olivia', 110, 4),
  (16, 3, 'Paul',   95,  5),
  (17, 4, 'Quinn',  150, 3),
  (18, 4, 'Ruby',   140, 3),
  (19, 5, 'Sam',    80,  1),
  (20, 5, 'Tara',   70,  2),
  (21, 6, 'Uma',    66,  1),   -- TRAP book 6: six sessions, every rating <= 2
  (22, 6, 'Vic',    55,  2),
  (23, 6, 'Walt',   70,  1),
  (24, 6, 'Xena',   80,  2),
  (25, 6, 'Yusuf',  60,  2),
  (26, 6, 'Zoe',    75,  1),
  (27, 7, 'Aria',   90,  5),   -- TRAP book 7: 5,1 then three 3s -> 2/5 = 0.40 extreme
  (28, 7, 'Ben',    85,  1),
  (29, 7, 'Cleo',   70,  3),
  (30, 7, 'Dana',   60,  3),
  (31, 7, 'Eli',    75,  3),
  (32, 8, 'Fay',    95,  4),   -- TRAP book 8: 4,2,4,3,3 -> 3/5 = 0.60 exactly
  (33, 8, 'Gus',    88,  2),
  (34, 8, 'Hana',   92,  4),
  (35, 8, 'Ivo',    77,  3),
  (36, 8, 'Jen',    81,  3);   -- book 9 (Empty Shelf) deliberately has NO sessions`,
      tables: [
        { name: "books", note: "9 books — the official 5 + four trap books (all-low, thin-extreme, 0.60 boundary, zero sessions)" },
        { name: "reading_sessions", note: "36 sessions — the official 20 + 16 trap sessions (books 6–8); book 9 has none" },
      ],
    },
    code: `WITH book_stats AS (
    SELECT
        book_id,
        COUNT(*)                                          AS total_sessions,
        MIN(session_rating)                               AS lowest,
        MAX(session_rating)                               AS highest,
        SUM(session_rating <= 2 OR session_rating >= 4)   AS extreme  -- booleans sum as 0/1
    FROM reading_sessions
    GROUP BY book_id
)
SELECT
    b.book_id,
    b.title,
    b.author,
    b.genre,
    b.pages,
    s.highest - s.lowest AS rating_spread,                -- max - min, after the gates
    ROUND(s.extreme * 1.0 / s.total_sessions, 2) AS polarization_score  -- *1.0: never 3/5 -> 0
FROM book_stats s
JOIN books b ON b.book_id = s.book_id
WHERE s.total_sessions >= 5                              -- gate 1: at least five readers
  AND s.lowest <= 2 AND s.highest >= 4                   -- gates 2+3: BOTH poles exist
  AND s.extreme * 1.0 / s.total_sessions >= 0.6          -- gate 4: 60% extreme floor (raw share, not rounded)
ORDER BY polarization_score DESC, b.title DESC;          -- score first, then title Z->A`,
    walkthrough: [
      "The stats CTE folds all 36 sessions: Gatsby (5 sessions, min 1, max 5, 5 extremes), 1984 (6, 1, 5, 6), Mockingbird (5, 4, 5, 5), Norwegian Wood (5, 1, 5, 2), Lord of the Flies (6, 1, 2, 6), Middlemarch (5, 2, 4, 3) — Empty Shelf (book 9) has no rows at all.",
      "The existence gates kill the single-pole books: Mockingbird's min is 4 (no ≤ 2), Lord of the Flies' max is 2 (no ≥ 4). The session gate already excluded official books 4 and 5 (two sessions each); Empty Shelf never forms a group to filter.",
      "The share gate: Gatsby 5/5 = 1.00 in, 1984 6/6 = 1.00 in, Middlemarch 3/5 = 0.6 — exactly at the inclusive floor — in; Norwegian Wood's 2/5 = 0.4 is out despite carrying both poles.",
      "Spreads and the final order: Gatsby 5 − 1 = 4, 1984 5 − 1 = 4, Middlemarch 4 − 2 = 2; score DESC then title DESC puts 'The Great Gatsby' ahead of '1984' ('T' > '1'), with Middlemarch last at 0.60.",
    ],
    time: "O(s) — one grouped pass over s sessions into per-book aggregates",
    space: "O(b) — one stats row per rated book",
    followUps: [
      "Swap the 60%-extreme rule for statistical dispersion: rank books by rating variance (AVG(r*r) − AVG(r)²) — do Gatsby and 1984 stay on top?",
      "Return the per-genre share of polarized books: a two-level rollup where the book-level gate becomes a CASE flag.",
    ],
    related: ["trips-and-users", "odd-and-even-transactions", "classes-more-than-5-students"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-loyal-customers",
    statement:
      "A transactions log marks every row as a purchase or a refund. A customer is loyal when they made at least three purchases, their first-to-last transaction spans at least 30 days, and refunds make up less than 20% of ALL their transactions. Output the loyal customer ids in ascending order.",
    examples: [
      {
        input:
          "18 official transactions for customers 101–104 — plus traps: 105 (3 purchases, Jan 1 → Jan 31), 106 (Jan 1 → Jan 30), 107 (4 purchases + 1 refund over 60 days), 108 (3 purchases all on 2024-02-01), 109 (10 purchases + 2 refunds across 12 transactions)",
        output: "customer_id: 101 · 104 · 105 · 109",
        explanation:
          "101: 4 purchases, 0 refunds, 46-day span. 104: 1/6 ≈ 16.7% refunds, 74-day span. 105's span is EXACTLY 30 days — the inclusive ≥ keeps it; 106 misses at 29. 107 lands on exactly 1/5 = 20% — not < 20%, out. 108 has 3 purchases but a 0-day span. 109 is the denominator trap: refunds ÷ all = 2/12 ≈ 16.7% (loyal) — refunds ÷ purchases would misread 2/10 = 20% and wrongly drop them.",
      },
    ],
    constraints: [
      "transaction_type is either 'purchase' or 'refund'; transaction_date is a YYYY-MM-DD date",
      "loyal = ≥ 3 purchase transactions AND (max date − min date) ≥ 30 days AND refunds ÷ ALL transactions < 20% (strict)",
      "the 30-day span and the refund-rate denominator count ALL transactions (refunds included); order by customer_id ASC",
    ],
    breakdown: [
      "Three independent criteria per customer, ALL of which must hold: ≥ 3 purchase transactions, a first-to-last span of ≥ 30 days, and refunds under 20% of ALL transactions. None of them is about consecutiveness — 'active for at least 30 days' is a SPAN (max date − min date), exactly as the official walk-through computes it (Jan 5 → Feb 20 = 46 days). Whatever 'gaps and islands' intuition the problem name invites, the facts define span, not streaks.",
      "Each criterion is a per-group aggregate: SUM(transaction_type = 'purchase') counts purchases (SQLite sums booleans as 0/1), MAX(julianday(transaction_date)) − MIN(...) is the span in days, and the refund rate's DENOMINATOR is COUNT(*) — purchases PLUS refunds. The denominator is the stealth trap: refunds/purchases would judge customer 109 as 2/10 = 20% (out) when the truth is 2/12 ≈ 16.7% (in).",
      "Boundary discipline: 'less than 20%' is strict — customer 107's 1/5 = 20.0% exactly is OUT. 'At least 30 days' is inclusive — customer 105's Jan 1 → Jan 31 = 30.0 days exactly is IN, while 106's 29-day span is out. And customer 108's three purchases all land on 2024-02-01: the purchase count (3) clears, but the span is 0 — transactions, not days, are what the first gate counts.",
      "Everything folds into one GROUP BY customer_id with a three-clause HAVING — no joins, no CTEs, no windows. julianday() converts the TEXT dates to numbers so subtraction measures days; ORDER BY customer_id ASC finishes the (mandated) job.",
    ],
    edges: [
      "The refund rate's denominator is ALL transactions: customer 109 is 2/12 ≈ 16.7% (loyal) — a refunds/purchases misread gives 2/10 = 20% and wrongly drops them.",
      "'Less than 20%' is strict: customer 107 lands on exactly 1/5 = 20.0% and is out despite 4 purchases and a 60-day span.",
      "'At least 30 days' is inclusive: 105 (Jan 1 → Jan 31, exactly 30) is in; 106 (29 days) is out.",
      "Three same-day purchases (customer 108) satisfy the purchase count but give a 0-day span — volume of transactions ≠ length of relationship.",
    ],
    ladder: [
      {
        title: "Brute force — three subqueries per customer",
        body: "Check purchase count, date span and refund share with separate correlated subqueries — three scans of the log per customer, and the denominators drift apart between them.",
      },
      {
        title: "The pattern — one GROUP BY, boolean sums",
        body: "GROUP BY customer_id and compute all three metrics in one pass: SUM(type = 'purchase'), julianday MAX − MIN, SUM(type = 'refund') ÷ COUNT(*). Each metric is a standard aggregate over the same group.",
      },
      {
        title: "The optimal idea — a three-clause HAVING",
        body: "The whole problem is a per-customer predicate, so HAVING carries all three gates (with the strict/inclusive boundaries the facts pin) and ORDER BY customer_id finishes. No joins, no CTE, one scan.",
      },
    ],
    approach: "One GROUP BY + three-clause HAVING (boolean sums + julianday span)",
    schema: {
      ddl: `CREATE TABLE customer_transactions (
  transaction_id   INTEGER PRIMARY KEY,
  customer_id      INTEGER NOT NULL,
  transaction_date TEXT NOT NULL,      -- 'YYYY-MM-DD'
  amount           REAL NOT NULL,
  transaction_type TEXT NOT NULL       -- 'purchase' | 'refund'
);`,
      seed: `INSERT INTO customer_transactions (transaction_id, customer_id, transaction_date, amount, transaction_type) VALUES
  (1,  101, '2024-01-05', 150.00, 'purchase'),   -- official
  (2,  101, '2024-01-15', 200.00, 'purchase'),
  (3,  101, '2024-02-10', 180.00, 'purchase'),
  (4,  101, '2024-02-20', 250.00, 'purchase'),
  (5,  102, '2024-01-10', 100.00, 'purchase'),
  (6,  102, '2024-01-12', 120.00, 'purchase'),
  (7,  102, '2024-01-15', 80.00,  'refund'),
  (8,  102, '2024-01-18', 90.00,  'refund'),
  (9,  102, '2024-02-15', 130.00, 'purchase'),
  (10, 103, '2024-01-01', 500.00, 'purchase'),
  (11, 103, '2024-01-02', 450.00, 'purchase'),
  (12, 103, '2024-01-03', 400.00, 'purchase'),
  (13, 104, '2024-01-01', 200.00, 'purchase'),
  (14, 104, '2024-02-01', 250.00, 'purchase'),
  (15, 104, '2024-02-15', 300.00, 'purchase'),
  (16, 104, '2024-03-01', 350.00, 'purchase'),
  (17, 104, '2024-03-10', 280.00, 'purchase'),
  (18, 104, '2024-03-15', 100.00, 'refund'),
  (19, 105, '2024-01-01', 300.00, 'purchase'),   -- TRAP: span = EXACTLY 30 days -> still loyal
  (20, 105, '2024-01-15', 120.00, 'purchase'),
  (21, 105, '2024-01-31', 90.00,  'purchase'),
  (22, 106, '2024-01-01', 300.00, 'purchase'),   -- TRAP: span 29 days -> misses the bar
  (23, 106, '2024-01-15', 120.00, 'purchase'),
  (24, 106, '2024-01-30', 90.00,  'purchase'),
  (25, 107, '2024-01-01', 200.00, 'purchase'),   -- TRAP: 1 refund / 5 total = EXACTLY 20% -> not < 20%
  (26, 107, '2024-01-20', 150.00, 'purchase'),
  (27, 107, '2024-02-10', 180.00, 'purchase'),
  (28, 107, '2024-03-01', 220.00, 'purchase'),
  (29, 107, '2024-02-15', 100.00, 'refund'),
  (30, 108, '2024-02-01', 50.00,  'purchase'),   -- TRAP: 3 purchases, ONE day -> span 0
  (31, 108, '2024-02-01', 60.00,  'purchase'),
  (32, 108, '2024-02-01', 70.00,  'purchase'),
  (33, 109, '2024-01-01', 60.00,  'purchase'),   -- TRAP: 2 refunds / 12 total = 16.7% (a
  (34, 109, '2024-01-08', 70.00,  'purchase'),   --   refunds/purchases misread says 2/10 = 20%)
  (35, 109, '2024-01-15', 80.00,  'purchase'),
  (36, 109, '2024-01-22', 90.00,  'purchase'),
  (37, 109, '2024-01-29', 100.00, 'purchase'),
  (38, 109, '2024-02-05', 110.00, 'purchase'),
  (39, 109, '2024-02-12', 120.00, 'purchase'),
  (40, 109, '2024-02-19', 130.00, 'purchase'),
  (41, 109, '2024-02-26', 140.00, 'purchase'),
  (42, 109, '2024-03-04', 150.00, 'purchase'),
  (43, 109, '2024-01-10', 40.00,  'refund'),
  (44, 109, '2024-02-08', 40.00,  'refund');`,
      tables: [
        { name: "customer_transactions", note: "44 rows — the official 18 + five trap customers (105–109): 30-day boundary, 29-day miss, exactly-20% rate, same-day burst, denominator flip" },
      ],
    },
    code: `SELECT customer_id
FROM customer_transactions
GROUP BY customer_id
HAVING SUM(transaction_type = 'purchase') >= 3                 -- gate 1: >= 3 purchase ROWS
   AND MAX(julianday(transaction_date))
     - MIN(julianday(transaction_date)) >= 30                  -- gate 2: first-to-last span >= 30 days
   AND SUM(transaction_type = 'refund') * 1.0 / COUNT(*) < 0.2 -- gate 3: refunds / ALL transactions < 20% (strict)
ORDER BY customer_id ASC;                                      -- mandated ascending ids`,
    walkthrough: [
      "The single GROUP BY folds all 44 rows: customer 101 → 4 purchases, 0 refunds, 46-day span; 102 → 3 purchases + 2 refunds over 36 days; 103 → 3 purchases in 2 days; 104 → 5 + 1 over 74 days; and the traps — 105 (3 purchases, 30-day span), 106 (29 days), 107 (1 refund in 5), 108 (3 purchases, one day), 109 (2 refunds in 12).",
      "The purchase gate (≥ 3) alone eliminates nobody in this seed — everyone owns at least three purchases — which is exactly why it's dangerous to eyeball: all the eliminations live in the span and rate gates.",
      "The span gate kills 103 (2 days), 106 (29) and 108 (0); 105's exactly-30 span survives the inclusive ≥. The rate gate kills 102 (2/5 = 40%) and 107 (exactly 20%, not < 20%); 109's correct denominator 2/12 ≈ 16.7% keeps them in — the purchases-only misread (2/10 = 20%) would have wrongly dropped them.",
      "Survivors 101, 104, 105 and 109 print in ascending id order — four customers, three gates, one pass.",
    ],
    time: "O(t) — one grouped pass over t transactions (julianday conversion is O(1) per row)",
    space: "O(c) — one aggregate row per customer",
    followUps: [
      "Redefine loyal as purchases in 3 CONSECUTIVE months — the gaps-and-islands variant; what would the seed need so that span ≠ streak actually changes the answer?",
      "Make the thresholds parameters: rewrite the HAVING so the purchase floor, span and rate cutoff come from a small VALUES spine — and explain why the rate boundary must stay strict.",
    ],
    related: ["user-activity-for-the-past-30-days-i", "the-latest-login-in-2020", "find-churn-risk-customers"],
    order: "exact",
    xp: 20,
  },
];
