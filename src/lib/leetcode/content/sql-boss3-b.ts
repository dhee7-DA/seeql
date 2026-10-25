// Deep-dives — the BOSS LEVEL III band, file B of B (1 Hard, 2 Medium).
// Original recursive/graph problems authored for this app: canonical-edge
// triangle counting over a directional follow graph, referral generations
// pivoted per origin, and effective equity ownership summed over every
// ownership path. Every solution is engine-verified against its own seed by
// scripts/lc-sql-verify.ts before wiring.
import type { LcSqlDive } from "../types";

export const SQL_BOSS3_B: LcSqlDive[] = [
  {
    slug: "mutual-follow-triangles",
    statement:
      "A social graph is stored as directional follows in Follows (follower_id, followee_id) — a pair may appear in both directions, one direction, or not at all. Treat two users as CONNECTED when a follow exists in EITHER direction. A triangle is any set of three distinct users whose three pairs are all connected; each triangle is counted once as a whole, and each of its three members belongs to it. For every user in at least two triangles, report user_id and triangle_count. Order by triangle_count DESC, then user_id ASC.",
    examples: [
      {
        input: "follows 1→2, 2→3, 1→3 (mixed directions elsewhere)",
        output: "users 1, 2 and 3 each gain one triangle",
        explanation:
          "Direction only matters for storage: as soon as each pair has a follow in at least one direction, the triple {1,2,3} is a triangle and all three members count it.",
      },
      {
        input: "a user with exactly one triangle",
        output: "…does not appear in the output",
        explanation:
          "The report targets users embedded in multiple triangles — the HAVING threshold is 2, not 1, so single-triangle users stay out even though they belong to a triangle.",
      },
    ],
    constraints: [
      "one output row per user in ≥ 2 triangles: user_id, triangle_count",
      "a connection is a follow in either direction (deduplicated)",
      "each triangle counts once per member; a user in two triangles reports 2",
      "order by triangle_count DESC, then user_id ASC",
    ],
    breakdown: [
      "Direction is noise, so normalize first: fold every follow into its canonical (smaller, larger) pair with MIN/MAX and GROUP BY that pair to collapse the one-way and two-way cases into one undirected edge. Everything downstream then reasons about a clean edge set instead of chasing two rows per relationship.",
      "The enumeration is a three-way self-join with a canonical shape: edge (a,b), edge (b,c) and edge (a,c) with a < b < c forces each triangle to be discovered exactly once — every candidate triple has a unique sorted order, and the sorted roles pin which edges play which part. Without the ordering constraint the same triangle surfaces up to six times (three rotations × two starting directions) and every count triples.",
      "Membership is an UNPIVOT: triangles carry (a, b, c), so unioning the three columns turns each triangle into three (triangle, user) rows, and COUNT(*) per user is the membership count. HAVING COUNT(*) >= 2 then applies the report's threshold — after aggregation, where a threshold on a count always belongs.",
    ],
    edges: [
      "One-way edges are the trap: (1,3), (2,4), (3,5) and (1,6) each exist in exactly ONE direction in the seed. A solution that self-joins Follows directly (without the canonical fold) misses every triangle that leans on a one-way edge — user 1's count drops from 2 to 1 and user 1 vanishes from the output.",
      "Two-way edges must count ONCE: pair {1,2} appears as two rows (1→2 and 2→1); the GROUP BY canonical pair collapses them, otherwise pair {1,2} doubles and every triangle containing it is enumerated twice.",
      "User 6 has exactly one triangle ({1,2,6}) and user 5 exactly one ({3,4,5}) — both fall below the ≥ 2 threshold and must be absent. They are the proof the HAVING ran.",
      "The seed contains no triple that forms a triangle through a DUPLICATED two-way edge plus a one-way edge by accident — {1,3,4} fails on the missing 1–4 pair, {2,4,6} on the missing 4–6 pair; hand-checking those near-misses is how the counts 3/3/2/2 were verified.",
    ],
    ladder: [
      { title: "Brute force — test every triple", body: "Cross-join users three ways, keep sorted triples, and check six (or three) existence queries per triple. Correct, but O(n³) probes against the follow table." },
      { title: "The pattern — canonical edges + shaped self-join", body: "Fold to undirected pairs, then join e1(a,b) → e2(b,c) → e3(a,c) with a < b < c. The join order IS the enumeration; the shape constraint replaces the dedup logic." },
      { title: "The optimal idea — unpivot membership, aggregate, threshold", body: "Union the three corner columns into member rows and COUNT per user with HAVING. The durable rule: graph counting in SQL = canonicalize, enumerate with a shape, then flatten the result for aggregation." },
    ],
    approach: "canonical (MIN,MAX) fold GROUP BY pair → 3-way self-join e1(a,b)+e2(b,c)+e3(a,c), a<b<c → UNION the three corners → COUNT per user → HAVING ≥ 2 → sort",
    schema: {
      ddl: `CREATE TABLE Follows (
  follower_id INTEGER NOT NULL,
  followee_id INTEGER NOT NULL
);`,
      seed: `INSERT INTO Follows (follower_id, followee_id) VALUES
  (1, 2), (2, 1),   -- two-way pair {1,2}
  (1, 3),           -- one-way
  (2, 3), (3, 2),   -- two-way pair {2,3}
  (4, 2),           -- one-way pair {2,4}
  (3, 4),           -- one-way pair {3,4}
  (5, 3),           -- one-way pair {3,5}
  (4, 5), (5, 4),   -- two-way pair {4,5}
  (6, 1),           -- one-way pair {1,6}
  (2, 6);           -- one-way pair {2,6}`,
      tables: [
        { name: "Follows", note: "11 directional rows over 9 undirected pairs — four triangles exist: {1,2,3}, {2,3,4}, {3,4,5}, {1,2,6}" },
      ],
    },
    code: `WITH edges(a, b) AS (
    SELECT MIN(follower_id, followee_id), MAX(follower_id, followee_id)
    FROM Follows
    GROUP BY MIN(follower_id, followee_id), MAX(follower_id, followee_id)
),
triangles(a, b, c) AS (
    SELECT DISTINCT e1.a, e1.b, e2.b
    FROM edges e1
    JOIN edges e2 ON e2.a = e1.b
    JOIN edges e3 ON e3.a = e1.a AND e3.b = e2.b
    WHERE e1.b < e2.b
)
SELECT user_id, COUNT(*) AS triangle_count
FROM (
    SELECT a AS user_id FROM triangles
    UNION ALL
    SELECT b FROM triangles
    UNION ALL
    SELECT c FROM triangles
) members
GROUP BY user_id
HAVING COUNT(*) >= 2
ORDER BY triangle_count DESC, user_id ASC;`,
    walkthrough: [
      "The fold turns 11 directional rows into 9 canonical pairs — {1,2}, {1,3}, {2,3}, {2,4}, {3,4}, {3,5}, {4,5}, {1,6}, {2,6} — with the two-way pairs ({1,2}, {2,3}, {4,5}) each collapsing to one row.",
      "The shaped self-join finds exactly four triangles: (1,2,3) via (1,2)+(2,3)+(1,3); (2,3,4) via (2,3)+(3,4)+(2,4); (3,4,5) via (3,4)+(4,5)+(3,5); (1,2,6) via (1,2)+(2,6)+(1,6). Near-misses fail on the missing edge: {1,3,4} has no 1–4, {2,4,6} has no 4–6.",
      "The unpivot yields 12 member rows (4 triangles × 3 corners): user 2 appears in {1,2,3}, {2,3,4}, {1,2,6} → 3; user 3 in {1,2,3}, {2,3,4}, {3,4,5} → 3; user 1 in {1,2,3}, {1,2,6} → 2; user 4 in {2,3,4}, {3,4,5} → 2. HAVING drops users 5 and 6 (one each). Four rows: (2,3), (3,3), (1,2), (4,2).",
    ],
    time: "O(d² · n) — the self-join is bounded by edges sharing endpoints; the fold and unpivot are linear",
    space: "O(E + T) — the canonical edge set plus the triangles",
    followUps: [
      "Report the triangle MEMBERS alongside each user's count — how does the unpivot change so the user keeps a pointer back to its triangle, and can (a, b, c) ride along as extra columns?",
      "Count only STRONG triangles (all three pairs follow in both directions) — which single artifact of the canonical fold must be dropped, and does the seed still produce any output?",
    ],
    related: ["strong-friendship", "friend-requests-ii-who-has-the-most-friends", "all-the-pairs-with-the-maximum-number-of-common-followers"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "referral-generations-pivot",
    statement:
      "A referral program is stored in Referrals (referrer_id, referred_id); referred_id is unique — every user was referred by at most one other user. A program ORIGIN is a user who was referred by nobody and referred at least one person directly. For each origin, count their downstream referrals by generation: gen1 (direct), gen2 (referred by a gen1), and gen3plus (everyone deeper, however far). Columns origin_id, gen1, gen2, gen3plus. Order by total downstream referrals (gen1 + gen2 + gen3plus) DESC, then origin_id ASC. Origins with no referrals cannot exist by definition.",
    examples: [
      {
        input: "origin 1 directly referred 2 and 3; 2 referred 4; 4 referred 7; 7 referred 9",
        output: "origin 1 counts: gen1 2, gen2 1, gen3plus 2 (7 and 9)",
        explanation:
          "Generations are graph distance from the origin, not seniority: 7 sits three edges down, 9 four edges down — both land in gen3plus, the bucket with no ceiling.",
      },
      {
        input: "a user who was referred by someone",
        output: "…can never be an origin, even if they run a huge subtree",
        explanation:
          "Origin status is structural: appearing as a referred_id disqualifies a user permanently, because their downstream tree is already attributed to the origin above them.",
      },
    ],
    constraints: [
      "one output row per origin: origin_id, gen1, gen2, gen3plus",
      "an origin is referred by nobody AND referred ≥ 1 person directly",
      "gen3plus absorbs every generation from the third onward",
      "order by (gen1 + gen2 + gen3plus) DESC, then origin_id ASC",
    ],
    breakdown: [
      "The walk is a recursive CTE rooted at the origins' direct referrals: the anchor SELECTs the rows whose referrer is not themselves referred (the NOT IN subquery is the origin test), stamps gen 1, and each step follows the next referral edge adding one to gen. Carrying origin_id through the recursion is what lets one walk serve every origin at once — each descendant knows which root it hangs from.",
      "The pivot is conditional aggregation: SUM(CASE WHEN gen = 1 THEN 1 ELSE 0 END) — one column per bucket, grouped by origin. The open-ended bucket uses gen >= 3. This is the standard SQL answer to 'I want columns from row values', and it needs no PIVOT keyword anywhere.",
      "The depth guard (gen < 20) is belt-and-braces here: with referred_id unique, an origin is never part of a cycle (every cycle member has a referrer), so trees under origins are acyclic forests. The guard costs nothing and makes the query safe if the uniqueness assumption ever breaks — the same defensive shape Boss Level I used on approval chains.",
    ],
    edges: [
      "User 9 sits at generation 4 under origin 1 — the deepest chain in the seed. It must land in gen3plus (2 + 1 = 3 includes both 7-and-8 at gen 3 AND 9 at gen 4). A solution with a gen3 column instead of gen3plus loses it.",
      "Users 2, 3, 4, 5 and 7 all REFER people but are themselves referred — they are not origins and their subtrees must NOT create separate output rows. The NOT IN origin test in the anchor is what prevents double attribution.",
      "User 10's row proves zeros ship: gen2 0 and gen3plus 0 are real columns, not NULLs — the conditional aggregates produce 0 for an origin whose walk is one row deep.",
      "User 12 (if it existed) — referred by nobody, referring nobody — can never appear: the anchor only fires for rows IN Referrals. No LEFT JOIN, no empty-origin rows.",
    ],
    ladder: [
      { title: "Brute force — one walk per origin", body: "For each origin, run a separate recursive walk and bucket the output. Correct but n invocations, and the bucketing repeats every time." },
      { title: "The pattern — one walk, many roots", body: "Anchor at all origins' edges simultaneously, carry origin_id down. The recursion is a forest walk in a single statement." },
      { title: "The optimal idea — pivot by conditional aggregation", body: "GROUP BY origin, SUM(CASE ...) per bucket. The durable rule: recursive CTEs produce long-format rows; pivots turn long into wide without touching the walk." },
    ],
    approach: "WITH RECURSIVE anchor (origin edges, gen 1, WHERE referrer not referred) + step (next edge, gen + 1, depth guard) → GROUP BY origin → SUM(CASE) buckets → sort by total",
    schema: {
      ddl: `CREATE TABLE Referrals (
  referrer_id INTEGER NOT NULL,
  referred_id INTEGER PRIMARY KEY
);`,
      seed: `INSERT INTO Referrals (referrer_id, referred_id) VALUES
  (1, 2),
  (1, 3),
  (2, 4),
  (3, 5),
  (3, 6),
  (4, 7),
  (5, 8),
  (7, 9),   -- gen 4 under origin 1
  (10, 11); -- a one-deep origin`,
      tables: [
        { name: "Referrals", note: "9 referral edges — two origins (1 and 10); origin 1's tree spans four generations" },
      ],
    },
    code: `WITH RECURSIVE tree(origin_id, user_id, gen) AS (
    SELECT r.referrer_id, r.referred_id, 1
    FROM Referrals r
    WHERE r.referrer_id NOT IN (SELECT referred_id FROM Referrals)
    UNION ALL
    SELECT t.origin_id, r.referred_id, t.gen + 1
    FROM tree t
    JOIN Referrals r ON r.referrer_id = t.user_id
    WHERE t.gen < 20
)
SELECT origin_id,
    SUM(CASE WHEN gen = 1 THEN 1 ELSE 0 END) AS gen1,
    SUM(CASE WHEN gen = 2 THEN 1 ELSE 0 END) AS gen2,
    SUM(CASE WHEN gen >= 3 THEN 1 ELSE 0 END) AS gen3plus
FROM tree
GROUP BY origin_id
ORDER BY COUNT(*) DESC, origin_id ASC;`,
    walkthrough: [
      "The anchor fires for referrers 1 and 10 only (2, 3, 4, 5, 7 are all referred), planting (1,2,g1), (1,3,g1) and (10,11,g1). Steps walk down: 2→4 and 3→5, 3→6 at gen 2; 4→7 and 5→8 at gen 3; 7→9 at gen 4 — nine tree rows total, each stamped with its origin.",
      "Origin 1's buckets: gen1 = {2,3} → 2; gen2 = {4,5,6} → 3; gen3plus = {7,8,9} → 3 (the gen-4 referral folds in). Origin 10: gen1 = 1, everything else 0. The totals are 8 and 1.",
      "Two rows ship in total order: (1, 2, 3, 3) then (10, 1, 0, 0) — origin 1's fourth-generation chain is the whole reason the open bucket exists.",
    ],
    time: "O(n) — every referral edge is walked once per tree containing it",
    space: "O(n) — one annotated row per referred user",
    followUps: [
      "Add a max_gen column reporting the deepest generation reached per origin — can MAX(gen) share the same GROUP BY, and what does origin 10's value look like?",
      "Attribute every user to the origin ABOVE them and report each origin's full downstream size alongside the buckets — why does COUNT(*) already answer the size half, and what would a second walk add?",
    ],
    related: ["bom-leaf-demand-explosion", "approval-chain-audit", "subtree-budget-rollup"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "effective-equity-ownership",
    statement:
      "Corporate ownership is stored in Owns (holder_id, held_id, pct): pct is the fraction of held_id that holder_id directly owns, stored as a decimal (0.60 = 60%). Effective ownership of X over Y is the sum, over EVERY directed ownership path from X to Y, of the product of the path's pcts — a 1-edge path is just the direct stake, and two paths to the same company both count. For every pair with effective ownership of at least 10%, report holder_id, held_id and effective_pct as a percentage rounded to 1 decimal. Exclude any self-pairs. Order by effective_pct DESC, then holder_id ASC, then held_id ASC.",
    examples: [
      {
        input: "A→B 0.60 directly, and A→C 0.30 with C→B 0.10",
        output: "A over B reports 63.0",
        explanation:
          "Two paths exist: the direct 60% stake and the indirect 30% × 10% = 3%. Effective ownership sums every path — 63%, not the larger single stake.",
      },
      {
        input: "a path whose product lands under 10%",
        output: "…the pair stays out of the report",
        explanation:
          "The threshold applies to the SUMMED percentage after all paths are added — an 8.7% pair is excluded even though an intermediate company on its paths clears the bar on its own.",
      },
    ],
    constraints: [
      "one output row per (holder_id, held_id) pair with effective_pct ≥ 10",
      "every directed path contributes the product of its pcts; paths add",
      "pct values are decimals (0.60 = 60%); output effective_pct as a percentage",
      "self-pairs (holder = held, possible only through cycles) are excluded",
      "order by effective_pct DESC, holder_id ASC, held_id ASC",
    ],
    breakdown: [
      "Every path is materialized by a recursive CTE: the anchor plants each direct ownership edge as a one-edge path carrying its pct as the running product; each step extends every path by any edge leaving its current endpoint, multiplying the product by the new pct. Carrying the ORIGINAL holder through (the anchor's holder_id never changes) turns the walk into a per-source path stream — one CTE serves all sources simultaneously.",
      "Two guards keep the recursion finite and honest: a depth cap (a safety net for ownership cycles, which are legal in real cap tables) and a product prune — once a path's product falls below 0.1%, extending it can never reach the 10% report threshold because every further multiplication shrinks it (all pcts are ≤ 1). The prune is a correctness-preserving optimization: it removes work, never output.",
      "The roll-up is SUM(product) per (holder, held) pair — paths add — then the percent conversion and rounding decorate the OUTPUT while the ≥ 10% gate fires on the raw sum. Filtering or rounding before the gate would misclassify pairs sitting near the boundary (the seed plants two pairs at exactly 10.0% to enforce that order).",
    ],
    edges: [
      "A over D totals THREE paths, not two: A→B→D (60% × 50% = 30%), A→C→D (30% × 40% = 12%) AND A→C→B→D (30% × 10% × 50% = 1.5%) — the sneaky bridge C→B opens a third route that naive two-level thinking misses. 43.5% is the answer; 42.0% is the planted wrong answer. The bridge is not even A-exclusive: C itself reaches D through it, so C over D reads 45.0% (40% direct + 5% through B) — solve the bridge once and it pays twice.",
      "Two pairs land at exactly 10.0%: B over E (50% × 20%) and C over B (its direct stake). Both must appear — the gate is ≥, and it must fire on the raw sum BEFORE the ROUND decorates the output. A solution rounding first gets float-lucky here and fails on any other boundary seed.",
      "A over E reaches only 8.7% (43.5% × 20%) — under the bar — even though every intermediate company on its paths clears 10% individually. The threshold is on the pair total, not on path members. C over E lands at 9.0% (45% × 20%) and misses by a point — the two near-misses make the excluded zone deliberate rather than accidental.",
      "The depth cap matters even though this seed has no cycle: swap one edge (D→B 50%) and A, B and D would chase each other forever without it. Defensive recursion is the habit this band keeps testing.",
    ],
    ladder: [
      { title: "Brute force — enumerate paths by hand", body: "Self-join Owns twice for 2-edge paths, three times for 3-edge paths, UNION everything, sum. Correct for bounded depth, unreadable at depth 6, and the depth limit is hard-coded in the join count." },
      { title: "The pattern — recursive path materialization", body: "Anchor at direct edges, step multiplies through. Product and origin ride in the CTE's columns; the guards ride in the step's WHERE." },
      { title: "The optimal idea — sum paths per pair, gate on raw sums", body: "SUM(product) GROUP BY pair, HAVING before rounding. The durable rule: path problems want the walk to carry accumulators, and thresholds belong on unrounded aggregates." },
    ],
    approach: "WITH RECURSIVE anchor (direct edges, product = pct) + step (extend, product × pct, depth + prune guards) → GROUP BY pair → SUM(product) → HAVING ≥ 0.10 → round and sort",
    schema: {
      ddl: `CREATE TABLE Owns (
  holder_id INTEGER NOT NULL,
  held_id   INTEGER NOT NULL,
  pct       REAL NOT NULL
);`,
      seed: `INSERT INTO Owns (holder_id, held_id, pct) VALUES
  (1, 2, 0.60),   -- A→B direct
  (1, 3, 0.30),   -- A→C direct
  (2, 4, 0.50),   -- B→D
  (3, 4, 0.40),   -- C→D
  (4, 5, 0.20),   -- D→E
  (3, 2, 0.10);   -- C→B: the bridge that opens A→C→B→D`,
      tables: [
        { name: "Owns", note: "6 direct stakes over 5 companies — A reaches D through three different paths (43.5% effective), C reaches D through two (45.0%); two pairs sit at exactly 10.0%" },
      ],
    },
    code: `WITH RECURSIVE paths(holder_id, held_id, product, depth) AS (
    SELECT holder_id, held_id, pct, 1
    FROM Owns
    UNION ALL
    SELECT p.holder_id, o.held_id, p.product * o.pct, p.depth + 1
    FROM paths p
    JOIN Owns o ON o.holder_id = p.held_id
    WHERE p.depth < 10
      AND p.product * o.pct >= 0.001
)
SELECT holder_id, held_id,
    ROUND(SUM(product) * 100, 1) AS effective_pct
FROM paths
WHERE holder_id <> held_id
GROUP BY holder_id, held_id
HAVING SUM(product) >= 0.10
ORDER BY effective_pct DESC, holder_id ASC, held_id ASC;`,
    walkthrough: [
      "The anchor plants six one-edge paths. Steps extend them: from A→B, B→D grows the product to 0.30; from A→C, C→D reaches 0.12 and C→B reaches 0.03; the bridge path then extends again through B→D to 0.015 — the third route to D — and C's own direct edge to D adds 0.40 to C's tally. From D→E, every path into D sprouts a continuation: 0.30 × 0.20 = 0.06, 0.12 × 0.20 = 0.024, 0.015 × 0.20 = 0.003; from B→E, 0.50 × 0.20 = 0.10 exactly.",
      "The per-pair sums: A over B 0.60 + 0.03 = 0.63; A over D 0.30 + 0.12 + 0.015 = 0.435; A over E 0.06 + 0.024 + 0.003 = 0.087; B over D 0.50; B over E 0.10; C over B 0.10; C over D 0.40 + 0.05 = 0.45; C over E 0.45 × 0.20 = 0.09; D over E 0.20. The HAVING gate keeps everything at or above 0.10 and drops A–E (8.7%) and C–E (9.0%).",
      "Eight rows ship: (1,2,63.0), (2,4,50.0), (3,4,45.0), (1,4,43.5), (1,3,30.0), (4,5,20.0), (2,5,10.0), (3,2,10.0) — the two 10.0% pairs tie and fall back to holder order, which is why the sort key has three columns.",
    ],
    time: "O(P · E) in the worst case — P materialized paths times edge scans; the prune keeps P near-linear on realistic cap tables",
    space: "O(P) — one row per materialized path",
    followUps: [
      "Report the NUMBER of distinct paths behind each pair alongside the percentage — does COUNT(*) need anything from the walk it does not already have?",
      "Flag controlling stakes (effective ≥ 50%) and report, for each holder, the count of controlled companies — which aggregate changes shape and which stays untouched?",
    ],
    related: ["subtree-budget-rollup", "bom-leaf-demand-explosion", "trial-balance-check"],
    order: "exact",
    xp: 35,
  },
];
