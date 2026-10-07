// The SQL band, divided into sections. The first seven mirror the official
// SQL 50 study list (and the sandbox deep-dive files authored per section);
// the five "beyond the 50" sections hold the expansion band — LeetCode's
// free Database extras plus platform classics. The LeetCode view groups the
// SQL band by these, and the Module 12 band shows the same sections in its
// card.
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
