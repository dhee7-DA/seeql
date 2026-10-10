// Deep-dives — 2-D Dynamic Programming (NeetCode 150 section). Statements are
// original paraphrases; solutions verified by scripts/lc-verify. Wrap
// conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const DP_2D: LcDeepDive[] = [
  {
    slug: "unique-paths",
    statement:
      "A robot starts at the top-left corner of an m × n grid and wants to reach the bottom-right corner. It may only move right or down, one cell at a time. Count how many distinct paths exist.",
    examples: [
      { input: "m = 3, n = 7", output: "28" },
      { input: "m = 3, n = 2", output: "3", explanation: "Right-down, down-right, or the paths through the middle column — three routes." },
      { input: "m = 1, n = 5", output: "1", explanation: "A single row: the robot just walks right." },
    ],
    constraints: ["1 <= m, n <= 100", "the answer is guaranteed to fit in a 32-bit integer"],
    breakdown: [
      "Every path into cell (i, j) must arrive from (i−1, j) or (i, j−1) — those are the only allowed moves, so they are the only possible second-to-last cells. That observation IS the recurrence: dp[i][j], the number of paths to (i, j), equals dp[i−1][j] + dp[i][j−1]. Note the combiner is ADDITION, not min or max — this is a counting DP, and the filled table is literally a corner of Pascal's triangle rotated 45°.",
      "The naive misstep is enumerating paths with plain recursion — exponential, because identical subproblems (i, j) are re-derived a number of times that grows combinatorially with grid size. The fix, whether memo or table, fills in a rigid order: every cell reads only its top and left neighbours, so a single left-to-right, top-to-bottom sweep suffices. That same dependency shape is what makes the space optimization at the top of the ladder possible — row i never needs anything older than row i−1.",
    ],
    edges: [
      "A 1×n row or m×1 column has exactly one path — the dp's first row and column are all 1s, which is the base case doing all the work.",
      "m and n are asymmetric in the code but not the math: uniquePaths(3, 7) == uniquePaths(7, 3), and rolling over the shorter dimension gives the smaller row.",
      "The 32-bit guarantee is a LeetCode courtesy — for the stated bounds the count stays bounded; Python never cares either way, but C++/Java would overflow if bounds grew.",
    ],
    ladder: [
      { title: "Brute force — recursive branch at every cell", body: "paths(m, n) = paths(m−1, n) + paths(m, n−1), bottoming out at 1 when either dimension is 1. Exponential: every cell branches twice and the same (i, j) is recomputed astronomically many times." },
      { title: "Memoise / tabulate the 2-D grid", body: "Fill dp[i][j] = dp[i−1][j] + dp[i][j−1] row by row, seeding the first row and column with 1. O(m·n) time and space — correct, but the table is provably one dimension more than you need." },
      { title: "The optimal idea — one rolling row (top rung)", body: "Row i reads only row i−1 and the cell to its left, so a single 1-D array suffices: in-place row[c] += row[c−1], where row[c] still holds 'from above' and row[c−1] already holds 'from left'. O(m·n) time, O(min(m, n)) space." },
    ],
    approach: "Rolling 1-D row over grid columns",
    code: `def uniquePaths(m, n):
    row = [1] * n                     # base case: one way to cross a single row
    for _ in range(1, m):             # build each subsequent grid row
        for c in range(1, n):
            # row[c] is still "paths from above"; row[c-1] is already "from the left"
            row[c] += row[c - 1]
    return row[-1]`,
    walkthrough: [
      "dp[i][j] counts paths to (i, j); the last move was either right (from (i, j−1)) or down (from (i−1, j)), and those two families of paths are disjoint, so their counts add. The first row and column are all 1s because a monotone route along an edge is unique. The rolling row collapses the table: before the update, row[c] is the cell above; after it, row[c] is the current cell — the += is the recurrence compressed.",
      "Trace a 3×3 grid: row starts [1, 1, 1]. Grid row 2: c=1 → 1+1 = 2, c=2 → 1+2 = 3, giving [1, 2, 3]. Grid row 3: c=1 → 2+1 = 3, c=2 → 3+3 = 6, giving [1, 3, 6]. Answer 6 — and indeed C(4, 2) = 6 routes exist through a 3×3. Watch row[2] on the last pass: the 3 it reads is 'paths arriving from above', the 3 at row[1] is 'paths arriving from the left' — both live in one array at different stages of freshness.",
      "The seeded [1]*n IS row 1 of the table; the outer loop builds rows 2..m, so a 1-row input never enters the loop and returns 1 directly. Space drops from O(m·n) to the length of one row — minimize it by rolling over the shorter dimension. The count also has a closed form (see follow-ups), which is the exit interview for this problem.",
    ],
    time: "O(m · n) — every cell computed exactly once",
    space: "O(n) — one rolling row, or O(min(m, n)) if you roll the shorter side",
    followUps: [
      "Closed form: every path is an arrangement of m−1 downs and n−1 rights, so the count is C(m+n−2, m−1) — computable with factorials in O(m+n), no table at all.",
      "With obstacles (Unique Paths II): zero out blocked cells before the += and the same rolling row keeps working — the obstacle simply contributes 0 paths.",
    ],
    related: ["unique-paths-ii", "minimum-path-sum", "climbing-stairs"],
    verify: {
      fn: "uniquePaths",
      wrap: "plain",
      cases: [
        { args: [3, 7], expect: 28 },
        { args: [3, 2], expect: 3 },
        { args: [1, 1], expect: 1 },
        { args: [1, 5], expect: 1 },
        { args: [10, 10], expect: 48620 },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-common-subsequence",
    statement:
      "Given two strings, return the length of their longest common subsequence — the longest string obtainable by deleting characters from either string without reordering what remains. If they share nothing, the answer is 0.",
    examples: [
      { input: 'text1 = "abcde", text2 = "ace"', output: "3", explanation: '"ace" is the longest subsequence present in both.' },
      { input: 'text1 = "abc", text2 = "abc"', output: "3", explanation: "Identical strings share the entire string." },
      { input: 'text1 = "abc", text2 = "def"', output: "0" },
    ],
    constraints: ["1 <= text1.length, text2.length <= 1000", "both strings consist of lowercase English letters"],
    breakdown: [
      "Define dp[i][j] as the LCS length of the prefixes text1[:i] and text2[:j] — a statement about prefixes, which is exactly what lets small answers assemble big ones. When the last two characters match, they should be paired: dp[i][j] = dp[i−1][j−1] + 1. Pairing is always safe on a match — any optimal common subsequence of the prefixes can be rearranged to end with that pair without losing length.",
      "The mismatch case is where the design lives: dp[i][j] = max(dp[i−1][j], dp[i][j−1]) — drop the last character of one string or the other, keep the better prefix answer. A tempting third term, dp[i−1][j−1], is redundant: LCS is monotone in prefix length, so the diagonal never exceeds both of its right and down neighbours. Recognizing that the max(skip-i, skip-j) rule is COMPLETE — two options, not three — is the table's whole subtlety.",
      "The misstep to name out loud: enumerating subsequences of one string (2^1000 of them at these bounds) and membership-testing the other. The table holds only m·n cells and each transition is O(1) once the prefix framing is in place — the exponential structure was an artifact of thinking in whole strings instead of prefix pairs.",
    ],
    edges: [
      "Single shared character → 1: the diagonal-1 pattern in the table is the smallest nontrivial witness.",
      "All-equal strings ('aaaa' vs 'aaa') stress the match branch — the answer is the shorter length, and any recurrence that adds 1 per match without consulting the diagonal overcounts.",
      "No common characters → 0; the max branch bottoms out at the zero-seeded border row and column.",
      "Rolling-row aliasing: dp[i][j] reads dp[i−1][j−1], so a single in-place row needs a stashed diagonal value — two explicit rows is the clean fix.",
    ],
    ladder: [
      { title: "Brute force — compare all subsequences", body: "Enumerate the 2^m subsequences of text1 and check each against text2. Exponential, and the recursion tree betrays the waste: the same (i, j) prefix pairs reappear in thousands of branches." },
      { title: "Memoise the prefix pairs", body: "lcs(i, j) over prefixes with two branches — match → diagonal + 1, mismatch → drop one side. The memo grid has m·n entries; the exponential tree collapses to O(m·n) work." },
      { title: "The optimal idea — two rolling rows", body: "Row i reads only row i−1 (diagonal and above) and its own left cell, so keep prev and cur and swap. O(m·n) time, O(min(m, n)) space with the shorter string as columns." },
    ],
    approach: "Prefix LCS table, two rolling rows",
    code: `def longestCommonSubsequence(text1, text2):
    m, n = len(text1), len(text2)
    prev = [0] * (n + 1)              # dp row for text1[:i-1]
    for i in range(1, m + 1):
        cur = [0] * (n + 1)           # dp row for text1[:i]
        for j in range(1, n + 1):
            if text1[i - 1] == text2[j - 1]:
                cur[j] = prev[j - 1] + 1              # pair the two equal chars
            else:
                cur[j] = max(prev[j], cur[j - 1])     # skip one char from either side
        prev = cur
    return prev[n]`,
    walkthrough: [
      "dp[i][j] means 'the best common subsequence confined to the first i characters of text1 and the first j of text2'. On a match, take the diagonal and add the pairing — the two equal characters are consumed together. On a mismatch, one of the two final characters cannot participate in any optimal answer ending at (i, j), so drop one and keep the better: prev[j] skips text1's char, cur[j−1] skips text2's. Those two cases partition all optimal solutions, which is why the transition is exhaustive.",
      "Trace 'abcde' vs 'ace': row 1 ('a') becomes [0, 1, 1, 1] — the 'a' pairs at j=1. Row 2 ('b') stays [0, 1, 1, 1] via the skip rule. Row 3 ('c'): j=2 matches, cur[2] = prev[1] + 1 = 2 — 'ac' is born on the diagonal. Row 4 ('d') keeps [0, 1, 2, 2]; row 5 ('e') matches at j=3: prev[2] + 1 = 3. The 2 sitting at (row 3, j=2) is the pivot the final match builds on — that diagonal dependency is exactly why a single clobbered row without a saved diagonal corrupts the answer.",
      "Base cases: row 0 and column 0 are all 0 — an empty prefix shares nothing with anyone, and that zero seed is what lets the first match add 1 from thin air. Discipline around the branches matters: on a match you must NOT also consider skipping (the skip alternatives are already explored by neighbouring cells and can only be equal or worse), and on a mismatch you must NOT touch the diagonal (pairing characters that differ is meaningless).",
    ],
    time: "O(m · n) — one constant-time transition per table cell",
    space: "O(min(m, n)) — two rolling rows over the shorter string",
    followUps: [
      "Reconstruct the subsequence itself: walk back from dp[m][n], emitting the character on a match and stepping toward whichever neighbour supplied the max on a mismatch.",
      "Shortest common supersequence (LeetCode 1092) has length m + n − LCS and is built from the same table by merging from the bottom-right, emitting shared characters once.",
    ],
    related: ["edit-distance", "shortest-common-supersequence", "longest-palindromic-subsequence"],
    verify: {
      fn: "longestCommonSubsequence",
      wrap: "plain",
      cases: [
        { args: ["abcde", "ace"], expect: 3 },
        { args: ["abc", "abc"], expect: 3 },
        { args: ["abc", "def"], expect: 0 },
        { args: ["aaaa", "aaa"], expect: 3 },
        { args: ["a", "a"], expect: 1 },
        { args: ["bsbininm", "jmjkbkjkv"], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "best-time-to-buy-and-sell-stock-with-cooldown",
    statement:
      "You are given the price of a stock for each day. You may trade as many times as you like, but you may hold at most one share, you must sell before buying again, and after a sale you must rest the NEXT day — no buying the day immediately after you sell. Return the maximum total profit.",
    examples: [
      { input: "prices = [1,2,3,0,2]", output: "3", explanation: "Buy day 0 (1), sell day 1 (2), cool down day 2, buy day 3 (0), sell day 4 (2)." },
      { input: "prices = [1,2,4]", output: "3", explanation: "One long hold beats splitting — a cooldown would eat the second rise." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "Strictly falling — never trade." },
    ],
    constraints: ["1 <= prices.length <= 5000", "0 <= prices[i] <= 1000"],
    breakdown: [
      "On any given day you are in exactly one of three situations: HOLDING a share, SOLD-today (just sold, hence cooling down tomorrow), or FREE (no share, no obligations). The day × state grid is the 2-D DP: dp[i][s] = the best total profit achievable by the close of day i while ending in state s. Three states, not two, is the entire trick — the cooldown is not a rule to special-case but the SOLD state's one-day residence before maturing into FREE.",
      "The transitions are one line each: HOLD[i] = max(HOLD[i−1], FREE[i−1] − price) — keep holding or buy, and buying is reachable ONLY from FREE, which is precisely where the cooldown is enforced. SOLD[i] = HOLD[i−1] + price — selling converts the held share into cash. FREE[i] = max(FREE[i−1], SOLD[i−1]) — idleness persists, and yesterday's sale thaws into spendable cash. The answer is max(SOLD, FREE) on the final day: still holding stock at the horizon is dominated by having sold it.",
      "The misstep: encoding 'days since I sold' as a counter, or reaching for greedy 'take every rise' — greed has no clean way to respect the rest day, and the state machine shows the counter is unnecessary: SOLD already carries the information. This problem is the canonical demonstration that a finite state machine IS a 2-D DP over day × state.",
    ],
    edges: [
      "A single day → 0: max(SOLD, FREE) starts at 0 and the loop never runs.",
      "Strictly falling prices → 0 — every transaction locks in a loss and doing nothing is always available; no explicit zero floor is needed.",
      "A price of 0 is legal: buying becomes free, and the state machine handles it without a flicker.",
      "Ending while HOLDING is a valid state but never the answer — an unpocketed gain at the last day is strictly worse than having sold.",
    ],
    ladder: [
      { title: "Brute force — try every action each day", body: "Recurse f(day, situation) where the situation includes a 'sold yesterday' flag: buy, sell, or rest where legal, max at the end. Exponential — the same (day, situation) is re-derived across many transaction histories." },
      { title: "Memoise the day-state grid", body: "Only 3n distinct situations exist. Tabulate three columns per day, each reading only the previous day: O(n) time, O(n) space — and the table makes the O(1)-per-day structure impossible to miss." },
      { title: "The optimal idea — three rolling scalars", body: "Each day reads only yesterday, so the grid compresses to three variables updated as a simultaneous tuple. O(n) time, O(1) space — the ladder's top rung and the standard interview answer." },
    ],
    approach: "Three-state machine (held / sold / free), rolling scalars",
    code: `def maxProfit(prices):
    hold = -prices[0]     # best profit ending today while HOLDING a share
    sold = 0              # best profit ending today having JUST sold
    free = 0              # best profit ending today idle and unpenalised
    for price in prices[1:]:
        # simultaneous update: all three read YESTERDAY's state
        hold, sold, free = (
            max(hold, free - price),   # keep holding, or buy (only from free)
            hold + price,              # sell the share we were holding
            max(free, sold),           # stay idle, or yesterday's sale matures
        )
    return max(sold, free)   # never optimal to still be holding at the end`,
    walkthrough: [
      "The tuple assignment evaluates all three right-hand sides against yesterday's state before any is overwritten — that simultaneity is the correctness hinge. Update sequentially in the wrong order and yesterday's SOLD leaks into today's FREE before HOLD reads it, allowing a buy the day after a sale: the cooldown silently disappears. With the tuple, the cooldown lives in exactly one edge — the buy transition sources from FREE, and FREE cannot contain a sale until one full day has passed.",
      "Trace [1,2,3,0,2]: start hold=−1, sold=0, free=0. Day 2 (price 2): hold=max(−1,−2)=−1, sold=1, free=0. Day 3 (price 3): sold=2, free=1 — note sold=1 matured into free, arming tomorrow's buy. Day 4 (price 0): hold=max(−1, 1−0)=1 (bought from the thawed free), sold=−1, free=2. Day 5 (price 2): sold=1+2=3 → answer 3, which is exactly the buy-sell-cooldown-buy-sell schedule from the example. The −1 sold value on day 4 is fine: it records a real (bad) trade that the max discards.",
      "Base cases: day 0 initializes hold=−prices[0] (the only way to hold is to buy) and sold=free=0 (doing nothing is worth 0; the sold=0 seed is a harmless virtual 'bought and sold instantly' that never wins an argmax). A single-day input returns max(0, 0)=0 without entering the loop. Falling sequences keep sold ≤ 0 and free = 0 throughout, so the 0 floor of the answer is automatic — no special case at the end.",
    ],
    time: "O(n) — one constant-size update per day",
    space: "O(1) — three scalars",
    followUps: [
      "Transaction fee (LeetCode 714): subtract the fee inside the sell transition, sold = hold + price − fee — same three-state machine, one constant changed.",
      "A cooldown of k days: SOLD must age k days before maturing into FREE — keep a k-long queue of resting states; the day × state picture grows a dimension of patience, the method does not change.",
    ],
    related: ["best-time-to-buy-and-sell-stock-ii", "best-time-to-buy-and-sell-stock-with-transaction-fee", "best-time-to-buy-and-sell-stock-iv"],
    verify: {
      fn: "maxProfit",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 0, 2]], expect: 3 },
        { args: [[1]], expect: 0 },
        { args: [[1, 2, 4]], expect: 3 },
        { args: [[7, 6, 4, 3, 1]], expect: 0 },
        { args: [[2, 1]], expect: 0 },
        { args: [[6, 1, 3, 2, 4, 7]], expect: 6 },
      ],
    },
    xp: 20,
  },
  {
    slug: "coin-change-ii",
    statement:
      "You hold coins of several distinct denominations with an unlimited supply of each. Count how many distinct COMBINATIONS of coins sum to the target amount — two selections that differ only in the order of coins are the same combination. If nothing sums to the amount, the count is 0.",
    examples: [
      { input: "amount = 5, coins = [1,2,5]", output: "4", explanation: "1+1+1+1+1, 1+1+1+2, 1+2+2, 5." },
      { input: "amount = 3, coins = [2]", output: "0", explanation: "No way to reach 3 from 2s." },
      { input: "amount = 10, coins = [10]", output: "1" },
    ],
    constraints: ["0 <= amount <= 5000", "1 <= coins.length <= 300", "1 <= coins[i] <= 5000, all distinct", "the answer fits in a 32-bit integer"],
    breakdown: [
      "dp[a] = the number of ways to make amount a using only the coins PROCESSED SO FAR — and the phrase 'so far' is doing enormous work. Processing coins one at a time (coins outer, amounts inner) means dp[a] can never conflate 1+2 with 2+1: while the 2-coin is being applied, every partial sum was built from 1s alone, so each multiset is generated exactly once, in the coins' array order. That canonical generation order is what 'combination' means operationally.",
      "Swap the loops — amounts outer, coins inner — and the SAME recurrence counts something different: dp[a] += dp[a − c] over all c at every amount lets any coin follow any other, so 1+2 and 2+1 both count: you are now enumerating ORDERED sequences. That variant is a different LeetCode problem (Combination Sum IV, permutations). Nothing in the DP changed except the loop nesting — loop order is the semantic switch between combinations and permutations, and it is the centerpiece of this problem.",
      "Two classic slips: forgetting dp[0] = 1 (one way to make zero — the empty choice, the seed every other count hangs from), and iterating the inner amount loop downward as if coins were single-use. Here the supply is unlimited, so the inner loop ascends and re-uses the current coin freely; the direction that carries meaning is the NESTING, not the step.",
    ],
    edges: [
      "amount = 0 → 1 (the empty combination), regardless of the coin list — dp[0] = 1 is the base case.",
      "Impossible amounts (3 from [2]) → 0: untouched cells simply stay zero.",
      "A coin larger than the amount contributes nothing — its inner loop range is empty.",
      "The count can grow past 32 bits in principle; LeetCode guarantees it fits, and Python shrugs at big integers regardless.",
    ],
    ladder: [
      { title: "Brute force — recursive choice per coin", body: "count(amount, i) = count(amount − coins[i], i) (reuse coin i) + count(amount, i+1) (retire it), tallying one way at amount 0. Exponential — the same (amount, i) states recur across a tree that explores orderings it shouldn't." },
      { title: "Memoise (amount, first-available-coin)", body: "The state space is amount × len(coins), and the coin index in the state is the fingerprint of 'coins processed so far' — it is precisely what makes 1+2 and 2+1 identical. O(amount · len(coins)) memoised." },
      { title: "The optimal idea — one rolling row, coins outer", body: "State i only transitions to i or i+1, so the 2-D table compresses to one array reused across coins: for each coin, sweep amounts upward, adding dp[a − coin]. O(amount · len(coins)) time, O(amount) space." },
    ],
    approach: "Unbounded-knapsack counting row, coins-outer",
    code: `def change(amount, coins):
    dp = [0] * (amount + 1)   # dp[a]: combinations making a with coins so far
    dp[0] = 1                 # one way to make 0: choose nothing
    for coin in coins:        # OUTER over coins -> order is never counted
        for a in range(coin, amount + 1):   # upward: the coin may be reused
            dp[a] += dp[a - coin]           # append one more of this coin
    return dp[amount]`,
    walkthrough: [
      "For the coin currently being processed, dp[a] += dp[a − coin] says: every way to build a − coin extends to a way to build a by appending this coin. Because appends happen only during THIS coin's pass and only onto sums built from earlier coins, each multiset is counted exactly once — its coins appear in the array's order, which is unique per multiset. After coin k's pass, dp[a] counts combinations drawn from coins[0..k], which is the induction the final answer rides on.",
      "Trace amount 5, coins [1,2,5]: after the 1-coin, dp = [1,1,1,1,1,1] (ones only). After the 2-coin: dp[2] += dp[0] → 2; dp[3] += dp[1] → 2; dp[4] += dp[2] → 3; dp[5] += dp[3] → 3, giving [1,1,2,2,3,3]. After the 5-coin: dp[5] += dp[0] → 4. The four combinations are 1+1+1+1+1, 1+1+1+2, 1+2+2, 5 — and note 1+2 was never also counted as 2+1, because 2s can only be appended during the 2-coin's pass, on top of sums already pure in 1s.",
      "Base case dp[0] = 1: any walk that lands exactly on zero has completed one combination, and it is also the entire answer when amount is 0. Reverse the nesting and dp[5] over [1,2,5] becomes 9 — every ordering of those four multisets — the permutation count instead of the combination count. Impossible amounts read 0 because no walk ever seeds them; the code never needs an explicit impossibility branch.",
    ],
    time: "O(amount · len(coins)) — one sweep of the row per coin",
    space: "O(amount) — a single rolling row",
    followUps: [
      "Swap the loops deliberately and you get Combination Sum IV: the count of ordered sequences — same recurrence, opposite nesting, different answer. Being able to articulate WHY is the whole lesson.",
      "Reconstruct the combinations: keep parent links (which coin extended which amount) and walk back from dp[amount] — worth having ready when the follow-up is 'show me the actual ways'.",
    ],
    related: ["coin-change", "combination-sum-iv", "target-sum"],
    verify: {
      fn: "change",
      wrap: "plain",
      cases: [
        { args: [5, [1, 2, 5]], expect: 4 },
        { args: [3, [2]], expect: 0 },
        { args: [0, [7]], expect: 1 },
        { args: [10, [10]], expect: 1 },
        { args: [6, [1, 2, 3]], expect: 7 },
        { args: [4, [1, 2, 3]], expect: 4 },
      ],
    },
    xp: 20,
  },
  {
    slug: "target-sum",
    statement:
      "Place a '+' or '−' sign in front of every number in the array so that the resulting expression evaluates to the target. Count how many distinct sign assignments achieve it — two assignments are different if any number's sign differs.",
    examples: [
      { input: "nums = [1,1,1,1,1], target = 3", output: "5", explanation: "Five ways to choose which single 1 is negative." },
      { input: "nums = [1], target = 1", output: "1", explanation: "Only '+1' works." },
      { input: "nums = [1], target = 2", output: "0", explanation: "One coin, two signs — 2 is out of reach." },
    ],
    constraints: ["1 <= nums.length <= 20", "0 <= nums[i] <= 1000", "0 <= sum(nums) <= 1000", "-1000 <= target <= 1000"],
    breakdown: [
      "Let P be the sum of the plus-sign subset and N the sum of the minus-sign subset (magnitudes). Then P − N = target and P + N = total, so P = (total + target) / 2. The problem was secretly a subset-sum count all along: count the subsets of nums summing to (total + target) / 2, because every plus-subset determines its minus-complement uniquely. This transformation is the entire problem — the DP afterwards is the standard 0/1 knapsack in counting form.",
      "Validity falls out of the algebra: total + target must be even and 0 ≤ P ≤ total — anything else is instantly 0. Parity is a real invariant, not a corner: flipping any one sign changes the evaluation by an even amount (2·num), so odd offsets are unreachable no matter how you try. Producing the odd/impossible guard BEFORE building any table is the interview flex that shows you derived the transformation rather than memorizing it.",
      "The zero trap deserves its own sentence: a 0 can be signed either way without changing the sum, so each zero doubles the count. The knapsack handles this for free — including or skipping a 0 are two different subsets with the same sum, and both get counted, which is exactly the ±0 multiplicity you want.",
    ],
    edges: [
      "total + target odd → 0 immediately — no table, no search.",
      "|target| > total → 0: P would fall outside [0, total].",
      "Zeros double the count with each zero — the subset-sum DP counts subset POSITIONS, not just achievable sums.",
      "target = total (all plus) and target = −total (all minus) exercise the P = total and P = 0 boundaries of the table.",
    ],
    ladder: [
      { title: "Brute force — the sign tree", body: "Recurse over indices carrying a running sum, branching + and −. 2^n leaves: acceptable at n = 20 (about a million), dead on arrival at n = 200. It also learns nothing reusable — each leaf is a dead end." },
      { title: "Memoise (index, running sum)", body: "Running sums live in [−total, total], so the memo is n × (2·total+1) — O(n · total) time. The negative sums need an offset or a dict, and that awkwardness is the first hint a cleaner subset-sum is hiding underneath." },
      { title: "The optimal idea — transform to subset-sum, one rolling row", body: "Count subsets summing to P = (total + target)/2 with the standard knapsack count: one row over [0..P], budgets swept DOWNWARD so each number is used once. O(n · total) time, O(total) space." },
    ],
    approach: "Subset-sum transformation + downward 1-D knapsack count",
    code: `def findTargetSumWays(nums, target):
    total = sum(nums)
    if (total + target) % 2 or abs(target) > total:
        return 0                  # P = (total + target) / 2 is unreachable
    p = (total + target) // 2     # now: count subsets of nums summing to p
    dp = [0] * (p + 1)            # dp[s]: subsets processed so far summing to s
    dp[0] = 1                     # the empty subset
    for num in nums:
        for s in range(p, num - 1, -1):   # DOWNWARD: each number used once
            dp[s] += dp[s - num]
    return dp[p]`,
    walkthrough: [
      "The algebra first: P − N = target and P + N = total force P = (total + target)/2, and since every element lands on exactly one side, choosing the plus set IS the assignment — nothing is double counted. The knapsack then counts subsets hitting P: for each num, dp[s] += dp[s − num] extends every subset summing to s − num by this number. The DOWNWARD sweep is what makes that sound: dp[s − num] must still be a pre-round value when read, or the number could be consumed twice within one subset — this is 0/1, not unbounded.",
      "Trace [1,1,1,1,1] with target 3: total = 5, P = 4. Start dp = [1,0,0,0,0]. After one 1: [1,1,0,0,0]. After two: [1,2,1,0,0]. After three: [1,3,3,1,0]. After four: [1,4,6,4,1]. After five: [1,5,10,10,5] — Pascal's triangle, exactly, because five equal 1s make subset counts binomial. dp[4] = 5: the five ways to pick which single 1 is negative. The trace doubles as proof the count is over subsets, not sign sequences.",
      "Base case dp[0] = 1 seeds the empty subset and is itself the answer when target = −total (everything minus). Zeros extend dp[s] with dp[s − 0] = dp[s], doubling every reachable cell — the correct ±0 multiplicity, for free. The parity and |target| guards run before any allocation, so impossible inputs cost O(1) — and note the code never negative-indexes: P ≥ 0 is guaranteed by the guards.",
    ],
    time: "O(n · total) — one downward sweep per number",
    space: "O(total) — one row over subset sums",
    followUps: [
      "Huge values (sum up to 10^9, n ≈ 40): the subset table becomes unallocable — meet-in-the-middle enumerates 2^(n/2) signed sums per half and matches complements through a hash map.",
      "Return one actual assignment: after the DP, walk the numbers backwards deciding whether each belongs to the plus subset (does the remaining subtarget include it?) and emit signs accordingly.",
    ],
    related: ["partition-equal-subset-sum", "last-stone-weight-ii", "coin-change-ii"],
    verify: {
      fn: "findTargetSumWays",
      wrap: "plain",
      cases: [
        { args: [[1, 1, 1, 1, 1], 3], expect: 5 },
        { args: [[1], 2], expect: 0 },
        { args: [[1], 1], expect: 1 },
        { args: [[0, 0, 1], 1], expect: 4 },
        { args: [[1, 2, 3, 4, 5], 3], expect: 3 },
        { args: [[1000], -1000], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "interleaving-string",
    statement:
      "Given strings s1, s2 and s3, decide whether s3 is an interleaving of s1 and s2: all characters of both are used, in their original relative order within each string, merged into exactly s3. Note the bar is higher than 's3 merely contains both as subsequences' — every character of s3 must be accounted for by one of the two sources.",
    examples: [
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbcbcac"', output: "true", explanation: "A working split: aa | d | bbc | c | a | bc | a | c." },
      { input: 's1 = "aabcc", s2 = "dbbca", s3 = "aadbbbaccc"', output: "false" },
      { input: 's1 = "", s2 = "", s3 = ""', output: "true" },
    ],
    constraints: ["0 <= s1.length, s2.length <= 100", "0 <= s3.length <= 200", "all strings consist of lowercase English letters"],
    breakdown: [
      "The build is a two-front consumption: at every step the next character of s3 is peeled from the front of s1, from the front of s2, or (if neither front matches) the answer is no. So dp[i][j] = 'the first i + j characters of s3 are a perfect interleaving of s1[:i] and s2[:j]'. It is a FEASIBILITY DP — boolean values combined with OR, since a single viable source suffices; there is nothing to maximize.",
      "The transition mirrors the two fronts: dp[i][j] is true if the char came from s1 — dp[i−1][j] and s1[i−1] == s3[i+j−1] — or from s2 — dp[i][j−1] and s2[j−1] == s3[i+j−1]. The coupled index i+j−1 is the heartbeat: consuming one character from either front advances the s3 cursor by exactly one. The OR is sound because the two terms describe disjoint sources for the SAME next character.",
      "Filter first: len(s1) + len(s2) must equal len(s3) — an immediate false, and also what keeps every i+j−1 index inside s3 for the rest of the code. The misstep worth naming: a greedy two-pointer that consumes whichever front matches steers into dead ends when both fronts offer the same character — the table exists precisely to remember BOTH choices instead of committing to one.",
    ],
    edges: [
      "All-empty: dp[0][0] = true anchors the whole table — '' interleaves '' and '' perfectly.",
      "One source empty: the answer degenerates to s2 == s3 (or s1 == s3); the border row/column of the table checks exactly that, cell by cell.",
      "Equal characters at both fronts ('a' vs 'ab' vs 'aab') force a genuine branch — this is where greedy fails and the OR-term earns its keep.",
      "Without the length guard, s3[i+j−1] can index out of the string — guard first, DP second.",
    ],
    ladder: [
      { title: "Brute force — recursive two-front choice", body: "interleave(i, j): try consuming from s1 if it matches the s3 cursor, try s2 likewise, OR the outcomes. Exponential with repeated characters — the same (i, j) frontier is reached by many orderings." },
      { title: "Memoise the frontier pair", body: "Only (i, j) pairs matter — m·n of them. A 2-D boolean table filled row by row gives O(m·n) time and space; booleans OR-combined make every transition constant-time." },
      { title: "The optimal idea — one rolling row", body: "Row i reads row i−1 (same j) and its own left neighbour, so prev/cur rows give O(min(m, n)) space — which is also exactly the official follow-up's O(len(s2)) bound." },
    ],
    approach: "Two-front feasibility table, rolling row",
    code: `def isInterleave(s1, s2, s3):
    m, n = len(s1), len(s2)
    if m + n != len(s3):
        return False                    # lengths must tile s3 exactly
    prev = [True] + [False] * n         # row i = 0: s3[:j] must come entirely from s2
    for j in range(1, n + 1):
        prev[j] = prev[j - 1] and s2[j - 1] == s3[j - 1]
    for i in range(1, m + 1):
        cur = [False] * (n + 1)
        cur[0] = prev[0] and s1[i - 1] == s3[i - 1]   # s3[:i] all from s1
        for j in range(1, n + 1):
            c = s3[i + j - 1]           # the next s3 character to source
            cur[j] = ((prev[j] and s1[i - 1] == c) or
                      (cur[j - 1] and s2[j - 1] == c))
        prev = cur
    return prev[n]`,
    walkthrough: [
      "dp[i][j] asks: can s3[:i+j] be split so the s1-sourced characters are exactly s1[:i] in order and the rest exactly s2[:j]? The two OR-terms hand the next s3 character to one front or the other; each term chains a validity check of the character itself with the reachability of the frontier it would extend. Feasibility, not optimization: no weights, no min/max — a single surviving path through the grid means yes.",
      "Trace s1='ab', s2='cd', s3='acbd': row 0 is [T, F, F] — 'a' != 'c', so s2 alone can't front-run. Row 1 (s1[0]='a'): cur[0] = 'a' == s3[0] → T; j=1 (c='c'): prev[1]=F, but cur[0] and s2[0]=='c' → T — the 'c' arrives from s2; j=2 (c='b'): nothing matches → F. Row 2 (s1[1]='b'): cur[0] = 'b' vs s3[1]='c' → F; j=1 (c='b'): prev[1]=T and s1[1]=='b' → T — now s1 takes over; j=2 (c='d'): cur[1] and s2[1]=='d' → T. The sourcing switched from s2 to s1 to s2 mid-string, and the OR let each switch happen exactly where it needed to.",
      "Base cases: prev[0] = true anchors the empty frontier; the i=0 row is pure s2 (s3[:j] must equal s2[:j] cell by cell) and the j=0 column is pure s1, built incrementally by cur[0] = prev[0] and match. Both are just the recurrence with the other string's term removed — the code needs no special cases beyond the length guard. The final read is prev[n] after the last row: the full-cursor frontier.",
    ],
    time: "O(m · n) — one boolean transition per frontier pair",
    space: "O(n) — one rolling row over s2",
    followUps: [
      "Count the interleavings instead of deciding: replace OR with + — but beware that shared characters between s1 and s2 make distinct index-splits produce identical strings, so counting DISTINCT strings needs deduplication on top.",
      "Three or more source strings: the state grows to (i1, i2, ..., ik) with the s3 cursor implied by the sum — same OR-recurrence, k-dimensional table, same length guard first.",
    ],
    related: ["edit-distance", "distinct-subsequences", "regular-expression-matching"],
    verify: {
      fn: "isInterleave",
      wrap: "plain",
      cases: [
        { args: ["aabcc", "dbbca", "aadbbcbcac"], expect: true },
        { args: ["aabcc", "dbbca", "aadbbbaccc"], expect: false },
        { args: ["", "", ""], expect: true },
        { args: ["", "abc", "abc"], expect: true },
        { args: ["abc", "", "abc"], expect: true },
        { args: ["a", "ab", "aab"], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-increasing-path-in-a-matrix",
    statement:
      "Given a matrix of integers, find the length of the longest path that moves between 4-directionally ADJACENT cells (up, down, left, right) with strictly increasing values along the way. A single cell counts as a path of length 1.",
    examples: [
      { input: "matrix = [[9,9,4],[6,6,8],[2,1,1]]", output: "4", explanation: "The path 1 → 2 → 6 → 9." },
      { input: "matrix = [[3,4,5],[3,2,6],[2,2,1]]", output: "4", explanation: "The path 3 → 4 → 5 → 6." },
      { input: "matrix = [[1]]", output: "1" },
    ],
    constraints: ["1 <= m, n <= 200 with m · n <= 2·10^4", "0 <= matrix[i][j] <= 2^31 - 1"],
    breakdown: [
      "Define dp[cell] = the length of the longest strictly-increasing path that STARTS at that cell. Its recurrence fans out over neighbours: dp[c] = 1 + max(dp[n] for neighbours n with value strictly greater than c's), or plain 1 if none qualify. The DP is over cells, not indices, and the memoised DFS below is just this recurrence with a cache — the grid is an implicit DAG and dp is its longest-path table.",
      "The STRICTLY-increasing rule is not a detail; it is the load-bearing wall. Because every move goes to a larger value, no path can ever revisit a cell — the implicit graph has no cycles, which is exactly the precondition for 'memoise and recurse' to terminate. Relax it to non-decreasing and two equal-valued neighbours point at each other, the recursion never bottoms out, and the problem changes species: it would need a visited set / cycle detection, not a memo. Explaining WHY strictness buys acyclicity is the teaching point of the whole exercise.",
      "Missteps: treating it as a global BFS with levels (path length here is per starting cell, not a distance field), and running plain DFS from every cell without memo — every ascending corridor gets re-explored from every entry point, which is exponential re-derivation of identical subproblems.",
    ],
    edges: [
      "All-equal matrix → every cell answers 1; the '>' guard rejects all moves. This is precisely the input that would hang a non-strict version.",
      "Single cell → 1; the max over a one-cell grid still has to run.",
      "The longest path need not start at the largest value — it starts wherever the tallest staircase begins, so every cell is a candidate root and the final max is over all cells.",
      "Deep snake inputs make recursion depth ≈ path length; the bottom-up value sweep in the ladder avoids the stack entirely.",
    ],
    ladder: [
      { title: "Brute force — DFS from every cell, no memory", body: "From each cell recurse into all four greater neighbours. Correct but exponential: a grid of descending staircases makes every cell re-derive its downstream chain over and over." },
      { title: "Memoise per cell (the pattern)", body: "One memo entry per cell: longest path starting there. Strictness makes the implicit graph acyclic, so recursion is guaranteed to land on memoised cells and terminate. O(m·n) states, four transitions each." },
      { title: "The optimal idea — sweep cells in increasing value order", body: "Sort cells by value and fill dp bottom-up: each cell reads only its already-computed strictly-smaller neighbours. Same O(m·n) core plus a sort, no recursion stack — and it is Kahn's topological peeling in disguise, since the value order IS a topological order of the DAG." },
    ],
    approach: "Memoised DFS over the implicit DAG of cells",
    code: `def longestIncreasingPath(matrix):
    rows, cols = len(matrix), len(matrix[0])
    memo = {}                       # (r, c) -> longest increasing path STARTING here

    def dfs(r, c):
        if (r, c) in memo:
            return memo[(r, c)]
        best = 1                    # the cell alone is a path of length 1
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            # strictly greater -> moves only flow "upward" -> no cycles possible
            if 0 <= nr < rows and 0 <= nc < cols and matrix[nr][nc] > matrix[r][c]:
                best = max(best, 1 + dfs(nr, nc))
        memo[(r, c)] = best
        return best

    return max(dfs(r, c) for r in range(rows) for c in range(cols))`,
    walkthrough: [
      "dp[(r, c)] is the longest climb beginning at (r, c); it is 1 plus the best of the (up to four) strictly-greater neighbours' answers. Each cell computes once and is re-read many times — the memo converts exponential corridor re-exploration into one computation plus O(1) lookups per cell. The '>' guard does double duty: it is the transition filter AND the acyclicity proof, which is why no visited set appears anywhere in the code.",
      "Trace [[9,9,4],[6,6,8],[2,1,1]]: dfs(9 at (0,0)) finds no greater neighbour (the other 9 is equal, rejected) → 1. dfs(6 at (1,0)) sees 9 above → 1 + 1 = 2. dfs(2 at (2,0)) sees 6 → 1 + 2 = 3. Now dfs(1 at (2,1)): neighbours 2 (dp 3) and 6 (dp 2) → 1 + max(3, 2) = 4. Every 9 and the plateau cells cost O(1) after their first computation, and the final max reads 4 — the path 1 → 2 → 6 → 9.",
      "Base cases: a cell with no strictly greater neighbour — any local maximum — returns 1; that is the recursion's floor and the DP's seed. Termination is the subtle base case: the value-strict filter guarantees the recursion graph is a DAG, so every chain ends at a local maximum regardless of entry point. The final answer is a max over all cells because the tallest staircase can begin anywhere in the grid.",
    ],
    time: "O(m · n) — each cell's dfs computes once, four neighbour checks each",
    space: "O(m · n) — the memo (plus recursion stack, worst case as long as the longest path)",
    followUps: [
      "Topological order without recursion: a cell's out-degree is its count of strictly greater neighbours; peel zero-out-degree cells level by level (Kahn's algorithm) — the number of peeling rounds IS the answer.",
      "Count the distinct longest paths, or reconstruct one: keep the argmax neighbour per cell and walk; counting multiplies path counts along the DAG instead of maxing them.",
    ],
    related: ["course-schedule", "number-of-islands", "longest-increasing-subsequence"],
    verify: {
      fn: "longestIncreasingPath",
      wrap: "plain",
      cases: [
        { args: [[[9, 9, 4], [6, 6, 8], [2, 1, 1]]], expect: 4 },
        { args: [[[3, 4, 5], [3, 2, 6], [2, 2, 1]]], expect: 4 },
        { args: [[[1]]], expect: 1 },
        { args: [[[7, 7], [7, 7]]], expect: 1 },
        { args: [[[1, 2, 3, 4, 5]]], expect: 5 },
      ],
    },
    xp: 35,
  },
  {
    slug: "distinct-subsequences",
    statement:
      "Count how many distinct subsequences of s equal t. Two picks count separately whenever they use a different set of positions in s — even if the resulting strings are letter-for-letter identical.",
    examples: [
      { input: 's = "rabbbit", t = "rabbit"', output: "3", explanation: "Three ways to choose which two of the three b's form the double-b." },
      { input: 's = "babgbag", t = "bag"', output: "5" },
      { input: 's = "aaa", t = "a"', output: "3", explanation: "Each of the three positions is its own subsequence." },
    ],
    constraints: ["1 <= s.length, t.length <= 1000", "s and t consist of English letters"],
    breakdown: [
      "dp[i][j] = the number of ways t[:j] occurs as a subsequence of s[:i] — counting POSITION SETS, not string values. Split on what s's i-th character does: skip it and dp[i][j] inherits dp[i−1][j]; spend it as t's j-th character (legal only when they match) and it contributes dp[i−1][j−1]. So dp[i][j] = dp[i−1][j] + (s[i−1] == t[j−1] ? dp[i−1][j−1] : 0) — a sum, because the two fates of the character are mutually exclusive and both fully valid alignments.",
      "This is edit-distance's optimistic cousin: the same prefix-pair table, but '+' where edit-distance takes 'min', and no penalty branches — matching is free, everything else is structure. The counting-over-positions semantics is why ('aaa', 'a') is 3 rather than 1: the DP counts alignments, and identical-looking picks from repeated letters are different alignments.",
      "The scale warning is part of the problem: for 1000-character inputs the count can dwarf 2^63 — Python's big integers absorb it; C++/Java need the contest's usual modulus or an explicit overflow story. And the classic implementation trap is the in-place 1-D update, which can let ONE character of s match SEVERAL characters of t (details in the walkthrough) — hence the explicit next-row buffer in the featured code.",
    ],
    edges: [
      "t longer than s → 0: not enough positions to draw from.",
      "Single-character t: the answer is just the frequency of that character in s — the cheapest sanity check.",
      "All-equal strings ('aaa' vs 'aa') → C(3, 2) = 3; the table reproduces Pascal's triangle on equal-letter inputs.",
      "The in-place clobber trap: updating one row left-to-right reads already-updated cells and overcounts — sweep right-to-left in place or use a next buffer.",
    ],
    ladder: [
      { title: "Brute force — recursive take-or-skip", body: "count(i, j) = count(i+1, j) (skip s[i]) + (match ? count(i+1, j+1) : 0), anchoring at j == len(t). Exponential on repetitive strings — every b in 'rabbbit' spawns its own subtree." },
      { title: "Memoise the (i, j) grid", body: "The position-pair grid has (m+1)(n+1) cells; memo or bottom-up table fills it in O(m·n). Crucially the recurrence never reads row i — only row i−1 — which is the lever the next rung pulls." },
      { title: "The optimal idea — rolling row with a NEXT buffer", body: "Build cur strictly from prev, then swap — no aliasing possible. The tempting single-array in-place update corrupts on ascending j (clobber trap); descending in-place or an explicit next row are the two safe forms. O(m·n) time, O(n) space." },
    ],
    approach: "Rolling 1-D count with an explicit next-row buffer",
    code: `def numDistinct(s, t):
    n = len(t)
    prev = [0] * (n + 1)      # prev[j]: ways t[:j] occurs in the s-prefix so far
    prev[0] = 1               # empty t: exactly one way — pick nothing
    for ch in s:
        cur = [0] * (n + 1)   # the NEXT row, built from prev only
        cur[0] = 1            # empty t still occurs once in any prefix
        for j in range(1, n + 1):
            cur[j] = prev[j]              # fate 1: skip this s-character
            if ch == t[j - 1]:
                cur[j] += prev[j - 1]     # fate 2: spend it on t[j-1]
        prev = cur
    return prev[n]`,
    walkthrough: [
      "Each s-character makes one binary choice per t-prefix: contribute to the alignment or not. cur[j] adds prev[j] (don't spend ch) and, on a match, prev[j−1] (spend ch as t's j-th character). Because cur reads ONLY prev, one s-character can be spent at most once per alignment — that is the invariant that keeps the count honest, and it is exactly what the in-place ascending update violates: there, cur[j−1] has already absorbed ch, so ch could match t[j−2] and t[j−1] simultaneously.",
      "Trace 'babgbag' vs 'bag', showing prev after each character: after 'b': [1,1,0,0]; after 'a': [1,1,1,0] (the 'a' promoted 'ba' into view); after 'b': [1,2,1,0] (two ways to have seen a 'b'); after 'g': [1,2,1,1] (first complete 'bag', via the diagonal from dp[2]=1); after 'b': [1,3,1,1] (three b's seen); after 'a': [1,3,4,1] ('ba' alignments jump to 4 via the diagonal from the b-count 3); after the final 'g': [1,3,4,5] — dp[3] += dp[2] = 1 + 4 = 5. The last cell is fed entirely by the diagonal chain: every complete 'bag' is a 'ba' alignment extended by this g.",
      "Base cases: prev[0] = 1 in EVERY row — the empty t occurs exactly once in any s-prefix, as the empty selection, and it is the seed every diagonal '+1' chain climbs from. Forgetting to reset cur[0] = 1 each row zeroes the anchor and collapses everything downstream. Cells beyond what the prefix can support stay 0 — no alignment exists — so the answer for t longer than s is 0 without any explicit check.",
    ],
    time: "O(m · n) — one row build per character of s",
    space: "O(n) — two rows over t (the next buffer included)",
    followUps: [
      "Fixed-width languages: counts overflow 64-bit well before the inputs max out — compute modulo a prime (the usual contest demand) or use big integers; Python needs nothing.",
      "Distinct Subsequences II (LeetCode 940) counts the distinct subsequences of ONE string with no target: dedupe by 'extend only sequences not ending in this character' — last-occurrence bookkeeping replaces the two-string table.",
    ],
    related: ["edit-distance", "interleaving-string", "distinct-subsequences-ii"],
    verify: {
      fn: "numDistinct",
      wrap: "plain",
      cases: [
        { args: ["rabbbit", "rabbit"], expect: 3 },
        { args: ["babgbag", "bag"], expect: 5 },
        { args: ["aaa", "a"], expect: 3 },
        { args: ["a", "aa"], expect: 0 },
        { args: ["abc", "abc"], expect: 1 },
        { args: ["b", "a"], expect: 0 },
      ],
    },
    xp: 35,
  },
  {
    slug: "edit-distance",
    statement:
      "Given two words, return the minimum number of single-character operations — insert a character, delete a character, or replace a character — needed to turn the first word into the second.",
    examples: [
      { input: 'word1 = "horse", word2 = "ros"', output: "3", explanation: "horse → rorse (replace h), → rose (delete r), → ros (delete e)." },
      { input: 'word1 = "intention", word2 = "execution"', output: "5" },
      { input: 'word1 = "", word2 = "abc"', output: "3", explanation: "Three inserts; the empty word is fair game." },
    ],
    constraints: ["0 <= word1.length, word2.length <= 500", "both words consist of lowercase English letters"],
    breakdown: [
      "dp[i][j] = the minimum operations converting word1[:i] into word2[:j] — the Levenshtein recurrence. Read the LAST operation rather than the first: if the two final characters agree, no operation needs to touch them, so dp[i][j] = dp[i−1][j−1]. Otherwise the script's final move was exactly one of: replace (make the finals agree, inherit dp[i−1][j−1]), delete word1's last char (dp[i−1][j]), or insert word2's last char (dp[i][j−1]) — take 1 + the cheapest of the three.",
      "Why anchor at the END: the last operation leaves two clean, independent prefixes behind it, while the first operation tangles everything that follows. This last-step framing is the shared skeleton of all string 2-D DP — LCS, distinct-subsequences and interleaving all ask 'what happened to the final characters?'. Edit-distance's answer just happens to have three branches instead of two.",
      "The completeness claim deserves a beat: replace subsumes the delete+insert pair that would otherwise handle mismatched finals, so the three-way min misses nothing. And on a match, taking the diagonal unconditionally is safe because edit distance obeys the triangle inequality — routing around a matched pair via delete/insert can never be cheaper than keeping it.",
    ],
    edges: [
      "Empty word1 → len(word2) inserts; empty word2 → len(word1) deletes — the border row and column ARE those answers, seeded directly.",
      "Identical words → 0: the whole computation rides the diagonal.",
      "One-op boundaries ('a'→'b' replace, ''→'x' insert, 'x'→'' delete) are the quickest off-by-one detectors.",
      "The table is symmetric — inserting into word1 mirrors deleting from word2 — so you can always roll over the shorter word.",
    ],
    ladder: [
      { title: "Brute force — recursive last-op branching", body: "ed(i, j) branches three ways on a mismatch (replace / delete / insert), recursing on the resulting prefixes. Exponential: each branch re-derives the same (i, j) tails across overlapping call trees." },
      { title: "Memoise / tabulate the prefix grid", body: "m·n states, O(1) transitions. The bottom-up table seeds row 0 with j (build word2[:j] by inserts) and column 0 with i (delete everything), then fills with the three-way min. O(m·n) time and space." },
      { title: "The optimal idea — two rolling rows", body: "Row i reads row i−1 and its own left cell, so prev/cur rows — or one row plus a stashed diagonal — give O(min(m, n)) space. O(m·n) time is essentially optimal: a near-quadratic lower bound is known conditional on SETH, which is a nice flex if the interviewer pushes." },
    ],
    approach: "Levenshtein table, last-operation recurrence, two rolling rows",
    code: `def minDistance(word1, word2):
    m, n = len(word1), len(word2)
    prev = list(range(n + 1))          # row i = 0: "" -> word2[:j] costs j inserts
    for i in range(1, m + 1):
        cur = [i] + [0] * n            # word1[:i] -> "" costs i deletes
        for j in range(1, n + 1):
            if word1[i - 1] == word2[j - 1]:
                cur[j] = prev[j - 1]   # finals agree: inherit the prefix cost
            else:
                cur[j] = 1 + min(
                    prev[j - 1],       # replace word1[i-1] to match word2[j-1]
                    prev[j],           # delete word1[i-1]
                    cur[j - 1],        # insert word2[j-1] into word1
                )
        prev = cur
    return prev[n]`,
    walkthrough: [
      "Each cell asks what the script's final operation did to the two final characters. Agreement → inherit the diagonal untouched. Disagreement → the final op was replace (fix both finals at once, cost the diagonal + 1), delete (drop word1's last character, prev[j] + 1), or insert (append word2's last character, cur[j−1] + 1). The three-way min is exhaustive because any edit script's last action is one of those three — there is no fourth way to make two strings end identically.",
      "Trace 'horse' → 'ros', rows over j = 0..3 for '', r, o, s: row h: [1, 1, 2, 3]; row o: [2, 2, 1, 2] — the 1 at j=2 is the free 'o' match; row r: [3, 2, 2, 2] — 'r' matches at j=1 for 2; row s: [4, 3, 3, 2] — 's' matches at j=3 for 2; row e: [5, 4, 4, 3] → answer 3. Follow the winning path backwards: the 3 came from replace/delete choices that spell exactly 'replace h→r, delete r, delete e' — the table stores the costs, and the argmin branches store the script.",
      "Base cases: row 0 costs j (insert everything), column 0 costs i (delete everything), and the empty-to-empty corner is 0, anchoring both. The equality branch resting solely on prev[j−1] is justified by the triangle inequality — going around through a delete and an insert can never beat the diagonal when the finals already match. With both words empty the loops never run and the seeded prev = [0] returns 0.",
    ],
    time: "O(m · n) — one three-way min per cell",
    space: "O(min(m, n)) — two rolling rows over the shorter word",
    followUps: [
      "Reconstruct the edit script: remember which branch won each cell (or recompute it walking backwards) and emit the operations in reverse — the cost table becomes a transcript.",
      "Weighted operations: give each op its own cost (or per-character costs) and the recurrence takes the weighted min unchanged — Minimum ASCII Delete Sum (712) is the delete-only special case with sum-of-ASCII penalties.",
    ],
    related: ["minimum-ascii-delete-sum-for-two-strings", "longest-common-subsequence", "regular-expression-matching"],
    verify: {
      fn: "minDistance",
      wrap: "plain",
      cases: [
        { args: ["horse", "ros"], expect: 3 },
        { args: ["intention", "execution"], expect: 5 },
        { args: ["", ""], expect: 0 },
        { args: ["", "abc"], expect: 3 },
        { args: ["abc", ""], expect: 3 },
        { args: ["abcdef", "azced"], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "burst-balloons",
    statement:
      "n balloons stand in a row, each printed with a number. Popping balloon i earns nums[left] × nums[i] × nums[right] coins, where left and right are the indices of the nearest SURVIVING neighbours at that moment (popped balloons are gone; the row's two virtual ends count as value 1). Pop every balloon and return the maximum total coins.",
    examples: [
      { input: "nums = [3,1,5,8]", output: "167", explanation: "Pop 1 (3·1·5=15), pop 5 (3·5·8=120), pop 3 (1·3·8=24), pop 8 (1·8·1=8)." },
      { input: "nums = [1,5]", output: "10", explanation: "Pop 1 first (1·1·5=5), then 5 (1·5·1=5); the reverse order only yields 6." },
      { input: "nums = [9]", output: "9" },
    ],
    constraints: ["1 <= n <= 300", "0 <= nums[i] <= 100"],
    breakdown: [
      "The pop ORDER is the whole problem, and the obvious decomposition — pick the first balloon to pop, recurse on the rest — is structurally broken: after that first pop the two halves become neighbours and interact through the boundary product, so the subproblems are not independent. The fix is to think about death in REVERSE: choose the LAST balloon popped in a range. At that final moment the range (l, r) has been reduced to just balloon k, with neighbours exactly l and r still standing.",
      "That reframing buys independence: dp[l][r] = the best coins from popping every balloon STRICTLY between positions l and r, with pts[l] and pts[r] guaranteed alive until the end. Electing interior k as the last burst bills pts[l]·pts[k]·pts[r] exactly once — its true final neighbours are l and r — and delegates everything earlier to (l, k) and (k, r), two halves that never see each other across k. So dp[l][r] = max over k in (l, r) of dp[l][k] + dp[k][r] + pts[l]·pts[k]·pts[r]: interval DP.",
      "The padding 1s ([1, *nums, 1]) are not cosmetic: they give the real end balloons their virtual neighbours and make the outer call dp[0][n+1] well-formed. The classic bug is forgetting 'strictly inside' — letting l or r into the subproblem double-bills boundary balloons that the k-term already charges for.",
    ],
    edges: [
      "A single balloon → 1 × value × 1 — the smallest interval and a good smoke test.",
      "Order flips small answers: [1,5] gives 10 or 6 depending on which balloon dies first — the max-over-k is doing real work even in tiny ranges.",
      "Zeros are legal values: a burst inside a zero's product pays 0 coins, but the balloon still occupies its slot as a future NEIGHBOUR — it must still be popped, just for nothing.",
      "Width-ordered loops are mandatory: dp[l][k] and dp[k][r] are narrower intervals and must exist before (l, r) is filled.",
    ],
    ladder: [
      { title: "Brute force — recurse on the first pop", body: "n! orders, or a recursion on 'pop which balloon next' whose subproblems overlap AND interact across the freshly-adjacent boundary. The first-pop decomposition is not just slow, it is structurally wrong — independence fails." },
      { title: "The pattern — reverse to the LAST burst", body: "Fix the open interval (l, r) and choose which interior balloon dies last; the two sides become fully independent. Memoise over (l, r): O(n²) states, O(n) choices each." },
      { title: "The optimal idea — bottom-up over interval width", body: "Iterate widths 2..n and fill every dp[l][r] from its shorter constituents — no recursion, cache-friendly. Θ(n³) time, Θ(n²) space, and this is the known best for the general problem: the interval table is irreducible." },
    ],
    approach: "Interval DP on the last balloon burst, open ends padded with 1s",
    code: `def maxCoins(nums):
    pts = [1] + nums + [1]             # virtual 1s at both open ends
    n = len(pts)
    dp = [[0] * n for _ in range(n)]   # dp[l][r]: best coins bursting strictly inside (l, r)
    for width in range(2, n):          # span; width 2 = exactly one interior balloon
        for l in range(0, n - width):
            r = l + width
            best = 0
            for k in range(l + 1, r):  # k = the LAST balloon popped inside (l, r)
                best = max(best,
                           dp[l][k] + dp[k][r] + pts[l] * pts[k] * pts[r])
            dp[l][r] = best
    return dp[0][n - 1]`,
    walkthrough: [
      "dp[l][r] answers: with pts[l] and pts[r] guaranteed alive until the end, what is the most coins obtainable from clearing everything between them? Electing interior k as the last burst charges pts[l]·pts[k]·pts[r] once — at that moment k's surviving neighbours are exactly l and r — and hands everything earlier to dp[l][k] and dp[k][r], which by construction never interact across k. The max over k enumerates every possible last survivor, and that is the complete case analysis.",
      "Trace [3,1,5,8] → pts = [1,3,1,5,8,1]: width 2 seeds dp with single bursts: dp[0][2]=1·3·1=3, dp[1][3]=3·1·5=15, dp[2][4]=1·5·8=40, dp[3][5]=5·8·1=40. Width 3: dp[0][3] = max(dp[1][3]+1·3·5, dp[0][2]+1·1·5) = max(30, 8) = 30; dp[1][4] = max(64, dp[1][3]+3·5·8=135) = 135; dp[2][5] = 48. Width 4: dp[0][4] = max(dp[1][4]+1·3·8=159, ...) = 159; dp[1][5] = max(..., dp[1][4]+3·8·1=159) = 159. Width 5: dp[0][5] = max(k=1: dp[1][5]+1·3·1=162, k=4: dp[0][4]+1·8·1=167, ...) = 167. The winning k=4 says the 8 dies LAST; dp[0][4]'s own winner says the 3 dies last among the left three — reconstructing the schedule 1, 5, 3, then 8.",
      "Base cases: dp[l][r] = 0 whenever r − l < 2 — an empty interior has nothing to pop, and those zeros are what the width-2 tier multiplies against. The padding 1s make dp[0][n−1] the natural root covering the whole real array. The loop order is not stylistic: ascending width guarantees both constituent intervals are final before any (l, r) reads them — reverse it and you propagate garbage.",
    ],
    time: "O(n^3) — O(n^2) intervals × O(n) last-burst choices each",
    space: "O(n^2) — the interval table",
    followUps: [
      "Same template, opposite objective: Minimum Cost to Cut a Stick (1547) MINIMIZES over cut order — identical open-interval decomposition with min instead of max.",
      "Recover the pop schedule: store the argmax k per interval and backtrack from dp[0][n−1]; the k's read top-down give the order to pop (innermost intervals first).",
    ],
    related: ["minimum-cost-to-cut-a-stick", "strange-printer", "remove-boxes"],
    verify: {
      fn: "maxCoins",
      wrap: "plain",
      cases: [
        { args: [[3, 1, 5, 8]], expect: 167 },
        { args: [[1, 5]], expect: 10 },
        { args: [[9]], expect: 9 },
        { args: [[0, 0, 0]], expect: 0 },
        { args: [[2, 4]], expect: 12 },
      ],
    },
    xp: 35,
  },
  {
    slug: "regular-expression-matching",
    statement:
      "Implement full regex matching with support for '.' (matches any single character) and '*' (matches ZERO or more consecutive copies of the element immediately before it — the star binds to that previous element, never to nothing). The match must cover the ENTIRE input string, not just a substring of it.",
    examples: [
      { input: 's = "aa", p = "a"', output: "false", explanation: '"a" does not cover both characters.' },
      { input: 's = "aa", p = "a*"', output: "true", explanation: "The star repeats 'a' twice." },
      { input: 's = "aab", p = "c*a*b"', output: "true", explanation: "c* takes zero copies, a* takes two." },
    ],
    constraints: ["1 <= s.length, p.length <= 20", "s contains only lowercase letters; p contains lowercase letters, '.', '*'", "every '*' has a valid element immediately before it"],
    breakdown: [
      "dp[i][j] = does s[:i] match p[:j] EXACTLY? For ordinary pattern characters — letters and '.' — the transition is one-and-one consumption: dp[i][j] = dp[i−1][j−1] when p[j−1] is '.' or equals s[i−1], and false otherwise. Everything hard lives in '*': a star consumes no character of its own — it MODIFIES the previous element into 'zero or more copies', which is why the star's transitions reach two pattern positions back.",
      "The star cell has two disjoint branches: dp[i][j] = dp[i][j−2] (zero occurrences — drop the whole 'x*' token) OR (the element before the star can absorb s[i−1] AND dp[i−1][j] — one more occurrence peeled off the string's front). The dp[i−1][j] term — same j, shorter s — is what lets 'a*' eat a run: each peel consumes exactly one matching character while the pattern stays put. The dp[i][j−2] zero-occurrence jump is the key transition of the entire problem: it is how 'c*a*b' matches 'aab' with the c* contributing nothing.",
      "Why not greedy backtracking? A regex star binds ONE element and has two genuinely different failure modes (match-empty vs match-more), so a single-slot backtrack cannot be complete the way it is for wildcard '*'. The 2-D table is that backtracking made exhaustive and memoised — the state space (i, j) is provably the right one, which star chains like 'a*a*' further confirm: they need no special-casing at all.",
    ],
    edges: [
      "The empty-s row: 'x*x*' patterns can match the empty string — dp[0][j] = dp[0][j−2] through stars. This base row is what 'c*a*b' vs 'aab' rides on before the first real character.",
      "A star can never lead the pattern (guaranteed), so p[j−2] always exists when p[j−1] is '*' — the j−2 indexing is safe by contract.",
      "'.*' matches ANY string including the empty one — the single most common case to get wrong by forgetting the zero-occurrence branch.",
      "Full match, not search: 'aa' vs 'a' is false even though 'a' matches a substring — only dp[m][n] is read at the end.",
    ],
    ladder: [
      { title: "Brute force — recursive star branching", body: "match(i, j): if p[j+1] is '*', try zero occurrences and (if the element matches s[i]) one-more-then-stay; else consume and advance. Exponential on star runs — the same (i, j) recurs across every 'how many copies' decision." },
      { title: "Memoise / tabulate the (i, j) grid", body: "The recursion has (m+1)(n+1) distinct states. The 2-D boolean table fills left-to-right with the empty-s base row and the dp[0][0] anchor; O(m·n) time and space — trivial at these bounds, and the honest blueprint." },
      { title: "The optimal idea — two rolling rows", body: "dp[i][·] needs row i−1 and the current row's j−2 cell, so prev/cur rows cut space to O(n). At s, p ≤ 20 the win is conceptual — proof that the state is strictly 2-D — rather than practical." },
    ],
    approach: "2-D match table with the zero-occurrence star jump",
    code: `def isMatch(s, p):
    m, n = len(s), len(p)
    dp = [[False] * (n + 1) for _ in range(m + 1)]
    dp[0][0] = True                           # "" matches ""
    for j in range(2, n + 1):                 # empty-s row: "x*x*" can match ""
        if p[j - 1] == "*":
            dp[0][j] = dp[0][j - 2]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if p[j - 1] == "*":
                can_absorb = p[j - 2] == "." or p[j - 2] == s[i - 1]
                dp[i][j] = dp[i][j - 2] or (dp[i - 1][j] and can_absorb)
            elif p[j - 1] == "." or p[j - 1] == s[i - 1]:
                dp[i][j] = dp[i - 1][j - 1]   # consume one char from each side
    return dp[m][n]`,
    walkthrough: [
      "Non-star cells are one-and-one consumers chained off the diagonal. A star cell asks two disjoint questions: can the pattern WITHOUT 'x*' already finish this prefix (dp[i][j−2])? Or can 'x*' absorb s[i−1] — allowed when the bound element is '.' or equals it — and still match the remainder (dp[i−1][j])? Their OR is complete: any witnessing match either uses zero copies (first term) or at least one (second term, which accounts for exactly one copy and defers the rest to the same star).",
      "Trace 'aab' vs 'c*a*b': the empty-s row sets dp[0][2] = dp[0][0] = true and dp[0][4] = dp[0][2] = true — the zero-occurrence jump working before any character is read. Row i=1 ('a'): dp[1][2] = dp[1][0] or (dp[0][2] and 'c' absorbs 'a'? no) → false; dp[1][3] (element 'a') → dp[0][2] = true; dp[1][4] (star 'a*') = dp[1][2] or (dp[0][4] and 'a' matches) → true. Row i=2: dp[2][4] = dp[2][2] or (dp[1][4] and match) → true. Row i=3 ('b'): dp[3][4] = dp[3][2] or (dp[2][4] and 'a' absorbs 'b'? no) → false; dp[3][5] (element 'b') = dp[2][4] = true. Answer true — and the trace visibly used both star mechanisms: the zero-copy jump (dp[0][2]) and the absorption chain (dp[1][4] → dp[2][4]).",
      "Base cases: dp[0][0] = true anchors everything; the star-only fill of row 0 is the ONLY way a nonempty pattern matches the empty string. Column 0 below row 0 stays false — no nonempty s matches an empty pattern. Note the asymmetric reads: star cells look two back in the pattern and one up in the string; element cells look one diagonal — four neighbours, all computed before the cell that reads them.",
    ],
    time: "O(m · n) — constant work per cell (m, n <= 20 keeps this tiny)",
    space: "O(m · n) — the table; two rolling rows cut it to O(n)",
    followUps: [
      "Extend the grammar: 'x+' rewrites to 'xx*' and 'x?' to a zero-or-one choice — the table gains no new machinery. For full regexes, Thompson's NFA construction is the general-version answer.",
      "Explain to an interviewer why single-slot greedy backtracking fails HERE but works for wildcard matching: a regex star binds one element with two recoverable failure modes; enumerating them without memoisation revisits states exponentially.",
    ],
    related: ["wildcard-matching", "edit-distance", "distinct-subsequences"],
    verify: {
      fn: "isMatch",
      wrap: "plain",
      cases: [
        { args: ["aa", "a"], expect: false },
        { args: ["aa", "a*"], expect: true },
        { args: ["ab", ".*"], expect: true },
        { args: ["aab", "c*a*b"], expect: true },
        { args: ["mississippi", "mis*is*p*."], expect: false },
        { args: ["aaa", "a*a"], expect: true },
      ],
    },
    xp: 35,
  },
  {
    slug: "wildcard-matching",
    statement:
      "Implement full wildcard pattern matching where '?' matches exactly one arbitrary character and '*' matches any sequence of characters — including the empty sequence. The match must cover the entire string.",
    examples: [
      { input: 's = "aa", p = "a"', output: "false" },
      { input: 's = "aa", p = "*"', output: "true", explanation: "The star covers everything." },
      { input: 's = "adceb", p = "*a*b"', output: "true", explanation: "The first star takes \"\", the second takes \"dc\"." },
    ],
    constraints: ["0 <= s.length, p.length <= 2000", "s contains only lowercase letters; p contains lowercase letters, '?', '*'"],
    breakdown: [
      "Two tools dominate, and both belong in your pocket. The DP: dp[i][j] = does s[:i] match p[:j]? A '?' or exact character consumes one-and-one off the diagonal; a '*' is dp[i][j−1] (the star matches empty) OR dp[i−1][j] (the star absorbs one more character) — the pattern pointer stalls while the string advances, which is precisely 'any sequence'.",
      "The greedy: '*' is the only branching character, so match everything else straight through with two pointers; on a mismatch AFTER a star, do not re-decide history — give the MOST RECENT star one more character and resume from there. The (star, mark) pair is a one-slot memo of the branch point. One slot suffices because the last star dominates: any partition an earlier star could have absorbed can be re-expressed as the later star absorbing from that earlier point, since the segment between two stars is made of literal/'?' tokens the later star can also swallow.",
      "The missteps: backtracking to the FIRST star (exponential and pointless — the last star subsumes it), and forgetting the endgame — once s is exhausted the pattern may contain only trailing stars, so a leftover 'b' after the last consumed character is failure even though stars remain.",
    ],
    edges: [
      "Empty s matches a pattern of all stars (or the empty pattern): the trailing-star skip is the entire answer — and empty strings are genuinely in-contract here.",
      "A leading '*' ('*a*b') is the common shape: the first star seeds (star, mark) before any literal has matched.",
      "Star runs ('***') are harmless — each overwrites (star, mark); only the last matters.",
      "'?' cannot absorb nothing: it is the strict one-character consumer, and that asymmetry from '*' is exactly what the greedy exploits.",
    ],
    ladder: [
      { title: "Brute force — branch at every star", body: "match(i, j) enumerates 'how many characters this star eats'. With k stars over an n-character string that is O(n^k) partitions — exponential the moment patterns carry multiple stars." },
      { title: "The pattern — 2-D DP over consumed prefixes", body: "dp[i][j] = dp[i−1][j−1] on literal/'?' match; on '*': dp[i][j−1] (empty) or dp[i−1][j] (absorb one more). O(s·p) time and space — the correct, provable baseline." },
      { title: "The optimal idea — greedy with last-star backtracking", body: "One pass: advance both pointers on literal/'?' matches; on '*' remember (star, mark) and try the empty match first; on a later mismatch, rewind j to star+1 and advance mark by one (i = mark). O(s·p) worst case, near-linear in practice, O(1) space — no table at all." },
    ],
    approach: "Greedy two-pointer with last-star backtracking",
    code: `def isMatch(s, p):
    i = j = 0                  # cursors into s and p
    star = -1                  # index of the most recent '*' in p
    mark = 0                   # position in s where that star started absorbing
    while i < len(s):
        if j < len(p) and (p[j] == s[i] or p[j] == "?"):
            i += 1             # literal or '?': consume one char from each
            j += 1
        elif j < len(p) and p[j] == "*":
            star, mark = j, i  # remember the star; try it matching "" first
            j += 1
        elif star != -1:
            j = star + 1       # mismatch after a star: give the LAST star
            mark += 1          # one more character and retry from there
            i = mark
        else:
            return False       # no star to fall back on: dead end
    while j < len(p) and p[j] == "*":   # s done; only trailing stars may remain
        j += 1
    return j == len(p)`,
    walkthrough: [
      "The greedy replaces the DP's OR with a policy: prefer the star matching empty; only on later failure pay it one more character of s. The (star, mark) pair is a single-slot memo of the live branch point, and one slot suffices by the dominance argument — the last star can absorb everything its predecessors could. Every rewind permanently advances mark, so the backtracking is monotone: the loop does O(s) rewinds interleaved with forward matching, which is why the worst case is O(s·p) but the typical run is a single linear sweep.",
      "Trace 'adceb' vs '*a*b': the star at 0 sets star=0, mark=0 and tries empty; 'a' matches 'a' (i=1, j=2); the star at 2 sets star=2, mark=1; 'b' vs 'd' fails → rewind to mark=2, i=2, j=3; 'b' vs 'c' fails → mark=3, i=3; 'b' matches (i=4, j=4); s exhausted, no trailing pattern → true. The two rewinds are the middle star negotiating 'any sequence': it finally absorbed 'dc' (s[1..2]) before the literal 'b' — exactly the assignment the example explains.",
      "Base cases live at the two loop exits: s exhausted early → the remaining pattern must be all stars (the trailing skip decides); a mismatch with star = −1 → immediate false, no fallback exists. Empty s skips the loop entirely and rides the trailing skip; empty p against nonempty s fails on the first branch. Contrast with regex matching (problem 10): there '.' and element-bound stars break the one-slot argument, which is why 10 needs the table and 44 does not.",
    ],
    time: "O(s · p) worst case — amortized near-linear; every rewind advances mark permanently",
    space: "O(1) — four integers; the DP alternative costs O(s · p)",
    followUps: [
      "Need a proof-carrying answer? Keep one rolling row of the DP table (plus the diagonal), O(p) space — the middle ground when greedy's worst case matters.",
      "Richer wildcards ('[a-z]' classes, multi-char tokens): swap the literal-match predicate and keep the pointer machinery — the last-star argument survives as long as '*' remains the only variable-length token.",
    ],
    related: ["regular-expression-matching", "interleaving-string", "distinct-subsequences"],
    verify: {
      fn: "isMatch",
      wrap: "plain",
      cases: [
        { args: ["aa", "a"], expect: false },
        { args: ["aa", "*"], expect: true },
        { args: ["cb", "?a"], expect: false },
        { args: ["adceb", "*a*b"], expect: true },
        { args: ["acdcb", "a*c?b"], expect: false },
        { args: ["", "*"], expect: true },
      ],
    },
    xp: 35,
  },
  {
    slug: "minimum-path-sum",
    statement:
      "Given an m × n grid of non-negative numbers, find a path from the top-left to the bottom-right cell that minimizes the sum of all cells visited along the way. You may move only right or down at each step.",
    examples: [
      { input: "grid = [[1,3,1],[1,5,1],[4,2,1]]", output: "7", explanation: "The path 1 → 3 → 1 → 1 → 1 dodges the 5 and the 4." },
      { input: "grid = [[1,2,3],[4,5,6]]", output: "12", explanation: "Straight across the top, then down: 1+2+3+6." },
      { input: "grid = [[1,2,5]]", output: "8", explanation: "A single row — the answer is its prefix sum." },
    ],
    constraints: ["1 <= m, n <= 200", "0 <= grid[i][j] <= 200"],
    breakdown: [
      "dp[i][j] = the minimum total cost to REACH cell (i, j) from the corner. Every arrival comes from above or from the left, so dp[i][j] = grid[i][j] + min(dp[i−1][j], dp[i][j−1]). This is unique-paths with the combiner swapped from + to min — the same two-parent DAG, the same fill order, a different aggregation.",
      "A point experts like to make: because moves are restricted to right/down, the grid is a DAG and the min-recurrence is EXACT for any weights — even negative ones — since every path to (i, j) is forced through its two parents; the recurrence implicitly explores all of them. The non-negativity guarantee starts mattering the moment moves gain freedom: allow all four directions and shortest-path structure returns, at which point Dijkstra (not DP) is the tool.",
      "The space story: row i reads only row i−1 and the left neighbour, so one rolling row suffices — and if mutating the input is acceptable you can even fold the sums into the grid itself, O(1) extra. Both variants are legitimate; the in-place one just must be stated aloud, because silently mutating a caller's grid is a real-world smell senior interviewers probe.",
    ],
    edges: [
      "Single row → left-to-right prefix sum; single column → top-to-bottom prefix sum — the border seeds are those answers.",
      "Zero cells are legal (weights ≥ 0) and act as free steps — no special handling.",
      "In-place requires explicit permission; state the mutation out loud or use the rolling row.",
      "All-equal grids: every path costs the same — a quick check that you are not accidentally optimizing the wrong thing.",
    ],
    ladder: [
      { title: "Brute force — walk every path", body: "C(m+n−2, m−1) paths through an m×n grid — combinatorial explosion, hopeless beyond toy sizes. The count alone explains why a table is mandatory." },
      { title: "Memoise / tabulate the 2-D grid", body: "dp[i][j] = grid[i][j] + min(top, left), borders seeded as running prefix sums. O(m·n) time and space — correct, but the table is one dimension more than the dependency structure needs." },
      { title: "The optimal idea — rolling row (or in-place)", body: "One row: row[j] = grid[i][j] + min(row[j] (above), row[j−1] (left)), updated left to right. O(m·n) time, O(n) space — or O(1) extra if overwriting the grid is permitted." },
    ],
    approach: "Rolling-row DP (in-place grid overwrite if permitted)",
    code: `def minPathSum(grid):
    m, n = len(grid), len(grid[0])
    row = grid[0][:]                 # copy of row 0; the caller's grid stays untouched
    for j in range(1, n):            # border: only "from the left" exists
        row[j] += row[j - 1]
    for i in range(1, m):
        row[0] += grid[i][0]         # border column: only "from above"
        for j in range(1, n):
            # row[j] still holds "from above"; row[j-1] is already "from the left"
            row[j] = grid[i][j] + min(row[j], row[j - 1])
    return row[-1]`,
    walkthrough: [
      "The recurrence looks greedy but is globally exact, and the reason is structural: with right/down-only moves the grid is a DAG and every path to (i, j) funnels through its two parents, so taking the cheaper parent loses nothing — the min implicitly accounts for all prefixes. The rolling row carries the invariant 'row[j] = best cost to reach (i, j)' updated in place: at read time, row[j] is yesterday's cell and row[j−1] is today's left neighbour.",
      "Trace [[1,3,1],[1,5,1],[4,2,1]]: row 0 becomes [1, 4, 5]. Row 1: row[0] = 1+1 = 2; row[1] = 5 + min(4, 2) = 7; row[2] = 1 + min(5, 7) = 6 → [2, 7, 6]. Row 2: row[0] = 2+4 = 6; row[1] = 2 + min(7, 6) = 8; row[2] = 1 + min(6, 8) = 7 → answer 7, the path 1 → 3 → 1 → 1 → 1. Watch row[1] on the last pass: the cheap 2 rejected the 7 arriving from above in favour of the 6 from the left — the min doing the rejecting is the whole algorithm.",
      "Base cases: row 0's running sum is the recurrence with the 'above' term deleted; column 0's += grid[i][0] is the recurrence with 'left' deleted — neither needs a branch, just a separate seed loop. The in-place variant writes dp values straight into the grid: same arithmetic, zero extra allocation, and the phrase 'this mutates the input' belongs in your narration. Both read out row[-1] (or grid[m−1][n−1]) at the end.",
    ],
    time: "O(m · n) — one visit per cell",
    space: "O(n) rolling — or O(1) extra if overwriting the input is allowed",
    followUps: [
      "Obstacles (Unique Paths II) or asymmetric move costs: the recurrence keeps its shape; blocked cells become 'unreachable' markers the min naturally avoids.",
      "Allow all four directions and the DAG property dies — minimum path sum over a general grid with non-negative weights is Dijkstra over cells (or 0-1 BFS for the special cost structure).",
    ],
    related: ["unique-paths", "unique-paths-ii", "triangle"],
    verify: {
      fn: "minPathSum",
      wrap: "plain",
      cases: [
        { args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expect: 7 },
        { args: [[[1, 2, 3], [4, 5, 6]]], expect: 12 },
        { args: [[[1]]], expect: 1 },
        { args: [[[1, 2, 5]]], expect: 8 },
        { args: [[[1, 2], [5, 6], [1, 1]]], expect: 8 },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-palindromic-subsequence",
    statement:
      "Given a string, return the length of its longest subsequence that reads the same forwards and backwards. Subsequences keep relative order but may skip any characters.",
    examples: [
      { input: 's = "bbbab"', output: "4", explanation: '"bbbb" — drop the lone a.' },
      { input: 's = "cbbd"', output: "2", explanation: '"bb".' },
      { input: 's = "a"', output: "1", explanation: "A single character is its own palindrome." },
    ],
    constraints: ["1 <= s.length <= 1000", "s consists of lowercase English letters"],
    breakdown: [
      "Interval DP: dp[i][j] = the LPS length confined to the window s[i..j]. The window's ends decide everything: if s[i] == s[j], both can sit on the palindrome's rim — dp[i][j] = dp[i+1][j−1] + 2; if they differ, at most one end survives — dp[i][j] = max(dp[i+1][j], dp[i][j−1]). The state is an INTERVAL, not a prefix pair, which is what makes this 2-D DP geometric rather than stringy.",
      "Why is claiming both equal ends always safe? Wrapping ANY palindrome — even the empty one — in two equal letters yields a palindrome, and a length argument shows skipping one of two equal ends can never do better: the subsequence that ignored an end can be re-based to use both without shrinking. The expansion rule dp[i][j] = dp[i+1][j−1] + 2 is therefore unconditional on a match, which keeps the recurrence two lines.",
      "Fill order is the practical half of the problem: dp[i][·] reads row i+1 (inner intervals) and its own row's left cell, so i must DESCEND while j ascends — iterate i upward and you read a half-built table and garbage out. The geometry (shrink windows toward the diagonal) is the interval-DP analogue of the left-to-right sweep in prefix DPs.",
    ],
    edges: [
      "Adjacent equal ends ('aa'): dp[i][j] = dp[i+1][j−1] + 2 reads the EMPTY interval — valid only because the table starts zeroed, which absorbs j == i+1 without a special branch.",
      "All-equal strings → the whole length: take everything.",
      "Single characters → the dp[i][i] = 1 seed; n = 1 must short-circuit gracefully.",
      "The answer lives at dp[0][n−1] but is built from the diagonal outward — wrong fill order fails silently on asymmetric strings.",
    ],
    ladder: [
      { title: "Brute force — recursive window ends", body: "lps(i, j) branches on the two ends and recurses inward. Exponential — the same windows are re-derived across the 2^n subsequences lurking underneath." },
      { title: "Memoise / tabulate the intervals", body: "n² window states, O(1) transitions, filled i from n−1 down and j from i+1 up. O(n²) time and space — the canonical interval-DP table." },
      { title: "The optimal idea — two rolling rows (or think LCS)", body: "dp[i][·] reads row i+1 and its own left cell, so two rolling rows give O(n) space. Equivalently LPS(s) = LCS(s, reversed(s)) — the interval DP is LCS wearing a mirror, and that equivalence hands you a battle-tested implementation." },
    ],
    approach: "Interval DP over s[i..j] with the end-pairing rule",
    code: `def longestPalindromeSubseq(s):
    n = len(s)
    dp = [[0] * n for _ in range(n)]   # dp[i][j]: LPS length inside s[i..j]
    for i in range(n - 1, -1, -1):     # i DESCENDING: inner windows fill first
        dp[i][i] = 1                   # a lone character is a palindrome
        for j in range(i + 1, n):
            if s[i] == s[j]:
                dp[i][j] = dp[i + 1][j - 1] + 2    # equal ends wrap the inside
            else:
                dp[i][j] = max(dp[i + 1][j], dp[i][j - 1])  # drop one end
    return dp[0][n - 1]`,
    walkthrough: [
      "dp[i][j] asks for the longest palindrome hidden in the window s[i..j]. Equal ends are worth claiming together — +2 around whatever the inner window offers. Unequal ends force a discard: drop s[i] (consult dp[i+1][j]) or drop s[j] (consult dp[i][j−1]) and keep the better. The window shrinks from both directions toward the diagonal, the interval-DP geometry that replaces the prefix-pair sweep of LCS-style tables.",
      "Trace 'bbbab': row i=4: dp[4][4] = 1. i=3 ('a'): dp[3][4]: 'a' vs 'b' → max(1, 1) = 1. i=2 ('b'): dp[2][3] → 1; dp[2][4]: 'b' == 'b' → dp[3][3] + 2 = 3. i=1 ('b'): dp[1][2]: equal → dp[2][1] + 2 = 2; dp[1][3]: 'b' vs 'a' → max(dp[2][3]=1, dp[1][2]=2) = 2; dp[1][4]: 'b' == 'b' → dp[2][3] + 2 = 3. i=0 ('b'): dp[0][3]: 'b' vs 'a' → max(dp[1][3]=2, dp[0][2]=3) = 3; dp[0][4]: 'b' == 'b' → dp[1][3] + 2 = 4. Answer 4 — the final +2 wraps the inner 'bb' that dp[1][3] had already certified.",
      "Base cases: dp[i][i] = 1 seeds single letters; the zero-initialized table supplies dp[i+1][j−1] = 0 for adjacent equal pairs — the 'empty inner palindrome' case for free. Two invariants to check when debugging: the diagonal is all 1s, and only the upper triangle (j ≥ i) is ever written — cells with j < i stay 0 and are never read. The final read is the widest window, dp[0][n−1].",
    ],
    time: "O(n^2) — one transition per window",
    space: "O(n^2) — the interval table; two rolling rows cut it to O(n)",
    followUps: [
      "LPS(s) = LCS(s, reversed(s)) — verify it on 'bbbab' ('bab' reversed is 'bab'): the equivalence gives you the standard rolling-row LCS implementation for free.",
      "Minimum insertions (or deletions) to make s a palindrome is n − LPS: the palindrome you keep is exactly the subsequence you don't have to fix.",
    ],
    related: ["longest-common-subsequence", "minimum-insertion-steps-to-make-a-string-palindrome", "palindromic-substrings"],
    verify: {
      fn: "longestPalindromeSubseq",
      wrap: "plain",
      cases: [
        { args: ["bbbab"], expect: 4 },
        { args: ["cbbd"], expect: 2 },
        { args: ["a"], expect: 1 },
        { args: ["aaaa"], expect: 4 },
        { args: ["agbdba"], expect: 5 },
      ],
    },
    xp: 20,
  },
  {
    slug: "ones-and-zeroes",
    statement:
      "You are given a list of binary strings. Choose the largest possible subset such that the TOTAL number of '0' characters across the chosen strings is at most m and the total '1' characters is at most n. Return the size of that subset.",
    examples: [
      { input: 'strs = ["10","0001","111001","1","0"], m = 5, n = 3', output: "4", explanation: 'Take "0001", "10", "1", "0" — 5 zeros and 3 ones exactly.' },
      { input: 'strs = ["10","0","1"], m = 1, n = 1', output: "2", explanation: '"10" plus "1", or "0" plus "1".' },
      { input: 'strs = ["111","1000","1000","1000"], m = 9, n = 3', output: "3", explanation: 'The three "1000"s; adding "111" would exceed the ones budget.' },
    ],
    constraints: ["1 <= strs.length <= 600", "1 <= strs[i].length <= 100", "1 <= m, n <= 100", "each string consists only of '0' and '1'"],
    breakdown: [
      "dp[z][o] = the size of the largest subset of the strings PROCESSED SO FAR whose zeros total at most z and ones total at most o. Each string is a 0/1 knapsack item with a TWO-dimensional weight — its zero-count and its one-count — and uniform value 1. The budget row of classic knapsack becomes a budget PLANE; that generalization is the entire conceptual jump.",
      "Transition per string with counts (cz, co): dp[z][o] = max(dp[z][o], 1 + dp[z−cz][o−co]) — skip it, or take it and add one to whatever the remaining budgets supported. The sweep order is the ballgame: iterate BOTH budgets DOWNWARD so dp[z−cz][o−co] still reflects the state before this string existed. Sweep either budget upward and a single string can be taken twice — the unbounded-knapsack bug, imported through inattention.",
      "Why greedy fails: 'shortest string first' or 'fewest zeros first' ignores that the budgets are two separate currencies — a string cheap in zeros may be expensive in ones, and no scalar ranking respects both. And the 3-D memo (index, z, o) is fine but one dimension too many: the index dimension collapses exactly as in 1-D knapsack the moment you process strings one at a time against a mutable plane.",
    ],
    edges: [
      "Tight budgets (m = n = 1): only strings of length ≤ 1 qualify — the downward ranges empty out and the plane stays zero.",
      "Impossible budgets: every string exceeds one axis → answer 0 without any explicit check.",
      "Strings of a single repeated character ('0', '111') load only one axis — they pair naturally with other strings that use the complementary budget.",
      "Count each string's zeros ONCE per round (s.count) — recounting inside the budget loops quadruples constant factors for no reason.",
    ],
    ladder: [
      { title: "Brute force — try every subset", body: "2^600 subsets; even n = 20 gives a million and n = 40 gives a trillion. The take/skip recursion is correct but re-derives identical budget states everywhere." },
      { title: "Memoise (index, zerosLeft, onesLeft)", body: "The take/skip recursion has index × (m+1) × (n+1) states, each O(1) after counting the string's characters. That 3-D table is correct — and immediately invites the classic dimension collapse." },
      { title: "The optimal idea — collapse the index, sweep budgets downward", body: "Process strings one at a time against a 2-D budget plane updated in place from high budgets to low, and the index dimension disappears. O(len(strs) · m · n) time, O(m · n) space." },
    ],
    approach: "2-D 0/1 knapsack over (zeros, ones) budgets",
    code: `def findMaxForm(strs, m, n):
    dp = [[0] * (n + 1) for _ in range(m + 1)]  # dp[z][o]: best size within budgets
    for s in strs:                    # one string per round: take it or skip it
        zeros = s.count("0")          # count once per string, not per cell
        ones = len(s) - zeros
        for z in range(m, zeros - 1, -1):   # DOWNWARD so dp[z-zeros][o-ones]
            for o in range(n, ones - 1, -1):  # is still the pre-round value
                dp[z][o] = max(dp[z][o], 1 + dp[z - zeros][o - ones])
    return dp[m][n]`,
    walkthrough: [
      "The invariant after k strings: dp[z][o] is optimal using only those k. The update pits 'skip' (leave dp[z][o]) against 'take' (1 + the best reachable by spending (cz, co) from PRE-round budgets) — and the double downward sweep is what makes 'pre-round' true in two dimensions at once. It is the same reason 1-D 0/1 knapsack sweeps its single budget downward, squared: reads must come from untouched cells or items get reused.",
      "Trace (['10','0','1'], m=1, n=1): start all zeros. '10' (1z, 1o): dp[1][1] = max(0, 1 + dp[0][0]) = 1. '0' (1z, 0o): dp[1][1] = max(1, 1 + dp[0][1]) = 1 (no gain); dp[1][0] = max(0, 1 + dp[0][0]) = 1. '1' (0z, 1o): dp[1][1] = max(1, 1 + dp[1][0]) = 2; dp[0][1] = max(0, 1 + dp[0][0]) = 1. Final dp[1][1] = 2 — '10'+'1' or '0'+'1'. The decisive moment is the last string reading dp[1][0], a cell the '0' round created: the plane lets unrelated strings compose through shared budget states.",
      "Base case: the all-zero plane — with nothing processed, the best subset is empty at every budget. dp[m][n] is the answer because every transition spends budgets downward: the full-budget corner dominates all reachable states. Note the guard structure: a string whose zeros exceed m simply contributes an empty range and is skipped wholesale — no if-statements needed in the loop body.",
    ],
    time: "O(len(strs) · m · n) — each string sweeps the budget plane once",
    space: "O(m · n) — the budget plane",
    followUps: [
      "More budget dimensions (weights per digit class, per letter): the pattern extends to k dimensions with a downward sweep per axis — time blows up multiplicatively, which is the honest cost of generality.",
      "Reconstruct the chosen subset: re-run the DP backwards from dp[m][n], checking per string which branch (skip vs take) produced the stored value, and emit the winners.",
    ],
    related: ["partition-equal-subset-sum", "target-sum", "coin-change-ii"],
    verify: {
      fn: "findMaxForm",
      wrap: "plain",
      cases: [
        { args: [["10", "0001", "111001", "1", "0"], 5, 3], expect: 4 },
        { args: [["10", "0", "1"], 1, 1], expect: 2 },
        { args: [["11", "00"], 1, 1], expect: 0 },
        { args: [["0", "0", "0"], 2, 1], expect: 2 },
        { args: [["111", "1000", "1000", "1000"], 9, 3], expect: 3 },
      ],
    },
    xp: 20,
  },
];
