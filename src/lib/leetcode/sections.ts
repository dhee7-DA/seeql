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
