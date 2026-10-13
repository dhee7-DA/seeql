// Registry rows — the "SQL 50+" extras: famous LeetCode database problems
// beyond the official study plan (consecutive runs, window classics, date
// reporting, pivots, relational division and the two hard rite-of-passage
// cases), plus the FINAL GAP batch: every remaining free Database problem
// (the last free evergreens + the 2025 wave), which completes the free SQL
// catalog end to end. Same sandbox treatment as the SQL 50: each runs in
// the in-app SQLite grading sandbox. Tagged with the "SQL Extras" list.

import type { LcRow } from "./row";

export const SQL_EXTRAS: LcRow[] = [
  // WINDOWS & CONSECUTIVE RUNS
  [180, "consecutive-numbers", "Consecutive Numbers", 1, "SQL · Windows|Self-join", "SQL Extras", "Amazon|Google|Microsoft"],
  [1204, "last-person-to-fit-in-the-bus", "Last Person to Fit in the Bus", 1, "SQL · Windows|Running sum", "SQL Extras", "Amazon|Uber|Adobe"],
  [1454, "active-users", "Active Users", 1, "SQL · Windows|Date math", "SQL Extras", "Amazon|Meta|Google"],
  [1321, "restaurant-growth", "Restaurant Growth", 1, "SQL · Windows|Moving average", "SQL Extras", "Amazon|Deloitte|eBay"],

  // DATES & REPORTING
  [1141, "user-activity-for-the-past-30-days-i", "User Activity for the Past 30 Days I", 0, "SQL · Date filter|Aggregation", "SQL Extras", "Amazon|eBay|Optum"],
  [1142, "user-activity-for-the-past-30-days-ii", "User Activity for the Past 30 Days II", 0, "SQL · Date filter|Aggregation", "SQL Extras", "Amazon|Optum|eBay"],
  [1113, "reported-posts", "Reported Posts", 0, "SQL · Aggregation|Filtering", "SQL Extras", "Amazon|Optum|IBM"],
  [1132, "reported-posts-ii", "Reported Posts II", 1, "SQL · Aggregation|Joins", "SQL Extras", "Amazon|Optum|Meta"],
  [1193, "monthly-transactions-i", "Monthly Transactions I", 1, "SQL · Date math|Conditional aggregation", "SQL Extras", "Uber|Amazon|Google"],
  [1890, "the-latest-login-in-2020", "The Latest Login in 2020", 0, "SQL · Date math|MAX", "SQL Extras", "Amazon|Intuit|Apple"],

  // PIVOTS & TEXT
  [1179, "reformat-department-table", "Reformat Department Table", 0, "SQL · Pivot|CASE WHEN", "SQL Extras", "Amazon|Oracle|Google"],
  [1517, "find-users-with-valid-e-mails", "Find Users With Valid E-Mails", 0, "SQL · Text|Pattern matching", "SQL Extras", "Amazon|NetSuite|Google"],
  [1683, "invalid-tweets", "Invalid Tweets", 0, "SQL · Text|LENGTH", "SQL Extras", "Amazon|Google|IBM"],
  [1907, "count-salary-categories", "Count Salary Categories", 1, "SQL · Zero-fill|UNION", "SQL Extras", "Amazon|JPMorgan|Google"],

  // JOINS & RECONCILIATION
  [511, "game-play-analysis-i", "Game Play Analysis I", 0, "SQL · Aggregation|GROUP BY", "SQL Extras", "Amazon|Apple|Uber"],
  [534, "game-play-analysis-iii", "Game Play Analysis III", 1, "SQL · Windows|Running sum", "SQL Extras", "Amazon|Uber|Meta"],
  [1587, "bank-account-summary-ii", "Bank Account Summary II", 0, "SQL · Aggregation|HAVING", "SQL Extras", "Amazon|JPMorgan|PayPal"],
  [1965, "employees-with-missing-information", "Employees With Missing Information", 0, "SQL · Anti-join|FULL outer by hand", "SQL Extras", "Amazon|Google|Deloitte"],
  [1398, "customers-who-bought-all-products", "Customers Who Bought All Products", 1, "SQL · Relational division|GROUP BY", "SQL Extras", "Amazon|Alibaba|Google"],
  [1212, "team-scores-in-football-tournament", "Team Scores in Football Tournament", 1, "SQL · Joins|CASE WHEN", "SQL Extras", "Amazon|Uber|Bloomberg"],

  // HARD — the rite-of-passage cases
  [262, "trips-and-users", "Trips and Users", 2, "SQL · Joins|Conditional aggregation", "SQL Extras", "Uber|Amazon|Bloomberg"],
  [601, "human-traffic-of-stadium", "Human Traffic of Stadium", 2, "SQL · Consecutive runs|Self-join", "SQL Extras", "Amazon|Google|TikTok"],

  // FINAL GAP — the last free evergreens (completes every free classic)
  [177, "nth-highest-salary", "Nth Highest Salary", 1, "SQL · Subqueries|LIMIT/OFFSET", "SQL Extras", "Amazon|Google|Bloomberg"],
  [197, "rising-temperature", "Rising Temperature", 0, "SQL · Self-join|Date math", "SQL Extras", "Amazon|Google|Adobe"],
  [584, "find-customer-referee", "Find Customer Referee", 0, "SQL · Filtering|NULL handling", "SQL Extras", "Amazon|Google|Deloitte"],
  [586, "customer-placing-the-largest-number-of-orders", "Customer Placing the Largest Number of Orders", 0, "SQL · Subqueries|Aggregation", "SQL Extras", "Amazon|Google|Adobe"],
  [602, "friend-requests-ii-who-has-the-most-friends", "Friend Requests II: Who Has the Most Friends", 1, "SQL · UNION ALL|Aggregation", "SQL Extras", "Amazon|Meta|Google"],
  [608, "tree-node", "Tree Node", 1, "SQL · CASE WHEN|Subqueries", "SQL Extras", "Amazon|Google|Bloomberg"],
  [619, "biggest-single-number", "Biggest Single Number", 0, "SQL · Aggregation|NULL handling", "SQL Extras", "Amazon|Google|Adobe"],
  [1050, "actors-and-directors-who-cooperated-at-least-three-times", "Actors and Directors Who Cooperated At Least Three Times", 0, "SQL · Aggregation|GROUP BY", "SQL Extras", "Amazon|Netflix|Google"],
  [1164, "product-price-at-a-given-date", "Product Price at a Given Date", 1, "SQL · Windows|As-of join", "SQL Extras", "Amazon|Google|Adobe"],

  // THE 2025 WAVE — free problems added to the Database category (text & patterns)
  [3436, "find-valid-emails", "Find Valid Emails", 0, "SQL · Text|Pattern matching", "SQL Extras", "Amazon|Google|Optum"],
  [3451, "find-invalid-ip-addresses", "Find Invalid IP Addresses", 2, "SQL · Text|Pattern matching", "SQL Extras", "Amazon|Google|Cloudflare"],
  [3465, "find-products-with-valid-serial-numbers", "Find Products With Valid Serial Numbers", 0, "SQL · Text|Pattern matching", "SQL Extras", "Amazon|eBay|Google"],
  [3475, "dna-pattern-recognition", "DNA Pattern Recognition", 1, "SQL · Text|Pattern matching", "SQL Extras", "Amazon|Illumina|Google"],
  [3374, "first-letter-capitalization-ii", "First Letter Capitalization II", 2, "SQL · Text|String functions", "SQL Extras", "Amazon|Google|Optum"],
  [3793, "find-users-with-high-token-usage", "Find Users with High Token Usage", 0, "SQL · Aggregation|Filtering", "SQL Extras", "Amazon|OpenAI|Google"],

  // THE 2025 WAVE — org, education & growth
  [3482, "analyze-organization-hierarchy", "Analyze Organization Hierarchy", 2, "SQL · Recursion|Aggregation", "SQL Extras", "Amazon|Google|Microsoft"],
  [3421, "find-students-who-improved", "Find Students Who Improved", 1, "SQL · Self-join|Aggregation", "SQL Extras", "Amazon|Google|Chegg"],
  [3580, "find-consistently-improving-employees", "Find Consistently Improving Employees", 1, "SQL · Windows|Correlated subqueries", "SQL Extras", "Amazon|Google|Adobe"],
  [3611, "find-overbooked-employees", "Find Overbooked Employees", 1, "SQL · Windows|Intervals", "SQL Extras", "Amazon|Google|Uber"],
  [3617, "find-students-with-study-spiral-pattern", "Find Students with Study Spiral Pattern", 2, "SQL · Windows|Gaps and islands", "SQL Extras", "Amazon|Google|Meta"],
  [3586, "find-covid-recovery-patients", "Find COVID Recovery Patients", 1, "SQL · Windows|Date math", "SQL Extras", "Amazon|Optum|Google"],

  // THE 2025 WAVE — commerce & inventory
  [3521, "find-product-recommendation-pairs", "Find Product Recommendation Pairs", 1, "SQL · Self-join|Aggregation", "SQL Extras", "Amazon|Alibaba|Google"],
  [3564, "seasonal-sales-analysis", "Seasonal Sales Analysis", 1, "SQL · Date math|Aggregation", "SQL Extras", "Amazon|Walmart|Google"],
  [3570, "find-books-with-no-available-copies", "Find Books with No Available Copies", 0, "SQL · Anti-join|Aggregation", "SQL Extras", "Amazon|Google|Audible"],
  [3626, "find-stores-with-inventory-imbalance", "Find Stores with Inventory Imbalance", 1, "SQL · Aggregation|Joins", "SQL Extras", "Amazon|Walmart|Target"],
  [3642, "find-books-with-polarized-opinions", "Find Books with Polarized Opinions", 1, "SQL · Aggregation|CASE WHEN", "SQL Extras", "Amazon|Goodreads|Google"],
  [3657, "find-loyal-customers", "Find Loyal Customers", 1, "SQL · Gaps and islands|Aggregation", "SQL Extras", "Amazon|Starbucks|Google"],

  // THE 2025 WAVE — behavior & retention analytics
  [3220, "odd-and-even-transactions", "Odd and Even Transactions", 1, "SQL · Aggregation|CASE WHEN", "SQL Extras", "Amazon|Stripe|Google"],
  [3497, "analyze-subscription-conversion", "Analyze Subscription Conversion", 1, "SQL · Date math|Joins", "SQL Extras", "Amazon|Netflix|Spotify"],
  [3601, "find-drivers-with-improved-fuel-efficiency", "Find Drivers with Improved Fuel Efficiency", 1, "SQL · Windows|Aggregation", "SQL Extras", "Uber|Lyft|Amazon"],
  [3705, "find-golden-hour-customers", "Find Golden Hour Customers", 1, "SQL · Date math|Aggregation", "SQL Extras", "Amazon|DoorDash|Uber"],
  [3716, "find-churn-risk-customers", "Find Churn Risk Customers", 1, "SQL · Anti-join|Date math", "SQL Extras", "Amazon|Spotify|Netflix"],

  // THE 2025 WAVE — pairs & the new hard tier
  [3554, "find-category-recommendation-pairs", "Find Category Recommendation Pairs", 2, "SQL · Self-join|Aggregation", "SQL Extras", "Amazon|Google|Meta"],
  [3673, "find-zombie-sessions", "Find Zombie Sessions", 2, "SQL · Windows|Intervals", "SQL Extras", "Amazon|Cloudflare|Google"],
  [3764, "most-common-course-pairs", "Most Common Course Pairs", 2, "SQL · Self-join|Aggregation", "SQL Extras", "Amazon|Coursera|Google"],
  [3808, "find-emotionally-consistent-users", "Find Emotionally Consistent Users", 1, "SQL · Windows|Aggregation", "SQL Extras", "Amazon|Meta|Google"],
  [3832, "find-users-with-persistent-behavior-patterns", "Find Users with Persistent Behavior Patterns", 2, "SQL · Windows|Gaps and islands", "SQL Extras", "Amazon|Google|Meta"],
];
