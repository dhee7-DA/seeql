// Case batch S6 — Module 3 (set ops & CASE) cases cs-851…cs-900. This wave
// CLOSES the M3 case program: deck 900, topics s1–s6 at 50 each, tiers
// 300/300/300. 50 cases: 16 easy / 16 medium / 18 hard across s1 (UNION
// stacks) ×5, s2 (Stacked reports) ×7, s3 (INTERSECT) ×7, s4 (EXCEPT) ×9,
// s5 (Set chains) ×5, s6 (CASE WHEN) ×17. Every figure was probed against
// the live seed db (scripts/m3-facts-s6w.ts + m3-facts-s6w2.ts + earlier
// m3-facts-*) and is mechanically re-verified by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesS6: CaseStudy[] = [
  {
    id: "cs-851",
    tier: "easy",
    topic: "s1",
    universe: "month-close",
    title: "The balance that must agree",
    brief:
      "From: Controller. Re: the close checklist, item one.\n\nBefore anything else at month-end, the ledger has to prove itself: every debit ever posted and every credit ever posted must total the same. One stack, two labeled arms, and the close can start.",
    ask: "Stack total debits against total credits from the ledger, in dollars, credits filed first.",
    template: `SELECT 'debits' AS side, ROUND(SUM({1})/100.0, 2) AS money FROM ledger_entries
UNION ALL
SELECT 'credits', ROUND(SUM(credit_cents)/100.0, 2) FROM {2}
ORDER BY side {3};`,
    slots: [
      {
        answer: "debit_cents",
        kind: "keyword",
        label: "the debit column",
        why: "Money leaving is recorded in debit_cents — that column sums to the debit side of the trial balance.",
      },
      {
        answer: "ledger_entries",
        kind: "keyword",
        label: "arm 2's table",
        why: "Both arms read the same book — ledger_entries holds every posted debit and credit row.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "Alphabetically credits sorts before debits, so ASC files the credit line on top as asked.",
      },
    ],
    distractors: ["amount_cents", "payments", "DESC"],
    walkthrough:
      "Two arms, one table. The debit arm sums debit_cents: 18,108,000 cents, which reads 181080 dollars. The credit arm sums credit_cents and lands on exactly the same figure — the books balance, which is the entire point of double-entry. amount_cents would reach for a column the ledger does not have and the query would die, payments points at the wrong book entirely, and DESC would file debits above credits, the reverse of the requested filing order. Item one on the checklist: done.",
  },
  {
    id: "cs-852",
    tier: "easy",
    topic: "s1",
    universe: "pricing",
    title: "The bookend tickets",
    brief:
      "From: Pricing lead. Re: the refund-exposure spread.\n\nThe policy review needs the two extremes of ticket size on one slide: the smallest order we have ever taken and the largest. Stack them with labels so nobody argues about which is which.",
    ask: "Stack the minimum order total against the maximum, labeled floor and ceiling.",
    template: `SELECT 'floor' AS end, ROUND(MIN(total), 2) AS price FROM {1}
UNION ALL
SELECT 'ceiling', ROUND({2}(total), 2) FROM orders
ORDER BY end {3};`,
    slots: [
      {
        answer: "orders",
        kind: "keyword",
        label: "arm 1's table",
        why: "Ticket size lives on orders.total — the min arm reads the orders table directly.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the ceiling aggregate",
        why: "The largest ticket needs MAX; MIN is already doing the floor arm's job.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "floor sorts before ceiling alphabetically, so ASC presents the small ticket first.",
      },
    ],
    distractors: ["invoices", "SUM", "DESC"],
    walkthrough:
      "The floor arm reads orders and takes MIN(total): 25.47, the cheapest ticket in the book. The ceiling arm takes MAX(total): 1088.44, the heaviest. invoices has no total column at all, so that swap errors out; SUM would pile every order into one 34833.28 blob that is neither bookend; and DESC would flip the presentation order the memo asked for. Two labeled rows, both ends of the exposure spread, ready for the slide.",
  },
  {
    id: "cs-853",
    tier: "medium",
    topic: "s1",
    universe: "growth",
    title: "Two shelves of customers",
    brief:
      "From: Head of Growth. Re: the win-back shortlist sizing.\n\nBefore we price the win-back campaign, size the two shelves: accounts still live with us, and accounts that have churned. Two labeled count arms, one stack, alphabetical filing.",
    ask: "Stack the live customer count against the churned count, live shelf filed last-churned first, live on top.",
    template: `SELECT 'live' AS shelf, {1} AS n FROM customers WHERE active = {2}
UNION ALL
SELECT 'churned', COUNT(*) FROM customers WHERE active = 0
ORDER BY shelf {3};`,
    slots: [
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the live counter",
        why: "Each shelf needs a headcount — COUNT(*) counts the account rows on the active shelf.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "active = 1 marks live accounts; the churned arm already filters on active = 0.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "'live' sorts after 'churned' alphabetically, so DESC files the live shelf — fourteen strong — on top.",
      },
    ],
    distractors: ["SUM(id)", "0", "ASC"],
    walkthrough:
      "The live arm counts customers where active = 1: 14 accounts still buying. The churned arm counts active = 0: just 2 lapsed accounts. SUM(id) would add up account numbers instead of counting rows and land on a nonsense figure, the flag 0 belongs to the churned shelf not the live one, and ASC would file the two churned accounts above the fourteen live ones — the reverse of the memo. Fourteen against two — the win-back list is small enough to phone by hand.",
  },
  {
    id: "cs-854",
    tier: "medium",
    topic: "s1",
    universe: "expense",
    title: "Three books, one memo",
    brief:
      "From: CFO. Re: the cash story for the board memo.\n\nOne paragraph needs three numbers in one column: everything we invoiced, everything we collected, and everything we spent. Three labeled arms, biggest figure on top, so the memo reads top-down.",
    ask: "Stack invoiced, collected and spent totals from invoices, payments and expenses, largest first.",
    template: `SELECT 'invoiced' AS book, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM {1}
UNION ALL
SELECT 'collected', ROUND(SUM(amount_cents)/100.0, 2) FROM payments
UNION ALL
SELECT 'spent', ROUND(SUM(amount_cents)/100.0, 2) FROM {2}
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the invoiced arm's table",
        why: "Money billed to customers lives on invoices as amount_cents — that is the invoiced book.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the spent arm's table",
        why: "Money paid out to vendors sits on expenses — the third arm of the cash story.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort column",
        why: "Sorting by the money column puts the biggest book on top, exactly the top-down read the memo wants.",
      },
    ],
    distractors: ["orders", "customers", "ASC"],
    walkthrough:
      "Three arms, three books. Invoiced sums invoices.amount_cents to 86977; collected sums payments.amount_cents to 69612; spent sums expenses.amount_cents to 25416. Ordered by money descending the stack reads invoiced, collected, spent — 86977 above 69612 above 25416. orders and customers have no amount_cents column so those swaps kill the query, and ASC would stand the memo on its head with the smallest book first. Three numbers, one column, story told.",
  },
  {
    id: "cs-855",
    tier: "hard",
    topic: "s1",
    universe: "expense",
    title: "Three ceilings on one slide",
    brief:
      "From: Risk officer. Re: peak single-commitment exposure.\n\nThe slide needs our three biggest single commitments ever: the largest order, the largest invoice, the largest expense check. One column, three labeled arms, biggest number at the top — the board reads exactly one row before asking questions.",
    ask: "Stack the max order total, max invoice and max expense, largest figure first.",
    template: `SELECT 'max_order' AS peak, ROUND({1}(total), 2) AS v FROM orders
UNION ALL
SELECT 'max_invoice', ROUND(MAX(amount_cents)/100.0, 2) FROM invoices
UNION ALL
SELECT 'max_expense', ROUND(MAX({2})/100.0, 2) FROM expenses
ORDER BY v {3};`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the order ceiling aggregate",
        why: "The biggest single order is MAX(total) — the other two arms already carry their own MAX.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the expense ceiling column",
        why: "Expense checks are stored in cents on amount_cents; dividing by 100 turns the ceiling into dollars.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "The invoice ceiling 6148 is the scariest number on the slide — DESC puts it at the top.",
      },
    ],
    distractors: ["MIN", "id", "ASC"],
    walkthrough:
      "Three ceilings, one column. The order arm takes MAX(total) = 1088.44. The invoice arm takes MAX(amount_cents)/100 = 6148 — the single biggest bill we ever issued. The expense arm takes MAX(amount_cents)/100 = 1680, that one-off travel booking. Ordered DESC the slide reads 6148, 1680, 1088.44. MIN would report floors instead of ceilings, MAX(id) would crown expense number 36 at 0.36 dollars, and ASC would bury the headline number at the bottom where nobody reads it. Peak exposure: 6148 dollars, once.",
  },
  {
    id: "cs-856",
    tier: "easy",
    topic: "s2",
    universe: "supplier",
    title: "Two vocabularies, counted",
    brief:
      "From: Ops auditor. Re: the vocabulary census.\n\nOur fulfillment words and the billing team's words are different beasts. Count each side's vocabulary with a per-word frequency: every order status with its order count, every invoice status with its invoice count, stacked under source labels, biggest counts first within each book.",
    ask: "Stack order-status counts with invoice-status counts, orders book first, counts descending inside each book.",
    template: `SELECT 'orders' AS src, status AS v, COUNT(*) AS n FROM orders GROUP BY {1}
UNION ALL
SELECT 'invoices', status, {2} FROM invoices GROUP BY status
ORDER BY src {3}, n DESC;`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "arm 1's grouping column",
        why: "The census is per status word — GROUP BY status produces one frequency row per fulfillment word.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "arm 2's counter",
        why: "Each invoice status needs its headcount — COUNT(*) tallies the rows per billing word.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the book filing order",
        why: "DESC on src files 'orders' above 'invoices' since o follows i — the fulfillment book leads.",
      },
    ],
    distractors: ["customer_id", "SUM(total)", "ASC"],
    walkthrough:
      "The orders book counts four words: delivered 52, shipped 30, pending 14, cancelled 7. The invoices book counts three: paid 21, open 6, void 1. GROUP BY customer_id would census customers instead of words and scramble everything, SUM(total) tries to total a column invoices does not even have, and ASC would put the billing book first against the memo's instruction. Seven word-count rows, two labeled books, census complete.",
  },
  {
    id: "cs-857",
    tier: "easy",
    topic: "s2",
    universe: "fraud",
    title: "Two rails through the till",
    brief:
      "From: Payments analyst. Re: the till mix check.\n\nMoney arrives on exactly two rails: card and wire. Before the fraud sweep, count how many settlements rode each rail — two labeled arms, busiest rail on top.",
    ask: "Stack the card settlement count against the wire count, busier rail first.",
    template: `SELECT 'card' AS rail, COUNT(*) AS n FROM payments WHERE method = {1}
UNION ALL
SELECT 'wire', {2} FROM payments WHERE method = 'wire'
ORDER BY n {3};`,
    slots: [
      {
        answer: "'card'",
        kind: "keyword",
        label: "arm 1's rail filter",
        why: "The first arm counts card settlements — method = 'card' isolates that rail.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "arm 2's counter",
        why: "The wire arm needs the same style of headcount — COUNT(*) tallies its settlement rows.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "Card is the busier rail, so DESC files its 16 above wire's 11 as asked.",
      },
    ],
    distractors: ["'wire'", "SUM(amount_cents)/100", "ASC"],
    walkthrough:
      "Two arms, one till. The card arm filters method = 'card' and counts 16 settlements. The wire arm counts 11. Filtering the first arm on 'wire' would count the same rail twice and leave card uncounted, SUM(amount_cents)/100 would report money moved rather than settlements made, and ASC would promote the quieter rail. Sixteen swipes versus eleven transfers — the till is a card machine with a wire annex.",
  },
  {
    id: "cs-858",
    tier: "medium",
    topic: "s2",
    universe: "fraud",
    title: "Settled, outstanding, killed",
    brief:
      "From: Collections lead. Re: the money-by-lane view.\n\nEvery invoice dollar sits in one of three lanes: settled (paid), outstanding (open), or killed (void). Price each lane in dollars — three labeled WHERE arms in one stack, priciest lane on top.",
    ask: "Stack paid, open and void invoice money as settled, outstanding and killed lanes, priciest lane first.",
    template: `SELECT 'settled' AS lane, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM invoices WHERE status = {1}
UNION ALL
SELECT 'outstanding', ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE status = 'open'
UNION ALL
SELECT 'killed', ROUND(SUM(amount_cents)/100.0, 2) FROM invoices WHERE status = 'void'
ORDER BY {2} {3};`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled arm's filter",
        why: "The settled lane is paid invoices — status = 'paid' picks exactly those dollars.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort column",
        why: "Sorting by money puts the 66443-dollar settled lane on top of the 925-dollar killed lane.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC reads settled, outstanding, killed — priciest lane first, as the memo asks.",
      },
    ],
    distractors: ["'open'", "id", "status"],
    walkthrough:
      "Three WHERE arms, one lane each. Settled sums paid invoices to 66443. Outstanding sums open invoices to 19609. Killed sums the single void invoice to 925 — one dead bill, priced honestly. Filtering the settled arm on 'open' would double-count the outstanding lane, id would compare status text to a number and empty the arm, and ORDER BY status would reference the raw column instead of the priced result. The money map: 66443 safe, 19609 to chase, 925 gone.",
  },
  {
    id: "cs-859",
    tier: "medium",
    topic: "s2",
    universe: "growth",
    title: "The year in four checks",
    brief:
      "From: Board prep. Re: the quarterly revenue strip.\n\nThe deck wants order revenue split into the four calendar quarters as four labeled arms in one stack — Q1 through Q4, filed in calendar order, so the strip reads left to right down the page.",
    ask: "Stack Q1–Q4 order money using month substrings, quarters in calendar order.",
    template: `SELECT 'Q1' AS quarter, ROUND(SUM(total), 2) AS money FROM orders WHERE substr(created_at, 6, 2) {1} ('01','02','03')
UNION ALL
SELECT 'Q2', ROUND(SUM(total), 2) FROM orders WHERE substr(created_at, 6, 2) IN ('04','05','06')
UNION ALL
SELECT 'Q3', ROUND(SUM(total), 2) FROM orders WHERE substr(created_at, 6, 2) IN ({2})
UNION ALL
SELECT 'Q4', ROUND(SUM(total), 2) FROM orders WHERE substr(created_at, 6, 2) IN ('10','11','12')
ORDER BY quarter {3};`,
    slots: [
      {
        answer: "IN",
        kind: "keyword",
        label: "arm 1's list matcher",
        why: "Q1 is any of months 01, 02, 03 — the IN operator matches a created month against that list.",
      },
      {
        answer: "'07','08','09'",
        kind: "keyword",
        label: "arm 3's month list",
        why: "Q3 owns July, August and September — those two-digit months belong in the third arm's list.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar filing order",
        why: "ASC files Q1, Q2, Q3, Q4 — the strip reads down the page exactly as the calendar runs.",
      },
    ],
    distractors: ["NOT IN", "'07','08'", "DESC"],
    walkthrough:
      "Four arms, four quarters. Q1 pulls months 01–03: 14018.72. Q2 pulls 04–06: 7426.65. Q3 pulls 07–09: 6661.97. Q4 pulls 10–12: 6725.94. NOT IN would flip arm one into every non-Q1 order and double the strip, dropping September from arm three would silently shrink Q3, and DESC would run the year backwards. Note the shape: a monster Q1, then three quarters fighting over scraps — that is the seasonality story the board will ask about.",
  },
  {
    id: "cs-860",
    tier: "medium",
    topic: "s2",
    universe: "expense",
    title: "Big tickets, small tickets",
    brief:
      "From: Spend controller. Re: the two-pile policy check.\n\nPolicy treats anything at 1000 dollars or more as a big ticket needing sign-off. Split the expense book into the two piles — count and price each — big pile first, and inside the stack show the money column descending.",
    ask: "Stack big (>= 1000 dollars) against small expenses with counts and totals, priciest pile on top.",
    template: `SELECT 'big' AS pile, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM expenses WHERE amount_cents >= {1}
UNION ALL
SELECT 'small', COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM expenses WHERE amount_cents < 100000
ORDER BY {2} {3};`,
    slots: [
      {
        answer: "100000",
        kind: "number",
        noVerify: true,
        label: "the big-ticket threshold",
        why: "The books keep cents — 1000 dollars is 100000 cents, the policy line between the piles.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort column",
        why: "Sorting by money ranks the piles by dollars — big's 18480 rides above small's 6936.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC keeps the sign-off pile's 18480 on top; ASC would open with the small change.",
      },
    ],
    distractors: ["10000", "pile", "ASC"],
    walkthrough:
      "Two piles, priced and counted. Big — 100000 cents and up — holds 15 checks worth 18480 dollars, dominated by the rent line. Small holds 21 checks worth 6936. A threshold of 10000 cents would swallow every expense into the big pile, sorting by the pile label would let small file first alphabetically, and ASC would lead the stack with the small change. The policy picture: 15 checks carry 73 percent of all spend — that is where the signatures go.",
  },
  {
    id: "cs-861",
    tier: "hard",
    topic: "s2",
    universe: "expense",
    title: "The spend ledger with a floor line",
    brief:
      "From: Controller. Re: the monthly spend detail for the close binder.\n\nThe binder page needs every spend month with its count and total, then a grand-total row pinned at the bottom labeled 'total' — a detail stack with a floor line. Months derive from a substring slice of the spend date.",
    ask: "Stack per-month expense counts and totals with a grand-total row, months descending so total lands on top.",
    template: `SELECT substr(spent_on, {1}, {2}) AS mo, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM expenses GROUP BY mo
UNION ALL
SELECT 'total', COUNT(*), ROUND(SUM(amount_cents)/100.0, 2) FROM expenses
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the substring start",
        why: "spent_on reads 2024-01-01 — slicing from position 1 keeps the year and month together.",
      },
      {
        answer: "7",
        kind: "number",
        noVerify: true,
        label: "the substring length",
        why: "Seven characters of 2024-01-01 is exactly 2024-01 — one clean bucket per spend month.",
      },
      {
        answer: "mo",
        kind: "keyword",
        label: "the sort column",
        why: "Sorting by mo descending puts text 'total' above every date stamp, pinning the floor line on top.",
      },
    ],
    distractors: ["6", "4", "money"],
    walkthrough:
      "Fourteen month rows plus a total row. Slicing spent_on from position 1 for 7 characters yields 2024-01 through 2025-02, each with its count and money — August 2024 is the heavyweight at 3210 across 3 checks. The union arm appends 'total', 36 checks, 25416. Starting the slice at 6 would bucket by day-of-month fragments instead of months, a length of 4 would collapse everything into two year rows, and sorting by money would reorder the binder by size rather than by the total-on-top filing. The floor line reads: every cent accounted for.",
  },
  {
    id: "cs-862",
    tier: "hard",
    topic: "s2",
    universe: "fraud",
    title: "Every state of the money, biggest first",
    brief:
      "From: Revenue ops. Re: the exposure-by-state strip.\n\nOne stack for the ops review: total order money in each of the four states — delivered, shipped, pending, cancelled — four labeled arms, and the whole stack sorted so the state holding the most money leads.",
    ask: "Stack delivered, shipped, pending and cancelled order money, biggest state on top.",
    template: `SELECT 'delivered' AS state, ROUND(SUM(total), 2) AS money FROM orders WHERE status = 'delivered'
UNION ALL
SELECT 'shipped', ROUND(SUM(total), 2) FROM orders WHERE status = 'shipped'
UNION ALL
SELECT 'pending', ROUND(SUM(total), 2) FROM orders WHERE status = {1}
UNION ALL
SELECT 'cancelled', ROUND(SUM(total), 2) FROM orders WHERE status = 'cancelled'
ORDER BY {2} {3};`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "arm 3's state filter",
        why: "The pending arm needs exactly the pending orders — money still in limbo totals 6113.",
      },
      {
        answer: "money",
        kind: "keyword",
        label: "the sort column",
        why: "Sorting by money ranks the states by dollars at risk rather than by alphabet.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC leads with delivered's 15571.07 and drops cancelled's 1152.49 to the bottom.",
      },
    ],
    distractors: ["'cancelled'", "'shipped'", "ASC"],
    walkthrough:
      "Four arms, four states. Delivered holds 15571.07, shipped 11996.72, pending 6113, cancelled 1152.49. Filtering arm three on 'cancelled' would print cancelled money twice and lose pending entirely; 'shipped' would do the same to shipped. Sorting by state alphabetically would lead with cancelled — the least money — and ASC would end the strip on the biggest number. The exposure strip reads top-down: banked, moving, waiting, dead.",
  },
  {
    id: "cs-863",
    tier: "easy",
    topic: "s3",
    universe: "inventory",
    title: "The premium movers",
    brief:
      "From: Merchandiser. Re: the premium shelf check.\n\nWe need to know which premium products — the ones priced at 100 dollars or more — have actually appeared on a customer order. Match the sold product list against the premium shelf and list the matching product ids in order.",
    ask: "Intersect ordered product ids with products priced 100 dollars or more, ids ascending.",
    template: `SELECT v FROM (
  SELECT product_id AS v FROM {1}
  INTERSECT
  SELECT id FROM products WHERE price >= {2}
) ORDER BY v {3};`,
    slots: [
      {
        answer: "order_items",
        kind: "keyword",
        label: "the sold-side table",
        why: "Product ids that appear on orders live in order_items.product_id — that is the sold list.",
      },
      {
        answer: "100",
      kind: "number",
      noVerify: true,
        label: "the premium price floor",
        why: "Premium begins at 100 dollars — the price filter that defines the premium shelf.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "ASC lists the matching ids smallest first — the natural catalog order for the check.",
      },
    ],
    distractors: ["orders", "50", "DESC"],
    walkthrough:
      "The sold side pulls product_id from order_items; the premium side pulls product ids where price >= 100. INTERSECT keeps only ids present in both — four premium products, and since every product in this catalog has sold at least once, all four premium ids appear: the premium shelf is fully represented on real orders. Reading from orders would fail because orders carries no product_id, dropping the floor to 50 would pull in the mid-price shelf too, and DESC would reverse the filing. Four ids, premium moving.",
  },
  {
    id: "cs-864",
    tier: "easy",
    topic: "s3",
    universe: "funnel",
    title: "Europe's live accounts",
    brief:
      "From: Regional lead. Re: the EU campaign list.\n\nThe EU reactivation campaign targets accounts that are both in the Europe region and still active. Two id lists, one intersection, ascending — that is the entire call sheet.",
    ask: "Intersect active customer ids with EU customer ids, ascending.",
    template: `SELECT {1} FROM (
  SELECT id FROM customers WHERE active = 1
  INTERSECT
  SELECT id FROM customers WHERE {2} = 'EU'
) ORDER BY id {3};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the output column",
        why: "The call sheet wants account numbers — id is the only column the subquery delivers.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the EU filter column",
        why: "Region membership is the Europe test — region = 'EU' selects the EU shelf of customers.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "ASC files the seven matching ids smallest first for the dialer.",
      },
    ],
    distractors: ["name", "active", "DESC"],
    walkthrough:
      "Both sides read customers, filtered two ways: active = 1 on one arm, region = 'EU' on the other. INTERSECT keeps ids satisfying both — seven live EU accounts. Selecting name would break because the subquery only ships ids; filtering on active = 'EU' matches nothing and empties the sheet; DESC would run the dialer backwards. Seven ids, all live, all European — the campaign list is ready.",
  },
  {
    id: "cs-865",
    tier: "medium",
    topic: "s3",
    universe: "month-close",
    title: "Thirteen shared months",
    brief:
      "From: Controller. Re: the billing-calendar reconciliation.\n\nBookkeeping wants proof that invoices and payments breathe on the same calendar: count the months in which we both issued an invoice and recorded a payment, and report the earliest such month as the anchor.",
    ask: "Intersect invoice issue months with payment months; report the count and the earliest shared month.",
    template: `SELECT COUNT(*) AS shared, {3}(m) AS anchor FROM (
  SELECT substr({1}, 1, 7) AS m FROM invoices
  INTERSECT
  SELECT substr(paid_on, 1, 7) FROM {2}
);`,
    slots: [
      {
        answer: "issued_on",
        kind: "keyword",
        label: "the invoice date column",
        why: "A bill enters the calendar when issued — issued_on sliced to year-month gives the invoice months.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "the payment-side table",
        why: "Payment months come from payments.paid_on — the other half of the reconciliation.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the anchor aggregate",
        why: "The earliest shared month needs MIN — the anchor the close binder starts from.",
      },
    ],
    distractors: ["due_on", "customers", "MAX"],
    walkthrough:
      "Thirteen months see both an invoice and a payment, from 2024-02 through 2025-02 — the two calendars are one calendar. The anchor, MIN(m), is 2024-02: the first month money moved on both sides. due_on would measure the due-date calendar instead and finds only 12 shared months; customers has no paid_on column and errors out; MAX would anchor the binder on the newest month rather than the first. Count 13, anchor 2024-02 — billing and collection share a heartbeat.",
  },
  {
    id: "cs-866",
    tier: "medium",
    topic: "s3",
    universe: "supplier",
    title: "Billed buyers, delivered orders",
    brief:
      "From: Fulfillment auditor. Re: the clean-chain census.\n\nThe gold standard is a customer who has been invoiced AND whose orders reached delivered status. Count the customers who appear on both lists — the fully closed loop, billing side and fulfillment side.",
    ask: "Count customers who are invoiced and also have a delivered order.",
    template: `SELECT {3}(customer_id) AS closed_loop FROM (
  SELECT DISTINCT customer_id FROM {1}
  INTERSECT
  SELECT DISTINCT customer_id FROM orders WHERE {2} = 'delivered'
);`,
    slots: [
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billed-side table",
        why: "Invoiced customers come from invoices.customer_id — the billing half of the loop.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the delivered filter column",
        why: "Delivered is a status value on orders — status = 'delivered' picks the fulfilled orders.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the census aggregate",
        why: "The deliverable is a headcount of closed loops — COUNT over the intersected ids.",
      },
    ],
    distractors: ["orders", "id", "SUM"],
    walkthrough:
      "Two lists, one overlap. The billing list is distinct invoices.customer_id; the fulfillment list is distinct buyers of delivered orders. The intersection holds 10 customers — billed and delivered, both boxes ticked. Reading the billed side from orders would just re-count delivered buyers (15) and skip the billing test entirely; id points at no delivered column and dies; SUM would add up id numbers instead of counting them. Ten closed loops out of eleven invoiced customers — one bill still awaits its delivered order.",
  },
  {
    id: "cs-867",
    tier: "hard",
    topic: "s3",
    universe: "month-close",
    title: "The due-date overlap",
    brief:
      "From: Credit analyst. Re: the terms-calendar audit.\n\nInvoices carry two dates: issued and due. The audit asks how many months contain both a due date and an actual payment — evidence that bills were settled in the month they came due. Report the count and the newest such month.",
    ask: "Intersect invoice due months with payment months; report the count and the latest shared month.",
    template: `SELECT COUNT(*) AS shared, {3}(m) AS newest FROM (
  SELECT substr({1}, 1, 7) AS m FROM invoices
  INTERSECT
  SELECT substr(paid_on, 1, 7) FROM {2}
);`,
    slots: [
      {
        answer: "due_on",
        kind: "keyword",
        label: "the due-date column",
        why: "The audit is about the terms calendar — due_on sliced to year-month gives the due months.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "the settlement-side table",
        why: "Actual settlements live on payments.paid_on — the reality half of the comparison.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the newest-month aggregate",
        why: "The latest month where a due date and a payment coincide needs MAX.",
      },
    ],
    distractors: ["issued_on", "expenses", "MIN"],
    walkthrough:
      "Twelve months hold both a due date and a payment — one month short of the issue calendar, because a bill issued late in a month is often settled in the next. MAX(m) names 2025-02 as the newest settled-when-due month. Swapping in issued_on would audit the wrong calendar and count 13; expenses has no paid_on and errors out; MIN would report the oldest overlap when the audit asks for the newest. Twelve of thirteen bills settled in their due month — the terms machine works.",
  },
  {
    id: "cs-868",
    tier: "hard",
    topic: "s3",
    universe: "funnel",
    title: "One shared day in 2025",
    brief:
      "From: Marketing analyst. Re: the coincidence check.\n\nSuperstition says orders and expense spending cluster on the same days. For 2025 only, count the dates on which we both took a customer order and logged an expense — and yes, we expect exactly one candidate.",
    ask: "Count 2025 order dates that coincide with 2025 expense dates.",
    template: `SELECT {1}(v) AS shared FROM (
  SELECT created_at AS v FROM orders WHERE {2} >= '2025-01-01'
  INTERSECT
  SELECT spent_on FROM expenses WHERE spent_on >= {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the coincidence counter",
        why: "The deliverable is a number of shared days — COUNT over the intersected dates.",
      },
      {
        answer: "created_at",
        kind: "keyword",
        label: "the order-date column",
        why: "Orders are stamped with created_at — that is the order side of the coincidence test.",
      },
      {
        answer: "'2025-01-01'",
        kind: "keyword",
        label: "the expense-side cutoff",
        why: "Both sides must be 2025 — the expense arm needs the same New Year cutoff the order arm has.",
      },
    ],
    distractors: ["GROUP_CONCAT", "total", "region"],
    walkthrough:
      "Intersect 2025 order dates with 2025 expense dates and exactly one day survives: 2025-01-01 — New Year's Day, an order taken and an expense logged before the champagne. COUNT returns 1. GROUP_CONCAT would return the date as text rather than count it, and total or region would reach for columns the two tables do not share — orders have no region, expenses no total — so the arms error out. One shared day in 2025 — the superstition survives on a technicality.",
  },
  {
    id: "cs-869",
    tier: "hard",
    topic: "s3",
    universe: "refund-audit",
    title: "Shipped and billed, both boxes ticked",
    brief:
      "From: Refund auditor. Re: the verifiable-shipment census.\n\nA refund claim is only verifiable when the customer's story checks out on both ledgers: goods actually shipped AND an invoice exists. Count the customers whose history shows both.",
    ask: "Count customers who have both a shipped order and an invoice.",
    template: `SELECT {1}(customer_id) AS verified FROM (
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
  INTERSECT
  SELECT DISTINCT customer_id FROM {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the verification counter",
        why: "The census is a headcount — COUNT over the intersected customer ids.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the shipment filter",
        why: "Verifiable means goods left the building — status = 'shipped' selects those orders.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billing-side table",
        why: "The paper trail lives on invoices — customer ids there prove a bill exists.",
      },
    ],
    distractors: ["SUM", "'delivered'", "customers"],
    walkthrough:
      "Two proofs, one intersection. The shipment side pulls buyers of shipped orders; the billing side pulls invoice customer ids. Ten customers have shipped orders; eleven are invoiced; nine appear on both lists — the verifiable census. SUM would total id numbers instead of counting rows, delivered would audit a different fulfillment stage (10 overlaps, not 9), and reading from customers would drop the billing test and count every shipper. Nine customers whose refund story can be verified end to end.",
  },
  {
    id: "cs-870",
    tier: "easy",
    topic: "s4",
    universe: "catalog",
    title: "The affordable movers",
    brief:
      "From: Catalog lead. Re: the value-shelf audit.\n\nPremium gets the attention, but the affordable shelf pays the bills. Take every product that has ever sold, remove the premium shelf — anything at 100 dollars or more — and list what survives, ids ascending.",
    ask: "Except the premium products (price >= 100) from the sold product list, ids ascending.",
    template: `SELECT v FROM (
  SELECT {1} AS v FROM order_items
  EXCEPT
  SELECT id FROM products WHERE price >= {2}
) ORDER BY v {3};`,
    slots: [
      {
        answer: "product_id",
        kind: "keyword",
        label: "the sold-list column",
        why: "order_items.product_id is the record of what sold — the starting list for the subtraction.",
      },
      {
        answer: "100",
        kind: "number",
        noVerify: true,
        label: "the premium floor",
        why: "Everything at 100 dollars or more is premium — exactly what the audit removes.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the sort direction",
        why: "ASC files the twelve surviving ids smallest first, matching the catalog's own order.",
      },
    ],
    distractors: ["id", "200", "DESC"],
    walkthrough:
      "The sold list holds every product id that appears on order_items. EXCEPT then deletes the premium ids — the four products priced at 100 or more. Twelve affordable movers survive. Selecting order_items.id would subtract against line-item numbers instead of product numbers, a 200-dollar floor would remove nothing since nothing is priced that high, and DESC would flip the filing. Twelve rows: the value shelf is where the volume lives.",
  },
  {
    id: "cs-871",
    tier: "easy",
    topic: "s4",
    universe: "funnel",
    title: "Europe's unbilled two",
    brief:
      "From: Billing ops. Re: the EU paper-trail gap.\n\nEvery EU account should have at least one invoice on file. Subtract the invoiced customer list from the EU roster and count the accounts with no paper trail — these get a billing audit this week.",
    ask: "Count EU customers who appear on no invoice.",
    template: `SELECT {1}(v) AS never_billed FROM (
  SELECT id AS v FROM customers WHERE region = {2}
  EXCEPT
  SELECT DISTINCT customer_id FROM {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the gap counter",
        why: "The audit needs a number of accounts — COUNT over the surviving ids.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region filter",
        why: "The roster is the European shelf — region = 'EU' selects exactly those accounts.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billed list's table",
        why: "The invoiced list is distinct customer_ids from invoices — the list being subtracted.",
      },
    ],
    distractors: ["MAX", "'US'", "'LATAM'"],
    walkthrough:
      "The EU roster holds eight accounts; the invoiced list covers most of them. EXCEPT removes every invoiced id and two EU accounts survive: ids 4 and 14, the region's paper-trail gap. MAX would return the larger id instead of counting the gap, the US roster has zero unbilled accounts so that swap flattens the answer, and the single LATAM account is billed or not — either way it can never produce a gap of two. Two accounts, one billing chase.",
  },
  {
    id: "cs-872",
    tier: "easy",
    topic: "s4",
    universe: "fraud",
    title: "Live accounts, zero paper",
    brief:
      "From: Fraud desk. Re: the ghost-account sweep.\n\nAn account marked active with no invoice history is either a data bug or something worse. Sweep the active roster against the invoice ledger and count the ghosts — active, but never billed.",
    ask: "Count active customers who appear on no invoice.",
    template: `SELECT {1} FROM (
  SELECT id FROM customers WHERE active = {2}
  EXCEPT
  SELECT DISTINCT customer_id FROM {3}
) ORDER BY id;`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the output column",
        why: "The sweep reports which accounts — id is the column the subquery ships outward.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "active = 1 marks the live roster — the population the ghost sweep runs against.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billed list's table",
        why: "The subtraction removes every customer_id that has been invoiced at least once.",
      },
    ],
    distractors: ["name", "0", "orders"],
    walkthrough:
      "The active roster holds 14 accounts. EXCEPT deletes every id that appears on an invoice; three survive — active accounts that have never been billed once. Selecting name breaks because the subquery ships ids, sweeping the inactive roster (flag 0) would chase the two churned accounts instead, and subtracting buyers from orders would find nothing since every active customer has ordered. Three ghosts on the active roster — flag them for the fraud queue.",
  },
  {
    id: "cs-873",
    tier: "medium",
    topic: "s4",
    universe: "refund-audit",
    title: "Billed, never stalled",
    brief:
      "From: Collections. Re: the clean-billing shortlist.\n\nSome customers get billed and their orders never sit in pending. List them: take the invoiced customer ids, remove everyone with a pending order, and show who survives with their count.",
    ask: "Except pending-order customers from the invoiced customer list; show the ids and the count.",
    template: `SELECT {3} AS n, GROUP_CONCAT(v) AS ids FROM (
  SELECT DISTINCT {1} AS v FROM invoices
  EXCEPT
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
);`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the invoiced-list column",
        why: "The billing list is invoices.customer_id — the population the subtraction starts from.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the stalled filter",
        why: "Pending orders mark the stalled buyers — exactly the group being removed.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the survivor counter",
        why: "Alongside the id list, COUNT(*) reports how many clean-billing customers survive.",
      },
    ],
    distractors: ["id", "'cancelled'", "SUM(*)"],
    walkthrough:
      "Start from eleven invoiced customer ids. Subtract everyone with a pending order and five survive: 8, 9, 10, 12, 15 — billed and never stalled. Subtracting invoice ids instead of customer ids would compare the wrong id spaces, cancelling buyers are a different stall (eight survivors, a different shortlist), and SUM(*) is not a legal aggregate and dies. Five customers whose bills have never waited behind a stalled cart.",
  },
  {
    id: "cs-874",
    tier: "medium",
    topic: "s4",
    universe: "month-close",
    title: "Fourteen quiet bookkeeping days",
    brief:
      "From: Bookkeeper. Re: the calendar-gap note.\n\nThe ledger posts on its own rhythm and never on a day we took an order. List the bookkeeping dates that share no day with the order calendar, and stamp the earliest one for the note.",
    ask: "Except order dates from ledger entry dates; report the count and the earliest quiet date.",
    template: `SELECT COUNT(*) AS quiet, {3}(v) AS first_quiet FROM (
  SELECT {1} AS v FROM ledger_entries
  EXCEPT
  SELECT created_at FROM {2}
);`,
    slots: [
      {
        answer: "entry_date",
        kind: "keyword",
        label: "the bookkeeping date column",
        why: "The ledger stamps each post with entry_date — the calendar being audited.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the order-calendar table",
        why: "Order dates come from orders.created_at — the calendar being subtracted away.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the earliest-date aggregate",
        why: "The note wants the first quiet day — MIN over the surviving dates.",
      },
    ],
    distractors: ["account", "order_items", "MAX"],
    walkthrough:
      "The ledger holds fourteen distinct entry dates; not one coincides with an order date. EXCEPT leaves all fourteen standing, and MIN stamps 2024-01-31 — the month-end — as the first quiet day. Account words would subtract against dates and leave a nonsense four, order_items carries no created_at and errors out, and MAX would stamp the newest quiet day when the note asks for the first. The pattern is the story: books close on month-ends, orders land mid-month, the calendars never touch.",
  },
  {
    id: "cs-875",
    tier: "medium",
    topic: "s4",
    universe: "refund-audit",
    title: "The one that slipped",
    brief:
      "From: Fulfillment manager. Re: the missing-paper chase.\n\nEvery customer with shipped goods should have been invoiced by now. Subtract the invoiced customers from the shipped-goods customers and find the one account that slipped through — then count how many there are.",
    ask: "Except invoiced customers from shipped-order customers; report the count.",
    template: `SELECT {1}(v) AS slipped FROM (
  SELECT DISTINCT customer_id AS v FROM orders WHERE status = {2}
  EXCEPT
  SELECT DISTINCT customer_id FROM {3}
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the slip counter",
        why: "The chase starts with a number — COUNT over the surviving customer ids.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the shipped filter",
        why: "Shipped goods should always carry paper — status = 'shipped' builds the starting list.",
      },
      {
        answer: "invoices",
        kind: "keyword",
        label: "the billed list's table",
        why: "The invoiced customer ids come from invoices — the list being subtracted.",
      },
    ],
    distractors: ["MAX", "'pending'", "'delivered'"],
    walkthrough:
      "Ten customers have shipped orders; eleven hold invoices. Subtracting the invoiced list leaves exactly one account — customer 14 — that received shipped goods without a single bill. MAX would report the id rather than count the slips, pending buyers overlap invoices differently (two slips, a different chase), and delivered buyers overlap at ten — a different census for a different fulfillment stage. One account to chase before the books disagree.",
  },
  {
    id: "cs-876",
    tier: "hard",
    topic: "s4",
    universe: "fraud",
    title: "The jumbo that never settled",
    brief:
      "From: Credit committee. Re: the large-balance review.\n\nAny invoice of 3000 dollars or more gets committee eyes. Of the customers holding such a jumbo bill, subtract everyone who has at least one paid invoice — whoever remains holds a jumbo bill and has never settled anything. Count them.",
    ask: "Count customers with a jumbo invoice (>= 3000 dollars) who have no paid invoice at all.",
    template: `SELECT {3} AS frozen FROM (
  SELECT DISTINCT customer_id FROM invoices WHERE amount_cents >= {1}
  EXCEPT
  SELECT DISTINCT customer_id FROM invoices WHERE status = {2}
);`,
    slots: [
      {
        answer: "300000",
        kind: "number",
        noVerify: true,
        label: "the jumbo threshold",
        why: "The books keep cents — 3000 dollars is 300000 cents, the committee's line for jumbo bills.",
      },
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled filter",
        why: "Any paid invoice proves the customer settles — status = 'paid' marks the subtracted list.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the frozen counter",
        why: "The committee wants a headcount of frozen jumbo accounts — COUNT over the survivors.",
      },
    ],
    distractors: ["30000", "'open'", "GROUP_CONCAT"],
    walkthrough:
      "Seven customers hold a jumbo bill of 3000 dollars or more. Subtract the ones with any paid invoice and one account survives — customer 12, holding jumbo paper and never having settled a cent. A 30000-cent threshold would sweep in routine bills and drown the signal, open-status subtraction would keep three accounts whose other bills did settle, and GROUP_CONCAT would list the id rather than count it. One frozen jumbo account — that is the committee's single agenda item.",
  },
  {
    id: "cs-877",
    tier: "hard",
    topic: "s4",
    universe: "catalog",
    title: "Eight movers above the budget line",
    brief:
      "From: Merchandiser. Re: the mid-plus shelf audit.\n\nBudget stock is anything under 50 dollars. Take the sold list, remove the budget shelf, and report both the count of what survives and its flagship — the highest product id still moving.",
    ask: "Except budget products (price < 50) from the sold list; report the count and the largest surviving id.",
    template: `SELECT COUNT(*) AS movers, {2}(v) AS flagship FROM (
  SELECT {3} AS v FROM order_items
  EXCEPT
  SELECT id FROM products WHERE price < {1}
);`,
    slots: [
      {
        answer: "50",
        kind: "number",
        noVerify: true,
        label: "the budget ceiling",
        why: "Budget ends below 50 dollars — the subtraction removes exactly that shelf.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the flagship aggregate",
        why: "The flagship is the largest surviving product id — MAX names it.",
      },
      {
        answer: "product_id",
        kind: "keyword",
        label: "the sold-list column",
        why: "order_items.product_id lists what sold — the starting inventory of the audit.",
      },
    ],
    distractors: ["20", "MIN", "order_id"],
    walkthrough:
      "Subtract the budget shelf — the two products under 20 dollars plus everything else under 50 — and eight movers survive, flagship id 15. MAX reads that flagship straight off the surviving ids; MIN would name the cheapest survivor instead of the flagship, order_id would compare order numbers against product ids and produce a meaningless pile, and a 20-dollar ceiling would only remove the two cheapest items and leave fourteen movers. Eight products above the budget line, one flagship.",
  },
  {
    id: "cs-878",
    tier: "hard",
    topic: "s4",
    universe: "funnel",
    title: "Outside the two big zones",
    brief:
      "From: Market researcher. Re: the niche-roster extract.\n\nEurope and APAC get all the attention. Everyone else — the US and LATAM accounts — is the niche roster. Cut both big zones out of the customer name list and show exactly who remains, joined in one cell.",
    ask: "Except EU and APAC customers from the roster; join the remaining names into one string.",
    template: `SELECT {1}(v) AS leftovers FROM (
  SELECT name AS v FROM customers
  EXCEPT
  SELECT name FROM customers WHERE region = {2}
  EXCEPT
  SELECT name FROM customers WHERE region = {3}
);`,
    slots: [
      {
        answer: "GROUP_CONCAT",
        kind: "keyword",
        label: "the name joiner",
        why: "The researcher wants one comma-joined string of names — GROUP_CONCAT folds the rows into a cell.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the first zone cut",
        why: "Europe is the first zone to remove — region = 'EU' deletes those eight names.",
      },
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the second zone cut",
        why: "APAC is the second cut — a second EXCEPT arm deletes the five Asia-Pacific names.",
      },
    ],
    distractors: ["COUNT", "'US'", "'LATAM'"],
    walkthrough:
      "Sixteen names enter; the first EXCEPT deletes the eight EU names, the second deletes the five APAC names. Three survive: Bruno Silva, Emma Wilson, Jamal Wright — the US pair and the lone LATAM account. COUNT would return the number 3 instead of the names themselves, cutting the US zone instead of Europe would leave nine names, and a LATAM cut would strip the one account the niche roster exists to showcase. Two EXCEPTs, one niche roster of three.",
  },
  {
    id: "cs-879",
    tier: "easy",
    topic: "s5",
    universe: "catalog",
    title: "Fourteen words, three sheets",
    brief:
      "From: Data steward. Re: the controlled-vocabulary merge.\n\nThree sheets carry category-like words: product categories, expense categories, and invoice statuses. Union them into one deduplicated glossary and count the words — the first step before we assign owners to each.",
    ask: "Union product categories, expense categories and invoice statuses; count the distinct words.",
    template: `SELECT {3}(v) AS glossary FROM (
  SELECT {1} AS v FROM products
  UNION
  SELECT category FROM expenses
  UNION
  SELECT {2} FROM invoices
);`,
    slots: [
      {
        answer: "category",
        kind: "keyword",
        label: "arm 1's word column",
        why: "The product sheet's words live in products.category — seven distinct shelf words.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "arm 3's word column",
        why: "The invoice sheet contributes its three status words — paid, open, void — to the glossary.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the glossary counter",
        why: "The deliverable is a word count — COUNT over the deduplicated pile.",
      },
    ],
    distractors: ["name", "number", "GROUP_CONCAT"],
    walkthrough:
      "Three arms, one glossary. Products contribute seven category words, expenses add four of their own, invoices add three status words — and UNION deduplicates any overlaps, leaving fourteen distinct words. Reading product names would flood the glossary with sixteen product titles, invoice numbers would flood it with twenty-eight numeric strings, and GROUP_CONCAT would build the word list instead of counting it. Fourteen words, three sheets, one vocabulary to govern.",
  },
  {
    id: "cs-880",
    tier: "medium",
    topic: "s5",
    universe: "growth",
    title: "The tail of the pile",
    brief:
      "From: Growth analyst. Re: the word-pile trivia slide.\n\nStack every order status with every payment method into one deduplicated pile, sort it backwards alphabetically, and read off just the last two words — the tail of the pile, for the trivia slide.",
    ask: "Union order statuses with payment methods, sort descending, keep the bottom two words.",
    template: `SELECT v FROM (
  SELECT {1} AS v FROM orders
  UNION
  SELECT method FROM {2}
)
ORDER BY v {3} LIMIT 2;`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "arm 1's word column",
        why: "The order side contributes its four status words to the pile.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "arm 2's table",
        why: "The till side contributes card and wire — the two payment method words.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the sort direction",
        why: "DESC files wire above shipped; LIMIT 2 then keeps exactly the tail pair.",
      },
    ],
    distractors: ["region", "invoices", "ASC"],
    walkthrough:
      "The pile holds six words: cancelled, card, delivered, pending, shipped, wire. Sorted descending, the tail reads wire, shipped — and LIMIT 2 keeps exactly that pair. Pulling region would add four uppercase region words and change the tail, invoice statuses would add open, paid and void (a different tail), and ASC would keep the head of the pile — cancelled and card — instead. Two words from the bottom: the slide writes itself.",
  },
  {
    id: "cs-881",
    tier: "medium",
    topic: "s5",
    universe: "expense",
    title: "Where spend words meet book words",
    brief:
      "From: Spend controller. Re: the vocabulary bridge.\n\nExpense categories and ledger account names describe the same money in two languages. Union the expense category words with the ledger account words — no filtering, the whole category sheet — and count the merged vocabulary.",
    ask: "Union all expense categories with ledger account names; count the distinct words.",
    template: `SELECT {1}(v) AS lexicon FROM (
  SELECT category AS v FROM expenses WHERE amount_cents >= {3}
  UNION
  SELECT {2} FROM ledger_entries
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the lexicon counter",
        why: "The deliverable is a vocabulary size — COUNT over the merged word pile.",
      },
      {
        answer: "account",
        kind: "keyword",
        label: "the book-side column",
        why: "Ledger account names — cash, sales_revenue and friends — come from the account column.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the no-filter floor",
        why: "The brief says the whole sheet — a floor of 0 cents filters out nothing.",
      },
    ],
    distractors: ["GROUP_CONCAT", "memo", "100000"],
    walkthrough:
      "Four expense words — Ads, Rent, Tools, Travel — meet four ledger account words, and the two sets share nothing, so UNION ALL of it lands at eight distinct words. COUNT reports the size; GROUP_CONCAT would build the list rather than measure it; memo would drag eighty memo strings into the lexicon; a 100000-cent floor would keep only Rent and shrink the count to five. Eight words, two languages, zero overlap — the bridge nobody has built yet.",
  },
  {
    id: "cs-882",
    tier: "hard",
    topic: "s5",
    universe: "refund-audit",
    title: "The union swallows the intersect",
    brief:
      "From: Refund analyst. Re: the two-flag customer list.\n\nFlag one: a delivered order. Flag two: a pending order. Stack the delivered and cancelled buyers, then intersect with the pending buyers — and watch carefully, because in SQLite the chain reads left to right and the union happens first.",
    ask: "Count customers in (delivered UNION cancelled) INTERSECT pending — evaluated left to right.",
    template: `SELECT {1}(v) AS both_flags FROM (
  SELECT DISTINCT customer_id AS v FROM orders WHERE status = 'delivered'
  UNION
  SELECT DISTINCT customer_id FROM orders WHERE status = {2}
  INTERSECT
  SELECT DISTINCT {3} FROM orders WHERE status = 'pending'
);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the flag counter",
        why: "The deliverable is a headcount — COUNT over the chained result.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "arm 2's status filter",
        why: "The union's second arm contributes cancelled buyers — joined to delivered before the intersect runs.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "arm 3's id column",
        why: "The intersect must compare the same kind of id — customer_id, not the order's own id.",
      },
    ],
    distractors: ["SUM", "region", "method"],
    walkthrough:
      "Left to right: delivered buyers UNION cancelled buyers first, then INTERSECT pending buyers. The union pile intersects the pending list at eight customers — the same eight who have both a delivered and a pending order, because cancelled adds nobody new here. SUM would total the ids, and region and method are no columns of orders — both error out, underlining that the intersect must compare customer ids, which both surviving arms actually ship. Eight two-flag customers, chain intact.",
  },
  {
    id: "cs-883",
    tier: "hard",
    topic: "s5",
    universe: "supplier",
    title: "Uppercase goes first",
    brief:
      "From: Platform analyst. Re: the collation demo.\n\nUnion the customer regions, order statuses and payment methods into one word pile, sort ascending, and keep the first three — a neat demo of how SQLite's binary collation treats uppercase versus lowercase.",
    ask: "Union regions, statuses and methods; sort ascending; keep the top three words.",
    template: `SELECT v FROM (
  SELECT {1} AS v FROM customers
  UNION
  SELECT status FROM orders
  UNION
  SELECT {2} FROM payments WHERE amount_cents >= 300000
)
ORDER BY v {3} LIMIT 3;`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "arm 1's word column",
        why: "The customer side contributes its region words — APAC, EU, LATAM, US — to the pile.",
      },
      {
        answer: "method",
        kind: "keyword",
        label: "arm 3's word column",
        why: "The till side contributes wire — the only method that ever carries a heavy lift — to the pile.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the collation sort",
        why: "ASC with binary collation puts the all-uppercase region words ahead of every lowercase word.",
      },
    ],
    distractors: ["id", "paid_on", "DESC"],
    walkthrough:
      "The pile holds nine words: four uppercase regions, four lowercase statuses and one heavy-lift wire — card never moves 3000 dollars in one go. Binary collation sorts byte values, and every uppercase letter precedes every lowercase one — so ASC keeps APAC, EU, LATAM as the top three. Numeric ids would sort below all text and wreck the demo, paid_on dates would do the same, and DESC would show the lowercase tail instead of the uppercase head. Three words, one collation lesson: in SQLite, SHOUTING sorts first.",
  },
  {
    id: "cs-884",
    tier: "easy",
    topic: "s6",
    universe: "fraud",
    title: "Two rails, one till",
    brief:
      "From: Fraud analyst. Re: the rail-label pass.\n\nRaw method codes read fine to the database but the fraud review wants plain language: wire transfers are bank transfers, everything else rides the card network. Relabel every settlement with a CASE branch and count each rail.",
    ask: "Branch payment methods into bank transfer and card network with CASE; count each rail.",
    template: `SELECT CASE {1} WHEN 'wire' THEN 'bank transfer' ELSE 'card network' END AS rail, {2} AS n FROM payments GROUP BY rail ORDER BY rail {3};`,
    slots: [
      {
        answer: "method",
        kind: "keyword",
        label: "the branched column",
        why: "The rail of each settlement is its method — CASE method WHEN 'wire' splits the till in two.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the rail counter",
        why: "Each labeled rail needs its settlement count — COUNT(*) tallies the rows per branch.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing direction",
        why: "ASC files 'bank transfer' before 'card network' — the alphabetical order of the new labels.",
      },
    ],
    distractors: ["paid_on", "SUM(amount_cents)/100", "DESC"],
    walkthrough:
      "CASE method WHEN 'wire' hands eleven settlements the 'bank transfer' label; the ELSE sweeps the remaining sixteen onto 'card network'. GROUP BY rail collapses each label into one counted row. Branching on paid_on would compare dates against the word 'wire' and dump every settlement into the ELSE bucket, summing cents would price the rails instead of counting them, and DESC would flip the filing. Eleven bank transfers, sixteen card swipes — the till, in plain language.",
  },
  {
    id: "cs-885",
    tier: "easy",
    topic: "s6",
    universe: "growth",
    title: "Founders and scalers",
    brief:
      "From: Head of Growth. Re: the cohort split.\n\nThe story we tell investors starts with a four-account founding cohort. Branch customers by signup year — created in 2023 are founding, everyone else is scale-up — and count each cohort.",
    ask: "Branch customers into founding (2023 signups) and scale-up cohorts; count each.",
    template: `SELECT CASE WHEN {1} LIKE '2023%' THEN 'founding' ELSE 'scale-up' END AS cohort, {2} AS n FROM customers GROUP BY cohort ORDER BY cohort {3};`,
    slots: [
      {
        answer: "created_at",
        kind: "keyword",
        label: "the branched date column",
        why: "Cohorts come from the signup stamp — created_at LIKE '2023%' catches the founding year.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the cohort counter",
        why: "Each cohort needs its headcount — COUNT(*) tallies accounts per branch.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing direction",
        why: "ASC files founding before scale-up — the story reads in chronological order.",
      },
    ],
    distractors: ["name", "SUM(id)", "DESC"],
    walkthrough:
      "CASE WHEN created_at LIKE '2023%' puts the four 2023 signups on the founding shelf; the ELSE sweeps the other twelve onto scale-up. GROUP BY cohort yields one counted row per shelf. Branching on name would compare names against a year pattern and send everyone to scale-up, summing ids would measure account numbers instead of counting accounts, and DESC would tell the story backwards. Four founders, twelve scalers — the origin myth, quantified.",
  },
  {
    id: "cs-886",
    tier: "easy",
    topic: "s6",
    universe: "funnel",
    title: "Home market and export",
    brief:
      "From: Regional strategy. Re: the market split.\n\nFor the strategy offsite we frame the roster as two markets: the EU accounts are the home market, every other region is export. Branch the roster with a CASE flag and count each market.",
    ask: "Branch customers into home (EU) and export markets; count each.",
    template: `SELECT CASE {1} WHEN 'EU' THEN 'home' ELSE 'export' END AS market, {2} AS n FROM customers GROUP BY market ORDER BY market {3};`,
    slots: [
      {
        answer: "region",
        kind: "keyword",
        label: "the branched column",
        why: "The market of an account is its region — CASE region WHEN 'EU' splits home from export.",
      },
      {
        answer: "COUNT(*)",
        kind: "keyword",
        label: "the market counter",
        why: "Each market needs its account count — COUNT(*) tallies rows per branch.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing direction",
        why: "ASC files export before home — the alphabetical order of the two labels.",
      },
    ],
    distractors: ["city", "SUM(id)", "DESC"],
    walkthrough:
      "CASE region WHEN 'EU' labels the eight European accounts home; the ELSE labels the other eight export. GROUP BY market collapses each label into one counted row — eight and eight, a perfectly even split nobody expected. Branching on city would compare city names against 'EU' and mark everyone export, summing ids would total account numbers rather than count them, and DESC would flip the filing. Eight home, eight export — the offsite's opening slide.",
  },
  {
    id: "cs-887",
    tier: "easy",
    topic: "s6",
    universe: "month-close",
    title: "Three lanes for a bill",
    brief:
      "From: Billing ops. Re: the invoice triage board.\n\nThe triage board renames the three invoice states in plain language: paid bills are banked, open bills are on watch, and void bills are dead. Route every invoice with a CASE ladder and count each lane.",
    ask: "Branch invoice statuses into banked, watch and dead lanes; count each lane.",
    template: `SELECT CASE status WHEN {1} THEN 'banked' WHEN 'open' THEN 'watch' ELSE {2} END AS lane, COUNT(*) AS n FROM invoices GROUP BY lane ORDER BY n {3};`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the banked branch",
        why: "Paid invoices are the banked lane — the first WHEN routes them by their status value.",
      },
      {
        answer: "'dead'",
        kind: "keyword",
        label: "the void lane label",
        why: "Everything not paid or open — the single void bill — falls to the ELSE and becomes dead.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the filing direction",
        why: "DESC leads with the busiest lane: twenty-one banked bills above six watching and one dead.",
      },
    ],
    distractors: ["'void'", "'watch'", "ASC"],
    walkthrough:
      "The CASE ladder routes twenty-one paid invoices to banked, six open ones to watch, and the ELSE catches the lone void as dead. GROUP BY lane counts each lane: 21, 6, 1. Branching the first WHEN on 'void' would bank the dead bill and kill the twenty-one paid ones, reusing 'watch' as the ELSE label would collide two lanes into one name, and ASC would lead the board with the single corpse. The board reads: banked 21, watch 6, dead 1.",
  },
  {
    id: "cs-888",
    tier: "easy",
    topic: "s6",
    universe: "inventory",
    title: "Shelf check, two buckets",
    brief:
      "From: Warehouse lead. Re: the shelf-depth pass.\n\nAnything with 100 or more units on hand counts as stocked; the rest is thin and goes on the reorder list. Branch the catalog with CASE, then for each bucket report both the product count and the total units on the shelf.",
    ask: "Branch products into stocked (stock >= 100) and thin; count each and sum their units.",
    template: `SELECT CASE WHEN {1} >= 100 THEN 'stocked' ELSE 'thin' END AS shelf, COUNT(*) AS n, {2}(stock) AS units FROM products GROUP BY shelf ORDER BY shelf {3};`,
    slots: [
      {
        answer: "stock",
        kind: "keyword",
        label: "the branched column",
        why: "Shelf depth is the stock count — CASE WHEN stock >= 100 draws the two-bucket line.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the units aggregate",
        why: "The reorder meeting wants units per bucket, not just products — SUM(stock) adds the shelf up.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing direction",
        why: "ASC files stocked before thin — the healthy shelf leads the report.",
      },
    ],
    distractors: ["price", "MAX", "DESC"],
    walkthrough:
      "Ten products sit at 100 or more units — the stocked bucket, 2450 units deep. Six fall below the line — thin, 395 units — and go on the reorder list. Branching on price would sort by cost instead of depth and split four against twelve, MAX would report only the deepest single shelf in each bucket, and DESC would lead with the skinny shelf. Two buckets, ten healthy and six thin — the pass took one query.",
  },
  {
    id: "cs-889",
    tier: "easy",
    topic: "s6",
    universe: "funnel",
    title: "Orders by the quarter",
    brief:
      "From: Board prep. Re: the order-rhythm strip.\n\nThe funnel slide wants order volume bucketed by calendar quarter using a CASE ladder over the order month. Four branches, one count per quarter, filed in calendar order.",
    ask: "Branch order months into Q1–Q4 with CASE; count orders per quarter.",
    template: `SELECT CASE WHEN substr(created_at, 6, 2) IN ({1}) THEN 'Q1' WHEN substr(created_at, 6, 2) IN ('04','05','06') THEN 'Q2' WHEN substr(created_at, 6, 2) IN ('07','08','09') THEN {2} ELSE 'Q4' END AS q, COUNT(*) AS n FROM orders GROUP BY q ORDER BY q {3};`,
    slots: [
      {
        answer: "'01','02','03'",
        kind: "keyword",
        label: "the Q1 month list",
        why: "Q1 owns the first three months — the IN list catches January through March orders.",
      },
      {
        answer: "'Q3'",
        kind: "keyword",
        label: "the Q3 branch label",
        why: "The third branch needs its own quarter label — 'Q3' names the July-to-September bucket.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar filing",
        why: "ASC files Q1 through Q4 — the strip reads in calendar order down the page.",
      },
    ],
    distractors: ["'01','02'", "'q3'", "DESC"],
    walkthrough:
      "Four branches, four counts: Q1 takes 38 orders — the first-quarter surge — then 21, 24 and 20. Dropping March from the Q1 list would silently push thirty-odd orders into the ELSE bucket and corrupt Q4, a lowercase 'q3' would split the quarter into two labels under binary collation, and DESC would run the strip backwards. The rhythm: a heavy Q1, then three quarters of steady churn — that is the seasonality the board will probe.",
  },
  {
    id: "cs-890",
    tier: "medium",
    topic: "s6",
    universe: "expense",
    title: "The fixed floor's share",
    brief:
      "From: CFO. Re: the fixed-cost ratio.\n\nThe rent line is the fixed floor; everything else is variable. In one query — one row, two columns — price the fixed floor and the variable spend separately with two CASE-conditioned sums.",
    ask: "Sum rent money as fixed and all other expense money as variable, in one row.",
    template: `SELECT {1}(SUM(CASE WHEN category = 'Rent' THEN amount_cents ELSE 0 END), 2) AS fixed, ROUND(SUM(CASE WHEN category {2} 'Rent' THEN amount_cents ELSE 0 END)/100.0, 2) AS variable FROM {3};`,
    slots: [
      {
        answer: "ROUND",
        kind: "keyword",
        label: "the dollar wrapper",
        why: "The fixed column divides cents by 100 — ROUND keeps the figure at two decimals.",
      },
      {
        answer: "!=",
        kind: "keyword",
        label: "the variable predicate",
        why: "Variable spend is everything that is not rent — category != 'Rent' keeps the other three categories.",
      },
      {
        answer: "expenses",
        kind: "keyword",
        label: "the source table",
        why: "Both sums read the expense book — the single FROM behind the one-row report.",
      },
    ],
    distractors: ["COUNT", "=", "orders"],
    walkthrough:
      "Two CASE-conditioned sums, one row. Fixed: the fourteen rent posts sum to 16800 dollars — the floor. Variable: the other twenty-two checks sum to 8616. Wrapping with ROUND keeps the cents arithmetic clean; flipping to = would price variable spend as rent and double-count the floor; orders has no category column and dies on contact. Fixed 16800 against variable 8616 — the floor carries two-thirds of all spend, which is exactly the ratio slide three needs.",
  },
  {
    id: "cs-891",
    tier: "medium",
    topic: "s6",
    universe: "supplier",
    title: "The supplier podium",
    brief:
      "From: Procurement. Re: the rating podium.\n\nRatings 4.5 and above earn elite; 4.0 to just under 4.5 is solid; below 4.0 is basic. Build the podium with a CASE ladder over the supplier rating and count each band.",
    ask: "Branch supplier ratings into elite (>= 4.5), solid (>= 4.0) and basic; count each band.",
    template: `SELECT CASE WHEN rating >= {1} THEN 'elite' WHEN rating >= 4.0 THEN {2} ELSE 'basic' END AS band, COUNT(*) AS n FROM {3} GROUP BY band ORDER BY band;`,
    slots: [
      {
        answer: "4.5",
        kind: "number",
        noVerify: true,
        label: "the elite threshold",
        why: "Elite begins at 4.5 — the first WHEN draws the top of the podium.",
      },
      {
        answer: "'solid'",
        kind: "keyword",
        label: "the middle-band label",
        why: "Ratings from 4.0 up to but not including 4.5 are solid — the second branch's label.",
      },
      {
        answer: "suppliers",
        kind: "keyword",
        label: "the source table",
        why: "Ratings live on the supplier roster — six vendors, one band each.",
      },
    ],
    distractors: ["4.3", "'core'", "products"],
    walkthrough:
      "The ladder reads top-down and first match wins: two suppliers at 4.5 or better take elite, three between 4.0 and 4.4 take solid, and the one below 4.0 lands basic. Lowering the elite line to 4.3 would promote a third supplier into the top band, a 'core' label would invent a fourth band name the podium never had, and products carry no rating column at all. Two elite, three solid, one basic — the podium, from one query.",
  },
  {
    id: "cs-892",
    tier: "medium",
    topic: "s6",
    universe: "pricing",
    title: "Three sizes of ticket",
    brief:
      "From: Pricing lead. Re: the ticket-size zoo.\n\nThe pricing review names three animals: orders of 300 dollars or more are whales, 150 up to 300 are dolphins, and the rest are minnows. Build the zoo with a CASE ladder and count each species, busiest species on top.",
    ask: "Branch order totals into whale, dolphin and minnow bands; count each, biggest band first.",
    template: `SELECT CASE WHEN total >= 300 THEN {1} WHEN total >= {2} THEN 'dolphin' ELSE 'minnow' END AS pod, COUNT(*) AS n FROM orders GROUP BY pod ORDER BY n {3};`,
    slots: [
      {
        answer: "'whale'",
        kind: "keyword",
        label: "the top-band label",
        why: "The 300-dollar-and-up branch is the whale pod — the first WHEN's label.",
      },
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the dolphin threshold",
        why: "Dolphins start at 150 dollars — the second WHEN draws the line under the whales.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the filing direction",
        why: "DESC leads with the biggest pod — forty-nine whales top the zoo.",
      },
    ],
    distractors: ["'dolphin'", "200", "ASC"],
    walkthrough:
      "The ladder: forty-nine orders at 300 or more are whales, twenty-four between 150 and 300 are dolphins, thirty below 150 are minnows. Reusing 'dolphin' on the top branch would merge the two big pods into seventy-three and erase the whales, moving the dolphin line to 200 would strand sixteen orders in the wrong pod, and ASC would open the zoo with the dolphins. Whales 49, dolphins 24, minnows 30 — the ticket-size zoo, counted.",
  },
  {
    id: "cs-893",
    tier: "medium",
    topic: "s6",
    universe: "fraud",
    title: "Rails and their heavy lifts",
    brief:
      "From: Payments analyst. Re: the heavy-lift audit.\n\nA single settlement of 3000 dollars or more is a heavy lift. For each rail — card and wire — report the settlement count, the heavy-lift money, and the routine money, using two CASE-conditioned sums per rail.",
    ask: "Per payment method, count settlements and split money into heavy (>= 3000 dollars) and routine via CASE.",
    template: `SELECT method, COUNT(*) AS n, ROUND(SUM(CASE WHEN amount_cents >= {1} THEN amount_cents ELSE 0 END)/100.0, 2) AS big_money, ROUND(SUM(CASE WHEN amount_cents < 300000 THEN {2} ELSE 0 END)/100.0, 2) AS std_money FROM {3} GROUP BY method ORDER BY method;`,
    slots: [
      {
        answer: "300000",
        kind: "number",
        noVerify: true,
        label: "the heavy-lift threshold",
        why: "The books keep cents — 300000 cents is the 3000-dollar line for a heavy lift.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the routine money column",
        why: "Routine settlements carry their own amount — the ELSE-free branch sums amount_cents under the line.",
      },
      {
        answer: "payments",
        kind: "keyword",
        label: "the source table",
        why: "Settlements live on payments — method splits them into the two rails.",
      },
    ],
    distractors: ["500000", "id", "invoices"],
    walkthrough:
      "Two rails, two sums each. Card: sixteen settlements, 7091 dollars of heavy lifts and 30273 routine. Wire: eleven settlements, 14828 heavy and 174 routine — the wire rail exists almost solely for the big moves. Raising the line to 5000 dollars would empty the wire heavy column entirely, summing ids would total settlement numbers instead of cents, and invoices carry no method column at all. The heavy-lift map: card does the volume, wire does the weight.",
  },
  {
    id: "cs-894",
    tier: "hard",
    topic: "s6",
    universe: "month-close",
    title: "The year in one row",
    brief:
      "From: Board ops. Re: the one-row revenue strip.\n\nThe board template allows exactly one row. Compress all of 2024-25 order revenue into four quarter columns using four CASE-conditioned sums — Q1 through Q4, one row, no stacking.",
    ask: "Pivot order revenue into four quarter columns with CASE-conditioned sums, one row total.",
    template: `SELECT ROUND(SUM(CASE WHEN substr(created_at, 6, 2) IN ('01','02','03') THEN {1} ELSE {3} END), 2) AS q1,
       ROUND(SUM(CASE WHEN substr(created_at, 6, 2) IN ('04','05','06') THEN total ELSE 0 END), 2) AS q2,
       ROUND(SUM(CASE WHEN substr(created_at, 6, 2) IN ({2}) THEN total ELSE 0 END), 2) AS q3,
       ROUND(SUM(CASE WHEN substr(created_at, 6, 2) IN ('10','11','12') THEN total ELSE 0 END), 2) AS q4
FROM orders;`,
    slots: [
      {
        answer: "total",
        kind: "keyword",
        label: "the Q1 money column",
        why: "Each Q1 order contributes its total — CASE hands SUM the right column per row.",
      },
      {
        answer: "'07','08','09'",
        kind: "keyword",
        label: "the Q3 month list",
        why: "The third column owns July through September — its IN list must say so.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the off-quarter contribution",
        why: "Rows outside Q1 must contribute nothing to the q1 column — ELSE 0 keeps the sum honest.",
      },
    ],
    distractors: ["amount_cents", "'07','08'", "100"],
    walkthrough:
      "One row, four columns: 14018.72, 7426.65, 6661.97, 6725.94. Each CASE scans the order's month and either contributes its total to that quarter's sum or contributes the ELSE value — zero — to every other column. orders has no amount_cents column and dies immediately, dropping September from the Q3 list would silently delete its 600-plus dollars from the year, and an ELSE of 100 would inject a phantom 6500 dollars into Q1 alone. One row, four quarters, the whole year on a single line.",
  },
  {
    id: "cs-895",
    tier: "hard",
    topic: "s6",
    universe: "funnel",
    title: "The four-region grid",
    brief:
      "From: Regional ops. Re: the status grid for the QBR.\n\nThe grid is four regions down, four statuses across: pending, shipped, delivered, cancelled counts per region. Join orders to customers for the region, then build each status column with its own CASE-conditioned count.",
    ask: "Pivot order-status counts per region into four CASE columns, regions alphabetical.",
    template: `SELECT c.region,
       SUM(CASE WHEN o.status = 'pending' THEN 1 ELSE 0 END) AS p,
       SUM(CASE WHEN o.status = {1} THEN 1 ELSE 0 END) AS s,
       SUM(CASE WHEN {2} = 'delivered' THEN 1 ELSE 0 END) AS d,
       SUM(CASE WHEN o.status = 'cancelled' THEN 1 ELSE 0 END) AS x
FROM orders o JOIN customers c ON {3} = c.id
GROUP BY c.region
ORDER BY c.region;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the shipped column's filter",
        why: "The s column counts shipped orders — its CASE must match status = 'shipped'.",
      },
      {
        answer: "o.status",
        kind: "keyword",
        label: "the delivered column's test column",
        why: "With two tables joined, the delivered branch must qualify the column — o.status, unambiguous.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the join predicate",
        why: "Orders reach their region through the buyer — ON o.customer_id = c.id is the join spine.",
      },
    ],
    distractors: ["'pending'", "c.region", "c.id"],
    walkthrough:
      "The grid reads: APAC 5/8/21/3, EU 6/12/24/3, LATAM 0/0/2/0, US 3/10/5/1 — pending, shipped, delivered, cancelled per region. Reusing 'pending' in the shipped column would print the same counts twice, testing c.region against 'delivered' would zero the whole delivered column, and joining on c.id to itself would fan every order out across all sixteen customers and multiply every cell. Four regions, four statuses, one honest grid.",
  },
  {
    id: "cs-896",
    tier: "hard",
    topic: "s6",
    universe: "refund-audit",
    title: "Billed by region, settled or not",
    brief:
      "From: Collections. Re: the regional settlement picture.\n\nFor the recovery plan we need, per customer region, the money sitting on paid invoices and the money still sitting on open ones. Join invoices to customers for the region and build the two money columns with CASE-conditioned sums.",
    ask: "Per region, sum paid-invoice money and open-invoice money as two CASE columns.",
    template: `SELECT c.region,
       ROUND(SUM(CASE WHEN i.status = {1} THEN i.amount_cents ELSE 0 END)/100.0, 2) AS paid_money,
       ROUND(SUM(CASE WHEN i.status = 'open' THEN i.{2} ELSE 0 END)/100.0, 2) AS open_money
FROM invoices i JOIN customers c ON c.id = i.customer_id
GROUP BY {3}
ORDER BY c.region;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled column's filter",
        why: "The paid_money column must match paid invoices — status = 'paid' inside the CASE.",
      },
      {
        answer: "amount_cents",
        kind: "keyword",
        label: "the open money column",
        why: "Open money is the invoice amount — i.amount_cents summed only where status is open.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the grouping key",
        why: "The report is per region — GROUP BY c.region rolls customers up to their market.",
      },
    ],
    distractors: ["'void'", "id", "i.customer_id"],
    walkthrough:
      "Three rows, since LATAM never billed: APAC 22369 paid against zero open, EU 32336 paid against 14672 open, US 11738 paid against 4937 open. The paid column matches status 'paid', the open column sums amount_cents only on open bills. The lone void bill's 925 belongs to neither column, which is exactly right for a recovery plan; summing ids would total invoice numbers; grouping by customer would shred the regional roll-up. Europe holds the biggest open balance — start the chase there.",
  },
  {
    id: "cs-897",
    tier: "hard",
    topic: "s6",
    universe: "inventory",
    title: "The premium paradox",
    brief:
      "From: Inventory planner. Re: the depth-by-tier check.\n\nAre the expensive shelves also the deep ones? Split products into premium (price 100 up) and standard, then count each tier's deep stock (100 or more units) and lean stock separately with CASE-conditioned counts.",
    ask: "Per price tier, count deep (stock >= 100) and lean products with two CASE columns.",
    template: `SELECT CASE WHEN {1} >= 100 THEN 'premium' ELSE 'standard' END AS tier,
       SUM(CASE WHEN stock >= 100 THEN 1 ELSE 0 END) AS deep,
       SUM(CASE WHEN stock < 100 THEN {2} ELSE 0 END) AS lean
FROM products
GROUP BY tier
ORDER BY tier {3};`,
    slots: [
      {
        answer: "price",
        kind: "keyword",
        label: "the tier branch column",
        why: "Tiers come from price — CASE WHEN price >= 100 splits premium from standard.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the lean counter's contribution",
        why: "Counting via SUM means each lean product contributes a 1 to the tally.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the filing direction",
        why: "ASC files premium before standard — the expensive shelf leads the paradox.",
      },
    ],
    distractors: ["stock", "0", "DESC"],
    walkthrough:
      "The paradox in four cells: premium tier — four products, zero deep, four lean; standard tier — twelve products, ten deep, two lean. Branching on stock would tier the shelves by depth instead of price and stand the question on its head, an ELSE contribution of 0 would report no lean products anywhere, and DESC would bury the premium row at the bottom. Expensive sells scarce: every premium product is thin, every deep shelf is standard — plan the reorder around it.",
  },
  {
    id: "cs-898",
    tier: "hard",
    topic: "s6",
    universe: "expense",
    title: "The fixed cost goes first",
    brief:
      "From: Controller. Re: the close-binder category page.\n\nThe binder lists expense categories with counts and totals, but the filing rule is custom: Rent pins to the top of the page no matter what, and everything else files alphabetically underneath it.",
    ask: "List expense categories with counts and totals, Rent pinned first, the rest alphabetical.",
    template: `SELECT category, COUNT(*) AS n, ROUND(SUM(amount_cents)/100.0, 2) AS money FROM expenses GROUP BY category
ORDER BY CASE WHEN category = {1} THEN 0 ELSE 1 END, {2} {3};`,
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the pinned category",
        why: "Rent alone earns sort key 0 — the CASE pins the fixed cost to the top of the page.",
      },
      {
        answer: "category",
        kind: "keyword",
        label: "the secondary sort column",
        why: "Underneath the pin, categories file by name — category is the alphabetical tail key.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the tail direction",
        why: "ASC runs the tail Ads, Tools, Travel under the pinned Rent line.",
      },
    ],
    distractors: ["DESC", "money"],
    walkthrough:
      "The CASE hands Rent key 0 and everyone else key 1, so the fixed cost pins to the top: Rent, fourteen checks, 16800. Then the alphabetical tail takes over: Ads, Tools, Travel. Dropping the pin would let Ads lead — Rent only keeps the crown because the CASE says so, not because of its size — DESC would run the tail backwards, and sorting by money would order the tail by spend and hide the pin entirely. The page reads: the floor first, then the growth lines by name.",
  },
  {
    id: "cs-899",
    tier: "hard",
    topic: "s6",
    universe: "growth",
    title: "Where churn lives",
    brief:
      "From: Head of Growth. Re: the churn map.\n\nTwo inactive accounts tell us where the product fails. Build a CASE-conditioned count of inactive accounts per region, then use HAVING so only regions that actually lost someone survive the report.",
    ask: "Count inactive customers per region and keep only regions with at least one.",
    template: `SELECT region, SUM(CASE WHEN active = {1} THEN 1 ELSE 0 END) AS off
FROM {2}
GROUP BY region
HAVING off >= {3}
ORDER BY region;`,
    slots: [
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the churned flag",
        why: "Inactive accounts carry active = 0 — the CASE counts only those rows.",
      },
      {
        answer: "customers",
        kind: "keyword",
        label: "the source table",
        why: "Churn lives on the customer roster — region and active are both customer columns.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the survival bar",
        why: "HAVING off >= 1 keeps every region that lost at least one account — the bar the clean regions fail.",
      },
    ],
    distractors: ["orders", "region"],
    walkthrough:
      "The CASE counts rows where active = 0, and HAVING off >= 1 then evicts every region with a clean slate. Two regions survive: APAC and EU, one churned account each — LATAM and US have lost nobody. Counting active = 1 would map the healthy fourteen instead, orders has neither column and dies, and comparing the count against region text matches nothing and empties the map. The churn map is two pins: one in APAC, one in EU — small enough to phone both owners.",
  },
  {
    id: "cs-900",
    tier: "hard",
    topic: "s6",
    universe: "pricing",
    title: "Every status, split at 150",
    brief:
      "From: Revenue ops. Re: the final review grid.\n\nOne grid for the review: per order status, the money in orders of 150 dollars or more, and the money below the line — two CASE-conditioned sums per status, ranked by the big-ticket column.",
    ask: "Per status, sum big (>= 150) and small (< 150) order money with two CASE columns, biggest big-ticket first.",
    template: `SELECT status,
       ROUND(SUM(CASE WHEN total >= {1} THEN total ELSE 0 END), 2) AS big_money,
       ROUND(SUM(CASE WHEN total < 150 THEN {2} ELSE 0 END), 2) AS small_money
FROM orders
GROUP BY status
ORDER BY {3} DESC;`,
    slots: [
      {
        answer: "150",
        kind: "number",
        noVerify: true,
        label: "the split line",
        why: "The review splits tickets at 150 dollars — the big column's CASE opens at that line.",
      },
      {
        answer: "total",
        kind: "keyword",
        label: "the small column's money",
        why: "Below the line, each order still contributes its own total to the small_money sum.",
      },
      {
        answer: "big_money",
        kind: "keyword",
        label: "the ranking column",
        why: "Ranking by big_money leads the grid with delivered's 13823.75 heavy haul.",
      },
    ],
    distractors: ["100", "1", "small_money"],
    walkthrough:
      "The grid: delivered 13823.75 big against 1747.32 small, shipped 11623.82 against 372.9, pending 5815.72 against 297.28, cancelled 756.7 against 395.79. Moving the line to 100 dollars would inflate every big column with mid-size tickets, counting rows with a 1 instead of summing totals would produce counts wearing dollar costumes, and ranking by small_money would hand the top row to delivered for the wrong reason. Four statuses, one split line — the review grid, closed.",
  },
];
