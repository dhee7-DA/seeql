// Deep-dives — 1-D Dynamic Programming (NeetCode 150 section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const DP_1D: LcDeepDive[] = [
  {
    slug: "climbing-stairs",
    statement:
      "You are climbing a staircase with n steps above you, and each move takes you up one or two steps. In how many distinct sequences of moves can you reach the top? Two sequences differ if they split the climb differently anywhere — 1+2 and 2+1 are different routes.",
    examples: [
      { input: "n = 2", output: "2", explanation: "1+1, or one 2-step." },
      { input: "n = 3", output: "3", explanation: "1+1+1, 1+2, 2+1." },
      { input: "n = 5", output: "8" },
    ],
    constraints: ["1 <= n <= 45", "the answer is guaranteed to fit in a 32-bit integer"],
    breakdown: [
      "Think backwards from the top: your final move landed on step n either from step n−1 (a 1-step) or from step n−2 (a 2-step), and no other option exists. Define ways(i) = the number of distinct move sequences that land exactly on step i. Every sequence into i ends in one of exactly two moves, and the two families are disjoint, so ways(i) = ways(i−1) + ways(i−2) — the Fibonacci recurrence wearing a staircase costume.",
      "The naive misstep is enumerating routes with recursion and no memory: the call tree recomputes ways(i) exponentially many times, and at n = 45 that is billions of calls for a 45-number answer. This is a counting problem, not an optimisation problem — the aggregator is a sum, there is no max to take, and that is exactly why the recurrence is so clean.",
      "Greedy thinking has no foothold here at all: there is no 'best' move to make, only distinct paths to tally. The moment you recognise the last-move decomposition, the problem collapses to computing one linear recurrence — and the only remaining question is whether you can do it without an array.",
    ],
    edges: [
      "n = 1 gives 1 and n = 2 gives 2 — the seeds of the recurrence; get either wrong and every later value shifts.",
      "Order matters: 1+2 and 2+1 are different sequences. This counts compositions, not multisets of step sizes.",
      "n = 45 is the contractual ceiling precisely because ways(45) = 1,836,311,903 still fits in 32 bits — beyond it you would need 64-bit or big integers.",
    ],
    ladder: [
      { title: "Brute force — recursion over the last move", body: "climb(n) = climb(n−1) + climb(n−2) with bases climb(1)=1, climb(2)=2. Faithful to the recurrence, but the call tree is O(2^n); n = 45 means ~3.5·10^13 calls. Dead on arrival." },
      { title: "Memoize or tabulate", body: "Cache each ways(i) — top-down with a dict or bottom-up with an array of size n+1. Each value is computed once from two earlier ones: O(n) time, O(n) space." },
      { title: "The optimal idea — a rolling pair", body: "ways(i) only ever looks at the previous two values, so keep exactly those in two variables and slide the window up the staircase. O(n) time, O(1) space — the whole solution is four lines." },
    ],
    approach: "Fibonacci rolling pair",
    code: `def climbStairs(n):
    if n <= 2:
        return n                    # seeds: ways(1)=1, ways(2)=2
    prev, cur = 1, 2                # ways(i-2), ways(i-1)
    for _ in range(3, n + 1):
        prev, cur = cur, prev + cur # ways(i) = ways(i-1) + ways(i-2)
    return cur`,
    walkthrough: [
      "The recurrence partitions sequences by their final move: sequences ending in a 1-step (there are ways(i−1) of them — take any route to i−1 and append the step) and sequences ending in a 2-step (ways(i−2)). The partition is exhaustive and disjoint, so the sum is exact — no double counting, no gaps.",
      "Trace n = 5: the rolling pair walks 1, 2 → 2, 3 → 3, 5 → 5, 8, and the answer is 8. The eight routes are the compositions of 5 into 1s and 2s: 11111, the four arrangements of 2+1+1+1, and the three arrangements of 2+2+1 — 1+4+3 = 8, a nice way to check the DP by hand.",
      "Base cases live before the loop: n ≤ 2 returns directly, and the loop starts at i = 3 with prev=1, cur=2 already in place. The tuple assignment 'prev, cur = cur, prev + cur' updates both slots from the OLD values — write it as two separate statements without a temp and you have silently corrupted the recurrence.",
    ],
    time: "O(n) — one loop up the staircase",
    space: "O(1) — two rolling variables",
    followUps: [
      "What if some steps are out of service? Keep the same recurrence but force ways(i) = 0 at a broken step — both branches into it simply die.",
      "Generalise to climbs of up to k steps: ways(i) = ways(i−1) + … + ways(i−k), maintainable in O(n) with a running window sum instead of re-summing k terms.",
    ],
    related: ["min-cost-climbing-stairs", "n-th-tribonacci-number"],
    verify: {
      fn: "climbStairs",
      wrap: "plain",
      cases: [
        { args: [2], expect: 2 },
        { args: [3], expect: 3 },
        { args: [1], expect: 1 },
        { args: [5], expect: 8 },
        { args: [45], expect: 1836311903 },
      ],
    },
    xp: 10,
  },
  {
    slug: "house-robber",
    statement:
      "You are working down a street of houses; nums[i] is the take from house i. The alarm system trips if you hit two ADJACENT houses on the same night. Choose which houses to rob so the total loot is maximised under that no-two-neighbours rule.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob houses 0 and 2: 1 + 3." },
      { input: "nums = [2,7,9,3,1]", output: "12", explanation: "Rob houses 0, 2 and 4: 2 + 9 + 1." },
      { input: "nums = [2,1,1,2]", output: "4", explanation: "The interesting one — houses 0 and 3, skipping BOTH middles; either alternating pattern only reaches 3." },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 400"],
    breakdown: [
      "Define best(i) = the maximum loot obtainable considering only houses 0..i. House i offers a binary choice: rob it (collect nums[i], but then house i−1 is banned, so add best(i−2)) or skip it (keep best(i−1)). The transition best(i) = max(best(i−1), best(i−2) + nums[i]) is the entire algorithm — a two-way branch resolved with one max.",
      "This is the canonical 'adjacent constraint' DP, and it is worth seeing why greedy fails. Taking every other house (the two alternating patterns) yields only 3 on [2,1,1,2], while the optimum 2+2 skips two middles; grabbing the currently richest house is no better, since a cheap house can be the bridge that unlocks two rich ones. Greedy commits before seeing the future; the max in the transition defers that commitment to the DP.",
      "The final observation is that best(i) reads exactly two earlier values, so the dp array is scaffolding: two rolling variables carry the same information. The 'rob nothing' option is baked in because best starts at 0 — an empty plan is a legal (if embarrassing) outcome.",
    ],
    edges: [
      "A single house returns its own value; there is no neighbour to conflict with.",
      "All-zero loot ([0,0,0] → 0) is in-contract and correct — the max keeps the empty plan alive.",
      "An empty street is outside LeetCode's constraints, but the rolling code returns 0 for it anyway — nice defensive totality.",
      "Locally rich prefixes can be traps: the optimum may skip a big house to pair two moderate ones.",
    ],
    ladder: [
      { title: "Brute force — rob or skip, recursively", body: "rob(i) = max(rob(i−1), rob(i−2) + nums[i]). Exponential: the two branches overlap wildly and re-solve the same suffixes ~2^n times." },
      { title: "Memoize / tabulate", body: "One dp array filled left to right from the two previous entries. O(n) time, O(n) space, and the recursion tree collapses to a single pass." },
      { title: "The optimal idea — rolling pair", body: "Keep (best(i−2), best(i−1)) in two scalars, one tuple-swap per house. O(n) time, O(1) space; the array version is only needed if you must reconstruct WHICH houses were robbed." },
    ],
    approach: "Rolling-pair rob-or-skip DP",
    code: `def rob(nums):
    prev, cur = 0, 0                # best(i-2), best(i-1); empty street = 0
    for money in nums:
        # rob house i: prev + money   |   skip house i: keep cur
        prev, cur = cur, max(cur, prev + money)
    return cur                      # best over the whole street`,
    walkthrough: [
      "Invariant: after processing k houses, cur = best(k−1) and prev = best(k−2), with the zero seeds standing in for the fictional houses −1 and −2. The transition is the max of 'skip' (cur survives unchanged) and 'rob' (prev + money — the banned neighbour's share is excluded by construction).",
      "Trace [2,7,9,3,1]: (0,0) → (0,2) → (2,7) → (7,11) → (11,11) → (11,12). Watch the 9 step: prev=2, so robbing gives 2+9=11, beating the skip value 7 — that is the 2+9+1 plan forming. The final 1 rides on prev=11 to make 12.",
      "Base cases are the two zeros: before any house, the best plan is the empty plan worth 0, and that value also guarantees 'rob house 0' (0 + nums[0]) is available on the first iteration. The tuple assignment matters for the same reason as in climbing stairs — both right-hand sides must read the old pair.",
    ],
    time: "O(n) — one pass down the street",
    space: "O(1) — two rolling variables",
    followUps: [
      "Make the street circular and houses 0 and n−1 become neighbours — that is House Robber II, solved by two linear passes on the two legal slices.",
      "Reconstruct the plan: keep the dp array and walk backwards — if best(i) came from best(i−2) + nums[i], house i was robbed; otherwise it was skipped.",
    ],
    related: ["house-robber-ii", "delete-and-earn"],
    verify: {
      fn: "rob",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 1]], expect: 4 },
        { args: [[2, 7, 9, 3, 1]], expect: 12 },
        { args: [[2, 1, 1, 2]], expect: 4 },
        { args: [[5]], expect: 5 },
        { args: [[0, 0, 0]], expect: 0 },
        { args: [[]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "house-robber-ii",
    statement:
      "Same burglary, worse geometry: the houses stand in a CIRCLE, so the first and last houses are also neighbours. The no-two-adjacent-houses rule now wraps around the block; maximise the take.",
    examples: [
      { input: "nums = [2,3,2]", output: "3", explanation: "Robbing both 2s is illegal now — they are neighbours through the wrap-around seam." },
      { input: "nums = [1,2,3,1]", output: "4", explanation: "Rob houses 0 and 2: 1 + 3; house 3 cannot join because it is adjacent to house 0 through the seam." },
      { input: "nums = [200,3,140,20,10]", output: "340", explanation: "The seam rule forbids robbing 200 together with 10; 200 + 140 works." },
    ],
    constraints: ["1 <= nums.length <= 100", "0 <= nums[i] <= 1000"],
    breakdown: [
      "The circle adds exactly one constraint to the linear problem: houses 0 and n−1 may not both be robbed. That suggests a decomposition — every legal plan either skips house 0 or skips house n−1 (or skips both), because robbing both is precisely what is forbidden. So: answer = max(linear rob on houses 1..n−1, linear rob on houses 0..n−2).",
      "Why does one max over two cases suffice, with no case missed? Take any optimal circular plan. If it robs house n−1, it cannot rob house 0, so it lives entirely inside the slice 1..n−1 and is a candidate of case one. If it robs house 0, symmetrically it lives in 0..n−2 (case two). If it robs neither end, it lives in BOTH slices. The optimum is therefore always inside at least one case — and conversely, each slice's optimum is automatically circle-legal, since within a slice the line-adjacency coincides with circle-adjacency (the only extra circle edge is the 0↔n−1 seam, and one of those two houses is missing from every slice).",
      "That argument is worth internalising: 'cut the ring at the seam and run the linear DP twice' is a general trick for circular array constraints. It costs two O(n) passes and reuses house-robber unchanged — no special-casing inside the DP, no adjacency matrix, no circular bookkeeping.",
    ],
    edges: [
      "A single house has no neighbours at all — return nums[0] directly (the slice trick would return 0 on empty slices).",
      "Two houses: each is the other's neighbour twice over; the answer is the richer one — which the two slices produce naturally.",
      "Three houses: every pair is adjacent in a 3-cycle, so the answer must be the richest single house. Check [1,2,3] → 3: the slices [2,3] and [1,2] both cap at 3.",
      "Forgetting the seam (robbing both ends) is THE bug this problem exists to catch — [2,1,1,2] is a minimal repro: linear DP says 4, the circle only allows 3.",
    ],
    ladder: [
      { title: "Brute force — subsets with circular checks", body: "Enumerate all 2^n subsets of houses and test circular adjacency per subset. Hopeless past n ≈ 25 and conceptually clumsy — the wrap-around edge makes the 'alternate houses' shortcuts of the linear version unusable." },
      { title: "Two linear DP passes", body: "Run the house-robber tabulation twice, once per slice, taking the max. O(n) time, O(n) space with arrays or memo dicts — the clearest way to express the case split." },
      { title: "The optimal idea — rolling pairs inside the two cases", body: "The linear solver needs only two scalars, so each pass is O(1) extra space. Total O(n) time, O(1) space (modulo the slice copies — pass index ranges if that matters)." },
    ],
    approach: "Two linear passes on the broken ring",
    code: `def rob(nums):
    if len(nums) == 1:
        return nums[0]              # one house: no neighbour to fight

    def line(houses):               # house-robber on a straight street
        prev, cur = 0, 0
        for money in houses:
            prev, cur = cur, max(cur, prev + money)
        return cur

    # drop the first house OR the last: one of the two must hold the optimum
    return max(line(nums[1:]), line(nums[:-1]))`,
    walkthrough: [
      "The two-case decomposition is the proof and the code at once: any plan robbing the last house skips the first (case nums[1:]), any plan robbing the first skips the last (case nums[:-1]), and plans robbing neither appear in both. Since each slice's optimum is circle-legal, the max of the two is the circle's optimum.",
      "Trace [2,3,2]: the slice without the first house is [3,2] → 3; the slice without the last is [2,3] → 3; answer 3 — robbing both 2s would score 4, but they shake hands through the seam. On [1,2,3,1] the slices are [2,3,1] → 3 and [1,2,3] → 4, so the answer 4 comes from robbing houses 0 and 2.",
      "Base-case behaviour: the n = 1 guard exists because both slices would be empty (best plan 0) and would lose the lone house. For n = 2 the slices are single houses and the max picks the richer — the code never needs the 'two houses are mutually adjacent' observation spelled out, the algebra does it for free.",
    ],
    time: "O(n) — two linear passes",
    space: "O(1) extra per pass — the slices themselves are O(n) copies; index windows avoid even that",
    followUps: [
      "Return the actual house set: run each slice with a dp array and parent pointers, rebuild both plans, and keep the better one.",
      "House Robber III hangs the same no-two-adjacent rule on a binary tree — the DP moves onto subtrees (take node + grandchildren, or the children) with the same rob-or-skip flavour.",
    ],
    related: ["house-robber", "house-robber-iii"],
    verify: {
      fn: "rob",
      wrap: "plain",
      cases: [
        { args: [[2, 3, 2]], expect: 3 },
        { args: [[1, 2, 3, 1]], expect: 4 },
        { args: [[1, 2, 3]], expect: 3 },
        { args: [[200, 3, 140, 20, 10]], expect: 340 },
        { args: [[5]], expect: 5 },
        { args: [[2, 1, 1, 2]], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-palindromic-substring",
    statement:
      "Given a string s, return its longest substring that reads identically forwards and backwards. Multiple longest answers may exist; when they do, any is acceptable on LeetCode — our cases either have a unique winner or are graded against the LEFTMOST one, which expand-around-centre returns by keeping its first best.",
    examples: [
      { input: 's = "babad"', output: '"bab"', explanation: "'aba' is equally long; this case is graded with the LEFTMOST tiebreak, which centre-expansion produces by updating the best only on strict improvement." },
      { input: 's = "cbbd"', output: '"bb"', explanation: "A unique winner — note it is even-length, centred on the gap between the two b's." },
      { input: 's = "forgeeksskeegfor"', output: '"geeksskeeg"', explanation: "Unique, even-length, and the whole point of the string." },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists of English letters and digits"],
    breakdown: [
      "Every palindrome is symmetric about a centre — either a single character (odd length) or the gap between two characters (even length). A string of length n has exactly 2n−1 such centres. For each, expand outwards while the mirrored characters match; the widest window seen is the answer. That is O(n²) worst case with O(1) space and no table to fill.",
      "The classic alternative is the 2-D table dp[i][j] = 's[i..j] is a palindrome', filled by increasing length via dp[i][j] = (s[i]==s[j]) and dp[i+1][j−1]. Same O(n²) time but O(n²) space — the centre expansion is the same fact turned inside out: instead of testing every substring, generate palindromes from where they are born. You also get the answer's indices for free, which the table version must recover separately.",
      "Ties need a stated rule to be gradeable: 'babad' holds both 'bab' and 'aba'. Scanning centres left to right and updating the best only on STRICT improvement returns the leftmost-starting winner — for equal lengths, centre order matches start order (both odd, or both even), so the first maximal palindrome found is the left one. Manacher's algorithm reaches O(n) but is a specialist tool; interviews ask for the expansion.",
    ],
    edges: [
      "The whole string is a palindrome — the centre at the middle expands to full width and returns s itself.",
      "All characters distinct: the answer is some single character, and the strict-> rule returns s[0] (the leftmost).",
      "Even-length palindromes live on centre GAPS — iterating only (i, i) centres misses 'bb' in 'cbbd', the classic submission bug.",
      "Length-1 strings: every centre degenerates gracefully; the initial best (0, 1) already holds the answer.",
    ],
    ladder: [
      { title: "Brute force — test every substring", body: "All O(n²) substrings, each palindrome check O(n): O(n³). Fails on n = 1000 in the worst case and teaches nothing." },
      { title: "DP table over (i, j)", body: "dp[i][j] = (s[i]==s[j]) && dp[i+1][j−1], filled by substring length; track the longest true cell. O(n²) time AND O(n²) space — correct, table-shaped, and memory-hungry." },
      { title: "The optimal idea — expand around all 2n−1 centres", body: "O(n²) time worst case (an all-'a' string) but O(1) space, with a deterministic leftmost tiebreak via strict >. (Manacher's algorithm gets O(n) by reusing symmetry around the rightmost palindrome border — worth knowing, rarely demanded.)" },
    ],
    approach: "Expand around 2n−1 centres",
    code: `def longestPalindrome(s):
    best_start, best_len = 0, 1         # any single character is a palindrome
    for i in range(len(s)):
        for l, r in ((i, i), (i, i + 1)):   # odd centre i, even gap (i, i+1)
            while l >= 0 and r < len(s) and s[l] == s[r]:
                l -= 1
                r += 1
            l += 1                          # step back inside the last match
            r -= 1
            if r - l + 1 > best_len:        # STRICT > keeps the leftmost winner
                best_start, best_len = l, r - l + 1
    return s[best_start : best_start + best_len]`,
    walkthrough: [
      "Each centre contributes at most one maximal palindrome: the while loop pushes l and r out until they mismatch or hit a wall, then the two increments retreat to the last valid window. The even centre (i, i+1) on mismatching characters simply fails to expand and reports width 0 — harmless, because single characters are already covered by the odd centres and the initial best.",
      "Trace 'cbbd': the odd centres all give width 1; the even gap (1, 2) matches b==b, then tries (0, 3) — c vs d — and stops, reporting the window [1, 2] of width 2. That beats the standing width-1 best and the answer is 'bb'. On 'babad' the odd centre 1 expands to [0, 2] ('bab', width 3); the later centre 2 also reaches width 3 ('aba') but 3 > 3 is false, so the leftmost palindrome is kept — the tiebreak is the strict comparison, nothing more.",
      "Base cases: best_len starts at 1 because a non-empty string always contains a length-1 palindrome, and every centre still runs so even-width winners can surface. Worst case ('aaaa…a') expands every centre to full width — O(n²) — but the constant per step is a single comparison, so n = 1000 sails through.",
    ],
    time: "O(n²) — each of the 2n−1 centres expands at most ~n/2 steps",
    space: "O(1) — two indices describe the answer",
    followUps: [
      "Manacher's algorithm: maintain a radius array and mirror previously computed radii around the current rightmost palindrome border to reach O(n). Elegant, fiddly, and almost never a hard requirement.",
      "Longest palindromic SUBSEQUENCE is a different beast — order-preserving deletion instead of contiguity — and needs 2-D interval DP, not centres.",
    ],
    related: ["palindromic-substrings", "shortest-palindrome"],
    verify: {
      fn: "longestPalindrome",
      wrap: "plain",
      cases: [
        { args: ["babad"], expect: "bab" },
        { args: ["cbbd"], expect: "bb" },
        { args: ["forgeeksskeegfor"], expect: "geeksskeeg" },
        { args: ["a"], expect: "a" },
        { args: ["abcd"], expect: "a" },
        { args: ["bb"], expect: "bb" },
      ],
    },
    xp: 20,
  },
  {
    slug: "palindromic-substrings",
    statement:
      "Count the substrings of s that are palindromes. Substrings are identified by position, so equal text at different positions counts separately — 'aaa' contains 'aa' twice.",
    examples: [
      { input: 's = "abc"', output: "3", explanation: "a, b, c." },
      { input: 's = "aaa"', output: "6", explanation: "a, a, a, aa, aa, aaa." },
      { input: 's = "racecar"', output: "10", explanation: "Seven singles, plus cec, aceca, racecar." },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists of lowercase English letters"],
    breakdown: [
      "This is the centre-expansion machinery of longest-palindromic-substring with the bookkeeping inverted: instead of remembering the widest window, COUNT every successful expansion step. Each matched (l, r) pair inside the while loop is exactly one palindromic substring — the radius-k window about that centre — and distinct centres produce distinct substrings, so nothing is double counted.",
      "The enumeration alternative tests all O(n²) substrings with an O(n) palindrome check each: O(n³). The DP table (dp[i][j] = s[i]==s[j] and dp[i+1][j−1], count the true cells) does O(n²) work but drags an O(n²) table. Centre expansion keeps the O(n²) time and drops the memory to O(1) — same asymptotics as the table, a hundredth of the state.",
      "One subtlety deserves saying out loud: a palindrome's (centre, radius) pair uniquely determines the substring, and every palindromic substring has exactly one such pair — odd-length ones centre on a character, even-length ones on a gap. That bijection is why 'count expansion steps' counts each palindrome exactly once, and why you need all 2n−1 centres, not just the n character-centres.",
    ],
    edges: [
      "All characters equal ('aaa') is the maximum-density case: n(n+1)/2 palindromes — every substring qualifies.",
      "All distinct gives exactly n palindromes (the singles).",
      "A single character returns 1.",
      "Even-length palindromes need the (i, i+1) gap centres; skipping them undercounts 'abba' by 2 ('bb' and 'abba').",
    ],
    ladder: [
      { title: "Brute force — test every substring", body: "Check all O(n²) substrings at O(n) each: O(n³). Simple, symmetric, and slowest exactly when the input is repetitive." },
      { title: "DP table", body: "dp[i][j] marks s[i..j] palindromic, filled by increasing length; count true cells. O(n²) time and space — the same table longest-palindromic-substring would build." },
      { title: "The optimal idea — count during expansion", body: "Walk 2n−1 centres, add 1 per matched layer. O(n²) worst case (all-equal strings), O(1) space, and near-O(n) on inputs where characters rarely match." },
    ],
    approach: "Count during centre expansion",
    code: `def countSubstrings(s):
    n = len(s)
    count = 0
    for c in range(n):
        for l, r in ((c, c), (c, c + 1)):   # odd centre, even gap
            while l >= 0 and r < n and s[l] == s[r]:
                count += 1                  # one matched layer = one palindrome
                l -= 1
                r += 1
    return count`,
    walkthrough: [
      "The loop structure mirrors longest-palindromic-substring exactly — 2n−1 seeds, expand while the ends match — but the body's only job is count += 1. The k-th successful iteration for a given centre is the width-(2k−1) or 2k palindrome about it, so each centre contributes 1, 2, 3, … for as long as its expansion lives.",
      "Trace 'aaa': centre 0 odd counts 'a'; centre 0 even counts 'aa' (then l = −1 stops it); centre 1 odd counts 'a' and then 'aaa'; centre 1 even counts 'aa'; centre 2 odd counts 'a'; the last gap falls off the end. Total 1+1+2+1+1 = 6 — and n(n+1)/2 = 6 confirms it independently.",
      "Base behaviour: single characters are counted by the odd centres on their first while-iteration, so no special seed is needed; an empty string (out of contract) would return 0 because the loop never runs. Worst-case cost hits on all-equal strings, where every centre expands to a wall — O(n²) with trivial constants.",
    ],
    time: "O(n²) worst case (all-equal string); far less when characters rarely match",
    space: "O(1) — a single counter",
    followUps: [
      "Count DISTINCT palindromic substrings instead: a palindromic tree (Eertree) does it in O(n) — each new distinct palindrome is created at exactly one expansion event.",
      "Manacher's radius array encodes every centre's maximal radius in O(n); the total count is a simple sum derived from those radii.",
    ],
    related: ["longest-palindromic-substring", "longest-palindromic-subsequence"],
    verify: {
      fn: "countSubstrings",
      wrap: "plain",
      cases: [
        { args: ["abc"], expect: 3 },
        { args: ["aaa"], expect: 6 },
        { args: ["a"], expect: 1 },
        { args: ["racecar"], expect: 10 },
        { args: ["abba"], expect: 6 },
      ],
    },
    xp: 20,
  },
  {
    slug: "decode-ways",
    statement:
      "Letters A–Z were encoded as the numbers 1–26. Given a string of digits, count how many ways it can be split into valid codes and mapped back to letters. Not every digit string decodes — '06' is not '6', and a leading zero leaves the pair invalid.",
    examples: [
      { input: 's = "12"', output: "2", explanation: "'AB' (1|2) or 'L' (12)." },
      { input: 's = "226"', output: "3", explanation: "'BBF' (2|2|6), 'VF' (22|6), 'BZ' (2|26)." },
      { input: 's = "06"', output: "0", explanation: "'0' is not a code and '06' is not '6' — the string is undecodable." },
    ],
    constraints: ["1 <= s.length <= 100", "s consists of digits only"],
    breakdown: [
      "Count decodings of prefixes: dp[i] = the number of ways to decode s[:i], with the empty prefix dp[0] = 1 — the identity that says 'decode nothing, one way'. The last piece of any decoding of s[:i] is either the single digit s[i−1] (legal iff it is not '0', contributing dp[i−1]) or the two-digit window s[i−2..i−1] (legal iff it reads 10..26, contributing dp[i−2]). So dp[i] = [s[i−1] ≠ '0']·dp[i−1] + [10 ≤ int(s[i−2:i]) ≤ 26]·dp[i−2].",
      "The zero rules are the whole difficulty. A '0' can never stand alone — it survives only glued to a preceding 1 or 2 as 10 or 20. Both ends of the 10..26 window matter: '06' fails the low bound (it is not six), '27' fails the high bound (there is no 27th letter), and '30' fails both branches, giving dp = 0 — a dead end no later cleverness can revive, because decodings are consumed strictly left to right.",
      "Recognise the shape and you recognise the family: when both branches are usually alive this is a weighted Fibonacci — '1111…' decodes exactly like climbing stairs. The early exit (return 0 the moment dp[i] hits 0) is optional but honest: once a prefix is undecodable, every extension of it is too.",
    ],
    edges: [
      "'0' → 0 and '06' → 0: leading zeros are the headline trap.",
      "'10' → 1 (only 10|), '101' → 1 (10|1), '110' → 1 (1|10): zeros halve the branching rather than kill it.",
      "'100' → 0 — the second zero has neither a single-digit escape nor a valid pair.",
      "'27' → 1: the pair branch dies but single digits carry on.",
    ],
    ladder: [
      { title: "Brute recursion", body: "decode(i) = decode(i+1)·[s[i] ≠ '0'] + decode(i+2)·[window legal]. Correct, but on '1111…1' the two branches nearly double every position: exponential." },
      { title: "Memoize / tabulate", body: "dp over prefix lengths, O(n) time and O(n) space. The tabulated version fills left to right, which matches how decodings consume the string." },
      { title: "The optimal idea — rolling pair", body: "dp[i] reads only dp[i−1] and dp[i−2], so two scalars suffice. O(n) time, O(1) space — with the zero-branch guards as the only real logic." },
    ],
    approach: "Prefix-count DP with a two-digit window",
    code: `def numDecodings(s):
    if s[0] == "0":                 # a leading zero decodes to nothing
        return 0
    prev2, prev1 = 1, 1             # dp[i-2], dp[i-1]; dp[0] = dp[1] = 1 here
    for i in range(1, len(s)):
        cur = 0
        if s[i] != "0":             # branch 1: s[i] stands alone
            cur += prev1
        if 10 <= int(s[i - 1 : i + 1]) <= 26:   # branch 2: pair with the neighbour
            cur += prev2
        if cur == 0:                # e.g. "30", "00": dead end, propagate no more
            return 0
        prev2, prev1 = prev1, cur
    return prev1`,
    walkthrough: [
      "The recurrence decomposes decodings by their LAST code: a 1-digit tail is legal iff s[i−1] ≠ '0'; a 2-digit tail is legal iff the window sits in 10..26 — both bounds load-bearing, '06' below and '27' above. Each legal tail inherits the dp of the prefix before it, and the two tail lengths are disjoint, so the sum is exact.",
      "Trace '226': start prev2=prev1=1. i=1 ('2'): the single branch adds 1; the window '22' is in range and adds another 1 → dp=2 ('BB', 'V'). i=2 ('6'): singles add 2; window '26' is in range and adds prev2=1 → 3 ('BBF', 'VF', 'BZ'). Now trace '10' for the zero: i=1 ('0') gets nothing from singles; the window '10' contributes prev2=1 → 1 — the dp[0]=1 seed is exactly what lets the '0' ride on the 1.",
      "Base cases: dp[0] = 1 is the empty-decoding identity; dp[1] = 1 because the leading-zero guard has already bounced the bad case. The cur == 0 early exit turns '30'-style dead ends into an immediate 0 instead of letting zeros march to the end — same answer, less arithmetic, clearer story.",
    ],
    time: "O(n) — constant work per digit",
    space: "O(1) — two rolling counts",
    followUps: [
      "Decode Ways II adds '*' wildcards: each wildcard multiplies a branch by 9 (and pair windows get their own factors, e.g. 15 for '**') — the same skeleton with multiplication replacing the +1 choices.",
      "Want an actual decoding or all of them? Keep parent pointers (which branches were legal at each i) and walk back — the count is the number of root-to-start paths through that dag.",
    ],
    related: ["climbing-stairs", "restore-ip-addresses"],
    verify: {
      fn: "numDecodings",
      wrap: "plain",
      cases: [
        { args: ["12"], expect: 2 },
        { args: ["226"], expect: 3 },
        { args: ["06"], expect: 0 },
        { args: ["0"], expect: 0 },
        { args: ["10"], expect: 1 },
        { args: ["2101"], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "coin-change",
    statement:
      "You have coins of the given denominations, an unlimited supply of each, and a target amount. Return the fewest number of coins that sums to exactly amount, or −1 if no combination does. amount = 0 needs zero coins.",
    examples: [
      { input: "coins = [1,2,5], amount = 11", output: "3", explanation: "5 + 5 + 1." },
      { input: "coins = [2], amount = 3", output: "-1", explanation: "Odd amounts are unreachable from 2s." },
      { input: "coins = [1,3,4], amount = 6", output: "2", explanation: "3 + 3. Greedy takes 4+1+1 = 3 coins — the classic counterexample." },
    ],
    constraints: ["1 <= coins.length <= 12", "1 <= coins[i] <= 2^31 - 1", "0 <= amount <= 10^4"],
    breakdown: [
      "Define dp[a] = the fewest coins summing to exactly a, seeded with dp[0] = 0 (the empty handful) and ∞ for 'not yet reachable'. The last coin of any optimal handful for a is some c, so dp[a] = 1 + min over c ≤ a of dp[a − c] — an unbounded knapsack where the aggregator is min instead of max and 'weight' and 'value' share one axis.",
      "Greedy — always grab the biggest coin that fits — fails on non-canonical systems, and [1,3,4] with amount 6 is the minimal counterexample: 4+1+1 uses 3 coins while 3+3 uses 2. Greedy is correct only for special denomination sets (like USD); for arbitrary coins there is no local signal telling you when 'biggest now' ruins the remainder. The DP sidesteps the question entirely by trying every possible last coin and letting the min decide.",
      "Two implementation notes that matter in interviews. First, the sentinel: INF = amount + 1 can never be a real answer (any handful uses at most amount coins, each ≥ 1), so comparisons stay safe without None-checks. Second, the same recurrence read as a graph is BFS on remainders — amounts are nodes, coins are edges — which is why a BFS formulation finds the same shortest path.",
    ],
    edges: [
      "amount = 0 → 0: the empty handful, returned before the loop does any work.",
      "Impossible targets ([2], 3) must survive as INF to the end and convert to −1 — never return a half-built sentinel.",
      "Coins larger than the current amount are skipped by the c <= a guard; with coins up to 2^31 that guard is also what keeps the indexing sane.",
      "Duplicate or useless denominations need no special handling — the min simply ignores the dead branches.",
    ],
    ladder: [
      { title: "Brute recursion", body: "fewest(a) = 1 + min(fewest(a − c)) over coins. Exponential: the same remainders are re-solved across branches, and [1,3,4]-style overlap is brutal." },
      { title: "Memoize / tabulate", body: "dp over all amounts 0..target, each amount scanning the coins once. O(amount · len(coins)) time, O(amount) space. This is the canonical answer." },
      { title: "The optimal idea — same complexity, smarter traversal", body: "BFS layer-by-layer on remainders stops at the first hit of the target (shortest-path semantics), and reordering the loops (coins outer) is the trick that flips counting problems between permutations and combinations. The min-count DP itself is already at its asymptotic floor." },
    ],
    approach: "Bottom-up min-coins DP (unbounded knapsack)",
    code: `def coinChange(coins, amount):
    INF = amount + 1                # sentinel: bigger than any feasible count
    dp = [0] + [INF] * amount       # dp[a] = fewest coins summing to a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1`,
    walkthrough: [
      "The recurrence says: an optimal handful for a ends in SOME coin c — try each, keep the best remainder. The INF sentinel keeps arithmetic total: adding 1 to 'unreachable' stays huge, so it can never win a min against a reachable value, and the final INF check is the exact moment 'impossible' is decided.",
      "Trace [1,3,4], amount 6: dp[1..5] = 1, 2, 1, 1, 2 (dp[3] drops to 1 via the 3-coin, dp[4] is 1 via the 4-coin). For 6: c=1 gives dp[5]+1 = 3; c=3 gives dp[3]+1 = 2; c=4 gives dp[2]+1 = 3. The min is 2 — the 3+3 plan — while greedy's 4+1+1 pays 3. That single row is the 'why DP' argument in miniature.",
      "Base case dp[0] = 0 is the empty handful and the reason everything else bootstraps; amount 0 returns it untouched. The final line converts the sentinel honestly — dp[amount] is either a real count (at most amount) or exactly INF, never anything in between.",
    ],
    time: "O(amount · len(coins))",
    space: "O(amount) — one dp row",
    followUps: [
      "Count the ways instead of minimising the count — and note the loop order then decides whether you are counting combinations (coins outer) or permutations (amounts outer): see Combination Sum IV.",
      "Recover the coins themselves: store the argmin coin per amount and walk back from dp[amount], emitting the chosen coins.",
    ],
    related: ["combination-sum-iv", "perfect-squares"],
    verify: {
      fn: "coinChange",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 5], 11], expect: 3 },
        { args: [[2], 3], expect: -1 },
        { args: [[1, 3, 4], 6], expect: 2 },
        { args: [[1], 0], expect: 0 },
        { args: [[186, 419, 83, 408], 6249], expect: 20 },
        { args: [[2, 5, 10, 1], 27], expect: 4 },
      ],
    },
    xp: 20,
  },
  {
    slug: "maximum-product-subarray",
    statement:
      "Find the contiguous subarray with the largest product and return that product. Elements may be negative or zero, so the usual max-sum playbook needs surgery: a terrible negative product can become the best the instant another negative shows up.",
    examples: [
      { input: "nums = [2,3,-2,4]", output: "6", explanation: "[2, 3]." },
      { input: "nums = [-2,0,-1]", output: "0", explanation: "No positive product exists; the best is the lone 0." },
      { input: "nums = [-2,3,-4]", output: "24", explanation: "The whole array — two negatives sandwich a positive." },
    ],
    constraints: ["1 <= nums.length <= 2·10^4", "-10 <= nums[i] <= 10", "every subarray product is guaranteed to fit in a 32-bit integer"],
    breakdown: [
      "Carry TWO running states instead of one: maxEnd(i) = the largest product of a subarray ENDING at i, and minEnd(i) = the smallest. The transition considers three candidates per step — start fresh at x, extend the old max (maxEnd·x), extend the old min (minEnd·x) — and takes the max for one state, the min for the other. State the definition and the transition and you have the whole algorithm; the min channel exists purely so a future negative can flip it into the max.",
      "The negation shortcut: multiplying by a negative x swaps the ordering of maxEnd and minEnd, so 'if x < 0: swap them' before the update is equivalent to writing out the three-candidate max/min. Zeros need no case analysis: 'x alone' is always a candidate, so a zero naturally resets both running products, and any later positive restarts cleanly.",
      "Why greedy fails: dropping negatives or resetting at every sign change requires knowing the SIGN PARITY of a whole span, which is global information no local rule can carry. The min-tracker is exactly that parity, remembered in O(1). Compare Kadane's max-sum: there a negative prefix is simply discardable; here a negative prefix is an asset in disguise — you cannot throw it away, you must remember how bad it was.",
    ],
    edges: [
      "A single negative element ([-2] → −2): the answer can be negative; do not initialise best to 0.",
      "Zeros reset the run — [-2,0,-1] → 0 comes from the lone zero, not from any span.",
      "[-4,-3,-2] → 12: the best is an even-length prefix of negatives, not the full array (−24) and not any single element.",
      "All-positive arrays degrade gracefully to 'product of everything' — the min channel just mirrors the max.",
    ],
    ladder: [
      { title: "Brute force — every start, rolling product", body: "For each start index roll the product to every end: O(n²). Long runs also overflow fixed-width languages, though Python shrugs." },
      { title: "Two-state DP", body: "maxEnd/minEnd arrays over positions, three candidates each: O(n) time, O(n) space. The clearest form to present on a whiteboard." },
      { title: "The optimal idea — rolling scalars with the negation swap", body: "Each state feeds only the next position, so three variables carry everything. O(n) time, O(1) space; the swap is the only 'trick', and it is optional — the three-candidate max/min is equivalent." },
    ],
    approach: "Kadane variant tracking max AND min",
    code: `def maxProduct(nums):
    best = cur_max = cur_min = nums[0]
    for x in nums[1:]:
        if x < 0:                       # a negative flips max and min roles
            cur_max, cur_min = cur_min, cur_max
        cur_max = max(x, cur_max * x)   # extend the best span, or restart at x
        cur_min = min(x, cur_min * x)   # keep the worst — it may flip to best
        best = max(best, cur_max)
    return best`,
    walkthrough: [
      "State semantics: after processing index i, cur_max and cur_min are the extreme products among subarrays ending exactly at i, and best is the global answer. Each step offers three futures for a subarray ending at i+1 — begin at x, extend the current best, extend the current worst — and the two update lines pick the extremes of that candidate set.",
      "Trace [-2,3,-4]: seed all three at −2. x=3: no swap; cur_max = max(3, −6) = 3, cur_min = min(3, −6) = −6, best = 3. x=−4: the swap puts (−6, 3) in the (max, min) slots; cur_max = max(−4, −6·−4 = 24) = 24 — the min channel's −6, rescued by the negative, is now the answer; best = 24.",
      "Base cases: everything is seeded with nums[0] because the empty subarray is not allowed — with all-negative odd-length input the answer is a single element, and a 0 seed would lie. The 'x alone' candidate inside both max and min is the reset mechanism: after a 0, the next positive x beats max(0, 0·x) with no special zero branch required.",
    ],
    time: "O(n) — one pass, constant work per element",
    space: "O(1) — three scalars",
    followUps: [
      "Return the subarray itself: note the start index whenever cur_max restarts at x, and update the recorded best window alongside best.",
      "The same two-state skeleton powers variants — maximum product with length ≤ k, or with exactly one element deleted — only the candidate set per step changes.",
    ],
    related: ["maximum-subarray", "product-of-array-except-self"],
    verify: {
      fn: "maxProduct",
      wrap: "plain",
      cases: [
        { args: [[2, 3, -2, 4]], expect: 6 },
        { args: [[-2, 0, -1]], expect: 0 },
        { args: [[-2]], expect: -2 },
        { args: [[-2, 3, -4]], expect: 24 },
        { args: [[-4, -3, -2]], expect: 12 },
      ],
    },
    xp: 20,
  },
  {
    slug: "word-break",
    statement:
      "Given a string s and a dictionary of words, decide whether s can be segmented into a sequence of one or more dictionary words. Words may be reused, and the segmentation must consume every character in order.",
    examples: [
      { input: 's = "leetcode", wordDict = ["leet","code"]', output: "true", explanation: "leet | code." },
      { input: 's = "applepenapple", wordDict = ["apple","pen"]', output: "true", explanation: "apple | pen | apple — reuse is allowed." },
      { input: 's = "catsandog", wordDict = ["cats","dog","sand","and","cat"]', output: "false", explanation: "'cats an…' and 'cat san…' both strand 'og' — no split survives." },
    ],
    constraints: ["1 <= s.length <= 300", "1 <= wordDict.length <= 1000", "1 <= wordDict[i].length <= 20", "all strings consist of lowercase English letters"],
    breakdown: [
      "Define dp[i] = 'the prefix s[:i] is segmentable', with the empty prefix dp[0] = true. The last word of any segmentation of s[:i] is some s[j:i], so dp[i] = OR over j < i of (dp[j] AND s[j:i] in dict). Framing the choice as 'which word ENDS here' is what makes the subproblem a prefix — the remainder s[:j] is smaller, independent, and already solved.",
      "This is where greedy dies a public death. Matching greedily — longest or shortest word first, commit and move on — can strand the tail: on 'abcd' with [a, abc, b, cd], taking 'abc' first leaves a lone 'd', and only the abandoned 'a' branch (a | b | cd) succeeds. The DP never backtracks because it keeps EVERY viable boundary alive simultaneously: dp[i] is true the moment any single predecessor works, and false only when all of them fail.",
      "An implementation detail worth volunteering: store the dictionary in a hash set so the inner check s[j:i] in words costs the slice length, and the loop is then O(n²) cut-point pairs with O(n) slicing — comfortably fast at n = 300. A tighter variant loops over dictionary WORDS at each i (check s[i−len(w):i] == w), which wins when the dictionary is small and words are short.",
    ],
    edges: [
      "A word longer than i cannot end at i — slicing makes it a non-match, but a len(w) <= i guard skips the slice entirely.",
      "Reused words ('applepenapple') are free: the dict is a set — membership, not consumption.",
      "All-'a' strings against [a, aa, aaa] maximise the inner loop — the slicing worst case, still trivial at n = 300.",
      "dp[0] = true is the empty-segmentation identity; without it even a perfect dictionary match scores false.",
    ],
    ladder: [
      { title: "Brute recursion — try every word at every position", body: "Recurse on the remainder after each dictionary match. Exponential on adversarial inputs: 'aaaa…b' forks at every character before failing at the very end." },
      { title: "Memoized / bottom-up prefix DP", body: "dp[i] over cut points with a set-backed dictionary: O(n²) boundary pairs, O(n) worst-case slice each, O(n) space. The standard interview answer." },
      { title: "The optimal idea — prune the inner loop", body: "Iterate dictionary words instead of cut points (bounded word lengths), or put the dictionary in a trie so dead prefixes die early. Space is already O(n) — the wins here are constant-factor, not asymptotic." },
    ],
    approach: "Prefix-breakability DP with a dict set",
    code: `def wordBreak(s, wordDict):
    words = set(wordDict)           # O(1) average membership
    n = len(s)
    dp = [False] * (n + 1)          # dp[i] = s[:i] is segmentable
    dp[0] = True                    # empty prefix: the empty segmentation
    for i in range(1, n + 1):
        for j in range(i):          # s[j:i] would be the LAST word
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break               # one witness is enough
    return dp[n]`,
    walkthrough: [
      "The recurrence enumerates the last word's start j: the prefix s[:j] must be segmentable (dp[j]) and the leftover s[j:i] must be a dictionary word. The OR-shortcut break is safe because dp is a boolean — one successful split at a boundary settles it.",
      "Trace 'applepenapple' (n = 13): dp[5] lights via 'apple'; dp[8] via dp[5] + 'pen'; dp[13] via dp[8] + 'apple' → true. Trace 'catsandog': dp[3] ('cat') and dp[4] ('cats') light, dp[7] lights via 'sand' (from 3) and 'and' (from 4), but dp[9] needs some lit j with s[j:9] in the dict — the candidates 'og' and 'dog' from unlit prefixes never qualify — so dp[9] stays false.",
      "Base case dp[0] = true is what lets the first word attach ('leet' checks dp[0] and s[0:4]). The false entries matter as much as the true ones: dp[i] = false prunes every future segmentation that would need a word to end at i — which is exactly why no backtracking is ever needed.",
    ],
    time: "O(n²) boundary pairs with O(n) slice checks — O(n³) worst case, fast at the n ≤ 300 contract",
    space: "O(n) for the dp row + O(dictionary size) for the set",
    followUps: [
      "Word Break II asks to OUTPUT all segmentations: reuse the dp as a pruning oracle, then DFS from the end emitting words — the table makes the enumeration exponential only when the output itself is exponential.",
      "Streaming or huge-dictionary settings: a trie (or Aho–Corasick) matches all word-endings at each position in one pass instead of slicing per candidate.",
    ],
    related: ["word-break-ii", "palindrome-partitioning"],
    verify: {
      fn: "wordBreak",
      wrap: "plain",
      cases: [
        { args: ["leetcode", ["leet", "code"]], expect: true },
        { args: ["applepenapple", ["apple", "pen"]], expect: true },
        { args: ["catsandog", ["cats", "dog", "sand", "and", "cat"]], expect: false },
        { args: ["abcd", ["a", "abc", "b", "cd"]], expect: true },
        { args: ["aaaaab", ["a", "aa", "aaa"]], expect: false },
        { args: ["a", ["a"]], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-increasing-subsequence",
    statement:
      "Return the length of the longest strictly increasing SUBSEQUENCE of nums — values rising left to right, positions not required to be contiguous.",
    examples: [
      { input: "nums = [10,9,2,5,3,7,101,18]", output: "4", explanation: "E.g. [2,3,7,101] or [2,5,7,18] — length 4 either way." },
      { input: "nums = [0,1,0,3,2,3]", output: "4", explanation: "[0,1,2,3]." },
      { input: "nums = [7,7,7,7,7]", output: "1", explanation: "STRICTLY increasing: equal values do not chain." },
    ],
    constraints: ["1 <= nums.length <= 2500", "-10^4 <= nums[i] <= 10^4"],
    breakdown: [
      "The O(n²) DP: lis(i) = 1 + max(lis(j) for j < i with nums[j] < nums[i]), defaulting to 1; the answer is the max over all i. 'The subsequence's last element is nums[i]' is the subproblem hook — the same last-element decomposition as robber or decode-ways, because it makes the remainder an independent prefix problem.",
      "The O(n log n) upgrade is patience sorting. Maintain tails, where tails[k] = the smallest possible tail value of ANY increasing subsequence of length k+1 found so far. tails is strictly increasing (if a shorter pile's tail were not smaller, the longer pile's chain would contradict it), so each new element x binary-searches the first tails[k] ≥ x: either x extends the longest pile (append) or it lands on and LOWERS an existing tail (replace). Lowering a tail is pure profit — a smaller tail accepts strictly more future continuations and invalidates nothing.",
      "Two honesty notes. First, tails is NOT itself a longest subsequence — it is a digest; its length is the answer but its contents can be a chimera assembled from different chains. Second, bisect_left (the first index with tails[k] ≥ x) is what enforces strictness: an equal value replaces rather than extends, so [7,7,7] never grows past 1.",
    ],
    edges: [
      "Duplicates: strictness means equal values replace (bisect_left), never extend — [7,7,7,7,7] → 1.",
      "Strictly decreasing input → 1: every element just lowers tails[0].",
      "A single element → 1 (and the empty array — out of contract — returns 0 because the loop never runs).",
      "The final tails array's LENGTH answers the question even when its contents do not correspond to any real subsequence.",
    ],
    ladder: [
      { title: "Brute force — include/exclude recursion", body: "Recurse over (index, last value chosen) or enumerate subsequences outright: exponential. Even the clean O(n²) DP below looks like the finish line until the follow-up asks for better." },
      { title: "O(n²) DP over predecessors", body: "lis(i) scans all smaller-index, smaller-value predecessors; O(n) space for the table. Perfectly serviceable at n = 2500 (~6·10^6 comparisons) and the version to present FIRST." },
      { title: "The optimal idea — patience tails + binary search", body: "One O(log n) search per element → O(n log n) total, O(n) space. The invariant 'tails is strictly increasing' is what licenses the binary search — everything else is bookkeeping." },
    ],
    approach: "Patience tails + binary search",
    code: `def lengthOfLIS(nums):
    tails = []                      # tails[k] = smallest tail of any
    for x in nums:                  # increasing subsequence of length k+1
        lo, hi = 0, len(tails)
        while lo < hi:              # bisect_left: first tail >= x
            mid = (lo + hi) // 2
            if tails[mid] < x:
                lo = mid + 1
            else:
                hi = mid
        if lo == len(tails):
            tails.append(x)         # x extends the longest pile so far
        else:
            tails[lo] = x           # x lowers a tail — strictly better standing
    return len(tails)`,
    walkthrough: [
      "Invariant: tails is strictly increasing, and tails[k] is the minimum possible last value over all increasing subsequences of length k+1 in the processed prefix. Both actions preserve it — appending keeps the order (x is bigger than every tail), and replacing tails[k] with x keeps strictness (x < old tails[k], while tails[k−1] < x by the search's landing point).",
      "Trace [10,9,2,5,3,7,101,18]: 10 → [10]; 9 → [9]; 2 → [2]; 5 → [2,5]; 3 → [2,3]; 7 → [2,3,7]; 101 → [2,3,7,101]; 18 → replaces 101 → [2,3,7,18]. Length 4 — and note the final array [2,3,7,18] is NOT a subsequence of the input (18 sits at index 7, after 101), yet its length is exactly right.",
      "Base cases: the first element appends to an empty list, so tails[0] is always defined after one iteration; an empty input (out of contract) yields 0 honestly. The bisect_left landing at lo == len is the 'record length' event — everything else is maintenance of a digest that stays exactly as long as the best chain so far.",
    ],
    time: "O(n log n) — one binary search per element",
    space: "O(n) — the tails array (bounded by the answer's length)",
    followUps: [
      "Reconstruct an actual LIS: record for each element the pile index it landed on plus a predecessor pointer to the previous pile's element; walk back from the last filled pile.",
      "Count the NUMBER of distinct longest subsequences: augment the O(n²) DP with counts per length, or maintain parallel count arrays inside the patience structure.",
    ],
    related: ["russian-doll-envelopes", "number-of-longest-increasing-subsequence"],
    verify: {
      fn: "lengthOfLIS",
      wrap: "plain",
      cases: [
        { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expect: 4 },
        { args: [[0, 1, 0, 3, 2, 3]], expect: 4 },
        { args: [[7, 7, 7, 7, 7]], expect: 1 },
        { args: [[1, 3, 6, 7, 9, 4, 10, 5, 6]], expect: 6 },
        { args: [[5, 4, 3, 2, 1]], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "partition-equal-subset-sum",
    statement:
      "Given an array of positive integers, decide whether it can be split into two groups with EQUAL sums. Equivalent formulation: does any subset sum to exactly half the total?",
    examples: [
      { input: "nums = [1,5,11,5]", output: "true", explanation: "[1,5,5] and [11]." },
      { input: "nums = [1,2,3,5]", output: "false", explanation: "The total 11 is odd — no equal split can exist." },
      { input: "nums = [2,2,2]", output: "false", explanation: "The total 6 is even, but no subset of 2s sums to 3 — even totals do not guarantee success." },
    ],
    constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 100"],
    breakdown: [
      "Reduction first: two equal-sum groups exist iff some subset sums to total/2 (the complement automatically holds the other half). If the total is odd, answer false immediately. What remains is textbook SUBSET-SUM: define reachable[a] = 'some subset of the processed items sums to a', seed reachable[0] = true (the empty subset), and for each item num add-or-skip: every newly reachable sum is an old sum plus num.",
      "Greedy pairing (largest with smallest, and friends) fails because subset-sum has no monotone local structure: which items offset the 11 against [1,5,5] is a global coincidence, not a sortable property. Subset-sum is NP-complete in general — the reason this problem is tractable is the pseudo-polynomial bound: sums live in 0..total ≤ 20000, so a DP over SUMS (not over subsets) is polynomial in the numeric target.",
      "The elegant implementation is a bitset: one big integer whose bit a means 'sum a is reachable'. Each item costs one operation — reachable |= reachable << num — where the shift IS 'take the item' and the OR-with-old IS 'skip it'. Python big ints make this a 20,000-wide boolean vector updated a word at a time.",
    ],
    edges: [
      "Odd total → false without any DP work (the cheap exit interviewers want you to name).",
      "A single element can never split: the subsets are empty and itself, with sums 0 and n — neither equals n/2 for n ≥ 1.",
      "[1,1] → true is the minimal success; [2,2,2] is the minimal 'even total but impossible' failure.",
      "Item reuse must be forbidden: the bitset's shift reads the OLD mask (the right-hand side is evaluated before assignment), which is exactly the each-item-once semantics — the array version needs a DESCENDING inner loop for the same reason.",
    ],
    ladder: [
      { title: "Brute force — all subsets", body: "Try all 2^n subsets. n = 200 means more subsets than atoms in the universe; dead immediately." },
      { title: "Subset-sum DP over sums", body: "Boolean array over sums 0..target, items outer, sums DESCENDING inner (so each item is used at most once). O(n · target) time, O(target) space. The classic, and the version to describe aloud." },
      { title: "The optimal idea — bitset DP", body: "One big integer, one shift-or per item. Same asymptotics, but the constant factor drops by the machine word size (~64×) and the code shrinks to three lines. The same trick speeds up knapsack and exact-cover DPs generally." },
    ],
    approach: "Subset-sum to total/2 via bitset DP",
    code: `def canPartition(nums):
    total = sum(nums)
    if total % 2:                   # odd total: no equal split can exist
        return False
    target = total // 2
    reachable = 1                   # bit a set <=> sum a achievable; sum 0 = empty subset
    for num in nums:
        reachable |= reachable << num   # take num (shift) or skip it (keep old bits)
    return bool(reachable & (1 << target))`,
    walkthrough: [
      "The bit encoding: after processing k items, bit a of reachable is 1 iff some subset of those k items sums to a. The update is a set-union — old bits (skip num) union shifted old bits (append num to every previously reachable subset). Because the right-hand side is fully evaluated before assignment, every item contributes at most once: the 0/1 semantics for free.",
      "Trace [1,5,11,5]: after 1 → {0,1}; after 5 → {0,1,5,6}; after 11 → {0,1,5,6,11,12,16,17} — bit 11 is already set, so target = 11 → true before the last item even moves. On [2,2,2]: reachable bits are {0,2,4,6} — target 3 is dark → false, the 'even total is not enough' lesson.",
      "Base cases: bit 0 is always set (the empty subset), which is what lets the first item's shift produce bit num. The odd-total guard returns before any shifting; and because every nums[i] ≥ 1, reachable never exceeds total+1 bits — memory bounded by the contract, not by hope.",
    ],
    time: "O(n · total / w) — one shift-or over a total-bit integer per item (w = machine word size)",
    space: "O(total) bits — one big integer",
    followUps: [
      "Partition into k equal-sum subsets: subset-sum DP no longer suffices — k-way backtracking with pruning (sort descending, skip equal-valued branches) is the standard attack.",
      "Recover the two subsets: store, for each reachable sum, one (item, predecessor) witness and walk back from target; the complement group is everything left over.",
    ],
    related: ["coin-change", "target-sum"],
    verify: {
      fn: "canPartition",
      wrap: "plain",
      cases: [
        { args: [[1, 5, 11, 5]], expect: true },
        { args: [[1, 2, 3, 5]], expect: false },
        { args: [[2, 2, 2]], expect: false },
        { args: [[1, 1]], expect: true },
        { args: [[1]], expect: false },
        { args: [[3, 3, 3, 3]], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "jump-game",
    statement:
      "Standing on index 0 of an array where nums[i] is the MAXIMUM jump length from i (you may jump any distance from 1 to nums[i]), decide whether the last index is reachable.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "true", explanation: "0 → 1 → 4 (or 0 → 2 → 4)." },
      { input: "nums = [3,2,1,0,4]", output: "false", explanation: "Every route stalls on the 0 at index 3; index 4 is unreachable." },
      { input: "nums = [2,0,0]", output: "true", explanation: "Two hops of the right size clear both zeros." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^5"],
    breakdown: [
      "The structural insight that makes everything easy: because you may jump any distance UP TO nums[i], the set of reachable indices is always a contiguous prefix [0..reach]. If you can reach index k, you can reach every index before it — land short on purpose. So one number, reach, the furthest reachable index, summarises all reachability, and a DP over 'which indices are reachable' collapses into a single running max.",
      "The greedy sweep: walk i left to right; if i > reach, index i is behind a wall and everything beyond is too — return false. Otherwise extend reach = max(reach, i + nums[i]) and short-circuit the moment reach covers the last index. It is fair to meet this in the DP section precisely because the lesson is what greedy CAN do when the state space is totally ordered: the reachable set has no holes, so there is no combinatorial choice left to explore.",
      "Contrast with the honest DP formulation: dp[i] = any j < i with dp[j] and j + nums[j] ≥ i — O(n²), correct, and completely blind to the prefix structure. Recognising that reachable indices are downward-closed (if i is reachable so is everything below it) is the whole difference between the table and the single scalar. Jump Game II, the minimum-jumps sibling, reuses the same prefix-reach idea in layers.",
    ],
    edges: [
      "nums[0] = 0 with n > 1 → false: the wall is at the very start (i = 1 > reach = 0).",
      "n = 1 → true trivially — you begin on the last index, and the early exit fires immediately.",
      "A zero is only fatal if NO earlier index can leap past it — [2,0,0] survives, [1,0,1] does not.",
      "The early exit when reach ≥ n−1 avoids a pointless scan of the tail.",
    ],
    ladder: [
      { title: "Brute recursion — try every jump length", body: "From each index DFS over every jump distance looking for the last index: exponential, because the same suffix is re-explored through many jump histories." },
      { title: "DP over positions", body: "dp[i] = reachable(i) as the OR over predecessors: O(n²) time, O(n) space. Correct and a good stepping stone, but it recomputes what one running max already knows." },
      { title: "The optimal idea — greedy furthest-reach sweep", body: "O(n) time, O(1) space, valid because reachability is a prefix. (A backward variant — walk from the end pulling a 'leftmost good index' pointer leftward — gives the same complexity and generalises neatly to minimum-jump counting.)" },
    ],
    approach: "Greedy furthest-reach sweep",
    code: `def canJump(nums):
    reach = 0                       # furthest index reachable so far
    for i, jump in enumerate(nums):
        if i > reach:               # a gap no jump can cross
            return False
        reach = max(reach, i + jump)
        if reach >= len(nums) - 1:  # the last index is already in range
            return True
    return True                     # unreachable tail; keeps the function total`,
    walkthrough: [
      "Invariant: after visiting index i, reach is the furthest index reachable using jumps that start at indices ≤ i. The check i > reach is the whole failure condition — if the sweep arrives at an index beyond everyone's throw, the prefix is closed and the last index is sealed off forever.",
      "Trace [3,2,1,0,4]: i=0 → reach 3; i=1 → max(3, 3) = 3; i=2 → max(3, 3) = 3; i=3 → max(3, 3+0) = 3; i=4: 4 > 3 → false. Every route funnels into the 0 at index 3, and the sweep detects the wall without enumerating a single route. Trace [2,3,1,1,4]: i=0 → reach 2; i=1 → reach 4 ≥ 4 → true on the early exit.",
      "Base cases: n = 1 exits true on the first iteration (reach ≥ 0 after the update); the trailing return True is defensive totality — the loop's own logic always returns first. Note the problem's 'at most' wording is load-bearing: if jumps had to be EXACTLY nums[i], the prefix property would collapse and this greedy would be wrong.",
    ],
    time: "O(n) — single sweep",
    space: "O(1) — one integer",
    followUps: [
      "Jump Game II: minimum jump count — same sweep, but count how many times the frontier (the far edge of the current jump layer) advances: implicit BFS on the prefix.",
      "If jumps had to be exactly nums[i], the prefix property dies, holes appear, and you are back to DP/DFS with visited marks — a good illustration of why the wording matters.",
    ],
    related: ["jump-game-ii", "partition-labels"],
    verify: {
      fn: "canJump",
      wrap: "plain",
      cases: [
        { args: [[2, 3, 1, 1, 4]], expect: true },
        { args: [[3, 2, 1, 0, 4]], expect: false },
        { args: [[0]], expect: true },
        { args: [[0, 1]], expect: false },
        { args: [[2, 0, 0]], expect: true },
        { args: [[1, 0, 1]], expect: false },
      ],
    },
    xp: 20,
  },
  {
    slug: "min-cost-climbing-stairs",
    statement:
      "A staircase has cost[i] attached to step i. You start on step 0 or step 1 (either is free), you pay cost[i] when you LEAVE step i, and each move climbs one or two steps. Pay your way to the top — one position beyond the last step — for the minimum total.",
    examples: [
      { input: "cost = [10,15,20]", output: "15", explanation: "Start on step 1 (free), pay 15, jump two to the top. Every plan that pays step 0 does worse." },
      { input: "cost = [1,100,1,1,1,100,1,1,100,1]", output: "6", explanation: "Skip every 100: pay the six 1s at steps 0, 2, 4, 6, 7, 9." },
      { input: "cost = [10,15]", output: "10", explanation: "Start on step 0, pay 10, jump two." },
    ],
    constraints: ["2 <= cost.length <= 1000", "0 <= cost[i] <= 999"],
    breakdown: [
      "Define dp[i] = the minimum total cost to ARRIVE at step i (payments made so far include every departed step). The two free starts give dp[0] = dp[1] = 0. To arrive at i you left either i−1 (paying cost[i−1] after arriving there) or i−2 (paying cost[i−2]): dp[i] = min(dp[i−1] + cost[i−1], dp[i−2] + cost[i−2]). The top is position n, so the answer is dp[n] — a rolling pair like climbing-stairs with cost terms attached.",
      "Greedy fails locally and demonstrably: on [10,15,20] the 'cheapest first move' instinct starts on step 0 (10 < 15), but leaving step 0 strands you paying again — the true plan never pays step 0 at all. Cheap-now choices can force expensive later positions, and only the min over BOTH predecessor branches keeps the globally cheap route alive.",
      "A second, equivalent framing: pay[i] = cost[i] + min(pay[i+1], pay[i+2]) running backwards, answer min(pay[0], pay[1]) — 'cost to finish FROM step i'. Both are the same shortest-path graph on a line; pick one and stay consistent, because mixing arrival costs with departure costs in one recurrence is the classic bug this problem harvests.",
    ],
    edges: [
      "Two steps (the contract's minimum): dp[2] = min(cost[0], cost[1]) — start on the cheaper and jump two; the loop body runs exactly once.",
      "The top is index n, NOT n−1: the last payment is made leaving step n−1 or n−2, never 'arriving' at a paid step.",
      "Watch the off-by-ones: the loop must run to n inclusive, and cost indices lag by one (dp[i] reads cost[i−1] and cost[i−2]) — the two classic slips.",
      "Zero costs are legal and make steps free — no special casing, the min just prefers them.",
    ],
    ladder: [
      { title: "Brute recursion — cheapest to finish", body: "cheapest(i) = cost[i] + min(cheapest(i+1), cheapest(i+2)): exponential, the same fork-at-every-step tree as climbing stairs." },
      { title: "Memoize / tabulate", body: "One dp array over arrival costs (or departure costs, backwards): O(n) time, O(n) space, each step resolved from its two predecessors." },
      { title: "The optimal idea — rolling pair", body: "dp[i] reads only dp[i−1] and dp[i−2], so two scalars slide up the staircase. O(n) time, O(1) space." },
    ],
    approach: "Arrival-cost rolling pair",
    code: `def minCostClimbingStairs(cost):
    a, b = 0, 0                     # dp[i-2], dp[i-1]; arriving at 0 or 1 is free
    for i in range(2, len(cost) + 1):   # i = the position being arrived at
        a, b = b, min(a + cost[i - 2], b + cost[i - 1])
    return b                        # dp[n]: minimum cost to arrive at the top`,
    walkthrough: [
      "The recurrence charges each step's toll at DEPARTURE: arriving at i costs dp of where you came from plus that step's toll. Because starts are free, dp[0] and dp[1] are both 0, and the answer dp[n] includes exactly the tolls of the steps you stood on and left — never a toll for the top itself.",
      "Trace [10,15,20]: i=2 → b = min(0+10, 0+15) = 10 (arrive at step 2 via step 0); i=3 → a=0, b=10, so b = min(0+15, 10+20) = 15 (arrive at the top from step 1) → 15. The 10-branch survives inside the min at i=2 but loses at i=3 — the DP held both futures open until the numbers decided.",
      "Trace the ten-step case in spirit: dp runs 1, 2, 2, 3, 3, 4, 4, 5, 6 across positions 2..10 and lands on 6 — every 100 is skipped because the recurrence always reaches a 100-step's neighbours through the 1s. Base cases: the two zeros seed everything, and for n = 2 the loop runs once and returns min(cost[0], cost[1]) directly.",
    ],
    time: "O(n) — one pass up the steps",
    space: "O(1) — two rolling variables",
    followUps: [
      "Print the actual route: keep the dp array and walk backwards from n, choosing whichever predecessor produced dp[i].",
      "K-step climbs (climb up to k, pay on leaving): dp[i] = min over j = 1..k of dp[i−j] + cost[i−j] — a sliding-window minimum keeps it O(n) for any fixed k.",
    ],
    related: ["climbing-stairs", "house-robber"],
    verify: {
      fn: "minCostClimbingStairs",
      wrap: "plain",
      cases: [
        { args: [[10, 15, 20]], expect: 15 },
        { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expect: 6 },
        { args: [[1, 2]], expect: 1 },
        { args: [[2, 1, 3]], expect: 1 },
        { args: [[10, 15]], expect: 10 },
      ],
    },
    xp: 10,
  },
  {
    slug: "n-th-tribonacci-number",
    statement:
      "The Tribonacci sequence is defined by T0 = 0, T1 = 1, T2 = 1, and Tn = Tn−1 + Tn−2 + Tn−3 for n ≥ 3. Return Tn.",
    examples: [
      { input: "n = 4", output: "4", explanation: "T4 = 1 + 1 + 2." },
      { input: "n = 25", output: "1389537" },
      { input: "n = 0", output: "0" },
    ],
    constraints: ["0 <= n <= 37", "the answer is guaranteed to fit in a 32-bit integer"],
    breakdown: [
      "The recurrence is handed to you — the exercise is executing it without waste. Define T(i) by the given rule; each value is a fixed sum of the three before it, so a bottom-up pass from the three seeds computes T(n) in one sweep. This is climbing-stairs with one more term of memory: a rolling TRIPLE instead of a pair.",
      "Naive recursion without memoization re-derives the same values astronomically often — the call tree forks at every level and depth n means exponential work for what is a 38-entry table. Memoization or iteration fixes it to linear; the rolling triple then removes the table itself.",
      "Beyond linear lives matrix exponentiation: T(n) is the first component of the seed vector multiplied by the n-th power of a 3×3 companion matrix — O(log n) multiplications. At n ≤ 37 that is pure showing off, but it is the standard escalation when the index is astronomically large and the answer is taken modulo something small.",
    ],
    edges: [
      "Three base cases, not two: T0 = 0, T1 = 1, T2 = 1 — the loop must start at i = 3 and n = 2 must fall through to the seed.",
      "n = 0 returns 0 — guard 'n < 2' rather than 'n == 0' so T1 comes from the same early exit.",
      "T37 = 2,082,876,103 squeaks under the 32-bit ceiling — the contractual reason n stops at 37.",
    ],
    ladder: [
      { title: "Brute recursion", body: "trib(n) = trib(n−1) + trib(n−2) + trib(n−3) with no memory: exponential re-derivation, painful past n ≈ 30." },
      { title: "Memoize / tabulate", body: "38 values, each from three predecessors: O(n) time, O(n) space." },
      { title: "The optimal idea — rolling triple", body: "Three scalars advance one position per step; O(n) time, O(1) space. (Beyond this: 3×3 matrix power for O(log n) when n outgrows the contract.)" },
    ],
    approach: "Rolling triple",
    code: `def tribonacci(n):
    if n < 2:
        return n                    # T0 = 0, T1 = 1
    a, b, c = 0, 1, 1               # T(i-3), T(i-2), T(i-1)
    for _ in range(3, n + 1):
        a, b, c = b, c, a + b + c   # T(i) = T(i-1) + T(i-2) + T(i-3)
    return c                        # n == 2 skips the loop: seed T2 = 1`,
    walkthrough: [
      "The tuple slide is the entire algorithm: each iteration promotes b to a, c to b, and appends a+b+c as the new c. After k iterations, c holds T(k+2) — the loop runs n−2 times to land on T(n). All three right-hand sides read the OLD triple, which the simultaneous assignment guarantees.",
      "Trace n = 5: seeds (0, 1, 1) → (1, 1, 2) → (1, 2, 4) → (2, 4, 7); three iterations for n−2 = 3, and c = 7 = T5. Cross-check by hand: T3 = 0+1+1 = 2, T4 = 1+1+2 = 4, T5 = 1+2+4 = 7 — the loop's arithmetic and the definition agree step for step.",
      "Base cases: the n < 2 guard handles T0 and T1; n = 2 skips the loop (range(3, 3) is empty) and returns the seed c = 1. Nothing else is special — the sequence grows roughly geometrically (ratio ≈ 1.839), which is why 37 is the last index that fits a 32-bit integer.",
    ],
    time: "O(n) — one triple-slide per step",
    space: "O(1) — three variables",
    followUps: [
      "Matrix exponentiation: raise the 3×3 companion matrix to the n-th power by repeated squaring for O(log n) — the tool when n is huge or many queries share precomputed powers.",
      "Blocked or weighted variants (some indices forbidden, or the last k terms summed with weights) keep the same rolling-window shape; only the update line changes.",
    ],
    related: ["climbing-stairs", "fibonacci-number"],
    verify: {
      fn: "tribonacci",
      wrap: "plain",
      cases: [
        { args: [0], expect: 0 },
        { args: [1], expect: 1 },
        { args: [2], expect: 1 },
        { args: [4], expect: 4 },
        { args: [25], expect: 1389537 },
        { args: [37], expect: 2082876103 },
      ],
    },
    xp: 10,
  },
  {
    slug: "combination-sum-iv",
    statement:
      "Given an array of DISTINCT positive integers and a target, count the ordered sequences of values (any length, unlimited reuse) that sum to target. Order matters: (1, 2) and (2, 1) are two different sequences.",
    examples: [
      { input: "nums = [1,2,3], target = 4", output: "7", explanation: "(1,1,1,1), (1,1,2), (1,2,1), (2,1,1), (2,2), (1,3), (3,1)." },
      { input: "nums = [1,2], target = 5", output: "8", explanation: "Compositions of 5 into 1s and 2s — count them and you will meet the Fibonacci numbers." },
      { input: "nums = [9], target = 3", output: "0", explanation: "No sequence of 9s can sum to 3." },
    ],
    constraints: ["1 <= nums.length <= 200", "1 <= nums[i] <= 1000", "all values in nums are unique", "1 <= target <= 1000", "the answer fits in a 32-bit integer"],
    breakdown: [
      "Define dp[a] = the number of ORDERED sequences summing to a, seeded dp[0] = 1 (the empty sequence). Decompose by the LAST element: every sequence for a ends in some num, preceded by any sequence for a − num. Those cases are disjoint (different last element) and exhaustive, so dp[a] = Σ over num ≤ a of dp[a − num]. This is the permutation-counting recurrence.",
      "The centrepiece — loop order is semantics. Outer loop over AMOUNTS, inner over nums: dp[a − num] may include sequences that already used num and other values in any order, so relative order is counted freely → PERMUTATIONS (7 for [1,2,3] at 4). Swap the loops — nums outer, amounts inner — and each multiset is generated exactly once, in num order → COMBINATIONS (the same example counts 4: {1,1,1,1}, {1,1,2}, {2,2}, {1,3}). Same dp array, same numbers flowing, entirely different question answered. Coin Change II is the combinations version; this problem is the permutations one; interviews love watching you notice which is which.",
      "Compare with Coin Change (min coins): the identical unbounded-knapsack skeleton, only the aggregator differs — min for optimisation, + for counting. Once you see that, the 1-D DP family is a small closed set: pick the subproblem hook (last element / last move / last coin), write the disjoint-case sum or max, and choose loop order to match whether order matters.",
    ],
    edges: [
      "dp[0] = 1 is the empty-sequence identity — forget it and even dp[num] comes out 0.",
      "A coin bigger than a stays out of the sum (the num <= a guard); coins bigger than target never matter at all.",
      "Impossible targets simply sum to zero — [9] at 3 has no branch to take.",
      "Counts grow fast ([1,2] at 5 → 8, roughly doubling); the 32-bit guarantee is about the contract's inputs, while Python ints are immune regardless.",
    ],
    ladder: [
      { title: "Brute recursion — count every sequence", body: "count(a) = Σ count(a − num) with no memory: exponential re-derivation, savage on [1,2] where every remainder overlaps every other." },
      { title: "Memoize / tabulate over amounts", body: "dp[0..target], each cell summing over the coins: O(target · len(nums)) time, O(target) space. The standard answer." },
      { title: "The optimal idea — the loop-order duality", body: "The dp row is already the minimal state (every remainder is a live subproblem, so O(target) space is required); the third rung here is mastering loop order: amounts-outer for permutations (this problem), coins-outer for combinations (Coin Change II). Same complexity, different universe of answers." },
    ],
    approach: "Count-permutations DP (amount-outer loop)",
    code: `def combinationSum4(nums, target):
    dp = [0] * (target + 1)
    dp[0] = 1                       # the empty sequence sums to 0
    for a in range(1, target + 1):  # OUTER over amounts -> order matters
        for num in nums:            # try num as the LAST element
            if num <= a:
                dp[a] += dp[a - num]
    return dp[target]`,
    walkthrough: [
      "Each dp[a] aggregates over the last element: for num in nums, dp[a − num] counts the sequences that, when num is appended, land exactly on a. The cases are disjoint by that final value and cover every sequence, so the sum is exact — the 'last move' decomposition applied to counting rather than optimising.",
      "Trace [1,2,3] to 4: dp[1] = dp[0] = 1; dp[2] = dp[1] + dp[0] = 2; dp[3] = dp[2] + dp[1] + dp[0] = 4; dp[4] = dp[3] + dp[2] + dp[1] = 7. Enumerate to check: 1111; 112, 121, 211; 22; 13, 31 — four plus two plus one equals seven.",
      "Now swap the loops mentally for [1,2] at 3: coins-outer builds {1,1,1} then {1,2} — 2 combinations; amounts-outer (the code above) counts 111, 12, 21 — 3 permutations. Base case dp[0] = 1 bootstraps both; an unreachable target simply never accumulates and returns 0.",
    ],
    time: "O(target · len(nums))",
    space: "O(target) — the dp row",
    followUps: [
      "State out loud which variant the interviewer wants before coding — 'count arrangements' (this problem) vs 'count selections' (Coin Change II) — the code differs by two swapped lines and nothing else.",
      "Negative numbers would make the recurrence cyclic (a − num can climb back up); you would need to bound the sequence length or memoize on (amount, length) — worth mentioning to show you see the acyclicity assumption.",
    ],
    related: ["coin-change", "coin-change-ii"],
    verify: {
      fn: "combinationSum4",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3], 4], expect: 7 },
        { args: [[9], 3], expect: 0 },
        { args: [[1, 2], 5], expect: 8 },
        { args: [[4, 2, 1], 32], expect: 39882198 },
        { args: [[2], 3], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "perfect-squares",
    statement:
      "Return the fewest perfect squares (1, 4, 9, 16, …) that sum to exactly n. At least one answer always exists, because 1 is a square.",
    examples: [
      { input: "n = 12", output: "3", explanation: "4 + 4 + 4." },
      { input: "n = 13", output: "2", explanation: "4 + 9." },
      { input: "n = 7", output: "4", explanation: "4 + 1 + 1 + 1 — no two- or three-square decomposition exists." },
    ],
    constraints: ["1 <= n <= 10^4"],
    breakdown: [
      "Coin Change in number-theory costume: the 'coins' are the squares 1, 4, 9, … up to n, supply is unlimited, and we minimise the count. dp[a] = fewest squares summing to a, dp[0] = 0, dp[a] = 1 + min over squares s ≤ a of dp[a − s]. There are only √n distinct squares, so the double loop is O(n·√n) — 10^4 · 100 = 10^6 steps at the contract's ceiling.",
      "Greedy — repeatedly subtract the largest square that fits — fails exactly like coin-change greedy: at 12 it takes 9 and strands 3 (9+1+1+1 = 4 squares) while 4+4+4 needs 3. The largest square is not always on the optimal path, and only the min over ALL square choices is safe.",
      "Two upgrades are worth naming. BFS on remainders treats each amount as a node and each square as a unit edge — the minimum count is the BFS depth to reach 0, with early exit on the first hit. And number theory caps the answer entirely: Lagrange's four-square theorem guarantees every n is a sum of four squares, so the answer is always 1, 2, 3, or 4 — and Legendre's three-square theorem says it is exactly 4 precisely when n = 4^a(8b + 7).",
    ],
    edges: [
      "Perfect squares return 1 (n = 100 → 1); twice a square returns 2; the DP finds these without special cases.",
      "Numbers of the form 4^a(8b+7) — 7, 15, 23, 28, … — are the answer-4 family (Legendre); 7 is the smallest.",
      "n = 1 → 1 and n = 2 → 2 are the smallest inputs; n = 0 (out of contract) would return dp[0] = 0 honestly.",
      "The square list must reach √n inclusive — off by one there and 100 loses its one-square answer.",
    ],
    ladder: [
      { title: "Brute recursion", body: "fewest(a) = 1 + min(fewest(a − s)) over squares: exponential overlap, the same disease as coin-change recursion." },
      { title: "Bottom-up min-count DP", body: "dp over 0..n, inner loop over at most √n squares: O(n√n) time, O(n) space. The canonical solution." },
      { title: "The optimal idea — BFS on remainders, then number theory", body: "BFS layers over remainders exit early on the first hit; sharper still, Lagrange/Legendre give an O(√n) decision — test 1 (n is a square), 2 (n − s² is a square), 4 (the 4^a(8b+7) form), else 3 — with no table at all." },
    ],
    approach: "Min-count DP over square remainders",
    code: `def numSquares(n):
    squares = [s * s for s in range(1, int(n ** 0.5) + 1)]
    dp = [0] + [float("inf")] * n   # dp[a] = fewest squares summing to a
    for a in range(1, n + 1):
        for s in squares:
            if s > a:
                break               # squares are sorted — no point scanning on
            dp[a] = min(dp[a], dp[a - s] + 1)
    return dp[n]                    # always finite: 1 is a square`,
    walkthrough: [
      "The recurrence is coin-change's, with the coin list generated arithmetically. The inner loop's early break exploits the sorted square list: once s exceeds a, every later square does too. Every dp entry is finite by the time it is read — 1 is a square, so all amounts are reachable — and the final value is a plain integer.",
      "Trace n = 12: dp[1..4] = 1, 2, 3, 1 (4 is a square); dp[8] = dp[4]+1 = 2; dp[12] = min(dp[11]+1, dp[8]+1, dp[3]+1) = min(4, 3, 4) = 3 — the 4+4+4 plan, beating greedy's 9+1+1+1. Trace n = 13: dp[13] = min(dp[12]+1, dp[9]+1, dp[4]+1) = min(4, 2, 2) = 2 — 4+9.",
      "Base case dp[0] = 0 is the empty sum; every other entry bootstraps from it through the s = 1 term at worst. The Lagrange guarantee (answer ≤ 4) is a nice sanity bound while debugging: any dp entry above 4 mid-fill means you have broken the recurrence, not the mathematics.",
    ],
    time: "O(n · √n) — n amounts, at most √n squares each",
    space: "O(n) — the dp row",
    followUps: [
      "Lagrange + Legendre as an O(√n) decision procedure: the answer is 1 if n is a square, 2 if n − s² is a square for some s, 4 iff n = 4^a(8b+7), else 3 — no dp table required.",
      "Count the decompositions or emit one: keep the argmin square per amount and walk back from n.",
    ],
    related: ["coin-change", "combination-sum-iv"],
    verify: {
      fn: "numSquares",
      wrap: "plain",
      cases: [
        { args: [12], expect: 3 },
        { args: [13], expect: 2 },
        { args: [1], expect: 1 },
        { args: [2], expect: 2 },
        { args: [7], expect: 4 },
        { args: [100], expect: 1 },
      ],
    },
    xp: 20,
  },
];
