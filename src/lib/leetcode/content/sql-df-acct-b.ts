// Deep-dives — Data & Finance accounting batch B: FIFO inventory COGS,
// deferred revenue recognition and journal gap detection (3 problems:
// 1 Hard, 2 Medium, all order:"exact" reads). Every money column is INTEGER
// cents with the _cents suffix; own tables, own seeds, original phrasing —
// never copied problem text. NEW IN THIS BATCH: every dive carries a
// primer — the finance concept taught from zero, before any SQL.
// Registry wiring (lead): 8040 fifo-inventory-cogs ·
// 8041 deferred-revenue · 8042 journal-gap-detection.
import type { LcSqlDive } from "../types";

export const SQL_DF_ACCT_B: LcSqlDive[] = [
  {
    slug: "fifo-inventory-cogs",
    statement:
      "The batches table holds one row per purchase lot: (batch_id, batch_date, units, unit_cost_cents), and the sales table holds one row per sale: (sale_id, sale_date, units). Both streams are chronological, and every sale is fully coverable by the batches dated before it. Under FIFO the oldest purchased units sell first: each sale drains the earliest remaining units and crosses into the next batch whenever a layer runs out mid-sale. Compute each sale's cost of goods sold from the exact layers it consumes and report the columns sale_id, units_sold and cogs_cents — one row per sale, ordered by sale_id ascending.",
    examples: [
      {
        input: "sale 1 — 80 units on 2026-01-07, with batch 1 (100 units at 300 cents) the only stock on the shelf",
        output: "1 · 80 · 24000",
        explanation:
          "FIFO drains the oldest layer first: all 80 units come off batch 1 at 300 cents, so cogs_cents = 80 * 300 = 24000 and batch 1 keeps 20 units for the next sale.",
      },
      {
        input: "sale 2 — 60 units on 2026-01-15, with batch 1 down to its last 20 units and batch 2 (150 units at 320 cents) behind it",
        output: "2 · 60 · 18800",
        explanation:
          "The sale strips batch 1's 20 leftovers at 300 (6000 cents) then reaches into batch 2 for 40 units at 320 (12800 cents): one sale, two layers, 6000 + 12800 = 18800.",
      },
    ],
    constraints: [
      "both streams are chronological — batches by (batch_date, batch_id), sales by (sale_date, sale_id) — and every sale is fully coverable by the batches dated before it, so FIFO never reaches into a future batch",
      "the pinned FIFO construction: cum_sold_before and cum_sold_through ride each sale (window sums over sale_date, sale_id), cum_supply_before and cum_supply_through ride each batch (window sums over batch_date, batch_id), and units_taken(batch, sale) = MAX(0, MIN(cum_supply_through - cum_sold_before, batch units, sale units, cum_sold_through - cum_supply_before)) — the clamped overlap of the two cumulative spans, with the sale-size term as the safety clamp for a sale sitting wholly inside one batch",
      "all money is INTEGER cents: cogs_cents = SUM(units_taken * unit_cost_cents) per sale — units and unit costs are integers and no float ever reaches the output",
      "one row per sale with the columns sale_id, units_sold, cogs_cents, ORDER BY sale_id ASC; same-day sales would consume in sale_id order",
    ],
    primer: {
      hook: "Cost of goods sold is the price tag of the exact crates you happened to sell from — sell from a different crate and the profit changes.",
      concept: [
        "A shop rarely pays the same price for the same product twice. Every purchase arrives as its own layer — a batch of units with its own quantity and its own unit cost — and the shelf quietly stacks these layers up over time. The shelf itself never remembers what a unit cost; only the purchase records do. So when units go out the door, someone has to decide which layer they came from, and that decision is a whole accounting policy.",
        "COGS — cost of goods sold — is the total cost of the units a sale consumed, priced at their layer costs. Revenue minus COGS is gross margin, the first profit line every finance team watches. FIFO (first in, first out) says the oldest units sell first: drain the earliest layer, then the next, crossing layers mid-sale whenever one runs out. LIFO (last in, first out) says the newest sell first. In times of rising costs the two policies print different profits from identical physical sales — FIFO sells cheap units and shows a bigger margin and a bigger tax bill, LIFO sells expensive units and shows a smaller one, which is exactly why US GAAP allows LIFO and IFRS does not.",
        "The SQL problem is that FIFO looks sequential — drain, then refill from the next layer — and SQL thinks in sets. The trick is a cumulative unit axis: line every purchase up on a timeline where batch 1 owns units 0 through 99, batch 2 owns 100 through 249, and so on, and let each sale consume the next stretch of that axis. The units a sale takes from a batch is then the OVERLAP of two intervals, and interval overlap is a clamped MIN of cumulative sums — no looping, one formula.",
        "The same layers price the leftover shelf. After the sales, whatever units remain in each layer are the inventory on the balance sheet — under FIFO those remainders are the newest, most expensive units, so inventory value tracks recent prices. That is why a swing in the cost curve moves two numbers at once: COGS on the income statement and inventory value on the balance sheet, in opposite directions.",
      ],
      worked: [
        "Two crates sit on the shelf: crate A holds 10 units bought at 200 cents each, crate B holds 10 units bought later at 300 cents each.",
        "A customer buys 12 units. FIFO asks for the OLDEST units first, so crate A empties: 10 units leave at 200 cents.",
        "Two units are still owed — they come off crate B at 300 cents: 2 x 300 = 600 cents.",
        "COGS = 10 x 200 + 2 x 300 = 2000 + 600 = 2600 cents, and crate B still holds 8 units worth 8 x 300 = 2400 cents of inventory.",
        "The identical sale under LIFO would empty crate B first: 10 x 300 + 2 x 200 = 3400 cents — same goods, same price, different profit.",
      ],
      glossary: [
        { term: "COGS", def: "the total cost of the units actually sold, valued at what they cost to buy" },
        { term: "FIFO", def: "first in, first out — the oldest purchased units are the first ones sold" },
        { term: "LIFO", def: "last in, first out — the newest purchased units are the first ones sold" },
        { term: "inventory layer", def: "one purchase batch carrying its own unit count and unit cost" },
        { term: "cost flow assumption", def: "the rule that decides which layer's cost a sale consumes" },
        { term: "gross margin", def: "revenue minus COGS — the profit left before operating costs" },
      ],
      reallife: [
        "Inventory accountants at grocers, retailers and manufacturers run this costing every month: the warehouse system ships quantities, and finance turns them into COGS through the layer records. What breaks is boring and expensive — a purchase invoice priced differently than the receipt expected, or stock received in one month and billed in the next, shifts a layer's cost and every downstream margin report with it. When the layers are wrong, the gross margin the CEO quotes is wrong.",
        "The cost flow assumption is a real decision, not a detail. In times of rising costs FIFO sells the cheap layers first, printing higher margins and higher taxable income, while LIFO sells the expensive layers first and trims taxable profit — which is why US GAAP permits LIFO and IFRS refuses it. Analysts also watch the leftover shelf: under FIFO the inventory value tracks recent prices, so a margin squeeze plus a bloated inventory value is an early warning.",
      ],
      where: "Inventory accountants, supply-chain finance teams and data analysts at grocers, e-commerce warehouses and manufacturers — plus big-4 audit practices — work this exact layer-costing computation.",
    },
    breakdown: [
      "The ask is per-sale cost of goods sold, and the hard part is invisible in the output: WHICH units each sale consumed. FIFO answers with a timeline — line the purchases up on a cumulative unit axis (batch 1 owns units 0-100, batch 2 owns 100-250, batch 3 owns 250-450) and let each sale consume the next stretch of that axis (sale 1 takes 0-80, sale 2 takes 80-140, sale 3 takes 140-320). A sale's take from a batch is then just the OVERLAP of the two stretches, and overlap of cumulative intervals is a clamped MIN of the four pairwise gaps. Sequential bookkeeping becomes one set formula over a cross join.",
      "The classic missteps all re-price the same physical sales. LIFO consumes newest-first and books 24800 / 18600 / 57000 on this seed — sale 1 alone pays 800 more cents because its 80 units price at batch 3's 310 instead of batch 1's 300. Average cost blurs the layers into one blended 311.11 cents per unit (140000 cents across 450 units) and books 24889 / 18667 / 56000 — no sale matches. Dropping the MAX(0, ...) clamp is the sneakiest: negative overlaps fan into the SUM and the report reads -35100 / -15300 / 44900.",
      "The engine needs three moving parts and none of them loops. Two window passes build the cumulative spans (ordered sale_date, sale_id and batch_date, batch_id so ties break by id); the cross join pairs every sale with every batch and clamps each pair to its overlap; the final GROUP BY folds the positive layers into per-sale cents. The WHERE units_taken > 0 is not decoration — the negative layers it drops would otherwise corrupt the sums, as the no-clamp probe above shows. All money stays INTEGER cents because every input is an integer and the clamp only ever passes integers through.",
    ],
    edges: [
      "The LIFO reading flips the cents: reversing the supply windows consumes newest-first and books 24800 / 18600 / 57000 instead of 24000 / 18800 / 56900 — sale 1 alone books 800 more cents because its 80 units price at batch 3's 310 instead of batch 1's 300.",
      "The average-cost reading blurs the layers: one blended 140000 / 450 = 311.11 cents per unit books 24889 / 18667 / 56000 — none of the three sales matches the pinned FIFO cents.",
      "Dropping the MAX(0, ...) clamp lets the cross join fan negative layers into the SUM: sale 1 reads -35100, sale 2 -15300 and sale 3 44900 — the WHERE units_taken > 0 filter is doing real work.",
      "Two sales on the same sale_date would consume in sale_id order — the cumulative windows order by (sale_date, sale_id) so the unit axis never double-books — this seed keeps dates distinct but the tie-break is pinned by the constraint.",
    ],
    ladder: [
      { title: "Brute force — drain layers by hand", body: "Keep a running leftover per batch and, for each sale in date order, walk the batches oldest-first subtracting units and accumulating cost until the sale is filled. Correct for three sales, unrunnable for a warehouse of thousands — and one mis-tracked leftover corrupts every later sale." },
      { title: "The pattern — cumulative intervals", body: "Batch b owns the cumulative span (cum_supply_before, cum_supply_through) and sale s consumes (cum_sold_before, cum_sold_through); the layer take is the clamped overlap of the two spans. The sequential walk becomes interval arithmetic over a cross join." },
      { title: "The optimal idea — overlap, then fold", body: "Two window passes sort each timeline once, the cross join does constant work per (sale, batch) pair, and one GROUP BY folds the positive layers per sale. The durable rule: sequential consumption of a shared resource is cumulative-interval overlap, never a cursor." },
    ],
    approach: "two cumulative-span window CTEs, a CROSS JOIN with a clamped MIN overlap per (sale, batch) pair, then a per-sale SUM of units_taken * unit_cost_cents",
    schema: {
      ddl: `CREATE TABLE batches (
  batch_id        INTEGER PRIMARY KEY,
  batch_date      TEXT NOT NULL,     -- 'YYYY-MM-DD', chronological with batch_id
  units           INTEGER NOT NULL,
  unit_cost_cents INTEGER NOT NULL
);
CREATE TABLE sales (
  sale_id   INTEGER PRIMARY KEY,
  sale_date TEXT NOT NULL,           -- 'YYYY-MM-DD', chronological with sale_id
  units     INTEGER NOT NULL
);`,
      seed: `-- the supply axis: batch 1 owns units 0-100 at 300 cents, batch 2 owns
-- 100-250 at 320, batch 3 owns 250-450 at 310 (450 units, 140000 cents)
INSERT INTO batches (batch_id, batch_date, units, unit_cost_cents) VALUES
  (1, '2026-01-05', 100, 300),
  (2, '2026-01-12', 150, 320),
  (3, '2026-01-20', 200, 310);
-- the sold axis: 80 units on 01-07, 60 on 01-15, 180 on 01-22 — after the
-- three sales batch 3 keeps 130 units (batches 1 and 2 end fully consumed)
INSERT INTO sales (sale_id, sale_date, units) VALUES
  (1, '2026-01-07', 80),
  (2, '2026-01-15', 60),
  (3, '2026-01-22', 180);`,
      tables: [
        { name: "batches", note: "3 purchase batches — 100 units at 300 cents, 150 at 320, 200 at 310, totalling 450 units for 140000 cents" },
        { name: "sales", note: "3 sales — 80, 60 and 180 units, all coverable by the batches dated before them" },
      ],
    },
    code: `WITH sold AS (
    -- cumulative units sold strictly BEFORE and THROUGH each sale, in
    -- (sale_date, sale_id) order — the first row's 1 PRECEDING sum is
    -- empty, so COALESCE pins it to 0
    SELECT
        sale_id,
        units,
        COALESCE(SUM(units) OVER (ORDER BY sale_date, sale_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS cum_sold_before,
        SUM(units) OVER (ORDER BY sale_date, sale_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_sold_through
    FROM sales
),
supply AS (
    -- cumulative units stocked strictly BEFORE and THROUGH each batch,
    -- in (batch_date, batch_id) order — the purchase-side unit axis
    SELECT
        batch_id,
        unit_cost_cents,
        units,
        COALESCE(SUM(units) OVER (ORDER BY batch_date, batch_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING), 0) AS cum_supply_before,
        SUM(units) OVER (ORDER BY batch_date, batch_id
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cum_supply_through
    FROM batches
),
layers AS (
    -- every sale x batch pair takes the CLAMPED overlap of the two
    -- cumulative spans: the MIN of the four pairwise gaps floored at 0
    -- (the sale-size term guards a sale sitting wholly inside one batch)
    SELECT
        s.sale_id,
        s.units AS units_sold,
        b.batch_id,
        b.unit_cost_cents,
        MAX(0, MIN(b.cum_supply_through - s.cum_sold_before,
                   b.units,
                   s.units,
                   s.cum_sold_through - b.cum_supply_before)) AS units_taken
    FROM sold s
    CROSS JOIN supply b
)
SELECT
    sale_id,
    units_sold,
    SUM(units_taken * unit_cost_cents) AS cogs_cents
FROM layers
WHERE units_taken > 0
GROUP BY sale_id
ORDER BY sale_id ASC;`,
    walkthrough: [
      "The sold CTE walks sales in (sale_date, sale_id) order and stamps each row with its cumulative position: sale 1 carries cum_sold_before 0 and cum_sold_through 80, sale 2 carries 80 and 140, sale 3 carries 140 and 320. The supply CTE does the same for batches — batch 1 spans 0 through 100 at 300 cents, batch 2 spans 100 through 250 at 320, batch 3 spans 250 through 450 at 310. Each CTE is one window pass, and the COALESCE pins the first row's empty 1 PRECEDING sum to 0.",
      "The layers CTE cross joins 3 sales with 3 batches and clamps each pair to its overlap: sale 1 takes MIN(100 - 0, 100, 80, 80 - 0) = 80 units of batch 1 and nothing else, sale 2 takes 20 of batch 1 (100 - 80) and 40 of batch 2 (140 - 100), and sale 3 takes 110 of batch 2 (250 - 140) and 70 of batch 3 (320 - 250). Every other pair collapses to a negative MIN that MAX(0, ...) floors to 0, and the WHERE units_taken > 0 drops those rows before they can cost anything. The 9-cell take matrix IS the whole FIFO story.",
      "The final SELECT folds the surviving layers per sale: sale 1 = 80 x 300 = 24000, sale 2 = 20 x 300 + 40 x 320 = 18800, sale 3 = 110 x 320 + 70 x 310 = 56900. GROUP BY sale_id keeps one row per sale with its units_sold riding along, and ORDER BY sale_id ASC ships the contract order. The same layers say batches 1 and 2 end empty while batch 3 keeps 130 units — the inventory side is the followUp.",
    ],
    time: "O(S x B) — every sale pairs with every batch once; the two window passes sort each table once",
    space: "O(S x B) — the cross join materializes in layers before the per-sale GROUP BY folds it",
    followUps: [
      "Report the remaining inventory — per batch, the units left and their value at unit_cost_cents — and confirm batch 3 keeps 130 units worth 40300 cents; which side of the same layers CTE produces it?",
      "Add a running_cum_cogs_cents column so each sale carries the cost of goods sold to date — does a window SUM over the finished per-sale rows do it, and what does it read on sale 3?",
    ],
    related: ["realized-pnl-average-cost", "daily-balance-interest", "settlement-fails-aging"],
    order: "exact",
    xp: 35,
  },
  {
    slug: "deferred-revenue",
    statement:
      "The subscriptions table holds one row per contract: (sub_id, customer_id, start_date, term_months, total_cents), where total_cents is exactly divisible by term_months. The customer paid everything up front, but revenue is earned one month at a time: month m (0-based) of a subscription is the calendar month containing date(start_date, '+' || m || ' months'), it carries the slice total_cents / term_months, and it is recognized under the label of the month its service starts in — no proration. Only month indexes 0 through term_months - 1 exist, so a term that physically brushes the next month still books nothing there. The report window is the fixed label set '2026-07', '2026-08' and '2026-09': report one row per subscription per window month it is active in — the columns sub_id, month and recognized_cents — ordered by sub_id ascending, then month ascending.",
    examples: [
      {
        input: "sub 2 — starts 2026-08-05 for 3 months at 21000 cents: 21000 / 3 = 7000 per service month",
        output: "2 · 2026-08 · 7000, then 2 · 2026-09 · 7000",
        explanation:
          "August is month index 0 and books the full 7000 under its start label — no proration for the 5th-of-month start — and July shows nothing because no service month starts there.",
      },
      {
        input: "sub 1 — starts 2026-06-10 for 12 months at 120000 cents: 120000 / 12 = 10000 per service month",
        output: "1 · 2026-07 · 10000, then 1 · 2026-08 · 10000, then 1 · 2026-09 · 10000",
        explanation:
          "Service months 0 through 11 carry labels 2026-06 through 2027-05; the window keeps indexes 1-3, and each books the flat integer slice 10000.",
      },
    ],
    constraints: [
      "total_cents is exactly divisible by term_months (constraint): monthly_cents = total_cents / term_months is the exact INTEGER slice — integer division, never REAL, no rounding",
      "month m (0-based) carries the label strftime('%Y-%m', date(start_date, '+' || m || ' months')) — the label of the month its service STARTS in — and the full slice books under that label with no proration, whatever day of the month the service starts",
      "month indexes run 0 through term_months - 1 only: index term_months sits past the term even when its label still looks in-term (sub 3's July)",
      "the report window is the fixed label set '2026-07', '2026-08', '2026-09'; one row per (sub, window month) matched, ORDER BY sub_id ASC, month ASC",
    ],
    primer: {
      hook: "The cash hit the bank on day one, but none of it is revenue yet — it gets earned one month at a time.",
      concept: [
        "A customer signs a 12-month plan and pays all 120000 cents on day one. The cash is real and the bank balance jumps — but the company has not EARNED anything yet, because earning means delivering the service. Accrual accounting, the standard everywhere in finance, books revenue when the service happens, not when the money moves. So on day one that 120000 is not profit; it is an obligation.",
        "The obligation sits on the balance sheet as deferred revenue (also called unearned revenue) — a liability, because the company owes a year of service in exchange for the cash. Each month that passes earns one-twelfth of the deal: 10000 cents move from the liability onto the income statement as recognized revenue, and the liability shrinks by the same amount. This monthly movement is the recognition schedule, and unwinding it correctly is a core job of a SaaS finance team.",
        "Two measures confuse everyone at first, so keep them apart: revenue is backward-looking — what the income statement has already earned — while ARR (annual recurring revenue) is forward-looking — the contracted yearly value of active subscriptions. A company can sign a huge contract and watch ARR jump while revenue barely moves, because the income statement lags the bank account by design. Deferred revenue is exactly the size of that lag.",
        "In data terms a recognition schedule is a calendar machine: for month index 0 through term minus 1, the calendar month where that month of service STARTS carries the slice total divided by term. No proration applies — a month that starts on the 28th still books its full slice under its own label. Label each service month by its start, keep the labels the report asks for, and the numbers fall out — the SQL below is that machine.",
      ],
      worked: [
        "A customer pays 3600 cents up front for a 3-month plan that starts in March.",
        "Payment day: cash up 3600, revenue 0 — the 3600 sits as the deferred-revenue liability, money owed back in service.",
        "March (month index 0): 3600 / 3 = 1200 cents are earned, and the liability drops to 2400.",
        "April and May each earn another 1200, and after May the liability reads 0 — the plan is fully earned.",
        "A July-to-September report window would show nothing for this plan: its three service months carry the labels 2026-03, 2026-04 and 2026-05.",
      ],
      glossary: [
        { term: "deferred revenue", def: "cash collected before the service is delivered, held as a liability" },
        { term: "recognition", def: "moving one period's slice of deferred revenue into earned revenue" },
        { term: "accrual accounting", def: "booking revenue when it is earned, not when cash arrives" },
        { term: "liability", def: "an obligation the company still owes, carried on the balance sheet" },
        { term: "ARR", def: "annual recurring revenue — the contracted yearly value of active subscriptions" },
        { term: "term", def: "the contracted length of a subscription, counted in months" },
      ],
      reallife: [
        "Revenue accountants at SaaS companies run this schedule every close: the billing system collects the cash, the revenue sub-ledger earns it, and the two must tie to the cent. What breaks is the boundary work — a 12-month plan quietly earning a thirteenth month, or a start month booked as a stub instead of a full month. The unwind feeds the balance sheet (deferred revenue) and the income statement (revenue) in one motion.",
        "The numbers drive real decisions. CFOs guide on revenue while sales teams celebrate ARR, and the gap between the two is exactly the deferred-revenue balance; auditors test cutoffs (does December's cash belong in December's revenue); investors read retention off the same schedules. A missed month of recognition misstates margin for a whole quarter, and an understated liability hides what the company still owes in service.",
      ],
      where: "Revenue accountants, SaaS finance teams, auditors running cutoff tests and analysts at subscription businesses from streaming platforms to enterprise software meet this schedule every close.",
    },
    breakdown: [
      "The cash for every subscription arrived on start_date, yet none of it is revenue on day one — accrual accounting earns it across the term, one month at a time, and the unearned rest sits on the balance sheet as the deferred-revenue liability. The report answers a narrow slice of that unwind: how many cents does each subscription earn in July, August and September of 2026. Because the pinned rule books each service month under the label of the month its service STARTS in, the question reduces to a calendar mapping — which month indexes 0 through term_months - 1 carry window labels.",
      "Three missteps account for every wrong submission. Proration — trimming the start month because the subscription began on the 5th or the 15th — is explicitly ruled out: month index 0 books the full slice under its start label. The term-end off-by-one is the opposite error: sub 3's service physically touches July (the term runs to 2026-07-15), but the July label belongs to month index 6, one step past a 6-month term, so July books nothing. And filtering on a date RANGE instead of the label set invites partial-period drift that the pinned label equality never has.",
      "WITH RECURSIVE is the calendar machine. The spine seeds month index 0 per subscription and advances while idx + 1 < term_months, carrying term_months along so the step is self-contained; the recognized CTE joins back for start_date and stamps each index with its label and its exact integer slice (the divisibility constraint makes total_cents / term_months safe as pure integer division). The window filter is one IN over three text labels, and the ORDER BY is the contract's sub_id-then-month reading order. Twenty-one spine rows reduce to the five report rows.",
    ],
    edges: [
      "The term-end off-by-one: sub 3's term covers service starting 2026-01-15 through 2026-07-15, but the July label belongs to month index 6 — outside 0 through 5 — so July books nothing; letting the spine run to idx <= term_months adds (3, '2026-07', 8000) and breaks the contract.",
      "No proration: sub 2 starts on the 5th yet its first service month books the full 7000 under the August label — a days-based proration would read 6097 and fail.",
      "Sub 3 contributes zero rows: its labels run 2026-01 through 2026-06 and never meet the window — the 5-row result is complete, so do not restore the missing sub.",
      "The window filter matches the LABEL set ('2026-07', '2026-08', '2026-09'), not a date span — labels are text and compare exactly, while a BETWEEN on computed dates invites partial-month drift the pinned equality rules out.",
    ],
    ladder: [
      { title: "Brute force — write the calendar out", body: "For each subscription, write out its term_months calendar rows by hand, cross out the ones outside the window, and divide the total by the term. Fine for three subscriptions, unmanageable for a book of thousands — and the off-by-one hides in the hand-writing." },
      { title: "The pattern — a recursive month spine", body: "WITH RECURSIVE generates month indexes 0 through term_months - 1 per subscription, each index is labeled via date(start_date, '+' || idx || ' months'), and the slice is the exact integer division. Filter to the window labels and the report is done." },
      { title: "The optimal idea — generate only the term", body: "The spine emits exactly the sum of the terms (12 + 3 + 6 = 21 rows here) — no wasted generation, no date-range joins. The durable rule: recurring schedules are spine CTEs plus label math, and the window is a label IN list." },
    ],
    approach: "WITH RECURSIVE month spine per subscription, label each index via date(start_date, '+' || idx || ' months'), integer-divide total_cents by term_months, keep labels inside the fixed report window",
    schema: {
      ddl: `CREATE TABLE subscriptions (
  sub_id      INTEGER PRIMARY KEY,
  customer_id INTEGER NOT NULL,
  start_date  TEXT NOT NULL,         -- 'YYYY-MM-DD'
  term_months INTEGER NOT NULL,
  total_cents INTEGER NOT NULL        -- exactly divisible by term_months
);`,
      seed: `-- sub 1 earns 10000 a month from 2026-06 through 2027-05 · sub 2 earns
-- 7000 a month from 2026-08 through 2026-10 · sub 3 finished earning in
-- June — its July label would be month index 6, one past the term
INSERT INTO subscriptions (sub_id, customer_id, start_date, term_months, total_cents) VALUES
  (1, 501, '2026-06-10', 12, 120000),
  (2, 502, '2026-08-05',  3,  21000),
  (3, 503, '2026-01-15',  6,  48000);`,
      tables: [
        { name: "subscriptions", note: "3 subscriptions — a 12-month at 10000 a month, a 3-month at 7000, a 6-month at 8000, all totals exactly divisible" },
      ],
    },
    code: `WITH RECURSIVE months(sub_id, term_months, idx) AS (
    -- seed: month index 0 for every subscription, term carried along so
    -- the recursive step needs no lookup back to subscriptions
    SELECT sub_id, term_months, 0 FROM subscriptions
    UNION ALL
    -- step: advance while the NEXT index is still inside the term —
    -- idx + 1 < term_months is exactly the clause that stops sub 3
    -- before its phantom July (index 6 of a 6-month term)
    SELECT sub_id, term_months, idx + 1 FROM months
    WHERE idx + 1 < term_months
),
recognized AS (
    -- each service month carries the label of the month it STARTS in,
    -- and the slice is the exact integer division pinned by the
    -- divisibility constraint — no REAL, no proration
    SELECT
        m.sub_id,
        strftime('%Y-%m', date(s.start_date, '+' || m.idx || ' months')) AS month,
        s.total_cents / s.term_months AS recognized_cents
    FROM months m
    JOIN subscriptions s ON s.sub_id = m.sub_id
)
SELECT
    sub_id,
    month,
    recognized_cents
FROM recognized
WHERE month IN ('2026-07', '2026-08', '2026-09')
ORDER BY sub_id ASC, month ASC;`,
    walkthrough: [
      "The spine seeds month index 0 for every subscription and advances while the next index is still inside the term: sub 1 emits indexes 0 through 11, sub 2 emits 0 through 2, sub 3 emits 0 through 5 — 21 rows total, each carrying its sub_id and a copy of term_months so the step needs no lookup. The WHERE idx + 1 < term_months is the terminator, and it is exactly the clause whose lazy variant (idx + 1 <= term_months) manufactures sub 3's phantom July. Nothing else in the query knows the term — the spine is the term.",
      "The recognized CTE joins each spine row back to its subscription and labels it with strftime('%Y-%m', date(start_date, '+' || idx || ' months')). Sub 1 labels 2026-06 through 2027-05, sub 2 labels 2026-08, 2026-09 and 2026-10, sub 3 labels 2026-01 through 2026-06. The slice is integer division on pinned-exact numbers: 120000 / 12 = 10000, 21000 / 3 = 7000, 48000 / 6 = 8000.",
      "The window filter keeps the five rows whose labels sit in the report set: sub 1's indexes 1-3 and sub 2's indexes 0-1. Sub 3 never matches and rightly contributes nothing. ORDER BY sub_id ASC, month ASC ships (1, '2026-07', 10000) through (2, '2026-09', 7000) in the contract order.",
    ],
    time: "O(M) over the M generated service months (12 + 3 + 6 = 21 here) — the spine touches each exactly once",
    space: "O(M) — the spine and the recognized rows materialize before the window filter",
    followUps: [
      "Extend the report with deferred_balance_cents — the liability still unearned after each report month — and decide whether a running SUM over the spine or a total-minus-running-SUM reads cleaner.",
      "Roll the recognition up to one row per report month across all subscriptions (Jul 10000, Aug 17000, Sep 17000) and note which join the roll-up makes unnecessary.",
    ],
    related: ["loan-amortization-schedule", "npv-queries", "gl-reconciliation"],
    order: "exact",
    xp: 20,
  },
  {
    slug: "journal-gap-detection",
    statement:
      "The journal_entries table holds one row per posting: (entry_id, doc_no, entry_date, memo), where doc_no is a unique, non-null document number stamped in an unbroken sequence. MIN(doc_no) and MAX(doc_no) bound the expected range, and a deletion punches a hole in it — the hole is the finding. Report every integer between MIN(doc_no) and MAX(doc_no) with no journal_entries row, as the single column missing_doc_no, ordered ascending. One read-only set-based statement — a generated sequence anti-joined against the file — replaces the procedural loop.",
    examples: [
      {
        input: "the file holds 1001 through 1012 except three numbers — the scan runs MIN 1001 to MAX 1012",
        output: "1004, then 1005, then 1010",
        explanation:
          "The recursive spine walks 1001 through 1012 and the NOT IN anti-join keeps only the three numbers with no journal row — two adjacent gaps (1004, 1005) and one later hole (1010).",
      },
      {
        input: "the same file scanned over a tighter register, 1006 through 1012 only",
        output: "1010",
        explanation:
          "Bounds define the scan: between 1006 and 1012 only 1010 is absent, so the tight register ships one row where the full scan ships three.",
      },
    ],
    constraints: [
      "doc_no is UNIQUE and NOT NULL across journal_entries, and MIN(doc_no) through MAX(doc_no) bound the expected sequence (constraint) — the scan tests nothing before MIN or after MAX",
      "missing_doc_no is every integer in [MIN(doc_no), MAX(doc_no)] with no journal_entries row — bounds inclusive, gaps only in the middle",
      "exactly one read-only set-based statement: a recursive spine plus one NOT IN anti-join — no procedural loop, no second statement, no temp table",
      "ORDER BY missing_doc_no ASC",
    ],
    primer: {
      hook: "Document numbers are a ruler printed on the ledger itself — rip a page out and the ruler shows the hole.",
      concept: [
        "Financial systems stamp every document they create with the next number in a sequence: journal entries, invoices, checks. The number is not decoration — it makes the record set self-describing. If the register ran from 1001 and the highest number on file is 1012, the file itself claims twelve documents should exist, and counting them needs no external index. A sequence is a ruler printed on the ledger.",
        "Real systems never delete an entry casually and never reuse its number. A mistake is VOIDED — the entry stays in the file, marked cancelled — because the audit trail matters more than tidiness. A DELETED entry, by contrast, leaves a hole, and a hole is evidence: something was removed, or something never got recorded. Auditors exploit exactly this with completeness testing.",
        "Completeness asks whether everything that should be in the books made it in; its sibling, existence, asks whether everything in the books should be there. Gap detection is the completeness side: generate the expected range from MIN to MAX and keep the numbers the file cannot produce. One honesty note — a hole at the very start or end is invisible to this scan, because the bounds themselves would move with the theft, so auditors test the sequence start against the register charter separately.",
        "The SQL shape is a generated sequence anti-joined against the file: a recursive CTE walks MIN to MAX one integer at a time, and NOT IN keeps the expected numbers with no match. One statement, fully set-based — procedural loops are how you miss a boundary, and SQL gives you the generator for free. The recursion is bounded by the file's own MIN and MAX, so the statement adapts to any register unchanged.",
      ],
      worked: [
        "The register charter says document numbers run in sequence, and the file holds 101, 102 and 105.",
        "MIN is 101 and MAX is 105, so the expected sequence is 101, 102, 103, 104, 105 — five numbers.",
        "Walk the expectation against the file: 101 is there, 102 is there, 103 is not, 104 is not, 105 is.",
        "The gaps are 103 and 104 — two document numbers that existed in the sequence but not in the file.",
        "If 101 itself had been deleted, MIN would read 102 and this scan would see nothing — boundary theft needs a separate test against the charter.",
      ],
      glossary: [
        { term: "journal entry", def: "one recorded accounting event, kept in the book of original entry" },
        { term: "document number", def: "the sequential identifier stamped on every entry as it is created" },
        { term: "completeness testing", def: "the audit check that nothing that should be recorded is missing" },
        { term: "voided entry", def: "an entry kept in the file but marked cancelled, never deleted" },
        { term: "audit trail", def: "the preserved evidence chain that lets reviewers reconstruct every change" },
        { term: "anti-join", def: "the rows of one set that find no match in another set" },
      ],
      reallife: [
        "Internal audit and SOX compliance teams run gap reports on invoice registers, check registers and journal ledgers at every close, and ERP vendors make deletion a privileged, logged action precisely so gaps stay rare and explainable. What breaks: an admin cleaning up test entries, a migration that renumbers documents, or an integration that skips a number on retry. Every gap needs a story — a void approval, a system note — or the finding escalates.",
        "Finance systems never reuse document numbers because reuse would destroy exactly this test: a reused number looks complete while hiding two events, the deleted original and the forged replacement. The output drives questions rather than verdicts — who signed the deletion, which control failed, whether cash moved. Fraud analytics extends the same scan to checks and invoices, where an unexplained gap is one of the oldest red flags on the books.",
      ],
      where: "Internal audit, SOX compliance and controllership teams, plus fraud analytics groups at banks and ERP vendors, run this exact completeness test.",
    },
    breakdown: [
      "The register is self-describing: because document numbers are stamped in an unbroken sequence, the file itself states what SHOULD exist — MIN(doc_no) through MAX(doc_no), 1001 through 1012 here. Completeness testing compares that expectation against the actual contents, and the difference IS the finding: three numbers with no posting. No external index, no control total, no second table — the ruler is printed on the ledger.",
      "The traps are all about the shape of the walk. Anchoring the spine at 0 (or any constant) reports every number outside the register's own range — 1001 phantom findings on this seed. Swapping the bounds — walking toward MIN instead of MAX — terminates the recursion after one step and ships an empty report, the worst kind of audit failure. And NOT IN has a documented Achilles heel: one NULL in the doc_no column makes every comparison unknown and empties the result, which is why the no-NULL constraint is load-bearing rather than decorative.",
      "The solution is one set-based statement. A recursive CTE generates the expected sequence — anchored at the scalar (SELECT MIN(doc_no)), stepped by 1, bounded by the scalar (SELECT MAX(doc_no)) — and one NOT IN anti-join keeps the expected numbers the file cannot produce. The aggregates live inside scalar subqueries precisely because a recursive member cannot aggregate its own table directly — the scalar subquery is the legal form. ORDER BY finishes the ascending report: 1004, 1005, 1010.",
    ],
    edges: [
      "No gap at the first or last position — by construction: the scan's bounds are MIN and MAX of what exists, so a stolen first or last number just moves the bound with it; auditors test the sequence START against the register charter separately.",
      "The no-NULL constraint is load-bearing: x NOT IN (a, b, NULL) is never TRUE, so a single NULL doc_no would empty the whole report — UNIQUE plus NOT NULL keeps the anti-join honest.",
      "The spine must anchor at (SELECT MIN(doc_no)), never a constant: anchoring at 0 sweeps in 0 through 1000 as missing too — 1004 findings on this seed, 1001 of them phantom, probed below.",
      "Swapped bounds kill the scan: a recursion bounded at MIN instead of MAX stops after one step and ships zero rows — the direction of the inequality is the whole test.",
    ],
    ladder: [
      { title: "Brute force — sort and eyeball", body: "Sort the document numbers, walk the sorted list, and whenever the next number skips ahead, emit the skipped integers. Works, but it is a cursor with sticky boundary cases at both ends of the range." },
      { title: "The pattern — generate, then anti-join", body: "A recursive CTE generates the full expected sequence anchored at MIN and bounded by MAX, and the anti-join expected NOT IN actual IS the gap list. The generation is data, not control flow." },
      { title: "The optimal idea — completeness as set difference", body: "The spine is exactly MAX - MIN + 1 rows (12 here) and the NOT IN probes a hashed set of actuals once per number. The durable rule: completeness is expected-minus-actual, and expected ranges are generated, never assumed." },
    ],
    approach: "recursive seq spine anchored at MIN(doc_no) and bounded by MAX via a scalar subquery, anti-joined against the file with NOT IN",
    schema: {
      ddl: `CREATE TABLE journal_entries (
  entry_id   INTEGER PRIMARY KEY,
  doc_no     INTEGER NOT NULL,       -- unique, no NULLs, min/max bound the sequence
  entry_date TEXT NOT NULL,          -- 'YYYY-MM-DD'
  memo       TEXT NOT NULL
);`,
      seed: `-- doc_no runs 1001 through 1012 with 1004, 1005 and 1010 missing from
-- the file: three gaps, none at the first or last position of the sequence
INSERT INTO journal_entries (entry_id, doc_no, entry_date, memo) VALUES
  (1, 1001, '2026-02-02', 'opening accrual reversal'),
  (2, 1002, '2026-02-03', 'office rent accrual'),
  (3, 1003, '2026-02-05', 'payroll journal week 5'),
  (4, 1006, '2026-02-10', 'bank fees'),
  (5, 1007, '2026-02-12', 'depreciation entry'),
  (6, 1008, '2026-02-16', 'prepaid insurance amortization'),
  (7, 1009, '2026-02-18', 'payroll journal week 7'),
  (8, 1011, '2026-02-24', 'vendor accrual'),
  (9, 1012, '2026-02-27', 'month-end close adjustment');`,
      tables: [
        { name: "journal_entries", note: "9 postings numbered 1001 through 1012 with 1004, 1005 and 1010 absent — three mid-sequence gaps" },
      ],
    },
    code: `WITH RECURSIVE seq(n) AS (
    -- anchor at the first document number actually on file — a scalar
    -- subquery, because a recursive member cannot aggregate its own table
    SELECT MIN(doc_no) FROM journal_entries
    UNION ALL
    -- walk one number at a time up to the last document number on file
    SELECT n + 1 FROM seq
    WHERE n < (SELECT MAX(doc_no) FROM journal_entries)
)
SELECT
    n AS missing_doc_no
FROM seq
WHERE n NOT IN (SELECT doc_no FROM journal_entries)
ORDER BY n ASC;`,
    walkthrough: [
      "The seq CTE anchors at SELECT MIN(doc_no) — 1001 on this file — and each recursive step emits n + 1 while n is still below (SELECT MAX(doc_no)) = 1012. The spine therefore holds exactly 1001 through 1012: twelve rows, every integer the register should contain. The bounds read live through the scalar subqueries, so the same statement works on any bounded file.",
      "The final SELECT anti-joins the spine against the file: WHERE n NOT IN (SELECT doc_no FROM journal_entries) keeps a spine number only when no posting carries it. 1001, 1002 and 1003 find rows and drop; 1004 and 1005 find nothing and stay; 1006 through 1009 drop; 1010 stays; 1011 and 1012 drop. Three numbers survive — the three deletions.",
      "ORDER BY n ASC ships the report ascending: 1004, 1005, 1010. The statement never loops in procedural terms — the recursion IS the loop, bounded by the file's own min and max. The projection renames n to missing_doc_no, so the one-column contract holds exactly.",
    ],
    time: "O(R) over the R expected numbers (MAX - MIN + 1 = 12 here); the NOT IN probes a hashed set of actuals",
    space: "O(R) — the spine holds the full expected sequence before the anti-join",
    followUps: [
      "Report each gap with its width and the doc numbers that bracket it (1003 guards 1004-1005) — which window function turns the one-column list into bracketed runs?",
      "Harden the audit: flag sequences whose FIRST number disagrees with the register charter (a stolen 1001 is invisible to the min-to-max scan) and decide what extra input that test needs.",
    ],
    related: ["gl-reconciliation", "bank-account-summary-ii", "sessionize-events"],
    order: "exact",
    xp: 20,
  },
];
