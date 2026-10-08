// Deep-dives — LeetCode Premium batch III, file 5 of 6: calendar buckets,
// influence chains, standings sorts, forward fills, molecule picks and badges
// (3 Easy, 3 Medium). Engine-verified by scripts/tmp-67b5-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM3_OPS: LcSqlDive[] = [
  {
    slug: "tasks-count-in-the-weekend",
    statement:
      "Task logs submissions as one row each: (task_id, submit_date, effort) — submit_date is TEXT in 'YYYY-MM-DD' form and effort is the work the task took. Split the log into two calendar buckets: 'weekend' for Saturdays and Sundays, 'weekday' for every other day, Friday included. Report both buckets as rows — columns period, task_cnt, total_effort, one row per bucket carrying how many tasks landed there and the sum of their effort — ordered with the weekend row first.",
    examples: [
      {
        input:
          "the seed's eight tasks span two June weeks: Saturdays 2024-06-01 (effort 5) and 2024-06-08 (8), Sundays 2024-06-02 (7) and 2024-06-09 (2)",
        output: "weekend · 4 · 22",
        explanation:
          "Four Saturday/Sunday rows: 5 + 7 + 8 + 2 = 22. The bucket is decided by the weekday code %w returns — '0' for Sunday and '6' for Saturday.",
      },
      {
        input: "task 5 lands on Friday 2024-06-07 with effort 3 — the last day of the standard work week",
        output: "weekday (the weekday row reads weekday · 4 · 18)",
        explanation:
          "%w reads '5' for Friday: a weekday despite ending the work week. The weekday bucket is 4 (Mon) + 6 (Wed) + 3 (Fri) + 5 (Mon) = 18 over four tasks.",
      },
    ],
    constraints: [
      "exactly two output rows — 'weekend' first, then 'weekday'; task_cnt counts submissions and total_effort sums their effort",
      "weekend = the weekday code IN ('0', '6') (0 is Sunday, 6 is Saturday, returned as TEXT); weekday is everything else, Friday ('5') included",
      "columns period, task_cnt, total_effort — the seed's buckets tie at 4 tasks each, so only total_effort (22 vs 18) separates them",
    ],
    breakdown: [
      "This report is a GROUP BY over a derived key: the calendar knowledge of which day counts as a weekend day has to become a VALUE before any aggregation can see it. strftime('%w', submit_date) turns each TEXT date into a one-character weekday code — 0 for Sunday through 6 for Saturday — returned as TEXT, never as a number. A CASE folds those codes into the two labels the output wants, and grouping by the label forms exactly two buckets in one pass. The report is small (two rows) but the semantics are loaded: which rows land in which bucket is the entire answer. The seed's totals, 22 weekend effort against 18 weekday over a 4-4 count tie, are the numbers any correct formulation must reproduce.",
      "The fixed two-row shape is a small pivot, and SQL offers two honest ways to build it. Conditional aggregation computes the label once and groups once — one scan, and a third bucket (say 'holiday') would be a new CASE branch rather than new plumbing. A UNION ALL of two filtered aggregates writes each row's label literally, which reads clearly but scans the table twice and hardcodes the row order into the query text. Either way the row ORDER must be stated — an engine is free to emit grouped rows in any order, and 'weekend first' is part of the contract here — so the ORDER BY carries an explicit CASE key instead of trusting group formation order.",
      "The %w specifics are where queries die. The codes are TEXT: membership must be IN ('0', '6'), because '6' compared against the integer 6 never matches under SQLite's cross-type rules. Numeric intuition like BETWEEN 5 AND 6 fails worse — a text code and an integer sit on opposite sides of the type order, so the range catches nothing at all on this seed. And 0 means Sunday, not Monday: Friday is '5' and stays a weekday, so the seed's Friday row must not drift across the divide. Grouping by a SELECT alias works on this engine, but computing the label in a CTE and grouping by the CTE column keeps the query portable and readable at the same time.",
    ],
    edges: [
      "Task 1 ('2024-06-01') carries code '6' as TEXT: IN (0, 6) with bare integers never matches across types, all eight tasks fall into weekday, and the weekend row disappears entirely — (weekday, 8, 40) is the wrong query's whole output.",
      "BETWEEN 5 AND 6 matches nothing on this engine: cross-type comparison ranks every text above every integer, so each code passes the >= 5 bound but fails the <= 6 bound — the whole seed collapses to (weekday, 8, 40) again, by a different mechanism than the integer IN.",
      "Task 5 (Friday '2024-06-07', effort 3) is a weekday: any model that pulls the work week's last day across the divide shifts 3 effort — weekend 25 instead of the true 22 — and the 22-vs-18 comparison flips.",
      "Both buckets hold exactly 4 tasks, so only total_effort (22 vs 18) exposes a misbucketed row; and the order is part of the contract — ORDER BY period alone prints 'weekday' first because 'weekday' sorts before 'weekend' ('d' before 'e').",
    ],
    ladder: [
      { title: "Brute force — bucket by hand", body: "Look up each date's weekday on a calendar, write every task into a weekend or weekday pile, then count and sum each pile. The engine does the same walk in one pass once the calendar rule becomes a computed column." },
      { title: "The pattern — tag, group, order", body: "strftime('%w', submit_date) yields the code; a CASE maps ('0', '6') to 'weekend' and the rest to 'weekday'; GROUP BY the label with COUNT and SUM; ORDER BY a CASE key pins weekend above weekday." },
      { title: "The optimal idea — make the classification a value, then aggregate it", body: "O(n). The durable rule: derived-key pivots are 'compute the key, then GROUP BY the key' — and the key's TYPE is part of its identity, so membership tests must quote the codes and the output order must be an explicit key, never an accident of grouping." },
    ],
    approach: "strftime('%w') codes folded by CASE into weekend/weekday, grouped by the label, ordered by a weekend-first CASE key",
    schema: {
      ddl: `CREATE TABLE Task (
  task_id     INTEGER PRIMARY KEY,
  submit_date TEXT NOT NULL,  -- 'YYYY-MM-DD'
  effort      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Task (task_id, submit_date, effort) VALUES
  (1, '2024-06-01', 5),  -- Saturday, week 1
  (2, '2024-06-02', 7),  -- Sunday, week 1
  (3, '2024-06-03', 4),  -- Monday, week 1
  (4, '2024-06-05', 6),  -- Wednesday, week 1
  (5, '2024-06-07', 3),  -- Friday, week 1: a WEEKDAY, the trap row
  (6, '2024-06-08', 8),  -- Saturday, week 2
  (7, '2024-06-09', 2),  -- Sunday, week 2
  (8, '2024-06-10', 5);`,
      tables: [
        { name: "Task", note: "8 submissions over two June weeks — 2 Saturdays, 2 Sundays, 4 weekdays including the Friday trap" },
      ],
    },
    code: `WITH tagged AS (
    SELECT
        CASE WHEN strftime('%w', submit_date) IN ('0', '6')  -- TEXT codes: 0=Sun, 6=Sat
             THEN 'weekend' ELSE 'weekday'
        END AS period,
        effort
    FROM Task
)
SELECT
    period,
    COUNT(*)    AS task_cnt,      -- both buckets hold 4 on this seed
    SUM(effort) AS total_effort   -- 22 weekend vs 18 weekday
FROM tagged
GROUP BY period
ORDER BY CASE WHEN period = 'weekend' THEN 0 ELSE 1 END;  -- weekend row FIRST`,
    walkthrough: [
      "strftime('%w', submit_date) stamps each of the eight rows with a one-character TEXT code: '6' for the Saturdays 06-01 and 06-08, '0' for the Sundays 06-02 and 06-09, and '1' through '5' for the Monday/Wednesday/Friday rows.",
      "The CASE folds the codes into two labels and GROUP BY forms both buckets: weekend {tasks 1, 2, 6, 7} sums 5 + 7 + 8 + 2 = 22; weekday {tasks 3, 4, 5, 8} sums 4 + 6 + 3 + 5 = 18. Both counts land on 4 — only the effort column separates them.",
      "ORDER BY CASE WHEN period = 'weekend' ... ships (weekend, 4, 22) first and (weekday, 4, 18) second — a bare ORDER BY period would flip the rows, because 'weekday' sorts before 'weekend'.",
    ],
    time: "O(n) — one scan to tag and group the eight rows",
    space: "O(1) — two output rows",
    followUps: [
      "Expand the report to all seven weekday buckets ordered Monday-first — what does the ORDER BY need when '0' means Sunday, and does a CASE key or a numeric code sort cleaner?",
      "Report each week's weekend share of effort (weekend effort over total effort) beside the two rows — where does the total come from (a window over the groups, or a scalar subquery), and what should print in a week with no weekend tasks?",
    ],
    related: ["sales-by-day-of-the-week", "count-salary-categories", "create-a-session-bar-chart"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "calculate-the-influence-of-each-salesperson",
    statement:
      "Three tables hold a small sales network. Salesperson(salesperson_id, name) lists the staff; Customer(customer_id, salesperson_id) attaches each customer to exactly one SERVING salesperson; Purchase(bill_id, customer_id, amount) logs each bill. A purchase qualifies for attribution when the customer who made it is served by a salesperson who owns MORE THAN ONE customer — the more-than-one test is evaluated on the customer's serving salesperson, so a purchase by a one-customer salesperson's customer counts for nobody. A salesperson's influence is the sum of the amounts of the purchases that qualify through their own served customers. Report salesperson_id, name, influence for EVERY salesperson — influence 0 when nothing qualifies — ordered by salesperson_id.",
    examples: [
      {
        input:
          "salesperson 1 (Ada) serves customers 11 and 12; customer 11 bills 120 and 80, customer 12 bills 250",
        output: "1 · Ada · 450",
        explanation:
          "Ada owns two customers, so every purchase her customers made qualifies: 120 + 80 + 250 = 450 arrives on her one output row.",
      },
      {
        input: "salesperson 3 (Cleo) serves exactly one customer (31), which bills 90 and 60",
        output: "3 · Cleo · 0",
        explanation:
          "The more-than-one test fails for Cleo, so customer 31's purchases are disqualified — and since attribution runs through serving, they count for nobody. Cleo still ships a row, at 0.",
      },
    ],
    constraints: [
      "every Salesperson row appears exactly once, ordered by salesperson_id — a salesperson with no qualifying purchases reports 0, never missing and never NULL",
      "a purchase qualifies only when the purchasing customer's SERVING salesperson owns more than one customer (COUNT over Customer grouped by salesperson_id, greater than 1)",
      "columns salesperson_id, name, influence — influence is the sum of qualifying amounts (450 for Ada on this seed), 0 otherwise",
    ],
    breakdown: [
      "The rule's grammar runs purchase, then customer, then serving salesperson, and the more-than-one test rides on that serving salesperson. Customer is the table that owns the serving relationship, so the test is a GROUP BY salesperson_id HAVING COUNT(*) > 1 over Customer alone — Purchase knows nothing about salespeople and never should. Once the qualifying set exists, the report is a chain: Salesperson to its customers to their bills, summed per salesperson. A purchase by Cleo's customer 31 (bills of 90 and 60) is dead weight for every output row, because the only salesperson it could ever be attributed to fails the test.",
      "The 'every salesperson appears' contract is decided by join direction, twice over. Bram owns two customers but neither ever bought anything — a chain that INNER-joins into Purchase erases him; Cleo fails the more-than-one test, so a WHERE IN (qualifying set) erases her instead of zeroing her. LEFT JOINs from Salesperson keep both rows alive with NULLs on the purchase side, and SUM over an all-NULL group returns NULL — not 0 — which is why COALESCE(SUM(p.amount), 0) is load-bearing rather than cosmetic. Zeros that vanish and zeros that print as blank are different bugs with the same root: the output contract named who must appear, and only the join shapes honor it.",
      "Predicate placement is the subtle half of this query. The qualifying test inside the LEFT JOIN's ON clause only empties the customer side for a non-qualifying salesperson — the LEFT JOIN then re-fills the row with NULLs, and the salesperson stays in the report. The identical predicate in WHERE runs after both joins and deletes the failed salesperson's rows outright: Cleo drops from the output instead of printing 0. The fan-out is wanted — Ada's branch spreads into three bills (120, 80, 250) and SUM folds them — but any additional join into that branch would fan it further and inflate the sum, so the more-than-one test must FILTER the chain, never join into it.",
    ],
    edges: [
      "Cleo serves exactly one customer (31), which bills 90 and 60: a plain 'sum your customers' purchases' query reports 150 for her — the more-than-one test over Customer (one customer) zeroes her despite the purchases existing.",
      "Bram's customers 21 and 22 produced no bills: an INNER join into Purchase erases his row (2 output rows, not 3), and the LEFT JOIN's all-NULL branch makes SUM return NULL — COALESCE(..., 0) is what prints 0 rather than blank.",
      "The qualifying gate lives in the LEFT JOIN's ON clause: moved to WHERE it runs after both joins and deletes Cleo's rows outright — the output shrinks to Ada and Bram, losing the (3, 'Cleo', 0) row instead of zeroing it.",
      "Customer 11's two bills (120, 80) both ride Ada's single output row — the chain fans out per bill, which SUM wants (450 = 120 + 80 + 250); counting rows instead would report 3, a bill count wearing an influence label.",
    ],
    ladder: [
      { title: "Brute force — staff the ledger by hand", body: "For each salesperson, list their customers; if they serve more than one, add up every bill those customers made, otherwise write 0; print every salesperson even the zeros. Three manual steps the engine expresses as one gated join chain." },
      { title: "The pattern — qualifying set, gated chain, zero fill", body: "A CTE groups Customer by salesperson_id HAVING COUNT(*) > 1; Salesperson LEFT JOINs Customer with that gate inside the ON clause, then LEFT JOINs Purchase; SUM + COALESCE collapses each salesperson's branch." },
      { title: "The optimal idea — filters that preserve rows live in ON, not WHERE", body: "O(S + C + P). The durable rule: a predicate that may legitimately EMPTY a side of an outer join belongs in the ON clause — the same predicate in WHERE re-deletes the rows the LEFT JOIN preserved — and an aggregate over an all-NULL branch is NULL, so zero-filling is COALESCE's job." },
    ],
    approach: "Salesperson LEFT JOIN Customer (gated by a Customer HAVING COUNT(*) > 1 subquery inside ON) LEFT JOIN Purchase, SUM + COALESCE per salesperson",
    schema: {
      ddl: `CREATE TABLE Salesperson (
  salesperson_id INTEGER PRIMARY KEY,
  name           TEXT NOT NULL
);
CREATE TABLE Customer (
  customer_id    INTEGER PRIMARY KEY,
  salesperson_id INTEGER NOT NULL REFERENCES Salesperson(salesperson_id)
);
CREATE TABLE Purchase (
  bill_id     INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES Customer(customer_id),
  amount      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Salesperson (salesperson_id, name) VALUES
  (1, 'Ada'),
  (2, 'Bram'),
  (3, 'Cleo');
INSERT INTO Customer (customer_id, salesperson_id) VALUES
  (11, 1),  -- Ada serves two customers
  (12, 1),
  (21, 2),  -- Bram serves two, neither ever buys
  (22, 2),
  (31, 3);
INSERT INTO Purchase (bill_id, customer_id, amount) VALUES
  (101, 11, 120),
  (102, 11, 80),  -- customer 11 bills twice
  (103, 12, 250),
  (104, 31, 90),  -- Cleo's lone customer buys plenty
  (105, 31, 60);`,
      tables: [
        { name: "Salesperson", note: "3 staff — Ada, Bram, Cleo; all three must appear in the output" },
        { name: "Customer", note: "5 customers — Ada serves 11 and 12, Bram 21 and 22, Cleo 31 alone" },
        { name: "Purchase", note: "5 bills — customers 21 and 22 never bought; customer 31 bought twice but its server fails the test" },
      ],
    },
    code: `WITH qualifying AS (
    SELECT salesperson_id
    FROM Customer
    GROUP BY salesperson_id
    HAVING COUNT(*) > 1        -- the >1-customer test, on the SERVING salesperson
)
SELECT
    s.salesperson_id,
    s.name,
    COALESCE(SUM(p.amount), 0) AS influence   -- all-NULL branch -> NULL -> 0
FROM Salesperson s
LEFT JOIN Customer c
  ON c.salesperson_id = s.salesperson_id
 AND s.salesperson_id IN (SELECT salesperson_id FROM qualifying)  -- gate in ON, not WHERE
LEFT JOIN Purchase p
  ON p.customer_id = c.customer_id
GROUP BY s.salesperson_id, s.name
ORDER BY s.salesperson_id;`,
    walkthrough: [
      "The qualifying CTE groups Customer by salesperson_id: Ada holds 2 customers, Bram 2, Cleo 1 — HAVING COUNT(*) > 1 keeps ids 1 and 2 and drops 3.",
      "The join chain runs per salesperson: Ada's branch picks up customers 11 and 12 and their three bills (120, 80, 250) and sums to 450; Bram's branch picks up customers 21 and 22 but no bills, leaving an all-NULL branch; Cleo's branch is gated off entirely, and the LEFT JOIN re-fills her row with NULLs.",
      "COALESCE turns Bram's NULL into 0 and Cleo's NULL into 0, and ORDER BY salesperson_id ships (1, 'Ada', 450), (2, 'Bram', 0), (3, 'Cleo', 0) — all three staff, one positive influence.",
    ],
    time: "O(S + C + P) — one pass per table plus keyed joins",
    space: "O(S + C) — the qualifying set plus one output row per salesperson",
    followUps: [
      "Rank the salespeople by influence with ties broken by salesperson_id — which window or ORDER BY clause does it, and where do the two zeros land?",
      "Add the count of DISTINCT purchasing customers behind each influence — why do COUNT(c.customer_id) (2 for Bram) and COUNT(DISTINCT p.customer_id) (0 for Bram) diverge on the same join chain, and which one matches the influence contract?",
    ],
    related: ["sales-person", "employee-bonus", "find-the-team-size"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "sort-the-olympic-table",
    statement:
      "MedalStanding lists one row per country: (country, gold, silver, bronze). Print the standings exactly as a scoreboard would read them: columns country, gold, silver, bronze — countries with more gold first; among equal gold, more silver; among equal gold AND silver, more bronze; and when all three medal counts tie, the country whose name comes first alphabetically ranks higher. The whole table ships, one row per country, and the row order is the entire answer.",
    examples: [
      {
        input: "Elandia and Farwood each hold 2 gold, 1 silver, 3 bronze — identical rows except the name",
        output: "Elandia · 2 · 1 · 3 above Farwood · 2 · 1 · 3",
        explanation:
          "No medal count splits the pair, so the fourth key (country ascending) is the only thing left — a query without it can print the tie either way.",
      },
      {
        input: "Ivera holds 1 gold, 4 silver, 0 bronze; Hollow holds 1 gold, 2 silver, 9 bronze",
        output: "Ivera · 1 · 4 · 0 above Hollow · 1 · 2 · 9",
        explanation:
          "Equal gold, so silver decides: 4 beats 2. Hollow's higher bronze count and its earlier name both lose to the second key.",
      },
    ],
    constraints: [
      "one row per country, all four columns, no filtering and no aggregation — the full table in standing order",
      "key order is gold DESC, then silver DESC, then bronze DESC, then country ASC — each key is consulted only when every key before it ties",
      "the final country ASC key makes the order total: the seed's Elandia/Farwood pair ties on all three medals and must ship name-ascending",
    ],
    breakdown: [
      "No aggregation, no filtering, no joins — the entire task is a total order, and ORDER BY is the whole query. Multi-key sorting evaluates keys left to right: a later key is consulted only when every earlier key ties, so the key sequence gold, silver, bronze, country IS the ranking rule. The seed deliberately exercises every level of that ladder, which is why any shortcut (gold only, or gold then name) produces a different sequence. With order-graded output the row sequence is the answer — a correct-looking table in the wrong order is simply wrong.",
      "Directions attach per key, and the last one flips. Three DESC keys push the best medal counts upward; the final country ASC keeps the alphabet natural for the full tie. A query that ends country DESC — or a habit that applies one direction flag to the whole clause — would swap Elandia and Farwood and print the tie in reverse alphabetical order. Mixed-direction ORDER BY is ordinary SQL; the error is treating the clause as one switch instead of four.",
      "The last key is not cosmetic — it is what makes the output deterministic. Elandia and Farwood tie on all three medal counts, so without the country key the engine may ship the pair in either order: the same query can grade correct on one run and wrong on the next. Naming a final tiebreak that is unique across the table (country names are the primary key here) converts 'usually right' into a contract. Any time a report can tie, the query should already know which key settles it — the seed makes the cost of not knowing visible in row one.",
    ],
    edges: [
      "Elandia and Farwood tie on ALL three medals (2, 1, 3 each): a query without the country ASC key returns the pair in engine-dependent order — right on one run, wrong on the next.",
      "Dorwell (2, 1, 1) shares gold AND silver with the twins but holds less bronze, and its name sorts first: gold DESC plus country ASC alone prints Dorwell first instead of third — the bronze key is what demotes it.",
      "Ivera (1, 4, 0) against Hollow (1, 2, 9): equal gold, so silver decides 4 over 2 — both the higher bronze (9) and the earlier name (Hollow) lose to the second key.",
      "The seed's insertion order (Elandia, Farwood, Dorwell, Hollow, Ivera) differs from the standings in two rows — Ivera 4th, Hollow 5th — so SELECT * without ORDER BY ships storage order and grades wrong.",
    ],
    ladder: [
      { title: "Brute force — sort the cards by hand", body: "Lay the five rows out, sort by gold, split ties by silver, then bronze, then name. Exactly the multi-key ORDER BY, done slowly and with the same tie-break discipline." },
      { title: "The pattern — one ORDER BY, four keys", body: "ORDER BY gold DESC, silver DESC, bronze DESC, country ASC expresses the whole rule; the engine's sort handles the rest and the clause itself documents the ranking policy." },
      { title: "The optimal idea — a total order needs a unique final key", body: "O(n log n). The durable rule: any sortable report that can tie must carry a final unique tiebreak — otherwise the output is only probabilistically correct, and no amount of downstream checking can repair an unstable order." },
    ],
    approach: "One multi-key ORDER BY — gold DESC, silver DESC, bronze DESC, country ASC — with the ASC last key making the order total",
    schema: {
      ddl: `CREATE TABLE MedalStanding (
  country TEXT PRIMARY KEY,
  gold    INTEGER NOT NULL,
  silver  INTEGER NOT NULL,
  bronze  INTEGER NOT NULL
);`,
      seed: `INSERT INTO MedalStanding (country, gold, silver, bronze) VALUES
  ('Elandia', 2, 1, 3),  -- ties Farwood on all three medals
  ('Farwood', 2, 1, 3),  -- identical counts: only the name decides
  ('Dorwell', 2, 1, 1),  -- same gold+silver as the twins, less bronze
  ('Hollow', 1, 2, 9),   -- loses the silver break to Ivera
  ('Ivera', 1, 4, 0);`,
      tables: [
        { name: "MedalStanding", note: "5 countries — a full three-medal tie (Elandia/Farwood), a bronze break (Dorwell) and a silver break (Hollow/Ivera)" },
      ],
    },
    code: `SELECT
    country,
    gold,
    silver,
    bronze
FROM MedalStanding
ORDER BY
    gold    DESC,   -- more gold first
    silver  DESC,   -- splits gold ties
    bronze  DESC,   -- splits gold+silver ties
    country ASC;    -- final tiebreak: the full tie keeps name order`,
    walkthrough: [
      "gold DESC splits the table into a 2-gold block {Elandia, Farwood, Dorwell} and a 1-gold block {Hollow, Ivera} — the primary key already fixes which half leads.",
      "Inside the 2-gold block silver ties at 1, so bronze speaks: the twins' 3 beats Dorwell's 1, demoting the alphabetically-first name to third. Inside the 1-gold block silver speaks directly: Ivera's 4 beats Hollow's 2, and Hollow's 9 bronzes cannot help.",
      "Elandia and Farwood still tie on all three medals, so country ASC pins Elandia first. Final rows: (Elandia, 2, 1, 3), (Farwood, 2, 1, 3), (Dorwell, 2, 1, 1), (Ivera, 1, 4, 0), (Hollow, 1, 2, 9).",
    ],
    time: "O(n log n) — a five-row sort with the same shape at any scale",
    space: "O(n) — the sorted copy of the table",
    followUps: [
      "Add a total_medals column and order by it first — which seed rows change places, and how do computed columns interact with ORDER BY aliases?",
      "Report RANK() OVER (ORDER BY gold DESC, silver DESC, bronze DESC) beside the rows — which seed pair shares a rank, and how does that output differ from the strict total order?",
    ],
    related: ["rank-scores", "top-travellers", "the-report"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "change-null-values-in-a-table-to-the-previous-value",
    statement:
      "A meter writes one row per reading: Reading(reading_id, meter_value), where meter_value is NULL whenever the meter failed to report. Produce the forward-filled report: columns reading_id, filled — one row per reading, ordered by reading_id — where filled is meter_value when it reported, and otherwise the most recent non-NULL meter_value from a strictly EARLIER reading (a smaller reading_id). The seed guarantees the first reading reported (no leading NULL) and that no two consecutive readings are both NULL, so every gap has a predecessor to inherit from.",
    examples: [
      {
        input: "reading 3 failed to report; the previous reading (id 2) logged meter_value 0",
        output: "3 · 0",
        explanation:
          "0 is a genuine observation, not a gap — the fill inherits it exactly. A query that discards zeros, or COALESCEs NULLs to 0, cannot be trusted on this row.",
      },
      {
        input: "reading 5 failed to report; the earlier readings logged 120 (id 1), 0 (id 2) and 121 (id 4)",
        output: "5 · 121",
        explanation:
          "The fill is the MOST RECENT non-NULL strictly before id 5 — 121 from id 4, not the older 120, and never a later value such as id 6's 117.",
      },
    ],
    constraints: [
      "one row per reading, ordered by reading_id — no rows added, dropped or merged",
      "filled = meter_value when present; otherwise the nearest non-NULL value at a strictly smaller reading_id (the forward-only rule: a later value never backfills an earlier row)",
      "the seed guarantees reading 1 is non-NULL and no two consecutive readings are NULL; the query may rely on it, but a leading NULL would simply ship filled = NULL rather than inventing a value",
    ],
    breakdown: [
      "The report asks a per-row question that GROUP BY cannot even express: what is the latest reported value BEFORE this row? The honest SQL shape is a correlated subquery — for each row, re-open Reading, keep the strictly earlier rows whose meter_value IS NOT NULL, sort them by reading_id DESC, and keep LIMIT 1. COALESCE(meter_value, (...)) layers the two cases: a reported value passes through untouched, and only a NULL goes hunting for a predecessor. It is an argmax over a restricted predecessor set — which is exactly what 'most recent before me' means.",
      "The engine choice is worth documenting because the shortcuts fail in interesting ways. SQLite has no LAST_VALUE(...) IGNORE NULLS, the one-clause forward fill of other dialects, so the fill must be built by hand. The tempting MAX(meter_value) OVER (ORDER BY reading_id) lies: a running maximum fills reading 3 with max(120, 0) = 120 instead of its true predecessor 0, because meter values are not monotonic. The two-step window trick (COUNT(meter_value) OVER (ORDER BY reading_id) as a group id, then a self-join back to each group's non-NULL row) also works, but the correlated form states the rule in one readable clause — this dive documents the choice rather than hiding it.",
      "Direction is the contract the WHERE clause carries. Reading 6's 117 already exists in the table while reading 5 is being filled, and only the strict reading_id < guard keeps the future out — a later value must never backfill an earlier row. The seed's guarantees (first reading reported, no consecutive NULLs) mean the subquery always finds exactly one winner; drop them and the query stays correct — a leading NULL would fill NULL, and a NULL run would simply share a predecessor — but the report would need an agreed default to be useful. NULL and 0 are different animals: reading 2's zero is a genuine observation, and only an IS NOT NULL test — never a truthiness habit or a COALESCE-to-zero — respects that.",
    ],
    edges: [
      "Reading 2 logs meter_value 0 — a genuine observation: the fill for reading 3 is 0, and a query that excludes zeros from the predecessor pool (AND meter_value <> 0, or app-side truthiness) fills 3 with 120 instead.",
      "COALESCE(meter_value, 0) is not a forward fill: it happens to match on reading 3 (0) but prints 0 for reading 5 where 121 is the truth — one coincidental right answer is exactly how this bug ships unnoticed.",
      "Reading 6 (117) exists while reading 5 is being filled: any formulation without the strict reading_id < guard — or that sorts ASC and takes the first row — lets the future backfill 5.",
      "Reading 1 (120) is the seed's non-NULL anchor: a leading NULL would leave the predecessor set empty and the first row would ship filled = NULL — six rows still, one unfilled, which is why the guarantee is stated.",
    ],
    ladder: [
      { title: "Brute force — walk the timeline", body: "Sort by reading_id, walk the rows keeping the last non-NULL value in a variable, print it for every NULL row. That loop, unrolled per row, is exactly the correlated subquery." },
      { title: "The pattern — COALESCE plus a backward argmax", body: "COALESCE(meter_value, (SELECT ... WHERE reading_id < mine AND meter_value IS NOT NULL ORDER BY reading_id DESC LIMIT 1)) expresses present-value-passthrough and inherit-from-history in one expression." },
      { title: "The optimal idea — 'latest before me' is an argmax, not a MAX", body: "O(n squared) worst case, each probe a primary-key seek. The durable rule: the most recent qualifying predecessor is found by ORDER BY position DESC LIMIT 1 over a filtered predecessor set — never by MAX over the values, which answers a different (monotonic) question." },
    ],
    approach: "COALESCE(meter_value, correlated argmax over strictly earlier non-NULLs — ORDER BY reading_id DESC LIMIT 1), ordered by reading_id",
    schema: {
      ddl: `CREATE TABLE Reading (
  reading_id  INTEGER PRIMARY KEY,
  meter_value INTEGER  -- NULL when the meter failed to report
);`,
      seed: `INSERT INTO Reading (reading_id, meter_value) VALUES
  (1, 120),
  (2, 0),      -- a genuine zero reading, not a gap
  (3, NULL),   -- fills from id 2: 0
  (4, 121),
  (5, NULL),   -- fills from id 4: 121
  (6, 117);`,
      tables: [
        { name: "Reading", note: "6 readings — the first reported (120), a real zero at id 2, single NULLs at ids 3 and 5, and a later 117 that must never backfill" },
      ],
    },
    code: `SELECT
    r1.reading_id,
    COALESCE(
        r1.meter_value,            -- a reported value passes through
        (
            SELECT r2.meter_value
            FROM Reading r2
            WHERE r2.reading_id < r1.reading_id   -- strictly earlier: forward-only
              AND r2.meter_value IS NOT NULL      -- zeros qualify, NULLs do not
            ORDER BY r2.reading_id DESC           -- nearest predecessor first
            LIMIT 1
        )
    ) AS filled
FROM Reading r1
ORDER BY r1.reading_id;`,
    walkthrough: [
      "COALESCE passes reported values straight through: reading 1 keeps 120, reading 2 keeps its genuine 0, reading 4 keeps 121, reading 6 keeps 117.",
      "Readings 3 and 5 are NULL, so the correlated subquery runs: for reading 3 the nearest earlier non-NULL is reading 2's 0 — not reading 1's 120; for reading 5 it is reading 4's 121.",
      "ORDER BY reading_id ships (1, 120), (2, 0), (3, 0), (4, 121), (5, 121), (6, 117) — 117 never backfills 5, and the 0 at id 2 proves a zero is a value, not a gap.",
    ],
    time: "O(n squared) worst case — each row probes its predecessors, and the primary key turns each probe into a seek",
    space: "O(1) beyond the output rows",
    followUps: [
      "Fill a LEADING NULL with an agreed default — where does the default join the COALESCE chain, and why does a leading NULL need a policy while a mid-sequence NULL does not?",
      "Backfill instead: for each NULL report the NEXT non-NULL value AFTER it — which two characters of the subquery flip, and what happens to trailing NULLs?",
    ],
    related: ["find-cumulative-salary-of-an-employee", "running-total-for-different-genders", "biggest-window-between-events"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "form-a-chemical-bond",
    statement:
      "A chemistry catalogue models molecules as sets of atoms. Atom(atom_id, symbol) — atom_id is the element's catalogue number; Molecule(molecule_id, name); MoleculeAtom(molecule_id, atom_id) pairs each molecule with the atoms it contains. For each molecule report molecule_id, name, atom_one, atom_two — the symbols of its two smallest atoms BY ATOM_ID, with atom_one carrying the smaller of the two ids — one row per molecule, ordered by molecule_id. The seed guarantees every molecule contains at least two atoms, so both slots always fill.",
    examples: [
      {
        input: "molecule 1 (hydroxide) pairs atoms 1 (H) and 8 (O)",
        output: "1 · hydroxide · H · O",
        explanation:
          "Exactly two atoms, so both slots are forced — no ranking choice exists. H rides atom_one only because its id (1) is smaller than O's (8).",
      },
      {
        input: "molecule 2 (dolomite) pairs atoms 20 (Ca), 12 (Mg), 6 (C) and 8 (O)",
        output: "2 · dolomite · C · O",
        explanation:
          "The two smallest IDS are 6 and 8 — C and O. Mg and Ca stay out no matter how prominent they look in the formula, and 'Ca' would be the wrong atom_two despite sorting early.",
      },
    ],
    constraints: [
      "one row per molecule, ordered by molecule_id — a molecule holding 3 or 4 atoms still ships exactly once",
      "atom_one and atom_two carry the symbols of the two smallest atom_ids (atom_one the smaller); selection is by id, never by symbol and never by formula position",
      "the seed guarantees at least two atoms per molecule, so atom_two is never NULL here — a one-atom molecule would need an agreed convention before it could ship",
    ],
    breakdown: [
      "'The two smallest atoms of each molecule' is top-N-per-group, and ROW_NUMBER() OVER (PARTITION BY molecule_id ORDER BY atom_id) assigns the positions. ROW_NUMBER rather than RANK: ids are unique within a molecule here, but ROW_NUMBER's contract — strictly increasing positions — is what the pivot below relies on, while a duplicate id would hand RANK two rows at position 1. Positions 1 and 2 are the winners. The ranking key is atom_id, the catalogue number, not the symbol and not the position in a chemical formula — dolomite reads CaMg(CO3)2, yet its two smallest ids are 6 and 8, and the task says ids win.",
      "Collapsing the two winning rows back into one row per molecule is a conditional-aggregation pivot: MAX(CASE WHEN rn = 1 THEN symbol END) for atom_one and the rn = 2 twin for atom_two. MAX over a single value is that value, and MAX skips NULLs — so the rn = 1 aggregate ignores the NULL the rn = 2 row contributes, and vice versa. The GROUP BY molecule_id, name is what guarantees one output row per molecule no matter how many atoms it holds — hydroxide's 2 pair rows, dolomite's 4 and copper sulfate's 3 all collapse to one. Skip the pivot and ship the rn <= 2 rows raw, and the report has six rows of molecule-atom pairs instead of three rows of molecules.",
      "The join spine decides who can appear. Molecule drives the report: an INNER chain through MoleculeAtom into Atom happens to keep all three molecules here because every one has atoms, but the LEFT spine from Molecule is the form that would survive a molecule with no atoms. Direction the other way — building from Atom — would drag the catalogue's unreferenced elements (Fe, Ag) toward the output, where they belong to no molecule at all. The at-least-two-atoms guarantee is why atom_two needs no NULL story; lift the guarantee and the rn = 2 MAX returns NULL on its own, which is honest output provided the report promised it.",
    ],
    edges: [
      "Dolomite holds four atoms (20, 12, 6, 8): ranking by SYMBOL instead of id picks 'C' then 'Ca' — the true pair by id is 'C' then 'O', so the ranking key, not the alphabet, decides.",
      "Copper sulfate holds three atoms (29, 16, 8): a MIN(symbol)/MAX(symbol) shortcut reports 'Cu' and 'S' where the truth is 'O' and 'S' — only molecule 3 punishes it, because molecules 1 and 2 happen to agree by luck.",
      "Hydroxide's exactly two atoms force both slots: a ranking ordered by atom_id DESC prints O as atom_one and H as atom_two — swapped — and with only two members nothing else exposes the reversal.",
      "Fe (26) and Ag (47) sit in Atom with no MoleculeAtom rows: building the report FROM Atom fabricates output for elements that belong to no molecule — the output counts molecules (3), not atoms (13) or pairs (9).",
    ],
    ladder: [
      { title: "Brute force — collect, sort, slice", body: "Per molecule, gather its atom ids, sort them, take the two smallest and look up their symbols. The engine expresses the same three moves as a partitioned ROW_NUMBER plus a filter." },
      { title: "The pattern — rank, cut, pivot", body: "ROW_NUMBER() OVER (PARTITION BY molecule_id ORDER BY atom_id) numbers the pairs; WHERE rn <= 2 keeps the winners; MAX(CASE WHEN rn = 1/2 ...) collapses each molecule back to one row with the two symbols side by side." },
      { title: "The optimal idea — top-N-per-group is rank plus conditional aggregation", body: "O(P log P) over P pair rows. The durable rules: the ranking key (id, not symbol) defines 'smallest', and the pivot's GROUP BY is what restores the one-row-per-entity grain the report promises." },
    ],
    approach: "ROW_NUMBER over (PARTITION BY molecule_id ORDER BY atom_id), keep rn <= 2, pivot the two positions with MAX(CASE), one row per molecule",
    schema: {
      ddl: `CREATE TABLE Atom (
  atom_id INTEGER PRIMARY KEY,
  symbol  TEXT NOT NULL
);
CREATE TABLE Molecule (
  molecule_id INTEGER PRIMARY KEY,
  name        TEXT NOT NULL
);
CREATE TABLE MoleculeAtom (
  molecule_id INTEGER NOT NULL REFERENCES Molecule(molecule_id),
  atom_id     INTEGER NOT NULL REFERENCES Atom(atom_id),
  PRIMARY KEY (molecule_id, atom_id)
);`,
      seed: `INSERT INTO Atom (atom_id, symbol) VALUES
  (1, 'H'), (6, 'C'), (7, 'N'), (8, 'O'), (11, 'Na'), (12, 'Mg'),
  (16, 'S'), (17, 'Cl'), (19, 'K'), (20, 'Ca'),
  (26, 'Fe'), (29, 'Cu'), (47, 'Ag');
INSERT INTO Molecule (molecule_id, name) VALUES
  (1, 'hydroxide'),
  (2, 'dolomite'),
  (3, 'copper sulfate');
INSERT INTO MoleculeAtom (molecule_id, atom_id) VALUES
  (1, 1), (1, 8),                     -- hydroxide: exactly two atoms, both slots forced
  (2, 20), (2, 12), (2, 6), (2, 8),   -- dolomite: four atoms, the choice bites
  (3, 29), (3, 16),
  (3, 8);`,
      tables: [
        { name: "Atom", note: "13 catalogue elements, including Fe (26) and Ag (47) which no molecule references" },
        { name: "Molecule", note: "3 molecules — hydroxide (2 atoms), dolomite (4), copper sulfate (3)" },
        { name: "MoleculeAtom", note: "9 pairs — the only bridge; copper sulfate's Cu (29) ranks last of its three" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        m.molecule_id,
        m.name,
        a.symbol,
        ROW_NUMBER() OVER (
            PARTITION BY m.molecule_id
            ORDER BY a.atom_id      -- rank by catalogue number, NOT by symbol
        ) AS rn
    FROM Molecule m
    JOIN MoleculeAtom ma ON ma.molecule_id = m.molecule_id
    JOIN Atom a ON a.atom_id = ma.atom_id
)
SELECT
    molecule_id,
    name,
    MAX(CASE WHEN rn = 1 THEN symbol END) AS atom_one,   -- smaller id
    MAX(CASE WHEN rn = 2 THEN symbol END) AS atom_two    -- second smallest
FROM ranked
WHERE rn <= 2                 -- the two winners only
GROUP BY molecule_id, name    -- collapse back to one row per molecule
ORDER BY molecule_id;`,
    walkthrough: [
      "The join fans MoleculeAtom into (molecule, symbol, id) triples and the window numbers each molecule's atoms by id: dolomite's 20, 12, 6, 8 become positions 1 through 4 as C (6), O (8), Mg (12), Ca (20).",
      "rn <= 2 keeps two rows per molecule — hydroxide (H, O), dolomite (C, O), copper sulfate (O, S, with Cu's position 3 dropped) — and the MAX(CASE) pivot collapses each pair into one row: atom_one from position 1, atom_two from position 2.",
      "ORDER BY molecule_id ships (1, 'hydroxide', 'H', 'O'), (2, 'dolomite', 'C', 'O'), (3, 'copper sulfate', 'O', 'S') — three rows for nine pair rows, and Fe and Ag never surface.",
    ],
    time: "O(P log P) — P pair rows ranked within their partitions",
    space: "O(P) — the ranked pairs held until the pivot",
    followUps: [
      "Report the two LARGEST atoms beside the two smallest — which ORDER BY direction and which rn values, and can one ranked CTE feed both pivots?",
      "Handle a one-atom molecule explicitly with atom_two NULL — what does the pivot already produce for it, and what must the statement promise for that NULL to be unambiguous?",
    ],
    related: ["game-play-analysis-ii", "department-top-three-salaries", "occupations-pivot"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "concatenate-the-name-and-the-profession",
    statement:
      "Person lists people: (person_id, name, profession), where profession is one of 'doctor', 'actor', 'singer' or 'professor'. Build each person's badge — their name, one space, the profession's FIRST letter uppercased inside parentheses — so Ada the doctor badges as 'Ada (D)'. Report person_id, badge for every person, ordered by person_id.",
    examples: [
      {
        input: "person 4 is Dov, profession 'professor'",
        output: "4 · Dov (P)",
        explanation:
          "The initial is the first character of the full word, uppercased — 'professor' contributes 'P' — and the spacing is exactly name, space, (letter).",
      },
      {
        input: "person 3 is Cleo, profession 'singer'",
        output: "3 · Cleo (S)",
        explanation:
          "SUBSTR takes position 1 only, UPPER lifts 's' to 'S', and the concatenation glues four pieces — no comma, no trailing space.",
      },
    ],
    constraints: [
      "one row per person, ordered by person_id — name and profession are NOT NULL, so concatenation can never silently drop a row",
      "badge = name, one space, '(', the uppercased first character of profession, ')' — person 1's badge is exactly 'Ada (D)'",
      "the initial is SUBSTR(profession, 1, 1) uppercased — never the whole word, never lowercase, never a zero-based slice",
    ],
    breakdown: [
      "The badge is string assembly: four pieces — name, ' (', the uppercased initial, ')' — glued by ||, SQLite's concatenation operator. Unlike + in some engines, || never attempts arithmetic, so text concatenates without casts ('1' || '2' is '12'). The literals carry the format: the space lives inside ' (' and the parentheses are ordinary characters. Getting the badge right is mostly getting the literals right — the query has exactly one interesting expression and three pieces of punctuation.",
      "NULL propagation is the hazard worth naming: in SQL, NULL || anything is NULL. If name or profession could be NULL, the whole badge would silently vanish — no error, just an empty-looking cell — which is why the schema declares both columns NOT NULL and this dive states it. The same rule is useful in the other direction: WHERE badge IS NULL would list exactly the people whose pieces are incomplete. Propagation is not a bug to work around but a semantic to know — the concatenation chain is only as total as its weakest operand.",
      "The initial is SUBSTR(profession, 1, 1) — SQLite string positions are 1-based, so this reads the first character. The zero-based instinct fails here: SUBSTR(profession, 0, 1) returns the empty string, collapsing a badge to 'Bram ()'. UPPER then lifts the letter — 'professor' contributes 'P', not the whole word, and 'singer' contributes 'S' — and the four professions' initials D, A, S, P are all distinct, so the badge is a real tag. One expression, one case decision, one slice: the simplest dives still hide two off-by-one traps in plain sight.",
    ],
    edges: [
      "Person 4 ('professor') punishes the whole-word slice: UPPER(profession) prints 'Dov (PROFESSOR)', and only SUBSTR(..., 1, 1) plus UPPER yields 'P'.",
      "The literal ' (' carries the spacing: name || '(' prints 'Ada(D)' for person 1 — the expected badge is 'Ada (D)' with exactly one space.",
      "SUBSTR(profession, 0, 1) returns the empty string (positions are 1-based), collapsing person 2's badge to 'Bram ()' — the zero-based off-by-one in plain sight.",
      "Person 3 punishes the wrong end of the word: UPPER(SUBSTR(profession, -1, 1)) prints 'Cleo (R)' — the LAST character — where 'Cleo (S)' is the contract.",
    ],
    ladder: [
      { title: "Brute force — format by eye", body: "Read each row, write the name, append the parenthesized capitalized initial by hand. The engine does it with one concatenation expression, provided the slice and the case are right." },
      { title: "The pattern — slice, lift, glue", body: "SUBSTR(profession, 1, 1) takes the initial, UPPER lifts it, and name || ' (' || ... || ')' assembles the badge; ORDER BY person_id finishes the contract." },
      { title: "The optimal idea — respect the operator semantics you are standing on", body: "O(n). The durable rules: || propagates NULL silently (declare NOT NULL or plan for blanks), string positions are 1-based here, and format literals — the space, the parens — are part of the spec, not decoration." },
    ],
    approach: "name || ' (' || UPPER(SUBSTR(profession, 1, 1)) || ')' as badge, ordered by person_id",
    schema: {
      ddl: `CREATE TABLE Person (
  person_id  INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  profession TEXT NOT NULL CHECK (profession IN ('doctor', 'actor', 'singer', 'professor'))
);`,
      seed: `INSERT INTO Person (person_id, name, profession) VALUES
  (1, 'Ada', 'doctor'),
  (2, 'Bram', 'actor'),
  (3, 'Cleo', 'singer'),
  (4, 'Dov', 'professor');`,
      tables: [
        { name: "Person", note: "4 people, one per profession — doctor, actor, singer, professor — all NOT NULL" },
      ],
    },
    code: `SELECT
    person_id,
    name || ' (' || UPPER(SUBSTR(profession, 1, 1)) || ')' AS badge  -- 'Ada (D)'
FROM Person
ORDER BY person_id;`,
    walkthrough: [
      "Four people, one per profession: Ada/doctor, Bram/actor, Cleo/singer, Dov/professor — SUBSTR plus UPPER extracts D, A, S, P.",
      "The concatenation assembles each badge from four pieces: 'Ada' + ' (' + 'D' + ')' gives 'Ada (D)'; the same gluing yields 'Bram (A)', 'Cleo (S)' and 'Dov (P)'.",
      "ORDER BY person_id ships (1, 'Ada (D)'), (2, 'Bram (A)'), (3, 'Cleo (S)'), (4, 'Dov (P)') — four rows, all NOT NULL pieces, so nothing vanishes.",
    ],
    time: "O(n) — one pass, constant work per row",
    space: "O(n) — the output badges",
    followUps: [
      "Badge with the full lowercased profession in parentheses instead — which functions change, and why does 'professor' expose any LENGTH-based slicing?",
      "Order the report alphabetically by badge — what does the D/A/S/P mix sort to, and why should person_id remain the deterministic final key?",
    ],
    related: ["fix-names-in-a-table", "the-pads", "calculate-special-bonus"],
    order: "exact",
    xp: 10,
  },
];
