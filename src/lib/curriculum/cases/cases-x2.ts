// Case batch X2 — Module 6 (Expert Clinic) cases cs-1521…cs-1535, wave 1.
// One-pass FILTER (WHERE …) censuses. Figures from the W1 receipt pool
// (m6-cases-w1-facts*.ts). All cases audited by scripts/case-audit.ts (x-laws).
import type { CaseStudy } from "./types";

export const casesX2: CaseStudy[] = [
  {
    id: "cs-1521",
    tier: "easy",
    topic: "x2",
    universe: "growth",
    title: "The one-pass lane census",
    brief:
      "From: Growth lead. Re: the funnel header.\n\nThe dashboard header shows four numbers — total orders and the count in each of three lanes — and it must render from ONE query, not three round trips. Build the one-pass census over the order lanes.",
    ask: "What are the total order count and the shipped, cancelled and pending counts in one pass?",
    template: `SELECT COUNT(*) AS all_rows,
  COUNT(*) FILTER (WHERE status = {1}) AS shipped,
  COUNT(*) FILTER (WHERE status = {2}) AS cancelled,
  COUNT(*) FILTER (WHERE status = {3}) AS pending
FROM orders;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the first lane",
        why: "The shipped lane is the headline: 30 of 103 orders. FILTER (WHERE status = 'shipped') counts only those rows while the scan walks all of them — no second query needed.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the second lane",
        why: "Cancelled is the leak column: 7 orders. The FILTER pins that lane into its own column without hiding the rows the other columns still need.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the third lane",
        why: "Pending is the follow-up queue: 14 orders. One scan, three lane columns, and the 103-row total proves the lanes only tell part of the story — delivered is the 52 the header omits.",
      },
    ],
    distractors: ["'paid'", "'delivered'", "'CARD'"],
    walkthrough:
      "Before FILTER, this header took four queries or a mess of CASE sums. FILTER (WHERE …) attaches a condition to a single aggregate: COUNT(*) counts every row the aggregate sees, the FILTER narrows just that one aggregate, and the scan happens once. The result: 103 total, 30 shipped, 7 cancelled, 14 pending — and the arithmetic itself is the audit, because the omitted delivered lane is 103 minus 89. Type 'paid' into a lane and the column drops to 0 — invoices vocabulary leaking into the orders table. One pass, four numbers, zero round trips: that is the census pattern the whole dashboard is built on.",
  },
  {
    id: "cs-1522",
    tier: "easy",
    topic: "x2",
    universe: "month-close",
    title: "The stamped-lane census",
    brief:
      "From: Finance ops. Re: the shipping backlog stat.\n\nThe close pack reports three facts about orders in one line: how many never shipped, how many carry a shipping timestamp, and the revenue on the stamped lane. Build the one-pass census on the shipping timestamp.",
    ask: "How many orders never shipped, how many are stamped, and what revenue sits on the stamped lane?",
    template: `SELECT COUNT(*) FILTER (WHERE shipped_at IS {1}) AS never,
  COUNT(*) FILTER (WHERE shipped_at IS {2} NULL) AS stamped,
  {3}(total) FILTER (WHERE shipped_at IS NOT NULL) AS stamped_rev
FROM orders;`,
    slots: [
      {
        answer: "NULL",
        kind: "keyword",
        label: "the unstamped test",
        why: "shipped_at IS NULL finds the 21 orders that never left the warehouse. IS NOT here would be a syntax error — the NULL test needs its own word.",
      },
      {
        answer: "NOT",
        kind: "keyword",
        label: "the negation word",
        why: "IS NOT NULL is the stamped lane — 82 orders with a shipping timestamp. The word sits between IS and NULL, which is why the template splits the phrase across two slots.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stamped revenue",
        why: "SUM(total) on the stamped lane adds 27,567.79 of revenue — the orders that actually left. AVG would return the 336-ish average and the pack would print a price where a total belongs.",
      },
    ],
    distractors: ["NOT", "NULL", "AVG"],
    walkthrough:
      "One scan, three aggregates, each with its own FILTER. The first counts shipped_at IS NULL — 21 orders that never shipped. The second counts IS NOT NULL — 82 stamped orders, and 21 plus 82 is 103, so the census self-audits. The third rides the stamped lane and sums its revenue: 27,567.79, versus 7,265.49 sitting on the never-shipped side. The NULL test is the quiet lesson: you cannot write shipped_at = NULL — equality against NULL is never true — so the lane test must be IS (NOT) NULL, spelled word by word. The stamp split also reconciles the pack: stamped revenue plus unstamped revenue is the store total, to the cent.",
  },
  {
    id: "cs-1523",
    tier: "easy",
    topic: "x2",
    universe: "month-close",
    title: "The invoice two-census",
    brief:
      "From: Billing ops. Re: the AR snapshot.\n\nThe accounts-receivable snapshot is one row: paid invoice count, open invoice count, and the open balance in dollars. Build it in one pass over the invoice book so the snapshot never disagrees with itself.",
    ask: "How many invoices are paid, how many are open, and what is the open balance?",
    template: `SELECT COUNT(*) FILTER (WHERE status = {1}) AS paid_n,
  COUNT(*) FILTER (WHERE status = {2}) AS open_n,
  {3}(amount_cents) FILTER (WHERE status = 'open') / 100.0 AS open_amt
FROM invoices;`,
    slots: [
      {
        answer: "'paid'",
        kind: "keyword",
        label: "the settled lane",
        why: "The paid lane holds 21 of 28 invoices — the book is mostly collected. 'void' would count the single reversed invoice and the snapshot would understate collections.",
      },
      {
        answer: "'open'",
        kind: "keyword",
        label: "the outstanding lane",
        why: "Six invoices are open, and that count is the collections queue. 'closed' is not a status in this book — the column would zero out and dunning would stop.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the balance aggregator",
        why: "SUM(amount_cents) on the open lane, divided by 100, is the open balance: 19,609.00. AVG would print one invoice's average — about 3,268 — and the AR figure would be nonsense.",
      },
    ],
    distractors: ["'void'", "'closed'", "AVG"],
    walkthrough:
      "FILTER gives the snapshot its one-pass shape: three aggregates over one scan, each scoped by a lane condition. Paid: 21 invoices. Open: 6. Open balance: SUM of the open lane's cents divided by 100 — 19,609.00, the number collections chases. The integer-cents-to-dollars divide is the house convention: amounts are stored in cents to dodge floating-point drift, and only the presentation layer divides. Swap the aggregator for AVG and the balance column reports the mean open invoice instead of the queue total — a plausible-looking number that is wrong by a factor of six. One row, three cells, one truth: that is what the snapshot buys.",
  },
  {
    id: "cs-1524",
    tier: "medium",
    topic: "x2",
    universe: "growth",
    title: "The half-year revenue split",
    brief:
      "From: Growth lead. Re: the H1-versus-H2 board stat.\n\nThe board slide splits 2024 revenue at the July boundary and adds a big-ticket count on top. Build the one-pass census: revenue before the cutoff, revenue from it onward, and orders of 300 dollars or more.",
    ask: "What revenue did each half of 2024 book, and how many orders hit 300 dollars or more?",
    template: `SELECT ROUND({3}(total) FILTER (WHERE created_at < {1}), 2) AS h1_rev,
  ROUND(SUM(total) FILTER (WHERE created_at >= '2024-07-01'), 2) AS h2_rev,
  COUNT(*) FILTER (WHERE total >= {2}) AS big_orders
FROM orders;`,
    slots: [
      {
        answer: "'2024-07-01'",
        kind: "keyword",
        label: "the half-year boundary",
        why: "July 1st splits the book: everything before it lands in H1 (17,385.34) while the hardcoded H2 arm sweeps from July 1 onward (17,447.94). Moving the line a month earlier silently re-brands June as second-half revenue.",
      },
      {
        answer: "300",
        kind: "number",
        label: "the big-ticket line",
        why: "49 orders sit at or above 300 dollars — the big-ticket cohort the slide badges. 500 would thin the count and understate the premium business; 100 would count nearly the whole book.",
        noVerify: true,
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the revenue aggregator",
        why: "Revenue halves are sums of order totals — SUM on each side of the boundary. AVG would print per-order averages (about 300) and the board slide would show a price, not a book.",
      },
    ],
    distractors: ["AVG", "COUNT", "'2024-06-01'", "'2025-01-01'", "500", "100"],
    walkthrough:
      "The census answers the board's question in one scan. The boundary — July 1st, 2024 — appears in both FILTER clauses because the halves must mirror each other exactly: H1 books 17,385.34, H2 books 17,447.94, and the two columns sum to the 34,833.28 store total, which is the slide's own proof of completeness. The third aggregate ignores dates and counts the premium cohort: 49 orders at 300 dollars or more. Shift the boundary to June 1st and June's 2,047.43 migrates into H1 — the halves no longer reconcile and the board deck quietly lies. The noVerify slots are thresholds and literals, not figures: they shape the census but never appear in its cells.",
  },
  {
    id: "cs-1525",
    tier: "medium",
    topic: "x2",
    universe: "month-close",
    title: "The regional open-invoice count",
    brief:
      "From: Billing ops. Re: the regional collections map.\n\nThe collections map shows, per region, how many invoices are open and how much the region was invoiced in total. Build the one-pass census with the open-lane filter and total invoiced amount per region, richest region first.",
    ask: "How many open invoices does each region carry, and what was each region invoiced in total?",
    template: `SELECT c.region, COUNT(*) FILTER (WHERE i.status = {1}) AS open_n,
  ROUND({2}(i.amount_cents) / 100.0, 2) AS invoiced_amt
FROM invoices i JOIN customers c ON c.id = i.customer_id
GROUP BY c.region ORDER BY invoiced_amt {3};`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the outstanding lane",
        why: "FILTER counts the open lane per region: EU carries 5, US 1, APAC none. 'paid' would map the settled lane instead and collections would knock on doors that already paid.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the amount aggregator",
        why: "SUM over each region's invoices, divided to dollars, is the invoiced volume: EU 47,933.00, APAC 22,369.00, US 16,675.00. AVG would print per-invoice averages and the map would rank wrongly.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the map order",
        why: "Richest region first is the map read — EU on top at 47,933.00. Ascending would lead with US's 16,675.00 and the collections team would work the smallest queue first.",
      },
    ],
    distractors: ["'paid'", "AVG", "ASC"],
    walkthrough:
      "The census mixes a filtered count with an unfiltered sum — that asymmetry is the point. FILTER (WHERE i.status = 'open') counts each region's outstanding invoices without hiding rows from the SUM, which totals every invoice the region was issued: EU 47,933.00 across 14 invoices (5 of them open), APAC 22,369.00 across 8 (none open), US 16,675.00 across 6 (1 open). The map sorts on the amount descending, so EU leads both in volume and in collections workload — five open invoices is the entire queue's bulk. APAC is the quiet anomaly: fully paid, nothing outstanding, which is exactly the kind of fact a per-lane census surfaces that a GROUP BY status pivot would bury.",
  },
  {
    id: "cs-1526",
    tier: "medium",
    topic: "x2",
    universe: "month-close",
    title: "The quarterly rail census",
    brief:
      "From: Finance. Re: the payment-rails deck.\n\nThe treasury deck buckets payments into quarters and shows, per quarter, the payment count plus the card-lane amount. Build the one-pass census: quarter number, count, and the card-filtered total per bucket.",
    ask: "How many payments landed in each quarter, and how much went through the card rail?",
    template: `SELECT (CAST(strftime('%m', paid_on) AS INT) + 2) / {1} AS qtr,
  {3}(*) AS n,
  ROUND(SUM(amount_cents) FILTER (WHERE method = {2}) / 100.0, 2) AS card_amt
FROM payments GROUP BY qtr ORDER BY qtr;`,
    slots: [
      {
        answer: "3",
        kind: "number",
        label: "the quarter divisor",
        why: "Month plus 2 divided by 3 maps months to quarters — 3 is the divisor that makes Q1 out of months 1–3. Divide by 2 and the deck shows half-years; by 4 and Q1 leaks into quarter 0.",
      },
      {
        answer: "'card'",
        kind: "keyword",
        label: "the rail filter",
        why: "The card rail is the filtered lane: 11,296.50 in Q1, 6,567.00 in Q2, 11,721.50 in Q3, 7,779.00 in Q4. 'wire' would show the other rail and the deck's card slide would vanish.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the bucket counter",
        why: "Each quarter's payment count — 9, 5, 8, 5 — rides beside the card amount so the deck can compare volume against value. AVG would print fractional counts no deck can show.",
      },
    ],
    distractors: ["2", "4", "'wire'", "AVG"],
    walkthrough:
      "The quarter key is integer arithmetic: month number plus 2, divided by 3, truncated — January's 3 becomes quarter 1, December's 12 becomes quarter 4. GROUP BY qtr buckets the 27 payments into 9, 5, 8, 5. The FILTER clause scopes one aggregate to the card rail — 11,296.50, 6,567.00, 11,721.50, 7,779.00 across the year — while the count stays unfiltered so both rails' volume shows. Q3 is the deck's story: eight payments and the heaviest card quarter at 11,721.50. Change the divisor to 2 and the deck becomes a half-year report with quarters 5 and 6 in it — the arithmetic is the whole bucketing, and the bucketing is the deck.",
  },
  {
    id: "cs-1527",
    tier: "medium",
    topic: "x2",
    universe: "funnel",
    title: "The big-order member census",
    brief:
      "From: Growth lead. Re: the premium-buyer shortlist.\n\nThe shortlist ranks members by how many of their orders hit the 300-dollar premium line, deepest basket first. Build the one-pass census: total orders per member, premium orders per member, the eight deepest baskets first.",
    ask: "Which eight members carry the most premium orders, and how many orders do they place overall?",
    template: `SELECT c.name, COUNT(*) AS orders,
  COUNT(*) FILTER (WHERE o.total >= {1}) AS big_orders
FROM customers c JOIN orders o ON o.customer_id = c.id
GROUP BY c.id ORDER BY big_orders {2}, orders DESC, c.name LIMIT {3};`,
    slots: [
      {
        answer: "300",
        kind: "number",
        label: "the premium line",
        why: "The premium line is 300 dollars: Emma clears it 9 times from 17 orders, Alice 8 times from 24. At 200 the counts swell — Alice jumps to 12 — and the shortlist stops being premium.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the shortlist order",
        why: "Deepest basket first is the shortlist's spine — Emma leads with 9. Ascending would open on members with one premium order and the sales team would call the wrong people.",
      },
      {
        answer: "8",
        kind: "number",
        label: "the shortlist length",
        why: "Eight rows is the shortlist cut: Emma, Alice, Grace, Maya, Chloe, Pedro, Keiko, Farid. At 5 the last three premium buyers vanish; the 300 figure itself never appears in cells, so the audit skips it.",
        noVerify: true,
      },
    ],
    distractors: ["200", "ASC", "5"],
    walkthrough:
      "One join, one scan, two counts per member: the census compares volume against quality. COUNT(*) is every order — Alice leads the raw table with 24 — while the FILTERed count isolates the premium lane at 300 dollars and up, where Emma's 9 beats Alice's 8. The ORDER BY ranks on the filtered column first, then volume, then name as tiebreak, and LIMIT 8 cuts the shortlist: Emma Wilson 9/17, Alice Chen 8/24, Grace Kim 7/14, Maya Patel 6/13, Chloe Dubois 4/5, Pedro Alvarez 3/4, Keiko Sato 2/4, Farid Nasser 2/3. Lower the line to 200 and Alice retakes the lead at 12 — the whole ranking bends around the threshold, which is why the premium line is a business decision, not a query constant.",
  },
  {
    id: "cs-1528",
    tier: "easy",
    topic: "x2",
    universe: "month-close",
    title: "The lane average trio",
    brief:
      "From: Finance ops. Re: the pricing sanity check.\n\nThe pack closes with three averages: the shipped lane's, the cancelled lane's, and the whole book's. Build the one-pass census so the three averages come from a single scan and can never disagree.",
    ask: "What is the average order value on the shipped lane, the cancelled lane, and overall?",
    template: `SELECT ROUND(AVG(total) FILTER (WHERE status = {1}), 2) AS shipped_avg,
  ROUND(AVG(total) FILTER (WHERE status = {2}), 2) AS cancelled_avg,
  ROUND({3}(total), 2) AS all_avg
FROM orders;`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the shipped lane",
        why: "The shipped lane averages 399.89 — the orders that completed. 'pending' would average 436.64, the queue's value, and the sanity check would compare apples to a queue.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the cancelled lane",
        why: "Cancelled orders average 164.64 — barely half the book's average, which is the finding: cheap orders get abandoned. 'delivered' would average 299.44 and bury the insight.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the book average",
        why: "The unfiltered AVG is the baseline: 338.19 across all 103 orders. SUM would print 34,833.28 — the revenue — and the reader would compare an average to a total.",
      },
    ],
    distractors: ["'pending'", "'delivered'", "SUM"],
    walkthrough:
      "Three averages, one scan, zero disagreement — that is the FILTER promise. The shipped lane averages 399.89, the cancelled lane 164.64, and the whole book 338.19. The gap is the story: cancelled orders are worth less than half a shipped one, so the checkout problem is concentrated in the cheap tail — nobody abandons a 400-dollar cart at this rate. The third column stays unfiltered deliberately: it is the baseline the other two are read against, and the trio only makes sense computed together. Swap the final aggregate for SUM and the cell prints 34,833.28 — a revenue figure masquerading as an average, and the pack's most common copy-paste bug.",
  },
  {
    id: "cs-1529",
    tier: "hard",
    topic: "x2",
    universe: "expense",
    title: "The expense band census",
    brief:
      "From: Operations. Re: the spend-band audit.\n\nThe spend audit bands every expense in one pass: big spends of 100,000 cents and up, mid-band spends from 20,000 up to but excluding 100,000, and small spends under 20,000. Build the three-band census so the audit totals to the file count.",
    ask: "How many expenses are big, mid-band, and small in the one-pass band census?",
    template: `WITH b(low, high) AS (VALUES ({1}, {2}))
SELECT {3}(*) FILTER (WHERE e.amount_cents >= b.high) AS big,
  COUNT(*) FILTER (WHERE e.amount_cents BETWEEN b.low AND b.high - 1) AS mid,
  COUNT(*) FILTER (WHERE e.amount_cents < b.low) AS small
FROM expenses e, b;`,
    slots: [
      {
        answer: "20000",
        kind: "number",
        label: "the mid-band floor",
        why: "20,000 cents is where the mid band opens: BETWEEN 20000 AND 99999 catches 21 expenses. At 50,000 the band empties — every mid spend sits under 30,000 — and the census loses a third of the file.",
        noVerify: true,
      },
      {
        answer: "100000",
        kind: "number",
        label: "the big-band floor",
        why: "100,000 cents — a thousand dollars — opens the big band: 15 expenses, with the small band reading whatever falls under 20,000 (zero, honestly). At 150,000 the big band thins to one.",
        noVerify: true,
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the band counter",
        why: "Each band is a count — 15 big, 21 mid, 0 small — and the three must tile the 36-expense file with no gaps or overlaps. AVG would print 1s and the tiling proof would vanish.",
      },
    ],
    distractors: ["30000", "150000", "300000", "AVG", "TOTAL"],
    walkthrough:
      "Band censuses live or die on tiling: the three FILTER conditions must cover every row exactly once. Big: amount at or above 100,000 cents — 15 expenses, including one at 300,000-plus that anchors the band. Mid: BETWEEN 20,000 AND 99,999 — 21 expenses, every one of them under 30,000 as it happens. Small: under 20,000 — zero, the honest empty band. The three counts sum to 36, the file's size, and that arithmetic is the audit: shift any bound and the sum breaks. The near-misses are the lesson — a 50,000 mid floor empties the band (nothing sits between 50k and 100k), and a 29,999 ceiling silently drops eleven expenses. Bands are business rules; the census is their proof.",
  },
  {
    id: "cs-1530",
    tier: "hard",
    topic: "x2",
    universe: "growth",
    title: "The big-month census",
    brief:
      "From: Growth lead. Re: the calendar coverage stat.\n\nThe coverage stat asks: of the months we traded in, how many saw an order of 250 dollars or more? Build the one-pass census with the month bucketer — distinct big months versus distinct months overall.",
    ask: "How many distinct months saw a 250-dollar-plus order, and how many months saw any order?",
    template: `SELECT COUNT({1} strftime({2}, created_at)) FILTER (WHERE total >= {3}) AS big_months,
  COUNT(DISTINCT strftime('%Y-%m', created_at)) AS all_months
FROM orders;`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedup guard",
        why: "Months repeat across orders — the census counts months, not orders. DISTINCT collapses 103 order-events into 14 calendar buckets on the unfiltered side; ALL would print 103 months that do not exist.",
      },
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month bucketer",
        why: "'%Y-%m' stamps each order with its calendar month — 2024-01 through 2025-02, fourteen buckets. '%Y' would bucket into two years and the coverage stat would read 2 of 2.",
      },
      {
        answer: "250",
        kind: "number",
        label: "the big-order line",
        why: "The big-order line is 250 dollars: at that height every month qualifies, so big_months is 14 of 14 — full coverage. At 400 the count drops to 13 and the stat gains a story about the one thin month.",
        noVerify: true,
      },
    ],
    distractors: ["ALL", "'%Y'", "'%d'", "400"],
    walkthrough:
      "The census counts buckets, not rows — and the FILTER clause rides on a COUNT of bucketed values, which is the shape's whole trick. COUNT(DISTINCT strftime('%Y-%m', …)) with no filter is 14: every month from 2024-01 to 2025-02 saw trade. Add FILTER (WHERE total >= 250) and the same counter asks which months saw a big order — all fourteen, full coverage. Push the line to 400 and one month drops out: 13 of 14, and the growth team has a follow-up meeting. The '%Y' bucket would flatten the calendar to two years and '%d' would shatter it into days — the format string is the census's unit of account, and DISTINCT is what makes a bucket count honest.",
  },
  {
    id: "cs-1531",
    tier: "easy",
    topic: "x2",
    universe: "month-close",
    title: "The regional invoice grid",
    brief:
      "From: Billing ops. Re: the regional lane grid.\n\nThe AR grid shows one row per region with three lane counts: paid, open, and void invoices. Build the one-pass census so the grid renders from a single scan over the invoice book joined to its customers.",
    ask: "How many paid, open and void invoices does each region carry?",
    template: `SELECT c.region,
  {3}(*) FILTER (WHERE i.status = 'paid') AS paid_n,
  COUNT(*) FILTER (WHERE i.status = {1}) AS open_n,
  COUNT(*) FILTER (WHERE i.status = {2}) AS void_n
FROM invoices i JOIN customers c ON c.id = i.customer_id
GROUP BY c.region ORDER BY c.region;`,
    slots: [
      {
        answer: "'open'",
        kind: "keyword",
        label: "the outstanding lane",
        why: "Open invoices are the collections queue: EU carries 5, US 1, APAC none. 'pending' is order vocabulary — in the invoice book it matches nothing and the column would zero out.",
      },
      {
        answer: "'void'",
        kind: "keyword",
        label: "the reversed lane",
        why: "Void is the reversed-billing lane: exactly one invoice, sitting in EU. 'refunded' is not a status in this book — the column would silently read zero and the audit trail would lose its one flag.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the grid counter",
        why: "Every lane cell is a count — 8/5/1 for EU, 8/0/0 for APAC, 5/1/0 for US. AVG would print 1s down the grid and the AR picture would vanish into arithmetic noise.",
      },
    ],
    distractors: ["'pending'", "'refunded'", "AVG"],
    walkthrough:
      "One scan, one join, three FILTERed counts per region — the grid is the census pattern with lanes as columns. APAC: 8 paid, 0 open, 0 void — the fully collected region. EU: 8 paid, 5 open, 1 void — the workload and the audit flag in one row. US: 5 paid, 1 open, 0 void. LATAM is absent entirely: Bruno has no invoices, and an inner join drops him — the grid reports on invoiced regions only. The unfiltered COUNT in the first lane proves the pattern: same scan, different conditions, no cross-query drift. 'pending' and 'refunded' look plausible precisely because they belong to neighbouring tables — the grid is where order and invoice vocabulary go to get separated.",
  },
  {
    id: "cs-1532",
    tier: "medium",
    topic: "x2",
    universe: "expense",
    title: "The big-spend month ranking",
    brief:
      "From: Operations. Re: the spend calendar.\n\nThe spend calendar ranks months by how many big expenses — 100,000 cents and up — they absorbed, heaviest first. Build the one-pass census: month, total expenses, big-expense count, top six months only.",
    ask: "Which six months absorbed the most big expenses, and how many expenses did each month log?",
    template: `SELECT strftime('%Y-%m', spent_on) AS m, COUNT(*) AS n,
  COUNT(*) FILTER (WHERE amount_cents >= {1}) AS big
FROM expenses GROUP BY m ORDER BY big {2}, m LIMIT {3};`,
    slots: [
      {
        answer: "100000",
        kind: "number",
        label: "the big-spend line",
        why: "100,000 cents — a thousand dollars — defines the big lane: 15 expenses across the file, with August absorbing 2 of them. 20,000 would flood the lane with the mid band and the ranking would flatten.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the calendar order",
        why: "Heaviest first is the calendar's read: 2024-08 with 2 big spends leads, then the big-1 months in calendar order. Ascending would open on the quiet months and bury August's story.",
      },
      {
        answer: "6",
        kind: "number",
        label: "the calendar cut",
        why: "Six rows is the calendar cut: August plus the first five big-1 months. 3 would hide three of the tied months; the 100000 threshold never appears in cells, so the audit skips it.",
        noVerify: true,
      },
    ],
    distractors: ["20000", "ASC", "3"],
    walkthrough:
      "The census buckets 36 expenses into fourteen months, counts each bucket twice — once for volume, once through the FILTER for the big lane at 100,000 cents and up — and ranks on the filtered column with the month as tiebreak. The top six: 2024-08 with 3 expenses and 2 big; then 2024-01, 2024-02, 2024-03, 2024-04, 2024-05 with one big spend each. August is the calendar's headline — it absorbed two thousand-dollar-plus hits in a single month, which is where the deep-dive starts. Lower the line to 20,000 and every month carries 2 or 3 'big' spends — the lane loses its meaning and the ranking loses its point. Threshold, lane, cut: the three decisions that make a spend calendar.",
  },
  {
    id: "cs-1533",
    tier: "hard",
    topic: "x2",
    universe: "growth",
    title: "The member band census",
    brief:
      "From: Growth lead. Re: the reach stat.\n\nThe reach stat counts members, not orders: how many members have a 200-dollar-plus order, how many never place an order over 50, and how many ordered at all. Stage a one-row-per-member census, then count the lanes in one pass.",
    ask: "How many members have a 200-plus order, how many never top 50, and how many ordered at all?",
    template: `SELECT COUNT(*) FILTER (WHERE top >= {1}) AS big_spenders,
  COUNT(*) FILTER (WHERE top < {2}) AS snackers,
  {3}(*) AS all_members
FROM (SELECT customer_id, MAX(total) AS top FROM orders GROUP BY customer_id);`,
    slots: [
      {
        answer: "200",
        kind: "number",
        label: "the big-member line",
        why: "A member qualifies when their biggest single order clears 200 dollars — all 16 do, so reach is a perfect score. 1,000 would empty the lane and the stat would lose its headline.",
        noVerify: true,
      },
      {
        answer: "50",
        kind: "number",
        label: "the snacker line",
        why: "Members whose biggest basket never reaches 50 form the snacker lane — and it reads zero: the smallest maximum in the book is 397.99. 400 would catch one member and 500 would catch six, both real cohorts.",
        noVerify: true,
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the reach counter",
        why: "Reach counts members, so each lane is a COUNT over the one-row-per-member census. TOTAL would sum biggest orders and print a dollar figure where a headcount belongs.",
      },
    ],
    distractors: ["TOTAL", "SUM", "1000", "500", "400"],
    walkthrough:
      "The census stages the member ledger first: the derived table collapses 103 orders to one row per member carrying their biggest basket — the smallest maximum in the book is 397.99, the largest 1,088.44. From there the lanes are FILTERed counts: big spenders — top order at or above 200 — is 16 of 16, a perfect reach score; snackers — biggest basket under 50 — is an honest zero, because even the quietest member's best order clears four hundred dollars; all members is 16, the join-back that proves the lanes partition the base. The near-misses teach the line's weight: at 500 the big lane still holds ten members, at 1,000 it holds exactly one, and at 400 the snacker lane suddenly catches its first member. Reach stats are thresholds wearing a count's clothing — and staging the per-member census first is what keeps the lanes honest.",
  },
  {
    id: "cs-1534",
    tier: "hard",
    topic: "x2",
    universe: "funnel",
    title: "The busy-month gate",
    brief:
      "From: Growth lead. Re: the volume floor review.\n\nThe volume review lists only the months that logged at least eight orders, and for each survivor shows how many of those orders cleared 200 dollars. Build the month census with the volume gate and the big-order lane.",
    ask: "Which months logged eight or more orders, and how many of each month's orders cleared 200 dollars?",
    template: `SELECT strftime({1}, created_at) AS m,
  COUNT(*) FILTER (WHERE total >= {2}) AS big,
  COUNT(*) AS all_rows
FROM orders GROUP BY m HAVING COUNT(*) >= {3} ORDER BY m;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month bucketer",
        why: "'%Y-%m' is the calendar unit — 2024-01 through 2025-02, one bucket per month. '%Y' would bucket into years, the gate would compare 90 to 8, and the review would list 2024 and nothing else.",
      },
      {
        answer: "200",
        kind: "number",
        label: "the big-order line",
        why: "The big lane is 200 dollars and up — the volume review tracks quality alongside quantity. 400 would thin the lane and the review would understate how much of the volume was premium.",
        noVerify: true,
      },
      {
        answer: "8",
        kind: "number",
        label: "the volume gate",
        why: "Eight orders is the busy-month floor: six months clear it — 2024-01, 02, 03, 05, 07, 09 — and the figure appears in the all_rows cells so the audit can see it. At 9 two months drop; at 6 two more join.",
      },
    ],
    distractors: ["'%Y'", "400", "6", "9"],
    walkthrough:
      "The gate is the shape's spine: GROUP BY month buckets the 103 orders, HAVING COUNT(*) >= 8 keeps only the busy six — 2024-01 with 8, 2024-02 with 9, 2024-03 with 8, 2024-05 with 8, 2024-07 with 8, 2024-09 with 9 — and the surviving rows carry two counts: total orders and, through FILTER, the 200-plus lane. The gate value itself is verifiable because the all_rows column projects it: every surviving month shows its 8 or 9. '2024-02' is the standout — nine orders, the busiest bucket in the book. The '%Y' bucket error is the classic: one giant row labelled 2024 with 90 orders, gate passed, review meaningless. Bucket, gate, lane: the review's three decisions, each a slot.",
  },
  {
    id: "cs-1535",
    tier: "medium",
    topic: "x2",
    universe: "month-close",
    title: "The regional lane census",
    brief:
      "From: Operations. Re: the fulfilment map.\n\nThe fulfilment map shows each region's order volume split by lane: shipped, cancelled, and total. Build the one-pass census over orders joined to customers, heaviest region first, so the map ranks by workload.",
    ask: "How many shipped and cancelled orders does each region carry, and what is each region's total volume?",
    template: `SELECT c.region,
  COUNT(*) FILTER (WHERE o.status = {1}) AS shipped,
  COUNT(*) FILTER (WHERE o.status = {2}) AS cancelled,
  COUNT(*) AS all_rows
FROM orders o JOIN customers c ON c.id = o.customer_id
GROUP BY c.region ORDER BY all_rows {3};`,
    slots: [
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the fulfilled lane",
        why: "The shipped lane is fulfilment's success column: EU 12, US 10, APAC 8, LATAM 0. 'delivered' would count the 52-order lane instead — a different truth from a neighbouring status.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the leak lane",
        why: "Cancelled is the leak column: APAC 3, EU 3, US 1, LATAM 0. 'pending' would show the follow-up queue — 14 orders — and the map would flag patience as failure.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the workload order",
        why: "Heaviest region first is the map's read: EU 45 orders on top, then APAC 37, US 19, LATAM 2. Ascending would lead with LATAM's two orders and the ops team would staff backwards.",
      },
    ],
    distractors: ["'delivered'", "'pending'", "ASC"],
    walkthrough:
      "One join, one scan, three columns per region — the fulfilment map is the lane census wearing an ops hat. EU: 12 shipped, 3 cancelled, 45 total — the volume leader. APAC: 8 shipped, 3 cancelled, 37 total — nearly EU's volume with a matching leak. US: 10 shipped, 1 cancelled, 19 total — the cleanest leak rate in the book. LATAM: 0 shipped, 0 cancelled, 2 total — Bruno's two orders are both pending, so every lane column reads zero while the total proves he exists. That contrast is the census's gift: lanes can be empty while the row is not, and only the unfiltered COUNT tells the whole story. Sort it heaviest first and the map doubles as a staffing plan.",
  },
];
