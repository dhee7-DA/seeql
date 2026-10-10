// Case batch WF1 — window functions deep-dive, t5 (RANK & friends),
// cs-2101…cs-2125. Memo-rebuild cases over the live storefront db.
import type { CaseStudy } from "./types";

export const casesWf1: CaseStudy[] = [
  {
    id: "cs-2101",
    tier: "easy",
    topic: "t5",
    universe: "growth",
    title: "The board's number-one order",
    brief:
      "From: Growth lead. Re: the revenue deck.\n\nThe deck opens on our single biggest basket. Number every order from largest total down, keeping the sequence strict — no shared numbers even if two baskets ever tie. Smaller ids win ties, and the deck shows the top five only.",
    ask: "Which orders lead the strict size ranking, top five?",
    template: `SELECT id, total, {1}() OVER (ORDER BY total {2}, id ASC) AS rk
FROM orders
ORDER BY rk
{3};`,
    slots: [
      {
        answer: "ROW_NUMBER",
        kind: "keyword",
        label: "the strict numbering function",
        why: "ROW_NUMBER deals 1,2,3… with no repeats and no gaps — the board wants one definite winner. RANK would share numbers on ties.",
      },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Biggest basket first means totals run high to low. ASC would crown the smallest order." },
      { answer: "LIMIT 5", kind: "keyword", noVerify: true, label: "the deck cut", why: "The deck quotes five rows. LIMIT 5 trims the 103-order list to the board's spread." },
    ],
    distractors: ["LAG", "ASC", "LIMIT 2"],
    walkthrough:
      "Ranking with a strict sequence is ROW_NUMBER's contract: order by total DESC so the heaviest basket lands on 1, and id ASC as the tiebreaker so the numbering is deterministic run after run. The outer ORDER BY rk re-sorts the output by that sequence, and LIMIT 5 keeps the deck's spread. Offset functions like LAG need an argument and would not even run here; flipping to ASC would crown the cheapest basket and the deck would open on the smallest sale of the year.",
  },
  {
    id: "cs-2102",
    tier: "easy",
    topic: "t5",
    universe: "pricing",
    title: "Cheapest-first shelf audit",
    brief:
      "From: Pricing review. Re: the ladder check.\n\nMarketing wants the catalog walked from cheapest to dearest, each product stamped with its position on the ladder, and the walk stops after ten rungs for the printout. Alphabetical order breaks any price ties so the walk never wobbles between runs.",
    ask: "Number the catalog cheapest-first, ten rungs only.",
    template: `SELECT name, price, {1}() OVER (ORDER BY price {2}, name ASC) AS step
FROM products
ORDER BY step
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the ladder function", why: "A strict 1…N walk with no shared steps is ROW_NUMBER; offset functions like LAG would not even run here." },
      { answer: "ASC", kind: "keyword", label: "the ladder direction", why: "Cheapest first is ascending price. DESC would start the ladder at the most expensive shelf." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the printout cut", why: "The printout carries ten rungs — LIMIT 10 trims the sixteen-product walk." },
    ],
    distractors: ["LAG", "DESC", "3"],
    walkthrough:
      "The ladder is ROW_NUMBER over price ascending, and LIMIT 10 keeps the printout to one page. Because the catalog has no duplicate prices, RANK and DENSE_RANK would agree here — but the brief asked for a strict sequence, and ROW_NUMBER promises it under any data. The outer ORDER BY step presents the walk itself, cheapest shelf first.",
  },
  {
    id: "cs-2103",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "Shared ranks on the spend board",
    brief:
      "From: Fraud spot-check. Re: tied spenders.\n\nWe count each customer's orders and RANK the totals. Customers with the same order count must share a rank, and the next rank must skip ahead — the gap proves how many customers tied. The board shows the top seven rows.",
    ask: "Rank customers by order count with gaps after ties.",
    template: `WITH t AS (
  SELECT customer_id, COUNT(*) AS n
  FROM orders
  GROUP BY customer_id
)
SELECT customer_id, n, {1}() OVER (ORDER BY n {2}) AS rk
FROM t
ORDER BY rk, customer_id
{3};`,
    slots: [
      { answer: "RANK", kind: "keyword", label: "the gap-leaving rank", why: "RANK repeats the number on tied counts and skips the next — the visible gap the memo wants. ROW_NUMBER would never tie." },
      { answer: "DESC", kind: "keyword", label: "the volume direction", why: "Most orders ranks first, so the count runs high to low. ASC would rank the one-order customers on top." },
      { answer: "LIMIT 7", kind: "keyword", noVerify: true, label: "the board cut", why: "The printed board carries seven rows; LIMIT 7 trims without touching the ranks themselves." },
    ],
    distractors: ["ROW_NUMBER", "ASC", "LIMIT 3"],
    walkthrough:
      "The CTE collapses orders to one count per customer; the window then ranks those counts high to low — and notice the window orders by the count ALONE, because a tiebreaker column inside OVER would make every row unique and erase the very ties the memo studies. RANK is the point of the exercise: four customers share a count, so they share a rank and the next customer jumps — the skipped number is the tie's footprint. The outer ORDER BY rk, customer_id sorts the display deterministically without touching the ranks.",
  },
  {
    id: "cs-2104",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "Dense ladder for the ops standup",
    brief:
      "From: Growth lead. Re: the tiered follow-up list.\n\nFor the standup we need customers banded by order count WITHOUT gaps: tied customers share a band and the next band is simply the next integer. The standup reads the first twelve rows of the band ladder.",
    ask: "Band customers by order count with DENSE_RANK.",
    template: `WITH t AS (
  SELECT customer_id, {1}(*) AS n
  FROM orders
  GROUP BY customer_id
)
SELECT customer_id, n, {2}() OVER (ORDER BY n {3}) AS band
FROM t
ORDER BY band, customer_id
LIMIT 12;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the volume counter", why: "The band key is how many orders each customer placed — COUNT(*) per customer in the CTE." },
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless band", why: "DENSE_RANK shares numbers on ties but never skips — bands run 1,2,3… with no holes, as the standup asked." },
      { answer: "DESC", kind: "keyword", label: "the band direction", why: "Heaviest buyers get band 1, so counts sort descending. ASC would put the single-order customers in band 1." },
    ],
    distractors: ["SUM", "RANK", "ASC"],
    walkthrough:
      "Two functions do the work: COUNT(*) in the CTE turns each customer's orders into one number, and DENSE_RANK turns those numbers into gapless bands — with the window ordering by the count alone so the ties stay ties. The contrast with RANK is the lesson: where four customers tie, RANK would leave a hole after them (the ladder would jump from 6 to 10), while DENSE_RANK continues with the very next integer. The LIMIT carries the table deep enough to see the divergence.",
  },
  {
    id: "cs-2105",
    tier: "medium",
    topic: "t5",
    universe: "catalog",
    title: "Two numberings, one audit",
    brief:
      "From: Warehouse catalog. Re: the shelf-numbering audit.\n\nThe label printer needs both truths side by side: a strict position (ties broken, no shared numbers) and a competition rank (ties share, next skipped). Print both columns for every product by price, dearest first, and read the table in competition order.",
    ask: "Show strict position and competition rank together, dearest first.",
    template: `SELECT name, price,
       {1}() OVER (ORDER BY price DESC, name ASC) AS pos,
       {2}() OVER (ORDER BY price DESC, name ASC) AS rk
FROM products
ORDER BY {3} ASC;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the strict position", why: "pos must never repeat — ROW_NUMBER guarantees a unique slot per product even if prices tie." },
      { answer: "RANK", kind: "keyword", label: "the competition rank", why: "rk must share on ties and skip ahead — that's RANK's definition and the audit's second truth." },
      { answer: "rk", kind: "keyword", label: "the display sort", why: "Reading the table in competition order means sorting by the rank column, not by name or price directly." },
    ],
    distractors: ["LAG", "NTILE", "name"],
    walkthrough:
      "Both windows share one ORDER BY (price DESC, name ASC) but answer different questions: ROW_NUMBER deals unique locker numbers, RANK runs a competition where equals tie and the next position is forfeited. On a catalog without price ties the two columns agree — the audit's value is proving they CAN agree, while knowing they diverge the moment two prices collide. The outer ORDER BY rk presents the ladder in rank order.",
  },
  {
    id: "cs-2106",
    tier: "easy",
    topic: "t5",
    universe: "funnel",
    title: "The top three baskets",
    brief:
      "From: Marketing funnel. Re: the hero-card copy.\n\nThe hero card quotes our three biggest delivered baskets. Number the delivered orders from biggest total down — strict numbering, smaller id wins ties — and keep only the first three rows.",
    ask: "Fetch the three largest delivered baskets, numbered.",
    template: `SELECT id, total, ROW_NUMBER() OVER (ORDER BY total {1}, id ASC) AS rk
FROM orders
WHERE status = '{2}'
ORDER BY rk
{3};`,
    slots: [
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Biggest first is total DESC — the hero card quotes the top of the ladder." },
      { answer: "delivered", kind: "keyword", label: "the status filter", why: "Only delivered orders count as real baskets; pending, shipped or cancelled rows would pollute the hero card." },
      { answer: "LIMIT 3", kind: "keyword", noVerify: true, label: "the podium cut", why: "The hero card quotes three baskets — LIMIT 3 trims the delivered ladder to the podium." },
    ],
    distractors: ["ASC", "shipped", "LIMIT 1"],
    walkthrough:
      "The WHERE narrows the world to delivered baskets before any numbering happens — windows only see the filtered rows. ROW_NUMBER then walks totals from high to low with the id tiebreaker baked into the window, the outer ORDER BY presents the ladder, and LIMIT 3 keeps the podium the hero card needs. Putting the status filter inside a window instead of WHERE would be impossible; WHERE is the gate, the window is the scoreboard.",
  },
  {
    id: "cs-2107",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "Month-close revenue ranks",
    brief:
      "From: Controller. Re: the close binder.\n\nThe close binder ranks months by revenue. Stage one revenue figure per month first, then rank the months from biggest down. Tied months share a rank and the next rank skips — that's the convention the auditor expects, and the binder prints all fourteen months.",
    ask: "Rank months by revenue with competition ranks.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, SUM(total) AS rev
  FROM orders
  GROUP BY {1}
)
SELECT month, rev, {2}() OVER (ORDER BY rev {3}) AS rk
FROM m
ORDER BY rk, month;`,
    slots: [
      { answer: "month", kind: "keyword", label: "the staging grain", why: "One row per month is the binder's grain — GROUP BY month after the strftime split." },
      { answer: "RANK", kind: "keyword", label: "the auditor's rank", why: "Ties share and the next rank skips — the auditor's convention is RANK; argument-less functions like NTILE would not even run." },
      { answer: "DESC", kind: "keyword", label: "the money direction", why: "Biggest month is rank 1, so revenue sorts descending inside the window." },
    ],
    distractors: ["status", "NTILE", "ASC"],
    walkthrough:
      "The pattern that powers most finance rankings is two layers: GROUP BY stages one figure per month, then the window ranks the staged rows. Ranking DESC crowns the biggest month; RANK honors the auditor's tie convention — equals share, next skips — and the outer ORDER BY rk, month keeps the binder page stable between print runs.",
  },
  {
    id: "cs-2108",
    tier: "easy",
    topic: "t5",
    universe: "supplier",
    title: "Supplier shelf positions",
    brief:
      "From: Supplier audit. Re: shelf share check.\n\nEach supplier's products need a shelf position: number every product within its supplier from priciest down. The numbering restarts at each supplier — that reset is the whole point of the partition.",
    ask: "Number each supplier's products from priciest down.",
    template: `SELECT name, supplier_id, price,
       {1}() OVER (PARTITION BY {2} ORDER BY price {3}, name ASC) AS shelf
FROM products
ORDER BY supplier_id, shelf;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the position stamp", why: "Each product gets a unique shelf slot inside its supplier — ROW_NUMBER's strict dealing." },
      { answer: "supplier_id", kind: "keyword", label: "the reset boundary", why: "PARTITION BY supplier_id restarts the numbering for every supplier — the reset the memo demands." },
      { answer: "DESC", kind: "keyword", label: "the price direction", why: "Priciest gets shelf 1, so the walk sorts price descending within each supplier." },
    ],
    distractors: ["LAG", "category", "ASC"],
    walkthrough:
      "PARTITION BY supplier_id slices the catalog into per-supplier worlds; ROW_NUMBER then deals shelf positions inside each world independently, priciest first. Repartitioning by category would give different group sizes and different numbers on every row — the reset boundary is a real decision, not decoration. The name tiebreaker keeps the positions stable when two products from one supplier share a price.",
  },
  {
    id: "cs-2109",
    tier: "medium",
    topic: "t5",
    universe: "inventory",
    title: "Stock depth positions",
    brief:
      "From: Inventory count. Re: the replenishment walk.\n\nWalk the shelf from deepest stock to shallowest, stamping each product with its position, and hand the team only the first six positions. Stock ties break alphabetically so the walk is reproducible.",
    ask: "Position the deepest shelves first, six rows only.",
    template: `SELECT name, stock, {1}() OVER (ORDER BY stock {2}, name ASC) AS pos
FROM products
ORDER BY pos
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the walk position", why: "A strict 1…N walk of the shelf is ROW_NUMBER — offset functions like LAG would not run without an argument." },
      { answer: "DESC", kind: "keyword", label: "the depth direction", why: "Deepest shelf first is stock DESC — the replenishment team walks from the fullest shelf down." },
      { answer: "6", kind: "keyword", noVerify: true, label: "the handover cut", why: "The team takes the deepest six shelves — LIMIT 6 trims the sixteen-product walk." },
    ],
    distractors: ["LAG", "ASC", "12"],
    walkthrough:
      "One window, two clauses: ORDER BY stock DESC walks deepest first with the alphabetical tiebreak baked in, and ROW_NUMBER stamps strict positions 1..16 while LIMIT 6 hands over the deepest six. The outer ORDER BY pos is the presentation copy of the same walk — the team reads position 1, orders stock, and works down the list.",
  },
  {
    id: "cs-2110",
    tier: "medium",
    topic: "t5",
    universe: "refund-audit",
    title: "The refund shortlist",
    brief:
      "From: Refund audit. Re: the biggest cancellations.\n\nRefunds target the three LARGEST cancelled baskets this period. Keep only cancelled orders, number them biggest-first with strict numbering, and trim to three rows for the approver.",
    ask: "Shortlist the three biggest cancelled baskets.",
    template: `SELECT id, total, {1}() OVER (ORDER BY total {2}, id ASC) AS rk
FROM orders
WHERE status = '{3}'
ORDER BY rk
LIMIT 3;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the shortlist stamp", why: "The approver wants three distinct rows, numbered — ROW_NUMBER never repeats a position." },
      { answer: "DESC", kind: "keyword", label: "the damage direction", why: "Largest cancellations first is total DESC — the shortlist leads with the worst damage." },
      { answer: "cancelled", kind: "keyword", label: "the status gate", why: "Only cancelled baskets are refund candidates; delivered orders would be nonsense on this list." },
    ],
    distractors: ["NTILE", "ASC", "pending"],
    walkthrough:
      "Filter first, number second: WHERE cancelled removes every healthy basket, and the window ranks only the wreckage. DESC puts the biggest loss at position 1; the id tiebreaker makes positions stable; LIMIT 3 trims the list to what the approver reads. NTILE would need an argument and deal tiles instead of ranks — a different instrument entirely. If a fourth cancellation arrives next week the same query re-runs and the list self-updates.",
  },
  {
    id: "cs-2111",
    tier: "medium",
    topic: "t5",
    universe: "pricing",
    title: "Category price ladders, side by side",
    brief:
      "From: Pricing review. Re: the category booklets.\n\nEach category booklet opens with its own price ladder: products numbered dearest-first WITHIN the category. The ladder restarts per category, and ties break alphabetically.",
    ask: "Give every product its within-category price position.",
    template: `SELECT name, category, price,
       ROW_NUMBER() OVER (PARTITION BY {1} ORDER BY price {2}, name ASC) AS rung
FROM products
ORDER BY {3}, rung;`,
    slots: [
      { answer: "category", kind: "keyword", label: "the booklet boundary", why: "Each booklet is one category — PARTITION BY category restarts every ladder." },
      { answer: "DESC", kind: "keyword", label: "the booklet direction", why: "Booklets open dearest-first, so price runs descending inside each category." },
      { answer: "price", kind: "keyword", noVerify: true, label: "the display order", why: "The output lays the booklets side by side — ORDER BY price groups equal-price shelves across booklets before the rung." },
    ],
    distractors: ["supplier_id", "ASC", "name"],
    walkthrough:
      "The booklet metaphor maps one-to-one onto PARTITION BY category: the window's counter resets at each category edge, giving every booklet its own 1..N ladder ordered dearest-first. Repartitioning by supplier would produce different group sizes and therefore different rungs on the same products. The outer ORDER BY category, rung lays the booklets out side by side — the pricing team flips between booklets comparing rung 1 to rung 1.",
  },
  {
    id: "cs-2112",
    tier: "hard",
    topic: "t5",
    universe: "growth",
    title: "Two podiums per status",
    brief:
      "From: Growth lead. Re: the funnel health grid.\n\nFor each order status we pin the two biggest baskets. Grid rows read status, basket, rank-inside-status — and only ranks 1 and 2 survive the cut. Stage the rank, then trim.",
    ask: "List each status's two biggest baskets with in-status ranks.",
    template: `WITH r AS (
  SELECT status, id, total,
         {1}() OVER (PARTITION BY {2} ORDER BY total DESC, id ASC) AS rk
  FROM orders
)
SELECT status, id, total, rk
FROM r
WHERE rk {3} 2
ORDER BY status, rk;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the grid stamp", why: "Each status's grid shows distinct positions 1 and 2 — ROW_NUMBER never shares a slot." },
      { answer: "status", kind: "keyword", label: "the grid column", why: "The podium restarts for every status — the partition key is status itself." },
      { answer: "<=", kind: "keyword", label: "the podium cut", why: "Keeping ranks 1 and 2 is rk <= 2; a bare '=' would keep only the winners and drop the runners-up." },
    ],
    distractors: ["LAG", "customer_id", "<"],
    walkthrough:
      "Staging is forced here: the rank exists only after the window runs, so a CTE computes rk per status and the outer query trims to the podium. PARTITION BY status gives each funnel stage its own competition; ROW_NUMBER keeps the two podium slots distinct even if the two baskets tie in value. The <= is the quiet hero — switching it to = would silently fire the runner-up from every podium.",
  },
  {
    id: "cs-2113",
    tier: "medium",
    topic: "t5",
    universe: "catalog",
    title: "The premium shelf list",
    brief:
      "From: Warehouse catalog. Re: the premium shelf.\n\nThe premium shelf is the four most expensive products: strict rank by price, dearest first, and the printout lists the shelf itself — name and price of each product that makes the cut of four.",
    ask: "List the four products on the premium shelf, ranked.",
    template: `SELECT name, price, {3}() OVER (ORDER BY price {1}, name ASC) AS rn
FROM products
ORDER BY rn
LIMIT {2};`,
    slots: [
      { answer: "DESC", kind: "keyword", label: "the premium direction", why: "The premium shelf is the top of the ladder only when the walk sorts price descending." },
      { answer: "4", kind: "keyword", noVerify: true, label: "the shelf size", why: "The shelf holds four products — LIMIT 4 trims the ranked catalog." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the shelf stamp", why: "The strict position stamp dealt inside OVER is ROW_NUMBER — offset functions would not run without an argument." },
    ],
    distractors: ["ASC", "8", "LAG"],
    walkthrough:
      "The ladder is ROW_NUMBER over price DESC with the alphabetical tiebreak inside the window; LIMIT 4 trims the walk to the premium shelf. Direction is decisive: sorting ascending would fill the printout with the cheapest products and call them premium. The outer ORDER BY rn presents the shelf in rank order — position 1 is the single most expensive product in the catalog.",
  },
  {
    id: "cs-2114",
    tier: "easy",
    topic: "t5",
    universe: "expense",
    title: "Spend ranks on the expense board",
    brief:
      "From: Spend report. Re: the biggest single expenses.\n\nThe board pins the five largest single expense lines. Number them largest-first (ties by smaller id), keep every row in the ledger, and trim the display to five.",
    ask: "Rank expense lines by size, display the top five.",
    template: `SELECT id, vendor, amount_cents, {1}() OVER (ORDER BY amount_cents {2}, id {3}) AS rk
FROM expenses
ORDER BY rk
LIMIT 5;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the board stamp", why: "Five distinct board slots need distinct numbers — ROW_NUMBER deals them without sharing." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Largest expense at rank 1 is amount DESC." },
      { answer: "ASC", kind: "keyword", label: "the tie rule", why: "Equal amounts are sequenced by smaller id first, keeping the board deterministic." },
    ],
    distractors: ["NTILE", "ASC", "DESC"],
    walkthrough:
      "The expense board is a pure ranking read: window over amount DESC with an id tiebreaker, output re-sorted by the rank, LIMIT 5 for the display. No partition — the board spans every vendor and category in one competition. The id ASC tiebreak matters when two invoices share a figure: the earlier expense wins the higher slot, every run, which is what makes the board trustworthy in a meeting.",
  },
  {
    id: "cs-2115",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "The month volume ladder",
    brief:
      "From: Controller. Re: the volume appendix.\n\nThe appendix ranks months by ORDER COUNT this time, not revenue. Same audit convention: ties share a rank, the next rank skips a number. Months with equal volume must sit together, and the appendix prints the first eight rows.",
    ask: "Rank months by order count with shared ranks and gaps.",
    template: `WITH m AS (
  SELECT strftime('%Y-%m', created_at) AS month, {1}(*) AS n
  FROM orders
  GROUP BY month
)
SELECT month, n, {2}() OVER (ORDER BY n {3}) AS rk
FROM m
ORDER BY rk, month
LIMIT 8;`,
    slots: [
      { answer: "COUNT", kind: "keyword", label: "the volume counter", why: "The appendix ranks how many orders each month drew — COUNT(*) per month." },
      { answer: "RANK", kind: "keyword", label: "the skip-after-ties rank", why: "Equal months share a number and the next one skips — RANK's signature the appendix documents." },
      { answer: "DESC", kind: "keyword", label: "the volume direction", why: "Busiest month at rank 1 means the count sorts descending." },
    ],
    distractors: ["SUM", "ROW_NUMBER", "ASC"],
    walkthrough:
      "Volume and money rank differently, so the appendix re-runs the two-layer pattern with COUNT instead of SUM, and the window orders by the count alone so the ties stay ties. The tie behavior is the lesson: several months tie on volume, RANK lets them share a number and leaves a hole after the group, and the appendix narrative points at that hole as proof of the tie. ROW_NUMBER would print consecutive numbers and quietly destroy the appendix's tie evidence.",
  },
  {
    id: "cs-2116",
    tier: "hard",
    topic: "t5",
    universe: "fraud",
    title: "Three-way numbering audit",
    brief:
      "From: Fraud spot-check. Re: the numbering proof.\n\nThe examiner wants the three ranking functions side by side on one staged set: strict sequence, competition rank with gaps, and dense band without gaps — all over customer order counts. Divergence appears exactly at ties, and the table reads in competition order.",
    ask: "Print strict, competition, and dense numbers together.",
    template: `WITH t AS (
  SELECT customer_id, COUNT(*) AS n
  FROM orders
  GROUP BY customer_id
)
SELECT customer_id, n,
       {1}() OVER (ORDER BY n DESC, customer_id ASC) AS seq,
       RANK() OVER (ORDER BY n DESC, customer_id ASC) AS rk,
       {2}() OVER (ORDER BY n DESC, customer_id ASC) AS band
FROM t
ORDER BY {3} ASC;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the strict column", why: "seq must be a pure 1..N dealing — ROW_NUMBER is the only function that promises it." },
      { answer: "DENSE_RANK", kind: "keyword", label: "the gapless column", why: "band shares numbers on ties but never skips — the dense column's contract." },
      { answer: "rk", kind: "keyword", label: "the display sort", why: "The examiner reads the table in competition order, so the output sorts by rk." },
    ],
    distractors: ["LAG", "NTILE", "n"],
    walkthrough:
      "One staged set, three windows, one ORDER BY each — the audit's beauty is the divergence pattern: seq climbs 1,2,3…; rk shares on ties then jumps; band shares on ties then continues. Where the three columns agree there are no ties; where rk jumps or band holds, the count tied. Sorting by rk (not by the raw count) presents the proof in the examiner's reading order.",
  },
  {
    id: "cs-2117",
    tier: "medium",
    topic: "t5",
    universe: "supplier",
    title: "The mid-shelf rungs",
    brief:
      "From: Supplier audit. Re: the mid-shelf list.\n\nThe mid-market shelf is defined by rank, not tiles: number the catalog by price ascending and list the products sitting on rungs 6 through 10 — the middle of the ladder — with their rungs.",
    ask: "List the products on price rungs 6 to 10.",
    template: `SELECT name, price, {3}() OVER (ORDER BY price {1}, name ASC) AS rn
FROM products
ORDER BY rn
LIMIT 5 OFFSET {2};`,
    slots: [
      { answer: "ASC", kind: "keyword", label: "the ladder direction", why: "Rungs count from cheapest, so the walk ascends — rung 6..10 is the middle of the shelf." },
      { answer: "5", kind: "keyword", noVerify: true, label: "the band start", why: "Skipping the first five rungs lands the walk on rung 6 — OFFSET 5 with LIMIT 5 prints rungs 6..10." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the rung stamp", why: "Strict rungs 1..16 come from ROW_NUMBER dealt inside OVER — offset functions would not run without an argument." },
    ],
    distractors: ["DESC", "8", "NTILE"],
    walkthrough:
      "The walk is ROW_NUMBER over price ascending; OFFSET 5 skips the five cheapest rungs and LIMIT 5 prints exactly rungs 6..10 — a rank-based band that survives because the shelf's definition is positional. Direction flips the band to the expensive end, and widening the offset would slide the window down the ladder — every knob is load-bearing.",
  },
  {
    id: "cs-2118",
    tier: "medium",
    topic: "t5",
    universe: "funnel",
    title: "Region revenue podiums",
    brief:
      "From: Marketing funnel. Re: the regional bragging rights.\n\nStage revenue per region, then rank the regions from biggest. The funnel deck shows ranks with the gaps left in — tied regions would share a rank and the next would skip. Ties break alphabetically.",
    ask: "Rank regions by revenue with competition ranks.",
    template: `WITH r AS (
  SELECT c.region, {1}(o.total) AS rev
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
  GROUP BY c.region
)
SELECT region, rev, {2}() OVER (ORDER BY rev {3}) AS rk
FROM r
ORDER BY rk;`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the money fold", why: "Revenue per region is the sum of order totals — SUM in the staging layer; COUNT would tally baskets instead of money." },
      { answer: "RANK", kind: "keyword", label: "the deck's rank", why: "The deck shows gaps after ties — RANK's convention; tile and offset functions would not run argument-less." },
      { answer: "DESC", kind: "keyword", label: "the bragging direction", why: "Biggest region takes rank 1, so revenue sorts descending." },
    ],
    distractors: ["NTILE", "LAG", "ASC"],
    walkthrough:
      "The join hands each order its region; GROUP BY folds four regions; the window ranks the folded rows. This is the canonical stage-then-rank shape the deck reuses for cities and categories. Argument-less function chips like NTILE and LAG would not even run here, and the outer ORDER BY keeps the printed ladder identical run to run.",
  },
  {
    id: "cs-2119",
    tier: "easy",
    topic: "t5",
    universe: "catalog",
    title: "The alphabet walk",
    brief:
      "From: Warehouse catalog. Re: the label printer.\n\nThe printer numbers products alphabetically for shelf labels, and the roll feeds eight labels per run. Equal names never occur, but the audit still wants the id tiebreaker specified so the walk is provably deterministic.",
    ask: "Number products alphabetically, eight labels per run.",
    template: `SELECT name, category, {1}() OVER (ORDER BY name {2}, id ASC) AS label_no
FROM products
ORDER BY label_no
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the label stamp", why: "Labels are strict positions — ROW_NUMBER prints 1..N with no repeats; rank functions would also run but share numbers if names ever tied." },
      { answer: "ASC", kind: "keyword", label: "the alphabet direction", why: "A-to-Z is name ASC — the printer's natural order." },
      { answer: "8", kind: "keyword", noVerify: true, label: "the label roll", why: "The roll feeds eight labels per run — LIMIT 8 trims the walk." },
    ],
    distractors: ["LAG", "DESC", "3"],
    walkthrough:
      "Even a trivial walk gets the full treatment: ROW_NUMBER for strictness, name ASC for the alphabet, the id tiebreak documented inside the window, LIMIT 8 for the label roll. Specify the tiebreak even when ties can't occur — the day a duplicate name sneaks into the catalog, the labels stay stable instead of shuffling between print runs.",
  },
  {
    id: "cs-2120",
    tier: "hard",
    topic: "t5",
    universe: "refund-audit",
    title: "Below the refund podium",
    brief:
      "From: Refund audit. Re: the small-claim queue.\n\nThe small-claim queue is the cancelled baskets ranked OUTSIDE the top three by value: rank cancelled baskets biggest-first, then list every basket below the podium with its rank.",
    ask: "List the cancelled baskets below the top-three podium.",
    template: `SELECT id, total, {3}() OVER (ORDER BY total {1}, id ASC) AS rn
FROM orders
WHERE status = '{2}'
ORDER BY rn
LIMIT 4 OFFSET 3;`,
    slots: [
      { answer: "DESC", kind: "keyword", label: "the value direction", why: "Ranking biggest-first puts the podium on rungs 1..3 and the small claims below it." },
      { answer: "cancelled", kind: "keyword", label: "the exposure gate", why: "Only cancelled orders are refund exposure; every other status would dilute the queue." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the queue stamp", why: "Strict rungs come from ROW_NUMBER dealt inside OVER — tile functions would not run argument-less." },
    ],
    distractors: ["ASC", "pending", "NTILE"],
    walkthrough:
      "The window ranks cancelled baskets from the worst loss down; LIMIT 4 OFFSET 3 skips the podium and prints the next four small claims. Sorting ascending would move the podium to the cheapest baskets and the queue would list the big losses instead — the exact opposite of its purpose. The status gate runs before the window, so the ranks only ever see cancelled baskets.",
  },
  {
    id: "cs-2121",
    tier: "medium",
    topic: "t5",
    universe: "growth",
    title: "The champion of each city",
    brief:
      "From: Growth lead. Re: the city champions plaque.\n\nEach city gets its champion: the single biggest basket placed there. Rank baskets inside their city and keep only the winner. Ties break to the smaller order id.",
    ask: "Crown the biggest basket in every city.",
    template: `WITH r AS (
  SELECT c.city, o.id, o.total,
         {1}() OVER (PARTITION BY c.{2} ORDER BY o.total {3}, o.id ASC) AS rk
  FROM orders o
  JOIN customers c ON c.id = o.customer_id
)
SELECT city, id, total
FROM r
WHERE rk = 1
ORDER BY city;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the plaque stamp", why: "One champion per city needs one winning slot — ROW_NUMBER keeps the competition strict." },
      { answer: "city", kind: "keyword", label: "the plaque boundary", why: "Champions are per city — the partition resets at each city edge." },
      { answer: "DESC", kind: "keyword", label: "the crown direction", why: "The biggest basket is rank 1, so totals sort descending inside each city." },
    ],
    distractors: ["NTILE", "region", "ASC"],
    walkthrough:
      "The join attaches each basket to its city; the partition makes every city its own competition; ROW_NUMBER crowns a single winner per city after the DESC walk. Repartitioning by region would crown one champion per region and leave most cities plaqueless. Staging in a CTE is mandatory — the winner exists only after the window runs, and WHERE rk = 1 must happen outside it.",
  },
  {
    id: "cs-2122",
    tier: "medium",
    topic: "t5",
    universe: "month-close",
    title: "Invoice size positions",
    brief:
      "From: Controller. Re: the AR appendix.\n\nThe appendix walks invoices from largest amount to smallest, each stamped with its position, and prints the first ten lines. Amount ties resolve to the alphabetically-first invoice number so the appendix never reshuffles.",
    ask: "Position invoices from largest to smallest, ten lines.",
    template: `SELECT number, amount_cents, {1}() OVER (ORDER BY amount_cents {2}, number ASC) AS pos
FROM invoices
ORDER BY pos
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the appendix stamp", why: "Appendix positions are strict — ROW_NUMBER never shares a slot between invoices." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Largest invoice at position 1 is amount DESC." },
      { answer: "10", kind: "keyword", noVerify: true, label: "the print cut", why: "The appendix prints ten lines — LIMIT 10 trims the ranked book." },
    ],
    distractors: ["NTILE", "ASC", "4"],
    walkthrough:
      "The appendix is a ranked read of the invoice book: window over amount DESC with the number tiebreak baked in, positions re-sorted for display and trimmed to ten lines. Because ties resolve by the text of the invoice number rather than the internal id, the appendix survives re-imports that renumber rows — the sort key lives in business data, not surrogate keys.",
  },
  {
    id: "cs-2123",
    tier: "medium",
    topic: "t5",
    universe: "expense",
    title: "Spend ranks on the category board",
    brief:
      "From: Spend report. Re: the category board.\n\nThe board ranks expense CATEGORIES by total spend, biggest first, with strict positions, and shows the top three. Stage one spend figure per category, then rank and trim.",
    ask: "Rank expense categories by spend, top three.",
    template: `WITH s AS (
  SELECT category, {1}(amount_cents) AS spend
  FROM expenses
  GROUP BY category
), r AS (
  SELECT category, spend, {2}() OVER (ORDER BY spend {3}) AS rk
  FROM s
)
SELECT category, spend, rk
FROM r
WHERE rk <= 3
ORDER BY rk;`,
    slots: [
      { answer: "SUM", kind: "keyword", label: "the spend fold", why: "Category spend is the sum of its expense lines — SUM in the staging CTE; COUNT would tally lines instead of money." },
      { answer: "ROW_NUMBER", kind: "keyword", label: "the board stamp", why: "The board shows three distinct slots — ROW_NUMBER keeps them unique even if two categories tie." },
      { answer: "DESC", kind: "keyword", label: "the size direction", why: "Biggest category at rank 1 is spend DESC." },
    ],
    distractors: ["NTILE", "LAG", "ASC"],
    walkthrough:
      "Stage then rank: the CTE folds expenses to four category totals, the second CTE stamps strict ranks biggest-first, and the outer query trims to the podium. NTILE would need an argument and deal proportional tiles instead of a podium — a different instrument. Flipping the direction would rank the smallest spender first and the board would recommend cutting the wrong budget.",
  },
  {
    id: "cs-2124",
    tier: "hard",
    topic: "t5",
    universe: "inventory",
    title: "The shallow shelf, ruled",
    brief:
      "From: Inventory count. Re: the shallow shelf.\n\nThe counter's ruling: the shallow shelf is the six least-stocked products. Rank the catalog by stock ascending with the alphabetical tiebreak inside the window, keep rungs 1..6, and list them.",
    ask: "List the six least-stocked products, ranked.",
    template: `SELECT name, stock, {1}() OVER (ORDER BY stock {2}, name ASC) AS rn
FROM products
ORDER BY rn
LIMIT {3};`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the shelf stamp", why: "Strict rungs come from ROW_NUMBER dealt inside OVER — rank functions would also run but the memo wants a strict 1..6 list." },
      { answer: "ASC", kind: "keyword", label: "the ruling direction", why: "Rung 1 must be the SHALLOWEST shelf, so stock ascends — the ruling's read of the memo." },
      { answer: "6", kind: "keyword", noVerify: true, label: "the shelf size", why: "The ruling fixes the shelf at six products — LIMIT 6 trims the ranked walk." },
    ],
    distractors: ["LAG", "DESC", "12"],
    walkthrough:
      "The ruling resolves the ambiguity: ascending stock puts the emptiest shelves on rungs 1..6, and LIMIT 6 prints exactly that shelf. Sorting descending would census the deepest shelves instead — both answers look plausible without the ruling in writing, which is why the direction slot is numbered. The alphabetical tiebreak inside the window keeps the six-product list itself stable between count days.",
  },
  {
    id: "cs-2125",
    tier: "medium",
    topic: "t5",
    universe: "fraud",
    title: "Suspicion ranks within customer",
    brief:
      "From: Fraud spot-check. Re: the per-account heat list.\n\nFor each customer, their baskets need a suspicion rank: biggest basket ranks 1 within that customer. The list restarts per customer — an examiner reads one customer's ladder at a time.",
    ask: "Rank each customer's baskets within the customer.",
    template: `SELECT id, customer_id, total,
       {1}() OVER (PARTITION BY {2} ORDER BY total {3}, id ASC) AS heat
FROM orders
ORDER BY customer_id, heat;`,
    slots: [
      { answer: "ROW_NUMBER", kind: "keyword", label: "the heat stamp", why: "Each customer's ladder has strict positions — ROW_NUMBER deals 1..N inside every partition." },
      { answer: "customer_id", kind: "keyword", label: "the account boundary", why: "The ladder restarts per customer — the partition key is the account." },
      { answer: "DESC", kind: "keyword", label: "the heat direction", why: "Biggest basket is heat 1, so totals sort descending inside each account." },
    ],
    distractors: ["NTILE", "status", "ASC"],
    walkthrough:
      "Partitioning by customer gives every account a private ladder; the DESC walk puts their biggest basket on the top rung; the id tiebreak keeps the ladder stable across examinations. Repartitioning by status would mix every customer's baskets into four status-wide ladders. ROW_NUMBER matters here because the examiner wants rung numbers without holes or repeats — shared rungs would read like a typo.",
  },
];
