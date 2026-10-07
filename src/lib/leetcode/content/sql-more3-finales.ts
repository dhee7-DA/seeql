// Deep-dives — the SQL band expansion, batch 4: the hard finales
// (3 problems, all Hard / 35 xp). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_FINALES: LcSqlDive[] = [
  {
    slug: "transactions-per-visit-histogram",
    statement:
      "Visits logs every shopping visit as one (user_id, visit_date) row, and Transactions records each purchase made during a visit, keyed by the same pair. Build the store's histogram of transactions per visit: for every bin from 0 up to the largest number of transactions any single visit produced, report the bin as transactions_count and the number of visits that landed in it as visits_count. Visits that ended with no purchase at all belong in bin 0 — every bin in range must appear, even the empty ones. Output columns: transactions_count, visits_count, ordered by transactions_count ascending.",
    examples: [
      {
        input:
          "Visits: (1,01-01),(1,01-02),(2,01-01),(2,01-02),(3,01-01),(4,01-01),(5,01-01),(6,01-03),(7,01-02) · transactions per visit: (1,01-02)→1, (2,01-02)→3, (4,01-01)→1, (6,01-03)→3, (7,01-02)→1 — all dates 2020",
        output: "(0,4) (1,3) (2,0) (3,2)",
        explanation:
          "Four visits never transacted, three ended with exactly one purchase, two with three — and bin 2 appears with 0 because the histogram fills every bin from 0 up to the max of 3, empty or not.",
      },
      {
        input: "Transactions row (10, user 9, '2020-01-05', 999) — user 9 has no visit on any date",
        output: "unchanged — still (0,4) (1,3) (2,0) (3,2)",
        explanation:
          "The histogram counts VISITS, so a transaction without a matching visit lands in no bin — anchoring the per-visit counts on Visits makes the orphan vanish instead of faking a one-transaction visit.",
      },
    ],
    constraints: [
      "Visits is unique per (user_id, visit_date); Transactions may hold several rows for one visit, and may even hold rows with no matching visit",
      "bins run from 0 up to the largest transactions-per-visit actually observed — every intermediate bin appears, empty ones included",
      "output columns: transactions_count, visits_count, ordered by transactions_count ascending",
    ],
    breakdown: [
      "A histogram is a report about the SHAPE of data, and shape is exactly what GROUP BY cannot invent. Counting transactions per visit the reflex way — FROM Transactions GROUP BY user_id, visit_date — starts from the wrong anchor: a visit with zero transactions has no row in Transactions at all, so it contributes no group, and bin 0 silently vanishes even though it is usually the tallest bar. The fix is a change of anchor: start from Visits and LEFT JOIN Transactions onto it, so every visit keeps its row whether or not a purchase happened, and COUNT(t.transaction_id) lands on 0 for the unmatched ones. COUNT(*) would be a bug here — the null-extended row of a transaction-less visit still counts one.",
      "Even with per-visit counts in hand, the x-axis is still missing: GROUP BY can only emit bins that were OBSERVED, and this seed has no visit with exactly 2 transactions — a plain grouping would report bars 0, 1, 3 and the gap would read as missing data rather than a true zero. So the bins themselves must be materialized as data. A recursive CTE does it in pure SQL: the anchor SELECT 0 seeds the counter, and the recursive step keeps adding one while n + 1 stays within the max count exposed by a one-row aggregate CTE — SQLite requires the WITH RECURSIVE keyword on the whole WITH clause the moment any CTE loops.",
      "The last move inverts the first join: this time the generated bins table is the anchor and the per-visit counts are LEFT JOINed ONTO it on txn_count = n, then GROUP BY n counts matches. The two-sided trick repeats one level higher — bin 2 matches no visit, so the LEFT JOIN null-extends it and COUNT(pv.txn_count) correctly reports 0, because COUNT skips NULLs. Two LEFT JOINs, two rescues: the first rescues visits that an inner join would drop, the second rescues bins that a GROUP BY would drop.",
    ],
    edges: [
      "GROUP BY over Transactions alone can never emit bin 0 — a zero-transaction visit has no row there; anchoring the counts on Visits via LEFT JOIN is what preserves it.",
      "COUNT(t.transaction_id), not COUNT(*), in the per-visit count — the null-extended row of a transaction-less visit would fake a count of 1.",
      "The orphan transaction (user 9, no visit anywhere) must not become a phantom visit — anchoring on Visits makes it vanish; counting from Transactions and back-filling zeros would inflate bin 1 to 4.",
      "Bin 2 exists only via the recursive counter — the seed plants no 2-transaction visit, so a plain GROUP BY would skip it and the histogram would lie by omission.",
    ],
    ladder: [
      {
        title: "Brute force — stitch it in two passes",
        body: "Count transactions from Transactions grouped by (user_id, visit_date), separately list the visits that appear in no transaction, UNION the zeros in, then build the full 0..max axis in application code. Correct, but the histogram's spine lives outside SQL, and every consumer re-implements the fill.",
      },
      {
        title: "The pattern — anchor on Visits",
        body: "Visits LEFT JOIN Transactions, GROUP BY user_id and visit_date, fixes bin 0 at the source — every visit is counted, including the ones with no purchase. The remaining gap is the unobserved bins.",
      },
      {
        title: "The optimal idea — materialize the axis, join onto it",
        body: "A recursive CTE generates every integer 0..max, and LEFT JOIN plus GROUP BY counts how many visits land on each — one query, shape guaranteed, empty bins included. O(V + T) for the counts plus O(max) for the axis.",
      },
    ],
    approach:
      "Anchor per-visit counts on Visits via LEFT JOIN, materialize bins 0..max with a recursive CTE, LEFT JOIN the counts onto the bins",
    schema: {
      ddl: `CREATE TABLE Visits (
  user_id    INTEGER NOT NULL,
  visit_date TEXT NOT NULL,
  PRIMARY KEY (user_id, visit_date)
);
CREATE TABLE Transactions (
  transaction_id INTEGER PRIMARY KEY,
  user_id        INTEGER NOT NULL,
  visit_date     TEXT NOT NULL,
  amount         INTEGER NOT NULL
);`,
      seed: `INSERT INTO Visits (user_id, visit_date) VALUES
  (1,'2020-01-01'),(1,'2020-01-02'),(2,'2020-01-01'),(2,'2020-01-02'),
  (3,'2020-01-01'),(4,'2020-01-01'),(5,'2020-01-01'),
  (6,'2020-01-03'),(7,'2020-01-02');
INSERT INTO Transactions (transaction_id, user_id, visit_date, amount) VALUES
  (1,1,'2020-01-02',55),
  (2,2,'2020-01-02',40),(3,2,'2020-01-02',12),(4,2,'2020-01-02',9),
  (5,4,'2020-01-01',20),
  (6,6,'2020-01-03',300),(7,6,'2020-01-03',25),(8,6,'2020-01-03',5),
  (9,7,'2020-01-02',60),
  (10,9,'2020-01-05',999);`,
      tables: [
        {
          name: "Visits",
          note: "9 visits — 4 with no transaction, 3 with exactly one, 2 with three; NO visit has exactly 2 (bin 2 is zero-fill only)",
        },
        {
          name: "Transactions",
          note: "10 rows — 9 belong to real visits (max 3 on one visit); row 10 is an ORPHAN (user 9, 01-05) with no matching visit",
        },
      ],
    },
    code: `WITH RECURSIVE per_visit AS (
    SELECT
        v.user_id,
        v.visit_date,
        COUNT(t.transaction_id) AS txn_count  -- 0 for visits with no purchase (COUNT(*) would say 1!)
    FROM Visits v
    LEFT JOIN Transactions t
           ON t.user_id = v.user_id
          AND t.visit_date = v.visit_date
    GROUP BY v.user_id, v.visit_date
),
bounds AS (
    SELECT MAX(txn_count) AS hi FROM per_visit -- top bin: max transactions any single visit made
),
bins AS (                                      -- the x-axis, materialized: 0, 1, ... hi
    SELECT 0 AS n
    UNION ALL
    SELECT n + 1 FROM bins, bounds WHERE n + 1 <= hi
)
SELECT
    bins.n AS transactions_count,
    COUNT(pv.txn_count) AS visits_count        -- COUNT skips NULLs → 0 for the empty bin
FROM bins
LEFT JOIN per_visit pv ON pv.txn_count = bins.n
GROUP BY bins.n
ORDER BY bins.n ASC;`,
    walkthrough: [
      "per_visit anchors on Visits and counts through the LEFT JOIN: (1,01-01)=0, (1,01-02)=1, (2,01-01)=0, (2,01-02)=3, (3,01-01)=0, (4,01-01)=1, (5,01-01)=0, (6,01-03)=3, (7,01-02)=1 — the orphan transaction (user 9, 01-05) never enters, because there is no visit for it to extend.",
      "bounds reads MAX(txn_count) = 3 — and since no visit has exactly 2 transactions, that bin must be invented: the recursive counter emits bins 0, 1, 2, 3.",
      "LEFT JOIN counts onto the bins: bin 0 catches 4 visits, bin 1 catches 3, bin 2 matches nothing so COUNT(pv.txn_count) reports 0, bin 3 catches 2 — final rows (0,4), (1,3), (2,0), (3,2) in bin order.",
    ],
    time: "O(V + T + M) — one join pass for the per-visit counts, plus the M+1 generated bins joined linearly (V visits, T transactions, M = max bin)",
    space: "O(V + M) — the per-visit counts and the generated bin axis",
    followUps: [
      "Bucket by spend instead of count: SUM(amount) per visit dropped into fixed-width amount bins — the same bins-table anchor, a different measure.",
      "Turn the histogram into a CDF: SUM(visits_count) OVER (ORDER BY transactions_count) adds a cumulative column without breaking the shape.",
    ],
    related: ["create-a-session-bar-chart", "biggest-single-number", "challenges"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "countries-you-can-safely-invest-in",
    statement:
      "Country lists the markets a global fund is watching, Person pins each user to a country, and Calls logs phone calls with their duration in minutes. A call touches a country when at least one of its two participants lives there — and a call whose caller and callee both live in the same country still touches that country only ONCE. A personal call is one whose caller and callee live in the same country. The fund calls a country safe when the average duration of the calls it touches is strictly below the global average duration of personal calls. Report every safe country's name, ordered by country name.",
    examples: [
      {
        input:
          "Personal calls: Aurora 60, Basilia 125, Corvina 240 → baseline (60+125+240)/3 ≈ 141.67 · cross calls: Aurora–Basilia 130, Aurora–Corvina 110, Basilia–Corvina 170",
        output: "('Aurora')",
        explanation:
          "Aurora touches 60, 130, 110 → 100.00, strictly below 141.67; Corvina touches 240, 110, 170 → 173.33, above it.",
      },
      {
        input: "Basilia — its own same-country call 125, plus cross calls 130 and 170",
        output: "absent from the result",
        explanation:
          "Touched ONCE, Basilia averages (125+130+170)/3 = 141.67 — exactly the rounded baseline, and strictly-below rejects ties. Counting the both-ends call twice would fake (125+125+130+170)/4 = 137.50 and wrongly qualify it.",
      },
    ],
    constraints: [
      "a call counts once per country even when both participants live there",
      "the baseline is one global number: the average duration over ALL personal calls in Calls, regardless of country",
      "output column: country_name, alphabetical; safe means strictly below — a country exactly on the baseline does not qualify",
    ],
    breakdown: [
      "A call's country story is told by TWO people, so Person must be joined twice — once on caller_id, once on callee_id — each alias answering one side of the call. From the annotated rows, the 'touched' relation falls out by exploding every call into its two (country, duration) sides and UNIONing them. UNION — not UNION ALL — is the dedup: the both-ends call (Basilia's 125) produces two byte-identical rows, and set semantics collapse them into one, which is precisely the 'counts once per country' rule expressed as data.",
      "The comparison mixes two different populations, and the classic blunder is conflating them: a country's average is AVG over ITS touched calls, while the baseline is the average over the world's PERSONAL calls — a different filter on the same table, not a ratio of shared sums. The baseline is one global number, so it belongs in a scalar subquery, never inside the GROUP BY; every country then compares against the same cell. The seed makes the populations visibly different: the personal set is 60, 125, 240 → 141.67, while no single country's touched set looks anything like that list.",
      "AVG of integers lands on repeating decimals — the baseline here is 425/3 = 141.666…, and full-precision float comparisons across different denominators are how boundary bugs are born. The contract implemented here: ROUND(x, 2) on BOTH sides, then a strict <. Both sides is the non-negotiable part — the famous wrong answer rounds only the country average and compares it against an unrounded baseline, an apples-to-oranges asymmetry that flips countries near the boundary; and strict is what excludes Basilia, whose touched average (125 once — deduped — plus 130 and 170) lands on exactly 141.67, a 2dp tie with the baseline that is NOT below it.",
    ],
    edges: [
      "UNION, not UNION ALL, between the caller-side and callee-side rows — it is what dedups Basilia's both-ends call 125; with UNION ALL her average would fake 137.50 and wrongly clear the bar.",
      "The UNION dedups whole (country, duration) rows — safe here because all six durations are distinct; with colliding duplicates the dedup must move into the structure (emit the callee side only for cross-country calls).",
      "ROUND both sides to 2 BEFORE comparing — rounding only the country side against an unrounded baseline is the classic boundary-flipping bug; symmetric rounding is the deterministic contract.",
      "Strict <: Basilia lands exactly on the rounded baseline (141.67 vs 141.67) and must be rejected — a tie is not 'strictly below'.",
    ],
    ladder: [
      {
        title: "Brute force — per-country passes",
        body: "For each country, scan Calls, look up both participants, build its touched-call list by hand (remembering to skip the duplicate end of same-country calls), compute the personal baseline once, compare. Correct, but one pass per country and the dedup rule lives in host code.",
      },
      {
        title: "The pattern — two aliases, then explode-and-UNION",
        body: "Join Person twice to annotate every call with both countries; explode caller-side and callee-side rows and UNION them so each call touches each of its countries exactly once; GROUP BY country for the averages.",
      },
      {
        title: "The optimal idea — aggregate, round, compare against a scalar",
        body: "One pass builds the touched relation, one GROUP BY averages per country, one scalar subquery holds the global personal baseline; ROUND both sides at the comparison point. O(C) for the joins plus a GROUP BY.",
      },
    ],
    approach:
      "Two Person aliases annotate each call, UNION explodes-and-dedups the touched relation, ROUND(country avg, 2) < ROUND(personal avg, 2) via a scalar subquery",
    schema: {
      ddl: `CREATE TABLE Country (
  id           INTEGER PRIMARY KEY,
  country_name TEXT NOT NULL
);
CREATE TABLE Person (
  id           INTEGER PRIMARY KEY,
  name         TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  country_id   INTEGER NOT NULL
);
CREATE TABLE Calls (
  caller_id INTEGER NOT NULL,
  callee_id INTEGER NOT NULL,
  duration  INTEGER NOT NULL
);`,
      seed: `INSERT INTO Country (id, country_name) VALUES
  (1,'Aurora'),(2,'Basilia'),(3,'Corvina');
INSERT INTO Person (id, name, phone_number, country_id) VALUES
  (1,'Alice','650-051-1001',1),(2,'Boris','650-051-1002',1),
  (3,'Celine','650-051-1003',2),(4,'Diego','650-051-1004',2),
  (5,'Ema','650-051-1005',3),(6,'Farid','650-051-1006',3),
  (7,'Gia','650-051-1007',1);
INSERT INTO Calls (caller_id, callee_id, duration) VALUES
  (1,2,60),    -- Aurora/Aurora: the BOTH-ENDS call — touches Aurora once, and is personal
  (3,4,125),   -- Basilia/Basilia: personal
  (5,6,240),   -- Corvina/Corvina: personal
  (1,3,130),   -- Aurora/Basilia
  (2,5,110),   -- Aurora/Corvina
  (4,6,170);   -- Basilia/Corvina`,
      tables: [
        { name: "Country", note: "3 markets: Aurora, Basilia, Corvina" },
        { name: "Person", note: "7 users — 2-3 per country; Gia lives in Aurora and never calls" },
        {
          name: "Calls",
          note: "6 calls: same-country 60/125/240 (the personal set → baseline 141.67) + cross-country 130/110/170; Basilia's 125 is the BOTH-ENDS dedup trap",
        },
      ],
    },
    code: `WITH calls_x AS (                 -- every call, annotated with BOTH participants' countries
    SELECT
        pc.country_id AS caller_country,
        pe.country_id AS callee_country,
        c.duration
    FROM Calls c
    JOIN Person pc ON pc.id = c.caller_id  -- alias 1: the caller's side
    JOIN Person pe ON pe.id = c.callee_id  -- alias 2: the callee's side
),
touched AS (                      -- one row per (call side, country): UNION eats the duplicate
    SELECT caller_country AS country_id, duration FROM calls_x
    UNION                          -- dedups the both-ends call (identical rows collapse)
    SELECT callee_country, duration FROM calls_x
),
country_avg AS (
    SELECT country_id, ROUND(AVG(duration), 2) AS avg_d  -- grade at 2dp
    FROM touched
    GROUP BY country_id
)
SELECT co.country_name
FROM country_avg ca
JOIN Country co ON co.id = ca.country_id
WHERE ca.avg_d < (                -- the global personal-call baseline: one scalar cell
    SELECT ROUND(AVG(duration), 2)
    FROM calls_x
    WHERE caller_country = callee_country
)
ORDER BY co.country_name;`,
    walkthrough: [
      "calls_x annotates the six calls with both countries: (1,1,60),(2,2,125),(3,3,240),(1,2,130),(1,3,110),(2,3,170). The personal set is the three same-country calls 60+125+240 = 425, so the baseline is ROUND(425/3, 2) = 141.67.",
      "touched explodes each call to its two sides and UNION collapses the identical both-ends rows: Aurora holds 60, 130, 110 → 100.00; Basilia holds 125 (ONCE — double-counted it would fake (125+125+130+170)/4 = 137.50), 130, 170 → 141.67; Corvina holds 240, 110, 170 → 173.33.",
      "The strict 2dp comparison keeps only 100.00 < 141.67: Aurora. Basilia's 141.67 ties the baseline and is rejected, Corvina's 173.33 is above — the report is the single row ('Aurora').",
    ],
    time: "O(C log C) — two joins to annotate, a set-dedup over the exploded sides, one GROUP BY",
    space: "O(C) — the annotated calls and the touched relation",
    followUps: [
      "Report each country's touched-call average side by side with the baseline — CROSS JOIN the one-row baseline so the global number rides on every row.",
      "Flip the fund's appetite to countries strictly ABOVE the baseline — then check whether rounding only the country side (the asymmetric bug) changes the survivor list on this seed.",
    ],
    related: [
      "investments-in-2016",
      "average-salary-of-departments",
      "customers-who-bought-a-and-b-not-c",
    ],
    order: "exact",
    xp: 35,
  },
  {
    slug: "count-salary-categories",
    statement:
      "Accounts holds one row per bank account with its yearly income. Bucket every account: 'Low Salary' for income strictly below 20000, 'High Salary' for income strictly above 50000, and 'Average Salary' for everything in between, boundaries included — 20000 and 50000 themselves are Average. The report must always show exactly three rows, one per category in the order Low, Average, High, with accounts_count as the number of accounts in that bucket — and a category with zero accounts still gets its row, counting 0.",
    examples: [
      {
        input:
          "Accounts: (1,Alice,15000),(2,Bob,28500),(3,Carol,20000),(4,Dave,50000),(5,Eve,12500),(6,Frank,45000)",
        output: "('Low Salary',2) ('Average Salary',4) ('High Salary',0)",
        explanation:
          "Carol's 20000 and Dave's 50000 sit exactly on the boundaries and both belong to Average; nobody earns above 50000, so High still reports its zero row.",
      },
      {
        input: "an empty Accounts table",
        output: "('Low Salary',0) ('Average Salary',0) ('High Salary',0)",
        explanation:
          "Each labeled aggregate over zero rows returns one row with count 0 — the report's shape does not depend on the data.",
      },
    ],
    constraints: [
      "Low Salary: income < 20000 · Average Salary: 20000 <= income <= 50000 · High Salary: income > 50000 — the boundaries belong to Average",
      "the report always has exactly three rows, Low then Average then High, even for empty buckets",
      "output columns: category, accounts_count",
    ],
    breakdown: [
      "GROUP BY can only emit a row for a bucket that at least one row landed in — it manufactures keys from observations, never from the report's contract. CASE-bucketing the income and grouping by it is the reflex answer, and on most seeds it works; on this one it fails quietly: nobody earns above 50000, so the High Salary bucket has no row to group and the report shrinks to two bars, looking like a chart bug rather than a query bug. A report is a contract about its SHAPE — here, always exactly three rows — and shape guarantees need shape-guaranteeing constructs.",
      "The always-full-report pattern: three independent aggregates, each filtered by its own predicate and stamped with a literal label — SELECT 'Low Salary', COUNT(*) FROM Accounts WHERE income < 20000, and likewise for the other two. An aggregate without GROUP BY over an empty set still returns exactly one row (COUNT(*) = 0, never NULL, never absent), so each branch is a one-row guarantee, and UNION ALL stacks the three guarantees into a permanently three-row report. The three predicates must tile the income line with no gap and no overlap — 20000 belongs to Average via >=, 50000 stays in Average via <= — which is why both boundary values are planted in the seed.",
      "UNION ALL promises no particular order, and the custom Low → Average → High order is not alphabetical — ORDER BY 1 would hand back Average, High, Low. A compound SELECT's trailing ORDER BY is the engine's most restricted spot (output position or output name), so the robust shape wraps the UNION ALL in a subquery and lets the outer plain SELECT order with the full expression grammar: ORDER BY CASE category WHEN 'Low Salary' THEN 1 … END. Wrapping is the general escape hatch whenever a compound query needs expressive ORDER BY — and it costs nothing.",
    ],
    edges: [
      "GROUP BY CASE drops empty buckets — with no account above 50000 it emits two rows and the report quietly lies; the three labeled aggregates make the 3-row shape structural.",
      "Boundary exclusivity: exactly-20000 must not leak into Low and exactly-50000 must not leak into High — the predicates tile the line, and Carol and Dave are the planted proof.",
      "COUNT(*) over zero rows is 0 — an aggregate without GROUP BY always returns exactly one row, never NULL and never absent; that is the whole guarantee.",
      "The trailing ORDER BY of a compound SELECT is restricted territory — the wrapped subquery gives the outer plain SELECT full expression power for the custom CASE order.",
    ],
    ladder: [
      {
        title: "Brute force — three queries, stitched in code",
        body: "Run COUNT(*) three times with three WHEREs in the host language and assemble the report there. Three round trips, and the fixed Low → Average → High order lives outside SQL.",
      },
      {
        title: "The pattern — GROUP BY CASE",
        body: "CASE income into the three labels and GROUP BY it: one scan, one tidy query — but empty buckets silently drop, the zero-row trap this seed is built to expose.",
      },
      {
        title: "The optimal idea — three labeled scalar aggregates, UNION ALL",
        body: "Each branch is a one-row guarantee (literal label plus count, 0 when empty), so the report's shape is structural, not data-dependent; wrap the compound and CASE-order it Low → Average → High. O(n) — three predicate scans.",
      },
    ],
    approach:
      "Three literal-labeled COUNT aggregates UNION ALLed into a guaranteed 3-row report, wrapped and CASE-ordered Low → Average → High",
    schema: {
      ddl: `CREATE TABLE Accounts (
  id     INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  income INTEGER NOT NULL
);`,
      seed: `INSERT INTO Accounts (id, name, income) VALUES
  (1,'Alice',15000),   -- Low
  (2,'Bob',28500),     -- Average (interior)
  (3,'Carol',20000),   -- Average: exactly ON the low boundary, NOT Low
  (4,'Dave',50000),    -- Average: exactly ON the high boundary, NOT High
  (5,'Eve',12500),     -- Low
  (6,'Frank',45000);   -- Average — and nobody above 50000: High is the planted EMPTY bucket`,
      tables: [
        {
          name: "Accounts",
          note: "6 accounts — Low 2 (15000, 12500), Average 4 incl. BOTH boundaries 20000 and 50000, High 0 (nobody above 50000: the planted empty bucket)",
        },
      ],
    },
    code: `SELECT category, accounts_count
FROM (
    SELECT 'Low Salary' AS category, COUNT(*) AS accounts_count
    FROM Accounts
    WHERE income < 20000                    -- strictly below: 20000 itself is NOT low
    UNION ALL
    SELECT 'Average Salary', COUNT(*)
    FROM Accounts
    WHERE income >= 20000 AND income <= 50000  -- BOTH boundaries live here
    UNION ALL
    SELECT 'High Salary', COUNT(*)
    FROM Accounts
    WHERE income > 50000                    -- strictly above: 50000 itself is NOT high
)
ORDER BY CASE category WHEN 'Low Salary'     THEN 1
                       WHEN 'Average Salary' THEN 2
                       ELSE 3 END;`,
    walkthrough: [
      "The three predicates split the seed: < 20000 catches Alice 15000 and Eve 12500 → Low 2; >= 20000 AND <= 50000 catches Bob 28500, Carol 20000 (exactly on the seam — Average, not Low), Dave 50000 (exactly on the other seam — Average, not High), Frank 45000 → Average 4; > 50000 catches nobody → High 0.",
      "Each branch is an aggregate without GROUP BY: even High's zero matches return one row ('High Salary', 0) — the shape survives the empty bucket that GROUP BY CASE would have dropped.",
      "UNION ALL stacks ('Low Salary',2),('Average Salary',4),('High Salary',0) and the wrapped ORDER BY CASE sorts them Low(1) → Average(2) → High(3) — ORDER BY 1 would have returned alphabetical Average, High, Low instead.",
    ],
    time: "O(n) — three predicate scans over Accounts (one pass each)",
    space: "O(1) — three scalar aggregates and a fixed 3-row report",
    followUps: [
      "Parameterize the boundaries with :low and :high bindings — work out which literals move in which predicate and confirm the tiling still has no gap and no overlap.",
      "Add each category's share of the portfolio: wrap once more and compute accounts_count * 100.0 / SUM(accounts_count) OVER () per row.",
    ],
    related: ["create-a-session-bar-chart", "biggest-single-number", "second-highest-salary"],
    order: "exact",
    xp: 35,
  },
];
