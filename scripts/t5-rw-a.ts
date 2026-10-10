/// <reference types="bun-types" />
/** Wave-5 rewrites batch A: cs-1401..cs-1420 (t1 structural fixes + t2 schema-grounded rebuilds). */
export const RW_A: Record<string, string> = {
  "cs-1401": `  {
    id: "cs-1401",
    tier: "easy",
    topic: "t1",
    universe: "catalog",
    title: "The dash-stripped tags",
    brief:
      "From: Catalog ops. Re: the SKU normalizer.\\n\\nThe normalizer strips dashes from SKUs, and the audit counts the tags it actually changes. REPLACE wipes every dash; a tag with none passes through untouched. Count the changed tags with the storage guards riding along.",
    ask: "How many product names does the dash-stripper actually change?",
    template: \`SELECT COUNT(*) AS changed
FROM products
WHERE REPLACE(name, '-', '') != name
AND {1}(name) = name
AND stock {2} {3};\`,
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
  },`,
  "cs-1405": `  {
    id: "cs-1405",
    tier: "medium",
    topic: "t1",
    universe: "growth",
    title: "The consonant-led roster",
    brief:
      "From: Growth desk. Re: the sorting pass.\\n\\nThe desk's new sort buckets names by their opening letter, and the consonant-led group needs its census. Slice the first character, exclude the vowels, keep the active roster only, and count what the sort will actually bucket.",
    ask: "How many active members' names open with a consonant?",
    template: \`SELECT COUNT(*) AS consonant_led
FROM customers
WHERE SUBSTR(name, 1, 1) {1} ('A','E','I','O','U')
AND {2}(city) = city
AND {3}(created_at) = created_at
AND active > {4};\`,
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
  },`,
  "cs-1407": `  {
    id: "cs-1407",
    tier: "easy",
    topic: "t1",
    universe: "growth",
    title: "The lowercased import",
    brief:
      "From: Growth desk. Re: the email normalization.\\n\\nThe import pipeline lowercases every email before storing, and the audit verifies the fold was lossless: LOWER must preserve the distinct count. Fold the roster's addresses and count the distinct survivors.",
    ask: "How many distinct emails survive the lowercase fold?",
    template: \`SELECT COUNT(DISTINCT {1}(email)) AS folded
FROM customers
WHERE INSTR(email, {2}) > {3};\`,
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
  },`,
  "cs-1409": `  {
    id: "cs-1409",
    tier: "medium",
    topic: "t1",
    universe: "supplier",
    title: "The bench initial roll",
    brief:
      "From: Supplier desk. Re: the nameplate roll.\\n\\nThe bench carries six vendors, and the desk rolls up their nameplate initials for the catalog index. Slice each name's first character, prove the storage clean, and read the initial that leads the roll.",
    ask: "Which initial leads the supplier bench, and how many vendors share it?",
    template: \`SELECT SUBSTR(name, 1, 1) AS ini, COUNT(*) AS n
FROM suppliers
WHERE {1}(name) = name
GROUP BY ini
ORDER BY n {2}
LIMIT {3};\`,
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
  },`,
  "cs-1412": `  {
    id: "cs-1412",
    tier: "medium",
    topic: "t1",
    universe: "growth",
    title: "The surname-start check",
    brief:
      "From: Growth desk. Re: the two-column sort.\\n\\nThe contact cards sort by surname, and the audit verifies every surname opens with a capital — the two-column split must not lowercase the tail. Slice each surname's first character, compare it to its own uppercase fold, and count the clean caps.",
    ask: "How many customer surnames open with an uppercase letter?",
    template: \`SELECT COUNT(*) AS capped_surnames
FROM customers
WHERE SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1) {1} UPPER(SUBSTR(SUBSTR(name, INSTR(name, ' ') + 1), 1, 1))
AND LENGTH(name) {2} {3};\`,
    slots: [
      {
        answer: "=",
        kind: "keyword",
        label: "the caps test",
        why: "A capital surname-start equals its own uppercase fold, so the test is =. Flipping to != would count the lowercase starts — of which the roster carries none.",
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
      "The surname slice lifts each tail's first character, and the caps test compares it to its own uppercase fold — every stored surname opens with a capital, so the audit counts sixteen clean caps with zero exceptions. The < flip would run the caps test backwards and return an empty ledger. The 12-floor would trim the census to the three longest names. The two-column split is safe to ship.",
  },`,
  "cs-1416": `  {
    id: "cs-1416",
    tier: "easy",
    topic: "t2",
    universe: "fraud",
    title: "The write-off census",
    brief:
      "From: Fraud spot-check. Re: the write-off lane.\\n\\nThe write-off process touches the cancelled lane only, and the spot-check counts it with a NULLIF probe: fold each status against 'cancelled' and let the collapse speak. A NULL means the row matched the write-off lane.",
    ask: "How many orders sit in the cancelled write-off lane?",
    template: \`SELECT COUNT(*) AS writeoffs
FROM orders
WHERE NULLIF(status, {1}) IS NULL
AND {2}(created_at) = created_at
AND total {3} {4};\`,
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
  },`,
  "cs-1417": `  {
    id: "cs-1417",
    tier: "medium",
    topic: "t2",
    universe: "inventory",
    title: "The triple-unit census",
    brief:
      "From: Warehouse ops. Re: the pick-face layout.\\n\\nThe pick-face reserves a bin width for triple picks, and the census counts the lines that ship three units in one go. NULLIF collapses each quantity against the triple and the IS NULL test keeps the matches, with a guarded price stage underneath.",
    ask: "How many order lines ship exactly three units?",
    template: \`SELECT COUNT(*) AS tripling
FROM (
  SELECT order_id, quantity, COALESCE(unit_price, 0) AS price
  FROM order_items
)
WHERE {1}(quantity, {2}) IS NULL
AND price {3} {4};\`,
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
  },`,
  "cs-1418": `  {
    id: "cs-1418",
    tier: "easy",
    topic: "t2",
    universe: "month-close",
    title: "The buyer roll",
    brief:
      "From: Month-end close. Re: the buyer roll.\\n\\nThe close opens with the buyer roll: how many members actually placed an order. The roll folds each customer reference through COALESCE before the distinct count, so a NULL reference could never sneak into the tally.",
    ask: "How many distinct members carry at least one order?",
    template: \`SELECT {1}(DISTINCT {2}) AS buyers
FROM orders
WHERE total {3} {4};\`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the roll fold",
        why: "The roll counts distinct members, so the fold is COUNT. SUM would add the member ids together and read a nonsensical 136; AVG would read the midpoint of the id ladder.",
      },
      {
        answer: "COALESCE(customer_id, 0)",
        kind: "keyword",
        label: "the guarded reference",
        why: "COALESCE folds any missing reference to 0 before the distinct count — a guard the close keeps on every roll. A bare customer_id would let a missing id spawn a phantom member.",
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
  },`,
  "cs-1419": `  {
    id: "cs-1419",
    tier: "medium",
    topic: "t2",
    universe: "refund-audit",
    title: "The priority queue",
    brief:
      "From: Refund audit. Re: the priority queue.\\n\\nThe priority queue targets pending orders above the 100-euro line — work that may still ship but is at risk. Guard the total with COALESCE so a missing figure can never dodge the queue, gate the lane, and count the targets.",
    ask: "How many pending orders total more than 100 euros?",
    template: \`SELECT COUNT(*) AS queue
FROM orders
WHERE COALESCE(total, 0) {1} {2}
AND status = {3}
AND {4}(created_at) = created_at;\`,
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
  },`,
  "cs-1420": `  {
    id: "cs-1420",
    tier: "easy",
    topic: "t2",
    universe: "refund-audit",
    title: "The quiet-lane floor",
    brief:
      "From: Refund audit. Re: the small-ticket floor.\\n\\nThe audit proves a negative: no pending order sits below the 100-euro line — the quiet lane under the bar is empty. Guard the total with COALESCE, flip the queue's direction, and let the honest zero speak.",
    ask: "How many pending orders total less than 100 euros?",
    template: \`SELECT COUNT(*) AS quiet_lane
FROM orders
WHERE COALESCE(total, 0) {1} {2}
AND status = {3}
AND {4}(created_at) = created_at;\`,
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
        why: "The bar sits at 100 — nothing pending hides below it. A 300-bar would catch fourteen tickets and destroy the negative proof.",
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
    distractors: [">", "MAX", "'cancelled'"],
    walkthrough:
      "The < direction scopes under the bar, and the pending lane answers with the honest zero: nothing waits below 100 euros — the lane's smallest ticket already clears the line. Every distractor finds company: the > flip reads the fourteen-ticket queue, the 300-bar catches the whole lane, and the cancelled fill counts two small write-offs. The quiet lane: zero, proven.",
  },`,
};
