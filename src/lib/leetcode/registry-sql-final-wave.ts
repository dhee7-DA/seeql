// Registry rows — the FINAL WAVE: the last 12 free Database problems the
// app had not yet wired (the final gap batch's survivors — every other row
// of the old orphan SQL_EXTRAS file was a shadow duplicate of an already-
// live problem and was deleted with it). Same sandbox treatment as the SQL
// 50: each runs in the in-app SQLite grading sandbox.

import type { LcRow } from "./row";

export const SQL_FINAL_WAVE: LcRow[] = [
  [3793, "find-users-with-high-token-usage", "Find Users with High Token Usage", 0, "SQL · Aggregation|Filtering", "SQL Extras", "Amazon|OpenAI|Google"],
  [3705, "find-golden-hour-customers", "Find Golden Hour Customers", 1, "SQL · Date math|Aggregation", "SQL Extras", "Amazon|DoorDash|Uber"],
  [3716, "find-churn-risk-customers", "Find Churn Risk Customers", 1, "SQL · Anti-join|Date math", "SQL Extras", "Amazon|Spotify|Netflix"],
  [3657, "find-loyal-customers", "Find Loyal Customers", 1, "SQL · Gaps and islands|Aggregation", "SQL Extras", "Amazon|Starbucks|Google"],
  [3808, "find-emotionally-consistent-users", "Find Emotionally Consistent Users", 1, "SQL · Windows|Aggregation", "SQL Extras", "Amazon|Meta|Google"],
  [3832, "find-users-with-persistent-behavior-patterns", "Find Users with Persistent Behavior Patterns", 2, "SQL · Windows|Gaps and islands", "SQL Extras", "Amazon|Google|Meta"],
  [1204, "last-person-to-fit-in-the-bus", "Last Person to Fit in the Bus", 1, "SQL · Windows|Running sum", "SQL Extras", "Amazon|Uber|Adobe"],
  [3626, "find-stores-with-inventory-imbalance", "Find Stores with Inventory Imbalance", 1, "SQL · Aggregation|Joins", "SQL Extras", "Amazon|Walmart|Target"],
  [3642, "find-books-with-polarized-opinions", "Find Books with Polarized Opinions", 1, "SQL · Aggregation|CASE WHEN", "SQL Extras", "Amazon|Goodreads|Google"],
  [3673, "find-zombie-sessions", "Find Zombie Sessions", 2, "SQL · Windows|Intervals", "SQL Extras", "Amazon|Cloudflare|Google"],
  [3764, "most-common-course-pairs", "Most Common Course Pairs", 2, "SQL · Self-join|Aggregation", "SQL Extras", "Amazon|Coursera|Google"],
  [3617, "find-students-with-study-spiral-pattern", "Find Students with Study Spiral Pattern", 2, "SQL · Windows|Gaps and islands", "SQL Extras", "Amazon|Google|Meta"],
];
