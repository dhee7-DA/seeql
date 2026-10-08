// Deep-dives — batch 10, file 3 of 5: the free-tier parsing/format dives —
// capitalization walks, email/IP/serial validation, DNA motif counting
// (5 problems: 2 Easy, 1 Medium, 2 Hard). Engine-verified by scripts/lc-sql-verify.ts.
// Re-authored from the canonical tasks: own tables, own seeds,
// original phrasing — never copied problem text.
import type { LcSqlDive } from "../types";

export const SQL_FREE_PARSING: LcSqlDive[] = [
  {
    slug: "first-letter-capitalization-ii",
    statement:
      "Content stores short phrases, one per row (entry_id, content): every word is lowercase, words are separated by exactly one space, and there is no punctuation. Transform each phrase the way a style engine would title it: capitalize the first letter of every word EXCEPT the stop-words 'of', 'and', 'the' and 'at', which stay lowercase wherever they appear — unless a stop-word is the FIRST word of the phrase, in which case it is capitalized like any other. Report columns entry_id, transformed — the reworked phrase, same words in the same order, single spaces — ordered by entry_id ascending.",
    examples: [
      {
        input: "entry 1 stores the five-word phrase 'the lord of the rings'",
        output: "The Lord of the Rings",
        explanation:
          "The leading stop-word 'the' takes the first-word override and prints 'The'; 'of' and the mid-phrase 'the' stay lowercase; the non-stop-words 'lord' and 'rings' are capitalized.",
      },
      {
        input: "entry 2 stores just the stop-word 'and' — a one-word phrase",
        output: "And",
        explanation:
          "Alone in a phrase the stop-word is also the first word, so the override capitalizes it; anywhere else in a phrase it would print lowercase.",
      },
    ],
    constraints: [
      "content holds at least one word; words are lowercase a-z separated by exactly one space, with no leading or trailing spaces and no punctuation",
      "the stop-word set is exactly 'of', 'and', 'the', 'at'; a stop-word keeps its lowercase spelling everywhere except in position one, where it is capitalized",
      "columns entry_id, transformed — one row per entry, the phrase rebuilt with single spaces and no trailing space — ordered by entry_id ascending",
    ],
    breakdown: [
      "Splitting a phrase inside SQLite is recursive-CTE work: there is no SPLIT function, so the engine must peel one word per step. The walk keeps the unconsumed tail in a column and, at each step, cuts the next word off the front: the word is everything before the first space of the tail, and the new tail is everything after it. Padding the content with one trailing space is what lets the LAST word take the same code path as the rest — without it, a word with no space after it never becomes a piece, and the walk silently drops it. The recursion terminates because every step strictly shortens the tail, and the row whose tail is empty holds the finished sentence.",
      "The capitalization decision needs two facts about each word: its spelling and its position. Position matters because the stop-word list only applies from the second word on — a stop-word in the lead is capitalized like any other word, which is the rule entry 1 and the lone 'and' entry exercise. The CASE therefore tests the running word count first (words consumed so far, starting at zero in the anchor) and only then compares LOWER(word) against the four-element list. Lowercasing before comparing makes the guard robust to case drift even though this table guarantees lowercase input; comparing the raw spelling would work here but hard-codes an assumption the next table load could break.",
      "Reassembly happens inside the walk, not after it: each step appends the transformed word plus a single space to the built string, so pieces can never arrive out of order. That orderliness is exactly what GROUP_CONCAT cannot promise — its concatenation order is engine-dependent unless a sorted subquery feeds it, and it invites separator bugs on top. The built column is deterministic by construction, and one RTRIM at the end removes the single trailing space the append pattern leaves. The result reads like the input: same words, same order, exactly one space between neighbors.",
    ],
    edges: [
      "Entry 2 ('and') punishes the unconditional stop-word rule: a CASE that lowercases every listed word reports 'and' where the truth is 'And' — the first-word override is the only thing that capitalizes it, and no other row exercises it so sharply.",
      "Entry 1 ('the lord of the rings') punishes the capitalize-everything query: it prints 'The Lord Of The Rings', wrong on both mid-phrase stop-words — and it punishes the missing override in the other direction, printing 'the Lord of the Rings' with a lowercased lead.",
      "Entry 3 ('salt water air at') punishes two lazy endings at once: capitalizing without consulting the list prints 'Salt Water Air At' (the trailing stop-word must stay lowercase), and a walk that only cuts at spaces loses the final word entirely, shipping 'Salt Water Air'.",
      "The reassembly must be exact: the walk appends a space after every word, so skipping the final RTRIM ships 'The Lord of the Rings ' with a trailing space — a one-character defect a strict comparison grades wrong on every row.",
    ],
    ladder: [
      { title: "Brute force — split in application code", body: "Read each row, split the phrase on spaces in the host language, loop the words applying the stop-word rule, and rebuild the sentence by hand. Correct, but it drags every row out of the database to do string work the engine can express." },
      { title: "The pattern — a recursive word splitter", body: "WITH RECURSIVE walks the phrase, peeling one word per step into (word, position); a CASE over LOWER(word) and the position applies the stop-word rule; the pieces are then put back together." },
      { title: "The optimal idea — transform and reassemble in one walk", body: "O(L^2) per entry at worst (each step rescans the tail). The durable rule: fold the output string during the same recursion that consumes the input — order is inherited from the walk, with no second pass and no GROUP_CONCAT ordering gamble." },
    ],
    approach: "one WITH RECURSIVE walk peels a word per step, applies the position-aware stop-word CASE, and concatenates the transformed words as it goes",
    schema: {
      ddl: `CREATE TABLE Content (
  entry_id INTEGER PRIMARY KEY,
  content  TEXT NOT NULL
);`,
      seed: `INSERT INTO Content (entry_id, content) VALUES
  (1, 'the lord of the rings'),  -- a stop-word leads, two more sit mid-phrase
  (2, 'and'),                    -- a lone stop-word: the first-word override fires
  -- the LAST word is a stop-word and must stay lowercase
  (3, 'salt water air at');`,
      tables: [
        { name: "Content", note: "3 phrases — entry 1 mixes stop-words at the front and middle, entry 2 is a bare stop-word, entry 3 ends on one" },
      ],
    },
    code: `WITH RECURSIVE walk(entry_id, rest, built, wno) AS (
    SELECT entry_id, content || ' ', '', 0   -- pad one trailing space so the LAST word takes the same path
    FROM Content
    UNION ALL
    SELECT
        entry_id,
        SUBSTR(rest, INSTR(rest, ' ') + 1),           -- tail after the word and its space
        built
          || CASE
               WHEN wno > 1 AND LOWER(SUBSTR(rest, 1, INSTR(rest, ' ') - 1))
                    IN ('of', 'and', 'the', 'at')
               THEN SUBSTR(rest, 1, INSTR(rest, ' ') - 1)    -- stop-word from word 2 on: unchanged
               ELSE UPPER(SUBSTR(rest, 1, 1)) || SUBSTR(rest, 2, INSTR(rest, ' ') - 2)
             END
          || ' ',                                            -- exact single-space reassembly
        wno + 1
    FROM walk
    WHERE rest <> ''                                         -- terminates: every step shortens the tail
)
SELECT
    entry_id,
    RTRIM(built) AS transformed    -- drop the one trailing space the append pattern leaves
FROM walk
WHERE rest = ''                    -- terminal rows carry the finished sentences
ORDER BY entry_id;`,
    walkthrough: [
      "The anchor pads each phrase and zeroes the word count: entry 1 starts as 'the lord of the rings ' with built empty, entry 2 as 'and ', entry 3 as 'salt water air at '.",
      "Each step peels the front word and transforms it: entry 1 walks the, lord, of, the, rings — word one takes the override and prints 'The', lord and rings capitalize, of and the second the stay lowercase; entry 2's only word is a stop-word at position one, so the override prints 'And'; entry 3's trailing 'at' sits past word one, so the list keeps it lowercase.",
      "The terminal rows (empty tail) ship three rows ordered by entry_id: (1, 'The Lord of the Rings'), (2, 'And'), (3, 'Salt Water Air at') — the RTRIM strips the trailing space each append left behind.",
    ],
    time: "O(L^2) per entry in the worst case — each step re-scans the remaining tail; these phrases are tiny",
    space: "O(w) per entry — recursion depth of one in-flight row per word",
    followUps: [
      "Generalize the stop-word list to a second table loaded at run time — how does the CASE change when the list arrives as rows instead of a literal IN list, and what does that cost per step?",
      "Capitalize instead the LAST word of every phrase regardless of what it is — where in the walk does 'last' become knowable, and why can the CASE not decide it at the step that transforms the word?",
    ],
    related: ["first-letter-capitalization", "fix-names-in-a-table", "concatenate-the-name-and-the-profession"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-valid-emails",
    statement:
      "Contact lists people one row each (contact_id, email). An email is VALID when three things hold at once: exactly one '@' separates the parts, the local part in front of the '@' is non-empty, and the domain behind it ends with '.com' with at least one character before that dot. Report every valid address — a single column email, one row per valid contact, ordered by email ascending.",
    examples: [
      {
        input: "contact 1 'ada@mail.com' and contact 6 'esme@a.b.com'",
        output: "ada@mail.com · esme@a.b.com",
        explanation:
          "Both carry a non-empty local part, a single '@', and a domain of real labels ending in '.com' — esme's multi-label 'a.b.com' is fine because a real label sits in front of the final dot.",
      },
      {
        input: "contact 4 '@nope.com' — a well-shaped domain behind an empty local part",
        output: "(no row — the empty local part disqualifies it)",
        explanation:
          "The '@' in position one leaves nothing before it; every domain check would pass, and the local-part guard is the only arm that removes the row.",
      },
    ],
    constraints: [
      "every email contains at least one '@' and no spaces; contact_id is unique per row",
      "valid = exactly one '@' AND a non-empty local part AND a domain whose tail is '.com' with at least one character before that tail — all three arms must pass",
      "single column email, one row per valid contact, ordered by email ascending",
    ],
    breakdown: [
      "One GLOB cannot say this — and the tempting one lies. The pattern '*@*.com' looks like the whole rule, but GLOB's star matches zero characters as happily as many, so the arm admits 'cleo@.com' (the domain star shrinks to nothing), '@nope.com' (the local star does the same), and 'dov@two@@mail.com' (the leading star swallows the extra '@'). On this seed that single arm passes five of the six rows; only 'bram@corp.org' dies. Whole-string matching pins the tail, but the interesting rules live in the counts and the gaps between the symbols.",
      "So the check decomposes into arms, each aimed at one failure mode. The '@' count is a GLOB on a GLOB: any string matching '*@*@*' holds at least two of them, so NOT GLOB '*@*@*' — plus the schema's at-least-one guarantee — leaves exactly one. The local part is INSTR work, everything before the first '@', and INSTR can be trusted to have found one because the count arm already ran. The domain is the substring after that '@', and it must clear '?*.com': the literal tail forces the '.com' ending, and the leading '?' forces at least one real character before that tail, which is exactly the arm 'cleo@.com' fails.",
      "Arm order matters less than arm existence — but each arm must be load-bearing, and the seed makes every one of them so. Drop the count arm and 'dov@two@@mail.com' walks in; drop the local arm and '@nope.com' ships; drop the domain arm and both 'cleo@.com' and 'bram@corp.org' leak, which is why the '.com' tail lives inside the domain arm rather than being trusted to the shape filter alone. Writing validation as independent documented guards rather than one clever pattern keeps the report debuggable when the next invalid shape arrives.",
    ],
    edges: [
      "Contact 5 ('dov@two@@mail.com') dies only on the count arm: its first '@' makes '*@*.com' true and its local part is 'dov', so dropping NOT GLOB '*@*@*' leaks a two-'@' address into the report.",
      "Contact 4 ('@nope.com') is the local-part trap: INSTR finds the '@' at position one, SUBSTR(email, 1, 0) returns the empty string, and the <> '' guard is the only thing between it and the output.",
      "Contact 3 ('cleo@.com') defeats the shape GLOB but falls to '?*.com': the star in '*@*.com' happily matches nothing, while the '?' in the domain arm demands one real character before the '.com' tail.",
      "Contact 2 ('bram@corp.org') is the tail trap — the only row bare '*@*.com' catches — so a query that keeps the shape GLOB but forgets the '?*' label requirement still reports it wrong twice over.",
    ],
    ladder: [
      { title: "Brute force — scan the string by hand", body: "Walk each email character by character counting '@' signs, note the split index, and test prefix and suffix with the host language's endsWith. Three checks the engine expresses as two GLOBs and one INSTR cut." },
      { title: "The pattern — one guard per failure mode", body: "NOT GLOB '*@*@*' pins the '@' count, an INSTR/SUBSTR pair isolates the local part, and the domain must clear '?*.com' — each arm documentable and droppable on its own." },
      { title: "The optimal idea — decompose until every arm is load-bearing", body: "O(n) per row. The durable rule: a validation one mega-pattern cannot express is a conjunction of small guards, each pinned to a seed row that fails every other arm — if no row proves an arm necessary, the arm is untested." },
    ],
    approach: "three ANDed guards — NOT GLOB '*@*@*' for the single '@', INSTR/SUBSTR for the non-empty local, domain GLOB '?*.com' for the label-plus-tail",
    schema: {
      ddl: `CREATE TABLE Contact (
  contact_id INTEGER PRIMARY KEY,
  email      TEXT NOT NULL
);`,
      seed: `INSERT INTO Contact (contact_id, email) VALUES
  (1, 'ada@mail.com'),        -- valid: plain single-label domain
  (2, 'bram@corp.org'),       -- out: tld is not .com
  (3, 'cleo@.com'),           -- out: no character between @ and the dot
  (4, '@nope.com'),           -- out: empty local part
  (5, 'dov@two@@mail.com'),   -- out: two @ signs
  -- valid: multi-label domain, still ends .com
  (6, 'esme@a.b.com');`,
      tables: [
        { name: "Contact", note: "6 addresses — two valid (1, 6) and four invalid, one per failure mode: tld, empty domain label, empty local, doubled @" },
      ],
    },
    code: `SELECT email
FROM Contact
WHERE
    email NOT GLOB '*@*@*'                               -- arm A: schema guarantees at least 1 '@' — no second one allowed
AND SUBSTR(email, 1, INSTR(email, '@') - 1) <> ''        -- arm B: the local part before the '@' is non-empty
AND SUBSTR(email, INSTR(email, '@') + 1) GLOB '?*.com'   -- arm C: domain ends '.com' with >= 1 char before that tail
ORDER BY email;`,
    walkthrough: [
      "Arm A keeps every row except contact 5: 'dov@two@@mail.com' matches '*@*@*' (two '@' signs), and with the schema promising at least one '@', NOT GLOB leaves exactly one.",
      "Arm B then drops contact 4: INSTR lands on position one, so the slice before the '@' is the empty string. Arm C drops contact 3 ('.com' with nothing before the dot) and contact 2 ('.org' cannot end the '?*.com' shape).",
      "Two rows survive and ship in email order: (ada@mail.com), then (esme@a.b.com) — esme's 'a.b.com' passes because a real label sits in front of the '.com' tail.",
    ],
    time: "O(n) per row — one GLOB pass plus two bounded substring cuts",
    space: "O(1) beyond the output rows",
    followUps: [
      "Report the INVALID addresses beside a failure-reason column — how would you turn each dropped arm into a CASE label, and which seed contact does each label name?",
      "Admit '.org' and '.net' domains too — does a list of tails GLOB cleanly, or does the domain arm need restructuring (an OR per tail, or a join against a suffix table)?",
    ],
    related: ["find-users-with-valid-e-mails", "invalid-tweets", "find-all-unique-email-domains"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-invalid-ip-addresses",
    statement:
      "LogLine records one network event per row (log_id, ip), and the ip column is supposed to hold a dotted-quad IPv4 address, but the ingestion pipeline is not trusted. An ip is VALID only when it has exactly four octets separated by dots, every octet is one to three digits, each octet's numeric value is at most 255, and no octet carries a leading zero — a single '0' is fine, but '01' is not. Report the INVALID addresses: a single column ip, one row for every logged ip that fails any rule, ordered by ip ascending.",
    examples: [
      {
        input: "log 2 '256.1.1.1' and log 3 '1.02.3.4'",
        output: "256.1.1.1 · 1.02.3.4",
        explanation:
          "256 clears the digit checks but not the ceiling of 255; 02 passes the range check numerically (it is just 2) and is caught by the leading-zero rule instead.",
      },
      {
        input: "log 4 '1.2.3' and log 5 '1.2.3.4.5'",
        output: "1.2.3 · 1.2.3.4.5",
        explanation:
          "Both have the right kind of pieces and the wrong count — three octets and five octets — while the shape looks dotted enough to fool a pattern-only check.",
      },
    ],
    constraints: [
      "ip is a non-empty string containing no spaces; dots may sit anywhere, in any count",
      "invalid = the octet count is not exactly 4, OR any octet fails: not 1-3 digits, or value over 255, or a leading zero (length over 1 starting with '0')",
      "single column ip, one row per invalid LogLine, ordered by ip ascending",
    ],
    breakdown: [
      "Counting and cutting are the two jobs, and a shape GLOB cannot do the counting precisely. A four-group dotted pattern rejects the three-octet '1.2.3' for having too few dots, yet its inner stars cross dot boundaries freely, so the five-octet '1.2.3.4.5' slips through; the looser '*.*.*.*' also admits the lettered 'abc.def.1.2'. The octet count therefore has to come from a real split: WITH RECURSIVE peels one piece per step by cutting the tail at its first dot, and the number of pieces produced IS the octet count. Splitting also normalizes the lettered line — its pieces exist and get graded like any other, so no separate is-it-dotted pre-check is needed.",
      "Per-piece grading is three independent rules, and the natural mistake is merging them into one. The digits rule is GLOB work where whole-string matching finally helps: '[0-9]', '[0-9][0-9]' and '[0-9][0-9][0-9]' each match an ENTIRE piece, so '1x', '12x' and the four-digit '1234' fail all three at once — no anchors to forget, unlike LIKE. The range rule is CAST arithmetic, and it only means something for digit-only pieces: 'abc' casts to 0 and would sail through, but the digits rule already flagged it. The leading-zero rule stays separate from the range rule on purpose — CAST('02') is 2, squarely in range, so only a length-plus-first-character test catches it.",
      "One aggregation detail decides whether the whole query works: the anchor row of the split carries NULL in the piece column (nothing consumed yet), and a NULL piece quietly trips the digits CASE — NULL GLOB anything is not true, so the ELSE branch scores it 1 and every ip looks bad. The grading CTE must drop the anchor explicitly (WHERE piece IS NOT NULL) before GROUP BY; then COUNT(*) is the octet count and MAX over the per-piece flags answers any-bad-octet. The final filter joins the two failure families with OR — wrong count or any bad piece — because invalid means failing ANY rule. ORDER BY ip finishes the contract.",
    ],
    edges: [
      "Log 3 ('1.02.3.4') punishes the range-only query: every octet casts in range (2 for the '02'), so the leading-zero arm — length over 1 starting with '0' — is the only rule that reports it.",
      "Log 5 ('1.2.3.4.5') punishes the dotted-shape GLOB: the four-group pattern's inner stars cross dots, so a pattern-only checker admits the five-octet line, and the exact count of 4 has to come from the split.",
      "Log 7 ('abc.def.1.2') punishes CAST-only validation: every lettered octet casts to a small number ('abc' to 0), so the digits arms — three whole-string GLOBs — are the only defense.",
      "Log 6 ('0.0.0.0') punishes an overeager leading-zero test: checking SUBSTR(piece, 1, 1) = '0' alone flags the legal single '0' four times and reports a VALID address as invalid; the LENGTH(piece) > 1 gate is what spares it.",
    ],
    ladder: [
      { title: "Brute force — split and inspect in the host", body: "Pull every row, split each ip on dots in application code, and run the four rules with string and number functions. A dozen lines the engine compresses into one recursive CTE and three CASE arms." },
      { title: "The pattern — recursive splitter plus per-piece grading", body: "WITH RECURSIVE cuts one octet per step (count = pieces produced); a GROUP BY per log grades each piece with digit, range and leading-zero flags; MAX folds them to any-bad." },
      { title: "The optimal idea — exact counts need real splits, exact rules need separate arms", body: "O(P) pieces total, each graded once. The durable rules: shape patterns cannot count segments, and conflated validation rules hide which rule failed — three arms, three failure modes, each provable on its own seed row." },
    ],
    approach: "WITH RECURSIVE dot-splitter yields one row per octet; per-log grading flags digit, range and leading-zero violations; invalid = count <> 4 OR any flag",
    schema: {
      ddl: `CREATE TABLE LogLine (
  log_id INTEGER PRIMARY KEY,
  ip     TEXT NOT NULL
);`,
      seed: `INSERT INTO LogLine (log_id, ip) VALUES
  (1, '192.168.1.1'),   -- valid: stays out of the report
  (2, '256.1.1.1'),     -- invalid: octet over 255
  (3, '1.02.3.4'),      -- invalid: leading zero on octet 2
  (4, '1.2.3'),         -- invalid: three octets
  (5, '1.2.3.4.5'),     -- invalid: five octets
  (6, '0.0.0.0'),       -- valid: a single '0' is a legal octet
  (7, 'abc.def.1.2'),   -- invalid: lettered octets
  -- valid: exactly 255 is in range
  (8, '10.0.1.255');`,
      tables: [
        { name: "LogLine", note: "8 log lines — five invalid (2-5, 7) covering over-range, leading zero, short, long and lettered; three valid (1, 6, 8) that must stay out" },
      ],
    },
    code: `WITH RECURSIVE split(log_id, ip, rest, piece) AS (
    SELECT log_id, ip, ip || '.', CAST(NULL AS TEXT)   -- anchor: the whole line plus one slack dot
    FROM LogLine
    UNION ALL
    SELECT
        log_id,
        ip,
        SUBSTR(rest, INSTR(rest, '.') + 1),    -- tail after the consumed dot
        SUBSTR(rest, 1, INSTR(rest, '.') - 1)  -- the octet in front of it
    FROM split
    WHERE rest <> ''                           -- every step shortens the tail: guaranteed to stop
),
graded AS (
    SELECT
        log_id,
        ip,
        COUNT(*) AS octets,                    -- non-anchor pieces = octet count
        MAX(
            CASE WHEN piece GLOB '[0-9]' OR piece GLOB '[0-9][0-9]' OR piece GLOB '[0-9][0-9][0-9]'
                 THEN 0 ELSE 1 END             -- 1-3 digits, WHOLE piece (GLOB is whole-string)
          + CASE WHEN CAST(piece AS INTEGER) > 255 THEN 1 ELSE 0 END                    -- numeric ceiling
          + CASE WHEN LENGTH(piece) > 1 AND SUBSTR(piece, 1, 1) = '0' THEN 1 ELSE 0 END  -- leading zero, '0' alone legal
        ) AS bad
    FROM split
    WHERE piece IS NOT NULL                    -- the anchor carries no octet — a NULL piece would trip the digits CASE
    GROUP BY log_id, ip
)
SELECT ip
FROM graded
WHERE octets <> 4 OR bad > 0                   -- invalid: wrong count OR any rule broken
ORDER BY ip;`,
    walkthrough: [
      "The splitter turns each line into one piece per dot: log 4 yields three pieces ('1', '2', '3'), log 5 five, and the valid quads four each — the piece count is the octet count, so logs 4 and 5 die on octets <> 4.",
      "Grading over log 3's pieces flags the '02' on the leading-zero arm (its CAST is a legal 2), log 2's '256' on the range arm (the ceiling is 255, and log 8's '255' stays legal), and log 7's 'abc' and 'def' on the digits arms.",
      "Five rows ship in ip order: (1.02.3.4), (1.2.3), (1.2.3.4.5), (256.1.1.1), (abc.def.1.2) — logs 1, 6 and 8 pass every arm and stay out.",
    ],
    time: "O(P) over the P octet pieces produced, each graded once; the per-step SUBSTR re-scan adds a string-length factor",
    space: "O(P) — one splitter row per octet plus one graded row per log",
    followUps: [
      "Report the valid ips too, beside a reject-reason column for the invalid ones — how do the two failure families (count vs piece rules) become readable labels, and which log feeds each label?",
      "Validate IPv6-style hex groups instead — what survives of the splitter, and why do the digit arms need a character-class rewrite before anything else changes?",
    ],
    related: ["invalid-tweets-ii", "find-users-with-valid-e-mails", "find-trending-hashtags"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-products-with-valid-serial-numbers",
    statement:
      "Item catalogs one row per product (item_id, serial), where serial is a free-form label typed in by suppliers. A serial is VALID only when it matches the exact house shape: the literal 'SN-', then exactly four uppercase letters, then '-', then exactly six digits — with nothing before, between, or after those parts. Report the items carrying valid serials: a single column item_id, one row per qualifying item, ordered by item_id ascending.",
    examples: [
      {
        input: "item 1 'SN-ABCD-123456' and item 2 'SN-ABC-123456'",
        output: "1",
        explanation:
          "The first fits the shape exactly; the second is one letter short in the letter block, and a fixed-arity pattern has no room for three-letter substitutes.",
      },
      {
        input: "item 5 'XSN-ABCD-123456' and item 6 'SN-ABCD-1234567'",
        output: "(no rows — junk on either side breaks the match)",
        explanation:
          "A substring test would find a perfect serial INSIDE both strings; whole-string matching refuses the stray leading X and the extra trailing digit.",
      },
    ],
    constraints: [
      "serial is a non-empty string with no spaces; the pattern is case-sensitive — lowercase letters never stand in for uppercase ones",
      "valid = the ENTIRE serial equals SN- plus 4 uppercase letters plus - plus 6 digits; no prefix or suffix is tolerated",
      "single column item_id, one row per item with a valid serial, ordered by item_id ascending",
    ],
    breakdown: [
      "The whole task is one GLOB, and the pattern writes itself once the semantics are clear: 'SN-' followed by four [A-Z] atoms, a dash, and six [0-9] atoms. The load-bearing fact is that SQLite's GLOB matches the WHOLE string — a pattern with no leading or trailing star is implicitly anchored at both ends. That is why item 5's leading 'X' and item 6's trailing seventh digit fail without any padding, and it is also why adding a star to be safe would RE-admit item 5: the padding, not the pattern, is the bug. Anchoring here is free; anchoring by hand is what introduces the defects.",
      "GLOB is also the only pattern engine here that can say this at all. LIKE has no character classes — '[A-Z]' is a literal bracket string to LIKE — so the letter block is inexpressible, and the nearest LIKE shape (underscores in place of the atoms) is case-insensitive for ASCII letters, which happily matches item 4's lowercase 'abcd'. GLOB's classes are case-sensitive by design, which is exactly the rule the serial format needs. The digits block could fall back to underscores plus a range check, but one readable pattern beats a pattern-plus-patch.",
      "The fixed arities do the rest of the work. Four separate [A-Z] atoms mean a three-letter block cannot borrow from the dash or the digits — item 2 dies cleanly — and writing [A-Z] followed by a star instead would let that star run past four letters and re-admit it. Six [0-9] atoms pin the digit block from both sides: item 3's five digits leave the string one character short of the pattern, and item 6's seven overshoot it. Every seed row fails a different atom of the same pattern, which is the quiet advantage of spelling the shape out character by character.",
    ],
    edges: [
      "Item 4 ('SN-abcd-123456') is the case trap: GLOB's [A-Z] refuses lowercase, while the LIKE approximation with underscores — the only LIKE rendering, since LIKE has no classes — is case-insensitive and would admit it.",
      "Items 5 and 6 ('XSN-ABCD-123456', 'SN-ABCD-1234567') are the padding traps: a substring test, or a star added to either end of the GLOB, finds the valid serial inside both — the whole-string semantics are the match, not a nuisance.",
      "Item 2 ('SN-ABC-123456') punishes the star-inside-the-class shortcut: [A-Z] followed by a star runs past the intended four letters, so a 3-letter or 9-letter block fits just as well; only four separate atoms pin the count.",
      "Item 3 ('SN-ABCD-12345') dies on the digit arity from the short side — five digits leave the whole string one character short — the mirror image of item 6's overshoot on the long side.",
    ],
    ladder: [
      { title: "Brute force — dissect the string", body: "Check the length (14 for a valid serial), test SUBSTR slices against letters-only and digits-only rules, and compare the two dashes by position. Five predicates the single GLOB folds into one call." },
      { title: "The pattern — one whole-string GLOB", body: "'SN-' plus four [A-Z] atoms plus '-' plus six [0-9] atoms expresses prefix, arities and case-sensitivity in one pattern that matches the entire serial." },
      { title: "The optimal idea — let the pattern engine's whole-string rule be the anchor", body: "O(1) per row. The durable rules: GLOB is whole-string, so no padding and no anchors — and any padding you add converts the pattern into the substring search the task forbids." },
    ],
    approach: "one case-sensitive whole-string GLOB — SN- plus four [A-Z] atoms, a dash, six [0-9] atoms — with no padding",
    schema: {
      ddl: `CREATE TABLE Item (
  item_id INTEGER PRIMARY KEY,
  serial  TEXT NOT NULL
);`,
      seed: `INSERT INTO Item (item_id, serial) VALUES
  (1, 'SN-ABCD-123456'),   -- valid: the exact house shape
  (2, 'SN-ABC-123456'),    -- out: three letters, not four
  (3, 'SN-ABCD-12345'),    -- out: five digits, not six
  (4, 'SN-abcd-123456'),   -- out: lowercase letters
  (5, 'XSN-ABCD-123456'),  -- out: junk before the pattern
  -- out: junk after the pattern
  (6, 'SN-ABCD-1234567');`,
      tables: [
        { name: "Item", note: "6 supplier serials — exactly one fits the SN- + 4 caps + - + 6 digits shape; the other five fail a different atom each" },
      ],
    },
    code: `SELECT item_id
FROM Item
WHERE serial GLOB 'SN-[A-Z][A-Z][A-Z][A-Z]-[0-9][0-9][0-9][0-9][0-9][0-9]'  -- whole-string: no padding, no anchors
ORDER BY item_id;`,
    walkthrough: [
      "The pattern reads as a checklist: literal 'SN-', four case-sensitive letter atoms, a dash, six digit atoms — fourteen characters total, no give on either end.",
      "Item 1 satisfies every atom. Item 2 collapses at the fourth letter atom, item 3 at the sixth digit atom, item 4 at the first (case-sensitive) letter atom.",
      "Items 5 and 6 hold the perfect serial as a substring, but the whole-string rule rejects both: one row ships — item_id 1 — ordered by item_id.",
    ],
    time: "O(1) per row — a single fixed-arity pattern match",
    space: "O(1) beyond the output rows",
    followUps: [
      "Support a second house shape ('OLD-' prefix with 5 digits) beside the first — does the WHERE become an OR of GLOBs, and what does the length shortcut from the brute-force rung look like then?",
      "Report the INVALID serials each with the first atom that failed — how would you translate the single GLOB into per-atom SUBSTR/CASE checks, and which seed item does each atom catch?",
    ],
    related: ["find-products-with-three-consecutive-digits", "invalid-tweets", "fix-product-name-format"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "dna-pattern-recognition",
    statement:
      "Genome stores one DNA sample per row (sample_id, sequence); sequences are uppercase strings over the bases A, C, G and T only. The lab's signature motif is the pattern A[CG]T — a literal A, then either C or G, then a literal T — and a sequence carries the motif once for each non-overlapping occurrence of that shape anywhere inside it. Report the samples carrying the motif AT LEAST TWICE: columns sample_id, match_count, ordered by sample_id ascending — samples with zero or one occurrence never appear.",
    examples: [
      {
        input: "sample 1 'AACTAGT'",
        output: "1 · 2",
        explanation:
          "The substring 'ACT' occupies bases two to four and 'AGT' bases five to seven — two adjacent, non-overlapping matches, one of each concrete spelling.",
      },
      {
        input: "sample 6 'AACTT'",
        output: "(no row — one match, below the gate)",
        explanation:
          "Only 'ACT' appears (bases two to four); the trailing T has no A-then-C/G pair in front of it, so the count is 1 and the HAVING gate drops the sample.",
      },
    ],
    constraints: [
      "sequence holds only uppercase A, C, G, T — no lowercase, no spaces, no ambiguity codes",
      "match_count counts non-overlapping occurrences of A[CG]T, which equals the count of the concrete literals 'ACT' plus 'AGT' — no occurrence of either literal can overlap another",
      "columns sample_id, match_count, one row per sample with match_count >= 2, ordered by sample_id ascending",
    ],
    breakdown: [
      "SQLite's pattern operators answer presence, not multiplicity: sequence GLOB '*A[CG]T*' says whether the motif exists but cannot say how many times. The counting trick is arithmetic on REPLACE: each occurrence of a literal removes three characters, so (LENGTH(sequence) - LENGTH(REPLACE(sequence, 'ACT', ''))) / 3 is the exact number of 'ACT's, and the same expression with 'AGT' counts the other spelling. The division is safe integer arithmetic because the length difference is always a multiple of three. Two subtractions and a sum replace an entire offset-scanning loop.",
      "Adding the two literal counts would be wrong for a pattern whose variants could overlap, so the non-overlap property is not a footnote — it is the license for the sum. Within one literal, occurrences cannot overlap at all: 'ACT' has no proper prefix that is also a suffix (A vs T, AC vs CT), so two copies can never share characters, and REPLACE — which consumes left to right — already counts non-overlapping occurrences. Across the two literals the same holds: the tails of either spelling (T, CT and T, GT) share no character with the heads of either (A, AC and A, AG), so no 'ACT' can straddle an 'AGT' or vice versa. Two disjoint literal families mean the sum IS the match count, with no double-counting and no missed overlaps.",
      "The report's grain is one row per sample, which makes the gate an aggregate-phase question: match_count is computed per group, and HAVING match_count >= 2 is the filter that runs after it. That is also why the GROUP BY is not decoration — HAVING is only defined for an aggregate query, and dropping the GROUP BY turns the statement into an error rather than a per-row filter. Samples with zero or one match simply fail the gate: 'ACT' and 'AACTT' each carry exactly one occurrence, and 'GGGG' carries none. ORDER BY sample_id then fixes the contract.",
    ],
    edges: [
      "Sample 1 ('AACTAGT') punishes the single-literal count: counting only 'ACT' reads 1 and drops the row — the 'AGT' arm is what lifts it to 2 and into the report.",
      "Samples 4 and 6 ('ACT', 'AACTT') punish a loose gate: >= 1 (or a plain presence GLOB) ships five rows instead of three, while > 2 ships none — the gate is exactly >= 2.",
      "Sample 2 ('ACTACT') is the adjacency proof: the two copies share a border (positions 1-3 and 4-6) but no characters, so REPLACE removes six characters and the /3 lands exactly on 2 — an overlap-naive counter would misread it.",
      "Sample 3 ('AGTACTG') punishes skipping the /3: its raw length difference is 6, so an undivided comparison passes it while printing match_count 6 instead of 2 — the division is what turns removed characters into occurrences.",
    ],
    ladder: [
      { title: "Brute force — scan every offset", body: "For each starting position test whether the next three bases spell A, then C-or-G, then T, tally hits, and skip past each match to enforce non-overlap. A nested loop the engine replaces with two subtractions." },
      { title: "The pattern — REPLACE-length counting", body: "For each concrete literal the motif allows, occurrences = (LENGTH - LENGTH(REPLACE(sequence, literal, ''))) / 3; sum the literals and keep samples whose total clears the gate." },
      { title: "The optimal idea — count literals only when they provably cannot overlap", body: "O(L) per sequence. The durable rule: the sum-of-literals trick is exact exactly when no two counted literals share a border — verify the no-overlap property before trusting the arithmetic, otherwise a real matcher (or a recursive offset walk) is required." },
    ],
    approach: "count 'ACT' and 'AGT' occurrences via (LENGTH - LENGTH(REPLACE))/3, sum per sample, HAVING >= 2",
    schema: {
      ddl: `CREATE TABLE Genome (
  sample_id INTEGER PRIMARY KEY,
  sequence  TEXT NOT NULL
);`,
      seed: `INSERT INTO Genome (sample_id, sequence) VALUES
  (1, 'AACTAGT'),  -- ACT + AGT: 2 matches, adjacent
  (2, 'ACTACT'),   -- two back-to-back ACTs
  (3, 'AGTACTG'),  -- AGT then ACT, one stray G after
  (4, 'ACT'),      -- exactly 1
  (5, 'GGGG'),     -- 0
  -- exactly 1: the tail T has no partner
  (6, 'AACTT');`,
      tables: [
        { name: "Genome", note: "6 samples — three carry the motif twice (1-3), two carry it once (4, 6), one carries none (5)" },
      ],
    },
    code: `SELECT
    sample_id,
    (LENGTH(sequence) - LENGTH(REPLACE(sequence, 'ACT', ''))) / 3   -- every 'ACT' removes 3 chars
  + (LENGTH(sequence) - LENGTH(REPLACE(sequence, 'AGT', ''))) / 3   -- every 'AGT' removes 3 chars
    AS match_count
FROM Genome
GROUP BY sample_id          -- one group per sample: HAVING needs the aggregation
HAVING match_count >= 2     -- the gate: samples 4, 5 and 6 die here
ORDER BY sample_id;`,
    walkthrough: [
      "The arithmetic reads the six samples as 2, 2, 2, 1, 0, 1: sample 1 loses three characters to 'ACT' and three to 'AGT' (7 - 4 = 3, twice), sample 2 loses six to the two 'ACT's, sample 5 loses none.",
      "GROUP BY sample_id builds one group per row and HAVING match_count >= 2 keeps only the twos — samples 4 ('ACT') and 6 ('AACTT') each hold a single occurrence and sample 5 ('GGGG') holds none.",
      "Three rows ship in sample_id order: (1, 2), (2, 2), (3, 2).",
    ],
    time: "O(L) per sequence — two REPLACE scans plus fixed-width arithmetic",
    space: "O(1) beyond the output rows",
    followUps: [
      "Count matches of a motif whose variants CAN overlap (say AA[CG], where 'AAG' inside 'AAAG' shares its first A) — why does the REPLACE arithmetic miscount there, and what replaces it?",
      "Report the positions of each match instead of the count — does a WITH RECURSIVE offset scanner replace the arithmetic, and how do you enforce non-overlap while walking?",
    ],
    related: ["count-occurrences-in-text", "find-products-with-three-consecutive-digits", "find-trending-hashtags"],
    order: "exact",
    xp: 20,
  },
];
