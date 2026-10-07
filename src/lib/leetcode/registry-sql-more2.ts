// Registry rows — the SQL band, batch 3 ("beyond 100"): more free LeetCode
// Database problems plus a second tier of platform classics (HackerRank and
// DataLemur-flavored, re-authored; custom 95xx+ numbers, not LC ids).
// Same tuple format as registry-sql50.ts; lists "SQL 50+" flags them into the
// sandbox-graded SQL band.
import type { LcRow } from "./row";

export const SQL_MORE2: LcRow[] = [
  // WINDOWS II — window aggregates, rank-based argmin, as-of pricing, streaks
  [1303, "find-the-team-size", "Find the Team Size", 0, "SQL · Windows|COUNT OVER", "SQL 50+", "Amazon|Google|Optum"],
  [1077, "project-employees-iii", "Project Employees III", 1, "SQL · Windows|Joins", "SQL 50+", "Amazon|Oracle|Bloomberg"],
  [1164, "product-price-at-a-given-date", "Product Price at a Given Date", 1, "SQL · Windows|Date logic", "SQL 50+", "Amazon|Google|Uber"],
  [1454, "active-users", "Active Users", 1, "SQL · Windows|Streaks", "SQL 50+", "Meta|Google|Amazon"],
  // SELF & NON-EQUI JOINS — same-table roles, inequality predicates
  [608, "tree-node", "Tree Node", 1, "SQL · Self-join|CASE WHEN", "SQL 50+", "Amazon|Google|eBay"],
  [603, "consecutive-available-seats", "Consecutive Available Seats", 1, "SQL · Self-join|Window", "SQL 50+", "Amazon|Booking|Google"],
  [1459, "rectangle-area", "Rectangle Area", 1, "SQL · Non-equi join", "SQL 50+", "Google|eBay|Meta"],
  [1241, "number-of-comments-per-post", "Number of Comments Per Post", 0, "SQL · Self-join|Aggregation", "SQL 50+", "Meta|Reddit"],
  // ANALYTICS & FUNNELS — product-flavored reporting asks
  [1142, "user-activity-for-the-past-30-days-ii", "User Activity for the Past 30 Days II", 0, "SQL · Aggregation|Date filter", "SQL 50+", "Meta|Google"],
  [1398, "customers-who-bought-a-and-b-not-c", "Customers Who Bought A and B but Not C", 1, "SQL · Conditional aggregation", "SQL 50+", "Amazon|Walmart"],
  [1435, "create-a-session-bar-chart", "Create a Session Bar Chart", 0, "SQL · Buckets|UNION", "SQL 50+", "Adobe|Google"],
  [1204, "last-person-to-fit-in-the-elevator", "Last Person to Fit in the Elevator", 1, "SQL · Running sum|Windows", "SQL 50+", "Amazon|DoorDash"],
  [1607, "sellers-with-no-sales", "Sellers With No Sales", 1, "SQL · Anti-join|Date filter", "SQL 50+", "Amazon|eBay"],
  // HACKERRANK CLASSICS II — the next tier of the famous bank (re-authored)
  [9506, "type-of-triangle", "Type of Triangle", 0, "SQL · CASE WHEN", "SQL 50+", "HackerRank classic"],
  [9507, "the-blunder", "The Blunder", 1, "SQL · REPLACE|Aggregation", "SQL 50+", "HackerRank classic"],
  [9508, "station-shortest-longest", "Shortest & Longest City Names", 1, "SQL · ORDER BY LENGTH|LIMIT", "SQL 50+", "HackerRank classic"],
  [9509, "asian-population", "Asian Population", 0, "SQL · Joins|Aggregation", "SQL 50+", "HackerRank classic"],
  [9510, "challenges", "Challenges", 1, "SQL · Aggregation|Exclusion logic", "SQL 50+", "HackerRank classic"],
  [9511, "occupations-pivot", "Occupations Pivot", 1, "SQL · ROW_NUMBER pivot", "SQL 50+", "HackerRank classic"],
  // DATALEMUR INTERVIEW SETS — real interview questions, re-authored
  [9512, "uber-first-transaction", "First Transaction", 1, "SQL · Windows|Aggregation", "SQL 50+", "DataLemur classic"],
  [9513, "linkedin-power-creators", "Power Creators", 1, "SQL · Self-join|Dates", "SQL 50+", "DataLemur classic"],
  [9514, "compressed-mode", "Compressed Mode", 1, "SQL · Windows|Mode", "SQL 50+", "DataLemur classic"],
];
