// The SQL band, divided into sections. The first seven mirror the official
// SQL 50 study list (and the sandbox deep-dive files authored per section);
// the remaining sections hold the expansion band — LeetCode's free Database
// extras, three tiers of platform classics, and the LeetCode PREMIUM tier
// (batch 5, re-authored with original schemas/seeds). The LeetCode view
// groups the SQL band by these, and the Module 12 band shows the same
// sections in its card.
//
// Kept import-free on purpose: no cycles, and the section map stays usable
// from scripts and the registry without pulling content blobs.

import type { LcSectionStudy } from "./types";

export interface LcSection {
  /** stable id — used for DOM anchors (`sql-sec-<id>`) and logging */
  id: string;
  /** display title — the group header in the LeetCode view */
  title: string;
  /** one-line "what skill family this is" note under the header */
  blurb: string;
  /** problem slugs in the intended solving order */
  slugs: string[];
  /** optional STUDY GUIDE — detailed learning material rendered under the
   *  header (Data & Finance sections): domain intro, flow diagram, path. */
  study?: LcSectionStudy;
}

export const SQL50_SECTIONS: LcSection[] = [
  {
    id: "select",
    title: "Select Basics",
    blurb:
      "Pick the right rows and columns — WHERE filters, DISTINCT, ORDER BY, renaming and computed columns.",
    slugs: [
      "replace-employee-id-with-unique-identifier",
      "product-sales-analysis-i",
      "product-sales-analysis-ii",
      "product-sales-analysis-iii",
      "employee-bonus",
      "students-and-examinations",
    ],
    study: {
      intro: [
        "Almost no real report lives in one table. A store logs sales in a long fact table (one row per sale, keyed by product id), while the human-readable names sit in a small dimension table (one row per product). SQL's JOIN is the operator that stitches them back together on a shared key — and the first skill of this section is reading a schema well enough to name the key and decide what a row MEANS after the join.",
        "The second skill is choosing the join type on business grounds. INNER JOIN keeps only rows that match on both sides — right for fact × dimension enrichment, wrong when a person can legitimately have no match (an employee with no bonus row must still appear, with NULL). LEFT JOIN keeps every row of the left table and fills the right side with NULLs where nothing matched — and learning to treat those NULLs as DATA, not dirt, is the section's central habit.",
        "The third skill is grain discipline. A join can only multiply or preserve rows; GROUP BY is what changes the grain (sales → per-product totals), and ranking like 'top two years per product' is a POST-aggregate step (ROW_NUMBER inside each group). Every problem here rehearses one of those three moves — enrich, decide NULL policy, then change grain — in that order.",
      ],
      path: [
        { slug: "replace-employee-id-with-unique-identifier", why: "The LEFT JOIN warm-up: the id mapping is optional, so unmatched employees must survive as rows with NULL — the join type follows the business meaning." },
        { slug: "product-sales-analysis-i", why: "The fact × dimension INNER join that attaches product names to sales — the enrichment pattern the next two problems reuse." },
        { slug: "product-sales-analysis-ii", why: "First aggregation over an enriched join: GROUP BY product moves the grain from one-sale-per-row to one-total-per-product." },
        { slug: "product-sales-analysis-iii", why: "Top two years per product: aggregate first, then ROW_NUMBER inside each group — ranking is a post-aggregate step, never a WHERE." },
        { slug: "employee-bonus", why: "The LEFT JOIN where NULL payloads are the ANSWER — bonus < 100 must include the employees whose bonus is NULL, not only small ones." },
        { slug: "students-and-examinations", why: "The CROSS JOIN scaffold builds the full student × subject grid, then COUNT(column) vs COUNT(*) keeps zero-attempt rows honest." },
      ],
    },
  },
  {
    id: "joins",
    title: "Basic Joins",
    blurb:
      "Inner and left joins across two tables — matching keys, anti-joins via IS NULL, and first self-joins.",
    slugs: [
      "combine-two-tables",
      "employees-earning-more-than-their-managers",
      "duplicate-emails",
      "customers-who-never-order",
      "article-views-i",
      "article-views-ii",
      "sales-person",
      "sales-analysis-i",
      "sales-analysis-ii",
      "sales-analysis-iii",
    ],
    study: {
      intro: [
        "A join is set logic wearing a data costume. Two tables share a key; the join pairs rows across them — INNER keeps mutual matches, LEFT keeps everything from one side, and the aliases you pick decide which table plays which role. This section is where joins stop being syntax and start being reasoning: who must appear even without a match, and who must NOT appear because they have one.",
        "Two derived shapes do most of the interview work. The ANTI-JOIN asks for rows on one side with no partner on the other — expressed as LEFT JOIN … WHERE right.key IS NULL (or NOT IN/NOT EXISTS, with NULL-handling caveats the subqueries section revisits). The SELF-JOIN puts one table on both sides under two aliases — an Employee table is simultaneously the staff list and the org chart, and a manager_id column is just a foreign key pointing at a row of its own table.",
        "The stealth skill is filter placement. On an INNER join, ON and WHERE behave the same; on an OUTER join they are NOT interchangeable — a right-side predicate belongs in ON if unmatched left rows must survive, and in WHERE if they may be discarded. And once joins multiply rows, group-level questions (who did X twice, who sold ONLY in one quarter) move into HAVING with COUNT(DISTINCT …) or conditional SUMs — never into WHERE.",
      ],
      path: [
        { slug: "combine-two-tables", why: "The canonical LEFT JOIN: people without an address record are part of the answer, with NULL city and state — NULL is the answer, not an error." },
        { slug: "customers-who-never-order", why: "The canonical anti-join: LEFT JOIN … WHERE orders.customer_id IS NULL — ask for the absent partner explicitly." },
        { slug: "employees-earning-more-than-their-managers", why: "The first self-join: one Employee table under two aliases, joined on managerId = id, compared on salary." },
        { slug: "duplicate-emails", why: "Group-level existence: GROUP BY email + HAVING COUNT(*) > 1 — duplication is a property of a GROUP, not of a row." },
        { slug: "article-views-i", why: "Intra-row logic: the author-viewer match is a comparison between two columns of the SAME row — no join needed, plus DISTINCT." },
        { slug: "article-views-ii", why: "Composite grain: group by (viewer, day) and gate on COUNT(DISTINCT article_id) — DISTINCT stops same-article re-reads from faking the pair." },
        { slug: "sales-person", why: "Filter placement: RED orders are excluded BEFORE the anti-join — a WHERE inside the join changes who survives as unmatched." },
        { slug: "sales-analysis-i", why: "Ties at the top: aggregate to per-product totals, then keep every row tied at the MAX — a subquery, not a LIMIT." },
        { slug: "sales-analysis-ii", why: "Subtraction via NOT IN: buyers minus buyers-of-the-thing — set difference expressed over resolved names." },
        { slug: "sales-analysis-iii", why: "Purity check: conditional SUMs per quarter inside HAVING — 'all sales in one quarter' is a group property." },
      ],
    },
  },
  {
    id: "aggregation",
    title: "Basic Aggregation",
    blurb:
      "COUNT, SUM, AVG over groups — aggregate first, join second, and filter groups with HAVING not WHERE.",
    slugs: [
      "not-boring-movies",
      "average-selling-price",
      "project-employees-i",
      "percentage-of-users-attended-a-contest",
      "queries-quality-and-percentage",
      "average-time-of-process-per-machine",
      "managers-with-at-least-5-direct-reports",
      "confirmation-rate",
    ],
    study: {
      intro: [
        "An aggregate is a promise to change grain: COUNT, SUM, AVG and friends collapse many rows into one per group. Everything tricky about aggregation flows from that promise. AVG answers 'mean per row of the group' — so a weighted average (price weighted by units sold) is NOT an AVG of a joined column but a ratio of two SUMs. And a percentage is often an AVG of a boolean, because SQLite sums TRUE as 1 and FALSE as 0.",
        "Filtering follows the grain. WHERE runs before grouping and speaks row-language; HAVING runs after and speaks group-language — 'at least five direct reports' is a group property, so it lives in HAVING. Denominators deserve special suspicion: 'what share of ALL users attended this contest' needs the total as a scalar subquery (or a window COUNT(*) OVER ()), not the per-group count that happens to be in scope.",
        "Two join-shaped traps anchor the section. A RANGE join (sale date BETWEEN a price period's start and end) pairs rows by predicate instead of equality — and the weighted-average question it feeds divides SUM(value×qty) by SUM(qty), with an explicit float cast to dodge integer division. And a role-pinned self-join pairs a 'start' row with its matching 'end' row — duration aggregates only exist once those two roles are told apart.",
      ],
      path: [
        { slug: "not-boring-movies", why: "The warm-up: a WHERE predicate plus a deterministic ORDER BY — filtering and sorting before any grouping exists." },
        { slug: "project-employees-i", why: "Join-then-group: AVG(experience) per project with ROUND — the plainest join × aggregate composition." },
        { slug: "percentage-of-users-attended-a-contest", why: "The denominator move: per-group COUNT over a scalar-subquery total of ALL users, with float division forced explicitly." },
        { slug: "average-selling-price", why: "The range join: date BETWEEN period bounds pairs each sale with its price window — then the weighted average is SUM(price×qty)/SUM(qty), not AVG." },
        { slug: "queries-quality-and-percentage", why: "One pass, two aggregates: AVG of per-row ratios plus a boolean-SUM percentage — two different 'averages' in the same GROUP BY." },
        { slug: "average-time-of-process-per-machine", why: "The role-pinned self-join: pair each 'start' row with its 'end' row before any AVG of durations makes sense." },
        { slug: "managers-with-at-least-5-direct-reports", why: "GROUP BY the FK, HAVING the threshold, then join back for names — group filtering happens before the cosmetic join." },
        { slug: "confirmation-rate", why: "AVG of a boolean IS the rate — and COALESCE zero-fills the users who never confirmed, so silence reads as 0% instead of NULL." },
      ],
    },
  },
  {
    id: "grouping",
    title: "Sorting & Grouping",
    blurb:
      "Per-group winners and cleanups — dedupes, second-highest patterns, ranking and grouped string building.",
    slugs: [
      "fix-names-in-a-table",
      "patients-with-a-condition",
      "delete-duplicate-emails",
      "second-highest-salary",
      "department-highest-salary",
      "rank-scores",
      "classes-more-than-5-students",
      "group-sold-products-by-the-date",
      "immediate-food-delivery-ii",
    ],
    study: {
      intro: [
        "GROUP BY is schema surgery: it decides what one row of the result IS. This section lives one level past the aggregation basics — here grouping is the tool that finds winners (the highest salary per department, with ALL its ties), cleans tables (delete every duplicate but the oldest row), and pivots rows into lists (GROUP_CONCAT building 'A, B, C' per day).",
        "Ranking is the big new instrument. RANK() OVER (ORDER BY score DESC) numbers rows WITHOUT collapsing them — ties share a rank and the next rank is skipped, which is exactly why 'second highest salary' is safer as a ranking or DISTINCT + OFFSET question than as MAX(MAX(s)). 'Top three per department' then adds PARTITION BY — a window computed per group rather than over the whole table.",
        "The section's write problem closes the loop: DELETE carries the same group logic as SELECT. 'Keep one row per email' is 'keep the row whose id equals MIN(id) within its email group' — expressed as id NOT IN (SELECT MIN(id) … GROUP BY email). Every cleanup, winner-pick and list-build here is a grouping question in disguise, and the ladder teaches you to name the grain before writing any clause.",
      ],
      path: [
        { slug: "fix-names-in-a-table", why: "String normalization as slice-shift-glue: UPPER(first letter) + LOWER(rest) — per-character surgery before any grouping." },
        { slug: "patients-with-a-condition", why: "Two-arm LIKE with a space as the word boundary — matching DIAB1 as a prefix OR after a space, but never inside DIAB10." },
        { slug: "classes-more-than-5-students", why: "The purest grain filter: GROUP BY class + HAVING COUNT(*) >= 5 — HAVING speaks group-language WHERE cannot." },
        { slug: "rank-scores", why: "The first window function: RANK() OVER (ORDER BY score DESC) — ties share a rank and the sequence skips, without collapsing rows." },
        { slug: "second-highest-salary", why: "DISTINCT + LIMIT/OFFSET wrapped in a scalar subquery — and the outer SELECT turns a missing second place into NULL, as asked." },
        { slug: "department-highest-salary", why: "Pair-set membership: (dept, salary) IN (SELECT dept, MAX(salary) … GROUP BY dept) keeps ALL ties — a LIMIT would silently drop them." },
        { slug: "group-sold-products-by-the-date", why: "GROUP_CONCAT(DISTINCT …) pivots rows into a sorted list per day — grouping as string building." },
        { slug: "immediate-food-delivery-ii", why: "Two grains in one query: ROW_NUMBER picks each customer's first order, then a boolean ratio measures immediacy over those firsts." },
        { slug: "delete-duplicate-emails", why: "The write problem: DELETE id NOT IN (SELECT MIN(id) … GROUP BY email) — group logic driving a mutation, keeping the oldest row." },
      ],
    },
  },
  {
    id: "advanced-select",
    title: "Advanced Select",
    blurb:
      "Multi-table reports — conditional aggregation, running rankings and date-window filters done properly.",
    slugs: [
      "movie-rating",
      "list-the-products-ordered-in-a-period",
      "immediate-food-delivery-i",
      "number-of-employees-who-met-the-target",
    ],
    study: {
      intro: [
        "Ordinary SELECT reports the data that is there. Advanced SELECT computes the data that ISN'T — it branches (CASE WHEN … THEN … ELSE), counts conditionally (SUM of a boolean), and stacks unrelated results into one grid (UNION ALL). The common thread: the SELECT list stops being a passthrough of stored columns and becomes a small program evaluated per row or per group.",
        "CASE is the workhorse. Inline in the select list it turns a raw fact into a label ('special bonus granted' vs NULL); inside an aggregate it becomes conditional aggregation — SUM(CASE WHEN type = 'refund' THEN 1 ELSE 0 END) counts only the rows that qualify, and AVG of a boolean flag IS a percentage in one expression. Once you see it, half of interview SQL is CASE wearing different hats.",
        "UNION ALL solves the opposite problem: two questions with DIFFERENT grains that must ship as one result ('the movie with the most ratings' and 'the user who rated the most' have nothing to group over together — but they share column names, so the UNION stitches them row-wise). The discipline is matching column lists and remembering that UNION ALL keeps duplicates while plain UNION dedupes at a cost.",
      ],
      path: [
        { slug: "number-of-employees-who-met-the-target", why: "The simplest conditional count: boolean-SUM (or COUNT after WHERE) — one gate, one number." },
        { slug: "immediate-food-delivery-i", why: "AVG of an immediate-flag boolean IS the percentage — conditional aggregation as a one-expression rate." },
        { slug: "list-the-products-ordered-in-a-period", why: "The full filter → group → gate pipeline: month filter, GROUP BY product, HAVING SUM(quantity) >= 100." },
        { slug: "movie-rating", why: "UNION ALL of two top-1 subqueries — different grains, one grid; each arm orders and LIMITs independently." },
      ],
    },
  },
  {
    id: "subqueries",
    title: "Subqueries",
    blurb:
      "Nested thinking — IN, EXISTS, correlated subqueries, derived tables and CTEs that split hard asks into steps.",
    slugs: [
      "employees-whose-manager-left-the-company",
      "game-play-analysis-iv",
      "exchange-seats",
      "game-play-analysis-v",
      "investments-in-2016",
      "department-top-three-salaries",
      "average-salary-of-departments",
    ],
    study: {
      intro: [
        "A subquery is a query used as a VALUE. A scalar subquery stands where a number would (the total user count in a denominator); an IN-list subquery stands where a set would (the emails that appear twice); a derived-table subquery stands where a table would (a per-customer 'first order' CTE). CTEs — the WITH clause — give any of these a NAME, which is what turns a four-level nested query into something you can actually read.",
        "The correlated subquery is the power move: the inner query references the outer row, so it re-runs per row — 'exists a prompt above THIS user's average'. EXISTS is usually the honest spelling of that idea, and unlike IN it never stumbles over NULLs. The NOT IN trap, by contrast, is the section's rite of passage: if the inner list contains a single NULL, NOT IN returns nothing at all — the employees-whose-manager-left problem pins that guard.",
        "The last skill is composing steps. 'Fraction of players who logged in the day after their first login' decomposes into: compute firsts (CTE), join next-day logins, divide with a guarded denominator. 'Top three salaries per department' decomposes into: DENSE_RANK partitioned by department, then filter rank <= 3. Interview SQL is nearly always two or three named steps — and the CTE is where each step gets its name.",
      ],
      path: [
        { slug: "employees-whose-manager-left-the-company", why: "The NOT IN NULL trap: one NULL in the inner list silently empties NOT IN — guard it (or switch to NOT EXISTS)." },
        { slug: "game-play-analysis-iv", why: "First-login CTE + next-day join + a fraction whose denominator is ALL players — named steps, guarded division." },
        { slug: "exchange-seats", why: "Parity CASE in the select list: swap each seat with its neighbor, and the last odd seat stays put — branching without a join." },
        { slug: "game-play-analysis-v", why: "Firsts CTE + LEFT JOIN + COUNT(*) vs COUNT(column) — the day-1 retention fraction where NULL rows still count in the denominator." },
        { slug: "investments-in-2016", why: "Two independent group tests ANDed together: a HAVING sum gate plus a row-value IN over duplicate (lat, lon) pairs." },
        { slug: "department-top-three-salaries", why: "DENSE_RANK() PARTITION BY department, keep rank <= 3 — top-three VALUES with ties, not top-three rows." },
        { slug: "average-salary-of-departments", why: "Two-grain CTEs joined on the month key — per-employee monthly pay rolled up to per-department monthly averages, then compared." },
      ],
    },
  },
  {
    id: "strings",
    title: "Strings & CASE",
    blurb:
      "Branchy reporting — CASE WHEN logic, string functions and the last-mile formatting interviewers love.",
    slugs: [
      "the-number-of-employees-which-report-to-each-employee",
      "primary-department-for-each-employee",
      "triangle-judgement",
      "capital-gain-loss",
      "top-travellers",
      "market-analysis-i",
      // 50+ additions — includes the band's write problem (UPDATE)
      "invalid-tweets",
      "calculate-special-bonus",
      "swap-salary",
    ],
    study: {
      intro: [
        "Strings are where reports meet humans: names with messy casing, codes packed into space-separated lists, tweets a few characters over the limit. SQL's text kit is small but sharp — LENGTH for size gates, LIKE/GLOB for shapes, UPPER/LOWER/SUBSTR/CONCAT for surgery — and this section teaches you to compose those atoms into validation and formatting rules.",
        "CASE deserves its co-billing in the title. Inside the select list it renders a decision per row (is three sides a triangle? who gets the special bonus?); inside SUM it turns signed bookkeeping into one aggregate (capital gains as SUM of +sell-price and −buy-price); inside an UPDATE's SET it rewrites values in place (the self-inverse salary swap). One construct, three completely different jobs.",
        "Two quiet habits separate clean text SQL from fragile SQL. First, anchors: LIKE 'M%' and NOT LIKE 'M%' mean STARTS-with — unanchored patterns match anywhere and silently over-select. Second, nullability at the edges: a LEFT JOIN's missing text must be COALESCE'd before it lands in a report, and COUNT(column) vs COUNT(*) decides whether missing rows count at all. Both habits show up as the section's boundary traps.",
      ],
      path: [
        { slug: "the-number-of-employees-which-report-to-each-employee", why: "Self-join + GROUP BY manager: counting people under each lead, with the NULL-at-the-top chain handled by the join." },
        { slug: "primary-department-for-each-employee", why: "Window COUNT per employee + a two-rule OR — the primary flag wins, but a lone membership is primary by default." },
        { slug: "triangle-judgement", why: "CASE over the three pair-sum inequalities — boolean logic rendered as a label per row." },
        { slug: "capital-gain-loss", why: "Signed-CASE aggregation: SUM of +sell-price and −buy-price per stock — bookkeeping as one aggregate." },
        { slug: "top-travellers", why: "LEFT JOIN + COALESCE(SUM(…), 0) — users who never travelled must read 0, not NULL, in the ranked report." },
        { slug: "market-analysis-i", why: "The anti-join with the filter in ON: excluding 2021 purchases in the join keeps the never-buyers visible in the result." },
        { slug: "invalid-tweets", why: "LENGTH() in WHERE: content validation as a row filter — and the seed pins the exact 15-character boundary." },
        { slug: "calculate-special-bonus", why: "One CASE carries the whole rule — the anchored NOT LIKE gate plus id parity decide who gets the bonus multiplier." },
        { slug: "swap-salary", why: "The band's UPDATE problem: a self-inverse CASE in SET swaps 'f' and 'm' in one statement — no temp column, no double update." },
      ],
    },
  },
  {
    id: "extra-joins",
    title: "Joins & Relationships",
    blurb:
      "Beyond the 50 — lookup joins, composite keys, unordered-pair canonicalization and the symmetric-difference anti-join.",
    slugs: [
      "npv-queries",
      "bank-account-summary-ii",
      "number-of-calls-between-two-persons",
      "employees-with-missing-information",
    ],
    study: {
      intro: [
        "Past the first 50, the join key itself becomes a decision. A lookup table may match on a COMPOSITE key — both id and year must agree, and joining on id alone fans one row out to many, attaching valuations from the wrong year. The filter you apply may also only exist after aggregation: a bank 'balance' is not stored anywhere, it is SUM(amount) grouped by account, which means the report's threshold filter is a HAVING, not a WHERE — WHERE runs before the aggregate exists and cannot see it.",
        "Some facts hide in two directions at once. A calls table records 1→2 and 2→1 as different rows, but the question 'total calls between the two' counts them as one pair — the fix is CANONICALIZATION: rewrite each row's endpoints as (smaller, larger) with SQLite's two-argument scalar min(a, b) / max(a, b), and a plain GROUP BY counts what direction used to split. The same normalize-then-group move handles edges in graphs and URLs in analytics.",
        "And when both sides can hold the missing rows, SQLite has no FULL OUTER JOIN to lean on — the portable answer is the SYMMETRIC DIFFERENCE: rows of A absent from B (LEFT JOIN … WHERE B.key IS NULL), UNIONed with rows of B absent from A. Choosing inner vs left vs anti is a business question — who must appear even with no match, and who must NOT appear because they have one — and this section makes you answer it explicitly every time.",
      ],
      path: [
        { slug: "npv-queries", why: "The composite-key left join: every question must appear, and the match needs BOTH id and year — joining on id alone fans rows out to the wrong valuations." },
        { slug: "bank-account-summary-ii", why: "A balance is computed, not stored: SUM per account first, HAVING the threshold second — the join is inner by design because the report asks about KNOWN balances." },
        { slug: "number-of-calls-between-two-persons", why: "Canonicalize the unordered pair: scalar min(a,b)/max(a,b) rewrite both directions to (smaller, larger), and one GROUP BY counts what direction used to split." },
        { slug: "employees-with-missing-information", why: "The symmetric difference: no FULL OUTER JOIN in SQLite, so two anti-joins — one per direction — UNION into the full set of mismatched ids." },
      ],
    },
  },
  {
    id: "extra-aggregation",
    title: "Aggregation & Reporting",
    blurb:
      "Beyond the 50 — argmax and tie handling, distinct counting, per-day ratios and the aggregate-of-aggregates pattern.",
    slugs: [
      "game-play-analysis-i",
      "customer-placing-the-largest-number-of-orders",
      "biggest-single-number",
      "actors-and-directors-who-cooperated-at-least-three-times",
      "project-employees-ii",
      "reported-posts",
      "daily-leads-and-partners",
      "find-followers-count",
      "find-total-time-spent-by-each-employee",
      "number-of-rich-customers",
    ],
    study: {
      intro: [
        "Reporting is aggregation with an audience: the output is a table someone will read, so the GRAIN — one row per what? — is the first decision, the aggregate is the second, and the denominator is the standing trap. This section runs the whole ladder, from the hello-world collapse (GROUP BY + MIN per player) to a day-level ratio that divides two different counts computed in the same pass.",
        "The argmax family deserves its own habit. ORDER BY the count DESC + LIMIT 1 is the simple idiom, but it silently promises the maximum is unique — the moment ties matter, the shape becomes HAVING count = (SELECT MAX of the per-group counts), which keeps every winner. Its cousin is the aggregate-of-aggregates: filter groups with HAVING, then wrap an outer MAX over what survives — and that outer aggregate is load-bearing even when nothing survives, because MAX over zero rows correctly produces the one-NULL-row answer the spec asks for.",
        "Counting has flavors, and confusing them is the classic reporting bug. COUNT(*) counts rows (events); COUNT(DISTINCT x) counts entities (people, products) — a day's 'average reports per post' divides the first by the second, after the filter has run in WHERE. Derived metrics (duration = out_time − in_time) are computed per row and SUM'd per group, and the group key must carry the report's full grain — (day, employee), not employee — or the totals silently merge across the boundary you meant to keep.",
      ],
      path: [
        { slug: "game-play-analysis-i", why: "The hello-world collapse: GROUP BY + MIN(event_date) per player — no join, no window, and MIN works on dates because ISO strings sort in calendar order." },
        { slug: "find-followers-count", why: "The smallest complete report in three clauses: group key = entity, COUNT(*) = metric, ORDER BY formats — and grouping by the wrong column answers a different business question." },
        { slug: "number-of-rich-customers", why: "Rows vs entities: the evidence is transactions but the question is people — COUNT(DISTINCT customer_id) after the WHERE, not COUNT(*), which would count bills." },
        { slug: "find-total-time-spent-by-each-employee", why: "Derived metrics: duration = out_time − in_time computed per row, SUM'd per (day, emp) — forget the day in the group key and two sessions on different days merge into a meaningless total." },
        { slug: "daily-leads-and-partners", why: "Two flavors of COUNT side by side: raw rows are events, COUNT(DISTINCT) counts entities — one composite GROUP BY, both truths in one row." },
        { slug: "customer-placing-the-largest-number-of-orders", why: "The argmax idiom: ORDER BY COUNT DESC + LIMIT 1 — simple, but it silently promises the maximum is unique, which is exactly what the next problem breaks." },
        { slug: "project-employees-ii", why: "The tie-proof argmax: compute the best headcount as a scalar subquery, keep every project matching it in HAVING — LIMIT 1 is disqualified the moment ties matter. (The Employee table is a decoy.)" },
        { slug: "biggest-single-number", why: "The aggregate-of-aggregates: HAVING COUNT(*) = 1 keeps singletons, an outer MAX wraps the survivors — and stays load-bearing when nothing survives, returning the required one-NULL row." },
        { slug: "actors-and-directors-who-cooperated-at-least-three-times", why: "A threshold on a composite pair: GROUP BY (actor, director), HAVING COUNT(*) >= 3 — and read the spec before canonicalizing direction, because (1,2) and (2,1) are different pairs here." },
        { slug: "reported-posts", why: "The ratio report: COUNT(*) / COUNT(DISTINCT post_id) per day computes both sides of the fraction in one pass — spam filter in WHERE, float cast to survive integer division." },
      ],
    },
  },
  {
    id: "extra-dates",
    title: "Dates & Times",
    blurb:
      "Beyond the 50 — ISO string slicing for month buckets, half-open year ranges and why canonical dates sort correctly.",
    slugs: [
      "monthly-transactions-i",
      "fix-product-name-format",
      "the-latest-login-in-2020",
    ],
    study: {
      intro: [
        "Dates in SQLite are strings with a contract: store them as fixed-width ISO-8601 ('YYYY-MM-DD') and lexicographic comparison becomes calendar comparison — MIN and MAX work on them directly, ORDER BY sorts them chronologically, and SUBSTR(trans_date, 1, 7) slices off a clean 'YYYY-MM' month bucket. Every guarantee in this section flows from that format; the moment dates become free-form text ('Mar 3, 2016'), all of it dies, which is why real schemas store dates canonically and format them only at the edge.",
        "Time-window filters want the HALF-OPEN range: time_stamp >= '2020-01-01' AND time_stamp < '2021-01-01'. It includes New Year's Eve 23:59:59 without any inclusive-endpoint gymnastics — comparing to '2020-12-31' instead silently drops everything on the last day after midnight, the classic inclusive-date bug. Filtering to the window BEFORE the aggregate is also what makes row-level exclusion free: users with no 2020 rows simply never enter the grouping, no HAVING gymnastics needed.",
        "Two habits round the section out. Derive buckets before grouping: GROUP BY the derived month, not the raw day. And clean keys before grouping: normalize dirty text (TRIM, UPPER, concatenation) in an inner SELECT, then GROUP BY the clean column — grouping by the raw column keeps ' LCPhone' and 'lcPhone ' as separate buckets and the report lies. Conditional aggregation — SUM(CASE WHEN state = 'approved' THEN amount END) — makes a subset metric ride along in the same pass as the total, the pattern behind every funnel and reconciliation report.",
      ],
      path: [
        { slug: "monthly-transactions-i", why: "One pass, four metrics: two unconditional aggregates plus two approved-only CASE columns, grouped by the SUBSTR'd 'YYYY-MM' month bucket derived from the ISO date." },
        { slug: "fix-product-name-format", why: "Clean the key before grouping: TRIM then UPPER(first letter) || LOWER(rest) in an inner SELECT, then GROUP BY the clean column — or the raw variants report as separate products." },
        { slug: "the-latest-login-in-2020", why: "The half-open year filter: >= '2020-01-01' AND < '2021-01-01' keeps Dec 31 fully inside, then MAX per user — row filter first, aggregate second, and absent users exclude themselves." },
      ],
    },
  },
  {
    id: "extra-pivots",
    title: "Pivots & Hierarchies",
    blurb:
      "Beyond the 50 — reshaping wide↔long with CASE and UNION ALL, and walking org trees with a recursive CTE.",
    slugs: [
      "reformat-department-table",
      "rearrange-products-table",
      "all-people-report-to-the-given-manager",
    ],
    study: {
      intro: [
        "Two reshape directions, no keywords. PIVOT turns rows into columns — one output column per month — and UNPIVOT turns columns back into rows, where the conceptual move is that a column NAME becomes a VALUE. SQLite has neither PIVOT nor UNPIVOT, so both are built by hand: MAX(CASE WHEN …) repeated once per output column going wide, UNION ALL over single-column projections going long.",
        "Why MAX(CASE)? Each CASE acts as a per-group value extractor: it keeps the matching rows' value and NULLs the rest, and MAX ignores NULLs, lifting exactly the one real value per bucket. SUM would also work when each key appears once, but it implies addition that never happens — MAX expresses 'the value', which is what you mean. And absent members stay NULL because the CASE never fired: that NULL is data ('this product was not sold here', 'no revenue that month'), not dirt.",
        "Hierarchies are the third dimension. Org charts are trees of unbounded depth, and plain joins cannot walk 'any depth' without knowing it in advance. The RECURSIVE CTE is the tool: an anchor (the head's direct reports) UNIONed with a step (everyone whose manager is already in the set), executed until nothing new appears. Carry a distance column — the anchor seeds 1, each step adds one to the row it extends from — and every level labels its own depth with no post-hoc counting.",
      ],
      path: [
        { slug: "reformat-department-table", why: "The manual pivot: one MAX(CASE WHEN month = 'x' THEN revenue END) per output column, GROUP BY id — MAX lifts the real value and leaves absent months honestly NULL." },
        { slug: "rearrange-products-table", why: "The manual unpivot: three single-column projections UNION ALL'd with the store name SELECTed as a literal — the column name becomes data, and per-branch IS NOT NULL filters kill the gaps." },
        { slug: "all-people-report-to-the-given-manager", why: "The recursive CTE: anchor at direct reports, step down the tree, carry a distance column so every level labels its own depth — the seed reads like a depth ruler." },
      ],
    },
  },
  {
    id: "platform-classics",
    title: "Platform Classics",
    blurb:
      "The famous non-LeetCode interview staples — HackerRank and DataLemur-flavored tasks, re-authored and sandbox-graded.",
    slugs: [
      "top-earners",
      "station-median",
      "company-hierarchy-counts",
      "ratings-histogram",
      "top-five-artists",
    ],
    study: {
      intro: [
        "This section collects the famous non-LeetCode staples — the problems that opened interviews before the SQL 50 existed and still open them today. What unites them is a derived metric at center stage: salary × months is not a column, so every clause that references earnings must recompute or GROUP BY the expression itself — SQLite happily groups by an expression, treating equal products as one bucket. And the outputs are shapes plain GROUP BY cannot produce: a median, a histogram of averages, a top-5 with deterministic ties.",
        "Order statistics and stacked grains. SQL has no MEDIAN — you build it from ROW_NUMBER positions plus COUNT(*) OVER () echoing the total onto every row, with the dual-slot trick: the middle slots are (n+1)/2 and (n+2)/2, and integer division makes BOTH formulas pick the same single row when n is odd and the correct pair when n is even, so AVG over the selection is the median by definition. Aggregate-of-aggregates is always TWO layers — per-user AVG in a CTE, then COUNT of rounded buckets outside — because nesting them in one SELECT mixes grains and is illegal.",
        "Honesty under fan-out, and determinism as a spec. Five chained FK joins multiply rows into cross products (2×2×2×3 = 24 rows for one company), and only COUNT(DISTINCT tier_id) keeps the headcounts true — the joined grain (one row per leaf path) differs from every metric's grain (people per tier), and noticing that IS the problem. Ties are why ORDER BY is a LIST, not a value: every order-exact output needs a complete tie-breaker chain like (total DESC, name ASC), because a sort that doesn't fully determine order lets the engine return tied rows arbitrarily — and the grader compares row order.",
      ],
      path: [
        { slug: "top-earners", why: "The derived-metric GROUP BY: salary × months grouped as an expression, then the top bucket cut out whole — a tie count wearing a MAX costume." },
        { slug: "station-median", why: "Build a median from order statistics: ROW_NUMBER for sorted position, COUNT(*) OVER () for n, the dual-slot trick — one row for odd n, the pair for even n, AVG over the selection." },
        { slug: "company-hierarchy-counts", why: "The fan-out audit: five chained joins multiply rows into paths, and COUNT(DISTINCT) per tier is the only count that survives the cross product honestly." },
        { slug: "ratings-histogram", why: "Two stacked grains: per-user AVG in a CTE, then COUNT of ROUND(avg) buckets — and ROUND's half-away-from-zero is planted at exactly .5 three times in the seed." },
        { slug: "top-five-artists", why: "Aggregation then top-k with a two-key ORDER BY: (total DESC, name ASC) is the complete tie-breaker chain an order-exact grader demands." },
      ],
    },
  },
  {
    id: "windows-2",
    title: "Window Functions II",
    blurb:
      "Beyond the 50 — window aggregates that never collapse rows, RANK-based argmin with ties, as-of pricing and streak detection.",
    slugs: [
      "find-the-team-size",
      "project-employees-iii",
      "product-price-at-a-given-date",
      "active-users",
    ],
    study: {
      intro: [
        "Window functions answer the questions GROUP BY structurally cannot: they compute over a group but return one value PER ROW, never collapsing anything. COUNT(*) OVER (PARTITION BY team_id) walks the employees one at a time and, for each, counts all rows sharing its team — the count just rides along as a new column while the roster stays intact. GROUP BY would shrink the table to one row per team and you'd have to join the ids back; the window version needs no join, no subquery, no second pass.",
        "The ranking family turns argmin/argmax into a one-liner that handles ties. RANK() OVER (PARTITION BY project ORDER BY experience) numbers each group's rows with ties sharing a rank, and WHERE rnk = 1 keeps every row tied at the top — the whole answer to 'who is the least experienced', all of them, which LIMIT 1 could never promise. Point-in-time questions compose with it: filter FIRST (WHERE change_date <= snapshot runs before the window is computed), then ROW_NUMBER … ORDER BY change_date DESC and keep rn = 1 — skip the pre-filter and tomorrow's price wins the ranking.",
        "The payoff trick is streak detection. GROUP BY is blind to sequence — it sees bags, not orderings — so 'N consecutive days' is unreachable by aggregation alone. ROW_NUMBER restores the timeline: number each user's distinct days 1..k by date, then compute the anchor date minus (row_number − 1) days. On a truly consecutive run, the calendar and the row number advance in lockstep, so the shifted values COLLAPSE to one constant — and 'consecutive' becomes a plain GROUP BY counting the members of each collapsed constant. Once you see date − rn, you see it everywhere: gaps-and-islands is this trick plus a step counter.",
      ],
      path: [
        { slug: "find-the-team-size", why: "The hello-world window aggregate: COUNT(*) OVER (PARTITION BY team_id) rides the count onto every row — GROUP BY would shrink the roster away and force a join to get ids back." },
        { slug: "project-employees-iii", why: "Argmin with ties: RANK() per project ordered by experience, keep rank 1 — every least-experienced member survives, which LIMIT 1 could never promise." },
        { slug: "product-price-at-a-given-date", why: "The as-of snapshot: filter to change_date <= the date FIRST (WHERE runs before the window), then ROW_NUMBER DESC keeps each product's latest surviving change — plus a UNION ALL default-price branch." },
        { slug: "active-users", why: "The streak anchor: number each user's distinct days with ROW_NUMBER, then GROUP BY date minus (rn − 1) days — consecutive runs collapse to one constant and count themselves." },
      ],
    },
  },
  {
    id: "self-non-equi",
    title: "Self & Non-Equi Joins",
    blurb:
      "A table joined to itself — parent/child classification, seat adjacency, inequality geometry and comment trees.",
    slugs: [
      "tree-node",
      "consecutive-available-seats",
      "rectangle-area",
      "number-of-comments-per-post",
    ],
    study: {
      intro: [
        "A self-join puts one table on both sides under two aliases — and the alias is the role. In a seats table, alias 'a' is the left seat of a pair and 'b' the right; in an Employee table, one copy is the staff list and the other the org chart. Most self-joins are equality joins on a SHIFTED key: b.seat_id = a.seat_id + 1 turns the English word 'adjacent' into arithmetic in the ON clause, and the directional offset does double duty — every pair emits exactly once, as (a, b) with a < b, no dedupe needed.",
        "The NON-EQUI join drops equality entirely: ON p1.id < p2.id AND p1.x <> p2.x AND p1.y <> p2.y manufactures pairs with pure predicates instead of looking them up. Under the hood there is no hash or index fast-path for 'different' — it is a nested loop with a filter, O(n²) pairs at n rows. That is fine at interview scale (hundreds of rows) and the canonical place to say out loud: 'this is O(n²) and I know it'. The id ordering in the ON clause is also what canonicalizes the output — each pair once, never both directions.",
        "Two companions finish the toolkit. Ordered CASE branches encode a PRIORITY CONTRACT: branches evaluate top-down and stop at the first hit, so Root = p_id IS NULL must be tested before parent-membership — the root is usually also a parent, and the wrong order lets that branch steal it. And when the aggregation must not disturb the outer rows, a CORRELATED SUBQUERY counts in place — one scalar per row, no GROUP BY anywhere, because the count collapses the subquery's rows, not the report's. The zero case comes free: a post with no children counts an empty set, which is 0.",
      ],
      path: [
        { slug: "tree-node", why: "The ordered CASE: Root's NULL gate must run before parent-membership, or the root — usually also a parent — gets stolen by the wrong branch." },
        { slug: "consecutive-available-seats", why: "Adjacency as arithmetic: alias the table twice and join b.seat_id = a.seat_id + 1 — each seat matches at most one partner, and the +1 offset canonicalizes every pair." },
        { slug: "rectangle-area", why: "The non-equi join: no key anywhere — id-ordered pairs plus x≠x, y≠y predicates manufacture the matches, an O(n²) nested loop you name out loud." },
        { slug: "number-of-comments-per-post", why: "The correlated count: one scalar subquery per post row, zero GROUP BY — the count collapses the subquery's rows, not the report's, so zero-comment posts count 0 for free." },
      ],
    },
  },
  {
    id: "analytics-funnels",
    title: "Analytics & Funnels",
    blurb:
      "Product-flavored asks — per-user rates over a window, bought-A-and-B-never-C logic, zero-count bins and running totals against a budget.",
    slugs: [
      "user-activity-for-the-past-30-days-ii",
      "customers-who-bought-a-and-b-not-c",
      "create-a-session-bar-chart",
      "last-person-to-fit-in-the-elevator",
      "sellers-with-no-sales",
    ],
    study: {
      intro: [
        "Funnels are built from existence checks and quantifier logic. The AND of bought-A-and-bought-B is two filtered self-joins — each INNER JOIN an existence check wearing join syntax, with (customer, product) kept together in the same ON clause — and the NOT-C is a NOT IN subquery, because negative existence is a property no row carries on its face. The zero-sales report is the purest form: an anti-join that never counts, groups, or even joins Orders to Seller — absence is the entire answer, and the half-open 2020 date range is the only filter.",
        "Charts need bins the data does not contain. Plain GROUP BY can only report buckets that exist — group by a CASE of duration and an empty range simply has no row to group — but a bar chart promises a bar for EVERY bin, including zero-height ones. The standard fix is a dimension table: a VALUES-built CTE enumerates the bins with their bounds, and a LEFT JOIN from bins to facts guarantees every bar, with COUNT of the matched side keeping empties at zero. Ratios across grains work the same honest way: two scalar subqueries, each answering its own question completely, merged only at the division.",
        "Sequences graduate to window aggregates here. The elevator question is a running-total question — the person at turn t boards iff the weight sum up to t fits — and SUM(weight) OVER (ORDER BY turn) computes exactly that prefix sum: the same aggregate as GROUP BY, but scoped to 'everything up to this row' and without collapsing the rows it measures. Filter to the fitting rows and the last survivor by turn is the answer; the window did the sequencing that no GROUP BY could see.",
      ],
      path: [
        { slug: "user-activity-for-the-past-30-days-ii", why: "A ratio of two different grains: sessions inside the filtered window over distinct users in the whole log — two scalar subqueries, each answering its own question completely before the division merges them, promoted to REAL before ROUND." },
        { slug: "customers-who-bought-a-and-b-not-c", why: "The AND is two filtered self-joins — each an existence check with (customer, product) kept in the same ON — and the NOT is a NOT IN subquery; DISTINCT absorbs the fan-out." },
        { slug: "create-a-session-bar-chart", why: "A CHART needs every bar, including zero-height ones: a VALUES-CTE dimension table enumerates the bins and a LEFT JOIN on half-open bounds guarantees them — plain GROUP BY can only report buckets that exist." },
        { slug: "last-person-to-fit-in-the-elevator", why: "A running-total question: SUM(weight) OVER (ORDER BY turn) is the prefix sum — the aggregate scoped to 'everything up to this row' without collapsing rows — filter <= 1000, keep the last survivor by turn." },
        { slug: "sellers-with-no-sales", why: "'No sales in 2020' is a NEGATIVE predicate: NOT IN against the date-filtered order ids — the anti-join never counts, groups, or joins Orders to Seller; absence is the entire answer." },
      ],
    },
  },
  {
    id: "hackerrank-2",
    title: "HackerRank Classics II",
    blurb:
      "The next tier of the famous bank — triangle classification, dirty-data averages, name-length extremes, continent sums, exclusion logic and the ROW_NUMBER pivot.",
    slugs: [
      "type-of-triangle",
      "the-blunder",
      "station-shortest-longest",
      "asian-population",
      "challenges",
      "occupations-pivot",
    ],
    study: {
      intro: [
        "HackerRank's second wave shares a taste for puzzles where the SQL syntax itself is the difficulty. A CASE whose branch ORDER is the entire algorithm (evaluate top-down, stop at first hit — so the validity gate must precede the equality ladder). A compound SELECT that allows exactly ONE ORDER BY, trailing the last branch, sorting the COMBINED result. A pivot built by hand because the engine has no PIVOT keyword. The engine knowledge is the problem.",
        "Data repair and integer math. The blunder repairs a typo with string surgery: digits are text until you cast otherwise, and REPLACE strips characters with no notion of place value — which is precisely why a zero-rich salary collapses so catastrophically. The average gap then must be ceiled with the (a + n − 1) / n integer identity, because CEIL over floating-point averages rounds wrong at exactly the boundary the seed plants.",
        "Grain and survival decisions. A LEFT JOIN manufactures the zero rows a COUNT can measure — an INNER JOIN would delete the zero-challenge hacker before any logic runs, and no WHERE can bring her back. A filter column living on a different table than the aggregate (continent on COUNTRY, population on CITY) forces the join before the WHERE can even be written. And the manual pivot manufactures its row axis FIRST — ROW_NUMBER per occupation — before conditional MAX collapses each rank into one output row.",
      ],
      path: [
        { slug: "type-of-triangle", why: "CASE branch order is the algorithm: the validity gate must run before the equality ladder, or 10-10-20 reads as Isosceles — and A = B AND B = C certifies all three sides by transitivity." },
        { slug: "the-blunder", why: "String surgery on a number: CAST → REPLACE('0','') → CAST back, then the (a + n − 1) / n integer ceiling — CEIL over float averages rounds the planted boundary wrong." },
        { slug: "station-shortest-longest", why: "Two top-1 questions in one output: opposite sort keys mean two wrapped subqueries UNION ALL'd — and the single ORDER BY must trail the last branch, sorting the combined result." },
        { slug: "asian-population", why: "Filter on the joined table: continent lives on COUNTRY, population on CITY — the join must exist before the WHERE can be written, and INNER semantics decide who exists at all." },
        { slug: "challenges", why: "Zero-count survival: LEFT JOIN manufactures the 0 row, COUNT(right column) measures it, and the max-of-count lives in a derived table WHERE and HAVING cannot see." },
        { slug: "occupations-pivot", why: "The manual pivot in two steps: ROW_NUMBER manufactures the row axis, then conditional MAX per rank collapses each occupation into its column." },
      ],
    },
  },
  {
    id: "datalemur",
    title: "DataLemur Interview Sets",
    blurb:
      "Real interview questions from the DataLemur bank, re-authored — first transactions, out-pacing your manager, and the mode with a tie policy.",
    slugs: [
      "uber-first-transaction",
      "linkedin-power-creators",
      "compressed-mode",
    ],
    study: {
      intro: [
        "DataLemur's interview sets are compact and brutal: one hidden decision per problem, wrapped in an innocent sentence. The first-transaction question hides a tie-break contract — earliest date, smallest id breaking same-day ties — and BOTH keys must live INSIDE the window's ORDER BY, because a single-key sort leaves the two same-day rows in engine-dependent order and the wrong ride_type wins. The mode question is aggregate-of-aggregates in disguise.",
        "Self-joins ask you to justify the rows an INNER JOIN silently deletes. The power-creators check compares hire dates down the org chart, and the join drops the CEO (a NULL manager_id matches nothing) — but that drop is SAFE, not lazy: an employee with no manager cannot be 'hired before their manager', so the missing rows are exactly the non-qualifying ones. Saying WHY the drop is safe is the actual interview answer.",
        "Grain discipline is the mode's whole difficulty: count per value (value grain), take MAX over those counts (whole-set grain), then MIN(value) among the winners (a tie policy on top). Three grains stacked, each in its own layer — because WHERE cannot reference an aggregate at its own level (WHERE freq = MAX(freq) is illegal by design: WHERE runs before groups exist). Whenever a question asks for an aggregate OF an aggregate, the inner aggregate lives in its own CTE the outer query can consume.",
      ],
      path: [
        { slug: "uber-first-transaction", why: "First-per-group with the tie-break INSIDE the window: ROW_NUMBER over (ride_date, ride_id) — a single-key sort leaves same-day order engine-dependent." },
        { slug: "linkedin-power-creators", why: "The self-join where the silent drop is the answer: INNER JOIN deletes the CEO, and that's SAFE — no manager means no 'hired before' is even possible." },
        { slug: "compressed-mode", why: "The mode in three grains: per-value counts, MAX over the counts, MIN(value) among winners — aggregate-of-aggregates always stacks layers, never nests expressions." },
      ],
    },
  },
  {
    id: "select-2",
    title: "Select & Validation II",
    blurb:
      "Beyond 100 — the first filters of the trade: WHERE gates, GLOB pattern validation, classified joins, rounded-group thresholds, month buckets and the visit/transaction anti-join.",
    slugs: [
      "recyclable-and-low-fat-products",
      "find-users-with-valid-e-mails",
      "weather-type-in-each-country",
      "activity-participants",
      "unique-orders-and-customers-per-month",
      "customer-who-visited-but-did-not-transact",
    ],
    study: {
      intro: [
        "The validation band: queries whose entire difficulty is expressing the condition precisely. Conjunction is the base move — WHERE ANDs every predicate with no partial credit; a product that passes one flag and fails the other fails exactly as hard as one that fails both. Pattern validation in SQLite's sandbox has no REGEXP backing: LIKE (case-insensitive, % and _) and GLOB (case-sensitive, *, ?, [...]) both match the ENTIRE string, so patterns are full templates — no ^ or $ anchors exist or are needed.",
        "Labels for absent data. A country that never took a reading must still report 'Unknown', and only a LEFT JOIN can introduce it: the country survives as one all-NULL row, AVG over that row returns NULL (AVG ignores NULLs and has nothing else), and CASE's explicit IS NULL branch is what turns NULL into a label — you cannot classify a country that an INNER JOIN already deleted. The WHERE/HAVING division of labor gets its canonical workout here: WHERE drops rows before groups exist, HAVING judges the groups after — and when the comparison is on the ROUNDED average, the rounding must happen before the band test does.",
        "Month buckets and anti-joins. strftime('%Y-%m', order_date) collapses dates into buckets whose zero-padding is load-bearing: '2024-01' < '2024-10' sorts chronologically, while '2024-1' vs '2024-10' would sort backwards. On the same groups, COUNT(*) counts orders while COUNT(DISTINCT customer_id) counts customers — two different questions, one pass. And 'visited but did not transact' is the LEFT JOIN + IS NULL anti-join: a transaction_id is never NULL in real data, so NULL on the right side can only mean 'no match happened'.",
      ],
      path: [
        { slug: "recyclable-and-low-fat-products", why: "The base move: two ANDed equality predicates in WHERE — no partial credit, and ON clauses have no role in a query that joins nothing." },
        { slug: "find-users-with-valid-e-mails", why: "Pattern validation without REGEXP: GLOB's case-sensitive full-string template '[A-Za-z]*@example[.]com' — the [.] keeps the dot literal." },
        { slug: "weather-type-in-each-country", why: "Labels for the absent: LEFT JOIN keeps the never-read country as an all-NULL row, AVG reads NULL, and CASE's IS NULL branch is what can say 'Unknown'." },
        { slug: "activity-participants", why: "WHERE vs HAVING on display: rows filtered before groups exist, groups judged after — and the ROUNDED average is what the band test must compare." },
        { slug: "unique-orders-and-customers-per-month", why: "The month bucket: strftime('%Y-%m') with zero-padding keeps text sorts chronological; COUNT(*) and COUNT(DISTINCT) answer different questions on the same groups." },
        { slug: "customer-who-visited-but-did-not-transact", why: "The anti-join: LEFT JOIN pads non-transacting visits with NULL, IS NULL keeps exactly the padded rows, then count per customer." },
      ],
    },
  },
  {
    id: "engagement",
    title: "Engagement & Reporting",
    blurb:
      "Beyond 100 — product-flavored metrics: dated windows, removal and click-through rates, row-vs-group averages and argmax with tiebreakers.",
    slugs: [
      "user-activity-for-the-past-30-days-i",
      "reported-posts-ii",
      "ads-performance",
      "active-businesses",
      "highest-grade-for-each-student",
    ],
    study: {
      intro: [
        "Engagement reporting is date-grain discipline. A session belongs to the day it STARTED — endDate is only bookkeeping for how long it ran — so both the window filter and the GROUP BY key must be startDate, and the 30-day window is boundary arithmetic with a half-open end (>= the first day AND < first day + 30) that keeps midnight sessions honest. Getting the date grain wrong doesn't crash: it quietly moves sessions to the wrong days or drops them.",
        "Rates and funnels are arithmetic discipline. A CTR is a per-row ratio — clicks per HUNDRED views, so ×100.0 where the load-bearing dot forces REAL division (50*100/400 truncates to 12 before ROUND ever sees it; 50*100.0/400 = 12.5 survives), zero-view rows get an explicit guard, and ROUND happens LAST at the display boundary. A per-day spam-removal rate is a two-stage funnel whose denominator lives entirely in Actions: collapse to one row per (day, post), grade by Removal membership, then average the per-day RATES — an average of ratios, which is NOT the ratio of totals.",
        "Row-versus-its-group, and argmax with identity. Comparing each row to its own type's mean is GROUP BY-impossible — collapsing rows destroys the individual value you're comparing — so AVG() OVER (PARTITION BY event_type) computes the group fact while keeping every row, and the CTE wrap is structural because windows compute after WHERE. The argmax wants the winning COURSE, not just the winning grade: a bare GROUP BY strands the identity (SQLite's bare-column rule hands back some arbitrary row's course), so RANK with the tie policy written INTO the window order names the winner, kept outside the CTE.",
      ],
      path: [
        { slug: "user-activity-for-the-past-30-days-i", why: "The day grain is the START date: filter and group by startDate alone, half-open 30-day window, then COUNT(DISTINCT) users beside COUNT(*) sessions." },
        { slug: "reported-posts-ii", why: "The two-stage funnel: denominator lives in Actions alone, distinct (day, post) grain first, Removal grades the numerator, then ROUND 2 over the average of per-day rates." },
        { slug: "ads-performance", why: "A per-row ratio with arithmetic discipline: ×100.0's dot forces REAL division, the zero-view row is guarded, and ROUND happens last at the display boundary." },
        { slug: "active-businesses", why: "Row versus its own group: AVG() OVER (PARTITION BY event_type) keeps every row for comparison, and the CTE wrap is structural — windows compute after WHERE." },
        { slug: "highest-grade-for-each-student", why: "Argmax with identity: GROUP BY strands the course, RANK with the tie policy in the window order names the winner, rank 1 kept outside the CTE." },
      ],
    },
  },
  {
    id: "matchups",
    title: "Joins & Matchups",
    blurb:
      "Beyond 100 — two-sided reporting: tournament points over UNION legs, same-key pairings, per-customer argmax, two-month thresholds and the weekday pivot.",
    slugs: [
      "team-scores-in-football-tournament",
      "apples-and-oranges",
      "most-frequently-ordered-product-per-customer",
      "customer-order-frequency",
      "sales-by-day-of-the-week",
    ],
    study: {
      intro: [
        "Matchup problems pair two things that live in the same table, or two aggregates that must end up side by side. The two-legs trick is the opener: one Matches row carries TWO teams' results, so a single scan with one CASE can only ever score one side. Explode each match into host-perspective and guest-perspective rows (mirrored CASEs, stacked with UNION ALL) — and the league table falls out of a trivial GROUP BY + SUM. The grain is the algorithm; once it's right, the aggregation is easy.",
        "Join totals, never raw rows. Comparing each day's apple total against the same day's orange total means pre-aggregating each fruit per day FIRST — joining the raw tables fans out (day 1's two apple rows × one orange row double-counts everything). Then LEFT JOIN both totals lists onto a spine of all days, so a fruit absent from a day scores 0 instead of vanishing — and a CASE picks the day's winner. Absent sides are part of the answer, not noise.",
        "The conditional-aggregation family does the rest. Two SUM(CASE month) columns in one GROUP BY produce a customer's June and July totals side by side, and 'spent ≥ 500 in BOTH months' is a HAVING because it's a property of the group. The wide-from-long pivot is one SUM(CASE weekday) column per target day — each SUM sweeps the group and keeps only its own weekday's amounts, the CASE's silent ELSE NULL is what makes SUM ignore the other six — with COALESCE 0 for days that never sold. And per-customer argmax: counts CTE, then RANK() over (cnt DESC, product_name) with the tie policy inside the window.",
      ],
      path: [
        { slug: "team-scores-in-football-tournament", why: "The two-legs trick: explode each match into host and guest perspectives (UNION ALL, mirrored CASEs), then the league table is a trivial GROUP BY + SUM." },
        { slug: "apples-and-oranges", why: "Join totals, never raw rows: pre-aggregate each fruit per day, LEFT JOIN both onto the day spine, and the CASE decides the winner with absent sides safe at 0." },
        { slug: "most-frequently-ordered-product-per-customer", why: "Argmax per customer: counts CTE, RANK() over (cnt DESC, product_name) with the tie policy inside the window, keep rank 1." },
        { slug: "customer-order-frequency", why: "Two parallel numbers per customer: SUM(CASE month) twice in one GROUP BY, and 'both months ≥ 500' is a HAVING because it's a property of the group." },
        { slug: "sales-by-day-of-the-week", why: "The wide-from-long pivot: one SUM(CASE weekday) per day column driven by strftime's %w codebook, COALESCE 0 for the days that never sold." },
      ],
    },
  },
  {
    id: "streaks",
    title: "Streaks & Recency",
    blurb:
      "Beyond 100 — time as data: two-grain date streams, LEAD-made gaps, 7-day run detection, gaps-and-islands grouping and second-most-recent with RANK semantics.",
    slugs: [
      "monthly-transactions-ii",
      "biggest-window-between-events",
      "user-purchase-platform",
      "report-contiguous-dates",
      "second-most-recent-activity",
    ],
    study: {
      intro: [
        "Streak and gap questions share one truth: GROUP BY sees bags, not sequences. The gaps-and-islands anchor fixes it — number the rows 1..k in date order with ROW_NUMBER, and on any consecutive run the calendar index and the counter climb together, so day_index − row_number is CONSTANT per run. 'Detect runs' becomes 'GROUP BY grp', with MIN/MAX of each group naming the run's endpoints and COUNT sizing it. One arithmetic column turns sequence-sensing into ordinary aggregation.",
        "LEAD manufactures pairs. A gap lives between ADJACENT visits, but no table stores adjacency — every row only knows its own date. LEAD(visit_date) OVER (PARTITION BY user_id ORDER BY visit_date) fetches the next visit's date onto each row, and julianday subtraction turns the pair into a day count (SQLite has no DATEDIFF; julianday converts 'YYYY-MM-DD' to a Julian day number, and CAST keeps it an exact integer). Keep the earliest biggest gap with ROW_NUMBER over (gap DESC, start ASC) = 1 — the second sort key is a tie policy.",
        "Two composition lessons finish the set. Fusing event streams that disagree on date grain (approvals booked at payment date, chargebacks at reversal date) means normalizing BOTH into one tall list of (month, country, amount, side) rows and aggregating AFTER the union — pre-aggregated branches stack into lying duplicates with zeros filling their gaps. And 'second most recent' is a per-group ordinal: RANK() OVER (PARTITION BY username ORDER BY startDate DESC), keep rank 2 — where the RANK-vs-DENSE_RANK choice IS the problem (RANK counts rows ahead, DENSE_RANK counts distinct values), and single-session users have no rank 2 to keep.",
      ],
      path: [
        { slug: "monthly-transactions-ii", why: "Fuse streams that disagree on date grain: flag both into one tall list (chargebacks at charge_date), aggregate AFTER the union — pre-grouped branches duplicate months." },
        { slug: "biggest-window-between-events", why: "LEAD manufactures the pair, julianday subtraction measures the gap, and ROW_NUMBER over (gap DESC, start ASC) keeps the earliest biggest window." },
        { slug: "user-purchase-platform", why: "A streak problem in a finance costume: aggregate to user-day, mark mobile-only days, anchor runs by index − row_number, qualify at ≥ 7 — the money is an epilogue." },
        { slug: "report-contiguous-dates", why: "The gaps-and-islands anchor in its purest form: grp = day_index − row_number is constant on every consecutive run — 'detect runs' becomes 'GROUP BY grp' with MIN/MAX endpoints." },
        { slug: "second-most-recent-activity", why: "Per-group ordinal: RANK() by startDate DESC, keep rank 2 — the RANK-vs-DENSE_RANK choice is the problem, and single-session users have no rank 2." },
      ],
    },
  },
  {
    id: "hard-finales",
    title: "Hard Finales",
    blurb:
      "Beyond 100 — the interview-endgame tier: zero-filled histogram bins, deduped subset averages against a global baseline, and always-full category reports.",
    slugs: [
      "transactions-per-visit-histogram",
      "countries-you-can-safely-invest-in",
      "count-salary-categories",
    ],
    study: {
      intro: [
        "The finales are about SHAPE guarantees — reports that must contain rows GROUP BY cannot manufacture. GROUP BY manufactures keys from observations, never from the report's contract: CASE-bucketing salaries and grouping by the bucket drops the High Salary row entirely when nobody earns above 50000, and the report shrinks to two bars looking like a chart bug rather than a query bug. An always-full report needs shape-guaranteeing constructs — three literal-labeled COUNTs UNION ALLed into a guaranteed three-row output.",
        "Histograms inherit the same law. Bin 0 — visits with zero transactions — has no row in Transactions at all, so counting per visit FROM Transactions silently deletes the bin that is usually the tallest bar. The fix is a change of anchor: start from Visits and LEFT JOIN Transactions onto it (COUNT of the right table's column lands on 0 for unmatched visits), and materialize the bins themselves with a recursive CTE so every bin from 0 to the max exists BEFORE the counts are joined onto it.",
        "Population mixing is the last finale skill. A call's country story is told by TWO people, so Person joins twice — once on caller_id, once on callee_id — and the 'touched' relation falls out by exploding every call into its two (country, duration) sides. UNION — not UNION ALL — is the dedupe: the both-ends call produces two byte-identical rows and set semantics collapse them, which is the 'counts once per country' rule expressed as data. And comparing a country's average against the GLOBAL average means the global lives in its own scalar subquery — averaging the two populations together is the classic blunder.",
      ],
      path: [
        { slug: "transactions-per-visit-histogram", why: "A histogram is shape GROUP BY can't invent: anchor counts on Visits, materialize bins 0..max with a recursive CTE, LEFT JOIN the counts on — bin 0 survives and is usually the tallest bar." },
        { slug: "countries-you-can-safely-invest-in", why: "Two-sided facts: join Person twice, explode calls into (country, duration) sides, let UNION dedupe the both-ends call, and compare against the global average in its own scalar subquery." },
        { slug: "count-salary-categories", why: "Shape guarantees need shape-guaranteeing constructs: three literal-labeled COUNTs UNION ALLed always report three rows — GROUP BY would drop the empty High bucket." },
      ],
    },
  },
  {
    id: "hackerrank-3",
    title: "HackerRank Classics III",
    blurb:
      "The famous join set, re-authored — ranged grade lookups, four-table score chains, two-grain string reports, bridge tables, symmetric canonicalization and the daily-streak leaderboard.",
    slugs: [
      "the-report",
      "top-competitors",
      "the-pads",
      "placements",
      "symmetric-pairs",
      "fifteen-days-of-learning",
    ],
    study: {
      intro: [
        "The third HackerRank wave is join architecture. The ranged lookup: a student's marks match a RANGE of the Grades table (marks BETWEEN min_mark AND max_mark) — a non-equi join with no equality anywhere, and the result is only as trustworthy as the band design: nine bands tiling 0–100 with no gaps and no overlaps is what guarantees one grade row per student. The chain join: 'full score' is meaningless until Submissions → Challenges → Difficulty supplies each level's bar — each hop adds one attribute the previous hop couldn't see, and the score-meets-bar comparison only becomes writable at the chain's end.",
        "Bridges and pairs. Friends carries no facts of its own — it is a pure bridge whose two foreign keys both point into Students, so 'my friend's salary' exists only as a PATH: two joins and a second Students alias (the defining mark of a self-join chain). Symmetric pairs need a representative rule — x <= y, the smaller-x side speaks for the couple — whose diagonal leak ((20,20) mirrors ITSELF, so 'some row holds the mirror' is always true) is patched with a different-id witness.",
        "Output engineering. The || operator chains as many string pieces as the sentence needs — with the silent hazard that NULL collapses any concatenation to NULL. Two output grains (per-row facts and per-group facts) stack via UNION ALL under synthetic sort-key columns, sharing one outer ORDER BY. And 'on a full streak through day D' is a negated existence question: a recursive day calendar plus two nested NOT EXISTS — the hacker is on a streak exactly when NO day between 1 and D is missing — with the daily leader decided by ROW_NUMBER over (cnt DESC, hacker_id), a complete tie-breaker chain.",
      ],
      path: [
        { slug: "the-report", why: "The range lookup: marks BETWEEN band bounds is a non-equi join — trustworthy only because the bands tile 0–100 with no gaps or overlaps, and CASE masks juniors' names." },
        { slug: "top-competitors", why: "The chain join: Submissions → Challenges → Difficulty supplies each level's full score — '100 is perfect' is only writable at the chain's end, then HAVING COUNT(*) > 1." },
        { slug: "the-pads", why: "String building with ||: four chained pieces per sentence, the NULL-collapses-everything hazard, and two output grains stacked by UNION ALL under synthetic sort keys." },
        { slug: "placements", why: "The pure bridge: Friends has no facts, so 'my friend's salary' is two joins into a second Students alias — then keep the strictly-greater side." },
        { slug: "symmetric-pairs", why: "One representative per couple: x <= y dedupes with no DISTINCT, but the diagonal mirrors itself — a lone (20,20) needs a different-id witness to qualify." },
        { slug: "fifteen-days-of-learning", why: "Streak as negated existence: a recursive day calendar plus two nested NOT EXISTS — no missing day means full streak — and the leader needs a complete tie-breaker chain." },
      ],
    },
  },
  {
    id: "datalemur-2",
    title: "DataLemur Interview Sets II",
    blurb:
      "More real interview questions, re-authored — launch rates, one-scan funnels, cumulative spend histograms, confirmation gaps and the same-day first-order pattern.",
    slugs: [
      "card-launch-success",
      "ads-funnel",
      "spend-histogram",
      "second-day-confirmation",
      "same-day-sale",
    ],
    study: {
      intro: [
        "DataLemur II is rate discipline. A launch success rate is approvals over APPLICATIONS — COUNT(*) as the denominator is deliberate (declined applications belong in the base; approvals-over-approvals would flatter every card), and SUM(approved) counts the 1s of a 0/1 flag with no CASE ceremony. The ×100.0 dot forces REAL division before ROUND 2 at the display boundary. Funnel ratios each use their OWN stage's user set — that asymmetry is a decision, not a slip: one GROUP BY product with COUNT(DISTINCT CASE action) per stage computes viewers, carters and buyers in a single scan.",
        "Layer order is forced by SQL's clause order. A spend histogram classifies users by their TOTAL spend, but rows are classified before aggregates exist — so per-user totals materialize first (totals CTE), CASE buckets come second, COUNT per bucket third, and the cumulative share rides SUM(users) OVER (ORDER BY lower_bound) on top. Skipping a layer is the classic syntax error — HAVING filters groups, it doesn't re-classify rows. The same law powers the confirmation-gap problem: filter to confirmed BEFORE the window, because LEAD's 'next' means the next ROW in the stream — leave timeouts in and a timeout becomes someone's 'second' and can even capture the rank-1 slot.",
        "Summarize-then-join-back is the closer. 'First day' is a per-user MIN living at user grain; inspecting what happened ON that day drops back to row grain by joining orders against the first-days CTE on (user, date) — and MIN on 'YYYY-MM-DD' text is chronological for free because the format is fixed-width. This summarize-then-join-back shape is the workhorse behind every 'first X' question: aggregate to find the key, re-join to inspect the rows at that key.",
      ],
      path: [
        { slug: "card-launch-success", why: "The rate's denominator is deliberate: SUM(0/1 flag) counts approvals, COUNT(*) keeps declined applications in the base, and ×100.0 forces REAL division before ROUND 2." },
        { slug: "ads-funnel", why: "The one-scan funnel: COUNT(DISTINCT CASE action) per stage in one GROUP BY — and each ratio divides by its OWN stage's user set." },
        { slug: "spend-histogram", why: "Three forced layers: totals CTE, CASE buckets, COUNT per bucket — then the cumulative share rides SUM() OVER (ORDER BY lower_bound)." },
        { slug: "second-day-confirmation", why: "Filter confirmed BEFORE the window: LEAD's 'next' is the next row, so a timeout in the stream corrupts both the pair and the rank-1 slot." },
        { slug: "same-day-sale", why: "Summarize-then-join-back: first_days CTE holds the per-user MIN at user grain, then re-join orders on (user, first day) to test what happened on it." },
      ],
    },
  },
  {
    id: "premium-warmups",
    title: "Premium Warmups",
    blurb:
      "The premium tier opens — acceptance-rate ratios, confirmation lags, distinct-student averages, three-way triplet joins, netted invoice worths and sync-glitch dedupes.",
    slugs: [
      "friend-requests-i-overall-acceptance-rate",
      "users-that-actively-request-confirmation-messages",
      "the-winner-university",
      "all-valid-triplets-that-can-represent-a-country",
      "products-worth-over-invoices",
      "find-latest-salaries",
    ],
    study: {
      intro: [
        "Rates open the premium tier, and a rate is only as honest as its unit. A friend-request table logs EVENTS, and events repeat: a resend adds a row without adding a request, a re-synced acceptance adds a row without adding an acceptance. So both sides of the fraction reduce to DISTINCT pairs inside counted subqueries — a pair is one unit of friendship intent, a row is not. And every division carries the batch's oldest trap: integer division truncates, so the 1.0 dot (or an explicit CAST) lands before ROUND ever runs.",
        "Derived quantities are judged at group grain. The confirmation lag is computed per row — julianday difference × 24 turns the timestamp pair into hours — and only then averaged per user, which makes the judgment an aggregate: HAVING, never WHERE, because WHERE runs before grouping and cannot see an average at all. The same two-layer thinking covers comparing aggregates across tables: each side becomes its own scalar subquery returning one number, and a CASE with a 'No Winner' ELSE shows how to label the empty outcome instead of letting it vanish.",
        "Candidate spaces and append-only logs round out the set. When no key connects two tables, CROSS JOIN is the honest operator — it states 'every combination' outright, and the validity rule then prunes with ALL pairwise filters. When a pipeline re-sends records, the log grows by rows rather than changing them: deduplicate by the business key, arbitrate which copy arrived last with the delivery id, and join back to keep the winning copy itself. And a net figure (worth, balance) is per-row algebra BEFORE it is an aggregation — a sum is only as good as the expression it sums.",
      ],
      path: [
        { slug: "friend-requests-i-overall-acceptance-rate", why: "The unit audit: a resend is a row but not a request — each side reduces to DISTINCT pairs inside a counted subquery, and the 1.0 dot keeps the rate from truncating to zero before ROUND." },
        { slug: "users-that-actively-request-confirmation-messages", why: "A derived quantity judged at group grain: julianday lag × 24 computed per confirmation, then AVG per user under HAVING — WHERE runs before grouping and cannot see the average." },
        { slug: "the-winner-university", why: "Dedupe before averaging: student 4's synced copy double-weights a raw AVG and crowns the wrong school (76.4 vs the true 77.5); DISTINCT student_id, score first, then two scalar subqueries compared with a 'No Winner' ELSE." },
        { slug: "all-valid-triplets-that-can-represent-a-country", why: "The honest CROSS JOIN: no key connects schools, so every A × B × C combination is generated outright (3 × 3 × 2 = 18) — then THREE pairwise <> filters, because two conjuncts let B and C share a name." },
        { slug: "products-worth-over-invoices", why: "Netting is per-row algebra before aggregation: rest + paid - canceled - refunded evaluates line by line (a full cancel nets to exactly 0), and only then does SUM roll the lines up per product." },
        { slug: "find-latest-salaries", why: "An append-only log: the same business triple exists under several sync_ids, so GROUP BY the triple, arbitrate with MAX(sync_id), and join back to keep the winning copy itself." },
      ],
    },
  },
  {
    id: "premium-community",
    title: "Premium Friend Graphs",
    blurb:
      "Graph thinking in SQL — two-sided friend ledgers, common-friend intersections, directed follower pairs, recommendation anti-joins and traffic ties.",
    slugs: [
      "friend-requests-ii-who-has-the-most-friends",
      "strong-friendship",
      "all-the-pairs-with-the-maximum-number-of-common-followers",
      "page-recommendations-ii",
      "the-airport-with-the-most-flights",
    ],
    study: {
      intro: [
        "Graph tables are edge lists, and an edge touches TWO nodes who each deserve credit. Reading a friendship table as 'group by requester' counts only half of every acceptance: the accepter's gain lives in the same row, under a different column. The canonical cure is to explode — UNION ALL the two endpoint columns into one tall list of ids — after which the busiest node is the plainest aggregation there is. UNION ALL is load-bearing: a deduping UNION would collapse repeated ids and undercount exactly the repeat friends the question asks about.",
        "Orientation is a storage detail the reader pays for. Edges stored once (smaller id first, or in no order at all) make 'who is friends with u?' a two-branch scan — rows where u is user1_id OR user2_id. Either normalize once (UNION ALL both orientations into directed (u, f) rows) or adopt a read rule (CASE returns the OTHER endpoint). Do it once, upstream, and every downstream question — intersections, recommendations, traffic — becomes a single-condition lookup instead of a place where mistakes breed.",
        "Pairs do not exist in the table — they are manufactured. A self-join with a canonical inequality (smaller id first) builds each unordered pair exactly once; common-follower counts are intersections of two per-node sets counted per pair; and the maximum is kept by equality with the global MAX, never LIMIT 1, because ties are answers. Recommendations flip the shape: an anti-join (NOT EXISTS) subtracts what the target already has. The seed plants asymmetric nodes — a user who follows but is never followed — so half-reads fail visibly.",
      ],
      path: [
        { slug: "friend-requests-ii-who-has-the-most-friends", why: "The two-endpoint credit rule: (a, b) contributes one row for a and one for b — UNION ALL the requester and accepter columns into a tall list, then GROUP BY id, COUNT(*); a deduping UNION would silently drop repeat friends." },
        { slug: "strong-friendship", why: "Normalize once, read forever: both orientations UNION ALLed into directed (u, f) rows turn every question into a single-condition lookup; joining each candidate pair's two neighbor sets and HAVING COUNT(*) >= 3 is the common-friend test." },
        { slug: "all-the-pairs-with-the-maximum-number-of-common-followers", why: "Direction is the flavor: a follow row speaks of one user only, so common followers are the intersection of two follower sets — pairs manufactured by self-join with followee1 < followee2, user 9 (follows, never followed) proving the asymmetry; keep pairs equal to the global MAX." },
        { slug: "page-recommendations-ii", why: "The reader pays for storage: friendship rows have no canonical order, so CASE WHEN user1_id = 1 THEN user2_id ELSE user1_id END reads the other endpoint; candidates are friends' liked pages, and NOT EXISTS subtracts the pages user 1 already likes." },
        { slug: "the-airport-with-the-most-flights", why: "One movement, two airports, both counted: UNION ALL departure and destination legs, traffic is a plain COUNT(*), and the tie survives because the keeper is equality with the global MAX — ORDER BY id for determinism." },
      ],
    },
  },
  {
    id: "premium-content",
    title: "Premium Media & Content",
    blurb:
      "Content-platform asks — answer-rate argmax, never-dispatched books, kids-movie filters, per-buyer recency cutoffs and keyword-substring matching.",
    slugs: [
      "get-highest-answer-rate-question",
      "unpopular-books",
      "friendly-movies-streamed-last-month",
      "the-most-recent-three-orders",
      "finding-the-topic-of-each-post",
    ],
    study: {
      intro: [
        "Content logs mix event types in one table, which makes every count inside a ratio a CONDITIONAL count: SUM(CASE WHEN action = 'answer' THEN 1 ELSE 0 END) tallies one action while its twin tallies the other, and a plain COUNT(*) lumps both into one meaningless number. The idiom has a cousin worth knowing — COUNT(CASE WHEN ... THEN 1 END) skips NULLs and counts the same rows — but the explicit 0/1 flags extend more cleanly to per-day and per-segment cuts.",
        "Reports AND predicates of different shapes, and each shape fails its own way. A per-table aggregate (below the global average) has a scope trap: the AVG must scan ALL books, and a scalar subquery does exactly that no matter what the outer WHERE filters — filter first and the bar drifts down, wrongly qualifying borderline rows. A per-entity existential (never dispatched in a window) wants NOT EXISTS over a half-open range. And when filters live on three tables, the join chain is the query's spine: event, pattern, role — with DISTINCT collapsing the event grain to the display grain.",
        "Two different 'top' questions can stack, and they need two different tools: 'the three buyers with the most purchases' ranks an aggregate (COUNT per buyer, then RANK over the counts), while 'their three most recent purchases' is a per-group recency cutoff (ROW_NUMBER newest-first). Neither window can live in the other's SELECT — the honest shape is a chain of CTEs. Substring matching completes the set: CROSS JOIN posts × keywords with the pattern built from the data itself, plus a UNION ALL branch so unmatched posts still print.",
      ],
      path: [
        { slug: "get-highest-answer-rate-question", why: "The twin-CASE rate: answer shows and answer events counted separately — SUM(CASE) / COUNT with a 1.0 dot — because COUNT(*) would lump both actions into one number; ORDER BY rate DESC LIMIT 1 crowns the question." },
        { slug: "unpopular-books", why: "Two predicate shapes ANDed: the average must scan ALL books (the scalar subquery runs its own scan — filter first and the bar drifts down, wrongly qualifying borderline stock), while never-dispatched is NOT EXISTS over a half-open window." },
        { slug: "friendly-movies-streamed-last-month", why: "A three-table spine: WatchLog supplies the event, Movies the LIKE pattern, Memberships the role test — evaluated per watch row, so one qualifying viewer is enough for the movie; DISTINCT then collapses event grain to one row per title." },
        { slug: "the-most-recent-three-orders", why: "Two top-questions, two tools: COUNT per buyer ranked by RANK (rnk <= 3), then ROW_NUMBER per gated buyer newest-first (rn <= 3) — neither filter can live in the other's SELECT, hence the CTE chain." },
        { slug: "finding-the-topic-of-each-post", why: "Every post against every keyword: CROSS JOIN builds the pair space, LIKE '%' || keyword || '%' builds the pattern from data (substring semantics — 'knead' matches 'kneaded'), and a UNION ALL NOT EXISTS branch prints 'N/A' so no post goes missing." },
      ],
    },
  },
  {
    id: "premium-time",
    title: "Premium Time Windows",
    blurb:
      "Time as evidence — overlapping login intervals, per-day maxima with ties, seven-day proximity, interval-to-year expansion and first/last-call join-backs.",
    slugs: [
      "leetflex-banned-accounts",
      "maximum-transaction-each-day",
      "users-with-two-purchases-within-seven-days",
      "total-sales-amount-by-year",
      "the-first-day-of-the-maximum-recorded-temperature-in-each-city",
      "first-and-last-call-on-the-same-day",
    ],
    study: {
      intro: [
        "Time evidence usually lives in PAIRS of rows: a single session never proves a ban, a single purchase never proves a burst. Self-joins manufacture the pairs, scoped to the entity key so probes stay within one account or one user; the predicates are interval tests — the closed-interval overlap (a.login <= b.logout AND b.login <= a.logout) — and gap tests, where SQLite's lack of DATEDIFF is bridged by julianday differences. Every extra condition (differing IPs, a strict inequality) just narrows which pairs count as evidence.",
        "Per-bucket maxima are argmax with a join-back, and the window form does it in one pass: MAX(...) OVER (PARTITION BY bucket) annotates EVERY row with its bucket's peak, and the equality filter (amount = day_peak) keeps all attaining rows — ties are answers, not accidents. What you leave OUT of the partition is the trick: a withdrawal must compete against deposits inside the same day. Value-plus-date tangles (the first day of each city's peak) resolve the same way — ORDER BY value DESC, date ASC inside the window makes row 1 the earliest day of the peak.",
        "Reports often demand a grain the table does not have, and time grains are manufactured. A shipment spanning 2023 → 2025 must exist three times before yearly totals make sense — WITH RECURSIVE emits one row per year. Caller-days do not exist until DATE(timestamp) buckets full timestamps; the buckets then yield MIN and MAX boundaries, but aggregates discard WHO — a join back to the fact rows recovers the recipients, and only then can the report judge them.",
      ],
      path: [
        { slug: "leetflex-banned-accounts", why: "Evidence is a pair: a self-join scoped to account_id, the closed-interval overlap test (a.login <= b.logout AND b.login <= a.logout) plus differing IPs — DISTINCT the ids; cross-account coincidences never enter because the join key scopes the probe." },
        { slug: "maximum-transaction-each-day", why: "Argmax as annotation: MAX(amount) OVER (PARTITION BY day) rides every row — kind deliberately out of the partition, so a 1200 withdrawal outranks a 300 deposit — and amount = day_peak keeps every tie." },
        { slug: "users-with-two-purchases-within-seven-days", why: "Pairs with a gap: self-join on user_id, julianday(b) - julianday(a) because SQLite has no DATEDIFF, and a one-sided 0 < gap <= 7 so same-instant pairs cannot sneak in; DISTINCT the surviving users." },
        { slug: "total-sales-amount-by-year", why: "Grain before totals: a 2023 → 2025 shipment must exist three times — WITH RECURSIVE emits yr + 1 while it has not passed the end year, and only then does GROUP BY year/product SUM(units × price) mean anything." },
        { slug: "the-first-day-of-the-maximum-recorded-temperature-in-each-city", why: "Value and date untangled in one window: ROW_NUMBER PARTITION BY city ORDER BY temperature DESC, record_date ASC — rn = 1 is the hottest reading, earliest among its repeats; the second ORDER BY key IS the tie handling." },
        { slug: "first-and-last-call-on-the-same-day", why: "The unit is the caller-DAY: DATE(call_time) buckets timestamps, GROUP BY caller/day takes MIN and MAX — then a join-back, because the aggregates discarded WHO received the boundary calls; keep caller-days with exactly one distinct boundary recipient." },
      ],
    },
  },
  {
    id: "premium-money",
    title: "Premium Ledgers & Money",
    blurb:
      "Money-grade reporting — always-full account summaries, two-leg league records, running balances, shortfall counts, tie-sharing invoices and sliding-window alerts.",
    slugs: [
      "bank-account-summary",
      "league-statistics",
      "account-balance",
      "employees-with-deductions",
      "generate-the-invoice",
      "suspicious-bank-account-transactions",
    ],
    study: {
      intro: [
        "Money reports promise completeness, and the anchor of the query decides who survives. Driving FROM the movements table with a GROUP BY account counts only the accounts that moved — the dormant account contributes no group and vanishes silently from a report that promised every account. Anchor on the account table instead and LEFT JOIN the log on: the dormant row survives with NULL movement columns, and the aggregates over that nullable side need COALESCE so 'no credits' reads as 0, not NULL, before the balance is credits minus debits.",
        "Some rows speak twice, and some histories must stay alive. A fixture row talks about two clubs at once — reading it once and CASE-ing the host's result scores only the home side, so the two-legs trick UNION ALLs a host view and a mirrored away view until the stream is one row per (club, match); after that the standings are the most ordinary conditional sums. A balance after each movement is a cumulative sum, which GROUP BY cannot produce — grouping collapses what the report must keep alive — so a window SUM partitions per account, orders by time, and keeps every input row carrying its own subtotal, with a CASE signing the amounts before the window runs.",
        "Counting has flavors, ranking has an order, and alerts have a shape. COUNT(*) counts rows, COUNT(col) counts non-NULLs, COUNT(DISTINCT col) counts distinct values — rows and days part ways the moment one day logs two shifts. Rank after filter: the category cut must precede the per-buyer RANK, and rank-1 ties share the invoice. And a threshold policy about CONCENTRATION is a windows question, not a totals question: structuring money so every single day is boring while the total climbs defeats any whole-history SUM — probe a sliding date window instead.",
      ],
      path: [
        { slug: "bank-account-summary", why: "The anchor keeps the promise: FROM Accounts LEFT JOIN Movements — dormant account 4 survives with NULL movement columns; COALESCE around each sum turns 'no credits' into 0, and the balance is credits minus debits." },
        { slug: "league-statistics", why: "The two-legs trick: a fixture row speaks for two clubs, so a host view and a mirrored away view are UNION ALLed into one row per (club, match) — then wins, draws and goals are the most ordinary conditional sums in the book." },
        { slug: "account-balance", why: "Every step stays alive: SUM(signed CASE amount) OVER (PARTITION BY account ORDER BY day, movement_id ROWS UNBOUNDED PRECEDING AND CURRENT ROW) — a GROUP BY would collapse the history this report must print." },
        { slug: "employees-with-deductions", why: "Rows and days part ways: employee 1 holds four rows across three distinct days, so COUNT(*) meets the bar of 4 wrongly — COUNT(DISTINCT ot_date) reads 3 and the shortfall surfaces under HAVING." },
        { slug: "generate-the-invoice", why: "Filter, then rank: the category cut runs BEFORE the per-buyer maximum, or buyer 3's 500.0 heater takes the invoice that belongs to their 18.5 gloves; RANK() over price DESC lets rank-1 ties share the bill." },
        { slug: "suspicious-bank-account-transactions", why: "Concentration, not totals: account 2 moves 10200 over ten boring days and no three-day window nears 10000 — self-join to the [made_at, made_at + duration] window, HAVING SUM(amount) >= threshold, DISTINCT the accounts." },
      ],
    },
  },
  {
    id: "premium-finales",
    title: "Premium Hard Finales",
    blurb:
      "The premium endgame — cancellation rates over banned parties, row-based medians, all-exam quiet students, continent pivots, merged booking blocks and concurrency math.",
    slugs: [
      "trips-and-users",
      "median-employee-salary",
      "find-the-median",
      "find-the-quiet-students-in-all-exams",
      "students-report-by-geography",
      "merge-overlapping-events-in-the-same-hall",
      "employee-task-duration-and-concurrent-tasks",
    ],
    study: {
      intro: [
        "Population rules cut both ways. A ride belongs to the cancellation report only when its rider is unbanned AND its driver is unbanned — a two-sided rule that needs two joins to the same People table, each alias carrying its own banned = 'No' directly in the ON clause. Filter one side and the fraction corrupts silently: the banned rider's ride and the banned driver's ride must both leave the denominator as well as the numerator, because the metric is the cancellation experience of rides among clean accounts.",
        "Medians over people are row selection, not arithmetic. With an even head-count the answer is the two middle ROWS printed verbatim — averaging them invents a salary nobody earns, and company C (just 15000 and 41000) makes that bug impossible to miss. Position language is window language: ROW_NUMBER ascending and descending plus COUNT(*) OVER () flag the middle rows, and rn IN ((n+1)/2, n/2+1) followed by AVG answers odd and even in one statement with no parity branch — while ORDER BY LIMIT OFFSET is really two queries, a parity conditional, and an off-by-one waiting for an even-sized input.",
        "Quantifier scope, grain rotation, and reach separate the finales. 'Clean in every exam' is a universal claim — per-exam bounds plus NOT EXISTS (ties count as extremes) plus a positive EXISTS so students who sat nothing stay out. A pivot is a rotation of the grain: rank, pair the ranks with (rn + 1) / 2, GROUP BY the pair with MAX(CASE) columns — never three derived tables stitched on rank, which is a FULL OUTER JOIN in disguise. And interval merging is reach-based islands: the boundary is 'this event starts after everything before it has finished' — a running MAX of end days — not 'this event starts the day after the previous start'.",
      ],
      path: [
        { slug: "trips-and-users", why: "The two-sided rule needs two joins: Rides to People twice — rider and driver aliases each carrying banned = 'No' in ON — so rides 3 and 5 leave the denominator too; the rate is SUM(CASE cancelled) × 1.0 / COUNT(*), grouped by day." },
        { slug: "median-employee-salary", why: "Selection, not arithmetic: company B's answer is the two middle ROWS verbatim (26000 and 30000), and company C's 'average' would name a salary nobody earns — rn ascending + descending, both in [n/2, n/2 + 1]." },
        { slug: "find-the-median", why: "The reflex is brittle twice: LIMIT/OFFSET returns one of two middles and branches on parity — instead rn IN ((n+1)/2, n/2+1) with COUNT(*) OVER () for n, then AVG over the selection, answers odd and even identically." },
        { slug: "find-the-quiet-students-in-all-exams", why: "Mina is the counterexample: clean in exam 102, but her 90 ties exam 103's max — 'every exam' needs per-exam MIN/MAX bounds + NOT EXISTS (ties count as extremes) + a positive EXISTS so students who sat nothing stay out." },
        { slug: "students-report-by-geography", why: "A pivot as grain rotation: ROW_NUMBER per continent, the pair key (rn + 1) / 2 glues ranks (1,2)(3,4), and six MAX(CASE continent, parity) columns build each row — no three-way stitch, no FULL OUTER JOIN in disguise." },
        { slug: "merge-overlapping-events-in-the-same-hall", why: "Reach, not starts: hall 1's second event starts three days after the first yet belongs with it — the island boundary is start > running MAX(end_day); a running SUM numbers the islands, and GROUP BY hall/island takes MIN and MAX." },
        { slug: "employee-task-duration-and-concurrent-tasks", why: "The statement pins the model: concurrency is SAMPLED at each task's start — a self-inclusive containment count (both bounds inclusive, global across employees); julianday minutes summed per task." },
      ],
    },
  },
  {
    id: "premium2-games",
    title: "Premium Game Analysis",
    blurb:
      "Play-grade analytics — first-login device join-backs, inclusive running sums, vote count-outs, three-month salary windows with the latest month dropped and zero-student departments kept alive.",
    slugs: [
      "game-play-analysis-ii",
      "game-play-analysis-iii",
      "winning-candidate",
      "find-cumulative-salary-of-an-employee",
      "count-student-number-in-departments",
    ],
    study: {
      intro: [
        "The recurring coupling is aggregate plus fact: the earliest date per player is an aggregate — MIN over a GROUP BY computes it in one pass — but the device is a plain column of the row that happened to win the minimum. An aggregate query answers aggregate questions, and any bare column asked for in the same breath is borrowed from an unspecified row; the engine is under no obligation to pick the row that produced the MIN. The reliable shapes bind the fact to the winner explicitly: a CTE of per-player minima joined back on the aggregate key, or a window annotation plus a filter.",
        "Window frames are contracts, and every word earns its place. A running total is SUM(...) OVER (PARTITION BY player ORDER BY date) — the output grain stays the session, and a frame ending at CURRENT ROW includes the current row, because 'including' is doing real work in the spec. The salary variant needs ROWS 2 PRECEDING: with ORDER BY the default frame is RANGE, which treats equal VALUES as peers and lets same-month rows ride inside each other's windows — ROWS means exactly three physical rows. And when the report then drops each id's latest month, that is a second phase, not a clause.",
        "Join direction is decided before any counting starts. 'Zero-student departments count too' is a contract the join keyword writes: LEFT JOIN from Department threads every department through and fills the student side with NULLs, and COUNT over a student-side column counts non-NULLs — so zeros stay zero, where COUNT(*) would report 1 and an INNER join would silently vanish the empty faculty. Winners need only ballots cast: tally, join the names afterwards, ORDER BY count DESC LIMIT 1 — a zero-vote candidate contributes no group and cannot lead.",
      ],
      path: [
        { slug: "game-play-analysis-ii", why: "The aggregate-fact coupling: MIN(event_date) per player is a GROUP BY answer, but the device is a column of the winning row — a CTE of first logins joined back on (player_id, event_date) binds them; a bare column in the aggregate query is borrowed from an unspecified row." },
        { slug: "game-play-analysis-iii", why: "A running total that keeps sessions alive: SUM(games_played) OVER (PARTITION BY player ORDER BY event_date) — the frame ends at CURRENT ROW, which includes the current row, and the output grain stays one row per session." },
        { slug: "winning-candidate", why: "The plain argmax: GROUP BY candidateId over Vote, names joined afterwards, ORDER BY cnt DESC LIMIT 1 — an inner join suffices because a zero-vote candidate contributes no group and cannot lead." },
        { slug: "find-cumulative-salary-of-an-employee", why: "Every frame word earns its place: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW — the default RANGE frame would make same-month VALUES peers inside each other's windows; then the latest month per id is removed after aggregating." },
        { slug: "count-student-number-in-departments", why: "Join direction is the contract: LEFT JOIN from Department keeps the empty faculty, and COUNT(student-side column) counts non-NULLs so the zero survives — COUNT(*) would report 1 for a department with no students." },
      ],
    },
  },
  {
    id: "premium2-rankings",
    title: "Premium Distances & Rankings",
    blurb:
      "Geometry and leaderboards — oriented self-joins for shortest distances, semijoin follow graphs, first-login cohorts, tournament points and gaps-and-islands streaks.",
    slugs: [
      "shortest-distance-in-a-plane",
      "shortest-distance-in-a-line",
      "second-degree-follower",
      "new-users-daily-count",
      "tournament-winners",
      "find-the-start-and-end-number-of-continuous-ranges",
    ],
    study: {
      intro: [
        "Distances live on pairs, and the candidate space is a self-join. An ordered join of a points table to itself builds every pairing TWICE — (A, B) and (B, A) are the same distance in opposite directions — so the pairing rule imposes an orientation: keep the pair only when p1.x < p2.x, or when the x values tie and p1.y < p2.y. That clause is the whole dedup, and it halves the candidate set before any math runs. The measure itself (ABS of a difference, or a squared distance) is per-row arithmetic; MIN answers the question; sqrt and ROUND happen once, at the very end — never inside the loop.",
        "Populations defined by roles and by firsts need probes, not joins. Follower and followee are ROLES a user plays on a row — the same user can hold both — and 'holds both roles' is two EXISTS probes: a self-join would glue each follower's outgoing rows to their incoming rows and multiply. First-ever events need their filter BEFORE the aggregate: the WHERE that keeps only logins must run before MIN(activity_date), or engagement rows compete for earliest and win. Both patterns become per-entity CTEs, and the report then re-aggregates one grain up.",
        "Double-voice rows split, and runs collapse. A match row is two results wearing one row — UNION ALL the two player sides, each carrying BOTH scores so the win test becomes a within-row CASE, then conditional sums per player and a ROW_NUMBER argmax per group. Runs of consecutive ids are gaps-and-islands: the island key log_id - ROW_NUMBER() is constant inside a run (both climb by exactly one, so their difference cannot move) and jumps across gaps — GROUP BY it for start, end, and length.",
      ],
      path: [
        { slug: "shortest-distance-in-a-plane", why: "Manufacture pairs, then orient them: the lexicographic rule (p1.x < p2.x, or x equal and y smaller) halves the candidates; squared distance per row, MIN over candidates, and sqrt + ROUND once at the end." },
        { slug: "shortest-distance-in-a-line", why: "One column still hides pairs: p1.x < p2.x cuts 20 ordered pairings to 10 unordered candidates; ABS(x1 - x2) per row — the ABS is not cosmetic, a signed difference inherits the join's orientation." },
        { slug: "second-degree-follower", why: "Roles, not classes: the output is users holding BOTH roles — EXISTS probes the followee role on top of the follower rows (a self-join would cross outgoing × incoming and multiply); then GROUP BY follower, COUNT(DISTINCT followee)." },
        { slug: "new-users-daily-count", why: "Order of operations in the shape: WHERE activity_type = 'login' runs BEFORE MIN(activity_date) per user — engagement rows would otherwise compete and win; the CTE answers per user, the outer query re-aggregates per date." },
        { slug: "tournament-winners", why: "A match is two results in one row: UNION ALL the player sides, each carrying BOTH scores so the win test is a within-row CASE; SUM(CASE points) per player, roster LEFT JOINed, and ROW_NUMBER picks each group's champion." },
        { slug: "find-the-start-and-end-number-of-continuous-ranges", why: "The island key: log_id - ROW_NUMBER() over the kept rows — inside a run both climb by exactly one, so the difference cannot move; GROUP BY it for MIN(start), MAX(end), and COUNT as the length." },
      ],
    },
  },
  {
    id: "premium2-market",
    title: "Premium Market Analytics",
    blurb:
      "Market-grade joins — brand-mismatch buyers, friend-driven page recommendations, gender-first running totals, dangling foreign keys, trusted-contact chains and CASE-built boolean evaluators.",
    slugs: [
      "market-analysis-ii",
      "page-recommendations",
      "running-total-for-different-genders",
      "students-with-invalid-departments",
      "number-of-trusted-contacts-of-a-customer",
      "evaluate-boolean-expression",
    ],
    study: {
      intro: [
        "One table can serve two jobs in one query, and the alias count is the tell. A predicate that crosses roles — did the buyer, whose join_date matters, buy an item matching the SELLER's favorite brand? — forces Orders to join Users twice (once per role) plus Items once; collapsing the two Users joins into one is the classic first mistake, and it fails on ambiguity before the logic is ever tested. 'Different days' gets the same precision: at least two orders on different days is COUNT(DISTINCT order_date) >= 2, not COUNT(*) >= 2.",
        "Anti-joins and orientation carry the recommendations. 'Friends' pages minus my pages' is NOT EXISTS — the probe that gives NULL its business meaning, where NOT IN over a list containing one NULL erases every row. And friend edges stored once with no canonical order need the two-arm UNION read rule: one arm reads user2_id from rows matching on user1_id, the other reads user1_id from rows matching on user2_id — write only one arm and the seed's reversed rows (2, 1) silently vanish from the graph. Running totals add one more discipline: the window's ORDER BY drives the accumulation, the output's ORDER BY drives presentation — two different instruments.",
        "Spines, derived relations, and data-driven operators close the set. A report hangs off a spine table while the same table validates elsewhere — two aliases for two roles, the trusted set built as a derived relation (contacts joined to the directory by email), and both-endpoint rules judged only when every participant qualifies. Boolean evaluators resolve NAME operands through two aliases of a variables table, then translate a stored TEXT operator with CASE: the string '<' is not the less-than operator, it is a string that MEANS less-than — judged with CASE, never executed.",
      ],
      path: [
        { slug: "market-analysis-ii", why: "Two aliases, two jobs: Orders joins Users for the buyer's join_date and again for the seller's favorite_brand, plus Items once; the bar is COUNT(DISTINCT order_date) >= 2 — different DAYS, not two same-day orders." },
        { slug: "page-recommendations", why: "Storage direction is data: the two-arm UNION CTE reads the OTHER endpoint on either side — the seed's reversed rows (2,1) and (4,1) survive; then friends' liked pages, NOT EXISTS minus user 1's own, DISTINCT." },
        { slug: "running-total-for-different-genders", why: "Two ORDER BYs, two instruments: the window's (gender, day) drives the accumulation, the outer ORDER BY presents — the gender key ordered so the female block prints first, and the default frame making it running." },
        { slug: "students-with-invalid-departments", why: "The NULL-proof anti-join: NOT EXISTS probes Departments per student, so Ravi's NULL department matches nothing and Ravi is reported — NOT IN over a list containing NULL would erase every row." },
        { slug: "number-of-trusted-contacts-of-a-customer", why: "Customers plays two roles: directory (validating contact emails) and spine (the report hangs from it) — two aliases; a call counts toward C only when BOTH endpoints are trusted; LEFT JOIN + COALESCE keeps quiet customers at zero." },
        { slug: "evaluate-boolean-expression", why: "Operands are names, the operator is text: two Variables aliases resolve 'x' and 'y' to values, and CASE translates the stored '<' / '=' / '>' into comparisons — the TEXT '<' MEANS less-than, it is never executed." },
      ],
    },
  },
  {
    id: "premium2-orders",
    title: "Premium Orders & Inventory",
    blurb:
      "Commerce-grade reporting — company tax brackets, latest-order argmax inside a window, warehouse volumes, recursive missing-id grids, double-count-resistant fruit tallies and long-to-wide price pivots.",
    slugs: [
      "calculate-salaries",
      "the-most-recent-orders-for-each-product",
      "warehouse-manager",
      "find-the-missing-ids",
      "count-apples-and-oranges",
      "products-price-for-each-store",
    ],
    study: {
      intro: [
        "Group properties must land on individual rows. An employee's tax rate comes from their COMPANY's maximum salary, never their own — Marco's 18400 sits below every bracket yet is priced by company 2's 36000 ceiling. MAX(...) OVER (PARTITION BY company) repeats each group's ceiling on every one of its rows with no self-join and no grouped detour; a CASE then maps ceilings to rates through half-open bands, and rounding and casting happen exactly once, at the end.",
        "Order of operations is the game. Scope, then argmax: filter the range BEFORE ranking, or the window happily crowns rows nobody asked about — rank first and Bookend's March order answers a February question. Join, multiply, then sum: the multiplication grain is the joined row where all factors coexist (units × cube lives on a warehouse's stock of one product, not on either table alone), so SUM enters only after the join has materialized every such row — aggregating either side first double-counts.",
        "Absence and shape are the quiet skills. Missing ids are rows that do not exist — no GROUP BY enumerates them — so WITH RECURSIVE builds the candidate ladder first and LEFT JOIN + IS NULL keeps the gaps. Overlapping sources must be stacked, never joined: chests already summarize their boxes, so a join-and-sum double-counts everything the chest contains. And wide → long is a reshape, not an aggregation: each price column becomes a labeled stack of rows, the column's NAME promoted into DATA by a string literal, one SELECT branch per column.",
      ],
      path: [
        { slug: "calculate-salaries", why: "The group's ceiling on every row: Marco's 18400 is priced by company 2's max of 36000 — MAX(salary) OVER (PARTITION BY company_id), a CASE of half-open bands, and CAST(ROUND(salary × (1 - rate), 0)) once at the end." },
        { slug: "the-most-recent-orders-for-each-product", why: "Scope, then argmax: the February filter runs first — otherwise Bookend's March 5 order wins a question nobody asked; ROW_NUMBER per product on (order_date DESC, order_id DESC), keep rn = 1." },
        { slug: "warehouse-manager", why: "Multiply at the joined grain: units × width × length × height lives where all four numbers coexist — one joined row per (warehouse, product); join first, multiply per row, SUM per warehouse last." },
        { slug: "find-the-missing-ids", why: "Generate the space, keep the gaps: WITH RECURSIVE seeds 1 and climbs while under (SELECT MAX(customer_id)); LEFT JOIN Customers and keep the IS NULL rungs — absence is not something a GROUP BY can enumerate." },
        { slug: "count-apples-and-oranges", why: "Overlap, not complement: chest 1's 100/60 already contains its boxes, so joining Boxes to Chests and summing per box row double-counts; the inventory is every Chests row plus the NULL-chest Boxes rows — UNION ALL, then one SUM." },
        { slug: "products-price-for-each-store", why: "Wide to long is a reshape: SELECT 'store1' AS store, store1 AS price promotes the column's NAME into DATA — three branches, UNION ALL, per-branch NULL filters, ordered by product then store." },
      ],
    },
  },
  {
    id: "premium2-finals",
    title: "Premium Hopper & Champions",
    blurb:
      "Cohort-grade finals — monthly driver spines with hard join-date rules, acceptance percentages, requested-vs-accepted bucketing, recursive subtask grids, grand-slam unpivots and three-way candidate logic.",
    slugs: [
      "hopper-company-queries-i",
      "hopper-company-queries-ii",
      "hopper-company-queries-iii",
      "find-the-subtasks-that-did-not-execute",
      "grand-slam-titles",
      "find-interview-candidates",
    ],
    study: {
      intro: [
        "Spine-first reporting: 'one row per period' starts from a period table the query builds. WITH months AS (VALUES (10), (11)) turns the report's axis into data, facts are LEFT JOINed onto it, and the business rule (join_date <= month start) lives in the ON clause where it decides who matches without evicting the month. Unmatched months must read 0 — which is why COUNT counts the joined column, never *: COUNT(driver_id) over a NULL side is 0, while COUNT(*) would call an empty month 1.",
        "Ratios across grains, and buckets as contracts. The denominator (drivers on staff) and the numerator (distinct accepters) live at different grains, and the acceptance DATE lives on Rides — acceptances only become countable after AcceptedRides joins Rides, with COUNT(DISTINCT) weighing a driver once no matter how many rides they took. Bucket keys are contracts too: CAST(strftime('%m', requested_date) AS INTEGER) puts the boundary ride — requested Oct 31, accepted Nov 1 — in October; a wrong bucket is invisible in the output's shape and visible only in the numbers.",
        "Definitions vs logs, and wide vs tall. 'Everything that should have run' is a count, not rows — the recursive grid climbs per family with THAT family's own bound, which forces the recursive step to re-join the family table. Four champion columns and three medal columns are wide storage of tall facts: a UNION ALL unpivot makes them countable, carrying the ORDER column (contest, season) that streak logic needs — and columns of one row project independently, so a player holding two titles on one row still yields two rows.",
      ],
      path: [
        { slug: "hopper-company-queries-i", why: "The month axis is data: WITH months AS (VALUES (10), (11)) drives one row per reported month; LEFT JOIN with join_date <= month-start in ON, and COUNT(d.driver_id) — the column, never * — turns an empty month into 0 instead of 1." },
        { slug: "hopper-company-queries-ii", why: "Two populations, two grains, one ratio: the denominator is Part I's spine verbatim; the numerator is COUNT(DISTINCT ar.driver_id) after AcceptedRides joins Rides — the acceptance DATE lives there, and driver 1 must weigh once." },
        { slug: "hopper-company-queries-iii", why: "The bucket key is the contract: CAST(strftime('%m', requested_date) AS INTEGER) puts ride 4 (requested 10-31, accepted 11-01) in October's group — AVG distance and duration per bucket, ROUND to 2." },
        { slug: "find-the-subtasks-that-did-not-execute", why: "The definition side is a count: the recursive step re-joins TaskFamily so THAT family's subtasks_count bounds the climb; NOT EXISTS over executed (family, subtask) pairs then reads the gaps directly." },
        { slug: "grand-slam-titles", why: "Unpivot before counting: four UNION ALL projections read each champion column independently — player 2 holding two titles on one row still yields two rows; GROUP BY player, ORDER BY count DESC then player_id." },
        { slug: "find-interview-candidates", why: "One tall CTE feeds two rules: medals unpivoted WITH contest_id (the streak needs contest order) — consecutive golds are islands over the global contest ordering (run >= 2), the trifecta is COUNT(DISTINCT medal) = 3, and UNION merges the sets." },
      ],
    },
  },
  {
    id: "premium2-users",
    title: "Premium Users & Dates",
    blurb:
      "User-grade hygiene — ad-overlap anti-joins, positive-revenue sums, ordinal date formatting, global-average bars, salary-group dense ranks and same-day song graphs gated by friendship.",
    slugs: [
      "ad-free-sessions",
      "find-customers-with-positive-revenue-this-year",
      "convert-date-format",
      "orders-with-maximum-quantity-above-average",
      "group-employees-of-the-same-salary",
      "leetcodify-friends-recommendations",
    ],
    study: {
      intro: [
        "Exclusion predicates are compound, and naming them precisely is most of the work. An ad interacts with a playback session only when the customer matches AND the timestamp sits strictly inside the window — a join carrying a non-equi condition — and the answer is that probe's complement: the customers it never finds. Bucket judgment is the opposite shape, a pipeline with fixed clause order: WHERE slices the year, GROUP BY buckets the customer, HAVING judges the bucket's SUM — a row-level WHERE revenue > 0 answers 'had a good month sometime', not 'netted positive'.",
        "Strings are built by hand in SQLite, and scopes coexist as columns. Date formatting is part extraction — strftime('%d'), ('%m'), ('%Y') pieces assembled with || — with the ordinal suffix computed from arithmetic (the 11th, 12th and 13th handled before the % 10 rule) and month names pulled from a lookup CTE. Two scopes share one query as window columns: MAX over the order's partition and AVG over the empty partition ride every row at once — the GROUP BY + HAVING shape cannot hold both, because once rows are grouped every aggregate sees only its own group.",
        "Windows run in phases, and meetings have a grain. Membership (how many hold my salary?) and identity (where does it rank?) are different questions — compute the COUNT OVER partition in an inner query, prune the solo salaries, then DENSE_RANK outside; the phase order IS the trick. Song meetings live at (pair, day, song) grain: a self-join equal on BOTH day and song with a strict user inequality — the inequality canonicalizes the pair AND blocks self-pairing — then per-pair-day counting, and the friendship table gates who may be recommended at all.",
      ],
      path: [
        { slug: "ad-free-sessions", why: "Name the compound predicate: share customer AND session_start < timestamp < session_end — a non-equi probe; the answer is its complement, the Playback customers the probe never finds." },
        { slug: "find-customers-with-positive-revenue-this-year", why: "Judge the bucket, not the rows: WHERE slices 2021, GROUP BY customer, HAVING SUM(revenue) > 0 strict — a row-level WHERE revenue > 0 would miss customers whose negatives net positive." },
        { slug: "convert-date-format", why: "A string factory: strftime('%d') / ('%m') / ('%Y') pieces, the ordinal suffix from % 10 with 11/12/13 handled first, month names from a lookup CTE — all assembled with ||." },
        { slug: "orders-with-maximum-quantity-above-average", why: "Two scopes as columns: MAX(quantity) OVER (PARTITION BY order_number) and AVG(quantity) OVER () ride the ungrouped rows — filter max > avg, DISTINCT; the GROUP BY + HAVING shape compares an order to itself." },
        { slug: "group-employees-of-the-same-salary", why: "Phases, not one query: COUNT(*) OVER (PARTITION BY salary) answers membership in an inner query, WHERE prunes the solo salaries, and DENSE_RANK() OVER (ORDER BY salary DESC) assigns identity outside." },
        { slug: "leetcodify-friends-recommendations", why: "The meeting grain is (pair, day, song): self-join equal on BOTH day and song_id with l2.user_id > l1.user_id — the inequality canonicalizes the pair and blocks self-pairing; GROUP BY pair-day, HAVING COUNT(DISTINCT song_id) >= 3, and Friendship gates the output." },
      ],
    },
  },
  {
    id: "premium3-stats",
    title: "Premium Stats & Eligibility",
    blurb:
      "Eligibility arithmetic — capacity cutoffs over descending score pools, six-hour timestamp buckets, login-without-stream accounting under NOT EXISTS, integer-division approval ratios, min-round acceptance gates and lifetime-spend tier labels that keep zero-purchase members on the roster.",
    slugs: [
      "find-cutoff-score-for-each-school",
      "count-the-number-of-experiments",
      "number-of-accounts-that-did-not-stream",
      "low-quality-problems",
      "accepted-candidates-from-the-interviews",
      "the-category-of-each-member-in-the-store",
    ],
    study: {
      intro: [
        "Eligibility is arithmetic that gets judged after grouping, and the grammar question — WHERE or HAVING — is the first decision every query here makes. A cutoff score, an approval ratio, a min-round gate: each compares an aggregate against a threshold, and WHERE cannot make that comparison because it runs before the groups exist. The section opens with the subtlest member of the family: a cutoff is a reverse-cumulative quantile — the LOWEST score whose at-or-above count still fits the capacity — and tied scores move in and out of range together, which is why counting-at-or-above beats any pick-the-k-th-element reading.",
        "Time buckets are built before they are grouped. The six-hour experiment blocks are pure integer arithmetic — hour of day divided by 6 collapses 24 hours onto 4 buckets — and because the bucket key is rebuilt as TEXT (date, zero-padded opening hour, ':00:00'), one GROUP BY over the rebuilt string carries every level of the report. Existence tests pair differently: the login-without-stream accounting is a positive EXISTS and a negative NOT EXISTS at the account grain, neither of which joins rows into the output — the first is satisfied by any qualifying row, the second by an absence.",
        "The rest is population survival and honest labels. The low-quality ratio promotes to floating point BEFORE dividing — integer / integer truncates to 0 or 1, and the load-bearing 100.0 is the whole fix. The store membership keeps zero-purchase members on the roster with a LEFT JOIN from Member and COALESCE(SUM(spent), 0), then labels with a descending CASE. Both guards on the accepted candidate quantify over the candidate's whole round set, so both land in HAVING. Every query here ends at a table someone will read, and each label is a contract stated in the query.",
      ],
      path: [
        { slug: "find-cutoff-score-for-each-school", why: "The reverse-cumulative quantile: pair each distinct score with its at-or-above count, keep the loads that fit the capacity, and MIN(score) names the cutoff — a counting-at-or-above problem, never a k-th-element pick, because tied scores move in and out of range together." },
        { slug: "count-the-number-of-experiments", why: "Bucketing is arithmetic before grouping: hour / 6 in integer division collapses the day onto 4 blocks, and the bucket key is rebuilt as TEXT — date, zero-padded opening hour, ':00:00' — so one GROUP BY carries day and block at once." },
        { slug: "number-of-accounts-that-did-not-stream", why: "Two existence tests at the account grain: EXISTS proves the 2024 login, NOT EXISTS proves the missing stream — neither test joins rows INTO the output, so both live in subqueries correlated back to the candidate account." },
        { slug: "low-quality-problems", why: "The arithmetic is the trap: integer / integer truncates, so likes / (likes + dislikes) evaluates to 0 or 1 and multiplying by 100 afterwards reports only the extremes — writing 100.0 forces the division into floating point first, and < 50 stays strict." },
        { slug: "accepted-candidates-from-the-interviews", why: "Both acceptance guards are statements about a GROUP — took enough rounds, no weak round — so both belong in HAVING: COUNT(*) >= 2 AND MIN(score) > 2; WHERE filters rows and cannot see the group." },
        { slug: "the-category-of-each-member-in-the-store", why: "The member who owns nothing shapes the query: LEFT JOIN from Member keeps them on the roster, COALESCE(SUM(spent), 0) states the zero-spend contract, and a descending CASE labels VIP, Preferred, Standard." },
      ],
    },
  },
  {
    id: "premium3-commerce",
    title: "Premium Commerce & Discounts",
    blurb:
      "Commerce hygiene — conditional DELETEs that spare the type-0 rows that justify them, same-row date+amount eligibility under COUNT(DISTINCT), user spines that keep never-passenger drivers at zero, and per-buyer argmax with a stated tie-break.",
    slugs: [
      "drop-type-1-orders-for-customers-with-type-0-orders",
      "the-number-of-users-that-are-eligible-for-discount",
      "the-users-that-are-eligible-for-discount",
      "number-of-times-a-driver-was-a-passenger",
      "product-sales-analysis-iv",
      "product-sales-analysis-v",
    ],
    study: {
      intro: [
        "Writes have predicates too, and the hardest one here crosses rows. The DELETE's victim set is an intersection of two conditions that live on DIFFERENT rows of the same table: the row being deleted must itself be a backorder — a row-local WHERE arm — but its customer must also own some other type-0 row, a property no arm of a single WHERE can see. So the statement needs two layers: the row-local guard plus a customer_id IN (SELECT ...) subquery. Reads that follow the same shape — eligibility flowing uphill from purchase to user — start with the row filter, because SQL evaluates WHERE predicates row by row before anything user-shaped happens.",
        "Population questions decide the spine before touching the join. 'For every user' is a claim only the User table can back — the user who never rode at all must still surface — so the driver-passenger report is FROM User LEFT JOIN Ride ON passenger_id, grouping over the spine and COUNTing the ride-side column, where the never-passenger stays honestly at zero. An aggregation over Ride could not even name that user; the INNER join erases them without error, which is the worst kind of bug.",
        "Rankings stack grains, and skipping the lower one is the classic lie. The per-buyer winner needs per-(buyer, product) totals FIRST — ranking raw sales rows would rank single-sale quantities — then a ROW_NUMBER over buyer with a stated tie-break keeps exactly one row. The simpler leaderboard aggregates first and ranks aggregates: GROUP BY buyer with SUM, ORDER BY total DESC with the buyer-id tie-break, LIMIT 2 — safe precisely because LIMIT cuts aggregate rows, not underlying sales.",
      ],
      path: [
        { slug: "drop-type-1-orders-for-customers-with-type-0-orders", why: "The victim set lives on two rows: the deleted row must itself be a backorder (row-local arm) AND its customer must own a type-0 row — a property no single WHERE can see — so the DELETE is a row-local guard plus a customer_id IN (SELECT ...) layer." },
        { slug: "the-number-of-users-that-are-eligible-for-discount", why: "Eligibility is a property of a purchase first: shrink Purchase to rows carrying BOTH arms — the exact date AND amount >= 1000 — then COUNT(DISTINCT user_id); nothing user-shaped precedes the row filter." },
        { slug: "the-users-that-are-eligible-for-discount", why: "The counting twin, unfolded: the same two-arm row filter, then SELECT DISTINCT user_id with a result-level ORDER BY — eligibility does not loosen just because the answer is a list instead of a number." },
        { slug: "number-of-times-a-driver-was-a-passenger", why: "Decide the spine before the join: 'for every user' is a population question only User can answer — FROM User LEFT JOIN Ride ON passenger_id, GROUP BY user, COUNT the ride-side column, and the never-passenger stays at zero." },
        { slug: "product-sales-analysis-iv", why: "Two grains stacked: GROUP BY (buyer, product) with SUM(quantity) first — ranking raw rows would rank single-sale quantities — then ROW_NUMBER over buyer with (total DESC, product_id ASC), keep rn = 1, join names." },
        { slug: "product-sales-analysis-v", why: "Aggregation before ranking: SUM(quantity) per buyer folds seven sales into four totals, then ORDER BY total DESC, buyer_id ASC with LIMIT 2 — safe because LIMIT cuts aggregate rows, not underlying sales." },
      ],
    },
  },
  {
    id: "premium3-arena",
    title: "Premium Contests & Boards",
    blurb:
      "Competition machinery — earliest-eligible-bus boarding, weight-capped greedy fills that leave one rider behind, consecutive-day win islands, applied score deltas ranked with RANK, full round-robin fixture grids and strictly-above percentages under a field of six.",
    slugs: [
      "the-number-of-passengers-in-each-bus-i",
      "the-number-of-passengers-in-each-bus-ii",
      "longest-winning-streak",
      "the-change-in-global-rankings",
      "all-the-matches-of-the-league",
      "compute-the-rank-as-a-percentage",
    ],
    study: {
      intro: [
        "Counting riders per bus is grouping; deciding WHICH bus a rider belongs to is a rule, and the rule comes first. The gentle version resolves each rider to the earliest timetable entry at or after their arrival — a minimum over a filtered set — and only then aggregates the assignments over the bus spine. The hard version is genuinely sequential: whether a rider boards depends on the loads earlier riders built, so no single GROUP BY or window pass can produce it — a recursive CTE walks the queue in arrival order carrying every bus's running load, and a CASE chain picks the first time-eligible bus with room. Assignment before counting, always.",
        "Streaks are relationships between adjacent rows, and counting totals is not the ask: two teams can win the same number of days while one's longest run is half the other's. The island trick — day minus per-team ROW_NUMBER — collapses each unbroken run into one key, and the report reads COUNT per island, MAX per team. Ranking reports live at two grains and must reduce before they combine: net deltas are SUMmed per team BEFORE they touch base points, then RANK() runs over the totals with the id tie-break making the order total.",
        "Pair spaces are manufactured, not found. The fixture list is the purest cross join in the book — every team against every team, the diagonal deleted — and a <= b would be a lie, because home and away are both real. Percentages are three window counts in one pass: the field size from COUNT(*) OVER (), the at-or-above count riding the RANGE frame up to the current tie group, the tie group itself subtracted out — strictly-above over field, scaled by 100.0 and rounded.",
      ],
      path: [
        { slug: "the-number-of-passengers-in-each-bus-i", why: "Assign, then count: each rider's bus is MIN(bus_no) among buses arriving at-or-after their minute — a minimum over a filtered set — and only then does the bus spine LEFT JOIN and aggregate the assignments." },
        { slug: "the-number-of-passengers-in-each-bus-ii", why: "The assignment is genuinely sequential — whether rider 5 boards depends on loads earlier riders built — so a recursive CTE walks the queue in (arrival_time, passenger_id) order carrying every bus's running load, and a CASE chain picks the earliest bus with room." },
        { slug: "longest-winning-streak", why: "Counting wins is not the ask — both teams total 4, but one's longest run is 2: day minus per-team ROW_NUMBER builds the island key, COUNT per island measures runs, MAX per team picks the longest." },
        { slug: "the-change-in-global-rankings", why: "Two grains: GROUP BY team with SUM(points_delta) reduces the deltas BEFORE they touch base points — joining raw deltas would fan every team out to one row per delta — then RANK() OVER (total DESC, team_id ASC)." },
        { slug: "all-the-matches-of-the-league", why: "The purest cross join: Team a CROSS JOIN Team b builds all 9 ordered pairs and WHERE a.team_id <> b.team_id deletes the diagonal — a <= b would delete half the fixtures, and home and away are both real." },
        { slug: "compute-the-rank-as-a-percentage", why: "Three window counts in one pass: COUNT(*) OVER () sizes the field, the at-or-above count rides the default RANGE frame up to the tie group, the tie-group count subtracts — strictly-above over field, scaled by 100.0, ROUND to 2." },
      ],
    },
  },
  {
    id: "premium3-mold",
    title: "Premium Pivots & Layouts",
    blurb:
      "Table shape-shifting — polynomial strings assembled slot-by-slot with MAX(CASE), two columns sorted in opposite directions and zipped by position, fixed-slot pivots that keep missing months NULL, UNION ALL unpivots that drop NULL cells, and F-M interleave arrangements with the leftover tail.",
    slugs: [
      "build-the-equation",
      "order-two-columns-independently",
      "dynamic-pivoting-of-a-table",
      "dynamic-unpivoting-of-a-table",
      "arrange-table-by-gender",
    ],
    study: {
      intro: [
        "Shape-shifting follows the axis: when the axis is finite and KNOWN, every pivot and assembly becomes conditional aggregation — reserve one output slot per axis value and fill it with MAX(CASE WHEN ...). That is why GROUP_CONCAT is exactly the wrong tool for the polynomial: its output order is an implementation detail SQLite does not guarantee, ORDER BY or not, while exponents 3, 2, 1 are fixed slots waiting to be filled. The unpivot is the inverse rotation with a twist — the column NAME becomes data, which no single SELECT can produce from one row, so each wide column contributes a UNION ALL branch stamping its own label literal and dropping its NULL cells.",
        "The row as a unit is negotiable. Sorting two columns independently and zipping them by position destroys the input row entirely: no output row is 'the row where the two values relate' — both values come from DIFFERENT source rows, chosen only by their ranks in two independent orderings. Two ROW_NUMBER numberings of the same table, one ASC and one DESC, joined on the ordinal, is the honest shape; any join on row_id answers a different question.",
        "Some layouts are invented, not extracted. The gender interleave asks the engine to produce SEATS — position 1 an F, position 2 an M — that no column knows: per-gender ROW_NUMBERs fold onto one shared integer line (F to the odd seats 2*rn − 1, M to the even 2*rn), and the leftover O rows key past 2 × the thread length so a single ORDER BY lays the whole table out. Positional arithmetic over ordinals is the tool; sorting by data values is not.",
      ],
      path: [
        { slug: "build-the-equation", why: "GROUP_CONCAT is exactly the wrong tool — its order is an implementation detail. The exponent axis is finite and known (3, 2, 1): MAX(CASE) fills fixed slots with COALESCE to '', and one SUBSTR strips the leading '+'." },
        { slug: "order-two-columns-independently", why: "This report destroys the row as a unit: two ROW_NUMBER numberings of the same table (one ASC, one DESC), joined position-wise on the ordinal and emitted in position order — any join on row_id answers a different question." },
        { slug: "dynamic-pivoting-of-a-table", why: "A truly dynamic pivot needs dynamic SQL, but the axis here is known — months 1, 2, 3 — so it becomes conditional aggregation: one SUM(CASE) slot per month over a full-table GROUP BY store_id, missing months staying NULL." },
        { slug: "dynamic-unpivoting-of-a-table", why: "The inverse rotation, where the column NAME becomes data: three UNION ALL branches stamp 'Q1'/'Q2'/'Q3' literals, each filtered to its own column IS NOT NULL, sorted once outside the compound." },
        { slug: "arrange-table-by-gender", why: "The engine must invent SEATS, not sort by values: per-gender ROW_NUMBER with a person_id tie-break, F folded to the odd seats (2*rn − 1), M to the even (2*rn), the O tail keyed past 2 × the thread length — one ORDER BY on the seat key." },
      ],
    },
  },
  {
    id: "premium3-ops",
    title: "Premium Operations & Classify",
    blurb:
      "Operations reporting — weekend-versus-weekday pivots off strftime's text codes, influence gated by the customer's salesperson bearing more than one account, four-key Olympic sorts, forward-fill readings that never backfill, top-two atom picks per molecule and parenthesized profession badges.",
    slugs: [
      "tasks-count-in-the-weekend",
      "calculate-the-influence-of-each-salesperson",
      "sort-the-olympic-table",
      "change-null-values-in-a-table-to-the-previous-value",
      "form-a-chemical-bond",
      "concatenate-the-name-and-the-profession",
    ],
    study: {
      intro: [
        "Derived keys must be VALUE-ized before any aggregation can see them. The weekend report's calendar knowledge lives nowhere in the table — strftime('%w') turns each TEXT date into a one-character weekday code, returned as TEXT, never as a number — and a CASE folds those codes into the two labels the report wants, grouped by the label with a weekend-first CASE sort key. Sort ladders are the same idea in reverse: the multi-key Olympic ORDER BY has no aggregation at all, and the key sequence gold, silver, bronze, country IS the ranking rule — later keys are consulted only when every earlier key ties, and the ASC last key makes the order total.",
        "Gated chains keep each test on the table that owns the relationship. The influence rule reads purchase, then customer, then serving salesperson — so the more-than-one test is a GROUP BY salesperson_id HAVING COUNT(*) > 1 over Customer alone (Purchase knows nothing about salespeople and never should), gated inside the ON of a LEFT JOIN chain that keeps every salesperson with COALESCE'd totals. Forward-fill is a per-row question GROUP BY cannot even express: a correlated subquery re-opens the table, keeps strictly earlier non-NULL values, sorts DESC and takes LIMIT 1 — COALESCE layers the two cases, and the fill runs forward only, never back.",
        "Classification and assembly round out the section. 'The two smallest atoms of each molecule' is top-N-per-group — ROW_NUMBER over the molecule assigns positions, and ROW_NUMBER's strictly-increasing contract is what the MAX(CASE) pivot below relies on. The profession badge is string assembly: pieces glued by ||, SQLite's concatenation operator, which never attempts arithmetic — the literals carry the format, space and parentheses included.",
      ],
      path: [
        { slug: "tasks-count-in-the-weekend", why: "Calendar knowledge must become a VALUE before aggregation sees it: strftime('%w') returns TEXT codes 0–6, a CASE folds them into the two labels, and the report groups by the label with a weekend-first CASE sort key." },
        { slug: "calculate-the-influence-of-each-salesperson", why: "The more-than-one test rides on Customer — the table that owns the serving relationship — as GROUP BY salesperson_id HAVING COUNT(*) > 1 gated inside the ON; Purchase never knows about salespeople, and the LEFT JOIN chain keeps every salesperson with COALESCE'd totals." },
        { slug: "sort-the-olympic-table", why: "No aggregation, no filtering, no joins — the entire task is a total order: gold DESC, silver DESC, bronze DESC, country ASC, later keys consulted only on ties, the ASC last key making the order total." },
        { slug: "change-null-values-in-a-table-to-the-previous-value", why: "A per-row question GROUP BY cannot express: COALESCE over a correlated argmax — re-open Reading, keep strictly earlier non-NULL values, ORDER BY reading_id DESC LIMIT 1 — forward fill only, never back." },
        { slug: "form-a-chemical-bond", why: "Top-N-per-group, then pivot: ROW_NUMBER over (molecule_id, atom_id) assigns positions, rn <= 2 survives, MAX(CASE) pivots the two slots into one row per molecule — ROW_NUMBER's strict contract is what the pivot relies on." },
        { slug: "concatenate-the-name-and-the-profession", why: "The badge is string assembly: name || ' (' || UPPER(SUBSTR(profession, 1, 1)) || ')' — || never attempts arithmetic, and the literals carry the space and the parentheses." },
      ],
    },
  },
  {
    id: "premium3-finales",
    title: "Premium Hard Streaks & Budgets",
    blurb:
      "The batch's hard wall — friendship-gated taste graphs over DISTINCT shared songs, per-role budget greeds whose running sums swallow salary ties, one shared pool hiring across roles, strictly-increasing purchase islands of length three, consecutive-year order quotas and two-hop chart counts.",
    slugs: [
      "leetcodify-similar-friends",
      "the-number-of-seniors-and-juniors-to-join-the-company",
      "the-number-of-seniors-and-juniors-to-join-the-company-ii",
      "customers-with-strictly-increasing-purchases",
      "products-with-three-or-more-orders-in-two-consecutive-years",
      "count-artist-occurrences-on-spotify-ranking-list",
    ],
    study: {
      intro: [
        "Greedy hiring reads like a loop — sort, accumulate, stop — but every piece of it is a window clause in disguise. SUM(salary) OVER (PARTITION BY role ORDER BY salary, candidate_id) <= budget is the whole machine: the partition gives each role a private race, the two-column ORDER BY encodes cheapest-first AND the tie policy in one line, and the <= comparison stops the accumulation where the budget says so. The section's twin diff is one clause: drop the PARTITION BY and the running total swallows salary ties across seniors and juniors alike, because the pool — and the consideration order — is shared.",
        "Runs are properties of STEPS, not of rows. A purchase rises when its amount beats the purchase before it, so LAG(amount) over a (date, id) ordering places each predecessor beside its successor and the flag is one comparison; the flag's running sum builds island keys, and a 3-purchase run is an island carrying two rising steps. Consecutive-YEAR tests need a grain the base table does not have: GROUP BY (product, CAST(strftime('%Y') AS INTEGER)) builds per-year counts first, then a self-join on year = year + 1 holds both sides to the quota.",
        "Pairs are canonicalized and bridges are mandatory. The shared-song overlap is a self-join on song_id where l1.user_id < l2.user_id does two jobs at once — discards the degenerate self-pairings AND hands every pair one canonical row — before HAVING judges the DISTINCT song count, and the friendship gate is EXISTS-checked in either orientation because storage order is not semantics. The artist chart has no column that names an artist at all: chart reaches Song by song_id, Song reaches Artist by artist_id, and the two-hop inner-join chain is the whole topology.",
      ],
      path: [
        { slug: "leetcodify-similar-friends", why: "Shared-song overlap is a self-join before anything else: l1.user_id < l2.user_id discards self-pairings AND canonicalizes the pair, HAVING COUNT(DISTINCT song_id) >= 3 judges the overlap, and Friendship is EXISTS-checked in either orientation." },
        { slug: "the-number-of-seniors-and-juniors-to-join-the-company", why: "A loop in window clothing: SUM(salary) OVER (PARTITION BY role ORDER BY salary, candidate_id) <= budget is sort, accumulate and stop in one clause — each role a private race, tied salaries still distinct rows ordered by candidate_id." },
        { slug: "the-number-of-seniors-and-juniors-to-join-the-company-ii", why: "The whole diff from the per-role race is one clause: no PARTITION BY — the running SUM swallows salary ties across seniors and juniors alike — and a VALUES role scaffold LEFT JOINed to per-role counts keeps both roles reporting at zero hires." },
        { slug: "customers-with-strictly-increasing-purchases", why: "A rising run is a property of STEPS: LAG(amount) over (date, id) flags each rise, the flag's running sum builds island keys, and any island carrying two or more rising steps is the 3-purchase run the report wants." },
        { slug: "products-with-three-or-more-orders-in-two-consecutive-years", why: "The report lives at a grain the base table lacks: GROUP BY (product, CAST(strftime('%Y') AS INTEGER)) builds per-year counts, then a self-join on year = year + 1 with BOTH sides >= 3, DISTINCT, ordered." },
        { slug: "count-artist-occurrences-on-spotify-ranking-list", why: "No chart row names an artist, so the bridge is mandatory: chart reaches Song by song_id, Song reaches Artist by artist_id — two inner joins — then COUNT(*) per artist ordered by count DESC, name ASC." },
      ],
    },
  },
  {
    id: "premium4-flow",
    title: "Premium Delivery & Flow",
    blurb:
      "Throughput reporting — same-day delivery ratios under two competing definitions, last-use timestamps that ignore trip ids, 30-day window actives under COUNT(DISTINCT) days, whole-word text matching with punctuation padding, cancelled-trip distance sums and CASE-bucketed quantity ladders.",
    slugs: [
      "immediate-food-delivery-iii",
      "bikes-last-time-used",
      "find-active-users",
      "count-occurrences-in-text",
      "total-traveled-distance",
      "calculate-orders-within-each-interval",
    ],
    study: {
      intro: [
        "Ratios are computed inside one grouped pass, and every part of the fraction is conditional arithmetic: the month key CAST from strftime('%Y-%m'), SUM(CASE WHEN pref = 'immediate' THEN 1 ELSE 0 END) as the numerator, COUNT(*) as the denominator — every row in the group is an order, so the count needs no filtering. The 100.0 dot is load-bearing for the same integer-division reason as always, and ROUND stays in the outer SELECT so the comparison arithmetic is never done on rounded values.",
        "COUNT flavors decide answers here, not style. The active-users gate counts DAYS — Cleo's double-sign-in makes COUNT(login_date) report 7 while COUNT(DISTINCT login_date) reports 6, and Fay's five raw rows hide four distinct days, which flips the verdict — so the HAVING is COUNT(DISTINCT login_date) >= 5 over a closed June window. The bikes report is the opposite shape: the output IS the extreme value itself, so GROUP BY bike_id with MAX(end_time) suffices — no join-back, because no other column of the winning row is requested.",
        "Spines and boundaries finish the set. The distance report drives FROM User — an INNER join would erase the rider with no trips, silently — with the status filter living in the ON so the LEFT JOIN keeps its population. Whole-word matching makes boundaries physical: normalize until words are separated by literal spaces, pad, and demand the token WITH its padding, because the bare substring hides inside cached and cachet alike. Bucket ladders are CASE mappings with closed BETWEEN ranges, and the seed plants both edges of every bucket — one unit apart, different labels — to hold the query to the contract.",
      ],
      path: [
        { slug: "immediate-food-delivery-iii", why: "A per-month ratio in one grouped pass: the 'YYYY-MM' text key from strftime, SUM(CASE WHEN pref = 'immediate' THEN 1 ELSE 0 END) over COUNT(*), 100.0 forcing real division, ROUND to 2 outside the arithmetic." },
        { slug: "bikes-last-time-used", why: "The output IS the extreme value itself: GROUP BY bike_id with MAX(end_time) — no join-back, because the report wants the value, not the row that carried it — and 'last used' reads off the return, not the checkout." },
        { slug: "find-active-users", why: "The grain of the count is the DAY: Cleo signs in twice on one date and Fay's five raw rows hold four distinct days — COUNT(DISTINCT login_date) >= 5 in HAVING over the closed June window." },
        { slug: "count-occurrences-in-text", why: "'Whole word' is the whole problem: substring search matches cached and cachet too — normalize (lowercase, punctuation to spaces, hyphens fused), pad with spaces, and count rows matching the token ' cache ' with its boundaries." },
        { slug: "total-traveled-distance", why: "The spine is User: an INNER join erases the rider with no trips silently, so LEFT JOIN with status in the ON — the filter must not shrink the population — GROUP BY user, COALESCE(SUM(distance), 0)." },
        { slug: "calculate-orders-within-each-interval", why: "Bucketing is a per-row mapping: three closed BETWEEN branches in CASE, the seed planting both edges of every bucket (quantity 3 stays small, 4 turns medium), grouped by the label, ordered by a CASE rank." },
      ],
    },
  },
  {
    id: "premium4-money",
    title: "Premium Money & Market",
    blurb:
      "Money mechanics — top-two gaps that survive duplicate maxima, calendar-true rolling averages over julianday RANGE frames, year-on-year anti-joins, group-versus-global price gates with exact-boundary cities, below-subject-average report cards and loan portfolios that keep 'none' customers.",
    slugs: [
      "highest-salaries-difference",
      "rolling-average-steps",
      "market-analysis-iii",
      "find-expensive-cities",
      "class-performance",
      "loan-types",
    ],
    study: {
      intro: [
        "Second-highest hides a definition: it must mean the second distinct TIER, not the second row. The seed's top is held by two rows at 95000, so any formulation that steps one ROW down — a ROW_NUMBER-2 read, a LIMIT-OFFSET — lands on the other 95000 and reports a gap of 0. DENSE_RANK builds the tiers, MAX(CASE) pivots tier 1 and tier 2 into one row, and the empty tier 2 makes the subtraction NULL — the honest answer when no runner-up exists. Calendar frames get the same scrutiny: the rolling average is AVG(steps) OVER (PARTITION BY user ORDER BY julianday day RANGE 1 PRECEDING .. CURRENT ROW), where the RANGE frame measures calendar distance and a ROWS frame would lie the moment two receipts share a day.",
        "Negative existence is a property of a whole partition, so no single row can prove it. The market report builds the 2022 item set and the 2021 item set separately — DISTINCT on both — and subtracts with NOT IN, an anti-join wearing a date mask. Two-grain comparisons split the same way: the expensive-city read computes per-city means in a grouped CTE and the global mean as a scalar subquery that is fully evaluated before the outer filter ever runs; the class report stamps every row with AVG(score) OVER (PARTITION BY subject) so the row survives to be compared — GROUP BY would collapse the very rows the report must keep.",
        "Join direction is the output contract, stated before any arithmetic. The loan classifier promises EVERY user, so it drives FROM User LEFT JOIN Loan — the INNER join erases the none-class user without an error, the worst kind of bug — and the CASE ladder reads the NULL side as COUNT(DISTINCT loan_type) = 0. Labels then fall out of ordered comparisons: rich over two types, middle over one, none over zero, with the empty user's row carrying the label the population contract demands.",
      ],
      path: [
        { slug: "highest-salaries-difference", why: "Second-highest means second distinct TIER: the top is held by two 95000 rows, so ROW_NUMBER-2 or OFFSET lands on the tie — DENSE_RANK builds the tiers, MAX(CASE) pivots 1 and 2, and an empty tier 2 honestly reports NULL." },
        { slug: "rolling-average-steps", why: "Everything hard lives in the frame: AVG(steps) OVER (PARTITION BY user ORDER BY CAST(julianday(walk_date) AS INTEGER) RANGE 1 PRECEDING .. CURRENT ROW) is calendar-true — a ROWS 2 PRECEDING frame lies the moment two receipts share a day." },
        { slug: "market-analysis-iii", why: "An anti-join wearing a date mask: build the 2022 item set and the 2021 item set separately (DISTINCT both), subtract with NOT IN — no single row can prove 'has no 2021 row'; it is a property of the item's whole partition." },
        { slug: "find-expensive-cities", why: "Two averages at two grains: the per-city mean in a grouped CTE, the global mean as a scalar subquery fully evaluated before the outer filter — compared strictly and raw, with ROUND applied only in the outer SELECT." },
        { slug: "class-performance", why: "Row versus its own group's aggregate: AVG(score) OVER (PARTITION BY subject) stamps every row with its subject's mean, and the outer WHERE compares strictly — GROUP BY would collapse the rows the report must keep." },
        { slug: "loan-types", why: "The output contract fixes the join direction: EVERY user appears, so User LEFT JOIN Loan — the empty user's NULL side reads COUNT(DISTINCT loan_type) = 0, and the CASE ladder labels rich, middle, none." },
      ],
    },
  },
  {
    id: "premium4-streaks",
    title: "Premium Consecutive Engines",
    blurb:
      "The four hard engines — strictly-rising transaction runs via LAG-flag islands, two-hop popularity percentages that exclude existing friends, calendar-day purchase streaks fused through julianday arithmetic, and capacity floor-division argmax across item types.",
    slugs: [
      "consecutive-transactions-with-increasing-amounts",
      "popularity-percentage",
      "customers-with-maximum-number-of-transactions-on-consecutive-days",
      "maximize-items",
    ],
    study: {
      intro: [
        "Adjacency is manufactured, never assumed. A rising run is a relationship between ADJACENT rows, and adjacency only exists once an ordering is fixed: LAG(amount) OVER (PARTITION BY customer ORDER BY tx_date, tx_id) hands every transaction its chronological predecessor, and the two-column ORDER BY is not decoration — the tx_id is what makes two same-day transactions comparable. The up-flag is then one comparison, the flag's running sum builds island keys, and the run's length falls out of a COUNT per island. The same engine powers the purchase-streak finale, where the dedupe comes FIRST: two receipts on one day would take two row numbers, the same date would map to two different island keys, and one unbroken run would be reported as fragments.",
        "Graph questions read a directed form the storage does not show. Each friendship is one row, but every walk traverses it in both directions — a self-join that only follows the stored orientation does not merely run slower, it changes answers. So the UNION ALL of both orientations comes first, doubling six stored rows into twelve directed edges, and every neighborhood question afterwards reads against that undirected CTE: two-hop pairs self-join the edge list, anti-joins remove self and existing friends, and the distinct-user spine keeps zero-degree users reporting at zero percent.",
        "Greedy fills are arithmetic once the unit cost is honest. The item maximizer takes a per-type MIN(cost) BEFORE any warehouse math — the catalog's pricier rows are decoys, and AVG is the natural slip that dilutes the price a bulk buyer would pay — then CROSS JOINs warehouses with types, computes the floor division through a 1.0 promotion, and argmaxes with a stated tie-break. Three engines, one discipline: fix the state (ordering, orientation, unit), then let the pattern run.",
      ],
      path: [
        { slug: "consecutive-transactions-with-increasing-amounts", why: "A rising run is a relationship between ADJACENT rows: LAG(amount) over (tx_date, tx_id) — the id makes same-day transactions comparable — flags each rise, running flag-sums build island keys, and islands of 3+ rank longest-first with smallest start as tie-break." },
        { slug: "popularity-percentage", why: "The storage contract hides the first decision: one row per friendship, but every walk traverses both directions — UNION ALL doubles six stored rows into twelve directed edges, two-hop pairs anti-join out self and friends, and the distinct-user spine keeps zero-percent users reporting." },
        { slug: "customers-with-maximum-number-of-transactions-on-consecutive-days", why: "The dedupe is what keeps the numbering honest: two receipts on one day would take two numbers and fragment one unbroken run — DISTINCT (customer, day) first, then julianday minus ROW_NUMBER island keys, per-customer MAX, and the global-MAX join-back." },
        { slug: "maximize-items", why: "The unit cost is a per-type property taken BEFORE any warehouse math — AVG dilutes it with decoy costs — then CROSS JOIN warehouses with types, floor division through a 1.0 promotion, and ROW_NUMBER argmax with (count DESC, type ASC)." },
      ],
    },
  },
  {
    id: "premium4-city",
    title: "Premium City & Shapes",
    blurb:
      "Spatial and structural reads — peak calling hours under a smallest-hour tie rule, mirrored coordinate pairs deduped across four-row families, flight occupancy with zero-floor waitlists, triangle equality classes, tree role labels over NULL parents and age-bucket sender/open tallies.",
    slugs: [
      "find-peak-calling-hours-for-each-city",
      "symmetric-coordinates",
      "flight-occupancy-and-waitlist-analysis",
      "classifying-triangles-by-lengths",
      "binary-tree-nodes",
      "snaps-analysis",
    ],
    study: {
      intro: [
        "Grains are chosen, not given. The peak-hours report crosses city with hour of day and deliberately throws the date away — two calls on different days, same hour, one bucket — and the CAST matters twice: strftime returns TEXT, and a text hour both sorts wrongly ('21' sorts before '8') and prints with a leading zero. Mirrored coordinates are the opposite grain: nothing aggregates at all, and the whole task is relational matching — a self-join where each row proposes its own mirror and the other side confirms it exists, with a smaller-x guard canonicalizing the unordered pair for output.",
        "Join direction is a contract, and CASE discipline is an ordering puzzle. The flight report promises every flight, so it LEFT JOINs from Flight — flight 4's zero bookings must survive — tallies with COUNT(booking column) so NULLs never inflate, and floors the waitlist at zero. The triangle classifier lives or dies on CASE's first-match-wins rule: every equilateral row also satisfies the isosceles test, so the all-equal branch is evaluated first, and the ELSE catches scalene. The tree labels ask two independent questions — does it have a parent, does it have a child — in one ordered CASE with no overlapping tests.",
        "Counting people inside groups is conditional aggregation's finest hour. The snaps report climbs two grains in one query — activity rows must become distinct users, users must become per-bucket tallies — and the pattern does both in one pass: CASE WHEN snap_type = 'sent' THEN user_id END builds the sender population inside the group, and COUNT(DISTINCT ...) counts people rather than events, because one user firing three snaps is still one sender.",
      ],
      path: [
        { slug: "find-peak-calling-hours-for-each-city", why: "The grain is city × hour of day — the date is deliberately thrown away — and the CAST matters twice: a text hour sorts wrongly ('21' before '8') and prints padded. ROW_NUMBER per city over (calls DESC, hour ASC) keeps rn = 1, the smallest-hour tie rule." },
        { slug: "symmetric-coordinates", why: "Nothing aggregates — the whole task is relational matching: Point joins to itself on p1.x = p2.y AND p1.y = p2.x, each row proposing its own mirror, with the smaller-x guard canonicalizing the unordered pair before DISTINCT." },
        { slug: "flight-occupancy-and-waitlist-analysis", why: "The join direction is a contract: flight 4 holds zero bookings and an INNER join would make it vanish from a report about every flight — LEFT JOIN, COUNT(booking column) tallies so NULLs never inflate, CASE labels, and the zero-floored waitlist." },
        { slug: "classifying-triangles-by-lengths", why: "CASE is a first-match-wins evaluator, so classification becomes an ordering puzzle: every equilateral row also satisfies the isosceles test, so the all-equal branch is evaluated first — ELSE scalene." },
        { slug: "binary-tree-nodes", why: "Two independent questions, one ordered CASE: does it have a parent (root iff parent_id IS NULL), does it have a child (correlated EXISTS → inner, else leaf) — no overlapping tests." },
        { slug: "snaps-analysis", why: "The report climbs two grains in one query: CASE WHEN snap_type = 'sent' THEN user_id END builds the sender population inside the group, and COUNT(DISTINCT ...) counts people, not events — one user firing three snaps is still one sender." },
      ],
    },
  },
  {
    id: "premium4-boards",
    title: "Premium Boards & Percentiles",
    blurb:
      "Leaderboard machinery — largest-department managers over empty groups, weighted means against naive AVG deception, third-transaction picks through timestamp ties, RANK-based top-two regions that keep ties, PERCENT_RANK fraud gates and composite argmax with alphabetical tie-breaks.",
    slugs: [
      "manager-of-the-largest-department",
      "calculate-compressed-mean",
      "find-third-transaction",
      "top-three-wineries",
      "top-percentile-fraud",
      "employees-project-allocation",
      "find-candidates-for-data-scientist-position",
    ],
    study: {
      intro: [
        "Argmax over groups has one hard edge: the winner's count is a GLOBAL fact, and a maximum of counts is an aggregate over aggregates, which SQL does not nest. So the largest-department report materializes every headcount in a counts CTE, takes MAX over those counts as the bar, and joins back keeping headcount = max — the join-back pattern that shows up wherever 'the best' must be compared across groups. The compressed mean is the same respect for what the rows mean: the table has already merged workers into buckets, so AVG(hourly_wage) answers a different question, and the mean is SUM(wage × count) / SUM(count), promoted to REAL.",
        "The three ranking functions disagree exactly where ties live. ROW_NUMBER breaks ties arbitrarily — fine for picking position 3 of a timeline, wrong wherever the tie is the point. RANK gives tied ratings the same number and skips the next (1, 1, 3), so a cut at rank <= 2 keeps both 90s and drops the 80 — 'top two, ties included' is a statement about RANKS, not rows. DENSE_RANK shares numbers without skipping and would sneak the 80 in. PERCENT_RANK scales the same idea to (rank − 1) / (rows − 1), so the top-5-percent test is pr >= 0.95 with the largest value always at 1.0.",
        "Scope and scattered evidence close the section. The allocation argmax partitions by (project, employee) — the assignment is the unit of work, an employee on two projects surfaces twice, and partitioning by project alone would paint every member with the team's strongest skill. The candidate gate is the mismatch pattern: the condition is a property of the CANDIDATE, but the evidence lives on scattered ROWS — so two correlated EXISTS against the same table under different skills, DISTINCT the ids, order by id.",
      ],
      path: [
        { slug: "manager-of-the-largest-department", why: "The winner's count is a GLOBAL fact: 'is 4 the largest?' cannot be answered inside the grouped query — aggregate-of-aggregates does not nest — so the counts are materialised in a CTE, MAX over them is the bar, and the join keeps headcount = max." },
        { slug: "calculate-compressed-mean", why: "'Compressed' is the tell: the table already merged workers into buckets, so the mean is SUM(wage * count) / SUM(count) — AVG(hourly_wage) answers a different question — promoted to REAL and rounded to 2." },
        { slug: "find-third-transaction", why: "A top-k-per-group request with k = 3: ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY paid_at, tx_id), keep position 3 exactly — a user's third amount is neither a SUM nor a MAX, it is a position." },
        { slug: "top-three-wineries", why: "'Top two, ties included' is about RANKS, not rows: RANK makes 90, 90, 80 into 1, 1, 3 so rank <= 2 keeps both 90s and drops the 80 — ROW_NUMBER breaks ties arbitrarily and DENSE_RANK would sneak the 80 in." },
        { slug: "top-percentile-fraud", why: "PERCENT_RANK() is (rank − 1) / (rows − 1) over the partition: ordered by amount ASC, the largest always scores 1.0 and the runner-up (n−2)/(n−1) — the top-5-percent test is pr >= 0.95, partitioned by state." },
        { slug: "employees-project-allocation", why: "The unit of work is the assignment: employee 103 sits on two projects and surfaces twice — the partition is (project_id, employee_id), not project alone (or project 1 wears 101's Python 6); MAX years joins back, MIN(skill) breaks ties, roles come from ProjectEmployee." },
        { slug: "find-candidates-for-data-scientist-position", why: "The condition is a property of the CANDIDATE; the evidence lives on scattered ROWS — so two correlated EXISTS against the same table under different skills (Python > 2, SQL > 2), DISTINCT the ids, order by id." },
      ],
    },
  },
  {
    id: "premium4-social",
    title: "Premium Social & Weekly",
    blurb:
      "Social cadence — Friday-only purchase pivots, share-of-day percentages that must survive repeating thirds, viewers-turned-streamers gated by a strict first-watch boundary, above-average topping costs cast from TEXT prices, mutual-friend-free pairs and domain tallies off INSTR extraction.",
    slugs: [
      "friday-purchases-i",
      "friday-purchases-ii",
      "viewers-turned-streamers",
      "pizza-toppings-cost-analysis",
      "friends-with-no-mutual-friends",
      "find-all-unique-email-domains",
    ],
    study: {
      intro: [
        "Weekly cadence gets a modeling gift: when the report keeps only Fridays, each surviving date IS the week's anchor, so grouping by the raw purchase_date already yields one bucket per week and no week-start arithmetic is needed. The follow-up stacks grains — the numerator at (Friday, item), the denominator one level up at Friday — and the honest bridge is a window over the GROUPED rows: a CTE collapses purchases to per-item totals, and SUM(total) OVER (PARTITION BY friday_date) sums those totals without re-joining anything.",
        "Definitions collapse, and seeing the collapse is the solve. 'A streamer session starting strictly after at least one of their viewer sessions' is equivalent to 'strictly after their FIRST': any viewer start is greater than or equal to the first, so the loose test and the strict test clear together, and a MIN-per-user CTE does all the work. Text costs collapse too — into numbers, once: CAST(cost AS REAL) in a producing CTE absorbs the seed's whitespace quirk (Oregano's ' 2.50' parses fine; any string equality against '2.50' fails on that very row), and every downstream comparison runs on the cleaned column.",
        "Graphs and strings close with landmarks. Friendship stores each edge once, but adjacency is symmetric — the undirected CTE (UNION ALL of both orientations) turns storage into a traversable edge list, and every neighborhood question, including the no-mutual-friends NOT EXISTS probe, reads against it. The email domain is string surgery with one landmark: INSTR locates the '@', and the plus-one is the entire bug class — SUBSTR from the raw position produces '@gmail.com', which groups cleanly and reports confidently wrong.",
      ],
      path: [
        { slug: "friday-purchases-i", why: "The week identity is the Friday itself: keep only Fridays (strftime('%w') = '5', TEXT), and grouping by the raw purchase_date already yields one bucket per week — no week-start arithmetic needed." },
        { slug: "friday-purchases-ii", why: "Two grains share one query: the numerator is SUM(amount) at (Friday, item) grain in a CTE, the denominator is SUM(total) OVER (PARTITION BY friday_date) summing the GROUPED rows one level up — then 100.0 scaling and ROUND to 2." },
        { slug: "viewers-turned-streamers", why: "The definition collapses to a per-user threshold: 'strictly after at least one viewer session' is 'strictly after the FIRST' — a MIN-per-user CTE, streamer sessions joined ON session_start > first start, then COUNT + MIN per survivor." },
        { slug: "pizza-toppings-cost-analysis", why: "Costs are TEXT: CAST(cost AS REAL) once in a producing CTE — the cast absorbs Oregano's ' 2.50' leading space where string equality fails — keep cost_num > AVG(cost_num), emit the 30-pizza total and the 12.5 percent tax, both ROUNDed." },
        { slug: "friends-with-no-mutual-friends", why: "Adjacency is symmetric even though storage is not: UNION BOTH orientations into an undirected CTE, then keep stored pairs where NOT EXISTS a third user adjacent to both endpoints." },
        { slug: "find-all-unique-email-domains", why: "One landmark: INSTR(email, '@') locates the '@', and the domain starts at index + 1 — SUBSTR from the raw position produces '@gmail.com', which groups cleanly and reports confidently wrong. Then LOWER, GROUP BY, COUNT, ordered count DESC, domain ASC." },
      ],
    },
  },
  {
    id: "premium5-trends",
    title: "Premium Trends & Bursts",
    blurb:
      "Trend detection — recursive hashtag tokenizers under whole-token rules, DISTINCT-author trending that survives mention spam, peak-versus-average burst gates with a single-day escape hatch, session-bounded event counts that refuse cross-user leaks, Friday month buckets and digit-run GLOB scans.",
    slugs: [
      "find-trending-hashtags",
      "find-trending-hashtags-ii",
      "find-bursty-behavior",
      "user-activities-within-time-bounds",
      "friday-purchase-iii",
      "find-products-with-three-consecutive-digits",
    ],
    study: {
      intro: [
        "Trend detection starts with producing the tokens, because free text has no column to GROUP BY until it has been chopped. SQL ships no split function, so the reliable engine shape is a WITH RECURSIVE walker: the anchor holds the whole content padded with one trailing space, and each step peels the text before the first space, emits it, and keeps the tail. A GLOB '#[a-zA-Z0-9_]*' filter then keeps real hashtags, and the leaderboard is ordinary aggregation — with the sequel's one-word twist being DISTINCT: COUNT(DISTINCT author_id) counts people, not mentions, and mention spam crowns the wrong tag.",
        "Bursts live at a grain you manufacture. The unit of analysis is the user-DAY, not the logged row: a user's peak day arriving as two rows would read a maximum of the larger and an average over six rows instead of five — so the first CTE collapses activity to one row per (user, day) before any MAX/AVG window runs, and the burst gate compares the peak to three times the daily average with a minimum-activity floor. Session matching is the other shape: a join whose ON clause IS the specification — equality on user plus two explicitly spelled closed bounds — and COUNT of the event column keeps event-less sessions honestly at zero.",
        "Transformation order is forced, not stylistic. The Friday filter is a row-level WHERE — strftime('%w') returning the TEXT '5' — and it must run before the month GROUP BY ever forms a bucket: aggregate first is not merely slower, it is impossible to express honestly, because a Mug filtered out of November cannot be re-filtered out of October. Pattern matching closes the section: GLOB's character classes ([0-9] written three times for three digits), case-sensitive where it matters and harmless where it doesn't.",
      ],
      path: [
        { slug: "find-trending-hashtags", why: "Producing the tokens is the whole task: a WITH RECURSIVE walker splits at whitespace (anchor padded with one trailing space), GLOB '#[a-zA-Z0-9_]*' filters hashtags, then GROUP BY tag with ROW_NUMBER <= 3 on (count DESC, tag ASC)." },
        { slug: "find-trending-hashtags-ii", why: "One word — DISTINCT — flips the leaderboard: COUNT(DISTINCT author_id) counts people, not mentions; #Bloom's 8 mentions come from three authors while #Glow's 7 come from four, so the raw tally crowns the wrong tag." },
        { slug: "find-bursty-behavior", why: "The unit of analysis is the user-day: collapse Activity to one row per (user, day) first — windows over raw rows would read a max of 18 and average over six rows instead of five — then MAX/AVG/COUNT per user filter peak >= 3× avg with active_days >= 2." },
        { slug: "user-activities-within-time-bounds", why: "The ON clause IS the specification: equality on user plus two explicitly spelled bounds (>= start AND <= end), no BETWEEN-and-pray — and COUNT of the event column keeps event-less sessions honestly at zero." },
        { slug: "friday-purchase-iii", why: "Two transformations, forced order: the weekday filter (strftime('%w') = '5', TEXT) is row-level WHERE and must run BEFORE the month GROUP BY — aggregate first is not slower, it is impossible to express honestly." },
        { slug: "find-products-with-three-consecutive-digits", why: "GLOB is exactly the tool: '*[0-9][0-9][0-9]*' reads as a sentence — anything, three digit atoms, anything — case-sensitive for the surrounding letters and harmless for digits." },
      ],
    },
  },
  {
    id: "premium5-system",
    title: "Premium System Ops",
    blurb:
      "Systems accounting — per-caller argmax through zero-length ties, span-versus-sum utilization that charges idle minutes, island-based bookable seat runs, CEIL billing that bills part-hours whole, month-boundary login pairs via julianday and triple-arm invalid-row sweeps.",
    slugs: [
      "find-longest-calls",
      "server-utilization-time",
      "consecutive-available-seats-ii",
      "calculate-parking-fees-and-duration",
      "second-day-verification",
      "invalid-tweets-ii",
    ],
    study: {
      intro: [
        "System reports couple aggregates with facts, and that coupling is top-1-per-group territory. The longest call's duration is an aggregate, but the call_id attached to it belongs to one specific row — the row that wins the maximum — and no aggregate can say which row it came from. ROW_NUMBER over (caller, duration DESC, call_id) keeps position 1, the smallest id winning ties by construction. Utilization is the opposite composition: two aggregates at DIFFERENT scopes share one GROUP BY — the busy total summed over session rows, the observed window built from the group's MIN-to-MAX extremes — and the denominator is where the meaning lives: dividing the busy sum by itself would print 100% for a server that idled half the span.",
        "Consecutiveness keeps being a grouping question in a sequence costume: sort each seat's free days, number them, and inside an unbroken run day minus ROW_NUMBER is constant — that constant is the island key, COUNT per island measures the run, and MAX per seat with a HAVING floor reports the seats that can book three nights. Billing chains have snap points instead: strftime('%s') deltas give exact INTEGER seconds (TEXT subtraction is not arithmetic at all), CEIL of minutes over 60.0 bills hours STARTED, and the flat rate multiplies the billed hours — each link named, none borrowed.",
        "Relations between a table's own rows close the section. Second-day verification is a self-join whose date condition is deliberately directional — julianday(b) = julianday(a) + 1, b must be the day AFTER a — with DISTINCT collapsing pairs to the user grain. The invalid-row sweep is three independent failure modes, three OR'd arms: NULL content is not the empty string (every comparison with NULL is UNKNOWN, including = NULL), TRIM catches the blank, LENGTH catches the rant — then a plain COUNT(*) at whole-table grain, no grouping at all.",
      ],
      path: [
        { slug: "find-longest-calls", why: "An aggregate coupled with a fact: the longest duration is a MAX, but its call_id belongs to one row — ROW_NUMBER over (caller, duration DESC, call_id) keeps rn = 1, smallest id winning ties." },
        { slug: "server-utilization-time", why: "Two aggregates at different scopes share one GROUP BY: the busy total is SUM over session minutes while the denominator spans MIN(start) to MAX(end) — dividing the sum by itself would print 100% for a half-idle server." },
        { slug: "consecutive-available-seats-ii", why: "Consecutiveness is grouping in a sequence costume: inside an unbroken run, day minus ROW_NUMBER is constant — that constant is the island key — COUNT per island, MAX per seat, HAVING MAX >= 3." },
        { slug: "calculate-parking-fees-and-duration", why: "An arithmetic chain with snap points: strftime('%s') deltas give exact minutes (TEXT subtraction is not arithmetic), CAST(CEIL(minutes / 60.0) AS INTEGER) bills hours started, and hours × flat rate prints the fee." },
        { slug: "second-day-verification", why: "The property lives on a PAIR of the user's own rows: self-join on julianday(b.login_date) = julianday(a.login_date) + 1 — deliberately directional, b is the day AFTER a — then DISTINCT collapses pairs to the user grain." },
        { slug: "invalid-tweets-ii", why: "Three independent failure modes, three OR'd arms: content IS NULL (never = NULL), TRIM(content) = '' (NULL is not the empty string), LENGTH(content) > 140 — then a plain COUNT(*) at whole-table grain." },
      ],
    },
  },
  {
    id: "premium5-league",
    title: "Premium League Tables",
    blurb:
      "Standings engineering — home/away unpivots that pay draws twice, goal-difference tie-breaks invisible to points alone, full-season tables with row-number positions, scan-order GROUP_CONCAT city lists gated at three cities and DENSE_RANK second salaries that pass NULL through.",
    slugs: [
      "premier-league-table-ranking",
      "premier-league-table-ranking-ii",
      "premier-league-table-ranking-iii",
      "find-cities-in-each-state",
      "find-cities-in-each-state-ii",
      "second-highest-salary-ii",
    ],
    study: {
      intro: [
        "Standings begin with an unpivot, because a fixture is stored once but points are owed to both teams on the pitch. Match 4 reading Camden 1-0 Albion is simultaneously a three-point win for Camden and a zero-point loss for Albion — so the standard move is UNION ALL of the home and away perspectives into one team stream, the away branch swapping the goal columns along with the team name, and one GROUP BY team rolls the stream into played/points/goal_diff. The record is conditional aggregation wearing three hats: ELSE-0 SUMs count wins, draws and losses in the same pass — three separate subqueries would scan the fixtures three times and need keyed joins to reunite the columns.",
        "Tie-breaks are where standings get engineered. Goal difference is invisible to points alone and rides the same grouped pass; positions are ROW_NUMBER over (points DESC, goal_diff DESC, team ASC). City lists hit the opposite constraint: GROUP_CONCAT concatenates in SCAN order and takes no ORDER BY inside the aggregate call — so the sort happens BEFORE aggregation, an inner SELECT reading City ORDER BY (state, city_name) with the outer GROUP BY consuming the pre-sorted stream. Membership gates stay group facts: at least three cities is HAVING COUNT(*) >= 3, judged after the groups form, where a count exists to test.",
        "Tiers close the section: the word DISTINCT in second-highest means ROW_NUMBER is the wrong tool — it hands the second 95000 row number 2, the top salary wearing a different row's number — while DENSE_RANK numbers tiers, both 95000s taking rank 1 and 80000 taking rank 2. The pivot then has a population contract: GROUP BY department with MAX(CASE WHEN rnk = 2) keeps departments with no runner-up as NULL rows instead of deleting them, the same keep-the-empty-bucket honesty as every LEFT JOIN in this course.",
      ],
      path: [
        { slug: "premier-league-table-ranking", why: "A fixture is stored once but points are owed to both teams: UNION ALL the home and away perspectives into one team stream, GROUP BY team with a 3/1/0 CASE sum, ORDER BY points DESC then team ASC." },
        { slug: "premier-league-table-ranking-ii", why: "The unpivot carries numbers now: the away branch swaps the goal columns along with the team name, one GROUP BY produces played/points/goal_diff, and the ORDER BY adds goal_diff DESC — the tie-break invisible to points alone." },
        { slug: "premier-league-table-ranking-iii", why: "The full record is one aggregate wearing three conditions: ELSE-0 conditional SUMs count wins/draws/losses in the same pass — three subqueries would scan fixtures three times — then ROW_NUMBER assigns positions on (points, goal_diff, team)." },
        { slug: "find-cities-in-each-state", why: "GROUP_CONCAT concatenates in scan order and takes no ORDER BY inside the call — so the inner SELECT sorts by (state, city_name) BEFORE the outer GROUP BY ever consumes the stream." },
        { slug: "find-cities-in-each-state-ii", why: "The gate is a fact about GROUPS — at least 3 rows — so HAVING COUNT(*) >= 3 runs after grouping (WHERE cannot see a count); the line is then hand-built: state || ': ' || GROUP_CONCAT(city_name, ', ')." },
        { slug: "second-highest-salary-ii", why: "DISTINCT is the entire problem: ROW_NUMBER hands the second 95000 row number 2, but DENSE_RANK numbers tiers — both 95000s take rank 1, 80000 takes rank 2 — and the GROUP BY pivot keeps NULL departments surviving." },
      ],
    },
  },
  {
    id: "premium5-graph",
    title: "Premium Graph Engines",
    blurb:
      "The recursive wall — WITH RECURSIVE org depths from a NULL anchor, twin inclusive window maxes pooling rain water, SUM(DISTINCT) standing in for bitwise OR, step-bounded cycle chases through gift permutations, completion-ratio dominance and full-sequence LAG islands over interleaved passes.",
    slugs: [
      "ceo-subordinate-hierarchy",
      "calculate-trapping-rain-water",
      "bitwise-user-permissions-analysis",
      "find-circular-gift-exchange-chains",
      "team-dominance-by-pass-success",
      "longest-team-pass-streak",
    ],
    study: {
      intro: [
        "Trees and graphs defeat one-shot joins because the distance differs row by row. One self-join reaches level 2 and two reach level 3 — a query that hardcodes k self-joins answers only a k-deep company, silently dropping everyone deeper the moment the org grows, and no aggregate fixes it because a manager's level is a property of their PATH, not a SUM over their reports. The WITH RECURSIVE walk anchors on manager_id IS NULL and joins children of already-placed rows at level + 1; the same engine chases gift-exchange permutations, where determinism — exactly one edge leaves each person — lets one CTE chase from every giver at once, a ring being the step k that lands back on the start.",
        "Some window clauses carry mathematical weight, and the proof deserves writing down. Trapping rain water needs two contexts no row can see: an unbounded inclusive MAX over at-or-left and another over at-or-right — prefix and suffix sweeps — with the scalar MIN of the banks as the waterline. Bitwise OR collapses into SUM(DISTINCT) only because the masks are disjoint powers of two: disjoint bits OR exactly as they add, no carry can occur — an identity, not a trick, and the (mask & 7) = 7 gate checks the trio.",
        "Denominators and game time finish the wall. Dominance divides completed passes by the TEAM's attempts — home's 10 completes are 83.33 percent of 12 but 41.67 percent of the table's 24 — and keeps every team at the max rounded share. Streaks live in FULL chronological order: partition-by-team-first deletes history and manufactures false neighbors (away's pass 3 and pass 9 become partition-neighbors the moment home's 4–8 are deleted), so the LAG walks the whole pass_id order, flags breaks (foreign team OR any incomplete), and running break-sums build the islands.",
      ],
      path: [
        { slug: "ceo-subordinate-hierarchy", why: "Depth is not one join away — k hardcoded self-joins answer only a k-deep org: WITH RECURSIVE anchored on manager_id IS NULL joins children of already-placed rows at level + 1, ordered by level then emp_id." },
        { slug: "calculate-trapping-rain-water", why: "Each position needs two contexts its row cannot see: unbounded inclusive window MAXes over at-or-left and at-or-right — prefix and suffix sweeps — the scalar MIN of the banks is the waterline, CASE-clamped to 0, kept where > 0." },
        { slug: "bitwise-user-permissions-analysis", why: "The identity is the engine: disjoint powers of two OR exactly as they add — no carry can occur — so SUM(DISTINCT perm_mask) is a faithful bitwise OR, gated by (mask & 7) = 7 for the full trio." },
        { slug: "find-circular-gift-exchange-chains", why: "A gift exchange is a permutation — one edge leaves each person, the chase never branches — and that determinism lets one recursive CTE chase from every giver at once: landing back on the start at step k makes k the ring's edge count, capped at the person count." },
        { slug: "team-dominance-by-pass-success", why: "The denominator is the trap: home's 10 completes are 83.33% of home's 12 attempts but 41.67% of the table's 24 rows — GROUP BY team, ROUND(completed * 100.0 / total, 2), keep every team at the MAX rounded pct." },
        { slug: "longest-team-pass-streak", why: "Streaks live in game time: partition-by-team-first deletes history and manufactures false neighbors — LAG over the FULL pass_id order, flag breaks (foreign team OR any incomplete), running break-sum islands, COUNT per island, MAX per team." },
      ],
    },
  },
  {
    id: "premium5-market",
    title: "Premium Growth & Rates",
    blurb:
      "Growth arithmetic — LAG-based year-over-year rates that survive missing years, inclusive spend-tier boundaries one unit apart, best-rule discounts that refuse to stack, on-time-rate leaders gated by a five-run minimum and skill-count candidate gates with an IN-list wall.",
    slugs: [
      "year-on-year-growth-rate",
      "customer-purchasing-behavior-analysis",
      "calculate-product-final-price",
      "find-top-performing-driver",
      "find-candidates-for-data-scientist-position-ii",
    ],
    study: {
      intro: [
        "Growth is a comparison with a predecessor, and SQL spells predecessor LAG: LAG(revenue) OVER (PARTITION BY product ORDER BY year) walks each product's timeline handing every row the prior year's revenue, with NULL for the timeline's first row. That NULL is not an anomaly to patch over — it IS the answer: no prior year, no growth rate — which is why it is filtered AFTER the window runs, not before. Segments are the same respect for order of operations: the category is a property of a SUM, and no aggregate exists until a group has been formed, so one GROUP BY computes the lifetime total once and the SELECT reads it three ways — CASE input, output column, sorting key — with inclusive thresholds tested high-to-low.",
        "Rules that refuse to stack change the join arithmetic. Multiple discount rules can target one product, but the customer pays the SINGLE largest reduction — so the LEFT JOIN from Product fans out on the rule side and GROUP BY + COALESCE(MAX(discount_pct), 0) collapses it, with the LEFT keeping rule-less products alive where an INNER join would erase them without error. Rate metrics then carry their own gates: the on-time share is SUM(on_time) / COUNT(*) over the same group (the 100.0 promotion as always), a HAVING COUNT(*) >= 5 floor refuses small samples, and ORDER BY rate DESC, driver_id with LIMIT 1 names the leader.",
        "Counting rules read like grammar: narrow the rows to the counted universe FIRST (skill IN the named three AND years > 2), form the groups per applicant, and let the group size deliver the verdict (HAVING COUNT(*) >= 2). Every query in this section is that pipeline — row filter, group formation, group judgment — and the errors it seeds are always the same two: filtering after grouping (a HAVING that cannot see the row test) or counting an unfiltered universe.",
      ],
      path: [
        { slug: "year-on-year-growth-rate", why: "Year-over-year is a comparison with a predecessor: LAG(revenue) OVER (PARTITION BY product ORDER BY year), the NULL first row IS the answer (no prior year, no growth) and is filtered AFTER the window, growth rounded to 2." },
        { slug: "customer-purchasing-behavior-analysis", why: "The segment is a property of a SUM: one GROUP BY customer computes the lifetime total once and reads it three ways — CASE input, total_spent column — with inclusive thresholds tested high-to-low." },
        { slug: "calculate-product-final-price", why: "Different grains meet: LEFT JOIN rules onto products (product 103 has none and an INNER join erases it silently), GROUP BY product, COALESCE(MAX(discount_pct), 0) — the single largest discount, never a stack." },
        { slug: "find-top-performing-driver", why: "A ratio of two aggregates over the same group: SUM(on_time) / COUNT(*) with the 100.0 promotion, HAVING COUNT(*) >= 5 gating small samples, ORDER BY rate DESC then driver_id, LIMIT 1." },
        { slug: "find-candidates-for-data-scientist-position-ii", why: "The rule counts SKILLS: WHERE skill IN ('python', 'sql', 'tableau') AND years > 2 narrows rows to the counted universe first, groups form per applicant, and HAVING COUNT(*) >= 2 delivers the verdict." },
      ],
    },
  },
  {
    id: "premium5-finales",
    title: "Premium Assessment Finales",
    blurb:
      "The premium close — retake-proof per-subject maxes double-gated at eighty, all-pass transcripts judged on their lowest subject, strict-touch interval pairs, END-before-START sweep lines counting concurrency, COUNT(col) versus COUNT(*) over unrated books and parity-driven capitalizers folded inside a recursive walk.",
    slugs: [
      "find-top-scoring-students",
      "find-top-scoring-students-ii",
      "find-overlapping-shifts",
      "find-overlapping-shifts-ii",
      "books-with-null-ratings",
      "first-letter-capitalization",
    ],
    study: {
      intro: [
        "Assessment rules live at grains the exam table does not have. A subject is passed or failed ONCE per student, but ExamScore holds one row per attempt — so the pass rule starts with a collapse: GROUP BY (student_id, subject) with MAX(score), after which retakes can only help, never hurt. At that subject grain, 'passed at least two' is HAVING COUNT(*) >= 2, and the all-pass variant is the same CTE read one level up: MIN(top_score) >= 80 over the student's subject groups — a transcript is judged on its lowest subject, and naming that grain IS the entire solution.",
        "Pair reports are self-joins with honesty guards, and interval overlap is a strict two-sided test. a.shift_id < b.shift_id turns every ordered combination into each unordered pair exactly once; the overlap itself is a.start < b.end AND b.start < a.end — both halves load-bearing, since a one-sided variant misses engulfing pairs. Concurrency counting upgrades the same events into a sweep-line: every shift contributes a +1 at its start and a −1 at its end via UNION ALL, a running SUM replays the stream in time order (END before START at shared timestamps, or gaps miscount), and MAX per employee names the deepest pile.",
        "NULL decisions and token walks close the premium tier. The book report makes each aggregate's NULL stance explicit: COUNT(rating) counts the values that exist, COUNT(*) counts the shelf, their difference is the unrated remainder without an extra scan, and AVG's silent NULL-skip becomes a stated average. Capitalization is a token problem in a text costume: the recursive walk peels one word per step (the trailing-space padding matters at the boundary), and a parity-driven CASE folds the capitalization inside the walk, the built string riding every step until the terminal row reports it.",
      ],
      path: [
        { slug: "find-top-scoring-students", why: "The pass rule lives at (student, subject), not exam grain: MAX(score) per (student, subject) collapses attempts first, THEN the >= 80 filter and HAVING COUNT(*) >= 2 — retakes can only help, never hurt." },
        { slug: "find-top-scoring-students-ii", why: "All-pass is a MIN over the right grain: the per-(student, subject) MAX CTE collapses attempts, then HAVING MIN(top_score) >= 80 AND COUNT(*) >= 2 — the transcript is judged on its lowest subject." },
        { slug: "find-overlapping-shifts", why: "Pair reports are self-joins, and honesty comes first: a.shift_id < b.shift_id turns every ordered combination into each unordered pair once, and the strict two-sided test (a.start < b.end AND b.start < a.end) is the overlap." },
        { slug: "find-overlapping-shifts-ii", why: "The deepest pile is a sweep-line: every shift contributes a +1 at start and −1 at end via UNION ALL, the running SUM replays events in time order (END before START at shared timestamps), and MAX per employee names the concurrency peak." },
        { slug: "books-with-null-ratings", why: "Every aggregate makes a NULL decision, so make them explicit: COUNT(rating) is rated_count, COUNT(*) − COUNT(rating) is the unrated remainder without an extra scan, and AVG's silent NULL-skip becomes the stated average — one ungrouped pass." },
        { slug: "first-letter-capitalization", why: "A token problem in a text costume: the recursive walk peels one word per step (trailing-space padding matters at the boundary), a parity-driven CASE folds the capitalization inside the walk, and the built string rides until the terminal row reports it." },
      ],
    },
  },
  {
    id: "free-classics",
    title: "Free Classics",
    blurb:
      "The canonical interview traps — second-highest salaries through duplicate tops and OFFSET-into-NULL, three-in-a-row values that never touch, strictly-rising temperatures past a flat day, NULL-referee shoppers the bare inequality loses and OR-gated nations that just miss both thresholds.",
    slugs: [
      "nth-highest-salary",
      "consecutive-numbers",
      "rising-temperature",
      "find-customer-referee",
      "big-countries",
    ],
    study: {
      intro: [
        "The classics are canonical because each one separates two ideas SQL keeps visually similar. The nth-highest trap is values versus rows: ORDER BY salary DESC sorts ROWS — two 98000s occupy two physical positions — while the question counts VALUES, so the sorted scalar subquery carries DISTINCT before LIMIT 1 OFFSET 1, and an empty subquery degrades to the mandated NULL for free. The three-in-a-row trap is bags versus sequences: a bag has no order, so value 2's four scattered appearances and value 5's four appearances are indistinguishable to any frequency query — the information lives in NEIGHBORS, and LAG twice over entry order finds rows equal to both predecessors.",
        "Neighbor relations continue in the weather join: each row is bound to ONE specific neighbor, the row whose day is one less, and the self-join yesterday.day = today.day - 1 states that literally — honest only because the days are contiguous, since a missing day 5 would make today.day - 1 name a day that never existed. NULL three-valued logic is the referee trap: the English 'not referee 2' evaluates to UNKNOWN — not FALSE — for NULL referees, and WHERE keeps only TRUE rows, so the one-line filter silently deletes exactly the shoppers the statement protects; the IS NULL arm is the report, not a patch.",
        "Disjunction closes the set: big countries clear EITHER threshold, so WHERE area >= 3000000 OR population >= 25000000 keeps a row when one arm alone is TRUE — the accidental AND, the most common corruption of this query, keeps only rows clearing both and collapses the report. Five problems, five distinctions: values/rows, bags/sequences, specific neighbors, UNKNOWN/FALSE, OR/AND — the vocabulary every later section assumes.",
      ],
      path: [
        { slug: "nth-highest-salary", why: "The question counts VALUES while the table stores ROWS: DISTINCT in the sorted scalar subquery collapses the duplicate 98000s before LIMIT 1 OFFSET 1, and an empty subquery degrades to the mandated NULL." },
        { slug: "consecutive-numbers", why: "A bag has no order — 2's four scattered appearances and 5's four are indistinguishable to any frequency query: LAG(value) twice over entry_id order keeps rows equal to both predecessors, DISTINCT, ordered." },
        { slug: "rising-temperature", why: "The question binds each row to ONE specific neighbor: self-join yesterday.day = today.day - 1 (honest only because days are contiguous), keep today.temp > yesterday.temp, ordered by day." },
        { slug: "find-customer-referee", why: "The English 'not referee 2' hides a three-valued trap: referee_id <> 2 is UNKNOWN for NULL referees and WHERE keeps only TRUE — the IS NULL arm is the report, not a patch." },
        { slug: "big-countries", why: "A disjunction: area >= 3000000 OR population >= 25000000 keeps a row when EITHER arm is TRUE — the accidental AND collapses the report to countries that clear both." },
      ],
    },
  },
  {
    id: "free-windows",
    title: "Free Windows & Growth",
    blurb:
      "Window foundations — stadium runs of three hundred-plus days kept whole by island keys, relational division over a full product catalog, seven-day cafe averages that only exist once the frame is full, attempt-one-versus-two score gains and all-up review ladders gated at three reviews.",
    slugs: [
      "human-traffic-of-stadium",
      "customers-who-bought-all-products",
      "restaurant-growth",
      "find-students-who-improved",
      "find-consistently-improving-employees",
    ],
    study: {
      intro: [
        "The hard word in these reports is 'consecutive', and neither GROUP BY nor WHERE can see it: a run of three busy days is a property of NEIGHBORING rows, so the query must first make adjacency computable and only then measure. The gaps-and-islands pattern does exactly that — mark each day with a running sum of the busy flag, and day minus that sum keys each unbroken stretch; runs of three or more qualify and ALL their member rows report, not just the run leaders. The same 'adjacent rows' engine powers the improvement checks: LAG over the review order flags non-rising steps, and a history is consistent when no flag ever fires.",
        "Universal quantifiers translate to arithmetic. 'Bought every product' has no FOR ALL keyword in SQL — the standard move is counting: how many DISTINCT products each shopper's cart touches, compared against the catalogue size from a scalar subquery; equality is the whole proof. Frames get the same care from the other side: the seven-day moving average is a physical frame — ROWS 6 PRECEDING through CURRENT ROW, deliberate over RANGE — and the report keeps a day only where the SAME frame's COUNT reads 7, so the early days have no row instead of a wrong one.",
        "Comparisons across rows are pairing problems before they are comparisons. The student improvement join pins the attempt numbers in the ON clause and includes subject in the key — keyed on student alone, Math's attempt 1 would meet Biology's attempt 2. The employee version folds a per-row question into a group verdict: LAG flags each non-rising step inside the partition, the first review's NULL comparison reads as clean rather than failed, MAX folds the flags, and HAVING COUNT >= 3 keeps the histories long enough to mean anything.",
      ],
      path: [
        { slug: "human-traffic-of-stadium", why: "The hard part is the word consecutive: day minus the running busy-flag sum keys each stretch — GROUP BY and WHERE cannot see whether two busy days touch — runs of >= 3 qualify and ALL their member rows report." },
        { slug: "customers-who-bought-all-products", why: "Relational division in a trolley: 'for every product' has no FOR ALL keyword, so the universal quantifier becomes arithmetic — COUNT(DISTINCT product_id) per shopper against the catalogue size in a scalar subquery." },
        { slug: "restaurant-growth", why: "A moving average that ENDS at each day is a frame: SUM(amount) OVER (ORDER BY visited_on ROWS 6 PRECEDING..CURRENT ROW) / 7 — kept only where the same frame's COUNT reads 7, so early days have no row instead of a wrong one." },
        { slug: "find-students-who-improved", why: "The two scores live on different rows: a self-join pairs attempt 1 with attempt 2 — attempt numbers pinned in the ON, subject IN the key (keyed on student alone, Math's first would meet Biology's second) — then second > first, no aggregation." },
        { slug: "find-consistently-improving-employees", why: "'Every consecutive pair rises' is LAG territory: flag non-rising steps per employee (the first review's NULL comparison reads as clean), fold with MAX over the partition, HAVING COUNT >= 3 keeps real histories." },
      ],
    },
  },
  {
    id: "free-formats",
    title: "Free Format Validation",
    blurb:
      "Text gauntlets — stop-word capitalizers folded inside a recursive walk, emails judged by one-@ and tld arms, IPv4 octets split and range-checked against leading zeros, whole-string GLOB serial shapes and DNA signatures counted through two REPLACE literals.",
    slugs: [
      "first-letter-capitalization-ii",
      "find-valid-emails",
      "find-invalid-ip-addresses",
      "find-products-with-valid-serial-numbers",
      "dna-pattern-recognition",
    ],
    study: {
      intro: [
        "SQLite ships no SPLIT function, so every one of these gauntlets starts by making tokens by hand. The recursive walk is the loop: keep the unconsumed tail in a column, and at each step cut the next word off the front — the word is everything before the first space of the tail, the new tail everything after it. Padding the content with one trailing space is what lets the LAST word follow the same code path as the rest, and the position-aware stop-word CASE rides inside the walk, concatenating the transformed words as it goes.",
        "One GLOB cannot say these rules — and the tempting one lies. The email pattern '*@*.com' looks like the whole rule, but GLOB's star matches zero characters as happily as many: it admits 'cleo@.com' (the domain star shrinks to nothing), '@nope.com' (the local star does the same), and doubled '@'s (the leading star swallows the extra). Honest validation is three ANDed guards. IP addresses break GLOB differently: a four-group dotted pattern rejects '1.2.3' but its inner stars cross dot boundaries freely, so '1.2.3.4.5' slips through — the octet count must come from a real splitter, and a recursive dot-splitter yields one row per octet for per-octet grading.",
        "Two GLOB facts close the toolkit. Whole-string anchoring: a pattern with no leading or trailing star is implicitly anchored at both ends — that is why a leading 'X' or a trailing seventh digit fails the serial without extra checks, and case sensitivity ([A-Z] vs [a-z]) is a feature here. Presence versus multiplicity: pattern operators answer WHETHER a motif exists but never HOW MANY times, so DNA counting is REPLACE arithmetic — each occurrence of a literal removes exactly its length in characters, and (LENGTH − LENGTH(REPLACE)) / 3 counts 'ACT's exactly.",
      ],
      path: [
        { slug: "first-letter-capitalization-ii", why: "No SPLIT function exists, so a recursive walk peels one word per step — the trailing-space padding matters at the boundary — and the position-aware stop-word CASE rides inside the walk, concatenating as it goes." },
        { slug: "find-valid-emails", why: "The tempting one-arm GLOB lies: '*@*.com' admits 'cleo@.com', '@nope.com' and doubled '@'s because stars match zero characters — three ANDed guards instead: one '@', non-empty local, '?*.com' domain." },
        { slug: "find-invalid-ip-addresses", why: "GLOB cannot count precisely — inner stars cross dot boundaries and admit '1.2.3.4.5' — so a recursive dot-splitter yields one row per octet, per-octet grading flags digit/range/leading-zero violations, and invalid = count <> 4 OR any flag." },
        { slug: "find-products-with-valid-serial-numbers", why: "One GLOB writes itself once the semantics are clear — 'SN-' + four [A-Z] atoms + '-' + six [0-9] — and the load-bearing fact is that a pattern with no stars matches the WHOLE string, anchored at both ends." },
        { slug: "dna-pattern-recognition", why: "Pattern operators answer presence, not multiplicity: (LENGTH(s) - LENGTH(REPLACE(s, 'ACT', ''))) / 3 counts exactly, twice over ('ACT' and 'AGT'), summed per sample, HAVING >= 2." },
      ],
    },
  },
  {
    id: "free-org",
    title: "Free Org & Recovery",
    blurb:
      "State machines over people — recursive subtree tallies that count others but pay themselves, trial-to-paid conversions measured in julianday days, strictly-overlapping rota pairs that spare the touch, recoveries anchored to the first positive and libraries where unreturned loans meet total copies.",
    slugs: [
      "analyze-organization-hierarchy",
      "analyze-subscription-conversion",
      "find-overbooked-employees",
      "find-covid-recovery-patients",
      "find-books-with-no-available-copies",
    ],
    study: {
      intro: [
        "Organizational questions outrun single hops. manager_id names exactly ONE boss, so a self-join on it answers 'who reports directly to me' and stops — but Tara sits below Omar only THROUGH Quinn, and Omar's row must aggregate a subtree, not a neighborhood. The engine for reachability is the recursive closure: a CTE emitting every (ancestor, descendant) pair, from which subordinates is COUNT(pairs) − 1 and subtree salary is the SUM over descendants, untouched. The same LEFT-join population logic governs conversion reporting: every trial user must surface, converted or not, and the 'no' bucket exists because the LEFT keyword said so — an INNER join silently deletes the never-converted.",
        "Interval overlap is inherently two-sided, and both halves are load-bearing. [a.start, a.end) meets [b.start, b.end) exactly when each starts before the other finishes — a.start < b.end AND b.start < a.end — and the one-sided variant ('the second starts inside the first') misses engulfing pairs, seeded here with the long shift carrying the HIGHER entry_id so the naive direction test fails visibly. An entry_id inequality guard keeps each pair once; DISTINCT collapses to the employee grain.",
        "Dependent minima and count-versus-total comparisons finish the set. Recovery is not two independent MINs: WHICH negative counts depends on WHICH positive anchors it, and MIN over all negatives per patient would print 'recovered nine days before infection' — so the recovery MIN runs strictly after the first-positive anchor, and the INNER join keeping only anchored patients is correct here BY CONTRACT, not by habit. The library closes on a stored-total comparison: LEFT JOIN unreturned loans per book so every book survives, HAVING COUNT(loan column) = total_copies — the shelf whose every copy is still out.",
      ],
      path: [
        { slug: "analyze-organization-hierarchy", why: "manager_id names exactly one boss, so a self-join stops at direct reports — Tara sits below Omar only THROUGH Quinn: the recursive (ancestor, descendant) closure groups per ancestor, subordinates = COUNT(pairs) − 1, subtree_salary untouched." },
        { slug: "analyze-subscription-conversion", why: "The output population is decided in the FROM clause: TrialUser LEFT JOIN PaidConversion — user 204 keeps their row with NULLs, the 'no' bucket exists because the LEFT keyword said so — and julianday deltas give exact day counts." },
        { slug: "find-overbooked-employees", why: "Interval overlap is two-sided: a.start < b.end AND b.start < a.end — both halves load-bearing, since the one-sided variant misses engulfing pairs (the long shift carries the HIGHER entry_id); the entry_id guard dedupes, DISTINCT to the employee." },
        { slug: "find-covid-recovery-patients", why: "Two minima, but not independent: WHICH negative counts depends on WHICH positive anchors it — MIN over all negatives prints 'recovered before infection' — so the recovery MIN runs strictly after the first-positive anchor, the INNER join keeping only the recovered by contract." },
        { slug: "find-books-with-no-available-copies", why: "Count against stored total: LEFT JOIN unreturned loans per book so every book survives, HAVING COUNT(loan column) = total_copies — the shelf whose every copy is still out, ordered by book_id." },
      ],
    },
  },
  {
    id: "free-pairs",
    title: "Free Pairs & Seasons",
    blurb:
      "Co-occurrence arithmetic — basket pairs canonicalized under distinct-basket counts, category affinities reported in BOTH orders past a two-buyer gate, season buckets that wrap December into winter, id-parity payment splits and drivers judged by log_id order rather than insertion.",
    slugs: [
      "find-product-recommendation-pairs",
      "find-category-recommendation-pairs",
      "seasonal-sales-analysis",
      "odd-and-even-transactions",
      "find-drivers-with-improved-fuel-efficiency",
    ],
    study: {
      intro: [
        "Pairs are manufactured, never found. The table stores scan lines, but a product pair is a SET of two, so BasketLine joins to itself on basket_id and the inequality a.product_id < b.product_id does two jobs at once: it pairs every two distinct products sharing a basket AND kills the mirrored twin in the same breath. COUNT(DISTINCT basket_id) then counts baskets, not co-occurrences, before the HAVING gate. The category version runs on two grains simultaneously — the pair unit is categories but the count unit is BUYERS — so the (buyer, category) set is built FIRST: a buyer who bought dairy twice would otherwise push the affinity from 3 to 4.",
        "Cyclic buckets resist arithmetic shortcuts. month/3 groups calendar quarters, and calendar quarters staple December to the January and February of the SAME year — but a sale on 2024-12-20 belongs with 2025-01-05, a different year entirely — so the season CASE enumerates the four month-sets explicitly and lets the wrap happen by construction. Classification axes must be read off the stated column, not the convenient one: the seed weaponizes amount parity running OPPOSITE to id parity on the first two rows, so a CASE on amount % 2 buckets both wrongly while the tx_id CASE is trivially right.",
        "First and latest are POSITIONS on a timeline, not extremes of a metric. The fuel logs are inserted out of order — log 9 (8.0) enters before log 4 (8.5) — so anything that trusts arrival order, or takes MIN and MAX of the METRIC, reads the wrong endpoints; the timeline is log_id, the first log is its LOWEST value and the latest its HIGHEST. Dual-direction ROW_NUMBERs — one ordered ASC, one DESC, partitioned per driver — pick position 1 from each end, the comparison is strictly-latest-beats-first, and ROUND touches only the printed gain.",
      ],
      path: [
        { slug: "find-product-recommendation-pairs", why: "A pair is a SET of two, but the table stores scan lines: BasketLine self-joined on basket_id with a.product_id < b.product_id — the inequality pairs distinct products AND kills the mirrored twin — COUNT(DISTINCT basket_id) per pair, HAVING >= 3." },
        { slug: "find-category-recommendation-pairs", why: "Two grains at once — the pair unit is categories, the count unit is buyers: a DISTINCT (buyer, category) set self-joined on buyer with c1 != c2, or buyer 3's two dairy purchases read affinity 4 instead of 3; HAVING >= 2, BOTH orders reported." },
        { slug: "seasonal-sales-analysis", why: "Cyclic buckets resist arithmetic: month/3 staples December to the wrong January — the CASE enumerates the four month-sets explicitly, GROUP BY season, ORDER BY total DESC then season." },
        { slug: "odd-and-even-transactions", why: "The seed weaponizes the axis: amount parity runs OPPOSITE to id parity on the first two rows — CASE on tx_id % 2 buckets honestly where a CASE on amount reports 402/231 instead of 303/330." },
        { slug: "find-drivers-with-improved-fuel-efficiency", why: "First and latest are POSITIONS on the log_id timeline, not MIN/MAX of the metric and not arrival order — dual-direction ROW_NUMBER = 1 pivots per driver, strict latest > first, ROUND the gain only." },
      ],
    },
  },
  {
    id: "final-habits",
    title: "Final Wave: Users & Habits",
    blurb:
      "The last free user-behavior problems — token averages judged through an EXISTS arm against the raw mean, peak-hour regulars gated four ways at once, churn-risk profiles built from a latest-row window over whole-history aggregates, loyalty proven by boolean-sum HAVING clauses across a julianday span, dominant-reaction shares kept unrounded against double-precision drift and one-action-day streaks surfaced by gaps-and-islands.",
    slugs: [
      "find-users-with-high-token-usage",
      "find-golden-hour-customers",
      "find-churn-risk-customers",
      "find-loyal-customers",
      "find-emotionally-consistent-users",
      "find-users-with-persistent-behavior-patterns",
    ],
    study: {
      intro: [
        "Behavior profiles stack gates, and each gate hides a denominator decision. The peak-hour regular needs the peak-share over the customer's TOTAL orders, the rated-share over total, and the rating average over the RATED SUBSET only — three different denominators, and mixing any two quietly corrupts the verdict. Self-referencing filters are their own shape: 'has a prompt above their OWN average' needs the aggregate pushed BACK against the raw rows, so per-user stats live in a CTE and EXISTS probes the base table correlated on user.",
        "Row-level facts and whole-history aggregates must coexist in one profile without lying to each other. 'Latest event' and 'current price' are properties of ONE row — the newest — while 'ever downgraded' and 'max price ever' are properties of the whole history, so the history stays UNFILTERED for the aggregates while a latest-row window extracts the newest row, and a join reunites the two scopes. Loyalty is span, not streak: 'active for at least 30 days' is julianday(max) − julianday(min), exactly as the official walk-through computes it, and the whole verdict is one GROUP BY with a three-clause boolean-sum HAVING.",
        "Modes need their labels kept, and streaks need their preconditions judged first. The dominant-reaction report asks for the mode LABEL and its share together — so ROW_NUMBER over per-label counts keeps the label attached to its count, and the share stays UNROUNDED because double-precision drift rounds 0.6-adjacent shares the wrong way. The persistence report hides a precondition in plain sight: every day of the run must hold EXACTLY ONE action — a day with two actions cannot qualify — so the one-action-day filter runs BEFORE the gaps-and-islands machinery, and ROW_NUMBER over per-user streak lengths picks the longest.",
      ],
      path: [
        { slug: "find-users-with-high-token-usage", why: "A self-referencing filter: count and average are plain GROUP BY, but 'a prompt above their OWN average' pushes the aggregate back against the raw rows — stats CTE + EXISTS correlated on user, strictly above." },
        { slug: "find-golden-hour-customers", why: "Four gates, three denominators: peak and rated shares divide by the customer's TOTAL orders, the rating average divides by the RATED subset only, plus a plain count — mixing any two denominators quietly corrupts the verdict." },
        { slug: "find-churn-risk-customers", why: "Two gates need row-level facts, two need whole-history aggregates: the latest-row window reads the newest event and current price while the UNFILTERED history feeds ever-downgraded and max-ever — a four-gate join reunites the scopes." },
        { slug: "find-loyal-customers", why: "Span, not streak: 'active 30 days' is julianday(max) − julianday(min) — the walk-through's Jan 5 → Feb 20 = 46 days — and the whole verdict is one GROUP BY with a three-clause HAVING of boolean sums." },
        { slug: "find-emotionally-consistent-users", why: "The output needs the mode LABEL and its share together: ROW_NUMBER over per-label counts keeps the label attached, eligibility gates at 5 distinct items, and the 60% share stays UNROUNDED against double-precision drift." },
        { slug: "find-users-with-persistent-behavior-patterns", why: "The precondition comes first: every day of the run must hold EXACTLY ONE action — a two-action day cannot qualify — so the one-action-day filter runs BEFORE gaps-and-islands, and ROW_NUMBER keeps the longest streak per (user, action)." },
      ],
    },
  },
  {
    id: "final-ops",
    title: "Final Wave: Ops & Pairs",
    blurb:
      "The last free operational closes — a bus queue boarded through a running SUM that admits only the last fitting turn, store inventory imbalance read from dual-direction ROW_NUMBERs, polarized books split by conditional-aggregation stats, zombie sessions fingerprinted per session with MIN/MAX and boolean sums, course pairs chained through a step+1 self-join over ROW_NUMBER sequencing and study spirals audited by LAG gaps and a period-k self-check.",
    slugs: [
      "last-person-to-fit-in-the-bus",
      "find-stores-with-inventory-imbalance",
      "find-books-with-polarized-opinions",
      "find-zombie-sessions",
      "most-common-course-pairs",
      "find-students-with-study-spiral-pattern",
    ],
    study: {
      intro: [
        "Sequences are the closing theme, and the running total is their primitive. The gondola question translates per-row — 'would it still fit if I boarded?' is the prefix sum of weights up to my turn — and SUM(weight) OVER (ORDER BY turn) computes it without collapsing the queue. The subtle half is the answer rule: the LAST fitting turn boards, the next is denied, and the queue does not freeze — the seed scatters turns against ids on purpose so that only the turn timeline tells the story. Inventory imbalance pulls four facts from one table: dual-direction ROW_NUMBERs fetch each store's priciest and cheapest products, and the judgment compares their quantities.",
        "Gate stacks must not conflate existence with share. The polarized-book report needs a rating >= 4 AND a rating <= 2 — existence tests on RAW rows — plus an extreme SHARE of at least 0.6 and a MAX − MIN spread, all conditional aggregates over one grouped pass; testing the share of highs separately instead of the combined extremes is the seeded error. The zombie sweep fingerprints sessions first — MIN/MAX duration plus boolean-sum counts of each event type — and then applies a conjunctive veto: one failed criterion kills the session no matter how extreme the others are.",
        "Ordered transitions are not co-enrollment, and periodicity is not a streak. The course-pair report wants which course IMMEDIATELY followed which — a pair is two ADJACENT rows in the date-ordered sequence, so a 6-course learner yields exactly 5 pairs, never the 15 of the a < b pair family — ROW_NUMBER sequences each learner's timeline and a step+1 self-join walks it. The spiral is stricter still: the ENTIRE session list must repeat with period k — A,B,A,C,A,B,A,C has no equal neighbors yet is NOT a period-3 spiral — so the audit is LAG gap checks plus the period-k self-check, never an adjacency test.",
      ],
      path: [
        { slug: "last-person-to-fit-in-the-bus", why: "The queue is a sequence; the running total is its primitive: 'would it still fit if I boarded?' is the prefix sum <= 1000, and the LAST fitting turn boards — the timeline is turn, not row order or person_id." },
        { slug: "find-stores-with-inventory-imbalance", why: "Four facts from one table: dual-direction ROW_NUMBERs (price ASC and DESC) fetch each store's priciest and cheapest products, then the judgment is priciest_qty < cheapest_qty with the ratio alongside." },
        { slug: "find-books-with-polarized-opinions", why: "Existence and share gates stack without conflating: a rating >= 4 and one <= 2 are existence tests on RAW rows, while 0.6 is a test on the combined extreme SHARE — plus MAX − MIN spread, at least 5 sessions." },
        { slug: "find-zombie-sessions", why: "A per-session fingerprint — MIN/MAX duration plus boolean-sum event counts — then a conjunctive four-condition veto: one failed criterion kills the session no matter how extreme the others are." },
        { slug: "most-common-course-pairs", why: "NOT unordered co-enrollment — ordered transitions: 'immediately followed' makes a pair two ADJACENT rows in the date-ordered sequence, so 6 courses yield 5 pairs never 15 — HAVING-qualified performers, ROW_NUMBER sequencing, step+1 self-join." },
        { slug: "find-students-with-study-spiral-pattern", why: "Periodicity, not streaks: the ENTIRE session list must repeat with period k — A,B,A,C,A,B,A,C has no equal neighbors yet is NOT a period-3 spiral — position-numbered sessions, LAG gap audit, and the period-k self-check." },
      ],
    },
  },
  {
    id: "boss",
    title: "Boss Level — The Endgame Wall",
    blurb:
      "Six original hard problems that stack the whole course: sweep-line concurrency, median emulation, streak islands over a week spine, recursive chains with a cycle guard, two-sided reconciliation and a cohort retention grid.",
    slugs: [
      "peak-concurrent-attendance",
      "median-order-value-by-region",
      "streak-week-bonus-ladder",
      "approval-chain-audit",
      "summary-drift-audit",
      "cohort-week-retention-grid",
    ],
  },
  {
    id: "boss2",
    title: "Boss Level II — Time & Money",
    blurb:
      "Six original time-series and finance problems: running-VWAP breach detection, cash runway classification, cross-midnight shift pay with a night differential, effective-dated rate blending, bilateral netting for settlement and fill-forward price staleness over a recursive minute spine.",
    slugs: [
      "vwap-deviation-first-breach",
      "runway-months-by-burn",
      "midnight-shift-pay-split",
      "blended-rate-over-effective-dates",
      "bilateral-netting-settlement",
      "price-fill-forward-staleness",
    ],
  },
  {
    id: "boss3",
    title: "Boss Level III — Chains & Graphs",
    blurb:
      "Six original recursive and graph problems: bill-of-materials leaf-demand explosion with path products, BFS min-hop reachability over directed flights, transitive-closure subtree roll-ups, canonical-edge triangle counting, referral generations pivoted per origin and effective equity ownership summed over every path.",
    slugs: [
      "bom-leaf-demand-explosion",
      "min-hops-flight-reachability",
      "subtree-budget-rollup",
      "mutual-follow-triangles",
      "referral-generations-pivot",
      "effective-equity-ownership",
    ],
  },
];

/** Flat solving order — every SQL 50 problem exactly once. */
export const SQL50_SLUGS: string[] = SQL50_SECTIONS.flatMap((s) => s.slugs);

/* ------------------------------------------------------------------ */
/* Data & Finance track (Module 13) — original domain problems,        */
/* authored for data & finance interview prep. ids 8001-8012.          */
/* ------------------------------------------------------------------ */

export const DATAFIN_SECTIONS: LcSection[] = [
  {
    id: "df-product-analytics",
    title: "Product Analytics",
    blurb:
      "The product-analytics stack — DAU against the trailing-7 WAU it lives inside, growth accounting's four levers (new, retained, resurrected, churned), funnel reach in both readings, signup-cohort retention at offsets M0-M2, gap-threshold sessionization and an A/B readout whose lift rides both rows.",
    slugs: [
      "dau-wau-stickiness",
      "growth-accounting",
      "funnel-step-conversion",
      "cohort-retention-matrix",
      "sessionize-events",
      "ab-test-conversion-lift",
    ],
    study: {
      intro: [
        "Product analytics is the craft of turning an event stream into decisions. Every click, login and purchase lands in an events table, and everything in this section is built on top of it: DAU counts the bodies on one day, WAU the trailing seven, funnels measure where the journey leaks, cohorts ask whether NEW users behave better than OLD ones, and A/B tests decide whether a change moved the number or just got lucky. If you can count distinct users over the right slice of time, you can build this entire section.",
        "The SQL shapes: a trailing-7 window for the DAU/WAU envelope, a LAG status pivot for growth accounting's four levers, a FIRST_VALUE funnel pivot for step conversion, month offsets computed arithmetically for the retention triangle, gaps-and-islands for sessionization, and the two-denominator cross join for the A/B lift. The recurring trap is the same everywhere: who belongs in the denominator — this week's actives or last week's, the events or the users, the converted only or every signup.",
        "Read the study flow first: instrument, measure, funnel, experiment, decide — every problem lives at one station of the loop. Then solve in the suggested order. Every problem carries a primer that teaches its concept from zero, and the two hardest — sessionization and the mirrored median — are worth saving until the warm-ups have shown you the table's grain.",
      ],
      flow: "product-loop",
      path: [
        { slug: "funnel-step-conversion", why: "The gentlest on-ramp: a FIRST_VALUE funnel pivot — and the overall-vs-stepwise reading that trips candidates on the real thing." },
        { slug: "ab-test-conversion-lift", why: "Two rates and one lift across a cross join — plus the repeat-row trap: the metric counts USERS, the table logs events." },
        { slug: "dau-wau-stickiness", why: "The trailing-7 envelope: distinct users in a sliding window, and the campaign spike that fattens WAU without building habit." },
        { slug: "growth-accounting", why: "The four levers (new, retained, resurrected, churned) off a LAG status pivot — and the reconciliation identity that checks your own answer." },
        { slug: "cohort-retention-matrix", why: "The retention triangle: month offsets computed arithmetically, pivoted into M0/M1/M2 — read down a column to compare cohorts at the same age." },
        { slug: "sessionize-events", why: "The finale: gaps-and-islands — LAG the gap, flag every break over 30 minutes, and let a running sum cut the stream into sessions." },
      ],
    },
  },
  {
    id: "df-finance-core",
    title: "Finance Core",
    blurb:
      "The lender's and the trader's arithmetic — a recursive amortization walk that closes to the cent, DPD buckets ruled by the oldest unpaid installment, window-share portfolio weights, T+2 settlement fails aged by lateness, average-cost realized P&L that a sell must not move, and a ledger-vs-sub-ledger reconciliation that surfaces both break signs.",
    slugs: [
      "loan-amortization-schedule",
      "delinquency-buckets",
      "portfolio-weights",
      "settlement-fails-aging",
      "realized-pnl-average-cost",
      "gl-reconciliation",
    ],
    study: {
      intro: [
        "This section is the lender's and the trader's arithmetic in its rawest form. A loan amortizes: every fixed payment splits into interest — rent on the balance still owed — and principal, which retires debt. A portfolio has weights: every position is a slice of one total. A trade settles: T+2 means the money moves two days after the trade, and a miss becomes a fail that ages. A position carries a cost basis, and only selling at market against that basis realizes P&L. And behind every one of those numbers sit two books — the general ledger and the sub-ledger — that must tell the same story.",
        "The SQL shapes: a WITH RECURSIVE walk for the schedule (each month computes from the previous ending balance), CASE ladders for DPD buckets, a window share for weights, aging brackets off due dates for fails, a running average-cost replay for realized P&L, and delta-by-account for the reconciliation. Money is INTEGER cents throughout — REAL is reserved for rates and never reaches an output column.",
        "The primers teach each contract from zero — what amortization is, what days-past-due means, why weights always sum to 100 — and the study flow shows the pipeline from contracts to reports. The two valuations at the end are the interviews' favorites because both fail silently when a join fans out: a wrong SUM of P&L, a delta that never zeroes.",
      ],
      flow: "money-pipeline",
      path: [
        { slug: "delinquency-buckets", why: "Start at the collections desk: CASE the oldest unpaid installment into current / 1-30 / 31-60 / 61-90 / 90+ — the bucket ladder every credit report uses." },
        { slug: "portfolio-weights", why: "One window share per account — value ÷ SUM(value) OVER (PARTITION BY account) — and slices that must sum to 100.00 exactly." },
        { slug: "loan-amortization-schedule", why: "The recursive month machine: interest = rate/12 × balance, the MIN cap on principal, and a schedule that closes at exactly 0." },
        { slug: "settlement-fails-aging", why: "The T+2 gate: due-date arithmetic, fails vs on-time, and aging brackets off days late — settlement ops' daily sheet." },
        { slug: "gl-reconciliation", why: "Two books, one truth: net each account both ways and surface the break in BOTH signs — a sub-ledger missing an entry, a GL double-count." },
        { slug: "realized-pnl-average-cost", why: "The finale: a running average-cost replay where every buy re-blends the basis and each sell realizes price − average — to the cent." },
      ],
    },
  },
  {
    id: "df-growth-experiments",
    title: "Growth & Experiments",
    blurb:
      "The growth desk's weekly rhythm — WoW churn against the week that just left, median days-to-convert per signup cohort, a trailing-7 rolling-active line no frame can sum, PERCENT_RANK usage tiers where ties share a tier, the sample-ratio check every experiment must pass, and adoption read off each user's own signup clock.",
    slugs: [
      "week-over-week-churn",
      "median-time-to-convert",
      "rolling-7d-actives",
      "usage-tier-percentiles",
      "ab-sample-ratio-mismatch",
      "feature-adoption-windows",
    ],
    study: {
      intro: [
        "Growth teams run on a weekly rhythm: measure who left, measure who converts and how fast, keep the active-user line honest, rank engagement into tiers, and only then trust an experiment. Churn is measured against the week that just left — the at-risk pool is last week's actives, not this week's. Time-to-convert is reported as a MEDIAN because one straggler drags a mean but not a median. The rolling-7 active count collapses a user active five days into ONE body, never five. Percentile tiers rank users against each other, not against a fixed bar. And before any lift is read, the sample-ratio check asks one question: did the traffic actually split the way we designed it?",
        "The SQL shapes: a weekly pivot with LAG for churn, the row-number mirror median, an inclusive trailing-7 self-join for rolling actives (no window frame can sum DISTINCT), PERCENT_RANK with fixed cut points for tiers, a deviation guard for the SRM check, and conditional windows measured off each user's OWN signup clock for adoption. The recurring discipline is denominators: the departed week for churn, the converted only for medians, every signup for adoption.",
        "The primers carry the concepts from zero — what SRM is, why medians, what a percentile means — and the study flow walks an experiment's life from hypothesis to monitor. Solve the warm-ups first; the two window problems at the end are the batch's hardest because both hinges — adjacency and the personal clock — stay invisible until you have hand-walked one user through them.",
      ],
      flow: "experiment-life",
      path: [
        { slug: "ab-sample-ratio-mismatch", why: "The gate before the lift: one ratio, one tolerance, one guard — the cheapest query in the section and the one every experiment must pass." },
        { slug: "usage-tier-percentiles", why: "PERCENT_RANK with fixed cut points — where you stand in the line, and ties share a tier." },
        { slug: "rolling-7d-actives", why: "The trailing window no frame can sum: an inclusive trailing-7 self-join and DISTINCT — the anti-SUM lesson." },
        { slug: "week-over-week-churn", why: "The weekly pivot with LAG: this week's absent set over LAST week's pool — plus the resurrection edge case." },
        { slug: "median-time-to-convert", why: "The row-number mirror median per signup cohort — and the straggler that moves the mean but not the median." },
        { slug: "feature-adoption-windows", why: "The finale: 7/14/30-day conditional windows measured off each user's own signup date, never-users kept honest in the denominator." },
      ],
    },
  },
  {
    id: "df-markets-risk",
    title: "Markets & Risk",
    blurb:
      "The markets desk in SQL — FX exposure normalized through the latest as-of rate, HHI concentration on the 0-10000 scale, a date-spine interest accrual that carries day-end balances, the dividend income calendar gated on ex-dates, running-max drawdowns with the peak that set them, and duplicate-charge pairs inside a 120-second window.",
    slugs: [
      "fx-exposure-report",
      "portfolio-concentration-hhi",
      "daily-balance-interest",
      "dividend-income-calendar",
      "max-drawdown",
      "duplicate-charge-pairs",
    ],
    study: {
      intro: [
        "The markets desk runs on one loop: positions get marked to market every day, marks become exposures, exposures become risk numbers, and cash events — interest, dividends, FX — land in the income line. FX exposure normalizes every currency through its latest as-of rate into one USD column. HHI squares each weight to punish concentration. Interest accrues on every day-end balance, not on the month's average. Dividends belong to whoever holds the stock BEFORE the ex-date — one day late loses the whole payment. Max drawdown measures the deepest fall from the highest peak the portfolio has stood on. And surveillance hunts the duplicate charge: the same amount twice inside a 120-second window.",
        "The SQL shapes: the latest-row-as-of join (rank rates by recency per currency), a squared-weight SUM for HHI, a WITH RECURSIVE date spine carrying the balance day by day, the ex-date gate for the income calendar, a running-max window with an argmax join-back for drawdowns, and the self-join pair hunt with tie-safe identity for duplicates. Two currencies of trap: minor units (all money is INTEGER cents) and boundary edges — the rate exactly on the as-of date, the charge exactly 120 seconds later.",
        "The primers teach each instrument from zero — what an as-of rate is, why HHI squares, what ex-date means — and the study flow follows the desk's day from marks to report. The three Hards (the interest spine, the drawdown argmax, the pair hunt's chain-vs-clique) are the interview set-pieces; earn them with the easier reads first.",
      ],
      flow: "market-desk",
      path: [
        { slug: "portfolio-concentration-hhi", why: "One weight, squared, summed: the HHI on its 0-10000 scale — and the 2500 case sitting exactly on the moderate line." },
        { slug: "dividend-income-calendar", why: "The ex-date gate: a strictly-future comparison and the honest fanout when one holding earned two dividends." },
        { slug: "fx-exposure-report", why: "The latest-rate-as-of join per currency — exposure = minor units × USD-per-unit in one multiplication." },
        { slug: "duplicate-charge-pairs", why: "The pair hunt: equality on amount inside an inclusive 0-120-second window, deduped by id order — chains are not cliques." },
        { slug: "max-drawdown", why: "The running-max window and the argmax join-back: the deepest trough paired with the peak that set it." },
        { slug: "daily-balance-interest", why: "The finale: a recursive date spine carrying every day-end balance, rate/365 accrual per day, rounded once at the end." },
      ],
    },
  },
  {
    id: "df-banking-credit",
    title: "Banking & Credit Risk",
    blurb:
      "The lender's whole pipe in SQL — vintage default curves that cohort loans by origination month, the delinquency roll-rate matrix a credit officer reads weekly, the utilization bands behind every credit score, PD × LGD × EAD provisioning, the rate sheet with its override exceptions, and the two balance walks that price an early payoff.",
    slugs: [
      "vintage-default-curves",
      "delinquency-roll-rates",
      "credit-utilization-bands",
      "expected-credit-loss",
      "risk-based-pricing",
      "prepayment-detection",
    ],
    study: {
      intro: [
        "Start with one sentence: a bank lends money and some of it does not come back. Everything in this section is machinery for measuring WHICH loans, HOW LATE, and HOW MUCH. A loan is born at origination (the score picks the APR), lives month by month on an amortization schedule, and either runs to term or dies early — paid off, or defaulted. The whole section is SQL reading of that pipe: each problem takes one leg.",
        "The core trick every problem shares: comparing states over TIME. A vintage curve compares loan cohorts (the 2026-01 brew against the 2026-02 brew) as they age side by side. Roll rates compare every customer's delinquency bucket this month against last month — a state machine you build with a self-join. Utilization and pricing compare a customer against a ladder of bands. ECL multiplies three rates into one loss number. Prepayment runs TWO walks over the same loan — the schedule and what actually happened — and reads the difference.",
        "Read the study flow below first: origination on the left, servicing in the middle, the delinquency stair and the default exit on the right. Then solve in the suggested order — the easy gauge first, the recursive schedule last. Every problem carries a primer that teaches its concept from zero, so if PD/LGD/EAD reads like alphabet soup, the primer fixes that before the breakdown starts.",
      ],
      flow: "loan-life",
      path: [
        { slug: "credit-utilization-bands", why: "The gentlest on-ramp: latest-row + a ratio + CASE bands — and the 30% line is a real credit-score mechanic you can use outside interviews." },
        { slug: "risk-based-pricing", why: "The band-join pattern (score BETWEEN tier bounds) plus override precedence — how the APR on a real offer letter was actually produced." },
        { slug: "vintage-default-curves", why: "The classic credit-risk interview question: cohort by origination month, cumulative default with a window SUM, and the curve that only steps up." },
        { slug: "expected-credit-loss", why: "Three rates multiplied per loan and summed per segment — the regulator's number, and the sum-of-products trap that fails half the candidates." },
        { slug: "delinquency-roll-rates", why: "The state machine: bucket this month vs last month for every customer, ordered by a severity CASE — never alphabetical." },
        { slug: "prepayment-detection", why: "The finale: a WITH RECURSIVE scheduled walk over the same loan the payments table records actually — savings to the cent." },
      ],
    },
  },
  {
    id: "df-fraud-aml",
    title: "Fraud & AML",
    blurb:
      "The surveillance desk in SQL — cash deposits sliced under the CTR wall, 300-second velocity bursts on the card feed, boomerang transfers that come back inside seven days, z-scores against the customer's own baseline, merchants over the 1% chargeback wall, and the dormant account that wakes up unverified.",
    slugs: [
      "structuring-detection",
      "transaction-velocity",
      "circular-transfers",
      "amount-anomaly-zscore",
      "chargeback-rate-ranking",
      "dormant-reactivation",
    ],
    study: {
      intro: [
        "Fraud work is pattern-hunting with rules a regulator can read. Money moves through a pipeline — swipe, authorize, capture, settle — and every stage has a screen: velocity at authorization, duplicates at settlement, dispute rates across a merchant portfolio. On the AML side, the government's reporting walls (the 10,000-dollar CTR) create a signature: criminals slice under them, and the SQL that catches slicing is a GROUP BY with a guard.",
        "Two SQL shapes dominate this section. The first is the WINDOW: bucket time (300-second velocity buckets) or rank within a group (the 5th-worst return, the earliest matching sell). The second is the SELF-JOIN: a table paired with itself — a transfer against the transfer that comes back, a login against the login six months earlier. Both shapes fail in characteristic ways, and every problem here pins those wrong answers with live probes.",
        "The primers carry the domain: what structuring is and why it is a crime even when the money is clean, why stolen cards burst, what a z-score means against a customer's own history. The study flow shows the pipeline — find each problem's gate on it before you write a line of SQL.",
      ],
      flow: "payments-pipeline",
      path: [
        { slug: "chargeback-rate-ranking", why: "The easiest read: GROUP BY, a rate, a HAVING wall — plus the refund-in-the-denominator trap that processors actually litigate." },
        { slug: "structuring-detection", why: "The classic AML flag: per-day grouping with three guards at once (count, total, and every slice under the wall)." },
        { slug: "transaction-velocity", why: "Time-bucket math on epoch seconds — integer division, purchases only, and the burst that straddles a bucket edge." },
        { slug: "amount-anomaly-zscore", why: "Your first per-group statistics: mean, population sigma via sqrt, and the z-score compared RAW before any rounding." },
        { slug: "dormant-reactivation", why: "The negative-space pattern: proving ZERO logins in a window with NOT EXISTS, and shipping the NULL prior-login row honestly." },
        { slug: "circular-transfers", why: "The self-join finale: the boomerang pair inside 604,800 seconds, deduped by id order — and why a 3-hop chain never matches." },
      ],
    },
  },
  {
    id: "df-accounting-close",
    title: "Accounting & Close",
    blurb:
      "The controller's month in SQL — a trial balance that surfaces the one broken account, the AR aging conveyor, the opening-plus-activity rollforward auditors request first, FIFO inventory layers consumed oldest-first, deferred revenue unwinding across service months, and the document-number gaps that prove a deletion.",
    slugs: [
      "trial-balance-check",
      "ar-aging-schedule",
      "balance-rollforward",
      "fifo-inventory-cogs",
      "deferred-revenue",
      "journal-gap-detection",
    ],
    study: {
      intro: [
        "Accounting runs on one iron rule: every transaction touches at least TWO accounts, and debits equal credits. That rule makes accounting data perfect for SQL — everything balances, so every query you write is a checkpoint that either ties out or names the account that broke. The month-end close is the ritual that proves it: sub-ledgers post to the journal, the journal posts to the general ledger, the trial balance checks, the rollforwards bridge last month to this month, and only then do statements print.",
        "This section is five of those checkpoints plus the two hardest valuation puzzles in the batch. FIFO inventory is the marquee: sales consume the OLDEST cost layers first, and the set-based solution is a cross join with three clamps — the kind of query that separates candidates who can follow SQL from candidates who can think in it. Deferred revenue is its mirror: cash arrives on day one, but revenue is recognized month by month across a term, on a recursive month spine.",
        "The sign conventions are pinned in the constraints of each problem (this track uses one uniform closing formula and says so). The primers teach debits and credits from zero — left vs right, not good vs bad — so the trial balance reads like a scale and not like a mystery.",
      ],
      flow: "month-close",
      path: [
        { slug: "trial-balance-check", why: "Start at the heartbeat: SUM both sides per account, read the delta — the easiest query in the batch and the close's first gate." },
        { slug: "balance-rollforward", why: "One equation per account — and the LEFT JOIN trap that erases the quiet account every candidate falls for at least once." },
        { slug: "ar-aging-schedule", why: "The pivot: five buckets built from SUM(CASE ...), with the bucket-edge boundaries seeded exactly where audits bite." },
        { slug: "journal-gap-detection", why: "A recursive number spine against the table — completeness testing, and the cleanest WITH RECURSIVE warm-up in the track." },
        { slug: "deferred-revenue", why: "Time on a spine: month labels from date(start_date, '+N months'), the term-end off-by-one seeded as the trap." },
        { slug: "fifo-inventory-cogs", why: "The finale and the hardest problem in the batch: cumulative supply and demand, a cross join, three clamps, and cents that must tie exactly." },
      ],
    },
  },
  {
    id: "df-quant-desk",
    title: "Quant Desk",
    blurb:
      "The fund's numbers in SQL — sub-period returns chained across deposit breaks, the Sharpe ratio with population sigma, the 5th-worst day as VaR, beta against the benchmark from a ratio of sums, the split-adjusted position rebuilt through corporate actions, and the wash-trade pairs surveillance screens.",
    slugs: [
      "time-weighted-return",
      "sharpe-ratio",
      "value-at-risk",
      "beta-benchmark",
      "split-adjusted-position",
      "wash-trade-detection",
    ],
    study: {
      intro: [
        "Every number on a fund factsheet starts as the same two columns: dated values and dated cash flows. Trades build positions, positions get marked to market every day, daily marks become a returns series — and the returns series answers four different questions depending on the statistic you pour over it. TWR strips out deposit timing, Sharpe divides by the bumpiness, VaR reads the left tail, beta measures the wobble against the market itself.",
        "The SQL is statistics under discipline. Sharpe and beta are one SELECT each — but only if you pin the POPULATION sigma (divide by n, never n−1), compute sqrt from SQLite's math functions, and compare on RAW values before rounding for display. VaR is a ranking: order the returns ascending and pick row 5 — where the off-by-one lives. TWR is the hardest: boundaries at flow dates, flows excluded from return, three sub-periods the engine grades to four decimals.",
        "The section closes with surveillance and bookkeeping: splits rewrite history (adjust shares and prices in OPPOSITE directions, only for the split's symbol, only before the date), and wash trades are the self-join pair hunt with an earliest-match dedupe. The primers assume zero finance background — the chef analogy for TWR, the heartbeat analogy for beta.",
      ],
      flow: "trades-to-risk",
      path: [
        { slug: "beta-benchmark", why: "One row, one formula: a ratio of sums with a TS float mirror — and the correlation-vs-beta confusion probed live." },
        { slug: "sharpe-ratio", why: "LAG into a returns series, population sigma via sqrt, the risk-free subtraction — and the n−1 probe that fails half the candidates." },
        { slug: "value-at-risk", why: "Ranking as SQL: ROW_NUMBER ascending, pick rn = 5, report the SIGNED loss — the off-by-one is seeded on purpose." },
        { slug: "split-adjusted-position", why: "Corporate actions: shares multiply, prices divide, and only that symbol's pre-split trades adjust — ZYGO must come out untouched." },
        { slug: "wash-trade-detection", why: "The pair hunt: same account, same symbol, 1 to 3600 seconds inclusive, earliest sell only — the dedupe is the trap." },
        { slug: "time-weighted-return", why: "The finale: sub-period boundaries at flow dates, flows subtracted from value not from return, chained factsheet math graded to four decimals." },
      ],
    },
  },
  {
    id: "df-saas-metrics",
    title: "SaaS & Subscriptions",
    blurb:
      "The subscription revenue lifecycle in SQL — a trial funnel with honest denominators, plan migrations ranked by tier, the MRR movement waterfall every board deck prints, NRR that keeps churned customers in the denominator, unit economics priced per channel, and the winback window that decides which save-offer ships.",
    slugs: [
      "trial-to-paid-funnel",
      "plan-migration-paths",
      "mrr-waterfall",
      "net-revenue-retention",
      "ltv-cac-payback",
      "winback-recovery",
    ],
    study: {
      intro: [
        "A subscription business lives or dies on one loop: a visitor starts a trial, activates (uses the product enough to feel value), converts to paying, expands into a bigger plan, and either stays, churns, or comes back. Every metric in this section watches one leg of that loop, and every one of them is a fraction — which means every one of them is an argument about the DENOMINATOR. Activation against trials or signups? NRR including the churned or pretending they never left? The SQL is rarely hard; the conventions are.",
        "The SQL shapes: a weekly funnel of conditional counts with a pinned trial window, a LAG plan-transition walk joined to a tier ladder, the movement waterfall that classifies each customer's month-over-month MRR into new, expansion, contraction and churned, a cohort NRR with month-offset arithmetic, a unit-economics ladder (ARPU, churn, CAC, LTV, payback) built per channel, and a winback read that grades resubscribes against a 90-day clock. Money stays INTEGER cents throughout; rates and ratios are the only REALs.",
        "Read the study flow first: signup on the left, the expand-or-churn fork in the middle, the winback loop on the right. Then solve in the suggested order — the funnel warm-ups before the waterfall, because the waterfall is where careless denominators stop being rounded errors and start being wrong decks. Every problem carries a primer: if NRR and CAC payback read like alphabet soup, the primer fixes that before the breakdown starts.",
      ],
      flow: "revenue-lifecycle",
      path: [
        { slug: "trial-to-paid-funnel", why: "The gentlest on-ramp: a weekly funnel of conditional counts — and the 14-day activation window that separates real activation from late noise." },
        { slug: "plan-migration-paths", why: "The LAG transition walk: classify every plan change as upgrade, downgrade or lateral by joining a tier ladder — never by comparing plan names." },
        { slug: "net-revenue-retention", why: "The money-weighted cohort: MRR at month 0 versus month 3, with churned customers held honestly at zero IN the denominator." },
        { slug: "ltv-cac-payback", why: "The unit-economics ladder per channel: ARPU, churn, CAC, LTV at the pinned 80 percent margin, and the payback month every CFO asks for." },
        { slug: "mrr-waterfall", why: "The board-deck finale: classify each customer's month-over-month move — new, expansion, contraction, churned — with churned counted at the PRIOR month's MRR." },
        { slug: "winback-recovery", why: "The loop closer: resubscribes inside an inclusive 90-day window, per cancel reason — with the zero-recovery reasons still reporting." },
      ],
    },
  },
  {
    id: "df-marketing-attribution",
    title: "Marketing & Attribution",
    blurb:
      "From spend to signup in SQL — ROAS with a zero-revenue guard, first and last touch inside the 30-day lookback, the email funnel's step-by-step rates, linear multi-touch splitting credit into fractions, budget pacing that names the first breach day, and the channel whose customers actually pay back their CAC in 90 days.",
    slugs: [
      "roas-by-campaign",
      "first-last-touch-attribution",
      "email-engagement-funnel",
      "linear-multi-touch",
      "budget-pacing",
      "channel-ltv-vs-cac",
    ],
    study: {
      intro: [
        "Marketing runs on a chain of accountability: dollars go in at the top, touches (an ad seen, an email opened) pile up in the middle, conversions come out the bottom — and every model in this section is a different way of drawing the arrows backward from revenue to spend. Attribution is the argument: last-touch says the closing ad earned it, first-touch says the introduction did, linear splits the credit evenly. The SQL exists to make those arguments reproducible.",
        "The SQL shapes: a ROAS rollup with the LEFT JOIN that keeps zero-revenue campaigns alive, FIRST_VALUE and LAST_VALUE over a pinned 30-day lookback (where the window-frame clause is the difference between right and confidently wrong), a five-step funnel of conditional counts, fractional credit as 1.0/n summed per channel, a running-sum pacing line with a strictly-greater breach gate, and a channel readout measured on each customer's OWN 90-day clock. Denominators again: opened against delivered, credit against touch count, revenue against every acquired customer including the ones who never ordered.",
        "The primers teach the models from zero — what a lookback window is, why linear rewards the assisters, what payback months mean — and the study flow walks the chain from budget to LTV:CAC. The two Hards at the end are the interview set-pieces: one about time (the personal clock), one about fairness (the fraction machine).",
      ],
      flow: "spend-to-signup",
      path: [
        { slug: "roas-by-campaign", why: "The Monday-morning read: revenue over spend per campaign — and the LEFT JOIN that keeps the zero-revenue campaign visible at 0.0 instead of vanishing." },
        { slug: "first-last-touch-attribution", why: "The two-bookend models in one query: FIRST_VALUE and LAST_VALUE over a pinned lookback, where the window-frame clause is seeded as the trap." },
        { slug: "email-engagement-funnel", why: "Five steps, five distinct counts, two step rates — each against its IMMEDIATE predecessor, the denominators every CRM argument is about." },
        { slug: "linear-multi-touch", why: "The fraction machine: 1.0/n credit per touch, summed per channel — where rounding after the SUM (never before) decides the winner." },
        { slug: "budget-pacing", why: "The running-sum gate: cumulative spend against the budget line, strictly greater, first breach only — and the exactly-at-budget campaign that must NOT flag." },
        { slug: "channel-ltv-vs-cac", why: "The finale: 90-day revenue measured on each customer's own acquisition clock, against the channel's CAC — with zero-order customers kept honest in the denominator." },
      ],
    },
  },
  {
    id: "df-warehouse-craft",
    title: "Warehouse Craft",
    blurb:
      "The analytics engineer's toolkit in SQL — a keep-latest dedupe with a tie-break, the null-and-blank sweep that gates every dashboard, point-in-time reads against a Type 2 dimension, BUILDING that dimension from a change feed, the late-arriving restatement that re-opens last week, and the snapshot delta that names every overnight change.",
    slugs: [
      "keep-latest-dedupe",
      "null-blank-audit",
      "snapshot-delta-detect",
      "point-in-time-asof",
      "late-arriving-restatement",
      "scd2-build",
    ],
    study: {
      intro: [
        "Between the raw feed and the dashboard sits a craft: turning an append-only, duplicate-riddled, late-delivering event stream into tables a stakeholder can trust. This section is that craft. A status feed fires five updates per order and the dashboard wants ONE row per order. A source table carries NULLs, empty strings and whitespace like they are values. Facts arrive dated last Tuesday in yesterday's batch. Customer attributes change and someone asks what the data said LAST quarter. None of this is analytics — all of it must be true before analytics starts.",
        "The SQL shapes: ROW_NUMBER dedupe with a lexicographic (timestamp, id) tie-break, a single-row conditional-aggregation audit that counts NULL and blank SEPARATELY, the FULL OUTER JOIN snapshot comparison that classifies inserted, removed, changed and unchanged, the half-open [valid_from, valid_to) as-of join against a Type 2 dimension, a restatement delta between true event dates and processed dates, and the full SCD2 build — LAG the dedupe, LEAD the validity window, sentinel the current row.",
        "The primers teach the warehouse worldview from zero — what slowly changing means, why the current row's valid_to is the year 9999, what a watermark is — and the study flow walks the pipeline from raw feed to trusted read, with the restatement loop-back drawn where it belongs. The two Hards close the section because they are the two interview questions analytics-engineer loops always reach: build the SCD2, and handle the late data.",
      ],
      flow: "ingest-to-trust",
      path: [
        { slug: "keep-latest-dedupe", why: "The daily bread: one row per key, latest wins — with the timestamp TIE that only a lexicographic (updated_at, event_id) ordering resolves." },
        { slug: "null-blank-audit", why: "The pre-flight sweep: NULL and blank counted separately, a pinned freshness window, and one pass-fail bit that gates the dashboard." },
        { slug: "snapshot-delta-detect", why: "The overnight compare: a FULL OUTER JOIN that names every change — inserted, removed, changed, unchanged — with NULL-safe keys." },
        { slug: "point-in-time-asof", why: "Read the dimension AS OF yesterday: the half-open interval convention, the 9999 sentinel, and the two boundary edges seeded on purpose." },
        { slug: "late-arriving-restatement", why: "When yesterday's batch contains last Tuesday: true date against processed date, and the delta that names which days need re-issuing." },
        { slug: "scd2-build", why: "The finale: BUILD the Type 2 dimension — dedupe no-ops with LAG, cut validity windows with LEAD, sentinel the current row — the analytics-engineer interview's favorite ask." },
      ],
    },
  },
  {
    id: "df-retail-rfm",
    title: "Retail & RFM",
    blurb:
      "The merchandiser's month in SQL — basket depth and average order value, the repeat rate that proves habit, RFM quintiles cut with NTILE into named segments, weeks of supply against the two-week reorder line, return rates against the eight-percent wall, and the revenue cohort triangle that prices loyalty.",
    slugs: [
      "basket-depth-aov",
      "repeat-purchase-rate",
      "rfm-segmentation",
      "weeks-of-supply",
      "returns-rate-by-category",
      "cohort-repeat-revenue",
    ],
    study: {
      intro: [
        "Retail analytics is the oldest data game there is, and its core questions have not changed: how big is a basket, how often do buyers come back, who is about to run out of stock, and what came back over the transom. RFM is the classic synthesis — score every customer on Recency, Frequency and Monetary value, cut each into quintiles, and map the three digits to segments marketing can act on: champions to reward, the at-risk to win back, the hibernating to leave alone.",
        "The SQL shapes: a two-metric monthly rollup where the items join defines the basket, a repeat rate whose denominator includes the one-timers, NTILE(5) quintiles with PINNED directions (and the tile arithmetic that makes a 12-customer seed exact), a trailing four-week sales rate against on-hand inventory with a zero-sales sentinel, a category return rate where exactly-8.00 is unflagged, and the revenue cohort triangle — month offsets computed arithmetically, revenue attributed to M0, M1 and M2.",
        "The primers teach the retail lens from zero — what a quintile is, why weeks of supply divides by four, what makes a cohort's repeat share the number loyalty programs defend — and the study flow runs from carts to segments to the campaign loop-back. RFM is the section's interview centerpiece; the two cohort problems around it are where the real thinking lives.",
      ],
      flow: "shop-to-segment",
      path: [
        { slug: "basket-depth-aov", why: "The monthly staples: average order value and items per order — where the zero-item order must NOT pollute the average." },
        { slug: "repeat-purchase-rate", why: "The habit read: customers with two or more orders over ALL customers that month — one-timers stay in the denominator on purpose." },
        { slug: "returns-rate-by-category", why: "The quality wall: returned over sold per category, strictly above 8.00 flags — with the exactly-8.00 category seeded as the edge." },
        { slug: "weeks-of-supply", why: "The buyer's clock: on-hand over the trailing four-week rate, reorder below 2.0 weeks — and the zero-sales sentinel that must not divide by zero." },
        { slug: "rfm-segmentation", why: "The centerpiece: recency, frequency, monetary into NTILE quintiles, three digits into named segments — the ladder's order decides who is a champion." },
        { slug: "cohort-repeat-revenue", why: "The finale: the revenue-weighted cohort triangle — M0, M1, M2 offsets by arithmetic, and the repeat share that prices loyalty." },
      ],
    },
  },
];

/** Flat solving order for the Data & Finance track. */
export const DATAFIN_SLUGS: string[] = DATAFIN_SECTIONS.flatMap((s) => s.slugs);

/** Every sandbox-graded SQL section in canonical order (SQL 50+ band first). */
export const SQL_ALL_SECTIONS: LcSection[] = [...SQL50_SECTIONS, ...DATAFIN_SECTIONS];

const SECTION_BY_SLUG = new Map<string, LcSection>(
  SQL_ALL_SECTIONS.flatMap((s) => s.slugs.map((slug) => [slug, s] as const)),
);

/** The section a SQL problem belongs to (undefined for non-SQL rows). */
export function sqlSectionOf(slug: string): LcSection | undefined {
  return SECTION_BY_SLUG.get(slug);
}

/** Lesson-less band module id → its sections + slugs, so each band module
 *  counts (and displays) its own progress instead of sharing Module 12's. */
export const BAND_BY_MODULE: Record<string, { sections: LcSection[]; slugs: string[] }> = {
  "leetcode-sql50": { sections: SQL50_SECTIONS, slugs: SQL50_SLUGS },
  "data-finance-sql": { sections: DATAFIN_SECTIONS, slugs: DATAFIN_SLUGS },
};
