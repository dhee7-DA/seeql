// Deep-dives — Graphs, part 1 (NeetCode 150 core section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const GRAPHS: LcDeepDive[] = [
  {
    slug: "number-of-islands",
    statement:
      "You are given a binary grid where '1' marks land and '0' marks water. An island is a maximal patch of land cells connected edge-to-edge — up, down, left or right; diagonals never connect. Count the distinct islands.",
    examples: [
      { input: 'grid = ["11110","11010","11000","00000"]', output: "1", explanation: "One continuous landmass snakes through the top-left; everything else is water." },
      { input: 'grid = ["11000","11000","00100","00011"]', output: "3", explanation: "The big top-left patch, the lone middle cell and the bottom-right pair — three islands." },
      { input: 'grid = ["10101","01010","10101"]', output: "8", explanation: "Every land cell touches only diagonals, so each stands alone." },
    ],
    constraints: [
      "1 <= m, n <= 300 (this harness also accepts an empty grid and returns 0)",
      "grid[r][c] is '0' or '1'",
      "the grid is rectangular — every row has the same length",
    ],
    breakdown: [
      "This is connected-components counting wearing a grid costume: every land cell is a node, and orthogonal adjacency draws the edges. Any graph traversal discovers one entire component from a single starting cell, which is exactly what the counting loop exploits — scan the grid, and every time you meet a land cell that no previous flood-fill claimed, you have found a NEW island: bump the count, then traverse to claim every cell reachable from it.",
      "On LeetCode the grid is a mutable char matrix and the classic move is to 'sink' the island — overwrite each visited land cell with '0' so it can never be counted twice. Here the rows arrive as immutable strings, so the flood-fill marks cells in a visited set instead: the traversal logic is unchanged, only the ledger differs. BFS with a queue and DFS with a stack are interchangeable here; nothing about the problem prefers either.",
      "The practical trap is Python's recursion limit. An all-land 300×300 grid is one component of 90,000 cells, and recursive DFS would try to nest 90,000 calls deep — well past the default cap of 1,000. An explicit stack (or queue) makes the same traversal crash-proof, which is why the optimal code below iterates.",
    ],
    edges: [
      "Diagonal land does NOT connect: a single row ['1','0','1'] is two islands, and the checkerboard example above is eight — 'rook moves only' is the whole connectivity contract.",
      "All water returns 0 — the scan must seed nothing and the counter must start at 0, not 1.",
      "A single '1' cell is one island of one; make sure the flood-fill handles a seed with no land neighbours.",
      "Recursive DFS overflows Python's stack on large serpentine islands — iterate with an explicit stack.",
    ],
    ladder: [
      { title: "Brute force — recount from every cell", body: "For each land cell, flood its whole island with no shared ledger. The same island is discovered once per member, so the work is O((m·n)²) on dense grids — correct in theory, quadratic in practice." },
      { title: "Sink in place", body: "Flood from each unvisited land cell and write '0' over everything reachable. One ledger (the grid itself), each cell visited a constant number of times — the classic LeetCode idiom, at the cost of destroying the input." },
      { title: "The optimal idea — visited set + iterative flood", body: "Keep the input intact: a set of (row, col) marks claimed land, and an explicit stack drives the flood. Each cell is pushed at most once, so the whole scan is O(m·n) time and space — and it works on immutable rows like the string grid this harness passes." },
    ],
    approach: "Seed-and-flood DFS with a visited ledger",
    code: `def numIslands(grid):
    # Adaptation note: on LeetCode the grid is a mutable char matrix you sink
    # in place (overwrite visited land with '0'); here rows arrive as
    # immutable strings, so the flood-fill marks cells in a visited set
    # instead — the traversal itself is identical.
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    visited = set()                     # land cells already claimed

    def flood(sr, sc):
        stack = [(sr, sc)]              # iterative DFS — recursion-safe
        visited.add((sr, sc))
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if (0 <= nr < rows and 0 <= nc < cols
                        and grid[nr][nc] == "1" and (nr, nc) not in visited):
                    visited.add((nr, nc))
                    stack.append((nr, nc))

    islands = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in visited:
                islands += 1            # unclaimed land = a NEW island
                flood(r, c)             # claim everything it reaches
    return islands`,
    walkthrough: [
      "Trace [\"11000\",\"11000\",\"00100\",\"00011\"]: the scan finds (0,0) unclaimed → island 1, and the flood claims (0,1), (1,0), (1,1). The scan continues untouched through water, then (2,2) → island 2 (a flood that immediately exhausts), then (3,3) → island 3, claiming (3,4). Total 3, and no land cell was ever a seed twice.",
      "The invariant: after flood(sr, sc) returns, every land cell connected to the seed is in the visited set. That is what makes the counting loop honest — an unclaimed '1' at scan time can only belong to an island no previous flood touched, so 'unclaimed' is exactly 'new'. Marking at push time (not pop) keeps a cell out of the stack twice; mark-at-pop lets the same cell pile up many times on comb-shaped islands.",
      "Each cell does O(1) work per adjacency check and enters the stack at most once, so the whole algorithm is O(m·n) time. Space is the visited set plus the stack — O(m·n) worst case on an all-land grid. Swap the stack for a deque and you have the BFS variant; the count, the invariant and the complexity are unchanged.",
    ],
    time: "O(m·n) — every cell is examined once and claimed at most once",
    space: "O(m·n) — the visited set plus the stack, worst case all land",
    followUps: [
      "Sink-in-place variant: with a real char matrix, overwrite '1' with '0' and delete the set — O(1) extra space, input destroyed.",
      "The same seed-and-flood chassis computes island perimeters, per-island areas or even labels — only the bookkeeping inside flood() changes (max-area-of-island is exactly that swap).",
    ],
    related: ["max-area-of-island", "surrounded-regions", "pacific-atlantic-water-flow"],
    verify: {
      fn: "numIslands",
      wrap: "plain",
      cases: [
        { args: [["11110", "11010", "11000", "00000"]], expect: 1 },
        { args: [["11000", "11000", "00100", "00011"]], expect: 3 },
        { args: [["10101", "01010", "10101"]], expect: 8 },
        { args: [["000", "000"]], expect: 0 },
        { args: [["1"]], expect: 1 },
        { args: [[]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "clone-graph",
    statement:
      "You are handed a node of an undirected graph; every node carries a value and a list of neighbours, and values are unique. Return a DEEP COPY of the whole graph — same nodes, same values, same adjacency — sharing no node object with the original. (This harness speaks LeetCode's JSON adjacency-list format: values are 1..n and adjList[i] lists the neighbours of node i+1.)",
    examples: [
      { input: "adjList = [[2,4],[1,3],[2,4],[1,3]]", output: "[[2,4],[1,3],[2,4],[1,3]]", explanation: "A diamond: 1 touches 2 and 4; 3 touches 2 and 4. The clone reconnects its OWN copies — one shared clone per original node." },
      { input: "adjList = [[]]", output: "[[]]", explanation: "A single node with no neighbours — the clone is a fresh, equally lonely node." },
      { input: "adjList = [[2],[1]]", output: "[[2],[1]]", explanation: "A two-node cycle: cloning per node without a map would produce two disconnected pairs instead of one cycle." },
    ],
    constraints: [
      "1 <= n <= 100",
      "values are unique (1..n); no self-loops, no repeated edges",
      "LeetCode guarantees the graph is connected — the code below stays correct for disconnected inputs too",
    ],
    breakdown: [
      "The failure mode this problem exists to catch is the shallow copy. If node 1 and node 3 both reference node 2, a per-node copy pass mints two different 'node 2's and the clone's shape silently balloons. The cure is a hash map from ORIGINAL node to its clone, consulted before any copying happens: if the original already has a clone, reuse it; only an unseen original may mint a new one.",
      "Register-before-recurse is the line that makes cycles survivable. Create the clone, install it in the map immediately, and only then walk the neighbour list — so when DFS comes back around to a node already on the current path, the map hands back the half-built clone and the recursion stops instead of spiralling. The map is simultaneously the memo AND the visited set; one structure, two jobs.",
      "On LeetCode you receive and return Node objects with val and neighbours; this harness speaks the JSON adjacency-list format instead, so the code deserialises into node dicts, runs the classic old→new DFS unchanged, and serialises the clone back out. The traversal — the part interviews actually grade — is exactly what you would write against real objects, and BFS with a queue is a drop-in alternative with the same map.",
    ],
    edges: [
      "Cycles are the norm, not the exception: without register-before-recurse, 1↔2 loops until the stack dies.",
      "A shared neighbour must clone exactly once — the map hit, not a fresh mint, is what preserves the shape.",
      "The single node with an empty neighbour list still needs a map entry, or the serialisation drops the node entirely.",
      "LeetCode only guarantees connected inputs; iterating values 1..n at the end keeps the function total (and honest) even for a forest.",
    ],
    ladder: [
      { title: "Brute force — copy node by node", body: "Walk the node list, clone each node and copy its neighbour list. Two references to the same original become two DIFFERENT clones — the shape is wrong, and on a large graph the node count balloons. The bug is silent: every value looks right." },
      { title: "Two-phase BFS clone", body: "Phase 1: BFS the originals, creating a clone per node in an old→new map. Phase 2: walk the originals again, wiring each clone's neighbour list from the map. Correct and iterative; just twice the passes and two loops to keep in sync." },
      { title: "The optimal idea — one DFS, map as memo and visited", body: "DFS with the old→new map: on arrival, return the existing clone or mint-and-register one; then fill its neighbours with recursive results. Each node and edge is processed once — O(V+E) time, O(V) map — and the register-first rule defuses cycles for free." },
    ],
    approach: "DFS with an old→new hash map (register before recursing)",
    code: `def cloneGraph(adjList):
    # Adaptation note: on LeetCode you receive/return Node objects with
    # val + neighbours. The harness speaks LeetCode's JSON adjacency-list
    # format instead — adjList[i] lists the neighbours of node i+1 — so this
    # function deserialises into node dicts, runs the CLASSIC old→new
    # hash-map DFS over them, and serialises the clone back out. The
    # traversal is exactly what you would write against real Node objects.
    n = len(adjList)
    if n == 0:
        return []
    nodes = {v: {"val": v, "neighs": []} for v in range(1, n + 1)}
    for i, nbrs in enumerate(adjList):        # wire up the ORIGINAL graph
        nodes[i + 1]["neighs"] = [nodes[v] for v in nbrs]

    clones = {}                               # original val → cloned dict

    def dfs(node):
        if node["val"] in clones:             # already cloned → reuse it
            return clones[node["val"]]
        copy = {"val": node["val"], "neighs": []}
        clones[node["val"]] = copy            # register BEFORE recursing
        copy["neighs"] = [dfs(nb) for nb in node["neighs"]]
        return copy

    for v in range(1, n + 1):                 # covers every component
        dfs(nodes[v])
    return [[c["val"] for c in clones[v]["neighs"]] for v in range(1, n + 1)]`,
    walkthrough: [
      "Trace [[2],[1]] — the two-node cycle. dfs(node 1) mints copy 1 and registers it, then recurses into node 2, which mints copy 2 and recurses into node 1's ORIGINAL — a map hit — returning the half-built copy 1. copy 2's neighbour list becomes [copy 1], the recursion unwinds, and copy 1's list becomes [copy 2]. The half-finished clone was precisely what the cycle needed; that is register-before-recurse earning its keep.",
      "Now the diamond [[2,4],[1,3],[2,4],[1,3]]: nodes 2 and 4 are neighbours of both 1 and 3. When dfs reaches node 3's neighbour list, node 2 is already cloned, so the map returns the SAME copy 2 that node 1's list holds — one clone, referenced twice, shape preserved. Delete the map lookup and you mint a second copy 2: five nodes where four belong, a bug the serialiser exposes as a size change.",
      "Serialisation walks values 1..n and prints each clone's neighbour VALUES in stored order, so the output mirrors the input format exactly — a byte-stable answer even though LeetCode itself only checks graph isomorphism. Every node is cloned once and every edge walked twice (once from each end): O(V+E) time, O(V) for the map plus the recursion stack. An explicit stack or a queue removes the recursion-depth caveat without touching the logic.",
    ],
    time: "O(V + E) — each node cloned once, each edge walked from both ends",
    space: "O(V) — the old→new map plus the DFS stack",
    followUps: [
      "A linked list with a random pointer (copy-list-with-random-pointer) is the same problem with two edge types: one old→new map, two rewiring passes.",
      "Generalise to arbitrary object graphs: this IS memoised deep copy — the pattern behind copy.deepcopy and any serialiser that must preserve shared references.",
    ],
    related: ["copy-list-with-random-pointer", "course-schedule", "minimum-height-trees"],
    verify: {
      fn: "cloneGraph",
      wrap: "plain",
      cases: [
        { args: [[[2, 4], [1, 3], [2, 4], [1, 3]]], expect: [[2, 4], [1, 3], [2, 4], [1, 3]] },
        { args: [[[]]], expect: [[]] },
        { args: [[[2], [1]]], expect: [[2], [1]] },
        { args: [[[2, 3], [1, 3], [1, 2]]], expect: [[2, 3], [1, 3], [1, 2]] },
        { args: [[[2, 5], [1, 3], [2, 4], [3, 5], [1, 4]]], expect: [[2, 5], [1, 3], [2, 4], [3, 5], [1, 4]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "max-area-of-island",
    statement:
      "On the same binary grid as number-of-islands — '1' land, '0' water, edge-to-edge connectivity only — an island's AREA is its cell count. Return the largest island area; a grid with no land has largest area 0.",
    examples: [
      { input: 'grid = ["11000","11100","00011","00011"]', output: "5", explanation: "The upper-left island spans five cells; the lower-right one only four." },
      { input: 'grid = ["11111"]', output: "5", explanation: "One row, all land — every cell joins the same island." },
      { input: 'grid = ["0"]', output: "0", explanation: "No land, no island — the answer is 0, not an error." },
    ],
    constraints: [
      "1 <= m, n <= 300 (this harness also accepts an empty grid and returns 0)",
      "grid[r][c] is '0' or '1'",
      "the grid is rectangular",
    ],
    breakdown: [
      "Structure-wise this is number-of-islands with one extra register: the identical seed-and-flood scan, except each flood-fill RETURNS the size of the component it claimed, and the scan folds that into a running maximum. Any problem phrased 'for every component, compute X' is this shape — flood-fill is the chassis and X is a plugin.",
      "The counting discipline is mark-then-count, never count-then-mark. A cell contributes exactly 1 at the moment the flood claims it: claim means 'insert into visited' and 'increment total' happening together, in the same branch, guarded by the same test. Split those two events and either cells get counted twice or islands get undercounted — the classic off-by-one breeding ground.",
      "Union-find is the tempting alternative and the wrong one here: it counts components effortlessly but per-component sizes need an extra size map threaded through every union. DFS/BFS needs no auxiliary structure beyond the visited ledger, and it reports the area as a plain return value — strictly simpler for this question.",
    ],
    edges: [
      "All water → 0: the maximum starts at 0 and no seed ever fires.",
      "A lone '1' is an island of area 1 — the flood must handle a seed whose neighbours are all water or walls.",
      "Islands hugging the borders count fully: the edge of the grid is a wall, not an exclusion zone.",
      "The recursion-depth trap again: a snake-shaped island of 90,000 cells kills recursive DFS in Python — iterate.",
    ],
    ladder: [
      { title: "Brute force — measure each island repeatedly", body: "For every land cell, flood and count its component with no shared ledger. Each island of size k is measured k times → O((m·n)²) on dense grids. The fix is the same as islands: one shared visited set." },
      { title: "Global maximum over floods", body: "Keep the visited set from number-of-islands, and for each seed run a flood that counts claimed cells, updating a running max. Already optimal; the count and the ledger just live in two places." },
      { title: "The optimal idea — flood returns its area", body: "Make area(sr, sc) a function: iterative stack, mark-and-count on push, return the total; the scan takes max() over seeds. One pass, O(m·n) time and space, and the per-component computation is a clean return value instead of shared mutable state." },
    ],
    approach: "Seed-and-flood DFS where the flood returns its area",
    code: `def maxAreaOfIsland(grid):
    # Same string-row adaptation as number-of-islands: on LeetCode you sink
    # the mutable char matrix in place; rows arrive here as immutable
    # strings, so a visited set plays the role of the sunk cells.
    rows = len(grid)
    cols = len(grid[0]) if rows else 0
    visited = set()

    def area(sr, sc):
        stack, total = [(sr, sc)], 0
        visited.add((sr, sc))
        while stack:
            r, c = stack.pop()
            total += 1                 # count exactly once, at claim time
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if (0 <= nr < rows and 0 <= nc < cols
                        and grid[nr][nc] == "1" and (nr, nc) not in visited):
                    visited.add((nr, nc))
                    stack.append((nr, nc))
        return total

    best = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == "1" and (r, c) not in visited:
                best = max(best, area(r, c))
    return best`,
    walkthrough: [
      "Trace [\"11000\",\"11100\",\"00011\",\"00011\"]: the seed at (0,0) floods (0,1), (1,0), (1,1), (1,2) — five claims, best = 5. The scan resumes; the next unclaimed land is (2,3), whose flood claims (2,4), (3,3), (3,4) — four claims, best stays 5. The scan itself never measures anything; all measurement lives inside the flood and the max folds in at seed time.",
      "The invariant: area(sr, sc) returns the exact size of the component containing the seed, because every claim simultaneously increments total and inserts into visited — two ledgers advancing in lockstep. No cell can be counted twice (the visited test fires first) and none can be missed (every land neighbour is tested). Marking on push rather than pop keeps each cell in the stack at most once.",
      "Every cell is a seed candidate once and a flood member once, so the total work is O(m·n) time. Space is the visited set plus the stack, O(m·n) worst case. For the in-place LeetCode variant, sinking '1' → '0' removes the set entirely and the stack becomes the only extra memory.",
    ],
    time: "O(m·n) — each cell is seeded once and claimed at most once",
    space: "O(m·n) — the visited set plus the stack, worst case all land",
    followUps: [
      "Island perimeter: during the flood, each claimed cell inspects its 4 neighbours — water or out-of-bounds adds 1 to the perimeter, land adds 0. Same chassis, different accounting.",
      "Land appears cell by cell over time: union-find with component sizes answers 'largest island now' incrementally, one union per newly-wet cell.",
    ],
    related: ["number-of-islands", "island-perimeter", "surrounded-regions"],
    verify: {
      fn: "maxAreaOfIsland",
      wrap: "plain",
      cases: [
        { args: [["11000", "11100", "00011", "00011"]], expect: 5 },
        { args: [["11111"]], expect: 5 },
        { args: [["0"]], expect: 0 },
        { args: [["1"]], expect: 1 },
        { args: [["101", "010", "101"]], expect: 1 },
        { args: [[]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "pacific-atlantic-water-flow",
    statement:
      "An m×n heightmap borders two oceans: the top row and left column touch the Pacific, the bottom row and right column touch the Atlantic. Water at a cell can flow to any of its 4 orthogonal neighbours whose height is LESS THAN OR EQUAL — and off any ocean border. Return every cell from which water can reach BOTH oceans, as [row, col] pairs in any order.",
    examples: [
      { input: "heights = [[1,2,2,3,5],[3,2,3,4,4],[2,4,5,3,1],[6,7,1,4,2],[5,1,1,2,4]]", output: "[[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]", explanation: "E.g. (3,1) drains downhill to (2,1) → (2,0) into the Pacific AND down to (4,1) into the Atlantic; corners (0,4) and (4,0) touch both oceans outright. Any order is accepted; the grader sorts." },
      { input: "heights = [[1]]", output: "[[0,0]]", explanation: "The lone cell is simultaneously a Pacific border (top/left) and an Atlantic border (bottom/right)." },
      { input: "heights = [[1,2,3]]", output: "[[0,0],[0,1],[0,2]]", explanation: "One row: every cell sits on the Pacific border (top) AND the Atlantic border (bottom) outright." },
    ],
    constraints: [
      "1 <= m, n <= 200 (this harness also accepts an empty grid and returns [])",
      "0 <= heights[r][c] <= 10^5",
      "output order is free — grading sorts the flattened pairs",
    ],
    breakdown: [
      "Ask the question forwards — 'where can THIS cell's water go?' — and you launch up to m·n searches over the whole grid: O((m·n)²), hopeless at 200×200. Invert it: start from the oceans and walk BACKWARD. Flood from every Pacific-border cell, moving to neighbours with height ≥ the current cell (water could have flowed downhill the other way), and mark everything reachable as Pacific-draining. Repeat from the Atlantic borders. The answer is the intersection of the two marks.",
      "The inversion is what makes it linear: each ocean's reach is ONE flood over the whole grid regardless of how many cells drain there, so two floods replace millions of searches. The inequality flip is the crux — forward water flows to heights ≤ current, so the backward climb demands neighbour ≥ current. Get it backwards and the floods quietly compute which cells the water cannot leave.",
      "Seeding is multi-source by construction: all border cells of an ocean go into the initial stack at once — the same trick walls-and-gates plays with gates and rotting-oranges with rotten fruit. The final intersection is a single set-AND sweep. Output order is genuinely free — LeetCode accepts any — so the harness sorts the flattened pairs before grading.",
    ],
    edges: [
      "Corners touch two borders at once — (0,4) is top (Pacific) and right (Atlantic) — so corners ALWAYS qualify.",
      "Flat plateaus live or die by non-strict inequality: the climb must use ≥, or a level lake can never drain and answers go missing.",
      "One-row and one-column grids: every cell sits on both a Pacific and an Atlantic border, so all m·n cells qualify.",
      "Two independent visited sets are mandatory — intersecting one shared set with itself is the classic shortcut bug.",
    ],
    ladder: [
      { title: "Brute force — search from every cell", body: "From each cell, run two reachability searches (Pacific? Atlantic?). Correct, but each of the m·n cells floods the whole grid twice: O((m·n)²) — 1.6 billion steps at 200×200." },
      { title: "Reverse the arrows — flood from the oceans", body: "Seed all Pacific borders, climb with ≥, mark set P; same for Atlantic into A; answer = P ∩ A. Two O(m·n) floods replace the quadratic sweep — the whole speedup is one change of perspective." },
      { title: "The optimal idea — iterative multi-source floods", body: "Explicit stacks (no recursion-limit surprises on serpentine plateaus), two mark sets, one intersection sweep. O(m·n) time, O(m·n) space — and the output order, unlike the logic, is irrelevant because grading sorts." },
    ],
    approach: "Reverse-reachability: two multi-source floods, intersect",
    code: `def pacificAtlantic(heights):
    rows = len(heights)
    cols = len(heights[0]) if rows else 0
    if rows == 0 or cols == 0:
        return []

    def flood(seeds):
        seen = set(seeds)           # cells that can drain to this ocean
        stack = list(seeds)
        while stack:
            r, c = stack.pop()
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                # climb rule: water could have flowed FROM the neighbour
                # TO (r, c) iff the neighbour is at least as high
                if (0 <= nr < rows and 0 <= nc < cols
                        and (nr, nc) not in seen
                        and heights[nr][nc] >= heights[r][c]):
                    seen.add((nr, nc))
                    stack.append((nr, nc))
        return seen

    pacific = [(0, c) for c in range(cols)] + [(r, 0) for r in range(rows)]
    atlantic = [(rows - 1, c) for c in range(cols)] + [(r, cols - 1) for r in range(rows)]
    both = flood(pacific) & flood(atlantic)
    return [[r, c] for r, c in both]`,
    walkthrough: [
      "On the 5×5: the Pacific flood claims the whole top row and left column, then climbs inward — (1,3) via (0,3), (2,1) and (2,2) via the second column's lowlands, (1,1)–(1,2) through the left column — sixteen cells in all. The Atlantic flood claims the bottom row, the right column, then climbs: (3,0) via (4,0), (2,2) via (3,2), (1,3)–(1,4) via the right column's ladder. The intersection is the seven cells listed.",
      "Watch the inequality do its job: the Atlantic flood reaches (3,2) (height 1) and climbs to (2,2) (height 5 ≥ 1) — meaning water at (2,2) can pour down into (3,2) and out to sea. Every mark has such a justification chain, and the ≥ (not >) is what lets equal-height plateaus chain together. Flip the comparison and the floods mark cells the water cannot actually leave.",
      "Both floods touch each cell at most once — the seen-set check fires before any push — so each is O(m·n), and the intersection sweep is another O(m·n). Space is two reachability sets plus one stack. The result list is built from a set, so its order is arbitrary by construction; the sortFlat normalisation applied to both sides of the harness makes that invisible to grading.",
    ],
    time: "O(m·n) — two multi-source floods plus one intersection sweep",
    space: "O(m·n) — the two reachability sets plus the stack",
    followUps: [
      "k oceans or k border classes: k floods, k-wise intersection — and 'reaches at least j of the k' falls out of the same marks.",
      "Heights that change over time turn this into a dynamic reachability problem — the static two-flood baseline is what any incremental scheme must beat.",
    ],
    related: ["number-of-islands", "walls-and-gates", "max-area-of-island"],
    verify: {
      fn: "pacificAtlantic",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 2], [5, 1, 1, 2, 4]]], expect: [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]] },
        { args: [[[1]]], expect: [[0, 0]] },
        { args: [[[1, 2, 3]]], expect: [[0, 0], [0, 1], [0, 2]] },
        { args: [[[2, 2], [2, 2]]], expect: [[0, 0], [0, 1], [1, 0], [1, 1]] },
        { args: [[[]]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "surrounded-regions",
    statement:
      "You are given a board of 'X' and 'O'. Capture every region of 'O's that is completely SURROUNDED — flip all its cells to 'X'. A region is safe only if some 'O' in it sits on the board's border (or can walk edge-to-edge to one): border-touching regions survive untouched. Flip in place; the mutated board itself is the answer.",
    examples: [
      { input: 'board = [["X","X","X","X"],["X","O","O","X"],["X","X","O","X"],["X","O","X","X"]]', output: '[["X","X","X","X"],["X","X","X","X"],["X","X","X","X"],["X","O","X","X"]]', explanation: "The interior pocket dies. The (3,1) 'O' sits ON the bottom border, so it survives." },
      { input: 'board = [["O","O"],["O","O"]]', output: '[["O","O"],["O","O"]]', explanation: "Every 'O' is on the border — nothing is surrounded." },
      { input: 'board = [["X"]]', output: '[["X"]]', explanation: "A one-cell board with no 'O' at all — nothing to do." },
    ],
    constraints: [
      "1 <= m, n <= 200",
      "board[r][c] is 'X' or 'O'",
      "the board must be modified in place — the harness reads back your mutated matrix",
    ],
    breakdown: [
      "Test each region directly — flood it, look for a border member, flip if none — and you pay repeated region scans and fiddly bookkeeping. Invert, one more time: the 'O's connected to the border are exactly the survivors. So flood FROM the border: seed every border 'O', mark the regions they reach as safe, and everything still unmarked when the floods end is enclosed.",
      "The marking medium is the trick. On LeetCode the classic idiom writes a temporary 'T' over safe cells — the sentinel is simultaneously the visited ledger and the survivor flag — then one final sweep flips 'O' → 'X' (doomed) and 'T' → 'O' (restored). No visited set, no second matrix; the board carries its own state through the two phases. (The harness passes rows as lists of single-char strings so those writes are visible to grading.)",
      "Phase order is not negotiable: ALL border floods must finish before ANY flip. The floods navigate on 'O' cells; flipping early would overwrite the very cells the next flood needs to traverse, and safe regions adjacent to doomed ones would be corrupted mid-discovery. Two clean phases — mark everything, then flip everything — is the invariant that keeps the sweep honest.",
    ],
    edges: [
      "Border 'O's always survive — they ARE the escape hatch; a board that is one row of all 'O' comes back unchanged.",
      "1×1 [['O']] → [['O']]: the only cell is the border.",
      "A ring of 'O's around an interior 'O' saves the ring and kills the centre — connectivity, not proximity, decides.",
      "The neighbour test must match exactly 'O' (not 'X', not 'T') or floods either revisit themselves infinitely or stop one cell short.",
    ],
    ladder: [
      { title: "Brute force — test each region", body: "For every 'O' region, BFS it, check whether any member touches the border, and flip the whole region if not. Correct, but regions are re-discovered and re-scanned; the border test couples traversal and decision awkwardly." },
      { title: "Border flood with a visited set", body: "Flood from every border 'O' into a visited set, then sweep: unvisited 'O' → 'X', visited stays. O(m·n), but the set is O(m·n) extra memory the board didn't need." },
      { title: "The optimal idea — in-place sentinel", body: "Write 'T' over border-connected regions during the flood (the board IS the ledger), then one sweep does both flips: 'O' → 'X' and 'T' → 'O'. O(m·n) time, O(1) extra memory beyond the flood stack." },
    ],
    approach: "Border-anchored DFS with a 'T' sentinel, then flip",
    code: `def solve(board):
    # inPlace: the caller's board is mutated; nothing is returned.
    rows, cols = len(board), len(board[0])

    def mark(r, c):
        # flood the border-connected 'O' region, tagging it 'T' (safe)
        stack = [(r, c)]
        board[r][c] = "T"
        while stack:
            cr, cc = stack.pop()
            for nr, nc in ((cr+1, cc), (cr-1, cc), (cr, cc+1), (cr, cc-1)):
                if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] == "O":
                    board[nr][nc] = "T"
                    stack.append((nr, nc))

    for r in range(rows):             # seed every border 'O'
        for c in (0, cols - 1):
            if board[r][c] == "O":
                mark(r, c)
    for c in range(cols):
        for r in (0, rows - 1):
            if board[r][c] == "O":
                mark(r, c)

    for r in range(rows):             # the flip sweep
        for c in range(cols):
            if board[r][c] == "O":
                board[r][c] = "X"     # never reached the border → drowned
            elif board[r][c] == "T":
                board[r][c] = "O"     # safe — restore`,
    walkthrough: [
      "Trace the 4×4: the only border 'O' is (3,1), so one flood tags just that cell 'T'; the interior pocket at (1,1), (1,2), (2,2) never touches a border, so no flood reaches it. The sweep then flips all three interior 'O's to 'X' and restores (3,1) to 'O' — exactly the expected board, produced by two linear phases.",
      "The sentinel does three jobs at once: visited marker (a 'T' cell never re-enters the stack), survivor flag (the sweep restores it), and state carrier (no auxiliary structure beyond the stack). Because flooding only walks on 'O', tagged cells are naturally firewalled from re-traversal — and because the flip sweep runs strictly after all floods, no cell is judged while its region is still half-discovered.",
      "Each cell is adjacency-checked O(1) times by the floods and visited once by the sweep: O(m·n) total. Extra memory is the explicit stack — worst case O(m·n) on a serpentine border region (recursive DFS would flirt with Python's recursion limit on the same shapes as number-of-islands). The two-phase mark-then-flip structure is what makes the in-place contract safe to honour.",
    ],
    time: "O(m·n) — one flood pass plus one flip sweep",
    space: "O(m·n) worst case for the stack; the marking itself lives in the board",
    followUps: [
      "Swap the seed set: 'survivors = cells connected to this one special cell' or 'to any cell with value ≥ k' — the border-anchored pattern is a template, not a special case.",
      "Giant boards (image-segmentation scale): scanline union-find processes the same problem without deep stacks, in streaming order.",
    ],
    related: ["number-of-islands", "pacific-atlantic-water-flow", "max-area-of-island"],
    verify: {
      fn: "solve",
      wrap: "inPlace",
      cases: [
        { args: [[["X", "X", "X", "X"], ["X", "O", "O", "X"], ["X", "X", "O", "X"], ["X", "O", "X", "X"]]], expect: [["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "X", "X", "X"], ["X", "O", "X", "X"]] },
        { args: [[["O", "O"], ["O", "O"]]], expect: [["O", "O"], ["O", "O"]] },
        { args: [[["X"]]], expect: [["X"]] },
        { args: [[["O"]]], expect: [["O"]] },
        { args: [[["X", "X", "X"], ["X", "O", "X"], ["X", "X", "X"]]], expect: [["X", "X", "X"], ["X", "X", "X"], ["X", "X", "X"]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "rotting-oranges",
    statement:
      "Every cell of a grid holds 0 (empty), 1 (fresh orange) or 2 (rotten orange). Every minute, rot spreads simultaneously from each rotten orange to its 4 orthogonal neighbours. Return how many minutes elapse until no fresh orange remains — or -1 if some fresh orange can never be reached. A grid with no fresh oranges is already finished: 0 minutes.",
    examples: [
      { input: "grid = [[2,1,1],[1,1,0],[0,1,1]]", output: "4", explanation: "Rot sweeps the top-left block by minute 2, the centre by minute 3, and the bottom-right corner at minute 4." },
      { input: "grid = [[2,1,1],[0,1,1],[1,0,1]]", output: "-1", explanation: "The (2,0) orange is walled in by empties — it rots never." },
      { input: "grid = [[0,2]]", output: "0", explanation: "Nothing fresh exists, so zero minutes pass by definition." },
    ],
    constraints: [
      "1 <= m, n <= 100",
      "grid[r][c] is 0, 1 or 2",
      "at least one cell; the grid is rectangular",
    ],
    breakdown: [
      "Simultaneous spread is the physical signature of breadth-first search: rot advances as a wavefront, all frontier oranges at once, and each wave is one minute. The modelling choice that makes it correct is MULTI-source seeding — every rotten orange enters the queue at minute 0, because minute 1's rot comes from all of them simultaneously. Seed one orange at a time and you serialise waves that should overlap, overcounting minutes.",
      "Bookkeeping has three ledgers that must agree: the queue (oranges that rotted last minute), the grid (a cell becomes 2 the moment it rots — the write doubles as the visited marker, so no cell ever rots twice), and the fresh counter (decremented on each new rot). The loop ends when the queue empties; if fresh is still positive, unreachable oranges remain and the answer is -1.",
      "DFS is the wrong instrument — not because it can't reach everything, but because it imposes an order on a process that has none: depth-first rot would let one orange's chain finish before a neighbour's wave starts, corrupting the minute count. Whenever a problem says 'spreads simultaneously per unit time', read 'BFS in layers' — and 'nearest of many sources' problems are the same shape with a different question.",
    ],
    edges: [
      "No fresh oranges at all (pure 0s and 2s) → 0 — even with zero rotten oranges, nothing needs to happen.",
      "Fresh oranges but no rotten ones → -1 immediately; the queue starts empty and the fresh counter never zeroes.",
      "A rotten orange sealed inside empties contributes nothing — its wave dies at the walls while other waves carry on.",
      "A fresh orange already adjacent to rot still takes one full minute — minute counting starts at 1 for the first wave, not 0.",
    ],
    ladder: [
      { title: "Brute force — minute-by-minute rescans", body: "Each minute, scan the whole grid and rot every fresh cell adjacent to a rotten one; repeat until a scan changes nothing. Correct, O(m·n) per minute with up to O(m+n) minutes — quadratic-ish and clunky, but the right mental model to start from." },
      { title: "One BFS per rotten orange", body: "BFS from each rotten orange separately, recording when it first reaches each cell, then take per-cell minimums. The waves are right but computed serially with extra arrays — the multi-source seeding deletes all of that." },
      { title: "The optimal idea — multi-source BFS in waves", body: "Seed ALL rotten oranges at minute 0; each BFS layer is one minute; grid cells record rot (the visited marker); a fresh counter drives both the early exit and the -1 verdict. One pass: O(m·n) time and space." },
    ],
    approach: "Multi-source BFS, one layer per minute",
    code: `def orangesRotting(grid):
    rows, cols = len(grid), len(grid[0])
    queue = []                      # positions of rotten oranges, minute 0
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if grid[r][c] == 2:
                queue.append((r, c))
            elif grid[r][c] == 1:
                fresh += 1

    minutes = 0
    while queue and fresh:          # stop when nothing fresh or nothing rotten
        minutes += 1                # one BFS layer = one minute
        next_wave = []
        for r, c in queue:
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < rows and 0 <= nc < cols and grid[nr][nc] == 1:
                    grid[nr][nc] = 2        # rot now = "visited" marker
                    fresh -= 1
                    next_wave.append((nr, nc))
        queue = next_wave
    return minutes if fresh == 0 else -1`,
    walkthrough: [
      "Trace [[2,1,1],[1,1,0],[0,1,1]]: seeds = [(0,0)], fresh = 6. Minute 1 rots (0,1) and (1,0) — fresh 4. Minute 2 rots (0,2) and (1,1) — fresh 2. Minute 3 rots (2,1) — fresh 1 (the zeros at (1,2) and (2,0) block everything else). Minute 4 rots (2,2) — fresh 0 → return 4. Each wave is exactly one minute of simultaneous spread.",
      "The three ledgers lock together: the queue holds exactly last-minute's rots; a grid cell flips to 2 at enqueue time so the == 1 test is a one-shot gate (no separate visited set); and `fresh` counts down to zero exactly when the last orange rots, which both ends the loop and authorises the non-negative answer. If the wavefront dies while fresh > 0, the remainder is unreachable — -1.",
      "Each cell is enqueued at most once and does O(1) work per neighbour check: O(m·n) time. Space is the wavefront queue, worst case O(m·n) (everything rotten at once). This is walls-and-gates' engine with a scalar answer — multi-source BFS is the reusable skill; the output shape is the per-problem detail.",
    ],
    time: "O(m·n) — each cell is enqueued at most once",
    space: "O(m·n) — the wavefront queue, worst case the whole grid",
    followUps: [
      "Report the minute EACH cell rots: carry (r, c, t) in the queue and write t into a distance grid — walls-and-gates' output shape on the same engine.",
      "Let rot also spread diagonally, or give cells a per-cell spread cost: the first adds 4 neighbour offsets; the second swaps BFS for Dijkstra.",
    ],
    related: ["walls-and-gates", "01-matrix", "number-of-islands"],
    verify: {
      fn: "orangesRotting",
      wrap: "plain",
      cases: [
        { args: [[[2, 1, 1], [1, 1, 0], [0, 1, 1]]], expect: 4 },
        { args: [[[2, 1, 1], [0, 1, 1], [1, 0, 1]]], expect: -1 },
        { args: [[[0, 2]]], expect: 0 },
        { args: [[[0, 0]]], expect: 0 },
        { args: [[[1]]], expect: -1 },
        { args: [[[2]]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "walls-and-gates",
    statement:
      "You are given a building map: -1 marks a wall, 0 marks a gate, and 2147483647 marks an empty room. Fill every empty room with the distance to its NEAREST gate, counted in steps through rooms and gates — never through walls. A room no gate can reach keeps 2147483647. Update the matrix in place; nothing is returned.",
    examples: [
      { input: "rooms = [[2147483647,-1,0,2147483647],[2147483647,2147483647,2147483647,-1],[2147483647,-1,2147483647,-1],[0,-1,2147483647,2147483647]]", output: "[[3,-1,0,1],[2,2,1,-1],[1,-1,2,-1],[0,-1,3,4]]", explanation: "Gates at (0,2) and (3,0); e.g. the top-left room is 3 steps from the lower gate and 4 from the upper, so it fills with 3." },
      { input: "rooms = [[0]]", output: "[[0]]", explanation: "A gate is distance 0 from itself." },
      { input: "rooms = [[2147483647]]", output: "[[2147483647]]", explanation: "No gate exists anywhere — the room keeps its sentinel." },
    ],
    constraints: [
      "1 <= m, n <= 250",
      "rooms[r][c] is -1, 0, or 2147483647",
      "the matrix must be modified in place — the harness reads back your mutated rooms",
    ],
    breakdown: [
      "Per-room BFS — from every empty room, search until you hit a gate — is O((m·n)²) when rooms outnumber gates. Invert the search direction one final time: start BFS from ALL gates at once. Every wavefront expands one room per step, so the first wave to arrive at a room necessarily carries the NEAREST gate's distance. One BFS, O(m·n), and the nearest-source semantics fall out of BFS's layer order for free.",
      "The sentinel does the bookkeeping. Gates seed the frontier with distance 0; when the wave steps into a cell still holding 2147483647, it writes current-distance + 1 and enqueues. That == INF test is simultaneously the visited check (filled rooms never re-enter) and the type filter (walls −1 and gates 0 fail it automatically) — no separate visited structure, no branching on cell types.",
      "This is rotting-oranges' engine writing into its input instead of counting minutes: multi-source BFS is the reusable skill, and 'fill each cell with distance to nearest source' is its canonical output shape. The in-place contract matters here — the answer literally lives in the argument matrix, which is why the harness reads back the mutated rooms rather than a return value.",
    ],
    edges: [
      "No gates at all → the matrix must come back untouched; the BFS never starts.",
      "A walled-off room keeps 2147483647 — 'unreachable' is a valid output state, not an error.",
      "Gates and walls are never overwritten: the INF-only write rule makes that structural rather than a special case.",
      "Distance counts steps through rooms AND gates — passing over another gate cell is legal (it just never helps, since gates are distance-0 seeds).",
    ],
    ladder: [
      { title: "Brute force — search from every room", body: "BFS from each empty room until a gate appears; write the distance. Up to (m·n) searches of O(m·n) each — quadratic, and each search re-treads corridors the last one already measured." },
      { title: "One BFS per gate, min-merge", body: "BFS from every gate, accumulating distances, keeping the per-cell minimum across gates. O(g·m·n) and an extra distance matrix; correct, but the merge step exists only because the searches were needlessly separate." },
      { title: "The optimal idea — one multi-source BFS, write-once", body: "Seed all gates at distance 0 and let one wavefront fill the map: first arrival = nearest gate, single write, no min-merge, no distance array — the matrix itself is the ledger. O(m·n) time, O(m·n) frontier worst case." },
    ],
    approach: "Multi-source BFS from every gate (write-once distances)",
    code: `def wallsAndGates(rooms):
    # inPlace: distances are written into the caller's matrix; void return.
    rows = len(rooms)
    cols = len(rooms[0]) if rows else 0
    INF = 2147483647

    queue = []                      # wave frontier: gates at distance 0
    for r in range(rows):
        for c in range(cols):
            if rooms[r][c] == 0:
                queue.append((r, c))

    while queue:
        next_wave = []
        for r, c in queue:
            for nr, nc in ((r+1, c), (r-1, c), (r, c+1), (r, c-1)):
                if 0 <= nr < rows and 0 <= nc < cols and rooms[nr][nc] == INF:
                    rooms[nr][nc] = rooms[r][c] + 1   # first arrival = nearest
                    next_wave.append((nr, nc))
        queue = next_wave`,
    walkthrough: [
      "Trace the 4×4: seeds (0,2) and (3,0). Wave 1 fills the gate-adjacent rooms: (0,3) = 1, (1,2) = 1, (2,0) = 1. Wave 2 fills (1,1) = 2, (2,2) = 2, (1,0) = 2. Wave 3 reaches (0,0) = 3 and (3,2) = 3, and wave 4 finishes (3,3) = 4. Each number is provably minimal because BFS layers grow by exactly one step per wave.",
      "The write-once rule is the correctness argument: a room is filled by the first wave to touch it, and any later wave carries a strictly larger distance, so overwriting is impossible by construction — the == INF guard enforces it. Walls and gates fail the guard naturally (their values are never INF), which is why the neighbour filter is a single equality test rather than a type switch.",
      "Every room enters the frontier at most once and each visit checks 4 neighbours: O(m·n) time. Space is the frontier — worst case one gate in a corner and every room enqueued. Note the premium tag: this problem hides behind LeetCode's paywall, but the multi-source seeding it teaches shows up constantly in real interview loops.",
    ],
    time: "O(m·n) — every cell enters the wavefront at most once",
    space: "O(m·n) — the frontier, worst case one gate and every room enqueued",
    followUps: [
      "Weighted corridors (each step costs w[r][c]): same seeding, swap BFS for Dijkstra with a heap — write-once becomes decrease-key.",
      "Nearest gate OF EACH TYPE when several classes exist: one BFS per class, or carry the source class through the wave and keep per-class grids.",
    ],
    related: ["rotting-oranges", "01-matrix", "number-of-islands"],
    verify: {
      fn: "wallsAndGates",
      wrap: "inPlace",
      cases: [
        { args: [[[2147483647, -1, 0, 2147483647], [2147483647, 2147483647, 2147483647, -1], [2147483647, -1, 2147483647, -1], [0, -1, 2147483647, 2147483647]]], expect: [[3, -1, 0, 1], [2, 2, 1, -1], [1, -1, 2, -1], [0, -1, 3, 4]] },
        { args: [[[0]]], expect: [[0]] },
        { args: [[[2147483647]]], expect: [[2147483647]] },
        { args: [[[2147483647, 0], [0, 2147483647]]], expect: [[1, 0], [0, 1]] },
        { args: [[[0, -1, 2147483647]]], expect: [[0, -1, 2147483647]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "course-schedule",
    statement:
      "There are numCourses courses, labelled 0 to numCourses−1, and a list of prerequisite pairs [a, b] meaning b must be finished before a. Return true if all the courses can be completed in some order, or false if the prerequisites deadlock — some set of courses each waiting on another forever.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "true", explanation: "Take 0 first, then 1." },
      { input: "numCourses = 2, prerequisites = [[1,0],[0,1]]", output: "false", explanation: "Each course waits for the other — a two-node cycle." },
      { input: "numCourses = 5, prerequisites = [[1,4],[2,4],[3,1],[3,2]]", output: "true", explanation: "4 unlocks 1 and 2; both together unlock 3; 0 was free all along." },
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= numCourses·(numCourses−1)/2",
      "pairs are unique and a ≠ b",
    ],
    breakdown: [
      "Translate first, code second: each pair [a, b] is a directed edge b → a (b unlocks a), and the question 'can every course be taken?' is exactly 'is this digraph acyclic?' — the classic DAG test. That translation is the whole insight; the rest is choosing a cycle-detection instrument you can also defend out loud.",
      "Two instruments dominate. DFS with three colours (white = unvisited, grey = on the current path, black = finished) reports a cycle the moment an edge points back to a grey node. Kahn's algorithm instead tracks indegrees and repeatedly 'takes' a course whose prerequisites are all satisfied; if the taken count stalls below numCourses, the untaken remainder is trapped in cycles. For 207 either works — but Kahn's is the same machinery that produces the ORDER in 210, so this dive builds it once, deliberately.",
      "The misstep to name in interviews: building the adjacency backwards. For pure cycle detection the orientation is irrelevant (a cycle is a cycle), but the habit matters the moment order matters — and 210 is next. Also note the degenerate inputs: an empty prerequisite list is trivially true, and a cycle among a few courses while dozens hang off them is still false.",
    ],
    edges: [
      "No prerequisites → true immediately: zero edges is trivially a DAG.",
      "A cycle anywhere is fatal, even when most of the graph is orderly — one stranded pair flips the answer.",
      "Single course, no pairs → true (the base case that catches off-by-one loops).",
      "Duplicate pairs would double-count indegrees and phantom-lock courses; LeetCode guarantees uniqueness, but your code should know it is relying on that.",
    ],
    ladder: [
      { title: "Brute force — repeated takeable scans", body: "Repeatedly sweep the course list, 'taking' any course whose prerequisites are all taken, until a full sweep takes nothing. If any course remains, false. Correct; O(V·E)-ish sweeps — and it is Kahn's algorithm without the queue discipline." },
      { title: "DFS three-colour cycle detection", body: "Colour the graph; a back edge to a grey node is a cycle. O(V+E) and a favourite interview whiteboard; recursion depth can hit V, which matters in Python at n = 2000." },
      { title: "The optimal idea — Kahn's algorithm", body: "Indegree counts + a ready set: take a zero-indegree course, decrement its dependents, promote any that hit zero. Emitted count < V ⇔ a cycle exists. Iterative, O(V+E), and it reappears verbatim as 210's order-builder." },
    ],
    approach: "Kahn's algorithm — emit zero-indegree courses, count them",
    code: `def canFinish(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]   # prereq → courses it unlocks
    indeg = [0] * numCourses
    for course, prereq in prerequisites:
        adj[prereq].append(course)          # pair [a, b] = edge b → a
        indeg[course] += 1

    ready = [v for v in range(numCourses) if indeg[v] == 0]
    taken = 0
    while ready:
        v = ready.pop()                     # any ready course will do here
        taken += 1
        for nxt in adj[v]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                ready.append(nxt)
    return taken == numCourses              # a cycle strands its members`,
    walkthrough: [
      "Trace [[1,0],[0,1]], n = 2: edges 0→1 and 1→0 give indegrees [1, 1]; the ready list starts empty; taken = 0 ≠ 2 → false. Now [[1,4],[2,4],[3,1],[3,2]], n = 5: indegrees are [0,1,1,2,0]; 0 and 4 start ready; taking 4 promotes 1 and 2, taking 2 and then 1 promotes 3 — taken reaches 5 → true.",
      "The invariant: `taken` counts courses whose entire prerequisite chain has been emitted, because a course enters `ready` precisely when its indegree hits zero — that is, all its incoming edges were consumed by earlier takes. A cycle's members can never shed their last incoming edge (it comes from inside the cycle), so they strand and the count stalls — the stalling IS the detection.",
      "Building the graph is O(V+E); every course is taken at most once and every edge decremented exactly once: O(V+E) total, O(V+E) space for adjacency plus indegrees. Note the pop is deliberately unordered here — any ready course proves the point for 207 — while 210 will pin the pop order to make the output deterministic.",
    ],
    time: "O(V + E) — build once, then each course and edge is touched once",
    space: "O(V + E) — adjacency lists plus the indegree array",
    followUps: [
      "Return the actual order (course-schedule-ii): the same Kahn's with a min-heap over ready courses emits a deterministic smallest-first schedule.",
      "Minimum semesters if courses run in parallel: process Kahn's in BFS layers — each layer is one semester's timetable.",
    ],
    related: ["course-schedule-ii", "course-schedule-iv", "minimum-height-trees"],
    verify: {
      fn: "canFinish",
      wrap: "plain",
      cases: [
        { args: [2, [[1, 0]]], expect: true },
        { args: [2, [[1, 0], [0, 1]]], expect: false },
        { args: [5, [[1, 4], [2, 4], [3, 1], [3, 2]]], expect: true },
        { args: [1, []], expect: true },
        { args: [3, [[0, 1], [1, 2], [2, 0]]], expect: false },
        { args: [4, []], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "course-schedule-ii",
    statement:
      "Return an order to take numCourses courses (0..numCourses−1) that respects every prerequisite pair [a, b]: b appears before a. If the prerequisites deadlock in a cycle, return an empty list. Many orders may be valid — LeetCode accepts any of them — but this harness grades one canonical answer: the smallest course index first whenever several courses are simultaneously available.",
    examples: [
      { input: "numCourses = 2, prerequisites = [[1,0]]", output: "[0,1]", explanation: "0 unlocks 1 — the only legal order." },
      { input: "numCourses = 4, prerequisites = [[1,0],[2,0],[3,1],[3,2]]", output: "[0,1,2,3]", explanation: "[0,2,1,3] is equally valid. LeetCode accepts any valid order; the harness grades this deterministic smallest-first order." },
      { input: "numCourses = 3, prerequisites = [[1,0],[1,2]]", output: "[0,2,1]", explanation: "0 and 2 are both free; smallest-first emits 0, then 2, then 1. LeetCode accepts any valid order; the harness grades this deterministic smallest-first order." },
    ],
    constraints: [
      "1 <= numCourses <= 2000",
      "0 <= prerequisites.length <= numCourses·(numCourses−1)/2",
      "pairs are unique and a ≠ b",
    ],
    breakdown: [
      "The model is 207's: pair [a, b] becomes the directed edge b → a, and a legal schedule is a topological order of that digraph. Kahn's algorithm emits one naturally — repeatedly output a course whose remaining prerequisites have all been emitted. The only new decision is WHICH zero-indegree course to emit when several qualify, and that decision is invisible to correctness but vital to grading.",
      "Determinism is a design choice, not an accident. 'Any valid order' is fine for LeetCode's checker but fatal for byte-comparison grading: two correct solutions could disagree. This dive pins the tie-break to smallest-index-first via a MIN-HEAP over ready courses — the output becomes a pure function of the input, reproducible across languages and runs. The heap adds only a log factor over an implementation that is already linear.",
      "The direction trap deserves its own warning: flip the edges (a → b instead of b → a) and 207 still passes — booleans don't notice orientation — but 210 returns the REVERSE of a legal order, a silent wrong answer. Build the adjacency as 'prerequisite unlocks course' and the emission order is the schedule. Cycle handling is inherited from 207: if the heap empties before all courses are emitted, the stragglers form a cycle and the answer is [].",
    ],
    edges: [
      "No prerequisites → the order is simply [0, 1, …, n−1] — smallest-first with nothing to wait for.",
      "A cycle → []: the emission count stalls below numCourses; the length check, not an exception, is the signal.",
      "Single course → [0].",
      "Ties are where implementations diverge: two ready courses at once is exactly when a plain FIFO queue and a min-heap emit different (both valid!) orders.",
    ],
    ladder: [
      { title: "DFS postorder, reversed", body: "DFS every course, append to a list in postorder (after everything it unlocks), reverse at the end. Produces a valid order, but WHICH valid order depends on your iteration order — reproducible only by convention, and recursion depth hits V." },
      { title: "Kahn's with a plain queue", body: "Indegrees + FIFO queue: valid, linear, deterministic given a fixed input — but the order follows insertion accidents of the input, not a stated rule. Fine for 'any valid order' checkers; not for byte-comparison grading." },
      { title: "The optimal idea — Kahn's with a min-heap", body: "Same algorithm, but the ready set is a min-heap: always emit the smallest available course. O(V + E + V log V) — a log factor that buys a canonical, self-describing answer: smallest-first, the order a spec can name." },
    ],
    approach: "Kahn's topological sort with a min-heap (smallest-first, deterministic)",
    code: `import heapq

def findOrder(numCourses, prerequisites):
    adj = [[] for _ in range(numCourses)]   # prereq → courses it unlocks
    indeg = [0] * numCourses
    for course, prereq in prerequisites:
        adj[prereq].append(course)          # pair [a, b] = edge b → a
        indeg[course] += 1

    heap = [v for v in range(numCourses) if indeg[v] == 0]
    heapq.heapify(heap)                     # smallest ready course on top
    order = []
    while heap:
        v = heapq.heappop(heap)             # emit the smallest available
        order.append(v)
        for nxt in adj[v]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(heap, nxt)

    return order if len(order) == numCourses else []   # cycle → []`,
    walkthrough: [
      "Trace n = 4, pairs [[1,0],[2,0],[3,1],[3,2]]: edges 0→1, 0→2, 1→3, 2→3 give indegrees [0,1,1,2]. Heap starts [0]; emit 0 → 1 and 2 become ready; emit 1 → 3 becomes ready; emit 2; emit 3 → [0,1,2,3]. At the moment both 1 and 2 were ready, the heap chose 1 — the entire determinism story in one line.",
      "Trace n = 3, pairs [[1,0],[1,2]]: edges 0→1 and 2→1, indegrees [0,2,0]. Heap [0,2]: emit 0 (course 1 still waits on 2), then 2 promotes 1, then 1 → [0,2,1]. Note [2,0,1] is just as legal — the heap's choice of 0 first is the convention, not a necessity, and that is exactly what the harness's expected values encode.",
      "Cycle detection rides along: pairs [[0,1],[1,0]] give indegrees [1,1], the heap starts empty, the emission list stays empty, and len(order) < numCourses → []. Cost: O(V + E) graph work plus one heap operation per emission — O(V log V) in aggregate, O(V + E) space. State the convention out loud in interviews: 'LeetCode accepts any valid order; I produce the smallest-first one.'",
    ],
    time: "O(V + E + V log V) — linear graph work plus one heap op per emission",
    space: "O(V + E) — adjacency lists, indegrees and the heap",
    followUps: [
      "Largest-first instead: flip the min-heap to a max-heap — one comparison sign, and the canonical answer reverses its tie-breaking.",
      "Parallel semesters: emit Kahn's in layers rather than one-by-one — each layer is a set of courses that can run simultaneously, and the layer count is the minimum number of semesters.",
    ],
    related: ["course-schedule", "alien-dictionary", "minimum-height-trees"],
    verify: {
      fn: "findOrder",
      wrap: "plain",
      cases: [
        { args: [2, [[1, 0]]], expect: [0, 1] },
        { args: [4, [[1, 0], [2, 0], [3, 1], [3, 2]]], expect: [0, 1, 2, 3] },
        { args: [3, [[1, 0], [1, 2]]], expect: [0, 2, 1] },
        { args: [2, [[1, 0], [0, 1]]], expect: [] },
        { args: [1, []], expect: [0] },
        { args: [3, []], expect: [0, 1, 2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "redundant-connection",
    statement:
      "A tree on n nodes was being built by appending edges one at a time, but one edge too many slipped in, closing a single cycle. You get the full edge list — n edges on nodes 1..n, each a [u, v] pair. Return the one edge whose removal leaves a tree; when several edges would do, the one added LAST (latest in the input) is the answer. LeetCode guarantees this edge is unique.",
    examples: [
      { input: "edges = [[1,2],[1,3],[2,3]]", output: "[2,3]", explanation: "The cycle is 1–2–3–1; [2,3] is its last-added edge." },
      { input: "edges = [[1,2],[2,3],[3,4],[1,4],[1,5]]", output: "[1,4]", explanation: "The cycle is 1–2–3–4–1 and [1,4] closes it; [1,5] hangs off afterwards but joins new node 5 harmlessly." },
      { input: "edges = [[1,2],[2,3],[3,4],[4,1],[1,5]]", output: "[4,1]", explanation: "A four-edge cycle through every numbered node; [4,1] arrives last and closes it." },
    ],
    constraints: [
      "3 <= edges.length <= 1000 (n nodes, n edges: a tree plus exactly one extra edge)",
      "1 <= edges[i][0], edges[i][1] <= edges.length (nodes are 1-indexed)",
      "no repeated edges",
    ],
    breakdown: [
      "Count first: n nodes and n edges means exactly one independent cycle — a tree plus one edge. And here is the leverage: the graph 'started as a tree', so scanned in input order, every edge either attaches something new or is THE edge that closes the cycle. The answer is the first edge whose two endpoints are ALREADY connected by the edges before it — which is simultaneously the last edge of the cycle in input order, matching LeetCode's 'last in the input' guarantee.",
      "'Are u and v already connected?' is the question union-find was born to answer, incrementally. Maintain a disjoint-set forest: for each edge, find both endpoints' roots; different roots → union (the edge was a genuine tree edge); same root → this edge closes a cycle and IS the answer. No graph traversal, no path reconstruction — the data structure answers directly what the problem asks.",
      "The alternative — for each candidate edge, delete it and test tree-ness by BFS — is O(E·(V+E)) and re-derives connectivity E times. Union-find with path halving and union by rank answers each query in amortised near-constant time, so the whole scan is effectively linear. Note the 1-indexing: sizing the parent array n+1 and leaving slot 0 unused is the cheap way to keep node labels honest.",
    ],
    edges: [
      "The scan returns the FIRST edge whose endpoints already share a root — with exactly one cycle in the graph, that edge is provably the last one on it in input order. No tie-breaking logic needed.",
      "1-indexed nodes: parent arrays sized n+1; an off-by-one here silently merges node 0 into the story or drops node n.",
      "The cycle can span all n nodes or just three; both endpoints of the closing edge may be connected by a long path formed many edges earlier.",
      "The final return [] is unreachable by the problem's guarantee — but a total function beats a crash if the guarantee is ever violated.",
    ],
    ladder: [
      { title: "Brute force — delete and verify", body: "For each edge (last to first), remove it and check the rest is a tree (connected, n−1 edges). O(E·(V+E)) — correct, and it re-proves connectivity from scratch for every candidate." },
      { title: "DFS cycle-path extraction", body: "DFS for the cycle, record its node path, then return the cycle edge latest in the input. Works, but you reconstruct and translate paths; easy to fumble the edge-to-input-order mapping." },
      { title: "The optimal idea — union-find scan", body: "Process edges in order; the first whose endpoints share a root is the answer. O(E·α(E)) — near-linear, no paths stored, and the DSU you build here is reused verbatim by the next two problems in this section." },
    ],
    approach: "Union-find scan — the first edge whose roots already match",
    code: `def findRedundantConnection(edges):
    n = len(edges)
    parent = list(range(n + 1))         # 1-indexed nodes; slot 0 unused
    rank = [0] * (n + 1)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:                    # already connected → cycle closes HERE
            return [u, v]
        if rank[ru] < rank[rv]:         # union by rank
            ru, rv = rv, ru
        parent[rv] = ru
        if rank[ru] == rank[rv]:
            rank[ru] += 1
    return []                           # unreachable: input guarantees a cycle`,
    walkthrough: [
      "Trace [[1,2],[2,3],[3,4],[1,4],[1,5]]: (1,2) unions {1,2}; (2,3) grows {1,2,3}; (3,4) grows {1,2,3,4}. Edge (1,4): find(1) and find(4) return the same root — the component already contains a 1→4 path (1-2-3-4), so this edge closes the cycle → return [1,4]. Edge (1,5) is never even examined: the answer surfaced first, exactly as the last-in-input guarantee promises.",
      "The invariant that makes 'first hit = answer' rigorous: after processing edge i without a hit, the DSU's components are EXACTLY the connected components of edges[0..i]. So a hit at edge i means edges[0..i−1] already contained a u–v path — edge i is surplus — and since the graph is a tree plus one edge, the first surplus edge is the cycle's last-added edge. Union by rank plus path halving keep every find at a handful of hops.",
      "Cost: O(E·α(E)) time — α is the inverse Ackermann function, effectively 4 for any input that fits in the universe — and O(n) space for parent and rank arrays. The same two arrays return in connected-components counting and tree validation later in this file; learning DSU once pays three times here.",
    ],
    time: "O(E · α(E)) — near-linear: a constant number of near-O(1) DSU ops per edge",
    space: "O(n) — parent and rank arrays",
    followUps: [
      "Many redundant edges (a general graph): the same scan reports every cycle-closer — remove them all and the graph becomes a forest.",
      "Directed variant (redundant-connection-ii): one node may have two parents, so plain DSU needs a second rulebook — detect the double-parent first, then decide which edge to cut.",
    ],
    related: ["redundant-connection-ii", "number-of-connected-components-in-an-undirected-graph", "graph-valid-tree"],
    verify: {
      fn: "findRedundantConnection",
      wrap: "plain",
      cases: [
        { args: [[[1, 2], [1, 3], [2, 3]]], expect: [2, 3] },
        { args: [[[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]], expect: [1, 4] },
        { args: [[[1, 2], [2, 3], [3, 4], [4, 1], [1, 5]]], expect: [4, 1] },
        { args: [[[3, 4], [1, 2], [2, 4], [3, 5], [2, 5]]], expect: [2, 5] },
        { args: [[[1, 2], [2, 3], [3, 1]]], expect: [3, 1] },
      ],
    },
    xp: 20,
  },
  {
    slug: "number-of-connected-components-in-an-undirected-graph",
    statement:
      "Given n nodes labelled 0..n−1 and a list of undirected edges, count the connected components: maximal sets of nodes linked by paths of edges. A node with no edges is a component of one.",
    examples: [
      { input: "n = 5, edges = [[0,1],[1,2],[3,4]]", output: "2", explanation: "{0,1,2} and {3,4}." },
      { input: "n = 5, edges = [[0,1],[1,2],[2,3],[3,4]]", output: "1", explanation: "The chain links everything." },
      { input: "n = 4, edges = []", output: "4", explanation: "No edges — four lone components. (LeetCode requires at least one edge; this harness accepts an empty list.)" },
    ],
    constraints: [
      "1 <= n <= 2000",
      "on LeetCode 1 <= edges.length <= 5000; this harness also accepts an empty edge list",
      "0 <= edges[i][j] < n; no repeated edges",
    ],
    breakdown: [
      "'How many components?' has two classic answers. Graph-side: launch a DFS/BFS from every unvisited node; the number of launches IS the count. Edge-side: union-find — start with n components and let every successful union merge two into one, decrementing the count; an edge whose endpoints already share a root merges nothing and the count doesn't move. Both are O(V + E)-class; the DSU version never even builds adjacency lists.",
      "The inline counter is the elegant part: components = n initially, and each union with distinct roots decrements it by exactly one. After processing all edges, components = n − (number of successful unions) — no final root-scan, no second pass. The same-root skip is also the exact mechanism redundant-connection uses to DETECT the surplus edge; there it is the answer, here it is merely a filter.",
      "The DFS alternative is worth knowing because it yields component MEMBERSHIP for free (a component id per node), which DSU only gives with an extra bucketing pass. Its Achilles' heel in Python is recursion depth — a 2000-node path graph is 2000 frames deep, over the default limit — so iterate if you traverse. The misstep both approaches must dodge: counting an edge as a merge when it merely re-links an existing pair.",
    ],
    edges: [
      "No edges → n components; every node is its own baseline.",
      "Redundant edges (both endpoints already connected) must NOT decrement the count — the same-root guard is the whole defence.",
      "n = 1 with no edges → 1: the loop-free graph is one lonely component.",
      "Mixed components — chains, pairs and islands — must all resolve; returning 1 on disconnected input is the classic 'forgot the guard' bug.",
    ],
    ladder: [
      { title: "Brute force — flood from every node", body: "Keep a visited set; for each node not yet visited, flood its component and increment the count. O(V+E) with adjacency lists built explicitly — correct, and the natural route when you also need the members." },
      { title: "DFS with component ids", body: "Same traversal, but assign a component id per node instead of a boolean — the membership map comes free. Recursion depth up to V is the Python hazard; iterate with a stack." },
      { title: "The optimal idea — union-find with an inline counter", body: "Parent array over n nodes; for each edge, union and decrement on distinct roots. No adjacency lists, no recursion, O(E·α(E)) time and O(n) space — and the count is exact by construction." },
    ],
    approach: "Union-find with an inline component counter",
    code: `def countComponents(n, edges):
    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x

    components = n                  # every node starts as its own component
    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:                # already one component — redundant edge
            continue
        if rank[ru] < rank[rv]:     # union by rank: attach shallow → deep
            ru, rv = rv, ru
        parent[rv] = ru
        if rank[ru] == rank[rv]:
            rank[ru] += 1
        components -= 1             # exactly one merge happened
    return components`,
    walkthrough: [
      "Trace n = 5, edges [[0,1],[1,2],[3,4]]: components starts at 5. (0,1): roots differ → union, 4. (1,2): 0's component now contains 1, roots differ → union, 3. (3,4): union, 2 → return 2. Each decrement corresponds to a visible merge; nothing else moves the number.",
      "Now poison it with a redundant edge: [[0,1],[1,2],[3,4],[2,0]]. The first three unions bring the count to 2; (2,0) finds both endpoints in the same component and the guard skips it — the count stays 2, correctly. That guard is redundant-connection's detection wearing a different hat: there the same-root hit IS the answer, here it is simply ignored.",
      "Every edge does two finds and at most one union: O(E·α(E)) time, effectively linear. Space is the parent and rank arrays, O(n). If component membership is ever needed, one final pass buckets nodes by their root — still linear — but for the count alone the DSU never touches an adjacency list.",
    ],
    time: "O(E · α(E)) — near-linear in edges; each merge is a few DSU hops",
    space: "O(n) — parent and rank arrays",
    followUps: [
      "Return the components themselves: bucket nodes by find(x) in a closing pass — or switch to DFS with component ids when membership is the product.",
      "Dynamic connectivity: unions arrive online (DSU handles it) but deletions do not — offline reversal or link-cut trees enter the picture.",
    ],
    related: ["graph-valid-tree", "redundant-connection", "number-of-provinces"],
    verify: {
      fn: "countComponents",
      wrap: "plain",
      cases: [
        { args: [5, [[0, 1], [1, 2], [3, 4]]], expect: 2 },
        { args: [5, [[0, 1], [1, 2], [2, 3], [3, 4]]], expect: 1 },
        { args: [1, []], expect: 1 },
        { args: [4, []], expect: 4 },
        { args: [6, [[0, 1], [0, 2], [3, 4]]], expect: 3 },
        { args: [3, [[0, 1], [1, 0]]], expect: 2 },
      ],
    },
    xp: 20,
  },
  {
    slug: "graph-valid-tree",
    statement:
      "Decide whether an undirected graph on n nodes (0..n−1) with the given edge list is a valid TREE — connected, acyclic. The quick arithmetic tell: a tree has exactly n − 1 edges, and at that count, connected and acyclic imply each other.",
    examples: [
      { input: "n = 5, edges = [[0,1],[0,2],[0,3],[1,4]]", output: "true", explanation: "Four edges on five nodes, no cycle, everything reachable — a textbook tree." },
      { input: "n = 5, edges = [[0,1],[1,2],[2,3],[1,3],[1,4]]", output: "false", explanation: "Five edges instead of four — the 1–2–3 triangle alone already disqualifies it." },
      { input: "n = 1, edges = []", output: "true", explanation: "A single node is a tree: connected trivially, and 0 = n − 1 edges." },
    ],
    constraints: [
      "1 <= n <= 2000",
      "0 <= edges.length <= n·(n−1)/2",
      "0 <= edges[i][j] < n; no repeated edges",
    ],
    breakdown: [
      "The edge-count gate does most of the work before any traversal: fewer than n−1 edges cannot connect n nodes; more than n−1 forces a cycle. So len(edges) ≠ n−1 → false on sight. At EXACTLY n−1, connected and acyclic become equivalent — a forest on n nodes has at most n−1 edges, and every missing edge from that budget means a separate component. One property check suffices; pick your favourite.",
      "This dive picks acyclicity via union-find: process the n−1 edges, and if any finds both endpoints already sharing a root, the graph has a cycle → false. If all n−1 edges union cleanly, exactly n−1 merges happened on n components, leaving one component — connected, automatically. The arithmetic closes the loop: no second traversal, no reachability set.",
      "Why is the count alone not enough? The triangle-plus-island trap: n = 4 with edges [[0,1],[1,2],[0,2]] has exactly 3 = n−1 edges, yet contains a cycle AND an isolated node — the budget is spent inside one component. That is precisely the case the DSU's same-root check catches. The DFS alternative — flood from node 0, tree iff every node reached and the count gate passed — is equally valid; DSU just avoids building adjacency and any recursion.",
    ],
    edges: [
      "n = 1 with no edges → true; n = 2 with no edges → false. The empty-edge cases bracket the gate.",
      "n−1 edges can still hide a cycle when the graph is disconnected — the count gate alone would bless the triangle-plus-island graph.",
      "Duplicate edges: [[0,1],[0,1]] on n = 2 passes the count gate (2 = n−1) and then fails the same-root check — handled without a special case.",
      "Disconnected graphs with fewer than n−1 edges must die at the gate, not inside the loop — ordering the checks keeps the fast path fast.",
    ],
    ladder: [
      { title: "Brute force — verify both properties separately", body: "BFS from node 0 to test connectivity, plus a cycle check per component. Two traversals, O(V·E)-ish in the worst case, and two chances to disagree with each other on weird inputs." },
      { title: "DFS reachability + count gate", body: "Flood from node 0: tree iff every node was reached AND len(edges) == n−1. Clean, linear — with recursion depth up to V as the Python hazard." },
      { title: "The optimal idea — count gate + union-find", body: "Gate on the edge count, then union all edges; any same-root hit → cycle → false. n−1 clean unions on n nodes ⇒ connected. O(E·α(E)) time, O(n) space, no adjacency lists, no recursion." },
    ],
    approach: "Edge-count gate + union-find cycle check",
    code: `def validTree(n, edges):
    if len(edges) != n - 1:         # a tree has EXACTLY n-1 edges
        return False                # (< n-1 can't connect; > n-1 must cycle)

    parent = list(range(n))
    rank = [0] * n

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving
            x = parent[x]
        return x

    for u, v in edges:
        ru, rv = find(u), find(v)
        if ru == rv:                # surplus edge inside one component
            return False            # → cycle; n-1 edges + cycle ⇒ disconnected
        if rank[ru] < rank[rv]:
            ru, rv = rv, ru
        parent[rv] = ru
        if rank[ru] == rank[rv]:
            rank[ru] += 1
    return True                     # n-1 clean unions on n nodes ⇒ connected`,
    walkthrough: [
      "Trace the good case: n = 5, edges [[0,1],[0,2],[0,3],[1,4]] — the gate sees 4 = n−1 and passes; unions (0,1), (0,2), (0,3), (1,4) all find distinct roots and merge; four clean merges on five components leave one → true. The bad case never reaches the DSU: 5 ≠ 4 → false at the gate.",
      "The triangle-plus-island case is where the design earns its keep: n = 4, edges [[0,1],[1,2],[0,2]]. Gate passes (3 = n−1). Unions (0,1) and (1,2) merge; (0,2) finds both roots equal — a surplus edge inside one component — → false. Meanwhile node 3 sits in a component the DSU never touched, and that is fine: the cycle already disqualified the graph, and the n−1 arithmetic guarantees a cycle and disconnection travel together at this edge count.",
      "Cost: the gate is O(1); the union scan is O(E·α(E)) with O(n) space. The same parent/rank arrays appear in redundant-connection and connected-components — by now the DSU should feel like a tool you own, not a snippet you paste. For interviews, the one-line summary is: 'a tree is n−1 edges + acyclic; I check the count and let union-find catch the cycle.'",
    ],
    time: "O(E · α(E)) — the gate is O(1); the union scan is near-linear",
    space: "O(n) — parent and rank arrays",
    followUps: [
      "Directed rooted tree check: exactly one node with indegree 0, every other node indegree 1, all nodes reachable from the root — indegree counts plus one traversal.",
      "Count the spanning trees instead (Kirchhoff's Matrix-Tree theorem) — a determinant, not a traversal; a different question that starts from the same adjacency.",
    ],
    related: ["number-of-connected-components-in-an-undirected-graph", "redundant-connection", "course-schedule"],
    verify: {
      fn: "validTree",
      wrap: "plain",
      cases: [
        { args: [5, [[0, 1], [0, 2], [0, 3], [1, 4]]], expect: true },
        { args: [5, [[0, 1], [1, 2], [2, 3], [1, 3], [1, 4]]], expect: false },
        { args: [1, []], expect: true },
        { args: [2, [[0, 1]]], expect: true },
        { args: [2, []], expect: false },
        { args: [4, [[0, 1], [1, 2], [0, 2]]], expect: false },
      ],
    },
    xp: 20,
  },
];
