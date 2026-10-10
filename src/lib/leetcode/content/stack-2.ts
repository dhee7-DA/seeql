// Deep-dives — Stack, part 2 (TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const STACK_2: LcDeepDive[] = [
  {
    slug: "simplify-path",
    statement:
      "Given a Unix-style absolute path (it starts with '/'), return its canonical simplified form. '.' means the current directory and '..' moves up one level; consecutive slashes act as one. The result must start with a single '/', carry no trailing slash, and be the shortest equivalent directory path.",
    examples: [
      { input: 'path = "/home/"', output: '"/home"', explanation: "A trailing slash never survives canonicalisation." },
      { input: 'path = "/../"', output: '"/"', explanation: "Moving above the root is a no-op — the root has no parent." },
      { input: 'path = "/a/./b/../../c/"', output: '"/c"', explanation: "b is entered then left, a is entered then left; only c remains." },
    ],
    constraints: [
      "1 <= path.length <= 3000",
      "path is a valid absolute Unix path: letters, digits, '.', '/', '_'",
      "path always starts with '/'",
    ],
    breakdown: [
      "Canonicalisation is decided one segment at a time: split on '/' and every question becomes a token question. Empty segments (from '//' or a trailing slash) and '.' carry no effect, '..' cancels the most recent surviving directory, and anything else is a directory to keep. 'Cancel the most recent' is last-in-first-out by definition — this is a stack problem in costume.",
      "The stack turns each rule into a one-liner. '..' pops when there is something to pop and is a polite no-op at the root; real names push. The stack always holds the canonical directory chain built so far, so the answer is that chain rejoined — and an empty stack means the answer is the root '/', never an empty string.",
      "The classic misstep is patching the string in place with repeated replaces — fragile ordering, and it corrupts legal names like '...' (three dots, a valid directory). Splitting first converts a string problem into a token problem with a clean three-way rule per token. No lookahead, no backtracking, and no character is ever examined twice.",
    ],
    edges: [
      "'..' at the root is a no-op, not an error — guard the pop.",
      "'...' (three dots) is a legal directory name, not an up-level.",
      "Doubled and trailing slashes produce empty split tokens — filter them, don't crash.",
      "An empty result means the root: return '/', never ''.",
    ],
    ladder: [
      { title: "Brute force — rewrite until fixpoint", body: "Repeatedly replace '/x/../' and '/./' patterns until none remain. Correct-shaped but O(n²), and the replace order is a bug farm ('...' must never match the '/..' rule)." },
      { title: "Single pass with a depth counter", body: "Track directory depth as an integer and rewrite in place. O(n) on paper, but the index arithmetic for 'erase back to the previous slash' is exactly the fiddly part the stack removes." },
      { title: "The optimal idea — split, then stack", body: "One split('/') gives tokens; a stack applies the three-way rule; a join rebuilds. O(n) time and space with zero index bookkeeping." },
    ],
    approach: "Split-and-stack canonicalisation",
    code: `def simplifyPath(path):
    parts = []                    # canonical directory chain so far
    for seg in path.split("/"):
        if seg == "" or seg == ".":
            continue              # empty ('//', trailing '/') or 'current dir'
        if seg == "..":
            if parts:
                parts.pop()       # up one level (no-op at the root)
        else:
            parts.append(seg)     # real component — '...' lands here too
    return "/" + "/".join(parts)  # empty chain degenerates to the root`,
    walkthrough: [
      "split('/') on '/a/./b/../../c/' yields ['', 'a', '.', 'b', '..', '..', 'c', ''] — the leading and trailing empties are the boundary slashes. The first branch swallows '' and '.', leaving exactly three rules to implement. Each remaining token is therefore a constant-time decision, and nothing is ever re-examined.",
      "The '..' branch is the heart: after 'b' the stack is [a, b] and the two '..' entries unwind it to []. The pop IS the parent reference — no links, no recursion. At the root the 'if parts' guard makes over-climbing a silent no-op, which is precisely what '/../' needs.",
      "Rebuilding is '/' + '/'.join(parts): for [c] that's '/c', for [] that's '/' alone. Because only real names ever enter the stack, the output cannot contain '//', '/./', or a trailing slash by construction. The two-pass shape (split, then join) keeps the whole algorithm linear.",
    ],
    time: "O(n) — one split, one join",
    space: "O(n) — the segment stack",
    followUps: [
      "Build an in-memory filesystem (mkdir, ls, cd): this canonicaliser becomes a helper and the directory tree a trie.",
      "Support relative paths: seed the stack from a current-directory argument instead of starting empty.",
    ],
    related: ["basic-calculator", "decode-string", "longest-absolute-file-path"],
    verify: {
      fn: "simplifyPath",
      wrap: "plain",
      cases: [
        { args: ["/home/"], expect: "/home" },
        { args: ["/../"], expect: "/" },
        { args: ["/home//foo/"], expect: "/home/foo" },
        { args: ["/a/./b/../../c/"], expect: "/c" },
        { args: ["/..."], expect: "/..." },
        { args: ["/"], expect: "/" },
      ],
    },
    xp: 20,
  },
  {
    slug: "basic-calculator",
    statement:
      "Evaluate an arithmetic expression built from non-negative digits, '+', '-', parentheses, and spaces. '-' may appear as unary negation ('-2' or '-(3+2)'). The expression is guaranteed valid; return its integer value.",
    examples: [
      { input: 's = "1 + 1"', output: "2" },
      { input: 's = "(1+(4+5+2)-3)+(6+8)"', output: "23" },
      { input: 's = "-2+ 1"', output: "-1", explanation: "Leading unary minus: the sign applies to the 2." },
    ],
    constraints: [
      "1 <= s.length <= 3·10^5",
      "s consists of digits, '+', '-', '(', ')', and spaces",
      "s is a valid expression; the answer fits in a 32-bit int",
    ],
    breakdown: [
      "A running-total loop already handles flat chains: accumulate digits into num, and when an operator arrives, fold the COMPLETED number — total += sign * num — then record the new sign. Unary minus falls out for free: a leading '-' fires the fold with num still 0 and just sets sign = -1. The only thing parentheses add is that the enclosing total must be SAVED and later RESTORED, not recomputed.",
      "The checkpoint stack stores exactly that context: on '(' push (total, sign) and reset both; on ')' finish the inner level with one last fold, then graft it back as outer_total + outer_sign * inner_total. This is recursion turned inside-out — the explicit stack replaces the call stack, with no recursion-limit worries at 3·10^5 characters. Stack depth equals parenthesis nesting depth, nothing more.",
      "Resist upgrading to full two-stack shunting-yard. With no '*' or '/' there is no precedence to manage, so the (total, sign) formulation is strictly simpler and far easier to defend in an interview. Spaces match no branch and simply fall through — a non-event by design.",
    ],
    edges: [
      "Unary minus, including right after '(' as in '(-3)' — sign = -1 while num = 0.",
      "Multi-digit numbers — accumulate num = num*10 + digit; int(ch) alone loses digits.",
      "Expressions ending on ')' or on spaces — the final fold still happens in the return line.",
      "'-' between numbers is binary, and the SAME branch handles both cases because the previous number was already folded.",
    ],
    ladder: [
      { title: "Brute force — innermost-bracket rewriting", body: "Find '(...)' groups with no nested brackets, evaluate each as a flat +/- scan, substitute textually, repeat. O(n²) in the worst case, with string-splice bookkeeping throughout." },
      { title: "Recursive descent parser", body: "A tiny grammar (expression → term ('±' term)*) with mutual recursion. Correct and general, but scaffolding-heavy for a two-operator language and bounded by the interpreter's recursion limit." },
      { title: "The optimal idea — (total, sign) checkpoint stack", body: "One pass; '(' saves and resets, ')' folds and grafts. O(n) time, O(d) space for nesting depth d." },
    ],
    approach: "Sign-and-total checkpoint stack",
    code: `def calculate(s):
    total = 0                 # value of the expression level we're inside
    sign = 1                  # sign that will apply to the next number/group
    num = 0                   # number currently being read
    checkpoints = []          # saved (total, sign) for each '(' entered
    for ch in s:
        if ch.isdigit():
            num = num * 10 + int(ch)          # multi-digit accumulation
        elif ch == "+":
            total += sign * num               # fold the finished number
            num, sign = 0, 1
        elif ch == "-":
            total += sign * num               # unary minus: num is 0 here, harmless
            num, sign = 0, -1
        elif ch == "(":
            checkpoints.append((total, sign)) # save the outer context
            total, sign = 0, 1                # fresh slate for the inner level
        elif ch == ")":
            total += sign * num               # finish the inner level
            num = 0
            outer_total, outer_sign = checkpoints.pop()
            total = outer_total + outer_sign * total   # graft it back
        # spaces fall through every branch
    return total + sign * num`,
    walkthrough: [
      "Digits accumulate into num between operators; each operator folds the number that just COMPLETED. The delay is the design: total += sign * num uses the sign seen BEFORE that number, which is exactly what binary '+' and '-' mean. A leading '-' (or one right after '(') fires the same fold with num = 0 — harmless — and leaves sign = -1 armed for whatever follows.",
      "'(' snapshots (total, sign) and resets to a fresh level. ')' completes that level with the final fold, then multiplies the inner total by the saved outer sign and adds it to the saved outer total — the group now behaves as if it were a single number at the outer level. Checkpoint depth tracks nesting exactly, and restore order is automatically correct because parentheses nest LIFO.",
      "The return line matters: a valid expression can end on a digit or on ')'. total + sign * num covers both — after a ')' num is 0 and the addition is a no-op; after a digit it performs the final fold. Trace '(1+(4+5+2)-3)+(6+8)': the inner group returns 11 into a context of total=1, sign=1 giving 12; the '-3' brings 9; the (6+8) group grafts on top for 23.",
    ],
    time: "O(n) — single pass",
    space: "O(d) — one checkpoint per nesting level",
    followUps: [
      "Add '*' and '/' and precedence: that's basic-calculator-ii, where a running total stops working and signed terms on a stack take over.",
      "Support '+' as unary too, or a right-associative '^': at that point a real parser (shunting-yard / recursive descent) is the honest tool.",
    ],
    related: ["basic-calculator-ii", "evaluate-reverse-polish-notation", "valid-parentheses"],
    verify: {
      fn: "calculate",
      wrap: "plain",
      cases: [
        { args: ["1 + 1"], expect: 2 },
        { args: [" 2-1 + 2 "], expect: 3 },
        { args: ["(1+(4+5+2)-3)+(6+8)"], expect: 23 },
        { args: ["-2+ 1"], expect: -1 },
        { args: ["-(3+2)"], expect: -5 },
        { args: ["1-(-7)"], expect: 8 },
      ],
    },
    xp: 35,
  },
  {
    slug: "basic-calculator-ii",
    statement:
      "Evaluate an arithmetic expression of non-negative integers containing '+', '-', '*', '/', and spaces. '*' and '/' bind before '+' and '-', and integer division truncates toward zero (3/2 → 1). The expression is valid; return the integer value.",
    examples: [
      { input: 's = "3+2*2"', output: "7" },
      { input: 's = " 3/2 "', output: "1", explanation: "3/2 truncates toward zero." },
      { input: 's = "14-3/2"', output: "13", explanation: "The pending '-' parks -3 on the term stack; int(-3/2) = -1 truncates, so 14 - 1. Flooring would give 12." },
    ],
    constraints: [
      "1 <= s.length <= 3·10^5",
      "integers in s are non-negative and fit in 32 bits",
      "s is a valid expression; the answer fits in a 32-bit int",
    ],
    breakdown: [
      "Precedence kills the single running total: in '3+5*2' the '+' must wait until it knows the 5 isn't about to be multiplied. Keep UNRESOLVED signed terms on a stack instead. '+x' pushes +x, '-x' pushes −x, and '*x'/'/x' rewrite the term already on top — precedence stops being a global pass and becomes a property of which operator touches the stack's head.",
      "The division trap is the centerpiece, and it bites even with non-negative literals. A preceding '-' parks its sign on the term, so in '14-3/2' the division pops prev = −3. Python's // FLOORS (−3 // 2 = −2, answer 12); the spec wants truncation toward zero (int(−3/2) = −1, answer 13). int(a / b) is the one-line fix; C/Java integer division already truncates, which makes this a characteristically Python bug.",
      "Numbers complete at operator boundaries, not when their digits run out — so track the operator that PRECEDES the number being read. Initialise op = '+', and on each operator character (or end of string) commit num under the OLD op before recording the new one. One pass, no precedence table: the stack encodes the whole grammar.",
    ],
    edges: [
      "Negative division through a signed term: '14-3/2' must truncate toward zero, not floor.",
      "Trailing spaces — the final fold must fire on the last character even when it's a space (the i == last trigger).",
      "A single padded number ' 42 ' — the end-of-string fold commits it; no special case.",
      "Chained division '100/10/2' is left-associative: each '/' rewrites the single top-of-stack term.",
    ],
    ladder: [
      { title: "Brute force — tokenise, then reduce in passes", body: "Split into numbers and operators, collapse every * and / run left-to-right, then sum the remaining +/- terms. O(n) but builds an explicit token list and walks it twice." },
      { title: "Two-stack shunting-yard", body: "Operand stack plus operator stack with a precedence table and an apply-while-higher rule. The fully general calculator engine — more state and more branches than this grammar needs." },
      { title: "The optimal idea — signed-term value stack, delayed fold", body: "One pass, one stack: +/- push signed terms, */ rewrite the top; sum at the end. O(n) time, O(n) worst-case space." },
    ],
    approach: "Signed-term value stack with delayed fold",
    code: `def calculate(s):
    stack = []                # signed terms; their sum is the answer
    num = 0                   # number being accumulated
    op = "+"                  # the operator that PRECEDES num
    last = len(s) - 1
    for i, ch in enumerate(s):
        if ch.isdigit():
            num = num * 10 + int(ch)
        if ch in "+-*/" or i == last:      # num just completed
            if op == "+":
                stack.append(num)
            elif op == "-":
                stack.append(-num)
            elif op == "*":
                stack.append(stack.pop() * num)
            else:                           # "/"
                prev = stack.pop()
                stack.append(int(prev / num))  # truncate toward ZERO, not floor
            op = ch
            num = 0
        # spaces: neither branch fires (except as the final character)
    return sum(stack)`,
    walkthrough: [
      "Each number enters the stack as a signed term under the operator that preceded it: '+' leaves num as-is, '-' parks a negative. '*' and '/' never add a term — they pop the top and push the product or quotient, because those operators bind the previous term tighter than any pending '+'/'-' could. The stack therefore only ever holds finished, precedence-resolved terms, which is why sum() at the end is safe.",
      "The '/' line deserves its comment. prev can be negative purely from a parked sign — '14-3/2' divides −3 by 2 — and int(prev / num) truncates toward zero, matching the math: 14 − (3/2) = 14 − 1 = 13. With // the floor of −1.5 is −2 and the answer silently becomes 12. The constraints guarantee non-negative LITERALS; negativity arrives only through signed terms, which is exactly why casual testing misses the trap.",
      "The delayed fold means an operator is applied only when the NEXT boundary arrives — another operator or the end of the string. That's why the trigger is 'ch in ops or i == last' rather than an else-branch: a trailing space must still fire the pending fold for the number before it. After the loop, sum(stack) adds the signed terms; every sign and precedence decision was already made.",
    ],
    time: "O(n) — one pass, O(1) work per character",
    space: "O(n) — worst case when every term is additive",
    followUps: [
      "Add parentheses (LC 772): checkpoint the (stack, pending-term) pair at '(' or recurse — the two techniques compose cleanly.",
      "Support unary minus: detect '-' at the start or right after another operator/'(' and fold it into the number's sign.",
    ],
    related: ["basic-calculator", "evaluate-reverse-polish-notation", "valid-parentheses"],
    verify: {
      fn: "calculate",
      wrap: "plain",
      cases: [
        { args: ["3+2*2"], expect: 7 },
        { args: [" 3/2 "], expect: 1 },
        { args: [" 3+5 / 2 "], expect: 5 },
        { args: ["14-3/2"], expect: 13 },
        { args: ["1-1*2/4"], expect: 1 },
        { args: ["0-2147483647"], expect: -2147483647 },
      ],
    },
    xp: 20,
  },
  {
    slug: "decode-string",
    statement:
      "Given an encoded string where k[...] means 'repeat the bracketed substring k times' and encodings may nest (e.g. 3[a2[c]]), return the decoded expansion. The input is always well-formed: brackets balance, and every '[' is preceded by a positive integer count.",
    examples: [
      { input: 's = "3[a]2[bc]"', output: '"aaabcbc"' },
      { input: 's = "3[a2[c]]"', output: '"accaccacc"', explanation: "The inner 2[c] expands first; the outer count then triples the whole group." },
      { input: 's = "2[abc]3[cd]ef"', output: '"abcabccdcdcdef"' },
    ],
    constraints: [
      "1 <= s.length <= 30 (input length — the output can be far longer)",
      "s contains only letters, digits, '[', and ']'",
      "repeat counts are positive integers (possibly multi-digit)",
    ],
    breakdown: [
      "Nesting is the tell: opening a bracket must SUSPEND the string being built and resume it — in the same state — after the inner group finishes. 'Suspend now, resume in exactly that order later' is a stack of checkpoints. Each '[' pushes (count so far, string so far); each ']' pops and stitches.",
      "The invariant: cur is always the fully decoded expansion of everything since the last unprocessed '['. On ']', the popped (k, prefix) were waiting precisely for this instant — cur becomes prefix + cur·k and the outer level continues as if a plain substring had appeared. Multi-digit counts just accumulate k = k*10 + digit; '[' resets both accumulators, so sibling groups never bleed into each other.",
      "Recursive descent with an index cursor is equally fast and a perfectly good answer — the state just lives in the call stack instead of an explicit one. The iterative version is usually preferred in interviews: it makes the state machine visible and has no recursion-depth story to defend. Both are linear in input plus output, and output-proportional work is unavoidable.",
    ],
    edges: [
      "Multi-digit counts ('10[a]') — digits accumulate; never int() a single character and move on.",
      "Letters outside any brackets belong to the current level's cur directly ('2[abc]3[cd]ef').",
      "Deep nesting ('2[2[2[a]]]') — each level's (count, prefix) pair must survive intact until its ']' arrives.",
      "Output size can dwarf input size ('10[a]' is 5 chars → 10) — quote complexity in input + output.",
    ],
    ladder: [
      { title: "Brute force — regex find-and-replace", body: "Locate innermost [k...] groups, substitute their expansions, repeat until no brackets remain. O(output²) string copying and fragile regex state." },
      { title: "Recursion with a cursor", body: "parse(i) consumes through its matching ']' and returns (decoded, nextIndex). Same asymptotics; state hides in the call stack, and the cursor plumbing is easy to fumble." },
      { title: "The optimal idea — checkpoint stack of (count, prefix)", body: "Single pass; '[' suspends, ']' resumes with cur = prefix + cur·k. O(n + m) for input n and output m." },
    ],
    approach: "Checkpoint stack of (repeat count, partial string)",
    code: `def decodeString(s):
    stack = []          # (repeat count, partial string) for each '[' entered
    cur = ""            # decoded expansion of the current level
    k = 0               # repeat count being read
    for ch in s:
        if ch.isdigit():
            k = k * 10 + int(ch)        # multi-digit counts accumulate
        elif ch == "[":
            stack.append((k, cur))      # suspend: outer count + outer prefix
            cur, k = "", 0              # fresh slate for the inner level
        elif ch == "]":
            repeat, prefix = stack.pop()
            cur = prefix + cur * repeat # graft the finished group back
        else:
            cur += ch                   # plain letter at the current level
    return cur`,
    walkthrough: [
      "Three character classes, three actions: digits grow k, letters extend cur, brackets change level. On '[' the pair (k, cur) captures everything the outer level will need later — how many times to repeat the group, and what string precedes it. Nothing else about the outer level matters, because the outer level's OWN count and prefix are already safe one frame down the stack.",
      "On ']' the local group is complete — cur holds its full expansion — so the pop supplies prefix + cur·k in one line. Trace '3[a2[c]]': at the inner ']' cur is 'c', so cur becomes 'acc'; at the outer ']' it triples into 'accaccacc'. No re-scanning and no partial states: the invariant does all the work.",
      "'10[a]' reads '1' then '0' into k = 10 because digits accumulate before '[' resets — multi-digit counts are free. The reset on '[' clears BOTH k and cur, so sibling groups at one level cannot contaminate each other. Total work is linear in input plus output; you cannot beat touching each output character once.",
    ],
    time: "O(n + m) — n input characters, m output characters",
    space: "O(n + m) — checkpoint prefixes plus the growing cur",
    followUps: [
      "Encode instead of decode: choosing WHICH groups to compress optimally turns into interval DP.",
      "Iterate the decoded string lazily without materialising it — the pending-stack iterator trick applied to repetition.",
    ],
    related: ["basic-calculator", "mini-parser", "simplify-path"],
    verify: {
      fn: "decodeString",
      wrap: "plain",
      cases: [
        { args: ["3[a]2[bc]"], expect: "aaabcbc" },
        { args: ["3[a2[c]]"], expect: "accaccacc" },
        { args: ["2[abc]3[cd]ef"], expect: "abcabccdcdcdef" },
        { args: ["abc3[cd]xyz"], expect: "abccdcdcdxyz" },
        { args: ["10[a]"], expect: "aaaaaaaaaa" },
        { args: ["abc"], expect: "abc" },
      ],
    },
    xp: 20,
  },
  {
    slug: "asteroid-collision",
    statement:
      "Asteroids line up on one axis. Each value's absolute size is its mass; its sign is its direction — positive moves right, negative moves left. All move at the same speed, so any right-mover eventually meets any left-mover ahead of it: on contact the smaller explodes, equal masses explode together, and survivors keep moving. Return the lineup after all collisions.",
    examples: [
      { input: "asteroids = [5, 10, -5]", output: "[5, 10]", explanation: "-5 meets 10 and loses; 5 never meets anyone." },
      { input: "asteroids = [8, -8]", output: "[]", explanation: "Equal masses annihilate both." },
      { input: "asteroids = [10, 2, -5]", output: "[10]", explanation: "-5 kills 2 first, then loses to 10." },
    ],
    constraints: ["2 <= asteroids.length <= 10^4", "-1000 <= asteroids[i] <= 1000", "asteroids[i] != 0"],
    breakdown: [
      "Collisions require a right-mover with a left-mover somewhere AFTER it. Two same-direction asteroids never meet, and a left-mover positioned before a right-mover is moving AWAY from it. So the only dangerous configuration is a positive asteroid sitting on the stack when a negative one arrives — that pair, and only that pair, must be resolved.",
      "Process left to right keeping a stack of survivors. A new asteroid appends harmlessly UNLESS it moves left while the top moves right; then battle: a smaller top pops and the fight continues (chains are real — one left-mover can plow through several right-movers), an equal top pops and kills the attacker too, a bigger top ends the fight immediately with the attacker destroyed.",
      "The nested while looks quadratic and isn't: every asteroid is pushed at most once and popped at most once over the whole run. That amortised argument — total pops bounded by total pushes — is the sentence interviewers wait for. The stack is also simply the answer under construction: left-movers pool at the bottom, right-movers wait on top for trouble.",
    ],
    edges: [
      "Equal masses: BOTH die — the attacker must not be pushed (the alive flag exists for this).",
      "A left-mover arriving on an empty stack or behind left-movers: no collision, push it ([-2,-1,1,2] passes through untouched).",
      "One left-mover wiping several right-movers in a row — the while must keep fighting, not stop after one kill.",
      "Only (right, then left) order collides; (left, then right) never does — the 'stack[-1] > 0 and a < 0' guards encode this.",
    ],
    ladder: [
      { title: "Brute force — sweep and restart", body: "Scan for the first adjacent colliding pair, explode it, restart from the beginning. Up to O(n²) restarts: [5,4,3,2,1,-10] kills exactly one asteroid per sweep." },
      { title: "Sort by mass — WRONG", body: "Tempting: resolve the smallest masses first. WRONG — it destroys the left-to-right meeting order that alone decides who fights whom. A useful rung to reject out loud." },
      { title: "The optimal idea — survivor stack with a battle loop", body: "One pass; only (right, left) adjacency fights; the while resolves chains. O(n) amortised, and the stack IS the running answer." },
    ],
    approach: "Survivor stack with battle loop",
    code: `def asteroidCollision(asteroids):
    stack = []                    # survivors so far, in order
    for a in asteroids:
        alive = True
        # only a left-mover (a < 0) can hit a right-mover on the stack
        while alive and a < 0 and stack and stack[-1] > 0:
            if stack[-1] < -a:    # top is smaller: it explodes, fight continues
                stack.pop()
            elif stack[-1] == -a: # equal masses: mutual annihilation
                stack.pop()
                alive = False
            else:                 # top is bigger: incoming explodes
                alive = False
        if alive:
            stack.append(a)
    return stack`,
    walkthrough: [
      "Invariant: the stack always holds the settled state of the processed prefix — within it, every left-mover sits below every right-mover, so residents can never collide with each other. A new asteroid threatens that shape in exactly one case: it moves left while the top moves right. Everything else appends and moves on.",
      "The battle compares masses through -a, the incoming mass: top < -a pops the top and loops (the chain continues), top == -a pops both, top > -a destroys the attacker. The alive flag distinguishes 'attacker died' from 'attacker won' — only a surviving attacker is ever appended, and only after the stack stops shrinking.",
      "Trace [10, 2, -5]: -5 finds top 2 < 5 → pop; then top 10 > 5 → the attacker dies; stack [10]. Trace [-2, -1, 1, 2]: no (right, left) adjacency ever forms, so the input passes through unchanged. Cost: each asteroid pushes once and pops at most once, so total work is O(n) despite the nested loop.",
    ],
    time: "O(n) — each asteroid pushed and popped at most once",
    space: "O(n) — the survivor stack",
    followUps: [
      "Report which asteroids exploded and in which collision: bookkeeping around the same battle loop.",
      "Give asteroids different speeds (the 'car fleet' family): survival becomes an arrival-time comparison and the stack returns in that guise.",
    ],
    related: ["car-fleet", "daily-temperatures", "remove-k-digits"],
    verify: {
      fn: "asteroidCollision",
      wrap: "plain",
      cases: [
        { args: [[5, 10, -5]], expect: [5, 10] },
        { args: [[8, -8]], expect: [] },
        { args: [[10, 2, -5]], expect: [10] },
        { args: [[-2, -1, 1, 2]], expect: [-2, -1, 1, 2] },
        { args: [[3, 5, -6]], expect: [-6] },
        { args: [[1, -2, -2, -2]], expect: [-2, -2, -2] },
      ],
    },
    xp: 20,
  },
  {
    slug: "remove-k-digits",
    statement:
      "Given a string of digits representing a non-negative integer and a count k, remove exactly k digits so the remaining number is as SMALL as possible. Return it with no leading zeros; if every digit is removed, return \"0\".",
    examples: [
      { input: 'num = "1432219", k = 3', output: '"1219"', explanation: "Remove 4, 3 and one 2 — the smallest reachable arrangement." },
      { input: 'num = "10200", k = 1', output: '"200"', explanation: "Removing the 1 leaves 0200; the leading zero is stripped." },
      { input: 'num = "10", k = 2', output: '"0"', explanation: "Both digits go — the empty result renders as zero." },
    ],
    constraints: [
      "1 <= k <= num.length <= 10^5",
      "num consists of digits only, with no leading zeros (except '0' itself)",
    ],
    breakdown: [
      "Which digit deserves to die first? One that is BIGGER than its right-hand neighbour — removing it pulls a smaller digit into a higher place value, which strictly shrinks the number. In '1432219' the 4 sits before a 3 and is the first such peak. A left-to-right sweep that repeatedly kills the current peak is precisely a monotonic stack.",
      "The stack holds kept digits and stays non-decreasing while removal budget remains: each new digit pops every strictly bigger digit above it, spending one removal per pop. When the pass ends with budget left over, the digits were non-decreasing — the largest ones sit at the tail, so trim k from the end. That is k rounds of the greedy fused into a single linear pass.",
      "Two finishing rules complete the contract. Strip leading zeros from the joined string ('0200' → '200'), and if nothing survives, the number IS zero — return \"0\", not \"\". Forgetting either one is the canonical wrong-answer on this problem.",
    ],
    edges: [
      "k == len: everything is removed → \"0\", never \"\".",
      "Leading zeros after removal ('10200', k=1 → '0200'): lstrip('0'), then the empty-string fallback.",
      "Strictly increasing digits never pop — leftover k trims the tail ('12345', k=2 → '123').",
      "Equal digits don't pop: deleting a digit equal to its neighbour changes nothing and wastes budget.",
    ],
    ladder: [
      { title: "Brute force — enumerate deletions", body: "Try all C(n, k) subsets of positions to delete and take the minimum value. Hopeless at n = 10^5." },
      { title: "One greedy sweep per removal", body: "Find and delete the first digit bigger than its successor; repeat k times. Correct, O(nk) — and the pattern of WHICH digit dies each round (the current peak) is the seed of the stack version." },
      { title: "The optimal idea — monotonic non-decreasing stack + tail trim", body: "One pass batches all k greedy rounds; leftover budget trims the tail; lstrip and the empty fallback finish the contract. O(n) time and space." },
    ],
    approach: "Monotonic non-decreasing digit stack",
    code: `def removeKdigits(num, k):
    stack = []                # kept digits; non-decreasing while budget lasts
    for digit in num:
        while k and stack and stack[-1] > digit:
            stack.pop()       # a bigger digit before a smaller one: kill it
            k -= 1            # each pop spends one removal
        stack.append(digit)
    if k:                     # digits were non-decreasing: trim the largest tail
        stack = stack[:-k]
    result = "".join(stack).lstrip("0")
    return result or "0"      # empty means the number IS zero`,
    walkthrough: [
      "The pop condition is the greedy rule executed in bulk: stack[-1] > digit means a higher place value holds a bigger digit than a lower one, so deleting it strictly shrinks the number. Popping continues while budget lasts — k rounds of per-removal greedy, fused. The stack therefore trends non-decreasing, the classic monotonic shape.",
      "Leftover budget means no digit was ever bigger than its successor: the string was non-decreasing, so the cheapest removals are the biggest digits, and they all live at the tail — stack[:-k]. Then lstrip('0') enforces the no-leading-zeros rule and 'result or \"0\"' covers the everything-died case. Trace '1432219', k=3: the 4 pops over 3, the 3 pops over 2, a 2 pops over 1 — k hits 0 with the stack reading [1,2,1,9].",
      "The equal case matters: a '2' meeting a stack top of '2' does NOT pop, because deleting an equal digit changes nothing. Every decision compares single characters, so no int() conversions are needed anywhere — '0' < '9' lexically. Overall: one pass, one join, one strip; nothing quadratic ever happens.",
    ],
    time: "O(n) — one pass plus an O(n) trim and join",
    space: "O(n) — the digit stack",
    followUps: [
      "Maximum instead of minimum: flip the pop comparison and trim the smallest tail — same skeleton, opposite direction.",
      "Lexicographically smallest subsequence of length k over arbitrary strings (the general form): the removal budget becomes a length target.",
    ],
    related: ["remove-duplicate-letters", "asteroid-collision", "daily-temperatures"],
    verify: {
      fn: "removeKdigits",
      wrap: "plain",
      cases: [
        { args: ["1432219", 3], expect: "1219" },
        { args: ["10200", 1], expect: "200" },
        { args: ["10", 2], expect: "0" },
        { args: ["9", 1], expect: "0" },
        { args: ["112", 1], expect: "11" },
        { args: ["12345", 2], expect: "123" },
      ],
    },
    xp: 20,
  },
  {
    slug: "remove-duplicate-letters",
    statement:
      "Remove letters from a string so that every distinct letter appears exactly once and the result is the lexicographically SMALLEST such string, preserving the original left-to-right order of whatever survives. (Identical task to LC 1081, smallest-subsequence-of-distinct-characters.)",
    examples: [
      { input: 's = "bcabc"', output: '"abc"' },
      { input: 's = "cbacdcbc"', output: '"acdb"', explanation: "Duplicates vanish; a stays ahead of the surviving c, d and final b." },
      { input: 's = "bab"', output: '"ab"', explanation: "The first b pops (a is smaller and b reappears); the final b cannot be popped." },
    ],
    constraints: [
      "1 <= s.length <= 10^4",
      "s consists of lowercase English letters",
    ],
    breakdown: [
      "Think of remove-k-digits with a per-letter constraint bolted on: a stack top may be popped only if it will appear AGAIN later — a last occurrence is untouchable. The last-occurrence map supplies that certificate: pop the top only while top > current AND last[top] > i. Both conditions are load-bearing; dropping either breaks correctness.",
      "The in-stack set handles duplicates from the other side: if the current letter is already committed, skip it. Skipping is always optimal — the committed copy sits at the best position the greedy has found, and re-adding the letter later would place it after MORE letters, never fewer. One copy per letter, exactly once, by construction.",
      "Together the three pieces form 'greedy with rescission': commit a letter now, UNDO that commit later exactly when you can prove the letter will return. That proof obligation is the difference from remove-k-digits, where budget alone gates removal. The last-occurrence map is what turns a heuristic into airtight greed.",
    ],
    edges: [
      "A letter at its last occurrence is unpoppable even with a smaller letter behind it — the last[top] > i guard.",
      "Letters already in the stack are skipped, not re-added ('abacb' → 'abc': the second 'a' is ignored).",
      "All-identical input ('aaaa') collapses to a single letter.",
      "Every letter's final copy survives automatically: pops require a future occurrence, skips require a present copy.",
    ],
    ladder: [
      { title: "Brute force — enumerate subsequences", body: "All subsets of positions that keep all 26 letters, take the lexicographic minimum. Exponential; a mental model only." },
      { title: "Greedy with full lookahead rescans", body: "Repeatedly pick the smallest letter whose remaining suffix still contains everything unpicked, then contract the string. O(26·n) and correct — its 'does this letter reappear later?' check is the seed of the optimal version." },
      { title: "The optimal idea — monotonic stack + last-occurrence map + in-stack set", body: "One pass: pop bigger rescindable letters, skip duplicates, push. O(n) time, O(alphabet) auxiliary state." },
    ],
    approach: "Monotonic stack with last-occurrence rescission",
    code: `def removeDuplicateLetters(s):
    last = {ch: i for i, ch in enumerate(s)}   # last index of each letter
    stack = []          # result letters so far (minimal prefix)
    in_stack = set()    # letters currently committed
    for i, ch in enumerate(s):
        if ch in in_stack:
            continue                  # a better copy is already placed
        # rescind earlier commits: bigger letters that still occur later
        while stack and stack[-1] > ch and last[stack[-1]] > i:
            in_stack.discard(stack.pop())
        stack.append(ch)
        in_stack.add(ch)
    return "".join(stack)`,
    walkthrough: [
      "The stack accumulates the best result for the prefix processed so far; the set mirrors it for O(1) membership. The while's three guards each carry weight: stack[-1] > ch (rescission helps lexicographically), last[stack[-1]] > i (the popped letter is guaranteed another chance), and stack non-empty. A pop is legal only when the letter WILL come back — that is what guarantees every distinct letter survives exactly once.",
      "Duplicates short-circuit: seeing ch while it's already committed is a skip, never a push. The committed copy sits at the best position the greedy ever offered it, and any later re-addition would place it after more letters — strictly worse. Trace 'cbacdcbc': push c; push b over rescinded c (it recurs); push a over rescinded b; push c; push d; skip c (committed); push b (d is at its last occurrence — unpoppable); skip the final c. Result 'acdb'.",
      "Why the greed is safe: every pop provably reappears, so coverage holds; every skip provably loses nothing; every push places the smallest legal letter at the current position. The last-occurrence map is the certificate that makes rescission sound rather than lucky. Total cost is linear: each index pushes at most once, and every pop consumes a previous push.",
    ],
    time: "O(n) — one pass; each push is paid for by one index",
    space: "O(k) — stack and set over at most 26 distinct letters",
    followUps: [
      "Same problem, different name: LC 1081 smallest-subsequence-of-distinct-characters — recognising problem isomorphs is half the battle.",
      "Generalise to 'smallest subsequence of length k' with duplicates allowed: the budget becomes a count and the rescission test gains a slots-remaining clause.",
    ],
    related: ["remove-k-digits", "smallest-subsequence-of-distinct-characters", "daily-temperatures"],
    verify: {
      fn: "removeDuplicateLetters",
      wrap: "plain",
      cases: [
        { args: ["bcabc"], expect: "abc" },
        { args: ["cbacdcbc"], expect: "acdb" },
        { args: ["cdadabcc"], expect: "adbc" },
        { args: ["abacb"], expect: "abc" },
        { args: ["bab"], expect: "ab" },
        { args: ["aaaa"], expect: "a" },
      ],
    },
    xp: 20,
  },
  {
    slug: "implement-queue-using-stacks",
    statement:
      "Implement a FIFO queue using only stack operations — push to top, pop/peek from top, size, emptiness. push(x) enqueues; pop() removes and returns the FRONT; peek() reads the front; empty() reports emptiness. pop and peek are only called on a non-empty queue.",
    examples: [
      { input: "push(1), push(2), peek(), pop(), empty()", output: "peek → 1, pop → 1, empty → false", explanation: "FIFO: the first element pushed is the first served." },
      { input: "push(5), pop(), empty()", output: "pop → 5, empty → true" },
    ],
    constraints: [
      "1 <= operations <= 100",
      "pop and peek are called only when the queue is non-empty",
      "all values fit in a 32-bit int",
    ],
    breakdown: [
      "One stack reverses order exactly once; a queue needs order preserved. Two stacks reverse twice — identity. So arrivals land on an inbox stack and departures leave from an outbox stack; pouring the inbox into the outbox wholesale converts arrival order into departure order.",
      "The golden rule: pour only when the outbox is EMPTY, and always pour EVERYTHING. Topping up a non-empty outbox interleaves two timelines and silently corrupts FIFO — older elements already waiting would end up behind newer ones. With the rule, each element crosses stacks exactly once in its lifetime.",
      "That 'exactly once' is the amortised argument, and stating it precisely is the interview's centerpiece: a single pop can trigger an O(n) pour, but that pour cannot recur until n new pushes arrive. Charge each pour-step to the push that created the element — every element pays O(1) total, so any sequence of n operations costs O(n). Worst-case per operation is O(n); amortised is O(1); the distinction is the point.",
    ],
    edges: [
      "peek/pop must not re-pour while the outbox still has elements — guard with 'if not outbox'.",
      "empty() must check BOTH stacks: elements hide in the inbox even when the outbox is drained.",
      "Alternating push/pop pours one element per pop — correct, just worth watching in a trace.",
      "Negative and zero values are ordinary payload — nothing in the structure special-cases them.",
    ],
    ladder: [
      { title: "Brute force — rotate on every push", body: "Keep one stack; on push, dump everything to a scratch, push x, dump it all back. O(n) per push, O(1) pop — correct, quadratic overall." },
      { title: "Reverse at pop time", body: "One stack; on pop, move all but the bottom element aside, take the bottom, move everything back. O(1) push, O(n) pop — the mirror cost profile." },
      { title: "The optimal idea — inbox/outbox with empty-guarded pour", body: "Push is O(1); pop/peek pour only when the outbox is dry. Amortised O(1) per operation — the only design that spreads the cost." },
    ],
    approach: "Two-stack inbox/outbox, amortised O(1)",
    code: `class MyQueue:
    def __init__(self):
        self.inbox = []     # arrivals land here
        self.outbox = []    # departures leave from here (reversed)

    def push(self, x):
        self.inbox.append(x)

    def _refill(self):
        # pour ONLY when outbox is empty — and always pour everything
        if not self.outbox:
            while self.inbox:
                self.outbox.append(self.inbox.pop())

    def pop(self):
        self._refill()
        return self.outbox.pop()

    def peek(self):
        self._refill()
        return self.outbox[-1]

    def empty(self):
        return not self.inbox and not self.outbox`,
    walkthrough: [
      "The inbox holds arrivals in arrival order — oldest at the bottom. The pour flips it: inbox.pop() yields the NEWEST first, so appends place the newest at the outbox's bottom and the oldest on top. Two LIFO reversals cancel into FIFO; the front of the queue is simply outbox[-1].",
      "_refill's guard is the correctness core. If the outbox still holds elements, they arrived EARLIER than anything in the inbox, so serving them first is mandatory — pouring now would strand old arrivals behind new ones. Pour-all-or-nothing keeps the two stacks' timelines permanently disjoint, which is why the structure never needs to compare elements.",
      "Cost, precisely: each element is pushed once, poured once, popped once — three O(1) events over its lifetime. Any interleaving of n operations therefore costs O(n) total, i.e. amortised O(1) each, even though one unlucky pop pays O(n) on the spot. empty() checks both stacks because a full inbox over an empty outbox is a queue that simply hasn't been flipped yet.",
    ],
    time: "Amortised O(1) per operation; worst single pop O(n)",
    space: "O(n) — each queued element lives in exactly one stack",
    followUps: [
      "Min-queue: keep a running minimum in each stack and combine on query — the min-stack trick extended across the pour.",
      "The mirror problem (stack from queues) cannot batch its rotations — explaining WHY is the real follow-up question.",
    ],
    related: ["implement-stack-using-queues", "min-stack", "design-circular-queue"],
    verify: {
      fn: "MyQueue",
      wrap: "class",
      voidOps: ["push"],
      cases: [
        {
          args: [[["push", 1], ["push", 2], ["peek"], ["pop"], ["empty"]]],
          expect: [1, 1, false],
        },
        {
          args: [[["push", 5], ["pop"], ["empty"], ["push", 3], ["peek"], ["pop"], ["empty"]]],
          expect: [5, true, 3, 3, true],
        },
        {
          args: [[["push", 1], ["push", 2], ["push", 3], ["pop"], ["pop"], ["push", 4], ["pop"], ["empty"]]],
          expect: [1, 2, 3, false],
        },
        {
          args: [[["push", -1], ["peek"]]],
          expect: [-1],
        },
      ],
    },
    xp: 10,
  },
  {
    slug: "implement-stack-using-queues",
    statement:
      "Implement a LIFO stack using only queue operations — push to back, pop/peek from front, size, emptiness. push(x) pushes; pop() removes and returns the TOP; top() reads the top; empty() reports emptiness. pop and top are only called on a non-empty stack.",
    examples: [
      { input: "push(1), push(2), top(), pop(), empty()", output: "top → 2, pop → 2, empty → false", explanation: "LIFO: the last element pushed is the first served." },
      { input: "push(-3), top(), pop(), empty()", output: "top → -3, pop → -3, empty → true" },
    ],
    constraints: [
      "1 <= operations <= 100",
      "pop and top are called only when the stack is non-empty",
      "all values fit in a 32-bit int",
    ],
    breakdown: [
      "The asymmetry with queue-from-stacks: one queue preserves order, and a stack needs it reversed — so somebody must pay. The single-queue trick pays on push: append x, then rotate the queue len−1 times so x, the newest, sits at the front. pop and top become O(1) reads and removals at the head.",
      "Why len−1 and not len: before rotation the queue reads [oldest … x]; each rotation moves the head to the tail. After n−1 rotations it reads [x, oldest … second-newest] — x first, every other element in its original relative order. Preserving that relative order is what lets repeated pushes compose into a correct stack.",
      "Two-queue shuttles exist (drain into a scratch, swap roles) but they only relocate the cost: O(1) push with O(n) pop, or O(n) push with O(1) pop. Neither beats the other asymptotically, and no rotation can be batched the way the two-stack pour can — every top request genuinely touches all n elements. Naming that trade-off is the real content of this problem.",
    ],
    edges: [
      "First push rotates zero times — len−1 = 0 falls out naturally, no special case.",
      "push after pops rotates by the CURRENT length: shrunk-then-refilled stacks stay correct.",
      "top on a single element returns it; the following pop leaves empty() true.",
      "Zero payloads: top() = 0 must be returned, not treated as 'missing'.",
    ],
    ladder: [
      { title: "Brute force — rebuild around each pop", body: "Copy the queue out, read the last element, rebuild. O(n) per pop/top with allocation churn — a sketch, not a solution." },
      { title: "Two-queue shuttle", body: "Drain n−1 elements into a scratch queue, take the last, swap roles. O(1) push, O(n) pop/top — the mirror cost of the optimal." },
      { title: "The optimal idea — single queue, rotate on push", body: "Append then rotate len−1 times; the newest fronts the queue. O(n) push, O(1) pop/top/empty, one queue of state." },
    ],
    approach: "Single-queue rotate-on-push",
    code: `from collections import deque

class MyStack:
    def __init__(self):
        self.q = deque()

    def push(self, x):
        self.q.append(x)
        for _ in range(len(self.q) - 1):
            self.q.append(self.q.popleft())   # rotate: newest element to the front

    def pop(self):
        return self.q.popleft()               # front == top now

    def top(self):
        return self.q[0]

    def empty(self):
        return not self.q`,
    walkthrough: [
      "push appends x at the back, then dequeues everything ahead of it and re-appends — exactly len−1 rotations. x ends at the head with the older elements behind it in their original relative order; the queue now reads [top, second, …, bottom]. That is the entire stack, viewed from the front of the queue.",
      "Because every push re-establishes that shape, pop and top are trivial: popleft() and q[0]. All the cost lives in push, and every rotation is an honest queue operation — no stack primitive is smuggled in. The count is len−1 precisely so x isn't rotated past itself.",
      "Accounting: push is O(n) (it rotates the whole current content), pop/top/empty are O(1); n pushes cost O(n²) total. At the problem's scale that is fine, and it's the honest price of emulating LIFO with FIFO primitives. The two-queue variant flips which operation pays — worth saying out loud, because 'there is no amortised trick here' is the insight the problem tests.",
    ],
    time: "O(n) push; O(1) pop, top, empty",
    space: "O(n) — one queue holding every element",
    followUps: [
      "Flip the cost profile: O(1) push, O(n) pop/top via a scratch queue at pop time.",
      "Explain why queue-from-stacks gets amortised O(1) but stack-from-queues doesn't: pours can be deferred, rotations cannot.",
    ],
    related: ["implement-queue-using-stacks", "min-stack", "design-circular-queue"],
    verify: {
      fn: "MyStack",
      wrap: "class",
      voidOps: ["push"],
      cases: [
        {
          args: [[["push", 1], ["push", 2], ["top"], ["pop"], ["empty"]]],
          expect: [2, 2, false],
        },
        {
          args: [[["push", -3], ["top"], ["pop"], ["empty"]]],
          expect: [-3, -3, true],
        },
        {
          args: [[["push", 1], ["push", 2], ["push", 3], ["pop"], ["push", 4], ["top"], ["pop"], ["pop"], ["empty"]]],
          expect: [3, 4, 4, 2, false],
        },
        {
          args: [[["push", 0], ["top"], ["pop"], ["empty"]]],
          expect: [0, 0, true],
        },
      ],
    },
    xp: 10,
  },
  {
    slug: "flatten-nested-list-iterator",
    statement:
      "You receive a list whose entries are integers or further lists, nested to arbitrary depth (e.g. [[1,1],2,[1,1]]). Build a lazy iterator over the integers in left-to-right order: next() returns the next integer, hasNext() reports whether one remains — without flattening everything up front.",
    examples: [
      { input: "nestedList = [[1,1],2,[1,1]]", output: "next() → 1, 1, 2, 1, 1; then hasNext() → false" },
      { input: "nestedList = [1,[4,[6]]]", output: "next() → 1, 4, 6; then hasNext() → false" },
      { input: "nestedList = [[]]", output: "hasNext() → false", explanation: "An empty inner list contributes nothing and must be consumed silently." },
    ],
    constraints: [
      "up to 500 top-level entries; values fit in a 32-bit int",
      "nesting depth is finite but arbitrary",
      "next() and hasNext() may be called in any interleaving",
    ],
    breakdown: [
      "The lazy contract bans the cheat — flattening everything in the constructor. Laziness needs a workspace that remembers 'where we are' across calls, and a stack of not-yet-processed items is exactly that workspace. Store the top level REVERSED so stack[-1] is always the next item in reading order.",
      "hasNext's real job is normalisation: while the top is a list, pop it and push its contents back reversed — the next inner item surfaces one layer at a time. An empty inner list pops off and vanishes, contributing nothing. When the top is finally an integer, hasNext answers instantly; next() just pops it.",
      "Framing note: on LeetCode the entries are NestedInteger wrappers probed with isInteger()/getInteger()/getList(), and the same stack would hold those wrappers — isinstance(top, list) simply becomes top.isInteger(). This self-contained version inlines the interface away and works on plain nested lists. The algorithm, laziness guarantees, and complexity are identical either way.",
    ],
    edges: [
      "An empty inner list ([[]]) must be consumed by hasNext — the while-loop eats it without next() ever seeing it.",
      "next() called without a preceding hasNext(): a defensive _advance() inside next() keeps it self-sufficient.",
      "Deep nesting like [1,[2,[3,[4]]]] unwraps one layer per query — amortised linear, not per-call linear.",
      "Negative integers are ordinary integers; only list-ness is special-cased.",
    ],
    ladder: [
      { title: "Brute force — eager flatten in the constructor", body: "Recursively flatten everything up front; next/hasNext become index checks. Same total work, but memory peaks at the full output and the lazy contract is violated." },
      { title: "Recursive generator", body: "Python-specific: yield-from a recursive walk and let next() drive it. Elegant, but the generator chain materialises one frame per nesting level and doesn't translate across languages." },
      { title: "The optimal idea — reversed pending stack, unwrap on demand", body: "Stack of pending items, reversed; hasNext flattens only as far as needed to expose an integer. O(1) amortised per operation." },
    ],
    approach: "Reversed pending stack with lazy unwrapping",
    code: `class NestedIterator:
    def __init__(self, nestedList):
        # reversed so the FIRST element sits on top (stack[-1])
        self.stack = list(reversed(nestedList))

    def _advance(self):
        # unwrap list-tops until an integer (or nothing) is exposed
        while self.stack and isinstance(self.stack[-1], list):
            inner = self.stack.pop()
            self.stack.extend(reversed(inner))   # keep inner order: first on top

    def next(self):
        self._advance()          # defensive: works even if hasNext wasn't called
        return self.stack.pop()

    def hasNext(self):
        self._advance()
        return bool(self.stack)`,
    walkthrough: [
      "__init__ spends O(n) reversing the top level so index −1 is the next item in reading order. From then on the stack is a frontier: integers are ready to serve, lists are unopened packages. Every public method funnels through one normalisation step, _advance, so no caller can ever observe a half-processed state.",
      "_advance's while is the lazy flatten: each iteration pops one nested list and re-pushes its contents reversed, exposing the innermost first item. Work happens only when demanded — a deeply nested wrapper around one integer costs one unwrap layer per query, not the whole subtree up front. The isinstance check is this version's isInteger(); pop-and-extend is getList().",
      "Amortised accounting: every item is pushed exactly once (constructor or unwrap) and popped exactly once (served or unwrapped), so k queries cost O(k + items touched). Once the top is an integer, hasNext is O(1) — the common case in interleaved driving. Against eager flattening the total work is identical; the difference is peak memory and respect for the contract.",
    ],
    time: "O(1) amortised per next()/hasNext(); worst single call O(layers unwrapped)",
    space: "O(n) — the pending frontier (never more than the not-yet-served items)",
    followUps: [
      "Add peek(): cache the _advance() result instead of popping, and serve the cached value on next().",
      "Eager flatten vs lazy stack: write both and argue memory profiles for 'one full pass' versus 'sporadic reads' workloads.",
    ],
    related: ["mini-parser", "flatten-a-multilevel-doubly-linked-list", "decode-string"],
    verify: {
      fn: "NestedIterator",
      wrap: "class",
      cases: [
        {
          args: [[
            ["NestedIterator", [[1, 1], 2, [1, 1]]],
            ["next"], ["next"], ["next"], ["next"], ["next"], ["hasNext"],
          ]],
          expect: [1, 1, 2, 1, 1, false],
        },
        {
          args: [[
            ["NestedIterator", [1, [4, [6]]]],
            ["next"], ["next"], ["next"], ["hasNext"],
          ]],
          expect: [1, 4, 6, false],
        },
        {
          args: [[["NestedIterator", []], ["hasNext"]]],
          expect: [false],
        },
        {
          args: [[["NestedIterator", [[]]], ["hasNext"]]],
          expect: [false],
        },
        {
          args: [[
            ["NestedIterator", [-1, [-2, [-3]]]],
            ["next"], ["next"], ["next"], ["hasNext"],
          ]],
          expect: [-1, -2, -3, false],
        },
      ],
    },
    xp: 20,
  },
];
