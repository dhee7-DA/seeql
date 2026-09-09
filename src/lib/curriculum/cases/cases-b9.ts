// Capstone case files — batch B9 (cs-196…cs-200). The graduation cases: each
// combines foundations skills (filter → bucket → aggregate → filter buckets →
// trim) into one single-table query, framed as a board-level memo. Audited by
// scripts/case-audit.ts against the seed db.

import type { CaseStudy } from "./types";

export const casesB9: CaseStudy[] = [
  {
    id: "cs-196",
    tier: "hard",
    topic: "cap",
    universe: "inventory",
    title: "The month that carried the building",
    brief:
      "From: Warehouse ops manager. Re: ops review — board appendix.\n\nThe board pack needs one line on throughput: which month pushed the most order value through this building. Finance already has the monthly curve; I only want the peak — one month label and the value it booked, rounded so the slide reads clean. If the peak is a surprise, I'll hear about it Thursday, so let's both see it coming.",
    ask: "The single month with the highest booked order value, shown as its year-month label and that value rounded to 2 decimals.",
    template: `SELECT {1}('%Y-%m', created_at) AS month,
       ROUND({2}(total), 2) AS revenue
FROM orders
{3} BY month
ORDER BY revenue {4}
{5} {6};`,
    slots: [
      {
        answer: "strftime",
        kind: "keyword",
        label: "the month truncation",
        why: "created_at is a full timestamp; strftime('%Y-%m', created_at) cuts each one down to the year-month the board thinks in. No other chip turns timestamps into month buckets.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "Value moved per month means every order total in the bucket added up: SUM(total). COUNT would answer how many orders moved, not how much they were worth.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One row per month demands GROUP BY month — without it SUM(total) collapses all 103 orders into a single grand total and the best-month question evaporates.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "The peak month sits at the top of the list, so the sort is DESC. ASC would rank weakest first and hand the board our softest month as the headline.",
      },
      {
        answer: "LIMIT",
        kind: "keyword",
        label: "the one-row trim",
        why: "The appendix takes one line, and LIMIT trims the ranked list to its first row — it only means 'the best' because it runs after ORDER BY.",
      },
      {
        answer: "1",
        kind: "number",
        label: "the row cap",
        why: "One month, one row: the cap is 1. Any larger cap turns the headline back into a table the slide can't hold.",
        noVerify: true,
      },
    ],
    distractors: ["COUNT", "AVG", "WHERE", "ASC", "OFFSET", "2"],
    walkthrough:
      "I read the ask as bucket, measure, rank, trim. created_at is a timestamp, so strftime('%Y-%m', …) does the bucketing; SUM(total) measures the value inside each bucket; ORDER BY revenue DESC ranks the buckets biggest first; LIMIT 1 keeps the winner. The numbers: January 2024 takes it at 3,731.97, with February 2024 right behind at 3,609.64 — a gap of roughly 122 — and July 2024 the softest month at 1,193.86. Worth saying out loud on Thursday: the peak is also our first trading month, so the board may ask whether the launch bump has been matched since. It hasn't quite — which is exactly the follow-up slide.",
  },
  {
    id: "cs-197",
    tier: "hard",
    topic: "cap",
    universe: "funnel",
    title: "Where orders stall before dispatch",
    brief:
      "From: Growth marketing lead. Re: exec meeting, funnel appendix.\n\nMarketing owns the funnel down to dispatch, so I have to account for every order that never got a ship date — the system leaves that field empty until the warehouse confirms a parcel is out the door. Split those stranded orders by the status they're parked under, biggest group first. The execs will ask which part of the leak we can still recover, so the recoverable pile should lead the row.",
    ask: "Count of orders with no ship date, broken out by status, biggest group first.",
    template: `SELECT status, {1}(*) AS open_orders
FROM orders
WHERE shipped_at {2} {3}
{4} BY status
ORDER BY open_orders {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the headcount aggregate",
        why: "The deliverable is a headcount per status, so COUNT(*). SUM would try to add up status text and fail, and AVG would return a nonsensical mean.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the emptiness test",
        why: "An empty ship date is a NULL, and NULL can't be probed with equals — shipped_at = NULL matches nothing and would silently report an empty funnel. IS is the operator that sees emptiness.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the stranded marker",
        why: "The stranded state is exactly shipped_at IS NULL: the rows the warehouse never stamped. NOT NULL would flip the panel to orders that already left the building.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the split clause",
        why: "The split is one number per status, so GROUP BY status builds a bucket per status for COUNT to fill. WHERE can't do it — it filters rows before any bucket exists.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Biggest group first is DESC on the count. ASC would open the exec slide with the smaller leak and bury the recoverable queue underneath it.",
      },
    ],
    distractors: ["SUM", "=", "NOT NULL", "WHERE", "ASC"],
    walkthrough:
      "Three moves: the state test, the split, the ranking. shipped_at IS NULL isolates every order the warehouse never confirmed — 21 of our 103 orders, about a fifth of the book. GROUP BY status splits them: 14 pending, 7 cancelled. That split is the story: the 14 pending are still in the funnel and recoverable with a nudge, while the 7 cancelled are revenue we've already written off — worth pairing this row with the refunds queue before the meeting. DESC puts the actionable pile on top so the execs read the recoverable number first.",
  },
  {
    id: "cs-198",
    tier: "hard",
    topic: "cap",
    universe: "supplier",
    title: "Regions with a second source",
    brief:
      "From: Supply-chain lead. Re: supplier resilience slide, exec meeting.\n\nThe board's standing question is whether any region can be knocked out by losing one supplier. Our rule of thumb: a region only counts as resilient if we carry at least two suppliers there. For every region that clears that bar, show the region, how many suppliers we hold, and the average supplier rating to 2 decimals — strongest region first. Single-supplier regions stay off the slide; they go to the risk register instead.",
    ask: "Each region holding at least 2 suppliers, with its supplier count and average rating rounded to 2 decimals, best rating first.",
    template: `SELECT region, COUNT(*) AS suppliers,
       ROUND({1}(rating), 2) AS avg_rating
FROM suppliers
{2} BY region
{3} COUNT(*) >= {4}
ORDER BY avg_rating {5};`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the rating aggregate",
        why: "Average supplier strength is AVG(rating). SUM would stack the ratings into nonsense like 9.4 for a two-supplier region, and COUNT would just echo the supplier count.",
      },
      {
        answer: "GROUP",
        kind: "keyword",
        label: "the bucketing clause",
        why: "One row per region requires GROUP BY region — it sorts the six suppliers into regional buckets before any aggregate runs. ORDER would only rearrange rows, not build buckets.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the depth filter",
        why: "The at-least-two-suppliers rule filters buckets after they exist, and it reads an aggregate — WHERE runs before grouping and can't see COUNT results. HAVING is the clause built for exactly this.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the resilience bar",
        why: "The bar is two suppliers per region; a region with a single source fails the test no matter how good its rating is.",
        noVerify: true,
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the ranking direction",
        why: "Strongest region first means DESC on the average rating. ASC would lead the slide with the weaker of the two qualifying regions.",
      },
    ],
    distractors: ["SUM", "COUNT", "WHERE", "ASC", "3"],
    walkthrough:
      "This is the full bucket pipeline: GROUP BY region builds four regional buckets, COUNT(*) sizes each, HAVING evicts every bucket holding fewer than two suppliers, then the survivors get ranked. US (4.4) and LATAM (4.0) each carry one supplier and drop out — they're the single-source exposures the risk register needs. What survives: EU with 2 suppliers averaging 4.70, APAC with 2 averaging 4.00. That's the slide — two resilient regions, and a visible 0.7-point quality gap between them. Worth noting for the board: resilience and quality came out of one query, because HAVING and ORDER BY share the same COUNT and AVG machinery.",
  },
  {
    id: "cs-199",
    tier: "hard",
    topic: "cap",
    universe: "expense",
    title: "Rates above the 200 line",
    brief:
      "From: Ops finance spend owner. Re: procurement committee, rate-card annex.\n\nThe committee wants a premium tier in the purchase policy, and the anchor number is 200 per unit. Before we set the approval rule I need to see what we actually pay up there: every unit cost on our recorded spend lines that clears 200, duplicates collapsed — a rate paid on ten lines is still one rate. List them smallest to largest so the annex reads like a scale.",
    ask: "The distinct unit prices above 200 across all spend lines, listed smallest to largest.",
    template: `SELECT {1} {2}
FROM order_items
WHERE unit_price {3} {4}
ORDER BY unit_price {5};`,
    slots: [
      {
        answer: "DISTINCT",
        kind: "keyword",
        label: "the dedupe keyword",
        why: "The same rate can repeat on line after line; DISTINCT collapses the column to one row per value so the annex lists rates, not purchases. Without it the same figure would reprint per line.",
      },
      {
        answer: "unit_price",
        kind: "keyword",
        label: "the listed column",
        why: "The per-unit cost lives in unit_price — that's the number the policy keys on. order_id would list transactions, and quantity would count units; neither is a rate.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the threshold operator",
        why: "'Clears 200' is strictly greater-than. Flipping to < would fill the annex with the cheap tier and invert the whole policy question.",
      },
      {
        answer: "200",
        kind: "number",
        label: "the premium anchor",
        why: "The committee's anchor is 200 per unit — the annex starts just above it. The data even has 199.97 missing the cut by three cents, which is the boundary doing its job.",
        noVerify: true,
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the listing order",
        why: "Smallest to largest is ASC — technically the default, but writing it makes the annex's direction explicit for whoever copies it into the policy doc.",
      },
    ],
    distractors: ["GROUP", "quantity", "<", "=", "50"],
    walkthrough:
      "Reading the ask: dedupe, then bound, then order. DISTINCT unit_price turns hundreds of purchase lines into pure rates; the WHERE draws the 200 line; ASC lays them out smallest first. Five rates clear the bar: 200.07, 204.19, 205.31, 205.81 and 209.68 at the top. The near-miss deserves a footnote — 199.97 sits three cents under the line, exactly the kind of boundary case a committee will probe when someone wants a 199 rate approved as 'basically tier two'. Five rates is short enough that a manual approval tier above 200 looks easy to staff.",
  },
  {
    id: "cs-200",
    tier: "hard",
    topic: "cap",
    universe: "catalog",
    title: "Headline numbers for the audio shelf",
    brief:
      "From: Catalog content manager. Re: merchandising review, audio category page.\n\nThe review opens on the audio shelf and it gets judged on two numbers: how many SKUs we list there and what the shelf carries at list price in total. One row, both figures, the money rounded so the deck looks deliberate. Pull them straight from the catalog — don't touch orders; this is about what we list, not what moved.",
    ask: "One row: how many Audio products are listed and their combined list price, rounded to 2 decimals.",
    template: `SELECT {1}(*) {2} skus,
       ROUND({3}(price), {4}) AS shelf_value
FROM products
WHERE category {5} {6};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the SKU counter",
        why: "How many SKUs is a row count: COUNT(*). SUM can't take a * and AVG would average the prices instead of counting the listings.",
      },
      {
        answer: "AS",
        kind: "keyword",
        label: "the column alias",
        why: "AS renames the count to skus so the exported slide column has a human header instead of the raw function name.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the value aggregate",
        why: "Combined list value is SUM(price) — COUNT would re-count the rows, and MAX would show only the single priciest SKU on the shelf.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the rounding depth",
        why: "Money on a deck slide is quoted to 2 decimals — that's the ROUND depth. Fewer decimals looks sloppy; more looks like a machine wrote it.",
        noVerify: true,
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the shelf matcher",
        why: "The shelf is exactly the Audio category, so equality. <> would sweep in every other shelf and present their numbers as audio's.",
      },
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the category value",
        why: "Category names are text values, so the literal wears quotes: 'Audio'. Unquoted, SQL reads it as a column name and the query fails outright.",
      },
    ],
    distractors: ["AVG", "MAX", "<>", "'Wearables'", "'Apparel'", "0"],
    walkthrough:
      "Two aggregates, one filter, one row. COUNT(*) answers the listing question, SUM(price) the value question, and because both run over the same filtered set they can't disagree — that's the point of computing them together. WHERE category = 'Audio' isolates the shelf: 3 SKUs carrying 328.98 at list. For scale, the wearables shelf would read 2 SKUs and 278.99 — audio wins on both breadth and value, which supports giving it the page revamp. One caveat for the deck: this is list-price value, not sold revenue — the shelf's actual throughput is a different query on orders.",
  },
];
