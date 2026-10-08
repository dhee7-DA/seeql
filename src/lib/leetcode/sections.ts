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

export interface LcSection {
  /** stable id — used for DOM anchors (`sql-sec-<id>`) and logging */
  id: string;
  /** display title — the group header in the LeetCode view */
  title: string;
  /** one-line "what skill family this is" note under the header */
  blurb: string;
  /** problem slugs in the intended solving order */
  slugs: string[];
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
];

/** Flat solving order — every SQL 50 problem exactly once. */
export const SQL50_SLUGS: string[] = SQL50_SECTIONS.flatMap((s) => s.slugs);

const SECTION_BY_SLUG = new Map<string, LcSection>(
  SQL50_SECTIONS.flatMap((s) => s.slugs.map((slug) => [slug, s] as const)),
);

/** The section a SQL 50 problem belongs to (undefined for non-SQL rows). */
export function sqlSectionOf(slug: string): LcSection | undefined {
  return SECTION_BY_SLUG.get(slug);
}
