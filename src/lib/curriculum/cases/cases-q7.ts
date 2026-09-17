// Case batch Q7 — Module 4 cases cs-1115…cs-1157.
// 43 cases: 14 easy / 15 medium / 14 hard across topics q7 (CTE chains —
// final 34) and q8 (Subquery capstone — 9). Every figure was probed against
// the live seed db (scripts/m4-facts-q3*.ts, m4-facts-d3/d4/d5 series) and
// is mechanically re-verified by scripts/case-audit.ts. Batch Q8 (cs-1158…)
// closes the Module 4 deck.

import type { CaseStudy } from "./types";

export const casesQ7: CaseStudy[] = [
  {
    id: "cs-1115",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The heavy roster, chained",
    brief:
      "From: Growth lead. Re: the heavy roster with names.\n\nper folds the counts, big keeps thirteen-plus, and the main query joins back for names. The full three-layer read: counts become names.",
    ask: "One query: names and counts of the customers in the big CTE, joined back from per.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= {3})
SELECT c.name, big.n FROM big JOIN customers c ON c.id = big.{1}
ORDER BY big.n {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id forward; the join matches it to c.id to attach names.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first read",
        why: "DESC reads Alice 24, Emma 17, Grace 14, Maya 13 — top-down.",
      },
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the heavy line",
        why: "Thirteen is the chain's line, not a result figure. Probed: four accounts clear it.",
      },
    ],
    distractors: ["id", "ASC", "status"],
    walkthrough:
      "Three layers: per folds 103 orders to sixteen counts, big keeps the four at thirteen-plus, and the join back attaches names — Alice 24, Emma 17, Grace 14, Maya 13. Join on big.id and the engine refuses: the stage projected customer_id, not id. ASC inverts the read, leading with the boundary account. Group by status upstream and the chain never produces these rows. This is the canonical count-to-name report: fold, cut, join — every roster in the deck is this chain with a different line.",
  },
  {
    id: "cs-1116",
    tier: "easy",
    topic: "q7",
    universe: "expense",
    title: "The 2k roster, priced",
    brief:
      "From: Finance partner. Re: the 2k list with figures.\n\nspend prices accounts, big keeps past-2k, join back for names and figures. Five rows out — the retention shortlist with prices attached.",
    ask: "One query: names and spends of the customers in the big CTE (past 2,000), joined back.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > {3})
SELECT c.name, big.s FROM big JOIN customers c ON c.id = big.{1}
ORDER BY big.s {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join attaches each price to its name.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first read",
        why: "DESC leads with 7262.35 — the heaviest account first.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the spend line",
        why: "Two thousand is the chain's line, not a result figure. Probed: five accounts clear it.",
      },
    ],
    distractors: ["id", "ASC", "total"],
    walkthrough:
      "The spend stage prices sixteen accounts; big keeps the five past 2,000; the join back attaches names sorted biggest-first — 7262.35 down to the line. Join on big.id and the engine refuses: the stage's projection is its schema. ASC leads with the cheapest qualifier — the list's floor, not its headline. The roster with prices is the retention team's working document, and the chain is what keeps it reproducible: same fold, same cut, same order every week.",
  },
  {
    id: "cs-1117",
    tier: "easy",
    topic: "q7",
    universe: "month-close",
    title: "The waiting roster, named",
    brief:
      "From: Ops controller. Re: the waiting list with names.\n\nhold gathers the pending ids, cold folds them per account, join back for names. Eight accounts are waiting — put names on the list.",
    ask: "One query: names and pending counts of the customers in the cold CTE, joined back.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = {3}),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY customer_id)
SELECT c.name, cold.pn FROM cold JOIN customers c ON c.id = cold.{1}
ORDER BY cold.pn {2}, c.name;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "cold carries customer_id; the join attaches each waiting count to its name.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the longest-wait-first read",
        why: "DESC reads the three-time waiters before the two-time ones.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the register's filter",
        why: "hold gathers exactly the fourteen pending rows' customer ids.",
      },
    ],
    distractors: ["id", "ASC", "region"],
    walkthrough:
      "The hold register gathers fourteen pending ids; cold folds them to eight waiting accounts; the join back attaches names — Alice and Emma at three, Chloe and Maya at two, four more at one. Join on cold.id and the engine refuses: the fold projected customer_id. ASC reads the single-waiters first — a gentler triage than the memo asked for. The waiting roster is the ops standup's first slide, and the chain is why its counts reconcile: fourteen rows in, eight accounts out, sums matching.",
  },
  {
    id: "cs-1118",
    tier: "easy",
    topic: "q7",
    universe: "refund-audit",
    title: "The scarred roster, named",
    brief:
      "From: Support lead. Re: the apology list with counts.\n\ngone gathers the cancelled ids, burnt folds them per account, join back for names. Four accounts behind seven cancellations — name them.",
    ask: "One query: names and cancellation counts of the customers in the burnt CTE, joined back.",
    template: `WITH gone AS (SELECT customer_id FROM orders WHERE status = {3}),
burnt AS (SELECT customer_id, COUNT(*) AS cn FROM gone GROUP BY customer_id)
SELECT c.name, burnt.cn FROM burnt JOIN customers c ON c.id = burnt.{1}
ORDER BY burnt.cn {2}, c.name;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "burnt carries customer_id; the join attaches each scar count to its name.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the worst-first read",
        why: "DESC leads with the most-cancelled account — the apology list's headline.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the register's filter",
        why: "gone gathers exactly the seven cancelled rows' customer ids.",
      },
    ],
    distractors: ["id", "ASC", "product_id"],
    walkthrough:
      "The gone register holds seven cancelled ids; burnt folds them to four scarred accounts; the join back attaches names, worst-first. Join on burnt.id and the engine refuses — the fold's projection rules. ASC reads the single-scar accounts first; the memo said worst-first. Four names from seven rows: the fold is where rows became accounts, and the roster is the outreach list the support lead sends today.",
  },
  {
    id: "cs-1119",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The duo's combined load",
    brief:
      "From: Growth lead. Re: the head-to-head total.\n\nper folds the counts, top2 sorts and trims to the biggest pair, and the main query sums them — the two heavyweights' combined order load.",
    ask: "One query: the summed counts in the top2 CTE, chained off per.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), top2 AS (SELECT n FROM per ORDER BY n {1}
LIMIT {3}) SELECT {2}(n) FROM top2;`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the fold so the trim keeps 24 and 17 — the heavyweights.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the duo aggregator",
        why: "SUM(n) over the trimmed pair: 24 + 17 = 41 combined orders.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the duo trim",
        why: "Two is the trim, not a result figure — the chain keeps the biggest pair.",
      },
    ],
    distractors: ["ASC", "COUNT", "status"],
    walkthrough:
      "The fold builds sixteen counts; top2 trims the biggest pair — 24 and 17; the main query sums them: 41. ASC trims the quiet pair instead — 1 and 1, sum 2. COUNT over the pair reads 2, its size. Stage the fold by status and the duo becomes bucket sizes — a different metric. Forty-one is nearly forty percent of the book in two accounts, and the chain makes the figure reproducible: same fold, same trim, same sum every run.",
  },
  {
    id: "cs-1120",
    tier: "easy",
    topic: "q7",
    universe: "refund-audit",
    title: "The heavy scars, by region",
    brief:
      "From: Support lead. Re: the worst-scarred regions.\n\ngone gathers the cancelled rows, reg folds them by region, and the main query keeps the regions carrying three or more scars. Count the heavy-scar regions.",
    ask: "One query: the count of regions in reg with 3 or more cancellations.",
    template: `WITH gone AS (SELECT customer_id FROM orders WHERE status = 'cancelled'),
reg AS (SELECT c.region, COUNT(*) AS n FROM gone JOIN customers c
ON c.id = gone.customer_id GROUP BY c.{3}) SELECT {1}(*) FROM reg
WHERE n >= {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chained counter",
        why: "COUNT(*) over the cut regional stage: 2 regions carry three or more scars.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the heavy-scar line",
        why: "Three is the line, not a result figure. Probed: APAC and EU sit at 3 each; US at 1.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the placeholder key",
        why: "The regional stage groups the joined scars by the roster's region column.",
      },
    ],
    distractors: ["SUM", "4", "name"],
    walkthrough:
      "The gone register holds seven cancelled ids; reg distributes them by region — APAC 3, EU 3, US 1; the cut at three keeps 2 heavy-scar regions. Raise the line to four and the map empties — no region carries four scars. SUM over the cut totals 6 — the heavy regions' combined scars. Name in place of region and the grouping becomes per-account names — a different map. Two regions carry six of seven scars; the regional cut tells the outreach team where the refunds cluster.",
  },
  {
    id: "cs-1121",
    tier: "easy",
    topic: "q7",
    universe: "month-close",
    title: "The small buckets' weight",
    brief:
      "From: Ops controller. Re: the small buckets' total.\n\nst folds the status census, small keeps buckets under fifteen, and the main query sums their orders — the weight outside the big states.",
    ask: "One query: the summed order counts in the small CTE (buckets under 15).",
    template: `WITH st AS (SELECT status, COUNT(*) AS n FROM orders
GROUP BY {2}), small AS (SELECT status, n FROM st WHERE n < {3})
SELECT {1}(n) FROM small;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the small-bucket total",
        why: "SUM(n) over the chain: 14 + 7 = 21 orders outside the big states.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the staging key",
        why: "The first stage folds orders by status into four buckets.",
      },
      {
        answer: "15",
        kind: "number",
        noVerify: true,
        label: "the small-bucket line",
        why: "Fifteen is the line, not a result figure. Probed: pending (14) and cancelled (7) fall below it.",
      },
    ],
    distractors: ["COUNT", "region", "s"],
    walkthrough:
      "The census folds 103 orders into four buckets; small keeps pending (14) and cancelled (7); the sum reads 21 — one in five orders sits in a small state. COUNT over the chain reads 2 — buckets, not orders. Re-project s and the engine refuses: the census named its column n. Twenty-one is the exception report's size: everything the two big states do not explain, staged and summed in one chain.",
  },
  {
    id: "cs-1122",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The thin markets, counted",
    brief:
      "From: Growth lead. Re: the thin-market count.\n\nby_region folds the census, thin keeps buckets under five, and the main query counts them — the map's thin dots.",
    ask: "One query: the count of regions in the thin CTE (fewer than 5 customers).",
    template: `WITH by_region AS (SELECT region, COUNT(*) AS n FROM customers
GROUP BY {3}), thin AS (SELECT region, n FROM by_region WHERE n < {2})
SELECT {1}(*) FROM thin;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chained counter",
        why: "COUNT(*) over the chained stage: 2 thin markets.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the thin line",
        why: "Five is the line, not a result figure. Probed: US (2) and LATAM (1) fall below it.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the staging key",
        why: "The first stage folds the roster by region into four buckets.",
      },
    ],
    distractors: ["SUM", "status", "customers"],
    walkthrough:
      "The census folds sixteen customers into four region buckets; thin keeps US (2) and LATAM (1); the count reads 2 — two thin markets on the map. SUM over the chain reads 3 — their population. Stage the census by status and the chain asks which status buckets are thin — none. The thin-market count is the expansion deck's opening figure: two dots worth growing, two regions that already carry fourteen of the sixteen customers.",
  },
  {
    id: "cs-1123",
    tier: "easy",
    topic: "q7",
    universe: "expense",
    title: "The 5k club's combined bill",
    brief:
      "From: Finance partner. Re: the club's total.\n\nspend prices accounts, big keeps past-5k, and the main query sums the club's spending — the two heavyweights' combined weight.",
    ask: "One query: the summed spends in the big CTE (past 5,000).",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY {2}), big AS (SELECT customer_id, s FROM spend WHERE s > 5000)
SELECT {1}({3}) FROM big;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the club aggregator",
        why: "SUM(s) over the chain: 7262.35 + 6640.56 = 13902.91.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The spend stage folds orders per customer into one price each.",
      },
      {
        answer: "s",
        kind: "keyword",
        label: "the staged spend column",
        why: "Both stages carry the price as s — the column the sum reads.",
      },
    ],
    distractors: ["COUNT", "AVG", "region"],
    walkthrough:
      "The spend stage prices sixteen accounts; big keeps the two past 5,000; the sum reads 13,902.91 — two accounts, forty percent of the store's book. COUNT over the chain reads 2 — members, not money. AVG reads 6,951.46, the club's mean — a different headline. Ask the chain for region and the engine refuses: the stages named their column s. The club's combined bill is the board's concentration figure, and the chain is how it stays honest.",
  },
  {
    id: "cs-1124",
    tier: "easy",
    topic: "q7",
    universe: "growth",
    title: "The regulars, chained",
    brief:
      "From: Growth lead. Re: the regulars' census, chained.\n\nper folds the counts, big cuts at five, and the main query counts — the regulars' roster through a two-stage chain.",
    ask: "One query: the count of rows in the big CTE, chained off per at 5+.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {2}), big AS (SELECT customer_id, n FROM per WHERE n >= {3})
SELECT {1}(*) FROM big;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chained counter",
        why: "COUNT(*) over the second stage: 5 regulars.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer into counts.",
      },
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the regulars' line",
        why: "Five is the chain's line, not a result figure. Probed: five accounts clear it.",
      },
    ],
    distractors: ["SUM", "status", "id"],
    walkthrough:
      "The fold builds sixteen counts; big keeps the five at five-plus — the four heavyweights plus the steady regular. Stage the fold by status and the chain counts buckets past five — two. SUM over the chain totals 73 — the regulars' combined orders. The chained build is the roster the loyalty program imports: one fold, one cut, one count, and the same five accounts every week unless the data moves.",
  },
  {
    id: "cs-1125",
    tier: "easy",
    topic: "q7",
    universe: "month-close",
    title: "The repeat waiters, named",
    brief:
      "From: Ops controller. Re: the escalation list with names.\n\nhold gathers pending ids, cold folds per account, and the cut keeps the double-waiters. Join back and name the escalation list.",
    ask: "One query: names and pending counts of customers in cold with 2 or more pending orders.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY customer_id),
repeat AS (SELECT customer_id, pn FROM cold WHERE pn >= {3})
SELECT c.name, repeat.pn FROM repeat JOIN customers c ON c.id = repeat.{1}
ORDER BY repeat.pn {2}, c.name;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "repeat carries customer_id; the join attaches each escalation to its name.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the worst-first read",
        why: "DESC leads with the three-time waiters — the meeting's first agenda item.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the repeat line",
        why: "Two is the escalation line, not a result figure. Probed: four accounts wait twice or more.",
      },
    ],
    distractors: ["id", "ASC", "email"],
    walkthrough:
      "The chain: hold gathers fourteen pending ids, cold folds them to eight waiting accounts, repeat keeps the four at two-plus; the join back names them — Alice and Emma at three, Chloe and Maya at two. Join on repeat.id and the engine refuses: the stage's projection rules. ASC reads the two-time waiters first — softer triage than the memo wants. The escalation list with names is the ops meeting's opening row, and the chain is what makes it reproducible every Monday.",
  },
  {
    id: "cs-1126",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "The map's total weight",
    brief:
      "From: Finance partner. Re: the regional map, totalled.\n\nThe three-stage spend map ends in regional buckets. Sum the buckets and reconcile: every heavy spender must land in exactly one region — five in all.",
    ask: "One query: the summed spender counts across the by_region CTE (past-2k spenders).",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > 2000),
by_region AS (SELECT c.region, COUNT(*) AS n FROM big JOIN customers c
ON c.id = big.{2} GROUP BY c.{3}) SELECT {1}(n) FROM by_region;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the map's reconciler",
        why: "SUM(n) over the regional buckets: 2 + 2 + 1 = 5 heavy spenders.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join back is where regions enter the chain.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the map's grouping key",
        why: "The final stage folds the survivors by region into three buckets.",
      },
    ],
    distractors: ["COUNT", "AVG", "s"],
    walkthrough:
      "Three stages price, cut and fold: five heavy spenders land in three regional buckets — APAC 2, EU 2, US 1; the sum reassembles the total: 5, reconciling with the big stage's own count. COUNT(n) reads 3 — the map's dots, not its weight. AVG reads 1.67 — spenders per region, a density. Read s in the final stage and the engine refuses: by_region projected region and n only. Reconciliation is the chain's audit trail: fold, sum, compare — and the figures agree.",
  },
  {
    id: "cs-1127",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "Europe's heavyweight, totalled",
    brief:
      "From: Growth lead. Re: the EU heavy cut, totalled.\n\nThe chained heavy register filtered to Europe holds one account. Sum its orders — Europe's entire heavy-tier load in one figure.",
    ask: "One query: the summed counts in the EU-cut big CTE (13+ orders, Europe).",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= 13),
eu_big AS (SELECT b.customer_id, b.n FROM big b JOIN customers c
ON c.id = b.{3} WHERE c.region = {2}) SELECT {1}(n) FROM eu_big;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the regional aggregator",
        why: "SUM(n) over the EU-cut register: 24 — Alice Chen's whole heavy load.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the regional filter",
        why: "The final stage scopes the heavy register to Europe — one account qualifies.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join back is where the region filter becomes possible.",
      },
    ],
    distractors: ["COUNT", "region", "s"],
    walkthrough:
      "Three stages: per folds to counts, big keeps the four heavies, eu_big scopes to Europe — one row, Alice Chen. SUM reads her 24 orders: the continent's entire heavy-tier load. COUNT reads 1 — the roster's size. AVG and MIN over a single row all read 24 — the degenerate case where every aggregate agrees. When a regional cut holds one account, the sum, the count and the mean tell the same story — and the chain is what proves the roster really is that thin.",
  },
  {
    id: "cs-1128",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "Asia-Pacific's heavy pair",
    brief:
      "From: Finance partner. Re: the APAC cut.\n\nThe chained spend register scoped to APAC: two of the five heavy spenders live there. Count them through the three-stage chain.",
    ask: "One query: the count of APAC customers in the big CTE (past-2k spenders).",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > 2000),
apac_big AS (SELECT b.customer_id, b.s FROM big b JOIN customers c
ON c.id = b.{3} WHERE c.region = {1}) SELECT {2}(*) FROM apac_big;`,
    slots: [
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the regional filter",
        why: "The final stage scopes the heavy register to Asia-Pacific — two accounts qualify.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chained counter",
        why: "COUNT(*) over the scoped stage: 2 APAC heavy spenders.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join back attaches each price to its region.",
      },
    ],
    distractors: ["SUM", "region", "WHERE"],
    walkthrough:
      "Three stages: spend prices sixteen accounts, big keeps the five past 2,000, apac_big scopes to Asia-Pacific — two rows. Point the filter at 'EU' and the count stays 2 — Europe's own pair; the regions tie. SUM over the scoped stage totals the pair's combined weight. WHERE cannot replace the JOIN — the region lives on the roster. The regional cuts are one-line edits to the same chain, which is why the map stays consistent: every region reads the same priced stage.",
  },
  {
    id: "cs-1129",
    tier: "medium",
    topic: "q7",
    universe: "month-close",
    title: "The longest waiter",
    brief:
      "From: Ops controller. Re: the head of the queue.\n\nThe chained pending fold, sorted worst-first and trimmed to one — the account with the most open orders, however many that is.",
    ask: "One query: the pending count of the worst waiter, from the chained cold CTE.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY {3})
SELECT pn FROM cold ORDER BY pn {1} LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the worst-first sort",
        why: "DESC ranks the fold so the trim keeps the deepest backlog: 3 pending orders.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the head-of-queue trim",
        why: "One is the trim, not a result figure — the query wants the queue's head alone.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the register's column",
        why: "hold gathers customer ids from the pending rows; cold folds them per account.",
      },
    ],
    distractors: ["ASC", "2", "status"],
    walkthrough:
      "The chain gathers fourteen pending rows and folds them to eight waiting accounts; the DESC sort leads with the deepest backlog — 3 pending orders — and the trim keeps it. ASC keeps the shallowest: 1. Widen the trim to 2 and the second three-time waiter rides along — the tie at the top means the head of the queue is two accounts deep. The figure is the escalation trigger: when the queue's head hits three, the ops meeting calls the account.",
  },
  {
    id: "cs-1130",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "The champion, chained and trimmed",
    brief:
      "From: Growth lead. Re: the top row, full chain.\n\nper folds the counts, big cuts at the heavy line, and the final stage sorts and trims to one — the champion's figure through three named stages.",
    ask: "One query: the biggest count in the big CTE, chained off per at 13+.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}), big AS (SELECT customer_id, n FROM per WHERE n >= 13)
SELECT n FROM big ORDER BY n {1} LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the heavy register so the trim keeps the top: 24 orders.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion trim",
        why: "One is the trim, not a result figure — the chain keeps the single biggest row.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer; big reads that fold.",
      },
    ],
    distractors: ["ASC", "id", "status"],
    walkthrough:
      "Three stages: per folds to sixteen counts, big keeps the four heavies, and the final sort-and-trim keeps the top: 24. ASC keeps the heavy tier's floor instead — 13, the boundary account. Widen the trim to 2 and the runner-up rides along. The champion through the chain costs one more stage than reading per directly — and buys a named intermediate the deck can re-cut: the same big stage feeds the roster, the sum, and this headline.",
  },
  {
    id: "cs-1131",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "The top price tag, chained",
    brief:
      "From: Finance partner. Re: the peak, chained.\n\nspend prices accounts, big keeps past-2k, and the final stage sorts and trims to one — the biggest price tag behind the 2k line.",
    ask: "One query: the highest spend in the big CTE, chained off spend at 2,000+.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY {3}), big AS (SELECT customer_id, s FROM spend WHERE s > 2000)
SELECT s FROM big ORDER BY s {1} LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the club so the trim keeps the top: 7262.35.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the peak trim",
        why: "One is the trim, not a result figure — the chain keeps the single biggest price.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The spend stage folds orders per customer into one price each.",
      },
    ],
    distractors: ["ASC", "id", "status"],
    walkthrough:
      "Three stages: spend prices sixteen accounts, big keeps the five past 2,000, and the final sort-and-trim keeps the peak: 7262.35. ASC keeps the club's floor instead — the cheapest qualifier above the line. Widen the trim to 2 and the runner-up's 6,640.56 rides along. The chained peak costs nothing extra to run — the stages were already built for the roster — and the figure reconciles with the MAX-over-stage read: same fold, same answer, different road.",
  },
  {
    id: "cs-1132",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "Europe's order book, chained",
    brief:
      "From: Growth lead. Re: the register's breadth.\n\nTwo registers chained: eu holds the European ids, eu_orders holds their orders. Count the distinct accounts inside the book — every European customer ordered at least once.",
    ask: "One query: the distinct customer count inside the eu_orders CTE.",
    template: `WITH eu AS (SELECT id FROM customers WHERE region = {3}),
eu_orders AS (SELECT * FROM orders WHERE customer_id IN (SELECT id FROM eu))
SELECT {1}(DISTINCT {2}) FROM eu_orders;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "COUNT(DISTINCT customer_id) over the book: 8 accounts — every EU customer ordered.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the distinct column",
        why: "The book carries customer_id per order; DISTINCT collapses 45 rows to the accounts behind them.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the register's filter",
        why: "The eu register gathers the eight European ids the book is built from.",
      },
    ],
    distractors: ["SUM", "id", "'APAC'"],
    walkthrough:
      "The eu register holds eight ids; eu_orders holds their 45 orders; the distinct count collapses the book to its accounts: 8 — nobody in Europe has zero orders. Count the rows instead and the read is 45 — the book's weight, not its breadth. Distinct over id would count 45 again — every order has its own id. SUM cannot count a distinct. Breadth and weight are the register's two reads: 8 accounts wide, 45 orders deep — and the chain names both.",
  },
  {
    id: "cs-1133",
    tier: "medium",
    topic: "q7",
    universe: "month-close",
    title: "The small buckets, listed",
    brief:
      "From: Ops controller. Re: the small-bucket extract.\n\nst folds the census, small keeps buckets under fifteen, and the main query lists them with figures — the exception report's two rows.",
    ask: "One query: the statuses and counts in the small CTE (buckets under 15).",
    template: `WITH st AS (SELECT status, COUNT(*) AS n FROM orders
GROUP BY status), small AS (SELECT status, n FROM st WHERE n < {3})
SELECT {1}, {2} FROM small ORDER BY n DESC;`,
    slots: [
      {
        answer: "status",
        kind: "keyword",
        label: "the bucket's name",
        why: "The extract lists the small buckets by name: pending and cancelled.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "Both stages carry the count as n; the extract reads it beside each name.",
      },
      {
        answer: "15",
        kind: "number",
        noVerify: true,
        label: "the small-bucket line",
        why: "Fifteen is the line, not a result figure. Probed: pending (14) and cancelled (7) fall below it.",
      },
    ],
    distractors: ["s", "id", "region"],
    walkthrough:
      "The census folds 103 orders into four buckets; small keeps pending (14) and cancelled (7); the extract lists both with figures, biggest first. Ask for s and the engine refuses: the stages named their column n. The DESC sort leads with the holding pen — the larger exception first. The two-row extract is the close's exception appendix, and the chain is what keeps it two rows: the line at fifteen sits between the small buckets and the book's big states.",
  },
  {
    id: "cs-1134",
    tier: "medium",
    topic: "q7",
    universe: "expense",
    title: "The map's breadth",
    brief:
      "From: Finance partner. Re: the map's spread.\n\nThe three-stage spend map ends in regional buckets. Count the DISTINCT regions the heavy spenders spread across — the map's width.",
    ask: "One query: the distinct region count in the chained heavy-spender build (past 2,000).",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > {3})
SELECT {1}(DISTINCT c.{2}) FROM big JOIN customers c ON c.id = big.customer_id;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "COUNT(DISTINCT region) over the joined club: 3 regions — APAC, EU and US.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the spread column",
        why: "The join back attaches each spender's region; DISTINCT collapses five spenders to three regions.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the spend line",
        why: "Two thousand is the chain's line, not a result figure. Probed: five accounts clear it.",
      },
    ],
    distractors: ["SUM", "name", "region_id"],
    walkthrough:
      "The priced stage cuts to five heavy spenders; the join back attaches regions; the distinct count collapses them to 3 — the map's width. Count the rows instead and the read is 5 — spenders, not regions. Distinct over name would read 5 again — every spender is a different person. SUM cannot count a distinct. Width and weight: five spenders across three regions — and LATAM's absence is the map's quietest fact.",
  },
  {
    id: "cs-1135",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "Past five, chained",
    brief:
      "From: Growth lead. Re: the strict cut.\n\nThe chained heavy cut with a twist: past five, strictly — the regular at exactly five stays out. Count the chain's survivors.",
    ask: "One query: the count of rows in the big CTE, chained off per at more than 5.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}), big AS (SELECT customer_id, n FROM per WHERE n > {1})
SELECT {2}(*) FROM big;`,
    slots: [
      {
        answer: "5",
        kind: "number",
        noVerify: true,
        label: "the strict line",
        why: "Five is the line, not a result figure — the strict > drops its own occupant.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chained counter",
        why: "COUNT(*) over the filtered stage: 4 accounts live strictly past five.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer into counts.",
      },
    ],
    distractors: ["SUM", "4", "region"],
    walkthrough:
      "The fold builds sixteen counts; the strict cut past five keeps the four heavyweights — the five-order regular sits exactly on the line and the > excludes her. Widen to >= and she returns: 5. Raise the line to six and the answer is identical — the histogram's gap means nothing lives at six through twelve. Stage the fold by status and two buckets clear the line. Boundary discipline in a chain: the cut's operator decides the roster before the main query ever runs.",
  },
  {
    id: "cs-1136",
    tier: "medium",
    topic: "q7",
    universe: "month-close",
    title: "The queue's total weight",
    brief:
      "From: Ops controller. Re: the fold's reconciliation.\n\nhold gathers the pending rows, cold folds them per account. Sum the fold and reconcile: the queue's weight must equal the raw pending count — fourteen.",
    ask: "One query: the summed pending counts across the cold CTE.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY {2})
SELECT {1}({3}) FROM cold;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the reconciliation aggregator",
        why: "SUM(pn) over the fold: 3 + 3 + 2 + 2 + ... = 14 — every pending row accounted for.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the register's column",
        why: "hold gathers customer ids from the pending rows; cold folds them per account.",
      },
      {
        answer: "pn",
        kind: "keyword",
        label: "the staged count column",
        why: "The fold projects the per-account pending count as pn; the sum reads it.",
      },
    ],
    distractors: ["COUNT", "AVG", "n"],
    walkthrough:
      "The register holds fourteen pending ids; the fold collapses them to eight waiting accounts; the sum reassembles the queue: 14, reconciling with the raw count. COUNT(pn) reads 8 — the roster's size, not the queue's weight. AVG reads 1.75 — the average waiter's backlog. Read n and the engine refuses: the fold named its column pn. The reconciliation is the fold's receipt: whatever the GROUP BY splits, the SUM must put back together.",
  },
  {
    id: "cs-1137",
    tier: "medium",
    topic: "q7",
    universe: "growth",
    title: "The heavy tier's mean",
    brief:
      "From: Growth lead. Re: the heavy mean, chained.\n\nper folds the counts, big keeps thirteen-plus, and the main query averages the heavy tier — the chase pack's centre of gravity.",
    ask: "One query: the average count in the big CTE, chained off per at 13+.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {2}), big AS (SELECT customer_id, n FROM per WHERE n >= 13)
SELECT ROUND({1}({3}), 1) FROM big;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the heavy mean",
        why: "AVG(n) over the heavy tier: (24+17+14+13)/4 = 17 — the chase pack's centre.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer into counts.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "Both stages carry the count as n — the column the mean reads.",
      },
    ],
    distractors: ["SUM", "COUNT", "MIN"],
    walkthrough:
      "The fold builds sixteen counts; big keeps the four heavies; the mean reads 17 — half the champion, triple the regular. SUM over the tier reads 68, its combined load. COUNT reads 4, its size. MIN reads 13, its floor. Four figures from one chain, each answering a different board question — and the mean is the one the deck quotes, because seventeen is the number a good year looks like.",
  },
  {
    id: "cs-1138",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "The heavy tier's floor",
    brief:
      "From: Growth lead. Re: the tier's entry point.\n\nThe heavy chain's floor: the SMALLEST count still inside the thirteen-plus register. Read it — the tier's entry point is the boundary account's own figure.",
    ask: "One query: the minimum count in the big CTE, chained off per at 13+.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {2}), big AS (SELECT customer_id, n FROM per WHERE n >= 13)
SELECT {1}({3}) FROM big;`,
    slots: [
      {
        answer: "MIN",
        kind: "keyword",
        label: "the floor reader",
        why: "MIN(n) over the heavy register: 13 — the boundary account is the tier's floor.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer into counts.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "Both stages carry the count as n — the column the floor reads.",
      },
    ],
    distractors: ["MAX", "COUNT", "status"],
    walkthrough:
      "The fold builds sixteen counts; big keeps the four heavies — 24, 17, 14, 13; the floor reads the smallest: 13, the boundary account's own figure. MAX reads the ceiling: 24. COUNT reads 4, the tier's size. Stage the fold by status and the floor becomes 7 — the smallest bucket, a different building entirely. The tier's entry point is defined by its last member: thirteen is both the line and the name of the account standing on it, and the chain reads the two as one figure.",
  },
  {
    id: "cs-1139",
    tier: "hard",
    topic: "q7",
    universe: "month-close",
    title: "The escalation list's backlog",
    brief:
      "From: Ops controller. Re: the list's combined weight.\n\nThe three-stage escalation chain ends with four repeat waiters. Sum their open orders — the list's combined backlog, the figure the standup sizes the follow-up by.",
    ask: "One query: the summed pending counts in the repeat CTE (2+ pending).",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY {2}),
repeat AS (SELECT customer_id, pn FROM cold WHERE pn >= 2)
SELECT {1}({3}) FROM repeat;`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the backlog aggregator",
        why: "SUM(pn) over the escalation list: 3 + 3 + 2 + 2 = 10 open orders.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the register's column",
        why: "hold gathers customer ids from the pending rows; the chain follows that thread.",
      },
      {
        answer: "pn",
        kind: "keyword",
        label: "the staged count column",
        why: "The fold projects the per-account pending count as pn; the sum reads it.",
      },
    ],
    distractors: ["COUNT", "AVG", "MAX"],
    walkthrough:
      "Three stages: hold gathers fourteen pending ids, cold folds them to eight accounts, repeat keeps the four at two-plus; the sum reads their combined backlog: 10 — most of the queue held by half the waiters. COUNT reads 4 — the list's size. AVG reads 2.5 — the average escalation. MAX reads 3 — the worst single case. Ten of fourteen pending orders sit on the escalation list; the chain is how the standup knows the follow-up is worth it.",
  },
  {
    id: "cs-1140",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "The chain inside the chain",
    brief:
      "From: Growth lead. Re: the nested cut.\n\nTwo cuts stacked: big keeps thirteen-plus, big2 keeps twenty-plus inside that. A chain of chains — count the innermost stage.",
    ask: "One query: the count of rows in big2, chained off big off per (13+, then 20+).",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}), big AS (SELECT customer_id, n FROM per WHERE n >= 13),
big2 AS (SELECT customer_id, n FROM big WHERE n >= {1}) SELECT {2}(*) FROM big2;`,
    slots: [
      {
        answer: "20",
        kind: "number",
        noVerify: true,
        label: "the inner cut",
        why: "Twenty is the inner line, not a result figure. Probed: the innermost stage holds 1 row.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the innermost counter",
        why: "COUNT(*) over the second cut: 1 account — Alice Chen, twice over.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the chain's thread",
        why: "Every stage carries customer_id and n forward — the thread the cuts follow.",
      },
    ],
    distractors: ["SUM", "17", "status"],
    walkthrough:
      "Three stages, two cuts: per folds sixteen counts, big keeps the four heavies, big2 re-cuts at twenty — one survivor, Alice Chen's 24. Lower the inner line to seventeen and Emma joins: 2. Raise it to twenty-five and the innermost stage empties — nobody, an honest zero. SUM over the innermost stage reads 24, the survivor's whole load. Stacked cuts are how tiers nest: the outer line defines the tier, the inner line defines its elite, and both live in the same chain.",
  },
  {
    id: "cs-1141",
    tier: "hard",
    topic: "q7",
    universe: "expense",
    title: "The club inside the list",
    brief:
      "From: Finance partner. Re: the nested spend cut.\n\nTwo spend cuts stacked: big keeps past-2k, big2 keeps past-5k inside that. Count the innermost stage — the club within the list.",
    ask: "One query: the count of rows in big2, chained off big off spend (2k+, then 5k+).",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY {3}), big AS (SELECT customer_id, s FROM spend WHERE s > 2000),
big2 AS (SELECT customer_id, s FROM big WHERE s > {1}) SELECT {2}(*) FROM big2;`,
    slots: [
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the inner cut",
        why: "Five thousand is the inner line, not a result figure. Probed: the innermost stage holds 2 rows.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the innermost counter",
        why: "COUNT(*) over the second cut: 2 heavyweights.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the chain's thread",
        why: "Every stage carries customer_id and s forward — the thread the cuts follow.",
      },
    ],
    distractors: ["SUM", "7000", "status"],
    walkthrough:
      "Three stages, two cuts: spend prices sixteen accounts, big keeps the five past 2,000, big2 re-cuts at 5,000 — two heavyweights survive. Raise the inner line to 7,000 and the club thins to one — Emma's 6,640.56 drops under the strict >. Lower it to 4,000 and Grace's 4,574.23 enters: 3. SUM over the innermost stage reads 13,902.91, the club's combined weight. The nested cuts are the retention program's two lists — the shortlist and the white-glove list — built from one priced stage.",
  },
  {
    id: "cs-1142",
    tier: "hard",
    topic: "q7",
    universe: "month-close",
    title: "The biggest small bucket",
    brief:
      "From: Ops controller. Re: the exception's head.\n\nThe chained census cut keeps buckets under fifteen; sort them and trim to one — the biggest of the small buckets, the exception report's headline row.",
    ask: "One query: the largest count in the small CTE (buckets under 15).",
    template: `WITH st AS (SELECT status, COUNT(*) AS n FROM orders
GROUP BY {3}), small AS (SELECT status, n FROM st WHERE n < 15)
SELECT n FROM small ORDER BY n {1} LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the small buckets so the trim keeps the top: pending, at 14.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the headline trim",
        why: "One is the trim, not a result figure — the report wants the headline row alone.",
      },
      {
        answer: "status",
        kind: "keyword",
        label: "the staging key",
        why: "The first stage folds orders by status into four buckets.",
      },
    ],
    distractors: ["ASC", "id", "region"],
    walkthrough:
      "The census folds to four buckets; small keeps pending (14) and cancelled (7); the DESC sort leads with the holding pen and the trim keeps it — the exception report's headline: fourteen orders waiting. ASC keeps the graveyard instead — 7, the sadder headline. Widen the trim to 2 and both small buckets print. Group the census by id and every bucket holds one order — the headline collapses to 1. The headline is one row, but the chain behind it is what makes the row trustworthy.",
  },
  {
    id: "cs-1143",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "The thinnest market, chained",
    brief:
      "From: Growth lead. Re: the thin edge, chained.\n\nThe chained census cut keeps buckets under five; sort rising and trim to one — the thinnest market on the map, through three named stages.",
    ask: "One query: the smallest count in the thin CTE (buckets under 5).",
    template: `WITH by_region AS (SELECT region, COUNT(*) AS n FROM customers
GROUP BY {3}), thin AS (SELECT region, n FROM by_region WHERE n < 5)
SELECT n FROM thin ORDER BY n {1} LIMIT {2};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the smallest-first sort",
        why: "ASC ranks the thin buckets so the trim keeps the bottom: LATAM, at 1 customer.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the thin-edge trim",
        why: "One is the trim, not a result figure — the query wants the thinnest market alone.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the staging key",
        why: "The first stage folds the roster by region into four buckets.",
      },
    ],
    distractors: ["DESC", "status", "customers"],
    walkthrough:
      "The census folds sixteen customers into four buckets; thin keeps US (2) and LATAM (1); the ASC sort leads with the thinnest and the trim keeps it — LATAM, one customer strong. DESC keeps the US instead — the larger of the thin markets. Widen the trim to 2 and both thin markets print. Group the census by status and the chain reads a different map. The thinnest market is the expansion deck's opening slide, and the chain is what finds it without hard-coding a name.",
  },
  {
    id: "cs-1144",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "Europe's heavyweight, named",
    brief:
      "From: Growth lead. Re: the regional cut with names.\n\nThree stages: per folds counts, big keeps thirteen-plus, eu_big scopes to Europe and joins back for names. Read the roster — one name, one figure.",
    ask: "One query: the name and count of the customer in the eu_big CTE.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= {3}),
eu_big AS (SELECT c.name, b.n FROM big b JOIN customers c
ON c.id = b.{1} WHERE c.region = 'EU') SELECT name, {2} FROM eu_big;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join attaches Europe's heavyweight to her name.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "The final stage re-projects the count as n — the figure beside the name: 24.",
      },
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the heavy line",
        why: "Thirteen is the chain's line, not a result figure. Probed: the register holds one European.",
      },
    ],
    distractors: ["id", "s", "big"],
    walkthrough:
      "Three stages: per folds to counts, big keeps the four heavies, eu_big scopes to Europe and joins back — one row: Alice Chen, 24 orders. Join on b.id and the engine refuses: the stage's projection rules. Re-project s and it refuses again — big never named a column s; that was the spend chain. Read the stage by its own name — big — and the main query has no such table. One name, one figure, three stages: the regional heavy roster is small because the data says so, not because the query hid anything.",
  },
  {
    id: "cs-1145",
    tier: "hard",
    topic: "q7",
    universe: "expense",
    title: "The map's leading region",
    brief:
      "From: Finance partner. Re: the map's headline.\n\nThe three-stage spend map ends in regional buckets. Sort by count and break ties by name — the map's leading region, deterministically.",
    ask: "One query: the top region by heavy-spender count from the by_region CTE, ties broken by name.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY {3}), big AS (SELECT customer_id, s FROM spend WHERE s > 2000),
by_region AS (SELECT c.region, COUNT(*) AS n FROM big JOIN customers c
ON c.id = big.customer_id GROUP BY c.region)
SELECT region, n FROM by_region ORDER BY n {1}, region LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the buckets so the trim keeps the top: APAC, at 2 (alphabetically ahead of EU's tie).",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the headline trim",
        why: "One is the trim, not a result figure — the map's headline is one row.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The spend stage folds orders per customer into one price each — the key the whole chain follows.",
      },
    ],
    distractors: ["ASC", "s", "name"],
    walkthrough:
      "Three stages: spend prices, big cuts to five, by_region folds to three buckets — APAC 2, EU 2, US 1. The DESC sort ties APAC and EU at two; the second key, region, breaks the tie alphabetically: APAC leads. ASC keeps the US — the map's thinnest dot as its headline. Drop the tie-break and the leader depends on the engine's mood — deterministic reports need deterministic sorts. The headline row is one line, but the tie-break is what makes it the same line every Monday.",
  },
  {
    id: "cs-1146",
    tier: "hard",
    topic: "q7",
    universe: "month-close",
    title: "The triple-waiters' backlog",
    brief:
      "From: Ops controller. Re: the deep escalations.\n\nThe chained pending fold cut at three: the accounts waiting three times or more. Sum their open orders — the deep backlog the standup escalates today.",
    ask: "One query: the summed pending counts in cold for accounts with 3 or more pending orders.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY {3})
SELECT {1}(pn) FROM cold WHERE pn >= {2};`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the deep-backlog aggregator",
        why: "SUM(pn) over the deep escalations: 3 + 3 = 6 open orders.",
      },
      {
        answer: "3",
        kind: "number",
        noVerify: true,
        label: "the deep line",
        why: "Three is the line, not a result figure. Probed: two accounts sit at exactly 3 pending.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the register's column",
        why: "hold gathers customer ids from the pending rows; cold folds them per account.",
      },
    ],
    distractors: ["COUNT", "AVG", "2"],
    walkthrough:
      "The register holds fourteen pending ids; the fold collapses them to eight waiting accounts; the cut at three keeps two — Alice and Emma; the sum reads their combined backlog: 6. COUNT over the cut reads 2 — accounts, not orders. Lower the line to two and the backlog grows to 10 — the full escalation list. AVG over the cut reads 3 — the degenerate mean where every survivor sits on the line. Six of fourteen pending orders belong to two accounts; the chain is how the standup finds them without naming anyone.",
  },
  {
    id: "cs-1147",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "Europe's ceiling, chained",
    brief:
      "From: Growth lead. Re: the regional peak.\n\nThe chained heavy register scoped to Europe holds one account. Read its ceiling — Europe's best, through three named stages.",
    ask: "One query: the maximum count in the EU-cut big CTE (13+ orders, Europe).",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= 13),
eu_big AS (SELECT b.n FROM big b JOIN customers c
ON c.id = b.{2} WHERE c.region = 'EU') SELECT {1}({3}) FROM eu_big;`,
    slots: [
      {
        answer: "MAX",
        kind: "keyword",
        label: "the regional peak reader",
        why: "MAX(n) over the EU cut: 24 — Alice Chen's ceiling is Europe's ceiling.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join back is where the region filter becomes possible.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "The final stage re-projects the count as n — the column the peak reads.",
      },
    ],
    distractors: ["s", "COUNT", "region"],
    walkthrough:
      "Three stages: per folds to counts, big keeps the four heavies, eu_big scopes to Europe — one row; the peak reads 24. MIN, COUNT and SUM over a single-row stage all read 24 too — the degenerate case where every aggregate agrees. The interesting fact is the roster's size, not the aggregate: Europe's heavy tier is one account deep. Stage the fold by region and the chain never forms — orders has no region column at the fold. The peak is the figure; the chain is the proof it belongs to Europe.",
  },
  {
    id: "cs-1148",
    tier: "hard",
    topic: "q7",
    universe: "expense",
    title: "The map's dense regions",
    brief:
      "From: Finance partner. Re: the map's cut.\n\nThe three-stage spend map ends in regional buckets. Keep the regions carrying two or more heavy spenders — the dense dots — and count them.",
    ask: "One query: the count of regions in by_region with 2 or more heavy spenders.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > 2000),
by_region AS (SELECT c.region, COUNT(*) AS n FROM big JOIN customers c
ON c.id = big.customer_id GROUP BY c.{3}) SELECT {1}(*) FROM by_region
WHERE n >= {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the chained counter",
        why: "COUNT(*) over the cut map: 2 dense regions.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the density line",
        why: "Two is the density line, not a result figure. Probed: APAC and EU sit at 2; US at 1.",
      },
      {
        answer: "region",
        kind: "keyword",
        label: "the map's grouping key",
        why: "The third stage folds the survivors by region into three buckets.",
      },
    ],
    distractors: ["SUM", "3", "s"],
    walkthrough:
      "Three stages: spend prices, big cuts to five, by_region folds to three buckets — APAC 2, EU 2, US 1; the density line at two keeps 2 dense regions. Lower the line to one and the US joins: 3 — the whole map. Raise it to three and the map empties: no region carries three heavy spenders. SUM over the cut totals 4 — the dense regions' combined spenders. The density cut is the board's expansion filter: two regions justify a field team; the third waits.",
  },
  {
    id: "cs-1149",
    tier: "hard",
    topic: "q7",
    universe: "month-close",
    title: "The queue's worst, trimmed",
    brief:
      "From: Ops controller. Re: the escalation head, chained.\n\nThree stages: hold gathers pending rows, cold folds per account, repeat keeps double-waiters. Sort and trim to one — the worst waiter on the escalation list.",
    ask: "One query: the highest pending count in the repeat CTE (2+ pending).",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = 'pending'),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY {3}),
repeat AS (SELECT customer_id, pn FROM cold WHERE pn >= 2)
SELECT pn FROM repeat ORDER BY pn {1} LIMIT {2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the worst-first sort",
        why: "DESC ranks the escalation list so the trim keeps the head: 3 pending orders.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the head trim",
        why: "One is the trim, not a result figure — the query wants the list's worst row.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the register's column",
        why: "hold gathers customer ids from the pending rows; the chain follows that thread.",
      },
    ],
    distractors: ["ASC", "id", "region"],
    walkthrough:
      "Three stages: hold gathers fourteen ids, cold folds to eight accounts, repeat keeps the four at two-plus; the DESC sort leads with the deepest backlog — 3 — and the trim keeps it. ASC keeps the list's floor instead: 2, the shallowest escalation. Widen the trim to 2 and the second three-time waiter rides along — the tie means the head is two names deep. Fold by id instead of customer and every waiter holds one pending order — the head drops to 1. The chained worst is the same figure the direct read finds — 3 — but the chain guarantees the row came from the escalation list, not the whole queue.",
  },
  {
    id: "cs-1150",
    tier: "hard",
    topic: "q7",
    universe: "growth",
    title: "The tier's first name",
    brief:
      "From: Growth lead. Re: the boundary account, chained.\n\nThe chained heavy register sorted rising, trimmed to one: the tier's lightest member — the account the heavy line was drawn around.",
    ask: "One query: the smallest count in the big CTE, chained off per at 13+, sorted rising.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}), big AS (SELECT customer_id, n FROM per WHERE n >= 13)
SELECT n FROM big ORDER BY n {1} LIMIT {2};`,
    slots: [
      {
        answer: "ASC",
        kind: "keyword",
        label: "the smallest-first sort",
        why: "ASC ranks the heavy register so the trim keeps the floor: 13 orders.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the boundary trim",
        why: "One is the trim, not a result figure — the query wants the tier's lightest member.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer into counts.",
      },
    ],
    distractors: ["DESC", "id", "status"],
    walkthrough:
      "Three stages: per folds to sixteen counts, big keeps the four heavies, and the ASC sort leads with the floor — 13, Maya Patel's boundary count. DESC keeps the ceiling instead: 24, the champion. Widen the trim to 2 and Grace's 14 rides along. The boundary account is the tier's definition: the line at thirteen exists because her count does, and the chain reads the two as one row. Change the line and this query is how you find the account the new line catches or drops.",
  },
  {
    id: "cs-1151",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "The champion's book, by name",
    brief:
      "From: Growth lead. Re: the capstone warm-up.\n\nThe capstone recipe's first station: resolve a name to an id with a scalar, then count that account's orders. The champion's book, no joins.",
    ask: "One query: the count of orders belonging to the customer named Alice Chen.",
    template: `SELECT {1}(*) FROM orders WHERE {2} = (SELECT id FROM customers
WHERE name = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 24 orders — the store's heaviest single account.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the matched column",
        why: "orders.customer_id is compared to the looked-up id — the outer side of the scalar test.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the name key",
        why: "The inner scalar translates the name to an id — names live on customers, orders carry ids.",
      },
    ],
    distractors: ["SUM", "id", "'Emma Wilson'"],
    walkthrough:
      "Station one of the capstone: the inner scalar resolves the name to an id; the outer WHERE keeps the matching orders — 24 of them, a lifetime spend of 7,262.35 if the next station needs it. Match on orders.id and the test compares an order id to a customer id — one accidental row. Re-aim the name and the book changes owner: Emma's count is different. SUM(*) is invalid syntax. Name-to-id-to-rows is the capstone's first beat, and every later station builds on the id it produces.",
  },
  {
    id: "cs-1152",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "Europe's book, the WITH way",
    brief:
      "From: Growth lead. Re: the capstone's second station.\n\nThe register pattern under WITH: eu names the European ids, the main query counts the orders inside that register. Forty-five orders, built in two named steps.",
    ask: "One query: the count of orders whose customer is in the eu CTE.",
    template: `WITH eu AS (SELECT id FROM customers WHERE region = {1})
SELECT {2}(*) FROM orders WHERE customer_id IN (SELECT {3} FROM eu);`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the register's filter",
        why: "The eu register gathers the eight European ids the main query consumes.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the book counter",
        why: "COUNT(*) over the filtered orders: 45 European orders.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the register's column",
        why: "The register projects id — the column the membership test matches against.",
      },
    ],
    distractors: ["'APAC'", "SUM", "name"],
    walkthrough:
      "Station two: the register holds eight ids; the main query counts the orders whose customer is in it — 45, Europe's whole book. Point the register at 'APAC' and the book reads 37. SUM(*) is invalid syntax; the deliverable is a count. Flip IN to NOT IN and the book becomes the complement — 58 orders from non-EU customers. The register pattern is the capstone's reusable brick: name a set once, consume it anywhere — and the 45 reconciles with every staged build of the same question.",
  },
  {
    id: "cs-1153",
    tier: "easy",
    topic: "q8",
    universe: "expense",
    title: "The premium lane, counted",
    brief:
      "From: Ops controller. Re: the premium lane.\n\nThe capstone's threshold station: orders of 700 or more. Count them — the lane's volume, straight from the orders table.",
    ask: "One query: the count of orders with a total of at least 700.",
    template: `WITH lane AS (SELECT * FROM {3} WHERE total >= {2})
SELECT {1}(*) FROM lane;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 10 orders ride the premium lane.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "Seven hundred is the lane's definition, not a result figure. Probed: 10 orders clear it.",
      },
      {
        answer: "orders",
        kind: "keyword",
        label: "the lane's table",
        why: "The lane reads the orders table directly — the capstone's simplest station.",
      },
    ],
    distractors: ["SUM", "600", "customers"],
    walkthrough:
      "Ten orders total 700 or more — the premium lane's volume. Lower the line to 600 and the lane widens; raise it to 1,088.44 — the store record — and only the champion's biggest order remains. SUM(total) would read the lane's combined value, a spend figure rather than a volume. This station looks simple because it is: every capstone recipe needs one honest threshold, and this is the one the next stations will scale per-account.",
  },
  {
    id: "cs-1154",
    tier: "medium",
    topic: "q8",
    universe: "fraud",
    title: "The full-journey accounts",
    brief:
      "From: Fraud analyst. Re: the four-state accounts.\n\nThe capstone's pattern station: accounts that have seen ALL four states — delivered, shipped, pending and cancelled. Four correlated probes, one AND chain.",
    ask: "One query: the count of customers with at least one order in each of the four statuses.",
    template: `SELECT {1}(*) FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')
AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'shipped')
AND {2} (SELECT 1 FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = 'pending')
AND EXISTS (SELECT 1 FROM orders o4 WHERE o4.customer_id = c.id AND o4.status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 3 accounts have ridden every state.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the third doorbell",
        why: "Each state needs its own correlated probe — four doorbells, all must ring.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the fourth state",
        why: "cancelled completes the journey — the scar that proves the account tried and failed once.",
      },
    ],
    distractors: ["SUM", "NOT EXISTS", "'shipped'"],
    walkthrough:
      "Four correlated probes, four ANDs: three accounts — Alice Chen, Emma Wilson, Maya Patel — have delivered, shipped, waited and cancelled. Negate the third probe and the pattern inverts: accounts that never waited — a different cohort entirely. Re-aim the fourth at 'shipped' and it duplicates the second: three probes wearing four masks, and the count shifts. SUM cannot ring a doorbell. The full-journey account is the storefront's most experienced customer — and its most expensive to lose.",
  },
  {
    id: "cs-1155",
    tier: "medium",
    topic: "q8",
    universe: "expense",
    title: "Above the spend line, staged",
    brief:
      "From: Finance partner. Re: the above-average spenders.\n\nThe capstone's staging station: price every account, average the prices, keep the accounts above their own store's mean. Five accounts beat 2,177.08.",
    ask: "One query: the count of accounts whose staged spend exceeds the average staged spend.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY {3}) SELECT {1}(*) FROM spend
WHERE s > (SELECT {2}(s) FROM spend);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 5 accounts spend above the 2,177.08 baseline.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the baseline aggregator",
        why: "AVG(s) over the stage computes the mean the survivors must beat.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the staging key",
        why: "GROUP BY customer_id prices one account per stage row.",
      },
    ],
    distractors: ["SUM", "MIN", "total"],
    walkthrough:
      "The stage prices sixteen accounts; the uncorrelated AVG computes the 2,177.08 baseline; five accounts clear it — the heavy half of a skewed distribution. SUM(s) inside the comparison sets the bar at the whole book — nothing clears it. MIN sets it at the cheapest lifetime — everyone clears. Stage the fold by status and the baseline becomes a bucket mean — a different denominator. Above-own-mean is the honest 'above average': the average is computed from the same stage it judges.",
  },
  {
    id: "cs-1156",
    tier: "medium",
    topic: "q8",
    universe: "expense",
    title: "The premium lane's breadth",
    brief:
      "From: Ops controller. Re: the lane's reach.\n\nThe premium lane counts ten orders — but how many accounts does it touch? Count the distinct customers behind the 700-plus orders.",
    ask: "One query: the count of distinct customers with at least one order of 700 or more.",
    template: `WITH lane AS (SELECT customer_id FROM orders WHERE total >= {3})
SELECT {1}(DISTINCT {2}) FROM lane;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "COUNT(DISTINCT customer_id) over the lane: 7 accounts ride it.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the collapsed column",
        why: "DISTINCT collapses the lane's ten orders to the accounts behind them.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "Seven hundred is the lane's definition, not a result figure. Probed: 7 distinct customers.",
      },
    ],
    distractors: ["SUM", "id", "500"],
    walkthrough:
      "Ten orders clear 700; the distinct count collapses them to 7 accounts — some heavyweights ride the lane twice. Distinct over id would read 10 — every order is its own id, the collapse never happens. Lower the line to 500 and the lane widens; more orders, and likely more accounts. SUM cannot count a distinct. Volume and breadth are the lane's two figures — 10 orders wide, 7 accounts deep — and the capstone reads both before deciding who the lane belongs to.",
  },
  {
    id: "cs-1157",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The champion's bill, two stations deep",
    brief:
      "From: Finance partner. Re: the capstone's money shot.\n\nTwo scalar stations chained: resolve the champion's name to an id, then price that id's orders. The figure the whole deck leads with — 7,262.35.",
    ask: "One query: the total order value for the customer named Alice Chen.",
    template: `SELECT {1}(total) FROM orders WHERE {3} =
(SELECT id FROM customers WHERE name = {2});`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime aggregator",
        why: "SUM(total) over the champion's 24 orders: 7262.35 — the deck's headline figure.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the name key",
        why: "The inner scalar resolves the name to an id — the first of the two stations.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the placeholder key",
        why: "The outer WHERE matches orders.customer_id to the resolved id.",
      },
    ],
    distractors: ["COUNT", "'Emma Wilson'", "AVG"],
    walkthrough:
      "Two stations, no join: the scalar resolves 'Alice Chen' to her id; SUM prices her 24 orders at 7,262.35 — the deck's opening figure and the benchmark every spend threshold is drawn against. COUNT would read 24 — the book's size, not its value. Re-aim the name and the figure becomes Emma's 6,640.56 — the runner-up's bill. AVG would read the champion's average order, about 302 — a rate, not a lifetime. The capstone's money shot is two stations and one aggregate: name to id, id to total.",
  },
];
