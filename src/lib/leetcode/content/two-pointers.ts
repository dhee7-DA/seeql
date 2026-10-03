// Deep-dives — Two Pointers (5). Original statements/solutions; verified by
// scripts/lc-verify.
import type { LcDeepDive } from "../types";

export const TWO_POINTERS: LcDeepDive[] = [
  {
    slug: "valid-palindrome",
    statement:
      "A phrase is a palindrome if, after lowercasing every letter and discarding every non-alphanumeric character, it reads the same forwards and backwards. Given a string, report whether it is a palindrome under that rule. (An empty-after-cleanup string counts as a palindrome.)",
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: "true", explanation: "Cleanup yields \"amanaplanacanalpanama\", which is symmetric." },
      { input: 's = "race a car"', output: "false", explanation: "\"raceacar\" is not symmetric." },
      { input: 's = " "', output: "true", explanation: "Nothing survives cleanup; empty is a palindrome." },
    ],
    constraints: ["1 <= s.length <= 2·10^5", "s consists of printable ASCII characters"],
    breakdown: [
      "Two chores hide in one sentence: NORMALIZE (keep only alphanumerics, lowercase them) and CHECK symmetry. Doing both in one sweep with two pointers is the interview answer; doing the normalize step first with a comprehension then checking is the readable fallback — both are worth knowing.",
      "Python's str.isalnum() does the character-class work for you; the pointer version simply skips anything it would have deleted. That skip loop is where most bugs live: the inner while must re-check l < r every time, or you'll walk off the string on inputs like '!!'.",
      "The classic near-miss: comparing '0' and 'P'. Both are alphanumeric, and tolower distinguishes them fine — but only if you actually lowercase. Uppercase 'O' vs digit '0' is another trap pair; the rule 'compare lowercased alphanumerics only' handles both.",
    ],
    edges: [
      "Strings that become empty after cleanup → true.",
      "Single alphanumeric character → true.",
      "Punctuation runs ('.,!?') must not advance past the other pointer — the inner loops guard with l < r.",
    ],
    ladder: [
      { title: "Brute force — clean, then reverse", body: "Build the cleaned string, compare with its reverse. O(n) time and O(n) space — perfectly fine, and often the first answer interviewers expect you to improve." },
      { title: "Two pointers with cleanup array", body: "Filter to a new array, then run two pointers over it. Still O(n) space but shows the symmetry logic you'll reuse in harder problems." },
      { title: "The optimal idea — pointers over the RAW string", body: "Skip non-alphanumerics in place with inner loops, compare lowercased chars, close inward. O(n) time, O(1) space, early false exit." },
    ],
    approach: "Inward two pointers with in-place cleanup skips",
    code: `def isPalindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        while l < r and not s[l].isalnum():
            l += 1                  # skip junk on the left
        while l < r and not s[r].isalnum():
            r -= 1                  # skip junk on the right
        if s[l].lower() != s[r].lower():
            return False
        l += 1
        r -= 1
    return True`,
    walkthrough: [
      "The outer loop narrows the window while both inner loops purify its edges. After the skips, s[l] and s[r] are guaranteed alphanumerics (or the window has collapsed), so the comparison is valid.",
      "The guards 'l < r' inside the skip loops do double duty: they stop the walk at the middle AND prevent the two pointers from crossing past each other on strings of pure punctuation.",
      "Every character is visited at most once by one pointer — linear time, zero allocations. The early 'return False' means most non-palindromes finish far before the pointers meet.",
    ],
    time: "O(n) — each pointer crosses the string once",
    space: "O(1) — no cleaned copy is built",
    followUps: [
      "What if you may not assume ASCII (full Unicode)? isalnum() still works; casefolding replaces lower().",
      "Variant: 'valid palindrome after deleting at most one character' — the same pointers plus one branch that tries skipping left or right.",
    ],
    related: ["valid-palindrome-ii", "reverse-string", "palindromic-substrings"],
    verify: {
      fn: "isPalindrome",
      wrap: "plain",
      cases: [
        { args: ["A man, a plan, a canal: Panama"], expect: true },
        { args: ["race a car"], expect: false },
        { args: [" "], expect: true },
        { args: ["0P"], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "two-sum-ii-input-array-is-sorted",
    statement:
      "Given a 1-indexed array of integers sorted in non-decreasing order and a target, return the 1-based indices of the two numbers that sum to the target. Exactly one solution exists, each element may be used once, and you must use only constant extra space.",
    examples: [
      { input: "numbers = [2,7,11,15], target = 9", output: "[1,2]", explanation: "2 + 7 = 9." },
      { input: "numbers = [2,3,4], target = 6", output: "[1,3]", explanation: "2 + 4 = 6." },
      { input: "numbers = [-1,0], target = -1", output: "[1,2]" },
    ],
    constraints: ["2 <= numbers.length <= 3·10^4", "exactly one valid answer", "constant extra space required"],
    breakdown: [
      "Sorted input is a gift: it means position carries information. Start pointers at both ends; the sum numbers[l] + numbers[r] is either right, too small, or too big — and in each case the sortedness tells you exactly which pointer to move. Too small → the only way up is a bigger left value. Too big → the only way down is a smaller right value.",
      "This is the same problem as Two Sum with a better tool. The hash map costs O(n) extra space because it has to recreate order the array already has. Here the constant-space requirement is a hint, not an obstacle: two pointers, O(n) time, O(1) space.",
      "Termination is guaranteed by the unique-answer condition: the pointers can never step over the correct pair, because every rejected candidate was provably not part of any solution.",
    ],
    edges: [
      "Negative values and negative targets — the comparison logic is sign-agnostic.",
      "Answer at the extremes (first + last element) — the starting position.",
      "Duplicate values that are NOT the answer (e.g. [1,1,2,9]) — pointer moves skip them correctly because the sum comparison drives movement, not value identity.",
    ],
    ladder: [
      { title: "Brute force — pairs", body: "Nested loops over (l, r). O(n²) — and it ignores the sortedness that the problem deliberately handed you." },
      { title: "Binary search per element", body: "For each l, binary-search target − numbers[l] to its right. O(n log n), constant space. A legitimate step up from brute force." },
      { title: "The optimal idea — two converging pointers", body: "Both ends inward; move the left pointer up when the sum is low, the right pointer down when it's high. O(n) time, O(1) space, and each step discards one element forever." },
    ],
    approach: "Two pointers converging from the ends",
    code: `def twoSum(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        total = numbers[l] + numbers[r]
        if total == target:
            return [l + 1, r + 1]      # 1-indexed answer
        if total < target:
            l += 1                     # need a bigger sum → bigger left
        else:
            r -= 1                     # need a smaller sum → smaller right
`,
    walkthrough: [
      "The invariant: the answer pair always stays inside [l, r]. When the sum is too small, numbers[l] can't be the left element of ANY remaining pair (it's the smallest available partner and even the best partner fails), so l+=1 is safe. Mirror logic for r.",
      "Each iteration eliminates one element permanently, so at most n−1 iterations — linear, no extra memory, and the 1-indexed output is just a +1 on both sides.",
      "Compared to the hash map version of Two Sum: same O(n) time, but zero auxiliary storage — possible only because the input's order does the map's job.",
    ],
    time: "O(n) — each step retires one pointer position",
    space: "O(1) — two indices",
    followUps: [
      "Unsorted input? Either hash map (O(n) space) or sort-with-indices then pointers (O(n log n)) — sortedness is the whole argument.",
      "Three Sum is this problem in a loop: fix an anchor, run two pointers on the suffix.",
    ],
    related: ["two-sum", "3sum", "valid-palindrome"],
    verify: {
      fn: "twoSum",
      wrap: "plain",
      cases: [
        { args: [[2, 7, 11, 15], 9], expect: [1, 2] },
        { args: [[2, 3, 4], 6], expect: [1, 3] },
        { args: [[-1, 0], -1], expect: [1, 2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "3sum",
    statement:
      "Given an integer array, return every distinct triplet of indices' VALUES that sum to zero — as a list of triples, with no duplicate triples in the output. The answer may be empty.",
    examples: [
      { input: "nums = [-1,0,1,2,-1,-4]", output: "[[-1,-1,2],[-1,0,1]]", explanation: "The triplet [-1,0,1] can be formed once; duplicates collapse." },
      { input: "nums = [0,1,1]", output: "[]", explanation: "No three values sum to zero." },
      { input: "nums = [0,0,0,0]", output: "[[0,0,0]]", explanation: "Four zeros make many index-triples but only ONE value-triple." },
    ],
    constraints: ["3 <= nums.length <= 3000", "-10^5 <= nums[i] <= 10^5"],
    breakdown: [
      "Brute force is three nested loops — O(n³) plus a deduplication headache. The upgrade everyone should reach for: sort the array, fix the smallest element of the triple as an ANCHOR, and find the remaining pair with two pointers (exactly Two Sum II on the suffix, target −anchor). Sorting is what makes 'skip duplicates' trivial — equal values become adjacent.",
      "Deduplication is the real boss of this problem. Three separate skip rules: (1) skip repeated anchors, (2) after recording a hit, advance l past equal values, (3) advance r past equal values. Miss any one and your output fills with repeated triples like [-1,0,1] twice.",
      "A beautiful early exit: once the anchor is positive, stop — three positives can't sum to zero, and sorted order means every later anchor is positive too.",
    ],
    edges: [
      "All duplicates ([0,0,0,0]) — many index combinations, one output triple.",
      "No solution at all → empty list.",
      "Anchor duplicate skip must compare with nums[i-1], not nums[i+1] (the i>0 guard).",
    ],
    ladder: [
      { title: "Brute force — triple loop + set dedupe", body: "O(n³) time; canonicalize each found triple (sort it) and stuff into a set. 3000³ = 2.7·10^10 — hopeless at full size." },
      { title: "Hash set pair search", body: "Sort; anchor loop; inner pair search with a set of complements. O(n²) time but O(n) space and messy deduping — the two-pointer version dominates it." },
      { title: "The optimal idea — sorted anchor + two pointers + 3 skip rules", body: "Sort once. For each anchor i, converge two pointers on target −nums[i] with in-loop duplicate skips. O(n²) time, O(1) extra space (beyond output), dedupe handled structurally." },
    ],
    approach: "Sort + anchor loop + two pointers with duplicate skips",
    code: `def threeSum(nums):
    nums.sort()                          # order makes dedupe + pairing easy
    out = []
    for i in range(len(nums) - 2):
        if nums[i] > 0:                  # anchor positive → impossible
            break
        if i > 0 and nums[i] == nums[i - 1]:
            continue                     # skip duplicate anchors
        l, r = i + 1, len(nums) - 1
        while l < r:
            total = nums[i] + nums[l] + nums[r]
            if total < 0:
                l += 1
            elif total > 0:
                r -= 1
            else:
                out.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1               # skip duplicate left values
                while l < r and nums[r] == nums[r + 1]:
                    r -= 1               # skip duplicate right values
    return out`,
    walkthrough: [
      "Sorting does double duty: it lets the anchor early-exit on positives, and it makes all duplicates adjacent so the three skip rules become simple neighbour comparisons. Every recorded triple is generated exactly once — the dedupe is structural, not a post-filter.",
      "The inner loop is Two Sum II with target −nums[i]: too small → move l up, too big → move r down, hit → record BOTH pointers inward and then scrub the duplicates each landed on.",
      "Complexity: the anchor loop is n, the pointer scan is O(n) — O(n²) total with O(1) extra space. For n = 3000 that's ~9M inner steps, comfortable.",
    ],
    time: "O(n²) — sort plus n anchor scans of linear cost",
    space: "O(1) extra (output aside; Python's sort is O(n) worst case)",
    followUps: [
      "Four Sum: nest one more anchor — sort, then anchor × anchor × two-pointers; the dedupe rules stack per level.",
      "k-Sum in general: recursion down to the 2-sum base case, each level adding a skip rule.",
    ],
    related: ["two-sum-ii-input-array-is-sorted", "4sum", "3sum-closest"],
    verify: {
      fn: "threeSum",
      wrap: "plain",
      normalize: "sortGroups",
      cases: [
        { args: [[-1, 0, 1, 2, -1, -4]], expect: [[-1, -1, 2], [-1, 0, 1]] },
        { args: [[0, 1, 1]], expect: [] },
        { args: [[0, 0, 0, 0]], expect: [[0, 0, 0]] },
        { args: [[1, 2, -2, -1]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "container-with-most-water",
    statement:
      "You are given an array of non-negative heights representing vertical lines at positions 0..n−1. Pick any two lines to form a container with the x-axis; it holds water(w, h) = (distance between them) × (height of the SHORTER line). Maximise the water held and return that maximum.",
    examples: [
      { input: "height = [1,8,6,2,5,4,8,3,7]", output: "49", explanation: "Lines at index 1 (8) and 8 (7): min(8,7)·(8−1) = 49." },
      { input: "height = [1,1]", output: "1" },
      { input: "height = [4,3,2,1,4]", output: "16", explanation: "The two 4s with everything between." },
    ],
    constraints: ["2 <= height.length <= 10^5", "0 <= height[i] <= 10^4"],
    breakdown: [
      "The water formula has two factors fighting each other: width shrinks as pointers converge, height is capped by the SHORTER wall. Any candidate area is width × min(h[l], h[r]) — so the shorter wall is always the bottleneck of the current container.",
      "The greedy move follows directly: with width maximal at the ends, the only way a moved-in container can beat the current one is a taller bottleneck — so DISCARD the shorter wall. Keeping the taller wall costs nothing: every container using the shorter wall and any interior partner is already covered by the current measurement.",
      "That discard argument is the whole proof of correctness: each step eliminates one line from ever being the bottleneck again, and you never eliminate a line that could still appear in a better container.",
    ],
    edges: [
      "Two elements — the answer is min(h[0], h[1]) × 1.",
      "Equal walls (h[l] == h[r]) — moving either is safe; the code moves r.",
      "Zeros are legal heights; area can legitimately be 0.",
    ],
    ladder: [
      { title: "Brute force — every pair", body: "All pairs i<j compute min(h[i],h[j])·(j−i). O(n²): 10^5 lines → 5·10^9 pairs. Too slow." },
      { title: "Greedy intuition without proof", body: "Start from the ends and move the shorter pointer — but implemented with extra max-tracking per side; works, but the reasoning tends to get muddled without the bottleneck argument." },
      { title: "The optimal idea — discard the bottleneck", body: "Two pointers at the ends; at each step record area, then move the pointer at the SHORTER wall inward. O(n) time, O(1) space, provably never skips the optimum." },
    ],
    approach: "Two pointers — always retire the shorter wall",
    code: `def maxArea(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        width = r - l
        best = max(best, width * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1          # the short left wall is the bottleneck → retire it
        else:
            r -= 1          # retire the short right wall
    return best`,
    walkthrough: [
      "Each iteration measures the widest remaining container for the current bottleneck, then throws the bottleneck away. Because width only decreases, future candidates must win on HEIGHT — and only retiring the shorter wall leaves room for that.",
      "Why is retiring safe? Say h[l] < h[r]. Every container keeping l with some r′ < r has height ≤ h[l] and width < width_now — strictly dominated by what we just measured. So l is exhausted as a useful wall, and l += 1 loses nothing.",
      "The loop is guaranteed linear: one pointer moves per iteration until they meet — n−1 steps, each O(1).",
    ],
    time: "O(n) — pointers cross once",
    space: "O(1)",
    followUps: [
      "Return the actual pair of indices: track argmax alongside best.",
      "Trapping Rain Water is the vertical sibling — the same 'min of two walls' intuition, but summed per position instead of maximised over pairs.",
    ],
    related: ["trapping-rain-water", "two-sum-ii-input-array-is-sorted"],
    verify: {
      fn: "maxArea",
      wrap: "plain",
      cases: [
        { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expect: 49 },
        { args: [[1, 1]], expect: 1 },
        { args: [[4, 3, 2, 1, 4]], expect: 16 },
        { args: [[1, 2, 1]], expect: 2 },
      ],
    },
    xp: 20,
  },
  {
    slug: "trapping-rain-water",
    statement:
      "Given an elevation map — non-negative integers as bar heights of width 1 — compute how much water it traps after raining. Water sits on top of every bar up to the level of the lowest taller wall on either side of it.",
    examples: [
      { input: "height = [0,1,0,2,1,0,1,3,2,1,2,1]", output: "6" },
      { input: "height = [4,2,0,3,2,5]", output: "9" },
      { input: "height = [3,4,3]", output: "0", explanation: "No bar is lower than both its surrounding walls." },
    ],
    constraints: ["1 <= height.length <= 2·10^4", "0 <= height[i] <= 10^5"],
    breakdown: [
      "Per-position thinking unlocks everything: the water above index i is min(max height to its LEFT, max height to its RIGHT) − height[i], floored at 0. Sum that over all i and you're done. Every approach is a different way of answering 'what are the two surrounding maxima?' cheaply.",
      "The obvious way is arrays: one pass computing prefix maxima, one pass computing suffix maxima, then a third pass summing — O(n) time, O(n) space. Clean, verifiable, and the right first answer to say out loud.",
      "The two-pointer refinement notices that at any moment, one side's max is the LIMITING one: if left_max < right_max, the water at l depends only on left_max (the right side is guaranteed taller), so you can settle position l immediately and advance — without ever knowing the true global right max at that point.",
    ],
    edges: [
      "Monotonic slopes trap nothing (every position is its own boundary max).",
      "Flat-topped and single-bar maps → 0.",
      "The tallest bar itself traps nothing above it — both maxima equal its height.",
    ],
    ladder: [
      { title: "Brute force — scan outward per position", body: "For each i, walk left and right for the maxima. O(n²); correct but 2·10^4 bars mean ~8·10^8 steps." },
      { title: "Prefix + suffix max arrays", body: "Two linear passes build left-max and right-max arrays; a third pass sums min(L[i], R[i]) − h[i]. O(n) time, O(n) space — the readable benchmark." },
      { title: "The optimal idea — two pointers with running maxima", body: "Whichever running max is smaller is the binding constraint for its side; settle that side's water and move it. O(n) time, O(1) space, same totals as the array version." },
    ],
    approach: "Two pointers with running left/right maxima",
    code: `def trap(height):
    l, r = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0
    while l < r:
        if height[l] < height[r]:
            left_max = max(left_max, height[l])
            water += left_max - height[l]   # right side is guaranteed taller
            l += 1
        else:
            right_max = max(right_max, height[r])
            water += right_max - height[r]  # left side is guaranteed taller
            r -= 1
    return water`,
    walkthrough: [
      "The branch condition compares the BARS, not the maxima — height[l] < height[r] implies the true right max for position l is at least height[r] > height[l] ≥ left_max… more precisely it guarantees right_max (current or future) exceeds left_max's contribution, so min() at position l equals left_max. Settle it, advance l.",
      "left_max/right_max are updated BEFORE adding water, so the water term left_max − height[l] is never negative: it's 0 on record-high bars and the trapped depth elsewhere.",
      "Every position between the pointers is settled exactly once — the tallest overall bar is the only one never explicitly added, and it traps 0 by definition. Linear time, two integers of state.",
    ],
    time: "O(n) — each pointer step settles one bar",
    space: "O(1) — two maxima and a total",
    followUps: [
      "2-D version (Trapping Rain Water II): the heap-based border expansion — a different problem wearing the same coat.",
      "The prefix/suffix array version is the one to present first in interviews; the pointer version is the optimisation conversation.",
    ],
    related: ["container-with-most-water", "product-of-array-except-self"],
    verify: {
      fn: "trap",
      wrap: "plain",
      cases: [
        { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expect: 6 },
        { args: [[4, 2, 0, 3, 2, 5]], expect: 9 },
        { args: [[3, 4, 3]], expect: 0 },
        { args: [[]], expect: 0 },
      ],
    },
    xp: 35,
  },
];
