// Registry rows — the SQL band, batch 6: LeetCode PREMIUM tier II (35
// problems, LC ids 512-1917 — the first tranche of the remaining premium
// long-tail per Task 66-a's live reconciliation). Re-authored with original
// schemas/seeds/statements. `free: 0` flags them with the amber "premium"
// badge; the "SQL Premium" list keeps the /^SQL/ band flag. Same tuple
// format as registry-sql-premium.ts.
import type { LcRow } from "./row";

export const SQL_PREMIUM2: LcRow[] = [
  // PREMIUM GAME ANALYSIS — first-login join-backs, running sums, vote count-outs
  [512, "game-play-analysis-ii", "Game Play Analysis II", 0, "SQL · Join-back|Window", "SQL Premium", "LeetCode Premium", 0],
  [534, "game-play-analysis-iii", "Game Play Analysis III", 1, "SQL · Running sum|Windows", "SQL Premium", "LeetCode Premium", 0],
  [574, "winning-candidate", "Winning Candidate", 1, "SQL · Aggregation|Argmax", "SQL Premium", "LeetCode Premium", 0],
  [579, "find-cumulative-salary-of-an-employee", "Find Cumulative Salary of an Employee", 2, "SQL · Window frame|Self-exclusion", "SQL Premium", "LeetCode Premium", 0],
  [580, "count-student-number-in-departments", "Count Student Number in Departments", 1, "SQL · LEFT JOIN|COUNT", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM DISTANCES & RANKINGS — oriented self-joins, semijoins, points streaks
  [612, "shortest-distance-in-a-plane", "Shortest Distance in a Plane", 1, "SQL · Self-join|Distance", "SQL Premium", "LeetCode Premium", 0],
  [613, "shortest-distance-in-a-line", "Shortest Distance in a Line", 0, "SQL · Self-join|ABS", "SQL Premium", "LeetCode Premium", 0],
  [614, "second-degree-follower", "Second Degree Follower", 1, "SQL · EXISTS|Graph", "SQL Premium", "LeetCode Premium", 0],
  [1107, "new-users-daily-count", "New Users Daily Count", 1, "SQL · First occurrence|CTE", "SQL Premium", "LeetCode Premium", 0],
  [1194, "tournament-winners", "Tournament Winners", 2, "SQL · UNION ALL|Argmax", "SQL Premium", "LeetCode Premium", 0],
  [1285, "find-the-start-and-end-number-of-continuous-ranges", "Find the Start and End Number of Continuous Ranges", 1, "SQL · Gaps & islands|ROW_NUMBER", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM MARKET ANALYTICS — brand mismatches, page recs, boolean evaluators
  [1159, "market-analysis-ii", "Market Analysis II", 2, "SQL · Brand mismatch|Multi-join", "SQL Premium", "LeetCode Premium", 0],
  [1264, "page-recommendations", "Page Recommendations", 1, "SQL · Anti-join|Graph", "SQL Premium", "LeetCode Premium", 0],
  [1308, "running-total-for-different-genders", "Running Total for Different Genders", 1, "SQL · Running total|Windows", "SQL Premium", "LeetCode Premium", 0],
  [1350, "students-with-invalid-departments", "Students With Invalid Departments", 0, "SQL · Anti-join|NOT EXISTS", "SQL Premium", "LeetCode Premium", 0],
  [1364, "number-of-trusted-contacts-of-a-customer", "Number of Trusted Contacts of a Customer", 1, "SQL · Triple join|Aggregation", "SQL Premium", "LeetCode Premium", 0],
  [1440, "evaluate-boolean-expression", "Evaluate Boolean Expression", 1, "SQL · CASE WHEN|Multi-join", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM ORDERS & INVENTORY — tax brackets, argmax recency, missing-id grids
  [1468, "calculate-salaries", "Calculate Salaries", 1, "SQL · Window MAX|CASE WHEN", "SQL Premium", "LeetCode Premium", 0],
  [1549, "the-most-recent-orders-for-each-product", "The Most Recent Orders for Each Product", 1, "SQL · Argmax|Date filter", "SQL Premium", "LeetCode Premium", 0],
  [1571, "warehouse-manager", "Warehouse Manager", 0, "SQL · Join aggregate|Volume", "SQL Premium", "LeetCode Premium", 0],
  [1613, "find-the-missing-ids", "Find the Missing IDs", 1, "SQL · WITH RECURSIVE|Anti-join", "SQL Premium", "LeetCode Premium", 0],
  [1715, "count-apples-and-oranges", "Count Apples and Oranges", 1, "SQL · UNION ALL|Double-count trap", "SQL Premium", "LeetCode Premium", 0],
  [1777, "products-price-for-each-store", "Products Price for Each Store", 0, "SQL · Unpivot|NULL handling", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM HOPPER & CHAMPIONS — cohort rules, medal unpivots, islands
  [1635, "hopper-company-queries-i", "Hopper Company Queries I", 2, "SQL · Monthly spine|Cohort rule", "SQL Premium", "LeetCode Premium", 0],
  [1645, "hopper-company-queries-ii", "Hopper Company Queries II", 2, "SQL · Ratio|DISTINCT", "SQL Premium", "LeetCode Premium", 0],
  [1651, "hopper-company-queries-iii", "Hopper Company Queries III", 2, "SQL · Date bucketing|AVG", "SQL Premium", "LeetCode Premium", 0],
  [1767, "find-the-subtasks-that-did-not-execute", "Find the Subtasks That Did Not Execute", 2, "SQL · WITH RECURSIVE|Anti-join", "SQL Premium", "LeetCode Premium", 0],
  [1783, "grand-slam-titles", "Grand Slam Titles", 1, "SQL · Unpivot|Aggregation", "SQL Premium", "LeetCode Premium", 0],
  [1811, "find-interview-candidates", "Find Interview Candidates", 1, "SQL · Islands|Multi-condition", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM USERS & DATES — interval anti-joins, ordinal dates, song graphs
  [1809, "ad-free-sessions", "Ad-Free Sessions", 0, "SQL · NOT EXISTS|Interval", "SQL Premium", "LeetCode Premium", 0],
  [1821, "find-customers-with-positive-revenue-this-year", "Find Customers With Positive Revenue this Year", 0, "SQL · HAVING|Aggregation", "SQL Premium", "LeetCode Premium", 0],
  [1853, "convert-date-format", "Convert Date Format", 0, "SQL · Date formatting|CASE WHEN", "SQL Premium", "LeetCode Premium", 0],
  [1867, "orders-with-maximum-quantity-above-average", "Orders With Maximum Quantity Above Average", 1, "SQL · Window AVG|Global bar", "SQL Premium", "LeetCode Premium", 0],
  [1875, "group-employees-of-the-same-salary", "Group Employees of the Same Salary", 1, "SQL · DENSE_RANK|Partition gate", "SQL Premium", "LeetCode Premium", 0],
  [1917, "leetcodify-friends-recommendations", "Leetcodify Friends Recommendations", 2, "SQL · Self-join|Graph", "SQL Premium", "LeetCode Premium", 0],
];
