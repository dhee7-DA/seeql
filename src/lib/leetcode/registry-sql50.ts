// Registry rows — the SQL 50 study list. These run in the in-app SQL
// sandbox (phase 2); for now they carry the same metadata as the rest.
import type { LcRow } from "./row";

export const SQL50: LcRow[] = [
  // SELECT
  [1378, "replace-employee-id-with-unique-identifier", "Replace Employee ID With The Unique Identifier", 0, "SQL · SELECT", "SQL 50", "Amazon|Google|Deloitte"],
  [1068, "product-sales-analysis-i", "Product Sales Analysis I", 0, "SQL · SELECT", "SQL 50", "Amazon|eBay|Capital One"],
  [1069, "product-sales-analysis-ii", "Product Sales Analysis II", 0, "SQL · Aggregation", "SQL 50", "Amazon|eBay|Capital One"],
  [1070, "product-sales-analysis-iii", "Product Sales Analysis III", 1, "SQL · Aggregation", "SQL 50", "Amazon|eBay|Capital One"],
  [577, "employee-bonus", "Employee Bonus", 0, "SQL · Joins", "SQL 50", "Amazon|Adobe|Bloomberg"],
  [1280, "students-and-examinations", "Students and Examinations", 0, "SQL · Joins|Aggregation", "SQL 50", "Amazon|Google|Expedia"],
  // BASIC JOINS
  [175, "combine-two-tables", "Combine Two Tables", 0, "SQL · Joins", "SQL 50", "Amazon|Bloomberg|Adobe"],
  [181, "employees-earning-more-than-their-managers", "Employees Earning More Than Their Managers", 0, "SQL · Joins", "SQL 50", "Amazon|Bloomberg|LinkedIn"],
  [182, "duplicate-emails", "Duplicate Emails", 0, "SQL · Aggregation", "SQL 50", "Amazon|Bloomberg|IBM"],
  [183, "customers-who-never-order", "Customers Who Never Order", 0, "SQL · Joins|Anti-join", "SQL 50", "Amazon|Bloomberg|Adobe"],
  [1148, "article-views-i", "Article Views I", 0, "SQL · SELECT|DISTINCT", "SQL 50", "Amazon|eBay|Optum"],
  [1149, "article-views-ii", "Article Views II", 1, "SQL · Aggregation|HAVING", "SQL 50", "Amazon|eBay|Optum"],
  [607, "sales-person", "Sales Person", 0, "SQL · Joins|Anti-join", "SQL 50", "Amazon|eBay|Bloomberg"],
  [1082, "sales-analysis-i", "Sales Analysis I", 0, "SQL · Aggregation|Windows", "SQL 50", "Amazon|eBay|Capital One"],
  [1083, "sales-analysis-ii", "Sales Analysis II", 0, "SQL · Joins|Anti-join", "SQL 50", "Amazon|eBay|Capital One"],
  [1084, "sales-analysis-iii", "Sales Analysis III", 0, "SQL · Aggregation|Date filter", "SQL 50", "Amazon|eBay|Capital One"],
  // BASIC AGGREGATION
  [620, "not-boring-movies", "Not Boring Movies", 0, "SQL · Filtering|ORDER BY", "SQL 50", "Amazon|Google|Oracle"],
  [1251, "average-selling-price", "Average Selling Price", 0, "SQL · Joins|Aggregation", "SQL 50", "Amazon|Google|Uber"],
  [1075, "project-employees-i", "Project Employees I", 0, "SQL · Joins|Aggregation", "SQL 50", "Amazon|Oracle|Bloomberg"],
  [1633, "percentage-of-users-attended-a-contest", "Percentage of Users Attended a Contest", 0, "SQL · Aggregation", "SQL 50", "Amazon|Uber|Bloomberg"],
  [1211, "queries-quality-and-percentage", "Queries Quality and Percentage", 0, "SQL · Aggregation|CASE WHEN", "SQL 50", "Amazon|Google|Uber"],
  [1661, "average-time-of-process-per-machine", "Average Time of Process per Machine", 0, "SQL · Aggregation|Self-join", "SQL 50", "Amazon|Uber|Google"],
  [570, "managers-with-at-least-5-direct-reports", "Managers with at Least 5 Direct Reports", 1, "SQL · Subqueries|HAVING", "SQL 50", "Amazon|Google|Bloomberg"],
  [1934, "confirmation-rate", "Confirmation Rate", 1, "SQL · Joins|Aggregation|COALESCE", "SQL 50", "Amazon|Google|Uber"],
  // SORTING AND GROUPING
  [1667, "fix-names-in-a-table", "Fix Names in a Table", 0, "SQL · Strings|CONCAT/UPPER", "SQL 50", "Amazon|Google|Optum"],
  [1527, "patients-with-a-condition", "Patients With a Condition", 0, "SQL · Strings|LIKE", "SQL 50", "Amazon|Optum|Oracle"],
  [196, "delete-duplicate-emails", "Delete Duplicate Emails", 1, "SQL · Writes|DELETE", "SQL 50", "Amazon|Bloomberg|Adobe"],
  [176, "second-highest-salary", "Second Highest Salary", 1, "SQL · Subqueries|LIMIT/OFFSET", "SQL 50", "Amazon|Google|Bloomberg"],
  [184, "department-highest-salary", "Department Highest Salary", 1, "SQL · Subqueries|Joins", "SQL 50", "Amazon|Google|Bloomberg"],
  [178, "rank-scores", "Rank Scores", 1, "SQL · Windows|RANK/DENSE_RANK", "SQL 50", "Amazon|Bloomberg|Uber"],
  [596, "classes-more-than-5-students", "Classes More Than 5 Students", 0, "SQL · Aggregation|HAVING", "SQL 50", "Amazon|Bloomberg|Adobe"],
  [1484, "group-sold-products-by-the-date", "Group Sold Products By The Date", 0, "SQL · GROUP_CONCAT", "SQL 50", "Amazon|Google|Optum"],
  [1174, "immediate-food-delivery-ii", "Immediate Food Delivery II", 1, "SQL · Aggregation|Windows|CTE", "SQL 50", "Amazon|DoorDash|Uber"],
  // ADVANCED SELECT
  [1341, "movie-rating", "Movie Rating", 1, "SQL · UNION|Aggregation", "SQL 50", "Amazon|Netflix|Google"],
  [1327, "list-the-products-ordered-in-a-period", "List the Products Ordered in a Period", 0, "SQL · Aggregation|Date filter", "SQL 50", "Amazon|Google|Optum"],
  [1173, "immediate-food-delivery-i", "Immediate Food Delivery I", 0, "SQL · Aggregation|CASE WHEN", "SQL 50", "Amazon|DoorDash|Uber"],
  [2356, "number-of-employees-who-met-the-target", "Number of Employees Who Met the Target", 0, "SQL · Aggregation|HAVING", "SQL 50", "Amazon|Google|Optum"],
  // SUBQUERIES
  [1978, "employees-whose-manager-left-the-company", "Employees Whose Manager Left the Company", 0, "SQL · Subqueries", "SQL 50", "Amazon|Google|Bloomberg"],
  [550, "game-play-analysis-iv", "Game Play Analysis IV", 1, "SQL · Subqueries|Joins", "SQL 50", "Meta|Amazon|Google"],
  [626, "exchange-seats", "Exchange Seats", 1, "SQL · CASE WHEN|Self-join", "SQL 50", "Amazon|Google|Optum"],
  [1097, "game-play-analysis-v", "Game Play Analysis V", 2, "SQL · Windows|CTE", "SQL 50", "Meta|Amazon|Google"],
  [585, "investments-in-2016", "Investments in 2016", 1, "SQL · Subqueries|Windows", "SQL 50", "Amazon|Google|Bloomberg"],
  [185, "department-top-three-salaries", "Department Top Three Salaries", 2, "SQL · Windows|DENSE_RANK", "SQL 50", "Amazon|Google|Bloomberg"],
  [615, "average-salary-of-departments", "Average Salary of Departments Vs Company", 1, "SQL · Joins|Aggregation", "SQL 50", "Amazon|Google|Bloomberg"],
  // ADVANCED STRING FUNCTIONS
  [1731, "the-number-of-employees-which-report-to-each-employee", "The Number of Employees Which Report to Each Employee", 0, "SQL · Joins|Aggregation", "SQL 50", "Amazon|Google|Optum"],
  [1789, "primary-department-for-each-employee", "Primary Department for Each Employee", 0, "SQL · Aggregation|CASE WHEN", "SQL 50", "Amazon|Google|Optum"],
  [610, "triangle-judgement", "Triangle Judgement", 0, "SQL · CASE WHEN", "SQL 50", "Amazon|Google|Oracle"],
  [1393, "capital-gain-loss", "Capital Gain/Loss", 0, "SQL · Aggregation|CASE WHEN", "SQL 50", "Amazon|Google|Uber"],
  [1407, "top-travellers", "Top Travellers", 0, "SQL · Joins|Aggregation|ORDER BY", "SQL 50", "Amazon|Google|Optum"],
  [1158, "market-analysis-i", "Market Analysis I", 1, "SQL · Subqueries|Joins", "SQL 50", "Amazon|Uber|Google"],
];
