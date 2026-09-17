// Case batch X3 — Module 6 (Expert Clinic) cases cs-1536…cs-1550, wave 1.
// UNION ALL grand-total stacks — the TOTAL row SQLite's ROLLUP won't give you.
// Figures from the W1 receipt pool (m6-cases-w1-facts*.ts). Audited by
// scripts/case-audit.ts (x-laws: UNION ALL + TOTAL literal mandatory).
import type { CaseStudy } from "./types";

export const casesX3: CaseStudy[] = [
  {
    id: "cs-1536",
    tier: "easy",
    topic: "x3",
    universe: "month-close",
    title: "The status revenue stack",
    brief:
      "From: Finance ops. Re: the lane revenue table.\n\nThe close pack's revenue table lists each order lane's revenue and then a grand TOTAL row underneath — the row SQLite's GROUP BY refuses to print. Stack the lanes and append the labelled total in one query.",
    ask: "What does the lane revenue table look like with its labelled grand total stacked underneath?",
    template: `SELECT * FROM (
  SELECT status, ROUND(SUM(total), 2) AS rev FROM orders GROUP BY status
  UNION ALL
  SELECT {1}, ROUND(SUM(total), 2) FROM orders
) ORDER BY {2} {3};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the grand-row label",
        why: "The second arm has no GROUP BY, so it aggregates the whole table into one row — and 'TOTAL' is the label that marks it as the sum of everything above, not a fourth lane.",
      },
      {
        answer: "rev",
        kind: "keyword",
        label: "the stack sort key",
        why: "Sorting on rev puts the biggest lanes on top with the total's 34,833.28 crowning the stack. Sorting on status would alphabetize — cancelled first — and the total would land mid-table.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the stack direction",
        why: "Descending is the revenue read: delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49, then TOTAL. Ascending would bury the total at the bottom.",
      },
    ],
    distractors: ["'GRAND'", "status", "ASC"],
    walkthrough:
      "The stack is two SELECTs married by UNION ALL, and the marriage rules matter: both arms must project the same columns in the same order. Arm one groups by status and prints the four lanes — delivered 15,571.07, shipped 11,996.72, pending 6,113.00, cancelled 1,152.49. Arm two drops the GROUP BY entirely, so its SUM sweeps the whole table into a single row, labelled 'TOTAL', carrying 34,833.28. UNION ALL keeps both arms' rows verbatim — plain UNION would be wrong here by contract, even if dedup never fires. The outer ORDER BY sorts the merged stack by revenue descending, and the arithmetic self-audits: four lanes summing to exactly the TOTAL row. This is the grand-total pattern ROLLUP would have given you — hand-built, four lines, honest.",
  },
  {
    id: "cs-1537",
    tier: "easy",
    topic: "x3",
    universe: "growth",
    title: "The regional membership stack",
    brief:
      "From: Community team. Re: the membership board.\n\nThe membership board lists each region's member count, then one row for the whole house. Stack the regional counts and append the labelled total, deepest region first, so the board reads top-down.",
    ask: "What does the membership board look like with regional counts stacked above the house total?",
    template: `SELECT * FROM (
  SELECT region, COUNT(*) AS members FROM customers GROUP BY {3}
  UNION ALL
  SELECT {1}, COUNT(*) FROM customers
) ORDER BY members {2};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the house label",
        why: "The second arm counts all sixteen members with no GROUP BY — one row, and 'TOTAL' is the label that says house, not region. 'GRAND' would print the same numbers under a label the board doesn't use.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board order",
        why: "Deepest first is the board read: EU 8, APAC 5, US 2, LATAM 1, TOTAL 16 on top. Ascending would open on LATAM's lone member and the house total would trail at the bottom.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the board bucket",
        why: "Regions are the board's rows — four of them. Grouping by city would print sixteen one-member rows, a directory rather than a board, and the stack would lose its shape.",
      },
    ],
    distractors: ["'GRAND'", "ASC", "city"],
    walkthrough:
      "Two arms, one stack. Arm one buckets the sixteen members by region — EU 8, APAC 5, US 2, LATAM 1. Arm two has no GROUP BY, so its COUNT(*) sweeps the whole table into one 16-member row labelled 'TOTAL'; UNION ALL appends it verbatim. The outer ORDER BY sorts by member count descending, so the board reads EU, APAC, US, LATAM, TOTAL — deepest chapter first, house total crowning the stack, and 8 plus 5 plus 2 plus 1 equal to 16 as the built-in proof. Group by city instead and the board becomes sixteen rows of ones: same table, wrong altitude. The stack's discipline is the label — without 'TOTAL' the house row would masquerade as a fifth region.",
  },
  {
    id: "cs-1538",
    tier: "easy",
    topic: "x3",
    universe: "month-close",
    title: "The payment-rail stack",
    brief:
      "From: Finance. Re: the rails summary line.\n\nThe treasury summary shows each payment rail's volume in dollars, then one total row for the till. Stack the rails and append the labelled total, biggest rail first — and keep the cents-to-dollars divide intact.",
    ask: "What does the rails summary look like with each rail's dollar volume and the till total stacked?",
    template: `SELECT * FROM (
  SELECT method, ROUND(SUM(amount_cents) / {2}, 2) AS amt FROM payments GROUP BY {3}
  UNION ALL
  SELECT {1}, ROUND(SUM(amount_cents) / 100.0, 2) FROM payments
) ORDER BY amt DESC;`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the till label",
        why: "The second arm sums every payment into one row — 69,612.00 across both rails — and 'TOTAL' is the label that marks it as the till, not a third rail.",
      },
      {
        answer: "100.0",
        kind: "number",
        label: "the cents divider",
        why: "Amounts live in integer cents; dividing by 100.0 renders dollars — 37,364.00 for card. Dividing by 1.0 would print 3,736,400 cents into a dollar column and the till would balloon a hundredfold.",
        noVerify: true,
      },
      {
        answer: "method",
        kind: "keyword",
        label: "the rail bucket",
        why: "Rails are buckets of one: GROUP BY method prints card and wire as two rows. Bucketing by paid_on would explode the stack into per-day rows and the summary would stop being a summary.",
      },
    ],
    distractors: ["'GRAND'", "1.0", "paid_on"],
    walkthrough:
      "The rails stack is the grand-total pattern over integer money. Arm one groups the 27 payments by method — card 37,364.00 from 16 payments, wire 32,248.00 from 11 — each divided by 100.0 to climb from cents to dollars. Arm two skips the grouping, sums the whole till, labels it 'TOTAL': 69,612.00. The outer ORDER BY puts the biggest number first, so the till row actually leads the stack — a deliberate flourish that makes the reconciliation obvious, since the two rails beneath sum to exactly the till. Divide by 1.0 anywhere and the deck prints cents as dollars, the classic integer-money bug. Two rails, one till, one divide: the summary that reconciles itself.",
  },
  {
    id: "cs-1539",
    tier: "easy",
    topic: "x3",
    universe: "month-close",
    title: "The shipping-lane stack",
    brief:
      "From: Operations. Re: the fulfilment recap.\n\nThe fulfilment recap splits orders by whether they carry a shipping timestamp — never shipped versus shipped — then stacks a total row. Build the recap: lane label, order count, revenue, with the total appended.",
    ask: "What does the shipping recap look like — both lanes, counts, revenue, and the total row?",
    template: `SELECT * FROM (
  SELECT CASE WHEN shipped_at IS NULL THEN {1} ELSE {2} END AS lane,
    COUNT(*) AS orders, ROUND(SUM(total), 2) AS rev
  FROM orders GROUP BY lane
  UNION ALL
  SELECT {3}, COUNT(*), ROUND(SUM(total), 2) FROM orders
) ORDER BY orders;`,
    slots: [
      {
        answer: "'never'",
        kind: "keyword",
        label: "the unstamped label",
        why: "Orders without a shipping timestamp are the never lane — 21 orders worth 7,265.49. 'pending' would mislabel them: some pending orders do ship, and the lane's truth is the missing stamp.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the stamped label",
        why: "A timestamp means the order left — the shipped lane: 82 orders, 27,567.79. 'stamped' would read like jargon on the recap; the ops verb is shipped.",
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the recap label",
        why: "The second arm sweeps all 103 orders — 34,833.28 — into one row, and 'TOTAL' is the label that makes it a recap line rather than a third lane.",
      },
    ],
    distractors: ["'pending'", "'stamped'", "'GRAND'"],
    walkthrough:
      "The CASE manufactures the lane: shipped_at IS NULL stamps a row 'never', everything else 'shipped', and GROUP BY lane folds the 103 orders into 21 and 82. Each lane carries its count and revenue — never: 21 orders, 7,265.49; shipped: 82 orders, 27,567.79. The second arm drops the CASE and the GROUP BY, sweeping the whole table into one row labelled 'TOTAL': 103 orders, 34,833.28. UNION ALL appends it, ORDER BY orders sorts by count ascending so the recap reads never, shipped, TOTAL — small story first, reconciliation last. The lanes' revenues sum to the total to the cent, and the counts sum to 103: two proofs in one table. NULL-handling and grand totals, stacked in six lines.",
  },
  {
    id: "cs-1540",
    tier: "medium",
    topic: "x3",
    universe: "month-close",
    title: "The month revenue ladder",
    brief:
      "From: Finance ops. Re: the month-close ladder.\n\nThe close ladder lists every trading month's revenue in calendar order, then the grand total at the bottom. Stack the months and the total, using a sort key so the total always sinks to the last row regardless of its size.",
    ask: "What does the month revenue ladder look like with the grand total pinned to the bottom?",
    template: `SELECT * FROM (
  SELECT strftime({1}, created_at) AS m, ROUND(SUM(total), 2) AS rev, 0 AS k
  FROM orders GROUP BY m
  UNION ALL
  SELECT {2}, ROUND(SUM(total), 2), {3} FROM orders
) ORDER BY k, m;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month stamp",
        why: "'%Y-%m' stamps each order with its calendar month — fourteen buckets from 2024-01 to 2025-02. '%Y' would print a two-row ladder and the month close would lose its calendar.",
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the grand label",
        why: "The total arm sweeps all 103 orders into one 34,833.28 row. Labelled 'TOTAL' it reads as the ladder's footer; any other label would make it look like a fifteenth month.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the sink key",
        why: "Months carry k = 0, the total carries k = 1, and ORDER BY k, m sinks the total to the bottom — 34833.28 is bigger than every month, but the pin makes position independent of value.",
      },
    ],
    distractors: ["'%Y'", "'GRAND'", "9"],
    walkthrough:
      "The ladder's trick is the third column: a sort key that exists only to position the total. Arm one stamps each order with its month, sums revenue per month — 2024-01 opens at 3,731.97, the fourteen months run to 2025-02's 2,390.53 — and stamps every row k = 0. Arm two labels itself 'TOTAL', sums the whole book to 34,833.28, and stamps k = 1. ORDER BY k, m sorts months in calendar order (the m tiebreak) and sinks the total underneath regardless of its size — because a total that outranks every month numerically would otherwise jump to the top of a value sort. This is the classic footer-pin: one constant column, one ORDER BY, and the grand row stays where a reader expects it.",
  },
  {
    id: "cs-1541",
    tier: "medium",
    topic: "x3",
    universe: "catalog",
    title: "The category revenue stack",
    brief:
      "From: Merchandising. Re: the category revenue table.\n\nThe revenue table prices every category from actual order lines — quantity times unit price — then stacks a grand total. Build the stack from order_items joined to products, richest category first.",
    ask: "What does the category revenue table look like, priced from order lines, with the grand total stacked?",
    template: `SELECT * FROM (
  SELECT p.category, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  GROUP BY p.category
  UNION ALL
  SELECT {1}, ROUND(SUM(quantity * {2}), 2) FROM order_items
) ORDER BY rev {3};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the grand label",
        why: "The second arm re-prices the whole book — 34,833.28 — in one row. Labelled 'TOTAL' it reads as the table's footer; the same figure appears in arm one's arithmetic, which is the self-check.",
      },
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the line price",
        why: "order_items stores the price actually paid — unit_price — so both arms price identically. 'price' is the catalog list price on products; the column doesn't exist in order_items and the arm would error.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the table order",
        why: "Richest first is the revenue read: Audio 11,744.01 leads, Wearables 6,929.12 follows, down to Fitness 863.91, with TOTAL crowning the stack. Ascending would open on the thinnest shelf.",
      },
    ],
    distractors: ["'GRAND'", "price", "quantity", "ASC"],
    walkthrough:
      "Arm one prices every category from the lines customers actually bought — quantity times unit_price, joined to products for the category label. Audio leads at 11,744.01, then Wearables 6,929.12, Video 5,198.41, Electronics 4,818.61, Accessories 3,294.29, Apparel 1,984.93, Fitness 863.91. Arm two repeats the same pricing over all 251 lines with no grouping — 34,833.28, labelled 'TOTAL' — and UNION ALL stacks it. The self-check is the quiet beauty: the seven categories sum to exactly the total, so if an arm priced differently from the other — catalog list price instead of line price — the reconciliation would break visibly. Richest first, total on top: the merchandising table that audits itself.",
  },
  {
    id: "cs-1542",
    tier: "medium",
    topic: "x3",
    universe: "expense",
    title: "The spend month stack",
    brief:
      "From: Operations. Re: the spend reconciliation.\n\nThe spend report lists every month's outgoings in dollars, then a total row for the year-and-a-bit. Stack the months and the total, sorted so months lead in calendar order and the total lands last.",
    ask: "What does the spend report look like — monthly outgoings stacked with the total pinned last?",
    template: `SELECT * FROM (
  SELECT strftime({1}, spent_on) AS m, ROUND(SUM(amount_cents) / 100.0, 2) AS amt
  FROM expenses GROUP BY m
  UNION ALL
  SELECT {2}, ROUND(SUM(amount_cents) / 100.0, 2) FROM expenses
) ORDER BY {3}, m;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month stamp",
        why: "'%Y-%m' buckets the 36 expenses into fourteen calendar months from 2024-01 to 2025-02. '%Y' would print two rows — 2024 and 2025 — and the reconciliation would lose every month boundary.",
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the report footer",
        why: "The second arm sums the whole file — 25,416.00 — into one row. Labelled 'TOTAL' it reads as the report's footer; unlabelled it would masquerade as a fifteenth month.",
      },
      {
        answer: "amt",
        kind: "keyword",
        label: "the lead sort",
        why: "ORDER BY amt, m sorts by amount first with the month as tiebreak — months lead as a block only while their amounts stay below the total's 25,416.00, and the footer sinks to last.",
      },
    ],
    distractors: ["'%Y'", "'GRAND'", "m", "rev"],
    walkthrough:
      "The spend report stacks fourteen monthly sums — 2024-01's 1,719.00 through 2025-02's 1,650.00 — above one labelled total: 25,416.00 across the whole file. The cents-to-dollars divide by 100.0 appears in both arms because both must render dollars; if only one divided, the stack would mix scales and the reconciliation would scream. The ORDER BY leads on amt with m as tiebreak, which keeps the footer pinned: no month spends 25,416.00, so the total's amount sorts it last while the months arrange among themselves — and the m tiebreak gives equal amounts calendar order. Sorting on m alone would interleave 'TOTAL' alphabetically after '2025-02' anyway, but by luck, not design — the amt key makes the pin structural. Fourteen months, one footer, one honest sum.",
  },
  {
    id: "cs-1543",
    tier: "medium",
    topic: "x3",
    universe: "refund-audit",
    title: "The invoice book stack",
    brief:
      "From: Billing ops. Re: the book summary.\n\nThe book summary counts and values each invoice status — open, paid, void — then stacks a total row. Build it with the status counts riding beside their dollar amounts, biggest count first.",
    ask: "What does the invoice book summary look like — count and value per status, with the total stacked?",
    template: `SELECT * FROM (
  SELECT status, {3}(*) AS n, ROUND(SUM(amount_cents) / 100.0, 2) AS amt
  FROM invoices GROUP BY status
  UNION ALL
  SELECT {1}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM invoices
) ORDER BY n {2};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the book label",
        why: "The second arm sweeps all 28 invoices — 86,977.00 — into one row. 'TOTAL' marks it as the book's footer; anything else reads as a fourth status the book doesn't have.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the count order",
        why: "Biggest count first is the summary read: paid 21, open 6, void 1, TOTAL 28. Ascending would lead on the single void invoice and the book's story would open with its rarest event.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the status counter",
        why: "Each status needs its invoice count — 21 paid, 6 open, 1 void — riding beside its dollar value. AVG would print 4.67 invoices and the count column would stop being a count.",
      },
    ],
    distractors: ["'ALL'", "ASC", "AVG", "TOTAL"],
    walkthrough:
      "The book summary is a two-column stack: count and value per status, then the whole book. Arm one groups the 28 invoices by status — paid: 21 invoices, 66,443.00; open: 6 invoices, 19,609.00; void: 1 invoice, 925.00. Arm two drops the grouping, counts 28, sums 86,977.00, labels it 'TOTAL', and UNION ALL appends the footer. ORDER BY n descending puts the heaviest lane first, so the summary reads paid, open, void, TOTAL — collections context before the rare void, reconciliation last. The arithmetic is the audit: 21 plus 6 plus 1 is 28, and the three amounts sum to 86,977.00 to the cent. Counts beside amounts, footer at the bottom: the book that explains itself in one table.",
  },
  {
    id: "cs-1544",
    tier: "medium",
    topic: "x3",
    universe: "growth",
    title: "The regional revenue stack",
    brief:
      "From: Growth lead. Re: the board's revenue map.\n\nThe board map prices each region's orders and stacks a grand total, then cuts the stack to five rows. Build it: region revenue from the join, the labelled total from the whole book, richest first.",
    ask: "What does the five-row regional revenue stack look like with its grand total?",
    template: `SELECT * FROM (
  SELECT c.region, ROUND(SUM(o.total), 2) AS rev
  FROM orders o JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
  UNION ALL
  SELECT {1}, ROUND(SUM(total), 2) FROM orders
) ORDER BY rev {2} LIMIT {3};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the map total",
        why: "The second arm sweeps the whole book — 34,833.28 — into one row, and 'TOTAL' is the label that lets the map show a house figure beside four regional ones without pretending LATAM earned it.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the map order",
        why: "Richest first is the map read: TOTAL 34,833.28, EU 15,089.23, APAC 11,605.45, US 7,286.16, LATAM 852.44. Ascending would open on LATAM's 852.44 and the board would see the tail first.",
      },
      {
        answer: "5",
        kind: "number",
        label: "the stack cut",
        why: "Five rows is the whole stack — four regions plus the total — so the cut keeps everything while proving the shape. 4 would amputate LATAM and the map would quietly stop reconciling.",
        noVerify: true,
      },
    ],
    distractors: ["'GRAND'", "ASC", "4", "3"],
    walkthrough:
      "The map prices each region through the join — EU 15,089.23 from its eight members, APAC 11,605.45 from five, US 7,286.16 from two, LATAM 852.44 from Bruno alone — then stacks the whole-book total: 34,833.28, labelled 'TOTAL'. ORDER BY rev descending leads with the house figure and lets the regions trail in honest size order; LIMIT 5 keeps exactly the stack, which is the cut that proves the shape rather than hides it. Cut to 4 and LATAM vanishes — and with it the check that 15,089.23 plus 11,605.45 plus 7,286.16 plus 852.44 equals the total. The join-based arm and the naked arm price the same book two ways, and agreeing is the point: one stack, two roads, one number.",
  },
  {
    id: "cs-1545",
    tier: "hard",
    topic: "x3",
    universe: "fraud",
    title: "The ledger month sweep",
    brief:
      "From: Loss prevention. Re: the ledger heat map.\n\nThe fraud sweep flags every ledger month whose debits clear a million cents — those get a manual review — and stacks a total row for the whole ledger, labelled, at the bottom. Build the sweep with its footer.",
    ask: "Which ledger months clear a million cents in debits, and what does the ledger total to?",
    template: `SELECT * FROM (
  SELECT strftime({1}, entry_date) AS m, SUM(debit_cents) AS debits
  FROM ledger_entries GROUP BY m
  UNION ALL
  SELECT {2}, SUM(debit_cents) FROM ledger_entries
) WHERE debits >= {3} ORDER BY m;`,
    slots: [
      {
        answer: "'%Y-%m'",
        kind: "keyword",
        label: "the month stamp",
        why: "'%Y-%m' buckets the 80 ledger entries into fourteen months — the sweep's rows. '%Y' would print two giant rows and the heat map would lose every month boundary it exists to show.",
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the ledger label",
        why: "The second arm sums all 80 entries — 18,108,000 cents — and 'TOTAL' labels the footer. It survives the sweep's filter only because 18.1 million clears the million-cent bar.",
      },
      {
        answer: "1000000",
        kind: "number",
        label: "the review bar",
        why: "A million cents — ten thousand dollars — is the manual-review bar: thirteen of fourteen months clear it (1,087,300 up to 1,892,100), and January's 171,900 is the lone quiet month. The bar never appears in cells, so the audit skips it.",
        noVerify: true,
      },
    ],
    distractors: ["'%Y'", "'GRAND'", "2000000", "1100000"],
    walkthrough:
      "The sweep stacks fourteen monthly debit sums — 2024-01's 171,900 through 2025-02's 1,683,800 — above a labelled footer: 18,108,000 cents across all 80 entries. The WHERE sits outside the union, filtering the merged stack: at the million-cent bar, thirteen months survive and January drops — the sweep's one quiet month, and exactly the kind of anomaly (a ledger month ten times lighter than its neighbours) the fraud desk starts with. The footer survives because 18,108,000 clears any sane bar. Raise the bar to two million and the stack empties to the footer alone — every month quiet, which is a different report entirely. Stamp, sweep, pin: the heat map that carries its own denominator.",
  },
  {
    id: "cs-1546",
    tier: "hard",
    topic: "x3",
    universe: "pricing",
    title: "The gated lane stack",
    brief:
      "From: Pricing. Re: the material-lanes table.\n\nThe table only lists lanes worth at least 6,000 dollars — the material ones — but the grand total must always appear, gated or not. Build the stack: lane revenues above the floor from the grouped arm, the total from the naked arm.",
    ask: "Which lanes clear the 6,000-dollar floor, and how does the total row stay in the stack?",
    template: `SELECT * FROM (
  SELECT status, ROUND(SUM(total), 2) AS rev, COUNT(*) AS n
  FROM orders GROUP BY status HAVING SUM(total) >= {1}
  UNION ALL
  SELECT {2}, ROUND(SUM(total), 2), COUNT(*) FROM orders
) ORDER BY rev {3};`,
    slots: [
      {
        answer: "6000",
        kind: "number",
        label: "the material floor",
        why: "6,000 dollars separates material lanes from noise: pending 6,113.00, shipped 11,996.72, delivered 15,571.07 qualify; cancelled's 1,152.49 drops. The floor shapes arm one but never appears in cells, so the audit skips it.",
        noVerify: true,
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the ungated footer",
        why: "The second arm carries no HAVING — it sweeps all 103 orders into one 34,833.28 row labelled 'TOTAL'. That is the whole trick: the gate lives in arm one only, so the footer is ungovernable.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the stack order",
        why: "Richest first reads: TOTAL 34,833.28, delivered 15,571.07, shipped 11,996.72, pending 6,113.00 — with cancelled gone entirely. Ascending would lead on the thinnest surviving lane.",
      },
    ],
    distractors: ["7000", "1000", "'GRAND'", "ASC"],
    walkthrough:
      "The gate is asymmetric by design: HAVING SUM(total) >= 6000 sits inside arm one only, so the grouped lanes must earn their row — delivered 15,571.07, shipped 11,996.72, pending 6,113.00 — while cancelled's 1,152.49 is silently excluded. Arm two has no gate: it sweeps all 103 orders into the 34,833.28 footer, labelled 'TOTAL', because a total that shrank with the filter would stop being a total. That asymmetry is the pattern's whole lesson — gates belong to detail rows, never to footers. The counts ride along (52, 30, 14, then 103) so the reader can see the footer counting orders the table above no longer shows. Raise the floor to 7,000 and pending drops; drop it to 1,000 and cancelled returns. Gated table, ungated footer: that is ROLLUP's missing half.",
  },
  {
    id: "cs-1547",
    tier: "hard",
    topic: "x3",
    universe: "growth",
    title: "The active-member stack",
    brief:
      "From: Community team. Re: the engagement board.\n\nThe engagement board shows, per region, members and active members side by side, then a house row. Build the stack: regional counts with the active lane filtered to the flag being on, the house row sweeping everyone.",
    ask: "How many members and active members does each region carry, and what does the house row say?",
    template: `SELECT * FROM (
  SELECT region, COUNT(*) AS members,
    SUM(active) FILTER (WHERE active = {1}) AS active_n
  FROM customers GROUP BY region
  UNION ALL
  SELECT {2}, COUNT(*), SUM(active) FROM customers
) ORDER BY members {3};`,
    slots: [
      {
        answer: "1",
        kind: "number",
        label: "the active flag",
        why: "active = 1 is the on-flag: APAC 4 of 5, EU 7 of 8, LATAM 1, US 2. Filtering on 0 would report the inactive members and the board would count the churn, not the base.",
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the house label",
        why: "The second arm sweeps all sixteen members — 16 total, 14 active — into one row. 'TOTAL' marks it as the house line; the same figures also appear as the sum of the regions above, which is the check.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the board order",
        why: "Deepest first is the board read: EU 8, APAC 5, US 2, LATAM 1, TOTAL 16. Ascending would lead on LATAM's single member and the engagement story would open at its thinnest.",
      },
    ],
    distractors: ["0", "'GRAND'", "ASC"],
    walkthrough:
      "The board is a census plus a filtered lane, stacked with a house row. Arm one buckets the sixteen members by region and counts them — EU 8, APAC 5, US 2, LATAM 1 — while SUM(active) FILTER (WHERE active = 1) adds the engaged lane: 7, 4, 2, 1. Arm two drops the grouping and the filter: 16 members, 14 active, labelled 'TOTAL'. The stack self-audits twice — regional members sum to 16, active lanes sum to 14 — and the two missing members (one in EU, one in APAC) are the churn the community team is hunting. Filtering on 0 instead of 1 would flip the board to count the departed. One flag, one filter, one footer: engagement in five rows.",
  },
  {
    id: "cs-1548",
    tier: "hard",
    topic: "x3",
    universe: "inventory",
    title: "The shelf-value stack",
    brief:
      "From: Inventory. Re: the top-shelf valuation.\n\nThe valuation ranks categories by shelf value — list prices summed — and stacks the store-wide total, then cuts to the top three rows. Build it: category shelf values from the grouped arm, the whole-catalog total from the naked arm.",
    ask: "Which categories top the shelf-value stack, and what does the whole catalog value to?",
    template: `SELECT * FROM (
  SELECT p.category, COUNT(*) AS items, ROUND(SUM(p.price), 2) AS shelf_value
  FROM products p GROUP BY p.category
  UNION ALL
  SELECT {1}, COUNT(*), ROUND(SUM(price), 2) FROM products
) ORDER BY shelf_value {2} LIMIT {3};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the catalog label",
        why: "The second arm values all sixteen products — 1,148.43 — into one row. 'TOTAL' marks it as the catalog's footer; the seven category values above must sum to it, which is the valuation's proof.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the valuation order",
        why: "Richest shelf first is the valuation read: TOTAL 1,148.43, Audio 328.98, Wearables 278.99, then the rest. Ascending would lead with Fitness's lone 32.00 mat.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the stack cut",
        why: "Three rows is the cut: the footer plus the two richest shelves — Audio with 3 items at 328.98, Wearables with 2 at 278.99. The figure 3 also appears in the items column, so the audit can see it.",
      },
    ],
    distractors: ["'GRAND'", "ASC", "2", "5"],
    walkthrough:
      "Arm one values each shelf at list price: Audio 328.98 across three products, Wearables 278.99 across two, Electronics 173.49, Video 168.99, Apparel 83.50, Accessories 82.48, Fitness 32.00. Arm two values the whole catalog — sixteen items, 1,148.43 — and labels it 'TOTAL'; UNION ALL stacks it, ORDER BY shelf_value descending ranks it first, and LIMIT 3 cuts the valuation to the footer plus Audio plus Wearables. The quiet lesson is the LIMIT's placement: it sits outside the union, cutting the merged stack, so the total earns its row by value and survives the cut by being the biggest number — not by exemption. Seven shelves, one footer, one cut: the valuation a warehouse team can read at a glance.",
  },
  {
    id: "cs-1549",
    tier: "medium",
    topic: "x3",
    universe: "fraud",
    title: "The late-tranche stack",
    brief:
      "From: Loss prevention. Re: the late-payment tranche.\n\nThe fraud desk tracks payments from October 2024 onward as a separate tranche, stacked under the per-rail summary. Build the stack: rail volumes from the grouped arm, the late tranche's count and value from the filtered arm.",
    ask: "What does the payment stack look like — both rails, then the late-2024 tranche and the till?",
    template: `SELECT * FROM (
  SELECT method, COUNT(*) AS n, ROUND(SUM(amount_cents) / 100.0, 2) AS amt
  FROM payments GROUP BY method
  UNION ALL
  SELECT {1}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2)
  FROM payments WHERE paid_on >= {2}
  UNION ALL
  SELECT {3}, COUNT(*), ROUND(SUM(amount_cents) / 100.0, 2) FROM payments
) ORDER BY n {4};`,
    slots: [
      {
        answer: "'LATE-2024'",
        kind: "keyword",
        label: "the tranche label",
        why: "The filtered arm is not a rail — it is a time tranche — so it needs its own label: 'LATE-2024'. Reusing a rail name would make the tranche look like a third payment method.",
      },
      {
        answer: "'2024-10-01'",
        kind: "keyword",
        label: "the tranche start",
        why: "October 1st opens the tranche: 10 payments worth 27,435.00 — the run the desk is watching. January 1st, 2025 would shrink it to 5 payments and the watch window would lose its last quarter.",
      },
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the till footer",
        why: "The third arm carries no filter and no grouping: all 27 payments, 69,612.00, labelled 'TOTAL'. The rails and the tranche both reconcile against it — the tranche is a slice of it, not a addition to it.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the stack order",
        why: "Deepest first is the stack read: TOTAL 27, card 16, wire 11, LATE-2024 10. Ascending would lead on the tranche — the thing under investigation — and bury the till that contextualizes it.",
      },
    ],
    distractors: ["'OCT-ON'", "'2025-01-01'", "'GRAND'", "ASC"],
    walkthrough:
      "This stack mixes three kinds of rows and keeps them honest with labels. Arm one groups the 27 payments by rail — card 16 payments, 37,364.00; wire 11, 32,248.00. Arm two filters to paid_on from October 1st, 2024 — 10 payments, 27,435.00 — labelled 'LATE-2024', a tranche name that cannot be mistaken for a third rail. Arm three sweeps the whole till unfiltered: 27 payments, 69,612.00, labelled 'TOTAL'. The arithmetic tells the story: the tranche holds 10 of 27 payments and 27,435.00 of 69,612.00 — nearly forty percent of the money in the final stretch of the year — which is the skew the desk is investigating. ORDER BY n descending leads with the till, then the rails, then the tranche. Rails, tranche, till: three arms, one reconciliation.",
  },
  {
    id: "cs-1550",
    tier: "hard",
    topic: "x3",
    universe: "supplier",
    title: "The supplier revenue stack",
    brief:
      "From: Sourcing. Re: the vendor scorecard.\n\nThe scorecard prices every supplier's sold stock from order lines — quantity times unit price through products — then stacks a total row, and the board only sees the top seven rows. Build the stack, richest vendor first.",
    ask: "What does the vendor scorecard look like — supplier revenue, the total row, richest first?",
    template: `SELECT * FROM (
  SELECT s.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS rev
  FROM order_items oi JOIN products p ON p.id = oi.product_id
  JOIN suppliers s ON s.id = p.supplier_id
  GROUP BY s.id
  UNION ALL
  SELECT {1}, ROUND(SUM(quantity * unit_price), 2) FROM order_items
) ORDER BY rev {2} LIMIT {3};`,
    slots: [
      {
        answer: "'TOTAL'",
        kind: "keyword",
        label: "the scorecard footer",
        why: "The naked arm re-prices all 251 order lines — 34,833.28 — and 'TOTAL' labels it. The six suppliers above must sum to it exactly, which is the scorecard's built-in reconciliation.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the scorecard order",
        why: "Richest vendor first is the scorecard read: TOTAL, Nordic 11,130.25, Midwest 9,294.93, Alpine 4,765.63, down to Pacific 2,980.15. Ascending would open on the thinnest vendor.",
      },
      {
        answer: "7",
        kind: "number",
        label: "the board cut",
        why: "Seven rows is the whole scorecard — six vendors plus the footer — so the cut keeps everything and proves the shape. 4 would amputate the tail vendors and the reconciliation would vanish with them.",
        noVerify: true,
      },
    ],
    distractors: ["'GRAND'", "ASC", "4", "5"],
    walkthrough:
      "Three tables deep — order_items to products to suppliers — arm one prices each vendor's sold stock: Nordic Gadgets 11,130.25, Midwest Hardware 9,294.93, Alpine Audio 4,765.63, Andes Naturals 3,613.25, Shenzhen Electro 3,049.07, Pacific Textiles 2,980.15. Arm two prices the same lines with no grouping — 34,833.28, labelled 'TOTAL' — and UNION ALL stacks the footer. The reconciliation is the scorecard's spine: six vendor figures summing to the total to the cent, so any pricing drift between the arms would show immediately. ORDER BY rev descending leads with the footer (it is the biggest number), then the vendors in honest order; LIMIT 7 keeps the full board. Group by supplier id, display the name — id grouping avoids name collisions the way the clinic teaches.",
  },
];
