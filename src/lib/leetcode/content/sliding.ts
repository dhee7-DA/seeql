// Deep-dives — Sliding Window (6). Original statements/solutions; verified
// by scripts/lc-verify.
import type { LcDeepDive } from "../types";

export const SLIDING: LcDeepDive[] = [
  {
    slug: "best-time-to-buy-and-sell-stock",
    statement:
      "You are given a list of daily prices in order. You may buy on one day and sell on a LATER day; report the maximum profit achievable, or 0 if no purchase can ever turn a profit (prices only fall).",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "5", explanation: "Buy at 1 (day 2), sell at 6 (day 5)." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "Every day is cheaper than the last — never buy." },
      { input: "prices = [2,4,1]", output: "2" },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^4"],
    breakdown: [
      "Every profit is sell − buy with sell after buy. So for each potential SELL day, the best possible buy is the cheapest price seen BEFORE it. One running minimum turns the whole array into a single decision per day: 'profit if I sell today'.",
      "The naive pair loop is O(n²); the running-minimum version is O(n) with two variables — best profit so far, and cheapest price so far. The order inside the loop matters conceptually: compute today's sell profit against the historical minimum FIRST, then fold today's price into the minimum (selling and buying on the same day yields 0, which is harmless, but the discipline keeps the logic honest).",
      "This is the seed of the entire stock series (II, III, IV, cooldown, fee): each later problem adds state — here the state is just 'minimum so far', and spotting that pattern is the lesson.",
    ],
    edges: [
      "Strictly falling prices → answer 0 (never forced to trade).",
      "Single day → 0 (no later day to sell).",
      "Equal prices — profit 0 on that pair, doesn't break anything.",
    ],
    ladder: [
      { title: "Brute force — every (buy, sell) pair", body: "Two loops over all i<j, track max(prices[j]−prices[i]). O(n²) — 10^5 days is 5·10^9 pairs." },
      { title: "Suffix maxima", body: "Precompute the max price to the right of each day, then one pass takes max(suffix_max[i] − prices[i]). O(n) time but O(n) space — a stepping stone." },
      { title: "The optimal idea — cheapest day so far", body: "Two rolling variables: lo (min price so far) and best. One pass, O(1) space. The 'sell today vs buy cheaper today' framing makes the code read like the sentence." },
    ],
    approach: "Single pass with running minimum",
    code: `def maxProfit(prices):
    best = 0
    lo = float("inf")            # cheapest price seen so far
    for p in prices:
        best = max(best, p - lo) # sell today against the historical best buy
        lo = min(lo, p)          # today might be a better buy
    return best`,
    walkthrough: [
      "Invariant: before day i is processed, lo is the minimum of prices[0..i-1]. So p − lo is exactly 'best profit selling today'. The max over all days is the answer by definition.",
      "Updating lo after the profit check means today's price is never paired with itself for anything other than 0 profit — harmless either way, but the order documents intent.",
      "Falling markets produce negative p − lo candidates, which never beat best = 0 — the 'don't trade' outcome falls out of the max, no special case needed.",
    ],
    time: "O(n) — one pass",
    space: "O(1) — two variables",
    followUps: [
      "Multiple transactions allowed (Stock II): greedy — collect every positive day-to-day rise.",
      "At most two transactions (Stock III): forward/backward state machines — this problem's state idea, grown up.",
    ],
    related: ["best-time-to-buy-and-sell-stock-ii", "maximum-subarray"],
    verify: {
      fn: "maxProfit",
      wrap: "plain",
      cases: [
        { args: [[7, 1, 5, 3, 6, 4]], expect: 5 },
        { args: [[7, 6, 4, 3, 1]], expect: 0 },
        { args: [[2, 4, 1]], expect: 2 },
      ],
    },
    xp: 10,
  },
  {
    slug: "longest-substring-without-repeating-characters",
    statement:
      "Given a string, find the length of the longest stretch of consecutive characters containing NO repeats. Every character inside the winning window must be distinct.",
    examples: [
      { input: 's = "abcabcbb"', output: "3", explanation: '"abc" — the answer is the length, not the substring.' },
      { input: 's = "bbbbb"', output: "1", explanation: '"b".' },
      { input: 's = "pwwkew"', output: "3", explanation: '"wke" — note "pwke" is a subsequence, not a substring.' },
    ],
    constraints: ["0 <= s.length <= 5·10^4", "s consists of printable ASCII"],
    breakdown: [
      "A window [start..i] is valid when it holds no repeated character. The naive re-check of validity per step (scanning the window) is O(n²); the fix is remembering, per character, WHERE it was last seen — then a repeat inside the window tells you exactly where the new start must jump to.",
      "The classic subtlety: when you meet a character whose last occurrence is BEFORE the current start, it is not actually inside the window — you must NOT move start backwards. Guard with last[ch] >= start, or equivalently move start with max(start, last[ch]+1). The string 'abba' is the canonical test: the second 'a' must not drag start back to 1.",
      "Why a window never needs to shrink one step at a time: validity is monotone in start — for a fixed right end, if [s..i] is valid then every [s'..i] with s' > s is too. That monotonicity is what makes two pointers linear.",
    ],
    edges: [
      "Empty string → 0.",
      "'abba' — the stale-last-seen trap.",
      "All unique → n; all same → 1.",
    ],
    ladder: [
      { title: "Brute force — all substrings", body: "For every (i, j) test uniqueness of s[i..j]. O(n³) naive, O(n²) with early exit; still too slow and structurally wasteful." },
      { title: "Sliding window with a set", body: "Grow r, shrink l one step at a time while the set contains s[r] (removing s[l] each step). O(n) amortized — each char enters and leaves once. Good answer; the jump version is faster in practice." },
      { title: "The optimal idea — last-seen index map", body: "Store char → last index. On a repeat INSIDE the window, jump start to last[ch]+1 directly — no step-by-step shrinking. One pass, O(min(n, alphabet)) space." },
    ],
    approach: "Window with last-seen index map and start jumps",
    code: `def lengthOfLongestSubstring(s):
    last = {}                # char → index of its most recent appearance
    start = 0                # window start (inclusive)
    best = 0
    for i, ch in enumerate(s):
        if ch in last and last[ch] >= start:
            start = last[ch] + 1     # jump past the previous copy
        last[ch] = i
        best = max(best, i - start + 1)
    return best`,
    walkthrough: [
      "After processing position i, the window [start..i] is the LONGEST valid window ending at i — the last-seen map guarantees no character appears twice inside it. The answer is the max of those per-end maxima.",
      "The 'last[ch] >= start' guard is the heart: only repeats INSIDE the window force a jump. A stale entry from before start is history — it doesn't constrain the current window at all ('abba' exercises exactly this).",
      "Each character does O(1) work: one dict write, at most one start jump. Linear time, alphabet-bounded space.",
    ],
    time: "O(n) — single pass, O(1) per character",
    space: "O(min(n, alphabet)) — one map entry per distinct char",
    followUps: [
      "Return the substring itself: track the argmax (start, length) alongside best.",
      "Up to k distinct characters allowed (Fruit Into Baskets / Longest Substring with At Most K Distinct): the window then shrinks on a count map instead of jumping.",
    ],
    related: ["longest-repeating-character-replacement", "minimum-window-substring", "permutation-in-string"],
    verify: {
      fn: "lengthOfLongestSubstring",
      wrap: "plain",
      cases: [
        { args: ["abcabcbb"], expect: 3 },
        { args: ["bbbbb"], expect: 1 },
        { args: ["pwwkew"], expect: 3 },
        { args: [""], expect: 0 },
        { args: ["abba"], expect: 2 },
        { args: ["dvdf"], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-repeating-character-replacement",
    statement:
      "You may change at most k characters of a string (any characters, any positions). Return the length of the longest stretch of one identical character achievable after at most k changes.",
    examples: [
      { input: 's = "ABAB", k = 2', output: "4", explanation: "Replace both Bs (or both As): AAAA / BBBB." },
      { input: 's = "AABABBA", k = 1', output: "4", explanation: '"ABBB" → "ABBB" needs one change (the first B stays, A→B) — the window ABBB with one replacement.' },
      { input: 's = "AAAA", k = 0', output: "4" },
    ],
    constraints: ["1 <= s.length <= 10^5", "0 <= k < s.length", "uppercase English letters"],
    breakdown: [
      "Reframe: find the longest window in which (window length) − (count of the window's most frequent character) ≤ k. That difference is exactly the number of characters you'd have to rewrite to make the whole window one letter. The problem becomes an invariant to maintain while the window slides.",
      "The engine is a count map plus the window's max frequency. Every time the invariant breaks, shrink from the left — one character at a time — until it holds again. The answer is the largest width the window ever achieved.",
      "A famous micro-optimisation: max frequency never needs to DECREASE when the window slides (a non-shrinking best is provably still achievable), so you can keep a single running max and only raise it — allowing the window to be non-strictly maintained and making the algorithm O(n) instead of O(26n). Both versions pass; the strict shrink version is easier to defend.",
    ],
    edges: [
      "k = 0 — pure longest run of one character.",
      "All-same string → n (max frequency covers the window).",
      "Uppercase-only alphabet (26) makes max(count.values()) cheap.",
    ],
    ladder: [
      { title: "Brute force — every window, recount", body: "For each (i, j) count frequencies and check length − max ≤ k. O(n²) with O(26) factor — 10^5 input is too slow." },
      { title: "Sliding window with strict shrink", body: "Grow right, update counts; while (len − maxfreq) > k, pop from the left. O(26n) because maxfreq is recomputed over the count map. Correct and clear." },
      { title: "The optimal idea — monotone best width", body: "The best window length never decreases, so the window can slide without ever shrinking below its best: keep a running max frequency that only grows. O(n) total; a great 'further optimisation' remark." },
    ],
    approach: "Count-map window with the length-minus-maxfreq invariant",
    code: `def characterReplacement(s, k):
    count = {}               # char → count inside the window
    best = 0
    l = 0
    for r, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        # invalid while rewrites needed exceed k
        while (r - l + 1) - max(count.values()) > k:
            count[s[l]] -= 1
            l += 1
        best = max(best, r - l + 1)
    return best`,
    walkthrough: [
      "After each right extension, the while loop restores the invariant: (window size) − (dominant count) ≤ k. That gap is precisely the count of minority characters — the number of replacements the window needs.",
      "Shrinking pops s[l] and advances l until the invariant holds again; then the window ending at r is the longest VALID window with that right end, so best is updated.",
      "max(count.values()) is O(26) because the alphabet is fixed — the whole loop is O(26n), effectively linear. The monotone-max optimisation removes the 26 factor entirely if the interviewer pushes.",
    ],
    time: "O(26·n) — effectively linear; O(n) with the monotone-max trick",
    space: "O(26) — the count map",
    followUps: [
      "Lowercase + uppercase mixed: same code, bigger alphabet constant.",
      "Longest substring with at most k distinct characters is the sibling invariant: len ≤ k distinct keys instead of the maxfreq gap.",
    ],
    related: ["longest-substring-without-repeating-characters", "minimum-window-substring"],
    verify: {
      fn: "characterReplacement",
      wrap: "plain",
      cases: [
        { args: ["ABAB", 2], expect: 4 },
        { args: ["AABABBA", 1], expect: 4 },
        { args: ["AAAA", 0], expect: 4 },
        { args: ["BAAAB", 2], expect: 5 },
      ],
    },
    xp: 20,
  },
  {
    slug: "permutation-in-string",
    statement:
      "Given two strings, report whether s2 contains a contiguous stretch that is a permutation of s1 — same characters, same multiplicities, in any order. (s1 can be longer than the whole of s2, in which case the answer is immediately false.)",
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: "true", explanation: '"ba" inside s2 is a permutation of "ab".' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: "false" },
      { input: 's1 = "adc", s2 = "dcda"', output: "true", explanation: '"cda" is a permutation of "adc".' },
    ],
    constraints: ["1 <= s1.length, s2.length <= 10^4", "lowercase English letters"],
    breakdown: [
      "A permutation of s1 is a multiset match: any window of s2 with length len(s1) whose character counts equal s1's counts exactly. So the algorithm is a FIXED-WIDTH sliding window with a count comparison per step.",
      "Comparing full count dicts per slide costs O(26) — total O(26·n), perfectly fine. The polished version maintains a single 'mismatch counter' (number of letters whose counts differ) so each slide is O(1); worth mentioning, rarely necessary.",
      "The clean trick that avoids two separate count maps: ONE map holding need − have. Add the incoming character (decrement), remove the outgoing (increment); the window matches exactly when the map has no positive entries — or track a 'deficit' integer that hits zero at each match point.",
    ],
    edges: [
      "len(s1) > len(s2) → false without scanning.",
      "Windows are exactly len(s1) wide — no growth phase, just slide.",
      "All-same-letter cases ('aa' in 'aaaa') hit on every window.",
    ],
    ladder: [
      { title: "Brute force — sort every window", body: "For each window of width len(s1), sort it and compare with sorted(s1). O(n · m log m) — simple, painfully redundant." },
      { title: "Fixed window, dict compare", body: "Slide a width-m window maintaining counts; compare the window's dict with s1's dict at each position. O(26n) — the standard answer." },
      { title: "The optimal idea — single diff map + deficit counter", body: "Track need-minus-have in one map and an integer deficit = total unmatched characters. Each slide is O(1); match when deficit == 0. Same asymptotics, tighter constants." },
    ],
    approach: "Fixed-width window with count maps",
    code: `def checkInclusion(s1, s2):
    n1, n2 = len(s1), len(s2)
    if n1 > n2:
        return False
    need = {}                       # s1's requirement
    for ch in s1:
        need[ch] = need.get(ch, 0) + 1
    have = {}                       # current window's counts
    for i, ch in enumerate(s2):
        have[ch] = have.get(ch, 0) + 1      # enter the window
        if i >= n1:                         # evict the char that left
            out = s2[i - n1]
            have[out] -= 1
            if have[out] == 0:
                del have[out]
        if have == need:                    # exact multiset match
            return True
    return False`,
    walkthrough: [
      "The window is always exactly n1 wide once the loop reaches index n1−1; before that it grows. Deleting zero-count keys keeps dict equality meaningful — {'a':0} == {} is False in Python, and forgetting the delete is the classic bug.",
      "have == need compares full multisets in O(26): every slide pays a constant. The deficit-counter optimisation reduces that to O(1) by counting letters whose counts differ — mention it as the follow-up refinement.",
      "Early exit on the first matching window — the answer is existence, not location, so nothing after the hit matters.",
    ],
    time: "O(26·n) — a constant-size dict compare per slide",
    space: "O(26) — two count maps",
    followUps: [
      "Return the starting index of the first match instead of a boolean — same loop, record i − n1 + 1.",
      "Find ALL anagram starts (Find All Anagrams in a String): collect every deficit-zero position.",
    ],
    related: ["minimum-window-substring", "longest-substring-without-repeating-characters"],
    verify: {
      fn: "checkInclusion",
      wrap: "plain",
      cases: [
        { args: ["ab", "eidbaooo"], expect: true },
        { args: ["ab", "eidboaoo"], expect: false },
        { args: ["adc", "dcda"], expect: true },
        { args: ["hello", "ooolleoooleh"], expect: false },
      ],
    },
    xp: 20,
  },
  {
    slug: "minimum-window-substring",
    statement:
      "Given strings s and t, return the shortest substring of s that contains every character of t — counting multiplicity (t = 'AAB' needs two As). Return the empty string if no such window exists. This is the canonical HARD sliding window; the guarantee is that a correct linear solution exists.",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"', explanation: "Every other covering window is longer." },
      { input: 's = "a", t = "a"', output: '"a"' },
      { input: 's = "a", t = "aa"', output: '""', explanation: "One 'a' can't cover two." },
    ],
    constraints: ["1 <= s.length, t.length <= 10^5", "s and t consist of uppercase and lowercase English letters"],
    breakdown: [
      "The shape is the classic EXPAND-CONTRACT cycle: grow the right edge until the window covers t (all counts satisfied, multiplicity included), then push the left edge as far as it will go while coverage holds, recording the window at its tightest. Then keep expanding from there. Every position enters and leaves the window at most once — O(n) overall despite the nested-looking loops.",
      "Coverage bookkeeping has a beautiful form: one need-map plus a single integer 'missing' = total characters still required (with multiplicity). A right-edge character that is still needed decrements missing; a left-edge character that is surplus (need goes negative) gets refunded. missing == 0 means covered; the shrink loop pops while the left char is surplus.",
      "The subtle-but-critical detail: DECREMENT need for every right character even when it's not in t (need goes negative for junk). Negative counts are the definition of surplus, and the shrink test need[s[l]] < 0 relies on it. Getting this asymmetry right is 90% of the problem.",
    ],
    edges: [
      "t longer than s → impossible → ''.",
      "Multiplicities: t = 'aa' vs s containing a single 'a'.",
      "Multiple minimal windows of equal length — any is accepted; the code records the first tightest.",
    ],
    ladder: [
      { title: "Brute force — check all substrings", body: "Every (i, j) window checked against t's counts: O(n² · 26) or worse. Unusable at 10^5." },
      { title: "Two count maps per step", body: "Slide with window-count map and compare against need-map per right step. O(26n) but the contract logic gets tangled; still a reasonable intermediate answer." },
      { title: "The optimal idea — missing counter + expand/contract", body: "need-map with negative-surplus semantics, one integer missing, two pointers. Expand until missing == 0, contract while left is surplus, record tightest. Strictly O(n + |t|)." },
    ],
    approach: "Expand–contract window with a missing counter",
    code: `def minWindow(s, t):
    need = {}
    for ch in t:
        need[ch] = need.get(ch, 0) + 1
    missing = len(t)         # characters still required (with multiplicity)
    l = 0
    best_len = float("inf")
    best_l = 0
    for r, ch in enumerate(s):
        if need.get(ch, 0) > 0:      # this char was genuinely missing
            missing -= 1
        need[ch] = need.get(ch, 0) - 1   # negatives = surplus
        if missing == 0:             # covered → tighten from the left
            while need.get(s[l], 0) < 0:     # left char is surplus
                need[s[l]] += 1
                l += 1
            if r - l + 1 < best_len:
                best_len = r - l + 1
                best_l = l
    return "" if best_len == float("inf") else s[best_l : best_l + best_len]`,
    walkthrough: [
      "Right edge: every character decrements its need count (junk goes negative — that's surplus), but only genuinely-needed characters decrement 'missing'. The first time missing hits 0, s[l..r] covers t.",
      "Left edge: while s[l] is surplus (negative need), pop it and refund. When the loop stops, s[l] is the last REQUIRED character — the window is minimal for this right end. Record it if it's the tightest so far.",
      "The loop then continues expanding; the next coverage will trigger another tighten. Each character is pushed once and popped once → linear. The recorded window is returned, or '' if missing never reached 0.",
    ],
    time: "O(n + |t|) — build need, then each index enters/leaves the window once",
    space: "O(alphabet) — the need map",
    followUps: [
      "Generalise the match predicate (e.g. cover a set of words — Minimum Window Subsequence is a different DP beast).",
      "Return ALL minimal windows of the best length: record every window at best_len during contraction.",
    ],
    related: ["permutation-in-string", "longest-repeating-character-replacement", "minimum-window-subsequence"],
    verify: {
      fn: "minWindow",
      wrap: "plain",
      cases: [
        { args: ["ADOBECODEBANC", "ABC"], expect: "BANC" },
        { args: ["a", "a"], expect: "a" },
        { args: ["a", "aa"], expect: "" },
        { args: ["aa", "aa"], expect: "aa" },
      ],
    },
    xp: 35,
  },
  {
    slug: "sliding-window-maximum",
    statement:
      "Given an integer array and a window size k, slide a window of width k from left to right one position at a time and return the MAXIMUM of each window as an array. The naive version is O(nk); a correct solution runs in O(n).",
    examples: [
      { input: "nums = [1,3,-1,-3,5,3,6,7], k = 3", output: "[3,3,5,5,6,7]", explanation: "Windows [1 3 -1] [3 -1 -3] [-1 -3 5] [-3 5 3] [5 3 6] [3 6 7]." },
      { input: "nums = [1], k = 1", output: "[1]" },
      { input: "nums = [9,8,7,6], k = 2", output: "[9,8,7]", explanation: "Falling prices — every window's max is its left edge." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "1 <= k <= nums.length"],
    breakdown: [
      "The heap solution is the easy upgrade: push (value, index), lazily pop entries whose index slid out, and the top is each window's max — O(n log n). Good, but the monotonic deque does better: O(n), because every element enters and leaves the deque at most once.",
      "The deque invariant: it holds INDICES of 'candidates' in decreasing value order. A new element n evicts from the BACK every index whose value ≤ n — those can never be a future max (n is bigger AND newer, it outlives them). The FRONT is always the current window's max; when the front's index slides out of the window, pop it from the front.",
      "Why this is linear: each index is appended once and popped at most once across the entire run. The eviction rule does the 'sorting' work incrementally — it's a monotonic queue, the same tool behind Largest Rectangle in Histogram and Daily Temperatures.",
    ],
    edges: [
      "k = 1 — the answer is the array itself (front evicted every step).",
      "Equal values: '<=' eviction (as written) keeps the newest index of ties — either policy works; consistency matters.",
      "Falling sequences fill the deque; rising sequences keep it at size 1.",
    ],
    ladder: [
      { title: "Brute force — max per window", body: "For each of the n−k+1 windows scan k elements. O(nk) — 10^5 × 10^5 worst case is fatal." },
      { title: "Heap with lazy deletion", body: "Max-heap of (value, index); before reading the top, pop entries with index ≤ i − k. O(n log n) — a solid answer, but the log factor is avoidable." },
      { title: "The optimal idea — monotonic decreasing deque", body: "Deque of indices, values decreasing; back-evict on smaller-or-equal values, front-evict on window exit. O(n) time, O(k) space." },
    ],
    approach: "Monotonic deque of indices",
    code: `from collections import deque

def maxSlidingWindow(nums, k):
    dq = deque()             # indices; their values strictly decreasing
    out = []
    for i, n in enumerate(nums):
        while dq and nums[dq[-1]] <= n:
            dq.pop()         # back-evict: smaller values can't win again
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()     # front slid out of the window
        if i >= k - 1:
            out.append(nums[dq[0]])
    return out`,
    walkthrough: [
      "Back-eviction preserves the decreasing invariant: after append, every value in the deque is > the new one... (with <= eviction, > becomes 'strictly greater except ties keep newest'), and therefore the FRONT is the maximum of everything still alive.",
      "The front-expiry check runs at most once per step (the front can only be one index behind), but writing it as 'if' rather than 'while' is safe precisely because eviction happens every step — a 'while' is the defensive version.",
      "Output starts once the first full window exists (i ≥ k−1). Total appends = n, total pops ≤ n → O(n) time, O(k) space.",
    ],
    time: "O(n) — each index enters and leaves the deque once",
    space: "O(k) — the deque",
    followUps: [
      "Sliding window MINIMUM: flip the comparison — the same deque, mirrored.",
      "Sliding window median/mean: median needs a two-heap structure; mean is a running sum.",
    ],
    related: ["daily-temperatures", "largest-rectangle-in-histogram", "k-closest-points-to-origin"],
    verify: {
      fn: "maxSlidingWindow",
      wrap: "plain",
      cases: [
        { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expect: [3, 3, 5, 5, 6, 7] },
        { args: [[1], 1], expect: [1] },
        { args: [[9, 8, 7, 6], 2], expect: [9, 8, 7] },
        { args: [[1, 3, 1, 2, 0, 5], 3], expect: [3, 3, 2, 5] },
      ],
    },
    xp: 35,
  },
];
