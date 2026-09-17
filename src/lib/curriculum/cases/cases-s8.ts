// Case batch S8 — Module 3 (set ops & CASE) cases cs-861…cs-900.
// 40 cases: 14 easy / 13 medium / 13 hard across topic s8 (Set+CASE capstone —
// stacked arms with CASE-labeled or CASE-pivoted segments, verdict probes over
// INTERSECT/EXCEPT derivations, reconciliation stacks).
// Every case carries both a CASE expression and (where stacked) a set operator.
// Every figure was probed against the live seed db (scripts/m3-facts-s67*.ts)
// and is mechanically re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesS8: CaseStudy[] = [
  {
    id: "cs-861",
    tier: "easy",
    topic: "s8",
    universe: "month-close",
    title: "Two ledgers, two arms",
    brief:
      "From: Controller. Re: the opening reconciliation.\n\nThe close's first line stacks two worlds: order money still alive (cancelled excluded) beside total expense money. Two arms, one UNION ALL, exact dollars.",
    ask: "Stack live order money over expense money as labeled rows.",
    template: `SELECT 'orders' AS src, ROUND(SUM(CASE WHEN {1} THEN total ELSE 0 END), 2) AS money
FROM orders
{2}
SELECT 'expenses', ROUND(SUM({3})/100.0, 2)
FROM expenses;`,
    slots: [
      {
        answer: "status <> 'cancelled'",
        kind: "keyword",
        label: "the live test",
        why: "Excluding the 7 cancelled orders leaves 33,680.79 of live order money.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Two different piles append cleanly; nothing deduplicates because nothing collides.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 2's money column",
        why: "Expenses hold cents — 25,416.00 after the /100 conversion.",
      },
    ],
    distractors: ["status = 'cancelled'", "INTERSECT", "debit_cents"],
    walkthrough:
      "Two rows: orders 33,680.79, expenses 25,416.00. The CASE inside arm 1 is the capstone twist — a set-op stack whose first arm is itself a conditional sum. Flip the test to status = 'cancelled' and the orders row shrinks to 1,152.49 of leakage, the exact inverse reading. INTERSECT would compare an orders row against an expenses row and return nothing — different tables never intersect on whole rows. debit_cents does not exist on expenses, so the audit kills that fill outright.",
  },
  {
    id: "cs-862",
    tier: "easy",
    topic: "s8",
    universe: "growth",
    title: "Many vs few, stacked",
    brief:
      "From: Growth lead. Re: the scale line.\n\nThe scale line classifies tables by volume: anything over 100 rows prints many, the rest print few. Orders and customers stacked in one query — one of each verdict.",
    ask: "Stack orders and customers with a many/few CASE verdict each.",
    template: `SELECT CASE WHEN COUNT(*) > {3} THEN 'many' ELSE 'few' END AS size, COUNT(*) AS n
FROM {1}
UNION ALL
SELECT 'few', COUNT(*)
FROM {2};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "103 orders clear the line — the stack's many row.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "arm 2's table",
        why: "16 customers sit under the line — the few row.",
      },
      {
        answer: "100",
        kind: "keyword",
        label: "the scale threshold",
        why: "The line that splits the book: 103 clears it, 16 does not.",
      },
    ],
    distractors: ["200", "invoices", "suppliers"],
    walkthrough:
      "Two rows: many 103, few 16. The CASE reads the arm's own COUNT and renders a verdict — a label computed from data, not hardcoded. Push the threshold to 200 and orders demote to few: the stack would report two few rows and the scale line loses its contrast. invoices (28) and suppliers (6) both print few; swapping them in keeps the query valid but flattens the story the line exists to tell.",
  },
  {
    id: "cs-863",
    tier: "easy",
    topic: "s8",
    universe: "fraud",
    title: "The trouble stack",
    brief:
      "From: Fraud analyst. Re: the watch pile.\n\nThe watch pile stacks the two statuses worth watching — pending and cancelled — then appends one grand-total row computed with a CASE guard so the label only prints when the pile exists.",
    ask: "Stack pending and cancelled counts with a guarded everything row.",
    template: `SELECT status AS k, COUNT(*) AS n
FROM orders
WHERE {1}
GROUP BY status
{2}
SELECT CASE WHEN COUNT(*) > 0 THEN {3} END, COUNT(*)
FROM orders;`,
    slots: [
      {
        answer: "status IN ('pending', 'cancelled')",
        kind: "keyword",
        label: "the watch filter",
        why: "The two watch statuses: 14 pending plus 7 cancelled.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Three distinct label rows append; nothing to deduplicate.",
      },
      {
        answer: "'everything'",
        kind: "keyword",
        label: "the grand label",
        why: "The CASE prints everything only because 103 rows exist to label.",
      },
    ],
    distractors: ["status = 'cancelled'", "INTERSECT", "'shipped'"],
    walkthrough:
      "Three rows: pending 14, cancelled 7, everything 103. Arm 1 groups the watch pile; arm 2's CASE WHEN COUNT(*) > 0 guarantees the grand row labels itself only when rows exist — an empty table would print NULL instead of a lie. Shrinking the watch filter to cancelled alone drops the pending row and the stack loses half its point. INTERSECT would compare watch rows against the everything row — no label ever matches, so zero rows survive.",
  },
  {
    id: "cs-864",
    tier: "easy",
    topic: "s8",
    universe: "catalog",
    title: "The ghost premium arm",
    brief:
      "From: Warehouse lead. Re: the band proof.\n\nThe band proof stacks a CASE-labeled budget arm over a hardcoded premium arm. The premium arm returns zero — and the stack keeps the zero visible instead of hiding it.",
    ask: "Stack CASE-labeled budget count over the premium count.",
    template: `SELECT CASE WHEN {1} THEN 'budget' END AS band, COUNT(*) AS n
FROM products
WHERE price < 50
GROUP BY band
{2}
SELECT 'premium', COUNT(*)
FROM products
WHERE {3};`,
    slots: [
      {
        answer: "price < 50",
        kind: "keyword",
        label: "arm 1's CASE test",
        why: "The CASE labels the eight sub-50 products budget.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Budget and premium rows append — even when one arm is empty.",
      },
      {
        answer: "price > 200",
        kind: "keyword",
        label: "arm 2's premium filter",
        why: "Nothing costs more than 200 — the premium arm prints 0 on purpose.",
      },
    ],
    distractors: ["stock > 200", "price >= 199.99", "price > 150"],
    walkthrough:
      "Two rows: budget 8, premium 0 — and the zero is the finding. Arm 1's CASE has no ELSE, but every filtered row matches, so the band column never goes NULL; arm 2 proves the premium shelf is empty at any price above the watch's 199.99 ceiling. Loosen arm 2 to price > 150 and a premium count of 1 appears — the 199.99 smart watch — quietly contradicting the ghost-band story. The stack's honesty: both arms run, both print, even the empty one.",
  },
  {
    id: "cs-865",
    tier: "easy",
    topic: "s8",
    universe: "month-close",
    title: "Billed minus void, collected",
    brief:
      "From: Controller. Re: the cash linkage.\n\nThe linkage stacks real billing (voids excluded, via CASE) against money actually collected. The two figures are the AR story's opening pair.",
    ask: "Stack void-excluded invoice money over collected payment money.",
    template: `SELECT 'invoiced' AS src,
       ROUND(SUM(CASE WHEN {1} THEN {2} ELSE 0 END)/100.0, 2) AS money
FROM invoices
{3}
SELECT 'collected', ROUND(SUM(amount_cents)/100.0, 2)
FROM payments;`,
    slots: [
      {
        answer: "status <> 'void'",
        kind: "keyword",
        label: "the real-billing test",
        why: "Excluding the one void leaves 86,052.00 of real billing.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "arm 1's money column",
        why: "Invoices hold cents; the CASE routes them and /100 converts.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The invoiced row and the collected row append as two labeled lines.",
      },
    ],
    distractors: ["status = 'void'", "INTERSECT", "debit_cents"],
    walkthrough:
      "Two rows: invoiced 86,052.00, collected 69,612.00 — a 16,440.00 gap that is the open-pipeline story in one line. The CASE arms the void exclusion: flip it to status = 'void' and invoiced collapses to the single 925.00 scar. INTERSECT across an invoices row and a payments row returns nothing — different shapes never match. debit_cents is ledger vocabulary, not an invoices column; the fill errors and the audit notes it.",
  },
  {
    id: "cs-866",
    tier: "easy",
    topic: "s8",
    universe: "supplier",
    title: "The bench and the watch list",
    brief:
      "From: Sourcing lead. Re: the vendor page.\n\nThe vendor page stacks the EU bench (CASE-banded by rating) over the global watch list — suppliers rated under 4.0 — so the page reads home bench first, concerns second.",
    ask: "Stack EU suppliers' rating bands over the sub-4.0 watch list.",
    template: `SELECT name, CASE WHEN {1} THEN {2} ELSE 'crew' END AS band
FROM suppliers
WHERE region = 'EU'
{3}
SELECT name, 'watch'
FROM suppliers
WHERE rating < 4;`,
    slots: [
      {
        answer: "rating >= 4.5",
        kind: "keyword",
        label: "the star test",
        why: "Nordic (4.6) and Alpine (4.8) clear 4.5 — the EU bench's stars.",
      },
      {
        answer: "'star'",
        kind: "keyword",
        label: "the star label",
        why: "The printed band for 4.5-plus vendors — both EU names earn it.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Bench rows and watch rows append — two vocabularies, one page.",
      },
    ],
    distractors: ["rating >= 4.7", "'top'", "rating <= 4"],
    walkthrough:
      "Three rows: Nordic Gadgets star, Alpine Audio star, Pacific Textiles watch. Arm 1 bands the two EU vendors; arm 2 reaches globally for the one supplier under 4.0 — Pacific at 3.9 — and labels it watch without a CASE, because the WHERE already did the branching. Tighten the star test to 4.7 and Nordic prints crew while staying on the bench. Loosen the watch filter to rating <= 4 and Andes (4.0 exactly) joins Pacific — a watch list twice as long with half the evidence.",
  },
  {
    id: "cs-867",
    tier: "easy",
    topic: "s8",
    universe: "funnel",
    title: "Won and lost, one pass",
    brief:
      "From: Funnel analyst. Re: the outcome page.\n\nThe outcome page renders the delivered-vs-cancelled money split as CASE-labeled rows — a GROUP BY over a derived column instead of two separate queries.",
    ask: "Render won vs lost money as CASE-labeled rows.",
    template: `SELECT CASE WHEN {1} THEN 'won' ELSE {2} END AS outcome,
       ROUND(SUM(total), 2) AS money
FROM orders
WHERE status IN ({3})
GROUP BY outcome
ORDER BY {4};`,
    slots: [
      {
        answer: "status = 'delivered'",
        kind: "keyword",
        label: "the won test",
        why: "Delivered money prints won: 15,571.07 of finished revenue.",
      },
      {
        answer: "'lost'",
        kind: "keyword",
        label: "the lost label",
        why: "The ELSE arm — cancelled money prints lost: 1,152.49.",
      },
      {
        answer: "'delivered', 'cancelled'",
        kind: "keyword",
        label: "the outcome filter",
        why: "Only the two settled outcomes enter the page; pending and shipped wait.",
      },
      {
        answer: "money DESC",
        kind: "keyword",
        label: "the page order",
        why: "Won leads on money; the page reads best-news-first.",
      },
    ],
    distractors: ["status = 'shipped'", "'gain'", "money ASC"],
    walkthrough:
      "Two rows: won 15,571.07, lost 1,152.49. The CASE builds the label column, GROUP BY collapses onto it, and SUM sizes each pile — the row-shaped cousin of the two-column pivot. Widening the filter to include shipped would reclassify 9,980.76 as won and change both rows; narrowing it to delivered alone would leave lost empty. Sorting ASC flips the page to bad-news-first, which is exactly how not to open a funnel review.",
  },
  {
    id: "cs-868",
    tier: "easy",
    topic: "s8",
    universe: "inventory",
    title: "Deep stock and thin stock",
    brief:
      "From: Warehouse lead. Re: the depth tile.\n\nThe depth tile stacks deep stock (50 units and up) against thin stock, each arm running its own CASE count. Two arms, one threshold, mirrored.",
    ask: "Stack deep vs thin product counts across two arms.",
    template: `SELECT 'deep' AS what, SUM(CASE WHEN stock >= 50 THEN 1 ELSE 0 END) AS n
FROM products
{2}
SELECT 'thin', SUM(CASE WHEN {1} THEN 1 ELSE 0 END)
FROM {3};`,
    slots: [
      {
        answer: "stock < 50",
        kind: "keyword",
        label: "arm 2's thin test",
        why: "The mirror of arm 1's >= 50: two products sit below the line.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Deep and thin rows append as one two-row tile.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "arm 2's table",
        why: "Both arms read the same catalog; the threshold does the splitting.",
      },
    ],
    distractors: ["stock >= 60", "INTERSECT", "inventory"],
    walkthrough:
      "Two rows: deep 14, thin 2 — and 14 + 2 reconciles to sixteen products. The mirrored thresholds are the contract: >= 50 and < 50 share the boundary so no product lands in both arms or neither. Raise arm 2's test to stock >= 60 and thin counts thirteen products — suddenly the deep arm and thin arm overlap and the tile double-counts. INTERSECT between two aggregate rows compares 14 against 2 and returns nothing; there is no inventory table for the third fill to find.",
  },
  {
    id: "cs-869",
    tier: "easy",
    topic: "s8",
    universe: "expense",
    title: "The fixed-spend shelf proof",
    brief:
      "From: Finance partner. Re: the fixed-spend footnote.\n\nThe footnote bands the fixed-spend slice — rent plus tools — into major and minor shelves, with dollars beside each count. Rent fills the major shelf fourteen times; tools never leave the minor one.",
    ask: "Band the rent-plus-tools slice major/minor with counts and dollars.",
    template: `SELECT CASE WHEN {1} THEN 'major' ELSE 'minor' END AS band,
       COUNT(*) AS n, ROUND(SUM({3})/100.0, 2) AS money
FROM expenses
WHERE category IN ({2}, 'Tools')
GROUP BY band;`,
    slots: [
      {
        answer: "amount_cents >= 100000",
        kind: "keyword",
        label: "the major test",
        why: "Rent clears 1,000 dollars fourteen times; every tool stays below it.",
      },
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the slice's first category",
        why: "Rent joins Tools in the slice — the two fixtures of fixed spend.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "Major 16,800.00 against minor 15.25 — the shelves could not weigh more differently.",
      },
    ],
    distractors: ["'big'", "'Ads'", "vendor"],
    walkthrough:
      "Two rows: major 14 / 16,800.00, minor 5 / 15.25 — both shelves populated because the slice mixes rent with tools. The 1,000-dollar line is doing all the work: rent's twelve hundred dollars clears it every month, and tools' biggest filing is 329 dollars. Relabeling the major shelf 'big' changes nothing but the word — the populations stay put. Point the slice at ads instead of rent and the major shelf empties entirely: ads never clears the line, and the footnote would prove the opposite of its title.",
  },
  {
    id: "cs-870",
    tier: "easy",
    topic: "s8",
    universe: "growth",
    title: "The queue and the rest",
    brief:
      "From: Growth lead. Re: the backlog line.\n\nThe backlog line stacks the pending queue over a CASE-guarded rest row — the rest only prints its label when there is one, and there is: 89 orders.",
    ask: "Stack the pending count over the CASE-labeled rest count.",
    template: `SELECT {1} AS k, COUNT(*) AS n
FROM orders
WHERE status = 'pending'
{2}
SELECT CASE WHEN COUNT(*) > 0 THEN 'rest' END, COUNT(*)
FROM orders
WHERE {3};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's label",
        why: "The queue: 14 pending orders, the line the desk watches.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Queue and rest append as two labeled rows.",
      },
      {
        answer: "status <> 'pending'",
        kind: "keyword",
        label: "arm 2's rest test",
        why: "The mirror filter: 89 orders that are not pending.",
      },
    ],
    distractors: ["'shipped'", "status = 'pending'", "COUNT(*) > 100"],
    walkthrough:
      "Two rows: pending 14, rest 89 — 103 orders split by the queue line. Arm 2's CASE guard means an empty rest would print NULL rather than claim the label; with 89 rows it prints rest honestly. Point arm 2's filter at status = 'pending' instead and the mirror breaks: the rest row counts the queue again, and the stack reports 14 + 14 while 89 orders vanish. The COUNT(*) > 100 guard stays false on this data — the rest row would lose its label and print NULL, 89.",
  },
  {
    id: "cs-871",
    tier: "easy",
    topic: "s8",
    universe: "catalog",
    title: "Two shelves, two counts",
    brief:
      "From: Warehouse lead. Re: the media shelf audit.\n\nThe audit stacks the Audio and Video shelves, each arm counting its products and — via CASE — how many sit under 100 dollars. Both shelves keep exactly one budget item.",
    ask: "Stack Audio and Video shelves with under-100 counts per arm.",
    template: `SELECT {2} AS k, COUNT(*) AS n,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS under100
FROM products
WHERE category = 'Audio'
UNION ALL
SELECT 'Video', COUNT(*), SUM(CASE WHEN price < 100 THEN 1 ELSE 0 END)
FROM products
WHERE category = {3};`,
    slots: [
      {
        answer: "price < 100",
        kind: "keyword",
        label: "arm 1's budget test",
        why: "One Audio product (59.99) sits under 100 — matching Video's one (39.99).",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Three Audio products form the first shelf row.",
      },
      {
        answer: "'Video'",
        kind: "keyword",
        label: "arm 2's category gate",
        why: "The second shelf: two Video products, one under 100.",
      },
    ],
    distractors: ["price < 40", "'Electronics'", "INTERSECT"],
    walkthrough:
      "Two rows: Audio 3 products / 1 under-100, Video 2 / 1. The CASE-per-arm pattern gives each shelf its own budget counter inside the stack — the pivot's granularity with the stack's shape. Tighten arm 1's test to 40 and Audio's counter drops to zero while Video's hardcoded arm stays 1: the shelves stop being comparable, which is the whole reason they were stacked. INTERSECT would compare an Audio row against a Video row and return nothing.",
  },
  {
    id: "cs-872",
    tier: "easy",
    topic: "s8",
    universe: "fraud",
    title: "Plastic versus transfer",
    brief:
      "From: Fraud analyst. Re: the rail split page.\n\nThe rail split page renders payment money by rail with CASE labels: card money prints plastic, everything else prints transfer — two rows, exact dollars.",
    ask: "Render card vs wire money as CASE-labeled rail rows.",
    template: `SELECT CASE WHEN method = 'card' THEN {1} ELSE 'transfer' END AS rail,
       ROUND(SUM({2})/100.0, 2) AS money
FROM {3}
GROUP BY rail;`,
    slots: [
      {
        answer: "'plastic'",
        kind: "keyword",
        label: "the card label",
        why: "Card money prints plastic: 37,364.00 across 16 payments.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "Both rails sum their cents; /100 converts at the end.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "the source table",
        why: "Rails live on payments; the CASE does the labeling after.",
      },
    ],
    distractors: ["'card'", "invoice_id", "invoices"],
    walkthrough:
      "Two rows: plastic 37,364.00, transfer 32,248.00 — and the CASE lumps all wire money under transfer because the ELSE catches every non-card method. That is the page's design: one explicit rail, one catch-all, so a future 'ach' method would appear under transfer without a query change. Labeling the ELSE 'card' would print card twice — once true, once false — and the two rows would stop meaning anything. Summing invoice_id manufactures a number no treasurer would sign; invoices carry no method column at all.",
  },
  {
    id: "cs-873",
    tier: "easy",
    topic: "s8",
    universe: "month-close",
    title: "Settled and outstanding",
    brief:
      "From: Controller. Re: the AR tile.\n\nThe AR tile renders invoice money in two CASE-labeled buckets — settled against outstanding — so the close reads the ratio before reading the rows.",
    ask: "Render paid vs unpaid invoice money as labeled buckets.",
    template: `SELECT CASE WHEN {1} THEN 'settled' ELSE {3} END AS bucket,
       ROUND(SUM({2})/100.0, 2) AS money
FROM invoices
GROUP BY bucket;`,
    slots: [
      {
        answer: "status = 'paid'",
        kind: "keyword",
        label: "the settled test",
        why: "21 paid invoices print settled: 66,443.00 of collected cash.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the money column",
        why: "Both buckets sum cents and convert once, at the end.",
      },
      {
        answer: "'outstanding'",
        kind: "keyword",
        label: "the outstanding label",
        why: "The ELSE arm — open and void both print outstanding: 20,534.00.",
      },
    ],
    distractors: ["status = 'void'", "'due'", "money"],
    walkthrough:
      "Two rows: settled 66,443.00, outstanding 20,534.00 — a 76/24 split. The ELSE is the design: open and void both fall to outstanding, so the tile answers one question — how much is still out the door — without a third bucket. Test for 'void' instead and the settled row shrinks to 925.00 while outstanding swallows the paid money: a tile that reads upside down. Labeling the ELSE 'due' relabels the bucket while keeping its population — a cosmetic change the close would notice and the arithmetic would not.",
  },
  {
    id: "cs-874",
    tier: "easy",
    topic: "s8",
    universe: "supplier",
    title: "The bench and the stars",
    brief:
      "From: Sourcing lead. Re: the recognition page.\n\nThe recognition page stacks the EU bench count over a CASE-labeled star count — the stars get their own row only because the CASE prints the label when the tier exists.",
    ask: "Stack the EU supplier count over the CASE-labeled star count.",
    template: `SELECT {1} AS k, COUNT(*) AS n
FROM suppliers
WHERE region = 'EU'
{3}
SELECT CASE WHEN rating >= 4.5 THEN {2} END, COUNT(*)
FROM suppliers
WHERE rating >= 4.5;`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Two suppliers make the EU bench — the page's home row.",
      },
      {
        answer: "'star'",
        kind: "keyword",
        label: "arm 2's CASE label",
        why: "Both 4.5-plus suppliers print star — Nordic and Alpine.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Bench and stars append; the counts intentionally overlap.",
      },
    ],
    distractors: ["'APAC'", "'top'", "INTERSECT"],
    walkthrough:
      "Two rows: EU 2, star 2 — and the equality is coincidence, not duplication: the EU bench happens to be exactly the star tier, since Nordic and Alpine are both European and both excellent. The CASE in arm 2 labels the star row from data, so a demoted vendor would fall to NULL and the page would show the tier shrinking. INTERSECT would compare (EU, 2) against (star, 2) — same count, different label — and return zero rows. 'APAC' would relabel the bench while its WHERE still filtered for Europe.",
  },
  {
    id: "cs-875",
    tier: "medium",
    topic: "s8",
    universe: "month-close",
    title: "The exposure ladder's big-money arm",
    brief:
      "From: Controller. Re: the ladder upgrade.\n\nThe exposure ladder grows a third column: big-ticket money per arm, computed with a CASE at the 500 line. Pending orders and open invoices stack with their heavy tails exposed.",
    ask: "Stack pending and open invoices with big-ticket money per arm.",
    template: `SELECT {1} AS src, COUNT(*) AS n,
       ROUND(SUM(CASE WHEN total >= 500 THEN total ELSE 0 END), 2) AS big_money
FROM orders
WHERE status = 'pending'
{3}
SELECT {2}, COUNT(*),
       ROUND(SUM(amount_cents)/100.0, 2)
FROM invoices
WHERE status = 'open';`,
    slots: [
      {
        answer: "'pending_orders'",
        kind: "keyword",
        label: "arm 1's label",
        why: "14 pending orders, five of them heavy: big_money 3,921.32.",
      },
      {
        answer: "'open_invoices'",
        kind: "keyword",
        label: "arm 2's label",
        why: "6 open invoices worth 196.09 all-in — no CASE needed when every dollar is heavy.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The two exposure rows append; their columns align by position.",
      },
    ],
    distractors: ["'open_invoices'", "total >= 700", "INTERSECT"],
    walkthrough:
      "Two rows: pending_orders 14 / 3,921.32, open_invoices 6 / 196.09. Arm 1's CASE is the ladder's upgrade — big_money isolates the five 500-plus pendings so the desk sees which exposure is heavy; arm 2's open invoices average 32.68 each, too small to bother branching. Duplicate the labels and the stack still works but reads as one row twice; INTERSECT would compare a pending row against an invoice row and return nothing — different shapes never match.",
  },
  {
    id: "cs-876",
    tier: "medium",
    topic: "s8",
    universe: "growth",
    title: "Home, abroad, and the book",
    brief:
      "From: Growth lead. Re: the scope line.\n\nThe scope line stacks a CASE-split customer base — home market against abroad — over one grand row counting every order. Three rows, one view of where demand lives.",
    ask: "Stack home vs abroad customers under a grand order count.",
    template: `SELECT CASE WHEN {1} THEN {2} ELSE 'abroad' END AS scope, COUNT(*) AS n
FROM customers
GROUP BY scope
{3}
SELECT 'orders', COUNT(*)
FROM orders;`,
    slots: [
      {
        answer: "region = 'EU'",
        kind: "keyword",
        label: "the home test",
        why: "Eight EU customers count as home; the other eight fall abroad.",
      },
      {
        answer: "'home'",
        kind: "keyword",
        label: "the home label",
        why: "The printed scope for the EU bucket — eight of sixteen.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The two scope rows and the grand row append cleanly.",
      },
    ],
    distractors: ["region = 'US'", "'local'", "EXCEPT"],
    walkthrough:
      "Three rows: home 8, abroad 8, orders 103. The CASE splits the roster exactly in half — a coincidence of the seed data that makes the line readable as a see-saw. Repoint the home test at the US and home collapses to 2 while abroad swallows 14; the see-saw tips and the line tells a different story. EXCEPT would subtract the orders row from the customer rows — different shapes never match, so the grand row would simply vanish.",
  },
  {
    id: "cs-877",
    tier: "medium",
    topic: "s8",
    universe: "growth",
    title: "The three-way money stack",
    brief:
      "From: Growth lead. Re: the outcome ledger.\n\nThe outcome ledger stacks three CASE-pivoted arms — won, lost, in-flight — each summing its own slice of the book. Three rows that reconcile to the full 34,833.28.",
    ask: "Stack won, lost and in-flight order money as three arms.",
    template: `SELECT 'won' AS k, ROUND(SUM(CASE WHEN {1} THEN total ELSE 0 END), 2) AS money
FROM orders
UNION ALL
SELECT 'lost', ROUND(SUM(CASE WHEN {2} THEN total ELSE 0 END), 2)
FROM orders
UNION ALL
SELECT 'in-flight', ROUND(SUM(CASE WHEN {3} THEN total ELSE 0 END), 2)
FROM orders;`,
    slots: [
      {
        answer: "status = 'delivered'",
        kind: "keyword",
        label: "arm 1's won test",
        why: "Delivered money: 15,571.07 — the stack's biggest row.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "arm 2's lost test",
        why: "Cancelled money: 1,152.49 — the leak, isolated.",
      },
      {
        answer: "status IN ('pending', 'shipped')",
        kind: "keyword",
        label: "arm 3's in-flight test",
        why: "Pending plus shipped: 18,109.72 — money still moving.",
      },
    ],
    distractors: ["status = 'shipped'", "status = 'void'", "status = 'pending'"],
    walkthrough:
      "Three rows: won 15,571.07, lost 1,152.49, in-flight 18,109.72 — and the three arms sum to 34,833.28 exactly. Each arm is a single-branch CASE paying only its own statuses, so the IN list is what keeps in-flight honest: delivered alone would understate it by 9,980.76. Swap arm 2 to 'void' — a status orders never carry — and lost prints 0.00 while the cancelled money vanishes from all three rows. Swap arm 3 to pending only and in-flight loses every shipped dollar.",
  },
  {
    id: "cs-878",
    tier: "medium",
    topic: "s8",
    universe: "catalog",
    title: "The gap between the shelves",
    brief:
      "From: Warehouse lead. Re: the assortment gap memo.\n\nThe gap memo bands only the extremes — products under 50 and products at 100 up — leaving the 50-to-99 middle deliberately unshelved. The CASE labels budget; the WHERE does the excluding.",
    ask: "Band the extreme price shelves and expose the unshelved middle.",
    template: `SELECT CASE WHEN {1} THEN 'budget' ELSE {2} END AS band, COUNT(*) AS n
FROM products
WHERE {3}
GROUP BY band;`,
    slots: [
      {
        answer: "price < 50",
        kind: "keyword",
        label: "the budget test",
        why: "Eight products sit under 50 — the memo's budget shelf.",
      },
      {
        answer: "'premium-ish'",
        kind: "keyword",
        label: "the premium-ish label",
        why: "The ELSE arm's hedge: four products at 100 up, none truly premium.",
      },
      {
        answer: "price < 50 OR price >= 100",
        kind: "keyword",
        label: "the extreme-shelf filter",
        why: "The OR excludes the 50-to-99 middle — four products go unshelved on purpose.",
      },
    ],
    distractors: ["price >= 100", "price > 200", "'high-end'"],
    walkthrough:
      "Two rows: budget 8, premium-ish 4 — twelve of sixteen products, with the four 50-to-99 items (the keyboard at 89.99, the speaker, the band, the jersey) visible only by their absence. The WHERE's OR is the memo's mechanism: WHERE alone with price >= 100 would drop the budget shelf entirely and print one lonely row. Push the premium test past 200 and premium-ish empties — the hedge label was honest: nothing here is truly premium.",
  },
  {
    id: "cs-879",
    tier: "medium",
    topic: "s8",
    universe: "expense",
    title: "Fixed and variable, stacked",
    brief:
      "From: Finance partner. Re: the cost-behavior ledger.\n\nThe cost-behavior ledger stacks fixed spend (rent plus tools) over variable spend (ads plus travel), each arm a CASE over its own IN list. Two rows that sum to every dollar filed.",
    ask: "Stack fixed vs variable expense money as CASE-filtered arms.",
    template: `SELECT {1} AS k,
       ROUND(SUM(CASE WHEN category IN ('Rent', 'Tools') THEN amount_cents ELSE 0 END)/100.0, 2) AS money
FROM expenses
{3}
SELECT 'variable', ROUND(SUM(CASE WHEN {2} THEN amount_cents ELSE 0 END)/100.0, 2)
FROM expenses;`,
    slots: [
      {
        answer: "'fixed'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Rent 16,800.00 plus tools 1,525.00: fixed prints 18,325.00.",
      },
      {
        answer: "category IN ('Ads', 'Travel')",
        kind: "keyword",
        label: "arm 2's variable test",
        why: "Ads 4,570.00 plus travel 2,521.00: variable prints 7,091.00.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The two behavior rows append; their IN lists never overlap.",
      },
    ],
    distractors: ["category = 'Rent'", "EXCEPT", "category = 'Ads'"],
    walkthrough:
      "Two rows: fixed 18,325.00, variable 7,091.00 — 25,416.00 of spend classified. The mirrored IN lists are the contract: rent and tools never appear in arm 2, ads and travel never in arm 1, so every dollar lands exactly once. Shrink arm 2's list to ads alone and variable drops to 4,570.00 — 2,521.00 of travel money falls out of both rows and the ledger stops reconciling. EXCEPT would compare a fixed row against a variable row and return nothing.",
  },
  {
    id: "cs-880",
    tier: "medium",
    topic: "s8",
    universe: "fraud",
    title: "Money in, money due, money spent",
    brief:
      "From: Fraud analyst. Re: the flow page.\n\nThe flow page stacks CASE-bucketed invoice money — settled against outstanding — over one expense row. Three rows showing where money went, is, and left.",
    ask: "Stack paid-bucketed invoices over a labeled expense row.",
    template: `SELECT CASE WHEN status = {1} THEN 'money-in' ELSE 'money-due' END AS bucket,
       COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS money
FROM invoices
GROUP BY bucket
{2}
SELECT {3}, COUNT(*), ROUND(SUM(amount_cents)/100.0, 2)
FROM expenses;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled test",
        why: "21 paid invoices print money-in: 66,443.00.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Invoice buckets and the expense row append as three lines.",
      },
      {
        answer: "'expenses'",
        kind: "keyword",
        label: "arm 2's label",
        why: "36 filings worth 25,416.00 — the money that left.",
      },
    ],
    distractors: ["status = 'void'", "EXCEPT", "'vendors'"],
    walkthrough:
      "Three rows: money-in 21 / 66,443.00, money-due 7 / 20,534.00, expenses 36 / 25,416.00. The CASE bucket folds open and void into money-due — the page's one deliberate simplification — while the stacked arm keeps spend visible beside it. Test for 'void' and money-in collapses to the single 925.00 invoice while 66,443.00 of settled money disappears from the page. EXCEPT would return invoice rows only, and the flow page loses its third line — the one that shows money leaving.",
  },
  {
    id: "cs-881",
    tier: "medium",
    topic: "s8",
    universe: "growth",
    title: "The regions and their total",
    brief:
      "From: Growth lead. Re: the delivered-money grid.\n\nThe grid stacks four CASE-pivoted region rows over one grand total row — the total computed with the same CASE, so the arithmetic reconciles in plain sight.",
    ask: "Stack delivered money per region under a CASE-computed grand total.",
    template: `SELECT c.region AS k,
       ROUND(SUM(CASE WHEN {1} THEN o.total ELSE 0 END), 2) AS delivered_money
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
{2}
SELECT {3}, ROUND(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 2)
FROM orders;`,
    slots: [
      {
        answer: "o.status = 'delivered'",
        kind: "keyword",
        label: "the delivered test",
        why: "Per-region delivered money: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Four region rows and the grand row append as one grid.",
      },
      {
        answer: "'total'",
        kind: "keyword",
        label: "the grand label",
        why: "The stacked arm re-runs the same CASE over all orders: 15,571.07.",
      },
    ],
    distractors: ["o.status = 'shipped'", "EXCEPT", "'grand'"],
    walkthrough:
      "Five rows: EU 6,656.18, APAC 6,617.68, US 1,444.77, LATAM 852.44, total 15,571.07 — and the four regions sum to the fifth. The capstone trick is running the identical CASE in both the grouped arm and the stacked arm: change one test and not the other, and the grid stops reconciling visibly. Repoint the test at shipped and every row changes together — still honest, a different story. EXCEPT would keep the region rows and drop the total, leaving the grid with nothing to reconcile against.",
  },
  {
    id: "cs-882",
    tier: "medium",
    topic: "s8",
    universe: "supplier",
    title: "The EU shelf and the star bench",
    brief:
      "From: Sourcing lead. Re: the dual-count page.\n\nThe dual-count page stacks European product supply over a CASE-guarded star-supplier count. The star row's label prints only because the bench has the two suppliers it claims.",
    ask: "Stack EU-sourced product count over the CASE-guarded star count.",
    template: `SELECT {1} AS k, COUNT(*) AS n
FROM products p JOIN suppliers s ON {2}
WHERE s.region = 'EU'
{3}
SELECT CASE WHEN COUNT(*) >= 2 THEN 'star_suppliers' END, COUNT(*)
FROM suppliers
WHERE rating >= 4.5;`,
    slots: [
      {
        answer: "'eu_products'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Five products source from the two EU suppliers.",
      },
      {
        answer: "s.id = p.supplier_id",
        kind: "keyword",
        label: "the join key",
        why: "The foreign key carries each product to its supplier's region.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Supply rows and the bench row append as one page.",
      },
    ],
    distractors: ["s.id = p.id", "EXCEPT", "COUNT(*) > 2"],
    walkthrough:
      "Two rows: eu_products 5, star_suppliers 2. Arm 1 joins products to suppliers and filters Europe; arm 2's CASE guards the bench label — two star suppliers exist, so the label prints, and the guard would print NULL on a bench of one. Joining on s.id = p.id matches a supplier id to a product id — unrelated id spaces — and the count collapses to 2, indistinguishable from the bench row by accident. EXCEPT would drop the bench row entirely: two counts, no comparison.",
  },
  {
    id: "cs-883",
    tier: "medium",
    topic: "s8",
    universe: "catalog",
    title: "Bands and categories, stacked",
    brief:
      "From: Warehouse lead. Re: the shape page.\n\nThe shape page stacks the catalog's three price bands over a category census row — the bands from a CASE ladder, the census from a single COUNT DISTINCT.",
    ask: "Stack CASE price bands over a distinct-category count.",
    template: `SELECT CASE WHEN price < 50 THEN 'budget' WHEN {1} THEN 'standard' ELSE 'premium' END AS band,
       COUNT(*) AS n
FROM products
GROUP BY band
{2}
SELECT 'categories', COUNT(DISTINCT category) AS n
FROM {3};`,
    slots: [
      {
        answer: "price <= 200",
        kind: "keyword",
        label: "the standard ceiling",
        why: "Prices 50 to 200 fill standard: eight products.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Band rows and the census row append as one shape page.",
      },
      {
        answer: "products",
        kind: "keyword",
        label: "arm 2's table",
        why: "Seven distinct categories across the same sixteen products.",
      },
    ],
    distractors: ["price <= 150", "EXCEPT", "COUNT(category)"],
    walkthrough:
      "Four rows: budget 8, premium 0, standard 8, categories 7 — the ghost premium band riding beside a census that says the assortment spreads across seven categories. Tightening standard's ceiling to 150 pushes the 199.99 watch into premium and manufactures a band the shop does not serve. COUNT(category) instead of COUNT(DISTINCT category) prints 16 — every product counted, none grouped — and the census row stops being a census. EXCEPT would drop the census and leave the bands with no shape summary.",
  },
  {
    id: "cs-884",
    tier: "medium",
    topic: "s8",
    universe: "inventory",
    title: "Lanes and the grand total",
    brief:
      "From: Ops lead. Re: the dock lane page.\n\nThe lane page stacks two CASE-labeled dock lanes — waiting versus moving — under one grand row. Each lane carries count and money, and the grand row reconciles both columns.",
    ask: "Stack waiting/moving lanes with count and money under a grand row.",
    template: `SELECT CASE WHEN {1} THEN 'waiting' ELSE 'moving' END AS lane,
       COUNT(*) AS n, ROUND(SUM({3}), 2) AS money
FROM orders
GROUP BY lane
{2}
SELECT 'grand', COUNT(*), ROUND(SUM(total), 2)
FROM orders;`,
    slots: [
      {
        answer: "shipped_at IS NULL",
        kind: "keyword",
        label: "the waiting test",
        why: "21 unstamped orders wait: 7,265.49 parked on the dock.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Two lanes and the grand row append; all three carry both columns.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the lane money column",
        why: "Waiting 7,265.49, moving 27,567.79 — grand 34,833.28 reconciles.",
      },
    ],
    distractors: ["shipped_at IS NOT NULL", "EXCEPT", "SUM(id)"],
    walkthrough:
      "Three rows: waiting 21 / 7,265.49, moving 82 / 27,567.79, grand 103 / 34,833.28 — both columns reconcile. The waiting test is the page's load-bearing wall: flip it to IS NOT NULL and the lanes swap names while every number stays in play, a page that reads backwards. The money column must be total — a SUM(id) fill dies in the audit, and even if it ran it would print ids where dollars belong. EXCEPT would keep the lanes and drop the grand row, ending the reconciliation.",
  },
  {
    id: "cs-885",
    tier: "medium",
    topic: "s8",
    universe: "funnel",
    title: "The queue lanes and the whole",
    brief:
      "From: Funnel analyst. Re: the lifecycle page.\n\nThe lifecycle page CASE-bands every order into fulfilled, queue or dropped, then stacks a grand row underneath. Four rows, no order unclassified.",
    ask: "Stack CASE lifecycle lanes under a grand total row.",
    template: `SELECT CASE WHEN {1} THEN 'fulfilled' WHEN status = 'pending' THEN {2} {3} END AS lane,
       COUNT(*) AS n
FROM orders
GROUP BY lane
UNION ALL
SELECT 'grand', COUNT(*)
FROM orders;`,
    slots: [
      {
        answer: "status IN ('delivered', 'shipped')",
        kind: "keyword",
        label: "the fulfilled test",
        why: "Delivered plus shipped: 82 orders print fulfilled.",
      },
      {
        answer: "'queue'",
        kind: "keyword",
        label: "the queue label",
        why: "Pending orders print queue: 14 rows waiting.",
      },
      {
        answer: "ELSE 'dropped'",
        kind: "keyword",
        label: "the default lane",
        why: "The ELSE catches cancelled: 7 orders print dropped.",
      },
    ],
    distractors: ["status = 'delivered'", "'wait'", "ELSE 'lost'"],
    walkthrough:
      "Four rows: fulfilled 82, queue 14, dropped 7, grand 103 — and 82 + 14 + 7 closes against the grand row. The three-branch CASE is exhaustive: the ELSE arm guarantees no order escapes classification, which is what makes the grand row a check rather than a decoration. Shrink the fulfilled test to delivered alone and shipped orders — thirty of them — fall through to dropped, mislabeling a third of the book. The lane label is data, so renaming it just renames the story.",
  },
  {
    id: "cs-886",
    tier: "medium",
    topic: "s8",
    universe: "fraud",
    title: "Heavy tails, stacked",
    brief:
      "From: Fraud analyst. Re: the tail page.\n\nThe tail page stacks the pending queue's heavy tail (CASE-summed at the 400 line) over the cancelled pile's plain total. One arm branches, one arm doesn't — the contrast is the point.",
    ask: "Stack pending heavy-tail money over cancelled total money.",
    template: `SELECT {1} AS k, COUNT(*) AS n,
       ROUND(SUM(CASE WHEN total >= {2} THEN total ELSE 0 END), 2) AS big_money
FROM orders
WHERE status = 'pending'
{3}
SELECT 'cancelled', COUNT(*), ROUND(SUM(total), 2)
FROM orders
WHERE status = 'cancelled';`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 1's label",
        why: "The queue: 14 pending orders, five of them heavy.",
      },
      {
        answer: "400",
        kind: "keyword",
        label: "the tail threshold",
        why: "The 400 line isolates five heavy pendings worth 3,921.32.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The pending and cancelled rows append with aligned columns.",
      },
    ],
    distractors: ["'shipped'", "700", "INTERSECT"],
    walkthrough:
      "Two rows: pending 14 / 3,921.32, cancelled 7 / 1,152.49. Arm 1's CASE sums only the 400-plus tail — 2,191.68 of routine pendings stay invisible to big_money; arm 2 sums everything because cancelled orders are all worth seeing. Raise the threshold to 700 and the tail shrinks to three orders worth 2,758.99 — two heavy pendings demote silently. The label 'shipped' would misname the queue while its WHERE still filtered for pending; INTERSECT between the two arms returns nothing.",
  },
  {
    id: "cs-887",
    tier: "medium",
    topic: "s8",
    universe: "month-close",
    title: "The new year against the book",
    brief:
      "From: Controller. Re: the aging snapshot.\n\nThe aging snapshot stacks the 2025 slice — five invoices, CASE-summed paid money — under the all-time row. The young year's thin paid column is the page's warning.",
    ask: "Stack 2025 invoice aging under the all-time row.",
    template: `SELECT {1} AS k, COUNT(*) AS n,
       ROUND(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)/100.0, 2) AS paid_money
FROM invoices
WHERE {2}
{3}
SELECT 'all_time', COUNT(*), ROUND(SUM(CASE WHEN status = 'paid' THEN amount_cents ELSE 0 END)/100.0, 2)
FROM invoices;`,
    slots: [
      {
        answer: "'q1_2025'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Five 2025 invoices — the young slice the close watches.",
      },
      {
        answer: "issued_on >= '2025-01-01'",
        kind: "keyword",
        label: "the year gate",
        why: "The gate slices 2025 from the 28-invoice book.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The year slice and the all-time row append, same columns.",
      },
    ],
    distractors: ["issued_on >= '2025-02-01'", "INTERSECT", "status = 'open'"],
    walkthrough:
      "Two rows: q1_2025 5 / 1,756.00, all_time 28 / 66,443.00. The identical CASE in both arms keeps the comparison honest — one collects 2025's paid money, the other the book's. Slide the gate to February and the slice shrinks to three invoices, paid money 300.00: the warning sharpens. Gate the slice on status = 'open' instead and paid_money prints 0.00 — true, but the page would compare an open slice against a full book and call it aging. INTERSECT would drop the all-time row and end the comparison.",
  },
  {
    id: "cs-888",
    tier: "hard",
    topic: "s8",
    universe: "growth",
    title: "The regions and the ALL row",
    brief:
      "From: Growth lead. Re: the fulfillment grid.\n\nThe grid stacks four CASE-pivoted region rows — delivered against waiting — under one ALL row computed with the same branches. The ALL row is the grid's own checksum.",
    ask: "Stack delivered/waiting per region under an ALL checksum row.",
    template: `SELECT c.region,
       SUM(CASE WHEN {1} THEN 1 ELSE 0 END) AS delivered,
       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS waiting
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region
{2}
SELECT {3}, SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END),
       SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END)
FROM orders;`,
    slots: [
      {
        answer: "o.status = 'delivered'",
        kind: "keyword",
        label: "the delivered branch",
        why: "Per region: APAC 21, EU 24, LATAM 2, US 5 — and ALL 52.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Four region rows and the ALL row append, columns aligned.",
      },
      {
        answer: "'ALL'",
        kind: "keyword",
        label: "the checksum label",
        why: "The ALL row re-runs both branches ungrouped: 52 delivered, 14 waiting.",
      },
    ],
    distractors: ["o.status = 'shipped'", "'shipped'", "EXCEPT"],
    walkthrough:
      "Five rows: APAC 21/5, EU 24/6, LATAM 2/0, US 5/3, ALL 52/14 — and each ALL column is the sum of the four regions above it. The identical CASE branches in every arm make the checksum work: repoint the grouped branch at shipped without touching the ALL row and 21 becomes 29 in APAC while ALL still says 52 — the grid announces its own inconsistency. 'ALL' is not a region value, so the stacked arm can never collide with a grouped one. EXCEPT would drop the checksum and leave the grid uncheckable.",
  },
  {
    id: "cs-889",
    tier: "hard",
    topic: "s8",
    universe: "pricing",
    title: "The band ladder and the book",
    brief:
      "From: Pricing analyst. Re: the ladder page.\n\nThe ladder page CASE-bands every order A through D, stacks the counts, then appends the full book as one row. Five rows where the bands sum to the book — when the ladder is exhaustive.",
    ask: "Stack A/B/C/D band counts under the full-book row.",
    template: `SELECT CASE WHEN total >= 1000 THEN 'A' WHEN {1} THEN 'B' WHEN {2} THEN 'C' ELSE 'D' END AS band,
       COUNT(*) AS n
FROM orders
GROUP BY band
{3}
SELECT 'orders', COUNT(*)
FROM orders;`,
    slots: [
      {
        answer: "total >= 400",
        kind: "keyword",
        label: "band B's threshold",
        why: "33 orders between 400 and 999.99 print B.",
      },
      {
        answer: "total >= 100",
        kind: "keyword",
        label: "band C's threshold",
        why: "54 orders between 100 and 399.99 print C.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Four band rows and the book row append as one ladder.",
      },
    ],
    distractors: ["total >= 900", "total >= 500", "EXCEPT"],
    walkthrough:
      "Five rows: A 1, B 33, C 54, D 15, orders 103 — and 1 + 33 + 54 + 15 closes against the book row. The descending thresholds are the ladder's spine: B fires only when A failed, C only when B failed, and ELSE sweeps the remaining 15 into D. Raise B's line to 900 and the 945.21 order migrates to B while A keeps its single tenant — two rows move, the checksum still closes. EXCEPT would drop the book row, and a ladder without its checksum is just a histogram.",
  },
  {
    id: "cs-890",
    tier: "hard",
    topic: "s8",
    universe: "fraud",
    title: "The watchlist verdict",
    brief:
      "From: Fraud analyst. Re: the watchlist probe.\n\nThe probe intersects pending customers with big-ticket customers, then renders a CASE verdict on the count: five or more distinct names means the watchlist ships to the desk.",
    ask: "Verdict the pending-and-big-ticket customer count for the watchlist.",
    template: `SELECT CASE WHEN {3} THEN 'watchlist' ELSE 'calm' END AS verdict, COUNT(*) AS n
FROM (
  SELECT customer_id FROM orders WHERE status = {1}
  {2}
  SELECT customer_id FROM orders WHERE total >= 400
);`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the queue side",
        why: "The pending arm feeds the intersection — 8 distinct customers.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "INTERSECT keeps customers appearing on both sides: 7 survive.",
      },
      {
        answer: "COUNT(*) >= 5",
        kind: "keyword",
        label: "the verdict threshold",
        why: "Seven names clear the five-name bar — the verdict prints watchlist.",
      },
    ],
    distractors: ["status = 'cancelled'", "UNION", "COUNT(*) >= 8"],
    walkthrough:
      "One row: watchlist 7. The probe is a set operation wrapped in a verdict: INTERSECT reduces two customer lists to their overlap, DISTINCT semantics collapse duplicates, and the CASE turns the count into a decision. UNION would widen the probe to the combined pool — more names, same verdict, wrong evidence. Ask for eight names and the verdict flips to calm while the same seven customers stay on the page. Cancelled customers never overlap the 400 club — not one cancelled order cleared the line — so that fill prints calm 0.",
  },
  {
    id: "cs-891",
    tier: "hard",
    topic: "s8",
    universe: "month-close",
    title: "Paid-only and the overlap",
    brief:
      "From: Controller. Re: the payment behavior probe.\n\nThe probe runs two customer-set derivations — paid-but-never-open, and paid-AND-open — and stacks them. Five customers settled without ever stalling; three did both.",
    ask: "Stack paid-only customers over the paid-and-open overlap.",
    template: `SELECT 'paid_only' AS k, COUNT(*) AS n
FROM (
  SELECT customer_id FROM invoices WHERE status = 'paid'
  {1}
  SELECT customer_id FROM invoices WHERE status = 'open'
)
{3}
SELECT CASE WHEN COUNT(*) > 0 THEN 'overlap' END, COUNT(*)
FROM (
  SELECT customer_id FROM invoices WHERE status = 'paid'
  {2}
  SELECT customer_id FROM invoices WHERE status = 'open'
);`,
    slots: [
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the subtraction operator",
        why: "Paid minus open: five customers settled without ever stalling.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the overlap operator",
        why: "Paid AND open: three customers did both — the stall-and-recover club.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The two derivation rows append under distinct labels.",
      },
    ],
    distractors: ["MINUS", "'void'", "HAVING"],
    walkthrough:
      "Two rows: paid_only 5, overlap 3. The pair teaches the operator choice: EXCEPT answers who paid cleanly, INTERSECT answers who stalled and recovered — same two lists, two different questions. The stacked arm's CASE guard prints overlap only because the count is nonzero; an empty intersection would print NULL rather than assert a club that does not exist. MINUS is not SQLite — the fill errors and the probe dies loudly, which is preferable to silently running the wrong subtraction.",
  },
  {
    id: "cs-892",
    tier: "hard",
    topic: "s8",
    universe: "pricing",
    title: "The wide-net verdict",
    brief:
      "From: Pricing analyst. Re: the big-ticket census.\n\nThe census derives the big-ticket order set (400 up, minus cancellations) and renders a CASE verdict: over thirty survivors means the big-ticket program is wide, not tight.",
    ask: "Verdict the big-ticket-minus-cancelled order count.",
    template: `SELECT CASE WHEN COUNT(*) > 30 THEN 'wide' ELSE 'tight' END AS verdict, COUNT(*) AS n
FROM (
  SELECT id FROM orders WHERE total >= {1}
  {2}
  SELECT id FROM orders WHERE {3}
);`,
    slots: [
      {
        answer: "400",
        kind: "keyword",
        label: "the big-ticket line",
        why: "The 400-dollar line: 34 orders sit at or above it.",
      },
      {
        answer: "EXCEPT",
        kind: "keyword",
        label: "the survival operator",
        why: "EXCEPT removes the cancelled: none of the big orders died, so 34 survive.",
      },
      {
        answer: "status = 'cancelled'",
        kind: "keyword",
        label: "the subtracted side",
        why: "The cancelled set — seven orders, none big enough to intersect.",
      },
    ],
    distractors: ["500", "INTERSECT", "status = 'delivered'"],
    walkthrough:
      "One row: wide 34. The derivation is the lesson: EXCEPT subtracts the cancelled set from the big-ticket set — and because no cancelled order ever cleared 400, nothing is actually removed, which the verdict proof makes visible. Raise the line to 500 and the pool drops to 25: the verdict flips to tight, the program's story changes on one threshold. INTERSECT would ask the opposite question — big AND cancelled — and print tight 0. Subtracting the delivered set would keep 25 of the 34 and print tight, a verdict built on the wrong subtraction.",
  },
  {
    id: "cs-893",
    tier: "hard",
    topic: "s8",
    universe: "inventory",
    title: "The treasury page and its grand row",
    brief:
      "From: Finance partner. Re: the 2025 treasury page.\n\nThe page pivots card and wire dollars for 2025's months, then stacks a grand row computed with the same branches. Two months, one checksum, rails that must reconcile.",
    ask: "Stack 2025 card/wire months under a same-CASE grand row.",
    template: `SELECT substr(paid_on, 1, 7) AS m,
       ROUND(SUM(CASE WHEN method = {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS card,
       ROUND(SUM(CASE WHEN method = 'wire' THEN amount_cents ELSE 0 END)/100.0, 2) AS wire
FROM payments
WHERE substr(paid_on, 1, 7) >= {2}
GROUP BY m
{3}
SELECT 'grand', ROUND(SUM(CASE WHEN method = 'card' THEN amount_cents ELSE 0 END)/100.0, 2),
       ROUND(SUM(CASE WHEN method = 'wire' THEN amount_cents ELSE 0 END)/100.0, 2)
FROM payments;`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "the card branch",
        why: "2025 card months: 3,647.50 then 3,076.00 — grand 37,364.00.",
      },
      {
        answer: "'2025-01'",
        kind: "keyword",
        label: "the year gate",
        why: "The gate keeps 2025's two months on the page.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Month rows and the grand row append, branches identical.",
      },
    ],
    distractors: ["method = 'wire'", "substr(paid_on, 1, 7) >= '2025-02'", "EXCEPT"],
    walkthrough:
      "Three rows: 2025-01 card 3,647.50 / wire 2,229.50, 2025-02 3,076.00 / 4,000.00, grand 37,364.00 / 32,248.00. The grand row does NOT reconcile against the two months — by design: it sums all fourteen months of history, and the gap between page and grand is the pre-2025 past the page chose not to show. Swap the card branch for wire and every column inverts while the grand row stays put — the checksum catches it instantly. EXCEPT would drop the grand row and end the argument.",
  },
  {
    id: "cs-894",
    tier: "hard",
    topic: "s8",
    universe: "expense",
    title: "Rent, ads, and everything",
    brief:
      "From: Finance partner. Re: the category spotlight.\n\nThe spotlight stacks rent and ads — the two loud categories — under an everything row. Both arms CASE-sum their own slice; the third arm refuses to branch at all.",
    ask: "Stack rent and ads money under an unbranched everything row.",
    template: `SELECT {1} AS k,
       ROUND(SUM(CASE WHEN category = 'Rent' THEN amount_cents ELSE 0 END)/100.0, 2) AS money
FROM expenses
{3}
SELECT 'ads', ROUND(SUM(CASE WHEN category = {2} THEN amount_cents ELSE 0 END)/100.0, 2)
FROM expenses
UNION ALL
SELECT 'everything', ROUND(SUM(amount_cents)/100.0, 2)
FROM expenses;`,
    slots: [
      {
        answer: "'rent'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Rent prints 16,800.00 — fourteen identical filings.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "arm 2's CASE test",
        why: "Ads print 4,570.00 — the climbing category.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Spotlight rows and the everything row append as one page.",
      },
    ],
    distractors: ["category = 'Tools'", "category = 'Travel'", "EXCEPT"],
    walkthrough:
      "Three rows: rent 16,800.00, ads 4,570.00, everything 25,416.00 — and the spotlight's two arms account for 21,370.00 of it, leaving 4,046.00 of tools and travel unspoken. The everything arm's plain SUM is the contrast: no CASE, no branch, the whole book in one number. Point arm 2's test at Tools and the ads row prints 1,525.00 — a spotlight on the wrong fixture. EXCEPT between arms of different shapes returns nothing and the page loses its rows.",
  },
  {
    id: "cs-895",
    tier: "hard",
    topic: "s8",
    universe: "growth",
    title: "The retention grid and the book",
    brief:
      "From: Growth lead. Re: the churn money page.\n\nThe page CASE-bands order money by account state — live against churned — then stacks the full book underneath. Six orders on dead accounts, priced and visible.",
    ask: "Stack live/churned order money under the full-book row.",
    template: `SELECT CASE WHEN {1} THEN 'live' ELSE 'churned' END AS state,
       COUNT(*) AS n, ROUND(SUM(o.total), 2) AS money
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY state
{2}
SELECT {3}, COUNT(*), ROUND(SUM(total), 2)
FROM orders;`,
    slots: [
      {
        answer: "c.active = 1",
        kind: "keyword",
        label: "the live test",
        why: "Live accounts: 97 orders worth 33,135.42 of the book.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The state rows and the book row append, columns aligned.",
      },
      {
        answer: "'all_orders'",
        kind: "keyword",
        label: "the book row's label",
        why: "The ungrouped arm: 103 orders, 34,833.28.",
      },
    ],
    distractors: ["c.active = 0", "EXCEPT", "'grand'"],
    walkthrough:
      "Three rows: live 97 / 33,135.42, churned 6 / 1,697.86, all_orders 103 / 34,833.28 — both columns reconcile. The flip test matters: c.active = 0 swaps the two state rows' populations while the book row stays put, and the checksum catches it. The join is doing double duty — bringing the flag to each order — and a wrong key scrambles which orders look churned. EXCEPT would keep the state rows and drop the book, ending the page's self-check.",
  },
  {
    id: "cs-896",
    tier: "hard",
    topic: "s8",
    universe: "supplier",
    title: "The bench, the crew, the catalog",
    brief:
      "From: Sourcing lead. Re: the premium sourcing page.\n\nThe page CASE-bands suppliers star or crew, pivots product and premium counts per tier, then stacks the whole catalog as one row. The star tier owns every premium product — and the page proves it.",
    ask: "Stack star/crew product-and-premium counts under the catalog row.",
    template: `SELECT CASE WHEN {1} THEN 'star' ELSE 'crew' END AS tier,
       COUNT(p.id) AS products, SUM(CASE WHEN p.price >= 100 THEN 1 ELSE 0 END) AS pricey
FROM suppliers s LEFT JOIN products p ON {2}
GROUP BY tier
{3}
SELECT 'catalog', COUNT(*), SUM(CASE WHEN price >= 100 THEN 1 ELSE 0 END)
FROM products;`,
    slots: [
      {
        answer: "s.rating >= 4.5",
        kind: "keyword",
        label: "the star test",
        why: "Star tier: Nordic and Alpine, 5 products, all 4 premium ones.",
      },
      {
        answer: "p.supplier_id = s.id",
        kind: "keyword",
        label: "the join key",
        why: "LEFT JOIN keeps both tiers even if a supplier carried nothing.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Tier rows and the catalog row append, columns aligned.",
      },
    ],
    distractors: ["s.rating >= 4.7", "s.id", "EXCEPT"],
    walkthrough:
      "Three rows: star 5 / 3, crew 11 / 1, catalog 16 / 4 — and the tiers sum to the catalog row in both columns. The premium concentration is the page's finding: every 100-dollar product sources from a star vendor. Tighten the star line to 4.7 and Nordic's products fall to crew while the catalog row stays put — the checksum flags the edit. Joining on s.id matches a supplier id to a product id: the cross-join inflates the tiers to 32 and 64 while catalog says 16, and the page announces its own break.",
  },
  {
    id: "cs-897",
    tier: "hard",
    topic: "s8",
    universe: "funnel",
    title: "The lanes and the queue total",
    brief:
      "From: Funnel analyst. Re: the collections page.\n\nThe page CASE-bands the pending queue into priority and standard lanes with money per lane, then stacks the whole queue underneath. Three rows where the lanes reconcile to the queue.",
    ask: "Stack priority/standard lanes under the full pending-queue row.",
    template: `SELECT CASE WHEN total >= {1} THEN 'priority' ELSE 'standard' END AS lane,
       COUNT(*) AS n, ROUND(SUM(total), 2) AS money
FROM orders
WHERE status = 'pending'
GROUP BY lane
{3}
SELECT {2}, COUNT(*), ROUND(SUM(total), 2)
FROM orders
WHERE status = 'pending';`,
    slots: [
      {
        answer: "400",
        kind: "keyword",
        label: "the priority line",
        why: "Five pendings clear 400: 3,921.32 against the standard lane's 2,191.68.",
      },
      {
        answer: "'all_pending'",
        kind: "keyword",
        label: "the queue row's label",
        why: "The ungrouped arm: 14 orders, 6,113.00 — the whole queue.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Two lanes and the queue row append, columns aligned.",
      },
    ],
    distractors: ["700", "EXCEPT", "'grand'"],
    walkthrough:
      "Three rows: priority 5 / 3,921.32, standard 9 / 2,191.68, all_pending 14 / 6,113.00 — both columns close. The 400 line is the desk's real workflow: five names to chase first, worth nearly two-thirds of the queue's money. Raise the line to 700 and two pendings demote to standard while the queue row holds at 14 / 6,113.00 — the lanes shift inside a fixed total, which is exactly what the checksum is for. EXCEPT would drop the queue row and the lanes would reconcile against nothing.",
  },
  {
    id: "cs-898",
    tier: "hard",
    topic: "s8",
    universe: "month-close",
    title: "The AR page and its ledger",
    brief:
      "From: Controller. Re: the receivables page.\n\nThe page CASE-splits receivable entries into billed and settled sides, then stacks the whole account as one row. Twenty-six entries, two sides, one ledger — reconciled in three rows.",
    ask: "Stack billed/settled AR sides under the full account row.",
    template: `SELECT CASE WHEN {1} THEN 'billed' ELSE 'settled' END AS side,
       COUNT(*) AS n, ROUND(SUM(debit_cents + credit_cents)/100.0, 2) AS flow
FROM ledger_entries
WHERE account = 'accounts_receivable'
GROUP BY side
{3}
SELECT {2}, COUNT(*), ROUND(SUM(debit_cents + credit_cents)/100.0, 2)
FROM ledger_entries
WHERE account = 'accounts_receivable';`,
    slots: [
      {
        answer: "debit_cents > 0",
        kind: "keyword",
        label: "the billed test",
        why: "Thirteen debit entries billed 860.52 of invoices.",
      },
      {
        answer: "'entries'",
        kind: "keyword",
        label: "the ledger row's label",
        why: "The ungrouped arm: 26 entries, 1,556.64 total flow.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "The two sides and the ledger row append, columns aligned.",
      },
    ],
    distractors: ["debit_cents < 0", "EXCEPT", "'grand'"],
    walkthrough:
      "Three rows: billed 13 / 860.52, settled 13 / 696.12, entries 26 / 1,556.64 — counts and flows both reconcile. The side test reads the entry's sign: debits are invoices raised, credits are cash received, and the flow column sums both sides' cents because each entry carries money on exactly one side. Flip the test to debit_cents < 0 and every entry settles — billed vanishes and the page claims no invoices were ever raised. EXCEPT would drop the ledger row and the page would lose its arithmetic.",
  },
  {
    id: "cs-899",
    tier: "hard",
    topic: "s8",
    universe: "fraud",
    title: "The stuck-queue verdict",
    brief:
      "From: Fraud analyst. Re: the stuck-queue probe.\n\nThe probe intersects pending customers with unshipped customers — a set operation that should return everyone pending — and renders a CASE verdict: five or more stuck names ships the page to ops.",
    ask: "Verdict the pending-and-unshipped customer count.",
    template: `SELECT CASE WHEN {3} THEN 'watchlist' ELSE 'calm' END AS verdict, COUNT(*) AS n
FROM (
  SELECT customer_id FROM orders WHERE status = {1}
  {2}
  SELECT customer_id FROM orders WHERE shipped_at IS NULL
);`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the queue side",
        why: "Every pending order is unshipped — the intersection keeps all 8 names.",
      },
      {
        answer: "INTERSECT",
        kind: "keyword",
        label: "the stuck operator",
        why: "INTERSECT demands both properties: pending AND unstamped.",
      },
      {
        answer: "COUNT(*) >= 5",
        kind: "keyword",
        label: "the verdict threshold",
        why: "Eight names clear the five-name bar — ops gets the page.",
      },
    ],
    distractors: ["status = 'cancelled'", "EXCEPT", "COUNT(*) >= 50"],
    walkthrough:
      "One row: watchlist 8. The probe formalizes an intuition: pending and unshipped should be the same set, and INTERSECT proves it — eight names, no more, no fewer. EXCEPT would ask the inverse — pending but shipped — and print calm 0, the healthy answer to a different question. Ask for fifty names and the verdict flips to calm while the same eight customers print; the threshold is policy, the intersection is evidence. Swapping the queue side to cancelled shrinks the intersection to seven names — still a watchlist, a different queue.",
  },
  {
    id: "cs-900",
    tier: "hard",
    topic: "s8",
    universe: "month-close",
    title: "The three-ledger close",
    brief:
      "From: Controller. Re: the closing page.\n\nThe close's final page stacks three ledgers in one query: delivered order money, paid invoice money, filed expense money — each arm CASE-branching only where the business rule demands it. Three rows, one page, the quarter's spine.",
    ask: "Stack delivered, paid and filed money as three labeled arms.",
    template: `SELECT {1} AS src,
       ROUND(SUM(CASE WHEN status = 'delivered' THEN total ELSE 0 END), 2) AS money
FROM orders
{3}
SELECT 'invoices', ROUND(SUM(CASE WHEN status = {2} THEN amount_cents ELSE 0 END)/100.0, 2)
FROM invoices
UNION ALL
SELECT 'expenses', ROUND(SUM(amount_cents)/100.0, 2)
FROM expenses;`,
    slots: [
      {
        answer: "'orders'",
        kind: "keyword",
        label: "arm 1's label",
        why: "Delivered order money: 15,571.07 — the revenue spine.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "arm 2's CASE test",
        why: "Paid invoice money: 66,443.00 — the cash spine.",
      },
      {
        answer: "UNION ALL",
        kind: "keyword",
        label: "the stack operator",
        why: "Three ledger arms append under distinct labels.",
      },
    ],
    distractors: ["status = 'shipped'", "status = 'open'", "EXCEPT"],
    walkthrough:
      "Three rows: orders 15,571.07, invoices 66,443.00, expenses 25,416.00. The page's discipline is which arm branches: orders CASE for delivered because in-transit money is not yet revenue; invoices CASE for paid because open bills are not yet cash; expenses branch never because filing is spending. Repoint arm 2 at open and the cash spine prints 19,609.00 — a close that understates collections by 46,834.00. EXCEPT between arms of different shapes returns nothing, and the close loses its page.",
  },
];
