// Case batch Q1 — Module 4 (subqueries & CTEs) cases cs-901…cs-950, wave 1.
// 50 cases: 17 easy / 17 medium / 16 hard across topics q1 (IN subqueries) ×15,
// q2 (scalar subqueries) ×15, q3 (EXISTS tests) ×10, q4 (correlated) ×10.
// Every figure was probed against the live seed db (scripts/m4-cases-facts.ts,
// receipts C01–C100 + scripts/m4-facts-out.txt P01–P56) and is mechanically
// re-verified by scripts/case-audit.ts (structure, execution, figure-in-cell,
// distractor consequence, prose gates, nested-subquery requirement for q1–q5).

import type { CaseStudy } from "./types";

export const casesQ1: CaseStudy[] = [
  {
    id: "cs-901",
    tier: "easy",
    topic: "q1",
    universe: "refund-audit",
    title: "The cancelled club",
    brief:
      "From: Refunds lead. Re: goodwill outreach.\n\nWe killed seven orders last quarter and customer success wants to call every account that touched one before we write the apology emails. Pull the member list of the cancelled club straight from the live tables — memory drifts, the database doesn't.",
    ask: "List the customers who have at least one cancelled order, alphabetically.",
    template: `SELECT name FROM customers
WHERE id IN (
  SELECT customer_id FROM {1}
  WHERE {2}
)
ORDER BY {3};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the blacklist's source table",
        why: "Cancelled lives on orders, so the inner query reads orders and hands back the customer_id values to match against customers.id.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "the club's entry rule",
        why: "Only cancelled orders mint membership. The inner WHERE filters orders down to the 7 cancelled rows before their customer_ids feed the IN list.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the outreach column",
        why: "Success dials people, not ids: the outer SELECT projects name so the sheet is readable, and the same column drives the alphabetical sort.",
      },
    ],
    distractors: ["suppliers", "status = 'pending'", "total"],
    walkthrough:
      "The inner query scans orders, keeps the 7 cancelled rows, and yields their customer_ids — 4 distinct accounts after duplicates collapse, because IN is a set test, not a row-by-row join. The outer query keeps exactly those 4 customers and prints names in alphabetical order: Alice Chen, Emma Wilson, Keiko Sato, Maya Patel. Pointing the inner FROM at suppliers would crash (no customer_id there), filtering for pending would build the wrong club (8 members), and sorting by total fails because customers has no such column.",
  },
  {
    id: "cs-902",
    tier: "easy",
    topic: "q1",
    universe: "month-close",
    title: "Everyone but the four",
    brief:
      "From: Controller. Re: close checklist item 2.\n\nThe refund reserve only applies to accounts that actually had a cancelled order, so for the workbook I need the complement. How many customers are NOT on that blacklist? One clean figure for the cell, nothing else.",
    ask: "Count the customers with no cancelled orders at all.",
    template: `SELECT {3}(*) AS still_clean
FROM customers
WHERE id {1} (
  SELECT customer_id FROM orders
  WHERE {2}
);`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the complement test",
        why: "The brief wants everyone outside the blacklist. NOT IN keeps customers whose id never appears among the cancelled orders' customer_ids.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "the blacklist's entry rule",
        why: "The exclusion list must be built from cancelled rows only — that is the reserve's trigger condition, nothing else.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the head-counter",
        why: "The deliverable is a single figure for a workbook cell. COUNT(*) collapses the surviving rows to one number; SUM has nothing to add here.",
      },
    ],
    distractors: ["IN", "status = 'shipped'", "SUM"],
    walkthrough:
      "The inner query builds the cancelled blacklist — 7 orders, 4 distinct customer_ids. NOT IN then keeps every customer whose id is absent from that list: 12 of the 16 accounts. Flipping to IN would return the blacklist itself (4 names, the opposite deliverable), filtering the inner query for shipped would exclude the wrong club (the shipped club has 10 members, leaving 6), and SUM(*) is not SQL — aggregates need a column or a star with COUNT.",
  },
  {
    id: "cs-903",
    tier: "easy",
    topic: "q1",
    universe: "supplier",
    title: "Regions our best suppliers call home",
    brief:
      "From: Expansion analyst. Re: partner-map slide.\n\nLeadership only wants to see demand we can service through our top-tier supply partners — anyone rated 4.4 or better. Count the customers living in regions where such a supplier operates. The slide needs one bulletproof number.",
    ask: "Count customers whose region hosts a supplier rated 4.4 or higher.",
    template: `SELECT COUNT(*) AS reachable
FROM customers
WHERE region IN (
  SELECT region FROM {1}
  WHERE rating {2} {3}
);`,
    slots: [
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the partner table",
        why: "Ratings live on suppliers. The inner query reads suppliers so the region list reflects the partner footprint, not the customer's own table.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the top-tier boundary",
        why: "Top-tier means 4.4 or better — Midwest Hardware sits exactly on 4.4 and the brief explicitly includes it, so the boundary must be inclusive.",
      },
      {
        answer: "4.4",
        kind: "number",
        noVerify: true,
        label: "the rating bar",
        why: "The stakeholder set the bar at 4.4. It is a filter literal, not an output figure, so it never needs to appear in the result cells.",
      },
    ],
    distractors: ["customers", ">", "4.6"],
    walkthrough:
      "The inner query keeps suppliers rated 4.4 or better — Alpine Audio 4.8 (EU), Nordic Gadgets 4.6 (EU), Midwest Hardware 4.4 (US) — and yields the region list {EU, US}. IN then matches customers living in either region: 8 EU plus 2 US equals 10. A strict > would quietly drop Midwest and shrink the answer to 8, a 4.6 bar would do the same by excluding both Midwest and nobody else, and reading ratings from customers crashes because customers carries no rating column.",
  },
  {
    id: "cs-904",
    tier: "easy",
    topic: "q1",
    universe: "funnel",
    title: "Carts still hot",
    brief:
      "From: Lifecycle marketer. Re: recovery flow v3.\n\nThe recovery flow only fires for accounts with an order still sitting in pending — those are the shoppers we can still win. Give me the names, alphabetical, and I'll wire them into the audience builder before the next send window.",
    ask: "List customers who currently have at least one pending order, alphabetically.",
    template: `SELECT {1} FROM customers
WHERE id {2} (
  SELECT customer_id
  FROM {3}
  WHERE status = 'pending'
)
ORDER BY name;`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the audience column",
        why: "The audience builder consumes names, not ids. The outer projection must be the column success actually pastes into the tool.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the membership test",
        why: "We want customers whose id appears in the pending list. IN is the set-membership test; NOT IN would invert the audience to the wrong eight people.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where pending lives",
        why: "Status is an order attribute. The inner query reads orders and returns the customer_ids behind the 14 pending rows.",
      },
    ],
    distractors: ["city", "NOT IN", "products"],
    walkthrough:
      "The inner query keeps the 14 pending orders and collapses them to 8 distinct customer_ids — IN deduplicates by construction. The outer query prints those 8 names alphabetically: Alice Chen, Chloe Dubois, Emma Wilson, Farid Nasser, Grace Kim, Keiko Sato, Maya Patel, Pedro Alvarez. Swapping in NOT IN targets exactly the other eight accounts, projecting city would paste neighborhoods into a name field, and reading pending from products fails because products has no status column.",
  },
  {
    id: "cs-905",
    tier: "medium",
    topic: "q1",
    universe: "catalog",
    title: "Audio appetite",
    brief:
      "From: Merchandising analyst. Re: accessory bundling test.\n\nBefore we design the speaker-bundle promo I need the reach of the Audio category: how many distinct baskets actually contain at least one audio product? Basket count, not line count — the CFO will ask.",
    ask: "Count distinct orders that include at least one product from the Audio category.",
    template: `SELECT COUNT(DISTINCT order_id) AS audio_orders
FROM order_items
WHERE product_id {1} (
  SELECT id FROM {2}
  WHERE category = {3}
);`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the category membership test",
        why: "Each order_item's product_id must appear in the Audio id list. IN is the membership test; NOT IN would count baskets that deliberately contain no audio.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "where categories live",
        why: "Category is a product attribute. The inner query reads products and returns the ids of the three audio products in the catalog.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the category chip",
        why: "The bundle is scoped to the Audio category — Bluetooth Speaker Mini, Studio Desktop Mic, Noise-Canceling Headset. The literal must match the stored spelling exactly.",
      },
    ],
    distractors: ["NOT IN", "suppliers", "'Video'"],
    walkthrough:
      "The inner query returns the three Audio product ids. The outer query keeps every order_item whose product_id is in that list — 51 line items — then COUNT(DISTINCT order_id) collapses them to 46 distinct baskets; the DISTINCT is what stops a 3-speaker order from counting three times. NOT IN would measure the 57 audio-free baskets instead, pointing the inner query at suppliers crashes on the missing category column, and 'Video' would build the wrong promo (only 30 baskets).",
  },
  {
    id: "cs-906",
    tier: "medium",
    topic: "q1",
    universe: "month-close",
    title: "Orders on open books",
    brief:
      "From: AR analyst. Re: dunning prioritization.\n\nSix accounts are currently carrying an open invoice. Before Legal tightens terms I want to know how exposed we are: how many order rows in total sit on those six accounts? It is the exposure denominator for the dunning model.",
    ask: "Count orders placed by customers who currently have an open invoice.",
    template: `SELECT {3}(*) AS active_risk
FROM orders
WHERE customer_id IN (
  SELECT customer_id FROM {1}
  WHERE {2}
);`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the open-book table",
        why: "Openness is an invoice state. The inner query must read invoices — orders themselves never carry a billing status.",
      },
      {
        answer: "status = 'open'",
        kind: "keyword",
        label: "the openness filter",
        why: "Only the 6 open invoices define the exposed accounts. paid would broaden to the 21 settled books and void would narrow to a single cancelled one.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the exposure counter",
        why: "The deliverable is one exposure figure. COUNT(*) tallies the qualifying order rows; SUM would try to add the star and fail.",
      },
    ],
    distractors: ["orders", "status = 'paid'", "SUM"],
    walkthrough:
      "The inner query picks the 6 open invoices and yields their customer_ids: Alice, Chloe, Emma, Isabella, Liam and Pedro. The outer query counts every order those six ever placed — 55 rows, from Alice's 24 down to Liam's single order. Reading the inner list from orders self-referentially finds zero 'open' statuses (that word never appears on orders), switching to paid measures settled accounts instead, and SUM(*) is a type error, not a counter.",
  },
  {
    id: "cs-907",
    tier: "hard",
    topic: "q1",
    universe: "fraud",
    title: "Twins of the whale",
    brief:
      "From: Fraud analyst. Re: sampler validation.\n\nThe sampler's unit of work is the PAIR (customer, status), never either key alone — we proved last sprint that matching keys separately drags in strangers. First validation run: every order sharing the biggest order's exact (customer, status) tuple. Report what the net catches.",
    ask: "Return orders whose (customer_id, status) tuple matches the store's biggest order, by id.",
    template: `SELECT id, total
FROM {3}
WHERE ({1}, {2}) IN (
  SELECT customer_id, status FROM orders
  WHERE total = (SELECT MAX(total) FROM orders)
)
ORDER BY id;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the tuple's owner key",
        why: "The sampler matches (customer_id, status) as one value. Sitting id in that seat would compare the order's own row number against a customer id — a different question entirely.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the tuple's state key",
        why: "The pair only bites when both seats line up: the same buyer AND the same lifecycle state as the whale order.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the tuple's home table",
        why: "Both tuple fields are order attributes — the right-hand list must be built from orders for the column names to even resolve.",
      },
    ],
    distractors: ["id", "total", "customers"],
    walkthrough:
      "The biggest order is #74 — 1088.44 from customer 6, still pending. The row-value IN keeps orders whose (customer_id, status) equals (6, 'pending'): exactly 1 row, because the whale itself is customer 6's only pending order. A row-value IN over a subquery is legal SQL as long as both sides list the same fields in the same order. Swapping the first seat to id asks 'is this order #6 AND pending?', which no row satisfies; seating total pairs a money value against a status string and nets zero; building the right-hand list from customers crashes on the missing status column.",
  },
  {
    id: "cs-908",
    tier: "medium",
    topic: "q1",
    universe: "refund-audit",
    title: "The void paper",
    brief:
      "From: Billing ops. Re: document retention.\n\nExactly one invoice in the system was voided, and compliance wants to know which account it belonged to before we archive the paperwork. Names only — the file room is organized by customer, not by invoice number.",
    ask: "List the customer attached to the voided invoice.",
    template: `SELECT {3}
FROM customers
WHERE id IN (
  SELECT {1} FROM invoices
  WHERE {2}
)
ORDER BY name;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the bridge column",
        why: "Invoices reference customers through customer_id. That is the only column in the inner query that can be matched against customers.id.",
      },
      {
        answer: "status = 'void'",
        kind: "keyword",
        label: "the void filter",
        why: "The archive request concerns the single voided document. The inner WHERE must isolate it before the customer_id is read.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the file-room label",
        why: "The file room shelves by customer name. The outer query projects name so the output is a filing instruction, not an id.",
      },
    ],
    distractors: ["order_id", "status = 'paid'", "city"],
    walkthrough:
      "The inner query filters invoices to the single void row and returns its customer_id. IN matches that id against customers and the outer SELECT prints the account name for the archive shelf. invoices has no order_id column — that path errors out immediately — filtering for paid would dump 21 invoices' worth of names into a one-folder request, and projecting city files geography where compliance asked for a name.",
  },
  {
    id: "cs-909",
    tier: "hard",
    topic: "q1",
    universe: "refund-audit",
    title: "The seatbelt clause",
    brief:
      "From: Data engineering. Re: staging import hardening.\n\nThe refund job computes its safe list with a NOT IN over a staging export that sometimes drops customer_id entirely. One NULL in that list and an unguarded NOT IN collapses to zero rows — silently. Ship the guarded version and verify it still returns the full clean count.",
    ask: "Count customers with no cancelled orders, using a NULL-proof guarded list.",
    template: `SELECT {3}(*) AS safe_customers
FROM customers
WHERE id {1} (
  SELECT customer_id FROM orders
  WHERE {2}
    AND customer_id IS NOT NULL
);`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the complement test",
        why: "The safe list is everyone outside the cancelled blacklist — the complement. NOT IN is the operator that expresses 'id absent from the list'.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "the blacklist's rule",
        why: "The staging job exports cancelled orders as the blacklist source. Any other status builds a list the refund job never asked for.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the verification counter",
        why: "Engineering verifies the guard by row count: the guarded query must return the full clean population, not a collapsed zero.",
      },
    ],
    distractors: ["IN", "status = 'shipped'", "SUM"],
    walkthrough:
      "Today every one of the 7 cancelled orders carries its customer_id, so the guarded list holds 4 distinct ids and NOT IN returns 12 — the same as the unguarded query would. The seatbelt is for tomorrow: the moment the staging export emits one NULL customer_id, an unguarded NOT IN turns every comparison into unknown and hands back zero rows, silently zeroing the refund batch. The IS NOT NULL guard pins the result at 12. IN would return the blacklist itself (4), a shipped-based list would clean out the wrong 10 members, and SUM(*) cannot count.",
  },
  {
    id: "cs-910",
    tier: "hard",
    topic: "q1",
    universe: "growth",
    title: "Stranded in LATAM",
    brief:
      "From: Strategy lead. Re: market exit debrief.\n\nWe exited LATAM last month but the orders that account placed are still in the fulfillment queue. Before the ops review I need the exact number of order rows we inherited from that region's buyer — the delegation will ask for the figure, not a shrug.",
    ask: "Count orders placed by customers from the LATAM region.",
    template: `SELECT {3}(*) AS stranded_orders
FROM {1}
WHERE customer_id IN (
  SELECT id FROM customers
  WHERE {2}
);`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the inherited rows",
        why: "The deliverable counts order rows, so the outer FROM must be orders; the customers table only supplies the region filter.",
      },
      {
        answer: "region = 'LATAM'",
        kind: "keyword",
        label: "the exited region",
        why: "The exit scoping is exact: LATAM only. Broadening to another region would hand the delegation an exposure number for a market we still operate.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the exposure counter",
        why: "One number goes in the deck. COUNT(*) reduces the matching orders to that single inherited-row figure.",
      },
    ],
    distractors: ["payments", "region = 'APAC'", "SUM"],
    walkthrough:
      "LATAM has exactly one customer — Bruno Silva — so the inner query returns his id and the outer query counts his order history: 2 stranded rows. The direction of the subquery matters: customers supplies the filtered ids, orders supplies the countable rows. Swapping the outer table for payments crashes on the missing customer_id, targeting APAC would count five accounts' worth of live business instead of an exit wound, and SUM(*) cannot tally rows.",
  },
  {
    id: "cs-911",
    tier: "medium",
    topic: "q1",
    universe: "month-close",
    title: "Tainted paperwork",
    brief:
      "From: Controller. Re: reserve audit.\n\nEvery invoice belonging to an account that had an order cancelled must be flagged for the reserve review — a cancelled order is our best early signal of a disputed bill. How many invoices carry that taint?",
    ask: "Count invoices belonging to customers with at least one cancelled order.",
    template: `SELECT COUNT(*) AS tainted_invoices
FROM invoices
WHERE customer_id {1} (
  SELECT customer_id FROM {2}
  WHERE {3}
);`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the taint test",
        why: "An invoice is tainted when its customer_id appears among the cancelled club. IN expresses exactly that membership; NOT IN would flag the healthy books.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where cancellations live",
        why: "Cancelled is an order state. The inner query must read orders to learn who the troubled accounts are before touching invoices.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "the taint's origin",
        why: "The reserve trigger is the cancelled status specifically — the other statuses say nothing about dispute risk.",
      },
    ],
    distractors: ["NOT IN", "payments", "status = 'void'"],
    walkthrough:
      "The inner query distills the 7 cancelled orders into 4 customer_ids. The outer query then counts invoices whose customer_id is in that list: 13 tainted documents out of the 28 on file. NOT IN would return the 15 clean invoices — the complement the controller explicitly did not ask for — reading the list from payments crashes on the missing customer_id, and a void filter marks the single cancelled document rather than the dispute-risk population.",
  },
  {
    id: "cs-912",
    tier: "medium",
    topic: "q1",
    universe: "inventory",
    title: "Wearable heat",
    brief:
      "From: Stock controller. Re: shelf-space review.\n\nWearables punch above their shelf weight and the floor team wants proof before the next planogram. Count the distinct baskets that touched the Wearables category — line items would inflate the story, baskets are the truth.",
    ask: "Count distinct orders containing at least one Wearables product.",
    template: `SELECT {1}(DISTINCT {2}) AS wearable_orders
FROM order_items
WHERE product_id IN (
  SELECT id FROM products
  WHERE {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally function",
        why: "The planogram argument needs one number. COUNT is the only aggregate that tallies rows; SUM would try to add product ids together.",
      },
      {
        answer: "order_id",
        kind: "keyword",
        label: "the basket key",
        why: "A basket is an order. Counting DISTINCT product_id would answer a shelf question with a two-product answer instead of 23 baskets.",
      },
      {
        answer: "category = 'Wearables'",
        kind: "keyword",
        label: "the category scope",
        why: "The inner query must isolate the Wearables products — Fitness Band X2 and Smart Watch S — so their ids form the membership list.",
      },
    ],
    distractors: ["SUM", "product_id", "category = 'Audio'"],
    walkthrough:
      "The inner query returns the two Wearables product ids. The outer query keeps the order_items rows carrying those ids and COUNT(DISTINCT order_id) compresses them to 23 distinct baskets. Tallying SUM(DISTINCT order_id) would add id numbers together and print an arithmetic accident, counting DISTINCT product_id would return 2 (the products themselves, not their reach), and swapping the scope to Audio would size the wrong category at 46 baskets.",
  },
  {
    id: "cs-913",
    tier: "hard",
    topic: "q1",
    universe: "growth",
    title: "Out of both hot zones",
    brief:
      "From: Retention lead. Re: win-back exclusions.\n\nA pending order means a shopper still in play; a cancelled one means damage control. The win-back email must reach accounts in NEITHER hot zone — cold enough to have walked away cleanly, warm enough to still read us. Count the eligible accounts.",
    ask: "Count customers whose orders are never pending and never cancelled.",
    template: `SELECT COUNT(*) AS untouched
FROM customers
WHERE id NOT IN (
  SELECT customer_id FROM orders
  WHERE status {1} ({2}, {3})
);`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the hot-zone test",
        why: "The blacklist collects rows that are pending OR cancelled — one IN with a two-item list. NOT IN inside the subquery would blacklist the wrong rows.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the first hot zone",
        why: "Pending is the in-play state the win-back must not touch — those shoppers are already mid-funnel.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the second hot zone",
        why: "Cancelled rows mark damage-control accounts that belong to the refunds flow, not a cheerful win-back blast.",
      },
    ],
    distractors: ["NOT IN", "'delivered'", "'shipped'"],
    walkthrough:
      "The inner query blacklists every row whose status is pending or cancelled — 21 orders collapsing to 8 distinct accounts, since the cancelled club is a strict subset of the pending club (all four cancelled regulars also hold a live cart). NOT IN keeps the complement: 8 customers with a perfectly clean, cold pipeline. Flipping the subquery to NOT IN would blacklist the calm majority instead, adding 'delivered' to the hot zones would swallow 15 of 16 accounts and strand a single survivor, and 'shipped' would push the blacklist to 13 accounts and leave only 3 eligible.",
  },
  {
    id: "cs-914",
    tier: "easy",
    topic: "q1",
    universe: "expense",
    title: "The pay-later ledger",
    brief:
      "From: Collections. Re: courtesy-call list.\n\nAccounts with a pending order get one courtesy call before we mention the paid invoices on file. Build the call sheet: how many paid invoices sit on accounts that also have a pending order right now?",
    ask: "Count paid invoices whose customer has at least one pending order.",
    template: `SELECT {3}(*) AS chase_list
FROM invoices
WHERE status = 'paid'
  AND customer_id IN (
    SELECT customer_id FROM {1}
    WHERE {2}
  );`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the pending source",
        why: "Pending is an order state, so the membership list must be built from orders — invoices cannot tell you who has a hot cart.",
      },
      {
        answer: "status = 'pending'",
        kind: "keyword",
        label: "the hot-cart filter",
        why: "The call policy targets accounts with a pending order. Any other status populates the list with the wrong accounts.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the list counter",
        why: "Collections wants the size of the call sheet. COUNT(*) prints the number of qualifying invoices in one cell.",
      },
    ],
    distractors: ["customers", "status = 'cancelled'", "SUM"],
    walkthrough:
      "The inner query returns the 8 accounts holding pending orders. The outer query intersects that set with the paid-invoice population: 14 paid documents sit on hot-cart accounts. Building the list from customers would hand back every paid invoice (21) because all 16 ids flow through, scoping to cancelled would key the sheet to dispute accounts instead, and SUM(*) adds nothing countable.",
  },
  {
    id: "cs-915",
    tier: "hard",
    topic: "q1",
    universe: "fraud",
    title: "Tuples of the five-hundred club",
    brief:
      "From: Fraud analyst. Re: sampler scale-up.\n\nThe tuple sampler now sweeps every order sharing a (customer, status) pair with ANY big-ticket row — anything over 500. Same-buyer-same-state rows travel together in disputes, so the sweep maps the blast radius of the big spenders. Report the sweep's yield.",
    ask: "Count orders whose (customer_id, status) tuple matches any order over 500.",
    template: `SELECT COUNT(*) AS flagged_rows
FROM orders
WHERE (customer_id, status) {1} (
  SELECT customer_id, status FROM orders
  WHERE total {2} {3}
);`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "the tuple membership test",
        why: "Row-value IN matches each order's pair against the club's pairs. NOT IN would sweep the rows OUTSIDE the blast radius — the sampler's exact opposite.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the club's entry bar",
        why: "Big-ticket means strictly over 500. The bar builds the right-hand list before any tuple matching happens.",
      },
      {
        answer: "500",
        kind: "number",
        noVerify: true,
        label: "the entry figure",
        why: "The 500 bar is a filter constant from the fraud playbook, not an output figure — it never needs to appear in the result cells.",
      },
    ],
    distractors: ["NOT IN", "<", "1000"],
    walkthrough:
      "The inner query collects the (customer_id, status) pairs of every order over 500; the row-value IN then keeps any order wearing one of those pairs — 66 of the 103 rows. Same buyer and same state travel together, so one whale order drags its whole lifecycle segment into the net. NOT IN would flag the 37 rows outside the blast radius, a bar under 500 sweeps the small-ticket tuples in as well and changes the yield, and 1000 would shrink the club to the single pending whale pair (6, 'pending'), netting exactly 1 row.",
  },
  {
    id: "cs-916",
    tier: "easy",
    topic: "q2",
    universe: "growth",
    title: "The bar to clear",
    brief:
      "From: Growth lead. Re: TL;DR for the board memo.\n\nI keep saying 'our typical order' in decks and someone always asks what typical means. This time I want the honest cut: how many orders clear the storewide average ticket? One figure, computed live, no rounded folklore.",
    ask: "Count orders whose total is above the storewide average order total.",
    template: `SELECT {3}(*) AS above_bar
FROM orders
WHERE total {1} (
  SELECT {2}(total) FROM orders
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the clearing direction",
        why: "Clearing the bar means being strictly above it. < would count the quiet majority below the average instead.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the bar's definition",
        why: "The average ticket is SUM over COUNT — exactly what AVG computes in one word. MAX would raise the bar to the single biggest order.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally",
        why: "The memo needs one number: how many orders clear the bar. COUNT(*) delivers it; SUM cannot count rows.",
      },
    ],
    distractors: ["<", "MAX", "SUM"],
    walkthrough:
      "The scalar subquery computes the storewide average once — 34833.28 spread over 103 orders is a bar at about 338.19 — and the outer query counts the orders strictly above it: 42. Because the true average (338.187…) is not a two-decimal number, no order ties it, so the strict > loses nobody to rounding. Pointing the comparison downward would count the 61 below-bar orders, MAX would raise the bar to 1088.44 and clear nobody, and SUM as the bar (34833.28) clears nobody either.",
  },
  {
    id: "cs-917",
    tier: "easy",
    topic: "q2",
    universe: "pricing",
    title: "The ceiling product",
    brief:
      "From: Pricing lead. Re: anchor SKU check.\n\nMarketing wants to anchor the catalog page on our most expensive product, but they refuse to name it from memory — if the catalog shifted under them the anchor would be wrong. Verify the ceiling SKU and its price from the live table.",
    ask: "Return the product whose price equals the catalog's maximum price.",
    template: `SELECT name, {3}
FROM products
WHERE price = (
  SELECT {1}(price) FROM {2}
);`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling function",
        why: "The anchor is the most expensive product, so the scalar subquery must return the maximum price. MIN would anchor the page on the cheapest cable.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the catalog table",
        why: "Prices live on products. The scalar subquery must scan the catalog for its ceiling — orders has no price column at all.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the anchor figure",
        why: "The page anchor shows the sticker: the row's price next to its name. That is the number shoppers compare against.",
      },
    ],
    distractors: ["MIN", "AVG", "orders", "category"],
    walkthrough:
      "The scalar subquery scans the 16-product catalog and returns the ceiling: 199.99. The equality match then hands back exactly one row — Smart Watch S — because no other product shares the top price. MIN would anchor the page on the HDMI cable at 14.99, AVG would set the match bar at about 71.78 which no product hits exactly (zero rows), reading price from orders crashes on the missing column, and projecting category instead of price would anchor the page on a word rather than a sticker.",
  },
  {
    id: "cs-918",
    tier: "easy",
    topic: "q2",
    universe: "growth",
    title: "Stamp the pipeline",
    brief:
      "From: RevOps analyst. Re: context strip for the CS dashboard.\n\nEvery row of the customer health sheet should carry the store's total order volume as context, so agents stop asking 'how big is the pipeline' in every thread. Stamp all 16 account rows with that one live figure.",
    ask: "Select every customer, each stamped with the store's total order count.",
    template: `SELECT {3},
  (SELECT {1}(*) FROM {2}) AS all_orders
FROM customers;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the volume counter",
        why: "Pipeline size is a row count. COUNT(*) inside the scalar subquery computes it in one pass; SUM has nothing to sum.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the pipeline table",
        why: "Order volume lives in orders. The uncorrelated scalar reads it once and hands the same figure to every outer row.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the row's identity",
        why: "The health sheet keys on the account name; the stamp rides along in a second column for context.",
      },
    ],
    distractors: ["SUM", "customers", "city"],
    walkthrough:
      "The scalar subquery is uncorrelated — it references no outer column — so SQLite evaluates it once and stamps the same figure on every row: 103 orders across all 16 customers. COUNT(*) is the only aggregate that turns rows into a volume; SUM(*) is a syntax error. Pointing the subquery back at customers would stamp 16 (accounts, not orders), and projecting city instead of name would key the health sheet by neighborhood.",
  },
  {
    id: "cs-919",
    tier: "easy",
    topic: "q2",
    universe: "supplier",
    title: "Best in class",
    brief:
      "From: Procurement. Re: partner-of-the-year plaque.\n\nThe plaque engraver needs our highest-rated supplier's name and exact rating, pulled from the system of record — last year someone engraved a supplier that had since slipped in the ratings and the plaque became a joke. Verify before engraving.",
    ask: "Return the supplier whose rating equals the highest rating on file.",
    template: `SELECT name, {3}
FROM {1}
WHERE rating = (
  SELECT {2}(rating) FROM suppliers
);`,
    slots: [
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the partner table",
        why: "Ratings live on suppliers, so both the outer row and the inner scalar read the same table — the equality then isolates the top partner.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the top-rating function",
        why: "Partner of the year means the maximum rating. MIN would engrave the supplier we quietly tolerate, not celebrate.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the engraved figure",
        why: "The plaque carries the exact score. The outer projection must repeat the rating column next to the name.",
      },
    ],
    distractors: ["products", "MIN", "AVG", "region"],
    walkthrough:
      "The scalar subquery reads the six supplier ratings and returns the ceiling: 4.8. Exactly one supplier sits on that score — Alpine Audio GmbH — so the equality hands back one clean row for the engraver. MIN would bottom-fish at 3.9, AVG would set the bar at exactly 4.3 which nobody holds (zero rows, and the engraver waits forever), products has no rating column at all, and projecting region would engrave a continent.",
  },
  {
    id: "cs-920",
    tier: "easy",
    topic: "q2",
    universe: "supplier",
    title: "Above the house average",
    brief:
      "From: Procurement. Re: quarterly scorecard.\n\nThe scorecard's top band is simple: any supplier whose rating beats the house average makes the cut, best first. Produce the band — name and score, sorted so the strongest partner leads.",
    ask: "List suppliers rated above the average supplier rating, strongest first.",
    template: `SELECT name, rating
FROM suppliers
WHERE rating {1} (
  SELECT {2}(rating) FROM suppliers
)
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the above-bar test",
        why: "Beating the average is a strict comparison. < would select the below-average tail of the bench.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the house average",
        why: "The bar is the mean of all six ratings — 25.8 spread over 6 lands exactly on 4.3. MAX would raise it to 4.8 and clear nobody.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the sort key",
        why: "Strongest first means the rows sort by the score itself, descending — name sorting would shuffle the leadership order.",
      },
    ],
    distractors: ["<", "MIN", "MAX", "name"],
    walkthrough:
      "The scalar subquery averages the six ratings to exactly 4.3, and three suppliers clear it strictly: Alpine Audio 4.8, Nordic Gadgets 4.6 and Midwest Hardware 4.4 — printed best-first because the sort key is the rating itself. Flipping the comparison would list the three laggards, MIN would clear almost everyone (only Pacific 3.9 fails), MAX would clear nobody, and sorting by name would hand the top of the scorecard to Nordic on alphabetics while Alpine sinks to third.",
  },
  {
    id: "cs-921",
    tier: "medium",
    topic: "q2",
    universe: "fraud",
    title: "Twice the typical",
    brief:
      "From: Fraud analyst. Re: velocity rule tuning.\n\nThe manual-review rule is blunt but effective: any single order worth at least twice the typical ticket gets eyes on it. Pull the flagged rows for the review queue — id and amount, biggest first — and tell me how loud the queue gets.",
    ask: "List orders with a total of at least twice the storewide average, biggest first.",
    template: `SELECT id, total
FROM orders
WHERE total > {1} * (
  SELECT {2}(total) FROM orders
)
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the velocity multiplier",
        why: "Twice the typical is the rule's written threshold. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the typical ticket",
        why: "The rule is written against the average order, not the median or the max — AVG computes exactly the bar the policy names.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the queue's sort key",
        why: "Reviewers work biggest-first. Sorting by total puts the whale at the top; sorting by id would bury it mid-queue.",
      },
    ],
    distractors: ["3", "MAX", "id"],
    walkthrough:
      "The scalar subquery computes the average ticket (about 338.19); doubling it sets the review bar at roughly 676.38, and 11 orders clear that bar — printed biggest-first so the 1088.44 whale leads the queue. Tightening to triple the average would shrink the queue to a single row, swapping AVG for MAX would raise the bar to the biggest order and flag nobody, and ordering by id would scatter the whales across the queue instead of leading with them.",
  },
  {
    id: "cs-922",
    tier: "medium",
    topic: "q2",
    universe: "month-close",
    title: "The delivered bar",
    brief:
      "From: Controller. Re: close checklist item 7.\n\nPending and cancelled tickets distort the honest average — money we have actually collected is what the delivered bar measures. Count how many orders of ANY status beat the delivered-only average; that spread is the reconcile note's headline.",
    ask: "Count orders whose total beats the average total of delivered orders only.",
    template: `SELECT COUNT(*) AS beating_deliveries
FROM orders
WHERE total {1} (
  SELECT {2}(total) FROM orders
  WHERE {3}
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the beating direction",
        why: "Beating the bar means strictly above it — the headline counts winners, not the field.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the honest mean",
        why: "The delivered-only average is the controller's clean bar: collected money only. MAX would set the bar at the best delivered ticket and clear almost nothing.",
      },
      {
        answer: "status = 'delivered'",
        kind: "keyword",
        label: "the collected-money filter",
        why: "The inner query must keep only delivered rows — that is what makes the bar 'honest'. Every status would drag pending and cancelled tickets into the mean.",
      },
    ],
    distractors: ["<", "MAX", "status = 'shipped'"],
    walkthrough:
      "The inner query averages only the 52 delivered orders — a bar at 299.44, lower than the all-status 338.19 because cancelled tickets skew fat. Counting every order strictly above that delivered bar yields 49 rows for the reconcile note. MAX would raise the bar to the best delivered ticket and clear just 6, shipping the bar to the 30 delivered-in-transit rows would land on 34 instead, and counting downward would report the 54 below-bar orders — the note's anti-headline.",
  },
  {
    id: "cs-923",
    tier: "medium",
    topic: "q2",
    universe: "pricing",
    title: "Category champions",
    brief:
      "From: Pricing lead. Re: shelf-price architecture.\n\nThe catalog should lead with categories whose typical item outranks the catalog's typical item. List each category whose average price beats the catalog-wide average price, with the average shown — those are the shelves worth merchandising first.",
    ask: "Return categories whose average product price exceeds the catalog average, with their averages.",
    template: `SELECT category, AVG(price) AS avg_price
FROM {1}
{3} category
HAVING {2}(price) > (
  SELECT AVG(price) FROM products
);`,
    slots: [
      {
        answer: "products",
        kind: "keyword",
        label: "the shelf's source",
        why: "Categories and prices live on products. The grouped scan must read the catalog table or there is nothing to average.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the typical-item measure",
        why: "Both the per-shelf figure and the catalog bar are averages — the HAVING comparison is average against average.",
      },
      {
        answer: "GROUP BY",
        kind: "keyword",
        label: "the shelf builder",
        why: "Per-category averages only exist after grouping. HAVING then filters those groups — WHERE cannot see aggregates at all.",
      },
    ],
    distractors: ["orders", "SUM", "ORDER BY"],
    walkthrough:
      "The query groups the 16 products into 7 shelves, averages each, and keeps only those beating the catalog-wide 71.78: Wearables at 139.50, Audio at 109.66 and Video at 84.50. Reading prices from orders crashes on the missing column, SUM would compare total shelf value against a single-item average and elect six shelves (Accessories' 82.47 total sneaks in), and ORDER BY cannot precede HAVING — the parser rejects the shape outright.",
  },
  {
    id: "cs-924",
    tier: "medium",
    topic: "q2",
    universe: "month-close",
    title: "The biggest bill",
    brief:
      "From: Controller. Re: concentration-risk footnote.\n\nThe footnote quantifies single-invoice concentration: the largest bill on file, shown in dollars. Pull the invoice number and its amount converted from cents — auditors cross-check the figure against the ledger, so precision matters.",
    ask: "Return the invoice with the largest amount, showing its number and dollar amount.",
    template: `SELECT {3}, amount_cents / 100.0 AS amount
FROM {2}
WHERE amount_cents = (SELECT {1}(amount_cents) FROM invoices);`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the concentration peak",
        why: "The footnote wants the single largest bill, so the scalar subquery returns the maximum cents value on file.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billing table",
        why: "Invoices carry amount_cents. The outer row must come from the same table the scalar measured.",
      },
      {
        answer: "number",
        kind: "keyword",
        label: "the document id",
        why: "Auditors reference documents by invoice number, not row id — the projection must carry the human-facing key.",
      },
    ],
    distractors: ["MIN", "AVG", "payments", "due_on"],
    walkthrough:
      "The scalar subquery finds the largest amount_cents on file; the equality match returns INV-2025-025, and dividing by 100.0 converts 614800 cents to 6148 dollars for the footnote. MIN would footnote the smallest bill instead, AVG would match no invoice (the mean falls between stored cent values), payments stores its own cents against payment events — its maximum (4015 dollars) is a different document class — and projecting due_on would footnote a date where auditors expect a number.",
  },
  {
    id: "cs-925",
    tier: "medium",
    topic: "q2",
    universe: "growth",
    title: "The price stamp",
    brief:
      "From: Growth lead. Re: category one-pager.\n\nEach shelf's row on the one-pager should carry the storewide average ORDER ticket as a benchmark column, next to the shelf's own average price. Build the whole shelf table in one query — no manual copy-paste of the benchmark.",
    ask: "List each category with its average price and the storewide average order total as a stamp.",
    template: `SELECT category, AVG(price) AS avg_price,
  (SELECT {1}(total) FROM {2}) AS store_bar
FROM products
GROUP BY {3};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the benchmark's math",
        why: "The storewide order benchmark is an average ticket. AVG inside the uncorrelated scalar computes it once for every shelf row.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the benchmark's source",
        why: "Average ORDER ticket is measured over orders. Reading total from products would crash — products has no order totals.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the shelf key",
        why: "One row per shelf means grouping by category. Grouping by anything else would mint the wrong rows.",
      },
    ],
    distractors: ["MAX", "products", "price"],
    walkthrough:
      "The scalar subquery is uncorrelated, so SQLite evaluates it once — the storewide average ticket 338.19 — and stamps it on all 7 shelf rows alongside each shelf's own average price. MAX would stamp the single biggest order (1088.44) as if it were typical, reading total from products fails immediately, and grouping by price would shred the one-pager into 16 one-product shelves instead of 7 categories.",
  },
  {
    id: "cs-926",
    tier: "hard",
    topic: "q2",
    universe: "growth",
    title: "The VIP bar",
    brief:
      "From: GM. Re: tier-model draft.\n\nThe draft tier model splits the base at the average LIFETIME spend per customer — store revenue divided by the customer count, not the order count. List the customers above that bar; they are the founding VIP tier and the number must survive finance scrutiny.",
    ask: "List customers whose lifetime spend exceeds the store's average lifetime spend per customer.",
    template: `SELECT {1}
FROM customers
WHERE (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) > (
  SELECT SUM(total) / {2} FROM {3}
);`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the VIP tier's roster",
        why: "The founding tier is a list of people. The projection must be the customer name for the announcement.",
      },
      {
        answer: "16",
        kind: "number",
        noVerify: true,
        label: "the customer-count divisor",
        why: "Per-CUSTOMER spend divides revenue by 16 accounts. This literal is a model constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where revenue accrues",
        why: "Lifetime spend accrues on orders; the scalar sums order totals and divides by the account count to place the bar.",
      },
    ],
    distractors: ["city", "103", "products"],
    walkthrough:
      "The bar is total revenue divided by customers: 34833.28 over 16 accounts is 2177.08 — the GM's bar, deliberately different from the 338.19 per-ORDER average. Five customers clear it: Alice Chen 7262.35, Emma Wilson 6640.56, Grace Kim 4574.23, Maya Patel 3644.56 and Chloe Dubois 2667.93. Dividing by 103 instead would drop the bar to 338.19 and let all 16 customers 'qualify' — the exact mistake the GM flagged. Reading revenue from products crashes, and a city roster makes a poor announcement.",
  },
  {
    id: "cs-927",
    tier: "hard",
    topic: "q2",
    universe: "pricing",
    title: "Below the halfway mark",
    brief:
      "From: Pricing lead. Re: entry-tier audit.\n\nThe entry tier is defined as anything priced under HALF the catalog's ceiling — that keeps the tier meaningful as the ceiling moves. Count the entry-tier products under the current ceiling so the buyer knows how deep the bench runs.",
    ask: "Count products priced below half the catalog's maximum price.",
    template: `SELECT {3}(*) AS budget_shelf
FROM products
WHERE price {1} (
  SELECT MAX(price) / {2} FROM products
);`,
    slots: [
      {
        answer: "<",
        kind: "keyword",
        label: "the under-bar test",
        why: "Entry tier means strictly below the halfway bar. > would count the premium end and reverse the shelf.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the halving constant",
        why: "Half the ceiling is the written rule. The divisor is a model constant — it never needs to appear in the result cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bench counter",
        why: "The buyer asked how deep the bench runs — one number. COUNT(*) delivers the depth of the entry tier.",
      },
    ],
    distractors: [">", "4", "SUM"],
    walkthrough:
      "The ceiling is 199.99, so the bar sits at 99.995 and 12 of the 16 products live under it — the entry tier is three-quarters of the catalog, which is exactly the depth the buyer wanted to know. Reversing the comparison would report the 4 premium products instead, dividing the ceiling by 4 would tighten the bar to about 50 and cut the bench to 8, and SUM(*) cannot count rows.",
  },
  {
    id: "cs-928",
    tier: "hard",
    topic: "q2",
    universe: "funnel",
    title: "The pending bar",
    brief:
      "From: Lifecycle marketer. Re: premium-cart experiment.\n\nThe experiment targets shoppers whose ORDERS historically clear what a hot cart is worth: the average PENDING ticket. Count the orders above that pending bar — if the number is healthy we build the audience off order history, not carts.",
    ask: "Count orders whose total exceeds the average total of pending orders.",
    template: `SELECT COUNT(*) AS above_pending
FROM {3}
WHERE total {1} (
  SELECT {2}(total) FROM orders
  WHERE status = 'pending'
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the clearing test",
        why: "The audience is orders that clear the pending bar — strictly above it. < would build the audience from the light tickets.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the cart's worth",
        why: "'What a hot cart is worth' is the average pending ticket — 436.64, the fattest of the status averages. MAX would set the bar at the single richest cart.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the history table",
        why: "The audience is built from order history, so the outer scan reads orders — invoices cannot supply ticket totals.",
      },
    ],
    distractors: ["<", "MAX", "invoices"],
    walkthrough:
      "Pending tickets average 436.64 — notably above the all-status 338.19 because abandoned-but-rich carts skew the pile. 28 of the 103 orders clear that bar, a healthy base for a history-built audience. MAX would raise the bar to the richest pending cart and clear nobody, counting downward would report 75 light tickets, and reading ticket totals from invoices fails on the missing column.",
  },
  {
    id: "cs-929",
    tier: "hard",
    topic: "q2",
    universe: "growth",
    title: "Double the delivered bar",
    brief:
      "From: GM. Re: exceptional-ticket definition.\n\nFor the ops review an 'exceptional ticket' is any order worth at least double the COLLECTED average — delivered money only, not wishful pending totals. Count the exceptional tickets so the review can size the wow-factor slide.",
    ask: "Count orders worth at least twice the delivered-only average total.",
    template: `SELECT {3}(*) AS double_bar
FROM orders
WHERE total > {1} * (
  SELECT AVG(total) FROM orders
  WHERE {2}
);`,
    slots: [
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the doubling constant",
        why: "The GM's definition doubles the bar. It is a definition constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "status = 'delivered'",
        kind: "keyword",
        label: "the collected-money filter",
        why: "The bar is built from delivered rows only — collected money. Including every status would silently lower the bar.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the slide's counter",
        why: "The slide needs one number — how many exceptional tickets exist. COUNT(*) is the tally.",
      },
    ],
    distractors: ["3", "SUM", "status = 'shipped'"],
    walkthrough:
      "The delivered-only average is 299.44; doubling it sets the exceptional bar at 598.88 and 20 orders clear it. Tripling the bar would shrink the list to 2, summing instead of averaging would explode the bar past every ticket (SUM returns 0 rows via overflow of meaning — nothing beats the whole book), and shipping the bar to the delivered-in-transit average of 399.89 would raise the doubled bar to about 799.78 and cut the list to 4.",
  },
  {
    id: "cs-930",
    tier: "hard",
    topic: "q2",
    universe: "expense",
    title: "Out-earning the biggest ticket",
    brief:
      "From: Finance partner. Re: whale-account memo.\n\nThe memo's hook: customers whose LIFETIME spend exceeds our single biggest order. Those accounts out-earned the best single receipt the store has ever taken — that is the whale definition worth printing. Count them.",
    ask: "Count customers whose lifetime spend exceeds the largest single order total.",
    template: `SELECT COUNT(*) AS out_earners
FROM customers
WHERE (SELECT SUM(total) FROM orders WHERE customer_id = customers.id) {1} (
  SELECT {2}(total) FROM {3}
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the out-earning test",
        why: "Out-earning the biggest ticket is a strict comparison against the whale order. < would count customers who never matched one good receipt.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the whale finder",
        why: "The biggest single order is the maximum total on file — 1088.44. AVG would lower the bar to the typical ticket and let everyone pass.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where both sums live",
        why: "Both the lifetime spend and the whale bar are measured over orders — the scalar's table must be the order ledger.",
      },
    ],
    distractors: ["=", "AVG", "products"],
    walkthrough:
      "The inner scalar finds the whale: one order at 1088.44. Eight customers have lifetime spends above it — from Alice's 7262.35 down to Keiko's 1098.60 — which is the memo's hook: eight accounts out-earned the best single receipt. An equality match would name nobody, since no lifetime spend lands exactly on 1088.44, AVG would drop the bar to 338.19 and every one of the 16 customers (minimum lifetime spend 444.80) would clear it, and products holds no ticket totals at all.",
  },
  {
    id: "cs-931",
    tier: "easy",
    topic: "q3",
    universe: "funnel",
    title: "The pending eight",
    brief:
      "From: Lifecycle marketer. Re: recovery audience.\n\nThe recovery flow targets shoppers with an order still pending — but the audience builder wants a probe-style list, one row per account, no duplicates from their three pending orders. Build it with an existence test so a shopper with five hot carts still appears once.",
    ask: "List customers with at least one pending order, using an EXISTS probe.",
    template: `SELECT c.name
FROM customers c
WHERE {1} (
  SELECT 1 FROM orders o
  WHERE {2}
    AND o.status = {3}
)
ORDER BY c.name;`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the existence probe",
        why: "EXISTS asks 'does even one matching row exist?' and answers true the moment it finds one — duplicates never multiply the customer row.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the probe's anchor",
        why: "The correlation ties each probe to the outer customer. Without it the probe would find pending orders for ANYONE and flag every customer.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the hot state",
        why: "Only pending orders make the shopper winnable again — the probe must filter its inner scan to the hot state.",
      },
    ],
    distractors: ["NOT EXISTS", "o.customer_id = o.id", "'shipped'"],
    walkthrough:
      "The probe runs once per customer, scanning for a single pending order anchored to that customer. Eight shoppers pass: Alice Chen, Chloe Dubois, Emma Wilson, Farid Nasser, Grace Kim, Keiko Sato, Maya Patel, Pedro Alvarez — once each, no matter how many pending orders they hold. NOT EXISTS would build the exact opposite audience, anchoring the probe to o.customer_id = o.id would test whether an order's id equals its own customer (a nonsense anchor that flags a different crowd), and probing for shipped would audience the ten already-served accounts.",
  },
  {
    id: "cs-932",
    tier: "easy",
    topic: "q3",
    universe: "month-close",
    title: "Never shipped",
    brief:
      "From: Ops lead. Re: fulfillment gap audit.\n\nSix accounts have ordered from us and never once seen a shipped order — every ticket they placed is pending, cancelled, or nothing at all. Find them with a negative existence test so we can check whether the gap is address quality or luck.",
    ask: "List customers with no shipped orders at all, via NOT EXISTS.",
    template: `SELECT c.name
FROM customers c
WHERE NOT {1} (
  SELECT 1 FROM {2} o
  WHERE o.customer_id = c.id
    AND o.status = {3}
);`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the probe being negated",
        why: "NOT EXISTS reads 'no matching row exists'. The EXISTS keyword is still the engine — the NOT simply flips the verdict per customer.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the fulfillment ledger",
        why: "Shipping happens to orders. The probe scans orders for any shipped row tied to the customer.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the state that clears them",
        why: "One shipped order is enough to clear an account. The probe filters to 'shipped' so NOT EXISTS finds the never-cleared six.",
      },
    ],
    distractors: ["IN", "customers", "'pending'"],
    walkthrough:
      "For each customer the probe asks: does even one shipped order exist for this id? Ten customers answer yes; the six who answer no are Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Keiko Sato and Olivia Brown. Dropping the EXISTS for a bare NOT IN breaks the sentence outright (NOT IN needs the IN), probing the customers table self-referentially crashes on the missing customer_id, and negating pending would list the eight accounts with no live cart — a different gap entirely.",
  },
  {
    id: "cs-933",
    tier: "easy",
    topic: "q3",
    universe: "catalog",
    title: "The audio fourteen",
    brief:
      "From: Merchandising analyst. Re: headphone-launch seeding.\n\nThe seeding list is simple: everyone who has EVER bought anything from the Audio category. One purchase ever qualifies, and nobody should appear twice no matter how many speakers they own. Count the list.",
    ask: "Count customers who have bought at least one Audio product, via EXISTS.",
    template: `SELECT {3}(*) AS audio_buyers
FROM customers c
WHERE {1} (
  SELECT 1
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE o.customer_id = c.id
    AND {2}
);`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the once-is-enough test",
        why: "EXISTS stops at the first matching purchase, so a customer with ten audio items still counts exactly once.",
      },
      {
        answer: "p.category = 'Audio'",
        kind: "keyword",
        label: "the qualifying purchase",
        why: "The probe chain ends at products, and only rows wearing the Audio category qualify the buyer.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the seeding counter",
        why: "The analyst wants the list size for the seeding budget. COUNT(*) over the surviving customers prints it.",
      },
    ],
    distractors: ["NOT EXISTS", "p.category = 'Wearables'", "SUM"],
    walkthrough:
      "The probe walks customer → orders → order_items → products and stops at the first row whose category is Audio. Fourteen customers have ever bought audio; the two who never did stay off the seeding list. NOT EXISTS would seed the two non-buyers and skip everyone who actually listens, probing Wearables would build the band-launch list (12 names) instead, and SUM(*) cannot count the survivors.",
  },
  {
    id: "cs-934",
    tier: "easy",
    topic: "q3",
    universe: "growth",
    title: "The lone whale",
    brief:
      "From: Account manager. Re: white-glove list.\n\nWhite-glove service goes to anyone who has ever placed a single order over 1000 dollars. We suspect the list is embarrassingly short — prove it with an existence probe and name whoever makes the cut.",
    ask: "List customers with at least one order over 1000, using EXISTS.",
    template: `SELECT c.name
FROM customers c
WHERE {3} (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id
    AND o.total {1} {2}
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the over-bar test",
        why: "Over 1000 is strict: exactly 1000.00 would not qualify. The probe compares each order's total against the bar.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the white-glove bar",
        why: "The 1000 threshold is the service policy's written constant — a filter, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the once-is-enough test",
        why: "One qualifying order puts a customer on the list. EXISTS short-circuits at the first such order.",
      },
    ],
    distractors: ["<", "500", "NOT EXISTS"],
    walkthrough:
      "The probe checks each customer's orders for a total strictly over 1000. Exactly one account qualifies: Farid Nasser, whose 1088.44 order is the store's biggest ticket. Lowering the bar to 500 would admit ten accounts and drown the white-glove budget, flipping the probe would list the fifteen accounts that never broke four figures, and keeping the bar at 1000 with < would serve everyone but the whale.",
  },
  {
    id: "cs-935",
    tier: "medium",
    topic: "q3",
    universe: "funnel",
    title: "EU carts left hot",
    brief:
      "From: Regional lead. Re: EU win-back pilot.\n\nThe pilot only ships to EU accounts, and only those with a pending order — warm enough to recover, close enough to call during business hours. Build the pilot count with a scoped existence probe so the region filter lives on the customer, not the order.",
    ask: "Count EU customers with at least one pending order, via EXISTS.",
    template: `SELECT COUNT(*) AS eu_hot_carts
FROM customers c
WHERE c.region = {3}
  AND {1} (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id
      AND o.status = {2}
  );`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the cart probe",
        why: "EXISTS tests each EU customer for a single pending order — the account survives on one match, not one row per cart.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the warm state",
        why: "The pilot wants recoverable carts. The probe's inner filter pins the state that qualifies.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region gate",
        why: "The region filter belongs on the customer row — the order itself carries no geography. It gates WHO gets probed.",
      },
    ],
    distractors: ["NOT EXISTS", "'cancelled'", "'APAC'"],
    walkthrough:
      "The region gate first narrows the field to the eight EU accounts, then the probe keeps only those holding a pending order: three qualify. NOT EXISTS would pilot to the five EU accounts with no live cart, probing for cancelled would target the single EU damage-control account (Alice), and gating on APAC would run the pilot in a region the brief never named (two accounts).",
  },
  {
    id: "cs-936",
    tier: "medium",
    topic: "q3",
    universe: "growth",
    title: "The five-hundred club",
    brief:
      "From: Loyalty lead. Re: instant-upgrade pilot.\n\nThe pilot upgrades any account that has EVER placed a single order over 500 — one big basket beats a year of medium ones. Count the club using an existence probe so the CRM import stays one-row-per-customer.",
    ask: "Count customers with at least one order over 500, via EXISTS.",
    template: `SELECT {3}(*) AS big_spenders
FROM customers c
WHERE EXISTS (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id
    AND o.total {1} {2}
);`,
    slots: [
      {
        answer: ">",
        kind: "keyword",
        label: "the club's entry test",
        why: "Over 500 is strict — the club is for orders that beat the bar, not tie it.",
      },
      {
        answer: "500",
        kind: "number",
        noVerify: true,
        label: "the entry bar",
        why: "The 500 threshold is the loyalty policy's constant. It filters the probe; it never needs to appear in the result cells.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the pilot counter",
        why: "The import sizing needs one number: how many accounts the upgrade touches. COUNT(*) prints it.",
      },
    ],
    distractors: ["<", "200", "SUM"],
    walkthrough:
      "The probe scans each customer's orders for one total strictly above 500 and stops at the first match. Ten accounts make the club — a quarter of the base qualifies through single baskets. Flipping the test would count the six accounts whose every order stayed light, dropping the bar to 200 would sweep in all sixteen accounts (even the quietest buyer once cleared 200), and SUM(*) cannot tally probe survivors.",
  },
  {
    id: "cs-937",
    tier: "medium",
    topic: "q3",
    universe: "inventory",
    title: "The wearable twelve",
    brief:
      "From: Stock controller. Re:Returns-forecast huddle.\n\nWearables get returned at funny rates, so the huddle needs the buyer pool: how many DISTINCT customers have ever ordered anything from the Wearables category? Distinct people, not baskets — the forecast models people.",
    ask: "Count customers who have ever bought a Wearables product, via EXISTS.",
    template: `SELECT COUNT(*) AS wearable_fans
FROM customers c
WHERE {1} (
  SELECT 1
  FROM orders o
  JOIN order_items oi ON oi.order_id = o.id
  JOIN products p ON p.id = oi.product_id
  WHERE {2}
    AND {3}
);`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the people-not-baskets test",
        why: "EXISTS collapses everything to a yes/no per customer — exactly the distinctness the forecast needs, with no DISTINCT bookkeeping.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the probe's anchor",
        why: "The correlation pins the purchase chain to the outer customer. Without it every probe would find the same global wearables rows.",
      },
      {
        answer: "p.category = 'Wearables'",
        kind: "keyword",
        label: "the category scope",
        why: "Only the two wearable SKUs qualify the chain's end — Fitness Band X2 and Smart Watch S.",
      },
    ],
    distractors: ["NOT EXISTS", "o.customer_id = o.id", "p.category = 'Audio'"],
    walkthrough:
      "The probe walks customer → orders → items → products and answers yes at the first wearable found. Twelve distinct customers have bought wearables — the forecast's buyer pool. NOT EXISTS would forecast around the four who never touched the category, anchoring on o.customer_id = o.id would test an id against itself and count a different, meaningless crowd, and scoping to Audio would size the listening pool (14) instead.",
  },
  {
    id: "cs-938",
    tier: "hard",
    topic: "q3",
    universe: "fraud",
    title: "The impossible status",
    brief:
      "From: Data quality. Re: enum-drift canary.\n\nA vendor feed once wrote a 'returned' status into a live table and half our reporting silently lied for a week. The canary query counts customers whose orders match that status — it must print zero. Build the canary and confirm it is quiet.",
    ask: "Count customers with an order whose status is 'returned' — the canary must print zero.",
    template: `SELECT {3}(*) AS ghost_orders
FROM customers c
WHERE {1} (
  SELECT 1 FROM orders o
  WHERE o.customer_id = c.id
    AND o.status = {2}
);`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the alarm's trigger",
        why: "The canary alarms when an impossible status EXISTS for a customer. A quiet system keeps the count at zero.",
      },
      {
        answer: "'returned'",
        kind: "keyword",
        label: "the poisoned enum",
        why: "'returned' is not a legal status in our schema — pending, shipped, delivered, cancelled are. Any match means the enum drifted.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the canary's readout",
        why: "Monitoring reads one number. COUNT(*) over flagged customers is the alert metric; anything above zero pages someone.",
      },
    ],
    distractors: ["NOT EXISTS", "'pending'", "SUM"],
    walkthrough:
      "The probe looks for a single 'returned' order per customer and finds none — the live statuses are only pending, shipped, delivered and cancelled — so the canary prints a reassuring 0. NOT EXISTS would invert the canary into a page-the-world alarm (16 customers lack the impossible status), probing 'pending' would measure the eight live-cart accounts instead of drift, and SUM(*) cannot produce the readout.",
  },
  {
    id: "cs-939",
    tier: "hard",
    topic: "q3",
    universe: "growth",
    title: "The ghost segment",
    brief:
      "From: CRM owner. Re: list hygiene certificate.\n\nMarketing swears the CRM contains ghost accounts — customers with no orders at all. Before we purge anything, certify the count with a negative existence probe. If the segment is empty, the purge ticket dies and everyone saves a day.",
    ask: "Count customers with no orders at all — the ghost segment.",
    template: `SELECT {3}(*) AS ghosts
FROM customers c
WHERE NOT EXISTS (
  SELECT 1 FROM {1} o
  WHERE {2}
);`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the activity ledger",
        why: "A ghost is a customer with no orders, so the probe must scan orders for any row tied to the account.",
      },
      {
        answer: "o.customer_id = c.id",
        kind: "keyword",
        label: "the probe's anchor",
        why: "The correlation makes the probe per-customer. Unanchored, one order anywhere would clear every customer at once.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the certificate number",
        why: "The certificate states the segment size. COUNT(*) prints the official zero the purge ticket hinges on.",
      },
    ],
    distractors: ["payments", "c.customer_id = o.id", "MAX"],
    walkthrough:
      "The probe asks, per customer: does even one order exist for this id? The seed's buyer coverage is total — every one of the 16 accounts has ordered — so the ghost segment certifies at exactly 0 and the purge ticket dies on the spot. Pointing the probe at payments crashes (payments keys on invoice_id, not customer_id), anchoring on c.customer_id = o.id fails because customers has no customer_id column, and MAX(*) is not an aggregate shape SQL accepts.",
  },
  {
    id: "cs-940",
    tier: "hard",
    topic: "q3",
    universe: "expense",
    title: "The unanchored flag",
    brief:
      "From: Finance ops. Re: flag batch postmortem.\n\nSomeone shipped a flag job that marked EVERY customer row because the travel-expense probe was never anchored to the customer — uncorrelated EXISTS is all-or-nothing. Rebuild the job exactly as it ran (the flag was cosmetic and harmless), so the postmortem can show the trap live.",
    ask: "Reproduce the over-flagging: count customers flagged by an UNCORRELATED EXISTS probe on travel expenses.",
    template: `SELECT {2}(*) AS flagged
FROM customers c
WHERE {3} (
  SELECT 1 FROM expenses e
  WHERE {1}
);`,
    slots: [
      {
        answer: "e.category = 'Travel'",
        kind: "keyword",
        label: "the unanchored probe's only filter",
        why: "The probe filters expenses by category and nothing else — no link back to the customer. That omission is the bug being reproduced.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the postmortem's readout",
        why: "The postmortem quantifies the blast radius: how many rows the unanchored flag touched. COUNT(*) prints it.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the all-or-nothing test",
        why: "An uncorrelated EXISTS ignores the outer row entirely: if the subquery returns any row, every customer flags; if none, none do.",
      },
    ],
    distractors: ["e.category = 'Subscriptions'", "SUM", "NOT EXISTS"],
    walkthrough:
      "The expenses table holds three Travel rows, so the unanchored probe finds a match and EXISTS answers true for every outer row — all 16 customers flagged, which is the postmortem's headline number. The probe never referenced c, so SQLite evaluated it once and shared the verdict. A category that holds no rows ('Subscriptions') would flip the shared verdict to false and flag nobody, SUM(*) cannot count the flagged, and NOT EXISTS would run the job in anti-mode and flag nobody as well.",
  },
  {
    id: "cs-941",
    tier: "easy",
    topic: "q4",
    universe: "growth",
    title: "The personal counter",
    brief:
      "From: CS lead. Re: health-sheet refresh.\n\nThe health sheet needs each account's own order count next to its name — Alice's sheet shows 24, the quiet accounts show 1. One query, one column per account, each stamped with ITS OWN count. That per-row linkage is the whole trick.",
    ask: "Stamp every customer with their own order count, heaviest buyers first.",
    template: `SELECT {3},
  (SELECT COUNT(*) FROM orders o
    WHERE {1}) AS my_orders
FROM {2}
ORDER BY my_orders DESC;`,
    slots: [
      {
        answer: "o.customer_id = customers.id",
        kind: "keyword",
        label: "the per-row link",
        why: "The correlation is what makes the count PERSONAL: each outer customer's id travels into the inner scan. Without it every row would print the same global total.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the outer roster",
        why: "The sheet is one row per account, so the outer FROM lists customers; the orders scan happens inside the correlated scalar.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the sheet's identity column",
        why: "Agents read the sheet by account name; the count rides beside it for triage.",
      },
    ],
    distractors: ["o.customer_id = o.id", "orders", "city"],
    walkthrough:
      "The correlated scalar re-runs per customer, counting only the orders that belong to THEM: Alice Chen tops the sheet at 24, Emma Wilson follows at 17, and the solo buyers sit at 1 — sixteen personalized stamps in one query. Linking on o.customer_id = o.id would compare an order's buyer to its own row id and produce nonsense counts, listing orders as the outer table would lose the name column entirely (orders has none), and keying the sheet by city would confuse the agents on every row.",
  },
  {
    id: "cs-942",
    tier: "easy",
    topic: "q4",
    universe: "funnel",
    title: "My biggest ticket",
    brief:
      "From: Account manager. Re: bragging-rights column.\n\nThe account review opens with each customer's single biggest order — their personal ceiling, not the store's. Stamp every account with its own maximum ticket and rank the list so the top spenders lead the meeting.",
    ask: "Stamp every customer with their own biggest order total, ranked descending.",
    template: `SELECT c.name,
  (SELECT {1}(total) FROM {3} o
    WHERE o.customer_id = {2}) AS biggest
FROM customers c
ORDER BY biggest DESC;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the personal ceiling",
        why: "The column is the customer's biggest single order. MIN would rank everyone by their most embarrassing basket.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the per-row link",
        why: "The correlation hands each customer's id into the inner scan — this is what makes the maximum personal rather than global.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where tickets live",
        why: "Order totals live on orders; the correlated scan reads them per customer.",
      },
    ],
    distractors: ["MIN", "o.id", "invoices"],
    walkthrough:
      "The scalar re-runs per customer and returns THEIR maximum: Farid Nasser leads at 1088.44, Chloe Dubois follows at 945.21, Emma Wilson at 845.92. Linking on o.id would compare the order's buyer against the order's own id — a self-referential accident that yields garbage ceilings — and reading totals from invoices crashes because invoices carry cents, not order totals.",
  },
  {
    id: "cs-943",
    tier: "easy",
    topic: "q4",
    universe: "growth",
    title: "The solo pair",
    brief:
      "From: Winback strategist. Re: one-and-done outreach.\n\nAccounts with exactly ONE order are the one-and-done segment — they tried us once and we never saw them again. Find them with a correlated count test so the outreach list is precise, then tell me how small the segment really is.",
    ask: "List customers whose total order count equals exactly one.",
    template: `SELECT c.name
FROM customers c
WHERE (
  SELECT {1}(*) FROM {3} o
  WHERE o.customer_id = c.id
) = {2}
ORDER BY c.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the segment's measure",
        why: "One-and-done is defined by counting that customer's orders. SUM would add up ticket totals and answer a spending question.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the solo threshold",
        why: "Exactly one order defines the segment. The literal is a filter constant — it never needs to appear in the result cells.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "where history lives",
        why: "The correlated count scans each customer's order history; the outer table supplies the people.",
      },
    ],
    distractors: ["SUM", "2", "payments"],
    walkthrough:
      "The correlated scalar counts each customer's orders and the equality keeps only the customers whose count is exactly one: Liam O'Brien and Olivia Brown — the whole one-and-done segment, two names long. SUM would compare lifetime SPEND against 1 dollar and flag nobody, loosening the threshold to two would admit the eight two-order accounts, and scanning payments for customer history fails because payments never references a customer directly.",
  },
  {
    id: "cs-944",
    tier: "medium",
    topic: "q4",
    universe: "growth",
    title: "The stellar forty-five",
    brief:
      "From: Analytics lead. Re: personal-best study.\n\nA 'stellar' order beats the customer's OWN average — a 300-dollar ticket is huge for a bargain hunter and routine for a whale. Count the stellar orders across the whole store; the per-person bar is what makes the number interesting.",
    ask: "Count orders whose total beats their own customer's average order total.",
    template: `SELECT {3}(*) AS stellar
FROM orders o
WHERE o.total > (
  SELECT {1}(o2.total) FROM orders o2
  WHERE {2}
);`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the personal bar",
        why: "Stellar means above the customer's own mean. MAX would demand the order beat their single best — impossible by definition.",
      },
      {
        answer: "o2.customer_id = o.customer_id",
        kind: "keyword",
        label: "the self-join link",
        why: "The inner scan re-reads orders under a second alias and matches on customer — that pairing is what scopes the average to the same buyer.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the study's tally",
        why: "The study reports how many orders clear their personal bar — one number for the readout.",
      },
    ],
    distractors: ["MAX", "o2.customer_id = o.id", "SUM"],
    walkthrough:
      "For each order the inner scan recomputes that customer's average and the comparison keeps orders above THEIR OWN bar: 45 of the 103 orders are stellar. The two-alias discipline (o versus o2) is what lets a query compare a row to a statistic of its own group. Demanding a beat of the personal MAX would net zero, anchoring the inner scan on o2.customer_id = o.id would mix a buyer id with an order id and compute nonsense bars, and SUM would compare a ticket to a lifetime total — nobody wins that.",
  },
  {
    id: "cs-945",
    tier: "medium",
    topic: "q4",
    universe: "growth",
    title: "Both bars at once",
    brief:
      "From: Analytics lead. Re: the double-bar cut.\n\nThe elite cut needs an order to clear BOTH bars: its own customer's average AND the storewide average. Personal bests that are still small potatoes don't count. How many orders wear both crowns?",
    ask: "Count orders above both their customer's average and the storewide average.",
    template: `SELECT {3}(*) AS dual_bar
FROM orders o
WHERE o.total > (
  SELECT AVG(o2.total) FROM orders o2
  WHERE o2.customer_id = o.customer_id
) {2} o.total > (
  SELECT AVG(total) FROM {1}
);`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "the storewide bar's source",
        why: "The storewide average is measured over all orders — the second scalar reads the full ledger uncorrelated.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the both-crown requirement",
        why: "Both bars must clear — AND binds the two tests. OR would count orders clearing EITHER bar and flatter the result.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the elite tally",
        why: "The cut's size is one number. COUNT(*) over the doubly-qualified rows prints it.",
      },
    ],
    distractors: ["customers", "OR", "SUM"],
    walkthrough:
      "Two scalars, two bars: the correlated one computes each order's personal bar, the uncorrelated one computes the storewide 338.19. Only 37 of 103 orders clear both — the personal overachievers that are also big fish overall. Pointing the storewide scalar at customers crashes (no total column), OR would relax the cut to 50 orders (45 personal clears plus 5 store-only), and SUM(*) cannot tally.",
  },
  {
    id: "cs-946",
    tier: "medium",
    topic: "q4",
    universe: "pricing",
    title: "Pricey in my lane",
    brief:
      "From: Pricing lead. Re: premium shelf audit.\n\n'Premium' is relative: a 65-dollar cycling jersey is premium NEXT TO other apparel, not next to electronics. List the products priced above their OWN category's average — the lane-relative premium shelf.",
    ask: "List products whose price beats their own category's average price.",
    template: `SELECT p.name, p.price
FROM products p
WHERE p.price > (
  SELECT {1}(p2.price) FROM {3} p2
  WHERE {2}
)
ORDER BY p.price DESC;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the lane's bar",
        why: "The audit compares each product to its category's average. MAX would demand a category record — one winner per lane at most.",
      },
      {
        answer: "p2.category = p.category",
        kind: "keyword",
        label: "the lane matcher",
        why: "The correlated match ties the inner average to the outer product's own category — the lane definition itself.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "the lane's home",
        why: "Both the row and its bar come from the catalog; the second alias p2 re-reads it for the per-lane average.",
      },
    ],
    distractors: ["MAX", "p2.category = p2.category", "orders"],
    walkthrough:
      "The correlated scalar computes each product's category average and the comparison keeps the above-lane rows: 7 products, led by Smart Watch S at 199.99 against a Wearables bar of 139.50. Matching p2.category to itself would make the inner scan category-blind — the bar becomes the catalog-wide 71.78 and only 6 products clear it, a subtly different shelf. MAX would crown at most one product per lane, and orders has no price to average.",
  },
  {
    id: "cs-947",
    tier: "medium",
    topic: "q4",
    universe: "supplier",
    title: "Above the neighborhood bar",
    brief:
      "From: Procurement. Re: regional bench review.\n\nRatings only mean something region against region — a 4.1 partner in a tough region outperforms a 4.4 in an easy one. List the suppliers whose rating beats their OWN region's average, best first.",
    ask: "List suppliers rated above their own region's average rating.",
    template: `SELECT s.name, s.rating
FROM {3} s
WHERE s.rating > (
  SELECT {1}(s2.rating) FROM suppliers s2
  WHERE {2}
)
ORDER BY s.rating DESC;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the neighborhood bar",
        why: "The benchmark is the region's mean rating. MAX would flag only record-holders — one per region at most.",
      },
      {
        answer: "s2.region = s.region",
        kind: "keyword",
        label: "the neighborhood matcher",
        why: "The correlated match scopes the average to the supplier's own region — the entire point of the review.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the bench table",
        why: "The outer row is a supplier; the inner scan re-reads the same bench under the s2 alias for the regional bar.",
      },
    ],
    distractors: ["MAX", "s2.region = 'EU'", "products"],
    walkthrough:
      "The correlated scalar computes each supplier's regional average and keeps those beating it: two suppliers survive — Shenzhen Electro at 4.1 over an APAC bar of 4.0, and Alpine Audio at 4.8 over an EU bar of 4.7. Both are the pride of a tough neighborhood. MAX would return nobody (no supplier beats their own region's record), pinning the bar to EU would test everyone against 4.7 and leave only Alpine, and products has no ratings.",
  },
  {
    id: "cs-948",
    tier: "hard",
    topic: "q4",
    universe: "growth",
    title: "Quiet overachievers",
    brief:
      "From: Analytics lead. Re: the hidden-middle cut.\n\nThe interesting band is orders that beat their customer's own average but STILL fall at or under the storewide bar — personal wins that never made macro noise. Count that hidden middle; it is the story about baselines, not big spenders.",
    ask: "Count orders above their customer's average but at or below the storewide average.",
    template: `SELECT {3}(*) AS quiet_stars
FROM orders o
WHERE o.total > (
  SELECT AVG(o2.total) FROM orders o2
  WHERE o2.customer_id = o.customer_id
) AND o.total {1} (
  SELECT {2}(total) FROM orders
);`,
    slots: [
      {
        answer: "<=",
        kind: "keyword",
        label: "the ceiling's edge",
        why: "At or under the storewide bar is the cut's second condition — the inclusive <= is what keeps boundary tickets in the hidden middle.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the macro bar",
        why: "The storewide average (about 338.19) is the ceiling. MAX would raise the ceiling to the best order ever and let every personal win through.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the band's tally",
        why: "The story's number: how many orders live in the hidden middle. COUNT(*) prints it.",
      },
    ],
    distractors: [">", "MAX", "SUM"],
    walkthrough:
      "The correlated scalar sets each order's personal bar; the uncorrelated one sets the storewide ceiling at about 338.19. The inclusive <= keeps orders that beat their own baseline without beating the store's: 8 quiet stars. Flipping to > would slide the band up into the 37 double-crown orders, MAX would move the ceiling to 1088.44 and widen the band to all 45 personal wins, and SUM(*) cannot tally rows.",
  },
  {
    id: "cs-949",
    tier: "hard",
    topic: "q4",
    universe: "expense",
    title: "The double stamp",
    brief:
      "From: Finance partner. Re: whale-brief annex.\n\nThe annex table shows, for our biggest accounts, both their own lifetime spend and the store's grand total side by side — the contrast sells the concentration story. Build it for customers above the 2000 mark, and let the query compute both sums; no hand-typed numbers.",
    ask: "List customers with lifetime spend above 2000, each row showing their spend and the store total.",
    template: `SELECT {3},
  (SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id) AS my_spend,
  (SELECT SUM(total) FROM {1}) AS store_total
FROM customers c
WHERE (SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id) > {2};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "where both sums accrue",
        why: "The personal spend and the store total both accrue on orders — one correlated scalar per row, one uncorrelated scalar for the grand total.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the annex's entry bar",
        why: "The 2000 cut selects who makes the annex. It is a filter constant, not an output figure, so it never needs to appear in the cells.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the annex's row key",
        why: "The annex reads as a who-owns-what table; each row is keyed by the account name.",
      },
    ],
    distractors: ["payments", "3000", "city"],
    walkthrough:
      "The correlated scalar recomputes each customer's lifetime spend; the uncorrelated one stamps the store grand total — 34833.28 — on every surviving row. Five accounts clear the 2000 bar: Alice 7262.35, Emma 6640.56, Grace 4574.23, Maya 3644.56 and Chloe 2667.93, together more than half the store's revenue. Summing payments would stamp a payments total where the story needs order revenue, raising the bar to 3000 would trim the annex to three whales, and keying rows by city breaks the who-owns-what read.",
  },
  {
    id: "cs-950",
    tier: "hard",
    topic: "q4",
    universe: "growth",
    title: "The veteran four",
    brief:
      "From: Loyalty lead. Re: anniversary gifting.\n\nAnniversary gifts go to accounts with at least FOUR delivered orders — gifts must match received goods, not promises. Count how many accounts earn the gift, using a correlated delivered-count test so pending optimism counts for nothing.",
    ask: "Count customers with at least four delivered orders.",
    template: `SELECT c.name
FROM customers c
WHERE (
  SELECT {1}(*) FROM {3} o
  WHERE o.customer_id = c.id
    AND o.status = 'delivered'
) >= {2}
ORDER BY c.name;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the gift's measure",
        why: "The loyalty rule counts delivered orders per account. SUM would weigh their dollar value instead — a spend rule, not a loyalty rule.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the veteran threshold",
        why: "Four delivered orders is the gifting policy's bar. It is a filter constant — it never needs to appear in the result cells.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the delivery ledger",
        why: "Delivered is an order state; the correlated scan counts each customer's rows in that state.",
      },
    ],
    distractors: ["SUM", "3", "customers"],
    walkthrough:
      "The correlated scalar counts delivered orders per customer and the threshold keeps those with at least four: Alice Chen (12), Grace Kim (10), Maya Patel (5) and Emma Wilson (4) — exactly four gift boxes. SUM would test lifetime spend against 4 dollars and gift nobody, lowering the bar to three would admit Chloe Dubois and make five boxes the warehouse never planned for, and scanning customers for deliveries fails because the status lives on orders.",
  },
];
