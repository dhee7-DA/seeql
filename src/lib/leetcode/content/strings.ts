// Deep-dives — Strings (TI150 uniques + famous extras). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const STRINGS: LcDeepDive[] = [
  {
    slug: "roman-to-integer",
    statement:
      "Roman numerals write numbers using seven letters — I=1, V=5, X=10, L=50, C=100, D=500, M=1000 — normally added left to right. The one wrinkle: when a smaller-valued letter stands BEFORE a larger one, it is subtracted instead (IV is 4, CM is 900). Given a valid numeral with value in 1..3999, return its integer value.",
    examples: [
      { input: 's = "III"', output: "3", explanation: "Three ones added — no smaller-before-larger pairs." },
      { input: 's = "MCMXCIV"', output: "1994", explanation: "M + CM + XC + IV = 1000 + 900 + 90 + 4." },
      { input: 's = "LVIII"', output: "58", explanation: "L + V + III = 50 + 5 + 3." },
    ],
    constraints: ["1 <= s.length <= 15", "s contains only the characters 'IVXLCDM'", "s is a valid numeral with value in [1, 3999]"],
    breakdown: [
      "The whole problem hides in one question: when does a letter mean minus instead of plus? The answer is local — look at the neighbour to the right. If the current letter is worth less than the next one, this letter is the small half of a subtractive pair (IV, IX, XL, XC, CD, CM) and contributes its negation; otherwise it contributes itself. Because validity is guaranteed, that single local rule reproduces every legal numeral exactly.",
      "The misstep is parsing the six subtractive pairs as special two-character tokens with a lookahead mini-parser. It works, but it doubles the branch count for no benefit: comparing values with the next character handles pairs and plain runs in one uniform rule. One pass, no backtracking, and each character is read exactly once.",
    ],
    edges: [
      "Subtractive letters can chain across pairs: 'MCMXCIV' flips sign three times (C, X, I) — the decision must be re-made per character, not once.",
      "A single-character numeral ('I') must not index past the end when peeking right.",
      "Runs like 'III' and 'MMM' never subtract — the comparison is strict (<, not <=).",
      "The input is guaranteed valid, so 'IC' never appears — don't build validation you weren't asked for.",
    ],
    ladder: [
      { title: "Brute force — pair-token parsing", body: "Scan for the six two-letter tokens first (match or string-replace), add their values, then add the remaining singles. Correct but two phases, string rewriting, and an ordering trap ('...' vs '..' in the replace cousin of this idea)." },
      { title: "Right-to-left accumulation", body: "Walk from the right keeping the previous value; subtract when the current value is smaller than the one behind it. Same logic mirrored — a very common interview variant, equally valid." },
      { title: "The optimal idea — one pass, peek right", body: "For each letter, compare its value to the next letter's: smaller → subtract, else add. O(n) time, O(1) space, no preprocessing, no second phase." },
    ],
    approach: "One-pass right-neighbour comparison",
    code: `def romanToInt(s):
    vals = {"I": 1, "V": 5, "X": 10, "L": 50, "C": 100, "D": 500, "M": 1000}
    total = 0
    for i, ch in enumerate(s):
        if i + 1 < len(s) and vals[ch] < vals[s[i + 1]]:
            total -= vals[ch]       # smaller before larger → subtractive half
        else:
            total += vals[ch]       # normal letter, or the big half of a pair
    return total`,
    walkthrough: [
      "Trace 'MCMXCIV': M sees C to its right (1000 < 100 false) → +1000; C sees M → −100; M sees X → +1000; X sees C → −10; C sees I (100 < 1 false) → +100; I sees V → −1; V is last → +5. Sum: 1994. Every subtractive pair is handled exactly at its smaller half, so the larger half is always a plain addition.",
      "The strict inequality is load-bearing: inside a run like 'III' each value equals the next, so all three add. The bounds check i + 1 < len(s) means the final character always adds — a valid numeral can never end mid-pair, so no special case is needed.",
      "Notice the loop never rewrites the string and never backtracks: each character's contribution is decided by one comparison against the next character and then forgotten. That is why the pass is O(n) with O(1) state — just the running total and the value table.",
    ],
    time: "O(n) — one comparison per character",
    space: "O(1) — a 7-entry table and a running total",
    followUps: [
      "Write the inverse (integer-to-roman): greedy over a value table including the six subtractive pairs — see integer-to-roman.",
      "Validate instead of assuming: reject 'IC' or 'VX' by checking that a subtracting letter is one of I, X, C and its partner comes from the legal set.",
    ],
    related: ["integer-to-roman", "reverse-integer", "palindrome-number"],
    verify: {
      fn: "romanToInt",
      wrap: "plain",
      cases: [
        { args: ["III"], expect: 3 },
        { args: ["LVIII"], expect: 58 },
        { args: ["MCMXCIV"], expect: 1994 },
        { args: ["IX"], expect: 9 },
        { args: ["DCXXI"], expect: 621 },
        { args: ["MMMCMXCIX"], expect: 3999 },
      ],
    },
    xp: 10,
  },
  {
    slug: "integer-to-roman",
    statement:
      "Convert a positive integer to its Roman numeral. The system adds the letters I, V, X, L, C, D, M left to right, but uses six subtractive pairs — IV, IX, XL, XC, CD, CM — for the values 4, 9, 40, 90, 400, 900. The valid range is 1 to 3999, and the canonical numeral for each value is unique.",
    examples: [
      { input: "num = 3749", output: '"MMMDCCXLIX"', explanation: "3000 + 700 + 40 + 9, using XL for 40 and IX for 9." },
      { input: "num = 58", output: '"LVIII"', explanation: "50 + 5 + 3." },
      { input: "num = 1994", output: '"MCMXCIV"', explanation: "1000, then CM, XC and IV for 900, 90 and 4." },
    ],
    constraints: ["1 <= num <= 3999"],
    breakdown: [
      "The uniqueness of the output comes from a fixed canonical alphabet: thirteen building blocks M, CM, D, CD, C, XC, L, XL, X, IX, V, IV, I. Every value in 1..3999 decomposes as a greedy sum of these blocks, largest first. Greedy works because the list is built so each block is at least half the one above it — taking the largest block that fits can never block a better decomposition. That property IS what 'canonical' means here.",
      "The tempting wrong turn is composing rules on the fly ('after a D, skip C four times…'), which re-derives the subtractive logic per digit and multiplies branches. Instead, hard-code the table once — pairs included — and the problem collapses into: for each block, how many times does it fit? That is divmod, and the remainder shrinks monotonically to zero.",
    ],
    edges: [
      "Subtractive pairs must be table entries, not afterthoughts: 4 is 'IV' never 'IIII', 40 is 'XL' never 'XXXX'.",
      "Thousands only reach 3 ('MMM') — the 3999 ceiling is what keeps greedy safe and the output bounded at 15 characters.",
      "Zero digits contribute nothing: 1005 must not emit empty '0' tokens — blocks that don't fit append nothing.",
      "Values ending in 9 chain pairs: 1994 uses CM AND XC AND IV in one numeral.",
    ],
    ladder: [
      { title: "Brute force — per-digit case analysis", body: "Split into thousands/hundreds/tens/ones and hand-write the string for each digit 0–9 at each place. Forty literal cases — correct, verbose, easy to get subtly wrong in one cell." },
      { title: "Divide by place, pattern per place", body: "For each magnitude use the pattern [one, five, ten] (I/V/X, then X/L/C, then C/D/M): digit d maps to 0–3 repeats of one, or five plus 0–3 of one, or nine = one+ten. Compact, but the indexing is fiddlier to defend." },
      { title: "The optimal idea — greedy over the 13-block table", body: "One table with values AND symbols (pairs included); walk it downward, appending each symbol as many times as it fits via divmod. Thirteen iterations, no per-digit branching at all." },
    ],
    approach: "Greedy over canonical value table",
    code: `def intToRoman(num):
    table = [
        (1000, "M"), (900, "CM"), (500, "D"), (400, "CD"),
        (100, "C"), (90, "XC"), (50, "L"), (40, "XL"),
        (10, "X"), (9, "IX"), (5, "V"), (4, "IV"), (1, "I"),
    ]
    parts = []
    for value, sym in table:
        if num == 0:
            break                     # nothing left to encode
        count, num = divmod(num, value)
        parts.append(sym * count)     # '' when count == 0 — harmless
    return "".join(parts)`,
    walkthrough: [
      "Trace 3749: 1000 fits 3 times (remainder 749) → 'MMM'; 500 fits once (→249) → 'D'; 100 fits twice (→49) → 'CC'; 40 fits once (→9) → 'XL'; 9 fits once (→0) → 'IX'. Concatenation: 'MMMDCCXLIX'. The greedy choice is forced at every step because each block is at least half the block above it — more of a smaller block can never compensate for skipping a bigger one.",
      "The pairs sit in the table exactly where greedy needs them. Without (400, \"CD\"), the loop would happily emit 'CCCC' — four repeats, which the canonical system forbids. With the pair present, divmod consumes 400 wholesale and the illegal form never gets a chance to appear.",
      "The small mechanics earn their keep: divmod returns quotient and remainder in one call, sym * count appends nothing when count is 0, and the early break stops the loop once num hits 0 — the last block (1, \"I\") often isn't even reached. The invariant is that after processing block v the remainder is < v, so the loop makes progress unconditionally.",
    ],
    time: "O(1) — at most 13 table blocks for num ≤ 3999",
    space: "O(1) — fixed table, output at most 15 characters",
    followUps: [
      "Generalise past 3999 with vinculum notation (overlined M = ×1000): the table extends, the greedy logic does not change.",
      "Round-trip test: intToRoman(n) then romanToInt must recover n for every n in 1..3999 — a property worth automating.",
    ],
    related: ["roman-to-integer", "integer-to-english-words", "excel-sheet-column-number"],
    verify: {
      fn: "intToRoman",
      wrap: "plain",
      cases: [
        { args: [3749], expect: "MMMDCCXLIX" },
        { args: [58], expect: "LVIII" },
        { args: [1994], expect: "MCMXCIV" },
        { args: [4], expect: "IV" },
        { args: [9], expect: "IX" },
        { args: [3999], expect: "MMMCMXCIX" },
        { args: [1], expect: "I" },
      ],
    },
    xp: 20,
  },
  {
    slug: "isomorphic-strings",
    statement:
      "Two strings are isomorphic when the characters of one can be replaced — consistently, every occurrence of a letter mapping to the same letter — to produce the other. The substitution must also be one-to-one: two different characters may not collapse onto the same target. Given strings s and t of equal length, return whether they are isomorphic.",
    examples: [
      { input: 's = "egg", t = "add"', output: "true", explanation: "e→a and g→d, applied consistently." },
      { input: 's = "foo", t = "bar"', output: "false", explanation: "'o' would have to map to both a and r." },
      { input: 's = "badc", t = "baba"', output: "false", explanation: "The one-way map looks fine (b→b, a→a, d→b, c→a) but b and a each absorb two sources — the reverse direction fails." },
    ],
    constraints: ["1 <= s.length == t.length <= 5·10^4", "s and t consist of any valid ASCII characters"],
    breakdown: [
      "The condition is a bijection between the two alphabets actually used. A function alone is not enough: 'badc'→'baba' has a well-defined forward map that still fails because two different sources land on the same targets. So the check is two-directional: every s-character must go to exactly one t-character AND every t-character must come from exactly one s-character.",
      "The mechanical translation is two dicts maintained in lockstep. Before blessing a pair (a, b), ask both questions: does a already promise a different b? Does b already belong to a different a? Either violation kills the pairing instantly. The alternative idiom — map each character to the index of its FIRST occurrence — gives the elegant signature test: s and t are isomorphic exactly when those first-occurrence sequences are equal, because isomorphism ignores letter identity and cares only about equal-position patterns.",
    ],
    edges: [
      "The one-way trap: s→t may be consistent while the reverse fails ('badc'/'baba') — check both directions.",
      "Role-swapping mid-string: 'bbbaaaba'/'aaabbbba' fails because b and a trade targets halfway through.",
      "If the caller might pass unequal lengths, guard explicitly — zip would silently truncate instead of failing.",
      "Full ASCII alphabet rules out a 26-slot counting array — dicts, not arrays.",
    ],
    ladder: [
      { title: "Brute force — positional consistency", body: "For every pair of positions i, j require s[i]==s[j] ⇔ t[i]==t[j]. The definition applied literally: O(n²) comparisons, correct but quadratic." },
      { title: "One-way map (the near-miss)", body: "Maintain s→t only. Catches 'foo'→'bar' but wrongly accepts 'badc'/'baba' — the direction you forgot is exactly the injectivity half of the definition." },
      { title: "The optimal idea — two one-way maps", body: "s→t and t→s updated together; a pair is accepted only when neither direction already disagrees. One pass, O(n) time, O(k) space for the k distinct characters." },
    ],
    approach: "Bidirectional character mapping",
    code: `def isIsomorphic(s, t):
    if len(s) != len(t):
        return False
    s2t, t2s = {}, {}
    for a, b in zip(s, t):
        if s2t.setdefault(a, b) != b:   # a already promised a different target
            return False
        if t2s.setdefault(b, a) != a:   # b already claimed by a different source
            return False
    return True`,
    walkthrough: [
      "setdefault does double duty: it installs a→b on first sight and returns the existing promise otherwise, so each != comparison is simultaneously 'new pair, fine' and 'old pair, still agrees?'. Two dict operations per character, and every clause of the definition is enforced before the loop moves on.",
      "Trace 'badc'/'baba': the pairs (b,b) and (a,a) install cleanly; then (d,b) — the forward map is happy (d is new) but the reverse map already says b→b, and setdefault(b, d) returns b ≠ d → false. The reverse map caught the collapse the forward map was content to allow. That is the entire problem in one trace.",
      "The elegant alternative worth quoting: signature = index of first occurrence. 'egg' becomes [0,1,1] and 'add' becomes [0,1,1] — equal signatures ⇔ isomorphic. As written it's O(n²) (index is a scan), but it teaches the right idea: the actual letters are interchangeable; only the repetition pattern matters.",
    ],
    time: "O(n) — one pass, two dict updates per character",
    space: "O(k) — one entry per distinct character",
    followUps: [
      "Generalise to pattern-matching over words: word-pattern is exactly this problem with words standing where letters stood.",
      "How many strings are isomorphic to a given s? Group by first-occurrence signature and count — the signature is the key.",
    ],
    related: ["word-pattern", "valid-anagram", "find-and-replace-pattern"],
    verify: {
      fn: "isIsomorphic",
      wrap: "plain",
      cases: [
        { args: ["egg", "add"], expect: true },
        { args: ["foo", "bar"], expect: false },
        { args: ["badc", "baba"], expect: false },
        { args: ["paper", "title"], expect: true },
        { args: ["bbbaaaba", "aaabbbba"], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "word-pattern",
    statement:
      "You are given a pattern of lowercase letters and a sentence — a string of lowercase words separated by single spaces. Return true when the sentence follows the pattern: each letter corresponds to exactly one word and each word corresponds to exactly one letter, with the correspondence holding at every position. A letter may not stand for two different words, and a word may not be represented by two different letters.",
    examples: [
      { input: 'pattern = "abba", s = "dog cat cat dog"', output: "true", explanation: "a↔dog and b↔cat, consistently." },
      { input: 'pattern = "abba", s = "dog cat cat fish"', output: "false", explanation: "'a' would need to mean both dog and fish." },
      { input: 'pattern = "abba", s = "dog dog dog dog"', output: "false", explanation: "dog would need to come from both a and b." },
    ],
    constraints: ["1 <= pattern.length <= 300", "1 <= s.length <= 3000", "s contains lowercase letters and single spaces; every word is non-empty"],
    breakdown: [
      "This is isomorphic-strings wearing a coat: letters on one side, words on the other, bijection requirement identical — consistent forward mapping, consistent reverse mapping. The two-dict solution ports over one-for-one. The only new wrinkle is tokenisation: the sentence must be split into words before the pairing loop can run.",
      "Before any pairing, check cardinality: the number of words must equal the number of pattern letters. This length guard is a correctness requirement, not hygiene — it carries real weight on inputs like pattern 'jquery' against sentence 'jquery', where a naive glance sees 'matching' text but six letters face one word. Catching it up front keeps the main loop free of asymmetric-length reasoning.",
    ],
    edges: [
      "Count mismatch ('jquery' vs 'jquery'): six letters, one word — the length guard fires before any mapping.",
      "Same word under two letters ('abba'/'dog dog dog dog') — only the reverse map sees it.",
      "Same letter under two words ('abba'/'dog cat cat fish') — the forward map sees it.",
      "Split with s.split(' ') to stay faithful to the spec: split() would silently normalise runs of spaces and change word-count semantics.",
    ],
    ladder: [
      { title: "Brute force — positional comparison", body: "For each pair of positions i, j require pattern[i]==pattern[j] ⇔ words[i]==words[j]. O(n²) — the definition applied literally, again." },
      { title: "One-directional map", body: "letter→word only. Correct on 'dog cat cat fish' but blind to the 'dog dog dog dog' collapse; you discover the missing direction from a wrong answer, not from the spec." },
      { title: "The optimal idea — two maps plus a length guard", body: "Check counts, then enforce letter→word and word→letter in one zip pass. O(n) over tokens, every clause covered." },
    ],
    approach: "Two-way bijection over tokens",
    code: `def wordPattern(pattern, s):
    words = s.split(" ")                 # one word per position
    if len(pattern) != len(words):       # cardinality must match first
        return False
    p2w, w2p = {}, {}
    for p, w in zip(pattern, words):
        if p2w.setdefault(p, w) != w:    # letter already means another word
            return False
        if w2p.setdefault(w, p) != p:    # word already claimed by another letter
            return False
    return True`,
    walkthrough: [
      "The length guard is the cheapest test in the function and rejects whole families of inputs in one comparison. Only after counts agree does the pairing loop make sense — zip would silently truncate on a mismatch, hiding the violation instead of reporting it.",
      "Inside the loop, both maps are consulted before either accepts. 'abba'/'dog dog dog dog': the first three pairs install a→dog and b→dog harmlessly — the forward map thinks everything is fine — but the fourth pair re-meets a and the reverse map objects: dog already belongs to b. One map alone returns true here; the second map is not redundancy, it is the injectivity half of the definition.",
      "The shape generalises: pattern letters could be regex tokens or template placeholders — anywhere a substitution must be consistent AND collision-free, the two-dict lockstep is the answer. The deliberate split(\" \") equals split() under the stated constraints, but it keeps the code honest if spacing rules ever loosen.",
    ],
    time: "O(n + m) — split the sentence, then one pass over paired tokens",
    space: "O(n + m) — the word list plus two maps over distinct tokens",
    followUps: [
      "Case-insensitive or multi-space input: normalise first (lowercase, collapse whitespace) — the bijection logic is untouched.",
      "find-and-replace-pattern asks the same question for a whole list of words: factor this predicate out and filter with it.",
    ],
    related: ["isomorphic-strings", "find-and-replace-pattern", "group-anagrams"],
    verify: {
      fn: "wordPattern",
      wrap: "plain",
      cases: [
        { args: ["abba", "dog cat cat dog"], expect: true },
        { args: ["abba", "dog cat cat fish"], expect: false },
        { args: ["aaaa", "dog cat cat dog"], expect: false },
        { args: ["abba", "dog dog dog dog"], expect: false },
        { args: ["jquery", "jquery"], expect: false },
        { args: ["abc", "b c a"], expect: true },
      ],
    },
    xp: 10,
  },
  {
    slug: "length-of-last-word",
    statement:
      "Given a string of words and spaces, return the length of the last word — the maximal run of non-space characters ending at the string's last non-space position. Trailing spaces may exist and must be ignored. At least one word is always present.",
    examples: [
      { input: 's = "Hello World"', output: "5", explanation: 'The last word is "World".' },
      { input: 's = "   fly me   to   the moon  "', output: "4", explanation: 'Trailing spaces and irregular gaps are ignored; the last word is "moon".' },
      { input: 's = "luffy is still jokeboy"', output: "7", explanation: "No trailing spaces here — the last run simply ends at the string's end." },
    ],
    constraints: ["1 <= s.length <= 10^4", "s contains English letters and spaces", "at least one word is present"],
    breakdown: [
      "The problem looks trivial and is — once you decide WHERE the last word ends. The string's final character is a lie: it may be a space. The true end of the last word is the last non-space character; the true start is the first space before that (or the string's beginning). Two scans from the right — one to find the end, one to find the start — answer the question with no allocation at all.",
      "The library one-liner len(s.split()[-1]) does the same job by tokenising everything. It's fine to offer it, but it builds every word and a list just to throw them away, while the two-pointer scan touches only the tail of the string and explains better in an interview. The edge worth rehearsing out loud: a single word with trailing spaces ('day ') still needs the trailing-trim step, or you'll return 0.",
    ],
    edges: [
      "Trailing spaces after the last word — skip them first or you'll measure a zero-length 'word'.",
      "A one-letter string 'a' — both scans degenerate gracefully; the answer is 1.",
      "Runs of consecutive spaces between words are irrelevant — the right-to-left scans never look past the first gap they meet.",
      "The last word may begin at index 0 — the start scan must stop at the boundary, not run off the front.",
    ],
    ladder: [
      { title: "Brute force — tokenise", body: "s.split() drops empties; take the last token. Three lines, O(n) extra space — completely acceptable, slightly wasteful." },
      { title: "rfind after rstrip", body: "Trim trailing spaces, then s.rfind(' ') locates the gap before the last word; the answer is len − pos − 1. Two library calls, no list built." },
      { title: "The optimal idea — two right-to-left scans", body: "One pointer walks over trailing spaces, a second walks over the word itself. O(answer) work in the best case, O(1) space, zero allocations." },
    ],
    approach: "Right-to-left two-scan",
    code: `def lengthOfLastWord(s):
    end = len(s) - 1
    while end >= 0 and s[end] == " ":      # 1) step over trailing spaces
        end -= 1
    start = end
    while start >= 0 and s[start] != " ":  # 2) walk back to the word's first letter
        start -= 1
    return end - start                     # word occupies start+1 .. end`,
    walkthrough: [
      "Scan 1 establishes the true end of the last word; scan 2 runs until it hits a space or falls off the left edge. The length is end − start because start finishes ON the space (or at −1): the word occupies indices start+1 .. end, which is exactly end − start characters.",
      "Trace '   fly me   to   the moon  ': end skips two trailing spaces to land on 'n'; start walks back 4 letters to the space before 'moon' → 4. Trace 'day ': end moves past one space to 'y'; start runs all the way to −1; the answer is 2 − (−1) = 3. The boundary case is handled by the same arithmetic — no special-casing for 'word starts the string'.",
      "The best case is striking: for a 10^4-character string whose last word is short, both scans touch only a handful of characters. Worth saying in an interview: the algorithm is O(k) where k is the examined tail, bounded by n — while the split() version pays unconditional O(n) and allocates O(n).",
    ],
    time: "O(n) worst case — both pointers move at most the full length",
    space: "O(1) — two indices, nothing allocated",
    followUps: [
      "Return the last word itself, not its length: slice s[start+1:end+1] with the same two indices.",
      "k last words? Extend the same tail-scan to skip k words; still O(tail) and allocation-free.",
    ],
    related: ["reverse-words-in-a-string", "string-to-integer-atoi", "find-the-index-of-the-first-occurrence-in-a-string"],
    verify: {
      fn: "lengthOfLastWord",
      wrap: "plain",
      cases: [
        { args: ["Hello World"], expect: 5 },
        { args: ["   fly me   to   the moon  "], expect: 4 },
        { args: ["luffy is still jokeboy"], expect: 7 },
        { args: ["a"], expect: 1 },
        { args: ["day "], expect: 3 },
      ],
    },
    xp: 10,
  },
  {
    slug: "zigzag-conversion",
    statement:
      "Write a string in a zigzag pattern on a given number of rows: characters walk down the rows one by one, then back up diagonally, repeating until the string is exhausted; each row is then read left to right. Given the string and the row count, return the row-by-row reading.",
    examples: [
      { input: 's = "PAYPALISHIRING", numRows = 3', output: '"PAHNAPLSIIGYIR"', explanation: "Row 0 picks P,A,H,N; row 1 A,P,L,S,I,I,G; row 2 Y,I,R." },
      { input: 's = "PAYPALISHIRING", numRows = 4', output: '"PINALSIGYAHRPI"' },
      { input: 's = "A", numRows = 1', output: '"A"', explanation: "One row — the string reads through unchanged." },
    ],
    constraints: ["1 <= s.length <= 1000", "1 <= numRows <= 1000"],
    breakdown: [
      "The zigzag is a deterministic walk over row indices: 0,1,…,numRows−1, then numRows−2,…,1, then repeat. So the simulation is: keep a bucket per row, walk the character stream assigning each character to the current bucket, and bounce the direction at the two ends. The output is just the buckets concatenated. No character is examined twice and no column geometry needs computing.",
      "The traps are the degenerate row counts. With numRows = 1 there is no bounce — direction flips would oscillate the index out of range — and the 'zigzag' IS the original string, so return it directly. With numRows ≥ len(s), the walk never reverses either and the reading equals the input. Handling both up front makes the main loop safe and obviously terminating.",
      "There is also a closed form: characters repeat with period 2·numRows − 2; row 0 takes period-multiples, the last row takes period-half offsets, and middle rows get one extra character at (period − r) inside each cycle. It's O(n) with O(1) extra space and worth mentioning — but the bucket simulation is the answer you can write under pressure without a derivation error.",
    ],
    edges: [
      "numRows = 1: the period 2·1−2 is 0 — closed-form code divides by zero and bouncing code oscillates; early-return s.",
      "numRows ≥ len(s): the walk ends before the first bounce; output equals input (also covered by the early return).",
      "Two rows: the diagonal has no middle rows — every character lands on row 0 or row 1 alternately.",
      "Short strings against tall column counts ('AB' with numRows 3) — the guard must precede bucket logic.",
    ],
    ladder: [
      { title: "Brute force — draw the grid", body: "Fill an numRows × len(s) matrix at computed coordinates, then read row by row. Correct but memory-hungry and index-dense; you implement the same walk twice (writing, then reading)." },
      { title: "Closed-form period arithmetic", body: "Cycle length p = 2·numRows − 2; place each character by its offset modulo p. O(1) extra space — elegant, with easy off-by-one mistakes on the middle rows." },
      { title: "The optimal idea — row buckets with a bouncing index", body: "One pass, one bucket per row, flip direction at the ends. O(n) time, O(n) space, and the code reads like the picture." },
    ],
    approach: "Row-bucket simulation with direction bounce",
    code: `def convert(s, numRows):
    if numRows == 1 or numRows >= len(s):
        return s                    # no reversal ever happens → identity
    rows = [[] for _ in range(numRows)]
    r, step = 0, 1                  # current row and travel direction
    for ch in s:
        rows[r].append(ch)
        if r == 0:
            step = 1                # bounce off the top
        elif r == numRows - 1:
            step = -1               # bounce off the bottom
        r += step
    return "".join("".join(row) for row in rows)`,
    walkthrough: [
      "The invariant: after k characters, r is exactly where character k+1 belongs in the picture. Bounces are enforced by position, not by counting characters per column — the diagonal leg of the 'V' shape is just rows visited in decreasing order, and the simulation glides through them for free.",
      "Trace numRows = 4 on 'PAYPALISHIRING': rows visited are 0,1,2,3,2,1,0,1,2,3,… pinning P→0, A→1, Y→2, P→3, A→2, L→1, I→0, S→1, H→2, I→3, R→2, I→1, N→0, G→1. Bucket 0 = 'PIN', 1 = 'ALSIG', 2 = 'YAHR', 3 = 'PI' → 'PINALSIGYAHRPI'. Each character was appended exactly once.",
      "The early return does more work than it appears to. numRows = 1 makes the closed-form period 2·1−2 = 0 (division by zero) and the bouncing loop flip direction at BOTH ends every iteration, sending r out of range immediately. numRows ≥ len(s) means the string ends before the first bounce. Guarding both keeps every line after it unconditionally safe.",
    ],
    time: "O(n) — each character assigned to a bucket once",
    space: "O(n) — the buckets hold every character",
    followUps: [
      "Write the closed-form version with period p = 2·numRows − 2 and compare constant factors — the derivation is a nice whiteboard exercise.",
      "Decode direction: given the zigzagged string and row count, recover the original (row lengths → per-row counts → walk the same bounce order).",
    ],
    related: ["spiral-matrix", "diagonal-traverse", "text-justification"],
    verify: {
      fn: "convert",
      wrap: "plain",
      cases: [
        { args: ["PAYPALISHIRING", 3], expect: "PAHNAPLSIIGYIR" },
        { args: ["PAYPALISHIRING", 4], expect: "PINALSIGYAHRPI" },
        { args: ["A", 1], expect: "A" },
        { args: ["AB", 1], expect: "AB" },
        { args: ["ABCD", 2], expect: "ACBD" },
      ],
    },
    xp: 20,
  },
  {
    slug: "ransom-note",
    statement:
      "You want to cut letters out of a magazine to assemble a ransom note. Return true exactly when every character of the note can be sourced from the magazine — each magazine letter may be used once, and using a letter removes it. Both strings consist of lowercase English letters.",
    examples: [
      { input: 'ransomNote = "a", magazine = "b"', output: "false" },
      { input: 'ransomNote = "aa", magazine = "ab"', output: "false", explanation: "Two 'a's are needed; the magazine has one." },
      { input: 'ransomNote = "aa", magazine = "aab"', output: "true" },
    ],
    constraints: ["1 <= ransomNote.length, magazine.length <= 5·10^4", "lowercase English letters only"],
    breakdown: [
      "This is multiset containment: the note's letter inventory must be dominated by the magazine's, letter by letter. Frequency, not membership — 'aa' vs 'ab' fails even though 'a' exists in both. The natural shape: tally the magazine, then draw down the tally as the note consumes letters; any draw that finds the shelf empty fails.",
      "Order of the two tallies matters only for efficiency, not correctness. Tallying the magazine first and drawing per note letter gives an instant early exit the moment a single letter runs out. A length pre-check adds a free shortcut: every note letter needs a distinct source, so a note strictly longer than the magazine can never be covered.",
    ],
    edges: [
      "Repeated letters ('aa'/'ab') — a membership set would wrongly pass; counts are the point.",
      "A note strictly longer than the magazine is instantly false — every letter needs a source.",
      "Identical strings → true, with every count landing exactly at zero after the draws.",
      "Magazine letters the note never needs are simply ignored — leftover stock is fine.",
    ],
    ladder: [
      { title: "Brute force — remove as you go", body: "Convert the magazine to a list; for each note letter, find and delete one occurrence. O(n·m) with shifting removals — correct, painful at scale." },
      { title: "Sort both, merge-walk", body: "Sort note and magazine, two pointers drawing from the magazine stream. O(n log n + m log m) — fine, but sorting buys nothing the counter doesn't give for free." },
      { title: "The optimal idea — tally and draw down", body: "One dict for the magazine, one pass over the note decrementing; any zero-stock draw returns false. O(n + m) time, O(1) space (26 keys)." },
    ],
    approach: "Magazine tally with draw-down",
    code: `def canConstruct(ransomNote, magazine):
    if len(ransomNote) > len(magazine):   # not enough raw material, ever
        return False
    stock = {}
    for ch in magazine:                   # tally the available letters
        stock[ch] = stock.get(ch, 0) + 1
    for ch in ransomNote:                 # draw one letter at a time
        if stock.get(ch, 0) == 0:         # shelf empty for this letter
            return False
        stock[ch] -= 1
    return True`,
    walkthrough: [
      "The tally is the magazine's inventory; the second loop is a shopping trip. Each note letter either finds stock (decrement and continue) or doesn't (instant false). The length pre-check is the free micro-shortcut: with every note letter needing a distinct source, a longer note can never be covered.",
      "Trace ('aa', 'aab'): stock {a:2, b:1}; draws a→1, a→0 → true. Trace ('aa', 'ab'): stock {a:1, b:1}; the first draw empties 'a', the second finds stock 0 → false. The failed draw is exactly the multiset comparison failing at one letter.",
      "The idiomatic closing form is Counter(ransomNote) - Counter(magazine) being empty — Counter subtraction drops non-positive counts, so an empty result means every need was met. Same O(n+m), and worth stating after you've shown the manual version. Both are O(1) space because the alphabet is 26 letters.",
    ],
    time: "O(n + m) — one tally pass, one draw pass",
    space: "O(1) — at most 26 keys in the stock dict",
    followUps: [
      "Unicode or mixed case: same logic with dict keys instead of a 26-array — already the shape here.",
      "Multiple notes against one magazine: tally once and run k draw passes, or rebuild per note — quantify the trade-off.",
    ],
    related: ["valid-anagram", "isomorphic-strings", "find-the-difference"],
    verify: {
      fn: "canConstruct",
      wrap: "plain",
      cases: [
        { args: ["a", "b"], expect: false },
        { args: ["aa", "ab"], expect: false },
        { args: ["aa", "aab"], expect: true },
        { args: ["aab", "baa"], expect: true },
      ],
    },
    xp: 10,
  },
  {
    slug: "first-unique-character-in-a-string",
    statement:
      "Given a string of lowercase letters, return the index of its first non-repeating character — the first character that appears exactly once in the whole string. Return -1 when no such character exists.",
    examples: [
      { input: 's = "leetcode"', output: "0", explanation: "'l' is the first character appearing exactly once." },
      { input: 's = "loveleetcode"', output: "2", explanation: "'l' and 'o' repeat; 'v' at index 2 is first to appear once." },
      { input: 's = "aabb"', output: "-1", explanation: "Every character repeats." },
    ],
    constraints: ["1 <= s.length <= 10^5", "lowercase English letters only"],
    breakdown: [
      "'First unique' fuses two questions: how often does each character occur (a global property), and which position arrives first with a once-only character (an order property). Neither alone suffices — you need counts to know uniqueness and the original order to break ties. The natural decomposition is two scans: one to build counts, one to find the first index whose count is 1.",
      "The tempting single-scan alternative — track first occurrences and drop repeats as found — is subtle: a character can BECOME non-unique long after it looked promising, so you need a 'seen twice' structure plus an ordered candidate structure. Two linear passes each carry a one-line invariant; that simplicity is the interview answer.",
    ],
    edges: [
      "All repeats ('aabb') → -1; the second scan must fall through cleanly to -1.",
      "Single character 'z' → 0.",
      "The unique character may sit at the very end — the second scan finds it regardless of position.",
      "Counts belong to the WHOLE string: 'loveleetcode' has 'l' twice, so index 0 is out despite 'l' looking fresh early on.",
    ],
    ladder: [
      { title: "Brute force — recount per position", body: "For each index, scan the whole string to count that character's occurrences. O(n²) — 10^5 characters make it ~10^10 operations." },
      { title: "Group by count, then locate", body: "Collect characters with count 1, then take the minimum original index among them. Works, but builds machinery the second scan gives for free." },
      { title: "The optimal idea — count map + second scan", body: "Pass 1 tallies every character; pass 2 returns the first index whose count is exactly 1. O(n) time, O(1) space (26 keys)." },
    ],
    approach: "Two-pass count map",
    code: `def firstUniqChar(s):
    count = {}
    for ch in s:                          # pass 1: full-string tallies
        count[ch] = count.get(ch, 0) + 1
    for i, ch in enumerate(s):            # pass 2: first index with count 1
        if count[ch] == 1:
            return i
    return -1`,
    walkthrough: [
      "Pass 1's invariant: count holds exact frequencies for the prefix seen so far — and by the end, for the whole string. Pass 2 re-walks the string in original order and consults those totals, so 'first' is answered by scan order and 'unique' by the tally, each mechanism doing exactly one job.",
      "Trace 'loveleetcode': counts {l:2, o:2, v:1, e:4, t:1, c:1, d:1}. Second scan: l (2, skip), o (2, skip), v (1) → return 2. Three later characters are also unique — the scan order resolves which one the problem wants.",
      "The -1 path is the second scan finishing without a hit, which is exactly 'every count ≥ 2'. A 26-slot array would replace the dict here (alphabet-bounded), trading generality for constants; the dict version survives a change to full Unicode with zero edits.",
    ],
    time: "O(n) — two linear passes",
    space: "O(1) — at most 26 counters",
    followUps: [
      "Stream variant: characters arrive one at a time and you must report the first unique-so-far after each — pair the count map with an ordered queue of candidates.",
      "Return the character instead of the index: same two passes, return s[i] at the hit.",
    ],
    related: ["find-the-difference", "longest-substring-without-repeating-characters", "sort-characters-by-frequency"],
    verify: {
      fn: "firstUniqChar",
      wrap: "plain",
      cases: [
        { args: ["leetcode"], expect: 0 },
        { args: ["loveleetcode"], expect: 2 },
        { args: ["aabb"], expect: -1 },
        { args: ["z"], expect: 0 },
      ],
    },
    xp: 10,
  },
  {
    slug: "longest-common-prefix",
    statement:
      "Given an array of strings, return their longest common prefix — the longest string that every string in the array starts with. If there is no common prefix, return the empty string. The array always contains at least one string.",
    examples: [
      { input: 'strs = ["flower","flow","flight"]', output: '"fl"', explanation: "'fl' starts all three; 'flo' already fails on flight." },
      { input: 'strs = ["dog","racecar","car"]', output: '""', explanation: "The first letters already disagree." },
      { input: 'strs = ["interspecies","interstellar","interstate"]', output: '"inters"' },
    ],
    constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length <= 200", "lowercase English letters only"],
    breakdown: [
      "A prefix is position-wise agreement, so every method reduces to: compare characters at position k across all strings, and stop at the first disagreement or the first string that ends. The horizontal scan fixes a candidate prefix from the first string and shrinks it against each subsequent string; the shrink is monotone — a character that died never comes back.",
      "The vertical scan (column by column across all strings) has the same complexity but different early-exit behaviour: it stops at the first mismatched column anywhere. There's also the min/max trick — the common prefix of the lexicographically smallest and largest strings equals the common prefix of the whole array, because any string sorting between them must agree wherever they do. All three are worth having in your pocket.",
    ],
    edges: [
      "An empty string in the array ('', 'b') → the prefix is '' immediately.",
      "A single string → the whole string is the answer (the loop never shrinks anything).",
      "One string a full prefix of another ('ab', 'a') → the shorter one bounds the candidate.",
      "All identical strings → the prefix is the string itself.",
    ],
    ladder: [
      { title: "Brute force — vertical scan", body: "For column k, compare strs[i][k] across all strings until a mismatch or a string ends. O(S) where S is the total character count — already asymptotically optimal; needs careful bounds handling." },
      { title: "Sort endpoints, compare two", body: "The lexicographic min and max of the array share the common prefix of everything; compare just those two. Same worst case, but only two strings are ever examined — a lovely observation." },
      { title: "The optimal idea — horizontal shrink", body: "Seed the candidate with strs[0]; for each next string, trim until startswith holds. The candidate only ever gets shorter, and a fully-trimmed candidate aborts the whole search." },
    ],
    approach: "Horizontal scan with monotone shrink",
    code: `def longestCommonPrefix(strs):
    prefix = strs[0]                        # candidate from the first string
    for s in strs[1:]:
        while not s.startswith(prefix):     # disagree? shave one character
            prefix = prefix[:-1]
            if not prefix:
                return ""                   # died completely — stop early
    return prefix`,
    walkthrough: [
      "The loop invariant: after processing string i, prefix is the common prefix of strs[0..i]. The inner while restores that invariant against the newest string, and monotonicity means each character of the original candidate is shaved at most once across the entire run — the total work stays linear in the characters examined.",
      "Trace ['flower','flow','flight']: candidate 'flower' vs 'flow' shaves to 'flow'; vs 'flight', 'flow' fails and 'flo' fails but 'fl' holds → answer 'fl'. The early return handles ['dog','racecar','car']: 'dog' vs 'racecar' shaves all the way to '' and the function returns before even reading the third string.",
      "The min/max alternative in one line: take the common prefix of min(strs) and max(strs). Why it works: if the lexicographic extremes agree on the first k characters, every string sorting between them must agree too — any earlier disagreement would sort outside the pair. Elegant to mention; type the horizontal scan first because its correctness needs no argument.",
    ],
    time: "O(S) — S = total characters across strings; each candidate character is shaved at most once",
    space: "O(1) — one candidate prefix (output aside)",
    followUps: [
      "Binary search on the answer length (0..shortest string): each probe costs O(S), and there are log L probes.",
      "Extremely long, few strings: the vertical scan with zip(*strs) reads column-wise and exits at the first column with more than one distinct character.",
    ],
    related: ["find-the-index-of-the-first-occurrence-in-a-string", "longest-common-subsequence", "shortest-palindrome"],
    verify: {
      fn: "longestCommonPrefix",
      wrap: "plain",
      cases: [
        { args: [["flower", "flow", "flight"]], expect: "fl" },
        { args: [["dog", "racecar", "car"]], expect: "" },
        { args: [["a"]], expect: "a" },
        { args: [["", "b"]], expect: "" },
        { args: [["ab", "a"]], expect: "a" },
        { args: [["interspecies", "interstellar", "interstate"]], expect: "inters" },
      ],
    },
    xp: 10,
  },
  {
    slug: "reverse-words-in-a-string",
    statement:
      "Given a sentence that may contain leading, trailing, and repeated spaces, reverse the order of its words and return the result with exactly one space between words — no leading or trailing whitespace. A word is a maximal run of non-space characters.",
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"' },
      { input: 's = "  hello   world  "', output: '"world hello"', explanation: "Runs of spaces collapse to one; edges are trimmed." },
      { input: 's = "a good   example"', output: '"example good a"' },
    ],
    constraints: ["1 <= s.length <= 10^4", "s contains English letters, digits, and spaces", "at least one word is present"],
    breakdown: [
      "Two jobs hide in one sentence: NORMALISE whitespace and REVERSE order. Splitting with no argument does both at once — Python's s.split() treats runs of spaces as one separator and drops the empties that leading/trailing spaces would produce. Reversing the token list and joining with single spaces finishes the job in three library calls.",
      "The in-place variant is the follow-up worth pre-thinking: given a MUTABLE array of characters and O(1) extra space, the recipe is (1) reverse the whole array — words now appear in reverse order but each word's letters are backwards; (2) reverse each word's letters in place; (3) compact the remaining extra spaces with a slow/fast write pointer. Three simple passes beat one clever tangle, and each pass is independently testable.",
    ],
    edges: [
      "Leading and trailing spaces must vanish — split() drops them; the manual version needs explicit trimming.",
      "Runs of interior spaces collapse to one ('hello   world' → 'hello world').",
      "A single word is returned unchanged except for trimming.",
      "'   a   ' → 'a': the input can be nearly all spaces with one word inside.",
    ],
    ladder: [
      { title: "Brute force — tokenise, filter, rebuild", body: "split(' '), drop empty tokens, reverse, join with single spaces. Every normalisation step is visible — good for explaining, slightly clunky." },
      { title: "Library one-liner", body: "' '.join(reversed(s.split())) — split() with no args handles runs and edges. Know WHY it works, not just that it does." },
      { title: "The optimal idea — in-place three-pass on a char array", body: "Reverse whole, reverse each word, compact spaces with two pointers. O(n) time, O(1) extra space — the version mutable-string languages demand." },
    ],
    approach: "Split-normalise-reverse-join",
    code: `def reverseWords(s):
    # s.split() splits on RUNS of whitespace and drops empty tokens, so
    # normalisation (trim + collapse) happens before we even reverse.
    return " ".join(reversed(s.split()))`,
    walkthrough: [
      "The pipeline's correctness rests on one fact: s.split() with no argument treats any run of whitespace as a single separator and never yields empty tokens. That single property performs the trim, the collapse, and the tokenisation in one sweep — reversed() and join then handle only ORDER.",
      "Trace '  hello   world  ': split → ['hello','world'] (no empty strings despite the runs); reversed → ['world','hello']; join → 'world hello'. Trace 'the sky is blue': ['the','sky','is','blue'] → 'blue is sky the'. Single-word inputs pass through with edges trimmed.",
      "The in-place version deserves a mental run since interviews ask for it: reversing 'the sky' gives 'yks eht'; reversing each word gives 'sky the'; a slow/fast pointer then compacts any double spaces left behind. Same O(n) time but O(1) space, mutating the caller's buffer — the natural shape in C/C++ where strings are char arrays anyway.",
    ],
    time: "O(n) — split, reverse, and join are each one linear pass",
    space: "O(n) — the token list and the output string",
    followUps: [
      "Implement the O(1)-extra-space char-array version (reverse-all, reverse-each, compact) — the standard follow-up.",
      "Rotate words left by k instead of reversing — a rotation is two partial reversals, the same primitive reused.",
    ],
    related: ["length-of-last-word", "reverse-words-in-a-string-iii", "rotate-string"],
    verify: {
      fn: "reverseWords",
      wrap: "plain",
      cases: [
        { args: ["the sky is blue"], expect: "blue is sky the" },
        { args: ["  hello   world  "], expect: "world hello" },
        { args: ["a good   example"], expect: "example good a" },
        { args: ["   a   "], expect: "a" },
      ],
    },
    xp: 20,
  },
  {
    slug: "string-to-integer-atoi",
    statement:
      "Implement a function that converts a string to a 32-bit signed integer, following these rules in order: (1) skip leading spaces; (2) read an optional '+' or '-' sign; (3) read digits until the first non-digit — that number is the value (0 if no digits were read); (4) everything after the digits is ignored; (5) clamp the result into [−2^31, 2^31 − 1]. An input that never reaches the digit stage yields 0.",
    examples: [
      { input: 's = "42"', output: "42" },
      { input: 's = " -042"', output: "-42", explanation: "Space skipped, sign read, leading zeros contribute nothing." },
      { input: 's = "-91283472332"', output: "-2147483648", explanation: "The value overflows 32 bits; clamped to the minimum." },
    ],
    constraints: ["0 <= s.length <= 200", "s may contain letters, digits, spaces, '+', '-', and '.'", "the result must fit into 32-bit signed range, clamped if necessary"],
    breakdown: [
      "This problem is a reading-comprehension exam disguised as code, and the winning method is spec attack: enumerate every clause — skip spaces, optional sign, digit run, ignore the rest, clamp — turn each into a line-item question, and only then write code. The clauses form a strict pipeline where each stage ends exactly where the next begins, so the implementation is a sequence of small guarded scans, not a general parser. Writing the stages in the spec's own order keeps every rule traceable to one line.",
      "Group the inputs before coding: clean numbers ('42'); decorated numbers the spec tolerates (leading zeros, trailing junk, surrounding spaces); zero-results (empty string, only spaces, sign with no digits, junk before any digit); and overflow candidates. Two group members deserve special rehearsal: '+-12' parses to 0 because a sign with no digit is discarded, and '0-1' parses to 0 because digits end at the first non-digit — the '-' is just trailing junk. If your mental model mishandles either, the code will too.",
      "Overflow is the deep clause. Python integers are unbounded, so building the value first and clamping at the end is safe here. In fixed-width languages the accumulator itself overflows, so the interview answer is a per-digit pre-check — if val would exceed (INT_MAX − digit) / 10 before the multiply-add, clamp immediately — with a nod to the asymmetric boundary: −2^31 is one magnitude larger than INT_MAX, so exactly -2147483648 must survive the clamp.",
    ],
    edges: [
      "Sign with no digits ('+', '-', '+-12') → 0: the sign only sticks when a digit follows.",
      "Digits then junk ('0-1', '3.14') → parsing stops at the first non-digit ('0' and '3').",
      "Only spaces, or an empty string → 0.",
      "The clamp is asymmetric: −2^31 has magnitude 2147483648, one more than INT_MAX — a naive symmetric clamp botches -2147483648 itself.",
    ],
    ladder: [
      { title: "Brute force — regex", body: "Match ^\\s*[+-]?\\d+, call int(), clamp. Concise, but it hides the state pipeline interviewers want to hear articulated, and the clamp boundary still needs care." },
      { title: "Single loop with a state flag", body: "One pass switching between space/sign/digit/done states. Correct, but the transitions sprawl — most bugs live in 'what happens after the digits end'." },
      { title: "The optimal idea — staged scanning with early return", body: "Four explicit stages: skip spaces, read sign, read digits, clamp-and-return. Each stage's exit condition is one clause of the spec, so the code is a direct translation of the rules." },
    ],
    approach: "Staged scan + 32-bit clamp",
    code: `def myAtoi(s):
    INT_MAX, INT_MIN = 2**31 - 1, -2**31
    i, n = 0, len(s)
    while i < n and s[i] == " ":           # stage 1: skip leading spaces
        i += 1
    sign = 1
    if i < n and s[i] in "+-":             # stage 2: optional sign
        sign = -1 if s[i] == "-" else 1
        i += 1
    val = 0
    while i < n and "0" <= s[i] <= "9":    # stage 3: digits; junk ends the number
        val = val * 10 + int(s[i])
        i += 1
    val *= sign                            # stage 4: clamp into 32-bit range
    return max(INT_MIN, min(INT_MAX, val))`,
    walkthrough: [
      "Each stage consumes exactly what its clause allows and stops at the first character that doesn't belong — that IS the spec. ' -042': stage 1 eats the space, stage 2 takes '-', stage 3 reads 042 as 42 (leading zeros contribute nothing), stage 4 applies the sign → −42. '1337c0d3': digits end at 'c'; the rest of the string is never examined again.",
      "The zero-cases fall out of the stages rather than being special-cased: empty or all-space strings never reach stage 3, so val stays 0. '+-12' takes '+' in stage 2, then stage 3 sees '-' immediately — zero digits read → 0, sign forgotten, per spec. '0-1' reads '0', stops at '-' → 0. Every weird answer is just 'which stage stopped where'.",
      "The clamp conversation is the interview moment. Python: build the full value, clamp at the end — safe because ints never overflow. Fixed-width languages: check BEFORE val = val*10 + d whether val > (INT_MAX − d) / 10 (and remember the negative boundary allows a final digit 8 for exactly −2147483648). Saying that out loud — 'unbounded Python lets me defer; in Java I'd pre-check per digit because the accumulator itself would overflow' — is the difference between a pass and a strong pass.",
    ],
    time: "O(n) — one forward walk through the stages",
    space: "O(1) — sign, value, index",
    followUps: [
      "Handle a decimal point or thousands separators: the pipeline grows one stage — but note '3.14' → 3 here because the spec cuts at the first non-digit.",
      "Write the fixed-width-safe accumulation with the per-digit overflow pre-check and test it specifically against the INT_MAX/INT_MIN boundaries.",
    ],
    related: ["valid-number", "reverse-integer", "compare-version-numbers"],
    verify: {
      fn: "myAtoi",
      wrap: "plain",
      cases: [
        { args: ["42"], expect: 42 },
        { args: [" -042"], expect: -42 },
        { args: ["1337c0d3"], expect: 1337 },
        { args: ["0-1"], expect: 0 },
        { args: ["words and 987"], expect: 0 },
        { args: ["-91283472332"], expect: -2147483648 },
        { args: ["2147483648"], expect: 2147483647 },
        { args: ["+-12"], expect: 0 },
        { args: [" "], expect: 0 },
        { args: [""], expect: 0 },
      ],
    },
    xp: 20,
  },
  {
    slug: "valid-number",
    statement:
      "Decide whether a string is a valid decimal number. A valid number is: an optional sign, followed by either digits (at least one) or a dot with a digit on at least one side — a bare dot is not a number; optionally followed by an exponent 'e' or 'E', which takes an optional sign and at least one digit (no dot in the exponent). No other characters — including spaces — may appear. Return whether the string is valid.",
    examples: [
      { input: 's = "0"', output: "true" },
      { input: 's = "2."', output: "true", explanation: "The dot needs A digit SOMEWHERE — '2.' qualifies." },
      { input: 's = "4e+"', output: "false", explanation: "The exponent's optional sign still requires a digit after it." },
    ],
    constraints: ["1 <= s.length <= 20", "s may contain digits, '+', '-', '.', 'e', 'E' — and characters that must be rejected"],
    breakdown: [
      "Valid-number is the canonical spec-attack problem: the rules are short enough to hold in your head and dense enough that intuition fails ('2.' is valid, '.e1' is not, '4e+' almost works). The method: translate every clause into a per-character question, group clauses by character class (sign / digit / dot / exponent / other), and only then pick a mechanism. Enumerate the nastiest inputs BY HAND first — that list becomes both your test suite and your design review.",
      "The clause groups: a sign is legal only at position 0 or immediately after e/E; a dot is legal at most once and only in the mantissa (before any e); an e/E is legal at most once, needs a digit somewhere before it, and needs a digit after it; every other character is an instant rejection; and the string must END having satisfied 'at least one digit in the current segment'. Notice how 'needs a digit' SPLITS in two — before the e (mantissa) and after it (exponent) — which is exactly why '.' alone and '1e' both die.",
      "Two mechanisms dominate: a case table (which characters may follow which — a hand-built DFA) or a one-pass flag machine (seen_digit, seen_dot, seen_exp, resetting seen_digit when the exponent starts). Both are O(n); the flag machine is shorter to write, the DFA is easier to extend. The interview flex is finishing with the trap list: '0' ✓, 'e' ✗, '.' ✗, '.1' ✓, '2.' ✓, '+.8' ✓, '4e+' ✗, ' 5' ✗, '95a54e53' ✗, '-90E3' ✓.",
    ],
    edges: [
      "'2.' and '.1' are both true — the dot needs A digit SOMEWHERE, not on both sides.",
      "'4e+' is false: the exponent's optional sign still requires a digit after it.",
      "'.e1', 'e9', '1e' — the exponent never rescues an empty mantissa, and an exponent without digits is fatal.",
      "' 5' is false in this formulation — whitespace is not part of the grammar (older variants allowed trimming; know which spec you're under).",
    ],
    ladder: [
      { title: "Brute force — split on e, validate halves", body: "Cut at e/E (rejecting a second one), validate mantissa and exponent with helper checks. Workable, but the dot rules interact with everything ('2.', '+.8') and the helper count grows." },
      { title: "try/except float(s)", body: "Python's float() accepts most of this grammar — but also 'inf' and 'nan', which are NOT valid numbers here. Retrofitting rejections is fragile and misses the point of the exercise." },
      { title: "The optimal idea — one-pass flag machine", body: "Walk once with seen_digit / seen_dot / seen_exp; sign legality via the previous character; the final answer is 'the last segment contains a digit'. O(n) time, O(1) space, every clause mapped to one check." },
    ],
    approach: "One-pass flag machine over character classes",
    code: `def isNumber(s):
    seen_digit = seen_dot = seen_exp = False
    for i, ch in enumerate(s):
        if "0" <= ch <= "9":
            seen_digit = True
        elif ch in "+-":
            # a sign is legal only at the start or right after e/E
            if i > 0 and s[i - 1] not in "eE":
                return False
        elif ch == ".":
            if seen_dot or seen_exp:      # at most one dot, mantissa only
                return False
            seen_dot = True
        elif ch in "eE":
            if seen_exp or not seen_digit:  # one exponent, mantissa needs a digit
                return False
            seen_exp = True
            seen_digit = False            # the exponent segment needs its own digit
        else:
            return False                  # any other character is fatal
    return seen_digit                     # the last segment must contain a digit`,
    walkthrough: [
      "The three flags partition the string's history, and the return value is 'the final segment contains at least one digit' — which is exactly what both failure families need: '.' ends with seen_digit False, and '1e' ends with the RESET False. The reset on e/E is the pivot of the whole machine: it declares the mantissa closed and demands fresh evidence from the exponent.",
      "Sign legality rides on the previous character: a '+'/'-' at i > 0 is legal iff s[i-1] is e/E. That single check kills '-+3' (previous '-') while blessing '-90E3' (previous 'E'). Trace '4e+': the digit sets seen_digit; 'e' passes (first e, digit seen) and resets; '+' passes (after e); the string ends with seen_digit False → reject. Nothing special-cased '4e+' — it falls out of 'the exponent needs its own digit'.",
      "Now the truthy oddballs: '2.' — digit then a first, pre-exponent dot → ends with seen_digit True ✓. '+.8' — sign at 0, dot, digit ✓. '99e2.5' — the dot AFTER the exponent trips seen_exp → reject ✓. The equivalent case-table solution is a 6-state DFA (start, sign, digit, dot, exp, exp-sign); the flag machine is its compressed form, and both run in O(n) with O(1) — choose by which you can defend under pressure.",
    ],
    time: "O(n) — single pass, constant work per character",
    space: "O(1) — three boolean flags",
    followUps: [
      "Build the explicit DFA table (states × character classes) and compare: more code, but extending the grammar (hex, underscores) becomes a table edit.",
      "Older variants allow leading/trailing whitespace — where would trimming slot into this machine, and why does INTERIOR space still fail?",
    ],
    related: ["string-to-integer-atoi", "basic-calculator", "parse-lisp-expression"],
    verify: {
      fn: "isNumber",
      wrap: "plain",
      cases: [
        { args: ["0"], expect: true },
        { args: ["e"], expect: false },
        { args: ["."], expect: false },
        { args: [".1"], expect: true },
        { args: ["2."], expect: true },
        { args: ["+.8"], expect: true },
        { args: ["4e+"], expect: false },
        { args: [" 5"], expect: false },
        { args: ["95a54e53"], expect: false },
        { args: ["-90E3"], expect: true },
        { args: ["6e-1"], expect: true },
        { args: ["99e2.5"], expect: false },
        { args: ["-."], expect: false },
        { args: ["0089"], expect: true },
      ],
    },
    xp: 35,
  },
  {
    slug: "text-justification",
    statement:
      "Given an array of words and a line width, format the text so every line is exactly that many characters wide. Pack as many words per line as fit, greedily and in order. On middle lines, distribute leftover spaces as evenly as possible between words, giving EXTRA spaces to the leftmost gaps; a line holding a single word is padded on the right. The last line is left-justified — one space between words, padded on the right. Return the lines.",
    examples: [
      { input: 'words = ["This","is","an","example","of","text","justification."], maxWidth = 16', output: '["This    is    an","example  of text","justification.  "]', explanation: "Middle lines spread spaces with extras going left; the last line is left-justified." },
      { input: 'words = ["What","must","be","acknowledgment","shall","be"], maxWidth = 16', output: '["What   must   be","acknowledgment  ","shall be        "]', explanation: "'acknowledgment' sits alone on its line — padded right, never stretched." },
      { input: 'words = ["Science","is","what","we","understand","well","enough","to","explain","to","a","computer.","Art","is","everything","else","we","do"], maxWidth = 20', output: '["Science  is  what we","understand      well","enough to explain to","a  computer.  Art is","everything  else  we","do                  "]' },
    ],
    constraints: ["1 <= words.length <= 300", "1 <= words[i].length <= maxWidth", "1 <= maxWidth <= 100", "every word fits on a line by itself"],
    breakdown: [
      "The packing rule is greedy and strictly defined: keep adding words (in order) while their total letters plus one mandatory space per gap stay within maxWidth; the first word that would overflow starts a new line. The DISTRIBUTION rule is where implementations die, so attack it like a spec: for a packed line of k words with L letters there are k−1 gaps and maxWidth − L spaces to pour in — base = spaces ÷ gaps for every gap, and the first (spaces mod gaps) gaps get one more. Left-biased even distribution, nothing more.",
      "Two line shapes escape the distribution rule and must be special-cased: the single-word line (no gaps exist — pad right) and the final line (one space per gap — pad right). Enumerate those BEFORE coding; most wrong answers are middle-line logic applied to last lines or lone words. A sensible test order: lone word, two-word line with extra spaces, last line, then the full example.",
      "The fit check needs one careful inequality: when the line holds k words with L letters, adding a new word w requires L + k gaps-after-joining + len(w) characters — so L + k + len(w) > maxWidth means 'flush first'. Getting that inequality right once beats patching off-by-one fixes later; equality is allowed, since a perfectly full line is legal.",
    ],
    edges: [
      "Single-word lines: zero gaps → all spaces trail on the right ('acknowledgment  ').",
      "The last line: never stretched — one space per gap, right-padded ('shall be        ').",
      "A perfect fit (spaces mod gaps == 0): every gap identical ('enough to explain to' at width 20).",
      "A word exactly maxWidth long occupies a line alone — the fit inequality must allow equality.",
    ],
    ladder: [
      { title: "Brute force — reflow with fixes", body: "Pack words, then patch each line's spacing with ad-hoc replaces until the width matches. The patches fight each other — spacing here is exact, not approximate." },
      { title: "Pack first, distribute second", body: "Build word lists per line in one pass, then run the space arithmetic per line in a second. Same complexity, easier to test — a legitimate final answer." },
      { title: "The optimal idea — one pass with flush + divmod distribution", body: "Accumulate the current line; when the next word overflows, flush with divmod-distributed gaps; after the loop, flush the last line left-justified. O(total output) time — optimal, since the output must be produced." },
    ],
    approach: "Greedy line packing + left-biased divmod spacing",
    code: `def fullJustify(words, maxWidth):
    out = []
    line, letters = [], 0            # words in the current line, total letters
    for w in words:
        # joining w needs: letters + one gap per word ALREADY present + len(w)
        if line and letters + len(line) + len(w) > maxWidth:
            gaps = len(line) - 1
            spaces = maxWidth - letters
            if gaps == 0:                          # lone word → pad right
                out.append(line[0] + " " * spaces)
            else:
                base, extra = divmod(spaces, gaps)  # left-biased split
                built = ""
                for i, word in enumerate(line):
                    built += word
                    if i < gaps:                   # gap after every word but the last
                        built += " " * (base + (1 if i < extra else 0))
                out.append(built)
            line, letters = [], 0
        line.append(w)
        letters += len(w)
    last = " ".join(line)                          # final line: left-justified
    return out + [last + " " * (maxWidth - len(last))]`,
    walkthrough: [
      "The overflow test 'letters + len(line) + len(w) > maxWidth' reads: current letters, plus the gaps that WILL exist once w joins (k words → k gaps after the join), plus w's own length. Equality is permitted — a perfectly full line is fine. When the test trips, the flush rebuilds the accumulated words under the middle-line rules and resets the accumulator.",
      "The flush's divmod is the entire distribution spec in one line: base = spaces // gaps for every gap, extra = spaces % gaps handed out left-to-right. 'example','of','text' at width 16: letters 13, spaces 3, gaps 2 → base 1, extra 1 → gap 0 gets 2, gap 1 gets 1 → 'example  of text'. The left bias is preserved by construction, not by sorting.",
      "After the loop, whatever remains is the last line and takes the plain rule: join with single spaces, pad right to maxWidth. Trace the final line of the third example: 'do' + 18 spaces = width 20. The algorithm touches each word once and emits each output character once — O(total output) work, which is optimal because the output must be written.",
    ],
    time: "O(total output size) — every word and every space is emitted once",
    space: "O(total output size) — the returned lines",
    followUps: [
      "Right-to-left languages: the bias flips — extras go to the RIGHTMOST gaps; only the divmod application order changes.",
      "Ragged-right mode (all lines left-justified) or hyphenation: both change WHEN lines flush, not how spaces distribute.",
    ],
    related: ["zigzag-conversion", "rearrange-spaces-between-words"],
    verify: {
      fn: "fullJustify",
      wrap: "plain",
      cases: [
        {
          args: [["This", "is", "an", "example", "of", "text", "justification."], 16],
          expect: ["This    is    an", "example  of text", "justification.  "],
        },
        {
          args: [["What", "must", "be", "acknowledgment", "shall", "be"], 16],
          expect: ["What   must   be", "acknowledgment  ", "shall be        "],
        },
        {
          args: [
            ["Science", "is", "what", "we", "understand", "well", "enough", "to", "explain", "to", "a", "computer.", "Art", "is", "everything", "else", "we", "do"],
            20,
          ],
          expect: ["Science  is  what we", "understand      well", "enough to explain to", "a  computer.  Art is", "everything  else  we", "do                  "],
        },
        {
          args: [["listen", "to", "many,", "speak", "now"], 8],
          expect: ["listen  ", "to many,", "speak   ", "now     "],
        },
        { args: [["a"], 1], expect: ["a"] },
      ],
    },
    xp: 35,
  },
  {
    slug: "integer-to-english-words",
    statement:
      "Convert a non-negative integer to its English words: 123 becomes \"One Hundred Twenty Three\". Rules: no 'And' anywhere; 'Zero' appears only when the number is exactly 0; digits group in threes from the right, each group optionally followed by its scale word — Thousand, Million, Billion — and empty groups contribute nothing ('1000010' becomes \"One Million Ten\", not \"One Million Zero Ten\").",
    examples: [
      { input: "num = 123", output: '"One Hundred Twenty Three"' },
      { input: "num = 12345", output: '"Twelve Thousand Three Hundred Forty Five"' },
      { input: "num = 1234567", output: '"One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven"' },
    ],
    constraints: ["0 <= num <= 2^31 - 1"],
    breakdown: [
      "English numerals are recursive with period three: every number splits into 3-digit chunks counted from the right, each chunk spelled with the SAME small grammar (hundreds, then tens/ones) and suffixed by its scale — Billion, Million, Thousand, or nothing. '1234567' is chunk 1 + Million, chunk 234 + Thousand, chunk 567 + none. Solve the sub-1000 speller once and the whole problem is chunk plumbing.",
      "The small grammar itself has three tiers: 0–19 have atomic names (the teens are irregular and live in the ones table), 20–90 use tens[n//10] plus an optional ones word, and n ≥ 100 prefixes the hundreds digit + 'Hundred' + the remainder's spelling. Empty chunks (the zeros in 1000010) emit NOTHING — not 'Zero', not an empty scale. That's the clause most solutions get wrong on the first try.",
      "The classic missteps: appending 'Zero' for interior zero chunks; fighting string surgery instead of building a list of words and joining at the end; and off-by-one on scale indices (chunk 0 is the units group and has NO scale word). Building parts as lists and joining with single spaces sidesteps all three.",
    ],
    edges: [
      "num = 0 → 'Zero' — the ONLY place that word appears.",
      "Empty chunks: 1000000 → 'One Million' (no 'Zero Thousand'); 1000010 → 'One Million Ten'.",
      "Exactly round values: 20 → 'Twenty', 100 → 'One Hundred', 1000 → 'One Thousand' — no trailing 'Zero'.",
      "Max int 2147483647 exercises all four scales in one string.",
    ],
    ladder: [
      { title: "Brute force — hardcode per magnitude", body: "Separate logic for thousands and millions, each with its own copy of the small grammar. Triples the code, and a bug in one copy hides from the others." },
      { title: "Digit-by-digit with place names", body: "Walk digits and emit place words ('One Billion Two Hundred…'). The 10–19 teens and the 10X forms scatter special cases through the loop." },
      { title: "The optimal idea — chunk recursion over a scale table", body: "One under-1000 speller reused for every chunk; a 4-entry scale list indexed by chunk position; empty chunks skipped. O(1) for a 32-bit input — at most 4 chunks." },
    ],
    approach: "Three-digit chunk recursion over scale table",
    code: `def numberToWords(num):
    if num == 0:
        return "Zero"                     # the only legal 'Zero'
    ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven",
            "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen",
            "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"]
    tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty",
            "Sixty", "Seventy", "Eighty", "Ninety"]
    scales = ["", "Thousand", "Million", "Billion"]

    def under1000(n):
        parts = []
        if n >= 100:
            parts.append(ones[n // 100])
            parts.append("Hundred")
            n %= 100
        if n >= 20:
            parts.append(tens[n // 10])
            n %= 10
        if n > 0:                         # 1-19 land here (teens included)
            parts.append(ones[n])
        return parts

    chunks = []                           # spelled groups, low → high
    group = 0
    while num > 0:
        n = num % 1000
        if n:                             # an empty chunk contributes nothing
            words = under1000(n)
            if group:
                words.append(scales[group])
            chunks.append(" ".join(words))
        num //= 1000
        group += 1
    return " ".join(reversed(chunks))     # high scales read first`,
    walkthrough: [
      "under1000 is the entire English grammar for 1..999: hundreds digit + 'Hundred', then tens/ones from two lookup tables, with the teens handled by the ones table alone (13 → 'Thirteen', never 'Ten Three'). The n >= 20 test before the n > 0 test is the tiering — a remainder under 20 bypasses the tens table completely.",
      "The chunk loop is where scales attach. 1000010: chunk 0 = 10 → 'Ten'; chunk 1 = 0 → SKIPPED (no 'Zero Thousand'); chunk 2 = 1 → 'One Million'. Reversed join: 'One Million Ten'. The skip-if-zero branch is what makes empty chunks invisible while round scales like 1000000 still produce 'One Million' with nothing trailing.",
      "Everything is bounded: 2^31 − 1 has 10 decimal digits → 4 chunks → the loop runs 4 times and under1000 does constant table work. The reversed join matters because chunks are produced low-to-high but English reads high-to-low. Test the four corners — 0, 20, 1000000, 2147483647 — and this solution is done.",
    ],
    time: "O(1) — at most 4 chunks for a 32-bit input (O(log num) in general)",
    space: "O(1) — fixed tables plus the word list",
    followUps: [
      "British style inserts 'And' ('One Hundred and Twenty-Three'): one extra word in under1000 — locate exactly which branch carries the clause.",
      "Support negatives and decimals: prefix 'Negative' and spell the fraction part digit-by-digit — fractions have no scale grammar.",
    ],
    related: ["integer-to-roman", "fizz-buzz", "string-to-integer-atoi"],
    verify: {
      fn: "numberToWords",
      wrap: "plain",
      cases: [
        { args: [123], expect: "One Hundred Twenty Three" },
        { args: [12345], expect: "Twelve Thousand Three Hundred Forty Five" },
        { args: [1234567], expect: "One Million Two Hundred Thirty Four Thousand Five Hundred Sixty Seven" },
        { args: [0], expect: "Zero" },
        { args: [1000000], expect: "One Million" },
        { args: [1000010], expect: "One Million Ten" },
        { args: [50868], expect: "Fifty Thousand Eight Hundred Sixty Eight" },
        { args: [2147483647], expect: "Two Billion One Hundred Forty Seven Million Four Hundred Eighty Three Thousand Six Hundred Forty Seven" },
      ],
    },
    xp: 35,
  },
  {
    slug: "shortest-palindrome",
    statement:
      "You may add characters only to the FRONT of a string. Return the shortest palindrome obtainable that way. For 'aacecaaa' the answer is 'aaacecaaa' — one 'a' prefixed — because only the trailing 'a' lacked a mirror at the front.",
    examples: [
      { input: 's = "aacecaaa"', output: '"aaacecaaa"', explanation: "The longest palindromic prefix is 'aacecaa'; only the trailing 'a' needs mirroring." },
      { input: 's = "abcd"', output: '"dcbabcd"', explanation: "'a' is the longest palindromic prefix, so 'dcb' mirrors the rest." },
    ],
    constraints: ["0 <= s.length <= 5·10^4", "s consists of lowercase English letters"],
    breakdown: [
      "Reframe first: adding characters to the front means the answer is reverse(s[i:]) + s for some cut i, and the result is a palindrome exactly when s[0..i) is one. Minimising additions therefore means MAXIMISING i — the whole problem reduces to finding the longest palindromic PREFIX of s, then prepending the reverse of whatever trails it.",
      "Testing every cut naively costs O(n²). The KMP insight: the failure function of t = s + '#' + reverse(s), read at the last position, gives the length of the longest string that is both a prefix of t and a suffix of t. A suffix of t of length k ≤ len(s) is the reverse of s's first k characters — so a shared prefix/suffix of that length means s[:k] equals its own reverse: the longest palindromic prefix, delivered in O(n).",
      "The separator '#' (any character absent from the alphabet) is not decoration. Without it, the matched prefix-suffix length could exceed len(s), weaving through the junction and returning a k that corresponds to no genuine cut point of s. The separator caps the match at len(s) and forces it to a real boundary. Explaining WHY the separator matters is the actual interview question this problem is asking.",
    ],
    edges: [
      "Empty string → return it unchanged (guard before building t).",
      "Already a palindrome → k = len(s), nothing is prepended ('aba' stays 'aba').",
      "Single character → itself.",
      "The separator must not occur in s — lowercase-only input makes '#' safe; say so out loud.",
    ],
    ladder: [
      { title: "Brute force — test every cut", body: "For i from n downward, check whether s[0..i) is a palindrome (each check O(n)). O(n²) — 5·10^4 characters means ~10^9+ character comparisons." },
      { title: "Rolling hash on prefixes", body: "Compare hash(prefix of s) with hash(reverse of that prefix) while extending the cut. O(n) expected, but collision handling and double hashing for safety add real complexity." },
      { title: "The optimal idea — KMP failure function on s + '#' + reverse(s)", body: "One linear failure-function pass; the last value IS the longest palindromic prefix. O(n) time, O(n) space, deterministic — no hashing caveats." },
    ],
    approach: "KMP failure function over s + '#' + reverse(s)",
    code: `def shortestPalindrome(s):
    if not s:
        return s
    rev = s[::-1]
    t = s + "#" + rev                 # '#' keeps any match shorter than len(s)+1
    fail = [0] * len(t)               # fail[i] = longest proper prefix of t that
    for i in range(1, len(t)):        # is also a suffix of t[:i+1]
        k = fail[i - 1]
        while k > 0 and t[i] != t[k]:
            k = fail[k - 1]           # fall back through shorter borders
        if t[i] == t[k]:
            k += 1
        fail[i] = k
    longest = fail[-1]                # longest palindromic prefix of s
    return rev[:len(s) - longest] + s # mirror the unpalindromic tail onto the front`,
    walkthrough: [
      "The failure function is the standard KMP border computation: fail[i] is the longest proper prefix of t ending at position i that is also a suffix there, found by chaining through shorter borders (k = fail[k−1]) until a character matches or k hits 0. The '#' guarantees no border spans past the junction — a border longer than len(s) would have to contain the separator, which appears exactly once.",
      "Why does fail[-1] give the palindromic prefix? A suffix of t of length k (k ≤ len(s)) is a suffix of rev, which is the reverse of s's FIRST k characters; a prefix of t of length k is s[:k]. Equality means s[:k] == reverse(s[:k]) — the definition of a palindrome — and k ≤ len(s) is forced by the separator. So fail[-1] is exactly the longest palindromic prefix.",
      "Trace 'aacecaaa': the longest palindromic prefix is 'aacecaa' (7); the remainder is 'a'; the answer is reverse('a') + s = 'aaacecaaa'. Trace 'abcd': no prefix longer than 'a' is a palindrome → k = 1 → prepend reverse('bcd') = 'dcb' → 'dcbabcd'. The construction is provably shortest: any valid answer contains s as a suffix and is a palindrome, which forces its added head to mirror a suffix of s — and the longest palindromic prefix minimises that mirrored piece.",
    ],
    time: "O(n) — one failure-function pass over a string of length 2n+1",
    space: "O(n) — the combined string and its failure table",
    followUps: [
      "Palindrome-pairs variant: given many strings, which concatenations form palindromes — hashing prefix/suffix sets scales where KMP-per-string does not.",
      "Longest palindromic SUFFIX instead (append at the end): the trick mirrors — reverse(s) + '#' + s.",
    ],
    related: ["longest-palindromic-substring", "palindrome-pairs", "find-the-index-of-the-first-occurrence-in-a-string"],
    verify: {
      fn: "shortestPalindrome",
      wrap: "plain",
      cases: [
        { args: ["aacecaaa"], expect: "aaacecaaa" },
        { args: ["abcd"], expect: "dcbabcd" },
        { args: [""], expect: "" },
        { args: ["a"], expect: "a" },
        { args: ["abb"], expect: "bbabb" },
        { args: ["aabba"], expect: "abbaabba" },
      ],
    },
    xp: 35,
  },
];
