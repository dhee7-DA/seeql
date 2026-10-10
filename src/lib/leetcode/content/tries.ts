// Deep-dives — Tries (NeetCode 150 section). Statements are original paraphrases; solutions verified by scripts/lc-verify. Wrap conventions match js-runner.ts exactly.
import type { LcDeepDive } from "../types";

export const TRIES: LcDeepDive[] = [
  {
    slug: "implement-trie-prefix-tree",
    statement:
      "Design a prefix tree that stores lowercase words and answers two questions in time proportional to the string's length: does this exact string exist as a stored word, and does any stored word begin with this prefix? insert(word) records a word; search(word) and startsWith(prefix) answer the two queries with true or false.",
    examples: [
      { input: 'insert("apple"), search("apple"), search("app"), startsWith("app"), insert("app"), search("app")', output: 'search("apple") → true, search("app") → false, startsWith("app") → true, search("app") → true', explanation: 'After inserting "apple", "app" is a live prefix but not a word of its own — until it is inserted too.' },
      { input: 'insert("apple"), startsWith("appx")', output: 'startsWith("appx") → false', explanation: "The walk dies at the second 'p' — no stored word shares that prefix." },
      { input: 'insert("band"), insert("ban"), startsWith("ba"), search("ba"), search("ban")', output: 'startsWith("ba") → true, search("ba") → false, search("ban") → true' },
    ],
    constraints: [
      "1 <= word.length, prefix.length <= 2000",
      "word and prefix contain only lowercase English letters",
      "at most 3·10^4 total calls to insert, search and startsWith",
    ],
    breakdown: [
      "A trie is the data structure this problem asks you to invent. Hash sets answer 'is this exact string stored?' instantly but are hopeless at prefixes — 'is \"app\" a prefix of anything stored?' has no fast set answer. The trie stores strings along shared paths, one node per character step with children in a map, so every query is a single walk of at most L steps and prefixes are prefixes structurally.",
      "The one real design decision is the end-of-word marker. The node spelling 'app' exists the moment 'apple' is inserted, so search(\"app\") cannot be answered by 'does the node exist?' — apple's insertion created it. Each node therefore carries a boolean is_word: true exactly where some insert terminated. search demands the marker; startsWith is satisfied by mere node existence.",
      "The misstep is over-engineering: a 26-slot child array per node is the textbook picture, but a dict of children is simpler, allocates only branches that exist, and generalises beyond lowercase. With the marker in place, both queries become the same walk — only the acceptance test at the end differs.",
    ],
    edges: [
      "search vs startsWith: a node existing is NOT proof of a word — 'app' exists after inserting 'apple' yet search('app') is false.",
      "Re-inserting a word must be harmless: the walk recreates nothing and just sets the marker again.",
      "Queries and inserts interleave in any order — the structure must answer incrementally, never assume a build phase finished.",
      "Constraints exclude empty strings, but the code should degrade sanely: search(\"\") reads the root's marker (false unless inserted).",
    ],
    ladder: [
      { title: "Brute force — a list/set of words", body: "search is O(1) with a set, but startsWith must scan every stored word for the prefix: O(N·L) per query. At 3·10^4 calls that's on the order of 10^8 character comparisons — the exact contract the problem outlaws." },
      { title: "Sorted list + binary search", body: "Keep words sorted: every word sharing a prefix occupies a contiguous window, so startsWith binary-searches the prefix and search additionally checks set membership. O(L log N) per query — workable, but two structures and a fiddly invariant to maintain on insert." },
      { title: "The optimal idea — walk the characters", body: "One node per character step, dict children, is_word flag. Every operation is a single L-step walk whose cost is independent of how many words are stored — O(L) time, and insertions share prefix nodes instead of repeating them." },
    ],
    approach: "Character-walk trie with end-of-word markers",
    code: `class Trie:
    def __init__(self):
        self.children = {}          # char -> child Trie node
        self.is_word = False        # does some inserted word end exactly here?

    def insert(self, word):
        node = self
        for ch in word:                     # descend one level per character
            if ch not in node.children:
                node.children[ch] = Trie()  # create the missing step
            node = node.children[ch]
        node.is_word = True                 # mark the end of THIS word

    def search(self, word):
        node = self._walk(word)
        return node is not None and node.is_word   # a WORD, not just a prefix

    def startsWith(self, prefix):
        return self._walk(prefix) is not None      # any node on the path suffices

    def _walk(self, s):
        node = self
        for ch in s:
            node = node.children.get(ch)
            if node is None:            # fell off the trie — path doesn't exist
                return None
        return node`,
    walkthrough: [
      "insert is a guided tree-build: for each character either descend into an existing child or create one. Shared prefixes cost nothing extra — inserting 'apple' after 'app' walks three existing nodes and creates only the 'l','e' tail. The final node gets is_word = True, which is the entire payload of the structure.",
      "Both queries share one helper. _walk returns the node the string ends at, or None if the path died mid-walk; search then insists that node is a word-end while startsWith accepts existence alone. That asymmetry — marker versus node — is exactly the apple/app distinction in the first example.",
      "Each operation is O(L): L dict lookups, each O(1) average, with no scan of stored words or the alphabet. Building N words of length L costs O(N·L) time and at most that many nodes — usually far fewer, because every shared prefix is stored once and walked, not copied.",
    ],
    time: "O(L) per operation — one dict step per character (L = word/prefix length)",
    space: "O(total inserted characters) — shared prefixes collapse into shared nodes",
    followUps: [
      "Support delete(word): walk to the node, clear is_word, then prune childless marker-less nodes bottom-up so the trie doesn't bloat over time.",
      "Alphabet trade-off: a fixed 26-array per node buys faster constants for lowercase-only workloads; the dict generalises to Unicode and sparse branching.",
    ],
    related: ["design-add-and-search-words-data-structure", "word-search-ii", "search-suggestions-system"],
    verify: {
      fn: "Trie",
      wrap: "class",
      voidOps: ["insert"],
      cases: [
        {
          args: [[
            ["Trie"], ["insert", "apple"], ["search", "apple"], ["search", "app"],
            ["startsWith", "app"], ["insert", "app"], ["search", "app"],
          ]],
          expect: [true, false, true, true],
        },
        {
          args: [[
            ["Trie"], ["startsWith", "a"], ["insert", "abc"], ["search", "abc"],
            ["search", "ab"], ["startsWith", "abc"], ["startsWith", "abd"],
          ]],
          expect: [false, true, false, true, false],
        },
        {
          args: [[
            ["Trie"], ["insert", "band"], ["insert", "ban"], ["startsWith", "ba"],
            ["search", "ba"], ["search", "ban"], ["search", "band"],
          ]],
          expect: [true, false, true, true],
        },
      ],
    },
    xp: 20,
  },
  {
    slug: "design-add-and-search-words-data-structure",
    statement:
      "Design a structure that stores words and answers wildcard searches. addWord(word) records a plain lowercase word; search(word) reports whether some stored word matches the query, where each '.' in the query stands for any single letter. Dots appear only in queries, never in stored words, and a match must cover the query's full length exactly.",
    examples: [
      { input: 'addWord("bad"), addWord("dad"), addWord("mad"), search("pad"), search("bad"), search(".ad"), search("b..")', output: 'search("pad") → false, search("bad") → true, search(".ad") → true, search("b..") → true', explanation: '".ad" matches bad, dad and mad; "b.." matches bad.' },
      { input: 'addWord("a"), search("."), search("a"), search("aa"), addWord("aa"), search("a."), search("aa")', output: 'search(".") → true, search("a") → true, search("aa") → false, search("a.") → true, search("aa") → true', explanation: 'A one-letter word answers the dot; "a." must match at exactly length 2, so it fails until "aa" is added.' },
      { input: 'addWord("abc"), search("..."), search(".."), search("a.c")', output: 'search("...") → true, search("..") → false, search("a.c") → true', explanation: 'Dots stretch the match to the query\'s exact length — ".." cannot match a 3-letter word.' },
    ],
    constraints: [
      "1 <= word.length, query length <= 25",
      "addWord words are lowercase letters; search queries add '.' to that alphabet",
      "at most 3·10^4 total calls to addWord and search",
    ],
    breakdown: [
      "Without dots this is the plain trie problem — both operations are O(L) walks. The wildcard breaks the single walk: at a '.', the next character is unknown, so one branch is no longer enough. The natural repair is to fan out — at every dot, try EVERY child of the current node, each continuing the match on the rest of the query. That is a DFS over the trie, branching exactly where the pattern forces it and nowhere else.",
      "Length correctness comes for free, but it's worth saying why: a match must consume the entire query and end on a node whose is_word marker is true. A 2-letter query '..' fans out twice and demands a word-end at depth 2, so a stored 3-letter word can never answer it — the trie's depth IS the string length, and the structure prunes length mismatches without a single extra line. The alternative design (words bucketed by length, compared position-by-position) needs explicit per-length bookkeeping to get the same guarantee.",
      "The misstep is comparing the query against every stored word — O(N·L) per search and none of the design credit. A sneakier wrong turn is backtracking over the ALPHABET at each dot (try 'a'..'z'), which does 26^d work for d dots; fanning over trie children tries only branches that actually exist, typically a handful.",
    ],
    edges: [
      "An all-dots query ('...') degenerates to 'does any word of this length exist' — pure fan-out, no letters.",
      "A dot at the END of a query still must land on is_word — the final dot gets no free pass.",
      "Every concrete prefix existing is still not enough: search('ba') is false unless a word ENDS there (marker discipline again).",
      "Re-adding a word is harmless — boolean answers make duplicate reporting moot, but the trie tolerates the re-walk.",
    ],
    ladder: [
      { title: "Brute force — bucket by length and scan", body: "Store words in a dict length → set; a search compares the query position-by-position against every same-length word ('.' skips a position). O(N_L · L) per query — simple and correct, but it degrades badly when one length dominates the dictionary." },
      { title: "Plain trie — and where it jams", body: "A trie answers dot-free searches instantly, but at the first '.' the single-walk model has no move. Recognising that you need to try all children and backtrack is the bridge to the real solution." },
      { title: "The optimal idea — DFS that fans out at dots", body: "Walk concrete letters as usual; at each dot, recurse into every existing child with the remaining suffix; succeed only on is_word after the full query is consumed. Work is proportional to the trie nodes actually visited — dots multiply the search, but only along branches that real words built." },
    ],
    approach: "Trie + DFS fanning out at wildcards",
    code: `class WordDictionary:
    def __init__(self):
        self.children = {}          # char -> child node
        self.is_word = False        # a stored word ends exactly here

    def addWord(self, word):
        node = self
        for ch in word:                     # identical to a plain trie insert
            if ch not in node.children:
                node.children[ch] = WordDictionary()
            node = node.children[ch]
        node.is_word = True

    def search(self, word):
        node = self
        for i, ch in enumerate(word):
            if ch == ".":
                # wildcard: EVERY child continues the match on the suffix
                return any(child.search(word[i + 1:])
                           for child in node.children.values())
            node = node.children.get(ch)
            if node is None:                # concrete letter with no branch
                return False
        return node.is_word                 # must END on a word marker`,
    walkthrough: [
      "addWord is the plain trie insert, verbatim — the stored structure is completely wildcard-agnostic. All the wildcard machinery lives on the query side, which is the right division of labour: stored words are static data, queries are where branching happens, and inserts never pay for dots they never contain.",
      "search walks concrete letters exactly like the ordinary trie search — one child lookup per step, bailing the moment a branch is missing. At the first '.', any() hands the remaining suffix to every existing child recursively; dots deeper in the suffix trigger further fan-outs. A query like '.a.' therefore explores a small subtree of nodes spelled '?a?' — not the alphabet, and not the whole trie.",
      "Termination and length-correctness fall out of the loop shape: every recursive call consumes the dot plus whatever letters follow it, so progress is guaranteed; when the query is exhausted the loop exits and the current node's is_word decides. That is why 'a.' cannot match the stored word 'a' — after consuming 'a' and '.', we stand at depth 2, where no marker lives. Depth equals stored length, so length mismatches are pruned structurally rather than checked.",
    ],
    time: "O(L) per addWord; search is O(L) when dot-free and fans out only over children that actually exist where dots appear",
    space: "O(total added characters) for the trie, plus O(L) recursion depth on wildcard-heavy queries",
    followUps: [
      "If dots could appear in STORED words too, insert would fan out the same way — each wildcard node conceptually holding 26 children; the search code barely changes.",
      "Full regex on a trie ('.' plus '*' repetition) becomes DFS over (node, query index) pairs with memoisation — the trie version of regular-expression-matching.",
    ],
    related: ["implement-trie-prefix-tree", "word-search-ii", "regular-expression-matching"],
    verify: {
      fn: "WordDictionary",
      wrap: "class",
      voidOps: ["addWord"],
      cases: [
        {
          args: [[
            ["WordDictionary"], ["addWord", "bad"], ["addWord", "dad"], ["addWord", "mad"],
            ["search", "pad"], ["search", "bad"], ["search", ".ad"], ["search", "b.."],
          ]],
          expect: [false, true, true, true],
        },
        {
          args: [[
            ["WordDictionary"], ["addWord", "a"], ["search", "."], ["search", "a"],
            ["search", "aa"], ["addWord", "aa"], ["search", "a."], ["search", "aa"],
          ]],
          expect: [true, true, false, true, true],
        },
        {
          args: [[
            ["WordDictionary"], ["addWord", "abc"], ["search", "..."], ["search", ".."],
            ["search", "...."], ["search", "a.c"],
          ]],
          expect: [true, false, false, true],
        },
      ],
    },
    xp: 20,
  },
  {
    slug: "word-search-ii",
    statement:
      "Given a grid of lowercase letters and a list of words, return every word that can be traced in the grid: starting from any cell and stepping between horizontally or vertically adjacent cells, using each cell at most once within a single word's path. Different words may reuse cells freely, and the answer may be returned in any order.",
    examples: [
      { input: 'board = [["o","a","a","n"],["e","t","a","e"],["i","h","k","r"],["i","f","l","v"]], words = ["oath","pea","eat","rain"]', output: '["oath","eat"]', explanation: '"oath" traces o→a→t→h; "eat" traces e→a→t. "pea" and "rain" cannot be formed.' },
      { input: 'board = [["a","b"],["c","d"]], words = ["abcb"]', output: "[]", explanation: "The path dies before a second 'b' is reachable — no cell may be revisited within one word." },
      { input: 'board = [["a","a"]], words = ["aaa"]', output: "[]", explanation: "Two cells can never spell three letters without reuse." },
    ],
    constraints: [
      "1 <= board.length, board[i].length <= 12",
      "1 <= words.length <= 3·10^4, 1 <= words[i].length <= 10",
      "all words are unique lowercase English letters, total length ≤ 3·10^5",
    ],
    breakdown: [
      "One word in the grid is classic backtracking: from every cell, try to trace the word, mark cells as used, and un-mark on the way out. Word Search I is exactly that. Run it per word, though, and the cost is words × cells × paths — with 3·10^4 words on a 12×12 grid you re-walk the same board thousands of times, re-exploring identical prefixes ('oat' for 'oath' and 'oats') over and over.",
      "The fix is to invert the loop: walk the GRID once and bring the DICTIONARY along. Load all words into a trie, start a DFS from every cell, and let the current trie node answer one question per step — does ANY word continue with this letter, and did one just complete? Prefixes are shared inside the trie, so the 'oat…' subtree is explored once no matter how many words extend it.",
      "Two refinements make it fast in practice. Dedupe completions, because one word can be traced by several paths (two different 'e's spelling 'eat') — consume the end-marker after the first hit or collect into a set. And prune: when a node's children are exhausted, cut it out of the trie so dead branches are never visited again, while the '#' visited marking prevents per-path cell reuse.",
    ],
    edges: [
      "The same word reachable via multiple paths must be reported ONCE — dedupe by consuming the trie's end-marker (or a result set).",
      "Visited marking is per-path state: mark on entry, RESTORE on exit, or sibling paths see a falsely-used board.",
      "Words that are prefixes of each other ('oat' vs 'oaths'): completing a word must not stop the walk — longer words continue from the same node.",
      "A word needing to reuse a cell ('aaa' on a 2-cell board) is impossible — the '#' marking enforces the no-revisit rule.",
    ],
    ladder: [
      { title: "Brute force — per-word grid search", body: "For each word, run the Word Search I backtracking from every cell: O(words · m·n · 3^(L−1)). 3·10^4 words × 144 cells is a non-starter, and shared prefixes get re-explored independently for every word." },
      { title: "Prefix-set pruning on one sweep", body: "Precompute every prefix of every word into a hash set; run ONE grid DFS that extends a path only while the current string is a known prefix. Shares the walk across words — but carries full strings and re-hashes at every step; the trie is this idea with the bookkeeping done right." },
      { title: "The optimal idea — trie-guided single sweep", body: "One trie of all words; DFS from every cell walks board and trie together. End-markers record completions and get consumed, childless subtrees get pruned, and every step is a single dict lookup that advances a real trie node." },
    ],
    approach: "Trie-guided backtracking sweep",
    code: `def findWords(board, words):
    root = {}                       # trie as nested dicts; '#' marks word ends
    for w in words:
        node = root
        for ch in w:
            node = node.setdefault(ch, {})
        node["#"] = True

    rows, cols = len(board), len(board[0])
    found = []

    def dfs(r, c, parent, path):
        ch = board[r][c]
        node = parent.get(ch)
        if node is None:            # no word continues with this letter here
            return
        path += ch
        if "#" in node:             # some word completes at this cell
            found.append(path)
            del node["#"]           # consume the marker -> each word reported once
        board[r][c] = "#"           # mark the cell as used on this path
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                dfs(nr, nc, node, path)
        board[r][c] = ch            # restore - sibling paths need it back
        if not node:                # subtree exhausted -> prune from the trie
            del parent[ch]

    for r in range(rows):
        for c in range(cols):
            dfs(r, c, root, "")
    return found`,
    walkthrough: [
      "The trie is nested dicts built with setdefault, with '#' as the end marker — '#' is safe because board letters are lowercase. Each dfs step asks the current node exactly one question via a single dict lookup: does any word continue with the letter under the cursor? A mismatch is an immediate return, so dead letters cost one hash probe, not a subtree walk.",
      "Hitting a '#' marker means a word just completed along this exact path: append the path, then DELETE the marker. Deleting turns 'at most once per path' into 'at most once, period' — any later path that reaches the same node finds no marker and skips the append. Consuming markers also feeds the pruning: a fully harvested subtree becomes an empty dict, which is the prune's trigger condition.",
      "The board's '#' is per-path state, not global: set on entry, restored after the four neighbour recursions, so the grid an ancestor hands its siblings is exactly the grid it received. The prune runs on unwind — if the node ended up childless and marker-less, the parent's edge to it is deleted — so after 'abcd' is harvested its whole chain evaporates and later starting cells fail one lookup instead of re-walking. Mark, recurse, restore, prune: the four verbs that keep one sweep correct for the entire dictionary.",
    ],
    time: "O(m·n·3^(L−1)) — every cell starts at most one walk, each step fans to at most 3 fresh directions (L = longest word)",
    space: "O(S) for the trie (S = total word characters) plus O(L) recursion depth",
    followUps: [
      "Report the words without string-building bookkeeping: store the full word at terminal nodes instead of a '#' flag and append node['word'] on completion.",
      "Streaming variant (add one letter per query, report all completions ending anywhere): keep the previous step's (cell, trie node) frontier pairs alive between queries instead of restarting from every cell.",
    ],
    related: ["word-search", "implement-trie-prefix-tree", "concatenated-words"],
    verify: {
      fn: "findWords",
      wrap: "plain",
      normalize: "sortFlat",
      cases: [
        {
          args: [
            [
              ["o", "a", "a", "n"],
              ["e", "t", "a", "e"],
              ["i", "h", "k", "r"],
              ["i", "f", "l", "v"],
            ],
            ["oath", "pea", "eat", "rain"],
          ],
          expect: ["oath", "eat"],
        },
        { args: [[["a", "b"], ["c", "d"]], ["abcb"]], expect: [] },
        { args: [[["a", "a"]], ["aaa"]], expect: [] },
        { args: [[["a", "a"]], ["a", "aa"]], expect: ["a", "aa"] },
        {
          args: [[["a", "b", "c", "d"]], ["ab", "ba", "abc", "abcd", "dcb"]],
          expect: ["ab", "ba", "abc", "abcd", "dcb"],
        },
      ],
    },
    xp: 35,
  },
];
