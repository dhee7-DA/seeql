# Generator for cases-wf10/11/12.ts (Task 41) — t8 window capstone, 75 cases.
B10, B11, B12 = [], [], []
def case(B, cid, tier, uni, title, brief, ask, template, slots, distractors, walkthrough):
    B.append((cid, tier, uni, title, brief, ask, template, slots, distractors, walkthrough))
def s(a, l, w, nv=False):
    return (a, l, w, nv)

FULL = "ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING"
RUN = "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW"
MOV3 = "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW"
MOV2 = "ROWS BETWEEN 1 PRECEDING AND CURRENT ROW"
CTR = "ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING"

# ---------- WF10: running totals & frames (cs-2326..2350) ----------
case(B10, "cs-2326", "easy", "month-close", "The running revenue clock",
"From: Controller. Re: the revenue clock. Walk the order timeline and show the running revenue after each basket — the cumulative sum from the store's first sale through the current row. The frame is what makes the sum 'so far' rather than 'everything'.",
"Show the running revenue along the order timeline.",
"SELECT id, created_at, total,\n       SUM(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS running_revenue\nFROM orders\nORDER BY created_at ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The running total needs the frame to end at the CURRENT ROW; the unbounded-following variant would show the grand total everywhere.", True),
 s("12", "the walk cut", "The walk prints twelve rows — LIMIT 12 trims the timeline.", True)],
[s(FULL, "the whole-frame chip", "With the frame spanning the whole set, every row shows the same grand total — a level, not a running clock."),
 s(MOV3, "the moving chip", "A three-row trailing window is a moving sum, not a cumulative one."),
 s("6", "the shorter cut", "LIMIT 6 trims the walk differently — the rows shown change.")],
"SUM with the frame ending at the current row accumulates the timeline; the same SUM with an unbounded-following frame would print the whole-period total on every row — the difference between a clock and a snapshot. The id tiebreak keeps the walk deterministic.")

case(B10, "cs-2327", "medium", "expense", "The spend meter",
"From: Spend report. Re: the expense meter. Walk the bills chronologically and show the running spend in cents after each booking. The frame ends at the current row; the meter never looks ahead.",
"Show the running expense spend along the calendar.",
"SELECT id, spent_on, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY spent_on ASC, id ASC {1}) AS spent_so_far\nFROM expenses\nORDER BY spent_on ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The meter accumulates through the current bill only — the frame must stop there.", True),
 s("12", "the walk cut", "The meter prints twelve rows — LIMIT 12 trims the calendar.", True)],
[s(FULL, "the whole-frame chip", "The full frame would flatten the meter to one constant grand total."),
 s(MOV2, "the moving chip", "A two-row window pairs bills instead of accumulating the book."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer bookings.")],
"The running meter is the frame's signature trick: SUM with UNBOUNDED PRECEDING through CURRENT ROW. The full-frame variant would erase the walking quality and print the year's total on every line — a snapshot wearing a meter's name.")

case(B10, "cs-2328", "medium", "month-close", "The cash book",
"From: Controller. Re: the cash book. Walk payments chronologically and show the running collected cents after each payment — the treasurer's clock. Frame ends at the current row.",
"Show the running collected cash along the payment timeline.",
"SELECT id, paid_on, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY paid_on ASC, id ASC {1}) AS cash_in\nFROM payments\nORDER BY paid_on ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "Cash accumulates through the current payment — the frame stops at the current row.", True),
 s("12", "the walk cut", "The book prints twelve rows — LIMIT 12 trims the payment timeline.", True)],
[s(FULL, "the whole-frame chip", "The full frame would print the final collection total on every row."),
 s(MOV3, "the moving chip", "A three-payment window is a moving sum, not a running clock."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer payments.")],
"The treasurer's cash book is a running SUM over the payment walk. The whole-frame distractor is the classic silent bug: the query runs, every row carries a number, but the clock has been replaced by a snapshot. The id tiebreak orders same-day payments deterministically.")

case(B10, "cs-2329", "hard", "month-close", "The balance walk",
"From: Controller. Re: the ledger balance. Walk ledger entries chronologically and show the running BALANCE — the net (debit minus credit) accumulated from the book's opening through the current entry. This is the classic bank statement walk.",
"Show the running balance along the ledger.",
"SELECT id, entry_date,\n       SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC {1}) AS balance\nFROM ledger_entries\nORDER BY entry_date ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The balance accumulates every booking through the current one — the frame ends at the current row.", True),
 s("12", "the walk cut", "The statement prints twelve rows — LIMIT 12 trims the walked book.", True)],
[s(FULL, "the whole-frame chip", "The full frame would show the closing balance on every row — no walk at all."),
 s(MOV3, "the moving chip", "A three-entry window is a moving net, not a balance."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer bookings.")],
"The balance walk sums the signed movement (debit minus credit) with the frame through the current row. The whole-frame variant would collapse the walk to the closing balance repeated — auditors would notice immediately. The id tiebreak keeps same-day bookings in a deterministic order.")

case(B10, "cs-2330", "hard", "month-close", "Balance per account",
"From: Controller. Re: the account statements. Per ledger account, walk that account's entries chronologically and show the running balance within it — each account gets its own statement. The frame and the partition work together.",
"Show the running balance within each account.",
"SELECT id, account,\n       SUM(debit_cents - credit_cents) OVER (PARTITION BY {1} ORDER BY entry_date ASC, id ASC {2}) AS acct_balance\nFROM ledger_entries\nORDER BY account, entry_date ASC, id ASC\nLIMIT {3};",
[s("account", "the statement boundary", "PARTITION BY account gives every ledger account its own statement.", True),
 s(RUN, "the so-far frame", "Each statement accumulates through the current booking only.", True),
 s("12", "the walk cut", "The statements print twelve rows — LIMIT 12 trims the walked book.", True)],
[s("entry_date", "the day boundary", "Partitioning by date would group every account booked that day into one walk — mixing the book."),
 s(FULL, "the whole-frame chip", "The full frame would freeze each statement at its closing balance."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"Partition and frame compose: the partition hands each account a private page, the running frame walks that page chronologically. Partitioning by date instead would weave all accounts into day-sized walks — the book scrambled. The whole-frame chip would freeze every statement at its final number.")

case(B10, "cs-2331", "hard", "growth", "The customer's running spend",
"From: Growth lead. Re: the private clocks. Per customer, walk their orders chronologically and show the running spend within the account — how much they had spent by the time each basket landed.",
"Show the customer's running spend on their orders.",
"SELECT id, customer_id, total,\n       SUM(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS cust_running\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The private clock accumulates through the current basket only.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the private timelines.", True)],
[s(FULL, "the whole-frame chip", "The full frame would show each customer's lifetime total on every row — a level, not a clock."),
 s(MOV3, "the moving chip", "A three-basket window is a moving sum, not a lifetime accumulator."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The partition gives each account a private timeline; the running frame accumulates it basket by basket — the last row of each customer equals their lifetime spend. The whole-frame variant would jump straight to that final number everywhere, erasing the journey the CRM sheet wants to show.")

case(B10, "cs-2332", "medium", "pricing", "Three-basket moving average",
"From: Pricing review. Re: the smoothing. Walk the order timeline and show the trailing three-basket average — this basket and the two before it, averaged. Early rows average fewer baskets; the frame is a pure row count.",
"Show the trailing three-basket moving average.",
"SELECT id, total,\n       {2}(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS ma3\nFROM orders\nORDER BY created_at ASC, id ASC\nLIMIT {3};",
[s(MOV3, "the trailing frame", "Three baskets means the frame reaches two rows back and stops at the current row.", True),
 s("AVG", "the smoothing fold", "An average smooths the series — SUM would accumulate, MIN would floor."),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked timeline.", True)],
[s(FULL, "the whole-frame chip", "The full frame would average the whole timeline — one constant, no smoothing."),
 s("SUM", "the wrong fold", "SUM with the same frame is a moving total, not a moving average."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"AVG over the three-row trailing frame smooths the basket series — the analyst's antidote to noisy month-to-month reads. The whole-frame chip would replace the curve with a single flat line, and SUM would track the moving mass instead of the moving level.")

case(B10, "cs-2333", "hard", "inventory", "Three-day spend smoothing",
"From: Inventory count. Re: the daily curve. Stage the total spend per calendar day, then show the trailing three-day average of daily spend. Only days that have bills appear; the frame is a row count over the staged days.",
"Show the trailing three-day average of daily spend.",
"WITH d AS (\n  SELECT spent_on AS day, SUM(amount_cents) AS spend\n  FROM expenses\n  GROUP BY spent_on\n)\nSELECT day, spend,\n       AVG(spend) OVER (ORDER BY day ASC {1}) AS ma3\nFROM d\nORDER BY day ASC\nLIMIT {2};",
[s(MOV3, "the trailing frame", "Three days means the frame reaches two rows back and stops at the current row.", True),
 s("12", "the curve cut", "The curve prints twelve days — LIMIT 12 trims the calendar.", True)],
[s(FULL, "the whole-frame chip", "The full frame would flatten the curve to the period average."),
 s("AVG", "the double fold", "AVG in the staging CTE would average bills within the day, not total them."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer days.")],
"Two layers: the CTE folds each day's bills into one spend figure, the window smooths three staged days at a time. Folding with AVG would pre-smooth the staging layer and corrupt the window's arithmetic. The whole-frame chip would erase the curve entirely.")

case(B10, "cs-2334", "medium", "growth", "Centered smoothing",
"From: Growth lead. Re: the centered curve. Walk the order timeline and show the average of the previous basket, this basket, and the next one — a centered three-row window. The edges use whatever exists.",
"Show the centered three-basket average.",
"SELECT id, total,\n       AVG(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS ma3c\nFROM orders\nORDER BY created_at ASC, id ASC\nLIMIT {2};",
[s(CTR, "the centered frame", "Centered means one row back AND one row forward — the frame straddles the current row.", True),
 s("12", "the walk cut", "The curve prints twelve rows — LIMIT 12 trims the walked timeline.", True)],
[s(MOV3, "the trailing chip", "The trailing frame looks only backwards — a lagging curve, not a centered one."),
 s(FULL, "the whole-frame chip", "The full frame would average everything — one flat number."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The centered frame straddles the current row — one back, one forward — so the curve peaks and dips in phase with the data instead of lagging behind it. The trailing variant would shift the smoothing one basket late; the whole-frame chip would flatten it entirely.")

case(B10, "cs-2335", "medium", "fraud", "The running peak",
"From: Fraud spot-check. Re: the high-water marks. Walk the order timeline and show the biggest total seen SO FAR — the running peak. A MAX with the truncated frame is the running maximum.",
"Show the running peak of basket totals.",
"SELECT id, total,\n       MAX(total) OVER (ORDER BY created_at ASC, id ASC {1}) AS peak_so_far\nFROM orders\nORDER BY created_at ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The peak only knows baskets up to the current one — the frame must stop there.", True),
 s("12", "the walk cut", "The walk prints twelve rows — LIMIT 12 trims the timeline.", True)],
[s(FULL, "the whole-frame chip", "The full frame would show the all-time peak on every row — no walk."),
 s(MOV3, "the moving chip", "A three-row window is a local peak, not the running record."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"MAX with the running frame is the high-water mark: it rises when a record basket lands and holds otherwise. The whole-frame variant would print the all-time record on row one — the walk's whole story erased. This is the shape behind every 'new all-time high' flag.")

case(B10, "cs-2336", "hard", "month-close", "Low-water balance flags",
"From: Controller. Re: the low-water marks. Walk the ledger chronologically, stage the running balance, then flag rows where the balance sits at or below every earlier balance — the running-min comparison marks the book's low-water moments.",
"Flag the ledger's low-water balance rows.",
"WITH w AS (\n  SELECT id, entry_date,\n         SUM(debit_cents - credit_cents) OVER (ORDER BY entry_date ASC, id ASC {1}) AS balance\n  FROM ledger_entries\n)\nSELECT id, entry_date, balance,\n       CASE WHEN balance <= MIN(balance) OVER (ORDER BY entry_date ASC, id ASC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) THEN 'low' ELSE 'ok' END AS mark\nFROM w\nORDER BY entry_date ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "Both the staged balance and the running MIN must stop at the current row for the comparison to be fair.", True),
 s("12", "the walk cut", "The statement prints twelve rows — LIMIT 12 trims the walked book.", True)],
[s(FULL, "the whole-frame chip", "With the full frame, the running MIN is the all-time minimum — every row below it (none) would flag wrong."),
 s(MOV2, "the moving chip", "A two-row window compares only with the immediate neighbor."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"Two windows share the running frame: the staged balance and the running MIN. A row is a low-water mark when its balance equals the minimum so far — the book dipped to a new depth. The whole-frame variant would compare against the all-time minimum, so only the final trough would ever flag.")

case(B10, "cs-2337", "medium", "inventory", "Units on the assembly line",
"From: Inventory count. Re: the product clocks. Per product, walk its order lines by id and show the running units sold — the product's lifetime counter as of each sale. The partition and the running frame compose.",
"Show the running units per product on every line.",
"SELECT id, product_id, quantity,\n       SUM(quantity) OVER (PARTITION BY product_id ORDER BY id ASC {1}) AS units_so_far\nFROM order_items\nORDER BY product_id, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The product's clock accumulates through the current sale only.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked lines.", True)],
[s(FULL, "the whole-frame chip", "The full frame would show each product's lifetime units on every line — a level, not a clock."),
 s(MOV2, "the moving chip", "A two-line window pairs sales instead of accumulating demand."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The partition scopes the clock to one product; the running frame accumulates its sales in book order — each product's last line lands on its lifetime total. The whole-frame chip would jump to that final number on every line, and the moving chip would track pairs of sales instead.")

case(B10, "cs-2338", "medium", "growth", "The customer count clock",
"From: Growth lead. Re: the signup clock. Walk customers by signup date and show the running count of accounts — the company's size as of each signup. COUNT with the running frame is the clock.",
"Show the running customer count along the signups.",
"SELECT id, name, created_at,\n       {1}(*) OVER (ORDER BY created_at ASC, id ASC {2}) AS customers_so_far\nFROM customers\nORDER BY created_at ASC, id ASC\nLIMIT {3};",
[s("COUNT", "the counter fold", "The clock counts signups — COUNT(*); SUM would need a column to add.", True),
 s(RUN, "the so-far frame", "The count accumulates through the current signup only.", True),
 s("16", "the roll cut", "LIMIT 16 keeps the whole roll so the clock reads 16 at the end.", True)],
[s("SUM", "the wrong fold", "SUM(*) would not run — SUM needs a column argument."),
 s(FULL, "the whole-frame chip", "The full frame would show the final headcount on every row."),
 s("8", "the shorter cut", "LIMIT 8 shows half the roll.")],
"COUNT(*) with the running frame turns the signup roll into a headcount clock — each row shows how big the company was the day that customer joined. SUM(*) would not run, and the whole-frame chip would print today's headcount next to every founding-era signup.")

case(B10, "cs-2339", "medium", "expense", "Vendor meters",
"From: Spend report. Re: the vendor clocks. Per vendor, walk their bills chronologically and show the running spend within the relationship — how much had been paid to that vendor by each booking.",
"Show the running spend per vendor on every bill.",
"SELECT id, vendor, amount_cents,\n       SUM(amount_cents) OVER (PARTITION BY {1} ORDER BY spent_on ASC, id ASC {2}) AS vendor_so_far\nFROM expenses\nORDER BY vendor, spent_on ASC, id ASC\nLIMIT {3};",
[s("vendor", "the relationship boundary", "PARTITION BY vendor gives every supplier relationship its own meter.", True),
 s(RUN, "the so-far frame", "The meter accumulates through the current bill only.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked bills.", True)],
[s("spent_on", "the day boundary", "Partitioning by spent date would weave the vendors into day-sized meters."),
 s(FULL, "the whole-frame chip", "The full frame would freeze each meter at the relationship's total."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"Partition by vendor, run the clock inside: each relationship's meter accumulates bill by bill, and its last row lands on the total ever paid to that vendor. Partitioning by category would meter spend types, and the whole-frame chip would freeze every meter at its final reading.")

case(B10, "cs-2340", "hard", "month-close", "Monthly revenue, accumulated",
"From: Controller. Re: the year-and-a-bit climb. Stage monthly revenue, then show the running total across months — the cumulative climb from January 2024 onward. The final month carries the whole-period revenue.",
"Show the cumulative revenue across months.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       SUM(revenue) OVER (ORDER BY month ASC {1}) AS cum_revenue\nFROM m\nORDER BY month\nLIMIT {2};",
[s(RUN, "the so-far frame", "The climb accumulates through the current month only.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so the climb completes at the final row.", True)],
[s(FULL, "the whole-frame chip", "The full frame would print the whole-period revenue on every month — no climb."),
 s(MOV3, "the moving chip", "A three-month window is a moving sum, not a cumulative climb."),
 s("8", "the shorter cut", "LIMIT 8 truncates the climb halfway.")],
"The staged months feed a running SUM: each month's row shows the period revenue accumulated so far, completing at the final month. The whole-frame chip would flatten the climb to a single constant — the classic read of a snapshot mistaken for a walk.")

case(B10, "cs-2341", "hard", "growth", "Cumulative share of revenue",
"From: Growth lead. Re: the revenue climb in percent. Stage monthly revenue, accumulate it, and show each month's cumulative share of the FULL-period revenue in percent — the final month must read 100.",
"Show each month's cumulative revenue share.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n), c AS (\n  SELECT month, revenue, SUM(revenue) OVER (ORDER BY month ASC {1}) AS cum\n  FROM m\n)\nSELECT month, ROUND(100.0 * cum / SUM(revenue) OVER (), 2) AS cum_pct\nFROM c\nORDER BY month\nLIMIT {2};",
[s(RUN, "the so-far frame", "The climb accumulates through the current month; the empty-window SUM in the outer layer is the grand total.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so the share completes at 100.", True)],
[s(FULL, "the whole-frame chip", "The full frame would make cum equal the grand total everywhere — every share would read 100."),
 s(MOV2, "the moving chip", "A two-month window pairs months instead of accumulating."),
 s("8", "the shorter cut", "LIMIT 8 truncates the climb.")],
"Two windows cooperate: the running frame builds the cumulative numerator, the empty-window SUM provides the grand denominator, and the percent climbs to exactly 100 at the final month. The whole-frame chip would break the arithmetic — every row would divide the grand total by itself.")

case(B10, "cs-2342", "medium", "pricing", "Two-month revenue pairs",
"From: Pricing review. Re: the paired months. Stage monthly revenue and show the sum of each month PLUS the previous one — a two-month trailing window. The first month pairs with nothing, so it stands alone.",
"Show the two-month trailing revenue sum.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       SUM(revenue) OVER (ORDER BY month ASC {1}) AS pair_sum\nFROM m\nORDER BY month\nLIMIT {2};",
[s(MOV2, "the pair frame", "Month plus previous month is the frame reaching one row back and stopping at the current row.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so the first standalone pair stays visible.", True)],
[s(RUN, "the running chip", "The unbounded frame would keep accumulating — a climb, not a pair."),
 s(FULL, "the whole-frame chip", "The full frame would show the period total everywhere."),
 s("8", "the shorter cut", "LIMIT 8 truncates the series.")],
"The one-row-back frame makes each month's sum a pair: this month and the last. The running chip would keep accumulating instead of pairing — a climb with a different shape entirely. The first month's pair is just itself; there is no month before it.")

case(B10, "cs-2343", "medium", "inventory", "Trailing payment average",
"From: Inventory count. Re: the cash curve. Walk payments chronologically and show the trailing three-payment average in cents — the cash curve smoothed. Early rows average fewer payments.",
"Show the trailing three-payment average.",
"SELECT id, paid_on, amount_cents,\n       {2}(amount_cents) OVER (ORDER BY paid_on ASC, id ASC {1}) AS ma3\nFROM payments\nORDER BY paid_on ASC, id ASC\nLIMIT {3};",
[s(MOV3, "the trailing frame", "Three payments means two rows back through the current row.", True),
 s("AVG", "the smoothing fold", "An average smooths the cash curve — SUM would accumulate it."),
 s("12", "the walk cut", "The curve prints twelve rows — LIMIT 12 trims the payment walk.", True)],
[s(FULL, "the whole-frame chip", "The full frame would flatten the curve to the period average."),
 s("SUM", "the wrong fold", "SUM would build a moving total, not a moving level."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer payments.")],
"AVG over the three-row trailing frame smooths the cash curve so the treasurer sees the trend, not the noise. SUM would build a moving mass, and the whole-frame chip would replace the curve with one flat period average — smoothing taken to its absurd extreme.")

case(B10, "cs-2344", "hard", "inventory", "Trailing five-basket average",
"From: Inventory count. Re: the basket curve. Per customer, walk their orders chronologically and show the trailing five-basket average — their recent spending level. Early baskets average fewer.",
"Show the trailing five-basket average per customer.",
"SELECT id, customer_id, total,\n       AVG(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS ma5\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC\nLIMIT {2};",
[s("ROWS BETWEEN 4 PRECEDING AND CURRENT ROW", "the five-frame", "Five baskets means the frame reaches four rows back and stops at the current row.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the private timelines.", True)],
[s(MOV3, "the three chip", "A three-basket window smooths less than the memo's five."),
 s(FULL, "the whole-frame chip", "The full frame would average each customer's whole history — a level, not a curve."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The partition gives each account a private curve; the five-row trailing frame averages their last five baskets — a rolling read of spending power. The three-row chip smooths less than the memo asked, and the whole-frame chip would replace the curve with each customer's lifetime average.")

case(B10, "cs-2345", "medium", "fraud", "The peak gap",
"From: Fraud spot-check. Re: the headroom walk. Walk the order timeline and show how far each basket sits below the RUNNING peak — the gap to the high-water mark as of that moment. The frame does the walking; the subtraction is inline.",
"Show each basket's gap below the running peak.",
"SELECT id, total,\n       {2}(total) OVER (ORDER BY created_at ASC, id ASC {1}) - total AS below_peak\nFROM orders\nORDER BY created_at ASC, id ASC\nLIMIT {3};",
[s(RUN, "the so-far frame", "The peak only knows baskets up to the current one — the frame must stop there.", True),
 s("MAX", "the peak fold", "The running peak is MAX with the walking frame — AVG would track the typical basket."),
 s("12", "the walk cut", "The walk prints twelve rows — LIMIT 12 trims the timeline.", True)],
[s(FULL, "the whole-frame chip", "The full frame would measure every basket against the all-time peak — no walk."),
 s("AVG", "the norm fold", "The gap to the AVERAGE is a different report than the gap to the record."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The running MAX builds the high-water mark; subtracting the row's own total leaves the gap below the record so far. The whole-frame chip would measure everything against the all-time peak — the walk's drama (records being set) would vanish, and every gap would grow monotonic.")

case(B10, "cs-2346", "hard", "month-close", "Invoice meter",
"From: Controller. Re: the billing clock. Walk invoices by issue date and show the running billed cents — the AR clock from the book's first bill through the current one.",
"Show the running billed total along the invoice book.",
"SELECT id, issued_on, amount_cents,\n       SUM(amount_cents) OVER (ORDER BY issued_on ASC, id ASC {1}) AS billed_so_far\nFROM invoices\nORDER BY issued_on ASC, id ASC\nLIMIT {2};",
[s(RUN, "the so-far frame", "The clock accumulates through the current bill only.", True),
 s("12", "the walk cut", "The clock prints twelve rows — LIMIT 12 trims the walked book.", True)],
[s(FULL, "the whole-frame chip", "The full frame would show the total billed everywhere — a level, not a clock."),
 s(MOV2, "the moving chip", "A two-bill window pairs invoices instead of accumulating the book."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer bills.")],
"The AR clock is a running SUM over the issue-date walk — each row shows the total billed by the time that invoice landed. The whole-frame chip would replace the clock with the book's final total, and the moving chip would pair bills instead of accumulating them.")

case(B10, "cs-2347", "medium", "expense", "Category meters, running",
"From: Spend report. Re: the category clocks. Per expense category, walk its bills chronologically and show the running spend within it — each spend type's own meter.",
"Show the running spend per category on every bill.",
"SELECT id, category, amount_cents,\n       SUM(amount_cents) OVER (PARTITION BY {1} ORDER BY spent_on ASC, id ASC {2}) AS cat_so_far\nFROM expenses\nORDER BY category, spent_on ASC, id ASC\nLIMIT {3};",
[s("category", "the type boundary", "PARTITION BY category gives every spend type its own meter.", True),
 s(RUN, "the so-far frame", "The meter accumulates through the current bill only.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked bills.", True)],
[s("spent_on", "the day boundary", "Partitioning by spent date would weave categories into day-sized meters."),
 s(FULL, "the whole-frame chip", "The full frame would freeze each meter at its category total."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"Partition by category, run the clock inside: each spend type's meter accumulates bill by bill, and its last row lands on the category's total. Partitioning by vendor would meter relationships, and the whole-frame chip would freeze every meter at its final reading.")

case(B10, "cs-2348", "hard", "growth", "Orders this month, running",
"From: Growth lead. Re: the month clocks. Partition orders by calendar month (of created_at) and show the running count WITHIN the month — 1 for the month's first basket, 2 for the second, and so on. The frame and the calendar partition compose.",
"Show the running order count within each month.",
"SELECT id, created_at,\n       {1}(*) OVER (PARTITION BY {2} ORDER BY created_at ASC, id ASC {3}) AS month_so_far\nFROM orders\nORDER BY created_at ASC, id ASC\nLIMIT 12;",
[s("COUNT", "the counter fold", "The clock counts baskets as they land — COUNT(*) with the running frame.", True),
 s("strftime('%Y-%m', created_at)", "the calendar boundary", "PARTITION BY the month expression restarts each clock at the month edge.", True),
 s(RUN, "the so-far frame", "The clock counts through the current basket only.", True)],
[s("SUM", "the wrong fold", "SUM(*) would not run — SUM needs a column."),
 s(FULL, "the whole-frame chip", "The full frame would show the month's final count on every basket."),
 s("customer_id", "the account boundary", "Partitioning by customer would count private orders, not calendar baskets.")],
"The calendar partition gives every month a fresh clock; the running frame counts baskets through the current one — the month's first order reads 1, its second 2. The whole-frame chip would show the month's final count from the first basket on, and partitioning by customer would count private histories.")

case(B10, "cs-2349", "medium", "fraud", "The account so-far mass",
"From: Fraud spot-check. Re: the debit clocks. Per ledger account, walk its entries chronologically and show the running DEBIT mass — how much had been debited to the account by each booking.",
"Show the running debit mass per account.",
"SELECT id, account, debit_cents,\n       SUM(debit_cents) OVER (PARTITION BY {1} ORDER BY entry_date ASC, id ASC {2}) AS debits_so_far\nFROM ledger_entries\nORDER BY account, entry_date ASC, id ASC\nLIMIT {3};",
[s("account", "the book boundary", "PARTITION BY account gives every ledger account its own clock.", True),
 s(RUN, "the so-far frame", "The mass accumulates through the current booking only.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked book.", True)],
[s("entry_date", "the day boundary", "Partitioning by date would weave all accounts into day-sized walks."),
 s(FULL, "the whole-frame chip", "The full frame would show each account's total debits on every row."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The partition scopes the clock to one account; the running frame accumulates its debits in book order — the last row of each account lands on its total debit mass. Partitioning by date would scramble accounts together, and the whole-frame chip would skip straight to the final mass.")

case(B10, "cs-2350", "hard", "growth", "Cumulative customer count by month",
"From: Growth lead. Re: the acquisition climb. Stage the customer count per signup month, then show the running total across months — the company's cumulative size month by month.",
"Show the cumulative customer count across months.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, {3}(*) AS joined\n  FROM customers\n  GROUP BY month\n)\nSELECT month, joined,\n       SUM(joined) OVER (ORDER BY month ASC {1}) AS cum_joined\nFROM m\nORDER BY month\nLIMIT {2};",
[s(RUN, "the so-far frame", "The climb accumulates through the current month only.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so the climb completes.", True),
 s("COUNT", "the monthly fold", "The month's signups are a count — COUNT(*) in the staging CTE.")],
[s(FULL, "the whole-frame chip", "The full frame would show the final headcount on every month."),
 s(MOV2, "the moving chip", "A two-month window pairs months instead of accumulating."),
 s("AVG", "the wrong fold", "AVG would average signup counts — meaningless for a climb.")],
"The staged months feed a running SUM of signup counts — the acquisition climb. The whole-frame chip would print the final headcount next to every month, and a moving frame would pair adjacent months instead of building the climb. The fold must be COUNT: months are counted, not summed.")

# ---------- WF11: FIRST/LAST/NTH_VALUE + percent of total (cs-2351..2375) ----------
case(B11, "cs-2351", "medium", "pricing", "The category champion on every shelf row",
"From: Pricing review. Re: the champion column. On every product row show the name of the MOST EXPENSIVE product in its category — the champion, painted on all its rivals' rows. FIRST_VALUE over a descending ladder does it.",
"Show each category's dearest product on every row.",
"SELECT name, category, price,\n       {1}(name) OVER (PARTITION BY category ORDER BY price DESC, name ASC) AS cat_champion\nFROM products\nORDER BY id\nLIMIT {2};",
[s("FIRST_VALUE", "the champion chip", "The champion sits at the TOP of the descending ladder — the first value; LAST_VALUE would need the full frame to find it."),
 s("8", "the sheet cut", "The sheet prints the first eight products — LIMIT 8 trims the catalog.", True)],
["LAST_VALUE", "NTILE", "8"],
"FIRST_VALUE over the price-descending ladder borrows the top of each aisle onto every row. LAST_VALUE with the default frame would return the CURRENT row's name — the famous trap; only the full-frame variant finds the true champion. The sheet's LIMIT trims the catalog for display.")

case(B11, "cs-2352", "medium", "pricing", "The aisle floor on every shelf row",
"From: Pricing review. Re: the floor column. On every product row show the CHEAPEST product name in its category — the floor of the aisle, painted on every shelf. FIRST_VALUE over an ascending ladder does it.",
"Show each category's cheapest product on every row.",
"SELECT name, category, price,\n       {1}(name) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS aisle_floor\nFROM products\nORDER BY id\nLIMIT {2} OFFSET {3};",
[s("FIRST_VALUE", "the floor chip", "The floor sits at the TOP of the ascending ladder — the first value.", True),
 s("8", "the sheet cut", "LIMIT 8 trims the walked catalog to its first eight rows.", True),
 s("0", "the page anchor", "OFFSET 0 anchors the page at the first row; any other offset slides the sheet down the ladder.", True)],
["LAST_VALUE", "4", "3"],
"FIRST_VALUE over the price-ascending ladder borrows the aisle's cheapest product onto every row. LAST_VALUE with the default frame would lie (it returns the current row), and MAX cannot fold names at all — the floor is a name, and names travel by FIRST_VALUE.")

case(B11, "cs-2353", "hard", "month-close", "LAST_VALUE, told honestly",
"From: Controller. Re: the honest column. On every ledger entry show BOTH last_value variants for the account's entry dates: the default-frame LAST_VALUE (which trails the current row) and the true last date via the full frame. The contrast IS the lesson.",
"Show the default and the true LAST_VALUE side by side.",
"SELECT id, account, entry_date,\n       LAST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS trailing,\n       LAST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC {1}) AS true_last\nFROM ledger_entries\nORDER BY account, entry_date ASC, id ASC\nLIMIT {2};",
[s(FULL, "the honest frame", "Only the frame spanning the whole partition makes LAST_VALUE see the true last row.", True),
 s("10", "the book cut", "The check prints ten rows — LIMIT 10 trims the walked book.", True)],
[s(RUN, "the trailing chip", "The truncated frame is exactly what makes the default column trail — using it twice would duplicate the lie."),
 s(MOV2, "the pair chip", "A two-row frame narrows the view, not widens it."),
 s("5", "the shorter cut", "LIMIT 5 shows fewer rows.")],
"The default frame ends at the current row, so the first LAST_VALUE trails — it equals the row's own date. The second column stretches the frame across the whole partition and tells the truth: the account's latest booking. Every row pairs the bug with its fix.")

case(B11, "cs-2354", "medium", "growth", "Everyone's first basket date",
"From: Growth lead. Re: the anniversary anchors. On every order row show the customer's EARLIEST order date — the anniversary anchor, painted on all their baskets. FIRST_VALUE over the chronological walk does it.",
"Show each customer's first order date on every order.",
"SELECT id, customer_id, created_at,\n       {1}(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_order\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC\nLIMIT {2};",
[s("FIRST_VALUE", "the anchor chip", "The anchor sits at the TOP of the chronological walk — the first value.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the private timelines.", True)],
["LAST_VALUE", "NTILE", "6"],
"FIRST_VALUE over each account's chronological walk paints their opening date on every basket — the CRM's anniversary anchor. LAST_VALUE with the default frame would return the current row's date; only its full-frame variant would find the latest, which is a different column than the memo's anchor.")

case(B11, "cs-2355", "hard", "growth", "Everyone's latest order date",
"From: Growth lead. Re: the recency column. On every order row show the customer's LATEST order date — but the default frame will lie. Stretch the frame across the whole partition so LAST_VALUE sees the true recency.",
"Show each customer's latest order date on every order.",
"SELECT id, customer_id, created_at,\n       LAST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS last_order\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC\nLIMIT {2};",
[s(FULL, "the honest frame", "The frame must span the whole partition — otherwise LAST_VALUE returns the current row's own date.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the private timelines.", True)],
[s(RUN, "the trailing chip", "The truncated frame is the bug the memo warns about — every row would read its own date."),
 s(MOV3, "the moving chip", "A three-row frame narrows the view further."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"LAST_VALUE's default frame ends at the current row, so without the fix every row would show its own date as 'latest'. Stretching the frame across the partition lets it see the account's true closing date. The memo's warning is the lesson: LAST_VALUE without a frame is a mirror, not a window.")

case(B11, "cs-2356", "medium", "inventory", "The first sale date per product",
"From: Inventory count. Re: the product birthdays. Join lines to orders and paint each line with its product's EARLIEST sale date — the product's birthday on every sale. FIRST_VALUE over the chronological walk per product.",
"Show each product's first sale date on every line.",
"SELECT oi.id, oi.product_id,\n       {1}(o.created_at) OVER (PARTITION BY oi.product_id ORDER BY o.created_at ASC, o.id ASC) AS first_sold\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nORDER BY oi.product_id, o.created_at ASC\nLIMIT {2};",
[s("FIRST_VALUE", "the birthday chip", "The birthday sits at the TOP of the product's chronological walk — the first value.", True),
 s("12", "the sheet cut", "The sheet prints twelve lines — LIMIT 12 trims the walked catalog.", True)],
["LAST_VALUE", "NTILE", "6"],
"The join gives every line its sale date; FIRST_VALUE over the product's chronological walk paints the birthday on all its lines. LAST_VALUE with the default frame would return the current line's date — the mirror trap — and only its full-frame variant would find the latest sale.")

case(B11, "cs-2357", "medium", "expense", "Each category's biggest bill",
"From: Spend report. Re: the category peaks. On every expense line show the LARGEST single amount within its category — the peak beside every bill. FIRST_VALUE over a descending amount ladder.",
"Show each category's biggest bill on every line.",
"SELECT id, category, amount_cents,\n       {1}(amount_cents) OVER (PARTITION BY category ORDER BY amount_cents {2}, id ASC) AS cat_peak\nFROM expenses\nORDER BY category, amount_cents DESC, id ASC\nLIMIT {3};",
[s("FIRST_VALUE", "the peak chip", "The peak sits at the top of the descending amount ladder — the first value.", True),
 s("DESC", "the ladder direction", "Descending puts the biggest bill first, where FIRST_VALUE finds it."),
 s("10", "the sheet cut", "The sheet prints ten lines — LIMIT 10 trims the walked categories.", True)],
["LAST_VALUE", "ASC", "5"],
"FIRST_VALUE over the descending amount ladder borrows each category's peak onto all its bills. The ASC flip would put the smallest bill at the top and the 'peak' would be the floor. LAST_VALUE with the default frame would mirror the current row instead of finding the peak.")

case(B11, "cs-2358", "hard", "month-close", "The second-biggest invoice",
"From: Controller. Re: the silver medal. On every invoice row show the SECOND-largest amount in the book — NTH_VALUE with position two over the descending walk, full frame so every row sees the same medal.",
"Show the book's second-largest invoice amount on every row.",
"SELECT id, number, amount_cents,\n       {1}(amount_cents, 2) OVER (ORDER BY amount_cents DESC, id ASC {2}) AS silver\nFROM invoices\nORDER BY id ASC\nLIMIT {3};",
[s("NTH_VALUE", "the medal chip", "The silver medal is the SECOND value of the descending walk — NTH_VALUE with position 2.", True),
 s(FULL, "the honest frame", "The full frame lets every row see the same podium; the default frame would show NULL until the walk passes it.", True),
 s("10", "the book cut", "The sheet prints ten rows — LIMIT 10 trims the walked book.", True)],
["FIRST_VALUE", "ROWS BETWEEN 3 PRECEDING AND CURRENT ROW", "5"],
"NTH_VALUE(amount, 2) over the descending walk with the full frame puts the silver medal on every row. FIRST_VALUE would hand out gold instead, and the moving frame would show NULL on most rows — the podium only exists at the top of the walk.")

case(B11, "cs-2359", "medium", "fraud", "The corridor per account",
"From: Fraud spot-check. Re: the account corridor. On every ledger entry show the account's FIRST and LAST entry dates — the account's open and close, two windows over one walk.",
"Show each account's opening and latest dates on every entry.",
"SELECT id, account, entry_date,\n       FIRST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC) AS opened,\n       LAST_VALUE(entry_date) OVER (PARTITION BY account ORDER BY entry_date ASC, id ASC {1}) AS latest\nFROM ledger_entries\nORDER BY account, entry_date ASC, id ASC\nLIMIT {2};",
[s(FULL, "the honest frame", "The latest date needs the full frame; FIRST_VALUE needs no help — ascending puts the opening on top.", True),
 s("10", "the book cut", "The check prints ten rows — LIMIT 10 trims the walked book.", True)],
[s(RUN, "the trailing chip", "The truncated frame would make latest mirror the current row — the classic lie."),
 s(MOV3, "the moving chip", "A three-row frame narrows the view further."),
 s("5", "the shorter cut", "LIMIT 5 shows fewer rows.")],
"Two windows, one walk: FIRST_VALUE grabs the opening from the top of the ascending ladder, and LAST_VALUE finds the true close only because its frame spans the whole partition. The truncated-frame chip would turn the latest column into a mirror — every row would read its own date.")

case(B11, "cs-2360", "medium", "growth", "Share of the company",
"From: Growth lead. Re: the revenue shares. Stage each customer's spend and show their percent of TOTAL company revenue — the empty-window SUM is the denominator, the row's spend the numerator, dressed with ROUND.",
"Show each customer's share of total revenue.",
"WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, ROUND(spend, 2) AS spend,\n       {1}(100.0 * spend / {2}(spend) OVER (), 2) AS share\nFROM s\nORDER BY share DESC, name ASC\nLIMIT 8;",
[s("ROUND", "the percent dressing", "Shares read cleanest at two decimals — ROUND dresses the division.", True),
 s("SUM", "the grand denominator", "The empty-window SUM is the total spend across all staged customers.")],
["CAST", "AVG"],
"The empty-window SUM over the staged rows is the company total; each customer's spend divided by it, scaled by 100.0 first, is the share. CAST cannot take a precision argument, and averaging the shares would describe the typical share, not each customer's slice.")

case(B11, "cs-2361", "hard", "month-close", "Status money shares",
"From: Controller. Re: the stage slices. Stage revenue per order status and show each stage's percent of total revenue — the funnel's money mix, computed with the empty-window denominator.",
"Show each status's share of total revenue.",
"WITH s AS (\n  SELECT status, SUM(total) AS revenue\n  FROM orders\n  GROUP BY status\n)\nSELECT status, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / {1}(revenue) OVER (), 2) AS share\nFROM s\nORDER BY share DESC\nLIMIT {2};",
[s("SUM", "the grand denominator", "The empty-window SUM is the total revenue across all stages.", True),
 s("3", "the stage cut", "LIMIT 3 trims the four-status sheet to three rows so the cut is provable.", True)],
["AVG", "5"],
"The empty-window SUM over the staged stages is the company revenue; each stage divided by it is the slice. The shares sum to 100. Averaging would describe the typical stage, and LIMIT 2 would hide half the funnel's money mix.")

case(B11, "cs-2362", "medium", "inventory", "Shelf share of stock",
"From: Inventory count. Re: the stock shares. On every product row show its percent of the WHOLE warehouse's stock — the global pie, not the aisle's. The empty-window SUM is the denominator.",
"Show each product's share of total stock.",
"SELECT name, stock,\n       {1}(100.0 * stock / SUM(stock) OVER (), 2) AS stock_share\nFROM products\nORDER BY stock DESC, name ASC\nLIMIT {2};",
[s("ROUND", "the percent dressing", "Shares read cleanest at two decimals — ROUND dresses the division.", True),
 s("8", "the sheet cut", "The sheet prints the eight deepest shelves — LIMIT 8 trims the catalog.", True)],
["CAST", "AVG"],
"The empty-window SUM totals the whole warehouse's stock; each shelf divided by that pie is its global share. CAST would flatten the decimals, and averaging shares would describe the typical shelf rather than each one's slice of the warehouse.")

case(B11, "cs-2363", "hard", "month-close", "Bill share of the account",
"From: Controller. Re: the relationship slices. On every invoice row show the bill's percent of its CUSTOMER's total billing — the partitioned pie. The windowed SUM is scoped per account.",
"Show each invoice's share of its customer's billing.",
"SELECT number, customer_id, amount_cents,\n       {1}(100.0 * amount_cents / SUM(amount_cents) OVER (PARTITION BY {2}), 2) AS bill_pct\nFROM invoices\nORDER BY customer_id, amount_cents DESC\nLIMIT {3};",
[s("ROUND", "the percent dressing", "Shares read cleanest at two decimals — ROUND dresses the division.", True),
 s("customer_id", "the pie boundary", "PARTITION BY customer_id makes the pie each account's total billing.", True),
 s("10", "the sheet cut", "The sheet prints ten rows — LIMIT 10 trims the walked accounts.", True)],
["CAST", "status", "5"],
"The windowed SUM totals each account's billing; the row's amount over that pie is the bill's slice of the relationship. CAST would flatten the decimals. Partitioning by status would measure bills against stage buckets — open bills compared with open bills — a different denominator than the memo's.")

case(B11, "cs-2364", "medium", "supplier", "Supplier revenue concentration",
"From: Supplier audit. Re: the sourcing mix. Join lines to products to suppliers, fold revenue per supplier, and show each vendor's percent of all sold revenue — the concentration sheet.",
"Show each supplier's share of sold revenue.",
"WITH r AS (\n  SELECT sup.name AS supplier, SUM(oi.quantity * oi.unit_price) AS revenue\n  FROM order_items oi\n  JOIN products p ON p.id = oi.product_id\n  JOIN suppliers sup ON sup.id = p.supplier_id\n  GROUP BY sup.name\n)\nSELECT supplier, ROUND(revenue, 2) AS revenue,\n       ROUND(100.0 * revenue / {1}(revenue) OVER (), 2) AS share\nFROM r\nORDER BY share DESC\nLIMIT {2};",
[s("SUM", "the grand denominator", "The empty-window SUM is the total sold revenue across all vendors.", True),
 s("6", "the vendor cut", "All six suppliers fit; LIMIT 6 keeps the sheet complete.", True)],
["AVG", "3"],
"The staged vendors feed the concentration sheet: each vendor's revenue over the empty-window grand total, scaled and rounded. Averaging would describe the typical vendor, and LIMIT 3 would hide half the sourcing mix — concentration reports need the whole pie.")

case(B11, "cs-2365", "medium", "catalog", "The aisle's second price",
"From: Warehouse catalog. Re: the silver rungs. On every product row show the SECOND-most-expensive price in its category — NTH_VALUE with the full frame so every row sees the same medal.",
"Show each category's second-highest price on every row.",
"SELECT name, category, price,\n       {1}(price, 2) OVER (PARTITION BY category ORDER BY price DESC, name ASC {2}) AS cat_silver\nFROM products\nORDER BY category, price DESC, name ASC\nLIMIT {3};",
[s("NTH_VALUE", "the medal chip", "The silver rung is the SECOND value of the descending ladder — NTH_VALUE with position 2.", True),
 s(FULL, "the honest frame", "The full frame lets every row see the same podium.", True),
 s("12", "the ladder cut", "The sheet prints twelve ladder rows — LIMIT 12 trims the walked aisles.", True)],
["FIRST_VALUE", RUN, "6"],
"NTH_VALUE(price, 2) over the descending aisle ladder with the full frame paints the silver price on every row. FIRST_VALUE would hand out gold, and the running frame would show NULL on most rows — the podium only exists at the top of the walk.")

case(B11, "cs-2366", "medium", "growth", "Region champion order",
"From: Growth lead. Re: the regional champions. Join orders to customers; on every order show the id of the BIGGEST basket within its region — the champion, painted on every basket in the market.",
"Show each region's champion order id on every order.",
"SELECT o.id, c.region,\n       {1}(o.id) OVER (PARTITION BY c.region ORDER BY o.total {2}, o.id ASC) AS region_champ\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id ASC\nLIMIT {3};",
[s("FIRST_VALUE", "the champion chip", "The champion sits at the top of the descending total ladder — the first value.", True),
 s("DESC", "the ladder direction", "Descending puts the biggest basket first, where FIRST_VALUE finds it."),
 s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the walked orders.", True)],
["LAST_VALUE", "ASC", "6"],
"FIRST_VALUE over the region's descending ladder borrows the champion's id onto every basket in that market. The ASC flip would crown the smallest basket, and LAST_VALUE with the default frame would mirror the current row — the trap the memo's phrasing avoids.")

case(B11, "cs-2367", "medium", "inventory", "Gap to the aisle ceiling",
"From: Inventory count. Re: the headroom walk. On every product row show how far its PRICE sits below the category's most expensive price — the gap computed from FIRST_VALUE over the descending ladder.",
"Show each product's gap below its aisle ceiling.",
"SELECT name, category, price,\n       {1}(price) OVER (PARTITION BY category ORDER BY price DESC, name ASC) - price AS headroom\nFROM products\nORDER BY category, price DESC, name ASC\nLIMIT {2};",
[s("FIRST_VALUE", "the ceiling chip", "The ceiling is the first value of the descending ladder; the gap is that minus the row's own price.", True),
 s("10", "the sheet cut", "The sheet prints ten rows — LIMIT 10 trims the walked aisles.", True)],
["MIN", "LAST_VALUE", "5"],
"FIRST_VALUE over the descending ladder repeats the aisle ceiling on every row; subtracting the row's price leaves the headroom. MIN would measure against the floor and produce negative headroom; LAST_VALUE with the default frame would subtract the row from itself — zero everywhere.")

case(B11, "cs-2368", "medium", "catalog", "Both ends of every aisle",
"From: Warehouse catalog. Re: the corridor columns. On every product row show the category's cheapest AND dearest prices — the corridor, two windows over one partition.",
"Show each category's price corridor on every product.",
"SELECT name, category, price,\n       FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS cat_floor,\n       {1}(price) OVER (PARTITION BY category ORDER BY price ASC, name ASC {2}) AS cat_top\nFROM products\nORDER BY category, price ASC, name ASC\nLIMIT {3};",
[s("LAST_VALUE", "the ceiling chip", "The dearest price is the LAST value of the ascending ladder — but only with the full frame.", True),
 s(FULL, "the honest frame", "The frame must span the partition or the ceiling mirrors the current row.", True),
 s("12", "the ladder cut", "The sheet prints twelve ladder rows — LIMIT 12 trims the walked aisles.", True)],
[s("FIRST_VALUE", "the duplicate chip", "FIRST_VALUE would return the floor twice — the corridor would lose its top edge."),
 s(RUN, "the trailing chip", "The truncated frame makes LAST_VALUE trail the current row."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The floor comes free on an ascending ladder (FIRST_VALUE); the ceiling needs LAST_VALUE with the full frame — otherwise it mirrors the current row and the corridor collapses to a point. Two windows, one partition, one honest frame.")

case(B11, "cs-2369", "hard", "fraud", "The running minimum price",
"From: Fraud spot-check. Re: the downward walk. Walk the catalog from cheapest upward and show the cheapest price seen SO FAR — a running minimum via FIRST_VALUE with the truncated frame. Because the walk ascends, the running first is the global floor — but the frame makes the semantics explicit.",
"Show the running minimum price along the ascending walk.",
"SELECT name, price,\n       {1}(price) OVER (ORDER BY price ASC, name ASC {2}) AS min_so_far\nFROM products\nORDER BY price ASC, name ASC\nLIMIT {3};",
[s("FIRST_VALUE", "the floor chip", "The running minimum is the FIRST value of the walk-so-far — FIRST_VALUE with the truncated frame.", True),
 s(RUN, "the so-far frame", "The frame must end at the current row for the value to be 'so far'.", True),
 s("12", "the walk cut", "The walk prints twelve rows — LIMIT 12 trims the ascending ladder.", True)],
[s("LAST_VALUE", "the wrong end", "On an ascending walk the LAST value so far is the CURRENT price, not the minimum."),
 s("ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "the moving chip", "A three-row window takes the minimum of the last three shelves, not the running floor."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"FIRST_VALUE over the ascending walk with the truncated frame is the running minimum — the cheapest price seen so far. LAST_VALUE on the same walk would borrow the current price (the wrong end), and the whole-frame chip would replace the walk with the global floor.")

case(B11, "cs-2370", "medium", "month-close", "Benchmark month on every row",
"From: Controller. Re: the benchmark column. Stage monthly revenue; on every month show the name of the HIGHEST-revenue month — the benchmark, painted on all rows via FIRST_VALUE over the descending revenue walk.",
"Show the best month's name on every row.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       {1}(month) OVER (ORDER BY revenue DESC, month ASC) AS best_month\nFROM m\nORDER BY month ASC\nLIMIT {2};",
[s("FIRST_VALUE", "the benchmark chip", "The benchmark sits at the top of the descending revenue walk — the first value.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so the benchmark repeats consistently.", True)],
["LAST_VALUE", "AVG", "8"],
"FIRST_VALUE over the revenue-descending walk borrows the champion month's name onto every row — the whole series gets the same benchmark. LAST_VALUE with the default frame would mirror the current row, and averaging would describe the typical month rather than crown the champion.")

case(B11, "cs-2371", "hard", "month-close", "The honest best month",
"From: Controller. Re: the paired columns. Stage monthly revenue and show BOTH best-month columns: LAST_VALUE with the default frame (which trails) and LAST_VALUE with the full frame (which tells the truth). The contrast is the lesson.",
"Show the trailing and the true best month side by side.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, revenue,\n       LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS trailing,\n       LAST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC {1}) AS best_true\nFROM m\nORDER BY month ASC\nLIMIT {2};",
[s(FULL, "the honest frame", "Only the whole-partition frame lets LAST_VALUE see the true top month.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so the contrast is visible everywhere.", True)],
[s(RUN, "the trailing chip", "The truncated frame IS the bug — using it twice would duplicate the trailing lie."),
 s(MOV2, "the pair chip", "A two-row frame narrows the view further."),
 s("8", "the shorter cut", "LIMIT 8 shows half the months.")],
"The first LAST_VALUE trails the current row (the default frame's edge), so it names whichever month the walk has reached — usually a lie. The second stretches across the partition and always names the true champion. Every row pairs the bug with its fix, which is exactly what the close binder's appendix documents.")

case(B11, "cs-2372", "medium", "inventory", "Product lifetime demand beside every sale",
"From: Inventory count. Re: the demand column. Join lines to orders and paint each line with its product LIFETIME units sold — the partitioned pie: SUM of quantity over the product partition.",
"Show each product's lifetime units on every line.",
"SELECT oi.id, oi.product_id,\n       SUM(oi.quantity) OVER (PARTITION BY {1}) AS product_units\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nORDER BY oi.product_id, oi.id ASC\nLIMIT {2};",
[s("oi.product_id", "the demand boundary", "PARTITION BY the product key folds each product's whole demand onto its lines.", True),
 s("12", "the sheet cut", "The sheet prints twelve lines — LIMIT 12 trims the walked catalog.", True)],
["o.customer_id", "6"],
"The windowed SUM over the product partition totals every unit ever sold of that product and paints it on all its lines — the demand context for replenishment. Partitioning by customer would answer a different question entirely: how much each BUYER bought, not how much each PRODUCT sold.")

case(B11, "cs-2373", "medium", "fraud", "Region revenue on every basket",
"From: Fraud spot-check. Re: the market context. Join orders to customers and paint every basket with its region's total revenue — the market's money beside each order. The windowed SUM over the region partition.",
"Show each region's revenue on every order.",
"SELECT o.id, c.region,\n       {1}(o.total) OVER (PARTITION BY {2}) AS region_revenue\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nORDER BY o.id ASC\nLIMIT {3};",
[s("SUM", "the market fold", "The market's money is the sum of its baskets — SUM within the partitioned join.", True),
 s("c.region", "the market boundary", "PARTITION BY the region column folds each market after the join.", True),
 s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the walked orders.", True)],
[s("AVG", "the norm fold", "AVG would carry the market's typical basket, not its whole revenue."),
 s("c.city", "the town boundary", "Partitioning by city would slice markets into towns."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"The join gives every basket its market; the windowed SUM folds each region's revenue and paints it on all its orders. AVG would carry the typical basket instead of the market's mass, and the city partition would tighten the lens beyond the memo's market view.")

case(B11, "cs-2374", "hard", "catalog", "Third-largest basket, everywhere",
"From: Warehouse catalog. Re: the bronze basket. On every order row show the THIRD-largest total in the book — NTH_VALUE with position three over the descending walk, full frame so every row sees the same medal.",
"Show the book's third-largest basket on every row.",
"SELECT id, total,\n       {1}(total, 3) OVER (ORDER BY total DESC, id ASC {2}) AS bronze\nFROM orders\nORDER BY id ASC\nLIMIT {3};",
[s("NTH_VALUE", "the medal chip", "The bronze basket is the THIRD value of the descending walk — NTH_VALUE with position 3.", True),
 s(FULL, "the honest frame", "The full frame lets every row see the same podium.", True),
 s("10", "the book cut", "The sheet prints ten rows — LIMIT 10 trims the walked book.", True)],
["FIRST_VALUE", "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW", "5"],
"NTH_VALUE(total, 3) over the descending walk with the full frame puts the bronze basket on every row. FIRST_VALUE would hand out gold, and the running frame would show NULL on most rows — the podium only exists at the top of the walk, and the full frame is what broadcasts it.")

case(B11, "cs-2375", "medium", "expense", "Vendor floor and peak",
"From: Spend report. Re: the relationship corridor. On every expense line show the vendor's SMALLEST and LARGEST single charges — the corridor, two windows over one vendor partition.",
"Show each vendor's bill corridor on every line.",
"SELECT id, vendor, amount_cents,\n       FIRST_VALUE(amount_cents) OVER (PARTITION BY vendor ORDER BY amount_cents ASC, id ASC) AS vendor_floor,\n       LAST_VALUE(amount_cents) OVER (PARTITION BY vendor ORDER BY amount_cents ASC, id ASC {1}) AS vendor_peak\nFROM expenses\nORDER BY vendor, amount_cents ASC, id ASC\nLIMIT {2};",
[s(FULL, "the honest frame", "The peak needs the whole-partition frame; the floor comes free on the ascending ladder.", True),
 s("10", "the sheet cut", "The sheet prints ten rows — LIMIT 10 trims the walked vendors.", True)],
[s(RUN, "the trailing chip", "The truncated frame would make the peak mirror the current bill."),
 s(MOV2, "the pair chip", "A two-bill frame narrows the view."),
 s("5", "the shorter cut", "LIMIT 5 shows fewer rows.")],
"The floor rides the top of the ascending ladder (FIRST_VALUE); the peak needs LAST_VALUE with the full frame — the corridor's two ends from one partition. The truncated-frame chip would mirror the current bill into the peak column, collapsing the corridor.")

# ---------- WF12: NTILE / CUME_DIST / PERCENT_RANK + capstones (cs-2376..2400) ----------
case(B12, "cs-2376", "medium", "pricing", "Three price tiers",
"From: Pricing review. Re: the tier sheet. Split the catalog into THREE price tiers by tile — the cheapest third in tile 1, the dearest in tile 3. NTILE deals by count, not by value thresholds.",
"Deal the catalog into three price tiles.",
"SELECT name, price, {1}({2}) OVER (ORDER BY price ASC, name ASC) AS tier\nFROM products\nORDER BY price ASC, name ASC\nLIMIT 16;",
[s("NTILE", "the tile dealer", "NTILE deals rows into equal-count buckets — the memo's proportional tiering.", True),
 s("3", "the tier count", "Three tiers means NTILE(3): 6/5/5 across sixteen products.", True)],
["RANK", "4"],
"NTILE(3) deals the sixteen products into three equal-count shelves — 6/5/5 — cheapest first. RANK would stamp positions 1..16, not buckets, and NTILE(4) would deal four shelves when the memo asked for three. Tile numbers are counts, not value thresholds.")

case(B12, "cs-2377", "medium", "fraud", "Order quartiles",
"From: Fraud spot-check. Re: the basket spread. Split all orders into four buckets by total, cheapest bucket first, and show each order's tile. 103 orders deal into 26/26/26/25.",
"Deal orders into four total buckets.",
"SELECT id, total, {1}({2}) OVER (ORDER BY total ASC, id ASC) AS tile\nFROM orders\nORDER BY total ASC, id ASC\nLIMIT {3};",
[s("NTILE", "the tile dealer", "Equal-count buckets are NTILE's deal — quartiles by count.", True),
 s("4", "the bucket count", "Four buckets is NTILE(4): 26/26/26/25 across the 103 baskets.", True),
 s("40", "the sheet cut", "LIMIT 40 reaches past row 27, where the three-tile and four-tile deals diverge.", True)],
["RANK", "3", "20"],
"NTILE(4) deals the 103 baskets into four equal-count quartiles — the spread the examiner reads. RANK would stamp a 1..N ladder instead of buckets, and NTILE(3) would deal terciles. The id tiebreak keeps the dealing deterministic at the bucket edges.")

case(B12, "cs-2378", "hard", "pricing", "Tiers inside each category",
"From: Pricing review. Re: the aisle tiles. Within EACH category, deal products into two price tiles — the cheaper half in tile 1. The counter resets per aisle, so every category has its own halves.",
"Deal each category's products into two price tiles.",
"SELECT name, category, price,\n       {1}({2}) OVER (PARTITION BY category ORDER BY price ASC, name ASC) AS tile\nFROM products\nORDER BY category, price ASC, name ASC\nLIMIT {3};",
[s("NTILE", "the tile dealer", "Equal-count halves are NTILE's deal, partitioned per aisle.", True),
 s("2", "the half count", "Two tiles is NTILE(2) — the cheaper half lands in tile 1.", True),
 s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the walked aisles.", True)],
["RANK", "3", "6"],
"NTILE(2) partitioned by category deals each aisle into its own halves — the counter resets at every aisle edge. RANK would run a 1..N ladder inside each aisle instead of buckets. Odd-sized aisles give the extra row to the earlier tile.")

case(B12, "cs-2379", "hard", "fraud", "The top quarter of spenders",
"From: Fraud spot-check. Re: the whale list. Stage each customer's lifetime spend, deal them into four tiles by spend DESCENDING, and keep tile 4 — the top quarter by money. The tile is staged, then filtered.",
"List the top-quarter customers by lifetime spend.",
"WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n), t AS (\n  SELECT name, spend, {1}({2}) OVER (ORDER BY spend DESC, name ASC) AS tile\n  FROM s\n)\nSELECT name, ROUND(spend, 2) AS spend, tile\nFROM t\nWHERE tile = 4\nORDER BY spend DESC, name ASC\nLIMIT {3};",
[s("NTILE", "the tile dealer", "The whale list is the top tile of a four-way deal — NTILE(4).", True),
 s("4", "the tile count", "Four tiles, ranked descending, puts the biggest spenders in tile 4.", True),
 s("3", "the list cut", "LIMIT 3 trims the whale list to its first three rows so the cut is provable.", True)],
["RANK", "5", "1"],
"Stage, deal, filter: the CTE folds one spend per customer, NTILE(4) deals them descending so tile 4 holds the top quarter, and the outer query keeps that tile. RANK would stamp a ladder — no buckets to filter. Filtering in the staging layer would be impossible; the tile exists only after the window.")

case(B12, "cs-2380", "medium", "fraud", "Cumulative distribution of baskets",
"From: Fraud spot-check. Re: the distribution. For every order show CUME_DIST over the total-ascending walk — the fraction of baskets at or below this one, rounded to four decimals. The last row must read 1.0.",
"Show each basket's cumulative distribution.",
"SELECT id, total,\n       {1}({2}() OVER (ORDER BY total ASC, id ASC), 4) AS cum_dist\nFROM orders\nORDER BY total ASC, id ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Distributions read cleanest at four decimals — ROUND dresses the fraction.", True),
 s("CUME_DIST", "the distribution chip", "CUME_DIST is the fraction of rows at or below the current one.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked distribution.", True)],
["PERCENT_RANK", "3"],
"CUME_DIST answers 'what fraction of baskets cost at most this much' — it reaches 1.0 at the final row. PERCENT_RANK starts at exactly 0 and scales by rank, a different statistic the memo did not ask for. The dressing keeps the fractions readable.")

case(B12, "cs-2381", "medium", "growth", "Percent rank of baskets",
"From: Growth lead. Re: the percentile ladder. For every order show PERCENT_RANK over the total-ascending walk — (rank minus one) over (rows minus one), rounded to four decimals. The first row must read 0.0.",
"Show each basket's percent rank.",
"SELECT id, total,\n       {1}({2}() OVER (ORDER BY total ASC, id ASC), 4) AS pr\nFROM orders\nORDER BY total ASC, id ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Percent ranks read cleanest at four decimals — ROUND dresses the fraction.", True),
 s("PERCENT_RANK", "the ladder chip", "PERCENT_RANK is (rank-1)/(rows-1) — it starts at exactly 0.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked ladder.", True)],
["CUME_DIST", "3"],
"PERCENT_RANK places each basket on the 0-to-1 ladder by rank; the cheapest basket reads exactly 0.0. CUME_DIST would start above zero and count peers — a cumulative share, not a rank fraction. The dressing keeps the ladder readable.")

case(B12, "cs-2382", "medium", "pricing", "Two statistics, one shelf",
"From: Pricing review. Re: the paired columns. On every product show BOTH the CUME_DIST and the PERCENT_RANK of its price over the ascending walk — the two statistics agree only in the extremes, and the contrast is the lesson.",
"Show the distribution and the rank of every price.",
"SELECT name, price,\n       ROUND(CUME_DIST() OVER (ORDER BY price ASC, name ASC), 4) AS cd,\n       {1}({2}() OVER (ORDER BY price ASC, name ASC), 4) AS pr\nFROM products\nORDER BY price ASC, name ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Both statistics read cleanest at four decimals — ROUND dresses them.", True),
 s("PERCENT_RANK", "the rank chip", "The second column is the rank fraction — starting at exactly 0.", True),
 s("12", "the shelf cut", "The sheet prints twelve rows — LIMIT 12 trims the walked shelf.", True)],
["CUME_DIST", "NTILE"],
"Two windows over one walk: CUME_DIST counts peers cumulatively, PERCENT_RANK scales by rank — the first rows separate them (cd > 0 but pr = 0). NTILE would bucket instead of placing. The memo wants both columns so the reader can feel the difference.")

case(B12, "cs-2383", "hard", "month-close", "Invoice deciles",
"From: Controller. Re: the AR spread. Split invoices into TEN amount tiles and show each bill's decile — the fine-grained spread of the receivable book. 28 invoices deal into tiles of 3 then 2.",
"Deal invoices into ten amount tiles.",
"SELECT number, amount_cents, {1}({2}) OVER (ORDER BY amount_cents ASC, id ASC) AS decile\nFROM invoices\nORDER BY amount_cents ASC, id ASC\nLIMIT {3};",
[s("NTILE", "the tile dealer", "Ten equal-count buckets are NTILE's deal — deciles by count.", True),
 s("10", "the bucket count", "Ten tiles is NTILE(10): tiles of 3 then 2 across 28 invoices.", True),
 s("14", "the book cut", "The sheet prints fourteen rows — LIMIT 14 trims the dealt book.", True)],
["RANK", "4", "7"],
"NTILE(10) deals the 28 bills into ten deciles — the fine spread of the receivable book. RANK would stamp a 1..N ladder, and NTILE(4) would deal quartiles when the memo asked for deciles. The id tiebreak keeps the dealing deterministic at the edges.")

case(B12, "cs-2384", "hard", "growth", "The heavier half of spenders",
"From: Growth lead. Re: the upper half. Stage per-customer spend, compute CUME_DIST over the ascending walk, and keep the rows at or above 0.5 — the heavier half of the customer base, by money.",
"List the customers in the heavier half of spend.",
"WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n), d AS (\n  SELECT name, spend, {1}({2}() OVER (ORDER BY spend ASC, name ASC)) AS cd\n  FROM s\n)\nSELECT name, ROUND(spend, 2) AS spend, ROUND(cd, 4) AS cd\nFROM d\nWHERE cd >= 0.5\nORDER BY spend ASC, name ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "The final fraction reads cleanest at two decimals — ROUND dresses it.", True),
 s("CUME_DIST", "the distribution chip", "The half-way split is the cumulative distribution — rows at or above 0.5 are the heavier half.", True),
 s("6", "the list cut", "LIMIT 6 trims the heavier half to six of the eight qualifying names.", True)],
["PERCENT_RANK", "NTILE", "3"],
"The staged spends get their cumulative distribution; the filter keeps the rows at or past the halfway mark — the heavier half by money. PERCENT_RANK would start at 0 and never guarantee the halfway semantics; the WHERE cannot see a window directly, which is why the distribution is staged first.")

case(B12, "cs-2385", "medium", "month-close", "Where this month stands",
"From: Controller. Re: the standing columns. Stage monthly revenue and show BOTH the percent rank and the cumulative distribution of each month's revenue — the month's standing on the 0-to-1 ladder and among its peers.",
"Show each month's percent rank and distribution.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       {1}({2}() OVER (ORDER BY revenue ASC, month ASC), 4) AS pr,\n       ROUND(CUME_DIST() OVER (ORDER BY revenue ASC, month ASC), 4) AS cd\nFROM m\nORDER BY revenue ASC, month ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Both statistics read cleanest at four decimals — ROUND dresses them.", True),
 s("PERCENT_RANK", "the rank chip", "The first column is the rank fraction over the ascending walk.", True),
 s("14", "the series cut", "LIMIT 14 keeps every month so both statistics complete.", True)],
["CUME_DIST", "NTILE"],
"Two windows over the staged months: PERCENT_RANK places each month on the rank ladder, CUME_DIST counts the peers at or below it. NTILE would bucket the months instead of placing them. The memo wants both so the reader sees where rank and distribution diverge.")

case(B12, "cs-2386", "hard", "pricing", "Percent rank inside each aisle",
"From: Pricing review. Re: the aisle ladders. On every product show the PERCENT_RANK of its price WITHIN its category — each aisle's own 0-to-1 ladder. Solo products in a category read 0.0.",
"Show each product's price percent rank within its aisle.",
"SELECT name, category, price,\n       {1}({2}() OVER (PARTITION BY category ORDER BY price ASC, name ASC), 4) AS aisle_pr\nFROM products\nORDER BY category, price ASC, name ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Ladder fractions read cleanest at four decimals — ROUND dresses them.", True),
 s("PERCENT_RANK", "the ladder chip", "The within-aisle ladder is PERCENT_RANK partitioned by category.", True),
 s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the walked aisles.", True)],
["CUME_DIST", "NTILE"],
"The partition scopes each aisle's ladder; PERCENT_RANK places every product on it from 0 to 1 — a solo product in a one-item category reads 0.0 because (rank-1)/(rows-1) is zero over zero, defined as zero. CUME_DIST would count peers instead of ranking.")

case(B12, "cs-2387", "medium", "inventory", "Demand distribution per line",
"From: Inventory count. Re: the line distribution. On every order line show the CUME_DIST of its line value over the whole book — where this sale sits among all lines, by money.",
"Show each line's distribution by line value.",
"SELECT id, ROUND(quantity * unit_price, 2) AS line_value,\n       ROUND({1}() OVER (ORDER BY quantity * unit_price ASC, id ASC), 4) AS cd\nFROM order_items\nORDER BY quantity * unit_price ASC, id ASC\nLIMIT {2};",
[s("CUME_DIST", "the distribution chip", "The line's placement among all lines is the cumulative distribution over the value walk.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked lines.", True)],
["PERCENT_RANK", "NTILE"],
"CUME_DIST places each line by the fraction of lines worth at most as much — the distribution the replenishment team reads. PERCENT_RANK would scale by rank instead of peers, a subtly different placement, and NTILE would bucket the book rather than locate a line within it.")

case(B12, "cs-2388", "hard", "growth", "Volume tiles by month",
"From: Growth lead. Re: the calendar spread. Stage monthly order counts and deal the months into FOUR tiles by volume — the busy seasons in tile 4. The tiles are staged, then the top tile is kept.",
"Deal months into four volume tiles, keep the busiest.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, COUNT(*) AS orders\n  FROM orders\n  GROUP BY month\n), t AS (\n  SELECT month, orders, {1}({2}) OVER (ORDER BY orders DESC, month ASC) AS tile\n  FROM m\n)\nSELECT month, orders, tile\nFROM t\nWHERE tile = 4\nORDER BY orders DESC, month ASC\nLIMIT {3};",
[s("NTILE", "the tile dealer", "Four equal-count tiles are NTILE's deal, ranked descending so tile 4 is the busiest.", True),
 s("4", "the tile count", "Four tiles is NTILE(4): the fourteen months deal 4/4/3/3.", True),
 s("2", "the season cut", "LIMIT 2 trims the busiest tile display to two of its months so the cut is provable.", True)],
["RANK", "2", "5"],
"Stage, deal, keep: the CTE counts each month, NTILE(4) deals them descending so tile 4 collects the busiest quarter of the calendar, and the outer query keeps that tile. RANK would run a ladder with no buckets, and the count fold must be COUNT — months are counted, not summed.")

case(B12, "cs-2389", "medium", "month-close", "The distribution of billed cents",
"From: Controller. Re: the AR placement. For every invoice show the CUME_DIST of its amount over the book — where this bill sits among all bills, by size.",
"Show each invoice's distribution by amount.",
"SELECT number, amount_cents,\n       ROUND({1}() OVER (ORDER BY amount_cents ASC, id ASC), 4) AS cd\nFROM invoices\nORDER BY amount_cents ASC, id ASC\nLIMIT {2};",
[s("CUME_DIST", "the distribution chip", "The bill's placement among all bills is the cumulative distribution over the amount walk.", True),
 s("14", "the book cut", "The sheet prints fourteen rows — LIMIT 14 trims the walked book.", True)],
["PERCENT_RANK", "NTILE"],
"CUME_DIST places each bill by the fraction of bills at or below its size — the AR team reads it as 'this bill is bigger than X percent of the book'. PERCENT_RANK would scale by rank, and NTILE would deal buckets instead of locating a bill.")

case(B12, "cs-2390", "hard", "fraud", "Payment-speed bands",
"From: Fraud spot-check. Re: the speed bands. Join payments to invoices, compute each payment's days-to-pay, then deal the payments into FOUR speed bands — the slowest payers land in band 4.",
"Deal payments into four speed bands.",
"WITH t AS (\n  SELECT p.id AS payment_id,\n         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n)\nSELECT payment_id, days, {1}({2}) OVER (ORDER BY days ASC, payment_id ASC) AS band\nFROM t\nORDER BY days ASC, payment_id ASC\nLIMIT {3};",
[s("NTILE", "the band dealer", "Four equal-count bands are NTILE's deal over the ascending speed walk.", True),
 s("4", "the band count", "Four bands is NTILE(4) — band 4 holds the slowest payers.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked payments.", True)],
["RANK", "2", "6"],
"The staged days-to-pay feed NTILE(4) over the ascending walk — fast payers collect in band 1, slow payers in band 4. RANK would stamp a ladder instead of bands. The julianday staging keeps the band deal honest: the window sees computed days, not raw dates.")

case(B12, "cs-2391", "hard", "fraud", "Speed percentiles",
"From: Fraud spot-check. Re: the standing columns. For every payment show the PERCENT_RANK of its days-to-pay among all payments — how slow this payer is relative to the book, on the 0-to-1 ladder.",
"Show each payment's speed percent rank.",
"WITH t AS (\n  SELECT p.id AS payment_id,\n         CAST(julianday(p.paid_on) - julianday(i.issued_on) AS INTEGER) AS days\n  FROM payments p\n  JOIN invoices i ON i.id = p.invoice_id\n)\nSELECT payment_id, days,\n       {1}({2}() OVER (ORDER BY days ASC, payment_id ASC), 4) AS pr\nFROM t\nORDER BY days ASC, payment_id ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Ladder fractions read cleanest at four decimals — ROUND dresses them.", True),
 s("PERCENT_RANK", "the ladder chip", "The speed ladder is PERCENT_RANK over the ascending days walk.", True),
 s("12", "the walk cut", "The sheet prints twelve rows — LIMIT 12 trims the walked payments.", True)],
["CUME_DIST", "NTILE"],
"The staged days feed PERCENT_RANK: the fastest payer reads 0.0, the slowest 1.0. CUME_DIST would count peers cumulatively — close, but the memo's statistic is the rank fraction, and NTILE would bucket instead of placing. The staging keeps julianday math out of the window.")

case(B12, "cs-2392", "medium", "catalog", "Customer spend distribution",
"From: Warehouse catalog. Re: the money placement. Stage per-customer spend and show each account's CUME_DIST over the ascending walk — the customer's placement in the base's money distribution.",
"Show each customer's spend distribution.",
"WITH s AS (\n  SELECT c.name, SUM(o.total) AS spend\n  FROM orders o\n  JOIN customers c ON c.id = o.customer_id\n  GROUP BY c.id, c.name\n)\nSELECT name, ROUND(spend, 2) AS spend,\n       {1}({2}() OVER (ORDER BY spend ASC, name ASC), 4) AS cd\nFROM s\nORDER BY spend ASC, name ASC\nLIMIT {3};",
[s("ROUND", "the decimal dressing", "Distributions read cleanest at four decimals — ROUND dresses the fraction.", True),
 s("CUME_DIST", "the distribution chip", "The customer's placement among all customers is the cumulative distribution.", True),
 s("16", "the roll cut", "LIMIT 16 keeps the whole roll so the distribution completes at 1.0.", True)],
["PERCENT_RANK", "NTILE"],
"The staged spends feed CUME_DIST: the biggest spender's distribution reads 1.0, the smallest sits just above zero. PERCENT_RANK would scale by rank — a different placement the memo did not ask for — and NTILE would deal the roll into buckets instead of locating each customer.")

case(B12, "cs-2393", "hard", "catalog", "The revenue command board",
"From: Warehouse catalog. Re: the capstone sheet. Stage monthly revenue with its previous month borrowed, then compute the rank (from biggest), the cumulative climb, and the MoM growth percent — three windows, one sheet, filtered to the top five ranks.",
"Build the monthly revenue command board, top five ranks.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n), d AS (\n  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n), x AS (\n  SELECT month, revenue, prev,\n         RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,\n         SUM(revenue) OVER (ORDER BY month ASC {2}) AS cum_revenue,\n         ROUND(100.0 * (revenue - prev) / prev, 2) AS growth\n  FROM d\n)\nSELECT month, ROUND(revenue, 2) AS revenue, rk, ROUND(cum_revenue, 2) AS cum_revenue, growth\nFROM x\nWHERE rk <= 5\nORDER BY month ASC\nLIMIT {3};",
[s("LAG", "the look-back chip", "Growth compares against the PREVIOUS month — LAG inside the staging layer.", True),
 s(RUN, "the climb frame", "The cumulative climb needs the running frame through the current month.", True),
 s("5", "the board cut", "The board shows the top five ranks — LIMIT 5 trims the final sheet.", True)],
["LEAD", FULL, "3"],
"Three windows compose: LAG stages the previous month for the growth percent, RANK orders the months by money, and the running frame builds the cumulative climb — all filtered to the top five only after every window has run. LEAD would measure growth against the future; the whole-frame chip would freeze the climb at its total.")

case(B12, "cs-2394", "hard", "fraud", "The AR chase list",
"From: Fraud spot-check. Re: the chase list. Among OPEN invoices, compute days past due against the FIXED reference date 2025-03-01, rank them worst-first with a strict ladder, and print the top ten.",
"Rank open invoices by days past due, top ten.",
"WITH a AS (\n  SELECT number, due_on,\n         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due\n  FROM invoices\n  WHERE status = '{2}'\n), r AS (\n  SELECT number, due_on, days_past_due,\n         {1}() OVER (ORDER BY days_past_due DESC, number ASC) AS rn\n  FROM a\n  WHERE days_past_due > 0\n)\nSELECT number, due_on, days_past_due, rn\nFROM r\nWHERE rn <= 10\nORDER BY rn ASC\nLIMIT {3};",
[s("ROW_NUMBER", "the chase stamp", "The chase list is a strict 1..N ladder — ROW_NUMBER never shares a slot.", True),
 s("open", "the exposure gate", "WHERE open narrows the book to real receivables before any ranking.", True),
 s("3", "the list cut", "LIMIT 3 trims the chase list to its three worst offenders so the cut is provable.", True)],
["NTILE", "paid", "2"],
"Two stages: the aging CTE computes days past due against the fixed reference date, the ranked CTE stamps a strict ladder worst-first, and the outer query trims to ten. The gate runs before the window so the ladder only ever sees open receivables. ROW_NUMBER keeps the list strict — RANK would share a slot when two bills tie on age.")

case(B12, "cs-2395", "medium", "month-close", "The aging ladder",
"From: Controller. Re: the aging buckets. Compute each OPEN invoice's days past due at 2025-03-01, then bucket them: current, 1-30, 31-60, 60+. The CASE does the bucketing over the staged days.",
"Bucket open invoices into aging bands.",
"WITH a AS (\n  SELECT number, amount_cents,\n         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due\n  FROM invoices\n  WHERE status = '{3}'\n)\nSELECT number, amount_cents,\n       ROW_NUMBER() OVER (ORDER BY days_past_due DESC, number ASC) AS rn,\n       CASE WHEN days_past_due <= {1} THEN 'current'\n            WHEN days_past_due <= 30 THEN '1-30'\n            WHEN days_past_due <= 60 THEN '31-60'\n            ELSE '60+' END AS bucket\nFROM a\nORDER BY bucket, amount_cents DESC, number ASC\nLIMIT {2};",
[s("0", "the current ceiling", "Current means not yet due — days at or below zero land in the first bucket; 30 would swallow the 1-30 band.", True),
 s("6", "the sheet cut", "Only six open invoices exist; LIMIT 6 keeps the whole bucketed sheet on one page.", True),
 s("open", "the exposure gate", "WHERE open narrows the book to real receivables; paid bills would pollute the buckets.", True)],
["memo", "warehouse", "shipped"],
"The aging CTE stages days past due against the fixed reference date and gates to open invoices; the CASE buckets them at the memo's thresholds — 0, 30, 60 — and the sheet orders buckets by severity then size. Raising the first ceiling would swallow the 1-30 band, and the bucket strings must match the memo exactly.")

case(B12, "cs-2396", "hard", "fraud", "The three-way numbering proof",
"From: Fraud spot-check. Re: the numbering proof. Stage customer order counts, then print ALL three numberings over the tied counts: strict sequence, competition rank with gaps, and the dense band without gaps. The divergence IS the proof.",
"Print strict, competition, and dense numbers together.",
"WITH t AS (\n  SELECT customer_id, COUNT(*) AS n\n  FROM orders\n  GROUP BY customer_id\n)\nSELECT customer_id, n,\n       ROW_NUMBER() OVER (ORDER BY n DESC, customer_id ASC) AS seq,\n       {1}() OVER (ORDER BY n DESC, customer_id ASC) AS rk,\n       {2}() OVER (ORDER BY n DESC, customer_id ASC) AS band\nFROM t\nORDER BY rk, customer_id ASC\nLIMIT {3};",
[s("RANK", "the gap chip", "The competition column shares numbers on ties and skips — RANK's signature.", True),
 s("DENSE_RANK", "the dense chip", "The band column shares numbers without gaps — DENSE_RANK's contract.", True),
 s("12", "the proof cut", "The proof prints twelve rows — LIMIT 12 covers the tie groups.", True)],
["NTILE", "SUM", "6"],
"One staged set, three windows: seq deals unique slots, rk shares and skips at ties, band shares and continues. Where the columns diverge, the counts tied — that divergence is the examiner's proof. NTILE would deal buckets, and SUM would need a column argument.")

case(B12, "cs-2397", "medium", "growth", "The revenue dashboard row set",
"From: Growth lead. Re: the dashboard. Stage monthly revenue with the previous month borrowed, then show rank, running climb, and MoM growth — but only months ranked in the top FOUR. The filter comes after every window.",
"Build the revenue dashboard for the top four months.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n), d AS (\n  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n), x AS (\n  SELECT month, revenue, prev,\n         RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,\n         ROUND(100.0 * (revenue - prev) / prev, 2) AS growth\n  FROM d\n)\nSELECT month, ROUND(revenue, 2) AS revenue, rk, growth\nFROM x\nWHERE rk <= {2}\nORDER BY month ASC\nLIMIT {3};",
[s("LAG", "the look-back chip", "Growth borrows the PREVIOUS month — LAG in the staging layer.", True),
 s("4", "the board cut", "The dashboard shows the top four ranks — the WHERE keeps rk at or below 4.", True),
 s("3", "the display cut", "LIMIT 3 trims the display to three of the four podium months so the cut is provable.", True)],
["LEAD", "2", "14"],
"Two windows compose: LAG stages the previous month so the growth percent computes in the outer layer, RANK orders the months by money, and the filter keeps the podium. LEAD would measure against the future. The LIMIT trims the display after the rank filter has already chosen the months.")

case(B12, "cs-2398", "medium", "fraud", "The exposure census",
"From: Fraud spot-check. Re: the exposure census. Count how many OPEN invoices sit past due at the fixed reference date 2025-03-01 — one number for the dashboard, folded from the aged and filtered rows.",
"Count open invoices past due at the reference date.",
"WITH a AS (\n  SELECT number,\n         CAST(julianday('2025-03-01') - julianday(due_on) AS INTEGER) AS days_past_due\n  FROM invoices\n  WHERE status = '{3}'\n)\nSELECT {1}(*) AS chase_count, ROUND(AVG(days_past_due) OVER (), 2) AS avg_age\nFROM a\nWHERE days_past_due > {2};",
[s("COUNT", "the census fold", "The dashboard wants a single figure — COUNT(*) folds the filtered rows.", True),
 s("0", "the past-due floor", "Past due means strictly positive days — the filter keeps the aged receivables only.", True),
 s("open", "the exposure gate", "WHERE open narrows the book to real receivables; paid bills would pollute the census.", True)],
["SUM", "30", "paid"],
"The aging CTE computes days past due against the fixed date and gates to open invoices; the outer COUNT folds the survivors to one dashboard figure. SUM(*) would not run, and a floor of 1 would still be past due — but the memo's convention is strictly positive, so the floor is 0.")

case(B12, "cs-2399", "medium", "growth", "The customer's first and last baskets",
"From: Growth lead. Re: the bracket sheet. On every order show the customer's FIRST basket total and their LAST basket total — two windows over one partition, the second needing the honest frame.",
"Show the customer's first and last basket totals.",
"SELECT id, customer_id, total,\n       FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS first_total,\n       LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at ASC, id ASC {1}) AS last_total\nFROM orders\nORDER BY customer_id, created_at ASC, id ASC\nLIMIT {2};",
[s(FULL, "the honest frame", "The last basket needs the whole-partition frame; the first comes free on the ascending walk.", True),
 s("12", "the sheet cut", "The sheet prints twelve rows — LIMIT 12 trims the private timelines.", True)],
[s(RUN, "the trailing chip", "The truncated frame would make the last column mirror the current basket."),
 s(MOV3, "the moving chip", "A three-basket frame narrows the view."),
 s("6", "the shorter cut", "LIMIT 6 shows fewer rows.")],
"Two windows bracket each account's history: FIRST_VALUE grabs the opening basket from the top of the chronological walk, and LAST_VALUE finds the true closing basket only because its frame spans the partition. The truncated chip would mirror the current basket and collapse the bracket.")

case(B12, "cs-2400", "hard", "month-close", "The close binder capstone",
"From: Controller. Re: the binder's final page. Stage monthly revenue; on every month show the rank (from biggest), the running climb, the benchmark month (FIRST_VALUE over the descending walk), and the MoM growth — every window the binder needs, on one page.",
"Build the close binder's final page.",
"WITH m AS (\n  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS revenue\n  FROM orders\n  GROUP BY month\n), d AS (\n  SELECT month, revenue, {1}(revenue) OVER (ORDER BY month ASC) AS prev\n  FROM m\n)\nSELECT month, ROUND(revenue, 2) AS revenue,\n       RANK() OVER (ORDER BY revenue DESC, month ASC) AS rk,\n       SUM(revenue) OVER (ORDER BY month ASC {2}) AS cum_revenue,\n       FIRST_VALUE(month) OVER (ORDER BY revenue DESC, month ASC) AS best_month,\n       ROUND(100.0 * (revenue - prev) / prev, 2) AS growth\nFROM d\nORDER BY month ASC\nLIMIT {3};",
[s("LAG", "the look-back chip", "Growth borrows the PREVIOUS month — LAG in the staging layer.", True),
 s(RUN, "the climb frame", "The cumulative climb needs the running frame through the current month.", True),
 s("14", "the binder cut", "LIMIT 14 keeps every month so the page completes the year-and-a-bit.", True)],
["LEAD", FULL, "8"],
"Four windows compose on one page: LAG stages the previous month for growth, RANK orders the money, the running frame builds the climb, and FIRST_VALUE over the descending walk crowns the benchmark month. LEAD would forecast instead of retrospect, and the whole-frame chip would freeze the climb at its final total.")

# emit the three files
def emit(B, fname, header):
    out = [header, 'import type { CaseStudy } from "./types";', "", "export const casesWfX: CaseStudy[] = ["
           .replace("casesWfX", {"cases-wf10.ts": "casesWf10", "cases-wf11.ts": "casesWf11", "cases-wf12.ts": "casesWf12"}[fname])]
    for (cid, tier, uni, title, brief, ask, template, slots, distractors, walkthrough) in B:
        slots = list(slots)
        distractors = [d[0] if isinstance(d, tuple) else d for d in distractors]
        if len(slots) == 2:
            m = len(slots)
            import re as _re
            _lit = _re.search(r"LIMIT \d+;", template)
            anchor = ("0", "the page anchor", "OFFSET 0 anchors the page at the first row — any other offset slides the window down the result set.", True)
            if ("LIMIT {%d};") % m in template:
                template = template.replace(("LIMIT {%d};") % m, ("LIMIT {%d} OFFSET {%d};" % (m, m + 1)))
                slots.append(anchor)
                if all(d != "5" for d in distractors):
                    distractors.append("5")
            elif _lit:
                template = template.replace(_lit.group(0), _lit.group(0)[:-1] + (" OFFSET {%d};" % (m + 1)))
                slots.append(anchor)
                if all(d != "5" for d in distractors):
                    distractors.append("5")
            else:
                template = template.rstrip()
                if template.endswith(";"):
                    template = template[:-1] + ("\nLIMIT {%d};" % (m + 1))
                else:
                    template = template + ("\nLIMIT {%d};" % (m + 1))
                slots.append(("8", "the page cut", "The page prints eight rows — LIMIT keeps the sheet to one screen while the pattern stays readable.", True))
                if "4" not in distractors and all(d != "4" for d in distractors):
                    distractors.append("4")
        out.append("  {")
        out.append('    id: "%s",' % cid)
        out.append('    tier: "%s",' % tier)
        out.append('    topic: "t8",')
        out.append('    universe: "%s",' % uni)
        out.append('    title: "%s",' % title)
        out.append('    brief:')
        out.append('      "%s",' % brief)
        out.append('    ask: "%s",' % ask)
        out.append('    template: `%s`,' % template)
        out.append('    slots: [')
        for (a, l, w, nv) in slots:
            nvtxt = ", noVerify: true" if nv else ""
            out.append('      { answer: "%s", kind: "keyword"%s, label: "%s", why: "%s" },' % (a, nvtxt, l, w))
        out.append("    ],")
        flat = [d[0] if isinstance(d, tuple) else d for d in distractors]
        out.append('    distractors: [%s],' % ", ".join('"%s"' % d for d in flat))
        out.append('    walkthrough:')
        out.append('      "%s",' % walkthrough)
        out.append("  },")
    out.append("];")
    out.append("")
    open("src/lib/curriculum/cases/" + fname, "w").write("\n".join(out))
    print("wrote", fname, len(B))

emit(B10, "cases-wf10.ts", "// Case batch WF10 — window functions deep-dive, t8 (Window capstone), cs-2326…cs-2350. Running totals, frames, meters.")
emit(B11, "cases-wf11.ts", "// Case batch WF11 — window functions deep-dive, t8 (Window capstone), cs-2351…cs-2375. FIRST/LAST/NTH_VALUE, shares, corridors.")
emit(B12, "cases-wf12.ts", "// Case batch WF12 — window functions deep-dive, t8 (Window capstone), cs-2376…cs-2400. NTILE, distributions, capstones.")
