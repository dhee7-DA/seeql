// Registry rows — the SQL band, batch 10: the FINAL 25 free Database
// problems (LC ids 177-3611) that complete the by-ID live reconciliation.
// Re-authored with original schemas/seeds/statements. 7-tuple free format
// (same as registry-sql-more.ts); list "SQL 50+" flags them into the
// sandbox-graded SQL band. The 3xxx ids are LeetCode's new-gen problems —
// tagged "LeetCode" as the company facet.
import type { LcRow } from "./row";

export const SQL_FINAL_FREE: LcRow[] = [
  // FREE CLASSICS — the canonical traps: NULL referees, consecutive runs, OR gates
  [177, "nth-highest-salary", "Nth Highest Salary", 1, "SQL · OFFSET|DENSE_RANK", "SQL 50+", "LeetCode|Microsoft"],
  [180, "consecutive-numbers", "Consecutive Numbers", 1, "SQL · LAG|Consecutive runs", "SQL 50+", "LeetCode"],
  [197, "rising-temperature", "Rising Temperature", 0, "SQL · Day-1 join|LAG", "SQL 50+", "LeetCode|Microsoft"],
  [584, "find-customer-referee", "Find Customer Referee", 0, "SQL · NULL-safe filter|IS NULL", "SQL 50+", "LeetCode"],
  [595, "big-countries", "Big Countries", 0, "SQL · OR gate|Thresholds", "SQL 50+", "LeetCode"],
  // FREE WINDOWS & GROWTH — stadium islands, division, rolling cafes, gains
  [601, "human-traffic-of-stadium", "Human Traffic of Stadium", 2, "SQL · Islands|Run >= 3", "SQL 50+", "LeetCode"],
  [1045, "customers-who-bought-all-products", "Customers Who Bought All Products", 1, "SQL · Relational division|COUNT DISTINCT", "SQL 50+", "LeetCode"],
  [1321, "restaurant-growth", "Restaurant Growth", 1, "SQL · 7-day frame|ROUND", "SQL 50+", "LeetCode"],
  [3421, "find-students-who-improved", "Find Students Who Improved", 1, "SQL · Attempt pivot|Strict gain", "SQL 50+", "LeetCode"],
  [3580, "find-consistently-improving-employees", "Find Consistently Improving Employees", 1, "SQL · LAG flag|All-up gate", "SQL 50+", "LeetCode"],
  // FREE FORMAT VALIDATION — capitalizers, emails, IPs, serials, DNA
  [3374, "first-letter-capitalization-ii", "First Letter Capitalization II", 2, "SQL · Recursive transform|Stop-words", "SQL 50+", "LeetCode"],
  [3436, "find-valid-emails", "Find Valid Emails", 0, "SQL · GLOB guards|INSTR arms", "SQL 50+", "LeetCode"],
  [3451, "find-invalid-ip-addresses", "Find Invalid IP Addresses", 2, "SQL · Octet splitter|Leading zeros", "SQL 50+", "LeetCode"],
  [3465, "find-products-with-valid-serial-numbers", "Find Products With Valid Serial Numbers", 0, "SQL · GLOB whole-string|Classes", "SQL 50+", "LeetCode"],
  [3475, "dna-pattern-recognition", "DNA Pattern Recognition", 1, "SQL · REPLACE counting|Two literals", "SQL 50+", "LeetCode"],
  // FREE ORG & RECOVERY — recursive subtrees, conversions, overlaps, recoveries
  [3482, "analyze-organization-hierarchy", "Analyze Organization Hierarchy", 2, "SQL · WITH RECURSIVE|Subtree totals", "SQL 50+", "LeetCode"],
  [3497, "analyze-subscription-conversion", "Analyze Subscription Conversion", 1, "SQL · LEFT JOIN NULL arm|julianday delta", "SQL 50+", "LeetCode"],
  [3611, "find-overbooked-employees", "Find Overbooked Employees", 1, "SQL · Strict intervals|Touch rule", "SQL 50+", "LeetCode"],
  [3586, "find-covid-recovery-patients", "Find Covid Recovery Patients", 1, "SQL · After-filter|First-event joins", "SQL 50+", "LeetCode"],
  [3570, "find-books-with-no-available-copies", "Find Books With No Available Copies", 0, "SQL · Conditional COUNT|Returned filter", "SQL 50+", "LeetCode"],
  // FREE PAIRS & SEASONS — co-purchase affinities, buckets, parities, firsts
  [3521, "find-product-recommendation-pairs", "Find Product Recommendation Pairs", 1, "SQL · Pair canonicalization|Basket DISTINCT", "SQL 50+", "LeetCode"],
  [3554, "find-category-recommendation-pairs", "Find Category Recommendation Pairs", 2, "SQL · Both orientations|Affinity gate", "SQL 50+", "LeetCode"],
  [3564, "seasonal-sales-analysis", "Seasonal Sales Analysis", 1, "SQL · Month CASE|Year wrap", "SQL 50+", "LeetCode"],
  [3220, "odd-and-even-transactions", "Odd and Even Transactions", 1, "SQL · Id parity buckets|CASE", "SQL 50+", "LeetCode"],
  [3601, "find-drivers-with-improved-fuel-efficiency", "Find Drivers With Improved Fuel Efficiency", 1, "SQL · First vs latest|log_id order", "SQL 50+", "LeetCode"],
];
