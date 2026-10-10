// Deep-dives — Math & Geometry (NeetCode 150 section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const MATH_GEOMETRY: LcDeepDive[] = [
  {
    slug: "rotate-image",
    statement:
      "You are given an n×n matrix of integers. Rotate it 90° clockwise — but the edit must happen on the matrix object itself, using O(1) extra memory. Nothing is returned; the caller's matrix IS the answer.",
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[[7,4,1],[8,5,2],[9,6,3]]", explanation: "The element at (i, j) moves to (j, n−1−i)." },
      { input: "matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]", output: "[[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]" },
      { input: "matrix = [[1]]", output: "[[1]]", explanation: "A 1×1 board is its own rotation." },
    ],
    constraints: [
      "1 <= n <= 20",
      "-2^31 <= matrix[i][j] <= 2^31 - 1",
      "the matrix is square (rows == columns)",
      "rotate in place — O(1) extra memory",
    ],
    breakdown: [
      "The whole problem hides in one coordinate sentence: rotating 90° clockwise sends the element at (i, j) to (j, n−1−i). Every 'where does this cell go' question is answered by that map, and its inverse — new[r][c] = old[n−1−c][r] — is how you would read a rotated copy. The in-place requirement is what turns a one-line comprehension into a puzzle: you cannot allocate the rotated board, so cells must travel along permutation cycles, or the movement must factor into operations that are trivially in-place.",
      "The elegant factorisation: a 90° clockwise rotation is a transpose followed by a horizontal flip. Transposing — swapping matrix[i][j] with matrix[j][i] — is naturally in-place because swaps come in pairs; reversing each row afterwards is also in-place. Compose the two maps: the transpose sends (i, j) → (j, i), then the row reversal sends (j, i) → (j, n−1−i). That composite is exactly the clockwise rotation map — two primitive in-place moves, no index gymnastics in the hot loop.",
      "The alternative is the four-way swap: rotate four cells at a time along their orbit (i, j) → (j, n−1−i) → (n−1−i, n−1−j) → (n−1−j, i) with one temporary, walking the top-left quadrant. Same O(n²) cost, but the loop bounds (half the rows, half the columns, parity care) are where bugs breed. The transpose+reverse version has no quadrant bookkeeping at all, which is why it is the form worth memorising.",
    ],
    edges: [
      "n = 1: the transpose walks an empty range and reversing a one-element row does nothing — the code must simply survive empty loops.",
      "Counter-clockwise rotation instead? Transpose then flip VERTICALLY (or reverse rows first, then transpose) — mixing the two flip directions is the classic slip.",
      "The transpose inner loop must start j at i+1: swapping (i, j) with (j, i) twice — once per order — un-transposes and leaves the matrix unchanged.",
      "Negative and extreme 32-bit values are irrelevant to the movement logic — they only matter in languages where cell copies need careful temporaries.",
    ],
    ladder: [
      { title: "Brute force — build the rotated copy", body: "Allocate new[n][n] with new[j][n−1−i] = old[i][j]. O(n²) time and O(n²) space — correct, and a fine baseline, but it fails the in-place requirement that is the actual point of the problem." },
      { title: "Cycle rotation with a single temp", body: "Rotate four cells at a time along their orbit: (i,j) → (j,n−1−i) → (n−1−i,n−1−j) → (n−1−j,i), walking i over the first ⌈n/2⌉ rows and j over the first ⌊n/2⌋ columns. O(n²) time, O(1) space — right idea, fiddly bounds." },
      { title: "The optimal idea — transpose + reverse rows", body: "Factor the rotation map into transpose ∘ row-flip. Both steps are embarrassingly in-place pairwise swaps. Two clean nested loops, no quadrant arithmetic, O(n²) time, O(1) space." },
    ],
    approach: "Transpose, then reverse each row",
    code: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):              # transpose: (i, j) <-> (j, i)
        for j in range(i + 1, n):   # j > i so each pair swaps exactly once
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:              # flip horizontally: (r, c) -> (r, n-1-c)
        row.reverse()               # composed: (i, j) -> (j, n-1-i) = 90° CW`,
    walkthrough: [
      "The transpose loop's upper-triangle walk (j from i+1) is the guard against double-swapping: diagonal cells map to themselves and every off-diagonal pair (i,j)/(j,i) is visited exactly once. After the loop, matrix[i][j] holds what matrix[j][i] used to — the matrix is its own mirror across the main diagonal.",
      "row.reverse() is an in-place two-pointer flip of each row. For [[1,2,3],[4,5,6],[7,8,9]], the transpose yields [[1,4,7],[2,5,8],[3,6,9]]; reversing every row yields [[7,4,1],[8,5,2],[9,6,3]] — exactly the clockwise answer.",
      "Why the composition works is coordinate algebra: the transpose maps (i,j) → (j,i) and the row reversal maps (r,c) → (r,n−1−c); chained, (i,j) → (j,i) → (j,n−1−i), which is the rotation. Each factor is individually trivial to do in place — the transferable lesson is to decompose a hard permutation into primitive in-place moves.",
    ],
    time: "O(n²) — every cell touched a constant number of times",
    space: "O(1) — one swap temporary, all edits in place",
    followUps: [
      "Rotate 90° counter-clockwise: transpose, then reverse each COLUMN (or reverse the rows first, then transpose).",
      "Rotate 180°: reverse the order of the rows, then reverse each row — no transpose needed. 270° clockwise equals 90° counter-clockwise.",
    ],
    related: ["spiral-matrix", "spiral-matrix-ii", "set-matrix-zeroes"],
    verify: {
      fn: "rotate",
      wrap: "inPlace",
      cases: [
        { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
        { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expect: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
        { args: [[[1]]], expect: [[1]] },
        { args: [[[1, 2], [3, 4]]], expect: [[3, 1], [4, 2]] },
        { args: [[[0, -1], [-2, 3]]], expect: [[-2, 0], [3, -1]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "spiral-matrix",
    statement:
      "Walk an m×n matrix in clockwise spiral order — right across the top, down the right edge, left across the bottom, up the left edge — appending every element to a list, then spiral inward and repeat until the matrix is exhausted. Return the list.",
    examples: [
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "[1,2,3,6,9,8,7,4,5]" },
      { input: "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]", output: "[1,2,3,4,8,12,11,10,9,5,6,7]", explanation: "The outer ring first, then the inner strip." },
      { input: "matrix = [[1,2],[3,4],[5,6]]", output: "[1,2,4,6,5,3]", explanation: "A tall, thin matrix — the spiral degenerates into a snake." },
    ],
    constraints: ["1 <= m, n <= 10", "-100 <= matrix[i][j] <= 100"],
    breakdown: [
      "The spiral is just four straight scans repeated on a shrinking frame. Maintain four boundaries — top, bottom, left, right — that always delimit the not-yet-consumed rectangle. One iteration of the main loop peels the current frame's four edges (top row left→right, right column top→bottom, bottom row right→left, left column bottom→top), nudging the corresponding boundary inward after each edge.",
      "The insight worth stating is the boundary arithmetic: after consuming the top row you own rows (top+1 .. bottom); after the right column you own columns (left .. right−1). The frame loses one row or column per edge, so the loop cannot run more than min(m, n)/2 + 1 times, and the remaining region stays a well-formed rectangle until it degenerates to a single row or a single column.",
      "That degeneration is the entire difficulty. When the frame is one row (top == bottom), the bottom-row scan would re-walk what the top-row scan just took; when it is one column (left == right), the left-column scan would duplicate the right-column scan. Two guard checks — 'is there still a distinct row?' and 'is there still a distinct column?' — before the third and fourth edges kill every duplicate.",
    ],
    edges: [
      "Single-row or single-column matrices — the unguarded algorithm double-counts the last strip.",
      "Non-square shapes (m ≠ n) make the frame end on a horizontal or vertical strip; square matrices never isolate the bug.",
      "A 1×1 matrix: every scan fires exactly once and every boundary update leaves the loop cleanly.",
      "Empty input is outside the constraints here, but a defensive length check costs one line if you generalise.",
    ],
    ladder: [
      { title: "Brute force — simulate with visited marks", body: "Track (r, c), a direction vector, and a visited set; turn clockwise whenever the next cell is out of bounds or already seen. O(m·n) time, O(m·n) space for the marks. Correct, but the logic is scattered across a state machine." },
      { title: "Peel one ring at a time, recursively", body: "Consume the outer ring, then recurse on the (m−2)×(n−2) interior. Clean to state, but the index-offset plumbing for the interior makes the code longer and hides the degenerate-frame cases one level deep." },
      { title: "The optimal idea — four shrinking boundaries with degeneracy guards", body: "One while loop, four for-scans, boundaries top/bottom/left/right moved inward after each edge; guard the third and fourth edge with 'frame still has that dimension'. O(m·n) time, O(1) extra space besides the output." },
    ],
    approach: "Shrinking boundary frame",
    code: `def spiralOrder(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for c in range(left, right + 1):    # top row: left -> right
            res.append(matrix[top][c])
        top += 1
        for r in range(top, bottom + 1):    # right column: top -> bottom
            res.append(matrix[r][right])
        right -= 1
        if top <= bottom:                   # a distinct row remains?
            for c in range(right, left - 1, -1):
                res.append(matrix[bottom][c])   # bottom row: right -> left
            bottom -= 1
        if left <= right:                   # a distinct column remains?
            for r in range(bottom, top - 1, -1):
                res.append(matrix[r][left])     # left column: bottom -> top
            left += 1
    return res`,
    walkthrough: [
      "The loop invariant: after each full iteration, every cell outside the frame [top..bottom] × [left..right] has been appended exactly once, in spiral order. The frame shrinks by one row or column per edge, so it strictly shrinks every iteration and the loop terminates.",
      "Trace the 3×4 example: the first pass takes [1,2,3,4] (top), [8,12] (right, rows 1..2), [11,10,9] (bottom, its guard passes), [5] (left, rows 1..1 only). Boundaries are now top=1, bottom=1, left=1, right=2. Second pass takes the top row [6,7] and moves top to 2; the right-column scan range(2, 2) is empty; and the 'top <= bottom' guard now fails (2 > 1), skipping the bottom edge — that guard just prevented re-appending row 1 as a bottom row.",
      "The single-column case [[7],[9],[6]] shows the other guard: after the top row (7) and right column (9, 6), right drops to −1, so the bottom-row scan range(−1, −1, −1) is empty, and 'left <= right' fails, skipping the left scan. Result [7,9,6] with no duplicates — both guards earning their keep in one trace.",
    ],
    time: "O(m·n) — each element appended exactly once",
    space: "O(1) extra — four integers besides the output list",
    followUps: [
      "Counter-clockwise spiral: mirror the direction cycle — down the left, across the bottom, up the right, across the top — or transpose the roles of the axes.",
      "Writing values 1..n² into an n×n board in spiral order (spiral-matrix-ii): the same frame machine, writing instead of reading — the guards matter identically.",
    ],
    related: ["spiral-matrix-ii", "spiral-matrix-iii", "rotate-image"],
    verify: {
      fn: "spiralOrder",
      wrap: "plain",
      cases: [
        { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
        { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expect: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
        { args: [[[1, 2], [3, 4], [5, 6]]], expect: [1, 2, 4, 6, 5, 3] },
        { args: [[[7], [9], [6]]], expect: [7, 9, 6] },
        { args: [[[1, 2, 3]]], expect: [1, 2, 3] },
        { args: [[[1]]], expect: [1] },
      ],
    },
    xp: 20,
  },
  {
    slug: "set-matrix-zeroes",
    statement:
      "Given an m×n matrix, whenever a cell holds 0, its entire row and its entire column must become 0 — overwriting whatever was there. Apply the changes on the matrix object itself. The follow-up that makes the problem famous: do it with O(1) extra memory rather than marker sets.",
    examples: [
      { input: "matrix = [[1,1,1],[1,0,1],[1,1,1]]", output: "[[1,0,1],[0,0,0],[1,0,1]]" },
      { input: "matrix = [[0,1,2,0],[3,4,5,2],[1,3,1,5]]", output: "[[0,0,0,0],[0,4,5,0],[0,3,1,0]]", explanation: "The 0s in row 0 zero that row and columns 0 and 3." },
      { input: "matrix = [[1,2,3],[4,5,6],[7,8,9]]", output: "unchanged", explanation: "No zeros anywhere — the matrix survives intact." },
    ],
    constraints: ["1 <= m, n <= 200", "-2^31 <= matrix[i][j] <= 2^31 - 1", "edit in place", "follow-up: O(1) extra space"],
    breakdown: [
      "The obvious correct move is two passes with bookkeeping: scan the matrix, record every row and column containing a zero, then overwrite from the records. That is O(m + n) extra space and passes the constraints comfortably — but the follow-up demands O(1), and the interesting mathematics is getting the bookkeeping INTO the matrix itself.",
      "The key observation: you need one bit of information per row and per column, and the matrix conveniently has a first row and a first column. Use matrix[r][0] as the 'row r must be zeroed' flag and matrix[0][c] as the 'column c must be zeroed' flag; the interior can then be settled from those flags alone. The first row and first column are simultaneously the markers AND potential victims, so their original state is frozen into two booleans before anything is overwritten.",
      "Why two booleans? matrix[0][0] sits in both marker structures but can carry only one flag, while row 0 and column 0 are condemned independently: a zero at (0, 5) must wipe row 0 but not column 0, and a zero at (7, 0) wipes column 0 but not row 0. Storing both verdicts in the shared corner cell would couple them. Freezing both fates up front, then marking only the interior, keeps the axes' information from ever colliding — and the overwrite order (interior, then marker row/column, then the saved booleans) ensures no marker is read after it has been destroyed.",
    ],
    edges: [
      "Zeros in the first row or first column must not mark the whole matrix through the shared corner cell — they are handled by the saved booleans, not the interior markers.",
      "A matrix with no zeros must come back byte-identical; any stray marking ruins it.",
      "Single-row or single-column inputs have an empty interior — everything routes through the two booleans.",
      "Overwrite order matters: zeroing row 0 too early would destroy every column marker at once, since they live in row 0.",
    ],
    ladder: [
      { title: "Brute force — two marker sets", body: "Scan once collecting zero_rows and zero_cols; second pass writes 0 wherever r ∈ zero_rows or c ∈ zero_cols. O(m·n) time, O(m + n) space. The correctness baseline every other rung must match." },
      { title: "Mark with a sentinel value", body: "Replace doomed cells with a sentinel (say None) during detection, then sweep. Fragile: the value range includes arbitrary integers, so no sentinel is guaranteed safe, and the '0 vs marked-0' bookkeeping is a bug farm." },
      { title: "The optimal idea — first row/column as the marker bits", body: "Two booleans record the original first row/column; the interior marks its own rows and columns into matrix[r][0] / matrix[0][c]; then three overwrite sweeps: interior rows, interior columns, and finally the saved first row/column. O(m·n) time, O(1) space." },
    ],
    approach: "In-matrix markers via first row/column",
    code: `def setZeroes(matrix):
    m, n = len(matrix), len(matrix[0])
    row0 = any(matrix[0][c] == 0 for c in range(n))   # save row 0's fate
    col0 = any(matrix[r][0] == 0 for r in range(m))   # save column 0's fate
    for r in range(1, m):             # interior scan: plant markers
        for c in range(1, n):
            if matrix[r][c] == 0:
                matrix[r][0] = 0      # "row r is condemned"
                matrix[0][c] = 0      # "column c is condemned"
    for r in range(1, m):             # act on row markers (interior cells only)
        if matrix[r][0] == 0:
            for c in range(1, n):
                matrix[r][c] = 0
    for c in range(1, n):             # act on column markers
        if matrix[0][c] == 0:
            for r in range(1, m):
                matrix[r][c] = 0
    if row0:                          # finally the saved first row/column
        for c in range(n):
            matrix[0][c] = 0
    if col0:
        for r in range(m):
            matrix[r][0] = 0`,
    walkthrough: [
      "The two booleans are the fix for the shared-corner collision: matrix[0][0] sits in both marker structures, but row 0 and column 0 are condemned independently — a zero at (0, 5) condemns row 0 only. Freezing both fates before any writes means the interior markers can never corrupt the first row/column's verdict.",
      "The overwrite phase reads only marker cells that no sweep has yet touched: row markers live in column 0 below the marker row, column markers in row 0 right of the marker column. Sweeping interior rows first, then interior columns, then the saved row 0 / column 0, guarantees each verdict is read from a cell written during the marking scan — never from a cell an overwrite sweep has already flattened.",
      "Trace [[1,0],[2,3]]: row0 = True, col0 = False; the interior (a single cell holding 3) plants no markers; the row sweep does nothing since matrix[1][0] = 2; the column sweep zeroes (1,1) because matrix[0][1] = 0; the saved verdicts then zero row 0. Result [[0,0],[2,0]] — exactly the original zeros propagated, nothing more.",
    ],
    time: "O(m·n) — a constant number of full sweeps",
    space: "O(1) — two booleans; the markers live inside the matrix",
    followUps: [
      "If O(m + n) is allowed after all, the cleaner version keeps two explicit boolean arrays — the same passes with no self-referential markers to reason about.",
      "If the values guaranteed one never-used sentinel, you could mark with the sentinel instead of 0 and skip the two saved booleans — real matrices rarely grant a free value, which is why the marker-cell design is the celebrated one.",
    ],
    related: ["rotate-image", "game-of-life", "reshape-the-matrix"],
    verify: {
      fn: "setZeroes",
      wrap: "inPlace",
      cases: [
        { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expect: [[1, 0, 1], [0, 0, 0], [1, 0, 1]] },
        { args: [[[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]], expect: [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]] },
        { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] },
        { args: [[[0]]], expect: [[0]] },
        { args: [[[1, 0], [2, 3]]], expect: [[0, 0], [2, 0]] },
        { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 0]]], expect: [[1, 0, 0], [0, 0, 0], [0, 0, 0]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "happy-number",
    statement:
      "Starting from a positive integer, repeatedly replace it with the sum of the squares of its digits. If the process reaches 1, the number is happy; if it loops forever without reaching 1, it is not. Decide which — without simulating forever.",
    examples: [
      { input: "n = 19", output: "true", explanation: "19 → 1² + 9² = 82 → 68 → 100 → 1." },
      { input: "n = 2", output: "false", explanation: "2 → 4 → 16 → 20 → 4 — a cycle that never contains 1." },
      { input: "n = 1", output: "true" },
    ],
    constraints: ["1 <= n <= 2^31 - 1"],
    breakdown: [
      "The decisive fact is that the process MUST cycle. Squaring digits shrinks big numbers fast: for d digits the next value is at most 81·d, which for any 32-bit input (at most 10 digits) is ≤ 810 — a three-digit ceiling. From there the orbit lives in a finite set of at most 810 values, so by the pigeonhole principle some value repeats: every starting number eventually enters a cycle, and the only question is whether 1 (a cycle of length one, since 1 → 1) is on it.",
      "So the problem reduces to cycle detection on an implicit linked list: each value is a node and n → digit-square-sum is its 'next' pointer. You never build the graph; you just walk it. A hash set of visited values detects the repeat in space proportional to the path length — or you can import the tortoise-and-hare from linked-list-cycle and detect the same repeat with two pointers and O(1) memory.",
      "Floyd's algorithm works here verbatim because the transition is a pure function: slow advances one step, fast advances two, and if a cycle exists they must meet inside it. Checking 'fast == 1' rather than waiting for the pointers to rendezvous is the subtle payoff: happy inputs terminate the moment the hare reaches 1 instead of grinding until the meeting.",
    ],
    edges: [
      "n = 1 is trivially happy — the loop must not run past it and wrongly return false.",
      "Unhappy numbers all funnel into the SAME eight-cycle (4 → 16 → 37 → 58 → 89 → 145 → 42 → 20 → 4), so 'reached 4' is a valid shortcut verdict — a cute optimisation, not a requirement.",
      "Powers of ten (10, 100, 1000) collapse to 1 in one or two steps despite looking special.",
      "The 32-bit ceiling is a red herring: after one transition the value is ≤ 810, so no overflow occurs anywhere.",
    ],
    ladder: [
      { title: "Brute force — simulate and hope", body: "Apply the map repeatedly and stop when you hit 1. Never terminates on unhappy numbers — it is not an algorithm until a cycle check is bolted on." },
      { title: "Hash set of seen values", body: "Record every value; on a repeat return false, on a 1 return true. A bounded number of steps, O(visited) space. Simple, and the natural first answer in an interview." },
      { title: "The optimal idea — Floyd's tortoise and hare on the implicit chain", body: "slow = one transition per step, fast = two; they meet iff a cycle exists, and checking fast == 1 short-circuits happy inputs. Same steps, O(1) space — no set at all." },
    ],
    approach: "Floyd cycle detection on the digit-square-sum chain",
    code: `def isHappy(n):
    def nxt(x):
        s = 0
        while x:                    # digit-square-sum
            x, d = divmod(x, 10)
            s += d * d
        return s
    slow, fast = n, nxt(n)          # hare gets a one-step head start
    while fast != 1 and slow != fast:
        slow = nxt(slow)            # tortoise: one step
        fast = nxt(nxt(fast))       # hare: two steps
    return fast == 1                # True iff the chain reached 1`,
    walkthrough: [
      "The transition function nxt is the entire problem: divmod peels the last digit, squares it into the accumulator, and the loop runs until the quotient is 0. It is a pure function from naturals to naturals — exactly the shape Floyd's algorithm needs, whether the 'next' is a pointer field or arithmetic.",
      "Trace n = 19: slow = 19, fast = 82; then slow = 82 while fast = nxt(nxt(82)) = nxt(68) = 100; then slow = 100 and fast = nxt(nxt(100)) = 1 — the 'fast != 1' guard fails and we return True without waiting for a rendezvous. Trace n = 2: both pointers eventually enter the 4-cycle at different phases and meet at a shared value with fast ≠ 1 → False.",
      "Why must they meet? Inside a cycle of length L, the gap between fast and slow shrinks by one each step (fast gains 2, slow gains 1), so within L steps the gap hits zero. Outside any cycle the chain is finite before it loops, so one of the two events — reach 1, or meet — is guaranteed, and the loop always terminates.",
    ],
    time: "O(log n) per transition, a bounded number of transitions until 1 or a meet",
    space: "O(1) — two integers, no visited set",
    followUps: [
      "Classify every number below 1000 as happy or not: memoise the transition — orbits collapse onto a handful of cycles, so a cache makes the bulk scan nearly free.",
      "The same O(1)-space detection works for ANY iterated function — Pollard's rho factors integers with exactly this machinery on f(x) = x² + c.",
    ],
    related: ["linked-list-cycle", "add-digits", "ugly-number"],
    verify: {
      fn: "isHappy",
      wrap: "plain",
      cases: [
        { args: [19], expect: true },
        { args: [1], expect: true },
        { args: [7], expect: true },
        { args: [23], expect: true },
        { args: [2], expect: false },
        { args: [4], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "plus-one",
    statement:
      "A non-negative integer is stored as an array of its decimal digits, most significant first. Add one to the integer and return the resulting digit array — the array may grow by one digit when a carry escapes the front.",
    examples: [
      { input: "digits = [1,2,3]", output: "[1,2,4]" },
      { input: "digits = [9]", output: "[1,0]", explanation: "9 + 1 rolls over into a new digit." },
      { input: "digits = [9,9,9]", output: "[1,0,0,0]" },
    ],
    constraints: [
      "1 <= digits.length <= 100",
      "0 <= digits[i] <= 9",
      "no leading zeros (except the single-digit 0 itself)",
    ],
    breakdown: [
      "Addition with a carry is a right-to-left ripple, and the array already stores digits in that scan order. The insight to state out loud: you never need a carry variable that survives more than one digit. At each position, either the digit is below 9 — the carry dies there, increment and stop — or it is exactly 9, becomes 0, and the carry lives on to the next position.",
      "So the whole algorithm is: scan from the last index backwards; the first digit below 9 absorbs the increment and you return immediately; every 9 you pass over collapses to 0. If you fall off the left end, every digit was 9 — the unique all-nines case where the result is longer, and that is not a special case to tolerate but the arithmetic itself: 999…9 + 1 = 1000…0.",
      "Converting to an int and back (int(''.join) + 1) technically passes at length ≤ 100 — but that is precisely the move the problem exists to ban in spirit, and at length 10^5 it becomes a quadratic string-to-int conversion. State the ban, then solve the ripple: one backward pass, early exit, one prepend for the all-nines case.",
    ],
    edges: [
      "All nines — the only input that changes the array's length.",
      "Single digits: 9 → [1,0] and 0 → [1].",
      "No carry at all ([1,2,3] → [1,2,4]) must not touch any earlier digit — the early return handles it.",
      "Trailing zeros in the input are just ordinary digits; leading zeros never occur by contract.",
    ],
    ladder: [
      { title: "Convert, add, convert back", body: "int(''.join(map(str, digits))) + 1, then split back into digits. Works at length ≤ 100 but is the anti-pattern: big-int conversion is quadratic and defeats the point of the digit representation." },
      { title: "General carry loop", body: "Treat it as adding a one-digit addend with carry = 1 initially; loop while a carry remains. Correct, but carries slightly more state than the problem needs, since the addend is always exactly 1." },
      { title: "The optimal idea — first-non-9 early return", body: "Scan backwards; the first digit < 9 increments and returns; every 9 seen becomes 0; falling off the left end means all-nines → prepend 1. One pass, no carry variable, and the grow case falls out of the loop's exit." },
    ],
    approach: "Backward ripple with early return",
    code: `def plusOne(digits):
    for i in range(len(digits) - 1, -1, -1):
        if digits[i] < 9:
            digits[i] += 1      # carry absorbed here — done
            return digits
        digits[i] = 0           # 9 rolls to 0, carry continues left
    return [1] + digits         # carried past the front: all-nines input`,
    walkthrough: [
      "The loop is a case split per digit. digits[i] < 9: adding one cannot overflow this position, so the answer is finished — every position to the left is untouched because no carry ever reaches it. digits[i] == 9: the sum digit is 0 and a carry emerges; the next loop iteration IS that carry's journey.",
      "Trace [8,9,9]: index 2 is 9 → 0; index 1 is 9 → 0; index 0 is 8 → 9, return [9,0,0]. The iteration count equals the length of the trailing run of nines plus one — worst case all nines, where the loop visits everything and the prepend produces [1,0,…,0].",
      "Note the function mutates the input array in place (the increment and the zeroing both write into digits), building a fresh list via [1] + digits only when the length changes. That is fine for this contract — but it is worth saying aloud in an interview, since several sibling problems forbid mutation.",
    ],
    time: "O(n) worst case, O(1) when the last digit is not 9",
    space: "O(1) extra — a new array is allocated only on the all-nines path",
    followUps: [
      "Add an arbitrary digit array B instead of just 1: keep an explicit carry and merge the two scans — that loop is literally add-strings.",
      "Same problem in another base b: the threshold '9' becomes b − 1 and the prepend condition is unchanged — the algorithm is base-agnostic.",
    ],
    related: ["add-strings", "add-binary", "multiply-strings"],
    verify: {
      fn: "plusOne",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3]], expect: [1, 2, 4] },
        { args: [[0]], expect: [1] },
        { args: [[9]], expect: [1, 0] },
        { args: [[9, 9, 9]], expect: [1, 0, 0, 0] },
        { args: [[4, 3, 2, 1]], expect: [4, 3, 2, 2] },
        { args: [[8, 9]], expect: [9, 0] },
      ],
    },
    xp: 10,
  },
  {
    slug: "powx-n",
    statement:
      "Compute x raised to the power n — x a decimal fraction, n a 32-bit integer that may be negative — and return the value as a float. A naive loop of n multiplications is far too slow at |n| in the billions, and library pow is off the table.",
    examples: [
      { input: "x = 2.0, n = 10", output: "1024.0" },
      { input: "x = 0.5, n = 3", output: "0.125" },
      { input: "x = 2.0, n = -2", output: "0.25", explanation: "Negative n means the reciprocal: 2⁻² = 1/4." },
    ],
    constraints: [
      "-100.0 <= x <= 100.0",
      "-2^31 <= n <= 2^31 - 1",
      "no built-in pow / ** — implement it",
      "results within 10^-5 of the reference are accepted",
    ],
    breakdown: [
      "The identity that collapses the work: x^n = (x²)^(n/2) when n is even, and x·(x²)^((n−1)/2) when n is odd. Each application halves the exponent, so ~log₂ n squarings replace n multiplications — 2^31 needs about 31 steps, not 2 billion. This is binary exponentiation, and the iterative form reads n as a bit string: process bits low to high, squaring the base each step, multiplying the result by the current base exactly when the bit is 1.",
      "Why the bit-reading is correct: write n in binary as Σ bᵢ·2^i. Then x^n is the product, over set bits, of x^(2^i) — and the running variable x holds exactly x^(2^i) after i squarings. The 'multiply result when bit set' step assembles the product of the selected powers; the squaring advances to the next power of two. Each factor is two squarings away from the last — that one paragraph is the entire proof.",
      "Negative exponents are one line of mathematics: x^(−n) = (1/x)^n, so invert the base, flip the sign, run the same loop. The classic implementation trap is negating n when n = −2^31: in fixed-width integers −(−2^31) overflows. Computing 1/x first and treating |n| with unsigned (or, as here, Python's arbitrary-precision) arithmetic sidesteps it — naming that trap is worth interview points.",
    ],
    edges: [
      "n = 0 → 1.0 for any x (the loop body never multiplies; result stays 1).",
      "n = −2^31: negation overflows 32-bit signed integers — Python ints are immune, but the habit matters.",
      "x = 0 with negative n would be a division by zero — the constraints promise a well-defined answer, but guard or mention it.",
      "Floating-point: only binary-exact values (powers of two, integer products like 1024.0) compare stably across languages; everything else is graded with tolerance.",
    ],
    ladder: [
      { title: "Brute force — multiply |n| times", body: "result = 1; multiply by x, |n| times. O(|n|) — 2^31 steps is billions of multiplications; too slow, full stop." },
      { title: "Recursive halving", body: "half = p(n // 2); return half * half (times x when n is odd). O(log n) and fine, but it carries recursion depth plus separately handled negative-n logic — the iterative form is strictly tidier." },
      { title: "The optimal idea — iterative square-and-multiply over the bits of n", body: "Loop while n: multiply the result by the base on set bits, square the base, shift right. O(log |n|) multiplications, O(1) space, no recursion — negative n handled up front by inverting the base." },
    ],
    approach: "Iterative binary exponentiation (square-and-multiply)",
    code: `def myPow(x, n):
    if n < 0:
        x, n = 1.0 / x, -n      # x^(-n) = (1/x)^n — flip before the loop
    result = 1.0
    while n:                    # read n's bits from low to high
        if n & 1:
            result *= x         # this bit selects a factor of x^(2^i)
        x *= x                  # square: x^(2^i) -> x^(2^(i+1))
        n >>= 1
    return result`,
    walkthrough: [
      "The loop maintains two invariants: result × x^n(current) always equals the original x^N, and x always equals the original base raised to 2^(bits consumed). When n finally hits 0, the leftover x^n factor is 1 and result alone is the answer. Multiplying result only on set bits selects exactly the binary decomposition of N.",
      "Trace x = 2, n = 10 (binary 1010): bit 0 = 0 → x squares to 4; bit 1 = 1 → result = 4, x squares to 16; bit 2 = 0 → x squares to 256; bit 3 = 1 → result = 4 × 256 = 1024. Four iterations, three squarings, two multiplies — versus ten brute-force multiplications, and at n = 2^31 the gap is ~31 steps versus 2 billion.",
      "The negative branch runs first and costs one division: myPow(2.0, −2) becomes myPow(0.5, 2) → 0.25. On precision: repeated squaring is exactly what libm does internally, so accuracy is comparable to built-ins — the verifier here sticks to binary-exact values (powers of two, integer products) so JSON comparison is stable without tolerance logic.",
    ],
    time: "O(log |n|) — one squaring per bit of |n|",
    space: "O(1) — two scalar variables",
    followUps: [
      "Modular exponentiation (x^n mod m): the identical loop with a % m after every multiply — it is the engine of RSA and of a dozen LC problems.",
      "Matrix exponentiation: the same square-and-multiply over matrices yields O(log n) Fibonacci and linear-recurrence terms.",
    ],
    related: ["sqrtx", "super-pow", "count-good-numbers"],
    verify: {
      fn: "myPow",
      wrap: "plain",
      cases: [
        { args: [2.0, 10], expect: 1024 },
        { args: [0.5, 3], expect: 0.125 },
        { args: [-2.0, 3], expect: -8 },
        { args: [2.0, -2], expect: 0.25 },
        { args: [3.0, 0], expect: 1 },
        { args: [0.5, 4], expect: 0.0625 },
      ],
    },
    xp: 20,
  },
  {
    slug: "multiply-strings",
    statement:
      "Two non-negative integers arrive as strings of decimal digits, each up to 200 digits long. Return their product as a string. Converting the operands to integers and multiplying would work in Python — and completely misses the point: do the arithmetic digit by digit, the way you would multiply on paper.",
    examples: [
      { input: 'num1 = "123", num2 = "456"', output: '"56088"' },
      { input: 'num1 = "2", num2 = "3"', output: '"6"' },
      { input: 'num1 = "0", num2 = "5271"', output: '"0"', explanation: "Zero must come back as exactly '0', not an empty or zero-padded string." },
    ],
    constraints: [
      "1 <= num1.length, num2.length <= 200",
      "digits only — no sign, no whitespace",
      "no leading zeros unless the number is zero itself",
      "must not convert the full operands to int",
    ],
    breakdown: [
      "Positional notation is the whole trick. Digit i of num1 carries weight 10^(m−1−i) and digit j of num2 carries 10^(n−1−j); their product lands at weight 10^(m+n−2−i−j) — a FIXED slot of the answer, index i+j+1 counting from the most-significant end of an (m+n)-digit buffer. That is why the product of an m-digit and an n-digit number never needs more than m+n digits, and why the standard solution allocates exactly that array.",
      "So the algorithm is: accumulate every pairwise digit product into position i+j+1, resolving the carry as you go — total = digit_product + slot_value; write total % 10 into the slot; add total // 10 into the slot one position left. Three extra lines fold carry propagation into the double loop and keep every slot value small; no separate carry-resolution pass is needed.",
      "The honesty check on brute force: converting the strings to int and back is O(L²) bit arithmetic inside Python's big-int multiply anyway — the exercise is to expose that machinery by hand. Grade-school multiplication costs O(m·n) digit products; Karatsuba (O(L^1.585)) and FFT-based methods beat it for huge inputs, and the follow-up 'can you do better?' is fishing for exactly that name-drop plus the observation that any faster method still has to respect the positional slot map at the digit level.",
    ],
    edges: [
      "Either operand '0' → the product is exactly '0'; the leading-zero strip must never produce an empty string.",
      "A product may occupy only m+n−1 digits (2×3 lands in one slot of a two-slot buffer) — strip leading zeros, don't trim to a fixed length.",
      "Carries can stack: a slot may temporarily hold a value ≥ 10 before its left neighbour's pass normalises it — the algorithm relies on left slots being processed LATER.",
      "Single-digit operands exercise the smallest buffer (size 2) and the zero-strip path.",
    ],
    ladder: [
      { title: "Convert to big ints and multiply", body: "int(num1) * int(num2) — one line, and against both the spirit and the stated letter of the task. Name it as the cheat it is, then don't do it." },
      { title: "Simulate paper multiplication verbatim", body: "For each digit of num2, compute num1's partial product with the appropriate shift, then ADD the partial products with a digit-wise adder. Same O(m·n), but you maintain a list of intermediate strings — more memory, more code, identical math." },
      { title: "The optimal idea — slot accumulation at index i+j+1", body: "One (m+n) int array; every digit pair adds its product at a fixed slot with an immediate carry into i+j. O(m·n) time, O(m+n) space, no partial products, no string surgery." },
    ],
    approach: "Positional slot accumulation (grade-school, array form)",
    code: `def multiply(num1, num2):
    if num1 == "0" or num2 == "0":
        return "0"                          # handle zero up front
    m, n = len(num1), len(num2)
    pos = [0] * (m + n)                     # digit slots, most significant first
    for i in range(m - 1, -1, -1):          # right-to-left over num1
        for j in range(n - 1, -1, -1):      # right-to-left over num2
            prod = (ord(num1[i]) - 48) * (ord(num2[j]) - 48)
            p, q = i + j, i + j + 1         # carry slot, digit slot
            total = prod + pos[q]           # add what this slot already holds
            pos[q] = total % 10             # keep the low digit here
            pos[p] += total // 10           # push the carry one slot left
    out = "".join(map(str, pos)).lstrip("0")
    return out or "0"                       # unreachable after the guard; keeps it total`,
    walkthrough: [
      "The double loop's index algebra does the heavy lifting: pair (i, j) writes its product's low digit at buffer index i+j+1 and its carry at i+j. Iterating both operands from the least-significant digit guarantees that when a slot plays the 'q' role, everything that will ever carry into it from the right has already been added — so its final value is settled on that pass.",
      "Trace '123' × '456': the first pair (i=2, j=2) computes 3×6 = 18 → slot 5 holds 8, carry 1 lands in slot 4. Next (2,1): 3×5 = 15 plus the 1 sitting in slot 4 → 16 → slot 4 becomes 6, carry 1 into slot 3. The carries keep marching left across later pairs; the buffer finishes as 056088, which strips to '56088'.",
      "Why the buffer is exactly m+n long: the largest possible product, (10^m − 1)(10^n − 1), is below 10^(m+n). The leading slot may well be 0 (2 × 3 occupies only slot 1 of its two-slot buffer), which is why the strip exists rather than a fixed-length join. Total work is m·n multiply-adds — a child's multiplication with the partial products folded into one array instead of stacked rows.",
    ],
    time: "O(m·n) — every digit pair multiplied once",
    space: "O(m+n) — the slot buffer",
    followUps: [
      "Signed operands: multiply the magnitudes and prepend '-' iff exactly one operand is negative — the digit machinery is untouched.",
      "Karatsuba splits each operand in half and needs THREE sub-products instead of four, cutting the exponent from 2 to ~1.585 — the classic divide-and-conquer upgrade to discuss.",
    ],
    related: ["add-strings", "add-binary", "plus-one"],
    verify: {
      fn: "multiply",
      wrap: "plain",
      cases: [
        { args: ["2", "3"], expect: "6" },
        { args: ["123", "456"], expect: "56088" },
        { args: ["0", "52"], expect: "0" },
        { args: ["9", "9"], expect: "81" },
        { args: ["999", "999"], expect: "998001" },
        { args: ["123456789", "987654321"], expect: "121932631112635269" },
      ],
    },
    xp: 20,
  },
  {
    slug: "detect-squares",
    statement:
      "Design a collector for points on an integer grid. add(point) records a point — duplicates allowed, they accumulate. count(point) reports how many axis-aligned squares with positive side length have the query point as ONE corner and recorded points at the other three corners; multiplicities count, so a square whose corners were added k times is counted once per distinct way to pick those corners.",
    examples: [
      { input: 'add([1,2]), add([2,1]), add([2,2]) then count([1,1])', output: "count → 1", explanation: "The added points are the other three corners of the unit square with corner (1,1)." },
      { input: 'add([1,2]), add([2,1]), add([2,2]) then count([3,4])', output: "count → 0", explanation: "No recorded set of points forms a square having (3,4) as a corner." },
      { input: 'add([0,0]), add([0,0]), add([0,1]), add([1,0]) then count([1,1])', output: "count → 2", explanation: "The duplicate (0,0) doubles the count — two distinct ways to choose the diagonal corner." },
    ],
    constraints: [
      "up to 500 calls to add and count combined",
      "coordinates are integers with magnitude up to 10^9",
      "a square must have positive side length — degenerate (zero-size) squares don't count",
    ],
    breakdown: [
      "Think of the query point Q as a corner and ask which recorded point could be the OPPOSITE (diagonal) corner P. For an axis-aligned square the diagonal from Q to P must sit at 45°: P = (x ± d, y ± d) with the same d — equivalently |px − x| == |py − y| and P ≠ Q. Once P is fixed the square is completely determined: its other two corners are (px, y) and (x, py). One lookup each — no enumeration of squares at all.",
      "That reduction turns counting into a product over diagonal candidates. Scan the stored points; for each P with |dx| == |dy| ≠ 0, multiply three multiplicities: copies of P, copies of (px, y), copies of (x, py). Summing over all diagonal candidates counts every square exactly once — each square has exactly one diagonal through Q, so it is credited under exactly one P. Duplicated points multiply straight in, which is why the duplicate example doubles the answer.",
      "The data structure is embarrassingly simple — a hash map from (x, y) to its multiplicity — and that is the lesson: geometry problems often die on the indexing, not the math. Enumerating triples of points is O(k³) per query; the diagonal-candidate scan is O(k) per count() with O(1) expected map operations. A plain list of points also works but re-derives multiplicities the hard way with a .count() scan.",
    ],
    edges: [
      "The query point itself may have been added — it must never be treated as its own diagonal partner (the P ≠ Q check), while it still contributes to corner multiplicities like any other point.",
      "d = 0 is excluded: 'square' means positive side length, so a point coinciding with the query adds nothing on its own.",
      "Duplicate adds multiply counts — add([0,0]) twice doubles every square through that corner.",
      "Coordinates up to 10^9 rule out grid-array indexing; only a hash map keyed by the pair is viable.",
    ],
    ladder: [
      { title: "Brute force — enumerate triples", body: "For each count(Q), try every combination of three stored points as the remaining corners and test axis-alignment plus equal sides. O(k³) per query — hopeless at k = 500 with many queries." },
      { title: "Bucket points by coordinate", body: "Group points by x (or y); for the query, scan candidates sharing a coordinate, derive d, and look up the remaining corner. Still O(k) per query but with messier cases (which axis to bucket, ties) — the diagonal framing is cleaner." },
      { title: "The optimal idea — diagonal candidates from a multiplicity map", body: "count(Q) scans the map for P with |px−x| == |py−y| ≠ 0 and adds cnt[P]·cnt[(px,y)]·cnt[(x,py)]. Every square through Q is credited exactly once; O(k) per count, O(1) per add." },
    ],
    approach: "Multiplicity map + diagonal-corner scan",
    code: `class DetectSquares:
    def __init__(self):
        self.pts = {}               # (x, y) -> how many times added

    def add(self, point):
        key = (point[0], point[1])  # tuple key — lists aren't hashable
        self.pts[key] = self.pts.get(key, 0) + 1

    def count(self, point):
        x, y = point
        total = 0
        for (px, py), c in self.pts.items():        # candidate diagonal partners
            if (px, py) != (x, y) and abs(px - x) == abs(py - y):
                # the square is fixed once its diagonal partner P is chosen
                total += c * self.pts.get((px, y), 0) * self.pts.get((x, py), 0)
        return total`,
    walkthrough: [
      "add is O(1): bump the multiplicity of the tuple key. The map — rather than a list of points — is what makes multiplicities a single .get() instead of a scan, and the tuple matters because JSON-style [x, y] lists are unhashable in Python.",
      "count's loop is a product over diagonal partners. Trace the duplicate case: points (0,0)×2, (0,1), (1,0), query (1,1). Only (0,0) has |dx| == |dy| = 1 while differing from Q; the other two corners are (0,1) and (1,0), each present once → 2 × 1 × 1 = 2. Trace the first example: query (1,1) sees partner (2,2) with corners (2,1) and (1,2) → 1; partners (2,1) and (1,2) fail the |dx| == |dy| test → total 1.",
      "Why no double counting: a square having Q as a corner has exactly ONE diagonal through Q, hence exactly one candidate P (the opposite corner) — it is summed once, scaled by the three corner multiplicities. Every term is non-negative, so nothing cancels, and zero-multiplicity lookups via .get(..., 0) silently skip absent corners.",
    ],
    time: "O(1) add · O(k) count, k = distinct stored points",
    space: "O(k) — the multiplicity map",
    followUps: [
      "If count() is called far more than add(), index points by (x − y) and (x + y): diagonal partners of Q satisfy one of those two equations exactly, turning the scan into two bucket lookups.",
      "Count RECTANGLES instead of squares: for each pair of points sharing an x-coordinate, record the y-pair in a map — the answer is the sum of C(v, 2) over repeated y-pairs, the classic rectangle-count trick.",
    ],
    related: ["design-hashmap", "insert-delete-getrandom-o1", "time-based-key-value-store"],
    verify: {
      fn: "DetectSquares",
      wrap: "class",
      voidOps: ["add"],
      cases: [
        { args: [[["add", [1, 2]], ["add", [2, 1]], ["add", [2, 2]], ["count", [1, 1]], ["count", [3, 4]]]], expect: [1, 0] },
        { args: [[["add", [0, 0]], ["add", [0, 1]], ["add", [1, 0]], ["add", [0, 0]], ["count", [1, 1]]]], expect: [2] },
        { args: [[["add", [5, 5]], ["add", [9, 9]], ["add", [5, 9]], ["add", [9, 5]], ["count", [5, 5]], ["count", [9, 9]]]], expect: [1, 1] },
        { args: [[["add", [1, 1]], ["add", [2, 2]], ["add", [1, 2]], ["add", [2, 1]], ["count", [2, 2]]]], expect: [1] },
        { args: [[["add", [0, 0]], ["count", [7, 7]]]], expect: [0] },
      ],
    },
    xp: 20,
  },
  {
    slug: "sqrtx",
    statement:
      "Return the largest integer whose square is at most x — the floor of √x — for a non-negative 32-bit integer x. No exponent operators, no math.sqrt, no built-in that would do the search for you.",
    examples: [
      { input: "x = 8", output: "2", explanation: "2² = 4 ≤ 8 < 9 = 3², so the answer is 2, not 3." },
      { input: "x = 4", output: "2", explanation: "Perfect squares return exactly their root." },
      { input: "x = 0", output: "0" },
    ],
    constraints: ["0 <= x <= 2^31 - 1", "no built-in exponent or sqrt"],
    breakdown: [
      "The problem is a monotone predicate in disguise: 'mid² ≤ x' is false, false, …, true, …, true as mid grows — false below the root, true at and above it. Binary search on that boundary is O(log x) with no floating point anywhere. Floating-point sqrt then floor (int(math.sqrt(x))) is the classic wrong answer: near 2^31 the double's 53-bit mantissa can round 46340.999… upward and the floor lands one too high — the top of this range is exactly where doubles run out of exact integers.",
      "The search space can be halved up front: for x ≥ 2 the root is at most x // 2 (√x ≤ x/2 holds for x ≥ 4, and x = 2, 3 both have root 1 = x//2). So lo = 1, hi = x // 2 is a tight, safe frame, with x < 2 returning x directly. Newton's method (x_{k+1} = (x_k + x/x_k)/2) converges quadratically and is the other accepted optimal — but its integer form needs a convergence guard (stop when the value stops decreasing), which is more delicate than the binary search's fixed loop.",
      "The 'record and keep going' pattern is the part to internalise: whenever mid² ≤ x, mid is a VALID answer but a larger one may exist — save it (ans = mid) and move lo up. When mid² > x, mid is too big and so is everything above — move hi down. The loop ends with ans holding the largest validated mid. This exact shape returns rightmost-true for ANY monotone predicate; sqrt is just its most famous instance.",
    ],
    edges: [
      "x = 0 and x = 1 — the only cases where the answer equals x; the early return handles them, since hi = x//2 = 0 would never validate x = 1.",
      "x = 2^31 − 1: mid*mid must not overflow a signed 32-bit int in C/Java — Python is immune, but the interviewer wants the overflow named.",
      "Perfect squares sit exactly on the boundary: 8 → 2 while 9 → 3; the predicate mid² ≤ x places the cut correctly for both.",
      "hi = x//2 needs its one-line justification (√x ≤ x/2 for x ≥ 4; roots of 2 and 3 equal 1 = x//2) — an unjustified hi = x also works, at the cost of one extra iteration.",
    ],
    ladder: [
      { title: "Linear scan", body: "i = 0, 1, 2, … until i² > x; answer i − 1. O(√x) — about 46341 iterations at x = 2^31 − 1; fine in a pinch, embarrassing as a final answer." },
      { title: "Floating-point sqrt then floor", body: "int(math.sqrt(x)) — one line, and wrong near the top of the range when the double rounds across an integer boundary; also usually banned by the no-built-ins rule." },
      { title: "The optimal idea — binary search the integer boundary", body: "Search [1, x//2] for the largest mid with mid² ≤ x, recording candidates. O(log x) iterations, pure integer arithmetic, no precision cliff." },
    ],
    approach: "Binary search on the answer (rightmost-true)",
    code: `def mySqrt(x):
    if x < 2:
        return x                # sqrt(0)=0, sqrt(1)=1 — outside the search frame
    lo, hi, ans = 1, x // 2, 1  # for x >= 2, floor(sqrt(x)) <= x // 2
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid <= x:
            ans = mid          # mid qualifies — a bigger one may still exist
            lo = mid + 1
        else:
            hi = mid - 1       # mid is too big; so is everything above
    return ans`,
    walkthrough: [
      "The invariant: every integer below lo has its square ≤ x (or was excluded for good), and every integer above hi has its square > x. ans caches the best qualifying mid seen so far. When the frame empties, ans is the rightmost true — the floor of the root.",
      "Trace x = 8: frame [1, 4]. mid 2 → 4 ≤ 8: ans = 2, lo = 3. mid 3 → 9 > 8: hi = 2. Frame empty → 2. Trace x = 2147483647: the loop narrows to 46340, since 46340² = 2147395600 ≤ 2147483647 < 2147488281 = 46341². About 24 halvings — versus 46341 for the linear scan.",
      "Why integers only: mid*mid is exact in Python's arbitrary precision. In Java/C the same expression at mid ≈ 46341 overflows a 32-bit int — cast to long first. That overflow, not the search itself, is the historical source of wrong answers on this problem.",
    ],
    time: "O(log x) — the frame halves every iteration",
    space: "O(1) — three integers",
    followUps: [
      "Newton's method on integers: x ← (x + x_0 // x) // 2 iterated until it stops decreasing, then floor — quadratic convergence (~5 iterations at 32-bit range) but a fussier termination condition.",
      "Generalise the shape: 'largest n with predicate(n) true' is the same loop behind first-bad-version, minimum-eating-speed, and capacity-to-ship-packages — binary search on the ANSWER space.",
    ],
    related: ["first-bad-version", "search-insert-position", "powx-n"],
    verify: {
      fn: "mySqrt",
      wrap: "plain",
      cases: [
        { args: [0], expect: 0 },
        { args: [1], expect: 1 },
        { args: [4], expect: 2 },
        { args: [8], expect: 2 },
        { args: [24], expect: 4 },
        { args: [2147483647], expect: 46340 },
      ],
    },
    xp: 10,
  },
  {
    slug: "max-points-on-a-line",
    statement:
      "Given n points on a plane as (x, y) integer pairs, return the largest number of them that lie on one single straight line. Points are distinct, and n can be a few hundred — which is what rules out anything smarter than quadratic-plus work.",
    examples: [
      { input: "points = [[1,1],[2,2],[3,3]]", output: "3", explanation: "All three sit on y = x." },
      { input: "points = [[1,1],[3,2],[5,3],[4,1],[2,3],[1,4]]", output: "4", explanation: "(1,4), (2,3), (3,2), (4,1) lie on y = 5 − x." },
      { input: "points = [[0,0]]", output: "1" },
    ],
    constraints: [
      "1 <= points.length <= 300",
      "-10^4 <= x, y <= 10^4",
      "all points are distinct",
    ],
    breakdown: [
      "Any two distinct points determine exactly one line, so the natural frame is: fix one point P as an ANCHOR and classify every other point by the line it forms with P. Points landing in the same class are collinear with each other AND with P — that is the transitivity the anchor buys you: you never test triples, only pairs against a common origin. The best line through P is the biggest class plus one (for P itself); the global answer is the max over anchors.",
      "The math that makes the classes well-defined is slope NORMALISATION. The slope dy/dx as a float collides (1/3 vs 0.333…) and drifts; the pair (dx, dy) reduced by g = gcd(dx, dy) is exact — but one more step is needed: (1, 2) and (−1, −2) are the same line direction through the anchor yet reduce to different pairs. Canonical sign fixes it: force dx > 0, or dx == 0 with dy > 0 for verticals, so every direction has exactly one representative. Miss this and the same line splits into two buckets whenever points sit on both sides of the anchor — a silent undercount.",
      "Complexity check: n anchors × (n−1) classifications with a gcd each is O(n² log C) — under about 10^5 pair operations at n = 300, comfortably fast, with O(n) extra space per anchor for the slope map. The floating-point version (slope as a double, verticals special-cased) is the standard wrong turn: equal slopes can hash differently after rounding, and coordinates from a 10^4 grid make collisions real. Exact integer keys make the algorithm deterministic — that is the difference between 'usually right' and provably right.",
    ],
    edges: [
      "Vertical lines: dx = 0 — division is impossible, and the sign rule needs the dx == 0 → dy > 0 tiebreak so (0, 5) and (0, −5) collide correctly.",
      "Two points → 2 (any pair is a line); one point → 1; the n ≤ 2 early return covers both.",
      "Points on BOTH sides of the anchor: without sign canonicalisation, (−1, −2) and (1, 2) from the same anchor split one line into two buckets.",
      "Horizontal lines are just slope (1, 0) after reduction — no special case needed once verticals are handled.",
    ],
    ladder: [
      { title: "Brute force — test every triple", body: "Three nested loops checking collinearity via the cross-product (x₂−x₁)(y₃−y₁) − (y₂−y₁)(x₃−x₁) == 0. O(n³) — 300 points is ~4.5 million triples; survivable, but you can do far better." },
      { title: "Float slopes per anchor", body: "Anchor each point, group by dy/dx as a double, special-case verticals. O(n²) but numerically unsound — rounded slopes can split one line or merge two; fails adversarial tests." },
      { title: "The optimal idea — anchor + gcd-normalised exact slope keys", body: "For each anchor, map the sign-canonical reduced pair (dx, dy) to a count; the answer through the anchor is max count + 1. Exact integer arithmetic, O(n² log C) time, O(n) space." },
    ],
    approach: "Per-anchor slope map with gcd-normalised keys",
    code: `from math import gcd
def maxPoints(points):
    n = len(points)
    if n <= 2:
        return n                    # 1 or 2 points are trivially one line
    best = 0
    for i in range(n):              # anchor: every point gets its turn
        x1, y1 = points[i]
        slopes = {}                 # normalised (dx, dy) -> count
        for j in range(i + 1, n):
            x2, y2 = points[j]
            dx, dy = x2 - x1, y2 - y1
            g = gcd(dx, dy)         # Python's gcd is positive even for negatives
            dx //= g; dy //= g      # reduce to the smallest integer direction
            if dx < 0 or (dx == 0 and dy < 0):
                dx, dy = -dx, -dy   # canonical sign: one key per line direction
            slopes[(dx, dy)] = slopes.get((dx, dy), 0) + 1
        for c in slopes.values():
            best = max(best, c + 1) # +1 for the anchor itself
    return best`,
    walkthrough: [
      "The inner loop's j > i start means each unordered pair is classified exactly once across the whole run — at anchor i you only see points 'to the right' in index order. That is still enough: for the best line with k points, take its LOWEST-indexed member as anchor — every other member has a higher index and lands in that anchor's single slope bucket, so best ≥ k is witnessed by that anchor.",
      "Trace example 2 at anchor (1,4): (3,2) gives (2,−2) → reduced (1,−1); (4,1) gives (3,−3) → (1,−1); (2,3) gives (1,−1); (5,3) gives (4,−1); (1,1) gives (0,−3) → sign-fixed to (0,1). Buckets: (1,−1) → 3, (4,−1) → 1, (0,1) → 1. Best = 3 + 1 = 4 — the four points on y = 5 − x, found without ever writing the line's equation down.",
      "The gcd sign subtlety: Python's math.gcd(−2, 2) returns 2 (positive), so the reduction itself never introduces a flip — the canonicalisation afterwards is purely about choosing ONE of the two opposite reduced pairs. Forgetting it doesn't crash; it undercounts, which is far more dangerous because tests whose points all sit on one side of every anchor still pass.",
    ],
    time: "O(n² log C) — n anchors, one gcd per pair (C = coordinate bound)",
    space: "O(n) — one slope map per anchor, discarded after use",
    followUps: [
      "Report the actual best line: remember one representative point per slope key at each anchor, then reconstruct the two-point definition from the winning bucket.",
      "If duplicate points were allowed (they're banned here), count copies of the anchor separately and add that number to every bucket at the anchor.",
    ],
    related: ["detect-squares", "minimum-area-rectangle", "line-reflection"],
    verify: {
      fn: "maxPoints",
      wrap: "plain",
      cases: [
        { args: [[[1, 1], [2, 2], [3, 3]]], expect: 3 },
        { args: [[[1, 1], [3, 2], [5, 3], [4, 1], [2, 3], [1, 4]]], expect: 4 },
        { args: [[[0, 0]]], expect: 1 },
        { args: [[[0, 0], [0, 1]]], expect: 2 },
        { args: [[[2, 3], [3, 3], [-5, 3]]], expect: 3 },
        { args: [[[0, 0], [1, -1], [2, -2], [3, 1]]], expect: 3 },
      ],
    },
    xp: 35,
  },
  {
    slug: "fraction-to-recurring-decimal",
    statement:
      "Render the fraction numerator/denominator as a decimal string. Terminating decimals render plainly; repeating decimals put the recurring block in parentheses at the point it first repeats (1/6 = 0.1(6)). Watch the sign — either operand may be negative — and don't lose the integer part.",
    examples: [
      { input: "numerator = 1, denominator = 2", output: '"0.5"' },
      { input: "numerator = 2, denominator = 3", output: '"0.(6)"', explanation: "0.666… has a one-digit repeating block." },
      { input: "numerator = -50, denominator = 8", output: '"-6.25"', explanation: "Truncation, not flooring: −6.25, never −7." },
    ],
    constraints: ["-2^31 <= numerator, denominator <= 2^31 - 1", "denominator != 0"],
    breakdown: [
      "Long division is a deterministic machine: at each step the REMAINDER alone decides every future digit. Multiply the remainder by 10, divide by the denominator for the next digit, keep the new remainder. Two consequences carry the whole solution: a remainder of 0 ends the fraction — it terminates; and a remainder that has appeared before locks you into a cycle whose digits repeat forever, with the cycle START at the position where that remainder first appeared — that is where the '(' goes.",
      "The remainder→position map is the algorithm: record each fresh remainder's index in the output list; on a repeat, splice '(' at the stored index and append ')'. Why must a repeat happen at all? There are only d possible remainders (0 … d−1), so within d fractional digits one either hits 0 or repeats — the loop runs at most d times. No float is ever involved; doubles cannot represent 1/3 exactly and would corrupt the parentheses decision.",
      "The sign and the integer part hide the problem's classic Python trap: // FLOORS (−50 // 8 = −7) while decimal notation truncates toward zero (−6.25). The robust pattern is to decide the sign separately — exactly one negative operand means a leading '-' — then work with absolute values, where // and % behave like truncating division. int(a / b) also truncates, but only by routing through floating point, which is exactly what you're avoiding at 2^31 magnitudes.",
    ],
    edges: [
      "numerator = 0 → '0' regardless of sign — never '-0'.",
      "Exactly one negative operand → leading '-'; two negatives cancel.",
      "Integer-only results (denominator divides numerator) must not print '.0'.",
      "Cycles that begin after a non-repeating prefix (1/6 = 0.1(6)) — the map stores the position of the REMAINDER, which is where '(' belongs, not the position of the repeated digit.",
    ],
    ladder: [
      { title: "Floating-point formatting", body: "str(num / den) — wrong twice: doubles round (1/3 renders as 0.3333333333333333, no recurring notation) and large 32-bit values lose precision. A good cautionary one-liner." },
      { title: "Cycle-hunting with a scanned list", body: "Keep a list of seen remainders and scan it each step for a repeat. The same idea as the map, but O(d²) worst case — the hash map makes each 'have I seen this remainder?' check O(1)." },
      { title: "The optimal idea — remainder→position map in long division", body: "Track remainders once; on a repeat splice the parentheses at the recorded index; on a zero remainder, stop. O(d) steps, O(d) space, exact integer arithmetic end to end." },
    ],
    approach: "Long division with a remainder→position map",
    code: `def fractionToDecimal(numerator, denominator):
    if numerator == 0:
        return "0"                              # no '-0' for zero
    out = []
    if (numerator < 0) != (denominator < 0):    # exactly one negative -> minus
        out.append("-")
    n, d = abs(numerator), abs(denominator)     # magnitudes only from here
    out.append(str(n // d))                     # integer part (// is safe: n, d >= 0)
    rem = n % d
    if rem == 0:
        return "".join(out)                     # clean division — no '.', no '0'
    out.append(".")
    seen = {}                                   # remainder -> index in out
    while rem:
        if rem in seen:                         # cycle starts where rem first appeared
            out.insert(seen[rem], "(")
            out.append(")")
            break
        seen[rem] = len(out)                    # remember this position
        rem *= 10
        out.append(str(rem // d))               # next digit
        rem %= d                                # new remainder
    return "".join(out)`,
    walkthrough: [
      "The prelude handles everything people get wrong before the interesting part: zero short-circuits to '0', the sign XOR appends '-' for exactly one negative operand, and abs() isolates magnitudes so that // and % now compute truncation semantics for free — the flooring trap is disarmed by never flooring a negative.",
      "Trace 1/6: integer part '0', rem = 1. Map {1: 3}, digit 10//6 = 1, rem 4 → '0.1'. Map {1:3, 4:4}, digit 40//6 = 6, rem 4 → '0.16'. Next iteration: rem 4 is in the map at index 4 → insert '(' there, append ')' → '0.1(6)'. The '(' sits before the FIRST digit produced by the repeated remainder — exactly the cycle's start.",
      "Trace 22/7: integer part 3, then remainders generate digits 1, 4, 2, 8, 5, 7 before remainder 1 reappears at its original slot: '3.(142857)'. At most d distinct remainders bound the loop; each entry costs O(1), and the output cannot exceed the digit count — the space is proportional to what you must emit anyway.",
    ],
    time: "O(d) — at most d distinct remainders before termination or a repeat",
    space: "O(d) — the map and the output digits",
    followUps: [
      "Mixed numbers, or a requested repeat count: the same machine, but you cap the loop after k digits and append '…' instead of parentheses.",
      "The inverse problem (recover the fraction from a repeating decimal string) solves x = prefix + cycle/(10^k − 1) — the 9…9 denominator trick.",
    ],
    related: ["divide-two-integers", "fraction-addition-and-subtraction", "water-and-jug-problem"],
    verify: {
      fn: "fractionToDecimal",
      wrap: "plain",
      cases: [
        { args: [1, 2], expect: "0.5" },
        { args: [2, 3], expect: "0.(6)" },
        { args: [1, 6], expect: "0.1(6)" },
        { args: [22, 7], expect: "3.(142857)" },
        { args: [-50, 8], expect: "-6.25" },
        { args: [0, -5], expect: "0" },
      ],
    },
    xp: 20,
  },
  {
    slug: "water-and-jug-problem",
    statement:
      "You have two jugs of capacities x and y litres — unmarked, so you can only fill a jug fully, empty it fully, or pour one into the other until the source empties or the target fills — plus an unlimited water supply. Decide whether some sequence of moves ends with exactly target litres of water in play across the two jugs.",
    examples: [
      { input: "x = 3, y = 5, target = 4", output: "true", explanation: "The classic Die Hard 3 puzzle — a pour sequence really reaches 4." },
      { input: "x = 2, y = 6, target = 5", output: "false", explanation: "Both capacities are even, so every reachable amount is even — 5 never appears." },
      { input: "x = 1, y = 2, target = 3", output: "true", explanation: "Fill both jugs." },
    ],
    constraints: ["0 <= x, y, target <= 10^9", "the answer must not simulate unbounded water levels"],
    breakdown: [
      "The reachable amounts obey an invariant: every quantity you can ever hold — in a jug or in total — is an integer multiple of g = gcd(x, y). The primitive moves change the state by adding or removing a full x or y, or by transferring between jugs; starting from (0, 0), every resulting amount stays in the lattice g·ℤ. Formally, any reachable total t satisfies t = a·x + b·y for integers a, b (fill counts minus empty counts) — and Bézout's identity says the set {a·x + b·y} is exactly the multiples of gcd(x, y).",
      "That is necessity. Sufficiency is the constructive half: if t ≤ x + y and g divides t, a pour sequence achieving t exists — repeatedly fill one jug and dump into the other, and the totals walk through every multiple of g up to x + y. Hence the clean criterion: target is measurable ⟺ target ≤ x + y AND target % gcd(x, y) == 0, with target = 0 trivially true. Two comparisons replace an exponential state space.",
      "Why not just BFS? The state graph — both jug contents — has (x+1)(y+1) nodes with six moves each, which at 10^9 capacities is 10^18 states: even a visited set of that size is fantasy. BFS at small scales is still worth writing once to build trust in the criterion, and it stays in the ladder for exactly that reason. The number-theoretic answer is what scales: Euclid's algorithm is O(log min(x, y)) and everything else is O(1).",
    ],
    edges: [
      "target = 0 → true (the empty jugs already hold 0) — and it must be checked before the gcd, since gcd(0, 0) = 0 would make target % 0 a crash.",
      "target > x + y → false immediately — both jugs full is the physical ceiling.",
      "A jug with capacity 0: gcd(0, y) = y, so the criterion correctly says only multiples of y are measurable.",
      "target = x, target = y, and target = x + y are always measurable (fill one, or fill both) — the criterion agrees, since each is a multiple of g.",
    ],
    ladder: [
      { title: "Brute force — BFS/DFS over jug states", body: "From (a, b) try all six moves (fill x, fill y, empty x, empty y, pour x→y, pour y→x), searching until target appears or states exhaust. Correct and instructive — but O(x·y) states is 10^18 at full constraints." },
      { title: "Tighter search — track one jug's content only", body: "By symmetry, one jug's amount always lies in {(k·x) mod y, (k·y) mod x}, so a BFS over a single jug's residues visits O(x + y) states — a real improvement, still linear in the capacities and hopeless at 10^9." },
      { title: "The optimal idea — Bézout's identity", body: "Measurable ⟺ target ≤ x + y and gcd(x, y) divides target. Necessity from the lattice invariant, sufficiency from the fill-and-pour construction. O(log min(x, y)) via Euclid." },
    ],
    approach: "Bézout: divisibility by gcd(x, y) within capacity",
    code: `from math import gcd
def canMeasureWater(x, y, target):
    if target == 0:
        return True                 # the empty jugs already hold 0
    if target > x + y:
        return False                # both jugs full is the physical ceiling
    return target % gcd(x, y) == 0  # Bézout: reachable iff a multiple of gcd`,
    walkthrough: [
      "Order matters in the three lines, and not for style: the target == 0 check comes first because gcd(0, 0) == 0 in Python and target % 0 raises ZeroDivisionError; the ceiling check comes next because it is a physical fact the gcd cannot express — two jugs can never hold more than x + y no matter how friendly the divisibility. Only then does the Bézout test run.",
      "Trace the classics: x = 3, y = 5, target = 4 → gcd 1 divides 4 and 4 ≤ 8 → true (a pour sequence really reaches 4). x = 2, y = 6, target = 5 → 5 ≤ 8 but gcd = 2 does not divide 5 → false: every reachable total is even, forever. x = 1, y = 2, target = 3 → 3 ≤ 3 and gcd 1 → fill both.",
      "The necessity direction is the invariant argument: fill/empty/pour moves add or remove x's and y's wholesale, so the total is always a·x + b·y — Bézout says exactly the multiples of g. The sufficiency direction is constructive: repeatedly filling one jug and pouring into the other walks the totals through every multiple of g up to x + y. Both directions are one interview sentence each — that economy is why the problem is loved.",
    ],
    time: "O(log min(x, y)) — Euclid's algorithm",
    space: "O(1)",
    followUps: [
      "Reconstruct an actual pour sequence: run the BFS at modest capacities, or follow the constructive proof — fill the smaller jug, pour into the larger, empty when full — which generates totals of the form (k·x) mod y.",
      "Three jugs: the clean divisibility criterion no longer decides reachability — the state graph is now three-dimensional and generally needs search; a nice conversation about where the number theory stops being sufficient.",
    ],
    related: ["fraction-to-recurring-decimal", "coin-change", "check-if-it-is-a-straight-line"],
    verify: {
      fn: "canMeasureWater",
      wrap: "plain",
      cases: [
        { args: [3, 5, 4], expect: true },
        { args: [2, 6, 5], expect: false },
        { args: [1, 2, 3], expect: true },
        { args: [0, 0, 0], expect: true },
        { args: [1, 2, 4], expect: false },
        { args: [34, 5, 6], expect: true },
      ],
    },
    xp: 20,
  },
  {
    slug: "factorial-trailing-zeroes",
    statement:
      "Count the number of trailing zeros in n! (n factorial) — without computing the factorial, which overflows 32 bits from n = 13 onward and has 158 digits at n = 100. The count itself is what's wanted.",
    examples: [
      { input: "n = 5", output: "1", explanation: "5! = 120 — one trailing zero." },
      { input: "n = 10", output: "2", explanation: "10! = 3628800." },
      { input: "n = 0", output: "0", explanation: "0! = 1 has no trailing zeros." },
    ],
    constraints: ["0 <= n <= 10^4", "no computing the factorial itself"],
    breakdown: [
      "A trailing zero is a factor of 10 = 2 × 5, so the question is: how many complete (2, 5) pairs does n! contain? In the prime factorisation of n!, the exponent of 2 always dwarfs the exponent of 5 — every second factor contributes a 2, only every fifth contributes a 5 — so the number of pairs equals the number of 5s. The 2s are free. The whole problem collapses to: how many times does 5 divide n!?",
      "Legendre's formula answers that: the exponent of a prime p in n! is ⌊n/p⌋ + ⌊n/p²⌋ + ⌊n/p³⌋ + … — one term per power. ⌊n/5⌋ counts the multiples of 5 (each donates at least one 5); ⌊n/25⌋ counts the multiples of 25 (which hide a SECOND 5 the first count missed); ⌊n/125⌋ a third, and so on until the power exceeds n. The series has about log₅ n terms — a handful of divisions.",
      "The trap this problem exists to catch is the one-level-short answer: counting only ⌊n/5⌋. At n = 25, ⌊25/5⌋ = 5, but 25! ends in 6 zeros — 25 = 5² donates two fives, and 125 would hide three per multiple. The while-loop form `while n: n //= 5; zeros += n` implements the power ladder without ever computing 5^k: after one cut, n IS ⌊n/5⌋; after two, ⌊n/25⌋ — the running variable does the bookkeeping.",
    ],
    edges: [
      "n = 0 and n < 5 → 0 (the loop adds nothing; 0! = 1 has no zeros).",
      "Powers of 5 are the stress cases: 25 → 6 (not 5), 125 → 31 (25 + 5 + 1).",
      "The loop terminates because n //= 5 strictly decreases toward 0 — no explicit power variable that could overflow in fixed-width languages.",
      "Counting 2s instead would give the same answer, but only after proving the dominance argument — counting 5s needs no proof at all.",
    ],
    ladder: [
      { title: "Brute force — compute n! and count", body: "Multiply the factorial out with big integers, then strip trailing zeros. Explodes fast: 10^4! has over 35 000 digits — the multiplication costs far more than the answer deserves." },
      { title: "Count multiples of 5 only", body: "zeros = n // 5. Right idea, one level short: it misses the second five inside 25, 50, 75, 100… — wrong from n = 25 onward (gives 5, answer 6)." },
      { title: "The optimal idea — Legendre's formula on p = 5", body: "Sum ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + … via the repeated floor-division loop. O(log₅ n) divisions, O(1) space, exact." },
    ],
    approach: "Legendre's formula — count factor-5 contributions",
    code: `def trailingZeroes(n):
    zeros = 0
    while n:
        n //= 5        # one level up the power ladder: 5, 25, 125, ...
        zeros += n     # multiples of 5^k each hide a k-th five
    return zeros`,
    walkthrough: [
      "The loop's variable IS the formula: the first n //= 5 makes it ⌊n/5⌋ — the count of multiples of 5 in n!, each donating one five. The next iteration makes it ⌊⌊n/5⌋/5⌋ = ⌊n/25⌋ (nested floor divisions compose), the count of multiples of 25 donating their second five. It stops when the count hits 0, i.e., when 5^k finally exceeds n.",
      "Trace n = 100: n → 20 (add 20 — multiples of 5), n → 4 (add 4 — multiples of 25), n → 0 (add 0). Total 24 — and 100! indeed ends in 24 zeros. Trace n = 25: 5 + 1 = 6, catching the double-five inside 25 itself, where the naive n // 5 answer of 5 was the wrong rung.",
      "Why the 2s never need counting: the exponent of 2 in n! is ⌊n/2⌋ + ⌊n/4⌋ + …, which term-by-term dominates the exponent of 5 (⌊n/2^k⌋ ≥ ⌊n/5^k⌋ for every k). Zeros are bottlenecked by the scarce factor; the code reflects that asymmetry by counting only fives.",
    ],
    time: "O(log₅ n) — one loop iteration per power of five",
    space: "O(1)",
    followUps: [
      "Inverse problem: for a given count k, find the smallest n with trailingZeroes(n) = k — binary search on n using this function (beware: some k are unreachable, like 5).",
      "Trailing zeros in another base b: factorise b (16 = 2⁴), then take min over its primes of (exponent of p in n!) ÷ (exponent of p in b), floored — the same Legendre machinery with a division cap.",
    ],
    related: ["preimage-size-of-factorial-zeroes-function", "number-of-digit-one", "ugly-number-iii"],
    verify: {
      fn: "trailingZeroes",
      wrap: "plain",
      cases: [
        { args: [0], expect: 0 },
        { args: [3], expect: 0 },
        { args: [5], expect: 1 },
        { args: [10], expect: 2 },
        { args: [25], expect: 6 },
        { args: [100], expect: 24 },
      ],
    },
    xp: 20,
  },
];
