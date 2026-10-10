// Deep-dives — Backtracking (NeetCode 150 section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const BACKTRACKING: LcDeepDive[] = [
  {
    slug: "subsets",
    statement:
      "Given an array of distinct integers, return its power set: every subset that can be formed from the elements, including the empty subset. The subsets themselves are unordered collections and may be listed in any order — a valid answer lists each distinct subset exactly once.",
    examples: [
      { input: "nums = [1,2,3]", output: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]", explanation: "Eight subsets — 2³ — including the empty set. Any listing order is accepted; the harness grades this as a sorted set of sorted groups." },
      { input: "nums = [0]", output: "[[],[0]]", explanation: "The single element, and the empty set." },
      { input: "nums = [1,2]", output: "[[],[1],[1,2],[2]]" },
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "all integers in nums are unique"],
    breakdown: [
      "Backtracking is easiest to see on this problem because every node of the decision tree is an answer. The standard shape uses a start index: dfs(start) means 'enumerate every subset that extends the current path using only nums[start:]'. At each node the choice points are the remaining candidates — pick any one, commit it to the path, recurse, then undo. That choose/explore/unchoose rhythm is the entire algorithm.",
      "The start-index rule is the dedupe mechanism, and it is worth understanding rather than memorising. Because each recursive call may only consider candidates AFTER the one just chosen, indices along any root-to-node path are strictly increasing — so {1,2} is generated once and {2,1} can never arise. There is nothing else to prune: every branch leads to a distinct subset, so all 2^n nodes are productive.",
      "The naive missteps are all memory-shaped. Materialising each subset as a fresh list per branch (or cloning a set per bitmask) works but multiplies allocations; the backtracking version shares ONE path buffer across the whole tree and appends a copy only when recording. Bitmask enumeration over 0..2^n−1 is a legitimate alternative at n ≤ 10, but it doesn't teach the tree shape that generalises to combinations and permutations.",
    ],
    edges: [
      "Record a COPY (path[:]), never the live list — the buffer mutates on the way back up, so storing it directly leaves you holding many aliases of one empty list.",
      "The empty subset is part of the answer; appending path[:] at the top of dfs produces it for free, and forgetting it is the most common wrong answer.",
      "Recurse with dfs(i + 1), not dfs(start + 1) — the next level must start past the element just chosen, or earlier candidates re-enter and duplicates appear.",
      "At n = 10 the answer holds 2^10 subsets — the OUTPUT is the complexity, and no algorithm can list a power set without writing all of it down.",
    ],
    ladder: [
      { title: "Brute force — bitmask enumeration", body: "For every mask in 0..2^n−1, materialise the subset whose bits are set. Correct and O(n·2^n), but it treats subsets as numbers rather than decisions — and the pattern doesn't transfer to problems where the tree gets pruned." },
      { title: "The pattern — choose / explore / unchoose", body: "One shared path buffer; at each node try every candidate from start onward: append, recurse with i + 1, pop. Record a copy of the path at every node you touch — in this family, internal nodes are answers too." },
      { title: "The optimal idea — output-proportional work", body: "The tree has exactly one node per subset, so the algorithm does no wasted work: total time is the size of the answer plus an O(n) copy per node. The same skeleton, with one tweaked line each, solves combinations, permutations and subsets with duplicates." },
    ],
    approach: "Start-index DFS that records every node",
    code: `def subsets(nums):
    out, path = [], []
    def dfs(start):
        out.append(path[:])         # every node on the tree is a valid subset
        for i in range(start, len(nums)):
            path.append(nums[i])    # choose nums[i]
            dfs(i + 1)              # explore with i off the menu
            path.pop()              # unchoose, try the next candidate
    dfs(0)
    return out`,
    walkthrough: [
      "dfs(start) carries one promise: every subset that extends the current path using only nums[start:] will be enumerated before it returns. The record happens first — the path AS IT ARRIVES is itself a subset — then the loop tries each candidate in turn. Choose appends the candidate, explore recurses with the menu starting past it, unchoose pops so the next sibling branch starts from the same path.",
      "Trace [1,2,3]: dfs(0) records [], chooses 1 → dfs(1) records [1], chooses 2 → dfs(2) records [1,2], chooses 3 → dfs(3) records [1,2,3] with an empty loop. Unchoosing 3 lets dfs(2) try 3 and record [1,3]; unchoosing 2 returns control to the root, which grows the [2] subtree — [2], [2,3] — and finally records [3]. Eight records, exactly the power set, in pre-order.",
      "Counting the work: the tree has 2^n nodes because each subset is reached exactly once, and each record pays O(n) to copy the path — O(n·2^n) time total. Space excluding the output is the path plus the recursion stack, both O(n). That output-sensitivity is the honest lower bound: any correct answer must be that big.",
    ],
    time: "O(n·2^n) — one tree node per subset, O(n) copy each",
    space: "O(n) — the shared path and recursion depth (output excluded)",
    followUps: [
      "Subsets II adds duplicate values: sort first and skip a candidate equal to its predecessor at the same depth — one guard line converts this solution.",
      "Combinations asks for subsets of size exactly k: record only when len(path) == k, and prune when the remaining candidates can no longer fill the path.",
    ],
    related: ["subsets-ii", "combination-sum", "permutations"],
    verify: {
      fn: "subsets",
      wrap: "plain",
      normalize: "sortGroups",
      cases: [
        { args: [[1, 2, 3]], expect: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
        { args: [[0]], expect: [[], [0]] },
        { args: [[1, 2]], expect: [[], [1], [1, 2], [2]] },
        { args: [[4, 1, 3]], expect: [[], [1], [1, 3], [1, 3, 4], [1, 4], [3], [3, 4], [4]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "combination-sum",
    statement:
      "Given an array of distinct positive integers and a target, return every combination of candidates that sums to the target. The same candidate may be chosen any number of times, and two combinations are considered the same when they use each value equally often — [2,2,3] and [3,2,2] are one combination, not two.",
    examples: [
      { input: "candidates = [2,3,6,7], target = 7", output: "[[2,2,3],[7]]", explanation: "2+2+3 and 7 both hit the target; reusing 2 is allowed, but [3,2,2] would be a duplicate listing." },
      { input: "candidates = [2,3,5], target = 8", output: "[[2,2,2,2],[2,3,3],[3,5]]" },
      { input: "candidates = [2], target = 5", output: "[]", explanation: "Only even sums are reachable, so the answer is legitimately empty." },
    ],
    constraints: ["1 <= candidates.length <= 30", "2 <= candidates[i] <= 40", "all candidates are distinct", "1 <= target <= 40"],
    breakdown: [
      "Frame the search as spending a budget. dfs(start, remaining) asks: using candidates from index start onward, how can the remaining target be spent exactly? Each choice point is 'which candidate do I spend next?', and spending one shrinks the budget. The leaf is remaining == 0 — budget spent to the coin — and that is the only place a combination is recorded.",
      "Reuse changes exactly one token of the subsets skeleton: after choosing candidates[i] the recursive call is dfs(i, …), not dfs(i+1), because i stays on the menu. The start index still only moves forward, which is why [2,2,3] is generated once and its permutations never: every combination emerges in non-decreasing value order. Different multisets have different sorted forms, so uniqueness falls out of the tree shape for free.",
      "Pruning is where this problem gets interesting, and sorting is what makes the prune legal. Sort the candidates once; inside the loop, the first candidate larger than the remaining budget ends the loop with break — everything after it is larger still, so no tail candidate can ever fit. The prune is correct because the budget only decreases along a branch: a candidate that overspends now overspends forever, and entire subtrees die at a single comparison.",
    ],
    edges: [
      "Impossible targets are normal output, not errors — return [] when nothing reaches the target (odd target with all-even candidates, or a target below the smallest candidate).",
      "Recurse with dfs(i, …) for reuse but never dfs(0, …) — restarting the menu at 0 would emit every permutation of every combination.",
      "The break prune requires sorted candidates; on unsorted input it must weaken to continue, skipping only the current oversized candidate.",
      "Termination is safe despite unlimited reuse: the budget strictly decreases by at least min(candidates) each level, so depth is bounded by target / min(candidates).",
    ],
    ladder: [
      { title: "Brute force — enumerate multisets, check sums", body: "Generate every multiset of candidates and keep those summing to the target. The count is combinatorial in target/min and nothing is rejected early — blind exponential search with no budget to steer it." },
      { title: "The pattern — budgeted DFS", body: "The choose/explore/unchoose skeleton from subsets, carrying remaining as extra state: record at remaining == 0, recurse with i (reuse) and remaining − c. Already correct, and already exponential only in the reachable combinations." },
      { title: "The optimal idea — sorted candidates + break", body: "Sort once, then break the loop the moment a candidate exceeds the budget. Each branch dies the instant the arithmetic says it cannot succeed; with target ≤ 40 the explored tree is tiny no matter how many candidates there are." },
    ],
    approach: "Budgeted DFS with a sorted-candidate break",
    code: `def combinationSum(candidates, target):
    candidates = sorted(candidates)         # enables the break prune
    out, path = [], []

    def dfs(start, remaining):
        if remaining == 0:                  # budget spent exactly -> one combo
            out.append(path[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:               # sorted tail is bigger still -> dead
                break
            path.append(c)                  # choose
            dfs(i, remaining - c)           # explore; i stays (reuse allowed)
            path.pop()                      # unchoose

    dfs(0, target)
    return out`,
    walkthrough: [
      "State is a pair: start keeps the menu ordered (no permutation duplicates), remaining carries the unspent budget. The leaf test fires before the loop — remaining == 0 records a copy of the path and returns, because every candidate is ≥ 2 and any further spend would overshoot. Choose, explore and unchoose mirror the subsets skeleton exactly; only the index passed down differs.",
      "Trace candidates [2,3,6,7], target 7: choose 2, choose 2, choose 2 → budget 1, where dfs(0,1) breaks immediately on 2 > 1. The first escape is spending 3 instead of the third 2, reaching remaining 0 and recording [2,2,3]. Every other branch under [2,2] and [2] dies on an oversized candidate; back at the root, 3 and 6 lead nowhere (budgets 4 and 1 both break out), until 7 lands exactly on remaining 0 and records [7]. Two combinations, each reached once.",
      "The sort costs O(n log n) once; everything after is output-shaped. Each recorded combination costs O(ℓ) to copy, and every explored node either records or prunes, so total work is proportional to the answer plus a thin pruned frontier. Space is the path plus recursion depth — bounded by target / min(candidates), at most 20 levels at these constraints.",
    ],
    time: "Output-sensitive — proportional to the combinations emitted (each copied once); a dead branch costs one comparison",
    space: "O(target / min(candidates)) — path and recursion depth (output excluded)",
    followUps: [
      "Combination Sum II bans reuse and permits duplicate input values — recurse with i+1 and add the skip-equal-siblings guard from Subsets II.",
      "Need only the count of ways? Coin Change II is a DP over (index, remaining) that counts without enumerating — listing and counting have different best tools.",
    ],
    related: ["combination-sum-ii", "subsets", "combination-sum-iv"],
    verify: {
      fn: "combinationSum",
      wrap: "plain",
      normalize: "sortGroups",
      cases: [
        { args: [[2, 3, 6, 7], 7], expect: [[2, 2, 3], [7]] },
        { args: [[2, 3, 5], 8], expect: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
        { args: [[2], 5], expect: [] },
        { args: [[3], 3], expect: [[3]] },
        { args: [[5, 10], 15], expect: [[5, 5, 5], [5, 10]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "permutations",
    statement:
      "Given an array of distinct integers, return every ordering of its elements — all n! permutations. The permutations may be returned in any order.",
    examples: [
      { input: "nums = [1,2,3]", output: "[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]", explanation: "Six permutations — 3!. LeetCode accepts the permutations in any order; the harness grades this deterministic DFS order (candidates tried left-to-right in input position)." },
      { input: "nums = [0,1]", output: "[[0,1],[1,0]]" },
      { input: "nums = [1]", output: "[[1]]" },
    ],
    constraints: ["1 <= nums.length <= 6", "-10 <= nums[i] <= 10", "all integers in nums are unique"],
    breakdown: [
      "The choice point here is unlike subsets: at every level, EVERY unused element is on the menu, not just those after a moving start index. That is exactly why there are n! permutations but 2^n subsets — the tree is wider, branching n × (n−1) × … × 1. A permutation's internal order carries meaning, so the algorithm must be free to return to earlier positions; what it may never do is reuse an element.",
      "The menu therefore needs a membership test, and the clean one is a used[] boolean array keyed by position: O(1) to test and toggle. Alternatives exist — scanning the path for the value, or the swap-to-back trick that permutes in place — but the swap version mutates the input and emits input-order-dependent results, while a path scan costs O(n) per check. used[] keeps choose/unchoose perfectly symmetric: mark on the way down, unmark on the way up.",
      "Determinism is worth naming out loud. Trying candidates in input order at every depth makes the output a pure function of the input — the first permutation is the input itself, the second differs at the last position, and so on. The problem accepts any order, but a grading harness compares bytes, so the canonical input-order DFS is what the verify cases below pin down.",
    ],
    edges: [
      "Forgetting used[i] = False after the recursive call silently kills all but the first subtree — the choose/unchoose pair must be perfectly symmetric.",
      "Deterministic means input-order, not sorted: for nums = [2,1] the first permutation emitted is [2,1] itself, because position 0 is tried before position 1.",
      "The problem guarantees distinct values; duplicates would need the sort-and-skip rule (Permutations II) or repeat permutations pour out.",
      "Output size is n! × n — at n = 6 that is 4,320 numbers, and n ≥ 13 would be un-listable. The tiny n constraint is what makes enumeration reasonable at all.",
    ],
    ladder: [
      { title: "Brute force — library permutations", body: "itertools.permutations(nums) lists all n! orderings correctly. Fine as an oracle, but it demonstrates nothing about state management, and an interviewer will ask you to build the tree by hand." },
      { title: "The pattern — DFS over a used[] menu", body: "At each depth try every index not yet used: append nums[i], mark used[i], recurse, unmark, pop. This is the universal backtracking skeleton where the candidate menu is defined by membership rather than position." },
      { title: "The optimal idea — the leaf is the answer", body: "Record path[:] only when len(path) == n; every other node is pure scaffolding. There is no pruning to invent — every branch leads to a distinct permutation — so n·n! work is the honest floor for listing them all." },
    ],
    approach: "DFS over a used[] menu, recording at the leaves",
    code: `def permute(nums):
    out, path = [], []
    used = [False] * len(nums)      # which positions are already in path

    def dfs():
        if len(path) == len(nums):  # leaf: every element placed
            out.append(path[:])
            return
        for i in range(len(nums)):  # input order -> deterministic output
            if used[i]:
                continue
            used[i] = True          # choose
            path.append(nums[i])
            dfs()                   # explore
            path.pop()              # unchoose
            used[i] = False

    dfs()
    return out`,
    walkthrough: [
      "dfs() takes no arguments because its state lives entirely in path and used[] — one level of recursion means 'fill the next slot'. The menu is scanned in index order, so ties in the value space are broken by position. The leaf test is exact placement: when the path holds n elements it is copied into the output and the branch stops extending.",
      "Trace [1,2,3]: the root menu offers 1, 2, 3. Under 1: pick 2 then 3 → [1,2,3]; unchoose 3, pick 3 then 2 → [1,3,2]. Unchoose back to the root: under 2 → [2,1,3] then [2,3,1]; under 3 → [3,1,2] then [3,2,1]. Six leaves, emitted in exactly that order — which is byte-identical to the expected output in verify below, not by luck but by construction.",
      "Counting the work: n! leaves, each paying O(n) for the copy; the internal node count is n!·Σ1/k! ≈ e·n!, each burning an O(n) menu scan — O(n·n!) time overall. Space excluding the output is path, used[] and recursion depth, all O(n). No algorithm can list n! permutations faster than writing them down, so this is output-optimal.",
    ],
    time: "O(n·n!) — ~e·n! tree nodes with an O(n) menu scan, plus an O(n) copy per leaf",
    space: "O(n) — path, used[] and recursion depth (output excluded)",
    followUps: [
      "Permutations II (duplicate values): sort, then skip nums[i] == nums[i−1] when the twin is unused at this depth — otherwise identical permutations repeat.",
      "Next permutation asks for only the lexicographically NEXT ordering — a pointer-surgery problem showing the ordering space can be navigated without enumerating it.",
    ],
    related: ["permutations-ii", "next-permutation", "subsets"],
    verify: {
      fn: "permute",
      wrap: "plain",
      normalize: "none",
      cases: [
        { args: [[1, 2, 3]], expect: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
        { args: [[0, 1]], expect: [[0, 1], [1, 0]] },
        { args: [[1]], expect: [[1]] },
        { args: [[2, 1]], expect: [[2, 1], [1, 2]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "subsets-ii",
    statement:
      "Given an integer array that may contain duplicates, return every UNIQUE subset of its elements — the power set with duplicate subsets removed. The list of subsets and the elements within each subset may be returned in any order, but no subset may appear twice.",
    examples: [
      { input: "nums = [1,2,2]", output: "[[],[1],[1,2],[1,2,2],[2],[2,2]]", explanation: "The two 2s are interchangeable, so [2] and [2,2] appear once each — the raw eight subsets would include three spurious repeats." },
      { input: "nums = [0]", output: "[[],[0]]" },
      { input: "nums = [2,2,2]", output: "[[],[2],[2,2],[2,2,2]]", explanation: "All-duplicates input still yields every multiplicity exactly once." },
    ],
    constraints: ["1 <= nums.length <= 10", "-10 <= nums[i] <= 10", "nums may contain duplicates"],
    breakdown: [
      "Running plain subsets on [1,2,2] produces duplicate answers because equal values open duplicate branches: at the same depth, choosing the first 2 and choosing the second 2 grow identical subtrees. The fix has two halves that only work together — SORT the array so equal values become adjacent, then refuse to branch on an element that equals its predecessor in the same loop.",
      "The skip rule, stated precisely: inside dfs(start), skip candidate i when i > start AND nums[i] == nums[i−1]. The i > start guard is what makes it a sibling test rather than a blanket ban — among a run of equal values, only the first slot at a given depth may START a branch; deeper levels may still stack the duplicates ([1,2,2] must survive). The effect is that among equal siblings, exactly one representative explores the subtree, which is precisely the condition for each distinct subset to be generated once.",
      "This is pruning, not post-filtering, and the difference is measurable. Deduplicating afterwards with a set of tuples still walks the full 2^n tree and pays hashing plus sorting per subset on the way out; the skip rule kills duplicate SUBTREES before they are ever entered. The explored tree shrinks to exactly the distinct subsets — the optimal anything can do when the task is to list them.",
    ],
    edges: [
      "Sort first — the skip rule works only on adjacent equals; on unsorted input duplicates slip straight through.",
      "The guard is i > start, not i > 0: a per-depth test. i > 0 would ban the second 2 everywhere and destroy legitimate deep duplicates like [1,2,2].",
      "Recording happens at the top of dfs BEFORE any skip logic — the skip gates branching only, never the record step.",
      "All-duplicates input [2,2,2] must return n+1 = 4 subsets (each multiplicity once) — a correct run yields 4, not 8.",
    ],
    ladder: [
      { title: "Brute force — enumerate, then dedupe", body: "Run the plain subsets DFS and pour every subset into a set of tuples. Correct, but it explores all 2^n branches — including duplicate subtrees — and pays a hashing-and-sorting tax per subset to clean up afterwards." },
      { title: "The pattern — sort + skip equal siblings", body: "Sort once; in the candidate loop, one comparison (i > start and nums[i] == nums[i−1] → continue) eliminates duplicate subtrees before they are explored. Everything else is the subsets skeleton untouched." },
      { title: "The optimal idea — tree-shape dedupe", body: "Equal siblings collapse to one representative; the explored tree now has exactly one node per DISTINCT subset. That is output-proportional work — the floor for a listing problem — and the guard costs a single comparison per candidate." },
    ],
    approach: "Sorted DFS that skips equal siblings",
    code: `def subsetsWithDup(nums):
    nums = sorted(nums)             # equal values become adjacent
    out, path = [], []

    def dfs(start):
        out.append(path[:])         # record this node (before any skip)
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue            # equal sibling -> duplicate subtree
            path.append(nums[i])    # choose
            dfs(i + 1)              # explore
            path.pop()              # unchoose

    dfs(0)
    return out`,
    walkthrough: [
      "The skeleton is the subsets DFS unchanged, plus one guard line — which is the pedagogical point: duplicate handling in this whole family is a one-liner once the tree shape is right. The loop scans a sorted menu; when candidate i equals its left neighbour AND i is not the first slot of this loop (i > start), the candidate would grow a subtree identical to the one its twin just grew, so it is skipped.",
      "Trace [1,2,2] (sorted): dfs(0) records [], chooses 1 → dfs(1) records [1], chooses the first 2 → dfs(2) records [1,2], chooses the second 2 (i == start is allowed there) → dfs(3) records [1,2,2]. Back in dfs(1), the second 2 is now skipped — i=2 > start=1 and equal to its predecessor. Back at the root, the first 2 opens the [2] subtree recording [2] and [2,2]; the root's second 2 is skipped. Six subsets, no repeats.",
      "Counting the work: sorting is O(n log n), trivial next to enumeration. The tree now contains one node per distinct subset — between 2^n (all distinct) and n+1 (all equal) — and each record copies O(n). The skip pruned entire subtrees rather than filtering results, which is why the explored-node count and the output size coincide.",
    ],
    time: "O(n·2^n) worst case (all distinct) — output-sensitive: proportional to the distinct subsets emitted",
    space: "O(n) — sorted copy, path and recursion depth (output excluded)",
    followUps: [
      "The same guard converts Combination Sum into Combination Sum II — equal siblings there produce duplicate combinations.",
      "Why sort instead of a per-depth hash set? A seen-set per level also works, but allocates; the sorted-adjacency check is O(1), allocation-free and cache-friendly.",
    ],
    related: ["subsets", "combination-sum-ii", "permutations-ii"],
    verify: {
      fn: "subsetsWithDup",
      wrap: "plain",
      normalize: "sortGroups",
      cases: [
        { args: [[1, 2, 2]], expect: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
        { args: [[0]], expect: [[], [0]] },
        { args: [[2, 2, 2]], expect: [[], [2], [2, 2], [2, 2, 2]] },
        { args: [[1, 1, 2, 2]], expect: [[], [1], [1, 1], [1, 1, 2], [1, 1, 2, 2], [1, 2], [1, 2, 2], [2], [2, 2]] },
        { args: [[1, 2, 3]], expect: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "combination-sum-ii",
    statement:
      "Given a collection of candidates that may contain duplicates and a target number, return every UNIQUE combination of candidates that sums to the target. Each candidate may be used at most once per combination, and no combination may appear twice in the answer.",
    examples: [
      { input: "candidates = [10,1,2,7,6,1,5], target = 8", output: "[[1,1,6],[1,2,5],[1,7],[2,6]]", explanation: "Two different 1s exist in the input, yet [1,7] appears once — the sibling-skip collapses branches that would differ only in which copy was used." },
      { input: "candidates = [2,5,2,1,2], target = 5", output: "[[1,2,2],[5]]" },
      { input: "candidates = [3,5], target = 2", output: "[]", explanation: "Nothing that small is reachable — an empty answer is a normal result, not an error." },
    ],
    constraints: ["1 <= candidates.length <= 100", "1 <= candidates[i] <= 50", "1 <= target <= 30"],
    breakdown: [
      "This problem is the marriage of Combination Sum's budget with Subsets II's dedupe, and it needs BOTH marriages' rules. No reuse means the recursion advances past the chosen index: dfs(i+1, remaining − c). Uniqueness despite duplicate input values means sort + skip equal siblings: at one depth, among a run of equal candidates, only the first may open a branch — the others would grow subtrees that differ only in which copy of the value was consumed, and those copies are interchangeable.",
      "Note what 'each number used at most once' does NOT mean: [1,1,6] is a valid combination because the two 1s are different positions in the input. The per-index rule is dfs(i+1); the per-value dedupe is the sibling skip. Conflating the two — banning an value outright — would wrongly delete [1,1,6]; conflating them the other way — recursing with i — re-opens unlimited reuse and degenerates into Combination Sum.",
      "The break prune from Combination Sum carries over and does heavy lifting at n = 100: sort, and the first candidate exceeding the remaining budget ends the loop because the sorted tail is larger still. Combined with the sibling skip, the explored tree contains exactly the distinct prefixes — every node visited either records, or is the first representative of its value at that depth, or the search dies at the budget wall.",
    ],
    edges: [
      "'Use at most once' is per INDEX, not per value — [1,1,6] is legal because the two 1s are different input positions.",
      "Recurse with dfs(i + 1) — passing i re-opens unlimited reuse and silently turns this into Combination Sum.",
      "The sibling skip needs sorted input: i > start and candidates[i] == candidates[i−1] detects adjacency only; unsorted, duplicates survive as separate subtrees.",
      "Impossible targets return [] — a target below the smallest candidate dies at the very first break, which is correct behaviour, not a crash.",
    ],
    ladder: [
      { title: "Brute force — all subsets, filter sums", body: "Enumerate all 2^n index subsets, keep those summing to the target, dedupe by sorted tuple. At n = 100 that is 2^100 branches — dead before the dedupe even starts; there is no version of this that survives without budget pruning." },
      { title: "The pattern — budgeted DFS, index-once, sibling-skip", body: "Sort; dfs(start, remaining) records at remaining == 0, recurses with i+1, skips equal siblings, breaks at the first overspend. Three guard lines, each with exactly one job." },
      { title: "The optimal idea — prune early, dedupe structurally", body: "The break kills the sorted tail at the first overspend; the sibling skip kills duplicate subtrees before they exist. Together they restrict exploration to the tree of distinct prefixes — the minimum a listing problem can visit." },
    ],
    approach: "Budgeted DFS: index-once + skip equal siblings",
    code: `def combinationSum2(candidates, target):
    candidates = sorted(candidates)     # adjacency enables both prunes
    out, path = [], []

    def dfs(start, remaining):
        if remaining == 0:
            out.append(path[:])         # budget spent exactly -> one combo
            return
        for i in range(start, len(candidates)):
            if i > start and candidates[i] == candidates[i - 1]:
                continue                # equal sibling -> duplicate subtree
            c = candidates[i]
            if c > remaining:
                break                   # sorted tail is bigger -> all dead
            path.append(c)              # choose (index i consumed)
            dfs(i + 1, remaining - c)   # explore; i+1 -> each index once
            path.pop()                  # unchoose

    dfs(0, target)
    return out`,
    walkthrough: [
      "Three guard lines, three jobs: the sibling skip (uniqueness), the break (budget), and the i+1 recursion (no reuse). Order matters in the loop — the skip runs before the break so that duplicate detection is not fooled by an oversized twin, and the leaf test runs before the loop so a completed combination is recorded the moment its last coin is spent.",
      "Trace [10,1,2,7,6,1,5], target 8 → sorted [1,1,2,5,6,7,10]. Under the FIRST 1: adding the second 1 (i == start there, allowed) then 6 records [1,1,6]; adding 2 then 5 records [1,2,5]; adding 7 directly records [1,7]. Back at the top level, the second 1 is skipped — i > start and equal to its predecessor — so none of those three combinations can regenerate. The [2,…] subtree yields [2,6]; 5, 6, 7 and 10 all die at the budget wall. Four combinations, exactly the expected set.",
      "The sort is O(n log n); everything after is output-shaped. Each recorded combination is copied once, and every visited node is either a record, a first-representative branch, or a single-comparison death — so total work tracks the answer plus a thin frontier. Space is the sorted copy, the path and recursion depth, O(n) with output excluded.",
    ],
    time: "Output-sensitive — work tracks the combinations emitted; dead prefixes cost one comparison each (plus the O(n log n) sort)",
    space: "O(n) — sorted copy, path and recursion depth (output excluded)",
    followUps: [
      "Combination Sum allows unlimited reuse — relax i+1 back to i and drop the sibling skip; the break prune survives unchanged.",
      "Counting only, where order matters? Combination Sum IV is a DP over remaining — listing and counting genuinely want different tools.",
    ],
    related: ["combination-sum", "subsets-ii", "combination-sum-iv"],
    verify: {
      fn: "combinationSum2",
      wrap: "plain",
      normalize: "sortGroups",
      cases: [
        { args: [[10, 1, 2, 7, 6, 1, 5], 8], expect: [[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]] },
        { args: [[2, 5, 2, 1, 2], 5], expect: [[1, 2, 2], [5]] },
        { args: [[3, 5], 2], expect: [] },
        { args: [[1, 1, 1], 2], expect: [[1, 1]] },
        { args: [[1], 1], expect: [[1]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "word-search",
    statement:
      "Given a grid of single characters and a word, decide whether the word can be traced through ADJACENT cells — up, down, left or right — without ever using the same cell twice in one trace. The path may start at any cell and may turn at every step.",
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: "true", explanation: "A(0,0) → B(0,1) → C(0,2) → C(1,2) → E(2,2) → D(2,1) — each step moves to a side-adjacent cell." },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "SEE"', output: "true", explanation: "S(1,3) → E(2,3) → E(2,2)." },
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCB"', output: "false", explanation: "After A → B → C, the only adjacent B is the starting cell — and cells cannot be revisited." },
    ],
    constraints: ["1 <= board.length, board[i].length <= 6", "1 <= word.length <= 15", "board and word consist of upper and lower case English letters"],
    breakdown: [
      "This is a hidden-path search wearing a grid costume. There are two nested choice points: the OUTER one picks where to anchor the first letter (any of the m·n cells), and the INNER one picks, at each step, which of the ≤4 neighbours continues the word. The DFS state is (row, col, k) — position on the board, position in the word — and the leaf is k == len(word), reached only by placing every letter.",
      "The inner pruning is the letter check: a neighbour is worth entering only if board[r][c] == word[k]. A mismatched cell can never participate in ANY completion of this path — the next letter is fixed by the word — so the branch dies at one comparison. That is why word search feels fast despite exponential worst case: most branches die on their first wrong letter, one step in.",
      "The used-cell rule has a famous implementation trick: instead of a parallel visited matrix, WRITE into the board — set the current cell to '#', recurse, then restore the original letter. The marker is self-enforcing because '#' never equals any letter in the word, so the mismatch check rejects revisits for free; restoring on the way out leaves the grid pristine for sibling branches and future anchors. One array, zero extra memory, and the choose/explore/unchoose symmetry is a single assignment pair.",
    ],
    edges: [
      "Restore on EVERY exit path — a version that returns true deep in the or-chain without restoring leaves '#' scars that corrupt every later anchor and case.",
      "Same letter twice via different cells is fine ('ABCCED' uses two Cs); the same CELL twice is not — the distinction lives in the mark, not the letter.",
      "Single-cell board, single-letter word ([['A']], 'A') → true: the anchor call itself performs the final match, and the k == len(word) leaf is reached from the neighbour calls.",
      "The anchor loop must try every cell — a correct trace can start anywhere, so the outer choice point is exhaustive even though most anchors die on letter one.",
    ],
    ladder: [
      { title: "Brute force — enumerate simple paths", body: "From every cell, enumerate all simple paths of length len(word) and compare each to the word. Correct, but it explores paths that died on their second letter and pays full bookkeeping for the privilege." },
      { title: "The pattern — letter-checked DFS with mark/restore", body: "Anchor every cell; at (r, c, k) fail fast on bounds or letter mismatch, mark the cell, recurse into the ≤4 neighbours for k+1, restore. Each branch consumes one letter of the word — the recursion depth is the word length." },
      { title: "The optimal idea — the mark IS the visited set", body: "Overwriting the cell with '#' makes the grid do double duty: no visited matrix, and the mismatch check enforces both 'wrong letter' and 'already used' in one comparison. Branching drops from 4 to ≤3 after the first step because the marked parent can't be re-entered." },
    ],
    approach: "Anchor-and-extend DFS with in-grid marking",
    code: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, k):
        if k == len(word):
            return True                 # every letter placed
        if r < 0 or r >= rows or c < 0 or c >= cols:
            return False                # fell off the grid
        if board[r][c] != word[k]:
            return False                # letter mismatch ('#' never matches)
        board[r][c] = "#"               # mark: claim this cell
        found = (dfs(r + 1, c, k + 1) or dfs(r - 1, c, k + 1) or
                 dfs(r, c + 1, k + 1) or dfs(r, c - 1, k + 1))
        board[r][c] = word[k]           # restore - unchoose, always
        return found

    for r in range(rows):
        for c in range(cols):
            if dfs(r, c, 0):            # every cell is a candidate anchor
                return True
    return False`,
    walkthrough: [
      "Choose is the match-plus-mark: the cell must equal word[k], then it is overwritten with '#' so no later step of THIS trace can touch it. Explore is the four neighbour calls at k+1, short-circuited by or so the first success wins. Unchoose is the restore, placed AFTER the or-chain and before returning — so it runs whether the branch found the word, failed, or fell off the grid. That placement is the difference between a correct solver and one that poisons the board mid-search.",
      "Trace word 'ABCCED' from anchor A(0,0): the letter checks admit B(0,1), then C(0,2); the down-neighbour C(1,2) is tried before right, so the second C lands below; from there the only unmarked E is (2,2); its unmarked D neighbour is (2,1) — six matches, k reaches 6 == len(word), and true propagates up through the or-chain. For 'ABCB', the same path reaches the second C, but the needed B exists only at the start cell — which now holds '#' — so every branch fails and the anchor loop eventually reports false.",
      "Counting the work: m·n anchors, each spawning at most 4·3^(L−1) paths for a word of length L (the first step has ≤4 neighbours; every step after has ≤3 because the parent is marked). Worst case O(m·n·3^L), and the letter-check pruning makes the constant academic in practice. Space is the recursion depth, O(L) — the grid is marked and restored in place, never copied.",
    ],
    time: "O(m·n·3^L) worst case — m·n anchors, ≤3 live branches per step after the first",
    space: "O(L) — recursion depth; the grid is marked and restored in place",
    followUps: [
      "Word Search II: many words at once — build a Trie of the dictionary and walk the grid once, pruning Trie branches as cells are consumed; per-word DFS redoes the same cells.",
      "Cheap pre-rejection: count letters on the board and fail immediately if the word needs a letter the board lacks (or more copies than exist).",
    ],
    related: ["word-search-ii", "flood-fill", "longest-increasing-path-in-a-matrix"],
    verify: {
      fn: "exist",
      wrap: "plain",
      cases: [
        { args: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCCED"], expect: true },
        { args: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "SEE"], expect: true },
        { args: [[["A", "B", "C", "E"], ["S", "F", "C", "S"], ["A", "D", "E", "E"]], "ABCB"], expect: false },
        { args: [[["a", "a"]], "aaa"], expect: false },
        { args: [[["A"]], "A"], expect: true },
        { args: [[["A", "B"]], "BA"], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "palindrome-partitioning",
    statement:
      "Given a string, split it into parts so that every part is a palindrome, and return every possible way to do it. Each partition is an ordered list of the parts, left to right; the list of partitions may be returned in any order.",
    examples: [
      { input: 's = "aab"', output: '[["a","a","b"],["aa","b"]]', explanation: "Both splits tile the string with palindromic pieces. LeetCode accepts the partitions in any order; the harness grades this deterministic DFS order (prefixes tried left-to-right, shortest first)." },
      { input: 's = "a"', output: '[["a"]]' },
      { input: 's = "abba"', output: '[["a","b","b","a"],["a","bb","a"],["abba"]]', explanation: "The whole string being a palindrome is itself one of the partitions." },
    ],
    constraints: ["1 <= s.length <= 16", "s contains only lowercase English letters"],
    breakdown: [
      "The choice points are 'how long is the next piece?'. The DFS carries a cursor i — everything before it is already tiled by palindromes — and at each node it tries every palindromic PREFIX s[i:j], advancing the cursor to j. The leaf is i == len(s): the string consumed exactly. Because the pieces are taken left-to-right and each partition is the ordered list of pieces taken, the tree enumerates tilings without repetition by construction.",
      "The palindrome test is the pruning, and it is total: a non-palindromic prefix can never appear in any valid partition from this cursor, because the piece itself must be a palindrome — no arrangement of later pieces can repair it. Cutting at one comparison removes the entire subtree. Note the tree is never empty: single characters are palindromes, so the all-single-letters partition always exists and the search always reaches at least one leaf.",
      "The output is genuinely exponential and that bound is real: for an all-equal string like 'aaaa', every prefix is a palindrome, so every way of placing cuts is legal — 2^(n−1) partitions for n−1 gaps. That is why n ≤ 16, and it reframes the problem: the algorithm's job is not to avoid the exponential (impossible) but to touch each partition exactly once, which the prefix-driven DFS does.",
    ],
    edges: [
      "The whole string as one piece is a branch like any other — the loop must run j up to len(s) inclusive, or ['abba']-style single-piece partitions vanish.",
      "The leaf test is cursor == len(s), not 'path non-empty'; an empty path at the root is only reachable for the out-of-contract empty string.",
      "Single character input has exactly one partition — the character itself; the tree is a straight line.",
      "All-equal input maximises the output (2^(n−1) partitions at n = 16 → 32,768) — the constraint exists precisely to cap this.",
    ],
    ladder: [
      { title: "Brute force — all cut patterns, then filter", body: "Place cuts in all 2^(n−1) patterns, keep partitions whose every piece is a palindrome. Correct but blind: it materialises tilings ('ab', 'b') that a single palindrome test would have refused at the root." },
      { title: "The pattern — prefix-driven DFS", body: "At cursor i, try every palindromic s[i:j], recurse from j, record at i == len(s). Only palindromic continuations are ever explored — pruning happens at branch time, not filter time." },
      { title: "The optimal idea — precomputed palindrome table", body: "An n×n isPal table (or expand-around-centre pass) built in O(n²) up front turns each branch decision into O(1). The enumeration itself is already output-optimal; the table just removes the O(n) re-check per candidate prefix." },
    ],
    approach: "Prefix-driven DFS over palindromic prefixes",
    code: `def partition(s):
    out, path = [], []

    def dfs(i):
        if i == len(s):
            out.append(path[:])         # cursor consumed the whole string
            return
        for j in range(i + 1, len(s) + 1):
            piece = s[i:j]
            if piece == piece[::-1]:    # palindromic prefix -> worth a branch
                path.append(piece)      # choose
                dfs(j)                  # explore from the new cursor
                path.pop()              # unchoose

    dfs(0)
    return out`,
    walkthrough: [
      "Choose/explore/unchoose maps cleanly: choosing a piece s[i:j] appends it and moves the cursor to j; exploring recurses on the untiled suffix; unchoosing pops the piece so the next (longer) prefix starts from the same path. The loop bound j ≤ len(s) + 1 is what lets a whole-string piece — cursor jumps straight to the leaf — compete with fine-grained tilings.",
      "Trace 'aab': dfs(0) tries 'a' (palindrome) → dfs(1) tries 'a' → dfs(2) tries 'b' → dfs(3) records ['a','a','b']; back at dfs(1), 'ab' fails the palindrome test and dies. Back at dfs(0), the prefix 'aa' is tried → dfs(2) takes 'b' → records ['aa','b']; 'aab' itself fails. Two partitions, emitted in exactly that order — the output is deterministic because prefixes are tried shortest-first at every cursor.",
      "Counting the work: at most 2^(n−1) partitions (every cut pattern legal when all characters are equal), each copied in O(n) → O(n·2^n) worst case, and each candidate prefix costs O(n) for the palindrome slice-and-compare that prunes non-palindromic branches instantly. Space is the path plus recursion, O(n), with output excluded — the honest shape for a problem whose ANSWER can be exponential.",
    ],
    time: "O(n·2^n) worst case — 2^(n−1) partitions for all-equal input, O(n) copy and check each",
    space: "O(n) — path and recursion depth (output excluded)",
    followUps: [
      "Palindrome Partitioning II asks for the MINIMUM number of cuts — pure DP over palindromic substrings, no enumeration at all.",
      "The standard upgrade: precompute isPal[i][j] once (DP or expand-around-centre) so each branch decision is O(1) instead of an O(n) slice compare.",
    ],
    related: ["palindrome-partitioning-ii", "palindromic-substrings", "restore-ip-addresses"],
    verify: {
      fn: "partition",
      wrap: "plain",
      normalize: "none",
      cases: [
        { args: ["aab"], expect: [["a", "a", "b"], ["aa", "b"]] },
        { args: ["a"], expect: [["a"]] },
        { args: ["aaa"], expect: [["a", "a", "a"], ["a", "aa"], ["aa", "a"], ["aaa"]] },
        { args: ["abba"], expect: [["a", "b", "b", "a"], ["a", "bb", "a"], ["abba"]] },
        { args: ["abbab"], expect: [["a", "b", "b", "a", "b"], ["a", "b", "bab"], ["a", "bb", "a", "b"], ["abba", "b"]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "letter-combinations-of-a-phone-number",
    statement:
      "Given a string of digits, each between '2' and '9', return every possible letter string the digits could encode on a classic phone keypad — one letter per digit, in digit order. The strings may be returned in any order; an empty digit string has no combinations.",
    examples: [
      { input: 'digits = "23"', output: '["ad","ae","af","bd","be","bf","cd","ce","cf"]', explanation: "3 letters × 3 letters = 9 strings. Any order is accepted; the harness sorts the flat list before grading." },
      { input: 'digits = ""', output: "[]" },
      { input: 'digits = "2"', output: '["a","b","c"]' },
    ],
    constraints: ["0 <= digits.length <= 4", "digits[i] is a digit in the range '2' - '9'"],
    breakdown: [
      "Strip away the phone story and this is a Cartesian product with a tree drawn over it: level i branches over the letters of digits[i] (3 or 4 of them), and a leaf at i == len(digits) is one completed string. The path buffer holds one chosen letter per digit so far, so the tree has exactly product-of-menu-sizes leaves and nothing else — every branch is a valid answer, which means there is no pruning to invent here.",
      "The one genuine trap is the empty input. Mathematically the product of zero digits is a single EMPTY string, and a naive DFS returns [\"\"] because the root is simultaneously a leaf (i == 0 == len). The contract says [] — no combinations — so the up-front guard 'if not digits: return []' is required logic, not decoration. It is the same distinction as 0! = 1: correct mathematics, wrong product spec.",
      "Why hand-roll the DFS when itertools.product exists? The library version is the same tree, but the explicit skeleton is what carries into harder per-position problems — restore IP addresses, generate parentheses, Sudoku — where the menu at each level depends on constraints rather than a fixed keypad. The letter menu here is constant, which is exactly what makes this the clean first example of the per-level-menu pattern.",
    ],
    edges: [
      "Empty digits → [] (not ['']) — the guard exists because the bare DFS would happily return one empty string.",
      "Keys 7 and 9 carry FOUR letters (pqrs, wxyz); hardcoding three-letter menus silently drops half of '79''s answers.",
      "Output order is free (graded as a sorted flat list) — but the DFS naturally emits keypad order, which is as good a canonical form as any.",
      "Length ≤ 4 caps the answer at 4^4 = 256 strings — the problem is about the skeleton, never the scale.",
    ],
    ladder: [
      { title: "Brute force — nested loops per digit", body: "One loop level per digit position: for a in pad[d0], for b in pad[d1], …. Works for a known, tiny length — but it hardcodes the shape, and n digits means n nested loops you cannot write generically." },
      { title: "The pattern — iterative product (BFS-style)", body: "Start from [\"\"]; for each digit, replace every partial string p with p + letter for each letter of that digit. Correct and compact, but it materialises every intermediate level instead of finishing one string at a time." },
      { title: "The optimal idea — DFS with a shared path buffer", body: "One buffer, one letter appended and popped per level, one join at each leaf. Same output, constant memory per level, and the choose/explore/unchoose skeleton generalises to any constraint-driven menu." },
    ],
    approach: "Per-digit DFS over the keypad menu",
    code: `def letterCombinations(digits):
    if not digits:
        return []                       # contract: empty input -> no combos
    pad = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
           "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    out, path = [], []

    def dfs(i):
        if i == len(digits):
            out.append("".join(path))   # one full encoding
            return
        for ch in pad[digits[i]]:       # this digit's letters, in order
            path.append(ch)             # choose
            dfs(i + 1)                  # explore the next digit
            path.pop()                  # unchoose

    dfs(0)
    return out`,
    walkthrough: [
      "The state is a single index i — how many digits have been encoded — because the letters themselves live in path. dfs(i) promises: every completion of the remaining digits will be emitted before it returns. The menu is pad[digits[i]], scanned in keypad order; there is no validity test anywhere, since every choice stays on the contract.",
      "Trace '23': path grows 'a' → 'ad', 'ae', 'af' join at three leaves; pop back to 'a', pop, choose 'b' → 'bd', 'be', 'bf'; then 'cd', 'ce', 'cf'. Nine strings, each constructed exactly once at its leaf by the join — the only moment a Python string object exists. The output comes out in keypad order, and the harness's sortFlat makes that order invisible to grading.",
      "Counting the work: 3^a·4^b strings for a two-letter digits and b four-letter digits — at most 4^4 = 256 — each joined in O(k) with k ≤ 4. Space is the path buffer plus recursion depth, O(k), with the output excluded. There is no asymptotic trick to find here; the value of the exercise is the skeleton, which survives unchanged when menus become constraint-dependent.",
    ],
    time: "O(3^a·4^b · k) output-sensitive — every string built once at its leaf (k digits, k ≤ 4)",
    space: "O(k) — the shared path buffer and recursion depth (output excluded)",
    followUps: [
      "Constraint-driven menus: if a digit could be skipped or letters removed (T9-style), only pad[digits[i]] changes — the skeleton is identical.",
      "Counting instead of listing: multiply the per-digit menu sizes in O(k) — the product structure means no enumeration is needed for the count.",
    ],
    related: ["generate-parentheses", "combinations", "restore-ip-addresses"],
    verify: {
      fn: "letterCombinations",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: ["23"], expect: ["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"] },
        { args: [""], expect: [] },
        { args: ["2"], expect: ["a", "b", "c"] },
        { args: ["7"], expect: ["p", "q", "r", "s"] },
        { args: ["79"], expect: ["pw", "px", "py", "pz", "qw", "qx", "qy", "qz", "rw", "rx", "ry", "rz", "sw", "sx", "sy", "sz"] },
      ],
    },
    xp: 20,
  },
  {
    slug: "n-queens",
    statement:
      "Place n queens on an n×n chessboard so that no two queens attack each other — no shared row, column or diagonal — and return every distinct arrangement. Each solution is rendered as a list of n strings, where 'Q' marks a queen's square and '.' an empty one.",
    examples: [
      { input: "n = 4", output: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]', explanation: "The two mirror-image solutions. LeetCode accepts the boards in any order; the harness grades this canonical row-by-row DFS order (columns tried left-to-right)." },
      { input: "n = 1", output: '[["Q"]]' },
      { input: "n = 3", output: "[]", explanation: "Every placement forces a conflict — no solution exists." },
    ],
    constraints: ["1 <= n <= 9"],
    breakdown: [
      "The structural insight that shrinks the search: n queens on n rows with no shared row means EXACTLY one queen per row. So the decision tree is not 'which of the n² cells' — it is 'which column for row r', n levels deep with n branches each. That one observation turns an unstructured placement problem into a clean sequence of per-row choice points, which is what makes backtracking the natural tool.",
      "Conflict checking wants three hash sets keyed by the diagonal arithmetic: cols for columns, diag1 for r − c, diag2 for r + c. Why these keys work: every ↘ diagonal has a constant r − c, every ↙ diagonal a constant r + c, so two squares attack diagonally exactly when they share a key. With the sets, testing a candidate cell is three O(1) membership checks, and a conflict found at row r prunes the entire subtree — no completion can undo two queens sharing a file.",
      "Uniqueness of the output also falls out of the row-by-row construction: a solution assigns exactly one column per row, two distinct solutions differ in some row's column, and the DFS visits each column assignment once. Mirror-image boards are genuinely different solutions and both appear — the problem asks for distinct boards, not distinct up-to-symmetry classes. And when no assignment survives (n = 2, n = 3), the tree simply exhausts and the answer is [].",
    ],
    edges: [
      "n = 2 and n = 3 have NO solutions — the correct output is [], produced by the tree exhausting, not by any special case.",
      "n = 1 returns [['Q']] — conflict rules exist only between two different queens; a single queen always solves.",
      "Both diagonal keys are needed: r − c catches one slope, r + c the other — dropping either lets diagonal-sharing queens through.",
      "The board rendering ('.' * c + 'Q' + '.' * (n − c − 1)) is a classic off-by-one trap — the search can be perfect and the boards still wrong.",
    ],
    ladder: [
      { title: "Brute force — choose n cells of n²", body: "Try every C(n², n) set of squares and test the no-attack condition. Even at n = 6 that is ~10^9 sets — the row constraint is begging to be exploited and isn't." },
      { title: "The pattern — row-by-row DFS, pairwise checks", body: "One queen per row by construction; at row r scan the n columns and compare against every already-placed queen (same column? same diagonal?) before recursing. Correct; the per-cell test costs O(r) with a list of past queens." },
      { title: "The optimal idea — O(1) conflict sets", body: "cols / r−c / r+c hash sets turn each conflict test into three membership checks, and unchoose is three discards. The same skeleton reaches n = 9 (352 solutions) instantly; bitmasks squeeze the constants further." },
    ],
    approach: "Row-by-row DFS with column/diagonal hash sets",
    code: `def solveNQueens(n):
    out = []
    queens = []                     # queens[r] = column of row r's queen
    cols, diag1, diag2 = set(), set(), set()

    def dfs(r):
        if r == n:                  # every row has a queen -> render board
            out.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):          # columns left-to-right -> canonical order
            if c in cols or (r - c) in diag1 or (r + c) in diag2:
                continue            # conflict -> prune this column
            cols.add(c); diag1.add(r - c); diag2.add(r + c)
            queens.append(c)        # choose
            dfs(r + 1)              # explore next row
            queens.pop()            # unchoose
            cols.discard(c); diag1.discard(r - c); diag2.discard(r + c)

    dfs(0)
    return out`,
    walkthrough: [
      "Choose is a triple set-insert plus a queens append; explore is one recursive call on the next row; unchoose is the exact mirror of choose — pop and three discards, in any order, since they touch disjoint state. The leaf at r == n renders the board from queens in one comprehension, which keeps the search state pure integers and the rendering localised in a single line.",
      "Trace n = 4: row 0 col 0 dies — row 1 fits at col 2 or 3, but each choice strands row 2 with no legal square, so both branches exhaust. Col 1 succeeds: row 1 → col 3, row 2 → col 0, row 3 → col 2, and the leaf renders ['.Q..','...Q','Q...','..Q.']. Backtracking resumes at row 0 col 2, which yields the mirror ['..Q.','Q...','...Q','.Q..']; col 3 exhausts like col 0. Two boards, emitted in exactly that canonical order.",
      "Counting the work: the tree is at most n! deep-branched (row r has ≤ n − r live columns once row conflicts accumulate), and the diagonal pruning removes most of that — n = 8 explores a few thousand nodes to find its 92 solutions. Time is conventionally quoted O(n!); space is queens, three sets and recursion depth — O(n) with the output excluded.",
    ],
    time: "O(n!) worst-case bound — the three conflict sets prune most branches long before row n",
    space: "O(n) — queens list, three conflict sets, recursion depth (output excluded)",
    followUps: [
      "N-Queens II asks only for the COUNT — same DFS, drop the rendering; three bitmask integers replace the sets for the fastest practical form.",
      "Symmetry pruning: halve the work by forcing row 0's queen into the left half and mirroring solutions — a constant-factor trick worth mentioning after the clean version.",
    ],
    related: ["n-queens-ii", "sudoku-solver", "word-search"],
    verify: {
      fn: "solveNQueens",
      wrap: "plain",
      normalize: "none",
      cases: [
        { args: [4], expect: [[".Q..", "...Q", "Q...", "..Q."], ["..Q.", "Q...", "...Q", ".Q.."]] },
        { args: [1], expect: [["Q"]] },
        { args: [2], expect: [] },
        { args: [3], expect: [] },
        {
          args: [6],
          expect: [
            [".Q....", "...Q..", ".....Q", "Q.....", "..Q...", "....Q."],
            ["..Q...", ".....Q", ".Q....", "....Q.", "Q.....", "...Q.."],
            ["...Q..", "Q.....", "....Q.", ".Q....", ".....Q", "..Q..."],
            ["....Q.", "..Q...", "Q.....", ".....Q", "...Q..", ".Q...."],
          ],
        },
      ],
    },
    xp: 35,
  },
];
