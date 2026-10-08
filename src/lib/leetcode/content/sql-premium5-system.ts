// Deep-dives — LeetCode Premium batch IX, file 2 of 6: call logs, server
// windows, seat calendars, parking meters, login pairs and moderation rules
// (4 Medium, 2 Easy). Engine-verified by scripts/tmp-69b2-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_SYSTEM: LcSqlDive[] = [
  {
    slug: "find-longest-calls",
    statement:
      "A phone log keeps one row per call: who placed it (caller_id), who answered (receiver_id), how many minutes it lasted, and when it was placed. For each caller, report the columns caller_id, call_id, duration_minutes — one row per caller, ordered by caller_id ascending — describing that caller's longest placed call: the call with the greatest duration_minutes among the calls they placed. If two of a caller's placed calls tie on duration, report the one with the smaller call_id, so exactly one row per caller ships.",
    examples: [
      {
        input: "caller 102 placed three calls: call 4 ran 18 minutes, call 5 ran 9 minutes, and call 7 — placed later that day — ran 18 minutes again",
        output: "102 · 4 · 18",
        explanation:
          "The two 18-minute calls tie on duration, so the smaller call_id 4 is reported — even though call 7 carries both the larger id and the later timestamp.",
      },
      {
        input: "caller 104 placed two calls, call 6 and call 9, both logging 0 minutes on the meter",
        output: "104 · 6 · 0",
        explanation:
          "Both calls tie at zero, the smaller id wins, and a zero-duration call is still a placed call — caller 104 earns a row like everyone else.",
      },
    ],
    constraints: [
      "one row per caller_id found in PhoneCall; duration_minutes is that caller's MAX over the calls they placed",
      "the reported call_id is the smallest id among that caller's calls sharing the maximum duration — ties never yield two rows",
      "columns caller_id, call_id, duration_minutes, ordered by caller_id ascending",
    ],
    breakdown: [
      "This report couples an aggregate with a fact, which makes it a top-1-per-group problem rather than a GROUP BY problem. The longest duration per caller is an aggregate, but the call_id attached to it belongs to one specific row — the row that wins the maximum — and an aggregate cannot tell the engine which row it came from. ROW_NUMBER() OVER (PARTITION BY caller_id ORDER BY duration_minutes DESC, call_id ASC) numbers each caller's calls from their longest down, and rn = 1 marks exactly one winning row per caller. Because the tie-break lives inside the window's ORDER BY, the winner is decided before any row is filtered, and one row per caller is guaranteed by construction.",
      "The tie rule is not decoration — it decides two of the four output rows on this seed. Caller 102's calls 4 and 7 both ran 18 minutes, and caller 104's calls 6 and 9 both ran 0; without a second ORDER BY key the window would rank those ties arbitrarily and the report would be engine luck. Adding call_id ASC after duration_minutes DESC states 'smallest id wins' exactly where ties are resolved. A recency tie-break (call_time DESC) reads plausibly but ships the wrong rows here, because both losing calls carry later timestamps than their winners. The same rule documented in prose only helps readers — the ORDER BY is where the engine actually enforces it.",
      "The receiver column is the quiet trap. Every row names two users, and only one of them placed the call; the report's grain is the caller side alone. A query that folds both roles together — say, a UNION of caller_id and receiver_id before ranking — re-grains the log into 'users involved', and caller 103 suddenly owns a 30-minute call they only answered (call 3, placed by 101) on top of the 14-minute call they actually made. The partition key is what defines who the report is about: PARTITION BY caller_id counts placed calls, and nothing about a received call may inflate a caller's maximum.",
    ],
    edges: [
      "The tie rule: caller 102's calls 4 and 7 both ran 18 minutes and call 7 has the later id AND the later timestamp — a call_time DESC tie-break ships (102, 7, 18); only duration_minutes DESC, call_id ASC keeps (102, 4, 18).",
      "The receiver leak: caller 103 placed one 14-minute call (call 8) but answered a 30-minute call (call 3, placed by 101) — ranking both roles reports (103, 3, 30) and invents three receiver rows for 201, 202 and 203.",
      "The zero-duration tie: caller 104's calls 6 and 9 both ran 0 minutes — they still form caller 104's maximum, and a duration_minutes > 0 guard would erase the caller entirely instead of reporting (104, 6, 0).",
      "Caller 101 needs no tie-break — their clear max is call 3 at 30 minutes — but call 3 is precisely the row the receiver-leak query steals for caller 103.",
    ],
    ladder: [
      { title: "Brute force — sort and scan per caller", body: "Group the calls by caller in application code, sort each group by duration descending with the smallest id breaking ties, and read the first row. Correct, but it is a manual top-1-per-group the window expresses in one line." },
      { title: "The pattern — window ranking with an encoded tie policy", body: "ROW_NUMBER() OVER (PARTITION BY caller_id ORDER BY duration_minutes DESC, call_id ASC) numbers every call within its caller; keeping rn = 1 keeps exactly the longest call, smallest id on ties." },
      { title: "The optimal idea — decide ties before you filter", body: "O(n log n). The transferable rule: a per-group argmax with a tie policy is a window ranking whose ORDER BY carries both the metric and the tie-break — and filters that change the grain (receiver sides, zero rows) must never touch the input." },
    ],
    approach: "ROW_NUMBER over (PARTITION BY caller_id ORDER BY duration_minutes DESC, call_id) = 1 — each caller's longest call, smallest id winning ties",
    schema: {
      ddl: `CREATE TABLE PhoneCall (
  call_id          INTEGER PRIMARY KEY,
  caller_id        INTEGER NOT NULL,
  receiver_id      INTEGER NOT NULL,
  duration_minutes INTEGER NOT NULL,
  call_time        TEXT NOT NULL  -- 'YYYY-MM-DD HH:MM'
);`,
      seed: `INSERT INTO PhoneCall (call_id, caller_id, receiver_id, duration_minutes, call_time) VALUES
  (1, 101, 201, 12, '2024-06-01 09:00'),
  (2, 101, 202, 25, '2024-06-01 14:30'),
  -- call 3: caller 103 only ANSWERS it - the receiver-leak bait
  (3, 101, 103, 30, '2024-06-02 08:15'),
  (4, 102, 203, 18, '2024-06-02 10:00'),  -- 102's tie winner: the smaller id
  (5, 102, 201,  9, '2024-06-02 18:45'),
  (6, 104, 202,  0, '2024-06-03 09:40'),  -- zero-length tie: the smaller id wins
  (7, 102, 202, 18, '2024-06-03 12:00'),  -- 102's tie loser: LATER id and later time
  (8, 103, 201, 14, '2024-06-03 15:20'),
  (9, 104, 203,  0, '2024-06-04 09:05');`,
      tables: [
        { name: "PhoneCall", note: "9 calls — 101 and 102 placed three each, 103 placed one (and answered a 30-minute call), 104 placed two zero-length calls; 201-203 only receive" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        caller_id,
        call_id,
        duration_minutes,
        ROW_NUMBER() OVER (
            PARTITION BY caller_id
            ORDER BY duration_minutes DESC, call_id ASC  -- metric first, smallest-id tie-break second
        ) AS rn
    FROM PhoneCall
)
SELECT caller_id, call_id, duration_minutes
FROM ranked
WHERE rn = 1               -- exactly one winning call per caller
ORDER BY caller_id;`,
    walkthrough: [
      "PARTITION BY caller_id splits nine calls into four timelines: 101 with three calls, 102 with three, 103 with one, 104 with two — each sorted by duration descending, then call_id ascending.",
      "The rn = 1 rows fall out: 101's call 3 (30 minutes), 102's call 4 (18 minutes — ranked ahead of the later id 7 at the same 18), 103's call 8 (14 minutes), and 104's call 6 (0 minutes — ahead of id 9 at the same 0).",
      "ORDER BY caller_id ships (101, 3, 30), (102, 4, 18), (103, 8, 14), (104, 6, 0) — and call 3, the 30-minute call 103 merely answered, stays credited to 101.",
    ],
    time: "O(n log n) — one partitioned sort feeding the ranking",
    space: "O(n) — the ranked rows held until rn = 1 is filtered",
    followUps: [
      "Report each caller's longest RECEIVED call beside their longest placed one — how do the two partitions combine into one row per caller, and what shows for 201, 202 and 203, who never place a call?",
      "Add a total-minutes column per caller — does the total need a second window or its own CTE, and why can the two aggregates not share a single PARTITION BY with the ranking?",
    ],
    related: ["game-play-analysis-ii", "bikes-last-time-used", "department-highest-salary"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "server-utilization-time",
    statement:
      "A fleet logs each maintenance session as one row: which server it ran on, when it started and when it ended (end is always after start), and one server's sessions never overlap. A server's observed window is the span from its earliest start_time to its latest end_time — idle stretches inside that span count against it. Report one row per server, ordered by server_id ascending, with columns server_id, total_minutes (the SUM of its session durations in minutes) and utilization_pct (100.0 times total_minutes divided by the minutes in the observed window, rounded to 2 decimals). A server whose sessions cover its whole window reports 100.0.",
    examples: [
      {
        input: "server 1 ran one session from 09:00 to 11:00 and a second from 11:00 straight through to 14:00 — back to back",
        output: "1 · 300 · 100.0",
        explanation:
          "The durations sum to 120 + 180 = 300 minutes and the window 09:00 to 14:00 is also 300 minutes, so the ratio is exactly 1 and no special case is needed.",
      },
      {
        input: "server 2 ran 08:00 to 09:30 and then 12:15 to 14:45, leaving 165 idle minutes in between",
        output: "2 · 240 · 59.26",
        explanation:
          "90 + 150 = 240 busy minutes sit inside a 405-minute window (08:00 through 14:45); 100.0 * 240 / 405 = 59.259 with more nines, which rounds to 59.26.",
      },
    ],
    constraints: [
      "total_minutes counts session time only; the observed window runs from the server's MIN(start_time) to its MAX(end_time) and includes every idle gap",
      "utilization_pct = ROUND(100.0 * total_minutes / observed_minutes, 2); a single-session server reports 100.0 with no special case, since its window is exactly its own session",
      "columns server_id, total_minutes, utilization_pct, ordered by server_id ascending",
    ],
    breakdown: [
      "Two aggregates at different scopes share one GROUP BY. The busy total is a SUM over the server's session rows, while the observed window is built from the extremes of the same group — MIN(start_time) to MAX(end_time) — so a single grouped pass computes both. The denominator is the part that carries meaning: summing the durations and dividing that total by itself would print 100.0 for every server, idle gaps and all, which is precisely the number the report exists to correct. Server 2 is the reason the window definition exists: its 165 idle minutes live between sessions and belong in the denominator even though no session row represents them.",
      "Timestamps are TEXT, and SQLite offers two converters with very different risk profiles. The function strftime('%s', ts) returns INTEGER seconds since the epoch, so a difference of two of them is an exact integer, and dividing by 60 stays exact because the seed's gate times are whole minutes. By contrast, julianday(ts) returns REAL days — a 61-minute span measures 60.9999997 on this engine, and CAST to INTEGER quietly truncates it to 60, a silently wrong busy total. The query picks one representation, states it in a comment, and never mixes the two.",
      "The percentage is where integer arithmetic bites. SQLite divides INTEGER by INTEGER by truncating, so 100 * 240 / 405 is 59 before ROUND ever sees it — the 100.0 promotion must happen BEFORE the slash, letting the ratio stay REAL through the division. ROUND(..., 2) is presentation, applied once at the very end. Single-session servers need no CASE: server 3's window is exactly its one session, numerator equals denominator by construction, and 100.0 falls out of the same formula — a special case would be a code path that never fires.",
    ],
    edges: [
      "Server 2's gap: the 165 idle minutes from 09:30 to 12:15 appear in no session row yet belong in the window — a denominator built from the SUM alone reports 100.0 for a server that idled a third of its day.",
      "The 100.0 promotion: with plain INTEGER 100 * 240 / 405, server 2 prints 59 (and ROUND(59, 2) stays 59.0) instead of 59.26 — the promotion must precede the slash.",
      "Server 1's back-to-back boundary: session 2 ends at 11:00, the instant session 3 starts — no overlap means no double count, and the busy total lands exactly on the 300-minute window for 100.0.",
      "Raw TEXT arithmetic: MAX(end_time) - MIN(start_time) subtracts the coerced year numbers (2024 - 2024 = 0), and 100.0 * total / 0 is NULL — only strftime('%s') converts the timestamps honestly.",
    ],
    ladder: [
      { title: "Brute force — measure by hand", body: "For each server, add up session lengths on a calculator, then measure first-start to last-end on the calendar and divide. Three numbers per server the engine computes in one grouped pass." },
      { title: "The pattern — one GROUP BY, two aggregates, one ratio", body: "GROUP BY server_id with SUM of per-session minute deltas plus MIN(start_time) and MAX(end_time) for the window; the ratio is a plain SELECT expression over the grouped columns." },
      { title: "The optimal idea — define the denominator before you code", body: "O(n log n). The durable rule: utilization-style reports live or die on the denominator's definition — span versus sum decides the answer, and the REAL promotion must precede integer division." },
    ],
    approach: "GROUP BY server_id: SUM of strftime('%s') minute deltas over the MIN(start)-to-MAX(end) span, ratio promoted to REAL then ROUNDed",
    schema: {
      ddl: `CREATE TABLE ServerSession (
  session_id INTEGER PRIMARY KEY,
  server_id  INTEGER NOT NULL,
  start_time TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM'
  end_time   TEXT NOT NULL   -- always after start_time
);`,
      seed: `INSERT INTO ServerSession (session_id, server_id, start_time, end_time) VALUES
  (1, 1, '2024-06-03 09:00', '2024-06-03 11:00'),
  (2, 1, '2024-06-03 11:00', '2024-06-03 14:00'),
  -- sessions 1+2 touch at 11:00: total 300 equals the 09:00-to-14:00 window
  (3, 2, '2024-06-03 08:00', '2024-06-03 09:30'),
  (4, 2, '2024-06-03 12:15', '2024-06-03 14:45'),
  -- the 09:30-to-12:15 idle stretch belongs in server 2's denominator
  (5, 3, '2024-06-04 10:00', '2024-06-04 11:40');`,
      tables: [
        { name: "ServerSession", note: "5 sessions over 3 servers — server 1 back to back (300 of 300 minutes), server 2 with a 165-minute gap (240 of 405), server 3 one session (100 of 100)" },
      ],
    },
    code: `WITH spans AS (
    SELECT
        server_id,
        SUM(
            (strftime('%s', end_time) - strftime('%s', start_time)) / 60
        ) AS total_minutes,
        -- window = earliest start through latest end, in INTEGER seconds
        (strftime('%s', MAX(end_time)) - strftime('%s', MIN(start_time))) / 60 AS observed_minutes
    FROM ServerSession
    GROUP BY server_id
)
SELECT
    server_id,
    total_minutes,
    ROUND(100.0 * total_minutes / observed_minutes, 2) AS utilization_pct  -- 100.0 promotes BEFORE the slash
FROM spans
ORDER BY server_id;`,
    walkthrough: [
      "GROUP BY forms three server groups and the minute deltas are INTEGER-exact: server 1 sums 120 + 180 = 300, server 2 sums 90 + 150 = 240, server 3 sums 100.",
      "The windows come from the extremes: server 1 spans 09:00 to 14:00 (300 minutes), server 2 spans 08:00 to 14:45 (405 minutes, gap included), server 3 spans its own session (100 minutes).",
      "The ratios ship ordered by server_id: (1, 300, 100.0), then (2, 240, 59.26) from 100.0 * 240 / 405, then (3, 100, 100.0) — the single-session server needed no special case.",
    ],
    time: "O(n log n) — one grouped pass plus the engine's grouping overhead",
    space: "O(s) — one row per server",
    followUps: [
      "Report each server's LONGEST idle stretch inside its window — how would you measure the gap between consecutive sessions, and what do back-to-back and single-session servers show?",
      "Bucket servers into under-50, 50-to-80 and over-80 utilization bands — where does the CASE sit relative to the CTE, and does the band label need its own ordering key?",
    ],
    related: ["find-total-time-spent-by-each-employee", "user-activity-for-the-past-30-days-i", "calculate-compressed-mean"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "consecutive-available-seats-ii",
    statement:
      "A booking grid stores one row per seat per day of the week: seat_id, day (1 through 7), and is_free (1 if the seat is open that day, 0 if taken). A seat is bookable for k consecutive days when it has k day numbers in a row — 3, 4, 5 — all free. Report every seat whose longest free run reaches at least 3 consecutive days: columns seat_id, best_run (the length of that longest run), ordered by seat_id ascending. Days 1 through 7 never wrap: a run ending at day 7 does not continue into another week.",
    examples: [
      {
        input: "seat 2 is taken on day 1, free on days 2, 3, 4, taken on day 5, free on days 6 and 7",
        output: "2 · 3",
        explanation:
          "The free days form runs of 3 (days 2-4) and 2 (days 6-7); the longest run is exactly 3, which still qualifies — the bar is at least 3, not more than 3.",
      },
      {
        input: "seat 4 is free on days 1, 2, 4 and 5 — four free days, but day 3 is taken",
        output: "(no row — seat 4 is out)",
        explanation:
          "Four free days is not three consecutive: the taken day 3 splits the week into runs of 2 and 2, and a free-day COUNT cannot see the difference.",
      },
    ],
    constraints: [
      "runs are consecutive DAY NUMBERS within one seat — the calendar is days 1 through 7 with no wraparound between weeks",
      "best_run is the longest run of free days; seats whose best_run is at least 3 qualify — exactly 3 qualifies, 2 does not",
      "columns seat_id, best_run, ordered by seat_id ascending",
    ],
    breakdown: [
      "Consecutiveness is a grouping question wearing a sequence costume. Sort each seat's free days and number them in that order: inside an unbroken run, day grows by exactly 1 per step and so does ROW_NUMBER — so day minus ROW_NUMBER is constant across the run and jumps the moment a day is skipped. That constant is an island key, and a GROUP BY (seat_id, island_key) turns each run into one row with its length as COUNT. This gaps-and-islands trick converts 'three days in a row' from a loop over neighbors into ordinary grouped arithmetic.",
      "The free filter must run BEFORE the numbering, and the seed proves it. Numbering ALL seven days of a seat keeps day and ROW_NUMBER rising together every single day — taken days included — so every seat collapses into one island of 7 and every seat qualifies with best_run 7. Filter is_free = 1 first and the taken days drop out of the timeline; the next free day then reuses a smaller ROW_NUMBER, the difference jumps, and the island splits exactly where the seat was busy. Filter placement is not an optimization here — it is the difference between the answer and its negation.",
      "The report's grain is the seat, but runs live below it, so a second GROUP BY lifts island lengths to seat level via MAX(run_len). The HAVING then applies the business rule at the right grain: MAX(run_len) >= 3 — at least, not more than. Seat 2 is the boundary case: its best run is exactly 3 and must ship, while a HAVING MAX(run_len) > 3 silently drops it. And seat 4 shows why the island stage exists at all — four free days spread as 2 + 2 never reach the bar, which a COUNT of free days cannot detect.",
    ],
    edges: [
      "Seat 4's split: free on days 1, 2, 4, 5 — four free days, best run 2 — the day-rn island key splits at the taken day 3, while a free-day COUNT >= 3 wrongly admits it.",
      "Seat 3 is the same shape from a different angle: two separate 2-runs (days 1-2 and 4-5), best_run 2 — out, showing the report measures the LONGEST run, not the total of free days.",
      "Seat 2's boundary: days 2-4 give best_run exactly 3 and the seat must ship — HAVING MAX(run_len) > 3 is the off-by-one that drops it.",
      "Seat 5's full week: one unbroken island of 7 — the ceiling of the data, and the only row that survives even a badly loosened threshold.",
    ],
    ladder: [
      { title: "Brute force — walk the week", body: "For each seat, scan days 1 through 7 keeping a current-streak counter that resets on a taken day, and remember the best streak seen. Works, but it is a per-seat loop the engine expresses as one grouped pass." },
      { title: "The pattern — gaps and islands", body: "Filter the free rows, number them per seat by day, subtract to get the island key, COUNT per (seat, island) for run lengths, then MAX per seat." },
      { title: "The optimal idea — consecutive becomes constant", body: "O(n log n). The transferable rule: 'consecutive elements' questions collapse when a rank-compatible quantity minus ROW_NUMBER is constant inside a run — the constant becomes a GROUP BY key." },
    ],
    approach: "islands on free rows: day - ROW_NUMBER per seat is the run key, COUNT per island, MAX per seat, HAVING MAX >= 3",
    schema: {
      ddl: `CREATE TABLE SeatDay (
  seat_id INTEGER NOT NULL,
  day     INTEGER NOT NULL,  -- 1 through 7, one calendar week
  is_free INTEGER NOT NULL,  -- 1 free, 0 taken
  PRIMARY KEY (seat_id, day)
);`,
      seed: `INSERT INTO SeatDay (seat_id, day, is_free) VALUES
  (1, 1, 1), (1, 2, 1), (1, 3, 1), (1, 4, 1),  -- seat 1: champion run of 4 (days 1-4)
  (1, 5, 0), (1, 6, 0), (1, 7, 0),
  (2, 1, 0),
  (2, 2, 1), (2, 3, 1), (2, 4, 1),  -- seat 2: exactly 3 (days 2-4) plus a 2-run after
  (2, 5, 0), (2, 6, 1), (2, 7, 1),
  (3, 1, 1), (3, 2, 1),
  (3, 3, 0),
  (3, 4, 1), (3, 5, 1),  -- seat 3: two separate 2-runs, out
  (3, 6, 0), (3, 7, 0),
  (4, 1, 1), (4, 2, 1),
  (4, 3, 0),  -- the split: four free days as 2+2, never 3 in a row
  (4, 4, 1), (4, 5, 1),
  (4, 6, 0), (4, 7, 0),
  (5, 1, 1), (5, 2, 1), (5, 3, 1), (5, 4, 1), (5, 5, 1), (5, 6, 1), (5, 7, 1);`,
      tables: [
        { name: "SeatDay", note: "5 seats x 7 days = 35 rows — free runs of 4, 3+2, 2+2, 2+2, and 7 consecutive days respectively" },
      ],
    },
    code: `WITH free_days AS (
    SELECT seat_id, day
    FROM SeatDay
    WHERE is_free = 1        -- occupied rows must leave BEFORE the numbering
),
islands AS (
    SELECT
        seat_id,
        day,
        day - ROW_NUMBER() OVER (
            PARTITION BY seat_id
            ORDER BY day
        ) AS island_key      -- constant inside a run, jumps across a gap
    FROM free_days
),
runs AS (
    SELECT seat_id, island_key, COUNT(*) AS run_len
    FROM islands
    GROUP BY seat_id, island_key
)
SELECT seat_id, MAX(run_len) AS best_run
FROM runs
GROUP BY seat_id
HAVING MAX(run_len) >= 3    -- at least 3: exactly 3 still qualifies
ORDER BY seat_id;`,
    walkthrough: [
      "The free filter keeps 24 of the 35 rows, and the island keys form per seat: seat 1's days 1-4 share one key (a single island of 4), while seat 2's days 2-4 share a key and 6-7 share another (islands of 3 and 2).",
      "Seat 4 shows the split: free days 1, 2, 4, 5 land in islands of 2 and 2 because the taken day 3 jumps the key — and seat 5's whole week is one island of 7.",
      "MAX per seat gives best_run 4, 3, 2, 2, 7, and HAVING >= 3 ships (1, 4), (2, 3), (5, 7) — the two split seats stay out despite holding four free days each.",
    ],
    time: "O(n log n) — one ordered window pass plus two grouped passes",
    space: "O(n) — the filtered rows and one row per island",
    followUps: [
      "Report each qualifying seat's FIRST day of its longest run — after the islands stage, which window or join surfaces the run's starting day, and what does seat 2 show once two runs of different lengths exist?",
      "Extend the calendar to k weeks (day 1 through 7k) — does the island key survive the larger day numbers untouched, and why does the no-wrap rule become a real constraint only when weeks chain?",
    ],
    related: ["exchange-seats", "game-play-analysis-iv", "tree-node"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "calculate-parking-fees-and-duration",
    statement:
      "A garage logs each visit as one row: stay_id, the vehicle's plate, the entry_time and the exit_time (exit is always after entry; timestamps are 'YYYY-MM-DD HH:MM' text). The garage bills a flat 4 per hour STARTED. Report one row per stay, ordered by stay_id ascending, with columns stay_id, plate, minutes (total minutes parked), hours_billed (minutes divided by 60 and rounded UP — any part of an hour bills a full hour, while an exact number of hours bills exactly that many) and fee (hours_billed times the flat 4).",
    examples: [
      {
        input: "plate MRF-88 entered at 2024-06-03 09:30 and left at 10:31 — 61 minutes",
        output: "2 · MRF-88 · 61 · 2 · 8",
        explanation:
          "One minute past a full hour starts a second hour: 61 / 60.0 is 1.0166 and CEIL lifts it to 2, so the fee is 2 * 4 = 8.",
      },
      {
        input: "plate PLM-5 parked from 14:20 to 14:50 — 30 minutes",
        output: "4 · PLM-5 · 30 · 1 · 4",
        explanation:
          "Any part of an hour bills the whole hour: CEIL(0.5) is 1, so even a half-hour stay pays a full hour — a partial visit is never rounded down to free.",
      },
    ],
    constraints: [
      "minutes is the full timestamp delta in minutes; entry is strictly before exit, so minutes >= 1",
      "hours_billed = CEIL(minutes / 60.0): 60 minutes bills 1 hour, 61 bills 2, 1439 bills 24 — the division must be REAL before CEIL sees it",
      "fee is flat: hours_billed * 4; columns stay_id, plate, minutes, hours_billed, fee, ordered by stay_id ascending",
    ],
    breakdown: [
      "The arithmetic chain is minutes, then hours, then money — and each link has a classic way to snap. The minute delta comes from timestamps stored as TEXT: strftime('%s', ts) converts each endpoint to INTEGER seconds, the difference is exact, and dividing by 60 stays exact because the gates record whole minutes. Direct TEXT subtraction is not arithmetic at all — '2024-06-03 10:31' minus '2024-06-03 09:30' coerces both sides to the year 2024 and yields 0, silently billing every car zero minutes.",
      "The rounding rule is where the money is. CEIL answers 'how many hours started?' — but only over REAL division: CEIL(61 / 60.0) is 2 because 61/60.0 is 1.0166, while the same shape over INTEGER division computes 61 / 60 = 1 first and CEIL(1) stays 1, undercharging the 61-minute stay by a full hour. The boundary points prove both directions: stay 1 parked exactly 60 minutes and bills exactly 1 (a floor-plus-one habit would charge 2), and stay 4's 30 minutes still bill a full hour because CEIL(0.5) is 1. ROUND is the wrong tool on the top end — it would round 1.0166 down to 1, matching CEIL only by accident on the half-hour.",
      "The engine choice for the delta is load-bearing too. The alternative julianday route — CAST((julianday(exit_time) - julianday(entry_time)) * 24 * 60 AS INTEGER) — works in REAL days, and float representation shows its teeth on this seed: the exact-hour stay 1 measures 59.9999 REAL minutes and CAST truncates it to 59, the 61-minute stay 2 truncates to 60, and the 1439-minute stay 3 to 1438. Each truncation moves a billing boundary: stay 2 would bill 1 hour instead of 2. INTEGER seconds from strftime('%s') cannot suffer this — they are exact by construction.",
    ],
    edges: [
      "Stay 2 (61 minutes) is the undercharge probe: INTEGER division computes 61 / 60 = 1 inside CEIL and bills 1 hour / 4 — the REAL promotion inside the division is the whole fix.",
      "Stay 1 (exactly 60 minutes) is the overcharge probe: the boundary bills exactly 1 hour — FLOOR(minutes / 60.0) + 1 charges it 2 hours / 8.",
      "Stay 3 (23 h 59 min = 1439 minutes) bills 24 — one minute short of a day still starts a 24th hour, and the julianday CAST variant truncates its delta to 1438 minutes.",
      "Stay 4 (30 minutes) bills a full hour: CEIL(0.5) is 1 — without the REAL denominator, INTEGER 30 / 60 = 0 bills nothing at all.",
    ],
    ladder: [
      { title: "Brute force — a meter in code", body: "Convert both timestamps to seconds in the application, subtract, divide by 60 with a decimal type, apply a ceiling function, multiply by the rate. Four moving parts the engine does in two expressions." },
      { title: "The pattern — CTE chain: delta, then bill", body: "A first CTE computes INTEGER minutes via strftime('%s'); a second applies CAST(CEIL(minutes / 60.0) AS INTEGER); the outer SELECT multiplies the flat rate." },
      { title: "The optimal idea — know your division", body: "O(n). The durable rule: CEIL semantics require REAL operands, INTEGER division pre-truncates before the ceiling can act, and timestamp math belongs in INTEGER seconds — not REAL days." },
    ],
    approach: "strftime('%s') delta gives exact minutes; CAST(CEIL(minutes / 60.0) AS INTEGER) hours started; flat fee = hours * 4",
    schema: {
      ddl: `CREATE TABLE ParkingStay (
  stay_id    INTEGER PRIMARY KEY,
  plate      TEXT NOT NULL,
  entry_time TEXT NOT NULL,  -- 'YYYY-MM-DD HH:MM'
  exit_time  TEXT NOT NULL   -- always after entry_time
);`,
      seed: `INSERT INTO ParkingStay (stay_id, plate, entry_time, exit_time) VALUES
  -- 60 minutes exactly: bills 1 hour, not 2
  (1, 'KDA-204', '2024-06-03 08:00', '2024-06-03 09:00'),
  -- 61 minutes: the part-hour boundary, bills 2
  (2, 'MRF-88', '2024-06-03 09:30', '2024-06-03 10:31'),
  -- 23 h 59 min: one minute short of a day, bills 24
  (3, 'TXR-11', '2024-06-01 07:25', '2024-06-02 07:24'),
  -- 30 minutes: a partial hour still bills a full hour
  (4, 'PLM-5', '2024-06-04 14:20', '2024-06-04 14:50');`,
      tables: [
        { name: "ParkingStay", note: "4 stays — 60 exact minutes, 61 minutes, 1439 minutes (23 h 59) and 30 minutes; the flat rate is 4 per hour started" },
      ],
    },
    code: `WITH timed AS (
    SELECT
        stay_id,
        plate,
        (strftime('%s', exit_time) - strftime('%s', entry_time)) / 60 AS minutes
        -- INTEGER seconds delta: exact for whole-minute gates
    FROM ParkingStay
),
billed AS (
    SELECT
        stay_id,
        plate,
        minutes,
        CAST(CEIL(minutes / 60.0) AS INTEGER) AS hours_billed
        -- REAL division feeds CEIL: 61/60.0 = 1.0166 -> 2, 60/60.0 = 1.0 -> 1
    FROM timed
)
SELECT stay_id, plate, minutes, hours_billed, hours_billed * 4 AS fee
FROM billed
ORDER BY stay_id;`,
    walkthrough: [
      "The timed CTE turns four stay rows into minute counts via INTEGER seconds: 60, 61, 1439 and 30 — direct TEXT subtraction would have produced four zeros.",
      "The billed CTE applies the hours-started rule over REAL division: 60/60.0 is 1.0 (bills 1), 61/60.0 is 1.0166 (bills 2), 1439/60.0 is 23.98 (bills 24), 30/60.0 is 0.5 (bills 1).",
      "The outer SELECT multiplies the flat 4 and ships ordered by stay_id: (1, KDA-204, 60, 1, 4), (2, MRF-88, 61, 2, 8), (3, TXR-11, 1439, 24, 96), (4, PLM-5, 30, 1, 4).",
    ],
    time: "O(n) — one pass to convert, one to bill",
    space: "O(n) — the two CTEs hold one row per stay",
    followUps: [
      "Add a per-day revenue report — how would you group fee revenue by the entry DATE, and does a stay crossing midnight belong to its entry day or split across two?",
      "Introduce a first-60-minutes-free grace rule — where does the CASE sit relative to CEIL, and what does a 45-minute stay owe under it?",
    ],
    related: ["calculate-compressed-mean", "monthly-transactions-i", "top-travellers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "second-day-verification",
    statement:
      "A login ledger keeps one row per user per day they signed in: login_id, user_id, login_date (a user never has two rows on the same date). A retention check asks one narrow question per user: did they sign in on some date AND also on the next calendar day? Report a single column user_id holding every user with at least one such back-to-back pair, ordered by user_id ascending — each qualifying user exactly once, no matter how many pairs they have.",
    examples: [
      {
        input: "user 71 signed in on 2024-06-10 and again on 2024-06-11; user 72 signed in on 2024-06-10 and then not until 2024-06-12",
        output: "71 in, 72 out",
        explanation:
          "71's two dates are adjacent calendar days — one qualifying pair. 72's dates straddle a one-day gap: adjacent ledger rows, but not adjacent days.",
      },
      {
        input: "user 73 signed in on 2024-05-31 and on 2024-06-01",
        output: "73",
        explanation:
          "The day after 2024-05-31 IS 2024-06-01 — the pair crosses a month boundary, and the next-day test must roll the month the way the calendar does.",
      },
    ],
    constraints: [
      "one row per (user_id, login_date), so next-day logic can rely on dates alone without de-duplicating same-day logins",
      "the pair must be the next CALENDAR day — month and year boundaries roll normally (2024-05-31 is followed by 2024-06-01)",
      "single column user_id, ordered ascending, one row per qualifying user",
    ],
    breakdown: [
      "The property is about a RELATION between two of a user's own rows, not about any single row — so the natural shape is a self-join. Join the ledger to itself on user_id with the date condition julianday(b.login_date) = julianday(a.login_date) + 1, and every surviving pair is a verified back-to-back day pair. The condition is deliberately directional: b must be the day AFTER a, which counts each adjacent pair once and can never match a row to itself. An EXISTS subquery expresses the same relation; the join form merely makes the pair grain visible.",
      "Calendar arithmetic is where naive attempts die. TEXT dates like '2024-05-31' sort correctly, but they do not ADD correctly — the expression login_date + 1 coerces the string to the number 2024 and asks for 2025, matching nothing, which drops the month-boundary user 73 AND every clean pair with it. The function julianday(date) converts to an absolute day count where + 1 is genuinely the next calendar day, month and year boundaries included; DATE(login_date, '+1 day') is the equivalent string-form modifier. Pick one converter and stay in it — mixing a TEXT comparison with a converted value silently matches nothing.",
      "DISTINCT is the last mile, and it is not optional. User 75 signs in three days running, which produces two qualifying pairs (03 to 04, and 04 to 05) — without DISTINCT the report prints user 75 twice and the output grain is the pair, not the user. The inner join simultaneously handles the single-login user 74: with no second row to pair against, the join drops them without any explicit filter. Both behaviors come from the join's shape — the report never needs a WHERE beyond the join condition itself.",
    ],
    edges: [
      "User 73's month-boundary pair (2024-05-31 then 2024-06-01): the raw-numeric test login_date + 1 matches nothing ANYWHERE on this seed (every pair dies, not just this one), while julianday + 1 rolls the month correctly.",
      "User 72's one-day gap (2024-06-10, then 2024-06-12) sits on adjacent login_id rows 3 and 4 — an id-adjacency join wrongly admits 72 without ever reading a date.",
      "User 75's triple (06-03, 06-04, 06-05) yields two qualifying pairs — without DISTINCT the report ships 75 twice.",
      "User 74's single login on 2024-06-05 has no partner row — the inner join drops them, and a LEFT JOIN variant would need an IS NOT NULL guard to avoid printing an unpaired user.",
    ],
    ladder: [
      { title: "Brute force — sort and scan per user", body: "Pull each user's dates, sort them, and scan for any adjacent pair exactly one day apart. The engine expresses the same scan as one self-join with a date function." },
      { title: "The pattern — self-join on tomorrow", body: "Join LoginEvent to itself per user with julianday(b.login_date) = julianday(a.login_date) + 1; every surviving row is a proven back-to-back pair." },
      { title: "The optimal idea — convert before you compare", body: "O(n) with a hash join. The durable rule: date-adjacency tests must run in a calendar-aware domain — julianday or DATE modifiers — because TEXT dates compare but refuse to add." },
    ],
    approach: "self-join per user on julianday(other) = julianday(self) + 1, DISTINCT to the user grain",
    schema: {
      ddl: `CREATE TABLE LoginEvent (
  login_id   INTEGER PRIMARY KEY,
  user_id    INTEGER NOT NULL,
  login_date TEXT NOT NULL  -- 'YYYY-MM-DD', one row per user per day
);`,
      seed: `INSERT INTO LoginEvent (login_id, user_id, login_date) VALUES
  (1, 71, '2024-06-10'),
  (2, 71, '2024-06-11'),  -- clean adjacent pair: in
  (3, 72, '2024-06-10'),
  (4, 72, '2024-06-12'),  -- one-day gap: out (rows adjacent, days not)
  (5, 73, '2024-05-31'),
  (6, 73, '2024-06-01'),  -- month-boundary pair: in
  (7, 74, '2024-06-05'),  -- single login: out
  (8, 75, '2024-06-03'),
  (9, 75, '2024-06-04'),
  -- triple: two pairs, DISTINCT keeps one row
  (10, 75, '2024-06-05');`,
      tables: [
        { name: "LoginEvent", note: "10 logins over 5 users — 71 clean pair, 72 gapped pair, 73 month-boundary pair, 74 single, 75 three consecutive days" },
      ],
    },
    code: `SELECT DISTINCT a.user_id          -- pair grain -> user grain: one row each
FROM LoginEvent a
JOIN LoginEvent b
  ON b.user_id = a.user_id
 AND julianday(b.login_date) = julianday(a.login_date) + 1
        -- julianday + 1 is the next CALENDAR day: month boundaries roll
ORDER BY a.user_id;`,
    walkthrough: [
      "The self-join pairs each of a user's logins with their own next-day login: 71 pairs (06-10 to 06-11), 73 pairs across the boundary (05-31 to 06-01), and 75 pairs twice (06-03 to 06-04, then 06-04 to 06-05).",
      "Users 72 and 74 form no pair: 72's second login is two days after their first, and 74 has only one row to offer — the join simply finds no partner.",
      "DISTINCT collapses 75's two pairs to one row, and ORDER BY user_id ships (71), (73), (75) — the raw numeric date+1 variant would have shipped nothing at all.",
    ],
    time: "O(n) with a hash join — one pass pairing the ledger with itself",
    space: "O(p) — one output row per qualifying user",
    followUps: [
      "Report each user's LONGEST consecutive-day streak — how does LAG over per-user dates plus an island count extend the pair test, and what does the single-login user 74 show?",
      "Return the first date of each user's longest streak alongside its length — once islands are built, where does the streak's starting row come from?",
    ],
    related: ["game-play-analysis-iv", "the-latest-login-in-2020", "user-activity-for-the-past-30-days-i"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "invalid-tweets-ii",
    statement:
      "A moderation queue scans short posts: Tweet holds tweet_id, user_id and content, where content may be NULL. A post is INVALID when any of three things is true: content is missing entirely, content is empty once surrounding whitespace is trimmed away, or content runs longer than 140 characters (length measured on the raw text). Report a single column invalid_count: the number of invalid posts in the table, one row, one number.",
    examples: [
      {
        input: "tweet 1 has no content at all, tweet 2 is the empty string, tweet 3 is a 141-character rant and tweet 6 is 150 characters (two leading spaces, 148 after trimming)",
        output: "4",
        explanation:
          "Each of the four fails independently: the NULL arm takes tweet 1, the trim arm takes tweet 2, and the length arm takes tweets 3 and 6 — trimming tweet 6 to 148 still leaves it over the cap. The count is not final yet.",
      },
      {
        input: "tweet 7 holds exactly three spaces — length 3, not NULL, well under the cap",
        output: "5",
        explanation:
          "Tweet 7 is three spaces: length 3, not NULL, but TRIM of it is the empty string, so the trim arm takes it and the report lands on 5 — tweets 4 (exactly 140 characters) and 5 (a short hello) stay valid.",
      },
    ],
    constraints: [
      "the three arms are independent: content IS NULL, OR TRIM(content) = '', OR LENGTH(content) > 140 — any one makes the post invalid",
      "the length cap is strict: exactly 140 characters is VALID; length is measured on the raw content (tweet 6's 150 raw characters are invalid regardless of trimming)",
      "single column invalid_count — one row holding the count of invalid posts",
    ],
    breakdown: [
      "Three independent failure modes call for three OR'd predicates, and the report is then a plain COUNT(*) over the filtered rows — no grouping, no window; the grain is the whole table. What makes the query interesting is that none of the three arms can borrow from another. NULL content is not the empty string: every comparison with NULL — including content = NULL — evaluates to unknown, so the empty-string arm silently cannot see tweet 1, and IS NULL is the only test that fires. A missing NULL arm undercounts by exactly the most broken posts, the worst place to be wrong.",
      "The trim arm exists because emptiness is a property of meaning, not of length. Tweet 7's three spaces pass the NULL test, pass the length test (3 is far under 140), and still carry no content — TRIM(content) = '' is the only arm that catches it. The seed separates the two emptiness flavors on purpose: tweet 2 is the empty string (caught by a bare = '' as well as the trim), while tweet 7 is whitespace-only and can only be caught by trimming. A report that tests only NULL and length ships 3 here instead of 5.",
      "The length arm is strict, and the boundary row is planted to punish off-by-ones. LENGTH(content) > 140 keeps tweet 4 (exactly 140 characters) valid; writing >= 140, or 141 as the limit, brands the boundary tweet and inflates the count to 6. Tweet 6 cannot arbitrate a subtler question — whether the cap should apply to raw or trimmed length — because 150 raw and 148 trimmed are both over 140; the post is invalid under either reading. That ambiguity is real, and the statement resolves it: length is measured on the raw content.",
    ],
    edges: [
      "Tweet 1 (content NULL): the IS NULL arm — content = NULL is never true, so a query using equality silently drops the most broken post and reports 4.",
      "Tweet 7 (exactly three spaces): the trim arm — length 3 and not NULL, so only TRIM(content) = '' catches it; a report with just the NULL and length arms reports 3.",
      "Tweet 4 (exactly 140 characters): the strict boundary — valid under > 140, but LENGTH(content) >= 140 brands it and inflates the count to 6.",
      "Tweet 6 (150 raw, 148 trimmed): over the cap under either reading — it proves the length arm, not the trim-versus-raw question; tweet 5's five characters are the trivial valid control.",
    ],
    ladder: [
      { title: "Brute force — eyeball and count", body: "Read every post, flag the missing, the whitespace-only and the over-long by hand, then count the flags. Three flags the engine ORs together in one WHERE." },
      { title: "The pattern — three arms, one count", body: "WHERE content IS NULL OR TRIM(content) = '' OR LENGTH(content) > 140 wrapped in COUNT(*) — each arm tested in its own domain: IS NULL for absence, TRIM for emptiness, LENGTH for size." },
      { title: "The optimal idea — test each arm where it is true", body: "O(n). The durable rule: NULL needs IS NULL, emptiness needs a trim, and size needs the raw length — three different predicates for three different definitions of broken." },
    ],
    approach: "COUNT(*) over the OR of three arms: content IS NULL, TRIM(content) = '', LENGTH(content) > 140",
    schema: {
      ddl: `CREATE TABLE Tweet (
  tweet_id INTEGER PRIMARY KEY,
  user_id  INTEGER NOT NULL,
  content  TEXT          -- may be NULL
);`,
      seed: `INSERT INTO Tweet (tweet_id, user_id, content) VALUES
  (1, 501, NULL),
  -- tweet 2: empty string - caught by the bare emptiness arm too
  (2, 502, ''),
  (3, 503, 'This is the third week my refund has been stuck in processing and support keeps closing my tickets without a single reply, escalate it now!!!'),
  -- tweet 4: exactly 140 characters - the valid boundary
  (4, 504, 'Loving the new update, the sync finally works offline and the battery drain is gone, shipping this quickly was the right call, thank you....'),
  (5, 505, 'hi :)'),
  (6, 506, '  Reminder that our whole apartment building lost water again this morning and the management office has not replied to anyone, we are filing!!!!!!!!!'),
  -- tweet 7: three spaces - length 3, only the trim arm catches it
  (7, 503, '   ');`,
      tables: [
        { name: "Tweet", note: "7 posts — a NULL, an empty string, a 141-character rant, an exactly-140 tweet, a 5-character hello, a 150-character rant (2 leading spaces, 148 trimmed) and a 3-space blank" },
      ],
    },
    code: `SELECT COUNT(*) AS invalid_count
FROM Tweet
WHERE content IS NULL              -- arm 1: missing text - IS NULL, never = NULL
   OR TRIM(content) = ''           -- arm 2: whitespace-only trims to empty
   OR LENGTH(content) > 140        -- arm 3: raw length strictly over the cap
ORDER BY invalid_count;            -- single-row contract: nominal ordering`,
    walkthrough: [
      "The WHERE tests all seven rows against three arms: tweet 1 falls to IS NULL, tweet 2 to TRIM = '', tweets 3 (141 characters) and 6 (150 raw) to the length arm, and tweet 7 — three spaces, length 3 — to the trim arm alone.",
      "Tweets 4 and 5 pass every arm: tweet 4 sits exactly on the 140 boundary (the rule is strictly greater) and tweet 5 is a 5-character hello.",
      "COUNT(*) over the five failures ships one row, invalid_count = 5 — the = NULL variant would have printed 4, the missing-trim variant 3, and the >= 140 variant 6.",
    ],
    time: "O(n) — one scan, three cheap predicates per row",
    space: "O(1) — a single counter",
    followUps: [
      "Report per-user totals beside their invalid counts — how does a CASE flag plus GROUP BY user_id extend the scan, and what does a user with no invalid posts show under COUNT versus COUNT(*)?",
      "Label each post 'missing', 'blank', 'too_long' or 'valid' — do the CASE arms need an order, and where does a whitespace-only over-140 post land?",
    ],
    related: ["invalid-tweets", "count-salary-categories", "calculate-special-bonus"],
    order: "exact",
    xp: 10,
  },
];
