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
      "From: Growth lead. Re: regional chapter sizes.\n\nThe board map colors four chapters, and the two smallest keep getting averaged away. Count the APAC and LATAM accounts the billing ledger has actually invoiced — one membership test into the invoice ledger — so the footnote gets its own number.",
    ask: "Count APAC or LATAM customers with at least one invoice.",
    template: `SELECT {1}(*) AS club
FROM customers
WHERE region IN ({2}, {3})
  AND id IN (SELECT customer_id FROM invoices);`,
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
        why: "LATAM is a one-account chapter — Bruno Silva in São Paulo — and the invoice gate sweeps him out: he has never been billed. The list still needs the literal or the chapter silently vanishes.",
      },
    ],
    distractors: ["SUM", "'EU'", "'US'"],
    walkthrough:
      "The invoice gate keeps only accounts the billing ledger has touched: APAC contributes 3 and LATAM none — its lone account, Bruno Silva, has never been invoiced — so the club counts 3, not the 6 raw members the map shows. Pointing the list at 'EU' would print 6 and 'US' 2, while SUM(*) is not a valid way to count rows.",
  },
  {
    id: "cs-1102",
    tier: "easy",
    topic: "q1",
    universe: "funnel",
    title: "The three-city shortlist",
    brief:
      "From: Lifecycle marketer. Re: the metro tour shortlist.\n\nWe shortlisted Berlin, Austin and Tokyo for the metro tour, but the budget only covers accounts the invoice ledger has actually billed. Count shortlisted residents with at least one invoice, exactly as the list reads — phantom stop included. The gap is the story.",
    ask: "Count invoiced customers in Berlin, Austin or Tokyo.",
    template: `SELECT {1}(*) AS residents
FROM customers
WHERE city IN ('Berlin', 'Austin', {2})
  AND id IN (SELECT {3} FROM invoices);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the resident tally",
        why: "One number for the tour budget. COUNT(*) reduces the filtered rows to it; SUM would try to add cities like amounts.",
      },
      {
        answer: "'Tokyo'",
        kind: "keyword",
        label: "the hopeful stop",
        why: "Tokyo is on the shortlist as written, even though the map shows zero residents there — that gap is what the memo wants exposed.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the ledger's customer key",
        why: "The inner list must project the column customers.id is tested against: invoices carry customer_id, the billing ledger's foreign key.",
      },
    ],
    distractors: ["SUM", "'London'", "'Lyon'", "amount_cents"],
    walkthrough:
      "The shortlist reads Berlin, Austin, Tokyo and the invoiced count comes back 2: one billed account in each of Berlin and Austin, while Tokyo is a phantom stop no customer lives in — the gap the memo wants exposed. Swapping Tokyo for 'London' or 'Lyon' — each holding exactly one invoiced account — prints 3 and buries the gap; projecting amount_cents reads the ledger's own amounts instead of customer keys and matches nobody; and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1103",
    tier: "easy",
    topic: "q1",
    universe: "expense",
    title: "The travel-and-tools billers",
    brief:
      "From: Spend analyst. Re: the vendor card for the ops review.\n\nThe ops review opens with vendors billing under operational categories — Travel and Tools, nothing else — and only lines worth more than 300 euros make the card. Stage the category list inside a membership test, gate the amount outside, and print the vendors alphabetically for the binder.",
    ask: "List vendors with a Travel or Tools expense above 300 euros, alphabetically.",
    template: `SELECT DISTINCT {1}
FROM expenses
WHERE amount_cents > {2}
  AND vendor IN (
    SELECT vendor FROM expenses
    WHERE category IN ({3}, {4})
  )
ORDER BY vendor;`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the binder column",
        why: "The card prints vendor names, deduped. DISTINCT vendor collapses each vendor's surviving lines to one row.",
      },
      {
        answer: "30000",
        kind: "number",
        noVerify: true,
        label: "the gate, in cents",
        why: "300 euros is 30000 cents in the ledger's storage. The gate is a filter constant and never appears in the output cells.",
      },
      {
        answer: "'Travel'",
        kind: "keyword",
        label: "the road category",
        why: "Travel is one of the two operational buckets — three bookings, all at Skyline Travel. Missing it deletes a vendor from the candidate list.",
      },
      {
        answer: "'Tools'",
        kind: "keyword",
        label: "the workshop category",
        why: "Tools holds the five DevTools Inc lines. The list needs both spellings to keep both vendors in the running.",
      },
    ],
    distractors: ["category", "50000", "'Fitness'", "'Ads'"],
    walkthrough:
      "Two stages stack: the category list scopes candidates to Travel and Tools vendors, then the 300-euro gate keeps the lines worth more — DevTools' 329-euro seat and Skyline's 1,680-euro trip — printing DevTools Inc, then Skyline Travel. 'Fitness' empties the Tools side to Skyline alone, 'Ads' trades DevTools for AdWorks' 450-euro line, a 500-euro gate evicts DevTools outright, and a category chip in the binder column prints shelf names instead of vendors.",
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
    SELECT {3} FROM order_items
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
      {
        answer: "order_id",
        kind: "keyword",
        label: "the basket key",
        why: "The middle hop must project the column orders.id is tested against: line items carry order_id, the basket's foreign key.",
      },
    ],
    distractors: ["SUM", "'Fitness'", "'Apparel'", "product_id", "customer_id"],
    walkthrough:
      "Three membership hops stack: the innermost IN finds the single Wearables product id, the middle keeps baskets containing it via their order_id, and the outer turns those baskets into 12 distinct customers. 'Fitness' sizes the yoga-crossell club at 7 and 'Apparel' the wardrobe club at 10; staging product_id in the middle hop tests order ids against product keys and lands on 2 stray rows; customer_id does not exist on line items; and SUM(*) is not valid SQL for counting.",
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
  HAVING {2}(amount_cents) > {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the line counter",
        why: "The deliverable is how many lines the tier holds. COUNT(*) tallies them; MAX would read one extreme line.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime arithmetic",
        why: "The tier is built on lifetime spend: SUM adds every line the vendor ever billed. MAX reads one extreme line; AVG reads the middle of the book.",
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
      "The HAVING clause builds the tier from the ledger itself: all four vendors clear 1,000 lifetime euros (Atlas Property 16,800.00, AdWorks 4,570.00, Skyline 2,521.00, DevTools 1,525.00), so the membership test keeps every line — 36 of 36. MAX would rebuild the tier as 'any single line over 1,000' and count 17 lines at two vendors, AVG would keep only Atlas's 14, and a 200,000-cent bar drops DevTools' five lines for 31.",
  },
  {
    id: "cs-1112",
    tier: "hard",
    topic: "q1",
    universe: "fraud",
    title: "The recurring-billing sweep",
    brief:
      "From: Fraud analyst. Re: the subscription-shadow ledger.\n\nRecurring charges are legitimate — until a pair appears nobody approved. Sweep the expense ledger for lines sharing a vendor AND an exact amount with another line, pairing the two columns so a 299-euro seat at one vendor can never excuse a 299-euro line at another.",
    ask: "Count expense lines sharing vendor and amount with another line.",
    template: `SELECT {1}(*) AS recurring
FROM expenses
WHERE (vendor, amount_cents) IN (
  SELECT vendor, amount_cents FROM expenses
  GROUP BY {2}, {3}
  HAVING COUNT(*) > 1
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the recurring tally",
        why: "The sweep reports how many lines sit in repeated vendor-and-amount pairs. COUNT(*) returns that number whatever it lands on.",
      },
      {
        answer: "vendor",
        kind: "keyword",
        label: "the identity half",
        why: "The pair key starts with who billed. Grouping without the vendor column flattens away the identity half of the test.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the amount half",
        why: "The pair key ends with the exact cents figure. Dropping it groups by vendor alone and flags every multi-line vendor as recurring.",
      },
    ],
    distractors: ["SUM", "id", "spent_on"],
    walkthrough:
      "Two billing rhythms repeat at cent granularity: Atlas Property's 1,200.00-euro rent, billed 14 times, and DevTools' 299-euro seat, billed 4 times — 18 lines in all. Grouping by id or spent_on splits every group down to singletons and empties the sweep to 0, and a bare SUM chip is not a column the pair key can group by; pairing the two columns is what keeps the count honest — the 299-euro seat only counts because DevTools itself billed it four times.",
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
  SELECT amount_cents FROM {3}
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
      {
        answer: "invoices",
        kind: "keyword",
        label: "the comparison ledger",
        why: "The sweep runs expense cents against the invoice ledger's cents. Pointing the inner FROM at expenses sweeps the ledger against itself; orders keep no amount_cents column at all.",
      },
    ],
    distractors: ["SUM", "MAX", "NOT IN", "expenses", "orders"],
    walkthrough:
      "36 expense lines go up against 28 invoice amounts at cent granularity and not one collides: the count is 0, and that zero is the finding — no parked pairs exist. NOT IN flips the sweep to the disjoint read and returns all 36; pointing the inner FROM at expenses sweeps the ledger against itself and all 36 lines self-match; orders keep no amount_cents column to sweep against; and SUM or MAX in the counter seat cannot tally rows.",
  },
  {
    id: "cs-1116",
    tier: "easy",
    topic: "q2",
    universe: "funnel",
    title: "The delivered pace bar",
    brief:
      "From: Growth lead. Re: the pace report.\n\nThe delivered book sets the pace the rest of the funnel is measured against. Count every order in the book — whatever its status — that clears the delivered average, so the deck can say how much of the funnel keeps up.",
    ask: "Count orders whose total beats the delivered order average.",
    template: `SELECT {1}(*) AS above_pace
FROM orders
WHERE total > (
  SELECT {2}(total) FROM orders WHERE status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pace counter",
        why: "The deliverable is how many orders clear the bar. COUNT(*) collapses the surviving rows to that number.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "A pace is an average: the inner query must collapse the delivered totals to one typical figure. MAX would stage a single extreme ticket instead.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the pace setter",
        why: "The memo names the delivered book as the benchmark. Any other status builds a different bar — the shipped average sits far higher.",
      },
    ],
    distractors: ["SUM", "MAX", "'shipped'"],
    walkthrough:
      "The delivered book averages 299.44 euros, and 49 of the 103 orders in the whole book clear that bar — nearly half the funnel keeps up with delivery. Staging the shipped average instead raises the bar to 399.89 and only 34 orders survive; MAX reads the single biggest delivered ticket and clears almost nobody; SUM has no business building a bar at all.",
  },
  {
    id: "cs-1117",
    tier: "easy",
    topic: "q2",
    universe: "catalog",
    title: "The floor above the shelf average",
    brief:
      "From: Catalog manager. Re: the repricing memo.\n\nThe shelf averages 71.78 across the catalog, and the memo wants to know where the above-average tier starts. Count the products over the shelf average and print the cheapest of them — the floor the repricing conversation begins at.",
    ask: "Count products above the shelf average and print the cheapest.",
    template: `SELECT {1}(price) AS floor_price,
       {2}(*) AS members
FROM products
WHERE price > (
  SELECT AVG({3}) FROM products
);`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor reader",
        why: "The deliverable is where the above-average tier starts: MIN returns the cheapest price among the survivors. MAX would read the ceiling instead.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tier headcount",
        why: "Alongside the floor, the memo wants to know how deep the tier runs. COUNT(*) tallies the surviving products.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the averaged column",
        why: "The shelf average is built from the price column. Averaging the id column would stage a meaningless 8.5 bar and let every product through.",
      },
    ],
    distractors: ["MAX", "SUM", "id"],
    walkthrough:
      "Six of the 16 products clear the 71.78 shelf average, and the tier's floor is the Fitness Band X2 at 79 euros — the cheapest member of the club. MAX in the floor seat reads the 199.99 ceiling and points the repricing memo at the wrong end of the shelf; averaging ids instead of prices stages a nonsense 8.5 bar that the entire catalog clears; and SUM has no place counting members.",
  },
  {
    id: "cs-1118",
    tier: "easy",
    topic: "q2",
    universe: "month-close",
    title: "The storewide bar, paid slice",
    brief:
      "From: Billing lead. Re: the collections summary.\n\nThe storewide invoice average sits at 3,106.32 — open and paid books alike clear it. For the collections summary, count the PAID invoices that beat the storewide bar, so the deck can show how much of the settled book was big money.",
    ask: "Count paid invoices above the storewide invoice average.",
    template: `SELECT {1}(*) AS paid_above
FROM invoices
WHERE amount_cents > (
  SELECT {2}(amount_cents) FROM invoices
) AND status = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the slice counter",
        why: "The summary wants one figure for the paid slice above the bar. COUNT(*) reduces the surviving invoices to it.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The storewide bar is an average over the whole book — 3,106.32. MAX would stage the single biggest invoice as the bar and clear nobody.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled badge",
        why: "The memo slices the settled book: only paid invoices count here. 'open' keeps the unsettled side of the same bar.",
      },
    ],
    distractors: ["SUM", "MAX", "'open'"],
    walkthrough:
      "Nine of the 28 invoices are both paid and above the 3,106.32 storewide bar — the settled book carries real weight. The same bar over the open book holds 3 invoices, so swapping the badge halves-plus the story; MAX stages the biggest invoice in the book as the bar, which nothing exceeds; and SUM builds no bar at all.",
  },
  {
    id: "cs-1119",
    tier: "easy",
    topic: "q2",
    universe: "expense",
    title: "Twice the smallest claim",
    brief:
      "From: Spend analyst. Re: the outlier screen.\n\nThe cheapest expense in the ledger is a 220-euro line, and anything over twice that is worth a second look. Stage the minimum inside a subquery, double it, and count the claims that clear the doubled floor.",
    ask: "Count expenses worth more than twice the smallest claim.",
    template: `SELECT {1}(*) AS big_claims
FROM expenses
WHERE amount_cents > {2} * (
  SELECT {3}(amount_cents) FROM expenses
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the outlier tally",
        why: "The screen reports how many claims clear the doubled floor. COUNT(*) returns that tally whatever it lands on.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the doubling factor",
        why: "The memo says twice the smallest claim: the multiplier is part of the filter, never a figure in the output.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor finder",
        why: "The anchor is the ledger's smallest claim — 220 euros. MAX would anchor on the 1,680-euro ceiling and the doubled bar would clear nobody.",
      },
    ],
    distractors: ["MAX", "AVG", "4"],
    walkthrough:
      "Twice the 220-euro floor is a 440-euro bar, and 17 of the 36 claims clear it — Atlas's fourteen 1,200-euro rents, Skyline's 1,680-euro trip and 452-euro booking, and AdWorks' 450-euro line. Anchoring on MAX doubles 1,680 instead and the screen empties; anchoring on the 706-euro average catches only the 1,680 trip; a 4x factor lifts the bar to 880 and keeps 15.",
  },
  {
    id: "cs-1120",
    tier: "easy",
    topic: "q2",
    universe: "supplier",
    title: "The bench above its own average",
    brief:
      "From: Supplier auditor. Re: the preferred-bench note.\n\nThe bench averages a 4.3 rating across six suppliers, and the preferred list is whoever beats the bench's own bar. Let the table grade itself with a subquery, then print the qualifiers best-first for the note.",
    ask: "List suppliers rated above the bench's average rating, best first.",
    template: `SELECT name, {1} AS grade
FROM suppliers
WHERE rating > (
  SELECT {2}(rating) FROM suppliers
)
ORDER BY rating {3};`,
    slots: [
      {
        answer: "rating",
        kind: "keyword",
        label: "the graded column",
        why: "The note prints each qualifier's grade beside its name — the projection must carry the rating column too.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bench bar",
        why: "The bar is the bench's own average: 4.3 across six suppliers. SUM would stage a 25.8 bar nobody reaches.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the best-first sort",
        why: "The note reads best-first: highest rating on top. ASC prints the same names upside down and buries the leader.",
      },
    ],
    distractors: ["'name'", "SUM", "'ASC'", "id"],
    walkthrough:
      "Three suppliers beat the bench's own 4.3: Alpine Audio GmbH at 4.8, Nordic Gadgets AB at 4.6 and Midwest Hardware Co at 4.4 — printed best-first with each grade beside its name. Sorting ASC prints the identical trio upside down and the note leads with the weakest qualifier; comparing names against a numeric bar is a type mismatch that lets every supplier through; SUM grades the bench against a 25.8 bar that clears nobody; and id in the grade seat prints internal keys instead of performance.",
  },
  {
    id: "cs-1121",
    tier: "medium",
    topic: "q2",
    universe: "funnel",
    title: "Pending tickets over the shipped pace",
    brief:
      "From: Growth lead. Re: the wait-list worry.\n\nPending is fine when the ticket is small and worrying when it is big. The shipped book moves at a 399.89-euro average — count the pending tickets that beat that pace, because those are the ones the wait actually costs.",
    ask: "Count pending orders whose total beats the shipped average.",
    template: `SELECT {1}(*) AS slow_rich
FROM orders
WHERE status = {2} AND total > (
  SELECT {3}(total) FROM orders WHERE status = 'shipped'
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wait-list counter",
        why: "The deliverable is how many pending tickets outrun the shipped pace. COUNT(*) collapses the survivors to that number.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the waiting badge",
        why: "The memo hunts waiting money: only pending tickets qualify. 'delivered' measures a book that already arrived.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the pace builder",
        why: "The shipped pace is an average — 399.89 across 30 shipped orders. MAX would stage the fastest single shipment as the bar.",
      },
    ],
    distractors: ["MAX", "'delivered'", "SUM"],
    walkthrough:
      "Five pending tickets beat the 399.89 shipped pace — big money, still waiting. Swapping the badge to 'delivered' finds 15 tickets over the same bar, a different worry entirely; staging the shipped MAX instead sets an 845.92 bar that only the two biggest pending tickets clear; and SUM builds a bar out of the whole shipped book, 11,996.72 euros high, which nothing pending can touch.",
  },
  {
    id: "cs-1122",
    tier: "medium",
    topic: "q2",
    universe: "funnel",
    title: "Every cancelled ticket under the pace",
    brief:
      "From: Growth lead. Re: the cancellation post-mortem.\n\nThe shipped book moves at 399.89 on average, and the post-mortem hypothesis is simple: cancellations are small-ticket impatience, not lost whales. Count the cancelled tickets that sit under the shipped pace — if the count is all of them, the hypothesis holds.",
    ask: "Count cancelled orders under the shipped order average.",
    template: `SELECT {1}(*) AS under_pace
FROM orders
WHERE status = {2} AND total < (
  SELECT {3}(total) FROM orders WHERE status = 'shipped'
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the hypothesis counter",
        why: "The post-mortem wants one number: how many cancellations were small tickets. COUNT(*) returns it straight.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the lost-sale badge",
        why: "The sweep is about cancellations. 'delivered' or 'pending' would measure books the hypothesis says nothing about.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the pace builder",
        why: "The pace is the shipped book's average of 399.89. MIN would stage the cheapest shipped ticket, a 32.01 bar that the post-mortem's own sweep empties.",
      },
    ],
    distractors: ["'delivered'", "'pending'", "MIN"],
    walkthrough:
      "All 7 cancelled tickets sit under the 399.89 shipped pace — the hypothesis holds: cancellations are small-ticket impatience, not lost whales. The same under-pace sweep over the delivered book counts 37 and over the pending book 9, neither of which says anything about churn; and MIN stages the cheapest shipped ticket, a 32.01 bar under which only one cancelled ticket lands.",
  },
  {
    id: "cs-1123",
    tier: "medium",
    topic: "q2",
    universe: "month-close",
    title: "Nobody at the bar",
    brief:
      "From: Billing lead. Re: the average-ticket myth.\n\nThe average invoice is a summary, not a member of the book — but the deck keeps implying a 'typical' 3,106 invoice exists. Count the invoices below the average and print the largest of them, so the deck can show the book splits 12 over and 16 under with nobody standing on the line.",
    ask: "Count invoices below the average and print the largest of them.",
    template: `SELECT {1}(*) AS below_bar,
       {2}(amount_cents) AS ceiling_below
FROM invoices
WHERE amount_cents {3} (
  SELECT AVG(amount_cents) FROM invoices
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the under-bar tally",
        why: "The first column is how many invoices sit below the average: 16 of 28. COUNT(*) tallies them.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the under-bar ceiling",
        why: "The second column shows how close the under-bar book gets: MAX reads its biggest ticket, 3,076. AVG would report the slice's own average instead.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the below-bar test",
        why: "The sweep is the under side of the average. '=' is the myth-buster — it holds nobody — and '>' flips to the 12 over the line.",
      },
    ],
    distractors: ["SUM", ">", "=", "AVG"],
    walkthrough:
      "16 invoices sit below the 3,106.32 average and the biggest of them reaches 3,076 — a hair under the line. Filling '=' proves the deck's myth: exactly 0 invoices sit AT the average, because an average of 28 distinct tickets is a summary, not a member. '>' flips the sweep to the 12 above the bar; SUM in the ceiling seat reports a book-wide sum instead of one ticket; and AVG reads the slice's own average, not its ceiling.",
  },
  {
    id: "cs-1124",
    tier: "medium",
    topic: "q2",
    universe: "catalog",
    title: "The near-average band",
    brief:
      "From: Catalog manager. Re: the middle-shelf review.\n\nThe repricing debate keeps ignoring the middle of the shelf. Define the band as everything within 20 percent below to 10 percent above the shelf average — two subqueries off the same AVG — and count the products that land in it.",
    ask: "Count products priced between 0.8x and 1.1x the shelf average.",
    template: `SELECT {1}(name) AS in_band
FROM products
WHERE price BETWEEN (
  SELECT AVG(price) * {2} FROM products
) AND (
  SELECT AVG(price) * {3} FROM products
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the band counter",
        why: "The review wants to know how deep the middle shelf runs. COUNT(*) collapses the in-band products to one number.",
      },
      {
        answer: "0.8",
        kind: "number",
        noVerify: true,
        label: "the lower multiple",
        why: "The band opens 20 percent under the average — the 0.8 multiple is a filter constant, never an output figure.",
      },
      {
        answer: "1.1",
        kind: "number",
        noVerify: true,
        label: "the upper multiple",
        why: "The band closes 10 percent over the average. Both ends hang off the same AVG, which is what makes the band self-updating.",
      },
    ],
    distractors: ["MAX", "0.9", "1.2", "SUM"],
    walkthrough:
      "The shelf averages 71.78, so the band runs 57.42 to 78.96 — and exactly 2 products land in it: the Bluetooth Speaker Mini at 59.99 and the Cycling Jersey Pro at 65. Tightening the floor to 0.9x drops the speaker and keeps 1; widening the ceiling to 1.2x lets the 79-euro band and pricier climb in; MAX or SUM cannot build a band edge at all.",
  },
  {
    id: "cs-1125",
    tier: "medium",
    topic: "q2",
    universe: "month-close",
    title: "Wires over the settlement average",
    brief:
      "From: Finance ops. Re: the month-close note.\n\nThe payment book averages 2,578.22 across 27 settlements, and the close note claims wires carry the big money. Count the wire settlements above the book's own average — the card book is the control group.",
    ask: "Count wire payments above the payment book's average.",
    template: `SELECT {1}(*) AS big_wires
FROM payments
WHERE method = {2} AND amount_cents > (
  SELECT {3}(amount_cents) FROM payments
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the wire counter",
        why: "The note needs one figure: wires above the book average. COUNT(*) returns it.",
      },
      {
        answer: "'wire'",
        kind: "keyword",
        label: "the wire badge",
        why: "The claim is about wires specifically. 'card' measures the control group — and the control group tells a different story.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the book average",
        why: "The bar is the whole payment book's average — 2,578.22 across both methods. MAX would stage the biggest single settlement as the bar.",
      },
    ],
    distractors: ["'card'", "MAX", "SUM"],
    walkthrough:
      "7 of the 11 wire settlements clear the 2,578.22 book average — the close note's claim holds up. The card book is the control: only 5 of its 16 settlements clear the same bar, so wires genuinely skew big. MAX stages the largest settlement as the bar and nothing beats it; SUM builds a bar out of the entire book's total, which no single payment clears.",
  },
  {
    id: "cs-1126",
    tier: "hard",
    topic: "q2",
    universe: "month-close",
    title: "The open book vs the paid benchmark",
    brief:
      "From: Billing lead. Re: the open-book risk note.\n\nThe paid book is the benchmark: it settles at 3,163.95 on average. The risk note asks how much of the OPEN book already clears what the paid book considers normal — stage the paid average as a scalar and count the open tickets over it.",
    ask: "Count open invoices above the paid book's average.",
    template: `SELECT {1}(*) AS open_above_paid
FROM invoices
WHERE status = {2} AND amount_cents > (
  SELECT {3}(amount_cents) FROM invoices WHERE status = 'paid'
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the risk tally",
        why: "The note wants one figure: open tickets already past the paid benchmark. COUNT(*) returns it.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the unsettled badge",
        why: "The sweep runs over the unsettled book. 'void' would sweep a one-invoice graveyard and count nothing.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the benchmark builder",
        why: "The benchmark is the paid book's average, 3,163.95 — not the storewide 3,106.32. The WHERE inside the subquery is what scopes it.",
      },
    ],
    distractors: ["'void'", "MAX", "SUM"],
    walkthrough:
      "3 open invoices already clear the paid book's 3,163.95 average — the risk note's headline. The bar is deliberately the PAID average, not the storewide 3,106.32: same neighborhood, different denominator. Sweeping the void book instead finds nothing — the single void invoice sits at 925, far under the bar; MAX stages the paid book's biggest settlement as the benchmark, a bar only a whale clears; and SUM builds a benchmark no invoice can clear.",
  },
  {
    id: "cs-1127",
    tier: "hard",
    topic: "q2",
    universe: "funnel",
    title: "The runner-up bar",
    brief:
      "From: Growth lead. Re: the whale-share note.\n\nThe deck's biggest order cleared at 1,088.44 and the runner-up at 945.21 — nothing in between. The whale-share note wants the count of orders strictly above the runner-up total, staged as a sorted scalar with an OFFSET, not a hand-typed literal.",
    ask: "Count orders whose total beats the runner-up order total.",
    template: `SELECT {1}(*) AS above_runner_up
FROM orders
WHERE total > (
  SELECT total FROM orders
  ORDER BY total {2}
  LIMIT 1 OFFSET {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the whale counter",
        why: "The note wants to know how many tickets live above the runner-up bar. COUNT(*) returns the count — here, exactly one.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the top-down sort",
        why: "The runner-up is found from the top: sort DESC, skip one. ASC would find the second-cheapest ticket and the bar collapses to pocket change.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the skip count",
        why: "OFFSET 1 skips the champion itself, leaving the runner-up as the scalar. The skip is part of the staging, never an output figure.",
      },
    ],
    distractors: ["'ASC'", "0", "2", "SUM"],
    walkthrough:
      "The runner-up bar sits at 945.21, and exactly 1 order clears it: the 1,088.44 champion itself — the whale owns the top alone. Sorting ASC instead stages the second-cheapest ticket, a 30.24 bar that 101 orders clear; OFFSET 0 stages the champion's own total, which nothing strictly exceeds; OFFSET 2 drops the bar to third place at 845.92 and both big tickets clear it; and SUM cannot run a sorted scan at all.",
  },
  {
    id: "cs-1128",
    tier: "hard",
    topic: "q2",
    universe: "expense",
    title: "Half the ceiling",
    brief:
      "From: Spend analyst. Re: the ceiling screen.\n\nThe ledger's biggest claim is the 1,680-euro Skyline trip, and the ceiling screen asks how much of the book lives above half that. Stage the MAX inside the subquery, halve it in the scalar, and count the claims that clear the halfway mark.",
    ask: "Count expenses above half the biggest claim.",
    template: `SELECT {1}(*) AS half_ceiling
FROM expenses
WHERE amount_cents > (
  SELECT {2}(amount_cents) / {3} FROM expenses
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the screen tally",
        why: "The screen reports how many claims live above the halfway mark. COUNT(*) returns the tally.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling reader",
        why: "The anchor is the ledger's biggest claim — 1,680 euros. AVG would anchor on the 706-euro typical line and the screen becomes a different question.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the halving divisor",
        why: "Half the ceiling is the bar: the divisor is part of the staging arithmetic, never an output figure.",
      },
    ],
    distractors: ["SUM", "AVG", "4"],
    walkthrough:
      "Half the 1,680-euro ceiling is an 840-euro bar, and 15 claims clear it — Atlas's fourteen 1,200-euro rents plus the 1,680 trip itself. Anchoring on the 706-euro average halves to 353 and lets 22 claims through, a looser screen; a divisor of 4 drops the bar to 420 and catches 17; and SUM stages half of the whole book's 25,416-euro total, which nothing singly clears.",
  },
  {
    id: "cs-1129",
    tier: "hard",
    topic: "q2",
    universe: "catalog",
    title: "Under half the ceiling",
    brief:
      "From: Catalog manager. Re: the entry-shelf audit.\n\nThe catalog's ceiling is the 199.99 Smart Watch S, and the entry shelf is everything under half that. Stage the ceiling as a scalar, halve it, and count the products that keep the entry shelf stocked — the count IS the shelf's depth.",
    ask: "Count products priced under half the catalog ceiling.",
    template: `SELECT {1}(*) AS under_half
FROM products
WHERE price < (
  SELECT {2}(price) / {3} FROM products
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf depth",
        why: "The audit reads the entry shelf's depth as a single number. COUNT(*) tallies the products under the bar.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling reader",
        why: "The anchor is the catalog's most expensive product — 199.99. MIN would anchor on the 14.99 floor and the audit counts nothing.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the halving divisor",
        why: "Half the ceiling defines the entry shelf: the divisor is staging arithmetic, never an output figure.",
      },
    ],
    distractors: ["MIN", "AVG", "3"],
    walkthrough:
      "Half the 199.99 ceiling draws the entry line at 99.99, and 12 of the 16 products stock the shelf beneath it. Anchoring on the 14.99 floor instead halves to 7.5 and the audit finds nothing — floors make poor ceilings; anchoring on the 71.78 average halves to 35.89 and counts only the budget tail; a divisor of 3 lifts the line to 66.66 and thins the shelf.",
  },
  {
    id: "cs-1130",
    tier: "hard",
    topic: "q2",
    universe: "refund-audit",
    title: "The void yardstick",
    brief:
      "From: Billing lead. Re: the void-invoice post-mortem.\n\nExactly one invoice in the book was voided, at 925 euros, and the post-mortem wants it used as a yardstick: how much of the book bills above a voided mistake? Compare against the void ticket's own amount — the scalar is a single row, not an aggregate.",
    ask: "Count invoices above the void invoice's amount.",
    template: `SELECT {1}(*) AS over_void
FROM invoices
WHERE {2} > (
  SELECT amount_cents FROM invoices WHERE status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the yardstick tally",
        why: "The post-mortem wants how many invoices bill above the voided mistake. COUNT(*) returns it.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the compared column",
        why: "The yardstick compares billing amounts: the outer column must be the same cents column the void ticket carries.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "the yardstick badge",
        why: "The scalar anchors on the voided invoice — the book's one void row. Any other status stages a different ticket as the yardstick.",
      },
    ],
    distractors: ["SUM", "MAX", "'id'", "'status'"],
    walkthrough:
      "26 of the 28 invoices bill above the voided 925 — the mistake was small money, and only one invoice bills beneath it. Comparing ids instead of amounts asks which invoices are numbered above the void's position in the book, a different question with a different answer; comparing the text status column against a number is a type confusion SQLite quietly resolves the wrong way; and SUM or MAX cannot fetch one voided ticket's amount — the scalar needs the column itself.",
  },
  {
    id: "cs-1131",
    tier: "easy",
    topic: "q3",
    universe: "month-close",
    title: "The paid-invoice roll call",
    brief:
      "From: Billing lead. Re: the settled-account list.\n\nThe close needs the roll call of customers with at least one settled invoice — not how many they settled, just whether they appear in the paid book at all. An EXISTS probe answers presence without counting a single invoice twice.",
    ask: "Count customers with at least one paid invoice.",
    template: `SELECT {1}(*) AS payers
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM invoices i
  WHERE i.customer_id = {2} AND i.status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the roll-call tally",
        why: "The deliverable is how many customers appear in the paid book. COUNT(*) collapses the surviving customers to that number.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the correlated key",
        why: "The probe must ask: does an invoice exist for THIS customer? c.id is the outer row's key reaching into the inner query.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled badge",
        why: "The roll call is the paid book. 'void' probes the book's one mistake instead and finds a single account.",
      },
    ],
    distractors: ["SUM", "'void'", "'c.customer_id'"],
    walkthrough:
      "8 customers hold at least one paid invoice — that is the settled roll call. EXISTS checks presence only: a customer with five settlements counts once, exactly what a roll call wants. Probing the void book instead finds the lone mistake; c.customer_id is a column invoices never had, so the probe crashes; and SUM(*) cannot run an existence test.",
  },
  {
    id: "cs-1132",
    tier: "easy",
    topic: "q3",
    universe: "funnel",
    title: "The Pacific shippers",
    brief:
      "From: Growth lead. Re: the regional fulfillment note.\n\nThe APAC chapter is small, and the note wants to know who in it has actually reached the shipped stage — presence of a shipment, not a count of boxes. Probe the shipped book with an EXISTS and gate the chapter up front.",
    ask: "Count APAC customers with at least one shipped order.",
    template: `SELECT {1}(*) AS pacific_shippers
FROM customers
WHERE region = {2} AND EXISTS (
  SELECT 1 FROM orders WHERE customer_id = customers.id AND status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chapter tally",
        why: "The note wants one headcount for the APAC shippers. COUNT(*) reduces the surviving chapter members to it.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the chapter gate",
        why: "The sweep is scoped to the APAC chapter before the probe runs. 'EU' grades a different, bigger chapter.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the shipment badge",
        why: "The milestone is the shipped stage. 'delivered' probes the later stage of the funnel and a different club.",
      },
    ],
    distractors: ["SUM", "'EU'", "'delivered'"],
    walkthrough:
      "3 of the 5 APAC accounts have reached the shipped stage — the chapter's fulfillment footprint. Gating on 'EU' instead finds 5 shippers in the home region, twice the story; probing 'delivered' asks who finished the journey rather than who started the shipment; and SUM(*) is not an existence test — it has no boolean to offer.",
  },
  {
    id: "cs-1133",
    tier: "medium",
    topic: "q3",
    universe: "month-close",
    title: "Settled and clean",
    brief:
      "From: Billing lead. Re: the gold-standard list.\n\nThe best kind of account is one that has settled before AND carries nothing open right now. That is two probes crossing: an EXISTS into the paid book and a NOT EXISTS into the open book. Count the accounts that pass both gates.",
    ask: "Count customers with a paid invoice and no open invoice.",
    template: `SELECT {1}(*) AS settled_clean
FROM customers c
WHERE {2} (
  SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = 'paid'
) AND NOT EXISTS (
  SELECT 1 FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the gold-standard tally",
        why: "Two gates cross into one list, and the close wants its size. COUNT(*) counts the accounts passing both.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the settled gate",
        why: "The first gate demands proof of settlement: at least one paid invoice must exist. NOT here would invert it to no-history accounts.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the clean gate",
        why: "The second gate is the absence test: no open invoice may exist. Probing 'void' instead tests for a mistake nobody repeats.",
      },
    ],
    distractors: ["SUM", "'void'", "'cancelled'"],
    walkthrough:
      "5 customers have settled at least once and carry nothing open — the gold-standard list. Dropping the void probe into the second gate widens the list to the 8 paid holders with no voided mistake; probing 'cancelled' — a status orders have and invoices never do — makes the second gate vacuous and the list collapses to the whole paid club; and SUM(*) cannot gate anything.",
  },
  {
    id: "cs-1134",
    tier: "medium",
    topic: "q3",
    universe: "growth",
    title: "The clean-record club",
    brief:
      "From: Growth lead. Re: the churn-risk screen.\n\nFour accounts have a cancellation on record; everyone else has never backed out of a sale. The retention team wants the clean-record club sized — an absence test, which is precisely what NOT EXISTS exists for.",
    ask: "Count customers with no cancelled order.",
    template: `SELECT {1}(*) AS clean_records
FROM customers c
WHERE NOT {2} (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the club tally",
        why: "The screen reports how many accounts have never cancelled. COUNT(*) returns that size.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the presence probe",
        why: "NOT EXISTS reads: no proof of a cancelled order exists. Dropping NOT turns the absence test into a membership test.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the blemish badge",
        why: "The blemish being screened out is the cancelled order. Probing 'shipped' would screen out the store's best customers instead.",
      },
    ],
    distractors: ["SUM", "'shipped'", "EXISTS"],
    walkthrough:
      "12 of the 16 customers have never cancelled an order — the clean-record club. Probing 'shipped' instead inverts the story: 6 customers have never shipped, and the club becomes a no-activity list; swapping NOT EXISTS to EXISTS counts the 4 blemished accounts, the exact complement; and SUM(*) offers no boolean.",
  },
  {
    id: "cs-1135",
    tier: "medium",
    topic: "q3",
    universe: "expense",
    title: "Vendors with a four-figure claim",
    brief:
      "From: Spend analyst. Re: the big-ticket vendor list.\n\nThe ledger holds 36 lines across 4 vendors, and the review wants the vendors with at least one four-figure claim — presence of a big line, deduplicated down to names. One correlated EXISTS per vendor row, DISTINCT to finish.",
    ask: "List vendors with at least one expense above 1000 euros.",
    template: `SELECT DISTINCT {1}
FROM expenses e
WHERE {2} (
  SELECT 1 FROM expenses e2
  WHERE e2.vendor = e.vendor AND e2.amount_cents > {3}
);`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the name column",
        why: "The deliverable is vendor names, deduplicated. DISTINCT collapses each qualifying vendor's many lines to one row.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the presence probe",
        why: "The test is whether a big line exists for this vendor — not how many. NOT EXISTS would list vendors whose every line is small.",
      },
      {
        answer: "100000",
        kind: "number",
        noVerify: true,
        label: "the four-figure bar, in cents",
        why: "1000 euros is 100000 cents in the ledger's storage. The bar is a filter constant and never appears in the output cells.",
      },
    ],
    distractors: ["category", "'NOT EXISTS'", "200000"],
    walkthrough:
      "Two vendors have crossed four figures: Atlas Property with its 1,200-euro rents and Skyline Travel with the 1,680-euro trip. Inverting to NOT EXISTS lists the complement — AdWorks and DevTools, vendors whose biggest line stays under the bar; lifting the bar to 2,000 euros keeps only Skyline; and projecting category prints the shelf names Rent and Travel instead of the vendors behind them.",
  },
  {
    id: "cs-1136",
    tier: "medium",
    topic: "q3",
    universe: "funnel",
    title: "Holding both ends of the pipeline",
    brief:
      "From: Growth lead. Re: the pipeline health check.\n\nA healthy account both has money in flight (pending) and money moving (shipped). Customers holding only one end of the pipeline are one-dimensional. Cross two EXISTS probes — one per status — and count the accounts that hold both ends.",
    ask: "Count customers with both a pending and a shipped order.",
    template: `SELECT {1}(*) AS pipeline_holders
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending'
) AND {2} (
  SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the both-ends tally",
        why: "The health check wants one number: accounts holding both pipeline ends. COUNT(*) returns it.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the moving gate",
        why: "The second gate demands a shipped order exists. NOT EXISTS would demand its absence — customers stuck pending with nothing moving.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the moving badge",
        why: "The other pipeline end is the shipped stage. 'delivered' measures a later milestone and a different intersection.",
      },
    ],
    distractors: ["SUM", "'NOT EXISTS'", "'delivered'"],
    walkthrough:
      "5 customers hold both ends: at least one pending ticket AND at least one shipped one. Flipping the second gate to NOT EXISTS finds the stuck 3 — pending money with nothing moving; probing 'delivered' instead widens the intersection to 8 accounts; and SUM(*) cannot cross two gates.",
  },
  {
    id: "cs-1137",
    tier: "hard",
    topic: "q3",
    universe: "growth",
    title: "The gadget club, probed",
    brief:
      "From: Lifecycle marketer. Re: the audience file, take two.\n\nThe Wearables club was built with membership chains last quarter. This pass rebuilds it with a single EXISTS probe that joins orders to line items to catalog inside the subquery — one probe, presence only, the same 12 faces or a bug.",
    ask: "Count customers whose orders include the Wearables product.",
    template: `SELECT {1}(*) AS gadget_club
FROM customers
WHERE {2} (
  SELECT 1 FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.customer_id = customers.id AND p.category = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the club tally",
        why: "The audience file needs one headcount. COUNT(*) collapses the surviving customers to it.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the presence probe",
        why: "The club is defined by the existence of one qualifying basket — presence, not count. NOT EXISTS lists the 4 who never crossed over.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the gadget literal",
        why: "The shelf spelling must match the catalog exactly — the inner joins do the chaining, the literal does the naming.",
      },
    ],
    distractors: ["SUM", "'NOT EXISTS'", "'Fitness'"],
    walkthrough:
      "12 customers have at least one basket containing the Wearables product — the same club the IN-chain built, one probe shallower. Inverting to NOT EXISTS lists the 4 holdouts who never bought the gadget; probing the Fitness shelf sizes the yoga-crossell club at 7 instead; and SUM(*) cannot judge existence.",
  },
  {
    id: "cs-1138",
    tier: "hard",
    topic: "q3",
    universe: "fraud",
    title: "The parked-pair probe",
    brief:
      "From: Fraud analyst. Re: the cross-ledger probe, EXISTS edition.\n\nThe cent-collision sweep ran with IN last time; this pass rebuilds it as a correlated EXISTS — and the trap moves into the correlation itself. Qualify the outer column, or the inner query eats its own tail and matches every line in the ledger.",
    ask: "Count expenses whose amount matches an invoice amount, via EXISTS.",
    template: `SELECT {1}(*) AS parked
FROM expenses
WHERE {2} (
  SELECT 1 FROM invoices i
  WHERE i.amount_cents = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the collision tally",
        why: "The probe reports how many expense lines have an invoice twin. COUNT(*) returns that number — here, zero.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the twin probe",
        why: "The test is whether a matching invoice exists for this line. NOT EXISTS would sweep the disjoint complement instead.",
      },
      {
        answer: "expenses.amount_cents",
        kind: "keyword",
        label: "the qualified outer column",
        why: "The correlation must reach outward: expenses.amount_cents names the outer row's amount. Unqualified, the name binds to the inner invoices column and the probe degenerates.",
      },
    ],
    distractors: ["NOT EXISTS", "amount_cents", "i.amount_cents"],
    walkthrough:
      "Zero expense lines find an invoice twin at cent granularity — the honest headline, again, now via EXISTS. The trap lives in slot three: an unqualified amount_cents — or i.amount_cents outright — resolves to the INVOICE's own column, turning the correlation into a tautology that matches all 36 lines and buries the finding. Only the table-qualified expenses.amount_cents reaches outward; and NOT EXISTS sweeps the 36 unmatched lines, the complement of the answer.",
  },
  {
    id: "cs-1139",
    tier: "hard",
    topic: "q3",
    universe: "funnel",
    title: "Everyone beats the average",
    brief:
      "From: Growth lead. Re: the pace paradox.\n\nHere is a paradox worth a slide: probe every customer for at least one order above the storewide average, and the club turns out to be everyone. The mean sits below every single customer's peak — the sweep proves it, and the zero on the other side is the punchline.",
    ask: "Count customers with at least one order above the storewide average.",
    template: `SELECT {1}(*) AS pace_beaters
FROM customers
WHERE {2} (
  SELECT 1 FROM orders
  WHERE customer_id = customers.id
    AND total > (SELECT {3}(total) FROM orders)
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the paradox tally",
        why: "The slide claims the club is everyone — the tally has to prove it. COUNT(*) returns the sweep's size.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the peak probe",
        why: "The test is whether one above-average order exists per customer. NOT EXISTS would count customers whose every order sits below the mean.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the paradox bar",
        why: "The bar is the storewide average, 338.19. MAX would stage the 1,088.44 champion ticket — a bar nothing strictly exceeds.",
      },
    ],
    distractors: ["SUM", "'NOT EXISTS'", "MAX"],
    walkthrough:
      "All 16 customers hold at least one order above the 338.19 storewide average — the mean, pulled by extremes, sits below every customer's best day. The punchline is the complement: NOT EXISTS finds 0 customers entirely below the pace. Staging MAX as the bar asks who beats the single biggest ticket, and nobody does; and SUM(*) cannot build a bar at all.",
  },
  {
    id: "cs-1140",
    tier: "hard",
    topic: "q3",
    universe: "month-close",
    title: "The open-and-void overlap",
    brief:
      "From: Billing lead. Re: the anomaly hunt.\n\nOne invoice in the book was voided, and the anomaly hunt asks: does the account that voided also carry open money? Two probes cross — an EXISTS for the open book and one for the void book — and the intersection should be exactly one account, or the ledger lies.",
    ask: "Count customers with both an open and a void invoice.",
    template: `SELECT {1}(*) AS both_worlds
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM invoices i WHERE i.customer_id = c.id AND i.status = {2}
) AND {3} (
  SELECT 1 FROM invoices i2 WHERE i2.customer_id = c.id AND i2.status = 'void'
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the anomaly tally",
        why: "The hunt expects exactly one account in the overlap. COUNT(*) returns the intersection's size.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the open gate",
        why: "The first probe asks for open money in flight. 'paid' probes the settled book — and no settled account holds a void.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the void gate",
        why: "The second gate demands the void exists. NOT EXISTS would ask for open money with NO void — five accounts, a different list.",
      },
    ],
    distractors: ["SUM", "'paid'", "'NOT EXISTS'"],
    walkthrough:
      "Exactly 1 customer holds both an open invoice and the book's single void — the anomaly the hunt predicted. Probing 'paid' instead finds nothing: all 8 settled accounts are void-free, so the settled-and-void intersection is empty; flipping the void gate to NOT EXISTS lists the 5 open holders with clean records; and SUM(*) cannot cross gates.",
  },
  {
    id: "cs-1141",
    tier: "easy",
    topic: "q4",
    universe: "catalog",
    title: "Above their own supplier's bench",
    brief:
      "From: Catalog manager. Re: the supplier-bench review.\n\nEach supplier prices a bench of products, and some products sit above their OWN supplier's typical price. The comparison moves row by row — each product against its supplier's average — which is the definition of a correlated subquery.",
    ask: "Count products priced above their own supplier's average.",
    template: `SELECT {1}(name) AS over_own_bench
FROM products p
WHERE price > (
  SELECT {2}(price) FROM products p2
  WHERE p2.supplier_id = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench tally",
        why: "The review wants how many products outrun their own bench. COUNT(*) returns that count.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bench builder",
        why: "Each supplier's typical price is an average over their products. MAX would compare against the supplier's ceiling instead.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner bench must be the OUTER row's supplier: p.supplier_id reaches outward. p.id reaches for the product's own id and builds the wrong bench.",
      },
    ],
    distractors: ["MAX", "MIN", "'p.id'"],
    walkthrough:
      "8 of the 16 products price above their own supplier's average — the premium end of each bench. Correlating on p.id instead matches supplier ids against product ids and builds accidental benches, keeping 4; comparing against each bench's MIN lets nearly everything through; and MAX turns every bench into its own ceiling, which nothing beats.",
  },
  {
    id: "cs-1142",
    tier: "easy",
    topic: "q4",
    universe: "funnel",
    title: "Pace-setters at 300",
    brief:
      "From: Growth lead. Re: the habituation metric.\n\nA customer's habit is their AVERAGE order, not their biggest one. Count the customers whose typical ticket clears 300 euros — the correlation collapses each customer's orders to one number before the comparison runs.",
    ask: "Count customers whose average order tops 300 euros.",
    template: `SELECT {1}(*) AS pace_setters
FROM customers c
WHERE (
  SELECT {2}(total) FROM orders WHERE customer_id = {3}
) > 300;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the habituation tally",
        why: "The metric wants one headcount of habituated customers. COUNT(*) returns it.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the habit builder",
        why: "A customer's typical ticket is the average of their orders. MAX would grade everyone by their best day.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner collapse must read THIS customer's orders: c.id reaches outward for each row's key.",
      },
    ],
    distractors: ["MAX", "SUM", "400"],
    walkthrough:
      "10 customers average more than 300 euros an order — the habituated base. Grading by best day instead (MAX) lets all 16 through, since every customer's peak clears the bar; grading by lifetime spend (SUM) measures wallet size, not habit; lifting the bar to 400 thins the list to 6.",
  },
  {
    id: "cs-1143",
    tier: "easy",
    topic: "q4",
    universe: "month-close",
    title: "Above their own account average",
    brief:
      "From: Billing lead. Re: the per-account upsell flag.\n\nAn invoice can be big in absolute terms yet normal for its account. The flag fires when an invoice beats its OWN customer's average — a comparison that must slide from invoice to invoice, which only a correlated subquery does.",
    ask: "Count invoices above their own customer's average invoice.",
    template: `SELECT {1}(*) AS above_own_book
FROM invoices i
WHERE amount_cents > (
  SELECT {2}(amount_cents) FROM invoices WHERE customer_id = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the flag tally",
        why: "The flag list's size is the deliverable. COUNT(*) counts the invoices beating their own account's norm.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the account norm",
        why: "The norm is the customer's average invoice. MAX would flag only invoices above the account's all-time high — an impossible bar.",
      },
      {
        answer: "i.customer_id",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner average must be THIS invoice's customer: i.customer_id reaches outward. i.id would compare the account key against the invoice's own id.",
      },
    ],
    distractors: ["MAX", "'i.id'", "'status'"],
    walkthrough:
      "11 invoices bill above their own account's norm — the upsell flag fires 11 times. Correlating on i.id instead keys accounts against invoice ids and mis-matches the book; averaging the status column turns the norm into 0.0 and flags everything; and MAX stages each account's personal best, a bar its own holder can never strictly beat.",
  },
  {
    id: "cs-1144",
    tier: "easy",
    topic: "q4",
    universe: "funnel",
    title: "Personal-best tickets",
    brief:
      "From: Growth lead. Re: the best-day count.\n\nEvery order either beats its owner's typical ticket or it doesn't. Count the orders that clear THEIR OWN customer's average — 103 tickets, each graded against a different bar.",
    ask: "Count orders above their own customer's order average.",
    template: `SELECT {1}(*) AS personal_bests
FROM orders o
WHERE total > (
  SELECT {2}(total) FROM orders WHERE customer_id = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the best-day tally",
        why: "The deliverable is how many tickets beat their owner's norm. COUNT(*) tallies them across all 103.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the owner's norm",
        why: "Each owner's bar is their average order. MIN would grade against the owner's worst day and let nearly everything through.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner bar must belong to THIS order's owner: o.customer_id reaches outward per row.",
      },
    ],
    distractors: ["MAX", "MIN", "'o.id'"],
    walkthrough:
      "45 of the 103 orders beat their own customer's average — 45 personal-best tickets across the book. Correlating on o.id instead compares the owner key against the ticket's own id and scrambles the grading; grading against each owner's MIN makes the bar the worst day and nearly every ticket passes; grading against MAX makes it the best day and nothing strictly clears it.",
  },
  {
    id: "cs-1145",
    tier: "easy",
    topic: "q4",
    universe: "expense",
    title: "Above their own vendor's norm",
    brief:
      "From: Spend analyst. Re: the vendor-relative screen.\n\nA 450-euro line is huge for AdWorks and routine for Atlas. The screen flags expense lines above THEIR OWN vendor's average — each line judged by its vendor's norm, not the ledger's.",
    ask: "Count expenses above their own vendor's average line.",
    template: `SELECT {1}(*) AS above_own_vendor
FROM expenses e
WHERE amount_cents > (
  SELECT {2}(amount_cents) FROM expenses e2 WHERE e2.vendor = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the flag tally",
        why: "The screen's deliverable is how many lines beat their vendor's norm. COUNT(*) returns it.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the vendor norm",
        why: "Each vendor's norm is the average of their lines. MIN would grade against the vendor's smallest claim.",
      },
      {
        answer: "e.vendor",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner norm must be THIS line's vendor: e.vendor reaches outward. Matching vendor against category would find vendors named 'Rent'.",
      },
    ],
    distractors: ["MIN", "MAX", "'e.category'"],
    walkthrough:
      "9 expense lines sit above their own vendor's average — vendor-relative outliers the ledger-wide average would miss. Correlating vendor against category matches nobody (no vendor is named 'Rent') and empties the screen; grading against vendor MAXs makes every bar unbeatable; grading against vendor MINs lets 16 lines through, Atlas's flat-rent book contributing none of them.",
  },
  {
    id: "cs-1146",
    tier: "hard",
    topic: "q4",
    universe: "month-close",
    title: "The invoice-ledger test",
    brief:
      "From: Billing lead. Re: the unit-alignment audit.\n\nInvoices store cents; orders store euros. Comparing a customer's biggest invoice against their biggest order means aligning units first — a hundredfold factor. Count the customers whose invoice ceiling outweighs a hundred of their biggest order, straight across the ledgers.",
    ask: "Count customers whose top invoice exceeds 100x their top order.",
    template: `SELECT {1}(*) AS invoice_ledgers
FROM customers c
WHERE (
  SELECT MAX(amount_cents) FROM invoices WHERE customer_id = c.id
) > {2} * (
  SELECT {3}(total) FROM orders WHERE customer_id = c.id
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audit tally",
        why: "The audit wants how many customers carry an invoice ceiling that dwarfs their order ceiling. COUNT(*) returns it.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the unit factor",
        why: "Cents versus euros is a hundredfold gap: the factor aligns the two ledgers before the comparison. It never appears in the output.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the order ceiling",
        why: "The right side stages the customer's biggest order in euros. SUM would stack the whole order book against one invoice.",
      },
    ],
    distractors: ["SUM", "200", "500"],
    walkthrough:
      "11 customers hold an invoice ceiling that outweighs a hundred of their biggest order — once the units align, the invoice book towers over the order book for most accounts. Replacing the order ceiling with the order book's SUM drops the count to 6: for heavy orderers, lifetime spend outweighs any single invoice; lifting the factor to 200 or 500 thins the club to 9 and 6; and the factor itself is unit alignment, not a figure.",
  },
  {
    id: "cs-1147",
    tier: "medium",
    topic: "q4",
    universe: "supplier",
    title: "The wide-bench suppliers",
    brief:
      "From: Supplier auditor. Re: the bench-width note.\n\nBench depth matters: a supplier stocking more than two products can absorb a stockout. Count each supplier's products with a correlated COUNT and keep the ones whose bench runs deeper than two.",
    ask: "Count suppliers stocking more than two products.",
    template: `SELECT name
FROM suppliers s
WHERE {1} < (
  SELECT {2}(*) FROM products WHERE supplier_id = {3}
);`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the depth bar",
        why: "More than two products makes a bench wide. The bar is a constant of the policy, never an output figure.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench counter",
        why: "The inner query counts THIS supplier's products — the correlation keys the count to the outer row.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner count must be THIS supplier's bench: s.id reaches outward. s.rating would look for products stocked by a 4.8 rating.",
      },
    ],
    distractors: ["3", "MIN", "rating"],
    walkthrough:
      "4 of the 6 suppliers stock more than two products — Nordic Gadgets, Midwest Hardware, Shenzhen Electro and Pacific Textiles, three products apiece; Alpine Audio and Andes Naturals run two-product benches and sit out. Lifting the bar to 3 empties the list, since nobody stocks four; keying the count to the supplier's rating matches no product row and finds nobody; and MIN grades benches by price floor instead of depth.",
  },
  {
    id: "cs-1148",
    tier: "medium",
    topic: "q4",
    universe: "funnel",
    title: "Outshipping Maya's four",
    brief:
      "From: Growth lead. Re: the fulfillment leaderboard.\n\nMaya Patel has had 4 orders reach the shipped stage — the leaderboard bar. Count the customers whose shipped count strictly beats hers, correlating each customer's shipped tally against the bar one row at a time.",
    ask: "Count customers with more shipped orders than Maya's 4.",
    template: `SELECT {1}(*) AS ship_heavy
FROM customers c
WHERE (
  SELECT COUNT(*) FROM orders
  WHERE customer_id = c.id AND status = {2}
) > {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the leaderboard tally",
        why: "The leaderboard wants the size of the club outshipping Maya. COUNT(*) returns it.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the milestone badge",
        why: "The leaderboard ranks the shipped stage. 'delivered' ranks the later milestone and crowns a different trio.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the bar to beat",
        why: "Maya's four shipped orders set the bar. The number is a leaderboard constant, never an output figure.",
      },
    ],
    distractors: ["'delivered'", "SUM", "3"],
    walkthrough:
      "2 customers outship Maya's four: the two workhorses with heavier shipped tallies. Switching the milestone to 'delivered' finds 3 customers above the same bar — a different podium entirely; lowering the bar to 3 admits Maya herself and widens the club to 3; and SUM in the counter seat adds order totals where counts belong.",
  },
  {
    id: "cs-1149",
    tier: "hard",
    topic: "q4",
    universe: "expense",
    title: "Vendors above the ledger's line",
    brief:
      "From: Spend analyst. Re: the vendor-tier cut.\n\nThe ledger's typical line is 706 euros. Which vendors bill above that norm ON AVERAGE — their whole book, not one lucky claim? Correlate each vendor row to its own average and keep the ones clearing the ledger line.",
    ask: "List vendors whose average line tops the ledger average.",
    template: `SELECT DISTINCT {1}
FROM expenses e
WHERE (
  SELECT {2}(amount_cents) FROM expenses e2 WHERE e2.vendor = {3}
) > (SELECT AVG(amount_cents) FROM expenses);`,
    slots: [
      {
        answer: "vendor",
        kind: "keyword",
        label: "the tier name",
        why: "The tier is a list of vendor names, deduplicated. DISTINCT collapses each qualifying vendor to one row.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the vendor's own line",
        why: "The vendor's book is graded by its AVERAGE line. MIN would grade Atlas by its smallest claim and drop the tier to one.",
      },
      {
        answer: "e.vendor",
        kind: "keyword",
        label: "the correlated key",
        why: "The inner average must be THIS row's vendor: e.vendor reaches outward. e.category would look for vendors named 'Rent'.",
      },
    ],
    distractors: ["MIN", "SUM", "'e.category'"],
    walkthrough:
      "Two vendors average above the ledger's 706-euro line: Atlas Property at 1,200 a claim and Skyline Travel at 840. Correlating on e.category matches nobody — no vendor bills under the name 'Rent' — and empties the tier; grading Atlas by MIN (its every claim is the same 1,200 rent, but Skyline's smallest line is 389) drops Skyline and cuts the tier to one; SUM measures lifetime spend, not the typical line.",
  },
  {
    id: "cs-1150",
    tier: "hard",
    topic: "q4",
    universe: "month-close",
    title: "At their personal best",
    brief:
      "From: Billing lead. Re: the ceiling-holders note.\n\nEvery account has an invoice ceiling — its largest bill. Some invoices ARE that ceiling: the account's biggest bill is standing right now. Count them with a self-correlated comparison, greater-or-equal, because the ceiling includes itself.",
    ask: "Count invoices that match their own customer's largest invoice.",
    template: `SELECT {1}(*) AS at_personal_best
FROM invoices i
WHERE amount_cents >= (
  SELECT {2}(amount_cents) FROM invoices WHERE customer_id = {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ceiling tally",
        why: "The note wants how many invoices stand at their account's ceiling. COUNT(*) returns it.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the personal best",
        why: "The bar is the customer's largest invoice — MAX. AVG would stage the account's typical bill and flag half the book.",
      },
      {
        answer: "i.customer_id",
        kind: "keyword",
        label: "the correlated key",
        why: "The bar must be THIS invoice's account: i.customer_id reaches outward. i.id would key accounts against invoice numbers.",
      },
    ],
    distractors: ["AVG", "MIN", "'i.id'"],
    walkthrough:
      "11 invoices stand at their own account's ceiling — for single-invoice accounts that is trivially the invoice itself, for multi-invoice accounts it is the genuine personal best. The >= matters: with strict >, every ceiling-holder would exclude itself and the count collapses to zero. Grading against AVG flags 14 invoices above their account's norm; grading against MIN passes the whole book; and i.id scrambles the account keys.",
  },
];
