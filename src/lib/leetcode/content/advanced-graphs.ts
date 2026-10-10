// Deep-dives — Advanced Graphs (NeetCode 150 section: topological sort, MST, shortest paths). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const ADVANCED_GRAPHS: LcDeepDive[] = [
  {
    slug: "reconstruct-itinerary",
    statement:
      "You are handed a pile of one-way plane tickets, each an [from, to] pair of three-letter airport codes, and must fly every ticket exactly once on one connected journey that begins at 'JFK'. Return the full route as a list of airport codes in visiting order. The input guarantees at least one complete itinerary exists; if several do, the lexicographically smallest route is the answer.",
    examples: [
      { input: 'tickets = [["MUC","LHR"],["JFK","MUC"],["SFO","SJC"],["LHR","SFO"]]', output: '["JFK","MUC","LHR","SFO","SJC"]', explanation: "The tickets chain end-to-end into a single path, so it is the only itinerary." },
      { input: 'tickets = [["JFK","SFO"],["JFK","ATL"],["SFO","ATL"],["ATL","JFK"],["ATL","SFO"]]', output: '["JFK","ATL","JFK","SFO","ATL","SFO"]', explanation: "Another valid circuit exists — [JFK,SFO,ATL,JFK,ATL,SFO] — but this one is lexicographically smaller." },
      { input: 'tickets = [["JFK","KUL"],["JFK","NRT"],["NRT","JFK"]]', output: '["JFK","NRT","JFK","KUL"]', explanation: "The greedy-first flight JFK→KUL dead-ends with tickets left over, so KUL must be saved for last." },
    ],
    constraints: [
      "1 <= tickets.length <= 300",
      "tickets[i].length == 2; airports are three-letter uppercase codes",
      "all tickets belong to one traveler and at least one full itinerary exists",
    ],
    breakdown: [
      "Strip the story away and this is an Eulerian path: airports are vertices, tickets are directed edges, and 'use every ticket exactly once on one continuous route' is the textbook definition of a walk traversing every edge exactly once. The guarantee that such a walk exists starting at JFK is Euler's condition in disguise — the graph is connected in the relevant sense and the degrees line up (JFK's outdegree exceeds its indegree by one, the final airport is one short, everyone else balances). Recognising the Eulerian skeleton is the whole game; after that you are choosing between two or three classical constructions, not inventing one.",
      "The lexicographic twist is where naive attempts die. To return the smallest itinerary you must always try the smallest destination first — a min-heap of unused tickets per airport does that. But blind greedy is wrong: the smallest next flight can park you at an airport with no way onward while tickets remain unused (fly JFK→KUL early and you strand the entire NRT side trip). So 'greedy first choice' and 'must use every edge' genuinely conflict, and resolving that conflict needs structure, not more search.",
      "Hierholzer's algorithm resolves it with postorder bookkeeping. Walk greedily from JFK, popping the smallest destination each step; when you reach an airport with no unused outbound ticket you are STUCK — and being stuck at v proves every ticket out of v is spent, so v must end some suffix of the final route. Record stuck airports in the order you abandon them, retreat until you can branch again, and when the walk ends, the stuck-order reversed is the itinerary. Reversal stitches each dead-end suffix back onto the main walk at exactly the airport where the walk first entered it.",
    ],
    edges: [
      "The KUL trap: taking the lexicographically smallest flight first can dead-end early with tickets left over — a plain greedy path builder returns a partial route. Hierholzer's stuck-first postorder plus reversal is the fix.",
      "Repeated tickets: the same [from, to] pair can appear several times and every copy must be flown. Heaps keep duplicates naturally; a set-based adjacency silently eats them.",
      "The output has exactly tickets.length + 1 airports. Building it by repeated insert-at-front is O(E²); collect the stuck order into a list and reverse once.",
      "Recursive DFS versions are elegant, but a 300-ticket chain is 300 frames deep — fine here, yet the iterative stack version is the pattern that survives 'now make it iterative' and million-ticket hypotheticals.",
    ],
    ladder: [
      { title: "Brute force — try ticket permutations", body: "Backtrack over orderings of the ticket list, keeping prefixes that chain airport-to-airport, and among complete routes keep the lexicographically smallest. Correct, but factorial: 300 tickets is beyond hopeless." },
      { title: "Greedy DFS with backtracking", body: "Walk smallest-first; when stuck with tickets unused, undo the last flight and try the next-smallest. It works but degenerates exponentially whenever the greedy choice is wrong — and the KUL-style inputs are engineered precisely to make it wrong." },
      { title: "The optimal idea — Hierholzer's algorithm", body: "Min-heap per airport, walk until stuck, append the stuck airport, retreat, repeat; reverse at the end. Every ticket is popped from a heap exactly once, so the run is O(E log E) — and the construction is fully deterministic." },
    ],
    approach: "Hierholzer's Eulerian path (min-heap destinations, reversed postorder)",
    code: `import heapq

def findItinerary(tickets):
    graph = {}
    for src, dst in tickets:
        graph.setdefault(src, [])
        heapq.heappush(graph[src], dst)   # min-heap: smallest airport pops first

    route = []                            # airports in the order they get STUCK
    stack = ["JFK"]
    while stack:
        # follow the lexicographically smallest unused ticket until stuck
        while graph.get(stack[-1]):
            stack.append(heapq.heappop(graph[stack[-1]]))
        route.append(stack.pop())         # stuck here → this airport ends a suffix
    return route[::-1]                    # reverse of stuck-order = the itinerary`,
    walkthrough: [
      "The invariant: each airport's heap holds exactly its not-yet-flown tickets, so a heappop means 'board the smallest-numbered flight I haven't used'. The inner while keeps extending from the current top of stack until that airport's heap is empty — which is the definition of stuck. Nothing is ever removed from the graph except by flying it, so 'tickets remaining' is always readable at a glance.",
      "Trace the KUL case, tickets [[JFK,KUL],[JFK,NRT],[NRT,JFK]]: from JFK the heap pops KUL (K < N); KUL has no outbound tickets, so KUL is stuck and enters the route. Retreat to JFK, pop NRT, fly NRT's only ticket back to JFK — and JFK is now stuck too. The stack empties with route = [KUL, JFK, NRT, JFK]; reversed, that is JFK → NRT → JFK → KUL: every ticket flown, smallest legal answer.",
      "Why the reversal is exactly right: the first airport appended is the deepest dead end (the final destination), and each appended airport closes a suffix that began where the walk first pushed it. Reversing turns 'suffixes in abandonment order' into 'the route in departure order'. Cost audit: E tickets each pushed and popped once from a heap, plus one final reverse — O(E log E) time, O(E) space for the heaps and the E + 1-airport route.",
    ],
    time: "O(E log E) — every ticket enters and leaves a heap exactly once",
    space: "O(E) — the heaps hold all tickets; the route holds E + 1 airports",
    followUps: [
      "What if a full itinerary is NOT guaranteed? Check Euler's degree conditions up front (outdegree − indegree is +1 at JFK, −1 at the final airport, 0 elsewhere, and all edges reachable from JFK) — or detect the dead end and report failure instead of guessing.",
      "A different tie-break — say, prefer the most expensive flight — is the same algorithm with the heap key flipped: the Eulerian structure does not care which unused edge you take first, only that postorder bookkeeping is kept intact.",
    ],
    related: ["course-schedule-ii", "word-ladder", "clone-graph"],
    verify: {
      fn: "findItinerary",
      wrap: "plain",
      cases: [
        { args: [[["MUC", "LHR"], ["JFK", "MUC"], ["SFO", "SJC"], ["LHR", "SFO"]]], expect: ["JFK", "MUC", "LHR", "SFO", "SJC"] },
        { args: [[["JFK", "SFO"], ["JFK", "ATL"], ["SFO", "ATL"], ["ATL", "JFK"], ["ATL", "SFO"]]], expect: ["JFK", "ATL", "JFK", "SFO", "ATL", "SFO"] },
        { args: [[["JFK", "KUL"], ["JFK", "NRT"], ["NRT", "JFK"]]], expect: ["JFK", "NRT", "JFK", "KUL"] },
        { args: [[["JFK", "AAA"]]], expect: ["JFK", "AAA"] },
        { args: [[["JFK", "AAA"], ["AAA", "JFK"], ["JFK", "BBB"], ["BBB", "JFK"]]], expect: ["JFK", "AAA", "JFK", "BBB", "JFK"] },
      ],
    },
    xp: 35,
  },
  {
    slug: "min-cost-to-connect-all-points",
    statement:
      "You are given n distinct points on the plane as [x, y] pairs. Build a network by drawing straight segments between pairs of points until all points are connected — directly or through other points. A segment between two points costs the Manhattan distance |x1 − x2| + |y1 − y2|. Return the smallest possible total cost of such a connecting set of segments.",
    examples: [
      { input: "points = [[0,0],[2,2],[3,10],[5,2],[7,0]]", output: "20", explanation: "One optimal tree links (0,0)–(2,2) [4], (2,2)–(5,2) [3], (5,2)–(7,0) [4] and (2,2)–(3,10) [9]: 4+3+4+9 = 20." },
      { input: "points = [[3,12],[-2,5],[-4,1]]", output: "18", explanation: "(3,12)–(-2,5) costs |5|+|7| = 12 and (-2,5)–(-4,1) costs |2|+|4| = 6." },
      { input: "points = [[0,0],[1,1],[1,0],[-1,1]]", output: "4" },
    ],
    constraints: [
      "1 <= points.length <= 1000",
      "-10^6 <= x, y <= 10^6",
      "all points are distinct",
    ],
    breakdown: [
      "Every pair of points could be joined, so the implicit graph is COMPLETE: n·(n−1)/2 candidate edges. What is being asked for is a minimum spanning tree — n−1 segments, no cycles, minimum total weight. The MST frame matters because it arrives with a theorem attached, the cut property: for any partition of the points into two groups, the cheapest segment crossing that partition belongs to some MST. Every greedy MST algorithm lives off that one result.",
      "The engineering twist is the density. Kruskal wants all ~n²/2 edges materialised and sorted — workable at n = 1000 but wasteful. Prim's never needs the edge list: grow one tree from any point and repeatedly absorb the outside point closest to the tree. Keep an array nearest[i] = the cheapest distance from point i to ANY tree point so far; after each absorption, one linear sweep refreshes the n−1 outsider entries. That nearest-array optimisation makes Prim O(n²) flat — no heap, no sort, no edge list — and it is the canonical answer for dense or complete graphs.",
      "Why is greedy absorption safe? The cut property again. When the tree is T and the remainder is R, the minimum of the nearest array is precisely the cheapest T–R edge, which the theorem says belongs to some MST — so every absorption extends SOME optimal tree, and induction finishes the proof. Heap-based Prim is the other classic shape; on a complete graph it costs O(n² log n) because E is quadratic, so the humble array actually wins here. Knowing which structure fits the density is the interview point.",
    ],
    edges: [
      "A single point needs no segments: return 0. The loop still runs once and adds nearest[0] = 0 — make sure the seed makes that fall out naturally.",
      "Distance is Manhattan (|dx| + |dy|), never Euclidean and never squared — the three formulas disagree about which pairs are cheap.",
      "Distance ties: many spanning trees can share the same total. Since you return the COST, not the tree, ties are harmless — say so before someone asks 'which tree do I draw?'",
      "Coordinates up to 10^6 give distances up to 4·10^6 and totals near 4·10^9 — beyond 32-bit in C++/Java. Python shrugs; mention it when writing other languages.",
    ],
    ladder: [
      { title: "Brute force — try all spanning trees", body: "Enumerate all n^(n−2) labelled trees (Cayley's formula) and take the cheapest total. Strictly conceptual — its job is to name the search space that MST algorithms prune down to polynomial." },
      { title: "Kruskal + union-find over all pairs", body: "Materialise every pair's Manhattan distance, sort the ~n²/2 edges, and accept edges that don't form a cycle. O(n² log n) and correct; sorting a quadratic pile of edges is the price of not thinking about density." },
      { title: "The optimal idea — nearest-array Prim", body: "Grow the tree one point at a time with nearest[i] tracking each outsider's best link. n rounds × O(n) absorb-plus-relax = O(n²) total, no edge list, no heap — the asymptotic winner exactly when the graph is complete." },
    ],
    approach: "Prim's MST with a nearest-distance array (heap-free O(n²))",
    code: `def minCostConnectPoints(points):
    n = len(points)
    in_tree = [False] * n
    nearest = [float("inf")] * n     # cheapest link from point i to the tree
    nearest[0] = 0                   # start anywhere; the seed point is free
    total = 0

    for _ in range(n):
        # 1) absorb the un-tree point nearest to the tree
        best = -1
        for i in range(n):
            if not in_tree[i] and (best == -1 or nearest[i] < nearest[best]):
                best = i
        in_tree[best] = True
        total += nearest[best]

        # 2) the tree grew: point i may now connect more cheaply
        bx, by = points[best]
        for i in range(n):
            if not in_tree[i]:
                d = abs(points[i][0] - bx) + abs(points[i][1] - by)
                if d < nearest[i]:
                    nearest[i] = d
    return total`,
    walkthrough: [
      "The invariant: after k absorptions, exactly k points are in the tree, and for every point outside, nearest[i] is the true cheapest Manhattan distance from i to those k points. Absorbing point b at cost nearest[b] is justified by the cut property, and the relax sweep is what restores the invariant for the enlarged tree. The seed nearest[0] = 0 is pure bookkeeping — the first point joins for free.",
      "Trace [[3,12],[-2,5],[-4,1]]: absorb point 0 (cost 0); relaxing from (3,12) gives nearest = [_, 12, 18] — to (-2,5) is 5+7 = 12, to (-4,1) is 7+11 = 18. Absorb point 1 (cost 12); re-relaxing from (-2,5), point 2's best link drops to |−2−(−4)| + |5−1| = 6. Absorb point 2 (cost 6). Total 12 + 6 = 18, matching the example.",
      "Cost audit: n absorptions, each an O(n) selection scan plus an O(n) relax sweep — about 2n² array operations, a few million at n = 1000. A heap-based Prim does the same relaxation through log-factor pushes; on a SPARSE graph that version wins (E ≈ n), and articulating that density-dependent choice is the difference between reciting an algorithm and engineering one.",
    ],
    time: "O(n²) — n rounds of an O(n) min-scan and an O(n) relax sweep",
    space: "O(n) — the in-tree flags and the nearest array",
    followUps: [
      "Return the actual network: remember which point provided each nearest[i] (a parent pointer updated in the relax sweep) and those n−1 pairs are the tree's edges.",
      "Massive sparse point sets: build a Delaunay triangulation — the Euclidean MST is a subgraph of it — and Kruskal over its O(n) edges, subquadratic overall. Manhattan distance has analogous sparse skeletons if you need them.",
    ],
    related: ["path-with-minimum-effort", "cheapest-flights-within-k-stops", "redundant-connection"],
    verify: {
      fn: "minCostConnectPoints",
      wrap: "plain",
      cases: [
        { args: [[[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]], expect: 20 },
        { args: [[[3, 12], [-2, 5], [-4, 1]]], expect: 18 },
        { args: [[[0, 0]]], expect: 0 },
        { args: [[[0, 0], [1, 1], [1, 0], [-1, 1]]], expect: 4 },
        { args: [[[0, 0], [5, 5]]], expect: 10 },
      ],
    },
    xp: 20,
  },
  {
    slug: "network-delay-time",
    statement:
      "A network of n nodes, labelled 1 to n, carries signals along directed links; each entry times[i] = [u, v, w] delivers a signal from node u to node v in w units of time. One signal is sent from node k and propagates along links. Return the time at which EVERY node has received the signal, or −1 if some node can never be reached.",
    examples: [
      { input: "times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2", output: "2", explanation: "Node 2 fires at t=0; nodes 1 and 3 receive at t=1; node 4 at t=2 — the last arrival is 2." },
      { input: "times = [[1,2,1]], n = 2, k = 1", output: "1" },
      { input: "times = [[1,2,1]], n = 2, k = 2", output: "-1", explanation: "The signal starts at node 2, whose only link points away from node 1 — node 1 never hears anything." },
    ],
    constraints: [
      "1 <= n <= 100",
      "1 <= times.length <= 6000; times[i] = [u, v, w] with 1 <= u, v <= n, u != v, 0 <= w <= 100",
      "each ordered pair (u, v) appears at most once",
    ],
    breakdown: [
      "Translate the story once: the signal leaves node k at time 0, and link (u, v, w) says that anyone who has the signal at u at time t can have it at v at time t + w. 'When has everyone heard?' is the MAXIMUM, over all nodes, of the shortest travel time from k — so this is single-source shortest paths followed by a max. The graph is directed, weighted, and the weights are non-negative: Dijkstra territory. BFS would only suffice if every link cost the same; Bellman-Ford works too but pays V·E for robustness you do not need.",
      "Dijkstra's correctness is one lemma worth saying out loud: when the smallest-tentative-distance node v is popped, no alternative route to v can be shorter, because any such route must leave the settled set through some frontier node whose tentative distance is already ≥ v's, and non-negative weights mean the rest of the route only adds cost. That single argument licenses settling each node exactly once and never revisiting it — precisely the property negative weights would destroy.",
      "Implementation shape: adjacency list, a min-heap of (arrival-time, node) pairs, and lazy deletion — push relaxed neighbours even if they might be stale, and skip any popped node already recorded in dist. The answer is max(dist.values()) if dist covers all n nodes, else −1. With V ≤ 100 and E ≤ 6000 the run is microseconds; the point of the exercise is the pattern, not the performance.",
    ],
    edges: [
      "The graph is DIRECTED: [1,2,1] says nothing about 2→1. Building an undirected adjacency is the most common wrong answer here.",
      "Unreachable node ⇒ −1 — test len(dist) == n, not whether the max looks large.",
      "w = 0 is legal: the settled-skip is what keeps zero-cost cycles from re-expanding forever.",
      "Nodes are 1-indexed in the input. Keep your maps 1-indexed too — mixing 0- and 1-indexing is the classic off-by-one in this problem family.",
    ],
    ladder: [
      { title: "Brute force — enumerate simple paths", body: "DFS every acyclic route out of k, track the best arrival time per node, take the max. Exponential in a 6000-edge graph, and even the 'simple paths only' pruning is easy to get subtly wrong." },
      { title: "Bellman-Ford", body: "Relax every edge V−1 times: O(V·E) ≈ 600k operations here. Numerically fine, but it spends uniform effort when a priority queue could spend it where it matters — save this hammer for negative weights." },
      { title: "The optimal idea — Dijkstra with a lazy min-heap", body: "Settle the cheapest unsettled node on each pop; push relaxed neighbours without deduplicating (lazy deletion) and skip stale pops. O(E log E) and the canonical reflex for 'shortest paths, non-negative weights'." },
    ],
    approach: "Dijkstra with a lazy-deletion min-heap",
    code: `import heapq

def networkDelayTime(times, n, k):
    adj = {i: [] for i in range(1, n + 1)}
    for u, v, w in times:
        adj[u].append((v, w))           # DIRECTED: u → v only

    dist = {}                           # node → final shortest arrival time
    heap = [(0, k)]                     # (arrival time, node); k fires at t = 0
    while heap:
        t, node = heapq.heappop(heap)
        if node in dist:                # stale entry — already settled
            continue
        dist[node] = t                  # first pop is final: weights >= 0
        for nxt, w in adj[node]:
            if nxt not in dist:
                heapq.heappush(heap, (t + w, nxt))

    return max(dist.values()) if len(dist) == n else -1`,
    walkthrough: [
      "Invariant: when a node is first popped and written into dist, its time is final — that is the lemma from the breakdown. Every later pop of the same node is a stale heap ghost, discarded by the 'node in dist' guard. The heap therefore gains at most one entry per edge, each edge is scanned exactly once (from its settled tail), and no decrease-key machinery is needed.",
      "Trace example 1: pop (0, 2), settle node 2, push (1,1) and (1,3). Pop (1,1) — settle node 1; it has no outgoing links. Pop (1,3) — settle node 3, push (2,4). Pop (2,4) — settle node 4. dist = {2:0, 1:1, 3:1, 4:2}; all four nodes settled, so the answer is max = 2. The heap's tie between nodes 1 and 3 resolved harmlessly — tie order never affects final distances, only processing order.",
      "Failure path: if some node never enters dist — no path at all, or only reverse-direction links — then len(dist) < n and we return −1. Cost audit: E pushes at O(log E) each plus O(V + E) bookkeeping. Lazy deletion wastes at most a constant factor versus decrease-key implementations and is dramatically simpler, which is why it is the interview default.",
    ],
    time: "O(E log E) — one heap push per link, logarithmic pops",
    space: "O(V + E) — adjacency list, distance map, heap",
    followUps: [
      "Reconstruct the actual forwarding paths: record which node provided each settled distance in a parent map and the shortest-path tree falls out — the natural 'route the packets' follow-up.",
      "If weights could be negative, the settle-once lemma collapses and Bellman-Ford is required (which also detects negative cycles). Name the exact line of the proof that breaks: the frontier node you pop is no longer guaranteed to be on no-one's shortcut.",
    ],
    related: ["cheapest-flights-within-k-stops", "path-with-minimum-effort", "swim-in-rising-water"],
    verify: {
      fn: "networkDelayTime",
      wrap: "plain",
      cases: [
        { args: [[[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2], expect: 2 },
        { args: [[[1, 2, 1]], 2, 1], expect: 1 },
        { args: [[[1, 2, 1]], 2, 2], expect: -1 },
        { args: [[[1, 2, 1]], 3, 1], expect: -1 },
        { args: [[[1, 2, 1], [2, 3, 1], [3, 4, 1], [4, 1, 1]], 4, 1], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "swim-in-rising-water",
    statement:
      "An n × n grid gives the elevation of each square: grid[i][j]. Rain begins at time t = 0 and the water level equals t at time t. You start on the top-left square and may move to a 4-directionally adjacent square at any moment when BOTH squares' elevations are at most t (you may also wait in place while the water rises). Return the earliest time at which you can be standing on the bottom-right square.",
    examples: [
      { input: "grid = [[0,2],[1,3]]", output: "3", explanation: "At t = 2 the target square (height 3) is still submerged; at t = 3 every square along the path 0 → 1 → 3 is swimmable." },
      { input: "grid = [[0,1,2,3,4],[24,23,22,21,5],[12,13,14,15,16],[11,17,18,19,20],[10,9,8,7,6]]", output: "16", explanation: "The winning route snakes through the middle; its tallest square, 16, decides the answer." },
      { input: "grid = [[3,2],[1,0]]", output: "3", explanation: "You start on a height-3 square — nobody goes anywhere until t = 3." },
    ],
    constraints: [
      "2 <= n <= 50",
      "0 <= grid[i][j] < n², and every height is distinct",
    ],
    breakdown: [
      "The key reframe: 'time to finish a route' equals the TALLEST square on that route, because waiting is free and swimming is instantaneous once both endpoints are under water. So the problem is a MINIMAX PATH — among all corner-to-corner paths, minimise the maximum height. Shortest-by-sum intuition must be consciously switched off: the path through the fewest squares can be terrible in bottleneck terms, and the classic 5×5 example's winning route deliberately snakes around.",
      "Dijkstra survives the generalisation. Path cost is now max-of-heights instead of sum-of-weights, but it is still MONOTONE: extending a path never decreases its cost. The settle lemma still holds — when the smallest-cost frontier cell pops, every alternative route to it must exit the settled region through a cell costing at least as much, and a max can only add. So pops emerge in globally sorted order, and the FIRST pop of the bottom-right cell is the optimal bottleneck. Relaxation becomes cost' = max(cost, height(neighbor)) — one max where Dijkstra had a plus.",
      "Two siblings solve the same equation and are worth naming. Binary search the answer t over 0..n²−1 with a BFS 'is the goal reachable using cells of height ≤ t?' check — valid because the predicate is monotone in t. Or union-find: insert cells in increasing height, union each with its already-inserted neighbours, and stop the moment (0,0) and (n−1,n−1) share a set — Kruskal's bottleneck-MST view. All three return the same number because the minimax value is unique; Dijkstra-on-time is the one the Advanced Graphs bucket drills.",
    ],
    edges: [
      "The answer is at least grid[0][0]: if the start is high ground, you wait. Seed the heap with the start's height, not 0 — the classic first bug.",
      "Best ≠ shortest: the number of squares is irrelevant; the 5×5 example's optimal route is long on purpose.",
      "BOTH endpoints of every step must be ≤ t; checking only the destination square (forgetting the current one) breaks on elevated starts.",
      "n = 1: start equals goal, and the answer is that single cell's height — a good probe of the seed logic even though the stated constraints begin at n = 2.",
    ],
    ladder: [
      { title: "Brute force — all paths", body: "Enumerate every simple path from corner to corner, compute each path's maximum height, take the minimum. Exponential — even n = 6 gets uncomfortable, and n = 50 is untouchable." },
      { title: "Binary search on t + BFS", body: "The predicate 'finishable by time t' is monotone (a rising t only opens more squares), so binary search t over 0..n²−1 and BFS per check. O(n² log n²) — clean, and it decouples 'search the answer' from 'search the grid'." },
      { title: "The optimal idea — Dijkstra on the bottleneck", body: "One pass, no search-over-answers: a heap keyed by the running max pops cells in nondecreasing bottleneck order, so the goal's first pop IS the answer. Same asymptotics as binary search but no predicate plumbing and no wasted checks." },
    ],
    approach: "Dijkstra where path cost = max height (minimax path)",
    code: `import heapq

def swimInWater(grid):
    n = len(grid)
    heap = [(grid[0][0], 0, 0)]     # (water level needed so far, row, col)
    seen = {(0, 0)}
    while heap:
        t, r, c = heapq.heappop(heap)
        if r == n - 1 and c == n - 1:
            return t                # first goal pop = optimal bottleneck
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and (nr, nc) not in seen:
                seen.add((nr, nc))
                heapq.heappush(heap, (max(t, grid[nr][nc]), nr, nc))
    return -1                       # unreachable (impossible on a full grid)`,
    walkthrough: [
      "Heap invariant: every entry (t, r, c) means 'r,c is reachable at water level t', and pops come out in nondecreasing t. Marking cells seen at PUSH time (not pop) is safe because pushes are monotone: any later push of the same cell carries max(t₂, h) with t₂ at least the earlier pop's t, hence a value at least the first push's. That shaving keeps the heap at ≤ n² entries and each cell pushed exactly once.",
      "Trace [[0,2],[1,3]]: pop (0, 0, 0) → push (2, 0, 1) and (1, 1, 0). Pop (1, 1, 0) → neighbour (1,1) has height 3 → push (3, 1, 1). Pop (2, 0, 1) → its only fresh neighbour (1,1) is already seen → nothing. Pop (3, 1, 1) → it is the goal → return 3. Two different routes' cells interleave in the heap, and the max composition keeps every entry honest without any per-route bookkeeping.",
      "Complexity: n² cells, each pushed once and popped once from a heap holding at most n² entries → O(n² log n²) = O(n² log n) time, O(n²) space. And the return-on-first-goal-pop is not an optimisation bolted on top — it IS the correctness argument: by the settle lemma, the first time the goal pops, no smaller bottleneck exists anywhere in the frontier.",
    ],
    time: "O(n² log n) — each of the n² cells does one logarithmic heap operation",
    space: "O(n²) — the heap and the seen set",
    followUps: [
      "Implement the binary-search + BFS variant and the union-find-over-thresholds variant, then justify in one sentence apiece why all three must agree: the minimax value is unique even when many minimising paths exist.",
      "Swap the composition: if moving between adjacent squares cost |h(a) − h(b)| instead of max(h(a), h(b)), this becomes Path With Minimum Effort — the same Dijkstra skeleton with a different merge function. Say why the settle lemma still applies (monotone, order-independent composition).",
    ],
    related: ["path-with-minimum-effort", "network-delay-time", "min-cost-to-connect-all-points"],
    verify: {
      fn: "swimInWater",
      wrap: "plain",
      cases: [
        { args: [[[0, 2], [1, 3]]], expect: 3 },
        { args: [[[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]], expect: 16 },
        { args: [[[3, 2], [1, 0]]], expect: 3 },
        { args: [[[0, 3], [2, 1]]], expect: 2 },
        { args: [[[0, 1, 2], [3, 4, 5], [6, 7, 8]]], expect: 8 },
      ],
    },
    xp: 35,
  },
  {
    slug: "alien-dictionary",
    statement:
      "A language uses the familiar 26 lowercase letters but in an unknown alphabetical order, and you are given its dictionary — a list of words already sorted by that mystery order. Consecutive word pairs leak information: at the first position where two neighbours differ, the earlier word's letter must precede the later word's letter. Recover an ordering of the letters consistent with every leaked precedence and return it as a string; if the evidence is self-contradictory, return the empty string.",
    examples: [
      { input: 'words = ["wrt","wrf","er","ett","rftt"]', output: '"wertf"', explanation: "The pairs reveal t<f, w<e, r<t and e<r — one forced chain w < e < r < t < f. LeetCode accepts any valid order; the harness grades this deterministic smallest-first order." },
      { input: 'words = ["z","x"]', output: '"zx"', explanation: "One precedence: z before x." },
      { input: 'words = ["abc","ab"]', output: '""', explanation: "A proper prefix can never sort after its own longer word — the list is impossible." },
    ],
    constraints: [
      "1 <= words.length <= 100",
      "1 <= words[i].length <= 100; lowercase English letters only",
      "only CONSECUTIVE word pairs count as evidence",
    ],
    breakdown: [
      "Two phases, cleanly separated. Phase one mines constraints: for each consecutive pair, the FIRST differing position yields exactly one edge (w1[i] → w2[i]); characters after the first difference are unconstrained, because the sort was already decided there. Letters that never participate in a first difference still belong in the output, so collect every character of every word up front. Phase two is a topological sort of that letter graph — and this problem is LeetCode-premium, which is why it slips past people grinding only the free lists, even though Meta and Airbnb interviews keep asking it.",
      "Three landmines live in phase one. The prefix trap: ['abc','ab'] never produces a differing position, and a three-letter word sorting before its own two-letter prefix is impossible in ANY order — return '' immediately. Cycles: evidence like z<x<z (from ['z','x','z']) makes the graph un-sortable. Duplicate edges: the same precedence can be mined twice (['wrt','wrf','er','ett','rftt','te'] discovers r→t from two different pairs) — count it once or the indegrees lie and a perfectly valid dictionary reads as cyclic.",
      "Determinism is the final subtlety, and it is why this dive picks its emitter deliberately: most inputs admit MANY valid orders, so 'a topological sort' is underspecified for grading. Kahn's algorithm with a MIN-HEAP of currently-available letters always emits the lexicographically smallest valid order — one deterministic, reproducible answer. Cycle detection falls out for free: if the emitter stalls before emitting every letter, some letters are stuck in a cycle and the answer is ''.",
    ],
    edges: [
      "Prefix contradiction ['abc','ab'] → '' — but ['ab','abc'] is perfectly legal and produces NO edge at all (the zip finds no differing position; equal lengths, so no error).",
      "Duplicate mined edges (r→t found twice) would double-count indegree without the 'is b already in adj[a]?' guard — turning a valid dictionary into a phantom cycle.",
      "Cycle ['z','x','z'] → '': no letter ever reaches indegree 0, the emitter stalls, and the output-length check catches it.",
      "Letters with no constraints — middle characters, or the entire vocabulary of a single word — must still appear in the output, smallest-first among the free letters thanks to the heap.",
    ],
    ladder: [
      { title: "Brute force — permute the alphabet", body: "Test all 26! letter orders against the mined precedences. A reductio by exhaustion: it names the search space (any total order consistent with a DAG) that topological sort then finds in linear time." },
      { title: "DFS postorder topological sort", body: "Build the graph, DFS from every letter, append letters in postorder and reverse the list. Correct — but the emitted order silently depends on your set iteration order, so two correct solutions can print different (both valid!) answers; you must sort deliberately to be reproducible." },
      { title: "The optimal idea — Kahn's algorithm with a min-heap", body: "Track indegrees; repeatedly pop the SMALLEST zero-indegree letter and decrement its neighbours. Deterministic smallest-first output, O(V + E) graph work with log-factor emissions, and 'emitted < total letters' is a free cycle detector." },
    ],
    approach: "Kahn's topological sort with a min-heap (deterministic, smallest-first)",
    code: `import heapq

def alienOrder(words):
    chars = set("".join(words))          # every letter that appears, anywhere
    adj = {c: set() for c in chars}      # letter → letters that must follow it
    indeg = {c: 0 for c in chars}

    for w1, w2 in zip(words, words[1:]):
        for a, b in zip(w1, w2):
            if a != b:                   # first difference = the only evidence
                if b not in adj[a]:      # dedupe: repeat edges would skew indegree
                    adj[a].add(b)
                    indeg[b] += 1
                break
        else:
            if len(w1) > len(w2):        # "abc" sorted before "ab" — impossible
                return ""

    ready = [c for c in chars if indeg[c] == 0]
    heapq.heapify(ready)                 # smallest available letter first
    out = []
    while ready:
        c = heapq.heappop(ready)         # emit deterministically
        out.append(c)
        for nxt in adj[c]:
            indeg[nxt] -= 1
            if indeg[nxt] == 0:
                heapq.heappush(ready, nxt)

    return "".join(out) if len(out) == len(chars) else ""   # short out ⇒ cycle`,
    walkthrough: [
      "The scan's invariant: after processing consecutive pair i, adj and indeg encode exactly the DISTINCT first-difference precedences from pairs 1..i, each counted once. The for/else performs the prefix check inline: zip(w1, w2) walks only the overlapping length, so completing without a break means one word is a prefix of the other (or they are identical) — and only the length mismatch is illegal.",
      "Emission trace on ['wrt','wrf','er','ett','rftt']: edges t→f, w→e, r→t, e→r leave w alone at indegree 0. Pop w → e freed. Pop e → r freed. Pop r → t freed. Pop t → f freed. Pop f. Output 'wertf' with all five letters emitted — no cycle. Now watch the heap earn its keep on ['abc','abd','aef']: the ready set starts {a,b,c,f}, and even after b's emission frees e, the heap still correctly emits c and its downstream d before e — smallest-first throughout, yielding 'abcdef'.",
      "Failure paths in the same code: ['abc','ab'] returns '' during the scan; ['z','x','z'] builds z→x and x→z, so both letters sit at indegree 1, the heap starts empty, out stays short, and the final length check fires. The dedup case — append 'te' to the classic input so r→t is mined twice — passes only because 'b not in adj[a]' keeps indeg[t] at 1; without that guard the same input would wrongly print ''.",
    ],
    time: "O(N + V log V + E) — N characters scanned, V logarithmic heap emissions, E indegree decrements",
    space: "O(V + E) — letter sets, indegrees, heap and output",
    followUps: [
      "How would you report that the dictionary is AMBIGUOUS (more than one valid order) rather than just emitting one? A valid order is unique iff the heap never holds two ready letters at once — track the ready-set size, or verify the emitted order is a forced chain.",
      "Words arrive one at a time and you must answer 'what sorts first?' after each arrival: incremental Kahn's — add the new pair's edge, adjust indegrees, repair or rebuild the heap; discuss when a repair beats a rebuild.",
    ],
    related: ["course-schedule-ii", "course-schedule", "reconstruct-itinerary"],
    verify: {
      fn: "alienOrder",
      wrap: "plain",
      cases: [
        { args: [["wrt", "wrf", "er", "ett", "rftt"]], expect: "wertf" },
        { args: [["z", "x"]], expect: "zx" },
        { args: [["z", "x", "z"]], expect: "" },
        { args: [["abc", "ab"]], expect: "" },
        { args: [["wrt", "wrf", "er", "ett", "rftt", "te"]], expect: "wertf" },
        { args: [["abc", "abd", "aef"]], expect: "abcdef" },
      ],
    },
    xp: 35,
  },
  {
    slug: "cheapest-flights-within-k-stops",
    statement:
      "n cities numbered 0 to n−1 are connected by one-way flights; flights[i] = [u, v, w] means a flight from u to v costing w. Find the cheapest total price to travel from src to dst while making at most k intermediate stops — equivalently, a route of at most k + 1 flight legs. If no such route exists, return −1.",
    examples: [
      { input: "n = 4, flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]], src = 0, dst = 3, k = 1", output: "700", explanation: "One stop allows 0→1→3 = 700. The 400 route 0→1→2→3 makes two stops and is disqualified." },
      { input: "n = 3, flights = [[0,1,100],[1,2,100],[0,2,500]], src = 0, dst = 2, k = 1", output: "200", explanation: "0→1→2 uses its one stop and undercuts the 500 direct flight." },
      { input: "same flights, k = 0", output: "500", explanation: "Zero stops means direct flights only." },
    ],
    constraints: [
      "1 <= n <= 100",
      "0 <= flights.length <= n·(n−1)/2, each [u, v, w] with u ≠ v and 1 <= w <= 10^4",
      "0 <= k <= n − 1",
      "no duplicate (u, v) pairs",
    ],
    breakdown: [
      "Plain Dijkstra is the siren song here. It settles each city at its globally cheapest price — but 'cheapest' is the wrong ranking once a leg budget exists: reaching an intermediate city for 100 using two legs can be strictly better than reaching it for 150 using one, if dst is one leg further and the budget is tight. The true state is (city, legs used); collapsing onto the city alone is exactly what the 700-vs-400 example punishes. Any correct method must keep the budget dimension alive.",
      "Bellman-Ford happens to encode the budget natively. Round i of 'relax every edge from the previous round's distances' computes EXACTLY 'cheapest price to each city using at most i legs' — the loop counter IS the budget. Run k + 1 rounds (k stops) and read dist[dst]. The make-or-break detail: relax into a fresh COPY of the distance array each round. In-place updates let round i read round-i improvements, so legs quietly stack beyond budget — and example 1 returns 400 instead of 700.",
      "Cost: (k+1)·E relaxations — better than full Bellman-Ford's (V−1)·E whenever k < V−1, which is the common case. Two honest alternatives if pushed: BFS in levels (level = leg count, carrying a best-price-per-city map and pruning dominated states) and Dijkstra over (city, stops) states with the stops coordinate non-decreasing. All three agree on the answer; the copy-array Bellman-Ford is the shortest correct program, which is why it is the default.",
    ],
    edges: [
      "The copy trap: relaxing in place answers a DIFFERENT problem — some paths silently use more than k+1 legs by reading same-round improvements. This single deleted line is the most failed detail of the problem.",
      "k stops = k + 1 legs. Loop k + 1 times; looping k times fails example 2 (returns 500 instead of 200).",
      "src == dst: the answer is 0 — dist[src] starts at 0 and nothing can beat it since all weights are ≥ 1.",
      "No route within budget → −1: either dst is unreachable, or every route needs more stops than k allows (k = 0 with no direct flight is the crispest instance).",
    ],
    ladder: [
      { title: "Brute force — DFS over routes", body: "Recursively extend from src carrying price and legs used, prune past k stops, and track the best arrival at dst. Exponential on dense graphs; fine as a correctness oracle on toy inputs." },
      { title: "BFS in levels", body: "Expand one leg per level; keep the best price per city within the current level and skip states no better than what you've seen. Correct and intuitive, but the per-level bookkeeping (level arrays, dominated-state pruning) is where bugs breed." },
      { title: "The optimal idea — stop-budgeted Bellman-Ford", body: "Each round = one more allowed leg; relax all edges from a frozen copy of the previous round's distances. O((k+1)·E) time, O(n) space, and the copy makes the leg discipline structural instead of remembered." },
    ],
    approach: "Bellman-Ford with a per-round copy (stop budget = round count)",
    code: `def findCheapestPrice(n, flights, src, dst, k):
    INF = float("inf")
    dist = [INF] * n
    dist[src] = 0

    for _ in range(k + 1):              # k stops = k + 1 legs
        temp = dist[:]                  # COPY: this round may only read LAST round
        for u, v, w in flights:
            if dist[u] != INF and dist[u] + w < temp[v]:
                temp[v] = dist[u] + w   # reach v with one more leg than before
        dist = temp

    return dist[dst] if dist[dst] != INF else -1`,
    walkthrough: [
      "Invariant: after round i, dist[v] is the cheapest price from src to v over all routes with at most i legs. Round 0 is the seed (src at 0, everything else ∞). The copy is the invariant's enforcement mechanism: reads come from dist (round i−1's answers), writes go to temp (round i's answers), and the two never contaminate each other mid-round.",
      "Trace example 1 (k = 1 → two rounds). Round 1 reads [0, ∞, ∞, ∞]: only 0→1 fires, so dist = [0, 100, ∞, ∞]. Round 2 reads that frozen array: 1→3 gives 700 and 1→2 gives 200 — but 2→3 does NOT fire, because dist[2] is still ∞ in the read array, so the two-stops route cannot sneak in. dist[3] = 700. Relax in place instead, and 2→3 reads the same round's 200: dist[3] = 400 — the wrong answer produced by one deleted line.",
      "Complexity: (k+1) sweeps of E edges, O(n) memory. A micro-optimisation worth mentioning: if a round changes nothing, break early — the distances are stable from then on. And note what the budget does NOT do: it doesn't make the problem exotic; it converts 'shortest path' into 'shortest path in a layered graph', which is exactly what the rounds implement — one layer per leg.",
    ],
    time: "O((k+1)·E) — one full edge sweep per allowed leg",
    space: "O(n) — two distance arrays",
    followUps: [
      "Rewrite as Dijkstra over (city, legs-used) states: why must legs be part of the state, and why does settling on price alone break the budget? (Note the heap now holds ~n·k states — often slower than the Bellman-Ford sweep.)",
      "If k ≥ n − 1 the budget stops binding and plain shortest paths (Dijkstra) is correct; describe the crossover and why the copy-array code still returns the right answer, just wastefully.",
    ],
    related: ["network-delay-time", "word-ladder", "path-with-minimum-effort"],
    verify: {
      fn: "findCheapestPrice",
      wrap: "plain",
      cases: [
        { args: [4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1], expect: 700 },
        { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 1], expect: 200 },
        { args: [3, [[0, 1, 100], [1, 2, 100], [0, 2, 500]], 0, 2, 0], expect: 500 },
        { args: [4, [[0, 1, 100], [1, 2, 100], [2, 3, 100], [0, 3, 500]], 0, 3, 1], expect: 500 },
        { args: [1, [], 0, 0, 0], expect: 0 },
        { args: [3, [[0, 1, 100], [1, 2, 100]], 0, 2, 0], expect: -1 },
      ],
    },
    xp: 20,
  },
];
