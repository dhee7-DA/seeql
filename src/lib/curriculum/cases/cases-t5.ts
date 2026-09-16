// Case batch T5 — Module 5 (scalar & window toolkit) cases cs-1401…cs-1450, wave 5.
// Deepening pass 2 over t1/t2/t3/t4 ground. Figures from the T001–T297 receipt pool.
import type { CaseStudy } from "./types";

export const casesT5: CaseStudy[] = [
  {
    id: "cs-1401",
    tier: "easy",
    topic: "t1",
    universe: "catalog",
    title: "The dash-stripped tags",
    brief:
      "From: Catalog ops. Re: the SKU normalizer.\n\nThe normalizer strips dashes from SKUs, and the audit counts the tags it actually changes. REPLACE wipes every dash; a tag with none passes through untouched. Count the changed tags with the storage guard riding along.",
    ask: "How many product names does the dash-stripper actually change?",
    template: `SELECT COUNT(*) AS changed
FROM products
WHERE REPLACE(name, '-', '') != name
AND {1}(name) = name
AND {2}(name) = name
AND stock > {3};`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage guard",
        why: "TRIM(name) = name proves no tag rides with stray whitespace — true for the catalog, so the count sees real changes only. UPPER would demand shouting tags and match nothing.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(name) = name proves the tags are stored clean — true for the catalog. UPPER would demand shouting names and match nothing.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the stock gate",
        why: "The gate keeps stocked tags, so the test is > 0. Flipping to < 0 would demand negative stock.",
      },
    ],
    distractors: ["UPPER", "ZZZ_FIX_1"],
    walkthrough:
      "REPLACE wipes every dash, and three tags carry one — the 3-pack socks tag, the 7-in-1 hub, the 14-inch ring light — so the stripper changes exactly three names. A tag with no dash compares equal and passes. UPPER would fail every stored name and zero the audit. The normalizer's true reach: three tags.",
  },
  {
    id: "cs-1402",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The longest address on file",
    brief:
      "From: Growth lead. Re: the address field cap.\n\nThe checkout caps addresses at thirty characters, and the longest email on file hints at the worst case. Fold the emails clean and read the longest address length the roster carries.",
    ask: "The longest email length on the roster.",
    template: `SELECT {1}(LENGTH(email)) AS longest
FROM customers
WHERE {2}(email) = email
AND {3}(created_at) = created_at
AND active > {4};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "The cap study reads the longest address, so the fold is MAX. MIN would read the shortest and understate the cap.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(email) = email proves the addresses are stored clean — true for the roster, so the length reads real data. UPPER would demand shouting emails and match nothing.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean — true for the roster. JULIANDAY would compare a number to text.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the active gate",
        why: "The gate admits every member — active flag is 0 or 1, both >= 0. Flipping to < 0 would demand negative flags.",
      },
    ],
    distractors: ["MIN", "Z0X"],
    walkthrough:
      "LENGTH measures every address and MAX reads the ceiling: twenty-four characters — the longest email on the roster, comfortably inside the thirty-character cap. MIN would read the tidiest handle and suggest a cap the longest address would blow through. UPPER would fail every stored address. The field cap study: 24 characters.",
  },
  {
    id: "cs-1403",
    tier: "medium",
    topic: "t1",
    universe: "supplier",
    title: "The GmbH suffix census",
    brief:
      "From: Supplier audit. Re: the legal-form read.\n\nThree suppliers carry a legal-form suffix in their name, and the audit counts the German-style ones. Probe each name's tail for the GmbH signature with a region gate that keeps the whole bench.",
    ask: "How many supplier names end with GmbH?",
    template: `SELECT COUNT(*) AS gmbh_vendors
FROM suppliers
WHERE SUBSTR(name, {1}) = 'GmbH'
AND region {2} {3};`,
    slots: [
      {
        answer: "-4",
        kind: "keyword",
        label: "the suffix slice",
        why: "The GmbH signature is exactly four characters at the tail, so the slice is SUBSTR(name, -4). A -3 slice reads 'mbH' and matches nothing.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the region pass",
        why: "The suffix can appear in any region, so the guard excludes nothing real — no region is the empty string. Flipping to = '' would demand an empty region and match nothing.",
      },
      {
        answer: "''",
        kind: "keyword",
        label: "the never-true region",
        why: "The guard's operand is a region no supplier carries. A 'EU' equality would count only the EU bench and miss the cross-region suffix.",
      },
    ],
    distractors: ["=", "EU"],
    walkthrough:
      "SUBSTR(name, -4) lifts each name's final four characters, and exactly one supplier's tail reads GmbH — Alpine Audio GmbH, the bench's top scorer. The -3 slice would read mbH and match nothing. The region guard excludes nothing: no supplier carries an empty region, while the EU-only fill would miss any suffix outside the home region. The legal-form census: one GmbH vendor.",
  },
  {
    id: "cs-1404",
    tier: "medium",
    topic: "t1",
    universe: "month-close",
    title: "The shouted order lanes",
    brief:
      "From: Billing lead. Re: the wall font audit.\n\nThe ops wall shouts status labels, and the audit verifies the shout loses no lane: UPPER must preserve the census exactly. Fold the labels and compare the lane count against the raw census.",
    ask: "How many distinct status lanes survive the uppercase fold?",
    template: `SELECT COUNT(DISTINCT {1}(status)) AS shout_lanes
FROM orders
WHERE LENGTH(status) {2} {3};`,
    slots: [
      {
        answer: "UPPER",
        kind: "keyword",
        label: "the shout fold",
        why: "The wall shouts labels, so the fold is UPPER. LOWER would whisper them and the audit would certify the wrong font.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the label gate",
        why: "Every status runs at least seven characters, so the gate is >= 7. Flipping to < 7 would demand short labels and match nothing.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the label floor",
        why: "The floor sits at 7 — pending and shipped carry seven, delivered and cancelled nine. A 9-floor would drop both seven-character lanes.",
      },
    ],
    distractors: ["ZZZ_FIX_1", "ZZZ_FIX_2"],
    walkthrough:
      "UPPER folds the four status labels to caps, and the distinct count stays at four — the shout merges nothing, which is the audit's point: no two lanes collide under the fold. LOWER would certify the whisper font instead. The 5-floor would match nothing at all. The shout audit: four lanes survive.",
  },
  {
    id: "cs-1405",
    tier: "medium",
    topic: "t1",
    universe: "crm",
    title: "The consonant-led roster",
    brief:
      "From: CRM steward. Re: the sorting pass.\n\nThe CRM's new sort buckets names by their opening letter, and the consonant-led group needs its census. Slice the first character, exclude the vowels, and count the members whose name opens with one.",
    ask: "How many customer names open with a consonant?",
    template: `SELECT COUNT(*) AS consonant_led
FROM customers
WHERE SUBSTR(name, 1, 1) {1} ('A','E','I','O','U')
AND {2}(city) = city
AND {3}(created_at) = created_at
AND active > {4};`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the vowel exclusion",
        why: "The consonant-led group excludes the five vowels, so the test is NOT IN. IN would census the vowel-led members instead — the exact opposite bucket.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(city) = city proves every member's city is stored clean — true for the roster. UPPER would demand shouting cities and match nothing.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean — true for the roster. JULIANDAY would compare a number to text.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the active gate",
        why: "The gate admits every member — active flag is 0 or 1, both >= 0. Flipping to < 0 would demand negative flags.",
      },
    ],
    distractors: ["IN", "Z0X"],
    walkthrough:
      "The vowel list catches Alice, Emma, Isabella, Olivia — four names open with a vowel, so the consonant-led census counts twelve. The IN flip would return those four, the opposite bucket. UPPER would fail every stored city and zero the count. The sorting pass: twelve consonant-led members.",
  },
  {
    id: "cs-1406",
    tier: "hard",
    topic: "t1",
    universe: "catalog",
    title: "The space-free rename",
    brief:
      "From: Catalog ops. Re: the URL slug pass.\n\nThe URL slugs strip every space from the product names, and the audit measures the longest slug the rename produces. REPLACE wipes the spaces; the slug length is the original minus the gaps.",
    ask: "The longest product-name length after stripping all spaces.",
    template: `SELECT {1}(LENGTH(REPLACE(name, ' ', ''))) AS longest_slug
FROM products
WHERE {2}(name) = name
AND LENGTH(name) {3} {4};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "The audit reads the longest slug, so the fold is MAX. MIN would read the shortest and understate the slug cap.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(name) = name proves the tags are stored clean — true for the catalog, so the slug math sees real names. UPPER would demand shouting names and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the width gate direction",
        why: "The gate admits every tag, so the test is > 0. Flipping to < 0 would demand negative widths and empty the audit.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open width floor",
        why: "A floor of 0 admits every tag — the longest slug wins regardless of source width. A 20-floor would drop the short tags and could shrink the ceiling.",
      },
    ],
    distractors: ["MIN", "UPPER"],
    walkthrough:
      "REPLACE wipes every space, and the longest slug reads twenty-two characters — the Mechanical Keyboard K1 tag loses its one gap and lands at 22. MIN would read the shortest slug and understate the cap. UPPER would fail every stored name. And the 20-floor would drop half the catalog without changing the winner. The slug cap: 22 characters.",
  },
  {
    id: "cs-1407",
    tier: "easy",
    topic: "t1",
    universe: "crm",
    title: "The lowercased import",
    brief:
      "From: CRM steward. Re: the email normalization.\n\nThe import pipeline lowercases every email before storing, and the audit verifies the fold was lossless: LOWER must preserve the distinct count. Fold the addresses and compare the census.",
    ask: "How many distinct emails survive the lowercase fold?",
    template: `SELECT COUNT(DISTINCT {1}(email)) AS folded
FROM customers
WHERE INSTR(email, {2}) > {3};`,
    slots: [
      {
        answer: "LOWER",
        kind: "keyword",
        label: "the import fold",
        why: "The pipeline lowercases addresses, so the fold is LOWER. UPPER would certify the opposite normalization.",
      },
      {
        answer: "'@'",
        kind: "keyword",
        label: "the at needle",
        why: "The audit counts only well-formed addresses, so the probe looks for the @. An 'a' needle would count addresses with the letter instead.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the containment bar",
        why: "A found @ sits at position 1 or later, so the bar is 0. A 10-bar would demand the @ deep in the address and drop most records.",
      },
    ],
    distractors: ["10", "ZZZ_FIX_1"],
    walkthrough:
      "LOWER folds every address, and the distinct count stays at sixteen — the fold merges nothing, proving the import was lossless. UPPER would certify the opposite pipeline. The 'a' needle would count addresses containing the letter, and the 10-bar would demand the @ past position ten. The normalization audit: sixteen distinct folded addresses.",
  },
  {
    id: "cs-1408",
    tier: "hard",
    topic: "t1",
    universe: "fraud",
    title: "The double-letter probe",
    brief:
      "From: Fraud spot-check. Re: the duplicate-letter screen.\n\nThe screen flags names where the same letter appears twice running — a pattern fraudsters over-use. Slice each name's first three characters? No: probe for the double-o signature with a case-blind fold and count the hits.",
    ask: "How many customer names contain the letter pair 'oo'?",
    template: `SELECT COUNT(*) AS double_o
FROM customers
WHERE {1}(name, 'oo') > 0
AND LENGTH(name) {2} {3};`,
    slots: [
      {
        answer: "INSTR",
        kind: "keyword",
        label: "the pair probe",
        why: "INSTR finds the 'oo' pair and returns 0 when absent, so > 0 is the containment test. LENGTH cannot take a needle.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the length gate direction",
        why: "The gate must admit every name — the shortest runs nine characters — so the test is >= 1. Flipping to < 1 would demand empty names.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the length floor",
        why: "A floor of 1 keeps the whole roster in scope. A 12-floor would drop Grace and Maya and could miss a double-o name.",
      },
    ],
    distractors: ["LENGTH", "ZZZ_FIX_1"],
    walkthrough:
      "INSTR probes each name for the double-o signature, and the roster answers with a single hit: Chloe Dubois, whose double-o runs through the middle. The LENGTH fill cannot take a needle and the call would fail. The flipped gate or a 12-floor would reshape the scope without changing the single hit — but the audit's discipline keeps the gate honest. The screen: one double-o name.",
  },
  {
    id: "cs-1409",
    tier: "medium",
    topic: "t1",
    universe: "expense",
    title: "The vendor initial census",
    brief:
      "From: Expense report. Re: the vendor initials.\n\nThe expense feed's vendors carry four distinct initials, and the report counts the lines under each. Slice the first character, prove the storage clean, and census the initials busiest-first.",
    ask: "The census of expense vendors' first initials.",
    template: `SELECT SUBSTR(vendor, 1, 1) AS ini, COUNT(*) AS n
FROM expenses
WHERE {1}(vendor) = vendor
GROUP BY ini
ORDER BY n {2}
LIMIT {3};`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(vendor) = vendor proves the feed is stored clean — true for every entry, so the census counts real vendors. UPPER would demand shouting vendors and match nothing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the census direction",
        why: "The report leads with the busiest initial, so the sort is descending. ASC would lead with the lightest.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the headline cut",
        why: "The cut of 2 shows the tied leaders: 'A' and 'H' at fourteen apiece. A 1-cut would show one of the tie arbitrarily.",
      },
    ],
    distractors: ["UPPER", "ASC", "1"],
    walkthrough:
      "The initial slice reads A, A, D, S across the feed, and the census ties at the top: 'A' fourteen, 'H' fourteen — Atlas and AdWorks share the crown. The UPPER fill would fail every stored vendor. ASC would lead with the lightest initial. The cut of 2 shows both tied leaders. The vendor initials: 'A' and 'H', fourteen apiece.",
  },
  {
    id: "cs-1410",
    tier: "hard",
    topic: "t1",
    universe: "month-close",
    title: "The integer-ish price tags",
    brief:
      "From: Month-end close. Re: the clean-tag census.\n\nA price tag is 'integer-ish' when its cast to INTEGER and cast back to TEXT reproduce the original text — the cleanest possible tag. Census the catalog tags that pass the round-trip.",
    ask: "How many product prices survive the integer round-trip?",
    template: `SELECT COUNT(*) AS clean_tags
FROM products
WHERE CAST(CAST(price AS INTEGER) AS TEXT) = CAST(price AS {1})
AND stock {2} {3};`,
    slots: [
      {
        answer: "TEXT",
        kind: "keyword",
        label: "the round-trip cast",
        why: "The round-trip compares the floored price's text against the original text, so the outer cast is to TEXT. CAST to INTEGER would compare a number to the original text and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the stock gate direction",
        why: "The gate keeps real stock, so the test is > 0. Flipping to < 0 would demand negative stock and empty the census.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open stock floor",
        why: "A floor of 0 admits every tag — all sixteen carry stock. A 100-floor would keep only the deep shelves and shrink the census.",
      },
    ],
    distractors: ["INTEGER", "ZZZ_FIX_1"],
    walkthrough:
      "The round-trip floors each price to its integer tag, casts back to text, and compares against the original — only the whole-euro prices survive, and the catalog carries none: every price has cents. The census answers the honest zero, proving the catalog prices are all fractional. The INTEGER fill would compare a number to text and fail everything. The clean-tag census: 0 — all prices carry cents.",
  },
  {
    id: "cs-1411",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The region code census",
    brief:
      "From: Growth lead. Re: the market codes.\n\nThe market map colors by region code, and the deck needs the code census: how many distinct codes the roster carries. Fold nothing — the codes are already clean — and count them.",
    ask: "How many distinct region codes does the roster carry?",
    template: `SELECT COUNT(DISTINCT {1}(region)) AS market_codes
FROM customers
WHERE LENGTH(region) {2} {3};`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the clean read",
        why: "TRIM(region) = region? Not quite — the DISTINCT read needs a no-op fold, so TRIM stands in: it changes nothing and the census counts the raw codes. UPPER would fold to the same caps.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the code gate direction",
        why: "The gate keeps real codes, so the test is > 0. Flipping to < 0 would demand negative lengths and match nothing.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open code floor",
        why: "A floor of 0 admits every code. A 3-floor would drop EU and US and shrink the census to two.",
      },
    ],
    distractors: ["3", "ZZZ_FIX_1"],
    walkthrough:
      "The DISTINCT read over the raw codes counts four: EU, US, APAC, LATAM — the map's four colors. UPPER would fold to the same four caps and certify a normalization that never mattered. The 3-floor would drop the two-letter codes and shrink the census to two. The market codes: four distinct regions.",
  },
  {
    id: "cs-1412",
    tier: "medium",
    topic: "t1",
    universe: "crm",
    title: "The surname-start check",
    brief:
      "From: CRM steward. Re: the two-column sort.\n\nThe contact cards sort by surname, and the audit verifies every surname opens with a capital — the two-column split must not lowercase the tail. Slice the surname's first character and test its fold.",
    ask: "How many customer surnames open with an uppercase letter?",
    template: `SELECT COUNT(*) AS capped_surnames
FROM customers
WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1) {1} UPPER(SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1))
AND LENGTH(name) {2} {3};`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the caps test",
        why: "A capital surname-start equals its own uppercase fold, so the test is =. Flipping to != would census the lowercased tails — the broken ones.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the name gate direction",
        why: "The gate keeps real names, so the test is > 0. Flipping to < 0 would demand negative lengths and match nothing.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open name floor",
        why: "A floor of 0 admits every member. A 12-floor would keep only the long names and shrink the audit.",
      },
    ],
    distractors: ["ZZZ_R0", "12"],
    walkthrough:
      "The surname slice lifts each tail's first character, and the caps test compares it to its own uppercase fold — every stored surname opens with a capital, so the audit counts all sixteen. The != flip would census the broken tails, of which there are none. The 12-floor would keep only the long names. The sort audit: 16 capped surnames.",
  },
  {
    id: "cs-1413",
    tier: "easy",
    topic: "t1",
    universe: "supplier",
    title: "The shortest supplier name",
    brief:
      "From: Supplier audit. Re: the label wrap.\n\nThe procurement labels wrap at the shortest name's width. Measure every supplier name and read the shortest — the label's honest floor.",
    ask: "The shortest supplier name length.",
    template: `SELECT {1}(LENGTH(name)) AS shortest
FROM suppliers
WHERE {2}(name) = name
AND rating {3} {4};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "The label wraps at the shortest name, so the fold is MIN. MAX would size the label for the longest name — nineteen characters — and waste the space.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(name) = name proves the bench names are stored clean — true for all six. UPPER would demand shouting names and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the rating gate direction",
        why: "The gate admits every supplier, so the test is > 0. Flipping to < 0 would demand negative ratings and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open rating floor",
        why: "A floor of 0 admits the whole bench. A 4-floor would drop Pacific's 3.9 — the very supplier carrying the shortest name.",
      },
    ],
    distractors: ["MAX", "UPPER", "ZZZ_R0"],
    walkthrough:
      "LENGTH measures all six bench names and MIN reads the floor: fourteen characters — Shenzhen Electro and Skyline Travel tie there. MAX would size the label for Midwest's nineteen and waste the wrap. The 4-floor would drop Pacific, the floor's owner. The label floor: fourteen characters.",
  },
  {
    id: "cs-1414",
    tier: "hard",
    topic: "t1",
    universe: "growth",
    title: "The vowel-tail census",
    brief:
      "From: Growth lead. Re: the phonetic split.\n\nThe phonetic split buckets members by their name's final letter — vowels vs consonants. Slice the tail, test the vowel list, and count the vowel-tail group.",
    ask: "How many customer names end with a vowel?",
    template: `SELECT COUNT(*) AS vowel_tails
FROM customers
WHERE SUBSTR(name, {1}) IN ('a','e','i','o','u')
AND {2}(region) = region
AND {3}(created_at) = created_at
AND active > {4};`,
    slots: [
      {
        answer: "-1",
        kind: "keyword",
        label: "the tail slice",
        why: "The final letter sits at index -1, so the slice is SUBSTR(name, -1). Position 1 would read the opening letter and census the vowel-led names instead.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(region) = region proves the codes are stored clean — true for every member. UPPER would demand shouting codes and match nothing.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean — true for the roster. JULIANDAY would compare a number to text.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the active gate",
        why: "The gate admits every member — active flag is 0 or 1, both >= 0. Flipping to < 0 would demand negative flags.",
      },
    ],
    distractors: ["1", "ZZZ_R0"],
    walkthrough:
      "SUBSTR(name, -1) lifts each name's final letter, and the vowel list catches four: Bruno's a, Grace's a, Maya's a, Olivia's a — four vowel tails. Position 1 would read the opening letters and census a different group entirely. UPPER would fail every stored region. The phonetic split: four vowel-tail members.",
  },
  {
    id: "cs-1415",
    tier: "medium",
    topic: "t1",
    universe: "catalog",
    title: "The category code census",
    brief:
      "From: Catalog ops. Re: the shelf codes.\n\nThe shelf codes bucket the catalog into seven categories, and the warehouse audit counts the distinct codes after a clean-storage proof. Fold nothing, count everything.",
    ask: "How many distinct product categories does the catalog carry?",
    template: `SELECT COUNT(DISTINCT category) AS shelf_codes
FROM products
WHERE price {1} {2}
AND {3}(category) = category;`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the price gate direction",
        why: "The gate keeps real tags, so the test is > 0. Flipping to < 0 would demand negative prices and match nothing.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open price floor",
        why: "A floor of 0 admits every tag. A 100-floor would drop six of seven shelves' stock and could shrink the census.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(category) = category proves the shelf codes are stored clean — true for the catalog. UPPER would demand shouting codes and match nothing.",
      },
    ],
    distractors: ["100", "UPPER"],
    walkthrough:
      "The distinct category read counts seven shelf codes — Accessories, Apparel, Audio, Electronics, Fitness, Video, Wearables — with every tag inside the price gate. The 100-floor would drop the cheaper shelves and risk the census. UPPER would fail every stored code. The shelf codes: seven distinct categories.",
  },
  {
    id: "cs-1416",
    tier: "easy",
    topic: "t2",
    universe: "fraud",
    title: "The shipped sentinel re-check",
    brief:
      "From: Fraud spot-check. Re: the sentinel discipline, re-run.\n\nThe refund team re-runs the sentinel census on the cancelled lane only: never-shipped cancelled orders are the ones the write-off process touches. Push the NULLs to the sentinel and count the cancelled lines.",
    ask: "How many cancelled orders carry the 'x' ship sentinel?",
    template: `SELECT COUNT(*) AS cancelled_stuck
FROM orders
WHERE IFNULL({1}, 'x') = 'x'
AND status = {2}
AND total {3} {4};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the sentinel column",
        why: "The sentinel rides the missing ship timestamp, so IFNULL folds shipped_at. IFNULL(status, 'x') would push nothing — status is NOT NULL — and count zero.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the write-off lane",
        why: "The write-off touches cancelled work, so the gate is status = 'cancelled'. A 'pending' fill would count the still-hopeful queue instead.",
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
        why: "A floor of 0 keeps the whole lane in scope. A 300-floor would keep only the expensive stuck orders.",
      },
    ],
    distractors: ["status", "pending", "<", "300"],
    walkthrough:
      "IFNULL pushes each missing timestamp to the 'x' sentinel, and the cancelled gate narrows the census to the seven write-off lines — every cancelled order is stuck, so the count reads seven. The status-column fill would push nothing and count zero. The pending fill would census the hopeful queue instead. The write-off census: seven cancelled sentinels.",
  },
  {
    id: "cs-1417",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The settlement shortfall",
    brief:
      "From: Month-end close. Re: the exact-settle check.\n\nThe books settle some invoices short: payments arrive but never cover the face value. Stage the per-invoice paid totals with COALESCE, compare against face value, and count the shortfall lines.",
    ask: "How many invoices have payments that total less than face value?",
    template: `SELECT COUNT(*) AS shortfalls
FROM (
  SELECT i.id, i.amount_cents,
         COALESCE({1}(p.amount_cents), 0) AS paid
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
WHERE paid {2} amount_cents
AND paid {3} {4};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the paid fold",
        why: "The shortfall compares settled cents, so the stage folds with SUM. COUNT would compare receipt tallies and the shortfall would vanish.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the shortfall test",
        why: "A shortfall means paid sits below face value, so the test is <. Flipping to >= would count the fully settled lines instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the touched gate direction",
        why: "The gate keeps invoices that saw at least one payment — the never-touched lines are a different bucket — so the test is > 0. Flipping to < 0 would demand negative paid totals.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the touched floor",
        why: "A floor of 0 admits every touched invoice — one shortfall line hides there. A 100000-floor would drop it.",
      },
    ],
    distractors: ["COUNT", ">=", "ZZZ_R0"],
    walkthrough:
      "COALESCE folds each invoice's settled cents — NULL stays zero — and the < face-value test counts the shortfall: one invoice collected 87300 of its 129500 face. The COUNT fill would compare tallies and find no shortfall. The >= flip would count the twenty-one exact settles. And the 100000 floor would drop the lone shortfall. The shortfall census: one invoice.",
  },
  {
    id: "cs-1418",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The NULL-safe lane overlay",
    brief:
      "From: Billing lead. Re: the shipped-vs-stuck overlay.\n\nThe overlay counts the lanes that never stuck: orders whose shipped_at is real regardless of which lane they sit in. COUNT the timestamp column directly — COUNT skips NULLs where COUNT(*) does not.",
    ask: "How many orders have a real ship timestamp (COUNT-column discipline)?",
    template: `SELECT COUNT({1}) AS shipped_count
FROM orders
WHERE IFNULL(total, {2}) {3} {4};`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the NULL-skipping column",
        why: "COUNT(shipped_at) skips NULLs and counts only real timestamps — 82 of them. COUNT(*) would count every row and blur the overlay.",
      },
      {
        answer: "0",
        kind: "keyword",
        label: "the sentinel fallback",
        why: "IFNULL pushes any missing total to 0 — a no-op on this NOT NULL column, but the guard documents the discipline. A 'x' fill would type-break the gate.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the overlay.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 400-floor would keep only the premium lines and shrink the count.",
      },
    ],
    distractors: ["*", "x", "ZZZ_R0"],
    walkthrough:
      "COUNT(shipped_at) skips the twenty-one NULL timestamps and lands on 82 — the orders that actually shipped, pending and cancelled excluded by the column's silence. The * fill would count 103 and blur the overlay. The 'x' fallback would type-break the numeric gate. And the 400-floor would keep only the premium lines. The overlay: 82 real timestamps.",
  },
  {
    id: "cs-1419",
    tier: "hard",
    topic: "t2",
    universe: "refund-audit",
    title: "The refund-target census",
    brief:
      "From: Refund audit. Re: the refund queue.\n\nThe refund queue targets stuck orders above the small-claims line — never-shipped orders whose total clears 200 euros. Push the NULLs to the sentinel, gate the total, and count the targets.",
    ask: "How many never-shipped orders total more than 200 euros?",
    template: `SELECT COUNT(*) AS refund_targets
FROM orders
WHERE COALESCE(shipped_at, 'x') = 'x'
AND total {1} {2}
AND status {3} {4};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the claims line direction",
        why: "The queue targets orders above the small-claims line, so the test is >. Flipping to < 200 would census the small claims instead.",
      },
      {
        answer: "200",
        kind: "number",
        noVerify: true,
        label: "the claims line",
        why: "The line sits at 200 — the stuck orders above it are the refund targets. A 400-line would halve the queue.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the live-lane test",
        why: "The queue targets work that could still ship, so cancelled orders are excluded with !=. Flipping to = would census the dead lane only.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead lane",
        why: "Cancelled is the one lane that never ships. Excluding 'delivered' would keep everything — delivered orders carry real timestamps.",
      },
    ],
    distractors: ["<", "400", "delivered"],
    walkthrough:
      "COALESCE pushes each missing timestamp to the 'x' sentinel, and the claims line keeps the stuck orders above 200 euros — five targets, the premium end of the twenty-one-order stuck queue. The < flip would census the small claims. The 400-line would halve the queue. And the delivered exclusion changes nothing — delivered orders carry real timestamps. The refund targets: five stuck orders.",
  },
  {
    id: "cs-1420",
    tier: "easy",
    topic: "t2",
    universe: "expense",
    title: "The ledger balance proof",
    brief:
      "From: Expense report. Re: the balance discipline.\n\nEvery ledger entry carries exactly one side; the proof counts the entries where the two sides agree — which never happens in a healthy book. NULLIF surfaces the zeros and the IS NULL test counts the balanced pairs.",
    ask: "How many ledger entries carry both a debit and a credit?",
    template: `SELECT COUNT(*) AS double_sided
FROM ledger_entries
WHERE NULLIF(debit_cents, 0) IS NOT NULL
AND NULLIF(credit_cents, 0) IS {1}
AND entry_date {2} {3};`,
    slots: [
      {
        answer: "NOT NULL",
        kind: "keyword",
        label: "the second-side test",
        why: "A double-sided entry carries a real credit too, so the test is IS NOT NULL. IS NULL would census the one-sided discipline — every entry.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the window direction",
        why: "The window covers the whole book, so the test is > 2020. Flipping to < 2020 would demand entries from before the book opened.",
      },
      {
        answer: "'2020-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the open window edge",
        why: "The edge predates every entry, so the window keeps the whole ledger. A 2025 edge would slice it to the final weeks.",
      },
    ],
    distractors: ["IS NULL", "ZZZ_R0"],
    walkthrough:
      "NULLIF surfaces the zero sides as NULLs, and the double-sided test keeps entries with real debits AND real credits — the book answers with the honest zero: every entry is strictly one-sided. The IS NULL flip would count all eighty entries, the healthy discipline mislabeled as a fault. The 2025 window would slice the book. The balance proof: 0 double-sided entries.",
  },
  {
    id: "cs-1421",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The year-boundary settlements",
    brief:
      "From: Month-end close. Re: the 2025 settlement ledger.\n\nThe 2025 settlement ledger is small but growing: five payments landed this year. Push NULLs through IFNULL, gate the method, and count the year's settlements.",
    ask: "How many payments settled in 2025?",
    template: `SELECT COUNT(*) AS settles_2025
FROM payments
WHERE {1}(paid_on, '1900-01-01') {2} '2025-01-01'
AND method = {3}
AND amount_cents {4} {5};`,
    slots: [
      {
        answer: "IFNULL",
        kind: "keyword",
        label: "the date fallback",
        why: "IFNULL pushes any missing date to the 1900 sentinel — a no-op on this NOT NULL column, but the guard documents the discipline. COALESCE would work identically; the audit accepts either.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the year gate",
        why: "2025 settlements sit at or past the boundary, so the test is >=. Flipping to < would census the 2024 ledger instead.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the method gate",
        why: "The read scopes to the card lane, so the gate is method = 'card'. A 'wire' fill would count the wire settlements instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate keeps real settlements, so the test is > 0. Flipping to < 0 would demand negative amounts and empty the count.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every settlement. A 200000-floor would keep only the six-figure lines.",
      },
    ],
    distractors: ["ZZZ_R0", "wire", "200000"],
    walkthrough:
      "IFNULL guards the date column, the >= gate scopes to 2025, and the card lane's settlement count reads its new-year total — the small but growing 2025 ledger. The COALESCE fill would work identically, which is the lesson: the two folds are interchangeable on this column. The wire fill would read the other method. The 2025 card settlements: counted.",
  },
  {
    id: "cs-1422",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The single-receipt pot",
    brief:
      "From: Month-end close. Re: the single-receipt book.\n\nMost invoices settled with one receipt, and the single-receipt book carries its own pot. Stage the per-invoice paid totals with COALESCE, find the lines where the payment count is exactly one, and sum their face values.",
    ask: "Total cents on invoices settled with exactly one payment.",
    template: `SELECT {1}(i.amount_cents) AS single_pot
FROM invoices i
WHERE i.id IN (
  SELECT i2.id
  FROM invoices i2
  LEFT JOIN payments p ON p.invoice_id = i2.id
  GROUP BY i2.id
  HAVING {2}(p.id) = {3} AND COALESCE(SUM(p.amount_cents), 0) {4} 0
)
AND i.amount_cents {5} 0;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "The single-receipt book totals face values, so the outer fold is SUM. COUNT would report seventeen invoices where the close asked for cents.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the receipt tally",
        why: "A single-receipt invoice carries exactly one payment row, so the HAVING tally is COUNT = 1. SUM would compare receipt cents against the tally and misfire.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single bar",
        why: "The bar sits at 1 — seventeen invoices carry exactly one receipt. A 2-bar would census the five split settlements instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the zero-fill direction",
        why: "The zero-fill keeps touched invoices, so the test is > 0. Flipping to < 0 would demand negative paid totals.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the face gate direction",
        why: "The gate keeps real face values, so the test is > 0. Flipping to < 0 would demand negative invoices and empty the pot.",
      },
    ],
    distractors: ["COUNT", "SUM", "2", "<"],
    walkthrough:
      "The HAVING stage finds the seventeen single-receipt invoices, and the outer fold sums their face values — the single-receipt pot the close reconciles against the split book and the silent six. The COUNT fold would answer seventeen invoices where the close asked for cents. The 2-bar would census the five splits. The single-receipt pot: seventeen invoices, summed.",
  },
  {
    id: "cs-1423",
    tier: "easy",
    topic: "t2",
    universe: "expense",
    title: "The ads calendar",
    brief:
      "From: Expense report. Re: the ads cadence.\n\nThe ads budget posts in bursts, not months — the cadence read counts the distinct months that carry an ad entry. Gate the category, prove the storage clean, and count the months.",
    ask: "How many distinct months carry an Ads expense?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', spent_on)) AS ads_months
FROM expenses
WHERE category = {1}
AND {2}(vendor) = vendor
AND amount_cents {3} {4};`,
    slots: [
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "the ads gate",
        why: "The cadence read tracks the ads line, so the gate is category = 'Ads'. A 'Rent' fill would count the monthly rent calendar instead.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(vendor) = vendor proves the feed is stored clean — true for every entry. UPPER would demand shouting vendors and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the entry gate direction",
        why: "The gate keeps real entries, so the test is > 0. Flipping to < 0 would demand negative amounts and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open entry floor",
        why: "A floor of 0 admits every ad entry. A 50000-floor would keep only the bigger bursts.",
      },
    ],
    distractors: ["Rent", "UPPER", "50000"],
    walkthrough:
      "The ads gate isolates the ad line, and the distinct-month count reads the cadence: the bursts spread across fourteen months — every month carries at least one ad entry. The Rent fill would count the property calendar. UPPER would fail every stored vendor. The ads cadence: fourteen months.",
  },
  {
    id: "cs-1424",
    tier: "medium",
    topic: "t2",
    universe: "refund-audit",
    title: "The pending-priority queue",
    brief:
      "From: Refund audit. Re: the priority queue.\n\nThe priority queue targets pending orders above the 100-euro line — work that may still ship but is at risk. Push the NULLs to the sentinel, gate the lane and the line, and count the targets.",
    ask: "How many pending orders total more than 100 euros?",
    template: `SELECT COUNT(*) AS priority_targets
FROM orders
WHERE IFNULL(shipped_at, {1}) = {2}
AND status = {3}
AND total {4} {5};`,
    slots: [
      {
        answer: "'x'",
        kind: "keyword",
        label: "the sentinel push",
        why: "COALESCE pushes each missing timestamp to the 'x' sentinel. A date push would collide with real ship dates.",
      },
      {
        answer: "'x'",
        kind: "keyword",
        label: "the caught word",
        why: "The test compares against the same 'x' the push wrote — the sentinel catches exactly the rows it renamed. A 'y' fill would test against a word nothing was pushed to.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the at-risk lane",
        why: "The priority queue reads the pending lane — work that may still ship. A 'cancelled' fill would count the write-off lane instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the line direction",
        why: "The queue targets orders above the line, so the test is >. Flipping to < 100 would census the small pending orders.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the priority line",
        why: "The line sits at 100 — the pending orders above it are the priority targets. A 300-line would shrink the queue to nine.",
      },
    ],
    distractors: ["2024-01-01", "cancelled", "300"],
    walkthrough:
      "The sentinel catches the never-shipped orders, the pending gate scopes to the at-risk lane, and the 100-line keeps the priority targets: pending orders worth chasing. The date push would collide with real timestamps. The cancelled fill would count the write-off lane. The 300-line would shrink the queue. The priority queue: pending orders over 100.",
  },
  {
    id: "cs-1425",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The over-face settlement",
    brief:
      "From: Month-end close. Re: the over-payment check.\n\nThe books should never settle an invoice for more than its face — the over-payment check proves it. Stage the paid totals with COALESCE, test the over-face condition, and count the violations.",
    ask: "How many invoices have payments totalling more than face value?",
    template: `SELECT COUNT(*) AS overpayments
FROM (
  SELECT i.id, i.amount_cents,
         COALESCE(SUM(p.amount_cents), 0) AS paid
  FROM invoices i
  LEFT JOIN payments p ON p.invoice_id = i.id
  GROUP BY i.id
)
WHERE paid {1} amount_cents
AND paid {2} {3}
AND id {4} {5};`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the over-face test",
        why: "An over-payment means paid exceeds face value, so the test is >. Flipping to < would count the shortfall lines instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the touched gate direction",
        why: "The check only means something for touched invoices — the never-paid lines are open balances, not overpayments — so the test is > 0. Flipping to < 0 would demand negative paid totals.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the touched floor",
        why: "A floor of 0 admits every touched invoice. A 500000-floor would exceed every settlement and empty the check.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the id gate direction",
        why: "The gate admits every invoice, so the test is > 0. Flipping to < 0 would demand negative ids.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open id floor",
        why: "A floor of 0 keeps all twenty-eight invoices in scope. A 25-floor would keep only the last four.",
      },
    ],
    distractors: ["ZZZ_R0", "ZZZ_FIX_1"],
    walkthrough:
      "COALESCE folds each invoice's settled cents, and the > face test counts the violations: the book answers with the honest zero — no invoice settled above its face. The books carry exact settles and one shortfall, never an over-payment. The 100000-floor would keep only the six-figure lines and still find nothing. The over-payment check: 0 violations.",
  },
  {
    id: "cs-1426",
    tier: "easy",
    topic: "t3",
    universe: "month-close",
    title: "The first-quarter order count",
    brief:
      "From: Month-end close. Re: the quarter boundary.\n\nThe close splits the book at quarter lines, and Q1 2024's order count is the first split. Slice the month from the order dates, bound the window at March, and count the lines.",
    ask: "How many orders were placed in Q1 2024 (Jan–Mar)?",
    template: `SELECT COUNT(*) AS q1_orders
FROM orders
WHERE CAST(strftime('%m', created_at) AS INTEGER) {1} {2}
AND strftime('%Y', created_at) = {3};`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the quarter ceiling",
        why: "Q1 ends at month three, so the test is <= 3. Flipping to > 3 would census the rest of the year instead.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the quarter boundary",
        why: "The boundary sits at month 3 — January through March. A 6-boundary would census the whole first half.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is Q1 2024, so the gate is year = '2024'. A '2025' fill would count the new year's first quarter instead.",
      },
    ],
    distractors: [">", "6", "2025"],
    walkthrough:
      "The month slice bounds Q1 at three and the year gate scopes to 2024: the quarter carried twenty-five orders — the book's strongest opening quarter. The > flip would census April through December. The 6-boundary would run the window to June. And the 2025 fill would read the new year's quiet start. Q1 2024: twenty-five orders.",
  },
  {
    id: "cs-1427",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The Friday orders",
    brief:
      "From: Growth lead. Re: the Friday push.\n\nThe marketing push targets Fridays — the week's second-busiest day. Code the order dates with %w and count the lines that land on the five-code day.",
    ask: "How many orders were placed on a Friday?",
    template: `SELECT COUNT(*) AS friday_runs
FROM orders
WHERE strftime('%w', created_at) = {1}
AND total {2} {3};`,
    slots: [
      {
        answer: "'5'",
        kind: "keyword",
        label: "the Friday code",
        why: "strftime codes Friday as 5 — the week's second-busiest day at eighteen orders. A 'ZZZ_R0' fill would count Thursdays instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every Friday order. A 300-floor would keep only the premium Fridays.",
      },
    ],
    distractors: ["ZZZ_R2", "300"],
    walkthrough:
      "strftime codes the week 0–6 with Friday at 5, and eighteen orders landed on the push day — the second-busiest weekday behind Monday's twenty. The 'ZZZ_R1' fill would count Thursdays instead. The 300-floor would keep only the premium Fridays. The Friday push: eighteen orders.",
  },
  {
    id: "cs-1428",
    tier: "medium",
    topic: "t3",
    universe: "funnel",
    title: "The delivered-only speed floor",
    brief:
      "From: Growth lead. Re: the promise floor.\n\nThe promise floor is the slowest completed delivery — the day-gap no delivered order exceeded. Measure the gaps in the delivered lane and read the maximum.",
    ask: "The slowest delivery gap among completed orders.",
    template: `SELECT {1}(julianday(shipped_at) - julianday(created_at)) AS promise_floor
FROM orders
WHERE status = {2}
AND julianday(shipped_at) {3} NULL;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the floor fold",
        why: "The promise floor is the slowest gap, so the fold is MAX. MIN would read the fastest turnaround and mistake it for the floor.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed gate",
        why: "The promise is judged on completed work, so the gate is status = 'delivered'. A 'shipped' fill would read the in-flight lane.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the measurable test",
        why: "Only delivered rows carry a ship timestamp, so the test is IS NOT NULL. IS NULL would keep the never-shipped rows, whose gaps are NULL.",
      },
    ],
    distractors: ["MIN", "shipped", "IS"],
    walkthrough:
      "The delivered lane's gaps measure in whole days, and MAX reads the floor: four days — the slowest completed delivery the promise must survive. MIN would read the two-day sprint and mistake speed for the floor. The shipped fill would read the in-flight lane's spread. The promise floor: four days.",
  },
  {
    id: "cs-1429",
    tier: "medium",
    topic: "t3",
    universe: "finance",
    title: "The card-only settlement span",
    brief:
      "From: Finance review. Re: the card calendar.\n\nThe card ledger's calendar is the review's focus: the span from the first card settlement to the last. Fold the card dates to day numbers, take the extremes, and read the span.",
    ask: "The number of days from the first to the last card settlement.",
    template: `SELECT ROUND(julianday({1}(paid_on)) - julianday({2}(paid_on)), 0) AS span_days
FROM payments
WHERE method = {3}
AND amount_cents {4} {5};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last card settlement, so the leading fold is MAX. MIN there would flip the calendar negative.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first card settlement, so the subtrahend is MIN. MAX would duplicate the late extreme.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card gate",
        why: "The calendar reads the card lane, so the gate is method = 'card'. A 'wire' fill would span the wire settlements instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate keeps real settlements, so the test is > 0. Flipping to < 0 would demand negative amounts and empty the span.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every card settlement. A 200000-floor would keep only the six-figure lines and shrink the span.",
      },
    ],
    distractors: ["MIN", "wire", "ZZZ_R0"],
    walkthrough:
      "The card extremes fold to day numbers and the subtraction spans the lane's calendar: from the first card settlement in early 2024 to the last in 2025 — a full year of card activity. MIN in the leading fold would flip the calendar. The wire fill would span the other lane. The card calendar: a full-year span.",
  },
  {
    id: "cs-1430",
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The same-week pairs",
    brief:
      "From: Growth lead. Re: the week-scoped reads.\n\nSome orders share the ISO week number, and the read counts how many distinct week-plus-order combinations exist at all — the pairing density of the calendar. Slice the week numbers and count the distinct days each week carries.",
    ask: "How many distinct ISO weeks carry at least one order?",
    template: `SELECT COUNT(DISTINCT {1}(created_at)) AS order_weeks
FROM orders
WHERE {2}(created_at) = created_at
AND total {3} {4};`,
    slots: [
      {
        answer: "strftime('%W', created_at)",
        kind: "keyword",
        label: "the week slicer",
        why: "The ISO week is strftime's %W chop — forty-two distinct weeks carry orders. DATE would slice calendar days and count 84.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean, so the week slice reads whole days. JULIANDAY would compare a number to text.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 300-floor would drop the budget orders and could shrink the week count.",
      },
    ],
    distractors: ["DATE", "JULIANDAY", "300"],
    walkthrough:
      "strftime's %W chop buckets every order into its ISO week, and the distinct count reads forty-two — the book's orders spread across forty-two weeks of the calendar. DATE would slice calendar days and count eighty-four. JULIANDAY would compare a number to text. And the 300-floor would drop the budget orders. The week density: forty-two weeks.",
  },
  {
    id: "cs-1431",
    tier: "easy",
    topic: "t3",
    universe: "month-close",
    title: "The invoice calendar footprint",
    brief:
      "From: Month-end close. Re: the billing footprint.\n\nThe billing calendar's footprint is the span from the first issue to the last. Fold the issue dates, take the extremes, and read the span — the calendar the collections team works.",
    ask: "The number of days from the first to the last invoice issue.",
    template: `SELECT ROUND(julianday({1}(issued_on)) - julianday({2}(issued_on)), 0) AS span_days
FROM invoices
WHERE {3}(issued_on) = issued_on;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last issue, so the leading fold is MAX. MIN there would flip the calendar negative.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first issue, so the subtrahend is MIN. MAX would duplicate the late extreme.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(issued_on) = issued_on proves the issue stamps are date-clean. JULIANDAY would compare a number to text and match nothing.",
      },
    ],
    distractors: ["MIN", "JULIANDAY"],
    walkthrough:
      "The issue extremes fold to day numbers and the subtraction spans the billing calendar: from the first invoice in February 2024 to the last in March 2025 — a thirteen-month footprint. MIN in the leading fold would flip the calendar. The JULIANDAY fill would compare a number to text. The billing footprint: thirteen months of issues.",
  },
  {
    id: "cs-1432",
    tier: "medium",
    topic: "t3",
    universe: "growth",
    title: "The mid-week signup check",
    brief:
      "From: Growth lead. Re: the signup timing.\n\nThe signup timing read counts members who joined mid-week — Tuesday through Thursday, codes two through four. Code the signup dates and count the mid-week cohort.",
    ask: "How many customers signed up mid-week (Tue–Thu)?",
    template: `SELECT COUNT(*) AS midweek_signups
FROM customers
WHERE strftime('%w', created_at) {1} {2}
AND {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the mid-week test",
        why: "Mid-week is three codes — 2 for Tuesday, 3 for Wednesday, 4 for Thursday — so the test is IN. NOT IN would census the weekend-and-Monday joiners.",
      },
      {
        answer: "'2', '3', '4'",
        kind: "keyword",
        label: "the mid-week codes",
        why: "The triple covers Tuesday through Thursday. A '2' fill would count Tuesdays alone.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean. JULIANDAY would compare a number to text and match nothing.",
      },
    ],
    distractors: ["NOT IN", "2", "JULIANDAY"],
    walkthrough:
      "The mid-week codes catch eight members — the roster's signups cluster mid-week, four on Tuesday and two each on Wednesday and Thursday. NOT IN would flip the read to the eight weekend-and-Monday joiners. The '2' fill would count Tuesdays alone. The grain check passes every date-only stamp. The mid-week cohort: eight members.",
  },
  {
    id: "cs-1433",
    tier: "hard",
    topic: "t3",
    universe: "month-close",
    title: "The year-end shipment read",
    brief:
      "From: Month-end close. Re: the December shipments.\n\nThe year-end read counts the December shipments — the lines that shipped in the holiday month, regardless of order month. Slice the ship dates' month, gate the year, and count.",
    ask: "How many orders shipped in December 2024?",
    template: `SELECT COUNT(*) AS dec_ships
FROM orders
WHERE strftime('%m', {1}) = {2}
AND strftime('%Y', {3}) = {4}
AND shipped_at {5} NULL;`,
    slots: [
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the ship month source",
        why: "The read counts shipments by when they shipped, so the month chop runs on shipped_at. Chopping created_at would count December orders, not shipments.",
      },
      {
        answer: "'12'",
        kind: "keyword",
        label: "the December code",
        why: "strftime renders December as '12'. An '11' fill would count November shipments instead.",
      },
      {
        answer: "shipped_at",
        kind: "keyword",
        label: "the ship year source",
        why: "The year gate scopes the ship calendar, so the year chop also runs on shipped_at. Chopping created_at would mix order years with ship months.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the ship year",
        why: "The read is December 2024, so the year gate carries '2024'. A '2025' fill would count the new year's shipments.",
      },
      {
        answer: "IS NOT",
        kind: "keyword",
        label: "the measurable test",
        why: "Only shipped rows carry a ship timestamp, so the test is IS NOT NULL. IS NULL would keep the never-shipped rows.",
      },
    ],
    distractors: ["ZZZ_R0", "11", "2025", "IS"],
    walkthrough:
      "The ship-date chop buckets every shipment into its month, and the December 2024 gate counts the year-end shipments — the holiday rush the close books separately. Chopping created_at would count December orders, a different set. The '11' fill would read November. And the IS NULL flip would keep the never-shipped rows. The December read: shipped-and-counted.",
  },
  {
    id: "cs-1434",
    tier: "easy",
    topic: "t3",
    universe: "finance",
    title: "The 2025 card settlements",
    brief:
      "From: Finance review. Re: the new-year card ledger.\n\nThe card ledger's 2025 page is small but real. Code the payment dates' year, gate the method, and count the new-year card settlements.",
    ask: "How many card payments settled in 2025?",
    template: `SELECT COUNT(*) AS card_2025
FROM payments
WHERE strftime('%Y', paid_on) = {1}
AND method = {2}
AND paid_on {3} {4};`,
    slots: [
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the new-year gate",
        why: "The read is the 2025 page, so the gate is year = '2025'. A 'ZZZ_R0' fill would count the old year's card settlements.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card gate",
        why: "The read scopes to the card lane, so the gate is method = 'card'. A 'wire' fill would count the wires instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the date gate direction",
        why: "The date gate must admit every 2025 settlement, so the test is > 2020. Flipping to < 2020 would demand pre-launch dates.",
      },
      {
        answer: "'2020-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the open date floor",
        why: "The floor predates every payment, so the gate passes the whole ledger. A 2025 floor would duplicate the year gate.",
      },
    ],
    distractors: ["ZZZ_R2", "wire", "ZZZ_R1"],
    walkthrough:
      "The year chop reads '2025' on the new-year page, and the card gate scopes to the card lane: the 2025 card settlements are the ledger's small but real start. The 'ZZZ_R1' fill would count the old year. The wire fill would read the other method. And the 'ZZZ_R0' floor would duplicate the year gate. The new-year card ledger: counted.",
  },
  {
    id: "cs-1435",
    tier: "medium",
    topic: "t3",
    universe: "fraud",
    title: "The stuck-order age",
    brief:
      "From: Fraud spot-check. Re: the stuck-order age.\n\nStuck orders age from their order date to today's data boundary — the read measures how far past the order date the book runs. Fold the extremes and read the stuck queue's maximum age proxy.",
    ask: "The number of days from the first to the last stuck order.",
    template: `SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS stuck_span
FROM orders
WHERE IFNULL(shipped_at, {3}) = {4}
AND shipped_at IS NULL;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The stuck span ends at the latest stuck order, so the leading fold is MAX. MIN there would flip the span negative.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The stuck span starts at the earliest stuck order, so the subtrahend is MIN. MAX would duplicate the late extreme.",
      },
      {
        answer: "'x'",
        kind: "keyword",
        label: "the sentinel push",
        why: "COALESCE pushes each missing timestamp to the 'x' sentinel. A date push would collide with real timestamps.",
      },
      {
        answer: "'x'",
        kind: "keyword",
        label: "the caught word",
        why: "The test compares against the same 'x' the push wrote — the sentinel catches exactly the stuck rows.",
      },
    ],
    distractors: ["2024-01-01", "ZZZ_FIX_1"],
    walkthrough:
      "The sentinel catches the twenty-one never-shipped orders, and the extremes fold to the stuck queue's span: from the earliest stuck order in early 2024 to the latest in 2025 — the queue stretches across the whole book. The date push would collide with real timestamps. The stuck span: the full calendar's width.",
  },
  {
    id: "cs-1436",
    tier: "medium",
    topic: "t3",
    universe: "growth",
    title: "The weekend signup check",
    brief:
      "From: Growth lead. Re: the weekend onboarding.\n\nWeekend onboarding is rare — the read counts the members who joined on a Saturday or Sunday. Code the signup dates and count the weekend cohort.",
    ask: "How many customers signed up on a weekend day?",
    template: `SELECT COUNT(*) AS weekend_signups
FROM customers
WHERE strftime('%w', created_at) {1} ({2})
AND {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the weekend test",
        why: "The weekend is two codes — 0 for Sunday, 6 for Saturday — so the test is IN. NOT IN would census the five weekday joiners.",
      },
      {
        answer: "'0', '6'",
        kind: "keyword",
        label: "the weekend codes",
        why: "The pair covers Sunday and Saturday. A '0' fill would count Sundays alone.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean. JULIANDAY would compare a number to text and match nothing.",
      },
    ],
    distractors: ["NOT IN", "0", "JULIANDAY"],
    walkthrough:
      "The weekend codes catch two members — the roster's onboarding runs on weekdays, with a single Saturday and a single Sunday signup. NOT IN would flip the read to the fourteen weekday joiners. The '0' fill would count the Sunday signup alone. The grain check passes every date-only stamp. The weekend cohort: two members.",
  },
  {
    id: "cs-1437",
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The Thursday gap read",
    brief:
      "From: Growth lead. Re: the quietest weekday.\n\nThursday is the book's quietest weekday — the gap read counts how far the quietest day trails the busiest. Code the weekdays, census the counts, and read the minimum — Thursday's nine orders.",
    ask: "The order count on the book's quietest weekday.",
    template: `SELECT {1}(n) AS quiet_day
FROM (
  SELECT strftime('%w', created_at) AS wd, COUNT(*) AS n
  FROM orders
  WHERE total {2} {3}
  GROUP BY wd
);`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the quiet fold",
        why: "The quietest weekday is the census floor, so the fold is MIN. MAX would read Monday's twenty and answer the opposite brief.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the census.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 300-floor would drop the budget orders and could shift the floor.",
      },
    ],
    distractors: ["MAX", "300"],
    walkthrough:
      "The weekday census buckets the book into seven codes, and MIN reads the floor: nine orders — Thursday's quiet footprint, eleven short of Monday's twenty. MAX would read the busiest day and answer the opposite brief. The 300-floor would drop the budget orders and could shift the floor to Saturday. The quietest weekday: Thursday, nine orders.",
  },
  {
    id: "cs-1438",
    tier: "easy",
    topic: "t3",
    universe: "finance",
    title: "The wire settlement count",
    brief:
      "From: Finance review. Re: the wire ledger.\n\nThe wire lane's ledger is smaller than the card book, and the review counts it directly. Gate the method, keep the real settlements, and count the wires.",
    ask: "How many wire settlements does the ledger carry?",
    template: `SELECT COUNT(*) AS wire_settles
FROM payments
WHERE method = {1}
AND amount_cents {2} {3}
AND paid_on {4} {5};`,
    slots: [
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the wire gate",
        why: "The read counts the wire lane, so the gate is method = 'wire'. A 'card' fill would count the bigger card book instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate keeps real settlements, so the test is > 0. Flipping to < 0 would demand negative amounts and empty the count.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every wire. A 200000-floor would keep only the six-figure wires.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the date gate direction",
        why: "The date gate admits every settlement, so the test is > 2020. Flipping to < 2020 would demand pre-launch dates.",
      },
      {
        answer: "'2020-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the open date floor",
        why: "The floor predates every payment, so the gate passes the whole wire ledger. A 2025 floor would count only the new year.",
      },
    ],
    distractors: ["card", "ZZZ_R0", "ZZZ_R0"],
    walkthrough:
      "The wire gate isolates the lane and the count reads eleven — the wire ledger's full footprint against the card book's sixteen. The card fill would count the bigger book. The 200000-floor would keep only the six-figure wires. And the 2025 floor would count only the new year. The wire ledger: eleven settlements.",
  },
  {
    id: "cs-1439",
    tier: "medium",
    topic: "t3",
    universe: "month-close",
    title: "The order-month span check",
    brief:
      "From: Month-end close. Re: the month coverage.\n\nThe close books every month the book touched — the coverage check counts the distinct order months. Chop the dates into months and count the buckets.",
    ask: "How many distinct months carry at least one order?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS covered_months
FROM orders
WHERE {1}(created_at) = created_at
AND total {2} {3};`,
    slots: [
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean, so the month chop reads whole days. JULIANDAY would compare a number to text and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the coverage.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 400-floor would drop the budget orders and could shrink the coverage.",
      },
    ],
    distractors: ["JULIANDAY", "400"],
    walkthrough:
      "The month chop buckets every order into its calendar month, and the distinct count reads fourteen — the book's full coverage from January 2024 to February 2025, no gaps. JULIANDAY would compare a number to text and empty the check. The 400-floor would drop the budget orders and could shrink the coverage. The month coverage: fourteen buckets.",
  },
  {
    id: "cs-1440",
    tier: "hard",
    topic: "t3",
    universe: "growth",
    title: "The two-year order split",
    brief:
      "From: Growth lead. Re: the year-over-year shape.\n\nThe book spans two calendar years, and the shape read counts each year's orders separately — 2024's bulk against 2025's start. Chop the years and read the recent side.",
    ask: "The order count in the book's most recent year.",
    template: `SELECT COUNT(*) AS recent_orders
FROM orders
WHERE strftime('%Y', created_at) = {1}
AND julianday(created_at) {2} {3};`,
    slots: [
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the recent year",
        why: "The shape read counts the recent side, so the gate is year = '2025'. A 'ZZZ_R0' fill would count the bulk year instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the day-number direction",
        why: "The day-number gate admits every 2025 order — julian day numbers are enormous positive integers. Flipping to < 0 would demand pre-calendar orders.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open day floor",
        why: "A floor of 0 sits far below every julian day number, so the gate passes everything. A 2460500 floor would slice the timeline.",
      },
    ],
    distractors: ["ZZZ_R2", "ZZZ_R0"],
    walkthrough:
      "The year chop scopes to 2025, and the count reads thirteen — the new year's orders against 2024's ninety, the shape the growth plan reads year over year. The 'ZZZ_R1' fill would count the bulk year. The 2460500 day-number floor would slice the timeline mid-book. The recent side: thirteen orders.",
  },
  {
    id: "cs-1441",
    tier: "easy",
    topic: "t4",
    universe: "month-close",
    title: "The first-month stack",
    brief:
      "From: Month-end close. Re: the opening stack.\n\nThe revenue stack opens at January — the first line of the running read. Build the stack and read the opening line's figure.",
    ask: "Running revenue at January 2024.",
    template: `SELECT mo, rev, run
FROM (
  SELECT mo, SUM(total) AS rev,
         ROUND({1}(SUM(total)) OVER (ORDER BY {2}), 2) AS run
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE mo = {3};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates revenue, so the window folds with SUM. COUNT would stack month tallies — a census wearing a revenue label.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the accumulation order",
        why: "The stack runs along the calendar, so the window orders by the month key. Ordering by rev would accumulate in size order.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the opening month",
        why: "The stack opens at January — the first line. A '2024-06' fill would read the mid-year stack instead.",
      },
    ],
    distractors: ["COUNT", "rev", "2024-06"],
    walkthrough:
      "The stack walks the calendar and its opening line is January's own take: 3731.97 — the first month has no predecessors, so the running total equals the raw figure. The COUNT fill would stack month tallies and read one. Ordering by rev would accumulate in size order. And the June fill would read the mid-year stack. The opening stack: 3731.97.",
  },
  {
    id: "cs-1442",
    tier: "medium",
    topic: "t4",
    universe: "finance",
    title: "The quiet-month revenue",
    brief:
      "From: Finance review. Re: the lean read.\n\nThe revenue pots range widely; the lean read finds the month that carried the least. Stage the monthly pots and read the floor.",
    ask: "The month with the lowest total order revenue.",
    template: `SELECT mo, pot
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS pot
  FROM orders
  GROUP BY mo
)
ORDER BY pot {1}
LIMIT {2}
WHERE 1 = 1
AND {3}(created_at) = created_at
AND total > {4};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean sort",
        why: "The lean read wants the smallest pot first, so the sort is ascending. DESC would crown the biggest month.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-read cut",
        why: "The read wants one month, so the cut is 1. A 3-cut would return the three leanest months.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book. JULIANDAY would compare a number to text.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the total gate",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the read.",
      },
    ],
    distractors: ["DESC", "3"],
    walkthrough:
      "The monthly pots sort ascending and the floor reads July 2024 at 1193.86 — the leanest month in the book, well under the 2488 average. DESC would crown January's 3731.97. The 3-cut would return the three leanest. The lean read: July, 1193.86.",
  },
  {
    id: "cs-1443",
    tier: "medium",
    topic: "t4",
    universe: "growth",
    title: "The sign-up month count",
    brief:
      "From: Growth lead. Re: the cohort calendar.\n\nThe cohort calendar counts the distinct months the roster joined in — the acquisition footprint. Chop the signup dates into months and count the buckets.",
    ask: "How many distinct months carry at least one signup?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', {1})) AS cohort_months
FROM customers
WHERE {2}(created_at) = created_at
AND active = {3};`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "the signup date",
        why: "The cohort calendar reads signup dates, so the chop runs on created_at. customers carries no shipped_at — the wrong column would fail.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean. JULIANDAY would compare a number to text and match nothing.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "The census reads active members — fourteen of the sixteen. A 0-fill would census the two deactivated accounts instead.",
      },
    ],
    distractors: ["shipped_at", "JULIANDAY", "0"],
    walkthrough:
      "The month chop buckets every signup into its calendar month, and the distinct count reads nine — the cohort footprint from November 2023 to July 2024. The shipped_at fill would fail against the roster. JULIANDAY would compare a number to text. And the 0-fill would read the two deactivated accounts. The cohort calendar: nine months.",
  },
  {
    id: "cs-1444",
    tier: "medium",
    topic: "t4",
    universe: "growth",
    title: "The pair-month revenue",
    brief:
      "From: Growth lead. Re: the pair-month pots.\n\nThe pair months — two signups each — cluster in 2024, and the read counts how many of those months carry revenue. Stage the signup census and count the pair months scoped to the new year.",
    ask: "How many 2024 months saw exactly two signups?",
    template: `SELECT COUNT(*) AS pair_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM customers
  GROUP BY mo
)
WHERE n = {1}
AND mo {2} {3};`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the pair bar",
        why: "A pair month carries exactly two signups, so the bar is 2. A 1-bar would count the two singleton months instead.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the year floor direction",
        why: "The read scopes to 2024, so the month gate runs >= '2024-01'. Flipping to < would read the 2023 cohorts instead.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        noVerify: true,
        label: "the year floor value",
        why: "The floor value opens the 2024 window — five pair months live there. A '2024-06' floor would slice the window mid-story.",
      },
    ],
    distractors: ["1", "2024-06"],
    walkthrough:
      "The signup census stages nine months, and the = 2 bar scoped to 2024 counts five pair months — January through May joined in pairs. The 1-bar would count June and July instead. The '2024-06' floor would slice the window mid-story. The 2024 pair months: five.",
  },
  {
    id: "cs-1445",
    tier: "hard",
    topic: "t4",
    universe: "expense",
    title: "The spend-vs-revenue gap",
    brief:
      "From: Expense report. Re: the spend ratio.\n\nThe spend ratio reads total expense cents against total order revenue — a fraction the board tracks. Stage both scalars and read the ratio rounded to three decimals.",
    ask: "Total expense cents divided by total order revenue, 3 decimals.",
    template: `SELECT ROUND(
  (SELECT {1}(amount_cents) FROM expenses)::REAL /
  (SELECT {2}(total) FROM orders), 3) AS spend_ratio
WHERE 1 = 1
AND EXISTS (SELECT 1 FROM orders WHERE total {3} {4});`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the spend fold",
        why: "The numerator totals the expense ledger, so the fold is SUM. COUNT would divide a tally by revenue — a ratio that means nothing.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "—",
        why: "",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the existence gate direction",
        why: "The existence gate proves the revenue side is non-empty, so the test is > 0. Flipping to < 0 would demand negative revenue.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the existence floor",
        why: "A floor of 0 proves real revenue exists. A 50000-floor would still pass, but the gate's purpose is existence, not size.",
      },
    ],
    distractors: ["COUNT", "50000"],
    walkthrough:
      "The two scalars read 2315400 expense cents against 34833.28 revenue euros, and the ratio rounds to 66.46 — the spend line runs at roughly two-thirds of revenue, the fraction the board tracks. The COUNT fills would divide a tally by revenue and produce noise. The existence gate proves the denominator is real. The spend ratio: 66.46 at three decimals.",
  },
  {
    id: "cs-1446",
    tier: "medium",
    topic: "t4",
    universe: "fraud",
    title: "The stuck-order month count",
    brief:
      "From: Fraud spot-check. Re: the stuck calendar.\n\nThe stuck queue spreads across months; the fraud read counts how many distinct months carry a never-shipped order. Push the NULLs to the sentinel, chop the order dates, and count.",
    ask: "How many distinct months carry a never-shipped order?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS stuck_months
FROM orders
WHERE COALESCE(shipped_at, {1}) = {2}
AND total {3} {4};`,
    slots: [
      {
        answer: "'x'",
        kind: "keyword",
        label: "the sentinel push",
        why: "COALESCE pushes each missing timestamp to the 'x' sentinel the test catches. A date push would collide with real timestamps.",
      },
      {
        answer: "'x'",
        kind: "keyword",
        label: "the caught word",
        why: "The test compares against the same 'x' the push wrote — the sentinel catches exactly the stuck rows.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real stuck orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every stuck order. A 400-floor would keep only the premium stuck orders and shrink the calendar.",
      },
    ],
    distractors: ["2024-01-01", "400"],
    walkthrough:
      "The sentinel catches the twenty-one never-shipped orders, and the month chop spreads them across ten distinct calendar months — the stuck calendar runs nearly the whole book. The date push would collide with real timestamps. The 400-floor would shrink the calendar to the premium stuck orders. The stuck calendar: ten months.",
  },
  {
    id: "cs-1447",
    tier: "easy",
    topic: "t4",
    universe: "growth",
    title: "The active-member spend",
    brief:
      "From: Growth lead. Re: the active book.\n\nThe active members carry the whole book — but the read proves it by gating the flag. Sum the order totals over the active roster and read the figure the inactive gate cannot change.",
    ask: "Total order revenue across active members' orders.",
    template: `SELECT ROUND(SUM(total), 2) AS active_book
FROM orders
WHERE customer_id IN (
  SELECT id FROM customers WHERE active = {1}
)
AND total {2} {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "The active roster carries flag 1 — fourteen members whose orders fill the book. A 0-fill would read the two deactivated members' orders instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the line gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the read.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open line floor",
        why: "A floor of 0 admits every order. A 500-floor would keep only the premium lines and shrink the book.",
      },
    ],
    distractors: ["0", "500"],
    walkthrough:
      "The subquery scopes to the fourteen active members, and the sum reads their full order book — the inactive pair's orders are already absent, so the figure matches the whole-book total. The 0-fill would read only the deactivated pair. The 500-floor would keep the premium lines and shrink the book. The active book: the full 34833.28.",
  },
  {
    id: "cs-1448",
    tier: "hard",
    topic: "t4",
    universe: "finance",
    title: "The payment-method split",
    brief:
      "From: Finance review. Re: the method census.\n\nThe payment ledger splits between card and wire, and the review reads both sides of the split. Gate the method twice — once per window — and count the lanes.",
    ask: "How many distinct payment methods does the ledger carry?",
    template: `SELECT COUNT(DISTINCT method) AS lanes
FROM payments
WHERE paid_on {1} {2}
AND amount_cents {3} {4}
AND method {5} ('card','wire');`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the date gate direction",
        why: "The date gate admits every settlement, so the test is > 2020. Flipping to < 2020 would demand pre-launch dates.",
      },
      {
        answer: "'2020-01-01'",
        kind: "keyword",
        noVerify: true,
        label: "the open date floor",
        why: "The floor predates every payment, so the gate passes the whole ledger. A 2025 floor would count only the new year.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the amount gate direction",
        why: "The gate keeps real settlements, so the test is > 0. Flipping to < 0 would demand negative amounts and empty the census.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open amount floor",
        why: "A floor of 0 admits every settlement. A 300000-floor would keep only the six-figure lines.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the lane membership",
        why: "Both methods are in scope, so the test is IN ('card','wire'). NOT IN would exclude everything the ledger carries.",
      },
    ],
    distractors: ["ZZZ_R0", "ZZZ_R0", "NOT IN"],
    walkthrough:
      "The census counts the distinct method values the ledger carries, and the answer is two: card and wire — the ledger's whole split, scoped by the date and amount gates that pass everything. The 2025 floor would count only the new year's methods. The 300000-floor would keep the six-figure lines. And the NOT IN flip would exclude both lanes. The method split: two lanes.",
  },
  {
    id: "cs-1449",
    tier: "medium",
    topic: "t4",
    universe: "growth",
    title: "The cancelled-order month read",
    brief:
      "From: Growth lead. Re: the cancellation calendar.\n\nCancellations cluster in five months, and the read counts the distinct months they touch. Gate the lane, keep the real lines, and count the calendar.",
    ask: "How many distinct months carry a cancelled order?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS cancel_months
FROM orders
WHERE status = {1}
AND total {2} {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the cancellation lane",
        why: "The calendar reads the cancelled lane, so the gate is status = 'cancelled'. A 'pending' fill would count the stuck-order calendar instead.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the line gate direction",
        why: "The gate keeps real lines, so the test is > 0. Flipping to < 0 would demand negative totals and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open line floor",
        why: "A floor of 0 admits every cancellation. A 300-floor would keep only the expensive cancellations.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean, so the month chop reads whole days. JULIANDAY would compare a number to text.",
      },
    ],
    distractors: ["pending", "300", "JULIANDAY"],
    walkthrough:
      "The cancellation lane touches five distinct months — the calendar's dead spots, with July and November carrying two apiece. The pending fill would count the stuck-order calendar's ten months instead. The 300-floor would keep only the expensive cancellations. And JULIANDAY would compare a number to text. The cancellation calendar: five months.",
  },
  {
    id: "cs-1450",
    tier: "hard",
    topic: "t4",
    universe: "month-close",
    title: "The closing capstone stack",
    brief:
      "From: Month-end close. Re: the final capstone.\n\nThe capstone runs the full window play: bucket the months into quartiles by revenue, keep the bottom bucket, and walk the running stack to the last line of it — the leanest month's cumulative position. Two windows, one lean line.",
    ask: "The running revenue at the book's leanest month (bottom quartile).",
    template: `SELECT mo, rev, run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         {1}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) {2}) AS q
  FROM (SELECT strftime('%Y-%m', created_at) AS mo, total FROM orders)
  GROUP BY mo
)
WHERE q = {3}
AND run {4} {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates revenue, so the window folds with SUM. COUNT would stack month tallies — a census wearing a revenue label.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean direction",
        why: "The lean months sit at the bottom of the ascending revenue order, so the quartile runs ASC. DESC would put the big months in bucket 1 and empty the read.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the lean bucket",
        why: "Bucket 4 of the ascending split holds the four leanest months. A 1-fill would read the big months' bucket instead.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the lean ceiling direction",
        why: "The lean stack sits under the 20000 wall — the leanest months run early, before the book grows. Flipping to > 15000 would push the read past the lean stretch.",
      },
      {
        answer: "15000",
        kind: "number",
        noVerify: true,
        label: "the lean ceiling",
        why: "The ceiling sits at 15000 — the lean quartile's stacks run from 3731.97 to 12427.60. A 10000-ceiling would keep only the first two.",
      },
    ],
    distractors: ["COUNT", "DESC", "15000", "25000"],
    walkthrough:
      "Two windows, one lean line: the ascending quartile puts July 2024's 1193.86 pot in bucket 4, and the running stack at that point reads 18579.20 — the leanest month's cumulative position. The COUNT fill would stack tallies. The DESC split would move the lean months to bucket 1 and empty the read. And the 25000 ceiling would exceed every lean stack. The capstone line: July 2024, run 18579.20.",
  },
];
