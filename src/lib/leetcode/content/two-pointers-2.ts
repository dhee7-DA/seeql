// Deep-dives — Two Pointers, part 2 (TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const TWO_POINTERS_2: LcDeepDive[] = [
  {
    slug: "is-subsequence",
    statement:
      "Given two strings s and t, decide whether s is a subsequence of t — that is, whether you can delete zero or more characters from t (without reordering the rest) so that exactly s remains. Every character of s must appear in t in the same relative order, but not necessarily contiguously.",
    examples: [
      { input: 's = "abc", t = "ahbgdc"', output: "true", explanation: "a, b, c occur in t in that order, with junk characters between them." },
      { input: 's = "axc", t = "ahbgdc"', output: "false", explanation: "There is no x anywhere in t to anchor the middle character." },
      { input: 's = "", t = "ahbgdc"', output: "true", explanation: "The empty string is a subsequence of anything — delete all of t." },
    ],
    constraints: ["0 <= s.length <= 100", "0 <= t.length <= 10^4", "s and t consist of lowercase English letters"],
    breakdown: [
      "Read the definition slowly: order is fixed, gaps are free. You are not looking for a substring and you may not rearrange anything — every character of s must be consumed from t left to right, skipping whatever does not fit. That left-to-right consumption is a perfect fit for a single sweep, because once a character of t has been passed over, no later character of s can ever use it. Any approach that regenerates candidates (building subsequences, or re-scanning t from the start for each character of s) is discarding information the sweep already had.",
      "The two-pointer scan gives each character of t exactly one job: match s[i] or be skipped forever. Pointer j marches through t unconditionally; pointer i advances only when s[i] equals the current t[j]. The greedy 'earliest match' policy is provably safe by an exchange argument: if some valid assignment matches s[i] to a later position, re-matching it to the earliest occurrence can only leave more of t available for the remaining characters of s. So there is no backtracking, no second-guessing, and no dynamic programming needed here.",
      "The classic missteps are order-adjacent. Testing each character of s with membership ('a' in t) checks existence but not position; comparing s[i] to t[i] positionally confuses subsequence with same-length prefix. Another trap is advancing i on a mismatch — that burns a character of s that a later t[j] might have matched. The correct loop never rewinds j and never advances i without a match.",
    ],
    edges: [
      "Empty s is a subsequence of any t (including empty t) → true; the loop-skip path must return i == len(s), not a hardcoded False.",
      "Non-empty s with empty t → false; the while guard has to short-circuit correctly.",
      "Characters of s absent from t entirely ('axc' vs 'ahbgdc') — j must run off the end and fail cleanly.",
      "Order traps like s = 'aec' against t = 'abcde': every letter exists in t, yet c appears before e — position, not membership, decides.",
    ],
    ladder: [
      { title: "Brute force — enumerate subsequences", body: "Generate all 2^|t| subsequences of t and check whether s is among them, or write the naive recursion match(i, j) over both strings. Correct but exponential (or O(|s|·|t|) with memoization) — and it ignores that one left-to-right sweep suffices." },
      { title: "Find-per-character", body: "For each character of s in order, call t.find(ch, from) to locate the next occurrence at or after the previous match position. Linear overall (each find resumes where the last stopped) and compact — but it hides a scan inside a library call and teaches none of the pointer discipline." },
      { title: "The optimal idea — one synchronized sweep", body: "Two pointers, one pass: j always advances, i advances only on a match, success iff i reaches len(s). O(|t|) time, O(1) space, and the exchange argument above proves no valid matching is ever skipped." },
    ],
    approach: "Synchronized two-pointer sweep of t",
    code: `def isSubsequence(s, t):
    i, j = 0, 0
    while i < len(s) and j < len(t):
        if s[i] == t[j]:
            i += 1                # s's pointer advances only on a match
        j += 1                    # t's pointer advances every step, never rewinds
    return i == len(s)            # true iff every char of s was consumed in order
`,
    walkthrough: [
      "The invariant: after j steps, i equals the length of the longest prefix of s that is a subsequence of the first j characters of t. Every character of t gets exactly one chance to match the next needed character of s; if it passes, it is discarded permanently. When the loop ends, either s is exhausted (i == len(s), success) or t is (some character of s never found a partner, failure).",
      "Trace s = 'abc', t = 'ahbgdc': 'a' matches at j = 0, 'b' at j = 2, 'c' at j = 5 — three matches across six steps, and the loop exits with i == 3 → true. Now s = 'aec' against t = 'abcde': 'a' matches at j = 0, then the scan hunts 'e' through b, c, d and finds it at j = 4 — but no c remains after it, so j runs out with i == 2 → false. That trace shows why membership is not enough: every letter of 'aec' exists in t, yet the order fails.",
      "Termination and cost fall straight out of the structure: j increases by exactly 1 every iteration and never decreases, so the loop runs at most len(t) times. i never moves backward, so a match once made cannot be unmade — which is the exchange argument expressed as code. The empty-s case is free: the loop never runs and 0 == 0 returns true without a special case.",
    ],
    time: "O(len(t)) — j sweeps t once while i trails behind it",
    space: "O(1) — two integer indices",
    followUps: [
      "Many queries against one big t: preprocess t into char → sorted position lists and answer each s with repeated binary search for 'next occurrence after index k' — O(|s| log |t|) per query.",
      "If edits were allowed (insert/replace, not just delete), the pointer trick no longer applies — that is edit distance and it needs DP.",
    ],
    related: ["number-of-matching-subsequences", "longest-common-subsequence", "edit-distance"],
    verify: {
      fn: "isSubsequence",
      wrap: "plain",
      cases: [
        { args: ["abc", "ahbgdc"], expect: true },
        { args: ["axc", "ahbgdc"], expect: false },
        { args: ["", "ahbgdc"], expect: true },
        { args: ["b", "abc"], expect: true },
        { args: ["aec", "abcde"], expect: false },
        { args: ["abc", ""], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "reverse-string",
    statement:
      "You are handed a list of characters — a string stored as an array. Reverse its contents so the last character becomes the first, the second-to-last becomes the second, and so on. The requirement that makes it a problem: modify the array in place using O(1) extra memory and return nothing — the mutated array itself is the answer.",
    examples: [
      { input: 's = ["h","e","l","l","o"]', output: '["o","l","l","e","h"]', explanation: "Each character swaps with its mirror partner around the middle." },
      { input: 's = ["H","a","n","n","a","h"]', output: '["h","a","n","n","a","H"]', explanation: "Six characters, three swaps — a and n happen to meet identical partners." },
      { input: 's = ["x"]', output: '["x"]', explanation: "A single character is its own reverse; nothing moves." },
    ],
    constraints: ["1 <= s.length <= 10^5", "s[i] is a printable ASCII character", "must be done in place with O(1) extra memory"],
    breakdown: [
      "Strip away the array dressing and the request is: perform the permutation i ↦ n−1−i using constant workspace. That permutation is an involution — applying it twice restores the original — and it decomposes into disjoint two-cycles (0 with n−1, 1 with n−2, …). Each two-cycle is exactly one swap, which is why reversal costs ⌊n/2⌋ swaps and why any correct solution must visit each symmetric pair exactly once.",
      "The in-place requirement is the actual interview question; without it the answer is one library call. Copying into a second array and copying back is the reflexive answer that fails the constraint, and building a reversed slice allocates too. What survives is swapping mirror pairs from the outside in — the purest two-pointer pattern there is, and the mental model behind reverse-words, palindrome checks, and rotate-array.",
      "The famous bug: looping over ALL indices and swapping s[i] with s[n−1−i] every time. The first half of the pass does the work; the second half quietly undoes it, and the function hands back the original array. It slips past eyeball tests on symmetric inputs like ['a','a'], which is what makes it dangerous. The fix is structural: stop once the pointers meet — loop while l < r.",
    ],
    edges: [
      "Odd length: the middle element maps to itself and must stay put — the l < r guard skips it automatically.",
      "Even length: no middle; exactly n/2 swaps finalize the array.",
      "Single character: the loop body never runs.",
      "The double-swap trap — a full-length loop restores the input; always stop at the crossing.",
    ],
    ladder: [
      { title: "Brute force — reversed copy", body: "Build a reversed copy of the list, then copy it back element by element. O(n) time and O(n) extra space; it violates the constant-memory requirement but establishes the target output." },
      { title: "Library call", body: "s.reverse() (or slice-assignment with a reversed copy) finishes in one line. Fine in production, but as an interview answer it delegates the entire problem and invites the inevitable 'now do it by hand'." },
      { title: "The optimal idea — swap mirror pairs inward", body: "l at the head, r at the tail: swap, step both inward, stop when they meet. ⌊n/2⌋ swaps, one pass, O(1) space — information-theoretically no solution can touch fewer positions." },
    ],
    approach: "Two pointers swapping mirror pairs",
    code: `def reverseString(s):
    l, r = 0, len(s) - 1
    while l < r:
        s[l], s[r] = s[r], s[l]   # one swap finalizes two positions
        l += 1
        r -= 1                    # stop at the middle — over-swapping restores the input
`,
    walkthrough: [
      "The invariant after k iterations: the first k and last k slots hold their final values, and the still-untouched window s[l..r] is exactly what remains to reverse. Each swap finalizes two slots at once, so the window shrinks by two per iteration. When l >= r the window contains zero or one element — and a list of at most one element is already its own reverse.",
      "Trace ['h','e','l','l','o']: swap h↔o → ['o','e','l','l','h'], swap e↔l → ['o','l','l','e','h'], and now l == r == 2 — the middle 'l' never moves, which is correct because position 2 maps to itself. Trace ['H','a','n','n','a','h']: three swaps (H↔h, a↔a, n↔n), two of which look like no-ops but are still correct — swapping equal characters changes nothing. The traces make the ⌊n/2⌋ count tangible: five characters finish in two swaps, six in three.",
      "Python's tuple assignment evaluates the right side first and then binds left-to-right, so s[l], s[r] = s[r], s[l] is an atomic exchange needing no temporary — in languages without that luxury you would juggle one explicitly. Because the function mutates the caller's list object directly, it returns nothing; the harness reads back the same object and observes the reversal. That by-reference contract is exactly what 'in place' means operationally.",
    ],
    time: "O(n) — ⌊n/2⌋ constant-time swaps cover every slot exactly once",
    space: "O(1) — the rearrangement happens inside the caller's array",
    followUps: [
      "Reverse an arbitrary window [i, j] of the array — the same loop with l = i and r = j; it is the primitive that reverses words in a sentence one word at a time.",
      "Recursive formulation: swap the ends, recurse on the interior — identical swap count but O(n) call-stack depth, a good prompt for the time-versus-space conversation.",
    ],
    related: ["reverse-string-ii", "reverse-words-in-a-string", "valid-palindrome"],
    verify: {
      fn: "reverseString",
      wrap: "inPlace",
      cases: [
        { args: [["h", "e", "l", "l", "o"]], expect: ["o", "l", "l", "e", "h"] },
        { args: [["H", "a", "n", "n", "a", "h"]], expect: ["h", "a", "n", "n", "a", "H"] },
        { args: [["x"]], expect: ["x"] },
        { args: [["a", "b"]], expect: ["b", "a"] },
        { args: [["a", "b", "c"]], expect: ["c", "b", "a"] },
        { args: [["z", "z", "z"]], expect: ["z", "z", "z"] },
      ],
    },
    xp: 10,
  },
  {
    slug: "reverse-vowels-of-a-string",
    statement:
      "Given a string, reverse only its vowels: every vowel changes places with another vowel so that the sequence of vowels reads backwards, while all non-vowel characters stay exactly where they are. Vowels are a, e, i, o, u in either case. Return the rebuilt string.",
    examples: [
      { input: 's = "hello"', output: '"holle"', explanation: "The vowel run e…o reverses to o…e; h, l, l never move." },
      { input: 's = "leetcode"', output: '"leotcede"', explanation: "The vowels e,e,o,e at indices 1,2,5,7 read e,o,e,e backwards." },
      { input: 's = "aA"', output: '"Aa"', explanation: "Uppercase vowels count — the pair swaps." },
    ],
    constraints: ["1 <= s.length <= 3·10^5", "s consists of printable ASCII characters", "a vowel is any of 'aeiou' in upper or lower case; 'y' is not a vowel"],
    breakdown: [
      "Read the operation as extract–reverse–reinsert: pull the vowels out of 'leetcode' and you get 'eeoe'; reversing gives 'eoee'; pouring that back into the original vowel slots yields 'leotcede'. Every non-vowel is an anchor pinning its position. So the problem is a selective permutation: positions are fixed, contents swap only within the vowel class.",
      "Doing extract–reverse–reinsert literally costs a vowel buffer plus a rebuilt string. The two-pointer version fuses all three steps into one pass: pointers at both ends skip non-vowels, and whenever BOTH pointers sit on vowels, those two vowels belong at each other's positions — swap them and step inward. The skip-skip-swap rhythm is the same skeleton as valid-palindrome's cleanup loops, with 'is alphanumeric' replaced by 'is a vowel'.",
      "Three practical missteps dominate submissions. Forgetting uppercase vowels breaks 'aA' — the membership set must hold both cases, and 'y' must not sneak in. Assigning to a position of a Python string fails outright because strings are immutable: you work on list(s) and ''.join at the end. And the swap must happen only while l < r — letting the pointers continue past their meeting point would swap every pair twice and hand back the original string.",
    ],
    edges: [
      "No vowels at all ('bcdfg') → returned unchanged; the pointers walk past each other's consonants without ever swapping.",
      "All vowels ('aeiou') → full reversal; every iteration is a swap.",
      "Single character → l == r immediately; the string is its own answer.",
      "Case sensitivity: 'aA' must produce 'Aa' — the vowel set is 'aeiouAEIOU' and nothing else.",
    ],
    ladder: [
      { title: "Brute force — extract, reverse, reinsert", body: "Collect the vowels into a list, reverse that list, rebuild the string filling the vowel slots in order. O(n) time with O(n) extra space for the buffer and the rebuild — correct and easy to say out loud." },
      { title: "Regex one-liner", body: "A [aeiouAEIOU] pattern plus a replacement callback that pops vowels off the reversed list does it in a single re.sub. Compact but opaque, and still linear with hidden allocations inside the regex engine." },
      { title: "The optimal idea — vowel-gated inward swaps", body: "Two pointers over a char list; skip non-vowels, swap vowel pairs, stop at the crossing. One pass, O(1) auxiliary state beyond the unavoidable char buffer, and each character is read at most twice." },
    ],
    approach: "Two pointers with vowel-gated swaps",
    code: `def reverseVowels(s):
    VOWELS = set("aeiouAEIOU")            # both cases; membership is O(1)
    chars = list(s)                       # strings are immutable → edit a list
    l, r = 0, len(chars) - 1
    while l < r:
        if chars[l] not in VOWELS:
            l += 1                        # left pointer hunts its next vowel
        elif chars[r] not in VOWELS:
            r -= 1                        # right pointer hunts its next vowel
        else:
            chars[l], chars[r] = chars[r], chars[l]
            l += 1
            r -= 1                        # a matched vowel pair is settled
    return "".join(chars)
`,
    walkthrough: [
      "The invariant: everything outside the window [l, r] is final. Consonants become final the moment a pointer steps over them (they never move), and vowels become final the moment they take part in a swap. Inside the window, skips change nothing — only swaps move characters, and swaps exchange vowels with vowels, so exactly the vowel slots keep holding vowels.",
      "Trace 'hello': l skips h and lands on e (index 1); r sits on o (index 4); the swap produces 'holle' and closes the window to l = 2, r = 3. Both remaining characters are 'l', so l advances twice and meets r at the middle — loop over, no more swaps. Trace 'leetcode': the vowel pairs (1,7) and (2,5) swap, giving 'leotcede', while the consonant run t-c-d is stepped over without touching anything.",
      "Termination is airtight: every iteration moves at least one pointer inward, so the window shrinks monotonically and the loop is bounded by n steps. Each character is read by at most one pointer per step, and the set makes each vowel test O(1) — the whole scan is linear. The final ''.join is the only real allocation, forced by Python's immutable strings; with a mutable char array (C, or a JS array) the algorithm is genuinely in-place.",
    ],
    time: "O(n) — each pointer crosses its half once, and vowel tests are O(1) set lookups",
    space: "O(n) for the char list that Python's immutable strings force; O(1) auxiliary beyond it",
    followUps: [
      "Swap the gate: the identical skeleton reverses consonants, digits, or any predicate class — only the membership set changes.",
      "Reverse String II generalizes the motion: reverse the first k characters of every 2k block — the same swap machinery, block-stepped.",
    ],
    related: ["reverse-string", "reverse-string-ii", "reverse-words-in-a-string"],
    verify: {
      fn: "reverseVowels",
      wrap: "plain",
      cases: [
        { args: ["hello"], expect: "holle" },
        { args: ["leetcode"], expect: "leotcede" },
        { args: ["aA"], expect: "Aa" },
        { args: ["bcdfg"], expect: "bcdfg" },
        { args: ["aeiou"], expect: "uoiea" },
        { args: ["a"], expect: "a" },
      ],
    },
    xp: 10,
  },
];
