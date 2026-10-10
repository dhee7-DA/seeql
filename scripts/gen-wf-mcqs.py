# Generator for window-functions MCQ banks A (wf-q001..150) and B (wf-q151..300).
# Fields: prompt ||| choice0 ||| choice1 ||| choice2 ||| choice3 ||| answerIdx ||| why ||| difficulty
import json

A_RAW = """
What does an empty OVER () in SUM(total) OVER () do? ||| Sums per group ||| Sums the whole set but keeps every row ||| Errors at parse time ||| Sums the current partition only ||| 1 ||| An empty window sees the entire result set as one partition — the aggregate is computed over everything while every input row survives. ||| easy
Which clause collapses rows the way a window with OVER () does NOT? ||| WHERE ||| GROUP BY ||| ORDER BY ||| LIMIT ||| 1 ||| GROUP BY collapses one row per group; a window keeps every input row and simply paints the aggregate beside it. ||| easy
COUNT(*) OVER () on a 103-row orders table returns… ||| 1 ||| 103 on every row ||| 103 once ||| NULL ||| 1 ||| The windowed count repeats the full-set count on every one of the 103 rows. ||| easy
MAX(total) OVER () - total computes… ||| The row's share of revenue ||| The gap between the row and the maximum ||| The running maximum ||| The average distance ||| 1 ||| MAX over the whole set repeats the peak on every row; subtracting the row's own value leaves the distance below the peak. ||| medium
100.0 * amount / SUM(amount) OVER () computes… ||| Running total ||| The row's percent of the whole set ||| Moving average ||| Percent rank ||| 1 ||| Dividing by the empty-window sum gives each row's share of the grand total; multiplying by 100.0 first avoids integer division. ||| medium
Why write 100.0 instead of 100 in percent-of-total math? ||| Style ||| To force decimal division instead of integer truncation ||| Speed ||| SQLite requires it ||| 1 ||| In SQLite, 100/3 is integer division (3); 100.0/3 keeps the decimals. ||| medium
Which query keeps one row per order while also showing company revenue? ||| GROUP BY with SUM ||| SELECT id, total, SUM(total) OVER () FROM orders ||| DISTINCT with SUM ||| A self-join only ||| 1 ||| The windowed sum paints the grand total beside each order without collapsing anything. ||| easy
MIN(price) OVER () and MAX(price) OVER () together give… ||| The price corridor on every row ||| The average price ||| The median ||| A moving range ||| 0 ||| Both windows see the whole set, so every row carries the cheapest and dearest prices — the corridor. ||| easy
AVG(total) OVER () after WHERE status = 'delivered' averages… ||| All orders ||| Only delivered orders ||| Delivered plus shipped ||| Nothing ||| 1 ||| WHERE runs first, so the window only sees the filtered (delivered) rows. ||| medium
CASE WHEN price > AVG(price) OVER () THEN 'yes' ELSE 'no' END flags… ||| Products above the catalog average ||| Products below average ||| The cheapest product ||| Duplicates ||| 0 ||| The window computes the catalog mean; the CASE compares each row against it in the same SELECT. ||| medium
COUNT(*) FILTER (WHERE active = 1) OVER () counts… ||| All rows ||| Only rows with active = 1 ||| Distinct actives ||| Errors ||| 1 ||| FILTER restricts which rows the aggregate sees — supported on window aggregates in SQLite 3.30+. ||| hard
ROUND(AVG(x) OVER (), 2) differs from AVG(x) OVER () by… ||| Rounding for display ||| Changing the math ||| Nothing ||| Grouping ||| 0 ||| ROUND only dresses the output; the underlying average is identical. ||| easy
SUM(total) OVER () with WHERE status = 'cancelled' sums… ||| All order totals ||| Only cancelled totals ||| Delivered totals ||| Zero ||| 1 ||| The WHERE gates the rows first; the window aggregates exactly the cancelled set. ||| easy
Which is TRUE of window aggregates vs GROUP BY aggregates? ||| Windows remove duplicates ||| Windows keep every input row ||| Windows are always faster ||| GROUP BY keeps every row ||| 1 ||| GROUP BY collapses; windows annotate. That is the entire mental model. ||| easy
amount_cents - AVG(amount_cents) OVER () gives… ||| The signed distance from the mean ||| The percent of total ||| The running delta ||| The median gap ||| 0 ||| Subtracting the windowed mean from each row leaves a signed distance (negative below typical). ||| medium
For order_items, SUM(quantity * unit_price) OVER () equals… ||| Total book revenue across all lines ||| One order's revenue ||| The average line ||| Units sold ||| 0 ||| The expression inside the window is computed per row, then summed across all rows. ||| medium
A window function without PARTITION BY and without ORDER BY treats… ||| Each row as its own partition ||| The whole result set as one partition ||| Each column separately ||| Nothing ||| 1 ||| Empty OVER () = one big partition. ||| easy
Which can NOT appear directly in WHERE? ||| status = 'x' ||| ROW_NUMBER() OVER (…) ||| total > 100 ||| created_at IS NULL ||| 1 ||| Window functions execute after WHERE; filtering on them requires a subquery or CTE. ||| medium
ROUND(100.0 * stock / SUM(stock) OVER (), 2) on products gives… ||| Each product's percent of total stock ||| Stock rank ||| Running stock ||| Stock average ||| 0 ||| Share-of-total: the row's stock over the windowed grand sum, scaled and rounded. ||| medium
Why can two window aggregates share one OVER clause efficiently? ||| SQLite caches identical window definitions ||| They can't ||| Windows are free ||| Only in PostgreSQL ||| 0 ||| Identical window definitions are computed once — that is also why the WINDOW clause exists. ||| hard
COUNT(*) OVER () with a LIMIT 5 clause counts… ||| 5 ||| The rows BEFORE LIMIT — the full filtered set ||| 0 ||| Depends on indexes ||| 1 ||| LIMIT trims the output after windows are computed, so the window saw the full set — but the returned rows show that count. ||| hard
total / AVG(total) OVER () above 1.0 means… ||| The basket is bigger than typical ||| Below typical ||| Exactly typical ||| An error ||| 0 ||| The ratio to the mean; above 1 means bigger than the average basket. ||| easy
Which table would you query for SUM(amount_cents) OVER () as 'outstanding'? ||| orders ||| invoices WHERE status = 'open' ||| products ||| customers ||| 1 ||| Open invoices are the receivables; the windowed sum carries the total on every line. ||| easy
Window functions in SQLite require version… ||| 3.16+ ||| 3.25+ ||| 2.x ||| 4.0 ||| 1 ||| Window functions landed in SQLite 3.25.0 (2018). ||| hard
SUM(total) OVER () divided by COUNT(*) OVER () equals… ||| The average total — same as AVG(total) OVER () ||| The max ||| The median ||| Nothing meaningful ||| 0 ||| Sum over count is the definition of the mean; the windowed versions agree. ||| medium
A query with BOTH GROUP BY and an empty-window SUM(x) OVER () computes the window… ||| Before grouping ||| Over the grouped rows (after GROUP BY) ||| Ignoring GROUP BY ||| Twice ||| 1 ||| Windows run after grouping, so the empty window sees one row per group — SUM(SUM(x)) OVER () is the grand total pattern. ||| hard
Which ORDER BY inside OVER () matters for SUM(total) OVER ()? ||| Required always ||| None — without ORDER BY the sum spans the whole partition ||| Only DESC ||| Only on dates ||| 1 ||| An aggregate window without ORDER BY takes the whole partition; adding ORDER BY starts a running frame. ||| hard
FIRST_VALUE(x) OVER () without ORDER BY returns… ||| NULL ||| The first row's x in arbitrary order — nondeterministic without ORDER BY ||| The minimum ||| The average ||| 1 ||| Without ORDER BY the row order is unspecified, so 'first' is not well defined. ||| hard
Which statement about empty-window aggregates is FALSE? ||| They keep every row ||| They see the whole partition ||| They can be used in expressions ||| They filter rows themselves ||| 3 ||| Windows never filter rows — WHERE does that before the window runs. ||| medium
dept-total style reporting (grand total beside detail) is exactly what… ||| GROUP BY alone does ||| SUM(x) OVER () does ||| UNION does ||| LIMIT does ||| 1 ||| The grand-total-beside-detail pattern is the canonical empty-window aggregate. ||| easy
ROW_NUMBER() OVER (ORDER BY total DESC) assigns… ||| 1 to the smallest ||| 1,2,3… starting with the biggest, no ties ||| Random numbers ||| Tied numbers on ties ||| 1 ||| ROW_NUMBER deals a strict sequence in the window's order; DESC puts the biggest first. ||| easy
ROW_NUMBER vs RANK on tied rows: ROW_NUMBER… ||| Shares numbers ||| Never shares numbers ||| Skips numbers ||| Reverses order ||| 1 ||| ROW_NUMBER always deals distinct positions; RANK shares on ties. ||| easy
To break ties deterministically in ROW_NUMBER you… ||| Can't ||| Add a tiebreaker column inside ORDER BY (e.g., id ASC) ||| Use DISTINCT ||| Use GROUP BY ||| 1 ||| The window's ORDER BY takes multiple keys; the tiebreaker pins the sequence. ||| easy
ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY created_at DESC) numbers… ||| All orders globally ||| Each customer's orders newest-first, restarting per customer ||| Months ||| Products ||| 1 ||| The partition restarts the counter; the order decides the direction. ||| medium
The rn = 1 pattern (keep the top row per group) must filter WHERE rn = 1… ||| In the same SELECT ||| In an outer query (CTE or derived table) ||| In HAVING ||| In OVER ||| 1 ||| Windows are computed after WHERE, so the filter has to happen in a second layer. ||| medium
ROW_NUMBER with no ORDER BY inside OVER () gives… ||| Error ||| Arbitrary, possibly unstable numbering ||| Always insertion order ||| Always 1 ||| 1 ||| Without ORDER BY the numbering follows unspecified row order — never rely on it. ||| hard
Latest order per customer = ROW_NUMBER over… ||| PARTITION BY customer_id ORDER BY created_at DESC, keep rn = 1 ||| ORDER BY customer_id only ||| PARTITION BY created_at ||| No window needed ||| 0 ||| Partition per customer, order newest-first, keep the first — the classic dedup/pick pattern. ||| medium
ROW_NUMBER() OVER (ORDER BY price ASC, name ASC) — the name is… ||| A decoration ||| The deterministic tiebreaker for equal prices ||| The partition key ||| An error ||| 1 ||| Ties in the first key fall through to the next key inside the window's ORDER BY. ||| easy
Deduplicating 'keep the biggest row per key' uses… ||| GROUP BY with MAX only ||| ROW_NUMBER partitioned by the key, keep rn = 1 ||| DISTINCT ||| UNION ||| 1 ||| GROUP BY's MAX gives the value but not the whole row; ROW_NUMBER keeps the entire row. ||| medium
ROW_NUMBER() OVER (ORDER BY created_at ASC) AS seq marks… ||| The chronological sequence of orders ||| Value rank ||| Alphabetical rank ||| Nothing ||| 0 ||| Ascending time walk — seq 1 is the earliest order. ||| easy
Which function guarantees NO gaps and NO ties? ||| RANK ||| DENSE_RANK ||| ROW_NUMBER ||| NTILE ||| 2 ||| ROW_NUMBER is the only strict 1..N dealing. ||| easy
Top-N per group (top 3 per status) = ROW_NUMBER partitioned by status, then… ||| WHERE rn <= 3 in an outer layer ||| LIMIT 3 globally ||| HAVING rn <= 3 ||| Nothing ||| 0 ||| The rank exists after the window, so the cut happens outside; a global LIMIT would only trim the total rows. ||| medium
ROW_NUMBER() OVER () with no ORDER BY at all… ||| Is invalid ||| Compiles but numbers arbitrarily ||| Numbers by id ||| Numbers alphabetically ||| 1 ||| Valid syntax, unstable semantics — always order the walk. ||| medium
Numbering products cheapest-first uses… ||| ORDER BY price DESC ||| ORDER BY price ASC ||| PARTITION BY price ||| GROUP BY price ||| 1 ||| Ascending price puts the cheapest on row 1. ||| easy
ROW_NUMBER over a partition of ONE row returns… ||| 0 ||| 1 ||| NULL ||| Error ||| 1 ||| A single-row partition still deals position 1. ||| easy
Which can NOT be referenced in the same SELECT's WHERE? ||| A column alias from the SELECT list in some engines — and always a window function ||| Regular columns ||| Parameters ||| Literals ||| 0 ||| Window results (and SELECT aliases) are not visible to the same level's WHERE — stage them first. ||| medium
ROW_NUMBER() OVER (ORDER BY total DESC, id ASC) on tied totals… ||| Shares numbers ||| Breaks ties by smaller id first ||| Skips numbers ||| Errors ||| 1 ||| The second key decides tie order: smaller id wins the earlier position. ||| medium
Pagination by rank (rows 11-20) uses… ||| LIMIT 10 OFFSET 10 over a ROW_NUMBER walk ||| DISTINCT ||| GROUP BY ||| FILTER ||| 0 ||| The walk plus LIMIT/OFFSET pages the ladder — or filter rn BETWEEN 11 AND 20 in an outer layer. ||| medium
Which ORDER BY direction numbers orders from OLDEST? ||| created_at DESC ||| created_at ASC ||| Either ||| Neither ||| 1 ||| Ascending time starts at the earliest row. ||| easy
ROW_NUMBER is deterministic only if… ||| The table is small ||| The window ORDER BY is unique (or has a tiebreaker) ||| You use DESC ||| You partition ||| 1 ||| A fully unique window ORDER BY pins every position; otherwise equal rows can swap between runs. ||| medium
RANK() on tied values gives… ||| Distinct numbers ||| The same rank, then skips ||| The same rank, no skip ||| NULL ||| 1 ||| RANK shares the rank on ties and jumps by the number of tied rows. ||| easy
DENSE_RANK() on tied values gives… ||| Distinct numbers ||| Same rank, then skips ||| Same rank, next number continues — no gaps ||| NULL ||| 2 ||| DENSE_RANK shares without gaps: 1,1,2 instead of 1,1,3. ||| easy
Four rows tie at rank 6. RANK gives the next row… ||| 7 ||| 10 ||| 6 ||| 8 ||| 1 ||| Four tied rows occupy ranks 6,6,6,6 — the next row is 6+4 = 10. ||| medium
Four rows tie at band 6. DENSE_RANK gives the next row… ||| 7 ||| 10 ||| 6 ||| 9 ||| 0 ||| Dense bands continue with the next integer after a tie group. ||| medium
ROW_NUMBER vs RANK vs DENSE_RANK agree exactly when… ||| Data is empty ||| There are no ties in the window ORDER BY ||| You use DESC ||| Partitioned ||| 1 ||| With unique keys all three deal the same numbers; ties split them. ||| medium
Why does a tiebreaker column inside OVER (ORDER BY n DESC, customer_id ASC) change RANK's behavior? ||| It doesn't ||| It makes every row unique, so ties never occur and RANK equals ROW_NUMBER ||| It reverses order ||| It groups rows ||| 1 ||| RANK compares the FULL window order tuple — a unique tiebreaker removes ties entirely. ||| hard
To RANK months by count WITH visible ties, the window ORDER BY must be… ||| ORDER BY n DESC, month ASC ||| ORDER BY n DESC only (tiebreak in the outer sort) ||| ORDER BY month ||| Impossible ||| 1 ||| Keep the window key tie-prone; deterministic display comes from the outer ORDER BY. ||| hard
RANK() OVER (ORDER BY revenue DESC) crowns… ||| The smallest revenue ||| The biggest revenue as rank 1 ||| The first row ||| Alphabetical ||| 1 ||| DESC walks high to low — rank 1 is the biggest. ||| easy
Competition-style leaderboards (Olympics) use… ||| DENSE_RANK ||| RANK ||| ROW_NUMBER ||| NTILE ||| 1 ||| Two silver medals means no bronze — the skip is RANK's behavior. ||| easy
Tier ladders that must never skip (plan bands) use… ||| RANK ||| DENSE_RANK ||| ROW_NUMBER ||| LAG ||| 1 ||| Gapless bands are DENSE_RANK's contract. ||| easy
RANK with zero ties behaves like… ||| DENSE_RANK and ROW_NUMBER ||| NTILE ||| LAG ||| Nothing ||| 0 ||| No ties means no sharing and no skipping — all three agree. ||| easy
Which ranking function requires an argument? ||| RANK ||| ROW_NUMBER ||| NTILE ||| DENSE_RANK ||| 2 ||| NTILE(n) needs the bucket count; the rank family takes none. ||| easy
RANK() OVER (ORDER BY n) with all n equal gives… ||| 1,2,3… ||| All 1s ||| All NULL ||| Error ||| 1 ||| Everything ties at rank 1. ||| medium
The outer ORDER BY rk, customer_id after ranking exists to… ||| Change the ranks ||| Sort the DISPLAY deterministically without touching the ranks ||| Filter rows ||| Group rows ||| 1 ||| The outer sort presents the result; it never recomputes ranks. ||| medium
RANK() OVER (ORDER BY x) where x is unique gives… ||| Gaps ||| A clean 1..N identical to ROW_NUMBER ||| Ties ||| NULLs ||| 1 ||| Unique keys — no ties, no gaps. ||| easy
Which function would you use to show 'you are the 6th/16th customer' strictly? ||| RANK ||| ROW_NUMBER ||| DENSE_RANK ||| CUME_DIST ||| 1 ||| Strict position = ROW_NUMBER. ||| easy
Ties sharing a rank and the next skipping is called… ||| Dense ranking ||| Competition ranking ||| Ordinal ranking ||| Percentile ||| 1 ||| Competition (1224) ranking — RANK's definition. ||| medium
AVG(price) OVER (PARTITION BY category) computes… ||| One average for all products ||| The average within each category, repeated on its rows ||| A running average ||| An error ||| 1 ||| The partition scopes the average; every row of the category carries it. ||| easy
PARTITION BY is to windows as GROUP BY is to… ||| ORDER BY ||| Aggregate queries — but GROUP BY collapses and PARTITION BY does not ||| LIMIT ||| JOIN ||| 1 ||| Both define groups; only GROUP BY collapses the result. ||| easy
On 16 products in 7 categories, AVG(price) OVER (PARTITION BY category) outputs… ||| 7 rows ||| 16 rows ||| 1 row ||| 112 rows ||| 1 ||| Windows keep every input row — all 16 products, each with its aisle's mean. ||| easy
COUNT(*) OVER (PARTITION BY status) tells you… ||| The total orders ||| How many orders share the current row's status ||| Distinct statuses ||| Nothing ||| 1 ||| The stage's width, painted on every row in that stage. ||| easy
SUM(o.total) OVER (PARTITION BY c.region) after a JOIN computes… ||| Grand revenue ||| Region revenue repeated on the region's orders ||| Customer revenue ||| Error ||| 1 ||| The join attaches regions; the partitioned sum folds each market. ||| medium
Which is the correct percent-of-category-revenue expression? ||| 100.0 * total / SUM(total) OVER () ||| 100.0 * total / SUM(total) OVER (PARTITION BY status) ||| total / SUM(total) ||| 100 * total ||| 1 ||| The partitioned SUM makes the pie the status group's revenue, not the company's. ||| medium
PARTITION BY with multiple keys (customer_id, status)… ||| Is invalid ||| Groups by the tuple — partitions reset when either key changes ||| Means two windows ||| Requires parens ||| 1 ||| Composite partitions are just tuples; the slice changes when any key changes. ||| medium
MIN(price) OVER (PARTITION BY category) gives… ||| Global cheapest ||| Each aisle's cheapest price on its rows ||| Row price ||| NULL ||| 1 ||| The local floor per category. ||| easy
PARTITION BY strftime('%Y-%m', created_at) slices by… ||| Year ||| Calendar month ||| Day ||| Week ||| 1 ||| The month expression is the partition key — each calendar month is a slice. ||| medium
Which query keeps 103 order rows? ||| GROUP BY customer_id ||| SELECT id, COUNT(*) OVER (PARTITION BY customer_id) FROM orders ||| SELECT DISTINCT customer_id ||| GROUP BY status ||| 1 ||| The window annotates; nothing collapses — 103 rows out. ||| easy
PARTITION BY differs from GROUP BY because it… ||| Sorts data ||| Splits the window computation without collapsing rows ||| Filters rows ||| Joins tables ||| 1 ||| Partition = the window's private group; rows survive. ||| easy
MAX(debit_cents) OVER (PARTITION BY account) is… ||| The book's biggest debit ||| The account's biggest debit on every of its entries ||| The last debit ||| The first debit ||| 1 ||| The local peak per account. ||| easy
Windows run… ||| Before WHERE ||| After GROUP BY and HAVING, before ORDER BY/LIMIT ||| After LIMIT ||| Before FROM ||| 1 ||| Logical phase order: FROM → WHERE → GROUP BY → HAVING → windows → SELECT → ORDER BY → LIMIT. ||| hard
The empty-window SUM inside a grouped CTE — SUM(SUM(x)) OVER () — equals… ||| Syntax error ||| The grand total across groups ||| The group's total ||| NULL ||| 1 ||| Inner SUM is the group aggregate; the windowed SUM over the grouped rows is the grand total. ||| hard
PARTITION BY customer_id with orders of one customer each (no repeats) makes… ||| Bigger partitions ||| Every partition a single row — the aggregate equals the row itself ||| An error ||| Fewer rows ||| 1 ||| Singleton partitions make the window trivially the row's own value. ||| medium
Which is NOT a window aggregate? ||| SUM(x) OVER () ||| AVG(x) OVER (PARTITION BY y) ||| SUM(x) GROUP BY y ||| COUNT(*) OVER () ||| 2 ||| Plain GROUP BY aggregation is not a window — no OVER, no row preservation. ||| easy
LAG(total) OVER (ORDER BY created_at) returns… ||| The next total ||| The previous total in the walk ||| The first total ||| NULL always ||| 1 ||| LAG reaches one row BACK in the window's order. ||| easy
LEAD(total) OVER (ORDER BY created_at) returns… ||| The previous total ||| The next total in the walk ||| The last total ||| The first total ||| 1 ||| LEAD peeks one row FORWARD. ||| easy
The first row's LAG (without a default) is… ||| 0 ||| NULL ||| The row itself ||| Error ||| 1 ||| Nothing precedes the first row — LAG returns NULL there. ||| easy
LAG(total, 1, 0) differs from LAG(total) by… ||| Nothing ||| Filling missing rows with 0 instead of NULL ||| Reading two rows back ||| Reversing direction ||| 1 ||| The third argument is the default for out-of-range rows. ||| medium
Why write LAG(total, 1, 0.0) with a REAL default for a REAL column? ||| Style ||| Mixed int/REAL output can break strict drivers and reads oddly ||| SQLite requires REAL ||| Speed ||| 1 ||| A REAL default keeps the column type consistent down the pipeline. ||| hard
LAG(total, 2) reaches… ||| One row back ||| Two rows back ||| Two rows forward ||| The second partition ||| 1 ||| The second argument is the offset — two steps back. ||| easy
Month-over-month growth percent is… ||| 100.0 * (revenue - LAG(revenue)) / LAG(revenue) ||| revenue / 12 ||| SUM(revenue) OVER () ||| NTILE(2) ||| 0 ||| The MoM formula: current minus previous, over previous, scaled — with the LAG staged in a CTE. ||| medium
Why stage LAG in a CTE before computing MoM percent? ||| Style ||| Windows can't nest inside expressions with their own results — compute percent outside against the staged column ||| Speed ||| SQLite forbids CTEs ||| 1 ||| The percent needs the borrowed value as a plain column; the CTE provides it and guards the NULL first month. ||| hard
Days between a customer's orders uses… ||| LAG(created_at) per customer + julianday difference ||| COUNT(*) ||| NTILE ||| GROUP BY ||| 0 ||| Partition by customer, borrow the previous date, subtract julianday values, cast to INTEGER. ||| hard
LAG with PARTITION BY customer_id means… ||| Global previous ||| The previous row WITHIN the same customer's timeline ||| The next customer ||| Nothing ||| 1 ||| Partitions restart the walk — LAG never crosses the customer boundary. ||| medium
LEAD(created_at) - created_at on an order walk gives… ||| Days since the previous order ||| Days until the next order ||| Total days ||| Zero ||| 1 ||| The forward peek measures the horizon to the next event. ||| medium
Swapping LAG for LEAD in a 'previous value' column… ||| Changes nothing ||| Makes the column show NEXT values instead — same shape, opposite arrow ||| Errors ||| Doubles rows ||| 1 ||| The columns still fill with real values — just from the wrong neighbor. That is what makes the bug silent. ||| medium
LAG(status) OVER (ORDER BY created_at) flags… ||| Duplicates ||| The funnel stage one basket ago — the store's own timeline ||| The customer's last status ||| Nothing ||| 1 ||| Unpartitioned, the walk is the store's global timeline. ||| medium
Which window order makes LAG mean 'the pricier neighbor'? ||| price ASC ||| price DESC ||| Either ||| None ||| 1 ||| Walking DESC, the previous row is the pricier one. ||| medium
New-customer detection on a timeline uses… ||| LAG(customer_id) compared with the current customer_id ||| DISTINCT ||| GROUP BY customer_id ||| NTILE ||| 0 ||| When the previous row's customer differs (or is NULL), this order is the customer's first appearance in the walk. ||| hard
julianday(prev) can be computed inside the same SELECT as LAG(prev)… ||| Yes ||| No — stage the LAG first, then do the date math outside the window ||| Only with FILTER ||| Only in SQLite CLI ||| 1 ||| Windows cannot nest; the borrowed value must land in a CTE/derived table first. ||| hard
LAG over an ascending price ladder gives… ||| The pricier neighbor ||| The cheaper neighbor ||| The average ||| The max ||| 1 ||| Ascending walk — previous means the cheaper rung. ||| easy
The default LAG offset is… ||| 0 ||| 1 ||| 2 ||| -1 ||| 1 ||| LAG(x) is LAG(x, 1). ||| easy
LEAD's edge (the last row) shows… ||| 0 ||| NULL unless a default is given ||| The first row ||| Error ||| 1 ||| Symmetric with LAG: the future is empty, so NULL unless filled. ||| easy
FIRST_VALUE(name) OVER (PARTITION BY category ORDER BY price DESC) gives… ||| The cheapest name ||| The dearest name in the category on every row ||| The first row's name alphabetically ||| NULL ||| 1 ||| Descending ladder — position one is the most expensive product. ||| medium
LAST_VALUE with the DEFAULT frame returns… ||| The true last row ||| The CURRENT row — the default frame ends there ||| The first row ||| NULL ||| 1 ||| The default frame is UNBOUNDED PRECEDING to CURRENT ROW, so LAST_VALUE lands on the current row — the famous trap. ||| hard
The fix for the LAST_VALUE trap is… ||| Use FIRST_VALUE ||| Add the full frame: ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ||| Add DISTINCT ||| Use MAX ||| 1 ||| Stretching the frame across the whole partition lets LAST_VALUE see the real end. ||| hard
FIRST_VALUE(price) OVER (PARTITION BY category ORDER BY price ASC) equals… ||| MAX(price) per category ||| MIN(price) per category ||| AVG(price) ||| NULL ||| 1 ||| Ascending ladder — the first value is the category minimum. ||| medium
NTH_VALUE(x, 2) returns… ||| The first value ||| The second value of the ordered walk ||| The last value ||| The count ||| 1 ||| NTH_VALUE takes the position as its second argument. ||| medium
NTH_VALUE shows NULL on early rows because… ||| Errors ||| With the default frame, the walk hasn't reached position n yet ||| The column is empty ||| Ties ||| 1 ||| The truncated frame hides future rows; the full frame makes every row see the same nth value. ||| hard
FIRST_VALUE over a running frame (UNBOUNDED PRECEDING to CURRENT ROW) on an ascending walk gives… ||| The global maximum ||| The running minimum — the cheapest price seen so far ||| The average ||| The current price ||| 1 ||| The truncated frame makes the first value 'so far' — the running minimum on an ascending walk. ||| hard
MAX(total) OVER (ORDER BY created_at ROWS UNBOUNDED PRECEDING…) is… ||| The global max ||| The running peak — the biggest total so far ||| The last total ||| Zero ||| 1 ||| MAX with a walking frame is the high-water mark. ||| medium
FIRST_VALUE vs MIN(x) OVER (PARTITION BY g): both can give the group minimum, but FIRST_VALUE can also… ||| Nothing more ||| Return a different COLUMN's value (e.g., the name of the minimum's owner) ||| Filter rows ||| Sort rows ||| 1 ||| FIRST_VALUE borrows any column from the top row — MIN only aggregates numbers. ||| medium
The empty-window SUM in 100.0 * x / SUM(x) OVER () acts as… ||| A running total ||| The denominator — the grand total ||| A moving window ||| A filter ||| 1 ||| Share-of-total needs the whole-set sum as the denominator. ||| easy
FIRST_VALUE requires… ||| No ORDER BY ||| An ORDER BY to define what 'first' means ||| A PARTITION BY ||| A frame ||| 1 ||| Without ORDER BY, 'first' is arbitrary. ||| medium
LAST_VALUE(id) with the full frame over created_at ASC gives… ||| The first id ||| The id of the most recent order in the partition ||| NULL ||| The smallest id ||| 1 ||| ASC ordering puts the newest row last; the full frame lets LAST_VALUE see it from anywhere. ||| hard
NTH_VALUE's position argument counts… ||| Columns ||| Rows in the window's ordered walk ||| Partitions ||| Frames ||| 1 ||| Position is the ordinal within the ordered partition. ||| easy
SUM(total) OVER (ORDER BY created_at ASC ROWS UNBOUNDED PRECEDING…) gives… ||| The grand total ||| The running revenue — cumulative through each row ||| The moving total ||| Zero ||| 1 ||| The running frame turns SUM into a cumulative walk. ||| easy
The DEFAULT frame when ORDER BY is present is… ||| The whole partition ||| RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW ||| ROWS BETWEEN 1 PRECEDING AND CURRENT ROW ||| Empty ||| 1 ||| With ORDER BY, the default frame runs from the partition start to the current row (RANGE). ||| hard
ROWS vs RANGE matters when… ||| Never ||| The ORDER BY has ties — RANGE includes peer rows, ROWS counts rows ||| Only with strings ||| Only with PARTITION BY ||| 1 ||| RANGE includes tie peers; ROWS is a pure row count. On unique keys they agree. ||| hard
SUM(total) OVER (ORDER BY day ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) is… ||| A running total ||| A trailing three-day moving sum ||| The grand total ||| A percentile ||| 1 ||| The frame reaches two rows back — three rows including the current. ||| easy
AVG over the same three-row frame is… ||| A running average ||| A trailing three-day moving average ||| The global average ||| Zero ||| 1 ||| Same frame, AVG fold — the smoothing curve. ||| easy
Frame ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING averages… ||| The whole set ||| The previous, current, and next rows — centered smoothing ||| Only current ||| Two rows ||| 1 ||| The centered frame straddles the current row. ||| medium
Frame ROWS BETWEEN CURRENT ROW AND CURRENT ROW computes… ||| Everything ||| Just the current row — a teaching device for frame bounds ||| The next row ||| NULL ||| 1 ||| The degenerate frame isolates the row — useful to see what frames bound. ||| hard
On a chronological walk, FIRST_VALUE(created_at) OVER (ORDER BY created_at ROWS UNBOUNDED…CURRENT ROW) equals… ||| The current row's date ||| The walk's first date — constant across rows ||| NULL ||| The max ||| 1 ||| The running first on a time-ascending walk is fixed at the global first. ||| medium
ROWS BETWEEN 4 PRECEDING AND CURRENT ROW is… ||| A four-row window ||| A trailing five-row window (four back plus current) ||| Five rows forward ||| Invalid ||| 1 ||| Count the rows: 4 preceding + current = 5. ||| medium
Which frame makes SUM behave like a whole-partition total despite ORDER BY? ||| ROWS UNBOUNDED PRECEDING…CURRENT ROW ||| ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING ||| ROWS 1 PRECEDING ||| No frame ||| 1 ||| Stretching both bounds covers the entire partition — the walk flattens to a level. ||| medium
Running balance from ledger entries uses… ||| SUM(debit - credit) OVER (ORDER BY entry_date, id ROWS …CURRENT ROW) ||| GROUP BY account ||| MAX(debit) ||| NTILE ||| 0 ||| The signed movement accumulated chronologically is the classic balance walk. ||| medium
NTILE(4) over 103 orders deals buckets of… ||| 25 each ||| 26/26/26/25 ||| 103/4 each ||| Random ||| 1 ||| Earlier tiles absorb the remainder: 26,26,26,25. ||| medium
NTILE(4) with ORDER BY total ASC puts… ||| The dearest in tile 1 ||| The cheapest 26-ish orders in tile 1 ||| Random rows ||| NULLs ||| 1 ||| The ascending walk fills tile 1 first — the cheapest baskets. ||| easy
NTILE deals by… ||| Value thresholds ||| Row COUNT — equal-sized buckets regardless of values ||| Alphabet ||| Ties ||| 1 ||| Tiles are size-based; quartiles by value thresholds are a different (CASE-based) pattern. ||| medium
CUME_DIST() OVER (ORDER BY total ASC) gives… ||| Rank gaps ||| The fraction of rows at or below the current total ||| Percent of total money ||| Tile numbers ||| 1 ||| Cumulative distribution — always ends at 1.0 on the last peer group. ||| medium
PERCENT_RANK() gives… ||| (rank-1)/(rows-1), from 0.0 to 1.0 ||| Percent of total ||| Cumulative share ||| Tiles ||| 0 ||| PERCENT_RANK is the rank scaled to 0..1; single-row partitions read 0. ||| medium
CUME_DIST vs PERCENT_RANK on the FIRST row:… ||| Both 0 ||| cd > 0 (at least its own share), pr = 0 exactly ||| Both 1 ||| cd = 0, pr > 0 ||| 1 ||| PERCENT_RANK starts at 0 by definition; CUME_DIST starts at 1/n. ||| medium
Quartile labels ('Q1'..'Q4') come from… ||| CASE over NTILE(4) ||| GROUP BY 4 ||| LIMIT 4 ||| CUME_DIST ||| 0 ||| Deal the tiles, then CASE the tile number into labels. ||| easy
NTILE(2) on an odd count gives… ||| Equal tiles ||| The extra row to the EARLIER tile ||| The extra row to the later tile ||| NULL ||| 1 ||| Earlier tiles are larger by one when the split is uneven. ||| medium
The heavier half of spenders = rows where… ||| NTILE(4) = 4 ||| CUME_DIST >= 0.5 over spend ascending ||| RANK = 1 ||| LAG is NULL ||| 1 ||| The distribution's halfway mark splits the base by money. ||| medium
Filtering on CUME_DIST requires… ||| Nothing special ||| A CTE/derived table — windows can't be filtered in the same WHERE ||| HAVING only ||| DISTINCT ||| 1 ||| Stage the distribution, then filter outside. ||| medium
CUME_DIST within PARTITION BY category… ||| Is invalid ||| Computes the distribution inside each category, each reaching 1.0 ||| Uses the global rows ||| Errors ||| 1 ||| Partitions scope the walk — every category's distribution independently peaks at 1. ||| medium
PERCENT_RANK for a singleton partition reads… ||| 1.0 ||| 0.0 ||| NULL ||| 0.5 ||| 1 ||| (rank-1)/(rows-1) = 0/0, defined as 0. ||| hard
NTILE requires its argument to be… ||| A column ||| A constant positive integer ||| A subquery ||| Optional ||| 1 ||| NTILE(4) — the bucket count must be a constant. ||| medium
Which combination best answers 'top 5 spenders with ties shown together'? ||| ROW_NUMBER <= 5 ||| RANK, then filter rk <= 5 in an outer layer ||| NTILE(5) ||| LIMIT 5 ||| 1 ||| RANK shares on ties so tied spenders appear together; the filter must be staged. ||| hard
Customers above the AVERAGE order count = staged counts, then… ||| WHERE orders > AVG(orders) OVER () in an outer layer ||| HAVING orders > AVG(orders) ||| LIMIT ||| DISTINCT ||| 0 ||| The empty-window AVG over staged rows is the mean customer; filter outside. ||| hard
Rank-then-filter (top N) requires… ||| One SELECT ||| Two layers — the rank exists only after the window runs ||| HAVING ||| GROUP BY ||| 1 ||| WHERE can't see window results; a CTE or derived table stages the rank. ||| medium
Percent of total for EACH category, after GROUP BY, uses… ||| 100.0 * SUM(x) / SUM(SUM(x)) OVER () ||| 100.0 * SUM(x) / COUNT(*) ||| AVG(x) ||| MAX(x) ||| 0 ||| Windows run after GROUP BY: the inner SUM is the category total, the windowed SUM of those is the grand total. ||| hard
Which pattern pins 'the single biggest basket per city'? ||| GROUP BY city with MAX(total) ||| ROW_NUMBER() OVER (PARTITION BY city ORDER BY total DESC), keep rn = 1 outside ||| DISTINCT ON ||| LIMIT 1 ||| 1 ||| GROUP BY gives the value but not the order's id; the window keeps the whole row. ||| medium
Cumulative share that must reach exactly 100 at the end divides… ||| Running sum by the empty-window grand sum, times 100 ||| Each month by 12 ||| Rank by count ||| Nothing ||| 0 ||| Two windows: the running numerator and the grand denominator. ||| hard
A 'new low' flag on a balance walk compares the balance with… ||| The global minimum ||| MIN(balance) OVER the running frame — the minimum so far ||| Zero ||| The next balance ||| 1 ||| Balance equal to the running minimum means the walk just dipped to a new low. ||| hard
Which is a legitimate reason a window query returns fewer rows than the table? ||| PARTITION BY ||| WHERE filtering before the window ||| ORDER BY ||| The window itself ||| 1 ||| Windows never drop rows — WHERE does, before windows run. ||| medium
Open-invoice exposure per customer = … ||| SUM(amount_cents) OVER (PARTITION BY customer_id) after WHERE status = 'open' ||| COUNT(*) ||| MAX(due_on) ||| NTILE(4) ||| 0 ||| Gate to open bills, then fold per customer — the exposure mass on every row. ||| medium
AR aging at a fixed reference date uses… ||| julianday('2025-03-01') - julianday(due_on) ||| NOW() minus due_on ||| created_at ||| RANDOM() ||| 0 ||| A FIXED reference keeps the query deterministic — NOW() would change every run and break grading. ||| hard
Aging bucket strings 'current / 1-30 / 31-60 / 60+' come from… ||| NTILE(4) ||| A CASE over days_past_due thresholds ||| GROUP BY age ||| LIMIT ||| 1 ||| Value-threshold bands are CASE work; NTILE would deal equal counts instead. ||| medium
Days-to-pay per payment = … ||| julianday(paid_on) - julianday(issued_on) via the invoice join ||| paid_on - issued_on directly ||| COUNT(*) ||| LAG ||| 0 ||| Dates subtract through julianday; direct date subtraction is not numeric in SQLite. ||| medium
Cash concentration by vendor = vendor spend divided by… ||| Order count ||| SUM(spend) OVER () — total spend across vendors ||| AVG(spend) ||| MAX(spend) ||| 1 ||| The empty-window SUM over staged vendor totals is the whole pie. ||| medium
Rent's share of monthly spend = … ||| SUM(amount) FILTER (WHERE category = 'Rent') / SUM(amount) per month ||| NTILE ||| MAX ||| LAG ||| 0 ||| The FILTER fold computes the Rent slice inside each month's total — no self-join needed. ||| hard
The treasurer's running cash = … ||| SUM(amount_cents) OVER (ORDER BY paid_on, id ROWS …CURRENT ROW) over payments ||| MAX(paid_on) ||| AVG(amount) ||| COUNT ||| 0 ||| Chronological running sum of collections — the cash book. ||| medium
Which reference date choice keeps aging queries deterministic? ||| date('now') ||| A fixed literal like '2025-03-01' ||| RANDOM ||| created_at ||| 1 ||| NOW-style dates change every run; fixed literals are reproducible and gradeable. ||| medium
Customer lifetime-value bands ('low/mid/high') = … ||| CASE over NTILE(3) on spend DESC ||| GROUP BY spend ||| LIMIT 3 ||| LAG ||| 0 ||| Deal three tiles descending, then label them with CASE. ||| medium
A balance that 'never goes below its running min' after row 1 means… ||| The walk only rises ||| The balance keeps setting new highs or holding — no new lows ||| An error ||| Ties ||| 1 ||| balance > running-min-so-far after the first row means no new low-water mark was set. ||| hard
Monthly net movement per ledger account = … ||| SUM(debit - credit) GROUP BY month, account — then windows for context ||| MAX(debit) ||| COUNT(*) ||| NTILE ||| 0 ||| Signed movement folds by month; windows add ranks and runs on top. ||| medium
Payment method of the month = … ||| RANK() OVER (PARTITION BY month ORDER BY count DESC), keep rk = 1 ||| GROUP BY method ||| MAX(method) ||| LIMIT 1 ||| 0 ||| Stage month-method counts, rank within the month partition, keep the winner. ||| hard
"""

def parse(raw):
    qs = []
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split(" ||| ")]
        assert len(parts) == 8, f"BAD LINE ({len(parts)}): {line[:80]}"
        prompt, c0, c1, c2, c3, ans, why, diff = parts
        qs.append(dict(prompt=prompt, choices=[c0, c1, c2, c3], answer=int(ans), why=why, difficulty=diff))
    return qs

qs_a = parse(A_RAW)
print("parsed", len(qs_a))

def emit(qs, fname, const, start):
    out = []
    out.append("// AUTO-ASSEMBLED by scripts/gen-wf-mcqs.py — window-functions MCQ bank.")
    out.append('import type { Mcq } from "../types";')
    out.append("")
    out.append(f"export const {const}: Mcq[] = [")
    for i, q in enumerate(qs):
        qid = "wf-q%03d" % (start + i)
        out.append("  {")
        out.append('    id: "%s",' % qid)
        out.append('    prompt: %s,' % json.dumps(q["prompt"], ensure_ascii=False))
        out.append('    choices: %s,' % json.dumps(q["choices"], ensure_ascii=False))
        out.append('    answer: %d,' % q["answer"])
        out.append('    why: %s,' % json.dumps(q["why"], ensure_ascii=False))
        out.append('    difficulty: "%s",' % q["difficulty"])
        out.append("  },")
    out.append("];")
    out.append("")
    open(fname, "w").write("\n".join(out))
    print("wrote", fname, len(qs))

# split: bank A takes the first 150; bank B is generated by gen-wf-mcqs2.py
emit(qs_a[:150], "src/lib/curriculum/windows/mcqs-a.ts", "mcqsWfA", 1)
print("bank A done; bank B from gen-wf-mcqs2.py")
