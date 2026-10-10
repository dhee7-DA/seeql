// Deep-dives — the FINAL WAVE band, part B: ops & pairs (LC 1204 / 3626 /
// 3642 / 3673 / 3764 / 3617) — the last free Database problems the app had
// not yet wired. A queue's running-sum boarding gate, inventory imbalance
// ratios, polarized review splits, zombie session fingerprints, consecutive
// course transitions and the 2-day-gap study spiral. Solutions are SQLite
// dialect, one statement each, engine-verified against the per-problem
// seeds.
// Engine lesson baked into 3673: julianday() is a float — a clean 35-minute
// span computes as 34.999999… days (CAST truncates to 34!). All date
// arithmetic there runs on strftime('%s', …) epoch seconds, which stay
// exact integers.
import type { LcSqlDive } from "../types";

export const SQL_FINAL_WAVE_B: LcSqlDive[] = [
  {
    slug: "last-person-to-fit-in-the-bus",
    statement:
      "People queue for a gondola rated at 1000 kg and board strictly in turn order, starting at turn 1. Name the last passenger who actually boards — boarding stops the moment letting the next person aboard would push the accumulated weight past the limit.",
    examples: [
      {
        input:
          "Queue: (5,'Alice',250,turn 1) · (1,'Alex',350,2) · (7,'Chir',400,3) · (4,'Bolt',100,4) · (2,'Dina',150,5) — gondola limit 1000 kg",
        output: "Chir",
        explanation:
          "Prefix sums by turn: 250 → 600 → 1000 (exactly at the limit — still fits) → 1100 → 1250. Chir boards last; Bolt's light 100 kg doesn't save him because the gondola is already full, and Dina behind him is out for the same reason.",
      },
    ],
    constraints: [
      "turn values are unique and start at 1 — boarding order is turn, not person_id",
      "weights are positive; the limit is exactly 1000",
      "a passenger boards iff the running total WITH them stays <= 1000",
    ],
    breakdown: [
      "The queue is a sequence, and the natural primitive for a sequence is a running total. 'Would the gondola still fit if I boarded?' translates per-row into: the sum of weights over all turns up to mine is <= 1000. Phrase the question that way and the running aggregate writes itself.",
      "The boarding timeline is turn — NOT row order, NOT person_id. The seed deliberately scatters ids (5, 1, 7, 4, 2) while turns run 1..5; every wrong answer to this problem starts with an ORDER BY person_id or a self-join that forgot to compare turns. SUM(weight) OVER (ORDER BY turn) makes turn the timeline explicitly.",
      "The last person aboard is the MAX turn whose running total still fits. Because every weight is positive, the running total only climbs — the fitting rows are exactly the prefix turns 1..k, so 'max fitting turn' and 'where the queue stops' are the same k. (Weights of zero would keep the prefix shape; there are none, and negative weights don't exist.)",
      "Mechanically, the running total can't live in WHERE — window functions aren't visible until after SELECT — so a CTE computes the prefix sums and the outer query filters and picks. This 'window in a CTE, filter outside' shape is the same move as every top-k-per-group problem.",
    ],
    edges: [
      "The boundary is <=: Chir lands the total on EXACTLY 1000 and boards — a strict < drops the correct answer.",
      "person_id order is bait: Alice (id 5) boards first, Dina (id 2) last.",
      "After the first overload (Bolt, 1100) later passengers stay out too — even light ones (Dina, 150). The answer is the last fitting turn, not 'the lightest latecomer'.",
      "The output is ONE name, not the manifest — pick the max fitting turn (ORDER BY turn DESC LIMIT 1).",
    ],
    ladder: [
      {
        title: "Brute force — pair-count every prefix",
        body: "For each passenger, add up everyone with a smaller-or-equal turn: a self-join on t2.turn <= t1.turn grouped by passenger, HAVING the sum fit. O(n²) pair counting, but logically exact — and the classic pre-window answer.",
      },
      {
        title: "The pattern — the running-aggregate window",
        body: "SUM(weight) OVER (ORDER BY turn) computes ALL prefix sums in one sorted pass. It is literally the self-join's output produced in O(n log n); every 'running total' request in SQL is this function.",
      },
      {
        title: "The optimal idea — window, gate, pick",
        body: "Prefix sums <= 1000 keep exactly turns 1..k; ORDER BY turn DESC LIMIT 1 returns passenger k. One CTE, one sort, no join — the minimal expression of the whole problem.",
      },
    ],
    approach: "Running SUM OVER (ORDER BY turn) + last fitting turn",
    schema: {
      ddl: `CREATE TABLE Queue (
  person_id   INTEGER PRIMARY KEY,
  person_name TEXT NOT NULL,
  weight      INTEGER NOT NULL,
  turn        INTEGER NOT NULL UNIQUE
);`,
      seed: `INSERT INTO Queue (person_id, person_name, weight, turn) VALUES
  (5, 'Alice', 250, 1),   -- official rows: id order != boarding order
  (1, 'Alex',  350, 2),
  (7, 'Chir',  400, 3),   -- running total lands on exactly 1000: the <= boundary
  (4, 'Bolt',  100, 4),   -- 1100: first overload, despite a tiny weight
  (2, 'Dina',  150, 5);   -- trap: light, but the gondola is already full`,
      tables: [
        { name: "Queue", note: "5 passengers; prefix sums 250 / 600 / 1000 / 1100 / 1250 — only turns 1–3 fit" },
      ],
    },
    code: `WITH boarded AS (
    SELECT
        person_name,
        turn,
        SUM(weight) OVER (ORDER BY turn) AS running_weight  -- turn is the boarding timeline
    FROM Queue
)
SELECT person_name
FROM boarded
WHERE running_weight <= 1000   -- exactly 1000 still fits — the seed hits it
ORDER BY turn DESC
LIMIT 1;                       -- the LAST passenger the running total allows`,
    walkthrough: [
      "The window sorts the five passengers by turn and stamps prefix sums onto each row: Alice 250, Alex 600, Chir 1000, Bolt 1100, Dina 1250.",
      "The CTE hands those rows to the outer filter, which keeps running_weight <= 1000: turns 1–3 survive. Chir sits exactly ON the limit — the <= is doing real work.",
      "Bolt's 100 kg looks harmless alone, but the running total says 1100 — the gondola is full — and Dina after him inherits the same verdict. Any check keyed on individual weights boards one of them wrongly.",
      "ORDER BY turn DESC + LIMIT 1 hands back turn 3: Chir, the last name on the manifest.",
    ],
    time: "O(n log n) — the running-sum window's ORDER BY turn sort; the self-join rewrite is O(n²) pair counting",
    space: "O(n) — the CTE holding prefix sums",
    followUps: [
      "Drop the LIMIT and return the whole boarding manifest — every passenger with their running weight (that query is already written by the CTE).",
      "What if a weight could be 0 (a toddler rides free)? The total stops being strictly increasing — does 'max fitting turn' still equal 'where the queue stops'?",
    ],
    related: ["restaurant-growth", "game-play-analysis-iii", "average-selling-price"],
    order: "any",
    xp: 20,
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
    slug: "find-students-with-study-spiral-pattern",
    statement:
      "Study sessions record which subject a student opened, on which date, for how long. A student follows the Study Spiral Pattern when their chronological session list cycles through the SAME sequence of subjects — at least 3 distinct subjects per cycle — repeated for at least 2 complete cycles (so at least 6 sessions), with no pause longer than 2 days between consecutive sessions. Report spiral students with their cycle length (distinct subjects in the rotation) and total study hours.",
    examples: [
      {
        input:
          "Alice Math→Physics→Chemistry ×2 (Oct 1–6 daily, 15.0h) · Bob Algebra→Calculus→Statistics→Geometry ×2 (Oct 1–8, 26.0h) · Carol Biology/Chemistry ×2 (only 2 subjects) · David 2 sessions 4 days apart · Emma none — traps: Felix a 3-cycle on 2-DAY gaps (12.0h), Gina a perfect 3-cycle plus one stray Art session, Hank Moon a perfect 3-cycle split by a 3-day pause, Noah only 4 sessions of a 3-cycle",
        output:
          "(2, Bob Johnson, Mathematics, 4, 26.0) · (1, Alice Chen, Computer Science, 3, 15.0) · (6, Felix Ng, Economics, 3, 12.0)",
        explanation:
          "Bob cycles 4 subjects twice, Alice 3 subjects twice, Felix 3 subjects twice with the maximum-tolerated 2-day gaps. Gina's stray Art session leaves 7 sessions over 4 subjects — an incomplete second cycle AND a period break; Hank Moon's single 3-day pause kills an otherwise perfect rotation; Noah never finishes a second cycle (4 < 6); Carol's cycle length 2 is below the floor of 3.",
      },
    ],
    constraints: [
      "cycle length = number of distinct subjects in the rotation; the minimum is 3",
      "the rotation must complete at least 2 full cycles — at least 6 sessions total",
      "consecutive sessions may be at most 2 days apart; a longer pause breaks the spiral",
    ],
    breakdown: [
      "This is periodicity detection, not streak detection. The question per student: does the ENTIRE chronological session list repeat with period k, where k equals the number of distinct subjects, k >= 3, the list runs at least 2k long, and the calendar never pauses more than 2 days? A sequence like A,B,A,C,A,B,A,C has no equal neighbors but is NOT a period-3 spiral — the test must be positional, not 'differs from previous'.",
      "Three per-student facts power the decision, and windows hand you all three cheaply. ROW_NUMBER over (session_date, session_id) fixes each session's position; LAG over the same ordering exposes the day gap between consecutive sessions, whose MAX is the worst pause; GROUP BY yields n (sessions), k (COUNT(DISTINCT subject)) and the total hours in one pass each.",
      "Why the tempting shortcuts fail: COUNT(DISTINCT subject) >= 3 AND COUNT(*) >= 6 would admit Gina (4 subjects, 7 sessions) — a pile of subjects is not a cycle. A 'no two consecutive sessions equal' LAG test would admit A,B,A,C shuffles. MIN(score)-style extremes do not exist here, but the analogous 'starts and ends with the same subject' check admits plenty of non-periodic lists. The only sound shape test is positional: in a true period-k cycle, every session at position p > k repeats the subject at position p − k.",
      "Assembly: seq CTE numbers positions; dated/gaps CTEs compute and fold the worst pause; meta CTE aggregates n, k and hours. The outer WHERE stacks the four gates — k >= 3, n >= 2k, COALESCE(max_gap, 0) <= 2, and NOT EXISTS (a position pair (p, p−k) with differing subjects) — then ORDER BY cycle_length DESC, total_study_hours DESC as mandated. One scoping detail inside the probe: the self-join itself only ties a and b to EACH OTHER, so the WHERE must also pin a.student_id to the outer student — unscoped, some other student's mismatch vetoes everyone.",
    ],
    edges: [
      "The gap boundary is inclusive: Felix's sessions every 2 days are a legal spiral (gap <= 2), while Hank Moon's single 3-day pause disqualifies an otherwise perfect 3-cycle.",
      "One stray session is fatal: Gina runs a flawless Math→Physics→Chemistry ×2 and then one Art session — 7 sessions over 4 subjects can't complete 2 cycles, and the period probe finds Art where Chemistry should repeat.",
      "An incomplete second cycle fails: Noah has 4 sessions of a valid 3-subject rotation — n = 4 < 2k = 6 excludes him despite perfect periodicity so far.",
      "A legal-but-short cycle is out of scope: Carol's Biology/Chemistry alternation IS periodic, but cycle length 2 < 3 — the spec's floor disqualifies a true 2-subject spiral.",
    ],
    ladder: [
      {
        title: "Brute force — test every candidate period by hand",
        body: "Pull each student's sessions sorted by date, try every plausible period, verify subject equality at each stride and scan the date gaps — all procedural, per student. Correct, but exactly the work the positional self-join formalizes.",
      },
      {
        title: "The pattern — positions, gaps and counts from windows",
        body: "ROW_NUMBER fixes positions, LAG exposes the day gaps, GROUP BY yields n, k and hours. The remaining question — 'does every position p repeat position p − k?' — is a self-join of the numbered list onto itself at offset k.",
      },
      {
        title: "The optimal idea — four gates, one outer WHERE",
        body: "Stack k >= 3, n >= 2k, max gap <= 2 and the no-mismatch periodicity probe as a single filter over per-student aggregates. One sort per student plus an O(s) probe — no procedural loops, no trial periods.",
      },
    ],
    approach: "Position-numbered sessions + LAG gap audit + period-k self-check",
    schema: {
      ddl: `CREATE TABLE students (
  student_id   INTEGER PRIMARY KEY,
  student_name TEXT NOT NULL,
  major        TEXT NOT NULL
);
CREATE TABLE study_sessions (
  session_id    INTEGER PRIMARY KEY,
  student_id    INTEGER NOT NULL REFERENCES students(student_id),
  subject       TEXT NOT NULL,
  session_date  TEXT NOT NULL,           -- 'YYYY-MM-DD'
  hours_studied REAL NOT NULL
);`,
      seed: `INSERT INTO students (student_id, student_name, major) VALUES
  (1, 'Alice Chen', 'Computer Science'), (2, 'Bob Johnson', 'Mathematics'),
  (3, 'Carol Davis', 'Physics'),         (4, 'David Wilson', 'Chemistry'),
  (5, 'Emma Brown', 'Biology'),                              -- official
  (6, 'Felix Ng', 'Economics'),        (7, 'Gina Park', 'History'),
  (8, 'Hank Moon', 'Art History'),     (9, 'Noah Kim', 'Mathematics');  -- traps
INSERT INTO study_sessions (session_id, student_id, subject, session_date, hours_studied) VALUES
  (1,  1, 'Math',      '2023-10-01', 2.5),  -- official: Alice's 3-cycle, cycle 1
  (2,  1, 'Physics',   '2023-10-02', 3.0),
  (3,  1, 'Chemistry', '2023-10-03', 2.0),
  (4,  1, 'Math',      '2023-10-04', 2.5),  -- official: Alice's cycle 2
  (5,  1, 'Physics',   '2023-10-05', 3.0),
  (6,  1, 'Chemistry', '2023-10-06', 2.0),
  (7,  2, 'Algebra',   '2023-10-01', 4.0),  -- official: Bob's 4-cycle, cycle 1
  (8,  2, 'Calculus',  '2023-10-02', 3.5),
  (9,  2, 'Statistics','2023-10-03', 2.5),
  (10, 2, 'Geometry',  '2023-10-04', 3.0),
  (11, 2, 'Algebra',   '2023-10-05', 4.0),  -- official: Bob's cycle 2
  (12, 2, 'Calculus',  '2023-10-06', 3.5),
  (13, 2, 'Statistics','2023-10-07', 2.5),
  (14, 2, 'Geometry',  '2023-10-08', 3.0),
  (15, 3, 'Biology',   '2023-10-01', 2.0),  -- official: Carol, only 2 subjects
  (16, 3, 'Chemistry', '2023-10-02', 2.5),
  (17, 3, 'Biology',   '2023-10-03', 2.0),
  (18, 3, 'Chemistry', '2023-10-04', 2.5),
  (19, 4, 'Organic',   '2023-10-01', 3.0),  -- official: David, 4-day gap
  (20, 4, 'Physical',  '2023-10-05', 2.5),
  (21, 6, 'Math',      '2023-10-01', 2.5),  -- TRAP: Felix's 3-cycle on 2-day gaps
  (22, 6, 'Physics',   '2023-10-03', 2.0),
  (23, 6, 'Chemistry', '2023-10-05', 1.5),
  (24, 6, 'Math',      '2023-10-07', 2.5),
  (25, 6, 'Physics',   '2023-10-09', 2.0),
  (26, 6, 'Chemistry', '2023-10-11', 1.5),
  (27, 7, 'Math',      '2023-10-01', 2.0),  -- TRAP: Gina, perfect 3-cycle ...
  (28, 7, 'Physics',   '2023-10-02', 2.0),
  (29, 7, 'Chemistry', '2023-10-03', 2.0),
  (30, 7, 'Math',      '2023-10-04', 2.0),
  (31, 7, 'Physics',   '2023-10-05', 2.0),
  (32, 7, 'Chemistry', '2023-10-06', 2.0),
  (33, 7, 'Art',       '2023-10-07', 3.0),  -- ... plus ONE stray session
  (34, 8, 'Math',      '2023-10-01', 3.0),  -- TRAP: Hank Moon, perfect 3-cycle ...
  (35, 8, 'Physics',   '2023-10-02', 3.0),
  (36, 8, 'Chemistry', '2023-10-03', 3.0),
  (37, 8, 'Math',      '2023-10-06', 3.0),  -- ... split by a 3-DAY pause (10-03 -> 10-06)
  (38, 8, 'Physics',   '2023-10-07', 3.0),
  (39, 8, 'Chemistry', '2023-10-08', 3.0),
  (40, 9, 'Math',      '2023-10-01', 1.0),  -- TRAP: Noah, only 4 of 6 sessions
  (41, 9, 'Physics',   '2023-10-02', 1.0),
  (42, 9, 'Chemistry', '2023-10-03', 1.0),
  (43, 9, 'Math',      '2023-10-04', 1.0);`,
      tables: [
        { name: "students", note: "9 students — the official 5 plus four trap histories" },
        { name: "study_sessions", note: "43 sessions — clean 3- and 4-cycles, a 2-day-gap spiral, a stray-session break, a 3-day pause and an unfinished second cycle" },
      ],
    },
    code: `WITH seq AS (
    -- position each session within its student's chronological order
    SELECT
        student_id,
        subject,
        ROW_NUMBER() OVER (
            PARTITION BY student_id
            ORDER BY session_date, session_id
        ) AS pos
    FROM study_sessions
),
dated AS (
    -- expose the day gap between consecutive sessions per student
    SELECT
        student_id,
        julianday(session_date)
          - julianday(LAG(session_date) OVER (
                PARTITION BY student_id
                ORDER BY session_date, session_id
            )) AS gap_days
    FROM study_sessions
),
gaps AS (
    SELECT student_id, MAX(gap_days) AS max_gap   -- the worst pause on record
    FROM dated
    GROUP BY student_id
),
meta AS (
    -- sessions on record, distinct subjects, total hours — one row per student
    SELECT
        student_id,
        COUNT(*)                AS n,
        COUNT(DISTINCT subject) AS k,
        SUM(hours_studied)      AS total_study_hours
    FROM study_sessions
    GROUP BY student_id
)
SELECT
    st.student_id,
    st.student_name,
    st.major,
    m.k                  AS cycle_length,      -- distinct subjects in the rotation
    m.total_study_hours
FROM meta m
JOIN students st ON st.student_id = m.student_id
LEFT JOIN gaps g ON g.student_id = m.student_id
WHERE m.k >= 3                                  -- at least 3 rotating subjects
  AND m.n >= 2 * m.k                            -- at least 2 complete cycles (>= 6 sessions)
  AND COALESCE(g.max_gap, 0) <= 2               -- never more than 2 days between sessions
  AND NOT EXISTS (                              -- period-k probe: every session ...
        SELECT 1                                -- ... repeats the one k slots earlier
        FROM seq a
        JOIN seq b ON b.student_id = a.student_id AND b.pos = a.pos - m.k
        WHERE a.student_id = m.student_id       -- probe THIS student's positions only
          AND a.subject <> b.subject)
ORDER BY cycle_length DESC, total_study_hours DESC;`,
    walkthrough: [
      "seq numbers each history chronologically: Alice pos 1–6 cycle Math/Physics/Chemistry twice; Gina pos 1–7 with Art parked at pos 7; Noah pos 1–4 stops mid-second-cycle.",
      "dated and gaps audit the calendar: daily histories (Alice, Bob, Gina, Noah) peak at gap 1; Felix's every-2-days spacing peaks at exactly 2 — tolerated; Hank Moon's Oct 3 → Oct 6 jump peaks at 3 — fatal; David's lone gap is 4.",
      "meta aggregates the shape facts: Alice 6/3/15.0, Bob 8/4/26.0, Felix 6/3/12.0, Gina 7/4/24.0, Hank Moon 6/3/18.0, Noah 4/3/4.0, Carol 4/2, David 2/2 — Emma has no row at all.",
      "The four gates sort everyone out: k >= 3 removes Carol and David; n >= 2k removes Noah (4 < 6) and Gina (7 < 8); max_gap <= 2 removes Hank Moon (3); the NOT EXISTS probe then verifies periodicity for the survivors — Bob's positions 5–8 repeat 1–4, Alice's 4–6 repeat 1–3, Felix's repeat at stride 3. Ordered output: Bob (4, 26.0), Alice (3, 15.0), Felix (3, 12.0).",
    ],
    time: "O(s log s) — the per-student session sort drives ROW_NUMBER and LAG; the periodicity probe is O(s) position lookups per student",
    space: "O(s) — the numbered, dated and per-student aggregate CTEs",
    followUps: [
      "Find the LONGEST spiral embedded in a messier history (other sessions between spiral stretches) — gaps-and-islands over the periodicity violations, then pick the longest island per student.",
      "Relax the floor: allow 2-subject rotations but demand 3 complete cycles instead of 2 — which gate constants change, and does the period probe need any change at all?",
    ],
    related: ["find-loyal-customers", "find-users-with-persistent-behavior-patterns", "consecutive-numbers"],
    order: "exact",
    xp: 35,
  },
];
