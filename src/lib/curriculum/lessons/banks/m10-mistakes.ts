// Retrofit mistake-coaching for the 153 Module 10 problems whose ProbRow
// tuples shipped with empty `mistakes` arrays (l58: 12 · l59: 21 · l60: 19 ·
// l61: 22 · l62: 43 · l63: 36). Keyed by problem id — probBank() merges these
// onto the built Problem objects after any inline rules. Every regex is
// authored against the problem's own solution: scripts/check-m10-mistakes.mjs
// verifies each compiles and never matches the solution (tests run against
// normalizeSql output — lowercase, whitespace collapsed, (),; hugged).

export const M10_MISTAKES: Record<string, Array<[string, string]>> = {
  // ---- Lesson 58 — Windows IV: OVER from first principles ----
  "l58-p7": [
    ["limit\\s+\\d+", "LIMIT/OFFSET pages the ledger by hand — ROW_NUMBER() OVER (ORDER BY created_at, id) numbers all 103 rows in one pass, and the number survives any later filter."],
    ["count\\s*\\(\\s*\\*\\s*\\)\\s*over", "COUNT(*) OVER (ORDER BY …) counts rows so far, it doesn't number them — the ledger wants ROW_NUMBER(), which never repeats."],
    ["over\\s*\\(\\s*\\)", "An empty OVER leaves the row order to chance — number by created_at (tiebreak id) so rn 1 is genuinely the first order."],
  ],
  "l58-p11": [
    ["group\\s+by", "GROUP BY folds the 103 orders down to four status rows — the brief wants every order row kept, stamped with its group's size (52 / 30 / 14 / 7)."],
    ["over\\s*\\(\\s*\\)", "An empty OVER counts the whole store (103) onto every row — PARTITION BY status is what makes the count restart per group."],
    ["partition\\s+by\\s+id\\b", "Partitioning by id stages 103 solo groups of one — the stage is the status, not the order."],
  ],
  "l58-p12": [
    ["partition\\s+by", "GROUP BY already made the four status rows — PARTITION BY status inside OVER would stage each row alone and rank every status 1."],
    ["row_number\\s*\\(", "ROW_NUMBER breaks ties arbitrarily; RANK lets equals share a rung. Group counts can tie — rank like a leaderboard."],
    ["order\\s+by\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*asc", "Ascending crowns the smallest group — the brief reads loudest first: ORDER BY COUNT(*) DESC."],
  ],
  "l58-p13": [
    ["group\\s+by", "GROUP BY collapses to one row per customer — the stamp wants all 103 order rows, each carrying its owner's average."],
    ["over\\s*\\(\\s*\\)", "An empty OVER averages the whole store onto every row — PARTITION BY customer_id gives each account its own mean, and the two differ for almost everyone."],
    ["partition\\s+by\\s+id\\b", "id is the order, not the owner — partition by customer_id or every order averages against itself."],
  ],
  "l58-p16": [
    ["over\\s*\\(\\s*\\)", "MIN over an empty OVER returns the all-time floor on every row — with ORDER BY month the minimum walks forward, ratcheting down as cheap months pass."],
    ["max\\s*\\(\\s*rev", "MAX tracks the ceiling; the brief asks for the floor so far — MIN(rev) OVER (ORDER BY month)."],
    ["partition\\s+by", "No partition wanted — one continuous walk across the 14 months; a partition would restart the floor mid-story."],
  ],
  "l58-p21": [
    ["row_number\\s*\\(", "ROW_NUMBER hands out arbitrary rungs on ties — the pair wanted here is RANK (gaps after ties) beside DENSE_RANK (no gaps); watch them diverge once two customers share a count."],
    ["partition\\s+by", "The contest is store-wide among customers — partitioning (say, by region) would crown a separate leader per slice."],
    ["group\\s+by\\s+(c\\.)?name\\b", "Grouping by name merges two customers who share a name — group by c.id (the key) and carry the name along."],
  ],
  "l58-p25": [
    ["max\\s*\\(\\s*(o\\.)?created_at\\s*\\)[^;]*group\\s+by", "MAX(created_at) per customer finds the date but strands the rest of the row — number the orders, then rn = 1 keeps the whole latest one."],
    ["from\\s+orders\\s+where\\s+rn", "The rank filter must sit in a layer ABOVE the window — WHERE rn = 1 at the same level is a chicken-and-egg error; wrap the numbering in a CTE first."],
    ["over\\s*\\(\\s*partition\\s+by\\s+(o\\.)?customer_id\\s+order\\s+by\\s+(o\\.)?created_at\\s*\\)", "Without DESC the numbering crowns the FIRST order — the latest taste needs created_at DESC (tiebreak id DESC)."],
  ],
  "l58-p32": [
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY category the ladder runs across the whole catalog — each category needs its own 1…N count."],
    ["price\\s+desc", "Descending makes 1 the priciest — the brief climbs from cheapest: ORDER BY price (tiebreak id)."],
    ["\\brank\\s*\\(|\\bdense_rank\\s*\\(", "The brief asks for ROW_NUMBER — RANK would print duplicate rungs wherever two products share a price."],
  ],
  "l58-p34": [
    ["partition\\s+by", "COUNT(*) OVER (PARTITION BY supplier_id) stamps product rows — the league wants ONE row per supplier: GROUP BY the supplier, then rank the counts."],
    ["group\\s+by\\s+p\\.id\\b", "Grouping by the product id puts every product alone in its own group, counting 1 — group by the supplier (s.id)."],
    ["avg\\s*\\(|sum\\s*\\(", "The metric is shelf count — COUNT(*), not a price roll-up."],
  ],
  "l58-p39": [
    ["^(?!.*\\bwhere\\b)", "Every status is in the ladder — gate the rows first: WHERE status = 'cancelled', then rank the 7 survivors within their months."],
    ["partition\\s+by\\s+created_at\\b", "Partitioning by the raw timestamp stages each order alone — slice the month first: SUBSTR(created_at, 1, 7)."],
    ["order\\s+by\\s+total\\s+asc", "Ascending hands rank 1 to the smallest cancelled order — the heavyweight leads: ORDER BY total DESC."],
  ],
  "l58-p42": [
    ["group\\s+by", "One row per order is the point — GROUP BY collapses the ledger and the per-order delta vanishes."],
    ["partition\\s+by", "The benchmark is the STORE average (every order vs one number) — PARTITION BY customer_id would compare each order to its own household instead."],
    ["avg\\s*\\(\\s*total\\s*\\)\\s*over[^;]*-\\s*total", "Mind the sign — the ask is total minus the store average (positive = above the line), not the other way round."],
  ],
  "l58-p51": [
    ["partition\\s+by", "The snowball must cross the whole store — PARTITION BY customer_id restarts it 16 times and the final row no longer meets the grand total."],
    ["over\\s*\\(\\s*\\)[^;]*over\\s*\\(\\s*\\)", "Two empty OVERs make both columns the grand total — the convergence check then proves nothing; one window needs ORDER BY created_at, id to accumulate."],
    ["order\\s+by\\s+created_at(?!\\s*,)", "The tiebreak matters — 84 order days share dates, so ORDER BY created_at alone leaves the accumulation order ambiguous between same-day orders."],
  ],

  // ---- Lesson 59 — Windows V: ranking playbook ----
  "l59-p2": [
    ["max\\s*\\(\\s*(o\\.)?total\\s*\\)[^;]*group\\s+by", "MAX(total) per customer answers 'how much', not 'which order' — number the orders and keep rn = 1 so the order id survives."],
    ["from\\s+orders\\s+where\\s+rn", "WHERE rn = 1 at the window's own level is a chicken-and-egg error — wrap the numbering in a CTE (or derived table) and filter above it."],
    ["over\\s*\\(\\s*partition\\s+by\\s+(o\\.)?customer_id\\s+order\\s+by\\s+(o\\.)?total\\s*\\)", "Without DESC the 'biggest moment' becomes the smallest — sort total DESC inside the OVER."],
  ],
  "l59-p5": [
    ["max\\s*\\(\\s*(o\\.)?created_at\\s*\\)[^;]*group\\s+by", "MAX(created_at) yields the timestamp but strands status and id — ROW_NUMBER over the customer stage keeps the whole latest row."],
    ["from\\s+orders\\s+where\\s+rn", "The rn filter needs a layer above the window — number in a CTE, then WHERE rn = 1 outside it."],
    ["over\\s*\\(\\s*partition\\s+by\\s+(o\\.)?customer_id\\s+order\\s+by\\s+(o\\.)?created_at\\s*\\)", "Ascending picks each customer's debut — the current status needs created_at DESC (tiebreak id DESC)."],
  ],
  "l59-p10": [
    ["partition\\s+by", "One store-wide league of 14 months — partitioning would restart the contest and crown a leader per slice."],
    ["row_number\\s*\\(", "The brief stages the pair RANK and DENSE_RANK side by side — ROW_NUMBER hides the tie behavior the lesson is about."],
    ["order\\s+by\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*asc", "Ascending hands rank 1 to the quietest month — the brief reads loudest first: ORDER BY COUNT(*) DESC."],
  ],
  "l59-p13": [
    ["from\\s+order_items\\s+where\\s+rn", "The rank filter must sit above the window — number in a CTE, then WHERE rn BETWEEN 2 AND 3 in the outer layer."],
    ["rn\\s*=\\s*1\\b", "rn = 1 is the champion — the podium spots wanted here are 2 and 3: WHERE rn BETWEEN 2 AND 3."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY category one global ladder spans the catalog — silver and bronze per category need the stage."],
  ],
  "l59-p14": [
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY category the ladder mixes shelves — each category numbers its own products."],
    ["order\\s+by\\s+sum\\s*\\([^)]*\\)\\s*asc", "Ascending makes 1 the weakest seller — the ladder reads heavy first: revenue DESC (tiebreak p.id)."],
    ["\\brank\\s*\\(|\\bdense_rank\\s*\\(", "The ladder is ROW_NUMBER — RANK would print duplicate rungs on tied revenue; the id tiebreak keeps it strict."],
  ],
  "l59-p17": [
    ["max\\s*\\(\\s*(oi\\.)?quantity\\s*\\)[^;]*group\\s+by", "MAX(quantity) caps a single line's quantity — the star is the product with the most UNITS sold: SUM(oi.quantity), ranked."],
    ["from\\s+order_items\\s+where\\s+rn", "The rank filter must sit above the numbering — CTE first, WHERE rn = 1 outside."],
    ["over\\s*\\(\\s*order\\s+by", "The star is per supplier — partition by p.supplier_id so every supplier crowns its own product."],
  ],
  "l59-p20": [
    ["partition\\s+by", "The census is one store-wide league of regions — a partition would rank inside a slice and let every region read 1."],
    ["row_number\\s*\\(", "ROW_NUMBER can't show the tie story — the brief stages RANK beside DENSE_RANK precisely to reveal how ties compress."],
    ["order\\s+by\\s+count\\s*\\(\\s*\\*\\s*\\)\\s*asc", "Ascending crowns the smallest crowd — loudest region first: ORDER BY COUNT(*) DESC."],
  ],
  "l59-p22": [
    ["percent_rank\\s*\\(", "PERCENT_RANK scores share-BELOW (the bottom row reads 0) — the standing wants cumulative share: CUME_DIST, ending at 1.0."],
    ["over\\s*\\(\\s*order\\s+by\\s+sum[^)]*\\)\\s*desc", "DESC flips the distribution — keep the spend ascending so the biggest spenders land at 1.0; the outer ORDER BY cd DESC handles the reading order."],
    ["\\brank\\s*\\([^)]*\\)[^;]*as\\s+cd", "RANK returns integer rungs, not shares — the standing wants CUME_DIST()."],
  ],
  "l59-p24": [
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id one store-wide number line — each customer needs positions restarting at 1."],
    ["\\brank\\s*\\(|\\bdense_rank\\s*\\(", "Positions are strict — ROW_NUMBER, not RANK: same-day orders would share a rung and skip the next."],
    ["order\\s+by\\s+(o\\.)?created_at\\s+desc", "DESC numbers the newest order 1 — the ask is chronological: created_at ASC (tiebreak id)."],
  ],
  "l59-p26": [
    ["from\\s+orders\\s+where\\s+rn", "The rn filter needs a layer above the window — number in a CTE, filter outside."],
    ["rn\\s*=\\s*1\\b", "rn = 1 stops at the latest order — the brief wants the last TWO: WHERE rn <= 2."],
    ["limit\\s+2\\b", "LIMIT 2 truncates the final table after sorting — it cannot take two PER CUSTOMER; the cap lives on rn inside each partition."],
  ],
  "l59-p28": [
    ["^(?!.*\\bwhere\\b)", "The heavyweight hunt must run on cancelled rows only — gate first: WHERE status = 'cancelled', then number within the month."],
    ["partition\\s+by\\s+created_at\\b", "Partitioning by the raw timestamp stages singletons — slice months with SUBSTR(created_at, 1, 7) first."],
    ["from\\s+orders\\s+where\\s+rn", "Filter rn in the layer ABOVE the numbering — the CTE holds the window, the outer WHERE holds rn = 1."],
  ],
  "l59-p31": [
    ["row_number\\s*\\(", "ROW_NUMBER invents an order on tied lines — RANK lets equal line values share a rung inside the basket, which is the honest read."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY order_id the ladder spans the whole ledger — each basket needs its own contest."],
    ["quantity\\s*\\*\\s*unit_price\\s+asc", "Ascending crowns the cheapest line — the ladder reads heavy first: DESC (tiebreak id)."],
  ],
  "l59-p33": [
    ["partition\\s+by\\s+category(?!\\s*,)", "Twins are same category AND same price — partition by the pair, or every same-category product counts its whole shelf."],
    ["n_twins\\s*(=\\s*1|>=\\s*1|>\\s*0)", "The sentinel reports DUPLICATES — n_twins > 1; = 1 lists every price and >= 1 is all of them."],
    ["from\\s+products\\s+where\\s+n_twins", "The filter needs the window's output — wrap the DISTINCT pass in a CTE and filter n_twins in the layer above."],
  ],
  "l59-p34": [
    ["partition\\s+by", "One league across all categories — partitioning would make every category its own rank 1."],
    ["order\\s+by\\s+sum\\s*\\(\\s*oi\\.quantity\\s*\\)", "Units and dollars disagree — the league ranks REVENUE: SUM(quantity × unit_price), not SUM(quantity)."],
    ["group\\s+by\\s+p\\.id\\b", "Grouping by product id ladders every product against itself — the league is per category: GROUP BY p.category."],
  ],
  "l59-p37": [
    ["partition\\s+by\\s+region", "PARTITION BY region stages each region alone and crowns all four — the crown needs one store-wide ORDER BY revenue DESC."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "The metric is revenue, not footfall — SUM(o.total) decides the crown."],
    ["group\\s+by\\s+c\\.name\\b", "Grouping by name strands customers sharing a name — group by c.region so revenue pools correctly."],
  ],
  "l59-p38": [
    ["sum\\s*\\(\\s*p\\.price\\s*\\)", "SUM(price) rewards the widest catalog — the league ranks AVERAGE price: AVG(p.price)."],
    ["partition\\s+by", "The league is store-wide among suppliers — partitioning would crown a leader per slice."],
    ["avg\\s*\\(\\s*p\\.price\\s*\\)\\s*asc", "Ascending makes rank 1 the budget supplier — the brief reads priciest first: AVG(price) DESC."],
  ],
  "l59-p40": [
    ["partition\\s+by\\s+month\\b|partition\\s+by\\s+substr\\s*\\(\\s*created_at\\s*,\\s*1\\s*,\\s*7\\s*\\)", "Partitioning by month stages singletons — the year is the stage: SUBSTR(created_at, 1, 4)."],
    ["group\\s+by\\s+month(?!\\s*,)", "'2024-01' and '2025-01' are distinct months — GROUP BY year, month, or Januarys from different years merge."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY the months run one global ladder — ranks must restart each year."],
  ],
  "l59-p44": [
    ["max\\s*\\(\\s*total\\s*\\)[^;]*group\\s+by", "MAX(total) per month finds the amount but strands the order id — number orders within the month and keep rn = 1."],
    ["from\\s+orders\\s+where\\s+rn", "The rn filter needs a layer above the window — CTE first, WHERE rn = 1 outside."],
    ["partition\\s+by\\s+created_at\\b", "Each timestamp is its own stage — partition by the month slice: SUBSTR(created_at, 1, 7)."],
  ],
  "l59-p45": [
    ["rn\\s*=\\s*1\\b", "rn = 1 is champions only — the podium seats two: WHERE rn <= 2."],
    ["limit\\s+2\\b", "LIMIT 2 cuts the final table to two rows overall — the cap is per month, on rn."],
    ["from\\s+orders\\s+where\\s+rn", "Filter rn in the layer ABOVE the numbering — the CTE holds the window, the outer WHERE holds rn <= 2."],
  ],
  "l59-p46": [
    ["partition\\s+by\\s+status", "PARTITION BY status makes every status rank 1 against itself — the league needs one ORDER BY SUM(total) DESC across the four grouped rows."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "Order counts and dollars disagree — rank revenue: SUM(total)."],
    ["having\\s+sum", "HAVING would evict a status from the league — all four rows belong; no gate needed."],
  ],
  "l59-p49": [
    ["max\\s*\\(\\s*total\\s*\\)[^;]*group\\s+by", "MAX(total) per status finds the amount but drops the order id — number within the status stage and keep rn = 1."],
    ["from\\s+orders\\s+where\\s+rn", "The rn filter needs a layer above the window — CTE first, WHERE rn = 1 outside."],
    ["partition\\s+by\\s+customer_id", "The contest is per STATUS, not per customer — partition by status so each status crowns its own order."],
  ],

  // ---- Lesson 60 — Windows VI: LAG & LEAD ----
  "l60-p5": [
    ["lead\\s*\\(", "LEAD looks forward; the slide is rev minus the PREVIOUS month — LAG(rev) OVER (ORDER BY month)."],
    ["order\\s+by\\s+delta\\s+desc", "DESC celebrates the biggest jump — the steepest slide is the most NEGATIVE delta: ORDER BY delta ASC, take 1."],
    ["lag\\s*\\(\\s*total\\b", "LAG over raw orders compares consecutive ORDERS — the slide is month-over-month: fold to months first (GROUP BY SUBSTR(created_at, 1, 7)), then LAG(rev)."],
  ],
  "l60-p7": [
    ["lead\\s*\\(", "LEAD points at NEXT month — the pulse asks how this month differs from the last: LAG(n)."],
    ["partition\\s+by", "One continuous 14-month pulse — a partition restarts the comparison and NULLs the first reading of every slice."],
    ["count\\s*\\(\\s*distinct", "COUNT(DISTINCT …) changes the metric — the pulse counts orders placed per month: COUNT(*)."],
  ],
  "l60-p10": [
    ["lag\\s*\\([^)]*\\)\\s*over[\\s\\S]*lag\\s*\\(", "Two LAGs see only backwards — the next visit needs LEAD(created_at) over the same customer stage."],
    ["^(?!.*\\blag\\s*\\()", "Only LEAD? The previous visit is LAG(created_at) — both neighbors, one stage each."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id the neighbors jump between customers — stage per customer so first/last visits read NULL."],
  ],
  "l60-p12": [
    ["lead\\s*\\(", "LEAD grabs the NEXT basket — the previous one is LAG(total) OVER (PARTITION BY customer_id ORDER BY created_at, id)."],
    ["over\\s*\\(\\s*order\\s+by", "Store-wide neighbors cross households — PARTITION BY customer_id keeps each customer's own history."],
    ["sum\\s*\\(\\s*total\\s*\\)\\s+over", "SUM builds a snowball, not a neighbor — the previous BASKET is LAG(total)."],
  ],
  "l60-p13": [
    ["lead\\s*\\(", "LEAD measures against the NEXT order — growth reads backwards: total minus LAG(total)."],
    ["lag\\s*\\(\\s*total\\s*\\)\\s*over\\s*\\([^)]*\\)\\s*-\\s*total", "Mind the sign — growth is this basket minus the last (positive = bigger), not last minus this."],
    ["over\\s*\\(\\s*order\\s+by", "Without the customer stage, deltas cross households — each customer's first order should read NULL."],
  ],
  "l60-p14": [
    ["lead\\s*\\(", "LEAD compares to the next order — beat_prev asks against the previous one: LAG(total)."],
    ["where\\s+total\\s*>", "WHERE evicts rows — every order stays, stamped 1 or 0 by the CASE."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id the 'previous order' is a stranger's — stage per customer."],
  ],
  "l60-p17": [
    ["-\\s*lag\\s*\\(", "Timestamps subtract as text and collapse to nonsense — wrap BOTH sides in julianday() so the gap is real days."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id the rhythm mixes households — gaps must run within each customer's own timeline."],
    ["group\\s+by\\s+month", "The rhythm is per customer, not per month — GROUP BY customer_id after computing each gap."],
  ],
  "l60-p18": [
    [">\\s*=\\s*60", "The watch starts AFTER 60 — a 60-day gap is not a two-timer event; keep gap > 60."],
    ["over\\s*\\(\\s*order\\s+by", "Without a partition the watch chains every customer's orders together — gaps must run within one buyer's timeline."],
    ["min\\s*\\(\\s*gap\\s*\\)", "MIN(gap) collapses to the shortest silence and drops the dates — keep the per-gap rows and filter gap > 60."],
  ],
  "l60-p21": [
    ["lag\\s*\\(\\s*rev\\s*\\)", "LAG(rev) steps one month back — the ask is the same month LAST QUARTER: LAG(rev, 3)."],
    ["lead\\s*\\(", "LEAD peeks forward — the comparison is backwards, three months: LAG(rev, 3)."],
    ["partition\\s+by", "The 14 months run one continuous line — a partition would NULL the first readings of every slice."],
  ],
  "l60-p22": [
    ["lag\\s*\\(", "LAG looks backwards — the preview wants NEXT month: LEAD(rev) OVER (ORDER BY month)."],
    ["over\\s*\\(\\s*\\)", "Without ORDER BY month there is no 'next' — LEAD needs the chronological sort to find the following row."],
    ["rev\\s*-|\\bdelta\\b", "The preview prints next month's revenue as its own column — no subtraction; delta is a different report."],
  ],
  "l60-p23": [
    ["lag\\s*\\(", "LAG returns the PREVIOUS visit — the forecaster needs the one that FOLLOWED: LEAD(created_at)."],
    ["over\\s*\\(\\s*order\\s+by", "Next-order dates must stay within a customer — PARTITION BY customer_id; the last order of each reads NULL."],
    ["max\\s*\\(\\s*created_at\\s*\\)[^;]*group\\s+by", "MAX(created_at) gives the latest date, not the date that FOLLOWED each order — LEAD walks the timeline row by row."],
  ],
  "l60-p24": [
    ["lead\\s*\\(", "LEAD reports where the customer went NEXT — prev_status is the status BEFORE: LAG(status)."],
    ["over\\s*\\(\\s*order\\s+by", "Transitions chain within one buyer — PARTITION BY customer_id, else statuses hop between customers."],
    ["distinct", "DISTINCT collapses the timeline — each order row shows its own status next to the one before."],
  ],
  "l60-p30": [
    ["group\\s+by", "GROUP BY folds to one row per customer — the stamp rides on every order row: MIN(created_at) OVER (PARTITION BY customer_id)."],
    ["row_number\\s*\\(|lag\\s*\\(", "Numbering or stepping finds the first order indirectly — the direct stamp is MIN(created_at) OVER the customer stage, sliced to 7 characters."],
    ["partition\\s+by\\s+substr", "Slice AFTER the minimum — partition by the raw customer_id and take SUBSTR(..., 1, 7) of the result; partitioning by the month makes every month its own minimum."],
  ],
  "l60-p31": [
    ["lead\\s*\\(", "LEAD points forward — prev_at is LAG(created_at) over the customer stage."],
    ["lag\\s*\\([^)]*\\)\\s*over[\\s\\S]*lag\\s*\\(", "Two LAGs double the same look backwards — pos is ROW_NUMBER, prev_at is LAG(created_at); one window each."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id the index runs store-wide — each customer's lifetime starts at pos 1."],
  ],
  "l60-p35": [
    ["count\\s*\\(\\s*distinct\\s+customer_id\\s*\\)", "COUNT(DISTINCT customer_id) counts unique buyers — the brief counts REPEAT orders: flag each order whose previous one exists (LAG IS NOT NULL), then SUM."],
    ["is\\s+null\\s+then\\s+1", "A NULL previous order means DEBUT — flag it 0; repeats (previous exists) are the 1s that SUM counts."],
    ["group\\s+by\\s+customer_id", "The census is per month — GROUP BY the month slice after stamping each order; grouping by customer counts their lifetime repeats."],
  ],
  "l60-p42": [
    ["lag\\s*\\(", "LAG steps to the pricier side — the neighbor BELOW in a DESC listing is LEAD(price)."],
    ["over\\s*\\(\\s*order\\s+by", "Neighbors must share a category — PARTITION BY category, else the catalog chains across shelves."],
    ["order\\s+by\\s+price\\s*,\\s*id\\s*\\)", "Cheapest-first lists the neighbor ABOVE — sort price DESC so LEAD hands you the next one down."],
  ],
  "l60-p45": [
    ["order\\s+by\\s+delta", "The flip is a TIME question, not a magnitude question — take the earliest month where the sign flips (ORDER BY month, LIMIT 1), not the biggest drop."],
    ["lag\\s*\\(\\s*delta\\s*\\)\\s+over\\s*\\(\\s*\\)", "prev_delta needs the same month order — LAG(delta) OVER (ORDER BY month), else 'previous' is undefined."],
    ["delta\\s*<\\s*0\\s+order", "A down-month alone isn't the flip — the gate needs BOTH: delta < 0 AND the previous delta > 0."],
  ],
  "l60-p47": [
    ["lag[\\s\\S]*lag", "Two LAGs both stare backwards — next_rev is LEAD(rev) over the same month order."],
    ["partition\\s+by", "One 14-month timeline — a partition would NULL the edges of every slice; the pulse is continuous."],
    ["over\\s*\\(\\s*\\)", "An empty OVER has no 'previous' or 'next' — both windows need ORDER BY month."],
  ],
  "l60-p49": [
    ["lag\\s*\\(\\s*count", "LAG(COUNT(*)) folds awkwardly — roll orders up to customer-months in a CTE first, then LAG(n) OVER (PARTITION BY customer_id ORDER BY month)."],
    ["lag\\s*\\(\\s*n\\s*\\)\\s+over\\s*\\(\\s*order\\s+by\\s+month\\s*\\)", "Density chains within ONE customer — without PARTITION BY customer_id December of one buyer chains to January of another."],
    ["count\\s*\\(\\s*distinct", "COUNT(DISTINCT …) undercounts repeat visits — the density is orders per customer-month: COUNT(*)."],
  ],

  // ---- Lesson 61 — Windows VII: frames & running math ----
  "l61-p5": [
    ["rows\\s+between\\s+2\\s+preceding\\s+and\\s+current", "That trailing frame lags one step behind — the CENTERED smoother leans both ways: ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING."],
    ["partition\\s+by", "One continuous 103-order line — the smoother glides across the whole store, no stages."],
    ["range\\s+between", "RANGE spans peer rows, not a fixed window of 3 — ROWS pins exactly one neighbor each side."],
  ],
  "l61-p8": [
    ["rows\\s+between\\s+1\\s+preceding\\s+and\\s+1\\s+following", "The centered frame peeks at NEXT month — the brief wants a trailing average: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW."],
    ["range\\s+between\\s+2\\s+preceding", "RANGE 2 PRECEDING reaches two timestamp-units of distance, not two rows — with sparse months the frame miscounts; ROWS counts rows."],
    ["avg\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER averages all 14 months onto every row — the moving average needs ORDER BY month with its frame."],
  ],
  "l61-p10": [
    ["range\\s+between\\s+6\\s+preceding", "RANGE reaches 6 timestamp-units back — 84 order days skip calendar gaps, so the frame miscounts; ROWS BETWEEN 6 PRECEDING AND CURRENT ROW is exactly 7 orders."],
    ["sum\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "The denominator is the 7-order frame, not the store total — an empty OVER dilutes every share."],
    ["partition\\s+by", "The roll7 denominator spans the whole ledger continuously — a partition would restart it and shares would exceed 100 inside short stages."],
  ],
  "l61-p11": [
    ["max\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER prints the all-time record on every row — with ORDER BY created_at the record only ratchets UP as history unfolds."],
    ["sum\\s*\\(|avg\\s*\\(", "The record is a ceiling, not an accumulation — MAX(total) OVER (ORDER BY created_at, id)."],
    ["rows\\s+between\\s+unbounded\\s+following", "The frame must never see the future — UNBOUNDED FOLLOWING leaks later orders into a 'record so far'."],
  ],
  "l61-p14": [
    ["lag\\s*\\(|lead\\s*\\(", "LAG/LEAD step between neighbors — day zero is the region's earliest: FIRST_VALUE(created_at) OVER (PARTITION BY region ORDER BY created_at)."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY region ONE customer's debut stamps the whole store — every region needs its own anchor."],
    ["last_value\\s*\\(", "LAST_VALUE with the default frame returns the CURRENT row — day zero is FIRST_VALUE; reaching for LAST_VALUE means stretching the frame to UNBOUNDED FOLLOWING."],
  ],
  "l61-p20": [
    ["rows\\s+between\\s+6\\s+preceding", "A 7-order frame reads a week of orders — per-customer MA3 is ROWS BETWEEN 2 PRECEDING AND CURRENT ROW."],
    ["over\\s*\\(\\s*order\\s+by", "The average restarts per customer — PARTITION BY customer_id, or early orders average strangers' baskets."],
    ["range\\s+between", "RANGE spans time distance, not row counts — ROWS pins exactly three orders (or fewer at the start)."],
  ],
  "l61-p25": [
    ["count\\s*\\(\\s*\\*\\s*\\)\\s+over\\s*\\(\\s*\\)", "The census must share the frame — COUNT(*) OVER () counts all 103 on every row; carry the same ROWS clause so n_in_frame walks 1, 2, 3, 3…"],
    ["rows\\s+between\\s+1\\s+preceding", "One neighbor each side is the centered frame — the check pins the TRAILING 2 PRECEDING AND CURRENT ROW."],
    ["partition\\s+by", "One continuous line — the frame widths walk 1, 2, then 3 forever; a partition restarts the count."],
  ],
  "l61-p26": [
    ["max\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER puts the all-time record on every row — the gap must CLOSE over time: ORDER BY created_at with UNBOUNDED PRECEDING."],
    ["total\\s*-\\s*max\\s*\\(", "Mind the sign — below_record = record − total (how far UNDER the running best), not the other way."],
    ["group\\s+by", "Every order keeps its row — GROUP BY would erase the per-order gap."],
  ],
  "l61-p27": [
    ["rows\\s+between\\s+current\\s+row\\s+and\\s+unbounded\\s+following", "Summing what REMAINS needs a reversed SORT, not a forward frame — ORDER BY created_at DESC with UNBOUNDED PRECEDING walks from the end."],
    ["order\\s+by\\s+created_at\\s*,\\s*id\\s+rows", "Ascending sums everything BEFORE each order — the brief wants what REMAINS: sort DESC and the running sum starts at the end."],
    ["partition\\s+by", "One continuous unwind of the whole store — no stages."],
  ],
  "l61-p30": [
    ["^(?!.*range\\s+between)", "The whole point is the SIDE BY SIDE — rows7 (ROWS, exactly 7 delivered days) against range7 (RANGE, 6 calendar days back); ship both columns."],
    ["substr\\s*\\(\\s*created_at\\s*,\\s*1\\s*,\\s*7\\s*\\)", "Days, not months — the trap lives in the calendar: fold to SUBSTR(created_at, 1, 10) so gaps between order days are visible."],
    ["partition\\s+by", "One continuous day line — the frames must be able to span sparse gaps; a partition would break at each boundary."],
  ],
  "l61-p32": [
    ["rows\\s+between\\s+(unbounded\\s+preceding|[1-6]\\s+preceding)", "Any wider frame sums the neighbors too — the 'frame of one' is CURRENT ROW AND CURRENT ROW: the order's own total, proving frames can shrink to a point."],
    ["sum\\s*\\(\\s*total\\s*\\)(?!\\s+over)", "Bare SUM(total) is a grouped aggregate and errors without GROUP BY — keep the window, shrink the frame: ROWS BETWEEN CURRENT ROW AND CURRENT ROW."],
    ["partition\\s+by", "No staging — one line through the ledger; the exercise is the frame, not the partition."],
  ],
  "l61-p34": [
    ["rows\\s+between\\s+unbounded", "UNBOUNDED counts everything so far — the frame is exactly 6 PRECEDING AND CURRENT ROW, so the census walks 1, 2, 3, 4, 5, 6, 6, 6…"],
    ["count\\s*\\(\\s*distinct", "COUNT(DISTINCT …) would dedupe — the census counts ROWS in the frame: COUNT(*)."],
    ["partition\\s+by", "The census rides the full chronological line — restart points would print 1 again mid-stream."],
  ],
  "l61-p35": [
    ["^(?!.*first_value)", "The pair needs both bookends — FIRST_VALUE for the debut, LAST_VALUE for the latest, over the same customer stage."],
    ["last_value\\s*\\(\\s*total\\s*\\)\\s*over\\s*\\(\\s*partition\\s+by\\s+customer_id\\s+order\\s+by\\s+created_at\\s*,\\s*id\\s*\\)", "LAST_VALUE with the default frame stops at the CURRENT row — stretch it: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING."],
    ["min\\s*\\(\\s*total\\s*\\)\\s*over|max\\s*\\(\\s*total\\s*\\)\\s*over", "MIN/MAX find extremes, not bookends — the first and LATEST totals can both be middling; FIRST_VALUE/LAST_VALUE walk the timeline."],
  ],
  "l61-p36": [
    ["avg\\s*\\(|percentile|median\\s*\\(", "This engine has no MEDIAN() — fold order counts with windows, then flag the middle position: pos = (n + 1) / 2 when n is odd."],
    ["n\\s*%\\s*2\\s*=\\s*0", "Even months have no single middle order — the flag only fires when n % 2 = 1; flipping the parity flags two rows or none."],
    ["partition\\s+by\\s+month\\b", "Partition by the month SLICE — SUBSTR(created_at, 1, 7) — not a raw column; the position and count must share one stage per month."],
  ],
  "l61-p37": [
    ["^(?!.*max\\s*\\(\\s*total)", "The second column is the frame's CEILING — MAX(total) over the same 6 PRECEDING AND CURRENT ROW, not another SUM."],
    ["range\\s+between\\s+6", "RANGE reaches 6 timestamp-units back — with 84 sparse order days the frame miscounts; ROWS is exactly 7 rows."],
    ["partition\\s+by", "One continuous walk — the rolling frame may span months; stages would reset it."],
  ],
  "l61-p39": [
    ["over\\s*\\(\\s*\\)", "The benchmark is the 7-order frame, not the store — an empty OVER compares every order to one global mean."],
    ["avg\\s*\\(\\s*total\\s*\\)\\s*over\\s*\\([^)]*\\)\\s*-\\s*total", "Mind the sign — the ask is total MINUS the frame average (positive = above the local trend)."],
    ["partition\\s+by", "The frame glides across the whole ledger — per-customer stages would shrink early frames differently."],
  ],
  "l61-p40": [
    ["^(?!.*first_value)", "Both bookends, one query — FIRST_VALUE(price) for the cheapest seat and LAST_VALUE(price) for the priciest over the same category stage."],
    ["last_value\\s*\\(\\s*price\\s*\\)\\s*over\\s*\\(\\s*partition\\s+by\\s+category\\s+order\\s+by\\s+price\\s*,\\s*id\\s*\\)", "LAST_VALUE with the default frame stops at the CURRENT row — stretch it: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING."],
    ["min\\s*\\(\\s*price|max\\s*\\(\\s*price", "MIN/MAX over the partition can match the numbers here, but the muscle this drill builds is the bookend pair with a full frame — keep FIRST_VALUE/LAST_VALUE."],
  ],
  "l61-p41": [
    ["count\\s*\\(\\s*\\*\\s*\\)\\s+over\\s*\\(\\s*\\)", "COUNT(*) OVER () is 103 everywhere — share the ROWS frame with the sum so the census walks 1..6 then 7."],
    ["^(?!.*count\\s*\\(\\s*\\*\\s*\\)\\s*over)", "Two columns, one frame — the rolling SUM plus COUNT(*) over the same 6 PRECEDING AND CURRENT ROW."],
    ["range\\s+between", "RANGE spans timestamp distance — ROWS pins exactly seven orders."],
  ],
  "l61-p43": [
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id one store-wide record — each customer's ceiling must ratchet within their own history."],
    ["max\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER stamps the global best on every row — ORDER BY created_at makes the record grow as their story unfolds."],
    ["group\\s+by", "GROUP BY collapses to one row per customer — the record-so-far rides on every order."],
  ],
  "l61-p45": [
    ["^(?!.*rows\\s+between\\s+6)", "Two frames, one query — roll3 on ROWS BETWEEN 2 PRECEDING AND CURRENT ROW, roll7 on 6 PRECEDING; both windows share the rn sort."],
    ["range\\s+between", "RANGE spans timestamp distance — ROWS pins exact row counts; the two speeds must be comparable."],
    ["partition\\s+by", "Both rollers ride the same continuous line — a partition would desync the speeds."],
  ],
  "l61-p47": [
    ["^(?!.*\\bwhere\\b)", "The census counts DELIVERED orders only — gate with WHERE status = 'delivered' before the windows run."],
    ["rows\\s+between\\s+unbounded\\s+preceding\\s+and\\s+current", "A PRECEDING-only frame makes the census grow down the ledger — the brief wants the SAME three numbers on every row: UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING."],
    ["over\\s*\\(\\s*\\)", "An empty OVER matches the numbers here but skips the mechanism — the explicit full frame is what makes n_d, rev_d, avg_d constants with intent."],
  ],
  "l61-p49": [
    ["^(?!.*rows\\s+between\\s+6)", "Three windows, three widths — 2, 4 and 6 PRECEDING AND CURRENT ROW; every smoother shares the rn sort."],
    ["1\\s+preceding[\\s\\S]*3\\s+preceding|and\\s+1\\s+following", "Centered frames peek ahead — the ladder is trailing-only: 2/4/6 PRECEDING AND CURRENT ROW."],
    ["range\\s+between", "RANGE spans timestamp distance — ROWS pins the row counts that make ma3/ma5/ma7 comparable."],
  ],

  // ---- Lesson 62 — Windows VIII: tiles & shares ----
  "l62-p3": [
    ["ntile\\s*\\(\\s*2\\s*\\)", "NTILE(2) splits halves — quartiles need NTILE(4), then q IN (2, 3) is the middle fifty."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*asc", "Ascending packs the big spenders into tile 4 — sort spend DESC so tile 1 is the top quartile."],
    ["percent_rank|cume_dist", "Percentage functions don't bucket — NTILE(4) deals the 16 customers into four near-equal tiles."],
  ],
  "l62-p5": [
    ["ntile\\s*\\(\\s*[24]\\s*\\)", "Quartiles are too coarse — a decile is NTILE(10), and only dec = 1 sums into the answer."],
    ["order\\s+by\\s+total\\s+asc", "Ascending puts the whales in tile 10 — sort total DESC so decile 1 is the top ten percent."],
    ["limit\\s+10\\b", "LIMIT 10 takes ten ORDERS, not a tenth of the population — NTILE(10) deals 103 orders into tiles of 11/10/10… then dec = 1."],
  ],
  "l62-p7": [
    ["cume_dist\\s*\\(", "CUME_DIST counts the row AND its peers (the leader reads 1.0) — PERCENT_RANK gives the fraction strictly below: (rank − 1)/(n − 1)."],
    ["\\brank\\s*\\(", "RANK returns integers — the station wants the 0…1 percentile read: PERCENT_RANK()."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*desc", "DESC flips the scale (the leader would read 0) — the percentile convention sorts ascending; the report reads it backwards outside."],
  ],
  "l62-p8": [
    ["percent_rank\\s*\\(", "PERCENT_RANK leaves the leader at 0 — the standing wants share-of-field: CUME_DIST, topping out at 1.0."],
    ["\\brank\\s*\\(", "RANK prints rungs, not fractions — CUME_DIST() OVER (ORDER BY SUM(o.total))."],
    ["partition\\s+by", "One field of 16 customers — a partition would hand every region its own 1.0."],
  ],
  "l62-p11": [
    ["sum\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*partition", "The denominator is ALL regions — SUM(rev) OVER (); partitioning would divide each region by itself (100% everywhere)."],
    ["\\brank\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER ranks nothing — the ladder needs ORDER BY rev DESC."],
    ["group\\s+by\\s+c\\.name\\b", "Grouping by name strands same-name customers — GROUP BY c.region pools the four regions."],
  ],
  "l62-p12": [
    ["partition\\s+by\\s+category", "Dividing each category by ITSELF is always 100% — the denominator is the whole catalog: SUM(rev) OVER ()."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "The slice is of REVENUE — SUM(quantity × unit_price), not an order census."],
    ["order\\s+by\\s+category", "Alphabetical buries the heavy shelves — the brief reads biggest slice first: ORDER BY rev DESC."],
  ],
  "l62-p13": [
    ["sum\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER divides by the whole CATALOG — the share is within the shelf: SUM(rev) OVER (PARTITION BY category)."],
    ["partition\\s+by\\s+p\\.id\\b", "Partitioning by product stages singletons — the stage is the category."],
    ["group\\s+by\\s+category", "GROUP BY category folds the products away — every product keeps its row with its own slice."],
  ],
  "l62-p14": [
    ["partition\\s+by\\s+status", "Each status over itself reads 100% — the denominator spans all four: SUM(rev) OVER ()."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "The slice is dollars, not orders — SUM(total), not COUNT(*)."],
    ["order\\s+by\\s+status", "Alphabetical scatters the story — biggest slice first: ORDER BY rev DESC."],
  ],
  "l62-p16": [
    ["ntile|percentile", "Tiles can't find the CUMULATIVE line — run the revenue descending, accumulate with SUM(total) OVER (ORDER BY total DESC, id), and take the first rn where 100.0 * run / grand >= 80."],
    ["order\\s+by\\s+total\\s*(asc\\s*)?,", "Accumulate from the BIGGEST order down — ORDER BY total DESC, id; ascending reaches 80% only at the very end."],
    ["avg\\s*\\(", "The line is a running-sum crossing, not an average — SUM(total) OVER (ORDER BY total DESC, id) walks until it crosses 80%."],
  ],
  "l62-p17": [
    ["partition\\s+by", "The share divides by ALL customer spend — SUM(spend) OVER (); a partition would make each slice its own 100%."],
    ["limit\\s+4\\b", "LIMIT 4 truncates BEFORE the grand total is computed — rank with RANK(), keep rk <= 4, and divide by the windowed grand."],
    ["ntile\\s*\\(", "Tiles are positional, not ranked — RANK() on spend DESC picks the true top four."],
  ],
  "l62-p18": [
    ["ntile\\s*\\(\\s*4\\s*\\)", "Halves, not quartiles — NTILE(2) per region, so t is 1 or 2."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY region the half-line falls wherever the 16 customers split — every region needs its own deal."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*asc", "Ascending hands tile 1 to the lightest spenders — sort DESC so tile 1 is the region's heavy half."],
  ],
  "l62-p20": [
    ["where\\s+q\\s*=\\s*1", "One row per TILE, not just the top — GROUP BY q after NTILE(4) profiles all four."],
    ["ntile\\s*\\(\\s*2\\s*\\)", "Halves flatten the profile — the brief deals QUARTILES: NTILE(4) over spend DESC, then one row per q."],
    ["partition\\s+by\\s+q", "Partition AFTER the deal is done — NTILE(4) OVER (ORDER BY spend DESC) first, then GROUP BY q in the next layer."],
  ],
  "l62-p21": [
    ["ntile\\s*\\(\\s*[210]+\\s*\\)", "The deal is quartiles — NTILE(4) over 16 customers makes four tiles of 4."],
    ["count\\s*\\(\\s*distinct\\s+q\\s*\\)", "COUNT(DISTINCT q) is 1 by construction — the census is rows per tile: COUNT(*)."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*asc", "Tile 1 must be the top spenders — ORDER BY SUM(o.total) DESC."],
  ],
  "l62-p22": [
    ["avg\\s*\\(\\s*spend\\s*\\)\\s+over", "AVG(spend) OVER (PARTITION BY q) stamps means back onto customers — fold per tile (GROUP BY q), then subtract q4's mean from q1's."],
    ["abs\\s*\\(", "The spread has a direction — top tile minus bottom tile; ABS hides which end leads."],
    ["ntile\\s*\\(\\s*2\\s*\\)", "Halves lose the quartile contrast — NTILE(4), means per q, then q1 − q4."],
  ],
  "l62-p23": [
    ["ntile\\s*\\(\\s*4\\s*\\)\\s+over\\s*\\(\\s*order\\s+by\\s+sum", "The deal is on ORDER COUNTS — NTILE(4) OVER (ORDER BY COUNT(*) DESC), not spend."],
    ["sum\\s*\\(\\s*o\\.total\\s*\\)\\s+over", "Spend and frequency disagree — this board tiles by COUNT(*)."],
    ["partition\\s+by", "One store-wide deal — regional stages would crown four tile-1 groups."],
  ],
  "l62-p24": [
    ["cume_dist\\s*\\(", "CUME_DIST tops at 1.0 counting the row itself — PERCENT_RANK leaves the minimum at 0.0; with no tied totals the ladder is clean."],
    ["\\brank\\s*\\(", "RANK prints integer rungs — the percentile wants the 0…1 read: PERCENT_RANK()."],
    ["order\\s+by\\s+total\\s+desc\\s*\\)", "The percentile convention sorts ascending inside OVER — the report flips the reading with ORDER BY pr DESC outside."],
  ],
  "l62-p25": [
    ["cume_dist\\s*\\(", "CUME_DIST hands the weakest month 1/14 — PERCENT_RANK pins it at 0.0; the question is 'how much field sits below'."],
    ["\\brank\\s*\\(", "RANK returns rungs — the brief wants the 0…1 percentile."],
    ["partition\\s+by", "One league of 14 months — a partition would restart the scale."],
  ],
  "l62-p26": [
    ["sum\\s*\\(\\s*line_rev\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER divides by the whole ledger — the denominator is the BASKET: SUM(line_rev) OVER (PARTITION BY order_id)."],
    ["partition\\s+by\\s+product_id", "The stage is the order, not the product — each basket divides its own lines."],
    ["group\\s+by\\s+order_id", "GROUP BY folds the lines away — every line keeps its row with its slice."],
  ],
  "l62-p27": [
    ["count\\s*\\(\\s*\\*\\s*\\)", "Catalog share is by VALUE — SUM(p.price), not shelf count."],
    ["partition\\s+by\\s+supplier_id", "Each supplier over itself is 100% — the denominator spans the whole catalog."],
    ["avg\\s*\\(\\s*p\\.price", "Averages ignore breadth — the share weights by summed value: SUM(p.price)."],
  ],
  "l62-p28": [
    ["where[\\s\\S]*2025", "The run covers 2024 — filter SUBSTR(created_at, 1, 4) = '2024' so the climb spans the right twelve months."],
    ["partition\\s+by", "One continuous 2024 line — the cumulative share climbs toward 100 by December."],
    ["group\\s+by\\s+year", "Grouping by year yields one row — fold by MONTH (SUBSTR(created_at, 1, 7)) so the climb has 12 steps."],
  ],
  "l62-p29": [
    ["ntile\\s*\\(\\s*4\\s*\\)", "Four tiles squeeze 14 months unevenly — the brief deals THREES: NTILE(3) → 5/5/4."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*asc", "Tile 1 is the heaviest third — sort revenue DESC."],
    ["percent_rank|cume_dist", "Percentiles don't bucket — NTILE(3) assigns whole tiles."],
  ],
  "l62-p30": [
    ["ntile\\s*\\(\\s*4\\s*\\)", "Deciles — NTILE(10); 16 customers deal into tiles of 2/2/2/2/2/2/1/1/1/1."],
    ["percent_rank", "Percentiles score position — the brief deals concrete tiles: NTILE(10)."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*asc", "Ascending puts the biggest spenders in tile 10 — sort DESC so d = 1 is the top."],
  ],
  "l62-p31": [
    ["cume_dist\\s*\\(", "The station here is PERCENT_RANK over the ascending totals — CUME_DIST would count the row itself."],
    ["from\\s+orders\\s+where\\s+id\\s*=\\s*74", "Filtering WHERE id = 74 BEFORE the window leaves one row — the rank needs the whole field; compute over all 103 orders, then pick 74 in an outer layer."],
    ["\\brank\\s*\\(", "RANK returns a rung, not a fraction — PERCENT_RANK()."],
  ],
  "l62-p32": [
    ["percent_rank\\s*\\(", "The median gate rides CUME_DIST — cd > 0.5 means strictly more than half the field sits at or below; PERCENT_RANK reads share-below instead."],
    [">=\\s*0\\.5", ">= 0.5 sweeps the median row itself into 'above' — the flag is strict: cd > 0.5."],
    ["median\\s*\\(|avg\\s*\\(", "Averaging totals finds the mean, not the median line — the flag compares each customer's cumulative standing."],
  ],
  "l62-p33": [
    ["where\\s+spend\\s*>=", "WHERE evicts the small spenders — every customer keeps their row, flagged 1/0 by the CASE."],
    ["case\\s+when\\s+t\\s*<=?\\s*2", "The gate is on DOLLARS (spend >= 3000), not tile position — tiles rank, the threshold checks the amount."],
    ["ntile\\s*\\(\\s*2\\s*\\)", "Halves hide the top-vs-bottom contrast — quartiles: NTILE(4) over spend DESC, then flag by the DOLLAR threshold."],
  ],
  "l62-p34": [
    ["ntile\\s*\\(\\s*4\\s*\\)\\s+over\\s*\\(\\s*order\\s+by\\s+sum", "The deal is on TRAFFIC — ORDER BY COUNT(*) DESC, not revenue."],
    ["sum\\s*\\(\\s*total\\s*\\)", "This census counts orders — SUM(total) is a different board."],
    ["partition\\s+by", "One deal across the 14 months — yearly stages would re-deal."],
  ],
  "l62-p36": [
    ["sum\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "The denominator is the STATUS pile — SUM(total) OVER (PARTITION BY status), not the store grand."],
    ["group\\s+by\\s+status", "GROUP BY folds to four rows — every order keeps its row with its slice of its status."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "Share of DOLLARS — SUM(total) over the status stage."],
  ],
  "l62-p37": [
    ["join\\s+orders", "An inner join evicts customers with zero orders — start from customers and COALESCE the spend to 0 so the regional denominator is complete."],
    ["partition\\s+by\\s+region\\s+order\\s+by\\s+name", "The walk follows each region's timeline — ORDER BY created_at, not name; the cumulative share reads like a marathon split."],
    ["sum\\s*\\(\\s*spend\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER divides by the store-wide total — the denominator is the REGION: SUM(spend) OVER (PARTITION BY region)."],
  ],
  "l62-p39": [
    ["\\brank\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER ladders all 103 orders together — each customer ranks their OWN baskets: RANK() OVER (PARTITION BY customer_id ORDER BY pct DESC)."],
    ["row_number\\s*\\(", "ROW_NUMBER breaks ties arbitrarily — RANK lets equal shares share a rung (a customer's biggest two could tie)."],
    ["group\\s+by", "Every order keeps its row — the share stamps first, the ladder ranks the stamps."],
  ],
  "l62-p40": [
    ["ntile\\s*\\([^)]*\\)[\\s\\S]*ntile\\s*\\([^)]*\\)[\\s\\S]*ntile\\s*\\(", "Two deals, not three — t_spend on SUM(total) DESC and t_count on COUNT(*) DESC."],
    ["^(?!.*ntile\\s*\\(\\s*4\\s*\\)\\s+over\\s*\\(\\s*order\\s+by\\s+count)", "The second tile rides FREQUENCY — NTILE(4) OVER (ORDER BY COUNT(*) DESC) beside the spend tile."],
    ["partition\\s+by", "Both deals run store-wide — regional stages would re-deal each region."],
  ],
  "l62-p41": [
    ["where\\s+t_spend\\s*<>\\s*t_count", "Any disagreement passes <>' — the brief wants a WIDE gap: ABS(t_spend − t_count) >= 2."],
    ["abs\\s*\\(\\s*t_spend\\s*-\\s*t_count\\s*\\)\\s*=\\s*2", "= 2 misses the wider splits — the watch is >= 2."],
    ["ntile\\s*\\(\\s*2\\s*\\)", "Quartiles on both axes — NTILE(4) twice."],
  ],
  "l62-p42": [
    ["avg\\s*\\(\\s*total\\s*\\)\\s+as\\s+median\\s+from\\s+orders", "The MEAN bows to whales — the median is the 52nd of 103 ordered totals: ROW_NUMBER() ascending, rn = (103 + 1) / 2."],
    ["rn\\s+in\\s*\\(\\s*51\\s*,\\s*52\\s*\\)|rn\\s+between\\s+51\\s+and\\s+52", "103 orders is ODD — one middle row, rn = (103 + 1) / 2 = 52; the two-row even recipe averages the wrong pair."],
    ["order\\s+by\\s+total\\s+desc", "Descending counts from the whale — the median sits at position 52 of the ASCENDING totals."],
  ],
  "l62-p43": [
    ["avg\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*partition", "AVG OVER the stage is the MEAN — the median needs the middle ROW(S): ROW_NUMBER + COUNT per customer, then rn IN ((n+1)/2, (n+2)/2)."],
    ["rn\\s*=\\s*\\(\\s*n\\s*\\+\\s*1\\s*\\)\\s*/\\s*2", "Odd counts pick one row ((n+1)/2); even counts need the PAIR — (n+2)/2 joins it, then AVG folds the two."],
    ["partition\\s+by\\s+name", "Partition by customer_id (the key) — names can collide and the stage must be airtight."],
  ],
  "l62-p44": [
    ["avg\\s*\\(", "Means hide the edges — the checker wants MIN and MAX spend per tile."],
    ["where\\s+t\\s*=\\s*1", "All four tiles report — GROUP BY t, no filter; the split is even when the edges line up."],
    ["ntile\\s*\\(\\s*10\\s*\\)", "Deciles slice too thin — the checker deals QUARTILES: NTILE(4) over spend DESC, then MIN/MAX per tile."],
  ],
  "l62-p45": [
    ["^(?!.*\\bwhere\\b)", "The pie is DELIVERED revenue — WHERE status = 'delivered' shrinks both the numerator AND the denominator."],
    ["partition\\s+by\\s+status", "Inside the delivered set there is one pie — partitioning by status divides each order by its own pile."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "Share of DOLLARS, not orders — SUM(total) OVER () as the denominator of the delivered pie."],
  ],
  "l62-p46": [
    ["ntile\\s*\\(", "Tiles label position; the flag wants a FRACTION — CUME_DIST() OVER (ORDER BY SUM(o.total)) with cd >= 0.75."],
    [">\\s*0\\.75", "The top quartile INCLUDES its edge — cd >= 0.75; strict > would drop the boundary customer."],
    ["percent_rank\\s*\\(", "PERCENT_RANK's scale starts at 0 — CUME_DIST reads cumulative share, the natural quartile line."],
  ],
  "l62-p47": [
    ["over\\s*\\(\\s*\\)", "The denominator is the customer's LIFETIME total — SUM(total) OVER (PARTITION BY customer_id); the empty OVER would divide by the store."],
    ["order\\s+by\\s+created_at\\s+desc", "The walk goes forward — ORDER BY created_at, id; reversed, the share counts down from 100."],
    ["partition\\s+by\\s+created_at|partition\\s+by\\s+month", "The stage is the customer — every walk restarts at their first order."],
  ],
  "l62-p48": [
    ["ntile|percentile", "No tile lands exactly on the 50% line — accumulate DESC and take the first rn where 100.0 * run / grand >= 50."],
    ["order\\s+by\\s+total\\s*(asc\\s*)?,", "The deepest few orders carry the half — accumulate from the BIGGEST down (ORDER BY total DESC, id)."],
    ["avg\\s*\\(", "The crossing point is a running-sum event, not an average — SUM(total) OVER (ORDER BY total DESC, id)."],
  ],
  "l62-p49": [
    ["partition\\s+by\\s+region", "Each region over itself is 100% — SUM(rev) OVER () is the whole pie."],
    ["count\\s*\\(\\s*\\*\\s*\\)", "Pie slices are DOLLARS, not footfall — SUM(o.total) folded per region, divided by the store grand."],
    ["group\\s+by\\s+c\\.name\\b", "Names strand same-name customers — GROUP BY c.region pools the slices."],
  ],
  "l62-p50": [
    ["ntile\\s*\\(\\s*4\\s*\\)", "Threes — NTILE(3) deals the categories heavy/middle/light."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*asc", "Tile 1 is the heaviest shelf — sort revenue DESC."],
    ["percent_rank", "Percentiles score positions — the census deals whole tiles: NTILE(3)."],
  ],
  "l62-p51": [
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY region one store-wide scale — each region reads against its own field."],
    ["cume_dist\\s*\\(", "The standing is PERCENT_RANK — (rank − 1)/(n − 1) within the region; CUME_DIST would count the row itself."],
    ["order\\s+by\\s+sum[^)]*\\)\\s*desc\\s*\\)", "The convention sorts ascending inside OVER — the report flips the read outside (ORDER BY region, pr DESC)."],
  ],
  "l62-p52": [
    ["percent_rank\\s*\\(", "PERCENT_RANK starts at 0 — the whale watch reads cumulative share: CUME_DIST >= 0.95."],
    [">\\s*0\\.95", "The 95th percentile INCLUDES the boundary — cd >= 0.95."],
    ["ntile\\s*\\(", "A 20-tile deal makes whales 'tile 1' but hides the fraction — CUME_DIST states it outright."],
  ],
  "l62-p53": [
    ["^(?!.*percent_rank)", "Three lenses, one row — NTILE(4) for the segment letter, PERCENT_RANK for share-below, CUME_DIST for share-at-or-below."],
    ["^(?!.*cume_dist)", "The third column is CUME_DIST — the share of the field at or below each customer."],
    ["partition\\s+by", "One store-wide segmentation — regional stages would hand out four sets of A–D."],
  ],

  // ---- Lesson 63 — Windows IX: pattern workshop (gaps & islands, sessionization) ----
  "l63-p3": [
    ["gap\\s*<\\s*30\\s+then\\s+1|<\\s*30\\s*\\)\\s+then\\s+1", "ns marks the START of a session — a gap under 30 days CONTINUES one (0); the running SUM only climbs on a 1."],
    ["count\\s*\\(\\s*\\*\\s*\\)\\s+as\\s+n_sessions|count\\s*\\(\\s*session_no\\s*\\)", "COUNT(*) counts ORDERS — sessions are DISTINCT session_no values per customer."],
    ["sum\\s*\\(\\s*ns\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER runs one store-wide session counter — the walk restarts per customer: PARTITION BY customer_id ORDER BY created_at."],
  ],
  "l63-p4": [
    ["then\\s+1\\s+else\\s+0\\s+end\\s+as\\s+brk", "brk marks a BREAK — a consecutive day (gap <= 1) keeps the island alive (0); flipping the flag makes every day its own island and the max streak nonsense."],
    ["select\\s+customer_id\\s*,\\s*island\\s*,\\s*len\\s+from", "The answer is one row PER CUSTOMER — fold islands to lengths (GROUP BY customer, island), then MAX(len) grouped by customer alone."],
    ["lag\\s*\\(\\s*created_at", "The streak runs on DISTINCT DAYS — LAG(created_at) over raw orders chains same-day repeats and never breaks; dedupe to one row per day first."],
  ],
  "l63-p9": [
    ["partition\\s+by\\s+month\\b", "Partitioning by the full 'YYYY-MM' stage singletons — the FAMILY is the calendar month: SUBSTR(created_at, 6, 2), so Jan-2024 chains to Jan-2025."],
    ["lag\\s*\\(\\s*rev\\s*\\)", "LAG must wrap the AGGREGATE — LAG(SUM(total)) OVER (…) — an alias from the same SELECT isn't visible to its own window."],
    ["order\\s+by\\s+month\\s+desc", "Families read chronologically — ORDER BY the 'YYYY-MM' key ascending inside each family."],
  ],
  "l63-p10": [
    ["^(?!.*rows\\s+between\\s+2\\s+preceding)", "roll3 needs its frame — AVG(rev) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW); a bare ORDER BY would let future peers in (RANGE default)."],
    ["sum\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*order\\s+by\\s+month\\s*\\)", "The share divides by the WHOLE year — SUM(rev) OVER (); an ordered window would shrink the denominator to the running total."],
    ["partition\\s+by", "One 14-month line feeds every lens — a partition would NULL the first deltas and re-deal the ranks."],
  ],
  "l63-p11": [
    ["lead\\s*\\(", "LEAD watches where they go NEXT — the restart compares each order to the one BEFORE: LAG(status)."],
    ["where\\s+status\\s*=\\s*'pending'", "Pending alone catches every pending order — the detector needs the PAIR: prev_status = 'delivered' AND status = 'pending'."],
    ["over\\s*\\(\\s*order\\s+by", "Statuses hop between customers without the stage — PARTITION BY customer_id chains each buyer's own timeline."],
  ],
  "l63-p13": [
    ["count\\s*\\(\\s*distinct\\s+created_at\\s*\\)", "Same-day orders collapse under DISTINCT created_at — the ask is distinct MONTHS: COUNT(DISTINCT SUBSTR(created_at, 1, 7))."],
    ["row_number|over\\s*\\(", "No windows needed — the fact sheet is pure folding: COUNT, SUM, MIN and MAX with GROUP BY customer_id."],
    ["substr\\s*\\(\\s*min\\s*\\(", "first_at and latest_at print FULL timestamps — slice nothing; SUBSTR would round the story to months."],
  ],
  "l63-p14": [
    ["partition\\s+by\\s+month\\b", "The stage is the QUARTER key ('2024-Q1' style) — partitioning by month deals singletons."],
    ["\\brank\\s*\\(|\\bdense_rank\\s*\\(", "RANK shares the crown on ties — ROW_NUMBER plus the month tiebreak keeps exactly one winner per quarter."],
    ["max\\s*\\(\\s*sum\\s*\\(\\s*total\\s*\\)\\s*\\)", "MAX(SUM(total)) finds the amount but strands the month name — number the months and keep rn = 1."],
  ],
  "l63-p15": [
    ["range\\s+between\\s+6", "RANGE reaches 6 timestamp-units back — ROWS BETWEEN 6 PRECEDING AND CURRENT ROW is exactly 7 orders."],
    ["^(?!.*rows\\s+between\\s+6\\s+preceding)", "The rolling week needs its frame — SUM(total) OVER (ORDER BY rn ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)."],
    ["order\\s+by\\s+ws\\s+asc", "Ascending hands the answer to the LIGHTEST week — ORDER BY ws DESC, rn, LIMIT 1."],
  ],
  "l63-p16": [
    ["count\\s*\\(\\s*distinct\\s+customer_id\\s*\\)", "New buyers are FIRST-TIME orders — flag LAG(created_at) IS NULL per customer, then SUM per month; COUNT(DISTINCT) counts everyone."],
    ["join\\s+customers", "The debut flag lives on orders — joining customers adds nothing; LAG over PARTITION BY customer_id finds each first order."],
    ["lag\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*partition\\s+by\\s+customer_id", "The delta is month-over-month REVENUE — LAG(m.rev) OVER (ORDER BY m.month) after the monthly fold; the customer stage only builds new_buyers."],
  ],
  "l63-p17": [
    [">=\\s*2500", "Quiet means UNDER 2500 — filtering rev >= 2500 islands the loud months and the runs invert."],
    ["month\\s*-\\s*row_number|substr[^)]*\\)\\s*-\\s*row_number", "Islands need a NUMBER — row_number the quiet months (mno), then mno − ROW_NUMBER() is constant inside a run; 'YYYY-MM' minus an integer is nonsense."],
    ["partition\\s+by", "The island key spans the whole quiet subset — one ORDER BY mno line, no partitions."],
  ],
  "l63-p19": [
    ["where\\s+gap\\s*<\\s*60", "Filtering rows BEFORE the fold keeps each customer's short gaps and drops their long ones — compute MAX(gap) per customer first, then WHERE max_gap < 60."],
    ["avg\\s*\\(\\s*gap\\s*\\)", "The average hides the one long silence — the never-gapper test is on the WORST gap: MAX(gap) < 60."],
    ["max_gap\\s*>=?\\s*60", "The watch keeps gap < 60 — >= 60 lists the SLEEPERS, the exact opposite roster."],
  ],
  "l63-p20": [
    ["partition\\s+by", "The snowball must reach the grand total in ONE walk — PARTITION BY customer_id restarts it 16 times and the final row falls short."],
    ["^(?!.*over\\s*\\(\\s*\\))", "The convergence check needs BOTH sums — the ordered running total and SUM(total) OVER (); keep the pair of windows in one pass."],
    ["order\\s+by\\s+rn\\s+desc", "The last row carries the check — rn = (SELECT MAX(rn) FROM n) picks it without betting on a literal 103."],
  ],
  "l63-p21": [
    ["partition\\s+by\\s+status", "The shares and ranks live INSIDE each month — SUM(n) OVER (PARTITION BY month); by status, every status divides by itself."],
    ["\\brank\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*partition\\s+by\\s+status", "Ranks run per month too — PARTITION BY month ORDER BY n DESC crowns each month's dominant status."],
    ["group\\s+by\\s+month\\s*$", "Folding by month alone merges the four statuses — GROUP BY month, status keeps the contest honest."],
  ],
  "l63-p22": [
    ["sum\\s*\\(\\s*oi\\.quantity\\s*\\)\\s+over\\s*\\(\\s*\\)", "The denominator is the MONTH's units — SUM(SUM(oi.quantity)) OVER (PARTITION BY month); the empty OVER divides by the whole ledger."],
    ["where\\s+rn\\s*=\\s*1[\\s\\S]*group\\s+by", "Filter rn in the layer ABOVE the numbering — WHERE rn = 1 beside GROUP BY is a chicken-and-egg error."],
    ["partition\\s+by\\s+p\\.id\\b", "The contest is per MONTH — partition by the month slice so every month crowns its own product."],
  ],
  "l63-p23": [
    ["avg\\s*\\(\\s*(l\\.)?total\\s*\\)\\s+over", "AVG OVER the region stamps every row — the brief wants ONE row per region: filter rn = 1, then GROUP BY region."],
    ["where\\s+rn\\s*=\\s*1[\\s\\S]*group\\s+by\\s+customer_id", "The dedupe must complete BEFORE the regional fold — rn = 1 inside the CTE, GROUP BY region outside."],
    ["max\\s*\\(\\s*created_at\\s*\\)[^;]*group\\s+by\\s+customer_id", "MAX(created_at) per customer finds the date but strands the basket amount — ROW_NUMBER by created_at DESC keeps the whole latest order."],
  ],
  "l63-p24": [
    ["<=\\s*1", "The pair is EXACTLY one day apart — julianday difference = 1; <= 1 sweeps in same-day double orders (a fractional gap)."],
    ["\\bdistinct\\b", "DISTINCT days would erase same-day repeats — the pairs ride the raw order timeline per customer."],
    ["over\\s*\\(\\s*order\\s+by", "Without PARTITION BY customer_id pairs chain across buyers — each customer's own timeline only."],
  ],
  "l63-p25": [
    ["count\\s*\\(\\s*\\*\\s*\\)\\s+as\\s+rev_ret|sum\\s*\\(\\s*ret\\s*\\)", "ret is a 0/1 flag, not a revenue amount — the returning REVENUE is SUM(total * ret); SUM(ret) counts orders."],
    ["case[\\s\\S]*is\\s+null\\s+then\\s+1", "A NULL previous order is a DEBUT (ret = 0) — returning orders have a previous one (ret = 1); flipping the flag makes returning revenue the new-buyer revenue."],
    ["join[\\s\\S]*customers", "No customer join needed — the flag lives on the order timeline: LAG(created_at) per customer, folded by month."],
  ],
  "l63-p26": [
    ["^(?!.*lag\\s*\\()", "delta needs LAG(total) over the same customer stage as pos — one PARTITION BY customer_id ORDER BY created_at, id feeds all three columns."],
    ["lag\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "LAG without ORDER BY has no 'previous' — the stage needs PARTITION BY customer_id ORDER BY created_at, id."],
    ["sum\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER sums the whole store onto every row — the run accumulates within the customer stage."],
  ],
  "l63-p27": [
    ["partition\\s+by\\s+region", "Dividing each region by itself reads 100% four times — SUM(rev) OVER () is the whole pie."],
    ["\\brank\\s*\\(\\s*\\)\\s+over\\s*\\(\\s*\\)", "An empty OVER ranks nothing — ORDER BY rev DESC crowns the leader."],
    ["dense_rank\\s*\\(", "The standings board uses RANK — DENSE_RANK would compress the gaps if two regions ever tie."],
  ],
  "l63-p29": [
    ["substr\\s*\\(\\s*created_at\\s*,\\s*1\\s*,\\s*7\\s*\\)", "Months make 14 deltas — the brief folds QUARTERS: ('YYYY' || '-Q' || quarter number) then LAG over the quarter key."],
    ["lag\\s*\\(\\s*rev\\s*,\\s*3\\s*\\)", "LAG(rev, 3) over months steps one quarter only when no month is missing — fold to quarters first and LAG(rev) over the quarter order."],
    ["partition\\s+by", "One continuous quarter line 2024-Q1 → 2025-Q2 — a partition would NULL each slice's first delta."],
  ],
  "l63-p31": [
    ["max\\s*\\(\\s*spend", "MAX(spend) finds the amount but not WHO — pick the customer with ORDER BY spend DESC LIMIT 1 in the whale CTE."],
    ["order\\s+by\\s+created_at\\s+desc", "The timeline reads forward — ORDER BY created_at, id so pos 1 is the whale's first order and run climbs to their lifetime spend."],
  ],
  "l63-p32": [
    [">\\s*60", "The watch INCLUDES the 60-day edge — gap >= 60."],
    ["avg\\s*\\(\\s*gap\\s*\\)", "The average dilutes the drama — the wake-ups are individual gaps >= 60, one row each."],
    ["over\\s*\\(\\s*order\\s+by", "Gaps chain within one buyer — PARTITION BY customer_id, else one customer's December chains to a stranger's January."],
  ],
  "l63-p33": [
    ["^(?!.*rows\\s+between\\s+2\\s+preceding)", "ma3 needs its frame — AVG(rev) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."],
    ["count\\s*\\(\\s*\\*\\s*\\)\\s+as\\s+new_b|sum\\s*\\(\\s*case\\s+when\\s+ret\\s*=\\s*0", "new_b counts DEBUTS — SUM(1 - ret) over the flagged orders (ret = 0 on a first order); COUNT(*) counts everyone."],
    ["lag\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*partition\\s+by\\s+customer_id", "delta is month-over-month revenue — LAG(rev) OVER (ORDER BY month) after the fold; the customer stage only builds the returning flag."],
  ],
  "l63-p34": [
    ["%m", "The key must be a WEEK — strftime('%Y-W%W', created_at); '%Y-%m' folds months, and %M is minutes (the classic strftime trap)."],
    ["lag\\s*\\(\\s*rev\\s*,\\s*4\\s*\\)", "LAG(rev, 4) over days approximates nothing — fold to weeks first, then LAG(rev) over the week order."],
    ["partition\\s+by", "One continuous week line — a partition would NULL each slice's first delta."],
  ],
  "l63-p35": [
    ["^(?!.*delivered)", "The runs cover DELIVERED days only — WHERE status = 'delivered' before the day fold."],
    ["month\\b|substr\\s*\\(\\s*created_at\\s*,\\s*1\\s*,\\s*7\\s*\\)", "Days, not months — the islands live on SUBSTR(created_at, 1, 10); month keys merge non-adjacent days."],
    ["partition\\s+by", "The island key spans the whole delivered-day line — one ORDER BY d walk, no partitions."],
  ],
  "l63-p36": [
    ["count\\s*\\(\\s*distinct\\s+sess\\s*\\)", "COUNT(DISTINCT sess) is the session COUNT — the length is orders PER session: COUNT(*) grouped by customer + session, then AVG(len)."],
    [">=?\\s*30\\s+then\\s+0", "ns = 1 OPENS a session (gap >= 30 or first order) — the running SUM climbs on the 1; a 0-start never increments and every order lands in session 0."],
    ["partition\\s+by\\s+sess", "The session counter walks the customer's timeline — PARTITION BY customer_id ORDER BY created_at; partitioning by sess is circular (sess doesn't exist yet)."],
  ],
  "l63-p37": [
    ["^(?!.*rows\\s+between\\s+2\\s+preceding)", "roll3 needs the trailing frame — SUM(total) OVER (PARTITION BY name ORDER BY rn ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) — before MAX finds the best stretch."],
    ["range\\s+between", "RANGE spans timestamp distance — ROWS pins exactly three consecutive ORDERS."],
    ["partition\\s+by\\s+name\\s+order\\s+by\\s+total\\s+desc", "The stretch is three consecutive orders in TIME — order by rn (chronological), not by total; MAX over the rolls finds the peak afterwards."],
  ],
  "l63-p39": [
    ["where\\s+delta\\s*>\\s*0", "WHERE evicts the down months before the count — every delta row stays, flagged 1/0 by the CASE, and SUM does the census."],
    ["lead\\s*\\(", "LEAD measures the NEXT month from this one — delta reads backwards: rev minus LAG(rev) OVER (ORDER BY month)."],
    ["delta\\s*>=\\s*0", "Flat months aren't 'up' — the census counts delta > 0; >= 0 sweeps the plateaus in."],
  ],
  "l63-p40": [
    ["row_number|over\\s*\\(|lag\\s*\\(", "No windows needed — MAX(created_at) per customer with GROUP BY is the whole story, sliced to 7 characters."],
    ["group\\s+by[\\s\\S]*substr\\s*\\(\\s*created_at\\s*,\\s*1\\s*,\\s*7", "Slice AFTER the maximum — MAX(created_at) first, then SUBSTR(..., 1, 7); grouping by the sliced month returns one row per bucket, not their latest."],
    ["min\\s*\\(\\s*(o\\.)?created_at", "MIN finds the debut — the brief wants the LATEST active month: MAX(created_at)."],
  ],
  "l63-p41": [
    ["^(?!.*distinct)", "Same-day orders would chain the walk on repeats — dedupe to one row per day (SELECT DISTINCT SUBSTR(created_at, 1, 10)) before the gap logic."],
    ["=\\s*1\\s+then\\s+1", "brk marks a BREAK: gap <= 1 continues (0), anything wider opens a new island (1) — a THEN 1 on consecutive days shatters every run."],
    ["partition\\s+by", "One store-wide day line — the walk is a single ORDER BY d, no partitions."],
  ],
  "l63-p42": [
    ["row_number\\s*\\(", "ROW_NUMBER breaks ties arbitrarily — RANK lets equal baskets share a rung (the brief's lens #1)."],
    ["ntile\\s*\\(\\s*[210]+\\s*\\)", "The middle lens is quartiles — NTILE(4) over total DESC."],
    ["sum\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*partition", "The share is of the WHOLE store — SUM(total) OVER (); a partition would make every slice 100% of itself."],
  ],
  "l63-p43": [
    ["count\\s*\\(\\s*distinct\\s+customer_id\\s*\\)", "COUNT(DISTINCT customer_id) counts all active buyers — debuts are first orders: LAG(created_at) IS NULL flagged 1, summed per month."],
    ["^(?!.*rows\\s+between\\s+2\\s+preceding)", "roll3 needs the trailing frame — AVG(new_buyers) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)."],
    ["partition\\s+by\\s+month", "The debut flag walks each CUSTOMER's timeline — PARTITION BY customer_id ORDER BY created_at; by month, every order is a debut."],
  ],
  "l63-p44": [
    ["^(?!.*distinct)", "Same-day delivered orders would produce a zero gap — dedupe to DISTINCT days before the LAG walk."],
    ["partition\\s+by\\s+customer_id", "The silences are STORE-WIDE between active days — one ORDER BY d line, no customer stages."],
    ["order\\s+by\\s+gap\\s+asc", "The five LONGEST silences — ORDER BY gap DESC LIMIT 5; ascending surfaces the smallest gaps."],
  ],
  "l63-p45": [
    ["partition\\s+by", "One 14-month climb — a partition restarts the numerator and the walk never reaches 100."],
    ["over\\s*\\(\\s*order[\\s\\S]*\\)\\s*/\\s*sum\\s*\\(\\s*rev\\s*\\)\\s+over\\s*\\(\\s*order", "The denominator is the GRAND total — SUM(rev) OVER (); framing the denominator makes it grow with the walk and the share misbehaves."],
    ["group\\s+by\\s+year", "Fold by MONTH — SUBSTR(created_at, 1, 7) — so the climb has 14 steps, not one jump per year."],
  ],
  "l63-p46": [
    ["min\\s*\\(\\s*created_at\\s*\\)[^;]*group\\s+by\\s+city", "MIN(created_at) yields the timestamp but strands the customer name — ROW_NUMBER by created_at within the city keeps the whole debut row."],
    ["partition\\s+by\\s+customer_id", "The debut is per CITY — PARTITION BY c.city; by customer, every order is a debut."],
    ["from\\s+orders\\s+where\\s+rn", "WHERE rn = 1 at the window's own level is a chicken-and-egg error — wrap the numbering in a CTE and filter above it."],
  ],
  "l63-p47": [
    ["avg\\s*\\(\\s*total\\s*\\)\\s+over\\s*\\(\\s*\\)", "The benchmark is THEIR average — AVG(o.total) OVER (PARTITION BY o.customer_id); the store mean would flatter big spenders."],
    ["where\\s+a\\.total\\s*>\\s*a\\.avg_b|having", "The comparison happens per ROW after the stamp — WHERE at the base level can't see avg_b; compute the window first, then SUM the flag."],
    ["group\\s+by\\s+name", "Group by the customer KEY — names can collide; the census folds a.customer_id."],
  ],
};
