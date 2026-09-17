// Case batch W1 — Module 5 text-transform cases cs-1203…cs-1240.
// 38 cases: 13 easy / 13 medium / 12 hard, all topic w1 (Text transforms, lesson 29).
// Spine: UPPER/LOWER case-folding, LENGTH censuses, SUBSTR slices, INSTR position
// math, REPLACE reformatting, || concatenation and PRINTF plates over the
// storefront db. Every figure was probed against the live seed (committed
// receipts scripts/m5-facts-r1.out, m5-facts-r1b.out, m5-facts-r1c.out plus this
// wave's scripts/m5-facts-w1.out and m5-facts-w1b.out (filled-query + citation
// addendum), SQLite 3.53) and is mechanically re-verified by
// scripts/case-audit.ts. Shapes deliberately avoid r0's cs-1201 region census and
// cs-1202 leaderboard.

import type { CaseStudy } from "./types";

export const casesW1: CaseStudy[] = [
  // ================= easy (cs-1203…cs-1215) =================
  {
    id: "cs-1203",
    tier: "easy",
    topic: "w1",
    universe: "catalog",
    title: "The Audio shout row",
    brief:
      "Catalog content: the marketplace feed rejects mixed-case titles, so every product we syndicate needs an all-caps display twin next to its measured title length. Start with the loudest example we own: the longest name in the Audio shelf. One row, three columns — name, shout, length.",
    ask: "Which Audio product has the longest name, uppercased, and how many characters is it?",
    template:
      "SELECT name, {1}(name) AS shout, {2}(name) AS len\nFROM products\nWHERE category = {3}\nORDER BY len DESC\nLIMIT 1;",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the case shouter",
        why: "UPPER(name) builds the feed-safe twin — probed it renders NOISE-CANCELING HEADSET. LOWER would hand the marketplace a lowercase title, which is what the feed rejects." },
      { answer: "LENGTH", kind: "keyword", label: "the character counter",
        why: "LENGTH counts characters — probed, the Audio winner measures 23. MAX(name, name) is the two-argument scalar max; it would just echo the name back as the 'length'." },
      { answer: "'Audio'", kind: "keyword", label: "the shelf filter",
        why: "The Audio shelf holds 3 products (Noise-Canceling Headset 23, Bluetooth Speaker Mini 22, Studio Desktop Mic 18). 'Video' would rank Ring Light 14\" instead — a different shelf." },
    ],
    distractors: ["LOWER", "MAX", "'Video'"],
    walkthrough:
      "The feed's rule is case, so the pipe is UPPER(name) — one row flows through and comes out shouting. The filter picks the Audio shelf, whose three names measure 23, 22 and 18 characters, and ORDER BY len DESC + LIMIT 1 keeps the loudest: Noise-Canceling Headset, 23 characters. LOWER would still sort correctly but ship a lowercase title — the exact thing the feed rejects — and MAX(name, name) is scalar max masquerading as a counter, echoing the name back where a number belongs.",
  },
  {
    id: "cs-1204",
    tier: "easy",
    topic: "w1",
    universe: "funnel",
    title: "Cohort year slices",
    brief:
      "Marketing wants the signup funnel split by intake year before Friday's review, but created_at arrives as full timestamps and the dashboard groups on the raw string. Slice the year off the front of each signup date and count the two cohorts the store actually has.",
    ask: "How many customers signed up in each intake year, sliced from created_at?",
    template:
      "SELECT {1}(created_at, 1, {2}) AS yr, {3} AS signups\nFROM customers\nGROUP BY yr\nORDER BY yr;",
    slots: [
      { answer: "SUBSTR", kind: "keyword", label: "the slicer",
        why: "SUBSTR(created_at, 1, 4) cuts the 4-character year off the front — positions are 1-based. Probed it yields '2023' and '2024'; UPPER(created_at, 1, 4) is a wrong-argument error." },
      { answer: "4", kind: "number", label: "the year width",
        why: "Four characters is the whole year '2024'; the probed cohort split is 2023 → 4 signups, 2024 → 12. A width of 2 would group on '20' and fold both cohorts into one 16-row bucket." },
      { answer: "COUNT(*)", kind: "keyword", label: "the cohort counter",
        why: "COUNT(*) counts the rows folded into each slice — 4 then 12. SUM(created_at) coerces the dates to 0 and reports zeros instead of headcounts." },
    ],
    distractors: ["UPPER", "2", "SUM"],
    walkthrough:
      "Timestamps are text here, so the year is a substring, not a type: SUBSTR(created_at, 1, 4) walks every signup date and keeps the first four characters. GROUP BY yr folds 16 customers into the two probed cohorts — 2023 with 4 signups (Alice, Bruno, Chloe, Dmitri) and 2024 with 12. Widen the slice to nothing less: width 2 collapses both years into the single prefix '20' and the funnel chart flattens to one bar of 16. COUNT(*) is the honest headcount per fold.",
  },
  {
    id: "cs-1205",
    tier: "easy",
    topic: "w1",
    universe: "month-close",
    title: "The void invoice, readable",
    brief:
      "Close checklist: the archiving tool ingests invoice ids with slashes, not dashes, and one row keeps failing the import. Take the voided invoice, swap its dashes for slashes, and hand the archivist the readable form so the month can close.",
    ask: "Show the void invoice's number with every dash swapped for a slash.",
    template:
      "SELECT number, {1}(number, {2}, '/') AS readable\nFROM invoices\nWHERE status = {3};",
    slots: [
      { answer: "REPLACE", kind: "keyword", label: "the swapper",
        why: "REPLACE scans the whole string and swaps every hit — probed it turns INV-2024-011 into INV/2024/011. TRIM(number, '-', '/') is a wrong-argument error; TRIM only shaves characters off the ends." },
      { answer: "'-'", kind: "keyword", label: "the dash needle",
        why: "The dash is what the archiver rejects. Swap '/' for '/' and nothing changes — the probed void number keeps its dashes and the import fails again." },
      { answer: "'void'", kind: "keyword", label: "the status filter",
        why: "Exactly 1 of the 28 invoices is void — INV-2024-011. The 6 open invoices would pour six different numbers into an archiving job meant for the broken row." },
    ],
    distractors: ["TRIM", "'/'", "'open'"],
    walkthrough:
      "This is a find-and-replace across a whole column value: REPLACE(number, '-', '/') walks the void invoice's id and swaps both dashes, yielding INV/2024/011 — the probed form the archiver accepts. The status filter matters: 28 invoices split 21 paid, 6 open, 1 void, and only the void row is failing import. Trim would error (it takes at most two arguments and never substitutes mid-string), and replacing a slash with a slash is a no-op that ships the broken id straight back to the archivist.",
  },
  {
    id: "cs-1206",
    tier: "easy",
    topic: "w1",
    universe: "refund-audit",
    title: "Cancelled, flagged loud",
    brief:
      "Refunds desk: the weekly cancellation review opens with the three biggest cancelled orders, and the CSV loader wants the status flag in caps. Rank the cancelled orders by total, keep the top three, and stamp each with an uppercased status flag.",
    ask: "List the three largest cancelled orders with an uppercased status flag.",
    template:
      "SELECT o.id, c.name, ROUND(o.total, 2) AS total, {1}(o.status) AS flag\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status = {2}\nORDER BY total DESC\nLIMIT {3};",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the flag shouter",
        why: "UPPER(o.status) prints CANCELLED for the loader. Probed rows show the flag column shouting on all three; LOWER would feed it 'cancelled' and trip the loader's case check." },
      { answer: "'cancelled'", kind: "keyword", label: "the status filter",
        why: "The cancelled crowd is 7 of 103 orders. 'pending' would rank the 14 open orders instead — Farid's 1088.44 at the top, none of them refundable." },
      { answer: "3", kind: "number", noVerify: true, label: "the review depth",
        why: "The review opens with three rows; probed they are Keiko's 397.99, then Alice's 206.19 and 152.52. A limit of 5 drags Emma Wilson's 143.86 and Alice Chen's 136.11 onto the slide." },
    ],
    distractors: ["LOWER", "'pending'", "5"],
    walkthrough:
      "Two moves: filter to the cancelled crowd — 7 of the store's 103 orders — then shout the flag with UPPER so the loader's case check passes. Ordering by total DESC puts Keiko Sato's 397.99 first, then Alice Chen's 206.19 and 152.52, and LIMIT 3 is the review's stated depth. Aim the filter at 'pending' and the same query happily ranks fourteen open orders — correct SQL, wrong refund queue. LOWER is the quiet failure: every figure identical, every flag lowercase, loader rejected.",
  },
  {
    id: "cs-1207",
    tier: "easy",
    topic: "w1",
    universe: "growth",
    title: "Where the @ sits",
    brief:
      "Board prep: the deck quotes how deep the @ sits in a hero customer's email as a stand-in for handle width, and someone hardcoded 0 as the placeholder. For Alice Chen, find the 1-based position of the @ and the full email length so the slide stops guessing.",
    ask: "For Alice Chen, what position does the @ occupy and how long is the email?",
    template:
      "SELECT name, {1}(email, {2}) AS at_pos, LENGTH(email) AS elen\nFROM customers\nWHERE name = {3};",
    slots: [
      { answer: "INSTR", kind: "keyword", label: "the position finder",
        why: "INSTR returns the 1-based first hit — probed 11 for Alice. SUBSTR(email, '@') misuses the slicer: '@' coerces to position 0 and the whole email comes back as the 'position'." },
      { answer: "'@'", kind: "keyword", label: "the needle",
        why: "The @ is the landmark. Hunt '#' and INSTR reports 0 — the probed absent-needle receipt — and the slide would claim Alice has no email at all." },
      { answer: "'Alice Chen'", kind: "keyword", label: "the hero row",
        why: "Alice is the deck's hero customer. 'Grace Kim' would return position 10 with a 21-character email — a different hero, a wrong slide." },
    ],
    distractors: ["SUBSTR", "'#'", "'Grace Kim'"],
    walkthrough:
      "INSTR(email, '@') answers one question — where does the first @ sit, counting from 1? Probed: position 11 in alice.chen@example.com, a 22-character address, so the handle runs 10 characters before the landmark. Swap the needle for '#' and INSTR returns 0, the engine's way of saying not found — a slide that now claims the hero has no email. SUBSTR is the tempting wrong tool: with '@' as its start it silently coerces to 0 and hands back the entire address as a 'position'.",
  },
  {
    id: "cs-1208",
    tier: "easy",
    topic: "w1",
    universe: "pricing",
    title: "The shelf plate for 199.99",
    brief:
      "Pricing review: shelf labels print whatever the column gives them, so the flagship Smart Watch S shows a bare 199.99 with no cent discipline. Format its price with exactly two decimals onto a plate the label printer will accept.",
    ask: "Show Smart Watch S's price formatted to exactly two decimal places.",
    template:
      "SELECT name, price, {1}({2}, price) AS shelf\nFROM products\nWHERE name = {3};",
    slots: [
      { answer: "PRINTF", kind: "keyword", label: "the plate printer",
        why: "PRINTF formats per the pattern — probed PRINTF('%.2f', 199.99) = '199.99'. ROUND('%.2f', price) puts the format where a number belongs and coerces it to 0." },
      { answer: "'%.2f'", kind: "keyword", label: "the two-decimal pattern",
        why: "%.2f means fixed-point, two decimals: probed '199.99'. '%.0f' prints '200' and '%d' prints '199' — one rounds up, one floors, both lose the cents the shelf must show." },
      { answer: "'Smart Watch S'", kind: "keyword", label: "the flagship row",
        why: "Smart Watch S is the store's top price at 199.99 — the flagship the review quotes. Any other name returns a different plate or nothing at all." },
    ],
    distractors: ["'%.0f'", "'%d'", "ROUND"],
    walkthrough:
      "Formatting is a string job, not a math job: PRINTF('%.2f', price) walks the pattern and prints exactly two decimals — probed '199.99' for the store's flagship. The pattern is the whole contract: %.0f rounds to '200' (a plate that overcharges by a cent) and %d floors to '199' (one that undercharges). ROUND exists in the toolbox but takes a number first — hand it the format string and it coerces '%.2f' to 0 and prints a zero plate. Same row, wrong money.",
  },
  {
    id: "cs-1209",
    tier: "easy",
    topic: "w1",
    universe: "expense",
    title: "The rent vendor slug",
    brief:
      "Spend report: the expense pipeline keys vendors by slug — spaces swapped for dashes — and the Rent line keeps missing its match. Build the slug for the Rent category's vendor and count how many rent rows carry it.",
    ask: "Slug the Rent vendor (spaces to dashes) and count its expense rows.",
    template:
      "SELECT REPLACE(vendor, {1}, {2}) AS slug, COUNT(*) AS n\nFROM expenses\nWHERE category = {3}\nGROUP BY slug;",
    slots: [
      { answer: "' '", kind: "keyword", label: "the space needle",
        why: "The slug rule swaps spaces. Probed, hunting '' swaps nothing — REPLACE with an empty needle returns the string unchanged and the key never matches." },
      { answer: "'-'", kind: "keyword", label: "the dash swap",
        why: "Dashes are the pipeline's glue: probed output 'Atlas-Property-GmbH'. An underscore builds 'Atlas_Property_GmbH' — a slug the downstream key has never seen." },
      { answer: "'Rent'", kind: "keyword", label: "the category filter",
        why: "Rent is 14 of the 36 expense rows, all from Atlas Property GmbH — probed the group counts 14. 'Ads' would slug AdWorks Media instead, a different vendor line." },
    ],
    distractors: ["''", "'_'", "'Ads'"],
    walkthrough:
      "Slugs are mechanical: REPLACE(vendor, ' ', '-') walks the Rent vendor's name and glues each word with dashes — probed 'Atlas-Property-GmbH', counted over 14 rent rows. The needle matters as much as the swap: an empty needle is a silent no-op (the engine returns the string untouched, probed), so the slug keeps its space and never matches the pipeline key. 'Ads' aims the whole pipe at AdWorks Media — 14 rows of advertising, zero of rent — and an underscore builds a slug nobody downstream owns.",
  },
  {
    id: "cs-1210",
    tier: "easy",
    topic: "w1",
    universe: "inventory",
    title: "The 13-character twins",
    brief:
      "Warehouse labels: the short-bin printer only takes names of a fixed width, and the shortest shelf names are the ones constantly mislabeled. List the products whose names measure exactly 13 characters — the two SKUs the short bin keeps mangling.",
    ask: "Which two products have 13-character names, shortest in the catalog?",
    template:
      "SELECT name, {1}(name) AS len\nFROM products\nWHERE LENGTH(name) = {2}\nORDER BY name\nLIMIT {3};",
    slots: [
      { answer: "LENGTH", kind: "keyword", label: "the measurer",
        why: "LENGTH(name) counts every character — probed, the catalog's two shortest names both measure 13. UPPER(name) would return uppercase strings where the bin check expects a number." },
      { answer: "13", kind: "number", label: "the short-bin width",
        why: "13 is the probed minimum: 4K Webcam Pro and Smart Watch S. Filter 14 instead and only Ring Light 14\" qualifies — one row where the bin expects two." },
      { answer: "2", kind: "number", noVerify: true, label: "the row cap",
        why: "The manifest caps the short bin at two SKUs, and probed exactly two names measure 13. A limit of 0 would print an empty bin ticket." },
    ],
    distractors: ["UPPER", "0", "MAX"],
    walkthrough:
      "Measure first, filter second: LENGTH(name) stamps each of the 16 product names with its character count, and the probed minimum is 13 — hit by exactly two SKUs, 4K Webcam Pro and Smart Watch S. That's the short bin's whole population, so LIMIT 2 is a cap that happens to bind exactly. Widen the filter to 14 and Ring Light 14\" becomes the lone occupant; set the cap to 0 and the printer runs empty. UPPER in the measure slot ships strings where the bin check needs numbers.",
  },
  {
    id: "cs-1211",
    tier: "easy",
    topic: "w1",
    universe: "fraud",
    title: "The modal name length",
    brief:
      "Fraud spot-check: synthetic accounts often cluster at one name length, so the risk desk wants the modal LENGTH(name) across the 16 live customers before it signs off on the merge. Confirm the dominant length and how many customers share it.",
    ask: "Which name length do the most customers share, and how many is that?",
    template:
      "SELECT LENGTH(name) AS ln, {1} AS n\nFROM customers\nGROUP BY ln\nHAVING ln = {2} AND n = {3};",
    slots: [
      { answer: "COUNT(*)", kind: "keyword", label: "the cluster counter",
        why: "COUNT(*) sizes each length cluster — probed the 12-char cluster holds 5. SUM as a bare chip is no column at all; MAX would size clusters with text." },
      { answer: "12", kind: "number", label: "the modal length",
        why: "Probed distribution 9:1, 10:4, 11:3, 12:5, 13:2, 14:1 — twelve characters is the mode, shared by Chloe Dubois, Farid Nasser, Jamal Wright, Liam O'Brien and Olivia Brown." },
      { answer: "5", kind: "number", label: "the cluster size",
        why: "Five customers sit at length 12 — the probed peak. Ask for 3 and the query describes the 11-char cluster (Bruno, Emma, Hiro) instead of the mode." },
    ],
    distractors: ["SUM", "MAX", "11", "3"],
    walkthrough:
      "The risk desk's question is a mode: fold 16 customers by LENGTH(name) and find the biggest cluster. The probed ladder runs 1, 4, 3, 5, 2, 1 across lengths 9–14, and the peak is 12 characters carrying 5 customers — Chloe Dubois, Farid Nasser, Jamal Wright, Liam O'Brien, Olivia Brown. HAVING pins both facts so the query asserts what it reports. Slide one notch to 11 and the crowd shrinks to Bruno, Emma and Hiro — a real cluster, but not the one the sign-off quotes.",
  },
  {
    id: "cs-1212",
    tier: "easy",
    topic: "w1",
    universe: "growth",
    title: "The hero order's flag",
    brief:
      "Growth board: the hero stat is the store's single biggest order, and the deck builds its callout line by gluing customer, separator and an uppercased status. Someone dropped the glue and the casing. Rebuild the callout for the 1088.44 order.",
    ask: "Build the callout line — name, em-dash, uppercased status — for the biggest order.",
    template:
      "SELECT o.id, c.name || {1} || {2}(o.status) AS line, o.total\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.total = {3};",
    slots: [
      { answer: "' — '", kind: "keyword", label: "the glue separator",
        why: "|| glues strings and the deck's house style glues with an em-dash — probed line 'Farid Nasser — PENDING'. A middot builds a line no template matches." },
      { answer: "UPPER", kind: "keyword", label: "the status shouter",
        why: "The callout shouts the flag: UPPER gives PENDING. LOWER would print 'pending' — same facts, wrong register for a board slide." },
      { answer: "1088.44", kind: "number", label: "the hero total",
        why: "Probed: order 74, Farid Nasser, pending, 1088.44 — the store's largest order. 945.21 is order 43 (Chloe Dubois), the runner-up the deck does not feature." },
    ],
    distractors: ["' · '", "LOWER", "945.21"],
    walkthrough:
      "Concatenation is the whole trick: || glues name, separator and status into one display cell, and only the biggest order survives the WHERE. Probed: order 74 belongs to Farid Nasser, sits at 1088.44, and is still pending — the exact tension the board wants on the slide, rendered as 'Farid Nasser — PENDING'. Aim at 945.21 and the callout features Chloe Dubois's runner-up instead. LOWER keeps every number honest but prints the flag in lowercase — a board deck detail that reads as a typo.",
  },
  {
    id: "cs-1213",
    tier: "easy",
    topic: "w1",
    universe: "supplier",
    title: "The 4.8 partner's plate",
    brief:
      "Procurement: supplier scorecards print ratings on two-decimal plates, and the top-rated partner's card keeps rendering 4.8 — one decimal short of house style. Format the 4.8-rated supplier's rating onto a proper plate.",
    ask: "Which supplier is rated 4.8, and what does its rating look like on a two-decimal plate?",
    template:
      "SELECT name, region, {1}({2}, rating) AS plate\nFROM suppliers\nWHERE rating = {3};",
    slots: [
      { answer: "PRINTF", kind: "keyword", label: "the plate printer",
        why: "PRINTF('%.2f', 4.8) renders the probed plate '4.80'. ROUND('%.2f', rating) reads the format as a number, coerces it to 0, and prints a zero scorecard." },
      { answer: "'%.2f'", kind: "keyword", label: "the two-decimal pattern",
        why: "Two decimals is scorecard house style: probed '4.80'. '%.0f' would print '5' — a rating the supplier never earned — and '%d' floors to '4'." },
      { answer: "4.8", kind: "number", label: "the top rating",
        why: "Probed: Alpine Audio GmbH (EU) is the 4.8-rated partner — the roster's best. 4.6 is Nordic Gadgets AB, the runner-up on a different card." },
    ],
    distractors: ["'%.0f'", "'%d'", "ROUND", "4.6"],
    walkthrough:
      "Scorecards live or die on display discipline: PRINTF('%.2f', rating) pads 4.8 into the probed plate '4.80', zeros included. The filter picks the roster's top partner — Alpine Audio GmbH, the only 4.8 in the supplier table. The pattern distractors show what undisciplined plates cost: %.0f rounds the partner up to a 5 they didn't earn, %d floors them to a 4. And ROUND can't rescue it — fed the format string first, it coerces to zero and prints a supplier with no rating at all.",
  },
  {
    id: "cs-1214",
    tier: "easy",
    topic: "w1",
    universe: "funnel",
    title: "APAC cities, lowercase tags",
    brief:
      "Marketing ops: the geo tool builds lowercase city tags for the APAC cohort and measures each tag so the map labels don't collide. Lowercase the APAC customers' cities and carry the character count next to each tag.",
    ask: "List the APAC customers' cities lowercased, each with its length.",
    template:
      "SELECT name, {1}(city) AS tag, {2}(city) AS cl\nFROM customers\nWHERE region = {3}\nORDER BY tag;",
    slots: [
      { answer: "LOWER", kind: "keyword", label: "the tag lowercaser",
        why: "The geo tool's spec is lowercase: probed tags dubai, mumbai, nagoya, osaka, seoul. UPPER would shout them and every map label fails the tool's case check." },
      { answer: "LENGTH", kind: "keyword", label: "the tag measurer",
        why: "LENGTH(city) sizes each tag — probed 5 for dubai/osaka/seoul, 6 for mumbai/nagoya. SUM(city) coerces the text to 0 and every label measures zero." },
      { answer: "'APAC'", kind: "keyword", label: "the region filter",
        why: "APAC holds 5 of the 16 customers — probed exactly five tag rows. 'EU' would label eight European cities the tool was never pointed at." },
    ],
    distractors: ["UPPER", "SUM", "'EU'"],
    walkthrough:
      "Two pipes over one scan: LOWER(city) builds the tag the geo tool expects, LENGTH(city) measures it, and the region filter keeps the APAC five. Probed tags: dubai, mumbai, nagoya, osaka, seoul — three measure 5, two measure 6, so the collision check has real numbers to compare. Filter 'EU' instead and the tool labels Berlin and Milan on an APAC map; shout the tags with UPPER and every one fails the case check. SUM on text is the quiet zero — a measurer that reports 0 for every city.",
  },
  {
    id: "cs-1215",
    tier: "easy",
    topic: "w1",
    universe: "growth",
    title: "The 23-character inbox crowd",
    brief:
      "Deliverability audit: the ESP charges by address length bands, and the 23-character band is the one the invoice disputes. Shout the names in that band with their address lengths so finance can match them to the bill.",
    ask: "Which five customers have 23-character emails? Uppercase the names.",
    template:
      "SELECT {1}(name) AS who, {2}(email) AS elen\nFROM customers\nWHERE LENGTH(email) = {3}\nORDER BY who;",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the name shouter",
        why: "Finance matches invoices on the shouted name — probed BRUNO SILVA, EMMA WILSON, HIRO TANAKA, ISABELLA ROSSI, LIAM O'BRIEN. LOWER would ship a lowercase roster the bill can't match." },
      { answer: "LENGTH", kind: "keyword", label: "the address measurer",
        why: "LENGTH(email) sizes each address — probed all five band members measure 23. SUBSTR(email) is a wrong-argument error; the slicer needs a start position." },
      { answer: "23", kind: "number", label: "the disputed band",
        why: "23 is the band finance disputes — probed exactly 5 customers sit in it. Band 24 holds only 3 (Chloe, Jamal, Olivia) and the dispute would rest on the wrong crowd." },
    ],
    distractors: ["LOWER", "SUBSTR", "24", "MAX"],
    walkthrough:
      "Banding is a LENGTH filter: LENGTH(email) = 23 isolates the disputed band, and the probed roster is five customers — Bruno Silva, Emma Wilson, Hiro Tanaka, Isabella Rossi, Liam O'Brien. UPPER shouts each name so finance can eyeball-match the bill. Slide to band 24 and the roster shrinks to Chloe Dubois, Jamal Wright and Olivia Brown — three addresses billed at the wrong tier. MAX in the shouter slot is the aggregate trap: one arbitrary row where a five-row roster belongs.",
  },

  // ================= medium (cs-1216…cs-1228) =================
  {
    id: "cs-1216",
    tier: "medium",
    topic: "w1",
    universe: "supplier",
    title: "The GmbH shelf",
    brief:
      "Procurement audit: German partners are flagged by their name tail, not a column, so the compliance sheet derives the tail with a slice from the name's own length. List every product supplied by a supplier whose name ends in GmbH, with the supplier's measured name length.",
    ask: "Which products come from a supplier whose name ends in GmbH, and how long is that supplier's name?",
    template:
      "SELECT s.name, p.name AS product, LENGTH(s.name) AS ln\nFROM products p JOIN suppliers s ON s.id = p.supplier_id\nWHERE SUBSTR(s.name, {1}) = {2} AND ln = {3}\nORDER BY product;",
    slots: [
      { answer: "LENGTH(s.name) - 3", kind: "keyword", label: "the tail position",
        why: "A 4-character tail starts three from the end — probed, SUBSTR(s.name, LENGTH(s.name) - 3) yields 'GmbH' for Alpine Audio GmbH. Start at LENGTH itself and the slice is one character ('H')." },
      { answer: "'GmbH'", kind: "keyword", label: "the German tail",
        why: "'GmbH' is the flag: probed, exactly one supplier ends in it — Alpine Audio GmbH. 'AB' matches nobody, because Nordic's tail is 's AB' from this slice position." },
      { answer: "17", kind: "number", label: "the partner's name length",
        why: "Alpine Audio GmbH measures 17 characters — probed, and the compliance sheet stamps it. Pin 19 instead and the sheet points at Midwest Hardware Co, whose tail is 'e Co'." },
    ],
    distractors: ["LENGTH(s.name) - 4", "'AB'", "19"],
    walkthrough:
      "Negative-position thinking without the negative: a tail of 4 characters starts at LENGTH(name) - 3, so SUBSTR(s.name, LENGTH(s.name) - 3) peels exactly 'GmbH' off Alpine Audio GmbH — the probed 17-character partner. The join fans the flag out to its shelf: two products, Desk Mat Extended and Studio Desktop Mic. Pin the length at 17 and the query asserts the partner it found. Start the slice at LENGTH itself and you keep a single 'H' — a tail nothing matches; aim at 'AB' and Nordic's 's AB' still misses.",
  },
  {
    id: "cs-1217",
    tier: "medium",
    topic: "w1",
    universe: "month-close",
    title: "The 2025 invoice cohort",
    brief:
      "Close review: invoice numbers embed the year at column 5, but the summary sheet grouped on the wrong offset last quarter and merged both years. Slice the year properly, then pin the 2025 bucket's count and cent total for the close binder.",
    ask: "How many invoices were issued in 2025, and what is their total in cents?",
    template:
      "SELECT SUBSTR(number, {1}, 4) AS yr, {2} AS n, SUM(amount_cents) AS cents\nFROM invoices\nGROUP BY yr\nHAVING yr = {3};",
    slots: [
      { answer: "5", kind: "number", label: "the year's start column",
        why: "INV-2024-001 puts the year at characters 5–8 — probed, start 5 yields '2024'/'2025'. Start 6 yields '024-', the off-by-one that merged last quarter's buckets." },
      { answer: "COUNT(*)", kind: "keyword", label: "the bucket counter",
        why: "COUNT(*) sizes the bucket — probed 5 invoices carry the 2025 stamp. SUM as a bare chip is no column; MAX would count with text." },
      { answer: "'2025'", kind: "keyword", label: "the year bucket",
        why: "'2025' is the close binder's bucket — probed 5 invoices totalling 1919700 cents. '2024' is the other bucket: 23 invoices, 6778000 cents." },
    ],
    distractors: ["6", "SUM", "'2024'", "MAX"],
    walkthrough:
      "The number format INV-YYYY-NNN makes the year a substring: SUBSTR(number, 5, 4) starts at the fifth character and reads four — probed '2024' for 23 invoices and '2025' for 5. The binder pins the 2025 bucket: COUNT(*) 5, SUM(amount_cents) 1919700. Last quarter's bug was the offset — start at 6 and every bucket reads '024-' or '025-', which sorts oddly and matches no literal year. HAVING yr = '2025' keeps the query honest: it returns exactly the bucket it claims.",
  },
  {
    id: "cs-1218",
    tier: "medium",
    topic: "w1",
    universe: "fraud",
    title: "The space counter's check",
    brief:
      "Risk engineering: the name-normalizer counts spaces with a remove-and-measure trick, and QA wants it verified on the nastiest roster entry — the one with an apostrophe. For Liam O'Brien, count the spaces by measuring the name before and after removal.",
    ask: "How many spaces does Liam O'Brien's name contain, by the remove-and-measure trick?",
    template:
      "SELECT name, LENGTH(name) - LENGTH({1}(name, {2}, '')) AS spaces\nFROM customers\nWHERE name = {3};",
    slots: [
      { answer: "REPLACE", kind: "keyword", label: "the remover",
        why: "REPLACE(name, ' ', '') deletes every space; the length drop counts them. UPPER or TRIM in this slot are wrong-argument errors — neither takes three arguments." },
      { answer: "' '", kind: "keyword", label: "the removed character",
        why: "The space is the counted unit — probed, removing it shortens Liam O'Brien from 12 to 11. Remove '.' instead and nothing changes: the name has no dots, so spaces reads 0." },
      { answer: "'Liam O''Brien'", kind: "keyword", label: "the QA target",
        why: "Liam O'Brien is QA's nastiest row: 12 characters with the apostrophe stored raw (the doubled '' is literal-escaping only). Probed: spaces = 1." },
    ],
    distractors: ["TRIM", "UPPER", "'.'", "'Alice Chen'"],
    walkthrough:
      "The remove-and-measure trick: DELETE the character, then let arithmetic count it. REPLACE(name, ' ', '') strips every space; LENGTH before minus LENGTH after is the space census. Probed on QA's target: Liam O'Brien measures 12 with the apostrophe in place (lesson receipt), 11 without the space — spaces = 1, and every one of the 16 names carries exactly one. Swap the needle to '.' and the name survives untouched, so the counter reads 0 — a verifier that passed by measuring nothing. The doubled '' in the target literal is SQL escaping, not stored characters.",
  },
  {
    id: "cs-1219",
    tier: "medium",
    topic: "w1",
    universe: "expense",
    title: "The travel spend plate",
    brief:
      "Finance ops: the expense board prints each category's total on a money plate — cents divided out, two decimals, no exceptions. For the Travel line, count its rows and print the total on a proper plate for the board pack.",
    ask: "How many Travel expense rows are there, and what does their total look like on a two-decimal plate?",
    template:
      "SELECT category, COUNT(*) AS n, {1}({2}, SUM(amount_cents) / 100.0) AS spend\nFROM expenses\nGROUP BY category\nHAVING category = {3};",
    slots: [
      { answer: "PRINTF", kind: "keyword", label: "the plate printer",
        why: "PRINTF('%.2f', 2521.0) prints the probed plate '2521.00'. ROUND('%.2f', ...) coerces the format to 0 and plates the Travel line at zero." },
      { answer: "'%.2f'", kind: "keyword", label: "the money pattern",
        why: "Two decimals is the board's money style — probed '2521.00' from 252100 cents. '%.0f' or '%d' would print '2521' and the cents convention dies quietly." },
      { answer: "'Travel'", kind: "keyword", label: "the line item",
        why: "Travel is 3 of the 36 expense rows — probed plate 2521.00, driven by the 168000-cent conference trip. 'Tools' plates 1525.00 over 5 rows instead." },
    ],
    distractors: ["'%.0f'", "'%d'", "ROUND", "'Tools'"],
    walkthrough:
      "Cents to plates in three moves: fold the category rows, divide the cent total by 100.0, and let PRINTF('%.2f', …) print two decimals. Probed Travel line: 3 rows — including August's 168000-cent blowout — plating at 2521.00. The pattern is the convention: %.0f and %d both collapse the plate to '2521', and nobody downstream can tell whether cents were ever counted. 'Tools' is a real line with a real plate (1525.00 over 5 rows) — which is exactly why the HAVING has to name the line it means.",
  },
  {
    id: "cs-1220",
    tier: "medium",
    topic: "w1",
    universe: "growth",
    title: "The champion contact line",
    brief:
      "Board deck: the retention slide quotes the champion customer as one contact line — name, em-dash, email — next to their order count. The line builder lost its separator and its counter. Rebuild it for the customer with 24 orders.",
    ask: "Build the champion's contact line (name — email) with their order count.",
    template:
      "SELECT c.name || {1} || c.email AS contact, {2} AS n\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING n = {3};",
    slots: [
      { answer: "' — '", kind: "keyword", label: "the line separator",
        why: "The deck's contact lines glue with an em-dash — probed 'Alice Chen — alice.chen@example.com'. ' @ ' builds a line the template styleguide rejects." },
      { answer: "COUNT(*)", kind: "keyword", label: "the order counter",
        why: "COUNT(*) sizes each customer's order fold — probed 24 for the champion. MAX as a bare chip is no column; a literal 17 would lie on every row." },
      { answer: "24", kind: "number", label: "the champion's count",
        why: "24 orders is the probed maximum — Alice Chen, well clear of Emma's 17. Pin 17 and the slide features the runner-up instead." },
    ],
    distractors: ["' @ '", "MAX", "17"],
    walkthrough:
      "One scan, two products: the join fans 103 orders out to customers, GROUP BY c.id folds them back, and || glues the contact line the deck prints. HAVING n = 24 pins the probed champion — Alice Chen, 24 orders against Emma Wilson's 17 — and yields 'Alice Chen — alice.chen@example.com'. The separator is styleguide, not syntax: ' @ ' runs fine and prints a line every slide template misses. MAX as the counter is a bare-column error, and a hard-coded 17 is a lie the HAVING would happily print.",
  },
  {
    id: "cs-1221",
    tier: "medium",
    topic: "w1",
    universe: "inventory",
    title: "SKU builder, id 7",
    brief:
      "Warehouse catalog: bin tags carry a derived SKU — first three letters of the name, uppercased, dash, zero-padded id — and the printer rejects anything off-pattern. Build the SKU for product id 7 exactly as the tag spec defines it.",
    ask: "Build the spec SKU (3-letter uppercase head, dash, 2-digit padded id) for product 7.",
    template:
      "SELECT id, {1}({2}(name, 1, 3)) || '-' || PRINTF({3}, id) AS sku\nFROM products\nWHERE id = {4};",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the head shouter",
        why: "The spec shouts the head: probed '4K ' uppercased stays '4K '. LOWER would ship '4k -07' and the printer rejects the case." },
      { answer: "SUBSTR", kind: "keyword", label: "the head slicer",
        why: "SUBSTR(name, 1, 3) cuts the 3-character head — probed '4K ' for 4K Webcam Pro, space included. TRIM(name, 1, 3) is the two-argument trimmer wearing a slicer's clothes." },
      { answer: "'%02d'", kind: "keyword", label: "the zero-pad pattern",
        why: "%02d pads to two digits — probed PRINTF('%02d', 7) = '07', so the tag reads '4K -07'. '%d' prints bare '7' and breaks the sort." },
      { answer: "7", kind: "number", label: "the bin's product id",
        why: "Product 7 is the bin in question — probed SKU '4K -07', quirk included: the head keeps its trailing space because '4K ' is three characters." },
    ],
    distractors: ["LOWER", "TRIM", "'%d'", "3"],
    walkthrough:
      "Derived keys are pipelines: slice the head with SUBSTR(name, 1, 3), shout it with UPPER, glue the dash, pad the id with PRINTF('%02d', id). Probed on bin 7 — 4K Webcam Pro — the head is '4K ', space and all, so the tag prints '4K -07' and that stray space is the spec working, not a bug. The pad matters for ordering: %d prints '4K -7', which sorts after '4K -15' instead of before it. Slice by TRIM and the space vanishes into a different, off-spec tag; aim the WHERE at id 3 and the printer prints USB-03's bin.",
  },
  {
    id: "cs-1222",
    tier: "medium",
    topic: "w1",
    universe: "refund-audit",
    title: "Zero-padded refund refs",
    brief:
      "Refunds desk: every cancelled order gets a reference ticket — ORD- plus the id zero-padded to three digits — so the audit trail sorts chronologically as text. Generate the refs for the whole cancelled queue in order.",
    ask: "List ORD- references (3-digit padded ids) for every cancelled order, sorted.",
    template:
      "SELECT 'ORD-' || {1}({2}, o.id) AS ref, c.name, o.total\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status = {3}\nORDER BY ref;",
    slots: [
      { answer: "PRINTF", kind: "keyword", label: "the ref formatter",
        why: "PRINTF builds padded text — probed PRINTF('%03d', 7) = '007', so the first ref reads ORD-007. UPPER('%03d', o.id) is a wrong-argument error." },
      { answer: "'%03d'", kind: "keyword", label: "the three-digit pad",
        why: "%03d is the trail's pad: probed refs ORD-007 through ORD-095 sort as text because every id is three wide. '%02d' collapses 7 to '07' and breaks the sort." },
      { answer: "'cancelled'", kind: "keyword", label: "the queue filter",
        why: "The refund trail covers the cancelled queue — probed 7 orders, ids 7/21/50/51/82/83/95. 'pending' would ticket the 14 open orders instead." },
    ],
    distractors: ["'%02d'", "'%d'", "UPPER", "'pending'"],
    walkthrough:
      "Sorting-as-text is why the pad exists: ORD-7 sorts after ORD-95, but ORD-007 sorts before ORD-021 — zero-padding makes string order match numeric order. The probed queue is seven cancelled orders, ids 7, 21, 50, 51, 82, 83 and 95, printing as ORD-007 through ORD-095. Under-pad to %02d and the first ref becomes ORD-07: it still reads fine, but text order silently diverges from chronology — the audit trail's whole point. 'pending' would mint fourteen tickets for orders nobody refunded.",
  },
  {
    id: "cs-1223",
    tier: "medium",
    topic: "w1",
    universe: "catalog",
    title: "The 17-character shelf",
    brief:
      "Catalog QA: the label vendor bills per name-length band, and one band's population needs verifying before the invoice is paid. Fold products by name length, find the band holding exactly three products, and report its width and size.",
    ask: "Which name-length band holds exactly 3 products, and what is its width?",
    template:
      "SELECT {1}(name) AS ln, {2} AS n\nFROM products\nGROUP BY ln\nHAVING n = {3}\nORDER BY ln;",
    slots: [
      { answer: "LENGTH", kind: "keyword", label: "the band measurer",
        why: "LENGTH(name) builds the bands — probed distribution 13:2, 14:1, 15:1, 16:2, 17:3, 18:2, 20:1, 21:1, 22:2, 23:1. UPPER would band uppercase strings instead." },
      { answer: "COUNT(*)", kind: "keyword", label: "the band counter",
        why: "COUNT(*) sizes each band — probed, exactly one band holds 3. SUM as a bare chip is no column, and MAX would count bands with text." },
      { answer: "3", kind: "number", label: "the billed band size",
        why: "The vendor's line item is a 3-product band — probed width 17: Desk Mat Extended, HDMI 2.1 Cable 2m, Wireless Mouse M3. Bands of 2 exist at 13, 16, 18 and 22." },
    ],
    distractors: ["UPPER", "SUM", "2", "MAX"],
    walkthrough:
      "Band and count: LENGTH(name) folds 16 products into ten probed bands, and HAVING n = 3 isolates the only one holding three — width 17, populated by Desk Mat Extended, HDMI 2.1 Cable 2m and Wireless Mouse M3. That's the line the label vendor billed. Ask for 2 and the query returns four different bands (widths 13, 16, 18, 22) — real rows, wrong invoice. UPPER in the measurer folds uppercase copies of the names into singleton bands, so the 3-band vanishes and the verification returns nothing at all.",
  },
  {
    id: "cs-1224",
    tier: "medium",
    topic: "w1",
    universe: "funnel",
    title: "The 2023 intake tag",
    brief:
      "Marketing ops: cohort tags are built by gluing the signup year to '-intake', and the lifecycle tool matches on the finished string. Count the founding 2023 cohort under its finished tag so the tool's roster lines up.",
    ask: "How many customers carry the '2023-intake' cohort tag?",
    template:
      "SELECT {1}(created_at, 1, 4) || '-intake' AS cohort, {2} AS n\nFROM customers\nGROUP BY cohort\nHAVING cohort = {3};",
    slots: [
      { answer: "SUBSTR", kind: "keyword", label: "the year slicer",
        why: "SUBSTR(created_at, 1, 4) lifts the year — probed '2023' for the founding four. SUM(created_at, 1, 4) is a wrong-argument error." },
      { answer: "COUNT(*)", kind: "keyword", label: "the cohort counter",
        why: "COUNT(*) sizes the fold — probed 4 in the 2023 tag. MAX as a bare chip is no column at all." },
      { answer: "'2023-intake'", kind: "keyword", label: "the finished tag",
        why: "The tool matches the glued string — probed '2023-intake' carrying 4 founders (Alice, Bruno, Chloe, Dmitri). '2024-intake' carries 12 and is a different roster." },
    ],
    distractors: ["UPPER", "SUM", "'2024-intake'", "MAX"],
    walkthrough:
      "Tags are built, not stored: slice the year with SUBSTR(created_at, 1, 4), glue '-intake' with ||, and the finished string is a groupable key. Probed: the 2023 tag gathers the four founders — Alice Chen, Bruno Silva, Chloe Dubois, Dmitri Volkov — while 2024's tag carries the other twelve. HAVING matches the tool's exact string, glue included. UPPER in the slicer is a wrong-argument error, and aiming the HAVING at '2024-intake' hands the lifecycle tool the wrong cohort's roster — bigger, newer, wrong.",
  },
  {
    id: "cs-1225",
    tier: "medium",
    topic: "w1",
    universe: "pricing",
    title: "Top-three price tags",
    brief:
      "Pricing review: the premium shelf header lists the three most expensive products as glued price tags — name, em-dash, dollar sign, two decimals. Build the header's three tags, priciest first.",
    ask: "Print glued price tags (name — $X.XX) for the three most expensive products.",
    template:
      "SELECT name || ' — $' || {1}({2}, price) AS tag\nFROM products\nORDER BY price DESC\nLIMIT {3};",
    slots: [
      { answer: "PRINTF", kind: "keyword", label: "the tag formatter",
        why: "PRINTF builds the money half of the tag — probed 'Smart Watch S — $199.99' at the top. UPPER('%.2f', price) is a wrong-argument error." },
      { answer: "'%.2f'", kind: "keyword", label: "the two-decimal pattern",
        why: "Two decimals is tag law: probed $199.99, $149.99, $129.00. '%.0f' prints $200 — a cent the shelf never charged — and '%.1f' prints $200.0." },
      { answer: "3", kind: "number", noVerify: true, label: "the header depth",
        why: "The header carries three tags — probed Smart Watch S 199.99, Noise-Canceling Headset 149.99, 4K Webcam Pro 129.00. A depth of 5 drags two more tags onto the shelf." },
    ],
    distractors: ["'%.0f'", "'%.1f'", "UPPER", "5"],
    walkthrough:
      "Display tags are glue plus format: || assembles name, separator and dollar sign, PRINTF('%.2f', price) prints the money, and ORDER BY price DESC + LIMIT 3 keeps the premium three. Probed tags: 'Smart Watch S — $199.99', 'Noise-Canceling Headset — $149.99', '4K Webcam Pro — $129.00'. The pattern is where tags go wrong in print: %.0f rounds the flagship to $200, %.1f leaves a stray zero — both off-convention for a shelf that quotes cents. Widen the limit and the header stops being a premium three.",
  },
  {
    id: "cs-1226",
    tier: "medium",
    topic: "w1",
    universe: "fraud",
    title: "The @ census, verified",
    brief:
      "Fraud engineering: a vendor's scraping tool claims every customer has exactly one @, verified by counting them per address. Spot-check its method on Alice Chen: find the @ position, then run the flawed length-minus-replace counter it ships with.",
    ask: "For Alice Chen: the @ position, and what the tool's LENGTH-minus-REPLACE counter reports.",
    template:
      "SELECT name, {1}(email, '@') AS at_pos, LENGTH(email) - {2}(email, '@', '') AS broken\nFROM customers\nWHERE name = {3};",
    slots: [
      { answer: "INSTR", kind: "keyword", label: "the position finder",
        why: "INSTR(email, '@') is 1-based — probed 11 for Alice. TRIM(email, '@') would shave @ off the ends (there are none) and report the whole address as a position." },
      { answer: "REPLACE", kind: "keyword", label: "the flawed counter's core",
        why: "The tool subtracts REMOVE(email) — but that's text, so the engine coerces it to 0 and the counter reports a constant 22. Probed: broken = 22 for Alice like every customer." },
      { answer: "'Alice Chen'", kind: "keyword", label: "the spot-check row",
        why: "Alice is the spot-check target — probed at_pos 11, broken 22. 'Grace Kim' returns position 10 with a 21-character address: a different audit trail." },
    ],
    distractors: ["TRIM", "UPPER", "'Grace Kim'"],
    walkthrough:
      "The vendor's counter is a classic coercion trap: LENGTH(email) - REPLACE(email, '@', '') means number minus text, and SQLite coerces the stripped address to 0 — so the counter prints the full length, 22, for every customer and 'verifies' nothing. The honest companion is INSTR: probed position 11 for Alice, the @ after her 10-character handle. That's the spot-check's story — the tool's 22 is a coincidence of coercion, the position 11 is evidence. TRIM would shave the ends (nothing to shave) and hand back the whole address as a 'position'.",
  },
  {
    id: "cs-1227",
    tier: "medium",
    topic: "w1",
    universe: "supplier",
    title: "The 17-character partners",
    brief:
      "Procurement: the printed roster shouts partner names and stamps each with its measured width, and the compliance copy only carries the 17-character tier. Shout the 17-character partners with their stocked item counts.",
    ask: "List 17-character supplier names uppercased, with how many products each stocks.",
    template:
      "SELECT {1}(s.name) AS partner, {2}(s.name) AS ln, COUNT(p.id) AS items\nFROM suppliers s JOIN products p ON p.supplier_id = s.id\nGROUP BY s.id\nHAVING ln = {3}\nORDER BY partner;",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the roster shouter",
        why: "The printed roster shouts — probed ALPINE AUDIO GMBH, ANDES NATURALS SA, NORDIC GADGETS AB. LOWER would ship a lowercase compliance copy." },
      { answer: "LENGTH", kind: "keyword", label: "the width stamper",
        why: "LENGTH(s.name) stamps the width — probed 17 for all three tier members. SUM(s.name) coerces text to 0 and every partner stamps 0." },
      { answer: "17", kind: "number", label: "the compliance tier",
        why: "17 is the tier on the compliance copy — probed members stock 2, 2 and 3 items (Andes 2, Alpine 2, Nordic 3). Tier 16 holds Shenzhen Electro and Pacific Textiles instead." },
    ],
    distractors: ["LOWER", "SUM", "16", "MAX"],
    walkthrough:
      "The roster is a fold with a stamp: GROUP BY s.id keeps suppliers whole while COUNT(p.id) counts stocked items, LENGTH(s.name) stamps the width, and UPPER prints the compliance copy's shouting style. Probed tier: exactly three partners measure 17 — Andes Naturals SA (2 items), Alpine Audio GmbH (2), Nordic Gadgets AB (3). Slide the HAVING to 16 and the copy lists Shenzhen Electro and Pacific Textiles — real partners, wrong tier. SUM as the stamper coerces every name to 0: a width column that measures nothing.",
  },
  {
    id: "cs-1228",
    tier: "medium",
    topic: "w1",
    universe: "month-close",
    title: "The cash account plate",
    brief:
      "Month-end close: the binder's cash page quotes the account in caps, its entry count, and the net debit-minus-credit on a money plate. Assemble the cash page from the ledger before sign-off.",
    ask: "Show the cash account uppercased, its entry count, and its net on a two-decimal plate.",
    template:
      "SELECT {1}(account) AS acct, {2} AS entries, {3}({4}, (SUM(debit_cents) - SUM(credit_cents)) / 100.0) AS net\nFROM ledger_entries\nWHERE account = {5}\nGROUP BY account;",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the account shouter",
        why: "The binder prints accounts in caps — probed CASH. LOWER would file the page under 'cash' and the binder's alphabetization breaks." },
      { answer: "COUNT(*)", kind: "keyword", label: "the entry counter",
        why: "COUNT(*) is the entry tally — probed 27 cash entries, the ledger's largest account. MAX as a bare chip is no column." },
      { answer: "PRINTF", kind: "keyword", label: "the net printer",
        why: "PRINTF plates the net — probed '44196.00' from debits 6961200 minus credits 2541600 cents. LOWER(number) would stringify the net lowercase and unformatted." },
      { answer: "'%.2f'", kind: "keyword", label: "the money pattern",
        why: "Two decimals is binder law — probed '44196.00'. '%.0f' prints '44196' and the cents convention vanishes from the close binder." },
      { answer: "'cash'", kind: "keyword", label: "the account filter",
        why: "The stored spelling is lowercase 'cash' — probed 27 entries. 'accounts_receivable' nets 16440.00 over 26 entries: a real page, not this one." },
    ],
    distractors: ["LOWER", "'%.0f'", "'accounts_receivable'", "MAX"],
    walkthrough:
      "One account, three stamps: filter to the stored lowercase 'cash', shout it with UPPER for the binder, count its rows with COUNT(*), and plate the net — SUM(debit_cents) minus SUM(credit_cents), divided out, printed by PRINTF('%.2f', …). Probed: CASH, 27 entries, net 44196.00 — the ledger's busiest account, and the net that reconciles the close. The pattern is the trap worth teaching: %.0f silently drops the '.00' and the binder stops agreeing with the statements it summarizes. LOWER files the page in the wrong alphabet; the AR filter prints a true page for the wrong account.",
  },

  // ================= hard (cs-1229…cs-1240) =================
  {
    id: "cs-1229",
    tier: "hard",
    topic: "w1",
    universe: "refund-audit",
    title: "The void invoice, dissected",
    brief:
      "Refund audit: the voided invoice needs a full dissection for the exception log — its sequence suffix sliced off the end, its amount plated in dollars, its number width stamped as proof the format held. One row, four columns, no rounding.",
    ask: "Dissect the void invoice: sequence suffix, dollar amount plate, and number width.",
    template:
      "SELECT number, {1}(number, 10) AS seq, {2}({3}, amount_cents / 100.0) AS amt, LENGTH(number) AS ln\nFROM invoices\nWHERE status = {4} AND LENGTH(number) = {5};",
    slots: [
      { answer: "SUBSTR", kind: "keyword", label: "the suffix slicer",
        why: "SUBSTR(number, 10) runs from character 10 to the end — probed '011' for INV-2024-011. ROUND(number, 10) coerces the text id to 0 and logs a zero suffix." },
      { answer: "PRINTF", kind: "keyword", label: "the amount printer",
        why: "PRINTF plates the cents as dollars — probed '925.00'. Feeding it ROUND as the printer coerces the pattern to 0 and plates the exception at zero." },
      { answer: "'%.2f'", kind: "keyword", label: "the money pattern",
        why: "Two decimals is the log's money style — probed '925.00'. '%.0f' logs '925' and the cents audit loses its last two digits." },
      { answer: "'void'", kind: "keyword", label: "the exception status",
        why: "Exactly 1 of 28 invoices is void — probed INV-2024-011. The 6 open invoices would flood the exception log with healthy rows." },
      { answer: "12", kind: "number", label: "the format-width stamp",
        why: "All 28 invoice numbers measure 12 characters (probed census INV-2024-001 … INV-2025-028), so the stamp proves the void row's format held. An 11 would match nothing." },
    ],
    distractors: ["ROUND", "'%.0f'", "'open'", "11"],
    walkthrough:
      "A dissection is four small tools on one row: SUBSTR(number, 10) peels the sequence '011' — start 10 because INV-2024- spans nine characters — PRINTF('%.2f', amount_cents / 100.0) plates 92500 cents as '925.00', LENGTH(number) stamps the width the format promises, and the double filter (status void, width 12) proves the row qualifies on both axes. Probed: INV-2024-011, seq 011, amt 925.00, ln 12 — the exception log's complete line. ROUND as the slicer is the classic misuse: it accepts the text id, coerces it to zero, and logs a suffix of 0.",
  },
  {
    id: "cs-1230",
    tier: "hard",
    topic: "w1",
    universe: "refund-audit",
    title: "Refund pools per customer",
    brief:
      "Refund audit deep-dive: the desk wants per-customer refund pools — count, total, biggest single refund — but only for customers sitting at exactly two cancellations, with the biggest refund plated. Fold the cancelled orders and pin the two-refund crowd.",
    ask: "For customers with exactly 2 cancelled orders: count, total pool, and plated biggest refund.",
    template:
      "SELECT c.name, {1} AS n, {2}(o.total) AS pool, PRINTF('%.2f', {3}(o.total)) AS biggest\nFROM orders o JOIN customers c ON c.id = o.customer_id\nWHERE o.status = {4}\nGROUP BY c.id\nHAVING n = {5}\nORDER BY pool DESC;",
    slots: [
      { answer: "COUNT(*)", kind: "keyword", label: "the refund counter",
        why: "COUNT(*) sizes each customer's cancelled fold — probed n = 2 for the target crowd. AVG as a bare chip is no column at all." },
      { answer: "SUM", kind: "keyword", label: "the pool builder",
        why: "SUM(o.total) adds the pool — probed 115.82 for Maya Patel (90.35 + 25.47). MIN would report the smallest refund as the pool." },
      { answer: "MAX", kind: "keyword", label: "the biggest refund",
        why: "MAX(o.total) lifts the largest single refund — probed 90.35, plated '90.35'. MIN would plate 25.47 and the exception review chases the wrong ticket." },
      { answer: "'cancelled'", kind: "keyword", label: "the refund queue",
        why: "The pool is built from cancelled orders — probed 7 store-wide, 2 for Maya. 'pending' is a different fold: Chloe and Maya each hold 2 pending orders with different pools." },
      { answer: "2", kind: "number", label: "the pool size pin",
        why: "HAVING n = 2 pins the two-refund crowd — probed, that's Maya Patel alone among cancelled orders. Pin 1 and Emma Wilson (143.86) and Keiko Sato (397.99) flood in." },
    ],
    distractors: ["AVG", "MIN", "'pending'", "1"],
    walkthrough:
      "Three aggregates, one fold: the join fans orders to customers, GROUP BY c.id folds them back, and COUNT/SUM/MAX read the cancelled crowd three ways — count, pool, biggest. HAVING n = 2 pins the probed target: Maya Patel, two cancellations totalling 115.82, biggest 90.35, plated '90.35'. The 'pending' twin shows why the filter matters — under pending, the two-refund crowd is Chloe Dubois (pool 1309.92, biggest 945.21) and Maya again — same customer, different money. MIN is the audit's quiet hazard: it plates the smallest refund and sends the review after a 25.47 ticket.",
  },
  {
    id: "cs-1231",
    tier: "hard",
    topic: "w1",
    universe: "catalog",
    title: "The 11-letter category club",
    brief:
      "Catalog QA: the label vendor's matrix bills by category name width AND product count, and one cell keeps mismatching. Fold products by uppercased category, stamp each category's width, and pin the cell where width 11 meets count 3.",
    ask: "Which uppercased categories measure 11 characters AND hold exactly 3 products?",
    template:
      "SELECT {1}(category) AS cat, {2}(category) AS cl, {3} AS n\nFROM products\nGROUP BY cat\nHAVING cl = {4} AND n = {5};",
    slots: [
      { answer: "UPPER", kind: "keyword", label: "the category shouter",
        why: "The vendor matrix lists categories uppercased — probed ACCESSORIES and ELECTRONICS. LOWER would match the same cells but print a matrix the vendor's copy doesn't match." },
      { answer: "LENGTH", kind: "keyword", label: "the width stamper",
        why: "LENGTH(category) stamps each width — probed 11 for both club members. SUM(category) coerces text to 0 and every cell stamps 0." },
      { answer: "COUNT(*)", kind: "keyword", label: "the cell counter",
        why: "COUNT(*) sizes each category fold — probed 3 for both 11-letter categories. SUM as a bare chip is no column." },
      { answer: "11", kind: "number", label: "the width axis",
        why: "11 is the matrix row — probed categories ACCESSORIES (3) and ELECTRONICS (3). Width 9 holds only WEARABLES, and it counts 2." },
      { answer: "3", kind: "number", label: "the count axis",
        why: "3 is the matrix column — probed both 11-letter categories hold exactly 3 products. Ask for 2 and the cell is empty: no 11-letter category counts 2." },
    ],
    distractors: ["LOWER", "SUM", "9", "2"],
    walkthrough:
      "Two axes, one cell: UPPER(category) builds the matrix's label, LENGTH(category) stamps the width axis, COUNT(*) sizes the count axis, and the double HAVING pins the cell. Probed: the 11-letter club has exactly two members — ACCESSORIES and ELECTRONICS, each holding 3 products. The near-misses are the lesson: width 9 meets count 2 (WEARABLES), width 11 never meets count 2, and LOWER prints a true answer in a typeface the vendor's matrix doesn't use. Two independent HAVING pins are how a billing cell gets verified instead of eyeballed.",
  },
  {
    id: "cs-1232",
    tier: "hard",
    topic: "w1",
    universe: "expense",
    title: "The S-initial vendor line",
    brief:
      "Spend report: the vendor index is keyed by slug and initial letter, and one line keeps failing validation. Rebuild the S-initial line — slug, initial, row count, plated spend — exactly as the index defines it.",
    ask: "For vendors starting with S holding exactly 3 rows: slug, initial, count, plated spend.",
    template:
      "SELECT REPLACE(vendor, ' ', '-') AS slug, SUBSTR(vendor, 1, 1) AS ch, COUNT(*) AS n, {1}({2}, SUM(amount_cents) / 100.0) AS spend\nFROM expenses\nGROUP BY vendor\nHAVING ch = {3} AND n = {4};",
    slots: [
      { answer: "PRINTF", kind: "keyword", label: "the spend printer",
        why: "PRINTF plates the dollars — probed '2521.00' for the S line. ROUND('%.2f', ...) coerces the pattern to 0 and plates the vendor at zero." },
      { answer: "'%.2f'", kind: "keyword", label: "the money pattern",
        why: "Two decimals is index law — probed '2521.00' from 252100 cents. '%.0f' prints '2521' and the cents column stops reconciling." },
      { answer: "'S'", kind: "keyword", label: "the initial key",
        why: "SUBSTR(vendor, 1, 1) yields 'S' for Skyline Travel — the probed S-initial vendor. 'A' matches two vendors (AdWorks, Atlas), but each counts 14 rows, not 3." },
      { answer: "3", kind: "number", label: "the row-count pin",
        why: "Skyline Travel books 3 trips — probed n = 3, spend 2521.00 including the 168000-cent August blowout. Pin 5 and the S line is empty; 5 belongs to DevTools." },
    ],
    distractors: ["'%.0f'", "ROUND", "'A'", "5"],
    walkthrough:
      "The index line is a four-piece assembly: REPLACE builds the slug 'Skyline-Travel', SUBSTR(vendor, 1, 1) extracts the initial 'S', COUNT(*) tallies the fold, and PRINTF('%.2f', SUM(amount_cents) / 100.0) plates the spend — probed 3 rows, 2521.00. The double HAVING is the validation: initial S AND count 3 uniquely identify the line. Aim at 'A' and the pin fails — AdWorks Media and Atlas Property GmbH are S-free and book 14 rows each. Pin 5 and you've described DevTools Inc, whose initial is D. That's the point of keying on two derived columns at once.",
  },
  {
    id: "cs-1233",
    tier: "hard",
    topic: "w1",
    universe: "fraud",
    title: "The @ twins, side by side",
    brief:
      "Fraud engineering: two @ counters ship side by side — the position finder and the length-difference census — and the vendored scraper only runs one of them. For the row matching ALICE CHEN when shouted, run both counters so the comparison lands in the log.",
    ask: "For Alice Chen (case-insensitive match): @ position, the vendor's broken counter, and the honest twin.",
    template:
      "SELECT name, {1}(email, '@') AS at_pos, LENGTH(email) - REPLACE(email, '@', '') AS broken, LENGTH(email) - LENGTH(REPLACE(email, '@', '')) AS fixed\nFROM customers\nWHERE {2}(name) = {3};",
    slots: [
      { answer: "INSTR", kind: "keyword", label: "the position finder",
        why: "INSTR(email, '@') is 1-based — probed 11 for Alice. TRIM(email, '@') shaves the ends (no @ there) and reports the whole address as a 'position'." },
      { answer: "UPPER", kind: "keyword", label: "the case folder",
        why: "The log matches shouted: UPPER(name) = 'ALICE CHEN' — probed hits Alice only. LOWER(name) against that literal compares 'alice chen' to 'ALICE CHEN' and matches nobody." },
      { answer: "'ALICE CHEN'", kind: "keyword", label: "the shouted target",
        why: "The shouted literal is the log's key — probed 'ALICE CHEN'. Lowercase 'alice.chen' is an email handle, not a name, and matches zero rows." },
    ],
    distractors: ["SUBSTR", "TRIM", "LOWER", "'alice.chen'"],
    walkthrough:
      "Two counters, one truth: INSTR(email, '@') finds the landmark — probed position 11 for Alice — while the honest twin, LENGTH(email) - LENGTH(REPLACE(email, '@', '')), measures what the removal deleted: 22 − 21 = 1. The vendor's counter skips the inner LENGTH, so it subtracts text from a number, the address coerces to 0, and it reports 22 for every customer — 'verified' by accident. The case-folded WHERE (UPPER(name) = 'ALICE CHEN') is how logs match across case drift. Both twins in one row is what turns a scraper's claim into an audited fact.",
  },
  {
    id: "cs-1234",
    tier: "hard",
    topic: "w1",
    universe: "growth",
    title: "The handle drift census",
    brief:
      "Growth data ops: CRM handles were minted as first.last, but five addresses drifted. Build the census that compares each real handle — sliced before the @ — against the minted guess (name lowercased, spaces dotted), and list the drifted rows in handle order.",
    ask: "List customers whose @-handle differs from the lowercased dotted name, sorted by handle.",
    template:
      "SELECT name, SUBSTR(email, 1, {1}(email, '@') - 1) AS handle, {2}(REPLACE(name, {3}, '.')) AS guess\nFROM customers\nWHERE handle <> guess\nORDER BY handle;",
    slots: [
      { answer: "INSTR", kind: "keyword", label: "the @ locator",
        why: "SUBSTR(email, 1, INSTR(email, '@') - 1) slices to just before the @ — probed handles like bella.rossi. SUBSTR nested on itself coerces the inner '@' to 0 and empties every handle." },
      { answer: "LOWER", kind: "keyword", label: "the mint case-folder",
        why: "Handles are minted lowercase — probed guesses like isabella.rossi. UPPER would uppercase every guess and flag all 16 customers as drifted." },
      { answer: "' '", kind: "keyword", label: "the dotted character",
        why: "The mint swaps spaces for dots — probed ' ' → '.' builds isabella.rossi from Isabella Rossi. Swap '-' instead and spaces survive, so every guess keeps a space and misses." },
    ],
    distractors: ["UPPER", "SUBSTR", "'-'"],
    walkthrough:
      "Drift detection is comparison by construction: build the handle (SUBSTR up to INSTR(email, '@') - 1), build the minted guess (LOWER(REPLACE(name, ' ', '.'))), and let WHERE handle <> guess flag the gap. Probed census: exactly five drifted rows — Isabella Rossi (bella.rossi), Dmitri Volkov (d.volkov), Farid Nasser (farid.n), Liam O'Brien (liam.o'brien vs liam.obrien) and Pedro Alvarez (pedro.alv) — four shortened, one punctuated. Break either builder and the census lies: UPPER flags all sixteen, the nested-SUBSTR empties every handle into the mismatch pile, and an undotted name keeps its space so the guess can never equal the handle.",
  },
  {
    id: "cs-1235",
    tier: "hard",
    topic: "w1",
    universe: "inventory",
    title: "The thin-shelf tag wall",
    brief:
      "Warehouse ops: the replenishment wall prints one tag per thin-shelf product — name, ' x', stock — with the name width stamped beside it for the label vendor, thickest stock first. Build the wall for everything at or under 100 units.",
    ask: "Build ' x' stock tags for products with stock ≤ 100, thickest first, with name widths.",
    template:
      "SELECT name || {1} || stock AS tag, {2}(name) AS ln\nFROM products\nWHERE stock {3} 100\nORDER BY {4} DESC, tag;",
    slots: [
      { answer: "' x'", kind: "keyword", label: "the tag glue",
        why: "The wall's spec glues with ' x' — probed 'Fitness Band X2 x95'. An em-dash builds 'Fitness Band X2 — 95' and the wall's parser rejects every tag." },
      { answer: "LENGTH", kind: "keyword", label: "the width stamper",
        why: "LENGTH(name) stamps the vendor's width — probed 23 for Noise-Canceling Headset, 13 for the two shortest. SUM(name) coerces text to 0 and every stamp reads zero." },
      { answer: "<=", kind: "keyword", label: "the thin-shelf test",
        why: "≤ 100 is the thin-shelf rule — probed 6 products, stock 40 through 95. '=' would match only a product at exactly 100, and none exists." },
      { answer: "stock", kind: "keyword", label: "the wall's sort key",
        why: "The wall hangs thickest-first: ORDER BY stock DESC — probed 95, 85, 70, 60, 45, 40. Sorting by name would hang USB-C Hub first and scramble the replenishment order." },
    ],
    distractors: ["' — '", "SUM", "=", "name"],
    walkthrough:
      "A tag wall is glue, test and order: || with ' x' builds each tag, stock <= 100 draws the thin shelf — probed six products from Smart Watch S's 40 up to Fitness Band X2's 95 — and ORDER BY stock DESC hangs them thickest-first: 95, 85, 70, 60, 45, 40. LENGTH(name) rides along because the label vendor bills by width, and the probed range is 13 to 23. The edge worth teaching: '=' looks like the careful version of '<=' but matches nothing — no product sits at exactly 100 — and an empty wall reads as 'fully stocked' to anyone glancing at it.",
  },
  {
    id: "cs-1236",
    tier: "hard",
    topic: "w1",
    universe: "pricing",
    title: "The cents crowd's average",
    brief:
      "Pricing review: products priced with cents behave differently at the till, and the R-initial slice is the dispute. Isolate the cent-priced products by initial letter, count them, and plate their average price for the pricing memo.",
    ask: "For R-initial cent-priced products: initial, count, and the average price plated.",
    template:
      "SELECT {1}(name, 1, 1) AS ch, {2} AS with_cents, {3}({4}, AVG(price)) AS avg_price\nFROM products\nWHERE price {5} ROUND(price, 0)\nGROUP BY ch\nHAVING ch = {6};",
    slots: [
      { answer: "SUBSTR", kind: "keyword", label: "the initial slicer",
        why: "SUBSTR(name, 1, 1) extracts the key — probed 'R' for the dispute slice. UPPER(name, 1, 1) is a wrong-argument error; UPPER takes one argument." },
      { answer: "COUNT(*)", kind: "keyword", label: "the crowd counter",
        why: "COUNT(*) sizes the slice — probed 2 R-initial cent-priced products (Ring Light 14\" 39.99, Running Socks 3-pack 18.50). SUM as a bare chip is no column." },
      { answer: "PRINTF", kind: "keyword", label: "the plate printer",
        why: "PRINTF plates the average — probed '29.25' from the raw 29.245. A zero pattern or a bare ROUND plates the memo at 0 or an unformatted float." },
      { answer: "'%.2f'", kind: "keyword", label: "the money pattern",
        why: "Two decimals is memo law — probed '29.25'. '%.0f' would print '29' and the dispute loses its fraction." },
      { answer: "<>", kind: "keyword", label: "the cents test",
        why: "Cents means price <> ROUND(price, 0) — probed 10 cent-priced vs 6 whole-dollar products. Flip to '>' and the test is never true — ROUND never lands below a positive price — so the slice empties and R has nobody in it." },
      { answer: "'R'", kind: "keyword", label: "the disputed initial",
        why: "'R' is the dispute — probed Ring Light 14\" 39.99 and Running Socks 3-pack 18.50, averaging 29.245. 'S' holds only Smart Watch S at 199.99, a one-product crowd." },
    ],
    distractors: ["'%.0f'", "'>", "UPPER", "'S'"],
    walkthrough:
      "The memo's slice is three derived columns deep: SUBSTR(name, 1, 1) keys the initial, price <> ROUND(price, 0) separates the 10 cent-priced products from the 6 whole-dollar ones, and the fold counts and averages. Probed R-slice: Ring Light 14\" 39.99 and Running Socks 3-pack 18.50 — average 29.245, plated '29.25' by PRINTF('%.2f', …). The inversion test matters: price > ROUND(price, 0) is never true (rounding goes up), so flipping the operator empties the slice entirely. 'S' is the plausible wrong key — one product, 199.99, a crowd of one where the dispute describes two.",
  },
  {
    id: "cs-1237",
    tier: "hard",
    topic: "w1",
    universe: "supplier",
    title: "The 16-character partner plates",
    brief:
      "Procurement scorecards: the compliance copy carries partners joined to their stocked items — name width stamped, item count folded, rating plated — but only the 16-character tier makes the annex. Assemble the tier, plates descending.",
    ask: "List 16-character suppliers with item counts and plated ratings, highest rating first.",
    template:
      "SELECT s.name, {1}(s.name) AS ln, COUNT(p.id) AS items, {2}({3}, s.rating) AS plate\nFROM suppliers s {4} products p ON p.supplier_id = s.id\nGROUP BY s.id\nHAVING ln = {5}\nORDER BY plate DESC;",
    slots: [
      { answer: "LENGTH", kind: "keyword", label: "the width stamper",
        why: "LENGTH(s.name) stamps the tier — probed 16 for both members. UPPER(s.name) as the stamper makes HAVING ln = 16 compare text to a number: no rows." },
      { answer: "PRINTF", kind: "keyword", label: "the rating printer",
        why: "PRINTF plates ratings to house style — probed '4.10' and '3.90'. '%.0f' would plate both partners as '4' and erase the ranking the ORDER BY needs." },
      { answer: "'%.2f'", kind: "keyword", label: "the scorecard pattern",
        why: "Two decimals is scorecard law — probed '4.10' above '3.90'. Unplated ratings print 4.1 and 3.9 and the annex looks unfinished." },
      { answer: "JOIN", kind: "keyword", label: "the shelf connector",
        why: "The item fold needs the products shelf: JOIN products ON supplier_id — probed 3 items each. LEFT alone is a syntax error; SQLite requires the JOIN keyword." },
      { answer: "16", kind: "number", label: "the annex tier",
        why: "16 is the annex tier — probed members Shenzhen Electro (3 items, 4.10) and Pacific Textiles (3 items, 3.90). Tier 19 is Midwest Hardware Co, rating 4.40." },
    ],
    distractors: ["UPPER", "'%.0f'", "LEFT", "19"],
    walkthrough:
      "Scorecard assembly: JOIN products so COUNT(p.id) can fold each partner's shelf, LENGTH(s.name) stamps the tier, PRINTF('%.2f', s.rating) plates the score, and HAVING ln = 16 pins the annex. Probed members: Shenzhen Electro — 3 items, plate '4.10' — above Pacific Textiles — 3 items, '3.90' — because ORDER BY plate DESC hangs the better scorecard first. The subtle failure is the stamper: UPPER(s.name) still builds fine, but HAVING then compares an uppercase string to 16 and the annex goes empty. LEFT without JOIN is a syntax error, and tier 19 pulls in Midwest Hardware — a real partner on the wrong page.",
  },
  {
    id: "cs-1238",
    tier: "hard",
    topic: "w1",
    universe: "month-close",
    title: "The January 2025 ledger line",
    brief:
      "Close binder: each ledger month gets one line — month sliced off the memo, entry count, plated debit total — and the binder's last page is January 2025. Slice, fold, plate, and pin the line the binder quotes.",
    ask: "For memo-month 2025-01: entry count and the debit total on a two-decimal plate.",
    template:
      "SELECT {1}(memo, 1, 7) AS mon, {2} AS entries, {3}({4}, SUM(debit_cents) / 100.0) AS debits\nFROM ledger_entries\nGROUP BY mon\nHAVING mon = {5};",
    slots: [
      { answer: "SUBSTR", kind: "keyword", label: "the month slicer",
        why: "SUBSTR(memo, 1, 7) lifts the 'YYYY-MM' prefix — probed '2025-01'. Slice 8 characters and every key drags a trailing space that matches no literal." },
      { answer: "COUNT(*)", kind: "keyword", label: "the entry counter",
        why: "COUNT(*) tallies the fold — probed 6 entries in 2025-01, the ledger's steady monthly rhythm. SUM as a bare chip is no column." },
      { answer: "PRINTF", kind: "keyword", label: "the total printer",
        why: "PRINTF plates the debits — probed '18921.00' from 1892100 cents. ROUND as the printer coerces the pattern to 0 and plates the month at zero." },
      { answer: "'%.2f'", kind: "keyword", label: "the money pattern",
        why: "Two decimals is binder law — probed '18921.00'. '%.0f' prints '18921' and the line stops reconciling with the statement it supports." },
      { answer: "'2025-01'", kind: "keyword", label: "the binder month",
        why: "'2025-01' is the binder's last page — probed 6 entries, 18921.00. '2024-01' is the first page: 2 entries, 1719.00." },
    ],
    distractors: ["8", "SUM", "'%.0f'", "'2024-01'"],
    walkthrough:
      "The ledger memo opens 'YYYY-MM · …', so the month is a slice: SUBSTR(memo, 1, 7) builds a groupable key — probed '2025-01' — and GROUP BY mon folds each month's entries. The binder's last page: 6 entries, debit total 1892100 cents, plated '18921.00'. Width discipline is the hidden trap — slice 8 and every key ends in a space, so HAVING mon = '2025-01' matches nothing and the binder page goes silently blank. '2024-01' is the true first page (2 entries, 1719.00): a real line, three thousand miles from the one being signed.",
  },
  {
    id: "cs-1239",
    tier: "hard",
    topic: "w1",
    universe: "funnel",
    title: "The 2024 five-letter city wall",
    brief:
      "Marketing ops: the geo wall prints one line per 2024-intake customer in a five-letter city — name, em-dash, city — with the city width and the finished '2024 cohort' tag carried for the tool. Build the wall exactly to spec.",
    ask: "For 2024 signups in 5-letter cities: glued name—city lines with width and cohort tag.",
    template:
      "SELECT name || {1} || city AS base, LENGTH(city) AS cl, SUBSTR(created_at, 1, 4) || {2} AS cohort\nFROM customers\nWHERE SUBSTR(created_at, 1, 4) = {3} AND LENGTH(city) = {4}\nORDER BY base;",
    slots: [
      { answer: "' — '", kind: "keyword", label: "the line glue",
        why: "The wall's spec glues with an em-dash — probed 'Farid Nasser — Dubai'. A middot builds lines the geo tool's parser rejects." },
      { answer: "' cohort'", kind: "keyword", label: "the tag suffix",
        why: "The finished tag glues year + ' cohort' — probed '2024 cohort'. ' intake' builds a tag the tool has never matched, and a bare '2023' glues '20242023'." },
      { answer: "'2024'", kind: "keyword", label: "the intake year",
        why: "The wall hangs 2024 signups — probed four qualify. '2023' founders live in Berlin (6), São Paulo (9), Lyon (4) and Tallinn (7): no five-letter city among them." },
      { answer: "5", kind: "number", label: "the city width",
        why: "Five letters is the wall's width — probed Dubai, Seoul, Osaka, Milan (all 2024 signups). Width 6 hangs five different customers, Austin through Madrid." },
    ],
    distractors: ["' · '", "' intake'", "'2023'", "6"],
    walkthrough:
      "The wall is two glue jobs and a double filter: || with ' — ' builds each base line, SUBSTR(created_at, 1, 4) || ' cohort' builds the finished tag, and WHERE pins both axes — year '2024', city width 5. Probed wall: Farid Nasser — Dubai, Grace Kim — Seoul, Hiro Tanaka — Osaka, Isabella Rossi — Milan, each stamped cl 5 and tag '2024 cohort'. The near-misses are the spec's teeth: the 2023 founders live in cities measuring 4, 6, 7 and 9 — none qualify — while width 6 hangs Emma, Keiko, Maya, Olivia and Pedro, five real customers on the wrong wall.",
  },
  {
    id: "cs-1240",
    tier: "hard",
    topic: "w1",
    universe: "month-close",
    title: "The bare-number register",
    brief:
      "Close binder: the archivist's register strips the INV- prefix off every invoice number, keeping the bare year-sequence, and stamps each row with the prefix it removed and the width it verified. Build the full 28-row register.",
    ask: "Strip INV- from every invoice number, stamping prefix and verified width, sorted.",
    template:
      "SELECT number, {1}(number, 'INV-', '') AS bare, SUBSTR(number, 1, 3) AS head, LENGTH(number) AS ln\nFROM invoices\nWHERE {2}(number) = {3} AND head = {4}\nORDER BY bare;",
    slots: [
      { answer: "REPLACE", kind: "keyword", label: "the prefix stripper",
        why: "REPLACE(number, 'INV-', '') deletes the prefix — probed 'INV-2024-007' → '2024-007'. SUBSTR(number, 'INV-', '') coerces the start to 0 and empties every bare number." },
      { answer: "LENGTH", kind: "keyword", label: "the width verifier",
        why: "LENGTH(number) = 12 is the format check — probed, all 28 invoices measure 12. SUBSTR as the verifier is a one-argument error." },
      { answer: "12", kind: "number", label: "the verified width",
        why: "12 is the INV-YYYY-NNN width, stamped in the register's ln column — probed census: 28 invoices, every one prefix INV and length 12. Width 11 matches nothing; the register would return empty." },
      { answer: "'INV'", kind: "keyword", label: "the stamped prefix",
        why: "SUBSTR(number, 1, 3) reads the prefix — probed 'INV' on all 28 rows. 'IN' matches nothing: the register returns empty and the archivist re-files by hand." },
    ],
    distractors: ["UPPER", "SUBSTR", "11", "'IN'"],
    walkthrough:
      "A register is strip, verify, stamp: REPLACE(number, 'INV-', '') produces the bare year-sequence ('2024-001' through '2025-028', probed across all 28 rows), LENGTH(number) = 12 verifies the format held, SUBSTR(number, 1, 3) stamps the prefix, and ORDER BY bare lines the register up chronologically. The probed census makes the stamps meaningful — every invoice is INV and 12 wide, so a register returning 28 rows proves the archive is uniform. The instructive failure is SUBSTR as the stripper: with 'INV-' as its start argument it coerces to 0 and hands the archivist 28 empty strings.",
  },
];
