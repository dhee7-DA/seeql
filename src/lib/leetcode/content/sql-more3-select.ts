// Deep-dives — Select & Validation II, batch 4 (6 problems).
// Re-authored from the canonical LeetCode SQL tasks: own tables, own names,
// original phrasing — never copied problem text.
// Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_MORE3_SELECT: LcSqlDive[] = [
  {
    slug: "recyclable-and-low-fat-products",
    statement:
      "The Products catalog tags every product with two flags: low_fats and recyclable, each stored as 'Y' or 'N'. Find the ids of all products that are BOTH low-fat AND recyclable. Return a single column product_id, ordered by product_id.",
    examples: [
      {
        input: "flags (low_fats·recyclable): 0 Bran Cereal Y·Y · 1 Butter Y·N · 2 Cola N·N · 3 Couscous Y·Y",
        output: "0 · 3",
        explanation:
          "Only rows where both flags read 'Y' qualify — one failing flag is enough to reject, and Cola fails both without earning special treatment.",
      },
      {
        input: "4 Tofu Spread Y·Y — the same flag pair as Bran Cereal (id 0)",
        output: "both ids appear: 0 · 4",
        explanation:
          "The query reports products, not distinct flag combinations — two rows may share a flag pair and both must ship.",
      },
    ],
    constraints: [
      "low_fats and recyclable hold only 'Y' or 'N' — TEXT flags, not booleans",
      "one column: product_id, one row per qualifying product, no DISTINCT",
      "rows ordered by product_id",
    ],
    breakdown: [
      "Every SQL career starts here: a WHERE that ANDs two equality predicates. Each predicate is a binary question evaluated per row — low_fats = 'Y' — and AND keeps a row only when every question answers true. There is no weighting and no partial credit: a product that is recyclable but not low-fat fails exactly as hard as one that fails both. Conjunctive filters also compose for free — three flags would need three conditions and still one scan.",
      "Both flags are checked in WHERE, and the reason is structural: ON clauses exist to state how two tables pair up their rows, and this query joins nothing — there is exactly one table, so there is nothing to pair. Every condition in a single-table query is a row filter, and row filters live in WHERE. The distinction matters later: once a LEFT JOIN appears, moving a predicate between ON and WHERE can change which rows survive at all — but with no join in sight, WHERE is not just conventional, it is the only correct home.",
      "The last subtlety is the grain of the answer. Two different products can carry the same flag pair — the seed plants exactly that — and both must appear, because the question counts products, not flag combinations. Adding DISTINCT would silently merge two real products into one row and undercount the shelf. A durable habit: before writing SELECT, name the grain the question asks for (a product), then make sure every clause preserves it.",
    ],
    edges: [
      "The flags are string literals: low_fats = 'Y' with quotes — unquoted Y reads as a column reference and errors.",
      "Two rows share the Y·Y pair — a DISTINCT would delete a real product from the report.",
      "AND has no partial credit: Butter Y·N fails on one flag, Cola N·N fails on both — both are excluded all the same.",
      "ORDER BY product_id makes the output deterministic — without it the two qualifying rows could ship in engine order.",
    ],
    ladder: [
      { title: "Brute force — two queries and a merge", body: "Query each flag separately and intersect the id lists in application code, or eyeball a printed table. Two round trips (or zero rigor) where one WHERE suffices." },
      { title: "The pattern — ANDed equality predicates", body: "One pass, one WHERE, two equality predicates ANDed. The conjunction is the entire algorithm." },
      { title: "The optimal idea — conjunctions are index-friendly", body: "O(n) single scan; on a large catalog a composite index on (low_fats, recyclable) lets the engine skip non-qualifying rows outright — every extra AND condition shrinks the candidate set." },
    ],
    approach: "Single-table WHERE with two ANDed equality predicates, ordered by id",
    schema: {
      ddl: `CREATE TABLE Products (
  product_id INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  low_fats   TEXT NOT NULL CHECK (low_fats IN ('Y','N')),
  recyclable TEXT NOT NULL CHECK (recyclable IN ('Y','N'))
);`,
      seed: `INSERT INTO Products (product_id, name, low_fats, recyclable) VALUES
  (1024,'Soy Milk','Y','Y'),(5590,'Tofu Spread','Y','Y'),  -- the qualifying pair
  (8211,'Butter Substitute','Y','N'),(6733,'Rice Cakes','Y','N'),
  (3812,'Quinoa Water','N','Y'),(2901,'Kale Chips','N','Y'),
  (4411,'Cheddar Snack','N','N');`,
      tables: [
        { name: "Products", note: "7 rows — all four flag combos present, with the Y·Y combo duplicated (1024, 5590) as a DISTINCT trap" },
      ],
    },
    code: `SELECT
    product_id
FROM Products
WHERE low_fats = 'Y'        -- flag one: an ordinary equality predicate...
  AND recyclable = 'Y'      -- ...ANDed with flag two: both must hold
ORDER BY product_id;        -- deterministic output order`,
    walkthrough: [
      "The seed holds all four flag combinations: Y·Y (1024, 5590), Y·N (8211, 6733), N·Y (3812, 2901) and N·N (4411). The AND admits a row only when both equalities are true.",
      "1024 and 5590 pass both checks; 8211 and 6733 fail recyclable = 'Y', 3812 and 2901 fail low_fats = 'Y', and 4411 fails both — AND has no partial credit.",
      "The two survivors are distinct products that happen to share a flag pair — no DISTINCT is requested, so both ids ship, ordered 1024 then 5590.",
    ],
    time: "O(n) — one scan, two comparisons per row",
    space: "O(1) beyond the output rows",
    followUps: [
      "Flip the request to 'low-fat OR recyclable' — which one keyword change widens the qualifying set, and which seeded rows newly qualify?",
      "Count products per flag combination — GROUP BY low_fats, recyclable and check your four buckets against the seed.",
    ],
    related: ["invalid-tweets", "article-views-i", "not-boring-movies"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-users-with-valid-e-mails",
    statement:
      "The Users table lists account holders, each with an e-mail address. A mail is valid when it ends in exactly '@example.com' and its local part — everything before that @ — begins with a letter and then uses only letters, digits, dots, underscores or dashes. Report user_id, name and mail for every user holding a valid address, ordered by user_id.",
    examples: [
      {
        input: "mai.ten@example.com · 9lives@example.com",
        output: "mai.ten@example.com",
        explanation:
          "The second starts with a digit — the local part must BEGIN with a letter; digits may only follow one.",
      },
      {
        input: "o.hara@example.com · o!hara@example.com",
        output: "o.hara@example.com",
        explanation:
          "'!' sits outside the allowed character set, so the second address is rejected even though its frame looks right.",
      },
    ],
    constraints: [
      "a valid mail ends in exactly '@example.com' — the domain literal matches case-sensitively",
      "the local part starts with a letter, then uses only letters, digits, dots, underscores and dashes",
      "one row per valid user: user_id, name, mail — ordered by user_id",
    ],
    breakdown: [
      "SQLite ships without a REGEXP implementation — the keyword exists, but no function backs it in this sandbox — so pattern work falls to LIKE and GLOB. LIKE is case-insensitive with % and _ wildcards; GLOB is case-sensitive with Unix wildcards (* any run, ? one char, [...] a character class). Both match the ENTIRE string: the pattern is a full template of the mail, not a substring search, which is why no ^ or $ anchors are needed — '[A-Za-z]*@example[.]com' already means 'one letter, then anything, then this exact tail'. Case sensitivity is a feature here: the domain must read example.com in exactly that case.",
      "No single GLOB can say 'a letter, then ONLY these characters, then the domain' — * is untyped and will happily absorb any character. The honest decomposition is a positive clause plus a negative one, ANDed. The gate, mail GLOB '[A-Za-z]*@example[.]com', certifies the frame: letter first, domain last. The scan, mail NOT GLOB '*[^A-Za-z0-9_.-]*@example[.]com', asserts the interior: there is NO position holding a character outside the allowed set that still has '@example.com' ahead of it — which is precisely 'the local part contains no illegal characters'. Writing [.] instead of a bare dot is a portability habit: GLOB treats '.' as literal already, but the bracket form documents 'exactly this dot' and survives a port to a regex dialect where . means any character.",
      "The scan clause is the transferable idea: to express 'only these characters are allowed', assert the negation — no character OUTSIDE the set exists in the region. The complement class [^A-Za-z0-9_.-] performs the enumeration you cannot do positively, and the surrounding *...@example[.]com segments scope the assertion to everything ahead of the final @. Note the dash sits at the very end of the class so it reads as a literal dash, not a range; and because the two clauses are independent predicates, each can be tested alone — when a mail misclassifies, run gate and scan separately to see which one convicted it.",
    ],
    edges: [
      "'4dan@example.com' fails the gate before anything else runs — the leading [A-Za-z] demands a letter first; digits may only follow.",
      "'eve r@example.com' passes the gate (letter first, right domain) and dies in the scan — the space is outside the allowed set with the domain still ahead of it.",
      "'hana@x@example.com' looks acceptable because it ENDS in @example.com — the scan reads the stray @ as an illegal character and rejects the double-at address.",
      "'ivy@EXAMPLE.COM' and 'finn@example.org' both fail the gate — GLOB is case-sensitive and the domain literal must match exactly.",
    ],
    ladder: [
      { title: "Brute force — validate in the app", body: "Pull every mail into application code and run a regex there. Works, but unfiltered data leaves the database and the rule lives in two places." },
      { title: "The pattern — gate + scan", body: "Two ANDed GLOB clauses: a positive frame check and a negative interior scan. Each is readable and testable on its own." },
      { title: "The optimal idea — complement-class scoping", body: "O(total text length), one scan, no regex engine. The idiom: 'only set S allowed here' becomes NOT GLOB '*[^S]*<delimiter tail>' — complement class plus scope." },
    ],
    approach: "Positive gate + negative interior scan: two ANDed GLOB patterns",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  name    TEXT NOT NULL,
  mail    TEXT NOT NULL
);`,
      seed: `INSERT INTO Users (user_id, name, mail) VALUES
  (101,'Alice','alice@example.com'),    -- valid: plain
  (102,'Bob','bob.smith@example.com'),  -- valid: dot inside the local part
  (103,'Cara','cara_99@example.com'),   -- valid: underscore + digits
  (107,'Gus','g-us@example.com'),       -- valid: dash inside the local part
  (104,'Dan','4dan@example.com'),       -- trap: starts with a digit
  (105,'Eve','eve r@example.com'),      -- trap: space in the local part
  (106,'Finn','finn@example.org'),      -- trap: wrong domain
  (108,'Hana','hana@x@example.com'),    -- trap: double at
  (109,'Ivy','ivy@EXAMPLE.COM');        -- trap: uppercase domain (GLOB is case-sensitive)`,
      tables: [
        { name: "Users", note: "9 mails — 4 valid; five planted traps: digit-start, embedded space, wrong domain, double at, uppercase domain" },
      ],
    },
    code: `SELECT
    user_id,
    name,
    mail
FROM Users
WHERE mail GLOB '[A-Za-z]*@example[.]com'             -- gate: letter first, exact domain last
  AND mail NOT GLOB '*[^A-Za-z0-9_.-]*@example[.]com' -- scan: no illegal char before the @
ORDER BY user_id;`,
    walkthrough: [
      "The gate runs on all nine mails: it demands a leading letter and the exact tail '@example.com'. 4dan starts with a digit, finn points at example.org, and ivy's uppercase domain reads differently under case-sensitive GLOB — three mails convicted by the gate alone.",
      "The scan re-examines the survivors for any character outside [A-Za-z0-9_.-] that still has '@example.com' ahead of it: the space in eve r and the stray @ in hana@x both match the junk class and are rejected — while alice, bob, cara and g-us contain only legal characters and pass.",
      "Both clauses agree on exactly four mails — user ids 101, 102, 103, 107 — and ORDER BY user_id ships them in id order.",
    ],
    time: "O(n · m) — each mail is matched against two patterns",
    space: "O(1) beyond the output rows",
    followUps: [
      "Accept '@EXAMPLE.COM' as well — GLOB has no case-insensitivity flag, so how do you widen the gate (an OR of patterns, or matching against UPPER(mail))?",
      "Return each invalid mail together with its first offending character — extract it with INSTR + SUBSTR instead of inferring it from the pattern.",
    ],
    related: ["invalid-tweets", "fix-names-in-a-table"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "weather-type-in-each-country",
    statement:
      "Countries holds one row per country; Weather logs daily weather_state readings tied to a country. Classify each country by its AVERAGE weather state: below 15 is 'Cold', above 25 is 'Hot', and anything from 15 through 25 is 'Warm'. Countries with no readings at all must still appear, labelled 'Unknown'. Output columns: country, weather_type — ordered by country name.",
    examples: [
      {
        input: "Tempvale readings: 24, 26",
        output: "Tempvale · Warm",
        explanation:
          "The average is exactly 25.0 — the warm band is closed: a country is Hot only when the average is strictly ABOVE 25.",
      },
      {
        input: "Quietisle: no rows in Weather at all",
        output: "Quietisle · Unknown",
        explanation:
          "The LEFT JOIN keeps the country with a NULL average; the explicit IS NULL branch labels it before the Warm ELSE could misfire.",
      },
    ],
    constraints: [
      "classification uses the AVERAGE of a country's weather_state values, not any single day",
      "bands: below 15 Cold · 15 through 25 Warm (inclusive) · above 25 Hot · no readings Unknown",
      "one row per country — every country appears exactly once — ordered by country name",
    ],
    breakdown: [
      "The question counts countries that have never taken a reading, and that single requirement decides the join. An INNER JOIN pairs each country with its weather rows and quietly deletes any country with no matches — Quietisle would vanish before the CASE ever ran. The LEFT JOIN keeps every row of Countries and appends NULLs where Weather has nothing: Quietisle survives as one all-NULL row. That manufactured NULL row is the whole reason 'Unknown' is expressible — you cannot label a country that no longer exists.",
      "After grouping, AVG(weather_state) over Quietisle's NULL row returns NULL — AVG ignores NULLs and has nothing left. Then the CASE's branch order does the classifying, and it must treat NULL explicitly: NULL < 15 and NULL > 25 both evaluate to NULL (neither true nor false), so a weatherless country would slip past every comparison into whatever the ELSE holds. Put the IS NULL branch first and 'Unknown' is airtight; write a naive ELSE 'Warm' and every empty country silently becomes Warm — a wrong answer that still looks plausible in review.",
      "The bands are built so the boundary rows are the test: Cold is strictly below 15, Hot strictly above 25, and the closed interval from 15 through 25 — both endpoints included — falls to ELSE 'Warm'. Tempvale's average of exactly 25.0 is the planted probe: reading the spec as '25 means Hot' flips it. When a specification says 'from 15 through 25', let the explicit comparisons take the strict sides and treat ELSE as the inclusive middle band — that keeps the three classes exhaustive and disjoint without a single BETWEEN.",
    ],
    edges: [
      "An INNER JOIN deletes Quietisle before any logic runs — the LEFT JOIN is what makes 'Unknown' reachable.",
      "NULL comparisons are never true: without an explicit IS NULL branch a NULL average lands in ELSE — 'Warm' would be a silent misclassification.",
      "Averages of exactly 15 or 25 sit INSIDE the warm band — Cold and Hot are deliberately strict comparisons.",
      "One warm day does not warm a country: Frostland's 19° reading still leaves its average below 15.",
    ],
    ladder: [
      { title: "Brute force — a query per country", body: "Loop the countries, run a second query averaging each one's weather, classify in application code. N+1 round trips and the empty-country case handled by accident — or not." },
      { title: "The pattern — LEFT JOIN, GROUP BY, CASE on AVG", body: "One LEFT JOIN, one GROUP BY, one CASE over AVG(weather_state) with the IS NULL branch leading." },
      { title: "The optimal idea — outer joins manufacture the missing row", body: "O(countries + readings) with a hash join. The durable idea: outer joins manufacture 'no data' rows, and CASE branch order turns those NULLs into a deliberate class instead of an accident." },
    ],
    approach: "LEFT JOIN + GROUP BY + CASE over AVG with an explicit IS NULL branch",
    schema: {
      ddl: `CREATE TABLE Countries (
  country_id   INTEGER PRIMARY KEY,
  country_name TEXT NOT NULL
);
CREATE TABLE Weather (
  country_id    INTEGER NOT NULL REFERENCES Countries(country_id),
  weather_state INTEGER NOT NULL,
  day           TEXT NOT NULL
);`,
      seed: `INSERT INTO Countries (country_id, country_name) VALUES
  (1,'Frostland'),(2,'Tempvale'),(3,'Scorchtown'),(4,'Quietisle');
INSERT INTO Weather (country_id, weather_state, day) VALUES
  (1,10,'2019-11-01'),(1,12,'2019-11-02'),(1,19,'2019-11-03'),  -- avg 13.7 -> Cold
  (2,24,'2019-11-01'),(2,26,'2019-11-02'),                      -- avg 25.0 -> Warm (boundary)
  (3,30,'2019-11-01'),(3,29,'2019-11-02');                      -- avg 29.5 -> Hot
                                                                -- Quietisle: no rows -> Unknown`,
      tables: [
        { name: "Countries", note: "4 countries — one per class, plus Quietisle with no readings" },
        { name: "Weather", note: "7 readings; Tempvale averages exactly 25.0 (boundary probe)" },
      ],
    },
    code: `SELECT
    c.country_name AS country,
    CASE
        WHEN AVG(w.weather_state) IS NULL THEN 'Unknown'  -- manufactured row: no readings
        WHEN AVG(w.weather_state) < 15    THEN 'Cold'     -- strictly below
        WHEN AVG(w.weather_state) > 25    THEN 'Hot'      -- strictly above
        ELSE 'Warm'                                       -- the closed [15, 25] band
    END AS weather_type
FROM Countries c
LEFT JOIN Weather w ON w.country_id = c.country_id  -- LEFT: countries without readings survive
GROUP BY c.country_id, c.country_name
ORDER BY c.country_name;`,
    walkthrough: [
      "The LEFT JOIN gives Frostland three readings, Tempvale two, Scorchtown two — and Quietisle one manufactured all-NULL row. GROUP BY collapses the joined result to four country groups.",
      "Averages: Frostland (10+12+19)/3 = 13.7 → Cold; Scorchtown (30+29)/2 = 29.5 → Hot; Tempvale (24+26)/2 = exactly 25.0 — not strictly above 25, so it falls past the Hot comparison into ELSE → Warm.",
      "Quietisle's average is NULL: the first WHEN catches it via IS NULL → 'Unknown'. Four rows ordered by name: Frostland·Cold, Quietisle·Unknown, Scorchtown·Hot, Tempvale·Warm.",
    ],
    time: "O(countries + readings) — one joined scan",
    space: "O(countries) — one row per country",
    followUps: [
      "Order the report coldest-first — sort by a second CASE over the same average, and decide where 'Unknown' should land.",
      "Classify per DAY first, then count days per type per country — what changes in the join, and why does Quietisle still need the IS NULL branch?",
    ],
    related: ["product-sales-analysis-i", "npv-queries", "employee-bonus"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "activity-participants",
    statement:
      "The Friends table logs hobby memberships: each row is one person's enrollment in an activity, with their age. Report the activities that are genuine multi-person groups with a mid-twenties age profile: more than one participant, and an average age that ROUNDS into the band 21 through 24 inclusive. Output one column, activity, ordered alphabetically.",
    examples: [
      {
        input: "Chess: ages 20, 22, 25",
        output: "Chess",
        explanation:
          "Average 22.33 rounds to 22 — inside the band — and three participants clear the count gate.",
      },
      {
        input: "Rowing: ages 20, 20, 20, 21, 21",
        output: "(no row)",
        explanation:
          "The average is 20.4, which rounds to 20 — a whole number below the band. Rounding happens BEFORE the comparison, and 20.4 rounds down.",
      },
    ],
    constraints: [
      "a qualifying activity has COUNT(*) > 1 and ROUND(AVG(age)) between 21 and 24 inclusive",
      "the average is rounded FIRST, then compared — 20.6 rounds to 21 and qualifies",
      "one column: activity, ordered alphabetically",
    ],
    breakdown: [
      "Aggregates are invisible to WHERE. WHERE runs before grouping — it decides which ROWS enter the groups — so COUNT(*) and AVG(age) do not even exist yet at that stage, and referencing them there is an error. HAVING runs after grouping and filters the GROUPS themselves, which is why both of this problem's conditions live there. The division of labor is worth memorizing: use WHERE to drop rows you never want counted, use HAVING to judge what a group collectively looks like.",
      "The comparison is on the ROUNDED average, and the order of operations is the entire difficulty. Rowing averages 20.4; Puzzles averages 20.6. Compared raw against a 21–24 band, both fail — but ROUND(20.6) = 21 sits inside the band and qualifies, while ROUND(20.4) = 20 stays outside and fails. Two clubs two-tenths apart land on opposite sides of the gate purely through rounding. Write ROUND(AVG(age)) BETWEEN 21 AND 24 so the band's endpoints apply to whole numbers, and the ROUND call lives inside the comparison rather than after it.",
      "Two independent admission criteria ANDed inside HAVING means a group can fail either one. Skiing rounds beautifully — a solo 22-year-old averages exactly 22 — and still dies on COUNT(*) > 1: that clause exists because the report wants clubs, not individuals with hobbies. Golf fails the other side: 25.6 rounds to 26, beyond 24 even after rounding. When two conditions gate a group, test each in isolation against the seed — a group that passes one check lulls you into forgetting the other.",
    ],
    edges: [
      "WHERE cannot host COUNT or AVG — both conditions belong in HAVING, which filters after grouping.",
      "Rounding order flips verdicts: Puzzles' raw 20.6 becomes 21 and qualifies, Rowing's raw 20.4 becomes 20 and fails.",
      "A solo participant can round perfectly into the band — Skiing still fails COUNT(*) > 1.",
      "Golf's 25.6 rounds to 26 — outside the band even after rounding; rounding cannot rescue every outlier.",
    ],
    ladder: [
      { title: "Brute force — two passes", body: "Group and aggregate in one query, then filter the results by hand or in a second query over the first. Two passes where HAVING does it in one." },
      { title: "The pattern — a two-clause HAVING", body: "GROUP BY activity, HAVING COUNT(*) > 1 AND ROUND(AVG(age)) BETWEEN 21 AND 24." },
      { title: "The optimal idea — ROUND inside the comparison", body: "O(n log n) for the grouping. The transferable rule: group-level admission is HAVING's job, and any 'after rounding' rule in a spec means the ROUND call belongs INSIDE the comparison." },
    ],
    approach: "GROUP BY activity with a two-clause HAVING: count gate + rounded-average band",
    schema: {
      ddl: `CREATE TABLE Friends (
  id       INTEGER PRIMARY KEY,
  name     TEXT NOT NULL,
  activity TEXT NOT NULL,
  age      INTEGER NOT NULL
);`,
      seed: `INSERT INTO Friends (id, name, activity, age) VALUES
  (1,'Ada','Chess',20),(2,'Ben','Chess',22),(3,'Cy','Chess',25),      -- avg 22.33 -> 22: qualifies
  (4,'Dee','Skiing',22),                                              -- solo: COUNT gate kills it
  (5,'Eli','Rowing',20),(6,'Fay','Rowing',20),(7,'Gus','Rowing',20),
  (8,'Hana','Rowing',21),(9,'Ivo','Rowing',21),                       -- avg 20.4 -> 20: rounds down, fails
  (10,'Jai','Puzzles',20),(11,'Kim','Puzzles',20),(12,'Lux','Puzzles',20),
  (13,'Moe','Puzzles',21),(14,'Nia','Puzzles',22),                    -- avg 20.6 -> 21: rounds up, qualifies
  (15,'Oto','Golf',25),(16,'Pia','Golf',25),(17,'Qas','Golf',25),
  (18,'Rex','Golf',26),(19,'Sue','Golf',27);                          -- avg 25.6 -> 26: fails`,
      tables: [
        { name: "Friends", note: "19 enrolments across 5 activities — a solo trap, a rounds-down trap (20.4), a rounds-up survivor (20.6), a too-old club (25.6)" },
      ],
    },
    code: `SELECT
    activity
FROM Friends
GROUP BY activity
HAVING COUNT(*) > 1                        -- a club, not a solo hobby
   AND ROUND(AVG(age)) BETWEEN 21 AND 24   -- compare the ROUNDED average
ORDER BY activity;`,
    walkthrough: [
      "GROUP BY activity builds five groups — Chess 3 members, Skiing 1, Rowing 5, Puzzles 5, Golf 5. The COUNT(*) > 1 conjunct removes Skiing immediately, despite its age 22 rounding straight into the band.",
      "The averages: Chess 67/3 = 22.33 → 22 (in) · Rowing 102/5 = 20.4 → 20 (out, rounds down) · Puzzles 103/5 = 20.6 → 21 (in, rounds up) · Golf 128/5 = 25.6 → 26 (out).",
      "Chess and Puzzles survive — one passing outright, the other admitted only because rounding pushed 20.6 across the threshold — and ship alphabetically.",
    ],
    time: "O(n log n) — the grouping pass dominates",
    space: "O(a) — one group per activity",
    followUps: [
      "Return each qualifying activity with its raw AND rounded average side by side — watch which side of 20.5 decides Rowing vs Puzzles.",
      "Surface the 'almost qualified' clubs — those whose rounded average is 20 or 25 — and count how far each sits from the band.",
    ],
    related: ["top-travellers", "game-play-analysis-i", "find-followers-count"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "unique-orders-and-customers-per-month",
    statement:
      "The Orders table records one row per order: the ordering customer, the date, and an invoice reference. Build a monthly report: for each month present in the data, count the orders placed and count the DISTINCT customers who placed them. Output columns month ('YYYY-MM'), unique_orders, unique_customers — ordered by month.",
    examples: [
      {
        input: "January orders from customers 101, 102, 101, 103",
        output: "2024-01 · 4 · 3",
        explanation:
          "Customer 101 ordered twice: COUNT(*) tallies 4 rows, COUNT(DISTINCT customer_id) collapses the repeat to 3.",
      },
      {
        input: "February orders from customers 102, 104",
        output: "2024-02 · 2 · 2",
        explanation:
          "No repeats this month — the two counts agree, which is exactly when the report hides the difference between them.",
      },
    ],
    constraints: [
      "the month bucket is the 'YYYY-MM' prefix of order_date (strftime)",
      "unique_orders counts order rows; unique_customers counts distinct customer ids within the month",
      "one row per month that has at least one order, ordered by month",
    ],
    breakdown: [
      "Grouping by the raw date would give one group per day; the report needs months, so the GROUP BY key must be an expression that collapses dates into buckets: strftime('%Y-%m', order_date). The format emits a zero-padded '2024-01' — and the zero padding is not cosmetic: text comparison of '2024-1' and '2024-10' would sort 2024-10 first, while '2024-01' vs '2024-10' sorts chronologically. Bucketing by expression is the general move — SUBSTR, a computed column or date-truncation functions all work — and SQLite would even accept GROUP BY the alias, but grouping by the explicit expression keeps the query portable across engines.",
      "The two counts answer different questions over the same rows. COUNT(*) tallies group members — every order row counts, duplicates included. COUNT(DISTINCT customer_id) first collapses equal customer ids, then tallies — 101's two January orders contribute one. That is why January reads 4 orders but 3 customers: the repeat customer inflates the row count and leaves the distinct count untouched. Note the sibling distinctions while you are here: COUNT(*) counts rows unconditionally, COUNT(x) skips rows where x is NULL, and COUNT(DISTINCT x) skips NULLs AND collapses duplicates — three tools that agree only on clean, duplicate-free data.",
      "Read together, the two columns are a delta detector. When they agree, the month had no repeat buyers; when they diverge, the gap is repeat volume — January's gap of 1 is exactly customer 101's second order made visible. This is the reporting idiom behind 'orders vs active buyers' dashboards, and the same shape extends to COUNT(DISTINCT session_id) vs COUNT(*) in web analytics. The aggregation grain is the month; the two measures are two different tallies of the SAME grouped rows — no join, no subquery, just two aggregate functions disagreeing on purpose.",
    ],
    edges: [
      "The repeat customer is the whole point: January is 4 vs 3 because 101 ordered twice — remove that row and the columns agree everywhere.",
      "GROUP BY the expression strftime('%Y-%m', …), not the raw column — one group per DAY is a different report.",
      "'%Y-%m' is zero-padded TEXT, so ORDER BY month is chronological; an unpadded '2024-1' would sort after '2024-10'.",
      "COUNT(*) and COUNT(customer_id) coincide here (ids are NOT NULL) — the DISTINCT is what separates the two output columns.",
    ],
    ladder: [
      { title: "Brute force — dictionaries in the app", body: "Pull all orders, build month buckets in application code, tally orders and customer sets per bucket. The engine already has GROUP BY for exactly this." },
      { title: "The pattern — two tallies of one grouping", body: "GROUP BY the month expression; two aggregates per bucket — COUNT(*) and COUNT(DISTINCT customer_id)." },
      { title: "The optimal idea — DISTINCT changes what 'one' means", body: "O(n log n) for the grouping. The transferable idea: different measures over one grouping — no self-join, no subquery — and DISTINCT inside an aggregate redefines the unit being counted." },
    ],
    approach: "GROUP BY strftime month bucket, COUNT(*) vs COUNT(DISTINCT customer_id)",
    schema: {
      ddl: `CREATE TABLE Orders (
  order_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  order_date  TEXT NOT NULL,  -- 'YYYY-MM-DD'
  invoice     TEXT NOT NULL
);`,
      seed: `INSERT INTO Orders (order_id, customer_id, order_date, invoice) VALUES
  (1,101,'2024-01-05','inv-001'),
  (2,102,'2024-01-11','inv-002'),
  (3,101,'2024-01-19','inv-003'),  -- 101 orders AGAIN in January (repeat customer)
  (4,103,'2024-01-27','inv-004'),
  (5,102,'2024-02-03','inv-005'),
  (6,104,'2024-02-14','inv-006');`,
      tables: [
        { name: "Orders", note: "6 orders across 2 months; customer 101 repeats in January (4 orders, 3 customers)" },
      ],
    },
    code: `SELECT
    strftime('%Y-%m', order_date) AS month,             -- zero-padded bucket: sorts chronologically
    COUNT(*)                      AS unique_orders,     -- every order row
    COUNT(DISTINCT customer_id)   AS unique_customers   -- repeat buyers collapse
FROM Orders
GROUP BY strftime('%Y-%m', order_date)
ORDER BY month;`,
    walkthrough: [
      "strftime slices each date to its month: orders 1–4 become '2024-01', orders 5–6 become '2024-02' — two groups.",
      "January: COUNT(*) = 4 rows, but COUNT(DISTINCT customer_id) = 3 — 101 appears twice and collapses. February: 2 rows, 2 distinct customers, no repeats.",
      "Two rows ordered by month: (2024-01, 4, 3) then (2024-02, 2, 2) — the January gap is the repeat customer made visible.",
    ],
    time: "O(n log n) — the grouping pass",
    space: "O(m) — one row per month",
    followUps: [
      "Also count DISTINCT invoice values — when could unique_orders exceed it, and what would duplicate invoices say about the data?",
      "Flag months where a single customer placed more than half the orders — group by month and customer, then compare the pair's COUNT(*) to the month total (a window or a joined subquery).",
    ],
    related: ["monthly-transactions-i", "the-latest-login-in-2020", "reported-posts"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "customer-who-visited-but-did-not-transact",
    statement:
      "Visits logs one row per store visit; Transactions logs purchases, each tied to the visit that produced it. Some visits end without a purchase. For every customer who has AT LEAST ONE such no-sale visit, report customer_id and count_no_trans — the number of their visits that produced no transaction. Order by customer_id.",
    examples: [
      {
        input: "customer 101: visits 1, 2, 3 — purchases on visits 1 and 3",
        output: "101 · 1",
        explanation:
          "Visit 2 matched no transaction row — it is the one no-sale visit.",
      },
      {
        input: "customer 103: visits 6, 7, 8 — no purchases at all",
        output: "103 · 3",
        explanation:
          "Every visit failed to match, so the count is all three.",
      },
    ],
    constraints: [
      "count only visits with NO transaction row — visits with purchases never contribute",
      "customers with zero no-sale visits are excluded from the report entirely",
      "columns: customer_id, count_no_trans — ordered by customer_id",
    ],
    breakdown: [
      "'Visits with no transaction' is a set-difference question — visit ids in Visits minus visit ids referenced by Transactions — and the LEFT JOIN + IS NULL pair is SQL's classic way to compute it. The LEFT JOIN keeps every visit row, matching a transaction when one exists and padding the right side with NULL when none does. WHERE t.transaction_id IS NULL then keeps exactly the padded rows: a transaction_id is never NULL in real data, so a NULL there can only mean 'no match happened'. Read aloud, the query says: take every visit, keep the ones where the transaction side stayed empty.",
      "The WHERE and the COUNT cooperate in a strict order. After WHERE t.transaction_id IS NULL, every surviving row IS a no-sale visit — so GROUP BY customer_id and COUNT(*) simply tallies them, and the COUNT(*)-versus-COUNT(column) debate is moot because the right column is NULL on every survivor anyway. Delete the WHERE and count first, and you measure the opposite: COUNT(*) per customer counts every joined row — sales included — so customer 101 would show 2 (their two sales), a confident wrong answer. Filter to the population you mean, then count; aggregating before filtering measures a different population.",
      "The complementary question — 'how many sales per customer?' — needs the same join WITHOUT the WHERE, and there the counting column matters: COUNT(t.transaction_id) counts only rows where the join matched (non-NULL ids), so a visit without a purchase contributes nothing, while COUNT(*) would count the padded NULL row too and inflate every customer by their no-sale visits. That asymmetry is the durable lesson: COUNT(*) counts rows, COUNT(column) counts values, and a LEFT JOIN manufactures NULL rows precisely so the two disagree meaningfully. Customer 102 in the seed has every visit matched — they vanish from this report entirely, which is the anti-join doing its job.",
    ],
    edges: [
      "Test t.transaction_id IS NULL — the LEFT side of a LEFT JOIN never nullifies; testing v.visit_id IS NULL zeroes the whole report.",
      "The WHERE must fire before the count: without it, COUNT(*) per customer counts SALES rows — 101 would read 2, the opposite of the question.",
      "COUNT(t.transaction_id) counts matched rows only — the right column for the complementary 'sales per customer' query, the wrong one here.",
      "Customer 102 (every visit transacted) is absent from the output — the report lists customers WITH no-sale visits, not all customers.",
    ],
    ladder: [
      { title: "Brute force — a lookup per visit", body: "Select every visit, check Transactions for each in a second query, tally misses in application code. N+1 lookups where one join answers." },
      { title: "The pattern — anti-join + group + count", body: "LEFT JOIN on visit_id, WHERE the right side IS NULL, GROUP BY customer, COUNT(*)." },
      { title: "The optimal idea — outer join plus IS NULL is a set difference", body: "O(v + t) with a hash join. The idiom: anti-join = outer join + IS NULL on the right; and 'count what survived' is only correct when the filter already selected the population you meant." },
    ],
    approach: "LEFT JOIN + IS NULL anti-join, then group and count the survivors",
    schema: {
      ddl: `CREATE TABLE Visits (
  visit_id    INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL
);
CREATE TABLE Transactions (
  transaction_id INTEGER PRIMARY KEY,
  visit_id       INTEGER NOT NULL REFERENCES Visits(visit_id),
  amount         INTEGER NOT NULL
);`,
      seed: `INSERT INTO Visits (visit_id, customer_id) VALUES
  (1,101),(2,101),(3,101),   -- 101: sales on visits 1 and 3; visit 2 is a no-sale
  (4,102),(5,102),           -- 102: every visit transacted
  (6,103),(7,103),(8,103);   -- 103: nothing ever transacted
INSERT INTO Transactions (transaction_id, visit_id, amount) VALUES
  (11,1,120),(12,3,45),(13,4,30),(14,5,88);`,
      tables: [
        { name: "Visits", note: "8 visits by 3 customers — visits 2, 6, 7, 8 end without a purchase" },
        { name: "Transactions", note: "4 purchases tied to visits 1, 3, 4, 5 — visit 2 and all of 103's visits are missing" },
      ],
    },
    code: `SELECT
    v.customer_id,
    COUNT(*) AS count_no_trans  -- safe: the WHERE already kept only no-sale rows
FROM Visits v
LEFT JOIN Transactions t ON t.visit_id = v.visit_id  -- unmatched visits get NULL on the right
WHERE t.transaction_id IS NULL                       -- anti-join: keep exactly the no-sale visits
GROUP BY v.customer_id
ORDER BY v.customer_id;`,
    walkthrough: [
      "The LEFT JOIN pairs visits 1, 3, 4, 5 with their transactions; visits 2, 6, 7, 8 find no match and carry NULL on the transaction side.",
      "WHERE t.transaction_id IS NULL keeps only those four unmatched rows — visit 2 (customer 101) and visits 6, 7, 8 (customer 103). Customer 102's rows all matched and are gone.",
      "GROUP BY customer_id tallies the survivors: 101 → 1, 103 → 3 — COUNT(*) is safe because the WHERE already guaranteed every row in each group is a no-sale visit. Ordered: (101, 1) then (103, 3).",
    ],
    time: "O(v + t) — one joined scan",
    space: "O(v) — the joined rows before grouping",
    followUps: [
      "Report EVERY customer with their no-sale count, including 102's zero — drop the WHERE and count with SUM(CASE WHEN t.transaction_id IS NULL THEN 1 ELSE 0 END).",
      "Compute each customer's visit-to-sale conversion rate — which counting column does the numerator need, and which the denominator?",
    ],
    related: ["customers-who-never-order", "employee-bonus", "replace-employee-id-with-unique-identifier"],
    order: "exact",
    xp: 10,
  },
];
