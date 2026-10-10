// Deep-dives — Bit Manipulation (NeetCode 150 section + TI150 uniques). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const BIT_MANIP: LcDeepDive[] = [
  {
    slug: "single-number",
    statement:
      "Every element of an integer array appears exactly twice, except for one element that appears exactly once. Return that singleton. The fine print is the real assignment: linear time and constant extra space, which quietly disqualifies the hash-set answer everyone reaches for first.",
    examples: [
      { input: "nums = [2,2,1]", output: "1" },
      { input: "nums = [4,1,2,1,2]", output: "4", explanation: "1 and 2 each appear twice; 4 is the singleton." },
      { input: "nums = [1]", output: "1", explanation: "A one-element array is its own answer." },
    ],
    constraints: ["1 <= nums.length <= 3·10^4", "-3·10^4 <= nums[i] <= 3·10^4", "exactly one element appears once; every other element appears exactly twice"],
    breakdown: [
      "The question underneath the question: can you cancel matched pairs without ever storing them? A set or Counter solves it in O(n) time and O(n) space, which is exactly why the follow-up clause exists. The interesting problem begins only once 'no extra memory' is on the table and the data-structure route is closed.",
      "The naive misstep is sorting and stepping in pairs — after a sort, the singleton sits at the first even index whose right-hand partner differs. It works, but it costs O(n log n), usually mutates the input, and answers the letter of the question rather than its spirit. Interviewers will push precisely there.",
      "The algebra that unlocks the O(1)-space version: XOR is its own inverse. a ^ a = 0, a ^ 0 = a, and the operation commutes and associates freely. XOR-ing the entire array therefore lets every duplicated value annihilate its twin regardless of position, and the sole odd-count survivor — the singleton — is all that remains.",
    ],
    edges: [
      "Pair positions are irrelevant: [2,2,1] and [4,1,2,1,2] must both work — commutativity does the heavy lifting, not adjacency.",
      "Negatives need no special code: Python's bitwise ops treat ints as infinite two's complement, and x ^ x = 0 still holds.",
      "A single-element array returns that element: the accumulator starts at 0 and 0 ^ x = x.",
      "Zero is a legitimate value, not just the identity: it cancels like any other number when paired.",
    ],
    ladder: [
      { title: "Brute force — count occurrences", body: "A dict counting each value, then scan for the key with count 1. O(n) time but O(n) space — correct, and precisely what the follow-up forbids. Name it, then explain why you're moving on." },
      { title: "Sort and step in pairs", body: "After sorting, equal values sit adjacent; check indices 0, 2, 4… until nums[i] != nums[i+1]. O(n log n) time and typically O(1) space with an in-place sort — better, but still carrying a log factor and a mutation." },
      { title: "The optimal idea — XOR annihilation", body: "Fold the whole array through one XOR accumulator. Pairs cancel to zero, and the singleton XORed against zero is itself. One pass, one integer of state, no mutation — the canonical bit-manipulation opener." },
    ],
    approach: "XOR accumulator",
    code: `def singleNumber(nums):
    acc = 0                     # XOR identity: 0 ^ x == x
    for n in nums:
        acc ^= n                # paired values annihilate; the singleton survives
    return acc`,
    walkthrough: [
      "The invariant: after k elements, acc is the XOR of exactly those k values. Every value seen an even number of times has contributed zero in net effect, because each pair of sightings XORs to zero under some parenthesization — associativity guarantees the grouping exists. What survives is the XOR of odd-count values, and the problem guarantees there is exactly one of those.",
      "Trace [4,1,2,1,2]: acc runs 0 → 4 → 5 → 7 → 6 → 4. The intermediates look like noise, and that is the point — XOR has no monotone structure, only pairing algebra, so nothing meaningful can be read off until the final element lands. The answer appears exactly when the last twin cancels.",
      "Why this beats the set: the set must remember every value until it can prove a duplicate, while the accumulator remembers one integer and lets algebra do the deduplication. This is the template for the whole XOR family — 260 splits on a set bit of the combined value, 137 counts bits mod 3 — and every one of them starts from a ^ a = 0.",
    ],
    time: "O(n) — one pass with a constant-time op per element",
    space: "O(1) — a single integer accumulator regardless of input size",
    followUps: [
      "Exactly two singletons instead of one (Single Number III)? One pass yields a ^ b, still tangled — the combined value's lowest set bit becomes a partition key that splits the array into two independent instances of this problem.",
      "Every value appears three times except one (Single Number II)? XOR can't count past parity — you need the ones/twos state machine or a per-bit mod-3 counter, since a value XORed three times restores itself.",
    ],
    related: ["single-number-iii", "single-number-ii", "missing-number"],
    verify: {
      fn: "singleNumber",
      wrap: "plain",
      cases: [
        { args: [[2, 2, 1]], expect: 1 },
        { args: [[4, 1, 2, 1, 2]], expect: 4 },
        { args: [[1]], expect: 1 },
        { args: [[0, 1, 0]], expect: 1 },
        { args: [[-30000, 30000, -30000]], expect: 30000 },
      ],
    },
    xp: 10,
  },
  {
    slug: "number-of-1-bits",
    statement:
      "Given a 32-bit unsigned integer (presented as a plain non-negative integer), count how many of its 32 bits are 1 — its Hamming weight. The count is over the binary expansion, not the decimal digits: 11 is binary 1011, so the answer is 3.",
    examples: [
      { input: "n = 11 (binary …00001011)", output: "3", explanation: "Bits 0, 1 and 3 are set." },
      { input: "n = 128 (binary …00010000000)", output: "1" },
      { input: "n = 4294967293 (binary 1111…1101)", output: "31", explanation: "All 32 bits set except bit 1." },
    ],
    constraints: ["0 <= n <= 4294967295 — the full unsigned 32-bit range", "the input is a bit pattern; treat it as unsigned, never as signed"],
    breakdown: [
      "The baseline loop shifts n right one bit at a time, tests the low bit, and counts — exactly 32 iterations, always. It is correct and worth saying first. The classic answer refines it in a subtler direction: instead of one iteration per POSITION, spend one iteration per SET BIT, so sparse words finish early and dense words cost no more than before.",
      "The workhorse identity: n & (n − 1) deletes n's lowest set bit. Subtracting 1 borrows through the trailing zeros, flipping the lowest 1 to 0 and the zeros below it to 1s; AND-ing with the original keeps only the bits above that borrow point. Repeat until the word hits zero — the number of rounds is the popcount.",
      "The misstep to avoid is testing (n >> i) & 1 across all 32 positions while calling it optimal — it always pays full price even for n = 1. What interviewers listen for is the termination argument: each n & (n − 1) strictly removes one 1-bit, so the loop provably ends in k rounds for k set bits. Worth closing with: hardware calls this popcount, and bin(n).count('1') is the Python one-liner — fine as a footnote, not as your answer.",
    ],
    edges: [
      "n = 0 returns 0 without special-casing — the loop body simply never runs.",
      "n = 2147483648 (2^31) has a single set bit in the top position; it must return 1, and it's the value that breaks code assuming a signed input elsewhere.",
      "n = 4294967295 (all ones) is the trick's worst case: 32 rounds, same as the naive loop — the win is on sparse words.",
      "The word is UNSIGNED by spec: 4294967293 is thirty-one 1s, not −3.",
    ],
    ladder: [
      { title: "Brute force — test all 32 positions", body: "for i in range(32): count += (n >> i) & 1. Exactly 32 iterations no matter what; simple, correct, and the baseline to name before improving it." },
      { title: "Shift-and-count the low bit", body: "While n: count += n & 1, then n >>= 1. Same asymptotics but it stops once the word is exhausted — still up to 32 rounds for unsigned input, since the leading zeros must be consumed to reach the end." },
      { title: "The optimal idea — erase set bits with n & (n − 1)", body: "Each AND removes the lowest set bit, so the loop runs once per 1-bit rather than once per position. Identical worst case, dramatically faster on sparse words — and the identity itself is what the question is really testing." },
    ],
    approach: "n & (n − 1) set-bit erasure (Kernighan's trick)",
    code: `def hammingWeight(n):
    count = 0
    while n:
        n &= n - 1              # delete the lowest set bit
        count += 1              # one round per 1 in the word
    return count`,
    walkthrough: [
      "Trace n = 11 (1011): 11 & 10 = 10 (1010), 10 & 9 = 8 (1000), 8 & 7 = 0. Three rounds, count = 3 — and notice round two skipped the zero at bit 1 entirely, where the shift loop would have visited it. Termination is structural: each round strictly reduces the population of 1s, which is a non-negative integer.",
      "Why the subtraction borrows: n − 1 flips the trailing zeros to 1s and the lowest set bit to 0 (101100 → 101011). AND-ing with the original therefore preserves everything above the borrow point and discards everything at or below it — exactly 'remove the lowest set bit'. The identity needs no special cases for zeros at the bottom, the top, or anywhere between.",
      "Complexity is O(k) for k set bits, bounded by 32 but usually far smaller. The same identity family powers this whole section: x & −x ISOLATES the lowest set bit (the partition key in Single Number III) while x & (x − 1) DELETES it (here, and in Counting Bits' DP). Knowing both directions of the lowest-set-bit trick is the takeaway.",
    ],
    time: "O(k) — one round per set bit, k ≤ 32",
    space: "O(1) — a counter and a mutable copy of n",
    followUps: [
      "Parity of a word (even vs odd number of 1s): the same loop works, or fold the word against itself at halving widths — the classic branchless parity computation.",
      "Emitting the count for every value 0..n is Counting Bits: the identical identity gives the DP ans[i] = ans[i & (i − 1)] + 1, reusing answers already computed.",
    ],
    related: ["counting-bits", "reverse-bits", "single-number"],
    verify: {
      fn: "hammingWeight",
      wrap: "plain",
      cases: [
        { args: [11], expect: 3 },
        { args: [128], expect: 1 },
        { args: [4294967293], expect: 31 },
        { args: [2147483648], expect: 1 },
        { args: [0], expect: 0 },
        { args: [4294967295], expect: 32 },
      ],
    },
    xp: 10,
  },
  {
    slug: "counting-bits",
    statement:
      "For every integer i from 0 through n, determine how many 1-bits i has in binary, and return all n + 1 answers as one array. Computing each entry independently is legal but misses the point — the problem's stated follow-up demands an O(n) pass that reuses earlier answers, and that requirement is the actual interview question.",
    examples: [
      { input: "n = 2", output: "[0,1,1]", explanation: "0 is 0, 1 is 1, 2 is 10." },
      { input: "n = 5", output: "[0,1,1,2,1,2]", explanation: "3 is 11 → 2; 4 is 100 → 1; 5 is 101 → 2." },
      { input: "n = 0", output: "[0]" },
    ],
    constraints: ["0 <= n <= 10^5", "aim for O(n) total — no per-element popcount call", "the output array does not count as extra space"],
    breakdown: [
      "Per-number popcount costs O(n log n) in aggregate — log-bits of work per entry, which is bin(i).count('1') in a comprehension. The problem's real demand is the DP: every i's bit pattern is one edit away from a strictly smaller index's pattern, so each answer is computable in O(1) from a finished cell. The cleanest recurrence: i in binary is (i >> 1) followed by the bit (i & 1), so ans[i] = ans[i >> 1] + (i & 1).",
      "The sibling recurrence comes straight from Kernighan's trick in Number of 1 Bits: i & (i − 1) deletes i's lowest set bit, so ans[i] = ans[i & (i − 1)] + 1. Both recurrences reference only indices strictly below i, which means a single left-to-right fill is automatically safe — the array you are writing is also your memo table, no recursion needed.",
      "The misstep is treating this as 10^5 independent popcounts. The moment you notice 'answer for i derives from the answer for a smaller number', the problem stops being a bit-counting exercise and becomes textbook bottom-up DP over a self-similar structure — binary numerals are literally built by appending a bit to a shorter numeral, so their popcounts inherit.",
    ],
    edges: [
      "n = 0 → [0]: the loop never runs and the base case is the whole answer.",
      "n = 1 → [0, 1]: the first DP step, ans[1] = ans[0] + (1 & 1) = 1 — a two-second sanity check.",
      "Powers of two always snap back to popcount 1: ans[8] = 1 and ans[16] = 1 are free correctness probes on any implementation.",
      "Inclusive range: indices run 0..n, so the array needs n + 1 slots — the off-by-one that breaks most first submissions.",
    ],
    ladder: [
      { title: "Brute force — popcount each number", body: "For each i, loop over its bits or call bin(i).count('1'). O(n log n) total; fine at small n, but it fails the problem's stated follow-up and wastes the array you're building anyway." },
      { title: "Block pattern — powers of two reset", body: "Every power of two has popcount 1, and each block between powers repeats the previous block with one added: [0,1] then [1,2] then [1,2,2,3]… Implementable, but the block bookkeeping is fiddly compared to a one-line recurrence." },
      { title: "The optimal idea — one recurrence, one pass", body: "ans[i] = ans[i >> 1] + (i & 1): shifting i right discards exactly its low bit, and the shifted value is already solved. Linear time, no extra space beyond the output, no bit-position loops." },
    ],
    approach: "Bottom-up DP on i >> 1",
    code: `def countBits(n):
    ans = [0] * (n + 1)              # ans[0] = 0 is the base case
    for i in range(1, n + 1):
        ans[i] = ans[i >> 1] + (i & 1)   # i's bits = (i >> 1)'s bits + low bit
    return ans`,
    walkthrough: [
      "Read the recurrence aloud: i's binary form is (i >> 1)'s binary form followed by the bit (i & 1). Shifting right discards exactly one bit — the low bit — so i's popcount is the popcount of its shifted self plus that discarded bit. Because i >> 1 < i for all i ≥ 1, the left-to-right fill always reads a cell that is already final.",
      "Trace n = 5: ans[1] = ans[0] + 1 = 1; ans[2] = ans[1] + 0 = 1 (10 is 1 then 0); ans[3] = ans[1] + 1 = 2; ans[4] = ans[2] + 0 = 1; ans[5] = ans[2] + 1 = 2. Every power of two lands on the previous power after its shift, which is why the sequence keeps snapping back to 1 — [0,1,1,2,1,2,2,3,1,…] and the fractal is visible to the eye.",
      "The Kernighan variant ans[i] = ans[i & (i − 1)] + 1 produces the identical array: it reads the popcount of i minus its lowest set bit. Both are O(n); the shift version is marginally friendlier because i >> 1 is always roughly i/2, giving the table a wave structure that is easy to eyeball on a whiteboard. Mentioning that both decompositions exist — and why — separates a memorized DP from an understood one.",
    ],
    time: "O(n) — one O(1) recurrence per entry",
    space: "O(1) extra — the output array IS the DP table",
    followUps: [
      "Kernighan's dual: verify ans[i] = ans[i & (i − 1)] + 1 yields the same array, and articulate why both 'i is a smaller number plus one bit' decompositions are valid.",
      "If the answers for 0..i−1 are already available (a queryable table), each new i costs one recurrence step — the DP is already the streaming solution, which is why the follow-up clause costs nothing extra.",
    ],
    related: ["number-of-1-bits", "reverse-bits"],
    verify: {
      fn: "countBits",
      wrap: "plain",
      cases: [
        { args: [2], expect: [0, 1, 1] },
        { args: [5], expect: [0, 1, 1, 2, 1, 2] },
        { args: [0], expect: [0] },
        { args: [1], expect: [0, 1] },
        { args: [15], expect: [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4] },
      ],
    },
    xp: 10,
  },
  {
    slug: "reverse-bits",
    statement:
      "Reverse the 32 bits of a given unsigned integer and return the result, also read as unsigned. The reversal is positional: input bit i becomes output bit 31 − i, and the leading zeros of the input are real data — reversing 1 must produce 2^31, not 1.",
    examples: [
      { input: "n = 43261596 (00000010100101000001111010011100)", output: "964176192 (00111001011110000010100101000000)" },
      { input: "n = 4294967293 (11111111111111111111111111111101)", output: "3221225471 (10111111111111111111111111111111)", explanation: "The lone low-order zero lands at bit 30 after reversal." },
      { input: "n = 1 (…0001)", output: "2147483648 (1000…0000)", explanation: "Leading zeros are part of the word and get reversed into it." },
    ],
    constraints: ["input is an integer in 0 <= n < 2^32 (unsigned 32-bit)", "the output must be interpreted as unsigned 32-bit as well"],
    breakdown: [
      "The canonical shape is a fixed 32-step loop: peel n's lowest bit, push it onto the output's low end, shift n right and the output left. After 32 rounds every position has been mirrored exactly once. The iteration count is FIXED — not 'while n > 0' — because leading zeros are payload here: they become the high-order zeros of the output, and stopping early returns a half-reversed answer.",
      "The two classic missteps: looping while n > 0, which quits once the consumed remainder is zero and drops the zero-padding that should have been shifted into the output's top; and interpreting the word as signed, where the presence of bit 31 makes values negative and results come out wrong. In Python, mask the input to 0xFFFFFFFF at entry — one line that makes the function safe even for a caller who passes −1 meaning 'all bits set'.",
      "If pushed for more, the polished follow-up is divide-and-conquer bit swapping: exchange the two 16-bit halves, then 8-bit, 4-bit, 2-bit and 1-bit pairs using the famous mask ladder (0x5555…, 0x3333…, 0x0F0F…). Five full-word rounds instead of 32 sequential moves — same asymptotics, smaller constant, and knowing why the masks are repeating patterns is the flourish interviewers remember.",
    ],
    edges: [
      "n = 0 → 0: the all-zeros word is its own mirror.",
      "n = 1 → 2147483648: the single 1 at position 0 must land at position 31 — the case that kills any while-n>0 loop.",
      "n = 2147483648 → 1: the symmetric counterpart; also the input that naive signed handling would mangle as negative.",
      "Palindromic bit patterns return unchanged — a free self-check if you construct one deliberately.",
    ],
    ladder: [
      { title: "Brute force — bit-string round trip", body: "Format n as a zero-padded 32-wide binary string, reverse the characters, parse back with int(s, 2). Correct only if the zero-padding survives the round trip — forget the width flag and short words come back short. String machinery for what is, at heart, a register rotation." },
      { title: "Shift-mirror loop", body: "32 fixed iterations of out = (out << 1) | (n & 1), n >>= 1. The canonical answer: linear in the word width, O(1) space, no strings, no branches." },
      { title: "The optimal idea — log-rounds bit swapping", body: "Swap halves recursively with mask/shift pairs (adjacent bits, then pairs, nibbles, bytes, 16-bit halves): five full-word rounds replace 32 sequential moves. Constant-factor theatre, but explaining the mask ladder demonstrates real bit-twiddling fluency." },
    ],
    approach: "Fixed 32-round shift-mirror",
    code: `def reverseBits(n):
    n &= 0xFFFFFFFF              # normalize to an unsigned 32-bit word
    out = 0
    for _ in range(32):          # fixed count — leading zeros are payload
        out = (out << 1) | (n & 1)   # push n's low bit onto out
        n >>= 1                  # consume the bit just copied
    return out`,
    walkthrough: [
      "The invariant: after k rounds, out holds the low k bits of the original n laid down in reverse at the word's top, and n has been consumed exactly k bits deep. Each round peels one bit off n's right edge and appends it to out's right edge while out is itself left-shifting — appending into a shifting register across 32 rounds is precisely the positional mirror.",
      "Trace n = 2 (…000010): round 1 copies bit 0 (a 0), round 2 copies bit 1 (a 1) → out = 1, and the remaining 30 rounds shift that 1 left thirty more places, landing on 2^30 = 1073741824. The 'boring' zero-copies at the end are the whole point — they carry the early-captured bits up into the high positions. Skipping them is the classic half-length answer.",
      "The entry mask costs nothing in the common case and makes the function robust to a signed caller: −1 & 0xFFFFFFFF is the all-ones word, exactly the intent. For the divide-and-conquer variant, each round is a pair like ((x & 0x55555555) << 1) | ((x >> 1) & 0x55555555) — swap adjacent bits — then widen the stride. Both versions are O(word width); the loop is what you write first while narrating the fancier one.",
    ],
    time: "O(1) — 32 fixed rounds for a 32-bit word (O(w) in the width w)",
    space: "O(1) — two integer registers",
    followUps: [
      "Reverse only the k low bits of a word: run the loop k times instead of 32 — the fixed-iteration framing makes the generalization a one-token change.",
      "Write the divide-and-conquer version: five swap rounds with masks 0x55555555, 0x33333333, 0x0F0F0F0F, 0x00FF00FF, 0xFFFF0000 — and explain why each mask is a repeating pattern at double the previous period.",
    ],
    related: ["number-of-1-bits", "counting-bits", "reverse-integer"],
    verify: {
      fn: "reverseBits",
      wrap: "plain",
      cases: [
        { args: [43261596], expect: 964176192 },
        { args: [4294967293], expect: 3221225471 },
        { args: [0], expect: 0 },
        { args: [1], expect: 2147483648 },
        { args: [2147483648], expect: 1 },
        { args: [2], expect: 1073741824 },
      ],
    },
    xp: 10,
  },
  {
    slug: "missing-number",
    statement:
      "An array of length n contains the integers 0..n with exactly one value missing. Return the missing value. The array is unsorted, the gap can sit anywhere in the range including either endpoint, and the O(n)-time O(1)-space expectation quietly deletes the convenient answers.",
    examples: [
      { input: "nums = [3,0,1]", output: "2", explanation: "n = 3 spans 0..3; only 2 is absent." },
      { input: "nums = [0,1]", output: "2", explanation: "The missing value can be n itself — the endpoint the array can't supply." },
      { input: "nums = [9,6,4,2,3,5,7,0,1]", output: "8" },
    ],
    constraints: ["1 <= nums.length <= 10^4", "0 <= nums[i] <= n where n = nums.length", "all values are distinct; exactly one of 0..n is missing"],
    breakdown: [
      "Two elegant O(n)-time O(1)-space solutions exist, and both are 'fold the entire problem through one accumulator'. The Gauss sum: 0..n totals n(n+1)/2, so the answer is that total minus the array's sum. The XOR fold: combine the indices 0..n−1, the seed value n, and every array element — each number present in the array appears once on each side and cancels via a ^ a = 0, leaving only the never-seen value.",
      "The sum approach carries a footnote that matters in fixed-width languages: the running total grows quadratically and can overflow where XOR never exceeds the largest input's width. Python doesn't care, but the general lesson — sums accumulate magnitude, XORs stay bounded — is why the bit-flavored version exists at all. Present the XOR fold as the answer, mention the sum as the one-liner you'd actually ship.",
      "The missteps: sorting first (O(n log n) for a problem that needs no order), a hash set (O(n) space), or the sneaky one — scanning 0..n and doing an array membership check per candidate, which is O(n²) wearing an O(n) costume. And note the seed: the XOR fold must include n itself (via the initial accumulator or an extra index), because 'the missing value is n' is the one case the array's contents cannot testify about.",
    ],
    edges: [
      "Missing value is 0: [1] → 0 — the fold must catch a value that never appears as data.",
      "Missing value is n: [0,1] → 2 — exactly what the seed n exists to handle.",
      "Single-element arrays: [0] → 1 and [1] → 0 must both pass; they exercise both endpoints in four bytes.",
      "Unsortedness is irrelevant to both folds — if you find yourself sorting, you've already left the optimal path.",
    ],
    ladder: [
      { title: "Brute force — search every candidate", body: "For each v in 0..n, linearly scan the array for v; the first miss is the answer. O(n²), correct, and exactly the answer to reject out loud: the per-candidate scan is the entire cost." },
      { title: "Sort or hash", body: "Sort and find the first index with nums[i] != i (O(n log n)), or collect a set and sweep 0..n (O(n) time, O(n) space). Both are respectable intermediate answers; both give back a log factor or linear memory the problem didn't ask for." },
      { title: "The optimal idea — one-fold algebra", body: "Gauss-sum difference or an XOR fold over {0..n−1 indices} ∪ {n} ∪ {values}. Every present value cancels its twin; the missing number, seen once, survives. One pass, one integer, no mutation." },
    ],
    approach: "XOR fold over indices and values",
    code: `def missingNumber(nums):
    missing = len(nums)          # seed with n — the value only the seed can supply
    for i, n in enumerate(nums):
        missing ^= i ^ n         # index i pairs off with value i; pairs cancel
    return missing               # everything annihilates except the gap`,
    walkthrough: [
      "The membership argument: the multiset {0, 1, …, n−1} ∪ {n} contains every value in 0..n exactly once, and the array contains that same collection minus one element m. XOR is commutative and self-inverse, so folding the first collection against the array's values leaves m — every other value appears once per side and annihilates. The seed n is not decoration; it is the only representative of the value n when n is the missing one.",
      "Trace [3,0,1]: seed = 3. i=0: 3 ^ 0 ^ 3 = 0 — the value 3 instantly cancels its seed. i=1: 0 ^ 1 ^ 0 = 1. i=2: 1 ^ 2 ^ 1 = 2. Return 2. Position never mattered; only pairing did. The same trace under the sum approach: 3·4/2 = 6, minus (3+0+1), equals 2.",
      "Choosing between the two folds is a systems decision, not an algorithmic one: XOR when overflow could bite (huge n, 32-bit registers), the sum when clarity wins (Python, small ranges). One sentence lands the whole topic: XOR is addition mod 2 applied per bit, while the sum is addition over the full range — two arithmetics computing the same inventory mismatch.",
    ],
    time: "O(n) — one pass over indices and values",
    space: "O(1) — a single accumulator",
    followUps: [
      "Two missing values instead of one? The fold returns their combined XOR a ^ b — recovering both needs the lowest-set-bit partition of Single Number III, applied to index-vs-value pairs.",
      "If the array were sorted, binary search on nums[i] == i finds the gap in O(log n); the unsorted version has no such shortcut — order is information you'd otherwise have to buy.",
    ],
    related: ["single-number", "first-missing-positive", "find-the-duplicate-number"],
    verify: {
      fn: "missingNumber",
      wrap: "plain",
      cases: [
        { args: [[3, 0, 1]], expect: 2 },
        { args: [[0, 1]], expect: 2 },
        { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expect: 8 },
        { args: [[0]], expect: 1 },
        { args: [[1]], expect: 0 },
      ],
    },
    xp: 10,
  },
  {
    slug: "sum-of-two-integers",
    statement:
      "Return the sum of two integers a and b without using the + or − operators. Bitwise AND, XOR, OR, shifts and comparisons are all fair game. In Python the constraint hides a second, deeper trap: integers are unbounded, so you must manufacture the fixed 32-bit register the problem assumes — and interpret it back into signed form at the end.",
    examples: [
      { input: "a = 1, b = 2", output: "3" },
      { input: "a = -2, b = 3", output: "1", explanation: "Negatives work because the machinery is two's complement, not sign-and-magnitude." },
      { input: "a = 2147483647, b = 1", output: "-2147483648", explanation: "The 32-bit register wraps: INT_MAX + 1 is INT_MIN." },
    ],
    constraints: ["-1000 <= a, b <= 1000 in the official spec — but the technique must survive full 32-bit extremes", "no + or - operators anywhere in the solution"],
    breakdown: [
      "This is a half-adder wired into a loop. a XOR b is the per-bit sum ignoring carries (1+1 = 10 → write 0, carry 1), and a AND b marks every column that PRODUCES a carry — shifted left once, because carries always flow into the next column. So a + b = (a ^ b) + ((a & b) << 1); the expression still contains a '+', so iterate: replace (a, b) with (a ^ b, (a & b) << 1) until the carry term dies, at which point a is the sum.",
      "Termination lives in the register width. Each round moves every carry at least one column left, and a carry pushed past bit 31 falls off a real CPU's 32-bit word and vanishes — at most 32 rounds. Python has no edge to fall off: negative ints are sign-extended infinitely, so an unmasked loop can chase a carry forever. THE fix, and the centerpiece of any Python submission: mask every intermediate with MASK = 0xFFFFFFFF, which manufactures the missing fixed-width register by fiat.",
      "After the loop, a holds the answer in UNSIGNED 32-bit clothing. If a exceeds 0x7FFFFFFF it is really a negative two's-complement value, and ~(a ^ MASK) — algebraically a − 2^32 — translates it back into Python's signed world. Skipping the reinterpretation returns 4294967294 instead of −2, and skipping the mask breaks half the test suite; explaining both steps out loud is the actual interview payload of this problem.",
    ],
    edges: [
      "INT_MAX + 1 must WRAP to −2147483648 — that is the semantics the mask encodes; without it Python would happily return 2147483648.",
      "−1 + −1 = −2: the carry chain runs through and past the sign bit; the mask truncates it and the signed reinterpretation rebuilds the negative.",
      "a = 0 or b = 0: make the carry the loop condition (while b) so zero operands skip the loop entirely — no special case needed.",
      "The loop's tuple assignment must evaluate both sides from the OLD a and b — Python's a, b = x, y does this natively; languages without it need a temporary.",
    ],
    ladder: [
      { title: "Brute force — inc/dec loop", body: "Increment a toward the sum one bitwise-increment at a time: O(|b|) iterations, and a bitwise increment itself needs a mini adder — the approach collapses into the real solution with worse complexity. Name it, reject it in one sentence." },
      { title: "Adder logic without the mask", body: "while b: a, b = a ^ b, (a & b) << 1. Perfect in C or Java where int is genuinely 32 bits wide. In Python it can loop forever on negative inputs or 'wrap' at arbitrary precision — the mask is not optional there." },
      { title: "The optimal idea — masked 32-bit adder + signed reinterpretation", body: "Clamp every step with & 0xFFFFFFFF, loop until the carry dies, then convert values above 0x7FFFFFFF back to negatives via ~(a ^ MASK). You are literally emulating a CPU's 32-bit adder — and its overflow semantics — inside an unbounded language." },
    ],
    approach: "Iterated full adder under a 32-bit mask",
    code: `def getSum(a, b):
    MASK = 0xFFFFFFFF        # manufacture the 32-bit register Python lacks
    MAX_INT = 0x7FFFFFFF     # largest positive value in 32-bit two's complement
    while b:
        a, b = (a ^ b) & MASK, ((a & b) << 1) & MASK
        # a ^ b       : per-bit sum, carries ignored
        # (a & b)<<1  : the carries, moved into the next column
    # a is now the UNSIGNED 32-bit sum; re-sign it for Python's world:
    return a if a <= MAX_INT else ~(a ^ MASK)   # ~(a ^ MASK) == a - 2**32`,
    walkthrough: [
      "The invariant: the true mathematical sum a + b never changes across an iteration — (a ^ b) plus the shifted carry IS the sum, merely re-split into a no-carry part and a carry part. The carry's lowest set bit strictly climbs each round, and the mask guillotines anything reaching past bit 31, so within at most 32 rounds b is zero and a carries the whole result.",
      "Trace −1 + 1: round 1 gives sum 0xFFFFFFFE and carry 2; the carry then marches left one column per round (4, 8, 16, …) while the sum part loses its low bits in step. When the carry reaches 2^31, the next round XORs it against the matching bit of the sum — both vanish (sum 0, carry 2^32 masked to 0). The final 1 walked off the end of the register and ceased to exist: exactly what hardware does, and exactly why the answer is 0.",
      "Now the finale: 2147483647 + 1 ends the loop with a = 0x80000000 — unsigned 2147483648, which as a signed 32-bit word is −2147483648. The conversion ~(a ^ MASK): XOR with the mask flips all 32 bits (0x80000000 → 0x7FFFFFFF), and Python's ~ negates-then-subtracts-one, landing on −2147483648. The mask made us speak unsigned; this line translates back. Once you can narrate those two sentences, the entire dance — adder, mask, reinterpretation — is yours.",
    ],
    time: "O(1) — at most 32 masked rounds for 32-bit inputs",
    space: "O(1) — two integers and two constants",
    followUps: [
      "Recursive form: return a if b == 0 else reinterpret(getSum((a ^ b) & MASK, ((a & b) << 1) & MASK)) — same invariant, with the signed conversion parked at the base case.",
      "Subtraction without −: getSum(a, getSum(~b, 1)) — negation in two's complement is ~b + 1, itself assembled from this very adder.",
    ],
    related: ["add-binary", "divide-two-integers", "multiply-strings"],
    verify: {
      fn: "getSum",
      wrap: "plain",
      cases: [
        { args: [1, 2], expect: 3 },
        { args: [-2, 3], expect: 1 },
        { args: [-1, -1], expect: -2 },
        { args: [0, 0], expect: 0 },
        { args: [2147483647, 1], expect: -2147483648 },
        { args: [-2147483648, -1], expect: 2147483647 },
      ],
    },
    xp: 20,
  },
  {
    slug: "reverse-integer",
    statement:
      "Reverse the digits of a signed 32-bit integer — 123 becomes 321, −123 becomes −321 — but return 0 if the reversed value would fall outside the signed 32-bit range [−2^31, 2^31 − 1]. The reversal is the warm-up; the overflow policy is the interview.",
    examples: [
      { input: "x = 123", output: "321" },
      { input: "x = -123", output: "-321", explanation: "The sign rides along; only digits reverse." },
      { input: "x = 1534236469", output: "0", explanation: "Reversed is 9646324351, which exceeds 2^31 − 1." },
    ],
    constraints: ["-2^31 <= x <= 2^31 - 1", "return 0 when the reversed value overflows the same range"],
    breakdown: [
      "The digit machinery is standard POP-and-push: pop the last digit with x % 10, push it onto the accumulator with rev = rev * 10 + pop, repeat until x is exhausted. The only design decision with real consequences is where the overflow check lives — before the risky multiplication (pre-check) or after the value is fully built (post-check) — and that decision depends on your number system, not your algorithm.",
      "In Java or C++, where int truly is 32 bits, the post-check is too late: rev * 10 has already wrapped by the time you inspect it, so you MUST pre-check — refuse the push when rev > INT_MAX / 10, or when rev == INT_MAX / 10 and the incoming digit exceeds the boundary's last digit. Python's unbounded integers never wrap, so a post-check against the 32-bit bounds is correct there and far more readable. Knowing which regime you occupy is the point being tested.",
      "Negativity adds Python-specific friction: // and % floor toward −∞, so −123 % 10 is 7 — not the digit 3 you want. The clean fix is to peel the sign first, reverse the magnitude, and re-apply the sign at the end. C/Java get this for free (−123 % 10 = −3), another small Python-versus-the-world footnote worth one sentence in an interview.",
    ],
    edges: [
      "x = INT_MIN (−2147483648): in C/Java you cannot simply negate it — −(−2^31) is unrepresentable — a famous trap; in Python abs() is safe, but say why out loud. Its reversal overflows anyway → 0.",
      "Trailing zeros vanish on reversal: 120 → 21 (021). The numeric accumulator handles this for free; string reversal needs the padding handled explicitly.",
      "Near-miss VALID reversals: 1463847412 → 2147483641 stays inside the range and must not be rejected — an all-overflow test suite hides this bug completely.",
      "x = 0 returns 0; the loop never runs and the sign application is a no-op.",
    ],
    ladder: [
      { title: "Brute force — string round trip", body: "str(abs(x))[::-1], parse, re-sign, bounds-check. Works in Python; in fixed-width languages the parse can itself overflow and string conversion is the slow path. A legitimate first answer, followed immediately by 'now without strings'." },
      { title: "Post-checked digit loop", body: "Build rev = rev * 10 + x % 10 until x is gone, then compare against the 32-bit bounds. Correct in Python precisely because ints never wrap; silently broken in C/Java where the wrap happens before the check ever runs." },
      { title: "The optimal idea — pre-checked POP-and-push", body: "Before each push, verify rev ≤ INT_MAX // 10 (with the final-digit refinement), so an out-of-range value is never even constructed. Language-portable, and it demonstrates the mature instinct: guard overflow at the moment of creation, not after the fact." },
    ],
    approach: "POP-and-push digits with a pre-push overflow guard",
    code: `def reverse(x):
    INT_MAX = 2**31 - 1              # 2147483647
    sign = -1 if x < 0 else 1
    x = abs(x)                       # magnitude only; sign reapplied at the end
    rev = 0
    while x:
        pop = x % 10                 # peel the last digit
        x //= 10
        if rev > INT_MAX // 10 or (rev == INT_MAX // 10 and pop > 7):
            return 0                 # the push we're about to do would overflow
        rev = rev * 10 + pop         # push onto the accumulator
    return sign * rev`,
    walkthrough: [
      "The pre-check is boundary arithmetic performed before the damage: the next push rev * 10 + pop exceeds 2147483647 exactly when rev > 214748364 (INT_MAX // 10), or when rev == 214748364 and pop > 7 — 214748364 · 10 + 8 is the first forbidden value. Because every earlier push passed the same guard, rev never holds an overflowed value even transiently, and the final rev is safe by construction.",
      "Sign handling by separation: strip the sign, reverse the magnitude, re-apply. That sidesteps Python's floor-toward-minus-infinity modulo (−123 % 10 = 7) and mirrors what C/Java code must do for INT_MIN anyway, since −(−2^31) does not exist in 32 bits. A subtle asymmetry makes guarding against INT_MAX alone safe for both signs: no in-range input's magnitude can reverse to exactly 2147483648 (its source would be 8463847412, itself out of range), so the negative boundary is unreachable rather than special-cased.",
      "The post-check alternative — build rev freely, then test −2^31 ≤ rev ≤ 2^31 − 1 at the end — is correct ONLY because Python ints are unbounded; the identical line in Java wraps silently before the comparison runs. That asymmetry is the takeaway: the right overflow strategy is a property of the number system you run in, not of the algorithm. Trace 1463847412 to feel the boundary: the last pre-check sees rev == 214748364 with pop == 1, which passes, yielding 2147483641.",
    ],
    time: "O(log |x|) — one iteration per decimal digit",
    space: "O(1) — sign, accumulator, and one digit in flight",
    followUps: [
      "Port to Java: the guard becomes rev > Integer.MAX_VALUE/10 || (rev == Integer.MAX_VALUE/10 && pop > 7) — and explain why a negative-side refinement (pop < −8) is unreachable for valid inputs.",
      "Palindrome Number reuses exactly this machinery — reverse half the digits and compare, which sidesteps the overflow question entirely by never building the full reversal.",
    ],
    related: ["reverse-bits", "palindrome-number", "string-to-integer-atoi"],
    verify: {
      fn: "reverse",
      wrap: "plain",
      cases: [
        { args: [123], expect: 321 },
        { args: [-123], expect: -321 },
        { args: [120], expect: 21 },
        { args: [1534236469], expect: 0 },
        { args: [-2147483648], expect: 0 },
        { args: [1463847412], expect: 2147483641 },
      ],
    },
    xp: 20,
  },
  {
    slug: "single-number-iii",
    statement:
      "Every element of an array appears exactly twice, except two different elements that appear exactly once each. Return both singletons in any order. The follow-up is the assignment: O(n) time and O(1) extra space, which retires the counting map and demands the two-stage XOR technique.",
    examples: [
      { input: "nums = [1,2,1,3,2,5]", output: "[3,5]", explanation: "3 and 5 are unpaired; order doesn't matter." },
      { input: "nums = [-1,0]", output: "[-1,0]", explanation: "Two elements, both singletons — and negatives are fair game." },
      { input: "nums = [0,1]", output: "[0,1]" },
    ],
    constraints: ["2 <= nums.length <= 3·10^4", "-2^31 <= nums[i] <= 2^31 - 1", "exactly two values appear once; every other value appears exactly twice", "O(n) time and O(1) extra space expected"],
    breakdown: [
      "Single Number's XOR trick stalls here: folding everything yields a ^ b — the two singletons tangled into one number, useless alone. The recovery insight is that a ≠ b, so x = a ^ b ≠ 0, meaning x has at least one set bit. Its lowest set bit d is a bit position where a and b DISAGREE — that is why the bit survived the XOR — and any bit where two numbers disagree is a guaranteed discriminator between them.",
      "Partition the array on bit d: values with bit d set go to one bucket, the rest to the other. Every duplicate pair falls WHOLE into a single bucket — both copies share every bit, d included — so each bucket is an exact instance of Single Number I: full of cancelling pairs plus exactly one singleton. XOR each bucket separately and a and b emerge independently.",
      "The mechanical missteps: inventing your own discriminator bit instead of taking it from the combined XOR (an arbitrary bit can slice a duplicate pair in two, corrupting both buckets); and in Python, side-eyeing x & −x when x is negative — don't. The identity 'x & −x isolates the lowest set bit' holds for negative x under two's-complement semantics, and x cannot be zero because the singletons are distinct by hypothesis.",
    ],
    edges: [
      "Negative combined XOR: singletons −2 and 3 give x = −3, and x & −x = 1 — Python's infinite-precision two's complement keeps the identity intact; no abs() required.",
      "Zero as one of the singletons: [-1, 0] — zero XORs harmlessly and lands wherever bit d directs it.",
      "Extremes together: [2147483647, −2147483648] — the combined XOR's lowest set bit is bit 0, and the partition still splits cleanly.",
      "Output order is unspecified; this file normalizes by sorting before comparison, mirroring graders that accept either order.",
    ],
    ladder: [
      { title: "Brute force — counting map", body: "Count occurrences, return the two keys with count 1. O(n) time but O(n) space — a direct violation of the follow-up, and exactly the right thing to state first before dismantling it." },
      { title: "Sort and scan the run breaks", body: "Sorted, values pair into adjacent runs; the two run breaks expose the singletons. O(n log n) time, plus a sort's worth of space unless you may mutate — correct, but you're paying for order the algebra doesn't need." },
      { title: "The optimal idea — split on the lowest set bit of a ^ b", body: "Pass one computes x = a ^ b; diff = x & −x isolates a disagreement bit; pass two XORs the diff-partitioned buckets separately, resolving a and b. Two linear passes, three integers of state, zero auxiliary structures." },
    ],
    approach: "Combined XOR + lowest-set-bit partition",
    code: `def singleNumber(nums):
    x = 0
    for n in nums:              # pass 1: x == a ^ b, the tangled fingerprint
        x ^= n
    diff = x & -x               # lowest set bit — a and b disagree exactly here
    a = b = 0
    for n in nums:              # pass 2: partition on that bit
        if n & diff:
            a ^= n              # pairs cancel; only the bucket's singleton remains
        else:
            b ^= n
    return [a, b]               # order unspecified`,
    walkthrough: [
      "Pass 1's output x is a fingerprint of exactly where the singletons differ, and diff = x & −x selects the lowest such position; a ≠ b guarantees at least one bit survives, so diff ≠ 0. The partition is safe because duplicate pairs are bit-identical — both copies take the same branch — so each bucket is always 'some whole pairs plus at most one singleton', i.e. a Single Number I instance by construction.",
      "Trace [1,2,1,3,2,5]: x = 3 ^ 5 = 6 (110), diff = 6 & −6 = 2 (bit 1). Bucket 'bit set': {2, 2, 3} → XOR = 3. Bucket 'bit clear': {1, 1, 5} → 5. Output [3, 5]. Note bucket one contains a duplicate pair — expected and harmless, since both copies landed together and annihilated. The partition's only job was keeping the two singletons apart.",
      "This is the canonical three-beat template — one XOR for the fingerprint, one bit for the split, one XOR per group — and it echoes far beyond toy problems: XOR is the parity check of error-correcting codes, and the set bit is the syndrome locating the discrepancy. The duality with 191 is worth saying out loud: x & −x ISOLATES the lowest set bit, x & (x − 1) DELETES it — two directions of the same trick.",
    ],
    time: "O(n) — two linear passes",
    space: "O(1) — three integers",
    followUps: [
      "Three singletons instead of two? One pass gives a ^ b ^ c, and no single bit separates all three — known solutions need either repeated passes with distinct discriminators or linear space; articulating WHY one bit no longer suffices is the interesting part.",
      "If exactly one value appeared once (the original 136), the partition machinery is unnecessary — pinpoint the moment a second singleton forces the split.",
    ],
    related: ["single-number", "single-number-ii", "find-the-duplicate-number"],
    verify: {
      fn: "singleNumber",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[1, 2, 1, 3, 2, 5]], expect: [3, 5] },
        { args: [[-1, 0]], expect: [-1, 0] },
        { args: [[1, 2]], expect: [1, 2] },
        { args: [[2147483647, -2147483648]], expect: [-2147483648, 2147483647] },
        { args: [[0, 1, 0, 1, 2, 2, -5, 7]], expect: [-5, 7] },
      ],
    },
    xp: 20,
  },
  {
    slug: "single-number-ii",
    statement:
      "Every element of an array appears exactly three times, except one element that appears exactly once. Return the singleton. Your faithful XOR annihilation is useless here — a value XORed three times is itself again — so the follow-up (linear time, constant space) forces a genuinely new bit-level idea.",
    examples: [
      { input: "nums = [2,2,3,2]", output: "3" },
      { input: "nums = [0,1,0,1,0,1,99]", output: "99" },
      { input: "nums = [4,4,4,-4]", output: "-4", explanation: "Negative singletons need no special handling — the sign bit is just another bit." },
    ],
    constraints: ["1 <= nums.length <= 3·10^4", "-2^31 <= nums[i] <= 2^31 - 1", "every value appears exactly three times except one, which appears once"],
    breakdown: [
      "XOR counts parity: applied three times to the same value it nets back to the value itself, so tripled elements survive the fold and drown the singleton among them. What the problem actually needs is counting mod 3, one bit position at a time. Two integers suffice as the counter: 'ones' holds every bit position seen 1 (mod 3) times, 'twos' holds positions seen 2 (mod 3) times. Together they form a two-bit-per-position state machine: 00 → 10 → 01 → 00 as a given bit is witnessed 0, 1, 2, 3 times.",
      "The update is the heart of the solution: ones = (ones ^ n) & ~twos, then twos = (twos ^ n) & ~ones. Read it as: toggle the bit into ones unless twos has already claimed it; then toggle into twos unless ones (just updated) has it. The mutual masking is what forces a third sighting to reset both registers — a bit can never live in ones and twos at once, and the ~ masks enforce that invariant on every single step.",
      "Why the singleton survives: each tripled value drives its bits through the full cycle back to 00, contributing nothing; the singleton's bits halt mid-cycle in state 10 — precisely the ones register. Return ones. The alternative formulation, counting each of 32 bit positions across the array mod 3 and rebuilding the word, is more explicit but costs 32 passes worth of work; the state machine folds the identical arithmetic into per-element register updates.",
    ],
    edges: [
      "Negative singletons work untouched in Python: the sign bit participates in the mod-3 counting like any other (with infinite sign extension), so [4,4,4,−4] returns −4 with no sign logic. In C/Java the identical code works because ints are genuinely 32-bit two's complement.",
      "A singleton of zero is a real answer: [5,5,5,0] returns 0 — make sure your harness treats that as a value, not a failure.",
      "Four-element arrays like [2,2,3,2] exercise the entire state cycle in three updates — the best size for a whiteboard trace.",
      "Update order is load-bearing: computing twos with the OLD ones breaks the mutual exclusion and lets a bit occupy both registers — the 'then' in the update order is part of the algorithm.",
    ],
    ladder: [
      { title: "Brute force — counting map", body: "Tally occurrences, return the key with count 1. O(n) time, O(n) space — the baseline to name and reject under the O(1)-space clause." },
      { title: "Per-bit mod-3 counting", body: "For each of 32 bit positions, sum that bit across the array and take it mod 3; the remainders rebuild the singleton. O(32·n) time, O(1) space — explicit, language-portable, and the clearest way to see WHY the state machine works." },
      { title: "The optimal idea — ones/twos state machine", body: "Two registers encode per-position counts mod 3 in parallel; one pass, two updates per element, no bit-position loop. The same arithmetic as the counting version with the bookkeeping folded into register algebra." },
    ],
    approach: "ones/twos mod-3 state machine",
    code: `def singleNumber(nums):
    ones = twos = 0
    for n in nums:
        ones = (ones ^ n) & ~twos   # a bit enters 'ones' unless 'twos' holds it
        twos = (twos ^ n) & ~ones   # then likewise, using the FRESH ones
    return ones                     # tripled bits cycled home; the singleton remains`,
    walkthrough: [
      "Per-bit reading of the update, for a single position with incoming bit b: if b = 0, both XORs are no-ops and the state holds. If b = 1: 00 → 10 (ones sets, twos is then blocked by the fresh ones); 10 → 01 (ones clears via the XOR, twos sets since ones just emptied); 01 → 00 (ones blocked by ~twos, twos clears via its own XOR). A perfect mod-3 counter, one bit wide, with one copy running per bit position in parallel.",
      "Trace [2,2,3,2]: the first 2 leaves ones=10, twos=00; the second 2 moves to ones=00, twos=10. The 3 (bits 0 and 1) then acts on both positions: bit 1 has been seen twice already, so this is its third sighting — it resets to 00; bit 0 is fresh — it enters ones. State: ones=01, twos=00. The final 2 re-enters bit 1: ones becomes 11, and the answer is 3.",
      "The mutual masking maintains the invariant ones & twos == 0 after every step — the registers never double-book a bit — and that invariant is what makes the third sighting reset both registers automatically. When the scan ends, every tripled bit has completed whole cycles (net zero) while the singleton's bits rest in state 10, i.e. inside ones — including its sign bit, which is why negatives require zero extra code here.",
    ],
    time: "O(n) — one pass, two register updates per element",
    space: "O(1) — two integers",
    followUps: [
      "Generalize to 'every value appears k times except one': k−1 state registers (or per-bit mod-k counting), with the singleton read from the state corresponding to count ≡ 1 (mod k).",
      "The state machine already IS the streaming answer — constant memory regardless of how the array arrives, no re-reading, no second pass.",
    ],
    related: ["single-number", "single-number-iii"],
    verify: {
      fn: "singleNumber",
      wrap: "plain",
      cases: [
        { args: [[2, 2, 3, 2]], expect: 3 },
        { args: [[0, 1, 0, 1, 0, 1, 99]], expect: 99 },
        { args: [[4, 4, 4, -4]], expect: -4 },
        { args: [[0, 0, 0, 5]], expect: 5 },
        { args: [[2147483647, 2147483647, -2147483648, 2147483647]], expect: -2147483648 },
      ],
    },
    xp: 20,
  },
  {
    slug: "number-complement",
    statement:
      "The complement of an integer flips every bit of its binary representation — but only the bits inside the number's own length, never the leading zeros. So 5 (101) becomes 2 (010), and 1 becomes 0. Return the complement of a positive 32-bit integer.",
    examples: [
      { input: "num = 5 (101)", output: "2 (010)", explanation: "Each significant bit flips; the implicit leading zeros do not." },
      { input: "num = 1", output: "0", explanation: "The single significant bit flips; nothing else participates." },
      { input: "num = 2147483647 (thirty-one 1s)", output: "0" },
    ],
    constraints: ["1 <= num < 2^31", "flipping is confined to the number's bit-length — leading zeros are NOT flipped"],
    breakdown: [
      "The subtlety is the phrase 'no leading zeros'. A raw bitwise NOT in Python (~num) flips ALL bits, including the infinitely many implicit leading zeros, yielding −(num + 1) — a negative number and the classic first-attempt bug. The repair is a mask of 1s spanning exactly num's significant bits: mask = (1 << num.bit_length()) − 1, and then the complement is num ^ mask (equivalently ~num & mask).",
      "Building the mask is the entire implementation question. Python's int.bit_length() hands it over directly; the loop version — grow an all-ones word with mask = (mask << 1) | 1 while mask < num — ends at the smallest all-ones integer that contains the input. Both are O(bit-length); what matters is the arithmetic identity: the mask is 2^L − 1 where L is the bit-length, the smallest all-ones word covering num.",
      "The missteps, in order of frequency: returning ~num directly (negative output); flipping a fixed 31 or 32 bits instead (that's complement-WITH-leading-zeros, a different function — 5 would become 4294967290, not 2); and an off-by-one mask that is one bit short, which betrays itself precisely on powers of two: num = 4 (100) under a 2-bit mask gives 4 ^ 3 = 7 instead of the correct 3.",
    ],
    edges: [
      "num = 1 → 0: the minimal case; mask = 1, complement 0.",
      "Powers of two (num = 2^k) complement to 2^k − 1 — all lower bits set: 4 → 3, 8 → 7. Any mask off-by-one detonates exactly here.",
      "num = 2^31 − 1 → 0: the largest valid input, all ones in, all zeros out.",
      "bit_length(0) = 0 would produce an empty mask — out of scope per the constraints, but worth knowing why the function would misbehave if 0 were ever allowed.",
    ],
    ladder: [
      { title: "Brute force — string flip", body: "Format num as binary, flip each character, parse back. O(L) with string overhead and zero insight; it does, however, make the 'only significant bits' rule visible, since the string carries no leading zeros to worry about." },
      { title: "Bit-position scan", body: "Walk bit positions from the bottom: wherever num's bit is 0, set that bit in the output (out |= bit, then bit <<= 1, until bit > num). Flips in place with no order hazards — but it is a loop and a branch where algebra suffices." },
      { title: "The optimal idea — XOR against the bit-length mask", body: "mask = (1 << bit_length(num)) − 1; answer = num ^ mask. One line of algebra, O(L), no loop in Python (bit_length is effectively free at these sizes). The mask is the smallest all-ones word containing num, and XOR-with-ones is precisely 'flip within the window'." },
    ],
    approach: "Bit-length mask XOR",
    code: `def findComplement(num):
    mask = (1 << num.bit_length()) - 1   # all ones across num's significant bits
    return num ^ mask                    # XOR flips exactly the masked window`,
    walkthrough: [
      "(1 << L) − 1 is L ones in a row — the smallest all-ones integer with at least L bits. XOR against it flips precisely the low L bits of num and touches nothing beyond, which is the mathematical definition of the complement-without-leading-zeros. int.bit_length() returns the position of the highest set bit plus one, so the window always covers every significant bit — including the power-of-two case, where bit_length(2^k) = k + 1.",
      "Trace num = 5: bit_length(101) = 3, mask = 111 = 7, 5 ^ 7 = 2. Trace num = 4: bit_length = 3, mask = 7, 4 ^ 7 = 3 — and this is the case that catches short masks, since 4 ^ 3 = 7 is exactly the wrong answer an off-by-one produces. Trace num = 1: bit_length 1, mask 1, 1 ^ 1 = 0. Three traces and the mask's behavior is fully characterized.",
      "One sentence explains why ~num & mask equals num ^ mask: within the L-bit window, NOT and XOR-with-ones coincide, and outside it the mask zeroes ~num's infinite sign extension. The family resemblance to reverse-bits is the section's quiet theme — both problems are 'act on exactly the significant bits', and both hinge on constructing the right-sized window before touching a single bit.",
    ],
    time: "O(1) — bit_length plus one shift and one XOR at 32-bit sizes (O(L) conceptually)",
    space: "O(1) — the mask and the result",
    followUps: [
      "If leading zeros SHOULD flip over a caller-supplied width w, the mask becomes (1 << w) − 1 — one parameter change, same algebra.",
      "Bitwise AND of Numbers Range reuses the window idea from the other side: common high bits survive while the masked low region collapses — spotting the shared 'window of significance' framing is the transfer skill.",
    ],
    related: ["binary-number-with-alternating-bits", "bitwise-and-of-numbers-range", "find-the-difference"],
    verify: {
      fn: "findComplement",
      wrap: "plain",
      cases: [
        { args: [5], expect: 2 },
        { args: [1], expect: 0 },
        { args: [2], expect: 1 },
        { args: [2147483647], expect: 0 },
        { args: [2147483646], expect: 1 },
        { args: [1073741824], expect: 1073741823 },
      ],
    },
    xp: 10,
  },
];
