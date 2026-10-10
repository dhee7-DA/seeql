// Deep-dives — the SQL 50+ FINAL text band: pattern validation with GLOB
// (e-mails, serial numbers), INSTR/SUBSTR octet splitting (IPv4), four-way
// motif flags (DNA), a double recursive-CTE word transformer (capitalization)
// and a self-referencing average filter (token usage). SQLite has no REGEXP,
// so every text rule is built from GLOB / LIKE / INSTR / SUBSTR / LENGTH /
// REPLACE. Solutions are SQLite dialect, one statement each, engine-verified
// against the per-problem seeds (bun self-check; snapshotted by
// scripts/lc-sql-verify.ts once wired into content.ts).
import type { LcSqlDive } from "../types";

export const SQL_FINAL_TEXT: LcSqlDive[] = [
  {
    slug: "find-valid-emails",
    statement:
      "A sign-up pipeline stores one address per user and QA wants the well-formed ones kept. An address is valid when it holds exactly one @ symbol, ends with .com, the part before the @ uses only letters, digits and underscores, and the part between the @ and that trailing .com is a domain of letters only. Return every valid address with its user, ordered by user_id.",
    examples: [
      {
        input:
          "Users: (1,'alice@example.com') · (2,'bob_at_example.com') · (3,'charlie@example.net') · (4,'david@domain.com') · (5,'eve@invalid') — then the traps: (6,'frank#x@example.com') bad local char · (7,'grace@@example.com') double @ · (8,'@example.com') empty local · (9,'heidi@.com') empty domain · (10,'ivan@a-b.com') hyphen in domain · (11,'judy@mail.org') wrong TLD · (12,'key_x9@mail.com') underscore+digits mid-local · (13,'underscore9_first@mail.com') leading underscore · (14,'kate.smith@mail.com') dot in local · (15,'harry@mail.com ') trailing space",
        output: "user_id 1 · email alice@example.com / user_id 4 · david@domain.com / user_id 12 · key_x9@mail.com / user_id 13 · underscore9_first@mail.com",
        explanation:
          "alice and david pass all four rules. Rows 2/3/5 fail the official way (no @, wrong TLD, no .com). Each engineered row dies at exactly one gate: # and . are banned local characters (6, 14), the double @ is itself a forbidden char before the final @ (7), the empty local and empty domain are invisible to vetoes and caught by the positive gates (8, 9), the hyphen pollutes the domain (10), .org is not .com (11), and the trailing space breaks the .com ending (15). Rows 12 and 13 are legal — underscores are allowed anywhere in the local part, including first.",
      },
    ],
    constraints: [
      "exactly one @; everything before it drawn from letters, digits and underscores — dots and hyphens are NOT allowed there, and there is no leading-letter requirement",
      "the address ends with the literal .com; the domain between the @ and that suffix is non-empty and letters only",
      "output user_id, email for valid rows, ordered by user_id ascending",
    ],
    breakdown: [
      "Read 'valid' as a checklist of independent facts — one @, a .com ending, an allowed-character local part, a letters-only domain — because each official failure row fails exactly one clause. That completeness check matters: it tells you the query is a conjunction of four gates, one per rule, and it tells you when you are done. A row survives only if every clause holds; there is no ranking or partial credit.",
      "Portability first: SQLite ships without REGEXP — the function does not exist in a vanilla build, so the regex one-liners MySQL answers use die with 'no such function: regexp' here. The tool that does exist is GLOB: whole-string matching (both anchors come free), case-sensitive, with [A-Za-z]-style character classes. But GLOB's * is an any-anything wildcard, NOT a quantifier — so 'every char before the @ is allowed' cannot be said positively with one pattern; you say it negatively, as a veto.",
      "The four gates. Gate 1, email GLOB '[A-Za-z0-9_]*@*', demands a non-empty local part opening with an allowed char. Gate 2, NOT GLOB '*[^A-Za-z0-9_]*@*', fires when some forbidden character sits anywhere before an @ — and since @ itself is forbidden, a SECOND @ trips it too, so the exactly-one-@ rule is enforced without ever counting symbols. Gate 3, GLOB '*@[A-Za-z]*.com', demands the domain open with a letter and the string end with .com. Gate 4, NOT GLOB '*@*[^A-Za-z]*.com', vetoes any non-letter between the @ and the trailing .com — hyphens, digits, second dots.",
      "Why four gates and not two: vetoes cannot see ABSENCE. '@example.com' passes every veto (nothing precedes the @ to be forbidden) and 'heidi@.com' passes the local veto too — the two positive gates exist precisely to demand non-empty segments. Note also what does NOT carry over from the sibling problem (LC 1517): there the domain is the fixed @leetcode.com and the prefix must START with a letter; here the domain is any letters-only word and a leading underscore is perfectly legal, while a mid-local DOT is banned — the gate set is rebuilt from this problem's rules, not copied.",
    ],
    edges: [
      "Exactly-one-@ falls out of the local veto: a second @ is itself a forbidden character that precedes the final @, so 'grace@@example.com' dies at gate 2 (and again at gate 4) without any counting.",
      "Empty segments are invisible to NOT GLOB vetoes — '@example.com' and 'heidi@.com' slip past every veto; gates 1 and 3 are the only things standing between them and the output.",
      "No leading-letter rule here: underscore9_first@mail.com is valid. Contrast LC 1517, where '_umbra@' fails — and the opposite on dots: kate.smith@mail.com dies HERE (dot is not alphanumeric) but would be legal mid-prefix there.",
      "GLOB is case-sensitive and whole-string: leo@Mail.com keeps its capital M (letters are letters), while a trailing space silently breaks the .com ending of 'harry@mail.com ' — whole-string matching has no blind spot at the tail.",
    ],
    ladder: [
      {
        title: "Brute force — validate in application code",
        body: "SELECT every row, split each address on '@' in a host language, test the character sets with loops, re-check the suffix. Correct, but it ships the whole table over the wire and reimplements what a pattern engine already does inside the database.",
      },
      {
        title: "The pattern — vetoes for character sets, positives for anchors",
        body: "'All characters allowed' is 'no disallowed character exists' — De Morgan's law as a pattern, NOT GLOB '*[^set]*…'. Anchoring the veto with a trailing '@' is what localizes it to the LEFT of an @, turning a whole-string scan into a local-part rule; the same trick with '*@*[^letters]*.com' fences the domain.",
      },
      {
        title: "The optimal idea — four gates, one scan",
        body: "Two positive gates for the anchors vetoes cannot see (non-empty local, non-empty letters-only domain with the .com tail) plus the two vetoes for the character-set rules. One pass over the table, four pattern tests per address, O(chars) each — nothing further to optimize in pure SQL.",
      },
    ],
    approach: "Four-gate GLOB — positive anchors + NOT GLOB vetoes per side of the @",
    schema: {
      ddl: `CREATE TABLE Users (
  user_id INTEGER PRIMARY KEY,
  email   TEXT NOT NULL
);`,
      seed: `INSERT INTO Users (user_id, email) VALUES
  (1,  'alice@example.com'),           -- official: valid
  (2,  'bob_at_example.com'),          -- official: underscore instead of @ — no @ at all
  (3,  'charlie@example.net'),         -- official: domain does not end with .com
  (4,  'david@domain.com'),            -- official: valid
  (5,  'eve@invalid'),                 -- official: no .com suffix
  (6,  'frank#x@example.com'),         -- trap: '#' is not an allowed local character
  (7,  'grace@@example.com'),          -- trap: two @ symbols
  (8,  '@example.com'),                -- trap: empty local part
  (9,  'heidi@.com'),                  -- trap: empty domain
  (10, 'ivan@a-b.com'),                -- trap: hyphen inside the domain
  (11, 'judy@mail.org'),               -- trap: .org instead of .com
  (12, 'key_x9@mail.com'),             -- trap-buster: underscore + digits mid-local → VALID
  (13, 'underscore9_first@mail.com'),  -- trap-buster: a LEADING underscore is legal here → VALID
  (14, 'kate.smith@mail.com'),         -- trap: dots are banned in THIS problem's local part
  (15, 'harry@mail.com ');             -- trap: trailing space breaks the .com ending`,
      tables: [
        { name: "Users", note: "15 addresses — 4 valid; every rule (and every near-miss from the sibling problem) represented once" },
      ],
    },
    code: `SELECT
    user_id,
    email
FROM Users
WHERE email GLOB '[A-Za-z0-9_]*@*'            -- local part is non-empty and opens with an allowed char
  AND email NOT GLOB '*[^A-Za-z0-9_]*@*'      -- veto: no forbidden char — and no second @ — before an @
  AND email GLOB '*@[A-Za-z]*.com'            -- domain opens with a letter; the string ends with .com
  AND email NOT GLOB '*@*[^A-Za-z]*.com'      -- veto: letters only between the @ and the trailing .com
ORDER BY user_id;`,
    walkthrough: [
      "Gates 1–2 police the local part. alice, key_x9 and underscore9_first sail through: the first character is in [A-Za-z0-9_] and nothing before the @ falls outside the set. frank#x dies at gate 2 (#), kate.smith dies there too (a dot is not alphanumeric in this problem), and grace@@ dies because the first @ IS a forbidden character sitting before the second one — the exactly-one-@ rule never needed a counter.",
      "Gates 3–4 police the domain. david@domain.com and the two trap-busters match: an @, then a letter, then anything, then the literal .com at the very end. charlie@example.net, judy@mail.org and eve@invalid never open this gate — wrong or missing suffix. heidi@.com fails gate 3 (nothing letter-like right after the @), ivan@a-b.com trips gate 4 on the hyphen, and 'harry@mail.com ' fails gate 3's whole-string ending because of the trailing space.",
      "Watch what did NOT get flagged: '@example.com' passes gates 2–4 and only dies at gate 1; '@' and '.com' segments are invisible to vetoes. The positive gates are not duplication — they are the existence proofs.",
      "ORDER BY user_id prints rows 1, 4, 12, 13 — grading is order-exact for this problem.",
    ],
    time: "O(n·m) — n addresses of length m, four whole-string pattern scans each; no index can serve a predicate on a column's contents",
    space: "O(k) — the k surviving rows",
    followUps: [
      "Retarget the gates at LC 1517's fixed '@leetcode.com' domain: which of the four gates collapse, and what replaces the letters-only domain rule when the domain is a literal?",
      "Build a QA breakdown instead of a filter — one CASE-driven SELECT that labels each row NO_AT / BAD_LOCAL / BAD_DOMAIN / VALID. Which rows earn two labels, and does the order of the CASE change the story?",
    ],
    related: ["find-users-with-valid-e-mails", "invalid-tweets", "patients-with-a-condition"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "find-invalid-ip-addresses",
    statement:
      "A server log stores one IPv4 string per request, and messy clients send all kinds of garbage. Flag the invalid ones: every octet must be one to three digits, no octet may exceed 255, no octet may carry a leading zero (01.02.03.04 is out), and the address must be exactly four dot-separated octets. Report each distinct invalid ip together with the number of log rows carrying it, ordered by invalid_count then ip, both descending.",
    examples: [
      {
        input:
          "logs: (1,'192.168.1.1',200) · (2,'256.1.2.3',404) · (3,'192.168.001.1',200) · (4,'192.168.1.1',200) · (5,'192.168.1',500) · (6,'256.1.2.3',404) · (7,'192.168.001.1',200) — then the traps: (8,'255.255.255.255',200) valid boundary · (9,'1.2.3.4.',200) trailing dot · (10,'10.0.0..1',500) empty octet · (11,'01.02.03.04',200) the classic leading zeros · (12,'1.2.3.4.5',200) five octets",
        output:
          "ip 256.1.2.3 · invalid_count 2 / ip 192.168.001.1 · 2 / ip 192.168.1 · 1 / ip 10.0.0..1 · 1 / ip 1.2.3.4.5 · 1 / ip 1.2.3.4. · 1 / ip 01.02.03.04 · 1",
        explanation:
          "256.1.2.3 and 192.168.001.1 each appear twice in the log — the count is ROWS, not octets. 192.168.1 has only three octets; the trailing dot of 1.2.3.4. secretly makes five parts; 10.0.0..1 hides an empty octet; 01.02.03.04 leads with zeros; 1.2.3.4.5 has one octet too many. 192.168.1.1 and the 255.255.255.255 boundary are perfectly valid and never appear.",
      },
    ],
    constraints: [
      "an octet holds 1–3 digits; an address is invalid if any octet is > 255, carries a leading zero, or the string is not exactly four dot-separated octets",
      "valid rows never reach the output — distinct invalid ips only, each with its count of log rows",
      "ordering: invalid_count descending, then ip descending (plain lexicographic)",
    ],
    breakdown: [
      "The problem is two nested questions: per LOG ROW, is this string a legal IPv4? then per IP, how many illegal rows? Cut there. A CTE pipeline judges rows; the outer GROUP BY ip COUNT(*) counts them. The official output's 2/2/1 counts are row counts — 256.1.2.3 simply appears twice — so the per-row verdict must be computed before any counting happens.",
      "The Hard-tier primitive: splitting a dotted string with no loops and no REGEXP. Three INSTR hops find the dot positions — p1 = INSTR(ip,'.'), then p2 = p1 + INSTR(SUBSTR(ip, p1+1), '.'), each hop searching the REMAINDER and re-basing to an absolute position. The four octets are then plain SUBSTR slices: [1, p1), (p1, p2), (p2, p3), (p3, end]. A fourth fact rides along cheaply: dots = LENGTH(ip) − LENGTH(REPLACE(ip, '.', '')) must equal 3 — a one-line octet counter that settles the 'fewer or more than 4 octets' bullet, including the trailing-dot trap, before any slicing matters.",
      "Per-octet checks, and why the octets get unpivoted: each octet needs the same three tests — digits-only in 1–3 length (three whole-string GLOB alternatives '[0-9]', '[0-9][0-9]', '[0-9][0-9][0-9]'; '[0-9]*' would be WRONG because * matches any tail, '1x' included), no leading zero (LENGTH > 1 AND first char '0' — a plain '0' stays legal), value ≤ 255 (CAST(octet AS INTEGER), safe only because the digit gate ran first). Writing that block four times is four chances to drift, so UNION ALL flattens the four slices into one row per (log, slot) and the predicate is written exactly once.",
      "Assembly: per log row the verdict is four_parts AND no bad octet — GROUP BY log_id, ip HAVING MAX(flag) = 1 keeps the illegal rows (log_id is the primary key, so that grouping is one verdict per row); the outer GROUP BY ip folds them into counts, and ORDER BY invalid_count DESC, ip DESC reproduces the official tie order (256.1.2.3 above 192.168.001.1 because '2' sorts above '1').",
    ],
    edges: [
      "Leading zero is a STRING property, not a numeric one: CAST('001') is a perfectly reasonable 1 — only the first-char-plus-length test catches it, and a bare '0' must stay legal.",
      "'[0-9]*' is NOT a digits test — * is a wildcard, so '1x' matches it; the three exact-length GLOB alternatives are the real gate, and they also kill the empty octet hiding in 10.0.0..1.",
      "Fewer/more octets is a dot count: 192.168.1 has two dots, 1.2.3.4.5 has four, and 1.2.3.4. hides a fourth dot that makes five parts — LENGTH − LENGTH(REPLACE) says all three in one expression.",
      "255.255.255.255 is the valid boundary and must stay OUT of the output; so must every repeat of 192.168.1.1 — the report is a hall of shame, not a census.",
    ],
    ladder: [
      {
        title: "Brute force — split and validate in the app",
        body: "Pull every log row, ip.split('.') in a host language, test length, digits, leading zeros and range per part. Trivial off-platform — but it drags every row out of the database, and no other SQL client can reuse the rule.",
      },
      {
        title: "The pattern — INSTR hops and SUBSTR slices",
        body: "Dot positions via chained INSTR over SUBSTR remainders, octets via SUBSTR slices, dot count via LENGTH − LENGTH(REPLACE). The pre-REGEXP classic: every 'validate a delimited code' problem — phones, SKUs, versions — is this shape.",
      },
      {
        title: "The optimal idea — unpivot once, test once, count twice",
        body: "UNION ALL the four slices into one row per slot so the per-octet predicate exists exactly once, then two GROUP BY levels: per-row verdict, per-ip count. O(rows × length) overall, two linear passes after the split.",
      },
    ],
    approach: "INSTR/SUBSTR octet splitter + UNION ALL unpivot + two-level GROUP BY",
    schema: {
      ddl: `CREATE TABLE logs (
  log_id      INTEGER PRIMARY KEY,
  ip          TEXT NOT NULL,
  status_code INTEGER NOT NULL
);`,
      seed: `INSERT INTO logs (log_id, ip, status_code) VALUES
  (1,  '192.168.1.1',   200),  -- official: valid
  (2,  '256.1.2.3',     404),  -- official: 256 > 255
  (3,  '192.168.001.1', 200),  -- official: leading zeros
  (4,  '192.168.1.1',   200),  -- official: valid repeat
  (5,  '192.168.1',     500),  -- official: only 3 octets
  (6,  '256.1.2.3',     404),  -- official: repeat — count becomes 2
  (7,  '192.168.001.1', 200),  -- official: repeat — count becomes 2
  (8,  '255.255.255.255', 200),-- trap: the exact boundary — VALID, must stay out
  (9,  '1.2.3.4.',      200),  -- trap: trailing dot = a hidden fifth part
  (10, '10.0.0..1',     500),  -- trap: double dot → empty octet
  (11, '01.02.03.04',   200),  -- trap: the leading-zero example from the spec
  (12, '1.2.3.4.5',     200);  -- trap: five octets`,
      tables: [
        { name: "logs", note: "12 access rows — 7 invalid distinct ips (two of them twice), 2 valid addresses; every failure bullet represented" },
      ],
    },
    code: `WITH marks AS (                                    -- hop 1: the first dot
    SELECT log_id, ip, INSTR(ip, '.') AS p1
    FROM logs
),
marks2 AS (                                        -- hop 2: next dot, searched in the remainder...
    SELECT log_id, ip, p1,
           p1 + INSTR(SUBSTR(ip, p1 + 1), '.') AS p2  -- ...then re-based to an absolute position
    FROM marks
),
marks3 AS (                                        -- hop 3: third dot
    SELECT log_id, ip, p1, p2,
           p2 + INSTR(SUBSTR(ip, p2 + 1), '.') AS p3
    FROM marks2
),
octets AS (
    SELECT
        log_id, ip,
        SUBSTR(ip, 1, p1 - 1)           AS o1,     -- the four candidate slices
        SUBSTR(ip, p1 + 1, p2 - p1 - 1) AS o2,
        SUBSTR(ip, p2 + 1, p3 - p2 - 1) AS o3,
        SUBSTR(ip, p3 + 1)              AS o4,
        LENGTH(ip) - LENGTH(REPLACE(ip, '.', '')) = 3 AS four_parts  -- exactly three dots
    FROM marks3
),
flat AS (                                          -- unpivot: one row per octet slot
    SELECT log_id, ip, four_parts, o1 AS octet FROM octets
    UNION ALL SELECT log_id, ip, four_parts, o2 FROM octets
    UNION ALL SELECT log_id, ip, four_parts, o3 FROM octets
    UNION ALL SELECT log_id, ip, four_parts, o4 FROM octets
),
judged AS (
    SELECT
        log_id, ip, four_parts,
        NOT (octet GLOB '[0-9]'                       -- digits only, one to three of them
             OR octet GLOB '[0-9][0-9]'
             OR octet GLOB '[0-9][0-9][0-9]')
        OR (LENGTH(octet) > 1 AND SUBSTR(octet, 1, 1) = '0')  -- leading zero ('0' alone is fine)
        OR CAST(octet AS INTEGER) > 255                       -- the 255 ceiling
        AS bad_octet
    FROM flat
),
invalid_rows AS (
    SELECT log_id, ip
    FROM judged
    GROUP BY log_id, ip                               -- one verdict per LOG ROW
    HAVING MAX(CASE WHEN NOT four_parts OR bad_octet THEN 1 ELSE 0 END) = 1
)
SELECT ip, COUNT(*) AS invalid_count                -- then one row per distinct bad ip
FROM invalid_rows
GROUP BY ip
ORDER BY invalid_count DESC, ip DESC;`,
    walkthrough: [
      "marks → octets on a healthy row: 192.168.1.1 gives p1=4, p2=8, p3=10 and slices '192','168','1','1' with four_parts true. On 192.168.1 the third hop finds no dot (INSTR 0, so p3 just repeats p2) and the dot count reads 2 — the verdict is settled by four_parts alone, before the slices matter.",
      "flat hands every log row to judged four times, and the single octet predicate fires per slice: 256.1.2.3's '256' is digits-only, zero-free, then CASTs to 256 → bad. 192.168.001.1's '001' passes the digit gate and even the range gate numerically — the first-char test is what catches it. 10.0.0..1's empty third slice matches none of the three GLOB alternatives → bad. All four slices of 255.255.255.255 pass all three tests → clean.",
      "invalid_rows folds each log's four judged slots into one verdict: MAX of the flag keeps rows 2, 3, 5, 6, 7, 9, 10, 11, 12 — and silently drops 1, 4 (valid) and 8 (the 255 boundary).",
      "The final GROUP BY ip counts rows per bad address — 256.1.2.3 twice, 192.168.001.1 twice, the rest once — and the double-DESC sort prints 256.1.2.3 first ('2' > '1'), then the count-1 ips lexicographically descending: 192.168.1, 10.0.0..1, 1.2.3.4.5, 1.2.3.4., 01.02.03.04.",
    ],
    time: "O(n·m) — n rows of length m: three INSTR scans, four slices and four pattern tests each, then two linear grouped passes",
    space: "O(n) — the unpivoted 4n-row flat CTE dominates",
    followUps: [
      "Replace the three INSTR hops with a recursive CTE that peels one octet per iteration — compare clarity and termination handling (what does the recursion do on '1.2.3' and on '1.2.3.4.5'?)",
      "Generalize to a colon-separated IPv6-style check: which pieces survive unchanged, and what replaces the =3 dot count when the separator count no longer pins the shape?",
    ],
    related: ["find-valid-emails", "find-products-with-valid-serial-numbers", "dna-pattern-recognition"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "find-products-with-valid-serial-numbers",
    statement:
      "A catalog stores free-form marketing text per product, and stock codes are buried inside it. Keep the products whose description contains a serial number built as the uppercase letters SN, then exactly four digits, a hyphen, then exactly four more digits — the serial may sit anywhere in the text, not necessarily at the start. Return id, name and description, ordered by product_id.",
    examples: [
      {
        input:
          "products: (1,'Widget A','This is a sample product with SN1234-5678') · (2,'Widget B','A product with serial SN9876-1234 in the description') · (3,'Widget C','Product SN1234-56789 is available now') · (4,'Widget D','No serial number here') · (5,'Widget E','Check out SN4321-8765 in this description') — then the traps: (6,'Legacy model SN2468-135790 discontinued') six digits after the hyphen · (7,'Budget line sn1111-2222 available') lowercase prefix · (8,'Premium SN12345-6789 edition') five digits before the hyphen · (9,'Collector item SN0007-0042 mint') leading zeros in both blocks",
        output:
          "product_id 1 · Widget A / product_id 2 · Widget B / product_id 5 · Widget E / product_id 9 · Widget I · 'Collector item SN0007-0042 mint'",
        explanation:
          "Products 1, 2 and 5 carry textbook SNdddd-dddd codes anywhere in the sentence. Product 3's SN1234-56789 has a FIFTH digit glued after the block — invalid, exactly as the official example says. SN2468-135790 repeats that failure; sn1111-2222 is lowercase (case-sensitive rule); SN12345-6789 has one digit too many before the hyphen. SN0007-0042 is fine — zeros are plain digits.",
      },
    ],
    constraints: [
      "the pattern is case-sensitive: lowercase sn never matches",
      "exactly four digits on each side of the hyphen — a fifth digit glued to the trailing block disqualifies",
      "the serial may appear anywhere inside the description; output product_id, product_name, description ordered by product_id ascending",
    ],
    breakdown: [
      "GLOB matches whole strings, so 'contains, anywhere' must be said with explicit wildcards: '*SN[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]*'. The leading * IS the 'may not start at the beginning' rule made literal, and each [0-9] is one digit — four of them because * cannot count.",
      "The positive gate is one digit short of correct. For 'SN1234-56789' the engine happily matches SN + 1234 + '-' + 5678 and lets the trailing * swallow the fifth '9' — the exact false positive the official example calls out. A wildcard cannot say 'and then nothing', so no single GLOB can express 'exactly four' at a block boundary.",
      "De Morgan closes the gap: 'exactly four digits after the hyphen' is 'not five digits after the hyphen'. A second pattern — '*SN[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9][0-9]*' — fires precisely when some SN block runs a fifth digit, and NOT GLOB vetoes it. The direction BEFORE the hyphen needs no veto: 'SN12345-6789' already fails the positive gate, because after SN the engine must see four digits and then a literal '-', and the fifth digit breaks that handoff. The two sides are asymmetric by construction.",
      "Case sensitivity is free — GLOB folds nothing, so 'sn1111-2222' fails the SN literal outright (LIKE would wave it through, folding case by default). And digit values are irrelevant: SN0007-0042's zeros are four plain digits each; the rules constrain counts and positions, not magnitudes.",
    ],
    edges: [
      "Product 3 is the trap the official data plants on purpose: the positive gate MATCHES, and only the fifth-digit veto removes it — without the veto the answer is wrong by exactly one row.",
      "Asymmetry of the boundary: five digits BEFORE the hyphen die at the positive gate alone ('SN12345-6789'); five digits AFTER need the veto ('SN1234-56789').",
      "Lowercase sn fails silently — GLOB is case-sensitive where LIKE folds; 'sn1111-2222' must not ride in on a case-insensitive habit.",
      "Leading zeros inside a serial are legal — SN0007-0042 passes both gates; nothing in the rule constrains digit values.",
    ],
    ladder: [
      {
        title: "Brute force — regex in application code",
        body: "Fetch all rows and run SN\\d{4}-\\d{4}(?!\\d) in a host language. Works — and the negative lookahead is exactly the veto this query rebuilds — but the rule then lives outside the database, unenforceable for other clients.",
      },
      {
        title: "The pattern — containment GLOB with explicit classes",
        body: "'*SN[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]*' reads like the regex minus quantifiers: * for 'anything around it', one class per digit. Whole-string matching supplies the containment semantics for free.",
      },
      {
        title: "The optimal idea — add the boundary veto",
        body: "A fixed-length pattern's only blind spot is what glues onto its end, so one NOT GLOB with a fifth [0-9] closes it. One scan, two pattern tests per description — nothing further to optimize in pure SQL.",
      },
    ],
    approach: "Containment GLOB + fifth-digit NOT GLOB veto",
    schema: {
      ddl: `CREATE TABLE products (
  product_id   INTEGER PRIMARY KEY,
  product_name TEXT NOT NULL,
  description  TEXT NOT NULL
);`,
      seed: `INSERT INTO products (product_id, product_name, description) VALUES
  (1, 'Widget A', 'This is a sample product with SN1234-5678'),            -- official: valid
  (2, 'Widget B', 'A product with serial SN9876-1234 in the description'), -- official: valid
  (3, 'Widget C', 'Product SN1234-56789 is available now'),                -- official: 5 digits after the hyphen
  (4, 'Widget D', 'No serial number here'),                                -- official: no serial at all
  (5, 'Widget E', 'Check out SN4321-8765 in this description'),            -- official: valid
  (6, 'Widget F', 'Legacy model SN2468-135790 discontinued'),              -- trap: six digits after the hyphen
  (7, 'Widget G', 'Budget line sn1111-2222 available'),                    -- trap: lowercase prefix — case-sensitive rule
  (8, 'Widget H', 'Premium SN12345-6789 edition'),                         -- trap: five digits BEFORE the hyphen
  (9, 'Widget I', 'Collector item SN0007-0042 mint');                      -- trap-buster: leading zeros are just digits → VALID`,
      tables: [
        { name: "products", note: "9 products — 4 with a valid serial; the official 5-digit trap plus its mirrored and case-flipped cousins" },
      ],
    },
    code: `SELECT
    product_id,
    product_name,
    description
FROM products
WHERE description GLOB '*SN[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9]*'           -- SN + 4 digits + '-' + 4 digits, anywhere
  AND description NOT GLOB '*SN[0-9][0-9][0-9][0-9]-[0-9][0-9][0-9][0-9][0-9]*'  -- veto: a fifth digit glued after the block
ORDER BY product_id;`,
    walkthrough: [
      "Products 1, 2 and 5 pass the positive gate immediately: the leading * eats 'This is a sample product with ', the literal SN lands, the four-digit blocks line up around the hyphen, and the trailing * absorbs the rest of the sentence.",
      "Product 3 ALSO passes the positive gate — SN, 1234, '-', 5678, with the tail wildcard swallowing '9 is available now'. The veto rescans, finds SN + four digits + '-' + FIVE digits, and removes it; SN2468-135790 (six digits) dies the same way.",
      "Products 4, 7 and 8 never pass the positive gate at all: no serial anywhere, a lowercase sn the case-sensitive literal refuses, and SN12345-6789 whose fifth digit before the hyphen breaks the digits-then-hyphen handoff.",
      "Product 9 clears both gates — 0007 and 0042 are four plain digits each. The output is 1, 2, 5, 9 in product_id order, exactly the official three plus the zero-padding trap-buster.",
    ],
    time: "O(n·m) — two whole-string pattern scans per description of length m",
    space: "O(k) — the k surviving rows",
    followUps: [
      "Port the veto to MySQL's REGEXP 'SN[0-9]{4}-[0-9]{4}(?!([0-9]))' and compare boundary behavior: which engine treats 'SN1234-5678X' (letter after the block) the same way?",
      "Extract the matched serial, not just the row: locate the 'SN' with INSTR and SUBSTR a fixed 10 characters — what breaks when a description legally holds two serials?",
    ],
    related: ["find-valid-emails", "invalid-tweets", "dna-pattern-recognition"],
    order: "exact",
    xp: 10,
  },
  {
    slug: "dna-pattern-recognition",
    statement:
      "A lab screens stored DNA strings for four independent motifs and wants a per-sample scorecard. Mark 1 or 0 for each sample: it starts with the start codon ATG; it ends with one of the stop codons TAA, TAG or TGA; it contains the repeated motif ATAT somewhere; and it contains at least three consecutive G's. Emit one row per sample with all four flags, ordered by sample_id.",
    examples: [
      {
        input:
          "Samples: (1,'ATGCTAGCTAGCTAA','Human') · (2,'GGGTCAATCATC','Human') · (3,'ATATATCGTAGCTA','Human') · (4,'ATGGGGTCATCATAA','Mouse') · (5,'TCAGTCAGTCAG','Mouse') · (6,'ATATCGCGCTAG','Zebrafish') · (7,'CGTATGCGTCGTA','Zebrafish') — then the traps: (8,'TAAATGCGT','Mouse') TAA at the start, ATG mid-string · (9,'atgccctaa','Mouse') lowercase · (10,'GG','Zebrafish') only two G's · (11,'ATATAT','Human') self-overlapping motif",
        output:
          "1: ATGCTAGCTAGCTAA · Human · 1,1,0,0 / 2: GGGTCAATCATC · Human · 0,0,0,1 / 3: ATATATCGTAGCTA · Human · 0,0,1,0 / 4: ATGGGGTCATCATAA · Mouse · 1,1,0,1 / 5: TCAGTCAGTCAG · Mouse · 0,0,0,0 / 6: ATATCGCGCTAG · Zebrafish · 0,1,1,0 / 7: CGTATGCGTCGTA · Zebrafish · 0,0,0,0 / 8: TAAATGCGT · Mouse · 0,0,0,0 / 9: atgccctaa · Mouse · 0,0,0,0 / 10: GG · Zebrafish · 0,0,0,0 / 11: ATATAT · Human · 0,0,1,0",
        explanation:
          "Flags are has_start, has_stop, has_atat, has_ggg. Row 7 holds ATG and row 8 holds TAA — but mid-string/leading motifs don't count: start and stop are END-ANCHORED. Row 9 is lowercase and matches nothing; row 10 lacks a third G; row 11's ATATAT contains ATAT (twice, overlapping) so the flag is 1 while everything else stays 0.",
      },
    ],
    constraints: [
      "sequences are strings over A, T, G, C; all pattern tests are case-sensitive",
      "start/stop are anchored to the string ends; ATAT and the G-run are containment tests anywhere",
      "flags are 1/0 integers; every sample appears exactly once, ordered by sample_id ascending",
    ],
    breakdown: [
      "Four independent boolean projections over one row — no grouping, no joining, nothing to aggregate. The entire problem is choosing the right text primitive per motif, and the motifs differ in one crucial dimension: ANCHORING. Two live at the string ends, two live anywhere.",
      "End-anchored. GLOB 'ATG*' is whole-string, so 'starts with' is free — the * only ever covers the tail. That anchor is the whole point: official row 7 CGTATGCGTCGTA contains ATG at position 4, and an INSTR-based test would wrongly score 1. For the stop codons, SUBSTR(seq, -3) grabs the last three bases (a negative start index counts from the end) and IN ('TAA','TAG','TGA') folds three suffix tests into one expression — the alternative is three OR'd '*TAA'-style GLOBs.",
      "Containment. INSTR(seq, 'ATAT') > 0 asks existence, not location: INSTR returns the FIRST occurrence, which is all a flag needs. The G-run is a genuinely cute literal trick — 'at least three consecutive G's' IS the substring 'GGG', because GGGG contains GGG. GLOB has no repetition quantifier; it does not need one, since '*GGG*' plus whole-string wildcards says 'three G's in a row somewhere'.",
      "Overlap is a non-issue only because the output is boolean. ATATAT contains ATAT at positions 1 and 3 — overlapping — and INSTR finds the first; a > 0 test is indifferent. The trap hides in the VARIANT: 'count the occurrences' needs overlap-aware scanning that naive INSTR loops get wrong. Flag semantics buy simplicity; count semantics would not.",
    ],
    edges: [
      "Anchoring is the trap the official data plants twice: ATG mid-string (row 7) and TAA leading (row 8) must score 0 — 'contains' and 'starts/ends with' are different predicates.",
      "Case sensitivity: 'atgccctaa' (row 9) scores all zeros — GLOB, INSTR and SUBSTR comparisons are binary; DNA arrives uppercase, and the tests should not silently fold case.",
      "Two G's are not a run: 'GG' fails '*GGG*', while GGGG passes because it CONTAINS GGG — 'at least three' is a containment claim, not an exact-length one.",
      "ATATAT overlaps itself, but the flag stays a single 1 — existence semantics make overlap invisible; only a counting variant would have to care.",
    ],
    ladder: [
      {
        title: "Brute force — four string scans per row in the app",
        body: "Pull every sequence, run startsWith/endsWith/includes plus a hand-rolled run-detector in a host language. Correct, but four passes of hand-written string code where three SQLite primitives project the whole scorecard in one statement.",
      },
      {
        title: "The pattern — one primitive per anchoring kind",
        body: "Anchored prefix: GLOB 'ATG*'. Anchored suffix family: SUBSTR(seq, -3) IN (…). Containment: INSTR(seq, 'ATAT') > 0 and GLOB '*GGG*'. Three primitives cover four flags because start and stop share an anchoring kind.",
      },
      {
        title: "The optimal idea — project the booleans in the SELECT",
        body: "The operators already return 1/0, so the flags are bare expressions with aliases — one pass over the table, O(total length), zero grouping. The only design left is ordering the CASE-free SELECT to match the output header exactly.",
      },
    ],
    approach: "Anchored GLOB + SUBSTR(-3) IN + INSTR containment flags",
    schema: {
      ddl: `CREATE TABLE Samples (
  sample_id    INTEGER PRIMARY KEY,
  dna_sequence TEXT NOT NULL,
  species      TEXT NOT NULL
);`,
      seed: `INSERT INTO Samples (sample_id, dna_sequence, species) VALUES
  (1,  'ATGCTAGCTAGCTAA', 'Human'),     -- official: start + stop
  (2,  'GGGTCAATCATC',    'Human'),     -- official: GGG run only
  (3,  'ATATATCGTAGCTA',  'Human'),     -- official: ATAT only
  (4,  'ATGGGGTCATCATAA', 'Mouse'),     -- official: start + stop + GGGG
  (5,  'TCAGTCAGTCAG',    'Mouse'),     -- official: nothing fires
  (6,  'ATATCGCGCTAG',    'Zebrafish'), -- official: stop (TAG) + ATAT
  (7,  'CGTATGCGTCGTA',   'Zebrafish'), -- official: ATG mid-string — must NOT flag start
  (8,  'TAAATGCGT',       'Mouse'),     -- trap: TAA leading, ATG mid-string — both anchors refuse
  (9,  'atgccctaa',       'Mouse'),     -- trap: lowercase — case-sensitive tests score all 0
  (10, 'GG',              'Zebrafish'), -- trap: two G's is not a run
  (11, 'ATATAT',          'Human');     -- trap: ATAT overlapping itself — still just a 1`,
      tables: [
        { name: "Samples", note: "11 sequences — the official 7 plus four traps covering anchoring, case, run length and motif overlap" },
      ],
    },
    code: `SELECT
    sample_id,
    dna_sequence,
    species,
    dna_sequence GLOB 'ATG*'                          AS has_start,  -- anchored: ATG must OPEN the string
    SUBSTR(dna_sequence, -3) IN ('TAA', 'TAG', 'TGA') AS has_stop,   -- the LAST three bases only
    INSTR(dna_sequence, 'ATAT') > 0                   AS has_atat,   -- first occurrence is existence enough
    dna_sequence GLOB '*GGG*'                         AS has_ggg     -- GGG anywhere — GGGG contains it
FROM Samples
ORDER BY sample_id;`,
    walkthrough: [
      "Official row 1 ATGCTAGCTAGCTAA opens with ATG → 1 and its last three bases are TAA → 1; no window spells ATAT and the G's never triple, so 0/0. Row 4 ATGGGGTCATCATAA shows the run family: GGGG contains GGG, so one containment test scores it 1 without any counting.",
      "Rows 2, 3 and 6 each fire exactly their non-anchored or suffix flags: GGGTCAATCATC starts with GGG but the start gate wants ATG (0,0,0,1); ATATATCGTAGCTA carries ATAT at position 1 yet anchors nothing (0,0,1,0); ATATCGCGCTAG ends TAG and holds ATAT (0,1,1,0). Row 5 TCAGTCAGTCAG scores all zeros.",
      "Row 7 CGTATGCGTCGTA is the anchoring trap: ATG sits at position 4, the G's never triple, nothing ends in a stop codon — all four flags 0. An INSTR-based has_start would have printed 1 here; the GLOB anchor is load-bearing.",
      "The engineered traps close the matrix: row 8 TAAATGCGT holds BOTH a start-shaped and stop-shaped substring, yet TAA leads and ATG is mid-string — both anchored tests refuse, 0,0,0,0. Row 9's lowercase string matches nothing (binary comparisons). Row 10's GG lacks a third G. Row 11's ATATAT flags has_atat = 1 — the overlapping second occurrence at position 3 never matters, because one hit is existence enough. Eleven rows, sample_id order.",
    ],
    time: "O(total sequence length) — one scan per test, four tests per row, no grouping",
    space: "O(1) beyond the output rows",
    followUps: [
      "Count occurrences of ATAT instead of flagging: INSTR stops at the first hit and ATAT overlaps itself — sketch the recursive-CTE (or REPLACE-arithmetic) scan that counts overlapping hits correctly.",
      "Add a plausibility gate — starts with ATG AND ends with a stop codon AND length divisible by 3: which flags compose directly, and what new primitive does the length rule need?",
    ],
    related: ["find-products-with-valid-serial-numbers", "find-valid-emails", "patients-with-a-condition"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "first-letter-capitalization-ii",
    statement:
      "A moderation queue stores raw user text and wants display-ready casing without touching anything but letters. Split the text on spaces into words. A word that does not begin with an English letter stays exactly as it is. A word made of two or more non-empty pure-letter parts joined by single hyphens gets every part title-cased. Any other word gets its first letter uppercased and its remaining English letters lowercased, special characters untouched. Spaces and punctuation must survive byte-for-byte. Return the original and the converted text side by side.",
    examples: [
      {
        input:
          "user_content: (1,'hello world of SQL') · (2,'the QUICK-brown fox') · (3,'modern-day DATA science') · (4,'web-based FRONT-end development') — then the traps: (5,'@handle and -sub-zero items') non-letter starts · (6,'FR-ONT-end stays x-') three parts + trailing hyphen · (7,'a@b and ab--cd') hyphen-busters · (8,'a SQL  rocks  ^caret') single char, all-caps, double spaces, caret",
        output:
          "1: 'Hello World Of Sql' / 2: 'The Quick-Brown Fox' / 3: 'Modern-Day Data Science' / 4: 'Web-Based Front-End Development' / 5: '@handle And -sub-zero Items' / 6: 'Fr-Ont-End Stays X-' / 7: 'A@b And Ab--cd' / 8: 'A Sql  Rocks  ^caret'",
        explanation:
          "Official rows: every word title-cases, hyphen parts included (QUICK-brown → Quick-Brown, FRONT-end → Front-End). Row 5: '@handle' and '-sub-zero' START with non-letters, so the ENTIRE word is untouched — the hyphen machinery never runs on -sub-zero. Row 6: FR-ONT-end is three legal parts → Fr-Ont-End, but 'x-' ends in a hyphen so it takes the plain rule → 'X-'. Row 7: 'a@b' and 'ab--cd' contain an impurity/empty part, so only the first letter capitalizes. Row 8: the double spaces survive byte-for-byte, 'a' → 'A', 'SQL' → 'Sql', '^caret' starts with '^' and stays.",
      },
    ],
    constraints: [
      "content_text holds only English letters, spaces and the characters \\ @ - / ^ , — nothing else",
      "the hyphen rule applies ONLY when the word is 2+ non-empty pure-letter parts joined by single hyphens; a word starting with a non-letter is left entirely unchanged",
      "all spacing and non-letter characters are preserved exactly; output content_id, original_text, converted_text",
    ],
    breakdown: [
      "The deception: this looks like the SUBSTR/UPPER one-liner of Fix Names in a Table. It is not — the rules depend on WORD structure (does the word contain hyphens? are ALL its parts pure letters?), and a variable number of words per row means a variable number of transformations. Pure SQL has no split() and no loops, so the honest machine is a recursive CTE: peel one token per iteration until the remainder is empty.",
      "Splitting that preserves spacing. Append a sentinel space and peel head-before-next-space / tail-after-it per step. The trick that keeps formatting byte-exact: do NOT collapse delimiters. 'a  b' peels as 'a', '', 'b' — the empty token between the two spaces — and re-folding with GROUP_CONCAT(x, ' ') rebuilds the double space, because joining ['a','','b'] on ' ' reproduces 'a  b'. GROUP_CONCAT skips NULLs but folds empty strings happily, so the empties are load-bearing, not noise.",
      "The three rules are a CASE in strict order. Empty token → stays empty (it is spacing glue). A word that earned an accumulator from the hyphen CTE → that accumulator. A word whose first character fails GLOB '[A-Za-z]' → returned UNCHANGED, whole — note this outranks the hyphen rule, which is exactly why '-sub-zero' keeps its casing. Everything else → UPPER(first) || LOWER(rest), and SQLite's ASCII-only UPPER/LOWER is precisely the spec's 'English letters' semantics: @, /, ^, \\ and commas pass through untouched while letters fold.",
      "The hyphenated branch is a SECOND recursive CTE over '-'. Eligibility is a five-part gate: contains a hyphen; nothing inside but letters and hyphens (NOT GLOB '*[^A-Za-z-]*'); no leading hyphen; no trailing hyphen; no '--' — each clause kills one way a part could be empty or impure. Eligible words then peel parts exactly like the space-splitter and title-case each into an accumulator: UPPER(head's first char) || LOWER(head's rest), '-'-joined. Words failing eligibility fall through to the plain rule — 'ab--cd' becomes 'Ab--cd', never 'Ab-Cd'.",
    ],
    edges: [
      "Rule order is semantics: '-sub-zero' starts with a NON-letter, so rule 1 leaves the ENTIRE word unchanged — its inner letter-hyphen shape is never title-cased despite being eligible-looking.",
      "Near-miss hyphen words take the plain rule: 'x-' (trailing hyphen) → 'X-', 'ab--cd' (empty middle part) → 'Ab--cd', 'a@b' (@ busts the letters-only gate) → 'A@b'.",
      "Spacing is data: 'SQL  rocks  ^caret' carries double spaces, and only the fold over peeled tokens WITH empties rebuilds them — a splitter that drops empty tokens silently normalizes the text and fails byte-for-byte grading.",
      "All-caps words fold unconditionally: 'SQL' → 'Sql', 'DATA' → 'Data' — LOWER(rest) spares nothing; only non-letter-initial words escape entirely.",
    ],
    ladder: [
      {
        title: "Brute force — transform in a host language",
        body: "Pull the text, split(' '), apply the three rules with a regex per word, rejoin with the ORIGINAL delimiters. Trivial off-platform; the exercise is doing it set-based, in one statement, with spacing preserved.",
      },
      {
        title: "The pattern — recursive token-peeling with a sentinel",
        body: "The standard 'no loops' splitter: anchor on text || ' ', recurse while the remainder is non-empty, take head and tail per step. The same machine runs twice — spaces first, hyphens inside eligible words — and GROUP_CONCAT over a seq-ordered subquery reassembles.",
      },
      {
        title: "The optimal idea — two chains, one CASE, one ordered fold",
        body: "One WITH RECURSIVE block runs the space-peeler and the hyphen-peeler; a LEFT JOIN attaches hyphen accumulators to their tokens; the CASE applies the rules in order; the final ordered GROUP_CONCAT rebuilds each sentence. O(total characters) — every token is touched a constant number of times.",
      },
    ],
    approach: "Double recursive CTE (space peel → hyphen peel) + ordered GROUP_CONCAT reassembly",
    schema: {
      ddl: `CREATE TABLE user_content (
  content_id   INTEGER PRIMARY KEY,
  content_text TEXT NOT NULL
);`,
      seed: `INSERT INTO user_content (content_id, content_text) VALUES
  (1, 'hello world of SQL'),               -- official: plain words fold
  (2, 'the QUICK-brown fox'),              -- official: hyphenated word, 2 parts
  (3, 'modern-day DATA science'),          -- official: hyphenated + all-caps
  (4, 'web-based FRONT-end development'),  -- official: two hyphenated words
  (5, '@handle and -sub-zero items'),      -- trap: non-letter starts → ENTIRE words untouched
  (6, 'FR-ONT-end stays x-'),              -- trap: three parts OK; trailing hyphen → plain rule
  (7, 'a@b and ab--cd'),                   -- trap: '@' impurity and '--' empty part → plain rule
  (8, 'a SQL  rocks  ^caret');             -- trap: single char, all-caps, DOUBLE spaces, caret`,
      tables: [
        { name: "user_content", note: "8 texts — the official 4 plus non-letter starts, hyphen near-misses and byte-exact spacing traps" },
      ],
    },
    code: `WITH RECURSIVE
split AS (                                         -- peel one space-delimited token per step
    SELECT                                         -- anchor: a sentinel space guarantees a final hit
        content_id,
        content_text AS original,
        0 AS seq,
        '' AS word,
        content_text || ' ' AS rest
    FROM user_content
    UNION ALL
    SELECT
        content_id,
        original,
        seq + 1,
        SUBSTR(rest, 1, INSTR(rest, ' ') - 1),     -- token up to the next space ('' for doubled spaces)
        SUBSTR(rest, INSTR(rest, ' ') + 1)
    FROM split
    WHERE rest <> ''
),
hyph AS (                                          -- eligible rule-2 words only: peel '-' parts, rebuild cased
    SELECT
        content_id, seq,
        0 AS pseq,
        '' AS acc,
        word || '-' AS prest                       -- same sentinel trick, hyphen flavor
    FROM split
    WHERE seq > 0
      AND INSTR(word, '-') > 0                     -- at least one hyphen
      AND word NOT GLOB '*[^A-Za-z-]*'             -- nothing inside but letters and hyphens
      AND SUBSTR(word, 1, 1) <> '-'                -- no empty first part
      AND SUBSTR(word, -1) <> '-'                  -- no empty last part
      AND INSTR(word, '--') = 0                    -- no empty middle part
    UNION ALL
    SELECT
        content_id, seq, pseq + 1,
        acc || CASE WHEN pseq = 0 THEN '' ELSE '-' END
            || UPPER(SUBSTR(SUBSTR(prest, 1, INSTR(prest, '-') - 1), 1, 1))  -- part's first letter up
            || LOWER(SUBSTR(SUBSTR(prest, 1, INSTR(prest, '-') - 1), 2)),    -- part's rest down
        SUBSTR(prest, INSTR(prest, '-') + 1)
    FROM hyph
    WHERE prest <> ''
),
words AS (                                         -- the three rules, in order, per token
    SELECT
        s.content_id,
        s.original,
        s.seq,
        CASE
            WHEN s.word = '' THEN ''                                   -- spacing glue: keep the gap
            WHEN h.acc IS NOT NULL THEN h.acc                          -- rule 2: hyphen parts rebuilt
            WHEN SUBSTR(s.word, 1, 1) NOT GLOB '[A-Za-z]' THEN s.word  -- rule 1: non-letter start → untouched
            ELSE UPPER(SUBSTR(s.word, 1, 1)) || LOWER(SUBSTR(s.word, 2))  -- rule 3
        END AS word_fixed
    FROM split s
    LEFT JOIN (SELECT content_id, seq, acc FROM hyph WHERE prest = '') h
        ON h.content_id = s.content_id AND h.seq = s.seq
    WHERE s.seq > 0
)
SELECT
    c.content_id,
    c.original AS original_text,
    (SELECT GROUP_CONCAT(word_fixed, ' ')          -- re-fold tokens; empties rebuild exact spacing
     FROM (SELECT word_fixed
           FROM words w
           WHERE w.content_id = c.content_id
           ORDER BY w.seq)) AS converted_text
FROM split c
WHERE c.seq = 0                                    -- one row per content row
ORDER BY c.content_id;`,
    walkthrough: [
      "split on row 1 'hello world of SQL' yields tokens hello/world/of/SQL at seq 1–4 (the trailing sentinel fires the last peel). None enter the hyphen CTE, so rule 3 runs: UPPER(first) || LOWER(rest) → Hello/World/Of/Sql — SQL folds to Sql because LOWER(rest) is unconditional on letters.",
      "Row 2's 'QUICK-brown' passes all five eligibility gates, and hyph peels QUICK → 'Quick', brown → 'Brown', accumulating 'Quick-Brown'; the LEFT JOIN on (content_id, seq) hands it to the CASE before rule 1 is even consulted. 'the' and 'fox' plain-fold to The/Fox. Row 4 runs the same machine twice — web-based → Web-Based, FRONT-end → Front-End.",
      "The traps exercise the CASE order. Row 5: '@handle' and '-sub-zero' start with non-letters and (correctly) never entered hyph — rule 1 returns them untouched, while 'and'/'items' fold. Row 6: FR-ONT-end is three legal parts → Fr-Ont-End, but 'x-' fails the trailing-hyphen clause and plain-folds to 'X-'. Row 7: 'a@b' contains an impurity and 'ab--cd' an empty middle part — both take rule 3 → 'A@b', 'Ab--cd'.",
      "Row 8 proves spacing is data: 'a SQL  rocks  ^caret' peels as a, SQL, '', rocks, '', ^caret — the empty tokens are the double spaces. Transformations: 'A', 'Sql', '', 'Rocks', '', '^caret' (the caret word starts non-letter → untouched). GROUP_CONCAT over the seq-ordered tokens with a single-space separator rejoins them into 'A Sql  Rocks  ^caret' — byte-identical gaps, single-char and all-caps traps included.",
    ],
    time: "O(total characters) — each token is peeled, eligibility-tested and transformed a constant number of times; recursion depth = token count",
    space: "O(tokens) — the split CTE holds one row per token plus the per-row anchors",
    followUps: [
      "LC 3374 (Capitalization I) drops the hyphen rule entirely: which CTE, which JOIN and which CASE branch disappear — and how much of the spacing machinery survives?",
      "Add a rule for words starting with a letter but containing '/' (e.g. 'and/or'): does the current code already handle it, and what would a 'split on multiple delimiters' variant cost?",
    ],
    related: ["fix-names-in-a-table", "group-sold-products-by-the-date", "patients-with-a-condition"],
    order: "any",
    xp: 35,
  },
  {
    slug: "find-users-with-high-token-usage",
    statement:
      "An AI product logs every prompt a user submits together with the tokens it burned. Build a usage report per user: total prompts submitted and the average tokens per prompt rounded to two decimals. Keep only users with at least three prompts who ALSO fired at least one prompt strictly above their own average. Order by average tokens descending, then user_id ascending.",
    examples: [
      {
        input:
          "prompts: user 1 — 'Write a blog outline' 120, 'Generate SQL query' 80, 'Summarize an article' 200 · user 2 — 'Create resume bullet' 60, 'Improve LinkedIn bio' 70 · user 3 — 'Explain neural networks' 300, 'Generate interview Q&A' 250, 'Write cover letter' 180, 'Optimize Python code' 220 — then the traps: user 4 — 'Summarize a tweet' 100, 'Draft a reply' 100, 'Polish a README' 100 (all equal) · user 5 — 'Translate a doc' 500, 'Refactor a module' 400 (huge but only 2 prompts) · user 6 — 'Draft a sprint plan' 10, 'Review a pull request' 20, 'Outline a launch post' 30",
        output: "user_id 3 · prompt_count 4 · avg_tokens 237.5 / user_id 1 · 3 · 133.33 / user_id 6 · 3 · 20.0",
        explanation:
          "User 3: four prompts, average 237.5, and 300 and 250 both beat it. User 1: three prompts, average 133.33, and the 200-token prompt clears it. User 4 has exactly three prompts but every one EQUALS the 100-token average — 'greater than' fails, so they are out. User 2 and user 5 never reach the three-prompt floor, no matter how expensive their prompts are. User 6 sneaks in on the boundary: exactly three prompts, and 30 > 20.",
      },
    ],
    constraints: [
      "(user_id, prompt) is the primary key — the same text can recur across users but never within one user's history",
      "the average is rounded to 2 decimals for display; the above-average test compares against the RAW average, strictly greater",
      "only users with at least 3 prompts; output user_id, prompt_count, avg_tokens ordered by avg_tokens descending then user_id ascending",
    ],
    breakdown: [
      "Two aggregates per user where the second depends on the first: count and average are plain GROUP BY business, but 'has a prompt above their own average' needs the average pushed BACK against the raw rows — a self-referencing filter a single HAVING cannot see. Compute per-user stats in a CTE, then probe the base table again with EXISTS, correlated on user_id.",
      "The strict comparison is where near-copies of this problem die. User 4 submits three 100-token prompts: prompt_count = 3 passes the minimum, but MAX(tokens) = 100 EQUALS the average = 100, and 100 > 100 is false. 'At least one prompt above average' is an existence test with a strict inequality — all-equal users are the designed exclusion, not an accident.",
      "Rounding is for display only. ROUND can round UP (a raw 10.996 prints 11.00), so comparing tokens against the ROUNDED value can flip a strict > into a false equality at the boundary. Keep avg_raw in the CTE for the EXISTS and apply ROUND exactly once, in the final projection — the reported number and the compared number are deliberately different expressions.",
      "Assembly: GROUP BY user_id into (prompt_count, avg_raw); WHERE prompt_count >= 3 AND EXISTS (SELECT 1 FROM prompts p WHERE p.user_id = s.user_id AND p.tokens > s.avg_raw); project ROUND(avg_raw, 2) AS avg_tokens; ORDER BY avg_tokens DESC, user_id ASC — the official tie order, deterministic even when two users' rounded averages collide.",
    ],
    edges: [
      "Boundary equality: max == average (user 4's three 100s) excludes — the requirement says GREATER than their own average, and equal is not greater.",
      "Count floor is a quota, not a quality bar: user 5's 500-token whopper and 450 average mean nothing at two prompts (official user 2 fails the same way at 65).",
      "Compare against the RAW average, not the rounded alias — ROUND can round up and turn a genuine > into a phantom = at the third decimal.",
      "prompt_count is a bare COUNT(*) — (user_id, prompt) uniqueness makes it duplication-proof; no DISTINCT theater needed.",
    ],
    ladder: [
      {
        title: "Brute force — two queries per user",
        body: "For each user, one query for count + average and a second for 'does any row beat it' — N+1 round trips, with the average floating between queries and every chance the two disagree on rounding.",
      },
      {
        title: "The pattern — aggregate once, probe back",
        body: "A stats CTE (GROUP BY user_id) plus a correlated EXISTS into the base table is the canonical self-referencing filter — the same family as 'employees earning above their department average'. The CTE is the average's single source of truth.",
      },
      {
        title: "The optimal idea — strict EXISTS, round at the edge",
        body: "One CTE, one EXISTS probe per surviving group (index-friendly on the (user_id, prompt) primary key), ROUND only in the projection. Alternative shape: join prompts back and HAVING MAX(tokens) > AVG(tokens) — same verdicts, one more scan.",
      },
    ],
    approach: "CTE per-user stats + EXISTS strictly above own raw average",
    schema: {
      ddl: `CREATE TABLE prompts (
  user_id INTEGER NOT NULL,
  prompt  TEXT NOT NULL,
  tokens  INTEGER NOT NULL,
  PRIMARY KEY (user_id, prompt)
);`,
      seed: `INSERT INTO prompts (user_id, prompt, tokens) VALUES
  (1, 'Write a blog outline',     120),  -- official
  (1, 'Generate SQL query',        80),  -- official
  (1, 'Summarize an article',     200),  -- official: 200 > avg 133.33 → included
  (2, 'Create resume bullet',      60),  -- official: only 2 prompts
  (2, 'Improve LinkedIn bio',      70),  -- official
  (3, 'Explain neural networks',  300),  -- official
  (3, 'Generate interview Q&A',   250),  -- official: 300 and 250 both > avg 237.5
  (3, 'Write cover letter',       180),  -- official
  (3, 'Optimize Python code',     220),  -- official
  (4, 'Summarize a tweet',        100),  -- trap: all-equal user
  (4, 'Draft a reply',            100),  -- trap: max == avg → 'greater than' fails
  (4, 'Polish a README',          100),  -- trap: count = 3 passes, EXISTS does not
  (5, 'Translate a doc',          500),  -- trap: expensive but only 2 prompts
  (5, 'Refactor a module',        400),  -- trap: high average means nothing at count 2
  (6, 'Draft a sprint plan',       10),  -- trap: exactly 3 prompts (boundary IN)
  (6, 'Review a pull request',     20),  -- trap: avg 20
  (6, 'Outline a launch post',     30);  -- trap: 30 > 20 → included`,
      tables: [
        { name: "prompts", note: "17 rows, 6 users — official 9 plus an all-equal user, an expensive 2-prompt user and a boundary 3-prompt user" },
      ],
    },
    code: `WITH stats AS (
    SELECT
        user_id,
        COUNT(*)    AS prompt_count,
        AVG(tokens) AS avg_raw       -- keep the RAW mean for the comparison
    FROM prompts
    GROUP BY user_id
)
SELECT
    s.user_id,
    s.prompt_count,
    ROUND(s.avg_raw, 2) AS avg_tokens  -- rounding is display-only — the test used the raw value
FROM stats s
WHERE s.prompt_count >= 3             -- floor: at least three prompts
  AND EXISTS (SELECT 1                -- at least one OWN prompt strictly above OWN average
              FROM prompts p
              WHERE p.user_id = s.user_id
                AND p.tokens > s.avg_raw)
ORDER BY avg_tokens DESC, s.user_id ASC;`,
    walkthrough: [
      "stats folds the 17 rows into six users: user 1 (3 prompts, avg 133.33…), user 2 (2, 65), user 3 (4, 237.5), user 4 (3, 100), user 5 (2, 450), user 6 (3, 20).",
      "The count gate drops users 2 and 5 — user 5's 500-token prompt and 450 average are exactly the bait the floor exists to ignore; the minimum is a quota, not a quality bar.",
      "The EXISTS gate drops user 4: every prompt equals the 100-token average, so no row satisfies tokens > avg_raw — the strict inequality is the whole trap. User 3 qualifies twice over (300 and 250 above 237.5), user 1 via the 200-token prompt, user 6 on the boundary via 30 > 20.",
      "ROUND dresses the survivor averages — 237.5, 133.33, 20.0 — and the double sort prints user 3, user 1, user 6: avg_tokens descending with user_id as the deterministic tie-break.",
    ],
    time: "O(n) for the GROUP BY plus an index-backed EXISTS probe per surviving user (the (user_id, prompt) primary key serves the correlation)",
    space: "O(u) — one stats row per user",
    followUps: [
      "Rewrite the EXISTS as a joined GROUP BY with HAVING MAX(tokens) > AVG(tokens): which form is cheaper per user, and why do both agree on the all-equal user?",
      "Add a rank column with RANK() OVER (ORDER BY avg_tokens DESC): where do ties land once ROUND collapses near-equal averages, and which users share a rank in a seed built for it?",
    ],
    related: ["queries-quality-and-percentage", "average-selling-price", "classes-more-than-5-students"],
    order: "exact",
    xp: 10,
  },
];
