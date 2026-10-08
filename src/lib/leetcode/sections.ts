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
