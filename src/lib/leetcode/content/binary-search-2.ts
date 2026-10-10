// Deep-dives — Binary Search, part 2 (TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const BINARY_SEARCH_2: LcDeepDive[] = [
  {
    slug: "search-insert-position",
    statement:
      "Given a sorted array of distinct integers and a target value, return the target's index if it's present — otherwise return the index where it would be inserted to keep the array sorted. O(log n) is expected.",
    examples: [
      { input: "nums = [1,3,5,6], target = 5", output: "2" },
      { input: "nums = [1,3,5,6], target = 2", output: "1", explanation: "2 belongs between 1 and 3 — index 1." },
      { input: "nums = [1,3,5,6], target = 7", output: "4", explanation: "Larger than everything → the append position." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "distinct values, ascending", "−10^4 <= nums[i], target <= 10^4", "O(log n) expected"],
    breakdown: [
      "Strip the framing and this is ONE question: the index of the FIRST element that is ≥ target. If target exists, that first-≥ element IS target (values are distinct); if it doesn't, the first element larger than target is precisely the slot where target belongs; and if nothing is larger, the answer is len(nums) — the append position. One quantity covers found, insert-in-the-middle, and insert-at-the-end without a line of case analysis.",
      "That 'first index where a predicate flips' shape is the LOWER-BOUND search — a sibling of, but crucially not the same as, the 'find the value' search in the Binary Search entry. The loop runs while l < r over a half-open range [l, r), and when nums[m] >= target the mid STAYS a candidate (r = m) instead of being discarded. Mixing the two templates is the classic factory of infinite loops and off-by-one answers here.",
      "The naive misstep is three code paths for three cases — special-casing an empty array, a front insert, an append. Each path is small and each is wrong in its own special way; the lower-bound formulation makes all three fall out of one return statement. When an interviewer asks for 'the insertion point', they're listening for the words 'first index ≥ target'.",
    ],
    edges: [
      "Target smaller than every element → 0; larger than every element → len(nums). Both must fall out of the loop, never from special cases.",
      "Target equals an existing element — with distinct values the lower bound lands exactly on it.",
      "Single-element array — the loop must run once and place the answer on either side.",
      "The half-open right wall r = len(nums): an off-by-one here turns every append case into an index error.",
    ],
    ladder: [
      { title: "Linear scan", body: "Walk until nums[i] >= target or the array ends. O(n) — correct and pointless for data that's already sorted." },
      { title: "Membership search, then patch", body: "One closed-interval search to test presence, then arithmetic to patch in an insert index. O(log n), but the case-splitting around found/absent is where the bugs live." },
      { title: "The optimal idea — lower-bound search", body: "Binary search the first index with nums[i] >= target on a half-open range; that single index is the answer in every case. O(log n), no branches, eight lines." },
    ],
    approach: "Lower-bound search (first index ≥ target)",
    code: `def searchInsert(nums, target):
    l, r = 0, len(nums)              # half-open [l, r): the answer lives here
    while l < r:
        m = (l + r) // 2
        if nums[m] < target:
            l = m + 1                # everything left of m is too small
        else:
            r = m                    # nums[m] >= target → m stays a candidate
    return l                         # first index with nums[i] >= target`,
    walkthrough: [
      "The invariant: every index < l holds a value < target, and every index ≥ r holds a value ≥ target. Both halves of that sentence are vacuously true when the interval is empty, so when l == r the answer is l — the first '≥' slot, whether that slot currently holds target or needs to.",
      "Why r = m and never m − 1: nums[m] >= target means m itself might be the FIRST such index; discarding it could skip the answer. Progress still holds because the floor mid always moves one pointer by at least one — the interval strictly shrinks and the loop terminates.",
      "Trace [1,3,5,6], target = 2: [0,4) → m = 2, 5 ≥ 2 → r = 2; m = 1, 3 ≥ 2 → r = 1; m = 0, 1 < 2 → l = 1. l == r = 1: the gap between 1 and 3. Target = 7 walks l all the way to 4 = len(nums) — the append case for free, no special branch.",
    ],
    time: "O(log n) — the half-open interval halves each iteration",
    space: "O(1)",
    followUps: [
      "Duplicates allowed: this exact loop is bisect_left — the leftmost valid slot; bisect_right (insert after equal values) changes one comparison to nums[m] <= target.",
      "Count of elements < target: the same lower bound — the returned index IS that count. Range-counting problems reuse this constantly.",
    ],
    related: ["binary-search", "successful-pairs-of-spells-and-potions", "find-peak-element"],
    verify: {
      fn: "searchInsert",
      wrap: "plain",
      cases: [
        { args: [[1, 3, 5, 6], 5], expect: 2 },
        { args: [[1, 3, 5, 6], 2], expect: 1 },
        { args: [[1, 3, 5, 6], 7], expect: 4 },
        { args: [[1, 3, 5, 6], 0], expect: 0 },
        { args: [[1], 1], expect: 0 },
        { args: [[1], 2], expect: 1 },
      ],
    },
    xp: 10,
  },
  {
    slug: "guess-number-higher-or-lower",
    statement:
      "A hidden number between 1 and n has been fixed. You probe integers one at a time, and a black-box guess(x) API answers each probe: −1 if x is too high, 1 if x is too low, 0 if x is exactly right. Recover the hidden number — the interesting part is doing it in O(log n) probes.",
    examples: [
      { input: "n = 10, pick = 6", output: "6" },
      { input: "n = 1, pick = 1", output: "1", explanation: "A one-candidate range — the first probe ends it." },
      { input: "n = 2, pick = 1", output: "1" },
    ],
    constraints: ["1 <= n <= 2^31 − 1", "1 <= pick <= n", "minimise probes — O(log n) expected"],
    breakdown: [
      "Underneath the theatre this is binary search over the integer range [1, n]: the hidden pick plays the role the sorted array usually does. The verdicts are MONOTONE — every value ≤ pick answers 'too low', every value ≥ pick answers 'too high' — and monotone feedback over an ordered space is exactly what binary search consumes. No array is handed to you; the search space is the value range itself, as in koko-eating-bananas.",
      "The trap is the API's sign convention, and it's a mean one: guess(x) returns −1 when x is TOO HIGH — backwards from the comparator instinct that 'negative means smaller'. The reflexive 'guess(m) == −1 → search right' walks the wrong way, still terminates, and fails quietly. Write the two branches as explicitly named cases and sanity-test one instance where pick > mid before trusting your pointer directions.",
      "On LeetCode the pick is never visible — it lives behind the interactive guess() API and you reason purely from verdicts. For the in-app harness the hidden value arrives as an explicit second argument so the demo is self-contained; the local guess() closure stands in for the network round-trip. The algorithm is identical either way: a correct solution never needs the pick, only the answers.",
    ],
    edges: [
      "n = 1 — one probe against a one-element range; the loop must handle l == r.",
      "Pick at either extreme (1 or n) — the pointers must be allowed to reach both walls.",
      "The sign convention itself: −1 = your probe is above the pick. Flip it and the search walks away from the answer while still terminating.",
      "Two-candidate ranges (l and r adjacent) — the floor mid tests the left element first; every branch must still shrink the interval.",
    ],
    ladder: [
      { title: "Linear probe 1, 2, 3…", body: "Ask every number in order. O(n) worst case — at n = 2^31 − 1 that's over two billion probes; the exercise exists to forbid exactly this." },
      { title: "Recursive halving", body: "Recurse on (lo, hi) with the same mid-probe logic. O(log n) time but O(log n) call stack — correct, just heavier than the loop." },
      { title: "The optimal idea — closed-interval binary search on the value range", body: "l, r = 1, n; probe the mid; route on the verdict: 0 → done, 1 → search right, −1 → search left. ⌈log₂ n⌉ ≤ 31 probes across the full constraint range." },
    ],
    approach: "Binary search on the answer range behind an interactive verdict API",
    code: `def guessNumber(n, pick):
    # on LeetCode, pick arrives via the guess() API; here it is a parameter
    # so the demo is self-contained
    def guess(x):
        if x == pick:
            return 0
        return -1 if x > pick else 1   # -1: x too high · 1: x too low

    l, r = 1, n                        # closed interval: the pick is in [l, r]
    while l <= r:
        m = (l + r) // 2
        v = guess(m)
        if v == 0:
            return m
        if v == 1:                     # m below the pick → search strictly right
            l = m + 1
        else:                          # m above the pick → search strictly left
            r = m - 1
    return -1                          # unreachable: 1 <= pick <= n is guaranteed`,
    walkthrough: [
      "The invariant is the plainest in this file: the pick lies inside the closed interval [l, r]. A verdict of 1 at m proves pick > m, so everything at or below m dies (l = m + 1); a verdict of −1 proves pick < m and everything at or above m dies (r = m − 1). Both updates exclude m itself because m was just probed and wasn't it.",
      "Sign mapping, written out once so it never needs re-deriving under pressure: the verdict describes YOUR probe — −1 ('your probe is above the pick') moves the right wall down, 1 ('your probe is below') moves the left wall up. Notice the flipped version terminates too, which is what makes this bug so quiet: no crash, just a confident walk away from the answer. Testing one pick above and one below the first mid catches it immediately.",
      "Trace n = 10, pick = 6: [1,10] → m = 5, verdict 1 → [6,10] → m = 8, verdict −1 → [6,7] → m = 6, verdict 0 → return 6. Three probes against six for a linear scan; at n = 2^31 − 1 the loop needs at most 31 — the complexity claim made concrete.",
    ],
    time: "O(log n) — the interval halves with every probe",
    space: "O(1)",
    followUps: [
      "First Bad Version: the same hidden-API shape with a boolean predicate — 'is this version bad' is monotone in the version number.",
      "Guess Number Higher or Lower II: despite the name, a different problem entirely — minimax worst-case cost over guess strategies, solved with interval DP.",
    ],
    related: ["binary-search", "first-bad-version", "guess-number-higher-or-lower-ii"],
    verify: {
      fn: "guessNumber",
      wrap: "plain",
      cases: [
        { args: [10, 6], expect: 6 },
        { args: [1, 1], expect: 1 },
        { args: [2, 1], expect: 1 },
        { args: [2, 2], expect: 2 },
        { args: [100, 25], expect: 25 },
        { args: [2147483647, 2147483646], expect: 2147483646 },
      ],
    },
    xp: 10,
  },
  {
    slug: "successful-pairs-of-spells-and-potions",
    statement:
      "Two strength arrays are given — spells and potions — plus a required potency success. Spell i and potion j form a successful pair when spells[i] · potions[j] ≥ success. For EACH spell, report how many potions pair with it, as a list aligned with the original spell order.",
    examples: [
      { input: "spells = [5,1,3], potions = [1,2,3,4,5], success = 7", output: "[4,0,3]", explanation: "5 pairs with 2,3,4,5 → 4; 1 pairs with nothing → 0; 3 pairs with 3,4,5 → 3." },
      { input: "spells = [3,1,2], potions = [8,5,8], success = 16", output: "[2,0,2]", explanation: "3·8 = 24 clears the bar (two eights) but 3·5 = 15 misses; 2·8 = 16 lands exactly on the threshold and counts." },
    ],
    constraints: ["1 <= spells.length, potions.length <= 10^5", "1 <= spells[i], potions[i] <= 10^9", "1 <= success <= 10^10", "near-O(n·m) approaches won't survive — count per spell"],
    breakdown: [
      "Algebra first, algorithms second: spell·potion ≥ success rearranges to potion ≥ ⌈success / spell⌉. Each spell's question is therefore a THRESHOLD COUNT over the potions — and 'how many elements of a sorted list are ≥ x' is one lower-bound search away, the exact machinery of search-insert-position. The integer ceiling (success + s − 1) // s keeps the division exact; success/s in floats is where boundary cases go to die at 10^10.",
      "The naive move — a double loop multiplying every pair — is O(n·m), ten billion products at full size. Dead on arrival, and it ignores the one free structural fact: sorting potions ONCE serves every spell's search, so the sort amortises across all n queries instead of being paid per query.",
      "The output must align with the ORIGINAL spell order, which is easy to fumble once anything is sorted — so sort only the potions and leave the spells where they are. The two-pointer alternative sorts spells too (descending, carrying their indices) and sweeps a single monotone pointer over the potions; same complexity family, more bookkeeping, zero per-spell searches.",
    ],
    edges: [
      "Products exactly AT the threshold count (≥, not >) — the ceiling division encodes this; a floor here silently drops boundary pairs.",
      "Threshold above every potion — the search returns m and the count is 0, no special case.",
      "Threshold at or below the smallest potion — the search returns 0 and every potion counts.",
      "Duplicate potion values — the lower bound lands on the leftmost qualifying index, which is all the suffix count needs.",
    ],
    ladder: [
      { title: "Brute force — double loop", body: "Multiply every spell-potion pair and count hits. O(n·m) ≈ 10^10 at the stated limits — the answer that gets written first and TLEs second." },
      { title: "Sort potions, search per spell", body: "One O(m log m) sort; each spell then lower-bounds its threshold ⌈success/s⌉ in log m. O((n + m) log m) — the intended shape." },
      { title: "The optimal idea — one sort, monotone pointer (or per-spell binary search)", body: "Sort potions ascending and spells descending with indices: thresholds only grow as spells weaken, so one pointer sweeps the potions once. O(n log n + m log m) total, no searches at all." },
    ],
    approach: "Sorted potions + per-spell lower-bound search",
    code: `def successfulPairs(spells, potions, success):
    potions.sort()                        # one sort, shared by every spell
    m = len(potions)
    pairs = []
    for s in spells:
        need = (success + s - 1) // s     # smallest working potion: ceil(success / s)
        l, r = 0, m                       # lower-bound search on [0, m)
        while l < r:
            mid = (l + r) // 2
            if potions[mid] < need:
                l = mid + 1
            else:
                r = mid
        pairs.append(m - l)               # potions[l:] all qualify → suffix length
    return pairs`,
    walkthrough: [
      "The threshold rewrite is the whole trick: s·p ≥ success ⇔ p ≥ ⌈success/s⌉, computed in pure integers as (success + s − 1) // s. For s = 3 and success = 16 the threshold is 6 — potion 5 fails (3·5 = 15), potion 8 succeeds (3·8 = 24). Floats survive many test cases and betray you exactly when the division isn't clean — the boundary is the very thing being tested.",
      "Per spell, the loop is search-insert-position verbatim: the first index with potions[i] ≥ need on the half-open range [0, m). The answer is then m − l — the suffix length — because sortedness guarantees everything from l onward qualifies and everything before it doesn't. One search, one subtraction, no per-element counting.",
      "Trace spells = [5,1,3] over sorted potions [1,2,3,4,5], success = 7: s = 5 → need = 2 → lower bound 1 → 4 pairs; s = 1 → need = 7 → lower bound 5 = m → 0 pairs; s = 3 → need = 3 → lower bound 2 → 3 pairs. Output [4,0,3] in the spells' original order — the sort never touched the spells.",
    ],
    time: "O((n + m) log m) — one potion sort, then a log m search per spell",
    space: "O(1) beyond the output list (the sort is in-place)",
    followUps: [
      "One potion list, many arbitrary queries: precompute the sort once; each query is a single bisect — this problem in disguise.",
      "The two-pointer sweep: sort spells descending with original indices and potions ascending; as thresholds grow the pointer only moves right — same asymptotics, zero searches.",
    ],
    related: ["search-insert-position", "binary-search", "find-k-closest-elements"],
    verify: {
      fn: "successfulPairs",
      wrap: "plain",
      cases: [
        { args: [[5, 1, 3], [1, 2, 3, 4, 5], 7], expect: [4, 0, 3] },
        { args: [[3, 1, 2], [8, 5, 8], 16], expect: [2, 0, 2] },
        { args: [[5], [4], 25], expect: [0] },
        { args: [[5], [5], 25], expect: [1] },
        { args: [[1, 2], [1, 2, 3], 10000000000], expect: [0, 0] },
        { args: [[10, 20], [10, 20], 200], expect: [1, 2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-peak-element",
    statement:
      "In an array whose adjacent values always differ (nums[i] ≠ nums[i+1]), a PEAK is an element strictly greater than both neighbours — with the virtual elements nums[−1] and nums[n] counted as −∞. Return the index of any one peak; O(log n) is required.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "2", explanation: "3 > 2 and 3 > 1." },
      { input: "nums = [1,2,1,3,5,6,4]", output: "5", explanation: "6 > 5 and 6 > 4. Index 1 (the value 2) is an equally valid peak — any one is accepted." },
    ],
    constraints: ["1 <= nums.length <= 1000", "nums[i] ≠ nums[i+1] for every adjacent pair", "any valid peak index is accepted", "O(log n) required"],
    breakdown: [
      "First an existence fact worth proving to yourself: with −∞ at both boundaries a peak ALWAYS exists. Start anywhere and walk in the direction of increase; the walk either stops at an element whose next step descends (a peak) or runs into the −∞ wall (also a peak). The freedom being granted — 'any' peak, not 'the maximum' — is exactly what makes O(log n) possible.",
      "The probe is a SLOPE test: nums[m] against nums[m+1]. Ascending slope (nums[m] < nums[m+1]) and the walk-from-m+1 argument guarantees a peak strictly right of m — so l = m + 1 discards a half with a proof, not a heuristic. Descending step (nums[m] > nums[m+1]; equality is banned) means the drop has started and m itself is still a viable peak — r = m keeps it. Adjacent-distinctness is what makes the two cases exhaustive and decisive.",
      "Two missteps to name. The global maximum: O(n), and although it IS a peak, it dodges the actual lesson — that local slope information suffices to route a search. And comparing nums[m] with BOTH neighbours: that drags m − 1 and m + 1 bounds checks into the loop, when the l < r formulation with a single nums[m+1] comparison makes every access provably safe by construction.",
    ],
    edges: [
      "Single element — −∞ on both sides makes it a peak; the loop never runs and 0 falls out.",
      "Monotonic increasing array → the LAST index; monotonic decreasing → the FIRST. Both extremes must emerge from the slope logic, not from special cases.",
      "Multiple peaks — any valid index is accepted; a fixed implementation deterministically returns one of them.",
      "nums[m+1] out of bounds — impossible by construction: while l < r forces m < r, so the access is always in range.",
    ],
    ladder: [
      { title: "Linear scan with neighbour checks", body: "Test every element against both neighbours, handling the edges. O(n) — correct, and precisely what the O(log n) demand forbids." },
      { title: "Return the global maximum's index", body: "max(nums) is O(n) too, and it answers a stronger question than asked. The existence proof shows why halving is legitimate; max() sidesteps the reasoning the interviewer wants to hear." },
      { title: "The optimal idea — binary search on the slope", body: "while l < r: nums[m] < nums[m+1] → l = m + 1, else r = m. The interval collapses onto a peak. O(log n), two decision lines." },
    ],
    approach: "Slope-direction binary search",
    code: `def findPeakElement(nums):
    l, r = 0, len(nums) - 1
    while l < r:                    # interval still holds >= 2 candidates
        m = (l + r) // 2
        if nums[m] < nums[m + 1]:   # ascending slope → a peak lies strictly right
            l = m + 1
        else:                       # descending step → m itself stays a candidate
            r = m
    return l                        # interval collapsed onto a peak`,
    walkthrough: [
      "The invariant carries the proof: a peak exists inside [l, r] — true initially by the existence argument. If the slope at m ascends, walking right from m + 1 either keeps climbing to a peak or drops after rising; either way a peak sits in [m+1, r], so discarding everything ≤ m is safe. If the slope descends, the mirrored walk from m leftward guarantees a peak in [l, m] — m included, hence r = m.",
      "The boundary math deserves explicit trust: the guard l < r implies m = (l+r)//2 < r, so nums[m+1] is always a legal access — no clamping, no sentinels. And because the descending branch keeps m (r = m, never m − 1), the interval collapses to exactly one index rather than emptying; when l == r, that index IS the peak.",
      "Trace [1,2,1,3,5,6,4]: [0,6] → m = 3, 3 < 5 → [4,6] → m = 5, 6 > 4 → [4,5] → m = 4, 5 < 6 → [5,5] → return 5. The other peak at index 1 is equally correct — this deterministic search simply commits to the right-hand one, which is why tests should assert a VALID index rather than a unique one; the grader accepts any peak.",
    ],
    time: "O(log n) — the candidate interval halves every step",
    space: "O(1)",
    followUps: [
      "Peak Index in a Mountain Array: the strictly increasing-then-decreasing special case — the same loop with a stronger guarantee and a unique peak.",
      "Find a Peak Element II (2-D grid): compare mid-column values and recurse toward the larger neighbour — the 1-D existence argument lifts to rows.",
    ],
    related: ["peak-index-in-a-mountain-array", "binary-search", "find-minimum-in-rotated-sorted-array"],
    verify: {
      fn: "findPeakElement",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 1]], expect: 2 },
        { args: [[1, 2, 1, 3, 5, 6, 4]], expect: 5 },
        { args: [[1]], expect: 0 },
        { args: [[1, 2]], expect: 1 },
        { args: [[1, 2, 3, 4, 5]], expect: 4 },
        { args: [[5, 4, 3, 2, 1]], expect: 0 },
      ],
    },
    xp: 20,
  },
];
