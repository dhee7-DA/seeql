// Deep-dives — Heap / Priority Queue (NeetCode 150 section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const HEAP: LcDeepDive[] = [
  {
    slug: "kth-largest-element-in-a-stream",
    statement:
      "Design a class seeded with an integer k and a list of scores, then fed new scores one at a time. After every insertion, add must report the kth LARGEST value seen so far — the element at rank k of the multiset sorted descending, where duplicates each occupy their own rank.",
    examples: [
      { input: "KthLargest(3, [4,5,8,2]), add(3), add(5), add(10), add(9), add(4)", output: "add → 4, 5, 5, 8, 8", explanation: "The top three evolve [8,5,4] → [8,5,5] → [10,8,5] → [10,9,8] → [10,9,8]; the last 4 never breaks in." },
      { input: "KthLargest(1, []), add(-3), add(-2), add(-4), add(0), add(4)", output: "add → -3, -2, -2, 0, 4", explanation: "k = 1 degenerates into a running maximum, and an empty seed list is legal when the first adds supply the missing elements." },
      { input: "KthLargest(2, [0]), add(-1), add(1)", output: "add → -1, 0", explanation: "With a single seed the heap sits below capacity k; the first add fills it and the cap is enforced from then on." },
    ],
    constraints: [
      "1 <= k <= 10^4",
      "0 <= nums.length <= 10^4",
      "-10^4 <= nums[i], val <= 10^4",
      "at most 10^4 calls to add, and a kth largest always exists when add must report",
    ],
    breakdown: [
      "A stream problem changes the shape of the question: there is no 'the array' to re-sort, because values keep arriving and every arrival triggers a fresh query. Re-sorting the whole history after each add costs O(m log m) per call and O(m² log m) across the stream — dead at 10^4 calls. The kth-largest framing means exactly k values matter: everything below the kth largest is invisible to the output forever.",
      "That observation is the design: keep ONLY the k largest values seen so far, in a min-heap. The heap's smallest element is, by definition, the kth largest; the other k−1 elements are all bigger. A new value either can't crack the top k (it does not beat the heap's root) or it evicts the root (it beats something in the top k).",
      "The cap-at-k discipline is what buys the bound: the heap never exceeds k elements, so every push and pop is O(log k) and memory is O(k) no matter how long the stream runs. That is the difference between a structure that scales with history and one that scales with the answer's size. Note the cap applies at CONSTRUCTION too — a seed list larger than k must be trimmed immediately, because the constructor's job is to establish the invariant, not just stash arguments.",
    ],
    edges: [
      "The seed list can be LARGER than k — trim in the constructor, or early adds report the min of an over-full heap (rank m−k+1, not rank k).",
      "The seed list can be SHORTER than k, even empty — the heap simply sits under capacity until adds fill it; the problem's guarantee is what makes heap[0] safe on every report.",
      "Duplicates are ordinary elements: k counts with multiplicity, so k = 3 over [5,5,5] reports 5, and a value tying the root may be discarded without changing the answer.",
      "Negative values need no special handling, and k = 1 collapses the design into a running maximum — a good sanity check on the invariant.",
    ],
    ladder: [
      { title: "Brute force — re-sort the stream", body: "Keep every value in a list; after each add, sort descending and index k−1. O(m log m) per call and O(m² log m) overall — correct, and hopeless at 10^4 calls over 10^4 values." },
      { title: "Insert into a sorted list", body: "bisect.insort keeps the list ordered at O(m) per insert (element shifting) with O(1) kth-largest reads. Trades update cost for query cost; still linear per add and O(m) memory." },
      { title: "The optimal idea — min-heap capped at k", body: "Hold exactly the k largest values; the root IS the kth largest. Every add is at most one push plus one pop, O(log k), and memory stays O(k) forever — the only approach whose costs are independent of history." },
    ],
    approach: "Min-heap of size k (running top-k)",
    code: `import heapq

class KthLargest:
    def __init__(self, k, nums):
        self.k = k
        self.heap = list(nums)          # copy — never heapify the caller's list in place
        heapq.heapify(self.heap)
        while len(self.heap) > k:       # establish the invariant BEFORE any add
            heapq.heappop(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:     # over capacity → the old min leaves,
            heapq.heappop(self.heap)    # whether that's the newcomer or not
        return self.heap[0]             # smallest of the k largest = kth largest`,
    walkthrough: [
      "The invariant does all the work: the heap ALWAYS holds the k largest values seen so far (or fewer, while the stream hasn't supplied k yet). Its root is the smallest member of that elite set — which is precisely the kth largest overall, because everything not in the heap is smaller than everything in it.",
      "add enforces the invariant in two lines: push, then pop if over capacity. When the push breaches the cap, the pop removes the minimum of the combined set — either the newcomer (it didn't make the top k) or the previous kth largest (it was dethroned). Either way the surviving root is the new kth largest, so returning heap[0] needs no branching.",
      "Trimming in the constructor matters more than it looks: heapify is O(m), the trim is (m − k) pops at O(log m), and after that every operation is O(log k) forever. Skipping the trim leaves the root wrong until enough adds push the heap past k — a bug that only shows on streams seeded fat.",
    ],
    time: "O(log k) per add — O(m log m) once to seed and trim",
    space: "O(k) — the heap is hard-capped at k elements",
    followUps: [
      "kth SMALLEST in a stream: mirror the design with a max-heap of the k smallest (negate values for Python's min-heap heapq).",
      "The heap gives O(log k) per add; a fixed array of k slots with binary insertion is O(k) per add but cache-friendlier for tiny k — when does each win in practice?",
    ],
    related: ["kth-largest-element-in-an-array", "k-closest-points-to-origin", "top-k-frequent-elements"],
    verify: {
      fn: "KthLargest",
      wrap: "class",
      cases: [
        { args: [[["KthLargest", 3, [4, 5, 8, 2]], ["add", 3], ["add", 5], ["add", 10], ["add", 9], ["add", 4]]], expect: [4, 5, 5, 8, 8] },
        { args: [[["KthLargest", 1, []], ["add", -3], ["add", -2], ["add", -4], ["add", 0], ["add", 4]]], expect: [-3, -2, -2, 0, 4] },
        { args: [[["KthLargest", 2, [0]], ["add", -1], ["add", 1]]], expect: [-1, 0] },
        { args: [[["KthLargest", 3, [5, 5, 5]], ["add", 5], ["add", 1]]], expect: [5, 5] },
      ],
    },
    xp: 10,
  },
  {
    slug: "last-stone-weight",
    statement:
      "You have a pile of stones with known weights. Repeatedly take the two HEAVIEST stones and smash them: if they differ, both are destroyed and a new stone of the difference remains; if they weigh the same, both are destroyed and nothing remains. Eventually at most one stone is left — return its weight, or 0 if the pile empties.",
    examples: [
      { input: "stones = [2,7,4,1,8,1]", output: "1", explanation: "8 vs 7 → 1; 4 vs 2 → 2; the 2 smashes a 1 (leaves 1); two 1s annihilate; a single stone of weight 1 survives." },
      { input: "stones = [1]", output: "1", explanation: "A lone stone is never smashed — there is nothing to pair it with." },
      { input: "stones = [2,2]", output: "0", explanation: "Equal weights annihilate both stones, leaving an empty pile." },
    ],
    constraints: ["1 <= stones.length <= 30", "1 <= stones[i] <= 1000"],
    breakdown: [
      "The operation defines a strict processing order: the two heaviest, every round. A sorted list delivers that — but you must re-sort (or re-insert into sorted position) after every smash, paying O(n log n) per round and O(n² log n) overall. With n ≤ 30 anything passes; the point of the problem is to reach for the right tool anyway, and saying so in an interview is itself the move.",
      "A max-heap is the structure whose entire personality is 'give me the largest, fast'. Python's heapq is a MIN-heap, so the standard move is storing negated values: −s goes into the heap, and the heaviest stone is −heap[0]. This negation dance is worth internalising — it recurs in dozens of problems precisely because Python ships no max-heap.",
      "The simulation is direct: while two or more stones remain, pop the two heaviest and push back the difference if it is non-zero. A zero difference means both stones vanish — pushing a 0 would invent a stone that never existed, the classic wrong-model bug. Each round is two pops plus at most one push, so the whole smash sequence is O(n log n).",
    ],
    edges: [
      "An empty result is real: all stones can annihilate pairwise ([2,2]) — return 0, don't index into an empty heap.",
      "A single stone never enters the loop — return its weight untouched.",
      "Don't push a 0-weight 'survivor' when weights tie: the pile legitimately shrinks by two that round. The phantom 0 happens to be harmless for THIS max-only process, but it is the wrong model and leaks into variants where it isn't.",
      "Duplicates are the norm, not the corner case — the heap handles multiplicity natively; no dedupe, no special casing.",
    ],
    ladder: [
      { title: "Brute force — re-sort every round", body: "Sort, smash the top two, insert the survivor back into sorted position. O(n² log n) worst case; at n ≤ 30 it passes instantly — name it, then upgrade." },
      { title: "Sorted list with bisect", body: "Keep the list sorted; pop two from the big end, bisect.insort the survivor. O(n) per round from insertion shifts — better constants than re-sorting, same asymptotic family." },
      { title: "The optimal idea — max-heap via negation", body: "heapify the negated weights once; each round is two O(log n) pops plus at most one push. O(n log n) total, and the pattern (min-heap + negation = max-heap) transfers to the rest of this section." },
    ],
    approach: "Max-heap simulation (negated heapq)",
    code: `import heapq

def lastStoneWeight(stones):
    heap = [-s for s in stones]         # heapq is a MIN-heap → store negations
    heapq.heapify(heap)
    while len(heap) > 1:
        heavy = -heapq.heappop(heap)    # heaviest stone (most negative entry)
        second = -heapq.heappop(heap)   # second heaviest
        if heavy != second:
            heapq.heappush(heap, second - heavy)  # survivor, pre-negated
    return -heap[0] if heap else 0      # lone survivor, or empty pile`,
    walkthrough: [
      "Negation converts the min-heap into a max-heap at zero cost: the smallest negated value corresponds to the largest real one, so heappop hands you the heaviest stone. heapify is O(n) — cheaper than n pushes — and the whole negated pile is built in one comprehension.",
      "The loop keeps exactly the problem's invariant: while at least two stones exist, smash the heaviest pair. The survivor is pushed back PRE-negated (second − heavy is already the negation of heavy − second), so there is no double-negation slip. When the weights tie, nothing is pushed: the pile shrinks by two, as the rules demand.",
      "Termination is guaranteed because every round removes at least one stone. After the loop, len(heap) is 1 or 0, and the return handles both — the 'if heap else 0' is not decoration; the all-annihilate case is a real input class, and it is one of the verify cases.",
    ],
    time: "O(n log n) — about n/2 rounds of O(log n) heap work",
    space: "O(n) — the negated copy of the stones",
    followUps: [
      "Last Stone Weight II: split the stones into two piles minimising the weight difference — a subset-sum problem in disguise; no heap involved.",
      "What if stones arrive over time and you must report the top of the pile after each arrival? The heap version is already streaming; the sorted-list version degrades to re-sorting.",
    ],
    related: ["last-stone-weight-ii", "kth-largest-element-in-an-array"],
    verify: {
      fn: "lastStoneWeight",
      wrap: "plain",
      cases: [
        { args: [[2, 7, 4, 1, 8, 1]], expect: 1 },
        { args: [[1]], expect: 1 },
        { args: [[2, 2]], expect: 0 },
        { args: [[10, 4, 2]], expect: 4 },
        { args: [[3, 7, 2]], expect: 2 },
        { args: [[9, 9, 9, 9]], expect: 0 },
      ],
    },
    xp: 10,
  },
  {
    slug: "k-closest-points-to-origin",
    statement:
      "Given a list of (x, y) points on the plane and an integer k, return the k points closest to the origin (0, 0). Closeness is ordinary Euclidean distance, and the answer may be returned in any order — the set of k points is what matters.",
    examples: [
      { input: "points = [[1,3],[-2,2]], k = 1", output: "[[-2,2]]", explanation: "Squared distances: [1,3] → 10, [-2,2] → 8 — the closer point wins." },
      { input: "points = [[3,3],[5,-1],[-2,4]], k = 2", output: "[[3,3],[-2,4]]", explanation: "Squared distances are 18, 26 and 20; the two smallest belong to [3,3] and [-2,4]. Any order is accepted." },
      { input: "points = [[0,0]], k = 1", output: "[[0,0]]" },
    ],
    constraints: [
      "1 <= k <= points.length <= 10^4",
      "-10^4 <= x, y <= 10^4",
      "the answer is guaranteed unique as a set (no distance ties at the k cut); only its order may vary",
    ],
    breakdown: [
      "Distance ranking needs no square roots: d(a) < d(b) exactly when a's squared distance is smaller, and squares of integers stay exact where roots go float. Compare x² + y², never sqrt — that single decision removes a precision landmine and an FPU round-trip per point.",
      "The full sort — order every point by squared distance and slice the first k — is O(n log n) and completely respectable. The heap alternative does better when k ≪ n: keep a max-heap of the k best points seen so far; a newcomer competes only against the current WORST survivor, and eviction costs O(log k). Total O(n log k), memory O(k).",
      "The mental flip that makes the max-heap work: to keep the k SMALLEST distances you need quick access to the LARGEST of your keepers — that is a max-heap. Negate the distance so Python's min-heap surfaces the worst keeper at the root. Same trick as top-k-frequent, and it sets up the interview's favourite follow-up: 'can you avoid the log factor entirely?' — which is quickselect's cue.",
    ],
    edges: [
      "k = points.length: nothing is ever evicted; the bounded-heap code must still run — the under-capacity branch simply fills the heap.",
      "Squaring before comparing erases signs: (-2)² = 2² — sign-symmetric points are equally close and both survive if both fall inside the top k.",
      "Overflow in fixed-width languages: |x|, |y| ≤ 10^4 gives x² + y² ≤ 2·10^8, which fits 32-bit but only just — worth one sentence in C++/Java. Python ints don't care.",
      "The comparison key must be the DISTANCE, not the tuple (x, y) — sorting by coordinates ranks points, not closeness.",
    ],
    ladder: [
      { title: "Brute force — sort everything", body: "Decorate each point with x² + y², sort, take k. O(n log n) time. The correct baseline, and the thing to beat when the interviewer asks 'do you need all n order statistics?'" },
      { title: "Max-heap of size k", body: "Push the first k points keyed by negated squared distance; for each later point, replace the root if the newcomer is closer. O(n log k) — strictly better for small k, and it never holds more than k points in memory." },
      { title: "The optimal idea — quickselect", body: "Partition points by squared distance around a random pivot until the pivot lands at index k; everything left of k is the answer. Average O(n) (worst O(n²), vanishingly rare with random pivots), in place, but it reorders the input and gives nothing back on streaming data." },
    ],
    approach: "Bounded max-heap on squared distance",
    code: `import heapq

def kClosest(points, k):
    heap = []                       # max-heap of keepers via NEGATED distance
    for x, y in points:
        d = x * x + y * y           # squared distance — sqrt is monotone, skip it
        entry = (-d, x, y)          # larger d → more negative → pops first;
        if len(heap) < k:           # (x, y) only break exact ties deterministically
            heapq.heappush(heap, entry)
        elif entry > heap[0]:       # closer than the WORST current keeper
            heapq.heapreplace(heap, entry)
    return [[x, y] for _, x, y in heap]`,
    walkthrough: [
      "heap[0] is always the most negative entry — the keeper with the LARGEST distance. The elif asks one question: is the newcomer better than our worst keeper? If yes, heapreplace pops that worst and pushes the newcomer in a single sift (cheaper than separate pop + push). If no, the newcomer is discarded without touching the heap.",
      "The tuple (-d, x, y) does double duty: −d ranks by distance, and (x, y) breaks exact ties so the heap never compares incomparable keys — two points at identical distance still have distinct tuples. The problem guarantees no ties at the k cut, so the tiebreak affects internal ordering only, never which points survive.",
      "Cost audit: n points, one O(log k) heap operation each → O(n log k) time and O(k) space. Against the sort's O(n log n): at n = 10^4, k = 10 the heap does roughly 3·10^4 comparisons to the sort's 1.3·10^5; at k = 3 about eight times fewer. Quickselect would be O(n) but mutates the input and carries a worst case — say all three out loud and let the interviewer choose.",
    ],
    time: "O(n log k) — one bounded-heap operation per point",
    space: "O(k) — the heap never holds more than k entries",
    followUps: [
      "Quickselect version: average O(n). Sketch the partition, justify why recursion only continues into the side containing index k, and explain why random pivots make the O(n²) worst case a non-issue.",
      "Streaming points (arrivals one at a time, k fixed): the bounded heap answers online, while sort and quickselect must re-run per arrival — say this trade out loud.",
    ],
    related: ["top-k-frequent-elements", "kth-largest-element-in-an-array"],
    verify: {
      fn: "kClosest",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[[1, 3], [-2, 2]], 1], expect: [[-2, 2]] },
        { args: [[[3, 3], [5, -1], [-2, 4]], 2], expect: [[3, 3], [-2, 4]] },
        { args: [[[0, 0]], 1], expect: [[0, 0]] },
        { args: [[[2, 2], [1, 1], [3, 3]], 3], expect: [[1, 1], [2, 2], [3, 3]] },
        { args: [[[1, 1], [2, 2]], 1], expect: [[1, 1]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "kth-largest-element-in-an-array",
    statement:
      "Find the kth largest element in an unsorted integer array — the element that would sit at index k−1 if the array were sorted descending. This is rank by position, not the kth DISTINCT value: duplicates each occupy their own rank. Solve it without fully sorting if you can.",
    examples: [
      { input: "nums = [3,2,1,5,6,4], k = 2", output: "5", explanation: "Sorted descending: [6,5,4,3,2,1] — rank 2 is 5." },
      { input: "nums = [3,2,3,1,2,4,5,5,6], k = 4", output: "4", explanation: "Sorted descending: [6,5,5,4,3,3,2,2,1] — rank 4 is 4, even though 5 appears twice." },
      { input: "nums = [1], k = 1", output: "1" },
    ],
    constraints: ["1 <= k <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    breakdown: [
      "The naive move is sort-and-index — O(n log n), one line, and the honest baseline to state first. But the kth largest is a SELECTION problem, not an ordering problem: you need one order statistic, and full sorting pays to establish the n−1 statistics you will never read. That gap between 'one answer' and 'total order' is what the ladder exploits.",
      "The bounded min-heap is the streaming design from kth-largest-in-a-stream, unplugged from the class: scan once, keep the k largest values in a min-heap, and the root is the kth largest the moment the scan ends. O(n log k) — a genuine improvement whenever k ≪ n, and the natural answer if the interviewer adds 'what if the data arrives incrementally?'",
      "Quickselect is the asymptotic champion: partition like quicksort around a pivot, but recurse into only ONE side — the one containing rank k. Expected O(n) because each round keeps a geometric fraction of the range (n + n/2 + n/4 + … = 2n), with a 1/n² worst case that random pivots make negligible in practice. The trade: O(n) average and in place, but it mutates the array and returns nothing on streaming data.",
    ],
    edges: [
      "Duplicates count toward rank: in [3,2,3,1,2,4,5,5,6] with k = 4 the answer is 4, not 3 — the two 5s hold ranks 1 and 2.",
      "k = 1 is the maximum; k = n is the minimum. Both ends exercise the boundary branches of whichever selection you build.",
      "A strictly increasing or decreasing array is quickselect's adversarial input for fixed pivots — the randomisation is not decoration.",
      "Negative values and small ranges are irrelevant to heap and quickselect (both compare, neither counts) — though a bounded value range would legitimise a counting array instead.",
    ],
    ladder: [
      { title: "Brute force — sort and index", body: "sorted(nums, reverse=True)[k-1]. O(n log n), correct, and the right first sentence in an interview — then offer the two upgrades. Sorting computes every order statistic; you need one." },
      { title: "Min-heap of size k", body: "Scan once, keep the k largest in a min-heap, return the root. O(n log k) time, O(k) space, non-mutating, streaming-friendly — the pragmatic sweet spot, and this solution's implementation." },
      { title: "The optimal idea — quickselect", body: "Random pivot, single-sided quicksort recursion, expected O(n) time and O(1) extra space. The theory winner of the ladder; production code usually picks the heap for its predictability." },
    ],
    approach: "Bounded min-heap selection",
    code: `import heapq

def findKthLargest(nums, k):
    heap = []                       # min-heap of the k largest seen so far
    for n in nums:
        if len(heap) < k:
            heapq.heappush(heap, n) # still filling the top-k window
        elif n > heap[0]:
            heapq.heapreplace(heap, n)   # beats the worst keeper → evict it
    return heap[0]                  # smallest of the k largest = kth largest`,
    walkthrough: [
      "The invariant after each iteration: the heap contains the k largest of everything scanned so far (or fewer while the scan is young). Induction over the two branches — under capacity you must admit the newcomer; at capacity, a newcomer larger than the root belongs in the set, and the root demonstrably doesn't (it is smaller than k values: the heap's other k−1 plus the newcomer).",
      "heapreplace is pop-then-push fused into one sift-down — the right call when a replacement is already decided. The strict '>' means a value tying the root is discarded, which changes nothing: the kth largest is unaffected by a new copy of a value already in the window.",
      "Return heap[0]: the root is the weakest member of the top k, i.e. rank k overall — everything outside the heap is ≤ it, everything inside is ≥ it. Note the scan is read-only on nums, an advantage quickselect gives up, and memory is capped at k regardless of n.",
    ],
    time: "O(n log k) — one bounded-heap operation per element",
    space: "O(k) — the heap",
    followUps: [
      "Quickselect version: expected O(n), in place. Sketch the partition, justify the geometric series behind the average, and explain why random pivots retire the worst case in practice.",
      "Many kth-largest queries over one fixed array: each query stays O(n log k); if values are small bounded integers, one O(n) counting pass answers every rank in O(range).",
    ],
    related: ["top-k-frequent-elements", "k-closest-points-to-origin", "wiggle-sort-ii"],
    verify: {
      fn: "findKthLargest",
      wrap: "plain",
      cases: [
        { args: [[3, 2, 1, 5, 6, 4], 2], expect: 5 },
        { args: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expect: 4 },
        { args: [[1], 1], expect: 1 },
        { args: [[7, 7, 7, 7], 3], expect: 7 },
        { args: [[2, 1], 2], expect: 1 },
        { args: [[-1, -5, -3], 2], expect: -3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "task-scheduler",
    statement:
      "A CPU runs a queue of tasks, each an uppercase letter label; equal labels are identical jobs. Between two runs of the SAME label at least n ticks must pass, during which the CPU runs other tasks or sits idle. Every task takes one tick. Return the minimum number of ticks to finish the whole queue.",
    examples: [
      { input: 'tasks = ["A","A","A","B","B","B"], n = 2', output: "8", explanation: "A B idle A B idle A B — same labels land 3 ticks apart; the idles are forced because only A and B exist." },
      { input: 'tasks = ["A","A","A","B","B","B"], n = 0', output: "6", explanation: "No cooldown means no idle is ever needed — run the six tasks back to back." },
      { input: 'tasks = ["A","A","A","A","A","A","B","C","D","E","F","G"], n = 2', output: "16", explanation: "Six A's force five gaps of ≥ 2 ticks: A _ _ A _ _ A _ _ A _ _ A _ _ A. The six other tasks fill some gap slots, but the frame still spans 16 ticks." },
    ],
    constraints: ["1 <= tasks.length <= 10^4", "0 <= n <= 100", "tasks[i] is an uppercase English letter"],
    breakdown: [
      "Only the most frequent label constrains the schedule. Picture the max-count task A laid out in rows of (n+1) ticks: A _ _ … A _ _ … A — consecutive A's separated by exactly n slots. Every other task is filler: a copy can drop into a gap slot without creating new idles, because spacing for THAT label is enforced by the row boundaries it sits between.",
      "The formula falls straight out of that picture: (maxCount − 1) · (n + 1) measures the frame spanned by the max-count label's rows, and you add the number of labels TIED at maxCount — they all need a slot in the final row, since each still owes one more copy after the last full row. If other tasks are plentiful enough to overflow the frame's gaps — or n = 0 — the CPU never idles and the answer is simply len(tasks); the max() selects whichever bound is binding.",
      "The misstep is jumping to a heap simulation (each tick run the available task with the highest remaining count, else idle). It works, but it is O(len · log 26) bookkeeping to re-derive an arithmetic fact — and the simulation only earns its keep in generalisations (per-label cooldowns) where no closed form survives. Here: know the formula, know WHY it holds, mention the simulation as the fallback.",
    ],
    edges: [
      "n = 0 deletes the cooldown entirely → the answer is exactly len(tasks); the formula degenerates correctly, and it is a good unit test.",
      "Ties at the max (t > 1): all tied labels share the final row — (maxCount−1)(n+1) + t. Forgetting t breaks ['A','A','B','B'] with n = 2 (answer 5, not 4).",
      "Plentiful filler makes idles vanish: if len(tasks) ≥ the frame, the answer is len(tasks) — e.g. A×3 plus eight distinct tasks with n = 2 schedules in 11 ticks with no idle.",
      "Labels appearing once are pure filler — they always fit somewhere and never affect the formula beyond adding to len(tasks).",
    ],
    ladder: [
      { title: "Brute force — simulate the greedy", body: "Max-heap of remaining counts; each tick pop the most frequent legal label (count > 0, cooldown expired), else idle. Correct, O(len · log 26) plus cooldown bookkeeping — a lot of machinery for an arithmetic answer." },
      { title: "Count-only simulation", body: "Track counts and each label's last-run tick; every tick pick the legal label with the highest count. Same complexity family without a heap — still one tick at a time when the formula computes whole spans at once." },
      { title: "The optimal idea — the idle-frame formula", body: "Only the max count shapes the schedule: answer = max(len(tasks), (maxCount−1)·(n+1) + tiedAtMax). One O(len) counting pass, constant arithmetic after — the problem is a proof, not a simulation." },
    ],
    approach: "Idle-frame counting formula",
    code: `def leastInterval(tasks, n):
    count = {}
    for t in tasks:
        count[t] = count.get(t, 0) + 1

    counts = sorted(count.values())          # ascending; ≤ 26 labels
    max_count = counts[-1]                   # the schedule's bottleneck label
    tied = sum(1 for c in counts if c == max_count)  # labels sharing the last row

    # (max_count - 1) full rows of (n + 1) slots, plus the final row holding
    # every label tied at max_count; overflow filler means no idle is needed.
    return max(len(tasks), (max_count - 1) * (n + 1) + tied)`,
    walkthrough: [
      "Three lower bounds stack up, and the answer is the largest of them. (1) Trivially the schedule spans at least len(tasks) ticks. (2) A label with the maximum count c places consecutive copies at least n+1 ticks apart, so its last copy starts no earlier than tick (c−1)(n+1) — the span is at least (c−1)(n+1) + 1. (3) If t labels tie at count c, each owes a final copy after that frame and the t copies cannot share a tick, giving (c−1)(n+1) + t. The formula is exactly this max.",
      "The bounds are tight. For the idle regime (the frame exceeds len(tasks)), lay out the rows and leave unused gap slots idle — every filler label has count ≤ c−1, so its copies fit one per row and adjacent-row copies stay ≥ n apart. For the busy regime, a greedy simulation (run the legal task with the highest remaining count, else idle) attains len(tasks): an exchange argument shows reordering any schedule to prefer the highest-remaining legal task never lengthens it, and that greedy idles only when every remaining task is the label it just ran — precisely the arithmetic where the frame takes over. The two regimes are mutually exclusive, which is why the answer is a max() and not a case tree.",
      "Implementation is a counting exercise: one pass over tasks, then read off the tallest column and how many columns tie it. With at most 26 distinct labels even the sort is constant, so the whole function is O(len) time and O(26) space. Keep the simulation in your back pocket for the generalisation where each label has its OWN cooldown — there the closed form dies and the heap earns its keep.",
    ],
    time: "O(len(tasks)) — one counting pass; the rest is constant arithmetic",
    space: "O(1) — at most 26 counters",
    followUps: [
      "Per-label cooldowns (each label has its own n): the closed form collapses — this is where the greedy heap simulation becomes the right answer.",
      "What is the minimum number of IDLE ticks (as a separate output)? max(0, (maxCount−1)·(n+1) + tied − len(tasks)) — same arithmetic, different read.",
    ],
    related: ["reorganize-string", "rearrange-string-k-distance-apart"],
    verify: {
      fn: "leastInterval",
      wrap: "plain",
      cases: [
        { args: [["A", "A", "A", "B", "B", "B"], 2], expect: 8 },
        { args: [["A", "A", "A", "B", "B", "B"], 0], expect: 6 },
        { args: [["A", "A", "A", "A", "A", "A", "B", "C", "D", "E", "F", "G"], 2], expect: 16 },
        { args: [["A", "A", "B", "B"], 2], expect: 5 },
        { args: [["A", "A", "A", "B", "B", "C"], 2], expect: 7 },
        { args: [["A"], 3], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "design-twitter",
    statement:
      "Design a miniature social network. postTweet(userId, tweetId) publishes a tweet; getNewsFeed(userId) returns the ids of the ten MOST RECENT tweets from the user themself and everyone they follow, newest first; follow(followerId, followeeId) subscribes one user to another; unfollow(followerId, followeeId) unsubscribes. Every user sees their own tweets without following themselves.",
    examples: [
      { input: "Twitter(), postTweet(1, 5), getNewsFeed(1), follow(2, 1), getNewsFeed(2), unfollow(2, 1), getNewsFeed(2)", output: "getNewsFeed(1) → [5], getNewsFeed(2) → [5], getNewsFeed(2) → []", explanation: "User 2 sees user 1's tweet only while the follow is live; unfollow drops it from the feed immediately." },
      { input: "Twitter(), postTweet(1, 1) … postTweet(1, 12), getNewsFeed(1)", output: "[12, 11, 10, 9, 8, 7, 6, 5, 4, 3]", explanation: "Twelve tweets, feed capped at ten — the two oldest have fallen off the end." },
      { input: "Twitter(), postTweet(1, 101), postTweet(2, 201), postTweet(1, 102), postTweet(2, 202), follow(1, 2), getNewsFeed(1)", output: "[202, 102, 201, 101]", explanation: "The feed interleaves two users by recency, not by user — grouping per account would be wrong." },
    ],
    constraints: [
      "1 <= userId, followerId, followeeId <= 500",
      "0 <= tweetId <= 10^4",
      "at most 3·10^4 total calls",
      "a user never follows themself (and your code should stay correct even if asked to)",
    ],
    breakdown: [
      "Two pieces of state and one global clock. Tweets live per user in append-only lists — appending preserves chronological order inside each list for free. Recency comes from a monotonically increasing counter stamped at every postTweet: comparison by counter is total and unambiguous, where wall-clock timestamps would tie. Follows live as per-user sets, giving O(1) follow, unfollow and duplicate handling.",
      "getNewsFeed is a k-way merge — merge-k-sorted-lists wearing a social network. Each relevant user's tweet list is sorted newest-LAST, so its newest element is the tail; seed a heap with every followed user's newest tweet, then repeatedly pop the globally newest and push that user's next-newest. The feed serves ten tweets at O(10 log F) for F followed users — reads scale with followers, not with the platform's entire history.",
      "The missteps are predictable: one global tweet list filtered per feed call is O(all tweets ever) per read; re-sorting each user's tweets per feed ignores that the append-only list is already sorted. And the classic self-own: a user must see their own tweets WITHOUT following themself — union {userId} into the read set at feed time rather than relying on follow data, or an unfollow(self) bug will silently delete someone's own feed.",
    ],
    edges: [
      "Self-follow must be impossible or harmless: follow(1,1) then unfollow(1,1) would erase user 1's own tweets from their feed if follows were the only source of 'who do I read'. Guard the follow, and union self at read time.",
      "Unfollowing someone who was never followed must be a quiet no-op — set discard, not remove.",
      "The feed caps at ten MID-user: stop after the tenth pop; do not promote a user's next tweet into a feed that is already full.",
      "tweetIds are not globally unique across users — never use one as a clock, a key, or a tiebreaker.",
    ],
    ladder: [
      { title: "Brute force — one global list, filter per feed", body: "Store (time, userId, tweetId) in a single list; getNewsFeed scans everything, filters by followees, sorts, slices ten. O(T log T) per feed for T total tweets — correct, and quadratic-ish at 3·10^4 calls." },
      { title: "Per-user lists, sort at read time", body: "Append tweets per user; at feed time concatenate followees' lists, sort by recency, slice. Writes get cheaper, but each read re-sorts data every list already had sorted." },
      { title: "The optimal idea — heap merge of per-user streams", body: "Per-user append-only lists plus a global counter; the feed seeds a heap with each followee's newest tweet and pops ten times. O(F log F) to seed, ten O(log F) pops to serve — the merge never touches history beyond heads." },
    ],
    approach: "Per-user streams + k-way heap merge",
    code: `import heapq

class Twitter:
    def __init__(self):
        self.time = 0               # global logical clock — one tick per tweet
        self.tweets = {}            # userId -> [(time, tweetId)], chronological
        self.follows = {}           # userId -> set of followees

    def postTweet(self, userId, tweetId):
        self.time += 1
        self.tweets.setdefault(userId, []).append((self.time, tweetId))

    def getNewsFeed(self, userId):
        people = self.follows.get(userId, set()) | {userId}  # own tweets always visible
        heap = []                   # (negated time, userId, index into their list)
        for uid in people:
            posts = self.tweets.get(uid, [])
            if posts:               # seed each user's NEWEST tweet
                heapq.heappush(heap, (-posts[-1][0], uid, len(posts) - 1))
        feed = []
        while heap and len(feed) < 10:
            _, uid, idx = heapq.heappop(heap)   # newest tweet across everyone
            feed.append(self.tweets[uid][idx][1])
            if idx > 0:                     # that user's next-newest joins
                heapq.heappush(heap, (-self.tweets[uid][idx - 1][0], uid, idx - 1))
        return feed

    def follow(self, followerId, followeeId):
        if followerId != followeeId:    # self-follow would corrupt unfollow
            self.follows.setdefault(followerId, set()).add(followeeId)

    def unfollow(self, followerId, followeeId):
        if followerId in self.follows:
            self.follows[followerId].discard(followeeId)   # no-op if absent`,
    walkthrough: [
      "postTweet is O(1): bump the clock, append (time, tweetId). Each user's list is sorted by time automatically — append order IS chronological order — which is exactly what licenses the merge to look only at list tails and never rescan bodies.",
      "The feed is the k-way merge pattern with F streams: seed F heads, pop the global newest, promote the popped user's previous tweet. Negated times turn the min-heap into a newest-first heap, and ties never occur because the global clock is strictly increasing. The idx > 0 guard stops promotion once a user's list is exhausted, and the len(feed) < 10 check caps the read mid-user.",
      "follow and unfollow are guarded set operations; getNewsFeed unions self at READ time, so feeds are correct for users who never posted, never followed, or tried to follow themselves. Memory is O(total tweets) — irreducible if history must stay replayable — but per-call read cost is bounded by follower count, which is the design win worth stating.",
    ],
    time: "postTweet/follow/unfollow O(1); getNewsFeed O(F log F) for F followed users, plus ten pop/promote steps",
    space: "O(T + F) — every tweet ever posted, plus follow edges",
    followUps: [
      "Feeds beyond ten, or uncapped pagination: same merge with a larger k; for huge F, merge lazily over iterators so only heads are touched until the caller asks for more.",
      "Real systems fan out on WRITE (push each tweet into followers' prebuilt feeds, e.g. Redis lists) instead of merging on READ. Sketch when each dominates — celebrity accounts break fan-out-on-write.",
    ],
    related: ["merge-k-sorted-lists", "lru-cache"],
    verify: {
      fn: "Twitter",
      wrap: "class",
      voidOps: ["postTweet", "follow", "unfollow"],
      cases: [
        { args: [[["Twitter"], ["postTweet", 1, 5], ["getNewsFeed", 1], ["follow", 2, 1], ["getNewsFeed", 2], ["unfollow", 2, 1], ["getNewsFeed", 2]]], expect: [[5], [5], []] },
        { args: [[["Twitter"], ["postTweet", 1, 1], ["postTweet", 1, 2], ["postTweet", 1, 3], ["postTweet", 1, 4], ["postTweet", 1, 5], ["postTweet", 1, 6], ["postTweet", 1, 7], ["postTweet", 1, 8], ["postTweet", 1, 9], ["postTweet", 1, 10], ["postTweet", 1, 11], ["postTweet", 1, 12], ["getNewsFeed", 1]]], expect: [[12, 11, 10, 9, 8, 7, 6, 5, 4, 3]] },
        { args: [[["Twitter"], ["postTweet", 1, 101], ["postTweet", 2, 201], ["postTweet", 1, 102], ["postTweet", 2, 202], ["follow", 1, 2], ["getNewsFeed", 1], ["unfollow", 1, 2], ["getNewsFeed", 1]]], expect: [[202, 102, 201, 101], [102, 101]] },
        { args: [[["Twitter"], ["follow", 1, 1], ["postTweet", 1, 7], ["getNewsFeed", 1], ["unfollow", 1, 99], ["getNewsFeed", 2]]], expect: [[7], []] },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-median-from-data-stream",
    statement:
      "Design a structure that accepts numbers one at a time and can report the median of everything seen so far at any moment. The median of an odd count is the middle value; for an even count it is the average of the two middle values. addNum(num) ingests one number; findMedian() returns the current median.",
    examples: [
      { input: "MedianFinder(), addNum(1), addNum(2), findMedian(), addNum(3), findMedian()", output: "findMedian → 1.5, then 2.0", explanation: "Odd counts return the middle element; even counts return the mean of the two middles ([1,2] → 1.5)." },
      { input: "MedianFinder(), addNum(-1), addNum(-2), findMedian()", output: "-1.5", explanation: "Negatives behave identically — the halves partition by value, not by sign." },
      { input: "MedianFinder(), addNum(5), findMedian(), addNum(0), findMedian()", output: "5.0, then 2.5", explanation: "A lone element is its own median; the second add forces the two-heap rebalance before the next query." },
    ],
    constraints: [
      "-10^5 <= num <= 10^5",
      "at most 5·10^4 calls to addNum and findMedian",
      "findMedian is only called when at least one number has been added",
    ],
    breakdown: [
      "Sorted-list-and-index is the obvious answer — bisect.insort makes each add O(n) from element shifting, and the median read is O(1). At 5·10^4 adds that is on the order of 10^9 element moves; the problem exists to punish exactly this. What you need is a structure where the middle is a HEAD, not an index.",
      "Two heaps partition the data around the median: a max-heap `lo` holding the smaller half, a min-heap `hi` holding the larger half, with sizes balanced so lo has equal count or exactly one extra. When the partition holds, the median sits on top: −lo[0] alone (odd), or the average of −lo[0] and hi[0] (even). Every addNum restores the partition with at most three heap hops — O(log n) — and findMedian becomes O(1).",
      "The insertion choreography is what makes it clean. Push the newcomer into lo, immediately move lo's largest across to hi, and if hi has outgrown lo, move hi's smallest back to lo. This 'push across, maybe push back' establishes BOTH invariants — ordering across the boundary and the size balance — through one branchless code path, with no case analysis on which side the newcomer 'belongs'. Negation implements the max-heap, since Python ships only a min-heap.",
    ],
    edges: [
      "The very first add: lo starts empty, yet the choreography handles it without a special case — trace it rather than trusting it (the value lands in lo, hops to hi, and hops back).",
      "Duplicates of the current median: [2,2,2] must yield 2 — the partition tolerates equal values straddling the boundary.",
      "The size invariant (lo ≥ hi, never more than one apart) is what makes 'lo-only' versus 'average the two tops' a complete decision; a skipped rebalance breaks the even case silently.",
      "The even case divides by 2 and must not truncate — in fixed-width languages, promote to a wider type BEFORE dividing (a+b can overflow the element type); Python's true division makes it a non-issue.",
    ],
    ladder: [
      { title: "Brute force — keep a sorted list", body: "insort on each add (O(n) shift) and index the middle on each read. O(n²) aggregate for n adds. Immediately wrong at 5·10^4 scale — and the tell is that the middle is an index here, not a head." },
      { title: "Two heaps, branchy rebalance", body: "Decide per add whether the newcomer belongs in lo or hi by comparing against the boundary tops, then fix the sizes. Correct, but the branchy version is where subtle bugs live: empty-heap reads and wrong-side comparisons." },
      { title: "The optimal idea — push-across rebalancing", body: "Always push into lo, always move lo's max to hi, move back only if hi outran lo. Three heap ops, no branching on values, both invariants restored mechanically. O(log n) per add, O(1) median." },
    ],
    approach: "Two heaps — max-heap lower half, min-heap upper half",
    code: `import heapq

class MedianFinder:
    def __init__(self):
        self.lo = []    # max-heap (negated): the smaller half of the numbers
        self.hi = []    # min-heap: the larger half

    def addNum(self, num):
        heapq.heappush(self.lo, -num)                     # 1) land in the lower half
        heapq.heappush(self.hi, -heapq.heappop(self.lo))  # 2) its largest moves up
        if len(self.hi) > len(self.lo):                   # 3) hi never outgrows lo
            heapq.heappush(self.lo, -heapq.heappop(self.hi))

    def findMedian(self):
        if len(self.lo) > len(self.hi):
            return float(-self.lo[0])             # odd count → lo owns the median
        return (-self.lo[0] + self.hi[0]) / 2.0   # even → mean of the two heads`,
    walkthrough: [
      "Two invariants hold after every addNum: (a) every value in lo ≤ every value in hi, and (b) len(lo) equals len(hi) or len(hi)+1. Step 2 enforces (a): whatever lo surrenders is, by definition, ≥ everything left in lo, so handing it to hi preserves the cross-boundary ordering no matter which side the newcomer belonged on.",
      "Step 3 enforces (b): each add nets one element into the system, and the move-back fires exactly when hi would end up strictly larger. So lo is never smaller than hi and never more than one bigger — the median is therefore either lo's top alone (odd count) or the mean of the two tops (even count). No search, no sort: the median is two array reads.",
      "Negation is the only Python-specific wrinkle: heapq is a min-heap, so lo stores negated values and every read re-negates. Trace the first add to see why there is no empty-heap special case: the value enters lo, immediately hops to hi, then hops back — net effect lo = [−num], hi = []. The choreography is self-healing from the empty state, which is why the code has no branches on emptiness.",
    ],
    time: "O(log n) per addNum — three heap hops; findMedian O(1)",
    space: "O(n) — the two heaps split every number between them",
    followUps: [
      "Sliding-window median (numbers expire): heapq cannot delete arbitrary elements — discuss lazy deletion (a counter of stale entries popped on demand) or two balanced BSTs.",
      "If reads vastly outnumber writes, the sorted-list version wins with its O(1) read at O(n) per insert — complexity trade-offs are workload-dependent; say when each structure dominates.",
    ],
    related: ["kth-largest-element-in-a-stream", "median-of-two-sorted-arrays", "sliding-window-median"],
    verify: {
      fn: "MedianFinder",
      wrap: "class",
      voidOps: ["addNum"],
      cases: [
        { args: [[["MedianFinder"], ["addNum", 1], ["addNum", 2], ["findMedian"], ["addNum", 3], ["findMedian"]]], expect: [1.5, 2] },
        { args: [[["MedianFinder"], ["addNum", -1], ["addNum", -2], ["findMedian"]]], expect: [-1.5] },
        { args: [[["MedianFinder"], ["addNum", 5], ["findMedian"], ["addNum", 0], ["findMedian"]]], expect: [5, 2.5] },
        { args: [[["MedianFinder"], ["addNum", 0], ["addNum", -1], ["findMedian"], ["addNum", 4], ["findMedian"]]], expect: [-0.5, 0] },
      ],
    },
    xp: 35,
  },
  {
    slug: "ipo",
    statement:
      "You start with capital w and may complete at most k projects. Project i requires capital[i] on hand to start and pays profits[i] as pure gain on completion (the invested capital stays yours too). Projects run one at a time, each finishing before the next choice. Return the maximum capital achievable after at most k completions.",
    examples: [
      { input: "k = 2, w = 0, profits = [1,2,3], capital = [0,1,1]", output: "4", explanation: "Only the free project is affordable first (profit 1 → w = 1); with w = 1 both capital-1 projects unlock and the profit-3 one is taken → w = 4." },
      { input: "k = 3, w = 0, profits = [1,2,3], capital = [0,1,2]", output: "6", explanation: "Each completion funds the next threshold — take 1, then 2, then 3, greedily." },
      { input: "k = 2, w = 0, profits = [1,2,3], capital = [1,1,2]", output: "0", explanation: "Nothing is affordable at w = 0 and capital never grows — no project ever starts." },
    ],
    constraints: [
      "1 <= k <= profits.length <= 10^4",
      "0 <= profits[i] <= 10^4",
      "0 <= w, capital[i] <= 10^9",
    ],
    breakdown: [
      "The greedy intuition is immediate: at every pick, take the most profitable project you can currently afford. Why is locally-best globally-best? Capital is the only state, it only grows, and project payouts are independent — completing the best affordable project now leaves you with a superset of what any cheaper choice would leave, and at least as much money. An exchange argument finishes it: any optimal plan's first pick can be swapped for the greedy pick without shrinking what follows.",
      "The mechanical challenge is the repeated query 'most profitable among all projects with capital[i] ≤ w' as w grows. Sorting projects by capital gives a static order, and the affordable set only ever APPENDS as w increases — affordability is monotone. So one pointer sweeps the capital-sorted list pushing newly affordable profits into a max-heap, and each pick pops the heap's top. The pointer never moves backwards; every project is pushed once and popped at most once.",
      "The two classic wrong turns: re-scanning all projects every pick (O(k·n)), and sorting by PROFIT while checking capital greedily — wrong shape, because an unaffordable high-profit project must be skipped but kept pending, and the capital-sorted pointer is exactly that bookkeeping. And yes, negate the profits for Python's min-heap — third appearance of the negation pattern in this section, which is the point.",
    ],
    edges: [
      "No affordable project at all (min capital > w): the heap stays empty — break and return w unchanged; further iterations can never help because capital cannot grow.",
      "k larger than the project count: the heap empties after the last pick; the same break-on-empty guard covers it and prevents popping from nothing.",
      "Profit ties need no tie-breaking — equal payouts yield equal final capital whichever is taken.",
      "Zero-profit projects are legal and harmless: the greedy may spend a pick on one only when nothing better is affordable, which changes no outcome.",
    ],
    ladder: [
      { title: "Brute force — rescan each pick", body: "k rounds, each a linear scan for the best affordable unstarted project. O(k·n) — ~10^8 at full constraints; correct but the repeated 'max among affordable' begs for a heap." },
      { title: "Sort by capital, rescan per pick", body: "Sort once by capital; each pick scans forward for newly affordable projects and pushes profits, then pops the best. Right shape — but if the scan restarts per pick you are back at O(k·n); the pointer must be monotone." },
      { title: "The optimal idea — monotone pointer + max-heap", body: "One forward sweep of the capital-sorted projects (each pushed once) plus one pop per pick. O(n log n) for the sort and O((n + k) log n) overall — the pointer's monotonicity is the whole trick, since affordability only ever grows." },
    ],
    approach: "Capital-sorted sweep + max-heap of affordable profits",
    code: `import heapq

def findMaximizedCapital(k, w, profits, capital):
    projects = sorted(zip(capital, profits))    # by capital required, ascending
    heap = []                   # negated profits of affordable, unstarted projects
    i, n = 0, len(projects)
    for _ in range(k):          # at most k completions
        while i < n and projects[i][0] <= w:  # everything newly affordable joins
            heapq.heappush(heap, -projects[i][1])
            i += 1
        if not heap:            # nothing affordable and w can't grow → done
            break
        w += -heapq.heappop(heap)   # take the best; capital only grows
    return w`,
    walkthrough: [
      "The pointer i is monotone because affordability is: once capital[i] ≤ w holds, it holds forever as w grows. Each iteration's while-loop therefore consumes a PREFIX of the sorted list, and across the whole run each project is pushed exactly once — the per-pick rescan collapses from O(n) to amortised O(1).",
      "The heap holds exactly the set 'affordable and not yet taken', and its root is the most profitable member — negation turns heapq's min-heap into the max-heap we need. A pick pops the root and adds to w; the next iteration's while-loop admits whatever the new w unlocked. The break-on-empty is load-bearing: it handles both 'nothing was ever affordable' and 'everything is already taken'.",
      "Complexity: the sort dominates at O(n log n); the loop performs at most n pushes and k pops, each O(log n), for O((n + k) log n) total and O(n) space. Trace example 1 to watch the choreography: w = 0 admits only (0, 1); taking it makes w = 1, which admits both capital-1 projects; the heap then holds {2, 3} and the pop takes 3 → w = 4.",
    ],
    time: "O(n log n + k log n) — sort once, then one heap op per push/pop",
    space: "O(n) — the sorted project list and the heap",
    followUps: [
      "Negative profits (some projects lose money): the greedy breaks — where exactly does the exchange argument fail, and what kind of problem does it become?",
      "The same 'monotone pointer + heap' shape drives single-threaded-cpu (1834): sort events by trigger, heap the candidates, pop one per step — name the pattern, not the problems.",
    ],
    related: ["minimum-cost-to-hire-k-workers", "single-threaded-cpu", "kth-largest-element-in-an-array"],
    verify: {
      fn: "findMaximizedCapital",
      wrap: "plain",
      cases: [
        { args: [2, 0, [1, 2, 3], [0, 1, 1]], expect: 4 },
        { args: [3, 0, [1, 2, 3], [0, 1, 2]], expect: 6 },
        { args: [1, 2, [1, 3, 4], [3, 1, 2]], expect: 6 },
        { args: [2, 0, [1, 2, 3], [1, 1, 2]], expect: 0 },
        { args: [10, 1, [2, 8], [0, 5]], expect: 3 },
        { args: [1, 0, [5], [0]], expect: 5 },
      ],
    },
    xp: 35,
  },
  {
    slug: "reorganize-string",
    statement:
      "Rearrange the letters of a string so that no two adjacent characters are equal, returning any one valid arrangement. If the letter counts make that impossible, return the empty string. The input consists of lowercase English letters.",
    examples: [
      { input: 's = "aab"', output: '"aba"', explanation: "The two a's must be separated, and the single b is the only available separator." },
      { input: 's = "aaab"', output: '""', explanation: "Three a's in a length-4 string guarantee a collision — one letter can occupy at most (4+1)//2 = 2 slots." },
      { input: 's = "aaabbc"', output: '"ababac"', explanation: "Any valid arrangement is accepted by LeetCode; the harness grades this specific one, which is what the count-heap with alphabetical tie-breaking deterministically produces." },
    ],
    constraints: ["1 <= s.length <= 500", "s consists of lowercase English letters"],
    breakdown: [
      "Feasibility first: if any letter's count exceeds (len + 1) // 2 — the ceiling of half the length — two of its copies must touch, and the answer is '' immediately. That is also the ONLY obstruction: when no letter breaches the ceiling, a valid arrangement always exists, so the check is a complete feasibility test rather than a heuristic.",
      "The greedy construction: repeatedly place the most frequent REMAINING letter that isn't the one just placed, then put that letter on a one-round cooldown. A max-heap keyed by remaining count serves 'most frequent' in O(log 26); the just-used letter sits out exactly one iteration — it cannot be adjacent to itself — and rejoins with its count decremented. Because a letter only ever re-enters after a DIFFERENT letter was placed, no two equal characters can ever touch: the cooldown is the correctness argument.",
      "Determinism matters for testing: heap entries are (−count, letter) tuples, so count ties pop in alphabetical order and the output is a pure function of the input — even though LeetCode accepts any valid arrangement. The verify cases therefore stick to inputs whose valid output is unique (like 'aab'), impossible inputs, or deterministic-by-algorithm inputs whose specific answer is flagged in the example explanation.",
    ],
    edges: [
      "The impossibility ceiling is (len + 1) // 2, not len // 2 — odd lengths grant the extra slot to the majority letter ('aab' works because (3+1)//2 = 2).",
      "A single letter 'a' is trivially valid (the no-adjacent-equal rule is vacuous), but 'aa' breaches the ceiling → ''.",
      "Never re-add a letter whose count hit zero — a 0-count tuple in the heap keeps 'placing' phantom characters and the output grows past len(s).",
      "All-distinct letters ('abc') degenerate gracefully: every count is 1, nothing ever waits a second round, and the output is the alphabetical order.",
    ],
    ladder: [
      { title: "Brute force — permute and test", body: "Generate permutations until one has no equal neighbours. O(n!·n) — comically dead at n = 500; it exists only to name the target property." },
      { title: "Even/odd slot filling", body: "Sort letters by count; pour the most frequent into positions 0,2,4… and the rest into 1,3,5…. Linear and correct, but the pour order needs care at the even/odd boundary, and it dead-ends at the k-distance generalisation." },
      { title: "The optimal idea — count-heap with a cooldown", body: "Max-heap by remaining count; place the top, hold it out one round, re-add it decremented. O(n log 26) — effectively linear — and the cooldown generalises verbatim to 'no same letter within distance k' (hold for k rounds)." },
    ],
    approach: "Max-heap by count with one-round cooldown",
    code: `import heapq
from collections import Counter

def reorganizeString(s):
    counts = Counter(s)
    if max(counts.values()) > (len(s) + 1) // 2:
        return ""                   # a majority letter can't be kept apart
    heap = [(-c, ch) for ch, c in counts.items()]
    heapq.heapify(heap)             # min-heap on (-count, letter) = max by count;
    out = []                        # ties break alphabetically → deterministic
    held = None                     # the letter cooling down (just placed)
    while heap:
        neg, ch = heapq.heappop(heap)   # most frequent letter NOT on cooldown
        out.append(ch)
        if held is not None:            # its one-round cooldown has expired
            heapq.heappush(heap, held)
        held = (neg + 1, ch) if neg + 1 < 0 else None  # rejoin only if copies remain
    return "".join(out)`,
    walkthrough: [
      "The ceiling check is worth proving in both directions. Necessity: a letter with m copies in a length-L string needs m−1 separators between consecutive copies, and only L−m other letters exist — so m−1 ≤ L−m, i.e. m ≤ (L+1)/2. Sufficiency: pour the max letter into even slots 0,2,4… and thread the rest through the remaining slots in count order — the standard construction never collides once no letter breaches the ceiling.",
      "The loop maintains one invariant: the letter placed at step i differs from the letter placed at step i−1, guaranteed by holding the just-placed letter OUT of the heap for exactly one iteration. The decrement-on-hold (neg + 1) means a letter with one copy left never re-enters — pushing a 0-count tuple would phantom-extend the output past len(s), a bug this design makes structurally impossible.",
      "Complexity: at most 26 distinct keys, so every heap operation is O(log 26) — constant in practice — and the loop runs len(s) times: O(n) time, O(26) extra space plus the output. The (−count, letter) tiebreak makes the function total and deterministic; LeetCode still accepts any valid arrangement, which is why the deterministic outputs are called out in the examples rather than silently assumed.",
    ],
    time: "O(n) — one heap operation per character, with an alphabet-bounded log factor",
    space: "O(1) — at most 26 heap entries, plus the output",
    followUps: [
      "Generalise to 'same letters at least k apart' (rearrange-string-k-distance-apart): hold a letter for k−1 rounds via a wait queue — Task Scheduler (621) is the counting-only cousin of the same cooldown idea.",
      "A heap-free variant: sort letters by count and fill even indices first, then odd — O(n) outright. Where exactly does the even/odd pour risk a collision, and why does count order prevent it?",
    ],
    related: ["rearrange-string-k-distance-apart", "task-scheduler", "sort-characters-by-frequency"],
    verify: {
      fn: "reorganizeString",
      wrap: "plain",
      cases: [
        { args: ["aab"], expect: "aba" },
        { args: ["aaab"], expect: "" },
        { args: ["a"], expect: "a" },
        { args: ["abb"], expect: "bab" },
        { args: ["aaabbc"], expect: "ababac" },
        { args: ["aaabbb"], expect: "ababab" },
      ],
    },
    xp: 20,
  },
];
