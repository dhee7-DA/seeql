// Joins-deck batch j3c — anti-joins on the product / supplier / employee axis,
// cs-267..cs-275. Siblings j3a (customer axis) and j3b (money-and-freight)
// hunted ghosts one hop from the preserved table; this batch works the deck's
// deepest corridors: demand that flows products→lines→tickets→buyers→touches,
// so "never" spans three to five hops. When the arm rides on the far table the
// plain LEFT-join chain lies — every healthy line paints a ghost — so the right
// side is rolled up to distinct keys before the anti-join; when the arm rides
// on the immediate right table the direct WHERE right.id IS NULL form works.
// Every figure quoted in prose was probed live against a read-only copy of the
// seed db (scripts/probe-j7c*.ts) before being written down.

import type { CaseStudy } from "../types";

export const casesJ3c: CaseStudy[] = [
  {
    id: "cs-267",
    deck: 2,
    topic: "j3",
    universe: "supplier",
    title: "Shelves the cancellation wave missed",
    brief:
      "From: Vendor risk desk. Re: quarterly cancellation exposure.\n\nThe cancellation wave archives this quarter at twelve order lines across seven tickets, and the vendor-risk review wants its flip side: which suppliers have never had a single product of theirs sit on a cancelled line? Not a low rate — zero, ever. A product hops through order lines to its ticket, and the cancelled state lives three hops away from the maker, so test it at the supplier level, not line by line. Two names expected, with regions, alphabetical.",
    ask: "Every supplier with no cancelled order line on any of their products, showing name and region, alphabetical.",
    template: `SELECT s.name, s.region
FROM suppliers s
{1} JOIN (SELECT DISTINCT p.supplier_id AS supplier_id
          FROM products p
          JOIN order_items oi ON oi.product_id = p.id
          JOIN orders o ON o.id = oi.order_id
          WHERE o.status = {2}) x
ON x.supplier_id = s.id
WHERE {3} IS {4}
ORDER BY s.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The clean-vendor list only survives a preserving join: LEFT JOIN keeps all six suppliers and lets the four canceller houses pair while the clean two fall through to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the matched cancellers, and the IS NULL test then has nothing left to find: an empty review.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-line state",
        why: "The wave being studied is cancellations, so the rollup reads 'cancelled' — quoted, it's a value. 'pending', 'delivered' and 'shipped' each roll up all six suppliers (every house has lines in every live state), so the clean list comes back empty — real sweeps, none of them the cancellation review.",
      },
      {
        answer: "x.supplier_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: x.supplier_id IS NULL means this supplier never appears among cancellation hits. s.id IS NULL can never be true — the supplier side is preserved and populated — and that spelling returns nothing where two names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the four suppliers whose shelves did see a cancellation — the exposure itself, not the clean book.",
      },
    ],
    distractors: ["INNER", "CROSS", "'pending'", "'delivered'", "s.id", "NOT NULL"],
    walkthrough:
      "Two of six suppliers have never touched a cancellation: Andes Naturals SA (LATAM) and Shenzhen Electro (APAC). The wave belongs to the other four — Pacific Textiles 4 lines, Midwest Hardware Co 4, Alpine Audio GmbH 3, Nordic Gadgets AB 1 — twelve lines over seven tickets, led by Studio Desktop Mic, USB-C Hub 7-in-1 and Yoga Mat Eco 6mm at two cancelled lines apiece. The rollup is the load-bearing part: the cancelled state lives on orders, three hops from the supplier (products→order_items→orders), and a plain arm-filtered LEFT-join chain with WHERE o.id IS NULL returns all six houses — every healthy delivered line fails the arm and paints a ghost. Rolling the cancelled-line products up to distinct supplier ids first makes the right side one row per canceller, and LEFT JOIN + IS NULL finally reads 'never'. Scale note: Andes and Shenzhen are also the two smallest books on the desk (3 and 15 refunded lines respectively), so clean hands here rhyme with low volume — worth a sentence in the review.",
  },
  {
    id: "cs-268",
    deck: 2,
    topic: "j3",
    universe: "catalog",
    title: "The one product the US never bought",
    brief:
      "From: Warehouse catalog. Re: regional demand map.\n\nThe US demand map has a hole in it and the close deck wants the hole named. Exactly two accounts buy from the US region, and between them they have covered nearly the whole catalog — but not all of it. Find the products no US customer has ever bought, category attached, alphabetical. A product spans many lines across many tickets and buyers, so test the region at the buyer level, not line by line, or the map will read clean where it isn't.",
    ask: "Every product with no US-customer purchase on any line, showing name and category, alphabetical.",
    template: `SELECT p.name, p.category
FROM products p
{1} JOIN (SELECT DISTINCT oi.product_id AS product_id
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN customers c ON c.id = o.customer_id
          WHERE c.region = {2}) us
ON us.product_id = p.id
WHERE {3} IS {4}
ORDER BY p.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The hole in the map only exists if products are preserved: LEFT JOIN keeps all sixteen and lets the fifteen US-bought ones pair while the gap falls to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the US-bought products, and the IS NULL test then empties the map instead of naming the hole.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the region under audit",
        why: "The audit is about US demand, so the rollup reads 'US' — quoted, it's a value. 'LATAM' returns twelve untouched products — a different, much bigger hole — while 'EU' and 'APAC' both come back empty: every product has sold into both. Unquoted US hunts for a column named US and errors.",
      },
      {
        answer: "us.product_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: us.product_id IS NULL means this product never appears on a US line. p.id IS NULL can never be true — the product side is preserved and populated — and that spelling returns nothing where the hole belongs. oi.id is out of scope out here: the order_items join lives inside the derived table, so that chip errors.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the fifteen products US buyers DID cover — the coverage, not the hole.",
      },
    ],
    distractors: ["INNER", "CROSS", "'LATAM'", "US", "oi.id", "NOT NULL"],
    walkthrough:
      "One product comes back: Yoga Mat Eco 6mm (Fitness) — thirteen order lines on file, not one of them sold to a US buyer. The explanation is concentration: the entire US region is two accounts, Emma Wilson and Jamal Wright, holding nineteen tickets and fifty-three lines between them. Emma has personally bought fifteen of the sixteen products; Jamal five (4K Webcam Pro, Desk Mat Extended, Fitness Band X2, Ring Light 14\", Running Socks 3-pack); their union covers everything but the mat. The rollup is the mechanics' spine: region lives on customers, four hops from the product (order_items→orders→customers), and the naive arm-filtered chain with WHERE c.id IS NULL returns all sixteen products — every non-US line paints a ghost. Rolling US-bought products up to distinct product ids first, then anti-joining, makes IS NULL read 'never'. Swap the arm to 'LATAM' and the same query returns twelve holes — LATAM demand is five lines on one buyer — which is the slide's contrast bar, not its answer.",
  },
  {
    id: "cs-269",
    deck: 2,
    topic: "j3",
    universe: "logistics",
    title: "Two products UPS never carried",
    brief:
      "From: Carrier relations. Re: UPS account review.\n\nThe UPS account review wants an honest coverage line: which products have never once moved on a UPS leg? UPS runs thirty-seven shipment legs across fourteen of our sixteen products, so the gap should be small — but it needs naming before the QBR. Product legs hop product→line→ticket→shipment, so roll the UPS legs up to the product level first; a product with a hundred DHL lines and one UPS scan should pair, and a product with none must survive the query. Category attached, alphabetical.",
    ask: "Every product with no UPS shipment leg on any of its orders, showing name and category, alphabetical.",
    template: `SELECT p.name, p.category
FROM products p
{1} JOIN (SELECT DISTINCT oi.product_id AS product_id
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN shipments s ON s.order_id = o.id
          WHERE s.carrier = {2}) up
ON up.product_id = p.id
WHERE {3} IS {4}
ORDER BY p.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The never-UPS list only survives a preserving join: LEFT JOIN keeps all sixteen products and lets the fourteen UPS-carried ones pair while the other two fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the UPS-carried products, and the IS NULL test then has zero rows to list.",
      },
      {
        answer: "'UPS'",
        kind: "keyword",
        label: "the carrier under review",
        why: "The review is about the UPS account, so the rollup reads 'UPS' — quoted, it's a value. 'DHL', 'FedEx' and 'LocalPost' each roll up all sixteen products — every product has moved on every other carrier at least once — so those arms return an empty gap list. Unquoted UPS hunts for a column named UPS and errors.",
      },
      {
        answer: "up.product_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: up.product_id IS NULL means this product never appears on a UPS leg. p.id IS NULL can never be true — the product side is preserved and populated — and that spelling returns nothing where two names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the fourteen products UPS HAS carried — the account's whole footprint, not its gap.",
      },
    ],
    distractors: ["INNER", "CROSS", "'DHL'", "UPS", "p.id", "NOT NULL"],
    walkthrough:
      "Two products have never ridden a UPS truck: Cycling Jersey Pro (Apparel) and Smart Watch S (Wearables). UPS's book is thirty-seven legs over the other fourteen products, so this is a true two-item gap, not sparse demand. Both stragglers move fine elsewhere: Cycling Jersey Pro runs DHL 3 / FedEx 3 / LocalPost 3, and Smart Watch S — the newest Wearables item — runs DHL 1 / FedEx 5 / LocalPost 4. The rollup is the lesson: carrier lives on shipments, the fourth table from products (order_items→orders→shipments), and the naive arm-filtered chain with WHERE s.id IS NULL returns all sixteen products — every DHL/FedEx/LocalPost leg fails the arm and paints a ghost. Rolling UPS-carried products up to distinct product ids first makes the right side one row per UPS product, and IS NULL reads 'never'. For the QBR note: Smart Watch S is the interesting omission — five FedEx legs say it ships in volume, just never on this account's rate card.",
  },
  {
    id: "cs-270",
    deck: 2,
    topic: "j3",
    universe: "inventory",
    title: "Four products the churned never touched",
    brief:
      "From: Inventory planning. Re: churned-basket review.\n\nTwo accounts have lapsed this year, and before we mark their baskets as dead demand I want the complement on record: which products NEITHER churned customer ever bought? Those four-to-six items are the ones whose shelf velocity owes nothing to the churn — the honest baseline for the restock model. Churned accounts carry active = 0, and each of them owns several tickets spanning many lines, so roll their purchases up to the product level before testing. Category attached, alphabetical.",
    ask: "Every product with no purchase line from any churned (active = 0) customer, showing name and category, alphabetical.",
    template: `SELECT p.name, p.category
FROM products p
{1} JOIN (SELECT DISTINCT oi.product_id AS product_id
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN customers c ON c.id = o.customer_id
          WHERE c.active = {2}) ch
ON ch.product_id = p.id
WHERE {3} IS {4}
ORDER BY p.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The untouched list only survives a preserving join: LEFT JOIN keeps all sixteen products and lets the twelve churn-bought ones pair while the clean four fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the churn-bought products, and the IS NULL test then has nothing to hand the restock model.",
      },
      {
        answer: "0",
        kind: "keyword",
        label: "the churned-account flag",
        why: "Lapsed accounts carry active = 0, an unquoted numeric flag. Switching to 1 rolls up the healthy book instead — every product has an active-customer line, so the untouched list empties — and 2 matches no account state at all: the rollup empties and all sixteen products come back as false ghosts.",
      },
      {
        answer: "ch.product_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: ch.product_id IS NULL means this product never appears in a churned basket. p.id IS NULL can never be true — the product side is preserved and populated — and that spelling returns nothing where four names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the twelve products the churned pair DID buy — their combined basket, not the complement.",
      },
    ],
    distractors: ["INNER", "CROSS", "1", "2", "p.id", "NOT NULL"],
    walkthrough:
      "Four products owe nothing to the churned pair: Bluetooth Speaker Mini (Audio), HDMI 2.1 Cable 2m (Accessories), Noise-Canceling Headset (Audio) and Wireless Mouse M3 (Electronics). The churned book is two accounts: Dmitri Volkov (two tickets, five products — Cycling Jersey Pro, Mechanical Keyboard K1, Ring Light 14\", Running Socks 3-pack, Smart Watch S) and Keiko Sato (four tickets, eight products, from 4K Webcam Pro to Yoga Mat Eco 6mm). Their baskets union to twelve of sixteen, leaving exactly this list. Laptop Stand Aluminum is the only product BOTH churned accounts bought — Keiko twice — which is why the restock model should watch it hardest. The rollup is the mechanics' spine: the churn flag lives on customers, four hops from the product, and the naive arm-filtered chain with WHERE c.id IS NULL returns all sixteen products — every active-customer line fails the arm and paints a ghost. Roll churned purchases up to distinct product ids first, and IS NULL reads 'never'.",
  },
  {
    id: "cs-271",
    deck: 2,
    topic: "j3",
    universe: "growth",
    title: "Vendors invisible in LATAM",
    brief:
      "From: Growth lead. Re: regional supplier coverage board.\n\nLATAM is our smallest demand region — five order lines all year — and the coverage board needs its supplier side: which vendors have never sold a single line into LATAM? Expect the irony that one of them is BASED there. A vendor reaches the buyer's region through four hops (products→lines→tickets→buyers), so roll the LATAM lines up to distinct suppliers before testing, name and home region attached, alphabetical.",
    ask: "Every supplier with no order line sold to a LATAM customer, showing name and region, alphabetical.",
    template: `SELECT s.name, s.region
FROM suppliers s
{1} JOIN (SELECT DISTINCT p.supplier_id AS supplier_id
          FROM products p
          JOIN order_items oi ON oi.product_id = p.id
          JOIN orders o ON o.id = oi.order_id
          JOIN customers c ON c.id = o.customer_id
          WHERE c.region = {2}) lat
ON lat.supplier_id = s.id
WHERE {3} IS {4}
ORDER BY s.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The coverage gap only exists if suppliers are preserved: LEFT JOIN keeps all six and lets the three LATAM-active houses pair while the invisible three fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the LATAM-active suppliers, and the IS NULL test then empties the board.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the region under audit",
        why: "The audit is about LATAM coverage, so the rollup reads 'LATAM' — quoted, it's a value. 'US', 'EU' and 'APAC' each roll up all six suppliers — every vendor has sold into all three big regions — so those arms return an empty gap list, a board with no findings.",
      },
      {
        answer: "lat.supplier_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: lat.supplier_id IS NULL means this supplier never appears on a LATAM line. s.id IS NULL can never be true — the supplier side is preserved and populated — and that spelling returns nothing where three names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the three suppliers who DO sell into LATAM — the covered column of the board, not the gap.",
      },
    ],
    distractors: ["INNER", "CROSS", "'US'", "'EU'", "s.id", "NOT NULL"],
    walkthrough:
      "Three vendors have never sold a line into LATAM: Andes Naturals SA, Midwest Hardware Co and Pacific Textiles. The irony lands on Andes — a LATAM-based supplier with zero LATAM sales, because the region's entire demand is five order lines, all on Bruno Silva's tickets: Alpine Audio GmbH's Studio Desktop Mic (qty 3) and Desk Mat Extended, Nordic Gadgets AB's Mechanical Keyboard K1 (qty 3), and Shenzhen Electro's Wireless Mouse M3 twice (qty 3 each). So the covered column of the board is Alpine, Nordic and Shenzhen; the gap column is Andes (LATAM), Midwest (US) and Pacific (APAC). The rollup is the mechanics' spine: the buyer's region lives on customers, the fourth table from suppliers (products→order_items→orders→customers), and the naive arm-filtered chain with WHERE c.id IS NULL returns all six suppliers — every EU/US/APAC line paints a ghost. Roll LATAM lines up to distinct supplier ids first, and IS NULL reads 'never'. Context for the slide: LATAM's five lines are the smallest regional book on file (EU 105, APAC 88, US 53).",
  },
  {
    id: "cs-272",
    deck: 2,
    topic: "j3",
    universe: "funnel",
    title: "Off the email cohort's shopping list",
    brief:
      "From: Lifecycle marketing. Re: email cohort coverage.\n\nThe email channel has bought exactly two accounts all year, and the nurture team wants to know what those two have actually put on their shopping lists — more importantly, what they have NOT. Find the products neither email-acquired customer has ever bought: that list is what the next nurture sequence should push. A buyer reaches the catalog through tickets and lines, and the channel lives one hop past the buyer, so roll the email cohort's purchases up to distinct products before testing. Category attached, alphabetical.",
    ask: "Every product with no purchase line from any email-acquired customer, showing name and category, alphabetical.",
    template: `SELECT p.name, p.category
FROM products p
{1} JOIN (SELECT DISTINCT oi.product_id AS product_id
          FROM order_items oi
          JOIN orders o ON o.id = oi.order_id
          JOIN customers c ON c.id = o.customer_id
          JOIN acquisitions a ON a.customer_id = c.id
          WHERE a.channel = {2}) em
ON em.product_id = p.id
WHERE {3} IS {4}
ORDER BY p.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The push list only survives a preserving join: LEFT JOIN keeps all sixteen products and lets the eight email-bought ones pair while the rest fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the email-bought products, and the IS NULL test then returns the nurture sequence's whole shelf as an empty page.",
      },
      {
        answer: "'email'",
        kind: "keyword",
        label: "the channel under audit",
        why: "The cohort being studied is the email pair, so the rollup reads 'email' — quoted, it's a value. 'search' returns a different four-product push list (Cycling Jersey Pro, Desk Mat Extended, Running Socks 3-pack, Wireless Mouse M3) and 'referral' or 'social' return empty — the referral four and social three between them cover the whole catalog.",
      },
      {
        answer: "em.product_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: em.product_id IS NULL means this product never appears in an email buyer's basket. p.id IS NULL can never be true — the product side is preserved and populated — and that spelling returns nothing where eight names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the eight products the email pair HAS bought — their combined basket, which is the control list, not the push list.",
      },
    ],
    distractors: ["INNER", "CROSS", "'search'", "'referral'", "p.id", "NOT NULL"],
    walkthrough:
      "Eight products sit off the email cohort's list: 4K Webcam Pro, Fitness Band X2, Mechanical Keyboard K1, Ring Light 14\", Running Socks 3-pack, Studio Desktop Mic, USB-C Hub 7-in-1 and Wireless Mouse M3. The cohort itself is two accounts: Isabella Rossi (touch 9, email, 41.40, 2024-03-01) with a six-product basket, and Liam O'Brien (touch 12, email, 40.53, 2024-04-21) with four — their baskets union to eight of sixteen, so the email pair has seen exactly half the catalog. The rollup is the mechanics' spine: the acquisition channel lives on the acquisitions table, FIVE hops from the product (order_items→orders→customers→acquisitions), the deepest chain this deck anti-joins, and the naive arm-filtered chain with WHERE a.id IS NULL returns all sixteen products — every non-email line paints a ghost. Roll the email cohort's purchases up to distinct product ids first, and IS NULL reads 'never'. Channel context for the memo: email spent 81.93 across its two touches, the highest per-touch average on the board.",
  },
  {
    id: "cs-273",
    deck: 2,
    topic: "j3",
    universe: "refund-audit",
    title: "No late-delivery claim ever signed",
    brief:
      "From: Refund audit. Re: process ownership review.\n\nLate-delivery claims are the carrier's failure landing on our ledger, and the ownership review wants the flip side of the processor roster: which employees have never once signed one? Not a low count — zero. The reason code lives on the refund row right next to the processor id, so this ghost hunt is one hop; the arm just has to ride in the join so clean hands fall through visibly. Name and role, alphabetical.",
    ask: "Every employee with no late-delivery refund claim processed, showing name and role, alphabetical.",
    template: `SELECT e.name, e.role
FROM employees e
{1} JOIN refunds r ON r.processed_by = e.id AND r.reason = {2}
WHERE {3} IS {4}
ORDER BY e.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Clean hands must survive the query: LEFT JOIN keeps all ten employees and lets the three late-claim signers pair while the other seven fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the three signers themselves: the audit's subjects, not its clean list.",
      },
      {
        answer: "'late_delivery'",
        kind: "keyword",
        label: "the reason code under audit",
        why: "The review is about late-delivery claims, so the arm reads 'late_delivery' — quoted, it's a value. 'wrong_item' returns eight clean names (only Marcus Hale and Ingrid Larsen ever signed a mispick) and 'changed_mind' six — real rosters, neither measures carrier failure. 'damaged' lands on five names: the crowd reason, audited last quarter.",
      },
      {
        answer: "r.id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker has to live on the refund side: r.id IS NULL means no late-delivery claim paired. e.id IS NULL can never be true — the employee side is preserved and populated — and that spelling returns nothing where seven names belong. r.amount or r.processed_by would pass the same test here, but the row's identity is the honest marker.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the LEFT JOIN paints into unfilled arms, so the anti-join reads IS NULL. IS NOT NULL flips the query to the matched late-delivery claims — the three-row exposure itself — and the review would read as if the whole desk signed carrier failures.",
      },
    ],
    distractors: ["INNER", "CROSS", "'wrong_item'", "'changed_mind'", "e.id", "NOT NULL"],
    walkthrough:
      "Seven of ten employees have never signed a late-delivery claim: Sofia Marin, Daniel Okoye and Petra Novak (the managers, who sign nothing), Aiko Yamada (zero claims of any kind), plus Marcus Hale, Elena Petrova and Tomas Ruiz — active signers whose books happen to be clean of this code. The late-delivery book belongs to three: claim 1, Ravi Menon, 339.43 (order 2); claims 10 and 13, Ingrid Larsen, 49.48 and 73.38; claim 23, Carla Dominguez, 83.84 — 546.13 in all. The mechanics are the direct arm-filter anti-join: the reason code lives on refunds, one hop from the employee, so the arm r.reason = 'late_delivery' rides in the ON, each clean employee falls through to exactly one NULL-painted row, and WHERE r.id IS NULL keeps them — no rollup needed at this depth. Marcus Hale is the exhibit for the why: seven claims, 1,128.33 signed, not one late-delivery among them. Contrast for the review: damaged claims touch five signers, wrong_item only two — carrier failure is concentrated in Ravi's and Ingrid's queues.",
  },
  {
    id: "cs-274",
    deck: 2,
    topic: "j3",
    universe: "people-ops",
    title: "Nobody home for the EU claims",
    brief:
      "From: Support org. Re: regional workload balance.\n\nThe EU refund book — twelve claims, 1,200.42 — sits on very few desks, and the workload review wants the complement named: which employees have never processed a claim from an EU customer? The buyer's region lives three hops from the processor (refunds→tickets→buyers), so test the region at the processor level, not claim by claim, or every mixed book looks clean. The three managers with empty rosters belong on this list; so does anyone whose claims all landed elsewhere. Name and role, alphabetical.",
    ask: "Every employee with no refund claim processed for an EU customer, showing name and role, alphabetical.",
    template: `SELECT e.name, e.role
FROM employees e
{1} JOIN (SELECT DISTINCT r.processed_by AS processed_by
          FROM refunds r
          JOIN orders o ON o.id = r.order_id
          JOIN customers c ON c.id = o.customer_id
          WHERE c.region = {2}) eu
ON eu.processed_by = e.id
WHERE {3} IS {4}
ORDER BY e.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The never-EU roster only survives a preserving join: LEFT JOIN keeps all ten employees and lets the four EU-active signers pair while the other six fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the EU-active four, and the IS NULL test then has no roster to hand the review.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region under review",
        why: "The review is about the EU book, so the rollup reads 'EU' — quoted, it's a value. 'US' returns eight names and 'LATAM' nine — the US and LATAM books are so thin that almost nobody has touched them — while 'APAC' returns six names that are a DIFFERENT six: Elena Petrova and Ingrid Larsen drop out, Carla Dominguez and Tomas Ruiz join.",
      },
      {
        answer: "eu.processed_by",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: eu.processed_by IS NULL means this employee never appears on an EU claim. e.id IS NULL can never be true — the employee side is preserved and populated — and that spelling returns nothing where six names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the four employees who DO carry EU claims — the overloaded column of the balance sheet, not the understaffed one.",
      },
    ],
    distractors: ["INNER", "CROSS", "'US'", "'LATAM'", "e.id", "NOT NULL"],
    walkthrough:
      "Six employees have never processed an EU-customer claim: Sofia Marin, Daniel Okoye and Petra Novak (the managers — zero claims of any kind), Aiko Yamada (likewise empty), plus Carla Dominguez and Tomas Ruiz, whose small books landed entirely elsewhere — Tomas's two claims went to a US buyer (136.62) and an APAC one (14.37). The EU book itself concentrates hard: twelve claims worth 1,200.42, signed by just four people — Ingrid Larsen seven, Elena Petrova two, Marcus Hale two, Ravi Menon one. The rollup is the mechanics' spine: the buyer's region lives three hops from the processor (refunds→orders→customers), and the naive arm-filtered chain with WHERE c.id IS NULL returns nine names — every non-EU claim on a mixed book paints a ghost, which would wrongly brand Elena, Marcus and Ravi as EU-clean. Rolling EU claimants up to distinct processor ids first makes the right side one row per EU signer, and IS NULL reads 'never'. For the balance memo: Ingrid alone owns 58% of the EU claims — the workload question writes itself.",
  },
  {
    id: "cs-275",
    deck: 2,
    topic: "j3",
    universe: "fraud",
    title: "Never signed a three-figure claim",
    brief:
      "From: Fraud spot-check. Re: signing-authority baseline.\n\nPolicy says any refund of 100.00 or more gets a second look, so before I tune the threshold I want the signing baseline on record: which employees have NEVER signed a three-figure claim? The amount lives on the refund row beside the processor id, so the hunt is one hop — but the arm is a threshold, not a code, and a signer with one big claim and five small ones must NOT read as clean. Name and role, alphabetical.",
    ask: "Every employee with no refund of 100.00 or more signed, showing name and role, alphabetical.",
    template: `SELECT e.name, e.role
FROM employees e
{1} JOIN refunds r ON r.processed_by = e.id AND r.amount >= {2}
WHERE {3} IS {4}
ORDER BY e.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The baseline is the complement of the second-look queue, so employees must be preserved: LEFT JOIN keeps all ten and lets the five three-figure signers pair while the rest fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the big-signer roster itself: the queue's contents, not the baseline.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the second-look threshold",
        why: "The policy line is three figures, so the arm reads r.amount >= 100 — a policy constant that never appears in the output cells. Drop it to 50 and the clean list shrinks to four (Carla's 83.84 late-delivery claim crosses the bar); raise it to 150 and Tomas Ruiz joins the clean list, his biggest claim being 136.62.",
      },
      {
        answer: "r.id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker has to live on the refund side: r.id IS NULL means no three-figure claim paired. e.id IS NULL can never be true — the employee side is preserved and populated — and that spelling returns nothing where five names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the LEFT JOIN paints into unfilled arms, so the anti-join reads IS NULL. IS NOT NULL flips the query to the twelve three-figure claims themselves — the second-look queue, not the baseline.",
      },
    ],
    distractors: ["INNER", "CROSS", "50", "150", "e.id", "NOT NULL"],
    walkthrough:
      "Five employees have never signed a three-figure refund: Sofia Marin, Daniel Okoye and Petra Novak (the managers — zero claims), Aiko Yamada (zero claims), and Carla Dominguez, whose only claim on file is an 83.84 late-delivery on order 92 — under the bar. The three-figure queue holds twelve claims worth 2,934.42, signed by five people: Marcus Hale four (977.39), Ravi Menon four (923.49), Elena Petrova two (532.78), Ingrid Larsen one (364.14), Tomas Ruiz one (136.62). The mechanics are the threshold-arm anti-join: r.amount >= 100 rides in the ON, so a claim only pairs when it crosses the bar — a signer's small claims simply fail to match and don't ghost them — and WHERE r.id IS NULL keeps exactly the never-crossed book. The threshold is the story: at 50 the clean list is four (Carla drops out), at 150 it is six (Tomas joins, his max being 136.62), and at 200 it stays six because every active signer's biggest claim clears two hundred. Baseline filed: policy catches Carla today, Tomas tomorrow — the audit gets to choose which.",
  },
];
