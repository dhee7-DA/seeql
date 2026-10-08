// Registry rows — the SQL band, batch 7: LeetCode PREMIUM tier III (35
// problems, LC ids 1919-2669 — the second tranche of the remaining premium
// long-tail per Task 66-a's by-ID live reconciliation). Re-authored with
// original schemas/seeds/statements. `free: 0` flags them with the amber
// "premium" badge; the "SQL Premium" list keeps the /^SQL/ band flag. Same
// tuple format as registry-sql-premium2.ts.
import type { LcRow } from "./row";

export const SQL_PREMIUM3: LcRow[] = [
  // PREMIUM STATS & ELIGIBILITY — cutoffs, time buckets, never-streamers, tiers
  [1988, "find-cutoff-score-for-each-school", "Find Cutoff Score for Each School", 1, "SQL · Cutoff|Capacity", "SQL Premium", "LeetCode Premium", 0],
  [1990, "count-the-number-of-experiments", "Count the Number of Experiments", 1, "SQL · Time buckets|strftime", "SQL Premium", "LeetCode Premium", 0],
  [2020, "number-of-accounts-that-did-not-stream", "Number of Accounts That Did Not Stream", 1, "SQL · NOT EXISTS|Year filter", "SQL Premium", "LeetCode Premium", 0],
  [2026, "low-quality-problems", "Low-Quality Problems", 0, "SQL · Ratio filter|Integer division", "SQL Premium", "LeetCode Premium", 0],
  [2041, "accepted-candidates-from-the-interviews", "Accepted Candidates From the Interviews", 1, "SQL · HAVING|Min score", "SQL Premium", "LeetCode Premium", 0],
  [2051, "the-category-of-each-member-in-the-store", "The Category of Each Member in the Store", 1, "SQL · CASE tiers|LEFT JOIN", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM COMMERCE & DISCOUNTS — conditional deletes, distinct eligibles, argmax buyers
  [2084, "drop-type-1-orders-for-customers-with-type-0-orders", "Drop Type 1 Orders for Customers With Type 0 Orders", 1, "SQL · DELETE|EXISTS", "SQL Premium", "LeetCode Premium", 0],
  [2205, "the-number-of-users-that-are-eligible-for-discount", "The Number of Users That Are Eligible for the Discount", 0, "SQL · COUNT DISTINCT|Date+amount", "SQL Premium", "LeetCode Premium", 0],
  [2230, "the-users-that-are-eligible-for-discount", "The Users That Are Eligible for the Discount", 0, "SQL · DISTINCT|Dual filter", "SQL Premium", "LeetCode Premium", 0],
  [2238, "number-of-times-a-driver-was-a-passenger", "Number of Times a Driver Was a Passenger", 1, "SQL · LEFT JOIN|Zero counts", "SQL Premium", "LeetCode Premium", 0],
  [2324, "product-sales-analysis-iv", "Product Sales Analysis IV", 1, "SQL · Argmax|ROW_NUMBER", "SQL Premium", "LeetCode Premium", 0],
  [2329, "product-sales-analysis-v", "Product Sales Analysis V", 0, "SQL · Top-N|SUM order", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM CONTESTS & BOARDS — greedy boarding, islands, standings, percentages
  [2142, "the-number-of-passengers-in-each-bus-i", "The Number of Passengers in Each Bus I", 1, "SQL · Greedy pairing|Window", "SQL Premium", "LeetCode Premium", 0],
  [2153, "the-number-of-passengers-in-each-bus-ii", "The Number of Passengers in Each Bus II", 2, "SQL · Capacity greedy|Running sum", "SQL Premium", "LeetCode Premium", 0],
  [2173, "longest-winning-streak", "Longest Winning Streak", 2, "SQL · Gaps & islands|Streaks", "SQL Premium", "LeetCode Premium", 0],
  [2175, "the-change-in-global-rankings", "The Change in Global Rankings", 1, "SQL · Delta apply|RANK", "SQL Premium", "LeetCode Premium", 0],
  [2339, "all-the-matches-of-the-league", "All the Matches of the League", 0, "SQL · Cross join|Fixtures", "SQL Premium", "LeetCode Premium", 0],
  [2346, "compute-the-rank-as-a-percentage", "Compute the Rank as a Percentage", 1, "SQL · Window COUNT|Percentage", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM PIVOTS & LAYOUTS — equation strings, zips, pivots, unpivots, interleave
  [2118, "build-the-equation", "Build the Equation", 2, "SQL · String build|MAX(CASE)", "SQL Premium", "LeetCode Premium", 0],
  [2159, "order-two-columns-independently", "Order Two Columns Independently", 1, "SQL · ROW_NUMBER zip|Dual sort", "SQL Premium", "LeetCode Premium", 0],
  [2252, "dynamic-pivoting-of-a-table", "Dynamic Pivoting of a Table", 2, "SQL · Pivot|CASE aggregate", "SQL Premium", "LeetCode Premium", 0],
  [2253, "dynamic-unpivoting-of-a-table", "Dynamic Unpivoting of a Table", 2, "SQL · Unpivot|UNION ALL", "SQL Premium", "LeetCode Premium", 0],
  [2308, "arrange-table-by-gender", "Arrange Table by Gender", 1, "SQL · Interleave|Positional order", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM OPERATIONS & CLASSIFY — weekend pivots, influence gates, forward fill
  [2298, "tasks-count-in-the-weekend", "Tasks Count in the Weekend", 1, "SQL · strftime %w|Two-row pivot", "SQL Premium", "LeetCode Premium", 0],
  [2372, "calculate-the-influence-of-each-salesperson", "Calculate the Influence of Each Salesperson", 1, "SQL · HAVING gate|COALESCE", "SQL Premium", "LeetCode Premium", 0],
  [2377, "sort-the-olympic-table", "Sort the Olympic Table", 0, "SQL · Multi-key ORDER BY", "SQL Premium", "LeetCode Premium", 0],
  [2388, "change-null-values-in-a-table-to-the-previous-value", "Change Null Values in a Table to the Previous Value", 1, "SQL · Forward fill|LAG", "SQL Premium", "LeetCode Premium", 0],
  [2480, "form-a-chemical-bond", "Form a Chemical Bond", 0, "SQL · Top-2 per group|RN filter", "SQL Premium", "LeetCode Premium", 0],
  [2504, "concatenate-the-name-and-the-profession", "Concatenate the Name and the Profession", 0, "SQL · Concat|SUBSTR UPPER", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM HARD STREAKS & BUDGETS — taste graphs, budget greeds, growth runs
  [1919, "leetcodify-similar-friends", "Leetcodify Similar Friends", 2, "SQL · Shared-count|Graph join", "SQL Premium", "LeetCode Premium", 0],
  [2004, "the-number-of-seniors-and-juniors-to-join-the-company", "The Number of Seniors and Juniors to Join the Company", 2, "SQL · Budget greedy|Running sum", "SQL Premium", "LeetCode Premium", 0],
  [2010, "the-number-of-seniors-and-juniors-to-join-the-company-ii", "The Number of Seniors and Juniors to Join the Company II", 2, "SQL · Shared budget|Tie order", "SQL Premium", "LeetCode Premium", 0],
  [2474, "customers-with-strictly-increasing-purchases", "Customers With Strictly Increasing Purchases", 2, "SQL · Islands|LAG flag", "SQL Premium", "LeetCode Premium", 0],
  [2292, "products-with-three-or-more-orders-in-two-consecutive-years", "Products With Three or More Orders in Two Consecutive Years", 1, "SQL · Year pairs|HAVING", "SQL Premium", "LeetCode Premium", 0],
  [2669, "count-artist-occurrences-on-spotify-ranking-list", "Count Artist Occurrences on Spotify Ranking List", 0, "SQL · Two-hop join|COUNT", "SQL Premium", "LeetCode Premium", 0],
];
