// Case batch M2-L16b — topic l16 (Fan-out & grain), ids cs-551…cs-566.
// Count-flavored fan-out discipline: two-count reconciliations (COUNT(*) vs
// COUNT(DISTINCT ...)), basket-size buckets, MAX's fan-out immunity, and the
// WHERE-doesn't-uncopy lesson. Every figure is audited against the live seed
// db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L16b: CaseStudy[] = [
  {
    id: "cs-551",
    tier: "easy",
    topic: "l16",
    universe: "month-close",
    title: "The pair report that counts twice",
    brief:
      "From: Controller. Re: month-end close, the paired-line dispute.\n\nThe close binder's line-item schedule and the booking ledger will not agree in the hallway: the paired ticket-lines report prints 251 rows, the ledger says 103 tickets, and someone re-counts both every cycle. I want the two figures on one row, produced the same way from the same pairing, so the schedule can carry a footnote instead of an argument.",
    ask: "The raw paired-line count and the true ticket count, side by side on one row.",
    template: `SELECT {2} AS raw_lines, {3} AS real_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines travel on tickets through order_id, and that pointer is what stacks each ticket into the pairing once per line. The line's own id would pair line numbers against ticket numbers and produce a pile whose two counts reconcile to nothing.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw paired-line count",
        why: "The raw count is every row the pairing produced — 251 lines, with multi-line tickets repeated once per line. Counting distinct tickets in this slot would print the ledger's 103 in the lines column and the schedule would lose the very repetition the footnote exists to explain.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids see through the repetition: 103 real bookings where the raw pairing shows 251 rows. A plain count of any column rides the copies, agrees with the lines column, and the two figures can never be compared again.",
      },
    ],
    distractors: ["oi.id", "o.customer_id", "COUNT(DISTINCT o.customer_id)", "MAX(o.total)"],
    walkthrough:
      "The dispute ends the moment both counts come off the same pairing: 251 raw lines beside 103 real tickets. Nothing is wrong with either number — the pairing simply repeats each ticket once per line, and 251 lines spread over 103 tickets is about 2.4 lines per booking. The reconciliation footnote writes itself from that pair: the line schedule was never wrong, it was answering a question about a different grain. Push one question further and the whole shape appears — no ticket carries more than four lines, so the worst-case ticket was billed four times in the paired report. And the count pair is exactly the discipline the close needs: whenever a paired report meets a ledger, both figures go on the page, because the gap between them is the size of the photocopying.",
  },
  {
    id: "cs-552",
    tier: "easy",
    topic: "l16",
    universe: "refund-audit",
    title: "Seven dead tickets, twelve lines of paper",
    brief:
      "From: refunds@ — internal ticket #4512. Re: goodwill ledger wrap-up.\n\nThe cancellation queue closes this week and the sign-off note keeps quoting two numbers as if they were one: the dead tickets and the line items printed on them. I want both on a single row — the queue's raw line count beside the actual ticket count — so the note can say exactly how much paper died with those cancelled bookings and how many tickets it really was.",
    ask: "The raw line count and the real ticket count for every cancelled booking, side by side.",
    template: `SELECT {2} AS raw_lines, {3} AS dead_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id
WHERE o.status = {4};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines attach to tickets through order_id, so the status filter on the ticket reaches the line only through that pointer. The line's own id would pair line numbers with ticket numbers and produce a queue count nobody filed.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired row in the queue — cancelled tickets repeated once per line, which is the paper footprint the goodwill note quotes. A distinct count here would shrink the queue to ticket level and the paper trail would be understated.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids collapse the copies: the queue is seven real bookings, not twelve. A plain count of any column would count the copies and the note would claim more dead tickets than the ledger ever issued.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the queue's status",
        why: "The queue is defined by the exact text 'cancelled' — lowercase and quoted. 'Delivered' capitalized matches nothing and the note would sign off on an empty queue, while 'pending' would count tickets that can still ship.",
      },
    ],
    distractors: ["oi.id", "p.id", "'pending'", "'Delivered'", "COUNT(DISTINCT o.customer_id)"],
    walkthrough:
      "The queue's two honest numbers: 12 paired lines, 7 real tickets. Four accounts own the whole queue — Alice Chen's three dead tickets carried five lines, Keiko Sato's single 397.99 cancellation was a four-line basket, Maya Patel's two small cancellations one line each, and Emma Wilson's one. So the paper footprint is nearly double the ticket count, and the goodwill note should say both: seven tickets, twelve lines. The capitalization trap is worth a line in the wrap-up thread — 'Delivered' with a capital D returns an empty queue, and a sign-off on nothing looks identical to a clean week. This is also the smallest possible rehearsal of the fan-out lesson: filter the pile and the copies stay copies; only the distinct count tells you how many tickets you actually killed.",
  },
  {
    id: "cs-553",
    tier: "easy",
    topic: "l16",
    universe: "pricing",
    title: "Sixty-two lines, fifty-four trips",
    brief:
      "From: Head of Product. Re: pricing review, attach-rate story.\n\nThe accessories shelf is the attach-rate story of the catalog and I want its real shape before the review: how many purchase lines the shelf has rung, and how many distinct shopping trips those lines actually came on. If the two numbers diverge, the shelf is riding repeat purchases inside single baskets, and the review should hear that as a strength rather than discover it as a surprise.",
    ask: "The raw line count and the distinct ticket count behind the Accessories shelf, side by side.",
    template: `SELECT {3} AS raw_lines, COUNT(DISTINCT oi.order_id) AS real_tickets
FROM order_items oi
JOIN products p ON {1} = {2}
WHERE p.category = {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Lines name their item through product_id — the hop that lets a shelf filter on the catalog reach the purchase lines. The line's own id would match line numbers against item numbers and build the shelf out of whatever rows share numbers.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id column of its own, so that spelling errors before the shelf exists — and the attach-rate story never gets told.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired row on the shelf — 62 accessory lines, baskets counted once per line. Distinct tickets in this slot would print 54 twice and the review would lose the divergence it is supposed to discuss.",
      },
      {
        answer: "'Accessories'",
        kind: "keyword",
        label: "the shelf label",
        why: "The shelf is the quoted text 'Accessories', exact and case-sensitive. 'Audio' would count a different shelf's lines entirely and the attach-rate story would be built on the wrong register.",
      },
    ],
    distractors: ["o.id", "p.product_id", "'Audio'", "'Video'", "COUNT(DISTINCT p.id)"],
    walkthrough:
      "The shelf's two numbers: 62 purchase lines riding 54 distinct tickets — the widest gap on the catalog, eight trips that bought accessories more than once. That is the attach-rate story in its purest form: desk mats, laptop stands and HDMI cables travel in pairs inside single baskets. For contrast, the audio shelf splits 51 lines over 46 tickets and the video shelf 32 over 30, while Fitness runs 13 lines on 13 tickets — perfectly one-to-one, a shelf people visit for exactly one thing. So the review can rank shelves not just by size but by repetition, and the accessories shelf wins both ways: biggest line book and the most repeat-pairing inside baskets. The distinct ticket count is what makes that claim honest — without it, 62 lines would quietly impersonate 62 shopping trips.",
  },
  {
    id: "cs-554",
    tier: "easy",
    topic: "l16",
    universe: "inventory",
    title: "The three-at-a-time club",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: bulk-pick staffing.\n\nThe count plan treats bulk picks differently, because three units out the door in one motion changes the tolerance math. Before Friday I want the bulk movement in one row: how many purchase lines moved three units at a time, and across how many distinct tickets those bulk lines actually spread. Staff the pick face for the pattern, not for the paperwork.",
    ask: "The line count and the distinct ticket count for every purchase line of 3 units, side by side.",
    template: `SELECT {3} AS bulk_lines, COUNT(DISTINCT oi.order_id) AS real_tickets
FROM order_items oi
JOIN products p ON {1} = {2}
WHERE oi.quantity = {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Bulk lines name their item through product_id — the hop that ties the pick face to the catalog. The line's own id would match line numbers against item numbers and count a club whose members share numbers instead of quantity.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog carries no product_id of its own, so that guess errors before the bulk census exists — and Friday's staffing plan runs on nothing.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw bulk-line count",
        why: "The raw count is every 3-unit paired row — 89 bulk lines, tickets repeated when a basket bulk-bought more than one line. A distinct count here would collapse the club to ticket level and the pick face would be staffed for fewer motions than really happen.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the bulk quantity",
        why: "The club is defined by three units to a line — the largest quantity the ledger records. Any other quantity counts a different club entirely, and the tolerance math would be tuned for a pattern nobody asked about.",
      },
    ],
    distractors: ["o.id", "p.product_id", "COUNT(DISTINCT p.id)", "p.price", "MAX(oi.quantity)"],
    walkthrough:
      "The club's card: 89 bulk lines spread across 68 distinct tickets — 21 tickets bulk-bought more than one 3-unit line. Every one of the 16 catalog items appears at least once at quantity three, so bulk buying is a habit, not a product quirk, and it leads with the premium kit: the Noise-Canceling Headset and the Desk Mat at 8 bulk lines each, the Wireless Mouse and Laptop Stand at 7. The siblings frame the shape: single-unit lines run 93 across 70 tickets and two-unit lines 69 across 53, so the bulk slice is the middle tier by size but the densest by repetition. For the count plan, 68 tickets is the real staffing number — 89 motions, but 68 stops. The two counts disagree by design, and the pick face should be planned from both.",
  },
  {
    id: "cs-555",
    tier: "easy",
    topic: "l16",
    universe: "funnel",
    title: "Alice's reach versus her frequency",
    brief:
      "From: Growth marketing lead. Re: Berlin account, deck numbers.\n\nThe Berlin motion is built on Alice Chen and the deck has been quoting her line schedule at every meeting — the big number. I need her file stated honestly: how many purchase lines her account has rung, and how many distinct tickets those lines were actually spread across. Reach and frequency are different stories and the deck should stop using one for the other.",
    ask: "The raw line count and the distinct ticket count on Alice Chen's account, side by side.",
    template: `SELECT {3} AS raw_lines, {4} AS real_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
WHERE c.name = {5};`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines stack onto tickets through order_id — the pointer that makes the pairing (and the repetition) happen. The line's own id would pair line numbers with ticket numbers and hand the deck a Berlin file that belongs to nobody.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each ticket on its account: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before Alice's file has a single number.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired line on the account — 50 rows, tickets repeated once per line. It is the frequency-flavored number the deck keeps quoting, and it only means anything beside the reach figure.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids count each booking once: 24 real tickets behind the 50 lines. A plain count would ride the copies and the deck's reach number would be inflated by every multi-line basket she ever placed.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the account name",
        why: "The deck names the account — the exact quoted text 'Alice Chen'. A bare 'Alice' matches nobody and the slide would cite an empty file, while 'Emma Wilson' would build the Berlin story out of Austin's account.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "'Emma Wilson'", "COUNT(DISTINCT c.id)", "'Alice'"],
    walkthrough:
      "Alice's file, stated honestly: 50 purchase lines on 24 distinct tickets — roughly 2.1 lines per booking. The deck's headline survives, but reframed: she is the file's most frequent booker, not its biggest basket-builder. Compare the shape next door — Emma Wilson runs 46 lines on only 17 tickets, about 2.7 lines a ticket, the densest baskets among the heavy accounts, with Grace Kim at 34 on 14 in between. File-wide the same pair reads 251 lines over 103 tickets, so Alice's ratio is close to the house average; her distinction is volume of visits, not size of basket. For the funnel that is the whole argument: reach is 24, frequency is 50, and a campaign that prices Berlin off the 50 will overpay for attention she gives in 24 trips.",
  },
  {
    id: "cs-556",
    tier: "medium",
    topic: "l16",
    universe: "supplier",
    title: "The in-transit book, vendor by vendor",
    brief:
      "From: Supply-chain lead. Re: QBR pack, fulfillment page.\n\nThe QBR's fulfillment page needs the in-transit book by vendor: for tickets currently shipped, the raw purchase lines and the distinct tickets those lines ride on, vendor by vendor. A vendor whose lines far outrun their ticket count is riding multi-line baskets, and that is a fulfillment story the pack should tell on purpose rather than let the line schedule tell by accident.",
    ask: "Each vendor with the raw line count and the distinct ticket count on shipped bookings, busiest ticket book first.",
    template: `SELECT s.name, {5} AS raw_lines, {6} AS real_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN products p ON oi.product_id = {2}
JOIN suppliers s ON p.supplier_id = {3}
WHERE o.status = {4}
GROUP BY s.name
ORDER BY real_tickets DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines stack onto tickets through order_id — the first hop of the chain, and the hop that makes the repetition measurable. The line's own id would pair line numbers with ticket numbers and file the in-transit book under tickets that were never placed.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own, so that spelling errors before the page's first row exists.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The second hop lands each item on its vendor: the item's supplier_id against the vendor file's id. Vendors carry no supplier_id column of their own, so that guess breaks the chain and the QBR page prints blank.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the in-transit status",
        why: "In-transit means the exact text 'shipped' — lowercase and quoted. 'delivered' would fill the page with tickets that already landed and the fulfillment story would be about the past, not the pipeline.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired shipped line per vendor — paperwork volume, baskets counted once per line. Distinct tickets in this slot would print the reach figure twice and the page would lose the gap it exists to show.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids count each shipped booking once, whatever its basket depth. A plain count would ride the copies and every vendor's reach would be inflated by their own multi-line baskets.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "s.supplier_id", "'delivered'", "COUNT(DISTINCT p.id)"],
    walkthrough:
      "The in-transit book by vendor, both columns: Shenzhen Electro 19 lines on 15 tickets, Midwest Hardware 18 on 14, Nordic Gadgets 17 on 14, Pacific Textiles 11 on 10, Alpine Audio 10 on 9 — and Andes Naturals 9 on 9, the only vendor whose shipped lines match tickets one-to-one. Overall the slice reads 84 lines on 30 tickets, so the average shipped ticket touches nearly three vendor lines. The page's argument: the top three vendors are within two tickets of each other, so in-transit reach is a dead heat, while the line column flatters Shenzhen and Midwest by a row or two each. Andes' flat 9-and-9 is the footnote that proves the method — a vendor whose gear never doubles up inside a basket. Line counts alone would have buried that distinction.",
  },
  {
    id: "cs-557",
    tier: "medium",
    topic: "l16",
    universe: "expense",
    title: "The reach census, account by account",
    brief:
      "From: Ops finance, spend review. Re: the account-weight dispute.\n\nThe spend review keeps quoting account weight off the line schedule, which counts every ticket once per line. I want the honest census: every account with its raw line count beside its real ticket count, ranked by reach. Wherever the two columns split widest is where the review's per-account narrative needs a footnote before anyone signs it.",
    ask: "Every account with its raw line count and distinct ticket count, ranked by ticket count.",
    template: `SELECT c.name, {4} AS raw_lines, {5} AS real_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY {3}
ORDER BY real_tickets DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Lines stack onto tickets through order_id — the hop that creates the repetition the census is measuring. The line's own id would pair line numbers with ticket numbers and produce a census whose two columns agree with nothing.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each ticket on its account: the ticket's customer_id against the register's id. The register carries no customer_id of its own, so that guess errors before the census has a single row.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "The census is filed by account, so the grouping is the register's name column. Grouping by city would file sixteen accounts under sixteen cities — the rows would look plausible and reconcile to nothing the review recognizes.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired line per account — the schedule's number, copies included. A distinct count in this slot would print the reach figure in both columns and the dispute would end with nobody knowing whose file was inflated.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids collapse each account's copies: 24 real bookings behind Alice's 50 lines. A plain count would ride the repeats and every account's reach would be overstated by its own basket depth.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "c.city", "COUNT(DISTINCT c.id)", "'Alice Chen'"],
    walkthrough:
      "The census, top to bottom: Alice Chen 50 lines on 24 tickets, Emma Wilson 46 on 17, Grace Kim 34 on 14, Maya Patel 30 on 13 — then the pack drops away, down to Olivia Brown's 3 lines on a single ticket. File-wide: 251 lines, 103 tickets, sixteen accounts. The split the review should footnote is Emma's: 46 lines on 17 tickets is the widest gap at the top of the file, so her line-schedule weight overstates her visit count worse than anyone's — her baskets are the densest among the heavies. The two columns also settle the small accounts honestly: Liam O'Brien's 4 lines are one ticket, Olivia's 3 lines are one ticket, and neither is a repeat visitor. Ranked by reach, the leaderboard is fair; ranked by lines, it flatters exactly the accounts that bundle.",
  },
  {
    id: "cs-558",
    tier: "medium",
    topic: "l16",
    universe: "growth",
    title: "Twenty-six one-line tickets",
    brief:
      "From: Chief of Staff. Re: board deck, the basket-size floor.\n\nThe deck's basket-size slide needs its floor: the tickets that carried exactly one purchase line, with the account behind each, in ticket order. Single-line tickets are the no-attach story — if a quarter of the book never adds a second item, the attach conversation starts from that number and not from the average that flatters it.",
    ask: "Every ticket with exactly one purchase line, with the account name, in ticket order.",
    template: `SELECT o.id, c.name, {3} AS lines
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY o.id
HAVING COUNT(*) = {4}
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Basket depth is measured by stacking lines onto tickets through order_id. The line's own id would pair line numbers with ticket numbers and measure a book where every basket is exactly one fake line.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The hop lands each ticket on its account: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before the floor exists.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the per-ticket line count",
        why: "After the grouping, this is each ticket's basket depth — the number the slide filters on. Counting distinct tickets per ticket would print 1 for every row and the filter would keep the whole book instead of the floor.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the single-line bar",
        why: "The floor is exactly one line per ticket, and the figure prints in the lines column of every surviving row. A bar of 2 keeps 29 different tickets and the slide would celebrate the attach tier as if it were the floor.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "2", "3", "4"],
    walkthrough:
      "The floor of the book: 26 tickets carried exactly one line — a quarter of the ledger's 103 bookings, each row printing its 1 in the lines column. The full basket census frames it: 26 one-line tickets, 29 two-line, 25 three-line, 23 four-line, an almost flat spread with no dominant depth. So the attach story is honest but unspectacular — the book is not bottom-heavy, it is evenly graded, and the single-line quarter is the entry tier rather than a pathology. For the deck, the slide's value is the definition it forces: basket depth exists only after the grouping collapses each ticket's copies, which is why the filter rides the per-ticket count and not the raw pile. Quote 26 as the floor, 103 as the book, and the attach conversation starts from facts.",
  },
  {
    id: "cs-559",
    tier: "medium",
    topic: "l16",
    universe: "fraud",
    title: "The figure that survives the photocopy",
    brief:
      "From: Risk team, spot-check rotation. Re: the manual-review packet.\n\nBefore the packet goes out I want the one number nobody can argue with: the largest single booking on the ledger. The pairing report and the ticket ledger disagree on counts all day, but the packet needs the figure that comes out the same from both — printed beside the two counts so the packet explains its own discrepancy instead of fielding questions about it.",
    ask: "The largest booking total, beside the raw line count and the distinct ticket count, on one row.",
    template: `SELECT MAX({1}) AS biggest_ticket, {3} AS raw_lines, {4} AS real_tickets
FROM order_items oi
JOIN orders o ON {2} = o.id;`,
    slots: [
      {
        answer: "o.total",
        kind: "keyword",
        label: "the booking amount column",
        why: "The packet quotes money, and the booking's total lives on the ledger's total column. Taking the largest quantity instead would crown 3 units as the biggest booking, and the review would open on a box count.",
      },
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "The pairing — and its repetition — exists only through the line-to-ticket pointer. The line's own id would pair line numbers with ticket numbers and produce a pile whose biggest figure belongs to no booking at all.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count shows the pile at full size — 251 paired rows, copies included — which is the number the ledger-side reviewer keeps challenging. A distinct count here would print 103 twice and the packet would hide the discrepancy it exists to explain.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids give the ledger's own 103 beside the pairing's 251. A plain count would agree with the copies and the packet's two columns would never expose why the two reports disagree.",
      },
    ],
    distractors: ["oi.quantity", "o.customer_id", "AVG(o.total)", "SUM(o.total)"],
    walkthrough:
      "One row, three facts: the biggest booking is 1,088.44, the pairing counts 251 rows, the ledger counts 103 tickets. The first fact is the point — the maximum is fan-out immune. Repeating a ticket once per line adds copies, and copies cannot raise a maximum: ask either register and the answer is the same 1,088.44, ticket 74, Farid Nasser's pending Dubai booking. The counts beside it are the cautionary tale: where totals repeat, counts compound, and the same pairing that agreed on the maximum triples the average — 411.33 on the pairing against a true 338.19 — and would print 103,244.55 if anyone summed it. That is why the packet leads with the maximum: it is the one aggregate the photocopying cannot touch, and the two disagreeing counts beside it show exactly why every other figure needs the grain stated.",
  },
  {
    id: "cs-560",
    tier: "medium",
    topic: "l16",
    universe: "catalog",
    title: "Which shelves ring the register most",
    brief:
      "From: Catalog content manager. Re: quarterly shelf-effort ranking.\n\nThe merchandising board re-ranks shelf effort this quarter and the ranking should be built on real sales events, not line noise. For every shelf I want the raw purchase-line count beside the distinct tickets those lines came on, busiest line book first. The shelf that rings the register most is not automatically the shelf with the most lines, and the board should see both columns.",
    ask: "Each shelf with its raw line count and distinct ticket count, ranked by line count.",
    template: `SELECT p.category, {4} AS raw_lines, COUNT(DISTINCT oi.order_id) AS real_tickets
FROM order_items oi
JOIN products p ON {1} = {2}
GROUP BY {3}
ORDER BY raw_lines {5};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Lines name their shelf through the product_id pointer to the catalog. The line's own id would match line numbers against item numbers and rank shelves by whatever items share those numbers.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own, so that spelling errors before a single shelf is ranked.",
      },
      {
        answer: "p.category",
        kind: "keyword",
        label: "the grouping column",
        why: "Shelves are the category column on the catalog — that is the bucket the board funds. Grouping by product would split the ranking into sixteen single-item rows and the shelf story would dissolve.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired line per shelf — the paperwork column the board is used to seeing. Distinct tickets in this slot would print the reach figure twice and the ranking would lose the gap column entirely.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Busiest first is descending, so the ranking opens on the accessories shelf. ASC would lead with the 13-line fitness shelf and the board would form its effort plan from the tail.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "p.name", "p.supplier_id", "ASC"],
    walkthrough:
      "The shelf ranking, both columns: Accessories 62 lines on 54 tickets, Audio 51 on 46, Electronics 44 on 40, Video 32 on 30, Wearables 25 on 23, Apparel 24 on 22, Fitness 13 on 13. First finding: the two rankings agree order for order, so no shelf is buying lines without earning tickets — but the spacing tells the real story. Accessories owns the widest gap, eight repeat-pairings inside baskets, which is what an attach shelf should look like; Fitness is perfectly one-to-one, thirteen lines on thirteen tickets, a shelf with zero intra-basket repeats. File-wide the columns reconcile at 251 and 103. The board gets a ranking it can act on: fund Accessories for attach, treat Fitness as a destination shelf, and quote reach — not lines — whenever the debate is about traffic rather than paperwork.",
  },
  {
    id: "cs-561",
    tier: "medium",
    topic: "l16",
    universe: "month-close",
    title: "The status census that has to reconcile",
    brief:
      "From: Controller. Re: close binder, line-item schedule by state.\n\nThe line-item schedule is filed by fulfillment state and the auditor's first question never changes: how many of those rows are real tickets versus repeated lines. Give me the census by state — raw paired lines beside distinct tickets — and the four state rows have to reassemble to the schedule's own totals before the binder leaves my desk.",
    ask: "Each booking status with its raw line count and distinct ticket count, heaviest line book first.",
    template: `SELECT o.status, {3} AS raw_lines, {4} AS real_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id
GROUP BY {2}
ORDER BY raw_lines DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "The census measures repetition, and repetition comes from lines stacking onto tickets through order_id. The line's own id would pair line numbers with ticket numbers and produce four state rows that reconcile to nothing on file.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the grouping column",
        why: "The binder files by fulfillment state, so the grouping is the ledger's status column. Grouping by ship date would shred the census into one row per date and the binder's four-line format would be gone.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is each state's paired-line total — copies included, exactly what the schedule prints. A distinct count in this slot would collapse every state to ticket level and the auditor's copies question would have no answer on the page.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real ticket count",
        why: "Distinct ticket ids give each state's true booking count beside its line total. A plain count would ride the copies and both columns would agree — hiding the very gap the binder is being audited for.",
      },
    ],
    distractors: ["p.id", "o.shipped_at", "COUNT(DISTINCT o.status)", "COUNT(DISTINCT oi.product_id)"],
    walkthrough:
      "The census, state by state: delivered 119 lines on 52 tickets, shipped 84 on 30, pending 36 on 14, cancelled 12 on 7. Both columns reassemble — 251 lines and 103 tickets — so the schedule reconciles and the binder can go out. The state rows are where the copying lives or doesn't: the delivered book carries 67 more paired rows than tickets, the shipped book 54 more, while the cancelled queue is 12 against 7. Read as a pipeline check, the shape is clean — the biggest state is also the most completed one, and the copies scale with basket depth rather than with any state behaving oddly. The auditor gets a one-line answer: every row of the schedule is a line, the tickets behind them are in the second column, and the two figures disagree by exactly the number of photocopies each state's baskets made.",
  },
  {
    id: "cs-562",
    tier: "hard",
    topic: "l16",
    universe: "refund-audit",
    title: "Bulk lines still sitting open",
    brief:
      "From: refunds@ — internal ticket #4533. Re: goodwill policy, the open pile.\n\nBefore goodwill offers go out on the open pile, policy wants the bulk slice isolated: purchase lines of three units sitting on pending tickets, counted both ways — raw lines and the distinct tickets they actually ride. The gap between those two numbers is how many open tickets are bulk-buying more than one line, and the offer-letter template changes if that gap is wide.",
    ask: "The raw line count and the distinct ticket count for 3-unit lines on pending bookings, side by side.",
    template: `SELECT {3} AS bulk_lines, {4} AS open_tickets
FROM order_items oi
JOIN orders o ON {1} = o.id
WHERE o.status = {2} AND oi.quantity = 3;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Bulk lines reach the status filter through the order_id pointer — the hop that also creates the repetition being measured. The line's own id would pair line numbers with ticket numbers and count a bulk pile nobody stocked.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-ticket status",
        why: "The open pile is the exact quoted text 'pending' — lowercase and quoted. 'Pending' capitalized matches nothing and the offer run would skip every bulk ticket in silence, while 'shipped' would count lines already on trucks.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw bulk-line count",
        why: "The raw count is every 3-unit paired row still open — 16 lines, open tickets repeated when a basket bulk-bought twice. A distinct count in this slot would print 11 twice and the policy memo would lose the gap it is deciding on.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the real open-ticket count",
        why: "Distinct ticket ids count each open booking once: 11 real tickets behind the 16 bulk lines. A plain count would ride the copies and the offer template would be sized for five phantom extra mailings.",
      },
    ],
    distractors: ["p.id", "'Pending'", "'shipped'", "'cancelled'", "'Delivered'"],
    walkthrough:
      "The bulk slice of the open pile: 16 three-unit lines riding 11 distinct pending tickets — five open tickets are bulk-buying more than one line, and that is the gap the offer template prices. The contrast slices frame it: shipped bulk runs 30 lines on 22 tickets, delivered 41 on 33, and the cancelled queue's two bulk lines sat on two separate tickets, one-to-one. Pending overall is 36 lines on 14 tickets, so bulk is nearly half the open pile's lines. The lesson the policy team should keep: every filter — status, quantity — shrinks the pile but never un-copies it. The two counts moved together through every cut and stayed different at every one of them; only the distinct count ever says how many tickets are really left, and the goodwill queue is staffed from that number, not the raw one.",
  },
  {
    id: "cs-563",
    tier: "hard",
    topic: "l16",
    universe: "pricing",
    title: "Every audio line at its own price",
    brief:
      "From: Head of Product. Re: pricing reset, the dispersion challenge.\n\nThe audio section keeps getting challenged on dispersion — do we actually sell this shelf at varied price points, or does everything clear at list? I want the shelf counted three ways on one row: raw purchase lines, the distinct tickets behind them, and the distinct charged prices. If the price count equals the line count, every single sale cleared at its own number, and the reset's dynamic-pricing story writes itself.",
    ask: "The raw line count, distinct ticket count and distinct charged prices for the Audio shelf, one row.",
    template: `SELECT {3} AS raw_lines, COUNT(DISTINCT oi.order_id) AS real_tickets, {5} AS distinct_prices
FROM order_items oi
JOIN products p ON {1} = {2}
WHERE p.category = {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Lines reach their shelf through the product_id pointer to the catalog. The line's own id would match line numbers against item numbers and price a shelf out of whatever rows share those numbers.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog carries no product_id of its own, so that guess errors before the shelf has a single figure.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the raw line count",
        why: "The raw count is every paired audio line — 51 sales, each a charged price point. A distinct-count chip here would shrink the shelf to ticket level and the dispersion argument would lose its denominator.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the shelf label",
        why: "The shelf is the quoted text 'Audio', exact and case-sensitive. 'Wearables' would price a different shelf's lines and the reset's audio section would quote numbers the audio vendors never earned.",
      },
      {
        answer: "COUNT(DISTINCT oi.unit_price)",
        kind: "keyword",
        label: "the distinct charged prices",
        why: "Distinct charged prices reveal how many different numbers the shelf actually sold at, whatever the list says. A maximum would report one price point and the dispersion challenge would end on a single figure.",
      },
    ],
    distractors: ["o.id", "p.product_id", "'Wearables'", "COUNT(DISTINCT p.id)", "MAX(oi.unit_price)"],
    walkthrough:
      "The audio shelf, counted three ways: 51 raw lines, 46 distinct tickets, 51 distinct charged prices. The price column is the headline — every single audio line cleared at its own number, a spread running 57.16 to 157.40 against list anchors of 59.99, 119 and 149.99. So the shelf has no repeated sale price at all: dispersion is total, and the dynamic-pricing story is now a fact on the record rather than an anecdote. The ticket column carries the second finding: 51 lines on 46 tickets means five baskets double-dipped into audio, yet even those repeats charged different numbers the second time. That is the full grain picture in one row — lines for volume, tickets for trips, prices for variety — and the challenge dissolves because each count answers the question it was built for instead of impersonating the others.",
  },
  {
    id: "cs-564",
    tier: "hard",
    topic: "l16",
    universe: "inventory",
    title: "The four-line baskets, named",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: pick-path redesign.\n\nThe pick-path redesign starts from the fattest baskets: every ticket that carried exactly four purchase lines, with the account and region attached so the routes can be sized by metro. The four-line tier is the heaviest slice of the book, and the count has to come off the purchase lines — not the ticket ledger — or the routes get built on the wrong baskets entirely.",
    ask: "Every ticket with exactly four purchase lines, with the account and region, in ticket order.",
    template: `SELECT o.id, c.name, c.region, COUNT(*) AS lines
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY {3}
HAVING COUNT(*) = {4}
ORDER BY o.id;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Basket depth only exists after lines stack onto tickets through order_id. The line's own id would pair line numbers with ticket numbers and measure a book in which every basket is one phantom line.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The hop lands each ticket on its account: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before a single route is sized.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the grouping column",
        why: "Baskets are tickets, so the grouping is the ledger's own ticket id — one row per booking, its copies collapsed. Grouping by account would fuse every customer's tickets into one basket and measure shopping habits instead of pick paths.",
      },
      {
        answer: "4",
        kind: "number",
        label: "the four-line bar",
        why: "The redesign targets the four-line tier, and the figure prints in the lines column of all 23 surviving rows. A bar of 3 keeps 25 different baskets and the routes would be drawn for a tier the count plan never asked for.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "c.name", "3", "23"],
    walkthrough:
      "The heaviest tier, named: 23 tickets carried exactly four lines — each row printing its 4 in the lines column. The ownership map matters for routing: Emma Wilson owns four of the 23, Grace Kim and Maya Patel three each, Alice Chen three, with Chloe Dubois and Pedro Alvarez at two apiece — and one of the four-line baskets is ticket 20, Liam O'Brien's famous one-and-done order, the file's only single-ticket account buying like a bulk shopper. Set against the full census — 26 one-line, 29 two-line, 25 three-line, 23 four-line — the four-line tier is the smallest bucket but the densest per stop, which is exactly why the pick paths start there. The grouping is the quiet hero: collapse each ticket's copies first, then filter, or the count plan would be routing pickers to baskets that only exist as repeated rows.",
  },
  {
    id: "cs-565",
    tier: "hard",
    topic: "l16",
    universe: "funnel",
    title: "Regions that clear the reach bar",
    brief:
      "From: Growth marketing lead. Re: regional spend plan, the funding bar.\n\nThe regional spend plan only funds markets that clear ten distinct tickets — reach, not line noise. For each region I want the raw purchase-line count beside the distinct ticket count, keeping only the regions that clear the bar, ranked by reach. If a region's lines look fat but its tickets are thin, the plan should pass on it and be able to say why in one row.",
    ask: "Each region with its raw line count and distinct ticket count, keeping regions with at least 10 tickets, ranked by reach.",
    template: `SELECT c.region, COUNT(*) AS raw_lines, COUNT(DISTINCT o.id) AS reach
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY c.region
HAVING {4} >= {3}
ORDER BY reach DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's ticket pointer",
        why: "Reach is counted through the line-to-ticket pointer, copies and all — which is exactly why the distinct count is applied to it. The line's own id would pair line numbers with ticket numbers and fund regions on a pile that belongs to nobody.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The hop lands each ticket on its account so the region filter can reach it: the ticket's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before the bar is applied.",
      },
      {
        answer: "10",
        kind: "number",
        noVerify: true,
        label: "the funding bar",
        why: "The plan funds markets at ten distinct tickets — the bar itself, not a figure the rows print. Dropping it to two would fund a two-ticket region and the spend plan would be spread across markets it never meant to staff.",
      },
      {
        answer: "COUNT(DISTINCT o.id)",
        kind: "keyword",
        label: "the reach measure",
        why: "The bar is defined on distinct tickets — reach — so that is what the filter must compare. Filtering on the raw line count would measure paperwork volume instead, and regions would qualify on their basket depth rather than their traffic.",
      },
    ],
    distractors: ["c.name", "COUNT(DISTINCT c.id)", "MAX(o.id)", "20", "2"],
    walkthrough:
      "The funded map, at a bar of ten: EU 105 lines on 45 tickets, APAC 88 on 37, US 53 on 19 — three regions clear, and LATAM goes home with 5 lines on just 2 tickets. The ranking column is the argument: reach, not lines, because every region's line count is fattened by its own multi-line baskets and the plan does not staff baskets, it staffs markets. The bar's sensitivity is worth saying out loud — raise it to twenty and the US drops out with only 19 tickets, turning a three-region plan into a two-region one. The line column keeps its place as context: the funded regions' line books look roughly proportional to their reach, so none of the three is a thin market wearing a fat schedule. Fund on 45, 37 and 19; footnote the 5-and-2 region that missed.",
  },
  {
    id: "cs-566",
    tier: "hard",
    topic: "l16",
    universe: "supplier",
    title: "The vendor reach podium",
    brief:
      "From: Supply-chain lead. Re: QBR pack, the closing podium.\n\nThe pack closes on the vendor reach podium: the three vendors our tickets actually visit most, counted as distinct tickets — not lines, which double-count every multi-line basket. Raw lines sit beside the reach figure so the podium shows both the paperwork and the true traffic, and the cut is three because the page has three slots to fill and no more.",
    ask: "The 3 vendors with the most distinct tickets, with raw line counts beside, biggest reach first.",
    template: `SELECT s.name, COUNT(*) AS raw_lines, COUNT(DISTINCT oi.order_id) AS real_tickets
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON p.supplier_id = {3}
GROUP BY s.name
ORDER BY real_tickets DESC
LIMIT {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Lines reach their item through product_id — the first hop of the vendor chain the podium rides. The line's own id would match line numbers against item numbers and podium whatever vendors share those numbers.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own, so that spelling errors before the podium has a single name.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The second hop lands each item on its vendor: the item's supplier_id against the vendor file's id. Vendors carry no supplier_id column of their own, so that guess breaks the chain and the page's three slots stay empty.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the podium size",
        why: "The page carries exactly three slots, so the cut is 3 — and the podium is defined by the reach column the page ranks on. A cut of five would print a leaderboard and the closing slide would argue with itself.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "s.supplier_id", "5", "2"],
    walkthrough:
      "The podium, by reach: Midwest Hardware Co 56 lines on 45 tickets, Shenzhen Electro 47 on 41, Nordic Gadgets 43 on 38. Pacific Textiles 40 on 35 and Alpine Audio 40 on 34 miss the cut on traffic despite respectable line books, and Andes Naturals closes the file at 25-and-25 — the one vendor whose lines match tickets exactly, never doubling up inside a basket. The two columns make the podium defensible: the reach order is the reach order, not an artifact of basket depth, and the line column beside it shows how much paperwork each podium slot represents. That is the QBR's closing argument in one slide — Midwest leads on both stop count and volume, Shenzhen and Nordic are within a few tickets of the crown, and the vendor behind the file's cleanest one-to-one footprint never leaves the sixth row. Cut at three, ranked by tickets, lines for context.",
  },
];
