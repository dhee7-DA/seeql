// Inspect node-sql-parser AST shapes needed for per-stage row sampling:
// ast.from item shape (table refs + aliases), ast.groupby shape, and whether
// sqlify round-trips a custom aliased projection + aggr_func COUNT.
import { Parser } from "node-sql-parser";

const parser = new Parser();

const queries = [
  `SELECT c.name, COUNT(o.id) AS orders, ROUND(SUM(o.total), 2) AS spent\nFROM customers c\nJOIN orders o ON o.customer_id = c.id\nGROUP BY c.id\nORDER BY spent DESC\nLIMIT 5;`,
  `SELECT p.category, ROUND(SUM(oi.unit_price * oi.quantity), 2) AS revenue\nFROM order_items oi\nJOIN products p ON p.id = oi.product_id\nGROUP BY p.category\nORDER BY revenue DESC;`,
  `SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON o.customer_id = c.id\nLEFT JOIN refunds r ON r.order_id = o.id\nGROUP BY c.id\nHAVING COUNT(r.id) = 0;`,
];

for (const sql of queries) {
  const { ast } = parser.parse(sql, { database: "sqlite" }) as unknown as {
    ast: Record<string, unknown>;
  };
  console.log("=== FROM ===", JSON.stringify(ast.from, null, 1).slice(0, 1200));
  console.log("=== GROUPBY ===", JSON.stringify(ast.groupby));
  console.log("=== HAVING ===", JSON.stringify(ast.having)?.slice(0, 300));
}

// round-trip: custom projection with aliases + a COUNT aggr_func
const { ast } = parser.parse(queries[0], { database: "sqlite" }) as unknown as {
  ast: Record<string, unknown>;
};
const clone = structuredClone(ast) as Record<string, unknown>;
clone.columns = [
  {
    expr: { type: "column_ref", table: "c", column: "name" },
    as: "c_name",
  },
  {
    expr: { type: "column_ref", table: "c", column: "city" },
    as: null,
  },
];
clone.orderby = null;
clone.limit = null;
const inner = parser.sqlify(clone as unknown as Parameters<Parser["sqlify"]>[0], { database: "sqlite" });
console.log("=== ROUNDTRIP plain proj ===\n", inner);

const clone2 = structuredClone(ast) as Record<string, unknown>;
clone2.columns = [
  { expr: { type: "column_ref", table: "c", column: "id" }, as: null },
  {
    expr: {
      type: "aggr_func",
      name: "COUNT",
      args: { expr: { type: "column_ref", table: null, column: "*" } },
    },
    as: "bucket_rows",
  },
];
clone2.orderby = null;
clone2.limit = null;
const inner2 = parser.sqlify(clone2 as unknown as Parameters<Parser["sqlify"]>[0], { database: "sqlite" });
console.log("=== ROUNDTRIP count proj ===\n", inner2);
