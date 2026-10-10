// Deep-dives — Trees, part 2 (NC150-extras + TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const TREES_2: LcDeepDive[] = [
  {
    slug: "serialize-and-deserialize-binary-tree",
    statement:
      "Design a codec for binary trees: encode turns a tree into a single string, and decode turns that string back into the identical tree. Any unambiguous format is acceptable — the only contract is that decode(encode(t)) reproduces t exactly, for every tree including the empty one.",
    examples: [
      { input: "root = [1,2,3,null,null,4,5]", output: 'encode → "1 2 N N 3 4 N N 5 N N" (one valid format), decode → the original tree', explanation: "Preorder with an 'N' marker for every missing child rebuilds the tree deterministically — the markers record the shape, not just the values." },
      { input: "root = [-10,9,20,null,null,15,7]", output: 'encode → "-10 9 N N 20 15 7 N N N N", decode round-trips', explanation: "Minus signs and multi-digit values are why bare concatenation is ambiguous; a delimiter that can never appear inside an integer (a space) fixes that." },
      { input: "root = []", output: 'encode → "N", decode → null (the empty tree)', explanation: "The empty tree is a single null marker; decode of that marker returns null. The round-trip harness compares against the input array, so its cases exercise non-empty trees." },
    ],
    constraints: ["0 <= nodes <= 10^4", "-1000 <= Node.val <= 1000", "the pair must round-trip losslessly; any format is allowed"],
    breakdown: [
      "A serialization is only useful if it is injective: two different trees must never produce the same string. Plain preorder of values fails immediately, because [1,2] and [1,null,2] both print as '1 2'. The fix is to make missing children first-class data — emit an explicit marker for every null child, so the shape is recorded in the stream itself.",
      "Preorder-with-markers has a beautiful decode: the first token is the root's value (or the null marker), and everything after it splits into the encoding of the left subtree followed by the encoding of the right subtree. A recursive reader that consumes tokens one at a time therefore rebuilds the tree without positions or lengths — the marker structure does all the bookkeeping.",
      "BFS level-order works too, and mirrors LeetCode's own notation: emit values level by level with markers, then rebuild with a queue of pending parents. The trap to avoid in any format is delimiter-free concatenation — values like 12 and -7 are multi-character, so tokens need a separator (or length prefixes) to stay unambiguous.",
    ],
    edges: [
      "The empty tree must round-trip: it encodes to a single marker 'N' and decode of that marker returns null.",
      "Negative and multi-digit values make separators mandatory — '1-2' could mean 1,-2 or -1,2 without one.",
      "A 10^4-node skewed chain encodes to 10^4 values plus 10^4+1 markers, and the recursive decoder hits recursion depth 10^4 — production code wants an iterative reader or a raised recursion limit.",
      "Branch on the marker BEFORE calling int() — 'N' is not a parseable number.",
    ],
    ladder: [
      { title: "Brute force — print values only", body: "Flatten the values in any order and parse them back. Fails immediately: different shapes share the same value sequence ([1,2] vs [1,null,2]), so the string is ambiguous and decode is impossible. No amount of parsing rescues a format that threw away the shape." },
      { title: "BFS level-order with markers", body: "Emit the level-order array (nulls included) you already know from LeetCode notation; decode with a queue that hands children to pending parents as it walks the tokens. O(n) both ways, and the format matches the site's display — but the queue bookkeeping is fiddlier than preorder." },
      { title: "The optimal idea — preorder + null markers", body: "One recursive writer appends value-or-marker in preorder; one recursive reader consumes tokens through an iterator and builds node, then left, then right. Both directions are O(n) with minimal state, and correctness is self-evident: preorder is self-delimiting once nulls are marked." },
    ],
    approach: "Preorder with explicit null markers",
    code: `def encode(root):
    out = []
    def pre(node):
        if not node:               # a missing child is data, not absence
            out.append("N")
            return
        out.append(str(node.val))
        pre(node.left)
        pre(node.right)
    pre(root)
    return " ".join(out)           # a space can never occur inside an integer

def decode(data):
    toks = iter(data.split(" "))   # lazy cursor over the tokens
    def build():
        v = next(toks)
        if v == "N":
            return None
        node = TreeNode(int(v))
        node.left = build()        # preorder: left completes before right starts
        node.right = build()
        return node
    return build()`,
    walkthrough: [
      "encode walks the tree in preorder, appending str(val) or 'N' per position; for [1,2,3,null,null,4,5] it emits 1,2,N,N,3,4,N,N,5,N,N. The markers pin the shape: after '2 N N' the reader knows node 2 is closed and the next value belongs to 1's right subtree.",
      "decode owns one iterator over the tokens, and each build() call takes exactly the token it needs. The recursion mirrors the writer's order — value, left, right — so the two walks interlock like a zipper: whatever sequence encode produced, decode consumes in the same order.",
      "Round-trip correctness is induction on the recursion: a leaf encodes to 'v N N' and rebuilds to itself, and a subtree rebuilds correctly whenever its children do, which the recursion asserts. The driver proves it empirically — it decodes the encoding of each tree and compares the re-serialized result to the input array.",
    ],
    time: "O(n) each way — every node produces and consumes O(1) tokens",
    space: "O(n) — the token string, plus recursion depth up to O(n) on chains",
    followUps: [
      "A skewed 10^4-node chain blows Python's default recursion limit inside decode — rewrite build() with an explicit stack, or note that raising sys.setrecursionlimit is the accepted workaround.",
      "N-ary trees use the same idea with one addition: emit each node's child count (or an end-of-children marker) so the reader knows when a node's children stop — exactly how LeetCode serializes its N-ary problems.",
    ],
    related: ["encode-and-decode-strings", "serialize-and-deserialize-bst", "construct-binary-tree-from-preorder-and-inorder-traversal"],
    verify: {
      fn: "codec",
      wrap: "treeCodec",
      cases: [
        { args: [[1]], expect: [1] },
        { args: [[-10, 9, 20, null, null, 15, 7]], expect: [-10, 9, 20, null, null, 15, 7] },
        { args: [[1, 2, null, 3]], expect: [1, 2, null, 3] },
        { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [1, 2, 3, 4, 5, 6, 7] },
        { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], expect: [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1] },
      ],
    },
    xp: 35,
  },
  {
    slug: "symmetric-tree",
    statement:
      "A binary tree is symmetric when you could fold it down its middle and the halves coincide — every left subtree mirrors the right one. Given a tree, decide whether it is symmetric around its root.",
    examples: [
      { input: "root = [1,2,2,3,4,4,3]", output: "true", explanation: "Left child 2 mirrors right child 2, and their subtrees mirror pairwise: 3↔3 and 4↔4." },
      { input: "root = [1,2,2,null,3,null,3]", output: "false", explanation: "Both 3s hang on right pointers — mirrored positions would need one on each side of the fold." },
      { input: "root = []", output: "true", explanation: "An empty tree is trivially symmetric: the twin walkers immediately agree on two nulls." },
    ],
    constraints: ["0 <= nodes <= 1000", "-100 <= Node.val <= 100"],
    breakdown: [
      "The instinct 'invert the tree, then check equality with the original' works: mirror a copy and run a full tree-equality check. But that materializes a second tree and a second traversal, when the comparison you actually want is between the original left and right subtrees — you can run both walks simultaneously and never copy anything.",
      "So the real question becomes: what does it mean for two subtrees a and b to be mirrors? Same root value, a's left mirrors b's right, and a's right mirrors b's left. That recursive definition IS the algorithm — start it once with (root, root) and let the twin walkers descend in lockstep.",
      "The iterative version is the same idea with an explicit worklist: push children as mirror pairs (a.left with b.right, a.right with b.left) and fail whenever a pair disagrees. Interviewers like this problem because the whole answer is a one-line reformulation — 'symmetric means the tree equals its own mirror' — plus the discipline to compare two nodes at once instead of one.",
    ],
    edges: [
      "Empty tree → symmetric (two nulls fold onto each other).",
      "Exactly one child on one side ([1,2,null]) — a mirror pair with one null is a mismatch, not a skip.",
      "Equal values in mirrored positions are necessary but not sufficient — the structure beneath must mirror too, which is exactly what [1,2,2,null,3,null,3] breaks.",
      "Symmetry is about mirrored VALUES and SHAPES, not 'all values equal' — [1,2,2,3,4,4,3] qualifies though its values differ.",
    ],
    ladder: [
      { title: "Brute force — invert then compare", body: "Clone the tree, invert the clone, then run a tree-equality check against the original. Three traversals and an O(n) copy — correct but wasteful, and it hides the symmetric structure you were asked about." },
      { title: "Iterative mirror pairs", body: "One pass over both halves with a stack or queue of node pairs, failing on the first disagreement. Same O(n) work as recursion, no call-stack depth issues on degenerate chains, and it doubles as the BFS-shaped answer if asked for one." },
      { title: "The optimal idea — twin recursion", body: "mirror(a, b): both null → true; one null or values differ → false; else mirror(a.left, b.right) and mirror(a.right, b.left). O(n) time, O(h) stack, zero allocation." },
    ],
    approach: "Twin-walker mirror recursion",
    code: `def isSymmetric(root):
    def mirror(a, b):
        if not a and not b:            # two nulls fold onto each other
            return True
        if not a or not b or a.val != b.val:
            return False               # one-sided overhang, or a value clash
        return mirror(a.left, b.right) and mirror(a.right, b.left)
    return mirror(root, root)          # the tree against its own reflection`,
    walkthrough: [
      "Starting with (root, root) looks odd until you see what it buys: the first comparison checks the root against itself (always equal), and the recursion immediately fans out into the crossed pairs that define symmetry — root.left vs root.right, then their children crossed the same way.",
      "The three-way false guard reads as: if exactly one of a, b exists, the fold has an overhang; if both exist but values differ, the fold shows two different numbers. Only when values agree do we commit to comparing children — and crucially we compare them CROSSED, because a's outside edge mirrors b's outside edge.",
      "For [1,2,2,null,3,null,3] the pair (2, 2) passes, then the crossed pair (2.left = null, 2.right = 3) hits the one-null case and fails — exactly the overhang the second 3 creates. For [1,2,2,3,4,4,3] every crossed pair ends in two nulls or two equal values, so the recursion bottoms out in true all the way up.",
    ],
    time: "O(n) — every node visited once by some twin pair",
    space: "O(h) recursion — O(n) worst case on a chain",
    followUps: [
      "Iterative version: a queue seeded with (root, root), popping pairs and pushing crossed children — same logic, worst-case space becomes the level width instead of the height.",
      "Largest symmetric SUBTREE: the root-level question dissolves into a per-node 'mirror depth' computation over every node — a different problem shape worth sketching.",
    ],
    related: ["same-tree", "invert-binary-tree", "maximum-depth-of-binary-tree"],
    verify: {
      fn: "isSymmetric",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 2, 3, 4, 4, 3]], expect: true },
        { args: [[1, 2, 2, null, 3, null, 3]], expect: false },
        { args: [[1]], expect: true },
        { args: [[]], expect: true },
        { args: [[1, 2, null, null, 3]], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "populating-next-right-pointers-in-each-node",
    statement:
      "Each node of a PERFECT binary tree carries an extra next pointer, initially null. Stitch every node to its immediate right-hand neighbour on the same level, so each level reads as a left-to-right linked list, and return the root. Ideally do it with O(1) extra space.",
    examples: [
      { input: "root = [1,2,3,4,5,6,7]", output: "[1,2,3,4,5,6,7] with level links 4→5→6→7, 2→3, 1→null", explanation: "Harness note: the in-app serializer reads only val/left/right, so these verify cases prove the traversal runs and preserve the tree's structure — LeetCode's own judge additionally walks the next pointers, and the walkthrough below traces every level link explicitly." },
      { input: "root = [1]", output: "[1]", explanation: "A lone root's next stays null; its level list has one element and there is no lower level to stitch." },
      { input: "root = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]", output: "[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]", explanation: "Depth 4: three stitching passes produce level lists 2→3, 4→5→6→7, 8→…→15." },
    ],
    constraints: ["the tree is perfect — every internal node has two children, all leaves on one level", "1 <= nodes <= 2^12 - 1"],
    breakdown: [
      "The obvious tool is a level-order queue: BFS by levels and link each node to the next node popped. It is correct and generalizes to any tree, but it spends O(width) space — on a perfect tree the last level alone holds n/2 nodes, which is exactly the cost the follow-up asks you to eliminate.",
      "The perfect-tree gift: when you stand on a level whose next pointers are ALREADY stitched, you can walk that level using .next alone — no queue — and stitch the level below as you go. Two link types exist: inside a pair (head.left.next = head.right), and across neighbouring pairs (head.right.next = head.next.left), which is only writable because head.next is already live from the previous pass.",
      "So the algorithm is a triple loop: descend via leftmost.left, walk the current level via next, cross-stitch the children. The tree's own pointers replace the queue entirely — O(n) time, O(1) space, and the canonical answer to the follow-up this problem exists for.",
    ],
    edges: [
      "The cross-stitch must be guarded: head.next.left only when head.next exists — the level's last pair has no right-hand neighbour.",
      "Leaves' next pointers stay null by default; the descent stops because leftmost.left is null — never attempt to stitch below a leaf level.",
      "This shape ONLY works for perfect trees: a node with one child breaks the head.next.left assumption. Problem 117 (the general version) needs a dummy-head or queue technique.",
      "Return the original root, not the leftmost node you end the descent on — easy to return the wrong handle after walking down.",
    ],
    ladder: [
      { title: "Brute force — BFS with a queue", body: "Standard level traversal: record each level as a list, link consecutive nodes, loop. O(n) time, O(width) = O(n) space on the last level. A fine first answer — and the perfect-tree follow-up is the interview's real question." },
      { title: "Recursion on subtree pairs", body: "connect(left, right): link the two children, recurse on the outer pairs and the inner pair (left.right → right.left needs the parent link already set). Elegant, O(h) stack — but the four-subtree bookkeeping is easier to fumble than the loop below." },
      { title: "The optimal idea — level-stitch with established pointers", body: "Stand at the leftmost node of a level; walk that level via .next (live from the previous pass), wiring each node's children as you go. O(n) time, O(1) space, no queue, no recursion." },
    ],
    approach: "Level-stitching via established next pointers (O(1) space)",
    code: `# Harness note: the in-app/offline serializer reads only val/left/right, so the
# verify cases here prove the traversal runs and preserve tree structure;
# LeetCode's judge additionally walks the .next pointers traced in the walkthrough.
def connect(root):
    if not root:
        return None
    leftmost = root
    while leftmost.left:                    # a lower level exists to stitch
        head = leftmost
        while head:                         # walk THIS level via next pointers
            head.left.next = head.right     # stitch inside the pair
            nxt = getattr(head, "next", None)  # unset .next counts as null
            if nxt:                         # neighbour exists → cross the seam
                head.right.next = nxt.left
            head = nxt
        leftmost = leftmost.left            # descend to the newly stitched level
    return root`,
    walkthrough: [
      "Trace [1,2,3,4,5,6,7]. Iteration one stands on node 1: inside-pair stitch 2→3; node 1 has no next, so no cross-seam. Level 0 is done, and leftmost drops to node 2.",
      "Iteration two walks level 1 via next: at head 2, stitch 4→5, then — because 2.next is 3 — cross-stitch 5→6 (3's left child). head advances to 3: stitch 6→7; 3.next is null so the seam guard skips. Level 1 now reads 2→3 and level 2 reads 4→5→6→7.",
      "Iteration three: leftmost is 4, but 4.left is null — the while condition fails and we stop, returning root. Every next pointer was written exactly once, each level was walked once: O(n) time with O(1) extra space, and the final link structure is precisely what LeetCode's judge checks by walking the levels.",
    ],
    time: "O(n) — each next pointer set exactly once",
    space: "O(1) — the tree's own pointers are the worklist",
    followUps: [
      "General trees (problem 117): the cross-seam trick dies with missing children — use a per-level dummy head: walk the current level, appending surviving children after the dummy; the dummy's next is the next level's leftmost. Still O(1) space.",
      "Once levels are stitched, enumerating each level's leftmost nodes gives you the right-side view and level sums for free — a nice remark on how the structure pays rent beyond its original purpose.",
    ],
    related: ["populating-next-right-pointers-in-each-node-ii", "binary-tree-level-order-traversal", "binary-tree-right-side-view"],
    verify: {
      fn: "connect",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [1, 2, 3, 4, 5, 6, 7] },
        { args: [[1]], expect: [1] },
        { args: [[1, 2, 3]], expect: [1, 2, 3] },
        { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]], expect: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
      ],
    },
    xp: 20,
  },
  {
    slug: "flatten-binary-tree-to-linked-list",
    statement:
      "Rewrite a binary tree IN PLACE so it becomes a 'linked list' hanging off right pointers: the node order must be the tree's preorder, every left pointer must end up null, and no new nodes may be created — you rewire the existing ones. Return the root of the flattened tree (on LeetCode the function returns nothing and the mutation is the answer; here the returned root lets the harness verify it).",
    examples: [
      { input: "root = [1,2,5,3,4,null,6]", output: "[1,null,2,null,3,null,4,null,5,null,6]", explanation: "Preorder is 1,2,3,4,5,6 — the flat list reads in exactly that order through right pointers only. The harness re-serializes the mutated tree, so the rewiring is fully visible." },
      { input: "root = [1,2,null,3]", output: "[1,null,2,null,3]", explanation: "A left-leaning chain must migrate entirely to the right side, in the same preorder sequence." },
      { input: "root = []", output: "null", explanation: "An empty tree flattens to an empty list." },
    ],
    constraints: ["0 <= nodes <= 2000", "in place — no node construction; O(1) extra space preferred"],
    breakdown: [
      "Preorder is root, left, right — so after flattening, a node's right pointer must lead into its flattened LEFT subtree, whose tail must in turn hook onto the flattened RIGHT subtree. The naive collect-and-rebuild (append preorder values to a list, then build a fresh right chain) produces a NEW tree, which quietly violates 'in place' — the interview kill condition.",
      "The in-place move: at each node with a left child, find that left subtree's last preorder node (keep walking right from the left child — its rightmost node), then splice: predecessor.right = node.right, node.right = node.left, node.left = null. Step right and repeat. This is Morris traversal's machinery repurposed from visiting to reshaping.",
      "Why does splicing at every node yield global preorder? Because it performs exactly the preorder schedule: at each node the entire left subtree is served first (its own nodes get the same treatment as we advance), and the right subtree is deferred to the tail of the left chain — which is precisely where preorder says it belongs.",
    ],
    edges: [
      "Finding the predecessor is an inner rightward walk, but each spliced edge is never traversed again — the amortized total stays O(n).",
      "Forgetting node.left = null after the move leaves the old left link alive alongside the new right link — a cycle that corrupts every later traversal.",
      "Left-only chains ([1,2,null,3]) must migrate wholesale to the right side, not just get relabeled.",
      "Empty tree and single node: the loop skips immediately; return the root unchanged (null stays null).",
    ],
    ladder: [
      { title: "Brute force — collect and rebuild", body: "Append every node to a preorder list, then walk the list rewiring right pointers and nulling lefts. O(n) time, O(n) buffer — and arguably not 'in place', since the node order is staged outside the tree. Works; fails the follow-up." },
      { title: "Reverse-postorder recursion", body: "Traverse right-first, keeping a pointer to the previously flattened node; each visit sets node.right = prev, node.left = null, prev = node. Beautiful and short, but O(h) stack, and it takes a sketch to see why right-before-left produces preorder." },
      { title: "The optimal idea — Morris-style splice", body: "At each node with a left child, hook the left subtree's rightmost node to node.right, move the whole left subtree to the right side, null the left pointer, advance along .right. O(n) time, O(1) space, fully iterative." },
    ],
    approach: "Morris-style predecessor splice (O(1) space)",
    code: `def flatten(root):
    cur = root
    while cur:
        if cur.left:                      # the left subtree must move rightward
            pred = cur.left               # rightmost node of the left subtree
            while pred.right:             #   = its last node in preorder
                pred = pred.right
            pred.right = cur.right        # defer the original right subtree
            cur.right = cur.left          # left subtree becomes the right chain
            cur.left = None               # else the stale left link makes a cycle
        cur = cur.right                   # advance along the new spine
    return root`,
    walkthrough: [
      "Trace [1,2,5,3,4,null,6]. At node 1: the predecessor is the rightmost node of subtree(2), which is 4; so 4.right = 6 (1's old right subtree), 1.right = 2, 1.left = null. The spine now starts 1→2 with 5's subtree parked on 4's tail.",
      "Advance to 2: its left child is 3, and 3 has no right child of its own (4 hangs on 2's right side), so pred = 3; then 3.right = 2's old right subtree (4), 2.right = 3, 2.left = null. From here the walk rides the spine through 3 and 4 — whose right pointer already leads to the parked 5-chain — and exits at 6.",
      "Every node is spliced at most once (only while it still has a left child), and each predecessor walk only traverses edges that the splice immediately destroys, so total work is O(n) despite the nested loop. The result serializes as a right-only chain in preorder — which is exactly what the harness's val/left/right serialization can see, so the mutation is graded directly.",
    ],
    time: "O(n) — each edge traversed O(1) amortized despite the inner pred walk",
    space: "O(1) — fully iterative, no list, no stack",
    followUps: [
      "Reverse-postorder recursion (right-first with a shared prev) achieves the same in three lines at O(h) stack cost — the compact alternative when O(1) space is not demanded.",
      "Flatten to INORDER or POSTORDER instead: the splice generalizes but walks the opposite direction, using left pointers as the spine — a classic whiteboard stretch to test whether the preorder logic was memorized or understood.",
    ],
    related: ["binary-tree-preorder-traversal", "flatten-a-multilevel-doubly-linked-list", "recover-binary-search-tree"],
    verify: {
      fn: "flatten",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 5, 3, 4, null, 6]], expect: [1, null, 2, null, 3, null, 4, null, 5, null, 6] },
        { args: [[1, 2, null, 3]], expect: [1, null, 2, null, 3] },
        { args: [[1, 2, 3]], expect: [1, null, 2, null, 3] },
        { args: [[0]], expect: [0] },
        { args: [[]], expect: null },
      ],
    },
    xp: 20,
  },
  {
    slug: "path-sum",
    statement:
      "Given a binary tree and a target sum, decide whether ANY root-to-leaf path's values add up to it. The path must start at the root and END AT A LEAF — a node with no children; partial paths that stop early at a one-child node do not count.",
    examples: [
      { input: "root = [5,4,8,11,null,13,4,7,2,null,null,null,1], targetSum = 22", output: "true", explanation: "5 → 4 → 11 → 2 sums to 22 and ends at the leaf 2." },
      { input: "root = [1,2,3], targetSum = 5", output: "false", explanation: "The only leaf paths are 1→2 = 3 and 1→3 = 4; nothing ends on 5." },
      { input: "root = [], targetSum = 0", output: "false", explanation: "The null-child trap: an empty tree has no root-to-leaf path at all, so even target 0 is false — there is no empty path from a nonexistent root." },
    ],
    constraints: ["0 <= nodes <= 5000", "-1000 <= Node.val, targetSum <= 1000"],
    breakdown: [
      "At every node the question shrinks: after consuming this node's value, can some path from a child's leaf complete the REMAINING target? Subtract as you descend and the leaf check becomes a plain equality — root.val == remaining — with no summation bookkeeping anywhere.",
      "The null-child trap is the whole problem. The tempting base case 'if not root: return target == 0' returns true for a node with exactly one child when the target equals that node's path sum — but a missing child is not a leaf, so that path does not exist. Correctness demands two different base cases: null → false (no path), leaf → equality.",
      "Combining is a boolean OR: the answer exists if the left subtree can finish OR the right one can. Because we need only existence, the recursion short-circuits on the first true and never explores the second branch — early exit for free.",
    ],
    edges: [
      "Empty tree → false even when targetSum = 0 — no path exists to take the sum of.",
      "One-child nodes: a null sibling must NOT terminate a path; only true leaves do. This is the case that breaks the naive null base case.",
      "Negative values everywhere: subtracting negatives can GROW the remaining target, so 'prune when the remainder goes negative' is invalid unless all values are known positive.",
      "Single-node tree: the root is also a leaf, so the equality base case fires immediately.",
    ],
    ladder: [
      { title: "Brute force — enumerate every path", body: "DFS collecting each root-to-leaf value list, then check each list against the target. O(n·h) time from copying paths, O(h) extra — correct, but the copying is pure waste when a running remainder does the job." },
      { title: "Carry the accumulated sum", body: "Recurse with the sum so far instead of copies; compare the leaf total to the target. Same shape as the optimal but pushes sums downward rather than shrinking a remainder — equivalent, marginally less clean to state." },
      { title: "The optimal idea — remainder subtraction with a strict leaf test", body: "Pass targetSum − node.val down; null → false, leaf → equality, internal → left OR right. O(n) time, O(h) stack, zero allocation." },
    ],
    approach: "Remainder recursion with an explicit leaf base case",
    code: `def hasPathSum(root, targetSum):
    if not root:
        return False                     # null is NOT a leaf: no path lives here
    if not root.left and not root.right:
        return root.val == targetSum     # leaf: the path ends, equality decides
    remaining = targetSum - root.val     # consume this node, shrink the goal
    return hasPathSum(root.left, remaining) or hasPathSum(root.right, remaining)`,
    walkthrough: [
      "For ([5,4,8,11,null,13,4,7,2,null,null,null,1], 22): the walk consumes 5 (remaining 17), descends through 4 (13) and 11 (2), and reaches the leaf 2 with remaining 2 → equality holds → true cascades up the OR chain. The sibling branches (13's and 4's paths) never produce a match, but existence needs only one yes.",
      "The empty-tree case exercises the first base case: [] with target 0 returns false because there is no root to stand on — 'target == 0' never gets consulted. Contrast [1,2] with target 1: node 1 has remaining 0, but its left side is NULL → false, and the right leaf 2 needs 0 ≠ 2 → false overall — correctly refusing to treat the missing child as a path end.",
      "Each node is visited at most once (the OR may skip a whole subtree after a hit), so time is O(n) with O(h) stack. The equality-at-leaf formulation also makes the single-node case fall out naturally — the root IS the leaf — and keeps negative targets working without any special handling.",
    ],
    time: "O(n) — each node examined once; OR short-circuits after a hit",
    space: "O(h) — recursion stack, O(n) on a chain",
    followUps: [
      "Collect the actual matching path (Path Sum II): carry a running list — push before recursing, pop on unwind; the remainder logic is unchanged.",
      "Paths that may start ANYWHERE in the tree (Path Sum III): that needs prefix sums along each root path with a hashmap — a different, heavier pattern built on the same leaf discipline.",
    ],
    related: ["path-sum-ii", "sum-root-to-leaf-numbers", "binary-tree-maximum-path-sum"],
    verify: {
      fn: "hasPathSum",
      wrap: "tree",
      cases: [
        { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1], 22], expect: true },
        { args: [[1, 2, 3], 5], expect: false },
        { args: [[], 0], expect: false },
        { args: [[1, 2], 1], expect: false },
        { args: [[-2, null, -3], -5], expect: true },
        { args: [[7], 7], expect: true },
      ],
    },
    xp: 10,
  },
  {
    slug: "sum-root-to-leaf-numbers",
    statement:
      "Each root-to-leaf path of a binary tree spells a decimal number: the root is the leading digit and every step appends one more. Given a tree whose values are single digits 0–9, return the SUM of all those path numbers.",
    examples: [
      { input: "root = [1,2,3]", output: "25", explanation: "Path 1→2 reads 12 and 1→3 reads 13; 12 + 13 = 25." },
      { input: "root = [4,9,0,5,1]", output: "1026", explanation: "495 + 491 + 40 = 1026 — the path 4→0 is the two-digit number 40." },
      { input: "root = [0,1]", output: "1", explanation: "The root 0 contributes a leading zero: '01' is just 1. The arithmetic absorbs it — no string handling needed." },
    ],
    constraints: ["1 <= nodes <= 1000", "0 <= Node.val <= 9", "the answer fits in a 32-bit integer"],
    breakdown: [
      "One arithmetic identity does all the work: appending digit d to a number n is n·10 + d. So a DFS carrying a running value downward — multiply by ten, add the node's digit — builds every path number incrementally, and the leaf is where the finished number gets banked.",
      "Sum versus collect: the brute force materializes every path's number in a list and totals at the end; the better version adds each finished number into an accumulator or returns it upward. Returning upward is cleanest — internal nodes return dfs(left) + dfs(right), leaves return their own running value — so the sum assembles on the way back up with no shared state at all.",
      "Null children contribute zero, literally: dfs(None) returns 0. That single rule makes one-child nodes work for free, because the missing side adds nothing instead of fabricating a phantom path. Contrast with path-sum, where a null child must be actively rejected — there the question was existence (any nonzero signal lies), here it is summation (0 is the identity).",
    ],
    edges: [
      "One-child nodes: the null side returns 0 and vanishes — no special case required.",
      "Leading zeros ([0,1]): the arithmetic doesn't care — 0·10 + 1 = 1.",
      "Single node: the root is also a leaf, so the answer is its digit alone.",
      "Deep chains: recursion depth equals the height; the explicit-stack variant is the standard de-risking move for adversarial shapes.",
    ],
    ladder: [
      { title: "Brute force — build every path", body: "DFS collecting digit lists per leaf, then int(''.join(digits)) each and total. O(n·h) copying and string churn — correct, but memory-hungry for what is ultimately one number." },
      { title: "Shared accumulator", body: "Carry the running number down; at each leaf add it to a total captured by closure. One pass, O(h) space, but a touch of shared mutable state to explain while writing." },
      { title: "The optimal idea — return sums upward", body: "dfs(node, running): running = running·10 + val; leaf → running; else left + right. The purest form: no accumulator, no list — the call tree itself performs the summation." },
    ],
    approach: "Downward digit arithmetic, upward summation",
    code: `def sumNumbers(root):
    def dfs(node, running):
        if not node:
            return 0                      # a missing child adds nothing
        running = running * 10 + node.val # append this digit
        if not node.left and not node.right:
            return running                # leaf: the path number is complete
        return dfs(node.left, running) + dfs(node.right, running)
    return dfs(root, 0)`,
    walkthrough: [
      "For [4,9,0,5,1]: descend 4 (running 4) → 9 (49), whose children bank 4→9→5 = 495 and 4→9→1 = 491; the root's right child 0 is itself a leaf, banking 4→0 = 40. Upward summation gives 495 + 491 + 40 = 1026.",
      "The base-case split is what makes the function total: null returns 0 (contributes nothing to the parent's sum) and a leaf returns its completed running value. For [0,1]: the root sets running 0, the left leaf computes 0·10 + 1 = 1, the null right adds 0 — the leading zero is absorbed by pure arithmetic.",
      "Every node is touched once and does O(1) work: O(n) time, O(h) stack. Note the structural contrast with path-sum — an identical traversal skeleton, but where path-sum needed a strict leaf test to avoid phantom paths, summation tolerates null children because zero is harmless.",
    ],
    time: "O(n) — one visit per node, constant arithmetic",
    space: "O(h) — recursion stack",
    followUps: [
      "Iterative variant: an explicit stack of (node, running) pairs — same arithmetic, immune to recursion limits on deep chains.",
      "Huge paths or streaming: compute the sum modulo M on the way up (same recurrence, one mod per level) instead of materializing full numbers — the digit-append identity survives the modulus.",
    ],
    related: ["path-sum", "path-sum-ii", "sum-of-left-leaves"],
    verify: {
      fn: "sumNumbers",
      wrap: "tree",
      cases: [
        { args: [[1, 2, 3]], expect: 25 },
        { args: [[4, 9, 0, 5, 1]], expect: 1026 },
        { args: [[0, 1]], expect: 1 },
        { args: [[7]], expect: 7 },
        { args: [[1, null, 2, null, 3]], expect: 123 },
      ],
    },
    xp: 20,
  },
  {
    slug: "binary-tree-zigzag-level-order-traversal",
    statement:
      "Walk a binary tree level by level, but snake: left-to-right on even levels and right-to-left on odd ones (0-indexed). Return the traversal as a list of levels, each level a list of values in the order visited.",
    examples: [
      { input: "root = [3,9,20,null,null,15,7]", output: "[[3],[20,9],[15,7]]", explanation: "Level 0 reads forward; level 1 is harvested 9,20 but emitted 20,9; level 2 reads forward again." },
      { input: "root = [1,2,3,4,5,6,7]", output: "[[1],[3,2],[4,5,6,7]]", explanation: "The snake alternates every level regardless of the tree's shape." },
      { input: "root = []", output: "[]", explanation: "No levels exist — the result is an empty list, not a list containing an empty level." },
    ],
    constraints: ["0 <= nodes <= 2000", "-100 <= Node.val <= 100"],
    breakdown: [
      "BFS by levels is half the job: hold the current level as a list of nodes, harvest their values, and build the next level from their children in order. The only new question is direction — and direction can be applied at READ time (reverse the values of odd levels) or at WRITE time (alternate the append side).",
      "Read-time reversal is the cleanest: build every level left-to-right as usual, then reverse the odd ones for display. Crucially, children must always be COLLECTED left-to-right no matter how the current level is displayed — reversing the node list instead of the value list corrupts the next level's construction order, the classic bug here.",
      "The deque alternative flips at write time: on right-to-left levels, appendleft each value so the level reads backwards while children still come off in node order. Same complexity, slightly more state. Either way the output is fully deterministic — the snake order is completely specified, which is what makes the problem gradeable.",
    ],
    edges: [
      "Empty tree → [] (not [[]] — no levels exist at all).",
      "Single node → [[1]].",
      "Skewed chains: one-element levels where the zigzag is invisible, but each depth must still produce exactly one level.",
      "Reverse only the emitted VALUES per level, never the child nodes — or the next level's order breaks silently.",
    ],
    ladder: [
      { title: "Brute force — BFS then reverse", body: "Standard level-order into a list of lists; afterwards flip every odd-indexed list. Two passes over the output; trivially correct and a perfectly good first answer to say out loud." },
      { title: "Deque with alternating sides", body: "Keep each level in a deque and appendleft on right-to-left levels — direction handled during the harvest. One pass, but the write-order rule needs care and the child-collection loop must stay in node order." },
      { title: "The optimal idea — level lists with a flip flag", body: "Keep the level as a plain list; emit vals or vals[::-1] via a boolean toggled per level. Child construction stays uniform; the flag carries the entire zigzag logic in one line." },
    ],
    approach: "Level BFS with a direction flag",
    code: `def zigzagLevelOrder(root):
    if not root:
        return []
    out, level, l2r = [], [root], True
    while level:
        vals = [n.val for n in level]
        out.append(vals if l2r else vals[::-1])   # snake: flip odd levels
        level = [c for n in level for c in (n.left, n.right) if c]
        l2r = not l2r
    return out`,
    walkthrough: [
      "For [1,2,3,4,5,6,7]: level 0 emits [1] forward and the comprehension gathers [2,3]. Level 1 harvests [2,3] but emits [3,2] — same node order, reversed at write. The children gathered in node order yield [4,5,6,7], emitted forward on level 2.",
      "The comprehension reads 'for each node in the level, for each of its two children, keep the non-null ones' — that is the whole level advance. Because nodes are processed in level order and children attach left-before-right, the next level list is automatically left-to-right regardless of how the current level was DISPLAYED.",
      "One visit per node plus one O(width) reversal per odd level: O(n) total, O(width) working space beyond the output. The flag toggles every iteration, so its initialization matters — starting True is what makes the root's level read forward, and flipping in the loop keeps the alternation honest even for one-element levels.",
    ],
    time: "O(n) — each node harvested once; per-level reversal is O(width)",
    space: "O(w) — current and next level lists (output excluded)",
    followUps: [
      "Reverse the whole scheme (start right-to-left): initialize the flag to False — a one-character change worth mentioning unprompted in interviews.",
      "N-ary zigzag: identical flag logic; only the child-collection loop changes to iterate node.children — the pattern, not the tree degree, is the reusable part.",
    ],
    related: ["binary-tree-level-order-traversal", "binary-tree-level-order-traversal-ii", "binary-tree-right-side-view"],
    verify: {
      fn: "zigzagLevelOrder",
      wrap: "tree",
      cases: [
        { args: [[3, 9, 20, null, null, 15, 7]], expect: [[3], [20, 9], [15, 7]] },
        { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [[1], [3, 2], [4, 5, 6, 7]] },
        { args: [[]], expect: [] },
        { args: [[1]], expect: [[1]] },
        { args: [[0, 2, 4, 1, null, 3, -1, 5, 1, null, 6, null, 8]], expect: [[0], [4, 2], [1, 3, -1], [8, 6, 1, 5]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "maximum-level-sum-of-a-binary-tree",
    statement:
      "Sum the node values on each level of a binary tree and return the SMALLEST level number (1-indexed) whose sum is maximal. Ties go to the shallowest level.",
    examples: [
      { input: "root = [1,7,0,7,-8,null,null]", output: "2", explanation: "Level sums are 1, 7 and −1; the maximum 7 sits on level 2." },
      { input: "root = [-100,-200,-300,-20,-5,-5,null]", output: "3", explanation: "Every sum is negative: −100, −500, −30. The max is −30 on level 3 — initializing the best sum to 0 would never report any level." },
      { input: "root = [2,1,1]", output: "1", explanation: "Levels 1 and 2 both sum to 2; the tie goes to the smaller level number." },
    ],
    constraints: ["1 <= nodes <= 10^4", "-10^5 <= Node.val <= 10^5"],
    breakdown: [
      "Level sums demand a genuine level-order walk — you need the level as a batch before you can total it. The rolling-list BFS (carry the current level as a list, produce the next with one comprehension) gives exactly that: one pass per level, no sentinel nodes.",
      "Tie-breaking is the hidden requirement: 'smallest such level'. Scanning levels in ascending depth with a strict > comparison means the FIRST level to hold the maximum is kept and later ties never replace it. The comparison direction silently encodes the entire tiebreak rule.",
      "Initialization is the second trap: best must start as the first level's sum (or a None sentinel), never 0 — all-negative trees would otherwise report a fictional level where nothing was ever better than 'zero'. The data flow stays tiny: one sum per level, one comparison, one depth counter.",
    ],
    edges: [
      "All-negative sums: initialize best to None (or the first level), never 0.",
      "Ties: strict > while sweeping top-down keeps the smallest level number.",
      "Single node → level 1, trivially.",
      "Mixed signs: a huge negative level mid-tree must not disturb earlier bests — compare, don't accumulate across levels.",
    ],
    ladder: [
      { title: "Brute force — dump every level, then scan", body: "BFS into a list of level-lists, then loop the lists to find the max-sum index. O(n) time but O(n) extra space retaining every level — wasteful when one number per level is all that matters." },
      { title: "Queue BFS with a sentinel", body: "Classic deque with a None marker at level boundaries; total as you pop, compare at each boundary. Same O(n)/O(w) profile as the optimal with more moving parts to get right." },
      { title: "The optimal idea — rolling level lists", body: "Hold only the current level; harvest the sum, build the next level, advance the depth counter. O(n) time, O(max width) space, no sentinels, and strict > encodes the smallest-level tiebreak." },
    ],
    approach: "Rolling level sweep with strict-max tiebreak",
    code: `def maxLevelSum(root):
    best_level, best_sum = 1, None    # None → never compare against a fake 0
    level, depth = [root], 1
    while level:
        s = sum(n.val for n in level)
        if best_sum is None or s > best_sum:   # strict > keeps the SMALLEST level
            best_sum, best_level = s, depth
        level = [c for n in level for c in (n.left, n.right) if c]
        depth += 1
    return best_level`,
    walkthrough: [
      "For [1,7,0,7,-8,null,null]: depth 1 sums [1] → best (1, level 1). Level 2 is [7,0] → 7 > 1 → best (7, 2). Level 3 is [7,−8] → −1, no update. The next level is empty → stop; answer 2.",
      "The all-negative case is where the None initialization earns its keep: [−100,−200,−300,−20,−5,−5,null] sums to −100, −500, −30. Against a fake 0 the loop would never update and return a bogus level; against None the first level claims the title and level 3 steals it with −30 → answer 3.",
      "Each node contributes to exactly one sum and each level advance costs O(width); total O(n) time and O(max level width) space. The tiebreak rides on iteration order: levels are visited in ascending depth, so 'first strict improvement wins' is precisely 'smallest level wins' — no post-processing sort of candidate levels needed.",
    ],
    time: "O(n) — each node summed exactly once",
    space: "O(w) — the widest level held at once (output excluded)",
    followUps: [
      "Return ALL levels sharing the max: collect indices instead of replacing — the comparison flips from > to a compare-and-append.",
      "Per-level averages or medians: the same rolling walk works for any per-level statistic; medians need the level's values sorted (or a heap), which changes the per-level cost, not the traversal.",
    ],
    related: ["binary-tree-level-order-traversal", "average-of-levels-in-binary-tree", "maximum-depth-of-binary-tree"],
    verify: {
      fn: "maxLevelSum",
      wrap: "tree",
      cases: [
        { args: [[1, 7, 0, 7, -8, null, null]], expect: 2 },
        { args: [[989, null, 10250, 98693, -89388, null, null, null, -32127]], expect: 2 },
        { args: [[-100, -200, -300, -20, -5, -5, null]], expect: 3 },
        { args: [[1]], expect: 1 },
        { args: [[2, 1, 1]], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "search-in-a-binary-search-tree",
    statement:
      "Given the root of a binary search tree and a value, return the subtree rooted at the node holding that value — or null if no node does. You are searching, not inserting: the tree must come back untouched, and the returned subtree includes everything beneath the found node.",
    examples: [
      { input: "root = [4,2,7,1,3], val = 2", output: "[2,1,3]", explanation: "The whole subtree under the found node comes back; the harness re-serializes it from the returned node handle." },
      { input: "root = [4,2,7,1,3], val = 5", output: "null", explanation: "The descent falls off a null child — the not-found signal. The harness serializes a null result as null." },
      { input: "root = [18,9,27,6,15,24,30], val = 27", output: "[27,24,30]", explanation: "One comparison at the root discards the entire left half before the second look finds the target." },
    ],
    constraints: ["1 <= nodes <= 500", "all node values unique", "Node.val and val fit in a 32-bit signed integer"],
    breakdown: [
      "The BST invariant — everything left is smaller, everything right is larger — turns every comparison into a fork decision: if the target is smaller than the current node, the answer can only live left; larger, only right. One comparison discards half the remaining tree, which is the definition of binary search.",
      "Iterative beats recursive here because the descent is a tail call — no combine step, no backtracking, nothing to do after the recursive return. A while loop expresses it perfectly with O(1) space; the recursive form works and reads fine, but interviews treat the loop as the idiomatic answer and often ask for it explicitly.",
      "Falling off the tree — reaching a null child — IS the not-found signal; no sentinel or flag is needed. And because nothing is mutated, 'returning the subtree' is just returning the node handle you stopped on: whatever hangs beneath it comes along automatically when the harness serializes.",
    ],
    edges: [
      "Not found: the loop walks into a null child and returns null — no exception, no sentinel.",
      "Target found: stop immediately; with unique values the first hit is THE hit — descending further would be wrong.",
      "Single-node tree: one comparison decides between [1] and null.",
      "Skewed BST: the O(h) descent degrades to O(n) — say it aloud, since it is the difference between average and worst case and motivates self-balancing trees.",
    ],
    ladder: [
      { title: "Brute force — visit everything", body: "Generic DFS checking every node against the value, ignoring the ordering. O(n) — correct on any tree, wasteful on a BST, and the interviewer will ask why you didn't use the invariant." },
      { title: "Recursive descent", body: "if val < root.val: return search(root.left, val) … — clean, correct, O(h) stack. A tail call waiting to become a loop; fine to present first, then convert." },
      { title: "The optimal idea — iterative fork descent", body: "While root exists and doesn't match: step left or right by comparison. Return whatever you land on — the found node or null. O(h) time, O(1) space." },
    ],
    approach: "Iterative BST descent",
    code: `def searchBST(root, val):
    while root and root.val != val:   # a null child means: not found
        root = root.left if val < root.val else root.right
    return root                       # the found node's handle, or None`,
    walkthrough: [
      "For ([4,2,7,1,3], 2): node 4 doesn't match and 2 < 4 → step left; node 2 matches → stop and return its handle. The harness serializes the subtree: [2,1,3]. For val 5: 4 → right (5 > 4), node 7 → left (5 < 7), then the left child is null → the loop exits and None is returned.",
      "The loop condition fuses the two exits — 'the node is null' and 'the value matches' — into one line, and the same return statement handles both outcomes: a live node handle or None. That totality is why no post-loop cleanup or flag checking is needed.",
      "Each iteration discards one subtree outright, so the cost is exactly h comparisons in the worst case and none are wasted. On random insertion orders that is ~log n; on a sorted insertion chain it is n — the moment to mention AVL/red-black trees as the industrial fix that caps h at O(log n).",
    ],
    time: "O(h) — one comparison per level",
    space: "O(1) — pure pointer chasing",
    followUps: [
      "Report the path taken (a string of L/R turns): accumulate during the descent — trivial in the loop, awkward in the recursion.",
      "Many queries on one static tree: sort the targets and answer all of them in one inorder sweep (O(n + q log q)); for a dynamic tree, balanced BSTs keep h logarithmic under inserts.",
    ],
    related: ["insert-into-a-binary-search-tree", "delete-node-in-a-bst", "trim-a-binary-search-tree"],
    verify: {
      fn: "searchBST",
      wrap: "tree",
      cases: [
        { args: [[4, 2, 7, 1, 3], 2], expect: [2, 1, 3] },
        { args: [[4, 2, 7, 1, 3], 5], expect: null },
        { args: [[], 3], expect: null },
        { args: [[18, 9, 27, 6, 15, 24, 30], 27], expect: [27, 24, 30] },
        { args: [[1], 1], expect: [1] },
      ],
    },
    xp: 10,
  },
  {
    slug: "delete-node-in-a-bst",
    statement:
      "Given the root of a binary search tree and a key, delete the node holding that key and return the tree's root (which may be a different node than before). The result must remain a valid BST. When the deleted node has two children, several replacements are valid — this harness grades exactly one canonical variant: replace with the INORDER SUCCESSOR (the smallest value in the right subtree).",
    examples: [
      { input: "root = [5,3,6,2,4,null,7], key = 3", output: "[5,4,6,2,null,null,7]", explanation: "Node 3 had two children; the successor 4 (smallest in its right subtree) takes its value, and 4 is then deleted from its old spot. Any valid BST is accepted on LeetCode; the harness grades the successor-replacement variant." },
      { input: "root = [5,3,6,2,4,null,7], key = 0", output: "[5,3,6,2,4,null,7]", explanation: "The key isn't in the tree — the descent runs off a null child and the tree comes back untouched." },
      { input: "root = [5,3,6,2,4,null,7], key = 5", output: "[6,3,7,2,4]", explanation: "Deleting the root: successor 6 becomes the new root value. Again a multiple-valid-results case — graded here as the successor variant." },
    ],
    constraints: ["1 <= nodes <= 1000", "all node values unique", "the key may be absent"],
    breakdown: [
      "Delegation is the shape: if the key is smaller than the current node, the surgery happens entirely in the left subtree — recurse, then reattach the (possibly new) left child to root.left; larger, symmetrically on the right. Only when the key equals the current node does actual surgery begin, and the node's child count dictates the operation.",
      "Two children admit two natural claimants: the inorder predecessor (largest in the LEFT subtree) or the inorder successor (smallest in the RIGHT subtree) — either preserves ordering. The canonical choice here copies the successor's VALUE into the node, then deletes the successor from the right subtree. That second deletion is always the easy kind, because a leftmost node has no left child by construction.",
      "The whole algorithm reads find → replace → re-remove: descend by comparison, copy the successor value at the hit, then erase the duplicated value one level down. Absent keys fall through the comparisons to a null child and return the tree untouched — no special case, no pre-check.",
    ],
    edges: [
      "Key absent: the descent hits null; return the subtree exactly as it was.",
      "Deleting the root: the equal-case fires at the top level — returning root.right / root.left / the updated root handles it uniformly, since the parent call (the harness) takes whatever comes back.",
      "The successor never has a left child, so its removal is a 0-or-1-child deletion — no infinite regress.",
      "When the successor IS the immediate right child, the re-remove still works: deleteNode(rightChild, succVal) returns the right child's right chain, which gets reattached correctly.",
    ],
    ladder: [
      { title: "Brute force — rebuild the tree", body: "Inorder-collect the values, remove the key, rebuild a BST from the list. O(n) and it DESTROYS the original shape (the problem wants a surgical edit), but it's a valid-BST-producing fallback worth one sentence in an interview." },
      { title: "Predecessor variant", body: "Same skeleton, but replace with the largest value of the LEFT subtree. Symmetric to the successor variant and equally valid on LeetCode — the choice only matters when results are graded deterministically, as here." },
      { title: "The optimal idea — recursive splice with the successor", body: "Descend by comparison; at the hit, hand back the surviving child for 0/1-child nodes, else copy the successor's value and delete it from the right subtree. O(h) time, O(h) stack, shape locally repaired." },
    ],
    approach: "Recursive delete with inorder-successor replacement",
    code: `def deleteNode(root, key):
    if not root:
        return None                       # key absent — nothing to splice
    if key < root.val:
        root.left = deleteNode(root.left, key)     # surgery lives left
    elif key > root.val:
        root.right = deleteNode(root.right, key)   # surgery lives right
    else:
        if not root.left:                 # 0 or 1 child: hand back the other side
            return root.right
        if not root.right:
            return root.left
        succ = root.right                 # inorder successor: leftmost of right
        while succ.left:
            succ = succ.left
        root.val = succ.val               # copy the value up
        root.right = deleteNode(root.right, succ.val)  # erase the duplicate below
    return root`,
    walkthrough: [
      "Delete 3 from [5,3,6,2,4,null,7]: 3 < 5 recurses left; at node 3 both children exist, so succ = leftmost of subtree(4) = 4. Copy 4 into the node, then deleteNode(node4, 4) — a no-left-child case — returns None, which the parent reattaches as the right child. The left subtree is now (4 with left 2), giving [5,4,6,2,null,null,7].",
      "Deleting the ROOT (key 5): the equal case fires immediately; succ = leftmost of subtree(6) = 6; root.val becomes 6 and deleteNode(subtree 6, 6) returns 7 by the one-child rule. The function returns the mutated root — [6,3,7,2,4] — and because the root object itself was edited in place, the harness sees the surgery, not a rebuilt tree.",
      "An inorder read confirms each result: 2,3,4,6,7 with the key gone. Compare variants concretely: the predecessor replacement for key 3 would yield [5,2,6,null,4,null,7] — equally valid on LeetCode, differently graded here. Cost: O(h) comparisons plus one leftmost scan inside the same subtree, all with O(h) recursion.",
    ],
    time: "O(h) — descent plus one leftmost scan, same subtree",
    space: "O(h) — recursion stack",
    followUps: [
      "Many deletions over time: repeated naive deletes can skew the tree — the industrial answer is a self-balancing BST with a real erase (AVL/red-black) that rebinds instead of copying values.",
      "Iterative delete with parent tracking: find node + parent in one loop and splice with O(1) space; the successor scan then needs a parent trail to detach it — good exercise in pointer bookkeeping.",
    ],
    related: ["insert-into-a-binary-search-tree", "search-in-a-binary-search-tree", "trim-a-binary-search-tree"],
    verify: {
      fn: "deleteNode",
      wrap: "tree",
      cases: [
        { args: [[5, 3, 6, 2, 4, null, 7], 3], expect: [5, 4, 6, 2, null, null, 7] },
        { args: [[5, 3, 6, 2, 4, null, 7], 0], expect: [5, 3, 6, 2, 4, null, 7] },
        { args: [[5, 3, 6, 2, 4, null, 7], 5], expect: [6, 3, 7, 2, 4] },
        { args: [[], 0], expect: null },
        { args: [[0], 0], expect: null },
      ],
    },
    xp: 20,
  },
  {
    slug: "construct-binary-tree-from-inorder-and-postorder-traversal",
    statement:
      "You are handed two arrays: the INORDER and POSTORDER traversals of a tree whose values are all distinct. Rebuild the tree and return its root. The pair of traversals pins the structure down uniquely.",
    examples: [
      { input: "inorder = [9,3,15,20,7], postorder = [9,15,7,20,3]", output: "[3,9,20,null,null,15,7]", explanation: "Postorder's last element 3 is the root; inorder splits at 3 into left [9] and right [15,20,7], and the postorder lengths match those slices exactly." },
      { input: "inorder = [2,1], postorder = [2,1]", output: "[1,2]", explanation: "Root 1; everything in inorder sits LEFT of it, and postorder confirms: [2] is the left subtree, the right is empty." },
      { input: "inorder = [], postorder = []", output: "null", explanation: "Harness edge: the empty pair rebuilds the empty tree, which serializes as null." },
    ],
    constraints: ["0 <= n <= 3000 — the empty pair rebuilds the empty tree", "all values unique", "the two arrays are genuine traversals of one tree"],
    breakdown: [
      "Postorder is left, right, ROOT — so read from the BACK, roots come first: the last element is the whole tree's root, the second-from-last is the right subtree's root, and so on. Inorder is the complement: it cannot name roots, but it perfectly SPLITS left from right around any given root value.",
      "Combine them: take the root from postorder's tail, find it in inorder — everything left of that index is the left subtree's inorder, everything right is the right subtree's. Sizes transfer to postorder (left gets k elements, right gets the rest before the root) because both arrays describe the same tree, and the recursion bottoms out at empty slices.",
      "The efficiency story: linear-scanning inorder per root costs O(n) each → O(n²) overall. A prebuilt value→index map makes each lookup O(1) → O(n). Consuming postorder from the back with ONE shared cursor removes even the slicing — the recursion passes inorder bounds (lo, hi) and decrements the cursor. Crucially, allocate the RIGHT subtree first: read backwards, right-subtree roots arrive before left ones.",
    ],
    edges: [
      "Empty traversals → null; the lo >= hi guard is the base case that makes it fall out.",
      "Skewed chains: inorder [1,2,3] with postorder [3,2,1] splits at the ends every time — recursion depth equals n.",
      "Building LEFT first while consuming postorder backwards silently assembles the wrong tree — the famous bug this problem exists to catch.",
      "Single node: both arrays are the same one element and the recursion finishes in one step.",
    ],
    ladder: [
      { title: "Brute force — scan and slice", body: "For each root, linear-search inorder, then slice BOTH arrays into four pieces and recurse. O(n²) worst case — every level copies everything — but correct and readable as a first pass." },
      { title: "Index map + slices", body: "Prebuild value→inorder-index once; still slice postorder per call. O(1) root lookups, O(n²) copying from the slices — the halfway house between clarity and speed." },
      { title: "The optimal idea — bounds + shared cursor", body: "Pass inorder (lo, hi) bounds and keep one cursor walking postorder from the back; allocate right before left. O(n) time, O(n) space for the map, zero copying." },
    ],
    approach: "Postorder-from-back recursion with an inorder index map",
    code: `def buildTree(inorder, postorder):
    idx = {v: i for i, v in enumerate(inorder)}   # value → inorder position
    cursor = len(postorder) - 1                   # next root, read from the back

    def build(lo, hi):                            # rebuilds inorder[lo:hi)
        nonlocal cursor
        if lo >= hi:
            return None                           # empty slice → empty tree
        root = TreeNode(postorder[cursor])        # last unconsumed token = root
        mid = idx[root.val]                       # splits left / right
        cursor -= 1
        root.right = build(mid + 1, hi)           # RIGHT first: backwards order
        root.left = build(lo, mid)
        return root

    return build(0, len(inorder))`,
    walkthrough: [
      "For ([9,3,15,20,7], [9,15,7,20,3]): the cursor picks 3 → root; idx[3] = 1 splits inorder into [9] and [15,20,7]. RIGHT first: build(2,5) reads postorder[3] = 20 → the right subtree's root; it splits at 20 into [15] and [7], producing leaves 15 (from postorder[2]) and 7 (from postorder[1]).",
      "Then the deferred LEFT: build(0,1) reads postorder[0] = 9 → a leaf. The cursor marched 3 → 20 → 7 → 15 → 9 — exactly postorder read backwards, with right-subtree roots surfacing first. Had we built left first, 9 would have consumed 7's token and the shape would corrupt silently.",
      "Every node costs one cursor step and one dict hit: O(n) total, plus O(h) stack and the O(n) map. The (lo, hi) bounds carry all the positional information the old slices did — recursion on intervals instead of arrays is the standard trick that turns 'construct from traversals' from quadratic to linear.",
    ],
    time: "O(n) — one dict hit + one cursor step per node",
    space: "O(n) — the index map; O(h) recursion on top",
    followUps: [
      "Preorder + inorder (problem 105) is the mirror image: consume preorder from the FRONT and build LEFT first — flip both choices and the same skeleton applies.",
      "Preorder + postorder does NOT determine a unique tree (single-child nodes are ambiguous) — problem 889 exists by convention; being able to say WHY it's ambiguous is the real test.",
    ],
    related: ["construct-binary-tree-from-preorder-and-inorder-traversal", "construct-binary-tree-from-preorder-and-postorder-traversal"],
    verify: {
      fn: "buildTree",
      wrap: "treeOut",
      cases: [
        { args: [[9, 3, 15, 20, 7], [9, 15, 7, 20, 3]], expect: [3, 9, 20, null, null, 15, 7] },
        { args: [[2, 1], [2, 1]], expect: [1, 2] },
        { args: [[], []], expect: null },
        { args: [[1, 2, 3], [3, 2, 1]], expect: [1, null, 2, null, 3] },
        { args: [[3, 2, 4, 1], [3, 4, 2, 1]], expect: [1, 2, null, 3, 4] },
      ],
    },
    xp: 20,
  },
  {
    slug: "minimum-absolute-difference-in-bst",
    statement:
      "Given the root of a binary search tree, return the smallest absolute difference between the values of any two DISTINCT nodes. The ordering should do the heavy lifting — arbitrary pair comparisons are not the point.",
    examples: [
      { input: "root = [4,2,6,1,3]", output: "1", explanation: "Inorder gives 1,2,3,4,6; the closest neighbours are one apart (1–2, 2–3)." },
      { input: "root = [1,0,48,null,null,12,49]", output: "1", explanation: "Sorted values 0,1,12,48,49 — the adjacent pair 48 & 49 is closest." },
      { input: "root = [236,104,701,null,227,null,911]", output: "9", explanation: "Sorted: 104, 227, 236, 701, 911 — 236 − 227 = 9 is minimal; note neither is a leaf or the root." },
    ],
    constraints: ["2 <= nodes <= 10^4", "all values unique (a BST)", "values fit in a 32-bit signed integer"],
    breakdown: [
      "Inorder traversal of a BST emits values in SORTED order — the single property this whole problem family (min difference, validate-BST, kth-smallest) is built on. And the minimum absolute difference over ALL pairs equals the minimum gap between CONSECUTIVE values in that sorted sequence: for a < b < c, |a − c| is always worse than the smaller adjacent gap.",
      "So the algorithm collapses to: walk inorder, and for each value compare it against the PREVIOUS value visited. Keep one running best. No lists, no pair loops, no sorting pass — the traversal order IS the sort, already paid for by the BST invariant.",
      "The missteps are generic-pair thinking (O(n²)) and collect-then-sort (O(n log n) plus O(n) memory) — both ignore that the tree hands you sortedness for free. The entire trick fits in one variable: an inorder predecessor tracker that must survive across subtree boundaries.",
    ],
    edges: [
      "Two nodes minimum: the answer is simply |a − b| — but the general code doesn't special-case it.",
      "Skewed BST: recursion depth equals n — the explicit-stack inorder is the robustness answer at n = 10^4.",
      "Negative values change nothing: sorted order handles signs; never abs() prematurely — inorder gaps are already nonnegative.",
      "Do NOT reset 'prev' per subtree: the previous value must carry across the whole traversal, or you end up comparing non-consecutive nodes.",
    ],
    ladder: [
      { title: "Brute force — all pairs", body: "Collect the values and double-loop over every pair for min |a − b|. O(n²) — instantly disqualified at n = 10^4 (10^8 comparisons) and blind to the ordering it was given." },
      { title: "Collect + sort", body: "Any traversal into a list, sort it, scan adjacent gaps. O(n log n) plus O(n) space — and it works on ANY tree, not just BSTs; worth stating as the general-tree fallback." },
      { title: "The optimal idea — inorder with predecessor tracking", body: "One inorder pass; each node compares against the last value visited. O(n) time, O(h) stack, O(1) auxiliary state." },
    ],
    approach: "Inorder walk with a previous-value tracker",
    code: `def getMinimumDifference(root):
    prev = None    # the inorder predecessor's value (None until the first visit)
    best = None    # smallest gap so far — None beats any fake 0
    def inorder(node):
        nonlocal prev, best
        if not node:
            return
        inorder(node.left)
        if prev is not None:
            gap = node.val - prev        # sorted ⇒ already nonnegative
            if best is None or gap < best:
                best = gap
        prev = node.val                  # becomes the next node's 'previous'
        inorder(node.right)
    inorder(root)
    return best`,
    walkthrough: [
      "For [1,0,48,null,null,12,49]: inorder visits 0, 1, 12, 48, 49 — the order falls out of the structure (0 is the leftmost leaf, then root 1, then the right subtree in inorder). Gaps are 1, 11, 36, 1 → best 1.",
      "prev updates AFTER the comparison, on EVERY node — including internal roots like 1 and 48, which are members of the sorted sequence in their own right. Updating only at leaves (a common slip) would compare 12 against nothing and drop half the gaps; the update must sit unconditionally in the inorder position between the two recursive calls.",
      "Each node is visited once with O(1) work: O(n) time, O(h) stack, two variables of state. The returned best is a genuine pair difference by construction — consecutive values in sorted order minimize absolute difference, so no exotic pair can ever beat the tracked gaps.",
    ],
    time: "O(n) — a single inorder pass",
    space: "O(h) — recursion stack; O(1) auxiliary state",
    followUps: [
      "Iterative version with an explicit stack: same logic, immune to recursion limits on skewed 10^4-node chains.",
      "Minimum distance in a GENERAL binary tree (no ordering): the free sort evaporates — collect, sort, scan adjacent gaps at O(n log n); being able to price the lost invariant is the interview point.",
    ],
    related: ["minimum-distance-between-bst-nodes", "validate-binary-search-tree", "kth-smallest-element-in-a-bst"],
    verify: {
      fn: "getMinimumDifference",
      wrap: "tree",
      cases: [
        { args: [[4, 2, 6, 1, 3]], expect: 1 },
        { args: [[1, 0, 48, null, null, 12, 49]], expect: 1 },
        { args: [[236, 104, 701, null, 227, null, 911]], expect: 9 },
        { args: [[1, null, 3]], expect: 2 },
        { args: [[10, null, 20, null, 30]], expect: 10 },
      ],
    },
    xp: 10,
  },
  {
    slug: "lowest-common-ancestor-of-a-binary-tree",
    statement:
      "Given a binary tree (NOT a BST — no ordering to help) and two target nodes p and q, return their lowest common ancestor: the deepest node that has both targets in its subtree, where a node counts as its own ancestor. Here the targets arrive as VALUES; on LeetCode they are node references — with all values unique, value comparison is equivalent.",
    examples: [
      { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 1", output: "[3,5,1,6,2,0,8,null,null,7,4]", explanation: "5 and 1 live under different children of the root, so the root is the split point; the harness serializes the whole tree from it." },
      { input: "root = [3,5,1,6,2,0,8,null,null,7,4], p = 5, q = 4", output: "[5,6,2,null,null,7,4]", explanation: "4 sits inside 5's subtree, so 5 is the LCA — a node is its own ancestor. The harness serializes the subtree rooted at the answer." },
      { input: "root = [1,2], p = 1, q = 2", output: "[1,2]", explanation: "The root itself is one of the targets — the early return wins before any child search runs." },
    ],
    constraints: ["2 <= nodes <= 10^5", "all values unique; both p and q exist in the tree", "p ≠ q"],
    breakdown: [
      "Postorder is the natural order here: you cannot decide whether a node is the LCA until BOTH subtrees have reported. Define the recursion's contract precisely — 'search(node) returns a meaningful node if this subtree contains one of the targets (or the answer), else null' — and the combine rule writes itself.",
      "The bubble-up: a node that IS a target (or receives a non-null report from exactly one child) forwards that signal upward; a node that receives non-null from BOTH children is the split point — the LCA — and nothing above can override it, because both targets are already accounted for below.",
      "Two easy traps: assuming BST pruning (this tree has no ordering, so every node may need visiting), and mishandling the ancestor case where one target contains the other — the 'this node IS a target' early return resolves it before the descendant is ever searched for. The guarantee that both targets exist means the signal always resolves to exactly one answer.",
    ],
    edges: [
      "One target is the other's ancestor — the early target-hit return wins and no further search is needed.",
      "Targets in the same subtree: the other side reports null and is forwarded away harmlessly.",
      "Targets split across the root's two subtrees: both sides report non-null → the root is the answer.",
      "Deep skewed trees make recursion depth O(n) — the parent-map / iterative alternative is the scalability answer.",
    ],
    ladder: [
      { title: "Brute force — find both paths", body: "Record the root→p and root→q paths with DFS, then walk the two lists until they diverge, like first-intersection-of-linked-lists. O(n) time, O(h) extra for the paths — correct and explainable, but heavier than needed." },
      { title: "Parent pointers + ancestor set", body: "One BFS builds a child→parent map; collect p's ancestor set, then climb from q until you land in it. The right tool when MANY LCA queries follow on the same tree; overkill for one query." },
      { title: "The optimal idea — postorder bubble-up", body: "One pass: null-or-target base case; recurse on both sides; both non-null → this node is the answer; else forward the non-null side. O(n) time, O(h) stack, zero storage." },
    ],
    approach: "Postorder bubble-up (split-point detection)",
    code: `# On LeetCode p and q are node references; all values are unique, so comparing
# VALUES is equivalent — the harness passes the targets as plain ints.
def lowestCommonAncestor(root, p, q):
    if not root or root.val == p or root.val == q:
        return root                  # dead end, or a target found here
    left = lowestCommonAncestor(root.left, p, q)
    right = lowestCommonAncestor(root.right, p, q)
    if left and right:
        return root                  # split point: one target on each side
    return left or right             # forward the only non-null signal`,
    walkthrough: [
      "For (p=5, q=1) in [3,5,1,6,2,0,8,null,null,7,4]: node 3 recurses both ways. The left subtree hits 5 immediately — the base case returns it, and 5's own children both report null, so 5 forwards ITSELF. The right subtree finds 1 the same way. Back at 3: both sides non-null → 3 is the split point → the LCA.",
      "For (p=5, q=4): 3's left finds 5; 3's right sweeps nodes 1, 0, 8, 7 and finds only 4 at the bottom, forwarding it up through 1. At 3: left non-null, right null → forward left. The answer is 5 — produced by the 'root.val == p' early return BEFORE 5 ever searched for 4, which is exactly the self-ancestor rule in action.",
      "The 'return left or right' line does double duty: forwarding a found target AND forwarding an already-decided LCA from below. Could a decided LCA be overridden higher up? No — once both sides matched at some node, every ancestor sees exactly one non-null child result (the LCA), so the split-point branch never re-fires. Every node is visited once: O(n) time, O(h) stack.",
    ],
    time: "O(n) — every node may be examined (no ordering to prune)",
    space: "O(h) — recursion stack",
    followUps: [
      "Many queries on one static tree: Tarjan's offline LCA (union-find over a DFS) or binary lifting — O(log n) per query after O(n log n) preprocessing.",
      "If nodes carry parent pointers (LC 1650): the problem collapses to first-intersection-of-two-linked-lists — collect one ancestry chain, climb the other.",
    ],
    related: ["lowest-common-ancestor-of-a-binary-search-tree", "lowest-common-ancestor-of-deepest-leaves"],
    verify: {
      fn: "lowestCommonAncestor",
      wrap: "tree",
      cases: [
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expect: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4] },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expect: [5, 6, 2, null, null, 7, 4] },
        { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 8], expect: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4] },
        { args: [[1, 2], 1, 2], expect: [1, 2] },
        { args: [[1, null, 2, null, 3], 2, 3], expect: [2, null, 3] },
      ],
    },
    xp: 20,
  },
  {
    slug: "binary-search-tree-iterator",
    statement:
      "Run a BST as an inorder sequence on demand. The constructor receives the root; next() hands out the next-smallest value; hasNext() reports whether any remain. The iterator should use O(h) memory — a full traversal dump is the anti-pattern — and average O(1) time per next().",
    examples: [
      { input: '["BSTIterator",[7,3,15,null,null,9,20]] then next, next, hasNext, next, hasNext, next, hasNext, next, hasNext, hasNext', output: "[3,7,true,9,true,15,true,20,false,false]", explanation: "Inorder is 3,7,9,15,20 — next() emits exactly that sequence; once the last value is served the stack is empty, so both trailing hasNext() calls return false (idempotence for free)." },
      { input: '["BSTIterator",[1]] then hasNext, next, hasNext', output: "[true,1,false]", explanation: "A single-node tree: one value available, then the iterator is spent." },
      { input: '["BSTIterator",[3,2,null,1]] then next, next, next, hasNext', output: "[1,2,3,false]", explanation: "A left-leaning chain — the constructor pushes its whole left spine up front, which is allowed since h can equal n." },
    ],
    constraints: ["1 <= nodes <= 10^4", "O(h) memory — h is the tree height", "callers never call next() when hasNext() is false"],
    breakdown: [
      "The lazy answer: inorder-walk the whole tree in the constructor into an array and have next() pop from it. O(n) up-front work and O(n) memory — the problem explicitly budgets O(h), because in real systems you rarely consume an entire traversal and the iterator should pay as it goes.",
      "The controlled-inorder idea: simulate the recursive call stack with an explicit stack, but only push the LEFT SPINE from the root. The stack top is then, by construction, the next inorder node. next() pops it and — the crucial move — pushes the left spine of its RIGHT child before returning. That is exactly the bookkeeping the hidden recursion would do next.",
      "Amortized accounting closes the deal: over the iterator's lifetime every node is pushed once and popped once, so n next() calls trigger n pushes — any single next() is O(h) worst case but O(1) amortized. hasNext() is a stack-emptiness check: O(1), always, no peeking at values.",
    ],
    edges: [
      "Single node: the constructor stacks it; one next() empties the stack and hasNext() flips false.",
      "Left-skewed tree: the constructor pushes the entire spine — O(h) = O(n) memory, which the bound permits since h can equal n.",
      "Right-heavy nodes: a next() on a node with a right child pushes that child's spine; the stack never holds more than one root-to-node path at a time, keeping O(h) honest.",
      "Interleaved next/hasNext calls must behave identically to a bulk drain — the stack state is the entire truth, so no extra counters are needed.",
    ],
    ladder: [
      { title: "Brute force — dump in the constructor", body: "Flatten to a sorted array at construction; next() = shift, hasNext() = index bound. O(n) time up front, O(n) memory — the simplest correct thing, and the follow-up 'can you do O(h) memory?' exists precisely to kill it." },
      { title: "Recursive generator", body: "A Python generator yielding from a recursive inorder holds O(h) frames and hands out values lazily — legitimate and elegant, but it hides the mechanism; the interview wants the stack made explicit." },
      { title: "The optimal idea — explicit stack of left spines", body: "Constructor pushes the root's left spine; next() pops the top, then pushes the popped node's right child's left spine. O(h) memory, O(1) amortized next(), O(1) hasNext()." },
    ],
    approach: "Explicit stack of inorder left spines",
    code: `class BSTIterator:
    def __init__(self, root):
        self.stack = []
        self._push_spine(root)         # ctor work: only the left spine — O(h)

    def _push_spine(self, node):
        while node:                    # walk down-left, remembering the path
            self.stack.append(node)
            node = node.left

    def next(self):
        node = self.stack.pop()        # the smallest unvisited node sits on top
        self._push_spine(node.right)   # its successor: left spine of right child
        return node.val

    def hasNext(self):
        return bool(self.stack)        # nodes waiting ⇒ values remaining`,
    walkthrough: [
      "Construct on [7,3,15,null,null,9,20]: push 7, then 3 → stack [7,3] with 3 on top — correctly the smallest value. hasNext() → true. next(): pop 3; 3 has no right child, so nothing is pushed; return 3. The stack reads [7] and 7 is genuinely next.",
      "next(): pop 7; push the spine of 7's right child — 15, then 15's left 9 → stack [15,9]. Return 7. The next call pops 9 (no right child), then pops 15 and pushes the spine of 20. At every instant the stack mirrors exactly the recursion frames a hand-written inorder would keep between yields.",
      "After popping 20 the stack is empty → hasNext() false. Across the full drain, pushes = pops = n, so the occasionally-expensive next() averages to O(1) — the classic amortized argument. The constructor never touched the right subtrees: work deferred until demanded, which is the entire point of the design.",
    ],
    time: "ctor O(h) · next() O(1) amortized (O(h) worst) · hasNext() O(1)",
    space: "O(h) — one left spine on the stack at any moment",
    followUps: [
      "Could next() be O(1) WORST case? Only with threaded trees (pre-wired successor pointers) or pre-flattening — both trade structure or memory for the guarantee; know the trade, not just the answer.",
      "kth-smallest (LC 230) is this iterator called k times; a DESCENDING iterator mirrors it by pushing right spines and stepping to node.left first.",
    ],
    related: ["kth-smallest-element-in-a-bst", "binary-tree-inorder-traversal"],
    verify: {
      fn: "BSTIterator",
      wrap: "class",
      ctorBuild: "tree",
      cases: [
        {
          args: [[
            ["BSTIterator", [7, 3, 15, null, null, 9, 20]],
            ["next"], ["next"], ["hasNext"], ["next"], ["hasNext"],
            ["next"], ["hasNext"], ["next"], ["hasNext"], ["hasNext"],
          ]],
          expect: [3, 7, true, 9, true, 15, true, 20, false, false],
        },
        { args: [[["BSTIterator", [1]], ["hasNext"], ["next"], ["hasNext"]]], expect: [true, 1, false] },
        { args: [[["BSTIterator", [3, 2, null, 1]], ["next"], ["next"], ["next"], ["hasNext"]]], expect: [1, 2, 3, false] },
        {
          args: [[
            ["BSTIterator", [5, 3, 6, 2, 4, null, 7]],
            ["next"], ["next"], ["hasNext"], ["next"], ["next"], ["next"], ["next"], ["hasNext"],
          ]],
          expect: [2, 3, true, 4, 5, 6, 7, false],
        },
      ],
    },
    xp: 20,
  },
];
