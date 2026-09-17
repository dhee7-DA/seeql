// Case batch X6 — Module 6 (Expert Clinic) cases cs-1601…cs-1625, wave 3.
// CROSS JOIN — the deliberate pairing join. Figures from the W3 receipt pool
// (m6-cases-w3-facts*.ts). Audited by scripts/case-audit.ts (x-laws: CROSS
// JOIN mandatory). CRITICAL BANK LAW: in SQLite, INNER/LEFT/CROSS JOIN are
// semantically identical when conditions live in WHERE or ON — so these
// banks carry NO join-type distractors; every distractor is an operator,
// column, value, format or function chip that errors or shifts results.
// Key receipts: products 16 x suppliers 6 = 96 cells; rating>=4 band 80;
// weighted price*rating max 959.95 (Smart Watch S x Alpine Audio GmbH),
// min 58.46 (HDMI 2.1 Cable 2m x Pacific Textiles); month x lane 56;
// month x region 56; product x month 224; grand canvas 896; owned-per-
// supplier max 3 (Midwest Hardware Co); same-category unordered pairs 12;
// lane self/ordered flags 4/6; supplier ties/ups 0/15; region-rank rn2 =
// US 879.96; invoice-after-order fanout 170.
import type { CaseStudy } from "./types";

export const casesX6: CaseStudy[] = [
  {
    id: "cs-1601",
    tier: "easy",
    topic: "x6",
    universe: "catalog",
    title: "The full pairing grid",
    brief:
      "From: Catalog ops. Re: the supplier pairing review.\n\nBefore the pricing committee meets, they want the scale of the thought experiment: pair every product with every supplier worth shortlisting — rating four stars and up — and count the cells. Every product meets every qualifying supplier.",
    ask: "How many product-by-supplier cells exist when only suppliers rated 4.0 and above are considered?",
    template: `SELECT {3}(*) AS cells FROM products p
  {1} suppliers s
  WHERE s.rating >= {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the deliberate pairing",
        why: "CROSS JOIN pairs every product with every supplier — sixteen times six rows before any filter. The pairing is the point: no key matches, every combination is deliberate.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the shortlist floor",
        noVerify: true,
        why: "Rating 4.0 and up keeps five of the six suppliers — Alpine 4.8, Nordic 4.6, Midwest 4.4, Shenzhen 4.1 and Andes 4.0 — so 16 x 5 = 80 cells. Lowering to 3 lets all six in and the grid grows to 96.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the cell counter",
        why: "COUNT(*) tallies the surviving pairs — 80 cells. SUM or AVG would demand a numeric column to fold; the committee wants a headcount of combinations, not arithmetic on one.",
      },
    ],
    distractors: ["3", "4.5", "SUM", "AVG"],
    walkthrough:
      "80 cells — every product lined up against every four-star-plus supplier. The query is a deliberate Cartesian product with a gate: FROM products p CROSS JOIN suppliers s builds all 96 pairs, and s.rating >= 4 keeps only the five suppliers at or above the floor — Alpine Audio GmbH 4.8, Nordic Gadgets AB 4.6, Midwest Hardware Co 4.4, Shenzhen Electro 4.1 and Andes Naturals SA 4.0 (Pacific Textiles at 3.9 misses the cut). 16 products x 5 suppliers = 80. The floor is the lever: drop it to 3 and Pacific re-enters, growing the grid to 96; raise it to 4.5 and only Alpine and Nordic survive, shrinking it to 32. COUNT(*) turns the surviving rows into the number the committee asked for — the size of the pairing space before anyone debates a single price.",
  },
  {
    id: "cs-1602",
    tier: "easy",
    topic: "x6",
    universe: "pricing",
    title: "The heaviest pairing",
    brief:
      "From: Pricing. Re: the headline pairing.\n\nThe pricing deck opens with a thought experiment: price every product against every supplier's rating and find the heaviest weighted cell — price times rating. Name the product, the supplier, and the weighted figure.",
    ask: "Which product-supplier pairing produces the highest price-times-rating figure?",
    template: `SELECT p.name, s.name, {3}(p.price {2} s.rating, 2) AS weighted FROM products p
  {1} suppliers s
  ORDER BY weighted DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the full pairing",
        why: "Every product must meet every supplier for the weighting contest — CROSS JOIN builds all 96 pairs. Without the full pairing the heaviest cell might never appear in the race at all.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the weighting operator",
        why: "Price times rating rewards both size and quality: 199.99 x 4.8 = 959.95. Adding would compare 199.99 + 4.8 = 204.79 — a different contest where the rating barely matters.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(price * rating, 2) trims the product to 959.95 for the deck. SUM or MAX take a single argument and error on the , 2 — the two-argument rounding pass is the finisher.",
      },
    ],
    distractors: ["+", "/", "-", "SUM"],
    walkthrough:
      "The heaviest cell is Smart Watch S paired with Alpine Audio GmbH: 199.99 x 4.8 = 959.95. The contest needs the full field — FROM products p CROSS JOIN suppliers s pairs all sixteen products with all six suppliers, 96 rows — and the weighted figure is computed per pair, then ranked. ORDER BY weighted DESC LIMIT 1 takes the crown. The operator is the whole story: multiplication lets the 4.8 rating amplify the 199.99 price into a class of its own; addition flattens the contest (204.79, with the rating contributing less than a quarter of a point's spread across suppliers); division inverts it entirely. ROUND(..., 2) finishes the figure at cent precision — and the slot trick matters, since SUM or MAX in that position turn the ', 2' into a syntax error while ROUND legitimately consumes it.",
  },
  {
    id: "cs-1603",
    tier: "easy",
    topic: "x6",
    universe: "pricing",
    title: "The lightest pairing",
    brief:
      "From: Pricing. Re: the floor of the experiment.\n\nThe weighted-pairing experiment has a floor too — the lightest price-times-rating cell in the full grid. It anchors the low end of the deck. Name the product, the supplier, and the figure.",
    ask: "Which product-supplier pairing produces the lowest price-times-rating figure?",
    template: `SELECT p.name AS item, {3}(p.price {2} s.rating, 2) AS weighted FROM products p
  {1} suppliers s
  ORDER BY weighted {4}
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the full pairing",
        why: "The floor of the experiment can sit anywhere in the 96-cell grid — CROSS JOIN guarantees every cell is in the race. A partial pairing could miss the true minimum entirely.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the weighting operator",
        why: "Price times rating: 14.99 x 3.9 = 58.46 — the cheapest product against the lowest-rated supplier. The deck weights both dimensions, so multiplication is the contract.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(price * rating, 2) lands the floor at 58.46. SUM or MAX cannot take the , 2 argument — they would error where ROUND legitimately consumes the precision.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the floor direction",
        why: "ASC stacks the lightest cells first, so LIMIT 1 lands on the floor — 58.46. DESC would hand the deck the ceiling (959.95) and the experiment's low end would be missing.",
      },
    ],
    distractors: ["+", "/", "DESC", "SUM"],
    walkthrough:
      "The floor is HDMI 2.1 Cable 2m paired with Pacific Textiles: 14.99 x 3.9 = 58.46. The full grid runs again — CROSS JOIN pairs every product with every supplier — and ORDER BY weighted ASC LIMIT 1 lifts the bottom cell instead of the top. The pairing is doubly deliberate: the cheapest product in the catalog meets the lowest-rated supplier, and both extremes had to be in the race for the floor to be found. DESC would report the ceiling (Smart Watch S x Alpine Audio GmbH at 959.95) — a real number, but the deck's floor anchor, not its ceiling. The operator stays multiplicative by contract: addition would floor at 14.99 + 3.9 = 18.89, division at 14.99 / 4.8 = 3.12 — different experiments, different floors.",
  },
  {
    id: "cs-1604",
    tier: "easy",
    topic: "x6",
    universe: "supplier",
    title: "The owned shelf count",
    brief:
      "From: Procurement. Re: the cross-check.\n\nThe supplier file claims each product belongs to exactly one supplier. Prove the count with the deliberate-pairing pattern: pair every product with every supplier, keep only the true ownership matches, and count them.",
    ask: "How many product-by-supplier pairs represent actual ownership?",
    template: `SELECT {3}(*) AS owned FROM products p
  {1} suppliers s
  WHERE p.supplier_id = {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the deliberate pairing",
        why: "CROSS JOIN builds all 96 product-by-supplier cells; the ownership condition then filters them down. The pairing comes first, the truth second — that is the cross-join discipline.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the ownership key",
        why: "A pair is real ownership when p.supplier_id = s.id — the product's declared supplier matches the paired supplier's key. p.supplier_id = p.id compares a product to itself and matches nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the proof counter",
        why: "COUNT(*) lands the proof at 16 — one true owner per product. SUM or AVG would attempt arithmetic on the asterisk and error; the audit wants a headcount of true pairs.",
      },
    ],
    distractors: ["p.id", "a.id", "SUM", "AVG"],
    walkthrough:
      "Sixteen true ownership pairs — one per product, exactly as the supplier file claims. The pattern is cross-then-filter: FROM products p CROSS JOIN suppliers s lays out all 96 cells, and WHERE p.supplier_id = s.id keeps only the cells where the product's declared supplier matches the paired supplier. Sixteen products, sixteen matches, zero products unowned and zero double-owned. The cross join makes the audit honest: instead of trusting the foreign key silently, the query builds every conceivable pairing and lets the condition keep the true ones — the count is the proof. Test the distractor and the proof collapses: p.supplier_id = p.id compares each product's own two ids and matches nothing, while an alias that does not exist errors out. COUNT(*) turns the surviving rows into the number the file predicted.",
  },
  {
    id: "cs-1605",
    tier: "easy",
    topic: "x6",
    universe: "month-close",
    title: "The pairing skeleton",
    brief:
      "From: Finance ops. Re: the report scaffold.\n\nThe month-close report renders one cell per month per order lane — even before any numbers land in it. Build the scaffold: pair every order month with every lane and count the cells the renderer must draw.",
    ask: "How many month-by-lane cells does the close report scaffold contain?",
    template: `SELECT {2}(*) AS cells FROM (
  SELECT DISTINCT strftime({3}, created_at) AS mo FROM orders
) m
{1} (SELECT DISTINCT status FROM orders) l;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the scaffold pairing",
        why: "Every month must meet every lane — 14 months by 4 lanes. CROSS JOIN builds the full skeleton; the report fills cells later, but the grid must exist first.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the scaffold counter",
        why: "COUNT(*) sizes the scaffold: 56 cells. SUM or AVG would demand numeric cells to fold — the scaffold has none yet, only labels.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "The scaffold slices months as '%Y-%m' — 14 distinct keys from 2024-01 to 2025-02. '%Y' would collapse the scaffold to 2 years by 4 lanes = 8 cells, and the report would lose its columns.",
      },
    ],
    distractors: ["SUM", "'%Y'", "'%m'", "created_at"],
    walkthrough:
      "56 cells — fourteen months by four lanes, the full close-report scaffold. The build is a two-step pairing: the derived table pairs down the orders table to its 14 distinct '%Y-%m' months, the lanes side to its 4 distinct statuses, and CROSS JOIN lays out every combination — 56 empty cells waiting for revenue figures. The format slot is the quiet decision: '%Y-%m' keeps months granular; '%Y' would collapse two years of history into 8 cells and the month-close report would lose its entire column axis; '%m' would fold 2024 and 2025 on top of each other into 12 keys — 48 cells wearing the wrong labels. COUNT(*) sizes the scaffold before a single figure is computed, which is exactly how a report scaffold should be verified: shape first, numbers later.",
  },
  {
    id: "cs-1606",
    tier: "easy",
    topic: "x6",
    universe: "inventory",
    title: "The product-month canvas",
    brief:
      "From: Inventory. Re: the stocking canvas.\n\nThe warehouse planner draws a canvas of every product against every stocking month before allocating shelf space. Build the canvas from the order calendar and count its cells.",
    ask: "How many product-by-month cells does the stocking canvas contain?",
    template: `SELECT {2}(*) AS cells FROM products p
  {1} (SELECT DISTINCT strftime({3}, created_at) AS mo FROM orders) m;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the canvas pairing",
        why: "Every product must meet every month the store has traded — 16 products by 14 months. CROSS JOIN is the deliberate pairing that lays the canvas out.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the canvas counter",
        why: "COUNT(*) sizes the canvas: 224 cells. SUM or AVG would try to fold labels — the canvas has no numbers yet, only the pairing.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the calendar format",
        why: "Months must slice as '%Y-%m' — 14 distinct keys. '%Y' would flatten the calendar to 2 year-rows and the canvas to 32 cells; '%m' would stack both years into 12 keys and 192 mislabeled cells.",
      },
    ],
    distractors: ["SUM", "'%Y'", "'%m'", "issued_on"],
    walkthrough:
      "224 cells — sixteen products against fourteen trading months. The canvas pairs the full product list with the order calendar's distinct '%Y-%m' months under CROSS JOIN: 16 x 14 = 224, every shelf-position the planner could allocate. The format choice is load-bearing: '%Y-%m' keeps the two years distinct, so the canvas spans the store's real trading history. '%Y' would compress it to 2 months-rows — 32 cells, one per product per year — and '%m' would overlay January 2024 on January 2025, 192 cells wearing ambiguous labels. The issued_on distractor breaks the slice entirely: strftime needs a format string in its first argument, and a raw column there produces garbage keys. COUNT(*) verifies the canvas before allocation begins — shape first, shelves second.",
  },
  {
    id: "cs-1607",
    tier: "easy",
    topic: "x6",
    universe: "supplier",
    title: "The shelf leaderboard",
    brief:
      "From: Procurement. Re: the deepest shelf.\n\nUsing the deliberate-pairing pattern — pair every product with every supplier, keep the true ownership matches — find the supplier whose shelf carries the most products. Ties break alphabetically.",
    ask: "Which supplier owns the most products, and how many is that?",
    template: `SELECT s.name, {2}(p.id) AS owned FROM products p
  {1} suppliers s
  WHERE p.supplier_id = {3}
  GROUP BY s.id
  ORDER BY owned DESC, s.name
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the pairing base",
        why: "The audit pattern pairs all 96 cells first, then keeps ownership matches. CROSS JOIN builds the full field the filter mines — the deliberate-pairing discipline.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf counter",
        why: "COUNT(p.id) counts owned products per supplier — three for the leaders. SUM or AVG would fold the ids themselves into meaningless totals; the shelf is a headcount.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the ownership key",
        why: "True ownership is p.supplier_id = s.id. Testing p.supplier_id = p.id compares a product against itself — nothing matches, and every supplier's shelf would read empty.",
      },
    ],
    distractors: ["p.id", "a.id", "SUM", "AVG"],
    walkthrough:
      "Midwest Hardware Co leads the shelf leaderboard with 3 products. The pattern is the ownership audit upgraded to a leaderboard: CROSS JOIN lays out all 96 product-by-supplier cells, p.supplier_id = s.id keeps the 16 true ownership matches, and GROUP BY s.id collapses them per supplier. COUNT(p.id) sizes each shelf — Alpine Audio GmbH 2, Andes Naturals SA 2, then four suppliers at 3 — and ORDER BY owned DESC, s.name breaks the four-way tie alphabetically, landing on Midwest Hardware Co. The ownership key is what makes the pairs true: p.supplier_id = p.id compares a product's row-id against itself and keeps nothing, emptying every shelf at once. SUM or AVG would fold product ids into sums and means — numbers that count nothing. Three products, one shelf, proven by deliberate pairing.",
  },
  {
    id: "cs-1608",
    tier: "easy",
    topic: "x6",
    universe: "growth",
    title: "The month-region canvas",
    brief:
      "From: Growth lead. Re: the regional rollout grid.\n\nThe rollout planner sketches one cell per trading month per member region before assigning campaigns. Build the grid from the order calendar and the member roster, and count the cells.",
    ask: "How many month-by-region cells does the rollout grid contain?",
    template: `SELECT {2}(*) AS cells FROM (
  SELECT DISTINCT strftime({3}, created_at) AS mo FROM orders
) m
{1} (SELECT DISTINCT region FROM customers) r;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the grid pairing",
        why: "Every trading month must meet every member region — 14 months by 4 regions. CROSS JOIN lays the grid out; the campaigns get assigned into it later.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the grid counter",
        why: "COUNT(*) sizes the grid: 56 cells. SUM or AVG would attempt to fold region labels — the grid carries no numbers yet.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month format",
        why: "Months slice as '%Y-%m' — 14 distinct keys. '%Y' would compress the timeline to 2 rows and an 8-cell grid; '%m' would overlap the two years into 48 mislabeled cells.",
      },
    ],
    distractors: ["SUM", "'%Y'", "'%m'", "rowid"],
    walkthrough:
      "56 cells — fourteen trading months against four member regions. The grid pairs the order calendar's distinct '%Y-%m' months with the roster's distinct regions under CROSS JOIN: 14 x 4 = 56 campaign slots. The format drives the timeline: '%Y-%m' keeps 2024 and 2025 separate so each month gets its own row of regions; '%Y' would collapse the whole history into 2 rows — 8 cells, one per year per region — and '%m' would overlay the two Januaries, 48 cells with doubled meaning. The rowid distractor breaks the slice: strftime expects a format string first, and a rowid there yields nonsense keys. COUNT(*) verifies the grid's shape before a single campaign is placed — the planner sees the canvas, then paints it.",
  },
  {
    id: "cs-1609",
    tier: "medium",
    topic: "x6",
    universe: "catalog",
    title: "The sibling shelf",
    brief:
      "From: Catalog ops. Re: the within-category census.\n\nCategory pages need comparison widgets: for each pair of siblings in the same category, one widget slot. Count the unordered sibling pairs — same category, each product counted once.",
    ask: "How many unordered pairs of products share a category?",
    template: `SELECT {3}(*) AS sibling_pairs FROM products a
  {1} products b
  WHERE a.category = b.category AND a.id < {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the sibling pairing",
        why: "Every product must meet every other to test category kinship — 16 x 16 = 256 candidate cells. CROSS JOIN builds the full field; the conditions then carve the true siblings.",
      },
      {
        answer: "b.id",
        kind: "keyword",
        label: "the unordered rule",
        why: "a.id < b.id keeps each pair once — {A, B} survives as (A, B) but not (B, A). Without the id ordering the census would double-count every sibling pair.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the widget counter",
        why: "COUNT(*) lands the widget count at 12. SUM or AVG would fold the asterisk and error — the pages need a count of pairs, not arithmetic.",
      },
    ],
    distractors: ["a.id", "a.category", "SUM", "AVG"],
    walkthrough:
      "Twelve sibling pairs live in the catalog — Accessories 3, Audio 3, Electronics 3, Apparel 1, Video 1, Wearables 1, and Fitness too thin to pair. The census is a self-pairing with discipline: CROSS JOIN meets all 256 product-by-product cells, a.category = b.category keeps kin (24 cells across the seven categories), and a.id < b.id keeps each unordered pair exactly once — the id ordering is what turns 24 directional matches into 12 honest widgets. Flip the ordering rule to a.id < a.id and nothing survives; test a.category against the id column and type coercion empties the census. COUNT(*) sizes the widget order: twelve slots across six category pages, with Accessories, Audio and Electronics carrying the richest comparison shelves.",
  },
  {
    id: "cs-1610",
    tier: "medium",
    topic: "x6",
    universe: "pricing",
    title: "The handdown ledger",
    brief:
      "From: Pricing. Re: the Accessories handdowns.\n\nThe Accessories page runs a handdown ledger: every pair where one accessory is cheaper than another — the budget pick pointing up to the premium one. Count the handdowns in the Accessories shelf.",
    ask: "How many cheaper-to-dearer handdown pairs exist within the Accessories category?",
    template: `SELECT {3}(*) AS handdowns FROM products a
  {1} products b
  WHERE a.price < b.price AND a.category = {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the pairing base",
        why: "The ledger mines the full 256-cell self-pairing: every product meets every other, and the price and category conditions carve the handdowns. Deliberate pairing first, ledger second.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the shelf scope",
        why: "The ledger is scoped to Accessories: three pairs (HDMI cable under desk mat under laptop stand). 'Apparel' would report the jersey-and-socks pair — one — and 'Fitness' none at all.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the ledger counter",
        why: "COUNT(*) sizes the ledger: three handdowns. SUM or AVG would fold the asterisk and error — the page wants a count of upward pointers.",
      },
    ],
    distractors: ["'Apparel'", "'Fitness'", "SUM", "AVG"],
    walkthrough:
      "Three handdowns on the Accessories shelf: HDMI 2.1 Cable 2m (14.99) points up to Desk Mat Extended (24.99) and Laptop Stand Aluminum (42.50), and Desk Mat points up to the Laptop Stand. The ledger mines the full self-pairing — CROSS JOIN builds all 256 product-by-product cells — then the two conditions carve it: a.price < b.price keeps the upward direction, and a.category = 'Accessories' scopes the shelf. The scope is the lever: Apparel carries a single handdown (Running Socks up to Cycling Jersey), Fitness none — its lone product has no sibling to point at. COUNT(*) turns the surviving pairs into the ledger's size. The cross join makes the direction honest: every cheaper-to-dearer arc is examined, and only true within-shelf upward pairs survive.",
  },
  {
    id: "cs-1611",
    tier: "medium",
    topic: "x6",
    universe: "pricing",
    title: "The regional ceiling",
    brief:
      "From: Pricing. Re: the regional weighting map.\n\nThe weighted-pairing experiment scales to regions: for each supplier region, find the heaviest price-times-rating cell its suppliers produce. Name the region that owns the ceiling.",
    ask: "Which supplier region produces the highest weighted price-times-rating cell?",
    template: `SELECT s.region, {3}(p.price {2} s.rating) AS best FROM products p
  {1} suppliers s
  GROUP BY s.region
  ORDER BY best DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the regional pairing",
        why: "Each region's ceiling comes from pairing its suppliers against the whole catalog — CROSS JOIN builds all 96 cells so every regional maximum is genuinely found.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the weighting operator",
        why: "Price times rating: Europe's ceiling is 199.99 x 4.8 = 959.95 via Alpine Audio GmbH. Addition would cap the region at 204.79 and the weighting would barely register.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "MAX picks each region's heaviest cell: EU 959.95, US 879.96, APAC 819.96, LATAM 799.96. MIN would map the floors instead — a different map entirely.",
      },
    ],
    distractors: ["+", "/", "MIN", "SUM"],
    walkthrough:
      "Europe owns the ceiling: 959.95, produced when Alpine Audio GmbH's 4.8 rating weights the 199.99 Smart Watch S. The map is built by deliberate pairing — CROSS JOIN lays all 96 product-by-supplier cells, GROUP BY s.region buckets them four ways, and MAX lifts each region's heaviest weighted cell: EU 959.95, US 879.96 (Midwest 4.4), APAC 819.96 (Shenzhen 4.1), LATAM 799.96 (Andes 4.0). The ordering tracks the ratings because every supplier weights the same 199.99 top price — the region with the strongest rating wins. The operator is the contract: addition would compress the spread to a 0.8-point band (204.79 down to 203.99) and the map would be noise; division would invert the ranking and hand the ceiling to the lowest-rated region. MAX folds each bucket to its ceiling — the map the pricing deck asked for.",
  },
  {
    id: "cs-1612",
    tier: "medium",
    topic: "x6",
    universe: "growth",
    title: "The priced canvas",
    brief:
      "From: Growth lead. Re: the premium exposure count.\n\nThe outreach canvas pairs every member with every product, but this quarter's slice is premium only: products priced above 100. Count the member-by-product cells in the premium band.",
    ask: "How many member-by-product cells exist when only products priced above 100 are shown?",
    template: `SELECT {2}(*) AS cells FROM customers c
  {1} products p
  WHERE p.price > {3};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the canvas pairing",
        why: "Every member meets every product — 16 x 16 = 256 cells — before the price band narrows the slice. CROSS JOIN is the deliberate pairing the canvas is drawn from.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the cell counter",
        why: "COUNT(*) sizes the slice: 64 cells. SUM or AVG would fold the asterisk and error — the canvas wants a cell count, not arithmetic.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium line",
        noVerify: true,
        why: "Four products clear 100 — Studio Desktop Mic 119, 4K Webcam Pro 129, Noise-Canceling Headset 149.99, Smart Watch S 199.99 — so 16 x 4 = 64 cells. Dropping to 50 doubles the canvas to 128.",
      },
    ],
    distractors: ["50", "150", "SUM", "AVG"],
    walkthrough:
      "64 cells — every member paired with each of the four premium products. The canvas is drawn by deliberate pairing: CROSS JOIN meets all 256 member-by-product cells, and the price band p.price > 100 keeps only the premium column — Studio Desktop Mic 119, 4K Webcam Pro 129, Noise-Canceling Headset 149.99 and Smart Watch S 199.99. 16 members x 4 products = 64. The line is the lever: lower it to 50 and the canvas doubles to 128 cells (eight products clear it); raise it to 150 and only the headset and the watch survive — 32 cells. COUNT(*) sizes the slice before any outreach math begins, and the cross join guarantees the canvas is symmetric: every member sees the same premium wall.",
  },
  {
    id: "cs-1613",
    tier: "medium",
    topic: "x6",
    universe: "month-close",
    title: "The ordered lane crosswalk",
    brief:
      "From: Finance ops. Re: the lane transition map.\n\nThe close pack wants a lane-pair map where the first lane sorts strictly before the second — an ordered reading of the lane vocabulary. Count the ordered pairs the map needs.",
    ask: "How many strictly-ordered pairs of order lanes exist (first before second alphabetically)?",
    template: `SELECT {3}(*) AS ordered FROM (
  SELECT DISTINCT status FROM orders
) a
{1} (SELECT DISTINCT status FROM orders) b
WHERE a.status < {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the lane pairing",
        why: "Every lane must meet every lane — including itself — to test the ordering: 4 x 4 = 16 cells. CROSS JOIN builds the vocabulary square the map reads from.",
      },
      {
        answer: "b.status",
        kind: "keyword",
        label: "the ordering test",
        why: "a.status < b.status keeps only the strictly-before pairs: cancelled-before-delivered, -before-pending, -before-shipped, and delivered-before-pending, -before-shipped, and pending-before-shipped. Testing a.status against itself matches nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the map counter",
        why: "COUNT(*) lands the map at 6 ordered pairs. SUM or AVG would fold the asterisk and error — the map needs a count of transitions.",
      },
    ],
    distractors: ["a.status", "'shipped'", "SUM", "AVG"],
    walkthrough:
      "Six ordered lane pairs — the strict upper triangle of the 4x4 vocabulary square. The map pairs the lane vocabulary with itself under CROSS JOIN (16 cells, self-pairings included), and a.status < b.status keeps only the cells where the first lane sorts strictly before the second: cancelled pairs with delivered, pending and shipped; delivered with pending and shipped; pending with shipped. Four lanes choose two: 6 transitions. The distractors each break the ordering: a.status < a.status is never true and the map empties; anchoring the second lane to 'shipped' collapses the map to the three pairs that end at shipped. COUNT(*) sizes the transition map — the same triangle arithmetic the close pack uses for any ordered vocabulary, from lanes to ledger codes.",
  },
  {
    id: "cs-1614",
    tier: "medium",
    topic: "x6",
    universe: "pricing",
    title: "The rated canvas ceiling",
    brief:
      "From: Pricing. Re: the trusted-supplier ceiling.\n\nRestrict the weighting experiment to suppliers rated 4.4 and up, and find the heaviest price-times-rating cell among them — product and supplier, named.",
    ask: "Which pairing of product with a 4.4-plus supplier produces the highest weighted figure?",
    template: `SELECT s.name, {3}(p.price {2} s.rating) AS best FROM products p
  {1} suppliers s
  WHERE s.rating >= 4.4
  GROUP BY s.id
  ORDER BY best DESC
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the trusted pairing",
        why: "The trusted shortlist still pairs against the whole catalog: CROSS JOIN builds all 96 cells, the rating gate trims the suppliers to Alpine, Nordic and Midwest, and the contest runs on 48 cells.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the weighting operator",
        why: "Price times rating: Alpine's 4.8 weights the 199.99 Smart Watch S to 959.95 — the ceiling. Addition would cap the same pairing at 204.79 and the rating would barely register.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling fold",
        why: "MAX lifts each trusted supplier's heaviest cell: Alpine 959.95, Nordic 919.96, Midwest 879.96. MIN would read the floors — Alpine's own floor is 71.95 — and crown the wrong pairing.",
      },
    ],
    distractors: ["+", "/", "MIN", "SUM"],
    walkthrough:
      "The trusted-supplier ceiling is Alpine Audio GmbH pairing with Smart Watch S: 199.99 x 4.8 = 959.95. The experiment narrows first, pairs second: CROSS JOIN builds the full 96-cell field, s.rating >= 4.4 gates the suppliers to Alpine Audio GmbH (4.8), Nordic Gadgets AB (4.6) and Midwest Hardware Co (4.4) — 48 cells — and GROUP BY s.id with MAX lifts each trusted supplier's heaviest weighted pairing. Alpine keeps the crown because weighting is multiplicative: its 4.8 rating amplifies the catalog's 199.99 ceiling beyond what Nordic's 4.6 or Midwest's 4.4 can reach. MIN would invert the read and crown a floor; addition would flatten all three suppliers into a 0.4-point band. The rating gate did not change the champion — it changed the field the champion had to win.",
  },
  {
    id: "cs-1615",
    tier: "medium",
    topic: "x6",
    universe: "catalog",
    title: "The category crosswalk",
    brief:
      "From: Catalog ops. Re: the cross-category link plan.\n\nThe storefront wants cross-category links: every pair of distinct categories connected once, first-before-second. Count the links the link planner must draw across the seven-category vocabulary.",
    ask: "How many strictly-ordered pairs of distinct product categories exist?",
    template: `SELECT {3}(*) AS pairs FROM (
  SELECT DISTINCT category FROM products
) a
{1} (SELECT DISTINCT category FROM products) b
WHERE a.category < {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the vocabulary pairing",
        why: "The seven-category vocabulary meets itself — 49 cells — under CROSS JOIN; the strict-ordering condition then carves the unordered links out of the square.",
      },
      {
        answer: "b.category",
        kind: "keyword",
        label: "the ordering rule",
        why: "a.category < b.category keeps each unordered pair once — seven categories choose two = 21 links. Testing a.category against itself keeps nothing.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the link counter",
        why: "COUNT(*) lands the plan at 21 links. SUM or AVG would fold the asterisk and error — the planner wants a count of connections.",
      },
    ],
    distractors: ["a.category", "'Video'", "SUM", "AVG"],
    walkthrough:
      "Twenty-one cross-category links — seven categories choose two. The crosswalk pairs the category vocabulary with itself under CROSS JOIN (49 cells, diagonals included), and a.category < b.category keeps the strict upper triangle: Accessories links up to six categories, Apparel to five, and so on down to Video's single link with Wearables. The triangle rule is what makes the count honest — each unordered pair survives exactly once, and the diagonal (a category linking to itself) is excluded by the strict inequality. Test the wrong side and the crosswalk empties; pin the second category to 'Video' and the plan collapses to the five links that end there. COUNT(*) sizes the link planner's job: 21 connections across a seven-node catalog map.",
  },
  {
    id: "cs-1616",
    tier: "medium",
    topic: "x6",
    universe: "pricing",
    title: "The weighted floor leaderboard",
    brief:
      "From: Pricing. Re: the per-supplier floors.\n\nFlip the weighting experiment: for each supplier, find the lightest price-times-rating cell on their pairing row. Rank the floors and name the supplier holding the lowest one.",
    ask: "Which supplier produces the lowest weighted price-times-rating cell, and what is that floor?",
    template: `SELECT s.name, {3}(p.price {2} s.rating) AS floor FROM products p
  {1} suppliers s
  GROUP BY s.id
  ORDER BY floor {4}, s.name
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the pairing base",
        why: "Every supplier's floor comes from pairing them against the whole catalog — all 96 cells — and taking the lightest on their row. CROSS JOIN builds the rows the floors are read from.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the weighting operator",
        why: "Price times rating: Pacific Textiles' floor is 14.99 x 3.9 = 58.46 — the cheapest product under the lowest rating. Addition would floor at 18.89 and division at 3.12; different experiments.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "MIN reads each supplier's lightest cell: Pacific 58.46, Andes 59.96, Midwest 65.96. MAX would read the ceilings and crown Alpine's 959.95 — the opposite end of every row.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the floor direction",
        why: "ASC stacks the lightest floors first, so LIMIT 1 lands on Pacific Textiles. DESC would report the heaviest ceiling in the book — 959.95 — and the leaderboard would be upside down.",
      },
    ],
    distractors: ["+", "/", "MAX", "SUM", "DESC"],
    walkthrough:
      "Pacific Textiles owns the floor: 14.99 x 3.9 = 58.46 — the catalog's cheapest product weighted by the book's lowest rating. The leaderboard inverts the usual ceiling hunt: CROSS JOIN pairs every product with every supplier (96 cells), GROUP BY s.id buckets them six ways, and MIN lifts each supplier's lightest cell — Pacific 58.46, Andes 59.96, Midwest 65.96, Shenzhen 68.96, Nordic 68.95-to-69 territory, Alpine 71.95. ORDER BY floor ASC, s.name stacks the floors lightest-first and LIMIT 1 crowns Pacific. The operator stays multiplicative by contract: addition floors at 18.89, division at Alpine's 3.12 — both real numbers from different experiments. MAX or DESC would flip the board and crown the ceiling — Smart Watch S x Alpine at 959.95 — which the deck already knows.",
  },
  {
    id: "cs-1617",
    tier: "medium",
    topic: "x6",
    universe: "supplier",
    title: "The full-shelf census",
    brief:
      "From: Procurement. Re: the capacity check.\n\nA supplier shelf is 'full' when it carries three or more products. Using the deliberate-pairing pattern, count how many suppliers run full shelves.",
    ask: "How many suppliers own three or more products?",
    template: `SELECT COUNT(*) AS full_shelves FROM products p
  {1} suppliers s
  WHERE p.supplier_id = s.id
  GROUP BY s.id
  HAVING {2}(p.id) >= {3};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the pairing base",
        why: "The audit pairs all 96 cells first and lets the ownership condition keep the 16 true matches. CROSS JOIN is the deliberate-pairing base the census mines.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the shelf tally",
        why: "COUNT(p.id) sizes each supplier's shelf so HAVING can gate it — two suppliers at 2, four at 3. SUM or AVG would fold the ids into meaningless figures the gate cannot read.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the full-shelf line",
        noVerify: true,
        why: "Three or more defines full: four suppliers qualify (Midwest, Nordic, Pacific, Shenzhen). Dropping the line to 2 admits Alpine and Andes too — all six shelves would pass.",
      },
    ],
    distractors: ["SUM", "AVG", "2", "4"],
    walkthrough:
      "Four suppliers run full shelves: Midwest Hardware Co, Nordic Gadgets AB, Pacific Textiles and Shenzhen Electro each own 3 products, while Alpine Audio GmbH and Andes Naturals SA carry 2. The census is the ownership audit with a gate: CROSS JOIN lays out all 96 cells, p.supplier_id = s.id keeps the 16 true ownership matches, GROUP BY s.id buckets them per supplier, and HAVING COUNT(p.id) >= 3 keeps only the full shelves. COUNT(*) then counts the survivors — four. The gate line is the finding's edge: lower it to 2 and every supplier in the book passes, telling procurement nothing; raise it to 4 and the census reads zero even though four shelves sit exactly at capacity. SUM or AVG in the tally would fold product ids into figures the gate cannot meaningfully compare. Four full shelves, three thin ones — the capacity picture in one row.",
  },
  {
    id: "cs-1618",
    tier: "hard",
    topic: "x6",
    universe: "month-close",
    title: "The lane lattice, flagged",
    brief:
      "From: Finance ops. Re: the vocabulary audit.\n\nThe lane vocabulary gets a structural audit: across the full lane-by-lane square, how many cells pair a lane with itself, and how many pair a lane with one sorting strictly later? One pass, both flags.",
    ask: "Across the lane-by-lane square, how many cells are same-lane and how many are strictly-ordered?",
    template: `SELECT SUM(CASE WHEN a.status = b.status THEN 1 ELSE 0 END) AS same_lane,
       {3}(CASE WHEN a.status < {2} THEN 1 ELSE 0 END) AS ordered
FROM (SELECT DISTINCT status FROM orders) a
{1} (SELECT DISTINCT status FROM orders) b;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the lattice pairing",
        why: "The audit reads the full 4x4 vocabulary square — every lane against every lane, self-pairings included. CROSS JOIN builds all 16 cells the two flags score.",
      },
      {
        answer: "b.status",
        kind: "keyword",
        label: "the ordered test",
        why: "a.status < b.status flags the strict upper triangle — 6 cells. Testing a.status against itself flags nothing, and the ordered column would read zero.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the flag fold",
        why: "SUM totals the 1/0 flags: same-lane 4 (the diagonal), ordered 6 (the triangle). COUNT would tally every row's flag as 1 — 16 and 16 — reading the whole square as ordered.",
      },
    ],
    distractors: ["a.status", "=", "COUNT", "MAX", "+"],
    walkthrough:
      "The lattice audit reads: 4 same-lane cells, 6 strictly-ordered cells — the diagonal and the upper triangle of the 4x4 lane square. One pass scores both: CROSS JOIN pairs the lane vocabulary with itself (16 cells), the first CASE flags the diagonal (a.status = b.status: four self-pairings), the second flags the strict upper triangle (a.status < b.status: cancelled-before-delivered, -before-pending, -before-shipped, and delivered-before-pending, -before-shipped, and pending-before-shipped), and SUM totals each flag column. The distractors each misread the square: anchoring the ordered test to a.status zeroes the triangle; '=' in the slot flags every cell (16 ordered — the square, not the triangle); COUNT tallies flags instead of summing them, reading 16 in both columns; MAX caps both columns at 1. Diagonal 4, triangle 6 — the vocabulary's structure in one row.",
  },
  {
    id: "cs-1619",
    tier: "hard",
    topic: "x6",
    universe: "pricing",
    title: "The category gap ruler",
    brief:
      "From: Pricing. Re: the within-category spread map.\n\nEach category has a spread: the biggest price gap between two of its own products, cheaper to dearer. Rank the categories by spread and name the widest one, with the figure.",
    ask: "Which category has the widest cheaper-to-dearer price gap, and what is that gap?",
    template: `SELECT a.category, {3}(b.price {2} a.price) AS max_gap FROM products a
  {1} products b
  WHERE a.price < b.price AND a.category = b.category
  GROUP BY a.category
  ORDER BY max_gap {4}
  LIMIT 1;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the sibling pairing",
        why: "Every product must meet every other to find within-category gaps — the 256-cell self-pairing. CROSS JOIN builds the field the two conditions carve into sibling pairs.",
      },
      {
        answer: "-",
        kind: "keyword",
        label: "the spread operator",
        why: "The gap is dearer minus cheaper: Wearables' 199.99 - 79 = 120.99. Addition would rank by sums (278.99 for the same pair) and the spread map would rank magnitudes, not spreads.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the spread fold",
        why: "MAX lifts each category's widest gap: Wearables 120.99, Audio 90, Video 89.01. MIN would read the tightest gaps — Accessories' 10 — and crown the opposite extreme.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the spread direction",
        why: "DESC stacks the widest spreads first, so LIMIT 1 lands on Wearables. ASC would surface Accessories — a 10-unit gap — as the 'widest' spread in the book.",
      },
    ],
    distractors: ["/", "ASC", "COUNT", "b.price", "a.category"],
    walkthrough:
      "Wearables runs the widest within-category spread: 120.99 between Fitness Band X2 (79) and Smart Watch S (199.99). The map mines the self-pairing — CROSS JOIN builds all 256 product-by-product cells, and a.price < b.price plus a.category = b.category carve the 12 same-category cheaper-to-dearer pairs. GROUP BY a.category buckets them six ways (Fitness has a single product, no pairs), MAX lifts each bucket's widest gap — Wearables 120.99, Audio 90, Video 89.01, Electronics 55.49, Apparel 46.50, Accessories 32.50 — and ORDER BY max_gap DESC LIMIT 1 crowns Wearables. The operator is the contract: subtraction measures the spread; division would rank ratios and crown Apparel's 3.5x. Switching the fold to COUNT would rank pair counts instead of spreads, and ASC would flip the map to Accessories' 10-unit gap. The widest within-category stretch in the book: 120.99, Wearables.",
  },
  {
    id: "cs-1620",
    tier: "hard",
    topic: "x6",
    universe: "funnel",
    title: "The adjacent pairs",
    brief:
      "From: Growth lead. Re: the sequence census.\n\nOrder sequences matter: a pair counts as adjacent when the same member placed both orders back-to-back — nothing in between. Count the adjacent pairs across the whole order book.",
    ask: "How many back-to-back order pairs exist across all members?",
    template: `SELECT {3}(*) AS adjacent FROM orders a
  {1} orders b
  WHERE a.customer_id = b.customer_id AND a.created_at < {2}
  AND NOT EXISTS (
    SELECT 1 FROM orders m
    WHERE m.customer_id = a.customer_id
      AND m.created_at > a.created_at AND m.created_at < b.created_at
  );`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the sequence pairing",
        why: "Every order must meet every other to test adjacency — the 103 x 103 grid minus self-pairings. CROSS JOIN builds the full field; the same-member and ordering conditions carve it down.",
      },
      {
        answer: "b.created_at",
        kind: "keyword",
        label: "the forward rule",
        why: "a.created_at < b.created_at gives every pair a direction, so each adjacent step counts once. Testing a.created_at against itself keeps nothing — the census would read zero.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the step counter",
        why: "COUNT(*) lands the census at 87 — one adjacent step per order except each member's first. SUM or AVG would fold the asterisk and error.",
      },
    ],
    distractors: ["a.created_at", "o.created_at", "m.created_at", "SUM"],
    walkthrough:
      "87 adjacent pairs — exactly the order count minus one per member: 103 orders across 16 members, each member's sequence contributing its own steps. The census mines the self-pairing grid: CROSS JOIN meets every order with every other, a.customer_id = b.customer_id keeps same-member pairs, and a.created_at < b.created_at gives each pair a forward direction. The NOT EXISTS clause is the adjacency test — it keeps only pairs with no third order between them, collapsing each member's chain of n orders to exactly n-1 adjacent steps. The distractors each break the census: testing a.created_at against itself zeroes the grid; o.created_at and m.created_at name aliases that do not exist in the outer scope and error out. 87 steps — the order book's full skeleton, chain by chain.",
  },
  {
    id: "cs-1621",
    tier: "hard",
    topic: "x6",
    universe: "pricing",
    title: "The region-rank canvas",
    brief:
      "From: Pricing. Re: the weighted regional ranking.\n\nThe weighting experiment ranks regions by their heaviest price-times-rating cell. Pull the second-ranked region with its ceiling — the runner-up line the committee compares against the leader.",
    ask: "Which region ranks second by heaviest weighted cell, and what is that ceiling?",
    template: `SELECT region, {3} FROM (
  SELECT s.region AS region, ROUND(MAX(p.price * s.rating), 2) AS best,
    ROW_NUMBER() OVER (ORDER BY MAX(p.price * s.rating) DESC) AS rn
  FROM products p
  {1} suppliers s
  GROUP BY s.region
) WHERE rn = {2};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the regional pairing",
        why: "Each region's ceiling comes from pairing its suppliers against the whole catalog — CROSS JOIN builds all 96 cells the regional MAX folds read from.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the runner-up line",
        noVerify: true,
        why: "ROW_NUMBER pins the ranking: EU 1 at 959.95, US 2 at 879.96, APAC 3, LATAM 4. The outer rn = 2 takes the runner-up — the US line. Line 1 is the leader; line 4 the floor.",
      },
      {
        answer: "best",
        kind: "keyword",
        label: "the ceiling column",
        why: "The committee reads the ceiling figure, so the outer projection carries best: 879.96 for the US. Projecting rn would print a rank where the number belongs; region would print a label twice.",
      },
    ],
    distractors: ["rn", "region", "1", "3", "4", "SUM"],
    walkthrough:
      "The runner-up region is the US, its ceiling 879.96 — Midwest Hardware Co's 4.4 rating weighting the 199.99 Smart Watch S. The query is a ranked canvas: CROSS JOIN pairs every product with every supplier (96 cells), GROUP BY s.region folds each region's ceiling via MAX — EU 959.95, US 879.96, APAC 819.96, LATAM 799.96 — and ROW_NUMBER() OVER (ORDER BY ... DESC) pins each region's line. The outer WHERE rn = 2 peels the runner-up off the board, and the projection carries best so the committee sees the figure, not the rank. The distractors each misplace the read: rn in the projection prints the number 2 where 879.96 belongs; region prints 'US' twice; lines 1, 3 and 4 fetch the leader, the third and the floor. The ranking tracks the ratings — stronger suppliers, heavier ceilings — and the US sits second at 879.96.",
  },
  {
    id: "cs-1622",
    tier: "hard",
    topic: "x6",
    universe: "month-close",
    title: "The grand canvas",
    brief:
      "From: Finance ops. Re: the triple-axis scaffold.\n\nThe close pack's grand scaffold crosses three axes: every product against every trading month and every order lane. Count the cells the renderer must draw before a single figure lands.",
    ask: "How many product-by-month-by-lane cells does the grand scaffold contain?",
    template: `SELECT {2}(*) AS cells FROM products p
  {1} (SELECT DISTINCT strftime({3}, created_at) AS mo FROM orders) m
  CROSS JOIN (SELECT DISTINCT status FROM orders) l;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the axis pairing",
        why: "The scaffold pairs all three axes deliberately: 16 products by 14 months by 4 lanes. CROSS JOIN builds the product-month field the lane axis then multiplies.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the scaffold counter",
        why: "COUNT(*) sizes the scaffold: 896 cells. SUM or AVG would fold the asterisk and error — the scaffold carries labels, not numbers.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the calendar format",
        why: "Months slice as '%Y-%m' — 14 keys. '%Y' would compress the timeline to 2 and the scaffold to 128 cells; '%m' would overlay the years into 12 keys and 768 cells.",
      },
    ],
    distractors: ["SUM", "'%Y'", "'%m'", "issued_on"],
    walkthrough:
      "896 cells — sixteen products, fourteen trading months, four order lanes, crossed in one scaffold. The build chains the axes: products pair with the order calendar's distinct '%Y-%m' months under CROSS JOIN (224 cells), and the second CROSS JOIN multiplies in the lane axis — 224 x 4 = 896 cells, every product-month-lane combination the renderer must draw. The format drives the middle axis: '%Y-%m' keeps both years distinct so the scaffold spans the real trading history; '%Y' would compress it to 128 cells and '%m' to 768 with overlaid years. The issued_on distractor breaks the slice — strftime's first argument must be a format string, and a raw column there yields garbage keys. COUNT(*) verifies the scaffold's shape before any revenue lands in it: 896 cells, three axes, zero figures.",
  },
  {
    id: "cs-1623",
    tier: "hard",
    topic: "x6",
    universe: "refund-audit",
    title: "The invoice reach",
    brief:
      "From: Billing ops. Re: the pairing fanout.\n\nThe billing walk pairs every order with every invoice and keeps the pairs where the invoice was issued on or after the order date, same member. Count the surviving pairs — the fanout the reconciliation must walk.",
    ask: "How many order-by-invoice pairs survive the same-member, issued-on-or-after test?",
    template: `SELECT {3}(*) AS matches FROM orders o
  {1} invoices i
  WHERE i.customer_id = o.customer_id AND i.issued_on >= date(o.{2});`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the fanout pairing",
        why: "Every order meets every invoice — 103 x 28 = 2884 candidate cells. CROSS JOIN builds the full field; the same-member and date conditions carve the true reach.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the order-date key",
        why: "The reach test anchors on the order's placement date: date(o.created_at) normalizes the timestamp to a date so the comparison with issued_on is honest. o.id would feed a row number where a date belongs.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach counter",
        why: "COUNT(*) lands the fanout at 170 surviving pairs. SUM or AVG would fold the asterisk and error — the reconciliation wants a count of pairs to walk.",
      },
    ],
    distractors: ["id", "shipped_at", "o.customer_id", "SUM"],
    walkthrough:
      "170 order-by-invoice pairs survive the reach test — the fanout a per-member reconciliation must walk. The field is built by deliberate pairing: CROSS JOIN meets all 2884 order-by-invoice cells, i.customer_id = o.customer_id keeps same-member pairs, and i.issued_on >= date(o.created_at) keeps invoices issued on or after the order's placement date — the date() wrapper normalizes the timestamp so the calendar comparison is clean. The surviving 170 spread over ten members; members with no invoices contribute nothing, which is exactly the gap the billing team already knows. The distractors each poison the anchor: date(o.id) dates a row number and matches nothing; date(o.shipped_at) anchors on shipping, which is NULL for the 21 unshipped orders and drops their reach; date(o.customer_id) dates a member key. COUNT(*) lands the fanout — 170 pairs, walked member by member.",
  },
  {
    id: "cs-1624",
    tier: "hard",
    topic: "x6",
    universe: "supplier",
    title: "The supplier ladder, flagged",
    brief:
      "From: Procurement. Re: the rating-square audit.\n\nThe supplier ratings get the lattice audit: across the full supplier-by-supplier square, how many cells pair a supplier with itself, and how many pair one strictly below a higher-rated peer? One pass, both flags.",
    ask: "Across the supplier-by-supplier square, how many cells are same-supplier and how many are strictly-below?",
    template: `SELECT SUM(CASE WHEN a.rating = b.rating THEN 1 ELSE 0 END) AS ties,
       {3}(CASE WHEN a.rating < {2} THEN 1 ELSE 0 END) AS ups
FROM suppliers a
{1} suppliers b;`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the lattice pairing",
        why: "The audit reads the full 6x6 rating square — every supplier against every peer, self-pairings included. CROSS JOIN builds all 36 cells the two flags score.",
      },
      {
        answer: "b.rating",
        kind: "keyword",
        label: "the below test",
        why: "a.rating < b.rating flags the strictly-below cells — 15 of the 36, one per ordered pair of distinct ratings. Testing a.rating against itself flags nothing.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the flag fold",
        why: "SUM totals the 1/0 flags: ties 0 (all six ratings are distinct), ups 15. COUNT would tally every row's flag as 1 — 6 and 6 — reading the whole square as tied and as ordered.",
      },
    ],
    distractors: ["a.rating", "4.4", "COUNT", "MAX", "="],
    walkthrough:
      "The rating-square audit reads: 0 ties, 15 strictly-below cells — every supplier in the book rates differently, so the diagonal is the only equal-rating territory and it is empty by the tie test. One pass scores both flags: CROSS JOIN pairs the six suppliers with themselves (36 cells), the first CASE flags equal ratings (none — 4.8, 4.6, 4.4, 4.1, 4.0 and 3.9 are all distinct), the second flags a.rating < b.rating, which fires on exactly the 15 ordered pairs of the six distinct ratings. SUM totals each column. The distractors each misread the square: anchoring the below-test to a.rating zeroes it; pinning it to 4.4 collapses the count to the three suppliers below 4.4; COUNT tallies flags as row counts (6 and 6); MAX caps both at 1. A clean rating ladder: no ties, fifteen rungs.",
  },
  {
    id: "cs-1625",
    tier: "hard",
    topic: "x6",
    universe: "pricing",
    title: "The second-lightest pairing",
    brief:
      "From: Pricing. Re: the runner-up floor.\n\nThe per-supplier floor leaderboard is built — lightest price-times-rating cell per supplier. Pull the second line: the supplier holding the runner-up floor, with the figure.",
    ask: "Which supplier holds the second-lowest weighted floor, and what is that floor?",
    template: `SELECT s.name, {3}(p.price {2} s.rating) AS floor FROM products p
  {1} suppliers s
  GROUP BY s.id
  ORDER BY floor ASC, s.name
  LIMIT 1 OFFSET {4};`,
    slots: [
      {
        answer: "CROSS JOIN",
        kind: "keyword",
        label: "the pairing base",
        why: "Each supplier's floor comes from their full pairing row against the catalog — CROSS JOIN builds all 96 cells the per-supplier MIN folds read from.",
      },
      {
        answer: "*",
        kind: "keyword",
        label: "the weighting operator",
        why: "Price times rating: the floors are Pacific 58.46, Andes 59.96, Midwest 65.96 and up. The multiplicative contract keeps the rating amplifying the price on every row.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor fold",
        why: "MIN reads each supplier's lightest cell — the floor the leaderboard ranks. MAX would read the ceilings and the runner-up would be Nordic's 919.95, a different board entirely.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the runner-up offset",
        noVerify: true,
        why: "OFFSET 1 skips the first line — Pacific Textiles' 58.46 — and lands on the runner-up: Andes Naturals SA at 59.96. OFFSET 0 would return the leader; OFFSET 2 the third line.",
      },
    ],
    distractors: ["+", "/", "MAX", "SUM", "0", "2"],
    walkthrough:
      "The runner-up floor belongs to Andes Naturals SA: 59.96, from the catalog's cheapest product (14.99) weighted by Andes' 4.0 rating. The leaderboard is a per-supplier floor read: CROSS JOIN pairs every product with every supplier, GROUP BY s.id buckets the cells, and MIN lifts each supplier's lightest weighted pairing — Pacific Textiles 58.46, Andes 59.96, Midwest 65.96 and onward. ORDER BY floor ASC, s.name stacks the board and OFFSET 1 skips the leader, handing the committee the runner-up. The offset is the whole discipline: OFFSET 0 returns the leader the board already knows, OFFSET 2 the third line. MAX would read the ceilings and crown Nordic's 919.95; the additive or divisive operators would rerun the experiment under different contracts — 18.99 and 3.26 for Andes respectively — not the weighting the deck agreed on.",
  },
];
