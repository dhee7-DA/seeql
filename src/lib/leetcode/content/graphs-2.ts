// Deep-dives — Graphs, part 2 (NC150-extras + TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const GRAPHS_2: LcDeepDive[] = [
  {
    slug: "word-ladder",
    statement:
      "A transformation ladder turns one word into another by changing exactly ONE letter at a time, where every intermediate word must itself be a real word from a supplied list. Given a begin word, an end word and the word list, return the length of the SHORTEST such ladder — the number of words in the chain counting both endpoints — or 0 if no ladder exists. All words share one length; the end word must be a member of the list, the begin word need not be.",
    examples: [
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]', output: "5", explanation: "hit → hot → dot → dog → cog: four single-letter changes plus the starting word." },
      { input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log"]', output: "0", explanation: '"cog" is not in the list, so no valid ladder can end there.' },
      { input: 'beginWord = "a", endWord = "c", wordList = ["a","b","c"]', output: "2", explanation: "One change suffices; the count includes both endpoints." },
    ],
    constraints: [
      "1 <= beginWord.length == endWord.length <= 10",
      "1 <= wordList.length <= 5000, all lowercase English, all the same length",
      "beginWord != endWord",
    ],
    breakdown: [
      "Strip away the story and this is a shortest-path problem on an unweighted graph: every word is a node, and an edge joins two words that differ in exactly one letter. Because every edge costs the same, the shortest ladder is simply the BFS distance from beginWord to endWord. The answer counts words rather than moves, which is why the counter starts at 1 for the begin word instead of 0.",
      "The real design question is how to find neighbours. Comparing every pair of words costs O(N²·L) — at N = 5000 that is hundreds of millions of character comparisons, spent building an adjacency list the search walks only once. The wildcard-bucket trick avoids pairwise comparison entirely: each word signs up for L patterns ('hot' → 'ho*', 'h*t', '*ot'), and two words are neighbours exactly when they share a pattern bucket.",
      "The last refinement is the hit-then-erase rule: the first time any frontier word expands a bucket, every word in it has just been discovered, so the bucket can be emptied on the spot. Without the erase, BFS stays correct but re-walks the same cliques once per word that touches them. With it, each bucket is scanned at most once across the entire run, which is what lets the search keep pace with the O(N·L²) bucket build.",
    ],
    edges: [
      "endWord missing from wordList → return 0 before doing any BFS; this is the single most-failed hidden test.",
      "beginWord is NOT part of wordList yet must still join the graph — build buckets over wordList ∪ {beginWord}.",
      "The ladder counts words, not moves: hit→hot→cog is a ladder of length 3. Off-by-one here is the classic bug.",
      "A word can be reached from several buckets at the same level — mark words seen the moment they are enqueued, or the queue fills with duplicates.",
    ],
    ladder: [
      { title: "Brute force — pairwise edges", body: "Build adjacency by comparing every pair of words letter by letter, then BFS. O(N²·L) construction plus the search; correct, but the graph build dominates and almost all of it is never used." },
      { title: "Generate the neighbourhood on the fly", body: "For each word, try all 26 letters in all L positions and test membership in a word set. No adjacency list at all — O(N·L·26·L) total. The standard interview first answer, and a big step up from pairwise comparison." },
      { title: "The optimal idea — wildcard buckets", body: "Precompute pattern → words once (O(N·L²)); expanding a word means listing its L buckets. Hit-then-erase keeps each bucket a one-time scan, so the search adds no asymptotic cost over the build and every clique is materialised exactly once." },
    ],
    approach: "Wildcard-pattern buckets + level BFS (hit-then-erase)",
    code: `def ladderLength(beginWord, endWord, wordList):
    words = set(wordList)
    if endWord not in words:            # no ladder can END here
        return 0
    L = len(beginWord)
    words.add(beginWord)                # the begin word joins the graph too
    buckets = {}                        # wildcard pattern → member words
    for w in words:
        for i in range(L):
            key = w[:i] + "*" + w[i + 1:]
            buckets.setdefault(key, []).append(w)

    seen = {beginWord}
    frontier = [beginWord]
    steps = 1                           # the begin word is rung one
    while frontier:
        nxt = []
        for w in frontier:
            if w == endWord:
                return steps            # first arrival is minimal in BFS
            for i in range(L):
                key = w[:i] + "*" + w[i + 1:]
                for cand in buckets.get(key, ()):
                    if cand not in seen:
                        seen.add(cand)  # mark on ENQUEUE, never on dequeue
                        nxt.append(cand)
                buckets[key] = []       # hit-then-erase: never rescan
        frontier = nxt
        steps += 1
    return 0`,
    walkthrough: [
      "Building the buckets is one pass: every word contributes L patterns, and each pattern collects the words that share it. The bucket '*ot' therefore lists hot and dot — exactly the pairs that differ in one letter at position 0. Two words are one mutation apart iff some bucket contains both, so BFS never compares letters at search time.",
      "The search runs level by level rather than queue-by-queue: frontier holds the words at the current ladder length, and steps counts words including the begin word. Checking w == endWord at dequeue time keeps the counting honest — a word first discovered at level k is returned when steps reads k. Marking seen at enqueue time is what stops the same word being appended by each of its several buckets.",
      "The hit-then-erase line is the constant-factor hero: once a bucket has been expanded, every word in it is already seen, so it can never contribute again. Emptying it turns later lookups into O(1) no-ops instead of repeated scans of finished cliques. Total cost: O(N·L²) to build, O(N·L²) worst case for the search — linear in the input's actual size.",
    ],
    time: "O(N · L²) — N words of length L; bucket build and BFS each touch O(N·L) patterns of length L",
    space: "O(N · L²) — the buckets store N·L patterns of length L",
    followUps: [
      "Count ALL shortest ladders, not just one length (LeetCode 126): record a distance map and extend only words whose distance is exactly current + 1 — the tie-edge DAG is then enumerated with backtracking.",
      "If intermediate words need not be in the list (free mutation), the answer collapses to the Hamming distance between begin and end — a good sanity check that the word list is what makes this a graph problem.",
    ],
    related: ["minimum-genetic-mutation", "open-the-lock", "word-ladder-ii"],
    verify: {
      fn: "ladderLength",
      wrap: "plain",
      cases: [
        { args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log", "cog"]], expect: 5 },
        { args: ["hit", "cog", ["hot", "dot", "dog", "lot", "log"]], expect: 0 },
        { args: ["a", "c", ["a", "b", "c"]], expect: 2 },
        { args: ["hot", "dog", ["hot", "dog"]], expect: 0 },
        { args: ["hot", "dot", ["hot", "dot", "dog"]], expect: 2 },
      ],
    },
    xp: 35,
  },
  {
    slug: "snakes-and-ladders",
    statement:
      "You are given an n×n board for Snakes & Ladders, numbered boustrophedon-style: square 1 sits at the bottom-left, the numbering runs left-to-right, then right-to-left, alternating row by row, up to n² at the top. board[r][c] holds -1 when that square is plain, or the label of a snake/ladder destination you are FORCED to teleport to after landing there. Starting on square 1, choose a die roll 1–6 each turn and return the minimum number of rolls needed to land exactly on square n², or -1 if that can never happen.",
    examples: [
      { input: "board = [[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,-1,-1,-1,-1,-1],[-1,35,-1,-1,13,-1],[-1,-1,-1,-1,-1,-1],[-1,15,-1,-1,-1,-1]]", output: "4", explanation: "1 → 7 → 12 → (rolls onto 14, forced up to 35) → 36: four rolls, one ladder ride." },
      { input: "board = [[-1,-1],[-1,3]]", output: "1", explanation: "A single roll of 3 lands directly on square 4." },
      { input: "board = [[1,1,-1],[1,1,1],[-1,1,1]]", output: "-1", explanation: "Every early landing square snakes back to 1; the start is a trap you can never leave." },
    ],
    constraints: [
      "2 <= n == board.length == board[i].length <= 20",
      "board[r][c] is -1 or an integer in 1..n²",
      "no square teleports to itself; squares 1 and n² never start a snake or ladder",
    ],
    breakdown: [
      "Unweighted shortest path in disguise — again. Each square is a node, each die roll is an edge of cost 1, and the answer is the BFS distance from square 1 to square n². From square s you may move to s+1 … s+6 (never overshooting n²), and if the landing square carries a snake or ladder the destination is FORCED — you do not get to decline the ride.",
      "Everything awkward about this problem lives in the label → (row, col) mapping, because the board array is indexed top-down while the numbering runs bottom-up and zig-zags. Derive it in two clean steps. Step one: divmod(label − 1, n) splits the label into a row-from-the-bottom q and an offset r inside that row — divmod(13, 6) = (2, 1) says label 14 sits in the third row from the bottom, second cell. Step two: flip q to a top-down index (row = n − 1 − q), and reverse the offset when q is odd (col = n − 1 − r), because odd rows-from-the-bottom run right-to-left.",
      "Getting the parity wrong mirrors alternate rows and the BFS silently wanders a flipped board — the outputs look 'almost right' while failing. Beyond the mapping, the missteps are: treating a teleport as optional, allowing rolls that overshoot n², and marking squares visited only at dequeue so the queue fills with the same square six times.",
    ],
    edges: [
      "Rolls that overshoot n² are illegal — you must land exactly; break the die loop the moment s + step > n².",
      "Teleports never chain: only the square your ROLL lands on is read; a teleport destination's own value is ignored.",
      "Mark visited on the POST-teleport square — two different rolls can funnel into the same square.",
      "Boustrophedon parity: even rows-from-the-bottom read left→right, odd rows right→left. Test the mapping on a 2×2 before writing any BFS.",
    ],
    ladder: [
      { title: "Brute force — DFS with memoisation", body: "From each square try every roll recursively and cache the best result. Correct, but forced teleports make the recursion tangle easily and the memo adds nothing once you notice every edge costs exactly one roll." },
      { title: "BFS on raw labels", body: "Level BFS from square 1 over rolls 1–6 with a visited set. The search itself is trivial; all the difficulty sits in the label→cell mapping, which you must get right first or the BFS explores a mirror-image board." },
      { title: "The optimal idea — BFS with the forced-teleport landing rule", body: "Expand roll targets, apply the teleport BEFORE enqueueing, mark post-teleport squares seen. O(n²) squares times six rolls each; the mapping math remains the only genuinely hard part, so isolate it in a helper." },
    ],
    approach: "Level BFS over squares with a derived label→(row, col) mapping",
    code: `from collections import deque

def snakesAndLadders(board):
    n = len(board)

    def cell(label):
        # label (1..n²) → (row, col) on the top-down board array.
        q, r = divmod(label - 1, n)            # q = row from the BOTTOM, r = offset
        row = n - 1 - q                        # flip bottom-up counting to top-down
        col = r if q % 2 == 0 else n - 1 - r   # even rows L→R, odd rows R→L
        return row, col

    target = n * n
    dist = {1: 0}                              # square → rolls used to reach it
    queue = deque([1])
    while queue:
        s = queue.popleft()
        if s == target:
            return dist[s]                     # first dequeue is optimal
        for step in range(1, 7):
            nxt = s + step
            if nxt > target:                   # must land exactly — no overshoot
                break
            row, col = cell(nxt)
            if board[row][col] != -1:          # snake/ladder: the ride is forced
                nxt = board[row][col]
            if nxt not in dist:                # visited check on POST-teleport square
                dist[nxt] = dist[s] + 1
                queue.append(nxt)
    return -1`,
    walkthrough: [
      "The mapping helper is worth reading as two independent facts. divmod(label − 1, n) answers 'which row, how far along' in bottom-up numbering: q counts complete rows below, r counts cells into the current row. Then the parity branch undoes the zig-zag — rows with even q were laid out left-to-right so col = r, rows with odd q run right-to-left so col = n − 1 − r, and row = n − 1 − q converts the bottom-up count into the array's top-down index.",
      "The BFS itself is textbook: dist doubles as the visited set, squares are processed in nondecreasing roll count, and the first dequeue of n² is optimal because every edge costs one roll. The loop breaks as soon as a roll would overshoot the target — every later step in the same range is strictly larger, so nothing useful is skipped.",
      "The forced-teleport rule is applied exactly where the die lands: board[row][col] replaces nxt before the visited check. Note the destination's own value is never consulted afterwards — snakes and ladders do not chain, and the visited-check-on-post-teleport-square design enforces that for free. If the queue drains, some squares can never be landed on in legal order and the answer is -1.",
    ],
    time: "O(n²) — every square enqueued once, six rolls each, O(1) mapping math per roll",
    space: "O(n²) — the dist/visited map",
    followUps: [
      "Return the actual move sequence: store a parent pointer per square when first reached and walk it back from n².",
      "A die with 1..k faces instead of 1..6 changes nothing but the range — a reminder that the 6 was never structurally important.",
    ],
    related: ["shortest-path-in-binary-matrix", "minimum-moves-to-reach-target-with-rotations"],
    verify: {
      fn: "snakesAndLadders",
      wrap: "plain",
      cases: [
        {
          args: [
            [
              [-1, -1, -1, -1, -1, -1],
              [-1, -1, -1, -1, -1, -1],
              [-1, -1, -1, -1, -1, -1],
              [-1, 35, -1, -1, 13, -1],
              [-1, -1, -1, -1, -1, -1],
              [-1, 15, -1, -1, -1, -1],
            ],
          ],
          expect: 4,
        },
        { args: [[[-1, -1], [-1, 3]]], expect: 1 },
        { args: [[[1, 1, -1], [1, 1, 1], [-1, 1, 1]]], expect: -1 },
        { args: [[[1, 2], [-1, 1]]], expect: -1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "minimum-genetic-mutation",
    statement:
      "A gene is a string of exactly 8 characters drawn from A, C, G and T. One mutation changes a single character to a different one, and a mutation is valid only if the resulting gene appears in a supplied gene bank. Given a start gene, an end gene and the bank, return the minimum number of mutations needed to turn start into end, or -1 if there is no valid way. The start gene does not need to be in the bank; the end gene does.",
    examples: [
      { input: 'startGene = "AACCGGTT", endGene = "AACCGGTA", bank = ["AACCGGTA"]', output: "1", explanation: "Flip the final T to A." },
      { input: 'startGene = "AACCGGTT", endGene = "AAACGGTA", bank = ["AACCGGTA","AACCGCTA","AAACGGTA"]', output: "2", explanation: "AACCGGTT → AACCGGTA → AAACGGTA." },
      { input: 'startGene = "AAAAACCC", endGene = "AACCCCCC", bank = ["AAAACCCC","AAACCCCC","AACCCCCC"]', output: "3" },
    ],
    constraints: [
      "startGene.length == endGene.length == bank[i].length == 8",
      "all genes consist only of A, C, G and T",
      "0 <= bank.length <= 10^4",
    ],
    breakdown: [
      "This is word ladder with a smaller alphabet and a fixed length — exactly why it makes a great companion problem. Genes are nodes; two genes are adjacent when they differ in exactly one position; the bank supplies the reachable nodes. The answer is the unweighted shortest path from startGene to endGene, so BFS hands you the optimal count level by level.",
      "With only 8 positions and 3 replacement letters, neighbour GENERATION beats neighbour lookup: from any gene there are at most 8 × 3 = 24 possible one-letter mutants, each testable against the bank in O(1) with a set. Materialising an explicit adjacency graph is wasted effort at this size. The one piece of bookkeeping that matters is marking genes seen when they are enqueued, since several parents can mutate into the same gene.",
      "The bank set does double duty from the start: it answers 'is this a valid gene?' instantly and collapses duplicate bank entries. Checking that endGene is present before searching is not an optimisation but the definition — no valid chain can finish at a gene outside the bank, and probing for one would waste the entire search.",
    ],
    edges: [
      "endGene not in bank → -1 immediately, before any search (the classic first check).",
      "startGene == endGene with endGene in the bank → 0 mutations; make sure the loop returns 0 rather than 1.",
      "An empty bank is legal input — only the start-equals-end case can succeed.",
      "Bank entries may be unreachable decoys, and duplicates may appear — a set dedupes so nothing double-enqueues.",
    ],
    ladder: [
      { title: "Brute force — build the mutation graph", body: "For every pair of genes (including start), test Hamming distance == 1, then BFS over the explicit adjacency. O(B² · 8) to build — correct, but pointless when every node's out-degree is bounded by 24." },
      { title: "Generate neighbours on the fly", body: "At each BFS step, mutate each of the 8 positions into the 3 other letters and test membership in a bank set — at most 24 set lookups per dequeued gene, no graph materialised. The standard interview answer." },
      { title: "The optimal idea — level BFS with enqueue-time seen", body: "Same generation, plus the seen-on-enqueue discipline that keeps the queue duplicate-free. Total work is O(B · 24 · 8) — linear in the bank — and the first dequeue of endGene is provably minimal because edges are unweighted." },
    ],
    approach: "Level BFS over one-letter mutants against a bank set",
    code: `def minMutation(startGene, endGene, bank):
    bank = set(bank)                    # O(1) membership + dedupe
    if endGene not in bank:             # the chain must END in the bank
        return -1
    seen = {startGene}
    frontier = [startGene]
    steps = 0                           # mutations applied so far
    while frontier:
        nxt = []
        for gene in frontier:
            if gene == endGene:         # first arrival is optimal in BFS
                return steps
            for i in range(8):          # each of the 8 positions...
                for ch in "ACGT":       # ...each of the 4 bases
                    if ch == gene[i]:
                        continue        # same letter — not a mutation
                    cand = gene[:i] + ch + gene[i + 1:]
                    if cand in bank and cand not in seen:
                        seen.add(cand)  # mark on enqueue
                        nxt.append(cand)
        frontier = nxt
        steps += 1
    return -1                           # bank exhausted, endGene never reached`,
    walkthrough: [
      "The bank set is the whole data structure: membership queries validate mutants in O(1) and duplicate entries collapse silently. The early return when endGene is absent comes before any traversal, because the goal being unreachable-by-definition makes search pointless — one of the cheapest and most-forgotten guards in the genre.",
      "Neighbour generation enumerates the full 24-mutant neighbourhood of every dequeued gene; the ch == gene[i] guard skips the no-op, leaving 3 real candidates per position. A candidate is enqueued only if it is bank-valid AND unseen, so the queue holds each gene at most once. Because every edge has the same cost, the first time endGene is dequeued, steps is the minimum.",
      "steps counts mutations, not genes: startGene sits at level 0 with steps = 0, and a one-hop answer returns 1 — trace the first example to watch the off-by-one land naturally. If the frontier empties, every reachable gene has been explored and endGene was never among them, so -1 is the honest answer.",
    ],
    time: "O(B · L² · |Σ|) with L = 8, |Σ| = 4 — each bank gene generates 24 mutants of length 8; effectively O(B)",
    space: "O(B) — the bank set and the seen set",
    followUps: [
      "Print one shortest mutation chain: keep a parent map (mutant → the gene it was first reached from) and walk it backwards from endGene.",
      "If the bank were huge and queries many, precompute wildcard buckets exactly as in word ladder — the same pattern-sharing trick applies over the alphabet {A, C, G, T}.",
    ],
    related: ["word-ladder", "open-the-lock"],
    verify: {
      fn: "minMutation",
      wrap: "plain",
      cases: [
        { args: ["AACCGGTT", "AACCGGTA", ["AACCGGTA"]], expect: 1 },
        { args: ["AACCGGTT", "AAACGGTA", ["AACCGGTA", "AACCGCTA", "AAACGGTA"]], expect: 2 },
        { args: ["AAAAACCC", "AACCCCCC", ["AAAACCCC", "AAACCCCC", "AACCCCCC"]], expect: 3 },
        { args: ["AACCGGTT", "AACCGGTA", []], expect: -1 },
        { args: ["AACCGGTT", "AACCGGTT", ["AACCGGTT"]], expect: 0 },
        { args: ["AACCGGTT", "AACCGGTA", ["AACCGGAT"]], expect: -1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "number-of-provinces",
    statement:
      "There are n cities, and an n×n binary matrix isConnected says which pairs are directly linked: isConnected[i][j] = 1 means city i and city j are directly connected (the relation is symmetric, and every city is linked to itself). A province is a group of cities linked directly or transitively, with no link leaving the group. Return the number of provinces.",
    examples: [
      { input: "isConnected = [[1,1,0],[1,1,0],[0,0,1]]", output: "2", explanation: "Cities 0 and 1 form one province; city 2 stands alone." },
      { input: "isConnected = [[1,0,0],[0,1,0],[0,0,1]]", output: "3", explanation: "No links at all — every city is its own province." },
    ],
    constraints: [
      "1 <= n <= 200",
      "isConnected[i][j] is 1 or 0",
      "isConnected[i][i] == 1 and the matrix is symmetric",
    ],
    breakdown: [
      "The matrix IS the graph — an adjacency list in disguise. Counting provinces is counting connected components, the most direct 'do you know union-find or graph traversal?' question in the canon. DFS, BFS and union-find all land the same answer; the differences are ergonomics and what you can say about complexity.",
      "The matrix shape nudges you toward O(n²) work no matter what: you must at least read all n² entries (the upper triangle suffices, by symmetry). With n ≤ 200 that is trivially fast, so the problem tests correctness and idiom rather than scaling cleverness. The naive misstep is recounting: a component must be visited exactly once, so a seen-set — or union bookkeeping that makes revisits no-ops — is non-negotiable.",
      "Union-find has a neat slogan here: start with n provinces (every city alone); every time an edge merges two DIFFERENT roots, one province dies. The count falls from n to the true number of components without any second pass. Path halving inside find keeps every lookup effectively constant, and the counter is finished the moment the scan is.",
    ],
    edges: [
      "Diagonal entries are 1 by definition — scanning j > i skips self-edges and visits each edge exactly once.",
      "A city with an all-zero row is still a province of size 1; the count must start at n, not 0.",
      "Transitive links matter: 0–1 and 1–2 with isConnected[0][2] = 0 is still ONE province — anything that counts row-groups instead of graph components fails.",
      "The matrix is symmetric — if you scan the full matrix, unions of already-shared roots are harmless no-ops, but you doubled your reads for nothing.",
    ],
    ladder: [
      { title: "Brute force — flood fill per unvisited city", body: "For each city not yet seen, DFS/BFS through the matrix collecting its component; count the launches. O(n²) time, O(n) extra — the standard, perfectly acceptable answer." },
      { title: "Union-find on the upper triangle", body: "Merge i and j wherever isConnected[i][j] = 1, decrementing a component counter on each successful union. Same complexity, no visited set, and the answer is sitting in the counter when the scan ends." },
      { title: "The optimal idea — union-find with path halving", body: "The iterative find with grandparent shortcuts keeps operations near O(α(n)); no recursion (no stack-depth worries), no explicit traversal, and the province count falls out as n minus successful unions." },
    ],
    approach: "Union-find with path halving over the upper triangle",
    code: `def findCircleNum(isConnected):
    n = len(isConnected)
    parent = list(range(n))             # city → parent (itself = root)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving: point at grandparent
            x = parent[x]
        return x

    provinces = n                       # every city starts alone
    for i in range(n):
        for j in range(i + 1, n):       # upper triangle: each edge once
            if isConnected[i][j]:
                ri, rj = find(i), find(j)
                if ri != rj:            # a genuine merge → one province dies
                    parent[ri] = rj
                    provinces -= 1
    return provinces`,
    walkthrough: [
      "The invariant is the union-find contract: at any moment, two cities are in the same province iff find returns the same root for them. parent starts as the identity, so the forest begins as n singletons and provinces = n is honest. Each successful union merges two distinct trees, so the count decreases by exactly one per merge and can never go back up.",
      "Scanning only j > i exploits the symmetry the problem grants: every edge is considered exactly once, and self-edges never enter the loop. When isConnected[i][j] is 1 but both cities already share a root, the union is a no-op — this is also what makes a careless full-matrix scan harmless, merely doubling the reads. The upper triangle halves those reads for free.",
      "find is the iterative path-halving idiom: while walking to the root, every second node is re-hung from its grandparent. That captures most of full path compression's benefit without a second pass or recursion, and it cannot blow Python's recursion stack. At n ≤ 200 any correct variant wins; writing it cleanly matters because the same skeleton scales to 10^6-element problems like evaluate-division.",
    ],
    time: "O(n²) — one pass over the upper triangle; the union-find work underneath is near-linear",
    space: "O(n) — the parent array",
    followUps: [
      "If links arrive as a STREAM of connect/disconnect events, plain DFS cannot keep up — union-find absorbs each link in near-O(1); deletions need rollback or offline processing.",
      "Return the provinces themselves (city lists): run any traversal and emit groups keyed by find(city).",
    ],
    related: ["number-of-islands", "most-stones-removed-with-same-row-or-column", "redundant-connection"],
    verify: {
      fn: "findCircleNum",
      wrap: "plain",
      cases: [
        { args: [[[1, 1, 0], [1, 1, 0], [0, 0, 1]]], expect: 2 },
        { args: [[[1, 0, 0], [0, 1, 0], [0, 0, 1]]], expect: 3 },
        { args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expect: 1 },
        { args: [[[1]]], expect: 1 },
        { args: [[[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1]]], expect: 2 },
      ],
    },
    xp: 20,
  },
  {
    slug: "reorder-routes-to-make-all-paths-lead-to-the-city-zero",
    statement:
      "n cities sit on a map, and n − 1 one-way roads connect them so that (ignoring direction) the network is a tree. You want every city to be able to drive to city 0, but the road directions may not cooperate. Return the minimum number of roads whose direction must be flipped to make every city reach the capital.",
    examples: [
      { input: "n = 6, connections = [[0,1],[1,3],[2,3],[4,0],[4,5]]", output: "3", explanation: "Flip 0→1, 1→3 and 4→5; the roads 2→3 and 4→0 already point the right way." },
      { input: "n = 5, connections = [[1,0],[1,2],[3,2],[3,4]]", output: "2" },
      { input: "n = 3, connections = [[1,0],[2,0]]", output: "0", explanation: "Both roads already lead to city 0." },
    ],
    constraints: [
      "1 <= n <= 5·10^4",
      "connections.length == n - 1, and the roads form a tree when direction is ignored",
      "0 <= connections[i][0], connections[i][1] <= n - 1, and the two ends differ",
    ],
    breakdown: [
      "Because the undirected shape is a tree, there is exactly ONE route between city 0 and any other city — so the question per road is not 'which roads could we flip' but 'which roads ALREADY point the wrong way along that unique route'. For city v to reach 0, every edge on the tree path v → 0 must be oriented toward 0. Equivalently: root the tree at 0; every tree edge currently pointing from parent to child must be flipped.",
      "That reframing turns the problem into a single traversal from 0 with a counter. Build adjacency in BOTH directions, but tag each entry with whether it follows the road's stored direction (cost 1) or runs against it (cost 0). As the traversal walks from 0 into a fresh city, it adds the tag: a cost-1 step means the road points away from the capital and will need flipping.",
      "Why is the sum minimal and exact? Each road is counted at most once — the tree has n − 1 edges and every child is discovered through exactly one of its two adjacency entries — and each flip is necessary, since without it that child's whole subtree is cut off from 0. So the count of parent→child stored-direction edges IS the answer; there is no combinatorial optimisation hiding underneath.",
    ],
    edges: [
      "An edge list is given, not an adjacency list — building the two-direction adjacency (with the direction flag) is step one; forgetting the reverse entries strands whole subtrees.",
      "The visited check must come before counting: with both directions in the adjacency list, the traversal would otherwise bounce back and forth forever and double-count every road.",
      "The flag convention (1 = traversing follows the stored road) is easy to get backwards — test on a star where all roads point outward; the answer must be n − 1.",
      "n = 1 with no roads is the degenerate case: the answer is 0 and no traversal work happens.",
    ],
    ladder: [
      { title: "Brute force — flip and re-check", body: "Repeatedly flip candidate roads and re-run reachability from every city. Correct in spirit but O(n²) or worse, and it never notices that the tree structure decides every edge locally." },
      { title: "Rooted DFS with a set of directed edges", body: "Store the original directed roads in a set; DFS from 0; when moving parent→child, check whether (parent, child) is in the set and count it. O(n) and correct, but pair-lookups are clunkier than a flag riding on the adjacency entry." },
      { title: "The optimal idea — adjacency with cost flags", body: "Two-direction adjacency where each entry carries 1 if traversing it follows the stored road, 0 otherwise; one iterative traversal sums the flags over the n − 1 tree edges. O(n) time and space, no pair sets, no re-scanning." },
    ],
    approach: "Two-direction adjacency with direction flags, one DFS from 0",
    code: `def minReorder(n, connections):
    adj = [[] for _ in range(n)]
    for u, v in connections:
        adj[u].append((v, 1))           # the stored road: u → v
        adj[v].append((u, 0))           # phantom reverse: free to walk

    cost = 0
    seen = [False] * n
    seen[0] = True
    stack = [0]
    while stack:
        node = stack.pop()
        for nxt, flag in adj[node]:
            if not seen[nxt]:           # tree edge into a fresh city
                cost += flag            # 1 = the road points AWAY from 0
                seen[nxt] = True
                stack.append(nxt)
    return cost`,
    walkthrough: [
      "Building the adjacency is the whole setup: for every road u → v we give u an outbound entry (v, 1) and v an inbound entry (u, 0). The traversal only ever walks to UNSEEN cities, so of the two entries a road contributes, exactly one — the one connecting child to parent — is ever used. That single use is where the flag is read, which is why no road can be counted twice.",
      "The flag semantics deserve one slow read: flag 1 means 'walking this entry follows the stored road direction'. When the traversal moves from a node closer to 0 into a fresh city, following the stored road means pointing AWAY from the capital — precisely the roads that must be flipped. flag 0 entries walk against the stored direction, i.e. the road already points homeward, so they add nothing.",
      "The traversal is iterative on purpose: n can reach 5·10^4 and a path-shaped tree would overflow Python's recursion limit. Because the undirected graph is a tree, every node is seen exactly once, the stack does O(n) work, and cost accumulates over exactly n − 1 flags. If the input were NOT a tree this argument would collapse — a good thing to say out loud in an interview.",
    ],
    time: "O(n) — build the adjacency, visit each city once",
    space: "O(n) — adjacency lists, the seen array, the stack",
    followUps: [
      "After flipping, report WHICH roads: record (u, v) whenever a flag-1 edge is used and return the list alongside the count.",
      "What if extra roads exist (the graph is no longer a tree)? Different spanning trees can demand different flip counts, and the problem becomes genuine optimisation — this is where the tree guarantee earns its keep.",
    ],
    related: ["find-the-town-judge", "minimum-number-of-vertices-to-reach-all-nodes", "all-paths-from-source-to-target"],
    verify: {
      fn: "minReorder",
      wrap: "plain",
      cases: [
        { args: [6, [[0, 1], [1, 3], [2, 3], [4, 0], [4, 5]]], expect: 3 },
        { args: [5, [[1, 0], [1, 2], [3, 2], [3, 4]]], expect: 2 },
        { args: [3, [[1, 0], [2, 0]]], expect: 0 },
        { args: [1, []], expect: 0 },
        { args: [4, [[0, 1], [0, 2], [0, 3]]], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "evaluate-division",
    statement:
      "You are given pairs of variables together with their ratios: equations[i] = [a, b] with values[i] = v means a / b = v. Answer each query [x, y] with the value of x / y; if it cannot be deduced from the given equations — including when x or y never appeared anywhere — answer -1. Variables are strings and all given values are positive.",
    examples: [
      { input: 'equations = [["a","b"],["b","c"]], values = [2.0, 3.0], queries = [["a","c"],["b","a"],["a","e"],["a","a"],["x","x"]]', output: "[6.0, 0.5, -1.0, 1.0, -1.0]", explanation: "a/c = a/b · b/c = 2·3; b/a is the reciprocal; 'e' and 'x' are unknown." },
      { input: 'equations = [["a","b"]], values = [0.5], queries = [["a","b"],["b","a"],["a","c"],["x","y"]]', output: "[0.5, 2.0, -1.0, -1.0]" },
    ],
    constraints: [
      "1 <= equations.length <= 20, each equation names two distinct variables",
      "0.0 < values[i] <= 100",
      "1 <= queries.length <= 20",
      "variables are strings (typically single lowercase letters)",
    ],
    breakdown: [
      "Each equation is an edge in a weighted graph: an edge a → b labelled v encodes a/b = v. Any query x / y is the product of edge labels along the path x → … → y, traversing an edge backwards inverts its label. So whenever x and y share a connected component, the query is answerable and the answer is unique.",
      "Two deterministic solutions exist and both are worth knowing. Per-query BFS/DFS multiplies labels along the path — O(E + V) per query. Weighted union-find instead merges every equation into disjoint trees where each node remembers its value RELATIVE to its root; after path compression, any query is two finds and one division, amortised near-constant.",
      "The weighted union-find is the star. The invariant: ratio[x] = value(x) / value(parent(x)), and every root satisfies ratio[root] = 1. Union of a/b = v re-hangs a's root under b's root with the compensating factor; find() rebuilds ratios top-down as it compresses. The -1 cases then fall out naturally: a variable that never appeared, or two variables living in different components.",
    ],
    edges: [
      "Queries naming variables that appear in NO equation → -1; check membership before calling find.",
      "Self-queries on known variables (a / a) → 1.0, even inside a nontrivial component.",
      "Contradictory equations (a/b = 2 then a/b = 3) are excluded by the problem, but a second union with matching roots should be a silent no-op, never a corruption of the forest.",
      "Floating precision is fine for the given bounds, but avoid repeating decimals like 1/3 in tests — stick to values exact in binary so verification is exact.",
    ],
    ladder: [
      { title: "Brute force — DFS per query", body: "Build the labelled graph; for each query, DFS from x to y multiplying labels (inverting on back-edges). O(E) per query — correct and a fine first answer, but it re-walks the graph for every question." },
      { title: "Cache per component", body: "Same DFS, but memoise each node's root-relative value after the first traversal of its component. Creeps toward union-find without committing to it, and the cache must still be invalidated when new equations arrive." },
      { title: "The optimal idea — weighted union-find", body: "Union with relative ratios, find with path compression that folds the weights. Each query is O(α(V)) once the equations are absorbed, and new equations arriving online cost one union each — this is the version that scales." },
    ],
    approach: "Weighted union-find with path compression",
    code: `def calcEquation(equations, values, queries):
    parent = {}                         # var → union-find parent
    ratio = {}                          # var → value(var) / value(parent)

    def find(x):
        if x not in parent:             # unseen variable: its own singleton
            parent[x] = x
            ratio[x] = 1.0
            return x
        if parent[x] == x:              # already the root
            return x
        root = find(parent[x])          # compress the parent chain FIRST
        ratio[x] *= ratio[parent[x]]    # x/root = x/parent · parent/root
        parent[x] = root
        return root

    for (a, b), v in zip(equations, values):
        ra, rb = find(a), find(b)       # auto-creates unseen variables
        if ra != rb:
            parent[ra] = rb             # re-hang a's root under b's root
            ratio[ra] = v * ratio[b] / ratio[a]   # keeps a/b = v true

    out = []
    for a, b in queries:
        if a not in parent or b not in parent:
            out.append(-1.0)            # variable never mentioned anywhere
        else:
            ra, rb = find(a), find(b)
            out.append(ratio[a] / ratio[b] if ra == rb else -1.0)
    return out`,
    walkthrough: [
      "find is the only subtle function. The recursive call compresses parent[x]'s chain FIRST, so by the time it returns, ratio[parent[x]] is exactly value(parent(x)) / value(root). Multiplying gives value(x)/value(root), the reassignment parent[x] = root flattens the tree, and the invariant 'root ⇒ ratio 1.0' survives because roots are only ever created as singletons.",
      "The union line is one algebra step: you know a/b = v, and after the two finds you know a = ratio[a]·ra and b = ratio[b]·rb. Solving ra/rb = v · ratio[b] / ratio[a] tells you exactly what a's old root must remember about its new parent. Hanging ra under rb with that factor keeps every already-stored ratio correct — nothing else in a's old tree needs touching, because those nodes reference ra, not rb.",
      "Queries become trivial: two finds, then the ratio of the two root-relative values — ratio[a]/ratio[b] equals a/b precisely when ra == rb. The membership checks catch variables that never appeared, and distinct roots mean genuinely disconnected information, so the -1 is a statement about components rather than a search failure.",
    ],
    time: "O((E + Q) · α(V)) — amortised near-constant per find/union after path compression",
    space: "O(V) — one parent and one ratio entry per distinct variable",
    followUps: [
      "Equations arriving online between queries: BFS-per-query must re-search each time, while weighted union-find absorbs each new equation in a single union — its decisive advantage.",
      "Detect contradictory inputs (a/b = 2 and a/b = 3): after the union attempt, compare the implied ratio against the stored one and flag a mismatch instead of silently keeping the first.",
    ],
    related: ["number-of-provinces", "accounts-merge"],
    verify: {
      fn: "calcEquation",
      wrap: "plain",
      cases: [
        { args: [[["a", "b"], ["b", "c"]], [2.0, 3.0], [["a", "c"], ["b", "a"], ["a", "e"], ["a", "a"], ["x", "x"]]], expect: [6.0, 0.5, -1.0, 1.0, -1.0] },
        { args: [[["a", "b"]], [0.5], [["a", "b"], ["b", "a"], ["a", "c"], ["x", "y"]]], expect: [0.5, 2.0, -1.0, -1.0] },
        { args: [[["a", "b"], ["c", "d"]], [2.0, 4.0], [["a", "c"], ["b", "d"], ["a", "b"], ["c", "d"]]], expect: [-1.0, -1.0, 2.0, 4.0] },
        { args: [[["a", "b"], ["b", "c"], ["c", "d"]], [2.0, 2.0, 2.0], [["a", "d"], ["d", "a"], ["b", "d"]]], expect: [8.0, 0.125, 4.0] },
        { args: [[["a", "b"], ["c", "b"], ["b", "d"]], [4.0, 2.0, 0.5], [["a", "d"], ["c", "d"], ["d", "a"]]], expect: [2.0, 1.0, 0.5] },
      ],
    },
    xp: 20,
  },
  {
    slug: "is-graph-bipartite",
    statement:
      "You are given an undirected graph as an adjacency list: graph[u] lists every neighbour of node u, nodes are numbered 0..n-1, and the graph may be DISCONNECTED. Return true exactly when the nodes can be split into two groups such that every edge joins one node from each group — equivalently, the graph can be 2-coloured with no two same-coloured nodes adjacent.",
    examples: [
      { input: "graph = [[1,3],[0,2],[1,3],[0,2]]", output: "true", explanation: "Groups {0,2} and {1,3}; every edge crosses between them." },
      { input: "graph = [[1,2,3],[0,2],[0,1],[0,3]]", output: "false", explanation: "Nodes 0, 1, 2 form a triangle — an odd cycle no 2-colouring can absorb." },
      { input: "graph = [[3],[2],[1],[0]]", output: "true", explanation: "Two disjoint edges: two separate components, each trivially bipartite." },
    ],
    constraints: [
      "1 <= graph.length <= 100",
      "graph[u] never contains u and has no duplicate entries",
      "the edge relation is symmetric (if u is in graph[v], v is in graph[u])",
    ],
    breakdown: [
      "Bipartite ⇔ 2-colourable ⇔ contains no odd cycle — three formulations of one fact, and the colourable one is the algorithm. Attempt to paint nodes with two colours so that no edge sees the same colour twice; the moment a neighbour already wears the current node's colour, some odd cycle exists and the answer is false.",
      "The mechanics are a graph traversal with one extra array: colour the start node, give every newly discovered neighbour the opposite shade, and check every already-coloured neighbour for agreement. BFS and DFS both work; an explicit stack avoids recursion-depth surprises. Nothing about distance or ordering matters — only consistency.",
      "The disconnection trap is the reason this problem exists: a traversal launched from node 0 colours ONE component. If the graph has several, each needs its own launch, and the final verdict is the AND over all of them. Loop over every node, skip the already-coloured ones, and the structure handles the rest.",
    ],
    edges: [
      "Disconnected graphs: the outer loop over ALL nodes is mandatory — colouring component 0 and returning its verdict is the classic wrong answer.",
      "Odd cycles (triangles, 5-cycles) are the only obstruction — every even cycle 2-colours; a triangle is the fastest false you can build.",
      "A self-loop would make a node adjacent to itself and uncolourable; the problem excludes them, but a defensive check costs one comparison.",
      "A node with an empty adjacency list colours trivially and its traversal ends immediately — it must not crash code that assumed every node has neighbours.",
    ],
    ladder: [
      { title: "Brute force — try both assignments", body: "Recursively attempt to colour each node either shade and backtrack on conflict. Exponential before you notice the propagation is deterministic — once a node's colour is fixed, every neighbour's colour is forced, so there is nothing to backtrack over." },
      { title: "Per-component BFS/DFS with two colours", body: "One traversal per component, flipping shades across edges and failing on the first same-colour edge. Linear per component; the only care point is launching from every uncoloured node." },
      { title: "The optimal idea — single sweep, explicit-stack DFS", body: "Iterate start = 0..n-1, skip coloured nodes, propagate −colour through an explicit stack. O(V + E) regardless of how the components are arranged; the same skeleton outputs the two groups when the partition itself is requested." },
    ],
    approach: "2-colouring DFS sweep across all components",
    code: `def isBipartite(graph):
    n = len(graph)
    color = [0] * n                     # 0 = uncoloured; 1 / -1 = the two sides

    for start in range(n):              # sweep ALL nodes: the graph may be
        if color[start] != 0:           # disconnected — every component needs
            continue                    # its own traversal launch
        color[start] = 1
        stack = [start]
        while stack:
            node = stack.pop()
            for nb in graph[node]:
                if color[nb] == 0:      # fresh node → force the opposite shade
                    color[nb] = -color[node]
                    stack.append(nb)
                elif color[nb] == color[node]:
                    return False        # same shade on an edge → odd cycle
    return True`,
    walkthrough: [
      "The colour array is simultaneously the visited set and the answer state: 0 means 'not yet reached', ±1 are the two sides. Starting a component at shade 1 is arbitrary — flipping every shade in a component yields an equally valid bipartition, so there is no wrong choice to agonise over.",
      "Propagation is forced, not chosen: when node is processed, every uncoloured neighbour MUST take −colour[node], and every coloured neighbour must disagree. The single failure mode — colour[nb] == color[node] — certifies an odd cycle, because a valid 2-colouring makes any cycle alternate shades strictly, forcing the walk to return to its start on the opposite shade.",
      "The outer sweep is the load-bearing line: range(n) guarantees every component gets a launch no matter how the input arranges them. Total work is O(V + E) — each node is coloured once and each edge inspected at most twice, once from each endpoint. Returning True after the sweep means no component anywhere objected, which is exactly the bipartition guarantee.",
    ],
    time: "O(V + E) — one colouring pass over every node and edge",
    space: "O(V) — the colour array plus the DFS stack",
    followUps: [
      "Output the actual groups (LeetCode 886 possible-bipartition adds dislike pairs): keep two lists and append by shade; the conflict check is identical.",
      "Incremental version — edges arrive one by one and you must answer 'still bipartite?' after each: union-find with parity (each node stores the parity of its path to the root) answers each new edge in near-constant time.",
    ],
    related: ["possible-bipartition", "course-schedule", "find-eventual-safe-states"],
    verify: {
      fn: "isBipartite",
      wrap: "plain",
      cases: [
        { args: [[[1, 3], [0, 2], [1, 3], [0, 2]]], expect: true },
        { args: [[[1, 2, 3], [0, 2], [0, 1], [0, 3]]], expect: false },
        { args: [[[]]], expect: true },
        { args: [[[3], [2], [1], [0]]], expect: true },
        { args: [[[1, 2], [0, 2], [0, 1], [4, 5], [3, 5], [3, 4]]], expect: false },
        { args: [[[1], [0]]], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "path-with-minimum-effort",
    statement:
      "You stand on the top-left cell of a grid of heights and want to reach the bottom-right cell, moving up, down, left or right between adjacent cells. The EFFORT of a route is the largest absolute height difference between consecutive cells along it. Return the minimum possible effort over all routes — you are optimising the worst single step, not the total climb.",
    examples: [
      { input: "heights = [[1,2,2],[3,8,2],[5,3,5]]", output: "2", explanation: "1 → 3 → 5 → 3 → 5 never takes a step bigger than 2, and every route must at some point cross a difference of 2." },
      { input: "heights = [[1,2,3],[3,8,4],[5,3,5]]", output: "1", explanation: "Skirt the 8: along the top row then down the right edge, every consecutive pair differs by 1." },
      { input: "heights = [[1,2,1,1,1],[1,2,1,2,1],[1,2,1,2,1],[1,2,1,2,1],[1,1,1,2,1]]", output: "0", explanation: "A flat corridor of 1s snakes all the way to the goal." },
    ],
    constraints: [
      "1 <= rows, cols <= 100",
      "1 <= heights[r][c] <= 10^6",
      "moves are up/down/left/right only",
    ],
    breakdown: [
      "Dijkstra generalises beyond 'sum of weights': replace the path cost with 'max of edge weights' and the algorithm still works, because max is monotone — extending a path can never lower its maximum. The priority queue therefore settles cells in order of 'best achievable worst-step', and the first settle of the target is optimal.",
      "The edge weight between neighbours is the absolute height difference; the relaxation is cand = max(current_effort, step_effort). A path is only as good as its worst step, so a route with a smaller TOTAL climb can lose to one with gentler hills — that min-max objective is the entire twist. Everything else is stock Dijkstra with (effort, row, col) triples in the heap.",
      "Two deterministic alternatives produce the same unique number: binary-search the effort threshold and BFS the subgraph of steps ≤ threshold (feasibility is monotone in the threshold), or union-find over edges sorted by difference, stopping when start and target merge. Dijkstra is the version interviewers usually want first, because it makes the monotone-max argument explicit.",
    ],
    edges: [
      "A single-cell grid: the start IS the target — answer 0 before any expansion happens.",
      "Do NOT sum differences: the objective is the maximum single step; relaxing with + silently answers a different problem.",
      "Stale heap entries: a cell can be pushed with a worse effort before a better one arrives; skip pops whose effort exceeds the recorded best.",
      "Check the target at pop time — that is what makes the 'first settle is optimal' proof airtight.",
    ],
    ladder: [
      { title: "Brute force — enumerate routes", body: "DFS all simple paths, track each path's max step, take the minimum. Exponential on a 100×100 grid — hopeless, though it does reveal that only the running max matters, which is the seed of the real solution." },
      { title: "Binary search + BFS", body: "Feasibility ('effort ≤ T' reaches the goal) is monotone in T, so binary-search T and BFS the subgraph of allowed steps. O(mn · log(maxHeight)) — clean, easy to defend, and it reuses a plain unweighted BFS." },
      { title: "The optimal idea — Dijkstra with max-edge relaxation", body: "A heap ordered by best worst-step-so-far, relaxing with max() instead of +. O(mn log(mn)), settles the target as early as provably possible, and generalises to any monotone path-cost combiner — sum, max, product of probabilities." },
    ],
    approach: "Dijkstra where the path cost is the maximum edge weight",
    code: `import heapq

def minimumEffortPath(heights):
    rows, cols = len(heights), len(heights[0])
    best = [[10**9] * cols for _ in range(rows)]
    best[0][0] = 0                      # standing still costs nothing
    heap = [(0, 0, 0)]                  # (worst step so far, row, col)
    while heap:
        effort, r, c = heapq.heappop(heap)
        if r == rows - 1 and c == cols - 1:
            return effort               # first settle of the goal is optimal
        if effort > best[r][c]:
            continue                    # stale entry — a better one ran already
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < rows and 0 <= nc < cols:
                step = abs(heights[nr][nc] - heights[r][c])
                cand = max(effort, step)    # a path = its worst single step
                if cand < best[nr][nc]:
                    best[nr][nc] = cand
                    heapq.heappush(heap, (cand, nr, nc))
    return 0                            # never reached: a grid is fully connected`,
    walkthrough: [
      "The heap ordering encodes the objective: entries are popped in increasing 'best achievable worst-step', so when the bottom-right cell is popped, no unbeaten route can appear later — every not-yet-popped route already carries a max step at least as large. That single monotonicity observation is the entire correctness proof.",
      "Relaxation replaces the usual distance + weight with max(effort, step): entering a neighbouring cell costs nothing extra unless the new step is steeper than everything before it. best[r][c] stores the champion per cell, pushes happen only on strict improvement, and the stale-entry guard discards superseded pops without expanding them.",
      "Why not plain BFS? Because step weights vary, level order would settle cells in the wrong sequence — a gentler route through many cells can beat a shorter rough one. The heap restores the ordering that BFS gets for free when all weights are equal. Each cell is pushed at most once per improving in-neighbour (≤ 4 pushes), so the heap work is O(mn log(mn)).",
    ],
    time: "O(mn · log(mn)) — every cell pushed/popped a bounded number of times through a binary heap",
    space: "O(mn) — the best grid and the heap",
    followUps: [
      "Return the actual route: carry a parent grid updated on each improvement and walk it back from the goal.",
      "Path With Maximum Minimum Value (1102) flips the objective to MAXIMISE the smallest step — the same Dijkstra with max⇄min swapped, a good check that you internalised the combiner rather than the template.",
    ],
    related: ["swim-in-rising-water", "path-with-maximum-minimum-value", "cheapest-flights-within-k-stops"],
    verify: {
      fn: "minimumEffortPath",
      wrap: "plain",
      cases: [
        { args: [[[1, 2, 2], [3, 8, 2], [5, 3, 5]]], expect: 2 },
        { args: [[[1, 2, 3], [3, 8, 4], [5, 3, 5]]], expect: 1 },
        { args: [[[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]], expect: 0 },
        { args: [[[5]]], expect: 0 },
        { args: [[[1, 10], [3, 7]]], expect: 4 },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-if-path-exists-in-graph",
    statement:
      "You are given a bidirectional graph with n nodes (labelled 0 to n−1) and a list of undirected edges, plus two nodes source and destination. Return true if some sequence of edges walks from source to destination, false otherwise. The graph can be disconnected, and there are no self-loops or duplicate edges.",
    examples: [
      { input: "n = 3, edges = [[0,1],[1,2],[2,0]], source = 0, destination = 2", output: "true", explanation: "0 → 2 directly (or 0 → 1 → 2)." },
      { input: "n = 6, edges = [[0,1],[0,2],[3,5],[5,4],[4,3]], source = 0, destination = 5", output: "false", explanation: "Two separate components: {0,1,2} and {3,4,5}." },
    ],
    constraints: [
      "1 <= n <= 2·10^5",
      "0 <= edges.length <= 10^5",
      "edges are undirected, with no self-loops and no duplicates",
    ],
    breakdown: [
      "The purest connectivity question in the canon: are source and destination in the same component? No distances, no counting, no reconstruction — one boolean. Both canonical tools apply: BFS/DFS from source (did we ever touch destination?) or union-find (do they share a root after merging every edge?).",
      "Union-find shines here because the graph arrives as an edge list — no adjacency building, no queue, just n singleton roots and E merge attempts. With path halving every operation is effectively constant in practice, so the whole run is a single sweep over the edges followed by one root comparison. At n = 2·10^5 that is comfortably fast in any language.",
      "The naive misstep is overthinking: no adjacency list is needed at all, no visited array, no recursion. The second classic error is direction — the graph is explicitly bidirectional, so edge [3, 5] must serve travel from 5 to 3 as well; union-find gets this for free because components have no direction. And edge order is irrelevant, since components only ever merge.",
    ],
    edges: [
      "Disconnected graphs are the point — two components sharing no edge must answer false even though every node is well-formed.",
      "source == destination (possible when n = 1) is true with zero edges; the root comparison returns it correctly.",
      "Merge ALL edges before comparing roots — comparing too early can see two components that later edges would join.",
      "Edges may be listed in either end-order; union-find is symmetric, so no normalisation of pairs is needed.",
    ],
    ladder: [
      { title: "Brute force — adjacency DFS per query", body: "Build the adjacency list, DFS from source, report whether destination was reached. O(n + E) time and the whole graph held as lists — perfectly fine, just more setup than this data warrants." },
      { title: "BFS with a deque", body: "Same graph, same complexity, but level-order; useful when distances are needed later. For a pure boolean it buys nothing over DFS." },
      { title: "The optimal idea — union-find over the edge list", body: "No adjacency at all: merge endpoints edge by edge with path-halving find, then compare find(source) == find(destination). Effectively linear time, O(n) space, and it answers any FUTURE connectivity query on the same graph with two finds." },
    ],
    approach: "Union-find with path halving over the edge list",
    code: `def validPath(n, edges, source, destination):
    parent = list(range(n))             # node → parent (itself = root)

    def find(x):
        while parent[x] != x:
            parent[x] = parent[parent[x]]   # path halving: jump to grandparent
            x = parent[x]
        return x

    for u, v in edges:                  # every edge is bidirectional by fiat
        ru, rv = find(u), find(v)
        if ru != rv:
            parent[ru] = rv             # merge the two components

    return find(source) == find(destination)`,
    walkthrough: [
      "The contract is the usual one: x and y are connected iff find(x) == find(y) after all unions. Merging is direction-free — parent[ru] = rv picks an arbitrary winner — because components are unordered sets, and any later find flattens whatever shape the forest happened to take.",
      "Path halving is the one-line compression trick: while walking, re-point each visited node at its grandparent. Tree heights shrink geometrically, and the amortised cost per operation stays effectively constant in practice — the formal inverse-Ackermann bound comes when halving is paired with union by rank, but even without it the forest stays shallow. No union by rank appears here, and the code is all the better for its absence at this scale.",
      "Order independence is worth saying out loud: find is idempotent and unions commute in effect, so the final forest — and the boolean it produces — is identical for any edge order. That is also why it is safe to run every merge before the single root comparison, never interleaving. If a follow-up asks WHICH component a node belongs to, the same skeleton reports find(x) as the component id.",
    ],
    time: "O(n + E · α(n)) — one find pair per edge plus one final comparison",
    space: "O(n) — the parent array",
    followUps: [
      "Many connectivity queries on one static graph: run the unions once, then each query costs two finds — this is where union-find beats re-running BFS per query.",
      "Dynamic deletions or 'which component is largest': upgrade to union by size with component counters; deletions need offline reversal or link-cut trees.",
    ],
    related: ["number-of-provinces", "redundant-connection", "find-the-town-judge"],
    verify: {
      fn: "validPath",
      wrap: "plain",
      cases: [
        { args: [3, [[0, 1], [1, 2], [2, 0]], 0, 2], expect: true },
        { args: [6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5], expect: false },
        { args: [1, [], 0, 0], expect: true },
        { args: [4, [[0, 1], [2, 3]], 0, 3], expect: false },
        { args: [2, [[1, 0]], 0, 1], expect: true },
      ],
    },
    xp: 10,
  },
  {
    slug: "the-maze",
    statement:
      "A maze is a grid of 0s (empty) and 1s (walls). A ball is placed at start, and you may push it up, down, left or right — it ROLLS in that direction until it hits a wall or the border, then stops (it does not stop on open cells mid-roll). You may change direction only while the ball is stopped. Return true if some sequence of pushes can ever stop the ball on destination, false otherwise.",
    examples: [
      { input: "maze = [[0,0,1,0,0],[0,0,0,0,0],[0,0,0,1,0],[1,1,0,1,1],[0,0,0,0,0]], start = [0,4], destination = [4,4]", output: "true", explanation: "Left, down, left, down, right, down — six rolls through five intermediate stopping points." },
      { input: "same maze, start = [0,4], destination = [3,2]", output: "false", explanation: "The ball always rolls THROUGH [3,2] and never stops there — a destination you roll over can never be reached." },
    ],
    constraints: [
      "1 <= maze.length, maze[i].length <= 100",
      "maze[r][c] is 0 or 1",
      "start and destination are open (0) cells, each given as [row, col]",
    ],
    breakdown: [
      "The roll rule changes the graph. A 'move' is not one cell but one full roll from stop-point to stop-point, so the state space is not the grid's cells but the cells where the ball can be STATIONARY. From any stop-point there are at most four outgoing rolls, and each roll's endpoint is computed by sliding until the next cell is a wall or off the grid.",
      "Once you accept stop-points as nodes with at most four unweighted edges, 'can the ball ever stop on destination?' is plain reachability — BFS or DFS over roll endpoints. Mark a stop-point visited when it is first generated; a ball that stops somewhere twice has entered a loop, and re-expanding it can never produce new stop-points.",
      "The traps are all inside the roll simulation: forgetting that the ball stops only when a wall (or border) is AHEAD, comparing the destination during the slide instead of at stop time, and allowing direction changes mid-roll. Each one silently turns a correct search into a wrong one while the small cases still pass.",
    ],
    edges: [
      "Rolling over the destination does NOT count — only stop-points are compared; the ball must land on it with the next cell a wall or border.",
      "A stop-point with a wall immediately ahead in direction d has endpoint = itself; the seen check turns that self-edge into a harmless no-op.",
      "start == destination → true immediately (the ball begins stopped on it).",
      "Single-row or single-column mazes: rolls stop only at the two ends, and one wall can wall off an entire half.",
    ],
    ladder: [
      { title: "Brute force — recurse on cells", body: "DFS over grid cells as if steps were one-at-a-time, ignoring the roll. Silently wrong: mid-roll cells are not stop-points, and 'reachable cell' is not 'stoppable cell'." },
      { title: "Roll to stop-points, recursive DFS", body: "Simulate the four rolls per stop-point and recurse. Correct and compact, but a 100×100 open maze can drive recursion depth into Python's limit." },
      { title: "The optimal idea — BFS over roll-stops", body: "A queue of stop-points, a seen set of stop-points, and a wall-ahead roll simulation per direction. Each stop-point is processed once and each roll costs at most one side length; the seen set doubles as the loop detector." },
    ],
    approach: "BFS over roll stop-points (wall-ahead simulation)",
    code: `from collections import deque

def hasPath(maze, start, destination):
    rows, cols = len(maze), len(maze[0])
    target = (destination[0], destination[1])
    seen = {(start[0], start[1])}       # stop-points already queued
    queue = deque([(start[0], start[1])])
    while queue:
        r, c = queue.popleft()
        if (r, c) == target:            # the ball STOPPED on the destination
            return True
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r, c
            while True:
                tr, tc = nr + dr, nc + dc
                if not (0 <= tr < rows and 0 <= tc < cols) or maze[tr][tc] == 1:
                    break               # wall/border ahead → the ball stops here
                nr, nc = tr, tc         # still open — keep rolling
            if (nr, nc) not in seen:    # a NEW stop-point (may equal (r, c))
                seen.add((nr, nc))
                queue.append((nr, nc))
    return False                        # stop-points exhausted, target never hit`,
    walkthrough: [
      "The inner while-loop is the entire roll: peek at the next cell; if it is in bounds and open, advance; otherwise the ball has stopped at (nr, nc). Note the endpoint can equal the start of the roll when every direction is immediately blocked — the seen check turns that into a no-op instead of an infinite queue.",
      "BFS versus DFS is a pure style choice here — both explore the same finite stop-point graph, and the question asks only for reachability, not shortest paths. The seen set does the real algorithmic work: any stop-point reached a second time closes a cycle in the roll graph, and cycles contribute nothing new. Enqueue-time marking keeps each stop-point in the queue exactly once.",
      "Complexity: each dequeued stop-point simulates four rolls, and one roll's cost is the distance slid, at most max(rows, cols). How many stop-points can exist? At most one per cell — every cell is a stop-point for SOME incoming roll — so the total is O(mn·(m+n)) time and O(mn) space. The subtle read: 'the ball rolls THROUGH the destination' is exactly why the false cases are false, and why checking at stop time rather than during the slide is mandatory.",
    ],
    time: "O(mn · (m + n)) — up to mn stop-points, each rolling at most one side length per direction",
    space: "O(mn) — the seen set of stop-points",
    followUps: [
      "The Maze II (505) asks for the shortest DISTANCE, where a roll's cost is its length: Dijkstra over stop-points with roll-lengths as edge weights — the state space here is reused verbatim.",
      "The Maze III (499) adds a hole and lexicographic path tie-breaks — same rolling, but each stop-point must carry its path (or a parent map) instead of a visited bit.",
    ],
    related: ["the-maze-ii", "shortest-path-in-binary-matrix", "rotting-oranges"],
    verify: {
      fn: "hasPath",
      wrap: "plain",
      cases: [
        {
          args: [
            [
              [0, 0, 1, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 1, 0],
              [1, 1, 0, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            [0, 4],
            [4, 4],
          ],
          expect: true,
        },
        {
          args: [
            [
              [0, 0, 1, 0, 0],
              [0, 0, 0, 0, 0],
              [0, 0, 0, 1, 0],
              [1, 1, 0, 1, 1],
              [0, 0, 0, 0, 0],
            ],
            [0, 4],
            [3, 2],
          ],
          expect: false,
        },
        { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]], [0, 0], [2, 2]], expect: true },
        { args: [[[0]], [0, 0], [0, 0]], expect: true },
        { args: [[[0, 1, 0, 0]], [0, 0], [0, 3]], expect: false },
      ],
    },
    xp: 20,
  },
];
