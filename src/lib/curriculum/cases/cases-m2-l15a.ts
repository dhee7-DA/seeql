// Case batch M2-L15a — topic l15 (Joins + aggregates), ids cs-501…cs-517.
// Category-grain and supplier-grain revenue at line grain:
// ROUND(SUM(oi.quantity * oi.unit_price), 2) grouped by p.category / s.name,
// status-filtered variants, HAVING gates, ranked cuts. Every figure is audited
// against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L15a: CaseStudy[] = [
  {
    id: "cs-501",
    tier: "easy",
    topic: "l15",
    universe: "month-close",
    title: "The shelf ledger behind the close",
    brief:
      "From: Controller. Re: month-end close, revenue support schedule.\n\nThe support schedule's shelf page needs the full category breakdown at line grain: how many sale lines each shelf carries and what those lines actually billed — each line at its own quantity times the price it sold at, added per shelf, biggest billed first. The page has to reassemble the book's 34,833.28 to the cent or it does not leave my desk.",
    ask: "Each product category with its sale-line count and line-billed revenue, biggest revenue first.",
    template: `SELECT p.category, COUNT(*) AS lines, ROUND({1}, 2) AS revenue
FROM order_items oi
JOIN products p ON {2} = {3}
GROUP BY {4}
ORDER BY revenue {5};`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line-charged revenue",
        why: "Line grain charges every sale line at its own quantity times its own selling price — that is the figure the close can defend. Summing units instead prints 97 for a shelf that billed 11,744.01, and the schedule would not tie to anything.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Every sale line names its item through product_id — that is the thread that carries each line to its shelf. The line's own id would match line numbers against item numbers and bill the shelves with a fiction.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column, where item rows are numbered. The catalog has no product_id column of its own, so that spelling errors before the shelf page has a single figure.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the shelf column",
        why: "One bucket per shelf means grouping on the category column of the catalog. Grouping on item name would deliver sixteen rows of products where the schedule asked for seven shelves.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest billed first is descending — the page opens on the weight. Ascending would lead the close binder with the 863.91 Fitness line and bury the 11,744.01 shelf at the bottom.",
      },
    ],
    distractors: ["SUM(oi.quantity)", "oi.id", "p.name", "s.name", "ASC"],
    walkthrough:
      "The shelf page is the line files bucketed by shelf: every sale line charges quantity times the price it actually sold at, the buckets add up, and the page ranks by billed value. Seven shelves come back, and the shape is the argument: Audio bills 11,744.01 on 51 lines while Accessories needs 62 lines to bill 3,294.29 — the value shelf and the volume shelf sitting in one table. Wearables posts 6,929.12 on just 25 lines, the steepest value per line on the page; Video 5,198.41, Electronics 4,818.61, Apparel 1,984.93 and Fitness 863.91 fill out the ledger. Add the seven figures and they land on 34,833.28 exactly — the reconciliation the close binder opens with. The line-charged column is what makes that tie possible: charging each line once is the difference between a schedule that ties and the 103,244.55 photocopy the auditors already know about.",
  },
  {
    id: "cs-502",
    tier: "easy",
    topic: "l15",
    universe: "refund-audit",
    title: "The cancellation pool, shelf by shelf",
    brief:
      "From: refunds@ — queue review. Re: goodwill pool by shelf.\n\nThe goodwill pool for this cycle is the value sitting on cancelled bookings, and finance wants it split by the shelf the goods came from before we set the auto-approve line. Line-charged value per shelf, biggest pool first. If one shelf dominates the pool, the policy conversation starts there and I want the figure on the record first.",
    ask: "Each product category with the line-charged value sitting on cancelled bookings, biggest pool first.",
    template: `SELECT p.category, ROUND({1}, 2) AS refund_pool
FROM order_items oi
JOIN orders o ON {2} = {3}
JOIN products p ON oi.product_id = p.id
WHERE o.status = {4}
GROUP BY p.category
ORDER BY refund_pool DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line-charged pool",
        why: "The pool is the value of the goods that died, charged line by line. Summing booking totals across the pairing re-bills every cancelled booking once per line and prints a pool that exists nowhere in the ledger.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines attach to bookings through order_id — the first hop that lets a status filter on the booking side reach the line's value. The line's own id would pair line numbers with booking numbers and read a different queue entirely.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the booking ledger's id column. Bookings carry no order_id of their own, so that guess breaks the chain before the pool exists.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The pool is defined by the quoted text 'cancelled', lowercase and exact. 'Cancelled' capitalized matches nothing — the pool would print empty and the auto-approve line would be set from a blank page.",
      },
    ],
    distractors: ["SUM(o.total)", "oi.id", "o.customer_id", "'Cancelled'"],
    walkthrough:
      "The pool is the line files behind a dead-ticket gate: lines joined to bookings on order_id, kept to 'cancelled', charged per line and bucketed by shelf. The queue holds 1,152.49 across 12 dead lines, and the split is tighter than anyone expected: Audio 389.78 on 3 lines, Electronics 382.76 on 3 — a seven-dollar gap at the top — then Fitness 131.28, Apparel 125.12 and Accessories 123.55. The loudest number is the absence: Wearables and Video never appear, because not one cancelled line came off either shelf. So the auto-approve conversation opens on mid-value gear, not premium watches, and two whole shelves are provably clean this cycle. The exact-text trap is worth a line in the review: a capitalized 'Cancelled' returns an empty pool, and a policy set from an empty pool approves everything.",
  },
  {
    id: "cs-503",
    tier: "easy",
    topic: "l15",
    universe: "pricing",
    title: "The shelves that move the most units",
    brief:
      "From: Head of Product. Re: pricing review, the volume map.\n\nBefore the repricing meeting I want the volume picture separated from the value picture: how many units each shelf has actually moved off the register, densest shelf first. If the biggest mover is also the cheapest shelf, the pricing ladder has a hole in the middle and I want to see it before anyone pitches an increase.",
    ask: "Each product category with the total units purchased, densest first.",
    template: `SELECT p.category, {1} AS units
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY {2}
ORDER BY units {3};`,
    slots: [
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units moved",
        why: "The ask is movement, so the column is the quantities summed per shelf. Charging quantity times price would answer last quarter's value question and hide the volume story the meeting needs.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the shelf column",
        why: "One bucket per shelf means grouping on the catalog's category column. Grouping on item name would print sixteen one-product rows where the map asked for seven shelves.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Densest first is descending — the map leads with the heaviest mover. Ascending would open on Fitness's 27 units and let the volume story start at the bottom of the register.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "p.name", "p.supplier_id", "ASC"],
    walkthrough:
      "The volume map is the quantities summed per shelf and ranked: Accessories 121 units, Audio 97, Electronics 85, Video 61, Apparel 54, Wearables 53, Fitness 27. Now put the value picture beside it and the hole in the ladder appears: Accessories moves the most units on the file but has billed only 3,294.29 lifetime — roughly 27 per unit — while Audio moves 97 units and bills 11,744.01, about 121 per unit. The desk-mat-and-cable shelf is four to five times cheaper per unit than the premium audio shelf, and it out-moves it by two dozen units. That is the slide the repricing meeting opens with: volume lives on the cheap shelf, value lives on the expensive one, and the middle of the ladder is where the pricing work actually is. One column change — charging price instead of counting units — would have redrawn the map into the value ranking and buried the hole completely.",
  },
  {
    id: "cs-504",
    tier: "easy",
    topic: "l15",
    universe: "inventory",
    title: "Units out the door, by vendor",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: replenishment rhythm.\n\nThe count plan wants the flow picture: how many units of each vendor's goods have moved off the floor, heaviest pipeline first, so the crew knows which vendor bins get the tightest count tolerances this cycle. Movement is units out the door, not money — the desk thinks in cartons, not dollars, and the plan should read the same way.",
    ask: "Each vendor with the total units of their goods purchased, heaviest pipeline first.",
    template: `SELECT s.name, {1} AS units
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {2} = {3}
GROUP BY s.name
ORDER BY units DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units moved",
        why: "The desk counts cartons, so the figure is the summed quantities per vendor. A line-count would report transactions instead of flow, and the tolerance list would privilege chatty small orders over real movement.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Goods reach their vendor through the catalog's supplier_id pointer — that is the hop that turns item flow into vendor flow. The vendor file has no supplier_id column of its own, so reversing the spelling errors before the list prints.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column, where vendor rows are numbered. Pointing it at the rating column would compare vendor numbers against scorecards and move zero units.",
      },
    ],
    distractors: ["COUNT(*)", "s.supplier_id", "s.rating", "s.region"],
    walkthrough:
      "The flow list is the summed quantities per vendor, heaviest first: Midwest 109 units, Shenzhen 99, Nordic 82, Pacific 80, Alpine 77, Andes 51. Set it beside the money and the rhythm splits in two: Nordic's bins bill the most on the file — 11,130.25 — while moving only 82 units, and Shenzhen is the mirror image, 99 units for just 3,049.07. Midwest is the desk's real workload: the heaviest pipeline and the second-biggest bill at 9,294.93, so Midwest bins get the tightest tolerances and the most frequent cycle. Alpine and Andes sit at the quiet end — 77 and 51 units — and their shelves keep loose tolerances for another cycle. The crew plan now matches the register instead of the org rumor: the vendor with the deepest floor presence is Midwest, not the one whose invoices are biggest.",
  },
  {
    id: "cs-505",
    tier: "easy",
    topic: "l15",
    universe: "funnel",
    title: "Where the delivered money sits",
    brief:
      "From: Growth marketing lead. Re: campaign seeding, category proof.\n\nThe next campaign seeds from shelves with a proven completion record, and proven means delivered — money that actually landed. Split the delivered book by shelf at line grain, biggest first. If the shelf we keep calling the flagship leads the delivered book too, the seeding plan writes itself; if it does not, I want that on paper before the media buy, not after.",
    ask: "Each product category with its delivered line-charged revenue, biggest first.",
    template: `SELECT p.category, ROUND({1}, 2) AS delivered_value
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
WHERE o.status = {2}
GROUP BY {3}
ORDER BY delivered_value {4};`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line-charged value",
        why: "Delivered money is charged line by line — quantity times sold price. Summing booking totals across the pairing bills each delivered booking once per line and prints a completed book that never existed.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "Proven means the quoted text 'delivered' — money that landed. 'shipped' would count the departure board as proof and seed the campaign on parcels still in the air.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the shelf column",
        why: "The seeding plan thinks in shelves, so the buckets are the catalog's category column. Grouping on item name would hand the plan sixteen rows and no shelf-level story.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first puts the flagship question to rest in row one. Ascending would open on Fitness's 326.39 and let the proof-of-demand slide start in the discount bin.",
      },
    ],
    distractors: ["SUM(o.total)", "'shipped'", "p.name", "ASC"],
    walkthrough:
      "The proof is the delivered book bucketed by shelf: Audio 6,337.80 on 27 delivered lines, Video 2,615.83, Electronics 2,247.24, Wearables 1,639.24, Accessories 1,283.96, Apparel 1,120.61, Fitness 326.39 — 15,571.07 in total, the completed base of the whole file. The flagship call survives contact with the record: Audio holds about forty cents of every delivered dollar, and its lifetime lead — 11,744.01 across all statuses — is not an artifact of unshipped promises. The seeding plan gets one more nuance for free: Video's 2,615.83 delivered beats its quiet reputation, putting the webcam shelf second in proven demand, while Fitness's 326.39 confirms it as a rounding error on the media plan. Seeding follows the delivered column, not the lifetime one — and on the delivered column, the plan writes itself exactly the way the room expected.",
  },
  {
    id: "cs-506",
    tier: "easy",
    topic: "l15",
    universe: "supplier",
    title: "The vendor revenue ledger",
    brief:
      "From: Supply-chain lead. Re: QBR pack, the vendor ranking.\n\nThe QBR's opening page ranks the vendor bench by what their goods have actually billed at line grain — quantity times sold price, summed per vendor, biggest first. The ranking has to come off the sale lines rather than anyone's memory of the bench, because this page sets the tone for every vendor conversation that follows it in the pack.",
    ask: "Each vendor with their lifetime line-charged revenue, biggest first.",
    template: `SELECT s.name, ROUND({1}, 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {2} = {3}
GROUP BY s.name
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line-charged revenue",
        why: "Vendor revenue is the value of goods sold, charged per line. Summing booking totals across the pairing re-bills each booking once per line — the Midwest page would print 25,712.57 instead of the true 9,294.93.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Items reach their maker through the catalog's supplier_id — the hop that turns item sales into vendor revenue. Matching vendor numbers against item ids would fabricate the bench and the page would rank six fake vendors.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Vendors carry no supplier_id of their own, so that guess errors before the ranking exists.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The pack leads with the money, so the ranking is descending. Ascending would open the QBR on Pacific's 2,980.15 and let the 11,130.25 headline arrive last, if at all.",
      },
    ],
    distractors: ["SUM(o.total)", "SUM(oi.quantity)", "s.supplier_id", "s.region", "ASC"],
    walkthrough:
      "The bench ranked by billed value: Nordic Gadgets AB 11,130.25 on 43 lines, Midwest Hardware Co 9,294.93 on 56, Alpine Audio GmbH 4,765.63 on 40, Andes Naturals SA 3,613.25 on 25, Shenzhen Electro 3,049.07 on 47, Pacific Textiles 2,980.15 on 40 — six vendors, 34,833.28 in total. The tension the page should name: Nordic out-bills Midwest by 1,835.32 while carrying thirteen fewer lines, so the top of the bench is value density, not flow. The trap this page exists to avoid is the booking-total shortcut: sum booking totals across the line pairing and Midwest prints 25,712.57, Nordic 22,287.88 — the ranking flips at the top and Shenzhen jumps from fifth to third on pure photocopying. Line grain keeps the QBR's opening page tied to goods that actually sold, which is the only version of the ranking a vendor can't argue with.",
  },
  {
    id: "cs-507",
    tier: "medium",
    topic: "l15",
    universe: "expense",
    title: "Shelves pulling real weight",
    brief:
      "From: Ops finance, spend review. Re: the materiality page.\n\nThe spend review's materiality page carries only the shelves whose billed value clears five thousand — under that line, a shelf is a footnote, not a line item. Pull the qualifying shelves with their line-billed figures, biggest first, so the page opens on the weight and the footnotes stay in the appendix where they belong.",
    ask: "Product categories whose lifetime line-charged revenue exceeds 5000, biggest first.",
    template: `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.category
{1} ROUND(SUM(oi.quantity * oi.unit_price), 2) > {2}
ORDER BY revenue {3};`,
    slots: [
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket gate",
        why: "The five-thousand test runs against a per-shelf sum that only exists after grouping, so the gate is HAVING. WHERE fires before the buckets exist and rejects the query outright — the page would error, not shrink.",
      },
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the materiality line",
        why: "The review's own bar is 5000 — a threshold that lives in the gate and never prints as a cell. At 4000 the page grows to four shelves and dilutes; at 6000 it drops Video and stops matching the review's definition.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The page opens on the weight, so descending. Ascending would lead the materiality page with Video's 5,198.41 and make the 11,744.01 shelf look like the afterthought.",
      },
    ],
    distractors: ["WHERE", "ORDER BY", "6000", "4000", "ASC"],
    walkthrough:
      "The materiality page is a per-shelf sum behind a bucket gate: shelves billed above 5,000, ranked biggest first. Three shelves clear the line: Audio 11,744.01, Wearables 6,929.12 and Video 5,198.41 — and together they hold 23,871.54 of the book's 34,833.28, over two dollars in every three. The boundary story is Electronics: 4,818.61 of real business, 181 short of the line, filed as a footnote by policy rather than by weakness. That is exactly the discipline the gate buys — at 4,000 the page grows to four shelves and starts reading like the full ledger; at 6,000 Video falls off and the page stops matching the review's own definition of material. The gate clause is the whole build: it tests a sum that only exists after grouping, which is why the filter lives where buckets exist and nowhere earlier.",
  },
  {
    id: "cs-508",
    tier: "medium",
    topic: "l15",
    universe: "growth",
    title: "The in-flight mix on the board slide",
    brief:
      "From: Chief of Staff. Re: board deck, the in-flight slide.\n\nThe deck's in-flight slide shows where the shipping queue's value sits, shelf by shelf, at line grain. The lifetime numbers tell one story about our shelves; the in-flight mix may tell another, and the slide should show what is actually moving this week — not what the backlog legend says is moving.",
    ask: "Each product category with its shipped line-charged value, biggest first.",
    template: `SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS in_flight_value
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON oi.product_id = p.id
WHERE o.status = {3}
GROUP BY p.category
ORDER BY in_flight_value {4};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines reach the shipping queue through order_id — the hop that lets a status filter on the booking side reach the line's value. The line's own id would match line numbers against booking numbers and scramble the mix.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the booking ledger's id column. Bookings have no order_id of their own, so that guess breaks the chain before the slide has a single figure.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-flight status",
        why: "In-flight means the quoted text 'shipped' — out the door, not yet landed. 'delivered' would rebuild the slide from the completed book and the deck would present last quarter as this week's pipeline.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Biggest first lets the slide lead with whatever actually dominates the queue. Ascending would open on Fitness's 279.96 and bury the real in-flight story under the tail.",
      },
    ],
    distractors: ["oi.id", "o.customer_id", "'delivered'", "ASC"],
    walkthrough:
      "The in-flight slide is the shipping queue bucketed by shelf: Wearables 4,070.06, Audio 2,348.84, Video 1,818.31, Electronics 1,449.79, Accessories 1,290.56, Apparel 739.20, Fitness 279.96 — 11,996.72 moving across 84 lines. The story is the flip at the top: lifetime, Audio leads every shelf at 11,744.01, but the queue right now is a third Wearables, driven by the premium watch's departure run, while Audio coasts at less than half that. So the board sees two honest sentences: the value shelf is Audio, and the departure board is Wearables — and the second one is the slide, because the deck is about what moves this week, not what moved last quarter. The two-hop chain is what makes the slide possible: the status lives on the booking, the value lives on the line, and order_id is the only thread between them.",
  },
  {
    id: "cs-509",
    tier: "medium",
    topic: "l15",
    universe: "fraud",
    title: "Order flow concentration, vendor side",
    brief:
      "From: Risk team, spot-check rotation. Re: vendor flow screen.\n\nThe rotation screens for concentration on the vendor side this cycle: vendors whose goods move at least forty sale lines get a flow review, and the quiet ones get filed without one. Pull the qualifying vendors with their line counts and line-billed value, busiest line count first. Forty is the screen's own bar, not a guess — keep it exact, because the review list has to match the policy memo line for line.",
    ask: "Vendors with at least 40 sale lines, with line count and line-charged revenue, busiest first.",
    template: `SELECT s.name, COUNT(*) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON p.supplier_id = s.id
GROUP BY s.name
{1} COUNT(*) >= {2}
ORDER BY lines {3};`,
    slots: [
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the screen's gate",
        why: "The forty-line test runs against a per-vendor count that only exists after grouping, so the gate is HAVING. WHERE fires before any bucket exists and rejects the query — the screen would error instead of shortlisting.",
      },
      {
        answer: "40",
        kind: "number",
        label: "the screen's bar",
        why: "The policy bar is 40, and it prints on the page twice — Pacific and Alpine both sit exactly on it, kept by the at-or-above rule. A bar of 45 would cut the list to two vendors and the review would skip four files the memo says to pull.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Busiest first sequences the review the way the rotation works it. Ascending would start the flow review on Alpine's 40 lines while Midwest's 56 wait at the bottom of the list.",
      },
    ],
    distractors: ["WHERE", "ORDER BY", "45", "25", "ASC"],
    walkthrough:
      "The flow screen is a per-vendor count behind a bucket gate at 40: five of the six vendors clear it — Midwest 56 lines, Shenzhen 47, Nordic 43, Pacific 40 and Alpine 40 — while Andes files without review at 25. The bar's edge is the finding: Pacific and Alpine both sit exactly on 40, so the at-or-above rule is load-bearing — a strict over-40 would have filed them both as quiet and cut the review list to three. Their billed value separates the two anyway: Alpine's 40 lines carry 4,765.63 of premium audio while Pacific's 40 carry 2,980.15, so the review sees the same flow at very different value. Raise the bar to 45 and only Midwest and Shenzhen survive; drop it to 25 and every vendor floods the list, including the one the screen exists to exclude. Forty, exactly, is the memo — and the page proves it twice.",
  },
  {
    id: "cs-510",
    tier: "medium",
    topic: "l15",
    universe: "catalog",
    title: "Shelf cards, weight and movement",
    brief:
      "From: Catalog content manager. Re: shelf cards, the rewrite.\n\nThe shelf cards are being rewritten and each one needs two figures side by side: the value the shelf has billed at line grain and the units it has actually moved. A card that quotes value without movement flatters quiet premium shelves; a card that quotes movement without value buries them. Both columns on every card, ranked by billed value, so the cards argue weight and flow together instead of picking a side.",
    ask: "Each product category with line-charged revenue and total units, biggest revenue first.",
    template: `SELECT p.category, ROUND({1}, 2) AS revenue, {2} AS units
FROM order_items oi
JOIN products p ON oi.product_id = p.id
GROUP BY p.category
ORDER BY revenue {3};`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the billed value",
        why: "Value on the card means every line charged at quantity times its own selling price. A unit count in this column would print 97 where the shelf billed 11,744.01 and the card would understate its own shelf a hundredfold.",
      },
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units moved",
        why: "Movement means the quantities summed per shelf. A line count here would report 62 transactions where Accessories actually moved 121 units — flow understated by half on the busiest shelf.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The cards rank by billed value, biggest first, so money leads the page. Ascending would file Audio's 11,744.01 at the bottom and open the binder on Fitness's 863.91.",
      },
    ],
    distractors: ["SUM(o.total)", "COUNT(*)", "p.name", "ASC"],
    walkthrough:
      "The rewritten cards carry both vital signs on one row: Audio 11,744.01 billed on 97 units, Wearables 6,929.12 on 53, Video 5,198.41 on 61, Electronics 4,818.61 on 85, Accessories 3,294.29 on 121, Apparel 1,984.93 on 54, Fitness 863.91 on 27. Read the two columns against each other and the inversion jumps out: Accessories is the busiest shelf on the file — 121 units — and the poorest earner among the big four, while Audio out-bills it better than three to one on fewer units. Wearables is the stealth line: 53 units at 6,929.12 is roughly 130 per unit, the steepest value per movement on the page. The card rewrite exists to force exactly this reading — a single-figure card would have crowned one shelf and hidden the trade. Weight and flow, side by side, ranked by the money: the cards now argue the shelf story the same way the merchandising meeting does.",
  },
  {
    id: "cs-511",
    tier: "medium",
    topic: "l15",
    universe: "month-close",
    title: "The open book, sorted by shelf",
    brief:
      "From: Controller. Re: month-end close, the open book.\n\nThe close's open book is the pending line value, and I want it split by shelf before I sign the receivables note: which shelves carry the open money, biggest first. One shelf's absence will be as loud as another's presence — if a whole shelf has nothing open at all, the note should say so rather than let the auditors discover it in the sample.",
    ask: "Each product category with its pending line-charged value, biggest first.",
    template: `SELECT p.category, ROUND({1}, 2) AS open_value
FROM order_items oi
JOIN orders o ON {2} = {3}
JOIN products p ON oi.product_id = p.id
WHERE o.status = {4}
GROUP BY p.category
ORDER BY open_value DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the open value",
        why: "Open money is the goods still awaiting fulfillment, charged line by line. Summing booking totals across the pairing re-bills every pending booking once per line and would nearly triple the open book on the page.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines reach their booking through order_id, which is how a status filter on the booking side reaches the line's value. The line's own id against booking numbers would read an open book nobody owes.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the booking ledger's id column. Bookings carry no order_id of their own, so that spelling breaks the chain before the note has figures.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "The open book is the quoted text 'pending', lowercase and exact. 'Pending' capitalized matches nothing and the receivables note would sign off on an empty book.",
      },
    ],
    distractors: ["SUM(o.total)", "o.customer_id", "'Pending'", "'shipped'"],
    walkthrough:
      "The open book by shelf: Audio 2,667.59 on 8 pending lines, Wearables 1,219.82 on 5, Video 764.27, Electronics 738.82, Accessories 596.22, Fitness 126.28 — 6,113.00 in total across 36 lines, reconciling to the receivables figure the close already carries. The headline is concentration: Audio holds about forty-four cents of every open dollar, so the fulfillment chase list is really an audio chase list. And the absence is the note's second paragraph: Apparel appears nowhere — not one pending apparel line — so the shelf's 1,984.93 of lifetime billing is entirely settled or already written off. The receivables note now says both things on the record: where the open money sits, and which shelf the auditors will not find in the pending sample. Charging each line once is what keeps the total at 6,113.00; the booking-total version of this table prints nearly three times that and reconciles to nothing.",
  },
  {
    id: "cs-512",
    tier: "hard",
    topic: "l15",
    universe: "refund-audit",
    title: "Which vendors wear the cancellations",
    brief:
      "From: refunds@ — vendor liaison review. Re: the cancellation bill by maker.\n\nGoodwill gets charged back to vendor programs when a cancellation traces to the goods, so the review needs the cancellation pool split by the vendor behind each dead line: line-charged value per vendor, biggest first. If two makers never appear at all, put that on the record too — a provably clean vendor is as useful to the program as an expensive one.",
    ask: "Each vendor with the line-charged value sitting on cancelled bookings, biggest first.",
    template: `SELECT s.name, ROUND({1}, 2) AS refund_pool
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {2} = {3}
WHERE o.status = {4}
GROUP BY s.name
ORDER BY refund_pool DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line-charged pool",
        why: "The chargeback pool is the dead goods' value, charged per line. Booking totals summed across the pairing would re-bill each cancelled booking once per line and charge vendors for cancellations that never happened.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Dead lines trace to their maker through the catalog's supplier_id — the hop that turns the pool into a vendor bill. The vendor file has no supplier_id column of its own, so reversing the hop errors before the bill exists.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Pointing it at the region column would match vendor numbers against text and bill nobody for anything.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The bill covers the quoted text 'cancelled' — dead tickets only. 'Cancelled' capitalized matches nothing and the vendor liaison would report a clean cycle that never happened.",
      },
    ],
    distractors: ["SUM(o.total)", "s.supplier_id", "'Cancelled'", "p.category", "s.region"],
    walkthrough:
      "The vendor bill is the dead-line pool traced to makers: Pacific Textiles 431.99 on 4 cancelled lines, Midwest Hardware Co 358.76 on 4, Alpine Audio GmbH 271.39 on 3, Nordic Gadgets AB 90.35 on 1 — four vendors, twelve dead lines, 1,152.49 in total. The review's quiet finding sits in the missing rows: Andes Naturals and Shenzhen Electro never appear, because not one cancelled line came off either maker's goods all cycle. So the chargeback conversation involves four programs, and the vendor scorecards get two clean marks — including Shenzhen, whose 47 active lines make its zero-cancellation record the best volume-to-complaints ratio on the bench. The three-hop chain is what makes the bill defensible: status from the booking, goods from the line, maker from the catalog, each hop on its own key. One wrong key anywhere and the chargebacks land on vendors who shipped nothing that died.",
  },
  {
    id: "cs-513",
    tier: "hard",
    topic: "l15",
    universe: "pricing",
    title: "Vendors above the repricing line",
    brief:
      "From: Head of Product. Re: pricing reset, the vendor shortlist.\n\nThe reset negotiates price moves vendor by vendor, but only with vendors whose billed value clears four thousand — under that, a move costs more in relationship than it returns. Pull the qualifying vendors with their line-billed figures, biggest first. The bar is the reset's own line, so the shortlist has to be exactly who clears it — no vendor argued in, none left out.",
    ask: "Vendors whose lifetime line-charged revenue exceeds 4000, with the figures, biggest first.",
    template: `SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON p.supplier_id = s.id
GROUP BY s.name
{1} {2} > {3}
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the shortlist gate",
        why: "The four-thousand test runs against a per-vendor sum that only exists after grouping, so the gate is HAVING. WHERE fires before any bucket exists and the shortlist errors out before it shortlists anything.",
      },
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the tested sum",
        why: "The bar tests billed value — quantity times sold price per vendor. Testing a unit count against 4,000 would pass every vendor on the bench and the shortlist would be the whole bench, which is no shortlist.",
      },
      {
        answer: "4000",
        kind: "number",
        noVerify: true,
        label: "the repricing line",
        why: "The reset's own bar is 4000 — a threshold that lives in the gate and never prints as a cell. At 5000 Alpine drops and the reset negotiates with two vendors; at 3000 it grows to five and negotiates with a market.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The shortlist leads with the biggest conversation, so descending. Ascending would open the reset on Alpine's 4,765.63 and let the 11,130.25 headline arrive as a footnote.",
      },
    ],
    distractors: ["WHERE", "SUM(oi.quantity)", "COUNT(*)", "5000", "ASC"],
    walkthrough:
      "The shortlist is a per-vendor sum behind a bucket gate at 4,000: three vendors clear it — Nordic Gadgets AB 11,130.25, Midwest Hardware Co 9,294.93, Alpine Audio GmbH 4,765.63. The boundary row is the meeting's swing vote: Andes Naturals misses at 3,613.25, fewer than 400 under the line, so a one-notch friendlier bar would have put a fourth chair at the table. Shenzhen 3,049.07 and Pacific 2,980.15 sit clearly below and file. The gate is what keeps the reset honest: at 5,000 Alpine drops and the reset negotiates with two vendors; at 3,000 the shortlist becomes the whole bench minus nobody that matters. And the tested column matters as much as the bar — testing units instead of billed value passes every vendor, because even the quietest bench member moves 51 units. Three names, one line each, every figure a sum of goods actually sold.",
  },
  {
    id: "cs-514",
    tier: "hard",
    topic: "l15",
    universe: "inventory",
    title: "The eighty-unit pipeline bar",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: the tight-tolerance list.\n\nBins move to tight count tolerances once a vendor's flow crosses eighty units moved, and this quarter's list has to be rebuilt from the register, not from last quarter's page. Vendors at or above the bar, with their unit totals, heaviest first. One vendor is expected to miss the cut by a handful of units — the exact figure matters, because an appeal starts with the number.",
    ask: "Vendors whose purchased units total at least 80, with unit counts, heaviest first.",
    template: `SELECT s.name, SUM(oi.quantity) AS units
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON p.supplier_id = s.id
GROUP BY {1}
HAVING {2} >= {3}
ORDER BY units DESC;`,
    slots: [
      {
        answer: "s.name",
        kind: "keyword",
        label: "the vendor column",
        why: "One bucket per maker means grouping on the vendor file's name column. Grouping on the vendor's region would fold six makers into four geographies and put the wrong vendor's units on the tolerance list.",
      },
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the flow sum",
        why: "The bar tests movement — quantities summed per vendor. Testing a line count would report 40 transactions where Pacific moved 80 units and the tolerance list would miss exactly the bins it exists to watch.",
      },
      {
        answer: "80",
        kind: "number",
        label: "the tolerance bar",
        why: "The desk's bar is 80, and it prints on the page — Pacific sits exactly on it, kept by the at-or-above rule. At 100 only Midwest survives the list; at 75 Alpine joins it and the tight-tolerance crew takes on a bin that missed the bar by three.",
      },
    ],
    distractors: ["s.region", "p.category", "COUNT(*)", "100", "75"],
    walkthrough:
      "The tight-tolerance list rebuilt from the register: Midwest Hardware Co 109 units, Shenzhen Electro 99, Nordic Gadgets AB 82, Pacific Textiles 80 — four makers at or above the bar. The boundary is the whole story: Pacific sits exactly on 80, kept by the inclusive rule, while Alpine Audio misses at 77 — three units short of a tighter count cycle, which is precisely the figure its appeal file opens with. Andes Naturals files at 51 without controversy. The desk should note what the bar does at the edges: at 100 the list collapses to Midwest alone and the tolerance program loses its purpose; at 75 Alpine's premium-audio bins join the tight list over three units of flow. Grouping by vendor name keeps every maker its own bucket — fold by region instead and the page shrinks to four geographies, with Alpine's 77 units quietly hidden inside a number that belongs to somebody else.",
  },
  {
    id: "cs-515",
    tier: "hard",
    topic: "l15",
    universe: "funnel",
    title: "Completed business, vendor by vendor",
    brief:
      "From: Growth marketing lead. Re: partner spotlight, completed business.\n\nThe partner spotlight page leads with the three vendors whose goods sit in the most completed bookings — delivered line value, biggest first. Lifetime numbers flatter the bench's biggest name, but completed business is what we can feature honestly. Three rows on the page, and the cut has to be the real three, because the fourth vendor will read the page.",
    ask: "The 3 vendors with the highest delivered line-charged revenue, biggest first.",
    template: `SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS completed_value
FROM order_items oi
JOIN orders o ON {1} = {2}
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON p.supplier_id = s.id
WHERE o.status = {3}
GROUP BY s.name
ORDER BY completed_value DESC
LIMIT {4};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines reach their booking through order_id — the hop that lets the delivered filter on the booking side reach the line's value. The line's own id against booking numbers would spotlight vendors for sales that never happened.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the booking's own number",
        why: "The pointer lands on the booking ledger's id column. Bookings carry no order_id of their own, so that guess breaks the four-file chain before the page has rows.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the completed status",
        why: "The feature is built on the quoted text 'delivered' — money that landed. 'shipped' would spotlight vendors on parcels still in the air and the page would name a leader the completed book doesn't have.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the spotlight size",
        why: "The page carries exactly three vendors, so the cut is 3. At 5 the page stops being a spotlight; at 2 it loses the third row that proves the top two earned their places.",
      },
    ],
    distractors: ["oi.id", "o.customer_id", "'shipped'", "5"],
    walkthrough:
      "The spotlight is the delivered book traced to makers and cut at three: Midwest Hardware Co 3,732.71 on 22 delivered lines edges Nordic Gadgets AB 3,711.42 on 18 by 21.29 for the top of the page, with Alpine Audio GmbH 3,013.61 third. That ordering is a genuine reversal: lifetime, Nordic leads the whole bench at 11,130.25 — but a large share of that rides the shipping queue, while Midwest's flow-heavy catalog (headsets, stands, mats) has quietly landed more of its value. The page should say so plainly: featured on completed business, the bench's biggest name is the bench's number two. The cut stays honest at three — Andes Naturals is fourth at 1,810.57, a full 1,200 behind the podium, so the boundary is a chasm, not a coin flip. Four hops, one status gate, three rows: the spotlight features people for what actually arrived.",
  },
  {
    id: "cs-516",
    tier: "hard",
    topic: "l15",
    universe: "supplier",
    title: "One row per vendor for the QBR",
    brief:
      "From: Supply-chain lead. Re: QBR pack, the vendor one-pager.\n\nThe QBR's vendor one-pager needs all three vital signs on a single row per maker: sale lines carried, units moved, and line-billed value — ranked by value so the money leads the page. Two vendors will trade the top line depending on which column you read, and the page should show that tension openly instead of hiding it behind a single headline figure.",
    ask: "Each vendor with sale-line count, total units and line-charged revenue, biggest revenue first.",
    template: `SELECT s.name, COUNT(*) AS lines, SUM(oi.quantity) AS units, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {1} = {2}
GROUP BY {3}
ORDER BY revenue {4};`,
    slots: [
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Items reach their maker through the catalog's supplier_id — the hop that lets one row carry a vendor's lines, units and value. The vendor file has no supplier_id column of its own, so the reversed spelling errors before the page exists.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Pointing it at the rating column would pair vendor numbers with scorecards and print a one-pager of empty rows.",
      },
      {
        answer: "s.name",
        kind: "keyword",
        label: "the vendor column",
        why: "One row per maker means grouping on the vendor file's name column. Grouping on item name would explode the page to sixteen product rows; grouping by region would fold six makers into four geographies.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The money leads the page, so revenue ranks descending. Ascending would file Nordic's 11,130.25 last and open the QBR with the bench's smallest vendor.",
      },
    ],
    distractors: ["s.supplier_id", "p.name", "s.region", "p.category", "ASC"],
    walkthrough:
      "The one-pager, three vital signs per maker, money first: Nordic Gadgets AB 43 lines, 82 units, 11,130.25; Midwest Hardware Co 56 lines, 109 units, 9,294.93; Alpine Audio GmbH 40/77/4,765.63; Andes Naturals SA 25/51/3,613.25; Shenzhen Electro 47/99/3,049.07; Pacific Textiles 40/80/2,980.15. The tension the page exists to show: Midwest carries thirteen more lines and twenty-seven more units than Nordic yet bills 1,835.32 less — flow against value, in one row each. Shenzhen is the flow bargain, 99 units for 3,049.07, while Wearables-heavy Nordic bills 135 per unit moved. Andes sits last on every column and the page says so without commentary. One hop — supplier_id to the vendor file's id — turns three separate item-file counts into a single row per maker, which is the difference between a QBR page and three contradictory spreadsheets.",
  },
  {
    id: "cs-517",
    tier: "hard",
    topic: "l15",
    universe: "expense",
    title: "Open money on the vendor side",
    brief:
      "From: Ops finance, spend review. Re: the open bill before the cut.\n\nBefore the trim list goes out, the review needs the open bill by maker: line-charged value still sitting in pending, per vendor, biggest first. This is the money a trim would actually touch, so the figures have to be charged per line — the ticket-total version of this table has burned us before, printing nearly three times the truth on exactly the same rows.",
    ask: "Each vendor with pending line-charged value, biggest first.",
    template: `SELECT s.name, ROUND({1}, 2) AS open_value
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
JOIN suppliers s ON {2} = {3}
WHERE o.status = {4}
GROUP BY s.name
ORDER BY open_value DESC;`,
    slots: [
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the open bill",
        why: "The open bill charges each pending line once, at its own quantity and price. Summing booking totals across the pairing re-bills every pending booking once per line — Midwest's page would print 7,079.68 instead of the true 2,458.54.",
      },
      {
        answer: "p.supplier_id",
        kind: "keyword",
        label: "the catalog's vendor pointer",
        why: "Pending goods trace to their maker through the catalog's supplier_id — the hop that turns open lines into a vendor bill. Reversing the hop to the vendor file's own spelling errors before the trim list has a number.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The pointer lands on the vendor file's id column. Pointing it at the region column would match vendor numbers against text and put the entire open bill on nobody.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open status",
        why: "Trim-touchable means the quoted text 'pending' — goods not yet out the door. 'shipped' would count in-flight parcels as open money and the trim list would cut against stock we cannot return.",
      },
    ],
    distractors: ["SUM(o.total)", "s.supplier_id", "'shipped'", "s.region"],
    walkthrough:
      "The open bill by maker: Midwest Hardware Co 2,458.54 on 12 pending lines, Nordic Gadgets AB 1,813.03 on 7, Alpine Audio GmbH 795.12, Andes Naturals SA 636.80, Shenzhen Electro 273.08, Pacific Textiles 136.43 — 6,113.00 in total, and the six figures reassemble it to the cent. The trim conversation starts where the honest money sits: Midwest and Nordic together hold 4,271.57 of the open bill, about seven dollars in every ten. And the warning in the brief is now a number on the record: the ticket-total version of this same table prints Midwest at 7,079.68 and Nordic at 4,430.00 — nearly triple — because each pending booking re-bills itself once per line. Line grain is what keeps a trim list tied to goods that can actually be stopped at the dock; the inflated twin trims against money that exists only as photocopies.",
  },
];
