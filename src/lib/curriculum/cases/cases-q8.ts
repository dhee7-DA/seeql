// Case batch Q8 — Module 4 capstone cases cs-1158…cs-1200.
// 43 cases: 14 easy / 14 medium / 15 hard, all topic q8 (Subquery capstone).
// Every figure was probed against the live seed db (scripts/m4-facts-q3*.ts,
// m4-facts-d3/d4/d5 series) and is mechanically re-verified by
// scripts/case-audit.ts. This batch closes the Module 4 deck at cs-1200.

import type { CaseStudy } from "./types";

export const casesQ8: CaseStudy[] = [
  {
    id: "cs-1158",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "The European register",
    brief:
      "From: Growth lead. Re: capstone warm-up.\n\nFirst station of the final: name a register. WITH eu AS (...region filter...), then count it — the roster the whole regional section builds on.",
    ask: "One query: the number of customers in the eu CTE.",
    template: `WITH eu AS (SELECT id FROM customers WHERE region = {1})
SELECT {2}(*) FROM {3};`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the register's filter",
        why: "The eu register gathers the eight European ids.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the register counter",
        why: "COUNT(*) over the named register: 8 European customers.",
      },
      {
        answer: "eu",
        kind: "keyword",
        label: "the register's name",
        why: "The main query reads FROM eu — the name WITH gave the stage.",
      },
    ],
    distractors: ["'APAC'", "SUM", "customers"],
    walkthrough:
      "The final's first station: name the filtered roster and count it — 8 Europeans. Re-aim at 'APAC' and the register holds 5. SUM over ids is a number without meaning. The register pattern is every multi-step query's opening move: define the set once, name it, and let every later station read the name instead of repeating the filter.",
  },
  {
    id: "cs-1159",
    tier: "easy",
    topic: "q8",
    universe: "month-close",
    title: "The waiting register",
    brief:
      "From: Ops controller. Re: the open-work register.\n\nSame pattern, different filter: hold gathers the pending rows' customer ids. Fold them per account and count — the waiting roster.",
    ask: "One query: the count of distinct customers in the hold CTE, folded per account.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = {1}),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY {3})
SELECT {2}(*) FROM cold;`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the register's filter",
        why: "hold gathers exactly the fourteen pending rows' customer ids.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the folded counter",
        why: "COUNT(*) over the folded register: 8 waiting accounts.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "GROUP BY customer_id collapses the fourteen rows to one row per waiter.",
      },
    ],
    distractors: ["'APAC'", "SUM", "id"],
    walkthrough:
      "The hold register collects fourteen pending ids; the fold collapses them to eight waiting accounts; the count reads 8. Fold by id and every pending row stands alone: fourteen buckets — the fold's key is the grain decision. SUM cannot count a register. Fourteen rows, eight accounts: the register-and-fold pair is the capstone's most reused shape, and this is its cleanest run.",
  },
  {
    id: "cs-1160",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "Emma's book, by name",
    brief:
      "From: Growth lead. Re: the runner-up's file.\n\nThe name-to-id station, aimed at the runner-up: resolve Emma Wilson's id, count her orders — 17, the deck's second figure.",
    ask: "One query: the count of orders belonging to the customer named Emma Wilson.",
    template: `SELECT {1}(*) FROM orders WHERE {2} = (SELECT id FROM customers
WHERE name = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 17 orders — the runner-up's book.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the matched column",
        why: "orders.customer_id is compared to the resolved id — the outer side of the test.",
      },
      {
        answer: "'Emma Wilson'",
        kind: "keyword",
        label: "the name key",
        why: "The inner scalar resolves the name to an id — the station's whole job.",
      },
    ],
    distractors: ["SUM", "id", "'Grace Kim'"],
    walkthrough:
      "The scalar resolves 'Emma Wilson' to her id; the outer count reads 17 orders. Re-aim at 'Grace Kim' and the book shrinks to 14. Match on orders.id and the test compares order ids to a customer id — one accidental row. SUM(*) is invalid syntax. Same two-station shape as the champion's file — the capstone drills it until the name-to-id move is reflex.",
  },
  {
    id: "cs-1161",
    tier: "easy",
    topic: "q8",
    universe: "expense",
    title: "Grace's bill, priced",
    brief:
      "From: Finance partner. Re: the bronze medal.\n\nThe pricing station aimed at third place: resolve Grace Kim's id, sum her orders — 4,574.23, the figure the podium's third line carries.",
    ask: "One query: the total order value for the customer named Grace Kim.",
    template: `SELECT {1}(total) FROM orders WHERE {2} =
(SELECT id FROM customers WHERE name = {3});`,
    slots: [
      {
        answer: "SUM",
        kind: "keyword",
        label: "the lifetime aggregator",
        why: "SUM(total) over Grace's 14 orders: 4574.23.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the placeholder key",
        why: "The outer WHERE matches orders.customer_id to the resolved id.",
      },
      {
        answer: "'Grace Kim'",
        kind: "keyword",
        label: "the name key",
        why: "The inner scalar resolves the name to an id — station one of two.",
      },
    ],
    distractors: ["COUNT", "AVG", "'Emma Wilson'"],
    walkthrough:
      "Two stations: the scalar resolves the name; SUM prices the 14 orders at 4,574.23 — the podium's bronze. COUNT would read 14 — the book's size. AVG would read about 327 — a rate. Re-aim at 'Emma Wilson' and the figure climbs to 6,640.56 — the silver. The pricing station is the name-to-id move with SUM at the wheel; every threshold in the spend section traces back to a figure it produces.",
  },
  {
    id: "cs-1162",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "The APAC book",
    brief:
      "From: Growth lead. Re: the second market.\n\nThe register station re-aimed at Asia-Pacific: apac holds five ids, the main query counts their orders — 37, the region's whole book.",
    ask: "One query: the count of orders whose customer is in the apac CTE.",
    template: `WITH apac AS (SELECT id FROM customers WHERE region = {1})
SELECT {2}(*) FROM orders WHERE customer_id IN (SELECT {3} FROM apac);`,
    slots: [
      {
        answer: "'APAC'",
        kind: "keyword",
        label: "the register's filter",
        why: "The apac register gathers the five Asia-Pacific ids.",
      },
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the book counter",
        why: "COUNT(*) over the filtered orders: 37 APAC orders.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the register's column",
        why: "The register projects id — the column the membership test matches.",
      },
    ],
    distractors: ["'EU'", "SUM", "name"],
    walkthrough:
      "The apac register holds five ids; the book counts 37 orders. Point the register at 'EU' and the book reads 45 — the bigger market next door. SUM(*) is invalid syntax. Name instead of id in the membership test and the register's projection refuses — it named its column id. The regional books — EU 45, APAC 37, US 19, LATAM 2 — are all this one query with a different filter.",
  },
  {
    id: "cs-1163",
    tier: "easy",
    topic: "q8",
    universe: "refund-audit",
    title: "The conversion census",
    brief:
      "From: Support lead. Re: the completed-history census.\n\nThe probe station at its most common: accounts with at least one delivered order. Fifteen of sixteen — the capstone's baseline figure.",
    ask: "One query: the count of customers with at least one delivered order.",
    template: `SELECT {1}(*) FROM customers c
WHERE {2} (SELECT 1 FROM orders o
WHERE o.customer_id = c.id AND o.status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 15 accounts have completed at least once.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the existence probe",
        why: "EXISTS rings on the first delivered row — the cheapest 'at least one'.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the probed state",
        why: "delivered is the completion state — 15 of 16 accounts hold one.",
      },
    ],
    distractors: ["NOT EXISTS", "'shipped'", "SUM"],
    walkthrough:
      "The probe rings per customer; fifteen answer — everyone but the one frozen account. NOT EXISTS isolates that anomaly instead. Re-aim at 'shipped' and the census reads 10. SUM cannot stand at a predicate position. The conversion census is the capstone's baseline: every anomaly the module hunts is defined against this fifteen.",
  },
  {
    id: "cs-1164",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "Past the heavy line, counted",
    brief:
      "From: Growth lead. Re: the strict heavy census.\n\nThe correlated count station, strict side: accounts with MORE than thirteen orders. Maya sits exactly on the line — the > leaves her out.",
    ask: "One query: the count of customers with more than 13 orders.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT COUNT(*) FROM orders o
WHERE o.customer_id = c.id) {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the outer counting aggregate",
        why: "One number out: 3 accounts live strictly past thirteen.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the strict comparator",
        why: "> drops the boundary account — Maya's exactly-13 stays below the line.",
      },
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the heavy line",
        why: "Thirteen is the line, not a result figure. Probed: 3 accounts clear it strictly.",
      },
    ],
    distractors: ["SUM", ">=", "10"],
    walkthrough:
      "The correlated count hands back each account's total; the strict line past thirteen keeps 24, 17 and 14 — three accounts. Widen to >= and Maya returns: 4. Lower the line to ten and the answer is unchanged — the histogram's gap means nothing lives at eleven or twelve. SUM(*) is invalid syntax. The capstone drills the boundary one last time: same digit, different operator, different roster.",
  },
  {
    id: "cs-1165",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "Maya's file, by name",
    brief:
      "From: Growth lead. Re: the boundary account's extract.\n\nThe name-to-id station aimed at the heavy line's owner: Maya Patel, exactly thirteen orders. Resolve and count.",
    ask: "One query: the count of orders belonging to the customer named Maya Patel.",
    template: `SELECT {1}(*) FROM orders WHERE {2} = (SELECT id FROM customers
WHERE name = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 13 orders — the heavy line's own occupant.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the matched column",
        why: "orders.customer_id is compared to the resolved id — the outer side of the test.",
      },
      {
        answer: "'Maya Patel'",
        kind: "keyword",
        label: "the name key",
        why: "The inner scalar resolves the boundary account's name to her id.",
      },
    ],
    distractors: ["SUM", "id", "'Alice Chen'"],
    walkthrough:
      "The scalar resolves 'Maya Patel'; the count reads 13 — the account the heavy line was drawn around. Re-aim at 'Alice Chen' and the book jumps to 24. Match on orders.id and the test goes sideways — one accidental row. The extract is the boundary file the tier discussions keep citing, and the capstone's scalar station produces it in two lines.",
  },
  {
    id: "cs-1166",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "Past the mean, staged",
    brief:
      "From: Growth lead. Re: the mean-of-counts census.\n\nThe staged station: fold counts, compute the 6.4375 mean, keep the accounts above it. Four — the heavy tier, found honestly.",
    ask: "One query: the count of accounts whose staged order count exceeds the mean of counts.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}) SELECT {1}(*) FROM per
WHERE n > (SELECT {2}(n) FROM per);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 4 accounts beat the 6.4375 mean.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregator",
        why: "AVG(n) over the stage computes the mean the survivors must beat.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the staging key",
        why: "GROUP BY customer_id folds orders to one count per account.",
      },
    ],
    distractors: ["SUM", "MAX", "status"],
    walkthrough:
      "The stage folds to sixteen counts; the uncorrelated AVG computes 6.4375; four accounts clear it — Alice, Emma, Grace, Maya. SUM(n) sets the bar at 103 — nothing clears. MAX sets it at 24 — only ties would clear, and there are none. Stage by status and the mean becomes a bucket mean. Above-own-mean is the honest 'above average', and the capstone makes the average come from the same stage it judges.",
  },
  {
    id: "cs-1167",
    tier: "easy",
    topic: "q8",
    universe: "expense",
    title: "The 5k club, listed",
    brief:
      "From: Finance partner. Re: the club's roster.\n\nThe staged station with names: price every account, cut at five thousand, join back — two names on the white-glove list.",
    ask: "One query: names and spends of customers in the spend CTE past 5,000.",
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
        why: "DESC reads Alice 7262.35 then Emma 6640.56 — the club top-down.",
      },
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the club line",
        why: "Five thousand is the club's line, not a result figure. Probed: two accounts clear it.",
      },
    ],
    distractors: ["id", "ASC", "total"],
    walkthrough:
      "The spend stage prices sixteen accounts; big keeps the two past 5,000; the join back names them — Alice 7262.35, Emma 6640.56. Join on big.id and the engine refuses: the projection named customer_id. ASC reads the club's floor first. Two names, two figures, one chain — the white-glove list the retention team keeps, rebuilt identically every week.",
  },
  {
    id: "cs-1168",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "The podium, extracted",
    brief:
      "From: Growth lead. Re: the top-three extract.\n\nThe staged station with a trim: fold counts, sort the stage, keep three — Alice, Emma and Grace with their figures.",
    ask: "One query: the top 3 customers by staged order count, with figures.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), top3 AS (SELECT customer_id, n FROM per
ORDER BY n {1} LIMIT 3) SELECT c.name, top3.{3} FROM top3
JOIN customers c ON c.id = top3.{2};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the stage so the trim keeps the podium: 24, 17, 14.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "top3 carries customer_id; the join attaches each count to its name.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "The stage projects the count as n — the figure the extract reads.",
      },
    ],
    distractors: ["ASC", "id", "s"],
    walkthrough:
      "The stage folds to counts; the DESC sort and trim keep the podium; the join back names them — Alice 24, Emma 17, Grace 14. ASC trims the tail instead: three one-and-two-order accounts. Join on top3.id and the engine refuses — the projection rules. The podium extract is the deck's roster slide, and the capstone builds it with the same fold every threshold figure in the module re-uses.",
  },
  {
    id: "cs-1169",
    tier: "easy",
    topic: "q8",
    universe: "growth",
    title: "The complement book",
    brief:
      "From: Growth lead. Re: the non-European book.\n\nThe register station negated: orders whose customer is NOT in the eu register — 58 orders, the complement the regional section always pairs with the 45.",
    ask: "One query: the count of orders whose customer is not in the eu CTE.",
    template: `WITH eu AS (SELECT id FROM customers WHERE region = 'EU')
SELECT {1}(*) FROM orders WHERE customer_id {2} (SELECT {3} FROM eu);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the complement counter",
        why: "COUNT(*) over the complement: 58 non-European orders.",
      },
      {
        answer: "NOT IN",
        kind: "keyword",
        label: "the exclusion operator",
        why: "NOT IN keeps orders outside the register — the complement of the 45.",
      },
      {
        answer: "id",
        kind: "keyword",
        label: "the register's column",
        why: "The register projects id — the column the exclusion matches against.",
      },
    ],
    distractors: ["SUM", "IN", "name"],
    walkthrough:
      "The register holds eight European ids; NOT IN keeps the orders outside it: 58 — the store minus Europe. Flip to IN and the book reads 45; 45 + 58 = 103, the reconciliation the regional section opens with. Name instead of id and the register's projection refuses. The complement is the capstone's reminder that every register has two books — and both figures come from the same named stage.",
  },
  {
    id: "cs-1170",
    tier: "easy",
    topic: "q8",
    universe: "fraud",
    title: "The full-journey roster, named",
    brief:
      "From: Fraud analyst. Re: the four-state names.\n\nThe pattern station with names: four correlated probes, all four states, joined back — Alice, Emma and Maya, the storefront's most travelled accounts.",
    ask: "One query: the names of customers with at least one order in each of the four statuses.",
    template: `SELECT c.name FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')
AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'shipped')
AND EXISTS (SELECT 1 FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = 'pending')
AND {1} (SELECT 1 FROM orders o4 WHERE o4.customer_id = c.id AND o4.status = {2})
ORDER BY c.{3};`,
    slots: [
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the fourth doorbell",
        why: "Each state needs its own correlated probe — four doorbells, all must ring.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the fourth state",
        why: "cancelled completes the journey — the scar that finishes the pattern.",
      },
      {
        answer: "name",
        kind: "keyword",
        label: "the roster's order",
        why: "ORDER BY c.name alphabetizes the three-name roster.",
      },
    ],
    distractors: ["NOT EXISTS", "'shipped'", "city"],
    walkthrough:
      "Four doorbells, one AND chain: three accounts — Alice Chen, Emma Wilson, Maya Patel — have delivered, shipped, waited and cancelled; the join back needs no aggregate because the deliverable is names. Negate the fourth probe and the pattern inverts to never-cancelled three-state accounts — a different roster. Re-aim at 'shipped' and two probes duplicate. The full-journey roster is the capstone's pattern station at full length: four probes, one truth.",
  },
  {
    id: "cs-1171",
    tier: "easy",
    topic: "q8",
    universe: "expense",
    title: "The top spender, found twice",
    brief:
      "From: Finance partner. Re: the self-locating champion.\n\nTwo stations, no name given: the inner query ranks accounts by staged spend and keeps the top id; the outer counts that account's orders. The champion, located by data alone.",
    ask: "One query: the count of orders belonging to the customer with the highest lifetime spend.",
    template: `SELECT {1}(*) FROM orders WHERE customer_id =
(SELECT {2} FROM orders GROUP BY customer_id ORDER BY SUM(total) {3} LIMIT 1);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 24 orders — the top spender's book.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the ranked column",
        why: "The inner query groups by customer and ranks the ids by their spend.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first rank",
        why: "DESC leads with the heaviest spender, so LIMIT 1 keeps the champion.",
      },
    ],
    distractors: ["SUM", "total", "ASC"],
    walkthrough:
      "The inner query prices every account by grouping orders and ranking by SUM(total); DESC plus LIMIT 1 keeps the champion's id; the outer count reads her book: 24 orders. ASC keeps the cheapest spender instead — the anti-champion. Rank by total instead of customer_id and the scalar returns a price, which matches no id. SUM(*) at the outer station is invalid syntax. The capstone's flex: the champion located without a single hard-coded name.",
  },
  {
    id: "cs-1172",
    tier: "medium",
    topic: "q8",
    universe: "expense",
    title: "Europe's heavy spenders",
    brief:
      "From: Finance partner. Re: the regional cut, capstone edition.\n\nTwo conditions, two stations: the correlated spend station prices each account, the region filter scopes it to Europe. Two of eight qualify.",
    ask: "One query: the count of EU customers whose lifetime spend exceeds 2,000.",
    template: `SELECT {1}(*) FROM customers c
WHERE c.region = {2} AND (SELECT {3}(o.total) FROM orders o
WHERE o.customer_id = c.id) > 2000;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 2 EU accounts past 2,000 lifetime.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region filter",
        why: "Europe is the scope — eight customers, two heavyweights.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the correlated pricer",
        why: "SUM(o.total) per correlated slice prices each account's lifetime.",
      },
    ],
    distractors: ["AVG", "MIN", "region"],
    walkthrough:
      "The correlated SUM prices each EU account's history; the region filter scopes the census before the pricing ever runs; two clear 2,000. Swap the pricer to AVG and the test becomes per-order — no EU account averages near 2,000; the count empties. Scope to 'APAC' and the pair holds there too — the regions tie. The regional cut is the capstone's filter-plus-station combo: the filter decides who is judged, the station decides who passes.",
  },
  {
    id: "cs-1173",
    tier: "medium",
    topic: "q8",
    universe: "growth",
    title: "Europe's heavy roster",
    brief:
      "From: Growth lead. Re: the chained regional cut.\n\nTwo stations chained: the fold-and-cut stage keeps thirteen-plus, the EXISTS-style region test scopes to Europe. One name survives.",
    ask: "One query: the count of EU customers whose order count reaches 13.",
    template: `SELECT {1}(*) FROM customers c
WHERE c.region = 'EU' AND (SELECT COUNT(*) FROM orders o
WHERE o.{3} = c.id) >= {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 1 EU heavyweight — Alice Chen alone.",
      },
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the heavy line",
        why: "Thirteen is the line, not a result figure. Probed: one EU account reaches it.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the correlation link",
        why: "o.customer_id = c.id scopes the count to the outer account — the correlated link.",
      },
    ],
    distractors: ["SUM", "25", "product_id"],
    walkthrough:
      "The correlated count tallies each EU account's orders; the line at thirteen keeps one — Alice Chen, Europe's entire heavy tier. Raise the line to twenty and the answer holds: her 24 clears it alone. Correlate on product_id and the engine refuses — orders has no such column. SUM(*) at the counter is invalid syntax. The chained cut and the correlated probe answer identically — the capstone's lesson that the shape is a choice, the figure is a fact.",
  },
  {
    id: "cs-1174",
    tier: "medium",
    topic: "q8",
    universe: "pricing",
    title: "The thousand-dollar account",
    brief:
      "From: Pricing analyst. Re: the big-ticket test.\n\nThe correlated peak station at a steep line: accounts whose single biggest order reaches 1,000. Only the store record clears it.",
    ask: "One query: the count of customers whose maximum order total is at least 1,000.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT {2}(o.total) FROM orders o
WHERE o.customer_id = c.id) >= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 1 account — the store record's owner.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the correlated peak",
        why: "MAX(o.total) reduces each history to its biggest order — the figure the line tests.",
      },
      {
        answer: "1000",
        kind: "number",
        noVerify: true,
        label: "the big-ticket line",
        why: "One thousand is the line, not a result figure. Probed: Farid Nasser's 1088.44 is the only peak above it.",
      },
    ],
    distractors: ["SUM", "MIN", "900"],
    walkthrough:
      "The correlated MAX reduces every account to its peak; the line at 1,000 keeps exactly one — Farid Nasser's 1,088.44, the store record. Lower the line to 900 and Chloe's 945.21 joins: 2. SUM tests lifetime spend — most accounts clear 1,000 that way, a different list. MIN tests floors — nobody's worst order comes close. The big-ticket test is the capstone's peak station at its steepest: one line, one account, one figure.",
  },
  {
    id: "cs-1175",
    tier: "medium",
    topic: "q8",
    universe: "growth",
    title: "The champion's personal bests",
    brief:
      "From: Growth lead. Re: the consistency read.\n\nThe consistency station aimed at one account: how many of Alice Chen's own orders beat her own average? Name-to-id outside, correlated mean inside — 8.",
    ask: "One query: the count of Alice Chen's orders that beat her own average order value.",
    template: `SELECT {1}(*) FROM orders o
WHERE o.customer_id = (SELECT id FROM customers WHERE name = {2})
AND o.total > (SELECT {3}(o2.total) FROM orders o2
WHERE o2.customer_id = o.customer_id);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 8 of Alice's 24 orders beat her own mean.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the name key",
        why: "The first scalar resolves the name — the account station scopes every later probe.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the personal mean",
        why: "AVG(o2.total) per correlated slice computes her own average — the personal bar.",
      },
    ],
    distractors: ["SUM", "'Grace Kim'", "MAX"],
    walkthrough:
      "Two stations compose: the name scalar scopes every probe to Alice; the correlated mean sets her personal bar; eight of her 24 orders clear it. Re-aim the name and the consistency figure moves to Grace's 6 — a different account, a lower bar. Swap the bar to MAX and nothing beats its own ceiling — zero. SUM at the counter is invalid syntax. The consistency station is the capstone's most layered: a scalar inside a correlated probe, both scoped by one resolved id.",
  },
  {
    id: "cs-1176",
    tier: "medium",
    topic: "q8",
    universe: "growth",
    title: "The heavy tier's combined load",
    brief:
      "From: Growth lead. Re: the tier's weight.\n\nThe staged station summed: fold counts, cut at thirteen, sum the survivors — 68 orders, two-thirds of the book in four accounts.",
    ask: "One query: the summed counts in the big CTE, chained off per at 13+.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}), big AS (SELECT customer_id, n FROM per WHERE n >= {1})
SELECT {2}(n) FROM big;`,
    slots: [
      {
        answer: "13",
        kind: "number",
        noVerify: true,
        label: "the heavy line",
        why: "Thirteen is the chain's line, not a result figure. Probed: four accounts clear it.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the tier aggregator",
        why: "SUM(n) over the heavy tier: 24 + 17 + 14 + 13 = 68.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "The first stage folds orders per customer into counts.",
      },
    ],
    distractors: ["COUNT", "20", "status"],
    walkthrough:
      "The fold builds sixteen counts; the cut at thirteen keeps four; the sum reads 68 — two-thirds of all orders in four accounts. COUNT over the tier reads 4 — its size. Raise the line to twenty and the tier thins to Alice alone, the load to 24. Stage the fold by status and the chain sums buckets instead — a different census. The heavy tier's weight is the deck's concentration headline, and the capstone rebuilds it start to finish.",
  },
  {
    id: "cs-1177",
    tier: "medium",
    topic: "q8",
    universe: "expense",
    title: "Below the premium line",
    brief:
      "From: Ops controller. Re: the lane's complement.\n\nThe threshold station negated: orders below the 700 line — 93 of the 103. The premium lane is the exception, not the rule.",
    ask: "One query: the count of orders with a total below 700.",
    template: `WITH book AS (SELECT total FROM orders) SELECT {1}(*) FROM book
WHERE total {2} {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 93 orders sit below the premium line.",
      },
      {
        answer: "<",
        kind: "keyword",
        label: "the below-line comparator",
        why: "< keeps the complement of the premium lane — the store's ordinary volume.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "Seven hundred is the lane's definition, not a result figure. Probed: 93 orders fall below it.",
      },
    ],
    distractors: ["SUM", ">=", "600"],
    walkthrough:
      "Ten orders ride the premium lane; the complement holds 93 — the store's ordinary volume, and the arithmetic reconciles: 10 + 93 = 103. Flip to >= and you have written the lane instead. Lower the line to 600 and the complement shrinks — more orders qualify as premium. SUM(total) would read the complement's combined value, a spend figure. The complement station is the capstone's reconciliation drill: every threshold has two books, and both must sum to the whole.",
  },
  {
    id: "cs-1178",
    tier: "medium",
    topic: "q8",
    universe: "fraud",
    title: "The champion's state breadth",
    brief:
      "From: Fraud analyst. Re: the champion's journey.\n\nTwo stations compose: the name scalar scopes to Alice, the distinct-count station measures how many of the four states her orders have touched — all of them.",
    ask: "One query: the number of distinct statuses among Alice Chen's orders.",
    template: `SELECT {1}(DISTINCT status) FROM orders
WHERE {3} = (SELECT id FROM customers WHERE name = {2});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "COUNT(DISTINCT status) over her 24 orders: 4 — every state touched.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the name key",
        why: "The scalar scopes the breadth read to one account — the station's scope move.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the placeholder key",
        why: "The outer WHERE matches orders.customer_id to the resolved id.",
      },
    ],
    distractors: ["SUM", "'Grace Kim'", "MAX"],
    walkthrough:
      "The scalar scopes to Alice; the distinct count walks her 24 orders and finds all four states — delivered, shipped, pending, cancelled. Re-aim at Grace and the breadth reads lower — she has not touched every state. SUM cannot count a distinct. Breadth is the journey metric: 4 means the account has seen everything the storefront can do, which is exactly the profile the fraud model trains on.",
  },
  {
    id: "cs-1179",
    tier: "medium",
    topic: "q8",
    universe: "fraud",
    title: "The full-journey census, restated",
    brief:
      "From: Fraud analyst. Re: the breadth census.\n\nThe breadth station correlated: count each account's DISTINCT statuses, keep the accounts at four. Same three names as the probe version — reached by arithmetic instead of doorbells.",
    ask: "One query: the count of customers whose orders cover exactly 4 distinct statuses.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT COUNT(DISTINCT o.status) FROM orders o
WHERE o.{2} = c.id) = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the breadth counter",
        why: "The correlated COUNT(DISTINCT status) measures each account's journey breadth.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the correlation link",
        why: "o.customer_id = c.id scopes the breadth read to the outer account.",
      },
      {
        answer: "4",
        kind: "number",
        noVerify: true,
        label: "the full-journey breadth",
        why: "Four is the store's maximum breadth. Probed: 3 accounts cover every state.",
      },
    ],
    distractors: ["SUM", "5", "MAX"],
    walkthrough:
      "The correlated breadth station counts each account's distinct statuses; the equality test at four keeps the full-journey trio — Alice, Emma, Maya. Raise the bar to five and the roster empties: no account can touch five states when the store only has four. SUM cannot count a distinct. MAX(status) would compare a name to a number — nonsense that matches nothing. The breadth restatement proves the probe version: two shapes, one figure, three names.",
  },
  {
    id: "cs-1180",
    tier: "medium",
    topic: "q8",
    universe: "growth",
    title: "The heavy tier's mean, restated",
    brief:
      "From: Growth lead. Re: the tier's centre.\n\nThe staged station averaged: fold counts, cut at thirteen, average the survivors — 17, the tier's centre of gravity, to one decimal.",
    ask: "One query: the average count in the big CTE, chained off per at 13+.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {2}), big AS (SELECT customer_id, n FROM per WHERE n >= 13)
SELECT ROUND({1}({3}), 1) FROM big;`,
    slots: [
      {
        answer: "AVG",
        kind: "keyword",
        label: "the tier mean",
        why: "AVG(n) over the heavy tier: (24+17+14+13)/4 = 17.",
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
      "The fold builds sixteen counts; the cut at thirteen keeps four; the mean reads 17 — the tier's centre. SUM reads 68, the load. COUNT reads 4, the size. MIN reads 13, the floor. The capstone restates the heavy mean one last time because the deck quotes it: seventeen is the number a good year looks like, and the chain is what makes the quote auditable.",
  },
  {
    id: "cs-1181",
    tier: "medium",
    topic: "q8",
    universe: "month-close",
    title: "The escalation roster, final form",
    brief:
      "From: Ops controller. Re: the list with names and counts.\n\nThe three-stage escalation chain with a join back: hold, cold, repeat — then names beside each waiting count. Four rows, worst first.",
    ask: "One query: names and pending counts of customers with 2 or more pending orders.",
    template: `WITH hold AS (SELECT customer_id FROM orders WHERE status = {1}),
cold AS (SELECT customer_id, COUNT(*) AS pn FROM hold GROUP BY customer_id),
repeat AS (SELECT customer_id, pn FROM cold WHERE pn >= 2)
SELECT c.name, repeat.pn FROM repeat JOIN customers c ON c.id = repeat.{2}
ORDER BY repeat.pn {3}, c.name;`,
    slots: [
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the register's filter",
        why: "hold gathers exactly the fourteen pending rows' customer ids.",
      },
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
        why: "DESC reads the three-time waiters before the two-time ones.",
      },
    ],
    distractors: ["'APAC'", "id", "ASC"],
    walkthrough:
      "Three stages and a join back: hold gathers fourteen ids, cold folds to eight accounts, repeat keeps the four at two-plus, and the roster prints names worst-first — Alice and Emma at three, Chloe and Maya at two. Join on repeat.id and the engine refuses: the projection rules. ASC reads the shallow escalations first. The escalation roster is the capstone's chain at full length: register, fold, cut, name — four moves, one list.",
  },
  {
    id: "cs-1182",
    tier: "medium",
    topic: "q8",
    universe: "pricing",
    title: "The flagship tier, bounded",
    brief:
      "From: Pricing analyst. Re: the flagship line.\n\nThe correlated peak station at Alice's own figure: accounts whose biggest order reaches 767.64, inclusive. The line's owner rides the boundary — five accounts make the tier.",
    ask: "One query: the count of customers whose maximum order total is at least 767.64.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT {2}(o.total) FROM orders o
WHERE o.customer_id = c.id) >= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 5 accounts peak at or above the flagship line.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the correlated peak",
        why: "MAX(o.total) reduces each history to its biggest order — the figure the line tests.",
      },
      {
        answer: "767.64",
        kind: "number",
        noVerify: true,
        label: "the flagship line",
        why: "Alice's peak defines the line. Probed: 5 peaks reach it inclusive.",
      },
    ],
    distractors: ["SUM", "MIN", ">"],
    walkthrough:
      "The correlated MAX reduces every account to its peak; the inclusive line at 767.64 keeps five — the line's own owner among them. Flip to strict > and Alice, the boundary case, drops: 4. SUM tests lifetime spend and sweeps most of the store. MIN tests floors and empties the list. The flagship tier is the capstone's boundary drill at its sharpest: the line is a customer, and the operator decides whether she belongs.",
  },
  {
    id: "cs-1183",
    tier: "medium",
    topic: "q8",
    universe: "refund-audit",
    title: "The bought-and-burned pair",
    brief:
      "From: Support lead. Re: the overlap census.\n\nThe probe station at a pair: accounts with at least one pending order AND at least one cancelled one — the waiting rooms that also saw a death. Four accounts.",
    ask: "One query: the count of customers with at least one pending order and at least one cancelled order.",
    template: `SELECT {1}(*) FROM customers c
WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = {2})
AND EXISTS (SELECT 1 FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 4 accounts wait while having cancelled before.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-work probe",
        why: "The first probe demands open work — 8 accounts hold some.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the scar probe",
        why: "The second probe demands a scar — 4 accounts carry one; all four also wait.",
      },
    ],
    distractors: ["SUM", "'shipped'", "AVG"],
    walkthrough:
      "Two doorbells, one AND: four accounts ring both — open work on the board and a cancellation in the past. Re-aim the second at 'shipped' and the pair widens to 3; at 'delivered' it widens to 8. SUM cannot ring a doorbell. The overlap is the support team's watchlist: accounts whose current patience sits on top of a past failure — the cohort where the next cancellation costs the most.",
  },
  {
    id: "cs-1184",
    tier: "medium",
    topic: "q8",
    universe: "growth",
    title: "Europe's book, probed backwards",
    brief:
      "From: Growth lead. Re: the reverse-correlation drill.\n\nThe probe station reversed: start from orders, probe each order for a European customer behind it. Same 45-book, correlated from the other side.",
    ask: "One query: the count of orders whose customer exists in the EU.",
    template: `SELECT {1}(*) FROM orders o
WHERE {2} (SELECT 1 FROM customers c
WHERE c.id = o.customer_id AND c.region = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 45 orders have a European customer behind them.",
      },
      {
        answer: "EXISTS",
        kind: "keyword",
        label: "the reverse probe",
        why: "EXISTS rings when the order's customer is European — correlation pointing backwards.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the region filter",
        why: "The probe filters the customer lookup to Europe — the scope inside the correlation.",
      },
    ],
    distractors: ["NOT EXISTS", "'APAC'", "SUM"],
    walkthrough:
      "The correlation points backwards: each order probes for a European customer behind it; 45 rings — the European book, found from the orders side. NOT EXISTS isolates the 58-order complement. Re-aim at 'APAC' and the probe finds 37. SUM cannot stand at a predicate position. The reverse probe is the capstone's direction drill: the same 45 whether the register is named first or the probe walks the orders — direction is style, the figure is fact.",
  },
  {
    id: "cs-1185",
    tier: "medium",
    topic: "q8",
    universe: "growth",
    title: "The mean line, both directions",
    brief:
      "From: Growth lead. Re: the two-sided mean.\n\nThe staged station, two cuts from one mean: above 6.4375 and below it. This file takes the below side — the re-engagement majority of twelve.",
    ask: "One query: the count of accounts whose staged order count is below the mean of counts.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {3}) SELECT {1}(*) FROM per
WHERE n < (SELECT {2}(n) FROM per);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 12 accounts sit below the 6.4375 mean.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the mean aggregator",
        why: "AVG(n) over the stage computes the 6.4375 line both cuts share.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the staging key",
        why: "GROUP BY customer_id folds orders to one count per account.",
      },
    ],
    distractors: ["SUM", "MAX", "total"],
    walkthrough:
      "The stage folds to sixteen counts; the uncorrelated mean sits at 6.4375; twelve accounts live below it — the re-engagement majority. Flip the comparator and the heavy four answer instead; 4 + 12 = 16, the two-sided reconciliation. SUM(n) sets the bar at the whole book — everyone is below it. MAX sets it at the champion — only fifteen below. The two-sided mean is the capstone's last reconciliation: one average, two rosters, sixteen accounts accounted for.",
  },
  {
    id: "cs-1186",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The white-glove roster, chained",
    brief:
      "From: Finance partner. Re: the nested cut with names.\n\nThree stages: spend prices accounts, big keeps past-2k, big2 keeps past-5k — then the join back names the survivors. Two names on the white-glove list.",
    ask: "One query: names and spends of customers in big2 (past-2k, then past-5k).",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > 2000),
big2 AS (SELECT customer_id, s FROM big WHERE s > {3})
SELECT c.name, big2.s FROM big2 JOIN customers c ON c.id = big2.{1}
ORDER BY big2.s {2};`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big2 carries customer_id through both cuts; the join attaches names.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first read",
        why: "DESC reads Alice 7262.35 then Emma 6640.56.",
      },
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the inner cut",
        why: "Five thousand is the inner line, not a result figure. Probed: two accounts survive it.",
      },
    ],
    distractors: ["id", "ASC", "7000"],
    walkthrough:
      "Three stages: spend prices sixteen accounts, big keeps five, big2 re-cuts at 5,000 — two survivors; the join back names them: Alice 7262.35, Emma 6640.56. Join on big2.id and the engine refuses: the projection rules. ASC reads the club's floor first. The white-glove roster is the capstone's deepest chain: two nested cuts and a name, and every hop carries the same thread.",
  },
  {
    id: "cs-1187",
    tier: "hard",
    topic: "q8",
    universe: "growth",
    title: "Europe's heavy load, chained",
    brief:
      "From: Growth lead. Re: the regional sum, capstone edition.\n\nThe three-stage chain scoped to Europe: per folds, big cuts at thirteen, eu_big scopes — one account. Sum the stage: Europe's entire heavy load.",
    ask: "One query: the summed counts in the EU-cut big CTE (13+, Europe).",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, n FROM per WHERE n >= 13),
eu_big AS (SELECT b.n FROM big b JOIN customers c
ON c.id = b.{3} WHERE c.region = {1}) SELECT {2}(n) FROM eu_big;`,
    slots: [
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the regional scope",
        why: "The final stage scopes the heavy register to Europe — one account qualifies.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the regional aggregator",
        why: "SUM(n) over the EU cut: 24 — Alice Chen's whole heavy load.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "big carries customer_id; the join back is where the region filter becomes possible.",
      },
    ],
    distractors: ["COUNT", "'APAC'", "region"],
    walkthrough:
      "Three stages: per folds to counts, big keeps the four heavies, eu_big scopes to Europe — one row; the sum reads 24. COUNT reads 1 — the roster's size. Scope to 'APAC' and the stage empties — no APAC account carries thirteen orders. Read region in the final stage and the engine refuses: eu_big projected only n. Europe's heavy load is one account's whole book — the capstone's starkest regional fact.",
  },
  {
    id: "cs-1188",
    tier: "hard",
    topic: "q8",
    universe: "fraud",
    title: "The full-journey heavyweights",
    brief:
      "From: Fraud analyst. Re: the overlap of the two lists.\n\nTwo capstone patterns intersect: the four-state full-journey probes AND a correlated count at the heavy line. Three accounts ride every state AND thirteen-plus orders.",
    ask: "One query: the count of customers with all four statuses and at least 13 orders.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT COUNT(*) FROM orders o WHERE o.{3} = c.id) >= 13
AND EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')
AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'shipped')
AND EXISTS (SELECT 1 FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = 'pending')
AND EXISTS (SELECT 1 FROM orders o4 WHERE o4.customer_id = c.id AND o4.status = {2});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 3 accounts are full-journey AND heavyweight.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the fourth state",
        why: "cancelled completes the four-probe pattern — the scar side of the journey.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the correlation link",
        why: "Every probe and the count correlate on c.id — one thread through five stations.",
      },
    ],
    distractors: ["SUM", "'shipped'", "region"],
    walkthrough:
      "Five stations, one AND chain: the correlated count keeps the heavy tier, the four probes demand every state — Alice, Emma and Maya pass all five. Re-aim the last probe at 'shipped' and it duplicates the third — the pattern degrades. SUM cannot ring a doorbell. The overlap is the capstone's thesis: the most experienced accounts and the biggest accounts are the same people, and this query proves it in one WHERE.",
  },
  {
    id: "cs-1189",
    tier: "hard",
    topic: "q8",
    universe: "growth",
    title: "The champion's consistency, scoped",
    brief:
      "From: Growth lead. Re: the scoped consistency read.\n\nThree stations: the name scalar scopes to Alice, the correlated mean sets her bar, the count reads her wins — eight of twenty-four orders beat her own mean.",
    ask: "One query: the count of Alice Chen's orders beating her own average order value.",
    template: `SELECT {1}(*) FROM orders o
WHERE o.customer_id = (SELECT id FROM customers WHERE name = {2})
AND o.total > (SELECT {3}(o2.total) FROM orders o2
WHERE o2.customer_id = o.customer_id);`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 8 of Alice's 24 orders clear her personal bar.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the name key",
        why: "The first scalar scopes every later probe to the champion.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the personal mean",
        why: "AVG(o2.total) per correlated slice is her own bar — 302-odd.",
      },
    ],
    distractors: ["SUM", "'Grace Kim'", "MAX"],
    walkthrough:
      "Three stations: the scalar scopes to Alice, the correlated mean draws her personal bar, the count reads eight wins. Re-aim the name and Grace's consistency figure appears — a different account, a lower bar. Swap the bar to MAX and nothing beats its own ceiling. SUM at the counter is invalid syntax. The scoped consistency read is the capstone's densest station: scalar, correlation and count in one WHERE.",
  },
  {
    id: "cs-1190",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The empty register, grand style",
    brief:
      "From: Finance partner. Re: the proven negative.\n\nThe exclusion station over a register that cannot exist: no single order tops 2,000 — the store record is 1,088.44. NOT IN over the empty register returns everyone: 16.",
    ask: "One query: the count of customers not in the register of orders above 2,000.",
    template: `SELECT {1}(*) FROM customers
WHERE id NOT IN (SELECT {2}_id FROM orders WHERE total > {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 16 — the register is empty, so everyone survives.",
      },
      {
        answer: "customer",
        kind: "keyword",
        label: "the register's column root",
        why: "customer_id is the register's column — the id the exclusion matches against.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the impossible line",
        why: "Two thousand is the line, not a result figure. Probed: no order reaches it — the store record is 1088.44.",
      },
    ],
    distractors: ["SUM", "product", "1000"],
    walkthrough:
      "The register asks for orders above 2,000 — and no order in the store reaches it; the record is 1,088.44. The register empties, NOT IN over an empty register keeps everyone, and the count reads 16: a proven negative at capstone scale. Swap the line to 1,000 and the register holds Farid's record order — fifteen survive. product_id is not the customers table's key; the exclusion matches nothing. The empty-register mirror is the capstone's honesty test: the query is right, the data is empty, and sixteen is the true answer.",
  },
  {
    id: "cs-1191",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The runner-up's price tag",
    brief:
      "From: Finance partner. Re: the silver medal.\n\nThe staged station with an offset: sort the spend stage biggest-first, skip the champion, keep one — 6,640.56, the second-highest lifetime spend.",
    ask: "One query: the second-highest spend in the spend CTE, skipping the champion.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id) SELECT s FROM spend ORDER BY s {1}
LIMIT {2} OFFSET {3};`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the stage so the skip-and-keep lands behind the champion.",
      },
      {
        answer: "2",
        kind: "number",
        noVerify: true,
        label: "the keep count",
        why: "Two is the keep, not a result figure — the pair behind the champion prints.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the champion skip",
        why: "One is the skip, not a result figure — OFFSET 1 steps past Alice's 7262.35.",
      },
    ],
    distractors: ["ASC", "3", "0"],
    walkthrough:
      "The stage prices sixteen accounts; the DESC sort leads with Alice's 7,262.35; OFFSET 1 steps past her and LIMIT 2 keeps the pair behind: Emma's 6,640.56 and Grace's 4,574.23 — the silver and bronze, no names needed. Skip nothing and the champion's own figure heads the list. OFFSET 0 is the same as skipping none. ASC reverses the podium entirely. The skip-and-keep pattern is how SQL says 'second-highest' — a question the aggregates cannot ask alone.",
  },
  {
    id: "cs-1192",
    tier: "hard",
    topic: "q8",
    universe: "growth",
    title: "Europe's elite line",
    brief:
      "From: Growth lead. Re: the elite cut.\n\nThe correlated count station at the elite line inside Europe: seventeen orders or more. The inclusive operator matters — Emma's exactly-17 must ride.",
    ask: "One query: the count of EU customers whose order count reaches 17.",
    template: `SELECT {1}(*) FROM customers c
WHERE c.region = 'EU' AND (SELECT COUNT(*) FROM orders o
WHERE o.{3} = c.id) >= {2};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 1 EU account reaches seventeen.",
      },
      {
        answer: "17",
        kind: "number",
        noVerify: true,
        label: "the elite line",
        why: "Seventeen is the line, not a result figure. Probed: Alice's 24 is the only EU count at or above it.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the correlation link",
        why: "o.customer_id = c.id scopes the count to the outer account.",
      },
    ],
    distractors: ["SUM", ">", "product_id"],
    walkthrough:
      "The correlated count tallies each EU account's orders; the elite line at seventeen keeps one — Alice Chen. Flip to strict > and the answer is unchanged: no EU account sits at exactly seventeen; Emma's seventeen belongs to another region. Correlate on product_id and the engine refuses. SUM(*) at the counter is invalid syntax. The elite cut inside one region is the capstone's boundary drill: the line, the operator and the scope must all agree before the figure means anything.",
  },
  {
    id: "cs-1193",
    tier: "hard",
    topic: "q8",
    universe: "growth",
    title: "The champion, chained and named",
    brief:
      "From: Growth lead. Re: the chain's headline.\n\nThree stages: per folds counts, top sorts and trims to one, the join back names him or her. The champion's full address — Alice Chen, 24 orders.",
    ask: "One query: the name and count of the customer in the top CTE (biggest count).",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY customer_id), top AS (SELECT customer_id, n FROM per
ORDER BY n {1} LIMIT 2) SELECT c.name, top.{3} FROM top
JOIN customers c ON c.id = top.{2} ORDER BY top.n DESC, c.name;`,
    slots: [
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first sort",
        why: "DESC ranks the fold so the trim keeps the top two — the champion and the runner-up.",
      },
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the join-back column",
        why: "top carries customer_id; the join attaches each count to its name.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "The stage projects the count as n — the figure beside the name.",
      },
    ],
    distractors: ["ASC", "id", "s"],
    walkthrough:
      "Three stages: the fold builds sixteen counts, top sorts DESC and trims to two, the join back names them — Alice Chen 24, then Emma Wilson 17, tie-broken by name. Join on top.id and the engine refuses: the projection rules. ASC reverses the podium to the quietest accounts. The champion's full address is the capstone's chain at its most readable: fold, trim, name — and the runner-up rides along because ties at the top deserve their context.",
  },
  {
    id: "cs-1194",
    tier: "hard",
    topic: "q8",
    universe: "month-close",
    title: "The idle-account proof, restated",
    brief:
      "From: Ops controller. Re: the capstone's proven negative.\n\nTwo negated probes, one AND: no delivered order AND no shipped order — an account that never moved anything. The store has none; the query proves it.",
    ask: "One query: the count of customers with no delivered and no shipped orders.",
    template: `SELECT {1}(*) FROM customers c
WHERE {2} (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered')
AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = {3});`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 0 — every account has moved goods at least once.",
      },
      {
        answer: "NOT EXISTS",
        kind: "keyword",
        label: "the first negated probe",
        why: "NOT EXISTS demands the delivered doorbell never ring — total silence.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the second probed state",
        why: "The second probe demands the shipped doorbell stay silent too.",
      },
    ],
    distractors: ["EXISTS", "'pending'", "SUM"],
    walkthrough:
      "Two negated probes, one AND: fifteen accounts have delivered, ten have shipped, nine have both — the union covers all sixteen. The count reads 0: no idle accounts, a proven negative. Flip either probe to EXISTS and the query counts holders instead — 15 or 10. Re-aim at 'pending' and the negation asks who never waited: 8. The proof is the capstone's quietest figure — zero, earned by exhaustiveness.",
  },
  {
    id: "cs-1195",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The 2k roster, priced and ranked",
    brief:
      "From: Finance partner. Re: the full shortlist.\n\nThe staged station at the 2k line with names: five accounts past two thousand, priced and ranked — the retention shortlist in full.",
    ask: "One query: names and spends of the customers in the spend CTE past 2,000.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id), big AS (SELECT customer_id, s FROM spend WHERE s > {1})
SELECT c.name, big.s FROM big JOIN customers c ON c.id = big.{2}
ORDER BY big.s {3};`,
    slots: [
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the shortlist line",
        why: "Two thousand is the line, not a result figure. Probed: five accounts clear it.",
      },
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
        why: "DESC leads with 7262.35 — the shortlist reads heaviest first.",
      },
    ],
    distractors: ["SUM", "id", "ASC"],
    walkthrough:
      "The stage prices sixteen accounts; the line at 2,000 keeps five; the join back names them, heaviest first — Alice, Emma, Grace, and two more between the line and Grace's 4,574.23. Join on big.id and the engine refuses. ASC reads the floor first — a softer shortlist than the memo wants. The full shortlist is the retention team's working document, and the capstone builds it with the same three moves every roster in the module uses.",
  },
  {
    id: "cs-1196",
    tier: "hard",
    topic: "q8",
    universe: "growth",
    title: "The six-personal-best club",
    brief:
      "From: Growth lead. Re: the consistency club.\n\nThe nested consistency census: count each account's above-own-mean orders, keep the accounts with six or more. Four names — Maya, Emma, Alice and Grace.",
    ask: "One query: the count of customers with at least 6 orders above their own average.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id
AND o.total > (SELECT {2}(o2.total) FROM orders o2
WHERE o2.customer_id = {3})) >= 6;`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the outer counting aggregate",
        why: "One number out: 4 accounts clear six personal bests.",
      },
      {
        answer: "AVG",
        kind: "keyword",
        label: "the nested personal mean",
        why: "AVG(o2.total) inside the count computes each account's own bar.",
      },
      {
        answer: "c.id",
        kind: "keyword",
        label: "the double-correlation anchor",
        why: "The count and the mean both key on c.id — two correlated probes, one account.",
      },
    ],
    distractors: ["SUM", "MAX", "o.id"],
    walkthrough:
      "Three correlated layers: the innermost mean sets each account's bar, the middle count tallies that account's wins, the outer cut keeps accounts at six-plus — Maya, Emma and Alice at eight, Grace at exactly six. Correlate the mean on o.id and the slices become single-order nonsense. MAX sets every bar at the account's own ceiling — zero wins. SUM(*) at the counter is invalid syntax. The consistency club is the capstone's deepest correlated assembly, and its four names are the storefront's most reliable buyers.",
  },
  {
    id: "cs-1197",
    tier: "hard",
    topic: "q8",
    universe: "pricing",
    title: "The premium lane's owners",
    brief:
      "From: Pricing analyst. Re: the lane's membership.\n\nThe correlated peak station at the premium line: accounts whose single biggest order reaches 700 — the lane's seven owners, counted.",
    ask: "One query: the count of customers whose maximum order total is at least 700.",
    template: `SELECT {1}(*) FROM customers c
WHERE (SELECT {2}(o.total) FROM orders o
WHERE o.customer_id = c.id) >= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 7 accounts own a premium-lane order.",
      },
      {
        answer: "MAX",
        kind: "keyword",
        label: "the correlated peak",
        why: "MAX(o.total) reduces each history to its biggest order — the lane's membership test.",
      },
      {
        answer: "700",
        kind: "number",
        noVerify: true,
        label: "the premium line",
        why: "Seven hundred is the lane's definition, not a result figure. Probed: 7 accounts peak at or above it.",
      },
    ],
    distractors: ["SUM", "MIN", "AVG"],
    walkthrough:
      "The correlated MAX reduces every account to its peak; the line at 700 keeps seven — the lane's owners. Ten orders ride the lane but only seven accounts: the heavyweights ride twice. SUM tests lifetime spend — nearly everyone clears. MIN and AVG test the wrong statistics — floors and rates, not peaks. The lane's membership is the capstone's peak station at its natural line: one figure per account, seven survivors.",
  },
  {
    id: "cs-1198",
    tier: "hard",
    topic: "q8",
    universe: "month-close",
    title: "The champion's open work",
    brief:
      "From: Ops controller. Re: the champion's backlog.\n\nTwo stations scoped: the name scalar resolves Alice, the correlated count with a status filter reads her open orders — three, the biggest single backlog in the store.",
    ask: "One query: the count of Alice Chen's pending orders.",
    template: `SELECT {1}(*) FROM orders o
WHERE o.customer_id = (SELECT id FROM customers WHERE name = {2})
AND o.status = {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 3 pending orders — the store's biggest single backlog.",
      },
      {
        answer: "'Alice Chen'",
        kind: "keyword",
        label: "the name key",
        why: "The scalar scopes the backlog read to the champion.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-work filter",
        why: "pending is the open-work state — the filter inside the scoped count.",
      },
    ],
    distractors: ["SUM", "'Grace Kim'", "AVG"],
    walkthrough:
      "Two stations: the scalar resolves Alice; the status filter narrows her 24 orders to the three still pending — the store's largest single-account backlog. Re-aim at Grace: her backlog is smaller — one open order. Price the backlog with AVG and the read becomes a rate, not a count. SUM(total) would price it too. The scoped count is the capstone's ops station: one name, one status, one figure the standup can act on.",
  },
  {
    id: "cs-1199",
    tier: "hard",
    topic: "q8",
    universe: "expense",
    title: "The mid tier, bracketed",
    brief:
      "From: Finance partner. Re: the mid-tier count, capstone edition.\n\nThe staged station bracketed: past 2,000 but not past 5,000 — the three accounts between the big spenders and the heavyweights.",
    ask: "One query: the count of accounts in the spend CTE above 2,000 and at most 5,000.",
    template: `WITH spend AS (SELECT customer_id, SUM(total) AS s FROM orders
GROUP BY customer_id) SELECT {1}(*) FROM spend
WHERE s > {2} AND s <= {3};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number out: 3 accounts form the mid tier.",
      },
      {
        answer: "2000",
        kind: "number",
        noVerify: true,
        label: "the tier's floor",
        why: "Two thousand is the floor, not a result figure. Probed: five accounts pass it.",
      },
      {
        answer: "5000",
        kind: "number",
        noVerify: true,
        label: "the tier's ceiling",
        why: "Five thousand is the ceiling, not a result figure. Probed: two of the five also pass it — three remain.",
      },
    ],
    distractors: ["SUM", "4000", "7000"],
    walkthrough:
      "The stage prices sixteen accounts; the bracket keeps spends above 2,000 and at most 5,000 — three accounts, the middle class between the five past-2k and the two heavyweights. Raise the ceiling to 7,000 and Emma joins: 4. Lower the floor to 1,000 and the bracket widens further. SUM over the bracket totals the tier's combined spend instead of counting it. The bracket is the capstone's two-boundary drill: 5 above the floor, 2 above the ceiling, 3 in between — the arithmetic that proves the cut.",
  },
  {
    id: "cs-1200",
    tier: "hard",
    topic: "q8",
    universe: "month-close",
    title: "The grand reconciliation",
    brief:
      "From: Ops controller. Re: the module's final figure.\n\nThe closing station: fold all 103 orders into per-account counts, then sum the stage. The total must reassemble the whole book — the reconciliation every report in the module ends on.",
    ask: "One query: the sum of the per-customer order counts from the per CTE.",
    template: `WITH per AS (SELECT customer_id, COUNT(*) AS n FROM orders
GROUP BY {1}) SELECT {2}({3}) FROM per;`,
    slots: [
      {
        answer: "customer_id",
        kind: "keyword",
        label: "the fold's key",
        why: "GROUP BY customer_id is the fold whose completeness the figure verifies.",
      },
      {
        answer: "SUM",
        kind: "keyword",
        label: "the reconciliation aggregator",
        why: "SUM(n) over the stage: 103 — the whole book, reassembled.",
      },
      {
        answer: "n",
        kind: "keyword",
        label: "the staged count column",
        why: "The stage projects the count as n; the reconciliation sums n.",
      },
    ],
    distractors: ["COUNT", "AVG", "region"],
    walkthrough:
      "The final station: the fold splits 103 orders across sixteen accounts; the sum reassembles them — 103, exactly the raw count, the fold leaked nothing. COUNT(n) reads 16 — accounts, not orders. AVG reads 6.4375 — the mean. Group by a column orders lacks and the fold refuses outright. The grand reconciliation is the capstone's last lesson and the module's first: whatever the fold splits, the sum must put back together — and now every figure in the deck traces to a fold that passes this test.",
  },
];
