// Deep-dives — Arrays & Hashing, part 2 (the NC150-extras + TI150 uniques).
// Statements are original paraphrases; examples/constraints written fresh;
// solutions verified by scripts/lc-verify. Wrap conventions match
// js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const ARRAYS_2: LcDeepDive[] = [
  {
    slug: "merge-sorted-array",
    statement:
      "You are given two sorted integer arrays. nums1 has room for both: its first m entries are the real data and its trailing zeros are empty seats sized exactly for nums2's n entries. Merge nums2 into nums1 so the whole array is sorted, in place — the answer must end up inside nums1 itself.",
    examples: [
      { input: "nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3", output: "[1,2,2,3,5,6]", explanation: "The three real values of nums1 interleave with nums2's three." },
      { input: "nums1 = [1], m = 1, nums2 = [], n = 0", output: "[1]", explanation: "Nothing to merge." },
      { input: "nums1 = [0], m = 0, nums2 = [1], n = 1", output: "[1]", explanation: "nums1 has zero real values; the whole answer comes from nums2." },
    ],
    constraints: ["nums1.length == m + n, nums2.length == n", "0 <= m, n <= 200", "both arrays are sorted non-decreasing"],
    breakdown: [
      "The tempting move is the classic merge from merge-sort: two pointers at the front, repeatedly copy the smaller head into the output. But the output IS one of the inputs — writing at the front would stomp values of nums1 you have not looked at yet. That's the trap this problem is built around.",
      "The fix is to run the merge backwards. The largest elements belong at the end of nums1, and the end of nums1 is exactly where the empty seats are. Compare the largest surviving values of both arrays (at positions m-1 and n-1) and drop the bigger one into position m+n-1. Every write lands in space that is either empty or already consumed.",
      "Why does nothing get overwritten? After k writes, the write pointer sits at m+n-k while the nums1 read pointer sits at m-k' — the write pointer always stays at or ahead of the values still being read, because each write consumes one empty seat first. The suffix of nums1 is always either filled output or exhausted data.",
    ],
    edges: [
      "m = 0: the answer is a copy of nums2 — the loop must not skip this by assuming nums1 has data.",
      "nums2 exhausted first (n runs out): the remaining nums1 prefix is already sorted and already in place — stop.",
      "nums1 exhausted first: remaining nums2 values are the smallest, so they must be copied to the FRONT slots one by one.",
      "All of nums2 larger than all of nums1: no overwrites needed, but the algorithm must still walk every position.",
    ],
    ladder: [
      { title: "Brute force — concat and sort", body: "Write nums2 into the empty seats, sort the whole array. O((m+n) log(m+n)) time. It works and is a legitimate one-liner, but it ignores the sortedness you were handed — an interviewer will push for the merge." },
      { title: "Forward merge into a buffer", body: "Copy nums1's real data to a scratch array, run the textbook forward merge back into nums1. O(m+n) time but O(m) extra space — correct, yet you allocated memory you did not need." },
      { title: "The optimal idea — merge from the back", body: "Three pointers: i at m-1 (last real nums1 value), j at n-1 (last nums2 value), w at m+n-1 (next write slot). Each step, move the larger of nums1[i], nums2[j] into nums1[w] and decrement its pointer. If j drops below 0 first, you are done; if i drops below 0, copy the rest of nums2." },
    ],
    approach: "Backward three-pointer merge (O(1) extra space)",
    code: `def merge(nums1, m, nums2, n):
    i, j, w = m - 1, n - 1, m + n - 1   # read nums1, read nums2, write nums1
    while j >= 0:                       # while nums2 still has values to place
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[w] = nums1[i]         # nums1's value is bigger → send it back
            i -= 1
        else:
            nums1[w] = nums2[j]         # nums2's value belongs here (or ties)
            j -= 1
        w -= 1
    # if i >= 0 the leftover nums1 prefix is already sorted and in place`,
    walkthrough: [
      "The loop condition is `j >= 0`, not `w >= 0` — that single choice encodes the key insight: once nums2 is exhausted, everything left in nums1 is already sorted and already sitting in the correct positions. There is literally nothing left to do.",
      "Ties go to nums2 (`else` branch takes nums2[j] on equality). With `i >= 0` checked first, an exhausted nums1 quietly hands the rest of the work to nums2 — the two guard conditions compose into a loop with no special cases at the bottom.",
      "Trace [1,2,3,0,0,0] and [2,5,6]: compare 3 vs 6 → write 6; 3 vs 5 → write 5; 3 vs 2 → write 3; 2 vs 2 → write 2 (from nums2); 1 vs 2 → write 2; nums2 exhausted. The array reads [1,2,2,3,5,6] — every write landed in a seat that was empty or already evacuated.",
    ],
    time: "O(m + n) — each value is written exactly once",
    space: "O(1) — three index variables, merging happens inside nums1",
    followUps: [
      "Suppose nums1 had exactly enough room but the arrays were linked lists — would backward merging still work? No: lists can't index from the back cheaply, so you'd forward-merge with a dummy head instead.",
      "What if instead of trailing zeros the empty seats were interleaved? Then no in-place trick saves you — you'd need the O(m) buffer or a full sort.",
    ],
    related: ["merge-two-sorted-lists", "remove-element", "sort-colors"],
    verify: {
      fn: "merge",
      wrap: "inPlaceArgs",
      cases: [
        { args: [[1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3], expect: [1, 2, 2, 3, 5, 6] },
        { args: [[1], 1, [], 0], expect: [1] },
        { args: [[0], 0, [1], 1], expect: [1] },
        { args: [[4, 5, 6, 0, 0, 0], 3, [1, 2, 3], 3], expect: [1, 2, 3, 4, 5, 6] },
        { args: [[2, 0], 1, [1], 1], expect: [1, 2] },
      ],
    },
    xp: 10,
  },
  {
    slug: "remove-element",
    statement:
      "Given an integer array and a value, remove every occurrence of that value in place and return how many elements remain (k). The first k slots of the array must end up holding exactly the kept elements — their order may change, and what sits after index k-1 does not matter.",
    examples: [
      { input: "nums = [3,2,2,3], val = 3", output: "2, nums = [2,2,_,_]", explanation: "The length returned is 2 and the first two slots hold 2,2." },
      { input: "nums = [0,1,2,2,3,0,4,2], val = 2", output: "5, nums = [0,1,3,0,4,_,_,_]", explanation: "Five elements are not 2; their order may shuffle." },
    ],
    constraints: ["0 <= nums.length <= 100", "0 <= nums[i] <= 50", "0 <= val <= 100"],
    breakdown: [
      "Deletion from an array is expensive — every real removal shifts everything after it left by one. If you literally delete as you scan, an array of all-vals costs O(n²). The judges only inspect the first k slots, so the smart move is to think of this as partitioning, not deleting.",
      "Two pointer families solve this. The 'stable writer' keeps every non-val element in original order: one pointer reads every element, one writes only the keepers. The 'swap-out' version swaps each occurrence of val with the last unprocessed element, shrinking from both ends — fewer writes, but the order of keepers is no longer preserved. Either satisfies the grader; the writer is the one to reach for first.",
    ],
    edges: [
      "Empty array → return 0 with no writes.",
      "No occurrence of val → k equals the array length; every element is a keeper.",
      "All elements equal val → k is 0; the write pointer never advances.",
      "The array length never changes — only the returned k defines what counts.",
    ],
    ladder: [
      { title: "Brute force — delete as you go", body: "Scan and call remove on each hit. Each remove is O(n) because it shifts the tail, so an adversarial input is O(n²). Correct, but you're paying for shifts the grader never checks." },
      { title: "Copy into a second array", body: "Append keepers to a fresh list, copy back. O(n) time, O(n) space — fine, but the extra memory is pure waste when writes can land in the array itself." },
      { title: "The optimal idea — read/write split", body: "One pass, two indices: r reads every element, w marks where the next keeper lands. When nums[r] != val, copy it to nums[w] and advance w. The array compacts itself in place; k is simply where w ended." },
    ],
    approach: "Single-pass read/write pointers (stable partition)",
    code: `def removeElement(nums, val):
    w = 0                            # next slot to write a keeper
    for r in range(len(nums)):       # r reads everything
        if nums[r] != val:
            nums[w] = nums[r]        # keeper lands in the compacted prefix
            w += 1
    return w                         # first w slots are exactly the keepers`,
    walkthrough: [
      "Invariant: after processing r elements, nums[0:w] holds all keepers among them, in order. The write pointer only moves when a keeper is found, so it counts them for free — the return value is the final w.",
      "When r == w (no gaps yet) the self-assignment nums[w] = nums[r] is harmless. That's why no special case is needed for a val-free array: the copy degenerates into writing each element onto itself.",
      "The swap-out variant (swap hit with tail, shrink the tail) does at most one write per hit instead of one per keeper — better when val dominates the array, worse when order must survive. Worth mentioning both in an interview and choosing deliberately.",
    ],
    time: "O(n) — one pass, each element read once",
    space: "O(1) — two indices, compaction happens in place",
    followUps: [
      "What if order must be preserved AND val is rare? The swap-out variant does fewer writes — pick per input distribution.",
      "How would you extend this to 'remove by predicate' for objects? Same skeleton — the condition is the only thing that changes.",
    ],
    related: ["remove-duplicates-from-sorted-array", "move-zeroes", "merge-sorted-array"],
    verify: {
      fn: "removeElement",
      wrap: "inPlaceKArgs",
      cases: [
        { args: [[3, 2, 2, 3], 3], expect: [2, [2, 2]] },
        { args: [[0, 1, 2, 2, 3, 0, 4, 2], 2], expect: [5, [0, 1, 3, 0, 4]] },
        { args: [[], 0], expect: [0, []] },
        { args: [[1, 1, 1], 1], expect: [0, []] },
        { args: [[4, 5], 6], expect: [2, [4, 5]] },
      ],
    },
    xp: 10,
  },
  {
    slug: "remove-duplicates-from-sorted-array",
    statement:
      "Given a sorted integer array, remove the duplicates in place so each value appears exactly once, and return the count of unique values (k). The first k slots must hold the unique values in their original sorted order; the junk left beyond them is ignored.",
    examples: [
      { input: "nums = [1,1,2]", output: "2, nums = [1,2,_]", explanation: "Both unique values compact to the front." },
      { input: "nums = [0,0,1,1,1,2,2,3,3,4]", output: "5, nums = [0,1,2,3,4,_,_,_,_,_]" },
    ],
    constraints: ["1 <= nums.length <= 3·10^4", "-100 <= nums[i] <= 100", "nums is sorted non-decreasing"],
    breakdown: [
      "Sortedness is the entire problem. In an unsorted array, spotting duplicates needs a hash set; in a sorted one, duplicates are adjacent, so all the information you need is a comparison with the previous kept value. No extra memory is required at all.",
      "Like remove-element, this is a compaction: a read pointer walks everything, a write pointer marks where the next survivor lands. The only new decision is the survivor test — 'is this value different from the last value I kept?' — which is a one-line comparison against nums[w-1].",
      "A subtle misstep: comparing against nums[r-1] (the raw previous element) instead of nums[w-1] (the last kept element). With runs longer than two, comparing to the raw predecessor still sees duplicates of duplicates — it happens to work here because equality is transitive, but the kept-pointer comparison is the one that generalizes (see the 'keep at most 2' follow-up).",
    ],
    edges: [
      "Single element → k = 1, no writes.",
      "All elements identical → k = 1.",
      "No duplicates at all → k = length; every write is a self-assignment.",
      "Negative values are irrelevant — comparison logic is value-agnostic.",
    ],
    ladder: [
      { title: "Brute force — rebuild without duplicates", body: "Push values into a set, then write the set's (sorted) contents back. O(n) time but O(n) space, and sorting again leans on a property the array already had." },
      { title: "Delete duplicates as you scan", body: "When nums[r] == nums[r-1], delete nums[r]. Each deletion shifts the tail — O(n²) on an all-equal array. The sorted structure is wasted on shift mechanics." },
      { title: "The optimal idea — compact with a slow pointer", body: "w is the boundary of the deduplicated prefix. Read r ahead of it; whenever nums[r] != nums[w-1], the value is new to the prefix: write it at nums[w] and advance. One pass, zero extra space." },
    ],
    approach: "Slow/fast compaction against the last kept value",
    code: `def removeDuplicates(nums):
    w = 1                                # nums[0] always survives
    for r in range(1, len(nums)):
        if nums[r] != nums[w - 1]:       # new value vs last KEPT value
            nums[w] = nums[r]
            w += 1
    return w`,
    walkthrough: [
      "The invariant: nums[0:w] is the deduplicated prefix, so nums[w-1] is the most recent unique value. A read value equal to it is a repeat by definition of sortedness; anything else is genuinely new.",
      "Starting w at 1 bakes in the fact that the first element always survives — no empty-prefix special case. For [0,0,1,1,1,2,2,3,3,4], writes happen at values 0,1,2,3,4 and w finishes at 5.",
      "This skeleton upgrades trivially to 'keep at most k copies' by changing the test to nums[r] != nums[w-k] — a one-character generalization interviewers love to ask next.",
    ],
    time: "O(n) — single pass",
    space: "O(1) — two indices",
    followUps: [
      "Keep at most two of each value: the test becomes nums[r] != nums[w-2] (see remove-duplicates-from-sorted-array-ii).",
      "What if the array were NOT sorted? Then adjacency dies and you need a hash set (or sort first, paying O(n log n)).",
    ],
    related: ["remove-duplicates-from-sorted-array-ii", "remove-element", "contains-duplicate"],
    verify: {
      fn: "removeDuplicates",
      wrap: "inPlaceK",
      cases: [
        { args: [[1, 1, 2]], expect: [2, [1, 2]] },
        { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expect: [5, [0, 1, 2, 3, 4]] },
        { args: [[7]], expect: [1, [7]] },
        { args: [[5, 5, 5, 5]], expect: [1, [5]] },
        { args: [[-3, -3, 0, 2, 2]], expect: [3, [-3, 0, 2]] },
      ],
    },
    xp: 10,
  },
  {
    slug: "majority-element",
    statement:
      "Find the element that appears more than half the time in an array of n integers. The majority element is guaranteed to exist, so you always return something concrete — never -1, never None.",
    examples: [
      { input: "nums = [3,2,3]", output: "3" },
      { input: "nums = [2,2,1,1,1,2,2]", output: "2", explanation: "2 appears 4 times out of 7 — more than half." },
    ],
    constraints: ["n == nums.length, 1 <= n <= 5·10^4", "-10^9 <= nums[i] <= 10^9", "the majority element always exists"],
    breakdown: [
      "The guarantee 'more than n/2 occurrences' is doing enormous work. It means a counting approach can't just find the most frequent value — it can find THE value, and smarter still, there is a voting scheme that needs no counter map at all.",
      "The naive-but-fine answer is a hash map of counts: O(n) time, O(n) space. Sorting and taking the middle element also works — a majority element must occupy the median position — at O(n log n) with O(1) space if sorting in place. Both are worth saying out loud before the real answer.",
      "Boyer–Moore voting is the interview-winning idea: keep a candidate and a live counter. Same value → increment; different → decrement; counter hits zero → adopt the next value as candidate. Pairs of different values cancel, and the majority survives all cancellations because it outnumbers every other value combined.",
    ],
    edges: [
      "Single element array → that element, trivially.",
      "The guarantee means no post-check is needed — in the general 'maybe no majority' version you must re-count the candidate at the end.",
      "Negative and huge values: the algorithm only compares equality, so value ranges never matter.",
    ],
    ladder: [
      { title: "Brute force — count each value", body: "For every element, scan and count. O(n²) — the honest baseline that motivates everything else." },
      { title: "Hash map / sort", body: "Counter map: O(n) time, O(n) space. Sort + median: O(n log n), O(1) space. Both correct; both give something up." },
      { title: "The optimal idea — Boyer–Moore voting", body: "A candidate and a weight. Matching elements add weight, all others subtract. Different values cancel pairwise, so after full cancellation rounds the survivor is the value with a positive surplus — which, given the > n/2 guarantee, must be the majority. O(n) time, O(1) space, one pass." },
    ],
    approach: "Boyer–Moore majority vote",
    code: `def majorityElement(nums):
    candidate = None
    count = 0
    for x in nums:
        if count == 0:
            candidate = x        # adopt a new standard-bearer
        if x == candidate:
            count += 1           # vote for
        else:
            count -= 1           # vote against — cancels one earlier vote
    return candidate`,
    walkthrough: [
      "Think of every occurrence of the true majority as +1 and everything else as −1. The running sum over the whole array is positive, so no matter how the cancellations interleave, the count can never end below 1 — and the candidate standing when the dust settles is the majority.",
      "Why does a zero-count reset not break anything? Zero means the prefix seen so far cancelled exactly — its 'local majority' (if any) can't be the global majority without the rest of the array also agreeing. Discarding the prefix and restarting is safe; this is the lemma that makes Boyer–Moore correct.",
      "Trace [2,2,1,1,1,2,2]: candidate 2 (count 1,2) → 1 cancels to 1 → 1 cancels to 0 → adopt 1 (count 1) → 2 cancels to 0 → adopt 2 (count 1). Final candidate 2 — correct, in one pass with two variables.",
    ],
    time: "O(n) — single pass, constant work per element",
    space: "O(1) — one candidate and one counter",
    followUps: [
      "If a majority might not exist, re-scan and count the candidate — O(n) extra pass, still O(1) space.",
      "Majority appearing more than n/3 times: two candidates, two counters (see majority-element-ii).",
    ],
    related: ["majority-element-ii", "top-k-frequent-elements", "contains-duplicate"],
    verify: {
      fn: "majorityElement",
      wrap: "plain",
      cases: [
        { args: [[3, 2, 3]], expect: 3 },
        { args: [[2, 2, 1, 1, 1, 2, 2]], expect: 2 },
        { args: [[1]], expect: 1 },
        { args: [[9, 9, 9, 1]], expect: 9 },
        { args: [[-1, -1, 2, -1]], expect: -1 },
      ],
    },
    xp: 10,
  },
  {
    slug: "rotate-array",
    statement:
      "Rotate an array to the right by k steps, in place. After rotating, each element moves k positions to the right, with the last k elements wrapping around to the front. k may exceed the array length — it wraps.",
    examples: [
      { input: "nums = [1,2,3,4,5,6,7], k = 3", output: "[5,6,7,1,2,3,4]", explanation: "The last three elements wrap to the front." },
      { input: "nums = [-1,-100,3,99], k = 2", output: "[3,99,-1,-100]" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "0 <= k <= 10^5", "in place, O(1) extra space requested"],
    breakdown: [
      "Rotate right by k means: the last k elements come to the front, everything else shifts right. The first instinct — shift one step, k times — is O(n·k): fatal at n = 10^5 with k equally large.",
      "The famous trick is the triple reversal. Reverse the whole array; reverse the first k; reverse the rest. [1,2,3,4,5,6,7] → [7,6,5,4,3,2,1] → [5,6,7,4,3,2,1] → [5,6,7,1,2,3,4]. Each element is touched a constant number of times, no extra memory, and the code is three lines.",
      "The other O(n)/O(1)-ish approach is cyclic replacement: follow the permutation i → (i+k) mod n through its cycles. It works but the cycle-counting arithmetic (gcd dance) is easy to fumble under pressure — the triple reversal is the version to write on a whiteboard.",
      "Don't forget k %= n. Rotating an array of length 7 by 10 is rotating by 3; skipping the modulus both wastes time and breaks the reversal split.",
    ],
    edges: [
      "k larger than n → k %= n first.",
      "k == 0 or k == n → the array is unchanged; the code should no-op cleanly.",
      "Single element → nothing happens regardless of k.",
    ],
    ladder: [
      { title: "Brute force — rotate one step, k times", body: "Each step saves the last element and shifts everything right by one: O(k·n). At the constraint maximum that's 10^10 moves — completely dead on arrival." },
      { title: "Extra array", body: "Write each element to (i + k) % n of a fresh array, copy back. O(n) time, O(n) space — the 'too much memory' answer the in-place requirement exists to forbid." },
      { title: "The optimal idea — reverse, reverse, reverse", body: "Reverse all n elements, then reverse the first k and the remaining n−k separately. Reversals are in-place swaps; three of them compose into the exact rotation with O(n) total swaps and O(1) space." },
    ],
    approach: "Triple reversal",
    code: `def rotate(nums, k):
    n = len(nums)
    k %= n                      # wrap oversized k
    def rev(l, r):              # inclusive in-place reversal
        while l < r:
            nums[l], nums[r] = nums[r], nums[l]
            l += 1; r -= 1
    rev(0, n - 1)               # whole array
    rev(0, k - 1)               # first k (the wrapped tail, now at front)
    rev(k, n - 1)               # remainder`,
    walkthrough: [
      "Why reversal composes into rotation: reversing the whole array puts the wrapped block at the front but internally backwards; reversing each block individually fixes the internal order without moving the blocks. Two wrongs make a right, deliberately.",
      "k %= n does double duty: correctness for k > n AND an early shortcut (k == 0 leaves every rev a no-op). For n = 1 the first rev is a single-element swap — harmless.",
      "Trace [1,2,3,4,5,6,7], k=3: reverse all → [7,6,5,4,3,2,1]; reverse [0..2] → [5,6,7,4,3,2,1]; reverse [3..6] → [5,6,7,1,2,3,4]. Exactly the expected output, three linear passes.",
    ],
    time: "O(n) — each element swapped at most twice",
    space: "O(1) — swaps happen in place",
    followUps: [
      "Rotate LEFT by k: same trick with the split points mirrored (reverse first n−k, then the rest, then all).",
      "What's the minimum number of element moves (not swaps)? Cyclic replacement achieves exactly n moves — worth mentioning if the interviewer counts memory writes.",
    ],
    related: ["merge-sorted-array", "next-permutation", "rotate-list"],
    verify: {
      fn: "rotate",
      wrap: "inPlaceArgs",
      cases: [
        { args: [[1, 2, 3, 4, 5, 6, 7], 3], expect: [5, 6, 7, 1, 2, 3, 4] },
        { args: [[-1, -100, 3, 99], 2], expect: [3, 99, -1, -100] },
        { args: [[1, 2], 5], expect: [2, 1] },
        { args: [[1], 0], expect: [1] },
        { args: [[1, 2, 3], 3], expect: [1, 2, 3] },
      ],
    },
    xp: 20,
  },
  {
    slug: "h-index",
    statement:
      "A researcher's h-index is the largest number h such that at least h of their papers have each been cited at least h times. Given the citation counts of every paper, compute the h-index.",
    examples: [
      { input: "citations = [3,0,6,1,5]", output: "3", explanation: "Three papers (3, 6, 5) have at least 3 citations each; no h above 3 works because only two papers reach 4." },
      { input: "citations = [1,3,1]", output: "1", explanation: "All three papers clear 1 citation, but only one clears 2." },
      { input: "citations = [4,4,4,4]", output: "4", explanation: "Every paper clears the bar of 4 — the h-index can equal the paper count." },
    ],
    constraints: ["1 <= citations.length <= 5000", "0 <= citations[i] <= 1000"],
    breakdown: [
      "Strip away the biography and this is a threshold problem. Define f(h) = the number of papers with at least h citations. f is non-increasing — raising the bar can only shrink the qualifying set — and the h-index is simply the largest h where f(h) >= h. The naive move is to evaluate f by scanning the whole array for every candidate h: correct, but O(n²).",
      "Sorting the citations in descending order gives the classic O(n log n) answer: walk down the list and the h-index is the largest i + 1 with citations[i] >= i + 1 — the first position where the i-th best paper fails to clear rank i + 1 stops you. It is a perfectly respectable answer, and saying it out loud earns the chance to do better.",
      "The O(n) insight is that h can never exceed n — you cannot have more qualifying papers than papers. So any citation count above n behaves exactly like a count of n for threshold purposes, and the counts collapse into n + 1 buckets. One bucket per possible count, plus one suffix sweep, evaluates f(h) for every h in a single linear pass.",
    ],
    edges: [
      "All zeros → the h-index is 0; the sweep falls all the way through to h = 0.",
      "Citation counts larger than n: they must be capped into bucket n, not dropped.",
      "h = n is achievable when every paper clears the bar — the bucket sweep starts there, so it is found immediately.",
      "A single paper: h = 1 if it has at least one citation, else 0.",
    ],
    ladder: [
      { title: "Brute force — test every h with a scan", body: "For each candidate h from n down to 1, count the papers with at least h citations and stop at the first success. O(n²) — fine at n = 10, 25 million comparisons at the constraint maximum." },
      { title: "Sort descending and walk", body: "After sorting, the answer is the largest i + 1 with citations[i] >= i + 1. O(n log n), no extra memory — the standard interview middle answer." },
      { title: "The optimal idea — counting buckets with a suffix sweep", body: "Bucket i counts papers with exactly min(c, n) citations. Sweep h from n down to 0, accumulating a running total of papers with at least h citations; the first h where the total >= h is the answer. O(n) time, O(n) space, no sort." },
    ],
    approach: "Counting buckets + suffix sweep",
    code: `def hIndex(citations):
    n = len(citations)
    buckets = [0] * (n + 1)         # bucket i = papers with exactly i citations
    for c in citations:
        buckets[min(c, n)] += 1     # counts above n act like n for the h-index
    total = 0                       # papers with at least h citations
    for h in range(n, -1, -1):
        total += buckets[h]         # extend the suffix sum down to this h
        if total >= h:              # h papers each cited h+ times
            return h`,
    walkthrough: [
      "The cap min(c, n) is the load-bearing trick. Since the h-index cannot exceed the number of papers, a paper with 500 citations in a 5-paper list is indistinguishable, for every threshold h <= 5, from a paper with exactly 5. Capping keeps the bucket array at n + 1 slots no matter how extreme the counts are.",
      "The sweep invariant: after bucket h has been added, total holds f(h) — the number of papers with at least h citations. As h decreases, h shrinks while total only grows, so once the condition total >= h becomes true it stays true; returning at the first hit therefore returns the LARGEST qualifying h, which is exactly the definition of the index.",
      "Trace [3,0,6,1,5]: buckets are [1,1,0,1,0,2]. h = 5: total 2 < 5. h = 4: total 2 < 4. h = 3: total 3 >= 3 → return 3. Note how the capped 6 rode in bucket 5 and was properly accounted for by every threshold it could help.",
    ],
    time: "O(n) — one pass to bucket, one sweep over n + 1 buckets",
    space: "O(n) — the bucket array",
    followUps: [
      "The citations arrive pre-sorted (h-index-ii): binary search the boundary directly in O(log n) — the buckets become unnecessary.",
      "Papers keep arriving: each new citation is an O(1) bucket increment; re-run the linear sweep when the h-index is actually queried.",
    ],
    related: ["h-index-ii", "kth-largest-element-in-an-array", "sort-colors"],
    verify: {
      fn: "hIndex",
      wrap: "plain",
      cases: [
        { args: [[3, 0, 6, 1, 5]], expect: 3 },
        { args: [[1, 3, 1]], expect: 1 },
        { args: [[0]], expect: 0 },
        { args: [[100]], expect: 1 },
        { args: [[4, 4, 4, 4]], expect: 4 },
        { args: [[0, 0, 0]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "insert-delete-getrandom-o1",
    statement:
      "Design a set that supports three operations, each in average O(1): insert adds a value and reports whether it was actually added (false if it was already present), remove deletes a value and reports whether it existed, and getRandom returns a value chosen uniformly at random from the current contents. getRandom is only ever called while the set is non-empty.",
    examples: [
      { input: '["RandomizedSet","insert","remove","insert","getRandom","remove","insert","getRandom"] with arguments [[],[1],[2],[2],[],[1],[2],[]]', output: "true, false, true, 2, true, false, 2", explanation: "After the first three calls the set holds {1,2}, so the first getRandom may return either; after the removals only 2 remains, so it must return 2." },
      { input: "insert(4), insert(4)", output: "true, false", explanation: "The second insert is rejected — duplicates never change the contents." },
    ],
    constraints: ["-2^31 <= val <= 2^31 - 1", "at most 2·10^4 calls in total", "getRandom is called only when at least one element is present"],
    breakdown: [
      "Each operation is easy ALONE; the trap is that they fight each other. A hash set does insert and remove in O(1) but cannot sample uniformly at random in O(1) — sets are not indexable, so 'pick a random element' means materialising a list first, O(n) per call. A dynamic array is perfect for random sampling but needs O(n) to FIND a value before deleting it. The problem is engineered so that no single ordinary structure passes all three.",
      "The winning move is to carry both structures at once: an array holding the live values (order deliberately meaningless) plus a dict mapping each value to its index in that array. Membership and lookups go through the dict in O(1); sampling indexes the array at a random position in O(1); insert appends to both in lockstep.",
      "That leaves removal — the one operation that is naturally O(n) on an array, because deleting from the middle shifts everything after it. The fix is the swap-with-last pop: overwrite the doomed slot with the final element, pop the tail, and patch the moved value's index in the dict. Only ONE existing entry changes address, and you know exactly which. This is the same move that gives binary heaps their O(1) delete-by-index.",
    ],
    edges: [
      "Removing the value that IS the last element: the swap degenerates into writing the value onto itself, then popping it — the code must survive this without a special case.",
      "insert on a duplicate returns false and changes nothing; remove on an absent value returns false and changes nothing.",
      "getRandom on a single-element set deterministically returns that element — the only time its output is predictable.",
      "Values span the full 32-bit range including negatives — dict keys shrug at that; a counting array would not.",
    ],
    ladder: [
      { title: "Brute force — one plain list", body: "insert scans for membership (O(n)), remove scans then shifts (O(n)), getRandom is trivial. Two of the three operations violate the contract the problem is named after." },
      { title: "Hash set only", body: "insert and remove hit O(1) average, but uniform sampling needs a random INDEX into storage — a set offers none, so every getRandom pays O(n) to build a list. Fails the headline requirement." },
      { title: "The optimal idea — dict-indexed array with swap-with-last deletion", body: "Array for sampling, dict (value → index) for membership and addressing. insert appends and records; remove swaps the victim with the tail, pops, and patches the moved entry; getRandom picks a random slot. Every operation lands at O(1) average." },
    ],
    approach: "Dict-indexed dynamic array with swap-with-last deletion",
    code: `import random

class RandomizedSet:
    def __init__(self):
        self.vals = []          # live values — order is deliberately meaningless
        self.pos = {}           # value → its index in vals

    def insert(self, val):
        if val in self.pos:     # O(1) membership — this is why the dict exists
            return False
        self.pos[val] = len(self.vals)
        self.vals.append(val)   # append keeps dict and array in lockstep
        return True

    def remove(self, val):
        if val not in self.pos:
            return False
        i, last = self.pos[val], self.vals[-1]
        self.vals[i] = last     # fill the hole with the final element
        self.pos[last] = i      # the moved value's address changed — patch it
        self.vals.pop()         # the tail is now redundant — drop it
        del self.pos[val]
        return True

    def getRandom(self):
        return random.choice(self.vals)   # uniform: every live slot equally likely`,
    walkthrough: [
      "insert is two constant-time writes: the dict entry records the index the value is ABOUT to occupy (len(self.vals) before the append), then the append makes it true. Rejected inserts touch nothing — the membership check is both the guard and the return value.",
      "remove is the heart of the design. The victim's slot would leave a hole, and arrays cannot close holes cheaply — so the hole is filled with the last element instead. After vals[i] = last and pos[last] = i, exactly one surviving value has moved, and its dict entry is patched in the same breath; the tail pop and the dict deletion retire the victim. When the victim IS the last element, every step degenerates harmlessly: the self-assignment is a no-op and the pop removes it directly.",
      "getRandom needs no machinery of its own: vals contains exactly the live values (swap-with-last physically evicts the dead), so a uniformly random index into it is a uniformly random live value. Nothing about the array's arbitrary order matters — uniformity only needs the multiset of contents to be right. Worth saying in an interview: the bool returns from insert/remove are the observable contract, while getRandom's fairness is a property of the structure, not something a fixed test can pin down.",
    ],
    time: "O(1) average per operation — dict ops, append, pop and a random index are each constant",
    space: "O(n) — the array plus one dict entry per live value",
    followUps: [
      "Duplicates allowed (LC 381): store lists of indices per value and remove by swapping the last index into the victim's list — the same hole-filling philosophy, one level deeper.",
      "Weighted getRandom where each value carries its own probability: prefix sums + binary search, or the alias method — see random-pick-with-weight.",
    ],
    related: ["insert-delete-getrandom-o1-duplicates-allowed", "random-pick-with-weight", "lru-cache"],
    verify: {
      fn: "RandomizedSet",
      wrap: "class",
      voidOps: ["insert", "remove"],
      cases: [
        { args: [[["RandomizedSet"], ["insert", 1], ["remove", 2], ["insert", 2], ["remove", 1], ["insert", 2]]], expect: [] },
        { args: [[["RandomizedSet"], ["insert", 5], ["remove", 5], ["insert", 5]]], expect: [] },
        { args: [[["RandomizedSet"], ["remove", 0]]], expect: [] },
        { args: [[["RandomizedSet"], ["insert", 3], ["insert", 3], ["remove", 3], ["remove", 3]]], expect: [] },
        { args: [[["RandomizedSet"], ["insert", -7], ["insert", 9], ["remove", -7], ["remove", -7], ["insert", 9]]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "contains-duplicate-ii",
    statement:
      "Return true if the array holds two equal values whose indices are at most k apart — some pair with nums[i] == nums[j] and |i - j| <= k. Otherwise return false.",
    examples: [
      { input: "nums = [1,2,3,1], k = 3", output: "true", explanation: "The two 1s sit at indices 0 and 3 — distance 3, inside the budget." },
      { input: "nums = [1,0,1,1], k = 1", output: "true", explanation: "Indices 2 and 3 both hold 1 — adjacent." },
      { input: "nums = [1,2,3,1,2,3], k = 2", output: "false", explanation: "Every equal pair is exactly 3 apart — just outside the window." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9", "0 <= k <= 10^5"],
    breakdown: [
      "This is contains-duplicate with a distance budget bolted on. The absolute-value condition |i - j| <= k simplifies the moment you commit to a scan direction: for each index i, the only partners that matter live among the previous k positions. Checking all of them per element is the honest brute force — O(n·k), which is 10^10 operations when both max out. Dead.",
      "The standard upgrade is a dict of value → last seen index, comparing i - last <= k on every hit. It is O(n) and correct, but it remembers every value forever, including twins that are hundreds of positions out of range. The window formulation answers the same question while holding strictly less state.",
      "Think of a set that contains exactly the values of the last k indices. The membership check for the current element asks 'is there a twin within k positions behind me?' directly — the window IS the constraint. Each step checks, adds, and evicts the single value that slid out of range. The data structure never grows past k + 1 entries regardless of n.",
    ],
    edges: [
      "k = 0: no two distinct indices can be 0 apart — always false. The eviction empties the set after every step, which is exactly the right behaviour.",
      "k >= n: nothing is ever evicted and the algorithm degenerates into plain contains-duplicate — correct, since every pair qualifies.",
      "A single element can never have a partner — false without any window juggling.",
      "Duplicates FARTHER than k must not trigger: forgetting the eviction (the classic bug) turns this into plain contains-duplicate and fails exactly the [1,2,3,1,2,3], k=2 style tests.",
    ],
    ladder: [
      { title: "Brute force — scan the previous k", body: "For each index, compare against the previous k elements. O(n·k) — 10^10 at the maximums, completely dead on arrival." },
      { title: "Dict of last seen indices", body: "value → most recent index; on each hit check i - last <= k. O(n) time and O(n) space — but the memory holds values whose twins are long out of range." },
      { title: "The optimal idea — sliding window set of the last k values", body: "Check membership, add the current value, evict nums[i - k]. The set holds at most k + 1 entries, so space is O(min(n, k)) while the time stays linear — same pass, strictly less memory than the dict." },
    ],
    approach: "Sliding window set (last k values)",
    code: `def containsNearbyDuplicate(nums, k):
    window = set()                  # values at the previous k indices
    for i, n in enumerate(nums):
        if n in window:             # a twin within k positions behind us
            return True
        window.add(n)
        if len(window) > k:         # the oldest value just left the window
            window.remove(nums[i - k])
    return False`,
    walkthrough: [
      "The invariant: at the membership check for index i, the window holds exactly the values of indices max(0, i - k) .. i - 1 — every candidate twin the constraint allows, and nothing else. A hit is therefore precisely a pair at distance <= k, and a miss guarantees no partner exists among the allowed predecessors.",
      "The eviction line is the soul of the solution. Without window.remove(nums[i - k]), stale values linger and the function collapses into plain contains-duplicate. Trace [1,2,3,1,2,3] with k = 2: by the time the second 1 arrives at index 3, the 1 from index 0 has already been evicted, so no twin is found — the false answer falls out of the bookkeeping rather than from any extra logic.",
      "The trigger len(window) > k deserves a second look. The window conceptually covers k + 1 slots (i - k through i); if all of them held distinct values the set reaches size k + 1 and the oldest is evicted. Any repeat inside those slots would have returned at the membership check before the size could mislead you — so the size test is a safe proxy for 'a slot just slid out of range'.",
    ],
    time: "O(n) — one pass with O(1) average set operations",
    space: "O(min(n, k)) — the window never holds more than k values",
    followUps: [
      "Add a value condition too — |nums[i] - nums[j]| <= t (contains-duplicate-iii): a plain set can't answer range queries; use buckets of width t or a sorted window.",
      "Report the closest such pair instead of a boolean: keep the value → last-index dict and track the minimum distance seen.",
    ],
    related: ["contains-duplicate", "contains-duplicate-iii", "longest-substring-without-repeating-characters"],
    verify: {
      fn: "containsNearbyDuplicate",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 1], 3], expect: true },
        { args: [[1, 0, 1, 1], 1], expect: true },
        { args: [[1, 2, 3, 1, 2, 3], 2], expect: false },
        { args: [[1], 5], expect: false },
        { args: [[99, 99], 3], expect: true },
        { args: [[1, 2, 3], 0], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "remove-duplicates-from-sorted-array-ii",
    statement:
      "Given a sorted integer array, remove the duplicates IN PLACE so that each value appears at most twice — the first two copies may stay. Return k, the number of kept elements; the first k slots must hold the kept values in their original sorted order, and whatever trails beyond index k - 1 is ignored.",
    examples: [
      { input: "nums = [1,1,1,2,2,3]", output: "5, nums = [1,1,2,2,3,_,_]", explanation: "Two copies of each value survive; the third 1 is discarded." },
      { input: "nums = [0,0,1,1,1,1,2,3,3]", output: "7, nums = [0,0,1,1,2,3,3,_,_]", explanation: "The run of four 1s is trimmed to two." },
    ],
    constraints: ["1 <= nums.length <= 3·10^4", "-10^4 <= nums[i] <= 10^4", "nums is sorted non-decreasing", "edit in place with O(1) extra memory"],
    breakdown: [
      "This is the LC 26 compaction with one dial turned. There, a value survived only if it differed from the last kept value; here it survives if it differs from the value TWO slots back in the kept prefix. The reasoning is exactly the 'at most 2' rule: a value only becomes discardable once two copies of it are already present in the output, and since the array is sorted, both of those copies sit at the end of the prefix — at indices w - 2 and w - 1.",
      "The clumsy alternative people write first is run-tracking: remember the current value and a counter, reset on change. It works, but it carries state the data already contains — the nums[w - 2] comparison reads the same fact straight out of the array. Sortedness is doing the heavy lifting: equal values are contiguous, so a third copy of v is precisely a value equal to the element two slots behind the write head.",
      "The deeper lesson is that the skeleton generalises. 'Keep at most k copies' changes the test to nums[r] != nums[w - k], and k = 1 collapses to the original problem. Interviewers love this follow-up precisely because the answer is a one-character edit — if you wrote the counter version, you get to rewrite it live.",
    ],
    edges: [
      "Arrays of length 1 or 2 keep everything — the w < 2 guard covers the cold start where no comparison is possible yet.",
      "All elements equal → k = 2 (or k = n when n < 2); the test rejects every reader after the second write.",
      "No duplicates at all → k = n and every write is a harmless self-assignment.",
      "Negative values change nothing — the logic only ever compares for equality.",
    ],
    ladder: [
      { title: "Brute force — build the answer elsewhere", body: "Append values to a fresh list, skipping any whose last two entries already match, then copy back. O(n) time but O(n) extra space — the in-place requirement exists to make you do better." },
      { title: "Delete third copies as you scan", body: "Compare each element with its two predecessors and delete on a match. Every deletion shifts the tail — O(n²) on an all-equal array, the adversarial worst case." },
      { title: "The optimal idea — compaction with a w - 2 test", body: "A read pointer walks everything; a write pointer w marks the end of the kept prefix. Write nums[r] only when w < 2 or nums[r] != nums[w - 2]. One pass, two indices, zero extra space." },
    ],
    approach: "Slow/fast compaction, survivor test against w − 2",
    code: `def removeDuplicates(nums):
    w = 0                           # next slot to write a survivor
    for r in range(len(nums)):
        if w < 2 or nums[r] != nums[w - 2]:   # under 2 kept so far, or a new value
            nums[w] = nums[r]
            w += 1
    return w`,
    walkthrough: [
      "Invariant: after processing r elements, nums[0:w] is the compacted prefix in which no value appears more than twice. The test asks exactly the right question — 'would writing this value create a third consecutive copy?' — and on a sorted array that can only happen when nums[w - 2], nums[w - 1] and nums[r] are all equal.",
      "The w < 2 guard is not decoration: with fewer than two survivors there is no nums[w - 2] to compare against, and both initial writes must be accepted unconditionally. Once w reaches 2 the comparison takes over completely and no special cases remain.",
      "Trace [0,0,1,1,1,1,2,3,3]: writes are 0, 0, 1, 1; the next two 1s fail the test (nums[w - 2] is 1); then 2, 3, 3 all pass. w finishes at 7 and the prefix reads [0,0,1,1,2,3,3]. Change the test to nums[r] != nums[w - k] and the same five lines solve 'keep at most k' for any k.",
    ],
    time: "O(n) — single pass, each element read once",
    space: "O(1) — two indices",
    followUps: [
      "Keep at most k copies: the test becomes nums[r] != nums[w - k]; k = 1 is remove-duplicates-from-sorted-array, k = 2 is this problem.",
      "What if the array were NOT sorted? Adjacency dies — sort first (O(n log n)) or fall back to a Counter (O(n) space).",
    ],
    related: ["remove-duplicates-from-sorted-array", "remove-element", "sort-colors"],
    verify: {
      fn: "removeDuplicates",
      wrap: "inPlaceK",
      cases: [
        { args: [[1, 1, 1, 2, 2, 3]], expect: [5, [1, 1, 2, 2, 3]] },
        { args: [[0, 0, 1, 1, 1, 1, 2, 3, 3]], expect: [7, [0, 0, 1, 1, 2, 3, 3]] },
        { args: [[7]], expect: [1, [7]] },
        { args: [[1, 1, 1, 1, 1]], expect: [2, [1, 1]] },
        { args: [[-1, -1, -1, 0, 0, 0, 1]], expect: [5, [-1, -1, 0, 0, 1]] },
        { args: [[1, 2]], expect: [2, [1, 2]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "first-missing-positive",
    statement:
      "Return the smallest positive integer — 1, 2, 3, … — that does not appear in the array. The intended solution runs in O(n) time and uses O(1) extra space, which bans both sorting and a hash set of values.",
    examples: [
      { input: "nums = [1,2,0]", output: "3", explanation: "1 and 2 are present; 3 is the first gap." },
      { input: "nums = [3,4,-1,1]", output: "2", explanation: "1 is present, 2 is not — the answer can sit below values already in the array." },
      { input: "nums = [7,8,9,11,12]", output: "1", explanation: "1 itself is missing, so nothing else matters." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-2^31 <= nums[i] <= 2^31 - 1", "O(n) time and O(1) extra space are expected"],
    breakdown: [
      "The first observation collapses the search space: for an array of length n, the answer always lies in [1, n + 1]. Either all of 1..n are present — then the answer is n + 1 — or some value in 1..n is missing. Every value <= 0 is dead weight (it can never be the answer) and every value > n is dead weight too (the pigeonhole principle says the holes in 1..n are already guaranteed). Only the numbers 1..n carry information.",
      "That bounded domain is the licence for the trick: the array can be its own hash table. A value v belongs at index v - 1, so 'v is present' can be encoded by the fact that slot v - 1 HOLDS v. Cyclic placement walks the array, repeatedly swapping each in-range value into its home slot, until every slot either holds its tenant or holds junk.",
      "The nested loop looks quadratic but is not: every successful swap permanently installs at least one value into its final home, and the swap condition guarantees an installed value is never disturbed again. At most n swaps happen across the ENTIRE outer loop, so the whole algorithm is O(n) — the amortised argument is half the point of the problem.",
    ],
    edges: [
      "Duplicates: the condition nums[home] != nums[i] refuses to swap a value onto its own twin — without it, two equal values ping-pong forever.",
      "All values out of range (all negative, or all huge) → no swaps, and the first pass reports 1.",
      "A perfect [1..n] array → every slot homed, and the answer is n + 1 off the end of the scan.",
      "Single element: [1] → 2, [2] → 1.",
    ],
    ladder: [
      { title: "Brute force — count upward", body: "For candidate = 1, 2, 3 …, scan the array; return the first candidate never found. O(n²) worst case — the answer can be n + 1 after n scans." },
      { title: "Sort or hash set", body: "Sort and scan for the gap: O(n log n). Or collect positives into a set and count up from 1: O(n) time but O(n) space — the space is precisely what the problem forbids." },
      { title: "The optimal idea — cyclic placement into home slots", body: "Value v lives at index v - 1. Swap each in-range value to its home until the slot holds its tenant; out-of-range values are skipped forever. Then the first slot i whose tenant is not i + 1 names the answer. O(n) time, O(1) space — the input array is the table." },
    ],
    approach: "Cyclic placement — the array as its own hash table",
    code: `def firstMissingPositive(nums):
    n = len(nums)
    for i in range(n):
        # drive nums[i] to its home slot (value v lives at index v - 1)
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            home = nums[i] - 1
            nums[i], nums[home] = nums[home], nums[i]
    for i in range(n):
        if nums[i] != i + 1:    # the first homeless slot names the answer
            return i + 1
    return n + 1                # 1..n are all present`,
    walkthrough: [
      "The swap condition deserves to be read twice. 1 <= nums[i] <= n restricts work to informative values; nums[nums[i] - 1] != nums[i] means 'the home slot does not already hold this value'. Together they guarantee the swap both installs a tenant and never runs on a satisfied slot — which is what kills the infinite loop on duplicates: the second copy of v sees its home already occupied by v and gives up.",
      "Why the whole thing is O(n): each swap writes SOME value into its home slot, where the condition ensures it will never be swapped out again. Values only leave homes 0 times, so the number of swaps is at most n over the entire run — the for-plus-while shape is an amortisation illusion. The two passes are then trivially linear.",
      "Trace [3,4,-1,1]: i = 0 swaps 3 home → [-1,4,3,1]; i = 1 swaps 4 home → [-1,1,3,4], then swaps 1 home → [1,-1,3,4]; i = 2 and i = 3 find their tenants already home. The verification pass sees slot 1 holding -1 instead of 2 → return 2. Every swap landed a value where the second pass wanted to find it.",
    ],
    time: "O(n) — at most n swaps (each permanently homes a value) plus two linear passes",
    space: "O(1) — the input array is the hash table",
    followUps: [
      "With O(n) space allowed, the 5-line version is a set of positives plus a count-up loop — say it first, then kill it with the space budget.",
      "Recover the array afterwards: every transformation is a permutation of the original values, so a second placement pass plus junk cleanup restores sorted order.",
    ],
    related: ["missing-number", "find-all-duplicates-in-an-array", "find-all-numbers-disappeared-in-an-array"],
    verify: {
      fn: "firstMissingPositive",
      wrap: "plain",
      cases: [
        { args: [[3, 4, -1, 1]], expect: 2 },
        { args: [[1, 2, 0]], expect: 3 },
        { args: [[7, 8, 9, 11, 12]], expect: 1 },
        { args: [[1]], expect: 2 },
        { args: [[2, 1]], expect: 3 },
        { args: [[1, 1]], expect: 2 },
      ],
    },
    xp: 35,
  },
  {
    slug: "next-permutation",
    statement:
      "Rearrange the array into the next lexicographically greater permutation of its values — the arrangement that is larger than the current one but smaller than every other larger one. If no greater arrangement exists (the array is non-increasing), rearrange it into ascending order instead. The edit must happen in place with O(1) extra memory.",
    examples: [
      { input: "nums = [1,2,3]", output: "[1,3,2]", explanation: "The next arrangement after 123 in dictionary order." },
      { input: "nums = [3,2,1]", output: "[1,2,3]", explanation: "Already the largest arrangement — wrap around to the smallest." },
      { input: "nums = [1,1,5,4,1]", output: "[1,4,1,1,5]", explanation: "Only the segment after the 1 at index 1 has room to grow." },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 100", "in place, O(1) extra memory"],
    breakdown: [
      "'Next permutation' is +1 for ordering: the smallest arrangement that is strictly bigger than the current one. The key structural fact comes from reading the array from the right: a non-increasing suffix is already the LARGEST possible arrangement of its own values and can never be improved by internal rearrangement. So the first position from the right where nums[i] < nums[i + 1] — the rightmost 'ascent' — is the pivot: the rightmost position with any room to grow.",
      "Growing the pivot costs as little as possible: swap it with the smallest value to its right that is still strictly greater. Because the suffix is non-increasing, a scan from the right finds that value first — the rightmost element greater than the pivot is automatically the smallest such, and picking the rightmost also handles duplicate values correctly.",
      "After the swap the suffix is STILL non-increasing — the pivot gave away a value and received a slightly larger one, which changes no relative order among the rest. A descending suffix is one reversal away from ascending, and ascending is its smallest arrangement. That reversal is why the algorithm is O(n) instead of O(n log n): no sort is needed to minimise the tail. If no pivot exists, the whole array is non-increasing and a full reversal produces the wrap-around answer.",
    ],
    edges: [
      "Fully non-increasing input ([3,2,1]) → no pivot; the full reversal produces the ascending reset.",
      "Duplicates: the pivot scan must use >= (nums[i] >= nums[i + 1] means NO ascent) — with strict >, an input like [1,1] would wrongly pivot and produce a 'greater' arrangement that is actually equal.",
      "Single element → the reversal is a no-op; the array is unchanged.",
      "Strictly increasing input → the pivot is index 0 and the suffix (length 1) reversal does nothing: the answer is a single swap of the last two elements.",
    ],
    ladder: [
      { title: "Brute force — enumerate everything", body: "Generate all permutations, sort them, return the one after the current. O(n · n!) — a conceptual definition, not an algorithm; absurd at even n = 10." },
      { title: "Pivot + swap + sort the suffix", body: "Find the rightmost ascent, swap with the smallest greater suffix value, then SORT the suffix ascending. Correct, and the sort is O(n log n) where a reversal would do — the sort is blind to the suffix's existing structure." },
      { title: "The optimal idea — pivot, successor, reverse", body: "Four linear phases: scan back for the pivot; scan back for the rightmost value greater than it; swap; reverse the suffix. The descending-suffix invariant makes the reversal a complete substitute for sorting. O(n) total, O(1) space." },
    ],
    approach: "Rightmost pivot, swap successor, reverse suffix",
    code: `def nextPermutation(nums):
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:   # scan back for the rightmost ascent
        i -= 1
    if i >= 0:                                  # a greater arrangement exists
        j = n - 1
        while nums[j] <= nums[i]:               # rightmost value strictly above the pivot
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]     # the smallest possible bump
    l, r = i + 1, n - 1                         # the suffix is non-increasing → flip it
    while l < r:
        nums[l], nums[r] = nums[r], nums[l]
        l += 1; r -= 1`,
    walkthrough: [
      "The pivot search is where correctness with duplicates is won or lost. nums[i] >= nums[i + 1] treats equal neighbours as part of the fixed suffix — right, because rearranging equal values creates nothing greater. For [1,1] the scan falls off the left end and the wrap-around reversal returns [1,1] unchanged, which is correct: it is the only arrangement of its multiset.",
      "The successor search leans on the suffix's non-increasing shape: the first element from the right that exceeds the pivot is the SMALLEST such element, so the swap is the minimal possible raise of that position. Afterwards the suffix remains non-increasing — we removed its largest qualifying element and inserted the old pivot, which is smaller than everything the removed value had beaten. The reversal then needs no comparison at all.",
      "Trace [1,1,5,4,1]: the suffix [5,4,1] is non-increasing and nums[1] = 1 < 5, so the pivot is i = 1. Scanning from the right, the first value > 1 is the 4 at index 3 → swap → [1,4,5,1,1]. Reverse indices 2..4 → [1,4,1,1,5]. Each phase did the minimum work the definition allows — that minimalism IS the 'next' in next permutation.",
    ],
    time: "O(n) — at most four linear scans",
    space: "O(1) — one swap buffer",
    followUps: [
      "Previous permutation: mirror the whole recipe — scan for the rightmost descent, swap with the rightmost smaller value, reverse the suffix.",
      "Emitting ALL permutations in lex order is just this algorithm run n! times — the classic iteration-free generator; Steinhaus–Johnson–Trotter is the alternative.",
    ],
    related: ["permutations", "permutation-sequence", "next-greater-element-i"],
    verify: {
      fn: "nextPermutation",
      wrap: "inPlace",
      cases: [
        { args: [[1, 2, 3]], expect: [1, 3, 2] },
        { args: [[3, 2, 1]], expect: [1, 2, 3] },
        { args: [[1, 1, 5, 4, 1]], expect: [1, 4, 1, 1, 5] },
        { args: [[1]], expect: [1] },
        { args: [[2, 3, 1]], expect: [3, 1, 2] },
        { args: [[1, 3, 2]], expect: [2, 1, 3] },
      ],
    },
    xp: 20,
  },
  {
    slug: "majority-element-ii",
    statement:
      "Return every value that appears more than ⌊n/3⌋ times in the array. Unlike the classic majority problem there may be zero, one, or two answers — at most two values can exceed the n/3 bar. The result may be returned in any order, and the follow-up asks for one pass with O(1) space.",
    examples: [
      { input: "nums = [3,2,3]", output: "[3]" },
      { input: "nums = [1,2]", output: "[1,2]", explanation: "With n = 2 the bar is ⌊2/3⌋ = 0, so both values qualify." },
      { input: "nums = [1,2,3]", output: "[]", explanation: "Each value appears once — never more than n/3 = 1." },
    ],
    constraints: ["1 <= nums.length <= 5·10^4", "-10^9 <= nums[i] <= 10^9", "follow-up: one pass, O(1) space"],
    breakdown: [
      "The ceiling on the answer count is pure arithmetic: three values each appearing more than n/3 times would need more than n occurrences in total. That bound is what makes Boyer–Moore extendable — instead of one candidate and one counter, keep TWO of each. Everything else about the voting mechanics survives intact.",
      "The extended vote works like this: an element matching a candidate increments that candidate's weight; an element matching NEITHER decrements both weights (its occurrence pairs with one vote of each candidate and cancels all three); a weight that hits zero frees its slot to adopt the next newcomer. Why can't a genuine > n/3 value be wiped out this way? Every cancellation consumes three DISTINCT occurrences — the newcomer plus one vote from each candidate — and each occurrence is consumed at most once, so erasing all f(v) copies of v would burn 3·f(v) array elements. With f(v) > n/3 that exceeds n: impossible. The true majorities must survive the vote.",
      "Surviving the vote is necessary but NOT sufficient — this is the crucial difference from the n/2 version, where the existence guarantee let you trust the final candidate blindly. A value can end the pass holding votes without meeting the bar, so a second pass recounting actual occurrences of each candidate is mandatory. Two candidates, O(n) recount, still O(1) space.",
    ],
    edges: [
      "Small n: for n = 2 the bar is 0, so every distinct value qualifies — [1,2] → [1,2]. The recount handles this without special cases (count > n//3).",
      "All distinct values → the vote still produces two candidates, but the recount empties the answer to [].",
      "Both slots can never hold the same value: slot 2 only adopts elements that failed to match slot 1.",
      "Single element → that element, since 1 > ⌊1/3⌋ = 0.",
    ],
    ladder: [
      { title: "Brute force — count with a map", body: "Tally every value, filter counts > n//3. O(n) time, O(n) space. The honest baseline — and the thing the follow-up exists to eliminate." },
      { title: "Sort and count runs", body: "Sort, then measure each run of equal values. O(n log n) with O(1)-ish extra space if the sort is in-place. Correct, but the log factor and the mutation are both avoidable." },
      { title: "The optimal idea — Boyer–Moore with two candidate slots", body: "Two candidates, two weights, one pass: match → increment; match neither → decrement both; zero weight → adopt. Then a recount pass confirms which candidates truly exceed n/3. O(n) time, O(1) space." },
    ],
    approach: "Boyer–Moore voting with two candidate slots",
    code: `def majorityElement(nums):
    c1 = c2 = None              # the two surviving candidates
    w1 = w2 = 0                 # their live vote weights
    for x in nums:
        if c1 is not None and x == c1:
            w1 += 1             # vote for candidate 1
        elif c2 is not None and x == c2:
            w2 += 1             # vote for candidate 2
        elif w1 == 0:
            c1, w1 = x, 1       # slot 1 is free — adopt x
        elif w2 == 0:
            c2, w2 = x, 1       # slot 2 is free — adopt x
        else:
            w1 -= 1             # x matches neither: this one occurrence
            w2 -= 1             # cancels one vote from EACH candidate
    out = []
    for c in (c1, c2):          # candidates are suspects — recount to confirm
        if c is not None and nums.count(c) > len(nums) // 3:
            out.append(c)
    return out`,
    walkthrough: [
      "The elif order encodes two rules. Matches are checked BEFORE slot adoption, so a candidate's own occurrences are never misread as a newcomer; slot 1 is refilled before slot 2, which keeps the two candidates from ever holding the same value — adoption into slot 2 only happens for an x that already failed to match c1.",
      "The counting argument, once more and slowly: a 'cancellation' event consumes the arriving element and one standing vote from each candidate — three distinct occurrences, all retired. Each occurrence is retired at most once, so retiring all f(v) occurrences of a value v consumes 3·f(v) elements of the array. Since a true answer has f(v) > n/3, retirement would need more than n elements — contradiction. Genuine majorities always finish with standing votes; the converse fails (weak candidates keep votes too), which is exactly why the recount exists.",
      "Trace [1,1,1,3,3,2,2,2]: 1 adopts slot 1 (w1 climbs to 3), 3 adopts slot 2 (w2 = 2). The first 2 matches neither → w1 = 2, w2 = 1; the second 2 → w1 = 1, w2 = 0; the third 2 finds slot 2 free and adopts it. Final candidates: 1 (w 3) and 2 (w 1). The recount keeps both (each appears 3 > 8/3) and silently kills 3, which survived early but never cleared the bar — the recount is the safety net, and this trace shows it working.",
    ],
    time: "O(n) — one voting pass plus a recount of at most two candidates",
    space: "O(1) — two candidates and two weights",
    followUps: [
      "General k: keep k candidate slots and every value above n/(k+1) survives (Misra–Gries) — the same three-way-consumption argument generalises to (k+1)-way.",
      "If a value exceeding n/2 were guaranteed (majority-element), one slot suffices and the recount can be skipped — the guarantee is what upgrades a candidate into an answer.",
    ],
    related: ["majority-element", "top-k-frequent-elements", "check-if-a-number-is-majority-element-in-a-sorted-array"],
    verify: {
      fn: "majorityElement",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[3, 2, 3]], expect: [3] },
        { args: [[1, 1, 1, 3, 3, 2, 2, 2]], expect: [1, 2] },
        { args: [[1]], expect: [1] },
        { args: [[1, 2]], expect: [1, 2] },
        { args: [[1, 2, 3]], expect: [] },
        { args: [[2, 2, 1, 3]], expect: [2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-all-duplicates-in-an-array",
    statement:
      "The array holds n integers, each value lying in 1..n, and every element appears once or twice. Return every value that appears twice, in any order. The target solution runs in O(n) time with O(1) extra space beyond the output — no counting array, no set.",
    examples: [
      { input: "nums = [4,3,2,7,8,2,3,1]", output: "[2,3]", explanation: "2 and 3 are the only values that show up twice." },
      { input: "nums = [1,1]", output: "[1]" },
      { input: "nums = [1]", output: "[]", explanation: "Nothing appears twice." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "1 <= nums[i] <= n", "each element appears once or twice", "O(1) extra space besides the output"],
    breakdown: [
      "The range constraint is the entire game. Values live in 1..n, which means every value doubles as an INDEX into the array itself (v ↔ slot v - 1). The array can therefore serve as its own hash table, and the cheapest possible flag is one the values already carry: their sign. A negative slot means 'the value that claims this slot has been seen'.",
      "The mechanism is one pass: for each element x, compute v = abs(x) — abs because the slot may already have been flipped by an earlier mark — and inspect slot v - 1. If it is already negative, this is the second sighting of v: append v to the output. Otherwise flip nums[v - 1] negative to plant the flag. Each value marks its home exactly once, so a second sighting can only mean a duplicate.",
      "The misstep to name out loud: forgetting abs() when reading. Once marking begins, slots hold negated values, and using one raw as an index reads the wrong slot (or crashes). Related trap: flipping unconditionally — a value whose slot is already marked must NOT be flipped back, or later reads of that flag lie.",
    ],
    edges: [
      "Reads need abs() because slots ahead of the scan may already be negated.",
      "The input ends up mutated (signs flipped) — a two-line abs pass restores it, which keeps the O(1)-space claim honest for callers who need the original.",
      "A perfect permutation (no duplicates) → every slot gets flipped exactly once and the output is empty.",
      "The all-same case [1,1]: the first 1 plants the flag, the second finds it — one duplicate, no special case.",
    ],
    ladder: [
      { title: "Brute force — count with a map", body: "Tally occurrences, return the values with count 2. O(n) time, O(n) space. Simple, correct, and exactly the memory the problem asks you to eliminate." },
      { title: "Sort and compare neighbours", body: "Sort, then collect values equal to their successor. O(n log n), mutates the input, no extra space. The sortedness groups twins adjacently — but you paid a log factor for it." },
      { title: "The optimal idea — sign marking", body: "Use nums[v - 1]'s sign as the one-bit 'seen v' flag: flip on first sight, detect on second. O(n) time, O(1) extra space, one pass — the values index their own presence table." },
    ],
    approach: "Sign marking — the array as its own seen-set",
    code: `def findDuplicates(nums):
    out = []
    for x in nums:
        v = abs(x)                  # the slot may already be flipped — abs first
        if nums[v - 1] < 0:         # mark already planted → second sighting
            out.append(v)
        else:
            nums[v - 1] = -nums[v - 1]   # plant the 'v was here' flag
    for i in range(len(nums)):      # courtesy: undo the mutation
        nums[i] = abs(nums[i])
    return out`,
    walkthrough: [
      "Invariant: after the first t elements have been processed, slot i's sign is negative exactly when the value i + 1 appeared among them. The flip-once discipline is what keeps this true — a value that arrives a second time is REPORTED, not re-flipped, so the flag's polarity always reflects presence, never visit count.",
      "Why negation instead of schemes like 'add n to mark'? The sign is the one bit that coexists with the stored value: abs() recovers the data, the sign carries the flag, and both survive arbitrary later reads. Add-n encodings work but must encode AND decode carefully since every slot is also a legitimate data value that gets read later — negation composes for free.",
      "Trace [4,3,2,7,8,2,3,1]: 4 flips slot 3, 3 flips slot 2, 2 flips slot 1, 7 flips slot 6, 8 flips slot 7; then 2 reads slot 1 — negative — and reports 2; 3 reads slot 2 — negative — and reports 3; 1 flips slot 0. Output [2,3], and the closing abs pass hands back the original array byte-for-byte.",
    ],
    time: "O(n) — one pass to mark and detect, one to restore",
    space: "O(1) extra — the flags live in the input's signs (output excluded)",
    followUps: [
      "Values may appear MORE than twice: negation cannot count past one visit — switch to add-n marking (each visit adds n; count = value // n) or accept O(n) space.",
      "One linked problem, one mark away: find-all-numbers-disappeared-in-an-array reads the SAME flags and reports the slots that were never flipped.",
    ],
    related: ["find-all-numbers-disappeared-in-an-array", "first-missing-positive", "find-the-duplicate-number"],
    verify: {
      fn: "findDuplicates",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[4, 3, 2, 7, 8, 2, 3, 1]], expect: [2, 3] },
        { args: [[1, 1]], expect: [1] },
        { args: [[1]], expect: [] },
        { args: [[5, 4, 3, 2, 1]], expect: [] },
        { args: [[2, 2, 3, 3]], expect: [2, 3] },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-all-numbers-disappeared-in-an-array",
    statement:
      "The array holds n integers where every value lies in 1..n — values may repeat, and some values in 1..n never appear at all. Return every value from 1..n that is missing, in any order. Target: O(n) time and O(1) extra space beyond the output.",
    examples: [
      { input: "nums = [4,3,2,7,8,2,3,1]", output: "[5,6]", explanation: "Values 5 and 6 are the ones nobody claimed." },
      { input: "nums = [1,1]", output: "[2]", explanation: "2 is the only value in 1..2 never seen." },
      { input: "nums = [1]", output: "[]", explanation: "A perfect permutation has no gaps." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "1 <= nums[i] <= n", "O(1) extra space besides the output"],
    breakdown: [
      "Same family as find-all-duplicates-in-an-array, one question over: values are valid indices, so the array is its own presence table. Mark every value that occurs; the slots that end UNMARKED are precisely the values from 1..n that never showed up. No set, no second array — the input's own sign bits do the bookkeeping.",
      "The marking discipline differs from the duplicates variant in one deliberate way. There, the second sighting of a value was the SIGNAL, so the code flipped on first sight and reported on second. Here, repeats are noise, and a slot may be visited by both copies of a repeated value — flipping unconditionally would unflip the mark and lie about presence. Hence the guard: negate only if the slot is still positive.",
      "The abs() on read is mandatory for the same reason as always: earlier positions may already hold negated data, and those are still genuine values whose home slots must be marked. What reads like paranoia is the whole correctness argument — every access is abs() to decode data, sign to store state.",
    ],
    edges: [
      "Repeated values: the flip-only-if-positive guard absorbs the second visit silently — remove the guard and duplicates corrupt the table.",
      "A perfect permutation → every slot marked, empty output.",
      "All entries equal, e.g. [2,2] with n = 2 → only slot 1 is claimed, so [1] is missing.",
      "The input ends up mutated — a closing abs pass restores it for the caller.",
    ],
    ladder: [
      { title: "Brute force — set of seen values", body: "Collect the values into a set, then scan 1..n for anything absent. O(n) time, O(n) space — the straightforward version the space budget forbids." },
      { title: "Sort and scan for gaps", body: "Sort, then walk, reporting any value in 1..n skipped by the sequence. O(n log n), mutates the input, no extra memory. Fine — but the sort is doing work the sign trick gets for free." },
      { title: "The optimal idea — sign marking", body: "For each value v (read with abs), negate slot v - 1 if still positive. Then every slot that stayed positive is a missing value: index i unmarked ⇔ value i + 1 never occurred. O(n), O(1) extra." },
    ],
    approach: "Sign marking — unclaimed slots are the missing values",
    code: `def findDisappearedNumbers(nums):
    for x in nums:
        v = abs(x)              # slots ahead may already be negated
        if nums[v - 1] > 0:     # flip once — repeats must not unflip
            nums[v - 1] = -nums[v - 1]
    out = [i + 1 for i in range(len(nums)) if nums[i] > 0]   # never claimed
    for i in range(len(nums)):  # courtesy: restore the input
        nums[i] = abs(nums[i])
    return out`,
    walkthrough: [
      "Invariant: after the marking pass, slot i is negative exactly when the value i + 1 occurs somewhere in the array. The collection pass therefore reads the answer straight off the sign bits — and as a free bonus, the output emerges in ascending order because it is generated by an ascending slot scan.",
      "The flip-only-if-positive guard is the one-line difference from find-all-duplicates, and it is worth articulating in an interview: in that problem the second sighting was the ANSWER, so the mark had to stay pristine for exactly two visits; here the second sighting is meaningless and must not corrupt the flag. Same data structure, opposite discipline, because the question changed.",
      "Trace [4,3,2,7,8,2,3,1]: marks land on slots 3, 2, 1, 6, 7 — the second 2 and second 3 are absorbed by the guard — and finally slot 0 (value 1). Slots 4 and 5 stay positive → output [5,6]. The restore pass returns the array to its original state, so the O(1)-space promise costs the caller nothing.",
    ],
    time: "O(n) — one pass to mark, one to collect, one to restore",
    space: "O(1) extra — the flags live in the input's signs (output excluded)",
    followUps: [
      "Report the duplicates AND the missing in one sweep: the same flags answer both — negative slots are seen values, positive slots are missing ones.",
      "No mutation allowed: an explicit boolean array is the honest O(n)-space fallback, or sort + gap scan at O(n log n).",
    ],
    related: ["find-all-duplicates-in-an-array", "first-missing-positive", "find-the-duplicate-number"],
    verify: {
      fn: "findDisappearedNumbers",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[4, 3, 2, 7, 8, 2, 3, 1]], expect: [5, 6] },
        { args: [[1, 1]], expect: [2] },
        { args: [[1]], expect: [] },
        { args: [[3, 3, 1, 1]], expect: [2, 4] },
        { args: [[2, 2]], expect: [1] },
        { args: [[5, 4, 3, 2, 1]], expect: [] },
      ],
    },
    xp: 10,
  },
];
