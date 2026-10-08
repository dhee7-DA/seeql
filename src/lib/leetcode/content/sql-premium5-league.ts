// Deep-dives — SeeQL premium batch V, file 3 of 6: league standings built from
// home/away unpivots, alphabetized per-state city lines and per-department
// salary tiers (6 problems: 2 Easy, 4 Medium). Engine-verified by
// scripts/tmp-69b3-check.ts.
// Re-authored from the canonical premium tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_LEAGUE: LcSqlDive[] = [
  {
    slug: "premier-league-table-ranking",
    statement:
      "MatchResult stores one row per played fixture (match_id, home_team, away_team, home_goals, away_goals). Every fixture pays league points to BOTH teams on the pitch: a win earns 3, a draw earns 1 to each side, a loss earns nothing. Build the standings — columns team, points — where points is each team's total across its home fixtures AND its away fixtures, one output row per team, ordered by points descending, then team name ascending.",
    examples: [
      {
        input: "Albion draw 1-1 at home to Borough, beat Camden 3-0 at home, then lose 0-1 away at Camden",
        output: "Albion · 4",
        explanation:
          "The draw pays 1, the home win pays 3, the away loss pays nothing: 1 + 3 + 0 = 4 — all three of Albion's fixture perspectives counted.",
      },
      {
        input: "Camden lose 0-3 away at Albion, lose 0-2 away at Borough, then beat Albion 1-0 at home",
        output: "Camden · 3",
        explanation:
          "Losses score nothing, so Camden's entire total comes from one home win — a team can sit third on a single good night.",
      },
    ],
    constraints: [
      "one row per team that appears in any fixture, home or away; points = 3 per win, 1 per draw, 0 per loss across ALL of that team's fixtures",
      "each fixture contributes exactly one perspective row to each of its two teams' totals — the home and away views are separate inputs to the same aggregation",
      "columns team, points, ordered by points descending, then team ascending",
    ],
    breakdown: [
      "A fixture is stored once, from the home side's point of view, but points are owed to both teams on the pitch. Match 4 reads Camden 1-0 Albion, and that single row is simultaneously a three-point win for Camden and a zero-point loss for Albion. The standard move is an unpivot: select the home perspective (team = home_team, goals for and against from the home columns) and the away perspective from the same table, then stack them with UNION ALL. After that, every team's whole season lives in one team-column stream, and the points logic is written once instead of twice.",
      "Points are conditional arithmetic, so a CASE expression inside SUM is the natural scorer: 3 when the perspective row's goals-for beat its goals-against, 1 on a tie, 0 on a defeat. The ELSE 0 is load-bearing — a CASE with no ELSE yields NULL per row, and SUM over all-NULL input returns NULL, so a team with nothing but defeats would print NULL instead of a real zero. You could instead count wins and draws in two subqueries and add three times wins plus once draws, but that scans the fixtures twice and needs keyed joins to reunite the numbers. One unpivot plus one conditional SUM computes the entire payout in a single grouped pass.",
      "The tie at the top is why the ORDER BY carries both keys. Albion and Borough finish level on 4 points — the draw between them (match 1) plus a win each — so points DESC alone cannot decide who is first. The team-name key is the stated tie-break, and it makes the standings deterministic instead of engine-dependent. For a report graded on exact row order, that second key is not decoration; it is part of the contract.",
    ],
    edges: [
      "Match 4 (Camden 1-0 Albion) punishes any query that reads only the home perspective: Borough's away draw vanishes, dropping Borough to 3 and inventing a Borough/Camden tie that the real table does not have — every fixture must reach the aggregation from both sides.",
      "Match 1 (Albion 1-1 Borough) punishes paying draws 0: both leaders fall to 3, all three teams tie, and the top of the table is decided by the name key over a corrupted 3-3-3 printout.",
      "The 4-4 tie punishes a bare ORDER BY points DESC: two rows share the maximum, so without the team ASC key the engine is free to ship Borough above Albion.",
      "UNION instead of UNION ALL happens to survive this seed (no two fixtures share a perspective row), but it is a landmine: a repeated 1-1 draw between the same pair would silently deduplicate a team's earned point — the correct unpivot keyword is UNION ALL even when the data does not force it.",
    ],
    ladder: [
      { title: "Brute force — scan twice per team", body: "For each team name, walk every fixture twice — once as the home side, once as the away side — totalling 3/1/0 in a notebook, then sort the page. Correct for one matchday, unbearable for a season, and it re-scans the table once per team." },
      { title: "The pattern — unpivot, then one grouped pass", body: "UNION ALL the home and away perspectives into a single team-column stream, GROUP BY team, and let one SUM(CASE) pay 3, 1 or 0 per perspective row." },
      { title: "The optimal idea — pivot the perspectives first, aggregate once", body: "O(m) over m fixtures. The durable rule: a fact stored from one side's view but owed to both sides is an unpivot — stack the perspectives FIRST, aggregate ONCE afterwards, and encode tie-breaks in the ORDER BY keys, never in the data." },
    ],
    approach: "UNION ALL home/away perspectives into one team stream, GROUP BY team with a 3/1/0 CASE sum, ORDER BY points DESC then team ASC",
    schema: {
      ddl: `CREATE TABLE MatchResult (
  match_id   INTEGER PRIMARY KEY,
  home_team  TEXT NOT NULL,
  away_team  TEXT NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL
);`,
      seed: `INSERT INTO MatchResult (match_id, home_team, away_team, home_goals, away_goals) VALUES
  (1, 'Albion', 'Borough', 1, 1),   -- the draw: both sides take a point
  (2, 'Albion', 'Camden', 3, 0),    -- Albion's clear home win
  (3, 'Borough', 'Camden', 2, 0),   -- Borough's home win
  -- Camden's lone win, Albion's away loss
  (4, 'Camden', 'Albion', 1, 0);`,
      tables: [
        { name: "MatchResult", note: "4 fixtures over 3 teams — Albion and Borough finish level on 4 points, Camden's lone win leaves them third" },
      ],
    },
    code: `WITH sides AS (
    SELECT home_team AS team, home_goals AS gf, away_goals AS ga
    FROM MatchResult
    UNION ALL
    SELECT away_team AS team, away_goals AS gf, home_goals AS ga
    FROM MatchResult
)
SELECT
    team,
    SUM(CASE WHEN gf > ga THEN 3 WHEN gf = ga THEN 1 ELSE 0 END) AS points
FROM sides
GROUP BY team
ORDER BY points DESC, team ASC;`,
    walkthrough: [
      "The unpivot turns four fixtures into eight perspective rows: Albion owns three (1-1, 3-0, then 0-1 away), Borough two (1-1, 2-0), Camden three (0-3, 0-2, then 1-0 at home).",
      "GROUP BY team scores each perspective with the CASE: Albion 1 + 3 + 0 = 4, Borough 1 + 3 = 4, Camden 0 + 0 + 3 = 3.",
      "ORDER BY points DESC, team ASC ships the standings — Albion 4, Borough 4, Camden 3 — the two leaders split by name because their points are equal.",
    ],
    time: "O(m) — two perspective rows per fixture flow through one grouped pass",
    space: "O(t) — one group per team t",
    followUps: [
      "Add a goal-difference column and re-rank the seed — which of the four fixtures would have to change its scoreline before the extra key ever fires, and why does the 4-4 tie hide the question?",
      "Extend the payout to a bonus-point league (say, an extra point for winning by 3 or more): where does a CASE over goal margins slot into the unpivot, and does match 2's 3-0 become a four-point win?",
    ],
    related: ["team-scores-in-football-tournament", "top-competitors", "friend-requests-ii-who-has-the-most-friends"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "premier-league-table-ranking-ii",
    statement:
      "The same MatchResult table (match_id, home_team, away_team, home_goals, away_goals) now feeds a fuller standings row. For each team report columns team, played, points, goal_diff — played counts every fixture the team appeared in (home or away, draws included), points pay 3 for a win, 1 for a draw, 0 for a loss, and goal_diff is goals scored minus goals conceded across all its fixtures. One row per team, ordered by points descending, then goal_diff descending, then team name ascending.",
    examples: [
      {
        input: "Barrow and Amberley draw 1-1 with each other; Barrow then beat Colwyn 3-0 and Dover 2-1, while Amberley beat Colwyn 2-0 and Dover 2-1",
        output: "Barrow · 3 · 7 · 4, then Amberley · 3 · 7 · 3",
        explanation:
          "Identical played (3) and points (7) split on goal difference: 6-2 (+4) beats 5-2 (+3) — the name tie-break never gets its turn.",
      },
      {
        input: "Colwyn lose all three — 0-3 to Barrow, 0-2 to Amberley, 0-3 to Dover — without ever scoring",
        output: "Colwyn · 3 · 0 · -8",
        explanation:
          "Zero points and a negative difference still print a row: SUM(goals for) - SUM(goals against) = 0 - 8 = -8, and the row sorts last because -8 is the smallest difference.",
      },
    ],
    constraints: [
      "one row per team; played counts every fixture the team appears in, home or away, draws included",
      "points = 3 per win, 1 per draw, 0 per loss; goal_diff = (goals scored in all fixtures) - (goals conceded in all fixtures)",
      "columns team, played, points, goal_diff, ordered by points descending, then goal_diff descending, then team ascending",
    ],
    breakdown: [
      "The basic standings unpivot has to carry numbers now, not just outcomes. Each perspective row needs the team's goals for and against, so the two UNION ALL branches swap the goal columns along with the team name — the home branch reads (home_team, home_goals, away_goals) and the away branch reads (away_team, away_goals, home_goals). One fixture becomes two rows, each holding one side's own for/against, and every downstream aggregate runs over that single stream. Goal difference is a per-team sum of a per-match quantity, and that quantity only lines up per team after the swap.",
      "One GROUP BY then feeds three different aggregate shapes at once. COUNT(*) counts perspective rows — each fixture appears exactly once per team, draws included, so played is a plain count. The CASE-sum banks the points exactly as in the basic table. SUM(gf) - SUM(ga) derives the difference from the two goal sums, staying in INTEGER arithmetic the whole way — no division, no rounding, no float promotion to worry about.",
      "The sort is the specification, not cosmetics. Points DESC alone leaves the two seven-point teams engine-ordered, so goal_diff DESC is the key that actually separates Barrow's 6-2 from Amberley's 5-2, and team ASC stays only as a last-resort guarantee. The order of the keys is their priority: a sort that listed goal_diff before points would be a different league table entirely. Writing the full key list is how the query states, in one line, which records outrank which.",
    ],
    edges: [
      "Matches 4 and 5 (both finished 2-1) plant the exact goal lines the separation needs: Barrow's 6-2 against Amberley's 5-2 — score one goal fewer anywhere in either team's fixtures and the tie becomes a tie-break problem again, so the diff must come from the swapped columns, never from home-side goals alone.",
      "Match 1 (Barrow 1-1 Amberley) punishes a played that counts only decided fixtures (a WHERE goals-differ filter): the draw is a genuine appearance for both sides, and every team here has genuinely played 3, not 2.",
      "Dropping goal_diff from the ORDER BY mis-orders exactly the seven-point pair: Amberley (+3) would jump above Barrow (+4) under points DESC, team ASC, while Dover and Colwyn still separate on points — the missing key hides in a single swap.",
      "Colwyn's season (0-3, 0-2, 0-3, never scoring) punishes reading goal_diff from a single match row instead of summing: one fixture's difference (Dover's 0-3 win is +3) is not the season total (Dover's true diff is +1) — the aggregate belongs over all unpivoted rows.",
    ],
    ladder: [
      { title: "Brute force — one page per team", body: "Keep a per-team ledger of home and away results, total the points and the goal margins by hand, then sort the ledgers. Every new result forces a full recount." },
      { title: "The pattern — swapped unpivot, three aggregates", body: "UNION ALL the perspectives with the goal columns exchanged, GROUP BY team, and read played, points and goal_diff as three aggregates over the same groups." },
      { title: "The optimal idea — the multi-key ORDER BY is the ranking", body: "O(m log m). The durable rule: a standings row is several aggregates over ONE unpivoted stream, and the key order of the ORDER BY encodes the ranking policy — points first, difference second, name as the deterministic floor." },
    ],
    approach: "UNION ALL perspectives with swapped goal columns, GROUP BY team into played/points/goal_diff, ORDER BY points DESC, goal_diff DESC, team ASC",
    schema: {
      ddl: `CREATE TABLE MatchResult (
  match_id   INTEGER PRIMARY KEY,
  home_team  TEXT NOT NULL,
  away_team  TEXT NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL
);`,
      seed: `INSERT INTO MatchResult (match_id, home_team, away_team, home_goals, away_goals) VALUES
  (1, 'Barrow', 'Amberley', 1, 1),   -- the draw: played +1 for both sides
  (2, 'Barrow', 'Colwyn', 3, 0),
  (3, 'Amberley', 'Colwyn', 2, 0),
  (4, 'Barrow', 'Dover', 2, 1),      -- same 2-1 line as match 5: the planted goal lines
  (5, 'Amberley', 'Dover', 2, 1),
  -- Dover's win, Colwyn's goalless third defeat
  (6, 'Colwyn', 'Dover', 0, 3);`,
      tables: [
        { name: "MatchResult", note: "6 fixtures over 4 teams — Barrow and Amberley tie on 7 points and split on +4 vs +3; Colwyn ship 8 goals without scoring" },
      ],
    },
    code: `WITH sides AS (
    SELECT home_team AS team, home_goals AS gf, away_goals AS ga
    FROM MatchResult
    UNION ALL
    SELECT away_team AS team, away_goals AS gf, home_goals AS ga
    FROM MatchResult
)
SELECT
    team,
    COUNT(*) AS played,
    SUM(CASE WHEN gf > ga THEN 3 WHEN gf = ga THEN 1 ELSE 0 END) AS points,
    SUM(gf) - SUM(ga) AS goal_diff
FROM sides
GROUP BY team
ORDER BY points DESC, goal_diff DESC, team ASC;`,
    walkthrough: [
      "Twelve perspective rows leave the unpivot — each of the six fixtures twice, with each side's own goals for and against after the swap.",
      "The grouped pass reads all three numbers per team: Barrow 3 played, 7 points, 6-2 = +4; Amberley 3 played, 7 points, 5-2 = +3; Dover 3 played, 3 points, 5-4 = +1; Colwyn 3 played, 0 points, 0-8 = -8.",
      "The three-key ORDER BY ships Barrow above Amberley on the difference alone, then Dover, then Colwyn — the name key never fires on this seed, but it is there the day two teams tie on both numbers.",
    ],
    time: "O(m log m) — the grouped pass over 2m perspective rows plus the multi-key sort of the team records",
    space: "O(t) — one standings row per team t",
    followUps: [
      "Report goals for and goals against as separate output columns beside goal_diff — which unpivot column names survive untouched, and do the sort keys change at all?",
      "Add a points-per-game column for teams that have played different numbers of matches — where does the division by played risk a zero, and does any team here trigger it?",
    ],
    related: ["team-scores-in-football-tournament", "top-travellers", "rank-scores"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "premier-league-table-ranking-iii",
    statement:
      "The season-long table adds the full win/draw/loss record and a position number. From MatchResult (match_id, home_team, away_team, home_goals, away_goals), report columns position, team, played, wins, draws, losses, points — the record columns count each team's fixtures from BOTH perspectives, points pay 3 for a win, 1 for a draw, 0 for a loss, and position numbers the rows 1, 2, 3, 4 in the final table order: points descending, then goal difference descending, then team name ascending. Output ordered by position ascending.",
    examples: [
      {
        input: "Ashford win their only two fixtures, 3-0 at home to Dorking and 1-0 at home to Cirencester",
        output: "1 · Ashford · 2 · 2 · 0 · 0 · 6",
        explanation:
          "Two wins from two: six points, no draws, no losses, and position 1 — the row number follows the same keys that order the table.",
      },
      {
        input: "Dorking lose all three — 0-3, 0-2 and 0-4 — without ever scoring or drawing",
        output: "4 · Dorking · 3 · 0 · 0 · 3 · 0",
        explanation:
          "A winless, drawless team still occupies row 4: the losses column must count 3 and points 0 — not NULL — because every conditional sum carries ELSE 0.",
      },
    ],
    constraints: [
      "one row per team; wins + draws + losses = played for every team, zeros included",
      "position is 1 for the best row under points DESC, goal_diff DESC, team ASC and increments down the table — the numbering follows the full key list, not points alone",
      "columns position, team, played, wins, draws, losses, points, output ordered by position ascending",
    ],
    breakdown: [
      "The full record is one aggregate wearing three conditions. Wins counts perspective rows where the team's goals-for beat its goals-against, draws counts ties, losses counts defeats — three conditional SUMs over the same GROUP BY. Writing them as three separate subqueries (one per outcome) would scan the fixtures three times and need keyed joins to reunite the columns. Conditional aggregation over the unpivoted stream computes the whole record, and the points column reuses the same conditions with 3/1/0 payouts, all in one pass.",
      "The ELSE 0 on every conditional SUM is what keeps the bottom of the table honest. A CASE with no ELSE emits NULL on non-matching rows, and SUM skips NULLs — so a team whose wins SUM sees no matching row at all gets NULL, not zero. Dorking is that team: three defeats, zero wins, zero draws, and an ELSE-less query prints their wins and draws as NULL while their losses (which have rows to count) print 3. The worst team in the league is exactly where a missing ELSE surfaces, because it is the only row whose condition never fires.",
      "Position is a row number over the final order, so it must be computed after the aggregation, with ROW_NUMBER over the same keys the table ranks by: points DESC, goal_diff DESC, team ASC. Cirencester and Banbury tie on 4 points here, and the difference (+3 against +2) is the stated key that separates them — a numbering keyed to points with a name fallback would seat them in exactly the reverse of the true order. The window's internal ORDER BY builds the numbering; it is the outer ORDER BY position that orders the delivered rows. Both must exist, and both must use the same key list, or the numbers and the rows disagree.",
    ],
    edges: [
      "Dorking's three defeats (0-3, 0-2, 0-4) punish the ELSE-less CASE: their wins and draws sum all-NULL inputs to NULL, so the standings row reads NULL exactly where the required 0 belongs.",
      "Match 3 (Cirencester 1-1 Banbury) is the mid-table draw: it pays both 4-point teams their single point and one appearance each — paying draws 0 demotes both to 3 points and reshuffles the entire table.",
      "The 4-4 tie punishes a position numbered over points with a name fallback: alphabetical seating would put Banbury second, but the stated keys put Cirencester (+3) above Banbury (+2) — the difference key, not the name, decides.",
      "Ashford's two fixtures (they sit top having played only 2, while Cirencester has played 3) punish deriving played from the number of teams or from another team's MAX: the record columns are counts of this team's own perspective rows, and the table never promises a balanced schedule.",
    ],
    ladder: [
      { title: "Brute force — a page of tallies", body: "For each team, walk every fixture twice recording W/D/L by hand, total the points, sort the page and write 1..n beside it. Every result appends to four pages at once, and the sort step is pure manual labour." },
      { title: "The pattern — conditional SUMs, then ROW_NUMBER", body: "One unpivot plus one GROUP BY builds the record with ELSE-0 conditional SUMs; ROW_NUMBER() OVER (the full key list) turns the sorted records into positions." },
      { title: "The optimal idea — aggregate first, number second", body: "O(m log t). The durable rule: a numbered report is an aggregation followed by a numbering window that repeats the sort keys exactly — and the result-level ORDER BY (by position) is what the consumer reads." },
    ],
    approach: "Unpivot with UNION ALL, ELSE-0 conditional SUMs for the record, ROW_NUMBER over points DESC / goal_diff DESC / team ASC for position",
    schema: {
      ddl: `CREATE TABLE MatchResult (
  match_id   INTEGER PRIMARY KEY,
  home_team  TEXT NOT NULL,
  away_team  TEXT NOT NULL,
  home_goals INTEGER NOT NULL,
  away_goals INTEGER NOT NULL
);`,
      seed: `INSERT INTO MatchResult (match_id, home_team, away_team, home_goals, away_goals) VALUES
  (1, 'Ashford', 'Dorking', 3, 0),
  (2, 'Ashford', 'Cirencester', 1, 0),
  (3, 'Cirencester', 'Banbury', 1, 1),   -- the mid-table draw inside the 4-point pair
  (4, 'Banbury', 'Dorking', 2, 0),
  -- Dorking's third straight defeat
  (5, 'Cirencester', 'Dorking', 4, 0);`,
      tables: [
        { name: "MatchResult", note: "5 fixtures over 4 teams — Ashford perfect on 6, Cirencester and Banbury tie on 4 (split +3 vs +2), Dorking lose all three without scoring" },
      ],
    },
    code: `WITH sides AS (
    SELECT home_team AS team, home_goals AS gf, away_goals AS ga
    FROM MatchResult
    UNION ALL
    SELECT away_team AS team, away_goals AS gf, home_goals AS ga
    FROM MatchResult
),
records AS (
    SELECT
        team,
        COUNT(*) AS played,
        SUM(CASE WHEN gf > ga THEN 1 ELSE 0 END) AS wins,    -- ELSE 0: zeros are required, not NULL
        SUM(CASE WHEN gf = ga THEN 1 ELSE 0 END) AS draws,
        SUM(CASE WHEN gf < ga THEN 1 ELSE 0 END) AS losses,
        SUM(CASE WHEN gf > ga THEN 3 WHEN gf = ga THEN 1 ELSE 0 END) AS points,
        SUM(gf) - SUM(ga) AS goal_diff
    FROM sides
    GROUP BY team
)
SELECT
    ROW_NUMBER() OVER (
        ORDER BY points DESC, goal_diff DESC, team ASC   -- the stated table order
    ) AS position,
    team, played, wins, draws, losses, points
FROM records
ORDER BY position;`,
    walkthrough: [
      "Ten perspective rows (five fixtures, two sides each) group into four records: Ashford 2/2/0/0 for 6 (+4), Cirencester 3/1/1/1 for 4 (+3), Banbury 2/1/1/0 for 4 (+2), Dorking 3/0/0/3 for 0 (-9).",
      "ROW_NUMBER walks the records down points DESC, goal_diff DESC, team ASC: Ashford first at 6, then the 4-point pair splits on difference — Cirencester second, Banbury third — and Dorking fourth.",
      "ORDER BY position ships the numbered table with Dorking's zeros intact — an ELSE-less twin of the query prints NULL for their wins and draws exactly where 0 belongs.",
    ],
    time: "O(m log t) — one grouped pass over the 2m perspective rows, then a sort of the t records",
    space: "O(t) — one record per team t",
    followUps: [
      "Add a form column listing each team's results in date order (letters W, D, L) — does the unpivot need match_id carried through, and which aggregation changes shape to produce it?",
      "Break position ties by head-to-head result instead of goal difference — what does that do to the ROW_NUMBER key list, and which pair of teams here would need it?",
    ],
    related: ["rank-scores", "the-change-in-global-rankings", "team-scores-in-football-tournament"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "find-cities-in-each-state",
    statement:
      "City lists towns as (city_id, city_name, state). For each state report one row with columns state, cities — where cities is every city_name of that state joined into a single string separated by comma-space, with the names in ALPHABETICAL order no matter what order the rows were inserted. Output ordered by state ascending.",
    examples: [
      {
        input: "Nevada holds Reno, Elko and Carson, inserted in that row order (ids 1, 2, 3)",
        output: "Nevada · Carson, Elko, Reno",
        explanation:
          "The list is alphabetized, not insertion-ordered: the names are sorted before they are concatenated, so Carson leads even though it was inserted last.",
      },
      {
        input: "Oregon holds only Salem",
        output: "Oregon · Salem",
        explanation:
          "A single-name state concatenates to just that name — no comma, no separator glue on either side.",
      },
    ],
    constraints: [
      "one row per state present in City; names are joined with ', ' (comma then space) exactly",
      "the name order inside every string is alphabetical ascending, independent of insertion order",
      "columns state, cities, ordered by state ascending",
    ],
    breakdown: [
      "GROUP_CONCAT is the tool, but it concatenates in scan order — the order rows arrive at the aggregate — and SQLite offers no ORDER BY inside the aggregate call. So the sort has to happen before aggregation: an inner SELECT reading City ORDER BY state, city_name, with the outer GROUP BY consuming that pre-sorted stream. The behaviour is documented engine semantics — GROUP_CONCAT appends each row's value in arrival order — so sorted arrival yields a sorted string. That is why the inner ORDER BY is part of the query's contract, not a decoration, and why this report is verified by running it twice.",
      "The sort key is (state, city_name), not city_name alone, and the state part matters for more than tidiness. A deterministic global stream makes the whole query reproducible run after run and guarantees each state's names arrive already alphabetized no matter how the group boundaries fall. Relying on insertion order is the visible failure here: Nevada's rows were inserted Reno, Elko, Carson — ids 1, 2, 3 — so an unsorted scan prints exactly that, backwards relative to the required list. The id order is not the alphabetical order, and the engine will not silently fix that for you.",
      "The separator is a real second argument: GROUP_CONCAT(city_name, ', ') emits comma-space between values, while the one-argument default is a bare comma with no space. Single-city states come out right for free — concatenating a one-value group yields just that value, with no separator glue on either side. That is why the aggregate beats hand-built name-plus-separator chains, which grow a trailing comma the moment a state holds one lonely town. Every state here gets one GROUP BY row, and the output ORDER BY state finishes the contract with a deterministic row order.",
    ],
    edges: [
      "Nevada's insertion order (Reno id 1, Elko id 2, Carson id 3) punishes the sort-less scan: the string comes out 'Reno, Elko, Carson' where the required list is 'Carson, Elko, Reno'.",
      "Texas's pair (Alton id 5 inserted before Albany id 6) bites at the second letter: both names open 'Al', so the ordering that produces 'Albany, Alton' rather than 'Alton, Albany' is decided at position 2 — sorting by id or by the first character alone flips the pair.",
      "Oregon's lone Salem punishes hand-glued separators: appending ', ' after every name prints 'Salem, ' with a trailing comma, while GROUP_CONCAT reduces a one-value group to the bare name.",
      "The default separator punishes the one-argument call: 'Carson,Elko,Reno' (no spaces) is a different string from the required 'Carson, Elko, Reno' — the separator argument is part of the output format, not a style choice.",
    ],
    ladder: [
      { title: "Brute force — sort and join in the app", body: "Fetch every city row grouped by state in application code, sort each name list, join with ', ' and assemble the report. One loop per state, and the engine's grouping is done a second time by hand." },
      { title: "The pattern — sorted subquery feeding GROUP_CONCAT", body: "An inner SELECT ORDER BY state, city_name delivers a sorted stream; the outer GROUP BY state folds each state's run into one GROUP_CONCAT(city_name, ', ') string." },
      { title: "The optimal idea — ordered aggregation means sorted input", body: "O(n log n). The durable rule: aggregates have no internal ORDER BY, so any ordered-concatenation contract is met by sorting the input stream and concatenating in scan order — a documented engine behaviour worth naming in a comment, because a rewrite that drops the inner sort silently reorders every string." },
    ],
    approach: "Inner SELECT sorted by (state, city_name); outer GROUP BY state concatenating GROUP_CONCAT(city_name, ', ') in scan order",
    schema: {
      ddl: `CREATE TABLE City (
  city_id   INTEGER PRIMARY KEY,
  city_name TEXT NOT NULL,
  state     TEXT NOT NULL
);`,
      seed: `INSERT INTO City (city_id, city_name, state) VALUES
  (1, 'Reno', 'Nevada'),
  (2, 'Elko', 'Nevada'),
  (3, 'Carson', 'Nevada'),   -- inserted LAST of the three: alphabetical order is Carson, Elko, Reno
  (4, 'Salem', 'Oregon'),    -- a one-city state: no separator to glue
  (5, 'Alton', 'Texas'),
  -- inserted after Alton, and 'Albany' sorts first on the SECOND letter
  (6, 'Albany', 'Texas');`,
      tables: [
        { name: "City", note: "6 towns over 3 states — Nevada's three inserted out of alphabetical order, Oregon a single town, Texas's pair share the 'Al' prefix" },
      ],
    },
    code: `SELECT
    state,
    GROUP_CONCAT(city_name, ', ') AS cities   -- ', ' is the required separator (default is a bare comma)
FROM (
    SELECT state, city_name
    FROM City
    ORDER BY state, city_name   -- sort BEFORE aggregating: GROUP_CONCAT follows scan order
)
GROUP BY state
ORDER BY state;`,
    walkthrough: [
      "The inner SELECT streams the six rows alphabetically within each state: Carson, Elko, Reno for Nevada; Salem for Oregon; Albany before Alton for Texas — the Texas order decided at the second letter.",
      "The outer GROUP BY folds each state's arrival run into one string: 'Carson, Elko, Reno', 'Salem', 'Albany, Alton' — the one-name state gains no comma because there is nothing to separate.",
      "ORDER BY state ships Nevada, Oregon, Texas, each line matching the required output row for row.",
    ],
    time: "O(n log n) — one sort of the n city rows, then a linear concatenation",
    space: "O(n) — the sorted stream plus one string per state",
    followUps: [
      "Cap each line at the first 3 cities alphabetically with a continuation marker — why does a LIMIT inside the sorted subquery break the one-row-per-state shape, and what construction replaces it?",
      "Order the states by how many cities they hold, breaking ties by state name — does ordering by the composed line still work, and which column becomes the true sort key?",
    ],
    related: ["group-sold-products-by-the-date", "concatenate-the-name-and-the-profession", "the-first-day-of-the-maximum-recorded-temperature-in-each-city"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-cities-in-each-state-ii",
    statement:
      "The same City table (city_id, city_name, state) now feeds a one-line summary per state — but only qualifying states appear. Report a single column, state_line, where each row is one string in the exact form 'state: city1, city2, city3' — the state name, then a colon and a space, then every city of that state in alphabetical order joined by comma-space. A state qualifies only when it holds at least 3 cities. Output ordered by state_line ascending.",
    examples: [
      {
        input: "Arizona holds Tucson, Mesa, Phoenix and Gilbert, inserted in that scrambled row order",
        output: "Arizona: Gilbert, Mesa, Phoenix, Tucson",
        explanation:
          "Four cities clear the 3-city gate and the line still comes out alphabetical — the scrambled insertion never leaks into the string.",
      },
      {
        input: "Ohio holds only Akron and Zanesville",
        output: "(no row — Ohio does not qualify)",
        explanation:
          "Two cities sit below the gate: the HAVING count test drops the state after grouping, so no 'Ohio:' line exists at all.",
      },
    ],
    constraints: [
      "only states holding at least 3 cities produce a row; smaller states are omitted entirely, not printed short or zero-filled",
      "the string format is exact: state, then ': ', then the alphabetical city names joined by ', '",
      "one column state_line, one row per qualifying state, ordered by state_line ascending",
    ],
    breakdown: [
      "This is the per-state city list wearing a membership gate and a format. The gate is a fact about GROUPS — the group must hold at least 3 rows — so it belongs in HAVING, not WHERE: WHERE filters individual rows before any group exists, when no count is available to test. HAVING COUNT(*) >= 3 runs after the groups form and keeps only the tall-enough ones. Ohio's two cities then never reach the SELECT list at all, which is why no 'Ohio:' line exists rather than a short or zero-filled row.",
      "The format glues two different separators onto one line: ': ' between the state and its first city, then ', ' between the cities. Building it as state || ': ' || GROUP_CONCAT(city_name, ', ') keeps each separator in exactly one place — the aggregate handles the city list, the leading expression handles the prefix. A query that puts the colon inside the aggregate call, or writes the colon without its space, produces a string that differs from the specification character by character. Since the whole line is the output column, composing it in the SELECT list is the honest way to keep 'state: cities' as one value.",
      "The alphabetical order inside each line rides the same scan-order mechanism as before: sort in the subquery, concatenate on arrival, verify by running twice. Maine's rows were inserted already alphabetical, so a sort-less query looks correct on Maine and wrong on Arizona — the scrambled Arizona insert is what makes the missing ORDER BY visible in half the output. The outer ORDER BY sorts by state_line, the whole string: every line begins with the state name, so this orders by state first and can never interleave two lines from one state. The gate, the format and the order are three independent requirements, and each lives in a different clause of the same query.",
    ],
    edges: [
      "Ohio's two rows (Akron id 8, Zanesville id 9) punish the ungated report: without HAVING COUNT(*) >= 3 the output grows an 'Ohio: Akron, Zanesville' line the specification forbids.",
      "Maine's exactly-three (Augusta, Bangor, Portland) pins the boundary: >= 3 keeps the state and > 3 drops it — one city on the wrong side of the comparison and a qualifying state vanishes.",
      "Arizona's scrambled insertion (Tucson, Mesa, Phoenix, Gilbert) punishes dropping the inner sort: the line reads 'Arizona: Tucson, Mesa, Phoenix, Gilbert' in insertion order, while alphabetized Maine hides the bug on its own row.",
      "The format punishes both shortcuts: dropping the space after the colon prints 'Arizona:Gilbert, Mesa, Phoenix, Tucson', and dropping the separator argument prints 'Arizona: Gilbert,Mesa,Phoenix,Tucson' — each differs from the required line without erroring.",
    ],
    ladder: [
      { title: "Brute force — count, then format in the app", body: "Count cities per state in one pass, fetch the qualifying states, sort their names and build each string in application code. Two round trips and a formatter for what one query states in three clauses." },
      { title: "The pattern — HAVING gate over a sorted stream", body: "GROUP BY state with HAVING COUNT(*) >= 3 over the pre-sorted subquery; compose the line as state || ': ' || GROUP_CONCAT(city_name, ', ')." },
      { title: "The optimal idea — gates are aggregate facts, formats are composed", body: "O(n log n). The durable rule: thresholds on group size live in HAVING because they exist only after grouping, and single-column formatted reports are string-composed from the aggregate, with each separator owned by exactly one expression." },
    ],
    approach: "GROUP BY state with HAVING COUNT(*) >= 3 over the pre-sorted stream; state_line = state || ': ' || GROUP_CONCAT(city_name, ', ')",
    schema: {
      ddl: `CREATE TABLE City (
  city_id   INTEGER PRIMARY KEY,
  city_name TEXT NOT NULL,
  state     TEXT NOT NULL
);`,
      seed: `INSERT INTO City (city_id, city_name, state) VALUES
  (1, 'Tucson', 'Arizona'),
  (2, 'Mesa', 'Arizona'),
  (3, 'Phoenix', 'Arizona'),
  (4, 'Gilbert', 'Arizona'),   -- inserted scrambled: alphabetical is Gilbert, Mesa, Phoenix, Tucson
  (5, 'Augusta', 'Maine'),
  (6, 'Bangor', 'Maine'),
  (7, 'Portland', 'Maine'),    -- exactly 3: the >= boundary, inserted already alphabetical
  (8, 'Akron', 'Ohio'),
  -- two cities, below the gate: no line at all
  (9, 'Zanesville', 'Ohio');`,
      tables: [
        { name: "City", note: "9 towns over 3 states — Arizona holds 4 (inserted scrambled), Maine exactly 3, Ohio only 2" },
      ],
    },
    code: `SELECT
    state || ': ' || GROUP_CONCAT(city_name, ', ') AS state_line
FROM (
    SELECT state, city_name
    FROM City
    ORDER BY state, city_name   -- sort the stream first: concat follows arrival order
)
GROUP BY state
HAVING COUNT(*) >= 3   -- the 3-city gate lives AFTER grouping
ORDER BY state_line;`,
    walkthrough: [
      "The inner sort streams nine rows alphabetically within each state, and GROUP BY state builds three groups of 4, 3 and 2.",
      "HAVING COUNT(*) >= 3 keeps Arizona and Maine and drops Ohio — the boundary state survives on exactly the required count.",
      "The survivors format as 'Arizona: Gilbert, Mesa, Phoenix, Tucson' and 'Maine: Augusta, Bangor, Portland', shipped in that order by ORDER BY state_line.",
    ],
    time: "O(n log n) — the same sorted stream, folded by the HAVING gate",
    space: "O(n) — one string per qualifying state",
    followUps: [
      "Change the gate to 'more cities than the average state holds' — can HAVING compare against a subquery, and which formulation survives engines without windowed aggregates?",
      "Produce the same lines for states with exactly 2 cities in the same column — how does a CASE over COUNT(*) inside the SELECT list split the report, and does the ORDER BY key change?",
    ],
    related: ["classes-more-than-5-students", "group-sold-products-by-the-date", "find-followers-count"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "second-highest-salary-ii",
    statement:
      "Employee stores one row per staff member (emp_id, name, department, salary). For each department, report the second-highest DISTINCT salary — the second salary TIER, not the second row: several people can share the top tier, and the runner-up is the next tier below it. Columns department, second_max. When a department holds fewer than 2 distinct salaries — one employee, or many employees all on the same pay — second_max is NULL. Output ordered by department ascending.",
    examples: [
      {
        input: "Finance pays Dov 95000, Esme 95000 and Fay 80000",
        output: "Finance · 80000",
        explanation:
          "The two 95000 rows form one tier; the next DISTINCT salary down is 80000 — the tie at the top must not swallow the runner-up.",
      },
      {
        input: "Support pays Hana 55000 and Ivan 55000",
        output: "Support · NULL",
        explanation:
          "Two employees but one distinct salary: there is no second tier, and NULL — not 0 and not a repeat of 55000 — is the report.",
      },
    ],
    constraints: [
      "one row per department present in Employee; second_max is the second-highest DISTINCT salary in that department",
      "departments with fewer than 2 distinct salaries report NULL — the NULL is the answer, never 0 and never a repeat of the top salary",
      "columns department, second_max, ordered by department ascending",
    ],
    breakdown: [
      "The word DISTINCT is the entire problem. ROW_NUMBER over salary DESC numbers ROWS: on Finance's 95000, 95000, 80000 it hands the second 95000 row number 2, so a row-numbered runner-up is the top salary wearing a different row's number. DENSE_RANK numbers TIERS: both 95000 rows take rank 1 and 80000 takes rank 2, so rank 2 is precisely the second distinct salary. That is the canonical job of the dense variant — ties do not consume tier numbers.",
      "The neighbouring variants fail in opposite directions. RANK also gives the tied 95000s rank 1, but it skips the next number, so 80000 lands on rank 3 and a rank-2 filter finds no row in Finance — the report would print NULL where a real runner-up exists. DENSE_RANK is exactly RANK without the gaps. And a bare rank-2 filter (WHERE rnk = 2, or a join back on it) keeps only departments that HAVE a second tier: Legal and Support would vanish from the report instead of shipping NULL. The GROUP BY spine with MAX(CASE WHEN rnk = 2 THEN salary END) is what fixes the grain — every department survives the grouping, and MAX of an all-NULL set returns NULL, which is the required answer rather than an error to bury.",
      "NULL passthrough is a contract, not a gap in the code. A department with one employee has a single tier; a department paying everyone the same has one tier no matter how many rows hold it; both genuinely have no runner-up, and NULL states that fact. COALESCE(second_max, 0) would erase the distinction between 'no second tier' and 'a second tier at zero', which is why the report ships the NULL untouched. MAX is the honest reader here: at most one row per department carries rank 2 (dense ranks are unique per tier), and where none does, MAX over NULLs stays NULL.",
    ],
    edges: [
      "Finance's 95000 / 95000 / 80000 punishes ROW_NUMBER twice over: Finance reports 95000 (the second 95000 row takes number 2) and Support reports 55000 (its second same-salary row also takes number 2) — row numbering invents runner-up tiers that do not exist.",
      "The same Finance rows punish RANK: the tie makes 80000 rank 3, the rank-2 CASE matches nothing, and a real runner-up prints NULL.",
      "Support's 55000 / 55000 punishes the rank-2 filter join: both rows are tier 1, the filter keeps nothing, and the department disappears from the output instead of reporting NULL — the GROUP BY spine is what keeps every department present.",
      "Legal's single row (Gus at 70000) punishes COALESCE(second_max, 0): the correct answer is NULL, and zeroing it would dress an absent tier up as a paid one; Engineering's 120000 / 105000 / 90000 pins the happy path at 105000 — the middle tier, not MAX and not MIN.",
    ],
    ladder: [
      { title: "Brute force — dedupe and read element two", body: "Per department, collect the salaries into a set, sort it descending, read element 2 or NULL. The loop re-implements grouping, deduplication and sorting the engine already composes." },
      { title: "The pattern — dense tiers over a grouped spine", body: "DENSE_RANK over (PARTITION BY department ORDER BY salary DESC) numbers tiers; GROUP BY department with MAX(CASE WHEN rnk = 2) pivots the runner-up tier and keeps NULL departments alive." },
      { title: "The optimal idea — 'second distinct' is a tier question", body: "O(n log n). The durable rule: ROW_NUMBER counts rows, RANK skips numbers after ties, DENSE_RANK counts tiers — and reports that must include NULL departments need the grouped spine, never a rank filter." },
    ],
    approach: "DENSE_RANK over (PARTITION BY department ORDER BY salary DESC); GROUP BY department pivoting MAX(CASE WHEN rnk = 2) so NULL departments survive",
    schema: {
      ddl: `CREATE TABLE Employee (
  emp_id     INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  department TEXT NOT NULL,
  salary     INTEGER NOT NULL
);`,
      seed: `INSERT INTO Employee (emp_id, name, department, salary) VALUES
  (1, 'Ada', 'Engineering', 120000),
  (2, 'Bram', 'Engineering', 105000),
  (3, 'Cleo', 'Engineering', 90000),   -- three distinct tiers: runner-up 105000
  (4, 'Dov', 'Finance', 95000),
  (5, 'Esme', 'Finance', 95000),       -- tie at the top: one tier, two rows
  (6, 'Fay', 'Finance', 80000),        -- the true second tier
  (7, 'Gus', 'Legal', 70000),          -- a one-employee department: NULL
  (8, 'Hana', 'Support', 55000),
  -- two rows, one tier: NULL again
  (9, 'Ivan', 'Support', 55000);`,
      tables: [
        { name: "Employee", note: "9 staff over 4 departments — Engineering holds 3 distinct salaries, Finance a tied top, Legal one employee, Support one salary twice" },
      ],
    },
    code: `WITH ranked AS (
    SELECT
        department,
        salary,
        DENSE_RANK() OVER (
            PARTITION BY department
            ORDER BY salary DESC   -- tier 1 is the top salary, however many rows share it
        ) AS rnk
    FROM Employee
)
SELECT
    department,
    MAX(CASE WHEN rnk = 2 THEN salary END) AS second_max   -- no tier 2 -> MAX of NULLs -> NULL
FROM ranked
GROUP BY department
ORDER BY department;`,
    walkthrough: [
      "DENSE_RANK numbers tiers per department: Engineering 120000/105000/90000 become ranks 1/2/3; Finance's two 95000 rows share rank 1 with 80000 at rank 2; Legal's lone 70000 takes rank 1; Support's two 55000s share rank 1.",
      "The GROUP BY spine holds all four departments, and MAX(CASE WHEN rnk = 2) reads the tier-2 salary where it exists — 105000 for Engineering, 80000 for Finance — while folding all-NULL into NULL for Legal and Support.",
      "ORDER BY department ships (Engineering, 105000), (Finance, 80000), (Legal, NULL), (Support, NULL) — the two NULL rows are answers, reporting that no second tier exists.",
    ],
    time: "O(n log n) — one partitioned sort feeding the ranking, then a grouped pass",
    space: "O(n) — one ranked row per employee",
    followUps: [
      "Report the top-two salaries as two columns (first_max, second_max) in one pass — how does a second MAX(CASE) over rank 1 extend the pivot, and what happens in Support?",
      "Flag departments where the second tier sits within 10 percent of the top — where does the ratio test live (inside the pivot, or after it), and why can it never live in the ranking window?",
    ],
    related: ["second-highest-salary", "department-highest-salary", "department-top-three-salaries"],
    order: "exact",
    xp: 20,
  },
];
