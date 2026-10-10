// Case batch WF8 — window functions deep-dive, t7 (LAG & LEAD), cs-2276…cs-2300.
import type { CaseStudy } from "./types";

export const casesWf8: CaseStudy[] = [
  {
    id: "cs-2276",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The installment ahead",
    brief:
      "From: Controller. Re: the forward chain.\n\nFor each invoice's payments, show the NEXT installment's amount — the cash still to come in the chain. Chains reset per invoice; an invoice's last payment reads NULL.",
    ask: "Show each payment's next installment.",
    template: `SELECT id, invoice_id, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY invoice_id ORDER BY paid_on {2}, id ASC) AS next_installment
FROM payments
ORDER BY invoice_id, paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The chain peeks FORWARD to the next installment — LEAD; LAG would borrow the previous one." },
      { answer: "ASC", kind: "keyword", label: "the chain direction", why: "The chain runs forward in time — ASC makes next mean the later installment; DESC would reverse the cash story." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the chain cut", why: "The check prints the first eight chain rows — LIMIT 8 trims the walked payments." },
    ],
    distractors: ["LAG", "DESC", "5"],
    walkthrough:
      "The partition scopes the chain to one invoice; LEAD borrows the following installment inside it; the last payment of each bill reads NULL. LAG would point the chain backwards into cash already received, and the DESC flip would walk every bill from its last payment to its first — each next would point at older cash.",
  },
  {
    id: "cs-2277",
    tier: "medium",
    topic: "t7",
    universe: "growth",
    title: "My last basket",
    brief:
      "From: Growth lead. Re: the private timelines.\n\nWalk each customer's orders chronologically and show their PREVIOUS order's total — the account's own history rather than the store's. Chains reset per customer; first orders read NULL.",
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
      "The partition scopes the walk to one customer; LAG borrows their previous basket inside it; the id tiebreak keeps same-day orders in sequence. Repartitioning by status would chain baskets across ALL customers in a stage — unrelated accounts holding hands.",
  },
  {
    id: "cs-2278",
    tier: "medium",
    topic: "t7",
    universe: "growth",
    title: "My next basket",
    brief:
      "From: Growth lead. Re: the forward timelines.\n\nSame private walk, looking FORWARD: show each customer's NEXT order total. The account's last order reads NULL — nothing follows it.",
    ask: "Show the customer's next basket on every order.",
    template: `SELECT id, customer_id, total,
       {1}(total) OVER (PARTITION BY customer_id ORDER BY created_at {2}, id ASC) AS cust_next
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "Peeking FORWARD inside each account is LEAD's job; LAG would borrow the previous basket." },
      { answer: "ASC", kind: "keyword", label: "the walk direction", why: "The private timeline runs oldest to newest — ASC makes next the later basket; DESC would flip time." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sample carries ten walked rows — LIMIT 10 trims the private timelines." },
    ],
    distractors: ["LAG", "DESC", "5"],
    walkthrough:
      "The partition keeps each account's timeline separate; LEAD borrows the following basket; the final order of each customer reads NULL. LAG would point the column at history instead of the future, and the DESC flip would walk every account backwards so next meant the basket before — a forecast with its arrow reversed.",
  },
  {
    id: "cs-2279",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The filled first row",
    brief:
      "From: Fraud spot-check. Re: no NULL edges.\n\nSame look-back per customer, but the memo wants NO NULLs: each customer's FIRST order shows 0 instead of NULL. Use LAG's third argument as the fill, keeping the column REAL.",
    ask: "Show the previous basket, filling first orders with zero.",
    template: `SELECT id, customer_id, total,
       {1}(total, 1, {2}) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS prev0
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The fill pads the FIRST row, which is the look-back edge — LAG; LEAD would pad the last row." },
      { answer: "0.0", kind: "keyword", noVerify: true, label: "the edge fill", why: "The third argument fills missing rows — 0.0 keeps the column REAL and the edge numeric." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sample carries ten walked rows — LIMIT 10 trims the private timelines." },
    ],
    distractors: ["LEAD", "9.5", "5"],
    walkthrough:
      "LAG(total, 1, 0.0) borrows the previous basket and fills the missing edge with 0.0 — the third argument exists exactly for rows with no past. LEAD with the same fill would pad each customer's LAST order instead, and an INTEGER 0 would change the column's type.",
  },
  {
    id: "cs-2280",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "Up or down, stamped",
    brief:
      "From: Controller. Re: the direction stamps.\n\nStage monthly revenue, borrow the previous month with LAG, then stamp direction: 'up' when this month beats the previous, 'down' when below, 'start' on the first row.",
    ask: "Stamp each month's direction versus the previous.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
)
SELECT month,
       CASE WHEN prev IS NULL THEN 'start' WHEN revenue > prev THEN '{2}' ELSE 'down' END AS dir
FROM d
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "Direction compares against the PREVIOUS month — LAG; LEAD would compare against the future." },
      { answer: "up", kind: "keyword", label: "the rise stamp", why: "The rise literal must match the memo: 'up' when revenue beats prev — 'grow' would read as wrong data." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the 'start' stamp stays visible." },
    ],
    distractors: ["LEAD", "grow", "6"],
    walkthrough:
      "The staging CTE borrows the previous month; the CASE stamps the direction with the memo's exact literals. LEAD would compare against next month and flip every verdict's meaning. The first month stamps 'start' because its prev is NULL — the edge of history.",
  },
  {
    id: "cs-2281",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The revenue step",
    brief:
      "From: Controller. Re: the step column.\n\nStage monthly revenue, borrow the previous month, then show the STEP — this month minus the previous — rounded to two decimals. The first month's step reads NULL.",
    ask: "Compute the month-over-month revenue step.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), d AS (
  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev
  FROM m
)
SELECT month, {2}(revenue - prev, 2) AS step
FROM d
ORDER BY month
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The step measures against the PREVIOUS month — LAG; LEAD would subtract the future." },
      { answer: "ROUND", kind: "keyword", label: "the money dressing", why: "Steps are money — ROUND(..., 2) shows clean decimals." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the first NULL step stays visible." },
    ],
    distractors: ["LEAD", "CAST", "6"],
    walkthrough:
      "The staging CTE borrows the previous month; the outer layer subtracts and dresses the result with ROUND. CAST to two decimals is not a thing — the dressing is ROUND. LEAD would compute next-month steps and silently forecast.",
  },
  {
    id: "cs-2282",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "The stage before mine",
    brief:
      "From: Fraud spot-check. Re: the stage chains.\n\nWalk the global order timeline and show the PREVIOUS row's status — which funnel stage the store was in one basket ago. The first order reads NULL.",
    ask: "Show each order's previous status in the walk.",
    template: `SELECT id, status, created_at,
       {1}(status) OVER (ORDER BY {2}) AS prev_status
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD one basket — LAG; LEAD would borrow the next stage." },
      { answer: "created_at ASC, id ASC", kind: "keyword", label: "the walk key", why: "The walk follows the store's timeline — created_at ASC with the id tiebreak." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the timeline." },
    ],
    distractors: ["LEAD", "total DESC", "6"],
    walkthrough:
      "LAG borrows the previous row's status over the unpartitioned walk — the store's stage story, basket by basket. LEAD would borrow the following row, shifting every answer one basket forward. Ordering by total would scramble the timeline and the 'previous' concept with it.",
  },
  {
    id: "cs-2283",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The next bill date",
    brief:
      "From: Spend report. Re: the vendor horizons.\n\nWalk each vendor's bills chronologically and show the NEXT bill's date — when the relationship charges again. Chains reset per vendor; a vendor's last bill reads NULL.",
    ask: "Show each bill's next date per vendor.",
    template: `SELECT id, vendor, spent_on,
       {1}(spent_on) OVER (PARTITION BY {2} ORDER BY spent_on ASC, id ASC) AS next_bill
FROM expenses
ORDER BY vendor, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The horizon looks FORWARD to the next bill — LEAD; LAG would borrow the previous one." },
      { answer: "vendor", kind: "keyword", label: "the relationship boundary", why: "PARTITION BY vendor restarts the chain per supplier relationship." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked bills." },
    ],
    distractors: ["LAG", "memo", "5"],
    walkthrough:
      "The partition scopes each chain to one vendor; LEAD borrows the following bill's date inside it. Repartitioning by category would chain across vendors within a spend type. LAG would borrow the previous bill — the history, not the horizon.",
  },
  {
    id: "cs-2284",
    tier: "easy",
    topic: "t7",
    universe: "fraud",
    title: "The rail before this one",
    brief:
      "From: Fraud spot-check. Re: the rail walk.\n\nAcross the whole payments timeline, show the PREVIOUS payment's method — which rail the cash came in on one payment ago. The first payment reads NULL.",
    ask: "Show each payment's previous method.",
    template: `SELECT id, method, paid_on,
       {1}(method) OVER (ORDER BY paid_on {2}, id ASC) AS prev_method
FROM payments
ORDER BY paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The walk looks BACKWARD one payment — LAG; LEAD would borrow the next rail." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The walk runs oldest to newest — ASC makes previous mean earlier in time; DESC would reverse the clock." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve payment rows — LIMIT 12 trims the book-wide chain." },
    ],
    distractors: ["LEAD", "DESC", "5"],
    walkthrough:
      "LAG borrows the previous row's method over the unpartitioned walk — every payment joins one chain. LEAD would borrow the following payment's rail, shifting the story one row forward. The DESC flip would run the clock backwards so previous meant the future, and the first payment reads NULL because nothing precedes it.",
  },
  {
    id: "cs-2285",
    tier: "medium",
    topic: "t7",
    universe: "growth",
    title: "Two baskets ahead",
    brief:
      "From: Growth lead. Re: the longer horizon.\n\nSame timeline walk, but two steps FORWARD: on every order, the total from two orders ahead. The last two orders read NULL — nothing lies that far ahead.",
    ask: "Show the total from two orders ahead.",
    template: `SELECT id, total,
       {1}(total, {2}) OVER (ORDER BY created_at ASC, id ASC) AS next2
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "Looking FORWARD two steps is LEAD with an offset; LAG would look backward." },
      { answer: "2", kind: "keyword", noVerify: true, label: "the step count", why: "Two orders ahead is offset 2 — LEAD's second argument." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the preview cut", why: "The preview carries twelve rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LAG", "1", "5"],
    walkthrough:
      "LEAD(total, 2) reaches past the immediate neighbor to the row two steps ahead. Offset 1 would grab the next basket; LAG would face backwards entirely. The LIMIT keeps the preview short while the trailing NULLs show the horizon.",
  },
  {
    id: "cs-2286",
    tier: "easy",
    topic: "t7",
    universe: "fraud",
    title: "The clock one tick back",
    brief:
      "From: Fraud spot-check. Re: the timing gaps.\n\nAcross the order timeline, show the PREVIOUS order's timestamp — when the store last sold before this basket. The first order reads NULL.",
    ask: "Show each order's previous timestamp.",
    template: `SELECT id, created_at,
       {1}(created_at) OVER (ORDER BY created_at {2}, id ASC) AS prev_time
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The clock looks BACKWARD one order — LAG; LEAD would borrow the next timestamp." },
      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The walk runs oldest to newest — ASC makes previous mean earlier in time; DESC would reverse the clock." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints ten rows — LIMIT 10 trims the timeline." },
    ],
    distractors: ["LEAD", "DESC", "5"],
    walkthrough:
      "LAG borrows the previous created_at over the timeline walk. LEAD would borrow the following order's timestamp — the future, not the past. The DESC flip would reverse the clock so every previous pointed forward. The first row's NULL is the store's opening moment: nothing was sold before it.",
  },
  {
    id: "cs-2287",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "Days until the next visit",
    brief:
      "From: Growth lead. Re: the return horizon.\n\nFor every order, compute the days until THAT customer's NEXT order. Stage the lookahead with LEAD per customer, then compute julianday days outside the window. Last orders read NULL.",
    ask: "Compute days until the customer's next order.",
    template: `WITH w AS (
  SELECT id, customer_id, created_at,
         {1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS nxt
  FROM orders
)
SELECT id, customer_id,
       CAST(julianday({2}) - julianday(created_at) AS INTEGER) AS days_to_next
FROM w
ORDER BY customer_id, id
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The horizon measures FORWARD to the next visit — LEAD; LAG would measure from the previous one." },
      { answer: "nxt", kind: "keyword", label: "the staged column", why: "The julianday math runs outside the window against the staged nxt column — windows can't nest." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the sample cut", why: "The sample prints ten horizon rows — LIMIT 10 trims the walked orders." },
    ],
    distractors: ["LAG", "created_at", "5"],
    walkthrough:
      "The partition scopes each horizon to one customer; LEAD borrows their next visit; the outer julianday turns the pair into days. LAG would compute days SINCE the previous visit — history instead of horizon. First rows have no next and would read NULL.",
  },
  {
    id: "cs-2288",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The bill before, book-wide",
    brief:
      "From: Controller. Re: the billing walk.\n\nWalk invoices by issue date and show the PREVIOUS invoice's amount — the book's billing rhythm, unpartitioned. The first invoice reads NULL.",
    ask: "Show each invoice's previous amount, book-wide.",
    template: `SELECT id, number, amount_cents,
       {1}(amount_cents) OVER (ORDER BY issued_on {2}, id ASC) AS prev_billed
FROM invoices
ORDER BY issued_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The rhythm looks BACKWARD one bill — LAG; LEAD would borrow the next one." },
      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Invoices run oldest to newest — ASC makes previous the earlier bill; DESC would reverse the book." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve invoice rows — LIMIT 12 trims the book-wide chain." },
    ],
    distractors: ["LEAD", "DESC", "5"],
    walkthrough:
      "LAG borrows the previous bill's amount over the unpartitioned issue-date walk. LEAD would borrow the following bill. No partition means every invoice joins one chain — the book as a single story, exactly as the memo asks.",
  },
  {
    id: "cs-2289",
    tier: "medium",
    topic: "t7",
    universe: "funnel",
    title: "The stage ahead of mine",
    brief:
      "From: Marketing funnel. Re: the forward stages.\n\nWalk each status group's orders chronologically and show the NEXT order's status in that group's timeline — wait, the group IS the status; the memo means the next ORDER's created_at within the same stage. Chains reset per status.",
    ask: "Show the next order date within the same status.",
    template: `SELECT id, status, created_at,
       {1}(created_at) OVER (PARTITION BY {2} ORDER BY created_at ASC, id ASC) AS stage_next
FROM orders
ORDER BY status, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The chain peeks FORWARD inside the stage — LEAD; LAG would borrow the earlier order." },
      { answer: "status", kind: "keyword", label: "the stage boundary", why: "PARTITION BY status keeps each funnel stage's timeline separate." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the stage timelines." },
    ],
    distractors: ["LAG", "customer_id", "6"],
    walkthrough:
      "The partition scopes each chain to one status; LEAD borrows the following order's timestamp inside it; a stage's latest order reads NULL. Repartitioning by customer would chain personal timelines instead of stage timelines.",
  },
  {
    id: "cs-2290",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The bill before mine, per vendor",
    brief:
      "From: Spend report. Re: the relationship chains.\n\nWalk each vendor's bills chronologically and show the PREVIOUS bill's amount — already familiar ground, but this sheet keeps only the chains with money on both sides: LIMIT keeps the page short.",
    ask: "Show each bill's previous amount per vendor.",
    template: `SELECT id, vendor, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY vendor ORDER BY spent_on {2}, id ASC) AS prev_bill
FROM expenses
ORDER BY vendor, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD to the previous bill — LAG; LEAD would borrow the next one." },
      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Bills run oldest to newest inside the vendor — ASC makes previous the earlier charge." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked bills." },
    ],
    distractors: ["LEAD", "DESC", "5"],
    walkthrough:
      "The partition scopes each chain to one vendor; LAG borrows the previous bill's amount inside it; a vendor's first bill reads NULL. LEAD would borrow the following bill, pointing the relationship's rhythm forward, and the DESC flip would walk every vendor backwards so previous meant their most recent charge.",
  },
  {
    id: "cs-2291",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Next month's revenue",
    brief:
      "From: Controller. Re: the forward calendar.\n\nStage monthly revenue and carry the NEXT month's revenue beside each — the outlook column. The final month reads NULL.",
    ask: "Carry the next month's revenue beside each month.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, {3}(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, revenue,
       {1}(revenue) OVER (ORDER BY month {2}) AS next_revenue
FROM m
ORDER BY month;`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The outlook borrows from the NEXT month — LEAD; LAG would borrow the previous one." },
      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Months run oldest to newest — ASC makes 'next' the later calendar month." },
      { answer: "SUM", kind: "keyword", label: "the revenue fold", why: "Monthly revenue is the sum of the month's baskets — SUM in the staging CTE." },
    ],
    distractors: ["LAG", "DESC", "COUNT"],
    walkthrough:
      "The CTE folds one revenue figure per month; LEAD over the calendar walk borrows the following month's figure. The DESC flip would run the calendar backwards so 'next' means earlier. LAG would build a hindsight column instead of an outlook.",
  },
  {
    id: "cs-2292",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "The account before mine",
    brief:
      "From: Fraud spot-check. Re: the booking chains.\n\nWalk ledger entries by id and show the PREVIOUS entry's account — which account the book touched one entry ago. The first entry reads NULL.",
    ask: "Show each entry's previous account.",
    template: `SELECT id, account,
       {1}(account) OVER (ORDER BY {2}) AS prev_account
FROM ledger_entries
ORDER BY id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD one booking — LAG; LEAD would borrow the next account." },
      { answer: "id ASC", kind: "keyword", label: "the book order", why: "The book reads in booking order — the id walk is the ledger's own sequence." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the book cut", why: "The check prints twelve entries — LIMIT 12 trims the walked book." },
    ],
    distractors: ["NTILE", "account", "spent_on"],
    walkthrough:
      "LAG borrows the previous entry's account over the id walk; the first entry reads NULL. Argument-less chips like NTILE would not run. Ordering by account would group the bookings and destroy the book's chronological chain.",
  },
  {
    id: "cs-2293",
    tier: "hard",
    topic: "t7",
    universe: "pricing",
    title: "Filled price chains",
    brief:
      "From: Pricing review. Re: no NULL chains.\n\nWalk each product's order lines and show the PREVIOUS line's unit price — but fill each product's first line with 0.0 instead of NULL, so the sheet joins cleanly downstream.",
    ask: "Show the previous price, filling first lines with zero.",
    template: `SELECT id, product_id, unit_price,
       {1}(unit_price, 1, {2}) OVER (PARTITION BY product_id ORDER BY id ASC) AS prev_price0
FROM order_items
ORDER BY product_id, id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD within each product — LAG; LEAD would borrow the next sale." },
      { answer: "0.0", kind: "keyword", noVerify: true, label: "the edge fill", why: "The third argument fills missing rows — 0.0 keeps the column REAL." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked lines." },
    ],
    distractors: ["LEAD", "9.5", "5"],
    walkthrough:
      "LAG(unit_price, 1, 0.0) borrows the previous sale's price and fills each product's opening edge with 0.0. LEAD would fill the closing edge instead — the last sale of each product. The REAL literal keeps the column's type consistent for the downstream join.",
  },
  {
    id: "cs-2294",
    tier: "medium",
    topic: "t7",
    universe: "expense",
    title: "The next bill per vendor",
    brief:
      "From: Spend report. Re: the forward chains.\n\nWalk each vendor's bills chronologically and show the NEXT bill's amount — what the relationship charged next. A vendor's last bill reads NULL.",
    ask: "Show each bill's next amount per vendor.",
    template: `SELECT id, vendor, amount_cents,
       {1}(amount_cents) OVER (PARTITION BY {2} ORDER BY spent_on ASC, id ASC) AS next_bill
FROM expenses
ORDER BY vendor, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The chain peeks FORWARD to the next bill — LEAD; LAG would borrow the previous one." },
      { answer: "vendor", kind: "keyword", label: "the relationship boundary", why: "PARTITION BY vendor restarts the chain per supplier relationship." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked bills." },
    ],
    distractors: ["LAG", "memo", "5"],
    walkthrough:
      "The partition scopes each chain to one vendor; LEAD borrows the following bill's amount inside it; the vendor's last bill reads NULL because nothing follows it. A partition column absent from the table would not run at all — the chip bank is real SQL, not decoration. LAG would point the rhythm backwards into cash already spent.",
  },
  {
    id: "cs-2295",
    tier: "hard",
    topic: "t7",
    universe: "inventory",
    title: "Units one month back",
    brief:
      "From: Inventory count. Re: the demand walk.\n\nJoin lines to orders, fold units per month, then carry the PREVIOUS month's units beside each — demand's heartbeat. The first month reads NULL.",
    ask: "Carry the previous month's units beside each month.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', o.created_at) AS month, {3}(oi.quantity) AS units
  FROM order_items oi
  JOIN orders o ON o.id = oi.order_id
  GROUP BY month
)
SELECT month, units,
       {1}(units) OVER (ORDER BY month ASC) AS prev_units
FROM m
ORDER BY month
LIMIT {2};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The heartbeat looks BACKWARD one month — LAG; LEAD would borrow the month ahead." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the first NULL heartbeat stays visible." },
      { answer: "SUM", kind: "keyword", label: "the demand fold", why: "Monthly demand is the sum of the month's line quantities — SUM in the staging CTE." },
    ],
    distractors: ["LEAD", "6", "COUNT"],
    walkthrough:
      "The join hands each line its order month; the CTE folds units; LAG borrows the previous month's demand. LEAD would borrow the following month. COUNT in the fold would tally lines instead of units, miscounting multi-quantity baskets.",
  },
  {
    id: "cs-2296",
    tier: "hard",
    topic: "t7",
    universe: "growth",
    title: "The next delivered basket",
    brief:
      "From: Growth lead. Re: the delivery horizons.\n\nAmong DELIVERED orders only, walk each customer's baskets and show the NEXT delivered order's date — when the account's next completed basket landed. Last delivered orders read NULL.",
    ask: "Show the next delivered order date per customer.",
    template: `SELECT id, customer_id, created_at,
       {1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS next_delivered
FROM orders
WHERE status = '{2}'
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The horizon peeks FORWARD within each account — LEAD; LAG would borrow the earlier basket." },
      { answer: "delivered", kind: "keyword", label: "the status gate", why: "WHERE delivered narrows the world first — the chain counts completed baskets only." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The sample carries ten chain rows — LIMIT 10 trims the walked accounts." },
    ],
    distractors: ["LAG", "pending", "5"],
    walkthrough:
      "The gate trims the world to delivered baskets; the partition scopes each chain to one customer; LEAD borrows the following delivery's date. Filtering to pending would horizon intentions. LAG would borrow the earlier delivery.",
  },
  {
    id: "cs-2297",
    tier: "hard",
    topic: "t7",
    universe: "fraud",
    title: "Basket deltas",
    brief:
      "From: Fraud spot-check. Re: the swing column.\n\nWalk the timeline and show each order's SWING — its total minus the previous order's total, rounded to two decimals. The first order's swing reads NULL.",
    ask: "Compute each order's swing versus the previous basket.",
    template: `WITH w AS (
  SELECT id, total, {1}(total) OVER (ORDER BY created_at ASC, id ASC) AS prev
  FROM orders
)
SELECT id, {2}(total - prev, 2) AS swing
FROM w
ORDER BY id
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The swing measures against the PREVIOUS basket — LAG; LEAD would measure against the next." },
      { answer: "ROUND", kind: "keyword", label: "the money dressing", why: "Swings are money — ROUND(..., 2) shows clean decimals." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve swings — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["LEAD", "CAST", "6"],
    walkthrough:
      "The staging CTE borrows the previous total; the outer layer subtracts and dresses with ROUND. LEAD would compute swings against the NEXT basket — the same column shape with opposite meaning. CAST cannot take two arguments; the dressing is ROUND.",
  },
  {
    id: "cs-2298",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "Cash before mine, per bill",
    brief:
      "From: Controller. Re: the installment chains.\n\nWalk each invoice's payments and show the PREVIOUS payment's date — when the bill was last touched. Chains reset per invoice; first payments read NULL.",
    ask: "Show each payment's previous date per invoice.",
    template: `SELECT id, invoice_id, paid_on,
       {1}(paid_on) OVER (PARTITION BY {2} ORDER BY paid_on ASC, id ASC) AS prev_paid
FROM payments
ORDER BY invoice_id, paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "The chain looks BACKWARD to the previous touch — LAG; LEAD would borrow the next one." },
      { answer: "invoice_id", kind: "keyword", label: "the bill boundary", why: "PARTITION BY invoice_id restarts the chain per bill." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the chain cut", why: "The check prints eight chain rows — LIMIT 8 trims the walked payments." },
    ],
    distractors: ["LEAD", "method", "4"],
    walkthrough:
      "The partition scopes each chain to one bill; LAG borrows the previous payment's date inside it. Repartitioning by method would chain across DIFFERENT invoices — unrelated bills holding hands. LEAD would borrow the following touch.",
  },
  {
    id: "cs-2299",
    tier: "medium",
    topic: "t7",
    universe: "month-close",
    title: "The account's next booking",
    brief:
      "From: Controller. Re: the forward book.\n\nWalk each ledger account's entries chronologically and show the NEXT entry's date — when the account moves again. An account's last entry reads NULL.",
    ask: "Show each entry's next date within its account.",
    template: `SELECT id, account, entry_date,
       {1}(entry_date) OVER (PARTITION BY {2} ORDER BY entry_date ASC, id ASC) AS next_date
FROM ledger_entries
ORDER BY account, entry_date ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LEAD", kind: "keyword", label: "the look-ahead chip", why: "The chain peeks FORWARD to the next booking — LEAD; LAG would borrow the previous one." },
      { answer: "account", kind: "keyword", label: "the book boundary", why: "PARTITION BY account restarts the chain per ledger account." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the chain cut", why: "The check prints ten chain rows — LIMIT 10 trims the walked book." },
    ],
    distractors: ["LAG", "entry_date", "memo"],
    walkthrough:
      "The partition scopes each chain to one account; LEAD borrows the following booking's date inside it; the account's last entry reads NULL because nothing follows it in that account's story. LAG would borrow the previous booking instead — the history, not the horizon — and the sheet would read like a diary rather than a forecast.",
  },
  {
    id: "cs-2300",
    tier: "medium",
    topic: "t7",
    universe: "fraud",
    title: "Three baskets back",
    brief:
      "From: Fraud spot-check. Re: the long memory.\n\nThe examiner extends the walk's memory to THREE steps back: on every order, the total from three orders ago. The first three orders read NULL.",
    ask: "Show the total from three orders back.",
    template: `SELECT id, total,
       {1}(total, {2}) OVER (ORDER BY created_at ASC, id ASC) AS prev3
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "LAG", kind: "keyword", label: "the look-back chip", why: "Looking BACKWARD three steps is LAG with an offset; LEAD would look forward." },
      { answer: "3", kind: "keyword", noVerify: true, label: "the step count", why: "Three orders back is offset 3 — LAG's second argument." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the preview cut", why: "The preview carries fourteen rows so the NULL edges stay visible — LIMIT 14." },
    ],
    distractors: ["LEAD", "2", "6"],
    walkthrough:
      "LAG(total, 3) reaches three rows back — the walk's longest memory yet. Offset 2 would stop one basket short; LEAD would face the wrong way. The LIMIT keeps the preview readable while the leading NULLs show the memory filling up.",
  },
];
