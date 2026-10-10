// Case batch WF10 — window functions deep-dive, t8 (Window capstone), cs-2326…cs-2350. Running totals, frames, meters.
import type { CaseStudy } from "./types";

export const casesWf10: CaseStudy[] = [
  {
    id: "cs-2326",
    tier: "easy",
    topic: "t8",
    universe: "month-close",
    title: "The running revenue clock",
    brief:
      "From: Controller. Re: the revenue clock. Walk the order timeline and show the running revenue after each basket — the cumulative sum from the store's first sale through the current row. The frame is what makes the sum 'so far' rather than 'everything'.",
    ask: "Show the running revenue along the order timeline.",
    template: `SELECT id, created_at, total,
       SUM(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS running_revenue
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The running total needs the frame to end at the CURRENT ROW; the unbounded-following variant would show the grand total everywhere." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the timeline." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "SUM with the frame ending at the current row accumulates the timeline; the same SUM with an unbounded-following frame would print the whole-period total on every row — the difference between a clock and a snapshot. The id tiebreak keeps the walk deterministic.",
  },
  {
    id: "cs-2327",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "The spend meter",
    brief:
      "From: Spend report. Re: the expense meter. Walk the bills chronologically and show the running spend in cents after each booking. The frame ends at the current row; the meter never looks ahead.",
    ask: "Show the running expense spend along the calendar.",
    template: `SELECT id, spent_on, amount_cents,
       SUM(amount_cents) OVER (ORDER BY spent_on ASC, id ASC {1}) AS spent_so_far
FROM expenses
ORDER BY spent_on ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The meter accumulates through the current bill only — the frame must stop there." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The meter prints twelve rows — LIMIT 12 trims the calendar." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "The running meter is the frame's signature trick: SUM with UNBOUNDED PRECEDING through CURRENT ROW. The full-frame variant would erase the walking quality and print the year's total on every line — a snapshot wearing a meter's name.",
  },
  {
    id: "cs-2328",
    tier: "medium",
    topic: "t8",
    universe: "month-close",
    title: "The cash book",
    brief:
      "From: Controller. Re: the cash book. Walk payments chronologically and show the running collected cents after each payment — the treasurer's clock. Frame ends at the current row.",
    ask: "Show the running collected cash along the payment timeline.",
    template: `SELECT id, paid_on, amount_cents,
       SUM(amount_cents) OVER (ORDER BY paid_on ASC, id ASC {1}) AS cash_in
FROM payments
ORDER BY paid_on ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "Cash accumulates through the current payment — the frame stops at the current row." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The book prints twelve rows — LIMIT 12 trims the payment timeline." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "The treasurer's cash book is a running SUM over the payment walk. The whole-frame distractor is the classic silent bug: the query runs, every row carries a number, but the clock has been replaced by a snapshot. The id tiebreak orders same-day payments deterministically.",
  },
  {
    id: "cs-2329",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "The balance walk",
    brief:
      "From: Controller. Re: the ledger balance. Walk ledger entries chronologically and show the running BALANCE — the net (debit minus credit) accumulated from the book's opening through the current entry. This is the classic bank statement walk.",
    ask: "Show the running balance along the ledger.",
    template: `SELECT id, entry_date,
       SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC {1}) AS balance
FROM ledger_entries
ORDER BY entry_date ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The balance accumulates every booking through the current one — the frame ends at the current row." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The statement prints twelve rows — LIMIT 12 trims the walked book." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "The balance walk sums the signed movement (debit minus credit) with the frame through the current row. The whole-frame variant would collapse the walk to the closing balance repeated — auditors would notice immediately. The id tiebreak keeps same-day bookings in a deterministic order.",
  },
  {
    id: "cs-2330",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Balance per account",
    brief:
      "From: Controller. Re: the account statements. Per ledger account, walk that account's entries chronologically and show the running balance within it — each account gets its own statement. The frame and the partition work together.",
    ask: "Show the running balance within each account.",
    template: `SELECT id, account,
       SUM(debit_cents - credit_cents) OVER (PARTITION BY {1} ORDER BY entry_date ASC, id ASC {2}) AS acct_balance
FROM ledger_entries
ORDER BY account, entry_date ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "account", kind: "keyword", noVerify: true, label: "the statement boundary", why: "PARTITION BY account gives every ledger account its own statement." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "Each statement accumulates through the current booking only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The statements print twelve rows — LIMIT 12 trims the walked book." },
    ],
    distractors: ["entry_date", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "6"],
    walkthrough:
      "Partition and frame compose: the partition hands each account a private page, the running frame walks that page chronologically. Partitioning by date instead would weave all accounts into day-sized walks — the book scrambled. The whole-frame chip would freeze every statement at its final number.",
  },
  {
    id: "cs-2331",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "The customer's running spend",
    brief:
      "From: Growth lead. Re: the private clocks. Per customer, walk their orders chronologically and show the running spend within the account — how much they had spent by the time each basket landed.",
    ask: "Show the customer's running spend on their orders.",
    template: `SELECT id, customer_id, total,
       SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS cust_running
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The private clock accumulates through the current basket only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the private timelines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "The partition gives each account a private timeline; the running frame accumulates it basket by basket — the last row of each customer equals their lifetime spend. The whole-frame variant would jump straight to that final number everywhere, erasing the journey the CRM sheet wants to show.",
  },
  {
    id: "cs-2332",
    tier: "medium",
    topic: "t8",
    universe: "pricing",
    title: "Three-basket moving average",
    brief:
      "From: Pricing review. Re: the smoothing. Walk the order timeline and show the trailing three-basket average — this basket and the two before it, averaged. Early rows average fewer baskets; the frame is a pure row count.",
    ask: "Show the trailing three-basket moving average.",
    template: `SELECT id, total,
       {2}(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS ma3
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the trailing frame", why: "Three baskets means the frame reaches two rows back and stops at the current row." },
      { answer: "AVG", kind: "keyword", label: "the smoothing fold", why: "An average smooths the series — SUM would accumulate, MIN would floor." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked timeline." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "SUM", "6"],
    walkthrough:
      "AVG over the three-row trailing frame smooths the basket series — the analyst's antidote to noisy month-to-month reads. The whole-frame chip would replace the curve with a single flat line, and SUM would track the moving mass instead of the moving level.",
  },
  {
    id: "cs-2333",
    tier: "hard",
    topic: "t8",
    universe: "inventory",
    title: "Three-day spend smoothing",
    brief:
      "From: Inventory count. Re: the daily curve. Stage the total spend per calendar day, then show the trailing three-day average of daily spend. Only days that have bills appear; the frame is a row count over the staged days.",
    ask: "Show the trailing three-day average of daily spend.",
    template: `WITH d AS (
  SELECT spent_on AS day, SUM(amount_cents) AS spend
  FROM expenses
  GROUP BY spent_on
)
SELECT day, spend,
       AVG(spend) OVER (ORDER BY day ASC {1}) AS ma3
FROM d
ORDER BY day ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the trailing frame", why: "Three days means the frame reaches two rows back and stops at the current row." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the curve cut", why: "The curve prints twelve days — LIMIT 12 trims the calendar." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "AVG", "6", "5"],
    walkthrough:
      "Two layers: the CTE folds each day's bills into one spend figure, the window smooths three staged days at a time. Folding with AVG would pre-smooth the staging layer and corrupt the window's arithmetic. The whole-frame chip would erase the curve entirely.",
  },
  {
    id: "cs-2334",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "Centered smoothing",
    brief:
      "From: Growth lead. Re: the centered curve. Walk the order timeline and show the average of the previous basket, this basket, and the next one — a centered three-row window. The edges use whatever exists.",
    ask: "Show the centered three-basket average.",
    template: `SELECT id, total,
       AVG(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS ma3c
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING", kind: "keyword", noVerify: true, label: "the centered frame", why: "Centered means one row back AND one row forward — the frame straddles the current row." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The curve prints twelve rows — LIMIT 12 trims the walked timeline." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "6", "5"],
    walkthrough:
      "The centered frame straddles the current row — one back, one forward — so the curve peaks and dips in phase with the data instead of lagging behind it. The trailing variant would shift the smoothing one basket late; the whole-frame chip would flatten it entirely.",
  },
  {
    id: "cs-2335",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "The running peak",
    brief:
      "From: Fraud spot-check. Re: the high-water marks. Walk the order timeline and show the biggest total seen SO FAR — the running peak. A MAX with the truncated frame is the running maximum.",
    ask: "Show the running peak of basket totals.",
    template: `SELECT id, total,
       MAX(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS peak_so_far
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The peak only knows baskets up to the current one — the frame must stop there." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the timeline." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "MAX with the running frame is the high-water mark: it rises when a record basket lands and holds otherwise. The whole-frame variant would print the all-time record on row one — the walk's whole story erased. This is the shape behind every 'new all-time high' flag.",
  },
  {
    id: "cs-2336",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Low-water balance flags",
    brief:
      "From: Controller. Re: the low-water marks. Walk the ledger chronologically, stage the running balance, then flag rows where the balance sits at or below every earlier balance — the running-min comparison marks the book's low-water moments.",
    ask: "Flag the ledger's low-water balance rows.",
    template: `WITH w AS (
  SELECT id, entry_date,
         SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC {1}) AS balance
  FROM ledger_entries
)
SELECT id, entry_date, balance,
       CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) THEN 'low' ELSE 'ok' END AS mark
FROM w
ORDER BY entry_date ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "Both the staged balance and the running MIN must stop at the current row for the comparison to be fair." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The statement prints twelve rows — LIMIT 12 trims the walked book." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "Two windows share the running frame: the staged balance and the running MIN. A row is a low-water mark when its balance equals the minimum so far — the book dipped to a new depth. The whole-frame variant would compare against the all-time minimum, so only the final trough would ever flag.",
  },
  {
    id: "cs-2337",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "Units on the assembly line",
    brief:
      "From: Inventory count. Re: the product clocks. Per product, walk its order lines by id and show the running units sold — the product's lifetime counter as of each sale. The partition and the running frame compose.",
    ask: "Show the running units per product on every line.",
    template: `SELECT id, product_id, quantity,
       SUM(quantity) OVER (PARTITION BY product_id ORDER BY id ASC {1}) AS units_so_far
FROM order_items
ORDER BY product_id, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The product's clock accumulates through the current sale only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked lines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "The partition scopes the clock to one product; the running frame accumulates its sales in book order — each product's last line lands on its lifetime total. The whole-frame chip would jump to that final number on every line, and the moving chip would track pairs of sales instead.",
  },
  {
    id: "cs-2338",
    tier: "medium",
    topic: "t8",
    universe: "growth",
    title: "The customer count clock",
    brief:
      "From: Growth lead. Re: the signup clock. Walk customers by signup date and show the running count of accounts — the company's size as of each signup. COUNT with the running frame is the clock.",
    ask: "Show the running customer count along the signups.",
    template: `SELECT id, name, created_at,
       {1}(*) OVER (ORDER BY created_at ASC, id ASC {2}) AS customers_so_far
FROM customers
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "COUNT", kind: "keyword", noVerify: true, label: "the counter fold", why: "The clock counts signups — COUNT(*); SUM would need a column to add." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The count accumulates through the current signup only." },
      { answer: "16", kind: "keyword", noVerify: true, label: "the roll cut", why: "LIMIT 16 keeps the whole roll so the clock reads 16 at the end." },
    ],
    distractors: ["SUM", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "8"],
    walkthrough:
      "COUNT(*) with the running frame turns the signup roll into a headcount clock — each row shows how big the company was the day that customer joined. SUM(*) would not run, and the whole-frame chip would print today's headcount next to every founding-era signup.",
  },
  {
    id: "cs-2339",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "Vendor meters",
    brief:
      "From: Spend report. Re: the vendor clocks. Per vendor, walk their bills chronologically and show the running spend within the relationship — how much had been paid to that vendor by each booking.",
    ask: "Show the running spend per vendor on every bill.",
    template: `SELECT id, vendor, amount_cents,
       SUM(amount_cents) OVER (PARTITION BY {1} ORDER BY spent_on ASC, id ASC {2}) AS vendor_so_far
FROM expenses
ORDER BY vendor, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "vendor", kind: "keyword", noVerify: true, label: "the relationship boundary", why: "PARTITION BY vendor gives every supplier relationship its own meter." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The meter accumulates through the current bill only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked bills." },
    ],
    distractors: ["spent_on", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "6"],
    walkthrough:
      "Partition by vendor, run the clock inside: each relationship's meter accumulates bill by bill, and its last row lands on the total ever paid to that vendor. Partitioning by category would meter spend types, and the whole-frame chip would freeze every meter at its final reading.",
  },
  {
    id: "cs-2340",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Monthly revenue, accumulated",
    brief:
      "From: Controller. Re: the year-and-a-bit climb. Stage monthly revenue, then show the running total across months — the cumulative climb from January 2024 onward. The final month carries the whole-period revenue.",
    ask: "Show the cumulative revenue across months.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       SUM(revenue) OVER (ORDER BY month ASC {1}) AS cum_revenue
FROM m
ORDER BY month
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The climb accumulates through the current month only." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the climb completes at the final row." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "8", "5"],
    walkthrough:
      "The staged months feed a running SUM: each month's row shows the period revenue accumulated so far, completing at the final month. The whole-frame chip would flatten the climb to a single constant — the classic read of a snapshot mistaken for a walk.",
  },
  {
    id: "cs-2341",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "Cumulative share of revenue",
    brief:
      "From: Growth lead. Re: the revenue climb in percent. Stage monthly revenue, accumulate it, and show each month's cumulative share of the FULL-period revenue in percent — the final month must read 100.",
    ask: "Show each month's cumulative revenue share.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
), c AS (
  SELECT month, revenue, SUM(revenue) OVER (ORDER BY month ASC {1}) AS cum
  FROM m
)
SELECT month, ROUND(100.0 * cum / SUM(revenue) OVER (), 2) AS cum_pct
FROM c
ORDER BY month
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The climb accumulates through the current month; the empty-window SUM in the outer layer is the grand total." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the share completes at 100." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "8", "5"],
    walkthrough:
      "Two windows cooperate: the running frame builds the cumulative numerator, the empty-window SUM provides the grand denominator, and the percent climbs to exactly 100 at the final month. The whole-frame chip would break the arithmetic — every row would divide the grand total by itself.",
  },
  {
    id: "cs-2342",
    tier: "medium",
    topic: "t8",
    universe: "pricing",
    title: "Two-month revenue pairs",
    brief:
      "From: Pricing review. Re: the paired months. Stage monthly revenue and show the sum of each month PLUS the previous one — a two-month trailing window. The first month pairs with nothing, so it stands alone.",
    ask: "Show the two-month trailing revenue sum.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue
  FROM orders
  GROUP BY month
)
SELECT month, ROUND(revenue, 2) AS revenue,
       SUM(revenue) OVER (ORDER BY month ASC {1}) AS pair_sum
FROM m
ORDER BY month
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the pair frame", why: "Month plus previous month is the frame reaching one row back and stopping at the current row." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the first standalone pair stays visible." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "8", "5"],
    walkthrough:
      "The one-row-back frame makes each month's sum a pair: this month and the last. The running chip would keep accumulating instead of pairing — a climb with a different shape entirely. The first month's pair is just itself; there is no month before it.",
  },
  {
    id: "cs-2343",
    tier: "medium",
    topic: "t8",
    universe: "inventory",
    title: "Trailing payment average",
    brief:
      "From: Inventory count. Re: the cash curve. Walk payments chronologically and show the trailing three-payment average in cents — the cash curve smoothed. Early rows average fewer payments.",
    ask: "Show the trailing three-payment average.",
    template: `SELECT id, paid_on, amount_cents,
       {2}(amount_cents) OVER (ORDER BY paid_on ASC, id ASC {1}) AS ma3
FROM payments
ORDER BY paid_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the trailing frame", why: "Three payments means two rows back through the current row." },
      { answer: "AVG", kind: "keyword", label: "the smoothing fold", why: "An average smooths the cash curve — SUM would accumulate it." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The curve prints twelve rows — LIMIT 12 trims the payment walk." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "SUM", "6"],
    walkthrough:
      "AVG over the three-row trailing frame smooths the cash curve so the treasurer sees the trend, not the noise. SUM would build a moving mass, and the whole-frame chip would replace the curve with one flat period average — smoothing taken to its absurd extreme.",
  },
  {
    id: "cs-2344",
    tier: "hard",
    topic: "t8",
    universe: "inventory",
    title: "Trailing five-basket average",
    brief:
      "From: Inventory count. Re: the basket curve. Per customer, walk their orders chronologically and show the trailing five-basket average — their recent spending level. Early baskets average fewer.",
    ask: "Show the trailing five-basket average per customer.",
    template: `SELECT id, customer_id, total,
       AVG(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS ma5
FROM orders
ORDER BY customer_id, created_at ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN 4 PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the five-frame", why: "Five baskets means the frame reaches four rows back and stops at the current row." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the private timelines." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "6", "5"],
    walkthrough:
      "The partition gives each account a private curve; the five-row trailing frame averages their last five baskets — a rolling read of spending power. The three-row chip smooths less than the memo asked, and the whole-frame chip would replace the curve with each customer's lifetime average.",
  },
  {
    id: "cs-2345",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "The peak gap",
    brief:
      "From: Fraud spot-check. Re: the headroom walk. Walk the order timeline and show how far each basket sits below the RUNNING peak — the gap to the high-water mark as of that moment. The frame does the walking; the subtraction is inline.",
    ask: "Show each basket's gap below the running peak.",
    template: `SELECT id, total,
       {2}(total) OVER (ORDER BY created_at ASC, id ASC {1}) - total AS below_peak
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The peak only knows baskets up to the current one — the frame must stop there." },
      { answer: "MAX", kind: "keyword", label: "the peak fold", why: "The running peak is MAX with the walking frame — AVG would track the typical basket." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The walk prints twelve rows — LIMIT 12 trims the timeline." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "AVG", "6"],
    walkthrough:
      "The running MAX builds the high-water mark; subtracting the row's own total leaves the gap below the record so far. The whole-frame chip would measure everything against the all-time peak — the walk's drama (records being set) would vanish, and every gap would grow monotonic.",
  },
  {
    id: "cs-2346",
    tier: "hard",
    topic: "t8",
    universe: "month-close",
    title: "Invoice meter",
    brief:
      "From: Controller. Re: the billing clock. Walk invoices by issue date and show the running billed cents — the AR clock from the book's first bill through the current one.",
    ask: "Show the running billed total along the invoice book.",
    template: `SELECT id, issued_on, amount_cents,
       SUM(amount_cents) OVER (ORDER BY issued_on ASC, id ASC {1}) AS billed_so_far
FROM invoices
ORDER BY issued_on ASC, id ASC
LIMIT {2} OFFSET {3};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The clock accumulates through the current bill only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The clock prints twelve rows — LIMIT 12 trims the walked book." },
      { answer: "0", kind: "keyword", noVerify: true, label: "the page anchor", why: "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "6", "5"],
    walkthrough:
      "The AR clock is a running SUM over the issue-date walk — each row shows the total billed by the time that invoice landed. The whole-frame chip would replace the clock with the book's final total, and the moving chip would pair bills instead of accumulating them.",
  },
  {
    id: "cs-2347",
    tier: "medium",
    topic: "t8",
    universe: "expense",
    title: "Category meters, running",
    brief:
      "From: Spend report. Re: the category clocks. Per expense category, walk its bills chronologically and show the running spend within it — each spend type's own meter.",
    ask: "Show the running spend per category on every bill.",
    template: `SELECT id, category, amount_cents,
       SUM(amount_cents) OVER (PARTITION BY {1} ORDER BY spent_on ASC, id ASC {2}) AS cat_so_far
FROM expenses
ORDER BY category, spent_on ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "category", kind: "keyword", noVerify: true, label: "the type boundary", why: "PARTITION BY category gives every spend type its own meter." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The meter accumulates through the current bill only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked bills." },
    ],
    distractors: ["spent_on", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "6"],
    walkthrough:
      "Partition by category, run the clock inside: each spend type's meter accumulates bill by bill, and its last row lands on the category's total. Partitioning by vendor would meter relationships, and the whole-frame chip would freeze every meter at its final reading.",
  },
  {
    id: "cs-2348",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "Orders this month, running",
    brief:
      "From: Growth lead. Re: the month clocks. Partition orders by calendar month (of created_at) and show the running count WITHIN the month — 1 for the month's first basket, 2 for the second, and so on. The frame and the calendar partition compose.",
    ask: "Show the running order count within each month.",
    template: `SELECT id, created_at,
       {1}(*) OVER (PARTITION BY {2} ORDER BY created_at ASC, id ASC {3}) AS month_so_far
FROM orders
ORDER BY created_at ASC, id ASC
LIMIT 12;`,
    slots: [
      { answer: "COUNT", kind: "keyword", noVerify: true, label: "the counter fold", why: "The clock counts baskets as they land — COUNT(*) with the running frame." },
      { answer: "strftime('%Y-%m', created_at)", kind: "keyword", noVerify: true, label: "the calendar boundary", why: "PARTITION BY the month expression restarts each clock at the month edge." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The clock counts through the current basket only." },
    ],
    distractors: ["SUM", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "customer_id"],
    walkthrough:
      "The calendar partition gives every month a fresh clock; the running frame counts baskets through the current one — the month's first order reads 1, its second 2. The whole-frame chip would show the month's final count from the first basket on, and partitioning by customer would count private histories.",
  },
  {
    id: "cs-2349",
    tier: "medium",
    topic: "t8",
    universe: "fraud",
    title: "The account so-far mass",
    brief:
      "From: Fraud spot-check. Re: the debit clocks. Per ledger account, walk its entries chronologically and show the running DEBIT mass — how much had been debited to the account by each booking.",
    ask: "Show the running debit mass per account.",
    template: `SELECT id, account, debit_cents,
       SUM(debit_cents) OVER (PARTITION BY {1} ORDER BY entry_date ASC, id ASC {2}) AS debits_so_far
FROM ledger_entries
ORDER BY account, entry_date ASC, id ASC
LIMIT {3};`,
    slots: [
      { answer: "account", kind: "keyword", noVerify: true, label: "the book boundary", why: "PARTITION BY account gives every ledger account its own clock." },
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The mass accumulates through the current booking only." },
      { answer: "12", kind: "keyword", noVerify: true, label: "the walk cut", why: "The sheet prints twelve rows — LIMIT 12 trims the walked book." },
    ],
    distractors: ["entry_date", "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "6"],
    walkthrough:
      "The partition scopes the clock to one account; the running frame accumulates its debits in book order — the last row of each account lands on its total debit mass. Partitioning by date would scramble accounts together, and the whole-frame chip would skip straight to the final mass.",
  },
  {
    id: "cs-2350",
    tier: "hard",
    topic: "t8",
    universe: "growth",
    title: "Cumulative customer count by month",
    brief:
      "From: Growth lead. Re: the acquisition climb. Stage the customer count per signup month, then show the running total across months — the company's cumulative size month by month.",
    ask: "Show the cumulative customer count across months.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, {3}(*) AS joined
  FROM customers
  GROUP BY month
)
SELECT month, joined,
       SUM(joined) OVER (ORDER BY month ASC {1}) AS cum_joined
FROM m
ORDER BY month
LIMIT {2};`,
    slots: [
      { answer: "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", kind: "keyword", noVerify: true, label: "the so-far frame", why: "The climb accumulates through the current month only." },
      { answer: "14", kind: "keyword", noVerify: true, label: "the series cut", why: "LIMIT 14 keeps every month so the climb completes." },
      { answer: "COUNT", kind: "keyword", label: "the monthly fold", why: "The month's signups are a count — COUNT(*) in the staging CTE." },
    ],
    distractors: ["ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING", "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW", "AVG"],
    walkthrough:
      "The staged months feed a running SUM of signup counts — the acquisition climb. The whole-frame chip would print the final headcount next to every month, and a moving frame would pair adjacent months instead of building the climb. The fold must be COUNT: months are counted, not summed.",
  },
];
