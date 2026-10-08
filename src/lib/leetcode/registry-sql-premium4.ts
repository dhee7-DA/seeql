// Registry rows — the SQL band, batch 8: LeetCode PREMIUM tier IV (35
// problems, LC ids 2686-3059 — the third tranche of the remaining premium
// long-tail per Task 66-a's by-ID live reconciliation). Re-authored with
// original schemas/seeds/statements. `free: 0` flags them with the amber
// "premium" badge; the "SQL Premium" list keeps the /^SQL/ band flag. Same
// tuple format as registry-sql-premium3.ts.
import type { LcRow } from "./row";

export const SQL_PREMIUM4: LcRow[] = [
  // PREMIUM DELIVERY & FLOW — same-day ratios, last-use argmax, window-bound actives
  [2686, "immediate-food-delivery-iii", "Immediate Food Delivery III", 1, "SQL · Monthly ratio|ROUND", "SQL Premium", "LeetCode Premium", 0],
  [2687, "bikes-last-time-used", "Bikes Last Time Used", 0, "SQL · MAX per group|Time vs id", "SQL Premium", "LeetCode Premium", 0],
  [2688, "find-active-users", "Find Active Users", 1, "SQL · Window filter|DISTINCT days", "SQL Premium", "LeetCode Premium", 0],
  [2738, "count-occurrences-in-text", "Count Occurrences in Text", 1, "SQL · Whole-word match|LIKE", "SQL Premium", "LeetCode Premium", 0],
  [2837, "total-traveled-distance", "Total Traveled Distance", 0, "SQL · Conditional SUM|COALESCE", "SQL Premium", "LeetCode Premium", 0],
  [2893, "calculate-orders-within-each-interval", "Calculate Orders Within Each Interval", 1, "SQL · CASE buckets|Rank order", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM MONEY & MARKET — gaps, calendar rolling windows, anti-joins, tiers
  [2853, "highest-salaries-difference", "Highest Salaries Difference", 0, "SQL · Distinct top-2|NULL gap", "SQL Premium", "LeetCode Premium", 0],
  [2854, "rolling-average-steps", "Rolling Average Steps", 1, "SQL · RANGE frame|Calendar days", "SQL Premium", "LeetCode Premium", 0],
  [2922, "market-analysis-iii", "Market Analysis III", 1, "SQL · Year anti-join|NOT EXISTS", "SQL Premium", "LeetCode Premium", 0],
  [2987, "find-expensive-cities", "Find Expensive Cities", 0, "SQL · Group vs global avg|Strict >", "SQL Premium", "LeetCode Premium", 0],
  [2989, "class-performance", "Class Performance", 1, "SQL · Window avg|Below-average filter", "SQL Premium", "LeetCode Premium", 0],
  [2990, "loan-types", "Loan Types", 0, "SQL · CASE classify|COUNT DISTINCT", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM CONSECUTIVE ENGINES — rising runs, two-hop graphs, day islands, capacity floors
  [2701, "consecutive-transactions-with-increasing-amounts", "Consecutive Transactions with Increasing Amounts", 2, "SQL · LAG flag|Islands run", "SQL Premium", "LeetCode Premium", 0],
  [2720, "popularity-percentage", "Popularity Percentage", 2, "SQL · Two-hop graph|Anti-join", "SQL Premium", "LeetCode Premium", 0],
  [2752, "customers-with-maximum-number-of-transactions-on-consecutive-days", "Customers With Maximum Number of Transactions on Consecutive Days", 2, "SQL · Date islands|Global argmax", "SQL Premium", "LeetCode Premium", 0],
  [3052, "maximize-items", "Maximize Items", 2, "SQL · Floor division|Cross-type argmax", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM CITY & SHAPES — peak hours, mirrors, occupancy, tree roles
  [2984, "find-peak-calling-hours-for-each-city", "Find Peak Calling Hours for Each City", 1, "SQL · Hour argmax|Tie rule", "SQL Premium", "LeetCode Premium", 0],
  [2978, "symmetric-coordinates", "Symmetric Coordinates", 1, "SQL · Mirror pairs|DISTINCT join", "SQL Premium", "LeetCode Premium", 0],
  [2783, "flight-occupancy-and-waitlist-analysis", "Flight Occupancy and Waitlist Analysis", 1, "SQL · Capacity status|Zero-floor", "SQL Premium", "LeetCode Premium", 0],
  [3053, "classifying-triangles-by-lengths", "Classifying Triangles by Lengths", 0, "SQL · CASE order|Equality classes", "SQL Premium", "LeetCode Premium", 0],
  [3054, "binary-tree-nodes", "Binary Tree Nodes", 1, "SQL · Root/leaf/inner|EXISTS", "SQL Premium", "LeetCode Premium", 0],
  [3056, "snaps-analysis", "Snaps Analysis", 1, "SQL · Conditional COUNT DISTINCT|Buckets", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM BOARDS & PERCENTILES — argmax boards, RANK top-2, PERCENT_RANK gates
  [2988, "manager-of-the-largest-department", "Manager of the Largest Department", 1, "SQL · Group argmax|Empty groups", "SQL Premium", "LeetCode Premium", 0],
  [2985, "calculate-compressed-mean", "Calculate Compressed Mean", 0, "SQL · Weighted mean|1.0 promotion", "SQL Premium", "LeetCode Premium", 0],
  [2986, "find-third-transaction", "Find Third Transaction", 1, "SQL · ROW_NUMBER = 3|Absent users", "SQL Premium", "LeetCode Premium", 0],
  [2991, "top-three-wineries", "Top Three Wineries", 2, "SQL · RANK top-2|Ties included", "SQL Premium", "LeetCode Premium", 0],
  [3055, "top-percentile-fraud", "Top Percentile Fraud", 1, "SQL · PERCENT_RANK|Partition gate", "SQL Premium", "LeetCode Premium", 0],
  [3057, "employees-project-allocation", "Employees Project Allocation", 2, "SQL · Composite argmax|Alphabetical tie", "SQL Premium", "LeetCode Premium", 0],
  [3051, "find-candidates-for-data-scientist-position", "Find Candidates for Data Scientist Position", 0, "SQL · Multi-skill gate|EXISTS", "SQL Premium", "LeetCode Premium", 0],
  // PREMIUM SOCIAL & WEEKLY — Friday pivots, share-of-day windows, streamer turns
  [2993, "friday-purchases-i", "Friday Purchases I", 1, "SQL · Weekday filter|Day buckets", "SQL Premium", "LeetCode Premium", 0],
  [2994, "friday-purchases-ii", "Friday Purchases II", 2, "SQL · Share of partition|ROUND", "SQL Premium", "LeetCode Premium", 0],
  [2995, "viewers-turned-streamers", "Viewers Turned Streamers", 2, "SQL · First-event gate|Strict after", "SQL Premium", "LeetCode Premium", 0],
  [3050, "pizza-toppings-cost-analysis", "Pizza Toppings Cost Analysis", 1, "SQL · TEXT cast|Above-average gate", "SQL Premium", "LeetCode Premium", 0],
  [3058, "friends-with-no-mutual-friends", "Friends With No Mutual Friends", 1, "SQL · Mutual anti-join|Undirected edges", "SQL Premium", "LeetCode Premium", 0],
  [3059, "find-all-unique-email-domains", "Find All Unique Email Domains", 0, "SQL · SUBSTR INSTR|Domain tally", "SQL Premium", "LeetCode Premium", 0],
];
