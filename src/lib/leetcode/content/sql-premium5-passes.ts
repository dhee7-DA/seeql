// Deep-dives — LeetCode Premium batch V, file: pass chains and pass games
// (3 problems: 3 Hard). Re-authored from the canonical premium tasks: own
// tables, own seeds, original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_PREMIUM5_PASSES: LcSqlDive[] = [
  {
    slug: "find-circular-gift-exchange-chains",
    statement:
      "GiftExchange records one gift hand-off per row (exchange_id, giver_id, receiver_id). Every person gives exactly one gift and receives exactly one gift, and nobody gifts themselves — the rows therefore fall into disjoint rings that cover everyone. An edge a → b belongs to a cycle iff following the chain on from b eventually arrives back at a. Report every edge that belongs to a cycle: columns giver_id, receiver_id, cycle_size, where cycle_size is the number of edges on the ring the edge sits on, ordered by giver_id ascending.",
    examples: [
      {
        input:
          "the first three exchanges ring 1 → 2 → 3 → back to 1 (exchange 1 hands 1 to 2, exchange 2 hands 2 to 3, exchange 3 hands 3 to 1)",
        output: "1 → 2 · size 3 · 2 → 3 · size 3 · 3 → 1 · size 3",
        explanation:
          "The chase out of 1 crosses one edge per step: 1→2 at step 1, 2→3 at step 2, 3→1 at step 3 — landing back on 1 at step 3, so the ring holds 3 edges and all three edges report 3.",
      },
      {
        input: "exchanges 4 through 8 ring 4 → 5 → 6 → 7 → 8 → back to 4",
        output: "4 → 5 · size 5 · 5 → 6 · size 5 · 6 → 7 · size 5 · 7 → 8 · size 5 · 8 → 4 · size 5",
        explanation:
          "The chase from 4 lands back on 4 at step 5, so each of the five edges reports 5 — the two rings' sizes never mix, and all eight rows ship in one report ordered by giver.",
      },
    ],
    constraints: [
      "each person gives exactly one gift and receives exactly one (both columns are unique over the person set) and never gifts themselves — the table is one or more disjoint rings covering every person",
      "an edge a → b is reported iff the chain leaving b eventually returns to a; the counting rule is fixed: the edge out of the chase's starting giver is step 1, each crossed edge adds one, and the step at which a chase row lands back on the starting giver is that ring's cycle_size",
      "columns giver_id, receiver_id, cycle_size, ordered by giver_id ascending",
    ],
    breakdown: [
      "A gift exchange among eight people is a permutation: the giver column and the receiver column each list every person exactly once, so following the chain from anyone is fully deterministic — one edge leaves each person, and the chase never branches. Determinism is what lets a single recursive CTE chase from every giver at once without a per-start loop: each starting row evolves independently along its own chain. A fixed-arity self-join cannot do this job, because a ring has no fixed length — the seed holds a 3-ring and a 5-ring side by side, and no finite number of join stages covers both without enumerating the longer one. Recursion is the tool for walk-until-told-to-stop, and the walk's own counter is what tells it when a ring has closed.",
      "The counting rule must be defined once and never re-derived: the chase's first row is the edge OUT of the starting giver and it is step 1, every crossed edge adds one, and the step at which a chase row lands back ON the starting giver is the ring's edge count. Under that rule the 3-ring reads 3 and the 5-ring reads 5 — the landing step and the edge count coincide because the landing row IS the last edge of the ring. Seed the walk at step 0 instead and the landings read 2 and 4; treat the starting person itself as step 1 and they slip to 4 and 6; subtract one to fix it and every row of the output shifts. The examples pin the arithmetic so the query, the prose and the asserts cannot drift apart.",
      "The termination guard is the quiet hero: in a permutation the chase from ANY person loops forever, because after landing back on the start it simply keeps circling the ring — no row ever says stop. A recursive CTE with no guard therefore never terminates on this very seed, which is why the walk is bounded by a step cap of the person count: a ring through a permutation holds at most one edge per person, so every true landing happens at or before step n and the cap never truncates a real cycle. The cap also future-proofs the shape — if the exactly-one guarantee ever relaxes and a chain dangles, the walk dies at the cap instead of hanging. Finally, sizes ride the chase's starting person and join back per giver, so the 3-ring's size can never leak onto the 5-ring's edges inside one shared report.",
    ],
    edges: [
      "Termination is not decorative: person 1's chase closes at step 3 and person 4's at step 5, but neither walk STOPS — after landing on 1 it keeps producing (1→2 at step 4), (2→3 at step 5) and so on, so a recursive walk with no cap runs away on this very seed. The WHERE step < person-count guard is what ends it; a cap tighter than 5 (say step < 3) truncates ring two and drops exchanges 4 through 8 from the report entirely.",
      "The arithmetic bites everywhere at once: exchange 3 (3 → 1) must read 3, but a step-0 seeding or a k-1 subtraction reads 2 — and ring two's edges (4 → 5 through 8 → 4) would all read 4 — the off-by-one rewrites all eight rows, not just the landing row.",
      "Two rings share one output: exchange 1 (1 → 2) reports 3 while exchange 4 (4 → 5) reports 5 — a walk whose landing steps are aggregated globally (a MIN or MAX over the whole chase rather than per starting person) paints one ring's size onto the other's edges; the size belongs to the chase START.",
      "All eight edges qualify and all eight must ship: a query that reduces the report to distinct ring shapes, or filters for the bigger ring, silently drops exchanges 1-3 even though each satisfies the cycle rule; the per-edge proof runs through every giver, not through a sample.",
    ],
    ladder: [
      { title: "Brute force — follow each chain by hand", body: "For each edge, walk the chain from the receiver, counting hops until the giver reappears. Correct but manual — and on an edge that sits on no ring (possible the moment the exactly-one guarantee relaxes), the hand-walk chases forever: the loop hazard is live even here." },
      { title: "The pattern — one recursive chase, landing steps as sizes", body: "A recursive CTE chases from every giver with a step counter; a row whose receiver equals its chase's start person closes a ring; MIN(step) over those landings is the ring's size, joined back onto the edges." },
      { title: "The optimal idea — cap the walk at the person count", body: "O(n²). In an out-degree-1 graph, is-this-node-on-a-cycle is answered by walking with a counter capped at the node count — the cap is the termination proof, the landing step IS the cycle length, and the size rides the chase's start person." },
    ],
    approach: "WITH RECURSIVE chase from every giver, step 1 = the edge out of the start; landing back on the start at step k makes k the ring's edge count; steps capped at the person count",
    schema: {
      ddl: `CREATE TABLE GiftExchange (
  exchange_id INTEGER PRIMARY KEY,
  giver_id    INTEGER NOT NULL UNIQUE,  -- exactly one gift GIVEN per person
  receiver_id INTEGER NOT NULL UNIQUE,  -- exactly one gift RECEIVED per person
  CHECK (giver_id <> receiver_id)       -- no self-gifts
);`,
      seed: `INSERT INTO GiftExchange (exchange_id, giver_id, receiver_id) VALUES
  (1, 1, 2),  -- ring one: 1 gives to 2
  (2, 2, 3),  -- ring one: 2 gives to 3
  (3, 3, 1),  -- ring one closes: back to 1
  (4, 4, 5),  -- ring two opens: 4 gives to 5
  (5, 5, 6),
  (6, 6, 7),
  (7, 7, 8),
  -- ring two closes: 8 hands back to 4
  (8, 8, 4);`,
      tables: [
        { name: "GiftExchange", note: "8 exchanges over 8 people — two disjoint rings: 1→2→3→1 (3 edges) and 4→5→6→7→8→4 (5 edges); every person gives and receives exactly once" },
      ],
    },
    code: `WITH RECURSIVE chase(start_person, hop, step) AS (
    SELECT giver_id, receiver_id, 1               -- step 1 = the edge OUT of the starting giver
    FROM GiftExchange
    UNION ALL
    SELECT c.start_person, g.receiver_id, c.step + 1
    FROM chase c
    JOIN GiftExchange g ON g.giver_id = c.hop     -- follow the chain one more edge
    WHERE c.step < (SELECT COUNT(DISTINCT giver_id) FROM GiftExchange)  -- termination guard
),
revisits AS (
    SELECT start_person AS giver_id, MIN(step) AS cycle_size
    FROM chase
    WHERE hop = start_person                      -- the chase landed back on its start: k = ring size
    GROUP BY start_person                         -- sizes ride the chase START, never a global mix
)
SELECT ge.giver_id, ge.receiver_id, r.cycle_size
FROM GiftExchange ge
JOIN revisits r ON r.giver_id = ge.giver_id      -- keep every edge whose giver closed a ring
ORDER BY ge.giver_id;`,
    walkthrough: [
      "The chase seeds eight walks at once, one per giver. Person 1's walk runs (1→2 at step 1), (2→3 at step 2), (3→1 at step 3) — the third row lands back on 1, closing the ring at k=3; the guard lets it keep circling (1→2 again at step 4) but the cap at 8 people stops it by step 8.",
      "revisits records person 1 → 3 (the MIN over landing steps 3 and 6) and the same for 2 and 3; person 4's walk runs five steps — (4→5), (5→6), (6→7), (7→8), (8→4) — landing at step 5, so persons 4 through 8 each record 5.",
      "The join-back keeps every exchange whose giver closed a ring — all eight — and ORDER BY giver_id ships (1, 2, 3), (2, 3, 3), (3, 1, 3), then (4, 5, 5), (5, 6, 5), (6, 7, 5), (7, 8, 5), (8, 4, 5): the 3-ring and the 5-ring side by side, each edge stamped with its own ring's count.",
    ],
    time: "O(n²) — one chase per giver, each bounded by n steps (n = person count)",
    space: "O(n²) — chase rows across all starts, capped by the step guard",
    followUps: [
      "Relax the exactly-one guarantee: people may give or receive several gifts and some chains may dangle — which chases now branch or never close, and how must the step guard and the revisit test change to still separate cyclic edges from dangling ones?",
      "Report each ring once — its smallest giver, its size, its members in chase order — instead of one row per edge; what groups the landing steps into distinct rings, and why can a ring never be printed as a straight line?",
    ],
    related: ["symmetric-pairs", "friends-with-no-mutual-friends", "tree-node"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "team-dominance-by-pass-success",
    statement:
      "PassAction logs every pass attempt as one row (pass_id, team, player_name, target_name, outcome), with pass_id increasing through the game and the two teams' rows interleaved in time. A team's dominance is its completion percentage: completed passes × 100.0 ÷ that team's own total passes, rounded to 2 decimals. Report the single most dominant team: columns team, completion_pct. If several teams share the top rounded percentage, report every one of them, ordered by team ascending — this dataset has a single leader.",
    examples: [
      {
        input: "home attempts 12 passes and completes 10 — its two failures are its last two throws, passes 21 and 23",
        output: "home · 83.33",
        explanation:
          "10 × 100.0 ÷ 12 = 83.3333, rounded to 83.33. The two tail failures cost exactly two of twelve attempts — the ratio reads the whole game, not the closing run.",
      },
      {
        input: "away completes its first nine passes (pass 2 through pass 18) then misses its last three (20, 22, 24)",
        output: "away never surfaces — 9 × 100.0 ÷ 12 = 75.0, second place",
        explanation:
          "A front-loaded run reads hot early, but dominance divides by all 12 attempts; the runner-up sits one completion short of a rounded tie and stays out of the report.",
      },
    ],
    constraints: [
      "the denominator is the team's OWN pass count — never the table's total; each team attempts exactly 12 here, but the formula must not borrow the opponent's rows",
      "completion_pct is ROUND(completed × 100.0 / total, 2) and the winner is the maximum ROUNDED value; teams equal at the rounded figure all report, ordered by team ascending",
      "columns team, completion_pct — this seed yields exactly one row (the leader), so the output is a single row and the team-ascending order holds trivially",
    ],
    breakdown: [
      "Dominance is a per-team aggregate, so the query's spine is GROUP BY team over a count of rows and a count of completes. The denominator is the trap hiding in plain sight: home's 10 completes are 83.33 percent of home's 12 attempts but 41.67 percent of the table's 24 rows, and any formula that divides by an un-partitioned total (a whole-table count in a subquery, or an average spread across both teams) halves every team at once. The 100.0 is load-bearing too — in SQLite, completed * 100 / total is integer division, so 1000 ÷ 12 floors to 83 before ROUND ever runs — and the .0 (or an explicit CAST) is the difference between 83 and 83.33. Rounding then lives at the reporting boundary: the figure the report prints is the figure that must be compared.",
      "The argmax must survive its own tie rule. ORDER BY pct DESC LIMIT 1 picks a top row but picks ARBITRARILY among tied rows, because equal percentages have no secondary key to split them — so the honest shape keeps every team AT the maximum: WHERE completion_pct = (SELECT MAX(completion_pct) ...) followed by ORDER BY team for the tie contract. The comparison runs on the rounded figure because that is the number the report actually prints. The seed is engineered to make this branch matter without triggering it: away sits exactly one completion short, so flipping pass 22 to complete would put both teams at 10/12 = 83.33 and widen the output to two alphabetical rows.",
      "The winner's tail fails and the ratio does not care. Home's last four throws read complete, complete, incomplete, incomplete — passes 17, 19, 21 and 23 — yet 10-of-12 still tops the table, because dominance divides by every attempt, not by the closing stretch. The per-STREAK lens is a different report altogether (dive longest-team-pass-streak's business): there, home's best completed run and away's front-loaded 9-straight (passes 2 through 18) would be the headline numbers, and neither lens's number is the other's — 10 is not 83.33, and 9 is not 75.0. Pairing the two problems is the point: one lens divides by the team's whole history, the other by the tightest consecutive window, and conflating them is how a dominant team gets called cold.",
    ],
    edges: [
      "The denominator is per team: home reads 10 × 100.0 ÷ 12 = 83.33, not 10 ÷ 24 — a whole-table count (or an un-grouped average) divides home's 10 completes and away's 9 by 24 and reports 41.67 and 37.5; the GROUP BY team boundary is the entire fix.",
      "Integer division floors before ROUND can help: completed * 100 / total computes 1000 ÷ 12 = 83 in SQLite integer math, so home ships 83.0 and the example's 83.33 never materializes — the 100.0 promotion must sit INSIDE the division.",
      "The near-tie is planted, not accidental: flip pass 22 (away, incomplete) to complete and away reaches 10/12 = 83.33, tying home — the WHERE pct = MAX shape must then widen to (away · 83.33) then (home · 83.33) by the team-ASC rule, while an ORDER BY pct DESC LIMIT 1 would silently keep one arbitrary row of the two.",
      "The interleave is the streak lens' bait: pass_id order alternates the teams (home at odd ids, away at even), so reading the table chronologically and resetting on team changes is exactly dive longest-team-pass-streak's report — there home's closing failures (21, 23) and away's 9-straight opening run (passes 2-18) would headline, and neither reading produces 83.33 or 75.0; dominance is the per-team ratio over all 12 attempts, full stop.",
    ],
    ladder: [
      { title: "Brute force — tally the 24 rows by hand", body: "Tally each team's attempts and completes over the interleaved rows, divide, round, compare. Works for one game night, and it hides both the tie rule and the integer-division cliff the engine will spring." },
      { title: "The pattern — grouped tally, rounded, argmax by equality", body: "GROUP BY team builds the tally; the scored CTE rounds completed * 100.0 / total to two decimals; the outer query keeps every team at the MAX rounded pct, ordered by team." },
      { title: "The optimal idea — promote, round at the boundary, tie-safe argmax", body: "O(n + t). The durable rules: promote to REAL inside the division (the .0 IS the number), round at the reporting boundary and compare on the rounded value so the printed figures decide ties, and express argmax as equality against the max — never LIMIT 1 without a tie policy." },
    ],
    approach: "GROUP BY team tally, ROUND(completed * 100.0 / total, 2), keep every team at the MAX rounded pct, ORDER BY team",
    schema: {
      ddl: `CREATE TABLE PassAction (
  pass_id     INTEGER PRIMARY KEY,
  team        TEXT NOT NULL CHECK (team IN ('home', 'away')),
  player_name TEXT NOT NULL,
  target_name TEXT NOT NULL,
  outcome     TEXT NOT NULL CHECK (outcome IN ('complete', 'incomplete'))
);`,
      seed: `INSERT INTO PassAction (pass_id, team, player_name, target_name, outcome) VALUES
  (1,  'home', 'Vega',   'Mora',  'complete'),
  (2,  'away', 'Okafor', 'Rios',  'complete'),
  (3,  'home', 'Vega',   'Kade',  'complete'),
  (4,  'away', 'Okafor', 'Lund',  'complete'),
  (5,  'home', 'Mora',   'Vega',  'complete'),
  (6,  'away', 'Okafor', 'Rios',  'complete'),
  (7,  'home', 'Vega',   'Ines',  'complete'),
  (8,  'away', 'Petrov', 'Rios',  'complete'),
  (9,  'home', 'Vega',   'Mora',  'complete'),
  (10, 'away', 'Okafor', 'Tao',   'complete'),
  (11, 'home', 'Kade',   'Vega',  'complete'),
  (12, 'away', 'Okafor', 'Lund',  'complete'),
  (13, 'home', 'Vega',   'Ines',  'complete'),
  (14, 'away', 'Petrov', 'Rios',  'complete'),
  (15, 'home', 'Vega',   'Kade',  'complete'),
  (16, 'away', 'Okafor', 'Tao',   'complete'),
  (17, 'home', 'Mora',   'Vega',  'complete'),
  (18, 'away', 'Okafor', 'Rios',  'complete'),
  (19, 'home', 'Vega',   'Mora',  'complete'),   -- home's tenth straight completion
  (20, 'away', 'Okafor', 'Lund',  'incomplete'), -- away's front run ends: three misses close their day
  (21, 'home', 'Vega',   'Ines',  'incomplete'), -- the winner's tail starts to fail
  (22, 'away', 'Petrov', 'Rios',  'incomplete'),
  (23, 'home', 'Kade',   'Vega',  'incomplete'), -- two misses in twelve: 10/12 still tops the table
  (24, 'away', 'Okafor', 'Tao',   'incomplete');`,
      tables: [
        { name: "PassAction", note: "24 passes in game order, pass_id 1-24, teams interleaved (home odd, away even) — home 10/12 complete, away 9/12; home's failures sit at its last two throws" },
      ],
    },
    code: `WITH tally AS (
    SELECT
        team,
        COUNT(*) AS total_passes,
        SUM(CASE WHEN outcome = 'complete' THEN 1 ELSE 0 END) AS completed_passes
    FROM PassAction
    GROUP BY team                        -- each team's OWN rows are the only denominator
),
scored AS (
    SELECT
        team,
        ROUND(completed_passes * 100.0 / total_passes, 2) AS completion_pct
        -- 100.0 forces REAL division: 10 * 100 / 12 would floor to 83
    FROM tally
)
SELECT team, completion_pct
FROM scored
WHERE completion_pct = (SELECT MAX(completion_pct) FROM scored)  -- every team AT the top, never LIMIT 1
ORDER BY team ASC;                       -- tie contract: equal rounded pcts ship alphabetically`,
    walkthrough: [
      "tally collapses 24 interleaved rows into two tallies: home 12 attempts / 10 completes (its failures are passes 21 and 23), away 12 / 9 (passes 20, 22, 24).",
      "scored rounds each ratio: home 10 × 100.0 ÷ 12 = 83.3333, which lands on 83.33; away 9 × 100.0 ÷ 12 = 75.0. The 100.0 keeps the division REAL — integer math would print home at 83.",
      "MAX(completion_pct) = 83.33 keeps exactly home's row, and ORDER BY team ships (home, 83.33). Away's 75.0 — one completion short of a rounded tie — never leaks in; had pass 22 completed, the report would widen to away then home, both at 83.33.",
    ],
    time: "O(n) — one grouped pass over the rows, one max over the tallies",
    space: "O(t) — one tally row per team (t = 2 here)",
    followUps: [
      "Report every team's percentage beside the leader's in one row set — which window (or self-join on the max) carries the leader's figure without collapsing rows, and how does the tie rule change if the comparison runs on the UNROUNDED ratio?",
      "Weight late-game passes double (say, pass_id above 12 counts twice in numerator and denominator) — where must the weighting live so each team's denominator stays its own weighted total, and does ROUND still belong at the reporting boundary?",
    ],
    related: ["friend-requests-ii-who-has-the-most-friends", "the-airport-with-the-most-flights", "weather-type-in-each-country"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "longest-team-pass-streak",
    statement:
      "PassAction again logs every pass as one row (pass_id, team, player_name, target_name, outcome), pass_id running chronologically through the game with the two teams interleaved. A team's streak is a run of CONSECUTIVE pass_id rows that are all owned by that team AND all complete — any row in between that belongs to the other team, or that is incomplete, breaks the run. Report each team's longest streak: columns team, longest_streak, ordered by team ascending.",
    examples: [
      {
        input: "passes 4 through 8 are five straight home completions, fenced by away completions at passes 3 and 9",
        output: "home · 5 (the largest streak in the report, beside away · 3)",
        explanation:
          "Five consecutive rows, all home and all complete. Row 3 (away, complete) and row 9 (away, complete) each break the run — a foreign row is a break even when it succeeds.",
      },
      {
        input: "away strings completions at passes 9, 10, 11 — then pass 12 is a home INCOMPLETE",
        output: "away · 3",
        explanation:
          "The home failure at 12 is both a foreign row and a failed one — either fact alone breaks the run. Away's later three-in-a-row (passes 16-18) merely ties it, and the tie changes nothing.",
      },
    ],
    constraints: [
      "consecutiveness is judged in FULL pass_id order — a streak breaks on any interleaved foreign row or any incomplete row, not merely on the team's own failures",
      "every team in PassAction appears exactly once in the output; a team whose best run is a single completed pass reports 1",
      "columns team, longest_streak, ordered by team ascending",
    ],
    breakdown: [
      "Streaks live in game time, so the LAG that asks whether this run continued must walk the FULL chronological sequence — partitioning by team first is the seductive mistake. Deleting the foreign rows rewrites history: home's passes 4-8 sit between away's passes 2-3 and away's passes 9-11, and once the away rows are deleted, away's pass 3 and pass 9 become partition-neighbors even though five home completions stand between them in the game. The rows that break a streak are exactly the rows the partition deleted — which is why the break can only be detected by looking across them, from a window that never drops a row.",
      "Each row asks its predecessor two questions — same team, and did we both complete — and any other answer plants a break marker. The running SUM of markers over pass_id order hands every row an island number: rows between two markers share one island, so a run's length becomes a group's COUNT. Two invariants make the trick safe: a marker fires on every team change, so an island can never hold two teams; and an incomplete row always plants a marker, so failures live in singleton islands that count but can never inflate a run.",
      "A streak's length is a property of a GROUP of rows, and no single-row expression can see a group — that is why the island trick converts run-length into group size and lets two plain aggregates finish: COUNT rows per (team, island), then MAX per team. Home's best run here is passes 4-8, strictly inside the game — the opener (pass 1) is a lone completion at the very start, and the closer (pass 24) is a lone completion after away's failed 23 — so a current-streak reading or an opening-streak reading reports 1 and misses the 5 entirely. The seed also plants away's second 3-run (passes 16-18) to make the point that ties are real: MAX folds them into one row per team, which is the contract.",
    ],
    edges: [
      "The partition-first trap is wired into the seed: away's own rows 2, 3 and 9, 10, 11 become partition-neighbors once home's 4-8 are deleted, so the partitioned LAG welds them into one 5-row run — and because the running island sum is global, the wrong query even parks home's passes 4-8 and away's rows inside ONE island; the report reads (away · 5), (home · 5) against the truth (away · 3), (home · 5).",
      "The break rule must test the PAIR: away's pass 15 is incomplete and pass 16 completes, so a flag that checks only the team (or only the current outcome) chains rows 15-18 into a 4-row run and reports away at 4 — the marker fires unless the row is the same team AND both it and its predecessor completed.",
      "Home's best is strictly mid-sequence: passes 4-8, fenced by away completions at 3 and 9 — a current-streak query (the run still alive at pass 24) reads home as 1, pass 24 alone after away's failed 23, and an opening-streak query also reads 1, pass 1 before away takes over at 2; the 5 lives strictly inside and never touches either end.",
      "Ties are folded, not printed: away owns two 3-row islands (passes 9-11 and 16-18) and MAX silently keeps one — a query that reports every island, or every island tied for a team's best, ships six rows instead of the contracted two.",
    ],
    ladder: [
      { title: "Brute force — one counter per team", body: "Walk the 24 rows keeping a counter per team: add one while the next row is the same team and complete, reset on any foreign or failed row, remember each team's best. Correct, and exactly the state machine that LAG plus a running sum expresses for the engine." },
      { title: "The pattern — LAG, markers, islands, two aggregates", body: "LAG over the full pass_id order exposes prev_team and prev_outcome; the CASE plants break markers; the running SUM of markers numbers the islands; COUNT per (team, island) then MAX per team finishes the report." },
      { title: "The optimal idea — run length as group size", body: "O(n log n). The transferable rule: run-length questions become group-size questions — the LAG must see game time (a full ORDER BY pass_id, never PARTITION BY team), the flag must encode BOTH continuation conditions (same team, both complete), and everything after is ordinary grouping." },
    ],
    approach: "LAG over the full pass_id order, flag breaks (foreign team or any incomplete), island ids via running break-sum, COUNT per island, MAX per team",
    schema: {
      ddl: `CREATE TABLE PassAction (
  pass_id     INTEGER PRIMARY KEY,
  team        TEXT NOT NULL CHECK (team IN ('home', 'away')),
  player_name TEXT NOT NULL,
  target_name TEXT NOT NULL,
  outcome     TEXT NOT NULL CHECK (outcome IN ('complete', 'incomplete'))
);`,
      seed: `INSERT INTO PassAction (pass_id, team, player_name, target_name, outcome) VALUES
  (1,  'home', 'Vega',   'Mora',  'complete'),   -- opener: a lone home completion
  (2,  'away', 'Okafor', 'Rios',  'complete'),
  (3,  'away', 'Okafor', 'Lund',  'complete'),
  (4,  'home', 'Vega',   'Ines',  'complete'),   -- home's five straight begin
  (5,  'home', 'Vega',   'Mora',  'complete'),
  (6,  'home', 'Kade',   'Vega',  'complete'),
  (7,  'home', 'Vega',   'Ines',  'complete'),
  (8,  'home', 'Mora',   'Kade',  'complete'),   -- and end here: away completes next
  (9,  'away', 'Okafor', 'Rios',  'complete'),   -- away's three straight begin
  (10, 'away', 'Petrov', 'Rios',  'complete'),
  (11, 'away', 'Okafor', 'Tao',   'complete'),
  (12, 'home', 'Vega',   'Ines',  'incomplete'), -- foreign AND failed: breaks away's 3 either way
  (13, 'home', 'Vega',   'Mora',  'complete'),   -- home failure immediately followed by home completes
  (14, 'home', 'Mora',   'Kade',  'complete'),   -- the 2-run
  (15, 'away', 'Okafor', 'Lund',  'incomplete'),
  (16, 'away', 'Petrov', 'Rios',  'complete'),   -- away's second 3-run: ties, does not beat
  (17, 'away', 'Okafor', 'Rios',  'complete'),
  (18, 'away', 'Okafor', 'Tao',   'complete'),
  (19, 'home', 'Kade',   'Vega',  'incomplete'), -- another failure-then-2-run for home
  (20, 'home', 'Vega',   'Mora',  'complete'),
  (21, 'home', 'Mora',   'Kade',  'complete'),
  (22, 'away', 'Okafor', 'Lund',  'complete'),
  (23, 'away', 'Petrov', 'Rios',  'incomplete'),
  -- closer: a lone 1-row island
  (24, 'home', 'Vega',   'Ines',  'complete');`,
      tables: [
        { name: "PassAction", note: "24 passes in game order, pass_id 1-24, teams interleaved in blocks — home's best run is passes 4-8, away's is 9-11 (tied by 16-18)" },
      ],
    },
    code: `WITH flagged AS (
    SELECT
        pass_id,
        team,
        outcome,
        LAG(team) OVER (ORDER BY pass_id) AS prev_team,        -- the FULL chronological sequence
        LAG(outcome) OVER (ORDER BY pass_id) AS prev_outcome   -- never PARTITION BY team first
    FROM PassAction
),
runs AS (
    SELECT
        pass_id,
        team,
        CASE
            WHEN team = prev_team AND outcome = 'complete' AND prev_outcome = 'complete' THEN 0
            ELSE 1  -- break: a foreign row, or any incomplete, ends the run
        END AS is_break
    FROM flagged
),
islands AS (
    SELECT
        pass_id,
        team,
        SUM(is_break) OVER (ORDER BY pass_id) AS island_id  -- running marker count numbers the islands
    FROM runs
),
sizes AS (
    SELECT team, island_id, COUNT(*) AS run_len
    FROM islands
    GROUP BY team, island_id        -- a marker fires on every team change: islands never mix teams
)
SELECT team, MAX(run_len) AS longest_streak
FROM sizes
GROUP BY team
ORDER BY team ASC;`,
    walkthrough: [
      "flagged walks all 24 rows in pass_id order: rows 4-8 chain (five home completes in a row) until away's complete at 9 breaks; rows 9-11 chain until home's incomplete at 12; rows 16-18 chain after away's failed 15; rows 20-21 chain after home's failed 19.",
      "The running break-sum stamps 13 islands — {4..8} home 5, {9,10,11} and {16,17,18} away 3 each, {2,3}, {13,14} and {20,21} runs of 2 — and the failures live in singleton islands (passes 1, 12, 15, 19, 23, plus the lone closers 22 and 24).",
      "COUNT per island then MAX per team: away's best 3 (two islands tie — MAX folds them), home's best 5. ORDER BY team ships (away, 3) then (home, 5) — home's five lived mid-sequence, nowhere near the opening singleton or the closing one.",
    ],
    time: "O(n log n) — one ordered pass for the LAG, one for the running sum, then grouping",
    space: "O(n) — one flagged row and one island row per pass",
    followUps: [
      "Report the actual span of each team's best run — first and last pass_id of the winning island — and break ties between a team's equal islands (away has two 3s here) by the earlier start; which aggregates over the island rows carry the boundary ids?",
      "Track each team's longest FAILED streak beside the longest completed one — which literal flips the flag, and what does the island arithmetic do with two same-team failures back to back (does a singleton island still count 1)?",
    ],
    related: ["customers-with-maximum-number-of-transactions-on-consecutive-days", "longest-winning-streak", "consecutive-transactions-with-increasing-amounts"],
    order: "exact",
    xp: 35,
  },
];
