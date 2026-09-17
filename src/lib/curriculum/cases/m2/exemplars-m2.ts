// Joins-deck exemplars — the quality bar for authoring Module 2 case files.
// Same memo voice and audit discipline as deck 1, but the queries cross
// foreign keys: the slot battle is now about join direction, match rules,
// ON-vs-WHERE placement and the owning-table rule. Every figure quoted in
// prose is probed live against the seed db before being written down.

import type { CaseStudy } from "../types";

export const casesExemplarsM2: CaseStudy[] = [
  {
    id: "cs-201",
    deck: 2,
    topic: "j1",
    universe: "cash",
    title: "The installment that split the ledger",
    brief:
      "From: Cash desk, daily reconciliation.\n\nThe processor's report shows order 33 as two separate card-network entries — 365.53 and 259.13 — but our orders table only knows one 624.66 ticket. Before I flag a mismatch I want our payments ledger to prove the split: pull order 33's settled payment rows with the buyer's name attached, so I can show both installments cleared and the two figures add back to the ticket.",
    ask: "Payment id, amount and method for order 33's settled payments, with the customer's name, ordered by payment id.",
    template: `SELECT {1}, {2}, p.method
FROM payments p
{3} orders o ON o.id = p.order_id
JOIN customers c ON c.id = o.customer_id
WHERE {4} = 33 AND p.status = {5}
ORDER BY p.id;`,
    slots: [
      {
        answer: "p.id",
        kind: "keyword",
        label: "the payment reference",
        why: "The processor keys on payment references, so the ledger row id comes from payments.p.id — o.id would print 33 on both lines and the reconciliation couldn't match the network's two distinct references.",
      },
      {
        answer: "p.amount",
        kind: "keyword",
        label: "the installment amount",
        why: "Each installment's value lives on its payment row: p.amount prints 365.53 then 259.13. o.total is the order's whole ticket — it would print 624.66 on both lines, which is exactly the number the split exists to explain.",
      },
      {
        answer: "JOIN",
        kind: "keyword",
        label: "the bridge to orders",
        why: "Payments carry no customer column, so the query bridges payments → orders with a plain JOIN and lets the ON clause pair each payment with the one order it belongs to.",
      },
      {
        answer: "p.order_id",
        kind: "keyword",
        label: "the order filter",
        why: "The ticket number lives in the payment's foreign key: p.order_id = 33 keeps only this order's settlements. o.customer_id = 33 or c.id = 33 would hunt for customer number 33 — nobody here — and come back empty.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the settlement filter",
        why: "Only money that actually cleared proves the split, so the status filter reads 'settled' — quoted, because it's a value. A pending or failed installment wouldn't appear on the processor's settlement file at all.",
      },
    ],
    distractors: ["o.total", "p.id", "NATURAL JOIN", "o.customer_id", "c.id", "'pending'"],
    walkthrough:
      "Order 33 is the store's teaching example of split payment: Emma Wilson's 624.66 ticket arrived as two settlements — payment 28 at 365.53 by card and payment 29 at 259.13 by wallet. The query needs two hops because payments know money but not people: p.order_id → o.id lands on the order, o.customer_id → c.id lands on the buyer, and the ticket filter p.order_id = 33 scopes everything to this one order. The column battle is the whole point: p.amount prints the two installments that add back to 624.66, while o.total would print the full ticket on both rows — true per order, wrong per payment. Ledger note for the desk: 3 orders on file paid in installments, and settled payment amounts across the store total 24,216.51 — sums must always come from the payments side, never from the order ticket repeated per row.",
  },
  {
    id: "cs-226",
    deck: 2,
    topic: "j2",
    universe: "refund-audit",
    title: "Customers the refund desk has never touched",
    brief:
      "From: Head of Support. Re: quarterly service review.\n\nBefore I present the refund numbers I want the flip side: which customers have never received a single refund on any order they placed? These are either our happiest accounts or the ones nobody called back — either way I need their names. A zero-refund list per customer, and it must include people whose orders simply never attracted a refund, not just active accounts.",
    ask: "Each customer name with zero refunds across all of their orders.",
    template: `SELECT c.name, {1}(r.id) AS refunds_received
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
{2} JOIN refunds r ON {3} = o.id
GROUP BY c.id
{4} COUNT(r.id) = 0;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the per-customer refund count",
        why: "The list asks how many refunds each customer attracted, so COUNT(r.id) tallies refund rows per customer. SUM(r.id) would add up refund id numbers — meaningless arithmetic — and after a LEFT JOIN the id count is what keeps ghost rows honest.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Customers with no refunds must still appear — with a zero. LEFT JOIN keeps every customer row and fills the missing refund side with NULL; an INNER JOIN would silently delete exactly the people the brief is asking for.",
      },
      {
        answer: "r.order_id",
        kind: "keyword",
        label: "the refund-side foreign key",
        why: "Refunds point back at orders through r.order_id, so the pairing is r.order_id = o.id. Matching c.id = o.id would compare a customer key against an order key — two unrelated counters that happen to share a name.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the group filter",
        why: "Zero is a property of the whole customer group, not of any single row, so the test belongs in HAVING. WHERE runs before groups exist and cannot even see COUNT(r.id) — it errors out.",
      },
    ],
    distractors: ["SUM", "AVG", "INNER", "CROSS", "c.id", "WHERE"],
    walkthrough:
      "The brief is a zeros list, and zeros only survive a join that preserves: two LEFT JOINs walk customer → orders → refunds, and customers whose arms never match still show up — carrying NULL where a refund id would be. That NULL is why the aggregate is COUNT(r.id) and not COUNT(*): every one of Liam O'Brien's order rows still produces a joined row, ghost-carried with NULL refund ids, and COUNT(*) would happily count those ghosts as refunds. COUNT(r.id) sees NULL and reports the honest 0. HAVING COUNT(r.id) = 0 then keeps only the untouched accounts. Run it and exactly two names come back: Hiro Tanaka and Liam O'Brien — 14 of 16 customers have attracted at least one refund this year, which reframes the 'happy accounts' theory rather sharply.",
  },
  {
    id: "cs-351",
    deck: 2,
    topic: "j7",
    universe: "cash",
    title: "The reconciliation that wouldn't tie out",
    brief:
      "From: Financial Controller. Re: processor mismatch.\n\nThe payment processor's monthly file says we collected 24,216.51 in settled money. My analyst's query — joining payments to orders and summing — comes back with a different number, and I don't sign a close with two cash figures on the desk. Rebuild the query so it measures what actually settled: sum the column the money lives in, over settled payments only, and land exactly on the processor's figure.",
    ask: "Sum of settled payment amounts, rounded to 2 decimals — must equal the processor's 24,216.51.",
    template: `SELECT ROUND(SUM({1}), 2) AS cash_collected
FROM payments p
JOIN orders o ON o.id = p.order_id
WHERE {2} = {3};`,
    slots: [
      {
        answer: "p.amount",
        kind: "keyword",
        label: "the settled money",
        why: "Cash that settled lives in payments.amount — one value per payment row, so summing it counts each settlement exactly once. o.total is the order's full ticket price and repeats once per payment row, so the three orders that paid in two installments get their total counted twice.",
      },
      {
        answer: "p.status",
        kind: "keyword",
        label: "the payment-side status",
        why: "The processor counts payment states, so the filter lands on p.status. o.status describes fulfillment — 'settled' isn't a value it can ever hold, and filtering the wrong table's column quietly empties the result.",
      },
      {
        answer: "'settled'",
        kind: "keyword",
        label: "the settled filter",
        why: "The processor only reports settled money — pending and failed payments never cleared, so they must not enter the sum. The status value needs quotes: it's a text literal, not a column.",
      },
    ],
    distractors: ["o.total", "p.id", "o.status", "p.method", "'pending'", "'delivered'"],
    walkthrough:
      "This is the fan-out trap wearing a finance badge. The join itself is fine — payments → orders on the foreign key — but the measured column decides whether the number is true. SUM(p.amount) walks the payments table itself: 77 settled rows, one number each, total 24,216.51 — the processor's figure to the cent. Swap in o.total and the join fans out: an order that paid in two installments contributes its full ticket price twice, three such orders exist, and the sum drifts to 25,131.22 without a single error being thrown. The rule the controller wants institutionalized: aggregate the column that lives on the many side you're counting — sum payments from payments, tickets from orders — and only cross the join for columns that are actually missing.",
  },
];
