// Deep-dives — Arrays & Hashing (9). Statements are original paraphrases;
// examples/constraints written fresh; solutions verified by scripts/lc-verify.
import type { LcDeepDive } from "../types";

export const ARRAYS: LcDeepDive[] = [
  {
    slug: "contains-duplicate",
    statement:
      "You are given an array of integers. Decide whether any value shows up at least twice — return true if one does, and false only when every value is unique.",
    examples: [
      { input: "nums = [1,2,3,1]", output: "true", explanation: "The value 1 appears twice." },
      { input: "nums = [1,2,3,4]", output: "false", explanation: "Every value is distinct." },
      { input: "nums = [1,1,1,3,3,4,3,2,4,2]", output: "true" },
    ],
    constraints: ["1 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    breakdown: [
      "This is the Hello World of hash sets. The question underneath the question is: as you walk the array, can you remember what you have already seen and answer 'have I met this before?' instantly? An array scan answers that in O(n) per lookup, which makes the whole check O(n²) — fine at n=10, fatal at n=100,000.",
      "The naive misstep is sorting first and checking neighbours: it works, and it is a legitimate O(n log n) answer, but it mutates the input and pays a log factor you don't need. The set version does one pass, no mutation, and returns the moment the second copy appears — often long before the array ends.",
    ],
    edges: [
      "A single-element array can never contain a duplicate.",
      "Duplicate pairs may sit far apart (first and last element) — a 'check neighbours' habit from sorted arrays breaks here.",
      "Negative numbers and huge magnitudes are irrelevant to a set — but they rule out a counting array.",
    ],
    ladder: [
      { title: "Brute force — compare every pair", body: "Two nested loops check whether nums[i] == nums[j] for any i < j. Simple and correct, but 10^5 elements mean ~5·10^9 comparisons. Anything quadratic is a no-go at this input size." },
      { title: "Sort and scan neighbours", body: "Sorting puts equal values next to each other, so one linear pass over neighbours suffices. O(n log n) time, O(1) extra space if you may mutate — but you usually shouldn't mutate the caller's array." },
      { title: "The optimal idea — remember what you saw", body: "A hash set answers membership in O(1) average. Walk once: if the current value is already in the set you are done; otherwise add it. One pass, early exit, no mutation." },
    ],
    approach: "Single-pass hash set",
    code: `def containsDuplicate(nums):
    seen = set()                # values met so far
    for n in nums:
        if n in seen:           # second sighting → duplicate
            return True
        seen.add(n)
    return False`,
    walkthrough: [
      "The invariant is tiny and worth saying out loud: after the loop has processed k elements, 'seen' holds exactly those k values. So a membership hit at step k+1 is, by construction, a duplicate.",
      "Early exit is the quiet win — for [1,2,3,1] the function returns on the fourth element without ever looking at the rest. Worst case (all unique) still costs one pass, O(n) time and O(n) space.",
      "The golfed one-liner len(set(nums)) < len(nums) says the same thing: a set squashes duplicates, so a size drop means one existed. Interviewers like seeing both.",
    ],
    time: "O(n) — one pass, O(1) average per lookup",
    space: "O(n) — the set can hold every element",
    followUps: [
      "What if the values sit in a small range (say 0..999)? A fixed boolean array replaces the set — same O(n), smaller constants.",
      "What if you must report the duplicate itself, not a boolean? The set version returns the value the moment it's found; the sorting version must remember which neighbour pair matched.",
    ],
    related: ["missing-number", "find-all-duplicates-in-an-array"],
    verify: {
      fn: "containsDuplicate",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 1]], expect: true },
        { args: [[1, 2, 3, 4]], expect: false },
        { args: [[1, 1, 1, 3, 3, 4, 3, 2, 4, 2]], expect: true },
        { args: [[7]], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "valid-anagram",
    statement:
      "Given two strings s and t, return true only if t is an anagram of s — the same characters, exactly the same multiplicities, possibly in a different order. You may assume both strings contain lowercase English letters.",
    examples: [
      { input: 's = "anagram", t = "nagaram"', output: "true" },
      { input: 's = "rat", t = "car"', output: "false", explanation: "'r' and 'a' match, but t has no second… actually t has no 'a' at all — the multisets differ." },
      { input: 's = "ab", t = "a"', output: "false", explanation: "Different lengths can never be anagrams." },
    ],
    constraints: ["1 <= s.length, t.length <= 5·10^4", "s and t contain lowercase English letters"],
    breakdown: [
      "An anagram check is really a multiset equality check: does s carry exactly the same character inventory as t? Two strings of equal length built from the same bag of letters are anagrams; everything else is no.",
      "The cheap first filter is length — if len(s) != len(t) you can return false without reading a character. After that, you need a canonical form per string. Sorting gives one in O(n log n); counting gives one in O(n). Since counts are bounded by 26 letters, the counting approach is effectively linear with tiny constants.",
    ],
    edges: [
      "Different lengths → immediately false (common early-exit to state in interviews).",
      "Repeated characters: 'aab' vs 'aba' is true; 'aab' vs 'abb' is false — frequency matters, not just membership.",
      "Unicode in a general version: a 26-slot array breaks; a dict/Counter does not.",
    ],
    ladder: [
      { title: "Brute force — cancel characters", body: "For each character of s, find and remove one matching character in t. O(n²) with list removals; correct but clunky, and removal shifts the array." },
      { title: "Sort both, compare", body: "sorted(s) == sorted(t) — a one-liner at O(n log n). Perfectly acceptable in an interview as a first answer, then upgrade." },
      { title: "The optimal idea — count, don't sort", body: "Tally s into a 26-slot frequency array (or dict), then subtract t. If the tally ends at all zeros, the multisets matched exactly. One pass each, O(n) time, O(1) space (alphabet-bounded)." },
    ],
    approach: "Frequency counter with early length exit",
    code: `def isAnagram(s, t):
    if len(s) != len(t):        # different sizes → impossible
        return False
    count = {}                  # char → surplus of s over t
    for ch in s:
        count[ch] = count.get(ch, 0) + 1
    for ch in t:
        if ch not in count:     # t has a char s lacks
            return False
        count[ch] -= 1
        if count[ch] == 0:
            del count[ch]       # keep the map empty iff anagram
    return not count            # empty dict → all counts cancelled`,
    walkthrough: [
      "Equal lengths let us share one dict: add s's characters, then subtract t's. Any negative surplus or missing key is an instant false, so by the end the dict is empty exactly when every count cancelled.",
      "Why delete at zero instead of checking at the end? It makes the 'return not count' line self-evidently correct and avoids a final scan of 26 slots — a micro-optimisation, but it also communicates intent: the map must finish empty.",
      "In real interviews the Counter(s) == Counter(t) one-liner is a fine closing remark after you've shown you understand the mechanics.",
    ],
    time: "O(n) — one pass over each string",
    space: "O(1) — at most 26 keys (alphabet-bounded)",
    followUps: [
      "Unicode/general strings: swap the 26-array for a dict (or Counter) — same complexity.",
      "Streaming variant: you see characters of t one at a time and must answer after each — maintain the decrement dict and check it stays non-negative.",
    ],
    related: ["group-anagrams", "ransom-note", "isomorphic-strings"],
    verify: {
      fn: "isAnagram",
      wrap: "plain",
      cases: [
        { args: ["anagram", "nagaram"], expect: true },
        { args: ["rat", "car"], expect: false },
        { args: ["ab", "a"], expect: false },
        { args: ["aacc", "ccac"], expect: false },
      ],
    },
    xp: 10,
  },
  {
    slug: "two-sum",
    statement:
      "Given an integer array and a target, return the indices of the two numbers that add up to the target. Exactly one valid answer exists, the same element may not be used twice, and you may return the indices in any order.",
    examples: [
      { input: "nums = [2,7,11,15], target = 9", output: "[0,1]", explanation: "nums[0] + nums[1] = 2 + 7 = 9." },
      { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
      { input: "nums = [3,3], target = 6", output: "[0,1]", explanation: "Two different elements can share a value." },
    ],
    constraints: ["2 <= nums.length <= 10^4", "-10^9 <= nums[i], target <= 10^9", "exactly one valid answer exists"],
    breakdown: [
      "For each element x, the question is instantaneous: have I already seen target − x? If yes, that earlier index plus the current one is the answer. This reframing turns a search over pairs into a search over history — and history can live in a hash map.",
      "The classic trap is trying to be clever with sorting: sort, then two-pointer, then… you've lost the original indices and must carry them along. That's extra bookkeeping for zero benefit when the hash map version is a single pass.",
      "Order of operations inside the loop matters: check for the partner BEFORE inserting the current value. Insert-first breaks on targets that are exactly twice the current value (you'd pair the element with itself).",
    ],
    edges: [
      "Duplicate values forming the answer ([3,3], target 6) — the check-first rule handles it.",
      "Negative numbers and a negative target: the math is unchanged; only assumptions like 'values are positive' would break.",
      "The problem guarantees exactly one answer — no need to handle 'not found', though returning None after the loop keeps the code total.",
    ],
    ladder: [
      { title: "Brute force — every pair", body: "Two nested loops test all i < j pairs. Correct, but O(n²) — 10^4 elements is 5·10^7 comparisons, borderline in Python and embarrassing in an interview when a linear answer exists." },
      { title: "Sort + two pointers", body: "Sort with (value, index) pairs, walk two pointers inward. O(n log n), but you drag indices through the sort and must explain the recovery step — extra machinery for the same answer." },
      { title: "The optimal idea — trade space for instant history", body: "One pass with a dict value → index. At element n, the complement target − n is either already in the dict (done) or not (remember n). O(n) time, O(n) space, no sorting, original order preserved." },
    ],
    approach: "One-pass hash map of complements",
    code: `def twoSum(nums, target):
    seen = {}                       # value → index where it was met
    for i, n in enumerate(nums):
        need = target - n           # the partner this element wants
        if need in seen:
            return [seen[need], i]  # earlier index + current index
        seen[n] = i                 # remember AFTER checking
`,
    walkthrough: [
      "seen maps each value to the earliest index it appeared. The complement lookup asks the past, not the future — that's what keeps it one pass and self-consistent.",
      "Insert after check: when we test 'need in seen', the current element is not yet in the map, so an element can never pair with itself. For [3,3] the second 3 finds the first — duplicates work for free.",
      "The returned pair is always (earlier, current), so the answer is naturally index-sorted even though 'any order' is accepted.",
    ],
    time: "O(n) — single pass, O(1) average dict operations",
    space: "O(n) — up to n entries before the answer is found",
    followUps: [
      "The array is sorted (Two Sum II): two pointers give O(n) time and O(1) space — better than the map because order already exists.",
      "Follow-up 'what if there are many queries on the same array?': pre-sort once with indices; each query is then O(n) two-pointer instead of O(n) + rebuild.",
    ],
    related: ["two-sum-ii-input-array-is-sorted", "3sum", "four-sum-ii"],
    verify: {
      fn: "twoSum",
      wrap: "plain",
      cases: [
        { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
        { args: [[3, 2, 4], 6], expect: [1, 2] },
        { args: [[3, 3], 6], expect: [0, 1] },
      ],
    },
    xp: 10,
  },
  {
    slug: "group-anagrams",
    statement:
      "Given an array of strings, group all the anagrams together — every group contains strings made of exactly the same letters with the same multiplicities. Return the groups in any order; each group's members in any order. Every string consists of lowercase English letters, and no string is empty.",
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]', explanation: "Group order and member order don't matter." },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' },
    ],
    constraints: ["1 <= strs.length <= 10^4", "0 <= strs[i].length <= 100", "lowercase English letters only"],
    breakdown: [
      "Grouping by 'is an anagram of' needs one thing: a canonical signature — a string derived from an anagram family that is identical for every member and different across families. Once each string carries a signature, the problem collapses into 'group by key', which is a dict of lists.",
      "Two signature choices dominate: sorted letters ('eat' → 'aet') at O(k log k) per string, or a 26-slot count tuple ('eat' → (1,0,0,1,…)) at O(k). With max string length 100 both are effectively free; the sorted-letter version wins on simplicity and is the interview default.",
      "The misstep is comparing each string against existing groups pairwise — O(n² · k). The signature trick replaces all pairwise comparisons with one dict insertion per string.",
    ],
    edges: [
      "Empty string (the constraint allows length 0) — its signature is the empty string; it forms its own group.",
      "Duplicate inputs: ['aba','aba'] belong to the same group twice — dict append handles it.",
      "Large n: 10^4 strings × 100 chars ≈ 10^6 work — linear-in-input approaches are required.",
    ],
    ladder: [
      { title: "Brute force — pairwise membership", body: "Keep groups; for each string compare letter-counts against one representative per group. O(n² · k) worst case — slow, but it does produce correct groups." },
      { title: "Sort each string as its key", body: "Signature = ''.join(sorted(s)). Every anagram sorts to the same key. One pass, dict of lists, O(n · k log k) total." },
      { title: "The optimal idea — counting signature", body: "Signature = tuple of 26 counts, O(k) per string → O(n · k) total. Strictly faster asymptotically; in practice for k ≤ 100 both pass, and sorted is cleaner to say out loud." },
    ],
    approach: "Canonical signature → dict of lists",
    code: `def groupAnagrams(strs):
    groups = {}                     # signature → members
    for s in strs:
        key = "".join(sorted(s))    # canonical form: letters in order
        groups.setdefault(key, []).append(s)
    return list(groups.values())`,
    walkthrough: [
      "The whole solution is the observation that an anagram family has a unique sorted form. 'eat', 'tea' and 'ate' all become 'aet', so they land under the same key.",
      "setdefault(key, []) returns the existing list or installs a fresh one, then append adds the member — the idiomatic Python 'group by' without an if/else.",
      " dicts preserve insertion order in modern Python, so groups emerge in first-appearance order; the problem accepts any order, and sorting inside each group is only needed if you want deterministic output.",
    ],
    time: "O(n · k log k) — n strings of up to k characters, sorted each",
    space: "O(n · k) — the groups hold every string, plus keys",
    followUps: [
      "Unicode or huge alphabets: the count-tuple signature generalises; sorted() does too.",
      "The exact counting version: key = tuple(26 counts) → O(n·k) total; worth mentioning when k is large.",
    ],
    related: ["valid-anagram", "top-k-frequent-elements"],
    verify: {
      fn: "groupAnagrams",
      wrap: "plain",
      normalize: "sortGroups",
      cases: [
        { args: [["eat", "tea", "tan", "ate", "nat", "bat"]], expect: [["ate", "eat", "tea"], ["bat"], ["nat", "tan"]] },
        { args: [[""]], expect: [[""]] },
        { args: [["a"]], expect: [["a"]] },
        { args: [["aba", "aba"]], expect: [["aba", "aba"]] },
      ],
    },
    xp: 20,
  },
  {
    slug: "top-k-frequent-elements",
    statement:
      "Given a non-empty integer array and an integer k, return the k most frequent elements. The answer is guaranteed unique for the given input, and k never exceeds the number of distinct values. Return the elements in any order.",
    examples: [
      { input: "nums = [1,1,1,2,2,3], k = 2", output: "[1,2]", explanation: "1 appears three times, 2 twice, 3 once." },
      { input: "nums = [1], k = 1", output: "[1]" },
      { input: "nums = [4,4,4,6,6,7,7,7,8], k = 2", output: "[4,7]", explanation: "4 and 7 each appear three times, 6 twice." },
    ],
    constraints: ["1 <= nums.length <= 10^5", "0 <= k <= number of distinct elements", "answer guaranteed unique"],
    breakdown: [
      "Two sub-problems hide inside: count frequencies (trivial with a dict), then select the k largest counts. The selection is where solutions differentiate — full sort, heap, or bucket sort.",
      "A full sort of distinct values by frequency costs O(m log m) where m ≤ n. A heap of size k costs O(m log k) — the standard 'top-k with a min-heap' pattern. But when counts are bounded by n, there's something better: bucket sort by frequency, which is O(n) outright.",
      "The bucket insight: a value's frequency can't exceed n (the array length). So make n+1 buckets where bucket i holds every value appearing exactly i times, then sweep buckets from high to low, collecting until you have k. Selection becomes linear because the frequency axis is finite.",
    ],
    edges: [
      "Ties: the guaranteed-unique answer means tie-breaking is unnecessary for correctness, but deterministic tests may sort the output.",
      "k = number of distinct values → the sweep returns everything.",
      "All elements equal → one bucket holds one value; k = 1.",
    ],
    ladder: [
      { title: "Brute force — count, then sort", body: "Count with a dict, sort items by count descending, take k. O(n + m log m). Perfectly acceptable; the follow-up 'can you do better than n log n?' invites the upgrade." },
      { title: "Min-heap of size k", body: "Push (count, value); keep the heap at size k by popping the smallest. O(m log k) — better than sorting when k ≪ m, and the classic interview middle answer." },
      { title: "The optimal idea — bucket by frequency", body: "Frequencies live in 0..n, so bucket index = frequency. One downward sweep collects the top-k in O(n) time and space. No heap, no sort — just the observation that the axis is bounded." },
    ],
    approach: "Counting + frequency buckets",
    code: `def topKFrequent(nums, k):
    count = {}
    for n in nums:                       # 1) frequency map
        count[n] = count.get(n, 0) + 1

    buckets = [[] for _ in range(len(nums) + 1)]  # freq → values
    for n, f in count.items():           # 2) scatter into buckets
        buckets[f].append(n)

    out = []
    for f in range(len(buckets) - 1, 0, -1):      # 3) highest first
        for n in buckets[f]:
            out.append(n)
            if len(out) == k:
                return out`,
    walkthrough: [
      "Phase 1 is the standard frequency map. Phase 2 inverts the map: instead of value → count, buckets[count] lists every value with that count. Bucket sizes sum to m, so scattering is linear.",
      "Phase 3 walks frequencies from n down to 1; anything in a higher bucket is, by definition, at least as frequent as anything below. Stop the moment k values are gathered — no need to finish the sweep.",
      "This beats the heap because it removes the log factor entirely — possible only because frequency is bounded by array length. Mention that bound out loud; it's the 'aha'.",
    ],
    time: "O(n) — count, scatter and sweep are each linear",
    space: "O(n) — the count map and n+1 buckets",
    followUps: [
      "If frequencies were unbounded (e.g. streaming), the size-k min-heap is the right tool — O(m log k).",
      "Quickselect over distinct values by frequency gives average O(n) too, but buckets are simpler to reason about.",
    ],
    related: ["kth-largest-element-in-an-array", "group-anagrams", "k-closest-points-to-origin"],
    verify: {
      fn: "topKFrequent",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        { args: [[1, 1, 1, 2, 2, 3], 2], expect: [1, 2] },
        { args: [[1], 1], expect: [1] },
        { args: [[4, 4, 4, 6, 6, 7, 7, 7, 8], 2], expect: [4, 7] },
      ],
    },
    xp: 20,
  },
  {
    slug: "encode-and-decode-strings",
    statement:
      "Design two functions that work as a pair. encode takes a list of strings and produces a single string containing all of them; decode reverses the process, returning exactly the original list. The strings may contain any characters — including digits, delimiters and the encodings of other strings — so the pair must round-trip losslessly.",
    examples: [
      { input: 'strs = ["lint","code","love","you"]', output: 'encode → "4#lint4#code4#love3#you" (one valid design), decode → back to the original list' },
      { input: 'strs = ["we","say",":","yes"]', output: "round-trips exactly, even though ':' and digits appear inside the data" },
      { input: "strs = []", output: 'encode → "" and decode → []' },
    ],
    constraints: ["1 <= strs.length <= 200", "0 <= strs[i].length < 200", "strings may contain any of the 256 valid ASCII characters"],
    breakdown: [
      "The danger is separator collisions: choosing ',' as a delimiter breaks the moment a string contains ','. The fix is to make the length part of the encoding — '4#lint' — so the decoder never has to guess where a payload ends. Length-prefixing is how real protocols (netstrings, HTTP/2 frames, protobuf bytes) frame messages.",
      "The subtle bug everyone writes at least once: parsing a single digit for the length. Lengths can be 10, 100, 200 — the decoder must read digits until the '#', then take exactly that many characters. Get this right and the rest is mechanical.",
      "Why not escape-based designs (double any internal '#')? They work, but length-prefixing is simpler to reason about and has zero ambiguity even for adversarial inputs.",
    ],
    edges: [
      "Empty list → encode returns '', decode of '' returns [].",
      "Empty strings inside the list ('0#') and strings that LOOK like encodings ('4#abc' as a payload).",
      "Multi-digit lengths (e.g. a 200-char string) — the digit-scanning loop exists precisely for this.",
    ],
    ladder: [
      { title: "Brute force — join with a delimiter", body: "'#'.join(strs) and split. Fails for any input containing '#'; the failure is silent and total, which is exactly what the problem is testing." },
      { title: "Escaping", body: "Double every internal delimiter, split on singles, undouble. Correct, but the decoder must track escape state — more states, more bugs." },
      { title: "The optimal idea — length-prefixing", body: "Each string becomes '<len>#<payload>'. The decoder reads digits to '#', then slices exactly len characters. No ambiguity, one linear pass each way, O(total length)." },
    ],
    approach: "Length-prefixed framing (netstring style)",
    code: `def encode(strs):
    return "".join(f"{len(s)}#{s}" for s in strs)

def decode(s):
    out, i = [], 0
    while i < len(s):
        j = i
        while s[j] != "#":              # scan the full length number
            j += 1
        length = int(s[i:j])            # multi-digit safe
        out.append(s[j + 1 : j + 1 + length])
        i = j + 1 + length              # jump past payload
    return out`,
    walkthrough: [
      "encode is pure framing: for each string emit its length, a marker, then the payload. Digits inside payloads never confuse anyone because the decoder only looks for digits in the header position, which is always at a frame boundary.",
      "decode maintains i as the start of the next header. It scans j forward to the '#', converts the digit run to an integer, slices exactly length characters, and jumps i past the consumed frame. The loop naturally terminates when i reaches the end.",
      "Round-trip proof sketch: encode is injective (the lengths disambiguate boundaries), decode is its left inverse on the image — the harness verifies this on payloads full of '#', digits and colons.",
    ],
    time: "O(N) both ways — N is the total characters plus per-string header length",
    space: "O(N) — the output is the same size as the input (plus headers)",
    followUps: [
      "What if payloads could contain the marker AND lengths could be astronomically large? Fixed-width (e.g. 8-byte) binary length headers are the production answer.",
      "Compressed variant: run-length or dictionary coding sits on top of the same framing.",
    ],
    related: ["serialize-and-deserialize-binary-tree", "group-anagrams"],
    verify: {
      fn: "codec",
      wrap: "codec",
      cases: [
        { args: [["lint", "code", "love", "you"]], expect: ["lint", "code", "love", "you"] },
        { args: [["we", "say", ":", "yes", "!@#$%^&*()"]], expect: ["we", "say", ":", "yes", "!@#$%^&*()"] },
        { args: [["4#abc", "10#looks-like-a-header"]], expect: ["4#abc", "10#looks-like-a-header"] },
        { args: [[]], expect: [] },
      ],
    },
    xp: 20,
  },
  {
    slug: "product-of-array-except-self",
    statement:
      "Given an integer array, return an array where position i holds the product of every element EXCEPT nums[i]. You must write it without division, and in O(n) time. The product of any prefix or suffix is guaranteed to fit in a 32-bit integer.",
    examples: [
      { input: "nums = [1,2,3,4]", output: "[24,12,8,6]" },
      { input: "nums = [-1,1,0,-3,3]", output: "[0,0,9,0,0]", explanation: "Two zeros kill every product except the one between them." },
      { input: "nums = [2,3]", output: "[3,2]" },
    ],
    constraints: ["2 <= nums.length <= 10^5", "-30 <= nums[i] <= 30", "prefix/suffix products fit in 32-bit"],
    breakdown: [
      "The product at i is (everything left of i) × (everything right of i). That decomposition is the entire problem: precompute prefix products and suffix products, then multiply the two neighbours of each position.",
      "Division feels tempting — total product ÷ nums[i] — but zeros break it (0/0 is undefined) and the problem bans it precisely because handling zeros with division degenerates into case-analysis soup. Prefix/suffix handles zeros with no special cases.",
      "The O(1)-extra-space version stores the prefix pass in the OUTPUT array, then sweeps the suffix in with a rolling variable. That's the answer interviewers want: two passes, one array, no division.",
    ],
    edges: [
      "One zero: every position is 0 except the zero's own index, which gets the product of the rest.",
      "Two zeros: everything is 0 — the prefix/suffix machinery produces this automatically.",
      "Negatives: parity of negative count flips signs; the multiplication does it for free.",
    ],
    ladder: [
      { title: "Brute force — product of the others", body: "For each i multiply all other elements. O(n²) — 10^5 elements is 10^10 multiplications. Dead on arrival." },
      { title: "Division with zero cases", body: "Compute total product and zero count; branch on zero count. Correct but the problem forbids division, and the branch tree is exactly the kind of thing that hides bugs." },
      { title: "The optimal idea — prefix × suffix", body: "Two sweeps: forward fills out[i] with the product of nums[0..i-1]; backward multiplies in the product of nums[i+1..n-1] via a rolling suffix. O(n) time, output array only." },
    ],
    approach: "Prefix/suffix products folded into the output array",
    code: `def productExceptSelf(nums):
    n = len(nums)
    out = [1] * n

    prefix = 1
    for i in range(n):          # out[i] = product of everything LEFT of i
        out[i] = prefix
        prefix *= nums[i]

    suffix = 1
    for i in range(n - 1, -1, -1):   # fold in everything RIGHT of i
        out[i] *= suffix
        suffix *= nums[i]
    return out`,
    walkthrough: [
      "First pass: out[i] is assigned BEFORE multiplying nums[i] into prefix, so out[i] holds the product of strictly-left elements. Walking [1,2,3,4]: out becomes [1,1,2,6].",
      "Second pass mirrors it from the right with a rolling suffix. Position i is now left-product × right-product — exactly the answer. [1,2,3,4] gets multiplied by [24,12,8,1] → [24,12,8,6].",
      "The 'no extra arrays' version is just this trick: the output array is the prefix array, and the suffix lives in a single variable. Zeros and negatives need no special code — they're just multiplications.",
    ],
    time: "O(n) — two linear passes",
    space: "O(1) extra — the output array doesn't count (and it's required anyway)",
    followUps: [
      "What if the product may overflow? Python ints don't; in fixed-width languages you'd track the product as logs or report overflow.",
      "Generalisation: 'array product except self' is the 1-D case of a prefix-product segment tree when updates arrive (product of a range).",
    ],
    related: ["maximum-product-subarray", "find-pivot-index"],
    verify: {
      fn: "productExceptSelf",
      wrap: "plain",
      cases: [
        { args: [[1, 2, 3, 4]], expect: [24, 12, 8, 6] },
        { args: [[-1, 1, 0, -3, 3]], expect: [0, 0, 9, 0, 0] },
        { args: [[2, 3]], expect: [3, 2] },
        { args: [[0, 0]], expect: [0, 0] },
      ],
    },
    xp: 20,
  },
  {
    slug: "valid-sudoku",
    statement:
      "You are handed a 9×9 board where each cell holds the digit '1'–'9' or '.' for empty. Report whether the board is currently VALID: no digit repeats in any row, any column, or any of the nine 3×3 boxes. Empties are ignored; you are not asked whether the board is solvable, only that no rule is broken right now.",
    examples: [
      { input: "a standard partially-filled board with no conflicts", output: "true" },
      { input: "the same board but the top-left cell changed from '5' to '8'", output: "false", explanation: "Column 0 would then contain two 8s." },
    ],
    constraints: ["board.length == 9, board[i].length == 9", "cells are '1'..'9' or '.'"],
    breakdown: [
      "Three independent constraints share one cell. The naive shape is three separate scans — rows, then columns, then boxes — each with its own duplicate check. It works but revisits every cell three times.",
      "The elegant shape is ONE pass with 27 sets: 9 row sets, 9 column sets, 9 box sets. For each non-empty cell, the value must be new to all three of its sets simultaneously; otherwise you've found a repeat and can return false on the spot.",
      "The box index formula is the only 'trick': box = (r // 3) * 3 + (c // 3) flattens the 3×3 grid of boxes into 0..8. Derive it by drawing the grid — don't memorise it.",
    ],
    edges: [
      "An empty board (all '.') is valid — every loop body skips.",
      "A duplicate can hide in any of the three dimensions: row, column, or box; the single-pass check catches all three symmetrically.",
      "The problem never asks about solvability — don't run a solver, just validate.",
    ],
    ladder: [
      { title: "Brute force — three passes", body: "Scan rows for duplicates, scan columns, then scan the nine boxes (each with a fresh set). Correct; triple the code and the triple the cell visits." },
      { title: "One pass, 27 sets", body: "Rows, columns and boxes as three lists of 9 sets; each cell does one membership check against its three sets. Early false exit on the first conflict." },
      { title: "The optimal idea — bitmask instead of sets", body: "Represent each row/col/box as a 9-bit integer; set bit v means 'v seen'. Checking and setting become single bit ops. Same asymptotics, constant-factor smaller and a nice closing remark." },
    ],
    approach: "Single pass with row/column/box sets",
    code: `def isValidSudoku(board):
    rows  = [set() for _ in range(9)]
    cols  = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]

    for r in range(9):
        for c in range(9):
            v = board[r][c]
            if v == ".":
                continue
            b = (r // 3) * 3 + c // 3      # which 3x3 box (0..8)
            if v in rows[r] or v in cols[c] or v in boxes[b]:
                return False
            rows[r].add(v)
            cols[c].add(v)
            boxes[b].add(v)
    return True`,
    walkthrough: [
      "27 sets encode every constraint; each digit-cell consults exactly three of them. The first time any set already holds the value, the board is invalid and we bail immediately — early exit the moment the second copy is touched.",
      "The box formula: r // 3 picks the box ROW (0..2), c // 3 picks the box COLUMN (0..2), and *3 + flattens the pair into 0..8. Every cell in the same 3×3 block maps to the same b.",
      "Complexity is fixed: 81 cells, constant work each — O(1) by the problem's own definition (9×9), or O(n²) for an n×n generalisation.",
    ],
    time: "O(1) — 81 cells, constant work each",
    space: "O(1) — 27 sets of at most 9 entries",
    followUps: [
      "Bitmask version: rows[r] & (1 << v) instead of set membership — faster and interview-flashy.",
      "If asked 'is it solvable?', that's backtracking (a different problem): validate + fill with constraint propagation.",
    ],
    related: ["n-queens", "sudoku-solver"],
    verify: {
      fn: "isValidSudoku",
      wrap: "matrix",
      cases: [
        {
          args: [[
            ["5", "3", ".", ".", "7", ".", ".", ".", "."],
            ["6", ".", ".", "1", "9", "5", ".", ".", "."],
            [".", "9", "8", ".", ".", ".", ".", "6", "."],
            ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
            ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
            ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
            [".", "6", ".", ".", ".", ".", "2", "8", "."],
            [".", ".", ".", "4", "1", "9", ".", ".", "5"],
            [".", ".", ".", ".", "8", ".", ".", "7", "9"],
          ]],
          expect: true,
        },
        {
          args: [[
            ["8", "3", ".", ".", "7", ".", ".", ".", "."],
            ["6", ".", ".", "1", "9", "5", ".", ".", "."],
            [".", "9", "8", ".", ".", ".", ".", "6", "."],
            ["8", ".", ".", ".", "6", ".", ".", ".", "3"],
            ["4", ".", ".", "8", ".", "3", ".", ".", "1"],
            ["7", ".", ".", ".", "2", ".", ".", ".", "6"],
            [".", "6", ".", ".", ".", ".", "2", "8", "."],
            [".", ".", ".", "4", "1", "9", ".", ".", "5"],
            [".", ".", ".", ".", "8", ".", ".", "7", "9"],
          ]],
          expect: false,
        },
      ],
    },
    xp: 20,
  },
  {
    slug: "longest-consecutive-sequence",
    statement:
      "Given an unsorted integer array, return the length of the longest run of consecutive integers that all exist somewhere in the array — the values need not sit adjacent in the input. Your algorithm must run in O(n) time.",
    examples: [
      { input: "nums = [100,4,200,1,3,2]", output: "4", explanation: "The run 1,2,3,4 exists in the values." },
      { input: "nums = [0,3,7,2,5,8,4,6,0,1]", output: "9", explanation: "0..8 are all present." },
      { input: "nums = []", output: "0" },
    ],
    constraints: ["0 <= nums.length <= 10^5", "-10^9 <= nums[i] <= 10^9"],
    breakdown: [
      "Sorting solves it in O(n log n): sort, walk, count runs, reset on gaps. The O(n) requirement is what makes the problem interesting — it bans the sort and forces a different mental model.",
      "The O(n) model: membership queries. Shove everything into a set; now 'does value v exist?' is O(1) average, and consecutive runs are discoverable by walking from any start value through v+1, v+2, … while they exist.",
      "The final insight is the 'sequence start' filter: only begin walking from a value whose predecessor (v − 1) is ABSENT. Every interior element of a run is skipped as a start, so each run is walked exactly once — total work stays linear even though the walk looks nested.",
    ],
    edges: [
      "Empty array → 0.",
      "Duplicates ([1,2,0,1]) — the set dedupes for free.",
      "Huge value range (−10^9..10^9) — no counting array; the hash set's sparse storage is essential.",
    ],
    ladder: [
      { title: "Brute force — check every chain from scratch", body: "For each value, walk v+1, v+2… via repeated linear membership scans. O(n²) or worse — quadratic checking plus no dedupe." },
      { title: "Sort and scan", body: "O(n log n), dedupe while scanning, track the current run length. Clean, commonly accepted — but the problem explicitly demands O(n)." },
      { title: "The optimal idea — start-of-run walks in a set", body: "Set for O(1) membership; walk runs ONLY from values with no predecessor. Each value is visited a constant number of times (once as candidate, once inside its run) → O(n) total." },
    ],
    approach: "Hash set + start-of-run detection",
    code: `def longestConsecutive(nums):
    numset = set(nums)              # O(1) membership + dedupe
    best = 0
    for n in numset:
        if n - 1 in numset:         # a run continues here — not a start
            continue
        length = 1
        while n + length in numset: # walk the run forward
            length += 1
        best = max(best, length)
    return best`,
    walkthrough: [
      "The set does three jobs at once: dedupes, gives O(1) membership, and holds a sparse domain for billion-wide ranges. Iterating the SET (not the array) means duplicates never trigger duplicate walks.",
      "The guard 'n − 1 in numset' is the line that buys linearity. In [1,2,3,4], only 1 starts a walk (4 steps); 2, 3, 4 are skipped as starts. Across a whole run of length L, the walk costs L — each element is charged exactly once.",
      "Worst case is a single ascending run: one walk of n steps after one pass of set-building. Total O(n) time, O(n) space.",
    ],
    time: "O(n) — set build + each run walked exactly once",
    space: "O(n) — the set",
    followUps: [
      "Return the actual sequence, not just the length: remember the start of the best run, then reconstruct by walking again.",
      "Union-Find alternative: union v with v+1 when both exist; track component sizes. Same complexity, more machinery.",
    ],
    related: ["contains-duplicate", "longest-increasing-subsequence"],
    verify: {
      fn: "longestConsecutive",
      wrap: "plain",
      cases: [
        { args: [[100, 4, 200, 1, 3, 2]], expect: 4 },
        { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expect: 9 },
        { args: [[]], expect: 0 },
        { args: [[1, 2, 0, 1]], expect: 3 },
      ],
    },
    xp: 20,
  },
];
