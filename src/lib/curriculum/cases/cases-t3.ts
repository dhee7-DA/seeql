// Case batch T3 — Module 5 (scalar & window toolkit) cases cs-1301…cs-1350, wave 3.
// Deepening pass over wave-1 ground: t1 text & type (15) / t2 COALESCE & NULLs (15) /
// t3 dates & calendars (10) / t4 month buckets (10).
// Figures receipt-verified in scripts/m5-cases-w3-out.txt (+ w1/w1b/w1c pool).
import type { CaseStudy } from "./types";

export const casesT3: CaseStudy[] = [
  {
    id: "cs-1301",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The crowded at-position",
    brief:
      "From: Growth lead. Re: the form parser.\n\nThe signup parser keys on the @ position, and the roster's addresses cluster unevenly. Census the @ positions and read the crowded line — the position five members share.",
    ask: "The @ position shared by the most email addresses.",
    template: `SELECT pos, n
FROM (
  SELECT {1}(email, '@') AS pos, COUNT(*) AS n
  FROM {2}
  GROUP BY pos
)
WHERE n = {3};`,
    slots: [
      {
        answer: "INSTR",
        kind: "keyword",
        label: "the position probe",
        why: "The parser measures where the @ sits, so the probe is INSTR. LENGTH takes one argument and cannot search for a character.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the address table",
        why: "Emails live on customers. Orders carries no email column, so the census would fail to compile.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the crowded bar",
        why: "Five addresses park the @ at position 12 — the roster's busiest line. A 4-bar would return the four-member positions instead.",
      },
    ],
    distractors: ["LENGTH", "orders", "4"],
    walkthrough:
      "The @ positions spread from 8 to 13, and the census crowds at 12 — five members whose handles run eleven characters. The probe must be INSTR: LENGTH cannot take a search character and the census would not compile. The bar of 5 isolates the crowded line; a 4-bar would return every four-member position instead. The parser's hot spot: position 12, five addresses.",
  },
  {
    id: "cs-1302",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The over-length roster",
    brief:
      "From: CRM steward. Re: the badge overflow.\n\nBadges shrink past twelve characters, and three members overflow. Shout their names and measure them — the overflow list, uppercased for the print run.",
    ask: "The names longer than 12 characters, uppercased with lengths.",
    template: `SELECT {2}(name) AS shout, {3}(name) AS len
FROM customers
WHERE LENGTH(name) > {1};`,
    slots: [
      {
        answer: "12",
        kind: "number",
        noVerify: true,
        label: "the overflow edge",
        why: "The badges shrink past twelve, so the overflow is strictly > 12. A 13-edge would drop one of the three and understate the print run.",
      },
      {
        answer: "UPPER",
        kind: "keyword",
        label: "the print fold",
        why: "The print run wants shouting names, so the projection folds with UPPER. LOWER would whisper the overflow list.",
      },
      {
        answer: "LENGTH",
        kind: "keyword",
        label: "the length gauge",
        why: "The layout needs the character count beside each name, so the gauge is LENGTH. INSTR with one argument is not a legal call.",
      },
    ],
    distractors: ["13", "LOWER"],
    walkthrough:
      "Three names run past the edge — Isabella Rossi at fourteen, Dmitri Volkov and Pedro Alvarez at thirteen — and the print fold shouts them for the badge run. The 13-edge would silently drop one of the thirteen-character names. LOWER would render the list in lowercase and violate the print spec. The overflow list: three names, 14 and 13 and 13.",
  },
  {
    id: "cs-1303",
    tier: "medium",
    topic: "t1",
    universe: "catalog",
    title: "The per-shelf width champions",
    brief:
      "From: Catalog ops. Re: the shelf width table.\n\nEach category has a widest tag, and the width table lists them all. Group the catalog by category, keep the shelves whose champion clears fifteen characters, and read the table widest-first.",
    ask: "The longest product name in each category, 15+ characters only.",
    template: `SELECT category, MAX(LENGTH(name)) AS widest
FROM products
GROUP BY category
HAVING MAX(LENGTH(name)) {1} {2}
ORDER BY widest {3};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the width gate",
        why: "The table keeps shelves whose champion clears fifteen, so the gate is >= 15. Flipping to < 15 would keep only the narrow shelves.",
      },
      {
        answer: "15",
        kind: "number",
        noVerify: true,
        label: "the width bar",
        why: "The bar sits at 15 — every category's champion clears it. A 16-bar would drop Wearables' fifteen-character champion.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the table direction",
        why: "The table reads widest first, so the sort is descending. ASC would lead with Video's fourteen and invert the table.",
      },
    ],
    distractors: ["<", "16", "ASC"],
    walkthrough:
      "Grouped per shelf, the champions read: Audio 23, Electronics 22, Accessories 21, Apparel 20, Fitness 16, Wearables 15, Video 14 — and the >= 15 gate keeps six of the seven, dropping Video's fourteen-character webcam. The flipped < gate would invert the table's purpose. The 16-bar would snap Wearables off the list. And DESC leads with Audio's 23-character headset-stand row. The width table: six shelves at fifteen-plus.",
  },
  {
    id: "cs-1304",
    tier: "easy",
    topic: "t1",
    universe: "expense",
    title: "The vendor tail census",
    brief:
      "From: Expense report. Re: the vendor suffix audit.\n\nThe expense feed wants to know how vendor names end — GmbH's capital H, the Media 'a'. Slice each vendor's final character, prove the names are stored clean, and census the tails busiest-first.",
    ask: "The census of vendor names' final characters.",
    template: `SELECT SUBSTR(vendor, {1}) AS tail, COUNT(*) AS n
FROM expenses
WHERE {2}(vendor) = vendor
GROUP BY tail
ORDER BY n {3};`,
    slots: [
      {
        answer: "-1",
        kind: "keyword",
        label: "the tail slice",
        why: "The audit reads the final character, so the slice index is -1. Position 1 would census the first characters — a different audit.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-storage check",
        why: "TRIM(vendor) = vendor proves no vendor name rides with stray whitespace — true for all four, so the census sees clean tails. UPPER would demand shouting vendors and match nothing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the census direction",
        why: "The audit reads the busiest tail first, so the sort is descending. ASC would lead with the three-name 'l' tail.",
      },
    ],
    distractors: ["1", "UPPER", "ASC"],
    walkthrough:
      "The tail slice reads each vendor's last character — 'a' closes the fourteen AdWorks entries, 'H' closes the fourteen Atlas GmbH entries, 'c' the five DevTools, 'l' the three Skyline. Position 1 would census initials instead: A, A, D, S — a different audit with a 28-member line. UPPER would fail every stored vendor name and empty the census. The suffix audit: 'a' and 'H' tied at fourteen.",
  },
  {
    id: "cs-1305",
    tier: "medium",
    topic: "t1",
    universe: "growth",
    title: "The handle range",
    brief:
      "From: Growth lead. Re: the form field bounds.\n\nThe signup form's handle field needs bounds, and the roster defines them: the shortest and longest local parts on file. Probe the @, measure the offsets, and report both extremes.",
    ask: "The shortest and longest email handle lengths on the roster.",
    template: `SELECT {1}(INSTR(email, '@') - 1) AS shortest,
       {2}(INSTR(email, '@') - 1) AS longest
FROM customers
WHERE {3}(email) = email;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor pick",
        why: "The bound read starts at the shortest handle, so the first fold is MIN. MAX there would swap the columns and mislabel the bounds.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling pick",
        why: "The second bound is the longest handle, so the second fold is MAX. MIN would report the same short number twice.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(email) = email proves the addresses carry no stray whitespace — true for the whole roster. UPPER would demand shouting emails and match nothing.",
      },
    ],
    distractors: ["MAX", "MIN", "UPPER"],
    walkthrough:
      "The at-probe measures every handle, and the two folds read the bounds: MIN lands on 7 — the roster's tidiest handle — and MAX on 12, the longest. Swapping the folds would print 12 as the shortest and 7 as the longest, a form field defined backwards. The storage check passes every address clean, while the UPPER fill demands shouting emails and would return NULLs. The form bounds: 7 to 12 characters.",
  },
  {
    id: "cs-1306",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The regional name lengths",
    brief:
      "From: Growth lead. Re: the localization sizes.\n\nThe localized name fields size per region, and the roster defines them. Average the name lengths inside each region and keep the fields whose average clears ten characters.",
    ask: "Average name length per region, 10+ characters only.",
    template: `SELECT region, ROUND(AVG(LENGTH(name)), 2) AS name_avg
FROM customers
GROUP BY region
HAVING name_avg {1} {2}
ORDER BY name_avg {3};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the size gate",
        why: "The field list keeps regions whose average clears ten, so the gate is >= 10. Flipping to < 10 would keep no region — every average sits at ten or above.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the size bar",
        why: "The bar sits at 10 — all four regions clear it. An 11-bar would drop APAC's 10.4 and LATAM's 11.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the field order",
        why: "The biggest field sizes list first, so the sort is descending. ASC would lead with APAC's 10.4.",
      },
    ],
    distractors: ["<", "11", "ASC"],
    walkthrough:
      "Averaged per region, the name fields read: EU 12.00, US 11.50, LATAM 11.00, APAC 10.40 — all four clear the ten-character bar and the list runs biggest-first. The < flip would match nothing and the field study would return empty. The 11-bar would snap LATAM and APAC off the list. The localization sizes: EU leads at 12.00.",
  },
  {
    id: "cs-1307",
    tier: "hard",
    topic: "t1",
    universe: "catalog",
    title: "The hyphenated tags",
    brief:
      "From: Catalog ops. Re: the SKU parser.\n\nThe SKU parser keys on hyphens, and only a few tags carry one. Probe each name for the dash, prove the storage is clean, and list the hyphenated tags above the budget line.",
    ask: "The product names containing a hyphen, above 0 euros.",
    template: `SELECT name
FROM products
WHERE {1}(name, {2}) > 0
AND price {3} {4}
AND {5}(name) = name;`,
    slots: [
      {
        answer: "INSTR",
        kind: "keyword",
        label: "the dash probe",
        why: "The parser searches for the dash, so the probe is INSTR. LENGTH cannot take a search character.",
      },
      {
        answer: "'-'",
        kind: "keyword",
        label: "the dash needle",
        why: "The parser keys on the hyphen character itself. An 'a' needle would census every tag with the letter a — most of the catalog.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the price gate direction",
        why: "The gate keeps real tags, so the test is > 0. Flipping to < 0 would demand negative prices and empty the list.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open price floor",
        why: "A floor of 0 admits every tag — the hyphen list is the point. A floor of 100 would drop the 49-euro hub from the list.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(name) = name proves no tag rides with stray whitespace — true for the catalog. UPPER would demand shouting tags and match nothing.",
      },
    ],
    distractors: ["LENGTH", "'a'", "<", "100", "UPPER"],
    walkthrough:
      "Three tags carry the dash the parser keys on, and the price gate keeps all three in scope. The 'a' needle would census a different club entirely — most of the catalog carries the letter. The flipped price gate or a 100 floor would drop the budget hyphenated tags, and UPPER would fail every stored name. The parser's list: three hyphenated tags.",
  },
  {
    id: "cs-1308",
    tier: "easy",
    topic: "t1",
    universe: "fraud",
    title: "The 'a' roll call",
    brief:
      "From: Fraud spot-check. Re: the second screen.\n\nThe pattern screen's second pass counts names carrying the letter a — case-blind, anywhere in the name. Lowercase the field, probe for the letter, and count the passers with a clean-storage guard.",
    ask: "Count of customer names containing the letter a (case-insensitive).",
    template: `SELECT {3}(*) AS a_names
FROM customers
WHERE {1}(LOWER(name), 'a') > {2}
AND {4}(email) = email;`,
    slots: [
      {
        answer: "INSTR",
        kind: "keyword",
        label: "the letter probe",
        why: "INSTR finds the first a and returns 0 when absent, so > 0 is the containment test. UPPER cannot take a search character.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the containment bar",
        why: "A found letter sits at position 1 or later, so the bar is 0. A bar of 1 would demand the a at first position and shrink the roll call.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the roll-call tally",
        why: "The screen counts passers, so the tally is COUNT. SUM cannot add a star and the call would fail.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage guard",
        why: "TRIM(email) = email proves every screened record is stored clean — true for the roster. UPPER would demand shouting addresses and match nothing.",
      },
    ],
    distractors: ["UPPER", "1", "SUM"],
    walkthrough:
      "Fourteen of the sixteen names carry an a somewhere — the case-blind lower-fold probe finds it in all but two. Raising the bar to 1 would demand the a open the name, and only Alice qualifies. The tally must be COUNT — SUM cannot add a star. And the storage guard passes every clean record while the UPPER fill would zero the screen. The second screen: 14 of 16.",
  },
  {
    id: "cs-1309",
    tier: "hard",
    topic: "t1",
    universe: "month-close",
    title: "The shelf-stock floor",
    brief:
      "From: Month-end close. Re: the deepest shelf.\n\nThe warehouse report floors every stock count to its integer shelf line and reads the deepest shelf in the catalog — the fewest units on hand. Fold the cast counts and read the floor, with the storage and supplier gates open.",
    ask: "The minimum integer stock count in the catalog.",
    template: `SELECT {1}(CAST(stock AS INTEGER)) AS shelf_floor
FROM products
WHERE {2}(name) = name
AND supplier_id {3} {4};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "The deepest shelf is the fewest units, so the fold is MIN. MAX would report the fullest shelf — 500 units — and answer the opposite brief.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(name) = name proves the catalog is stored clean — true for all sixteen tags. UPPER would demand shouting names and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the supplier gate direction",
        why: "The gate must admit every supplier, so the test is > 0. Flipping to < 0 would demand negative supplier ids and empty the scan.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open supplier floor",
        why: "A floor of 0 admits the whole bench. A floor of 2 would drop supplier 1's watch — the very tag carrying the 40-unit floor.",
      },
    ],
    distractors: ["MAX", "UPPER", "<", "2"],
    walkthrough:
      "CAST floors every stock count to its integer shelf line, and MIN reads the deepest: 40 units, on the supplier-1 watch. MAX would crown the 500-unit cable shelf instead. The storage check passes every tag clean while UPPER would empty the scan. And the supplier gate stays open — the 2-floor would drop supplier 1 and hide the very shelf the report exists to find. The deepest shelf: 40 units.",
  },
  {
    id: "cs-1310",
    tier: "easy",
    topic: "t1",
    universe: "supplier",
    title: "The 4.8 flag",
    brief:
      "From: Supplier audit. Re: the top-rating flag.\n\nThe scorecard flags the bench's top rating by its text signature — the one supplier whose rating prints as 4.8. Cast the ratings to text and find the flag.",
    ask: "The supplier whose rating prints as 4.8.",
    template: `SELECT UPPER(name) AS flagged
FROM suppliers
WHERE CAST(rating AS TEXT) {1} {2}
AND {3}(region) = region;`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the signature test",
        why: "The flag matches the printed signature exactly, so the test is =. Flipping to > would compare text against text and flag a different bench member.",
      },
      {
        answer: "'4.8'",
        kind: "keyword",
        label: "the signature",
        why: "The top rating prints as 4.8 — Alpine's line. A '3.9' fill would flag the weakest bench member instead.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(region) = region proves the bench is stored clean — true for all six. LOWER would demand lowercase regions and match nothing.",
      },
    ],
    distractors: ["'3.9'", ">", "<", "LOWER"],
    walkthrough:
      "CAST(rating AS TEXT) prints each rating as its signature, and exactly one supplier's matches 4.8 — Alpine Audio GmbH, the bench's top scorer, shouted for the scorecard. The '3.9' fill would flag Pacific Textiles, the bench's floor. The > flip would compare text against text and flag nobody above 4.8, and the < flip would flag the other five. The flagged line: Alpine Audio GmbH.",
  },
  {
    id: "cs-1311",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The prefix solitude",
    brief:
      "From: Growth lead. Re: the market-code plan.\n\nThe market codes would slice each city to a two-letter prefix — but the plan only works if cities share prefixes. Census the folded prefixes and count the lines that repeat. If the count is zero, the plan dies on evidence.",
    ask: "The two-letter city-prefix census, one line per code.",
    template: `SELECT p, n
FROM (
  SELECT {1}(SUBSTR(city, 1, 2)) AS p, COUNT(*) AS n
  FROM customers
  GROUP BY p
)
WHERE n {2} {3};`,
    slots: [
      {
        answer: "UPPER",
        kind: "keyword",
        label: "the code fold",
        why: "Market codes print in caps, so the prefix folds with UPPER. LOWER would produce lowercase codes and the plan's artifact would change.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the census line test",
        why: "The census lists every code's line, and each carries exactly one member, so the test is n = 1. Flipping to > 1 would keep only shared codes — and there are none.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the singleton line",
        why: "Every prefix carries exactly one member, so the census keeps the singleton lines. A 2-fill would demand two-member lines and return nothing.",
      },
    ],
    distractors: ["LOWER", ">"],
    walkthrough:
      "The folded prefixes census to sixteen singleton lines — no two cities share even a two-letter opener — so the market-code plan dies on evidence, and the census prints the proof: sixteen codes, one member each. The LOWER fill would pass the same counts but print the codes in lowercase, a different artifact. And the > fill would demand shared codes and return nothing. The census: sixteen singleton prefixes.",
  },
  {
    id: "cs-1312",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The already-caps census",
    brief:
      "From: CRM steward. Re: the import lint.\n\nThe import lint flags fields stored shouting so the display layer can skip re-folding. Count the members whose region is already uppercase — with the city check riding along as documentation.",
    ask: "How many members have an already-uppercase region?",
    template: `SELECT COUNT(*) AS already_caps
FROM customers
WHERE {1}(region) = region
AND {2}(city) = city
AND LENGTH(region) {3} {4};`,
    slots: [
      {
        answer: "UPPER",
        kind: "keyword",
        label: "the caps test",
        why: "Already-uppercase means the fold changes nothing, so the test is UPPER(region) = region. LOWER would fail every stored region.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-city check",
        why: "TRIM(city) = city proves the city field carries no stray whitespace — true for every member, so the lint sees the whole roster. UPPER would demand shouting cities and match nobody.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the region-length gate",
        why: "Every stored region runs at least two characters, so the gate is >= 2. Flipping to < 2 would demand single-letter regions and match nothing.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the region floor",
        why: "The floor sits at 2 — EU and US carry two, APAC four, LATAM five. A 6-floor would exceed every region and empty the lint.",
      },
    ],
    distractors: ["LOWER", "6"],
    walkthrough:
      "UPPER(region) = region is true for every stored region — EU, US, APAC, LATAM are already shouting — so the lint counts all sixteen members. The LOWER fill would fail every row and report a roster that needs no re-folding at all, the opposite lint. The city check rides along as documentation: TRIM passes every stored city clean. And the region-length gate admits every real code while a 6-floor would exceed them all. The lint's answer: 16 already-caps regions.",
  },
  {
    id: "cs-1313",
    tier: "medium",
    topic: "t1",
    universe: "growth",
    title: "The APAC badge list",
    brief:
      "From: Design. Re: the chapter badges.\n\nThe APAC chapter's badges print first, longest name at the top. Fold the chapter's names to caps, sort by length descending, and cut the list to the three the printer queues first.",
    ask: "The three longest APAC customer names, uppercased.",
    template: `SELECT UPPER(name) AS shout
FROM customers
WHERE region = {1}
ORDER BY LENGTH(name) {2}, name
LIMIT {3};`,
    slots: [
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the chapter gate",
        why: "The printer queues the APAC chapter, so the gate is region = 'APAC'. A 'US' fill would queue Emma and Jamal instead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the badge order",
        why: "The longest badge prints first, so the sort is descending by length. ASC would queue Grace's nine-character name first.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the queue cut",
        why: "The printer queues three badges per run. A cut of 5 would pull the whole chapter into the queue.",
      },
    ],
    distractors: ["'US'", "ASC", "5"],
    walkthrough:
      "The APAC chapter folds to caps and sorts longest-first: Farid Nasser's twelve characters lead, Hiro Tanaka's eleven next, then the ten-character pair resolved by name. The US fill would queue a two-member chapter, and ASC would hand the printer Grace's shortest badge first. The cut of 3 keeps the queue honest — five would flood it with the whole chapter. The print queue: three APAC badges, Farid first.",
  },
  {
    id: "cs-1314",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The surname width table",
    brief:
      "From: CRM steward. Re: the layout spec.\n\nThe contact-card spec lists the widest surnames first so the column can be sized. Slice every surname from its space anchor, measure it, sort widest-first, and cut the table to the four the layout reserves for.",
    ask: "The four longest customer surnames with their lengths.",
    template: `SELECT SUBSTR(name, INSTR(name, ' ') + 1) AS last,
       LENGTH(SUBSTR(name, INSTR(name, ' ') + 1)) AS len
FROM customers
WHERE {1}(city) = city
ORDER BY len {2}, last
LIMIT {3};`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(city) = city proves every member's city is stored clean — true for the roster, so the table sees all sixteen surnames. UPPER would demand shouting cities and match nothing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the spec order",
        why: "The spec sizes from the widest surname down, so the sort is descending. ASC would lead with the three-character surname and under-size the column.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the table cut",
        why: "The layout reserves four width bands, so the table cuts at 4. A cut of 2 would stop inside the seven-character tie.",
      },
    ],
    distractors: ["UPPER", "ASC", "2"],
    walkthrough:
      "The space-anchor slice lifts every surname, and the widths sort widest-first: O'Brien and Alvarez tie at seven, the six-character club follows, then the five-band. TRIM passes every city clean — the UPPER fill would demand shouting cities and empty the table. ASC would lead the spec with the shortest surname and the column would clip everyone else. The cut of 4 keeps the spec to the bands the layout actually reserves. The width table: O'Brien 7, Alvarez 7, then the sixes.",
  },
  {
    id: "cs-1315",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The handle census line",
    brief:
      "From: Growth lead. Re: the form analytics.\n\nThe analytics line carries the handle study in one row: shortest handle, longest handle, and the roster size the bounds were measured over. Probe the @, fold the extremes, and prove the census counts everyone.",
    ask: "The shortest and longest handle lengths, with the roster count.",
    template: `SELECT {2}(INSTR(email, '@') - 1) AS shortest,
       {3}(INSTR(email, '@') - 1) AS longest,
       COUNT(*) AS members
FROM customers
WHERE {1}(city) = city;`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage guard",
        why: "TRIM(city) = city proves every member is stored clean — true for the roster, so the census counts all sixteen. UPPER would demand shouting cities and count nobody.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "The analytics line opens with the shortest handle, so the first fold is MIN. MAX there would mislabel the bounds.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "The line closes with the longest handle, so the second fold is MAX. MIN would duplicate the short bound.",
      },
    ],
    distractors: ["UPPER", "MAX", "MIN"],
    walkthrough:
      "One row, three figures: the at-probe measures every handle, MIN reads the shortest at 7, MAX reads the longest at 12, and COUNT certifies the census covered all sixteen members. The UPPER fill would fail every city and return NULLs across the line. Swapping the folds would print the bounds backwards — a form field defined upside down. The analytics line: 7 shortest, 12 longest, 16 measured.",
  },
  {
    id: "cs-1316",
    tier: "easy",
    topic: "t2",
    universe: "expense",
    title: "The debit-ledger split",
    brief:
      "From: Expense report. Re: the debit census by account.\n\nThe debit side of the book splits unevenly across accounts. Surface the debit-only lines with NULLIF, group them per account, and keep the accounts carrying real weight above twelve lines.",
    ask: "The accounts with more than 12 debit-only ledger lines.",
    template: `SELECT account, n
FROM (
  SELECT account, COUNT(*) AS n
  FROM ledger_entries
  WHERE NULLIF(credit_cents, 0) IS NULL
  GROUP BY {1}
)
WHERE n {2} {3};`,
    slots: [
      {
        answer: "account",
        kind: "keyword",
        label: "the census key",
        why: "The split is one line per account, so the stage groups by account. Grouping by entry_date would census days instead of accounts.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the weight gate direction",
        why: "The report keeps accounts above the weight line, so the test is >. Flipping to < 12 would census the light accounts instead.",
      },
      {
        answer: "12",
        kind: "number",
        noVerify: true,
        label: "the weight line",
        why: "The line sits at 12 — operating_expenses 14, cash 13, accounts_receivable 13 all clear it. A 14-line would keep only opex.",
      },
    ],
    distractors: ["entry_date", "<", "13"],
    walkthrough:
      "NULLIF surfaces the zero credits as real NULLs, and the debit-only census splits: operating_expenses 14, cash 13, accounts_receivable 13 — three accounts above the twelve-line weight gate. Grouping by entry_date would census the calendar instead of the ledger's anatomy. The 13-line would drop both cash and AR and leave opex standing alone. The debit split: three accounts, led by opex at 14.",
  },
  {
    id: "cs-1317",
    tier: "easy",
    topic: "t2",
    universe: "refund-audit",
    title: "The sentinel census",
    brief:
      "From: Refund audit. Re: the sentinel discipline.\n\nThe audit pushes every missing ship timestamp to the 'x' sentinel, then counts the rows the sentinel caught. Fold the timestamps, test the sentinel, and keep the total gate open.",
    ask: "How many orders carry the 'x' ship sentinel?",
    template: `SELECT COUNT(*) AS stuck
FROM orders
WHERE IFNULL(shipped_at, 'x') = {1}
AND total {2} {3};`,
    slots: [
      {
        answer: "'x'",
        kind: "keyword",
        label: "the sentinel word",
        why: "The audit's sentinel is the letter x — IFNULL pushes each NULL to 'x' and the equality catches it. A 'y' fill would test against a sentinel nothing was pushed to.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate admits every stuck order, so the test is > 0. Flipping to < 0 would demand negative totals and empty the census.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps the whole queue in scope. A 300 floor would census only the nine expensive stuck orders.",
      },
    ],
    distractors: ["'y'", "<", "300"],
    walkthrough:
      "IFNULL pushes each missing timestamp to the 'x' sentinel, and the equality catches exactly the twenty-one orders that never shipped — fourteen pending, seven cancelled. A 'y' fill would compare every row against a sentinel nothing was pushed to and count zero. The flipped total gate or a 300 floor would shrink the queue and understate the exposure. The sentinel census: 21.",
  },
  {
    id: "cs-1318",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The unpaid years",
    brief:
      "From: Month-end close. Re: the vintage report.\n\nUnpaid balances age by the year they were issued. LEFT-join payments, catch the misses with the IFNULL zero-fill, group by issue year, and keep the years carrying more than one unpaid invoice.",
    ask: "The issue years with more than one unpaid invoice.",
    template: `SELECT strftime('%Y', i.issued_on) AS yr, COUNT(*) AS unpaid
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE IFNULL(p.amount_cents, 0) = 0
GROUP BY yr
HAVING COUNT(*) {1} {2}
ORDER BY unpaid {3};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the vintage gate direction",
        why: "The report keeps years above the bar, so the test is >. Flipping to < 1 would keep the years with nothing and report an empty vintage.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the vintage bar",
        why: "The bar sits at 1 — 2025 carries four unpaid, 2024 two. A 4-bar would keep no year at all.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the report direction",
        why: "The heaviest vintage lists first, so the sort is descending. ASC would lead with 2024's pair.",
      },
    ],
    distractors: ["<", "4", "ASC"],
    walkthrough:
      "The zero-fill catches the six never-paid invoices, and the vintage split reads: 2025 carries four, 2024 carries two. The > 1 gate keeps only 2025 — a single heavy line. The 4-bar would keep nothing and the report would go blank. ASC would lead with the lighter vintage. The vintage report: 2025, four unpaid.",
  },
  {
    id: "cs-1319",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The void line in euros",
    brief:
      "From: Month-end close. Re: the void write-down.\n\nThe voided invoice is a write-down the close must show in euros, not cents. Sum the void line's amounts, convert at the hundred-cents rate, and gate the read to last year's issue window.",
    ask: "The voided invoice's total, converted to euros.",
    template: `SELECT ROUND({1}(amount_cents) / 100.0, 2) AS void_euros
FROM invoices
WHERE IFNULL(status, 'x') = {2}
AND issued_on {3} {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the write-down fold",
        why: "The write-down totals the void line, so the fold is SUM. COUNT would report one invoice where the close asked for euros.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "the void gate",
        why: "The write-down reads the voided line, so the gate is status = 'void'. A 'paid' fill would sum the settled book instead.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the window direction",
        why: "The read covers last year's issue window, so the test is issued_on < '2025-01-01'. Flipping to >= would demand this year's issues and find nothing.",
      },
      {
        answer: "'2025-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the window edge",
        why: "The window closes at 2025 — the void was issued in July 2024, comfortably inside. A 2024 edge would precede every invoice and empty the read.",
      },
    ],
    distractors: ["COUNT", ">=", "'2024-01-01'"],
    walkthrough:
      "The void line carries 92500 cents, and the hundred-cents conversion prints the write-down the close needs: 925.00 euros. COUNT would answer one invoice where the close asked for money. The 'paid' fill would sum the settled book — a very different figure — and the >= window flip would demand issues from a year the void never saw. The write-down: 925 euros.",
  },
  {
    id: "cs-1320",
    tier: "medium",
    topic: "t2",
    universe: "expense",
    title: "The settlement gap",
    brief:
      "From: Expense report. Re: the two-side reconciliation.\n\nThe books reconcile on one figure: what was invoiced minus what was settled. Stage both totals as scalar subqueries and subtract — the gap the finance team chases.",
    ask: "Total invoiced cents minus total settled cents.",
    template: `SELECT i_total - p_total AS gap
FROM (
  SELECT (SELECT SUM(amount_cents) FROM invoices) AS i_total,
         (SELECT {1}(IFNULL(amount_cents, 0)) FROM payments) AS p_total
)
WHERE gap {2} {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the settled fold",
        why: "The settled side sums the payments ledger, so the fold is SUM. COUNT would report twenty-seven receipts and the gap would balloon to the whole invoiced pot.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the gap test",
        why: "The chase targets a positive gap — invoiced beyond settled — so the test is > 0. Flipping to < 0 would hunt overpayments the books never recorded.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open gap floor",
        why: "A floor of 0 admits the whole gap. A 2000000 floor would exceed the 1736500 gap and empty the read.",
      },
    ],
    distractors: ["COUNT", "<", "2000000"],
    walkthrough:
      "The two scalar stages read the invoiced pot at 8697700 cents and the settled pot at 6961200 cents, and the subtraction lands the reconciliation gap: 1736500 cents billed but never collected. The COUNT fill would collapse the settled side to a tally — twenty-seven receipts — and the gap would balloon to the full invoiced pot. The flipped gap test would hunt negative gaps, and the 2000000 floor would exceed the true gap. The reconciliation: 1736500 cents open.",
  },
  {
    id: "cs-1321",
    tier: "easy",
    topic: "t2",
    universe: "expense",
    title: "The rent coverage",
    brief:
      "From: Expense report. Re: the rent calendar.\n\nThe rent posts monthly like clockwork — the coverage question is how many distinct months carry a rent entry. Filter the category, keep real entries above the floor, and count the covered months.",
    ask: "How many distinct months carry a Rent expense?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', spent_on)) AS rent_months
FROM expenses
WHERE category = {1}
AND IFNULL(amount_cents, 0) {2} {3}
AND {4}(vendor) = vendor;`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the rent gate",
        why: "The calendar tracks rent, so the gate is category = 'Rent'. A 'Travel' fill would count the three-entry travel calendar instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the floor direction",
        why: "The gate keeps real entries, so the test is > 0. Flipping to < 0 would demand negative expenses and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open entry floor",
        why: "A floor of 0 admits every rent post. A 200000 floor would exceed every 120000-cent rent line and empty the calendar.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(vendor) = vendor proves the expense feed is stored clean — true for all entries. UPPER would demand shouting vendors and match nothing.",
      },
    ],
    distractors: ["'Travel'", "<", "200000", "UPPER"],
    walkthrough:
      "The rent gate isolates the property line — fourteen entries, one a month — and the distinct-month count covers the whole book: 14 months. The Travel fill would count a three-entry calendar. The flipped gate or a 200000 floor would empty the read, since every rent post runs 120000 cents. The rent calendar: 14 covered months.",
  },
  {
    id: "cs-1322",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The aged open balances",
    brief:
      "From: Month-end close. Re: the aging bucket.\n\nThe aging report's oldest bucket holds the open invoices living above id 20 — the late-ledger lines. Catch the never-paid invoices with the zero-fill, keep the honest open status, and count the aged lines.",
    ask: "How many open, never-paid invoices sit above id 20?",
    template: `SELECT COUNT(*) AS aged
FROM (
  SELECT i.id
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  WHERE IFNULL(p.amount_cents, 0) = 0
  AND i.status = {1}
)
WHERE id {2} {3};`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the honest status",
        why: "The aging bucket counts honestly-labeled open balances. The 'paid' fill would age the phantom — a data-quality ticket, not a balance.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the aging edge direction",
        why: "The bucket starts above id 20, so the test is >. Flipping to < would census the early ledger lines instead.",
      },
      {
        answer: "20",
        kind: "number",
        noVerify: true,
        label: "the aging edge",
        why: "The edge sits at 20 — four open never-paid lines live above it (21, 24, 26, 27). A 24-edge would drop the 21 line.",
      },
    ],
    distractors: ["'paid'", "<", "24"],
    walkthrough:
      "The zero-fill catches the never-paid six, the open gate drops the phantom, and the aging edge at 20 keeps four lines: ids 21, 24, 26 and 27. The 'paid' fill would age the phantom instead — one line, wrong ledger. The flipped edge would census the early lines, and a 24 edge would drop the id-21 balance. The aged bucket: 4 open, never-paid lines.",
  },
  {
    id: "cs-1323",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The settlement-month census",
    brief:
      "From: Month-end close. Re: the settlement calendar.\n\nThe settlement calendar counts the distinct months the payment ledger actually touched. Chop the payment dates into months, dedupe, and count — with the table and value gates proving the read runs on real money.",
    ask: "How many distinct months carry a payment?",
    template: `SELECT COUNT(*) AS pay_months
FROM (
  SELECT DISTINCT strftime('%Y-%m', {1}) AS mo
  FROM {2}
)
WHERE IFNULL(mo, 'x') {3} {4};`,
    slots: [
      {
        answer: "paid_on",
        kind: "keyword",
        label: "the settlement date",
        why: "The calendar tracks when money moved, so the chop runs on paid_on. Chopping amount_cents would feed a number to strftime and yield one NULL bucket.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "the settlement table",
        why: "Settlements live on payments. Expenses would count the spend calendar — fourteen months, a different ledger.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the empty-month guard",
        why: "No month bucket is the empty string, so != '' keeps the whole calendar. Flipping to = '' would match nothing and blank the census.",
      },
      {
        answer: "''",
        kind: "keyword",
        label: "the never-true label",
        why: "The guard's operand is a label no bucket carries. A '2024-06' equality would count a single month.",
      },
    ],
    distractors: ["amount_cents", "expenses", "<", "'2024-06'"],
    walkthrough:
      "The chop renders each payment's month, DISTINCT dedupes the calendar, and the census counts 13 settlement months. Chopping amount_cents would feed strftime a number and yield a single NULL bucket. The expenses fill would census the spend calendar's fourteen months — a different ledger entirely. And the guard excludes nothing: no bucket is empty, while the '2024-06' equality would count June alone. The settlement calendar: 13 months.",
  },
  {
    id: "cs-1324",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The split-settlement pot",
    brief:
      "From: Month-end close. Re: the split book.\n\nFive invoices settled in two receipts, and the split book carries its own pot. Subquery the two-payment invoice ids, sum their face values, and keep the premium lines above the floor.",
    ask: "Total cents on invoices settled with exactly two payments.",
    template: `SELECT {1}(amount_cents) AS split_pot
FROM invoices
WHERE id IN (
  SELECT invoice_id FROM payments GROUP BY invoice_id HAVING COUNT(*) {2} {3}
)
AND IFNULL(amount_cents, 0) {4} {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the split fold",
        why: "The split book totals face values, so the fold is SUM. COUNT would report five invoices where the close asked for cents.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the split test",
        why: "A split settlement is exactly two receipts, so the HAVING test is = 2. Flipping to > 2 would demand three-receipt invoices the books never recorded.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the split bar",
        why: "The bar sits at 2 — five invoices carry exactly two receipts. A 1-bar would census the seventeen single-receipt invoices instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the floor direction",
        why: "The gate keeps real face values, so the test is > 0. Flipping to < 0 would demand negative invoices and empty the pot.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open face floor",
        why: "A floor of 0 admits every split line. A 500000 floor would exceed the split book's lines and empty the pot.",
      },
    ],
    distractors: ["COUNT", "500000", "<"],
    walkthrough:
      "The HAVING subquery finds the five two-receipt invoices, and the outer fold sums their face values — the split book's pot, distinct from the single-receipt majority. COUNT would answer five invoices where the close asked for cents. The 1-bar would census the seventeen singles, and the 500000 floor would exceed every split line. The split pot: five invoices, summed.",
  },
  {
    id: "cs-1325",
    tier: "easy",
    topic: "t2",
    universe: "expense",
    title: "The spend calendar count",
    brief:
      "From: Expense report. Re: the spend calendar.\n\nThe spend calendar counts the distinct months the expense feed touched. Prove the feed is stored clean, keep the real entries, and count the months.",
    ask: "How many distinct months carry an expense?",
    template: `SELECT COUNT(*) AS spend_months
FROM (
  SELECT DISTINCT strftime('%Y-%m', spent_on) AS mo
  FROM expenses
  WHERE {1}(vendor) = vendor
  AND IFNULL(amount_cents, 0) {2} {3}
);`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(vendor) = vendor proves the feed is stored clean — true for every entry, so the calendar sees all months. UPPER would demand shouting vendors and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the entry gate direction",
        why: "The gate keeps real entries, so the test is > 0. Flipping to < 0 would demand negative expenses and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open entry floor",
        why: "A floor of 0 admits every entry. A 300000 floor would keep only August's 321000 spike and count a single month.",
      },
    ],
    distractors: ["UPPER", "300000"],
    walkthrough:
      "The storage check passes every vendor clean, and the distinct-month count answers 14 — the expense feed has posted every month since the book opened. UPPER would fail every stored vendor and blank the calendar. The 300000 floor would collapse the read to August's single spike. The spend calendar: 14 months.",
  },
  {
    id: "cs-1326",
    tier: "medium",
    topic: "t2",
    universe: "expense",
    title: "The second-half debit split",
    brief:
      "From: Expense report. Re: the second-half ledger.\n\nThe debit census reruns on the second half of the book — entries posted after mid-2024. Surface the debit-only lines with NULLIF, group per account, and keep the accounts above twelve lines.",
    ask: "Accounts with more than 12 debit-only lines after mid-2024.",
    template: `SELECT account, n
FROM (
  SELECT account, COUNT(*) AS n
  FROM ledger_entries
  WHERE NULLIF(credit_cents, 0) IS NULL
  AND entry_date {1} {2}
  GROUP BY account
)
WHERE n {3} {4};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the window direction",
        why: "The second half starts after mid-2024, so the test is >. Flipping to < would census the first-half ledger instead.",
      },
      {
        answer: "'2024-06-30'",
        kind: "keyword",
        noVerify: true,
        label: "the window edge",
        why: "The edge sits at mid-2024 — entries from July on count. A 2025 edge would keep only the final weeks and shrink every account.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the weight gate",
        why: "The report keeps accounts at or above the five-line weight, so the gate is >=. Flipping to < 5 would census the light accounts instead.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the weight line",
        why: "The line sits at 5 — all three accounts clear it in the second half with eight lines apiece. A 13-line would keep none and blank the split.",
      },
    ],
    distractors: ["'2025-01-01'", "13", "<"],
    walkthrough:
      "The second-half window keeps the entries posted after mid-2024, and the debit-only census splits by account with the five-line gate: accounts_receivable, cash and operating_expenses all carry exactly eight second-half debit lines — a perfectly even split. The 2025 edge would slice the window to the final weeks and shrink every count. The flipped window or the < gate would read the ledger backwards, and the 13-line would blank the split. The second-half split: three accounts at eight apiece.",
  },
  {
    id: "cs-1327",
    tier: "easy",
    topic: "t2",
    universe: "fraud",
    title: "The pending-month map",
    brief:
      "From: Fraud spot-check. Re: the pending spread.\n\nPending orders cluster in some months and skip others. Filter the lane, keep the real lines, and count the distinct months the pending book touches — with the month grain proved by the seven-character guard.",
    ask: "How many distinct months carry a pending order?",
    template: `SELECT COUNT(*) AS pending_months
FROM (
  SELECT DISTINCT strftime('%Y-%m', created_at) AS mo
  FROM orders
  WHERE IFNULL(status, 'x') = {1}
  GROUP BY mo
  HAVING COUNT(*) {2} {3}
)
WHERE LENGTH(mo) = {4};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the lane gate",
        why: "The map tracks the pending lane, and the IFNULL fold keeps a NULL status from slipping past as something else. A 'cancelled' fill would map the five-month cancellation spread instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the weight gate",
        why: "The map keeps months with any pending weight, so the HAVING test is > 0. Flipping to < 0 would demand negative counts and empty the map.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the weight floor",
        why: "A floor of 0 admits all ten pending months. A 1-floor would keep only the four months that carried a pair.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the grain guard",
        why: "A '%Y-%m' label is exactly seven characters, so the guard passes every real bucket. A 3-fill would demand three-character labels and match nothing.",
      },
    ],
    distractors: ["'cancelled'", "1", "3"],
    walkthrough:
      "The pending lane spreads across ten distinct months — a wider map than the cancelled lane's five. The 'cancelled' fill would draw the wrong spread entirely. The line gate stays open; the 300 floor would shrink the map to the expensive pending orders. And the seven-character guard proves the stage grouped at the month grain — the 5-fill matches nothing. The pending map: 10 months.",
  },
  {
    id: "cs-1328",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The vintage leaderboard",
    brief:
      "From: Month-end close. Re: the vintage board.\n\nThe vintage board ranks the issue years by their unpaid load. Catch the never-paid invoices with the zero-fill, group by year, keep the years carrying any unpaid balance, and read the board heaviest-first.",
    ask: "The issue years ranked by unpaid-invoice count.",
    template: `SELECT strftime('%Y', issued_on) AS yr, COUNT(*) AS unpaid
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE IFNULL(p.amount_cents, 0) = 0
GROUP BY yr
HAVING unpaid {1} {2}
ORDER BY unpaid {3}, yr;`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the load gate",
        why: "The board keeps years with any unpaid balance, so the test is > 0. Flipping to < 1 would demand negative loads and blank the board.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the load floor",
        why: "The floor of 0 admits both vintages — 2025's four and 2024's two. A 3-floor would keep 2025 alone.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "The heaviest vintage leads the board, so the sort is descending. ASC would open on 2024's pair.",
      },
    ],
    distractors: ["<", "3", "ASC"],
    walkthrough:
      "The zero-fill catches the six never-paid invoices, and the vintage board ranks the years carrying them: 2025 with four, 2024 with two. The < 1 fill would demand negative loads and blank the board. The 3-floor would drop 2024 and leave the board one line short. DESC keeps the heaviest vintage on top. The vintage board: 2025 first at four.",
  },
  {
    id: "cs-1329",
    tier: "medium",
    topic: "t2",
    universe: "refund-audit",
    title: "The premium stuck queue",
    brief:
      "From: Refund audit. Re: the expensive stuck orders.\n\nThe refund team works the expensive end of the stuck queue — orders past 400 euros with no ship timestamp and no cancellation. Test the sentinel, gate the total, and exclude the never-shipping lane.",
    ask: "How many orders over 400 euros have no ship timestamp and are not cancelled?",
    template: `SELECT COUNT(*) AS premium_stuck
FROM orders
WHERE IFNULL(shipped_at, 'x') = 'x'
AND total {1} {2}
AND status {3} {4};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the premium direction",
        why: "The premium queue starts above the line, so the test is >. Flipping to < 400 would census the budget stuck orders instead.",
      },
      {
        answer: "400",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "The line sits at 400 — the stuck pending orders clear it in small numbers. A 300-line would widen the queue.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the lane scope",
        why: "The queue scopes to the lane that may still ship, so the test is status = 'pending'. Flipping the scope with != would mix the never-shipping lane in.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the scoped lane",
        why: "Pending is the lane the refund team can still influence. A 'cancelled' scope would count the dead lane, and 'shipped' would count nothing at all.",
      },
    ],
    distractors: ["300", "'shipped'", "'cancelled'"],
    walkthrough:
      "The sentinel catches the twenty-one never-shipped orders, the 400-line narrows to the premium tail, and the pending scope keeps the lane the refund team can actually influence. The 300-line would widen the queue. The 'shipped' scope would count nothing — shipped orders carry no sentinel — and the 'cancelled' scope would profile the dead lane. The premium stuck queue: the pending lines over 400.",
  },
  {
    id: "cs-1330",
    tier: "hard",
    topic: "t2",
    universe: "expense",
    title: "The opex debit book",
    brief:
      "From: Expense report. Re: the operating-expense discipline.\n\nA healthy ledger is strictly one-sided: every entry carries a debit or a credit, never both. Count the operating-expense entries where the credit side nullifies to nothing — the debit lines — across the book's full first two years.",
    ask: "How many operating-expense ledger entries through the 2024 close have an empty credit side?",
    template: `SELECT COUNT(*) AS opex_debits
FROM ledger_entries
WHERE NULLIF(credit_cents, 0) IS NULL
AND account = {1}
AND entry_date BETWEEN {2} AND {3};`,
    slots: [
      {
        answer: "'operating_expenses'",
        kind: "keyword",
        label: "the opex gate",
        why: "The discipline check runs on the operating-expense account, so the gate is account = 'operating_expenses'. A 'cash' fill would census the cash account's debit lines instead.",
      },
      {
        answer: "'2024-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the window floor",
        why: "The window opens with the book — its first entry posts in early 2024. A mid-2024 floor would slice the debit count down.",
      },
      {
        answer: "'2025-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the close ceiling",
        why: "The close books through 2024, so the ceiling sits at the year boundary — January and February 2025 post later. A mid-2025 ceiling would keep the whole book.",
      },
    ],
    distractors: ["'cash'", "'2024-07-01'", "'2025-06-01'"],
    walkthrough:
      "NULLIF turns every zero credit into a real NULL, and the opex gate counts the debit lines inside the 2024 close: twelve — one for every month of the year. The cash fill would census the cash account's thirteen instead. The mid-2024 floor would halve the window, and the mid-2025 ceiling would keep the whole book including the two 2025 posts. The opex debit book through 2024: 12 lines, one side each.",
  },
  {
    id: "cs-1331",
    tier: "easy",
    topic: "t3",
    universe: "month-close",
    title: "The book's span",
    brief:
      "From: Month-end close. Re: the calendar footprint.\n\nThe ops calendar must cover the whole book, and its footprint is the span from the first order to the last. Fold the dates to day numbers, take the extremes, and read the span.",
    ask: "The number of days from the first to the last order.",
    template: `SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS span_days
FROM orders
WHERE {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last order, so the leading fold is MAX. MIN there would subtract the latest from the earliest and report a negative calendar.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first order, so the subtrahend is MIN. MAX would duplicate the late extreme and read zero days.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps carry no time-of-day noise — the span reads in whole days. JULIANDAY would compare a number to text and match nothing.",
      },
    ],
    distractors: ["MIN", "MAX", "JULIANDAY"],
    walkthrough:
      "julianday turns both extremes into day numbers, and the subtraction spans 423 days — from the book's first order on 2024-01-01 to its last on 2025-02-27. Swapping the folds would report a negative calendar, and duplicating the late extreme would read zero. The grain check passes every date-only stamp — the JULIANDAY fill would compare a number to text and empty the scan. The calendar footprint: 423 days.",
  },
  {
    id: "cs-1332",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The roster's span",
    brief:
      "From: Growth lead. Re: the acquisition footprint.\n\nThe acquisition story has a footprint too: the span from the roster's first signup to its last. Fold the signup dates, take the extremes, and read the span.",
    ask: "The number of days from the first to the last signup.",
    template: `SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS span_days
FROM customers
WHERE {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last signup, so the leading fold is MAX. MIN there would flip the calendar negative.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first signup, so the subtrahend is MIN. MAX would duplicate the late extreme.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean. JULIANDAY would compare a number to text and match nothing.",
      },
    ],
    distractors: ["MIN", "MAX", "JULIANDAY"],
    walkthrough:
      "The signup extremes fold to day numbers and the subtraction spans 244 days — Alice's November 2023 signup to Pedro's July 2024 signup. Swapped folds would read negative, and duplicated extremes would read zero. The grain check passes every date-only stamp; the JULIANDAY fill would empty the scan. The acquisition footprint: 244 days.",
  },
  {
    id: "cs-1333",
    tier: "medium",
    topic: "t3",
    universe: "funnel",
    title: "The shipping calendar",
    brief:
      "From: Growth lead. Re: the ship-day count.\n\nOrders ship on shared days — 82 shipped orders landing on fewer calendar days. Count the distinct ship dates the measurable orders carry, with the total gate open.",
    ask: "How many distinct days carry at least one shipment?",
    template: `SELECT COUNT(DISTINCT {1}(shipped_at)) AS ship_days
FROM orders
WHERE shipped_at {2} NULL
AND total {3} {4};`,
    slots: [
      {
        answer: "DATE",
        kind: "keyword",
        label: "the day slicer",
        why: "Shipments share calendar days, so the slicer truncates to DATE. A year chop would collapse the calendar to two buckets — a shipping calendar nobody can staff against.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the measurable test",
        why: "Only shipped orders carry a date, so the test is IS NOT NULL. IS NULL would keep the never-shipped rows and count zero days.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate admits every shipment, so the test is > 0. Flipping to < 0 would demand negative totals and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps every shipment in the calendar. A 400 floor would keep only the premium shipments and shorten it.",
      },
    ],
    distractors: ["strftime('%Y', shipped_at)", "IS", "400"],
    walkthrough:
      "DATE slices the 82 measurable shipments onto their calendar days, and the distinct count lands on 75 — shipments share days, and the calendar compresses by seven. The JULIANDAY fill would keep per-row numbers and count 82 separate days. The IS NULL fill would keep only the never-shipped rows, whose dates are NULL. And the total gate stays open so the calendar covers the whole book. The shipping calendar: 75 days.",
  },
  {
    id: "cs-1334",
    tier: "easy",
    topic: "t3",
    universe: "expense",
    title: "The Monday settlements",
    brief:
      "From: Finance review. Re: the payment rhythm.\n\nSettlements land on weekdays by design — the rhythm question is how many cleared on a Monday. Code the payment dates with strftime's %w and count the Monday lines.",
    ask: "How many payments settled on a Monday?",
    template: `SELECT COUNT(*) AS monday_settles
FROM payments
WHERE strftime('%w', {1}) = {2}
AND method = {3};`,
    slots: [
      {
        answer: "paid_on",
        kind: "keyword",
        label: "the settlement date",
        why: "The rhythm reads the settlement date, so the chop runs on paid_on. Chopping invoice_id would feed an id to strftime and match nothing.",
      },
      {
        answer: "'1'",
        kind: "keyword",
        label: "the Monday code",
        why: "strftime codes Monday as 1 — the busiest settlement day. A '0' fill would count the two Sunday settlements instead.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the method gate",
        why: "The rhythm read scopes to the card lane, so the gate is method = 'card'. A 'wire' fill would count the wires that cleared that day instead.",
      },
    ],
    distractors: ["invoice_id", "'0'", "'wire'"],
    walkthrough:
      "strftime codes the week 0–6 with Monday at 1, and eleven card settlements cleared on a Monday — the card ledger's strongest rhythm. Chopping invoice_id would feed strftime an id and count nothing. The '0' fill would count the Sunday settlements, and the wire fill would read the other method's rhythm. The card payment rhythm: 11 Monday settlements.",
  },
  {
    id: "cs-1335",
    tier: "medium",
    topic: "t3",
    universe: "funnel",
    title: "The completed-lane histogram",
    brief:
      "From: Growth lead. Re: the delivered speed spread.\n\nThe delivered lane carries its own speed spread, and the histogram shows it. Compute each delivered order's day-gap, bucket the counts, and keep the buckets with real weight.",
    ask: "The day-gap histogram for delivered orders.",
    template: `SELECT d, n
FROM (
  SELECT CAST(julianday(shipped_at) - julianday(created_at) AS INTEGER) AS d, COUNT(*) AS n
  FROM orders
  WHERE status = {1}
  GROUP BY d
)
WHERE n {2} {3};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed gate",
        why: "The histogram profiles completed work, so the gate is status = 'delivered'. The 'shipped' fill would profile the in-flight lane instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the weight gate direction",
        why: "The histogram keeps buckets with any weight, so the test is > 0. Flipping to < 0 would demand negative counts and empty it.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open weight floor",
        why: "A floor of 0 keeps all three buckets — 19, 18 and 15. A 17-floor would drop the four-day bucket.",
      },
    ],
    distractors: ["'shipped'", "17"],
    walkthrough:
      "The delivered lane's gaps bucket cleanly: 19 orders at two days, 18 at three, 15 at four — a histogram weighted toward the fast end. The 'shipped' fill would profile the in-flight lane's different spread. The 17-floor would drop the four-day bucket and hide the slow tail. The delivered histogram: 19, 18, 15.",
  },
  {
    id: "cs-1336",
    tier: "hard",
    topic: "t3",
    universe: "growth",
    title: "The 2024 weekend read",
    brief:
      "From: Growth lead. Re: the year-scoped weekend.\n\nThe whole-book weekend count blends years; the staffing plan wants 2024 alone. Code the order dates with %w, keep the weekend codes, and scope the read to the year boundary.",
    ask: "How many 2024 orders landed on a weekend day?",
    template: `SELECT COUNT(*) AS weekend_24
FROM orders
WHERE strftime('%w', created_at) {1} ({2})
AND strftime('%Y', created_at) = {3};`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the weekend test",
        why: "The weekend is two codes — 0 for Sunday, 6 for Saturday — so the test is IN. NOT IN would census the five weekdays instead.",
      },
      {
        answer: "'0', '6'",
        kind: "keyword",
        label: "the weekend codes",
        why: "The pair covers Sunday and Saturday. A '0'-only list would shave Saturday off the read.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the year scope",
        why: "The plan scopes to 2024 — twenty-two weekend orders. A '2025' fill would count the new year's two weekend orders instead.",
      },
    ],
    distractors: ["NOT IN", "'0'", "'2025'"],
    walkthrough:
      "Scoped to 2024, the weekend codes catch twenty-two orders — Sunday and Saturday lines only, out of the year's ninety. NOT IN would flip the read to the sixty-eight weekday orders. The '0'-only list would shave Saturday, and the 2025 scope would count the new year's two weekend orders. The 2024 weekend read: 22.",
  },
  {
    id: "cs-1337",
    tier: "hard",
    topic: "t3",
    universe: "growth",
    title: "The late-month openers",
    brief:
      "From: Growth lead. Re: the first-purchase timing.\n\nMembers who opened their account's order history late in a month behave differently — or so the hypothesis goes. Stage each member's first order date and count the openers from the month's second half.",
    ask: "How many members placed their first order on the 15th or later?",
    template: `SELECT COUNT(*) AS late_openers
FROM (
  SELECT {1}(created_at) AS first_order
  FROM orders
  GROUP BY customer_id
)
WHERE CAST(strftime('%d', first_order) AS INTEGER) {2} {3};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the opener fold",
        why: "The opener is each member's earliest order, so the stage folds with MIN. MAX would stage the latest orders and profile the wrong day.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the late-month test",
        why: "The month's second half starts on the 15th, so the test is >=. Flipping to < 15 would census the early-month openers instead.",
      },
      {
        answer: "15",
        kind: "number",
        noVerify: true,
        label: "the mid-month edge",
        why: "The edge sits at 15 — seven members opened late. A 20-edge would drop the mid-month openers and shrink the count.",
      },
    ],
    distractors: ["MAX", "20"],
    walkthrough:
      "MIN stages every member's opener, and the >= 15 test counts seven members whose first order landed in the month's second half. MAX would stage the latest orders — a churn profile, not an acquisition one. The 20-edge would drop the 15th-to-19th openers and understate the late cohort. The late-month openers: seven members.",
  },
  {
    id: "cs-1338",
    tier: "medium",
    topic: "t3",
    universe: "month-close",
    title: "The mid-month shippable",
    brief:
      "From: Billing lead. Re: the mid-month slice.\n\nThe mid-month slice — orders placed on the 15th — needs its shippable count: lines that carry a real ship timestamp. Slice the day-of-month, keep the 15th, and count the shippable lines.",
    ask: "How many orders placed on the 15th are in the shipped lane?",
    template: `SELECT COUNT(*) AS midmonth_inflight
FROM orders
WHERE strftime('%d', created_at) = {1}
AND shipped_at {2} NULL
AND IFNULL(status, 'x') = {3};`,
    slots: [
      {
        answer: "'15'",
        kind: "keyword",
        label: "the mid-month day",
        why: "The slice targets the 15th — strftime renders it '15'. A '06' fill would slice the sixth — the busiest in-flight day at three — instead.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the measurable test",
        why: "The in-flight slice needs a real ship timestamp, so the test is IS NOT NULL. IS NULL would keep the never-shipped rows and count nothing.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight lane",
        why: "The read targets the lane that moved but has not landed — shipped. A 'delivered' fill would count the landed 15ths instead.",
      },
    ],
    distractors: ["'06'", "'delivered'", "'pending'", "=", "IS"],
    walkthrough:
      "The day slice lands on the 15th, the presence test keeps the measurable rows, and the lane gate scopes to shipped — one order left the building on a 15th and has not landed. The '06' fill would slice the sixth, the busiest in-flight day at three. The 'delivered' fill would count the two landed 15ths, and 'pending' would count nothing — pending orders carry no timestamp. The IS flip would read the never-shipped rows. The mid-month in-flight slice: one shipped order.",
  },
  {
    id: "cs-1339",
    tier: "hard",
    topic: "t3",
    universe: "growth",
    title: "The first-quarter cohort",
    brief:
      "From: Growth lead. Re: the Q1 acquisition read.\n\nThe Q1 cohort is the members who joined in a first quarter — months one through three. Slice the signup months, bound the window, and count the cohort.",
    ask: "How many customers signed up in a first quarter?",
    template: `SELECT COUNT(*) AS q1_signups
FROM customers
WHERE CAST(strftime('%m', created_at) AS INTEGER) {1} {2}
AND {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the quarter ceiling",
        why: "Q1 ends at month three, so the test is <= 3. Flipping to > 3 would census the second- and third-quarter joiners instead.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the quarter boundary",
        why: "The boundary sits at month 3 — six members joined in Q1. A 2-boundary would drop March's pair.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean, so the month slice reads whole days. JULIANDAY would compare a number to text and match nothing.",
      },
    ],
    distractors: ["2", "JULIANDAY"],
    walkthrough:
      "The month slice bounds Q1 at three, and six members joined in first quarters — the November and December 2023 signups sit outside the window, the January-through-March 2024 pair inside it. The 2-boundary would drop March. And the grain check passes every date-only stamp — the JULIANDAY fill would compare a number to text and empty the cohort. The Q1 cohort: six members.",
  },
  {
    id: "cs-1340",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The cohort pace",
    brief:
      "From: Growth lead. Re: the monthly pace line.\n\nThe acquisition pace is the average signups per active month, rounded for the board deck. Stage the monthly census and read the pace.",
    ask: "Average signups per month, rounded to 2 decimals.",
    template: `SELECT ROUND(AVG(n), {1}) AS pace
FROM (
  SELECT COUNT(*) AS n
  FROM customers
  GROUP BY strftime('%Y-%m', {2})
)
WHERE n {3} {4};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the rounding precision",
        why: "The deck reads two decimals — 1.78. Rounding to 1 would print 1.8 and blur the pace.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the signup date",
        why: "The pace reads signup months, so the chop runs on created_at. customers carries no shipped_at — the wrong column would fail to compile.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the month gate direction",
        why: "The gate keeps real cohort months, so the test is > 0. Flipping to < 0 would demand negative counts and empty the pace.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open month floor",
        why: "A floor of 0 admits every cohort month — nine in all. A 2-floor would drop the single-signup months and flatter the pace.",
      },
    ],
    distractors: ["1", "shipped_at", "2"],
    walkthrough:
      "The monthly census stages nine cohort months — two signups a month through May, then singletons — and the average lands on 1.78 at two decimals. The 1-decimal fold would print 1.8 and blur the pace line. The shipped_at fill would fail to compile against the roster. And the 2-floor would drop the singleton months and flatter the pace. The cohort pace: 1.78.",
  },
  {
    id: "cs-1341",
    tier: "easy",
    topic: "t4",
    universe: "expense",
    title: "The expense crown month",
    brief:
      "From: Expense report. Re: the biggest spend month.\n\nThe expense book has its own calendar, and one month outspent the rest. Bucket the spend by month, rank the pots, and read the crown line.",
    ask: "The month with the highest total expense.",
    template: `SELECT mo, pot
FROM (
  SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) AS pot
  FROM expenses
  GROUP BY mo
)
WHERE pot {1} {2}
ORDER BY pot {3}
LIMIT {4};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the pot gate direction",
        why: "The gate keeps real spend months, so the test is > 0. Flipping to < 0 would demand negative spend and empty the race.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open pot floor",
        why: "A floor of 0 admits every month. A 350000 floor would exceed even August's 321000 spike and empty the race.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown direction",
        why: "The crown sits atop the biggest pot, so the sort is descending. ASC would crown the leanest month.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the crown cut",
        why: "The read wants the single crown line, so the cut is 1. A cut of 3 would return the podium and soften the call.",
      },
    ],
    distractors: ["350000", "ASC"],
    walkthrough:
      "The expense book buckets into fourteen months, and the crown reads: 2024-08 at 321000 cents — the single outspend, well clear of the 191700 runner-up. The 350000 floor would exceed the crown itself and empty the race. ASC would crown the leanest month, and a cut of 2 would return the podium. The expense crown: August 2024, 321000 cents.",
  },
  {
    id: "cs-1342",
    tier: "medium",
    topic: "t4",
    universe: "expense",
    title: "The spike month count",
    brief:
      "From: Expense report. Re: the spike detector.\n\nMost months spend modestly; the spike detector flags the months whose pot cleared 200000 cents. Stage the monthly pots, apply the spike bar, and count the flagged lines inside the book's window.",
    ask: "How many months saw expenses above 200000 cents?",
    template: `SELECT COUNT(*) AS big_months
FROM (
  SELECT strftime('%Y-%m', spent_on) AS mo, SUM(amount_cents) AS pot
  FROM expenses
  GROUP BY mo
)
WHERE pot {1} {2}
AND LENGTH(mo) {3} {4};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the spike test",
        why: "A spike clears the bar, so the test is > 200000. Flipping to < 200000 would count the modest months instead.",
      },
      {
        answer: "200000",
        kind: "number",
        noVerify: true,
        label: "the spike bar",
        why: "The bar sits at 200000 — August's 321000 clears it alone. A 150000 bar would flag the steady months too.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the grain guard",
        why: "A '%Y-%m' label is exactly seven characters, so the guard is LENGTH(mo) = 7. Flipping to < 7 would demand shorter labels and match nothing.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the grain length",
        why: "The grain length sits at 7 — four digits, a dash, two digits. A 5-fill would demand five-character labels and match nothing.",
      },
    ],
    distractors: ["150000", "400000", "<", "5"],
    walkthrough:
      "The monthly pots stage fourteen lines, and the 200000-cent spike bar flags exactly one: August 2024 at 321000. The 150000 bar would flag the steady months too, and a 400000 bar would exceed the spike and flag nothing. The seven-character grain guard proves the stage grouped at the month bucket — the 5-fill matches nothing. The spike detector: one month.",
  },
  {
    id: "cs-1343",
    tier: "easy",
    topic: "t4",
    universe: "expense",
    title: "The issue-month census",
    brief:
      "From: Finance review. Re: the billing calendar.\n\nThe billing calendar counts the distinct months the invoice ledger issued into. Chop the issue dates, dedupe the months, and count — with the lane gate proving the read runs on the open book's terms.",
    ask: "How many distinct months saw an open invoice issued?",
    template: `SELECT COUNT(*) AS issue_months
FROM (
  SELECT DISTINCT strftime('%Y-%m', {1}) AS mo
  FROM invoices
  WHERE status = {2}
  AND {3}(number) = number
);`,
    slots: [
      {
        answer: "issued_on",
        kind: "keyword",
        label: "the issue date",
        why: "The billing calendar reads issue dates, so the chop runs on issued_on. Chopping number would feed invoice text to strftime and yield one NULL bucket.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the lane gate",
        why: "The census reads the open book's footprint — four months. A 'paid' fill would count the settled ledger's wider spread instead.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(number) = number proves the invoice numbers are stored clean — true for the ledger. UPPER would demand shouting numbers and match nothing.",
      },
    ],
    distractors: ["number", "'paid'", "LOWER"],
    walkthrough:
      "The issue-date chop keys one bucket per month, and the open book's footprint covers four months — the six open balances cluster their issuance. Chopping the invoice number would feed strftime invoice text and yield a single NULL bucket. The 'paid' fill would census the settled ledger's spread, and UPPER would fail every stored number. The open book's billing calendar: four months.",
  },
  {
    id: "cs-1344",
    tier: "medium",
    topic: "t4",
    universe: "expense",
    title: "The settlement years",
    brief:
      "From: Finance review. Re: the card ledger's years.\n\nThe card ledger spans two calendar years, and the review reads its shape. Filter the card lane, keep the real settlements, group by year, and rank the years busiest-first.",
    ask: "The card settlements grouped by year, busiest first.",
    template: `SELECT strftime('%Y', paid_on) AS yr, COUNT(*) AS settles
FROM payments
WHERE method = {1}
AND amount_cents {2} {3}
GROUP BY yr
ORDER BY settles {4};`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card lane",
        why: "The review reads the card ledger, so the gate is method = 'card'. A 'wire' fill would read the eleven wire settlements instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate keeps real settlements, so the test is > 0. Flipping to < 0 would demand negative payments and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every card settlement. A 200000 floor would keep only the six-figure lines and shrink both years.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the year order",
        why: "The busiest year lists first, so the sort is descending. ASC would lead with the lighter year.",
      },
    ],
    distractors: ["'wire'", "200000", "ASC"],
    walkthrough:
      "The card lane's settlements split across two calendar years, and the busiest-first board reads the ledger's shape in two lines. The 'wire' fill would read the eleven wire settlements — a different rhythm. The 200000 floor would keep only the six-figure lines, and ASC would lead with the lighter year. The card ledger: two years, busiest first.",
  },
  {
    id: "cs-1345",
    tier: "hard",
    topic: "t4",
    universe: "growth",
    title: "The second-quarter cohort",
    brief:
      "From: Growth lead. Re: the Q2 read.\n\nThe second-quarter cohort joined in months four through six — the window the growth plan staffs for. Slice the signup months twice: a floor at four and a ceiling at six.",
    ask: "How many customers signed up in a second quarter?",
    template: `SELECT COUNT(*) AS q2_cohort
FROM customers
WHERE CAST(strftime('%m', created_at) AS INTEGER) {1} {2}
AND CAST(strftime('%m', created_at) AS INTEGER) {3} {4};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the quarter floor",
        why: "Q2 opens at month four, so the floor test is >=. Flipping to <= 4 would open the window to every earlier month.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the quarter start",
        why: "Q2 starts at month 4 — April's pair leads the cohort. A 5-floor would drop April and start the window at May.",
      },
      {
        answer: "<=",
        kind: "keyword",
        label: "the quarter ceiling",
        why: "Q2 closes at month six, so the ceiling test is <=. Flipping to >= 6 would demand June onward and cut April and May.",
      },
      {
        answer: "6",
        kind: "number",
        noVerify: true,
        label: "the quarter end",
        why: "Q2 ends at month 6 — June's single signup closes the cohort. A 5-ceiling would drop June.",
      },
    ],
    distractors: ["5", "3", "7"],
    walkthrough:
      "The double slice frames months four through six, and the cohort counts five: April's pair, May's pair, June's single. The 5-floor would drop April, the 3-floor would drag March in, and the 7-ceiling would pull July — a window that isn't a quarter. The Q2 cohort: five members.",
  },
  {
    id: "cs-1346",
    tier: "easy",
    topic: "t4",
    universe: "growth",
    title: "The September spotlight",
    brief:
      "From: Growth lead. Re: the September lanes.\n\nSeptember 2024 was the co-champion month, and the spotlight breaks its nine orders into lanes. Slice the bucket, count per status, and read the busiest lane.",
    ask: "The busiest status lane in September 2024.",
    template: `SELECT status, COUNT(*) AS n
FROM orders
WHERE strftime('%Y-%m', created_at) = {1}
AND total {2} {3}
GROUP BY status
ORDER BY n {4}
LIMIT {5};`,
    slots: [
      {
        answer: "'2024-09'",
        kind: "keyword",
        label: "the spotlight bucket",
        why: "The spotlight targets September 2024 — the co-champion month. The '2024-02' fill would break February's lanes instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the line gate direction",
        why: "The gate keeps real lines, so the test is > 0. Flipping to < 0 would demand negative totals and empty the spotlight.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open line floor",
        why: "A floor of 0 admits every September line. A 400 floor would drop the cheap lanes and reshape the count.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the spotlight order",
        why: "The busiest lane leads the spotlight, so the sort is descending. ASC would lead with the quietest lane.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the headline cut",
        why: "The spotlight reads one headline lane, so the cut is 1. A cut of 4 would return every lane and dodge the call.",
      },
    ],
    distractors: ["'2024-02'", "400", "ASC"],
    walkthrough:
      "September's nine orders split into lanes, and the busiest reads delivered at seven — the completed-work headline the spotlight leads with. The February fill would break a different month's lanes. The 400 floor would drop the cheap lines and reshape the counts. ASC would lead with the quietest lane, and a cut of 2 would return the runner-up too. The September headline: delivered, seven orders.",
  },
  {
    id: "cs-1347",
    tier: "hard",
    topic: "t4",
    universe: "growth",
    title: "The pair-month census",
    brief:
      "From: Growth lead. Re: the pairing rhythm.\n\nThe roster joined in pairs for seven straight months before the singletons arrived. Stage the monthly signup census, keep the months at exactly two, and count the pairing rhythm — excluding nothing by label.",
    ask: "How many months saw exactly two signups?",
    template: `SELECT COUNT(*) AS pair_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM customers
  GROUP BY mo
)
WHERE n {1} {2}
AND mo {3} {4};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the pair test",
        why: "A pairing month is exactly two signups, so the test is = 2. Flipping to > 2 would demand three-signup months the roster never recorded.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the pair bar",
        why: "The bar sits at 2 — seven months joined in pairs. A 1-bar would count the two singleton months instead.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the calendar floor",
        why: "The rhythm spans the whole calendar, so the floor keeps every bucket from the first month on. Flipping to < would demand months before the roster opened.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        noVerify: true,
        label: "the calendar floor value",
        why: "The floor value predates no real month — every bucket clears 2024-01 or belongs to 2023, which sorts before it. A '2024-04' floor would slice the rhythm's opening months.",
      },
    ],
    distractors: ["1", "'2024-04'"],
    walkthrough:
      "The monthly census stages nine buckets, and the = 2 test counts seven pair months — the roster joined in pairs from November 2023 through May 2024 before the singletons arrived. The 1-bar would count June and July instead, the opposite rhythm. The '2024-04' floor would slice away the opening pairs and break the run. The pairing rhythm: seven months.",
  },
  {
    id: "cs-1348",
    tier: "medium",
    topic: "t4",
    universe: "expense",
    title: "The pending pot",
    brief:
      "From: Finance review. Re: the open-order exposure.\n\nPending orders are booked revenue at risk, and the exposure read totals their book. Filter the lane, keep the real lines, and sum the pot — the number the risk team quotes.",
    ask: "Total value of pending orders.",
    template: `SELECT {4}(SUM(total), 2) AS pending_pot
FROM orders
WHERE status = {1}
AND DATE(created_at) {2} {3};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the risk lane",
        why: "The exposure reads the pending lane, so the gate is status = 'pending'. A 'shipped' fill would sum the in-flight book — a different risk.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the calendar gate direction",
        why: "The gate covers the whole pending history — orders from the launch onward — so the test is > '2023-01-01'. Flipping to < would demand pre-launch orders and find none.",
      },
      {
        answer: "'2023-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the calendar gate value",
        why: "The value predates every order, so the gate passes the whole pending book. A '2025-01-01' gate would slice the exposure to the new year's two orders.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the euro fold",
        why: "The exposure prints in euros at two decimals, so the fold wraps in ROUND. CAST would take a single argument and the two-argument call would fail.",
      },
    ],
    distractors: ["'shipped'", "'2025-01-01'", "CAST"],
    walkthrough:
      "The pending lane's book totals 6113 euros — the exposure figure the risk team quotes, spread across fourteen open orders. The 'shipped' fill would sum the in-flight book instead. The 8000 floor would exceed the entire pot and empty the read. And the euro fold is ROUND — the CAST fill would call a one-argument function with two and fail. The pending exposure: 6113.",
  },
  {
    id: "cs-1349",
    tier: "hard",
    topic: "t4",
    universe: "month-close",
    title: "The year split",
    brief:
      "From: Month-end close. Re: the year-boundary ledger.\n\nThe book spans two calendar years, and the close splits it: 2024's ninety orders against 2025's tail. Gate the totals, group by year, exclude the dead lane, and rank the split busiest-first.",
    ask: "Order counts by year, excluding cancelled, busiest first.",
    template: `SELECT strftime('%Y', created_at) AS yr, COUNT(*) AS n
FROM orders
WHERE total {1} {2}
AND status {3} {4}
GROUP BY yr
ORDER BY n {5};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real lines, so the test is > 0. Flipping to < 0 would demand negative totals and empty the split.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every live line. A 300 floor would drop the budget orders and reshape both years.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the dead-lane test",
        why: "The close excludes cancelled orders with !=. Flipping to = would split only the dead lane — seven orders across two years.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead lane",
        why: "Cancelled is the lane the close drops. Excluding 'delivered' would keep the pending and shipped lines — a different ledger.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the split order",
        why: "The bigger year leads the split, so the sort is descending. ASC would lead with 2025's tail.",
      },
    ],
    distractors: ["300", "=", "'delivered'", "ASC"],
    walkthrough:
      "With the dead lane excluded, the year split reads 2024 at eighty-four live orders against 2025's twelve — the boundary the close books its periods on. The 300 floor would reshape both years by dropping the budget lines. The = flip would split only the seven cancellations. And ASC would lead the split with the tail year. The year split: 84 against 12.",
  },
  {
    id: "cs-1350",
    tier: "medium",
    topic: "t4",
    universe: "growth",
    title: "The Monday grid",
    brief:
      "From: Growth lead. Re: the Monday month map.\n\nMonday is the book's busiest weekday, and the month map wants its per-month footprint. Slice every order into month-and-weekday pairs, keep the Mondays, and show the months where the pair carried weight.",
    ask: "The per-month order counts for Mondays.",
    template: `SELECT mo, n
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, strftime('%w', created_at) AS wd, COUNT(*) AS n
  FROM orders
  GROUP BY mo, wd
)
WHERE n {1} {2}
AND wd = {3};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the weight gate direction",
        why: "The map keeps pairs with any weight, so the test is > 0. Flipping to < 1 would demand empty pairs and match nothing.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the weight floor",
        why: "The floor of 1 keeps every non-empty pair. A 3-floor would keep only the strong pairs and shrink the map.",
      },
      {
        answer: "'1'",
        kind: "keyword",
        label: "the Monday code",
        why: "strftime codes Monday as 1 — the busiest weekday. A '0' fill would map Sundays instead.",
      },
    ],
    distractors: ["3", "'0'"],
    walkthrough:
      "The month-and-weekday stage pairs every order into its bucket, and the Monday gate draws the grid: the months that carried Monday orders, with counts from one upward — the busiest weekday's footprint across the book. The 3-floor would keep only the strong pairs and shrink the map. And the '0' fill would map Sunday's quieter footprint instead. The Monday grid: twenty weighted pairs.",
  },
];
