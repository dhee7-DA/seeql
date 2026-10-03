// Straggler bank problems — AND / OR / NOT boolean logic (kb-bo-p01..p15) and
// GROUP_CONCAT folds (kb-gc-p01..p03). Briefs carry the boolean/AND-OR tag
// phrases the census prose-scans; solutions carry LIKE / group_concat where
// the sql-side regexes need them.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const stragglerProblemsBoolean: Problem[] = [
  p({
    id: "kb-bo-p01", difficulty: "easy",
    title: "The cheap-and-pricey split",
    brief: "Boolean OR in action: products priced under 30 OR over 120 — the two tails of the catalog. List name and price by price.",
    hints: ["OR joins two conditions; either passing qualifies the row.", "WHERE price < 30 OR price > 120"],
    solution: `SELECT name, price FROM products WHERE price < 30 OR price > 120 ORDER BY price, name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p02", difficulty: "easy",
    title: "The negated middle",
    brief: "Boolean negation over the same split: NOT (cheap OR pricey) is the comfortable middle. List name and price by price — and watch the count mirror the OR query.",
    hints: ["NOT wraps the parenthesized OR group.", "WHERE NOT (price < 30 OR price > 120)"],
    solution: `SELECT name, price FROM products WHERE NOT (price < 30 OR price > 120) ORDER BY price, name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p03", difficulty: "easy",
    title: "The BETWEEN twin",
    brief: "The same middle shelf expressed as a range: prices from 30 to 120 inclusive. The row set must match the negated OR query exactly — De Morgan in prices.",
    hints: ["BETWEEN is inclusive on both ends.", "WHERE price BETWEEN 30 AND 120"],
    solution: `SELECT name, price FROM products WHERE price BETWEEN 30 AND 120 ORDER BY price, name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p04", difficulty: "easy",
    title: "Active EU/US customers",
    brief: "Boolean AND narrows: customers in region EU or US who are also active. List names with their region, alphabetical.",
    hints: ["IN lists the two regions, AND adds the active flag.", "WHERE region IN ('EU','US') AND active = 1"],
    solution: `SELECT name, region FROM customers WHERE region IN ('EU','US') AND active = 1 ORDER BY name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p05", difficulty: "easy",
    title: "The NOT IN complement",
    brief: "The boolean complement of the same split: customers NOT in EU or US. Names and regions, alphabetical.",
    hints: ["NOT IN negates the whole membership list.", "WHERE region NOT IN ('EU','US')"],
    solution: `SELECT name, region FROM customers WHERE region NOT IN ('EU','US') ORDER BY name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p06", difficulty: "medium",
    title: "The precedence receipt",
    brief: "Run the boolean filter EXACTLY as written — no parentheses: category 'Audio' OR category 'Accessories' AND price < 50. AND binds tighter, so the price gate only clips the Accessories side. List name, category, price by name and study the receipt.",
    hints: ["AND groups with its neighbor before OR reads.", "WHERE category = 'Audio' OR category = 'Accessories' AND price < 50"],
    solution: `SELECT name, category, price FROM products WHERE category = 'Audio' OR category = 'Accessories' AND price < 50 ORDER BY name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p07", difficulty: "medium",
    title: "The parenthesized twin",
    brief: "The same boolean intent WITH parentheses: (Audio OR Accessories) AND price < 50 — both categories now clipped by the price gate. List name, category, price by name, and compare against the unparenthesized receipt.",
    hints: ["Parentheses override precedence.", "WHERE (category = 'Audio' OR category = 'Accessories') AND price < 50"],
    solution: `SELECT name, category, price FROM products WHERE (category = 'Audio' OR category = 'Accessories') AND price < 50 ORDER BY name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p08", difficulty: "medium",
    title: "The open pipeline",
    brief: "Boolean OR over statuses: orders that are pending OR cancelled — the not-moving money. List id and status by id.",
    hints: ["Two equality tests joined by OR.", "WHERE status = 'pending' OR status = 'cancelled'"],
    solution: `SELECT id, status FROM orders WHERE status = 'pending' OR status = 'cancelled' ORDER BY id;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p09", difficulty: "medium",
    title: "Not delivered, counted",
    brief: "Boolean negation as a census: how many orders are NOT delivered? One count, one NOT.",
    hints: ["NOT flips the equality.", "WHERE NOT status = 'delivered'"],
    solution: `SELECT COUNT(*) AS n FROM orders WHERE NOT status = 'delivered';`,
  }),
  p({
    id: "kb-bo-p10", difficulty: "medium",
    title: "The three-valued audit",
    brief: "Boolean logic with NULLs: count orders where NOT (shipped_at = '1970-01-01'). The comparison is never true, but the NULL shipped dates make NOT(comparison) NULL too — they silently drop. Feel the three-valued receipt in the count.",
    hints: ["NOT(NULL) is NULL, not TRUE.", "WHERE NOT (shipped_at = '1970-01-01')"],
    solution: `SELECT COUNT(*) AS n FROM orders WHERE NOT (shipped_at = '1970-01-01');`,
  }),
  p({
    id: "kb-bo-p11", difficulty: "medium",
    title: "Big delivered orders",
    brief: "Boolean AND over one table: delivered AND total above 300. List id and total, biggest first.",
    hints: ["Both conditions must hold.", "WHERE status = 'delivered' AND total > 300"],
    solution: `SELECT id, total FROM orders WHERE status = 'delivered' AND total > 300 ORDER BY total DESC, id;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p12", difficulty: "hard",
    title: "The OR-NULL trap count",
    brief: "Three-valued boolean: count orders where status = 'delivered' OR shipped_at = '1970-01-01'. The OR's second arm is never true — and for NULL shipped dates the whole OR reads NULL, so those 21 orders vanish. The receipt is the delivered count and nothing more.",
    hints: ["TRUE OR NULL is TRUE; NULL OR NULL is NULL.", "WHERE status = 'delivered' OR shipped_at = '1970-01-01'"],
    solution: `SELECT COUNT(*) AS n FROM orders WHERE status = 'delivered' OR shipped_at = '1970-01-01';`,
  }),
  p({
    id: "kb-bo-p13", difficulty: "hard",
    title: "Active outside APAC",
    brief: "Combined boolean negation and conjunction: customers NOT in APAC who are ALSO active. Names and regions, alphabetical.",
    hints: ["NOT IN handles the exclusion; AND adds the flag.", "WHERE region NOT IN ('APAC') AND active = 1"],
    solution: `SELECT name, region FROM customers WHERE region NOT IN ('APAC') AND active = 1 ORDER BY name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p14", difficulty: "hard",
    title: "NOT scopes to one term",
    brief: "Precedence with NOT: run WHERE NOT category = 'Audio' AND price > 50 — NOT binds to the comparison only, so the price gate still applies to every non-Audio product. List name, category, price by name.",
    hints: ["NOT(category='Audio') AND (price>50) — read it that way.", "WHERE NOT category = 'Audio' AND price > 50"],
    solution: `SELECT name, category, price FROM products WHERE NOT category = 'Audio' AND price > 50 ORDER BY name;`,
    ordered: true,
  }),
  p({
    id: "kb-bo-p15", difficulty: "hard",
    title: "De Morgan by rows",
    brief: "Prove the boolean identity on data: NOT (category = 'Audio' OR category = 'Accessories') must return exactly the rows that are neither. List name and category alphabetically — ten survivors expected from the receipt.",
    hints: ["NOT over a parenthesized OR group.", "WHERE NOT (category = 'Audio' OR category = 'Accessories')"],
    solution: `SELECT name, category FROM products WHERE NOT (category = 'Audio' OR category = 'Accessories') ORDER BY name;`,
    ordered: true,
  }),
];

export const stragglerProblemsGroupConcat: Problem[] = [
  p({
    id: "kb-gc-p01", difficulty: "medium",
    title: "The catalog vocabulary",
    brief: "One row per category, product names comma-joined in ALPHABETICAL order inside each cell — the string fold fed by an ordered subquery. Sort the rows by category.",
    hints: ["Stage the sort: SELECT … FROM (SELECT … ORDER BY category, name) GROUP BY category.", "GROUP_CONCAT(name) does the fold."],
    solution: `SELECT category, GROUP_CONCAT(name) AS names FROM (SELECT category, name FROM products ORDER BY category, name) GROUP BY category ORDER BY category;`,
    ordered: true,
  }),
  p({
    id: "kb-gc-p02", difficulty: "medium",
    title: "The region ribbon",
    brief: "Fold the distinct customer regions into ONE cell with a custom ' | ' separator, alphabetical — the ribbon the board deck pastes straight into a slide.",
    hints: ["DISTINCT inside the fold; the separator is the second argument.", "Stage the sort in a subquery: SELECT DISTINCT region FROM customers ORDER BY region."],
    solution: `SELECT GROUP_CONCAT(region, ' | ') AS regions FROM (SELECT DISTINCT region FROM customers ORDER BY region);`,
    ordered: true,
  }),
  p({
    id: "kb-gc-p03", difficulty: "hard",
    title: "The per-customer status fold",
    brief: "For every customer with orders, fold their DISTINCT order statuses into one comma-joined cell. Customer id ascending — the account-health ribbon.",
    hints: ["GROUP BY customer_id, fold DISTINCT status.", "Customers without orders simply do not appear — INNER semantics."],
    solution: `SELECT customer_id, GROUP_CONCAT(DISTINCT status) AS statuses FROM orders GROUP BY customer_id ORDER BY customer_id;`,
    ordered: true,
  }),
];
