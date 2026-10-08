// Deep-dives — free new-generation SQL, batch 10 file 5 of 5: market-basket
// pairs, category affinity, seasonal rolls, parity buckets and per-driver
// trends (5 problems: 4 Medium, 1 Hard, all order:"exact" reads).
// Re-authored from the canonical new-gen tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_FREE_MARKET: LcSqlDive[] = [
  {
    slug: "find-product-recommendation-pairs",
    statement:
      "BasketLine records one row per product scan inside a shopping basket: (basket_id, product_id) — a product scanned twice in the same basket logs two lines. A product pair is recommended when the two products appear together in at least 3 distinct baskets. Report every recommended pair with the columns product1, product2, pairs_count, where product1 < product2 (the pair (1, 2) and its mirror (2, 1) are one pair reporting once), pairs_count is the number of distinct baskets containing both products, and only pairs reaching the 3-basket gate report. Order by pairs_count descending, then product1 ascending, then product2 ascending.",
    examples: [
      {
        input: "products 1 and 2 share baskets 1, 2, 3 and 4 — four distinct baskets hold both",
        output: "1 · 2 · 4",
        explanation:
          "Four baskets clear the 3-basket gate with room to spare, so the top pair reports 4 — triple basket 3 contributes one of those four baskets through its cross-product pairing.",
      },
      {
        input: "products 3 and 4 share baskets 6, 7 and 8 — exactly three distinct baskets",
        output: "3 · 4 · 3",
        explanation:
          "Exactly 3 is still recommended: the gate is >= 3, inclusive — and pair (1, 3), which meets in only 2 baskets (3 and 5), stays out despite basket 5 logging product 1 twice.",
      },
    ],
    constraints: [
      "every output row satisfies product1 < product2 — a pair reports once, in canonical orientation, never mirrored",
      "pairs_count counts DISTINCT baskets holding both products; repeated scans of one product inside a basket count that basket once",
      "columns product1, product2, pairs_count with only pairs_count >= 3 reporting, ordered by pairs_count DESC, then product1 ASC, then product2 ASC",
    ],
    breakdown: [
      "A product pair is a SET of two products, but the table stores scan lines, so the report has to manufacture the pairs itself. The engine shape is BasketLine joined to itself on basket_id, and the join predicate a.product_id < b.product_id does two jobs at once: it pairs every two distinct products that share a basket, and it kills the mirrored twin in the same breath — without the <, basket 1 would ship (1, 2) and (2, 1) as separate rows and every count would double. Ordering the two ids is not a display nicety, it IS the deduplication. One predicate carries the whole canonicalization.",
      "The count unit is baskets, not rows, and the duplicated scan line in basket 5 is why. A join row is born from a PAIR of scan lines, so basket 5's two copies of product 1 each meet the product-3 line and manufacture two join rows for pair (1, 3) from a single basket. COUNT(*) would tally those as 3 for the pair and promote a two-basket pair past the gate; COUNT(DISTINCT basket_id) collapses them back to one basket and the pair stays out. Whenever a join can multiply rows, the aggregate must name what it counts as DISTINCT.",
      "The gate belongs in HAVING, not WHERE, because 'at least 3 baskets' is a property of the GROUP, not of any row. The boundary is inclusive by design: pair (3, 4) sits at exactly 3 and reports, and a strict > 3 would erase it and ship a one-row report. The final ORDER BY sorts by pairs_count DESC with product1, product2 as deterministic tie-breakers — a contract the grader reads literally. On this seed the two survivors happen to have distinct counts, but the secondary keys are what keep a future tie honest.",
    ],
    edges: [
      "Basket 5 carries product 1 twice — lines (5, 1), (5, 1), (5, 3): COUNT(*) reads pair (1, 3) as 3 scan-line pairs and pushes a two-basket pair past the gate, shipping the phantom row (1, 3, 3) between the real survivors; COUNT(DISTINCT basket_id) holds it at 2 and out.",
      "Basket 3 holds products 1, 2 and 3, so one basket manufactures three pairs — (1, 2), (1, 3) and (2, 3) — and its (1, 2) contribution is the fourth basket of the top pair; a mental model of 'one basket, one pair' miscounts both stories.",
      "Pair (3, 4) sits exactly at the gate with baskets 6, 7 and 8: the >= is inclusive, and a strict > 3 deletes the boundary pair and leaves a single-row report.",
      "Dropping the < canonicalization ships (2, 1) beside (1, 2) with identical counts — the top pair alone doubles to 8 join rows — because the self-join without an ordering predicate emits both orientations.",
    ],
    ladder: [
      { title: "Brute force — test every pair by hand", body: "List the six possible product pairs, then rescan every basket for each pair to see where both appear, count, and filter. Correct, and hopeless at scale — the engine's self-join manufactures all pairs in one pass." },
      { title: "The pattern — canonicalized self-join", body: "Join BasketLine to itself on basket_id with a.product_id < b.product_id; GROUP BY the two product ids; count DISTINCT baskets per group; gate with HAVING." },
      { title: "The optimal idea — count the unit the report names", body: "O(l squared) worst case on scan lines l, driven by within-basket pairing. The durable rules: the ordering predicate IS the pair dedupe, the aggregate must be DISTINCT when joins multiply rows, and the threshold filters groups in HAVING." },
    ],
    approach: "self-join BasketLine on basket_id with a.product_id < b.product_id, COUNT(DISTINCT basket_id) per pair, HAVING >= 3",
    schema: {
      ddl: `CREATE TABLE BasketLine (
  basket_id  INTEGER NOT NULL,
  product_id INTEGER NOT NULL
);`,
      seed: `-- pair (1,2) spans 4 baskets (top) · (3,4) exactly 3 (boundary) · (1,3) only 2 (out)
INSERT INTO BasketLine (basket_id, product_id) VALUES
  (1, 1),
  (1, 2),
  (2, 1),
  (2, 2),
  (3, 1),  -- the triple basket: pairs (1,2), (1,3) and (2,3) all born here
  (3, 2),
  (3, 3),
  (4, 1),  -- with basket 3 this is the top pair's 4th basket
  (4, 2),
  (5, 1),
  (5, 1),  -- duplicate scan of product 1 inside basket 5
  (5, 3),  -- basket 5 still counts ONCE for pair (1,3)
  (6, 3),
  (6, 4),
  (7, 3),
  (7, 4),
  (8, 3),
  (8, 4);`,
      tables: [
        { name: "BasketLine", note: "18 scan lines over 8 baskets — basket 3 holds products 1, 2 and 3; basket 5 logs product 1 twice" },
      ],
    },
    code: `SELECT
    a.product_id AS product1,                    -- canonical pair: smaller id first
    b.product_id AS product2,
    COUNT(DISTINCT a.basket_id) AS pairs_count   -- baskets, never scan lines
FROM BasketLine a
JOIN BasketLine b
  ON a.basket_id  = b.basket_id
 AND a.product_id < b.product_id                 -- one predicate: pairs + dedupes twins
GROUP BY a.product_id, b.product_id
HAVING COUNT(DISTINCT a.basket_id) >= 3          -- boundary inclusive: exactly 3 reports
ORDER BY pairs_count DESC, product1, product2;`,
    walkthrough: [
      "The self-join manufactures one canonical join row per (basket, product-pair): two-line baskets 1, 2, 4, 6, 7 and 8 yield one row each; triple basket 3 yields three — (1, 2), (1, 3) and (2, 3); and basket 5's two product-1 lines each meet its product-3 line, yielding two (1, 3) rows from a single basket.",
      "COUNT(DISTINCT basket_id) collapses the multiplicities: (1, 2) spans baskets 1, 2, 3 and 4 for 4; (3, 4) spans 6, 7, 8 for 3; (1, 3) collapses to baskets {3, 5} for 2; (2, 3) sits at 1.",
      "HAVING >= 3 keeps (1, 2, 4) and (3, 4, 3), and ORDER BY pairs_count DESC ships them in that order — the COUNT(*) variant would have squeezed (1, 3, 3) between them, and a strict > 3 would have dropped the boundary pair.",
    ],
    time: "O(l^2) worst case over scan lines l — the self-join pairs lines within each basket",
    space: "O(p) — one group per formed pair",
    followUps: [
      "Attach each recommended pair's actual basket ids as a sorted, deduplicated list — how does GROUP_CONCAT over a DISTINCT subquery change the grouping, and what does basket 5 contribute to pair (1, 3)'s list?",
      "Make the threshold a parameter k and rank each basket's own pairs by frequency — where does the per-basket ranking window sit relative to the HAVING gate, and can a pair qualify globally yet rank below another pair inside one of its own baskets?",
    ],
    related: ["all-the-pairs-with-the-maximum-number-of-common-followers", "friend-requests-ii-who-has-the-most-friends", "classes-more-than-5-students"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-category-recommendation-pairs",
    statement:
      "PurchaseLog records one row per purchase: (purchase_id, buyer_id, category) across four categories. Two categories have an affinity: the number of distinct buyers who bought BOTH categories. Report every ordered pair of distinct categories with affinity at least 2 — the columns category1, category2, affinity, one row per orientation: (A, B) and (B, A) are separate rows and both report. Order by affinity descending, then category1 ascending, then category2 ascending.",
    examples: [
      {
        input: "buyers 1, 2 and 3 each bought both bakery and dairy; buyer 3 bought dairy twice",
        output: "bakery · dairy · 3, then dairy · bakery · 3",
        explanation:
          "Affinity counts distinct buyers: the repeat dairy purchase adds nothing — 3 buyers, reported in both orientations as two separate rows.",
      },
      {
        input: "buyers 4 and 5 each bought both meat and produce",
        output: "meat · produce · 2, then produce · meat · 2",
        explanation:
          "Affinity exactly 2 clears the >= 2 gate inclusively; buyer 4's additional bakery purchase forms only 1-affinity pairs, which the gate removes.",
      },
    ],
    constraints: [
      "every ordered pair of distinct categories may report — (c1, c2) and (c2, c1) are separate rows; there is no canonical orientation",
      "affinity counts DISTINCT buyers who bought both categories; a buyer who bought a category several times still contributes one",
      "columns category1, category2, affinity with only affinity >= 2 reporting, ordered by affinity DESC, then category1 ASC, then category2 ASC",
    ],
    breakdown: [
      "This problem runs on two grains at once: the pair unit is categories, but the count unit is buyers. A single-stage self-join of PurchaseLog on buyer_id pairs PURCHASES, and a buyer who bought a category twice — buyer 3's two dairy rows — gets counted once per purchase, reading the top affinity as 4 instead of 3. The fix is to set-ify first: a DISTINCT (buyer_id, category) projection collapses each buyer's history into category membership, one row per (buyer, category) pair. The self-join then runs over sets, so every join row is a genuine buyer-bridges-two-categories fact.",
      "The both-orders contract is deliberate and it changes the join predicate. Unlike a canonical-pair report, this output wants (bakery, dairy) AND (dairy, bakery) as separate rows — recommendation direction matters downstream — so the join runs on c1 != c2, not c1 < c2, and every unordered bridge emits two rows. The ORDER BY then makes the doubled output deterministic: affinity DESC first, and the category1, category2 tail is what interleaves the mirrored rows alphabetically instead of leaving their order to the engine. Writing c1 < c2 here halves the report to two rows and fails the contract.",
      "The gate and the invisible buyer close the loop. HAVING COUNT(DISTINCT buyer_id) >= 2 is a group-level filter, and the DISTINCT matters even after set-ifying as insurance for engines and rewrites that rejoin raw logs. Buyer 6, who only ever bought dairy, never forms a join row at all — a self-join needs two categories on the same buyer to fire — so single-category buyers vanish without any LEFT JOIN machinery. And buyer 4's stray bakery purchase is what plants the two 1-affinity pairs that the >= 2 gate quietly removes.",
    ],
    edges: [
      "Buyer 3's repeat dairy (purchases 6 and 7): a raw-log self-join counts buyer 3 twice and reports affinity 4 for both bakery-dairy orientations — the set-ified join reports 3, and the difference is one honest buyer, not one extra purchase.",
      "Buyer 4's bakery purchase (purchase 8) bridges bakery with meat and produce at 1 each: all four of those rows are correctly gated out — but the boundary pair meat-produce sits at exactly 2, so a strict > 2 gate would erase two of the four report rows.",
      "Buyer 6 bought dairy and nothing else (purchase 13): no second category ever meets them in a join, so they appear nowhere — a FROM-buyers LEFT JOIN variant would fabricate NULL-pair rows instead of cleanly omitting them.",
      "Swapping c1 != c2 for c1 < c2 canonicalizes the pairs and ships only (bakery, dairy, 3) and (meat, produce, 2) — losing (dairy, bakery) and (produce, meat), which the contract demands as separate rows.",
    ],
    ladder: [
      { title: "Brute force — twelve ordered pairs", body: "For each of the 4 by 3 ordered category pairs, walk every buyer's purchase history testing membership in both, count, and gate. Twelve scans of the log; the engine composes the same answer from two keyed passes." },
      { title: "The pattern — set-ify, then bridge", body: "DISTINCT (buyer_id, category) collapses each buyer to a category set; a self-join on buyer_id with c1 != c2 emits both orientations of every bridge; group and count DISTINCT buyers." },
      { title: "The optimal idea — two grains, two stages", body: "O(sum of k squared) over per-buyer category counts k. The durable judgment: when the counting unit (buyers) differs from the pairing unit (categories), dedupe to the finer grain FIRST — counting over raw logs double-counts repeats like buyer 3's second dairy." },
    ],
    approach: "distinct (buyer, category) set, self-join on buyer_id with c1 != c2, COUNT(DISTINCT buyer) HAVING >= 2",
    schema: {
      ddl: `CREATE TABLE PurchaseLog (
  purchase_id INTEGER PRIMARY KEY,
  buyer_id    INTEGER NOT NULL,
  category    TEXT NOT NULL
);`,
      seed: `-- bakery-dairy affinity 3 (buyers 1,2,3) · meat-produce 2 (4,5) · the rest 1 or 0
INSERT INTO PurchaseLog (purchase_id, buyer_id, category) VALUES
  (1,  1, 'bakery'),
  (2,  1, 'dairy'),
  (3,  2, 'bakery'),
  (4,  2, 'dairy'),
  (5,  3, 'bakery'),
  (6,  3, 'dairy'),
  (7,  3, 'dairy'),   -- buyer 3's repeat dairy: one buyer, two purchases
  (8,  4, 'bakery'),  -- buyer 4's third category: seeds two 1-affinity pairs
  (9,  4, 'meat'),
  (10, 4, 'produce'),
  (11, 5, 'meat'),
  (12, 5, 'produce'),
  -- single-category buyer: never joins a pair
  (13, 6, 'dairy');`,
      tables: [
        { name: "PurchaseLog", note: "13 purchases, 6 buyers, 4 categories — buyer 3 buys dairy twice; buyer 6 never leaves dairy" },
      ],
    },
    code: `WITH bought AS (
    SELECT DISTINCT buyer_id, category           -- the (buyer, category) SET: repeats collapse
    FROM PurchaseLog
)
SELECT
    a.category AS category1,                     -- both orientations on purpose
    b.category AS category2,                     -- c1 != c2, NOT c1 < c2
    COUNT(DISTINCT a.buyer_id) AS affinity       -- buyers, not purchases
FROM bought a
JOIN bought b
  ON a.buyer_id  = b.buyer_id
 AND a.category != b.category                    -- every ordered pair of distinct categories
GROUP BY a.category, b.category
HAVING COUNT(DISTINCT a.buyer_id) >= 2           -- inclusive gate
ORDER BY affinity DESC, category1, category2;`,
    walkthrough: [
      "The bought CTE folds 13 purchases into 11 set-memberships: buyer 3's two dairy rows collapse to one, and buyer 6 holds only (6, dairy) with nothing to bridge.",
      "The self-join on buyer_id bridges: buyers 1, 2 and 3 all hold bakery and dairy for affinity 3 in both orientations; buyers 4 and 5 hold meat and produce for 2 both ways; buyer 4's bakery purchase additionally bridges bakery-meat and bakery-produce at 1 each.",
      "HAVING >= 2 keeps four rows, and ORDER BY affinity DESC, category1, category2 ships bakery-dairy 3, dairy-bakery 3, meat-produce 2, produce-meat 2 — the naive raw-log count would have printed 4s on top, and the c1 < c2 variant would have printed half the report.",
    ],
    time: "O(sum of k^2) over per-buyer category counts k after the set-ify pass",
    space: "O(b * c) — the deduped (buyer, category) set",
    followUps: [
      "Break the symmetry: report each ordered pair with the buyers who bought category1 chronologically BEFORE category2 — how does the time dimension enter the join, and does affinity stay symmetric then?",
      "Add each pair's affinity as a share of the buyers active in either category — where does the per-category buyer count come from (a second CTE or a window), and how do single-category buyers affect the denominator?",
    ],
    related: ["all-the-pairs-with-the-maximum-number-of-common-followers", "friend-requests-ii-who-has-the-most-friends", "the-airport-with-the-most-flights"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "seasonal-sales-analysis",
    statement:
      "SaleRecord records one row per sale: (sale_id, product_id, amount, sold_on with dates as 'YYYY-MM-DD'). Each sale belongs to a season fixed by the MONTH of sold_on alone — the year never matters: months 12, 1 and 2 are 'winter'; months 3, 4 and 5 are 'spring'; months 6, 7 and 8 are 'summer'; months 9, 10 and 11 are 'autumn'. Report one row per season with the columns season, total_sales (the SUM of amount) and sale_count, ordered by total_sales descending, then season ascending.",
    examples: [
      {
        input: "a sale of 450 on 2024-12-20 and a sale of 250 on 2025-01-05 — December of one year, January of the next",
        output: "winter · 700 · 2",
        explanation:
          "Season reads the month alone: December and January are both winter despite the year boundary, so the two sales land in one group totalling 700.",
      },
      {
        input: "summer holds a single sale: 900 on 2025-07-08",
        output: "summer · 900 · 1",
        explanation:
          "One sale is a complete season row — count 1 — and it tops the report because a one-sale season can out-earn a four-sale one.",
      },
    ],
    constraints: [
      "season is a function of the month alone — 12/1/2 winter, 3/4/5 spring, 6/7/8 summer, 9/10/11 autumn — so December and January always share winter",
      "one row per season present in SaleRecord; total_sales is SUM(amount) and sale_count is the number of that season's sales",
      "columns season, total_sales, sale_count, ordered by total_sales DESC, then season ASC (the name is the tie-breaker)",
    ],
    breakdown: [
      "Season is a cyclic bucket over the month, and no arithmetic shortcut reproduces it across the December wrap. Integer-division bucketing like month/3 groups calendar quarters — it would staple December to the January and February of the SAME year, but a sale on 2024-12-20 belongs with 2025-01-05, a different year entirely. The CASE enumerates the four month-sets explicitly, and the wrap costs nothing because the mapping reads the month alone and never the year. Enumerating a cyclic map is more honest than deriving it.",
      "The month arrives as TEXT, and that typing is a real bug source. strftime('%m', sold_on) returns a zero-padded string — '12', '01', '02' — and comparing TEXT against the integers in IN (12, 1, 2) never matches in SQLite, where INTEGER and TEXT values of different types simply are not equal. Without CAST(... AS INTEGER) every row falls through to the ELSE branch and the whole report collapses into a single 'autumn' row totalling all ten sales. The CAST is one token, and it is the difference between four seasons and one.",
      "Grouping and ordering finish the contract. The tagging CTE turns each sale into (amount, season), GROUP BY season folds ten sales into four groups, and SUM and COUNT ride the groups. The ORDER BY is total_sales DESC, season ASC — the descending money is the headline, and the season name is the deterministic tie-breaker the grader reads literally: this seed deliberately ties spring and winter at 700, and only the name puts spring first. Leaving the tie to the engine would let the report order flip between runs and machines.",
    ],
    edges: [
      "Sales 1 and 2 (450 on 2024-12-20, 250 on 2025-01-05) are a year apart and one winter: a quarter-style month/3 bucket or any year-aware grouping splits them into different rows and misstates both.",
      "Drop the CAST and strftime's TEXT months match none of the integer IN-lists: all ten sales fall into ELSE 'autumn' and the report becomes one row — autumn, 2730, 10.",
      "Spring (300 + 250 + 150) and winter (450 + 250) tie at exactly 700: ORDER BY total_sales DESC alone leaves their relative order to the engine; the season ASC tail pins spring above winter.",
      "Summer's single sale (900 on 2025-07-08) forms a complete group — total 900, count 1 — and needs no special case; it also tops the report because a one-sale season can out-earn a four-sale one.",
    ],
    ladder: [
      { title: "Brute force — bucket in application code", body: "Pull all sales, map each sold_on to a season with hand-rolled month logic, and accumulate sums and counts per bucket. The CASE plus GROUP BY expresses the identical walk in one statement." },
      { title: "The pattern — CASE-tagged CTE, then group", body: "CAST(strftime('%m', sold_on) AS INTEGER) feeds an explicit four-way CASE; the tagged rows GROUP BY season and aggregate." },
      { title: "The optimal idea — enumerate cyclic buckets, cast the text", body: "O(n). The durable rules: cyclic maps that wrap the year-end are enumerated, never derived by division; and strftime returns TEXT, so the comparison needs the CAST or every row falls into ELSE." },
    ],
    approach: "CAST(strftime('%m') AS INTEGER) into a CASE season in a CTE, GROUP BY season, ORDER BY total_sales DESC, season ASC",
    schema: {
      ddl: `CREATE TABLE SaleRecord (
  sale_id    INTEGER PRIMARY KEY,
  product_id INTEGER NOT NULL,
  amount     INTEGER NOT NULL,
  sold_on    TEXT NOT NULL  -- 'YYYY-MM-DD'
);`,
      seed: `-- winter 450+250=700 (Dec of Y1 AND Jan of Y2) · spring 700 (the tie) ·
-- summer 900 on one sale · autumn 100+120+130+80=430
INSERT INTO SaleRecord (sale_id, product_id, amount, sold_on) VALUES
  (1, 7, 450, '2024-12-20'),  -- December of Y1: winter
  (2, 3, 250, '2025-01-05'),  -- January of Y2: winter again — the wrap
  (3, 9, 300, '2025-03-10'),
  (4, 1, 250, '2025-04-15'),  -- spring totals 300 + 250 + 150 = 700
  (5, 4, 150, '2025-05-02'),
  (6, 8, 900, '2025-07-08'),  -- summer's ONLY sale
  (7, 2, 100, '2025-09-01'),
  (8, 6, 120, '2025-10-10'),  -- autumn totals 100 + 120 + 130 + 80 = 430
  (9, 5, 130, '2025-11-05'),
  (10, 2, 80, '2025-11-28');`,
      tables: [
        { name: "SaleRecord", note: "10 sales from 2024-12-20 to 2025-11-28 — winter straddles the year boundary, summer holds a single sale" },
      ],
    },
    code: `WITH tagged AS (
    SELECT
        amount,
        CASE
            WHEN CAST(strftime('%m', sold_on) AS INTEGER) IN (12, 1, 2) THEN 'winter'
            WHEN CAST(strftime('%m', sold_on) AS INTEGER) IN (3, 4, 5)  THEN 'spring'
            WHEN CAST(strftime('%m', sold_on) AS INTEGER) IN (6, 7, 8)  THEN 'summer'
            ELSE 'autumn'                        -- months 9, 10, 11 fall through
        END AS season
    FROM SaleRecord
)
SELECT
    season,
    SUM(amount) AS total_sales,
    COUNT(*)    AS sale_count
FROM tagged
GROUP BY season
ORDER BY total_sales DESC, season ASC;           -- the name breaks the 700 tie`,
    walkthrough: [
      "The CASE tags each sale: sales 1 and 2 (450, 250) land in winter across the year wrap; sales 3, 4 and 5 sum spring's 700; sale 6 is summer's lone 900; sales 7 through 10 sum autumn's 430.",
      "GROUP BY season folds the ten tagged rows into four groups carrying SUM(amount) and COUNT(*): winter 700/2, spring 700/3, summer 900/1, autumn 430/4.",
      "ORDER BY total_sales DESC, season ASC ships summer 900, then the 700 tie resolved by name — spring before winter — then autumn 430; without the CAST the whole report would have collapsed into one autumn row.",
    ],
    time: "O(n) — one tagging scan plus a grouped pass",
    space: "O(1) beyond the four season groups",
    followUps: [
      "Report all four seasons even when a season has no sales — where does a seasons dimension (a VALUES list or recursive CTE) join in, and which aggregate keeps a missing season at 0 instead of NULL?",
      "Add each season's share of total revenue beside its total — where does the grand total come from (a window over the groups or a scalar subquery), and does the wrap across years change what the denominator means?",
    ],
    related: ["monthly-transactions-i", "top-travellers", "find-total-time-spent-by-each-employee"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "odd-and-even-transactions",
    statement:
      "Payment records one row per transaction: (tx_id, amount). Report exactly two rows, one per parity class of the transaction ID: the columns parity ('even' or 'odd'), total_amount (the SUM of amounts whose tx_id has that parity) and tx_count. The classification reads tx_id — never amount. Order the two rows by parity ascending, which is alphabetical: 'even' sorts before 'odd'.",
    examples: [
      {
        input: "transactions 2, 4 and 6 carry amounts 101, 140 and 62",
        output: "even · 303 · 3",
        explanation:
          "Parity follows tx_id: transaction 2's amount is odd but its id is even, so all three amounts sum into the even-id class.",
      },
      {
        input: "transactions 1, 3 and 5 carry amounts 200, 55 and 75",
        output: "odd · 330 · 3",
        explanation:
          "Transaction 1's even amount 200 stays in the odd-id bucket — the report reads ids, and the odd class edges the even one 330 to 303.",
      },
    ],
    constraints: [
      "exactly two rows — one per tx_id parity class; the amount's own parity is irrelevant to the classification",
      "total_amount is the SUM of amount within the class; tx_count is its number of transactions",
      "columns parity, total_amount, tx_count, ordered by parity ASC — alphabetical by design: 'even' precedes 'odd'",
    ],
    breakdown: [
      "The classification is on the transaction ID, and the seed weaponizes the difference: amount parity runs OPPOSITE to id parity on the first two rows. Transaction 2 carries an odd amount (101) on an even id, and transaction 1 an even amount (200) on an odd id — a CASE on amount % 2 buckets both wrongly and reports totals of 402 and 231 where the truth is 303 and 330. The engine shape is CASE WHEN tx_id % 2 = 0 THEN 'even' ELSE 'odd' END — the % operator on the identifier. Read the column the statement names, tx_id, not the one that looks more interesting.",
      "Exactly two rows must come out, one per parity class, which makes this a GROUP BY over a derived dimension. The tagging CTE stamps each payment with its parity label, and GROUP BY parity folds six payments into two groups carrying SUM(amount) and COUNT(*). Grouping by the raw expression tx_id % 2 would emit numeric keys 0 and 1 with no labels, and grouping by tx_id would emit six rows — the derived label IS the grouping key. Aggregates then ride the two groups.",
      "The ordering decision needs stating because it looks arbitrary and it is graded literally: ORDER BY parity ASC ships 'even' first purely because 'even' < 'odd' alphabetically. The intuitive impulse — odd ids start at 1, so odd goes first — flips the two rows and fails an exact-order grade. Declaring the alphabetical contract in the query is how the intent survives review. Determinism here is chosen, not discovered.",
    ],
    edges: [
      "Transaction 2 (even id, odd amount 101) is the planted trap: a CASE on amount % 2 misfiles it and reads even 402 / odd 231, where the id-parity buckets read even 303 / odd 330.",
      "The output order is alphabetical by design: 'even' < 'odd', so ORDER BY parity ASC ships even first — an 'odd ids come first' instinct (or a DESC) flips the rows and fails the contract.",
      "Grouping by tx_id % 2 alone emits keys 0 and 1 without the 'even'/'odd' labels the output demands — the CASE label must feed the GROUP BY through the tagging CTE, not decorate the output afterwards.",
      "Six interleaved ids (1 through 6) put exactly 3 transactions in each class: only the totals separate the rows, 330 vs 303 — a seed with equal totals would look symmetric even under the wrong query.",
    ],
    ladder: [
      { title: "Brute force — two hand totals", body: "Split the payments into odd-id and even-id piles, sum and count each. Two sums, two counts — the engine does it with one CASE and one GROUP BY." },
      { title: "The pattern — tag the id parity, group the label", body: "A tagging CTE stamps CASE WHEN tx_id % 2 = 0 THEN 'even' ELSE 'odd' END; GROUP BY parity produces exactly the two labeled groups." },
      { title: "The optimal idea — group the derived dimension, declare the sort", body: "O(n). The durable judgment: when a report's rows are classes of an existing column, derive the label in a projection and group by IT; and when the required order looks arbitrary (alphabetical parity), state it in the query so the contract survives review." },
    ],
    approach: "CASE tx_id % 2 = 0 then 'even' else 'odd' in a tagging CTE, GROUP BY parity, ORDER BY parity ASC (alphabetical)",
    schema: {
      ddl: `CREATE TABLE Payment (
  tx_id  INTEGER PRIMARY KEY,
  amount INTEGER NOT NULL
);`,
      seed: `-- odd-id bucket: 200 + 55 + 75 = 330 · even-id bucket: 101 + 140 + 62 = 303
INSERT INTO Payment (tx_id, amount) VALUES
  (1, 200),  -- odd id, EVEN amount: the classification trap
  (2, 101),  -- even id, ODD amount
  (3, 55),
  (4, 140),
  (5, 75),
  (6, 62);`,
      tables: [
        { name: "Payment", note: "6 transactions with ids 1..6 interleaved — amount parity runs opposite to id parity on tx 1 and tx 2" },
      ],
    },
    code: `WITH tagged AS (
    SELECT
        amount,
        CASE WHEN tx_id % 2 = 0 THEN 'even' ELSE 'odd' END AS parity  -- ID parity, never amount
    FROM Payment
)
SELECT
    parity,
    SUM(amount) AS total_amount,
    COUNT(*)    AS tx_count
FROM tagged
GROUP BY parity
ORDER BY parity ASC;     -- alphabetical by design: 'even' sorts before 'odd'`,
    walkthrough: [
      "The CASE stamps each payment by ID parity: ids 1, 3 and 5 go to 'odd'; ids 2, 4 and 6 go to 'even' — transaction 2's odd amount 101 changes nothing about its bucket.",
      "GROUP BY parity folds six payments into two groups: odd sums 200 + 55 + 75 = 330 over 3 transactions; even sums 101 + 140 + 62 = 303 over 3.",
      "ORDER BY parity ASC ships 'even' (303, 3) before 'odd' (330, 3) — alphabetical by design — while the amount-parity misread would have printed 402 and 231.",
    ],
    time: "O(n) — one tagging scan plus a two-group fold",
    space: "O(1) beyond the two parity groups",
    followUps: [
      "Build the 2x2 grid of id parity against amount parity — how does a second CASE column extend the grouping, and which cell does transaction 2 land in?",
      "Bucket by last digit (tx_id % 10) into ten labeled classes — what happens to classes with no payments, and how would a digit-dimension table keep them at zero?",
    ],
    related: ["find-followers-count", "monthly-transactions-i", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-drivers-with-improved-fuel-efficiency",
    statement:
      "FuelLog tracks fuel efficiency as one row per fill-up: (log_id, driver_id, km_per_liter). The log_id is chronological — a driver's first log is their LOWEST log_id and their latest log is their HIGHEST, whatever order the rows appear in. Report every driver whose latest log's km_per_liter is strictly greater than their first log's: the columns driver_id, first_efficiency, latest_efficiency, and gain = ROUND(latest_efficiency - first_efficiency, 2). Drivers with a single log have no comparison and never appear. Order by driver_id ascending.",
    examples: [
      {
        input: "driver 11 logged 7.5 on log 1 and 8.0 on log 3",
        output: "11 · 7.5 · 8.0 · 0.5",
        explanation:
          "The latest log (highest log_id) beats the first log (lowest log_id) strictly; the gain rounds to two decimals.",
      },
      {
        input: "driver 15's log 9 reads 8.0 and log 4 reads 8.5 — and the log 9 row was inserted into the table first",
        output: "(no row)",
        explanation:
          "log_id is the clock, not insertion order: the first log is log 4 (8.5) and the latest is log 9 (8.0), so the driver declined — a query trusting insertion order or MIN/MAX of the metrics would wrongly report a 0.5 gain.",
      },
    ],
    constraints: [
      "first_efficiency and latest_efficiency are the km_per_liter values at the driver's LOWEST and HIGHEST log_id — log_id is the clock, not row position in the table",
      "a driver reports only with at least two logs AND latest strictly greater than first — single-log drivers and equal-first-latest drivers never appear",
      "columns driver_id, first_efficiency, latest_efficiency, gain with gain = ROUND(latest - first, 2), ordered by driver_id ASC",
    ],
    breakdown: [
      "First and latest are positions on a timeline, and the timeline is log_id: the first log is the LOWEST log_id and the latest the HIGHEST, regardless of the order rows appear in the table or the seed file. Driver 15's rows are inserted out of order — log 9 (8.0) enters before log 4 (8.5) — so anything that trusts arrival order, or takes MIN and MAX of the METRIC, reads 8.0 then 8.5 and reports a 0.5 improvement the log_id timeline denies: the true first is log 4 (8.5) and the true latest is log 9 (8.0), a decline. ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY log_id) with rn = 1, and its DESC twin, find the boundary rows honestly. The measure is not the clock — never aggregate the quantity to find a position.",
      "The pivot collapses each driver's two boundary rows into one: MAX(CASE WHEN rn_first = 1 THEN km_per_liter END) picks the first log's value, the rn_last twin picks the latest, and GROUP BY driver_id assembles one row per driver. A single-log driver like 14 gets rn_first = rn_last = 1 on the same row, so first and latest coincide at 9.3 and the strict comparison in the outer WHERE removes them naturally — no COUNT filter is required. Driver 13's two logs are exactly equal (8.4 and 8.4), and 'equal is not improved' is enforced by the same strict latest > first. One predicate handles the flat case and the single-log case alike.",
      "The gain column is where binary floating point shows its seams. 9.1 is not representable exactly, so driver 12's raw subtraction is 0.09999999999999964, and an unrounded gain column ships that noise to the report. ROUND(latest - first, 2) is applied to the DERIVED gain only: rounding the stored efficiencies before comparing could flip borderline cases — two values within half a hundredth would compare equal after rounding — while the raw comparison stays honest. Round the arithmetic result, never the evidence.",
    ],
    edges: [
      "Driver 15's log 9 (8.0) is inserted BEFORE log 4 (8.5): an insertion-order read or a MIN/MAX-of-metric read reports first 8.0, latest 8.5, gain 0.5 and wrongly includes the driver — the log_id rule reads 8.5 then 8.0, a decline, and excludes it.",
      "Driver 13's logs are exactly equal (8.4 on logs 6 and 8): a >= or 'not less' comparison admits the driver with gain 0.0 — strict > is what 'equal is not improved' means in SQL.",
      "Driver 14's single log (9.3 on log 7) makes rn_first and rn_last the same row: first = latest = 9.3 and the strict comparison drops them without a COUNT-based filter.",
      "Driver 12's raw gain is 9.1 - 9.0 = 0.09999999999999964: without ROUND on the gain column the report prints binary noise; ROUND(..., 2) restores 0.1.",
    ],
    ladder: [
      { title: "Brute force — sort and read end rows", body: "For each driver, sort their logs by log_id, read the first and last rows, compare, and keep the improvers. A per-group top-and-bottom read the engine expresses as two window rankings." },
      { title: "The pattern — two ROW_NUMBERs, pivoted", body: "ROW_NUMBER over (driver ORDER BY log_id ASC) = 1 finds first, the DESC twin finds latest; MAX(CASE WHEN rn = 1 ...) pivots both into one row per driver." },
      { title: "The optimal idea — position is a ranking, not an aggregate", body: "O(n log n) over the two window sorts. The durable rule: 'the value at the boundary of a group' is a ranking question — MIN/MAX over the measured quantity finds extremes, not endpoints, and out-of-order metrics like driver 15's manufacture fake trends." },
    ],
    approach: "ROW_NUMBER = 1 pivots over log_id ASC/DESC per driver, strict latest > first, ROUND the gain only",
    schema: {
      ddl: `CREATE TABLE FuelLog (
  log_id       INTEGER PRIMARY KEY,  -- chronological: first = lowest, latest = highest
  driver_id    INTEGER NOT NULL,
  km_per_liter REAL NOT NULL
);`,
      seed: `-- driver 11 improves 0.5 · driver 12 improves exactly 0.1 · 13 flat · 14 single ·
-- 15 declines once read by log_id (inserted out of order on purpose)
INSERT INTO FuelLog (log_id, driver_id, km_per_liter) VALUES
  (1, 11, 7.5),
  (2, 12, 9.0),
  (3, 11, 8.0),
  (9, 15, 8.0),  -- inserted EARLY but log_id 9: driver 15's true LATEST log
  (5, 12, 9.1),
  (6, 13, 8.4),
  (7, 14, 9.3),  -- driver 14's only log: no comparison exists
  (8, 13, 8.4),  -- equals log 6: flat, not improved
  -- inserted LAST but log_id 4: driver 15's true FIRST log (8.5)
  (4, 15, 8.5);`,
      tables: [
        { name: "FuelLog", note: "9 logs over 5 drivers — driver 14 logs once, driver 15's rows are inserted out of log_id order" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        driver_id,
        km_per_liter,
        ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY log_id ASC)  AS rn_first,
        ROW_NUMBER() OVER (PARTITION BY driver_id ORDER BY log_id DESC) AS rn_last
    FROM FuelLog
),
bounds AS (
    SELECT
        driver_id,
        MAX(CASE WHEN rn_first = 1 THEN km_per_liter END) AS first_efficiency,  -- lowest log_id
        MAX(CASE WHEN rn_last  = 1 THEN km_per_liter END) AS latest_efficiency  -- highest log_id
    FROM ranked
    GROUP BY driver_id
)
SELECT
    driver_id,
    first_efficiency,
    latest_efficiency,
    ROUND(latest_efficiency - first_efficiency, 2) AS gain   -- round the GAIN, not the inputs
FROM bounds
WHERE latest_efficiency > first_efficiency        -- strict: equal or lower is not improved
ORDER BY driver_id;`,
    walkthrough: [
      "The two ROW_NUMBERs find each driver's boundary logs: driver 11 first = log 1 (7.5), latest = log 3 (8.0); driver 12 first = log 2 (9.0), latest = log 5 (9.1); driver 15's boundaries are log 4 (8.5) first and log 9 (8.0) latest — NOT the insertion order the seed shows.",
      "The pivot assembles one row per driver, and the strict WHERE latest > first keeps only 11 (8.0 > 7.5) and 12 (9.1 > 9.0): driver 13 is flat at 8.4, driver 14's single log compares against itself, and driver 15 declines 8.5 to 8.0.",
      "The gain rounds the difference only — 0.5 for driver 11, and 0.09999999999999964 corrected to 0.1 for driver 12 — and ORDER BY driver_id ships (11, 7.5, 8.0, 0.5) then (12, 9.0, 9.1, 0.1).",
    ],
    time: "O(n log n) — two window sorts over the log rows",
    space: "O(n) — the ranked rows held until the pivot",
    followUps: [
      "Report every multi-log driver's gain, declines included, labeled with a trend column — which comparison moves from the WHERE into a CASE, and how does the ORDER BY keep the report readable?",
      "Rank improvers by percentage gain over their first log — where does the division sit relative to ROUND, and why must single-log drivers be excluded before, not after, the ranking?",
    ],
    related: ["the-latest-login-in-2020", "game-play-analysis-ii", "find-cumulative-salary-of-an-employee"],
    order: "exact",
    xp: 20,
  },
];
