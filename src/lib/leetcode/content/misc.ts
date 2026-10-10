// Deep-dives — Simulation & state-machine classics (TI150 uniques spanning matrix, prefix-sum and stock DP). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const MISC: LcDeepDive[] = [
  {
    slug: "game-of-life",
    statement:
      "An m×n grid hosts a colony where each cell is either dead (0) or alive (1). One generation passes by a fixed law: a live cell survives when it has exactly 2 or 3 live neighbours among its eight surrounding cells, and dies otherwise (loneliness or overcrowding); a dead cell with exactly 3 live neighbours is born. Rewrite the board IN PLACE — no second grid — so that when your function returns it holds the next generation, cells still valued 0/1.",
    examples: [
      {
        input: "board = [[0,1,0],[0,0,1],[1,1,1],[0,0,0]]",
        output: "[[0,0,0],[1,0,1],[0,1,1],[0,1,0]]",
        explanation: "Every cell is judged against the ORIGINAL board at once — e.g. the dead (1,0) sees exactly three live neighbours and is born, while the live (0,1) sees one and dies.",
      },
      {
        input: "board = [[1,1],[1,0]]",
        output: "[[1,1],[1,1]]",
        explanation: "Each live cell has exactly 2 live neighbours and survives; the empty cell sees 3 and is born — a stable block appears.",
      },
      { input: "board = [[0]]", output: "[[0]]", explanation: "One dead cell, zero neighbours — nothing happens." },
    ],
    constraints: [
      "1 <= m, n <= 25 (board is m×n)",
      "board[i][j] is 0 or 1",
      "all cells update simultaneously — each from the same snapshot of the current board",
    ],
    breakdown: [
      "The rules fit on a napkin; the difficulty lives entirely in the word simultaneously. 'Next generation' means every cell's new value is computed from one shared snapshot of the current board — but you are handed a single board to write into. Update-as-you-scan and cells processed later count your fresh writes, so the result is a chimera of generation t and generation t+1 that follows no rule at all.",
      "Each integer cell secretly has to carry two bits: what it WAS and what it BECOMES. A Python int is wide enough to hold both, so encode the transition in the value itself. The four outcomes map to 1 (live, stays live), 2 (was live, will die), 0 (dead, stays dead) and -1 (was dead, will be born) — and any neighbour's original state is recoverable from the sign alone: positive meant alive, non-positive meant dead.",
      "The standard missteps: copy the board (correct, but O(m·n) extra space — and the in-place demand exists precisely to take that away), or try to un-write each update with per-cell undo logic (a bug farm). The sentinel scheme turns 'in place' into a two-pass protocol — mark every future first, decode them second — and the one predicate that makes it honest (counting a neighbour as 'was live' iff its value is > 0) deserves to be said out loud in an interview.",
    ],
    edges: [
      "A single live cell [[1]] has zero neighbours and dies of loneliness; a single dead cell [[0]] is already a fixed point. Bounds checks must never count phantom out-of-bounds neighbours.",
      "The simultaneity trap: writing plain 0/1 as you scan corrupts later counts with generation-t+1 data. The sentinels keep the t-generation bit readable via sign (> 0 = was live).",
      "The sentinel pairing is load-bearing: 2 = was-live-dies and -1 = was-dead-revives must be read with 'v > 0', NOT 'abs(v) == 1' — the latter misreads both marks and fails even [[1,1,1]] (it kills the middle cell, which should survive).",
      "The decode pass is not optional: any leftover 2 or -1 in the board fails a strict 0/1 matrix comparison.",
    ],
    ladder: [
      {
        title: "Brute force — copy the board",
        body: "Snapshot the grid into a fresh m×n copy, count each cell's neighbours from the copy, write new states into the original. Two clean passes, O(m·n) extra space. Perfectly correct — and exactly what the in-place follow-up is designed to take away.",
      },
      {
        title: "Pattern — states that remember their past",
        body: "The board must hold two timelines per cell, and an int has room. Widen the alphabet: 2 = was live, will die; -1 = was dead, will be born; 0 and 1 keep their meanings. A neighbour's original state is its sign, so counts stay honest mid-pass; a final decode pass re-normalises everything to 0/1.",
      },
      {
        title: "The optimal idea — mark futures, then decode",
        body: "Pass one computes each cell's transition from the eight surrounding signs and writes the sentinel; pass two rewrites 2 → 0 and -1 → 1. O(m·n) time, O(1) extra space, and the single correctness hinge — reading 'was live' as v > 0 — is one comparison.",
      },
    ],
    approach: "Sentinel-encoded two-pass simulation",
    code: `def gameOfLife(board):
    m, n = len(board), len(board[0])

    def live_neighbours(r, c):
        total = 0
        for dr in (-1, 0, 1):
            for dc in (-1, 0, 1):
                if dr == 0 and dc == 0:
                    continue
                nr, nc = r + dr, c + dc
                if 0 <= nr < m and 0 <= nc < n and board[nr][nc] > 0:
                    total += 1   # > 0 means WAS live: 1 (survivor) or 2 (marked to die)
        return total

    for r in range(m):
        for c in range(n):
            k = live_neighbours(r, c)
            if board[r][c] == 1 and (k < 2 or k > 3):
                board[r][c] = 2      # was live, will die (loneliness / overcrowding)
            elif board[r][c] == 0 and k == 3:
                board[r][c] = -1     # was dead, will be born

    for r in range(m):
        for c in range(n):
            if board[r][c] == 2:
                board[r][c] = 0      # decode: the marked death lands
            elif board[r][c] == -1:
                board[r][c] = 1      # decode: the marked birth lands`,
    walkthrough: [
      "The count helper answers one question only: was this neighbour alive in generation t? With the sentinels, the original bit is the sign — 1 and 2 are both 'was live' (a survivor and a cell marked to die), 0 and -1 are both 'was dead' (a stable corpse and a cell marked for birth). That single '> 0' predicate is the correctness hinge: no matter how many neighbours were already rewritten this pass, the sum still sees the t-generation board. It is also why the two sentinels had to be chosen on opposite sides of zero.",
      "Each cell then applies a four-line transition table: live with 2 or 3 neighbours stays 1; live with fewer than 2 (loneliness) or more than 3 (overcrowding) becomes 2; dead with exactly 3 becomes -1; dead otherwise stays 0. A cell is read once and written at most once, and the count excludes the centre, so a mark never disturbs its own classification. Trace [1,1,1] (one row): the left end marks 2, the middle then counts BOTH original neighbours (the 2 still reads live, the right 1 too) and survives, the right end marks 2 — decode gives [0,1,0], the true next generation. The naive 'abs(v) == 1' reading of the marks would have counted neither mark correctly and killed the middle cell too.",
      "The decode pass is two assignments: 2 → 0 and -1 → 1, leaving untouched 0 and 1. Edge boards come free: [[1]] has an empty neighbourhood, marks 2 and decodes to [[0]]; corners simply have fewer in-bounds neighbours because the bounds check skips out-of-range coordinates. Total cost is two board passes with constant work per cell — O(m·n) time, O(1) extra space, and the board never leaves its own grid.",
    ],
    time: "O(m·n) — two passes over the board, constant work per cell",
    space: "O(1) — the transitions are encoded inside the board itself",
    followUps: [
      "Bit-packing variant: keep the present in bit 0 and write the future into bit 1 (board[r][c] |= next << 1), then commit every cell with one shift — handy when negative sentinels are off-limits or a third timeline is needed.",
      "Infinite boards: a dense m×n grid is the wrong model when patterns can grow without bound — keep live cells in a set and simulate sparsely (only cells adjacent to life can change), which is how real Game-of-Life engines scale.",
    ],
    related: ["set-matrix-zeroes", "rotate-image"],
    verify: {
      fn: "gameOfLife",
      wrap: "inPlace",
      cases: [
        { args: [[[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]], expect: [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]] },
        { args: [[[1, 1], [1, 0]]], expect: [[1, 1], [1, 1]] },
        { args: [[[0]]], expect: [[0]] },
        { args: [[[1]]], expect: [[0]] },
        { args: [[[1, 1, 1]]], expect: [[0, 1, 0]] },
        { args: [[[1, 1, 1], [1, 1, 1], [1, 1, 1]]], expect: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "find-pivot-index",
    statement:
      "Given an integer array, return the leftmost index that splits it into two halves of equal sum — everything strictly before the index versus everything strictly after, the pivot element itself belonging to neither side. The empty side of a boundary index sums to 0. Return -1 if no such index exists.",
    examples: [
      { input: "nums = [1,7,3,6,5,6]", output: "3", explanation: "1+7+3 = 11 on the left, 5+6 = 11 on the right." },
      { input: "nums = [1,2,3]", output: "-1", explanation: "No index balances the array." },
      { input: "nums = [2,1,-1]", output: "0", explanation: "The left side is empty (0); on the right, 1 + (-1) = 0." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "-1000 <= nums[i] <= 1000", "return -1 when no index balances"],
    breakdown: [
      "Underneath the story is a fixed-point question: for which i does the running prefix balance the running suffix? The pivot's own value belongs to neither side, and a boundary index faces an empty side worth 0. Brute force answers it by re-summing both flanks for every index — O(n²) — blindly re-adding segments it has already totalled.",
      "Prefix-sum thinking removes all the re-summing: the total is a constant, and if a rolling 'left' tracks the prefix, the suffix is derivable — right = total − left − nums[i] — by pure partition algebra. That one subtraction deletes the suffix array entirely, leaving a one-pass, O(1)-space scan. The emptiness conventions come free: at i = 0 'left' is the empty sum, and at the last index the formula yields 0 for the empty suffix without a special case.",
      "Classic failures: forgetting the − nums[i] term (every comparison goes off by the pivot's value), scanning past the first hit (the problem wants the leftmost), and assuming positivity — [2,1,-1] legitimately pivots at index 0 because its right side cancels to 0. Any 'two-pointer, grow the smaller side' reflex imported from positive-array problems dies on negatives; the algebra does not care about sign.",
    ],
    edges: [
      "Empty sides count as 0: index 0 faces an empty left, the last index an empty right — a one-element array therefore always pivots at index 0.",
      "Leftmost wins: return on the first balance; a later duplicate balance is not the answer.",
      "Negatives are legal ([2,1,-1] pivots at 0) — the formula absorbs them; shortcuts that assume monotonic or positive values do not.",
      "The algebra must exclude the pivot itself: right = total − left − nums[i]. Dropping the −x shifts every comparison by the pivot value and produces confident nonsense.",
    ],
    ladder: [
      {
        title: "Brute force — re-sum both flanks",
        body: "For each index, loop left and loop right and compare. O(n²): 10^4 elements is ~10^8 additions, dead in Python, and every flank gets re-added thousands of times.",
      },
      {
        title: "Prefix + suffix arrays",
        body: "Build prefix[i] (sum of everything before i) and suffix[i] (everything after) in two passes, then one comparison per index. O(n) time, O(n) space — the textbook upgrade.",
      },
      {
        title: "The optimal idea — derive the suffix from the total",
        body: "suffix(i) = total − prefix(i) − nums[i] is an identity, so the suffix array is deletable: keep one rolling 'left', compute 'right' inline, compare. One pass, O(1) space, and the first hit returned is the leftmost pivot by construction.",
      },
    ],
    approach: "One-pass prefix vs. derived suffix",
    code: `def pivotIndex(nums):
    total = sum(nums)
    left = 0                        # sum of nums[0..i-1] when judging index i
    for i, x in enumerate(nums):
        right = total - left - x    # partition algebra: the suffix sum
        if left == right:
            return i                # first balance = leftmost pivot
        left += x                   # extend the prefix only AFTER judging i
    return -1`,
    walkthrough: [
      "The invariant is one line: when the loop reaches index i, 'left' equals the sum of nums[0..i-1]. It starts at 0 for i = 0 — the empty prefix — and grows by exactly nums[i] only after index i has been judged, so it never includes the pivot itself.",
      "The right side is partition algebra: total = left + nums[i] + right, so right = total − left − nums[i]. At the last index the formula returns 0 — the empty suffix — with no branch; at index 0 it reads total − nums[0], the sum of everything after the first element. One variable replaces the entire suffix array.",
      "Trace [1,7,3,6,5,6], total 28: at i = 0 the right side is 27 (no); at i = 1, left 1 against right 20; at i = 2, left 8 against right 16; at i = 3, left 11 against right 11 — return 3. The first balance wins, which is exactly the leftmost requirement; returning -1 only after the full scan covers the no-pivot case.",
    ],
    time: "O(n) — one sum() pass plus one judging scan",
    space: "O(1) — two running totals",
    followUps: [
      "Report every pivot instead of the first: the per-index comparison is independent, so collect all hits in the same O(n) pass.",
      "Pivots under updates: a point update invalidates cached prefix sums — a Fenwick tree restores O(log n) prefix and total queries, and the pivot test stays the same three-term algebra.",
    ],
    related: ["product-of-array-except-self", "subarray-sum-equals-k", "range-sum-query-immutable"],
    verify: {
      fn: "pivotIndex",
      wrap: "plain",
      cases: [
        { args: [[1, 7, 3, 6, 5, 6]], expect: 3 },
        { args: [[1, 2, 3]], expect: -1 },
        { args: [[2, 1, -1]], expect: 0 },
        { args: [[5]], expect: 0 },
        { args: [[1, 1, 1]], expect: 1 },
        { args: [[-1, -1, -1, -1, -1, 0]], expect: 2 },
      ],
    },
    xp: 10,
  },
  {
    slug: "best-time-to-buy-and-sell-stock-iii",
    statement:
      "You observe a stock's price once per day and may run at most TWO complete buy-then-sell cycles. Cycles may not overlap: the second buy can only happen after the first sale, and you cannot hold two shares at once. Return the maximum total profit achievable — 0 when no sequence of trades earns anything.",
    examples: [
      { input: "prices = [3,3,5,0,0,3,1,4]", output: "6", explanation: "Buy at 0, sell at 3 (+3); buy at 1, sell at 4 (+3)." },
      { input: "prices = [1,2,3,4,5]", output: "4", explanation: "One long trade (buy 1, sell 5) beats any split into two." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "Prices only fall — do nothing." },
    ],
    constraints: ["1 <= prices.length <= 10^5", "0 <= prices[i] <= 10^5", "at most two transactions, and they may not overlap"],
    breakdown: [
      "Stock I is a rolling minimum; two transactions break that idyll because the TIMELINE SPLIT becomes a variable — where does the first trade end and the second begin? Trying every split point with a fresh scan of both halves is O(n²). The rescue is that each half is itself a stock-I problem: one left-to-right pass computes the best single trade ending by day i, one right-to-left pass computes the best single trade starting at day i, and the answer is the best combination over split points — O(n) time, O(n) space (that is ladder rung two).",
      "The O(1)-space view recasts the day as a state machine. At any moment you occupy one of five situations — idle, holding the first share, banked the first sale, holding the second share, banked the second sale — and each day you either advance one step or stay put. Track the best CASH achievable in each of the four engaged states; the transitions are just ± today's price, and 'at most two trades' becomes 'you may walk the four-state chain at most once'.",
      "The subtle spot everyone probes: the recurrences below chain within a single day, so sell1 can consume this day's buy1 and buy2 can consume this day's sell1 — i.e. buy and sell at the same price. That looks like an exploit and is actually a no-op: selling at p and rebuying at p is arithmetically identical to having held, so the chaining can never inflate the answer. Every update order that only reads previously-final values is correct; the chained order is simply the one that needs this zero-profit argument.",
    ],
    edges: [
      "Never return negative: sell1 and sell2 start at 0, so a market that only falls answers 0 — the machine declines all trades by default.",
      "One trade can beat two: [1,2,3,4,5] is 4 held straight through; a forced split caps at 3. The maxes never force a split because sell2 ≥ sell1 at all times.",
      "Same-day sell-then-buy is legal here (sell on day i, buy on day i) and profit-neutral — the chained update order exploits it; banning it changes no answer but complicates every recurrence.",
      "A single price, or all-equal prices: nothing earns anything — 0 through both the machine and the array version.",
    ],
    ladder: [
      {
        title: "Brute force — enumerate the split",
        body: "For every split point i, find the best single trade in [0..i] and in [i..n−1], each by a fresh scan, and combine. O(n²). Correct — and it proves the shape of the answer: two independent stock-I problems glued at a split.",
      },
      {
        title: "Forward/backward profit arrays",
        body: "One left pass stores best[i] = best single trade within days 0..i (rolling-min trick); one right pass stores back[i] = best within days i..n−1 (rolling-max trick). Answer = max over i of best[i] + back[i]. O(n) time, O(n) space — a same-day overlap at the split is harmless because selling at p and rebuying at p nets zero.",
      },
      {
        title: "The optimal idea — four rolling state variables",
        body: "The arrays only ever need their running best, so collapse them: buy1 / sell1 / buy2 / sell2 — four numbers, one pass, O(1) space. Same answers, no arrays, and the recurrences read as 'advance the chain or stay put'.",
      },
    ],
    approach: "Four-variable state machine (buy1 / sell1 / buy2 / sell2)",
    code: `def maxProfit(prices):
    buy1 = buy2 = float("-inf")     # best cash while HOLDING share #1 / #2
    sell1 = sell2 = 0               # best cash after banking sale #1 / #2
    for p in prices:
        buy1 = max(buy1, -p)           # open trade 1 (or keep a cheaper entry)
        sell1 = max(sell1, buy1 + p)   # close trade 1
        buy2 = max(buy2, sell1 - p)    # open trade 2, funded by profit 1
        sell2 = max(sell2, buy2 + p)   # close trade 2
    return sell2                    # >= sell1 >= 0: fewer trades never lose`,
    walkthrough: [
      "Four numbers track the best cash in each engaged state: buy1 (holding the first share — cash is minus what you paid), sell1 (one trade banked), buy2 (holding the second share, funded by sell1), sell2 (both banked). Each day, per price p: buy1 = max(buy1, −p), sell1 = max(sell1, buy1 + p), buy2 = max(buy2, sell1 − p), sell2 = max(sell2, buy2 + p). Each max is literally 'advance one state or stay put', and sell2 is the answer because doing fewer trades is always available — a second trade can be declined, never forced.",
      "Why the within-day order is safe: sell1 may consume this very day's buy1 (buy and sell at the same p), and buy2 may consume this very day's sell1 (sell at p, re-buy at p). Both zero-profit loops are harmless — selling and rebuying at the same price is a no-op equivalent to holding — so the chained order can never overestimate. The reverse order (using yesterday's finals everywhere) is also correct; the chained order is just tighter, and it mirrors the array version allowing one split day to host both trades.",
      "Trace [3,3,5,0,0,3,1,4] as day → (buy1, sell1, buy2, sell2), unchanged days omitted: 3 → (-3, 0, -3, 0) | 5 → (-3, 2, -3, 2) | 0 → (0, 2, 2, 2) | 3 → (0, 3, 2, 5) | 1 → (0, 3, 2, 5) | 4 → (0, 4, 2, 6). Reading the jumps: p = 0 resets buy1 to 0 (buy free) and lifts buy2 to 2 (sell1's 2 minus 0); p = 3 completes the second trade for 5; p = 4 tops sell1 to 4 and sell2 to 6 — buy 0, sell 3, buy 1, sell 4. Final sell2 = 6, the two-trade optimum.",
    ],
    time: "O(n) — one pass, four state updates per day",
    space: "O(1) — four state variables",
    followUps: [
      "Generalise to k transactions — that is LC 188: the same machine unrolled into 2k rolling variables, plus the k ≥ n//2 greedy guard.",
      "Transaction fee (LC 714) or cooldown (LC 309): a fee is one subtraction inside each sell recurrence; a cooldown needs a fifth 'just sold, resting' state that delays the next buy by a day.",
    ],
    related: ["best-time-to-buy-and-sell-stock", "best-time-to-buy-and-sell-stock-iv", "best-time-to-buy-and-sell-stock-with-cooldown"],
    verify: {
      fn: "maxProfit",
      wrap: "plain",
      cases: [
        { args: [[3, 3, 5, 0, 0, 3, 1, 4]], expect: 6 },
        { args: [[1, 2, 3, 4, 5]], expect: 4 },
        { args: [[7, 6, 4, 3, 1]], expect: 0 },
        { args: [[1]], expect: 0 },
        { args: [[4, 4, 4]], expect: 0 },
        { args: [[1, 2, 4, 2, 5, 7, 2, 4, 9, 0]], expect: 13 },
      ],
    },
    xp: 35,
  },
  {
    slug: "best-time-to-buy-and-sell-stock-iv",
    statement:
      "The same trading game with a budget: at most k complete buy-then-sell cycles, one share at a time, cycles non-overlapping — the next buy may only follow the previous sale. k arrives as an argument and may be astronomically larger than the number of days. Return the maximum total profit, or 0 when nothing profitable exists.",
    examples: [
      { input: "k = 2, prices = [2,4,1]", output: "2", explanation: "Buy at 2, sell at 4; the drop to 1 can't fund a second trade." },
      { input: "k = 2, prices = [3,2,6,5,0,3]", output: "7", explanation: "Buy 2 → sell 6 (+4), then buy 0 → sell 3 (+3)." },
      { input: "k = 1000000000, prices = [1,2,3,4,5]", output: "4", explanation: "k can't bind — four rising pairs, take every one." },
    ],
    constraints: ["0 <= k <= 10^9", "1 <= prices.length <= 1000", "0 <= prices[i] <= 1000", "at most k transactions, and they may not overlap"],
    breakdown: [
      "123's machine generalises mechanically: k transactions is a chain of 2k states, expressible as 2k rolling variables (or a k×n DP table). But here k is INPUT — the judge may pass 100, or 10^9 — and allocating state proportional to k is the trap this problem exists to spring. Most of that state is provably dead weight.",
      "The degeneration lemma: one profitable transaction needs a strictly rising PAIR of days, and transactions don't overlap, so a length-n series supports at most ⌊n/2⌋ of them. Offer a bigger budget than that and the cap stops binding — the problem degenerates to unlimited transactions, i.e. sum every positive day-to-day delta. That guard is O(n) time and O(1) space, works for arbitrarily huge k, and is the difference between allocating 2k variables and 2·10^9 of them when a hostile judge sends k = 10^9.",
      "Remaining missteps: forgetting k = 0 (the rolling-pair version handles it gracefully — an empty inner loop — while a dp[k][n] table usually doesn't), and wiring buy[j] to the wrong predecessor. Transaction j opens FROM the cash of j−1 completed trades (sell[j−1]); sourcing it from sell[j] lets one 'transaction' quietly buy twice.",
    ],
    edges: [
      "k = 0 → 0 immediately: no budget, no trades — the inner loop never runs and sell[0] = 0 is returned.",
      "k ≥ n//2 is the memory cliff: without the degeneration guard the machine builds 2k variables (or a k×n table) that are all redundant — with k = 10^9 that is an instant out-of-memory.",
      "All-equal or non-increasing prices → 0 on BOTH paths: the greedy adds no positive deltas; the machine's sells stay at their initial 0.",
      "buy[j] must draw from sell[j−1], not sell[j] — swapping the source lets a single 'transaction' open twice, silently inflating profits.",
    ],
    ladder: [
      {
        title: "Brute force — recurse over days",
        body: "At each day, branch: skip, or (holding nothing, budget left) buy, or (holding) sell. Exponential without memoisation; even memoised it re-derives what a table would store.",
      },
      {
        title: "DP over (day, trades used, holding)",
        body: "A table over days × transactions-used × holding-bit, rolled day by day: O(n·k) time, O(k) space. Correct at contest scale — but it pays full price for k even when k is meaningless, and k = 10^9 makes the table a fantasy.",
      },
      {
        title: "The optimal idea — degeneration guard + 2k rolling pairs",
        body: "First the lemma: k ≥ ⌊n/2⌋ ⇒ the answer is the sum of positive deltas (O(n) time, O(1) space, immune to huge k). Otherwise unroll 123's four variables into k pairs of (buy[j], sell[j]) updated per day — O(n·k) worst case with k effectively capped at 500, O(k) space.",
      },
    ],
    approach: "Degeneration guard (k ≥ n//2) + 2k-variable state machine",
    code: `def maxProfit(k, prices):
    n = len(prices)
    if k >= n // 2:
        # Budget can't bind: a profitable trade needs a strictly rising pair of
        # days, so at most n//2 fit — beyond that this IS unlimited trading.
        return sum(max(prices[i + 1] - prices[i], 0) for i in range(n - 1))

    NEG = float("-inf")
    buy = [NEG] * (k + 1)           # buy[j]: best cash holding the j-th share
    sell = [0] * (k + 1)            # sell[j]: best cash after j closed trades
    for p in prices:
        for j in range(1, k + 1):
            buy[j] = max(buy[j], sell[j - 1] - p)   # open trade j from j-1 profits
            sell[j] = max(sell[j], buy[j] + p)      # close trade j
    return sell[k]                  # k=0 lands here too: empty loop, sell[0]=0`,
    walkthrough: [
      "The guard runs first: if k ≥ n // 2 the budget cannot bind, because one profitable transaction consumes a strictly rising pair of days and pairs don't overlap — a length-n series fits at most ⌊n/2⌋ of them. The answer is then stock II's greedy: add every positive day-to-day delta. That is O(n) time and O(1) space regardless of k — and it caps the state machine's effective k at 500 for a thousand-day series, no matter what the input claims.",
      "Otherwise, unroll 123's machine to k pairs: buy[j] is the best cash while holding the j-th share (entered from sell[j−1]), sell[j] the best cash after j completed trades. One pass over prices, inner loop j = 1..k, with the same within-day chaining as before — buy[j] may use a sell[j−1] refreshed this very day, which is profit-neutral for the same sell-then-rebuy-at-p reason as 123. k = 0 degenerates cleanly: the inner loop never runs and sell[0] = 0 is returned.",
      "Trace k = 2 on [3,2,6,5,0,3] as day → (buy1, sell1, buy2, sell2): 3 → (-3, 0, -3, 0) | 2 → (-2, 0, -2, 0) | 6 → (-2, 4, -2, 4) | 5 → (-2, 4, -1, 4) | 0 → (0, 4, 4, 4) | 3 → (0, 4, 4, 7). At p = 6 the buy2 slot ties at -2 — entering trade 2 by selling at 6 and rebuying at 6 is arithmetically identical to never having sold the buy at 2 — so the genuinely profitable second entry waits for p = 0, where buy2 jumps to 4. The final p = 3 closes the second trade: 4 + 3 = 7, the known optimum.",
    ],
    time: "O(n) on the greedy path; O(n·k) through the state machine (k effectively ≤ n//2 after the guard)",
    space: "O(1) greedy; O(k) for the 2k rolling variables",
    followUps: [
      "k arriving as 10^9 is the interview punchline for the guard: past ⌊n/2⌋ the problem literally IS unlimited transactions, so the correct answer allocates O(1) state.",
      "Fee and cooldown compose with k: subtract the fee inside every sell[j] update (LC 714), or add a resting state per pair that delays buy[j+1] by a day (LC 309) — the rolling-pair structure survives both.",
    ],
    related: ["best-time-to-buy-and-sell-stock-iii", "best-time-to-buy-and-sell-stock", "best-time-to-buy-and-sell-stock-with-transaction-fee"],
    verify: {
      fn: "maxProfit",
      wrap: "plain",
      cases: [
        { args: [2, [2, 4, 1]], expect: 2 },
        { args: [2, [3, 2, 6, 5, 0, 3]], expect: 7 },
        { args: [0, [1, 2, 3]], expect: 0 },
        { args: [1000000000, [1, 2, 3, 4, 5]], expect: 4 },
        { args: [2, [7, 7, 7, 7]], expect: 0 },
        { args: [2, [1, 2, 4, 2, 5, 7, 2, 4, 9, 0]], expect: 13 },
      ],
    },
    xp: 35,
  },
];
