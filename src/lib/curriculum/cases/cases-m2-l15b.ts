// Case batch M2-L15b — topic l15 (Joins + aggregates), ids cs-518…cs-533.
// Customer-grain and product-grain aggregation: spend and count leaderboards,
// HAVING gates, unit ledgers, and the inflated-vs-honest pairing check. Every
// figure is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesM2L15b: CaseStudy[] = [
  {
    id: "cs-518",
    tier: "easy",
    topic: "l15",
    universe: "growth",
    title: "The spender table, all sixteen accounts",
    brief:
      "From: Chief of Staff. Re: board deck, customer concentration slide.\n\nThe concentration slide opens with the full spender table: every account on the file with its lifetime booked value and its booking count, biggest spenders first. All sixteen rows, not a cut of five — the board wants to see the whole base before anyone argues concentration. Figures as stored.",
    ask: "Each account name with its booking count and total booked value, biggest spend first.",
    template: `SELECT c.name, COUNT(*) AS bookings, ROUND(SUM(o.total), 2) AS spend
FROM orders o
JOIN customers c ON {1} = {2}
GROUP BY {3}
ORDER BY spend DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Each booking carries a customer_id that points at the account register — that is the only thread between the two files. The booking's own id would match booking numbers against account numbers and invent sixteen phantom accounts.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers its rows in id, and the pointer must land there. The register has no customer_id column of its own, so that spelling breaks the query before the table has a single row.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "One row per account means grouping by the register's name column. Grouping by region would collapse the table to four geographic buckets and the concentration slide would lose every name.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "c.region"],
    walkthrough:
      "The full table is one grouping on a reunion: bookings joined to accounts on customer_id = c.id, counted and summed per account, ranked by spend. Sixteen rows come back, and the top is a two-horse race: Alice Chen 7,262.35 on 24 bookings, Emma Wilson 6,640.56 on 17. Grace Kim's 4,574.23 leads the middle pack, and the tail is long — eleven accounts under 1,700, down to Olivia Brown's single 444.80 booking. The count column earns its place beside the money: Alice's 24 bookings are nearly a quarter of the file's 103, so her lead is volume, not one lucky ticket. That is the concentration slide in one glance — two accounts hold about 27,000 of the book's 34,833.28, and the board should hear it before the campaign plan assumes a broad base.",
  },
  {
    id: "cs-519",
    tier: "easy",
    topic: "l15",
    universe: "fraud",
    title: "The three busiest booking files",
    brief:
      "From: Risk team, spot-check rotation. Re: frequency triage.\n\nThe rotation works frequency first: the accounts that book most often get their records pulled before anyone looks at amounts. This cycle I want the three busiest files on the register — account name and booking count, heaviest first — so the reviewers know whose history to dump into the queue.",
    ask: "The 3 accounts with the most bookings, with the counts, busiest first.",
    template: `SELECT c.name, COUNT(*) AS bookings
FROM orders o
JOIN customers c ON {1} = {2}
GROUP BY c.name
ORDER BY bookings DESC
LIMIT {3};`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Frequency is counted per account, and bookings reach the register only through customer_id. The booking's own id against account ids would fabricate sixteen one-booking files and triage nobody.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id — the pointer's landing column. There is no customer_id on the register itself, so that guess errors before the triage list exists.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the triage list's depth",
        why: "The rotation pulls exactly three files this cycle, so the cut is 3. Five would hand the reviewers two more histories than the cycle's staffing covers; the fourth account waits its turn.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "5"],
    walkthrough:
      "The triage list is a per-account count with a ranked cut: bookings joined to accounts on customer_id = c.id, counted per account, heaviest first, sliced at three. The files that come back: Alice Chen with 24 bookings, Emma Wilson with 17, Grace Kim with 14. The cut matters more than it looks — Maya Patel sits just outside at 13, one booking behind Grace, so a sloppier cut of five would have doubled the reviewers' workload for a marginal file. Alice's 24 is the number the rotation leads with: nearly a quarter of the ledger's 103 bookings on one account. Frequency first is the desk's doctrine because volume patterns surface long before amount patterns do, and the list says exactly where to start reading.",
  },
  {
    id: "cs-520",
    tier: "easy",
    topic: "l15",
    universe: "catalog",
    title: "The catalog's single biggest earner",
    brief:
      "From: Catalog content manager. Re: merchandising page, hero slot.\n\nThe merchandising page has one hero slot, and I want it earned, not guessed: the single product with the most lifetime line revenue, computed off the purchase lines — quantity times booked price, summed. One row, one product, one figure the page can defend.",
    ask: "The product with the highest lifetime line revenue, with the figure to the penny.",
    template: `SELECT p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
GROUP BY p.name
ORDER BY revenue DESC
LIMIT {3};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on purchase lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and crown whatever product shares numbers with busy lines.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id column of its own — that spelling errors before the hero slot has a name.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the hero slot's size",
        why: "The page carries exactly one hero, so the cut is 1. Three would be a podium, not a hero — and the merchandising template has one slot to fill.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "3"],
    walkthrough:
      "The hero is a per-product revenue sum with a cut of one: lines joined to the catalog on product_id = p.id, quantity times booked price summed per item, ranked descending, sliced at one. The row that comes back: Noise-Canceling Headset, 6,888.25 — earned across 24 sales lines at premium unit prices. That is roughly a fifth of the book's 34,833.28 sitting on a single product, and the next best, the Smart Watch S at 4,582.02, is not close. The figure is line-charged, which is the whole point: every cent is a physical line times a booked price, so when merchandising puts the headset in the hero slot, the number behind it survives any audit of the lines. Volume alone would not have won the slot — the desk mat moves more units — but revenue is what the hero is for.",
  },
  {
    id: "cs-521",
    tier: "easy",
    topic: "l15",
    universe: "month-close",
    title: "Europe's booked total on one line",
    brief:
      "From: Controller. Re: month-end close, regional support schedule.\n\nThe support schedule's Europe line needs its lifetime booked total — every booking an EU account ever placed, summed to one figure the schedule can carry. One row, one number. If the reunions are done right, the total matches what the region's ledger page shows, and the close binder stays reconcilable.",
    ask: "The total booked value of every booking from EU-region accounts, as one figure.",
    template: `SELECT ROUND(SUM(o.total), 2) AS booked
FROM orders o
JOIN customers c ON {1} = {2}
WHERE {3} = 'EU';`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Region lives on the account register, so bookings must reach it through customer_id before any region filter can bite. The booking's own id against account ids would fabricate sixteen fake pairings and salt the total.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register numbers accounts in id, and the pointer lands there. The register has no customer_id of its own, so that spelling errors out and the schedule line never fills.",
      },
      {
        answer: "c.region",
        kind: "keyword",
        label: "the region column",
        why: "EU is a region value on the account register, so the filter is the register's region column. City would hunt for a city literally named EU and return an empty schedule line.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "c.city"],
    walkthrough:
      "The schedule line is a filter on the account side of a reunion, summed once: bookings joined to accounts on customer_id = c.id, kept to region EU, totals summed. One row comes back: 15,089.23 across 45 bookings — Europe's whole lifetime book, on one line. Set it in context and the close binder reads cleanly: the book's grand total is 34,833.28, so Europe holds not far off half of it, with APAC's 11,605.45 the nearest rival and LATAM's two bookings worth 852.44 in total. The quiet lesson in this build is that the reunion changes no money — joining the register to the ledger to read a region leaves every figure where it was; it only tells the sum whose bookings to count. The schedule line can be signed as it stands.",
  },
  {
    id: "cs-522",
    tier: "easy",
    topic: "l15",
    universe: "refund-audit",
    title: "Who holds the dead tickets",
    brief:
      "From: refunds@ — goodwill ledger wrap-up. Re: queue ownership.\n\nBefore the goodwill ledger closes for the cycle, ownership has to be on the record: which accounts hold the cancelled bookings, and how much dead value each one carries. Names with amounts, biggest exposure first — the countersignature page needs a name next to every figure.",
    ask: "Each account with cancelled bookings, showing its total cancelled value, biggest first.",
    template: `SELECT c.name, ROUND(SUM(o.total), 2) AS dead_value
FROM orders o
JOIN customers c ON {1} = {2}
WHERE o.status = {3}
GROUP BY c.name
ORDER BY dead_value DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Dead tickets attach to names through customer_id — the only thread from the ledger to the register. The booking's own id would match ticket numbers against account numbers and invent dead value nobody owes.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id, and the pointer lands there. There is no customer_id on the register itself, so that guess errors before the ownership page has a name.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket status",
        why: "The queue is the quoted text 'cancelled', lowercase and exact. 'pending' would report live exposure as dead value and the goodwill ledger would write off bookings that can still ship.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "'pending'", "'shipped'"],
    walkthrough:
      "The ownership page is a status slice grouped per account: bookings joined to accounts on customer_id = c.id, kept to 'cancelled', summed per name, biggest exposure first. Four rows come back: Alice Chen 494.82 across three dead tickets, Keiko Sato 397.99 on one, Emma Wilson 143.86 on one, Maya Patel 115.82 across two. The four accounts' figures reassemble the queue's full 1,152.49 — seven dead bookings, no orphans, page reconciles. Two entries deserve a sentence on the countersignature page: Keiko's 397.99 is the queue's single biggest ticket and it sits on an account flagged inactive, so the goodwill call closes the last meaningful line on a dormant file; and Alice's exposure is spread across three tickets, which reads very differently from one bad booking. Ownership named, figures tied, ledger closes.",
  },
  {
    id: "cs-523",
    tier: "medium",
    topic: "l15",
    universe: "pricing",
    title: "Products above the three-thousand line",
    brief:
      "From: Head of Product. Re: pricing reset, earner shortlist.\n\nThe reset only reprices what earns: any product whose lifetime line revenue clears three thousand makes the shortlist, with the figure attached. Below the line, the item keeps its price and nobody spends a meeting on it. Stored figures, biggest earners first.",
    ask: "Each product with lifetime line revenue above 3000, with the figures, biggest first.",
    template: `SELECT p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
GROUP BY p.name
{3} SUM(oi.quantity * oi.unit_price) > {4}
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and shred every product's total before the gate even applies.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the shortlist exists.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The three-thousand line tests a per-product sum — an aggregate that only exists after grouping — so it lives in HAVING. WHERE runs before buckets exist and rejects the query outright.",
      },
      {
        answer: "3000",
        kind: "number",
        noVerify: true,
        label: "the earner line",
        why: "The reset's bar is 3,000 in lifetime line revenue — the policy line itself, not a figure the shortlist prints. Dropping it to 2,500 would wave the Keyboard onto a list built for genuine earners.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "WHERE", "2500"],
    walkthrough:
      "The shortlist is a per-product revenue sum behind a bucket gate: lines joined to the catalog on product_id = p.id, quantity times booked price summed per item, HAVING keeps the products above 3,000, ranked biggest first. Four products clear the line: Noise-Canceling Headset 6,888.25, Smart Watch S 4,582.02, 4K Webcam Pro 3,989.97, Studio Desktop Mic 3,589.61. The Mechanical Keyboard K1 misses at 2,558.26 — a real earner, but 440 short of this reset's bar, which is exactly the discipline the gate buys. Note what the gate protects: at 2,500 the list grows to five and the meeting spends its time on a keyboard. Four premium products, one line each on the shortlist, every figure a sum of physical lines — the reset starts from evidence.",
  },
  {
    id: "cs-524",
    tier: "medium",
    topic: "l15",
    universe: "inventory",
    title: "Units moved, item by item",
    brief:
      "From: Warehouse operations, cycle-count desk. Re: pick-rate brief.\n\nThe count plan wants movement, not money: every item in the catalog with its total purchased units and the number of sale lines that moved them, densest movers first. Shelf depth tells us what we hold; this tells us what actually leaves. Counts as stored, all sixteen items.",
    ask: "Each product with its total purchased units and sale-line count, densest first.",
    template: `SELECT p.name, COUNT(*) AS lines, {1} AS units
FROM order_items oi
JOIN products p ON {2} = {3}
GROUP BY p.name
ORDER BY units DESC, p.name;`,
    slots: [
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units column",
        why: "Units moved means quantities summed per item — the count column beside it shows how many lines did the moving. A sum of unit prices would print money where the count plan expects units and every tolerance would be set from nonsense.",
      },
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Movement is recorded on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and credit the wrong bins with the wrong volume.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id column of its own — that spelling errors before the brief has rows.",
      },
    ],
    distractors: ["SUM(oi.unit_price)", "COUNT(*)", "oi.id", "p.product_id"],
    walkthrough:
      "The movement brief is two counts per item: lines joined to the catalog on product_id = p.id, lines counted, quantities summed, densest first with the name as tiebreak. The head of the list: Desk Mat Extended 47 units on 24 lines, Noise-Canceling Headset 46 units on 24 lines, HDMI 2.1 Cable 2m 38 units on 19 lines. The shape is the story — the mat and the cable are cheap attach-rate items that leave one or two at a time, while the headset matches their volume at thirty times the price point, one unit a sale. Both patterns deserve tight tolerances for different reasons: the mat's bin turns over constantly, the headset's because a stock-out costs the most. Deeper down the two columns diverge — Smart Watch S moved 23 units on only 11 lines, the file's densest basket — which is exactly the split the count plan cares about.",
  },
  {
    id: "cs-525",
    tier: "medium",
    topic: "l15",
    universe: "funnel",
    title: "Whose basket moves the most units",
    brief:
      "From: Growth marketing lead. Re: campaign seeding, unit velocity.\n\nSeeding goes to the accounts whose baskets actually move volume — total units purchased, not money spent. I want the five heaviest unit movers with their counts, biggest first, so the seed list follows real take-home volume instead of ticket size. Counts as stored.",
    ask: "The 5 accounts that purchased the most units, with the counts, heaviest first.",
    template: `SELECT c.name, {1} AS units
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY {3}
ORDER BY units DESC, c.name
LIMIT {4};`,
    slots: [
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units column",
        why: "Take-home volume is quantities summed per account. A money sum would rank by spend instead — Alice tops both, but the mid-table reshuffles, and the seed list would follow dollars rather than units.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each booking on its account: the booking's customer_id against the register's id. The register has no customer_id of its own, so that guess dies before the seed list exists.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "One row per account means grouping by the register's name column. Grouping by region would produce four geographic buckets and a seed list nobody can mail.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the seed list's depth",
        why: "The campaign seeds exactly five accounts, so the cut is 5. Three would skip a mover the list needs; ten would seed half the register and dilute the stock.",
      },
    ],
    distractors: ["SUM(oi.quantity * oi.unit_price)", "SUM(oi.unit_price)", "c.region", "3"],
    walkthrough:
      "The seed list is unit velocity per account: lines chained to bookings on order_id, bookings to accounts on customer_id = c.id, quantities summed per name, heaviest first with the name as tiebreak, cut at five. The list reads: Alice Chen 100 units, Emma Wilson 98, Grace Kim 67, Maya Patel 62, Pedro Alvarez 27. That fifth seat is a photo finish worth knowing about — Pedro and Chloe Dubois both moved 27 units, and the name tiebreak seats Pedro — so the sixth account missed the list by nothing. The top four are also the top four spenders, but the ordering is not money's: Maya's 62 units beat several bigger wallets, and Emma's 98 sit only two units behind Alice's 100 despite 600 less spend. Units and dollars agree on the head of this file and disagree underneath it — which is precisely why the seed list tracks units.",
  },
  {
    id: "cs-526",
    tier: "medium",
    topic: "l15",
    universe: "supplier",
    title: "The Nordic page, revenue attached",
    brief:
      "From: Supply-chain lead. Re: QBR pack, Nordic section.\n\nThe Nordic Gadgets AB page of the QBR pack lists their three items, but the conversation at the table is about money, not names: what each of those items has actually earned at line grain. Product-by-product revenue for the Nordic shelf, biggest earner first, so procurement can argue volume from the record.",
    ask: "Each product sourced from Nordic Gadgets AB with its lifetime line revenue, biggest first.",
    template: `SELECT p.name, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
JOIN suppliers s ON p.supplier_id = {3}
WHERE s.name = {4}
GROUP BY p.name
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and misattribute half the vendor's book.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the page has rows.",
      },
      {
        answer: "s.id",
        kind: "keyword",
        label: "the vendor's own number",
        why: "The second hop lands each item on its vendor: the item's supplier_id against the vendor file's id. Vendors carry no supplier_id of their own, so that spelling breaks the chain.",
      },
      {
        answer: "'Nordic Gadgets AB'",
        kind: "keyword",
        label: "the registered vendor name",
        why: "The vendor is registered as the exact text 'Nordic Gadgets AB', quotes included. 'Alpine Audio GmbH' would build the Nordic page out of Alpine's two items and the QBR section would misfile both vendors.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "s.supplier_id", "'Alpine Audio GmbH'"],
    walkthrough:
      "The Nordic page is the sourcing chain pinned to one vendor: lines to items on product_id = p.id, items to vendors on p.supplier_id = s.id, filtered to the registered name, summed per product. Three rows come back: Smart Watch S 4,582.02, 4K Webcam Pro 3,989.97, Mechanical Keyboard K1 2,558.26 — and those three figures reassemble Nordic's 11,130.25, the file's biggest vendor book. The mix is the argument for the table: the watch leads on only 11 sale lines because it books at the catalog's ceiling price, while the keyboard needed 15 lines to earn less than half as much. Swap the name chip for Alpine Audio GmbH and the page would print two rows totalling 4,765.63 — a different vendor, a different story, and exactly the misfiling the exact-match filter exists to prevent.",
  },
  {
    id: "cs-527",
    tier: "medium",
    topic: "l15",
    universe: "expense",
    title: "Who books biggest per visit",
    brief:
      "From: Ops finance, spend review. Re: ticket-size watchlist.\n\nThe spend review's habit page ranks accounts by average booking value — who drops the most per visit, not who visits most. Top three, names attached, with the booking counts beside them so a one-visit wonder cannot hide. Figures as stored, averages to the penny.",
    ask: "The 3 accounts with the highest average booking value, with booking counts, biggest first.",
    template: `SELECT c.name, ROUND({1}, 2) AS avg_ticket, COUNT(*) AS bookings
FROM orders o
JOIN customers c ON {2} = {3}
GROUP BY {4}
ORDER BY avg_ticket DESC
LIMIT 3;`,
    slots: [
      {
        answer: "AVG(o.total)",
        kind: "keyword",
        label: "the average-ticket figure",
        why: "Per-visit size is the mean of each account's booking totals. A sum would rank by lifetime spend and hand the habit page to the volume leaders — a different question the review already answers elsewhere.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Tickets reach their owners through customer_id — the only thread from the ledger to the register. The ticket's own id against account ids would fabricate sixteen one-ticket accounts and crown a ghost.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id, and the pointer lands there. There is no customer_id on the register itself, so that spelling errors before the habit page exists.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "One average per account means grouping by the register's name column. Grouping by region would average whole geographies into four buckets and the habit page would describe continents, not people.",
      },
    ],
    distractors: ["SUM(o.total)", "MAX(o.total)", "MIN(o.total)", "c.region"],
    walkthrough:
      "The habit page is a per-account average with a ranked cut: bookings joined to accounts on customer_id = c.id, totals averaged per name, biggest first, cut at three with the counts left visible. The page reads: Liam O'Brien 705.39 on a single booking, Chloe Dubois 533.59 across 5, Farid Nasser 486.32 across 3. The count column is the whole review: Liam's average is one ticket — the Cork account's only booking, the file's famous one-and-done — so his 705.39 is a single data point wearing a crown, while Chloe's 533.59 is a habit repeated five times. Contrast with the volume leaders: Alice Chen tops lifetime spend at 7,262.35 but averages 302.60 a visit — she buys often and small. For the watchlist that distinction is the finding: per-visit size flags different accounts than volume ever will.",
  },
  {
    id: "cs-528",
    tier: "medium",
    topic: "l15",
    universe: "growth",
    title: "Accounts past the twenty-five-hundred mark",
    brief:
      "From: Chief of Staff. Re: board deck, the serious-spenders slide.\n\nThe slide carries the accounts whose lifetime booked value crosses 2,500 — the line the deck treats as serious spend — with the figures attached, biggest first. Everyone below the line is the long tail and stays off the slide. Names, amounts, and nothing else.",
    ask: "Each account with lifetime booked value above 2500, with the figures, biggest first.",
    template: `SELECT c.name, ROUND({3}, 2) AS spend
FROM orders o
JOIN customers c ON {1} = {2}
GROUP BY c.name
{4} SUM(o.total) > {5}
ORDER BY spend DESC;`,
    slots: [
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the booking's account pointer",
        why: "Spend attaches to accounts through customer_id — the thread that reunites every booking with its owner. The booking's own id would match booking numbers against account numbers and invent sixteen phantom accounts.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The register's rows are numbered in id, and the pointer lands there. There is no customer_id on the register itself, so that guess errors before the slide has a name.",
      },
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the lifetime booked value",
        why: "Lifetime value is the account's booking totals summed. An average would test typical ticket size instead of total weight and the 2,500 line would judge the wrong thing entirely.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 2,500 line tests a per-account sum — an aggregate that only exists after grouping — so it lives in HAVING. WHERE runs before any bucket exists and rejects the query outright.",
      },
      {
        answer: "2500",
        kind: "number",
        noVerify: true,
        label: "the serious-spend line",
        why: "The deck's bar is 2,500 in lifetime booked value — the slide's own definition, not a figure it prints. At 1,500 the slide grows a sixth row and the tail starts walking onto the stage.",
      },
    ],
    distractors: ["o.id", "c.customer_id", "AVG(o.total)", "WHERE", "1500"],
    walkthrough:
      "The slide is a per-account sum behind a bucket gate: bookings joined to accounts on customer_id = c.id, totals summed per name, HAVING keeps the accounts above 2,500, ranked biggest first. Five names survive: Alice Chen 7,262.35, Emma Wilson 6,640.56, Grace Kim 4,574.23, Maya Patel 3,644.56, Chloe Dubois 2,667.93. Together they hold 24,789.63 of the book's 34,833.28 — about seven dollars in every ten sit with five accounts, which is the slide's whole argument. Chloe is the line's proof of work: 2,667.93 clears the bar by under 170, so a sloppier cut at 1,500 would have added Pedro Alvarez's 1,686.17 and started the slide's slide toward a leaderboard. Five names, one line, and the tail stays in the appendix where it belongs.",
  },
  {
    id: "cs-529",
    tier: "hard",
    topic: "l15",
    universe: "fraud",
    title: "The inflated pairing, account by account",
    brief:
      "From: Risk team, spot-check rotation. Re: the pairing dispute.\n\nThe dispute the rotation keeps fielding: the paired-lines report shows account totals nobody recognizes. I want both readings side by side per account — the inflated figure the pairing produces when booking totals ride every line, and the honest line-charged figure — biggest inflated first, so the meeting can see exactly where the machinery breaks.",
    ask: "Each account with the inflated paired total and the honest line-charged total, biggest inflated first.",
    template: `SELECT c.name, ROUND({3}, 2) AS inflated, ROUND({4}, 2) AS honest
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY {5}
ORDER BY inflated DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "The pairing exists because lines attach to bookings through order_id — that hop is what photocopies each booking total onto every line. The line's own id would pair line numbers with booking numbers and produce figures that reconcile to nothing.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each booking on its account: the booking's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before the dispute has rows.",
      },
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the inflated paired total",
        why: "Summing booking totals across the pairing bills every booking once per line — three lines, three billings. That triple-charging is precisely the number the dispute keeps tripping over, reproduced on purpose beside the truth.",
      },
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the honest line-charged total",
        why: "Charging each line once — quantity times booked price — values what actually moved. Per account it lands exactly on the figure the order ledger reports, which is what makes the inflated column beside it so readable.",
      },
      {
        answer: "c.name",
        kind: "keyword",
        label: "the grouping column",
        why: "The dispute is per account, so the grouping is the register's name column. Grouping by status would mix every account's bookings into four buckets and hide the per-account mismatch entirely.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "SUM(o.id)", "AVG(o.total)", "COUNT(*)"],
    walkthrough:
      "The dispute table lays the machinery bare per account: lines chained to bookings on order_id, bookings to accounts on customer_id = c.id, both sums side by side, biggest inflated first. The order itself is the headline — the inflated column crowns Emma Wilson at 21,369.77 against an honest 6,640.56, more than triple, because her 17 bookings photocopy onto 46 lines; Alice Chen inflates to 18,784.19 from an honest 7,262.35, and Grace Kim to 13,531.03 from 4,574.23. The honest column restores the real leaderboard — Alice first at 7,262.35 — and both columns reconcile to the same grand truth: 34,833.28 honest against 103,244.55 inflated across the file. Nothing was stolen and nothing was double-billed; the pairing was simply read at the wrong grain. The rotation can close the dispute with one sentence: trust the line-charged column.",
  },
  {
    id: "cs-530",
    tier: "hard",
    topic: "l15",
    universe: "catalog",
    title: "The hero product, counted three ways",
    brief:
      "From: Catalog content manager. Re: sourcing page, the hero dossier.\n\nThe hero dossier needs its product counted three ways at once: how many sale lines carried it, how many units left the building, and what those lines earned. Top three products by line revenue, all three counts on each row. If the counts tell one story and the money another, the dossier says so.",
    ask: "The 3 products with the highest line revenue, with line counts and unit counts, biggest first.",
    template: `SELECT p.name, COUNT(*) AS lines, {3} AS units, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
GROUP BY p.name
ORDER BY revenue DESC
LIMIT {4};`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "All three counts accrue on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and build the dossier out of phantom sales.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the dossier has a row.",
      },
      {
        answer: "SUM(oi.quantity)",
        kind: "keyword",
        label: "the units column",
        why: "Units taken home are quantities summed per item — distinct from the line count beside it, since one line can carry two or three units. A money sum in this slot would print revenue twice and the dossier would lose its units story.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the dossier's depth",
        why: "The page carries exactly three heroes, so the cut is 3. Five is a leaderboard, one is a headline — and the sourcing page's dossier format has three slots.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "SUM(oi.unit_price)", "5"],
    walkthrough:
      "The dossier is three aggregates per product behind one ranking: lines joined to the catalog on product_id = p.id, lines counted, quantities summed, revenue summed at quantity times booked price, ranked by revenue, cut at three. The rows land: Noise-Canceling Headset 24 lines, 46 units, 6,888.25; Smart Watch S 11 lines, 23 units, 4,582.02; 4K Webcam Pro 17 lines, 31 units, 3,989.97. The counts are where the products stop being interchangeable: the headset needed 24 lines to lead, the watch reached second place on just 11 — the densest basket of the three at over 416 per line — and the webcam splits the difference. Revenue ranks them; the counts explain them. That is what the dossier is for: the page can now say how each hero earned its place, not just that it did.",
  },
  {
    id: "cs-531",
    tier: "hard",
    topic: "l15",
    universe: "month-close",
    title: "Tickets versus lines on the close schedule",
    brief:
      "From: Controller. Re: month-end close, account activity schedule.\n\nThe activity schedule needs the heavy accounts counted honestly: real bookings, actual sale lines, and booked value side by side, gated to accounts carrying at least 30 sale lines. The booking count alone keeps flattering the ledger; the lines column shows what the tickets actually contained. Stored figures, biggest value first.",
    ask: "Accounts with at least 30 sale lines, showing distinct bookings, line count and booked value.",
    template: `SELECT c.name, COUNT(DISTINCT {3}) AS tickets, COUNT(*) AS lines, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS spend
FROM order_items oi
JOIN orders o ON {1} = o.id
JOIN customers c ON o.customer_id = {2}
GROUP BY c.name
{4} COUNT(*) >= {5}
ORDER BY spend DESC;`,
    slots: [
      {
        answer: "oi.order_id",
        kind: "keyword",
        label: "the line's booking pointer",
        why: "Lines reach their bookings through order_id — the hop that lets a distinct count of booking ids see through the line repetition. The line's own id would count itself and the tickets column would print the line count's twin.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the account's own number",
        why: "The second hop lands each booking on its account: the booking's customer_id against the register's id. The register has no customer_id of its own, so that guess errors before the schedule exists.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the distinct-count column",
        why: "Distinct booking ids collapse each booking's photocopies back to one — 24 where the raw pairing shows 50 for Alice. A plain count of the booking column would count the copies and agree with the lines column, teaching nothing.",
      },
      {
        answer: "HAVING",
        kind: "keyword",
        label: "the bucket filter",
        why: "The 30-line floor tests a per-account count — an aggregate that only exists after grouping — so it lives in HAVING. WHERE runs before buckets exist and rejects the query outright.",
      },
      {
        answer: "30",
        kind: "number",
        label: "the activity floor",
        why: "The schedule's floor is 30 sale lines per account — and one account sits exactly on the bar, so the inclusive >= is load-bearing: a strict > would drop it and the schedule would lose a row the binder already references.",
      },
    ],
    distractors: ["oi.id", "c.customer_id", "COUNT(o.id)", "WHERE", "35"],
    walkthrough:
      "The schedule is three counts per account behind a bucket floor: lines chained to bookings on order_id, bookings to accounts on customer_id = c.id, distinct booking ids counted against raw lines, spend summed at line grain, HAVING keeps accounts at 30 lines or more. Four rows survive: Alice Chen 24 tickets on 50 lines for 7,262.35; Emma Wilson 17 on 46 for 6,640.56; Grace Kim 14 on 34 for 4,574.23; Maya Patel 13 on 30 for 3,644.56 — exactly on the bar, kept by the inclusive >=. The two count columns are the schedule's point: every heavy account carries roughly two to three lines per booking, and Alice's 24 tickets holding 50 lines is what the booking count alone never shows. Raise the floor to 35 and Maya drops off a schedule the binder already cites — the gate is policy, not arithmetic.",
  },
  {
    id: "cs-532",
    tier: "hard",
    topic: "l15",
    universe: "refund-audit",
    title: "What the dead tickets took with them",
    brief:
      "From: refunds@ — goodwill policy review. Re: basket composition at line grain.\n\nThe policy review wants to know what the cancelled bookings actually contained: product by product, how many lines died, how many units, and the line-charged value that died with them, biggest value first. If the dead baskets are premium gear, the goodwill math changes; if they are cables and mats, it does not.",
    ask: "Each product on a cancelled booking, with line count and line-charged dead value, biggest first.",
    template: `SELECT p.name, COUNT(*) AS lines, {5} AS dead_value
FROM order_items oi
JOIN orders o ON oi.order_id = o.id
JOIN products p ON {1} = {2}
WHERE o.status = {3}
GROUP BY {4}
ORDER BY dead_value DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "The dead basket is read item by item, and each line names its item through product_id. The line's own id would match line numbers against item numbers and attribute the cancellations to products nobody cancelled.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the composition table exists.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket status",
        why: "Dead tickets are the quoted text 'cancelled', lowercase and exact. 'pending' would inventory the open book as if it died and the goodwill math would write off orders that can still ship.",
      },
      {
        answer: "p.name",
        kind: "keyword",
        label: "the grouping column",
        why: "One row per product means grouping by the catalog's name column. Grouping by the account name would answer last cycle's question — who held the dead tickets — and leave the composition unread.",
      },
      {
        answer: "SUM(oi.quantity * oi.unit_price)",
        kind: "keyword",
        label: "the line-charged dead value",
        why: "The value that died is charged line by line — quantity times booked price. Summing the bookings' own totals across the pairing re-bills each cancelled booking once per line and prints figures like 604.18 for a basket that died worth 131.28.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "'pending'", "SUM(o.total)", "SUM(oi.quantity)"],
    walkthrough:
      "The composition table is the chain at line grain behind a status gate: lines to bookings on order_id, lines to items on product_id = p.id, kept to 'cancelled', grouped per product with lines counted and value charged per line. Nine products, twelve dead lines, led by USB-C Hub 7-in-1 at 292.41 on two lines and Studio Desktop Mic at 245.92 on two — and the whole table reassembles the queue's 1,152.49 to the cent. The units column keeps the story honest: the hub died carrying 6 units, the mic just 2, so hub exposure is a bulk basket while mic exposure is price. The inflated twin is worth naming in the review: sum booking totals across the pairing and Yoga Mat Eco 6mm would top the table at 604.18 for a basket that died worth 131.28 — line grain is what keeps the goodwill math anchored to goods that actually left.",
  },
  {
    id: "cs-533",
    tier: "hard",
    topic: "l15",
    universe: "pricing",
    title: "The premium band's honest revenue",
    brief:
      "From: Head of Product. Re: pricing reset, the premium band.\n\nThe reset's premium band starts at 89.99 list — exactly on the bar counts, the keyboard has earned its seat — and I want the band's honest revenue: each member's lifetime line value at quantity times booked price, biggest earner first, with list prices beside the figures so the room can see premium against performance.",
    ask: "Each product priced at 89.99 or above, with list price and lifetime line revenue, biggest revenue first.",
    template: `SELECT p.name, {3}, ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
FROM order_items oi
JOIN products p ON {1} = {2}
WHERE p.price >= {4}
GROUP BY p.name
ORDER BY revenue DESC;`,
    slots: [
      {
        answer: "oi.product_id",
        kind: "keyword",
        label: "the line's catalog pointer",
        why: "Revenue accrues on lines, and each line names its item through product_id. The line's own id would match line numbers against item numbers and shred every band member's total.",
      },
      {
        answer: "p.id",
        kind: "keyword",
        label: "the catalog's own number",
        why: "The pointer lands on the catalog's id column. The catalog has no product_id of its own — that guess errors before the band exists.",
      },
      {
        answer: "p.price",
        kind: "keyword",
        label: "the list-price column",
        why: "The room needs list beside performance, so the catalog's price column rides on every row. Stock would print warehouse depth where the band expects dollars and the pricing story would read like a count sheet.",
      },
      {
        answer: "89.99",
        kind: "number",
        label: "the band's price floor",
        why: "The band opens at 89.99 — and the Mechanical Keyboard K1 sits exactly on the bar, so the inclusive >= is load-bearing: a penny higher and the band loses a member the reset already briefed.",
      },
    ],
    distractors: ["oi.id", "p.product_id", "p.stock", "79", "100"],
    walkthrough:
      "The band is a price gate on the catalog side of a line-grain sum: lines joined to items on product_id = p.id, kept to list prices at or above 89.99, revenue summed per product, list price printed beside each figure. Five members: Noise-Canceling Headset 6,888.25 at 149.99 list, Smart Watch S 4,582.02 at 199.99, 4K Webcam Pro 3,989.97 at 129, Studio Desktop Mic 3,589.61 at 119, Mechanical Keyboard K1 2,558.26 at exactly 89.99. The keyboard is the boundary case the room should hear: it rides the bar, so the inclusive comparison is what keeps the band at five. Drop the floor to 79 and the Fitness Band X2 walks in at 2,347.10; raise it to 100 and the keyboard is out despite earning more than the next band candidate. Five figures, all line-charged, all reconcilable into the book's 34,833.28 — the reset's premium story starts from evidence.",
  },
];
