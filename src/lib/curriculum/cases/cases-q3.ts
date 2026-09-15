// Case batch Q3 — Module 4 (subqueries & CTEs) cases cs-1001…cs-1050, wave 3.
// 50 cases: 17 easy / 17 medium / 16 hard across topics q1 (IN subqueries) ×15,
// q2 (scalar subqueries) ×15, q3 (EXISTS tests) ×10, q4 (correlated) ×10 —
// the deepening pass over wave 1's ground: new figures, harder shapes
// (row-value IN over aggregates, 4-hop IN chains, nested scalars, IS NULL
// scalar guards, uncorrelated-EXISTS traps).
// Every figure was probed against the live seed db (scripts/m4-cases-w3-facts.ts
// V01–V62 + w3b/w3c/w3d/w3e supplements S/T/U/Z) and is mechanically
// re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesQ3: CaseStudy[] = [
  {
    id: "cs-1001",
    tier: "easy",
    topic: "q1",
    universe: "funnel",
    title: "The one-product club",
    brief:
      "From: Lifecycle marketer. Re: yoga-crossell test.\n\nOur Fitness line is a single hero product, and I want the audience who has actually bought it — not impressions, not clicks, real baskets. Chain the membership tests through the order detail and give me the headcount for the audience builder.",
    ask: "Count customers whose orders include the Fitness product.",
    template: `SELECT {3}(*) AS fitness_buyers
FROM customers
WHERE id IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM {1}
      WHERE category = {2}
    )
  )
);`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "where categories live",
        why: "Category is a product attribute, so the innermost list must be built from products. Reading it from orders or customers would crash on the missing column.",
      },
      {
        answer: "'Fitness'",
        kind: "keyword",
        label: "the hero-line literal",
        why: "The Fitness line is exactly one product in the catalog, so the innermost filter is a single-category literal that must match the stored spelling.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the audience headcount",
        why: "The deliverable is one number for the audience builder. COUNT(*) collapses the surviving customers to that single figure; SUM has nothing to add up here.",
      },
    ],
    distractors: ["suppliers", "'Apparel'", "SUM"],
    walkthrough:
      "Three membership tests stack into a chain: the innermost IN collects the id of the single Fitness product, the middle IN keeps order ids whose baskets contain it, and the outer IN turns those orders into 7 distinct customers — Alice Chen, Farid Nasser, Grace Kim, Isabella Rossi, Keiko Sato, Maya Patel and Pedro Alvarez. Pointing the innermost FROM at suppliers crashes because suppliers has no category column, swapping the literal to 'Apparel' builds a different 10-person audience, and SUM(*) is not valid SQL for counting rows.",
  },
  {
    id: "cs-1002",
    tier: "easy",
    topic: "q1",
    universe: "month-close",
    title: "The at-risk roll-call",
    brief:
      "From: Controller. Re: close checklist, revenue-quality note.\n\nAuditors want the roll-call of accounts holding at-risk paper — orders neither won nor safely delivered, pending or cancelled alike. One two-item list inside the membership test covers both buckets; print the names alphabetically for the PBC binder.",
    ask: "List customers with at least one pending or cancelled order, alphabetically.",
    template: `SELECT {3} FROM customers
WHERE id IN (
  SELECT customer_id FROM {1}
  WHERE {2}
)
ORDER BY name;`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "where risk states live",
        why: "Pending and cancelled are order statuses. The blacklist must be read from orders; customers carries no status to filter on.",
      },
      {
        answer: "status IN ('pending', 'cancelled')",
        kind: "keyword",
        label: "the two-bucket rule",
        why: "One IN with two items expresses the neither-won-nor-delivered rule in a single predicate — both risk buckets, one membership list.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the binder's readable column",
        why: "The PBC binder lists account holders by name. Projecting name keeps the roll-call readable and audit-ready.",
      },
    ],
    distractors: ["customers", "status = 'shipped'", "city"],
    walkthrough:
      "The inner query keeps every order in either risk bucket — 21 rows — and collapses them to 8 distinct customer_ids; the outer query prints those names alphabetically for the binder. The punchline the controller should know: cancelled adds nobody new, because every cancelled account also holds a live cart, so the roll-call equals the pending club exactly. Pointing the inner FROM at customers crashes on the missing status column, filtering for shipped alone builds the 10-account delivery club instead, and projecting city would paste neighborhoods into a name field.",
  },
  {
    id: "cs-1003",
    tier: "easy",
    topic: "q1",
    universe: "refund-audit",
    title: "The settled eight",
    brief:
      "From: Refunds lead. Re: reconciliation follow-up.\n\nBefore we draft the apology round I want to know which accounts already settled an invoice — paid paperwork, not promises. Pull the member list straight from the invoice table so the sheet stays honest.",
    ask: "List the customers who have at least one paid invoice, alphabetically.",
    template: `SELECT {3} FROM customers
WHERE id IN (
  SELECT customer_id FROM {1}
  WHERE status = {2}
)
ORDER BY name;`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the settlement ledger",
        why: "Paid is an invoice status. The inner query must read invoices so the id list reflects settled paperwork, not orders.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled literal",
        why: "The ledger marks settlements as paid — 21 of the 28 documents. Any other status builds the wrong club.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the sheet's readable column",
        why: "The apology round dials people, so the outer projection is the name column, and the same column drives the alphabetical sort.",
      },
    ],
    distractors: ["payments", "'void'", "email"],
    walkthrough:
      "The inner query keeps the 21 paid invoices and collapses them to 8 distinct customer_ids — IN deduplicates by construction. The outer query prints those 8 names alphabetically, the settled eight who need no apology money. Reading customer_id from payments crashes because payments has no customer_id column, filtering for 'void' would single out Liam O'Brien's one killed document, and projecting email would address the apology round at inboxes instead of people.",
  },
  {
    id: "cs-1004",
    tier: "easy",
    topic: "q1",
    universe: "fraud",
    title: "Everyone ships eventually",
    brief:
      "From: Fraud analyst. Re: control-group scoping.\n\nThe control group for the shipping-fraud check needs accounts with at least one shipment movement — shipped or delivered both count, because both prove the warehouse touched a box. Count the eligible accounts; the result surprised us last quarter.",
    ask: "Count customers with at least one shipped or delivered order.",
    template: `SELECT {1}(*) AS shipped_once
FROM customers
WHERE id IN (
  SELECT customer_id FROM {3}
  WHERE status IN ('shipped', {2})
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the group size",
        why: "The control group needs a headcount. COUNT(*) turns the surviving membership into the single figure for the scoping memo.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the second proof state",
        why: "Delivered orders prove the box arrived — the brief explicitly lets them join shipped in the two-item list.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where shipment states live",
        why: "Shipped and delivered are order statuses. The inner query must read orders to build the movement list.",
      },
    ],
    distractors: ["SUM", "'cancelled'", "invoices"],
    walkthrough:
      "The two-item list asks for shipped-or-delivered membership, and the punchline is the count: 16 — every account in the book qualifies, because no customer lacks at least one moved box. Swapping 'delivered' for 'cancelled' shrinks the club to the shipped membership (the cancelled-only accounts all shipped something else), reading statuses from invoices finds no such statuses and returns zero, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1005",
    tier: "easy",
    topic: "q1",
    universe: "month-close",
    title: "The unpaid six",
    brief:
      "From: AR clerk. Re: dunning list prep.\n\nCollections goes out Friday, so I need the count of invoices that have never received a single payment row. Anti-membership is the whole trick here: an invoice with no matching payment id is the dunning target.",
    ask: "Count invoices with no matching payment record.",
    template: `SELECT {3}(*) AS never_paid
FROM invoices
WHERE id {1} (
  SELECT {2} FROM payments
);`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the anti-membership test",
        why: "The dunning targets are invoices absent from the payment list. NOT IN expresses exactly that complement; IN would count the settled 22 instead.",
      },
      {
        answer: "invoice_id",
        kind: "keyword",
        label: "the payment's back-reference",
        why: "Payments point back at the invoices they settle through invoice_id. That is the column whose absence defines unpaid.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the dunning count",
        why: "Friday's list is measured in documents: COUNT(*) prints how many invoices never got a payment row.",
      },
    ],
    distractors: ["IN", "customer_id", "SUM"],
    walkthrough:
      "The inner query lists every invoice_id that appears in payments — 22 of the 28 invoices have at least one payment row. NOT IN keeps the complement: 6 never-paid documents, five stuck in open plus one marked paid whose payment row simply never landed, a data-quality catch worth flagging to the ledger team. Flipping to IN would count the settled 22 instead, pointing the inner query at customer_id crashes because payments carries no such column, and SUM needs an argument — SUM alone is a syntax error.",
  },
  {
    id: "cs-1006",
    tier: "medium",
    topic: "q1",
    universe: "catalog",
    title: "The video eleven",
    brief:
      "From: Merchandising analyst. Re: home-cinema bundle shortlist.\n\nThe 4K-camera bundle pitch goes to accounts that actually buy Video gear — a names list, not a count, so the AE team can personalize. Chain the basket membership through order detail and keep it alphabetical for the CRM import.",
    ask: "List the customers whose orders include a Video product, alphabetically.",
    template: `SELECT name FROM customers
WHERE id IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id {3} (
      SELECT id FROM products
      WHERE {1}
    )
  )
)
ORDER BY {2};`,
    slots: [
      {
        answer: "category = 'Video'",
        kind: "keyword",
        label: "the bundle's category rule",
        why: "Video gear is defined by the category predicate. The innermost WHERE must express it exactly — wrong category, wrong shortlist.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the CRM column",
        why: "The AE team personalizes by name, so the outer projection is name and the same column drives the alphabetical order.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the basket membership test",
        why: "Each order qualifies when its line items reference a Video product id. IN is that membership test; NOT IN would shortlist the video-free accounts.",
      },
    ],
    distractors: ["category = 'Audio'", "city", "NOT IN"],
    walkthrough:
      "The innermost IN collects the Video product ids, the middle one keeps baskets containing them, and the outer one resolves those orders to 11 distinct customers — the video eleven, printed alphabetically for the CRM. Swapping the predicate to 'Audio' would target the 14 audio households instead, projecting city would feed neighborhoods into a name field, and NOT IN would invert the whole chain to the 5 customers who never touch Video.",
  },
  {
    id: "cs-1007",
    tier: "medium",
    topic: "q1",
    universe: "fraud",
    title: "Crown jewels by account",
    brief:
      "From: Fraud analyst. Re: peak-ticket sweep.\n\nEvery account's single biggest order goes under the microscope this cycle. Row-value membership is the clean way: keep only the orders whose (customer, total) pair matches that customer's maximum. Give me the pot — the sum of those crown tickets — rounded to cents.",
    ask: "Sum the totals of every customer's biggest order, rounded to 2 decimals.",
    template: `SELECT ROUND({1}(total), 2) AS crown_pot
FROM orders
WHERE (customer_id, total) IN (
  SELECT customer_id, {2}(total) FROM orders
  GROUP BY {3}
);`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the pot builder",
        why: "The deliverable is the combined value of the 16 crown tickets. SUM(total) adds them; COUNT would report 16, a headcount, not a value.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the crown maker",
        why: "Inside the row-value pair, MAX(total) per customer yields each account's biggest ticket. MIN would sweep the floors instead and build a much poorer pot.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the crown's owner key",
        why: "Grouping by customer_id makes MAX per-account. Group by anything else and the crowns belong to the wrong kingdoms.",
      },
    ],
    distractors: ["MIN", "AVG", "region"],
    walkthrough:
      "The inner query pairs each customer_id with their MAX(total) — 16 crowns, one per account. The outer row-value IN keeps exactly the orders matching those pairs, and SUM over them lands on 10441.02: the pot of peak tickets. MIN would build the floor pot instead (2407.43), AVG would match orders sitting exactly on their account's mean — a different and much smaller set — and region is not a column orders carries, so the grouping would crash.",
  },
  {
    id: "cs-1008",
    tier: "medium",
    topic: "q1",
    universe: "refund-audit",
    title: "The void signature",
    brief:
      "From: Controller. Re: single-document escalation.\n\nExactly one invoice in the book was voided, and the escalation packet needs the account behind it. Anti-paperwork: find the customer whose id sits in the voided document's list. One name, alphabetically trivial, but it must be the right one.",
    ask: "Show the customer tied to the voided invoice, with their city.",
    template: `SELECT {3}, {4} FROM customers
WHERE id IN (
  SELECT customer_id FROM {1}
  WHERE {2} = 'void'
)
ORDER BY name;`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the voided document's home",
        why: "Void is an invoice status. The blacklist must be read from invoices; orders know nothing about document states.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the document state column",
        why: "The escalation keys on the invoice's status field being 'void'. Comparing any other column against the literal finds nothing or nonsense.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the escalation's addressee",
        why: "The packet addresses a person. Projecting name keeps the output readable; ids belong in the appendix.",
      },
      {
        answer: "city",
        kind: "keyword",
        label: "the routing detail",
        why: "The escalation routes through the local office, so the packet carries the account's city beside the name.",
      },
    ],
    distractors: ["payments", "amount_cents", "email", "region"],
    walkthrough:
      "The inner query filters invoices down to the single voided document and yields its customer_id; the outer IN resolves that id to exactly one row — Liam O'Brien, with his city for routing. Reading customer_id from payments crashes because payments has no such column, comparing amount_cents to 'void' matches nothing and hands back an empty sheet, and projecting email or region would address the packet to an inbox string or a sales territory nobody signs.",
  },
  {
    id: "cs-1009",
    tier: "medium",
    topic: "q1",
    universe: "inventory",
    title: "Bulk baskets",
    brief:
      "From: Ops analyst. Re: pick-pack staffing.\n\nBulk lines slow the pack bench, so I need the number of orders carrying at least one line of three units or more. Membership over the detail table, threshold at three — give the shift lead one number to staff against.",
    ask: "Count orders containing at least one line item with quantity 3 or more.",
    template: `SELECT {3}(*) AS bulk_orders
FROM orders
WHERE id {1} (
  SELECT order_id FROM order_items
  WHERE quantity >= {2}
);`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the basket membership test",
        why: "An order counts when its id appears among the bulk line's order ids. IN is that test; NOT IN would count the lean baskets instead.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the bulk threshold",
        why: "Three units is the pick-pack definition of bulk. It is a filter constant set by ops, not an output figure, so it never needs to appear in the result cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the staffing figure",
        why: "The shift lead staffs against a count of affected orders. COUNT(*) prints it; SUM would try to add ids and produce nonsense.",
      },
    ],
    distractors: ["SUM", "4", "NOT IN"],
    walkthrough:
      "The inner query collects the order ids of all lines with quantity 3 or more — bulk lines exist in 68 of the store's baskets. The outer IN keeps exactly those orders and COUNT prints 68. SUM(*) is a syntax error, raising the threshold to 4 empties the list entirely (no line ships four units), and NOT IN would count the 35 lean baskets — the exact complement the shift lead did not ask for.",
  },
  {
    id: "cs-1010",
    tier: "medium",
    topic: "q1",
    universe: "expense",
    title: "Outside the disputed books",
    brief:
      "From: Finance partner. Re: quarter-end attestation.\n\nThe attestation covers accounts untouched by dispute paperwork — no open invoices, no voided ones either. Both document states go into one blacklist; count who stands outside it.",
    ask: "Count customers with no open and no voided invoices.",
    template: `SELECT {3}(*) AS clean_accounts
FROM customers
WHERE id NOT IN (
  SELECT customer_id FROM invoices
  WHERE status IN ({1}, {2})
);`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the unpaid-document state",
        why: "Open invoices are unresolved debt — the first blacklist entry. Six documents across six accounts carry it.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "the killed-document state",
        why: "Voided paperwork counts as dispute residue. Liam O'Brien's single void invoice puts him on the list alongside the open-book accounts.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the attestation headcount",
        why: "The partner wants the number of attestable accounts: COUNT(*) over the survivors prints it.",
      },
    ],
    distractors: ["'paid'", "'void'", "SUM"],
    walkthrough:
      "The blacklist unions the open-book accounts with the void holder — six open plus Liam's void collapses to 6 distinct ids. NOT IN keeps everyone absent from it: 10 clean accounts attest this quarter. Swapping 'open' for 'paid' would blacklist the settled majority too and strand at most 8 attestable accounts, dropping 'open' for a second 'void' would blacklist only Liam and pass 15 through, and SUM(*) cannot tally membership.",
  },
  {
    id: "cs-1011",
    tier: "hard",
    topic: "q1",
    universe: "growth",
    title: "Sweaters, never speakers",
    brief:
      "From: Growth lead. Re: category-exclusivity angle.\n\nThe next case study is about single-category loyalty: accounts that buy Apparel but have never once touched Electronics. That is a four-hop chain with a negation in the middle — membership for the sweater side, anti-membership for the speaker side. Count them.",
    ask: "Count customers who bought Apparel but never bought Electronics.",
    template: `SELECT {3}(*) AS apparel_only
FROM customers
WHERE id IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products
      WHERE category = {1}
    )
  )
) AND id NOT IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products
      WHERE category = {2}
    )
  )
);`,
    slots: [
      {
        answer: "'Apparel'",
        kind: "keyword",
        label: "the loyalty side",
        why: "The story is Apparel loyalty, so the membership chain filters for the sweater category — 10 accounts have at least one apparel basket.",
      },
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the exclusion side",
        why: "Never-touch-Electronics is the exclusivity clause. The NOT IN chain removes the 12 electronics households from the apparel club.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the case-study figure",
        why: "The deck needs the size of the overlap-free segment: COUNT(*) prints how many accounts survive both chains.",
      },
    ],
    distractors: ["'Electronics'", "'Apparel'", "SUM"],
    walkthrough:
      "The membership chain resolves 10 apparel households; the exclusion chain resolves 12 electronics households; the intersection-free remainder is 2 — the apparel loyalists who never bought a single gadget. Swapping the literals measures the mirror segment (4 electronics households with no apparel), putting 'Apparel' in the exclusion slot asks for accounts that buy sweaters but never sweaters — an empty 0 — and SUM(*) is not a legal counter.",
  },
  {
    id: "cs-1012",
    tier: "hard",
    topic: "q1",
    universe: "pricing",
    title: "The empty crown",
    brief:
      "From: Pricing analyst. Re: ceiling sanity check.\n\nHypothesis on the table: some account's biggest ticket still sits below the storewide average — a customer whose entire history never cleared the bar. Test it with row-value membership against the per-customer MAX and give me the count. If the hypothesis dies, the count says so.",
    ask: "Count orders that are their customer's biggest but still below the storewide average.",
    template: `SELECT COUNT(*) AS phantom_crowns
FROM orders o
WHERE o.total = (
  SELECT {1} FROM orders o2
  WHERE o2.customer_id = o.{3}
) AND o.total {2} (
  SELECT AVG(total) FROM orders
);`,
    slots: [
      {
        answer: "MAX(o2.total)",
        kind: "keyword",
        label: "the crown marker",
        why: "Each order is tested against its own account's MAX(total) — the crown. MIN would test against the floor and find plenty of sub-bar rows.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the below-bar edge",
        why: "The hypothesis is strictly below the storewide average. The comparison against the uncorrelated scalar must preserve that direction.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the crown's owner link",
        why: "The inner query correlates on the customer key so every order meets its own account's ceiling. Any other column breaks the per-account framing.",
      },
    ],
    distractors: ["MIN(o2.total)", ">", "region"],
    walkthrough:
      "Every one of the 16 crown tickets — the biggest order per account — clears the storewide average of about 338.19; the smallest crown in the book is Olivia Brown's 444.80. So the intersection of is-the-crown and below-the-bar is empty, and COUNT reports the honest 0 that kills the hypothesis. Testing against the per-account MIN finds 14 sub-bar floors instead, flipping the edge to > counts all 16 crowns — the opposite finding — and orders carries no region column, so the mis-keyed correlation crashes.",
  },
  {
    id: "cs-1013",
    tier: "hard",
    topic: "q1",
    universe: "supplier",
    title: "Sourced from the bottom shelf",
    brief:
      "From: Procurement. Re: reputational exposure memo.\n\nOur worst-rated supply region is a reputation risk for every order it touches. Suppliers rated under 4.0 define the bottom shelf; count the orders placed by customers who live in those regions. The board wants exposure in orders, not accounts.",
    ask: "Count orders from customers in regions with a supplier rated below 4.",
    template: `SELECT {3}(*) AS exposed_orders
FROM orders
WHERE customer_id IN (
  SELECT id FROM customers
  WHERE region IN (
    SELECT region FROM suppliers
    WHERE rating {1} {2}
  )
);`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the bottom-shelf edge",
        why: "Under 4.0 is the brief's threshold. A strict < keeps Pacific Textiles at 3.9 and excludes the 4.0s — inclusive <= would widen the exposure map.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the reputation bar",
        why: "Four is the stakeholder-set bar. It is a filter constant, not an output figure, so it never needs to appear in the result cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the exposure measure",
        why: "The board asked for exposure in orders. COUNT(*) over the matched orders prints the number for the memo.",
      },
    ],
    distractors: ["<=", "4.3", "SUM"],
    walkthrough:
      "Only Pacific Textiles (3.9, APAC) sits below the bar, so the region list is {APAC}; its 5 customers place 37 orders — the exposure figure. Relaxing to <= would pull Andes Naturals (4.0, LATAM) into the list and add Olivia Brown's orders for 39, raising the bar to 4.3 would do the same by catching Shenzhen Electro and Andes, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1014",
    tier: "hard",
    topic: "q1",
    universe: "catalog",
    title: "Speakers, never sweaters",
    brief:
      "From: Merchandising analyst. Re: gadget-household study.\n\nFor the gadget-household profile I need the mirror of last quarter's cut: accounts that buy Electronics but have never put a single Apparel item in a basket. Four hops out, four hops back with a negation — count the segment.",
    ask: "Count customers who bought Electronics but never bought Apparel.",
    template: `SELECT {3}(*) AS gadget_only
FROM customers
WHERE id IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products
      WHERE category = {1}
    )
  )
) AND id NOT IN (
  SELECT customer_id FROM orders
  WHERE id IN (
    SELECT order_id FROM order_items
    WHERE product_id IN (
      SELECT id FROM products
      WHERE category = {2}
    )
  )
);`,
    slots: [
      {
        answer: "'Electronics'",
        kind: "keyword",
        label: "the gadget side",
        why: "The profile targets electronics households: the membership chain filters for the Electronics category and its 12 households.",
      },
      {
        answer: "'Apparel'",
        kind: "keyword",
        label: "the exclusion side",
        why: "Never-bought-apparel is the profile's exclusivity clause; the NOT IN chain removes the 10 apparel households from the gadget club.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the segment size",
        why: "The study reports a headcount. COUNT(*) prints how many accounts survive both four-hop chains.",
      },
    ],
    distractors: ["'Apparel'", "'Electronics'", "SUM"],
    walkthrough:
      "The membership chain resolves 12 electronics households; the exclusion chain resolves 10 apparel households; the survivors are 4 gadget-only accounts. Swapping the literals measures the mirror cut — 2 apparel households with no electronics — putting 'Electronics' in the exclusion slot asks for gadget buyers who never bought gadgets, an empty 0, and SUM(*) is not a legal counter.",
  },
  {
    id: "cs-1015",
    tier: "hard",
    topic: "q1",
    universe: "inventory",
    title: "The lean thirty-five",
    brief:
      "From: Ops analyst. Re: express-lane pilot.\n\nThe express lane only makes sense for baskets with no bulk line at all — every line at two units or fewer. That is an anti-membership over the detail table with the bulk threshold inverted. Count the eligible orders for the pilot.",
    ask: "Count orders with no line item of quantity 3 or more.",
    template: `SELECT {3}(*) AS lean_orders
FROM orders
WHERE id NOT IN (
  SELECT order_id FROM order_items
  WHERE quantity {1} {2}
);`,
    slots: [
      {
        answer: ">=",
        kind: "keyword",
        label: "the bulk edge",
        why: "Bulk starts at three units, so the blacklist is lines with quantity >= 3. A strict > would miss the 3-unit lines and blacklist nothing.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the bulk threshold",
        why: "Three is ops' bulk definition. It is a filter constant, not an output figure, so it never needs to appear in the result cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pilot headcount",
        why: "The pilot's feasibility number: COUNT(*) over the surviving orders prints how many baskets qualify for the express lane.",
      },
    ],
    distractors: [">", "4", "SUM"],
    walkthrough:
      "The blacklist collects order ids containing a line of 3+ units — 68 baskets have one. NOT IN keeps the complement: 35 lean orders eligible for the express lane. A strict > would build the blacklist from 4-unit lines only, find none, and pass all 103 orders — a silently wrong answer that the >= catches; raising the threshold to 4 does the same thing by emptying the list, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1016",
    tier: "easy",
    topic: "q2",
    universe: "month-close",
    title: "The shipped bar",
    brief:
      "From: Controller. Re: close checklist, logistics cut.\n\nThe warehouse wants its own bar this cycle: the average value of orders that have actually shipped. Everything above that shipped-only average gets a white-glove review. Count them — the delivered-only bar would tell a different story, and we've been burned by mixing the two.",
    ask: "Count orders above the shipped-only average order value.",
    template: `SELECT {3}(*) AS white_glove
FROM orders
WHERE total {2} (
  SELECT {1}(total) FROM orders WHERE status = 'shipped'
);`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The bar is the shipped-only average. MAX would set the bar at the best order ever and nobody clears it; MIN would let nearly everyone through.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the above-bar edge",
        why: "White-glove review targets orders above the bar. Flipping the comparison keeps the bottom of the book instead — the opposite cohort.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the review headcount",
        why: "The controller wants one number for the review queue: COUNT(*) prints how many orders clear the shipped bar.",
      },
    ],
    distractors: ["'delivered'", "MAX", "<"],
    walkthrough:
      "The inner scalar averages only the 30 shipped orders — a bar of about 399.89, higher than the storewide 338.19 because shipped baskets skew big. The outer comparison keeps the 34 orders that clear it. Rebuilding the bar from delivered orders drops it to about 299.44 and widens the queue to 49, MAX would raise the bar to the 1088.44 ceiling and queue nobody, and < would count the 69 orders below the bar — the complement the checklist did not ask for.",
  },
  {
    id: "cs-1017",
    tier: "easy",
    topic: "q2",
    universe: "supplier",
    title: "Above the reputation mean",
    brief:
      "From: Procurement. Re: partner shortlist.\n\nThe shortlist slide needs our above-average suppliers — rated better than the fleet's own mean, whatever that mean turns out to be. Let the query compute the bar; the slide must survive a data refresh without hand-edited numbers.",
    ask: "List suppliers rated above the fleet's average rating, best first.",
    template: `SELECT name FROM suppliers
WHERE rating {2} (
  SELECT {1}(rating) FROM suppliers
)
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the fleet mean",
        why: "Above average means above the fleet's AVG rating — about 4.3. MAX would set the bar at 4.8 and shortlist nobody; MIN would shortlist nearly everyone.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the above-mean edge",
        why: "The shortlist keeps suppliers strictly better than the mean. Flipping to < would list the below-average partners instead.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the ranking column",
        why: "Best first means sorting by the rating value itself. Sorting by name would alphabetize the slide instead of ranking it.",
      },
    ],
    distractors: ["MIN", "<", "name"],
    walkthrough:
      "The scalar computes the fleet mean — 4.3 across the six suppliers. The comparison keeps the three partners above it: Alpine Audio 4.8, Nordic Gadgets 4.6 and Midwest Hardware 4.4, printed best first. MIN would lower the bar to 3.9 and shortlist five, < would list Shenzhen Electro, Andes Naturals and Pacific Textiles — the exact complement — and sorting by name would hand the slide an alphabetical list where the ranking story disappears.",
  },
  {
    id: "cs-1018",
    tier: "easy",
    topic: "q2",
    universe: "pricing",
    title: "The catalog stamp",
    brief:
      "From: Pricing analyst. Re: wearables margin memo.\n\nThe memo reads better when every wearables row carries the catalog-wide average price alongside it — the contrast between 79-dollar bands and the catalog mean is the whole argument. Stamp the scalar on each row; no hand-typed numbers.",
    ask: "List Wearables products with their price and the catalog average price.",
    template: `SELECT name, {3}, (
  SELECT ROUND({1}(price), 2) FROM products
) AS catalog_avg
FROM products
WHERE category = {2};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean builder",
        why: "The stamp is the catalog-wide average price, about 71.78. MAX would stamp the 199.99 ceiling — a contrast, but not the one the memo argues.",
      },
      {
        answer: "'Wearables'",
        kind: "keyword",
        label: "the memo's category",
        why: "The margin memo scopes to Wearables. The literal must match the stored category exactly or the memo mixes lines.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the contrast column",
        why: "Each row needs its own price next to the catalog mean — that side-by-side is the argument. The id column would print keys nobody reads.",
      },
    ],
    distractors: ["MAX", "'Audio'", "id"],
    walkthrough:
      "The uncorrelated scalar computes once — catalog average 71.78 — and stamps the same value on every surviving row. The wearables filter keeps two products: Fitness Band X2 at 79.00 and Smart Watch S at 199.99, both above the mean, which is exactly the memo's point. MAX would stamp the ceiling 199.99 instead of the mean, 'Audio' would build the memo from three speaker products, and id would print 12 and 13 where the price contrast should sit.",
  },
  {
    id: "cs-1019",
    tier: "easy",
    topic: "q2",
    universe: "expense",
    title: "The lean twenty-one",
    brief:
      "From: Finance partner. Re: spend-culture snapshot.\n\nFor the culture slide I need the count of expense lines below the company's own average spend — the quiet half of the ledger. The average must be computed, not quoted; the slide gets recycled next quarter.",
    ask: "Count expenses below the company-wide average expense.",
    template: `SELECT {3}(*) AS lean_spend
FROM expenses
WHERE amount_cents {1} (
  SELECT {2}(amount_cents) FROM {4}
);`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the below-bar edge",
        why: "The snapshot counts the quiet half — strictly below the average. > would count the heavy spenders instead.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the ledger mean",
        why: "The bar is the company-wide average expense, about 706. MAX would set the bar at the biggest single expense and pass nearly everything.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the snapshot figure",
        why: "The slide wants one number: COUNT(*) over the below-bar expenses prints it.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the ledger's home table",
        why: "Expense amounts live on expenses. Averaging payments would measure a different ledger entirely.",
      },
    ],
    distractors: [">", "MAX", "SUM", "payments"],
    walkthrough:
      "The scalar averages all 36 expense lines — about 706 per line — and the outer comparison keeps the 21 expenses below it: the quiet majority the culture slide celebrates. Flipping to > counts the 15 heavy lines instead, MAX would raise the bar to the 1680 travel bill and pass 35 of 36, SUM is not a legal bar-builder for a scalar comparison here, and averaging payments would measure invoice settlements, not the expense ledger.",
  },
  {
    id: "cs-1020",
    tier: "easy",
    topic: "q2",
    universe: "pricing",
    title: "The value picks",
    brief:
      "From: Merchandising analyst. Re: entry-shelf review.\n\nThe entry shelf is everything priced under the catalog's own average — the impulse-buy band. Count how many products make the cut so the planogram team knows the depth of the shelf.",
    ask: "Count products priced below the catalog average price.",
    template: `SELECT {3}(*) AS value_picks
FROM products
WHERE price {1} (
  SELECT AVG(price) FROM {2}
);`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the under-bar edge",
        why: "Entry shelf means strictly under the catalog mean of about 71.78. > would count the premium shelf instead.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "where prices live",
        why: "Catalog price is a product attribute. The scalar must average products; order detail carries unit prices, not catalog prices.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf depth",
        why: "The planogram team wants the depth of the entry shelf: COUNT(*) prints it as one number.",
      },
    ],
    distractors: [">", "suppliers", "SUM"],
    walkthrough:
      "The scalar computes the catalog mean — about 71.78 across the 16 products — and the comparison keeps the 10 products under it, the entry-shelf depth. Flipping to > would count the 6 premium products instead, averaging suppliers would crash because suppliers carries ratings not prices, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-1021",
    tier: "medium",
    topic: "q2",
    universe: "fraud",
    title: "Halfway and under",
    brief:
      "From: Fraud analyst. Re: low-value noise sweep.\n\nThe rules engine flags tickets under HALF the storewide average as noise worth skipping. Build the bar with arithmetic inside the scalar — the average divided by two — and count how many orders fall under it.",
    ask: "Count orders below half the storewide average order value.",
    template: `SELECT {3}(*) AS noise_band
FROM orders
WHERE total {2} (
  SELECT AVG(total) {1} FROM orders
);`,
    slots: [
      {
        answer: "/ 2",
        kind: "keyword",
        label: "the half-bar arithmetic",
        why: "Half the average is the brief's bar. Multiplying instead would set the bar at 676.38 and sweep in the middle of the book.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the under-bar edge",
        why: "Noise means below the bar. > would flag the healthy majority above half-average instead.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the noise tally",
        why: "The sweep reports one number: COUNT(*) over the noise band prints it.",
      },
    ],
    distractors: ["* 2", ">", "SUM"],
    walkthrough:
      "The scalar computes the storewide average — about 338.19 — then halves it with arithmetic inside the subquery: the bar sits at about 169.09. The comparison keeps the 35 orders under it, the noise band the rules engine skips. Multiplying would set the bar at 676.38 and flag 92 orders — three times too noisy — flipping the edge would count the 68 orders above half-bar, and SUM cannot build an average.",
  },
  {
    id: "cs-1022",
    tier: "medium",
    topic: "q2",
    universe: "expense",
    title: "The open-bar invoices",
    brief:
      "From: AR clerk. Re: escalation thresholds.\n\nBig open invoices go straight to the escalations queue. 'Big' means bigger than the average OPEN invoice — paid paperwork must not move the bar, because settled amounts are already healthy. Count the queue.",
    ask: "Count invoices above the average open-invoice amount.",
    template: `SELECT {3}(*) AS escalations
FROM invoices
WHERE amount_cents {2} (
  SELECT AVG(amount_cents) FROM invoices WHERE status = {1}
);`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the bar's scope",
        why: "The bar is built from open invoices only — the population being escalated. Including paid rows would drag the bar toward settled history.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the above-bar edge",
        why: "Escalations take invoices above the open-only bar. < would queue the small ones instead.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue depth",
        why: "The clerk wants the queue length: COUNT(*) prints how many invoices exceed the open bar.",
      },
    ],
    distractors: ["'void'", "<", "SUM"],
    walkthrough:
      "The scalar averages the six open invoices — a bar of about 3268.17 — and the comparison keeps the 12 invoices above it for escalation. Building the bar from the single void invoice would collapse it to about 925 and flood the queue with 26 documents, flipping the edge would queue the 16 below-bar invoices instead, and SUM cannot build an average bar.",
  },
  {
    id: "cs-1023",
    tier: "medium",
    topic: "q2",
    universe: "growth",
    title: "Gaps from the mean",
    brief:
      "From: Growth lead. Re: whale-brief header table.\n\nThe brief's header table ranks the top three orders by their gap above the storewide average — computed, not eyeballed. Each row shows the order id and its rounded gap; the scalar does the measuring.",
    ask: "List the top 3 orders by gap above the storewide average, biggest first.",
    template: `SELECT id, ROUND(total {1}, 2) AS gap
FROM orders
ORDER BY gap {2}
LIMIT {3};`,
    slots: [
      {
        answer: "- (SELECT AVG(total) FROM orders)",
        kind: "keyword",
        label: "the gap arithmetic",
        why: "Gap means total minus the storewide average. Adding instead would measure distance from a negative mirror and rank nothing sensible.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first order",
        why: "Top of the brief means biggest gap first. ASC would surface the most below-bar ticket — the anti-story.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the header's row count",
        why: "The header table holds exactly three rows. It is a presentation constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: [
      "total + (SELECT AVG(total) FROM orders)",
      "ASC",
      "5",
    ],
    walkthrough:
      "The scalar stamps every order with the storewide average, the gap expression subtracts it, and the sort keeps the three biggest positives: order 74 at 750.25 above the mean (Farid's 1088.44 whale), order 43 at 607.02 (Chloe's 945.21), order 39 at 507.73 (Emma's 845.92). Adding instead of subtracting would rank total-plus-average — the same order ids but meaningless figures — ASC would surface order 51 at minus 312.72, and LIMIT 5 would overflow the header table.",
  },
  {
    id: "cs-1024",
    tier: "medium",
    topic: "q2",
    universe: "fraud",
    title: "Once in a blue moon",
    brief:
      "From: Fraud analyst. Re: outlier memo.\n\nThe memo claims big-ticket fraud is a blue-moon event: orders at THREE times the storewide average or better. Test the claim with the multiplier inside the comparison and count what survives.",
    ask: "Count orders above three times the storewide average order value.",
    template: `SELECT {3}(*) AS blue_moons
FROM orders
WHERE total {4} {1} * (
  SELECT {2}(total) FROM orders
);`,
    slots: [
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the multiplier",
        why: "Three is the memo's outlier multiple. It is a filter constant, not an output figure, so it never needs to appear in the result cells.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar builder",
        why: "The base bar is the storewide average, about 338.19. MAX would triple the 1088.44 ceiling — a bar nobody can clear.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the claim's tally",
        why: "The memo's claim lives or dies on one number: COUNT(*) over the survivors prints it.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the outlier edge",
        why: "Outliers sit above the tripled bar. < would count everything except the blue moon instead.",
      },
    ],
    distractors: ["2", "MAX", "SUM", "<"],
    walkthrough:
      "Tripled, the storewide average sets the bar at about 1014.57 — and exactly one order in the book clears it: order 74 at 1088.44, Farid's whale. The memo's claim holds: big-ticket outliers are a once-per-book event. Doubling instead would catch 11 orders, MAX as the base would set an impossible bar and return 0, SUM cannot build the average, and < would count the 102 ordinary tickets — the opposite of an outlier memo.",
  },
  {
    id: "cs-1025",
    tier: "medium",
    topic: "q2",
    universe: "expense",
    title: "The paper standings",
    brief:
      "From: Finance partner. Re: invoice-mix table.\n\nThe mix table shows each invoice status with its average amount in dollars, but only the statuses that beat the ledger's overall average make the cut — weak buckets get cut from the slide. Two rows survive; build them.",
    ask: "List invoice statuses whose average amount beats the overall average, in dollars.",
    template: `SELECT status, ROUND(AVG(amount_cents) {3}, 2) AS avg_amt
FROM invoices
GROUP BY {1}
HAVING AVG(amount_cents) {2} (SELECT AVG(amount_cents) FROM invoices);`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the bucket key",
        why: "The mix table buckets by invoice status. Grouping by anything else dissolves the standings into the wrong rows.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the beat-the-mean edge",
        why: "Only statuses strictly above the ledger-wide average make the slide. < would keep the weak bucket the partner explicitly cuts.",
      },
      {
        answer: "/ 100.0",
        kind: "keyword",
        label: "the cents-to-dollars step",
        why: "amount_cents is stored in cents; dividing by 100.0 prints the dollars the slide reads. Multiplying would print six-figure nonsense.",
      },
    ],
    distractors: ["number", "<", "* 100.0"],
    walkthrough:
      "The overall ledger average is about 3106.32 per invoice. Grouped by status, two buckets beat it: open at 3268.17 and paid at 3163.95 — void, the single killed document at 925.00, falls short and gets cut. Grouping by number would dissolve the table into one row per invoice, < would keep exactly the void row the partner cuts, and multiplying cents by 100 would print 326817.00 where dollars belong.",
  },
  {
    id: "cs-1026",
    tier: "hard",
    topic: "q2",
    universe: "pricing",
    title: "Best under the mean",
    brief:
      "From: Pricing analyst. Re: ceiling-finder sanity probe.\n\nA two-layer question for the pricing probe: what is the most expensive product that still sits under the catalog-wide average? The answer needs a scalar inside a scalar's comparison — the aggregate runs on the filtered set, not the whole shelf.",
    ask: "Find the highest product price that is still below the catalog average price.",
    template: `SELECT ROUND({1}(price), 2) AS best_under
FROM products
WHERE price {2} (
  SELECT AVG(price) FROM {3}
);`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling finder",
        why: "The probe wants the best price under the bar, so the aggregate over the filtered set is MAX. MIN would report the cheapest product — the floor, not the ceiling.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the under-bar filter",
        why: "Only products below the catalog average may feed the aggregate. > would measure the premium shelf and report the overall ceiling instead.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "where prices live",
        why: "Catalog price is a product attribute. Averaging suppliers would crash — they carry ratings, not prices.",
      },
    ],
    distractors: ["MIN", ">", "suppliers"],
    walkthrough:
      "The inner scalar computes the catalog mean — about 71.78 — the WHERE keeps the 10 products under it, and MAX over that filtered set lands on 65.00: the Cycling Jersey Pro, the most expensive product that still undercuts the catalog average. MIN would answer 14.99, the HDMI cable floor, > would flip the question to the premium shelf and return 199.99, and suppliers has no price column to average.",
  },
  {
    id: "cs-1027",
    tier: "hard",
    topic: "q2",
    universe: "refund-audit",
    title: "The quiet dozen",
    brief:
      "From: Refunds lead. Re: clean-hands attestation.\n\nThe attestation needs accounts with NO cancellation on record. The trick: test the account's biggest cancelled order and keep those where that scalar comes back empty — a MAX with nothing to chew on returns NULL, and NULL is detectable. Count the clean hands.",
    ask: "Count customers with no cancelled orders via the NULL scalar test.",
    template: `SELECT COUNT(*) AS quiet_accounts
FROM customers c
WHERE (
  SELECT {1}(total) FROM orders o
  WHERE o.customer_id = c.id AND o.status = {2}
) IS {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the empty-scalar probe",
        why: "MAX over an empty set returns NULL — the detectable signature of no cancellations. COUNT would return 0, a real number, and break the NULL test.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the stain being tested",
        why: "The attestation is about cancellations. Testing any real status would attest a different stain; the club must stay the cancelled-free accounts.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the emptiness signature",
        why: "No cancellations means the scalar found nothing, and nothing prints as NULL. IS NULL is the only honest test for it; IS NOT NULL would keep the stained accounts.",
      },
    ],
    distractors: ["COUNT", "'pending'", "NOT NULL"],
    walkthrough:
      "For each account the scalar takes MAX(total) over their cancelled orders — with none, MAX returns NULL, and IS NULL catches it: 12 accounts have clean hands. The complement is the familiar cancelled club of 4. Swapping in COUNT would return 0 — a number, not NULL — and the test would wrongly report zero clean accounts everywhere, testing pending would attest a different stain and find only 8 clean accounts, and IS NOT NULL would list the four stained accounts as if they were the attestation.",
  },
  {
    id: "cs-1028",
    tier: "hard",
    topic: "q2",
    universe: "fraud",
    title: "The floor gap",
    brief:
      "From: Ops analyst. Re: smallest-basket case study.\n\nThe case study profiles the order furthest BELOW the storewide average — the floor ticket, measured by a computed gap. Show its id, its total, and its rounded gap, worst first from the bottom.",
    ask: "Show the order with the biggest below-average gap: id, total, and the gap.",
    template: `SELECT id, {2}, ROUND(total {1}, 2) AS gap
FROM orders
ORDER BY {3} ASC
LIMIT 1;`,
    slots: [
      {
        answer: "- (SELECT AVG(total) FROM orders)",
        kind: "keyword",
        label: "the gap arithmetic",
        why: "Gap below the bar is total minus the storewide average — a negative number for sub-bar tickets. Adding would flip the geometry.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the case-study figure",
        why: "The profile shows the ticket's own value next to its gap. The id alone would not tell the story.",
      },
      {
        answer: "gap",
        kind: "keyword",
        label: "the ranking key",
        why: "Ranking by the computed gap finds the deepest sub-bar ticket. Ranking by id would profile order 1 regardless of value.",
      },
    ],
    distractors: ["+ (SELECT AVG(total) FROM orders)", "id", "created_at"],
    walkthrough:
      "Every order's gap is computed against the storewide average of about 338.19, and the ascending sort on that computed gap surfaces the deepest negative: order 51 — Maya Patel's 25.47 accessory basket — at minus 312.72 below the bar. Adding the average instead of subtracting would crown the same order with a meaningless 363.66, profiling the id column would print 51 twice with no ticket value, and ranking by id or by order date would profile whichever row happens to sort first — a case study about nothing.",
  },
  {
    id: "cs-1029",
    tier: "hard",
    topic: "q2",
    universe: "expense",
    title: "Heavy categories",
    brief:
      "From: Finance partner. Re: spend-mix deep dive.\n\nThe deep dive keeps only the expense categories whose average line beats the ledger-wide average line — the categories that pull the mean up. Show each survivor's average in dollars. Rent will be on the list; the second seat is the interesting one.",
    ask: "List expense categories whose average line beats the overall average, in dollars.",
    template: `SELECT category, ROUND({2}(amount_cents) {3}, 2) AS avg_amt
FROM {4}
GROUP BY category
HAVING AVG(amount_cents) {1} (SELECT AVG(amount_cents) FROM expenses);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the beat-the-mean edge",
        why: "Survivors strictly beat the ledger-wide average of about 706. < would keep the categories that drag the mean down.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the per-category mean",
        why: "The slide shows each category's average line. SUM would show category totals — a different, bigger story.",
      },
      {
        answer: "/ 100.0",
        kind: "keyword",
        label: "the cents-to-dollars step",
        why: "amount_cents stores cents; dividing by 100.0 prints dollars. Multiplying would print 120000.00 where 1200.00 belongs.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the ledger's home table",
        why: "The spend mix reads the expense ledger. Payments carry no category column, so the grouping would crash.",
      },
    ],
    distractors: ["<", "SUM", "* 100.0", "payments"],
    walkthrough:
      "The ledger-wide average line is about 706. Grouped by category, two survivors beat it: Rent at 1200.00 per line and Travel at 840.33 — the second seat the partner flagged as the interesting one, since a per-trip average beating the ledger says travel is lumpy, not routine. Ads and Tools average below the bar and get cut. Flipping the edge keeps the light categories, SUM would print category totals instead of averages, multiplying cents prints six-figure nonsense, and payments has no category to group by.",
  },
  {
    id: "cs-1030",
    tier: "hard",
    topic: "q2",
    universe: "pricing",
    title: "The middle band",
    brief:
      "From: Pricing analyst. Re: barbell-shelf hypothesis.\n\nThe hypothesis says the catalog of orders is barbell-shaped: big spenders and tiny baskets, with a thin middle. Test it by counting orders between HALF the storewide average and the storewide average itself — the middle band. A thin count supports the hypothesis.",
    ask: "Count orders between half the storewide average and the storewide average.",
    template: `SELECT COUNT(*) AS mid_band
FROM orders
WHERE total {3} (
  SELECT AVG(total) {1} FROM orders
) AND (
  SELECT {2}(total) FROM orders
);`,
    slots: [
      {
        answer: "/ 2",
        kind: "keyword",
        label: "the band's lower edge",
        why: "The band starts at half the average. Multiplying would swap the edges — a lower bound above the upper bound — and BETWEEN would return nothing.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the band's upper edge",
        why: "The band ends at the storewide average itself, about 338.19. MAX would stretch the band to the 1088.44 ceiling and swallow most of the book.",
      },
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the band's shape",
        why: "The hypothesis tests a range, and BETWEEN is the inclusive range test. NOT BETWEEN would measure everything outside the band — the barbell's ends.",
      },
    ],
    distractors: ["* 2", "MAX", "NOT BETWEEN"],
    walkthrough:
      "The band runs from about 169.09 (half the average, computed inside the scalar) up to about 338.19 (the average itself). BETWEEN keeps the inclusive range: 26 orders live in the middle — a genuinely thin middle for a 103-order book, which is what the barbell hypothesis predicts. Multiplying the lower edge would invert the range and return zero, MAX as the upper edge would stretch the band to 68 orders and destroy the thinness claim, and NOT BETWEEN would count the 77 orders outside the band — the barbell's ends, not its middle.",
  },
  {
    id: "cs-1031",
    tier: "easy",
    topic: "q3",
    universe: "month-close",
    title: "The chase list",
    brief:
      "From: AR clerk. Re: month-end dunning sweep.\n\nThe dunning sweep only calls accounts holding an OPEN invoice right now — a live-existence question, not a membership list. EXISTS is the honest shape for it: does at least one open document exist for this account? Count who gets a call.",
    ask: "Count customers with at least one open invoice.",
    template: `SELECT {3}(*) AS chased_accounts
FROM customers c
WHERE {4} (
  SELECT 1 FROM {1} i
  WHERE i.customer_id = c.id AND i.status = {2}
);`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "where open paper lives",
        why: "Open is an invoice state. The existence probe must read invoices; orders know nothing about billing documents.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the chased state",
        why: "The sweep calls about open debt specifically. Paid or voided documents would dial the wrong accounts.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the call-sheet length",
        why: "The clerk wants the number of calls to make: COUNT(*) over the surviving accounts prints it.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the existence test",
        why: "The question is does-at-least-one-exist. EXISTS stops at the first matching document; NOT EXISTS would keep the accounts with nothing to chase.",
      },
    ],
    distractors: ["NOT EXISTS", "'paid'", "payments"],
    walkthrough:
      "For each account the probe asks: does one open invoice exist? Six accounts hold the six open documents — those are the calls. NOT EXISTS would keep the other 10 accounts who have nothing outstanding, probing for paid would find the 8 settled accounts instead — a thank-you list, not a dunning list — and payments carries no customer_id column, so the probe would crash.",
  },
  {
    id: "cs-1032",
    tier: "easy",
    topic: "q3",
    universe: "month-close",
    title: "The settled, revisited",
    brief:
      "From: Controller. Re: close checklist, reconciliation appendix.\n\nLast quarter the settled-eight list was built with IN; this quarter the appendix asks for the same club written as an existence test — proof the two shapes agree. Keep it alphabetical so the diff reads clean.",
    ask: "List customers with at least one paid invoice, alphabetically, using EXISTS.",
    template: `SELECT c.name FROM customers c
WHERE {3} (
  SELECT 1 FROM {1} i
  WHERE i.customer_id = c.id AND i.status = {2}
)
ORDER BY c.name;`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the settlement ledger",
        why: "Paid is an invoice status. The existence probe reads invoices so the club reflects settled paperwork.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled state",
        why: "The appendix keys on settled documents. Any other status rebuilds the wrong club.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the existence form",
        why: "The appendix demands the existence shape. NOT EXISTS would print everyone without a settlement — the complement.",
      },
    ],
    distractors: ["NOT EXISTS", "'open'", "payments"],
    walkthrough:
      "EXISTS stops at the first settled document per account, so the club is exactly the same eight names the IN version produced — proof that membership and existence agree here. NOT EXISTS would print the 8 accounts with no settlement on file, probing 'open' would list the 6 dunning targets instead, and payments has no customer_id to correlate on.",
  },
  {
    id: "cs-1033",
    tier: "easy",
    topic: "q3",
    universe: "refund-audit",
    title: "The undelivered one",
    brief:
      "From: Refunds lead. Re: stuck-shipment sweep.\n\nCustomer success swears every account has received something by now. The sweep disagrees — it wants the proof list of accounts with NO delivered order at all. Anti-existence is the shape: NOT EXISTS a single delivered order. Name and shame, alphabetically.",
    ask: "List customers with no delivered orders, alphabetically.",
    template: `SELECT {3} FROM customers c
WHERE NOT {2} (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = {1}
)
ORDER BY c.name;`,
    slots: [
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the proof state",
        why: "The sweep tests for delivery proof specifically. Probing shipped would clear accounts whose boxes never landed.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the anti-existence flip",
        why: "NOT EXISTS keeps accounts where no delivered order exists at all. Plain EXISTS would list the 15 accounts WITH proof — the opposite of the shame list.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the shame-list column",
        why: "Success dials people: the outer projection is the name column, and the fixed sort keeps the list alphabetical.",
      },
    ],
    distractors: ["EXISTS", "'shipped'", "city"],
    walkthrough:
      "The anti-existence test keeps accounts where no delivered order exists — and the sweep's proof list is exactly one name: Liam O'Brien, whose single order shipped but never landed. Plain EXISTS would print the other 15 accounts, probing 'shipped' would find nobody (every account has at least one moved box), and projecting city would shame neighborhoods instead of people.",
  },
  {
    id: "cs-1034",
    tier: "easy",
    topic: "q3",
    universe: "fraud",
    title: "Repeat offenders",
    brief:
      "From: Fraud analyst. Re: cancellation-pattern review.\n\nThe pattern review flags accounts with at least one killed order — cancellations cluster by account, and the review starts from the club roster. Existence test over the order table, cancelled state only. Count the roster.",
    ask: "Count customers with at least one cancelled order.",
    template: `SELECT {3}(*) AS repeat_offenders
FROM customers c
WHERE {2} (
  SELECT 1 FROM {1} o
  WHERE o.customer_id = c.id AND o.status = {4}
);`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "where kills live",
        why: "Cancelled is an order state. The existence probe must read orders; the invoice table's statuses are billing states, not kills.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the club's entry test",
        why: "At-least-one is exactly what EXISTS asks. NOT EXISTS would roster the clean 12 instead of the club of 4.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the roster size",
        why: "The review opens with the club's size: COUNT(*) prints how many accounts carry a kill.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the kill state",
        why: "The review is about killed orders specifically. Any other status mints the wrong roster.",
      },
    ],
    distractors: ["NOT EXISTS", "invoices", "'returned'"],
    walkthrough:
      "The existence probe finds 4 accounts with at least one killed order — the familiar cancelled club. NOT EXISTS would roster the 12 clean accounts, probing invoices for 'cancelled' would find no such billing state and return a false-zero roster, and 'returned' is not a status this store records, so that probe also comes back empty — a silently wrong answer that a real status literal avoids.",
  },
  {
    id: "cs-1035",
    tier: "medium",
    topic: "q3",
    universe: "fraud",
    title: "Salvageable carts",
    brief:
      "From: Lifecycle marketer. Re: win-back triage.\n\nWin-back spend goes only to accounts with a live cart AND no kill history — pending optimism without cancelled baggage. That is a double existence test: one positive, one negative. Count the salvageable accounts.",
    ask: "Count customers with a pending order but no cancelled orders.",
    template: `SELECT {2}(*) AS salvageable
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status = {3}
) AND NOT EXISTS (
  SELECT 1 FROM orders o2
  WHERE o2.customer_id = c.id AND o2.status = {1}
);`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the baggage being excluded",
        why: "The negative probe removes accounts with kill history. Testing delivered or shipped instead would exclude nearly everyone and measure nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the triage figure",
        why: "Win-back spend is budgeted per account: COUNT(*) prints how many salvageable accounts the budget covers.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the live-cart state",
        why: "The positive probe requires a live cart. Requiring delivery proof instead would measure a different, much larger cohort.",
      },
    ],
    distractors: ["'delivered'", "SUM"],
    walkthrough:
      "The positive probe keeps the 8 pending-cart accounts; the negative probe strips anyone with a kill — and because all 4 cancelled accounts also hold live carts, the survivors are the 4 pending-only accounts. Swapping the excluded state to delivered would exclude every account that ever received a box and return zero, excluding shipped would keep just 3 accounts whose carts never shipped anything, and SUM(*) cannot tally accounts.",
  },
  {
    id: "cs-1036",
    tier: "medium",
    topic: "q3",
    universe: "expense",
    title: "The phantom segment",
    brief:
      "From: Fraud analyst. Re: the checker that flagged everyone.\n\nA vendor-mix checker was supposed to flag accounts that touch Travel spend. It flagged EVERY account — and the bug review says the probe never correlated to the customer at all. Reproduce the checker exactly as shipped: count who it flags.",
    ask: "Count customers flagged by the uncorrelated Travel-spend probe.",
    template: `SELECT {3}(*) AS flagged
FROM customers
WHERE EXISTS (
  SELECT 1 FROM {1}
  WHERE {2} = {4}
);`,
    slots: [
      {
        answer: "expenses",
        kind: "keyword",
        label: "where spend lives",
        why: "Travel spend lives on the expense ledger. Reproducing the checker means reading the table it actually read.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the bucket the probe filtered",
        why: "The probe filtered on category = 'Travel'. That filter runs against the whole expense table with no customer link — the bug's core.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the flag tally",
        why: "The incident report quantifies the blast radius: COUNT(*) over the flagged customers prints it.",
      },
      {
        answer: "'Travel'",
        kind: "keyword",
        label: "the probe's literal",
        why: "The shipped checker tested the Travel bucket. Reproducing the blast radius means keeping its literal exactly.",
      },
    ],
    distractors: ["orders", "vendor", "'Legal'"],
    walkthrough:
      "The probe never links to customers — it asks whether ANY Travel expense exists, and 3 do. EXISTS therefore returns the same constant TRUE for every row, and the checker flags all 16 accounts: the phantom segment. Reading orders would crash on the missing category column, filtering the vendor column for 'Travel' matches no vendor name and would have flagged nobody — the bug that would have been, and 'Legal' spend does not exist, which would also have flagged zero.",
  },
  {
    id: "cs-1037",
    tier: "medium",
    topic: "q3",
    universe: "growth",
    title: "The final thirty",
    brief:
      "From: Growth lead. Re: retention wrap-up.\n\nThe wrap-up slide names the accounts that ordered in the store's final 30 days — measured from the newest order in the data, not from today, so the deck survives archives. Existence test with a computed window; keep it alphabetical.",
    ask: "List customers who ordered in the 30 days before the newest order, alphabetically.",
    template: `SELECT {2} FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id
    AND o.created_at >= (SELECT date({1}(created_at), {3}) FROM orders)
)
ORDER BY c.name;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the window's anchor",
        why: "The window anchors on the NEWEST order in the data. COUNT inside date() produces NULL and the window swallows everyone.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the slide's row label",
        why: "The slide names accounts. Projecting name keeps the rows readable; the fixed sort keeps it alphabetical.",
      },
      {
        answer: "'-29 day'",
        kind: "keyword",
        label: "the 30-day offset",
        why: "Thirty days inclusive means newest-date minus 29 days. Minus 59 would stretch the window to two months of flattery.",
      },
    ],
    distractors: ["COUNT", "'-59 day'", "city"],
    walkthrough:
      "The anchor scalar computes the newest order date — 2025-02-27 — and the offset opens a 30-day window from 2025-01-29. Six accounts ordered inside it: Alice Chen, Emma Wilson, Hiro Tanaka, Isabella Rossi, Maya Patel and Noah Meyer. COUNT as the anchor turns into date(103), a NULL, and the window excludes everybody, doubling the offset to 59 days would flatter the slide with 9 accounts, and projecting city would paste neighborhoods where names belong.",
  },
  {
    id: "cs-1038",
    tier: "hard",
    topic: "q3",
    universe: "fraud",
    title: "The always-true probe",
    brief:
      "From: Fraud analyst. Re: the second checker incident.\n\nA reviewer wrote a probe for accounts with a 'returned' order — but wrapped the check around an AGGREGATE instead of a plain column. Aggregate probes return a row even when they find nothing, so the probe flags everyone. Reproduce it: count the false positives.",
    ask: "Count customers flagged by the aggregate-wrapped 'returned' probe.",
    template: `SELECT {2}(*) AS false_positives
FROM customers c
WHERE EXISTS (
  SELECT {1} FROM orders o
  WHERE o.customer_id = c.{3} AND o.status = 'returned'
);`,
    slots: [
      {
        answer: "MAX(o.total)",
        kind: "keyword",
        label: "the aggregate wrapper",
        why: "MAX over an empty set still returns one row — with NULL inside — so EXISTS sees a row and passes everyone. That is the bug being reproduced.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the incident tally",
        why: "The incident report counts the wrongly flagged accounts: COUNT(*) over all survivors prints it.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the account key",
        why: "The correlation ties each order to its account. A misspelled key would break the probe in a different way than the bug being studied.",
      },
    ],
    distractors: ["o.total", "supplier_id", "rating"],
    walkthrough:
      "Because MAX always emits one row — even over an empty set, carrying NULL — the EXISTS test passes for every account, and the probe flags all 16: a perfect false positive, since no 'returned' order exists at all. Unwrapping the aggregate to the plain column o.total makes the empty set vanish and flags nobody, which is exactly why the wrapper — not the impossible status — is the bug. And a mis-keyed correlation like supplier_id or rating crashes outright: with the wrapper in place, the probe would have flagged everyone through any filter it could parse.",
  },
  {
    id: "cs-1039",
    tier: "hard",
    topic: "q3",
    universe: "month-close",
    title: "The dispute that isn't",
    brief:
      "From: Controller. Re: disputed-paper search.\n\nQuarter-end asks for accounts touched by a 'refunded' invoice — except this ledger has never recorded that state. The honest query still gets built and still returns its honest zero. Build the existence probe and count what it finds.",
    ask: "Count customers flagged by the refunded-invoice existence probe.",
    template: `SELECT {3}(*) AS dispute_hits
FROM customers
WHERE {2} (
  SELECT 1 FROM {1}
  WHERE status = {4}
);`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the searched ledger",
        why: "Refunds-as-paperwork would live on invoices. The probe reads the ledger the controller described, even though it holds no such state.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the probe's shape",
        why: "The question is whether any refunded document exists per account. NOT EXISTS would count everyone untouched — all 16.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the honest zero",
        why: "COUNT(*) is the aggregate that reports an empty result as a real 0 — the figure the close checklist files.",
      },
      {
        answer: "'refunded'",
        kind: "keyword",
        label: "the state that never was",
        why: "The search keys on 'refunded' exactly as written in the request. This store records paid, open and void — nothing else.",
      },
    ],
    distractors: ["'open'", "NOT EXISTS", "customers"],
    walkthrough:
      "The probe searches invoices for a 'refunded' state that the ledger has never recorded, so every account's existence test comes back false and COUNT reports the honest 0 — the checklist's proof that no refund paperwork exists. Probing 'open' instead would flip the probe to constant-TRUE and flag all 16 accounts, NOT EXISTS would count the 16 untouched accounts, and reading status from customers crashes because customers has no status column.",
  },
  {
    id: "cs-1040",
    tier: "hard",
    topic: "q3",
    universe: "growth",
    title: "The cold-account myth",
    brief:
      "From: Growth lead. Re: the reactivation myth.\n\nSales keeps asking for the 'cold account' list — customers with no shipped-or-delivered order ever. The lead wants the myth quantified before the next pipeline meeting: build the double-status anti-existence test and count what comes back.",
    ask: "Count customers with no shipped and no delivered orders.",
    template: `SELECT {3}(*) AS cold_accounts
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id AND o.status {1} ('shipped', {2})
);`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the two-state test",
        why: "One IN with two items covers both proof states in a single predicate. NOT IN would invert the probe and count the accounts WITH movement.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the second proof state",
        why: "Delivered boxes count as movement just like shipped ones. Leaving it out would only test the shipped state.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the myth's number",
        why: "The meeting needs the myth quantified: COUNT(*) over the anti-existence survivors prints it.",
      },
    ],
    distractors: ["NOT IN", "'returned'", "SUM"],
    walkthrough:
      "The anti-existence probe keeps accounts where neither a shipped nor a delivered order exists — and it finds nobody: all 16 accounts have at least one moved box, so the cold-account list is empty and the myth dies at zero. NOT IN would invert the probe to the 8 accounts with no pending-or-cancelled noise, swapping in 'returned' would collapse the list to never-shipped accounts — six real names, but the wrong question — and SUM(*) cannot tally accounts.",
  },
  {
    id: "cs-1041",
    tier: "easy",
    topic: "q4",
    universe: "month-close",
    title: "The paper trail stamp",
    brief:
      "From: Controller. Re: billing-ops review header.\n\nThe review header names our most-billed account with the count stamped beside it — computed per customer, not eyeballed. A correlated scalar counts each account's invoices as the outer query walks the roster. Who tops the paperwork league?",
    ask: "Show the customer with the most invoices and their invoice count.",
    template: `SELECT c.name, (
  SELECT {1}(*) FROM {2} i
  WHERE i.customer_id = c.id
) AS bills
FROM customers c
ORDER BY bills DESC
LIMIT {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the paperwork counter",
        why: "The league is measured in documents per account. SUM would add cent amounts — a spend league, not a paperwork league.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "where the trail lives",
        why: "Bills are invoice rows. Counting payments would measure settlements, not paperwork issued.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the leader's row count",
        why: "The header names one leader. It is a presentation constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["SUM", "payments", "3"],
    walkthrough:
      "The correlated scalar counts invoices per account as the outer query walks the roster, and the sort surfaces the leader: Alice Chen with 5 bills — the deepest paper trail in the book. Summing would rank by cent totals and stamp a dollar figure where the count belongs, counting payments would measure settled cash instead of issued documents, and LIMIT 3 would overflow the one-row header.",
  },
  {
    id: "cs-1042",
    tier: "easy",
    topic: "q4",
    universe: "inventory",
    title: "The lowest floor",
    brief:
      "From: Ops analyst. Re: smallest-basket case study.\n\nThe case study needs the account whose SMALLEST order is the smallest in the book — their floor ticket, computed per customer. The correlated scalar takes each account's minimum; the sort finds whose floor sits lowest.",
    ask: "Show the customer with the smallest minimum order and that order's value.",
    template: `SELECT c.name, (
  SELECT {1}(o.total) FROM orders o
  WHERE o.customer_id = c.{2}
) AS edge
FROM customers c
ORDER BY edge {3}
LIMIT 1;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor finder",
        why: "The case study keys on each account's smallest ticket. MAX would measure ceilings and crown a whale instead.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the correlation key",
        why: "The scalar correlates orders to their account through the customer key. Any other column breaks the per-account framing.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lowest-first sort",
        why: "The lowest floor comes first in ascending order. DESC would surface the highest floor — the opposite case study.",
      },
    ],
    distractors: ["MAX", "DESC", "email"],
    walkthrough:
      "The correlated scalar takes each account's MIN(total); ascending sort surfaces the lowest floor in the book: Maya Patel at 25.47 — the accessory basket that anchors the case study. MAX would measure each account's ceiling and hand the study Olivia Brown's 444.80 as the smallest of the big ones, DESC would profile the highest floor instead, and correlating on email matches no orders, leaving NULLs where a floor should be.",
  },
  {
    id: "cs-1043",
    tier: "easy",
    topic: "q4",
    universe: "growth",
    title: "The freshest account",
    brief:
      "From: Growth lead. Re: re-engagement shortlist.\n\nThe shortlist opens with the account whose MOST RECENT order is the newest in the store — the freshest heartbeat in the book. The correlated scalar takes each account's latest order date; the sort finds whose heartbeat is freshest.",
    ask: "Show the customer with the most recent latest-order date.",
    template: `SELECT c.name, (
  SELECT {1}(o.created_at) FROM orders o
  WHERE o.customer_id = c.{2}
) AS last_order
FROM customers c
ORDER BY last_order {3}
LIMIT 1;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the recency stamp",
        why: "Most recent per account means MAX(created_at) inside the scalar. MIN would stamp each account's first-ever order instead.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the correlation key",
        why: "The scalar correlates orders to their account through the customer key. Any other column breaks the per-account framing.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the freshest-first sort",
        why: "The freshest heartbeat sorts first in descending order. ASC would surface the stalest account — the churn list, not the shortlist.",
      },
    ],
    distractors: ["MIN", "ASC", "email"],
    walkthrough:
      "The correlated scalar stamps each account's newest order date, and the descending sort crowns the freshest: Emma Wilson, whose latest order lands on 2025-02-27 — the store's final order of the window. MIN would stamp first-ever orders and crown a 2024 account, ASC would surface the stalest heartbeat for the churn deck instead, and correlating on email matches nothing, leaving the shortlist dateless.",
  },
  {
    id: "cs-1044",
    tier: "medium",
    topic: "q4",
    universe: "pricing",
    title: "Laggards in their lane",
    brief:
      "From: Pricing analyst. Re: lane-relative value study.\n\nThe study flags products priced BELOW their own category's average — laggards relative to their lane, not the catalog. The correlated scalar computes each product's category mean; the outer query keeps the under-performers. Names, alphabetical, for the review.",
    ask: "List products priced below their own category's average, alphabetically.",
    template: `SELECT p.name FROM products p
WHERE p.price {1} (
  SELECT {2}(p2.price) FROM products p2
  WHERE p2.{3} = p.category
)
ORDER BY p.name;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the laggard edge",
        why: "Laggards sit strictly below their lane's mean. > would list the lane leaders instead — the mirror study.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the lane mean",
        why: "Each product is measured against its category's average. MIN would measure against the lane floor, which nothing can fall below.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the lane key",
        why: "The correlation groups each product with its own category. Correlating on name or id would compare a product only with itself.",
      },
    ],
    distractors: [">", "MIN", "name"],
    walkthrough:
      "The correlated scalar averages prices within each product's own category — Wearables against 139.50, Audio against 109.66 — and the comparison keeps the 8 products under their lane's mean, from the HDMI cable (14.99 under a 27.49 lane) to the Fitness Band (79.00 under 139.50). One product — the Ring Light — sits exactly on its lane mean, so the strict edge matters. Flipping to > would list the 7 lane leaders, MIN would set impossible floors and return nobody, and correlating on name would average a product against itself, flagging no one.",
  },
  {
    id: "cs-1045",
    tier: "medium",
    topic: "q4",
    universe: "supplier",
    title: "Below the neighborhood bar",
    brief:
      "From: Procurement. Re: regional rating audit.\n\nThe audit lists suppliers rated below their own region's average — partners dragging their neighborhood down. The correlated scalar computes each region's mean; the outer query keeps the below-bar names with their region bar stamped alongside.",
    ask: "List suppliers rated below their own region's average, with the region average.",
    template: `SELECT s.name, s.rating, (
  SELECT ROUND(AVG(s2.rating), 2) FROM {3} s2
  WHERE s2.region = s.region
) AS region_avg
FROM suppliers s
WHERE s.rating {1} (
  SELECT AVG(s2.rating) FROM suppliers s2 WHERE s2.{2} = s.region
)
ORDER BY s.rating;`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the below-bar edge",
        why: "The audit flags strictly-below-bar partners. > would list the region leaders — the praise list, not the audit.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the neighborhood key",
        why: "The correlation ties each supplier to its own region. Correlating on rating would compare a supplier only with equally-rated peers.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the audit's home table",
        why: "Ratings live on suppliers. The correlated scalar must re-read the same table per region; products carry no ratings.",
      },
    ],
    distractors: [">", "rating", "products"],
    walkthrough:
      "The correlated scalar computes each supplier's regional bar — EU averages 4.7, APAC 4.0 — and the comparison keeps the two partners below their neighborhood: Nordic Gadgets at 4.6 under the EU's 4.7, and Pacific Textiles at 3.9 under APAC's 4.0. The US and LATAM suppliers define their own one-member bars, so they can never fall below themselves. Flipping to > would audit the four leaders instead, correlating on rating would compare peers only with their rating twins and flag nobody, and products has no rating column to average.",
  },
  {
    id: "cs-1046",
    tier: "medium",
    topic: "q4",
    universe: "fraud",
    title: "Flawless from the floor",
    brief:
      "From: Fraud analyst. Re: the perfect-basket club.\n\nThe club nobody talks about: accounts whose WORST order still beats the storewide average. One order and it cleared the bar, or a dozen and every one did — the correlated scalar takes each account's floor and the comparison tests it against the house bar.",
    ask: "Count customers whose smallest order still beats the storewide average.",
    template: `SELECT COUNT(*) AS flawless
FROM customers c
WHERE (
  SELECT {1}(o.total) FROM orders o
  WHERE o.customer_id = c.id
) {2} (
  SELECT {3}(total) FROM orders
);`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the account's floor",
        why: "Every order beating the bar means the FLOOR beats the bar — MIN is the strictest test. MAX would pass anyone with one big order.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the beat-the-bar edge",
        why: "Club entry is strictly above the house bar. < would count the accounts whose floor falls short — the other fourteen.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the house bar",
        why: "The bar is the storewide average, about 338.19. MAX would set the bar at the 1088.44 ceiling, which no floor can clear.",
      },
    ],
    distractors: ["MAX", "<", "SUM"],
    walkthrough:
      "The correlated scalar takes each account's MIN(total) and tests it against the storewide average of about 338.19. Only two accounts clear it: Liam O'Brien, whose single order is a 705.39 basket, and Olivia Brown, whose only ticket is 444.80 — with one order each, their floor IS their whole story. MAX would test ceilings and pass all 16 accounts, < would count the 14 whose floors fall short, and SUM cannot build an average bar.",
  },
  {
    id: "cs-1047",
    tier: "medium",
    topic: "q4",
    universe: "growth",
    title: "Personal blowouts",
    brief:
      "From: Growth lead. Re: self-relative splash study.\n\nThe study counts orders at more than DOUBLE their own account's average — tickets that splashed relative to their owner's habits, not the store's. The correlated scalar computes each account's mean; the multiplier doubles it inline.",
    ask: "Count orders above twice their own customer's average order value.",
    template: `SELECT COUNT(*) AS blowouts
FROM orders o
WHERE o.total {2} {1} * (
  SELECT AVG(o2.total) FROM orders o2
  WHERE o2.customer_id = o.{3}
);`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the splash multiple",
        why: "Double the personal average is the study's bar. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the splash edge",
        why: "Splashes sit strictly above the doubled bar. < would count the quiet majority below it instead.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the personal key",
        why: "The scalar averages each order's OWN account. Correlating on any other column measures against strangers' habits.",
      },
    ],
    distractors: ["3", "<", "region"],
    walkthrough:
      "The correlated scalar computes each order's owner average, the multiplier doubles it, and the comparison keeps the 13 orders that more than double their owner's habits — Farid's 1088.44 against his own baseline, Chloe's 945.21 against hers. Tripling the multiple empties the list (no order triples its owner's mean), flipping the edge counts the 90 quiet orders, and correlating on region crashes because orders carry no region column.",
  },
  {
    id: "cs-1048",
    tier: "hard",
    topic: "q4",
    universe: "growth",
    title: "The delivered crown",
    brief:
      "From: Growth lead. Re: the annex nobody predicted.\n\nLifetime-spend leaderboards count cancelled optimism. The annex ranks accounts by DELIVERED spend only — money actually received. The correlated scalar sums each account's delivered orders; the sort crowns whoever really leads. The answer will surprise the deck.",
    ask: "Show the customer with the highest delivered-only spend.",
    template: `SELECT c.name, (
  SELECT ROUND({1}(o.total), 2) FROM orders o
  WHERE o.customer_id = c.id AND o.status = {2}
) AS d_spend
FROM customers c
ORDER BY d_spend {3}
LIMIT 1;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the received-money counter",
        why: "The annex ranks by total delivered spend. MAX would rank by one biggest delivered order — a different crown.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the received-only state",
        why: "Only delivered orders count as received money. Including shipped would credit parcels still on trucks.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the crown-first sort",
        why: "The annex leads with the crown, so descending sort. ASC would surface a customer with no delivered orders at all.",
      },
    ],
    distractors: ["MAX", "'shipped'", "ASC"],
    walkthrough:
      "The correlated scalar sums delivered totals per account, and the descending sort crowns Grace Kim at 3054.89 — NOT Alice Chen, whose 2961.81 delivered falls short of her cancelled-heavy 7262.35 lifetime figure. The delivered ledger reshuffles the throne. MAX would crown the biggest single delivered ticket (Farid's 1088.44) instead of the biggest delivered total, summing shipped would crown Emma Wilson's in-transit 3822.38, and ASC would lead the annex with Liam's NULL — no delivered orders at all.",
  },
  {
    id: "cs-1049",
    tier: "hard",
    topic: "q4",
    universe: "fraud",
    title: "The peak club",
    brief:
      "From: Fraud analyst. Re: peak-ticket review scope.\n\nThe review scopes to accounts whose single BIGGEST order clears 800 — one whale ticket puts you in, whatever the rest of the history says. The correlated scalar takes each account's peak; the comparison applies the bar.",
    ask: "Count customers whose biggest single order exceeds 800.",
    template: `SELECT COUNT(*) AS peak_club
FROM customers c
WHERE (
  SELECT {1}(o.total) FROM orders o
  WHERE o.customer_id = c.id
) {2} {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the peak finder",
        why: "The club keys on each account's single biggest ticket. AVG would test typical behavior — nobody's average clears 800.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the entry edge",
        why: "Entry requires strictly exceeding 800. < would count the fourteen accounts whose peaks fall short.",
      },
      {
        answer: "800",
        kind: "number",
        noVerify: true,
        label: "the review bar",
        why: "800 is the stakeholder-set scope bar. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
    ],
    distractors: ["AVG", "<", "1000"],
    walkthrough:
      "The correlated scalar takes each account's peak ticket, and four clear the 800 bar: Farid Nasser 1088.44, Chloe Dubois 945.21, Emma Wilson 845.92 and Grace Kim 826.03 — Alice's 767.64 peak just misses despite her league-topping lifetime spend. Testing averages instead would admit nobody (no account's mean clears 800), flipping the edge counts the twelve accounts below the bar, and a 1000 bar would leave Farid alone in the club.",
  },
  {
    id: "cs-1050",
    tier: "hard",
    topic: "q4",
    universe: "refund-audit",
    title: "The kill-heavy test",
    brief:
      "From: Refunds lead. Re: churn-risk hypothesis.\n\nThe hypothesis: some account cancels more than they complete — more killed orders than delivered ones. The test compares two correlated counts per account. If nobody qualifies, the hypothesis dies at zero and the deck says so.",
    ask: "Count customers with more cancelled orders than delivered orders.",
    template: `SELECT COUNT(*) AS kill_heavy
FROM customers c
WHERE (
  SELECT {1}(*) FROM orders o
  WHERE o.customer_id = c.id AND o.status = {2}
) {3} (
  SELECT COUNT(*) FROM orders o2
  WHERE o2.customer_id = c.id AND o2.status = 'delivered'
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the kill counter",
        why: "The test compares tallies of orders, not their value. SUM would compare dollar sums — a spend test, not a frequency test.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the kill side",
        why: "The hypothesis is about kills outnumbering completions. Testing any other state answers a different question.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the outnumbering edge",
        why: "Kill-heavy means strictly more kills than deliveries. >= would also count the one account where the two tally equal.",
      },
    ],
    distractors: ["SUM", "vendor", "<"],
    walkthrough:
      "Two correlated counts face off per account — kills against completions — and nobody's kills outnumber their deliveries: the count is the honest 0, and the churn hypothesis dies. The closest call is the account whose kills exactly tie its deliveries, which the strict > correctly excludes but >= would catch. SUM(*) cannot tally rows, vendor is not an order column so the kill side would crash, and < would count the fifteen accounts whose deliveries outnumber their kills — the healthy majority, not the hypothesis.",
  },
];
