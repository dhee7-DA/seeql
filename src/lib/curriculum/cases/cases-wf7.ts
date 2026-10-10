// Case batch WF7 — window functions deep-dive, t7 (LAG & LEAD),
// cs-2251…cs-2275. Offset windows: previous/next rows, deltas, gaps.
import type { CaseStudy } from "./types";

export const casesWf7: CaseStudy[] = [
  {
    id: "cs-2251",
    tier: "easy",
    topic: "t7",
    universe: "growth",
    title: "The basket before this one",
    brief:
      "From: Growth lead. Re: the basket walk.\n\nWalk the order timeline (created_at ASC, id ASC) and show, on every order, the PREVIOUS basket's total — one step back in the walk. The very first order has no previous, so it reads NULL.",
    ask: "Show each order's previous basket total.",
    template: `SELECT id, created_at, total,
       {1}(total) OVER (ORDER BY created_at {2}, id ASC) AS prev_total
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "LAG reads one row BACK in the walk; LEAD would peek one row ahead — the opposite direction." },
      { answer: "ASC", kind: "keyword", label: "the walk direction", why: "The walk runs oldest to newest, so created_at ASC defines 'previous' as earlier in time." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the preview cut", why: "The preview carries twelve rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "DESC", "6"],
    walkthrough:
      "LAG(total) OVER (ORDER BY created_at ASC, id ASC) reaches one row back and borrows its total; the first row has nothing behind it and shows NULL. LEAD would look forward and label the NEXT basket as 'previous' — the columns would still fill, just pointing the wrong way. The direction flip quietly reverses time itself.",
  },
  {
    id: "cs-2252",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Month revenue, one step back",
    brief:
      "From: Controller. Re: the revenue walk.\n\nStage monthly revenue, then walk the months oldest to newest and carry each month's PREVIOUS revenue beside it — the MoM comparison's raw material. The first month reads NULL.",
    ask: "Carry each month's previous revenue beside it.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, {3}(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, revenue,
       {1}(revenue) OVER (ORDER BY month {2}) AS prev_revenue
FROM m
ORDER BY month;`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "LAG reaches the previous month's row; LEAD would borrow the NEXT month's revenue instead." },
      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Months run oldest to newest — ASC makes 'previous' mean the earlier calendar month." },
      { answer: "SUM", kind: "keyword", label: "the revenue fold", why: "Monthly revenue is the sum of the month's baskets — SUM in the staging CTE." },
    ],
    distractors: ["LEAD", "DESC", "COUNT"],
    walkthrough:
      "The CTE folds one revenue figure per month; LAG over the month walk borrows the previous month's figure for every row. The DESC flip would run the calendar backwards and label the future as history — every delta computed from it would be sign-flipped. LEAD would borrow from the month ahead.",
  },
  {
    id: "cs-2253",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "Growth percent, guarded",
    brief:
      "From: Controller. Re: the MoM column.\n\nThe close binder's growth column: stage monthly revenue, LAG the previous month, then compute the percent change in an outer layer — guarded so the first month reads NULL instead of dividing by nothing.",
    ask: "Compute month-over-month growth percent.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
)
SELECT month, ROUND(revenue, 2) AS revenue,
       {2}(100.0 * (revenue - prev) / prev, 2) AS growth_pct
FROM d
ORDER BY {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "Growth compares against the PREVIOUS month — LAG; LEAD would divide by the future." },
      { answer: "ROUND", kind: "keyword", label: "the percent dressing", why: "Growth reads cleanest at two decimals — ROUND dresses the division." },
      { answer: "month", kind: "keyword", label: "the binder order", why: "The binder reads month by month — ORDER BY month keeps the story chronological." },
    ],
    distractors: ["LEAD", "CAST", "revenue"],
    walkthrough:
      "Two layers keep the math honest: the staging CTE borrows the previous month with LAG, and the outer layer computes the guarded percent with ROUND. LEAD would measure against next month — a forecast wearing a retrospective's name. CAST to two decimals is not a thing; the dressing is ROUND. The first month's NULL prev is why the percent must be computed outside the window.",
  },
  {
    id: "cs-2254",
    tier: "easy",
    topic: "t7",
    universe: "funnel",
    title: "The basket after this one",
    brief:
      "From: Marketing funnel. Re: the forward walk.\n\nWalk the order timeline and show, on every order, the NEXT basket's total — one step forward. The final order has no successor, so it reads NULL.",
    ask: "Show each order's next basket total.",
    template: `SELECT id, created_at, total,
       {1}(total) OVER (ORDER BY created_at {2}, id ASC) AS next_total
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "LEAD reads one row FORWARD in the walk; LAG would borrow the previous basket instead." },
      { answer: "ASC", kind: "keyword", label: "the walk direction", why: "The walk runs oldest to newest, so ASC makes 'next' mean later in time." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the preview cut", why: "The preview carries twelve rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LAG", "DESC", "5"],
    walkthrough:
      "LEAD(total) OVER (ORDER BY created_at ASC, id ASC) borrows the following row's total; the last order shows NULL. LAG would point the column backwards — the values would still be real totals, just from the wrong neighbor. Note the template's ORDER BY uses the column once; the chip belongs in the window, not the display sort.",
  },
  {
    id: "cs-2255",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "Two steps back",
    brief:
      "From: Fraud spot-check. Re: the longer memory.\n\nSame timeline walk, but the examiner wants a TWO-step look-back: on every order, the total from two orders ago. The first two orders read NULL — there is nothing that far back.",
    ask: "Show the total from two orders back.",
    template: `SELECT id, total,
       {1}(total, {2}) OVER (ORDER BY created_at ASC, id ASC) AS prev2
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "Looking BACKWARD two steps is LAG with an offset; LEAD would look forward two steps." },
      { answer: "2", kind: "keyword", noVerify: true, label: "the step count", why: "Two orders back is offset 2 — LAG's second argument." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the preview cut", why: "The preview carries twelve rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "1", "5"],
    walkthrough:
      "LAG(total, 2) reaches past the immediate neighbor to the row two steps back — the walk's memory extends one further than usual. Offset 1 would grab the immediate previous basket; offset 3 would overreach. The LIMIT keeps the preview short; the first two rows read NULL because the walk hasn't accumulated enough history.",
  },
  {
    id: "cs-2256",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Previous payment per invoice",
    brief:
      "From: Controller. Re: the installment chain.\n\nFor each invoice's payments, show the PREVIOUS installment's amount — the chain of cash as it arrived. The chain resets per invoice; an invoice's first payment reads NULL.",
    ask: "Show each payment's previous installment.",
    template: `SELECT id, invoice_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2} ORDER BY paid_on ASC, id ASC) AS prev_installment
FROM payments
ORDER BY invoice_id, paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD to the previous installment — LAG; LEAD would borrow the next one." },
      { answer: "invoice_id", kind: "keyword", label: "the bill boundary", why: "PARTITION BY invoice_id restarts the chain per bill — installments never cross invoices." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the chain cut", why: "The check prints the first eight chains rows — LIMIT 8 trims the walked payments." },
    ],
    distractors: ["LEAD", "method", "4"],
    walkthrough:
      "The partition scopes the chain to one invoice; LAG borrows the previous installment inside it; the first payment of each bill reads NULL. Repartitioning by method would chain payments across DIFFERENT invoices — unrelated bills holding hands. LEAD would borrow the following installment, reversing the cash story.",
  },
  {
    id: "cs-2257",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Days between payments",
    brief:
      "From: Controller. Re: the cadence check.\n\nStage payments with their invoice's previous paid date (LAG), then compute the gap in days with julianday in an outer layer. The first payment of each invoice has no previous — its gap reads NULL.",
    ask: "Compute days since the previous payment per invoice.",
    template: `WITH w AS (
  SELECT id, invoice_id, paid_on,
         {1}(paid_on) OVER (PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC) AS prev
  FROM payments
)
SELECT id, invoice_id, paid_on,
       CAST(julianday(paid_on) - julianday({2}) AS INTEGER) AS gap_days
FROM w
ORDER BY invoice_id, paid_on, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The cadence measures back to the PREVIOUS payment — LAG; LEAD would measure to the next one." },
      { answer: "prev", kind: "keyword", label: "the staged column", why: "The julianday math runs in the outer layer against the staged prev column — windows can't nest inside it." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the check cut", why: "The check prints the first eight gap rows — LIMIT 8 trims the walked payments." },
    ],
    distractors: ["LEAD", "paid_on", "4"],
    walkthrough:
      "The staging CTE borrows the previous paid_on with LAG inside each invoice; the outer layer turns the pair of dates into a day count with julianday. Windows cannot nest inside julianday — that's why the LAG is staged first. LEAD would measure forward to the next installment, answering a different question about the same rows.",
  },
  {
    id: "cs-2258",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "Previous entry in my account",
    brief:
      "From: Fraud spot-check. Re: the account chains.\n\nWalk each ledger account's entries chronologically and show the PREVIOUS entry's date — the account's own heartbeat. Chains reset per account; an account's first entry reads NULL.",
    ask: "Show each entry's previous date within its account.",
    template: `SELECT id, account, entry_date,
       {1}(entry_date) OVER (PARTITION BY {2} ORDER BY entry_date ASC, id ASC) AS prev_date
FROM ledger_entries
ORDER BY account, entry_date ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The heartbeat looks BACKWARD to the previous booking — LAG; LEAD would borrow the next one." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account restarts the chain per ledger account." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the chain cut", why: "The check prints the first eight chain rows — LIMIT 8 trims the walked ledger." },
    ],
    distractors: ["LEAD", "entry_date", "4"],
    walkthrough:
      "The partition scopes each chain to one account; LAG borrows the previous booking's date inside it; the account's first entry reads NULL. Repartitioning by entry date would chain across ALL accounts booked that day — mixing the book. LEAD would borrow the following booking, pointing the heartbeat forward.",
  },
  {
    id: "cs-2259",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "Days between visits",
    brief:
      "From: Growth lead. Re: the return intervals.\n\nFor every order, show the days since THAT customer's previous order — the return interval. Stage the LAG per customer, then compute julianday days outside the window. First orders read NULL.",
    ask: "Compute days since the customer's previous order.",
    template: `WITH w AS (
  SELECT id, customer_id, created_at,
         {1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS prev
  FROM orders
)
SELECT id, customer_id,
       CAST(julianday(created_at) - julianday({2}) AS INTEGER) AS days_since_prev
FROM w
ORDER BY customer_id, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The interval measures back to the PREVIOUS visit — LAG; LEAD would measure to the next one." },
      { answer: "prev", kind: "keyword", label: "the staged column", why: "The julianday math runs outside the window against the staged prev column — windows can't nest." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the sample cut", why: "The sample prints the first ten intervals — LIMIT 10 trims the walked orders." },
    ],
    distractors: ["LEAD", "created_at", "5"],
    walkthrough:
      "The partition gives every customer their own timeline; LAG borrows their previous visit; the outer julianday turns the pair into days. LEAD would compute days until the NEXT order — a prediction instead of a history. The first order of each customer reads NULL because there is nothing behind it.",
  },
  {
    id: "cs-2260",
    tier: "medium",
    topic: "t7",
    universe: "pricing",
    title: "The next price up",
    brief:
      "From: Pricing review. Re: the ladder gaps.\n\nRank the catalog by price ascending (ties alphabetical) and show, on every product, the NEXT product's price up the ladder — the gap the pricing team could step into. The top product reads NULL.",
    ask: "Show each product's next price up the ladder.",
    template: `SELECT name, price,
       {1}(price) OVER (ORDER BY price {2}, name ASC) AS next_price
FROM products
ORDER BY price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The NEXT price up the ladder is one row FORWARD — LEAD; LAG would borrow the cheaper neighbor." },
      { answer: "ASC", kind: "keyword", label: "the ladder direction", why: "The ladder climbs cheapest-first, so ASC makes 'next' mean the pricier neighbor." },
      { answer: "16", kind: "keyword", noVerify: true, label: "the ladder cut", why: "LIMIT 16 keeps the whole sixteen-product ladder — trimming it would hide the NULL at the top." },
    ],
    distractors: ["LAG", "DESC", "8"],
    walkthrough:
      "LEAD(price) OVER the ascending ladder borrows the pricier neighbor; the dearest product reads NULL because nothing sits above it. LAG would borrow the cheaper neighbor — the gap downward, not upward. The DESC flip would turn the ladder upside down and 'next' would mean cheaper.",
  },
  {
    id: "cs-2261",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Both neighbors, one row",
    brief:
      "From: Controller. Re: the bracketed months.\n\nStage monthly revenue and show BOTH neighbors: the previous month's revenue and the next month's revenue on the same row. Edge months read NULL on the missing side.",
    ask: "Bracket each month with its neighbors' revenue.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, revenue,
       {1}(revenue) OVER (ORDER BY month ASC) AS prev_revenue,
       {2}(revenue) OVER (ORDER BY month ASC) AS next_revenue
FROM m
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the back chip", why: "The left bracket borrows from the PREVIOUS month — LAG." },
      { answer: "LEAD", kind: "keyword", label: "the forward chip", why: "The right bracket borrows from the NEXT month — LEAD." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the binder cut", why: "LIMIT 14 keeps every month so both NULL edges stay visible in the binder." },
    ],
    distractors: ["SUM", "AVG", "8"],
    walkthrough:
      "Two windows over one walk: LAG brackets from the left, LEAD from the right, and every month carries both neighbors. The first month's left bracket is NULL, the last month's right bracket is NULL — the edges of history. Swapping the chips would mirror the brackets; folding functions like SUM would replace neighbors with totals.",
  },
  {
    id: "cs-2262",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "The order before mine, per customer",
    brief:
      "From: Fraud spot-check. Re: the private timelines.\n\nWalk each customer's orders chronologically and show their PREVIOUS order's total — the account's own history, not the store's. Chains reset per customer; first orders read NULL.",
    ask: "Show the customer's previous basket on every order.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY {2} ORDER BY created_at ASC, id ASC) AS cust_prev
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The private history looks BACKWARD — LAG; LEAD would borrow the next basket." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id restarts the walk per account." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sample carries twelve walked rows — LIMIT 12 trims the private timelines." },
    ],
    distractors: ["LEAD", "status", "6"],
    walkthrough:
      "The partition scopes the walk to one customer; LAG borrows their previous basket inside it. Without the partition the walk would borrow across customers — the store's timeline, not the account's. LEAD would borrow the following basket, and the DESC flip would run the private timeline backwards.",
  },
  {
    id: "cs-2263",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The look-ahead default",
    brief:
      "From: Fraud spot-check. Re: the filled edges.\n\nSame forward peek — the NEXT order's total per customer — but the memo wants NO NULLs: the last order of each customer shows 0 instead. Use LEAD's third argument for the fill.",
    ask: "Peek at the next basket, filling the edge with zero.",
    template: `SELECT id, customer_id, total,
       {1}(total, {3}, {2}) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS next0
FROM orders
ORDER BY customer_id, created_at ASC, id ASC;`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "Peeking FORWARD is LEAD's job; LAG would fill the first row instead of the last." },
      { answer: "0.0", kind: "keyword", noVerify: true, label: "the edge fill", why: "The third argument fills missing rows — 0.0 keeps the column REAL and the edge numeric." },
      { answer: "1", kind: "keyword", noVerify: true, label: "the step count", why: "One row forward is offset 1 — LEAD's second argument." },
    ],
    distractors: ["LAG", "9.5", "2"],
    walkthrough:
      "LEAD(total, 1, 0.0) peeks one row ahead and fills the missing edge with 0.0 — the third argument is the default for rows with no future. The fill must be REAL (0.0, not 0) so the column's type stays consistent. LAG with the same fill would pad the FIRST order instead — a different edge entirely.",
  },
  {
    id: "cs-2264",
    tier: "medium",
    topic: "t7",
    universe: "pricing",
    title: "Price step per product line",
    brief:
      "From: Pricing review. Re: the price moves.\n\nWalk each product's order lines by id and show the PREVIOUS line's unit price — how the charged price moved sale to sale. Chains reset per product; first lines read NULL.",
    ask: "Show each line's previous price for its product.",
    template: `SELECT id, product_id, unit_price,
       {1}(unit_price) OVER (PARTITION BY {2} ORDER BY id ASC) AS prev_price
FROM order_items
ORDER BY product_id, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The move reads BACKWARD to the previous charge — LAG; LEAD would borrow the next sale's price." },
      { answer: "product_id", kind: "keyword", label: "the product boundary", why: "PARTITION BY product_id restarts the chain per product." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked lines." },
    ],
    distractors: ["LEAD", "order_id", "5"],
    walkthrough:
      "The partition scopes the chain to one product; LAG borrows the previous sale's price inside it. Repartitioning by order would chain lines within a basket — a different story. LEAD would borrow the following sale, pointing the price history forward.",
  },
  {
    id: "cs-2265",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Invoice chains per customer",
    brief:
      "From: Controller. Re: the billing cadence.\n\nWalk each customer's invoices by issue date and show the PREVIOUS invoice's amount — the billing rhythm per account. Chains reset per customer; first invoices read NULL.",
    ask: "Show each invoice's previous amount per customer.",
    template: `SELECT id, customer_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2} ORDER BY issued_on ASC, id ASC) AS prev_billed
FROM invoices
ORDER BY customer_id, issued_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The cadence looks BACKWARD to the previous bill — LAG; LEAD would borrow the next one." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "PARTITION BY customer_id restarts the chain per account." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked invoices." },
    ],
    distractors: ["LEAD", "status", "5"],
    walkthrough:
      "The partition scopes each chain to one customer; LAG borrows the previous bill's amount inside it. Repartitioning by status would chain across ALL customers in a bucket — unrelated accounts holding hands. LEAD would borrow the following bill, reversing the cadence.",
  },
  {
    id: "cs-2266",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The bill before this one",
    brief:
      "From: Spend report. Re: the vendor chains.\n\nWalk each vendor's bills chronologically and show the PREVIOUS bill's amount — the relationship's own rhythm. Chains reset per vendor; a vendor's first bill reads NULL.",
    ask: "Show each bill's previous amount per vendor.",
    template: `SELECT id, vendor, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2} ORDER BY spent_on ASC, id ASC) AS prev_bill
FROM expenses
ORDER BY vendor, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The rhythm looks BACKWARD to the previous bill — LAG; LEAD would borrow the next one." },
      { answer: "vendor", kind: "keyword", label: "the relationship boundary", why: "PARTITION BY vendor restarts the chain per supplier relationship." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked bills." },
    ],
    distractors: ["LEAD", "spent_on", "5"],
    walkthrough:
      "The partition scopes each chain to one vendor; LAG borrows the previous bill inside it. Repartitioning by category would chain across vendors within a spend type — the category's rhythm, not the relationship's. LEAD would borrow the following bill, pointing the rhythm forward.",
  },
  {
    id: "cs-2267",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The account switch detector",
    brief:
      "From: Fraud spot-check. Re: the switch flags.\n\nWalk ledger entries by id and flag account switches: stage the PREVIOUS entry's account with LAG, then stamp 'switch' when it differs from the current account (or is NULL), else 'same'.",
    ask: "Flag entries where the account changes.",
    template: `WITH w AS (
  SELECT id, account,
         {1}(account) OVER (ORDER BY id ASC) AS prev_account
  FROM ledger_entries
)
SELECT id, account,
       CASE WHEN prev_account IS NULL OR prev_account != account THEN 'switch' ELSE 'same' END AS flag
FROM w
ORDER BY {2}
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "A switch compares against the PREVIOUS entry — argument-less chips like NTILE would not run here." },
      { answer: "id", kind: "keyword", label: "the book order", why: "The ledger reads in booking order — ORDER BY id presents the flags as the book was written." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the book cut", why: "The check prints the first twelve flagged rows — LIMIT 12 trims the walked book." },
    ],
    distractors: ["paid_on", "account", "6"],
    walkthrough:
      "The staging CTE borrows the previous account with LAG over the id walk; the outer CASE stamps the flag, treating the very first entry (NULL prev) as a switch — the book opens by switching into its first account. LEAD would compare against the next entry and shift every flag one row up.",
  },
  {
    id: "cs-2268",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Cash cadence, whole book",
    brief:
      "From: Controller. Re: the cash walk.\n\nAcross the whole payments timeline (paid_on ASC, id ASC), show the PREVIOUS payment's date — the book's cash heartbeat, unpartitioned. The first payment reads NULL.",
    ask: "Show each payment's previous date across the book.",
    template: `SELECT id, paid_on,
       {1}(paid_on) OVER (ORDER BY paid_on {2}, id ASC) AS prev_cash
FROM payments
ORDER BY paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The heartbeat looks BACKWARD to the previous cash-in — LAG; LEAD would borrow the next one." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The walk runs oldest to newest, so ASC makes 'previous' mean earlier in time." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve cash rows — LIMIT 12 trims the book-wide heartbeat." },
    ],
    distractors: ["LEAD", "DESC", "6"],
    walkthrough:
      "LAG(paid_on) OVER the unpartitioned walk borrows the previous cash-in's date — the whole book as one heartbeat. The DESC flip would run the clock backwards. LEAD would borrow the following payment. No partition means every payment joins one chain — that's the memo's ask.",
  },
  {
    id: "cs-2269",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "New-customer flags",
    brief:
      "From: Growth lead. Re: the acquisition markers.\n\nWalk the global order timeline and flag first appearances: stage the PREVIOUS row's customer with LAG, then stamp 'new' when it differs from the current customer (or is NULL), else 'return'.",
    ask: "Flag each order as a new or returning customer.",
    template: `WITH w AS (
  SELECT id, customer_id, created_at,
         {1}(customer_id) OVER (ORDER BY created_at ASC, id ASC) AS prev_cust
  FROM orders
)
SELECT id, customer_id, created_at,
       CASE WHEN prev_cust IS NULL OR prev_cust != customer_id THEN 'new' ELSE 'return' END AS flag
FROM w
ORDER BY {2}
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "A first appearance compares against the PREVIOUS row — LAG; LEAD would compare against the future." },
      { answer: "created_at ASC, id ASC", kind: "keyword", label: "the timeline order", why: "The flags read in chronological order — the timeline the walk followed." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the sample cut", why: "The sample prints twelve flagged rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "customer_id", "6"],
    walkthrough:
      "The staging CTE borrows the previous row's customer with LAG over the timeline; the CASE stamps 'new' at every customer change and at the timeline's opening NULL. LEAD would compare against the NEXT row, shifting every flag one basket back — the acquisition markers would land on the wrong orders.",
  },
  {
    id: "cs-2270",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "Ads spend, one month back",
    brief:
      "From: Spend report. Re: the Ads rhythm.\n\nStage the Ads category's monthly spend, then carry the PREVIOUS month's Ads spend beside each month — the category's own rhythm. The first month reads NULL.",
    ask: "Carry the previous month's Ads spend beside each month.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', spent_on) AS month, SUM(amount_cents) AS spend
  FROM expenses
  WHERE category = '{2}'
  GROUP BY month
)
SELECT month, spend,
       {1}(spend) OVER (ORDER BY month ASC) AS prev_spend
FROM m
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The rhythm looks BACKWARD one month — LAG; LEAD would borrow the next month's spend." },
      { answer: "Ads", kind: "keyword", label: "the category gate", why: "WHERE Ads narrows the fold to the category the memo studies." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the rhythm cut", why: "The rhythm sheet prints twelve months — LIMIT 12 trims the walked series." },
    ],
    distractors: ["LEAD", "Rent", "6"],
    walkthrough:
      "The gate keeps only Ads bills; the CTE folds one spend per month; LAG over the calendar walk borrows the previous month's figure. Filtering to Rent would study the landlord's rhythm instead. LEAD would borrow the month ahead — a forecast wearing a retrospective's clothes.",
  },
  {
    id: "cs-2271",
    tier: "medium",
    topic: "t7",
    universe: "inventory",
    title: "Units sold, one month back",
    brief:
      "From: Inventory count. Re: the demand walk.\n\nJoin lines to orders, fold units sold per month, then carry the PREVIOUS month's units beside each month — demand's own heartbeat. The first month reads NULL.",
    ask: "Carry the previous month's units beside each month.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', o.created_at) AS month, SUM(oi.quantity) AS units
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  GROUP BY month
)
SELECT month, units,
       {1}(units) OVER (ORDER BY month {2}) AS prev_units
FROM m
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The heartbeat looks BACKWARD one month — LAG; LEAD would borrow the month ahead." },
      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Months run oldest to newest — ASC makes 'previous' the earlier month." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the first NULL heartbeat stays visible." },
    ],
    distractors: ["LEAD", "DESC", "6"],
    walkthrough:
      "The join hands each line its order month; the CTE folds one units figure per month; LAG borrows the previous month's demand. The DESC flip would run demand history backwards. LEAD would borrow the following month, and folding with a different column would study a different series.",
  },
  {
    id: "cs-2272",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "Payment gaps, whole book",
    brief:
      "From: Fraud spot-check. Re: the cash gaps.\n\nAcross the whole payments timeline, stage the PREVIOUS payment date with LAG, then compute the gap in days. The first payment reads NULL — nothing precedes it.",
    ask: "Compute days since the previous payment, book-wide.",
    template: `WITH w AS (
  SELECT id, paid_on,
         {1}(paid_on) OVER (ORDER BY paid_on ASC, id ASC) AS prev
  FROM payments
)
SELECT id, paid_on,
       CAST(julianday(paid_on) - julianday({2}) AS INTEGER) AS gap_days
FROM w
ORDER BY paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The gap measures BACKWARD to the previous cash-in — LAG; LEAD would measure forward." },
      { answer: "prev", kind: "keyword", label: "the staged column", why: "The julianday math runs outside the window against the staged prev column." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve gap rows — LIMIT 12 trims the book-wide cadence." },
    ],
    distractors: ["LEAD", "paid_on", "6"],
    walkthrough:
      "The staging CTE borrows the previous paid date over the unpartitioned walk; the outer layer turns the pair into days. LEAD would compute days UNTIL the next payment — a forecast. The book-wide walk has no partition: every payment joins one chain, exactly as the memo asks.",
  },
  {
    id: "cs-2273",
    tier: "medium",
    topic: "t7",
    universe: "pricing",
    title: "Previous rung's price",
    brief:
      "From: Pricing review. Re: the rung steps.\n\nWalk the catalog by price ascending (ties alphabetical) and show the PREVIOUS product's price — the step just below every rung. The cheapest product reads NULL.",
    ask: "Show the price just below every rung.",
    template: `SELECT name, price,
       {1}(price) OVER (ORDER BY price {2}, name ASC) AS lower_price
FROM products
ORDER BY price ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The step BELOW borrows from the previous rung — LAG; LEAD would borrow the pricier neighbor." },
      { answer: "ASC", kind: "keyword", label: "the ladder direction", why: "The ladder climbs cheapest-first, so ASC makes 'previous' mean the cheaper neighbor." },
      { answer: "16", kind: "keyword", noVerify: true, label: "the ladder cut", why: "LIMIT 16 keeps the whole ladder so the cheapest rung's NULL stays visible." },
    ],
    distractors: ["LEAD", "DESC", "8"],
    walkthrough:
      "LAG(price) OVER the ascending ladder borrows the cheaper neighbor; the cheapest product reads NULL. LEAD would borrow the pricier neighbor — the step up, not the step below. The DESC flip would invert the ladder so 'previous' means the pricier shelf.",
  },
  {
    id: "cs-2274",
    tier: "medium",
    topic: "t7",
    universe: "inventory",
    title: "Restock walk, previous shelf",
    brief:
      "From: Inventory count. Re: the restock walk.\n\nWalk products by stock ascending (ties alphabetical) and show the PREVIOUS product's stock — the shelf just below every rung of the restock walk. The emptiest shelf reads NULL.",
    ask: "Show the stock of the shelf below every rung.",
    template: `SELECT name, stock,
       {1}(stock) OVER (ORDER BY stock {2}, name ASC) AS lower_stock
FROM products
ORDER BY stock ASC, name ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The shelf BELOW borrows from the previous rung — LAG; LEAD would borrow the deeper shelf." },
      { answer: "ASC", kind: "keyword", label: "the walk direction", why: "The walk runs emptiest-first, so ASC makes 'previous' mean the shallower shelf." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve shelf rows — LIMIT 12 trims the restock walk." },
    ],
    distractors: ["LEAD", "DESC", "6"],
    walkthrough:
      "LAG(stock) OVER the ascending walk borrows the shallower shelf; the emptiest product reads NULL. LEAD would borrow the deeper shelf — the restock walk would point up instead of down. The DESC flip would start the walk at the deepest shelf.",
  },
  {
    id: "cs-2275",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "Invoice gaps per customer",
    brief:
      "From: Controller. Re: the billing gaps.\n\nFor every invoice, compute the days since that customer's PREVIOUS invoice. Stage the LAG per customer over the issue timeline, then compute julianday days outside the window.",
    ask: "Compute days since the customer's previous invoice.",
    template: `WITH w AS (
  SELECT id, customer_id, issued_on,
         {1}(issued_on) OVER (PARTITION BY customer_id ORDER BY issued_on ASC, id ASC) AS prev
  FROM invoices
)
SELECT id, customer_id,
       CAST(julianday(issued_on) - julianday({2}) AS INTEGER) AS days_since_prev
FROM w
ORDER BY customer_id, issued_on, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The gap measures BACKWARD to the previous bill — LAG; LEAD would measure to the next one." },
      { answer: "prev", kind: "keyword", label: "the staged column", why: "The julianday math runs outside the window against the staged prev column." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the gap cut", why: "The sheet prints ten gap rows — LIMIT 10 trims the walked invoices." },
    ],
    distractors: ["LEAD", "issued_on", "5"],
    walkthrough:
      "The partition scopes each chain to one customer; LAG borrows the previous issue date; the outer julianday turns the pair into days. LEAD would compute days until the NEXT bill — the collection horizon instead of the billing cadence. First invoices read NULL.",
  },
];
