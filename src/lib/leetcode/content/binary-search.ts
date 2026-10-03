// Deep-dives — Binary Search (7). Original statements/solutions; verified
// by scripts/lc-verify.
import type { LcDeepDive } from "../types";

export const BINARY_SEARCH: LcDeepDive[] = [
  {
    slug: "binary-search",
    statement:
      "Given a SORTED array of distinct integers and a target, return the target's index — or −1 if it's absent. You must achieve O(log n) time, which is the whole point.",
    examples: [
      { input: "nums = [-1,0,3,5,9,12], target = 9", output: "4" },
      { input: "nums = [-1,0,3,5,9,12], target = 2", output: "-1" },
      { input: "nums = [5], target = 5", output: "0" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "all values unique, ascending", "O(log n) required"],
    breakdown: [
      "Binary search is a proof wearing a loop: each comparison against the middle element eliminates HALF the remaining candidates, so the search space shrinks n → n/2 → n/4 … reaching 1 after log₂n steps. The correctness condition is simply that the array is ordered.",
      "The classic implementation bugs are all boundary bugs: 'while l < r' vs 'while l <= r', 'r = m' vs 'r = m − 1', and integer overflow in (l + r) / 2 (irrelevant in Python, fatal in C/Java — write l + (r − l) // 2 out of habit). Pick ONE canonical shape and reproduce it every time; this file uses closed-interval [l, r] with l <= r.",
      "Distinctness isn't required for correctness here, only for a unique answer — but it keeps the discussion clean before the duplicates-having variants (search range, rotated arrays).",
    ],
    edges: [
      "Single-element array — the loop must test it (l == r case).",
      "Target smaller/larger than everything — pointers cross and return −1.",
      "Even/odd lengths — the floor mid must handle both.",
    ],
    ladder: [
      { title: "Linear scan", body: "O(n) — ignores the ordering the problem hands you. Right answer, wrong complexity class." },
      { title: "Recursive binary search", body: "Same logic as a recursion on (l, r). O(log n) time but O(log n) call stack — fine, just heavier than needed." },
      { title: "The optimal idea — closed interval, halve, repeat", body: "while l <= r with m = (l+r)//2; three-way compare; shrink to m±1. O(log n) time, O(1) space, the canonical shape worth memorising." },
    ],
    approach: "Closed-interval iterative binary search",
    code: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:                # closed interval [l, r] still alive
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[m] < target:
            l = m + 1            # answer lives strictly right of m
        else:
            r = m - 1            # strictly left of m
    return -1`,
    walkthrough: [
      "The invariant: IF the target exists, it lies inside [l, r]. Each iteration halves that interval; when l > r it's empty and −1 is honest.",
      "The three-way branch leaves no ambiguity about pointer updates — m itself is excluded because it was just tested. That's what keeps 'l <= r' and 'm ± 1' mutually consistent.",
      "Termination is guaranteed because the interval strictly shrinks every iteration; log₂(10^4) ≈ 14 comparisons for the max input.",
    ],
    time: "O(log n)",
    space: "O(1)",
    followUps: [
      "First/last occurrence with duplicates: on a hit, keep searching left (or right) — the 'search range' problem.",
      "Search in a rotated sorted array: the mid-test grows a 'which half is sorted' check.",
    ],
    related: ["search-insert-position", "search-in-rotated-sorted-array", "find-peak-element"],
    verify: {
      fn: "search",
      wrap: "plain",
      cases: [
        { args: [[-1, 0, 3, 5, 9, 12], 9], expect: 4 },
        { args: [[-1, 0, 3, 5, 9, 12], 2], expect: -1 },
        { args: [[5], 5], expect: 0 },
      ],
    },
    xp: 10,
  },
  {
    slug: "search-a-2d-matrix",
    statement:
      "You are given an m×n matrix with a special order: every row is sorted left-to-right, and the FIRST value of each row is greater than the LAST value of the row above — so reading rows in order gives one fully sorted list. Decide whether a target value is present, in O(log(m·n)).",
    examples: [
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 3", output: "true" },
      { input: "matrix = [[1,3,5,7],[10,11,16,20],[23,30,34,60]], target = 13", output: "false" },
    ],
    constraints: ["1 <= m, n <= 100", "row-sorted with row-major global order", "O(log(m·n)) expected"],
    breakdown: [
      "The 'first-of-row > last-of-previous-row' property means the matrix is literally a sorted list that's been WRAPPED into rows. The clean solution ignores the wrapping: binary search the virtual index range [0, m·n − 1] and convert index → cell with row = idx // cols, col = idx % cols.",
      "The two-pass alternative — binary search rows for the right row, then binary search inside it — is O(log m + log n), the same asymptotics with more code. The flat-index version is the elegant answer precisely because the data model (one sorted list) matches the algorithm (one binary search).",
      "Contrast with the WEAKER matrix property (rows and columns sorted independently — Search a 2D Matrix II): there the global order breaks and the O(m + n) staircase walk replaces binary search entirely. Knowing which variant you're holding is half the interview.",
    ],
    edges: [
      "Single row or single column — degenerate flat arrays.",
      "Target between rows (falls in the wrap gap) — must return false.",
      "Target equal to the first or last cell.",
    ],
    ladder: [
      { title: "Brute force — scan everything", body: "O(m·n). At 100×100 it's 10^4 — passes, but ignores every stated property." },
      { title: "Two binary searches", body: "First over rows (last-column values) to find the candidate row, then inside it. O(log m + log n) — correct, two searches where one suffices." },
      { title: "The optimal idea — one flat virtual binary search", body: "Treat the matrix as a sorted array of length m·n; index math unpacks the cell. O(log(m·n)) time, O(1) space, 12 lines." },
    ],
    approach: "Virtual flat index binary search",
    code: `def searchMatrix(matrix, target):
    rows, cols = len(matrix), len(matrix[0])
    l, r = 0, rows * cols - 1
    while l <= r:
        m = (l + r) // 2
        v = matrix[m // cols][m % cols]   # unwrap the virtual index
        if v == target:
            return True
        if v < target:
            l = m + 1
        else:
            r = m - 1
    return False`,
    walkthrough: [
      "Row-major flattening is a bijection: index m lands at row m // cols, column m % cols. Because the rows chain globally (first-of-row > last-of-previous), the flattened sequence is sorted — the plain binary search applies verbatim.",
      "Everything else is the canonical closed-interval search from the Binary Search entry — the only new line is the index unwrap.",
      "log₂(10^4) ≈ 14 probes regardless of the matrix's shape — one search over the wrapped list beats two searches over its dimensions.",
    ],
    time: "O(log(m·n))",
    space: "O(1)",
    followUps: [
      "Matrix II (rows AND columns sorted, no chaining): O(m + n) staircase from a corner — binary search no longer applies.",
      "Return the position, not a boolean: same search, return (m // cols, m % cols).",
    ],
    related: ["binary-search", "search-a-2d-matrix-ii", "koko-eating-bananas"],
    verify: {
      fn: "searchMatrix",
      wrap: "matrix",
      cases: [
        { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expect: true },
        { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expect: false },
      ],
    },
    xp: 20,
  },
  {
    slug: "koko-eating-bananas",
    statement:
      "Koko eats banana piles at a fixed speed of k bananas per hour (any leftover part of a pile still costs a full hour). Given the piles and h hours, find the MINIMUM integer k that lets her finish everything within h hours.",
    examples: [
      { input: "piles = [3,6,7,11], h = 8", output: "4", explanation: "At k=4 she needs 1+2+2+3 = 8 hours; k=3 needs 10." },
      { input: "piles = [30,11,23,4,20], h = 5", output: "30", explanation: "Each pile must vanish in one hour." },
      { input: "piles = [30,11,23,4,20], h = 6", output: "23" },
    ],
    constraints: ["1 <= piles.length <= 10^4", "piles.length <= h <= 10^9", "1 <= piles[i] <= 10^9"],
    breakdown: [
      "The decision question 'can Koko finish at speed k?' is monotone: if she can at k, she can at any larger k. Monotone yes/no over an ordered search space is the definition of a BINARY SEARCH problem — the twist is that the search space is the ANSWER's value range (1..max(piles)), not an array.",
      "'Binary search on the answer' needs an explicit feasibility predicate. Here: hours(k) = Σ ceil(pile / k) ≤ h. The ceiling is the subtle part — an unfinished pile still costs a whole hour — and the safe integer form is (p + k − 1) // k, never float ceil().",
      "The template shifts from the classic: we're finding the LEFTMOST feasible k, so on a feasible mid we keep r = m (the answer could be m) rather than discarding it. 'Find boundary' vs 'find value' — knowing which template you're in prevents the classic infinite-loop bugs.",
    ],
    edges: [
      "h == len(piles): k must be max(piles) — every pile in one hour.",
      "h huge: k = 1 is feasible — the floor of the search.",
      "Ceiling arithmetic with (p + k − 1) // k: float imprecision on 10^9 values would bite ceil(p / k).",
    ],
    ladder: [
      { title: "Linear scan of k", body: "Try k = 1, 2, 3… until feasible. O(max(piles) · n) — up to 10^9 × 10^4. Hopeless." },
      { title: "Binary search with float ceiling", body: "The right structure but math.ceil(p / k) on billion-sized values risks float rounding; passing here, wrong in general. Worth flagging in an interview." },
      { title: "The optimal idea — binary search on the answer, integer ceiling", body: "Search k in [1, max(piles)]; predicate hours(k) ≤ h with (p + k − 1) // k; keep r = m on feasibility. O(n log max(piles))." },
    ],
    approach: "Binary search on the answer with a feasibility predicate",
    code: `def minEatingSpeed(piles, h):
    def hours(k):
        return sum((p + k - 1) // k for p in piles)   # ceil division

    l, r = 1, max(piles)
    while l < r:
        m = (l + r) // 2
        if hours(m) <= h:     # feasible → m might be minimal
            r = m
        else:                 # too slow → must eat faster
            l = m + 1
    return l`,
    walkthrough: [
      "The search space is the value range [1, max(piles)] — 'binary search on the answer'. The loop keeps a half-open sense of progress: on feasibility, the answer is m or smaller (r = m); on failure, strictly above m (l = m + 1).",
      "hours(k) uses (p + k − 1) // k — the integer ceiling. A pile of 7 at k = 4 costs 2 hours, at k = 7 costs 1; leftovers are never free.",
      "Termination: l == r is the boundary where feasibility flips — the minimal k. log₂(10^9) ≈ 30 probes, each O(n) → ~3·10^5 work total.",
    ],
    time: "O(n · log(max(piles)))",
    space: "O(1)",
    followUps: [
      "Maximum minimum-distance (Aggressive Cows / Magnetic Force): identical template, predicate flips to 'can place with gap ≥ d'.",
      "Weight-carrying ships variant (Capacity to Ship Packages): same skeleton, predicate sums per-day loads.",
    ],
    related: ["binary-search", "capacity-to-ship-packages-within-d-days", "median-of-two-sorted-arrays"],
    verify: {
      fn: "minEatingSpeed",
      wrap: "plain",
      cases: [
        { args: [[3, 6, 7, 11], 8], expect: 4 },
        { args: [[30, 11, 23, 4, 20], 5], expect: 30 },
        { args: [[30, 11, 23, 4, 20], 6], expect: 23 },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-minimum-in-rotated-sorted-array",
    statement:
      "A sorted ascending array was rotated between 1 and n times at an unknown pivot (e.g. [0,1,2,4,5,6,7] might become [4,5,6,7,0,1,2]). All values are unique. Find the minimum element in O(log n).",
    examples: [
      { input: "nums = [3,4,5,1,2]", output: "1" },
      { input: "nums = [4,5,6,7,0,1,2]", output: "0" },
      { input: "nums = [11,13,15,17]", output: "11", explanation: "Rotation by 0 — still fully sorted." },
    ],
    constraints: ["1 <= nums.length <= 5000", "unique values, originally ascending", "O(log n) required"],
    breakdown: [
      "A rotated sorted array is TWO sorted runs glued at the pivot, and every value in the left run exceeds every value in the right run. The minimum is the first element of the right run — or, with no rotation, the first element overall.",
      "The comparison that finds the glue point: is nums[m] > nums[r]? If yes, m sits in the left (high) run, so the minimum must be strictly right of m. Otherwise m is in the right run (or the array is sorted), and the minimum is at m or left of it — keep m as a candidate (r = m).",
      "This 'compare with the RIGHT end' template is what distinguishes min-finding from target-search: we're locating a BOUNDARY, so the loop is 'while l < r' and the interval shrinks to a point rather than emptying.",
    ],
    edges: [
      "No rotation (k = 0) — nums[m] ≤ nums[r] always; r walks down to 0.",
      "Single element — loop never runs, return nums[0].",
      "Two elements [2,1] — m = 0: 2 > 1 → l = 1 → answer 1.",
    ],
    ladder: [
      { title: "Linear scan", body: "min(nums) — O(n), ignores the structure entirely. Fine to mention first, then beat." },
      { title: "Find the pivot, then read it", body: "Binary search comparing nums[m] with nums[l] to find where the drop happens, then return. Same complexity; the 'compare with r' version needs fewer special cases." },
      { title: "The optimal idea — boundary search against the right end", body: "while l < r; nums[m] > nums[r] → l = m + 1, else r = m. Interval collapses to the minimum. O(log n), no rotation special case needed." },
    ],
    approach: "Boundary binary search against the right end",
    code: `def findMin(nums):
    l, r = 0, len(nums) - 1
    while l < r:
        m = (l + r) // 2
        if nums[m] > nums[r]:   # m is in the high run → min is right of m
            l = m + 1
        else:                   # m is in the low run → min at m or left
            r = m
    return nums[l]`,
    walkthrough: [
      "The loop maintains: the minimum lies inside [l, r]. The nums[m] vs nums[r] comparison classifies m's run WITHOUT knowing the pivot: mid in the high run pushes l past it; mid in the low run keeps it as a candidate (r = m, never m − 1).",
      "Because we keep m viable (r = m), the interval collapses to exactly one index — the boundary. No post-loop check needed: nums[l] IS the answer.",
      "Why compare with r and not l? With l, the sorted-array case needs a separate branch (m's side is ambiguous); with r, both cases unify — a favourite interview observation.",
    ],
    time: "O(log n)",
    space: "O(1)",
    followUps: [
      "Duplicates allowed (find-min II): nums[m] == nums[r] is ambiguous — shrink r by one and accept O(n) worst case.",
      "Search in rotated sorted array: same run-analysis plus a target comparison per step.",
    ],
    related: ["search-in-rotated-sorted-array", "binary-search", "find-minimum-in-rotated-sorted-array-ii"],
    verify: {
      fn: "findMin",
      wrap: "plain",
      cases: [
        { args: [[3, 4, 5, 1, 2]], expect: 1 },
        { args: [[4, 5, 6, 7, 0, 1, 2]], expect: 0 },
        { args: [[11, 13, 15, 17]], expect: 11 },
        { args: [[2, 1]], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "search-in-rotated-sorted-array",
    statement:
      "A sorted ascending array of DISTINCT values was rotated at an unknown pivot. Given the rotated array and a target, return the target's index in O(log n) — or −1 if absent.",
    examples: [
      { input: "nums = [4,5,6,7,0,1,2], target = 0", output: "4" },
      { input: "nums = [4,5,6,7,0,1,2], target = 3", output: "-1" },
      { input: "nums = [1], target = 0", output: "-1" },
    ],
    constraints: ["1 <= nums.length <= 5000", "unique values", "O(log n) required"],
    breakdown: [
      "Cut any rotated array at its middle: at least ONE of the two halves is properly sorted. That's the entire key. Test which half is sorted (one comparison), then test whether the target falls inside that sorted half's range — if yes, search there; if no, it must be in the other half.",
      "The sorted-half test is nums[l] <= nums[m] (left half sorted, including the l == m single-element case). The range test needs BOTH endpoints inclusive-boundary care: nums[l] <= target < nums[m] for the left half, nums[m] < target <= nums[r] for the right.",
      "Why does discarding a half preserve correctness even when the pivot is inside the discarded half? Because we only discard when we've PROVEN the target can't be there — either it's outside the sorted half's value range, or it's inside and we search that half directly. Every step keeps the target provably in the surviving interval.",
    ],
    edges: [
      "Target at a boundary (equal to nums[l], nums[m], or nums[r]) — the inclusive range tests handle it.",
      "No rotation — left half always sorted; the algorithm degenerates to plain binary search.",
      "Single element with wrong target — one iteration then −1.",
    ],
    ladder: [
      { title: "Linear scan", body: "O(n) — legal but defeats the purpose; the problem prints O(log n) in bold." },
      { title: "Find pivot first, then two binary searches", body: "Locate the rotation point (find-min logic), decide which run the target belongs to, search that run. O(log n) with three passes — correct but clunky." },
      { title: "The optimal idea — one pass, sorted-half routing", body: "Standard binary search with a 'which half is sorted' test per step; route the target into the sorted half when its range admits it. O(log n), one pass." },
    ],
    approach: "Binary search with sorted-half detection",
    code: `def search(nums, target):
    l, r = 0, len(nums) - 1
    while l <= r:
        m = (l + r) // 2
        if nums[m] == target:
            return m
        if nums[l] <= nums[m]:              # left half [l..m] is sorted
            if nums[l] <= target < nums[m]:
                r = m - 1                   # target hides in the sorted half
            else:
                l = m + 1
        else:                               # right half [m..r] is sorted
            if nums[m] < target <= nums[r]:
                l = m + 1
            else:
                r = m - 1
    return -1`,
    walkthrough: [
      "Each iteration: identify the SORTED half (nums[l] <= nums[m] ⇔ left), then ask whether the target lies in that half's value range. Sorted half + in-range → search it; otherwise the target must be in the other half, whatever shape it's in.",
      "The '≤' in nums[l] <= nums[m] matters: when the window shrinks to one or two elements, l == m and the left half is trivially sorted. Missing this produces off-by-one chaos on two-element windows.",
      "Distinctness is what makes the routing decisive — with duplicates, nums[l] == nums[m] == nums[r] can't tell you anything (see find-min II for the O(n) fallback).",
    ],
    time: "O(log n) — the interval halves every step",
    space: "O(1)",
    followUps: [
      "Duplicates allowed (search-rotated II): equal ends force a linear shrink — O(n) worst case, provably unavoidable.",
      "Find the rotation count: it's the index of the minimum (find-min logic).",
    ],
    related: ["find-minimum-in-rotated-sorted-array", "binary-search", "search-in-rotated-sorted-array-ii"],
    verify: {
      fn: "search",
      wrap: "plain",
      cases: [
        { args: [[4, 5, 6, 7, 0, 1, 2], 0], expect: 4 },
        { args: [[4, 5, 6, 7, 0, 1, 2], 3], expect: -1 },
        { args: [[1], 0], expect: -1 },
        { args: [[5, 1, 3], 5], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "time-based-key-value-store",
    statement:
      "Design a store with two operations. set(key, value, timestamp) — store the value under the key at that timestamp; timestamps strictly increase per key. get(key, timestamp) — return the value with the LARGEST timestamp ≤ the query (or the empty string if none exists). All three operations must be fast; get should be O(log n) per call.",
    examples: [
      { input: 'set("foo","bar",1), get("foo",1), get("foo",3)', output: 'get → "bar", get → "bar" (latest ≤ 3 is timestamp 1)' },
      { input: 'set("a","x",1), set("a","y",3), get("a",2), get("a",4)', output: 'get(2) → "x", get(4) → "y"' },
    ],
    constraints: ["1 <= timestamps per key <= 2·10^5", "timestamps strictly increase per key", "up to 10^5 calls total", "O(log n) get expected"],
    breakdown: [
      "Per key, the data is an append-only list ordered by time. 'Largest timestamp ≤ query' on a sorted list is the textbook RIGHTMOST binary search — bisect_right semantics — returning the pair before the insertion point.",
      "The per-key strict-increase guarantee is what makes set O(1): append keeps the list sorted with no insertion logic. Drop that guarantee and you'd need a sorted container or offline sorting — worth stating in a design discussion.",
      "Implementation choices: hand-rolled binary search (shows the boundary mechanics) or bisect.bisect_right on a parallel timestamps list (shows library fluency). The hand-rolled version below keeps the 'candidate + advance' shape — the same one used by every 'find rightmost ≤ x' problem.",
    ],
    edges: [
      "Query earlier than every stored timestamp → '' (never found a candidate).",
      "Query exactly at a stored timestamp → that value.",
      "Multiple keys — the store is a dict of independent timelines.",
    ],
    ladder: [
      { title: "Linear scan on get", body: "Walk the list backwards until timestamp ≤ query. O(n) per get — 2·10^5 entries × 10^5 calls is far too slow." },
      { title: "Hash map to exact timestamps only", body: "dict[(key, ts)] = value with an exact-match lookup — misses the '≤' requirement entirely unless you also scan. A good wrong answer to dissect." },
      { title: "The optimal idea — append-only timeline + rightmost binary search", body: "Per key: list of (ts, value) kept sorted by O(1) appends; get binary-searches the rightmost ts ≤ query. O(1) set, O(log n) get." },
    ],
    approach: "Per-key sorted timeline with rightmost binary search",
    code: `class TimeMap:
    def __init__(self):
        self.store = {}             # key → [(timestamp, value)]

    def set(self, key, value, timestamp):
        self.store.setdefault(key, []).append((timestamp, value))

    def get(self, key, timestamp):
        pairs = self.store.get(key)
        if not pairs:
            return ""
        l, r = 0, len(pairs) - 1
        best = ""
        while l <= r:
            m = (l + r) // 2
            if pairs[m][0] <= timestamp:   # usable candidate
                best = pairs[m][1]
                l = m + 1                  # …but a later one may still fit
            else:
                r = m - 1
        return best`,
    walkthrough: [
      "set is deliberately trivial — the strict-increase guarantee does the sorting work. This is a recurring design lesson: constraints can replace data structures.",
      "get is 'rightmost ≤ query' binary search: every mid with ts ≤ query is a candidate (record it), but a later index might also qualify, so advance l. The first branch to fail pushes r down; the loop ends with the best candidate recorded.",
      "Returning '' instead of None matches the problem contract. bisect.bisect_right on the timestamps list is the equivalent one-liner: idx = bisect_right(ts_list, t); return values[idx − 1] if idx else ''.",
    ],
    time: "O(1) set · O(log n) get",
    space: "O(n) — all stored pairs",
    followUps: [
      "Timestamps NOT strictly increasing: keep bisect_right (stable among equals) — but set becomes O(log n) for the position check.",
      "Range queries (all values between t1 and t2): two bisects, slice the values.",
    ],
    related: ["binary-search", "lru-cache", "insert-delete-getrandom-o1"],
    verify: {
      fn: "TimeMap",
      wrap: "class",
      cases: [
        {
          args: [[
            ["set", "foo", "bar", 1], ["get", "foo", 1], ["get", "foo", 3],
          ]],
          expect: ["bar", "bar"],
        },
        {
          args: [[
            ["set", "a", "x", 1], ["set", "a", "y", 3],
            ["get", "a", 2], ["get", "a", 4], ["get", "a", 0],
          ]],
          expect: ["x", "y", ""],
        },
      ],
    },
    xp: 20,
  },
  {
    slug: "median-of-two-sorted-arrays",
    statement:
      "Given two sorted arrays of sizes m and n (possibly empty), return the MEDIAN of all m + n values combined. The required complexity is O(log(m + n)) — which rules out merging and forces a binary search on the partition.",
    examples: [
      { input: "a = [1,3], b = [2]", output: "2.0", explanation: "Merged [1,2,3]; odd count → middle." },
      { input: "a = [1,2], b = [3,4]", output: "2.5", explanation: "Merged [1,2,3,4]; even count → mean of the two middles." },
      { input: "a = [], b = [1]", output: "1.0" },
    ],
    constraints: ["0 <= m, n <= 1000", "m + n >= 1", "O(log(m+n)) required"],
    breakdown: [
      "A median is a PARTITION: split all values into a left pile and a right pile of sizes ⌈total/2⌉ and ⌊total/2⌋ such that everything on the left ≤ everything on the right. Any valid partition yields the median — max(left) for odd totals, mean of max(left) and min(right) for even.",
      "Search ONE array's split point i with binary search; the other array's split j follows arithmetically (j = half − i). Four boundary values (a_left, a_right, b_left, b_right) test validity: a_left ≤ b_right and b_left ≤ a_right. Adjust i by the failed comparison — pure binary search, log(m) steps.",
      "Binary-search the SHORTER array: fewer iterations and, crucially, j = half − i is guaranteed to stay inside b's legal range without extra checks. Empty arrays fall out of the ±∞ boundary conventions.",
    ],
    edges: [
      "One array empty: i = 0 with ±∞ sentinels handles it; the other side decides.",
      "Even vs odd total — the return branches on total % 2.",
      "All values equal — the validity test passes immediately.",
    ],
    ladder: [
      { title: "Merge and pick", body: "Merge to the median position — O(m + n). Simple, correct, and explicitly forbidden by the complexity requirement." },
      { title: "Two-heap running median", body: "Stream values into max/left + min/right heaps, then read the tops. O((m+n) log(m+n)) — the streaming answer, not the static one." },
      { title: "The optimal idea — partition binary search on the shorter array", body: "Binary search i in [0, m]; j = half − i; validity via the four boundaries; slide i by the failed test. O(log(min(m, n)))." },
    ],
    approach: "Partition binary search on the shorter array",
    code: `def findMedianSortedArrays(a, b):
    if len(a) > len(b):          # search the shorter array
        a, b = b, a
    m, n = len(a), len(b)
    total = m + n
    half = (total + 1) // 2      # size of the left pile
    l, r = 0, m
    while l <= r:
        i = (l + r) // 2         # a contributes its first i values
        j = half - i             # b contributes the rest
        a_left  = a[i - 1] if i > 0 else float("-inf")
        a_right = a[i]     if i < m else float("inf")
        b_left  = b[j - 1] if j > 0 else float("-inf")
        b_right = b[j]     if j < n else float("inf")
        if a_left <= b_right and b_left <= a_right:
            # valid partition: left pile holds exactly 'half' smallest
            if total % 2:
                return max(a_left, b_left)
            return (max(a_left, b_left) + min(a_right, b_right)) / 2
        if a_left > b_right:
            r = i - 1            # a gave too many → take fewer
        else:
            l = i + 1            # a gave too few → take more
`,
    walkthrough: [
      "i is how many of a's smallest values join the left pile; j = half − i completes the count from b. The four boundaries (±∞ for empty edges) make the validity test uniform — no special cases for empty arrays or all-of-one-array splits.",
      "Validity means every left value ≤ every right value across BOTH arrays; the max/min of the piles then answer the median directly. Odd totals read max(left); even totals average max(left) with min(right).",
      "Why search the shorter array: half − i automatically lands in b's range, and log(min(m,n)) is the tighter bound. The failed-comparison direction is intuitive: a_left too big → i is too large → search left.",
    ],
    time: "O(log(min(m, n)))",
    space: "O(1)",
    followUps: [
      "Kth element of two sorted arrays: the same partition search targeting size k instead of half — the general form.",
      "Median of k sorted arrays: heaps or nested partition searches; a good 'how would you extend' discussion.",
    ],
    related: ["binary-search", "kth-largest-element-in-an-array", "merge-two-sorted-lists"],
    verify: {
      fn: "findMedianSortedArrays",
      wrap: "plain",
      cases: [
        { args: [[1, 3], [2]], expect: 2 },
        { args: [[1, 2], [3, 4]], expect: 2.5 },
        { args: [[0, 0], [0, 0]], expect: 0 },
        { args: [[], [1]], expect: 1 },
      ],
    },
    xp: 35,
  },
];
