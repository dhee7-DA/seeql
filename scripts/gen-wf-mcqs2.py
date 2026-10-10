# Generator for window-functions MCQ bank B (wf-q151..300) — 150 questions.
# Fields: prompt ||| choice0 ||| choice1 ||| choice2 ||| choice3 ||| answerIdx ||| why ||| difficulty
import json

B_RAW = """
A running total needs the window to… ||| Have ORDER BY so the frame walks ||| Have no ORDER BY ||| Be empty ||| Use DISTINCT ||| 0 ||| Without ORDER BY the aggregate spans the whole partition — no walk. ||| easy
SUM(total) OVER (ORDER BY created_at ROWS UNBOUNDED PRECEDING) on the last row equals… ||| The first order ||| The whole-period revenue ||| Zero ||| The average ||| 1 ||| The walk completes at the grand total on the final row. ||| easy
Your running total repeats the grand total on every row. The likely bug is… ||| Wrong table ||| The frame stretches to UNBOUNDED FOLLOWING — the walk became a level ||| Missing WHERE ||| Missing ROUND ||| 1 ||| The whole-span frame flattens the clock into a snapshot. ||| medium
A moving average of exactly 3 rows needs the frame… ||| ROWS BETWEEN 2 PRECEDING AND CURRENT ROW ||| RANGE UNBOUNDED ||| 3 FOLLOWING ||| PARTITION BY 3 ||| 0 ||| Two back plus current — a pure row-count window. ||| easy
Which fold turns the three-row frame into a smoothing curve? ||| SUM ||| AVG ||| MIN ||| COUNT ||| 1 ||| Averages smooth; sums accumulate. ||| easy
Early rows of a trailing 3-row average use… ||| NULLs ||| However many rows exist so far — AVG adapts ||| Zero ||| Errors ||| 1 ||| The frame is bounded by the partition start — early averages use fewer terms. ||| medium
The cash book's last row shows… ||| The first payment ||| The total collected across the book ||| Zero ||| The average payment ||| 1 ||| The running cash clock completes at the whole-book total. ||| easy
Balance walks use the signed expression… ||| debit_cents - credit_cents ||| debit_cents + credit_cents ||| credit - debit ||| COUNT ||| 0 ||| Debits increase the balance, credits decrease it — the net movement. ||| easy
Per-account statements need the frame paired with… ||| LIMIT ||| PARTITION BY account — one page per account ||| DISTINCT ||| Nothing ||| 1 ||| The partition gives each account a private walk. ||| easy
The high-water mark never… ||| Rises ||| Falls — running maxima only rise or hold ||| Holds ||| Starts at zero ||| 1 ||| Monotonic by definition — that is why 'new all-time high' flags work. ||| medium
Gap to the running peak shrinks to zero when… ||| Never ||| The current basket IS the record ||| The walk ends ||| Ties ||| 1 ||| A new record's gap below the peak is exactly zero. ||| medium
A running MIN on an ascending walk equals… ||| The current row's value ||| The global minimum from row one ||| The maximum ||| NULL ||| 1 ||| Walking ascending, the minimum-so-far is fixed at the first (cheapest) row. ||| medium
Which frame would you use to compare each row ONLY with its immediate predecessor? ||| ROWS BETWEEN 1 PRECEDING AND CURRENT ROW ||| UNBOUNDED FOLLOWING ||| Whole partition ||| No frame ||| 0 ||| The two-row trailing window. ||| easy
ROWS vs RANGE differs when… ||| Keys are unique ||| The ORDER BY has ties — RANGE includes peers, ROWS counts rows ||| Never ||| Only with SUM ||| 1 ||| RANGE works on values; ties ride together and inflate RANGE frames. ||| hard
The default frame without ORDER BY is… ||| Current row only ||| The WHOLE partition ||| Empty ||| One row back ||| 1 ||| No ORDER BY means the whole partition — aggregates span everything. ||| easy
Frame ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING walks… ||| Backwards ||| Forward from the current row to the partition end ||| Nowhere ||| The whole set ||| 1 ||| The leading frame — 'everything after me'. ||| hard
Running totals with RANGE on tied keys… ||| Match ROWS exactly ||| Jump by all tied peers at once — the sum includes duplicates of the key ||| Error ||| Skip ties ||| 1 ||| RANGE stretches over peers; a tie group enters the frame together. ||| hard
Cumulative units per product restart because of… ||| ORDER BY ||| PARTITION BY product_id ||| LIMIT ||| ROUND ||| 1 ||| The partition is the restart boundary. ||| easy
The month clock (1,2,3 within each month) needs… ||| Calendar partition + chronological walk + running COUNT ||| Global COUNT ||| GROUP BY month ||| No frame ||| 0 ||| Partition by the month expression, count through the current basket. ||| medium
The expense meter's final reading is… ||| Zero ||| Total spend across the book ||| The average bill ||| The biggest bill ||| 1 ||| The running spend completes at the whole-period total. ||| easy
The customer count clock differs from a running revenue clock by… ||| Nothing ||| The fold: COUNT(*) counts signups, SUM adds money ||| The frame ||| Nothing else ||| 1 ||| Same walk, different aggregate. ||| easy
Two-month pair sums first reach their full size on… ||| Row 1 ||| Row 2 — once a previous month exists ||| Never ||| The last row ||| 1 ||| The frame fills up as the walk accumulates history. ||| easy
The payment rail's ceiling never changes across a rail's rows because… ||| It's a bug ||| The whole-partition MAX repeats the rail's peak on every payment ||| Frames ||| Ties ||| 1 ||| Whole-partition aggregates are levels, not walks. ||| easy
NTILE(4) needs… ||| No argument ||| A constant bucket count ||| A column ||| A frame ||| 1 ||| NTILE(4) — the deal size is part of the call. ||| easy
NTILE with ORDER BY total DESC puts the biggest baskets in… ||| Tile 1 ||| Tile 4 ||| Tile 2 ||| No tile ||| 1 ||| The walk fills tile 1 first — DESC puts the biggest there. ||| medium
Tiles differ from CASE thresholds because tiles are… ||| Value-based ||| Count-based — equal row counts whatever the values ||| Random ||| Sorted ||| 1 ||| NTILE deals by rows; thresholds split by values. ||| medium
Aging bands (0/30/60) differ from tiles because bands are… ||| Count-based ||| Value-thresholded via CASE — sizes float with the data ||| Random ||| Always equal ||| 1 ||| Business bands have fixed edges; tiles always balance counts. ||| medium
CUME_DIST reads 0.5 exactly when… ||| Half the money is above ||| Half the rows are at or below the current one (at the median peer group) ||| Rank is 5 ||| Never ||| 1 ||| The distribution's halfway mark is about row counts, not money. ||| medium
PERCENT_RANK of the biggest row is… ||| 0 ||| 1.0 ||| 0.5 ||| n-1 ||| 1 ||| Top rank → (n-1)/(n-1) = 1. ||| easy
CUME_DIST of the biggest row is… ||| 0 ||| 1.0 ||| 0.5 ||| Rows ||| 1 ||| Everything is at or below the maximum. ||| easy
Deciles split the book into… ||| 4 ||| 10 ||| 100 ||| 2 ||| 1 ||| Ten tiles — deciles. ||| easy
Which function answers 'what fraction of orders cost at most this much'? ||| PERCENT_RANK ||| CUME_DIST ||| NTILE ||| RANK ||| 1 ||| The cumulative distribution counts at-or-below peers. ||| easy
Which function starts at exactly 0.0 on the first row? ||| CUME_DIST ||| PERCENT_RANK ||| NTILE ||| ROW_NUMBER - 1 ||| 1 ||| PERCENT_RANK = (rank-1)/(rows-1). ||| easy
Tied rows under PERCENT_RANK… ||| Get different ranks ||| Share the same percent rank ||| Error ||| Skip ||| 1 ||| Equal keys → equal rank → equal percent rank. ||| medium
Filtering 'top half by money' must stage CUME_DIST because… ||| Style ||| WHERE cannot see window results computed in the same SELECT ||| Speed ||| SQLite limits ||| 1 ||| The two-layer rule — every window filter needs a CTE or derived table. ||| medium
NTILE vs CASE thresholds for 'premium shelf': NTILE always… ||| Matches business edges ||| Balances counts — the edge moves with the data ||| Uses values ||| Errors ||| 1 ||| Proportional vs absolute — pick per the memo's definition. ||| medium
Distribution within partitions (per category) restarts because… ||| ORDER BY ||| The PARTITION BY scopes the walk — each reaches 1.0 independently ||| LIMIT ||| Nothing ||| 1 ||| Partitions scope every window statistic. ||| easy
The heaviest half of invoices keeps rows where… ||| cd >= 0.5 (staged) ||| tile = 1 ||| rk = 1 ||| LAG IS NULL ||| 0 ||| The distribution filter at the halfway mark. ||| easy
Which pairing shows BOTH where a row stands and which bucket it fills? ||| CUME_DIST + NTILE ||| LAG + LEAD ||| MIN + MAX ||| Two GROUP BYs ||| 0 ||| Distribution locates; tiles segment. ||| medium
Stage-then-filter is required for… ||| Plain WHERE on columns ||| Any window-result filter (ranks, tiles, distributions) ||| GROUP BY results ||| LIMIT ||| 1 ||| Windows run after WHERE — the filter must be an outer layer. ||| easy
Rank-then-keep-top-N needs how many query layers? ||| 1 ||| 2 — the rank exists only after the window runs ||| 3 minimum ||| 0 ||| 1 ||| A CTE (or derived table) stages the rank; the outer query filters. ||| easy
'Customers beating the average customer' compares each with… ||| The max ||| AVG(orders) OVER () over the staged per-customer rows ||| Their own previous ||| Zero ||| 1 ||| The empty-window AVG over staged rows is the mean customer. ||| medium
Windows inside a grouped query see… ||| Raw rows ||| The grouped rows — one per group ||| Nothing ||| The WHERE rows ||| 1 ||| GROUP BY collapses first; windows annotate the collapsed rows. ||| hard
SUM(SUM(x)) OVER () in a grouped query is… ||| Invalid ||| The grand total across groups ||| The group's sum ||| The average ||| 1 ||| Inner SUM folds per group; the windowed SUM of those is the whole pie. ||| hard
Each region's anchor customer (biggest spender per region) is pinned by… ||| GROUP BY region ||| ROW_NUMBER partitioned by region over staged spend, keep rn = 1 ||| MAX(spend) ||| LIMIT 1 ||| 1 ||| Stage the money, rank inside the market, pin the winner outside. ||| hard
Which keeps the WHOLE row of each group's maximum? ||| GROUP BY with MAX ||| ROW_NUMBER partition, keep rn = 1 ||| DISTINCT ||| HAVING ||| 1 ||| GROUP BY folds to the value; the window keeps the row. ||| medium
Months whose revenue beats the average month filter… ||| revenue > AVG(revenue) OVER () — staged, filtered outside ||| revenue > 0 ||| HAVING ||| DISTINCT ||| 0 ||| The above-average sieve on staged month rows. ||| medium
Week buckets in SQLite use… ||| strftime('%W', created_at) ||| MONTH() ||| WEEK() ||| DATEPART ||| 0 ||| SQLite's strftime week directive. ||| medium
Weekday numbers come from… ||| strftime('%w') — 0 is Sunday ||| %W ||| %m ||| %y ||| 0 ||| %w is the weekday; %W is the week number. ||| medium
Deterministic ladders survive re-imports when tiebreaks use… ||| Surrogate ids only ||| Business keys (invoice number) plus ids ||| Random ||| No order ||| 1 ||| Business data is stable; surrogate keys move. ||| hard
The chase list's aging uses… ||| A fixed reference date (like 2025-03-01) ||| date('now') ||| The newest due date ||| RANDOM ||| 0 ||| Fixed dates keep the report reproducible. ||| easy
Days past due for a not-yet-due invoice reads… ||| 0 ||| Negative — the reference date hasn't reached due_on ||| NULL ||| Error ||| 1 ||| julianday(reference) - julianday(due) goes negative before the due date. ||| medium
The bucket for a not-yet-due invoice is… ||| 60+ ||| 'current' — days at or below zero ||| 31-60 ||| 1-30 ||| 1 ||| Not yet due = current. ||| easy
Chase lists rank by… ||| days_past_due DESC ||| amount ASC ||| customer ASC ||| number ASC ||| 0 ||| Worst offenders first. ||| easy
Which fold gives the AR total per customer? ||| SUM(amount_cents) OVER (PARTITION BY customer_id) on open invoices ||| COUNT(*) ||| MAX ||| NTILE ||| 0 ||| The exposure mass per account. ||| easy
Billed versus collected by month needs… ||| Two staged CTEs aligned by month (LEFT JOIN) ||| One window ||| UNION only ||| LAG ||| 0 ||| Two series, one calendar spine — stage then align. ||| medium
The Ads MoM sheet filters… ||| In the staging CTE (WHERE category = 'Ads') ||| After the window ||| In the outer ORDER BY ||| Nowhere ||| 0 ||| Filter early so the LAG walks the category's own months. ||| medium
Rent's monthly share uses… ||| SUM(amount) FILTER (WHERE category = 'Rent') over the monthly total ||| Two queries ||| MAX ||| NTILE ||| 0 ||| The FILTER fold computes the slice inside the month's pie. ||| hard
The command board's growth column is NULL on… ||| Every row ||| The first month — no previous exists ||| The best month ||| Ties ||| 1 ||| The LAG edge — history starts somewhere. ||| easy
The command board's climb (cumulative) completes at… ||| The first month ||| The whole-period revenue ||| Zero ||| The rank ||| 1 ||| The running sum finishes at the total. ||| easy
The command board's rk = 1 belongs to… ||| The earliest month ||| The biggest-revenue month ||| The latest month ||| Alphabetical ||| 1 ||| Rank descending by revenue. ||| easy
Filtering a board to top ranks must happen… ||| Before staging ||| After every window — one more CTE layer ||| In the staging CTE ||| In OVER ||| 1 ||| Early filters would break the LAG chain and the climb. ||| hard
LV bands ('low/mid/high') label… ||| NTILE(3) tiles over spend ||| RANK gaps ||| CUME_DIST halves ||| LAG edges ||| 0 ||| Three tiles, CASE labels, descending walk. ||| medium
'New all-time high' flags compare the total with… ||| The next row ||| MAX(total) OVER the running frame — the peak so far ||| The average ||| The first row ||| 1 ||| Total equals the running peak → a record just landed. ||| medium
The exposure census's average age column uses… ||| AVG(days_past_due) OVER () over the filtered rows ||| MAX(due_on) ||| COUNT ||| NTILE ||| 0 ||| The empty-window AVG beside the count — one dashboard row. ||| medium
Windows can appear… ||| Only in SELECT lists ||| In SELECT lists and ORDER BY ||| In WHERE ||| In GROUP BY ||| 1 ||| Two homes: the projection and the sort — never WHERE/HAVING. ||| hard
The WINDOW clause (named windows) exists to… ||| Rename tables ||| Share one window definition across several functions ||| Filter rows ||| Replace GROUP BY ||| 1 ||| WINDOW w AS (…) — compute once, reuse many times. ||| medium
Which is TRUE about NULLs in window ORDER BY? ||| They error ||| SQLite sorts NULLs first ascending (last descending) — know your engine ||| They're ignored ||| They sort last always ||| 1 ||| NULL placement in sorts is engine-defined; SQLite puts them first ASC. ||| hard
A running total that 'jumps' by several rows at once suggests… ||| Ties + RANGE frame — peers enter together ||| Bad data ||| Wrong table ||| LIMIT ||| 0 ||| RANGE frames include tie peers — switch to ROWS for pure row counting. ||| hard
The safest frame for exact row-count windows is… ||| RANGE ||| ROWS ||| DEFAULT ||| GROUPS ||| 1 ||| ROWS counts physical rows — tie-proof. ||| easy
GROUPS frame (SQL:2011) counts… ||| Columns ||| Peer groups ||| Tables ||| Partitions ||| 1 ||| GROUPS is row-groups-of-peers — a middle ground between ROWS and RANGE. ||| hard
EXCLUDE CURRENT ROW (SQLite 3.28+)… ||| Deletes the row ||| Removes the current row from the frame — the peers-only average ||| Skips sorting ||| Ends the walk ||| 1 ||| The EXCLUDE clause trims the current row out of the frame. ||| hard
Which window ranks products by price WITHIN each supplier? ||| RANK() OVER (PARTITION BY supplier_id ORDER BY price DESC) ||| RANK() OVER (ORDER BY price) ||| GROUP BY supplier ||| NTILE ||| 0 ||| Partition per vendor, order by price — the ladder restarts per shelf. ||| easy
Customer order-count tiles (heavy/medium/light) use… ||| NTILE(3) over staged counts ||| LAG ||| CUME_DIST only ||| COUNT only ||| 0 ||| Stage the counts, deal three tiles. ||| medium
The 'silver' invoice needs… ||| NTH_VALUE(amount, 2) with the full frame ||| FIRST_VALUE ||| MIN ||| LAG ||| 0 ||| Position two of the descending walk, broadcast by the whole-partition frame. ||| medium
Which window would you add beside a census to make it window-flavored? ||| AVG(days_past_due) OVER () as the average age ||| GROUP BY ||| LIMIT ||| DISTINCT ||| 0 ||| The empty-window AVG carries context beside the folded count. ||| medium
Ladder ties on amount_cents break by… ||| number ASC — business-stable ||| RANDOM ||| Nothing ||| DESC only ||| 0 ||| The invoice number is the business key — stable across re-imports. ||| medium
The gap between the two biggest categories is… ||| revenue(1st) - revenue(2nd) via LEAD over the revenue-DESC walk ||| MAX - MIN always ||| COUNT ||| LAG ||| 0 ||| The forward peek on the money ladder measures the drop to the runner-up. ||| medium
First-to-latest account span (days) uses… ||| julianday(LAST_VALUE full frame) - julianday(FIRST_VALUE) — staged ||| COUNT ||| NTILE ||| Nothing ||| 0 ||| Both ends of history, staged into columns, then julianday math. ||| hard
Which window counts HOW MANY invoices each customer has beside every bill? ||| COUNT(*) OVER (PARTITION BY customer_id) ||| SUM(amount) ||| RANK ||| LAG ||| 0 ||| The billing width per account. ||| easy
Order sequence inside its status group uses… ||| ROW_NUMBER() OVER (PARTITION BY status ORDER BY created_at) ||| COUNT ||| MAX ||| NTILE ||| 0 ||| The stage's private chronology. ||| easy
Which is TRUE about PARTITION BY and determinism? ||| Partitions are order-independent ||| Within a partition you still need ORDER BY for ranks/offsets ||| Partitions sort themselves ||| Frames need no order ||| 1 ||| The partition slices; the ORDER BY defines the walk inside each slice. ||| medium
The customer's basket ceiling on every order is… ||| MAX(total) OVER (PARTITION BY customer_id) ||| MIN ||| LAG ||| NTILE ||| 0 ||| Their biggest basket, painted on all their rows. ||| easy
The floor-and-ceiling pair per category is… ||| MIN and MAX over the same partition ||| LAG and LEAD ||| RANK and DENSE_RANK ||| Two CTEs ||| 0 ||| One partition, two whole-partition folds — the corridor. ||| easy
Which best explains 'windows keep every row' to a spreadsheet user? ||| They delete blanks ||| Like adding a grand-total row's value into a new column on every existing row ||| They pivot ||| They filter ||| 1 ||| The spreadsheet analogy: a computed column, not a collapsed table. ||| easy
A windowed query you'd expect to return 16 products returns 7. Why? ||| Windows drop rows ||| A GROUP BY (or DISTINCT) crept into the query ||| SQLite bug ||| Ties ||| 1 ||| Windows never collapse — look for GROUP BY/DISTINCT. ||| medium
Order-count ranks that must show ties together use… ||| ROW_NUMBER ||| RANK with the tie-prone key alone in OVER ORDER BY ||| NTILE ||| LAG ||| 1 ||| Keep the window key tie-prone; hide the tiebreaker in the outer sort. ||| hard
Dense bands appear in UIs where… ||| Gaps are fine ||| The plan/tier list must never skip a level ||| Ties don't exist ||| Rows are unique ||| 1 ||| Gapless tiers for human-facing ladders. ||| easy
Competition ranks appear in UIs where… ||| Gaps confuse users ||| The skip proves the tie — leaderboards, auditors ||| Rows are unique ||| Tiles are used ||| 1 ||| The visible gap is evidence of the tie. ||| medium
The three rank functions take… ||| One argument each ||| No arguments — NTILE is the one that takes n ||| Two arguments ||| Table arguments ||| 1 ||| RANK()/DENSE_RANK()/ROW_NUMBER() are argument-less; NTILE(n) isn't. ||| easy
Which window answers 'how many baskets were cheaper than or equal to mine'? ||| CUME_DIST (as a fraction) ||| RANK (as a position) ||| SUM ||| LAG ||| 0 ||| The distribution counts at-or-below peers; multiply by n for a raw count. ||| medium
Percent of the status pie for one order needs… ||| SUM(total) OVER (PARTITION BY status) as the denominator ||| The global pie ||| The customer pie ||| COUNT ||| 0 ||| Slice the pie by the status partition. ||| medium
Which window would show 'my month's total' on every order? ||| SUM(total) OVER (PARTITION BY the month expression) ||| SUM over all ||| MAX(created_at) ||| RANK ||| 0 ||| Calendar partition, money fold. ||| easy
The exposure census gates… ||| After the window ||| Before the window — WHERE status = 'open' first ||| Never ||| In ORDER BY ||| 1 ||| The gate narrows the world so the census counts real receivables. ||| easy
Aging reference dates that float (date('now')) break… ||| Nothing ||| Reproducibility — every run reports different ages ||| Performance ||| Joins ||| 1 ||| Fixed dates keep aging reports comparable across runs. ||| medium
The chase list's strict ladder comes from… ||| RANK ||| ROW_NUMBER over days_past_due DESC ||| DENSE_RANK ||| NTILE ||| 1 ||| One slot per bill — no shared positions on a call list. ||| easy
Payment-speed bands (1 fastest … 4 slowest) walk… ||| days-to-pay ASC ||| days DESC ||| amount ||| method ||| 0 ||| Ascending speed — band 1 fills with the fastest payers. ||| easy
Spend distribution per customer completes at… ||| 0 ||| 1.0 on the biggest spender ||| 0.5 ||| NULL ||| 1 ||| The walk's end is the maximum. ||| easy
LV bands descending put 'low' in… ||| Tile 3 ||| Tile 1 — the walk starts at the smallest spend ||| No tile ||| Tile 2 ||| 1 ||| DESC walk: tile 1 = smallest spenders. ||| medium
Which window gives 'the month's order count' beside every order? ||| COUNT(*) OVER (PARTITION BY the month expression) ||| SUM(total) ||| MAX(id) ||| RANK ||| 0 ||| Calendar slice, count fold — the month's width. ||| easy
The revenue clock and the order clock differ by… ||| Nothing ||| The fold: SUM(total) walks money, COUNT(*) walks baskets ||| The partition ||| The frame ||| 1 ||| Same skeleton, different aggregate — money versus volume. ||| easy
Which is the BEST first debugging step for a wrong window result? ||| Rewrite in GROUP BY ||| Check the three knobs: partition key, walk order, frame bounds ||| Add indexes ||| Drop ROUND ||| 1 ||| Partition/order/frame — every window is defined by those three. ||| medium
'Every row shows the same number' from a window usually means… ||| Correct running total ||| A whole-partition aggregate (empty OVER or full frame) where a walk was intended ||| A tie bug ||| NULL issue ||| 1 ||| Level versus walk — the frame or the empty OVER is the culprit. ||| medium
'Rows disappeared' from a windowed query usually means… ||| The window dropped them ||| GROUP BY/DISTINCT/HAVING collapsed them — windows never drop rows ||| Frames ||| Ties ||| 1 ||| Windows annotate; collapapsing clauses collapse. ||| easy
To make a ladder provably deterministic you… ||| Add RANDOM ||| Make the window ORDER BY unique with a final tiebreaker ||| Remove ORDER BY ||| Use DISTINCT ||| 1 ||| Unique window keys pin every position between runs. ||| medium
"""

print("B questions:", B_RAW.count("|||") // 8)

def parse(raw):
    qs = []
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        parts = [p.strip() for p in line.split(" ||| ")]
        assert len(parts) == 8, f"BAD ({len(parts)}): {line[:80]}"
        prompt, c0, c1, c2, c3, ans, why, diff = parts
        qs.append(dict(prompt=prompt, choices=[c0, c1, c2, c3], answer=int(ans), why=why, difficulty=diff))
    return qs

qs = parse(B_RAW)
_extra = open("scripts/wf-mcq-extra.txt").read().strip()
qs += parse(_extra)
assert len(qs) == 150, "need 150, got %d" % len(qs)
out = []
out.append("// AUTO-ASSEMBLED by scripts/gen-wf-mcqs2.py — window-functions MCQ bank B (wf-q151..300).")
out.append('import type { Mcq } from "../types";')
out.append("")
out.append("export const mcqsWfB: Mcq[] = [")
for i, q in enumerate(qs):
    out.append("  {")
    out.append('    id: "wf-q%03d",' % (151 + i))
    out.append('    prompt: %s,' % json.dumps(q["prompt"], ensure_ascii=False))
    out.append('    choices: %s,' % json.dumps(q["choices"], ensure_ascii=False))
    out.append('    answer: %d,' % q["answer"])
    out.append('    why: %s,' % json.dumps(q["why"], ensure_ascii=False))
    out.append('    difficulty: "%s",' % q["difficulty"])
    out.append("  },")
out.append("];")
out.append("")
open("src/lib/curriculum/windows/mcqs-b.ts", "w").write("\n".join(out))
print("wrote mcqs-b.ts", len(qs))
