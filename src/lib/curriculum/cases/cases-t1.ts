// Case batch T1 — Module 5 (scalar & window toolkit) cases cs-1201…cs-1250, wave 1.
// Topics: t1 text & type (15) / t2 COALESCE & NULLs (15) / t3 dates & calendars (10) /
// t4 month buckets (10). Figures receipt-verified in scripts/m5-cases-w1{,b,c}-out.txt.
import type { CaseStudy } from "./types";

export const casesT1: CaseStudy[] = [
  {
    id: "cs-1201",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The handle-length average",
    brief:
      "From: Growth lead. Re: signup hygiene.\n\nBefore we shorten the signup form we want to know how long our members' email handles actually are. Measure the local part — everything before the @ — by locating the @ with INSTR, then average that offset across the roster and round to two decimals.",
    ask: "Average length of the email local part (text before the @), rounded to 2 decimals.",
    template: `SELECT ROUND(AVG({1} - 1), 2) AS local_len
FROM {2}
WHERE email LIKE {3};`,
    slots: [
      {
        answer: "INSTR(email, '@')",
        kind: "keyword",
        label: "the at-probe",
        why: "INSTR(email, '@') returns the 1-based position of the @, so the handle itself is that position minus one. LENGTH(email) would count the domain too and inflate the average.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the roster table",
        why: "Emails live on the customers table. Pointing the probe at orders would compile against a table with no email column and fail outright.",
      },
      {
        answer: "'%@%'",
        kind: "keyword",
        label: "the has-an-at guard",
        why: "The arithmetic needs a real @ to locate, so the guard keeps only well-formed addresses — every roster email passes. A 'gmail%' pattern matches nobody here and the average would come back NULL.",
      },
    ],
    distractors: ["LENGTH(email)", "orders", "'gmail%'"],
    walkthrough:
      "Every email is local@domain, so INSTR(email, '@') lands one past the handle's last character; subtracting 1 yields the handle length per row, and AVG over the sixteen members rounds to 10.25 — the receipt-verified figure the form team takes away. Using LENGTH(email) instead averages the full address including @example.com, pushing the figure to 20.25 and answering a question nobody asked. The LIKE guard keeps only well-formed addresses — a 'gmail%' pattern matches nobody on this roster and the average would come back NULL. And the probe must run against customers; orders has no email column, so the query would die before returning anything. The handle average: 10.25.",
  },
  {
    id: "cs-1202",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The longest name on the roster",
    brief:
      "From: Design. Re: badge sizing.\n\nThe event badges auto-shrink type when a name is long, and we want the worst case. Find the length of the longest customer name on the roster — one LENGTH per member, then the maximum. Keep both bounds open so every member is measured.",
    ask: "Length in characters of the longest customer name.",
    template: `SELECT MAX(LENGTH(name)) AS worst_badge
FROM {1}
WHERE LENGTH(name) {2} {3}
AND region = {4};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the name source",
        why: "Names belong to customers. Products also has a name column, but badge sizing is about people, and the product table would return a different longest length entirely.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the floor direction",
        why: "The floor must admit every member: names run 9 to 14 characters, so >= 1 keeps the roster whole. Flipping to < 1 would demand sub-one-character names and return an empty badge.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the open floor",
        why: "Every member has a name of at least one character, so the floor of 1 keeps the whole roster in scope. Raising it to 15 would exclude everyone and hand back an empty verdict.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region read",
        why: "The badges print for the EU chapter first, so the read filters region = 'EU'. The APAC fill would measure a different chapter whose longest name runs twelve.",
      },
    ],
    distractors: ["products", "<", "15", "'APAC'"],
    walkthrough:
      "LENGTH(name) hands back one number per member — 9 through 14 — and MAX collapses them to the worst case: 14 characters, which belongs to Isabella Rossi of the EU chapter. The floor stays open — >= 1 passes everyone — while the flipped < 1 fill or a 15 floor would empty the roster and return NULL. Products would surface Noise-Canceling Headset at 23; a fine number, but for a headset, not a human badge. The region read matters: the APAC chapter's longest name is twelve, and a badge sized on it would clip Isabella's. The badge printer sizes to 14.",
  },
  {
    id: "cs-1203",
    tier: "medium",
    topic: "t1",
    universe: "growth",
    title: "The twelve-character club",
    brief:
      "From: CRM steward. Re: display truncation.\n\nOur CRM truncates any name past eleven characters, and we want to know how many members that bites. Count the customers whose name length is exactly 12 — the census should use LENGTH, not an eyeballed substring, and the guards should prove the record is stored clean.",
    ask: "How many customers have names exactly 12 characters long?",
    template: `SELECT COUNT(*) AS truncated
FROM customers
WHERE LENGTH(name) = {1}
AND {2}(email) = email
AND {3}(email) = email;`,
    slots: [
      {
        answer: "12",
        kind: "number",
        noVerify: true,
        label: "the truncation edge",
        why: "The CRM truncates past eleven characters, so the bitten names are exactly twelve long. Nine, ten or eleven all fit under the edge and would count the wrong cohort.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the whitespace check",
        why: "TRIM(email) = email proves no stray leading or trailing spaces ride on the address — true for every roster record. UPPER would demand an all-caps email and fail every row.",
      },
      {
        answer: "LOWER",
        kind: "keyword",
        label: "the lowercase check",
        why: "LOWER(email) = email proves the address is stored lowercase — true for every roster record. UPPER would demand shouting addresses and match nobody.",
      },
    ],
    distractors: ["24", "11", "UPPER"],
    walkthrough:
      "The roster's name lengths spread from 9 to 14, and exactly five members sit at twelve — the twelve-character club the CRM will truncate. Filtering at 11 would count the three eleven-character names instead, missing the edge entirely. The two storage guards are tautologies on this roster — every email is trim-clean and lowercase — while the UPPER fill demands shouting addresses and would zero the census. And any number dropped into a guard slot is a call that never compiles, so the club's count rides on the edge value alone. Filed: 5 members bite the truncation edge.",
  },
  {
    id: "cs-1204",
    tier: "easy",
    topic: "t1",
    universe: "catalog",
    title: "The longest shelf tag",
    brief:
      "From: Catalog ops. Re: label printer width.\n\nThe shelf-label printer wraps anything wider than its longest current tag. Feed it the length of the longest product name in the catalog — one LENGTH per product, then the maximum — and keep the price gate wide open so nothing is skipped.",
    ask: "Length of the longest product name in the catalog.",
    template: `SELECT MAX(LENGTH(name)) AS widest_tag
FROM {1}
WHERE price {2} {3}
AND LENGTH(name) >= 10;`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "Shelf tags label products. Customers also have names, but the printer rolls are for the warehouse, and the customer roster carries no price column to gate.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the price gate direction",
        why: "The gate must let every product through: prices are positive, so price > 0 passes all. Turning the gate around with < would demand negative prices and empty the catalog.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open price floor",
        why: "A floor of 0 is the widest honest gate — every catalog price clears it. A floor of 200 would exclude everything and return NULL, silently under-sizing the roll.",
      },
    ],
    distractors: ["customers", "<", "200"],
    walkthrough:
      "The catalog's longest tag is Noise-Canceling Headset at 23 characters — the number the roll must survive. The price gate stays wide open because sizing the roll to anything less risks a wrap; price > 0 passes all sixteen products, while the flipped < 0 gate or a 200 floor would empty the scan and return NULL — a printer sized by an accident. The length guard at 10 is documentation: every real tag clears it, and the audit trail shows the width check was deliberate. The answer the printer wants is 23.",
  },
  {
    id: "cs-1205",
    tier: "medium",
    topic: "t1",
    universe: "catalog",
    title: "The average shelf-tag width",
    brief:
      "From: Catalog ops. Re: label stock forecast.\n\nSizing the roll needs more than the worst case — purchasing wants the typical tag width. Average the product-name lengths across the whole catalog, rounded to two decimals, and keep the length window open so the average reflects every shelf.",
    ask: "Average product-name length, rounded to 2 decimals.",
    template: `SELECT ROUND(AVG(LENGTH(name)), {1}) AS tag_avg
FROM {2}
WHERE {3}(name) = name;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the rounding precision",
        why: "The forecast wants two decimals for week-over-week stability. Rounding to 0 would fold 17.625 to 18 and blur the trend the buyers are watching.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "Shelf tags label products. Customers also have names, but the forecast is for warehouse rolls, and the member roster averages a different width entirely.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-storage check",
        why: "TRIM(name) = name proves no tag carries stray whitespace — true for every catalog name. UPPER would demand shouting tags and match nothing, and the average would come back NULL.",
      },
    ],
    distractors: ["0", "customers", "UPPER"],
    walkthrough:
      "One scan, sixteen LENGTH values, one average: 17.63 characters per shelf tag at two decimals. The rounding precision matters — folding to 0 would report 18 and blur the very trend purchasing is tracking. The stage must run over products: the member roster carries names too, but its average width answers a badge brief, not a roll forecast. And TRIM passes every stored tag clean, while the UPPER fill demands shouting names and empties the scan. The stable figure is 17.63.",
  },
  {
    id: "cs-1206",
    tier: "easy",
    topic: "t1",
    universe: "fraud",
    title: "The 'o' roll call",
    brief:
      "From: Fraud spot-check. Re: pattern screening.\n\nWe are testing a crude screen before the real one ships: how many customer names contain the letter o anywhere? INSTR over the lowercased name finds it regardless of where it hides, and the region guard should exclude nothing so the screen sees the whole roster.",
    ask: "Count of customer names containing the letter o (case-insensitive).",
    template: `SELECT COUNT(*) AS o_names
FROM customers
WHERE {1}(LOWER(name), 'o') > {2}
AND {3}(city) = city;`,
    slots: [
      {
        answer: "INSTR",
        kind: "keyword",
        label: "the letter probe",
        why: "INSTR returns the position of the first o and 0 when the letter is absent, so testing > 0 is the containment check. UPPER would probe capital letters after a lowercase fold and match nothing.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the containment bar",
        why: "A found letter sits at position 1 or later, so the screen is INSTR(...) > 0. A bar of 1 would demand the o at first position and shrink the roll call to a single name.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-storage guard",
        why: "TRIM(city) = city proves no city name rides with stray whitespace — true for every roster city, so the screen sees the whole market. UPPER would demand shouting cities and empty the screen.",
      },
    ],
    distractors: ["UPPER", "1", "24"],
    walkthrough:
      "Lowercasing first makes the probe case-proof, and INSTR returns 0 for the five names with no o at all — so eleven members pass the screen. Raising the bar to 1 would only keep names starting with o, and the roster answers that with exactly one (Olivia). The storage guard is a tautology on this roster — every city is trim-clean — while the UPPER fill demands shouting cities and would zero the screen. And a number dropped into the guard slot is a call that never compiles, so the verdict rides on the probe and the bar. The honest verdict: 11 of 16.",
  },
  {
    id: "cs-1207",
    tier: "easy",
    topic: "t1",
    universe: "catalog",
    title: "The numbered models",
    brief:
      "From: Catalog ops. Re: model-naming audit.\n\nOur naming convention puts a model number at the end of the tag — K1, M3, X2 style. Count the products whose name ends in a digit, by slicing the final character, and keep the length and price guards loose so the audit sees the full catalog.",
    ask: "How many product names end with a digit?",
    template: `SELECT COUNT(*) AS numbered
FROM products
WHERE SUBSTR(name, {1}) IN ('0','1','2','3','4','5','6','7','8','9')
AND LENGTH(name) >= {2}
AND price < {3};`,
    slots: [
      {
        answer: "-1",
        kind: "keyword",
        label: "the tail slice",
        why: "SQLite extends SUBSTR to negative indexes: SUBSTR(name, -1) is the final character. SUBSTR(name, 1) would slice the first character and census names that begin with a digit instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the keep-all length guard",
        why: "Every product name has at least one character, so the guard LENGTH(name) >= 1 keeps the whole catalog in scope while making the slice safe.",
      },
      {
        answer: "200",
        kind: "number",
        noVerify: true,
        label: "the open price ceiling",
        why: "The priciest tag is 199.99, so a ceiling of 200 admits the whole catalog. A ceiling of 50 would silently drop half the shelves and miscount the convention.",
      },
    ],
    distractors: ["1", "25", "50"],
    walkthrough:
      "SUBSTR(name, -1) pulls each tag's last character, and four of the sixteen land in the digit list: Mechanical Keyboard K1, Wireless Mouse M3, USB-C Hub 7-in-1, Fitness Band X2. Slicing position 1 instead reads the first character — only 4K Webcam Pro starts with a digit, a different audit with a different answer. The guards stay open on purpose: a length floor of 25 exceeds the longest tag (23) and would zero the census, and a price ceiling of 50 would audit just the budget shelf. The convention audit's verdict: 4 numbered models.",
  },
  {
    id: "cs-1208",
    tier: "hard",
    topic: "t1",
    universe: "supplier",
    title: "The longest supplier letterhead",
    brief:
      "From: Supplier audit. Re: contract headers.\n\nThe contract system sizes its letterhead font by the longest supplier name on file, across every region we buy from. Report that worst-case length — one LENGTH per supplier, then the maximum — with the rating gate set wide and the clean-storage check in place.",
    ask: "Length of the longest supplier name across all regions.",
    template: `SELECT MAX(LENGTH(name)) AS letterhead
FROM suppliers
WHERE rating {1} {2}
AND region IN ('EU', 'APAC', 'US', 'LATAM')
AND {3}(name) = name;`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the rating gate direction",
        why: "The gate must let every supplier through: ratings run 3.9 to 4.8, so rating >= 0 passes all. Turning it around with <= 4 would drop both top-rated suppliers and shrink the worst case.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open rating floor",
        why: "A floor of 0 is the widest honest gate — every rating clears it. A floor of 5 would exclude the entire bench and return NULL, sizing a letterhead by an accident.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-storage check",
        why: "TRIM(name) = name proves no supplier name carries stray whitespace — true for all six. UPPER would demand an all-caps letterhead and fail every row.",
      },
    ],
    distractors: ["<=", "5", "UPPER"],
    walkthrough:
      "Six supplier names, and the longest runs 19 characters — Midwest Hardware Co — so the letterhead sizes to 19. The rating gate stays wide: >= 0 passes the whole bench, while <= 4 would silently drop Nordic Gadgets (4.6) and Alpine Audio (4.8), and a 5 floor would drop everyone. The region list carries all four codes so no supplier hides from the worst case. TRIM certifies the names are stored clean; UPPER would demand SHOUTING letterheads and measure nothing. The header font sizes to 19.",
  },
  {
    id: "cs-1209",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The surname meter",
    brief:
      "From: CRM steward. Re: two-column layouts.\n\nThe new contact cards split first and last names into columns, and the last-name column needs its own width study. Extract every surname — the text after the first space — and report the length of the longest one found, with the storage guard set to keep the whole roster.",
    ask: "Length of the longest customer surname (text after the first space).",
    template: `SELECT MAX(LENGTH(SUBSTR(name, {1} + 1))) AS longest_last
FROM customers
WHERE {2}(city) = city
AND LENGTH(name) {3} {4};`,
    slots: [
      {
        answer: "INSTR(name, ' ')",
        kind: "keyword",
        label: "the space marker",
        why: "The surname starts one past the first space, so the slice anchor is INSTR(name, ' '). A literal like 5 would be right for Emma and wrong for Dmitri — only the per-row probe generalizes.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage guard",
        why: "TRIM(city) = city proves no city rides with stray whitespace — true for every roster city, so the study sees the whole market. UPPER would demand shouting cities and empty the study.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the length gate direction",
        why: "The gate must admit every member: names run 9 to 14 characters, so >= 5 keeps the roster whole. Flipping to < 5 would demand sub-five-character names and return an empty meter.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the open length floor",
        why: "A floor of 5 sits under the shortest name (9 characters) and keeps the study whole. A floor of 15 would exclude everyone and fake an empty layout study.",
      },
    ],
    distractors: ["UPPER", "15"],
    walkthrough:
      "Slicing from the computed space marker extracts Chen, Silva, Dubois and friends; the longest surnames — O'Brien and Alvarez — both run seven characters, so the column width study lands on 7. A hard-coded anchor of 5 misreads almost everyone: Emma's surname Wilson gains a phantom character, Dmitri's slice starts mid-name, and the meter reports garbage. The storage guard is a tautology here — every city is trim-clean — while the UPPER fill demands shouting cities and measures nobody. And the length gate must stay open: a 15 floor would empty the study and fake a layout with no surnames at all. The card layout reserves 7 characters for surnames.",
  },
  {
    id: "cs-1210",
    tier: "medium",
    topic: "t1",
    universe: "month-close",
    title: "The cheapest integer tag",
    brief:
      "From: Month-end close. Re: price-point report.\n\nFinance reads the catalog in whole-euro shelf tags — every price floored by CAST to INTEGER. Report the cheapest tag in the catalog after flooring, with the stock-text guard and the letter gate in place so the scan documents its own hygiene.",
    ask: "Minimum integer price tag after CAST(price AS INTEGER).",
    template: `SELECT MIN(CAST(price AS {1})) AS cheapest_tag
FROM products
WHERE CAST(stock AS TEXT) != 'x'
AND price >= {2}
AND LENGTH(name) {3} 10;`,
    slots: [
      {
        answer: "INTEGER",
        kind: "keyword",
        label: "the floored tag type",
        why: "CAST(price AS INTEGER) truncates 18.5 to 18 — the whole-euro tag the till keys. CAST to TEXT would compare prices as words, where '149.99' sorts before '18.5' and poisons the minimum.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open price floor",
        why: "Every catalog price clears zero, so the floor keeps the scan whole. A floor of 50 would census only the premium shelves and report a fabricated cheapest tag.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the width gate direction",
        why: "The gate must let every tag through: names run 13 to 23 characters, so >= 10 passes all. Flipping to < 10 would demand sub-ten-character tags and return an empty minimum.",
      },
    ],
    distractors: ["TEXT", "50", "<"],
    walkthrough:
      "CAST truncates toward zero — 89.99 becomes 89, 18.5 becomes 18 — and the cheapest floored tag in the catalog is 14, from the 14.99 HDMI cable. Casting to TEXT instead would find the minimum by word order: '119' sorts before '14.99' because text compares character by character, and the report would crown a 119-euro product as cheapest. The stock-text guard never bites ('x' matches no stock count), the price floor of 0 keeps every shelf in scope, and the width gate >= 10 passes all sixteen tags — while the flipped < 10 gate matches nothing and would print an empty minimum. The floor figure stands: 14.",
  },
  {
    id: "cs-1211",
    tier: "medium",
    topic: "t1",
    universe: "growth",
    title: "The seven-letter market towns",
    brief:
      "From: Growth lead. Re: board-deck styling.\n\nThe board deck prints city names in full capitals for the market map, and this slide features the seven-character towns only. Render those cities uppercased, one per row, ordered so the deck reads alphabetically.",
    ask: "The seven-character cities, uppercased, in alphabetical order.",
    template: `SELECT {1}(city) AS caps
FROM {2}
WHERE LENGTH(city) = {3}
ORDER BY caps;`,
    slots: [
      {
        answer: "UPPER",
        kind: "keyword",
        label: "the caps fold",
        why: "The deck wants capitals, so the projection folds with UPPER. LOWER would render the slide in lowercase and the deck would print a different artifact.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the city source",
        why: "Cities describe customers. Orders carry no city column, so the slide would fail to compile against the wrong table.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the seven-letter cut",
        why: "The slide features seven-character towns — Chicago, Hamburg and Tallinn qualify. A cut of 9 would feature São Paulo alone; a cut of 6 would flood the slide with nine towns.",
      },
    ],
    distractors: ["LOWER", "orders", "9"],
    walkthrough:
      "Three towns run exactly seven characters — Chicago, Hamburg, Tallinn — and the caps fold renders them CHICAGO, HAMBURG, TALLINN in alphabetical order for the slide. The fold is not cosmetic: LOWER would pass the same three rows but print berlin-style labels, violating the deck spec. Note SQLite's ASCII-only fold quirk on the roster's other outlier — São Paulo uppercases to SãO PAULO, cedilla intact — though at nine characters it never reaches this slide. The cut of 9 would have featured it solo; the cut of 7 is what the brief demands.",
  },
  {
    id: "cs-1212",
    tier: "easy",
    topic: "t1",
    universe: "month-close",
    title: "The shouted status census",
    brief:
      "From: Billing lead. Re: the ops board font.\n\nThe ops board renders status labels in capitals for visibility. Keep the familiar census — delivered, shipped, pending, cancelled — but shout the labels, sort it busiest-first and cut to the single headline line the wall display shows.",
    ask: "The top status line by order count, with the label uppercased.",
    template: `SELECT {1}(status) AS shout, COUNT(*) AS n
FROM orders
GROUP BY shout
ORDER BY n {2}
LIMIT {3};`,
    slots: [
      {
        answer: "UPPER",
        kind: "keyword",
        label: "the shout fold",
        why: "The board's font spec calls for capitals, so the projection folds status with UPPER. LOWER would whisper the labels and break the board spec.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the busy-first sort",
        why: "The wall display leads with the busiest line, so the census sorts descending by count. ASC would bury delivered under cancelled and hand the board the wrong headline.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the headline cut",
        why: "The display shows one line — the busiest status. Cutting to 4 would show the whole census and defeat the headline purpose.",
      },
    ],
    distractors: ["LOWER", "ASC", "4"],
    walkthrough:
      "The census is unchanged by the shout — 52 delivered, 30 shipped, 14 pending, 7 cancelled — but the labels render DELIVERED, SHIPPED, PENDING, CANCELLED. Sorted busy-first and cut to one line, the wall headline reads DELIVERED | 52. Folding with LOWER passes the same count but prints the board in lowercase, violating the spec; sorting ASC makes CANCELLED the headline, the last thing an ops wall should lead with; cutting to 4 turns the headline into the full table. The board's morning line stays: DELIVERED, 52.",
  },
  {
    id: "cs-1213",
    tier: "medium",
    topic: "t1",
    universe: "catalog",
    title: "The digit-led tag",
    brief:
      "From: Catalog ops. Re: sorting regression.\n\nThe catalog's new sort puts digit-led tags — 4K Webcam Pro style — at the top, and QA wants to know how many tags that actually catches. Keep the names whose first character is a digit, with the length guard set low so nothing is skipped.",
    ask: "The product names that start with a digit.",
    template: `SELECT name AS digit_led
FROM products
WHERE SUBSTR(name, 1, 1) {1} ('0','1','2','3','4','5','6','7','8','9')
AND LENGTH(name) {2} {3}
ORDER BY name;`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the digit membership test",
        why: "The first character must be one of the ten digits, so IN matches the list. NOT IN would return every tag that does not start with a digit — fifteen of them, the inverse audit.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the length gate direction",
        why: "The gate must let every tag through: names run 13 to 23 characters, so >= 1 passes all. Flipping to < 1 would demand empty names and return nothing.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the open length floor",
        why: "A floor of 1 admits every real tag — the shortest is 13 characters. A floor of 25 exceeds the longest tag and would silence the audit entirely.",
      },
    ],
    distractors: ["NOT IN", "<", "25"],
    walkthrough:
      "One tag opens with a digit — 4K Webcam Pro — so the regression test expects exactly that row back, in caps for the ticket. The membership test is IN: NOT IN would hand QA fifteen tags, the entire rest of the catalog, and flood the ticket with false positives. The length gate stays wide open because the point is the first character, not the name's size; the flipped < 1 gate matches nothing at all, and a floor of 25 exceeds even the 23-character longest tag. One digit-led tag ships: 4K Webcam Pro.",
  },
  {
    id: "cs-1214",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The s-final surname check",
    brief:
      "From: CRM steward. Re: plural-name dedupe.\n\nA partner feed keeps flagging our 'plural' surnames — the ones ending in s — and we only have one. Extract the surname from each full name, slice its final character, and return the member whose surname lands on an s.",
    ask: "The customer whose surname ends with the letter s.",
    template: `SELECT {1}(name, INSTR(name, ' ') + 1) AS last
FROM customers
WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), {2}) = {3}
AND region != 'X';`,
    slots: [
      {
        answer: "SUBSTR",
        kind: "keyword",
        label: "the surname extractor",
        why: "SUBSTR(name, INSTR(name, ' ') + 1) lifts the text after the first space — the surname. REPLACE would need three arguments and would swap text, not extract it.",
      },
      {
        answer: "-1",
        kind: "keyword",
        label: "the tail slice",
        why: "SQLite's negative SUBSTR index reads from the end: position -1 is the final character. Position 1 reads the first character and would census s-initial surnames instead.",
      },
      {
        answer: "'s'",
        kind: "keyword",
        label: "the s-final test",
        why: "The feed flags plural-style surnames, so the tail character must equal s. Testing a would match the three surnames ending in a and hand the partner the wrong list.",
      },
    ],
    distractors: ["REPLACE", "1", "'a'"],
    walkthrough:
      "SUBSTR lifts each surname from its space anchor, the -1 slice reads its last character, and exactly one member's surname lands on s: Chloe Dubois, whose Dubois closes with a plural-style s. The extractor must be SUBSTR — REPLACE with two arguments is not even a legal call and the query dies. Slicing position 1 instead reads first characters, and that census belongs to Bruno Silva's s-initial surname — a different check with a different member. And the a-test would return Silva, Tanaka and Sato, three members the partner never asked about. The dedupe list holds one name: Dubois.",
  },
  {
    id: "cs-1215",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The six-letter surname club",
    brief:
      "From: CRM steward. Re: column width polling.\n\nThe contact-card layout needs to know how many members sit in the six-character surname band — the most common width on the roster. Slice every surname from its space anchor, measure it, and count the six-letter club, with the has-space guard proving the slice is safe.",
    ask: "How many customers have surnames exactly 6 characters long?",
    template: `SELECT COUNT(*) AS six_pack
FROM customers
WHERE LENGTH(SUBSTR(name, {1} + 1)) = {2}
AND {3}(name, ' ') > 0;`,
    slots: [
      {
        answer: "INSTR(name, ' ')",
        kind: "keyword",
        label: "the space anchor",
        why: "The surname begins one past the first space, so the anchor must be computed per row. A literal 5 hard-codes Emma's layout and garbles every other member's surname length.",
      },
      {
        answer: "6",
        kind: "number",
        noVerify: true,
        label: "the six-letter band",
        why: "The layout polls the six-character band — Dubois, Volkov, Nasser, Tanaka, Wright, Meyer all sit there. A band of 7 would census just O'Brien and Alvarez.",
      },
      {
        answer: "INSTR",
        kind: "keyword",
        label: "the has-space guard",
        why: "INSTR(name, ' ') > 0 proves the name carries a space before slicing. LENGTH takes a single argument, so the two-argument call fails the type contract outright.",
      },
    ],
    distractors: ["5", "7", "LENGTH"],
    walkthrough:
      "Six members wear six-letter surnames — Dubois, Volkov, Nasser, Tanaka, Wright, Meyer — the widest band on the roster and the number the layout reserves. The anchor must be INSTR(name, ' '): a literal 5 mis-slices everyone whose first name is not five letters, inflating some surnames with phantom characters and deflating others, and the count lands anywhere but 6. The band of 7 would shrink the club to O'Brien and Alvarez; the 5-band would census the five-letter surnames instead. And the guard must be INSTR — LENGTH(name, ' ') is a two-argument call to a one-argument function. The layout books 6.",
  },
  {
    id: "cs-1216",
    tier: "easy",
    topic: "t2",
    universe: "refund-audit",
    title: "The never-shipped census",
    brief:
      "From: Refund audit. Re: the stuck-orders queue.\n\nEvery order that never got a shipping timestamp is potential refund exposure. Count the orders whose shipped_at is still NULL — the queue the ops team chases — and keep the total gate open so no stuck order hides below a price line.",
    ask: "How many orders have no shipping timestamp?",
    template: `SELECT COUNT(*) AS never_shipped
FROM orders
WHERE IFNULL({1}, 'x') = 'x'
AND total {2} {3};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the shipping timestamp",
        why: "The queue is defined by a missing shipped_at, and IFNULL pushes those NULLs to the 'x' sentinel the test catches. IFNULL(status, 'x') would push nothing — status is NOT NULL — and report a queue that never existed.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must let every stuck order through: totals are positive, so total > 0 passes all. Flipping to < 0 would demand negative totals and empty the queue.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 is the widest honest gate — every stuck order clears it. A floor of 300 would census only the expensive stuck orders and understate the exposure.",
      },
    ],
    distractors: ["status", "<", "300"],
    walkthrough:
      "Twenty-one orders carry no shipping timestamp — the fourteen pending and seven cancelled — and that is the queue refund operations chases. IFNULL pushes each missing shipped_at to the 'x' sentinel, and the = 'x' test catches exactly those rows; swapping the column for status would push nothing (status is NOT NULL by contract) and report a clean bill the queue never earned. The total gate stays wide open because exposure is exposure at any price; the flipped < 0 gate or a 300 floor would shrink the queue to the nine big-ticket stuck orders and hide the rest. The honest census: 21.",
  },
  {
    id: "cs-1217",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The not-shipped headline",
    brief:
      "From: Billing lead. Re: the fulfilment wall.\n\nThe fulfilment wall shows one label line at a time, busiest first. Label every order's shipping state — the real timestamp when it exists, the words 'not shipped' when it doesn't — then read off the top line among orders that are not cancelled.",
    ask: "The most common shipping-state label among non-cancelled orders.",
    template: `SELECT COALESCE({1}, {2}) AS ship_label, COUNT(*) AS n
FROM orders
WHERE status {3} 'cancelled'
GROUP BY ship_label
ORDER BY n DESC
LIMIT 1;`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the label source",
        why: "The label mirrors shipped_at when it exists. COALESCE(total, ...) would label rows with money values and the wall would print prices instead of states.",
      },
      {
        answer: "'not shipped'",
        kind: "keyword",
        label: "the fallback words",
        why: "The wall's spec reserves the phrase 'not shipped' for the NULL state. A fallback of 'shipped' would brand the stuck queue as delivered and mislead the floor.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the cancelled exclusion",
        why: "The wall counts live work, so cancelled orders are excluded with !=. Flipping to = would show the cancelled line alone and crown a queue nobody is working.",
      },
    ],
    distractors: ["total", "'shipped'", "="],
    walkthrough:
      "COALESCE labels each order with its real shipping date, or 'not shipped' when the timestamp is missing — and among the eighty-two non-cancelled orders, the fourteen pending all land in the fallback bucket. Every shipping-date label is shared by at most two orders, so the wall's top line reads: not shipped, 14. Swapping the fallback to 'shipped' would rename the queue into an achievement; filtering = 'cancelled' would show a single seven-order line and call it the headline. The label source must be shipped_at — COALESCE over total prints prices. The wall's line: not shipped, 14.",
  },
  {
    id: "cs-1218",
    tier: "hard",
    topic: "t2",
    universe: "refund-audit",
    title: "The timestamp ledger pair",
    brief:
      "From: Refund audit. Re: the counting discipline.\n\nCOUNT(*) counts rows; COUNT(column) counts values — and the difference is exactly the NULLs. Produce the pair for the shipping timestamp across the whole order book, so the ledger shows both truths side by side and the 21-row gap speaks for itself.",
    ask: "Orders with a shipping timestamp versus total orders.",
    template: `SELECT COUNT({1}) AS with_dates,
       COUNT(*) AS all_rows,
       IFNULL(MIN(created_at), 'none') AS first_row
FROM {2}
WHERE total {3} {4};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the counted column",
        why: "COUNT(shipped_at) skips NULLs and counts only real timestamps — the discipline the ledger teaches. COUNT(total) would count every row and erase the very gap being measured.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the book table",
        why: "The shipping story lives on orders. Invoices carry no total column, so the gate would fail to compile against the wrong ledger.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must admit every order: totals are positive, so > 0 passes all. Flipping to < 0 would demand negative totals and zero out both counts.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps the whole book in the pair. A floor of 400 would census only the premium tail and shrink both counts.",
      },
    ],
    distractors: ["total", "invoices", "<", "400"],
    walkthrough:
      "The ledger's teaching pair over the whole book: COUNT(shipped_at) skips NULLs and lands on 82, while COUNT(*) counts rows and lands on 103 — and the 21-row difference is exactly the never-shipped queue, visible through COUNT's NULL discipline alone. Swapping the counted column to total would read 103 versus 103 and erase the gap the audit exists to expose. The gate stays wide open — the flipped < 0 fill or a 400 floor would shrink both counts and blur the lesson. And the book must be orders: invoices carry no total column, so the query would not compile. The pair the audit files: 82 with dates, 103 total — 21 orders with no timestamp to show.",
  },
  {
    id: "cs-1219",
    tier: "easy",
    topic: "t2",
    universe: "month-close",
    title: "The unpaid roll call",
    brief:
      "From: Month-end close. Re: the collections list.\n\nAn invoice with no payment row at all has collected nothing. Count those invoices by LEFT-joining payments and testing the miss — the roll call collections starts from — and keep the amount gate open so no unpaid invoice hides below a bar.",
    ask: "How many invoices have no payment row?",
    template: `SELECT COUNT(*) AS unpaid
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE IFNULL(p.amount_cents, 0) = 0
AND i.amount_cents {1} {2}
AND i.number LIKE {3};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate must let every unpaid invoice through: amounts are positive, so > 0 passes all. Flipping to < 0 would demand negative invoices and empty the roll call.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every unpaid invoice — the smallest runs 87300 cents. A floor of 200000 would list only the three largest and hide the rest.",
      },
      {
        answer: "'INV-%'",
        kind: "keyword",
        label: "the ledger-wide prefix",
        why: "Every invoice number starts INV-, so the prefix keeps both years on the roll call. 'INV-2025-%' would drop the two 2024 balances and understate the list.",
      },
    ],
    distractors: ["<", "200000", "'INV-2025-%'"],
    walkthrough:
      "Six invoices have never seen a payment row — five open and one paid-labeled phantom — and that is the collections roll call. The IFNULL guard folds each missing payment amount to a zero, so the = 0 test catches exactly the invoices with nothing behind them; invoices with real payments carry positive amounts and fail the test. The amount gate stays open: every unpaid invoice clears zero, while the 200000 floor would shrink the list to the three biggest balances and quietly drop 129500 and 87300. And the prefix stays ledger-wide — the 2025-only gate would cut the call to four and hide the two 2024 notes. The honest list: 6 invoices, 1521700 cents outstanding.",
  },
  {
    id: "cs-1220",
    tier: "medium",
    topic: "t2",
    universe: "expense",
    title: "The unpaid pot",
    brief:
      "From: Month-end close. Re: the open balance figure.\n\nThe balance report needs one number: every euro invoiced that has collected nothing. Sum the invoice amounts whose payment side is empty — using COALESCE to turn the missing payment into a zero that the test can catch — and keep the number prefix tight.",
    ask: "Total cents invoiced across invoices with no payment at all.",
    template: `SELECT {1}(i.amount_cents) AS open_pot
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE {2}(p.amount_cents, 0) = 0
AND i.number LIKE {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot builder",
        why: "The deliverable is the total cents outstanding, so the invoice amounts collapse with SUM. COUNT would report the invoice tally — 6 — when the report asked for euros.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the zero-fill guard",
        why: "COALESCE(p.amount_cents, 0) turns a missing payment into a zero the = 0 test can catch. NULLIF(p.amount_cents, 0) does the opposite — it nullifies real zeros, not missing rows.",
      },
      {
        answer: "'INV-%'",
        kind: "keyword",
        label: "the invoice-prefix gate",
        why: "Every invoice number starts INV-, so the prefix gate keeps the whole ledger in scope. 'INV-2025-%' would drop the 2024 balances and understate the pot by 216800 cents.",
      },
    ],
    distractors: ["COUNT", "NULLIF", "'INV-2025-%'"],
    walkthrough:
      "LEFT JOIN hands each invoice its payments — six invoices get no rows at all, and SUM over nothing is NULL, which COALESCE folds to 0 so the = 0 test catches them. Summing their amounts: 493700 + 356200 + 279400 + 129500 + 87300 plus the 175600 phantom = 1521700 cents outstanding. COUNT would answer 6 invoices when the report asked for cents. NULLIF is the trap: it nullifies real zeros, so a genuinely zero payment would slip the test, while missing rows — already NULL — stay invisible to it. And the tight 'INV-%' prefix keeps all years in scope; the 2025-only gate would shave 216800 off the pot. The report files: 1521700.",
  },
  {
    id: "cs-1221",
    tier: "hard",
    topic: "t2",
    universe: "refund-audit",
    title: "The dormant sweep proof",
    brief:
      "From: Refund audit. Re: the dormant-account sweep.\n\nBefore we email the dormant list, prove where its floor really is: zero-fill every member's lifetime spend with COALESCE over a LEFT JOIN, stage the census in a derived table, and report the smallest zero-filled spend. If the number is well above zero, the dormant list is empty and the sweep dies on evidence.",
    ask: "Smallest lifetime spend across members after the zero-fill.",
    template: `SELECT {1}(spend) AS floor_spend
FROM (
  SELECT c.id, COALESCE(SUM(o.total), 0) AS spend
  FROM customers c
  LEFT JOIN orders o ON o.customer_id = c.{2}
  GROUP BY c.id
)
WHERE spend {3} {4};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor pick",
        why: "The sweep proves its floor with the smallest spend, so the staged census collapses with MIN. MAX would crown the biggest spender and prove nothing about dormancy.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the join key",
        why: "Orders reference their buyer by customer id, so the join key is c.id. Joining on c.name would compare a name against a number and match nobody — every spend would read zero.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the spend gate direction",
        why: "The gate must admit every member: zero-filled spends are non-negative, so > 0 keeps the real spenders. Flipping to < 0 would demand negative spend and empty the stage.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open spend floor",
        why: "A floor of 0 admits every real spender — the whole point of the proof. A floor of 1000 would census only the heavy five and fake a higher dormancy floor.",
      },
    ],
    distractors: ["MAX", "name", "<", "1000"],
    walkthrough:
      "The derived stage LEFT-joins every member to their orders on the id key, and COALESCE folds any no-order NULL to a clean zero — then the outer query takes the floor: 444.80, Olivia Brown's lifetime spend. The dormant list is empty: nobody sits at zero, and the sweep dies on evidence rather than mailing a phantom cohort. MAX would crown Alice's 7262.35 and prove nothing; the flipped < 0 gate or a 1000 floor would shrink the stage and fake a higher floor. And the join key must be the id — a name-to-number comparison matches nobody, every spend reads zero, and the sweep would file the whole roster as dormant. Filed: no dormant members; floor 444.80.",
  },
  {
    id: "cs-1222",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The two-receipt settlements",
    brief:
      "From: Month-end close. Re: the reconciliation note.\n\nSome invoices settled in two payments, and reconciliation wants to know how many. Stage a payments-per-invoice census in a derived table — counting payment rows, with COALESCE guarding the tally — then count the invoices whose settlement count is exactly two.",
    ask: "How many invoices were settled with exactly two payments?",
    template: `SELECT COUNT(*) AS split_paid
FROM (
  SELECT i.id, IFNULL(COUNT(p.id), 0) AS n
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
WHERE n = {1}
AND id {2} {3}
AND n {4} 0;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the split bar",
        why: "A split settlement is exactly two payment rows — one invoice, two receipts. A bar of 1 would count the single-payment invoices instead, seventeen of them.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the id gate direction",
        why: "The gate must admit every invoice: ids run 1 to 28, so > 0 passes all. Flipping to < 0 would demand negative ids and hide every split from the note.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open id floor",
        why: "The floor keeps every invoice in scope — ids run 1 to 28. A floor of 25 would silently drop the early invoices, though the splits all live above it.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the tally sanity gate",
        why: "The sanity gate insists the tally is non-negative — true for every real census line. Flipping to <= 0 would demand zero-or-negative tallies and contradict the split bar.",
      },
    ],
    distractors: ["1", "<", "25", "<="],
    walkthrough:
      "The derived stage counts payment rows per invoice — six invoices count zero, seventeen count one, five count two — and the outer query answers: 5 split settlements. The bar must be exactly 2; the 1-fill would file the single-payment majority as splits. The id gate stays wide open, and its floor of 0 keeps all twenty-eight invoices in scope even though every split happens to live above id 25 — the note's discipline is scope, not luck. The tally sanity gate >= 0 passes every real census line, while the flipped <= 0 fill contradicts the split bar and empties the note. Reconciliation files: 5 splits.",
  },
  {
    id: "cs-1223",
    tier: "medium",
    topic: "t2",
    universe: "fraud",
    title: "The phantom paid",
    brief:
      "From: Fraud spot-check. Re: the label-vs-ledger gap.\n\nOne invoice claims to be paid, yet no payment row exists — the books disagree with the ledger. LEFT-join payments to invoices, keep the rows where the payment side is missing, and count the ones whose status still says paid. The gate on amounts stays open.",
    ask: "How many invoices are marked paid but have no payment row?",
    template: `SELECT COUNT(*) AS phantoms
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE IFNULL(p.amount_cents, 0) = 0
AND i.status = {1}
AND i.amount_cents {2} {3};`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the claimed status",
        why: "The phantom is an invoice whose label says paid. Filtering 'open' would list the honest unpaid balances and miss the inconsistency entirely.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate must let every phantom through: amounts are positive, so > 0 passes all. Flipping to < 0 would demand negative amounts and hide the ghost.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every claimed-paid invoice. A floor of 300000 would step over the 175600-cent ghost and report nothing to investigate.",
      },
    ],
    distractors: ["'open'", "<", "300000"],
    walkthrough:
      "LEFT JOIN gives every invoice its payments, and the IFNULL guard folds missing payment amounts to zero — marking the six invoices that never saw money. Among them, five are honestly labeled open — but one, INV-2025-028 at 175600 cents, still claims paid with nothing behind it. That is the phantom, and the count files 1. The 'open' filter would list the honest balances and never surface the inconsistency; the flipped < 0 gate or a 300000 floor would step around the ghost and file a clean audit. The fraud note opens with: one phantom, 175600 cents claimed, zero cents settled.",
  },
  {
    id: "cs-1224",
    tier: "medium",
    topic: "t2",
    universe: "expense",
    title: "The open-balance report",
    brief:
      "From: Expense report. Re: what collections can actually collect.\n\nThe open pot is not every unpaid invoice — it is the honestly-labeled open ones. LEFT-join payments, keep only invoices with no payment row, restrict to status open, and sum what remains above the reporting floor of 100000 cents.",
    ask: "Total cents on open invoices with no payment, above 100000 cents.",
    template: `SELECT SUM(i.amount_cents) AS collectible
FROM invoices i
LEFT JOIN payments p ON p.invoice_id = i.id
WHERE IFNULL(p.amount_cents, 0) = 0
AND i.status = {1}
AND i.amount_cents > {2}
AND i.number LIKE {3};`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the honest status",
        why: "Collections chases open invoices — the paid-labeled phantom is a data-quality ticket, not collectible work. Filtering 'paid' would file the phantom as money in the door.",
      },
      {
        answer: "100000",
        kind: "number",
        noVerify: true,
        label: "the reporting floor",
        why: "The report covers six-figure balances, so the floor sits at 100000 cents. A floor of 0 would sweep in the 87300-cent balance and change the total.",
      },
      {
        answer: "'INV-%'",
        kind: "keyword",
        label: "the prefix gate",
        why: "Every invoice number starts INV-, so the gate keeps all years in scope. 'INV-2024-%' would drop the 2025 balances and understate the collectible total.",
      },
    ],
    distractors: ["'paid'", "0", "'INV-2024-%'"],
    walkthrough:
      "Six invoices have no payment row — the IFNULL guard folds their missing amounts to zero and the = 0 test keeps exactly those. Five are labeled open, and of those, four clear the 100000-cent reporting floor: 493700, 356200, 279400 and 129500. Their sum — 1258800 cents — is what collections can actually chase; the 87300-cent balance sits under the floor, and the 175600-cent phantom is a books-cleanup ticket, not collectible work. Filtering 'paid' would file the phantom as revenue; dropping the floor to 0 would add 87300 and misquote the report; the 2024-only prefix would cut the pot to 129500 plus nothing else from 2025. The report's collectible figure: 1258800.",
  },
  {
    id: "cs-1225",
    tier: "hard",
    topic: "t2",
    universe: "refund-audit",
    title: "The never-settled notes",
    brief:
      "From: Refund audit. Re: the first-touch timeline.\n\nEvery invoice deserves a first payment date; invoices with none get the word 'never'. Stage that per-invoice first touch with COALESCE over MIN, then count the notes whose timeline starts with the word — the set the collections calendar opens with.",
    ask: "How many invoices have a first payment date of 'never'?",
    template: `SELECT COUNT(*) AS late_notes
FROM (
  SELECT i.id, COALESCE(MIN(p.paid_on), 'never') AS first_pay
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
WHERE first_pay = {1}
AND id {2} {3};`,
    slots: [
      {
        answer: "'never'",
        kind: "keyword",
        label: "the fallback word",
        why: "The timeline's word for no payment at all is 'never' — the COALESCE fallback. Testing a real date like '2024-02-20' would count the earliest honest touch instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the id gate direction",
        why: "The gate must admit every invoice: ids run 1 to 28, so > 0 passes all. Flipping to < 0 would demand negative ids and hide the entire calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open id floor",
        why: "A floor of 0 keeps all twenty-eight invoices in scope. A floor of 25 would drop the early never-settled notes and shrink the calendar's opening page.",
      },
    ],
    distractors: ["'2024-02-20'", "<", "25"],
    walkthrough:
      "MIN(paid_on) finds each invoice's first touch, and for the six invoices with no payment at all MIN is NULL — COALESCE rewrites those as the word 'never'. The outer count answers 6: the calendar opens with six never-settled notes. Testing '2024-02-20' instead would count the single invoice whose first touch landed on the earliest real payment date, a different list for a different meeting. The id gate stays wide open — flipping it hides every note — and the floor of 0 keeps all twenty-eight invoices in scope, since three of the never-settled notes hide above id 25 and the rest below. Collections opens: 6 notes.",
  },
  {
    id: "cs-1226",
    tier: "medium",
    topic: "t2",
    universe: "expense",
    title: "The debit-side discipline",
    brief:
      "From: Expense report. Re: the books' shape check.\n\nEvery ledger entry carries a debit, a credit, or — in a healthy book — exactly one of the two. Count the entries whose credit side is empty, using NULLIF to surface the zeros as NULLs, restricted to the cash account, with the date gate wide open.",
    ask: "How many cash-account ledger entries have an empty credit side?",
    template: `SELECT COUNT(*) AS debit_lines
FROM ledger_entries
WHERE NULLIF(credit_cents, 0) IS {1}
AND account = {2}
AND entry_date {3} {4};`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptied-side test",
        why: "NULLIF(credit_cents, 0) hands back NULL when the credit is zero — so IS NULL finds the debit-only lines. IS NOT NULL would count credited lines instead, the mirror census.",
      },
      {
        answer: "'cash'",
        kind: "keyword",
        label: "the cash account",
        why: "The shape check runs on cash first — the account every entry eventually touches. Filtering 'sales_revenue' would census a different slice of the book.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the date gate direction",
        why: "The gate must admit the whole book: entries run from early 2024 on, so > 2020 keeps them all. Flipping to < 2020 would demand entries from before the store kept books.",
      },
      {
        answer: "'2020-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the open date floor",
        why: "A floor of 2020-01-01 predates every entry and keeps the census whole. A 2025 floor would slice the book to its last two months and miscount the shape.",
      },
    ],
    distractors: ["NOT NULL", "'sales_revenue'", "<", "'2025-01-01'"],
    walkthrough:
      "NULLIF(credit_cents, 0) turns every zero credit into a real NULL, and IS NULL counts the lines the book debited: for cash that is 13 of the account's entries. The mirror test — IS NOT NULL — would file the credited lines instead, a different shape check with a different number. The account filter matters because the book's four accounts split their debit discipline differently; cash is the one the expense team watches. The date gate stays wide: the 2020 floor predates the first entry, while a 2025 floor would slice to the final two months and file a partial book as the whole. Cash's debit lines: 13.",
  },
  {
    id: "cs-1227",
    tier: "easy",
    topic: "t2",
    universe: "month-close",
    title: "The single-receipt majority",
    brief:
      "From: Month-end close. Re: the settlement mix.\n\nMost invoices settle with one payment; the census proves it. Stage a payments-per-invoice tally with an IFNULL-guarded count in a derived table, keep the invoices whose tally is exactly one, and count them with the id gate wide open.",
    ask: "How many invoices were settled with exactly one payment?",
    template: `SELECT COUNT(*) AS single_paid
FROM (
  SELECT i.id, IFNULL(COUNT(p.id), 0) AS n
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
  HAVING COALESCE(COUNT(p.id), 0) = {1}
)
WHERE id {2} {3}
AND n {4} 0;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-receipt bar",
        why: "A single settlement is exactly one payment row — one invoice, one receipt. A bar of 2 would count the five split settlements instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the id gate direction",
        why: "The gate must admit every invoice: ids run 1 to 28, so > 0 passes all. Flipping to < 0 would demand negative ids and hide the entire majority.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open id floor",
        why: "A floor of 0 keeps all twenty-eight invoices in scope. A floor of 25 would slice the census to the last four ids and report a mix nobody banks on.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the tally sanity gate",
        why: "The sanity gate insists the tally is non-negative — true for every real census line. Flipping to <= 0 would contradict the single-receipt bar and empty the count.",
      },
    ],
    distractors: ["2", "<", "25", "<="],
    walkthrough:
      "The derived stage tallies payment rows per invoice — six count zero, seventeen count one, five count two — with IFNULL and COALESCE guarding the tally so the LEFT JOIN's missing rows read as zeros, never NULLs. The HAVING keeps the single-receipt lines, and the outer count answers: 17 invoices settled with exactly one payment. The 2-bar would file the five splits as the majority; the flipped id gate or a 25 floor would slice the census and misstate the mix; the <= 0 sanity fill contradicts the bar outright. The settlement mix opens: 17 singles, 5 splits, 6 silent.",
  },
  {
    id: "cs-1228",
    tier: "medium",
    topic: "t2",
    universe: "fraud",
    title: "The late-settlement sweep",
    brief:
      "From: Fraud spot-check. Re: the collections promptness read.\n\nA settlement is late when its payment date passes the invoice's due date. Join payments to their invoices, compare the two dates as julian day numbers so the math is numeric, and count the late settlements across every payment method, with the amount gate open.",
    ask: "How many payments settled after their invoice's due date?",
    template: `SELECT COUNT(*) AS late_settles, COALESCE(MAX(p.paid_on), 'none') AS last_late
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE julianday(p.paid_on) {1} julianday(i.due_on)
AND p.method IN ({2})
AND p.amount_cents > {3};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the lateness direction",
        why: "Late means the payment day number exceeds the due day number, so the test is >. Flipping to < would count the early payers — the good citizens — and mislabel them late.",
      },
      {
        answer: "'card', 'wire'",
        kind: "keyword",
        label: "the method pass",
        why: "Both settlement methods count, so the IN-list carries card and wire. A cash-only list matches no payment row and would report a promptness the books never earned.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every settlement. A floor of 500000 cents exceeds any single payment here and would zero the sweep.",
      },
    ],
    distractors: ["<", "'cash'", "500000"],
    walkthrough:
      "julianday turns both dates into day numbers so the comparison is numeric arithmetic, not text luck — and the sweep finds 4 payments that landed after their due date, with the latest of them stamped alongside for the note. Flipping the comparison would count the 23 prompt settlements and call them late; the 'cash' method list matches no row at all, since the books only carry card and wire — and the COALESCE beside the count exists for the empty sweep, stamping 'none' instead of a NULL. The amount gate stays open so no late settlement hides behind a price line — a 500000 floor exceeds every payment and would zero the sweep. The promptness read files: 4 late of 27 settlements.",
  },
  {
    id: "cs-1229",
    tier: "hard",
    topic: "t2",
    universe: "growth",
    title: "The never-invoiced cohort",
    brief:
      "From: Growth lead. Re: the billing-coverage gap.\n\nEvery member who spends should appear on an invoice; the gap between the roster and the invoice ledger is the billing-coverage hole. LEFT-join invoices to customers, keep the misses, restrict to active members, and count the cohort — the coverage gap the billing team closes first.",
    ask: "How many active customers have never been invoiced?",
    template: `SELECT COUNT(*) AS ghosts, COALESCE(MIN(c.created_at), 'none') AS first_ghost
FROM {1} c
LEFT JOIN invoices i ON i.customer_id = c.id
WHERE i.id IS NULL
AND c.active = {2}
AND c.created_at {3} {4};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the member source",
        why: "The coverage gap is measured over members. Payments also carry ids, but they are receipts, not members, and the census would count orphaned receipts instead.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "The coverage hole that matters is among active members — the two inactive ghosts are already off the books. A 0 flag would census only the deactivated pair.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the vintage gate direction",
        why: "The gate must admit every member: signups run from late 2023 on, so < 2025 keeps them all. Flipping to > 2025 would demand future signups and empty the cohort.",
      },
      {
        answer: "'2025-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the vintage ceiling",
        why: "Every member signed up before 2025, so the ceiling keeps the whole cohort in scope. A 2024 ceiling would slice the cohort and hide the oldest ghosts.",
      },
    ],
    distractors: ["payments", "0", "'2024-01-01'"],
    walkthrough:
      "LEFT JOIN hands every member their invoices, and i.id IS NULL marks the five members the billing ledger never touched. The active flag matters: two of the five ghosts are deactivated already, so the live coverage gap is three — Bruno, Farid and Noah, with Bruno's November 2023 signup the oldest. The vintage gate stays wide — every signup predates 2025 — while a 2024 ceiling would slice away the oldest ghosts and flatter the coverage story. And the source must be customers: over payments the census would count sixteen orphaned receipts, a number nobody can bill. The live coverage gap: 3 active members.",
  },
  {
    id: "cs-1230",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The fully-settled count",
    brief:
      "From: Month-end close. Re: the clean-books milestone.\n\nAn invoice is fully settled when its payments sum to exactly its face value. Stage the per-invoice paid total with COALESCE keeping missing payments at zero, then count the invoices whose paid total clears their face value with the at-or-above test — the clean-books number.",
    ask: "How many invoices have payments totalling at least their face value?",
    template: `SELECT COUNT(*) AS settled
FROM (
  SELECT i.id, i.amount_cents, COALESCE(SUM(p.amount_cents), 0) AS paid
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
WHERE paid {1} amount_cents
AND paid != 0
AND id BETWEEN {2} AND {3};`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the at-or-above test",
        why: "Fully settled means paid reaches face value, so the test is >=. A strict > would demand overpayment and count none — the books carry no overpays.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the open id floor",
        why: "A BETWEEN floor of 1 keeps the whole book in scope — ids start at 1. A floor of 2 would quietly drop the first invoice and misstate the milestone.",
      },
      {
        answer: "28",
        kind: "number",
        noVerify: true,
        label: "the open id ceiling",
        why: "A BETWEEN ceiling of 28 keeps every invoice in scope — ids run 1 to 28. A ceiling of 20 would slice the book and hide settled invoices living above it.",
      },
    ],
    distractors: [">", "<", "2", "20"],
    walkthrough:
      "The stage sums each invoice's payments with COALESCE holding the unpaid six at zero, and the at-or-above test keeps the lines where paid reaches face value: 21 invoices settle exactly — the books carry no overpayments, so 21 is the clean-books milestone. The strict > fill would demand overpayment and report none, mistaking discipline for absence; the flipped < fill would count the seven behind-their-face-value lines instead. The BETWEEN bounds stay wide — a 2 floor drops the first invoice, a 20 ceiling slices away eight settled lines — and either fake a different book. Milestone filed: 21 fully settled.",
  },
  {
    id: "cs-1231",
    tier: "easy",
    topic: "t3",
    universe: "funnel",
    title: "The shipping speed line",
    brief:
      "From: Growth lead. Re: the fulfilment promise.\n\nThe site promises fast fulfilment, and the board wants the real number: average days from order to ship. Measure each gap as a difference of julian day numbers and round to two decimals — the same figure the ops calendar publishes.",
    ask: "Average shipping lag in days, rounded to 2 decimals.",
    template: `SELECT ROUND(AVG(julianday({1}) - julianday({2})), {3}) AS ship_days
FROM orders
WHERE total > {4};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the arrival side",
        why: "The lag ends at the ship timestamp, so julianday(shipped_at) leads the subtraction. julianday(status) would feed a status word into the date math, return NULL on every row, and average to nothing.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the start side",
        why: "The lag starts when the order was placed, so created_at is the subtrahend. due_on belongs to the invoice ledger, not orders, and the query would fail to compile.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the rounding precision",
        why: "The published figure carries two decimals for week-over-week reads. Rounding to 0 would fold 2.98 to 3 and blur the trend the board is watching.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order — the promise applies to the whole book. A floor of 400 would measure only the premium tail and flatter the number.",
      },
    ],
    distractors: ["status", "due_on", "0", "400"],
    walkthrough:
      "julianday turns both timestamps into day numbers, the difference is the lag per order, and the average over the eighty-two shipped orders rounds to 2.98 days — the figure the ops calendar publishes. Feeding a status word into julianday returns NULL for every row and the average vanishes; due_on is invoice-ledger vocabulary and the query would not compile against orders. The rounding precision matters (folding to 0 prints 3), and the total floor stays at 0 so the promise is measured over the whole book — a 400 floor would census only the premium tail. The fulfilment promise, filed honestly: 2.98 days.",
  },
  {
    id: "cs-1232",
    tier: "easy",
    topic: "t3",
    universe: "funnel",
    title: "The two-day turnarounds",
    brief:
      "From: Growth lead. Re: the fast-lane census.\n\nThe fastest completed work turns around in two days flat. Count the delivered orders whose day-gap from order to ship is exactly 2 — the fast lane the promise is judged on — with the timestamp presence test in place.",
    ask: "How many delivered orders turned around in exactly 2 days?",
    template: `SELECT COUNT(*) AS quick_turns
FROM orders
WHERE julianday(shipped_at) - julianday(created_at) = {1}
AND status = {2}
AND julianday(shipped_at) {3} NULL;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the fast-lane gap",
        why: "The fast lane is a two-day turnaround — the smallest gap the books carry. A 3-fill would census the middle lane instead, eighteen delivered orders of it.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The lane is judged on completed work, so status is delivered. The 'shipped' fill would read the in-flight lane instead — a different eight orders.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the timestamp presence test",
        why: "A two-day gap needs a real ship timestamp, so IS NOT NULL keeps only measurable rows. IS NULL would keep the never-shipped rows, whose gaps are NULL and unreadable.",
      },
    ],
    distractors: ["3", "'shipped'", "IS"],
    walkthrough:
      "The day-gap histogram runs 2, 3, 4 — and among delivered work the two-day lane holds 19 orders, the fastest turnarounds the promise can cite. The 3-fill would file the middle lane (18 delivered orders) as the fast lane. The status filter matters: shipped-status work carries a different eight two-day orders, and mixing lanes blurs completed history with in-flight. IS NOT NULL keeps measurable gaps — the IS NULL fill would keep only never-shipped rows, whose gaps are NULL. The fast-lane census: 19.",
  },
  {
    id: "cs-1233",
    tier: "medium",
    topic: "t3",
    universe: "funnel",
    title: "The delivered middle lane",
    brief:
      "From: Growth lead. Re: the promise read.\n\nThree-day delivery is the promise's middle lane, and the read wants it for completed work only. Count delivered orders whose day-gap is exactly 3, computed from the ship timestamp minus the order timestamp, with the total gate open.",
    ask: "How many delivered orders took exactly 3 days to ship?",
    template: `SELECT COUNT(*) AS mid_lane
FROM orders
WHERE julianday({1}) - julianday(created_at) = 3
AND status = {2}
AND total {3} {4};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the arrival side",
        why: "The gap ends at the ship timestamp. julianday(created_at) twice would make every gap zero and the lane would look empty.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The read covers completed work, so status is delivered. Filtering 'shipped' would read the in-flight lane instead — a different twelve orders.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must admit every delivered order: totals are positive, so > 0 passes all. Flipping to < 0 would demand negative totals and empty the lane.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps the whole lane in scope. A floor of 250 would measure only the pricier middle-lane orders and shift the census.",
      },
    ],
    distractors: ["created_at", "'shipped'", "<", "250"],
    walkthrough:
      "Among delivered orders, the three-day lane holds 18 orders — the middle of the 2/3/4-day spread the books carry. Pointing the gap at created_at twice would flatten every lag to zero and report an empty lane. The status filter matters: the shipped-status lane carries a different twelve orders, and mixing them would blur completed work with in-flight. The total gate stays open — a 250 floor would census only the pricier lane and shift the count. The promise read files: 18 delivered three-day orders.",
  },
  {
    id: "cs-1234",
    tier: "medium",
    topic: "t3",
    universe: "funnel",
    title: "The in-flight slow lane",
    brief:
      "From: Growth lead. Re: the slow-lane watch.\n\nThe four-day-and-up lane is where promises strain, and the watch tracks it for work still in flight. Count shipped-status orders whose day-gap reaches 4, with the timestamp presence test and the status-length guard in place.",
    ask: "How many shipped-status orders took 4 or more days to ship?",
    template: `SELECT COUNT(*) AS slow_lane
FROM orders
WHERE julianday(shipped_at) - julianday(created_at) >= {1}
AND status = {2}
AND julianday(shipped_at) {3} NULL
AND LENGTH(status) {4} 3;`,
    slots: [
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the slow-lane bar",
        why: "The lane opens at four days — the largest gap the books carry. A 5-bar would demand a five-day gap that has never happened and empty the watch.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "The watch tracks work still moving — status shipped. Filtering 'delivered' would watch the completed lane instead, a different fifteen orders.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the timestamp presence test",
        why: "The lane needs a real ship timestamp, so IS NOT NULL keeps only measurable gaps. IS NULL would keep the never-shipped rows, whose gaps are NULL and unreadable.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the status-length guard",
        why: "The guard proves status names run at least three characters — every real status does. Flipping to < 3 would demand two-letter statuses and match nothing.",
      },
    ],
    distractors: ["5", "'delivered'", "IS", "<"],
    walkthrough:
      "The four-day bar opens the slow lane, and among shipped-status work it holds 10 orders — the in-flight tail the watch tracks. A 5-bar would demand a gap the books have never recorded and report an empty watch. The status filter matters: delivered work carries a different fifteen slow orders, and the watch is about strain in flight, not history. IS NOT NULL keeps measurable gaps — the IS NULL fill would keep only never-shipped rows, whose gaps are NULL. And the length guard passes every real status name while the flipped < 3 fill matches nothing. The slow-lane watch: 10.",
  },
  {
    id: "cs-1235",
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The completed-work speed",
    brief:
      "From: Growth lead. Re: the promise, kept honestly.\n\nThe promise is judged on completed work: delivered orders only. Average their ship lag in julian days, rounded to two decimals, with the fallback guard making the status test explicit and the timestamp presence test in place.",
    ask: "Average shipping lag for delivered orders, rounded to 2 decimals.",
    template: `SELECT ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS del_days
FROM orders
WHERE {1}(status, 'x') = 'delivered'
AND julianday(shipped_at) {2} NULL
AND total {3} {4};`,
    slots: [
      {
        answer: "IFNULL",
        kind: "keyword",
        label: "the status guard",
        why: "IFNULL(status, 'x') makes the delivered test NULL-proof — a missing status would fall to 'x' and fail the test honestly. UPPER(status, 'x') is not a legal call and the query dies.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the timestamp presence test",
        why: "Only delivered rows carry a ship timestamp, so IS NOT NULL documents the measurable set. IS NULL would keep the never-shipped rows, whose lags are NULL.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must admit every delivered order: totals are positive, so > 0 passes all. Flipping to < 0 would demand negative totals and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps the whole completed set in scope. A floor of 400 would measure only the premium delivered tail and flatter the promise.",
      },
    ],
    distractors: ["UPPER", "IS", "<", "400"],
    walkthrough:
      "Delivered orders are the completed set, and their average ship lag rounds to 2.92 days — a touch faster than the shipped-status work, which trails at 3.07. The IFNULL guard makes the status test NULL-proof: a missing status would fall to 'x' and fail the test, while UPPER with two arguments is a call that never compiles. IS NOT NULL documents that the lag is measurable on every counted row; the IS NULL fill would keep only rows with no timestamp at all. The total gate stays open so the promise is judged on all completed work, not the premium tail. The honest promise read: 2.92 days.",
  },
  {
    id: "cs-1236",
    tier: "medium",
    topic: "t3",
    universe: "funnel",
    title: "The status speed board",
    brief:
      "From: Growth lead. Re: the two-lane compare.\n\nBoth measurable lanes — delivered and shipped — deserve their own speed line. Group the orders by status, average each lane's ship lag in days, keep only lanes that exist, and read the slower lane's figure off the board.",
    ask: "Per-status average ship lag in days, sorted slowest first.",
    template: `SELECT status, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS days
FROM orders
WHERE shipped_at {1} NULL
GROUP BY {2}
HAVING COUNT(*) {3} {4}
ORDER BY days DESC;`,
    slots: [
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the measurable-lane test",
        why: "Only rows with a ship timestamp have a measurable lag, so IS NOT NULL keeps the real lanes. IS NULL would keep the never-shipped rows, whose average lag is NULL.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the lane key",
        why: "The board is one line per status, so the stage groups by status. Grouping by total would carve a line per price point and drown the two-lane compare.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the lane-exists gate",
        why: "A lane must hold orders to earn a line, so COUNT(*) > 0 keeps only real groups. Flipping to < 0 would demand negative counts and show an empty board.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open lane floor",
        why: "A floor of 0 admits every lane with at least one order. A floor of 40 would keep only the delivered lane's fifty-two and drop the thirty-order shipped lane.",
      },
    ],
    distractors: ["IS", "total", "<", "40"],
    walkthrough:
      "Two lanes carry measurable lags: delivered averages 2.92 days and shipped trails at 3.07 — the board sorts slowest first, so the shipped line sits on top. IS NOT NULL keeps only rows whose lag exists; the IS NULL fill would stage the never-shipped rows and print NULL lines. Grouping by total would shred the board into per-price lines. The lane-exists gate at 0 keeps both lanes, while a 40 floor would drop the thirty-order shipped lane and hide the very line the compare exists for. The board reads: shipped 3.07, delivered 2.92.",
  },
  {
    id: "cs-1237",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The Sunday runs",
    brief:
      "From: Growth lead. Re: the weekend staffing read.\n\nSunday is the quiet day the staffing plan bets on — but the order book may disagree. Count the orders whose weekday code (strftime's %w) is 0 — Sunday — with the total gate open so no order hides behind a price line.",
    ask: "How many orders were placed on a Sunday?",
    template: `SELECT COUNT(*) AS sunday_runs
FROM orders
WHERE strftime({1}, created_at) = {2}
AND {3}(status) = status;`,
    slots: [
      {
        answer: "'%w'",
        kind: "keyword",
        label: "the weekday code",
        why: "strftime('%w', ...) returns the weekday as 0–6 with Sunday as 0 — the code the brief wants. '%d' would return the day-of-month and no day equals the text '0'.",
      },
      {
        answer: "'0'",
        kind: "keyword",
        label: "the Sunday code",
        why: "Sunday's %w code is 0, compared as text. A '1' would census Mondays instead — the busiest day in the book, not the quietest.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-storage guard",
        why: "TRIM(status) = status proves no status label rides with stray whitespace — true for every order, so the count sees the whole book. UPPER would demand shouting statuses and match nothing.",
      },
    ],
    distractors: ["'%d'", "'1'", "UPPER"],
    walkthrough:
      "strftime('%w') codes the week 0–6 with Sunday at 0, and the book holds 16 Sunday orders — hardly the dead day the staffing plan bets on. The '%d' chop would test day-of-month against '0' and match nothing, since dates render 01–31. The '1' fill would census Mondays, the busiest weekday at 20 orders, and flip the staffing story upside down. And the storage guard is a tautology here — every status is trim-clean — while the UPPER fill demands shouting statuses and would zero the count. The staffing read: 16 Sunday orders and counting.",
  },
  {
    id: "cs-1238",
    tier: "medium",
    topic: "t3",
    universe: "growth",
    title: "The weekend share",
    brief:
      "From: Growth lead. Re: the weekend shift debate.\n\nThe shift debate hinges on one number: orders placed on Saturday or Sunday. Count the weekend book — strftime's %w codes 0 and 6 — across the whole order book, with the storage guard proving the stage reads clean labels.",
    ask: "How many orders were placed on a weekend day?",
    template: `SELECT COUNT(*) AS weekend_runs
FROM orders
WHERE strftime('%w', created_at) {1} ({2})
AND {3}(status) = status;`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the weekend membership",
        why: "The weekend is two codes — 0 for Sunday, 6 for Saturday — so the test is IN. NOT IN would census the five weekdays and answer the opposite brief.",
      },
      {
        answer: "'0', '6'",
        kind: "keyword",
        label: "the weekend codes",
        why: "The pair 0 and 6 covers Sunday and Saturday. A list of '0' alone would census Sunday only and shave Saturday off the debate.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean-storage guard",
        why: "TRIM(status) = status proves every status label is stored clean — true for the whole book, so the count runs on real work. UPPER would demand shouting statuses and empty the count.",
      },
    ],
    distractors: ["NOT IN", "'0'", "UPPER"],
    walkthrough:
      "The weekend codes — Sunday 0, Saturday 6 — catch 24 orders in the book, the number the shift debate opens with. NOT IN would flip the read to the 79 weekday orders, the opposite brief; the '0'-only list would shave Saturday's share and tilt the debate. The storage guard is a tautology here — every status is trim-clean — while the UPPER fill demands shouting statuses and would zero the count. The shift debate opens with: 24 weekend orders.",
  },
  {
    id: "cs-1239",
    tier: "hard",
    topic: "t3",
    universe: "growth",
    title: "The busiest weekday",
    brief:
      "From: Growth lead. Re: the campaign-day pick.\n\nThe next campaign drops on the weekday the completed book trusts most. Group delivered orders by their %w weekday code, rank the days by volume, and read off the single busiest day — with the timestamp presence test keeping only real lanes.",
    ask: "The busiest weekday code by delivered-order count.",
    template: `SELECT strftime('%w', created_at) AS wd, COUNT(*) AS n
FROM orders
WHERE status = {1}
AND julianday(shipped_at) {2} NULL
GROUP BY wd
ORDER BY n {3}
LIMIT {4};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The campaign is judged on completed work, so the census runs over delivered orders. The 'shipped' fill would rank the in-flight lanes instead, where Tuesday and Monday tie at six.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the timestamp presence test",
        why: "Every delivered order carries a ship timestamp, so IS NOT NULL keeps only real lanes. IS NULL would keep the never-shipped rows, whose gaps are NULL.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the busiest-first sort",
        why: "The pick wants the top of the volume ranking, so the sort is descending. ASC would crown the quietest day and hand the campaign to Thursday.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-day cut",
        why: "The campaign drops on one day, so the cut is 1. A cut of 7 would return the whole week and dodge the decision.",
      },
    ],
    distractors: ["'shipped'", "'cancelled'", "IS", "ASC", "7"],
    walkthrough:
      "Among delivered orders the weekday census crowns Sunday — code 0 — with 10 completed orders, ahead of the three-way 9-tie on Friday, Wednesday and Monday. The status filter matters: the shipped-status lanes rank differently, with Tuesday and Monday tied at six, and cancelled work would empty the ranking outright since it never ships. Sorting ASC would hand the campaign to Thursday's 4-order lull; cutting to 7 would return the whole week and dodge the decision. The campaign calendar circles: Sunday.",
  },
  {
    id: "cs-1240",
    tier: "hard",
    topic: "t3",
    universe: "month-close",
    title: "The active-days count",
    brief:
      "From: Month-end close. Re: the ops-calendar spine.\n\nThe ops calendar hangs on one spine: how many distinct calendar days actually carry orders. Count the distinct order dates — DATE-sliced from the timestamps — with the total gate open so the spine covers the whole book.",
    ask: "How many distinct days carry at least one order?",
    template: `SELECT COUNT(DISTINCT {1}) AS active_days
FROM orders
WHERE total {2} {3};`,
    slots: [
      {
        answer: "DATE(created_at)",
        kind: "keyword",
        label: "the day slicer",
        why: "DATE(created_at) truncates each timestamp to its calendar day, so same-day orders collapse onto one spine node. strftime('%Y') would collapse to years and shrink the spine to two nodes.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must admit every order: totals are positive, so > 0 passes all. Flipping to < 0 would demand negative totals and leave the spine empty.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps every order on the spine. A floor of 400 would count only premium-order days and shorten the calendar.",
      },
    ],
    distractors: ["strftime('%Y', created_at)", "strftime('%W', created_at)", "<", "400"],
    walkthrough:
      "DATE(created_at) slices every order onto its calendar day, and the spine counts 84 distinct days across the fourteen-month book — days the ops calendar must carry. The '%Y' chop would collapse the spine to two nodes (2024 and 2025), and the '%W' chop would render 42 week-nodes — both calendars nobody can schedule against. The total gate stays open so the spine covers the whole book; a 400 floor would keep only the days the premium tail touched. The calendar spine: 84 active days.",
  },
  {
    id: "cs-1241",
    tier: "easy",
    topic: "t4",
    universe: "growth",
    title: "The month league",
    brief:
      "From: Growth lead. Re: the seasonality read.\n\nThe order book spans more than a year, and the league table wants to know how many distinct months actually played. Chop the order dates into '%Y-%m' buckets, stage the distinct months, and count the league — excluding nothing.",
    ask: "Count the distinct months in which orders were placed.",
    template: `SELECT COUNT(*) AS active_months
FROM (
  SELECT strftime({1}, {2}) AS mo
  FROM {3}
  GROUP BY mo
);`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month chop",
        why: "The format '%Y-%m' keys one bucket per calendar month — the league's grain. '%Y' would collapse the book to two year-buckets and misreport the league.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the chopped column",
        why: "The league chops the order timestamp. Chopping a text column like status would yield one NULL bucket and a league of one.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the league table",
        why: "The seasonality read counts purchase months, so the stage runs over orders. Customers would league signup months instead — nine of them, a different calendar.",
      },
    ],
    distractors: ["'%Y'", "status", "customers"],
    walkthrough:
      "The '%Y-%m' chop keys a bucket per calendar month, the stage dedupes them, and the league counts 14 — the order book runs January 2024 through February 2025 without a gap. The '%Y' chop would collapse the league to two seasons and hide the monthly rhythm the growth team charts. The chopped column must be the timestamp: chopping status yields a single NULL bucket and a league of one. And the stage must run over orders — customers would league the nine signup months and tell the seasonality story with the wrong calendar. The seasonality read opens: 14 active months.",
  },
  {
    id: "cs-1242",
    tier: "hard",
    topic: "t4",
    universe: "growth",
    title: "The peak-month tie",
    brief:
      "From: Growth lead. Re: the busiest-month claim.\n\nThe deck claims a single busiest month, but the books may disagree. Stage a per-month order census, keep the months whose count sits at the nine-order peak, and count them — excluding nothing by label, and letting the tie speak.",
    ask: "How many months reached the nine-order peak?",
    template: `SELECT COUNT(*) AS peak_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM orders
  GROUP BY {3}
)
WHERE n {1} {2};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the peak test",
        why: "The peak is an exact count — months at exactly nine orders. Flipping to > would demand a ten-order month the books never recorded.",
      },
      {
        answer: "9",
        kind: "number",
        noVerify: true,
        label: "the peak bar",
        why: "The bar sits at nine, the highest monthly order count in the book. An 8-bar would count the four eight-order months and dilute the peak.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the census key",
        why: "The census is one line per month, so the stage groups by its own month bucket. Grouping by the raw timestamp would census individual moments and no month would reach nine.",
      },
    ],
    distractors: [">", "8", "created_at"],
    walkthrough:
      "The per-month census tops out at nine orders — and two months sit exactly there: 2024-02 and 2024-09. The tie is real, the deck's single-busiest-month claim is not, and the count files 2. The > fill would demand a ten-order month that never happened; the 8-bar would dilute the peak with four eight-order months. And the census key must be the month bucket itself: grouping by the raw timestamp would census individual purchase moments, where no line reaches nine. The seasonality note records the tie: two peaks, nine orders each.",
  },
  {
    id: "cs-1243",
    tier: "easy",
    topic: "t4",
    universe: "expense",
    title: "The February take",
    brief:
      "From: Finance review. Re: the February read.\n\nFebruary's revenue line is the one the board quiz always asks about. Sum the order totals for the '%Y-%m' bucket 2024-02, rounded to two decimals, across the whole book — delivered, shipped, pending and all.",
    ask: "Total order revenue for February 2024, rounded to 2 decimals.",
    template: `SELECT ROUND(SUM(total), 2) AS feb_rev
FROM orders
WHERE strftime('%Y-%m', created_at) = {1}
AND status {2} {3};`,
    slots: [
      {
        answer: "'2024-02'",
        kind: "keyword",
        label: "the February bucket",
        why: "The bucket key '%Y-%m' renders February 2024 as '2024-02'. The '2024-09' fill would sum September — a different month with a different take.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the whole-book direction",
        why: "The board quiz wants the whole month, so no status is excluded with !=. Flipping to = would sum one status line and call it the month.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the never-whole status",
        why: "No order's status is a status other than the four real ones — but the guard's purpose is the != direction; the = 'pending' fill would shrink February to its pending line alone.",
      },
    ],
    distractors: ["'2024-09'", "=", "'delivered'"],
    walkthrough:
      "February 2024 booked nine orders, and their totals sum to 3609.64 — the take the board quiz expects, across every status. The '2024-09' fill would report September's 3116.04 instead, a different month in the same league. Flipping the status guard to = would read a single status line — delivered February is 1798.30, barely half the month — and misquote the take by half. The whole-book February read: 3609.64.",
  },
  {
    id: "cs-1244",
    tier: "easy",
    topic: "t4",
    universe: "expense",
    title: "The revenue crown month",
    brief:
      "From: Finance review. Re: the crown month.\n\nEvery month fights for the delivered-revenue crown, and the report needs the winner. Bucket the delivered book by '%Y-%m', sum each month's totals, rank the months by revenue, and read off the single crown line.",
    ask: "The month with the highest delivered-order revenue.",
    template: `SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS rev
FROM orders
WHERE status = {1}
GROUP BY mo
ORDER BY rev {2}
LIMIT {3};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the collected status",
        why: "The crown counts money that actually completed the journey, so status is delivered. The 'cancelled' fill would rank a ghost book and crown nothing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown-first sort",
        why: "The crown sits at the top of the revenue ranking, so the sort is descending. ASC would hand the report the weakest month and invert the brief.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-crown cut",
        why: "The report reads one crown line, so the cut is 1. A cut of 3 would return the podium and dodge the crown call.",
      },
    ],
    distractors: ["'cancelled'", "ASC", "3"],
    walkthrough:
      "Bucketed by '%Y-%m' and ranked by revenue, the delivered book crowns February 2024 at 1798.30 — the biggest month-take among completed work, ahead of January's 1169.77. The status filter matters: the whole-book crown would read January at 3731.97, but the report counts money whose journey finished, not orders still in flight. Sorting ASC would deliver the weakest month's line; cutting to 3 would return the podium and soften the crown call. The report's crown line: 2024-02, 1798.30.",
  },
  {
    id: "cs-1245",
    tier: "hard",
    topic: "t4",
    universe: "growth",
    title: "The below-pace months",
    brief:
      "From: Growth lead. Re: the pace report.\n\nThe pace line is the average monthly order count; the report wants the months running under it. Stage the per-month census, compute the pace, and count the months strictly below — with the label guard excluding nothing.",
    ask: "How many months ran below the average monthly order count?",
    template: `SELECT COUNT(*) AS slow_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM orders
  GROUP BY {2}
)
WHERE n {1} (SELECT ROUND(AVG(n), 4) FROM (
  SELECT COUNT(*) AS n FROM orders GROUP BY strftime('%Y-%m', created_at)
))
AND LENGTH(mo) = {3};`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the below-pace test",
        why: "The report hunts months under the pace line, so the test is <. Flipping to > would census the above-pace months instead — six of them, the over-achievers.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the census key",
        why: "The census is one line per month, so the stage groups by its own month bucket. Grouping by the raw timestamp would census individual moments and the pace line would collapse to 1.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the grain guard",
        why: "A '%Y-%m' label is exactly seven characters, so the guard passes every real bucket. A 5-fill would demand five-character labels and match nothing.",
      },
    ],
    distractors: [">", "created_at", "issued_on", "5", "8"],
    walkthrough:
      "The book averages 7.36 orders per month, and eight of the fourteen months run strictly below that pace — the long tail the growth plan wants to lift. The > fill would census the six above-pace months and answer the opposite brief. The census key must be the month bucket itself: grouping by the raw timestamp would census purchase moments, where every line is small and the pace read collapses. And the grain guard sits at seven characters — the exact width of a '%Y-%m' label — while a 5-fill matches nothing. The pace report files: 8 below-pace months against a 7.36 line.",
  },
  {
    id: "cs-1246",
    tier: "medium",
    topic: "t4",
    universe: "growth",
    title: "The quiet-month list",
    brief:
      "From: Growth lead. Re: the promotion calendar.\n\nThe promotions land in the quiet months — the ones with the fewest orders. Stage the per-month census, keep the months at exactly six orders, and count them, with the label-length guard in place so the stage proves its own grain.",
    ask: "How many months recorded exactly 6 orders?",
    template: `SELECT COUNT(*) AS quiet_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM orders
  GROUP BY {3}
)
WHERE n {1} {2};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the quiet test",
        why: "The promotion calendar targets months at exactly the quiet mark. Flipping to > would census the busy months and send the promotions where business is already good.",
      },
      {
        answer: "6",
        kind: "number",
        noVerify: true,
        label: "the quiet bar",
        why: "Six orders is the quiet mark this season. A 7-bar would census five months instead and crowd the promotion calendar.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the census key",
        why: "The census is one line per month, so the stage groups by its own month bucket. Grouping by the raw timestamp would census individual moments, where no month line exists at all.",
      },
    ],
    distractors: [">", "7", "created_at"],
    walkthrough:
      "Three months sit exactly at the six-order quiet mark — 2024-06, 2024-11 and 2025-01 — and that is where the promotion calendar lands. The > fill would send promotions to the ten busier months, backwards for a campaign meant to lift the quiet stretches. The 7-bar would census five months and crowd the calendar. And the census key must be the month bucket: grouping by the raw timestamp would census purchase moments, where quiet months do not exist as lines at all. The promotion calendar books: 3 quiet months.",
  },
  {
    id: "cs-1247",
    tier: "hard",
    topic: "t4",
    universe: "expense",
    title: "The month-take average",
    brief:
      "From: Finance review. Re: the pace number.\n\nThe finance pace line is the average month-take: sum each month's revenue, then average the fourteen sums. Round to two decimals, group at the month grain, and let the derived stage carry the whole read.",
    ask: "Average monthly revenue across all months, rounded to 2 decimals.",
    template: `SELECT ROUND(AVG(rev), {1}) AS month_avg
FROM (
  SELECT SUM(total) AS rev
  FROM orders
  GROUP BY {2}
)
WHERE rev {3} 0;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the rounding precision",
        why: "The pace line carries two decimals for quarter-over-quarter reads. Rounding to 0 would fold 2488.09 to 2488 and blur the line.",
      },
      {
        answer: "strftime('%Y-%m', created_at)",
        kind: "keyword",
        label: "the month grain",
        why: "The stage buckets orders into calendar months with the '%Y-%m' chop. Grouping by the raw timestamp would stage a line per purchase moment, and the average would read 338.19 — an order average, not a month-take.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the month sanity gate",
        why: "Every real month-take is positive, so rev > 0 passes all fourteen. Flipping to < 0 would demand a revenue-negative month the books never recorded.",
      },
    ],
    distractors: ["0", "created_at", "status", "<"],
    walkthrough:
      "The derived stage sums each month's revenue across the fourteen buckets, and the outer average lands on 2488.09 — the finance pace line the quarterly reads hang from. Folding the precision to 0 would print 2488 and blur the line the team tracks. The grain must be the '%Y-%m' chop: grouping by the raw timestamp averages order totals (338.19) and mislabels it a month-take, while grouping by status averages four status sums nobody budgets against. The sanity gate passes every real month — the flipped < fill would demand a negative month and empty the stage. The pace line, filed: 2488.09 per month.",
  },
  {
    id: "cs-1248",
    tier: "medium",
    topic: "t4",
    universe: "fraud",
    title: "The cancellation map",
    brief:
      "From: Fraud spot-check. Re: the cancellation spread.\n\nCancellations cluster, and the map wants the months they touch. Stage the distinct months that carry at least one cancelled order, with the total gate open, and count the map's nodes — the label guard proves the month grain.",
    ask: "How many distinct months recorded at least one cancellation?",
    template: `SELECT COUNT(*) AS cancel_months
FROM (
  SELECT DISTINCT strftime('%Y-%m', created_at) AS mo
  FROM orders
  WHERE status = {1}
  AND total {2} {3}
)
WHERE mo {4} '';`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the cancellation status",
        why: "The map tracks cancelled work, so the stage filters status = 'cancelled'. Filtering 'pending' would map the stuck-orders spread instead — a different ten months.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must admit every cancellation: totals are positive, so > 0 passes all. Flipping to < 0 would demand negative totals and empty the map.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps every cancellation on the map. A floor of 400 would map only the premium cancellations and shrink the spread.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the label guard direction",
        why: "No month label is the empty string, so != '' keeps the whole map. Flipping to = '' would match nothing and file an empty map.",
      },
    ],
    distractors: ["'pending'", "<", "400", "="],
    walkthrough:
      "Cancelled orders touch five distinct months — 2024-01, 2024-03, 2024-07, 2024-11 and 2025-01 — and that is the map's whole spread, with July and November carrying two each. Filtering 'pending' would draw the stuck-orders map instead, ten months wide and a different story. The total gate stays open so the map covers every cancellation; a 400 floor would keep only the premium lines and shrink the spread. The label guard excludes nothing — no bucket is empty — while the = '' fill would file an empty map. The cancellation map: 5 months.",
  },
  {
    id: "cs-1249",
    tier: "hard",
    topic: "t4",
    universe: "funnel",
    title: "The new-year delivered line",
    brief:
      "From: Growth lead. Re: the 2025 momentum read.\n\nMomentum in the new year rides on completed work. Count the delivered orders from the '%Y-%m' bucket 2025-02 — the latest month on the books — with the lag arithmetic proving the work shipped after it was placed, and the total gate open.",
    ask: "How many February 2025 orders were delivered?",
    template: `SELECT COUNT(*) AS feb25_done
FROM orders
WHERE status = {1}
AND strftime('%Y-%m', created_at) = {2}
AND julianday(shipped_at) {3} julianday(created_at)
AND total {4} {5};`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The momentum read counts completed work, so status is delivered. Filtering 'shipped' would read the in-flight February lane — three orders, a different story.",
      },
      {
        answer: "'2025-02'",
        kind: "keyword",
        label: "the new-year bucket",
        why: "The read targets the latest month on the books, bucket 2025-02. The '2025-01' fill would read January's three delivered orders instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the lag direction",
        why: "Work ships after it is placed, so the ship day number exceeds the order day number. Flipping to < would demand time travel and count nothing.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate must admit every delivered order: totals are positive, so >= 0 passes all. Flipping to <= 0 would demand non-positive totals and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps the whole month in scope. A floor of 500 would read only the premium February lines and shift the momentum number.",
      },
    ],
    distractors: ["'shipped'", "'2025-01'", "<", "<=", "500"],
    walkthrough:
      "February 2025 booked seven orders and four of them are delivered — the momentum line the new-year read opens with. The 'shipped' fill would read the three in-flight February lanes instead; the '2025-01' fill would read January's three delivered orders and flatten the momentum story. The lag direction proves the work shipped after it was placed — the flipped < fill demands time travel and counts nothing. The total gate stays open, since a 500 floor would read only the premium lines. The momentum read: 4 delivered in February 2025.",
  },
  {
    id: "cs-1250",
    tier: "easy",
    topic: "t4",
    universe: "growth",
    title: "The signup cohort months",
    brief:
      "From: Growth lead. Re: the acquisition rhythm.\n\nThe acquisition story starts with the signup calendar: how many distinct months actually brought a new member? Chop the customers' signup dates into '%Y-%m' buckets, stage the distinct months, and count them — excluding nothing.",
    ask: "Count the distinct months in which customers signed up.",
    template: `SELECT COUNT(*) AS cohort_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo
  FROM {1}
  GROUP BY mo
)
WHERE mo {2} {3};`,
    slots: [
      {
        answer: "customers",
        kind: "keyword",
        label: "the roster table",
        why: "Signups live on customers — created_at there marks the member's first day. Orders would census purchase months and tell the acquisition story with the wrong calendar.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the exclusion direction",
        why: "The cohort counts every month, so the guard excludes nothing real with != ''. Flipping to = '' would demand an empty month label and return zero.",
      },
      {
        answer: "''",
        kind: "keyword",
        label: "the never-true label",
        why: "No month bucket renders as the empty string, so != '' keeps the whole cohort. A '2024-06' equality would count the single June signup month.",
      },
    ],
    distractors: ["orders", "=", "'2024-06'"],
    walkthrough:
      "The roster's signup dates chop into nine distinct months — two members a month from November 2023 through May 2024, then singletons in June and July — and the acquisition rhythm reads nine cohort months. Pointing the stage at orders would census the purchase calendar's fourteen months and tell the acquisition story with someone else's numbers. The guard excludes nothing: no bucket is empty, while the = '' fill would report an empty cohort and the '2024-06' fill would count the lone June month. The acquisition rhythm: 9 cohort months.",
  },
];
