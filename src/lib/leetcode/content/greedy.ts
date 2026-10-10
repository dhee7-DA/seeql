// Deep-dives — Greedy (NeetCode 150 section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const GREEDY: LcDeepDive[] = [
  {
    slug: "maximum-subarray",
    statement:
      "Given an integer array, find the contiguous run of elements with the largest sum and return that sum. The subarray must contain at least one element — an all-negative array still owes you its least-bad single element.",
    examples: [
      { input: "nums = [-2,1,-3,4,-1,2,1,-5,4]", output: "6", explanation: "The run [4,-1,2,1] sums to 6." },
      { input: "nums = [1]", output: "1" },
      { input: "nums = [5,4,-1,7,8]", output: "23", explanation: "The whole array is the best run." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^4 <= nums[i] <= 10^4"],
    breakdown: [
      "The question underneath the question: for each ending position i, what is the best sum of a subarray that ENDS exactly at i? Call it cur. If the best run ending at i−1 has a positive sum, attaching nums[i] to it beats starting fresh; if it is negative, it can only drag nums[i] down, so the run restarts at nums[i]. That is the entire greedy decision, made once per element, in one line: cur = max(n, cur + n).",
      "Why is dropping a negative prefix safe? Exchange argument: any candidate subarray ending at i either keeps the best prefix run or starts clean at i. If the prefix contributes a negative amount, severing it yields a strictly larger sum — so no optimal answer ever crosses a negative prefix boundary. The max() performs that severing implicitly, every single step.",
      "The classic missteps: initialising best to 0 and returning a phantom empty subarray on all-negative input, or recomputing every range sum from scratch (O(n²)). Kadane's needs two scalars and one pass. The divide-and-conquer alternative is worth knowing — it teaches the crossing-interval trick — but it pays an extra log factor for nothing here.",
    ],
    edges: [
      "All-negative input ([-3,-2,-5] → -2): seeding best = 0 silently returns the wrong 'empty run' answer.",
      "Single element — the loop body never runs; best must be seeded with nums[0], not 0.",
      "All-equal zeros: every prefix sums to 0, the answer is 0, and the restart branch never triggers.",
      "The best run may sit anywhere — start, end, middle; sweeping over all ENDINGS covers every case by construction.",
    ],
    ladder: [
      { title: "Brute force — every subarray", body: "Fix a start, extend an end, keep a running sum: O(n²) with the running-sum trick, O(n³) if you re-sum each range. Dead at n = 10^5, but worth writing once to appreciate what Kadane's collapses." },
      { title: "Divide and conquer", body: "Split in half; the answer is the best left run, the best right run, or a run crossing the middle (best left-suffix + best right-prefix, each from one linear sweep). T(n) = 2T(n/2) + O(n) → O(n log n). Elegant, and strictly dominated by Kadane's." },
      { title: "The optimal idea — best run ending here", body: "One pass carrying cur = best subarray sum ending at the current index: extend or restart, whichever is larger. The global answer is the max of cur over all endings. O(n) time, O(1) space, and the restart rule IS the greedy proof made executable." },
    ],
    approach: "Kadane's running maximum (drop-negative-prefix greedy)",
    code: `def maxSubArray(nums):
    best = cur = nums[0]            # best overall; best sum ending at this index
    for n in nums[1:]:
        cur = max(n, cur + n)       # extend the current run, or restart at n
        best = max(best, cur)       # the answer ends SOMEWHERE — remember each ending's best
    return best`,
    walkthrough: [
      "The invariant: after processing index i, cur is the maximum sum of a subarray ending exactly at i, and best is the max of cur over indices seen so far. Both hold at the seed (a one-element array's answer is nums[0]) and each step preserves them, so the final best is the global answer.",
      "Trace [-2,1,-3,4,-1,2,1,-5,4]: cur walks -2, 1, -2, 4, 3, 5, 6, 1, 5 while best walks -2, 1, 1, 4, 4, 5, 6, 6, 6. Note cur dipping twice — after 1,-3 and again after -5 — and the restart rule snapping it back to the fresh element each time.",
      "The restart at index 3 is the greedy in action: the prefix [-2,1,-3] sums to -4, so gluing 4 onto it would cap cur at 0 — worse than starting clean. Once a prefix can no longer help any future extension, discarding it costs nothing, and max() does the discarding implicitly.",
    ],
    time: "O(n) — one pass, O(1) work per element",
    space: "O(1) — two scalars",
    followUps: [
      "Return the subarray itself: record the start whenever cur restarts and the (start, end) of each new best — two extra variables, same pass.",
      "Circular variant (LC 918): the wrap-around answer is total sum minus the MINIMUM subarray; handle the all-negative case where that difference is 0 and the linear answer wins.",
    ],
    related: ["maximum-product-subarray", "best-time-to-buy-and-sell-stock", "house-robber"],
    verify: {
      fn: "maxSubArray",
      wrap: "plain",
      cases: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expect: 6 },
        { args: [[1]], expect: 1 },
        { args: [[5, 4, -1, 7, 8]], expect: 23 },
        { args: [[-3, -2, -5]], expect: -2 },
        { args: [[0, 0, 0]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "jump-game-ii",
    statement:
      "Each element of an array is the maximum length you may jump FORWARD from that position. Starting at index 0, return the minimum number of jumps needed to reach the last index. You are guaranteed the last index is reachable.",
    examples: [
      { input: "nums = [2,3,1,1,4]", output: "2", explanation: "Jump 0 → 1, then 1 → 4 (value 3 reaches past the end)." },
      { input: "nums = [2,3,0,1,4]", output: "2", explanation: "The zero at index 2 is a decoy — you never have to land on it." },
      { input: "nums = [1]", output: "0", explanation: "Already standing on the last index." },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= 10^4", "the last index is always reachable"],
    breakdown: [
      "Reframe as BFS on indices: level 0 is {0}, and from every index in level k you can reach a window of successors. Because each successor window is contiguous (index i reaches i+1..i+nums[i]) and unions of overlapping windows are windows, every BFS level is ONE interval. 'Minimum jumps' becomes 'how many interval-expansions until the interval swallows the last index'.",
      "That contiguity is why an O(n) sweep exists: no queue, only two numbers — the right edge of the current level (cur_end) and the farthest index any member of the level can see (farthest). Scan the level; when the scan walks past its right edge, the level is complete, one jump is spent, and farthest becomes the next right edge.",
      "The greedy safety argument is an exchange on BFS layers: if an optimal solution's k-th jump lands short of the farthest point reachable by jump k, stretching that jump to the farthest point only ADDS successors — every later position stays reachable within the same number of jumps. Maximal reach per layer is therefore never worse, which is exactly what the sweep commits to.",
    ],
    edges: [
      "Single element → 0 jumps; the scan stops at len−1 so you never spend a jump 'leaving' the last index.",
      "Zeros inside the array are harmless as long as some earlier index leaps OVER them ([2,3,0,1,4]) — the layer view never depends on landing anywhere specific.",
      "All-ones [1,1,1,1]: every layer advances one index; the answer degenerates to len−1.",
      "A big first jump finishes instantly ([5,1,1,1,1] → 1): the early exit when cur_end covers the goal shapes the trace, not the correctness.",
    ],
    ladder: [
      { title: "Brute force — BFS with a real queue", body: "Explicit level-order traversal over indices with a visited set. Correct and instructive — the O(n) sweep is precisely this queue, compressed — but it drags O(n) machinery for what is really two integers." },
      { title: "DP over fewest jumps per index", body: "jumps[i] = 1 + min(jumps[j]) over all j that can reach i: an O(n²) double loop. Worth stating aloud as the baseline; the window structure is exactly what it fails to exploit." },
      { title: "The optimal idea — level right-edges", body: "Carry cur_end (boundary of the current BFS layer) and farthest (best reach from inside the layer). When the scan crosses cur_end, spend a jump and promote farthest. One pass, O(1) space, guaranteed to terminate because the last index is reachable." },
    ],
    approach: "BFS-layer boundary sweep (implicit queue)",
    code: `def jump(nums):
    jumps = 0
    cur_end = 0        # rightmost index reachable with 'jumps' jumps
    farthest = 0       # rightmost index reachable with 'jumps' + 1 jumps
    for i in range(len(nums) - 1):      # the last index never launches a jump
        farthest = max(farthest, i + nums[i])
        if i == cur_end:                # walked off the layer's edge → must jump
            jumps += 1
            cur_end = farthest
            if cur_end >= len(nums) - 1:
                break                   # next layer already covers the goal
    return jumps`,
    walkthrough: [
      "Invariants: every index ≤ cur_end is reachable in at most 'jumps' moves, and farthest is the best reach of indices in the previous boundary..cur_end. When i hits cur_end the layer is exhausted — pressing on without jumping would strand the scan — so we commit one jump and promote farthest. The count is minimal because each boundary is the farthest point ANY member of the layer could reach.",
      "Trace [2,3,1,1,4]: i=0 stretches farthest to 2 and immediately closes layer 0 → jumps=1, cur_end=2. i=1 stretches farthest to 4; i=2 (== cur_end) closes layer 1 → jumps=2, cur_end=4 covers the goal → break. Two jumps, matching 0→1→4.",
      "Trace [2,3,0,1,4] shows why the sweep is safe around zeros: layer 0 closes at i=0 (cur_end=2), and i=1 pushes farthest to 4 — index 2's zero is never consulted as a launch pad because the layer had already seen better. The greedy depends only on what the whole layer can see, never on a chosen landing spot.",
    ],
    time: "O(n) — each index is scanned once",
    space: "O(1) — two integers and a counter",
    followUps: [
      "Jump Game I is the same sweep minus the counter: return true iff the expanding window ever reaches (or passes) the last index.",
      "If the 'always reachable' guarantee is dropped, detect the stall — i == cur_end with farthest still == i — and return −1 instead of silently looping.",
    ],
    related: ["jump-game", "jump-game-iii", "minimum-number-of-taps-to-open-to-water-a-garden"],
    verify: {
      fn: "jump",
      wrap: "plain",
      cases: [
        { args: [[2, 3, 1, 1, 4]], expect: 2 },
        { args: [[2, 3, 0, 1, 4]], expect: 2 },
        { args: [[1]], expect: 0 },
        { args: [[1, 1, 1, 1]], expect: 3 },
        { args: [[5, 1, 1, 1, 1]], expect: 1 },
        { args: [[2, 1, 1, 1, 1]], expect: 3 },
      ],
    },
    xp: 20,
  },
  {
    slug: "gas-station",
    statement:
      "Stations 0..n−1 sit on a circle; station i offers gas[i] litres and costs cost[i] litres to drive from i to the next station (wrapping around). Starting with an empty tank somewhere, you must visit every station once and return to your start. Return the index of a starting station that makes the trip possible, or −1 if none does. When an answer exists it is guaranteed unique.",
    examples: [
      { input: "gas = [1,2,3,4,5], cost = [3,4,5,1,2]", output: "3", explanation: "From 3: +4−1=3, +5−2=6, wrap +1−3=4, +2−4=2, +3−5=0 — never negative." },
      { input: "gas = [2,3,4], cost = [3,4,3]", output: "-1", explanation: "Total fuel 9 < total cost 10 — no start can conjure the missing litre." },
      { input: "gas = [5], cost = [4]", output: "0" },
    ],
    constraints: ["1 <= gas.length == cost.length <= 10^5", "0 <= gas[i], cost[i] <= 10^4", "the answer, if it exists, is unique"],
    breakdown: [
      "Two facts organise everything. Feasibility: a circuit is possible iff sum(gas) ≥ sum(cost) — every full lap nets the same total delta, so a deficit means no schedule can ever pay for it. Orientation: the per-step quantity that matters is d[i] = gas[i] − cost[i], and the question becomes 'is there a rotation of the d array whose every prefix sum stays ≥ 0?'",
      "The restart trick answers the rotation question in one pass: walk once accumulating the tank; the moment it dips negative, the current start candidate dies — and so does every candidate BETWEEN it and here. Why: the tank held non-negative sums from that start up to every intermediate index (else we would have restarted earlier), so subtracting those healthy prefixes from the failed total shows each intermediate start also fails at or before the same station. Discard the whole block; restart just past the corpse.",
      "Why the final restart point is THE answer: the surviving suffix never dips (by construction), and every discarded segment sums ≤ 0 while its proper prefixes stay ≥ 0. When the tour wraps and re-enters the discarded region, the tank equals total minus a non-positive quantity — hence ≥ total ≥ 0 — so the wrap is safe. Uniqueness comes free: every other start was already proven dead by the sweep.",
    ],
    edges: [
      "sum(gas) == sum(cost) exactly: feasible, and the successful tour ends on an empty tank — the ≥ check (not >) matters.",
      "Single station: possible iff gas[0] ≥ cost[0]; the loop never restarts.",
      "Deficit early, surplus late: the answer is typically NOT 0 — in [1,2,3,4,5]/[3,4,5,1,2] three segments die before start 3 survives.",
      "All-zero fuel and cost ([0]/[0]): a valid tour with tank 0 throughout; don't demand strictly positive fuel anywhere.",
    ],
    ladder: [
      { title: "Brute force — try every start", body: "For each start, walk the circle with a tank and bail on the first negative. O(n²) worst case (every start walks the whole loop on balanced arrays) — correct, and the baseline the sweep must beat." },
      { title: "Prefix sums over the doubled array", body: "Build prefix sums P of d and ask for a rotation whose prefixes stay ≥ 0 — answerable with a sliding-window minimum over P in O(n), but the doubled array and deque are heavy machinery for what the restart trick buys with two variables." },
      { title: "The optimal idea — restart on deficit", body: "One pass, one tank, one start pointer. A negative dip kills the entire candidate block at once (the prefix argument), so each station is discarded at most once and the sweep stays linear. The uniqueness guarantee means the survivor needs no re-verification lap." },
    ],
    approach: "Total-gain feasibility + restart-on-deficit sweep",
    code: `def canCompleteCircuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1                  # feasibility: every lap nets this deficit
    start, tank = 0, 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            # start..i all fail together: the tank was healthy until this dip,
            # so any intermediate start inherits the failure at or before i.
            start = i + 1          # next candidate begins AFTER the corpse
            tank = 0
    return start`,
    walkthrough: [
      "The pass maintains one invariant per segment: since the last reset, the tank stayed ≥ 0 until the very step that triggers the next reset. So each discarded segment [start..i] sums negative while all of its proper prefixes sum non-negative — the two facts the correctness proof consumes.",
      "Trace [1,2,3,4,5]/[3,4,5,1,2], d = [−2,−2,−2,3,3]: the tank dies at i=0, 1, 2 in turn — start advances to 3 — then climbs 3, 6. Total gain is 0, so station 3 opens with the whole failed region behind it, and the wrap-around tank (6 at the seam, only growing through the failed region's non-positive segments) never dips.",
      "The final return needs no second lap, and that is the punchline: the sweep has already PROVEN every other start dead — each died at or before the dip that evicted its block — while the total-gain precondition guarantees the survivor covers the wrap. One pass, no re-check.",
    ],
    time: "O(n) — plus O(n) for the total-sum precondition",
    space: "O(1) — start, tank, an index",
    followUps: [
      "Drop the uniqueness guarantee and return ALL viable starts: start s works iff every prefix sum of the rotation beginning at s is ≥ 0; segment-minimum bookkeeping over the same sweep enumerates them in O(n).",
      "Cap the tank at K litres: the restart argument no longer suffices — a surplus only helps if it fits under the cap, and you must track running minima within feasible windows.",
    ],
    related: ["jump-game", "partition-array-into-disjoint-intervals"],
    verify: {
      fn: "canCompleteCircuit",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expect: 3 },
        { args: [[2, 3, 4], [3, 4, 3]], expect: -1 },
        { args: [[5], [4]], expect: 0 },
        { args: [[4], [5]], expect: -1 },
        { args: [[5, 8, 2, 8], [6, 5, 6, 6]], expect: 3 },
        { args: [[3, 1, 1], [1, 2, 2]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "hand-of-straights",
    statement:
      "You hold a hand of cards, possibly with repeated values. Decide whether the ENTIRE hand can be dealt into groups of exactly groupSize cards, where every group consists of groupSize consecutive integer values (like 4,5,6). Every card is used exactly once.",
    examples: [
      { input: "hand = [1,2,3,6,2,3,4,7,8], groupSize = 3", output: "true", explanation: "[1,2,3], [2,3,4], [6,7,8]." },
      { input: "hand = [1,2,3,4,5], groupSize = 4", output: "false", explanation: "5 cards can't split into groups of 4." },
      { input: "hand = [8,10,12], groupSize = 3", output: "false", explanation: "Gaps of 2 — no run of consecutive values exists." },
    ],
    constraints: ["1 <= hand.length <= 10^4", "0 <= hand[i] <= 10^9", "1 <= groupSize <= hand.length"],
    breakdown: [
      "Sort the distinct values and deal from the bottom: the smallest card still on the table MUST open a group, because nothing smaller exists to sit beneath it. So all count[smallest] copies of it anchor groups, and each of those groups demands a copy of the next groupSize−1 values; any short link makes the deal impossible. This is 'consume the smallest, propagate the obligation upward'.",
      "Why is anchoring every group at its minimum safe? Exchange argument: in ANY valid dealing, the smallest remaining card belongs to some group, and that group's other members are forced — they must be exactly the next values up. Several groups starting at the same minimum each consume the same successors, so checking the need in one batch merely compresses a dealing that was already fully determined. No choice existed at the minimum, so no choice is lost.",
      "The implementation trap is simulating card-by-card (O(n · groupSize)): for [1,2,2,3,3,4] with groupSize 3 you would walk the 2s and 3s twice. Recording need = count[smallest] and subtracting it from ALL groupSize values at once consumes every card exactly once — linear after the sort of distinct keys.",
    ],
    edges: [
      "len(hand) % groupSize != 0 → instant false; a one-line divisibility filter saves the entire simulation.",
      "Duplicates must land in DIFFERENT groups: [2,2,2] with groupSize 3 needs [2,3,4] three times — one 3 and no 4 says false despite three 2s.",
      "groupSize = 1 is always true — every card is its own trivial run.",
      "Value 0 is a legal card (the constraint allows it); don't filter out 'non-positive' values out of habit.",
    ],
    ladder: [
      { title: "Brute force — simulate the deal", body: "Sort the whole hand; repeatedly pop the smallest and hunt for its groupSize−1 successors, deleting as you go. O(n log n) sorting plus O(n · groupSize) deletion-driven scanning; correct and a fine first answer." },
      { title: "Count map + min-heap", body: "Heap of distinct values; repeatedly read the min and consume need copies of each successor. Same correctness as sorted keys, and the natural bridge if the hand arrives as a stream — but the heap buys nothing once you can sort." },
      { title: "The optimal idea — batch consumption", body: "Sorted distinct keys plus the need trick: subtract count[min] from every member of the emerging group in one stroke. Each card is consumed exactly once and each key visited once → O(n log n) worst case (the sort), effectively O(n) in consumption." },
    ],
    approach: "Count map over sorted distinct values, batched consumption",
    code: `from collections import Counter

def isNStraightHand(hand, groupSize):
    if len(hand) % groupSize:
        return False               # cards can't divide into even groups
    count = Counter(hand)
    for card in sorted(count):     # smallest value still owing groups
        need = count[card]         # every group anchored here needs successors
        if need > 0:
            for nxt in range(card, card + groupSize):
                if count[nxt] < need:
                    return False   # not enough links to carry 'need' groups
                count[nxt] -= need # consume them in one batch
    return True`,
    walkthrough: [
      "The loop's invariant: when the sweep reaches value v, every card smaller than v is fully consumed, so count[v] is exactly the number of groups that must START at v. Reading need from the map — not from a plan — is what makes the pass self-correcting: earlier obligations have already been propagated upward into count[v].",
      "Trace [1,2,3,6,2,3,4,7,8], groupSize 3: counts are 1:1, 2:2, 3:2, 4:1, 6:1, 7:1, 8:1. Card 1 anchors need=1 → drains 2 and 3 to 1 each. Card 2 now anchors need=1 → drains 3 and 4. Card 6 anchors need=1 → drains 7 and 8. Every count hits zero — true.",
      "The batch subtraction is also the proof machine: committing need copies of each successor simultaneously is equivalent to dealing need distinct groups in parallel, and since those groups' memberships were forced by the minimum, the batch commit cannot diverge from any hypothetical valid dealing.",
    ],
    time: "O(n log n) — sorting the distinct values; the consumption sweep is linear overall",
    space: "O(n) — the count map",
    followUps: [
      "Streaming hand (LC's own follow-up): you can't hold the whole count map in memory — consume lazily with a queue of outstanding obligations (value, remaining) bounded by the active window.",
      "Emit an actual dealing, not just a boolean: tag each batch with a group id as you subtract; the same pass reconstructs the partition.",
    ],
    related: ["divide-array-in-sets-of-k-consecutive-numbers", "task-scheduler"],
    verify: {
      fn: "isNStraightHand",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 6, 2, 3, 4, 7, 8], 3], expect: true },
        { args: [[1, 2, 3, 4, 5], 4], expect: false },
        { args: [[8, 10, 12], 3], expect: false },
        { args: [[1], 1], expect: true },
        { args: [[2, 2, 2], 3], expect: false },
        { args: [[0, 0, 1, 1, 2, 2], 3], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "merge-triplets-to-form-target-triplet",
    statement:
      "You have a list of integer triplets and one target triplet. One move picks two triplets (a,b,c) and (d,e,f) and replaces one of them with (max(a,d), max(b,e), max(c,f)). Decide whether the target can appear in your collection after any number of moves.",
    examples: [
      { input: "triplets = [[2,5,3],[1,8,4],[1,7,5]], target = [2,7,5]", output: "true", explanation: "Merge [2,5,3] with [1,7,5] → [2,7,5]. ([1,8,4] is poison — its 8 overshoots.)" },
      { input: "triplets = [[3,4,5],[4,5,6]], target = [3,2,5]", output: "false", explanation: "Every triplet has ≥ 3 in the middle coordinate, and max only grows — 2 is unreachable." },
      { input: "triplets = [[2,5,3],[2,3,4],[1,2,5],[5,2,3]], target = [5,5,5]", output: "true", explanation: "Each coordinate's 5 lives in a different triplet; merge the three donors." },
    ],
    constraints: ["1 <= triplets.length <= 10^5", "triplets[i].length == target.length == 3", "1 <= triplets[i][j], target[j] <= 10^3"],
    breakdown: [
      "The merge operation is a coordinate-wise MAX, and max is monotone: values only ever grow, never shrink. That one fact splits the world into safe triplets (every coordinate ≤ the target's) and poison (any coordinate > target). Merging a poison triplet inflates that coordinate past the target forever — max never comes back down — so poison is unusable, full stop.",
      "Among safe triplets, order is irrelevant: max is associative and commutative, so merging ALL safe triplets in any order yields (max of column 0, max of column 1, max of column 2). If each target coordinate is held by SOME safe triplet, the grand merge produces exactly the target; if some coordinate is held by none, no subset can produce it either — a max can never exceed its inputs. Both directions in one observation: the greedy filter is an iff, not a heuristic.",
      "The naive instinct is to search over merge sequences (exponential) or to greedily merge 'closest' triplets first, which works by accident and hides why order never mattered. Sorting, heaps, priority queues: all noise. The real solution is filter, then check three columns.",
    ],
    edges: [
      "A triplet equal to the target makes the answer true with zero moves — the filter keeps it and the column check lights all three flags.",
      "A triplet overshooting in one coordinate but matching another is STILL poison — partial usefulness doesn't survive the monotonicity argument.",
      "All triplets poison → false by vacuity: the kept list is empty and no coordinate is ever found.",
      "Target coordinates scattered across DIFFERENT triplets is the interesting case — the donors chain into one another via merges.",
    ],
    ladder: [
      { title: "Brute force — search merge sequences", body: "Try every pair, every choice of survivor, recursively: exponential, and the state is an entire multiset so memoisation has nothing to grip. Worth naming only so you can kill it out loud." },
      { title: "Greedy simulation — merge best-first", body: "Repeatedly merge the safe triplet contributing the most new target coordinates until nothing changes. Converges to the grand merge (so it's correct) but costs O(n²) bookkeeping and obscures the order-invariance that makes the problem easy." },
      { title: "The optimal idea — filter, then check columns", body: "Keep triplets with all coordinates ≤ target; one scan marks which target coordinates are achieved exactly. Answer = all three marked. O(n) time, and the monotone-max argument makes both directions airtight." },
    ],
    approach: "Monotone filter + per-coordinate achievability",
    code: `def mergeTriplets(triplets, target):
    good = [t for t in triplets
            if all(t[i] <= target[i] for i in range(3))]   # poison can never be touched
    found = [False, False, False]
    for t in good:
        for i in range(3):
            if t[i] == target[i]:
                found[i] = True    # this safe triplet supplies coordinate i
    return all(found)`,
    walkthrough: [
      "The filter is the whole solution, and its justification is worth rehearsing: if t[j] > target[j] for some j, any merge including t inflates coordinate j past the target, and no later operation can reduce it — max is a ratchet. Safe triplets are the only legal ingredients, so discarding the rest loses nothing.",
      "Sufficiency: merge every safe triplet into one — legal because pairwise maxes of safe values stay ≤ target everywhere, and by associativity the result per coordinate is the column max. If column i contains target[i] (the flag found[i] records exactly this), the grand merge equals the target. Necessity: any merge output at coordinate i is the max of a subset of column i, so it hits target[i] only if some safe triplet already held it.",
      "Trace example 1: [1,8,4] is filtered (8 > 7). Survivors [2,5,3] and [1,7,5] supply coordinates 0,2 and 1,2 — all flags set → true, and the witness merge is exactly the example's. Trace example 2: both triplets carry ≥ 3 in the middle column, the filter empties the list, coordinate 1 is never found → false.",
    ],
    time: "O(n) — one filter pass, one flag pass",
    space: "O(n) for the kept list (O(1) if you fold both passes into one loop)",
    followUps: [
      "Emit the merge plan: keep, per safe triplet, a bitmask of which target coordinates it supplies; the donors merge into each other in (donor count − 1) moves — or zero if some triplet already equals the target.",
      "Swap max for sum and the problem transforms: exact per-coordinate sums make reachability a subset-sum question, and the one-line monotone filter argument dies because sums are not bounded by the target.",
    ],
    related: ["jump-game", "gas-station"],
    verify: {
      fn: "mergeTriplets",
      wrap: "plain",
      cases: [
        { args: [[[2, 5, 3], [1, 8, 4], [1, 7, 5]], [2, 7, 5]], expect: true },
        { args: [[[3, 4, 5], [4, 5, 6]], [3, 2, 5]], expect: false },
        { args: [[[2, 5, 3], [2, 3, 4], [1, 2, 5], [5, 2, 3]], [5, 5, 5]], expect: true },
        { args: [[[1, 1, 1]], [1, 1, 1]], expect: true },
        { args: [[[2, 2, 2]], [1, 1, 1]], expect: false },
        { args: [[[1, 2, 1], [2, 1, 1], [1, 1, 2], [1, 1, 1]], [2, 2, 2]], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "partition-labels",
    statement:
      "Cut a lowercase string into as many pieces as possible so that no single letter appears in more than one piece. Return the list of piece lengths, in order.",
    examples: [
      { input: 's = "ababcbacadefegdehijhklij"', output: "[9,7,8]", explanation: '"ababcbaca", "defegde", "hijhklij" — every letter stays inside its own piece.' },
      { input: 's = "eccbbbbdec"', output: "[10]", explanation: "'e' and 'c' both reappear at the end, dragging the first piece across the whole string." },
      { input: 's = "abc"', output: "[1,1,1]", explanation: "No letter repeats — every character is its own piece." },
    ],
    constraints: ["1 <= s.length <= 500", "s consists of lowercase English letters"],
    breakdown: [
      "Each letter casts a shadow: the interval from its first occurrence to its last. A piece is exactly a union of shadows that no other shadow crosses — the problem is interval merging wearing a costume. The first cut is forced: the piece containing s[0] must reach at least last[s[0]], and every letter absorbed along the way extends the reach to ITS last occurrence, until the reach stops moving. Cut there.",
      "Why is the first stable cut globally optimal? Safety: at the cut, the reach equals the maximum last-occurrence of every letter absorbed, so nothing inside the piece reappears after it — the piece is legally self-contained. Maximality: any earlier boundary would sit strictly inside the current reach, and the reach only grew because some absorbed letter occurs beyond it, so that letter would be split across pieces. Induction on the remainder finishes the argument: the same greedy applies to the suffix, so the cut count is maximal.",
      "The naive missteps: recomputing letter extents per piece (O(n²)), or testing every candidate cut with a validity check (same blow-up). One last-occurrence map, built in a single pass, makes the main sweep O(n) with O(1) extra space — the interval merge happens implicitly inside a max().",
    ],
    edges: [
      "All-distinct string → all pieces of length 1; the reach never extends past the current index.",
      "All-equal string ('aaaa') → one piece of length 4; the first letter's shadow swallows everything.",
      "A letter whose last occurrence is its first: the max() update must tolerate a reach that doesn't move.",
      "The cut fires when index == reach, not when a letter repeats — the piece length is i − start + 1, and off-by-ones at that boundary are the classic bug.",
    ],
    ladder: [
      { title: "Brute force — grow and check", body: "For every candidate cut, verify no letter inside the prefix reappears in the suffix: O(n²) checks even with counts precomputed. Correct, but it makes the shadow structure invisible." },
      { title: "Interval formulation", body: "Build [first, last] intervals per letter, merge overlapping intervals, report merged lengths. O(n log n) from the sort (or O(n + 26²) counting); conceptually clean and it generalises, but the explicit interval objects are pure overhead here." },
      { title: "The optimal idea — last-occurrence reach", body: "One map letter → last index; sweep once carrying the current reach. When the index catches the reach, emit the piece and restart. O(n) time, O(1) space (≤ 26 keys), no sorting, no interval objects — merging happens inside the max()." },
    ],
    approach: "Last-occurrence window extension",
    code: `def partitionLabels(s):
    last = {ch: i for i, ch in enumerate(s)}   # each letter's final position
    sizes = []
    start = end = 0
    for i, ch in enumerate(s):
        end = max(end, last[ch])   # absorbing ch stretches the piece to its shadow
        if i == end:               # reach stable → nothing inside reappears later
            sizes.append(i - start + 1)
            start = i + 1
    return sizes`,
    walkthrough: [
      "The invariant: end is always the largest last-occurrence among letters seen since start — i.e. the earliest legal cut at or after i. That is precisely the interval-merge frontier: each new letter either leaves end alone or yanks it to its own last position, which is merging two overlapping intervals in one max().",
      "Trace \"ababcbacadefegdehijhklij\": last[a]=8, last[b]=5, last[c]=7. The first piece's reach snaps to 8 at i=0 and never moves — cut at 8, size 9. Then d's shadow (14) and e's (15) chain the reach to 15 → cut at 15, size 7. The tail's reaches top out at 23 → size 8. [9,7,8].",
      "Trace \"eccbbbbdec\": e's last is 8 and c's is 9, so the very first letter drags the reach to 8 and the second to 9; the b's and d in between never exceed it. One piece of length 10 — the string is a single indivisible shadow cluster, which is exactly what the output says.",
    ],
    time: "O(n) — one pass to build last, one to sweep",
    space: "O(1) — at most 26 map entries plus the output",
    followUps: [
      "Return the pieces themselves, not just sizes: slice s[start:end+1] at each cut — the map already carries everything needed.",
      "Reverse the objective — exactly K pieces minimising the largest piece, or pieces of at least some size: the plain sweep can't express that; the interval formulation plus binary search can. Knowing when to switch views is the real lesson.",
    ],
    related: ["merge-intervals", "non-overlapping-intervals"],
    verify: {
      fn: "partitionLabels",
      wrap: "plain",
      cases: [
        { args: ["ababcbacadefegdehijhklij"], expect: [9, 7, 8] },
        { args: ["eccbbbbdec"], expect: [10] },
        { args: ["abc"], expect: [1, 1, 1] },
        { args: ["a"], expect: [1] },
        { args: ["aaaa"], expect: [4] },
        { args: ["abac"], expect: [3, 1] },
      ],
    },
    xp: 20,
  },
  {
    slug: "valid-parenthesis-string",
    statement:
      "A string contains '(', ')' and '*'. Each '*' may be read as '(', as ')', or deleted entirely. Decide whether SOME reading of the stars turns the whole string into a balanced parenthesis string.",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "(*)"', output: "true", explanation: "Delete the star: '(' + '' + ')' balances." },
      { input: 's = "(*))"', output: "true", explanation: "Read the star as '(' → '(())'." },
    ],
    constraints: ["1 <= s.length <= 100", "s[i] is '(', ')' or '*'"],
    breakdown: [
      "The open-count — lefts minus rights — is the entire state of a parenthesis scan, and '*' makes it uncertain: after a prefix, MANY open-counts may still be achievable depending on how the stars get read. The key structural fact is that the achievable set is always a contiguous integer range [lo, hi]: '(' shifts both ends up, ')' shifts both down, '*' widens to [lo−1, hi+1], and the union of overlapping intervals is an interval — so contiguity survives every step.",
      "With the range invariant, validity decomposes into two checks. Downward safety: if hi < 0 at any point, even the most star-generous reading went below zero — some ')' closed nothing — and no future star can repair the past; return false immediately. Upward reachability: at the end, some reading must land on open-count exactly 0, i.e. lo == 0. The clamp lo = max(lo, 0) keeps the lower bound honest: reading a star as ')' when nothing is open is a void reading, not a legal negative depth.",
      "Why is the range enough — don't we need to know WHICH readings stay non-negative throughout? We do track that: the range only contains counts reachable by readings that have stayed valid so far, because transitions shift both endpoints uniformly. Chasing individual assignments (3^k for k stars) or pushing stacks throws away exactly this interval structure.",
    ],
    edges: [
      "A lone '*' is true (delete it) — but a lone '(' is false and a lone ')' is false; the range machinery lands all three without special cases.",
      "'**(' is false: two stars absorb nothing that helps the trailing '(', and the final lo = 1 exposes it. The clamp at 0 is what makes this come out right.",
      "Star-as-')' with an empty stack must not drive lo to −1 — the max(lo, 0) clamp encodes 'that reading is void', not 'depth went negative'.",
      "All-stars: always true (read every star as nothing); the range stays [0, k] throughout.",
    ],
    ladder: [
      { title: "Brute force — try every star reading", body: "Each '*' takes 3 roles: 3^k assignments, each validated with a linear scan — hopeless for n = 100 (3^100 dwarfs atoms). Memoising per (index, open-count) is the natural patch and leads straight to the DP below." },
      { title: "Interval DP over substrings", body: "dp[i][j] = can s[i..j] balance? Either split at k (dp[i][k] and dp[k+1][j]) or strip matching ends (s[i] in '(*', s[j] in '*)', recurse inward). O(n³) — tolerable at n = 100, but bulky, and it never notices the open-count is a single number." },
      { title: "The optimal idea — track the open-count range", body: "Two integers, one pass. lo/hi bracket every achievable open count; '*' widens the bracket, ')' narrows it, and an early hi < 0 bail handles dead prefixes. O(n) time, O(1) space, with a two-line contiguity lemma behind it." },
    ],
    approach: "Open-count range tracking (lo/hi greedy)",
    code: `def checkValidString(s):
    lo = hi = 0                    # min / max achievable open-count so far
    for ch in s:
        if ch == "(":
            lo += 1
            hi += 1
        elif ch == ")":
            lo -= 1                # every reading loses one open
            hi -= 1
        else:                      # '*'
            lo -= 1                # as ')' — the lowest the count could sink
            hi += 1                # as '(' — the highest it could climb
        if hi < 0:                 # even the kindest reading closed nothing → dead prefix
            return False
        lo = max(lo, 0)            # star-as-')' with nothing open is void, not depth -1
    return lo == 0                 # some reading ends balanced`,
    walkthrough: [
      "Invariant: after consuming a prefix, every integer in [lo, hi] is the open-count of SOME reading of that prefix that never dipped negative, and no valid reading's count lies outside. '(' and ')' translate the whole interval; '*' replaces it with [lo−1, hi+1] — still contiguous — so one max() and one clamp per character maintain it exactly.",
      "Trace \"(*))\": '(' → [1,1]; '*' → [0,2]; ')' → [−1→0, 1]; ')' → [−1→0, 0]. Final lo = 0 → true (star-as-'(' gives '(())'). Trace \"**(\": the stars widen to [0,1] then [0,2] — the clamp eating the −1s — then '(' lifts to [1,3]; final lo = 1 → false, correctly, since no reading removes that trailing '('.",
      "The hi < 0 early return is the forward half of validity (never close nothing); lo == 0 at the end is the backward half (some reading finishes empty). Both halves are needed: '(()' survives every prefix check but dies on the final lo, while ')(' dies instantly on hi.",
    ],
    time: "O(n) — one pass, constant work per character",
    space: "O(1) — two integers",
    followUps: [
      "Count the valid readings instead of deciding existence: an O(n³)-ish counting DP over (index, open-count) with three-way star branches — the range trick gives existence for free but not multiplicity.",
      "Two-pass alternative proving the same lemma differently: sweep left-to-right treating '*' as '(' (count must never go negative), then right-to-left treating '*' as ')' the same way — valid iff both sweeps survive.",
    ],
    related: ["valid-parentheses", "longest-valid-parentheses"],
    verify: {
      fn: "checkValidString",
      wrap: "plain",
      cases: [
        { args: ["()"], expect: true },
        { args: ["(*)"], expect: true },
        { args: ["(*))"], expect: true },
        { args: ["*"], expect: true },
        { args: [")("], expect: false },
        { args: ["**("], expect: false },
      ],
    },
    xp: 20,
  },
  {
    slug: "best-time-to-buy-and-sell-stock-ii",
    statement:
      "You see an array of daily stock prices. You may buy and sell any number of times, but you may hold at most one share at a time (sell before buying again). Return the maximum total profit achievable.",
    examples: [
      { input: "prices = [7,1,5,3,6,4]", output: "7", explanation: "Buy at 1, sell at 5 (+4); buy at 3, sell at 6 (+3)." },
      { input: "prices = [1,2,3,4,5]", output: "4", explanation: "One buy at the start, one sell at the end — the rises telescope." },
      { input: "prices = [7,6,4,3,1]", output: "0", explanation: "Prices only fall; never trade." },
    ],
    constraints: ["1 <= prices.length <= 3·10^4", "0 <= prices[i] <= 10^4"],
    breakdown: [
      "Write any transaction as buying on day a and selling on day b. Its profit p[b] − p[a] telescopes: it equals the sum of day-to-day deltas p[t] − p[t−1] over the holding span. So EVERY schedule's profit is a sum of some signed deltas — and, crucially, no schedule can beat the sum of all POSITIVE deltas: each transaction's telescoped total swallows every negative delta on its span, which the all-positives sum cleanly skips.",
      "The greedy achieves that bound exactly: collect p[i] − p[i−1] whenever it is positive — hold across every rise, sit out every fall. 'Holding through consecutive rises' and 'buying at each valley, selling at each peak' are the same schedule at different zoom, because one transaction spanning a climb is just the sum of its daily rises.",
      "Optimality is now mechanical: any schedule's profit ≤ Σ positive deltas (the telescoping bound), and the greedy earns exactly Σ positive deltas. Equality with the upper bound → optimal. No DP table, no state machine — though the O(n) hold/cash DP lands on the same number and generalises to where the delta trick breaks (fees, cooldowns).",
    ],
    edges: [
      "Single day → 0: the loop never runs, and you can't buy and sell within one day anyway.",
      "Monotonic rise → one virtual transaction spanning the whole run; the delta sum and the buy-once-sell-once schedule agree.",
      "Monotonic fall → 0; every delta is negative and the greedy trades never.",
      "Flat stretches (all-equal prices) contribute zero deltas — the strict `>` keeps them silent; `>=` would be harmless here but sloppy in fee'd variants.",
    ],
    ladder: [
      { title: "Brute force — enumerate schedules", body: "Try every buy/sell day pair and chain transactions recursively: exponential. Even the polynomial framing — best transaction starting from each sell day — is O(n²) and misses the telescoping structure entirely." },
      { title: "Valley-peak simulation", body: "Buy at every local minimum, sell at every local maximum. Correct and it produces an interpretable schedule, but boundary handling (plateaus, the final element) is fiddly compared to the delta form, which dissolves the boundaries." },
      { title: "The optimal idea — sum the positive deltas", body: "One line of arithmetic: profit = Σ max(0, p[i] − p[i−1]). It IS the peak-valley schedule with the edges smoothed off, and the telescoping identity turns 'prove the greedy optimal' into a two-line bound." },
    ],
    approach: "Sum of positive daily deltas",
    code: `def maxProfit(prices):
    profit = 0
    for i in range(1, len(prices)):
        if prices[i] > prices[i - 1]:
            profit += prices[i] - prices[i - 1]   # a rise is free money — hold across it
    return profit`,
    walkthrough: [
      "The identity doing all the work: the sum of deltas from a+1 through b equals p[b] − p[a]. Any holding period's profit is its daily deltas added up, so the whole schedule space is 'some subset of signed deltas', and the subset of ALL positive deltas is an upper bound no schedule can pass.",
      "Trace [7,1,5,3,6,4]: deltas −6, +4, −2, +3, −2; positives sum to 7. The greedy's implicit actions: hold days 1→2 (collect +4), then hold days 3→4 (collect +3) — buy at 1, sell at 5, buy at 3, sell at 6, exactly the example's schedule.",
      "Trace [1,2,3,4,5]: deltas +1+1+1+1 = 4 — one unbroken hold. Trace [7,6,4,3,1]: all deltas negative, profit 0. On plateaus ([2,2,2,2]) the strict comparison contributes nothing, which is right: buying and selling at the same price earns zero and, in fee'd variants, loses real money.",
    ],
    time: "O(n) — one comparison per day",
    space: "O(1) — a running total",
    followUps: [
      "At most ONE transaction (LC 121): the same telescoping view reduces to 'largest sum of a contiguous delta subarray' — Kadane's on the deltas, or the min-so-far sweep.",
      "Transaction fee (LC 714) or cooldown (LC 309) breaks the delta shortcut — a negative delta may be worth eating — and the hold/cash state-machine DP becomes the honest answer.",
    ],
    related: ["best-time-to-buy-and-sell-stock", "best-time-to-buy-and-sell-stock-with-cooldown"],
    verify: {
      fn: "maxProfit",
      wrap: "plain",
      cases: [
        { args: [[7, 1, 5, 3, 6, 4]], expect: 7 },
        { args: [[1, 2, 3, 4, 5]], expect: 4 },
        { args: [[7, 6, 4, 3, 1]], expect: 0 },
        { args: [[5]], expect: 0 },
        { args: [[2, 2, 2, 2]], expect: 0 },
        { args: [[3, 3, 5, 0, 0, 3, 1, 4]], expect: 8 },
      ],
    },
    xp: 20,
  },
  {
    slug: "wiggle-subsequence",
    statement:
      "A wiggle sequence is one whose consecutive differences strictly alternate between positive and negative (a one-element sequence qualifies, as does any two UNEQUAL elements; equal neighbours give a zero difference, which breaks the pattern). From the given array, delete any elements while preserving order to obtain the longest wiggle subsequence — return its length.",
    examples: [
      { input: "nums = [1,7,4,9,2,5]", output: "6", explanation: "Differences +6, −3, +5, −7, +3 alternate — the whole array already wiggles." },
      { input: "nums = [1,17,5,10,13,15,10,5,16,8]", output: "7", explanation: "E.g. [1,17,5,10,5,16,8]: +16, −12, +5, −5, +11, −8 — the rise 10→13→15 collapses into one move." },
      { input: "nums = [1,2,3,4,5,6,7,8,9]", output: "2", explanation: "Strictly rising — any two elements wiggle, a third can't." },
    ],
    constraints: ["1 <= nums.length <= 1000", "0 <= nums[i] <= 1000"],
    breakdown: [
      "Read the array as a mountain profile: rises, falls, plateaus. A wiggle subsequence is a walk that turns at every step, so its elements are exactly peaks and valleys. The greedy claim: keep every local extremum (one element per plateau) and you can't do better — deleting an interior element of a monotone run only merges two same-direction moves, which is illegal in a wiggle.",
      "The exchange argument, made precise: given any wiggle subsequence, each of its elements may be swapped for the extremum (peak or valley) of the monotone run around it without breaking alternation — the swap only magnifies the adjacent differences, and bigger differences never hurt strict alternation. So some optimal subsequence contains one extremum per monotone run, and that is exactly what the up/down counters count.",
      "Ties (equal neighbours) are the subtle case: a zero difference neither rises nor falls, so it cannot extend a wiggle — but it cannot hurt either, because a plateau's far endpoint has a difference at least as steep as the near one. The up/down formulation absorbs this by simply not updating on equality.",
    ],
    edges: [
      "Single element → 1; the counters seed at 1 and the loop never runs.",
      "All-equal array → 1: every difference is 0, so no wiggle exceeds one element.",
      "Monotonic runs ([1..9]) → 2: up sticks at 2 because down never grows — alternation is impossible inside a run.",
      "Plateaus inside a wiggle ([3,3,3,2,5] → 3): ties are skipped, then the fall and rise each extend — a zero difference must neither reset nor decrement the counters.",
    ],
    ladder: [
      { title: "Brute force — all subsequences", body: "Enumerate 2^n subsequences, check each for strict alternation of differences. Correct, unusable past n ≈ 20, and it hides the extremum structure entirely." },
      { title: "DP with last-direction state", body: "up[i] / down[i] = longest wiggle ENDING at i with a final rise / fall: up[i] = max(down[j]) + 1 over j < i with nums[j] < nums[i], symmetrically for down. O(n²), honest, and it generalises (e.g. to counting) — but it recomputes what the profile already tells you." },
      { title: "The optimal idea — two running counters", body: "Collapse the DP: a new extremum always extends the best opposite-direction run, so only the global up/down values matter, not which index achieved them. up = down + 1 on a rise, down = up + 1 on a fall, nothing on a tie. O(n) time, O(1) space." },
    ],
    approach: "Up/down counters over peaks and valleys",
    code: `def wiggleMaxLength(nums):
    up = down = 1                  # best wiggle so far, ending on a rise / a fall
    for i in range(1, len(nums)):
        if nums[i] > nums[i - 1]:
            up = down + 1          # a rise extends the best fall-ending run
        elif nums[i] < nums[i - 1]:
            down = up + 1          # a fall extends the best rise-ending run
        # equal neighbours: a 0-difference can neither rise nor fall — skip
    return max(up, down)`,
    walkthrough: [
      "Invariant: after scanning the first i elements, up is the length of the longest wiggle subsequence of that prefix ending on a rise, down the same ending on a fall (both ≥ 1, since a single element is trivially a wiggle). A rise can only improve up, and it improves it to down + 1 — the rise appended to the best fall-ending wiggle.",
      "Trace [1,17,5,10,13,15,10,5,16,8]: the rise to 17 and fall to 5 set up=2, down=3; the climb 5→10→13→15 keeps rewriting up=4 (a longer rise never helps — a wiggle only cares THAT it rises); the fall to 10 then 5 holds down at 5; the rise to 16 pushes up=6 and the final fall to 8 closes down=7. Answer 7 — the plateau contributed exactly one move.",
      "Why rewriting up = down + 1 on a LATER rise is safe even though up was already 4: 4 represents 'some rise-ending wiggle of length 4 exists in the prefix', not a specific one — when the next fall comes, down = up + 1 chains onto that existence claim. The counters are lengths, not positions, and lengths compose.",
    ],
    time: "O(n) — one pass, one comparison per element",
    space: "O(1) — two integers",
    followUps: [
      "Return the subsequence itself: remember, per counter, the index of the extremum that last extended it; the chain of extrema reconstructs an optimal wiggle.",
      "Count the number of longest wiggle subsequences: the O(n²) DP extends naturally with per-state counts, while the O(1) counters deliberately forget which positions achieved each length.",
    ],
    related: ["longest-increasing-subsequence", "longest-continuous-increasing-subsequence"],
    verify: {
      fn: "wiggleMaxLength",
      wrap: "plain",
      cases: [
        { args: [[1, 7, 4, 9, 2, 5]], expect: 6 },
        { args: [[1, 17, 5, 10, 13, 15, 10, 5, 16, 8]], expect: 7 },
        { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], expect: 2 },
        { args: [[5]], expect: 1 },
        { args: [[1, 1, 1, 1]], expect: 1 },
        { args: [[3, 3, 3, 2, 5]], expect: 3 },
      ],
    },
    xp: 20,
  },
];
