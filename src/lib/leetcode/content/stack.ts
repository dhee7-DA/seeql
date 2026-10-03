// Deep-dives — Stack (6). Original statements/solutions; verified by
// scripts/lc-verify.
import type { LcDeepDive } from "../types";

export const STACK: LcDeepDive[] = [
  {
    slug: "valid-parentheses",
    statement:
      "Given a string of bracket characters '()[]{}', decide whether it is well-formed: every opening bracket must be closed by the SAME type, and closures must happen in the correct nesting order (a '(' can't be closed by ']').",
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "()[]{}"', output: "true" },
      { input: 's = "(]"', output: "false", explanation: "Wrong closing type." },
      { input: 's = "([)]"', output: "false", explanation: "Interleaved nesting violates the order rule." },
    ],
    constraints: ["1 <= s.length <= 10^4", "s consists only of '()[]{}'"],
    breakdown: [
      "The LAST bracket opened must be the FIRST one closed — that sentence is the definition of a stack, and the problem is the classic introduction to it. Push opens; on a close, the top of the stack must be its matching opener.",
      "Three failure modes to cover: close with no opener (stack empty), close with the WRONG opener (mismatch), opener left dangling at the end (stack non-empty). Each is a one-line check; together they are the whole problem.",
      "The map trick — closers as keys pointing at openers — lets the loop branch once ('ch in pairs') instead of listing openers and closers separately.",
    ],
    edges: [
      "A lone closer ']' → false immediately (empty-stack pop).",
      "A lone opener '(' → false at the end (stack non-empty).",
      "Deep nesting like '(((((())))))' — fine; watch that the final return is 'not stack', not 'True'.",
    ],
    ladder: [
      { title: "Brute force — collapse pairs", body: "Repeatedly delete '()', '[]', '{}' substrings until none remain; valid iff the string empties. O(n²) — each pass rescans the string." },
      { title: "Counter of bracket balance", body: "Track a single depth counter. WRONG: it can't see TYPE mismatches ('(]' balances numerically). Interesting to say out loud as a failed approach, then dismiss." },
      { title: "The optimal idea — a stack of expectations", body: "Push openers; on a closer, pop and compare. Empty-pop, mismatch, and leftover-open each fail. O(n) time, O(n) space worst case." },
    ],
    approach: "Stack with a closer→opener map",
    code: `def isValid(s):
    pairs = {")": "(", "]": "[", "}": "{"}
    stack = []
    for ch in s:
        if ch in "([{":
            stack.append(ch)              # expectation pushed
        elif not stack or stack.pop() != pairs[ch]:
            return False                  # close with nothing / wrong type
    return not stack                      # no openers may dangle`,
    walkthrough: [
      "Openers push themselves onto the stack — the stack literally holds 'currently unclosed expectations'. A closer interrogates the most recent one.",
      "The elif covers two failures in one line: an empty stack (closing nothing) and a popped opener that doesn't match the closer's map entry.",
      "The final 'not stack' catches dangling openers — the failure mode people forget. All three modes exercised by the test cases.",
    ],
    time: "O(n) — one pass",
    space: "O(n) — worst case all openers",
    followUps: [
      "Longest valid parentheses substring: stack of indices — this problem grown up.",
      "Generate all valid combinations: backtracking with the same balance invariant.",
    ],
    related: ["generate-parentheses", "longest-valid-parentheses", "min-stack"],
    verify: {
      fn: "isValid",
      wrap: "plain",
      cases: [
        { args: ["()"], expect: true },
        { args: ["()[]{}"], expect: true },
        { args: ["(]"], expect: false },
        { args: ["([)]"], expect: false },
        { args: ["{[]}"], expect: true },
        { args: ["]"], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "min-stack",
    statement:
      "Design a stack that supports push, pop, top, and getMin — where getMin returns the smallest element currently in the stack — all in O(1) time per operation.",
    examples: [
      { input: "push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()", output: "getMin → -3, top → 0, getMin → -2" },
    ],
    constraints: ["-2^31 <= val <= 2^31 - 1", "pop/top/getMin always called on a non-empty stack", "at most 3·10^4 operations"],
    breakdown: [
      "The naive getMin scans the stack — O(n) per call, and the problem explicitly prices O(1). Caching a single 'current min' breaks on pop: after removing the minimum, the previous minimum is unknown.",
      "The insight is to remember the min AT EVERY DEPTH. A second stack of 'min so far' does exactly that: push stores min(new, top-of-mins); pop discards both tops in lockstep. The min at any moment is the top of the mins stack — restoring history automatically on pop.",
      "One pair of stacks, constant work per operation, no cleverness beyond 'remember the running min alongside each element'. Space doubles — the standard price for O(1) queries.",
    ],
    edges: [
      "Duplicate minima: push 3, 3 — both entries record min 3; popping one must still report 3 (the parallel-stack version handles this for free).",
      "First push: the mins stack is empty — guard with 'if not mins'.",
      "Large value ranges — irrelevant to the algorithm.",
    ],
    ladder: [
      { title: "Brute force — scan on getMin", body: "min(self.stack) per query. O(n) per getMin; fails the O(1) contract the problem states." },
      { title: "Single cached min + recomputation on pop", body: "Keep one min; on popping it, rescan for the next. Amortized O(n) worst case — pops of minima get expensive." },
      { title: "The optimal idea — min-per-depth auxiliary stack", body: "A parallel stack stores the running minimum at each depth; both push and pop maintain it in lockstep. O(1) for all four operations." },
    ],
    approach: "Parallel min-stack (min at every depth)",
    code: `class MinStack:
    def __init__(self):
        self.stack = []
        self.mins = []              # running min at every depth

    def push(self, val):
        self.stack.append(val)
        m = val if not self.mins else min(val, self.mins[-1])
        self.mins.append(m)

    def pop(self):
        self.stack.pop()
        self.mins.pop()

    def top(self):
        return self.stack[-1]

    def getMin(self):
        return self.mins[-1]`,
    walkthrough: [
      "push pairs each element with the min of everything up to and including it. mins[-1] is therefore always 'the smallest element currently in the stack' — getMin is a single list index.",
      "pop drops both tops together: the element and the min-as-of-that-depth vanish simultaneously, so the exposed mins[-1] is exactly the min of what remains. History is the data structure.",
      "Duplicate minima cost two entries — correct and unambiguous. A space-optimised variant stores (value, count) pairs or pushes onto mins only when val ≤ current min; the simple version is the right interview default.",
    ],
    time: "O(1) per operation",
    space: "O(n) — two parallel stacks",
    followUps: [
      "Single-stack version storing (val, minSoFar) tuples — same idea, one list.",
      "Max-stack by symmetry; and 'min queue' needs two stacks rotated (the classic amortized queue).",
    ],
    related: ["valid-parentheses", "implement-queue-using-stacks", "daily-temperatures"],
    verify: {
      fn: "MinStack",
      wrap: "class",
      cases: [
        {
          args: [[
            ["push", -2], ["push", 0], ["push", -3],
            ["getMin"], ["pop"], ["top"], ["getMin"],
          ]],
          expect: [-3, 0, -2],
        },
        {
          args: [[["push", 3], ["push", 3], ["getMin"], ["pop"], ["getMin"]]],
          expect: [3, 3],
        },
      ],
    },
    xp: 20,
  },
  {
    slug: "evaluate-reverse-polish-notation",
    statement:
      "Evaluate an arithmetic expression given in Reverse Polish Notation (postfix): operands precede their operator, so '2 1 +' means 3. Valid operators are +, -, *, and /; division must truncate toward zero. The expression is guaranteed valid and has no division by zero; return its value.",
    examples: [
      { input: 'tokens = ["2","1","+","3","*"]', output: "9", explanation: "(2 + 1) * 3." },
      { input: 'tokens = ["4","13","5","/","+"]', output: "6", explanation: "4 + (13 / 5) = 4 + 2 (truncated)." },
      { input: 'tokens = ["10","6","9","3","+","-11","*","/","*","17","+","5","+"]', output: "22" },
    ],
    constraints: ["1 <= tokens.length <= 10^4", "tokens are operators or integers in [-200, 200]"],
    breakdown: [
      "Postfix needs no parentheses and no precedence rules — the order of tokens IS the evaluation order. That makes a stack the natural machine: operands wait on the stack; each operator pops its two operands (right first!), computes, and pushes the result.",
      "Operand ORDER is the classic bug: for '-' and '/', the SECOND pop is the left operand. '13 5 /' pops b=5 then a=13 → 13/5. Swapping them produces silently wrong arithmetic on exactly half the operators.",
      "The division trap: Python's // floors (−13 // 5 = −3), but the problem wants truncation toward zero (−13/5 → −2). int(a / b) truncates. This single line is the difference between passing and failing hidden tests.",
    ],
    edges: [
      "Negative operands written as tokens ('-11') — int() parses them; distinguish from the '-' OPERATOR by membership in the ops set, not by try/except order.",
      "Truncation toward zero for negative division results.",
      "Single-token expression → that number itself.",
    ],
    ladder: [
      { title: "Recursive descent", body: "Parse from the right: a token is either a number or an operator applied to the next two parses. O(n) but re-parses unless memoised; awkward next to the stack version." },
      { title: "Stack, sloppy division", body: "The right structure but a // b — floors instead of truncating; fails on negative quotients. The lesson: RPN is a STACK problem, precision is a TEST problem." },
      { title: "The optimal idea — stack with ordered pops + int() truncation", body: "Pop b then a; dispatch on the operator; push the result. int(a / b) gives truncation-toward-zero. O(n) time, O(n) space." },
    ],
    approach: "Operand stack with ordered pops",
    code: `def evalRPN(tokens):
    stack = []
    ops = {"+", "-", "*", "/"}
    for tok in tokens:
        if tok in ops:
            b = stack.pop()          # right operand pops FIRST
            a = stack.pop()          # left operand second
            if tok == "+":   stack.append(a + b)
            elif tok == "-": stack.append(a - b)
            elif tok == "*": stack.append(a * b)
            else:            stack.append(int(a / b))   # truncate toward 0
        else:
            stack.append(int(tok))   # operand (handles '-11' too)
    return stack[0]`,
    walkthrough: [
      "Every operator consumes exactly two operands and produces one — the stack height after each token is (operands so far − results pending). Validity of the expression guarantees the final stack holds one value.",
      "b pops before a. For commutative + and * it's invisible; for − and / it's everything. The commented pops make the convention impossible to miss.",
      "int(a / b) uses true division then truncates: 13/5 → 2, −13/5 → −2 (whereas −13//5 would give −3). This matches the problem's truncation spec and most languages' integer division.",
    ],
    time: "O(n) — one token at a time",
    space: "O(n) — worst case operand-heavy prefix",
    followUps: [
      "Support unary minus or '^': extend the ops dispatch; arity tracking generalises.",
      "Infix → postfix conversion (Shunting-yard) is the mirror problem — also a stack.",
    ],
    related: ["min-stack", "basic-calculator-ii", "valid-parentheses"],
    verify: {
      fn: "evalRPN",
      wrap: "plain",
      cases: [
        { args: [["2", "1", "+", "3", "*"]], expect: 9 },
        { args: [["4", "13", "5", "/", "+"]], expect: 6 },
        { args: [["10", "6", "9", "3", "+", "-11", "*", "/", "*", "17", "+", "5", "+"]], expect: 22 },
        { args: [["-7"]], expect: -7 },
      ],
    },
    xp: 20,
  },
  {
    slug: "daily-temperatures",
    statement:
      "Given a list of daily temperatures, return an array where answer[i] is how many days until a WARMER day arrives after day i — or 0 if no future day is warmer.",
    examples: [
      { input: "temperatures = [73,74,75,71,69,72,76,73]", output: "[1,1,4,2,1,1,0,0]" },
      { input: "temperatures = [30,40,50,60]", output: "[1,1,1,0]" },
      { input: "temperatures = [30,60,90]", output: "[1,1,0]" },
    ],
    constraints: ["1 <= temperatures.length <= 10^5", "30 <= temperatures[i] <= 100"],
    breakdown: [
      "The naive double loop looks ahead from each day — O(n²), fatal at 10^5. The stack version turns 'look forward' into 'wait backward': keep a stack of days still waiting for warmer weather; each new day RESOLVES every colder day on the stack in one shot.",
      "The monotonic invariant: temperatures on the stack are non-increasing bottom-to-top. A new temperature pops every stack entry strictly colder than it (their wait is over — distance = index difference) and then joins the stack. What remains is the decreasing history that future days must beat.",
      "This is the canonical MONOTONIC STACK pattern — the same skeleton solves Next Greater Element, Largest Rectangle in Histogram, and Stock Span. Learning it here pays off across the whole topic.",
    ],
    edges: [
      "Strictly falling input: the stack grows to n, all answers 0.",
      "The last day always answers 0 (nothing to look at).",
      "Equal temperatures don't pop — 'warmer' is strict.",
    ],
    ladder: [
      { title: "Brute force — look ahead per day", body: "For each i, scan j > i until temperatures[j] > temperatures[i]. O(n²): 10^5 days can mean 5·10^9 comparisons." },
      { title: "Backward scan with next-warmer caching", body: "Iterate right-to-left jumping through the answer array (answer[i+k] chains). Clever, O(n) amortized, but harder to explain than the stack." },
      { title: "The optimal idea — monotonic stack of waiting days", body: "Stack of indices, temps decreasing. Each new day pops every colder day (record distance) and pushes itself. O(n): every index pushes and pops at most once." },
    ],
    approach: "Monotonic decreasing stack of indices",
    code: `def dailyTemperatures(temperatures):
    answer = [0] * len(temperatures)
    stack = []               # indices still waiting for a warmer day
    for i, t in enumerate(temperatures):
        while stack and temperatures[stack[-1]] < t:
            j = stack.pop()  # day j just found its warmer day (i)
            answer[j] = i - j
        stack.append(i)
    return answer`,
    walkthrough: [
      "The stack holds unresolved days in decreasing-temperature order. When day i arrives warmer than the top, that day's question is answered — pop, record the distance, and keep popping: i may resolve several waiting days at once.",
      "Days that never get popped keep their default answer 0 — the array is initialised to zeros precisely so the unresolved need no cleanup.",
      "Each index is pushed once and popped at most once → total work O(n) despite the nested while. The amortised argument is worth stating explicitly in interviews.",
    ],
    time: "O(n) — each index pushed/popped at most once",
    space: "O(n) — the stack (strictly decreasing worst case)",
    followUps: [
      "Next Greater Element to the right: identical skeleton, values instead of distances.",
      "Circular array variant (Next Greater Element II): iterate 2n with modulo — the stack handles the wrap.",
    ],
    related: ["largest-rectangle-in-histogram", "car-fleet", "next-greater-element-i"],
    verify: {
      fn: "dailyTemperatures",
      wrap: "plain",
      cases: [
        { args: [[73, 74, 75, 71, 69, 72, 76, 73]], expect: [1, 1, 4, 2, 1, 1, 0, 0] },
        { args: [[30, 40, 50, 60]], expect: [1, 1, 1, 0] },
        { args: [[30, 60, 90]], expect: [1, 1, 0] },
      ],
    },
    xp: 20,
  },
  {
    slug: "car-fleet",
    statement:
      "Cars drive along a one-lane road toward a target mile marker. Car i starts at position[i] with speed[i] (all positions distinct). A faster car behind a slower one CANNOT pass — it catches up and travels at the slower car's speed from then on; such a cluster is a fleet (a single car is its own fleet). Count the number of fleets that arrive at the target.",
    examples: [
      { input: "target = 12, position = [10,8,0,5,3], speed = [2,4,1,1,3]", output: "3", explanation: "Fleets: {10}, {8}, {0,5,3} — the three rear cars merge." },
      { input: "target = 10, position = [3], speed = [3]", output: "1" },
      { input: "target = 100, position = [0,2,4], speed = [4,2,1]", output: "1", explanation: "Everyone converges before the target." },
    ],
    constraints: ["1 <= position.length <= 10^5", "0 < speed[i] <= 10^6", "positions are unique"],
    breakdown: [
      "Fleet formation is about ARRIVAL TIME, not speed: a car catches the car ahead iff its arrival time would be earlier (it catches up before the target). Compute t_i = (target − position_i) / speed_i for every car.",
      "Sort by position descending (closest to target first), then scan: a car joins the fleet ahead if its arrival time ≤ the fleet's current arrival time; otherwise it becomes a NEW fleet leader, and its time becomes the new bar. Count the leaders.",
      "The trap is integer division: times must be FLOATS (or crossed-multiplied), because 7/2 vs 3/1 decides whether a catch happens. Ties (equal arrival) merge — that's ≤, not <.",
    ],
    edges: [
      "Equal arrival times → same fleet (the ≤ comparison).",
      "A single car → 1.",
      "Times equal only as floats — avoid accumulating error; one division per car is safe.",
    ],
    ladder: [
      { title: "Brute force — simulate collisions", body: "Simulate step-by-step, merging cars that touch. O(n · T) simulation time with hideous edge cases around simultaneous contact. The wrong mental model entirely." },
      { title: "Sort by position, pairwise catch check", body: "For each pair decide whether the rear car catches the front before the target, merging chains. O(n log n) sort plus careful chain logic — conceptually right but fiddly." },
      { title: "The optimal idea — arrival times + leader scan", body: "One division per car; sort descending by position; count 'new leaders' whose arrival strictly exceeds the current fleet's time. O(n log n) time, O(n) space." },
    ],
    approach: "Arrival-time sort with fleet-leader counting",
    code: `def carFleet(target, position, speed):
    pairs = sorted(zip(position, speed))    # by position ascending
    fleets = 0
    slowest = 0.0                           # arrival time of the fleet ahead
    for pos, spd in reversed(pairs):        # nearest the target first
        t = (target - pos) / spd            # FLOAT division — the trap
        if t > slowest:                     # can't catch up → new fleet
            fleets += 1
            slowest = t
    return fleets`,
    walkthrough: [
      "Reversed order scans from the car nearest the target backwards — every car compares itself against the fleet directly ahead of it. slowest holds that fleet's arrival time.",
      "t > slowest means this car arrives LATER than the fleet ahead: it can never catch up, so it leads a new fleet and raises the bar. Otherwise it merges (its exact speed after contact is irrelevant to the count — arrival time is all that matters).",
      "Floats matter: with integer division, times like 7/2 would collapse into 3 and invent or destroy catches. Equal times (t == slowest) merge correctly because the comparison is strict.",
    ],
    time: "O(n log n) — the sort dominates",
    space: "O(n) — the sorted pairs",
    followUps: [
      "Report the fleet sizes: track a count per leader while scanning.",
      "Cars allowed to pass (multi-lane): the problem dissolves — a nice discussion of what the lane constraint buys the math.",
    ],
    related: ["daily-temperatures", "merge-intervals", "sort-list"],
    verify: {
      fn: "carFleet",
      wrap: "plain",
      cases: [
        { args: [12, [10, 8, 0, 5, 3], [2, 4, 1, 1, 3]], expect: 3 },
        { args: [10, [3], [3]], expect: 1 },
        { args: [100, [0, 2, 4], [4, 2, 1]], expect: 1 },
      ],
    },
    xp: 20,
  },
  {
    slug: "largest-rectangle-in-histogram",
    statement:
      "Given bar heights (each of width 1) in a histogram, find the area of the largest rectangle that fits entirely under the bars — its sides must align with bar boundaries, and it may span multiple bars, capped by the shortest bar it covers.",
    examples: [
      { input: "heights = [2,1,5,6,2,3]", output: "10", explanation: "The 5×2 block spanning bars 2–3." },
      { input: "heights = [2,4]", output: "4", explanation: "The single 4-bar." },
      { input: "heights = [2,1,2]", output: "3", explanation: "min-height 1 across all three → 3; better than any single bar." },
    ],
    constraints: ["1 <= heights.length <= 10^5", "0 <= heights[i] <= 10^4"],
    breakdown: [
      "For every bar, ask: how wide can a rectangle of MY height get? It extends left and right across any bar at least as tall, and stops at the first strictly shorter bar. The answer is max over bars of height × width. Brute force finds those bounds by scanning outward per bar — O(n²).",
      "The monotonic stack computes every bar's bounds in one pass. Keep a stack of indices with INCREASING heights. When the current bar is SHORTER, the popped bar has found its right boundary (the current index) and its left boundary (the new stack top after popping). Each bar's width = right − left − 1.",
      "The sentinel trick — append a 0 (or iterate one step past the end) — guarantees every bar gets popped, so no post-loop cleanup pass is needed. Small trick, big clarity win.",
    ],
    edges: [
      "All equal heights: n × min is the answer; the stack pops them all at the sentinel.",
      "Zero heights: they act as natural boundaries; area 0 bars never extend.",
      "Strictly increasing / decreasing inputs — the two degenerate stack shapes.",
    ],
    ladder: [
      { title: "Brute force — bounds per bar", body: "For each bar scan left and right to its boundaries, area = h × span. O(n²) — 10^5 bars is too slow in the worst (monotonic) case." },
      { title: "Divide and conquer", body: "Min bar splits the problem; recurse left and right. Average O(n log n), worst O(n²) on sorted input unless built on a segment tree." },
      { title: "The optimal idea — increasing stack, pop on shorter", body: "One pass; when a bar is shorter than the top, pop and compute that bar's maximal rectangle with both bounds now known. Sentinel flush. O(n) — every index pushes/pops once." },
    ],
    approach: "Monotonic increasing stack with sentinel",
    code: `def largestRectangleArea(heights):
    stack = []               # indices with increasing heights
    best = 0
    for i, h in enumerate(heights + [0]):   # 0 sentinel flushes everyone
        while stack and heights[stack[-1]] >= h:
            height = heights[stack.pop()]
            left = stack[-1] if stack else -1
            best = max(best, height * (i - left - 1))
        stack.append(i)
    return best`,
    walkthrough: [
      "A pop happens exactly when the current bar is shorter — so for the popped bar, i is its right boundary (first strictly shorter to the right) and the new stack top is its left boundary (first strictly shorter to the left, exclusive). Width = i − left − 1 counts only the bars at least as tall as it.",
      "The sentinel 0 at the end is shorter than everything, so the while loop drains the stack: every bar's rectangle gets evaluated even if no natural 'shorter' bar ever arrived.",
      "The '≥ h' in the pop condition handles equal heights by popping early — their rectangles get computed with the LAST of the equal run as the right boundary, which still produces the correct maximum. Each index enters and leaves the stack once: O(n).",
    ],
    time: "O(n) — one push and at most one pop per index",
    space: "O(n) — the stack (monotonic input worst case)",
    followUps: [
      "Maximal rectangle of 1s in a binary matrix: run this per row of accumulated heights — the famous follow-up.",
      "Trapping rain water is the dual question (minima vs maxima) — same stack family.",
    ],
    related: ["daily-temperatures", "trapping-rain-water", "maximal-rectangle"],
    verify: {
      fn: "largestRectangleArea",
      wrap: "plain",
      cases: [
        { args: [[2, 1, 5, 6, 2, 3]], expect: 10 },
        { args: [[2, 4]], expect: 4 },
        { args: [[2, 1, 2]], expect: 3 },
        { args: [[4, 4, 4, 4]], expect: 16 },
      ],
    },
    xp: 35,
  },
];
