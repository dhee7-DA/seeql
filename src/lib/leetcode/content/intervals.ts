// Deep-dives — Intervals (NeetCode 150 section + TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const INTERVALS: LcDeepDive[] = [
  {
    slug: "insert-interval",
    statement:
      "You are given a list of non-overlapping intervals already sorted by their start, plus one new interval. Insert the newcomer and merge wherever intervals overlap, returning the resulting list of non-overlapping intervals in start order. The newcomer may touch, sit inside, or bridge any number of existing intervals — the merge has to survive all of it.",
    examples: [
      { input: "intervals = [[1,3],[6,9]], newInterval = [2,5]", output: "[[1,5],[6,9]]", explanation: "[2,5] overlaps both intervals, so all three collapse into [1,5] and [6,9]." },
      { input: "intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]", output: "[[1,2],[3,10],[12,16]]", explanation: "[4,8] bridges [3,5], [6,7] and [8,10]; the untouched intervals pass through unchanged." },
      { input: "intervals = [], newInterval = [5,7]", output: "[[5,7]]" },
    ],
    constraints: [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2 and newInterval.length == 2",
      "0 <= start <= end <= 10^5",
      "intervals is sorted by start and contains no overlaps",
    ],
    breakdown: [
      "The sorted-and-disjoint guarantee is a gift, and the whole solution is refusing to waste it. It means the answer has the shape 'prefix that ends before the newcomer, one merged blob, suffix that starts after the blob' — nothing on the left can interact with anything on the right, so the problem decomposes into three clean phases instead of a general merge. Every existing interval falls into exactly one bucket: it ends strictly before the new interval starts (survives untouched), overlaps the newcomer (gets absorbed), or starts after the blob's final end (survives untouched).",
      "Absorption itself is a running min/max. While an interval's start is at most the blob's current end, the blob stretches: its start can only move down (the newcomer may begin before the first overlap) and its end can only move up. One pass, no backtracking, because starts are sorted — the first interval that starts past the blob's end can never be pulled back in.",
      "The naive misstep is appending the newcomer, sorting, and re-running merge-intervals: correct, but it re-sorts data that was already sorted and throws away the structural guarantee. The subtler misstep is case analysis — 'before everything', 'after everything', 'inside one interval', 'bridging two'… — six fragile branches where three phases handle every landing spot at once.",
    ],
    edges: [
      "Empty intervals list: the newcomer is the entire answer, and every loop body must skip cleanly.",
      "The newcomer sits entirely inside one existing interval ([2,3] inside [1,5]) — absorption must widen nothing and return the original interval unchanged.",
      "Touching endpoints merge: inserting [3,5] next to [1,3] yields [1,5], because closed intervals sharing a point overlap.",
      "Landing entirely before the first interval or after the last must fall out of the same three phases with no special-casing.",
    ],
    ladder: [
      { title: "Brute force — append, sort, merge", body: "Paste newInterval into the list, sort by start, run the full merge-intervals pass. O(n log n) plus extra passes; a fine opener, but it ignores that the input was already sorted and disjoint." },
      { title: "Three scans — prefix, absorb, suffix", body: "Copy intervals ending before the newcomer; fold everything overlapping into one widening blob; copy the rest. Three linear phases, no sort, and the phases never revisit an interval because starts are ordered." },
      { title: "The optimal idea — the blob absorbs while it can", body: "Track the blob as (s, e) starting from the newcomer. Phase 2 runs while intervals[i][0] <= e, updating s = min(s, start) and e = max(e, end). The guard 'starts at or before my end' is exactly where closed-interval touching is honoured, and the sorted starts guarantee the first reject ends the phase forever — O(n) with O(1) extra beyond the output." },
    ],
    approach: "Three phases — prefix, absorb, suffix",
    code: `def insert(intervals, newInterval):
    s, e = newInterval              # the blob: starts as the newcomer, then widens
    out = []
    i, n = 0, len(intervals)

    # Phase 1: everything ending strictly before the newcomer — untouched.
    while i < n and intervals[i][1] < s:
        out.append(intervals[i])
        i += 1

    # Phase 2: everything starting at or before the blob's end gets absorbed.
    while i < n and intervals[i][0] <= e:
        s = min(s, intervals[i][0])   # blob may start earlier than planned
        e = max(e, intervals[i][1])   # blob's right edge only ever grows
        i += 1
    out.append([s, e])

    # Phase 3: the rest starts after the blob — copy verbatim.
    out.extend(intervals[i:])
    return out`,
    walkthrough: [
      "Phase 1's invariant: out holds exactly the intervals ending strictly before s, and i sits on the first interval that could possibly interact. For [[1,2],[3,5],[6,7],[8,10],[12,16]] with newcomer [4,8], phase 1 copies [1,2] (its end 2 < 4) and stops at [3,5], whose end 5 is not less than 4. Nothing copied can ever need merging — that is what 'strictly before' buys.",
      "Phase 2 is the widening blob. Starting from (4,8): [3,5] pulls the start down to 3 (e stays 8), [6,7] leaves both edges alone, [8,10] starts at 8 ≤ 8 and stretches the end to 10 — the touching interval is absorbed precisely because the guard is <=. Then [12,16] starts at 12 > 10 and the phase stops. Since starts are sorted, one reject means every later interval starts even further right; the blob is final.",
      "Phase 3 copies the untouched suffix with a single extend. The invariant across the whole function: out is always sorted by start and pairwise disjoint — phase 1 preserves it, phase 2 emits exactly one interval strictly between the prefix and suffix, phase 3 preserves it. One visit per interval, no sorting, no branching on where the newcomer landed.",
    ],
    time: "O(n) — each interval is examined exactly once",
    space: "O(n) for the output; O(1) extra beyond it",
    followUps: [
      "If the input were not sorted or not disjoint, the three-phase plan dies at phase 1 — you'd owe a sort plus a full merge (i.e. merge-intervals). The phases are exactly the value the sorted guarantee provides.",
      "For a structure supporting many interleaved insert/remove calls, swap the array for a balanced tree keyed by start (or a segment tree over compressed coordinates); the phases become an O(log n) locate plus a splice.",
    ],
    related: ["merge-intervals", "non-overlapping-intervals", "interval-list-intersections"],
    verify: {
      fn: "insert",
      wrap: "plain",
      cases: [
        { args: [[[1, 3], [6, 9]], [2, 5]], expect: [[1, 5], [6, 9]] },
        { args: [[[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]], expect: [[1, 2], [3, 10], [12, 16]] },
        { args: [[], [5, 7]], expect: [[5, 7]] },
        { args: [[[1, 5]], [2, 3]], expect: [[1, 5]] },
        { args: [[[1, 3]], [3, 5]], expect: [[1, 5]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "merge-intervals",
    statement:
      "Given a list of closed intervals, merge every group that overlaps — including groups whose members merely share an endpoint — and return the surviving intervals sorted by start. The input is not necessarily sorted, and one interval may completely contain another.",
    examples: [
      { input: "intervals = [[1,3],[2,6],[8,10],[15,18]]", output: "[[1,6],[8,10],[15,18]]", explanation: "[1,3] and [2,6] overlap, so they fuse into [1,6]." },
      { input: "intervals = [[1,4],[4,5]]", output: "[[1,5]]", explanation: "Sharing the endpoint 4 counts as overlapping for closed intervals." },
      { input: "intervals = [[1,4],[0,4]]", output: "[[0,4]]", explanation: "Unsorted input — after sorting by start, [0,4] comes first and absorbs [1,4]; the union spans 0 to 4." },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start <= end <= 10^4",
    ],
    breakdown: [
      "Once the intervals are sorted by start, any interval that overlaps something earlier must overlap the most recent merged block — the block holding the largest end seen so far. That single fact collapses the problem into a walk: either extend the running block or start a new one. No interval can skip over the current block to touch an older one, because the current block's end is the maximum end of everything absorbed so far, and the newcomer starts no earlier than anything before it.",
      "Why sort by start rather than by end? The output must be sorted by start anyway, and 'starts in order' is precisely the property that lets ONE running block represent all merges so far. Sorting by end also works — that is the non-overlapping-intervals trick — but it produces merged blobs in end order, and you would still owe a second sort to present the answer.",
      "The classic bug is forgetting the max when extending: an interval like [2,20] that starts inside the current block but ends far beyond it must stretch the block's end to 20, not merely adopt its own end. That case arises both from nesting ([1,10] then [2,3]) and from start-sorted input whose ends jump around — the two shapes the max quietly covers.",
    ],
    edges: [
      "Unsorted input: [[1,4],[0,4]] must yield one interval — the sort is not optional, the running-block argument dies without it.",
      "Touching endpoints merge: [1,4] and [4,5] fuse into [1,5] because closed intervals share the point 4.",
      "Containment: [1,10] then [2,3] must leave the block at [1,10] — the extend is max(current end, new end), never an overwrite.",
      "A single interval, or exact duplicates, pass through unchanged (a duplicate [1,2] extends the block with max(2,2) and emits nothing new).",
    ],
    ladder: [
      { title: "Brute force — merge until fixpoint", body: "Repeatedly scan for any overlapping pair, fuse it, restart. Correct but O(n^3)-ish in the worst case, since each fusion can cascade; it also spends no effort on the ordering the output requires." },
      { title: "Sort by start, pairwise merging", body: "Sort, then for each interval scan forward fusing everything it overlaps. O(n^2) on a staircase of overlaps, and keeping the merged result sorted while fusing needs extra bookkeeping." },
      { title: "The optimal idea — one running block", body: "Sort by start and keep a single block whose end is the max end absorbed so far. Each interval either starts at or before that end (extend with max) or after it (seal the block, open a fresh one). O(n log n) for the sort, then one linear pass — nothing is ever revisited." },
    ],
    approach: "Sort by start + running merge block",
    code: `def merge(intervals):
    intervals.sort(key=lambda iv: iv[0])    # starts in order
    out = []
    for s, e in intervals:
        # out[-1] is the running block; s <= its end means overlap or touch.
        if out and s <= out[-1][1]:
            out[-1][1] = max(out[-1][1], e)   # extend — never shrink
        else:
            out.append([s, e])                # disjoint → open a new block
    return out`,
    walkthrough: [
      "Trace [[1,3],[2,6],[8,10],[15,18]]: [1,3] opens a block; [2,6] starts at 2 <= 3, so the block stretches to [1,6] (end = max(3,6)); [8,10] starts at 8 > 6, so the block seals and [8,10] opens; [15,18] opens another. The invariant after each step: out is sorted, disjoint, and out[-1][1] is the maximum end among all intervals consumed so far — which is exactly the number the next comparison needs.",
      "The max in the extend line is the whole game. [[1,10],[2,3]]: [2,3] starts at 2 <= 10 and the block becomes [1, max(10,3)] = [1,10] — without the max you would emit [1,3] and silently lose the tail. The same line produces [[1,4],[4,5]] → [1,5]: touching endpoints are 'overlap' under the <= guard, which is the closed-interval convention the problem states.",
      "Sorting costs O(n log n) and dominates; the pass is O(n) with O(1) extra state beyond the output. One hygiene note for interviews: the code reorders the caller's list in place — if mutation is off-limits, sort a copy and say so out loud, since silently mutating inputs is a review flag.",
    ],
    time: "O(n log n) — dominated by the sort; the merge pass is linear",
    space: "O(n) for the output (plus the sort's internal buffer)",
    followUps: [
      "Given two ALREADY merged, sorted, disjoint lists, their union is computed by the same running-block walk without any sort — the merge step of merge-sort wearing interval clothes.",
      "If intervals arrive as a stream and you must report the merged state after each insertion, keep intervals in a sorted container (balanced tree keyed by start) and merge with at most two neighbours in O(log n) per insert.",
    ],
    related: ["insert-interval", "non-overlapping-intervals", "meeting-rooms"],
    verify: {
      fn: "merge",
      wrap: "plain",
      cases: [
        { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expect: [[1, 6], [8, 10], [15, 18]] },
        { args: [[[1, 4], [4, 5]]], expect: [[1, 5]] },
        { args: [[[1, 4], [0, 4]]], expect: [[0, 4]] },
        { args: [[[1, 4], [2, 3]]], expect: [[1, 4]] },
        { args: [[[1, 3], [2, 20]]], expect: [[1, 20]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "non-overlapping-intervals",
    statement:
      "Given a list of intervals, remove the fewest possible so the survivors are pairwise non-overlapping — with sharing an endpoint allowed. Return the number of intervals removed. You may remove any subset, and the input arrives in arbitrary order.",
    examples: [
      { input: "intervals = [[1,2],[2,3],[3,4],[1,3]]", output: "1", explanation: "Dropping [1,3] leaves a chain of back-to-back intervals." },
      { input: "intervals = [[1,2],[1,2],[1,2]]", output: "2", explanation: "Identical intervals overlap pairwise — only one can survive." },
      { input: "intervals = [[1,2],[2,3]]", output: "0", explanation: "Touching endpoints do not conflict, so nothing needs to go." },
    ],
    constraints: [
      "1 <= intervals.length <= 10^5",
      "intervals[i].length == 2",
      "-5·10^4 <= start < end <= 5·10^4",
    ],
    breakdown: [
      "Flip the question first: minimising removals is maximising how many intervals you KEEP with no two overlapping. That reframing lands the problem squarely on the classic activity-selection result, whose greedy is legendary: sort by end time and keep an interval whenever it starts at or after the last kept end. Each keep is regret-free because the interval that finishes earliest leaves the most room for everything that follows.",
      "Why can the greedy never benefit from reconsidering? The exchange argument: if some optimal solution keeps a later-ending interval at a spot where the greedy kept the earliest-ending one, swap it for the greedy's choice — every interval compatible with the later-ending one is also compatible with the earlier-ending one. So the greedy's first keep appears in some optimal solution, and induction carries the claim through the whole sweep.",
      "The answer is just n minus the kept count, so no bookkeeping about WHICH intervals to delete is needed. The sort key is the entire lesson: sorting by START breaks the greedy — [1,100] gets kept first and evicts dozens of small intervals — while sorting by END bakes 'cost the future as little as possible' into the order itself.",
    ],
    edges: [
      "Touching endpoints do NOT conflict: [1,2] and [2,3] coexist, so the compatibility test is start >= last_end — the >=, not >, is the boundary policy.",
      "Exact duplicates overlap; from [1,2],[1,2] only one survives and the other is removed.",
      "Negative coordinates change nothing — the sweep is purely comparative.",
      "A single interval, or already-disjoint input, yields 0 removals and the greedy confirms it by keeping everything.",
    ],
    ladder: [
      { title: "Brute force — try all subsets", body: "Enumerate which intervals to remove and test the survivors for disjointness. Exponential; useful only as the definition of correctness." },
      { title: "DP over sorted intervals", body: "Sort by end; dp[i] = the most intervals keepable when i is the last kept one, found by scanning earlier compatible j's. O(n^2), correct, and a good stepping stone that exposes the optimal substructure the greedy will exploit." },
      { title: "The optimal idea — earliest end first", body: "Sort by end and sweep once, keeping every interval that starts at or after the running last-kept end. O(n log n) total, O(1) extra space, removals = n − kept. Activity selection, worn as a removal-counting problem." },
    ],
    approach: "Greedy activity selection — sort by end, keep what fits",
    code: `def eraseOverlapIntervals(intervals):
    intervals.sort(key=lambda iv: iv[1])     # earliest finish first
    kept = 0
    last_end = float("-inf")                 # end of the last kept interval
    for s, e in intervals:
        if s >= last_end:                    # compatible (touching is fine)
            kept += 1
            last_end = e                     # it becomes the new frontier
    return len(intervals) - kept             # everything not kept is removed`,
    walkthrough: [
      "Trace [[1,2],[2,3],[3,4],[1,3]]: sorted by end → [1,2],[1,3],[2,3],[3,4]. Keep [1,2] (last_end = 2); [1,3] starts at 1 < 2, skip; [2,3] starts at 2 >= 2, keep (last_end = 3); [3,4] keeps too. Three kept, one removed — and dropping [1,3] is indeed the unique minimum.",
      "The frontier last_end only moves right, and each keep claims the earliest end available at that moment — that is exactly why 'more room later' is guaranteed. The kept count is therefore the longest chain of pairwise-compatible intervals under the >= rule, and the exchange argument ties that chain's length to an optimal solution's.",
      "Now watch the sort key matter. [[1,100],[2,3],[4,5],[6,7]]: sorted by end the greedy keeps the three small ones and skips [1,100] — one removal. Sorted by START it would keep [1,100] first and then reject all three small intervals — three removals. Same algorithm, different key, triple the cost: this problem exists to teach that the greedy's correctness lives in the sort key.",
    ],
    time: "O(n log n) — the sort dominates; the sweep is linear",
    space: "O(1) extra — a frontier variable and a counter",
    followUps: [
      "If you must report WHICH intervals are removed, carry original indices through the sort and output the complement of the kept set — the frontier logic is untouched.",
      "Weighted variant (each interval has a value, maximise kept value): the greedy dies; weighted activity selection needs DP with binary search over the ends, O(n log n).",
    ],
    related: ["merge-intervals", "meeting-rooms", "minimum-number-of-arrows-to-burst-balloons"],
    verify: {
      fn: "eraseOverlapIntervals",
      wrap: "plain",
      cases: [
        { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expect: 1 },
        { args: [[[1, 2], [1, 2], [1, 2]]], expect: 2 },
        { args: [[[1, 2], [2, 3]]], expect: 0 },
        { args: [[[1, 100], [2, 3], [4, 5], [6, 7]]], expect: 1 },
        { args: [[[5, 7]]], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "meeting-rooms",
    statement:
      "Given a list of meeting time intervals, decide whether one person could attend all of them — that is, whether no two meetings overlap. Meetings that merely touch (one ends exactly when the next begins) are compatible; true overlaps are not. The input is not necessarily sorted.",
    examples: [
      { input: "intervals = [[0,30],[5,10],[15,20]]", output: "false", explanation: "[0,30] swallows both other meetings." },
      { input: "intervals = [[7,10],[2,4]]", output: "true", explanation: "After sorting, [2,4] and [7,10] are disjoint." },
      { input: "intervals = [[1,5],[5,8]]", output: "true", explanation: "Ending at 5 and starting at 5 is back-to-back, not a conflict." },
    ],
    constraints: [
      "0 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start < end <= 10^6",
    ],
    breakdown: [
      "'Do any two meetings overlap?' looks like a pairwise question, but after sorting by start it becomes strictly local: if a conflict exists anywhere, then somewhere two ADJACENT meetings — neighbours in start order — conflict. The reason is containment: a long meeting that swallows a later one also swallows the one right after it in sorted order, so the first collision always surfaces between neighbours before it can hide between strangers.",
      "The algorithm is therefore one sort plus one adjacent-pair scan: for each i, ask whether intervals[i] starts before intervals[i-1] ends. The touching case is the entire subtlety — a meeting starting exactly when the previous ends is fine, so the rejection test must be strict: start < previous end.",
      "The missteps are predictable. Comparing every pair is O(n^2) and unnecessary once the locality argument is on the table. And writing <= in the conflict test rejects legal back-to-back schedules — it fails exactly the edge case the problem is named for, which is also the edge interviewers probe first.",
    ],
    edges: [
      "Touching endpoints: [1,5] then [5,8] is legal — conflict requires strict start < previous end.",
      "Empty or single-meeting schedules are trivially true; the loop body never runs.",
      "Unsorted input ([[7,10],[2,4]] is true) — the adjacency argument only exists after sorting.",
      "A fully nested meeting ([1,10],[3,4]) is caught by the adjacent test: [3,4] starts strictly before [1,10] ends.",
    ],
    ladder: [
      { title: "Brute force — all pairs", body: "Check every pair with the overlap test s1 < e2 and s2 < e1. O(n^2); correct, and worth stating as the baseline you are about to beat." },
      { title: "Sort + sweep neighbours", body: "Sort by start, then a single linear scan of adjacent pairs answers the question in O(n log n). The work is in convincing yourself neighbours suffice — a conflict projected onto sorted order always includes an adjacent one." },
      { title: "The optimal idea — a strict-inequality frontier", body: "Same scan, but name the rule precisely: conflict iff next.start < prev.end. Tracking only the previous interval's end as the frontier makes the touching-endpoint decision explicit, the code three lines, and the early exit immediate." },
    ],
    approach: "Sort by start + adjacent conflict scan",
    code: `def canAttendMeetings(intervals):
    intervals.sort(key=lambda iv: iv[0])      # chronological order
    for i in range(1, len(intervals)):
        # Conflict iff this meeting starts strictly before the last one ends.
        if intervals[i][0] < intervals[i - 1][1]:
            return False
    return True`,
    walkthrough: [
      "Sort [[0,30],[5,10],[15,20]] — already in order — and the scan fires immediately: [5,10] starts at 5 < 30, return false without looking at [15,20]. Early exit is free here and worth mentioning; worst case is one clean pass over sorted neighbours.",
      "The strict inequality IS the boundary policy. [[1,5],[5,8]]: 5 < 5 is false, so the scan approves the back-to-back schedule. [[1,10],[3,4]]: 3 < 10 returns false — nesting is caught even though the meetings are nowhere near 'adjacent' geometrically; adjacency is in start order, not in time.",
      "Why neighbours suffice, in one line: if intervals[i] overlaps some intervals[j] with j > i+1, then intervals[i+1] starts between them and strictly before intervals[i] ends — so an adjacent conflict exists too. Cost: O(n log n) for the sort, O(n) for the scan, O(1) extra space. Every Easy interval problem is secretly teaching one locality argument like this.",
    ],
    time: "O(n log n) — sort dominates; the scan is linear",
    space: "O(1) extra (in-place sort)",
    followUps: [
      "The natural sequel is meeting-rooms-ii: when overlaps ARE allowed, how many rooms? The same sorted-by-start thinking scales up with a concurrency counter.",
      "If meetings arrive as a stream and you must answer 'can I add this one?' repeatedly, keep the intervals in a sorted container and binary-search the predecessor's end — O(log n) per query instead of a full rescan.",
    ],
    related: ["meeting-rooms-ii", "merge-intervals", "non-overlapping-intervals"],
    verify: {
      fn: "canAttendMeetings",
      wrap: "plain",
      cases: [
        { args: [[[0, 30], [5, 10], [15, 20]]], expect: false },
        { args: [[[7, 10], [2, 4]]], expect: true },
        { args: [[[1, 5], [5, 8]]], expect: true },
        { args: [[[5, 8], [1, 5], [3, 6]]], expect: false },
        { args: [[[1, 2]]], expect: true },
      ],
    },
    xp: 10,
  },
  {
    slug: "meeting-rooms-ii",
    statement:
      "Given meeting time intervals, return the minimum number of conference rooms needed so every meeting can be held without two meetings sharing a room while both are in session. A room frees up the instant its meeting ends — a meeting starting exactly when another ends may reuse it.",
    examples: [
      { input: "intervals = [[0,30],[5,10],[15,20]]", output: "2", explanation: "[0,30] runs the whole time; [5,10] and [15,20] take turns in a second room." },
      { input: "intervals = [[7,10],[2,4]]", output: "1", explanation: "The meetings never overlap." },
      { input: "intervals = [[1,5],[1,5],[1,5]]", output: "3", explanation: "Three identical meetings are all in session at once." },
    ],
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start < end <= 10^6",
    ],
    breakdown: [
      "Rooms are consumed by concurrency: at any instant t, the rooms needed equal the number of meetings containing t. Minimising rooms is therefore finding the maximum depth of overlap — a sweep question in disguise. The subtlety is the boundary policy: a meeting ending at t and another starting at t do NOT both contain t, since the room frees on the dot; at any shared boundary the END must be processed before the START.",
      "Two equivalent machines implement the sweep. The min-heap of end times holds one entry per meeting currently running; before starting a new meeting, pop every end at or before its start. The two-pointer version sorts starts and ends separately and replays the events in time order, incrementing on a start and decrementing on an end — the same sequence with no heap.",
      "The missteps: computing overlap depth per meeting by brute force (O(n^2)); or sorting boundary events and forgetting the ends-before-starts tie-break, which inflates the answer by one at every back-to-back boundary — the most common wrong submission on this problem.",
    ],
    edges: [
      "Back-to-back meetings ([1,2],[2,3],[3,4]) share one room — at equal times, ends are processed before starts.",
      "Identical meetings stack: three copies of [1,5] force 3 rooms.",
      "Nesting ([1,10],[2,3]) gives depth 2 even though one meeting is tiny — the answer is peak concurrency, not total span.",
      "A single meeting → 1; an empty schedule → 0 (the walk never increments).",
    ],
    ladder: [
      { title: "Brute force — depth at every start", body: "For each meeting, count how many meetings contain its start; the answer is the max of those counts. O(n^2), conceptually clean, and the correctness anchor for everything faster." },
      { title: "Min-heap of end times", body: "Sort by start; for each meeting, pop heap tops whose end <= current start (rooms freed), then push this meeting's end. The heap's size after each push is the current concurrency; the peak ever seen is the answer. O(n log n)." },
      { title: "The optimal idea — two sorted arrays, two pointers", body: "Sort starts and ends independently, then walk the earliest unprocessed event: a start borrows a room (+1), an end releases one (−1), ties go to ends. The peak of the running counter is the answer — same O(n log n), no heap, and the boundary policy lives in one strict comparison." },
    ],
    approach: "Two pointers over sorted starts and ends",
    code: `def minMeetingRooms(intervals):
    starts = sorted(iv[0] for iv in intervals)
    ends = sorted(iv[1] for iv in intervals)

    rooms = 0            # meetings in session right now
    best = 0             # peak concurrency — the answer
    s = e = 0            # pointers into starts / ends
    while s < len(starts):
        if starts[s] < ends[e]:
            rooms += 1                       # a meeting begins
            s += 1
            best = max(best, rooms)
        else:
            rooms -= 1                       # an end at the same instant fires first
            e += 1
    return best`,
    walkthrough: [
      "The two arrays are two timelines of the same n meetings, and the walk replays their events chronologically. The strict test starts[s] < ends[e] asks 'is the next event a start?'; if an end shares the instant, it fires first — that is exactly the free-on-the-dot room policy, encoded in one comparison.",
      "Trace [[0,30],[5,10],[15,20]]: starts = [0,5,15], ends = [10,20,30]. 0 < 10 → rooms 1 (best 1); 5 < 10 → rooms 2 (best 2); 15 < 10 fails → rooms 1, e advances; 15 < 20 → rooms 2 (best stays 2); starts exhausted → 2. The leftover ends only decrement, so the walk can stop as soon as all starts are consumed.",
      "Back-to-back check: [[1,2],[2,3],[3,4]] gives starts = [1,2,3], ends = [2,3,4]. 1 < 2 → rooms 1; 2 < 2 fails → rooms 0; 2 < 3 → rooms 1; 3 < 3 fails → rooms 0; 3 < 4 → rooms 1. Answer 1 — every meeting reuses the freed room, matching the boundary policy exactly. The counter never goes negative: the e-th smallest end always lies strictly above the e-th smallest start.",
    ],
    time: "O(n log n) — two sorts; the walk is linear",
    space: "O(n) — the two sorted arrays",
    followUps: [
      "If meetings carry room preferences or rooms have capacities, the min-heap version generalises more gracefully — carry a room id alongside each end and reassign it on pop.",
      "To output the actual allocation (which meeting in which room), the heap version is the extension point: each push/pop is an assignment or a release.",
    ],
    related: ["meeting-rooms", "non-overlapping-intervals", "employee-free-time"],
    verify: {
      fn: "minMeetingRooms",
      wrap: "plain",
      cases: [
        { args: [[[0, 30], [5, 10], [15, 20]]], expect: 2 },
        { args: [[[7, 10], [2, 4]]], expect: 1 },
        { args: [[[1, 5], [1, 5], [1, 5]]], expect: 3 },
        { args: [[[1, 2], [2, 3], [3, 4]]], expect: 1 },
        { args: [[[9, 10], [4, 9], [4, 17]]], expect: 2 },
      ],
    },
    xp: 20,
  },
  {
    slug: "minimum-interval-to-include-each-query",
    statement:
      "Given a list of intervals and a list of query points, answer for each query the size of the smallest interval that contains it, where size means end − start + 1. If no interval contains the query, its answer is −1. The answers must come back in the queries' ORIGINAL order — duplicates included — even though you are free to process the queries internally in any order you like.",
    examples: [
      { input: "intervals = [[1,4],[2,4],[3,6],[4,5]], queries = [2,3,4,5]", output: "[3,3,2,2]", explanation: "Query 2 → [2,4] (size 3); query 4 is covered by [4,5] (size 2) among others; query 5 by [4,5] (size 2) and [3,6] (size 4)." },
      { input: "intervals = [[2,3],[2,5],[1,5],[4,6],[8,9]], queries = [2,3,5,9,7]", output: "[2,2,3,2,-1]", explanation: "Query 7 falls in a gap and gets −1; query 9 hits [8,9] (size 2)." },
      { input: "intervals = [[1,2]], queries = [5]", output: "[-1]" },
    ],
    constraints: [
      "1 <= intervals.length, queries.length <= 10^5",
      "1 <= start <= end <= 10^7",
      "1 <= queries[i] <= 10^7",
    ],
    breakdown: [
      "Answering each query by scanning every interval is O(n·q) — 10^10 operations at full size. The unlock is answering the queries OFFLINE: the output must align with the input order, but nothing forbids computing the answers in a more convenient order and reassembling them at the end. Sorting the queries turns arbitrary points into a monotone march, and a monotone march is what lets a data structure safely forget the past.",
      "Sort the intervals by start as well. As the query value q grows, two monotone things happen: intervals with start <= q become CANDIDATES (they might cover q), and candidates whose end < q become DEAD (they cannot cover q, and every future query is larger, so they can never matter again). The candidate pool therefore only ever gains through one gate and loses through another — both amortised O(1) per interval with a forward pointer and a heap.",
      "Which candidate is the answer? The smallest-size one that has not expired. A min-heap keyed by SIZE (not by end) delivers that in an O(1) peek, and the size key is what makes eviction lazy: expired entries are popped only when they surface to the top, never hunted down by name. Trying to keep the heap 'clean' eagerly is the classic over-engineering trap on this problem.",
    ],
    edges: [
      "Repeated queries: sorting a COPY of the queries plus an answer map keyed by query value keeps the final list aligned with the original order, duplicates and all.",
      "Queries before the earliest start or after the last end get −1 — so does anything in a coverage gap.",
      "Touching boundaries count: [1,2] contains both 1 and 2 (closed intervals), so admission is start <= q and expiry is end < q — both strictness choices are load-bearing.",
      "A size-1 interval [k,k] is a legitimate best answer for q = k; make sure the size formula (end − start + 1, not end − start) is right.",
    ],
    ladder: [
      { title: "Brute force — scan per query", body: "For each q, loop over all intervals and keep the minimum size among those with start <= q <= end. O(n·q) — hopeless at 10^5 × 10^5, but the correctness anchor every faster version must reproduce." },
      { title: "Sorted sweep with a candidate pool", body: "Sort intervals by start and queries ascending; per query admit all starts <= q, then scan the pool discarding end < q and tracking the min size. The two monotone gates are now visible, but rescanning the pool per query stays quadratic in the worst case." },
      { title: "The optimal idea — size-keyed min-heap with lazy expiry", body: "Admit (size, end) tuples into a min-heap ordered by size as the query marches; pop while the top's end < current q; the surviving top is the answer. Each interval is pushed once and popped at most once, so the heap work amortises to O(log n) per interval — O((n + q) log(n + q)) overall, with the answer map restoring original order." },
    ],
    approach: "Offline sorted queries + size-keyed min-heap with lazy expiry",
    code: `import heapq

def minInterval(intervals, queries):
    intervals.sort(key=lambda iv: iv[0])       # admit in start order
    ans = {}                                   # query value → best size

    heap = []                                  # (size, end) — min by size
    i = 0
    for q in sorted(queries):                  # march the queries upward
        # Gate 1: every interval starting at or before q is now a candidate.
        while i < len(intervals) and intervals[i][0] <= q:
            s, e = intervals[i]
            heapq.heappush(heap, (e - s + 1, e))
            i += 1
        # Gate 2: candidates ending before q are dead for good — every later
        # query is larger, so eviction here is permanent, not temporary.
        while heap and heap[0][1] < q:
            heapq.heappop(heap)
        ans[q] = heap[0][0] if heap else -1

    return [ans[q] for q in queries]           # original order restored`,
    walkthrough: [
      "Trace the second example. Intervals sorted by start → [1,5],[2,3],[2,5],[4,6],[8,9]; queries sorted → 2,3,5,7,9. At q=2 the heap holds (2,3),(4,5),(5,5) and the top answers 2. At q=3 nothing new is admitted and nothing has expired — same answer. At q=5, [4,6] arrives as (3,6) and (2,3) is evicted since its end 3 < 5; the top (3,6) answers 3.",
      "q=7 shows why lazy eviction is safe and cheap: (3,6), (4,5) and (5,5) all have end < 7 and are popped in turn, leaving the heap empty → −1. None of them was touched at q=5 beyond the top — each expires exactly when its lie catches up with it. At q=9 the gate admits [8,9] as (2,9) → 2. Reassembling through the answer map in the original query order yields [2,2,3,2,−1].",
      "The complexity accounting is the lesson: the pointer i never rewinds, so each interval is pushed exactly once; every popped entry is gone forever, so each is popped at most once; each distinct query does O(1) top-of-heap work. Total O(n log n + q log q) with the sorts dominating. 'Offline queries + monotone admission and eviction' is a reusable skeleton across hard sweep problems.",
    ],
    time: "O(n log n + q log q) — the two sorts dominate; heap work amortises to one push and one pop per interval",
    space: "O(n) for the heap plus O(q) for the answer map",
    followUps: [
      "If queries arrived online (answer before seeing the next), the offline trick dies; you would precompute the best interval for every coordinate with a sweep plus a segment tree over compressed endpoints.",
      "To report the interval itself rather than its size, carry the interval's index alongside (size, end) in each heap tuple and read it off the top.",
    ],
    related: ["meeting-rooms-ii", "non-overlapping-intervals"],
    verify: {
      fn: "minInterval",
      wrap: "plain",
      cases: [
        { args: [[[1, 4], [2, 4], [3, 6], [4, 5]], [2, 3, 4, 5]], expect: [3, 3, 2, 2] },
        { args: [[[2, 3], [2, 5], [1, 5], [4, 6], [8, 9]], [2, 3, 5, 9, 7]], expect: [2, 2, 3, 2, -1] },
        { args: [[[1, 2]], [5]], expect: [-1] },
        { args: [[[1, 5]], [3, 3]], expect: [5, 5] },
        { args: [[[1, 2], [2, 3]], [2]], expect: [2] },
      ],
    },
    xp: 35,
  },
  {
    slug: "minimum-number-of-arrows-to-burst-balloons",
    statement:
      "Balloons are spread along the x-axis as closed intervals: balloon i spans horizontally from x_start to x_end, inclusive. You shoot arrows vertically upward, each at a single x of your choosing; an arrow bursts every balloon whose span contains that x. Return the minimum number of arrows needed to burst every balloon.",
    examples: [
      { input: "points = [[10,16],[2,8],[1,6],[7,12]]", output: "2", explanation: "An arrow at x=6 bursts [2,8] and [1,6]; one at x=12 bursts [7,12] and [10,16]." },
      { input: "points = [[1,2],[3,4],[5,6],[7,8]]", output: "4", explanation: "Disjoint balloons — no arrow can serve two of them." },
      { input: "points = [[1,2],[2,3],[3,4],[4,5]]", output: "2", explanation: "Arrows at x=2 and x=4 each burst the two balloons touching that point." },
    ],
    constraints: [
      "1 <= points.length <= 10^5",
      "points[i].length == 2",
      "-2^31 <= x_start < x_end <= 2^31 - 1",
    ],
    breakdown: [
      "One arrow at position x bursts exactly the set of balloons whose intervals contain x, so an arrow SERVES A SET of balloons and the question is the minimum number of such sets covering all balloons. Whenever a problem says 'one choice serves a whole compatible set', the greedy-by-right-edge pattern is the prime suspect: an arrow placed at the earliest end among the remaining balloons serves every balloon that starts at or before that end.",
      "Sort the balloons by end and sweep, remembering the x of the last arrow. A balloon with start <= arrow_x is already burst; the first balloon with start > arrow_x demands a NEW arrow, and the best position for it is that balloon's own end — the earliest end among everything not yet burst, which therefore serves the largest possible set going forward. This is the activity-selection exchange argument wearing arrows.",
      "The touching rule is the problem's signature trap: x_start <= arrow <= x_end means a balloon STARTING where another ENDS is burst by the same arrow — these are closed intervals sharing a point. The test for 'needs a new arrow' is therefore strict (start > arrow_x). Get this comparison backwards and every back-to-back input breaks.",
    ],
    edges: [
      "Touching endpoints DO overlap: [1,8] and [8,10] fall to a single arrow at x=8 — the strict > test encodes the policy.",
      "Coordinates reach 32-bit extremes: computing a midpoint (start + end) / 2 can overflow in fixed-width languages; sorting by end and shooting AT an input endpoint involves no arithmetic at all.",
      "A single balloon needs exactly one arrow; fully disjoint balloons need one each — the sweep handles both without special cases.",
      "Negative coordinates behave identically; the sweep is comparisons only, never arithmetic.",
    ],
    ladder: [
      { title: "Brute force — most coverage per shot", body: "Among remaining balloons, find the arrow position that bursts the most, remove them, repeat. The idea is right but finding the best position per round is expensive and ill-defined; not a serious submission." },
      { title: "Sort by start + shrink the common window", body: "Sort by start and maintain the intersection of the current burst-group; when a balloon starts beyond the intersection's end, close the group and open another. Correct, but you maintain two numbers (window start and end) where one suffices." },
      { title: "The optimal idea — sort by end, shoot at ends", body: "Sort by end; keep the last arrow at the current group's end. A balloon starting at or before that x joins the group for free; the first balloon starting past it forces a new arrow placed at its own end. One pass, one variable, and minimality follows from the same exchange argument as activity selection." },
    ],
    approach: "Sort by end + greedy arrow placement",
    code: `def findMinArrowShots(points):
    points.sort(key=lambda p: p[1])     # earliest-ending balloon first
    arrows = 0
    arrow_x = 0                         # x of the most recent arrow
    for s, e in points:
        if arrows == 0 or s > arrow_x:  # starts past the last arrow → new shot
            arrows += 1
            arrow_x = e                 # shooting at the end serves the most
    return arrows`,
    walkthrough: [
      "Trace [[10,16],[2,8],[1,6],[7,12]]: sorted by end → [1,6],[2,8],[7,12],[10,16]. Arrow 1 lands at x=6; [2,8] starts at 2 <= 6, so it is burst by the same shot; [7,12] starts at 7 > 6 → arrow 2 at x=12; [10,16] starts at 10 <= 12 and joins it. Two arrows — one through the [1,6]/[2,8] overlap region, one through [7,12]/[10,16].",
      "The touching rule in action: [[1,8],[8,10]] sorts to that order, arrow 1 lands at 8, and [8,10] starts at 8, which is NOT greater than 8 — no second arrow, answer 1. Contrast [[1,8],[9,10]]: 9 > 8 forces a second shot, answer 2. And placing the first arrow anywhere left of 8 in the first pair would still need two shots — x=8 is precisely the placement that serves the most balloons.",
      "Minimality in one breath: the balloon that ends earliest overall must receive an arrow inside its span no matter what; an arrow AT its end covers every other balloon that any arrow inside its span could cover, so the first shot loses nothing by sitting there. Delete the served balloons and induct. One linear pass after the sort — O(n log n), O(1) extra, and zero coordinate arithmetic, which also dodges the overflow trap the constraints hint at.",
    ],
    time: "O(n log n) — the sort dominates; the sweep is linear",
    space: "O(1) extra beyond the in-place sort",
    followUps: [
      "If balloons were OPEN intervals (endpoints do not burst), the test flips from strict to non-strict — worth saying out loud how much rides on one comparison operator.",
      "The 3-D generalisation (bursting spheres with lasers along an axis) breaks the 1-D greedy; interval stabbing in higher dimensions needs sweep structures instead.",
    ],
    related: ["non-overlapping-intervals", "merge-intervals", "meeting-rooms-ii"],
    verify: {
      fn: "findMinArrowShots",
      wrap: "plain",
      cases: [
        { args: [[[10, 16], [2, 8], [1, 6], [7, 12]]], expect: 2 },
        { args: [[[1, 2], [3, 4], [5, 6], [7, 8]]], expect: 4 },
        { args: [[[1, 2], [2, 3], [3, 4], [4, 5]]], expect: 2 },
        { args: [[[1, 8], [8, 10]]], expect: 1 },
        { args: [[[-10, 3], [-7, -2], [-5, 1]]], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "interval-list-intersections",
    statement:
      "You are given two lists of closed intervals; within each list the intervals are sorted by start and pairwise disjoint. Return the intersection of the two lists — every closed interval that lies inside some interval of the first list AND some interval of the second — sorted and disjoint, as intersections naturally come out.",
    examples: [
      { input: "firstList = [[0,2],[5,10],[13,23],[24,25]], secondList = [[1,5],[8,12],[15,24],[25,26]]", output: "[[1,2],[5,5],[8,10],[15,23],[24,24],[25,25]]", explanation: "Six partial overlaps, three of them single points where intervals merely touch." },
      { input: "firstList = [[1,3],[5,9]], secondList = []", output: "[]" },
      { input: "firstList = [[1,5]], secondList = [[5,8]]", output: "[[5,5]]", explanation: "Touching closed intervals intersect in exactly one point." },
    ],
    constraints: [
      "0 <= firstList.length, secondList.length <= 1000",
      "each interval has start < end with -10^9 <= start < end <= 10^9",
      "within each list, intervals are sorted by start and disjoint (end < next start)",
    ],
    breakdown: [
      "The geometry fits in one formula: [a,b] ∩ [c,d] = [max(a,c), min(b,d)], non-empty exactly when max(a,c) <= min(b,d). That handles clipping, including the single-point case where the max equals the min. The algorithm's real job is not the math but the scheduling of comparisons — avoiding all m × n pairs using the fact that both lists are sorted.",
      "Walk the lists in lockstep like the merge step of merge-sort. After forming the current pair's intersection, whichever interval ENDS first is spent: everything later in the other list starts even further right, so it can never intersect the spent interval again. Advance that pointer; if the two intervals end together, advancing either is correct, and the code simply advances the first list's on ties.",
      "The sorted-and-disjoint guarantees mean each pair is considered exactly once and each surviving intersection is emitted in increasing order — the output is sorted by construction, which the problem lists as a requirement but the algorithm gives for free. The misstep is sorting or merging everything up front: unnecessary work that also hides the two-pointer structure interviewers are listening for.",
    ],
    edges: [
      "Single-point intersections ([1,5] vs [5,8] → [5,5]) are real answers — emptiness is max > min, so the non-empty test is <=.",
      "One empty list → empty result; the loop guard handles it with no special case.",
      "A pair that misses entirely still consumes an advance — the same ends-first rule fires with no output, which is how the pointers skip past gaps.",
      "Containment chains ([1,7] vs [3,10] → [3,7]) work because the advance compares ends, never starts.",
    ],
    ladder: [
      { title: "Brute force — all pairs", body: "Clip every pair and keep the non-empty intersections, then sort the survivors. O(m·n) comparisons plus a sort; perfectly fine at n <= 1000, but blind to the sorted structure both lists hand you." },
      { title: "Merge-style two pointers", body: "Advance pointers in lockstep, emit the clipped intersection for each pair, and move the pointer whose interval ends first. Linear, and the output emerges sorted without a final pass." },
      { title: "The optimal idea — 'ends first' is the whole rule", body: "The interval that finishes earliest cannot meet anything further in the other list, because later intervals start even later — it is provably spent. One comparison per pair, O(m + n) time, O(1) extra beyond the output, sorted output by construction." },
    ],
    approach: "Merge-style two pointers — advance whoever ends first",
    code: `def intervalIntersection(firstList, secondList):
    out = []
    i = j = 0
    while i < len(firstList) and j < len(secondList):
        # Intersection of two closed intervals — clip both ways.
        s = max(firstList[i][0], secondList[j][0])
        e = min(firstList[i][1], secondList[j][1])
        if s <= e:                     # non-empty (a single point counts)
            out.append([s, e])
        # Whoever ends first is spent — later intervals start even later.
        if firstList[i][1] < secondList[j][1]:
            i += 1
        else:
            j += 1
    return out`,
    walkthrough: [
      "Run the big example pair by pair. [0,2]×[1,5] → [1,2], first ends first, advance i. [5,10]×[1,5] → [5,5], second ends first, advance j. [5,10]×[8,12] → [8,10], advance i. [13,23]×[8,12] → empty (13 > 12) — and the advance still fires (j), which is exactly how the pointers walk past misses with no special-casing.",
      "Continue: [13,23]×[15,24] → [15,23], advance i; [24,25]×[15,24] → [24,24], advance j; [24,25]×[25,26] → [25,25], advance i. Six intersections emitted in ascending order; each pointer traversed its list exactly once. The three point-intersections came from touching endpoints, and the s <= e test kept them while rejecting the true miss.",
      "The invariant worth naming: everything before i in the first list intersects nothing at or after j in the second, and vice versa. The ends-first advance is what maintains it — a spent interval can never regain relevance because the other list only moves forward. Hence O(m + n) time, O(1) extra space, and a sorted disjoint output produced, not post-processed.",
    ],
    time: "O(m + n) — each pointer moves at most the length of its list",
    space: "O(1) extra beyond the output list",
    followUps: [
      "k-way generalisation: intersect k sorted lists with a min-heap over the k current intervals — pop the earliest-ending, emit if all k overlap, push that list's next interval.",
      "As a streaming problem, the same lockstep works on unbounded sorted feeds — a nice interview variant that tests whether the ends-first rule was internalised or memorised.",
    ],
    related: ["merge-intervals", "insert-interval", "employee-free-time"],
    verify: {
      fn: "intervalIntersection",
      wrap: "plain",
      cases: [
        { args: [[[0, 2], [5, 10], [13, 23], [24, 25]], [[1, 5], [8, 12], [15, 24], [25, 26]]], expect: [[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]] },
        { args: [[[1, 3], [5, 9]], []], expect: [] },
        { args: [[[1, 7]], [[3, 10]]], expect: [[3, 7]] },
        { args: [[[1, 5]], [[5, 8]]], expect: [[5, 5]] },
        { args: [[[3, 5], [8, 10]], [[1, 2], [6, 7]]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "employee-free-time",
    statement:
      "Every employee supplies a personal list of busy intervals. A moment is common free time when NO employee is busy at it. Return every maximal common-free interval as a [start, end] pair, sorted by start — but only the free time BETWEEN busy stretches counts: the idle span before anyone's first meeting and after everyone's last are excluded by definition.",
    examples: [
      { input: "schedule = [[[1,2],[5,6]],[[1,3]]]", output: "[[3,5]]", explanation: "The busy union is [1,3] ∪ [5,6]; the only internal gap is [3,5]." },
      { input: "schedule = [[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]]", output: "[[5,6],[7,9]]" },
      { input: "schedule = [[[7,8]]]", output: "[]", explanation: "One employee, no internal gaps — and time outside the busy span is excluded." },
    ],
    constraints: [
      "1 <= schedule.length <= 100 (employees)",
      "1 <= schedule[i].length <= 70 (intervals per employee)",
      "1 <= start < end <= 10^8",
    ],
    breakdown: [
      "Common free time is the COMPLEMENT of the union of everyone's busy intervals — a set-operation reading that immediately suggests the plan: merge all busy intervals into disjoint blocks (exactly merge-intervals' algorithm, deliberately ignoring employee identity), then read off the gaps between consecutive blocks. Employee boundaries are a red herring: two overlapping meetings from DIFFERENT employees block the company exactly as hard as two inside one person's day.",
      "The 'exclude before the first and after the last' rule costs nothing once you think in gaps: the merged busy blocks span [earliest start, latest end], and you collect gaps only BETWEEN blocks — never before the first block or after the last. The output arrives sorted and disjoint without a final pass, because it is generated in a left-to-right sweep over sorted blocks.",
      "The missteps: computing each employee's free time as the complement of their own list and intersecting the free lists pairwise — correct but quadratic-ish and drowning in boundary cases; or a k-way heap merge of the per-employee lists followed by gap-finding — elegant, but flattening and sorting is strictly simpler at these input sizes and yields identical output.",
    ],
    edges: [
      "Touching busy blocks ([1,2] then [2,3]) create NO free gap — the merge fuses closed intervals sharing a point, and the gap test is strict (next start > running end).",
      "A single employee with a single interval has no internal gaps → [].",
      "Employees' lists arrive in arbitrary order and may overlap within one employee — flattening erases all of that structure at once.",
      "Duplicate intervals ([1,5] listed twice) must not fabricate a zero-length gap — the max in the merge step makes duplicates no-ops.",
    ],
    ladder: [
      { title: "Brute force — complement per employee", body: "Compute each employee's free time as the complement of their busy list, then intersect the free lists pairwise. Correct, but O(n^2)-ish intersection work and a pile of boundary cases around touching intervals." },
      { title: "Event sweep with a concurrency counter", body: "Emit +1 at every interval start and −1 at every end; sort the events (ends before starts at ties); any stretch where the counter is 0 strictly between a drop and the next rise is common free time. Linear after the sort, and it generalises to 'free for at least k of n employees'." },
      { title: "The optimal idea — flatten, merge, read the gaps", body: "Flatten every employee's intervals into one list, sort by start, merge into disjoint busy blocks, and output [block_end, next_block_start] for each pair of consecutive blocks. Same O(N log N), minimal state: one running end plus a gap collector — the event sweep with the bookkeeping deleted." },
    ],
    approach: "Flatten + sort + merge + gap collection",
    code: `def employeeFreeTime(schedule):
    # Adaptation note: on LeetCode, 'schedule' is a list of employees, each
    # holding Interval OBJECTS. The in-app harness speaks JSON instead, so an
    # employee is a list of [start, end] pairs and 'schedule' is a list of
    # lists of pairs — the flattening below is explicit on purpose.
    busy = sorted(
        (iv for person in schedule for iv in person),
        key=lambda iv: iv[0],
    )
    if not busy:                    # constraints exclude this; stay total
        return []

    free = []
    prev_end = busy[0][1]           # right edge of the running busy block
    for s, e in busy[1:]:
        if s > prev_end:            # strict gap → nobody busy in [prev_end, s]
            free.append([prev_end, s])
        prev_end = max(prev_end, e) # the running block swallows the interval
    return free`,
    walkthrough: [
      "Flatten [[[1,3],[6,7]],[[2,4]],[[2,5],[9,12]]] → [1,3],[6,7],[2,4],[2,5],[9,12]; sorted → [1,3],[2,4],[2,5],[6,7],[9,12]. prev_end starts at 3. [2,4] and [2,5] start at or before 5, so both are swallowed and prev_end climbs to 5. [6,7] starts at 6 > 5 → emit [5,6], prev_end becomes 7. [9,12] starts at 9 > 7 → emit [7,9]. Result [[5,6],[7,9]] — two gaps, both maximal, both strictly inside the busy span.",
      "The invariant: prev_end is always the right edge of the merged busy block so far — the max end among all intervals consumed. A gap exists exactly when the next interval starts strictly past that edge, and the strict > is the touching-endpoint policy: [1,2] followed by [2,3] merges with no gap emitted. The max in the swallow step is what stops a nested interval ([2,3] inside [1,10]) from dragging the frontier backwards.",
      "Everything outside [earliest start, latest end] is never emitted because gaps are recorded only BETWEEN a consumed interval and its successor — the before-first and after-last exclusion costs zero extra code. One pass after the sort: O(N log N) for N total intervals across all employees, O(N) for the flattened list, and the output is the only thing the caller ever sees.",
    ],
    time: "O(N log N) — N total intervals across all employees, one sort; the sweep is linear",
    space: "O(N) — the flattened list (the output is required, not 'extra')",
    followUps: [
      "Relax 'everyone free' to 'at least k of n employees free': the event-sweep rung keeps its shape — record spans where the busy counter stays at or below n − k.",
      "If each employee's list is already sorted and huge, a k-way heap merge replaces the global sort — O(N log k) instead of O(N log N).",
    ],
    related: ["merge-intervals", "meeting-rooms-ii", "interval-list-intersections"],
    verify: {
      fn: "employeeFreeTime",
      wrap: "plain",
      cases: [
        { args: [[[[1, 2], [5, 6]], [[1, 3]]]], expect: [[3, 5]] },
        { args: [[[[1, 3], [6, 7]], [[2, 4]], [[2, 5], [9, 12]]]], expect: [[5, 6], [7, 9]] },
        { args: [[[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]], expect: [[3, 4]] },
        { args: [[[[7, 8]]]], expect: [] },
        { args: [[[[1, 2], [2, 3]]]], expect: [] },
        { args: [[[[4, 5]], [[1, 2]]]], expect: [[2, 4]] },
      ],
    },
    xp: 35,
  },
];
