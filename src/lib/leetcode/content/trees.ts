// Deep-dives — Trees, part 1 (NeetCode 150 core section). Statements are
// original paraphrases; solutions verified by scripts/lc-verify. Wrap
// conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const TREES: LcDeepDive[] = [
  {
    slug: "invert-binary-tree",
    statement:
      "You are given the root of a binary tree. Mirror it in place: every node swaps its left and right children, and their descendants follow suit. Return the root of the inverted tree.",
    examples: [
      { input: "root = [4,2,7,1,3,6,9]", output: "[4,7,2,9,6,3,1]", explanation: "Each level is reflected left-to-right." },
      { input: "root = [1,2]", output: "[1,null,2]", explanation: "The lone child moves from the left side to the right." },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["0 <= number of nodes <= 100", "-100 <= Node.val <= 100"],
    breakdown: [
      "This problem is famous less for its difficulty than for its legend — a developer once lost a job offer over it. The recursion is one sentence: the mirror of a tree is a root whose left child is the mirror of the original right child and whose right child is the mirror of the original left child. Because invert(child) can be trusted for every child, the parent's entire job reduces to a single swap. The subproblem definition does all the heavy lifting; the code is just that sentence.",
      "Two design choices deserve a sentence each. First, mutate pointers rather than build a new tree: re-linking children on the existing nodes is the idiomatic 'invert in place', and the serializer sees exactly that structural change. Second, evaluate both mirrors before either assignment — Python's simultaneous assignment does this for free — or use a manual temp swap. Swapping node VALUES instead of child pointers is the classic wrong turn: it only looks right when the two subtrees happen to be value-mirrored, and breaks the moment their shapes differ.",
    ],
    edges: [
      "An empty tree is its own mirror — the None guard is the entire base case, and [] returns [].",
      "One-sided shapes matter most: [1,2] becomes [1,null,2]; a missing child becomes the only child on the other side.",
      "A single node returns unchanged — the swap exchanges two Nones.",
      "Swapping values instead of pointers produces a valid-looking but wrong tree whenever the subtrees have different shapes.",
    ],
    ladder: [
      { title: "Brute force — serialize, mirror, rebuild", body: "Emit a level-order array, reflect children at every position, rebuild. Correct but three passes and O(n) extra space for what is one line of recursion." },
      { title: "Explicit stack or BFS queue", body: "Process one node at a time, swapping its children before enqueuing them. Same O(n), no recursion-depth concerns — the escape hatch when the tree may be a degenerate chain." },
      { title: "The optimal idea — recursive swap", body: "invert(node) = swap(invert(left), invert(right)). Every node visited once, O(1) extra beyond the call stack, and the in-place pointer mutation is exactly what the serializer reports." },
    ],
    approach: "Recursive child swap",
    code: `def invertTree(root):
    if root is None:            # the empty tree is its own mirror
        return None
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root                 # same nodes, mirrored — the serializer sees it`,
    walkthrough: [
      "The base case carries more weight than it appears to: None is both 'no tree' and 'the mirror of no tree', so no caller ever needs special-casing. Every recursive tree function leans on a degenerate case like this; here it also encodes the fact that mirroring is an involution on the empty structure.",
      "The one working line is a simultaneous assignment: Python evaluates the right-hand tuple fully — calling invertTree on the ORIGINAL right subtree, then the original left — before either store happens. That ordering makes the swap aliasing-safe without a temp variable. After the line runs, root.left is the old right subtree, already mirrored from the bottom up because the recursion completed before returning.",
      "The function returns root, not a fresh tree: the nodes are the same objects with their child pointers reversed, which is precisely what 'invert in place' means — and exactly what the level-order serializer reports back. Recursion depth equals the tree height, O(n) worst case on a chain; at the 100-node cap that is trivial, but the queue variant is the version to name for taller trees.",
    ],
    time: "O(n) — each node visited once",
    space: "O(h) call stack — O(n) worst case on a skewed tree",
    followUps: [
      "Iterative variant with a queue (BFS) or stack (DFS): swap each dequeued node's children — same O(n), immune to recursion limits.",
      "Invert an N-ary tree: same recursion, the children list is reversed — the usual 'how does this scale?' follow-up.",
    ],
    related: ["maximum-depth-of-binary-tree", "symmetric-tree"],
    verify: {
      fn: "invertTree",
      wrap: "tree",
      cases: [
        { args: [[4, 2, 7, 1, 3, 6, 9]], expect: [4, 7, 2, 9, 6, 3, 1] },
        { args: [[]], expect: null },
        { args: [[1]], expect: [1] },
        { args: [[1, 2]], expect: [1, null, 2] },
        { args: [[1, 2, null, 3]], expect: [1, null, 2, null, 3] },
      ],
    },
    xp: 10,
  },
  {
    slug: "maximum-depth-of-binary-tree",
    statement:
      "Return the depth of a binary tree: the number of nodes on the longest root-to-leaf path. An empty tree has depth 0.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "3", explanation: "The path 3 → 20 → 15 (or 3 → 20 → 7) is the longest." },
      { input: "root = [1,null,2]", output: "2", explanation: "The right arm is the only path of length two." },
      { input: "root = []", output: "0" },
    ],
    constraints: ["0 <= number of nodes <= 10^4", "-100 <= Node.val <= 100"],
    breakdown: [
      "Depth is the canonical recursive quantity: the depth of a tree is 1 plus the depth of its deeper subtree, and the depth of nothing is 0. That sentence is the entire algorithm — each node delegates to its two subtrees and answers with one more level. Notice the self-similarity: every subtree is a smaller instance of the same question, which is why the recursion needs no auxiliary state.",
      "Values are irrelevant; only shape matters. That is worth saying out loud because it pins down what the function really measures — structure, not content — and it means negative or enormous values cannot affect the answer. The same two-line shape returns for diameter (edges), balance (height deltas) and path sums (gains), so this problem is best treated as the template for the whole family.",
      "The iterative equivalent is BFS by generations: count how many levels the queue drains, and that count is the depth. The naive missteps are an off-by-one (depth counts NODES on the longest root-to-leaf path, while diameter counts edges) and threading a 'current depth' through global mutable state instead of returning heights — both are interview tells.",
    ],
    edges: [
      "An empty tree has depth 0 — the None guard is the whole base case.",
      "A single node is depth 1: this metric counts nodes, while diameter counts edges — the classic off-by-one pairing.",
      "A skewed chain of n nodes has depth n, which is also the maximum recursion depth — fine here, dangerous in shallower stacks.",
      "Balanced and skewed inputs cost the same O(n) visits but very different stack profiles — worth mentioning when asked about space.",
    ],
    ladder: [
      { title: "Brute force — enumerate root-to-leaf paths", body: "DFS collecting every path and reporting the longest. Correct, but it builds lists and must special-case 'leaf' (both children None); all that machinery computes a number the plain recursion returns in two lines." },
      { title: "BFS by levels", body: "A queue processes one generation at a time; the number of drained levels is the depth. Iterative, recursion-free, and the same loop powers level-order traversal — a good answer when the interviewer bans recursion." },
      { title: "The optimal idea — the recursive definition itself", body: "depth(node) = 1 + max(depth(left), depth(right)) with depth(None) = 0. O(n) time, O(h) stack, no state; it is the base template that diameter, balance and max-path-sum all decorate." },
    ],
    approach: "One-line recursive depth",
    code: `def maxDepth(root):
    if root is None:        # an empty tree contributes 0 levels
        return 0
    return 1 + max(         # this node adds one level…
        maxDepth(root.left),
        maxDepth(root.right),
    )                       # …on top of the deeper subtree`,
    walkthrough: [
      "The recursion runs bottom-up: calls descend until they hit None, return 0, and each returning frame adds 1 for itself. For [3,9,20,null,null,15,7] the 9-branch returns 1, the 20-branch returns 2 (its children contribute 1 each), and the root returns 1 + max(1, 2) = 3. Nothing else happens — no counters, no visited set.",
      "max() is evaluated after both calls return, so the traversal is a full post-order sweep and each node is computed exactly once — that is the O(n) time bound, and there is no repeated work to optimize away. The function is pure: same input, same output, no mutation, which makes it trivial to reason about and to test.",
      "The BFS alternative counts drained generations and produces the same number, at the cost of holding a whole level in memory. Name it as the answer 'if recursion is off the table' — and as the cross-check that tree depth equals number of levels, two mental models agreeing on one integer.",
    ],
    time: "O(n) — every node computed once",
    space: "O(h) stack — O(n) worst case for a skewed tree",
    followUps: [
      "Minimum depth (nearest leaf) is the trap variant: swap max for min but SKIP empty subtrees, or [1,2] wrongly reports 1.",
      "N-ary version: 1 + max over the children's depths (0 for a leaf) — the same template with a children list.",
    ],
    related: ["diameter-of-binary-tree", "balanced-binary-tree", "minimum-depth-of-binary-tree"],
    verify: {
      fn: "maxDepth",
      wrap: "tree",
      cases: [
        { args: [[3, 9, 20, null, null, 15, 7]], expect: 3 },
        { args: [[]], expect: 0 },
        { args: [[1]], expect: 1 },
        { args: [[1, null, 2]], expect: 2 },
        { args: [[1, 2, null, 3, null, 4]], expect: 4 },
      ],
    },
    xp: 10,
  },
  {
    slug: "diameter-of-binary-tree",
    statement:
      "Return the number of edges on the longest path between any two nodes of a binary tree. The path need not pass through the root — it may bend at any node, and its endpoints can be anywhere in the tree.",
    examples: [
      { input: "root = [1,2,3,4,5]", output: "3", explanation: "The path 4 → 2 → 1 → 3 uses 3 edges." },
      { input: "root = [1,2]", output: "1" },
      { input: "root = [1,2,null,3]", output: "2", explanation: "A left-leaning chain is itself the longest path." },
    ],
    constraints: ["1 <= number of nodes <= 10^4", "-100 <= Node.val <= 100"],
    breakdown: [
      "Reframe the question around shape: any path between two nodes in a tree bends at exactly one apex node, and its edge length is (deepest left leg from the apex) + (deepest right leg). So the answer is the maximum of left + right over all nodes — a per-node quantity folded into a global best. Every path is counted exactly once because every path has exactly one bend.",
      "The subtlety is that what a node RETURNS to its parent differs from what it RECORDS for itself. The parent may continue the path through at most one child leg, so the return value is 1 + max(left, right) — a straight leg. Returning the bent left + right upward would let a path use both arms and double-count; this 'carry the gain, record the bend' split is the exact skeleton binary-tree-maximum-path-sum reuses at Hard difficulty.",
      "The naive misstep is computing maxDepth from every node and summing the two child depths — O(n²) on skewed trees, because heights get re-derived that the recursion already computed. One post-order pass touches each node once and gets both jobs done.",
    ],
    edges: [
      "The answer counts EDGES: [1,2,3,4,5] is 3, not 4 — the off-by-one people actually ship.",
      "A single node has diameter 0 (a one-node path has no edges); an empty tree is 0 as well.",
      "Skewed chains are the extreme: [1,2,null,3] has diameter 2 — the chain itself is the longest path.",
      "Node values are noise here: the path is chosen by structure, unlike maximum-path-sum where values rule.",
    ],
    ladder: [
      { title: "Brute force — depth from every node", body: "For each node compute maxDepth(left) + maxDepth(right) and take the global max. O(n²) worst case: every ancestor recomputes the heights its descendants just computed." },
      { title: "Memoize heights, then scan", body: "One pass fills a node → height table; a second pass applies left + right per node. O(n) time and space, but two traversals and a table the single-pass version doesn't need." },
      { title: "The optimal idea — fold the bend into the height pass", body: "While returning heights post-order, update a nonlocal best with lh + rh at each node. One traversal, O(1) extra state, and the pattern generalizes to weighted paths (max-path-sum) and N-ary trees (top-two child legs)." },
    ],
    approach: "Nonlocal best inside a height recursion",
    code: `def diameterOfBinaryTree(root):
    best = 0                        # longest bent path seen so far
    def height(node):
        nonlocal best
        if node is None:
            return 0                # no node, no edge
        lh = height(node.left)      # straight edges down the left leg
        rh = height(node.right)
        best = max(best, lh + rh)   # the path that BENDS at this node
        return 1 + max(lh, rh)      # the straight leg we hand upward
    height(root)
    return best`,
    walkthrough: [
      "height(node) answers 'longest downward path in edges from this node'. The bend candidate at node is lh + rh: down the left leg, up through node, down the right leg. Since every path bends somewhere, the max over all bend candidates equals the max over all paths — the global witness is guaranteed to be visited.",
      "The return value is deliberately not the bend: a path continuing through node's parent cannot use both legs, so the parent receives 1 + max(lh, rh). Handing lh + rh upward would silently allow two-legged paths at every level — the wrong answer that happens to pass shallow samples.",
      "Trace [1,2,3,4,5]: leaves 4 and 5 return 1; node 2 records 1 + 1 = 2 and returns 2; node 3 returns 1; the root records 2 + 1 = 3 and returns 3. best = 3, every node touched once — O(n) time, O(h) stack.",
    ],
    time: "O(n) — one post-order pass",
    space: "O(h) stack — O(n) worst case on a skewed tree",
    followUps: [
      "Return the actual path: remember the node where lh + rh peaked, then walk down the longer leg twice to recover both endpoints.",
      "N-ary diameter: the bend at a node is the sum of its two LONGEST child legs — same nonlocal skeleton with a top-2 selection.",
    ],
    related: ["maximum-depth-of-binary-tree", "binary-tree-maximum-path-sum", "diameter-of-n-ary-tree"],
    verify: {
      fn: "diameterOfBinaryTree",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 3, 4, 5]], expect: 3 },
        { args: [[]], expect: 0 },
        { args: [[1]], expect: 0 },
        { args: [[1, 2]], expect: 1 },
        { args: [[1, 2, null, 3]], expect: 2 },
      ],
    },
    xp: 10,
  },
  {
    slug: "balanced-binary-tree",
    statement:
      "A binary tree is height-balanced when every node's two subtrees differ in height by at most one. Given a root, decide whether the whole tree is balanced. An empty tree counts as balanced.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "true" },
      { input: "root = [1,2,2,3,3,null,null,4,4]", output: "false", explanation: "The two 4s sit four levels deep while the right arm ends two levels down — the root looks fine, a node below does not." },
      { input: "root = []", output: "true" },
    ],
    constraints: ["0 <= number of nodes <= 5000", "-10^4 <= Node.val <= 10^4"],
    breakdown: [
      "The definition is local but the question is global: EVERY node's subtrees must differ by at most one, not just the root's. The [1,2,2,3,3,null,null,4,4] example exists because the root looks fine while a node two levels down is badly lopsided — any solution that checks one node and recurses 'optimistically' is checking the wrong thing.",
      "The efficient shape merges two questions into one return value. A subtree reports either its height (if it is internally balanced) or a sentinel −1 (if anything inside is broken). A parent that receives −1 bails immediately, so once a violation is found the rest of the tree is never re-examined — early termination is built into the type of the return value, not bolted on with flags.",
      "The quadratic misstep is a top-down isBalanced(node) that calls a separate height(node) at every level: each node's subtree is walked once for its own height and again inside every ancestor's check — O(n²) on a chain. The height-or-−1 trick collapses this to one pass and is the interview-standard upgrade.",
    ],
    edges: [
      "Empty tree and single node are balanced — both fall out of the None base case with no special code.",
      "Root-level balance proves nothing: [1,2,2,3,3,null,null,4,4] has a perfectly split root and is still invalid two levels down.",
      "On a skewed chain the violation is detected at the deepest triple; −1 then propagates to the top without visiting the remaining arms.",
      "Heights can be counted in nodes or edges — |lh − rh| ≤ 1 is unchanged, but stay consistent within one implementation.",
    ],
    ladder: [
      { title: "Brute force — recompute heights top-down", body: "isBalanced(node) = |height(l) − height(r)| ≤ 1 and both children balanced, with height() a full subtree walk. O(n²) worst case — the chain again." },
      { title: "Memoized heights", body: "Compute every height once into a dict, then one extra pass applies the check per node. O(n), but two traversals plus a table." },
      { title: "The optimal idea — height-or-−1", body: "One post-order pass returns the height of healthy subtrees and −1 the instant anything inside breaks. Parents propagate −1 untouched: O(n) time, early exit, no memo, no flags." },
    ],
    approach: "Height-or-−1 single pass",
    code: `def isBalanced(root):
    def check(node):
        if node is None:
            return 0                        # empty subtree: height 0, fine
        lh = check(node.left)
        if lh == -1:
            return -1                       # left already broken — bail
        rh = check(node.right)
        if rh == -1:
            return -1
        if abs(lh - rh) > 1:
            return -1                       # this node breaks the contract
        return 1 + max(lh, rh)              # still healthy: report height
    return check(root) != -1`,
    walkthrough: [
      "check() is just height() with a poison value: a clean subtree returns its ordinary height, a broken one returns −1 forever after. Because −1 is never a legal height, the sentinel is unambiguous, and the two early-bail lines keep a found violation from costing any further traversal.",
      "Order matters: recurse left, test −1, recurse right, test −1, and only then compare the two heights. If the left arm is broken the right arm is never entered — for [1,2,2,3,3,null,null,4,4] the left 2-node faces heights 2 and 0, returns −1, and the root stops immediately without reading its right subtree at all.",
      "Healthy nodes do real work: the final line is the plain height recurrence, which is what makes this one pass rather than two. O(n) time, O(h) stack, and the boolean answer falls out of the top-level return value with no auxiliary state to clean up.",
    ],
    time: "O(n) — each node visited at most once",
    space: "O(h) stack — O(n) worst case on a skewed chain",
    followUps: [
      "If it is unbalanced, how many rotations would an AVL rebalance need — or how many nodes to remove? Interviewers push from 'is it balanced' toward 'what does fixing it cost'.",
      "N-ary balance: same sentinel trick, comparing the max and min child heights.",
    ],
    related: ["maximum-depth-of-binary-tree", "diameter-of-binary-tree"],
    verify: {
      fn: "isBalanced",
      wrap: "tree",
      cases: [
        { args: [[3, 9, 20, null, null, 15, 7]], expect: true },
        { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expect: false },
        { args: [[]], expect: true },
        { args: [[1, 2, null, 3]], expect: false },
        { args: [[1, 2, 2, 3, null, null, 3]], expect: true },
      ],
    },
    xp: 10,
  },
  {
    slug: "same-tree",
    statement:
      "Given the roots of two binary trees, decide whether they are IDENTICAL: the same shape and the same node values in the same positions. Two empty trees are identical.",
    examples: [
      { input: "p = [1,2,3], q = [1,2,3]", output: "true" },
      { input: "p = [1,2], q = [1,null,2]", output: "false", explanation: "Same values, different shape — the 2 hangs left in p and right in q." },
      { input: "p = [1,2,1], q = [1,1,2]", output: "false", explanation: "Values are positional: the left children 2 and 1 disagree." },
    ],
    constraints: ["0 <= nodes in each tree <= 100", "-10^4 <= Node.val <= 10^4"],
    breakdown: [
      "Identity of two structures is a pairwise recursion with exactly four cases: both None (match — two empty trees are identical), exactly one None (mismatch — shapes differ), both alive with equal values (recurse on both child pairs), both alive with different values (mismatch). Enumerating the cases IS the solution; the code is a transcription.",
      "Order the checks so 'both None' is tested before 'one is None'. After the first test, the second branch knows exactly one side is alive, so the value comparison that follows can never touch a None.val — the crash-shaped bug in this problem is a misordered case analysis, not subtle logic.",
      "Duplicate values across a tree are a non-issue because the comparison is positional: p's left child is compared with q's left child, not 'some node with the same value somewhere'. The iterative alternative — two synchronized BFS queues of pairs — produces identical verdicts but hides the four cases inside loop conditions; the recursion wears them on its sleeve.",
    ],
    edges: [
      "Both trees empty → true; this case must not crash on None.val.",
      "One empty, one not → false — the shapes differ at the very first comparison.",
      "Same shape, different values ([1,2,1] vs [1,1,2]) → false: values are positional.",
      "Same values, different shape ([1,2] vs [1,null,2]) → false: shape is part of identity.",
    ],
    ladder: [
      { title: "Brute force — serialize and compare", body: "Emit each tree's level-order or (value, position) encoding and compare the results. Correct only if the encoding records null placeholders — otherwise two different shapes can collide. O(n) extra space for a comparison the recursion does in place." },
      { title: "Synchronized BFS", body: "Walk both trees with paired queue entries; each step pops (a, b), validates it, then enqueues (a.left, b.left) and (a.right, b.right). Iterative and stack-safe, at the cost of case-analysis clarity." },
      { title: "The optimal idea — four-case recursion", body: "same(p, q): both None → true; one None → false; else p.val == q.val and same on both child pairs. O(min(n, m)) with early exit on the first disagreement — the same helper subtree-of-another-tree reuses verbatim." },
    ],
    approach: "Four-case pairwise recursion",
    code: `def isSameTree(p, q):
    if p is None and q is None:
        return True                  # both ran out together — identical
    if p is None or q is None:
        return False                 # exactly one ran out — shapes differ
    return (p.val == q.val                     # values must agree here,
            and isSameTree(p.left, q.left)     # left arms must match,
            and isSameTree(p.right, q.right))  # right arms must match`,
    walkthrough: [
      "The first two lines partition the input into the only three shapes that matter: both exhausted (agree), exactly one exhausted (disagree), both alive (defer downward). Because 'both None' is handled first, the 'one None' branch is really 'exactly one None' — which is what makes the subsequent p.val dereference safe.",
      "Python's 'and' short-circuits, so the first failing comparison abandons the remaining traversals — early exit for free. On [1,2,1] vs [1,1,2] the roots agree, then left children 2 vs 1 end the computation before the right arms are visited at all.",
      "Each node of both trees is visited at most once: O(min(n, m)) when they diverge early, O(n) when identical, O(h) stack. If recursion is unwelcome, the paired-queue BFS is the same algorithm with the call stack made explicit — saying that equivalence out loud demonstrates you understand both.",
    ],
    time: "O(min(n, m)) — stops at the first disagreement",
    space: "O(h) stack — height of the paired descent, O(n) worst case",
    followUps: [
      "Structure-only check (ignore values): drop the p.val == q.val term — the same code then answers 'same shape?'.",
      "Mirror-sameness (symmetric tree): compare p.left with q.right — that one twist turns this problem into LeetCode 101.",
    ],
    related: ["subtree-of-another-tree", "symmetric-tree"],
    verify: {
      fn: "isSameTree",
      wrap: "treeTwo",
      cases: [
        { args: [[1, 2, 3], [1, 2, 3]], expect: true },
        { args: [[1, 2], [1, null, 2]], expect: false },
        { args: [[1, 2, 1], [1, 1, 2]], expect: false },
        { args: [[], []], expect: true },
        { args: [[], [1]], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "subtree-of-another-tree",
    statement:
      "Given the roots of two binary trees, decide whether subRoot is a subtree of root: some node in root (possibly the root itself) starts a subtree structurally identical to subRoot, values included.",
    examples: [
      { input: "root = [3,4,5,1,2], subRoot = [4,1,2]", output: "true", explanation: "The node 4 in root starts an exact copy of subRoot." },
      { input: "root = [3,4,5,1,2,null,null,null,null,1], subRoot = [4,1,2]", output: "false", explanation: "The candidate subtree carries an extra left child under its 2." },
      { input: "root = [1,1], subRoot = [1]", output: "true" },
    ],
    constraints: ["1 <= nodes in root <= 2000", "1 <= nodes in subRoot <= 1000", "-10^4 <= Node.val <= 10^4"],
    breakdown: [
      "The problem decomposes into two clean recursions with distinct jobs. same(a, b) answers 'are these two trees identical' — the four-case logic of same-tree, unchanged. isSubtree(root, sub) enumerates anchors: try same at the current node, else look in the left arm, else the right arm. Neither recursion does the other's job, which is what keeps the code honest.",
      "The identity check must be strict shape-and-value equality. The classic bug is writing a 'contains these values along some path' recursion, which accepts near-misses; the second sample — a candidate subtree carrying one extra leaf under its 2 — exists precisely to catch that. Equality has to reach the bottom of BOTH trees simultaneously: every arm must end in double-None together.",
      "Complexity is worth pre-computing out loud: at most n anchors (n = size of root), each judged in O(m) (m = size of subRoot) — O(n·m) worst case, about 2·10^6 node comparisons at the given limits. That is comfortably fast here, and it is also the number to beat in the follow-up conversation about serialization + KMP or merkle hashing.",
    ],
    edges: [
      "Identical trees: the very first anchor (root vs subRoot) succeeds immediately.",
      "Duplicated values: [1,1] with subRoot [1] is true — anchors are tried at every node, not just the first value match.",
      "Near-miss subtrees (a matching prefix with one extra leaf) must fail: equality runs to both bottoms.",
      "Constraints pin subRoot to ≥ 1 node, but the 'no anchor left → match only an empty pattern' guard keeps empty-root cases total.",
    ],
    ladder: [
      { title: "Brute force — serialize every subtree", body: "Encode root and every subtree to strings; test whether subRoot's encoding appears among them. O(n·m) space in the worst case and a hand-rolled serializer with null markers — correct but heavy." },
      { title: "Merkle-style subtree hashing", body: "Hash each node bottom-up from (val, left-hash, right-hash); equal subtrees share hashes, so the search becomes a set lookup per node. O(n) after hashing — elegant, but collision handling and hash design become the interview." },
      { title: "The optimal idea — same() at every anchor", body: "Lift the identical-tree check in unchanged and try it at each node of root, short-circuiting on the first hit. O(n·m) time, O(h) space, zero infrastructure — the expected answer." },
    ],
    approach: "Anchor recursion reusing the identical-tree check",
    code: `def isSubtree(root, subRoot):
    def same(a, b):
        if a is None and b is None:
            return True                 # both bottoms reached together
        if a is None or b is None:
            return False                # shapes diverge — not identical
        return (a.val == b.val
                and same(a.left, b.left)
                and same(a.right, b.right))

    if root is None:                    # no anchor left…
        return subRoot is None          # …match only an empty pattern
    return (same(root, subRoot)                  # anchor HERE, or
            or isSubtree(root.left, subRoot)     # in the left arm, or
            or isSubtree(root.right, subRoot))   # in the right arm`,
    walkthrough: [
      "same() is the entire same-tree solution lifted in verbatim — the observation being that 'subtree' decomposes into 'identity, attempted at every position'. The outer call enumerates anchors top-down; the inner call judges one anchor exhaustively, all the way to paired Nones.",
      "'or' short-circuits, so the first successful anchor ends the search; failing anchors each cost O(m) before the next is tried. For [3,4,5,1,2] vs [4,1,2]: anchors at 3 and 5 die on the root value; the anchor at node 4 walks 4 → (1, 2) against the pattern and matches to the bottom — true.",
      "The near-miss variant (the sample with the extra leaf under 2) fails because same(2, 2) reaches a point where one side has a child and the other has None — the 'exactly one None' case doing its job, not an accident. Overall the search touches each of root's nodes once per failed anchor prefix: O(n·m) worst case, O(h_root + h_sub) memory.",
    ],
    time: "O(n · m) — n anchors, each judged in O(m)",
    space: "O(h_root + h_sub) — the two recursion stacks",
    followUps: [
      "O(n) follow-up (LeetCode's own): serialize both trees with null markers and run substring search (KMP) over the two strings.",
      "Many patterns, one big tree: compute merkle hashes bottom-up once; each query becomes a hash-set membership test.",
    ],
    related: ["same-tree", "symmetric-tree", "lowest-common-ancestor-of-a-binary-tree"],
    verify: {
      fn: "isSubtree",
      wrap: "treeTwo",
      cases: [
        { args: [[3, 4, 5, 1, 2], [4, 1, 2]], expect: true },
        { args: [[3, 4, 5, 1, 2, null, null, null, null, 1], [4, 1, 2]], expect: false },
        { args: [[1, 1], [1]], expect: true },
        { args: [[1, 2, 3], [2]], expect: true },
        { args: [[], [1]], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "lowest-common-ancestor-of-a-binary-search-tree",
    statement:
      "Given the root of a binary SEARCH tree and two values p and q that both occur in it, return the lowest common ancestor node: the deepest node whose subtree contains both p and q. A node counts as an ancestor of itself.",
    examples: [
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 8", output: "[6,2,8,0,4,7,9,null,null,3,5]", explanation: "6 splits 2 and 8 — the deepest node containing both." },
      { input: "root = [6,2,8,0,4,7,9,null,null,3,5], p = 2, q = 4", output: "[2,0,4,null,null,3,5]", explanation: "A node is its own ancestor: 4 lives inside 2's subtree, so 2 is the LCA." },
      { input: "root = [2,1], p = 2, q = 1", output: "[2,1]" },
    ],
    constraints: ["2 <= number of nodes <= 10^5", "-10^9 <= Node.val <= 10^9", "all node values are unique; p and q both exist and p != q"],
    breakdown: [
      "The BST ordering does all the work. At any node exactly one of three things holds: both targets are smaller (the LCA is in the left subtree), both are larger (right subtree), or the node's value lies between them — the straddle. The first straddle node is the answer: above it the two targets were still on the same side of every node, and below it they have already separated.",
      "Why is the straddle THE lowest common ancestor? Any proper ancestor above the split point has both targets in one subtree (common, but not lowest); no descendant of the split point can contain both targets (they went different ways there). The equality case — one target equals the current node — returns the node itself, since a node is its own ancestor by the problem's definition.",
      "The general-tree LCA (post-order, counting found targets) works here too but ignores the ordering gift. Also normalize the pair once with min/max: with pv ≤ qv the loop needs a single branch shape instead of four cases, and the descend decision reads off one comparison.",
    ],
    edges: [
      "One target is an ancestor of the other (p = 2, q = 4): the equality case must return the node itself, not keep descending.",
      "The targets split immediately under the root — the root is the answer and the loop exits on iteration one.",
      "The pair arrives in either order (p > q is legal): sort it once, not per iteration.",
      "Values can span ±10^9: comparisons are pure order tests, so magnitude is irrelevant (mind overflow in fixed-width languages).",
    ],
    ladder: [
      { title: "Brute force — collect both paths", body: "Two BST searches record root→p and root→q; walk the paths until they diverge; the last shared node is the LCA. O(h) time but O(h) extra space, and the walk must handle one path being a prefix of the other." },
      { title: "General-tree post-order LCA", body: "Recursion returns how many of {p, q} it found; the node where the count reaches 2 is the answer. Works for any binary tree — but it discards the ordering information a BST hands you for free." },
      { title: "The optimal idea — order-driven descent", body: "Walk from the root: both left → go left; both right → go right; straddle or hit → return the node. O(h) time, O(1) space, zero allocation — the BST performs the search itself." },
    ],
    approach: "Order-driven descent (straddle detection)",
    code: `def lowestCommonAncestor(root, p, q):
    # On LeetCode p and q are node references; all values are unique, so
    # value comparison is equivalent (the harness passes them as numbers).
    pv, qv = (p, q) if p < q else (q, p)     # keep the pair ordered
    while not (pv <= root.val <= qv):        # both targets still on one side
        root = root.left if qv < root.val else root.right
    return root                              # straddle or hit → the LCA`,
    walkthrough: [
      "The loop's invariant: both targets still live in the subtree rooted at the current node. Descending left (qv < root.val) or right (root.val < pv) preserves it because both targets sit on the same side; the loop exits exactly when the invariant can no longer be improved — the node straddles the pair or equals one of them.",
      "Trace [6,2,8,0,4,7,9,null,null,3,5] with p = 2, q = 4: pv = 2, qv = 4. Root 6 has qv < 6 → descend left to 2; 2 ≤ 2 ≤ 4 → return node 2, which serializes as [2,0,4,null,null,3,5]. Node 2 is the LCA because 4 lives in its right subtree — a node is its own ancestor.",
      "For p = 2, q = 8 the root 6 straddles at once and the answer is the whole tree; for p = 3, q = 5 the descent walks 6 → 2 → 4 and returns 4. Each step discards half the remaining tree: O(h) comparisons, no memory, no recursion — the entire solution lives in the loop condition.",
    ],
    time: "O(h) — one comparison per level",
    space: "O(1) — iterative descent, no allocation",
    followUps: [
      "Same question on a general binary tree (no ordering): switch to the post-order found-count LCA — O(n) instead of O(h).",
      "With parent pointers: climb from p and q to the root collecting paths, or alternate pointers until they meet (the linked-list-intersection trick).",
    ],
    related: ["lowest-common-ancestor-of-a-binary-tree", "validate-binary-search-tree", "kth-smallest-element-in-a-bst"],
    verify: {
      fn: "lowestCommonAncestor",
      wrap: "tree",
      cases: [
        { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 8], expect: [6, 2, 8, 0, 4, 7, 9, null, null, 3, 5] },
        { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 2, 4], expect: [2, 0, 4, null, null, 3, 5] },
        { args: [[6, 2, 8, 0, 4, 7, 9, null, null, 3, 5], 3, 5], expect: [4, 3, 5] },
        { args: [[2, 1], 2, 1], expect: [2, 1] },
        { args: [[45, 30, 60, 20, 40, 50, 70], 20, 40], expect: [30, 20, 40] },
      ],
    },
    xp: 20,
  },
  {
    slug: "binary-tree-level-order-traversal",
    statement:
      "Return the values of a binary tree level by level: the root's row first, then its children left-to-right, and so on — one inner list per level. An empty tree yields an empty list.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[9,20],[15,7]]" },
      { input: "root = [1,2,3,4,null,null,5]", output: "[[1],[2,3],[4,5]]", explanation: "Level 2 mixes a left-only and a right-only child." },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["0 <= number of nodes <= 2000", "-1000 <= Node.val <= 1000"],
    breakdown: [
      "BFS is the natural tool, but the question adds structure vanilla BFS doesn't emit: grouping by level. The fix is to make the generation a first-class object — hold exactly one level in a list, emit its values, then build the next list from its children. Instead of dequeuing one node at a time, you process a whole generation per iteration, and the loop terminates when a generation comes back empty.",
      "Why generation-slicing beats the classic null-marker scheme: inserting None sentinels between levels works but invites subtle bugs (marker placement, doubled markers, infinite loops). The level-list version has no sentinels to misplace, and its invariant is explicit: at the top of each iteration, the list holds the complete k-th generation, left to right.",
      "The DFS alternative threads a depth index and appends values into out[depth] — equally valid, and a nice demonstration that grouping is orthogonal to traversal order. The misstep to avoid is losing left-to-right order inside a level: children must be gathered per node left-before-right, which the rebuild comprehension below makes structural rather than lucky.",
    ],
    edges: [
      "Empty tree → [] — guard before the loop, not inside it.",
      "Single node → [[1]]: the loop must emit the root level before discovering there is no next generation.",
      "Mixed one-sided levels: [1,2,3,4,null,null,5] has a left-heavy branch and a right child on the same level — both patterns must survive.",
      "A perfect tree's last level holds roughly half the nodes: the next-level list is rebuilt per level, but total work stays O(n).",
    ],
    ladder: [
      { title: "Brute force — depth-bucketed DFS", body: "Record (depth, value) pairs from a DFS, then group by depth into the answer. Three conceptual passes for what BFS does in one; correct but heavier." },
      { title: "BFS with None sentinels", body: "Enqueue a marker between levels and split the output stream on markers. Works, but sentinel management leaks into every level and is the classic source of subtle queue bugs." },
      { title: "The optimal idea — generation slicing", body: "Keep a list holding exactly the current level; emit, then rebuild from left-to-right children. One pass, no sentinels, and the SAME loop with one line changed solves right-side view." },
    ],
    approach: "Level-list BFS (generation slicing)",
    code: `def levelOrder(root):
    if root is None:
        return []
    out, level = [], [root]          # level = the complete current generation
    while level:
        out.append([n.val for n in level])
        level = [c                   # children of this generation,
                 for n in level      # left node first → left-to-right order
                 for c in (n.left, n.right) if c]
    return out`,
    walkthrough: [
      "The invariant is the whole design: at the top of each iteration, the list named level holds generation k in left-to-right order. Emitting is a comprehension over vals; building generation k+1 gathers (left, right) per node, filtering out Nones so they never enter the pipeline. An empty rebuild ends the loop.",
      "Left-to-right order survives the rebuild because children are gathered in node order and, per node, left before right. For [1,2,3,4,null,null,5]: level 0 is [1]; its children rebuild [2,3]; the next rebuild collects 4 (from 2) and 5 (from 3) → [[1],[2,3],[4,5]].",
      "Every node enters exactly one level list and leaves it once: O(n) time, and the working set is one generation — O(width) — plus the output itself. The DFS-with-depth variant reaches the same grouping via out[depth].append; mention it as the recursion-flavored twin.",
    ],
    time: "O(n) — each node enters and leaves one level list",
    space: "O(n) output; working memory is one generation, O(width of the widest level)",
    followUps: [
      "Zigzag (spiral) order: reverse the emitted list on odd depths — the traversal itself never changes.",
      "Bottom-up variant: prepend each level (or build top-down and reverse once at the end).",
    ],
    related: ["binary-tree-right-side-view", "binary-tree-zigzag-level-order-traversal", "binary-tree-level-order-traversal-ii"],
    verify: {
      fn: "levelOrder",
      wrap: "tree",
      cases: [
        { args: [[3, 9, 20, null, null, 15, 7]], expect: [[3], [9, 20], [15, 7]] },
        { args: [[1, 2, 3, 4, null, null, 5]], expect: [[1], [2, 3], [4, 5]] },
        { args: [[]], expect: [] },
        { args: [[1]], expect: [[1]] },
        { args: [[1, 2, null, 3, null, 4]], expect: [[1], [2], [3], [4]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "binary-tree-right-side-view",
    statement:
      "Imagine standing to the right of a binary tree: return the values visible from that side, top to bottom. Formally, that is the rightmost node of every level. An empty tree shows nothing.",
    examples: [
      { input: "root = [1,2,3,null,5,null,4]", output: "[1,3,4]", explanation: "On the last level the 5 is hidden behind the 4." },
      { input: "root = [1,null,3]", output: "[1,3]" },
      { input: "root = []", output: "[]" },
    ],
    constraints: ["0 <= number of nodes <= 100", "-100 <= Node.val <= 100"],
    breakdown: [
      "Decode the metaphor first: 'visible from the right' means 'last node of each level' — the side view is level-order traversal wearing a costume. Generation slicing answers it directly: emit the LAST element of each level instead of the whole level. One line differs from problem 102, and that reuse is the lesson.",
      "The DFS alternative is right-first and depth-gated: visit node, then right subtree, then left, recording a value only the first time each depth is reached. Because the right arm is explored first, the first arrival at any depth is guaranteed to be that level's rightmost node — visibility is about arrival ORDER, not geometry.",
      "The misstep is 'just walk right pointers': wrong whenever a left subtree runs deeper than the right. In [1,2,3,null,5,null,4] the deepest rightmost node (4) hangs under 3 while the 2-arm contributes 5 at the same level — visibility must be computed per level, not per pointer chain.",
    ],
    edges: [
      "Empty tree → [].",
      "Deeper left subtree: [1,2,3,null,5,null,4] → [1,3,4] — part of the answer is reached only through LEFT children.",
      "Left-leaning chain [1,2,null,3] → [1,2,3]: every level's last node sits on the left side.",
      "Single node → [1] — the loop emits the root before the empty rebuild ends it.",
    ],
    ladder: [
      { title: "Brute force — full level order, then compress", body: "Solve 102, then map each level to its last element. O(n) with full per-level lists built and immediately discarded — correct, wasteful by a constant." },
      { title: "DFS right-first, depth-gated", body: "Recurse node → right → left carrying depth; append a value exactly when depth == len(out). O(n) time, O(h) memory, no level lists at all — the space-lean answer." },
      { title: "The optimal idea — BFS emitting last-of-generation", body: "The generation-slicing loop with out.append(level[-1].val). One pass, one changed line from 102, left-to-right ordering preserved by construction." },
    ],
    approach: "BFS last-of-level",
    code: `def rightSideView(root):
    if root is None:
        return []
    out, level = [], [root]
    while level:
        out.append(level[-1].val)     # the node nothing on this level hides
        level = [c                    # next generation, left→right,
                 for n in level       # so its last element is the visible one
                 for c in (n.left, n.right) if c]
    return out`,
    walkthrough: [
      "Only the emission line differs from level-order traversal: level[-1].val instead of the full list. The rebuild comprehension is untouched, so the left-to-right ordering that makes 'last' meaningful is preserved by construction rather than by luck.",
      "For [1,2,3,null,5,null,4] the generations are [1], [2,3], [5,4]; the view is 1, 3, 4. Note that 5 — visually between 2 and 3 on the page — never appears: level membership, not drawing position, decides visibility. The 4 wins level 2 because it is that level's last node in traversal order.",
      "The DFS depth-gated variant never materializes a level, which makes it the answer when the interviewer asks for O(h) auxiliary space. Both are O(n) time; choose by what the question emphasizes — structure reuse (BFS) or the arrival-order insight (DFS).",
    ],
    time: "O(n) — one pass over the tree",
    space: "O(width) for the current level — O(n) on a bushy tree; the DFS variant is O(h)",
    followUps: [
      "Left-side view: emit level[0], or mirror the DFS to left-first — the code changes by one token.",
      "Top/bottom views: track horizontal distances with an ordered map per column — the 'view' family turns into column grouping.",
    ],
    related: ["binary-tree-level-order-traversal", "binary-tree-zigzag-level-order-traversal"],
    verify: {
      fn: "rightSideView",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 3, null, 5, null, 4]], expect: [1, 3, 4] },
        { args: [[1, null, 3]], expect: [1, 3] },
        { args: [[]], expect: [] },
        { args: [[1, 2, 3, 4]], expect: [1, 3, 4] },
        { args: [[1, 2, null, 3, null, 4]], expect: [1, 2, 3, 4] },
      ],
    },
    xp: 20,
  },
  {
    slug: "count-good-nodes-in-binary-tree",
    statement:
      "Call a node GOOD when no node on the path from the root down to it is strictly greater — in other words, its value is at least the maximum of the path, itself included. Count the good nodes in a binary tree. The root is always good.",
    examples: [
      { input: "root = [3,1,4,3,null,1,5]", output: "4", explanation: "Good: the root 3, the 4, the 3 under the left 1, and the 5." },
      { input: "root = [3,3,null,4,2]", output: "3", explanation: "Equal to the running max still counts — good needs ≥, not >." },
      { input: "root = [1]", output: "1" },
    ],
    constraints: ["1 <= number of nodes <= 2000", "0 <= Node.val <= 10^4"],
    breakdown: [
      "A node is good exactly when no ancestor strictly exceeds it — which means the ONLY state that matters is the maximum value on the root-to-node path. Everything else about the path (length, shape, the other values on it) is irrelevant. So the recursion carries one extra argument down the tree: the running path max, updated as it descends.",
      "This is a top-down (pre-order) recursion — a deliberate contrast with diameter and balance, which are bottom-up. The decision 'am I good?' is made on arrival, before the children are visited; children then inherit the UPDATED max. The call stack quietly gives each root-to-node path its own copy of the max, so sibling arms can never contaminate each other — a shared mutable variable would get this wrong.",
      "The missteps: re-walking the path upward from every node to recompute its max (O(n·h)), or testing '>' instead of '>=' — equal-to-max counts as good, and the [3,3,null,4,2] sample exists to catch that. Remember the root is good by definition: seeding the max with root.val encodes it.",
    ],
    edges: [
      "The root is always good — its path max is its own value, so the seed argument is root.val.",
      "Ties count: a node equal to the running max is good (>=, not >).",
      "A strictly decreasing chain has exactly one good node (the root); a strictly increasing chain has all of them good.",
      "Constraints pin values to 0..10^4 and ≥ 1 node, but the algorithm is value-agnostic — negatives would behave identically.",
    ],
    ladder: [
      { title: "Brute force — per-node path walks", body: "For each node, walk root→node, take the max, compare. O(n·h): every node re-derives information every ancestor already computed." },
      { title: "DFS with a shared path stack", body: "Maintain the current path as a mutable stack; a node is good iff the path max ≤ its value; pop on unwind. Correct, but the shared state must be pushed and popped in perfect symmetry — early exits are where it breaks." },
      { title: "The optimal idea — thread the path max", body: "walk(node, best): good = val >= best; children get max(best, val); sum the counts. O(n) time, O(h) stack, and the parameter list documents the invariant." },
    ],
    approach: "Top-down path-max threading",
    code: `def goodNodes(root):
    def walk(node, best):                # best = max value on root→node path
        if node is None:
            return 0                     # no node, nothing to count
        good = 1 if node.val >= best else 0   # ties count as good
        best = max(best, node.val)       # children inherit the updated max
        return good + walk(node.left, best) + walk(node.right, best)
    return walk(root, root.val)          # the root is good by definition`,
    walkthrough: [
      "The invariant lives in the parameter: when walk(node, best) runs, best is exactly the maximum value on the root→node path. Line one converts the invariant into this node's verdict; line two re-establishes it for the children by folding node.val in. Nothing else is bookkeeping.",
      "Each recursive call receives its own copy of best, so the left and right arms inherit the same value at a fork but diverge afterwards — exactly the per-path semantics the definition demands. On [3,1,4,3,null,1,5]: the left arm carries best = 3, so the nested 3 is good (3 ≥ 3) while the 1 is not; the right arm's 4 raises best to 4, killing the nested 1 and admitting the 5 — four good nodes in total.",
      "The count assembles bottom-up by summing good + left + right: a pre-order decision wrapped in a post-order accumulation. O(n) time, O(h) stack; the iterative twin is a BFS whose queue carries (node, best) pairs if recursion depth is a concern.",
    ],
    time: "O(n) — one pass, constant work per node",
    space: "O(h) — one 'best' binding per stack frame",
    followUps: [
      "Return the good nodes' values, not the count: append on the good branch, or build the list bottom-up like the count.",
      "Good nodes in a BST: a node is good iff it has no strictly greater ancestor — the path max gains extra structure, but say WHY the algorithm cannot exploit it.",
    ],
    related: ["binary-tree-paths", "path-sum"],
    verify: {
      fn: "goodNodes",
      wrap: "tree",
      cases: [
        { args: [[3, 1, 4, 3, null, 1, 5]], expect: 4 },
        { args: [[3, 3, null, 4, 2]], expect: 3 },
        { args: [[1]], expect: 1 },
        { args: [[2, null, 4, null, 10, null, 9, null, 3]], expect: 3 },
        { args: [[3, 3, 3]], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "validate-binary-search-tree",
    statement:
      "Decide whether a binary tree satisfies the binary-search-tree invariant: for EVERY node, all values in its left subtree are strictly smaller and all values in its right subtree are strictly larger. Checking each node against its immediate children is not enough — the invariant binds whole subtrees.",
    examples: [
      { input: "root = [2,1,3]", output: "true" },
      { input: "root = [5,1,4,null,null,3,6]", output: "false", explanation: "3 sits in the root's LEFT subtree, so it must also be < 5 — being < 4 is not enough." },
      { input: "root = [2,2,2]", output: "false", explanation: "Strict ordering: duplicates violate it." },
    ],
    constraints: ["1 <= number of nodes <= 10^4", "-2^31 <= Node.val <= 2^31 - 1"],
    breakdown: [
      "The correct subproblem: a subtree is a valid BST only inside a WINDOW (lo, hi) inherited from its ancestors — every node must satisfy lo < val < hi, and the window tightens on each descent (the left child's hi becomes the parent's value; the right child's lo does the same). Checking only parent-child pairs misses exactly the violations where a grandchild breaks an ANCESTOR's bound — the [10,5,15,null,null,6,20] shape, where 6 is fine against its parent 15 but violates the root's 10.",
      "Why not 'max of left subtree < node < min of right subtree'? It is equivalent, but recomputing subtree extrema per node is O(n²) naive, and the bottom-up (min, max, valid) triple that fixes it is clunkier than threading a window. The window does constant work per node and fails fast: the first out-of-window value ends the traversal.",
      "The elegant alternative: an inorder traversal of a valid BST visits values in strictly increasing order, so one 'prev' variable and a prev < current check at each visit decide it. One pass, no window threading, and it doubles as the key fact behind 'recover a BST from two swapped nodes'. Both approaches are O(n); the window version works from any traversal order, the inorder version is order-locked.",
    ],
    edges: [
      "Strictness: duplicates fail — [2,2,2] is invalid because 2 is not < 2. Compare with < and >, never ≤/≥.",
      "The ancestor-bound trap: [5,1,4,null,null,3,6] passes every parent-child check (3 < 4!) and is still invalid — 3 must also be < 5.",
      "Boundary values: use −∞/+∞ sentinels (or None-checked bounds) so a legitimate ±2^31 node value never collides with the initial window.",
      "An empty tree is vacuously valid — the None base case returns true for free, even though constraints promise ≥ 1 node.",
    ],
    ladder: [
      { title: "Brute force — subtree extrema", body: "For each node compute max(left subtree) and min(right subtree) and compare against node.val. O(n²) if extrema are recomputed per node; correct, but every subtree is scanned by all of its ancestors." },
      { title: "Bottom-up (min, max, valid) triple", body: "One post-order pass where each subtree returns its value range; the parent folds the two ranges together. O(n), but a three-part return value and awkward empty-subtree handling." },
      { title: "The optimal idea — inherited window", body: "Pass (lo, hi) down; each child tightens one side. Constant work per node, early false exit, and the inorder-prev variant as the one-variable alternative." },
    ],
    approach: "Bounds recursion (inherited window)",
    code: `def isValidBST(root):
    def ok(node, lo, hi):            # node must satisfy lo < val < hi
        if node is None:
            return True              # empty space fits any window
        if not (lo < node.val < hi): # violates the inherited window → done
            return False
        return (ok(node.left, lo, node.val)      # left: capped by this value
                and ok(node.right, node.val, hi))  # right: floored by it
    return ok(root, float("-inf"), float("inf"))`,
    walkthrough: [
      "The window (lo, hi) is the accumulated promise made by every ancestor: 'everything below here lies strictly between these bounds'. Each descent replaces one side with the current value — left child inherits (lo, node.val), right child inherits (node.val, hi). A violation trips the two-sided check at the node where the promise is broken, not where it was made.",
      "Trace [5,1,4,null,null,3,6]: node 4 inherits (5, +∞); its left child 3 is checked against lo = 5 and fails immediately. A child-only checker compared 3 < 4 and sailed past the real violation — which is why this sample is in the test set. Similarly, [10,5,15,null,null,6,20] fails when 6 inherits the window (10, 15).",
      "Strict inequalities make duplicate values fail automatically, matching the BST contract. The inorder variant: walk node → left → visit → right holding one prev variable; any prev ≥ current invalidates. It is the version to whiteboard when asked 'what invariant does a BST really encode?' — sorted inorder is the answer.",
    ],
    time: "O(n) — constant work per node, early exit on the first violation",
    space: "O(h) stack — O(n) worst case on a skewed tree",
    followUps: [
      "Inorder-prev one-pass variant: same complexity, different insight — name it even if you code the window version.",
      "Two swapped nodes (recover-a-BST): inorder finds the one or two inversions; swap the values back — the classic extension.",
    ],
    related: ["kth-smallest-element-in-a-bst", "lowest-common-ancestor-of-a-binary-search-tree", "binary-tree-inorder-traversal"],
    verify: {
      fn: "isValidBST",
      wrap: "tree",
      cases: [
        { args: [[2, 1, 3]], expect: true },
        { args: [[5, 1, 4, null, null, 3, 6]], expect: false },
        { args: [[10, 5, 15, null, null, 6, 20]], expect: false },
        { args: [[2, 2, 2]], expect: false },
        { args: [[]], expect: true },
        { args: [[1, null, 1]], expect: false },
      ],
    },
    xp: 20,
  },
  {
    slug: "kth-smallest-element-in-a-bst",
    statement:
      "Given the root of a binary search tree and an integer k (1-indexed), return the k-th smallest value stored in the tree. A valid k always exists.",
    examples: [
      { input: "root = [3,1,4,null,2], k = 1", output: "1" },
      { input: "root = [5,3,6,2,4,null,null,1], k = 3", output: "3", explanation: "Inorder visits 1, 2, 3, 4, 5, 6 — the third value is 3." },
      { input: "root = [3,1,4,null,2], k = 4", output: "4" },
    ],
    constraints: ["1 <= k <= number of nodes <= 10^4", "-10^5 <= Node.val <= 10^5"],
    breakdown: [
      "The fact that unlocks everything: an INORDER traversal of a BST emits values in ascending order. 'k-th smallest' is therefore 'stop the inorder counter at k' — no sorting, no extra array, just a budget of k decrements. The subproblem writes itself: everything in the left subtree is smaller, the node itself spends one unit of budget, the right subtree continues.",
      "The recursive counter version works but hides its own stop condition: once the budget empties, every pending frame must ALSO know to do nothing, which means checking a flag at every level — easy to fumble. The iterative stack version makes the stop physical: when k hits zero you return from inside the loop, and the remaining stack is simply abandoned. The stack holds the ancestors whose left arms are still being drained — the inorder state machine made visible.",
      "Materializing the full inorder list is correct but wastes the point: O(n) time AND O(n) space when only k values were ever needed. The follow-up about frequent inserts/deletes points at the real production answer — nodes augmented with subtree sizes so rank selection is O(h) per query — name it, don't build it.",
    ],
    edges: [
      "k = 1 → the leftmost node's value; k = n → the rightmost's. Both boundaries exercise the slide-then-pop loop.",
      "A right-leaning tree [1,null,2]: the first slide pushes one node and immediately pops it — no wasted work.",
      "Skewed chains make recursion depth = n, which is the practical reason to prefer the explicit stack here.",
      "k is 1-indexed: the off-by-one shows up as returning the (k+1)-th smallest — test both k = 1 and k = n.",
    ],
    ladder: [
      { title: "Brute force — collect and index", body: "Full inorder into a list; return list[k − 1]. O(n) time and space, no early stop — correct, and blind to the structure that makes the problem interesting." },
      { title: "Recursive inorder with a mutable counter", body: "Decrement at each visit; return when it hits zero. Works, but every pending frame needs the 'already answered' check — the sentinel is easy to forget and the bug is silent." },
      { title: "The optimal idea — explicit-stack inorder", body: "Slide to the leftmost pushing the spine; each pop emits the next-smallest value; return on the k-th pop. O(h + k) time, O(h) space, early stop by construction." },
    ],
    approach: "Iterative inorder with an explicit stack",
    code: `def kthSmallest(root, k):
    stack = []                    # ancestors whose left arms are pending
    cur = root
    while cur or stack:
        while cur:                # slide down the left edge,
            stack.append(cur)     # remembering every node passed
            cur = cur.left
        cur = stack.pop()         # next value in sorted order
        k -= 1                    # spend one unit of budget
        if k == 0:
            return cur.val        # the k-th pop is the answer
        cur = cur.right           # resume with this node's right subtree
    return -1                     # unreachable for 1 <= k <= n`,
    walkthrough: [
      "The stack IS the inorder state machine: everything on it is an ancestor whose left subtree has been fully emitted but which has not itself been emitted. Sliding left pushes the spine; popping emits; cur = cur.right moves to the next unexplored region. The loop condition 'cur or stack' covers both mid-descent and between-subtrees states.",
      "Trace [5,3,6,2,4,null,null,1] with k = 3: push 5, 3, 2, 1 (the left spine); pop 1 (k → 2); 1 has no right child, so pop 2 (k → 1); 2 has no right child, so pop 3 — k hits 0 and 3 returns. Four of six nodes touched: the early stop is visible in the trace, and a k = 6 query would drain the whole tree.",
      "Complexity is O(h + k): h to reach the smallest element, then k pops; each node is pushed and popped at most once overall, so the worst case is O(n). Space is one left spine, O(h). The recursive counter has identical bounds but needs the answered-flag; the explicit stack stops by construction — that difference is the whole argument for it.",
    ],
    time: "O(h + k) — slide down once, pop k times (O(n) worst case)",
    space: "O(h) — the stack holds one left spine",
    followUps: [
      "Frequent inserts/deletes: augment nodes with subtree sizes; select by rank in O(h) per query — the follow-up LeetCode itself poses.",
      "k-th largest: mirror the traversal (right → node → left), or query the (n − k + 1)-th smallest.",
    ],
    related: ["validate-binary-search-tree", "binary-tree-inorder-traversal", "kth-largest-element-in-a-stream"],
    verify: {
      fn: "kthSmallest",
      wrap: "tree",
      cases: [
        { args: [[3, 1, 4, null, 2], 1], expect: 1 },
        { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expect: 3 },
        { args: [[1], 1], expect: 1 },
        { args: [[3, 1, 4, null, 2], 4], expect: 4 },
        { args: [[1, null, 2], 2], expect: 2 },
      ],
    },
    xp: 20,
  },
  {
    slug: "construct-binary-tree-from-preorder-and-inorder-traversal",
    statement:
      "Given two integer arrays — the preorder and inorder traversals of the SAME binary tree — rebuild the tree. All values are distinct and the traversals are guaranteed consistent. Return the root of the reconstructed tree.",
    examples: [
      { input: "preorder = [3,9,20,15,7], inorder = [9,3,15,20,7]", output: "[3,9,20,null,null,15,7]" },
      { input: "preorder = [-1], inorder = [-1]", output: "[-1]" },
      { input: "preorder = [1,2,4,5,3,6,7], inorder = [4,2,5,1,6,3,7]", output: "[1,2,3,4,5,6,7]" },
    ],
    constraints: ["1 <= preorder.length == inorder.length <= 2000", "all values are distinct", "preorder and inorder are traversals of the same tree"],
    breakdown: [
      "Two facts pin the whole reconstruction. Preorder's FIRST element is always the root. Inorder's layout is [left subtree | root | right subtree], so the root's position m in inorder tells you exactly how many nodes the left subtree owns — and therefore where preorder's next chunk ends. Recurse on the two halves; with distinct values the construction is unique.",
      "Two efficiency details separate the O(n) answer from the O(n²) one. Finding m by scanning inorder per call is the quadratic trap; a value → index hash map answers each lookup in O(1). And slicing arrays per call copies O(n) per level — passing (lo, hi) WINDOWS into inorder plus one shared pointer into preorder avoids all copying.",
      "The classic bug is recursion order: preorder is root, LEFT, right, so the left rebuild must consume the shared preorder pointer BEFORE the right rebuild does. Get that backwards and values land in mirrored positions — a nasty bug because the result is still a plausible tree that round-trips ITS OWN traversals, just not the given ones.",
    ],
    edges: [
      "Single element: [-1]/[-1] → a one-node tree; the base case (lo > hi) never fires.",
      "Left chain ([1,2,3] / [3,2,1]) and right chain ([1,2,3] / [1,2,3]): the split point sits at an end of the window both times.",
      "Distinct values are load-bearing for the hash map — with duplicates the reconstruction is not even unique.",
      "The preorder pointer is shared state across calls: closure/nonlocal (or a reversed list with pops); per-call local copies silently re-plant the same root.",
    ],
    ladder: [
      { title: "Brute force — scan and slice", body: "Linear-search the root in inorder each call; slice both arrays; recurse. O(n²) worst case from the scans and copies — fine for tiny inputs, fatal for 2000-node chains." },
      { title: "Hash map + slices", body: "The map kills the scan, but slicing still copies O(n) per level — memory churn that shows up on skewed inputs. A correct middle step if you narrate its cost." },
      { title: "The optimal idea — windows + one shared pointer", body: "Recurse over (lo, hi) windows of inorder (zero copying) and consume preorder through a single nonlocal index. O(n) time, O(n) map, O(h) stack." },
    ],
    approach: "Inorder index map + shared preorder pointer",
    code: `def buildTree(preorder, inorder):
    pos = {v: i for i, v in enumerate(inorder)}   # value → inorder index
    pre = 0                                        # next root in preorder

    def build(lo, hi):                  # builds inorder[lo..hi]
        nonlocal pre
        if lo > hi:
            return None                 # empty window → no node
        root = TreeNode(preorder[pre])  # the front of preorder is the root
        pre += 1
        m = pos[root.val]               # split point: left | root | right
        root.left = build(lo, m - 1)    # LEFT first — preorder is root,
        root.right = build(m + 1, hi)   # then left, then right
        return root

    return build(0, len(inorder) - 1)`,
    walkthrough: [
      "The invariant: build(lo, hi) consumes exactly the next (hi − lo + 1) preorder values and returns the subtree whose inorder is inorder[lo..hi]. The base case lo > hi encodes 'this arm does not exist' and is what lets leaves attach None children without special-casing.",
      "Trace [3,9,20,15,7] / [9,3,15,20,7]: root 3 (pre moves to 9), m = 1 splits the window into [9] and [15,20,7]. The left call builds 9 from a size-1 window; the right call takes 20 and splits [15] / [7]. The rebuilt tree serializes to [3,9,20,null,null,15,7] — exactly the round-trip the harness checks.",
      "The shared preorder pointer is the load-bearing detail: because build() always recurses left first, the pointer's consumption order mirrors preorder exactly, and the window sizes guarantee each value is consumed exactly once. O(n) time with the map; O(n) auxiliary for the map itself; the recursion stack is O(h).",
    ],
    time: "O(n) — one map lookup and one node per call",
    space: "O(n) for the value → index map; O(h) recursion stack",
    followUps: [
      "Postorder + inorder: the root is the LAST postorder element — consume the pointer from the back and recurse right-before-left.",
      "Preorder alone for a BST: pass down (lo, hi) value bounds and let each node claim the next element that fits — O(n) with no map.",
    ],
    related: ["construct-binary-tree-from-inorder-and-postorder-traversal", "serialize-and-deserialize-binary-tree"],
    verify: {
      fn: "buildTree",
      wrap: "treeOut",
      cases: [
        { args: [[3, 9, 20, 15, 7], [9, 3, 15, 20, 7]], expect: [3, 9, 20, null, null, 15, 7] },
        { args: [[-1], [-1]], expect: [-1] },
        { args: [[1, 2, 3], [3, 2, 1]], expect: [1, 2, null, 3] },
        { args: [[1, 2, 3], [1, 2, 3]], expect: [1, null, 2, null, 3] },
        { args: [[1, 2, 4, 5, 3, 6, 7], [4, 2, 5, 1, 6, 3, 7]], expect: [1, 2, 3, 4, 5, 6, 7] },
      ],
    },
    xp: 20,
  },
  {
    slug: "binary-tree-maximum-path-sum",
    statement:
      "A path in a binary tree is a sequence of nodes where each consecutive pair is parent-and-child and no node appears twice — it may start and end anywhere and need not pass through the root. Return the maximum possible sum of node values along such a path. At least one node is required, and values may be negative.",
    examples: [
      { input: "root = [1,2,3]", output: "6", explanation: "The path 2 → 1 → 3 bends at the root." },
      { input: "root = [-10,9,20,null,null,15,7]", output: "42", explanation: "15 → 20 → 7; the −10 is never worth including." },
      { input: "root = [-3]", output: "-3", explanation: "A path must use at least one node — even a negative one." },
    ],
    constraints: ["1 <= number of nodes <= 3·10^4", "-1000 <= Node.val <= 1000"],
    breakdown: [
      "Every path bends at exactly one apex node, so the best path THROUGH node is node.val + best-left-leg + best-right-leg, where a leg is a straight downward run. That bend total is what to RECORD at each node. What a node hands to its parent is different: the parent can extend at most one leg, so the return value is node.val + max(left-leg, right-leg). The gain-vs-turn split is the entire problem — return one thing, record another.",
      "Negative-gain pruning: if a child's best leg sums below zero, extending the path through it can only hurt, so each leg is clamped with max(gain, 0). Clamping is equivalent to letting the path simply START at the current node — which is also why single-node and all-negative trees come out right without special cases.",
      "The two missteps that survive small samples: returning the bent (both-legs) total upward — the parent would then build a path visiting a node twice; and initializing the global best to 0 — wrong the moment every node is negative, where the answer is the least-negative single node ([-3] → −3). Seed best with root.val (or −∞) and the all-negative family is safe.",
    ],
    edges: [
      "All-negative trees: the answer is a single node — clamped legs (0) plus a root.val-seeded best handle it; a 0-initialized best would lie.",
      "Single node: the path is the node itself, even when negative — 'at least one node' is mandatory.",
      "The winning path may bend deep in a subtree and never touch the root or either top-level leg.",
      "The value handed UP must be a straight leg (one side only) — the classic wrong answer that still passes shallow tests.",
    ],
    ladder: [
      { title: "Brute force — all pairs via LCA", body: "For every pair of nodes compute their unique path sum and take the max. O(n²) pairs work or worse; correct as a definition, hopeless at 3·10^4 nodes." },
      { title: "Per-node recompute", body: "For each node, walk down both subtrees for the deepest leg sums, record node.val + l + r. O(n·h): legs re-derived that ancestors already know." },
      { title: "The optimal idea — one post-order pass, gain up / bend recorded", body: "Return node.val + max(clamped legs) upward; record node.val + left + right in a nonlocal best. O(n) time, O(h) stack — diameter's skeleton with weights and pruning." },
    ],
    approach: "Post-order gain with a nonlocal bend maximum",
    code: `def maxPathSum(root):
    best = root.val                 # a path must use at least one node

    def gain(node):
        nonlocal best
        if node is None:
            return 0                # no node, no contribution
        left = max(gain(node.left), 0)    # a negative leg only hurts:
        right = max(gain(node.right), 0)  # drop it, start the path here
        best = max(best, node.val + left + right)  # the path BENDS at node
        return node.val + max(left, right)  # the straight leg handed UP

    gain(root)
    return best`,
    walkthrough: [
      "gain(node) is the best sum of a downward path that STARTS at node — the only quantity a parent can legally extend. The recorded candidate, node.val + left + right, is instead the best path whose apex is node; because every path has exactly one apex, the max over all candidates is the global answer, witnessed somewhere in the tree.",
      "Trace [-10,9,20,null,null,15,7]: node 9 records 9 (both legs clamp to 0); node 20 records 20 + 15 + 7 = 42 and hands up 35; the root's candidate is −10 + 9 + 35 = 34, which loses to 42. Note the apex of the winning path is 20, not the root — the bend can live anywhere in the tree.",
      "All-negative inputs show why the seed matters: for [-3] the only candidate is −3, recorded at the node, while gain returns −3 clamped to 0 on the way up — had best started at 0, the function would have reported 0, a path that uses no nodes at all. Every node's gain is computed once: O(n) time, O(h) stack.",
    ],
    time: "O(n) — each node's gain computed once",
    space: "O(h) stack — O(n) worst case on a skewed tree",
    followUps: [
      "Return the path itself: remember the apex of the best candidate, then re-walk down its chosen legs to collect the endpoints.",
      "Constrained variants (must include a given node, or a bounded node count): thread the constraint through the same gain recursion — the skeleton absorbs both.",
    ],
    related: ["diameter-of-binary-tree", "path-sum-iii", "lowest-common-ancestor-of-a-binary-tree"],
    verify: {
      fn: "maxPathSum",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 3]], expect: 6 },
        { args: [[-10, 9, 20, null, null, 15, 7]], expect: 42 },
        { args: [[-3]], expect: -3 },
        { args: [[2, -1]], expect: 2 },
        { args: [[-2, 6, null, 0, -6]], expect: 6 },
        { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], expect: 48 },
      ],
    },
    xp: 35,
  },
];
