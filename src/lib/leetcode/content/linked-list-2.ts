// Deep-dives — Linked List, part 2 (NC150-extras + TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const LINKED_LIST_2: LcDeepDive[] = [
  {
    slug: "copy-list-with-random-pointer",
    statement:
      "Each node of a linked list carries a next pointer AND a random pointer that can land on any node in the list — or on null. Build a deep copy: a completely new set of nodes wired identically by both next and random, sharing nothing with the original list.",
    examples: [
      { input: "head = [[7,null],[13,0],[11,4],[10,2],[1,0]]", output: "[[7,null],[13,0],[11,4],[10,2],[1,0]]", explanation: "Each pair is [val, random index]; the copy, re-indexed in traversal order, matches the original exactly." },
      { input: "head = [[1,1],[2,1]]", output: "[[1,1],[2,1]]", explanation: "Both random pointers land on the second node — including a node pointing at itself." },
      { input: "head = [[3,null],[3,0],[3,null]]", output: "[[3,null],[3,0],[3,null]]", explanation: "Equal values are still distinct nodes; the copy must preserve node identity, not just values." },
    ],
    constraints: ["0 <= list length <= 1000", "-10^4 <= node.val <= 10^4", "each random index is null or in [0, length)"],
    breakdown: [
      "A one-pass copy dies on the random pointers: when you clone node 11, its random may point at a node you have not cloned yet, and you have nowhere to write the link. The hash-map answer accepts that delay: pass one clones every node and records original → copy; pass two walks again and wires next and random through lookups. Two passes, O(n) time and O(n) space — the baseline every interviewer expects to hear first.",
      "The O(1)-space classic removes the lookup entirely by INTERLEAVING: after every original node, splice in its clone, so the list reads A → A' → B → B' → …. The phrase 'the clone of X' now literally means X.next — wiring randoms becomes reading one pointer ahead, no map required anywhere.",
      "What remains is unweaving: split the braid back into the original (restored untouched — interviewers check) and the copy (returned). Three linear passes, and the only extra memory is the output nodes themselves.",
    ],
    edges: [
      "Empty list — return None before any pointer work.",
      "random = null — guard the pass-two wiring with 'if cur.random', or you dereference null.",
      "Self-random node ([[1,0]]) — the clone must point at ITS OWN clone, not at the original.",
      "The original list must emerge unharmed — pass three restores every original next pointer.",
    ],
    ladder: [
      { title: "Brute force — hash map of original → copy", body: "Clone all nodes in one pass while bookkeeping the map; second pass wires both pointers via lookups. O(n) time and O(n) space; correct and the natural first answer." },
      { title: "Recursive clone with memo", body: "Clone head, recursively clone the rest; the same map guards against re-cloning through random pointers. Same complexity plus O(n) stack — elegant, not better." },
      { title: "The optimal idea — interleave, wire, unweave", body: "Splice each clone directly after its original; random links become cur.random.next reads; then split the braid in place. O(n) time, O(1) extra space." },
    ],
    approach: "Interleave-weave clone (O(1) extra space)",
    code: `def copyRandomList(head):
    if not head:
        return None
    # Pass 1: interleave — insert a clone directly after every original.
    cur = head
    while cur:
        copy = ListNode(cur.val)   # brand-new node, same value
        copy.next = cur.next
        copy.random = None
        cur.next = copy
        cur = copy.next
    # Pass 2: wire the clones' random pointers via adjacency.
    # (getattr: a null random may simply be absent on the input nodes.)
    cur = head
    while cur:
        rnd = getattr(cur, "random", None)
        if rnd:
            cur.next.random = rnd.next  # clone's random = original's random's clone
        cur = cur.next.next             # hop clone -> next original
    # Pass 3: unweave into two independent lists.
    dummy = ListNode(0)
    tail = dummy
    cur = head
    while cur:
        copy = cur.next
        cur.next = copy.next   # restore the original's forward link
        tail.next = copy       # append the clone to the result
        tail = copy
        cur = cur.next         # next original (after the restore)
    return dummy.next`,
    walkthrough: [
      "Pass one is pure insertion: for each original X, create X' and thread it X → X' → (old successor). Nothing about the original's links is lost — X'.next saved the old successor, and pass three will restore it.",
      "Pass two exploits adjacency: X'.random = X.random.next, because every clone now sits exactly one step after its original. A null random yields a null clone-random; cur then hops two nodes to reach the next original.",
      "Pass three walks pairs: unlink X' (X.next = X'.next), append X' to the result chain via a dummy tail, advance. Every original pointer is restored, every clone is appended in order — trace [[7,null],[13,0],[11,4],[10,2],[1,0]]: 13'.random = 7', 11'.random = 1' (11.random is node 1, and node 1's clone is one .next away). The result re-indexes identically.",
    ],
    time: "O(n) — three linear passes over the interleaved 2n nodes",
    space: "O(1) extra — the n clones are the output, not auxiliary memory",
    followUps: [
      "Clone a general GRAPH with random-like edges (problem 133): the weave breaks the moment a node has two predecessors — you need the visited map (or memoized recursion) after all.",
      "Encode a random-pointer list as text and decode it back — the [val, random-index] output format is exactly that serialization; think through why indices and not values.",
    ],
    related: ["clone-graph", "linked-list-cycle", "odd-even-linked-list"],
    verify: {
      fn: "copyRandomList",
      wrap: "listnodeRandom",
      cases: [
        { args: [[[7, null], [13, 0], [11, 4], [10, 2], [1, 0]]], expect: [[7, null], [13, 0], [11, 4], [10, 2], [1, 0]] },
        { args: [[[1, 1], [2, 1]]], expect: [[1, 1], [2, 1]] },
        { args: [[[3, null], [3, 0], [3, null]]], expect: [[3, null], [3, 0], [3, null]] },
        { args: [[[1, 0]]], expect: [[1, 0]] },
        { args: [[]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "add-two-numbers",
    statement:
      "Two non-empty linked lists store non-negative integers with one digit per node, least-significant digit FIRST. Add the two numbers and return the sum as a list in the same reversed form.",
    examples: [
      { input: "l1 = [2,4,3], l2 = [5,6,4]", output: "[7,0,8]", explanation: "342 + 465 = 807, stored reversed." },
      { input: "l1 = [0], l2 = [0]", output: "[0]" },
      { input: "l1 = [9,9,9,9,9,9,9], l2 = [9,9,9,9]", output: "[8,9,9,9,0,0,0,1]", explanation: "The surviving carry creates a new most-significant node." },
    ],
    constraints: ["1 <= nodes per list <= 100", "0 <= node.val <= 9", "no leading zeros in either number, except the number 0 itself"],
    breakdown: [
      "Reverse order is a gift, not a quirk: the ones digit sits at the head, which is exactly where addition begins. Elementary-school addition maps one-to-one onto a pointer walk — per position, total = digit1 + digit2 + carry, emit total % 10, keep carry = total // 10.",
      "There are two classic ways to drop digits: unequal lengths (one list ends early) and the surviving carry (the sum is one digit longer than both inputs). The loop condition 'while l1 or l2 or carry' absorbs both — a missing list contributes digit 0, and a lone carry earns its own final iteration.",
      "Build onto a dummy head with a tail pointer, the same anchor pattern as merging: every iteration allocates exactly one fresh node for the emitted digit. Column sums top out at 9 + 9 + 1 = 19, so the carry is always 0 or 1 — the arithmetic never surprises you.",
    ],
    edges: [
      "Different lengths — the 'if l1' / 'if l2' guards treat an exhausted list as digit 0.",
      "Final carry — 'or carry' in the loop condition emits the extra leading node ([5] + [5] → [0,1]).",
      "Zero + zero — a single [0] node, not an empty list.",
    ],
    ladder: [
      { title: "Brute force — decode, add, re-encode", body: "Walk each list into an integer, add, rebuild the digits. Fixed-width languages overflow instantly — the exercise IS the digit stream, and converting to big integers sidesteps the point." },
      { title: "Pad the shorter list with zero nodes", body: "Equalize lengths up front, then add column by column. Correct, but allocates filler nodes and does two passes where one sweep suffices." },
      { title: "The optimal idea — stream addition with a carry flag", body: "One pass to the longer list, guards instead of padding, 'or carry' as the loop condition, dummy head for the result. O(max(m, n)) time." },
    ],
    approach: "Digit-stream addition (dummy head + carry)",
    code: `def addTwoNumbers(l1, l2):
    dummy = ListNode()          # anchor for the result
    tail = dummy
    carry = 0
    while l1 or l2 or carry:    # surviving carry -> one extra digit
        total = carry
        if l1:
            total += l1.val     # missing list contributes 0
            l1 = l1.next
        if l2:
            total += l2.val
            l2 = l2.next
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
    return dummy.next`,
    walkthrough: [
      "Each iteration produces exactly one output node: divmod(total, 10) splits the column sum into emit and carry. The invariant: after emitting, the carry equals everything the remaining digits still owe.",
      "Trace [2,4,3] + [5,6,4] (342 + 465): 2+5 → emit 7; 4+6=10 → emit 0, carry 1; 3+4+1=8 → emit 8, carry 0. The loop ends with l1, l2 and carry all exhausted — result [7,0,8].",
      "Trace [9,9,9,9,9,9,9] + [9,9,9,9]: the first column emits 8; the next three emit 9 with carry 1; the three unmatched 9s emit 0,0,0 still carrying 1; 'or carry' runs one more iteration → the leading 1. Result [8,9,9,9,0,0,0,1] — the final-carry edge made visible.",
    ],
    time: "O(max(m, n)) — one column per node of the longer list, plus at most one carry iteration",
    space: "O(max(m, n)) — the result list itself",
    followUps: [
      "Forward-order digits (problem 445, add-two-numbers-ii): the ones digit hides at the tail — reverse both lists first, or push values onto stacks and pop them in addition order.",
      "The same stream machine subtracts (borrow replaces carry) and multiplies (shift-and-add) — digit-position discipline is the transferable skill.",
    ],
    related: ["add-two-numbers-ii", "add-strings", "multiply-strings"],
    verify: {
      fn: "addTwoNumbers",
      wrap: "listnodeTwo",
      cases: [
        { args: [[2, 4, 3], [5, 6, 4]], expect: [7, 0, 8] },
        { args: [[0], [0]], expect: [0] },
        { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expect: [8, 9, 9, 9, 0, 0, 0, 1] },
        { args: [[5], [5]], expect: [0, 1] },
        { args: [[1, 8], [0]], expect: [1, 8] },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-the-duplicate-number",
    statement:
      "An array of n + 1 integers where every value lies in [1, n] must contain a repeat. Exactly one value is duplicated — possibly many times. Find it WITHOUT modifying the array and using only constant extra space.",
    examples: [
      { input: "nums = [1,3,4,2,2]", output: "2" },
      { input: "nums = [3,1,3,4,2]", output: "3" },
    ],
    constraints: ["nums.length == n + 1, values in [1, n]", "exactly one duplicated value; it may repeat more than twice", "do not modify the array", "O(1) extra space expected"],
    breakdown: [
      "The two natural answers are both outlawed: sorting mutates the array, a hash set needs O(n) space. The constraints are not decoration — they specify a very particular proof, and naming the forbidden pair out loud is part of a complete answer.",
      "Read the array as a linked list: position i contains a pointer to position nums[i]. Start at index 0 and follow i → nums[i] forever. No value equals 0, so index 0 is never re-entered — the walk runs down a tail and into a cycle, and the cycle's ENTRY is a position that two different indices point into: the duplicated value d. Find the entry, find the duplicate.",
      "Floyd's tortoise and hare finds that entry in O(n) time and O(1) space, in two phases: phase one detects any meeting point inside the cycle with speed 1 vs speed 2; phase two restarts one pointer at the pseudo-head and advances both by one — they collide exactly at the entry. The phase-two claim is the whole problem; the proof is a two-line modular argument worth writing out by hand.",
    ],
    edges: [
      "Duplicate repeated many times ([2,2,2,2,2]) — the implicit list collapses to a self-loop at 2; the proof still lands.",
      "Adjacent duplicate at the front ([1,1]) — a tail of length one.",
      "Index 0 is a pseudo-head, never a cycle node (values ≥ 1) — start the walk AT 0, not at nums[0], to keep the entry arithmetic clean.",
      "Phase two moves BOTH pointers in lockstep until equal — resetting only one pointer is the classic broken variant.",
    ],
    ladder: [
      { title: "Brute force — hash set (or sort)", body: "O(n) space or mutation; both violate an explicit constraint. Name them, then dismiss them." },
      { title: "Binary search on the VALUE range", body: "Count entries ≤ mid; a count above mid means the duplicate is ≤ mid. O(n log n) time, O(1) space, no mutation — clever and legit, just not linear." },
      { title: "The optimal idea — Floyd on the implicit list", body: "Tortoise and hare over i → nums[i]; the cycle entrance is the duplicate. O(n) time, O(1) space, zero mutation — the constraints' only survivor." },
    ],
    approach: "Floyd's tortoise-and-hare cycle entry on i → nums[i]",
    code: `def findDuplicate(nums):
    # The array IS a list: index i points to index nums[i].
    # Index 0 is a pseudo-head no edge returns to (values are >= 1).
    slow = fast = 0
    while True:                  # phase 1: meet inside the cycle
        slow = nums[slow]        # tortoise: one hop
        fast = nums[nums[fast]]  # hare: two hops
        if slow == fast:
            break
    slow = 0                     # phase 2: restart one pointer at the start
    while slow != fast:          # both advance one hop -> meet at the entrance
        slow = nums[slow]
        fast = nums[fast]
    return slow                  # the entrance IS the duplicate value`,
    walkthrough: [
      "Phase one: slow = nums[slow], fast = nums[nums[fast]], both starting at 0. The walk is eventually periodic, so a meeting point exists; once both runners are trapped on the cycle, the gap between them closes by one per iteration.",
      "The entry proof: let μ be the tail length and λ the cycle length. At the meeting, slow has traveled d and fast 2d; both stand on the cycle, so 2d ≡ d (mod λ) — d is a multiple of λ. Writing d = μ + t, the meeting point sits (−μ) mod λ steps past the entry; stepping μ more from the meeting therefore lands on the entry, exactly as stepping μ from the start does. Two pointers advancing one hop each collide AT the entry.",
      "Trace [1,3,4,2,2]: the walk is 0 → 1 → 3 → 2 → 4 → 2 → …, entry 2. Phase one meets at node 4; phase two walks 0→1 / 4→2, then 1→3 / 2→4, then 3→2 / 4→2 — colliding at 2. Return 2.",
    ],
    time: "O(n) — phase one is bounded by μ + λ hops, phase two by exactly μ",
    space: "O(1) — two integer indices",
    followUps: [
      "Linked List Cycle II (142) is the identical proof on a real list — the phase-two argument transfers verbatim.",
      "When the value range is not guaranteed, the implicit list breaks; binary search on values keeps O(1) space at O(n log n) time — know when each applies.",
    ],
    related: ["linked-list-cycle-ii", "first-missing-positive", "missing-number"],
    verify: {
      fn: "findDuplicate",
      wrap: "plain",
      cases: [
        { args: [[1, 3, 4, 2, 2]], expect: 2 },
        { args: [[3, 1, 3, 4, 2]], expect: 3 },
        { args: [[1, 1]], expect: 1 },
        { args: [[2, 2, 2, 2, 2]], expect: 2 },
        { args: [[9, 8, 7, 6, 5, 4, 3, 2, 1, 9]], expect: 9 },
      ],
    },
    xp: 20,
  },
  {
    slug: "lru-cache",
    statement:
      "Design a key-value cache with fixed capacity and O(1) get and put. get(key) returns the stored value or -1 on a miss; put(key, value) inserts or updates. When capacity is exceeded, the LEAST RECENTLY USED entry is evicted — and using a key (a get or a put on it) makes it most-recently used.",
    examples: [
      { input: "LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), put(4,4), get(1), get(3), get(4)", output: "get → 1, get → -1, get → -1, get → 3, get → 4", explanation: "put(3,3) evicts key 2 (least recently used); put(4,4) evicts key 1." },
      { input: "LRUCache(1), put(1,1), get(1), put(2,2), get(1), get(2)", output: "get → 1, get → -1, get → 2", explanation: "Capacity 1: every put after the first evicts." },
    ],
    constraints: ["1 <= capacity <= 3000", "0 <= key, value <= 10^4", "at most 2·10^4 calls total", "O(1) average time per operation expected"],
    breakdown: [
      "The binding contract is O(1) per operation. A dict alone fails on eviction — 'find the least recently used key' is a scan. An array fails twice — lookup is a scan and so is eviction. The structure must make FIND and REORDER both constant-time, and no single stock container does it.",
      "Recency is an ORDER, and the container that reorders in O(1) is a doubly linked list: most-recent at the head, least-recent just before the tail sentinel. 'Use X' becomes two pointer surgeries — unlink X from wherever it sits, push it right after the head. Eviction is reading tail.prev.",
      "The hash map supplies the missing half: key → node, so get and put can FIND the node in O(1) before the list repositions it. Sentinels at both ends erase every empty-list and single-item special case. This is the standard machinery; Python's OrderedDict is the same design under a friendlier name.",
    ],
    edges: [
      "put on an EXISTING key is an update AND a use — refresh recency, do not just overwrite the value.",
      "get on a missing key returns -1 and must NOT disturb the recency order.",
      "Evicting down to empty then refilling — the sentinels keep unlink+push safe at every size.",
      "capacity 1 churn — every put evicts the previous sole occupant.",
    ],
    ladder: [
      { title: "Brute force — array of (key, value) pairs", body: "Linear scan to find, linear shift to move-to-front, linear scan to evict. O(capacity) per operation; fine for capacity 10, fails the contract in general." },
      { title: "Dict + timestamps, scan on eviction", body: "get/put become O(1) by stamping use-time; eviction scans for the smallest stamp. One operation per cycle is still O(n) — the scan was the whole problem." },
      { title: "The optimal idea — dict for lookup, doubly linked list for order", body: "Map finds the node; the list repositions it with an O(1) unlink+push. Eviction reads tail.prev. Every operation is a constant number of pointer moves." },
    ],
    approach: "Hash map + doubly linked list with sentinels",
    code: `class LRUCache:
    class _Node:
        def __init__(self, key=0, val=0):
            self.key = key
            self.val = val
            self.prev = None
            self.next = None

    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}                 # key -> node
        self.head = self._Node()      # sentinel: MRU side
        self.tail = self._Node()      # sentinel: LRU side
        self.head.next = self.tail
        self.tail.prev = self.head

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_front(self, node):
        node.next = self.head.next
        node.prev = self.head
        self.head.next.prev = node
        self.head.next = node

    def get(self, key):
        node = self.map.get(key)
        if not node:
            return -1                 # a miss changes nothing
        self._unlink(node)
        self._push_front(node)        # a hit is a use -> MRU
        return node.val

    def put(self, key, value):
        node = self.map.get(key)
        if node:
            node.val = value          # update is also a use
            self._unlink(node)
            self._push_front(node)
            return
        if len(self.map) >= self.cap:
            lru = self.tail.prev      # evict the least recently used
            self._unlink(lru)
            del self.map[lru.key]
        node = self._Node(key, value)
        self.map[key] = node
        self._push_front(node)`,
    walkthrough: [
      "The list holds ONLY recency; the dict holds ONLY lookup. Every successful get or put runs the same two-step: unlink the node, push it after the head sentinel. The invariant — list order equals recency order, head is MRU, tail.prev is LRU — is maintained incrementally, never recomputed.",
      "Trace the classic sequence on capacity 2: put(1,1), put(2,2) → list [2,1]; get(1) returns 1 and reorders to [1,2]; put(3,3) overflows, tail.prev is node 2, evicted; get(2) misses → -1.",
      "put(4,4) overflows again, evicting tail.prev = node 1; the final gets return 3 and 4. A put on an EXISTING key (case 3's put(1,10) after put(1,1)) walks the same path — update value, unlink, push front — so the refreshed key survives the very next overflow while the unrefreshed one is evicted. Count the work: each operation touched one map slot and at most four pointers — no scans anywhere, which is the O(1) claim made concrete.",
    ],
    time: "O(1) per get and put",
    space: "O(capacity) — one dict entry and one list node per cached key",
    followUps: [
      "OrderedDict with move_to_end and popitem(last=False) is this exact machinery one line each — be able to explain the pointers it manages before leaning on it.",
      "LFU (problem 460) swaps the eviction rule and needs a second axis — frequency buckets — layered on top of this recency list.",
    ],
    related: ["lfu-cache", "design-hashmap", "maximum-frequency-stack"],
    verify: {
      fn: "LRUCache",
      wrap: "class",
      voidOps: ["put"],
      cases: [
        {
          args: [[
            ["LRUCache", 2], ["put", 1, 1], ["put", 2, 2], ["get", 1],
            ["put", 3, 3], ["get", 2], ["put", 4, 4], ["get", 1], ["get", 3], ["get", 4],
          ]],
          expect: [1, -1, -1, 3, 4],
        },
        {
          args: [[["LRUCache", 1], ["put", 1, 1], ["get", 1], ["put", 2, 2], ["get", 1], ["get", 2]]],
          expect: [1, -1, 2],
        },
        {
          args: [[["LRUCache", 2], ["put", 1, 1], ["put", 2, 2], ["put", 1, 10], ["put", 3, 3], ["get", 1], ["get", 2]]],
          expect: [10, -1],
        },
        {
          args: [[["LRUCache", 2], ["put", 2, 1], ["put", 1, 1], ["get", 2], ["put", 3, 3], ["get", 2]]],
          expect: [1, 1],
        },
        {
          args: [[["LRUCache", 2], ["get", 7]]],
          expect: [-1],
        },
      ],
    },
    xp: 20,
  },
  {
    slug: "merge-k-sorted-lists",
    statement:
      "You are given an array of k linked lists, each individually sorted in ascending order. Merge them all into ONE sorted list by re-linking the existing nodes, and return its head.",
    examples: [
      { input: "lists = [[1,4,5],[1,3,4],[2,6]]", output: "[1,1,2,3,4,4,5,6]" },
      { input: "lists = [[]]", output: "[]", explanation: "An empty chain contributes nothing." },
      { input: "lists = [[],[1]]", output: "[1]" },
    ],
    constraints: ["k == lists.length (0 <= k <= 10^4)", "0 <= total nodes N <= 10^4", "each list sorted ascending, values in [-10^4, 10^4]", "O(N log k) expected"],
    breakdown: [
      "Folding pairwise works but wastes comparisons: merge list 1 into the accumulator, then list 2, then list 3… Each fold re-walks a GROWING result, so early values get compared once per remaining list — O(k·N) in the worst case. The waste is re-examining nodes that were already compared.",
      "A min-heap of the k current heads restores sanity: pop the globally smallest unattached node in O(log k), attach it, and push that list's NEXT head as its replacement. Every node enters the heap once and leaves once — O(N log k) total, and log k versus k is the entire optimization.",
      "One Python landmine: heap entries compare as tuples, and ListNode has no ordering — so each entry is (val, listIndex, node), letting ties fall to the unique index before the node object is ever reached. The dummy-head tail-splice from merge-two-sorted-lists does the attaching.",
    ],
    edges: [
      "Empty chains inside the array, or an empty array — skip None heads when seeding; the loop simply ends when the heap empties (no trailing splice, unlike the two-list merge).",
      "One list much longer than the rest — the heap drains to a single element and the tail walks it.",
      "Equal values across different lists — the index tie-break keeps comparisons total and deterministic.",
    ],
    ladder: [
      { title: "Brute force — collect, sort, rebuild", body: "Copy all values into one array, sort, rebuild a list. O(N log N) time and O(N) extra space; it ignores the k-way sortedness you were handed." },
      { title: "Pairwise folding with mergeTwoLists", body: "Merge the accumulator with list i for i = 1…k−1. O(N·k) worst case — correct, and the natural interview follow-up target ('can you do better?')." },
      { title: "The optimal idea — heap of k heads", body: "Priority queue over the current head of each list; pop-attach-push. O(N log k) time, O(k) space. A tournament/loser tree reaches the same bound with different constants." },
    ],
    approach: "Min-heap of k heads (k-way merge)",
    code: `import heapq

def mergeKLists(*lists):    # each chain arrives as its own argument
    dummy = ListNode()
    tail = dummy
    heap = [(node.val, i, node)            # i: unique tie-breaker so the
            for i, node in enumerate(lists) if node]   # node is never compared
    heapq.heapify(heap)
    while heap:
        _, i, node = heapq.heappop(heap)   # smallest unattached head wins
        tail.next = node
        tail = node
        if node.next:                      # feed that list's next head
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next`,
    walkthrough: [
      "Seeding: at most k entries — the first node of each non-empty list — heapified in O(k). The invariant: the heap contains exactly the smallest UNATTACHED node of every list still contributing.",
      "Each iteration pops the global minimum (which is provably the next node of the answer), splices it onto the tail, and pushes its successor. The result is built strictly in sorted order with no re-scanning.",
      "Trace [[1,4,5],[1,3,4],[2,6]]: heap {1₀, 1₁, 2₂} → pop 1₀, push 4₀ → pop 1₁, push 3₁ → pop 2₂, push 6₂ → pop 3₁, push 4₁ → pop 4₀, push 5₀ → pop 4₁ → pop 5₀ → pop 6₂. Output 1,1,2,3,4,4,5,6 — every comparison was made against at most k candidates.",
    ],
    time: "O(N log k) — every node passes through a heap of size ≤ k",
    space: "O(k) — the heap holds one entry per list",
    followUps: [
      "Smallest range covering elements from k lists (problem 632) reuses this exact heap-of-heads skeleton with different bookkeeping.",
      "Sort a linked list (problem 148): merge sort applies the two-list merge bottom-up; compare its constants against the heap when k is small.",
    ],
    related: ["merge-two-sorted-lists", "sort-list", "smallest-range-covering-elements-from-k-lists"],
    verify: {
      fn: "mergeKLists",
      wrap: "listnodeArray",
      cases: [
        { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expect: [1, 1, 2, 3, 4, 4, 5, 6] },
        { args: [[[]]], expect: [] },
        { args: [[[], []]], expect: [] },
        { args: [[[], [1]]], expect: [1] },
        { args: [[[-2, 1, 4], [0], [3, 9]]], expect: [-2, 0, 1, 3, 4, 9] },
        { args: [[[5, 6]]], expect: [5, 6] },
      ],
    },
    xp: 35,
  },
  {
    slug: "reverse-nodes-in-k-group",
    statement:
      "Given a linked list and an integer k, reverse the nodes of the list k at a time and return the result. If the number of remaining nodes is not a multiple of k, the final partial group stays in its original order. Values stay in their nodes — only pointers move.",
    examples: [
      { input: "head = [1,2,3,4,5], k = 2", output: "[2,1,4,3,5]" },
      { input: "head = [1,2,3,4,5], k = 3", output: "[3,2,1,4,5]", explanation: "Nodes 4 and 5 do not fill a group — they keep their order." },
      { input: "head = [1], k = 1", output: "[1]" },
    ],
    constraints: ["1 <= list length <= 5000", "1 <= k <= length", "O(1) extra memory expected — re-point nodes, do not swap values"],
    breakdown: [
      "The unit of work is the reverse-linked-list loop applied to a k-node window; the entire difficulty lives in the DRIVERS: how do you know a full window remains, and how do you attach the reversed group to everything that came before? Getting either wrong splices the list into a cycle or silently drops nodes.",
      "The discipline is count-then-commit: before reversing, walk k nodes ahead from the group's head. If you run out early, the leftover tail must stay in original order — stop. Only a confirmed window gets reversed, which means the count walk and the reverse walk are separate, deliberate loops.",
      "After reversing a window, the ORIGINAL head has become the group's tail, and the node after the k-th is the next group's head — so the attachment head.next = reverseKGroup(nextGroup) makes recursion the cleanest driver. An iterative version does the identical bookkeeping with a dummy and a 'previous group's tail' pointer.",
    ],
    edges: [
      "k = 1 — reversal is the identity; the code should degrade to walking through unchanged.",
      "k equals the length — exactly one group, whole list reversed.",
      "Length not a multiple of k — the final partial group stays untouched (the most-failed hidden test).",
      "Empty list or single node — the count-check bails immediately.",
    ],
    ladder: [
      { title: "Brute force — value array", body: "Copy values out, reverse each k-chunk in the array, rebuild the list. O(n) time and O(n) space; it violates the re-pointer spirit and the O(1)-space expectation." },
      { title: "Iterative driver with a dummy", body: "Track the previous group's tail; for each group, count-check, reverse in place, re-link both seams. Same O(1) space, more fiddly pointers — the production version." },
      { title: "The optimal idea — check, reverse, recurse", body: "Count k ahead; reverse the confirmed window in place; recurse on the remainder and attach. O(n) time, O(n/k) stack depth." },
    ],
    approach: "Count-check, in-place k-reverse, recursive attach",
    code: `def reverseKGroup(head, k):
    # Check that k nodes actually remain; otherwise stop at head.
    node = head
    for _ in range(k):
        if not node:
            return head
        node = node.next
    # Reverse exactly k nodes: prev ends as the group's new head.
    prev = None
    cur = head
    for _ in range(k):
        nxt = cur.next
        cur.next = prev
        prev = cur
        cur = nxt
    # head is now this group's TAIL; attach the recursively handled rest.
    head.next = reverseKGroup(cur, k)
    return prev`,
    walkthrough: [
      "reverseKGroup handles one group and delegates: the guard loop walks k nodes (returning head unchanged if the list ends first — that is the partial-group rule), and the reverse loop flips exactly k arrows, leaving prev at the new head and cur at the next group's first node.",
      "The elegant line is head.next = reverseKGroup(cur, k): head is the ORIGINAL group head, which after reversal is the group's tail — its next must be the recursively processed remainder. Each stack frame owns exactly one window; the base case is the short-tail check.",
      "Trace [1,2,3,4,5], k=2: window 1,2 reverses to 2,1 and recurses on [3,4,5]; window 3,4 reverses to 4,3 and recurses on [5]; the count-check fails for 5, so it is returned as-is and 3.next = 5. Result [2,1,4,3,5] — note node 5 kept its position.",
    ],
    time: "O(n) — each node is visited once by the checker or once by the reverser",
    space: "O(n/k) recursion — O(1) with the iterative driver",
    followUps: [
      "Swap nodes in pairs is k = 2 — the same machinery with the window size hardcoded.",
      "A growth variant (reverse 1 node, then 2, then 3, …) only changes the driver; the reverse loop stays identical.",
    ],
    related: ["reverse-linked-list", "reverse-linked-list-ii", "swap-nodes-in-pairs"],
    verify: {
      fn: "reverseKGroup",
      wrap: "listnodeArgs",
      cases: [
        { args: [[1, 2, 3, 4, 5], 2], expect: [2, 1, 4, 3, 5] },
        { args: [[1, 2, 3, 4, 5], 3], expect: [3, 2, 1, 4, 5] },
        { args: [[1, 2], 3], expect: [1, 2] },
        { args: [[1], 1], expect: [1] },
        { args: [[1, 2, 3, 4, 5, 6], 6], expect: [6, 5, 4, 3, 2, 1] },
        { args: [[1, 2, 3], 1], expect: [1, 2, 3] },
      ],
    },
    xp: 35,
  },
  {
    slug: "rotate-list",
    statement:
      "Rotate a linked list to the right by k places: the last k nodes move to the front, keeping their relative order. k can be far larger than the list's length.",
    examples: [
      { input: "head = [1,2,3,4,5], k = 2", output: "[4,5,1,2,3]" },
      { input: "head = [0,1,2], k = 4", output: "[2,0,1]", explanation: "4 mod 3 = 1 — rotating by a full length is the identity." },
      { input: "head = [1], k = 99", output: "[1]" },
    ],
    constraints: ["0 <= list length <= 500", "0 <= k <= 2·10^9", "O(1) extra space expected"],
    breakdown: [
      "Rotating right by k moves the last k nodes to the front. The core observation: after the rotation, the list breaks at a KNOWN position — the new tail is the (L − k − 1)-th node from the front — and everything reduces to two pointer re-links.",
      "k can be astronomically larger than the length, so reduce FIRST: k %= length. A rotation by any multiple of the length is the identity and must return the list untouched — missing that early-out is both a correctness bug for degenerate inputs and wasted O(k) work.",
      "Two styles exist: close the list into a ring and break it at the right seam, or measure the tail, cut, and re-link. Both are O(L) time and O(1) space; the measure-cut-relink version never leaves a temporary cycle hanging off the structure.",
    ],
    edges: [
      "k % length == 0 (including k an exact multiple) — return head unchanged.",
      "Empty list or single node — the length walk must guard the modulo against dividing by zero.",
      "k = 1 versus k = L − 1 — near-symmetric rotations where the new-tail index must be exact.",
      "Head mutation — the returned head is usually NOT the input head; code still holding the old head is holding garbage.",
    ],
    ladder: [
      { title: "Brute force — rotate one, k times", body: "Rotate by one place (relink tail to head, cut the new end) and repeat k times. O(k·L) — dies instantly on k = 2·10^9." },
      { title: "Collect into an array", body: "Index arithmetic on an array copy, then rebuild. O(L) time but O(L) space — violates the pointer-surgery expectation." },
      { title: "The optimal idea — measure, modulo, relink", body: "One pass for length and tail; walk to the new tail; cut and re-attach. O(L) time, O(1) space, two relinks total." },
    ],
    approach: "Measure length, modulo k, single seam relink",
    code: `def rotateRight(head, k):
    if not head or not head.next or k == 0:
        return head
    # Measure the length and locate the tail in one walk.
    length = 1
    tail = head
    while tail.next:
        tail = tail.next
        length += 1
    k %= length                # rotating length times is the identity
    if k == 0:
        return head
    # New tail = node at index length - k - 1 (0-based).
    new_tail = head
    for _ in range(length - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None       # cut the seam
    tail.next = head           # old tail -> old head
    return new_head`,
    walkthrough: [
      "Pass one finds the length AND the tail in the same walk — the tail pointer is needed for the final re-link, so grabbing it for free matters. The early guards (empty, single node, k = 0) make the modulo safe.",
      "The new tail sits at index L − k − 1 (0-based): the node just before the last k nodes. Walking L − k − 1 steps from the head lands there; new_head = new_tail.next, the first of the movers.",
      "Trace [1,2,3,4,5], k=2: L=5, k=2, new tail at index 2 → node 3; new head = 4; cut 3.next = None; tail 5.next = 1. Result [4,5,1,2,3]. Trace [0,1,2], k=4: k %= 3 → 1; new tail at index 1; result [2,0,1] — the modulo did the heavy lifting.",
    ],
    time: "O(L) — one measuring walk plus one positioning walk",
    space: "O(1) — two saved pointers",
    followUps: [
      "Rotate an ARRAY (problem 189): the same modulo insight, but the relink becomes the triple-reversal trick since arrays cannot re-link in O(1).",
      "Rotate LEFT by k — identical to rotating right by L − (k mod L); one line changes.",
    ],
    related: ["rotate-array", "swap-nodes-in-pairs", "remove-nth-node-from-end-of-list"],
    verify: {
      fn: "rotateRight",
      wrap: "listnodeArgs",
      cases: [
        { args: [[1, 2, 3, 4, 5], 2], expect: [4, 5, 1, 2, 3] },
        { args: [[0, 1, 2], 4], expect: [2, 0, 1] },
        { args: [[1], 99], expect: [1] },
        { args: [[1, 2, 3], 3], expect: [1, 2, 3] },
        { args: [[], 5], expect: [] },
        { args: [[1, 2], 0], expect: [1, 2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "partition-list",
    statement:
      "Given a linked list and a value x, rearrange the nodes so that every node with value < x comes before every node with value >= x, while preserving the relative order of nodes within each side (a stable partition). Return the rearranged list's head.",
    examples: [
      { input: "head = [1,4,3,2,5,2], x = 3", output: "[1,2,2,4,3,5]" },
      { input: "head = [2,1], x = 2", output: "[1,2]", explanation: "Both values are >= x except 1 — stability keeps 2 after 1." },
      { input: "head = [3,3,3], x = 3", output: "[3,3,3]" },
    ],
    constraints: ["0 <= list length <= 200", "-100 <= node.val <= 100, -100 <= x <= 100", "relative order within each partition must be preserved"],
    breakdown: [
      "The trap is treating this as a swap problem. Arrays get Hoare-style partitioning, but swapping breaks stability by design; linked lists offer something better — you can APPEND nodes to two separate chains without disturbing anything else, then splice the chains together.",
      "Two dummy heads build the answer during one scan: nodes < x are appended to the before-chain, the rest to the after-chain. Because each node is appended at its chain's tail in traversal order, both chains inherit the original relative order — stability for free, zero extra comparisons.",
      "The bugs live in the splice. The after-chain's last node still points into the old list, so leaving it un-cut can create a cycle the moment the before-chain's tail is re-pointed. Cut the after-tail first (a.next = None), then splice b.next = after.next.",
    ],
    edges: [
      "All nodes < x (empty after-chain) or all >= x (empty before-chain) — the splice degenerates and dummy.next does the right thing.",
      "Empty list — both chains empty, return None.",
      "x below every value or above every value — the single-chain case must survive.",
      "The a.next = None cut — skip it and the result can cycle when the original tail lands in the before-chain.",
    ],
    ladder: [
      { title: "Brute force — two value arrays, rebuild", body: "Collect values into two arrays by comparison, rebuild a list from both. O(n) extra space and fresh nodes; loses the in-place spirit." },
      { title: "Swap-based partition (quicksort style)", body: "Works on values in place, but destroys stability — relative order inside each partition is scrambled. Wrong for this problem's contract." },
      { title: "The optimal idea — two dummy-headed chains, one scan, one splice", body: "Append to before/after during a single pass, cut the after-tail, splice. O(n) time, O(1) space, stable by construction." },
    ],
    approach: "Two stable dummy sublists, spliced",
    code: `def partition(head, x):
    before = ListNode()        # dummy: nodes with val < x
    after = ListNode()         # dummy: nodes with val >= x
    b, a = before, after
    cur = head
    while cur:
        if cur.val < x:
            b.next = cur       # append at the before-tail (stable)
            b = b.next
        else:
            a.next = cur       # append at the after-tail (stable)
            a = a.next
        cur = cur.next
    a.next = None              # cut the after-tail — no cycles allowed
    b.next = after.next        # splice: before-chain, then after-chain
    return before.next`,
    walkthrough: [
      "One pass, one comparison per node: cur.val < x appends to before, otherwise to after. Each chain grows at its own tail pointer; the original list's links are read during the scan but never trusted after a node is captured.",
      "a.next = None is the line that prevents a cycle: if the original tail landed in the before-chain, the last after-node still points forward into pre-splice territory. Cut first, splice second: b.next = after.next.",
      "Trace [1,4,3,2,5,2], x=3: before gathers 1, 2, 2; after gathers 4, 3, 5; the splice yields 1,2,2,4,3,5. Both sides are in original order — exactly the stability the statement demands.",
    ],
    time: "O(n) — one scan, one splice",
    space: "O(1) — two dummies and four walkers",
    followUps: [
      "A three-way split (less / equal / greater) is the Dutch-flag partition on a list — three chains, the same discipline.",
      "Partition around a NODE's value instead of x — watch what happens to a second node equal to that value (which side does it belong to?).",
    ],
    related: ["odd-even-linked-list", "sort-list", "merge-two-sorted-lists"],
    verify: {
      fn: "partition",
      wrap: "listnodeArgs",
      cases: [
        { args: [[1, 4, 3, 2, 5, 2], 3], expect: [1, 2, 2, 4, 3, 5] },
        { args: [[2, 1], 2], expect: [1, 2] },
        { args: [[3, 3, 3], 3], expect: [3, 3, 3] },
        { args: [[1], 0], expect: [1] },
        { args: [[], 5], expect: [] },
        { args: [[5, 1, 2, 9, 2], 3], expect: [1, 2, 2, 5, 9] },
      ],
    },
    xp: 20,
  },
  {
    slug: "odd-even-linked-list",
    statement:
      "Regroup a linked list so that all nodes at ODD positions (1st, 3rd, …) come first, followed by all nodes at EVEN positions (2nd, 4th, …) — both groups keeping their original relative order. Do it in place with O(1) extra space in a single pass.",
    examples: [
      { input: "head = [1,2,3,4,5]", output: "[1,3,5,2,4]" },
      { input: "head = [2,1,3,5,6,4,7]", output: "[2,3,6,7,1,5,4]" },
      { input: "head = [1,2]", output: "[1,2]" },
    ],
    constraints: ["0 <= list length <= 10^4", "O(n) time, O(1) space, single pass expected", "relative order within the odd and even groups must be preserved"],
    breakdown: [
      "Positions are 1-indexed: odd-positioned nodes must come first, even-positioned second, both in original order. 'In place, O(1) space' rules out the read-into-two-arrays rebuild — the pointers themselves must regroup while the list is still being walked.",
      "The insight is that odd and even nodes INTERLEAVE in the original list, so each group's next member is exactly two hops away: odd.next = odd.next.next and even.next = even.next.next. Two runners advance in lockstep — odd ending on the last odd node, even one step ahead on the last even node.",
      "The loop guard is 'while even and even.next' because even runs ahead of odd: when even can no longer see a next odd node, odd has already absorbed everything. Then one stitch — odd.next = even_head — finishes the job.",
    ],
    edges: [
      "Empty list or single node — early return; the loop never runs.",
      "Two nodes — the guard exits immediately and the stitch is a no-op (1→2 stays).",
      "Odd versus even length — the final even is None versus a real node; the double guard covers both.",
      "Do NOT lose even_head — the stitch needs it after both walkers have moved on.",
    ],
    ladder: [
      { title: "Brute force — two arrays of nodes", body: "Collect node references by index parity, then re-link. O(n) extra space; trivially correct but not in place." },
      { title: "Value-based rebuild", body: "Same idea copying values instead of nodes — loses node identity and O(1) space in one move." },
      { title: "The optimal idea — interleaved two-runner regroup", body: "Constant extra pointers, single pass, one final stitch. Each node is re-pointed exactly once." },
    ],
    approach: "Two-runner parity regroup (odd leads, even anchors)",
    code: `def oddEvenList(head):
    if not head or not head.next:
        return head
    odd = head                  # last node of the odd group
    even = head.next            # last node of the even group
    even_head = even            # stitch point — saved before walking
    while even and even.next:   # even always runs one ahead of odd
        odd.next = even.next    # pull the next odd node forward
        odd = odd.next
        even.next = odd.next    # the node after it belongs to evens
        even = even.next
    odd.next = even_head        # append evens, in original order
    return head`,
    walkthrough: [
      "The invariant: odd is the last node of the odd group, even is the last node of the even group, and even is precisely the node right after odd in the ORIGINAL list — that adjacency is what lets even.next always find the next odd node.",
      "Each iteration moves exactly two nodes: the one after even joins the odds (odd.next = even.next; odd advances), then the one after the new odd joins the evens (even.next = odd.next; even advances). Four pointer writes, two nodes regrouped.",
      "Trace [1,2,3,4,5]: iteration 1 re-links 1→3 and 2→4 (odd=3, even=4); iteration 2 re-links 3→5 and 4→None (odd=5, even=None). Exit; 5.next = even_head = 2 → 1,3,5,2,4. Stability holds because evens were always taken in order.",
    ],
    time: "O(n) — one pass, constant work per node",
    space: "O(1) — odd, even, even_head and the returned head",
    followUps: [
      "A three-group variant (position mod 3) uses the same lockstep pattern with two stitch points — good extension practice.",
      "The even-first variant flips which head you must save before walking.",
    ],
    related: ["partition-list", "swap-nodes-in-pairs", "reorder-list"],
    verify: {
      fn: "oddEvenList",
      wrap: "listnode",
      cases: [
        { args: [[1, 2, 3, 4, 5]], expect: [1, 3, 5, 2, 4] },
        { args: [[2, 1, 3, 5, 6, 4, 7]], expect: [2, 3, 6, 7, 1, 5, 4] },
        { args: [[1]], expect: [1] },
        { args: [[1, 2]], expect: [1, 2] },
        { args: [[]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "remove-duplicates-from-sorted-list-ii",
    statement:
      "Given the head of a SORTED linked list, delete every node whose value appears more than once — not just the extra copies, the entire run including the first occurrence. Return the head of the cleaned list.",
    examples: [
      { input: "head = [1,2,3,3,4,4,5]", output: "[1,2,5]", explanation: "The 3s and the 4s vanish entirely." },
      { input: "head = [1,1,1,2,3]", output: "[2,3]", explanation: "The run of 1s includes the first 1." },
      { input: "head = [1,1]", output: "[]" },
    ],
    constraints: ["0 <= list length <= 300", "-100 <= node.val <= 100", "the list is sorted non-decreasing", "single pass expected"],
    breakdown: [
      "The sorted twin of this problem keeps ONE node per run; this version keeps ZERO — every value occurring twice or more disappears entirely. That difference changes the loop's shape: you cannot keep a node and decide later, because by the time you see the duplicate, the first occurrence must already be gone.",
      "So the scan works in runs: when cur.next matches cur.val, a run has been found — advance cur past EVERY node carrying that value, then splice prev.next = cur, having kept none of them. prev must stay parked at the last node PROVEN duplicate-free.",
      "The dummy head is load-bearing: if the list starts with duplicates (1,1,…), the real head is among the removed, and the answer is dummy.next. Without it, 'delete the first run' is a fiddly special case.",
    ],
    edges: [
      "All duplicates ([1,1,2,2]) — the result is empty; dummy.next = None.",
      "No duplicates — every node passes through the else branch and prev walks the whole list.",
      "A run at the very end — the inner skip hits None; prev.next = None must terminate the list.",
      "A run of length ≥ 3 — the inner while must consume the WHOLE run, not just one duplicate.",
    ],
    ladder: [
      { title: "Brute force — value-count map, rebuild", body: "Count occurrences, rebuild keeping only count-1 values. O(n) space and it ignores the sorted gift that makes a map unnecessary." },
      { title: "Keep-one-first, clean-up-after", body: "Run the keep-one variant, then a second pass to strip values that survived with count > 1. Two passes and fragile bookkeeping about what has been un-kept." },
      { title: "The optimal idea — dummy + wholesale run-skipping scan", body: "prev parks before each run; the run is consumed in one inner loop; prev.next splices it out. Single pass, O(1) space." },
    ],
    approach: "Dummy head + wholesale run-skipping scan",
    code: `def deleteDuplicates(head):
    dummy = ListNode(0, head)   # the real head itself may be in a run
    prev = dummy                # last node proven duplicate-free
    cur = head
    while cur:
        if cur.next and cur.val == cur.next.val:
            run_val = cur.val   # drop the ENTIRE run, first node included
            while cur and cur.val == run_val:
                cur = cur.next
            prev.next = cur     # splice over the run; do NOT trust cur yet
        else:
            prev = cur          # cur's next differs -> cur is kept
            cur = cur.next
    return dummy.next`,
    walkthrough: [
      "prev's contract: everything up to and including prev is final. When cur starts a run, the inner while consumes it and prev.next = cur splices the whole run out WITHOUT prev moving — cur may itself start another run, and the outer loop will handle it.",
      "The else branch is the only place prev advances, and it advances exactly onto nodes proven unique — their next differs from them or is None. That proof-before-keeping discipline is what makes a single pass sufficient.",
      "Trace [1,2,3,3,4,4,5]: 1 and 2 pass through else; at 3 the run-skip jumps to 4; 4's run jumps to 5 with prev still at 2 — the splice 2.next = 5 drops both runs in one move. Result [1,2,5].",
    ],
    time: "O(n) — each node is consumed by exactly one of the two loops",
    space: "O(1) — dummy plus two pointers",
    followUps: [
      "The keep-one variant (problem 83) is the same scan where the run-skip becomes a single step and prev moves onto the kept node.",
      "An UNSORTED list kills the run trick — you need a value-count map and a rebuild, or sorting first.",
    ],
    related: ["remove-duplicates-from-sorted-list", "remove-nth-node-from-end-of-list", "remove-linked-list-elements"],
    verify: {
      fn: "deleteDuplicates",
      wrap: "listnode",
      cases: [
        { args: [[1, 2, 3, 3, 4, 4, 5]], expect: [1, 2, 5] },
        { args: [[1, 1, 1, 2, 3]], expect: [2, 3] },
        { args: [[1, 1]], expect: [] },
        { args: [[1, 2, 2]], expect: [1] },
        { args: [[1, 1, 2, 2, 3, 3]], expect: [] },
        { args: [[]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "lfu-cache",
    statement:
      "Design a cache with fixed capacity and O(1) get and put that evicts by FREQUENCY: the least-frequently-used key is evicted first, and among keys with equal frequency the LEAST RECENTLY USED one wins. A get or a put on a key counts as a use — putting an existing key updates its value and increments its frequency.",
    examples: [
      { input: "LFUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2), get(3), put(4,4), get(1), get(3), get(4)", output: "get → 1, get → -1, get → 3, get → -1, get → 3, get → 4", explanation: "put(3,3): key 2 has frequency 1, the smallest → evicted. get(3) lifts key 3 to frequency 2, tying key 1; put(4,4) then evicts key 1 — same counter, but 1 was used less recently." },
      { input: "LFUCache(2), put(1,1), put(2,2), get(1), get(2), put(3,3), get(1), get(2), get(3)", output: "get → 1, get → 2, get → -1, get → 2, get → 3", explanation: "Both keys reach frequency 2; the tie-break evicts key 1 (used less recently than key 2)." },
    ],
    constraints: ["0 <= capacity <= 10^4 (capacity 0 must be handled)", "0 <= key, value <= 10^5", "at most 2·10^5 calls total", "O(1) average time per operation expected"],
    breakdown: [
      "LFU adds a second eviction axis to LRU: frequency first, recency only to break ties. One recency list is no longer enough — 'least frequently used' is a global-minimum query that must ALSO be O(1), so the structure has to track where that minimum lives without ever scanning.",
      "The standard design is frequency buckets: for each frequency f, a doubly linked list of the keys AT f, ordered by recency (most recent at the head). Using a key moves it from bucket f to bucket f+1's head — unlink plus push-front, the same constant pointer work as LRU, just nested one level deeper.",
      "min_freq is the trick that makes eviction O(1): it only moves in two places — down to 1 when a fresh key enters, and up by exactly one step when the bucket at min_freq empties during a promotion (nothing else can have become the minimum). Eviction pops tail.prev of bucket min_freq: the least-recently-used among the least-frequently-used — precisely the tie-break rule.",
    ],
    edges: [
      "Ties at the same frequency evict by recency WITHIN the bucket, and a get refreshes recency while bumping frequency — the two axes interact constantly.",
      "capacity 0 — put must no-op and get must miss; without the guard, eviction indexes an empty structure.",
      "Updating an existing key with put BUMPS ITS FREQUENCY (it is a use) — forgetting this fails hidden tests.",
      "A bucket emptied by a promotion while holding min_freq — min_freq must step up to f+1, or a later eviction crashes on a stale bucket.",
    ],
    ladder: [
      { title: "Brute force — counters + scan for the victim", body: "Store (value, freq, lastUsed) per key; on eviction, scan everything for (lowest freq, oldest use). O(capacity) per miss — correct, fails the contract." },
      { title: "Sorted structure / two heaps", body: "A balanced structure keyed by (freq, recency) gives O(log n) per operation. Passes relaxed judges, fails the O(1) requirement." },
      { title: "The optimal idea — frequency buckets + per-bucket recency lists + min_freq cursor", body: "Every operation is a constant number of dict updates and pointer moves; the minimum frequency is maintained incrementally, never computed." },
    ],
    approach: "Frequency buckets with per-bucket LRU order",
    code: `class LFUCache:
    class _Node:
        def __init__(self, key=0, val=0):
            self.key = key
            self.val = val
            self.freq = 1
            self.prev = None
            self.next = None

    def __init__(self, capacity):
        self.cap = capacity
        self.nodes = {}      # key -> node
        self.buckets = {}    # freq -> (head, tail) sentinels; MRU at head
        self.min_freq = 0    # frequency of the least-frequent entry

    def _bucket(self, freq):
        # Lazily create a bucket: an empty DLL with sentinels.
        if freq not in self.buckets:
            head = self._Node()
            tail = self._Node()
            head.next = tail
            tail.prev = head
            self.buckets[freq] = (head, tail)
        return self.buckets[freq]

    def _unlink(self, node):
        node.prev.next = node.next
        node.next.prev = node.prev

    def _push_front(self, freq, node):
        head, _ = self._bucket(freq)
        node.prev = head
        node.next = head.next
        head.next.prev = node
        head.next = node

    def _touch(self, node):
        # Promote node from freq to freq+1, maintaining min_freq.
        f = node.freq
        self._unlink(node)
        head, tail = self.buckets[f]
        if head.next is tail:            # bucket emptied by the promotion
            del self.buckets[f]
            if self.min_freq == f:
                self.min_freq = f + 1    # nothing left at f; node sits at f+1
        node.freq = f + 1
        self._push_front(f + 1, node)

    def get(self, key):
        node = self.nodes.get(key)
        if not node:
            return -1
        self._touch(node)                # a successful get is a use
        return node.val

    def put(self, key, value):
        if self.cap <= 0:
            return                       # degenerate cache: nothing stored
        node = self.nodes.get(key)
        if node:
            node.val = value             # an update is a use too
            self._touch(node)
            return
        if len(self.nodes) >= self.cap:
            head, tail = self.buckets[self.min_freq]
            lru = tail.prev              # LRU within the least-frequent bucket
            self._unlink(lru)
            if head.next is tail:
                del self.buckets[self.min_freq]
            del self.nodes[lru.key]
        node = self._Node(key, value)
        self.nodes[key] = node
        self.min_freq = 1                # a fresh node is the new minimum
        self._push_front(1, node)`,
    walkthrough: [
      "The state is two maps: nodes (key → node carrying val and freq) and buckets (freq → sentinel-paired DLL with MRU at the head). Every mutation is unlink + push-front — the LRU discipline, applied per frequency level.",
      "_touch is the heart: promote f → f+1, and if that empties the min bucket, min_freq = f + 1 — the only way the cursor moves up. Trace the classic sequence on capacity 2: put 1, put 2 (bucket 1: [2,1]); get 1 → bucket 2: [1]; put 3 evicts bucket-1's tail = 2 (LRU tie-break at frequency 1); get 3 lifts key 3 into bucket 2, which now reads [3,1] with MRU at the head; put 4 evicts bucket-2's tail = key 1 — same counter, older use. The final gets return -1, 3, 4.",
      "The pure tie-break case: put 1, put 2, get 1, get 2 — both at frequency 2, bucket 2 reads [2,1] by recency. put 3 evicts tail.prev = 1; get(1) misses while get(2) and get(3) hit. Every step touched one map slot and at most four pointers.",
    ],
    time: "O(1) per get and put",
    space: "O(capacity) — nodes plus one sentinel pair per distinct frequency",
    followUps: [
      "An aging variant (evict by frequency within a sliding time window) breaks the bucket invariant — you would need decayed counters or time-bucketed counts.",
      "The same bucket discipline appears in Redis's LFU eviction — approximated with counters there, exact here.",
    ],
    related: ["lru-cache", "design-hashmap", "maximum-frequency-stack"],
    verify: {
      fn: "LFUCache",
      wrap: "class",
      voidOps: ["put"],
      cases: [
        {
          args: [[
            ["LFUCache", 2], ["put", 1, 1], ["put", 2, 2], ["get", 1],
            ["put", 3, 3], ["get", 2], ["get", 3],
            ["put", 4, 4], ["get", 1], ["get", 3], ["get", 4],
          ]],
          expect: [1, -1, 3, -1, 3, 4],
        },
        {
          args: [[
            ["LFUCache", 2], ["put", 1, 1], ["put", 2, 2], ["get", 1],
            ["get", 2], ["put", 3, 3], ["get", 1], ["get", 2], ["get", 3],
          ]],
          expect: [1, 2, -1, 2, 3],
        },
        {
          args: [[["LFUCache", 2], ["put", 1, 1], ["put", 2, 2], ["put", 1, 10], ["put", 3, 3], ["get", 1], ["get", 2]]],
          expect: [10, -1],
        },
        {
          args: [[["LFUCache", 1], ["get", 1], ["put", 1, 1], ["get", 1], ["put", 2, 2], ["get", 1], ["get", 2]]],
          expect: [-1, 1, -1, 2],
        },
        {
          args: [[["LFUCache", 0], ["put", 1, 1], ["get", 1]]],
          expect: [-1],
        },
      ],
    },
    xp: 35,
  },
  {
    slug: "reverse-linked-list-ii",
    statement:
      "Given a linked list and two positions left ≤ right (1-indexed), reverse ONLY the segment of nodes between them, in one pass, leaving everything outside the segment untouched.",
    examples: [
      { input: "head = [1,2,3,4,5], left = 2, right = 4", output: "[1,4,3,2,5]" },
      { input: "head = [5], left = 1, right = 1", output: "[5]" },
      { input: "head = [1,2,3,4,5], left = 1, right = 5", output: "[5,4,3,2,1]", explanation: "Reversing the whole list must work like any other segment." },
    ],
    constraints: ["1 <= list length <= 500", "1 <= left <= right <= length", "one pass expected"],
    breakdown: [
      "One-pass reversal of a middle segment is HEAD-INSERTION: keep prev anchored at the node BEFORE the segment, and repeatedly pull the node sitting after cur out of the chain and push it at the segment's front. After right − left iterations the segment is reversed and nothing outside it was ever touched.",
      "The dummy head is what makes left = 1 ordinary: prev must start at the node before the segment, and with the dummy there always IS such a node — no special case for reversing from the very front.",
      "The classic alternative — walk to left−1, reverse the segment with the standard three-pointer loop, then relink both seams — is easier to narrate but does two passes of bookkeeping over the segment. The anchored head-insertion version is the one-pass answer, and its four-line body is worth memorizing.",
    ],
    edges: [
      "left == right — the loop runs zero times; the list returns unchanged.",
      "left == 1 — the dummy absorbs the head position; return dummy.next.",
      "right == length — the segment's last node becomes the list's tail; its next is already correct.",
      "A two-node list reversed whole — the minimal full-surgery test.",
    ],
    ladder: [
      { title: "Brute force — extract, reverse, rebuild", body: "Copy the segment's values into an array, reverse it, write the values back. Value-swapping, not pointer surgery; O(right − left) extra space." },
      { title: "Segment isolation + standard reversal", body: "Cut the segment out, reverse it as an independent list with the classic loop, relink both seams. Two conceptual steps; clear but not one pass." },
      { title: "The optimal idea — anchored head-insertion", body: "prev stays put; each iteration moves ONE node to the segment front; single traversal, O(1) space, no seam relinking at the end." },
    ],
    approach: "Anchored head-insertion reversal (one pass)",
    code: `def reverseBetween(head, left, right):
    dummy = ListNode(0, head)   # left = 1 must be as ordinary as the rest
    prev = dummy
    for _ in range(left - 1):   # prev = node just BEFORE the segment
        prev = prev.next
    cur = prev.next             # first node of the segment
    for _ in range(right - left):
        nxt = cur.next          # the node that will jump to the front
        cur.next = nxt.next     # unlink nxt from behind cur
        nxt.next = prev.next    # nxt points at the current segment head
        prev.next = nxt         # nxt becomes the new segment head
    return dummy.next`,
    walkthrough: [
      "prev parks left − 1 steps in (counting from the dummy); cur = prev.next is the segment's first node — and after the reversal it will be the segment's LAST node. cur itself never moves during the loop; that is the anchor trick.",
      "Each of the right − left iterations performs one head-insertion: nxt = cur.next is unhooked (cur.next = nxt.next), pushed at the front (nxt.next = prev.next), and crowned (prev.next = nxt). The segment grows from its head while cur sinks toward becoming its tail.",
      "Trace [1,2,3,4,5], left=2, right=4: prev=1, cur=2. Pull 3 → 1→3→2→4→5. Pull 4 → 1→4→3→2→5. Two iterations, done — [1,4,3,2,5], and nodes 1 and 5 were never disturbed.",
    ],
    time: "O(n) — a single forward pass (left − 1 steps plus right − left insertions)",
    space: "O(1) — dummy plus three pointers",
    followUps: [
      "Reverse nodes in k-group (problem 25) — this anchored loop is the per-group engine; only the driver changes.",
      "Reverse every OTHER group (alternate groups reversed and skipped) — the same surgery with a conditional driver.",
    ],
    related: ["reverse-linked-list", "reverse-nodes-in-k-group", "swap-nodes-in-pairs"],
    verify: {
      fn: "reverseBetween",
      wrap: "listnodeArgs",
      cases: [
        { args: [[1, 2, 3, 4, 5], 2, 4], expect: [1, 4, 3, 2, 5] },
        { args: [[5], 1, 1], expect: [5] },
        { args: [[1, 2, 3, 4, 5], 1, 5], expect: [5, 4, 3, 2, 1] },
        { args: [[1, 2, 3, 4, 5], 3, 3], expect: [1, 2, 3, 4, 5] },
        { args: [[1, 2], 1, 2], expect: [2, 1] },
      ],
    },
    xp: 20,
  },
  {
    slug: "flatten-a-multilevel-doubly-linked-list",
    statement:
      "A doubly linked list can sprout child chains: any node's child pointer leads to another doubly linked list whose nodes may carry children of their own. Flatten it — splice every child chain into the level of its parent, immediately after the parent and before the parent's next — so the result is one list traversable by next alone, with all child pointers null.",
    examples: [
      { input: "head = [1,2,3,[7,8,[11,12],9,10],4,5,6]", output: "[1,2,3,7,8,11,12,9,10,4,5,6]", explanation: "3's child is 7→8→9→10 and 8's child is 11→12; each child chain splices in directly after its parent." },
      { input: "head = [1,2,[3]]", output: "[1,2,3]", explanation: "A child chain at the very end, where the parent has no next." },
      { input: "head = []", output: "[]" },
    ],
    constraints: ["0 <= total nodes <= 1000", "a nested array in the input is the child chain of the previous node", "traversal by next must visit every node exactly once", "child pointers null and prev pointers consistent in the result"],
    breakdown: [
      "The structure is a tree of doubly linked lists: every node has next, prev, and possibly child, where a child chain is itself a full multilevel list. The required order is a PREORDER DFS — parent, then its child chain (flattened recursively), then the parent's continuation.",
      "The single-pass version performs that DFS iteratively: whenever cur sees a child, it grafts the whole child chain in at cur.next. Grafting the head is easy; the subtle half is finding the child chain's TAIL to re-attach the saved remainder (tail.next = nxt) — otherwise the rest of the main level is orphaned.",
      "Two invariants keep it clean: after splicing, cur walks INTO the grafted chain, so nested children are found naturally in the same linear scan — no recursion, no stack; and cur.child is nulled the moment it is consumed, so the output carries no child pointers even though the traversal only reads next.",
    ],
    edges: [
      "Empty list — return None.",
      "Child chain at the very END (parent.next is None) — tail.next = None must stay None; the 'if nxt' guard.",
      "Multiple sibling chains at different depths — each is grafted exactly once, in preorder position.",
      "prev pointers must be maintained in BOTH splices (child.prev = cur; nxt.prev = tail) — a doubly linked output that only fixes next is half an answer.",
    ],
    ladder: [
      { title: "Brute force — flatten into a node array", body: "DFS collecting every node into an array, then relink linearly. O(n) extra space and two passes; conceptually simple, memory-hungry." },
      { title: "Recursive DFS returning (head, tail)", body: "Recurse per child, splice the child's head after the parent, use the returned tail to reconnect the remainder. O(n) time, O(depth) stack." },
      { title: "The optimal idea — iterative splice walk", body: "One pass; each child chain is grafted in place the moment it is met. O(n) time, O(1) extra space, no recursion." },
    ],
    approach: "Single-pass child-chain splicing walk",
    code: `def flatten(head):
    cur = head
    while cur:
        child = getattr(cur, "child", None)   # absent child == no child
        if child:
            cur.child = None        # the flattened list keeps no children
            nxt = cur.next          # save the rest of the main level
            tail = child            # find the child chain's last node
            while tail.next:
                tail = tail.next
            cur.next = child        # splice: parent -> child head
            child.prev = cur
            tail.next = nxt         # child tail -> the saved remainder
            if nxt:
                nxt.prev = tail
        cur = cur.next              # walks INTO the grafted chain too
    return head`,
    walkthrough: [
      "cur scans forward via next. On finding cur.child, it saves nxt = cur.next, nulls the child pointer, walks to the child chain's tail, and performs the four-link splice: cur.next = child, child.prev = cur, tail.next = nxt, nxt.prev = tail.",
      "The crucial detail: cur then walks into the grafted chain (cur = cur.next), so children OF the grafted nodes are encountered later in the same linear scan — the recursion is flattened into the walk itself, which is why no stack is needed.",
      "Trace [1,2,3,[7,8,[11,12],9,10],4,5,6]: at node 3, graft 7…10 after 3 (tail 10 relinks to 4); walking on, node 8's child grafts 11→12 between 8 and 9. Traversal: 1,2,3,7,8,11,12,9,10,4,5,6 — preorder, exactly as required.",
    ],
    time: "O(n) — every node is walked over once and tail-searched at most once",
    space: "O(1) — no recursion, no auxiliary structures",
    followUps: [
      "The inverse operation — unflattening — needs a stack of nodes with a pending next to re-nest; the splice run backwards.",
      "Interpreting child as left and next as right turns this into the binary-tree rightward flattening of problem 114 — the same preorder discipline in a different costume.",
    ],
    related: ["flatten-nested-list-iterator", "copy-list-with-random-pointer", "odd-even-linked-list"],
    verify: {
      fn: "flatten",
      wrap: "listnodeChild",
      cases: [
        { args: [[1, 2, 3, [7, 8, [11, 12], 9, 10], 4, 5, 6]], expect: [1, 2, 3, 7, 8, 11, 12, 9, 10, 4, 5, 6] },
        { args: [[1, 2, [3]]], expect: [1, 2, 3] },
        { args: [[1, [2, 3], 4, [5, 6]]], expect: [1, 2, 3, 4, 5, 6] },
        { args: [[1, 2, [3, 4, [5, 6], 7], 8]], expect: [1, 2, 3, 4, 5, 6, 7, 8] },
        { args: [[1]], expect: [1] },
        { args: [[]], expect: [] },
      ],
    },
    xp: 20,
  },
];
