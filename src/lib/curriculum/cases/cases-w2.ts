// M5 case wave w2 — Date buckets (lesson 30): strftime slicing, DATE truncation
// and modifier chains, month/quarter/year bucketing, calendar edges, JULIANDAY
// arithmetic. Every figure traces to scripts/m5-facts-w2.out, m5-facts-r2.out,
// m5-facts-r4.out, or the drill receipt blocks in date-buckets.ts/date-edges.ts.
import type { CaseStudy } from "./types";

export const casesW2: CaseStudy[] = [
  {
    id: "cs-1241",
    tier: "easy",
    topic: "w2",
    universe: "month-close",
    title: "The monthly order census",
    brief:
      "Month-end close: the controller opens every close packet with the same one-liner — how many orders did we book per calendar month? Last close the intern hand-counted and got January wrong, so the packet now has to be generated, not retyped. Rebuild the census query and pin it so it can only ever print the months that booked exactly 8 orders.",
    ask: "Generate the per-month order census and keep only the months with exactly 8 orders.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, {2} AS n\nFROM orders\nGROUP BY mon {3} n = {4}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' stamps each order with year AND zero-padded month — probed, it folds 103 orders into 14 buckets, 2024-01 through 2025-02. '%m' alone merges the two Januarys into one 14-order bucket." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the orders folded into each bucket — probed ladder 8/9/8/7/8/6/8/7/9/7/6/7/6/7. SUM(total) would print spend (2024-01 is 3731.97), not a count." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The pin applies to the folded count, so it must be HAVING — WHERE runs before GROUP BY when n doesn't exist yet. Probed: WHERE n = 8 is a syntax error on this shape." },
      { answer: "8", kind: "number", label: "the 8-order pin",
        why: "Probed: exactly four months booked 8 — 2024-01, 2024-03, 2024-05, 2024-07. The pin number must match the n column or the census contradicts the packet." },
    ],
    distractors: ["%m", "SUM(total)", "WHERE", "9"],
    walkthrough:
      "The close packet needs one row per calendar month, so the first move is the bucket key: strftime('%Y-%m', created_at) turns each of the 103 order timestamps into a '2024-01'-style label and GROUP BY folds them into 14 buckets counting 8/9/8/7/8/6/8/7/9/7/6/7/6/7. COUNT(*) is the honest counter; SUM(total) would emit January's 3731.97 of spend instead of its 8 orders. The pin is a group-level condition, so HAVING n = 8 keeps 2024-01, 2024-03, 2024-05 and 2024-07 — probed, swapping '%m' for '%Y-%m' merges the Januarys into a single 14-order bucket and HAVING n = 9 would hand the packet February and September instead.",
  },
  {
    id: "cs-1242",
    tier: "easy",
    topic: "w2",
    universe: "refund-audit",
    title: "Cancellations on the calendar",
    brief:
      "Refund audit kickoff: the disputes team wants to see when cancellations actually happened before they schedule the review calls. The CRM exports make it look like refunds cluster 'in January', which is exactly the kind of bucketing lie this audit exists to catch. Produce the month-by-month cancellation census from the orders table itself.",
    ask: "Count cancelled orders per calendar month, one row per month with its count.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, {2} AS n\nFROM orders\nWHERE status = '{3}'\nGROUP BY mon\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the year on each label — probed, the 7 cancellations spread over 5 distinct months (2024-01, 2024-03, 2024-07, 2024-11, 2025-01). '%m' alone would fuse 2024-01 and 2025-01 into one '01' bucket of 2." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) tallies the cancelled orders folded into each month — probed counts 1/1/2/2/1. SUM(total) would show lost revenue (206.19 in 2025-01), a different audit question." },
      { answer: "cancelled", kind: "keyword", label: "the status filter",
        why: "The census is cancellations only, so the filter literal is 'cancelled' — probed, that status holds 7 of the 103 orders; 'shipped' would sweep in 30 rows from a different population." },
    ],
    distractors: ["%m", "shipped", "SUM(total)"],
    walkthrough:
      "The disputes team is really asking 'when do we lose orders?', so the query filters to status = 'cancelled' first — probed, that's 7 of 103 orders — and then slices time. strftime('%Y-%m', created_at) builds the month key and GROUP BY folds the 7 rows into 5 buckets: 2024-01: 1, 2024-03: 1, 2024-07: 2, 2024-11: 2, 2025-01: 1. Using '%m' alone would print an '01' bucket of 2 that secretly fuses a 2024 cancellation (152.52) with the 2025 one (206.19) — the exact 'January cluster' mirage the audit warns about. COUNT(*) counts orders; SUM(total) counts dollars and would have answered a different memo.",
  },
  {
    id: "cs-1243",
    tier: "medium",
    topic: "w2",
    universe: "pricing",
    title: "The golden AOV months",
    brief:
      "Pricing review: leadership wants the two months with the richest average order value before we touch the price book, and the intern's draft kept ranking by revenue instead of basket size. The query also lost its sort direction and its row cap in a refactor. Restore it so the deck opens with the top two AOV months, richest first.",
    ask: "Rank months by average order value and keep the top two, highest AOV first.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, ROUND({2}(total), 2) AS aov\nFROM orders\nGROUP BY mon\nORDER BY aov {3}\nLIMIT {4};",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' is the honest month key — probed, it yields 14 buckets so 2024-01 (466.50) and 2025-01 stay separate. '%m' alone merges them and the merged top two become '10' 425.10 / '01' 385.82." },
      { answer: "AVG", kind: "keyword", label: "the basket averager",
        why: "Average order value needs AVG(total) — probed, 2024-01 averages 466.50 across its 8 orders. SUM(total) would rank by revenue and crown 2024-01's 3731.97, ignoring basket size entirely." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Richest first means DESC on the AOV column — probed ladder: 2024-01 466.50, 2024-10 425.10. ASC would surface the floor: 2024-07 at 149.23." },
      { answer: "2", kind: "number", noVerify: true, label: "the row cap",
        why: "The deck wants exactly two hero months, so LIMIT 2 — probed, that keeps 2024-01 466.50 and 2024-10 425.10 and drops 2024-02's 401.07 to third." },
    ],
    distractors: ["%m", "SUM", "ASC", "5"],
    walkthrough:
      "Basket size, not revenue, is the target, so the aggregate is AVG(total) over month buckets built by strftime('%Y-%m', created_at). Probed, the 14-bucket ladder runs 2024-01 466.50 (8 orders), 2024-10 425.10, 2024-02 401.07 … down to 2024-07's 149.23 on its 1193.86 month. ORDER BY aov DESC puts the gold on top and LIMIT 2 trims the list to the two heroes the deck quotes. The traps are all quiet ones: '%m' alone merges the Januarys and reshuffles the podium to '10' 425.10 / '01' 385.82, SUM ranks by 3731.97-sized revenue instead of basket size, and ASC answers 'worst months' — 2024-07 149.23, 2024-11 274.80 — with a perfectly executed query.",
  },
  {
    id: "cs-1244",
    tier: "easy",
    topic: "w2",
    universe: "inventory",
    title: "Slowest month to ship",
    brief:
      "Inventory count week: the warehouse lead suspects shipping slipped somewhere last year and wants the proof by month, not vibes. Ship dates are only stamped once an order actually leaves, so unshipped rows carry no lag at all. Build the per-month average shipping lag over shipped orders and keep the months that carried exactly 7 shipped orders.",
    ask: "Average the created-to-shipped lag per month for shipped orders; keep months with exactly 7.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, ROUND(AVG(julianday(shipped_at) - julianday(created_at)), 2) AS lag, COUNT(*) AS n\nFROM orders\nWHERE shipped_at IS NOT NULL\nGROUP BY mon {2} n = {3}\nORDER BY lag DESC;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' buckets by order month across both years — probed, the 82 shipped orders spread over 14 buckets. '%m' alone would fuse same-numbered months and smear the lag averages." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The 'exactly 7 shipped orders' pin filters folded groups, so HAVING — WHERE can't see n yet. Probed, the lag ladder is ordered by lag with n riding along: 3.71 on 7, 3.25 on 8, …" },
      { answer: "7", kind: "number", label: "the 7-shipped pin",
        why: "Probed: two months carried exactly 7 shipped orders — 2024-08 (lag 3.71, the slowest) and 2024-04 (3.14). The pin must match the n column in the result." },
    ],
    distractors: ["%m", "WHERE", "9", "8"],
    walkthrough:
      "JULIANDAY turns both timestamps into day numbers, so julianday(shipped_at) - julianday(created_at) is the shipping lag in days; averaged per month bucket it reads like a service-level chart. Probed: the storewide mean is 2.98 over 82 shipped rows (21 orders have shipped_at NULL and are rightly excluded), and the monthly ladder tops out at 2024-08 with 3.71 days on its 7 shipped orders, with 2024-04 next at 3.14. HAVING n = 7 keeps exactly those two months because the pin applies after folding — WHERE would be a syntax error against the alias. Loosen the pin to 8 and 2024-02 (3.25) plus 2024-05 (3.00) sneak in; push it to 9 and only 2024-09 (2.89) survives — different months, different story.",
  },
  {
    id: "cs-1245",
    tier: "easy",
    topic: "w2",
    universe: "funnel",
    title: "Signup cohorts, two at a time",
    brief:
      "Marketing funnel review: acquisition ran a steady two-accounts-per-month cadence for most of the store's life and the growth team wants that rhythm quantified from the customers table. Some months broke the pattern and they only care about the ones that hit quota. Count signups per cohort month and keep the months that added exactly 2 accounts.",
    ask: "Count customer signups per signup month; keep only the cohorts that added exactly 2.",
    template:
      "SELECT strftime('{1}', created_at) AS cohort, {2} AS signups\nFROM customers\nGROUP BY cohort {3} signups = 2\nORDER BY cohort;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' builds the cohort key — probed, 16 signups fold into 9 monthly buckets from 2023-11 to 2024-07. '%d' would cohort by day and every signup landed on its own day, so all counts become 1." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts accounts per cohort — probed census 2/2/2/2/2/2/2/1/1 across the 9 buckets. MIN(id) would print the smallest customer id in each cohort instead of a count." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The quota pin applies to the folded signups count, so HAVING — probed shape needs the filter after GROUP BY; WHERE signups = 2 is a syntax error because the alias doesn't exist pre-fold." },
    ],
    distractors: ["%d", "MIN(id)", "WHERE"],
    walkthrough:
      "Cohorting is bucketing: strftime('%Y-%m', created_at) labels each of the 16 customers with their signup month and GROUP BY folds them into 9 buckets — probed, 2023-11 through 2024-05 all added exactly 2 accounts, then the cadence broke with 1 in 2024-06 and 1 in 2024-07. COUNT(*) is the counter; the HAVING signups = 2 pin keeps the seven on-quota cohorts and drops the two broken months. The edge case is real: '%d' would cohort by signup day, and since all 16 signup dates are distinct every bucket would hold 1 and the pin would return nothing — a query that runs clean and reports a pipeline that never existed.",
  },
  {
    id: "cs-1246",
    tier: "medium",
    topic: "w2",
    universe: "supplier",
    title: "Nordic's three-order months",
    brief:
      "Supplier audit: Nordic Gadgets AB's contract has a capacity clause that triggers any month they fill more than a threshold of distinct orders, and procurement wants the months mapped before the renewal call. Order lines fan out across order_items, so a naive COUNT(*) counts line rows, not orders. Rebuild the monthly distinct-order census for Nordic and keep the months where it filled exactly 3.",
    ask: "Count Nordic Gadgets AB's distinct orders per month; keep the months with exactly 3.",
    template:
      "SELECT s.name, strftime('{1}', o.created_at) AS mon, COUNT(DISTINCT o.id) AS n\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.name = '{2}'\nGROUP BY mon {3} n = {4}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' buckets Nordic's order dates across both years — probed, 14 monthly buckets counting 3/3/3/4/4/2/1/2/2/2/2/4/3/3. '%m' alone would fuse the two years' months and distort the clause mapping." },
      { answer: "Nordic Gadgets AB", kind: "keyword", label: "the supplier filter",
        why: "The audit targets Nordic specifically — probed, 'Nordic Gadgets AB' matches supplier 1 with 38 distinct orders (43 line rows); 'Shenzhen Electro' is a different supplier with a different monthly shape." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The 'exactly 3 orders' clause applies to the folded per-month count, so HAVING — WHERE runs before the fold and can't see n. Probed shape: the pin keeps five months." },
      { answer: "3", kind: "number", label: "the 3-order pin",
        why: "Probed: Nordic filled exactly 3 distinct orders in 2024-01, 2024-02, 2024-03, 2025-01 and 2025-02. The clause number must match the n column or the audit misstates the contract." },
    ],
    distractors: ["%m", "Shenzhen Electro", "WHERE", "4"],
    walkthrough:
      "Three joins fan each order out to one row per line item, so the whole game is counting orders without counting lines: COUNT(DISTINCT o.id) stays honest while COUNT(*) would inflate every month (Nordic is 38 orders but 43 rows storewide). strftime('%Y-%m', o.created_at) builds the month key and the WHERE pins the supplier to Nordic Gadgets AB. Probed census: 3/3/3/4/4/2/1/2/2/2/2/4/3/3 across 14 buckets, so HAVING n = 3 keeps 2024-01, 2024-02, 2024-03, 2025-01 and 2025-02 — and HAVING n = 4 would flip the memo to the three months Nordic actually exceeded today's cadence.",
  },
  {
    id: "cs-1247",
    tier: "hard",
    topic: "w2",
    universe: "expense",
    title: "The month spine that lies",
    brief:
      "Spend report: finance circulated a claim that 'three months blew past 3000 in opex', but the close packet shows only one such month, and the difference is a bucketing bug — someone sliced the month out without the year, fusing Januaries from two fiscal years. Rebuild the query so each bucket carries its year and pin it above the disputed threshold to settle the claim.",
    ask: "Bucket expenses by year-month and keep only the true months spending over 3000.",
    template:
      "SELECT strftime('{1}', spent_on) AS mon, ROUND(SUM(amount_cents)/100.0, 2) AS spend\nFROM expenses\nGROUP BY mon {2} spend > {3}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the year-aware bucket",
        why: "'%Y-%m' keeps fiscal years apart — probed, 36 expense rows fold into 14 true months with 2024-08 the only one over 3000 (3210). '%m' alone fuses 2024-01's 1719 with 2025-01's 1959 into a phantom 3678." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The threshold applies to the folded monthly spend, so HAVING — WHERE spend > 3000 is a syntax error because the aggregate doesn't exist before the fold. Probed shape: exactly one bucket survives." },
      { answer: "3000", kind: "number", noVerify: true, label: "the disputed threshold",
        why: "The disputed claim is 'over 3000', so the pin is 3000 — probed, only 2024-08's 3210 clears it; every other true month sits between 1440 and 1974." },
    ],
    distractors: ["%m", "WHERE", "1900", "3210"],
    walkthrough:
      "This is a reconciliation case: the claim says three months over 3000, the books say one. The bug is the bucket key — '%m' alone folds 2024-01's 1719 with 2025-01's 1959 into '01' = 3678 and 2024-02's 1440 with 2025-02's 1650 into '02' = 3090, manufacturing two fake breaches next to the real one (2024-08, 3210). strftime('%Y-%m', spent_on) restores the year to every label, GROUP BY folds the 36 rows into 14 true months, and HAVING spend > 3000 keeps exactly 2024-08 | 3210 — probed, the full 14-month ladder runs 1719/1440/1974-height noise with a single 3210 spike, grand total 25416. Drop the pin to 1900 and three more months (1917, 1974, 1959) qualify; raise it to 3210 and even the spike drops out — the inequality is strict.",
  },
  {
    id: "cs-1248",
    tier: "easy",
    topic: "w2",
    universe: "growth",
    title: "The 2024 slice of the YoY split",
    brief:
      "Growth board deck: the year-over-year slide needs the 2024 order count as its anchor number, and last quarter someone read it off a '%m'-bucketed draft that had quietly merged years. The board sees this figure first, so it has to be generated and pinned. Count orders per year and keep the 2024 row.",
    ask: "Count orders per calendar year and keep the bucket with exactly 90 orders.",
    template:
      "SELECT strftime('{1}', created_at) AS yr, {2} AS n\nFROM orders\nGROUP BY yr {3} n = {4}\nORDER BY yr;",
    slots: [
      { answer: "%Y", kind: "keyword", label: "the year code",
        why: "'%Y' renders the 4-digit year — probed, 103 orders fold into two buckets: 2024 with 90 and 2025 with 13. '%y' is unsupported and returns NULL for every row, collapsing everything into one NULL bucket of 103." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the orders folded into each year — probed 90 vs 13. SUM(total) would print the spend split (30773.25 vs 4060.03), which is a different slide." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The pin filters folded year-buckets, so HAVING — WHERE n = 90 is a syntax error on this shape since the count doesn't exist before grouping. Probed: exactly one row survives." },
      { answer: "90", kind: "number", label: "the 2024 pin",
        why: "Probed: 2024 booked 90 of the 103 orders (2025 has 13). The anchor figure must equal the n cell or the deck's headline contradicts the query beneath it." },
    ],
    distractors: ["%y", "%m", "13", "WHERE"],
    walkthrough:
      "One format code does the whole job: strftime('%Y', created_at) labels every order with its year and GROUP BY folds 103 orders into two buckets — probed, 2024 with 90 and 2025 with 13 (spend 30773.25 vs 4060.03). COUNT(*) is the counter and HAVING n = 90 pins the slide's anchor row. The near-miss codes are the story: '%y' is not a supported strftime code and silently returns NULL, so all 103 orders collapse into one NULL bucket, and '%m' alone would print twelve month-numbers whose biggest count is 16 — neither can produce a 90 anywhere. Pin 13 instead and the slide anchors on 2025, a tenfold-smaller story told with total confidence.",
  },
  {
    id: "cs-1249",
    tier: "hard",
    topic: "w2",
    universe: "fraud",
    title: "Triple-booked days",
    brief:
      "Fraud spot-check: chargeback analysts flag any calendar day that carried three or more orders as a possible burst, and they want the flagged days to come with their weekday so the pattern can be checked against known delivery schedules. The day key must be a true date, not the raw timestamp column. List the days with exactly 3 orders, with each day's weekday code.",
    ask: "Bucket orders by day, keep days with exactly 3 orders, and show each day's weekday code.",
    template:
      "SELECT {1}(created_at) AS d, strftime('{2}', created_at) AS dow, {3} AS n\nFROM orders\nGROUP BY d {4} n = {5}\nORDER BY d;",
    slots: [
      { answer: "date", kind: "keyword", label: "the day truncator",
        why: "date(created_at) truncates the timestamp to a clean day key — probed, 103 orders collapse onto 84 distinct days. julianday(created_at) would key on floats like 2460442.5 (the Julian number for 2024-05-12) and print Julian numbers where the analysts expect dates." },
      { answer: "%w", kind: "keyword", label: "the weekday code",
        why: "'%w' renders the weekday with 0 = Sunday — probed, both burst days are '0'. '%Y-%m' would print month labels in the dow column and the weekday cross-check would be nonsense." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts orders per day — probed, exactly two days hit 3 (2024-05-12 and 2024-10-13). SUM(total) would compare each day's spend (1354.16 on 05-12) to 3 and flag nothing." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The burst rule applies to folded day-buckets, so HAVING — WHERE n = 3 is a syntax error because n is born in the GROUP BY. Probed: only the two triples survive the pin." },
      { answer: "3", kind: "number", label: "the burst size",
        why: "Probed: 2024-05-12 and 2024-10-13 each carry exactly 3 orders — the flagged bursts. Pin 2 instead and 15 innocent two-order days flood the alert queue." },
    ],
    distractors: ["julianday", "%Y-%m", "SUM(total)", "2"],
    walkthrough:
      "Grouping by the raw created_at would give one bucket per timestamp, which happens to work here only because timestamps are date-only — the honest day key is date(created_at), which folds 103 orders onto 84 distinct days. Probed, 15 of those days carry a pair and exactly two carry a triple: 2024-05-12 (orders 35, 39, 40) and 2024-10-13 (orders 73, 76, 77). strftime('%w', …) stamps the weekday and both bursts land on '0' — Sunday — which is the detail the analysts asked for. HAVING n = 3 encodes the burst rule after the fold; HAVING n = 2 would page the team 15 times for routine doubles, and SUM(total) would compare day spend to the count 3 and file zero reports.",
  },
  {
    id: "cs-1250",
    tier: "easy",
    topic: "w2",
    universe: "catalog",
    title: "2025's busiest category",
    brief:
      "Warehouse catalog: merchandising wants to know which category rang the most line items in 2025 so the spring planogram can lead with it. The draft query lost its year filter during a schema tidy-up and started counting both years together. Rebuild it so it counts line items per category for 2025 orders only and surfaces the leader.",
    ask: "Count order line items per category for 2025 orders and keep the top category.",
    template:
      "SELECT p.category, {1} AS n\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nWHERE strftime('{2}', o.created_at) = '2025'\nGROUP BY p.category\nORDER BY n DESC\nLIMIT {3};",
    slots: [
      { answer: "COUNT(*)", kind: "keyword", label: "the line counter",
        why: "COUNT(*) counts the joined line rows per category — probed 2025 ladder: Accessories 8, Electronics 6, Wearables 5. SUM(oi.quantity) would count units (15 for Accessories), a different merchandising question." },
      { answer: "%Y", kind: "keyword", label: "the year filter",
        why: "strftime('%Y', o.created_at) = '2025' pins the slice — probed, 2025 holds 13 orders. '%m' can never equal '2025' so the filter would return zero rows and an empty planogram." },
      { answer: "1", kind: "number", noVerify: true, label: "the leader cap",
        why: "The planogram needs one leader row, so LIMIT 1 — probed, that keeps Accessories with 8 line items and drops Electronics (6) to runner-up." },
    ],
    distractors: ["SUM(oi.quantity)", "%m", "2", "5"],
    walkthrough:
      "Line items live in order_items, so the join chain fans each 2025 order out to its rows and COUNT(*) tallies them per category — probed: Accessories 8, Electronics 6, Wearables 5, Video 4, Fitness 3, Audio 3, Apparel 2. The WHERE slice is date-driven: strftime('%Y', o.created_at) = '2025' isolates the 13 orders booked in 2025, and any other format code either never matches (the '%m' trap) or silently widens the window. ORDER BY n DESC + LIMIT 1 hands the planogram its leader, Accessories; swap in SUM(oi.quantity) and the memo quietly changes to units shipped — 15 for Accessories — which reads similarly and audits completely differently.",
  },
  {
    id: "cs-1251",
    tier: "medium",
    topic: "w2",
    universe: "month-close",
    title: "Staffing by weekday spend",
    brief:
      "Month-end close: ops wants the weekday that carries the most order value so the packing crew can be scheduled against reality, and they want the count and the spend on one line. The draft kept sorting by the weekday code itself, which answers 'which day sorts last', not 'which day earns most'. Rebuild the query to rank weekdays by spend and keep the leader.",
    ask: "Rank weekdays by total order spend and keep the single biggest day code with its count.",
    template:
      "SELECT strftime('{1}', created_at) AS dow, {2} AS n, ROUND(SUM(total), 2) AS spend\nFROM orders\nGROUP BY dow\nORDER BY {3} DESC\nLIMIT {4};",
    slots: [
      { answer: "%w", kind: "keyword", label: "the weekday code",
        why: "'%w' buckets by weekday with 0 = Sunday — probed, 103 orders fold into 7 codes: 0:16, 1:20, 2:16, 3:16, 4:9, 5:18, 6:8. '%d' would bucket by day-of-month and produce 25 fake 'weekdays'." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) reports how many orders landed on the leader — probed, Monday's 20. MIN(total) would print the smallest single order in the bucket, which no schedule can use." },
      { answer: "spend", kind: "keyword", label: "the ranking column",
        why: "The ranking key is the spend column — probed ladder: Monday 6944.03 leads, Friday 6649.57 second, Saturday 1888.79 last. Sorting by dow instead crowns '6' (Saturday) on code order, not money." },
      { answer: "1", kind: "number", noVerify: true, label: "the leader cap",
        why: "The schedule needs one row, so LIMIT 1 — probed, that keeps dow '1' with 20 orders and 6944.03, edging Friday's 6649.57." },
    ],
    distractors: ["%d", "dow", "total", "MIN"],
    walkthrough:
      "Weekday staffing starts with the right bucket: strftime('%w', created_at) folds 103 orders into seven codes — probed census 0:16, 1:20, 2:16, 3:16, 4:9, 5:18, 6:8 — and the money column ROUND(SUM(total), 2) turns each code into a workload number. Ranking by spend puts Monday (dow '1', 20 orders, 6944.03) on top with Friday (18, 6649.57) a close second and Saturday (8, 1888.79) far behind. The draft's bug was ranking by the code itself: ORDER BY dow DESC crowns '6' — Saturday, the quietest day — because text order and money order disagree. The same sleight happens with '%d', which would manufacture 25 day-of-month 'weekdays' and schedule the crew against calendar fragments.",
  },
  {
    id: "cs-1252",
    tier: "hard",
    topic: "w2",
    universe: "refund-audit",
    title: "The January cancellation mirage",
    brief:
      "Refund audit: an analyst's draft bucketed cancellations by month number alone and reported 'three months with exactly 2 cancellations', but the ledger shows one of those pairs spans two different years. The audit committee wants the fused-bucket version reproduced and then the year-safe version that exposes it. Keep the month-number slice for the demo, pinned to the pairs.",
    ask: "Bucket cancellations by month number alone and keep the buckets holding exactly 2.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, {2} AS n, ROUND(SUM(total), 2) AS lost\nFROM orders\nWHERE status = 'cancelled'\nGROUP BY mon {3} n = {4}\nORDER BY mon;",
    slots: [
      { answer: "%m", kind: "keyword", label: "the month-number bucket",
        why: "This demo deliberately uses '%m' — probed, it folds the 7 cancellations into 4 buckets: '01' with 2, '03' with 1, '07' with 2, '11' with 2. '%Y-%m' would split '01' into 2024-01 and 2025-01 and break the mirage." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the cancellations folded into each month-number — probed counts 2/1/2/2. SUM(total) would compare lost revenue (358.71 for '01') to the pin and keep nothing." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The pairs pin applies to folded buckets, so HAVING — WHERE n = 2 is a syntax error pre-fold. Probed: three buckets survive, which is exactly the misleading claim." },
      { answer: "2", kind: "number", label: "the pairs pin",
        why: "The contested claim is 'months with exactly 2 cancellations' — probed, '01', '07' and '11' qualify. Pin 1 instead and only '03' (136.11) survives, a different demo." },
    ],
    distractors: ["%Y-%m", "%d", "SUM(total)", "1"],
    walkthrough:
      "This case reproduces the lie on purpose: '%m' strips the year, so the 7 cancellations fold into month-number buckets '01' 2 / '03' 1 / '07' 2 / '11' 2, and HAVING n = 2 prints three confident-looking pairs. The exposure is in the numbers: '01' = 2 is really 2024-01-02's 152.52 plus 2025-01-05's 206.19 — lost 358.71 spanning two fiscal years — while '07' is genuinely one month (90.35 + 25.47 = 115.82) and '11' too (143.86 + 397.99 = 541.85). Run the same query with '%Y-%m' and the census becomes five true months (2024-01: 1, 2024-03: 1, 2024-07: 2, 2024-11: 2, 2025-01: 1) — only two real pairs. COUNT(*) counts events and SUM(total) counts dollars; the pin belongs in HAVING, after the fold.",
  },
  {
    id: "cs-1253",
    tier: "easy",
    topic: "w2",
    universe: "pricing",
    title: "The Friday effect",
    brief:
      "Pricing review: the promo calendar team heard that Fridays over-index and wants the Friday slice quantified before they move the weekend flash sale. The claim is specific — how many orders land on Fridays and what do they add up to. Filter the orders table to weekday 5 and report the count and the spend.",
    ask: "Count orders landing on Friday (weekday code 5) and total their spend.",
    template:
      "SELECT strftime('{1}', created_at) AS dow, {2} AS n, ROUND(SUM(total), 2) AS spend\nFROM orders\nWHERE strftime('%w', created_at) = '{3}'\nGROUP BY dow;",
    slots: [
      { answer: "%w", kind: "keyword", label: "the weekday code",
        why: "'%w' renders the weekday with 0 = Sunday, so the label column matches the filter — probed, Friday prints as '5'. '%m' would label the row '05' (a month) while filtering on weekday, a Frankenstein column." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the Friday orders — probed, 18 of the 103. AVG(total) would print the mean basket (369.42) in the count column and the memo's headline would be wrong twice." },
      { answer: "5", kind: "keyword", label: "the Friday filter",
        why: "strftime('%w', …) returns '5' for Friday — probed, 18 orders worth 6649.57. '4' is Thursday (9 orders, 2540.53) and '6' is Saturday (8, 1888.79); the zero-padded month '05' is not a weekday code at all." },
    ],
    distractors: ["4", "6", "AVG", "%m"],
    walkthrough:
      "The weekday mini-language is the whole case: strftime('%w', created_at) maps every order to '0'…'6' with Sunday as 0, so Friday is the literal '5' — probed census 0:16, 1:20, 2:16, 3:16, 4:9, 5:18, 6:8. Filtering to '5' and folding with COUNT(*) + SUM(total) gives the promo team their line: 18 orders, 6649.57 — second-busiest by spend behind Monday's 6944.03, with a 369.42 average basket and the storewide max order (1088.44) parked on a Friday. Shift the filter to '4' and the same query reports Thursday's quiet 9 orders / 2540.53; shift it to '6' and it reports Saturday's 8 / 1888.79. And '%m' in the label slot would print '05' — a month dressed up as a weekday — which is exactly the kind of column the promo deck would screenshot.",
  },
  {
    id: "cs-1254",
    tier: "medium",
    topic: "w2",
    universe: "inventory",
    title: "The February receiving window",
    brief:
      "Inventory count: the WMS import needs the February order window defined by real calendar edges — from the first of the month up to (but not into) the next — and last quarter's load used a hand-typed end date that quietly swallowed March's first orders. Rebuild the count with the start literal and a computed month edge so the window can never overrun.",
    ask: "Count orders from 2024-02-01 up to the computed start of the next month, with first and last order dates.",
    template:
      "WITH w AS (SELECT '{1}' AS start_day)\nSELECT COUNT(*) AS n, MIN(created_at) AS first_day, MAX(created_at) AS last_day\nFROM orders, w\nWHERE created_at >= start_day\n  AND created_at < date(start_day, '{2}', '{3}')\nHAVING n = {4};",
    slots: [
      { answer: "2024-02-01", kind: "number", noVerify: true, label: "the window start",
        why: "The February window opens at '2024-02-01' — probed, the half-open range holds 9 orders from 2024-02-05 to 2024-02-26. Starting at '2024-03-01' re-aims the whole window at March's 8 orders." },
      { answer: "start of month", kind: "keyword", label: "the month anchor",
        why: "'start of month' snaps the anchor date to its first day before shifting — probed chain date('2024-02-01','start of month','+1 month') = '2024-03-01'. 'start of year' would snap to 2024-01-01 and collapse the window to empty." },
      { answer: "+1 month", kind: "keyword", label: "the edge shifter",
        why: "'+1 month' moves the anchored date exactly one calendar month — probed, the upper edge becomes 2024-03-01 and the window holds 9. '+2 months' stretches it to April 1st and the count jumps to 17." },
      { answer: "9", kind: "number", label: "the February count",
        why: "Probed: the half-open February window holds exactly 9 orders — the number the WMS load expects. The last_day cell reads 2024-02-26, so the window visibly stops short of March." },
    ],
    distractors: ["2024-01-01", "2024-03-01", "+2 months", "start of year"],
    walkthrough:
      "Date edges are where buckets bleed: the safe pattern is half-open — created_at >= the month's first day AND created_at < the computed next-month edge. date('2024-02-01', 'start of month', '+1 month') lands exactly on '2024-03-01', so the window holds February and nothing else: probed 9 orders, first 2024-02-05, last 2024-02-26. The probe receipt that justifies the ceremony: 2024-02-29 and 2024-03-01 both carry zero orders, so a BETWEEN-style closed window would have been right-by-luck this February and wrong the next leap year. Start the window at '2024-01-01' and the count reads 8 (January only); stretch the shifter to '+2 months' and it reads 17 (February + March) — either way the WMS import is quietly poisoned.",
  },
  {
    id: "cs-1255",
    tier: "medium",
    topic: "w2",
    universe: "funnel",
    title: "Signups by quarter",
    brief:
      "Marketing funnel: the quarterly business review wants signup volume by calendar quarter, but SQLite has no quarter function, so the team's snippet computes it from the month number — and the snippet lost its format code and its quota pin. Rebuild it so each cohort lands in the right quarter and the review can pin the quarter that added exactly 4 accounts.",
    ask: "Bucket customer signups by computed calendar quarter and keep the quarter with exactly 4 signups.",
    template:
      "SELECT ((CAST(strftime('{1}', created_at) AS INTEGER) + 2) / 3) AS q, strftime('%Y', created_at) AS yr, {2} AS signups\nFROM customers\nGROUP BY yr, q {3} signups = {4}\nORDER BY yr, q;",
    slots: [
      { answer: "%m", kind: "keyword", label: "the month feed",
        why: "The quarter trick divides the month number: (CAST(strftime('%m', …) AS INTEGER) + 2) / 3 maps 01–03 to 1 … 10–12 to 4 — probed, 16 signups land in four (yr, q) groups. '%Y' would feed year 2024 into the formula and print a nonsense quarter of 675." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts signups per (year, quarter) — probed: 2023-Q4 4, 2024-Q1 6, 2024-Q2 5, 2024-Q3 1. SUM(id) would add customer ids (2023-Q4 sums to 10) and the quota pin would misfire." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The quota pin applies to folded quarter groups, so HAVING — WHERE signups = 4 is a syntax error because the count doesn't exist before grouping. Probed: one row survives." },
      { answer: "4", kind: "number", label: "the 4-signup pin",
        why: "Probed: 2023-Q4 is the quarter with exactly 4 signups (Nov + Dec, 2 each). Pin 6 and the answer flips to 2024-Q1; pin 5 and it's 2024-Q2; pin 1 and it's 2024-Q3." },
    ],
    distractors: ["%Y", "%d", "6", "WHERE"],
    walkthrough:
      "Quarter bucketing in SQLite is arithmetic on the month code: strftime('%m', created_at) yields '01'…'12', CAST makes it an integer, and (m + 2) / 3 does integer division that maps months to quarters — probed, the 16 signups fold into 2023-Q4: 4, 2024-Q1: 6, 2024-Q2: 5, 2024-Q3: 1. COUNT(*) is the counter and HAVING signups = 4 pins the review's answer row (yr 2023, q 4). The failure mode is feeding the wrong code into the formula: '%Y' feeds 2023/2024 and (2023+2)/3 prints a phantom quarter 675 that groups everything into one bucket per year — the query still runs, the quarters are fiction. '%d' feeds day-of-month into the same formula and shreds the cohorts into twelve micro-quarters of 1–4 signups each — probed, one phantom (yr 2024, q 1) even carries exactly 4, which is precisely why the census prints the year beside the quarter: the fake row announces itself in the wrong year.",
  },
  {
    id: "cs-1256",
    tier: "hard",
    topic: "w2",
    universe: "supplier",
    title: "Midwest's line-row fanout",
    brief:
      "Supplier audit: Midwest Hardware Co's monthly report counts look inflated and the ops lead suspects the line-item join is double-counting orders. The audit needs a side-by-side per month — total line rows pulled versus distinct orders — pinned to the month where the gap proves the point. Rebuild it so rows and distinct orders travel together and the pin catches the 5-order month.",
    ask: "Per month, count Midwest's line rows and distinct orders; keep the month with exactly 5 distinct orders.",
    template:
      "SELECT strftime('{1}', o.created_at) AS mon, COUNT(*) AS rows_pulled, {2} AS orders\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE p.supplier_id = 4\nGROUP BY mon {3} orders = {4}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps Midwest's months year-tagged — probed, 45 distinct orders (56 line rows) spread over 14 buckets, with 2025-02 reading 8 rows / 5 orders. '%m' alone would fuse same-numbered months across years." },
      { answer: "COUNT(DISTINCT o.id)", kind: "keyword", label: "the distinct-order counter",
        why: "COUNT(DISTINCT o.id) collapses the line-row fanout back to real orders — probed, 2025-02 is 5 orders behind 8 rows. COUNT(o.id) counts rows and would report 8, the exact inflation the audit is chasing." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The 5-order pin applies to the folded distinct count, so HAVING — WHERE orders = 5 is a syntax error on this shape. Probed: exactly one month survives the pin." },
      { answer: "5", kind: "number", label: "the 5-order pin",
        why: "Probed: 2025-02 is the month where Midwest pulled 8 line rows for exactly 5 distinct orders — the fanout exhibit. Pin 6 instead and the exhibit moves to 2024-02 (6/6) and 2024-09 (7/6)." },
    ],
    distractors: ["COUNT(o.id)", "%m", "WHERE", "8"],
    walkthrough:
      "The join from orders through order_items fans every multi-line order into several rows, so COUNT(*) measures warehouse effort (rows pulled) while COUNT(DISTINCT o.id) measures reality (orders) — probed, Midwest Hardware (supplier 4) shows 2025-02 as 8 rows over 5 distinct orders, 2024-09 as 7 over 6, and 2024-01 as 5 over 4. Bucketing by strftime('%Y-%m', o.created_at) keeps the months year-tagged across the 14-bucket span. HAVING orders = 5 isolates the exhibit month; the audit's sting is that COUNT(o.id) in the orders column would have agreed with COUNT(*) everywhere and reported 8 — the inflated number the supplier already quotes. Swap '%m' for '%Y-%m' and January 2024 (5/4) fuses with January 2025 (1/1) into a single lying '01' row.",
  },
  {
    id: "cs-1257",
    tier: "medium",
    topic: "w2",
    universe: "expense",
    title: "The August spike, isolated",
    brief:
      "Spend report: the ops director wants the single most expensive month of the fiscal span named and numbered for the cost board, and the draft query lost its sort direction and its cap during the migration. The numbers are cents in the table, so the query also has to convert honestly. Rebuild it to surface the priciest month from the monthly expense totals.",
    ask: "Rank months by total expense spend and keep only the single most expensive month.",
    template:
      "SELECT strftime('{1}', spent_on) AS mon, ROUND(SUM(amount_cents)/100.0, 2) AS spend\nFROM expenses\nGROUP BY mon\nORDER BY spend {2}\nLIMIT {3};",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the 36 expense rows in 14 year-tagged month buckets — probed ladder tops out at 2024-08. '%m' alone fuses the two Januarys into '01' = 3678 (1719 + 1959) and crowns a month that never existed." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Priciest first means DESC on the spend column — probed top: 2024-08 at 3210. ASC would surface the cheapest month, 2024-02 at 1440, and the board would celebrate the wrong line." },
      { answer: "1", kind: "number", noVerify: true, label: "the row cap",
        why: "The board wants one name, so LIMIT 1 — probed, that keeps 2024-08 | 3210 and leaves 2024-11's 1974 as the runner-up nobody asked about." },
    ],
    distractors: ["%m", "ASC", "2", "3"],
    walkthrough:
      "The cost board needs a spike, not a distribution: strftime('%Y-%m', spent_on) folds the 36 expense rows into 14 true month buckets, SUM(amount_cents)/100.0 converts cents to honest dollars, and ORDER BY spend DESC + LIMIT 1 isolates the spike — probed, 2024-08 at 3210 (Travel 1680 + Rent 1200 + Ads 330), with every other month between 1440 and 1974. The trap is the bucket key: '%m' alone merges January 2024's 1719 with January 2025's 1959 into a single '01' bucket of 3678 — a phantom month that would top the board by 468 over the real spike. Flip to ASC and the query confidently reports the cheapest month (2024-02, 1440); raise the cap to 2 or 3 and the deck quietly becomes a list.",
  },
  {
    id: "cs-1258",
    tier: "easy",
    topic: "w2",
    universe: "growth",
    title: "The twin nine-order months",
    brief:
      "Growth board deck: the ops slide claims two months tied for the busiest order volume last year, and the analyst wants the query to prove the tie rather than assert it. The draft lost its pin during a refactor and now prints all fourteen months. Restore the census and pin it so only the months that booked exactly 9 orders survive.",
    ask: "Generate the monthly order census and keep only the months with exactly 9 orders.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, {2} AS n\nFROM orders\nGROUP BY mon {3} n = {4}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' is the year-safe month key — probed, 14 buckets counting 8/9/8/7/8/6/8/7/9/7/6/7/6/7. '%Y' alone would collapse everything into 2024 (90) and 2025 (13) and the tie would vanish." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts orders per month bucket — probed, the two 9s sit at 2024-02 and 2024-09. SUM(total) would print month spend (3609.64 and 3116.04) and no month would match the pin." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The tie pin filters folded groups, so HAVING — WHERE n = 9 is a syntax error because n doesn't exist before grouping. Probed: exactly two rows survive." },
      { answer: "9", kind: "number", label: "the nine-order pin",
        why: "Probed: 2024-02 and 2024-09 are the only months with exactly 9 orders — the claimed tie. Pin 90 instead and the row becomes the whole-of-2024 aggregate, a different slide entirely." },
    ],
    distractors: ["%y", "%m", "90", "WHERE"],
    walkthrough:
      "Proving a tie means letting the pin do the talking: strftime('%Y-%m', created_at) folds 103 orders into 14 month buckets (8/9/8/7/8/6/8/7/9/7/6/7/6/7), COUNT(*) counts them, and HAVING n = 9 keeps exactly 2024-02 and 2024-09 — the slide's twin bars. The distractor codes show how the claim could silently die: '%y' is unsupported and returns NULL for every row, collapsing all 103 orders into one NULL bucket, while '%m' alone merges same-numbered months across years (its biggest bucket, '02', is 16) so no bucket can ever equal 9. And pin 90 instead of 9 — one keystroke — and the query answers with the entire 2024 aggregate, a completely different magnitude presented with the same confidence.",
  },
  {
    id: "cs-1259",
    tier: "easy",
    topic: "w2",
    universe: "fraud",
    title: "One day, three orders",
    brief:
      "Fraud spot-check: a chargeback landed on order 39 and the analyst wants to know exactly how busy that order's calendar day was before writing the response. The raw created_at values are timestamps, so the day needs truncating, and the day in question must be pinned by a real date filter. Count the orders that share 2024-05-12.",
    ask: "Count the orders whose date falls exactly on 2024-05-12, keeping the busiest-day shape.",
    template:
      "SELECT {1}(created_at) AS d, {2} AS n\nFROM orders\nWHERE created_at LIKE '{3}'\nGROUP BY d\nORDER BY n DESC\nLIMIT 1;",
    slots: [
      { answer: "date", kind: "keyword", label: "the day truncator",
        why: "date(created_at) truncates the timestamp to the day key the group-by needs — probed, 103 orders sit on 84 distinct days. julianday(created_at) would print a float like 2460442.5 (2024-05-12's Julian number) where the case file expects a date." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the orders sharing the day — probed, 2024-05-12 holds 3 (orders 35, 39, 40). SUM(total) would print the day's spend (1354.16) in the count column." },
      { answer: "2024-05-12", kind: "number", label: "the pinned day",
        why: "The LIKE pattern pins the day — probed, '2024-05-12' matches exactly 3 rows and the d cell echoes the date back into the result. '2024-10-13' is the store's other triple day (orders 73, 76, 77)." },
    ],
    distractors: ["julianday", "SUM(total)", "2024-10-13", "2024-05-19"],
    walkthrough:
      "The analyst's question is 'how busy was that day?', so the query truncates created_at with date() to get a true day key and counts with COUNT(*) under a LIKE '2024-05-12' filter — probed, the day carries exactly 3 orders: 35 (373, shipped), 39 (845.92, the disputed one) and 40 (135.24, delivered). The d cell echoes '2024-05-12' back so the case file shows the date and the count on one line. The near-misses are instructive: '2024-10-13' is the store's only other triple day (375.93 + 235.71 + 303.26), '2024-05-19' is one of the fifteen two-order days, and julianday would key the group on floats — a correct-looking query reporting Julian day numbers to a chargeback analyst.",
  },
  {
    id: "cs-1260",
    tier: "hard",
    topic: "w2",
    universe: "catalog",
    title: "Units moved in 2025",
    brief:
      "Warehouse catalog: the restock committee budgets shelf space by units moved, not line items, and their 2025 draft lost both the year slice and the units aggregate in a refactor. The committee only reviews categories that cleared a floor, so the query needs a group-level threshold too. Rebuild it to sum units per category for 2025 orders and keep the categories that moved more than 8 units.",
    ask: "Sum units per category across 2025 order lines; keep categories with more than 8 units.",
    template:
      "SELECT p.category, {1} AS units\nFROM order_items oi\nJOIN orders o ON o.id = oi.order_id\nJOIN products p ON p.id = oi.product_id\nWHERE strftime('{2}', o.created_at) = '2025'\nGROUP BY p.category {3} units > {4}\nORDER BY units DESC;",
    slots: [
      { answer: "SUM(oi.quantity)", kind: "keyword", label: "the units aggregate",
        why: "Units moved is SUM(oi.quantity) over the joined lines — probed 2025: Accessories 15, Electronics 13, Wearables 9, Audio 7. COUNT(*) would count line items (8/6/5) and understate every shelf by its bundle depth." },
      { answer: "%Y", kind: "keyword", label: "the year filter",
        why: "strftime('%Y', o.created_at) = '2025' slices to the 13 orders booked in 2025 — probed. '%m' can never equal '2025', so the filter would return zero rows and an empty restock list." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The floor applies to the folded units total, so HAVING — WHERE units > 8 is a syntax error because the aggregate doesn't exist before grouping. Probed: three categories survive." },
      { answer: "8", kind: "number", noVerify: true, label: "the units floor",
        why: "The committee's review floor is 'more than 8 units' — probed, that keeps Accessories (15), Electronics (13) and Wearables (9) and drops Audio (7) just under the wire." },
    ],
    distractors: ["COUNT(*)", "%m", "WHERE", "12"],
    walkthrough:
      "Shelf space is bought with units, so the aggregate is SUM(oi.quantity) across the join fanout — probed, the 2025 slice (strftime('%Y', o.created_at) = '2025', 13 orders) sums to Accessories 15, Electronics 13, Wearables 9, Audio 7, Video 5, Fitness 5, Apparel 3. HAVING units > 8 keeps the three categories the committee reviews; the floor is a group-level condition so WHERE can't express it. The traps are quiet: COUNT(*) would have reported line-item counts (8/6/5) — smaller, plausible, and wrong by every bundle — and '%m' as the year code matches nothing, returning an empty list that reads as 'no restock needed'. Raise the floor to 12 and Wearables (9) drops out mid-review with no error to warn anyone.",
  },
  {
    id: "cs-1261",
    tier: "easy",
    topic: "w2",
    universe: "month-close",
    title: "Cash's biggest swing",
    brief:
      "Month-end close: the treasurer signs off on the month where the cash account moved the most, and the packet needs that month named with its net. The ledger stores cents in debit/credit columns, and the draft lost its account filter during the audit freeze. Rebuild the query to net the cash account by month and surface the biggest swing.",
    ask: "Net the cash account per month and keep the single month with the largest net.",
    template:
      "SELECT strftime('{1}', entry_date) AS mon, ROUND({2}(debit_cents - credit_cents)/100.0, 2) AS net\nFROM ledger_entries\nWHERE account = '{3}'\nGROUP BY mon\nORDER BY net DESC\nLIMIT 1;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' folds the ledger's entry dates into year-tagged months — probed, 80 entries span 14 buckets from 2024-01-31 to 2025-02-28. '%m' alone would fuse same-numbered months across the two fiscal years." },
      { answer: "SUM", kind: "keyword", label: "the net aggregator",
        why: "A monthly swing is SUM(debit_cents - credit_cents) — probed, cash's biggest month nets 6875.50. AVG would print a per-entry mean no treasurer signs, and the cents division would hide it." },
      { answer: "cash", kind: "keyword", label: "the account filter",
        why: "The sign-off is for the cash account — probed, 'cash' holds 27 of the 80 ledger entries (net 44196). 'accounts_receivable' is a different account with a different monthly shape entirely." },
    ],
    distractors: ["%m", "AVG", "accounts_receivable", "operating_expenses"],
    walkthrough:
      "The close packet's cash page is a bucket-and-fold: strftime('%Y-%m', entry_date) labels the 80 ledger rows by month, the WHERE pins the account to 'cash' (27 entries, lifetime net 44196), and SUM(debit_cents - credit_cents)/100.0 nets each month in dollars. Probed ladder: 2024-09 swings hardest at 6875.50, with 2024-03 (6076.00) and 2025-02 (5426.00) behind it — LIMIT 1 keeps the sign-off row. The '%m' trap is a fiscal-year fuse: month-number buckets would fold January 2024's cash net with January 2025's into one '01' row, and a treasurer cannot sign a month that exists in two years. AVG would report an average entry, and pointing the filter at operating_expenses would sign off the opex spike (2024-08, 3210) as if it were cash.",
  },
  {
    id: "cs-1262",
    tier: "medium",
    topic: "w2",
    universe: "refund-audit",
    title: "The lone 2025 cancellation",
    brief:
      "Refund audit: the 2025 annex of the dispute report needs the single cancelled order from this fiscal year, with its id, date, year stamp and value on one line. The draft's year filter and its year projection both went missing in the freeze, so the query currently pulls every cancellation back to 2024. Restore the filter and the year column.",
    ask: "List cancelled orders from 2025 only, showing id, date, the extracted year, and total.",
    template:
      "SELECT id, created_at, {2}('%Y', created_at) AS yr, total\nFROM orders\nWHERE status = '{1}'\n  AND strftime('%Y', created_at) = '{3}';",
    slots: [
      { answer: "cancelled", kind: "keyword", label: "the status filter",
        why: "The dispute annex covers cancellations — probed, status = 'cancelled' holds 7 orders storewide. 'shipped' would sweep in 3 different 2025 orders and the annex would contradict the ledger." },
      { answer: "strftime", kind: "keyword", label: "the year extractor",
        why: "strftime('%Y', created_at) renders the 4-digit year stamp the annex prints — probed, it reads '2025' on the surviving row. date('%Y', created_at) would read '%Y' as the date value itself and return NULL — a blank year column." },
      { answer: "2025", kind: "keyword", label: "the year literal",
        why: "The annex is the 2025 slice — probed, exactly one cancelled order matches: id 95, 2025-01-05, 206.19, and the yr column stamps that same '2025' back out. Filtering '2024' instead returns the six 2024 cancellations and doubles the annex." },
    ],
    distractors: ["shipped", "date", "2024", "%Y"],
    walkthrough:
      "Annex queries are slices: WHERE status = 'cancelled' narrows to the 7 cancellations, strftime('%Y', created_at) = '2025' keeps only this fiscal year, and the SELECT projects id, created_at, a year stamp, and the value — probed, exactly one row survives: order 95, created 2025-01-05, worth 206.19. The projection matters as much as the filter: the yr column is strftime('%Y', …) output, echoing '2025' so the printed annex carries its own provenance. Filter '2024' instead and the annex balloons to six rows from last fiscal year; swap the extractor to date() and date('%Y', created_at) reads '%Y' as the date value and returns NULL — the annex still lists the right order but prints a blank year, the kind of silent failure that gets a dispute report bounced back.",
  },
  {
    id: "cs-1263",
    tier: "medium",
    topic: "w2",
    universe: "pricing",
    title: "Revenue by quarter",
    brief:
      "Pricing review: the quarterly revenue ladder feeds the price-elasticity model, and the model's feed broke when someone deleted the computed quarter expression. SQLite has no quarter function, so the query must derive the quarter from the month code. Rebuild the ladder so each year's quarters rank by revenue and the strongest quarter surfaces first.",
    ask: "Compute calendar quarters from order dates, sum revenue per quarter, rank richest first, keep the top one.",
    template:
      "SELECT ((CAST(strftime('{1}', created_at) AS INTEGER) + 2) / 3) AS q, strftime('%Y', created_at) AS yr, ROUND(SUM(total), 2) AS spend\nFROM orders\nGROUP BY yr, q\nORDER BY spend {2}\nLIMIT {3};",
    slots: [
      { answer: "%m", kind: "keyword", label: "the month feed",
        why: "The quarter formula eats month numbers: (CAST(strftime('%m', …) AS INTEGER) + 2) / 3 maps months 01–03 → 1 … 10–12 → 4 — probed, 103 orders fold into five (yr, q) groups. '%Y' feeds 2024 into the formula and prints a phantom quarter 675." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Richest quarter first means DESC on spend — probed ladder: 2024-Q1 9958.69 leads, then Q2 7426.65, Q4 6725.94, Q3 6661.97, 2025-Q1 4060.03. ASC would surface the weakest quarter instead." },
      { answer: "1", kind: "number", label: "the row cap",
        why: "The model feed wants the strongest quarter only, so LIMIT 1 — probed, that keeps q 1 / yr 2024 / 9958.69, the sum of 3731.97 + 3609.64 + 2617.08. The q cell echoes the 1 back into the result." },
    ],
    distractors: ["%Y", "%d", "ASC", "2"],
    walkthrough:
      "SQLite makes you build the quarter: strftime('%m', created_at) yields '01'…'12', CAST to INTEGER, then (m + 2) / 3 with integer division maps months onto quarters 1–4 — probed, the 103 orders fold into 2024-Q1: 25 orders / 9958.69, Q2: 21 / 7426.65, Q3: 24 / 6661.97, Q4: 20 / 6725.94, and 2025-Q1: 13 / 4060.03. ORDER BY spend DESC puts the model's input first and LIMIT 1 keeps exactly the strongest quarter — 2024-Q1 at 9958.69, the sum of the three opening months. Feed the formula '%Y' instead and it computes (2024 + 2) / 3 = 675: one phantom quarter per year, revenue 30773.25, and an elasticity model trained on nonsense. '%d' feeds day-of-month and shreds the ladder into day-numbered fragments; ASC hands the model the weakest quarter (2025-Q1, 4060.03) as if it were the strongest.",
  },
  {
    id: "cs-1264",
    tier: "hard",
    topic: "w2",
    universe: "inventory",
    title: "Snap receiving to month end",
    brief:
      "Inventory count: the WMS dates a receiving batch by its scan day, but the warehouse's cutoff report needs every batch snapped to the last day of its own month — and February's leap day is exactly where last year's snapshot went wrong. The team's modifier chain lost two of its pieces in the migration. Rebuild the snap for the 2024-02-11 batch using the modifier chain.",
    ask: "Snap the 2024-02-11 batch to its month's first day and to the month's last day via modifiers.",
    template:
      "WITH batch AS (SELECT '{1}' AS d)\nSELECT date(d, '{2}') AS anchor,\n       date(d, 'start of month', '+1 month', '{3}') AS month_end\nFROM batch;",
    slots: [
      { answer: "2024-02-11", kind: "number", noVerify: true, label: "the batch date",
        why: "The receiving batch is dated 2024-02-11 — probed, date('2024-02-11','start of month') = '2024-02-01' and the full chain lands '2024-02-29'. The batch literal feeds the chain; it is a date input, not a figure from the data." },
      { answer: "start of month", kind: "keyword", label: "the month anchor",
        why: "'start of month' is the snap that anchors the batch to its month's first day — probed, '2024-02-11' becomes '2024-02-01'. 'start of year' would anchor to 2024-01-01 and the whole chain would report January." },
      { answer: "-1 day", kind: "keyword", label: "the month-end step",
        why: "Month end is computed, never typed: start of month → +1 month → -1 day — probed, '2024-02-01' + 1 month - 1 day = '2024-02-29', the leap day. '-2 day' would land on the 28th and drop a real receiving day." },
    ],
    distractors: ["2024-03-11", "start of year", "weekday 1", "+2 months"],
    walkthrough:
      "The safe month-end is a modifier chain, not a typed literal: date('2024-02-11', 'start of month') anchors the batch to '2024-02-01', then '+1 month' walks to '2024-03-01' and '-1 day' steps back to the true month end — probed, '2024-02-29', leap day included. The anchor column and the chain column print side by side, so the cutoff report shows the snap and the resulting month end on one row. The near-misses are calendar-shaped: run the chain on '2024-03-11' and it correctly reports March's '2024-03-31' — a different month wearing the same query; swap in 'start of year' and the anchor becomes '2024-01-01', silently moving the cutoff into January; '+2 months' walks two months out and 'weekday 1' rolls the date forward to the next Monday ('2024-02-12') — all valid date math aimed at the wrong report. The drill receipt that justifies the chain: typing '2024-01-31' + 1 month spills to '2024-03-02'.",
  },
  {
    id: "cs-1265",
    tier: "medium",
    topic: "w2",
    universe: "funnel",
    title: "H1 2024 acquisition count",
    brief:
      "Marketing funnel: the H1 recap needs the number of accounts created between January and June 2024 inclusive, and the analyst wants the window expressed with bucket labels so the same query extends to any half-year by editing two strings. The draft's BETWEEN lost both of its endpoints. Restore the count over the signup-month window.",
    ask: "Count customers whose signup month falls between 2024-01 and 2024-06 inclusive.",
    template:
      "SELECT {1} AS n\nFROM customers\nWHERE strftime('{2}', created_at) BETWEEN '{3}' AND '{4}';",
    slots: [
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts the surviving signup rows — probed, the H1 2024 window holds 11 accounts. SUM(id) would add customer ids (110 for that window) and print a number no funnel chart can use." },
      { answer: "%Y-%m", kind: "keyword", label: "the window format",
        why: "strftime('%Y-%m', created_at) renders the '2024-01'-style labels the BETWEEN compares — probed cohorts 2024-01…2024-06 each added 2/2/2/2/2/1. '%d' renders day numbers, which never sort between those labels." },
      { answer: "2024-01", kind: "number", noVerify: true, label: "the window open",
        why: "The half-year opens at '2024-01' — probed, January added 2 of the 11. Moving the open to '2024-02' drops January and the count falls to 9." },
      { answer: "2024-06", kind: "number", noVerify: true, label: "the window close",
        why: "The half-year closes at '2024-06' — probed, June added 1. Extending to '2024-07' pulls July's single signup in and the recap reads 12." },
    ],
    distractors: ["SUM(id)", "%d", "2024-02", "2024-07"],
    walkthrough:
      "Because ISO dates sort as text, a bucket-label BETWEEN is a legitimate calendar window: strftime('%Y-%m', created_at) renders each signup as '2024-01'…'2024-07', and BETWEEN '2024-01' AND '2024-06' keeps the first-half cohorts — probed 2 + 2 + 2 + 2 + 2 + 1 = 11 accounts. COUNT(*) is the counter; the window lives entirely in the two literals, which is why the recap can be re-aimed at any half-year by editing two strings. The probe receipts bracket the window: open at '2024-02' and the count drops to 9; close at '2024-07' and it climbs to 12. And '%d' as the format code renders day-of-month numbers that can never sort between '2024-01' and '2024-06' — the window goes empty and the recap would report a first half that never happened.",
  },
  {
    id: "cs-1266",
    tier: "medium",
    topic: "w2",
    universe: "supplier",
    title: "Midwest's busiest order month",
    brief:
      "Supplier audit: the ops lead wants Midwest Hardware Co's heaviest month — by distinct orders, not line rows — pinned for the capacity review, and the report must bucket by order month across both years. The draft lost its distinct counter and its pin in the freeze. Rebuild the census and pin the month that filled exactly 6 distinct orders.",
    ask: "Count Midwest's distinct orders per month and keep the months with exactly 6.",
    template:
      "SELECT strftime('{1}', o.created_at) AS mon, COUNT(DISTINCT o.id) AS n\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nWHERE p.supplier_id = 4\nGROUP BY mon {2} n = {3}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps Midwest's 45 distinct orders in 14 year-tagged buckets — probed counts include 2024-02: 6 and 2024-09: 6. '%m' alone would fuse same-numbered months across years and blur the capacity story." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The 6-order pin applies to the folded distinct count, so HAVING — WHERE n = 6 is a syntax error on this joined shape. Probed: exactly two months survive the pin." },
      { answer: "6", kind: "number", label: "the 6-order pin",
        why: "Probed: Midwest filled exactly 6 distinct orders in 2024-02 and 2024-09 — the capacity ceiling months. Pin 3 instead and four quieter months (2024-04, 2024-05, 2024-08, 2024-10) flood the report." },
    ],
    distractors: ["%m", "COUNT(o.id)", "WHERE", "3"],
    walkthrough:
      "The join through order_items fans Midwest's orders into 56 line rows, so the honest month census is COUNT(DISTINCT o.id) — probed ladder over 14 buckets with a ceiling of 6: 2024-02 and 2024-09 both filled exactly 6 distinct orders, which is the capacity headline. strftime('%Y-%m', o.created_at) keeps every bucket year-tagged and HAVING n = 6 does the pinning after the fold. The audit's trap is the plain counter: COUNT(o.id) counts line rows and reports inflated numbers — the same month that is '6 orders' becomes '7 rows' in 2024-09 — and a capacity review built on it would renegotiate against fiction. '%m' alone fuses the two years' months into 12 buckets, and pin 3 drags four routine months into a report meant for the ceiling.",
  },
  {
    id: "cs-1267",
    tier: "easy",
    topic: "w2",
    universe: "expense",
    title: "Travel spend, ranked",
    brief:
      "Spend report: the CFO saw August's total and asked whether travel is the driver, so the report needs Travel isolated and ranked by month with the biggest first. The draft lost its category filter and its direction during the migration. Rebuild it so the three Travel months line up richest-first, converted honestly from cents.",
    ask: "Sum Travel expenses per month and rank the months richest first.",
    template:
      "SELECT strftime('{1}', spent_on) AS mon, ROUND(SUM(amount_cents)/100.0, 2) AS spend\nFROM expenses\nWHERE category = '{2}'\nGROUP BY mon\nORDER BY spend {3};",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the Travel months year-tagged — probed, Travel has exactly 3 rows: 2024-08, 2024-03, 2024-11. '%m' alone would strip the years and label the rows '08', '03', '11' — unreadable in a fiscal report." },
      { answer: "Travel", kind: "keyword", label: "the category filter",
        why: "The CFO's question is about Travel — probed, category = 'Travel' holds 3 expense rows totalling 2521. 'Tools' holds 5 rows (1525) and 'Rent' 14 (16800); both would answer a different memo." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Biggest driver first means DESC on spend — probed order: 2024-08 1680, 2024-03 452, 2024-11 389. ASC would lead with the quietest month and bury the spike the CFO is asking about." },
    ],
    distractors: ["%m", "Tools", "Rent", "ASC"],
    walkthrough:
      "The drill-down is a filter-then-fold: WHERE category = 'Travel' narrows the 36 expense rows to 3, strftime('%Y-%m', spent_on) buckets them by true month, and SUM(amount_cents)/100.0 converts cents to dollars — probed order: 2024-08 at 1680.00, 2024-03 at 452.00, 2024-11 at 389.00. That confirms the CFO's hunch: August's storewide 3210 spike is mostly Travel (1680 of it), with Rent (1200) and Ads (330) behind. The sort direction is the deliverable — DESC leads with the spike, ASC would open the memo with November's 389 and the story would invert. And '%m' as the bucket key strips the fiscal years off the labels ('08', '03', '11'), which is how a three-row answer becomes an unattributable one.",
  },
  {
    id: "cs-1268",
    tier: "hard",
    topic: "w2",
    universe: "growth",
    title: "The year code that wasn't",
    brief:
      "Growth board deck: the YoY slide's year split vanished after someone 'simplified' the bucket code, and the deck now shows a single NULL row for all 103 orders. The team wants the broken pattern documented and the working query restored with the 2025 slice pinned for the footnote. Rebuild the year census from the orders table.",
    ask: "Bucket orders by 4-digit year, keep the bucket with exactly 13 orders, and note why the draft returned NULL.",
    template:
      "SELECT strftime('{1}', created_at) AS yr, {2} AS n\nFROM orders\nGROUP BY yr {3} n = {4}\nORDER BY yr;",
    slots: [
      { answer: "%Y", kind: "keyword", label: "the year code",
        why: "'%Y' renders the 4-digit year — probed, two buckets: 2024 with 90, 2025 with 13. '%y' is unsupported in SQLite's strftime and returns NULL for every row, which is exactly the single-NULL-row bug the deck inherited." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts orders per year bucket — probed 90 vs 13 (spend 30773.25 vs 4060.03). SUM(total) would print the spend split and the footnote's order count would be fiction." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The footnote pin filters folded year buckets, so HAVING — WHERE n = 13 is a syntax error pre-fold. Probed: exactly the 2025 row survives." },
      { answer: "13", kind: "number", label: "the 2025 pin",
        why: "Probed: 2025 holds 13 of the 103 orders — the footnote's figure. Pin 90 instead and the slide anchors on 2024, which the footnote already covers." },
    ],
    distractors: ["%y", "%m", "90", "WHERE"],
    walkthrough:
      "The broken draft is the teaching moment: '%y' looks like a year code but SQLite's strftime doesn't support it and returns NULL for every row, so GROUP BY folds all 103 orders into one NULL bucket — the deck's mysterious single row. The working census is strftime('%Y', created_at) with COUNT(*): probed, 2024 | 90 (30773.25) and 2025 | 13 (4060.03), and HAVING n = 13 pins the footnote row. The other near-miss is '%m', which folds same-numbered months across years into twelve buckets whose counts (14, 16, 8, 7 …) can never produce a 13 — plausible-looking output that answers nothing. And pin 90, one keystroke from the truth, and the footnote quotes the 2024 aggregate instead of the 2025 slice it was written for.",
  },
  {
    id: "cs-1269",
    tier: "easy",
    topic: "w2",
    universe: "fraud",
    title: "All orders at midnight",
    brief:
      "Fraud spot-check: before the team builds time-of-day risk buckets, they need proof that the order timestamps carry no time component at all — otherwise every 'hour bucket' would be fiction. The check is one query: bucket by the hour code and confirm a single bucket holding every order. Rebuild it with the hour format and the full-count pin.",
    ask: "Bucket orders by the %H hour code and confirm one bucket holding all 103 orders.",
    template:
      "SELECT {1}('%H', created_at) AS hh, {2} AS n\nFROM orders\nGROUP BY hh {3} n = {4};",
    slots: [
      { answer: "strftime", kind: "keyword", label: "the hour extractor",
        why: "strftime('%H', created_at) renders the hour component — probed, every one of the 103 timestamps renders '00'. date('%H', created_at) would read '%H' as the date value itself and return NULL for all rows." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts orders per hour bucket — probed, the single '00' bucket holds all 103. SUM(total) would print 34833.28 in the count column and the sanity check would fail on a healthy dataset." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The full-count pin filters the folded bucket, so HAVING — WHERE n = 103 is a syntax error because n doesn't exist before grouping. Probed: the pin passes on exactly one row." },
      { answer: "103", kind: "number", label: "the full-count pin",
        why: "Probed: the '00' bucket holds exactly 103 orders — the whole table, proving the timestamps are date-only. Pin 100 and even the true bucket fails its own check." },
    ],
    distractors: ["date", "SUM(total)", "100", "WHERE"],
    walkthrough:
      "Time-of-day risk modeling dies right here if the data has no time: strftime('%H', created_at) renders the hour of every timestamp and probed it returns '00' for all of them — COUNT(DISTINCT …) over the hour codes is literally 1. The check query folds to a single bucket ('00', 103) and HAVING n = 103 asserts the bucket is complete; anything less would mean some orders carry a real time-of-day and the buckets are live. The near-miss extractor is the trap: date('%H', created_at) treats '%H' as the value being converted — not a format — and returns NULL for every row, producing one NULL bucket that looks eerily similar in shape. SUM(total) would compare 34833.28 to the pin and flag a healthy dataset as broken, and pin 100 fails the very bucket it was meant to confirm.",
  },
  {
    id: "cs-1270",
    tier: "hard",
    topic: "w2",
    universe: "catalog",
    title: "October's four busy days",
    brief:
      "Warehouse catalog: the October replenishment memo claims '7 orders spread across the month', but the picking log shows the team only made four distinct trips that month — the orders cluster on shared days. Ops wants the divergence quantified per month so the memo stops equating order counts with busy days. Rebuild the month census with both numbers and pin October.",
    ask: "Per month, count distinct order days and total orders; keep the month with exactly 7 orders.",
    template:
      "SELECT strftime('%Y-%m', created_at) AS mon, {1}(DISTINCT created_at) AS days, {2} AS n\nFROM orders\nGROUP BY mon {3} mon = '{4}';",
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the days counter",
        why: "COUNT(DISTINCT created_at) collapses shared days back to distinct trips — probed, October is 4 days under 7 orders. SUM(DISTINCT created_at) would add the day strings as bare numbers — probed, October's four dates coerce to 2024 each and the days column reads 8096." },
      { answer: "COUNT(*)", kind: "keyword", label: "the orders counter",
        why: "COUNT(*) counts the month's orders — probed, October holds 7 (spend 2975.67). SUM(total) would print the spend in the orders column and the memo's counts would be dollars." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The month pin filters folded buckets, so HAVING mon = '2024-10' — WHERE can't reference the bucket alias before the fold. Probed: exactly one month survives." },
      { answer: "2024-10", kind: "number", label: "the October pin",
        why: "The memo is about October — probed, mon '2024-10' echoes back into the result with days 4 and orders 7. Pin '2024-11' instead and the row becomes November's 5 days / 6 orders." },
    ],
    distractors: ["SUM", "SUM(total)", "2024-11", "WHERE"],
    walkthrough:
      "Order counts and busy days are different animals: strftime('%Y-%m', created_at) buckets the 103 orders into 14 months, COUNT(DISTINCT created_at) counts the distinct days each month actually touched, and COUNT(*) counts its orders. Probed, the divergence is real storewide — 103 orders on only 84 distinct days, with 17 dates shared by multiple orders — and October is the memo's exhibit: 4 days under 7 orders (the 10-04 pair and the 10-13 triple do the clustering). HAVING mon = '2024-10' pins the exhibit row [2024-10 | 4 | 7]; pin '2024-11' instead and the memo quotes November's 5 days / 6 orders. The quiet trap is SUM(DISTINCT created_at): SQLite coerces each date string to its leading integer, so October's four distinct days sum to 8096 — a census that runs clean and reports a working-day count no calendar can use.",
  },
  {
    id: "cs-1271",
    tier: "medium",
    topic: "w2",
    universe: "month-close",
    title: "The opex month over 2000",
    brief:
      "Month-end close: the audit trail needs the single close month where operating expenses cleared 2000, and the working-paper template lost its bucket format and its threshold during the freeze. The ledger stores cents, and the paper must quote dollars. Rebuild the monthly opex net from ledger_entries and pin it above the 2000 line.",
    ask: "Net the operating_expenses account per month and keep the month whose net exceeds 2000.",
    template:
      "SELECT strftime('{1}', entry_date) AS mon, ROUND(SUM(debit_cents - credit_cents)/100.0, 2) AS net\nFROM ledger_entries\nWHERE account = 'operating_expenses'\nGROUP BY mon {2} net > {3}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the opex line year-tagged — probed, 14 monthly nets from 1719 (2024-01) to 1650 (2025-02). '%m' alone fuses the two Januarys into '01' = 3678 and manufactures a second breach." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The threshold applies to the folded monthly net, so HAVING — WHERE net > 2000 is a syntax error because the aggregate doesn't exist pre-fold. Probed: one month survives." },
      { answer: "2000", kind: "number", noVerify: true, label: "the threshold",
        why: "The audit line is 2000 — probed, only 2024-08's 3210 clears it; the next largest opex month is 1974. The threshold never appears in the result cells, which is expected for a filter literal." },
    ],
    distractors: ["%m", "WHERE", "1900", "1500"],
    walkthrough:
      "The working paper is a filter-fold-pin: strftime('%Y-%m', entry_date) buckets the opex entries by true month, SUM(debit_cents - credit_cents)/100.0 nets each month in dollars — probed ladder 1719/1440/1917/1749/1480/1510/1794/3210/1545/1859/1974/1610/1959/1650 — and HAVING net > 2000 keeps exactly 2024-08 | 3210. The bucket format is load-bearing: '%m' alone folds January 2024's 1719 with January 2025's 1959 into '01' = 3678 and prints a second breach that the audit trail would then chase through two fiscal years. Loosen the pin to 1900 and three more months (1917, 1974, 1959) join the finding; drop it to 1500 and thirteen of fourteen months 'fail' — the threshold and the format have to be right together for the paper to mean anything.",
  },
  {
    id: "cs-1272",
    tier: "hard",
    topic: "w2",
    universe: "refund-audit",
    title: "Cancellation aging report",
    brief:
      "Refund audit: the disputes committee wants every cancelled order aged against the 2025-03-01 audit date, oldest first, so the two oldest cases can be escalated. Raw text subtraction of dates returns nonsense, so the aging must run through Julian day numbers. Rebuild the aging query with the audit-date anchor and keep the two oldest cancellations.",
    ask: "Age each cancelled order in days against 2025-03-01 and keep the two oldest.",
    template:
      "SELECT id, created_at, CAST(julianday('2025-03-01') - {1}(created_at) AS INTEGER) AS age\nFROM orders\nWHERE status = '{2}'\nORDER BY age {3}\nLIMIT {4};",
    slots: [
      { answer: "julianday", kind: "keyword", label: "the day converter",
        why: "julianday(created_at) turns each timestamp into a day number so subtraction yields real days — probed, the ages run 424 down to 55. date(created_at) leaves a text date, and text minus a Julian number prints junk like 2458711." },
      { answer: "cancelled", kind: "keyword", label: "the status filter",
        why: "The aging report covers cancellations — probed, 7 orders carry that status. 'shipped' would age 30 different orders and the escalation list would name customers who were never refunded." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Oldest first means DESC on age — probed top: order 7 at 424 days, then order 21 at 348. ASC would escalate the newest cancellation (55 days) and the committee would chase the wrong file." },
      { answer: "2", kind: "number", noVerify: true, label: "the escalation cap",
        why: "The committee escalates two cases, so LIMIT 2 — probed, that keeps order 7 (2024-01-02, 424 days) and order 21 (2024-03-18, 348 days) and drops the 242-day case to the watch list." },
    ],
    distractors: ["date", "shipped", "ASC", "5"],
    walkthrough:
      "Aging is Julian arithmetic: julianday('2025-03-01') anchors at 2460735.5, julianday(created_at) converts each cancellation's date, and the difference CAST to INTEGER is whole days — probed ladder: order 7 at 424, order 21 at 348, order 50 at 242, order 51 at 219, order 83 at 117, order 82 at 97, order 95 at 55. ORDER BY age DESC + LIMIT 2 hands the committee the two oldest files: the 2024-01-02 cancellation (152.52) and the 2024-03-18 one (136.11). The trap the brief warns about is real: date(created_at) returns text, and SQLite's arithmetic on those strings produces 2458711 — a number shaped like an age and wrong by six orders of magnitude. ASC escalates the freshest case instead, and cap 5 turns a two-name escalation into a committee meeting.",
  },
  {
    id: "cs-1273",
    tier: "easy",
    topic: "w2",
    universe: "pricing",
    title: "Which month holds the whale",
    brief:
      "Pricing review: the biggest single order in the store's history needs a month attached for the elasticity deck, and the draft kept averaging instead of taking the max. The query must bucket by month, take each month's largest order, and surface the month holding the storewide maximum. Rebuild it and keep the whale's month.",
    ask: "Find each month's maximum order total and keep the month holding the single biggest order.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, {2}(total) AS big\nFROM orders\nGROUP BY mon\nORDER BY big {3}\nLIMIT 1;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the 14 month buckets year-tagged — probed, the whale lives in 2024-10. '%m' alone would label the winning row '10' and the deck would lose the year; '%d' would credit day '04' instead." },
      { answer: "MAX", kind: "keyword", label: "the max aggregator",
        why: "The whale is MAX(total) per bucket — probed, 2024-10's max is 1088.44, the storewide ceiling. AVG would report 2024-01's 466.50 basket average and the deck would cite a number no single order ever hit." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Biggest first means DESC on the max column — probed ladder: 2024-10 1088.44, then 2024-06 945.21, 2024-05 845.92. ASC would surface 2024-07's 306.92, the weakest monthly ceiling." },
    ],
    distractors: ["%m", "MIN", "SUM", "ASC"],
    walkthrough:
      "Finding a whale is a max-then-rank: strftime('%Y-%m', created_at) folds the 103 orders into 14 month buckets, MAX(total) takes each month's ceiling, and ORDER BY big DESC + LIMIT 1 surfaces the month holding the storewide maximum — probed, 2024-10 at 1088.44 (order 74, a pending 1088.44 booked on 2024-10-04). The runner-up months matter for the deck's context: 2024-06's 945.21 and 2024-05's 845.92, down to 2024-07's modest 306.92. The near-miss aggregates all answer plausible-looking questions: AVG prints 2024-01's 466.50 mean (a value no single order attained), SUM reports January's 3731.97 month spend, and MIN hands over 2024-01's 152.52 floor — each a different memo wearing the same query.",
  },
  {
    id: "cs-1274",
    tier: "medium",
    topic: "w2",
    universe: "inventory",
    title: "Ship-month pairs",
    brief:
      "Inventory count: the outbound audit wants the months where exactly 2 orders shipped — by ship date, not order date, because the dock cares when boxes left. The draft lost its date column, its pin, and its format code in the freeze. Rebuild the census so it buckets shipped orders by shipped_at month and pins the pairs.",
    ask: "Count shipped orders per shipped_at month and keep the months with exactly 2 shipments.",
    template:
      "SELECT strftime('{1}', {2}) AS mon, COUNT(*) AS n\nFROM orders\nWHERE status = 'shipped'\nGROUP BY mon {3} n = {4}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the ship months year-tagged — probed, the 30 shipped orders spread over 13 shipped_at buckets. '%m' alone would fuse same-numbered months across years and double-count the pairs." },
      { answer: "shipped_at", kind: "keyword", label: "the ship-date column",
        why: "The dock audits departures, so the bucket key is shipped_at — probed, its census differs from created_at's (2025-02 shipped 1 order but was created 2). created_at would answer 'when ordered', not 'when shipped'." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The pairs pin applies to folded ship-month buckets, so HAVING — WHERE n = 2 is a syntax error pre-fold. Probed: five months survive." },
      { answer: "2", kind: "number", label: "the pairs pin",
        why: "Probed: exactly 2 orders shipped in 2024-03, 2024-06, 2024-08, 2024-09 and 2024-12. Pin 3 instead and the report lists 2024-01, 2024-02 and 2024-07 — a different dock schedule." },
    ],
    distractors: ["%m", "created_at", "WHERE", "3"],
    walkthrough:
      "Outbound audits bucket by departure: strftime('%Y-%m', shipped_at) labels each of the 30 shipped orders with the month its box actually left, and COUNT(*) folds them into 13 ship-month buckets — probed, exactly five months closed with a pair: 2024-03, 2024-06, 2024-08, 2024-09 and 2024-12. The subtle trap is the column: bucket created_at instead and the census answers 'when ordered' — its pairs land on 2024-06, 08, 09, 12 and 2025-02, one month different, and the dock schedule ships on the wrong Friday. '%m' alone strips the years and fuses the two years' months into 12 buckets, and pin 3 flips the report to the three-shipment months (2024-01, 2024-02, 2024-07). HAVING is the only pin that exists after the fold.",
  },
  {
    id: "cs-1275",
    tier: "hard",
    topic: "w2",
    universe: "funnel",
    title: "Monthly active buyers",
    brief:
      "Marketing funnel: the growth model needs a monthly active-buyer series — distinct customers who ordered each month — and it broke when someone swapped the distinct counter for a plain one; the model then read repeat-heavy months as bigger audiences. The series also needs its peak months pinned at exactly 7 distinct buyers. Rebuild the series over the order months.",
    ask: "Count distinct buying customers per order month and keep the months with exactly 7.",
    template:
      "SELECT strftime('{1}', created_at) AS mon, {2}(DISTINCT customer_id) AS buyers\nFROM orders\nGROUP BY mon {3} buyers = {4}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps the 14 order months year-tagged — probed buyer counts 5/5/7/6/6/5/5/5/7/6/5/4/5/6. '%m' alone would fuse the two years' months into 12 buckets and distort the active series." },
      { answer: "COUNT", kind: "keyword", label: "the distinct counter",
        why: "COUNT(DISTINCT customer_id) collapses repeat orders back to people — probed, 2024-03 and 2024-09 each had 7 distinct buyers. SUM(DISTINCT customer_id) would add the ids (huge numbers) and no month could match the pin." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The peak pin applies to folded month groups, so HAVING — WHERE buyers = 7 is a syntax error pre-fold. Probed: exactly two months survive the pin." },
      { answer: "7", kind: "number", label: "the 7-buyer pin",
        why: "Probed: 2024-03 and 2024-09 are the peak months with exactly 7 distinct buyers each. Pin 5 instead and seven ordinary months flood the model's peak list." },
    ],
    distractors: ["%m", "SUM", "WHERE", "5"],
    walkthrough:
      "Active buyers are people, not orders: COUNT(DISTINCT customer_id) over month buckets built by strftime('%Y-%m', created_at) collapses the 103 orders into a buyer series — probed 5/5/7/6/6/5/5/5/7/6/5/4/5/6 across 14 months, against just 16 customers storewide. HAVING buyers = 7 pins the two peak months, 2024-03 and 2024-09, which are also the months that booked 8 and 9 orders — repeats, not reach, made them big. The failure the brief describes is one word deep: COUNT without DISTINCT counts orders and would read repeat-heavy months as audience growth. '%m' alone fuses same-numbered months across the two years, and pin 5 turns the peak list into seven routine months — the model would then 'discover' peaks everywhere.",
  },
  {
    id: "cs-1276",
    tier: "hard",
    topic: "w2",
    universe: "supplier",
    title: "Shenzhen's peak month",
    brief:
      "Supplier audit: the Asia lane review needs Shenzhen Electro's biggest month by distinct orders, and the report must survive the line-item fanout that inflated last quarter's numbers. The draft lost its format code, its pin, and half its supplier filter in the migration. Rebuild the monthly distinct census for Shenzhen and pin the six-order month.",
    ask: "Count Shenzhen Electro's distinct orders per month and keep the months with exactly 6.",
    template:
      "SELECT strftime('{1}', o.created_at) AS mon, {2}(DISTINCT o.id) AS n\nFROM orders o\nJOIN order_items oi ON oi.order_id = o.id\nJOIN products p ON p.id = oi.product_id\nJOIN suppliers s ON s.id = p.supplier_id\nWHERE s.name = '{3}'\nGROUP BY mon {4} n = {5}\nORDER BY mon;",
    slots: [
      { answer: "%Y-%m", kind: "keyword", label: "the bucket format",
        why: "'%Y-%m' keeps Shenzhen's months year-tagged — probed ladder over 13 buckets with 2024-09 the peak at 6. '%m' alone would fuse same-numbered months across years and smear the peak." },
      { answer: "COUNT", kind: "keyword", label: "the distinct counter",
        why: "COUNT(DISTINCT o.id) survives the line-item fanout — probed, Shenzhen is 41 distinct orders across 47 line rows. SUM(DISTINCT o.id) would add order ids together and print numbers no lane review can use." },
      { answer: "Shenzhen Electro", kind: "keyword", label: "the supplier filter",
        why: "The lane review targets Shenzhen Electro — probed, that name matches supplier 2 with 41 orders. 'Nordic Gadgets AB' is a different supplier whose monthly ladder tops out at 4, not 6." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The 6-order pin applies to folded month groups, so HAVING — WHERE n = 6 is a syntax error on this joined shape. Probed: exactly one month survives." },
      { answer: "6", kind: "number", label: "the 6-order pin",
        why: "Probed: 2024-09 is Shenzhen's peak with exactly 6 distinct orders — every other month is 5 or fewer. Pin 4 instead and the report leads with 2024-04's routine month." },
    ],
    distractors: ["%m", "Nordic Gadgets AB", "WHERE", "4"],
    walkthrough:
      "Lane volume needs distinct orders, because the four-way join fans each order into one row per line item: COUNT(DISTINCT o.id) under strftime('%Y-%m', o.created_at) buckets Shenzhen Electro's 41 orders into 13 year-tagged months — probed ladder 3/5/3/4/5/2/3/6/1/2/3/2/2 with the peak at 2024-09's 6. HAVING n = 6 pins the peak for the review, and the WHERE names the supplier so the lane can't silently drift. The near-misses all read plausibly: 'Nordic Gadgets AB' runs the same query on the wrong supplier (its ceiling is 4, in three different months), pin 4 surfaces a routine month instead of the peak, and '%m' alone fuses the years so the '09' bucket would carry 2024's peak with no year attached to defend it.",
  },
  {
    id: "cs-1277",
    tier: "hard",
    topic: "w2",
    universe: "expense",
    title: "Quarterly burn",
    brief:
      "Spend report: the finance committee wants the single quarter that burned the most operating cash, computed from the expense ledger — and SQLite again refuses to hand over a quarter, so the month-number trick has to come back. The draft lost its format code and its cap during the freeze. Rebuild the quarterly burn ladder and surface the hottest quarter.",
    ask: "Compute quarters from expense dates, sum the burn per quarter, rank hottest first, keep the top one.",
    template:
      "SELECT ((CAST(strftime('{1}', spent_on) AS INTEGER) + 2) / 3) AS q, strftime('%Y', spent_on) AS yr, ROUND(SUM(amount_cents)/100.0, 2) AS burn\nFROM expenses\nGROUP BY yr, q\nORDER BY burn {2}\nLIMIT {3};",
    slots: [
      { answer: "%m", kind: "keyword", label: "the month feed",
        why: "The quarter formula eats month numbers — (CAST(strftime('%m', …) AS INTEGER) + 2) / 3 maps 01–03 → 1 … 10–12 → 4 — probed, 36 expense rows fold into five (yr, q) groups. '%Y' feeds the year into the formula and prints a phantom quarter 675." },
      { answer: "DESC", kind: "keyword", label: "the sort direction",
        why: "Hottest quarter first means DESC on burn — probed ladder: 2024-Q3 6549, Q4 5443, Q1 5076, Q2 4739, 2025-Q1 3609. ASC would surface the coolest quarter and the committee would flag the wrong period." },
      { answer: "1", kind: "number", noVerify: true, label: "the row cap",
        why: "The committee wants one period, so LIMIT 1 — probed, that keeps q 3 / yr 2024 / 6549, the quarter holding August's 3210 spike. The cap value is a row limit, not a figure from the data." },
    ],
    distractors: ["%Y", "%d", "ASC", "2"],
    walkthrough:
      "The quarter is computed, not stored: strftime('%m', spent_on) yields '01'…'12', CAST to INTEGER, and (m + 2) / 3 folds months into quarters — probed burns of 5076 (2024-Q1), 4739 (Q2), 6549 (Q3), 5443 (Q4) and 3609 (2025-Q1). ORDER BY burn DESC + LIMIT 1 isolates the committee's answer: 2024-Q3 at 6549, the quarter that contains August's 3210 month (Travel 1680 alone). Feed the formula '%Y' instead and it computes (2024 + 2) / 3 = 675 — one phantom quarter per year with a 21807 burn that matches no filing calendar. '%d' feeds day-of-month and shreds the ledger into day-numbered fragments, ASC crowns the coolest quarter, and cap 2 hands the committee a runner-up it never asked to see.",
  },
  {
    id: "cs-1278",
    tier: "medium",
    topic: "w2",
    universe: "growth",
    title: "Week-number twins",
    brief:
      "Growth board deck: the ops annex wants the busiest weeks of the order calendar by SQLite's %W week number, pinned to the six-order weeks so the annex can quote them as a pair. The draft's format code and pin were lost in the refactor and it now prints every week. Rebuild the week census from the orders table.",
    ask: "Bucket orders by %W week number and keep the weeks with exactly 6 orders.",
    template:
      "SELECT strftime('{1}', created_at) AS wk, {2} AS n\nFROM orders\nGROUP BY wk {3} n = {4}\nORDER BY wk;",
    slots: [
      { answer: "%W", kind: "keyword", label: "the week code",
        why: "'%W' is SQLite's week-of-year code — probed, 103 orders fold into 42 week buckets with the peaks at '01' and '06'. '%w' is the weekday code (7 buckets, max 20) and '%j' the day-of-year code (no bucket can reach 6)." },
      { answer: "COUNT(*)", kind: "keyword", label: "the counter",
        why: "COUNT(*) counts orders folded into each week bucket — probed, weeks '01' and '06' hold 6 each. SUM(total) would print weekly spend and no week would match the pin." },
      { answer: "HAVING", kind: "keyword", label: "the group filter",
        why: "The six-order pin applies to folded week buckets, so HAVING — WHERE n = 6 is a syntax error pre-fold. Probed: exactly two rows survive, the annex's twins." },
      { answer: "6", kind: "number", label: "the six-order pin",
        why: "Probed: weeks '01' and '06' are the only buckets with exactly 6 orders — the annex's pair. Pin 5 instead and the row becomes week '07' (5 orders), a different twin set." },
    ],
    distractors: ["%w", "%d", "7", "WHERE"],
    walkthrough:
      "Week bucketing is just another format code — until you pick the wrong one: strftime('%W', created_at) folds the 103 orders into 42 week-of-year buckets, probed with two peaks of 6 at weeks '01' and '06' and week '07' at 5. COUNT(*) counts each bucket and HAVING n = 6 keeps exactly the annex's twins. The near-miss codes are the whole lesson: '%w' is the weekday code (Sunday–Saturday, probed census 16/20/16/16/9/18/8 — no bucket can equal 6), '%j' is day-of-year and fragments into 80 buckets of 1–3, and '%d' is day-of-month, whose 25 buckets top out at 7 and whose 6-order days ('04', '13', '19') are day-of-month buckets that each smear three or four different calendar dates — probed, '04' spans 2024-03/10/11/12-04 — plausible rows that would send the annex chasing calendar fragments instead of weeks. Pin 7 instead and even the true peaks drop out of their own annex.",
  },
];
