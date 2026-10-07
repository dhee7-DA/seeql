// Deep-dives — SQL band expansion batch 4: the MATCHUPS angle (5 problems:
// two-leg aggregation over fixtures, same-key totals pairing, per-group
// argmax with a name tiebreak, conditional-aggregation month gates, and the
// wide pivot). Engine-verified by scripts/lc-sql-verify.ts; self-checked via
// bun:sqlite at authoring time.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_MATCHUPS: LcSqlDive[] = [
  {
    slug: "team-scores-in-football-tournament",
    statement:
      "A football league keeps Teams(team_id, team_name) and Matches(host_team, guest_team, host_goals, guest_goals) — every fixture is played once, and the host is simply the team listed first. Scoring is standard: a win pays 3 points, a draw pays 1 point to BOTH teams, a loss pays nothing. Build the league table: every team's total across all its matches, home and away alike. Return team_id, team_name, num_points, most points first, ties broken by team name in ascending order.",
    examples: [
      {
        input: "Teams: (1,'Auckland'), (2,'Basel') · Matches: (1, 2, 3, 0) — Auckland hosts Basel, 3-0",
        output: "1 Auckland · 3 / 2 Basel · 0",
        explanation:
          "Auckland wins as host → 3 points. Basel's side of the same fixture is a loss → nothing. One match, but two teams' results.",
      },
      {
        input: "Teams: (1,'Auckland'), (2,'Basel') · Matches: (2, 1, 1, 1) — Basel hosts Auckland, 1-1",
        output: "1 Auckland · 1 / 2 Basel · 1",
        explanation:
          "A draw pays both sides one point — the mirrored perspectives of the same row each score 1, never 0.",
      },
    ],
    constraints: [
      "points per match: win 3, draw 1 (both teams), loss 0",
      "a team's total spans every match it appears in, whichever side of the fixture it occupies",
      "one row per team; ORDER BY num_points DESC, then team_name ASC",
    ],
    breakdown: [
      "The trap is structural: one Matches row contains TWO teams' results, and a query that scans Matches once and applies a single CASE can score only one of the two sides — GROUP BY would collapse the row to whichever team the SELECT list kept. The fix is to explode each match into two leg rows, host-perspective and guest-perspective, stacked with UNION ALL; from there the league table is a plain GROUP BY plus SUM. That is the two-legs trick: the aggregation becomes trivial once the grain is right — one row per (team, match) carrying that team's points.",
      "The two legs are mirrored CASEs. The host scores CASE WHEN host_goals > guest_goals THEN 3 WHEN host_goals = guest_goals THEN 1 ELSE 0, and the guest leg flips the comparison to guest_goals vs host_goals. The middle branch is the draw, and it fires for BOTH sides — a 1-1 deposits 1 into each team's pile, which is exactly what the standings demand. Writing the guest CASE by copy-pasting the host comparisons is the classic bug: every draw silently pays the away side nothing and the table drifts wrong in a way that looks plausible.",
      "Guest-only teams and the tiebreaker close it out. A team can appear exclusively in the guest column — Chicago in this seed never hosts — so its points exist only in the second branch of the UNION ALL, and any table keyed off host rows alone misses it entirely. The final sort is two keys: num_points DESC, then team_name ASC, because Auckland and Basel finish level on 4 here and without the name the engine picks their order arbitrarily. Deterministic output is part of the spec, not cosmetics.",
    ],
    edges: [
      "One match = two teams' results: a single scan of Matches with one CASE + GROUP BY scores only the side it kept — the two perspectives must be stacked with UNION ALL before aggregating.",
      "The draw pays both sides: match 2's 1-1 adds 1 to Auckland AND Basel. A guest CASE that reuses the host comparisons (or drops the middle branch) pays 0s for draws.",
      "Chicago never hosts: both of its results come from the guest branch — a league table computed from host rows alone loses the team completely.",
      "Auckland and Basel tie on 4 points: num_points DESC alone leaves their relative order to the engine; team_name ASC is what makes the output reproducible.",
    ],
    ladder: [
      {
        title: "Brute force — loop in the app",
        body: "Load the matches, walk every team, and for each fixture add 3/1/0 to whichever side that team occupies. Two lookups per match and all the bookkeeping lives in code, not in the query.",
      },
      {
        title: "The pattern — UNION ALL the two legs",
        body: "Each match becomes two already-scored rows (host CASE + mirrored guest CASE); then GROUP BY team_id and SUM. The league table falls out of the plainest aggregate there is.",
      },
      {
        title: "The optimal idea — same O(m), right grain",
        body: "No asymptotically cheaper shape exists — the work is reading m matches once. The real upgrade is grain: once the data is one row per (team, match), any scoring rule (bonus points, forfeits, two-legged aggregates) is a CASE edit, while ad-hoc per-side logic keeps multiplying.",
      },
    ],
    approach: "UNION ALL host-perspective and guest-perspective legs, then GROUP BY team and SUM the points",
    schema: {
      ddl: `CREATE TABLE Teams (
  team_id   INTEGER PRIMARY KEY,
  team_name TEXT NOT NULL
);
CREATE TABLE Matches (
  match_id    INTEGER PRIMARY KEY,
  host_team   INTEGER NOT NULL,
  guest_team  INTEGER NOT NULL,
  host_goals  INTEGER NOT NULL,
  guest_goals INTEGER NOT NULL
);`,
      seed: `INSERT INTO Teams (team_id, team_name) VALUES
  (1, 'Auckland'), (2, 'Basel'), (3, 'Chicago');
INSERT INTO Matches (match_id, host_team, guest_team, host_goals, guest_goals) VALUES
  (1, 1, 2, 3, 0),   -- Auckland home win
  (2, 2, 1, 1, 1),   -- draw: pays BOTH sides
  (3, 1, 3, 0, 2),   -- Chicago wins AWAY
  (4, 2, 3, 2, 1);   -- Basel home win; Chicago plays only away all day`,
      tables: [
        { name: "Teams", note: "3 teams: Auckland (1), Basel (2), Chicago (3)" },
        { name: "Matches", note: "4 matches; M2 is a planted draw (both sides score) and Chicago appears only as guest — the away-only trap" },
      ],
    },
    code: `WITH legs AS (
    SELECT
        host_team AS team_id,
        CASE
            WHEN host_goals > guest_goals THEN 3   -- home win
            WHEN host_goals = guest_goals THEN 1   -- draw: host's point
            ELSE 0                                 -- home loss
        END AS points
    FROM Matches
    UNION ALL
    SELECT
        guest_team AS team_id,
        CASE
            WHEN guest_goals > host_goals THEN 3   -- away win (mirrored!)
            WHEN guest_goals = host_goals THEN 1   -- same draw, other side
            ELSE 0
        END AS points
    FROM Matches
)
SELECT
    l.team_id,
    t.team_name,
    SUM(l.points) AS num_points
FROM legs l
JOIN Teams t ON t.team_id = l.team_id
GROUP BY l.team_id, t.team_name
ORDER BY num_points DESC, team_name ASC;   -- level on points? the name decides`,
    walkthrough: [
      "The host branch scores M1–M4 as (1,3), (2,1), (1,0), (2,3); the mirrored guest branch as (2,0), (1,1), (3,3), (3,0) — eight leg rows from four matches, both of Chicago's coming from the guest side.",
      "Grouping sums the legs: Auckland 3 + 0 + 1 = 4; Basel 1 + 3 + 0 = 4; Chicago 3 + 0 = 3. M2's draw deposited exactly one point into each side's pile — 1 + 1 across the fixture, not 1 total.",
      "Sort by points DESC then name: (1,'Auckland',4), (2,'Basel',4), (3,'Chicago',3) — the 4-4 tie is broken by team_name, and every team appears exactly once.",
    ],
    time: "O(m + t) — two linear passes over the matches build 2m leg rows, then one grouped sum plus t team lookups",
    space: "O(m) — the stacked legs CTE",
    followUps: [
      "Add teams that have not played yet — LEFT JOIN from Teams + COALESCE(SUM(l.points), 0) so a match-less club shows 0 instead of vanishing.",
      "Publish goal difference next to the points — the same two-legs shape, but the CASE becomes host_goals - guest_goals and its mirror.",
    ],
    related: ["top-travellers", "sales-analysis-ii"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "apples-and-oranges",
    statement:
      "A fruit stand logs every sale in Sales(day, fruit, sold_amount), where fruit is 'apple' or 'orange' and one fruit can sell several times per day. For each day, compare the day's total apple amount against its total orange amount. Whenever the two totals DIFFER, report one row: the day, the fruit that sold more, and that fruit's total. Days where the fruits tie are omitted, and a fruit with no sales that day simply totals zero. Order by day.",
    examples: [
      {
        input: "day 1: apple 6, apple 4, orange 6 — three separate sales rows",
        output: "1 · apple · 10",
        explanation:
          "The two apple rows sum to 10 before any comparison; 10 > 6, so apple takes day 1 with its total.",
      },
      {
        input: "day 3: apple 5, orange 5 · day 4: apple 7, no orange rows",
        output: "4 · apple · 7 (day 3 yields nothing)",
        explanation:
          "5-5 is a tie — no row. Day 4's missing side counts as 0, so apple's 7 stands.",
      },
    ],
    constraints: [
      "totals are per day per fruit: SUM(sold_amount) over that fruit's rows on that day",
      "only days whose two totals differ produce a row; ties are excluded entirely",
      "the winning fruit's name and its total go in columns fruit and sold_amount; ORDER BY day",
    ],
    breakdown: [
      "The question is row-to-row pairing on a shared key: each day's apple total against the same day's orange total — two aggregates that must end up side by side. The join section's instinct applies: aggregate each fruit's rows per day into its own totals list, then JOIN the two lists ON day. But joining the RAW table would fan out — day 1's two apple rows times one orange row double-counts everything — so each side is pre-aggregated first. Join totals, never raw rows; the multiplicity rule of self-joins in its purest form.",
      "Absent sides are the second half of the problem. A plain inner join pairs only days where BOTH fruits sold — a day of apples-only or oranges-only would vanish. The fix is a day spine: SELECT DISTINCT day FROM Sales drives the FROM clause, and each totals side LEFT JOINs onto it, with COALESCE(total, 0) turning the unmatched NULL into the zero the spec demands. Building the spine from ALL days — not from the apple side — is what catches absence in both directions; day 4 and day 5 of the seed are mirror-image one-sided days precisely to prove it.",
      "With both totals on one row, the winner is a CASE on the comparison — apple_total >= orange_total picks 'apple' and its total, else the orange pair. The exclusion of ties is not part of that CASE at all: it is a WHERE apple_total <> orange_total, because filtering and choosing are different jobs. Day 3 is the trap row — 5 vs 5 looks like a legitimate 'bigger of the two' to a sloppy query — and the explicit inequality is what removes it quietly.",
    ],
    edges: [
      "Day 1's apples are two rows (6 + 4): totals must exist BEFORE the pairing — a join over raw Sales rows fans out and double-counts.",
      "Day 3 ties 5-5 and must disappear: the output is 'days that differ', not 'the bigger of the two' — without apple_total <> orange_total the tie sneaks back in.",
      "Day 4 has no orange rows at all: an inner join of the two totals sides drops the day; LEFT JOIN + COALESCE(total, 0) compares apple's 7 against a proper zero.",
      "Day 5 is the mirror image (only oranges): a spine built from the apple side alone would silently lose it — DISTINCT days over the whole table keeps both directions honest.",
    ],
    ladder: [
      {
        title: "Brute force — per-day subqueries",
        body: "For each distinct day, run two SUM queries (apples, oranges) and compare in application code. N+1 round trips for what is one grouping over one table.",
      },
      {
        title: "The pattern — two derived sides, joined on day",
        body: "Pre-aggregate each fruit per day, LEFT JOIN both onto a DISTINCT-day spine, and compare with COALESCE 0 defaults. Same-key pairing with no raw-row fan-out.",
      },
      {
        title: "The optimal idea — conditional aggregation",
        body: "One GROUP BY day with SUM(CASE WHEN fruit = 'apple' THEN sold_amount END) and its orange twin builds both totals in a single scan — no joins at all. Same O(n), fewer moving parts. The join version generalizes to any pair of label values and keeps the pairing instinct sharp; the conditional form wins when the labels are known and fixed.",
      },
    ],
    approach: "Pre-aggregate each fruit per day, LEFT JOIN both onto a DISTINCT-day spine, pick the winner with a CASE",
    schema: {
      ddl: `CREATE TABLE Sales (
  day         INTEGER NOT NULL,
  fruit       TEXT NOT NULL CHECK (fruit IN ('apple', 'orange')),
  sold_amount INTEGER NOT NULL
);`,
      seed: `INSERT INTO Sales (day, fruit, sold_amount) VALUES
  (1, 'apple',  6), (1, 'apple',  4), (1, 'orange', 6),  -- day 1: apples 10 vs 6
  (2, 'orange', 9), (2, 'apple',  4),                     -- day 2: 4 vs oranges 9
  (3, 'apple',  5), (3, 'orange', 5),                     -- day 3: 5-5 tie → excluded
  (4, 'apple',  7),                                       -- day 4: no orange rows → 0
  (5, 'orange', 8);                                       -- day 5: no apple rows → 0`,
      tables: [
        { name: "Sales", note: "9 sale rows across days 1–5; day 3 is a planted tie, days 4 and 5 are one-sided (missing orange / missing apple)" },
      ],
    },
    code: `WITH days AS (                                     -- spine: every day in the log
    SELECT DISTINCT day FROM Sales
),
apples AS (
    SELECT day, SUM(sold_amount) AS total
    FROM Sales
    WHERE fruit = 'apple'
    GROUP BY day
),
oranges AS (
    SELECT day, SUM(sold_amount) AS total
    FROM Sales
    WHERE fruit = 'orange'
    GROUP BY day
),
paired AS (                                        -- one row per day, both totals
    SELECT
        d.day,
        COALESCE(a.total, 0) AS apple_total,       -- absent side = zero, not NULL
        COALESCE(o.total, 0) AS orange_total
    FROM days d
    LEFT JOIN apples  a ON a.day = d.day
    LEFT JOIN oranges o ON o.day = d.day
)
SELECT
    day,
    CASE WHEN apple_total >= orange_total
         THEN 'apple' ELSE 'orange' END         AS fruit,
    CASE WHEN apple_total >= orange_total
         THEN apple_total ELSE orange_total END AS sold_amount
FROM paired
WHERE apple_total <> orange_total                  -- ties leave quietly
ORDER BY day;`,
    walkthrough: [
      "The fruit CTEs total: apples → day 1: 10 (6 + 4 already merged), day 2: 4, day 3: 5, day 4: 7; oranges → day 1: 6, day 2: 9, day 3: 5, day 5: 8.",
      "The spine holds days 1–5; the LEFT JOINs pad the gaps with NULL → 0: day 4 pairs (7, 0), day 5 pairs (0, 8), day 3 pairs (5, 5).",
      "The WHERE drops day 3's tie; the CASE picks winners — (1,'apple',10), (2,'orange',9), (4,'apple',7), (5,'orange',8) — ordered by day.",
    ],
    time: "O(n) — two filtered group-bys over the sales, then one linear pairing pass",
    space: "O(d) — at most two totals rows per day",
    followUps: [
      "Report every day with both totals side by side (apple_total, orange_total), ties included — drop the WHERE and the CASE, keep the spine.",
      "Rewrite with one conditional-aggregation GROUP BY (no joins) and compare which version scans Sales fewer times — then add a third fruit and see which shape bends first.",
    ],
    related: ["sales-analysis-i", "employees-with-missing-information"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "most-frequently-ordered-product-per-customer",
    statement:
      "An Orders log records one row per purchase: customer_id and product_id. A separate Products table maps product_id to product_name. For each customer, find the product they ordered MOST often — the one with the most purchase rows. If two products tie on order count, the lexicographically smaller product NAME wins. Return customer_id, product_id, product_name — one row per customer, ordered by customer_id.",
    examples: [
      {
        input: "customer 2's purchases: Bolts ×2, Chalk ×2 — a dead heat",
        output: "2 · Bolts",
        explanation:
          "Both products count 2; the rule hands the win to 'Bolts' because the name sorts before 'Chalk'. The name is the tiebreak, not the id.",
      },
      {
        input: "customer 1's purchases: Anvil ×3, Bolts ×1",
        output: "1 · Anvil",
        explanation: "3 beats 1 outright — no tie, so the name rule never wakes up.",
      },
    ],
    constraints: [
      "frequency = number of purchase ROWS per (customer, product) — not distinct days, not basket size",
      "ties on count resolve to the lexicographically smallest product_name",
      "exactly one row per customer who has at least one order; ORDER BY customer_id",
    ],
    breakdown: [
      "'Most frequent per customer' is an ARGMAX over groups — and SQL has no argmax keyword. The counting half is easy: GROUP BY customer and product, COUNT(*). The hard half is selecting the winner WITHIN each customer's slice, and the window answer is to sort inside the partition: RANK() OVER (PARTITION BY customer_id ORDER BY cnt DESC, product_name). The rank lives on the same rows as the counts, so the outer query is a trivial WHERE rnk = 1 — no self-join back to a max, no correlated subquery per customer.",
      "The tie is the whole problem. The naive peak-hunt — MAX(cnt) per customer, then keep the rows matching it — returns FOUR rows on this seed: customer 2 comes back with BOTH Bolts and Chalk, because both hit the max. The spec allows exactly one winner, and the discriminator is a column the counts do not even carry: the product NAME. That forces the Products join into the pipeline BEFORE ranking, because the tiebreak key must exist on the row being ranked. Join-for-the-tiebreak is a reusable pattern — ranking keys often live one join away from the aggregate.",
      "Two deliberate choices inside the solution. RANK (not ROW_NUMBER): the (cnt DESC, product_name) sort decides every tie the data can produce here, but if two products ever tied on count AND name, RANK would keep both at rank 1 — the honest failure mode — while ROW_NUMBER would coin-flip in the dark. And COUNT(*) (not COUNT(DISTINCT ...)): frequency means purchase rows — customer 1's Anvil appears as three separate rows — and any dedup collapses every group to 1 and destroys the question.",
    ],
    edges: [
      "Customer 2 orders Bolts ×2 and Chalk ×2: a MAX(cnt)-per-customer filter returns BOTH products — the name tiebreak, carried by the Products join, is what gets the output back to one row.",
      "Customer 1's Anvil ×3 is three separate rows: frequency counts rows, so COUNT(*) — a COUNT(DISTINCT product_id) or a deduped log would report every product as 1.",
      "Customer 3 ordered once, ever: any 'must repeat' assumption (a HAVING cnt > 1) drops them — the single purchase IS the mode of a one-row history.",
      "The tiebreak sorts on product_name, which lives in Products: without the join the ranking key does not exist on the row — Bolts vs Chalk would settle by whatever the engine did last.",
    ],
    ladder: [
      {
        title: "Brute force — N+1 argmax",
        body: "Per customer, run a grouped count query, sort it in application code, take the first row. One round trip per customer and all the ranking logic lives outside SQL.",
      },
      {
        title: "The pattern — counts CTE + RANK partition",
        body: "GROUP BY (customer, product) with COUNT(*), join Products so the name rides along, then RANK() OVER (PARTITION BY customer ORDER BY cnt DESC, product_name) and keep rank 1.",
      },
      {
        title: "The optimal idea — window argmax vs aggregate-of-aggregates",
        body: "Same complexity either way: a max-cnts CTE plus a join-back plus MIN(name) per customer reaches the same row in two aggregate hops, while the window does it in one sorted pass per partition. The window's real edge is composability — top-2, per-month, a new tie policy — all one ORDER BY edit.",
      },
    ],
    approach: "counts CTE → RANK() per customer over (cnt DESC, product_name) → keep rank 1",
    schema: {
      ddl: `CREATE TABLE Orders (
  customer_id INTEGER NOT NULL,
  product_id  INTEGER NOT NULL
);
CREATE TABLE Products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);`,
      seed: `INSERT INTO Products (product_id, product_name) VALUES
  (1, 'Anvil'), (2, 'Bolts'), (3, 'Chalk'), (4, 'Drill');
INSERT INTO Orders (customer_id, product_id) VALUES
  (1, 1), (1, 1), (1, 1), (1, 2),   -- customer 1: Anvil x3, Bolts x1
  (2, 2), (2, 2), (2, 3), (2, 3),   -- customer 2: Bolts x2, Chalk x2 → NAME tiebreak
  (3, 4);                           -- customer 3: one single order`,
      tables: [
        { name: "Products", note: "4 products, names in alphabetical order — Anvil, Bolts, Chalk, Drill" },
        { name: "Orders", note: "9 purchase rows; customer 2 is a planted 2-2 tie, customer 3 bought exactly once" },
      ],
    },
    code: `WITH counts AS (
    SELECT
        o.customer_id,
        o.product_id,
        p.product_name,
        COUNT(*) AS cnt                                  -- purchase ROWS
    FROM Orders o
    JOIN Products p ON p.product_id = o.product_id       -- name needed for ties
    GROUP BY o.customer_id, o.product_id, p.product_name
),
ranked AS (
    SELECT
        customer_id,
        product_id,
        product_name,
        RANK() OVER (
            PARTITION BY customer_id
            ORDER BY cnt DESC, product_name              -- count first, NAME breaks ties
        ) AS rnk
    FROM counts
)
SELECT customer_id, product_id, product_name
FROM ranked
WHERE rnk = 1                                            -- each customer's mode
ORDER BY customer_id;`,
    walkthrough: [
      "The counts CTE folds 9 order rows into 5 groups: (1, Anvil) = 3, (1, Bolts) = 1, (2, Bolts) = 2, (2, Chalk) = 2, (3, Drill) = 1.",
      "Ranking within each customer: customer 1 → Anvil (3) takes rank 1; customer 2 → both products count 2, so product_name decides — 'Bolts' < 'Chalk' gives Bolts rank 1, Chalk rank 2; customer 3 → Drill, unopposed.",
      "rnk = 1 keeps (1, 1, 'Anvil'), (2, 2, 'Bolts'), (3, 4, 'Drill') — one row per customer in id order, and customer 2's tie never leaked a second row.",
    ],
    time: "O(n log n) — one grouping pass, then a sort inside each customer partition",
    space: "O(g) — one counts row per (customer, product) group",
    followUps: [
      "Top TWO products per customer — switch the filter to rnk <= 2 and watch what a tie straddling the cut does to RANK's numbering.",
      "Least-often-ordered product with ties going to the LARGEST name — flip both sort directions and re-trace customer 2.",
    ],
    related: ["top-travellers", "group-sold-products-by-the-date", "sales-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "customer-order-frequency",
    statement:
      "An orders log holds Orders(order_id, customer_id, order_date, invoice), where invoice is the amount charged on that order. A customer counts as engaged if they spent at least 500 in June 2025 AND at least 500 in July 2025 — the two months evaluated separately. Orders in any other month count for nothing. Return the customer_id of every engaged customer, ordered by customer_id.",
    examples: [
      {
        input: "customer 1: June orders 300.50 + 250.00, July order 500.00, August order 900.00",
        output: "1",
        explanation:
          "June totals 550.50 and July lands exactly on 500.00 — the bar is >= 500, so the line itself passes. The 900.00 August order is invisible to both buckets.",
      },
      {
        input: "customer 3: July orders 950.00 + 60.00, nothing in June",
        output: "no row",
        explanation:
          "A 1010.00 July cannot rescue June: with no June rows the June sum is NULL, and NULL >= 500 fails. Both gates are required.",
      },
    ],
    constraints: [
      "month buckets come from order_date: June 2025 is '2025-06', July 2025 is '2025-07' (compared as strings)",
      "engaged = SUM(invoice) >= 500 in BOTH months; one strong month never suffices",
      "report customer_id only, ordered by customer_id",
    ],
    breakdown: [
      "The data is long — one row per order — and the question wants two parallel numbers per customer: a June total and a July total. The one-scan answer is conditional aggregation: SUM(CASE WHEN the order's month bucket matches THEN invoice END) twice inside the same GROUP BY. Each SUM silently ignores the rows the CASE leaves NULL, so every customer's row yields exactly their two month totals. The alternative — two derived tables (June spenders, July spenders) joined back on customer_id — reaches the same rows at the cost of two extra passes and a join whose grain you must re-verify.",
      "The gate belongs in HAVING, not WHERE: the >= 500 test is about an aggregate, and WHERE filters rows before grouping and cannot see a SUM at all. There is a free bonus in the CASE-then-SUM shape: a customer with NO orders in a month sums an all-NULL set, gets NULL, and NULL >= 500 is UNKNOWN — the gate rejects them with zero extra code. Customer 3 lives exactly here: no June rows at all, not 'June = 0' — the NULL is doing the rejection.",
      "Month bucketing and the AND close it out. strftime('%Y-%m', order_date) renders each date as a comparable 'YYYY-MM' string, and '2025-06' < '2025-07' orders exactly like the calendar — string equality IS the month test, with no date arithmetic to get wrong. The two HAVING conditions are ANDed, and the AND is where the business rule bites: customer 2's 700.00 June is real money that buys nothing, because 180.25 across July fails the second gate. Both-or-nothing is the entire spec; everything else in the query is plumbing for it.",
    ],
    edges: [
      "HAVING, not WHERE: the >= 500 test reads an aggregate — WHERE runs before grouping and cannot see SUM; moving the test there is a syntax error at best.",
      "Customer 3 has NO June rows: SUM(CASE …) over an empty matching set is NULL (not 0), and NULL >= 500 is UNKNOWN — the absent month rejects them without a COALESCE.",
      "Customer 2 is huge in June (700.00) but only 180.25 across July: the gates are ANDed — the classic 'big in one month only' trap this spec exists to catch.",
      "Customer 1's 900.00 August order never enters either bucket: strftime('%Y-%m') string equality fences the two months exactly; neighboring months leak nothing in or out.",
    ],
    ladder: [
      {
        title: "Brute force — two queries + intersect",
        body: "Query June's >= 500 spenders, query July's, INTERSECT the results (or de-duplicate in code). Three passes over the log and two query shapes that must be kept in sync.",
      },
      {
        title: "The pattern — conditional aggregation + HAVING",
        body: "One GROUP BY customer, two SUM(CASE month = …) totals, HAVING on both >= 500. One scan, one shape, and both gates visible in a single clause.",
      },
      {
        title: "The optimal idea — parameterize the months",
        body: "The same shape extends to N months: one conditional SUM per bucket, then count how many buckets cleared the bar and require N. The single-scan conditional form is where this family ends; per-month joins scale linearly in scans, conditional aggregation does not.",
      },
    ],
    approach: "GROUP BY customer with two SUM(CASE month) conditional totals; HAVING on both >= 500",
    schema: {
      ddl: `CREATE TABLE Orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date  TEXT NOT NULL,
  invoice     REAL NOT NULL
);`,
      seed: `INSERT INTO Orders (order_id, customer_id, order_date, invoice) VALUES
  (101, 1, '2025-06-05', 300.50),
  (102, 1, '2025-06-20', 250.00),   -- customer 1 June: 550.50
  (103, 1, '2025-07-08', 500.00),   -- July: exactly 500.00 → >= keeps it
  (104, 1, '2025-08-02', 900.00),   -- August: outside both buckets, ignored
  (105, 2, '2025-06-11', 700.00),   -- June-only big spender (trap)
  (106, 2, '2025-07-15', 120.25),
  (107, 2, '2025-07-21', 60.00),    -- July: 180.25 → fails
  (108, 3, '2025-07-02', 950.00),
  (109, 3, '2025-07-19', 60.00),    -- July: 1010.00, but NO June rows → NULL gate
  (110, 4, '2025-06-27', 100.00),
  (111, 4, '2025-07-30', 150.00);   -- small in both months`,
      tables: [
        { name: "Orders", note: "11 orders from 4 customers; June/July 2025 plus one planted August order; customer 3 has zero June rows and customer 2 is the June-only big spender" },
      ],
    },
    code: `SELECT
    customer_id
FROM Orders
GROUP BY customer_id
HAVING
    SUM(CASE WHEN strftime('%Y-%m', order_date) = '2025-06'
             THEN invoice END) >= 500      -- June gate: aggregates live in HAVING
    AND
    SUM(CASE WHEN strftime('%Y-%m', order_date) = '2025-07'
             THEN invoice END) >= 500      -- July gate: BOTH must clear
ORDER BY customer_id;`,
    walkthrough: [
      "Grouping folds 11 orders into 4 customers; inside each group the June CASE sums only '2025-06' rows and the July CASE only '2025-07' rows — customer 1: June 550.50 / July 500.00; customer 2: 700.00 / 180.25; customer 3: NULL / 1010.00; customer 4: 100.00 / 150.00.",
      "The HAVING tests both gates: customer 1 passes (550.50 >= 500 AND 500.00 >= 500 — exactly on the line, and >= holds); customer 2 fails on July; customer 3's NULL June makes the first comparison UNKNOWN; customer 4 fails both.",
      "One survivor — the single row (1) — ordered by customer_id.",
    ],
    time: "O(n) — one scan of the log; every order touches exactly one CASE branch",
    space: "O(c) — one accumulator pair per customer",
    followUps: [
      "Show the work: add june_total and july_total to the SELECT list — the same two SUM(CASE) expressions, now visible next to the id.",
      "Generalize to '>= 500 in every month of a quarter' — drive the buckets from a months VALUES CTE and count how many cleared the bar.",
    ],
    related: ["bank-account-summary-ii", "sales-analysis-ii", "market-analysis-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "sales-by-day-of-the-week",
    statement:
      "A café tracks sales in Items(item_id, item_name) and Orders(item_id, order_date, amount). Build a weekly grid per item: one row per item, seven columns Monday through Sunday, where each column holds the item's TOTAL amount sold on that weekday — across all weeks in the log. An item with no orders still appears, as an all-zero row. Return item_id, item_name, then the seven day columns named mon through sun, ordered by item_id.",
    examples: [
      {
        input: "Muffin sold on 2025-06-03 (a Tuesday, 8) and 2025-06-01 (a SUNDAY, 11)",
        output: "2 Muffin · tue 8 · sun 11",
        explanation:
          "strftime('%w') codes Sunday as 0 — the weekend sale lands in sun because its code is '0', not because it is the seventh day.",
      },
      {
        input: "Croissant: zero order rows",
        output: "3 Croissant · mon..sun all 0",
        explanation:
          "The item survives via LEFT JOIN; its SUMs come back NULL (no rows to sum), and COALESCE renders each as a proper 0.",
      },
    ],
    constraints: [
      "one row per item; all of its orders — any week — collapse into that item's seven weekday columns",
      "each column is SUM(amount) for that weekday, 0 when the item never sold then (or never sold at all)",
      "weekday codes follow strftime('%w'): '0' = Sunday, '1' = Monday … '6' = Saturday; ORDER BY item_id",
    ],
    breakdown: [
      "The log is long — one row per order, weekday buried inside the date — and the answer is wide: seven named columns. The pivot idiom is one CASE per target column inside a single GROUP BY: SUM(CASE WHEN the row's weekday is Monday THEN amount END) AS mon, repeated with codes '2' through '6' for tue..sat and code '0' for sun. Each SUM sweeps the group and keeps only its own weekday's amounts; the CASE's silent ELSE NULL is what makes SUM ignore the other six days. One scan, seven accumulators running in parallel — that is the entire engine of the wide-from-long reshape.",
      "The %w codebook is the gotcha this problem exists to teach. strftime('%w', order_date) returns a TEXT code where SUNDAY is 0: '0' Sunday, '1' Monday … '6' Saturday. ISO instinct says Monday is 1 and Sunday is 7, and acting on that instinct rotates the whole grid one column — Muffin's 11.00 sale on 2025-06-01 would land in sat instead of sun, plausible-looking and uniformly wrong. The seed is built to catch it: a Sunday sale and a Saturday sale sit on different items with different amounts, so any mis-mapping shifts visible numbers.",
      "Keeping the empty item needs two NULL defenses in a row. Croissant has no orders, and an INNER JOIN would delete it before any aggregation — so the grid is driven FROM Items with a LEFT JOIN to Orders. The unmatched item then appears as one row whose order columns are all NULL, and each SUM over that group returns NULL — SUM of an all-NULL set is NULL, not 0 — so every column wraps its SUM in COALESCE(..., 0) to print the all-zero row the spec demands. Two different NULLs are in play, the unmatched join row and the empty sum, and the COALESCE sits exactly where the second one surfaces.",
    ],
    edges: [
      "strftime('%w') is Sunday-zero: '0' = Sunday … '6' = Saturday — mapping 0 → Monday shifts every sale one column left; the seed's 2025-06-01 (Sunday, code '0') vs 2025-06-07 (Saturday, code '6') catches it.",
      "Croissant has no order rows: an inner join erases the item entirely; LEFT JOIN keeps it, and COALESCE(SUM(...), 0) turns the all-NULL sums into a real zero grid.",
      "SUM of an all-NULL set is NULL, not 0: the ELSE-less CASE yields NULL for the six non-matching days, and the unmatched item's row is all-NULL — the COALESCE is load-bearing, not cosmetic.",
      "Muffin sells on two different Mondays (06-02 and 06-09): both collapse into the SAME mon column — the pivot aggregates across weeks by design, so the grid stays seven columns no matter how long the log.",
    ],
    ladder: [
      {
        title: "Brute force — seven self-joins or app-side reshape",
        body: "Join Orders to itself seven times on weekday equality (with everything that does to row counts), or dump the log and pivot in application code. Both hurt; the database can do it in one statement.",
      },
      {
        title: "The pattern — CASE-per-column pivot",
        body: "LEFT JOIN orders onto items, GROUP BY item, one SUM(CASE WHEN %w-code = …) per column, COALESCE 0. The whole wide-from-long reshape in a single scan.",
      },
      {
        title: "The optimal idea — one scan, N accumulators",
        body: "The pivot is already single-pass and its cost is O(orders) regardless of column count. The shape scales by adding CASEs (per product, per region), and when you need the transpose back — wide to long — it is the reverse move: UNION ALL the columns.",
      },
    ],
    approach: "LEFT JOIN + GROUP BY item, one SUM(CASE weekday-code) column per day, COALESCE 0",
    schema: {
      ddl: `CREATE TABLE Items (
  item_id   INTEGER PRIMARY KEY,
  item_name TEXT NOT NULL
);
CREATE TABLE Orders (
  item_id    INTEGER NOT NULL,
  order_date TEXT NOT NULL,
  amount     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Items (item_id, item_name) VALUES
  (1, 'Latte'), (2, 'Muffin'), (3, 'Croissant');
INSERT INTO Orders (item_id, order_date, amount) VALUES
  (1, '2025-06-02', 12),  -- Monday    (%w '1')
  (1, '2025-06-04',  9),  -- Wednesday (%w '3')
  (1, '2025-06-06', 15),  -- Friday    (%w '5')
  (1, '2025-06-07', 20),  -- Saturday  (%w '6')
  (2, '2025-06-01', 11),  -- SUNDAY    (%w '0' — the gotcha row)
  (2, '2025-06-02',  3),  -- Monday    (%w '1')
  (2, '2025-06-03',  8),  -- Tuesday   (%w '2')
  (2, '2025-06-07',  5),  -- Saturday  (%w '6')
  (2, '2025-06-09',  4);  -- Monday again (%w '1') → mon = 3 + 4`,
      tables: [
        { name: "Items", note: "3 items; Croissant has no orders — planted for the zero-grid trap" },
        { name: "Orders", note: "9 order rows, June 2025; 2025-06-01 is a Sunday (%w '0') and two Muffin Mondays (06-02, 06-09) collapse into one mon column" },
      ],
    },
    code: `SELECT
    i.item_id,
    i.item_name,
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '1' THEN o.amount END), 0) AS mon,  -- %w: 1 = Monday
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '2' THEN o.amount END), 0) AS tue,
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '3' THEN o.amount END), 0) AS wed,
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '4' THEN o.amount END), 0) AS thu,
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '5' THEN o.amount END), 0) AS fri,
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '6' THEN o.amount END), 0) AS sat,
    COALESCE(SUM(CASE WHEN strftime('%w', o.order_date) = '0' THEN o.amount END), 0) AS sun   -- 0 = SUNDAY, mapped on purpose
FROM Items i
LEFT JOIN Orders o ON o.item_id = i.item_id      -- keeps order-less items on the grid
GROUP BY i.item_id, i.item_name
ORDER BY i.item_id;`,
    walkthrough: [
      "The LEFT JOIN pairs Latte with 4 order rows and Muffin with 5; Croissant keeps its row with every o.* column NULL — an inner join would have deleted it right here.",
      "Each order's %w code routes its amount: Latte 06-02 → '1'/mon 12, 06-04 → '3'/wed 9, 06-06 → '5'/fri 15, 06-07 → '6'/sat 20; Muffin 06-01 → '0'/sun 11, 06-02 → '1'/mon 3, 06-03 → '2'/tue 8, 06-07 → '6'/sat 5, 06-09 → '1'/mon 4.",
      "Group sums (NULL sums COALESCE to 0): Latte (12, 0, 9, 0, 15, 20, 0); Muffin mon = 3 + 4 = 7 → (7, 8, 0, 0, 0, 5, 11); Croissant (0, 0, 0, 0, 0, 0, 0) — three rows, ordered by item_id.",
    ],
    time: "O(n) — one scan of the orders; the seven accumulators run in parallel",
    space: "O(i) — one 7-cell row per item",
    followUps: [
      "Add a weekly total column — SUM(o.amount) wrapped in the same COALESCE — then try 'busiest day' as MAX over the pivots and feel why the transpose back to long is easier.",
      "Convert to ISO weekday (Monday = 1 … Sunday = 7) via ((CAST(strftime('%w', …) AS INTEGER) + 6) % 7) + 1, re-label the columns, and confirm the grid does not move.",
    ],
    related: ["occupations-pivot", "reformat-department-table", "group-sold-products-by-the-date"],
    order: "exact",
    xp: 20,
  },
];
