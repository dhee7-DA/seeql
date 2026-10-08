// Deep-dives — LeetCode Premium batch IV, file 4 of 6: calling hours, mirrored
// coordinates, flight occupancy, shape classes, tree nodes and snap tallies
// (1 Easy, 5 Medium). Engine-verified by scripts/tmp-68b4-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM4_CITY: LcSqlDive[] = [
  {
    slug: "find-peak-calling-hours-for-each-city",
    statement:
      "Call logs every phone call as one row (call_id, city, call_time), where call_time is the moment the call STARTED, stored as 'YYYY-MM-DD HH24:MI' text. For each city, find the hour of day (0-23) in which the most calls were started, counting every call in that hour-of-day window no matter which date it fell on. If two hours tie on the count, report the smaller hour. Output columns city, peak_hour, peak_calls — peak_hour as an INTEGER hour of day, peak_calls the winning tally — one row per city, ordered by city ascending.",
    examples: [
      {
        input:
          "Lakeside starts calls at 09:00 and 09:30 on successive days, at 17:15 and 17:40 on two days as well, and once at 12:00 — hours 9 and 17 end up with 2 calls each, hour 12 with 1",
        output: "Lakeside · 9 · 2",
        explanation:
          "Hours 9 and 17 tie at 2 calls; the stated tie rule hands the peak to the smallest hour, so 9 wins and 17 disappears from the output.",
      },
      {
        input:
          "Hillcrest starts two calls at the exact same minute, 2024-06-03 13:07, and one more at 2024-06-05 11:59",
        output: "Hillcrest · 13 · 2",
        explanation:
          "Same-minute calls are separate calls: hour 13 counts 2, hour 11 counts 1, and the duplicated timestamp string never collapses the tally.",
      },
    ],
    constraints: [
      "one row per city present in Call — the hour of day (0 to 23) whose calls-started tally is that city's largest",
      "a tie on the peak count resolves to the smallest hour of day, and the rule must be implemented in the query, not assumed",
      "columns city, peak_hour (INTEGER), peak_calls — ordered by city ascending",
    ],
    breakdown: [
      "The report's grain is a city crossed with an hour of day, and the date part of the timestamp is deliberately thrown away — '2024-06-03 08:12' and '2024-06-04 08:45' belong to the same bucket. CAST(strftime('%H', call_time) AS INTEGER) peels out that two-digit hour, and the CAST matters twice: strftime returns TEXT, and a text hour would both sort wrongly ('21' sorts before '8') and print with a leading zero instead of as an integer. GROUP BY city, hr then collapses every call started in that hour, on any date, into one tally. Riverton's hour 8 shows why the date must be discarded: its three calls sit on three different days, yet they pile into a single count of 3.",
      "Once the tallies exist, the question stops being an aggregate and becomes an argmax: which hour wins its city? A grouped query cannot answer that by itself, because 'the hour with the most calls' is a property of the whole group list, not something SUM or MAX can emit alongside an arbitrary group row. ROW_NUMBER() OVER (PARTITION BY city ORDER BY calls DESC, hr ASC) turns each city's tallies into a ranking and keeps rn = 1. The secondary key hr ASC is not decoration — it IS the stated tie rule, and without it Lakeside's two tied hours would resolve engine-dependently.",
      "The counting aggregate is where silent bugs hide. COUNT(*) counts call rows, so Hillcrest's two calls started in the very same minute ('2024-06-03 13:07') both land in hour 13 — the counted identity is the row, not the timestamp string. COUNT(DISTINCT call_time) would collapse that minute to one call, drop hour 13 into a tie with hour 11, and hand the peak to the smaller hour by accident. Counting distinct dates fails a third way: it flattens each day's calls into one and would misread any hour that fires twice within a single day, like Riverton's hour 21.",
    ],
    edges: [
      "Lakeside ties hours 9 and 17 at 2 calls each — an ORDER BY calls DESC with no secondary key, or a join-back on calls = MAX(calls), would ship both hours (or an arbitrary one); ORDER BY calls DESC, hr ASC pins hour 9.",
      "Riverton's hour 21 packs two calls into one day while hour 8 spreads three across three days — grouping by (city, date, hour) first and then picking the best hour per city crowns hour 21 with 2, which is wrong.",
      "Hillcrest's rows 11 and 12 share the timestamp '2024-06-03 13:07' — COUNT(DISTINCT call_time) reads one call, ties hours 13 and 11 at 1 apiece, and reports peak hour 11.",
      "strftime('%H') yields TEXT ('08', '13') — comparing or ordering hours as text ranks '21' below '8', so a text tie-break can pick hour 21 over hour 8; the CAST also satisfies the INTEGER peak_hour contract.",
    ],
    ladder: [
      { title: "Brute force — bucket by hand", body: "Walk every call, add it to a per-city, per-hour counter, then scan each city's 24 counters for the maximum and remember the smallest hour that achieves it." },
      { title: "The pattern — group, then rank", body: "CAST(strftime('%H') AS INTEGER) builds the bucket key, GROUP BY city, hr builds the tallies, and a ROW_NUMBER window over calls DESC, hr ASC picks each city's winner." },
      { title: "The optimal idea — the tie key is the contract", body: "O(n log n). The durable rule: an argmax over grouped counts is a top-1-per-group query, and every stated tie-break must appear as an explicit secondary ORDER BY key inside the window — otherwise the answer is engine roulette." },
    ],
    approach: "GROUP BY city and CAST(strftime('%H') AS INTEGER) hour, ROW_NUMBER per city over calls DESC then hour ASC, keep rn = 1",
    schema: {
      ddl: `CREATE TABLE Call (
  call_id   INTEGER PRIMARY KEY,
  city      TEXT NOT NULL,
  call_time TEXT NOT NULL  -- start moment, 'YYYY-MM-DD HH24:MI'
);`,
      seed: `INSERT INTO Call (call_id, city, call_time) VALUES
  (1,  'Riverton', '2024-06-03 08:12'),  -- hour 8, day one
  (2,  'Riverton', '2024-06-04 08:45'),  -- hour 8, day two
  (3,  'Riverton', '2024-06-05 08:30'),  -- hour 8: 3 calls spread across 3 days
  (4,  'Riverton', '2024-06-03 21:10'),  -- hour 21: 2 calls packed into ONE day
  (5,  'Riverton', '2024-06-03 21:55'),
  (6,  'Lakeside', '2024-06-03 09:00'),  -- hour 9: 2 calls
  (7,  'Lakeside', '2024-06-04 09:30'),
  (8,  'Lakeside', '2024-06-03 17:15'),  -- hour 17: 2 calls, TIES hour 9
  (9,  'Lakeside', '2024-06-04 17:40'),
  (10, 'Lakeside', '2024-06-05 12:00'),  -- hour 12: bystander
  (11, 'Hillcrest', '2024-06-03 13:07'), -- same minute, same hour: both count
  (12, 'Hillcrest', '2024-06-03 13:07'), -- duplicate timestamp, distinct call
  (13, 'Hillcrest', '2024-06-05 11:59');`,
      tables: [
        { name: "Call", note: "13 calls over 3 cities — Riverton peaks at hour 8, Lakeside ties 9 vs 17, Hillcrest fires twice in one minute" },
      ],
    },
    code: `WITH per_hour AS (
    SELECT
        city,
        CAST(strftime('%H', call_time) AS INTEGER) AS hr,  -- hour of day, 0-23 (date discarded)
        COUNT(*) AS calls                                  -- every row counts, even same-minute twins
    FROM Call
    GROUP BY city, hr                                      -- one tally per city x hour-of-day
),
ranked AS (
    SELECT
        city,
        hr,
        calls,
        ROW_NUMBER() OVER (
            PARTITION BY city
            ORDER BY calls DESC, hr ASC                    -- secondary key = stated tie rule: smallest hour
        ) AS rn
    FROM per_hour
)
SELECT
    city,
    hr AS peak_hour,
    calls AS peak_calls
FROM ranked
WHERE rn = 1
ORDER BY city;`,
    walkthrough: [
      "The hour bucket folds 13 calls into 7 (city, hour) tallies: Riverton 8 → 3 and 21 → 2, Lakeside 9 → 2, 17 → 2 and 12 → 1, Hillcrest 13 → 2 and 11 → 1.",
      "The window ranks each city's tallies by calls DESC then hour ASC: Riverton's (8, 3) takes rank 1; Lakeside's tie splits to hour 9; Hillcrest's (13, 2) outranks (11, 1).",
      "WHERE rn = 1 keeps one row per city and ORDER BY city ships (Hillcrest, 13, 2), (Lakeside, 9, 2), (Riverton, 8, 3) — every number a wrong aggregate would have moved is planted in the seed.",
    ],
    time: "O(n log n) — one grouped pass plus a per-city sort inside the window",
    space: "O(c · h) — one tally per city and hour-of-day present in the data",
    followUps: [
      "Report every jointly-peak hour per city by swapping ROW_NUMBER for RANK — what does Lakeside print then, and which of the other rows change?",
      "Bucket the day into named parts (night 0-5, morning 6-11, afternoon 12-17, evening 18-23) and find each city's busiest part — where does the bucket expression live, and does the smallest-bucket tie rule survive?",
    ],
    related: ["the-first-day-of-the-maximum-recorded-temperature-in-each-city", "tasks-count-in-the-weekend", "user-activity-for-the-past-30-days-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "symmetric-coordinates",
    statement:
      "Point stores 2-D points as (point_id, x, y). Two DISTINCT points are mirrors of each other when one holds (a, b) and the other holds (b, a) with a != b — a point like (6, 6) is its own image and is never part of a mirrored pair. Report every mirrored pair in canonical orientation: columns axis_a, axis_b, where axis_a is the smaller of the two x-values involved and axis_b the larger. Several physical point pairs can realize the same value pair; still report exactly one row per distinct (axis_a, axis_b). Order by axis_a ascending, then axis_b ascending.",
    examples: [
      {
        input: "point 1 is (2, 5) and point 2 is (5, 2) — each is the other's mirror",
        output: "2 · 5",
        explanation:
          "The pair prints with the smaller x first: axis_a 2, axis_b 5. The join direction p1.x < p2.x finds it once, not once per ordering.",
      },
      {
        input: "(3, 4) appears at points 3 and 5, (4, 3) at points 4 and 6 — four mirrored point-pairs in total",
        output: "3 · 4 (exactly one row)",
        explanation:
          "Distinct points, same value pair: DISTINCT collapses the four join combinations into the single row (3, 4).",
      },
    ],
    constraints: [
      "two distinct points mirror only when one is (a, b) and the other is (b, a) with a != b — (6, 6)-style points are their own image and never report",
      "one row per distinct (smaller x, larger x) value pair, however many physical point-pairs realize it; columns axis_a, axis_b with axis_a < axis_b in every row",
      "ordered by axis_a ascending, then axis_b ascending",
    ],
    breakdown: [
      "Nothing here aggregates — the whole task is relational matching, which makes it a self-join problem. A point (a, b) mirrors a point (b, a), so Point joins to itself on p1.x = p2.y AND p1.y = p2.x: each row proposes its own mirror image and the other side confirms whether such a row exists. The output complicates things slightly, because a mirrored pair is unordered in the data but must print with the smaller x first. That is a canonical-orientation problem, and the cheapest place to solve it is the join condition itself.",
      "The guard p1.x < p2.x does three jobs at once, which is why it belongs in the ON clause rather than in a cleanup pass. It keeps exactly one of the two symmetric join directions, so the (2, 5) and (5, 2) rows are matched once instead of twice. It excludes self-mirrors: a point (6, 6) satisfies the swap condition against itself, but 6 < 6 is false, so the a != b rule costs no separate predicate. And because every surviving pair satisfies p1.x < p2.x, the smaller x IS p1.x — axis_a and axis_b fall straight out of the join keys with no MIN or CASE needed.",
      "DISTINCT is the second half of the design, and the seed forces the question. The value pair (3, 4)/(4, 3) appears as four physical points — two copies of (3, 4) and two of (4, 3) — so the join produces four row-pairs that all describe the same mirrored coordinate pair. The report wants one row per distinct pair of values, and DISTINCT applied after the canonical orientation collapses exactly those duplicates. The final ORDER BY is then unambiguous, because every surviving row satisfies axis_a < axis_b, so ordering by axis_a, axis_b is a total order on the output.",
    ],
    edges: [
      "Point 7 is (6, 6): the bare mirror join matches it against itself and prints a phantom (6, 6) pair — only the p1.x < p2.x guard (or an explicit a != b filter) removes it.",
      "Points 3-6 hold (3, 4) twice and (4, 3) twice: without DISTINCT the output repeats (3, 4) four times, and without the direction guard it also prints reversed rows.",
      "Point 8 is (7, 8) and no (8, 7) exists — the inner join drops it silently, which is correct here; the omission only becomes visible if the task is extended to list unmirrored points.",
      "A point_id-based dedupe (p1.point_id < p2.point_id) fails when duplicates exist on both sides: points 4 and 5 pair as p1 = (4, 3), p2 = (3, 4) with ids 4 < 5, printing the reversed (4, 3) row — the x-order guard is immune because it IS the output contract.",
    ],
    ladder: [
      { title: "Brute force — try every pair", body: "Loop over all ordered pairs of points in application code, keep those with swapped coordinates and a != b, canonicalize each to (min x, max x) and collect the results in a set." },
      { title: "The pattern — guarded self-join plus DISTINCT", body: "Join Point to itself on swapped coordinates, enforce p1.x < p2.x so exactly one direction survives, then DISTINCT over the canonical pair." },
      { title: "The optimal idea — let one predicate do three jobs", body: "O(n^2) pairwise comparisons. The durable rule: when the report is an unordered relation printed in a canonical shape, put the orientation in the join guard — it dedupes directions, excludes degenerate self-pairs and defines the output columns in one stroke." },
    ],
    approach: "Self-join Point on swapped coordinates with p1.x < p2.x as the guard, then DISTINCT over the canonical (smaller, larger) pair",
    schema: {
      ddl: `CREATE TABLE Point (
  point_id INTEGER PRIMARY KEY,
  x        INTEGER NOT NULL,
  y        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Point (point_id, x, y) VALUES
  (1, 2, 5),   -- clean pair with point 2
  (2, 5, 2),
  (3, 3, 4),   -- the (3,4)/(4,3) value pair appears TWICE on each side ...
  (4, 4, 3),
  (5, 3, 4),   -- ... duplicate values, distinct point
  (6, 4, 3),   -- ... duplicate values, distinct point
  (7, 6, 6),   -- self-mirror candidate: a = b, excluded by the a != b rule
  (8, 7, 8);
`,
      tables: [
        { name: "Point", note: "8 points — one clean mirror pair, a value pair realized by 4 points, one (6,6) self-mirror candidate, one unmirrored point" },
      ],
    },
    code: `SELECT DISTINCT
    p1.x AS axis_a,     -- p1.x < p2.x below, so p1.x IS the smaller x
    p2.x AS axis_b
FROM Point p1
JOIN Point p2
  ON p1.x = p2.y        -- my x is your y ...
 AND p1.y = p2.x        -- ... and my y is your x: the mirror image
 AND p1.x < p2.x        -- one direction only: kills (p2,p1) twins AND (a,a) self-mirrors like (6,6)
ORDER BY axis_a, axis_b;`,
    walkthrough: [
      "The self-join tests every pair of rows for swapped coordinates: (2, 5) and (5, 2) confirm each other and survive only in the p1.x < p2.x direction as (2, 5); (6, 6) matches nothing but itself and dies on 6 < 6; (7, 8) finds no (8, 7) at all.",
      "The (3, 4)/(4, 3) family yields four surviving row-pairs — each of the two (3, 4) rows pairs with each of the two (4, 3) rows — and every one canonicalizes to p1.x = 3, p2.x = 4.",
      "DISTINCT folds those four into the single row (3, 4) and ORDER BY ships (2, 5) then (3, 4); the naive join's phantom (6, 6), its four reversed duplicates and its four (3, 4) repeats never survive the two guards.",
    ],
    time: "O(n^2) — the self-join compares every pair of points",
    space: "O(m) — one row per matched, canonically oriented pair before DISTINCT",
    followUps: [
      "Extend the report to the unmirrored points, like (7, 8), using a NOT EXISTS probe — does the join-direction guard still make sense on that side of the report?",
      "Add a pairs_count column showing how many physical point-pairs realize each distinct value pair — how does GROUP BY replace DISTINCT, and what does the (3, 4) family report?",
    ],
    related: ["symmetric-pairs", "all-the-pairs-with-the-maximum-number-of-common-followers", "first-and-last-call-on-the-same-day"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "flight-occupancy-and-waitlist-analysis",
    statement:
      "Flight lists an airline's flights (flight_id, flight_no, capacity) and Booking lists seat reservations (booking_id, flight_id, seat_no). For every flight — including one nobody booked — report columns flight_no, booked, status, waitlisted: booked is the number of bookings on the flight, status is 'full' when booked is greater than or equal to capacity and 'seats available' otherwise, and waitlisted is how many bookings exceed capacity (0 whenever booked does not exceed it). Order by flight_id ascending.",
    examples: [
      {
        input: "flight FJ201 (capacity 3) holds exactly 3 bookings",
        output: "FJ201 · 3 · full · 0",
        explanation:
          "Equality is full: booked >= capacity fires at 3 = 3, and the waitlist floor keeps the count at 0 because nothing exceeds capacity.",
      },
      {
        input: "flight FJ215 (capacity 2) has no bookings whatsoever",
        output: "FJ215 · 0 · seats available · 0",
        explanation:
          "The LEFT JOIN keeps the flight and COUNT over the booking column reads the NULLs as nothing — 0 booked, never a vanished row and never a phantom 1.",
      },
    ],
    constraints: [
      "every flight in Flight appears exactly once, including flights with zero bookings; booked counts the Booking rows mapped to the flight",
      "status is 'full' when booked >= capacity and 'seats available' otherwise; waitlisted is booked - capacity only when that is positive, else 0",
      "columns flight_no, booked, status, waitlisted — ordered by flight_id ascending (the id drives the order and stays out of the report)",
    ],
    breakdown: [
      "Two grains meet here: one row per flight and many rows per booking, so the counting is a LEFT JOIN from Flight onto Booking followed by a GROUP BY. The join direction is a contract, not a style choice — flight 4 holds zero bookings, and an INNER join would make that flight vanish from a report that is explicitly about every flight. LEFT JOIN keeps flight 4's row and fills the booking side with NULLs, and what happens next depends entirely on which aggregate counts those NULLs. COUNT(b.booking_id) counts non-NULL ids and lands on 0, while COUNT(*) counts the row itself — and the unmatched flight row IS a row — so it reports 1 booked on an empty plane.",
      "The status boundary sits exactly on equality, and the seed tests it head-on: flight FJ201 has booked 3 of capacity 3, which is 'full' — a strict > demotes a sold-out flight to 'seats available' and misreads the business. The waitlist has its own rule and its own trap: booked minus capacity is negative for every underbooked flight, but a waitlist count cannot be negative. The CASE WHEN booked > capacity THEN booked - capacity ELSE 0 END is the zero-floor idiom (SQLite spells GREATEST(booked - capacity, 0) as scalar MAX with two arguments, same result). Flights FJ210 (2 of 4) and FJ215 (0 of 2) exist precisely so the ELSE 0 branch has something to protect.",
      "Computing booked once in a CTE and classifying twice afterwards keeps the two rules honest and separate. The tally CTE aggregates; the outer SELECT only compares and labels — so the equality boundary and the zero-floor are two visible one-line decisions instead of buried arithmetic. Repeating COUNT(b.booking_id) three times in one SELECT works too, but each repetition is another chance for one copy to drift (say, someone 'fixes' one to COUNT(*)) while the others stay right. Grouping by flight_id alongside the carried columns keeps two flights that could share a flight_no in principle from merging, even though this seed's numbers are distinct.",
    ],
    edges: [
      "FJ201 is booked to exactly 3 of 3 — the equality boundary: status must read 'full', and a WHEN booked > capacity test brands a sold-out flight 'seats available'.",
      "FJ215 has no Booking rows at all — an INNER join loses the row, a LEFT JOIN with COUNT(*) invents 1 booked, and only COUNT(b.booking_id) prints the truthful 0.",
      "FJ204 carries 6 bookings on capacity 4 — waitlisted is 6 - 4 = 2; capping the booking count at capacity in the tally would erase the overflow this column exists to show.",
      "FJ210 is 2 of 4 — raw booked - capacity is -2; without the zero-floor the waitlist column ships negative numbers for two of the four flights.",
    ],
    ladder: [
      { title: "Brute force — count and compare", body: "Tally bookings per flight in a map, then walk the flights comparing each tally to capacity and clamping the overflow at zero." },
      { title: "The pattern — LEFT JOIN, COUNT the column, CASE the labels", body: "LEFT JOIN keeps zero-booking flights, COUNT(b.booking_id) turns their NULLs into 0, and two CASE expressions encode the equality boundary and the zero-floor." },
      { title: "The optimal idea — aggregate once, classify after", body: "O(f + b). The durable rule: compute the shared tally once in a CTE, then make the business rules (>= and the floor) visible one-line decisions on top — the join direction and the aggregate choice carry the zero case." },
    ],
    approach: "LEFT JOIN + COUNT(booking column) tally per flight in a CTE, then CASE labels for full / seats available and the zero-floored waitlist",
    schema: {
      ddl: `CREATE TABLE Flight (
  flight_id INTEGER PRIMARY KEY,
  flight_no TEXT NOT NULL,
  capacity  INTEGER NOT NULL
);
CREATE TABLE Booking (
  booking_id INTEGER PRIMARY KEY,
  flight_id  INTEGER NOT NULL REFERENCES Flight(flight_id),
  seat_no    INTEGER NOT NULL
);`,
      seed: `INSERT INTO Flight (flight_id, flight_no, capacity) VALUES
  (1, 'FJ201', 3),   -- exactly at capacity
  (2, 'FJ204', 4),   -- will be overbooked by 2
  (3, 'FJ210', 4),   -- half empty
  (4, 'FJ215', 2);   -- never booked
INSERT INTO Booking (booking_id, flight_id, seat_no) VALUES
  (1, 1, 12), (2, 1, 13), (3, 1, 14),          -- 3 of 3: the equality case
  (4, 2, 1), (5, 2, 2), (6, 2, 3), (7, 2, 4),  -- capacity 4 ...
  (8, 2, 5), (9, 2, 6),                        -- ... plus 2 overflow: waitlist 2
  (10, 3, 2), (11, 3, 7);
`,
      tables: [
        { name: "Flight", note: "4 flights — capacities 3, 4, 4 and 2; flight 4 is never booked" },
        { name: "Booking", note: "11 bookings — flight 1 full at 3 of 3, flight 2 overbooked by 2, flight 3 half empty, flight 4 none" },
      ],
    },
    code: `WITH tally AS (
    SELECT
        f.flight_id,
        f.flight_no,
        f.capacity,
        COUNT(b.booking_id) AS booked   -- COUNT(column): the zero-booking flight totals 0, not 1
    FROM Flight f
    LEFT JOIN Booking b ON b.flight_id = f.flight_id
    GROUP BY f.flight_id, f.flight_no, f.capacity
)
SELECT
    flight_no,
    booked,
    CASE WHEN booked >= capacity THEN 'full' ELSE 'seats available' END AS status,  -- equality IS full
    CASE WHEN booked >  capacity THEN booked - capacity ELSE 0 END AS waitlisted    -- zero-floor idiom
FROM tally
ORDER BY flight_id;`,
    walkthrough: [
      "The LEFT JOIN threads all four flights through: flight 1 matches 3 bookings, flight 2 matches 6, flight 3 matches 2, and flight 4 keeps its row with NULLs where a booking would sit.",
      "The tally lands on booked 3, 6, 2, 0 against capacities 3, 4, 4, 2 — COUNT(b.booking_id) is what makes flight 4 a 0 instead of a 1.",
      "The labels go on afterwards: FJ201 is full at 3 = 3 with waitlist 0, FJ204 is full with waitlist 2, FJ210 and FJ215 are seats available with the floor holding waitlist at 0 — shipped in flight_id order.",
    ],
    time: "O(f + b) — one scan of each table with a keyed join",
    space: "O(f) — one tally row per flight",
    followUps: [
      "Add an oversell_ratio column (booked as a multiple of capacity) — what does integer division do to FJ204's 6 of 4, and where must the cast live?",
      "Rank flights by waitlist depth and report only the deepest — does the zero-floor change which flights can top that ranking, and how do ties behave?",
    ],
    related: ["count-student-number-in-departments", "the-airport-with-the-most-flights", "the-number-of-passengers-in-each-bus-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "classifying-triangles-by-lengths",
    statement:
      "Shape records side lengths as (shape_id, a, b, c). Classify each shape: 'equilateral' when all three sides are equal, 'isosceles' when exactly two sides match, 'scalene' when no two sides match. Output columns shape_id, classification — one row per shape, ordered by shape_id ascending.",
    examples: [
      {
        input: "shape 2 records sides 5, 9, 9",
        output: "2 · isosceles",
        explanation:
          "Exactly two sides match (the two 9s); the odd side sits first, so the any-pair test must include b = c to catch it.",
      },
      {
        input: "shape 1 records sides 7, 7, 7",
        output: "1 · equilateral",
        explanation:
          "All three sides match — and because the equilateral branch runs first, the isosceles predicate never gets the chance to claim this row.",
      },
    ],
    constraints: [
      "classification is 'equilateral' when a = b = c, 'isosceles' when exactly one pair of sides matches, 'scalene' when no pair matches",
      "every shape row classifies to exactly one label — the three classes are disjoint and cover all rows",
      "columns shape_id, classification — ordered by shape_id ascending",
    ],
    breakdown: [
      "A CASE expression is a first-match-wins evaluator: its WHEN branches are tested top to bottom and the first true one labels the row. Classification problems become ordering puzzles the moment one class is a special case of another, and here every equilateral row also satisfies the isosceles test — an equilateral shape has a = b, after all. So the all-equal branch must be evaluated before the any-pair branch, or the equilateral rows are swallowed and mislabeled. The seed's shape 1 (7, 7, 7) is planted exactly to punish an isosceles-first ordering.",
      "'Exactly two equal' has no direct operator — it is defined in negative space as some pair matches and not all three do. Once the all-equal branch has been dispatched first, a plain any-pair test can no longer see an equilateral row, so a = b OR b = c OR a = c honestly means exactly two. The word 'honestly' is doing work: the odd side's position varies row by row, and the seed holds isosceles shapes both ways — (5, 9, 9) with the odd side first and (8, 8, 3) with it last. Any test that samples one or two of the three pairs is silently betting on where the odd side sits.",
      "The ELSE clause is not a fallback for failures, it IS the scalene class: a row that matched no equality predicate has no equal pair, which is the definition of scalene. Omitting the ELSE would ship NULL for shape 4 (6, 9, 4), and a NULL classification reads downstream as missing data rather than as an answer. No aggregation or join is involved — the whole query is one row-wise expression over one table, which is why it costs a single scan.",
    ],
    edges: [
      "Shape 1 is (7, 7, 7): all three pairs are equal, so any CASE that tests the isosceles predicate first brands the equilateral row 'isosceles' — the WHEN order is the bug.",
      "Shape 2 is (5, 9, 9) with the odd side FIRST: a test limited to a = b never fires, and the row falls through to 'scalene'.",
      "Shape 3 is (8, 8, 3) with the odd side LAST: the mirror-image mistake — a test limited to b = c misses it the same way.",
      "Shape 4 is (6, 9, 4): nothing matches, so only a present ELSE yields 'scalene' — an ELSE-less CASE ships NULL and quietly shrinks the answer.",
    ],
    ladder: [
      { title: "Brute force — nested comparisons", body: "Read each row's three sides and write an if/else ladder in application code, testing all-equal, then any-pair, then default." },
      { title: "The pattern — ordered CASE", body: "One CASE with the all-equal WHEN first, the three-pair OR second, and ELSE scalene — the branch order encodes the subset relationship." },
      { title: "The optimal idea — test subsets before supersets", body: "O(n). The durable rule: when classes nest, the CASE must evaluate the narrowest class first, and an ELSE should name a real class, not serve as a catch-all dump." },
    ],
    approach: "Single ordered CASE: a = b AND b = c first (equilateral), then any-pair OR (isosceles), ELSE scalene",
    schema: {
      ddl: `CREATE TABLE Shape (
  shape_id INTEGER PRIMARY KEY,
  a        INTEGER NOT NULL,
  b        INTEGER NOT NULL,
  c        INTEGER NOT NULL
);`,
      seed: `INSERT INTO Shape (shape_id, a, b, c) VALUES
  (1, 7, 7, 7),   -- all three sides equal
  (2, 5, 9, 9),   -- odd side FIRST: b = c
  (3, 8, 8, 3),   -- odd side LAST: a = b
  (4, 6, 9, 4);
`,
      tables: [
        { name: "Shape", note: "4 shapes — one equilateral, one scalene, and two isosceles holding the odd side in opposite positions" },
      ],
    },
    code: `SELECT
    shape_id,
    CASE
        WHEN a = b AND b = c THEN 'equilateral'        -- must be tested FIRST: isosceles predates it
        WHEN a = b OR b = c OR a = c THEN 'isosceles'  -- all three pairs: exactly-two once equilateral is gone
        ELSE 'scalene'                                 -- no pair matched: a real class, not a fallback
    END AS classification
FROM Shape
ORDER BY shape_id;`,
    walkthrough: [
      "Shape 1 (7, 7, 7) fires the first WHEN because 7 = 7 and 7 = 7 — 'equilateral' before the isosceles predicate is ever evaluated.",
      "Shapes 2 and 3 fail the all-equal test and then match different members of the any-pair OR: (5, 9, 9) through b = c, (8, 8, 3) through a = b — both 'isosceles'.",
      "Shape 4 (6, 9, 4) matches nothing and lands in ELSE as 'scalene'; ORDER BY shape_id ships the four rows in id order.",
    ],
    time: "O(n) — one row-wise pass, no joins",
    space: "O(1) beyond the output rows",
    followUps: [
      "Add validity first: flag rows violating the triangle inequality before classifying — where does that check sit relative to the equilateral branch, and can a degenerate row be both 'invalid' and 'isosceles'?",
      "Count shapes per classification — which branch ordering still guarantees correct counts, and what does GROUP BY add over wrapping this same CASE?",
    ],
    related: ["type-of-triangle", "triangle-judgement", "weather-type-in-each-country"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "binary-tree-nodes",
    statement:
      "TreeNode holds a tree, one row per node: (node_id, label, parent_id), where the root's parent_id is NULL and every other node's parent_id names its parent node. Classify each node: 'root' when parent_id is NULL, 'leaf' when it has a parent but no children, 'inner' when it has a parent and at least one child. Output columns node_id, label, node_type — one row per node, ordered by node_id ascending. The tree holds at least two nodes, and every non-NULL parent_id names an existing node.",
    examples: [
      {
        input: "node 1 ('trunk') has parent_id NULL and is the parent of nodes 2 and 5",
        output: "1 · trunk · root",
        explanation:
          "The parent test runs first and IS NULL fires on the flag itself; the root's children are never consulted.",
      },
      {
        input: "node 3 ('acorn') points at parent node 5 — a row inserted later in the seed — and has no children",
        output: "3 · acorn · leaf",
        explanation:
          "Parent references match by value regardless of insertion order; with no child row naming node 3, the ELSE branch classifies it 'leaf'.",
      },
    ],
    constraints: [
      "node_type is 'root' when parent_id IS NULL, 'inner' when the node has a parent and at least one child, 'leaf' when it has a parent and no children",
      "one row per node in TreeNode; the tree holds at least two nodes and every non-root parent_id names an existing node",
      "columns node_id, label, node_type — ordered by node_id ascending",
    ],
    breakdown: [
      "Every node's class comes from answering two independent questions: does it have a parent, and does it have a child? 'Root' is defined purely by the parent question — parent_id IS NULL — while 'inner' versus 'leaf' is decided entirely by the child question. A CASE that asks the parent question first, then the child question, then defaults produces the three labels with no overlapping tests. That ordering also settles the odd corner where a single-node tree would leave the root childless: root is answered before any leaf logic can run, and this seed keeps six nodes in the tree so 'leaf' always describes a real, parented node.",
      "The child question is an existence probe, not a join. LEFT JOINing TreeNode to its children multiplies output rows — node 2 ('oak') has two children, 4 and 6, so the join emits oak twice and the report silently grows beyond one row per node — and you would need GROUP BY or DISTINCT to repair the grain. Correlated EXISTS answers 'is there a row whose parent_id is mine?' with a boolean and cannot change the row count. That is the shape whose output grain is guaranteed to match the input grain, which is the real requirement of a per-node classification.",
      "The root test lives or dies on NULL semantics. parent_id IS NULL is a test of the null flag itself and fires exactly for the root; parent_id = NULL drifts through three-valued logic, evaluates to UNKNOWN for every row including the root's, and never fires — so the root would fall through to the child probe and ship as 'inner' (trunk does have children). The seed also plants an insertion-order decoy: node 3's parent_id is 5, a row that appears later in the INSERT list. SQL matches on stored values, never on row order, so the parent lookup is indifferent to where the parent row physically sits — any mental model that walks the tree top-down in insertion order imports an assumption the engine does not have.",
    ],
    edges: [
      "Node 1 ('trunk') is the root: parent_id = NULL instead of IS NULL never fires, so the root falls to the child probe and is mislabeled 'inner' — it does have children 2 and 5.",
      "Node 2 ('oak') has TWO children (4 and 6): a LEFT JOIN to children emits oak once per child — two rows; EXISTS keeps exactly one row per node.",
      "Node 3 ('acorn') carries parent_id 5, a row inserted later in the seed: matching is by value, so the classification is unaffected — but any join or walk that assumes parents precede children breaks.",
      "Nodes 3, 4 and 6 reach the ELSE: dropping the ELSE yields NULL for every leaf — the largest class in the seed would ship looking empty.",
    ],
    ladder: [
      { title: "Brute force — build child sets in memory", body: "Load the rows, invert the parent pointers into child lists, then label each node from its own NULL parent and its list length." },
      { title: "The pattern — two predicates, one CASE", body: "parent_id IS NULL answers the parent question; a correlated EXISTS over parent_id answers the child question; the CASE composes them root-first." },
      { title: "The optimal idea — probes that never change the grain", body: "O(n) child probes with an index on parent_id. The durable rule: per-row classification wants existence probes (EXISTS, IN), not row-producing joins — a join that can match N times multiplies the very output it is supposed to label." },
    ],
    approach: "CASE over parent_id IS NULL (root), then correlated EXISTS on children (inner), ELSE leaf — one row per node",
    schema: {
      ddl: `CREATE TABLE TreeNode (
  node_id   INTEGER PRIMARY KEY,
  label     TEXT NOT NULL,
  parent_id INTEGER          -- NULL on the root
);`,
      seed: `INSERT INTO TreeNode (node_id, label, parent_id) VALUES
  (1, 'trunk', NULL),   -- root: children 2 and 5
  (2, 'oak',   1),      -- inner: children 4 and 6
  (3, 'acorn', 5),      -- leaf whose parent row (node 5) is inserted LATER
  (4, 'fern',  2),      -- leaf, sibling of 6
  (5, 'pine',  1),      -- inner: exactly one child (node 3)
  (6, 'moss',  2);`,
      tables: [
        { name: "TreeNode", note: "6 nodes — one root, two inner nodes (oak with 2 children, pine with 1), three leaves; acorn's parent row is inserted after it" },
      ],
    },
    code: `SELECT
    t.node_id,
    t.label,
    CASE
        WHEN t.parent_id IS NULL THEN 'root'      -- IS NULL tests the flag; = NULL would never fire
        WHEN EXISTS (
            SELECT 1
            FROM TreeNode c
            WHERE c.parent_id = t.node_id         -- any child row makes me an inner node
        ) THEN 'inner'
        ELSE 'leaf'                               -- parented, no children
    END AS node_type
FROM TreeNode t
ORDER BY t.node_id;`,
    walkthrough: [
      "Node 1 ('trunk') is settled by the first WHEN — parent_id IS NULL evaluates on the flag itself, so 'root' is assigned before any child probe runs.",
      "Nodes 2 and 5 pass the parent test with parent_id 1, and each finds a child row: oak has 4 and 6, pine has 3 — both 'inner', one row each despite oak's two children.",
      "Nodes 3, 4 and 6 find no rows naming them as parent and ship as 'leaf' via ELSE; ORDER BY node_id emits trunk, oak, acorn, fern, pine, moss in id order.",
    ],
    time: "O(n) child probes with an index on parent_id; O(n^2) worst case bare",
    space: "O(1) beyond the output rows",
    followUps: [
      "Report each node's child_count beside its type — how do you keep one row per node while counting children, and what does the root's count say?",
      "Surface orphans: nodes whose parent_id names no existing row — which probe detects them, and why can this seed not produce one?",
    ],
    related: ["tree-node", "the-number-of-employees-which-report-to-each-employee", "employees-whose-manager-left-the-company"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "snaps-analysis",
    statement:
      "SnapActivity logs one row per snap event: (activity_id, user_id, age_bucket, snap_type, snap_date), where snap_type is 'sent' or 'opened' and age_bucket is the acting user's age band on that day (the same user may appear under different bands over time). For each age bucket that has activity, report columns age_bucket, sending_users, opening_users: sending_users counts the distinct users with at least one 'sent' row in the bucket, opening_users counts the distinct users with at least one 'opened' row there. One user doing both counts in both columns. Order by age_bucket ascending.",
    examples: [
      {
        input: "bucket 21: user 101 sends snaps on 2024-07-01, 2024-07-03 and 2024-07-05 and opens one on 2024-07-02",
        output: "21 · 1 · 1",
        explanation:
          "Three sends collapse to one sending user via COUNT(DISTINCT user_id), and the same user legitimately occupies the opening column too.",
      },
      {
        input: "bucket 29: user 103 (an opener back in bucket 25) sends once; user 104 sends once and opens once",
        output: "29 · 2 · 1",
        explanation:
          "Senders {103, 104} and openers {104} are overlapping populations computed per bucket — 103's open in bucket 25 never crosses the GROUP BY boundary.",
      },
    ],
    constraints: [
      "one row per age_bucket present in SnapActivity — a bucket with no activity rows cannot appear (no dimension table exists to host it)",
      "sending_users and opening_users each count DISTINCT user_ids with at least one 'sent' / 'opened' row in that bucket; a user doing both counts in both columns",
      "columns age_bucket, sending_users, opening_users — ordered by age_bucket ascending",
    ],
    breakdown: [
      "The report climbs two grains in one query: activity rows must become distinct users, and users must become per-bucket tallies. The conditional-aggregate pattern does both in one pass — CASE WHEN snap_type = 'sent' THEN user_id END builds the sender population inside the group, and COUNT(DISTINCT ...) then counts people rather than events. The DISTINCT is not cosmetic: user 101 fires three 'sent' rows in bucket 21, and an event count would report three sending users where there is one. The two columns are independent tallies over overlapping populations, which is exactly what the seed's both-type users exercise.",
      "The CASE's missing ELSE is doing real work. Rows failing the WHEN become NULL, and COUNT skips NULLs — so bucket 18, which contains no 'sent' row at all, correctly tallies zero senders. Writing ELSE 0 to 'avoid NULLs' fabricates a user id 0, which DISTINCT then dutifully counts: the seed's bucket 18 would print 1 sender it does not have. Silence, in this pattern, is the feature — an empty population must be represented by something COUNT refuses to count.",
      "GROUP BY age_bucket is the whole universe of this report, and it has a visible limit: buckets with no rows cannot appear, because GROUP BY forms groups only from rows that exist — a genuinely empty age band would need a dimension table to LEFT JOIN against, which is a different query with a different join direction. Within a bucket, the two populations may overlap (user 104 both sends and opens in bucket 29) and the columns must both count them. Across buckets, they may not leak: user 103 opens in bucket 25 and sends in bucket 29, and each bucket's DISTINCT is computed over its own rows only. A per-user rollup grouped by user_id alone would merge 103's two lives into one row and lose the bucket axis entirely.",
    ],
    edges: [
      "User 101 fires three 'sent' rows in bucket 21 — dropping DISTINCT prints sending_users 3 instead of 1, inflating the sender tally by the user's activity volume.",
      "Bucket 18 holds exactly one row, an 'opened' — the CASE with no ELSE leaves every send-side value NULL and sending_users lands on 0; an ELSE 0 variant invents user 0 and prints 1.",
      "User 104 both sends and opens in bucket 29 — computing opening_users as total distinct users minus senders reports 0 where the truth is 1, because the columns overlap by design.",
      "User 103 opens in bucket 25 and sends in bucket 29 — a rollup grouped by user_id merges both into one row and loses the bucket axis; per-bucket DISTINCT keeps 103 out of bucket 25's sender count.",
    ],
    ladder: [
      { title: "Brute force — two sets per bucket", body: "Walk the rows once, appending user ids to a senders set and an openers set keyed by bucket, then report the set sizes." },
      { title: "The pattern — conditional COUNT(DISTINCT CASE ...)", body: "One grouped pass; each column is COUNT(DISTINCT CASE WHEN snap_type = 'sent' THEN user_id END) over its own type-filtered population." },
      { title: "The optimal idea — NULL is the not-in-this-population marker", body: "O(n). The durable rule: overlapping conditional tallies come from CASE-built populations whose misses fall to NULL (never ELSE 0), with DISTINCT clamping events down to people." },
    ],
    approach: "GROUP BY age_bucket with two conditional tallies: COUNT(DISTINCT CASE WHEN snap_type = 'sent' / 'opened' THEN user_id END)",
    schema: {
      ddl: `CREATE TABLE SnapActivity (
  activity_id INTEGER PRIMARY KEY,
  user_id     INTEGER NOT NULL,
  age_bucket  INTEGER NOT NULL,  -- the user's age band for this activity
  snap_type   TEXT NOT NULL,     -- 'sent' or 'opened'
  snap_date   TEXT NOT NULL      -- 'YYYY-MM-DD'
);`,
      seed: `INSERT INTO SnapActivity (activity_id, user_id, age_bucket, snap_type, snap_date) VALUES
  (1, 101, 21, 'sent',   '2024-07-01'),  -- user 101: 3 sends in bucket 21 ...
  (2, 101, 21, 'sent',   '2024-07-03'),
  (3, 101, 21, 'sent',   '2024-07-05'),
  (4, 101, 21, 'opened', '2024-07-02'),  -- ... and one open: counted in BOTH columns
  (5, 102, 25, 'sent',   '2024-07-01'),  -- sender-only user
  (6, 103, 25, 'opened', '2024-07-04'),  -- 103 opens in bucket 25 ...
  (7, 103, 29, 'sent',   '2024-07-08'),  -- ... and sends in bucket 29: cross-bucket user
  (8, 104, 29, 'sent',   '2024-07-02'),  -- both types inside bucket 29
  (9, 104, 29, 'opened', '2024-07-06'),
  (10, 105, 18, 'opened', '2024-07-03');`,
      tables: [
        { name: "SnapActivity", note: "10 events over 5 users and 4 buckets — a 3-send user, a both-type user in two buckets, a cross-bucket user, and a bucket with zero sends" },
      ],
    },
    code: `SELECT
    age_bucket,
    COUNT(DISTINCT CASE WHEN snap_type = 'sent'   THEN user_id END) AS sending_users,  -- NULLs skip: empty stays 0
    COUNT(DISTINCT CASE WHEN snap_type = 'opened' THEN user_id END) AS opening_users
FROM SnapActivity
GROUP BY age_bucket
ORDER BY age_bucket;`,
    walkthrough: [
      "GROUP BY age_bucket builds four groups from ten rows — bucket 18 with one row, 21 with four, 25 with two, 29 with three — and no fifth bucket exists because no row carries one.",
      "Inside each group the two CASEs split populations: bucket 21's three sends clamp to the single user 101 beside its opener 101; bucket 25 splits {102} senders from {103} openers; bucket 29 overlaps senders {103, 104} with openers {104}.",
      "ORDER BY age_bucket ships (18, 0, 1), (21, 1, 1), (25, 1, 1), (29, 2, 1) — the zero in bucket 18's sender column is COUNT refusing to count NULLs.",
    ],
    time: "O(n) — one grouped pass with two conditional counts",
    space: "O(b) — one row per bucket present",
    followUps: [
      "Report each bucket's total distinct users beside the two tallies — how would you surface a neither-sent-nor-opened population, and can it be nonzero here?",
      "Include buckets with zero activity by joining a band dimension table — which join direction keeps empty bands, and what do the two tallies read there?",
    ],
    related: ["user-activity-for-the-past-30-days-i", "percentage-of-users-attended-a-contest", "students-and-examinations"],
    order: "exact",
    xp: 20,
  },
];
