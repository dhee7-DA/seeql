// Case batch X4 — Module 6 (Expert Clinic) cases cs-1551…cs-1575, wave 2.
// RIGHT JOIN — the preserved-right-side join and the orphan hunts it exists
// for. Figures from the W2 receipt pool (m6-cases-w2-facts*.ts). Audited by
// scripts/case-audit.ts (x-laws: RIGHT JOIN mandatory, every distractor must
// change the outcome). Key receipts: 5 invoice-free members (Bruno/Dmitri/
// Farid/Keiko/Noah), their 15 orders worth 4746.95, 6 unpaid invoices worth
// 15217.00 (open lane 13461.00), the paid-ghost ticket INV-2025-028, the
// behind-on-bills count 7, 23 invoices with at most one payment, shadow
// order extremes (Farid 1088.44 top, 15 orders, avg 316.46).
import type { CaseStudy } from "./types";

export const casesX4: CaseStudy[] = [
  {
    id: "cs-1551",
    tier: "easy",
    topic: "x4",
    universe: "refund-audit",
    title: "The invoice-free five",
    brief:
      "From: Billing ops. Re: the missing paper trail.\n\nEvery storefront member is supposed to have at least one invoice on file, but the billing queue feels light. Pull the members who have never been invoiced — name and region — so the team can chase the paperwork before month-end close.",
    ask: "Which members have no invoice on file at all, listed alphabetically with their region?",
    template: `SELECT c.name, c.region FROM invoices i
  {1} customers c ON i.customer_id = {2}
  WHERE i.id IS {3}
  ORDER BY c.name;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the join that keeps the roster",
        why: "RIGHT JOIN keeps every row of customers — the right-hand table — whether or not an invoice matches. Five members come through with NULL invoice columns, and those NULLs are exactly the paper trail the billing queue is missing.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the match key",
        why: "The invoice finds its owner through i.customer_id = c.id. Matching on anything else — say i.id, which lives on the invoice side — pairs each invoice with itself and leaves every customer unmatched, inflating the orphan list to the whole roster.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unmatched test",
        why: "A RIGHT JOIN hands back NULL invoice columns for members nothing matched, so i.id IS NULL is the fingerprint of never having been billed. IS NOT NULL would flip the query and return the 28 invoiced rows instead.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "JOIN", "i.id", "c.region"],
    walkthrough:
      "The roster lives on the right. FROM invoices i RIGHT JOIN customers c walks every invoice, attaches the owning member where one exists, and — this is the part INNER JOIN throws away — still emits a row for each member no invoice ever matched, with every i.* column NULL. The match key is i.customer_id = c.id: invoices point at their owner, and matching on an invoice-side column like i.id would pair each row with itself and orphan the entire roster. Five members surface with i.id IS NULL: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato and Noah Meyer. All five have orders in the system — they buy, they just never got billed — which is precisely why the finance team wants their names before the close. Swap in LEFT JOIN or INNER JOIN and the preserved side flips or shrinks: the invoice table has no orphan rows of its own, so the NULL test finds nothing and the chase list comes back empty.",
  },
  {
    id: "cs-1552",
    tier: "easy",
    topic: "x4",
    universe: "month-close",
    title: "Counting the ghosts",
    brief:
      "From: Controller. Re: the close checklist.\n\nThe close checklist has a line item: confirm the count of members carrying no invoice. It should be small but non-zero — every one of them is revenue we delivered but never billed. One number, one query.",
    ask: "How many members have never received an invoice?",
    template: `SELECT {3}(*) AS ghosts FROM invoices i
  {1} customers c ON i.customer_id = c.id
  WHERE i.id IS {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the roster-preserving join",
        why: "RIGHT JOIN keeps all 16 members alive in the result even when no invoice row matches. LEFT JOIN or INNER JOIN would anchor the walk on invoices, and since every invoice has an owner, the NULL test would count nothing at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the orphan fingerprint",
        why: "Members the invoice walk failed to match arrive with NULL invoice ids — i.id IS NULL isolates exactly those five. Switching to IS NOT NULL counts the 28 invoiced rows instead, which is the opposite of the checklist's question.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally",
        why: "COUNT(*) counts the surviving rows — five ghosts. SUM or AVG would demand a numeric column and error out on the asterisk; the checklist wants a headcount, not an arithmetic attempt.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "SUM", "AVG"],
    walkthrough:
      "The count is the headline: five members have never been invoiced. The mechanics matter as much as the figure. FROM invoices i RIGHT JOIN customers c preserves the member roster — all 16 customers survive the walk — while invoices attach only where i.customer_id = c.id finds an owner. Eleven members match at least one of the 28 invoices; the other five carry NULL invoice columns, and i.id IS NULL singles them out. COUNT(*) then turns those five surviving rows into the checklist number. Run the same filter under LEFT JOIN or INNER JOIN and the preserved side becomes the invoice table, which has no orphans of its own — the NULL test catches nothing and the count reads 0, silently green-lighting a gap the controller specifically asked to measure.",
  },
  {
    id: "cs-1553",
    tier: "easy",
    topic: "x4",
    universe: "month-close",
    title: "The EU ghosts",
    brief:
      "From: EU account lead. Re: the regional billing gap.\n\nBefore I take the billing gap to the EU sync I need it sized for my region only — how many of our members in the EU have never been invoiced? The other regions' numbers go in someone else's deck; mine needs to be defensible.",
    ask: "How many EU members have never been invoiced?",
    template: `SELECT COUNT({3}) AS eu_ghosts FROM invoices i
  {1} customers c ON i.customer_id = c.id
  WHERE i.id IS NULL AND c.region = {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the join keeping every member",
        why: "RIGHT JOIN guarantees each EU member survives the walk even with no invoice attached. Anchoring on invoices instead loses exactly the rows the lead is trying to count — the members nothing ever matched.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region filter",
        why: "The EU scope filters the preserved roster: two of the five invoice-free members live there — Dmitri Volkov and Noah Meyer. 'LATAM' would return Bruno Silva's 1, 'US' none at all; both would misstate the EU gap.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the counted column",
        why: "COUNT(c.id) counts member ids among the surviving rows — two for the EU. COUNT(i.id) would count invoice ids, which are NULL for every ghost, and would report zero: the members vanish from their own audit.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "i.id"],
    walkthrough:
      "Two EU members have never been invoiced: Dmitri Volkov and Noah Meyer. The query earns that number through three deliberate choices. RIGHT JOIN customers preserves the full member roster, so members without invoices still appear — with NULL invoice columns. The region filter c.region = 'EU' narrows the preserved roster to the lead's territory before the count. And COUNT(c.id) — counting the customer-side key, not the invoice-side one — is what makes the ghosts visible: their i.id is NULL, so COUNT(i.id) would tally zero and the EU gap would read as solved. The sibling numbers for context: APAC hides two ghosts (Farid Nasser, Keiko Sato) and LATAM one (Bruno Silva). LEFT JOIN or INNER JOIN would anchor the walk on invoices, find no unmatched invoice rows, and hand the lead a clean-looking zero right before month-end.",
  },
  {
    id: "cs-1554",
    tier: "easy",
    topic: "x4",
    universe: "refund-audit",
    title: "The untouched six",
    brief:
      "From: Collections. Re: the dunning list.\n\nAn invoice only enters the dunning list if money has never moved against it — no payment at all, not even a partial. Count those invoices so collections knows how big the chase queue is this week.",
    ask: "How many invoices have no payment recorded against them?",
    template: `SELECT {3}(*) AS unpaid FROM payments p
  {1} invoices i ON p.invoice_id = i.id
  WHERE {2}.id IS NULL;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the invoice-preserving join",
        why: "RIGHT JOIN keeps all 28 invoices in the walk even where no payment matched. Payments are the sparse side here — 27 rows — and only a right-preserved walk lets the NULL test find the six invoices money never touched.",
      },
      {
        answer: "p",
        kind: "keyword",
        label: "the orphan side",
        why: "The RIGHT JOIN preserves invoices, so unmatched ones arrive with the payment side nulled — p.id IS NULL flags them. Testing i.id instead hunts payment rows without an invoice; there are none, so the count would collapse to zero.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the queue size",
        why: "COUNT(*) sizes the dunning queue: six invoices. SUM or AVG would try to aggregate the asterisk and error — collections wants a row count, not arithmetic on a placeholder.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "SUM", "AVG", "i"],
    walkthrough:
      "Six invoices have never seen a payment. FROM payments p RIGHT JOIN invoices i walks from the money side but preserves the paper side: all 28 invoices survive, 22 of them matched to at least one of the 27 payments, six come through with every payment column NULL. The orphan test reads the sparse side — p.id IS NULL — because the preserved invoices keep their own ids intact; testing i.id would hunt payment rows without invoices, and the foreign key guarantees there are none. COUNT(*) lands the queue at six: five open invoices and one remarkable outlier — an invoice marked paid that no money ever settled, which the collections lead will want to see separately. Swap the join to LEFT or INNER and payments become the preserved side; every payment found its invoice, so the NULL test finds nothing and the dunning queue reads zero.",
  },
  {
    id: "cs-1555",
    tier: "easy",
    topic: "x4",
    universe: "refund-audit",
    title: "The biggest unpaid ticket",
    brief:
      "From: Collections. Re: prioritize the chase.\n\nThe dunning list is ordered by exposure — the biggest unpaid ticket gets the phone call first. Find the invoice with the highest amount that has no payment recorded against it, and show its number and amount.",
    ask: "Which unpaid invoice carries the largest amount, and what is that amount?",
    template: `SELECT i.number, i.{3} FROM payments p
  {1} invoices i ON p.invoice_id = i.id
  WHERE p.id IS NULL
  ORDER BY i.amount_cents {2}
  LIMIT 1;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the walk that keeps unpaid paper",
        why: "RIGHT JOIN preserves all 28 invoices, letting the six payment-less ones survive with NULL payment columns. LEFT JOIN or INNER JOIN anchor on payments — and since every payment found its invoice, the NULL test would discard everything.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the exposure order",
        why: "DESC puts the largest amount first, so LIMIT 1 lands on the biggest ticket — 493700 cents. ASC would surface the smallest unpaid invoice instead and collections would phone the wrong account.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the exposure figure",
        why: "The memo asks for the amount alongside the number — i.amount_cents carries it: 493700. Projecting i.status instead would print a lane label where the exposure figure belongs, and the call script loses its number.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "ASC", "issued_on", "status"],
    walkthrough:
      "The biggest unpaid ticket is INV-2025-024 at 4937.00 — nearly a third of the entire 15217.00 exposure. The walk runs FROM payments p RIGHT JOIN invoices i: every invoice survives, payments attach where p.invoice_id = i.id, and the six unmatched invoices keep NULL payment columns that p.id IS NULL isolates. ORDER BY i.amount_cents DESC stacks the exposure largest-first and LIMIT 1 takes the call-first ticket. The projection matters too — the memo wants number and amount, so i.amount_cents sits in the SELECT beside i.number. Sort ASC and the query hands over the smallest unpaid ticket (873.00) as the priority; project issued_on or status and the collections screen shows a date or a lane label where the amount should be. Direction and projection are the difference between a prioritized chase list and a random one.",
  },
  {
    id: "cs-1556",
    tier: "easy",
    topic: "x4",
    universe: "month-close",
    title: "The zero-book members",
    brief:
      "From: Billing ops. Re: the tally audit.\n\nWe built the per-member invoice tally, but the interesting bucket is the zeros — members whose tally never left zero. List the members whose invoice count is exactly zero so the queue can size the outreach.",
    ask: "Which members have an invoice tally of exactly zero?",
    template: `SELECT c.name FROM invoices i
  {1} customers c ON i.customer_id = c.id
  GROUP BY c.id
  HAVING {2}(i.id) = {3};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the zeros-keeping join",
        why: "RIGHT JOIN preserves all 16 members through the GROUP BY, so five members group up with no invoice rows at all. LEFT JOIN or INNER JOIN would drop them before the tally, and the zero bucket would not exist to find.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally function",
        why: "COUNT(i.id) tallies matched invoices per member — zero for the untouched five, because COUNT ignores NULLs. SUM(i.id) or AVG(i.id) over all-NULL groups returns NULL, which never equals the threshold and empties the bucket.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the zero line",
        noVerify: true,
        why: "The bucket is members whose tally never left zero — HAVING COUNT(i.id) = 0. Raising the line to 1 would instead list the three members with exactly one invoice; the zero bucket is precisely the never-invoiced five.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "SUM", "AVG", "1"],
    walkthrough:
      "Five members sit in the zero bucket: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato and Noah Meyer. The query is a tally audit in miniature. RIGHT JOIN customers keeps the whole roster alive, so GROUP BY c.id forms sixteen groups — eleven with matched invoices, five with nothing but NULL invoice ids. HAVING COUNT(i.id) = 0 keeps only the empty groups; COUNT skips NULLs, so the ghost groups tally a clean zero. The threshold is the whole point: move the line to 1 and the query lists the exactly-one-invoice club instead. Try SUM or AVG on i.id and the all-NULL groups return NULL, which fails the equality and wipes out the bucket. And with LEFT JOIN or INNER JOIN the never-matched members never reach the GROUP BY at all — the zero book reads empty, which is exactly the kind of silent lie this audit exists to catch.",
  },
  {
    id: "cs-1557",
    tier: "easy",
    topic: "x4",
    universe: "refund-audit",
    title: "Open and untouched",
    brief:
      "From: Collections. Re: the live queue.\n\nThe dunning list has two lenses — every unpaid invoice, or just the ones still open. For today's standup I need the open lens: invoices with no payment at all whose status is still open. Count them.",
    ask: "How many open invoices have never received any payment?",
    template: `SELECT {3}(*) AS live_queue FROM payments p
  {1} invoices i ON p.invoice_id = i.id
  WHERE p.id IS NULL AND i.status = {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the paper-preserving join",
        why: "RIGHT JOIN keeps every invoice in the walk so the payment-less ones survive to be counted. LEFT JOIN or INNER JOIN anchor on payments, and every payment matched an invoice — the queue would read zero.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the live lane",
        why: "The open lane is the live queue: five unpaid invoices. 'paid' would surface the single paid-status invoice money never settled — an anomaly worth its own ticket — and 'void' would return none.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the standup number",
        why: "COUNT(*) sizes the live queue: five. SUM or AVG would attempt arithmetic on the asterisk and error out; the standup wants a headcount of invoices, not a computation.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "'paid'", "'void'", "SUM"],
    walkthrough:
      "Five open invoices have never been touched by money — that is the live queue. FROM payments p RIGHT JOIN invoices i preserves all 28 invoices; p.id IS NULL keeps the six that no payment ever matched; i.status = 'open' narrows to the five still-live ones (the sixth unpaid invoice is the paid-status anomaly). COUNT(*) lands the standup number. The lane filter is doing real work: 'paid' would return the single ghost ticket marked paid but never settled — interesting, but not the live queue — and 'void' returns nothing. Flip the join to LEFT or INNER and payments become the anchor side; with all 27 payments matched, the NULL test has nothing to find and the queue silently reads zero, exactly the misreading this lens exists to prevent.",
  },
  {
    id: "cs-1558",
    tier: "easy",
    topic: "x4",
    universe: "month-close",
    title: "The settled book",
    brief:
      "From: Controller. Re: the exposure huddle.\n\nFor the exposure huddle I need the members with no open invoice at all — people who, right now, owe us nothing. The scope has to live in the match itself, not a WHERE on the invoice columns, or the preserved roster collapses. Count them.",
    ask: "How many members have no open invoice on file?",
    template: `SELECT COUNT(*) AS clean_members FROM invoices i
  {1} customers c ON i.customer_id = c.id AND i.status = {2}
  WHERE i.id IS {3};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the roster keeper",
        why: "RIGHT JOIN keeps all 16 members alive, matching each only to open invoices. Members matched by nothing survive with NULL invoice columns — and those NULLs are the clean book the huddle wants counted.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the scoped match",
        why: "Putting status = 'open' inside the ON clause scopes the match, not the roster: members match only open invoices, and everyone else stays in the result with NULLs. 'paid' would instead count members with no settled invoice — eight of them — a different question.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the clean-book test",
        why: "i.id IS NULL finds members the scoped walk never matched — ten members with zero open invoices. IS NOT NULL would flip to the six members currently carrying open paper.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "'paid'", "'void'", "NOT NULL"],
    walkthrough:
      "Ten members owe us nothing right now. The trick is where the scope lives: i.status = 'open' sits inside the ON clause, so it filters the match — not the roster. RIGHT JOIN customers preserves all sixteen members; each matches only open invoices; the six members holding open paper match, the other ten come through with NULL invoice columns, and i.id IS NULL counts the clean book. Move the status filter into a WHERE clause and the walk would match on customer_id alone, then discard non-open invoice rows — but the never-invoiced five would already be gone, and the count would quietly misalign. Test the variants: 'paid' in the ON asks who has no settled invoice (eight members — a collections question, not a clean-book one), 'void' asks who avoided the one voided paper (fifteen), and IS NOT NULL reads the six exposed members. LEFT JOIN or INNER JOIN would anchor on invoices and turn the clean book into a zero before the huddle starts.",
  },
  {
    id: "cs-1559",
    tier: "medium",
    topic: "x4",
    universe: "month-close",
    title: "Revenue without a bill",
    brief:
      "From: CFO. Re: the unbilled revenue line.\n\nThere is revenue sitting in the orders table that no invoice has ever covered — we delivered, we never billed. Size it: the total order value belonging to members who have never been invoiced. This number goes on the risk page.",
    ask: "What is the total order value from members who have no invoice on file?",
    template: `SELECT {3}(o.total) AS shadow_revenue FROM invoices i
  {1} customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the ghost-preserving join",
        why: "RIGHT JOIN keeps the five never-invoiced members alive so their orders can be summed. LEFT JOIN or INNER JOIN anchor on invoices, discard the ghosts at the first hop, and the risk line would read zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unbilled test",
        why: "i.id IS NULL isolates members no invoice ever matched. IS NOT NULL would flip the query to the eleven billed members and print 34833.28 — the whole store — on the risk page.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregator",
        why: "SUM(o.total) folds the ghosts' fifteen orders into one exposure figure: 4746.95. AVG would print the mean order (316.46), MAX the single biggest (1088.44), COUNT the order tally — each a different memo.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "AVG", "MAX", "COUNT"],
    walkthrough:
      "4746.95 of delivered revenue has no invoice behind it. The query chains two joins with opposite preservation: FROM invoices i RIGHT JOIN customers c keeps every member — including the five never-invoiced ghosts — and then JOIN orders o attaches their purchases. The filter i.id IS NULL keeps only the ghost branch: Bruno Silva's 852.44, Dmitri Volkov's 599.26, Farid Nasser's 1458.97, Keiko Sato's 1098.60 and Noah Meyer's 737.68 — fifteen orders in total. SUM(o.total) folds them into the 4746.95 risk-page figure. Every alternative answers a different question: NOT NULL sums the billed members' entire 34833.28, AVG prints the 316.46 mean order, MAX the 1088.44 top ticket, COUNT the 15 orders. And anchoring the first hop on invoices (LEFT or INNER JOIN) erases the ghosts before their orders are ever reached — the risk line would read zero while five members' revenue sits unbilled.",
  },
  {
    id: "cs-1560",
    tier: "medium",
    topic: "x4",
    universe: "refund-audit",
    title: "The biggest unbilled spender",
    brief:
      "From: Billing ops. Re: who to onboard first.\n\nThe never-invoiced members are all buying — someone should be onboarded to billing this week. Find the ghost with the highest total order value; that is the account the team calls first. Show the name and their spend.",
    ask: "Which never-invoiced member has the highest total order value, and what is that value?",
    template: `SELECT c.name, {4}(o.total) AS spend FROM invoices i
  {1} customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {2}
  GROUP BY c.id
  ORDER BY spend {3}
  LIMIT 1;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the roster-preserving hop",
        why: "RIGHT JOIN keeps all five ghosts in the walk so their orders can be grouped and compared. LEFT JOIN or INNER JOIN anchor on invoices and erase the ghost branch before any grouping happens.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost filter",
        why: "i.id IS NULL restricts the board to never-invoiced members. NOT NULL would rank the billed book instead and crown a fully-onboarded account — Emma Wilson's 6640.56 — as the onboarding call.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the call-first order",
        why: "DESC stacks spend biggest-first so LIMIT 1 lands on Farid Nasser's 1458.97. ASC would surface the smallest ghost spend — Dmitri Volkov's 599.26 — and the team would phone the wrong account.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the spend aggregator",
        why: "SUM(o.total) folds each ghost's orders into one comparable figure. MAX would rank by the single biggest ticket (still Farid, but 1088.44 — a different number on the screen), COUNT by order tally, AVG by mean order.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "ASC", "MAX", "AVG"],
    walkthrough:
      "Farid Nasser is the biggest unbilled spender at 1458.97 across three orders. The query builds a ghost leaderboard: RIGHT JOIN customers preserves the five never-invoiced members, JOIN orders attaches their purchases, i.id IS NULL keeps only the ghost branch, and GROUP BY c.id collapses each member's orders into one spend figure via SUM(o.total). ORDER BY spend DESC stacks the board and LIMIT 1 takes the top — Farid's 1458.97, ahead of Keiko Sato's 1098.60 and Bruno Silva's 852.44. The distractors each corrupt a different axis: NOT NULL ranks the billed book (Emma Wilson would win at 6640.56 — already onboarded), ASC crowns the smallest ghost, and MAX changes the ranking metric to single-ticket size, printing 1088.44 on a board that was meant to show lifetime spend. Direction, filter and aggregator must all agree with the memo or the call goes to the wrong account.",
  },
  {
    id: "cs-1561",
    tier: "medium",
    topic: "x4",
    universe: "month-close",
    title: "Ghost map by region",
    brief:
      "From: Regional ops. Re: the billing gap heat list.\n\nThe regional decks each need their slice of the billing gap: invoice-free members per region, biggest gap first. Build the per-region census over the never-invoiced roster — region and ghost count — sorted so the worst region leads.",
    ask: "How many never-invoiced members sit in each region, worst region first?",
    template: `SELECT c.region, {3}(*) AS ghosts FROM invoices i
  {1} customers c ON i.customer_id = c.id
  WHERE i.id IS {2}
  GROUP BY c.region
  ORDER BY ghosts DESC, c.region;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the map-preserving join",
        why: "RIGHT JOIN keeps every member — including the five ghosts — so regions can group them. LEFT JOIN or INNER JOIN anchor on invoices and the map would render as empty before grouping even starts.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost test",
        why: "i.id IS NULL keeps only never-invoiced members. NOT NULL would flip the map to the invoiced book and every region would show its full roster instead of its gap.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the gap counter",
        why: "COUNT(*) tallies ghost rows per region: APAC 2, EU 2, LATAM 1. SUM or AVG would demand numeric cells and error on the grouping — the heat list needs headcounts.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "SUM", "AVG"],
    walkthrough:
      "The billing gap maps to APAC 2, EU 2, LATAM 1 — and the US shows zero, which is itself a finding. RIGHT JOIN customers preserves the full sixteen-member roster; i.id IS NULL keeps the five never-invoiced; GROUP BY c.region collapses them into regional buckets; COUNT(*) sizes each bucket. The ORDER BY ghosts DESC, c.region stacks the worst regions first with alphabetical tie-breaks — APAC and EU tie at two, and APAC leads the heat list. The US absence is the quiet point of this query: with no ghost rows surviving the filter, no US group forms at all, and the region simply has no line in the map. NOT NULL would redraw the map over the invoiced book and every region would show its full headcount; SUM or AVG would error on the asterisk. LEFT JOIN or INNER JOIN would anchor on invoices and leave the heat list blank — the one rendering no regional deck can act on.",
  },
  {
    id: "cs-1562",
    tier: "medium",
    topic: "x4",
    universe: "refund-audit",
    title: "The unpaid mountain",
    brief:
      "From: Finance ops. Re: the exposure line.\n\nThe close pack's risk section needs one number: the total face value of invoices that have never seen a single payment. Sum the untouched paper — the full amount, not what partial payments have chipped off.",
    ask: "What is the total value of invoices with no payment recorded against them?",
    template: `SELECT {3}(i.amount_cents) / 100.0 AS exposure FROM payments p
  {1} invoices i ON p.invoice_id = i.id
  WHERE p.id IS {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the paper-preserving walk",
        why: "RIGHT JOIN keeps all 28 invoices alive so the six untouched ones reach the sum. LEFT JOIN or INNER JOIN anchor on payments — every payment matched, so the NULL test would strain nothing and the mountain would read zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the untouched test",
        why: "p.id IS NULL isolates invoices no payment row matched. NOT NULL would sum the settled book instead and print the paid total — the mirror image of the exposure the pack needs.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the exposure aggregator",
        why: "SUM(i.amount_cents) folds the six untouched invoices into 1521700 cents, and the /100.0 renders 15217.00. MAX would print the single biggest ticket (4937.00), AVG the mean (2536.17), COUNT the tally (6) — three different memos.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "MAX", "AVG", "COUNT"],
    walkthrough:
      "The unpaid mountain stands at 15217.00 — six invoices, zero payments. The walk runs FROM payments p RIGHT JOIN invoices i: every invoice survives, payments attach where p.invoice_id = i.id, and the six unmatched invoices carry NULL payment columns that p.id IS NULL isolates. SUM(i.amount_cents) folds their face values — 493700, 356200, 279400, 175600, 129500 and 87300 cents — into 1521700, and the /100.0 renders the exposure in dollars for the pack. The alternatives each answer a different question: NOT NULL sums the settled book instead of the exposure, MAX prints the single 4937.00 ticket, AVG the 2536.17 mean, COUNT the queue length. And with LEFT JOIN or INNER JOIN the preserved side flips to payments, which has no orphans — the mountain would flatten to zero on the risk page while six invoices sit completely untouched.",
  },
  {
    id: "cs-1563",
    tier: "medium",
    topic: "x4",
    universe: "refund-audit",
    title: "Cold paper's price",
    brief:
      "From: Collections. Re: the live exposure number.\n\nExposure isn't the whole mountain — it's the open lane of it. Sum the face value of invoices that are both unpaid and still open. That is the number that can actually still be collected this quarter.",
    ask: "What is the total value of invoices that are unpaid and still open?",
    template: `SELECT {3}(i.amount_cents) / 100.0 AS open_exposure FROM payments p
  {1} invoices i ON p.invoice_id = i.id
  WHERE p.id IS {2} AND i.status = 'open';`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the open-preserving walk",
        why: "RIGHT JOIN keeps every invoice so the unpaid-open subset survives to be summed. LEFT JOIN or INNER JOIN anchor on payments and leave nothing for the NULL test to find — the exposure would print zero.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unpaid test",
        why: "p.id IS NULL keeps invoices money never touched. NOT NULL would flip to invoices with at least one payment — exactly one open invoice has one — and the exposure would collapse to that single ticket.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the collectible aggregator",
        why: "SUM(i.amount_cents) folds the five unpaid open invoices into 1346100 cents, rendered as 13461.00. MAX would print the biggest single ticket (4937.00), COUNT the tally (5), AVG the mean (2692.20) — none is the exposure.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "MAX", "AVG", "COUNT"],
    walkthrough:
      "The collectible exposure is 13461.00 — five open invoices, zero payments. The walk preserves the paper side: FROM payments p RIGHT JOIN invoices i keeps all 28 invoices, p.id IS NULL strains out the 22 that received money, and i.status = 'open' trims the remaining six to the five still-live ones (the sixth is the paid-status ghost ticket). SUM(i.amount_cents) folds 493700, 356200, 279400, 129500 and 87300 cents into 1346100 — 13461.00 in dollars. The variants all mislead: NOT NULL measures the one open invoice that DID receive a payment, MAX prints its neighbour's 4937.00 single ticket, COUNT the five-invoice tally, AVG the 2692.20 mean. And LEFT JOIN or INNER JOIN would anchor on payments — every one matched — flattening the live exposure to zero on the collections dashboard while the real number quietly compounds.",
  },
  {
    id: "cs-1564",
    tier: "medium",
    topic: "x4",
    universe: "fraud",
    title: "The paid ghost ticket",
    brief:
      "From: Internal audit. Re: the status mismatch.\n\nOne invoice in this book is marked paid yet no payment has ever been recorded against it. That mismatch is either a process failure or something worse. Find it — number and amount — before the audit call.",
    ask: "Which invoice is marked paid but has no payment recorded, and what is its amount?",
    template: `SELECT i.number, i.amount_cents FROM payments p
  {1} invoices i ON p.invoice_id = i.id
  WHERE p.id IS {2} AND i.status = {3}
  ORDER BY i.amount_cents DESC;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the audit-preserving walk",
        why: "RIGHT JOIN keeps every invoice in the walk so the payment-less ones can be examined. LEFT JOIN or INNER JOIN anchor on payments, find no unmatched payment rows, and the mismatch would hide in plain sight.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the money test",
        why: "p.id IS NULL keeps invoices with no payment row at all. NOT NULL would flip to invoices that DID receive money and the paid-status ghost would vanish from the audit.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the mismatched lane",
        why: "The anomaly lives in the paid lane: INV-2025-028 at 175600 cents. 'open' would list the five ordinary unpaid open invoices, 'void' nothing at all — neither is the mismatch.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "'open'", "'void'"],
    walkthrough:
      "INV-2025-028 claims status 'paid' at 1756.00 — and not a single payment row points at it. The audit walk runs FROM payments p RIGHT JOIN invoices i: every invoice survives, p.id IS NULL keeps the six that money never touched, and i.status = 'paid' pins the mismatch to its lane — five of the unpaid six are open (business as usual for collections), but this one claims to be settled. That contradiction is the finding: either the payment was recorded outside this system, or the status was flipped by hand. The distractors each dodge the finding: 'open' lists the ordinary unpaid queue, 'void' finds nothing, NOT NULL looks at invoices that did receive money, and LEFT or INNER JOIN anchor on payments — which all matched — leaving the ghost invisible. This is exactly the class of mismatch a RIGHT JOIN plus a NULL test exists to surface.",
  },
  {
    id: "cs-1565",
    tier: "medium",
    topic: "x4",
    universe: "month-close",
    title: "The once-touched ledger",
    brief:
      "From: Treasury. Re: the reconciliation scope.\n\nReconciliation effort should focus where money moved at most once. Count the invoices carrying at most one payment — the untouched ones and the single-tap ones — so treasury can scope the reconciliation sweep.",
    ask: "How many invoices carry at most one payment?",
    template: `SELECT COUNT(*) AS thin_paper FROM (
  SELECT i.id FROM payments p
    {1} invoices i ON p.invoice_id = i.id
    GROUP BY i.id
    HAVING {2}(p.id) <= {3}
);`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the zeros-preserving join",
        why: "RIGHT JOIN keeps all 28 invoices through the GROUP BY, so the six zero-payment invoices form groups with NULL payment ids. LEFT JOIN or INNER JOIN would drop them and the sweep would undercount by exactly six.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tap counter",
        why: "COUNT(p.id) counts matched payments per invoice, returning 0 for untouched paper — NULLs never inflate the tally. SUM or MAX over an untouched group yields NULL, which fails the <= test and silently drops the zeros.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the thin-paper line",
        noVerify: true,
        why: "At most one payment means HAVING COUNT(p.id) <= 1: six untouched invoices plus seventeen single-tap ones — twenty-three. Setting the line to 2 would sweep in the five twice-paid invoices and overstate the scope to 28.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "SUM", "AVG", "MAX", "2"],
    walkthrough:
      "Twenty-three invoices carry at most one payment — six never touched, seventeen tapped exactly once. The preservation choice is the whole case: FROM payments p RIGHT JOIN invoices i keeps every invoice in the GROUP BY, so untouched invoices form groups where COUNT(p.id) reads a clean 0. HAVING COUNT(p.id) <= 1 keeps those six plus the seventeen single-payment invoices. The zero-count is what a LEFT or INNER JOIN would destroy: anchoring on payments drops the six untouched invoices before grouping, and the scope would read seventeen. SUM, AVG or MAX over an untouched group return NULL — and NULL <= 1 is not true, so the zeros would vanish even with the right join. Raise the line to 2 and every invoice qualifies: the five twice-paid ones enter the scope and treasury reconciles twenty-eight instead of twenty-three. Thin paper, counted correctly, is twenty-three.",
  },
  {
    id: "cs-1566",
    tier: "medium",
    topic: "x4",
    universe: "month-close",
    title: "Behind on the bill",
    brief:
      "From: Finance ops. Re: the shortfall census.\n\nAn invoice is 'behind' when the money received against it is less than its face value — including invoices that received nothing at all. Count the behind invoices; the untouched ones must not slip out of the census through a NULL.",
    ask: "How many invoices have received less in payments than their face value?",
    template: `SELECT COUNT(*) AS behind FROM (
  SELECT i.number FROM payments p
    {1} invoices i ON p.invoice_id = i.id
    GROUP BY i.id
    HAVING {2}({3}(p.amount_cents), 0) < i.amount_cents
);`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the untouched-preserving join",
        why: "RIGHT JOIN keeps all 28 invoices through the GROUP BY, so the six zero-payment invoices reach the comparison with a NULL sum. LEFT JOIN or INNER JOIN would drop them and the census would undercount by six.",
      },
      {
        answer: "COALESCE",
        kind: "keyword",
        label: "the NULL guard",
        why: "SUM(p.amount_cents) is NULL for untouched invoices, and NULL < face-value is not true — they would fall out of the census. COALESCE folds that NULL to 0 before the comparison, keeping the untouched paper behind where it belongs.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the received-money fold",
        why: "SUM(p.amount_cents) totals what each invoice actually collected. COUNT would compare a payment tally (0, 1 or 2) against cent amounts — every invoice would look behind. MIN or MAX compare one payment, not the receipts.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "COUNT", "MIN", "MAX"],
    walkthrough:
      "Seven invoices are behind on their bill: the six untouched ones plus INV-2025-025, which collected 4000.00 of its 6148.00 face. The census is a NULL-handling exercise. RIGHT JOIN invoices preserves all 28 through GROUP BY i.id; the six untouched ones group with SUM(p.amount_cents) = NULL — and NULL < i.amount_cents evaluates to NULL, not true, so without a guard they would silently exit the census. COALESCE(SUM(p.amount_cents), 0) folds the NULL to 0, 0 < face is true, and the untouched paper stays behind. The partial payer survives the same comparison: 400000 < 614800. The distractors each break the count: COUNT compares a tally (0, 1 or 2 payments) against cent amounts and flags all 28 invoices; MIN and MAX compare one payment instead of receipts and flag twelve — the five twice-paid invoices each have a payment below face value. And LEFT or INNER JOIN drops the untouched six outright. Seven — with the NULLs guarded.",
  },
  {
    id: "cs-1567",
    tier: "medium",
    topic: "x4",
    universe: "month-close",
    title: "The billing ledger, zeros first",
    brief:
      "From: Billing ops. Re: the outreach order.\n\nThe outreach queue walks the per-member invoice ledger from the emptiest book upward — zero-invoice members first, alphabetical within ties. Show the first member the queue will call, with their tally.",
    ask: "Which member leads the outreach queue when the ledger is sorted emptiest-first, and what is their tally?",
    template: `SELECT c.name, {2}(i.id) AS bills FROM invoices i
  {1} customers c ON i.customer_id = c.id
  GROUP BY c.id
  ORDER BY bills {3}, c.name
  LIMIT 1;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the zeros-preserving ledger",
        why: "RIGHT JOIN keeps all 16 members through the GROUP BY, so the five never-invoiced ones appear with a NULL-derived tally of 0. LEFT JOIN or INNER JOIN would drop them and the queue would start at one invoice.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the tally function",
        why: "COUNT(i.id) renders the untouched ledger as a clean 0 — NULLs are skipped. SUM or MAX over an untouched group returns NULL, which sorts as a different cell and muddies the ledger's zeros.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the emptiest-first order",
        why: "ASC stacks the emptiest ledgers first — Bruno Silva's 0 leads. DESC would hand the queue to the most-invoiced member instead, the exact opposite of outreach priority.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "SUM", "AVG", "MAX", "DESC"],
    walkthrough:
      "Bruno Silva leads the outreach queue with a tally of zero. The ledger is built with preservation in mind: RIGHT JOIN customers keeps all sixteen members alive through GROUP BY c.id, so the five never-invoiced ones form groups where COUNT(i.id) reads 0 — NULL invoice ids simply do not count. ORDER BY bills ASC, c.name stacks the emptiest ledgers first with alphabetical tie-breaks, and LIMIT 1 takes the queue head: Bruno, the alphabetically-first of the five zero-book members. The distractors each reorder or blur the ledger: DESC would lead with the most-invoiced member — the opposite of outreach; SUM, AVG or MAX over untouched groups return NULL rather than 0, printing a NULL tally in the queue's first cell; and LEFT or INNER JOIN would erase the zero-book entirely, starting outreach at members who already have paper. The ledger reads zeros first — that is the design.",
  },
  {
    id: "cs-1568",
    tier: "hard",
    topic: "x4",
    universe: "month-close",
    title: "The vendor one-liner, ghost edition",
    brief:
      "From: Billing ops. Re: the chase list for the CRM.\n\nThe CRM wants the never-invoiced members as a single folded line, alphabetical, comma-separated — one cell the sync can carry. Build it from the invoice walk so the zeros are guaranteed to make the line.",
    ask: "What single folded line lists every never-invoiced member, alphabetical, comma-separated?",
    template: `SELECT {3}(c.name, ', ' ORDER BY c.name) AS ghost_line FROM invoices i
  {1} customers c ON i.customer_id = c.id
  WHERE i.id IS {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the fold-preserving join",
        why: "RIGHT JOIN keeps all sixteen members in the walk, so the five never-invoiced ones survive into the fold. LEFT JOIN or INNER JOIN anchor on invoices and the line would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost filter",
        why: "i.id IS NULL keeps only members no invoice matched. NOT NULL would fold the invoiced book — twenty-eight rows with repeats — into a line naming the wrong people entirely.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the folding function",
        why: "GROUP_CONCAT glues the surviving names into one text cell, with the in-aggregate ORDER BY pinning alphabetical order. SUM or MAX cannot fold names — they error on text or take a single argument.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "SUM", "MAX"],
    walkthrough:
      "The line reads: Bruno Silva, Dmitri Volkov, Farid Nasser, Keiko Sato, Noah Meyer — one cell, five names, alphabetical. The fold stands on preservation: FROM invoices i RIGHT JOIN customers c walks every invoice but keeps all sixteen members alive, i.id IS NULL keeps the five never-matched ones, and GROUP_CONCAT(c.name, ', ' ORDER BY c.name) glues them into a single comma-separated cell in deterministic order — the in-aggregate ORDER BY matters, because without it the fold order follows the scan, which can shuffle between runs. The alternatives each break the line: NOT NULL folds the twenty-eight invoiced rows instead, complete with duplicate names for multi-invoice members; SUM and MAX cannot fold text at all — SUM errors on the separator argument and MAX takes a single argument. And LEFT JOIN or INNER JOIN anchor on the invoice side, where nothing is ever unmatched — the CRM would sync an empty chase list.",
  },
  {
    id: "cs-1569",
    tier: "hard",
    topic: "x4",
    universe: "month-close",
    title: "Ghost towns, folded by region",
    brief:
      "From: Regional ops. Re: the per-region chase rosters.\n\nEach regional lead wants their never-invoiced members on one line — region and the folded name roster, alphabetical within the fold. Build the per-region census with the names folded into the count line.",
    ask: "What does each region's never-invoiced roster look like as one folded line per region?",
    template: `SELECT c.region, {3}(c.name, ', ' ORDER BY c.name) AS roster FROM invoices i
  {1} customers c ON i.customer_id = c.id
  WHERE i.id IS {2}
  GROUP BY c.region
  ORDER BY c.region;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the roster-preserving join",
        why: "RIGHT JOIN keeps every member in the walk so the five ghosts reach their regional groups. LEFT JOIN or INNER JOIN anchor on invoices — no unmatched invoice rows exist — and every region's roster would fold empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost filter",
        why: "i.id IS NULL keeps the never-invoiced members only. NOT NULL would fold the invoiced book per region, with repeated names for multi-invoice members — rosters of the wrong population.",
      },
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the roster fold",
        why: "GROUP_CONCAT(c.name, ', ' ORDER BY c.name) folds each region's ghosts into one ordered line — APAC reads 'Farid Nasser, Keiko Sato'. SUM errors on text, COUNT returns a number where a roster belongs.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "SUM", "COUNT"],
    walkthrough:
      "Three regions carry ghosts, each on one folded line: APAC — Farid Nasser, Keiko Sato; EU — Dmitri Volkov, Noah Meyer; LATAM — Bruno Silva. The query is the per-region census upgraded from counts to names. RIGHT JOIN customers preserves the whole roster through the walk, i.id IS NULL keeps the five never-invoiced, and GROUP BY c.region forms the regional buckets — the US forms no bucket at all, which is the map's silent zero. GROUP_CONCAT(c.name, ', ' ORDER BY c.name) folds each bucket into a single alphabetical line; the in-aggregate ORDER BY pins determinism where a bare fold would follow scan order. The distractors each flatten the roster: COUNT would print 2, 2, 1 where names belong; SUM cannot fold text; NOT NULL folds the invoiced book with duplicated names. And LEFT JOIN or INNER JOIN anchor on invoices — nothing there is ever unmatched — leaving every region's line empty.",
  },
  {
    id: "cs-1570",
    tier: "hard",
    topic: "x4",
    universe: "month-close",
    title: "Fifteen orders in the shadow",
    brief:
      "From: CFO. Re: the unbilled activity count.\n\nAlongside the unbilled revenue figure the risk page wants volume: how many orders have the never-invoiced members placed? Every order in that count is revenue waiting for paper. Count them.",
    ask: "How many orders have the never-invoiced members placed in total?",
    template: `SELECT {4}(*) AS shadow_orders FROM invoices i
  {1} customers c ON i.customer_id = {2}
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {3};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the shadow-preserving hop",
        why: "RIGHT JOIN keeps the five never-invoiced members alive so their orders reach the count. LEFT JOIN or INNER JOIN anchor on invoices and the shadow branch disappears before the orders ever attach.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the member key",
        why: "Orders attach to members through i.customer_id = c.id. Matching i.customer_id = i.id would pair each invoice with itself, match no orders correctly, and the count would collapse to a meaningless number.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the shadow filter",
        why: "i.id IS NULL keeps only never-invoiced members. NOT NULL would count the billed book's orders — the vast majority of the 103 — and the risk page would print the opposite of the shadow.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the volume counter",
        why: "COUNT(*) tallies the shadow orders: fifteen across the five ghosts. SUM or AVG would attempt arithmetic on the asterisk and error — the risk page wants volume, not a computation.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "i.id", "o.id", "SUM"],
    walkthrough:
      "Fifteen orders sit in the shadow — the never-invoiced members buy constantly: Farid three times, Keiko and Noah four each, Bruno and Dmitri twice. The query chains the hops carefully. FROM invoices i RIGHT JOIN customers c preserves the member roster — including the five ghosts — then JOIN orders o attaches purchases through o.customer_id = c.id. The match key matters at the first hop: i.customer_id = c.id is the only pairing that connects invoices to their owners; i.customer_id = i.id would pair each invoice with itself and leave no member correctly matched. i.id IS NULL keeps the shadow branch, and COUNT(*) lands the volume at fifteen. NOT NULL would count the billed book's orders instead, i.id or o.id in the match corrupts the pairing, and SUM errors on the asterisk. Fifteen orders, zero invoices — the volume behind the 4746.95 risk-page figure.",
  },
  {
    id: "cs-1571",
    tier: "hard",
    topic: "x4",
    universe: "pricing",
    title: "The shadow's second ticket",
    brief:
      "From: Pricing. Re: the unbilled benchmark.\n\nThe biggest single order in the shadow book is our anchor for the unbilled tier — but anchors need a runner-up. Show the second-largest single order among the never-invoiced members, with its owner.",
    ask: "Which never-invoiced member placed the second-largest single order, and what was the ticket?",
    template: `SELECT name, ticket FROM (
  SELECT c.name, o.total AS ticket FROM invoices i
    {1} customers c ON i.customer_id = c.id
    JOIN orders o ON o.customer_id = c.id
    WHERE i.id IS {2}
    ORDER BY o.total {3}
    LIMIT 2
) WHERE ticket < {4};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the shadow-preserving hop",
        why: "RIGHT JOIN keeps the five ghosts alive so their orders reach the ranking. LEFT JOIN or INNER JOIN anchor on invoices, and the shadow book never enters the race at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the shadow filter",
        why: "i.id IS NULL restricts the board to never-invoiced members. NOT NULL would rank the billed book — where the runner-up ticket is Chloe Dubois's 945.21, a fully-billed account.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ticket order",
        why: "DESC stacks the largest tickets first, so the LIMIT 2 shortlist holds the top two before the outer WHERE peels the anchor away. ASC would shortlist the two smallest shadow orders instead.",
      },
      {
        answer: "1088.44",
        kind: "number",
        label: "the anchor ticket",
        noVerify: true,
        why: "The anchor is Farid Nasser's 1088.44 — the largest shadow ticket. The outer WHERE ticket < 1088.44 peels it off, leaving Bruno Silva's 752.96 as the runner-up. A line below the runner-up empties the result; one far above returns two rows.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "ASC", "489.33", "1200"],
    walkthrough:
      "The runner-up ticket is Bruno Silva's 752.96. The query is a two-stage ranking: the inner walk — FROM invoices i RIGHT JOIN customers c, then JOIN orders — sorts the shadow book's single tickets largest-first (i.id IS NULL keeps only never-invoiced members) and LIMIT 2 shortlists the top two: Farid Nasser's 1088.44 and Bruno Silva's 752.96. The outer WHERE ticket < 1088.44 then strips the anchor itself, handing pricing the runner-up. The shortlist-then-strip pattern is what makes the runner-up stable; the anchor threshold is the only line that works — below 752.96 the result empties (489.33 is Noah's ticket, third at best), at 1200 both shortlisted rows survive and the result carries the anchor it was meant to shed. NOT NULL would rank the billed book, where the runner-up is Chloe Dubois's 945.21 — a real anchor for nothing, since that order is already invoiced.",
  },
  {
    id: "cs-1572",
    tier: "hard",
    topic: "x4",
    universe: "pricing",
    title: "The shadow's biggest ticket",
    brief:
      "From: Pricing. Re: the unbilled tier anchor.\n\nThe unbilled tier needs its anchor: the largest single order any never-invoiced member has placed. Show the member and the ticket — the anchor the pricing team will benchmark against.",
    ask: "Which never-invoiced member placed the largest single order, and what was the ticket?",
    template: `SELECT c.name, o.total FROM invoices i
  {1} customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {2}
  ORDER BY o.total {3}
  LIMIT 1;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the shadow-preserving hop",
        why: "RIGHT JOIN keeps the five never-invoiced members alive so their orders reach the ranking. LEFT JOIN or INNER JOIN anchor on invoices — no invoice goes unmatched — and the anchor would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the shadow filter",
        why: "i.id IS NULL keeps only the never-invoiced branch. Dropping the NULL test entirely would rank the whole book; the anchor would point at an order that already has paper behind it.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the anchor order",
        why: "DESC stacks the biggest tickets first so LIMIT 1 lands on Farid Nasser's 1088.44. ASC would surface the smallest shadow ticket instead — the opposite end of the benchmark.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "ASC", "c.id"],
    walkthrough:
      "The unbilled tier's anchor is Farid Nasser's 1088.44 — which also happens to be the largest order in the entire store, a detail that makes the unbilled story sharper: our single biggest ticket has no invoice behind it. The walk runs FROM invoices i RIGHT JOIN customers c (roster preserved, ghosts alive), JOIN orders o (purchases attached), i.id IS NULL (shadow branch only), ORDER BY o.total DESC LIMIT 1 (the top ticket). The distractors each miss the anchor: ASC surfaces the smallest shadow ticket, c.id anywhere but the match key breaks the query — as the join keyword it is a syntax error, in the NULL test it compares an id against a boolean context, in the sort it orders cents by member ids. LEFT JOIN or INNER JOIN anchor on invoices, which all matched — the shadow never enters the race and the benchmark reads empty.",
  },
  {
    id: "cs-1573",
    tier: "hard",
    topic: "x4",
    universe: "pricing",
    title: "The shadow's average ticket",
    brief:
      "From: Pricing. Re: the unbilled tier floor.\n\nThe unbilled tier's floor is the average shadow ticket — the mean order value across everything the never-invoiced members have bought. Compute it rounded to cents so the floor can go straight into the tier config.",
    ask: "What is the average order value across the never-invoiced members' orders, rounded to cents?",
    template: `SELECT {3}(o.total, 2) AS avg_ticket FROM invoices i
  {1} customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {2};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the shadow-preserving hop",
        why: "RIGHT JOIN keeps the five ghosts alive so their fifteen orders reach the average. LEFT JOIN or INNER JOIN anchor on invoices and the shadow branch is gone before the mean is computed.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the shadow filter",
        why: "i.id IS NULL keeps only the never-invoiced orders. NOT NULL would average the billed book instead — a different tier floor for a population that already has paper.",
      },
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the cents finisher",
        why: "ROUND(AVG(o.total), 2) — with ROUND slotted — trims the mean to 316.46 for the tier config. SUM, AVG or TOTAL take a single argument and would error on the , 2; the two-argument rounding pass is the finisher.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "SUM", "AVG", "TOTAL"],
    walkthrough:
      "The shadow floor is 316.46 — fifteen orders totalling 4746.95, divided out. The walk preserves the ghost branch: FROM invoices i RIGHT JOIN customers c keeps every member, JOIN orders attaches the fifteen shadow purchases, i.id IS NULL keeps only unbilled volume, and the slotted ROUND wraps AVG(o.total) with a two-argument finish that lands the mean on 316.46. The slot is the folding trick of this case: SUM, AVG and TOTAL all take exactly one argument, so any of them in the slot turns the template's ', 2' into a syntax error — while ROUND legitimately consumes the precision argument and produces a config-ready figure. NOT NULL would compute the billed book's mean instead; LEFT JOIN or INNER JOIN would anchor on invoices and leave the tier floor undefined while five members' unbilled activity sits unmeasured.",
  },
  {
    id: "cs-1574",
    tier: "hard",
    topic: "x4",
    universe: "month-close",
    title: "Second on the shadow board",
    brief:
      "From: Billing ops. Re: the onboarding shortlist.\n\nThe ghost leaderboard is built, but the team wants the number-two line — the second-biggest unbilled spender — to pair with the leader on the onboarding call. Show the name and spend of the ghost ranked second.",
    ask: "Which never-invoiced member ranks second by total order value, and what is their spend?",
    template: `SELECT name, spend FROM (
  SELECT c.name, ROUND(SUM(o.total), 2) AS spend,
    ROW_NUMBER() OVER (ORDER BY SUM(o.total) {4}) AS rn
  FROM invoices i
  {1} customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {2}
  GROUP BY c.id
) WHERE rn = {3};`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the board-preserving hop",
        why: "RIGHT JOIN keeps all five ghosts in the walk so the leaderboard can form. LEFT JOIN or INNER JOIN anchor on invoices, the ghosts never reach the GROUP BY, and the board would carry no lines at all.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost filter",
        why: "i.id IS NULL restricts the board to never-invoiced members. NOT NULL would rank the billed book — where second place is Emma Wilson's 6640.56, an account that already has paper.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the leaderboard line",
        noVerify: true,
        why: "ROW_NUMBER pins each ghost's line: Farid 1 at 1458.97, Keiko 2 at 1098.60, Bruno 3. The outer rn = 2 takes Keiko Sato's line. Line 1 is the leader; line 3 is the third call.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board direction",
        why: "DESC stacks spend biggest-first so line 2 is the second-biggest spender. ASC would invert the board — line 2 would become the fourth-smallest ghost, and the onboarding pair would be wrong.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "ASC", "1", "3"],
    walkthrough:
      "Keiko Sato sits second on the shadow board at 1098.60 across four orders. The leaderboard is a window over a preserved aggregate: RIGHT JOIN customers keeps all five ghosts through the walk, JOIN orders attaches their purchases, i.id IS NULL holds the shadow line, and GROUP BY c.id collapses each ghost into one SUM(o.total) spend. ROW_NUMBER() OVER (ORDER BY SUM(o.total) DESC) pins the board — Farid 1 at 1458.97, Keiko 2 at 1098.60, Bruno 3 at 852.44, Noah 4 at 737.68, Dmitri 5 at 599.26 — and the outer WHERE rn = 2 peels Keiko's line off the board. The direction slot decides what 'second' means: ASC inverts the ranking and the second line becomes a different ghost entirely. NOT NULL rebuilds the board over the billed book, where second place belongs to an account with no onboarding problem at all.",
  },
  {
    id: "cs-1575",
    tier: "hard",
    topic: "x4",
    universe: "month-close",
    title: "The ghost roster, worst first",
    brief:
      "From: Collections. Re: the soft-touch list.\n\nThe outreach team wants the gentlest opener: the never-invoiced member with the smallest total spend — least exposure, easiest conversation. Show who sits at the bottom of the shadow leaderboard by lifetime order value.",
    ask: "Which never-invoiced member has the smallest total order value?",
    template: `SELECT c.name FROM invoices i
  {1} customers c ON i.customer_id = c.id
  JOIN orders o ON o.customer_id = c.id
  WHERE i.id IS {2}
  GROUP BY c.id
  ORDER BY {3}(o.total) {4}
  LIMIT 1;`,
    slots: [
      {
        answer: "RIGHT JOIN",
        kind: "keyword",
        label: "the roster-preserving hop",
        why: "RIGHT JOIN keeps all five ghosts in the walk so their totals can be compared. LEFT JOIN or INNER JOIN anchor on invoices and the soft-touch list would come back empty.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost filter",
        why: "i.id IS NULL keeps the never-invoiced members only. NOT NULL would rank the whole book, and the softest spender overall — Olivia Brown at 444.80 — is a fully-billed account, not a ghost.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime fold",
        why: "SUM(o.total) folds each ghost's orders into lifetime spend — the metric the list sorts on. MAX would rank by single biggest ticket, AVG by mean order; both send the team to a different member than lifetime exposure does.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the gentlest-first order",
        why: "ASC stacks lifetime spend smallest-first, so LIMIT 1 lands on Dmitri Volkov's 599.26. DESC would hand the team the biggest ghost — Farid Nasser — for what was meant to be the soft opener.",
      },
    ],
    distractors: ["LEFT JOIN", "INNER JOIN", "NOT NULL", "MAX", "AVG", "DESC"],
    walkthrough:
      "The gentlest opener is Dmitri Volkov — 599.26 of lifetime spend across two orders, the smallest shadow book. The query is the ghost leaderboard read from the bottom: RIGHT JOIN customers preserves the five never-invoiced members, JOIN orders attaches their purchases, i.id IS NULL holds the shadow line, GROUP BY c.id folds each ghost to one lifetime figure via SUM(o.total), and ORDER BY ... ASC LIMIT 1 takes the smallest. The metric slot matters as much as the direction: MAX ranks by single biggest ticket and AVG by mean order — either would hand the team a different member, because ranking by per-order size and ranking by lifetime exposure disagree at the bottom of the book. NOT NULL ranks the whole roster, where the softest spender (Olivia Brown, 444.80) already has paper. DESC inverts the list and sends the soft-touch caller to Farid Nasser's 1458.97 book — the least gentle opener available.",
  },
];
