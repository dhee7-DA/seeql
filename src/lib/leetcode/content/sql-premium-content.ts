// Deep-dives — LeetCode Premium batch I: media & content (5 problems, 4 Medium / 1 Hard). Engine-verified by scripts/lc-sql-verify.ts.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM_CONTENT: LcSqlDive[] = [
  {
    slug: "get-highest-answer-rate-question",
    statement:
      "The SurveyLog table records one row per survey interaction with a question: a 'show' row every time the question is presented to a respondent (its answer_id is NULL) and an 'answer' row every time a respondent submits an answer to it. A question's answer rate is the count of its 'answer' rows divided by the count of its 'show' rows. Report the single question with the highest answer rate — its question_id together with that rate rounded to 4 decimals as answer_rate. The output is exactly one row, so there is no display-ordering contract beyond the argmax itself.",
    examples: [
      {
        input: "Q 401: one show, one answer · Q 402: three shows, two answers · Q 403: two shows, no answers",
        output: "401 · 1.0",
        explanation:
          "Rates: 1/1 = 1.0, 2/3 = 0.6667, 0/2 = 0.0 — the perfect rate wins; a question with shows but zero answers still forms a group whose rate is an honest 0.",
      },
      {
        input: "Q 405: four shows, three answers · Q 406: four shows, no answers",
        output: "405 · 0.75",
        explanation:
          "The zero-answer question still enters the GROUP BY with rate 0 — its shows count in the denominator — it simply cannot be the argmax while any question posts a positive rate.",
      },
    ],
    constraints: [
      "answer_rate = answer rows × 1.0 ÷ show rows per question_id, rounded to 4 decimals",
      "exactly one row — the single highest-rate question; the seed's argmax is unique, so no tie policy is needed",
      "output columns: question_id, answer_rate — one row, graded as a set (no ordering contract on a single-row report)",
    ],
    breakdown: [
      "The log mixes two event types in one table, so every count inside the rate is a CONDITIONAL count. SUM(CASE WHEN action = 'answer' THEN 1 ELSE 0 END) tallies the answer rows while its twin tallies the shows — a plain COUNT(*) would lump both actions into one number and make the ratio meaningless. The twin-CASE idiom has a cousin worth knowing: COUNT(CASE WHEN action = 'answer' THEN 1 END) — with no ELSE the non-matching rows produce NULL, and COUNT skips NULLs, so it counts the same rows. Either form works; the explicit SUM of 0/1 flags is the easier one to extend, because per-day, per-segment or per-survey variants all reuse the same flags.",
      "The ratio arithmetic carries the usual integer-division trap: both CASE sums are INTEGER, so answers/shows evaluates in integer arithmetic — 2/3 is 0 while 2*1.0/3 is 0.6667 — and the *1.0 promotion must happen before the division. ROUND(…, 4) formats at the display boundary, after the arithmetic is already real. GROUP BY question_id forms a group for every question that appears in the log at all: question 403 has two shows and zero answers, so its answer-side SUM is 0 — not an absent row — and its rate is a well-formed 0.0. Only a question with answer rows but NO show rows would divide by zero (SQLite yields NULL quietly); this seed avoids that shape, and NULLIF(shows, 0) is the portable guard if the data could ever contain it.",
      "Picking the single best rate is an argmax, and ORDER BY answer_rate DESC LIMIT 1 is its SQL shape: sort the per-question rates and keep the first row. The single-row output is why the report is graded order-insensitively — with exactly one row there is nothing to order — but the ORDER BY inside the statement is still load-bearing: it is the LIMIT's selection semantics, not a display contract. That also makes the argmax's uniqueness part of the spec: LIMIT 1 picks arbitrarily among tied top rates, so the data must guarantee one clear winner. The seed does — 1.0 against 0.6667 and 0.0 — and a tie-resilient variant would append a deterministic tiebreak (say, question_id ASC) to the same ORDER BY.",
    ],
    edges: [
      "Question 403 (two shows, zero answers) still forms a group with rate 0.0 — SUM(CASE …) returns 0, not NULL, and a zero rate is a valid row, not a missing question.",
      "2/3 is 0 in integer arithmetic — the *1.0 must precede the division; ROUND(…, 4) formats only after the math is real.",
      "The ORDER BY here selects, it does not display: with LIMIT 1 a tied top rate resolves arbitrarily, so the spec's unique argmax (1.0 vs 0.6667) is load-bearing.",
      "COUNT(CASE WHEN … THEN 1 END) counts the same rows via NULL-skipping — know both idioms; the SUM of 0/1 flags extends more easily.",
    ],
    ladder: [
      {
        title: "Brute force — rate per question in two queries",
        body: "One query lists the shows per question, another the answers; the application divides, ranks and prints the winner. Two scans, and the arithmetic lives outside the database.",
      },
      {
        title: "The pattern — conditional counts in one GROUP BY",
        body: "GROUP BY question_id with SUM(CASE action = 'answer') over SUM(CASE action = 'show'), *1.0 before the divide, ROUND(…, 4) at the edge — one statement, one scan.",
      },
      {
        title: "The optimal idea — sort and keep the head",
        body: "ORDER BY answer_rate DESC LIMIT 1 turns the per-question report into an argmax in the same statement — one scan plus one sort of q group rows. A window variant (SUM(CASE) OVER (PARTITION BY question_id)) stamps the counts on every row, but the GROUP BY already yields the smaller intermediate.",
      },
    ],
    approach: "GROUP BY question_id → conditional SUM(CASE) ratio with *1.0 → ORDER BY rate DESC LIMIT 1",
    schema: {
      ddl: `CREATE TABLE SurveyLog (
  id          INTEGER PRIMARY KEY,
  action      TEXT NOT NULL CHECK (action IN ('show', 'answer')),
  question_id INTEGER NOT NULL,
  answer_id   INTEGER,
  q_num       INTEGER NOT NULL,
  log_time    TEXT NOT NULL
);`,
      seed: `INSERT INTO SurveyLog (id, action, question_id, answer_id, q_num, log_time) VALUES
  (1, 'show',   401, NULL, 1, '2021-03-01 09:00:00'),
  (2, 'answer', 401, 811, 1, '2021-03-01 09:12:00'),
  (3, 'show',   402, NULL, 2, '2021-03-01 10:00:00'),
  (4, 'show',   402, NULL, 2, '2021-03-01 10:05:00'),
  (5, 'show',   402, NULL, 2, '2021-03-01 10:20:00'),
  (6, 'answer', 402, 812, 2, '2021-03-02 08:00:00'),
  (7, 'answer', 402, 815, 2, '2021-03-02 09:30:00'),
  (8, 'show',   403, NULL, 3, '2021-03-03 11:00:00'),
  (9, 'show',   403, NULL, 3, '2021-03-03 14:00:00');`,
      tables: [
        {
          name: "SurveyLog",
          note: "9 rows, 3 questions — Q 401: 1 show / 1 answer (1.0), Q 402: 3 shows / 2 answers (0.6667), Q 403: 2 shows / 0 answers (0.0); 'show' rows carry answer_id NULL, q_num is the question's display position and plays no role",
        },
      ],
    },
    code: `-- Per-question rate from conditional counts, then keep the single best.
SELECT
    question_id,
    ROUND(
        SUM(CASE WHEN action = 'answer' THEN 1 ELSE 0 END) * 1.0 /
        SUM(CASE WHEN action = 'show'   THEN 1 ELSE 0 END),
        4
    ) AS answer_rate
FROM SurveyLog
GROUP BY question_id
ORDER BY answer_rate DESC   -- argmax; the seed's top rate (1.0) is unique, so LIMIT 1 is deterministic
LIMIT 1;`,
    walkthrough: [
      "GROUP BY question_id forms three groups: 401 {show, answer}, 402 {show ×3, answer ×2}, 403 {show ×2} — every logged question survives, including the zero-answer one.",
      "Rates: 401 → 1 × 1.0 / 1 = 1.0; 402 → 2 × 1.0 / 3 = 0.6667; 403 → 0 × 1.0 / 2 = 0.0 — the *1.0 keeps the divisions real, and ROUND(…, 4) formats each.",
      "ORDER BY answer_rate DESC puts 401 first (1.0 > 0.6667 > 0.0) and LIMIT 1 prints exactly one row: question_id 401, answer_rate 1.0.",
    ],
    time: "O(n) — one scan for the conditional sums, one sort over the q per-question rows",
    space: "O(q) — one aggregate row per question before the LIMIT",
    followUps: [
      "Report every question's rate alongside its rank — which window function rides on the same GROUP BY, and where do NULL rates (answers with no shows) sort?",
      "Split the rate by survey month — what does the GROUP BY key become, and how does a per-month argmax differ from this global one?",
    ],
    related: ["movie-rating", "ads-performance", "average-selling-price"],
    order: "any",
    xp: 20,
  },
  {
    slug: "unpopular-books",
    statement:
      "The Books table lists every title the shop stocks with the number of copies currently available; OrderLines records each dispatched order line with its dispatch date. A book is unpopular when its available count is strictly below the average available count across ALL books, AND no order line for it was dispatched in the window starting 2019-06-23 (inclusive) and ending 2020-06-23 (exclusive). List every unpopular book — book_id, name, author, price, available — ordered by book_id.",
    examples: [
      {
        input:
          "available 25, 8, 40, 5, 12 → average 18 · book 4 (5 left) dispatched only 2019-01-10, 2020-06-23 and 2020-08-02 · book 2 (8 left) dispatched 2019-06-23 · book 5 (12 left) never dispatched",
        output: "4 · Night Skies · T. Okafor · 15.75 · 5 / 5 · Clay & Kiln · P. Marsh · 9.99 · 12",
        explanation:
          "Book 2 is below average but its 2019-06-23 dispatch sits on the window's inclusive first day; book 4's 2020-06-23 dispatch sits on the exclusive last day and does not count against it.",
      },
      {
        input: "average available 10 · book 7 'Quiet Hours': available 9, last dispatched 2020-06-22 · book 8: available 9, last dispatched 2020-06-23",
        output: "7 · Quiet Hours · D. Lenz · 11.25 · 9",
        explanation:
          "One day flips the verdict — 2020-06-22 is inside the window, 2020-06-23 is the excluded end; BETWEEN would have closed both ends and dropped book 7 too.",
      },
    ],
    constraints: [
      "unpopular = available strictly below AVG(available) over ALL books AND zero dispatches with dispatch_date in [2019-06-23, 2020-06-23) — start inclusive, end exclusive",
      "the average is computed over the whole Books table — no availability or dispatch filter may precede it",
      "output columns: book_id, name, author, price, available — one row per unpopular book, ascending by book_id",
    ],
    breakdown: [
      "The report ANDs two predicates of different shapes: a per-table aggregate (available below the average) and a per-book existential (no dispatch in the window). The average has a scope trap built in: AVG(available) must be computed over ALL books — the scalar subquery (SELECT AVG(available) FROM Books) reads the unfiltered table no matter what the outer WHERE is doing, because it runs its own independent scan. Filter first and average second — or fold the AVG into a WHERE that already drops rows — and the denominator shrinks, the bar drifts down, borderline books wrongly qualify, and the bug never raises an error: it just quietly reports a different universe. Keeping the aggregate in its own subquery (or its own CTE) is what pins the scope.",
      "The window is half-open on purpose: dispatch_date >= '2019-06-23' AND dispatch_date < '2020-06-23'. Book 2 is dispatched exactly ON 2019-06-23 — the inclusive first day, so the order counts and the book is excluded despite its low stock. Book 4 is dispatched exactly ON 2020-06-23 — the exclusive last day, so that order does NOT count and the book survives. BETWEEN '2019-06-23' AND '2020-06-23' would close both ends and wrongly punish book 4; ISO-ordered text dates compare correctly with plain string arithmetic, which is why the range needs no date functions at all.",
      "The existential test is a NOT EXISTS with a correlated inner WHERE — the anti-join. It asks one question per book — does even one in-window dispatch exist? — and stops at the first hit. LEFT JOIN OrderLines … WHERE ol.book_id IS NULL expresses the same verdict, but NOT IN (SELECT …) is the form to avoid: a single NULL in the subquery (one order line with a NULL date would do it) turns the entire NOT IN into no-rows-at-all, silently emptying the report. NOT EXISTS is immune to that NULL semantics, and the textual order of the two WHERE conjuncts is the optimizer's business — the query is correct in either arrangement.",
    ],
    edges: [
      "Book 2 is dispatched exactly on the window's first day (2019-06-23, inclusive) — its low stock cannot save it; book 4 is dispatched exactly on the last day (2020-06-23, exclusive) and survives.",
      "The average is over all five books — (25+8+40+5+12)/5 = 18.0 — from an unfiltered scan; averaging a pre-filtered table lowers the bar and leaks extra books into the report.",
      "NOT IN breaks on a single NULL in the subquery; NOT EXISTS (or LEFT JOIN … IS NULL) is the NULL-safe anti-join.",
      "Books with zero order lines (book 5) pass NOT EXISTS vacuously — never dispatched is the easiest way to be unpopular.",
    ],
    ladder: [
      {
        title: "Brute force — two verdicts stitched in code",
        body: "Pull every book, compute the average in the application, walk each book's order lines checking dates, and intersect the two verdicts — a loop over two data sources with the logic outside the database.",
      },
      {
        title: "The pattern — scalar average + NOT EXISTS",
        body: "WHERE available < (SELECT AVG(available) FROM Books) AND NOT EXISTS (an in-window dispatch) — one scalar subquery pins the global scope, one correlated EXISTS settles the window.",
      },
      {
        title: "The optimal idea — stamp the average with a window",
        body: "AVG(available) OVER () stamps the same global average on every row without a second scan; the anti-join stays. Either form is one pass over Books plus per-book probes into OrderLines — O(b + l) with an index on OrderLines(book_id).",
      },
    ],
    approach: "Scalar AVG subquery (global scope) → NOT EXISTS over a half-open dispatch window → ORDER BY book_id",
    schema: {
      ddl: `CREATE TABLE Books (
  book_id   INTEGER PRIMARY KEY,
  name      TEXT NOT NULL,
  author    TEXT NOT NULL,
  price     REAL NOT NULL,
  available INTEGER NOT NULL
);
CREATE TABLE OrderLines (
  line_id       INTEGER PRIMARY KEY,
  book_id       INTEGER NOT NULL,
  quantity      INTEGER NOT NULL,
  dispatch_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Books (book_id, name, author, price, available) VALUES
  (1, 'Daily Bread',  'R. Hoff',   21.50, 25),
  (2, 'Tidal Pools',  'M. Ferro',  12.00,  8),
  (3, 'Alpine Flora', 'K. Sund',   34.25, 40),
  (4, 'Night Skies',  'T. Okafor', 15.75,  5),
  (5, 'Clay & Kiln',  'P. Marsh',   9.99, 12);
INSERT INTO OrderLines (line_id, book_id, quantity, dispatch_date) VALUES
  (1, 1, 2, '2019-08-11'),
  (2, 1, 1, '2020-05-30'),
  (3, 2, 3, '2019-06-23'),
  (4, 4, 2, '2019-01-10'),
  (5, 4, 1, '2020-06-23'),
  (6, 4, 4, '2020-08-02');`,
      tables: [
        {
          name: "Books",
          note: "5 books — available 25, 8, 40, 5, 12 → average 18.0; books 2, 4 and 5 sit below the bar",
        },
        {
          name: "OrderLines",
          note: "6 lines — book 2 dispatched on the window's first day (in), book 4 only on 2019-01-10 / 2020-06-23 / 2020-08-02 (all out), book 5 never dispatched",
        },
      ],
    },
    code: `SELECT
    b.book_id,
    b.name,
    b.author,
    b.price,
    b.available
FROM Books b
WHERE b.available < (SELECT AVG(available) FROM Books)  -- the subquery sees ALL books, unfiltered
  AND NOT EXISTS (                                      -- no dispatch inside [2019-06-23, 2020-06-23)
        SELECT 1
        FROM OrderLines ol
        WHERE ol.book_id = b.book_id
          AND ol.dispatch_date >= '2019-06-23'
          AND ol.dispatch_date <  '2020-06-23'          -- half-open: start inclusive, end exclusive
      )
ORDER BY b.book_id;`,
    walkthrough: [
      "The scalar subquery averages ALL five books: 90 / 5 = 18.0 — books 2 (8), 4 (5) and 5 (12) are below it; books 1 (25) and 3 (40) are out before the window is even consulted.",
      "NOT EXISTS probes each survivor's lines: book 2's 2019-06-23 dispatch is >= '2019-06-23' and < '2020-06-23' — in-window, so book 2 drops; book 4's three dispatches (2019-01-10, 2020-06-23, 2020-08-02) all miss the half-open range — it survives; book 5 has no lines and passes vacuously.",
      "ORDER BY book_id prints (4, 'Night Skies', 'T. Okafor', 15.75, 5) then (5, 'Clay & Kiln', 'P. Marsh', 9.99, 12).",
    ],
    time: "O(b + l) — one AVG scan of Books plus per-book probes into OrderLines",
    space: "O(1) beyond the output — a scalar average and one open probe per book",
    followUps: [
      "Report every book with its available count, the global average and an unpopular flag — which projection change turns the filter into a report, and where does AVG(… ) OVER () slot in?",
      "Strengthen the existential test to 'no dispatch of quantity >= 3 in the window' — what changes inside the EXISTS subquery, and does the average's scope move?",
    ],
    related: ["list-the-products-ordered-in-a-period", "customer-who-visited-but-did-not-transact", "average-selling-price"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "friendly-movies-streamed-last-month",
    statement:
      "Movies lists the catalogue, Users lists the viewers, Memberships maps each user to a member_role (owner, admin, member or guest), and WatchLog records one row per stream: which user watched which movie on which date. Report the distinct titles of every movie whose title contains 'kids' (in any letter case) that was watched at least once in June 2020 by a user whose member_role is 'member' or 'admin'. One output column, title, sorted ascending.",
    examples: [
      {
        input:
          "'Cartoon Kids Hour' watched 2020-06-05 by mira (member) · 'Kids Science Lab' watched 2020-06-09 by dev (guest) · 'KIDS Karaoke Night' watched 2020-06-14 by sana (admin) and 2020-06-21 by mira",
        output: "Cartoon Kids Hour / KIDS Karaoke Night",
        explanation:
          "The guest's watch disqualifies 'Kids Science Lab'; the karaoke night qualifies twice (admin + member) and DISTINCT prints it once; the uppercase title still matches the pattern.",
      },
      {
        input: "'kids Bake-Off' watched 2020-07-03 by sana (admin) · 'World Cinema Classics' watched 2020-06-27 by sana (admin)",
        output: "(no rows)",
        explanation:
          "A kids title watched outside June and a June watch of a non-kids title — each fails exactly one predicate; the title filter and the date window are independent.",
      },
    ],
    constraints: [
      "title matches when it contains 'kids' in any letter case (LIKE is case-insensitive for ASCII)",
      "a movie qualifies when at least one watch row falls in June 2020 (watch_date in [2020-06-01, 2020-07-01)) by a user with member_role 'member' or 'admin'",
      "output column: title — DISTINCT titles, ascending; a movie with several qualifying watches prints once",
    ],
    breakdown: [
      "Three filters live on three different tables, so the join chain is the query's spine: WatchLog supplies the event (who watched what, when), Movies supplies the title pattern, Memberships supplies the role. The chain is inner all the way — a watch row pointing at an unknown user or an unknown movie cannot qualify, which is the semantics you want for a catalogue report. The role test rides on the watch's viewer: mb.member_role IN ('member', 'admin') is evaluated per watch row, so the same movie can qualify through one viewer and fail through another — one qualifying row is all the movie needs.",
      "The title test is LIKE '%kids%' — the % wildcards mean 'anything before, anything after', i.e. a plain substring test. SQLite's LIKE folds letter case for ASCII, so 'Kids', 'KIDS' and 'kids' all match; the uppercase title in the seed is there to prove it. GLOB is the case-sensitive sibling (its wildcard is *) for the day the pattern must respect case; the statement pins the convention so the query and the grader agree. The date window is written as a half-open string range — watch_date >= '2020-06-01' AND watch_date < '2020-07-01'; strftime('%Y-%m', watch_date) = '2020-06' is the equivalent one-liner, at the cost of calling a function per row instead of comparing raw strings.",
      "DISTINCT is the dedup that makes this a catalogue rather than a log: movie 3 is watched in June by an admin AND by a member — two qualifying rows that must print as one title. Dedup happens on the projected title AFTER all filters, so it cannot mask a filter bug: the guest's watch, the July watch and the non-kids title all drop before the DISTINCT collapses the survivors. That ordering of operations is worth internalizing — filter first, dedup last — because a DISTINCT applied to a half-filtered join hides missing predicates instead of surfacing them.",
    ],
    edges: [
      "Movie 2 is watched in June by a guest — the role filter alone kills it despite a kids title and a June date.",
      "Movie 5 is watched in June by an admin — the ideal viewer, but the title has no 'kids', so LIKE drops it.",
      "Movie 3's two qualifying watches (admin + member) collapse to ONE title — DISTINCT acts after all filters.",
      "'KIDS Karaoke Night' matches LIKE '%kids%' — ASCII LIKE is case-insensitive; GLOB '*kids*' is its case-sensitive sibling.",
    ],
    ladder: [
      {
        title: "Brute force — scan and dedup in the application",
        body: "Walk the watch log, look up each movie's title and each viewer's role, keep the June kid-friendly rows, and dedup the titles yourself.",
      },
      {
        title: "The pattern — three tables, three predicates",
        body: "Inner-join WatchLog → Movies → Memberships with WHERE LIKE '%kids%', the half-open June range and IN ('member', 'admin'), then SELECT DISTINCT title ORDER BY title.",
      },
      {
        title: "The optimal idea — EXISTS as a semi-join",
        body: "Movies WHERE EXISTS (a qualifying watch) moves the title and role tests into the correlated subquery and needs no dedup, because EXISTS stops at the first hit. Same O(w) probes; the join-plus-DISTINCT form is the easier one to extend with more columns.",
      },
    ],
    approach: "Join WatchLog → Movies → Memberships → three filters (LIKE, half-open June, role IN) → DISTINCT title, sorted",
    schema: {
      ddl: `CREATE TABLE Movies (
  movie_id INTEGER PRIMARY KEY,
  title    TEXT NOT NULL
);
CREATE TABLE Users (
  user_id  INTEGER PRIMARY KEY,
  username TEXT NOT NULL
);
CREATE TABLE Memberships (
  user_id     INTEGER NOT NULL,
  member_role TEXT NOT NULL CHECK (member_role IN ('owner', 'admin', 'member', 'guest')),
  PRIMARY KEY (user_id, member_role)
);
CREATE TABLE WatchLog (
  watch_id   INTEGER PRIMARY KEY,
  movie_id   INTEGER NOT NULL,
  user_id    INTEGER NOT NULL,
  watch_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Movies (movie_id, title) VALUES
  (1, 'Cartoon Kids Hour'),
  (2, 'Kids Science Lab'),
  (3, 'KIDS Karaoke Night'),
  (4, 'kids Bake-Off'),
  (5, 'World Cinema Classics');
INSERT INTO Users (user_id, username) VALUES
  (1, 'mira'),
  (2, 'dev'),
  (3, 'sana'),
  (4, 'leo');
INSERT INTO Memberships (user_id, member_role) VALUES
  (1, 'member'),
  (2, 'guest'),
  (3, 'admin'),
  (4, 'member');
INSERT INTO WatchLog (watch_id, movie_id, user_id, watch_date) VALUES
  (1, 1, 1, '2020-06-05'),
  (2, 2, 2, '2020-06-09'),
  (3, 3, 3, '2020-06-14'),
  (4, 3, 1, '2020-06-21'),
  (5, 4, 3, '2020-07-03'),
  (6, 5, 3, '2020-06-27'),
  (7, 1, 4, '2020-05-31');`,
      tables: [
        {
          name: "Movies",
          note: "5 titles — four contain 'kids' in some case ('Cartoon Kids Hour', 'Kids Science Lab', 'KIDS Karaoke Night', 'kids Bake-Off'); 'World Cinema Classics' does not",
        },
        {
          name: "Memberships",
          note: "one role per user — mira and leo are members, dev is a guest, sana is an admin; no owner appears in the log",
        },
        {
          name: "WatchLog",
          note: "7 watches — the traps: a guest watch (row 2), a July watch (row 5), a non-kids title by an admin (row 6), a May watch (row 7), and movie 3 watched twice in June (rows 3-4)",
        },
      ],
    },
    code: `SELECT DISTINCT m.title            -- a movie may qualify through several watch rows
FROM WatchLog w
JOIN Movies m       ON m.movie_id = w.movie_id
JOIN Memberships mb ON mb.user_id  = w.user_id
WHERE m.title LIKE '%kids%'         -- ASCII LIKE folds case: Kids / KIDS / kids all match
  AND w.watch_date >= '2020-06-01'
  AND w.watch_date <  '2020-07-01'  -- June 2020 as a half-open string range
  AND mb.member_role IN ('member', 'admin')
ORDER BY m.title;`,
    walkthrough: [
      "LIKE '%kids%' admits movies 1-4 and rejects movie 5; case folds silently — 'Kids', 'KIDS' and 'kids' are all hits.",
      "The June window [2020-06-01, 2020-07-01) keeps watch rows 1-4 and 6; row 5 (July 3) and row 7 (May 31) fall out — movie 1 survives on row 1 alone.",
      "The role filter IN ('member', 'admin') drops row 2 (guest); row 6's admin survives the role but died on the title. Survivors: rows 1, 3, 4 → titles 'Cartoon Kids Hour' and 'KIDS Karaoke Night' twice → DISTINCT + ORDER BY prints exactly those two, ascending.",
    ],
    time: "O(w) — one scan of the watch log with constant-time lookups into Movies, Memberships, then the DISTINCT sort",
    space: "O(t) — the distinct qualifying titles held for the dedup",
    followUps: [
      "Count qualifying watches per movie instead of listing titles — what changes in the projection and GROUP BY, and does DISTINCT still belong?",
      "Widen the window to 'the month of each movie's first watch' — why does a fixed literal stop working, and which date function builds the per-movie month key?",
    ],
    related: ["movie-rating", "patients-with-a-condition", "article-views-i"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "the-most-recent-three-orders",
    statement:
      "Buyers lists the shop's buyers and Purchases records one row per purchase with its date. Find the buyers with the most purchases: the three heaviest buyers qualify, and buyers tied on purchase count qualify together. For each qualifying buyer, report their three most recent purchases — name, purchase_id, purchase_date — ordered by name ascending, then purchase_date descending, then purchase_id descending.",
    examples: [
      {
        input:
          "counts: Ivo 4 (2023-03-14 ×2, then 2023-02-02, 2023-01-05), Noor 3, Pia 3, Wren 2",
        output:
          "Ivo · 12 · 2023-03-14 / Ivo · 11 · 2023-03-14 / Ivo · 13 · 2023-02-02 / Noor · 20 · 2023-04-01 / Noor · 22 · 2023-02-27 / Noor · 21 · 2023-01-19 / Pia · 32 · 2023-05-21 / Pia · 30 · 2023-03-30 / Pia · 31 · 2023-03-03",
        explanation:
          "Ivo's 2023-01-05 purchase is the fourth-newest and drops to the cutoff; Wren (2 purchases) never qualifies; Ivo's same-day tie prints the larger id first.",
      },
      {
        input: "counts: a 5, b 3, c 3, d 2",
        output: "(qualifying buyers: a, b, c)",
        explanation:
          "RANK numbers them 1, 2, 2, 4 — rnk <= 3 keeps a, b, c; DENSE_RANK would compress the tail to a 3 and wrongly admit the 2-purchase buyer.",
      },
    ],
    constraints: [
      "the three heaviest buyers by purchase count qualify; buyers tied on count qualify together",
      "each qualifying buyer contributes their 3 most recent purchases; same-date ties order by purchase_id descending (newest id first)",
      "output columns: name, purchase_id, purchase_date — ordered by name ascending, then purchase_date descending, then purchase_id descending",
    ],
    breakdown: [
      "Two different 'top' questions stack here, and they need two different tools. 'The three buyers with the most purchases' is a ranking over an aggregate: COUNT(*) per buyer first, then a rank over those counts — GROUP BY alone cannot rank, and RANK() alone cannot count. 'The three most recent purchases of each of them' is a per-group recency cutoff: ROW_NUMBER() over each buyer's purchases ordered newest-first, keep the first three. Neither window can be pushed into the other's query level — the rank filter and the row-number filter each need their own SELECT, which is why the solution is a chain of CTEs rather than one flat query.",
      "The tie policy decides who counts as 'top three'. Noor and Pia both log 3 purchases — RANK() OVER (ORDER BY buys DESC) makes them peers at rank 2, so rnk <= 3 admits both behind Ivo's rank 1 and excludes Wren, whose 2 purchases land at rank 4. DENSE_RANK compresses the same counts to ranks 1, 2, 2, 3 — and rnk <= 3 would then sweep Wren in; the statement's 'buyers tied on count all qualify together' is what pins RANK. Know the sharp edge of that choice: on a bigger tie (three buyers at rank 2) rnk <= 3 returns more than three buyers — the honest reading of 'tied buyers qualify together', but the row count is data-dependent.",
      "The recency cutoff has its own determinism duty: Ivo has two purchases on 2023-03-14 (ids 11 and 12), so the window order is purchase_date DESC, purchase_id DESC — same-day ties resolve to the larger id first, matching the report's display contract exactly. The cutoff is WHERE rn <= 3 applied AFTER the window (window results cannot appear in the same query level's WHERE), and the top3 membership filter must gate the same CTE: compute ROW_NUMBER over ALL purchases and Wren's rows would waltz through rn <= 3. The final ORDER BY name, purchase_date DESC, purchase_id DESC is pure display — three CTEs of internal orderings, one external contract.",
    ],
    edges: [
      "Ivo has 4 purchases — the oldest (2023-01-05) is the row the rn <= 3 cutoff eats; every other qualifier has exactly 3.",
      "Noor and Pia tie at 3 purchases: RANK makes them peers at rank 2 and both qualify; DENSE_RANK would hand Wren's rank 4 a dense 3 and admit a 2-purchase buyer.",
      "Ivo's two 2023-03-14 purchases order by purchase_id DESC (12 before 11) — same-day ties need the id tiebreaker to be deterministic.",
      "The top3 membership filter and the rn <= 3 cutoff are both load-bearing: row numbers computed over ALL buyers would hand Wren's two rows rn 1 and 2.",
    ],
    ladder: [
      {
        title: "Brute force — eyeball the counts, then N+1 queries",
        body: "Count each buyer's purchases in one query, read off the top three, then run one query per buyer sorting their purchases and take the first three — N+1 queries and manual stitching.",
      },
      {
        title: "The pattern — a chain of three CTEs",
        body: "counts (GROUP BY buyer) → top3 (RANK over the counts, rnk <= 3) → recent (ROW_NUMBER per buyer, newest first, gated by top3) — join back to Buyers for the names.",
      },
      {
        title: "The optimal idea — two window sorts, one pass each",
        body: "One sort over the ~b count rows and one over the qualifying buyers' purchases. The correlated alternative ('purchases where fewer than 3 of this buyer's purchases are newer') works but re-scans per row; the window form pays its sort once.",
      },
    ],
    approach: "COUNT per buyer → RANK the counts, rnk <= 3 → ROW_NUMBER per gated buyer, rn <= 3 → ORDER BY name, date DESC, id DESC",
    schema: {
      ddl: `CREATE TABLE Buyers (
  buyer_id INTEGER PRIMARY KEY,
  name     TEXT NOT NULL
);
CREATE TABLE Purchases (
  purchase_id   INTEGER PRIMARY KEY,
  buyer_id      INTEGER NOT NULL,
  purchase_date TEXT NOT NULL
);`,
      seed: `INSERT INTO Buyers (buyer_id, name) VALUES
  (1, 'Wren'),
  (2, 'Noor'),
  (3, 'Ivo'),
  (4, 'Pia'),
  (5, 'Aki');
INSERT INTO Purchases (purchase_id, buyer_id, purchase_date) VALUES
  (10, 3, '2023-01-05'),
  (11, 3, '2023-03-14'),
  (12, 3, '2023-03-14'),
  (13, 3, '2023-02-02'),
  (20, 2, '2023-04-01'),
  (21, 2, '2023-01-19'),
  (22, 2, '2023-02-27'),
  (30, 4, '2023-03-30'),
  (31, 4, '2023-03-03'),
  (32, 4, '2023-05-21'),
  (40, 1, '2023-06-01'),
  (41, 1, '2023-06-02');`,
      tables: [
        {
          name: "Buyers",
          note: "5 buyers — Aki never purchases (absent from the counts CTE by construction); name order (Ivo, Noor, Pia) deliberately differs from buyer_id order",
        },
        {
          name: "Purchases",
          note: "12 purchases — Ivo 4 (two on 2023-03-14: ids 11, 12), Noor 3, Pia 3, Wren 2 (the rank-4 exclusion)",
        },
      ],
    },
    code: `WITH counts AS (                    -- stage 1: purchases per buyer
    SELECT buyer_id, COUNT(*) AS buys
    FROM Purchases
    GROUP BY buyer_id
),
top3 AS (                           -- stage 2: the heaviest buyers, ties kept together
    SELECT buyer_id
    FROM (
        SELECT buyer_id, RANK() OVER (ORDER BY buys DESC) AS rnk
        FROM counts
    ) ranked
    WHERE rnk <= 3                  -- RANK (not DENSE_RANK): Wren's rank 4 stays out
),
recent AS (                         -- stage 3: qualifying buyers' purchases, newest first
    SELECT
        p.buyer_id,
        p.purchase_id,
        p.purchase_date,
        ROW_NUMBER() OVER (
            PARTITION BY p.buyer_id
            ORDER BY p.purchase_date DESC, p.purchase_id DESC  -- id breaks same-day ties
        ) AS rn
    FROM Purchases p
    WHERE p.buyer_id IN (SELECT buyer_id FROM top3)            -- the gate Wren must fail
)
SELECT
    b.name,
    r.purchase_id,
    r.purchase_date
FROM recent r
JOIN Buyers b ON b.buyer_id = r.buyer_id
WHERE r.rn <= 3                     -- the three most recent of each qualifying buyer
ORDER BY b.name, r.purchase_date DESC, r.purchase_id DESC;`,
    walkthrough: [
      "counts: Ivo 4, Noor 3, Pia 3, Wren 2 (Aki has no rows). RANK over buys DESC: Ivo 1, Noor 2, Pia 2, Wren 4 → rnk <= 3 keeps {Ivo, Noor, Pia}.",
      "recent numbers each qualifying buyer's purchases newest-first: Ivo → 12 (03-14), 11 (03-14), 13 (02-02) at rn 1-3 with 10 (01-05) at rn 4; Noor → 20, 22, 21; Pia → 32, 30, 31.",
      "WHERE rn <= 3 keeps all of Noor's and Pia's rows and drops Ivo's 2023-01-05; ORDER BY name, purchase_date DESC, purchase_id DESC prints Ivo's three rows, then Noor's, then Pia's — 9 rows.",
    ],
    time: "O(p log p) — one sort for the buyer ranks, one for the per-buyer recency windows, one for the final contract",
    space: "O(p) — the CTE rows handed between stages",
    followUps: [
      "Return the buyer(s) whose purchases include the most recent purchase date overall — how does a global MAX compose with the per-buyer ranking you already built?",
      "Fold each qualifying buyer's three most recent purchases into one comma-joined string per buyer — which aggregate over the window output does the folding, and why does the folding order need care?",
    ],
    related: ["second-most-recent-activity", "most-frequently-ordered-product-per-customer", "customer-order-frequency"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "finding-the-topic-of-each-post",
    statement:
      "Keywords assigns lowercase keywords to topics; Posts stores lowercase free-text content. A keyword matches a post when it appears anywhere inside the content as a substring — word boundaries do not matter, so a keyword embedded in a longer word still matches. For every post report each matching keyword; a post that matches no keyword at all gets exactly one row with the literal 'N/A' in the keyword column. Output columns: post_id, keyword, ordered by post_id then keyword.",
    examples: [
      {
        input:
          "post 1: 'the ski season opened early - fresh snow on every slope and the lifts ran all weekend' · keywords: snow, ski, slope (topic 10); knead, oven (topic 20)",
        output: "1 · ski / 1 · slope / 1 · snow",
        explanation:
          "Three of the five keywords appear as substrings; they print in keyword order — 'slope' sorts before 'snow' (second letter l < n), not in the order the keywords were listed.",
      },
      {
        input: "post 3: 'restocking the shop shelves and repainting the front sign' tested against snow, ski, slope, knead, oven",
        output: "3 · N/A",
        explanation:
          "No keyword occurs anywhere in the content — the NOT EXISTS branch owes the post exactly one row with the literal 'N/A'; a join-only query would silently omit it.",
      },
    ],
    constraints: [
      "a keyword matches when it appears as a substring of the content; keywords and content are lowercase, so no case folding is in play",
      "every (post, keyword) match prints; a post with zero matches prints exactly one row with keyword = 'N/A'",
      "output columns: post_id, keyword — ordered by post_id, then keyword",
    ],
    breakdown: [
      "Every post must be tested against every keyword, and the pair space is a CROSS JOIN: posts × keywords, each pair answering one question — does the keyword appear anywhere inside the content? LIKE '%' || keyword || '%' builds the pattern from the keyword itself, so the same statement serves any keyword list without editing it. Substring semantics are the point: 'knead' matches 'kneaded' because the test has no word boundaries — a keyword embedded in a longer word is a hit, not a near-miss. The seed keeps every keyword and every post lowercase, so SQLite's ASCII case-folding in LIKE never changes a verdict; the day case must matter, GLOB ('*' || keyword || '*') or instr(content, keyword) > 0 are the case-sensitive tools.",
      "The N/A branch is an anti-join in a report's clothing: a plain join between posts and their matches vanishes the posts that match nothing, but the report owes every post a row. UNION ALL appends a second SELECT that returns exactly the zero-match posts — WHERE NOT EXISTS (any keyword inside the content) — stamped with the literal 'N/A'. The branches are disjoint by construction, since a post cannot both match and not match, which is why UNION ALL is both correct and cheaper than UNION: the dedup pass would be pure overhead, and worse, it would paper over an overlap bug instead of surfacing it.",
      "The LEFT JOIN + COALESCE alternative is worth knowing because it needs no second branch: left-join posts to the matches CTE and COALESCE(keyword, 'N/A') fills the NULL a match-less post leaves behind — one pass, same rows. The UNION form wins on intent: the two populations (matched, unmatched) stay visibly separate, each with its own predicate, and the 'N/A' literal is greppable at the branch. Ordering a compound SELECT sorts the COMBINED output — the column names come from the first branch, and ORDER BY post_id, keyword lands after the UNION ALL, so the interleaved result emerges sorted no matter which branch produced each row.",
    ],
    edges: [
      "'kneaded' contains 'knead' — substring matching has no word boundaries, so the embedded keyword is a legitimate match.",
      "Post 3 matches nothing and still prints — exactly one row, keyword 'N/A', via the NOT EXISTS branch.",
      "UNION ALL, not UNION: the branches are disjoint by construction, so dedup would be wasted work hiding an overlap bug.",
      "LIKE folds ASCII case, so the lowercase-everywhere convention is load-bearing; GLOB '*kw*' or instr() are the case-sensitive escapes.",
    ],
    ladder: [
      {
        title: "Brute force — substring search in the application",
        body: "For each post, loop the keywords and run a substring search; track which posts matched nothing and emit their N/A rows by hand.",
      },
      {
        title: "The pattern — cross join, then union the empty posts",
        body: "CROSS JOIN posts × keywords filtered by LIKE '%' || keyword || '%' into a matches CTE; UNION ALL a NOT EXISTS branch emitting 'N/A' for the posts with zero matches.",
      },
      {
        title: "The optimal idea — one pass with COALESCE",
        body: "LEFT JOIN posts → matches with COALESCE(keyword, 'N/A') collapses both branches into one pass; the UNION form costs an extra scan of Posts but makes the two populations explicit. Either way the work is p × k substring probes — reach for a full-text index when the corpus grows.",
      },
    ],
    approach: "CROSS JOIN + LIKE match CTE → UNION ALL a NOT EXISTS 'N/A' branch → ORDER BY post_id, keyword",
    schema: {
      ddl: `CREATE TABLE Keywords (
  topic_id INTEGER NOT NULL,
  keyword  TEXT NOT NULL,
  PRIMARY KEY (topic_id, keyword)
);
CREATE TABLE Posts (
  post_id INTEGER PRIMARY KEY,
  content TEXT NOT NULL
);`,
      seed: `INSERT INTO Keywords (topic_id, keyword) VALUES
  (10, 'snow'),
  (10, 'ski'),
  (10, 'slope'),
  (20, 'knead'),
  (20, 'oven');
INSERT INTO Posts (post_id, content) VALUES
  (1, 'the ski season opened early - fresh snow on every slope and the lifts ran all weekend'),
  (2, 'a quiet week in the bakery - we finally fixed the oven door hinge'),
  (3, 'restocking the shop shelves and repainting the front sign'),
  (4, 'grandma kneaded the dough every sunday morning without a recipe'),
  (5, 'the oven manual says to preheat before you knead the brioche');`,
      tables: [
        {
          name: "Keywords",
          note: "5 keywords over 2 topics — winter (snow, ski, slope) and baking (knead, oven), all lowercase by the matching convention",
        },
        {
          name: "Posts",
          note: "5 posts — post 1 matches 3 keywords, post 2 and 4 match 1 each (post 4's 'kneaded' embeds 'knead'), post 5 matches 2, post 3 matches nothing (the N/A row)",
        },
      ],
    },
    code: `WITH matches AS (       -- every (post, keyword) pair that hits
    SELECT p.post_id, k.keyword
    FROM Posts p
    CROSS JOIN Keywords k
    WHERE p.content LIKE '%' || k.keyword || '%'   -- substring test; both sides lowercase by convention
)
SELECT post_id, keyword
FROM matches
UNION ALL
SELECT post_id, 'N/A'
FROM Posts p
WHERE NOT EXISTS (      -- the zero-match branch: exactly one row per empty post
    SELECT 1
    FROM Keywords k
    WHERE p.content LIKE '%' || k.keyword || '%'
)
ORDER BY post_id, keyword;`,
    walkthrough: [
      "matches: post 1 × {ski, snow, slope}; post 2 × {oven}; post 4 × {knead} (inside 'kneaded'); post 5 × {knead, oven}; post 3 contributes nothing.",
      "The NOT EXISTS branch finds no keyword in post 3's content and emits exactly one row: (3, 'N/A').",
      "UNION ALL stacks 3 + 1 + 1 + 2 + 1 = 8 rows and ORDER BY post_id, keyword sorts the combined output — within post 1, 'ski' < 'slope' < 'snow' (compare the second letters k < l < n).",
    ],
    time: "O(p × k × L) — every keyword probed against every post at string-search cost L",
    space: "O(p × k) worst case — the match pairs held before the union",
    followUps: [
      "Assign each post the topic of its strongest keyword presence — how would you aggregate matches per (post, topic) before picking, and what happens when two topics tie?",
      "Restrict matches to whole-word occurrences — why can't LIKE express word boundaries, and which mechanism (GLOB character classes or a split-words CTE) would you reach for?",
    ],
    related: ["invalid-tweets", "fix-names-in-a-table", "reported-posts"],
    order: "exact",
    xp: 35,
  },
];
