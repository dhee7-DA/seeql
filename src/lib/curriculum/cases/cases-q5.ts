// Case batch Q5 — Module 4 (subqueries & CTEs) cases cs-1101…cs-1150, wave 5.
// 50 cases: 17 easy / 17 medium / 16 hard across topics q1 (IN subqueries) ×15,
// q2 (scalar subqueries) ×15, q3 (EXISTS tests) ×10, q4 (correlated) ×10 —
// the third pass over wave 1+3's ground: HAVING-built membership lists,
// expression-IN empties taught honestly, cross-ledger cents collisions,
// double-EXISTS states, NOT EXISTS complements, and correlated stamps and
// runner-up ladders. Every figure was probed against the live seed db
// (scripts/m4-cases-w5-facts.ts W501–W550, w5b T01–T10, w5c U01–U15,
// w5d X01–X52, w5e Y01–Y77, w5f Z01–Z08) and is mechanically re-verified
// by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesQ5: CaseStudy[] = [
  {
    id: "cs-1101",
    tier: "easy",
    topic: "q1",
    universe: "growth",
    title: "The two smallest chapters",
    brief:
      "From: Growth lead. Re: regional chapter sizes.\n\nThe board map colors four chapters, and the two smallest keep getting averaged away. Count the members of the APAC and LATAM chapters with one membership list so the footnote gets its own number.",
    ask: "Count customers in the APAC or LATAM regions.",
    template: `SELECT {1}(*) AS club
FROM customers
WHERE region IN ({2}, {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the headcount builder",
        why: "The deliverable is one membership figure. COUNT(*) collapses the surviving rows to that number; SUM has nothing to add.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the first chapter",
        why: "APAC holds 5 of the 16 accounts. The literal must match the stored spelling or the list silently shrinks.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the second chapter",
        why: "LATAM is a one-account chapter — Bruno Silva in São Paulo. Dropping it understates the club by exactly him.",
      },
    ],
    distractors: ["SUM", "'EU'", "'US'"],
    walkthrough:
      "One two-item list covers both small chapters: APAC contributes 5 accounts and LATAM the lone 1, so the club counts 6. Pointing the list at 'EU' would print 8 — the biggest chapter, the one the board already knows — and 'US' would print 2, while SUM(*) is not a valid way to count rows.",
  },
  {
    id: "cs-1102",
    tier: "easy",
    topic: "q1",
    universe: "funnel",
    title: "The three-city shortlist",
    brief:
      "From: Lifecycle marketer. Re: the metro tour shortlist.\n\nWe shortlisted three cities for the metro tour, but the shortlist was written before anyone checked the account map. Count residents across the three shortlisted cities exactly as the list reads — the gap is the story.",
    ask: "Count customers in Berlin, Austin or Tokyo.",
    template: `SELECT {1}(*) AS residents
FROM customers
WHERE city IN ({2}, 'Austin', {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the resident tally",
        why: "One number for the tour budget. COUNT(*) reduces the filtered rows to it; SUM would try to add cities like amounts.",
      },
      {
        answer: "'Berlin'",
        kind: "keyword",
        label: "the EU stop",
        why: "Berlin holds Alice Chen's account — one resident. The spelling must match the stored city or the stop vanishes from the count.",
      },
      {
        answer: "'Tokyo'",
        kind: "keyword",
        label: "the hopeful stop",
        why: "Tokyo is on the shortlist as written, even though the map shows zero residents there — that gap is what the memo wants exposed.",
      },
    ],
    distractors: ["SUM", "'Osaka'", "'Seoul'"],
    walkthrough:
      "The list reads Berlin, Austin, Tokyo and the count comes back 2: Alice Chen in Berlin plus Austin's lone account. Tokyo is a phantom stop — no customer lives there — and that zero is the finding. Swapping in 'Osaka' or 'Seoul' would each add a real resident and print 3, hiding the gap the memo is about, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1103",
    tier: "easy",
    topic: "q1",
    universe: "expense",
    title: "The travel-and-tools billers",
    brief:
      "From: Spend analyst. Re: the vendor card for the ops review.\n\nThe ops review opens with the vendors that bill under operational categories — Travel and Tools, nothing else. One membership list over the expense ledger, names deduped, alphabetical for the binder.",
    ask: "List vendors with Travel or Tools expenses, alphabetically.",
    template: `SELECT DISTINCT vendor
FROM expenses
WHERE category IN ({1}, {2})
ORDER BY vendor;`,
    slots: [
      {
        answer: "'Travel'",
        kind: "keyword",
        label: "the road category",
        why: "Travel is one of the two operational buckets — three bookings, all at Skyline Travel. Missing it deletes a vendor from the card.",
      },
      {
        answer: "'Tools'",
        kind: "keyword",
        label: "the workshop category",
        why: "Tools holds the five DevTools Inc lines. The list needs both spellings to return both vendors.",
      },
    ],
    distractors: ["'Fitness'", "'Ads'", "category"],
    walkthrough:
      "The two-item list sweeps 8 expense lines down to 2 vendors: DevTools Inc (five Tools lines, 299 to 329 euros each) and Skyline Travel (three Travel bookings topped by the 1,680-euro trip). 'Fitness' or 'Ads' would each collapse the card to a single vendor — Fitness bills nobody and Ads belongs to AdWorks Media alone — and a category chip in a category slot self-references into nonsense.",
  },
  {
    id: "cs-1104",
    tier: "easy",
    topic: "q1",
    universe: "growth",
    title: "The shipped chapter, counted",
    brief:
      "From: Growth lead. Re: the fulfillment footnote.\n\nThe deck claims EU adoption, but the honest number is EU accounts with at least one shipped order — membership in the shipped club, gated to the home region. Give the footnote its figure.",
    ask: "Count EU customers with at least one shipped order.",
    template: `SELECT {1}(*) AS members
FROM customers
WHERE id IN (
  SELECT customer_id FROM orders WHERE status = {2}
) AND region = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the footnote figure",
        why: "One number for the deck. COUNT(*) counts the surviving members; SUM has no amounts to total here.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the club's badge",
        why: "The shipped club is the membership list the memo names. 'delivered' builds a different, larger club.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the home-region gate",
        why: "The gate keeps the count inside Europe. Dropping to 'APAC' answers a different regional question entirely.",
      },
    ],
    distractors: ["SUM", "'delivered'", "'APAC'"],
    walkthrough:
      "The inner list collects every customer who has shipped merchandise; the region gate keeps only the European chapter — 5 of the 8 EU accounts. 'delivered' would admit a different 7 (delivery is not shipping), and the 'APAC' gate would print 3, the APAC shipped chapter, instead of the home-region figure the deck needs.",
  },
  {
    id: "cs-1105",
    tier: "easy",
    topic: "q1",
    universe: "refund-audit",
    title: "Open paper in the EU book",
    brief:
      "From: Refund auditor. Re: the exposure cut.\n\nBefore the refund sweep, I need the EU accounts carrying any open invoice — unsettled paper is where disputes start. Membership test over the invoice ledger, gated to Europe.",
    ask: "Count EU customers holding at least one open invoice.",
    template: `SELECT {1}(*) AS holders
FROM customers
WHERE id IN (
  SELECT customer_id FROM invoices WHERE status = {2}
) AND region = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the exposure headcount",
        why: "The sweep needs one number of exposed accounts. COUNT(*) delivers it; SUM would try to total text-status rows.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the unsettled state",
        why: "Open means the bill is still out. 'paid' would count settled relationships — the opposite of exposure.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the audit's scope gate",
        why: "This sweep covers Europe only. 'US' would return Emma Wilson's single file — a different audit.",
      },
    ],
    distractors: ["SUM", "'paid'", "'US'"],
    walkthrough:
      "The inner list gathers every customer with open paper; the EU gate trims it to 5 accounts. 'paid' would print 3 — settled, not exposed — and switching the gate to 'US' finds exactly 1 holder, Emma Wilson, the lone non-EU open file in the book. SUM(*) cannot tally membership rows.",
  },
  {
    id: "cs-1106",
    tier: "medium",
    topic: "q1",
    universe: "catalog",
    title: "The wide-basket test",
    brief:
      "From: Catalog manager. Re: the cross-category attach study.\n\nThe attach study counts real baskets, not lines: any order containing Accessories or Fitness gear counts once, however many lines it has. Chain the membership tests through the catalog and count the distinct baskets.",
    ask: "Count orders containing an Accessories or Fitness product.",
    template: `SELECT {1}(DISTINCT order_id) AS baskets
FROM order_items
WHERE product_id IN (
  SELECT id FROM products WHERE category IN ({2}, {3})
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the basket counter",
        why: "DISTINCT order_id collapses multi-line baskets to one row each, and COUNT tallies them. SUM would add order ids together — a meaningless number.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the add-on shelf",
        why: "Accessories is the attach category with the widest reach. Leaving it out shrinks the study to fitness gear alone.",
      },
      {
        answer: "'Fitness'",
        kind: "keyword",
        label: "the workout shelf",
        why: "Fitness is the second study shelf. The two-item list must carry both spellings for the full 62-basket reach.",
      },
    ],
    distractors: ["SUM", "'Audio'", "'Video'"],
    walkthrough:
      "The inner list collects product ids from the two shelves; the outer membership test keeps every basket line that carries one, and DISTINCT order_id folds multi-line baskets into single rows — 62 distinct baskets. Swapping 'Audio' in would read 75 (media attach is wider), 'Video' alone with Accessories 71 or with Fitness 42, and SUM(DISTINCT order_id) would print a giant id total that means nothing.",
  },
  {
    id: "cs-1107",
    tier: "medium",
    topic: "q1",
    universe: "funnel",
    title: "The media bundle reach",
    brief:
      "From: Lifecycle marketer. Re: home-studio bundle pre-launch.\n\nThe bundle pairs Audio and Video gear, so reach is measured in baskets: any order touching either shelf counts once. Build the two-shelf membership list and count the distinct baskets it touches.",
    ask: "Count orders containing an Audio or Video product.",
    template: `SELECT {1}(DISTINCT order_id) AS baskets
FROM order_items
WHERE product_id IN (
  SELECT id FROM products WHERE category IN ({2}, {3})
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach figure",
        why: "Distinct baskets, then one number. COUNT does the tally; MAX would read only the largest order id in the set.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the sound shelf",
        why: "Audio is the bundle's first shelf — three products and the deepest line counts in the catalog.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "the studio shelf",
        why: "Video is the second shelf (webcam, ring light). Both literals in one list give the bundle its true reach.",
      },
    ],
    distractors: ["MAX", "'Accessories'", "'Fitness'"],
    walkthrough:
      "The two-shelf list feeds the membership test and DISTINCT order_id folds the lines: 66 distinct baskets carry at least one media item. 'Accessories' would swap the study to 75 baskets with Audio or 71 with Video, 'Fitness' pairs down to 75 with Audio or 42 with Video, and MAX(DISTINCT order_id) would print the biggest order id in the set — one row's identity, not a reach figure.",
  },
  {
    id: "cs-1108",
    tier: "medium",
    topic: "q1",
    universe: "month-close",
    title: "Orders behind paid paper",
    brief:
      "From: Controller. Re: revenue-quality tie-out.\n\nAuditors want the volume of order activity that sits behind settled invoices: every order placed by a customer holding at least one paid bill. Membership from the invoice ledger into the orders table — count the orders.",
    ask: "Count orders placed by customers with a paid invoice.",
    template: `SELECT {1}(*) AS orders
FROM orders
WHERE customer_id IN (
  SELECT customer_id FROM {2} WHERE status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the activity tally",
        why: "The tie-out needs one count of orders. COUNT(*) reads it straight off the filtered rows.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "where paid lives",
        why: "Paid is an invoice state. Reading status from orders would mix vocabularies — orders are shipped, delivered, pending or cancelled.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled state",
        why: "The memo says settled. 'open' would count activity behind unsettled paper instead — 55 orders, a different ledger.",
      },
    ],
    distractors: ["SUM", "customers", "'open'"],
    walkthrough:
      "The inner list pulls customer ids from invoices marked paid — 8 holders — and the membership test counts every order they placed: 78 of the store's 103 orders. 'open' would build the 55-order unsettled version, a customers chip would crash because the customers table has no status column, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1109",
    tier: "medium",
    topic: "q1",
    universe: "funnel",
    title: "The wearable-and-audio club",
    brief:
      "From: Lifecycle marketer. Re: the gadget-club audience file.\n\nThe gadget club is anyone who has ever bought from the Wearables shelf — one product, real baskets only. Chain the membership tests down through orders and line items to the catalog and size the audience.",
    ask: "Count customers whose orders include the Wearables product.",
    template: `SELECT {1}(*) AS members
FROM customers
WHERE id IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products WHERE category = {2}
    )
  )
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audience size",
        why: "The audience file needs one headcount. COUNT(*) collapses the surviving customers to it.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the gadget literal",
        why: "The Wearables shelf is exactly one product, so the innermost filter is a single-category literal that must match the stored spelling.",
      },
    ],
    distractors: ["SUM", "'Fitness'", "'Apparel'"],
    walkthrough:
      "Three membership hops stack: the innermost IN finds the single Wearables product id, the middle keeps baskets containing it, the outer turns those baskets into 16 distinct customers. 'Fitness' would size the yoga-crossell audience at 7 and 'Apparel' the wardrobe club at 10 — different shelves, different clubs — while SUM(*) is not valid SQL for counting.",
  },
  {
    id: "cs-1110",
    tier: "medium",
    topic: "q1",
    universe: "supplier",
    title: "Berlin's supplier bench",
    brief:
      "From: Supplier auditor. Re: the city-day sourcing note.\n\nThe Berlin city day needs its local bench: suppliers registered in the same region as our Berlin customers. Let the customer ledger name the region, then membership-test the supplier table against it.",
    ask: "List suppliers in the same region as Berlin customers.",
    template: `SELECT name
FROM suppliers
WHERE region IN (
  SELECT {1} FROM {2} WHERE city = {3}
);`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the shared key",
        why: "Regions join the two tables: customers carry one, suppliers are filtered by one. The inner list must project the region column.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "where Berlin lives",
        why: "Berlin is a customer city. The supplier table has no city column at all, so the inner query must read customers.",
      },
      {
        answer: "'Berlin'",
        kind: "keyword",
        label: "the anchor city",
        why: "The memo anchors on Berlin — Alice Chen's home city. Any other literal sources a different region's bench.",
      },
    ],
    distractors: ["suppliers", "city", "'Tokyo'"],
    walkthrough:
      "The inner query reads Berlin out of the customer ledger and returns its region, EU; the membership test keeps the two EU suppliers — Nordic Gadgets AB and Alpine Audio GmbH. Pointing the inner FROM at suppliers crashes (no city column), projecting city instead of region feeds the word 'Berlin' into a region test and matches nobody, and 'Tokyo' anchors a city with zero residents, emptying the bench.",
  },
  {
    id: "cs-1111",
    tier: "hard",
    topic: "q1",
    universe: "expense",
    title: "The thousand-euro club, whole book",
    brief:
      "From: Spend analyst. Re: the vendor-tier note.\n\nThe big-vendor tier is built by the ledger itself: vendors whose lifetime spend tops 1,000 euros. Build that list with a grouped, filtered subquery, then count how many expense lines sit inside the tier.",
    ask: "Count expenses at vendors with lifetime spend above 1000 euros.",
    template: `SELECT {1}(*) AS lines
FROM expenses
WHERE vendor IN (
  SELECT vendor FROM expenses
  GROUP BY vendor
  HAVING SUM(amount_cents) > {2}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "The deliverable is how many lines the tier holds. COUNT(*) tallies them; MAX would read one extreme line.",
      },
      {
        answer: "100000",
        kind: "number",
        noVerify: true,
        label: "the tier bar, in cents",
        why: "1000 euros is 100000 cents in the ledger's storage. The bar is a filter constant and never appears in the output cells.",
      },
    ],
    distractors: ["MAX", "AVG", "200000"],
    walkthrough:
      "The HAVING clause builds the tier from the ledger itself: all four vendors clear 1,000 lifetime euros (Atlas Property 16,800.00, AdWorks 4,570.00, Skyline 2,521.00, DevTools 1,525.00), so the membership test keeps every line — 36 of 36. MAX would rebuild the tier as 'any single line over 1,000' and count 17 lines at two vendors, AVG would keep only Atlas's 14, and a 200,000-cent bar drops DevTools and AdWorks for 17 again.",
  },
  {
    id: "cs-1112",
    tier: "hard",
    topic: "q1",
    universe: "fraud",
    title: "The doubling test",
    brief:
      "From: Fraud analyst. Re: the amount-manipulation sweep.\n\nA tampered ledger often shows a doubled twin of a real ticket. Order 51 cleared at 25.47 — test whether any order in the book carries exactly twice that. If the count is zero, say so plainly; a zero is a finding.",
    ask: "Count orders whose total equals double order 51's total.",
    template: `SELECT {1}(*) AS doubles
FROM orders
WHERE total IN (
  SELECT {2} FROM orders WHERE id = 51
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the hit counter",
        why: "The sweep reports how many tickets match the doubled amount — possibly zero. COUNT(*) returns that number either way.",
      },
      {
        answer: "total * 2",
        kind: "keyword",
        label: "the doubling expression",
        why: "The inner list must stage the doubled value: total * 2. Leaving the expression off reads the ticket's own total instead.",
      },
    ],
    distractors: ["total", "MAX(total)", "SUM"],
    walkthrough:
      "Order 51 cleared at 25.47, so the sweep hunts 50.94 — and finds nothing: 0 orders carry it. That zero is the finding, honestly reported. The un-doubled reads betray themselves immediately: 'total' or MAX(total) both stage 25.47 itself and match order 51 (count 1), and a bare SUM chip is not a column expression at all.",
  },
  {
    id: "cs-1113",
    tier: "hard",
    topic: "q1",
    universe: "expense",
    title: "The fifteen-hundred-euro vendor",
    brief:
      "From: Spend analyst. Re: the single-ticket outlier note.\n\nThe outlier rule is per-ticket: vendors with any one expense above 1,500 euros. Build that vendor list, then count every line booked at those vendors — the membership test does the join the memo can't.",
    ask: "Count expenses at vendors with a single expense above 1500 euros.",
    template: `SELECT {1}(*) AS lines
FROM expenses
WHERE vendor {2} (
  SELECT vendor FROM expenses
  WHERE amount_cents > {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "One number: how many lines the outlier vendors hold. COUNT(*) reads it off the filtered set.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the membership test",
        why: "The memo is a keeps-vendors rule — lines at members. NOT IN would count lines at everybody else.",
      },
      {
        answer: "150000",
        kind: "number",
        noVerify: true,
        label: "the per-ticket bar, in cents",
        why: "1500 euros stored as 150000 cents. A threshold constant that never appears in the output cells.",
      },
    ],
    distractors: ["NOT IN", "200000", "SUM"],
    walkthrough:
      "Only Skyline Travel books a single ticket above 1,500 euros — the 1,680.00 trip — so the vendor list holds one name and the membership test counts all 3 of its lines. NOT IN would read the 33 lines at the other three vendors, a 200,000-cent bar clears nobody (0 lines), and SUM is not a comparison operator.",
  },
  {
    id: "cs-1114",
    tier: "hard",
    topic: "q1",
    universe: "catalog",
    title: "Audio loyalists, wearable-free",
    brief:
      "From: Catalog manager. Re: the category-purity cut.\n\nThe purity cut wants customers who buy audio gear but never the wearable — members of the audio club with no wearables basket at all. Two membership tests, one kept, one negated.",
    ask: "Count customers who bought Audio but never Wearables.",
    template: `SELECT {1}(*) AS purists
FROM customers
WHERE id IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products WHERE category = {2}
    )
  )
) AND id NOT IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products WHERE category = {3}
    )
  )
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the purist tally",
        why: "The cut needs one headcount. COUNT(*) reads it off the surviving rows.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the kept club",
        why: "The audio club is the membership being kept. Its literal must match the catalog spelling.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the negated club",
        why: "NOT IN keeps customers absent from the wearables club. Swapping the two literals inverts the cut.",
      },
    ],
    distractors: ["SUM", "'Fitness'", "'Apparel'"],
    walkthrough:
      "The audio club holds 14 customers; the wearables club 12; the purists are the 4 who never crossed — Bruno Silva, Hiro Tanaka, Isabella Rossi and Pedro Alvarez. 'Fitness' as the kept club leaves 2, 'Apparel' as the negated club widens the audio purists to 6, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1115",
    tier: "hard",
    topic: "q1",
    universe: "fraud",
    title: "The ledger collision test",
    brief:
      "From: Fraud analyst. Re: the cross-ledger amount sweep.\n\nA classic bookkeeping fraud is an expense parked at exactly an invoice amount so the pair explains itself. Sweep every expense amount against the invoice ledger at cent granularity — and if nothing collides, the zero is the headline.",
    ask: "Count expenses whose amount matches an invoice amount exactly.",
    template: `SELECT {1}(*) AS collisions
FROM expenses
WHERE amount_cents {2} (
  SELECT amount_cents FROM invoices
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the collision counter",
        why: "The sweep reports a possibly-zero count. COUNT(*) returns 0 honestly when the membership test matches nothing.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the membership sweep",
        why: "The memo hunts overlaps — amounts present in both ledgers. NOT IN would count the disjoint complement instead.",
      },
    ],
    distractors: ["SUM", "MAX", "NOT IN"],
    walkthrough:
      "36 expense lines go up against 28 invoice amounts at cent granularity and not one collides: the count is 0, and that zero is the finding — no parked pairs exist. NOT IN flips the sweep to the disjoint read and returns all 36, while SUM and MAX are aggregate chips that cannot sit where a membership operator belongs.",
  },
