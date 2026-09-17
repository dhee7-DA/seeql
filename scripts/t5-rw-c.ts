/// <reference types="bun-types" />
/** Wave-5 rewrites batch C: cs-1433..cs-1450 (t3 calendar + t4 mixed reads). */
export const RW_C: Record<string, string> = {
  "cs-1433": `  {
    id: "cs-1433",
    tier: "medium",
    topic: "t3",
    universe: "month-close",
    title: "The December stack",
    brief:
      "From: Month-end close. Re: the year-end page.\\n\\nThe close books the December page separately — the holiday stack the year ends on. Chop the stamps' month and year, keep the grain honest, and count the December 2024 orders the page carries.",
    ask: "How many orders were logged in December 2024?",
    template: \`SELECT COUNT(*) AS december_stack
FROM orders
WHERE strftime('%m', created_at) = {1}
AND strftime('%Y', created_at) = {2}
AND {3}(created_at) = created_at
AND total {4} {5};\`,
    slots: [
      {
        answer: "'12'",
        kind: "keyword",
        label: "the month code",
        why: "strftime renders December as '12', so the month chop carries '12'. An '11' fill would count the November page — six orders.",
      },
      {
        answer: "'2024'",
        kind: "keyword",
        label: "the year code",
        why: "The read is the 2024 year-end page, so the year chop carries '2024'. A '2025' fill would find no December at all — the new year opens in January.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the stack reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every December order. A 300-floor would keep only the three heavyweight tickets.",
      },
    ],
    distractors: ["'11'", "'2025'", "JULIANDAY", "300"],
    walkthrough:
      "The month and year chops scope the read to the holiday page, and the stack counts seven December 2024 orders — the year-end burst the close books apart from the six-order November and the January restart. The '2025' fill would find an empty December, and the 300-floor would keep only three tickets on the page. The December stack: seven.",
  },`,
  "cs-1434": `  {
    id: "cs-1434",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The new-year page",
    brief:
      "From: Growth desk. Re: the new-year census.\\n\\nThe new-year page opens the second year of the book, and the desk counts the orders it already carries. Chop the stamps' year, keep the grain honest, and read the census.",
    ask: "How many orders were logged in 2025?",
    template: \`SELECT COUNT(*) AS new_year
FROM orders
WHERE strftime('%Y', created_at) = {1}
AND {2}(created_at) = created_at
AND total {3} {4};\`,
    slots: [
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is the 2025 page, so the gate carries '2025'. A '2024' fill would count the whole back book — ninety orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the census reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every new-year order. A 500-floor would keep only the three heavyweight tickets.",
      },
    ],
    distractors: ["'2024'", "JULIANDAY", "500"],
    walkthrough:
      "The year chop scopes the read to the 2025 page, and the census counts thirteen orders in the new year's first stretch — against the ninety the back book logged across its twelve months. The '2024' fill would read the back book outright, and the 500-floor would trim the page to three premium tickets. The new-year census: thirteen.",
  },`,
  "cs-1435": `  {
    id: "cs-1435",
    tier: "medium",
    topic: "t3",
    universe: "fraud",
    title: "The write-off calendar span",
    brief:
      "From: Fraud spot-check. Re: the write-off calendar.\\n\\nWrite-offs are rare, but they span the book — the read measures how far the cancelled lane stretches, from its first ticket to its last. Fold the lane's stamps to day numbers, take the extremes, and read the span.",
    ask: "The number of days from the first to the last cancelled order.",
    template: \`SELECT ROUND(julianday({1}(created_at)) - julianday({2}(created_at)), 0) AS fraud_span
FROM orders
WHERE status = {3}
AND {4}(created_at) = created_at;\`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the late extreme",
        why: "The span ends at the last write-off, so the leading fold is MAX. ROUND would fold each stamp into a number no calendar can read and void the span.",
      },
      {
        answer: "MIN",
        kind: "keyword",
        label: "the early extreme",
        why: "The span starts at the first write-off, so the subtrahend is MIN. Swapping the folds would zero the span entirely.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the write-off lane",
        why: "The read scopes to the cancelled lane, so the gate carries 'cancelled'. A 'shipped' fill would span the in-transit lane instead — 407 days.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the lane, so the span reads real rows. JULIANDAY would compare a number to text and void the read.",
      },
    ],
    distractors: ["ROUND", "'shipped'", "JULIANDAY"],
    walkthrough:
      "The lane gate scopes to the seven write-offs, the extremes fold to day numbers, and the subtraction spans the fraud calendar: 2024-01-02 to 2025-01-05 — 369 days, nearly the full book. The shipped flip would span the in-transit lane's 407 days instead, and ROUND would void the read before the extremes ever meet. The write-off calendar: 369 days.",
  },`,
  "cs-1438": `  {
    id: "cs-1438",
    tier: "easy",
    topic: "t3",
    universe: "growth",
    title: "The thin new-year lane",
    brief:
      "From: Growth desk. Re: the fulfillment page.\\n\\nThe new year's fulfillment lane is thin so far, and the desk counts it directly: orders logged in 2025 that have already shipped. Chop the year, gate the lane, keep the grain honest, and read the count.",
    ask: "How many 2025 orders have shipped?",
    template: \`SELECT COUNT(*) AS shipped_2025
FROM orders
WHERE strftime('%Y', created_at) = {1}
AND status = {2}
AND {3}(created_at) = created_at;\`,
    slots: [
      {
        answer: "'2025'",
        kind: "keyword",
        label: "the year gate",
        why: "The read is the new-year page, so the gate carries '2025'. A '2024' fill would count the back book's shipped lane — twenty-seven orders.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the fulfillment lane",
        why: "The page counts work already in transit, so the gate is status = 'shipped'. A 'pending' fill would count the at-risk new-year lane — two orders.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the page, so the count reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: ["'pending'", "'2024'", "JULIANDAY"],
    walkthrough:
      "The year and lane gates scope the read to 2025's in-transit page, and the count reads three — the thin start against the twenty-seven the back book's shipped lane carries. The 'pending' fill would count two at-risk tickets instead, and the '2024' fill would jump back to the full back book. The new-year fulfillment page: three.",
  },`,
  "cs-1442": `  {
    id: "cs-1442",
    tier: "medium",
    topic: "t4",
    universe: "month-close",
    title: "The quiet-month revenue",
    brief:
      "From: Month-end close. Re: the lean read.\\n\\nThe revenue pots range widely, and the lean read finds the month that carried the least. Stage the monthly pots through a derived table with a grain guard, sort them ascending, and read the floor line.",
    ask: "The month with the lowest total order revenue, and its pot.",
    template: \`SELECT mo, pot
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, ROUND(SUM(total), 2) AS pot
  FROM orders
  WHERE {3}(created_at) = created_at
  GROUP BY mo
)
ORDER BY pot {1}
LIMIT {2};\`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean sort",
        why: "The lean read wants the smallest pot first, so the sort is ascending. DESC would crown January's 3731.97 stack instead of July's lean one.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the single-read cut",
        why: "The read wants one month, so the cut is 1. A 3-cut would return the three leanest months and blur the floor line.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the pots stage from real rows. JULIANDAY would compare a number to text and stage nothing.",
      },
    ],
    distractors: ["DESC", "3", "JULIANDAY"],
    walkthrough:
      "The monthly pots stage through the derived table — fourteen months, each stamped by its '%Y-%m' key — and the ascending sort reads the floor: July 2024 at 1193.86, the leanest month in the book, well under the 338-average order flow the pot absorbs. The DESC flip would crown January's 3731.97 stack instead, and the 3-cut would blur the floor with runners-up. The lean read: July 2024, 1193.86.",
  },`,
  "cs-1445": `  {
    id: "cs-1445",
    tier: "hard",
    topic: "t4",
    universe: "expense",
    title: "The burn-ratio read",
    brief:
      "From: Expense desk. Re: the burn share.\\n\\nThe burn ratio reads cancelled spend against delivered revenue — the share of the book that went out the door as write-offs. Stage both scalars, prove the revenue side exists through a guarded EXISTS, and read the ratio to three decimals.",
    ask: "Cancelled-order spend as a share of delivered revenue, 3 decimals.",
    template: \`SELECT ROUND(
  (SELECT SUM(total) FROM orders WHERE status = {1}) * 1.0 /
  (SELECT SUM(total) FROM orders WHERE status = {2}), 3) AS burn_ratio
WHERE EXISTS (
  SELECT 1 FROM orders
  WHERE {3}(created_at) = created_at
);\`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the burn numerator",
        why: "The burn side sums the write-off lane, so the numerator gate carries 'cancelled'. A 'pending' fill would burn the at-risk lane into the ratio — a 0.393 share.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the revenue denominator",
        why: "The revenue side sums the closed lane, so the denominator gate carries 'delivered'. A 'shipped' fill would shrink the denominator to the in-transit pot and swell the ratio to 0.096.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the existence grain",
        why: "The EXISTS proof demands date-clean stamps — true for the book — so the gate folds with DATE. JULIANDAY would compare a number to text and void the proof, returning no row at all.",
      },
    ],
    distractors: ["'pending'", "'shipped'", "JULIANDAY"],
    walkthrough:
      "The two scalars stage to 1152.49 of cancelled spend against 15571.07 of delivered revenue, and the ratio rounds to 0.074 — the book burns about one euro in thirteen, a write-off share the close tracks quarter over quarter. The pending fill would read 0.393, and the shipped denominator would read 0.096. The guarded EXISTS keeps the read honest when the book runs dry. The burn share: 0.074.",
  },`,
  "cs-1446": `  {
    id: "cs-1446",
    tier: "medium",
    topic: "t4",
    universe: "fraud",
    title: "The write-off month census",
    brief:
      "From: Fraud desk. Re: the write-off calendar.\\n\\nThe fraud read counts how many distinct months carry a cancelled order — the write-off calendar's footprint. Stage the collapse with NULLIF, guard the total, and count the months the lane touches.",
    ask: "How many distinct months carry a cancelled order?",
    template: \`SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS fraud_months
FROM orders
WHERE {1}(status, {2}) IS NULL
AND total {3} {4};\`,
    slots: [
      {
        answer: "NULLIF",
        kind: "keyword",
        label: "the lane collapse",
        why: "NULLIF(status, 'cancelled') collapses the write-off lane to NULL, so IS NULL keeps it. IFNULL(status, 'cancelled') returns the status untouched — never NULL — and the census reads zero.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the audited lane",
        why: "The census tracks write-offs, so the collapse compares against 'cancelled'. A 'pending' fill would map the at-risk calendar instead — ten months.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals, which cannot exist.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every write-off. An 800-floor would empty the census — no write-off climbs that high.",
      },
    ],
    distractors: ["IFNULL", "'pending'", "800"],
    walkthrough:
      "NULLIF collapses every cancelled status to NULL, and the distinct-month count reads the write-off calendar: five months carry a cancelled order, out of the fourteen the book spans. IFNULL would return the status untouched and zero the census — the classic fold swap the fraud desk watches for — and the 'pending' fill would map ten months of at-risk work. The write-off calendar: five months.",
  },`,
  "cs-1447": `  {
    id: "cs-1447",
    tier: "easy",
    topic: "t4",
    universe: "growth",
    title: "The active-member book",
    brief:
      "From: Growth desk. Re: the active book.\\n\\nThe active roster carries most of the book — and the read proves it by gating the flag. Stage the active members through a subquery with a grain guard, sum their order totals, and read the figure the inactive pair never touches.",
    ask: "Total order revenue across active members' orders.",
    template: \`SELECT ROUND(SUM(total), 2) AS active_book
FROM orders
WHERE customer_id IN (
  SELECT id FROM customers
  WHERE active = {1}
  AND {2}(created_at) = created_at
)
AND total {3} {4};\`,
    slots: [
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the active flag",
        why: "The active roster carries flag 1 — fourteen members whose orders fill the book. A 0 fill would read the inactive pair's orders instead.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the signup stamps are date-clean — true for the roster, so the subquery returns real members. JULIANDAY would compare a number to text and return nobody.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the total gate direction",
        why: "The gate keeps real orders, so the test is > 0. Flipping to < would demand negative totals and empty the book.",
      },
      {
        answer: "0",
        kind: "number",
        noVerify: true,
        label: "the open total floor",
        why: "A floor of 0 admits every order. A 500-floor would keep only the premium tickets and halve the book.",
      },
    ],
    distractors: ["0", "JULIANDAY", "500"],
    walkthrough:
      "The subquery scopes to the fourteen active members, and the sum reads their full order book: 33135.42 — the inactive pair carries only 1697.86, so the active roster owns ninety-five percent of the flow. The 0 fill would flip the read to the pair's small book, and the 500-floor would trim the read to the 17379.43 premium core. The active book: 33135.42.",
  },`,
  "cs-1448": `  {
    id: "cs-1448",
    tier: "medium",
    topic: "t4",
    universe: "month-close",
    title: "The live-month census",
    brief:
      "From: Month-end close. Re: the live book.\\n\\nThe close proves a structural fact: no month in the book runs on cancellations alone. The census counts the months that carry live (non-cancelled) work, chopping the stamps to their month keys.",
    ask: "How many distinct months carry at least one non-cancelled order?",
    template: \`SELECT COUNT(DISTINCT strftime('%Y-%m', created_at)) AS live_months
FROM orders
WHERE status {1} {2}
AND {3}(created_at) = created_at;\`,
    slots: [
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the live test",
        why: "Live work excludes the write-off lane, so the test is NOT IN ('cancelled'). IN would read the dead months — the five the write-off calendar touches.",
      },
      {
        answer: "('cancelled')",
        kind: "keyword",
        label: "the dead lane",
        why: "Cancelled is the one lane that never ships, so the exclusion list carries it alone. A bare 'cancelled' fill would break the NOT IN grammar outright.",
      },
      {
        answer: "DATE",
        kind: "keyword",
        label: "the grain check",
        why: "DATE(created_at) = created_at proves the stamps are date-clean — true for the book, so the census reads real rows. JULIANDAY would compare a number to text and count nothing.",
      },
    ],
    distractors: ["IN", "JULIANDAY"],
    walkthrough:
      "The NOT IN test scopes out the write-off lane, and the distinct-month census reads fourteen: every month in the book carries live work — no period closes on cancellations alone. The IN flip would read the five months the write-off calendar touches, a fifth of the book. The grain guard keeps the chop honest. The live-month census: fourteen.",
  },`,
  "cs-1450": `  {
    id: "cs-1450",
    tier: "hard",
    topic: "t4",
    universe: "month-close",
    title: "The closing capstone stack",
    brief:
      "From: Month-end close. Re: the final capstone.\\n\\nThe capstone runs the full window play: bucket the months into quartiles by revenue, keep the lean bucket, and walk the running stack to see where it stands. Two windows, one stage — and the lean months tell the close where the year really began.",
    ask: "The running stack at each month of the leanest revenue quartile, under the 15000 wall.",
    template: \`SELECT mo, rev, run
FROM (
  SELECT strftime('%Y-%m', created_at) AS mo, SUM(total) AS rev,
         {1}(SUM(total)) OVER (ORDER BY strftime('%Y-%m', created_at)) AS run,
         NTILE(4) OVER (ORDER BY SUM(total) {2}) AS q
  FROM (SELECT created_at, total FROM orders)
  GROUP BY mo
)
WHERE q = {3}
AND run {4} {5};\`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the stacking fold",
        why: "The stack accumulates revenue, so the window folds with SUM. COUNT would stack row counts — 1, 2, 3 — and every month would pass the wall.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the lean direction",
        why: "The lean months sit at the bottom of the ascending revenue order, so the quartile splits ASC. DESC would flip the split and hand the lean bucket the loudest months' rivals.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the lean bucket",
        why: "Bucket 4 of the ascending split holds the three leanest months. A 1-fill would return the loudest quartile instead.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the wall direction",
        why: "The capstone reads the early stack under the wall, so the test is <. Flipping to > would keep only September's late surge.",
      },
      {
        answer: "15000",
        kind: "number",
        noVerify: true,
        label: "the wall height",
        why: "The wall sits at 15000 — September's 24047.31 stack breaks through, while January and February hide below. A 10000-wall would keep January alone.",
      },
    ],
    distractors: ["COUNT", "DESC", "10000", "25000"],
    walkthrough:
      "Two windows, one stage: the ascending quartile hands the lean bucket to January, February and September, and the running stack tells the close where the year began — January at 3731.97, February at 7341.61, both safely under the 15000 wall, while September's 24047.31 breaks through and leaves the read. The COUNT fold would turn the stack into a row tally and let everything pass. The capstone keeps the two early months.",
  },`,
};
