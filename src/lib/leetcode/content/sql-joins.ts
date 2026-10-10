// Deep-dives — the SQL 50 "Basic Joins" band (10 problems). Solutions are
// SQLite dialect, one statement each, and are engine-verified by
// scripts/lc-sql-verify.ts against the per-problem seed.
import type { LcSqlDive } from "../types";

export const SQL_JOINS: LcSqlDive[] = [
  {
    slug: "combine-two-tables",
    statement:
      "Person holds each user's id and name; Address holds city and state records, but only for people who have one on file. Report every person's first name, last name, city, and state — and when a person has no address row, their city and state must come out NULL rather than the person being dropped.",
    examples: [
      {
        input:
          "Person: (1,'Wang','Allen'),(2,'Alice','Bob'),(3,'Brown','Charlie'),(4,'Davis','Eve'),(5,'White','Frank') · Address: (1,2,'New York City','New York'),(2,4,'Seattle','Washington'),(3,3,'Chicago','Illinois')",
        output:
          "Allen Wang NULL NULL · Bob Alice New York City New York · Charlie Brown Chicago Illinois · Eve Davis Seattle Washington · Frank White NULL NULL",
        explanation:
          "Allen and Frank have no Address row, so their joined city/state are NULL — but they still appear, exactly once each.",
      },
    ],
    constraints: [
      "every Person row appears exactly once in the output",
      "a personId appears at most once in Address (no row fan-out)",
      "city/state are NULL exactly when the person has no Address row",
    ],
    breakdown: [
      "The question covers EVERY person, but the address data is optional per person. 'Every row of A, plus matching B where it exists' is the textbook trigger for a LEFT JOIN from A — an INNER JOIN would quietly delete Allen and Frank, which is precisely the failure this problem is built to expose.",
      "LEFT JOIN Person → Address keeps all five people and attaches city/state where personId matches; where it doesn't, SQLite synthesizes a row of NULLs on the address side. Nothing needs CASE, IFNULL or COALESCE — the NULL is not damage to repair, it is the requested representation of 'no address on file'.",
      "The classic misstep is reflexively writing INNER JOIN because 'joins connect tables'. The second classic is COALESCEing the NULLs into empty strings or 'N/A' — that changes the graded values. A third, subtler one: joining on the wrong pair — a.personId = p.personId is the shared identity; addressId is a surrogate key of Address and never participates.",
    ],
    edges: [
      "People with no address must survive as rows with NULL city/state — not dropped, not zero-filled.",
      "If a person could have TWO address rows, the join would fan them out into two output rows; the constraint forbids it, but know why the output stays at one row per person.",
      "Column order matters: firstName, lastName, city, state — in that order.",
      "Don't wrap the NULLs in COALESCE — the grader wants real NULLs.",
    ],
    ladder: [
      {
        title: "Brute force — loop and probe",
        body: "For each Person row, scan Address for a matching personId and print city/state or NULL. Correct, but that's a per-row lookup — the join operator performs the same work in one set-based pass.",
      },
      {
        title: "The pattern — outer join for optional data",
        body: "One side mandatory, the other optional ⇒ LEFT JOIN from the mandatory side. The same skeleton as employee-bonus and the unique-identifier lookup: this is the default join of reporting SQL.",
      },
      {
        title: "The optimal idea — LEFT JOIN and let NULL speak",
        body: "LEFT JOIN Address a ON a.personId = p.personId, project the four columns. One pass with PK-backed matching and no post-processing — nothing left to optimize.",
      },
    ],
    approach: "LEFT JOIN from the mandatory side; NULL is the answer",
    schema: {
      ddl: `CREATE TABLE Person (
  personId  INTEGER PRIMARY KEY,
  lastName  TEXT NOT NULL,
  firstName TEXT NOT NULL
);
CREATE TABLE Address (
  addressId INTEGER PRIMARY KEY,
  personId  INTEGER NOT NULL REFERENCES Person(personId),
  city      TEXT NOT NULL,
  state     TEXT NOT NULL
);`,
      seed: `INSERT INTO Person (personId, lastName, firstName) VALUES
  (1,'Wang','Allen'),
  (2,'Alice','Bob'),
  (3,'Brown','Charlie'),
  (4,'Davis','Eve'),
  (5,'White','Frank');
INSERT INTO Address (addressId, personId, city, state) VALUES
  (1,2,'New York City','New York'),
  (2,4,'Seattle','Washington'),
  (3,3,'Chicago','Illinois');   -- persons 1 and 5 deliberately have no address`,
      tables: [
        { name: "Person", note: "5 people — every one of them must appear" },
        { name: "Address", note: "3 address rows — persons 1 and 5 have none" },
      ],
    },
    code: `SELECT
    p.firstName,          -- from Person: always present
    p.lastName,
    a.city,               -- NULL when the person has no Address row
    a.state               -- NULL ditto — this IS the expected output
FROM Person p
LEFT JOIN Address a ON a.personId = p.personId
ORDER BY p.personId;`,
    walkthrough: [
      "FROM Person p anchors the result: five people in, five rows out, whatever Address happens to contain.",
      "The LEFT JOIN tries to attach each person's address. Bob, Charlie and Eve match and pick up real city/state values; Allen and Frank match nothing, so SQLite invents a NULL-filled address side for them instead of discarding the person.",
      "The join key is a.personId = p.personId — the shared identity. addressId is Address's own surrogate key and never enters the condition.",
      "ORDER BY personId is purely cosmetic (grading compares rows as a set), but a stable display order makes manual checking painless.",
    ],
    time: "O(n + m) — one pass with PK lookups into Address",
    space: "O(n) — the output",
    followUps: [
      "Reverse the lens: list every address with its person's name, including addresses whose personId has no Person row (LEFT JOIN from Address).",
      "Filter to people who DO have an address two ways — INNER JOIN vs LEFT JOIN + WHERE a.personId IS NOT NULL — and explain why both agree here.",
    ],
    related: ["employee-bonus", "replace-employee-id-with-unique-identifier", "customers-who-never-order"],
    order: "any",
    xp: 10,
  },
  {
    slug: "employees-earning-more-than-their-managers",
    statement:
      "One Employee table doubles as the staff list and the org chart: each row carries a salary plus a managerId pointing at another row of the same table, and the top bosses have none. List the names of employees who earn strictly more than their own direct manager.",
    examples: [
      {
        input:
          "Employee: (1,'Joe',70000,3),(2,'Henry',80000,4),(3,'Sam',60000,NULL),(4,'Max',90000,NULL),(5,'Linda',75000,1),(6,'Steve',65000,2),(7,'Karen',85000,3),(8,'Fred',50000,7)",
        output: "Joe · Karen · Linda",
        explanation:
          "Joe (70k) and Karen (85k) both out-earn their manager Sam (60k); Linda (75k) out-earns her manager Joe (70k). Steve and Fred earn less than their managers, and Sam and Max have no manager to compare against.",
      },
    ],
    constraints: [
      "managerId either references Employee.id or is NULL (no manager)",
      "compare against the DIRECT manager only, not the whole chain",
      "strictly greater — an equal salary does not qualify",
    ],
    breakdown: [
      "The twist is that one table plays two roles. For any employee row e, 'their manager' is another row m in the very same table with m.id = e.managerId. SQL has no notion of 'the same table twice' unless you alias it twice — which is exactly what a self-join is: Employee e (the reports) joined to Employee m (the managers).",
      "Once the two roles are named, the rest is mechanical: keep the pair only when e.salary > m.salary. Employees with NULL managerId (Sam, Max) never satisfy the join condition — NULL compared to anything is unknown — so they vanish from the result, which is correct: no manager, no comparison, no output row.",
      "Common missteps: joining e.managerId to the wrong alias (e.id instead of m.id), which compares everyone to themselves; flipping the comparison and reporting underpaid managers instead; or reaching for GROUP BY where no aggregation exists — this is a pure filtered join.",
    ],
    edges: [
      "NULL managerId rows must be excluded by the join itself — NULL = anything never matches, so no extra WHERE is needed.",
      "The comparison is strict: an employee earning exactly what their manager earns is not reported.",
      "A dangling managerId (pointing at a missing row) would silently drop that employee under an inner self-join — fine here, but say it out loud in an interview.",
      "A self-join looks quadratic — n² candidate pairs — but the equality on the PK prunes each report to exactly one match.",
    ],
    ladder: [
      {
        title: "Brute force — two passes and a dict",
        body: "Pull every (employee, managerId) pair, look up each manager's salary in a second pass, compare in application code. Two scans and a hand-rolled hash — the self-join fuses them.",
      },
      {
        title: "The pattern — one table, two aliases",
        body: "Model a relationship stored inside one table by joining it to itself under two aliases: e.managerId = m.id. Self-joins are the standard tool for hierarchies, bill-of-materials and pairwise comparisons.",
      },
      {
        title: "The optimal idea — self-join + strict filter",
        body: "JOIN Employee m ON m.id = e.managerId WHERE e.salary > m.salary. Resolved through the PK index, the join is O(n log n); nothing further to squeeze.",
      },
    ],
    approach: "Self-join on managerId with a salary comparison",
    schema: {
      ddl: `CREATE TABLE Employee (
  id        INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  salary    INTEGER NOT NULL,
  managerId INTEGER REFERENCES Employee(id)
);`,
      seed: `INSERT INTO Employee (id, name, salary, managerId) VALUES
  (1,'Joe',70000,3),
  (2,'Henry',80000,4),
  (3,'Sam',60000,NULL),    -- manages Joe and Karen, earns less than both
  (4,'Max',90000,NULL),
  (5,'Linda',75000,1),     -- out-earns her manager Joe (70000)
  (6,'Steve',65000,2),     -- underpaid vs Henry (80000): must NOT appear
  (7,'Karen',85000,3),     -- out-earns Sam (60000)
  (8,'Fred',50000,7);      -- underpaid vs Karen (85000)`,
      tables: [
        { name: "Employee", note: "8 rows; 3 reports out-earn their direct manager; bosses Sam and Max have managerId NULL" },
      ],
    },
    code: `SELECT
    e.name AS employee       -- the report, not the manager
FROM Employee e
JOIN Employee m
     ON m.id = e.managerId   -- m is the row e.managerId points at
WHERE e.salary > m.salary    -- strict: ties are not reported
ORDER BY e.name;`,
    walkthrough: [
      "Employee appears twice in the FROM, once per role: e is every potential report, m is every potential manager. The aliases are what keep the two roles apart — without them the query is meaningless.",
      "The ON clause walks the managerId edge: for each e it fetches the single m with m.id = e.managerId. Sam and Max have managerId NULL; NULL = anything is unknown, so their pairs are never produced and they drop out with no extra code.",
      "WHERE e.salary > m.salary keeps only the pairs where the report out-earns the boss: Joe over Sam, Karen over Sam, Linda over Joe. Steve and Fred fail the comparison and are discarded.",
      "SELECT e.name projects only the report's name — the manager's salary was scaffolding. ORDER BY makes the three-row answer stable for eyeballing; grading is order-insensitive.",
    ],
    time: "O(n log n) — self-join resolved through the PK index",
    space: "O(n) — join state plus output",
    followUps: [
      "Extend the output with the manager's name and the gap (e.salary - m.salary) — same join, richer projection.",
      "Which managers earn less than at least one of their reports? The same join grouped by m.id with HAVING COUNT(*) >= 1 — sketch it.",
    ],
    related: ["combine-two-tables", "confirmation-rate", "employee-bonus"],
    order: "any",
    xp: 10,
  },
  {
    slug: "duplicate-emails",
    statement:
      "A Person table logs one row per sign-up, and sloppy users mean the same email can be registered several times. Report every email that appears more than once — one row per duplicated address, no matter how many times it repeats.",
    examples: [
      {
        input: "Person: (1,'a@b.com'),(2,'c@d.com'),(3,'a@b.com'),(4,'e@f.com'),(5,'c@d.com'),(6,'a@b.com')",
        output: "a@b.com · c@d.com",
        explanation: "a@b.com appears 3 times and c@d.com twice; e@f.com appears once and is not reported. Each duplicated email yields exactly one output row.",
      },
    ],
    constraints: [
      "one output row per duplicated email, regardless of how many repeats",
      "count over the whole table — no other grouping window",
      "emails are compared as stored (case-sensitive here)",
    ],
    breakdown: [
      "'More than once' is a property of a GROUP, not of any single row — you cannot know an email repeats until you have seen the whole table. The translation is GROUP BY email, then filter the groups with HAVING COUNT(*) > 1. In the seed that grouping yields three buckets — a@b.com holding 3 rows, c@d.com holding 2, e@f.com holding 1 — and only the first two survive the filter. The count belongs to the bucket, never to any row inside it.",
      "WHERE vs HAVING is the real lesson. WHERE runs before grouping and sees individual rows; HAVING runs after and sees aggregates. Writing WHERE COUNT(*) > 1 is the classic error — not just wrong, but illegal in every engine. SQLite refuses it at parse time with 'misuse of aggregate function', so the failure is compiler-grade rather than a silently wrong answer — one of the few mistakes the database catches for you.",
      "The second trap is over-reporting: SELECT DISTINCT email alone lists every address once with no filtering at all. And since email is the group key, plain COUNT(*) is the right counter — COUNT(DISTINCT email) would always be 1 inside its own group, so the HAVING could never fire.",
    ],
    edges: [
      "Exactly-once emails are excluded; an email appearing 3 times is still exactly one output row.",
      "COUNT(*) is correct here because email is the grouping key; swapping in COUNT(DISTINCT email) silently breaks the HAVING.",
      "SQLite compares TEXT case-sensitively, so 'A@B.com' and 'a@b.com' are different emails — a production dedup would normalize case first; this spec does not.",
    ],
    ladder: [
      {
        title: "Brute force — sort and scan",
        body: "Sort the rows by email in application code and look for adjacent repeats, or count occurrences in a dictionary. Both re-implement GROUP BY + HAVING by hand.",
      },
      {
        title: "The pattern — aggregate, then filter groups",
        body: "GROUP BY the suspect key, HAVING on the count. This pair answers 'find the repeated things' in any table — duplicate users, hot items, anomaly spikes.",
      },
      {
        title: "The optimal idea — HAVING COUNT(*) > 1",
        body: "GROUP BY email HAVING COUNT(*) > 1 — one hash pass over the table. The self-join alternative (p1.email = p2.email AND p1.id < p2.id) works too but touches more rows.",
      },
    ],
    approach: "GROUP BY + HAVING COUNT(*) > 1",
    schema: {
      ddl: `CREATE TABLE Person (
  id    INTEGER PRIMARY KEY,
  email TEXT NOT NULL
);`,
      seed: `INSERT INTO Person (id, email) VALUES
  (1,'a@b.com'),
  (2,'c@d.com'),
  (3,'a@b.com'),
  (4,'e@f.com'),   -- singleton: must NOT be reported
  (5,'c@d.com'),
  (6,'a@b.com');   -- a@b.com now appears 3 times: still ONE output row`,
      tables: [
        { name: "Person", note: "6 sign-ups; a@b.com ×3, c@d.com ×2, e@f.com ×1" },
      ],
    },
    code: `-- one bucket per address; keep only buckets holding 2+ rows
SELECT
    p.email
FROM Person p
GROUP BY p.email
HAVING COUNT(*) > 1;`,
    walkthrough: [
      "GROUP BY p.email collapses the six rows into three buckets keyed by address: a@b.com (3 rows), c@d.com (2), e@f.com (1).",
      "HAVING inspects each bucket AFTER aggregation and keeps only those holding more than one row — it is the only aggregate-aware filter, and the reason WHERE cannot be used here.",
      "The SELECT list carries just the group key, so each surviving bucket emits its email once; the ids of individual rows never surface — the question asked which addresses repeat, not who repeated.",
    ],
    time: "O(n) — one hash-aggregate pass",
    space: "O(d) — one group per distinct email",
    followUps: [
      "List every row belonging to a duplicated email, with its id — window it: COUNT(*) OVER (PARTITION BY email).",
      "Interview classic: DELETE the duplicates keeping the smallest id — the same partition count powers the write version.",
    ],
    related: ["customers-who-never-order", "article-views-i", "not-boring-movies"],
    order: "any",
    xp: 10,
  },
  {
    slug: "customers-who-never-order",
    statement:
      "Customers lists every registered customer; Orders logs purchases, each tied to the customer who made it. Return the names of the customers who have never placed an order — the set of customers with zero matching rows in Orders.",
    examples: [
      {
        input:
          "Customers: (1,'Joe'),(2,'Henry'),(3,'Sam'),(4,'Max'),(5,'Alice'),(6,'Bob') · Orders: (1,3),(2,1),(3,3),(4,4)",
        output: "Henry · Alice · Bob",
        explanation:
          "Joe, Sam (twice) and Max have orders; Henry, Alice and Bob never appear in Orders and are the answer.",
      },
    ],
    constraints: [
      "every Orders.customerId resolves to a real customer",
      "customers with several orders must not appear at all",
      "output the customer name only",
    ],
    breakdown: [
      "This is an anti-join: keep left rows with NO right partner. The outer-join spelling is LEFT JOIN ... WHERE right.key IS NULL — for customers without orders the join synthesizes a NULL-filled Orders side, and demanding that NULL selects exactly the never-ordered crowd.",
      "The same set can be spelled NOT IN (SELECT customerId FROM Orders) or, more defensively, NOT EXISTS. All three describe one set difference; the LEFT JOIN version is shown because this band drills joins — and because the NULL-row mechanism deserves to be seen once, slowly.",
      "The misstep that inverts the answer: INNER JOIN + filtering, which keeps only customers WITH orders — the exact complement. A sneakier one is probing a nullable right column in the IS NULL test; here o.id is the Orders PK, guaranteed non-NULL on a real match, so it is a reliable signal of absence.",
    ],
    edges: [
      "Probe with a column that is NOT NULL when matched (o.id is the PK) — probing a nullable column can let real matches slip through the IS NULL test.",
      "NOT IN is safe here (customerId is NOT NULL) but dangerous in general: one NULL in the subquery and NOT IN returns nothing — prefer NOT EXISTS in production.",
      "Sam's two orders produce two joined rows, but both are filtered away; never-ordering customers each get exactly one synthesized row, so no DISTINCT is needed.",
    ],
    ladder: [
      {
        title: "Brute force — two queries and a diff",
        body: "Fetch all customer ids that appear in Orders, subtract them from the full roster in application code. Two round-trips and a hand-rolled diff — the anti-join does it in one statement.",
      },
      {
        title: "The pattern — LEFT JOIN + IS NULL",
        body: "Keep every left row, demand an unmatched right side. The synthesized NULL row is the fingerprint of absence — the same mechanism powers sales-person later in this band.",
      },
      {
        title: "The optimal idea — anti-join with a NOT NULL probe",
        body: "LEFT JOIN Orders o ON o.customerId = c.id WHERE o.id IS NULL. Hash anti-join, O(n + m); NOT EXISTS is the equally fast, NULL-proof spelling.",
      },
    ],
    approach: "LEFT JOIN + IS NULL anti-join",
    schema: {
      ddl: `CREATE TABLE Customers (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
CREATE TABLE Orders (
  id         INTEGER PRIMARY KEY,
  customerId INTEGER NOT NULL REFERENCES Customers(id)
);`,
      seed: `INSERT INTO Customers (id, name) VALUES
  (1,'Joe'),
  (2,'Henry'),
  (3,'Sam'),
  (4,'Max'),
  (5,'Alice'),
  (6,'Bob');
INSERT INTO Orders (id, customerId) VALUES
  (1,3),
  (2,1),
  (3,3),   -- Sam ordered twice: still zero effect on the output
  (4,4);   -- customers 2, 5, 6 never order`,
      tables: [
        { name: "Customers", note: "6 customers — Henry, Alice and Bob never order" },
        { name: "Orders", note: "4 orders; Sam ordered twice" },
      ],
    },
    code: `SELECT
    c.name AS customers
FROM Customers c
LEFT JOIN Orders o
       ON o.customerId = c.id   -- attach this customer's orders, if any
-- no order matched ⇒ this customer never ordered
WHERE o.id IS NULL;`,
    walkthrough: [
      "The LEFT JOIN pairs each customer with their orders: Joe with one, Sam with two, Max with one. Henry, Alice and Bob match nothing, so SQLite hands them a synthesized Orders side made of NULLs.",
      "WHERE o.id IS NULL keeps only those unmatched rows. The probe is trustworthy because o.id is the Orders primary key — on any genuine match it would be non-NULL, so IS NULL can only mean 'no order ever matched'.",
      "Projecting c.name yields exactly Henry, Alice and Bob, one row each — no DISTINCT needed, since each never-ordering customer produced exactly one synthesized row.",
    ],
    time: "O(n + m) — hash anti-join",
    space: "O(k) — the output only",
    followUps: [
      "Flip the predicate: customers WITH at least one order (o.id IS NOT NULL, or EXISTS) — and note why the INNER JOIN spelling gives the same rows here.",
      "LEFT JOIN + GROUP BY c.id with COUNT(o.id) to get every customer's order count including zeros — COUNT(*) would report 1 for the customers at zero.",
    ],
    related: ["combine-two-tables", "sales-person", "duplicate-emails"],
    order: "any",
    xp: 10,
  },
  {
    slug: "article-views-i",
    statement:
      "Views is a reading log: each row records an article, the author who wrote it, the viewer who read it, and the date. Report the id of every author who has read their own article — the author appearing as a viewer of their own work.",
    examples: [
      {
        input:
          "Views (article_id, author_id, viewer_id, view_date), 12 rows — the self-views (author = viewer): (2,7,7,'2019-08-01'), (3,4,4,'2019-07-21') twice, (1,3,3,'2019-08-05'), (5,7,7,'2019-08-06'), (6,9,9,'2019-08-06'); every other row has viewer ≠ author, e.g. (7,7,4,'2019-08-07')",
        output: "3 · 4 · 7 · 9",
        explanation:
          "Author 4 self-viewed article 3 twice (one id), author 7 self-viewed articles 2 and 5 (one id), authors 3 and 9 self-viewed once each. The last row is author 7's article read by someone else — it adds nothing.",
      },
    ],
    constraints: [
      "a self-view is a row where author_id = viewer_id",
      "each qualifying author appears once, no matter how many self-views",
      "the output column is named id",
    ],
    breakdown: [
      "Read the predicate carefully: author and viewer are two COLUMNS of the same row. No join is needed at all — the comparison is intra-row (WHERE author_id = viewer_id). Reaching for a self-join here is the reflex to unlearn; everything needed to decide sits inside one tuple.",
      "The second requirement is one row per author. Author 4 has two identical self-view rows and author 7 self-viewed two different articles — both must collapse to a single id. That is DISTINCT on the projected column, applied after the filter.",
      "The misstep family: forgetting DISTINCT (4 and 7 come out twice), DISTINCTing the whole row (a no-op — rows already differ), or joining Views to itself on article_id, which manufactures cross-row matches that have nothing to do with self-reading.",
    ],
    edges: [
      "Two identical self-view rows (author 4) and two different-article self-views (author 7) — DISTINCT on author_id handles both; DISTINCT * handles neither better.",
      "A viewer who is an author reading SOMEONE ELSE's article (viewer 4 reading author 7's article 7) must not leak into the output — author_id = viewer_id is per-row, not per-person.",
      "Alias the output column to id; the expected column is named id, not author_id.",
      "If nobody ever self-viewed, the correct answer is zero rows — don't invent a default.",
    ],
    ladder: [
      {
        title: "Brute force — scan and set",
        body: "Iterate the log; whenever author_id equals viewer_id, add the author to a set; emit the set. The set is doing DISTINCT's job by hand.",
      },
      {
        title: "The pattern — intra-row predicate, then dedupe",
        body: "Two independent steps: filter rows on a column-to-column comparison, then dedupe the projection. Most 'find the X where …' problems decompose exactly this way.",
      },
      {
        title: "The optimal idea — one scan, DISTINCT on output",
        body: "SELECT DISTINCT author_id WHERE author_id = viewer_id. A single pass plus a hash set — no join, no group, nothing else.",
      },
    ],
    approach: "Intra-row filter + DISTINCT",
    schema: {
      ddl: `CREATE TABLE Views (
  view_id   INTEGER PRIMARY KEY,   -- synthetic key; LeetCode's Views has none
  article_id INTEGER NOT NULL,
  author_id  INTEGER NOT NULL,
  viewer_id  INTEGER NOT NULL,
  view_date  TEXT NOT NULL
);`,
      seed: `INSERT INTO Views (view_id, article_id, author_id, viewer_id, view_date) VALUES
  (1,1,3,5,'2019-08-01'),
  (2,3,4,5,'2019-08-01'),
  (3,1,3,6,'2019-08-02'),
  (4,2,7,7,'2019-08-01'),   -- author 7 reads own article 2
  (5,2,7,6,'2019-08-02'),
  (6,4,7,1,'2019-07-22'),
  (7,3,4,4,'2019-07-21'),   -- author 4 reads own article 3
  (8,3,4,4,'2019-07-21'),   -- exact duplicate row: still one author id
  (9,1,3,3,'2019-08-05'),   -- author 3 reads own article 1
  (10,5,7,7,'2019-08-06'),  -- author 7 again, different article
  (11,6,9,9,'2019-08-06'),  -- author 9 reads own article 6
  (12,7,7,4,'2019-08-07');  -- trap: viewer 4 is an author elsewhere, but 4 ≠ 7`,
      tables: [
        { name: "Views", note: "12 reads including a doubled self-view row (author 4) and a two-article self-viewer (author 7); view_id is a synthetic key standing in for LeetCode's keyless Views" },
      ],
    },
    code: `-- one row per author who appears as the reader of their own work
SELECT DISTINCT
    v.author_id AS id
FROM Views v
WHERE v.author_id = v.viewer_id;`,
    walkthrough: [
      "WHERE v.author_id = v.viewer_id compares two columns WITHIN each row — article 3 read by its own author (3,4,4) qualifies; author 7's article read by viewer 4 (7,7,4) does not. One table, zero joins.",
      "DISTINCT deduplicates the projection. Author 4's two identical self-view rows collapse into a single 4, and author 7's self-reads of articles 2 and 5 collapse into a single 7 — the output is authors, not readings.",
      "The alias AS id names the column the way the expected output does, and the final set {3, 4, 7, 9} is exactly every author who appears on both sides of their own log entry.",
    ],
    time: "O(n) — single scan plus hash dedupe",
    space: "O(a) — one entry per distinct self-viewing author",
    followUps: [
      "Count self-views per author — GROUP BY author_id with COUNT(*): notice how DISTINCT and GROUP BY trade places depending on whether you want entities or occurrences.",
      "Authors whose articles were never read by anyone else: author_id NOT IN (SELECT viewer_id FROM Views) — an anti-join living entirely inside one table.",
    ],
    related: ["article-views-ii", "duplicate-emails", "not-boring-movies"],
    order: "any",
    xp: 10,
  },
  {
    slug: "article-views-ii",
    statement:
      "The same Views log, a harder question: find the viewers who read at least two DIFFERENT articles on a single day — same viewer, same date, two or more distinct article ids. Report each such viewer's id once.",
    examples: [
      {
        input:
          "Views (article_id, author_id, viewer_id, view_date): (1,3,5,'2019-08-01'),(1,3,6,'2019-08-02'),(2,8,8,'2019-08-01'),(3,4,4,'2019-08-01'),(4,7,4,'2019-08-01'),(5,8,8,'2019-08-01'),(5,9,6,'2019-08-03'),(6,10,6,'2019-08-04'),(7,11,5,'2019-08-05') twice",
        output: "4 · 8",
        explanation:
          "Viewer 4 read articles 3 and 4 on 2019-08-01 and viewer 8 read articles 2 and 5 the same day. Viewer 6 spread two articles across different days, and viewer 5's two rows on 2019-08-05 are the same article read twice — neither qualifies.",
      },
    ],
    constraints: [
      "group per (viewer_id, view_date)",
      "only DISTINCT article ids count toward the threshold",
      "output each qualifying viewer's id once, column named id",
    ],
    breakdown: [
      "The counting unit is a (viewer, day) cell — 'the same day' adds a second grouping column. GROUP BY viewer_id, view_date slices the log into per-viewer-per-day buckets; grouping by viewer alone would merge all their days and wrongly flag viewer 6, who read two articles across three different days.",
      "Inside each bucket the question is 'how many DIFFERENT articles' — COUNT(DISTINCT article_id), not COUNT(*). Viewer 5 read article 7 twice on 2019-08-05: COUNT(*) says 2 and would falsely qualify them; the DISTINCT collapses the repeat to 1. The seed contains exactly this pair of look-alike cases.",
      "HAVING does the > 1 test because it filters groups after aggregation — WHERE cannot see counts. One more wrinkle: a viewer can qualify on several days, so the grouped query could emit the same id twice; the final DISTINCT guarantees one row per qualifying viewer.",
    ],
    edges: [
      "The same article twice in one day is NOT two articles — the DISTINCT inside the count is the whole ballgame.",
      "Two articles on different days is NOT one busy day — that is exactly why view_date sits in the GROUP BY.",
      "The expected output column is id — alias viewer_id AS id.",
      "Duplicate log rows are realistic (double-fires); they must not inflate either count.",
    ],
    ladder: [
      {
        title: "Brute force — nested maps in app code",
        body: "Per viewer, build a map day → set of articles; report viewers with any set of size > 1. Correct, but it hand-rolls a two-level GROUP BY plus a DISTINCT aggregate.",
      },
      {
        title: "The pattern — two-column grouping with a DISTINCT count",
        body: "GROUP BY (viewer, date) + COUNT(DISTINCT article_id) HAVING > 1. Compound grouping keys and DISTINCT-inside-aggregates are the two tools most grouped queries are missing.",
      },
      {
        title: "The optimal idea — HAVING filters groups, DISTINCT dedupes viewers",
        body: "One statement: group per (viewer, day), HAVING COUNT(DISTINCT article_id) > 1, then DISTINCT the emitted ids. O(n) with a hash aggregate.",
      },
    ],
    approach: "Group by (viewer, day) + HAVING COUNT(DISTINCT article_id) > 1",
    schema: {
      ddl: `CREATE TABLE Views (
  view_id    INTEGER PRIMARY KEY,   -- synthetic key; LeetCode's Views has none
  article_id INTEGER NOT NULL,
  author_id  INTEGER NOT NULL,
  viewer_id  INTEGER NOT NULL,
  view_date  TEXT NOT NULL
);`,
      seed: `INSERT INTO Views (view_id, article_id, author_id, viewer_id, view_date) VALUES
  (1,1,3,5,'2019-08-01'),
  (2,1,3,6,'2019-08-02'),
  (3,2,8,8,'2019-08-01'),   -- viewer 8, article 2, day 1
  (4,3,4,4,'2019-08-01'),   -- viewer 4, article 3, day 1
  (5,4,7,4,'2019-08-01'),   -- viewer 4, article 4, day 1 → QUALIFIES
  (6,5,8,8,'2019-08-01'),   -- viewer 8, article 5, day 1 → QUALIFIES
  (7,5,9,6,'2019-08-03'),   -- viewer 6 across three days: decoy
  (8,6,10,6,'2019-08-04'),
  (9,7,11,5,'2019-08-05'),  -- viewer 5, same article twice, same day: decoy
  (10,7,11,5,'2019-08-05'); -- duplicate row — COUNT(*) would say 2`,
      tables: [
        { name: "Views", note: "10 reads — viewers 4 and 8 read two distinct articles on one day; viewer 6 is the cross-day decoy, viewer 5 the same-article-twice decoy" },
      ],
    },
    code: `SELECT DISTINCT
    v.viewer_id AS id                -- once per qualifying viewer
FROM Views v
GROUP BY v.viewer_id, v.view_date    -- the cell is (viewer, day)
-- keep only cells holding 2+ DIFFERENT articles that day
HAVING COUNT(DISTINCT v.article_id) > 1;`,
    walkthrough: [
      "GROUP BY viewer_id, view_date builds per-viewer-per-day cells: viewer 4's 2019-08-01 cell holds articles {3, 4}, viewer 8's holds {2, 5}, viewer 6's log splits into three single-article cells, viewer 5's 2019-08-05 cell holds article 7 twice.",
      "COUNT(DISTINCT article_id) sizes each cell by distinct articles: 2 for the qualifying cells, 1 everywhere else — including viewer 5's double-read of article 7, which counts once.",
      "HAVING > 1 keeps only cells holding two or more different articles — the group-level test that WHERE cannot express.",
      "DISTINCT over the emitted ids collapses a viewer who qualifies on multiple days into one row; here viewers 4 and 8 each qualify on exactly one day, and the output is 4 and 8.",
    ],
    time: "O(n) — one hash-aggregate pass (O(n log n) if the engine sorts)",
    space: "O(g) — one group per (viewer, day)",
    followUps: [
      "The busiest single day per viewer — MAX over the daily counts — needs the aggregate twice: sketch the CTE that computes daily counts first.",
      "Viewers who had such a day on TWO or more distinct days: wrap the qualifying (viewer, day) list in another GROUP BY viewer HAVING COUNT(*) >= 2.",
    ],
    related: ["article-views-i", "students-and-examinations", "average-selling-price"],
    order: "any",
    xp: 20,
  },
  {
    slug: "sales-person",
    statement:
      "Three tables run the sales floor: SalesPerson lists the reps, Company lists client firms, and Orders ties a rep to a firm for each sale. Return the names of reps who have never sold to the company named RED — reps with orders elsewhere, or with no orders at all, still qualify.",
    examples: [
      {
        input:
          "RED is com_id 1. Orders (com_id → sales_id): (1→1),(1→4),(1→1) hit RED; (3→4),(4→5),(3→2),(2→1),(5→3) hit other companies (com 5 is 'REDDISH'). Reps: John 1, Amy 2, Mark 3, David 4, Alex 5, Nora 6",
        output: "Amy · Mark · Alex · Nora",
        explanation:
          "John and David are the only reps with a RED order. Everyone else survives — including Mark, whose order is for 'REDDISH' (a different company), and Nora, who has no orders at all.",
      },
    ],
    constraints: [
      "match the company by exact name 'RED'",
      "any RED order excludes a rep entirely, whatever else they sold",
      "output each surviving rep's name once",
    ],
    breakdown: [
      "Two operations hide in one sentence: first determine WHICH orders are RED (Orders joined to Company on com_id, filtered by name), then find the reps absent from that set. Getting the order of operations right is the whole problem — the RED filter must be resolved BEFORE subtracting reps, never during.",
      "The subtraction is an anti-join: LEFT JOIN SalesPerson to the distilled RED-order set and keep the rows that came up empty. Because the forbidden set is computed first, Amy's two non-RED orders cannot duplicate her, and John's RED orders cannot sneak him back in through his non-RED order.",
      "The seductive wrong version joins all three tables directly, tucks c.name = 'RED' into the outer ON clause, and filters c.com_id IS NULL. It looks like the standard anti-join — but a rep with mixed orders (John: RED and ORANGE) resurrects via the ORANGE row, whose company side is NULL. Filter-in-ON only works when the predicate cannot split one entity's rows across matches; with multi-order reps it silently corrupts the answer.",
    ],
    edges: [
      "Filter the RED orders INSIDE the subquery; putting c.name = 'RED' in the outer LEFT JOIN's ON resurrects mixed-order reps like John.",
      "'REDDISH' is a different company — exact string equality; LIKE '%RED%' would wrongly evict Mark.",
      "Nora has no orders at all and still qualifies — absence of orders is absence of RED orders.",
      "John has two RED orders; the excluded side may duplicate freely, only the surviving side must be clean.",
    ],
    ladder: [
      {
        title: "Brute force — build the blacklist, subtract",
        body: "Scan Orders joined to Company for RED sales_ids in application code, then subtract that set from the rep roster. Two phases by hand — SQL composes them in one statement.",
      },
      {
        title: "The pattern — pre-filter, then anti-join",
        body: "Compute the forbidden set as a derived table first, then LEFT JOIN onto it and keep NULL matches. 'Distill the bad set, subtract it' scales to any exclude-by-property question.",
      },
      {
        title: "The optimal idea — CTE + LEFT JOIN … IS NULL",
        body: "A CTE of RED sales_ids, LEFT JOIN + IS NULL. NOT EXISTS is the equally correct production spelling; both run in O(p + o + c).",
      },
    ],
    approach: "Pre-filter RED orders, then anti-join (LEFT JOIN … IS NULL)",
    schema: {
      ddl: `CREATE TABLE SalesPerson (
  sales_id        INTEGER PRIMARY KEY,
  name            TEXT NOT NULL,
  salary          INTEGER NOT NULL,
  commission_rate INTEGER NOT NULL,
  hire_date       TEXT NOT NULL
);
CREATE TABLE Company (
  com_id INTEGER PRIMARY KEY,
  name   TEXT NOT NULL,
  city   TEXT NOT NULL
);
CREATE TABLE Orders (
  order_id   INTEGER PRIMARY KEY,
  order_date TEXT NOT NULL,
  com_id     INTEGER NOT NULL REFERENCES Company(com_id),
  sales_id   INTEGER NOT NULL REFERENCES SalesPerson(sales_id),
  amount     INTEGER NOT NULL
);`,
      seed: `INSERT INTO SalesPerson (sales_id, name, salary, commission_rate, hire_date) VALUES
  (1,'John',100000,6,'2006-04-01'),
  (2,'Amy',12000,5,'2010-05-01'),
  (3,'Mark',65000,12,'2008-12-05'),
  (4,'David',25000,7,'2007-08-17'),
  (5,'Alex',5000,10,'2007-02-03'),
  (6,'Nora',30000,8,'2011-06-01');   -- never orders anything
INSERT INTO Company (com_id, name, city) VALUES
  (1,'RED','Boston'),
  (2,'ORANGE','New York'),
  (3,'YELLOW','Boston'),
  (4,'GREEN','Austin'),
  (5,'REDDISH','Austin');            -- near-miss for substring matchers
INSERT INTO Orders (order_id, order_date, com_id, sales_id, amount) VALUES
  (1,'2014-01-01',3,4,100000),  -- David → YELLOW
  (2,'2014-02-01',4,5,5000),    -- Alex  → GREEN
  (3,'2014-03-01',1,1,50000),   -- John  → RED
  (4,'2014-04-01',1,4,25000),   -- David → RED
  (5,'2014-05-01',3,2,80000),   -- Amy   → YELLOW
  (6,'2014-06-01',2,1,20000),   -- John  → ORANGE (mixed orders!)
  (7,'2014-07-15',1,1,15000),   -- John  → RED again
  (8,'2014-07-20',5,3,12000);   -- Mark  → REDDISH, NOT RED`,
      tables: [
        { name: "SalesPerson", note: "6 reps; Nora never sells" },
        { name: "Company", note: "5 firms; 'RED' (com 1) and 'REDDISH' (com 5) are different companies" },
        { name: "Orders", note: "8 orders; the RED orders are 3, 4, 7 — John ×2 and David" },
      ],
    },
    code: `WITH red_sellers AS (
    -- step 1: distill the reps who have touched RED (filter BEFORE subtracting)
    SELECT o.sales_id
    FROM Orders o
    JOIN Company c ON c.com_id = o.com_id
    WHERE c.name = 'RED'             -- exact match: 'REDDISH' does NOT match
)
SELECT
    sp.name
FROM SalesPerson sp
LEFT JOIN red_sellers r
       ON r.sales_id = sp.sales_id   -- attach this rep's RED evidence, if any
WHERE r.sales_id IS NULL             -- none found ⇒ never sold to RED
ORDER BY sp.name;`,
    walkthrough: [
      "red_sellers distills the three-table story to one column: join Orders to Company, keep only RED rows, project sales_id. John appears twice (orders 3 and 7) and David once — duplication on the forbidden side is harmless.",
      "The LEFT JOIN hangs RED evidence onto each rep. Amy, Mark, Alex and Nora find nothing and receive a NULL-filled r side; John and David match real rows.",
      "WHERE r.sales_id IS NULL keeps the evidence-free reps. Because the filter already happened inside the CTE, John's ORANGE order (order 6) never reaches this join — the bug it would cause is documented in the breakdown.",
      "The projection is just the name, once per surviving rep; ORDER BY is cosmetic and grading compares sets.",
    ],
    time: "O(p + o + c) — three linear passes",
    space: "O(r) — the RED rep set",
    followUps: [
      "Rewrite with NOT EXISTS (SELECT 1 FROM Orders o JOIN Company c ON c.com_id = o.com_id WHERE o.sales_id = sp.sales_id AND c.name = 'RED') and argue which version you would ship.",
      "Count each rep's RED orders INCLUDING zeros — LEFT JOIN the CTE and COUNT(r.sales_id), noticing why COUNT(*) would lie.",
    ],
    related: ["customers-who-never-order", "sales-analysis-ii", "employee-bonus"],
    order: "any",
    xp: 10,
  },
  {
    slug: "sales-analysis-i",
    statement:
      "Product is the catalog; Sales logs each sale with the product sold, the quantity, and the unit price. Find the best seller — the product with the highest total quantity sold — and report its product_name, including every product tied at the top.",
    examples: [
      {
        input:
          "Product: (100,'Nokia 1100'),(200,'Nokia 3210'),(300,'Nokia 8800') · Sales (product_id, quantity, price): (100,10,5000),(200,8,5000),(300,7,6000),(100,5,3000),(200,7,4000)",
        output: "Nokia 1100 · Nokia 3210",
        explanation:
          "Totals: Nokia 1100 = 10 + 5 = 15, Nokia 3210 = 8 + 7 = 15, Nokia 8800 = 7. The top is a tie, so both names are reported.",
      },
    ],
    constraints: [
      "rank by SUM(quantity); price is ignored",
      "every product tied for the top total is reported",
      "output product_name only",
    ],
    breakdown: [
      "The grain moves from sale to product: sum quantities per product_id, then compare products. That is a two-stage query — aggregate first, then select the winner(s) — and the stages cannot be fused because 'the maximum of the totals' does not exist until the totals do.",
      "The winner-finding trick: compute MAX(total) in a scalar subquery over the same aggregated CTE, then keep every row equal to it. MAX ignores ties naturally — all rows at the top score survive, so both Nokias come through. In the seed Nokia 1100 and Nokia 3210 both total 15 while Nokia 8800 sits at 7, so the equality test returns exactly two rows — tie-awareness LIMIT 1 simply does not have.",
      "The popular near-miss is ORDER BY total DESC LIMIT 1: it returns ONE row, silently dropping the tie the seed contains. The other classic, MAX(SUM(quantity)), is illegal nesting — aggregates do not compose; the CTE exists precisely to give SUM a finished value for MAX to consume.",
    ],
    edges: [
      "Ties at the top must ALL be reported — LIMIT 1 answers a different question.",
      "Sum quantity, not revenue: SUM(quantity * price) is a different leaderboard.",
      "A product absent from Sales never enters the race (the aggregation starts from Sales) — fine here, since zero can't be the max.",
      "The scalar subquery re-reads the CTE; SQLite computes it once — don't fear the nesting.",
    ],
    ladder: [
      {
        title: "Brute force — dictionary and a scan",
        body: "Sum quantities per product in a dictionary, scan for the maximum, collect every product hitting it. Three hand-rolled steps over data the engine can aggregate in one pass.",
      },
      {
        title: "The pattern — leaderboard, then cut at the top",
        body: "Aggregate into a CTE, then compare against MAX of that same CTE. 'Build the leaderboard, read the top score, take everyone at the top' generalizes to any top-k-with-ties question.",
      },
      {
        title: "The optimal idea — WHERE total = MAX(total)",
        body: "CTE totals + WHERE t.total = (SELECT MAX(total) FROM totals). The window alternative — RANK() OVER (ORDER BY total DESC) = 1 — is the same answer with more machinery.",
      },
    ],
    approach: "Aggregate to totals, keep everything tied at the MAX",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,   -- synthetic key; LeetCode's Sales has none
  product_id INTEGER NOT NULL REFERENCES Product(product_id),
  quantity   INTEGER NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES
  (100,'Nokia 1100'),
  (200,'Nokia 3210'),
  (300,'Nokia 8800');
INSERT INTO Sales (sale_id, product_id, quantity, price) VALUES
  (1,100,10,5000),
  (2,200,8,5000),
  (3,300,7,6000),
  (4,100,5,3000),
  (5,200,7,4000);   -- product 200 reaches 15 and ties product 100`,
      tables: [
        { name: "Product", note: "3 products" },
        { name: "Sales", note: "5 sales; totals 100→15, 200→15, 300→7 — a deliberate tie for first" },
      ],
    },
    code: `WITH totals AS (
    -- the leaderboard: one row per product, total units sold
    SELECT
        s.product_id,
        SUM(s.quantity) AS total
    FROM Sales s
    GROUP BY s.product_id
)
SELECT
    p.product_name
FROM totals t
JOIN Product p ON p.product_id = t.product_id    -- id → name
WHERE t.total = (SELECT MAX(total) FROM totals)  -- everything AT the top survives
ORDER BY p.product_name;`,
    walkthrough: [
      "totals aggregates the five sales into three leaderboard rows: 100→15, 200→15, 300→7. Product 100's two sales merge here — no filter on raw rows could ever see a total.",
      "The scalar subquery computes the top score once: MAX(total) = 15. Comparing each row to the max — rather than fetching the max row — is what lets ties through.",
      "The join to Product resolves ids to names for the surviving rows; both 15s qualify, so both Nokia names come back and 8800 is out.",
      "ORDER BY product_name merely orders the tie; grading treats the two rows as a set.",
    ],
    time: "O(s + p) — one aggregate pass plus one max scan",
    space: "O(p) — the leaderboard",
    followUps: [
      "Same answer via RANK(): join totals to Product and keep RANK() OVER (ORDER BY total DESC) = 1 — when would you prefer it? (When rank numbers are needed downstream.)",
      "Best seller per YEAR, if Sales carried a year — the MAX now lives per year; sketch how the subquery becomes a per-year window or a correlated comparison.",
    ],
    related: ["sales-analysis-ii", "sales-analysis-iii", "product-sales-analysis-ii"],
    order: "any",
    xp: 10,
  },
  {
    slug: "sales-analysis-ii",
    statement:
      "Product names the catalog; every Sales row records one buyer purchasing one product. Report the ids of buyers who purchased the product named 'S8' but never purchased the one named 'iPhone' — owning a G4 or a Pixel is irrelevant.",
    examples: [
      {
        input:
          "Product: (1,'S8'),(2,'G4'),(3,'iPhone'),(4,'Pixel') · Sales: buyer 1 → S8 + iPhone; buyer 2 → S8; buyer 3 → S8 + G4; buyer 4 → iPhone; buyer 5 → S8 twice; buyer 6 → iPhone twice; buyer 7 → S8 + Pixel",
        output: "2 · 3 · 5 · 7",
        explanation:
          "Buyer 1 bought both flagships and is out; buyers 4 and 6 never bought an S8 at all. The rest bought an S8 and steered clear of iPhones — repeat purchases (buyer 5) don't matter.",
      },
    ],
    constraints: [
      "match products by name through Product, never by hardcoded id",
      "a single iPhone purchase excludes the buyer",
      "output each qualifying buyer_id once",
    ],
    breakdown: [
      "Two named sets must be built before any subtraction: buyers-of-S8 and buyers-of-iPhone. Both names live in Product, so each set is one join away, and the answer is their difference. Assuming 'S8 is product 1' from the sample data works until the grader reorders the catalog — resolve names with joins, always.",
      "The subtraction is again an anti-join, here spelled NOT IN against a CTE of iPhone buyers. The CTE carries DISTINCT because one buyer can appear many times; duplication in the excluded set is harmless, but duplication in the SURVIVING set (buyer 5 bought an S8 twice) needs the outer DISTINCT.",
      "The missteps: forgetting the second condition entirely (all S8 buyers come back), comparing buyer ids to product ids (nonsense born of skipping the name resolution), and NOT IN over a nullable column — buyer_id is NOT NULL here so it is safe, but the moment NULLs are possible, NOT EXISTS is the defensive rewrite.",
    ],
    edges: [
      "Buyer 1 bought S8 AND iPhone → excluded; buyers 4 and 6 bought iPhone but no S8 → also excluded (they are not S8 buyers in the first place).",
      "Buyer 5's repeat S8 purchase would double-count without the outer DISTINCT.",
      "Name resolution must go through Product; hardcoding product_id = 1 couples the query to the seed's ordering.",
      "If the iPhone subquery could return NULLs, NOT IN would silently return zero rows — NOT EXISTS is the NULL-proof spelling.",
    ],
    ladder: [
      {
        title: "Brute force — three passes and a diff",
        body: "Resolve both product names to ids, bucket the buyers of each, subtract in application code. Three scans the engine fuses into two joins and a set difference.",
      },
      {
        title: "The pattern — two derived sets, subtracted",
        body: "Joins resolve names into sets; NOT IN / NOT EXISTS / LEFT JOIN-IS NULL subtracts them. Most 'A but not B' questions over named entities decompose this way.",
      },
      {
        title: "The optimal idea — CTE + NOT IN on resolved names",
        body: "CTE of iPhone buyers (join + DISTINCT), then join-to-S8 + NOT IN. O(s + p) — two linear passes and a hash subtract.",
      },
    ],
    approach: "Resolve names via joins, subtract with a NOT IN anti-join",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,   -- synthetic key; LeetCode's Sales has none
  buyer_id   INTEGER NOT NULL,
  product_id INTEGER NOT NULL REFERENCES Product(product_id),
  quantity   INTEGER NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES
  (1,'S8'),(2,'G4'),(3,'iPhone'),(4,'Pixel');
INSERT INTO Sales (sale_id, buyer_id, product_id, quantity, price) VALUES
  (1,1,1,1,2000),
  (2,1,3,1,3000),   -- buyer 1 also bought an iPhone → excluded
  (3,2,1,2,2000),
  (4,3,1,1,1500),
  (5,3,2,1,1000),   -- buyer 3: S8 + G4, no iPhone → stays
  (6,4,3,1,3000),   -- iPhone only, no S8 → out
  (7,5,1,2,2000),
  (8,5,1,1,2000),   -- buyer 5 bought S8 twice → outer DISTINCT matters
  (9,6,3,2,3000),   -- iPhone twice, never an S8 → out
  (10,7,1,1,2200),
  (11,7,4,1,1800);  -- buyer 7: S8 + Pixel → stays`,
      tables: [
        { name: "Product", note: "4 phones; names must be resolved through this table, never assumed" },
        { name: "Sales", note: "11 purchases; S8 buyers {1,2,3,5,7}, iPhone buyers {1,4,6}" },
      ],
    },
    code: `WITH iphone_buyers AS (
    -- the exclusion set: everyone who ever bought an iPhone
    SELECT DISTINCT
        s.buyer_id
    FROM Sales s
    JOIN Product p ON p.product_id = s.product_id
    WHERE p.product_name = 'iPhone'
)
SELECT DISTINCT
    s.buyer_id                  -- once per qualifying buyer
FROM Sales s
JOIN Product p ON p.product_id = s.product_id
WHERE p.product_name = 'S8'     -- must have bought THIS
  AND s.buyer_id NOT IN (SELECT buyer_id FROM iphone_buyers)  -- and never that
ORDER BY s.buyer_id;`,
    walkthrough: [
      "iphone_buyers resolves the iPhone name through Product and collects its buyers — {1, 4, 6} — with DISTINCT because repeat buyers produce repeat rows.",
      "The main query resolves 'S8' the same way, so the filter is by NAME, robust to catalog reordering; the S8 buyers in this seed are {1, 2, 3, 5, 7}.",
      "NOT IN subtracts the exclusion set: buyer 1 drops out (also an iPhone owner); 2, 3, 5, 7 survive. The outer DISTINCT squashes buyer 5's duplicate S8 rows to one.",
      "The output is buyer ids only, ascending for readability; grading is order-insensitive.",
    ],
    time: "O(s + p) — two join passes plus a hash subtract",
    space: "O(b) — the exclusion set",
    followUps: [
      "Symmetric difference: buyers of exactly one of S8/iPhone — two anti-joins, or an XOR of an EXISTS and a NOT EXISTS; sketch it.",
      "Convert to 'bought S8 AND iPhone' — the subtraction flips to an intersection; why does the iphone_buyers CTE survive unchanged?",
    ],
    related: ["sales-person", "sales-analysis-i", "sales-analysis-iii"],
    order: "any",
    xp: 10,
  },
  {
    slug: "sales-analysis-iii",
    statement:
      "Product is the catalog; Sales records each sale with its date, quantity, and price. Report the id and name of every product whose sales happened ONLY in the first quarter of 2019 — between 2019-01-01 and 2019-03-31 inclusive — with a single sale on any other date disqualifying it.",
    examples: [
      {
        input:
          "Product: (1,'Nokia 1100'),(2,'Nokia 3210'),(3,'Nokia 8800'),(4,'Nokia 3310'),(5,'Nokia 1050'),(6,'Nokia 6600') · Sales (product_id, sale_date): (1,'2019-01-15'),(1,'2019-03-02'),(2,'2019-03-31'),(3,'2018-12-30'),(3,'2019-03-01'),(4,'2019-04-01'),(5,'2019-02-10'),(5,'2019-06-05'),(6,'2019-01-01'),(6,'2019-02-28')",
        output: "1 Nokia 1100 · 2 Nokia 3210 · 6 Nokia 6600",
        explanation:
          "Products 1, 2 and 6 sold only inside Q1 — 2019-03-31 and 2019-01-01 are boundary days and still count. Product 3 sold in Q1 but also in 2018, product 5 in Q1 and June: both tainted. Product 4 never sold in Q1.",
      },
    ],
    constraints: [
      "the window is 2019-01-01 to 2019-03-31, boundaries inclusive",
      "one sale outside the window disqualifies the product",
      "output product_id and product_name",
    ],
    breakdown: [
      "This is a purity question, not a presence question: 'sold in Q1' is necessary but nowhere near sufficient. The condition is a conjunction — at least one sale inside the window AND zero sales outside it — and the outside check is where the real work happens.",
      "The elegant tool is conditional aggregation: one GROUP BY per product, then SUM(CASE WHEN date outside the window THEN 1 ELSE 0 END) = 0 proves no stray sale, while the in-window sum being > 0 proves existence. Two verdicts from one grouped pass — no self-joins, no subqueries.",
      "The classic half-answer checks only 'has Q1 sales' and lets products 3 and 5 through. The classic second bug is sloppy boundaries: '2019-03-31' is IN the quarter while '2019-04-01' is out — with ISO 'YYYY-MM-DD' strings, BETWEEN with inclusive endpoints gets this right because the text compares chronologically.",
    ],
    edges: [
      "Boundary dates are inclusive: 2019-01-01 (product 6) and 2019-03-31 (product 2) must pass; 2019-04-01 (product 4) must fail.",
      "Q1 sales plus ANY outside sale (product 3's 2018-12-30, product 5's 2019-06-05) disqualify — earlier and later YEARS count as outside, not just other 2019 quarters.",
      "The GROUP BY starts from the join with Sales, so products with no sales vanish — correct: a product that never sold cannot be a Q1-only seller.",
      "strftime('%m', sale_date) works too, but BETWEEN on ISO strings is simpler and index-friendly; if you extract months, remember they arrive as '01'…'12' strings.",
    ],
    ladder: [
      {
        title: "Brute force — per-product scan",
        body: "For each product, walk its sales dates, flag any outside the window, keep the products with no flags and at least one sale. A hand-rolled conditional aggregation.",
      },
      {
        title: "The pattern — conditional SUMs in HAVING",
        body: "SUM(CASE WHEN predicate THEN 1 ELSE 0 END) inside HAVING turns a row-level predicate into a group-level verdict. The standard tool for 'all rows must… / no rows may…' questions.",
      },
      {
        title: "The optimal idea — two conditional sums, one GROUP BY",
        body: "GROUP BY product HAVING in_window_sum > 0 AND out_window_sum = 0 — one grouped pass. The join-flavored equivalent (Q1 rows LEFT JOIN out-of-window rows, IS NULL) costs more and reads worse.",
      },
    ],
    approach: "Quarter-purity via conditional SUMs in HAVING",
    schema: {
      ddl: `CREATE TABLE Product (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL
);
CREATE TABLE Sales (
  sale_id    INTEGER PRIMARY KEY,   -- synthetic key; LeetCode's Sales has none
  product_id INTEGER NOT NULL REFERENCES Product(product_id),
  sale_date  TEXT NOT NULL,         -- ISO 'YYYY-MM-DD': text order = date order
  quantity   INTEGER NOT NULL,
  price      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Product (product_id, product_name) VALUES
  (1,'Nokia 1100'),(2,'Nokia 3210'),(3,'Nokia 8800'),
  (4,'Nokia 3310'),(5,'Nokia 1050'),(6,'Nokia 6600');
INSERT INTO Sales (sale_id, product_id, sale_date, quantity, price) VALUES
  (1,1,'2019-01-15',5,1000),
  (2,1,'2019-03-02',3,1000),   -- product 1: Q1 only → IN
  (3,2,'2019-03-31',4,900),    -- last boundary day, still Q1 → IN
  (4,3,'2018-12-30',2,1200),
  (5,3,'2019-03-01',3,1200),   -- product 3: Q1 + 2018 → OUT
  (6,4,'2019-04-01',5,800),    -- product 4: one day late → OUT
  (7,5,'2019-02-10',1,700),
  (8,5,'2019-06-05',2,700),    -- product 5: Q1 + June → OUT
  (9,6,'2019-01-01',2,1100),
  (10,6,'2019-02-28',1,1100);  -- product 6: first boundary day + Feb → IN`,
      tables: [
        { name: "Product", note: "6 phones" },
        { name: "Sales", note: "10 sales straddling the Q1 boundary — products 1, 2, 6 are pure Q1; 3 and 5 are tainted; 4 missed Q1 entirely" },
      ],
    },
    code: `SELECT
    p.product_id,
    p.product_name
FROM Product p
JOIN Sales s ON s.product_id = p.product_id
GROUP BY p.product_id, p.product_name
HAVING
    SUM(CASE WHEN s.sale_date BETWEEN '2019-01-01' AND '2019-03-31'
             THEN 1 ELSE 0 END) > 0    -- sold at least once in Q1 ...
    AND
    SUM(CASE WHEN s.sale_date NOT BETWEEN '2019-01-01' AND '2019-03-31'
             THEN 1 ELSE 0 END) = 0    -- ... and never on any other date
ORDER BY p.product_id;`,
    walkthrough: [
      "The join puts every sale next to its product; GROUP BY (product_id, product_name) gathers each phone's complete sales history into one group.",
      "The first SUM counts in-window sales: products 1, 2, 3, 5, 6 each score at least 1; product 4 scores 0 and is already doomed.",
      "The second SUM counts out-of-window sales and demands ZERO: product 3's 2018-12-30 and product 5's 2019-06-05 each contribute 1 and evict their groups, while products 1, 2 and 6 pass both tests.",
      "The projection is id + name; ORDER BY product_id keeps the three survivors in catalog order (grading ignores it).",
    ],
    time: "O(s + p) — one pass to join, one grouped pass",
    space: "O(p) — the groups",
    followUps: [
      "Generalize: the same query for ANY window via parameters (:start, :end) — what breaks when the window crosses a year boundary? (Nothing: the string comparison still orders correctly.)",
      "The join-flavored rewrite: in-window sales LEFT JOIN out-of-window sales of the SAME product, keep the IS NULL side — write it and compare readability.",
    ],
    related: ["sales-analysis-i", "sales-analysis-ii", "not-boring-movies"],
    order: "any",
    xp: 10,
  },
];
