// Deep-dives — Linked List (5, the core set). Original statements/solutions;
// verified by scripts/lc-verify.
import type { LcDeepDive } from "../types";

export const LINKED_LIST: LcDeepDive[] = [
  {
    slug: "reverse-linked-list",
    statement:
      "Given the head of a singly linked list, reverse the direction of every pointer and return the new head. The in-place iterative version is the interview standard; the recursive version is the follow-up.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
      { input: "head = [1,2]", output: "[2,1]" },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["0 <= nodes <= 5000", "O(n) time; O(1) space expected for the iterative version"],
    breakdown: [
      "Reversal is three pointers doing a dance: prev (the already-reversed prefix), cur (the node being re-pointed), and a saved next. The single line cur.next = prev flips one arrow; everything else just advances safely because you saved the rest of the list BEFORE overwriting.",
      "The mental model that survives pressure: the list is two chains — 'reversed so far' (prev) and 'remaining' (cur…). Each iteration moves one node from the right chain to the head of the left chain. When the right chain empties, prev IS the answer.",
      "The recursive version is beautiful and expensive: reverse the rest, then attach head. O(n) time, O(n) call stack — worth writing after the iterative one to show both muscles.",
    ],
    edges: [
      "Empty list — return None immediately (the loop never runs).",
      "Single node — one iteration, prev = the node.",
      "Don't lose the tail: saving nxt before the flip is the whole game.",
    ],
    ladder: [
      { title: "Brute force — copy into an array", body: "Collect values, rebuild the list backwards. O(n) time, O(n) space, and it mutates by re-creation rather than re-pointing — acceptable only as a first sketch." },
      { title: "Recursive reversal", body: "reverse(rest) then head.next.next = head; head.next = None. Elegant; O(n) stack depth — the interviewer will ask for the iterative version next." },
      { title: "The optimal idea — in-place pointer surgery", body: "Three pointers, one flip per node. O(n) time, O(1) space — the canonical answer." },
    ],
    approach: "Iterative three-pointer reversal",
    code: `def reverseList(head):
    prev = None
    cur = head
    while cur:
        nxt = cur.next      # save the rest BEFORE overwriting
        cur.next = prev     # flip the arrow
        prev = cur          # reversed chain grows
        cur = nxt           # walk forward
    return prev             # prev is the new head`,
    walkthrough: [
      "The loop invariant: prev is the head of a fully reversed prefix, cur is the first unprocessed node. One flip moves the boundary forward by one node.",
      "nxt exists purely to survive the flip — without it, cur.next = prev destroys your only way forward. This is the bug every beginner writes exactly once.",
      "When cur becomes None, prev holds the last processed node — the original tail, now the new head. Empty input never enters the loop and returns None as-is.",
    ],
    time: "O(n) — one flip per node",
    space: "O(1) — three pointers",
    followUps: [
      "Reverse every k-group (problem 25): this loop, wrapped in a chunk driver.",
      "Reverse a sublist between positions m and n (problem 92): reverse after walking m−1 steps.",
    ],
    related: ["reverse-linked-list-ii", "reorder-list", "reverse-nodes-in-k-group"],
    verify: {
      fn: "reverseList",
      wrap: "listnode",
      cases: [
        { args: [[1, 2, 3, 4, 5]], expect: [5, 4, 3, 2, 1] },
        { args: [[1, 2]], expect: [2, 1] },
        { args: [[]], expect: [] },
        { args: [[7]], expect: [7] },
      ],
    },
    xp: 10,
  },
  {
    slug: "merge-two-sorted-lists",
    statement:
      "Given the heads of two SORTED linked lists, splice their nodes together into one sorted list and return its head. Nodes must be re-used — no fresh allocations beyond bookkeeping.",
    examples: [
      { input: "list1 = [1,2,4], list2 = [1,3,4]", output: "[1,1,2,3,4,4]" },
      { input: "list1 = [], list2 = []", output: "[]" },
      { input: "list1 = [], list2 = [0]", output: "[0]" },
    ],
    constraints: ["0 <= nodes total <= 50", "-100 <= val <= 100", "both lists sorted non-decreasing"],
    breakdown: [
      "This is the merge step of merge sort, living on pointers. A dummy head eliminates the 'which list starts the result' special case: build onto a dummy, return dummy.next. The tail pointer walks forward, always attaching the smaller current node.",
      "The tie-break (<= vs <) is invisible to correctness here — either side wins ties. Consistency matters more than the choice.",
      "When one list empties, the remainder of the other is already sorted and strictly greater — attach it wholesale with ONE pointer assignment. That final splice is what makes this O(m + n) with zero copying.",
    ],
    edges: [
      "One or both lists empty — the while loop skips and the final splice returns the survivor.",
      "Interleaved values (1,1,1…) — the tie-break just keeps picking.",
      "Entirely non-overlapping ranges — the whole second list attaches in one step.",
    ],
    ladder: [
      { title: "Copy values, rebuild", body: "Extract to arrays, sort or merge, rebuild a new list. Works, but violates the 'reuse nodes' spirit and costs O(m+n) extra space." },
      { title: "Recursive merge", body: "merge(l1, l2): smaller head wins, its next = merge(rest). Elegant, O(m+n) time, O(m+n) stack — the follow-up answer." },
      { title: "The optimal idea — dummy head + tail splice", body: "Iterate with a dummy anchor; attach the smaller head; splice the remainder at the end. O(m+n) time, O(1) space." },
    ],
    approach: "Dummy-head merge (merge sort's merge step)",
    code: `def mergeTwoLists(list1, list2):
    dummy = ListNode()      # anchor — kills the head special case
    tail = dummy
    while list1 and list2:
        if list1.val <= list2.val:
            tail.next = list1
            list1 = list1.next
        else:
            tail.next = list2
            list2 = list2.next
        tail = tail.next
    tail.next = list1 if list1 else list2   # splice the survivor
    return dummy.next`,
    walkthrough: [
      "dummy exists only so the first real node never needs an 'if this is the head' branch; everything builds onto tail.next and the result is dummy.next.",
      "Each iteration attaches exactly one node — the smaller current head — and advances that list. The invariant 'tail is the largest attached node' makes the append trivially safe.",
      "The final splice attaches the leftover list intact: it's already sorted and every value is ≥ tail. Total pointer assignments = m + n + 1.",
    ],
    time: "O(m + n) — every node attached once",
    space: "O(1) — pointers only",
    followUps: [
      "Merge k lists: run this pairwise (O(k·N) total) or with a size-k heap pulling the smallest head (O(N log k)) — problem 23.",
      "Merge sort on a linked list: split at the middle, recurse, merge — this function is the bottom half.",
    ],
    related: ["merge-k-sorted-lists", "sort-list", "insertion-sort-list"],
    verify: {
      fn: "mergeTwoLists",
      wrap: "listnodeTwo",
      cases: [
        { args: [[1, 2, 4], [1, 3, 4]], expect: [1, 1, 2, 3, 4, 4] },
        { args: [[], []], expect: [] },
        { args: [[], [0]], expect: [0] },
        { args: [[5], [1, 2, 3]], expect: [1, 2, 3, 5] },
      ],
    },
    xp: 10,
  },
  {
    slug: "linked-list-cycle",
    statement:
      "A linked list's tail may point back to an earlier node, creating a cycle. Given the head, decide whether a cycle exists — ideally with O(1) memory (the problem's famous follow-up).",
    examples: [
      { input: "head = [3,2,0,-4], pos = 1", output: "true", explanation: "The tail (-4) points back to index 1." },
      { input: "head = [1,2], pos = 0", output: "true" },
      { input: "head = [1], pos = -1", output: "false", explanation: "No cycle — the tail ends at null." },
    ],
    constraints: ["0 <= nodes <= 10^4", "-10^5 <= val <= 10^5", "O(1) memory expected"],
    breakdown: [
      "The hash-set answer: walk the list, remembering visited nodes; a revisit means a cycle. O(n) time, O(n) space — the natural first answer and the baseline to beat.",
      "Floyd's tortoise and hare needs NO memory: slow moves 1 step, fast moves 2. If there's no cycle, fast hits null. If there is one, both runners are trapped on the loop, and each step closes the gap between them by exactly 1 — a gap of size L must hit 0 within L steps. Meeting is proof.",
      "The gap-closing argument is the part worth rehearsing: relative to the slow pointer, the fast pointer gains one position per step, so on a ring it cannot 'jump over' forever — collision is inevitable, typically within one loop length.",
    ],
    edges: [
      "Empty list or single node — no cycle possible; the loop guards (fast and fast.next) skip immediately.",
      "Cycle back to the head itself — still detected.",
      "fast.next.next — the guard fast.next must be checked BEFORE the double step, or you'll dereference null.",
    ],
    ladder: [
      { title: "Brute force — node identity set", body: "Traverse, store id(node) in a set, return true on revisit. O(n) time, O(n) space — correct and the natural baseline." },
      { title: "Marking nodes", body: "Mutate a field (e.g. set val to a sentinel) and detect your own graffiti. Destructive and hacky — worth mentioning only to dismiss." },
      { title: "The optimal idea — Floyd's two runners", body: "Slow +1, fast +2; a non-cyclic list ends fast, a cyclic one guarantees a meeting. O(n) time, O(1) space." },
    ],
    approach: "Floyd's cycle detection (tortoise and hare)",
    code: `def hasCycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next          # +1 step
        fast = fast.next.next     # +2 steps
        if slow is fast:          # met on the ring → cycle
            return True
    return False                  # fast fell off the end`,
    walkthrough: [
      "Two exit conditions: fast reaching the end (no cycle — checked before every double-step) or the runners coinciding (cycle — checked after every step).",
      "On a ring of length L, the fast runner closes the gap by 1 per iteration, so they meet within L steps of the fast one entering — linear work with two pointers and zero auxiliary memory.",
      "'is' (identity), not '==' (equality of values) — two different nodes can carry the same value; the meeting is about node identity.",
    ],
    time: "O(n) — each pointer traverses at most ~2n nodes",
    space: "O(1) — two references",
    followUps: [
      "Find WHERE the cycle begins (problem 142): after meeting, restart one pointer at head; both stepping +1 meet at the entrance — the classic modular arithmetic proof.",
      "Find the cycle's length: once met, walk one pointer until it returns — count the steps.",
    ],
    related: ["linked-list-cycle-ii", "find-the-duplicate-number", "happy-number"],
    verify: {
      fn: "hasCycle",
      wrap: "listnodeCycle",
      cases: [
        { args: [[3, 2, 0, -4], 1], expect: true },
        { args: [[1, 2], 0], expect: true },
        { args: [[1], -1], expect: false },
        { args: [[], -1], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "remove-nth-node-from-end-of-list",
    statement:
      "Given the head of a linked list, delete the n-th node counting FROM THE END and return the head — ideally in one pass with O(1) space.",
    examples: [
      { input: "head = [1,2,3,4,5], n = 2", output: "[1,2,3,5]" },
      { input: "head = [1], n = 1", output: "[]" },
      { input: "head = [1,2], n = 1", output: "[1]" },
    ],
    constraints: ["1 <= size <= 30 (on LeetCode; the algorithm is general)", "1 <= n <= size", "one pass expected"],
    breakdown: [
      "Two-pass is trivial: count the length L, delete the (L − n)-th from the front. The one-pass trick is the GAP: lead a fast pointer n+1 steps ahead of a slow one, then advance both together — when fast falls off the end, slow sits exactly BEFORE the doomed node.",
      "The dummy head is what makes deleting the actual HEAD no harder than any other node: slow can start at the dummy, so slow.next = slow.next.next works even when n == length.",
      "Off-by-one accounting is the entire difficulty: the gap must be n+1 nodes (dummy → doomed's predecessor). Walking n+1 from the dummy, not n from the head, is the line to get right.",
    ],
    edges: [
      "Deleting the head (n == length) — the dummy absorbs it.",
      "Single-node list with n = 1 → empty list.",
      "The constraint guarantees n ≤ length, so the fast walk can't overrun.",
    ],
    ladder: [
      { title: "Two passes", body: "Count L, then walk L − n − 1 steps and re-point. O(L + L) = O(n) time, O(1) space — fine, but two traversals." },
      { title: "Recursion counting depth", body: "Unwind to the end, increment a counter on the way back, cut at depth n. One traversal but O(n) stack — cute, not optimal in space." },
      { title: "The optimal idea — fixed-gap two pointers from a dummy", body: "Fast leads by n+1 (from the dummy); move both until fast is null; slow.next skips the victim. One pass, O(1) space." },
    ],
    approach: "Dummy head + gap two pointers",
    code: `def removeNthFromEnd(head, n):
    dummy = ListNode(0, head)   # predecessor of the head
    fast = dummy
    for _ in range(n + 1):      # open a gap of n+1 nodes
        fast = fast.next
    slow = dummy
    while fast:                 # march both to the end
        fast = fast.next
        slow = slow.next
    slow.next = slow.next.next  # skip the doomed node
    return dummy.next`,
    walkthrough: [
      "After the warm-up walk, fast is n+1 nodes ahead of slow — meaning the list behind fast holds exactly n nodes. When fast exits the list, those n nodes have all been walked: slow lands on the node BEFORE the n-th-from-end.",
      "The re-point slow.next = slow.next.next unlink the victim with no traversal — the Python garbage collector frees it; in C you'd also free(node).",
      "dummy.next is returned rather than head, because the head itself may have been the node removed (n == length).",
    ],
    time: "O(L) — one traversal",
    space: "O(1)",
    followUps: [
      "Delete the middle node: the gap becomes proportional (slow/fast with 2× speed).",
      "Swap pairs / rotate list: the same dummy + walk machinery, different final splice.",
    ],
    related: ["remove-duplicates-from-sorted-list-ii", "rotate-list", "linked-list-cycle"],
    verify: {
      fn: "removeNthFromEnd",
      wrap: "listnodeIdx",
      cases: [
        { args: [[1, 2, 3, 4, 5], 2], expect: [1, 2, 3, 5] },
        { args: [[1], 1], expect: [] },
        { args: [[1, 2], 1], expect: [1] },
        { args: [[1, 2], 2], expect: [2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "reorder-list",
    statement:
      "Reorder a list L₀ → L₁ → … → Lₙ₋₁ into L₀ → Lₙ₋₁ → L₁ → Lₙ₋₂ → … — alternating first-last-second-last — by re-pointing nodes IN PLACE (no value swapping, no new nodes).",
    examples: [
      { input: "head = [1,2,3,4]", output: "[1,4,2,3]" },
      { input: "head = [1,2,3,4,5]", output: "[1,5,2,4,3]" },
      { input: "head = [1]", output: "[1]" },
    ],
    constraints: ["1 <= length <= 5·10^4", "in-place modification, O(1) extra space"],
    breakdown: [
      "No single pointer trick produces the interleave — but three classics COMPOSE: (1) find the middle with slow/fast runners, (2) reverse the second half (the reverse-linked-list loop), (3) weave the two halves zipper-style. Each step is a problem you already know.",
      "The middle-finding detail: stop slow at the END of the first half so the split is clean. The guard 'fast.next and fast.next.next' leaves slow on the last node of the left half; cutting slow.next = None isolates both halves.",
      "The weave terminates on the SECOND half: after reversal it is never longer than the first, so 'while second' with manual next-saving merges every pair without stepping past the end.",
    ],
    edges: [
      "Odd length — the middle node belongs to the first half and lands naturally at the end.",
      "Length 1 and 2 — the loops no-op and the list is already 'reordered'.",
      "Saving next pointers inside the weave loop is mandatory — overwriting first.next destroys your path forward.",
    ],
    ladder: [
      { title: "Brute force — array of nodes", body: "Copy node references into a list, weave by index, re-point. O(n) time and O(n) space — the constraint violation is the point of the problem." },
      { title: "Deque of nodes", body: "Pop from both ends of a deque to build the order. Same O(n) space; simpler weaving, same verdict." },
      { title: "The optimal idea — middle + reverse + weave", body: "Three standard list operations composed. O(n) time, O(1) space, and every step is a previously-learned pattern." },
    ],
    approach: "Find middle → reverse second half → zipper weave",
    code: `def reorderList(head):
    # 1) split at the middle (slow ends the first half)
    slow, fast = head, head
    while fast.next and fast.next.next:
        slow = slow.next
        fast = fast.next.next
    # 2) reverse the second half
    second = slow.next
    slow.next = None                # cut the list in two
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev = second
        second = nxt
    # 3) weave: one from each side, alternating
    first, second = head, prev
    while second:
        n1, n2 = first.next, second.next   # save both paths
        first.next = second
        second.next = n1
        first, second = n1, n2`,
    walkthrough: [
      "Step 1 is the classic runners walk; the double guard leaves slow at the first half's last node for BOTH parities — even lists split evenly, odd lists leave the middle node with the first half.",
      "Step 2 is the reverse-linked-list loop verbatim, applied to the second half; prev ends as the reversed head. slow.next = None is the cut that makes the two halves independent.",
      "Step 3 zips: attach the reversed half's head after the forward half's head, cross-link forward, advance both. 'while second' suffices because the reversed half is the shorter (or equal) one; the final node of an odd list is already in place.",
    ],
    time: "O(n) — three linear passes",
    space: "O(1) — pointer surgery only",
    followUps: [
      "Palindromic linked list: same middle + reverse, then compare halves — the same toolkit.",
      "Reverse nodes in k-group: chunk-wise application of the reverse loop with re-attachment bookkeeping.",
    ],
    related: ["reverse-linked-list", "palindrome-linked-list", "linked-list-cycle"],
    verify: {
      fn: "reorderList",
      wrap: "listnodeInPlace",
      cases: [
        { args: [[1, 2, 3, 4]], expect: [1, 4, 2, 3] },
        { args: [[1, 2, 3, 4, 5]], expect: [1, 5, 2, 4, 3] },
        { args: [[1]], expect: [1] },
      ],
    },
    xp: 20,
  },
];
