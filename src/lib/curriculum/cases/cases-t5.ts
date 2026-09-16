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
      "From: Catalog ops. Re: the SKU normalizer.\n\nThe normalizer strips dashes from SKUs, and the audit counts the tags it actually changes. REPLACE wipes every dash; a tag with none passes through untouched. Count the changed tags with the storage guards riding along.",
    ask: "How many product names does the dash-stripper actually change?",
    template: `SELECT COUNT(*) AS changed
FROM products
WHERE REPLACE(name, '-', '') != name
AND {1}(name) = name
AND stock {2} {3};`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the name guard",
        why: "TRIM(name) = name proves no tag rides with stray whitespace — true for the catalog, so the count sees real changes only. UPPER would demand shouting tags and match nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the stock gate direction",
        why: "The gate keeps stocked tags, so the test is > 0. Flipping to < would demand negative stock, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the stock floor",
        why: "A floor of 0 keeps every stocked tag in scope — the shelf holds 40 to 500 pieces. A 300-floor would keep only the deep shelves.",
      },
    ],
    distractors: ["UPPER", "<", "LOWER"],
    walkthrough:
      "REPLACE wipes every dash, and three tags carry one — the 3-pack socks tag, the 7-in-1 hub, the 14-inch ring light — so the stripper changes exactly three names. A tag with no dash compares equal and passes. UPPER or LOWER would fail every stored name and zero the audit, and the < flip would demand negative stock. The normalizer's true reach: three tags.",
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
    universe: "growth",
    title: "The consonant-led roster",
    brief:
      "From: Growth desk. Re: the sorting pass.\n\nThe desk's new sort buckets names by their opening letter, and the consonant-led group needs its census. Slice the first character, exclude the vowels, keep the active roster only, and count what the sort will actually bucket.",
    ask: "How many active members' names open with a consonant?",
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
        why: "The consonant-led group excludes the five vowels, so the test is NOT IN. IN would return the vowel-led members instead and flip the census.",
      },
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the city check",
        why: "TRIM(city) = city proves every member's city is stored clean — true for the roster, so the count reads real rows. UPPER would demand shouting cities and match nothing.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean — true for the roster. JULIANDAY would compare a number to text and empty the count.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the active gate",
        why: "The gate admits every active member — the flag is 0 or 1, so the bar sits at 0. Flipping to < 0 would demand negative flags.",
      },
    ],
    distractors: ["IN", "JULIANDAY"],
    walkthrough:
      "The vowel list catches Alice, Emma, Isabella, Olivia — four names open with a vowel. The active gate trims the inactive pair, and both of them sit consonant-led, so the gated census reads ten: twelve consonant-led names on the full roster, two parked in the inactive lane. The IN flip would return those four vowel-led members instead. The sorting pass buckets ten names.",
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
    universe: "growth",
    title: "The lowercased import",
    brief:
      "From: Growth desk. Re: the email normalization.\n\nThe import pipeline lowercases every email before storing, and the audit verifies the fold was lossless: LOWER must preserve the distinct count. Fold the roster's addresses and count the distinct survivors.",
    ask: "How many distinct emails survive the lowercase fold?",
    template: `SELECT COUNT(DISTINCT {1}(email)) AS folded
FROM customers
WHERE INSTR(email, {2}) > {3};`,
    slots: [
      {
        answer: "LOWER",
        kind: "keyword",
        label: "the import fold",
        why: "The pipeline lowercases addresses, so the fold is LOWER. LENGTH would collapse each address to a number and count distinct lengths instead of distinct addresses.",
      },
      {
        answer: "'@'",
        kind: "keyword",
        label: "the at needle",
        why: "The audit counts only well-formed addresses, so the probe looks for the @. An 'a' needle would still catch every address here but reads as sloppiness, not proof.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the containment bar",
        why: "A found @ sits at position 1 or later, so the bar is 0. A 10-bar would demand the @ sit past column ten and drop the short handles.",
      },
    ],
    distractors: ["10", "LENGTH"],
    walkthrough:
      "LOWER folds every address, and the distinct count stays at sixteen — the fold merges nothing, proving the import was lossless. LENGTH would collapse the addresses to their six distinct lengths and certify nothing about the fold. The 10-bar would drop the short handles and undercount the roster. The normalization audit: sixteen distinct survivors.",
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
    universe: "supplier",
    title: "The bench initial roll",
    brief:
      "From: Supplier desk. Re: the nameplate roll.\n\nThe bench carries six vendors, and the desk rolls up their nameplate initials for the catalog index. Slice each name's first character, prove the storage clean, and read the initial that leads the roll.",
    ask: "Which initial leads the supplier bench, and how many vendors share it?",
    template: `SELECT SUBSTR(name, 1, 1) AS ini, COUNT(*) AS n
FROM suppliers
WHERE {1}(name) = name
GROUP BY ini
ORDER BY n {2}
LIMIT {3};`,
    slots: [
      {
        answer: "TRIM",
        kind: "keyword",
        label: "the storage check",
        why: "TRIM(name) = name proves the nameplates are stored clean — true for every vendor, so the roll reads real initials. UPPER would demand shouting names and empty the roll.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the roll direction",
        why: "The report leads with the busiest initial, so the sort is descending. ASC would surface a single-vendor initial instead of the shared leader.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the headline cut",
        why: "The cut of 1 shows the leader alone: 'A' at two vendors — Alpine Audio and Andes Naturals. A 2-cut would drag a tied singleton into the headline.",
      },
    ],
    distractors: ["UPPER", "ASC", "2"],
    walkthrough:
      "The first-character slice reads N, S, P, M, A, A across the bench, and the descending roll puts 'A' on top: Alpine Audio GmbH and Andes Naturals SA share the initial — two vendors against every singleton. UPPER would demand shouting nameplates and return nothing. The ASC flip would crown a lone vendor instead. The catalog index leads with A.",
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
    universe: "growth",
    title: "The surname-start check",
    brief:
      "From: Growth desk. Re: the two-column sort.\n\nThe contact cards sort by surname, and the audit verifies every surname opens with a capital — the two-column split must not lowercase the tail. Slice each surname's first character, compare it to its own uppercase fold, and count the clean caps.",
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
        why: "A capital surname-start equals its own uppercase fold, so the test is =. Flipping to < would demand starts sorting below their own fold — digits and marks, never letters — of which the roster carries none.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the name gate direction",
        why: "The gate keeps real names, so the test is > 0. Flipping to < 0 would demand negative-length names, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open name floor",
        why: "A floor of 0 admits every member. A 12-floor would keep only the long names — three of them — and starve the audit.",
      },
    ],
    distractors: ["<", "12"],
    walkthrough:
      "The surname slice lifts each tail's first character, and the caps test compares it to its own uppercase fold — every stored surname opens with a capital, so the audit counts sixteen clean caps with zero exceptions. The < flip would hunt starts below their own fold and return an empty ledger. The 12-floor would trim the census to the three longest names. The two-column split is safe to ship.",
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
    title: "The write-off census",
    brief:
      "From: Fraud spot-check. Re: the write-off lane.\n\nThe write-off process touches the cancelled lane only, and the spot-check counts it with a NULLIF probe: fold each status against 'cancelled' and let the collapse speak. A NULL means the row matched the write-off lane.",
    ask: "How many orders sit in the cancelled write-off lane?",
    template: `SELECT COUNT(*) AS writeoffs
FROM orders
WHERE NULLIF(status, {1}) IS NULL
AND {2}(created_at) = created_at
AND total {3} {4};`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the write-off lane",
        why: "NULLIF collapses a status equal to the lane into NULL, so the probe carries 'cancelled'. A 'pending' fill would count the at-risk lane instead — fourteen rows.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the census reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 keeps the whole lane in scope. A 500-floor would empty the census — the write-offs top out below five hundred euros.",
      },
    ],
    distractors: ["'pending'", "JULIANDAY", "500"],
    walkthrough:
      "NULLIF collapses every 'cancelled' status to NULL, and the IS NULL test counts the collapses: seven write-off lines, none of them above five hundred euros — the lane's biggest ticket is 397.99. The 'pending' fill would count fourteen at-risk orders instead, and the 500-floor would empty the census entirely. The write-off lane holds seven.",
  },
  {
    id: "cs-1417",
    tier: "medium",
    topic: "t2",
    universe: "inventory",
    title: "The triple-unit census",
    brief:
      "From: Warehouse ops. Re: the pick-face layout.\n\nThe pick-face reserves a bin width for triple picks, and the census counts the lines that ship three units in one go. NULLIF collapses each quantity against the triple and the IS NULL test keeps the matches, with a guarded price stage underneath.",
    ask: "How many order lines ship exactly three units?",
    template: `SELECT COUNT(*) AS tripling
FROM (
  SELECT order_id, quantity, COALESCE(unit_price, 0) AS price
  FROM order_items
)
WHERE {1}(quantity, {2}) IS NULL
AND price {3} {4};`,
    slots: [
      {
        answer: "NULLIF",
        kind: "keyword",
        label: "the triple collapse",
        why: "NULLIF(quantity, 3) collapses triple picks to NULL, so IS NULL keeps them. IFNULL(quantity, 3) returns the quantity itself — never NULL — and the census reads zero.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the triple bar",
        why: "The bin is cut for triple picks, so the collapse compares against 3. A '2' fill would count the double-unit lines — sixty-nine of them.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the price gate direction",
        why: "The guarded price stage keeps real lines, so the test is > 0. Flipping to < 0 would demand negative prices, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open price floor",
        why: "A floor of 0 admits every line. A 50-floor would keep only the budget end and skew the pick-face count.",
      },
    ],
    distractors: ["IFNULL", "'2'", "<"],
    walkthrough:
      "NULLIF collapses every quantity 3 to NULL, and the IS NULL test counts the collapses: eighty-nine lines ship exactly three units — the triples sit between the ninety-three singles and the sixty-nine doubles. IFNULL would return the quantity untouched and zero the census; the text '2' fill would silently compare a number to text and collapse nothing. The pick-face reserves eighty-nine triple bins.",
  },
  {
    id: "cs-1418",
    tier: "easy",
    topic: "t2",
    universe: "month-close",
    title: "The buyer roll",
    brief:
      "From: Month-end close. Re: the buyer roll.\n\nThe close opens with the buyer roll: how many members actually placed an order. The roll folds each customer reference through COALESCE before the distinct count, so a NULL reference could never sneak into the tally.",
    ask: "How many distinct members carry at least one order?",
    template: `SELECT {1}(DISTINCT {2}(customer_id, 0)) AS buyers
FROM orders
WHERE total {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the roll fold",
        why: "The roll counts distinct members, so the fold is COUNT. SUM would add the member ids together and read a nonsensical 136; AVG would read the midpoint of the id ladder.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the reference guard",
        why: "COALESCE folds any missing reference to 0 before the distinct count — a guard the close keeps on every roll. A missing id would otherwise spawn a phantom member.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < 0 would demand negative totals and empty the roll.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 500-floor would keep only the premium tickets — ten members — and understate the roll.",
      },
    ],
    distractors: ["SUM", "AVG", "500"],
    walkthrough:
      "COUNT(DISTINCT ...) walks the folded references and the roll reads sixteen: every member on the roster has placed at least one order — no phantom ids, no silent lurkers. SUM would melt the ids into 136, AVG would read the ladder's midpoint, and the 500-floor would trim the roll to the ten premium buyers. The buyer roll: sixteen of sixteen.",
  },
  {
    id: "cs-1419",
    tier: "medium",
    topic: "t2",
    universe: "refund-audit",
    title: "The priority queue",
    brief:
      "From: Refund audit. Re: the priority queue.\n\nThe priority queue targets pending orders above the 100-euro line — work that may still ship but is at risk. Guard the total with COALESCE so a missing figure can never dodge the queue, gate the lane, and count the targets.",
    ask: "How many pending orders total more than 100 euros?",
    template: `SELECT COUNT(*) AS queue
FROM orders
WHERE COALESCE(total, 0) {1} {2}
AND status = {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the line direction",
        why: "The queue targets orders above the line, so the test is >. Flipping to < would count the quiet lane below the line instead — which holds nothing.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the priority line",
        why: "The line sits at 100 — every pending order clears it, so the queue holds the whole lane. A 300-line would keep only the eight heavyweight tickets.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the at-risk lane",
        why: "The priority queue reads the pending lane — work that may still ship. A 'shipped' fill would count the in-transit lane instead: thirty orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the queue reads real rows. JULIANDAY would compare a number to text and empty the queue.",
      },
    ],
    distractors: ["<", "300", "'shipped'"],
    walkthrough:
      "The COALESCE guard pushes any missing total to 0 — where it would rightly miss the line — and the 100-euro bar scopes the queue: every one of the fourteen pending orders clears the line, the lane's smallest ticket already sitting above it. The < flip would find nothing, and the 300-line would keep only eight heavyweights. The priority queue holds fourteen.",
  },
  {
    id: "cs-1420",
    tier: "easy",
    topic: "t2",
    universe: "refund-audit",
    title: "The quiet-lane floor",
    brief:
      "From: Refund audit. Re: the small-ticket floor.\n\nThe audit proves a negative: no pending order sits below the 100-euro line — the quiet lane under the bar is empty. Guard the total with COALESCE, flip the queue's direction, and let the honest zero speak.",
    ask: "How many pending orders total less than 100 euros?",
    template: `SELECT COUNT(*) AS quiet_lane
FROM orders
WHERE COALESCE(total, 0) {1} {2}
AND status = {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the floor direction",
        why: "The quiet lane sits below the 100-euro bar, so the test is <. Flipping to > would count the priority queue instead — the whole pending lane, fourteen orders.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the quiet bar",
        why: "The bar sits at 100 — nothing pending hides below it, so the honest zero holds. The 'shipped' fill would count five small in-transit tickets, and the > flip would read the fourteen-ticket queue instead.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the audited lane",
        why: "The floor audit reads the pending lane. A 'cancelled' fill would find two small write-offs — 90.35 and 25.47 — and break the honest zero.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the audit reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: [">", "'shipped'", "'cancelled'"],
    walkthrough:
      "The < direction scopes under the bar, and the pending lane answers with the honest zero: nothing waits below 100 euros — the lane's smallest ticket already clears the line. Every distractor finds company: the > flip reads the fourteen-ticket queue, the shipped fill counts five small in-transit tickets on the wrong lane, and the cancelled fill counts two small write-offs. The quiet lane: zero, proven.",
  },
  {
    id: "cs-1421",
    tier: "medium",
    topic: "t2",
    universe: "month-close",
    title: "The back-book delivered",
    brief:
      "From: Month-end close. Re: the back-book page.\n\nThe close reads the back book: delivered orders logged before the 2025 boundary. IFNULL guards the stamp against a missing date — the sentinel 1900 push keeps the window honest — then the delivered gate scopes the lane.",
    ask: "How many delivered orders were logged before 2025?",
    template: `SELECT COUNT(*) AS back_book
FROM orders
WHERE IFNULL(created_at, '1900-01-01') {1} {2}
AND status = {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the boundary direction",
        why: "The back book sits before the 2025 boundary, so the test is <. Flipping to > would read the new-year page instead — seven delivered tickets.",
      },
      {
        answer: "'2025-01-01'",
        kind: "keyword",
        label: "the boundary stamp",
        why: "The window ends at the 2025 boundary, so the edge carries '2025-01-01'. A '2024-06-01' fill would cut the window at mid-year and keep only seventeen.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the closed lane",
        why: "The back book counts closed work, so the gate is status = 'delivered'. A 'shipped' fill would read the in-transit page — twenty-seven orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the window reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: [">", "'2024-06-01'", "'shipped'", "JULIANDAY"],
    walkthrough:
      "IFNULL pushes any missing stamp to the 1900 sentinel — where it would rightly miss the window — and the < '2025-01-01' edge scopes the back book: forty-five delivered orders closed out the old pages, with the new year opening on seven more. The mid-year cut would keep seventeen, and the shipped flip reads the in-transit lane. The back book: forty-five delivered.",
  },
  {
    id: "cs-1422",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The solo-receipt pot",
    brief:
      "From: Month-end close. Re: the solo-receipt book.\n\nTwenty-six orders carry exactly one line each, and the solo book carries its own pot. Stage the single-line orders through a HAVING tally, fold their totals with a guarded SUM, and read the pot the close reconciles against the ledger.",
    ask: "The total revenue booked by orders with exactly one line.",
    template: `SELECT ROUND(COALESCE({1}(total), 0), 2) AS solo_pot
FROM orders
WHERE id IN (
  SELECT order_id FROM order_items
  GROUP BY order_id
  HAVING {2}(*) = {3}
)
AND total {4} {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot fold",
        why: "The solo book totals face values, so the fold is SUM. AVG would read the average solo ticket — about 110 — and not the pot.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line tally",
        why: "A solo order carries exactly one line, so the HAVING tally is COUNT. AVG would demand an average line count no order can have.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the solo bar",
        why: "The bar sits at 1 — twenty-six orders carry exactly one line. A 500-bar would empty the stage and the pot would fall back to zero.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the face gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals and return no orders at all.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open face floor",
        why: "A floor of 0 admits every solo order. A 500-floor would empty the book — no solo ticket reaches five hundred euros.",
      },
    ],
    distractors: ["AVG", "<", "500"],
    walkthrough:
      "The HAVING stage finds the twenty-six single-line orders, and the guarded SUM folds their totals into the solo pot: 2879.53 — the close reconciles it against the ledger line for one-line tickets. AVG would read the 110-euro average ticket instead of the pot, and the 500-floor would empty the book and fall back to the zero guard. The solo-receipt pot: 2879.53.",
  },
  {
    id: "cs-1423",
    tier: "easy",
    topic: "t2",
    universe: "month-close",
    title: "The pending cadence",
    brief:
      "From: Month-end close. Re: the at-risk cadence.\n\nPending work is the close's open exposure, and the cadence read counts the distinct months that carry a pending order. Gate the at-risk lane, guard the total fold with COALESCE, and read the spread.",
    ask: "How many distinct months carry a pending order?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months
FROM orders
WHERE status = {1}
AND COALESCE(total, 0) {2} {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the at-risk lane",
        why: "The cadence tracks pending work, so the gate is status = 'pending'. A 'shipped' fill would read the in-transit calendar instead — twelve months.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every pending order. A 500-floor would trim the cadence to four months and hide the true spread.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the cadence reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: ["'shipped'", "500", "JULIANDAY"],
    walkthrough:
      "The pending gate scopes the at-risk lane and the guarded total keeps every real order in scope: ten distinct months carry pending work, out of the fourteen the order calendar spans. The shipped flip would read twelve months of in-transit history, and the 500-floor would trim the cadence to four. The pending cadence: ten months.",
  },
  {
    id: "cs-1424",
    tier: "medium",
    topic: "t2",
    universe: "fraud",
    title: "The premium towers",
    brief:
      "From: Fraud spot-check. Re: the premium watchlist.\n\nThe watchlist flags the premium towers — orders whose total climbs past 800 euros. Guard the total with COALESCE so a missing figure never slips the net, keep the status fold honest, and count the towers.",
    ask: "How many orders total more than 800 euros?",
    template: `SELECT COUNT(*) AS towers
FROM orders
WHERE COALESCE(total, {1}) {2} {3}
AND {4}(status, 'x') = status;`,
    slots: [
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the missing-total push",
        why: "A missing total falls to 0 and rightly misses the 800 bar. The book carries no missing totals, so the push never fires — pure guard discipline.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the tower bar direction",
        why: "Towers clear the bar, so the test is >. Flipping to < would count the ninety-nine ordinary orders instead of the four towers.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the tower bar",
        why: "The bar sits at 800 — four orders clear it. A 500-bar would flag twenty-five orders and flood the watchlist.",
      },
      {
        answer: "IFNULL",
        kind: "keyword",
        label: "the status fold",
        why: "IFNULL(status, 'x') = status proves the lane labels are present — the fold returns each status untouched. UPPER takes a single argument and errors on the two-arg call, and MAX would return the 'x' sentinel instead of the stored lane.",
      },
    ],
    distractors: ["UPPER", "<", "MAX"],
    walkthrough:
      "The COALESCE guard pushes a missing total to 0 — safely below the bar — and the 800 watchlist bar counts the towers: four orders climb past it, with ticket 1088.44 at the top. The < flip would read the ninety-nine ordinary orders, and the 500-bar would flood the list with twenty-five flags. The premium watchlist holds four towers.",
  },
  {
    id: "cs-1425",
    tier: "hard",
    topic: "t2",
    universe: "month-close",
    title: "The float-dust drift",
    brief:
      "From: Month-end close. Re: the reconciliation.\n\nThe books reconcile at cents precision, yet the raw floats disagree: twelve orders show a drift between the line pot and the booked total — floating-point dust from the pot fold. Stage the pots with a guarded fold, compare raw, and count the drifters.",
    ask: "How many orders show a raw drift between the line pot and the booked total?",
    template: `SELECT COUNT(*) AS drifted
FROM (
  SELECT o.id, o.total, o.created_at, COALESCE({1}(i.pot, 0), 0) AS pot
  FROM orders o
  LEFT JOIN (
    SELECT order_id, SUM(quantity * unit_price) AS pot
    FROM order_items
    GROUP BY order_id
  ) i ON i.order_id = o.id
)
WHERE pot != total
AND {2}(created_at) = created_at
AND pot {3} {4};`,
    slots: [
      {
        answer: "IFNULL",
        kind: "keyword",
        label: "the pot guard",
        why: "IFNULL folds any missing pot to 0 — the guard a LEFT JOIN stage demands. ROUND would fold each pot to whole euros and explode the drift to 101 orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the read covers every order. JULIANDAY would compare a number to text and cover none.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the pot gate direction",
        why: "The gate keeps real pots, so the test is > 0. Flipping to < would demand negative pots, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open pot floor",
        why: "A floor of 0 admits every order. A 500-floor would keep only the heavyweight pots — three drifters — and hide the true count.",
      },
    ],
    distractors: ["ROUND", "JULIANDAY", "500"],
    walkthrough:
      "The guarded pot fold keeps every order in scope, and the raw != comparison counts the drifters: twelve orders where SUM(quantity * unit_price) misses the booked total by floating-point dust — dust the cents-rounded books absorb. Folding the pots to whole euros first would explode the count to 101, and the 500-floor would keep only three heavyweights. The drift census: twelve, all dust.",
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
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The pre-order anomaly",
    brief:
      "From: Growth desk. Re: the activation scan.\n\nThe funnel's first metric — signup to first order — hides an anomaly: the fastest activation on file is negative. Some orders were logged before their buyer ever signed up. Measure every order-to-signup gap in days and read the floor.",
    ask: "The fastest order-to-signup gap on the book, in days.",
    template: `SELECT ROUND({1}(julianday(o.created_at) - julianday(c.created_at)), 0) AS activation_days
FROM orders o
JOIN customers c ON c.id = o.customer_id
WHERE {2}(c.created_at) = c.created_at
AND o.total {3} {4};`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "The anomaly scan reads the fastest gap, so the fold is MIN. MAX would read the slowest activation — 475 days — and miss the pre-order entirely.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(c.created_at) = c.created_at proves the signup stamps are date-clean — true for the roster, so the gaps read real rows. JULIANDAY would compare a number to text and void the scan.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the ticket gate direction",
        why: "The scan covers real tickets, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open ticket floor",
        why: "A floor of 0 admits every order. A 600-floor would drop the 576.54 anomaly ticket and soften the floor to -46.",
      },
    ],
    distractors: ["MAX", "JULIANDAY", "600"],
    walkthrough:
      "Julianday folds each pair of stamps to day numbers, and MIN reads the floor: -180 — the 576.54 order of 2024-01-05 was logged 180 days before its buyer's signup, an impossible activation the funnel must flag. MAX would read the 475-day slowpoke instead, and the 600-floor would soften the anomaly to -46. The scan's verdict: the fastest activation is a pre-order.",
  },
  {
    id: "cs-1429",
    tier: "medium",
    topic: "t3",
    universe: "month-close",
    title: "The year-page span",
    brief:
      "From: Month-end close. Re: the 2024 page.\n\nThe close books the 2024 calendar as its own page, and the page has a footprint of its own: the span from the year's first order to its last. Gate the year, fold the stamps to day numbers, take the extremes, and read the page's span.",
    ask: "The number of days from the first to the last 2024 order.",
    template: `SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS span_days
FROM orders
WHERE strftime('%Y', created_at) = {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the year's last order, so the leading fold is MAX. MIN there would flip the span negative — the page would appear to run backwards.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the year's first order, so the subtrahend is MIN. MAX would duplicate the leading fold and zero the span.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the year gate",
        why: "The page is the 2024 calendar, so the year chop carries '2024'. A '2025' fill would read the new year's partial page — a 57-day stub instead of the full year.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the span reads real rows. ROUND would fold each stamp to a number no calendar can read, and JULIANDAY would compare a number to text.",
      },
    ],
    distractors: ["'2025'", "JULIANDAY", "ROUND"],
    walkthrough:
      "The year gate scopes the read to the 2024 page, and the extremes fold to day numbers: the year opened with its first order on 2024-01-01 and closed on 2024-12-27 — 361 days, four short of the full calendar. The '2025' fill would read the new year's 57-day stub, swapping either extreme would invert or zero the span, and the ROUND fold would collapse every stamp into an unreadable number. The 2024 page: 361 days.",
  },
  {
    id: "cs-1430",
    tier: "hard",
    topic: "t3",
    universe: "funnel",
    title: "The week-scoped read",
    brief:
      "From: Growth desk. Re: the week cadence.\n\nThe desk buckets orders into ISO weeks, and the cadence read counts how many distinct weeks the book actually touches — the pairing density of the calendar. Chop the stamps with strftime's %W code and count the buckets.",
    ask: "How many distinct weeks carry at least one order?",
    template: `SELECT COUNT(DISTINCT {1}) AS order_weeks
FROM orders
WHERE {2}(created_at) = created_at
AND total {3} {4};`,
    slots: [
      {
        answer: "strftime('%W', created_at)",
        kind: "keyword",
        label: "the week slicer",
        why: "The ISO week is strftime's %W chop — forty-two distinct weeks carry orders. DATE would slice whole days and count 103 of them, one per row.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean, so the week slicer reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals and empty the calendar.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 300-floor would keep only the premium tickets — thirty-one weeks — and thin the cadence.",
      },
    ],
    distractors: ["'%d'", "JULIANDAY", "300"],
    walkthrough:
      "strftime's %W chop buckets every order into its ISO week, and the distinct count reads forty-two — the book's 103 orders spread across forty-two weeks of the calendar, some weeks crowded, some carrying a single ticket. DATE would slice to 103 distinct days instead, and the 300-floor would thin the cadence to thirty-one premium weeks. The week cadence: forty-two.",
  },
  {
    id: "cs-1431",
    tier: "easy",
    topic: "t3",
    universe: "month-close",
    title: "The new-year footprint",
    brief:
      "From: Month-end close. Re: the new-year page.\n\nThe 2025 page is short but real, and its footprint is the span from the first to the last new-year order. Chop the year, fold the stamps to day numbers, and read the span the close reports on.",
    ask: "The number of days from the first to the last 2025 order.",
    template: `SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS span_days
FROM orders
WHERE strftime('%Y', created_at) = {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last new-year order, so the leading fold is MAX. MIN there would flip the span negative and run the page backwards.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first new-year order, so the subtrahend is MIN. MAX would duplicate the leading fold and zero the span.",
      },
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is the 2025 page, so the gate carries '2025'. A '2024' fill would span the whole back book — 365 days.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the span reads real rows. JULIANDAY would compare a number to text and void the read.",
      },
    ],
    distractors: ["ROUND", "'2024'", "JULIANDAY"],
    walkthrough:
      "The year gate scopes to the 2025 page, the extremes fold to day numbers, and the subtraction spans the new-year footprint: 2025-01-01 to 2025-02-27 — 57 days and counting. The '2024' fill would span the 365-day back book instead, and ROUND would fold each stamp into a number no calendar reads. The new-year footprint: 57 days.",
  },
  {
    id: "cs-1432",
    tier: "medium",
    topic: "t3",
    universe: "growth",
    title: "The mid-week signup check",
    brief:
      "From: Growth desk. Re: the signup timing.\n\nThe signup timing read counts members who joined mid-week — Tuesday through Thursday, weekday codes two through four. Code the signup dates with strftime's %w chop and count the mid-week cohort.",
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
        why: "Mid-week is three codes — 2 for Tuesday, 3 for Wednesday, 4 for Thursday — so the test is IN. NOT IN would flip the read to the edges and count the other eight.",
      },
      {
        answer: "('2','3','4')",
        kind: "keyword",
        label: "the mid-week codes",
        why: "The triple covers Tuesday through Thursday. A bare '2' fill breaks the IN grammar outright — the list must be parenthesized.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean. JULIANDAY would compare a number to text and count nobody.",
      },
    ],
    distractors: ["4", "JULIANDAY", "'2'"],
    walkthrough:
      "The %w chop codes every signup 0 through 6, and the mid-week triple catches eight members — four on Tuesday, two each on Wednesday and Thursday. The edges hold the rest: four Monday joiners, two Friday, and a weekend pair. The bare '2' fill would break the IN grammar before the read even runs. The mid-week cohort: eight.",
  },
  {
    id: "cs-1433",
    tier: "medium",
    topic: "t3",
    universe: "month-close",
    title: "The December stack",
    brief:
      "From: Month-end close. Re: the year-end page.\n\nThe close books the December page separately — the holiday stack the year ends on. Chop the stamps' month and year, keep the grain honest, and count the December 2024 orders the page carries.",
    ask: "How many orders were logged in December 2024?",
    template: `SELECT COUNT(*) AS december_stack
FROM orders
WHERE strftime('%m', created_at) = {1}
AND strftime('%Y', created_at) = {2}
AND {3}(created_at) = created_at
AND total {4} {5};`,
    slots: [
      {
        answer: "'12'",
        kind: "keyword",
        label: "the month code",
        why: "strftime renders December as '12', so the month chop carries '12'. A word fill like 'dec' matches no month code — the codes run '01' through '12'.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the year code",
        why: "The read is the 2024 year-end page, so the year chop carries '2024'. A '2025' fill would find no December at all — the new year opens in January.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the stack reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every December order. A 300-floor would keep only the three heavyweight tickets.",
      },
    ],
    distractors: ["'dec'", "'2025'", "JULIANDAY", "300"],
    walkthrough:
      "The month and year chops scope the read to the holiday page, and the stack counts seven December 2024 orders — the year-end burst the close books apart from the six-order November and the January restart. The '2025' fill would find an empty December, and the 300-floor would keep only three tickets on the page. The December stack: seven.",
  },
  {
    id: "cs-1434",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The new-year page",
    brief:
      "From: Growth desk. Re: the new-year census.\n\nThe new-year page opens the second year of the book, and the desk counts the orders it already carries. Chop the stamps' year, keep the grain honest, and read the census.",
    ask: "How many orders were logged in 2025?",
    template: `SELECT COUNT(*) AS new_year
FROM orders
WHERE strftime('%Y', created_at) = {1}
AND {2}(created_at) = created_at
AND total {3} {4};`,
    slots: [
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is the 2025 page, so the gate carries '2025'. A '2024' fill would count the whole back book — ninety orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the census reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every new-year order. A 500-floor would keep only the three heavyweight tickets.",
      },
    ],
    distractors: ["'2024'", "JULIANDAY", "500"],
    walkthrough:
      "The year chop scopes the read to the 2025 page, and the census counts thirteen orders in the new year's first stretch — against the ninety the back book logged across its twelve months. The '2024' fill would read the back book outright, and the 500-floor would trim the page to three premium tickets. The new-year census: thirteen.",
  },
  {
    id: "cs-1435",
    tier: "medium",
    topic: "t3",
    universe: "fraud",
    title: "The write-off calendar span",
    brief:
      "From: Fraud spot-check. Re: the write-off calendar.\n\nWrite-offs are rare, but they span the book — the read measures how far the cancelled lane stretches, from its first ticket to its last. Fold the lane's stamps to day numbers, take the extremes, and read the span.",
    ask: "The number of days from the first to the last cancelled order.",
    template: `SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS fraud_span
FROM orders
WHERE status = {3}
AND {4}(created_at) = created_at;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last write-off, so the leading fold is MAX. ROUND would fold each stamp into a number no calendar can read and void the span.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first write-off, so the subtrahend is MIN. Swapping the folds would zero the span entirely.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the write-off lane",
        why: "The read scopes to the cancelled lane, so the gate carries 'cancelled'. A 'shipped' fill would span the in-transit lane instead — 407 days.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the lane, so the span reads real rows. JULIANDAY would compare a number to text and void the read.",
      },
    ],
    distractors: ["ROUND", "'shipped'", "JULIANDAY"],
    walkthrough:
      "The lane gate scopes to the seven write-offs, the extremes fold to day numbers, and the subtraction spans the fraud calendar: 2024-01-02 to 2025-01-05 — 369 days, nearly the full book. The shipped flip would span the in-transit lane's 407 days instead, and ROUND would void the read before the extremes ever meet. The write-off calendar: 369 days.",
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
    universe: "growth",
    title: "The thin new-year lane",
    brief:
      "From: Growth desk. Re: the fulfillment page.\n\nThe new year's fulfillment lane is thin so far, and the desk counts it directly: orders logged in 2025 that have already shipped. Chop the year, gate the lane, keep the grain honest, and read the count.",
    ask: "How many 2025 orders have shipped?",
    template: `SELECT COUNT(*) AS shipped_2025
FROM orders
WHERE strftime('%Y', created_at) = {1}
AND status = {2}
AND {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is the new-year page, so the gate carries '2025'. A '2024' fill would count the back book's shipped lane — twenty-seven orders.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the fulfillment lane",
        why: "The page counts work already in transit, so the gate is status = 'shipped'. A 'pending' fill would count the at-risk new-year lane — two orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the count reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: ["'pending'", "'2024'", "JULIANDAY"],
    walkthrough:
      "The year and lane gates scope the read to 2025's in-transit page, and the count reads three — the thin start against the twenty-seven the back book's shipped lane carries. The 'pending' fill would count two at-risk tickets instead, and the '2024' fill would jump back to the full back book. The new-year fulfillment page: three.",
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
    universe: "month-close",
    title: "The quiet-month revenue",
    brief:
      "From: Month-end close. Re: the lean read.\n\nThe revenue pots range widely, and the lean read finds the month that carried the least. Stage the monthly pots through a derived table with a grain guard, sort them ascending, and read the floor line.",
    ask: "The month with the lowest total order revenue, and its pot.",
    template: `SELECT mo, pot
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS pot
  FROM orders
  WHERE {3}(created_at) = created_at
  GROUP BY mo
)
ORDER BY pot {1}
LIMIT {2};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean sort",
        why: "The lean read wants the smallest pot first, so the sort is ascending. DESC would crown January's 3731.97 stack instead of July's lean one.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-read cut",
        why: "The read wants one month, so the cut is 1. A 3-cut would return the three leanest months and blur the floor line.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the pots stage from real rows. JULIANDAY would compare a number to text and stage nothing.",
      },
    ],
    distractors: ["DESC", "3", "JULIANDAY"],
    walkthrough:
      "The monthly pots stage through the derived table — fourteen months, each stamped by its '%Y-%m' key — and the ascending sort reads the floor: July 2024 at 1193.86, the leanest month in the book, well under the 338-average order flow the pot absorbs. The DESC flip would crown January's 3731.97 stack instead, and the 3-cut would blur the floor with runners-up. The lean read: July 2024, 1193.86.",
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
    title: "The shipped pair census",
    brief:
      "From: Growth lead. Re: the shipped rhythm.\n\nThe shipped lane found its pairing rhythm in the back half of the book: months where exactly two orders sit in transit. Stage the shipped monthly census, keep the pairs, and count the months from July 2024 on.",
    ask: "How many months from July 2024 onward carry exactly two shipped orders?",
    template: `SELECT COUNT(*) AS pair_months
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, COUNT(*) AS n
  FROM orders
  WHERE status = 'shipped'
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
        why: "A pair month carries exactly two shipped orders, so the bar is 2. A 1-bar would count the lone-July singleton instead.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the back-half floor direction",
        why: "The read opens at July 2024, so the month gate runs >= '2024-07'. Flipping to < would read everything before the rhythm resumed.",
      },
      {
        answer: "'2024-07'",
        kind: "keyword",
        noVerify: true,
        label: "the back-half floor value",
        why: "The floor value opens the back-half window — four pair months live from July on. A '2024-06' floor would sweep June's pair into the count and break the rhythm's frame.",
      },
    ],
    distractors: ["1", "'2024-06'"],
    walkthrough:
      "The shipped census stages its monthly buckets, and the = 2 bar from July 2024 on counts four pair months — August, September and December 2024, plus February 2025, while June's pair sits just before the floor. The 1-bar would find July's singleton, and the '2024-06' floor would sweep June into the read. The shipped pairing rhythm: four months.",
  },
  {
    id: "cs-1445",
    tier: "hard",
    topic: "t4",
    universe: "expense",
    title: "The burn-ratio read",
    brief:
      "From: Expense desk. Re: the burn share.\n\nThe burn ratio reads cancelled spend against delivered revenue — the share of the book that went out the door as write-offs. Stage both scalars, prove the revenue side exists through a guarded EXISTS, and read the ratio to three decimals.",
    ask: "Cancelled-order spend as a share of delivered revenue, 3 decimals.",
    template: `SELECT ROUND(
  (SELECT SUM(total) FROM orders WHERE status = {1}) * 1.0 /
  (SELECT SUM(total) FROM orders WHERE status = {2}), 3) AS burn_ratio
WHERE EXISTS (
  SELECT 1 FROM orders
  WHERE {3}(created_at) = created_at
);`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the burn numerator",
        why: "The burn side sums the write-off lane, so the numerator gate carries 'cancelled'. A 'pending' fill would burn the at-risk lane into the ratio — a 0.393 share.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the revenue denominator",
        why: "The revenue side sums the closed lane, so the denominator gate carries 'delivered'. A 'shipped' fill would shrink the denominator to the in-transit pot and swell the ratio to 0.096.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the existence grain",
        why: "The EXISTS proof demands date-clean stamps — true for the book — so the gate folds with DATE. JULIANDAY would compare a number to text and void the proof, returning no row at all.",
      },
    ],
    distractors: ["'pending'", "'shipped'", "JULIANDAY"],
    walkthrough:
      "The two scalars stage to 1152.49 of cancelled spend against 15571.07 of delivered revenue, and the ratio rounds to 0.074 — the book burns about one euro in thirteen, a write-off share the close tracks quarter over quarter. The pending fill would read 0.393, and the shipped denominator would read 0.096. The guarded EXISTS keeps the read honest when the book runs dry. The burn share: 0.074.",
  },
  {
    id: "cs-1446",
    tier: "medium",
    topic: "t4",
    universe: "fraud",
    title: "The write-off month census",
    brief:
      "From: Fraud desk. Re: the write-off calendar.\n\nThe fraud read counts how many distinct months carry a cancelled order — the write-off calendar's footprint. Stage the collapse with NULLIF, guard the total, and count the months the lane touches.",
    ask: "How many distinct months carry a cancelled order?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS fraud_months
FROM orders
WHERE {1}(status, {2}) IS NULL
AND total {3} {4};`,
    slots: [
      {
        answer: "NULLIF",
        kind: "keyword",
        label: "the lane collapse",
        why: "NULLIF(status, 'cancelled') collapses the write-off lane to NULL, so IS NULL keeps it. IFNULL(status, 'cancelled') returns the status untouched — never NULL — and the census reads zero.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the audited lane",
        why: "The census tracks write-offs, so the collapse compares against 'cancelled'. A 'pending' fill would map the at-risk calendar instead — ten months.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every write-off. An 800-floor would empty the census — no write-off climbs that high.",
      },
    ],
    distractors: ["IFNULL", "'pending'", "800"],
    walkthrough:
      "NULLIF collapses every cancelled status to NULL, and the distinct-month count reads the write-off calendar: five months carry a cancelled order, out of the fourteen the book spans. IFNULL would return the status untouched and zero the census — the classic fold swap the fraud desk watches for — and the 'pending' fill would map ten months of at-risk work. The write-off calendar: five months.",
  },
  {
    id: "cs-1447",
    tier: "easy",
    topic: "t4",
    universe: "growth",
    title: "The active-member book",
    brief:
      "From: Growth desk. Re: the active book.\n\nThe active roster carries most of the book — and the read proves it by gating the flag. Stage the active members through a subquery with a grain guard, sum their order totals, and read the figure the inactive pair never touches.",
    ask: "Total order revenue across active members' orders.",
    template: `SELECT ROUND(SUM(total), 2) AS active_book
FROM orders
WHERE customer_id IN (
  SELECT id FROM customers
  WHERE active = {1}
  AND {2}(created_at) = created_at
)
AND total {3} {4};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "The active roster carries flag 1 — fourteen members whose orders fill the book. A 0 fill would read the inactive pair's orders instead.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean — true for the roster, so the subquery returns real members. JULIANDAY would compare a number to text and return nobody.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals and empty the book.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 500-floor would keep only the premium tickets and halve the book.",
      },
    ],
    distractors: ["0", "JULIANDAY", "500"],
    walkthrough:
      "The subquery scopes to the fourteen active members, and the sum reads their full order book: 33135.42 — the inactive pair carries only 1697.86, so the active roster owns ninety-five percent of the flow. The 0 fill would flip the read to the pair's small book, and the 500-floor would trim the read to the 17379.43 premium core. The active book: 33135.42.",
  },
  {
    id: "cs-1448",
    tier: "medium",
    topic: "t4",
    universe: "month-close",
    title: "The live-month census",
    brief:
      "From: Month-end close. Re: the live book.\n\nThe close proves a structural fact: no month in the book runs on cancellations alone. The census counts the months that carry live (non-cancelled) work, chopping the stamps to their month keys.",
    ask: "How many distinct months carry at least one non-cancelled order?",
    template: `SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months
FROM orders
WHERE status {1} {2}
AND {3}(created_at) = created_at;`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the live test",
        why: "Live work excludes the write-off lane, so the test is NOT IN ('cancelled'). IN would read the dead months — the five the write-off calendar touches.",
      },
      {
        answer: "('cancelled')",
        kind: "keyword",
        label: "the dead lane",
        why: "Cancelled is the one lane that never ships, so the exclusion list carries it alone. A bare 'cancelled' fill would break the NOT IN grammar outright.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the census reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: ["IN", "JULIANDAY"],
    walkthrough:
      "The NOT IN test scopes out the write-off lane, and the distinct-month census reads fourteen: every month in the book carries live work — no period closes on cancellations alone. The IN flip would read the five months the write-off calendar touches, a fifth of the book. The grain guard keeps the chop honest. The live-month census: fourteen.",
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
      "From: Month-end close. Re: the final capstone.\n\nThe capstone runs the full window play: bucket the months into quartiles by revenue, keep the lean bucket, and walk the running stack to see where it stands. Two windows, one stage — and the lean months tell the close where the year really began.",
    ask: "The running stack at each month of the leanest revenue quartile, under the 15000 wall.",
    template: `SELECT mo, rev, run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         {1}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) {2}) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
)
WHERE q = {3}
AND run {4} {5};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates revenue, so the window folds with SUM. COUNT would stack row counts — 1, 2, 3 — and every month would pass the wall.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean direction",
        why: "The lean months sit at the bottom of the ascending revenue order, so the quartile splits ASC. DESC would flip the split and hand the lean bucket the loudest months' rivals.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the lean bucket",
        why: "Bucket 4 of the ascending split holds the three leanest months. A 1-fill would return the loudest quartile instead.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the wall direction",
        why: "The capstone reads the early stack under the wall, so the test is <. Flipping to > would keep only September's late surge.",
      },
      {
        answer: "15000",
        kind: "number",
        noVerify: true,
        label: "the wall height",
        why: "The wall sits at 15000 — September's 24047.31 stack breaks through, while January and February hide below. A 6000-wall would keep January alone.",
      },
    ],
    distractors: ["COUNT", "DESC", "6000", "25000"],
    walkthrough:
      "Two windows, one stage: the ascending quartile hands the lean bucket to January, February and September, and the running stack tells the close where the year began — January at 3731.97, February at 7341.61, both safely under the 15000 wall, while September's 24047.31 breaks through and leaves the read. The COUNT fold would turn the stack into a row tally and let everything pass. The capstone keeps the two early months.",
  },
];
