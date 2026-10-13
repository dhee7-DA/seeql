// Static metadata for the sample database — client-safe (pure data).
// Used by the Schema (ERD) view and the column reference.

import type { SchemaRelationship, SchemaTable } from "./sql-types";

export const SCHEMA_TABLES: SchemaTable[] = [
  {
    name: "suppliers",
    description: "Companies that provide our products",
    columns: [
      { name: "id", type: "INTEGER", pk: true },
      { name: "name", type: "TEXT" },
      { name: "region", type: "TEXT" },
      { name: "rating", type: "REAL" },
    ],
  },
  {
    name: "customers",
    description: "People who place orders",
    columns: [
      { name: "id", type: "INTEGER", pk: true },
      { name: "name", type: "TEXT" },
      { name: "email", type: "TEXT" },
      { name: "city", type: "TEXT" },
      { name: "region", type: "TEXT" },
      { name: "active", type: "INTEGER" },
      { name: "created_at", type: "TEXT" },
    ],
  },
  {
    name: "products",
    description: "Items available in the catalog",
    columns: [
      { name: "id", type: "INTEGER", pk: true },
      { name: "name", type: "TEXT" },
      { name: "category", type: "TEXT" },
      { name: "price", type: "REAL" },
      { name: "stock", type: "INTEGER" },
      { name: "supplier_id", type: "INTEGER", fk: { table: "suppliers", column: "id" } },
    ],
  },
  {
    name: "orders",
    description: "One row per customer order",
    columns: [
      { name: "id", type: "INTEGER", pk: true },
      { name: "customer_id", type: "INTEGER", fk: { table: "customers", column: "id" } },
      { name: "status", type: "TEXT" },
      { name: "total", type: "REAL" },
      { name: "created_at", type: "TEXT" },
    ],
  },
  {
    name: "order_items",
    description: "Line items — the fact table",
    columns: [
      { name: "id", type: "INTEGER", pk: true },
      { name: "order_id", type: "INTEGER", fk: { table: "orders", column: "id" } },
      { name: "product_id", type: "INTEGER", fk: { table: "products", column: "id" } },
      { name: "quantity", type: "INTEGER" },
      { name: "unit_price", type: "REAL" },
    ],
  },
];

export const SCHEMA_RELATIONSHIPS: SchemaRelationship[] = [
  {
    from: { table: "suppliers", column: "id" },
    to: { table: "products", column: "supplier_id" },
    label: "1—N",
  },
  {
    from: { table: "customers", column: "id" },
    to: { table: "orders", column: "customer_id" },
    label: "1—N",
  },
  {
    from: { table: "orders", column: "id" },
    to: { table: "order_items", column: "order_id" },
    label: "1—N",
  },
  {
    from: { table: "products", column: "id" },
    to: { table: "order_items", column: "product_id" },
    label: "1—N",
  },
];

/** Layout positions (canvas coordinates) for the ERD. */
export const SCHEMA_LAYOUT: Record<string, { x: number; y: number }> = {
  suppliers: { x: 20, y: 60 },
  products: { x: 230, y: 60 },
  order_items: { x: 440, y: 60 },
  orders: { x: 650, y: 60 },
  customers: { x: 860, y: 60 },
};

export const SCHEMA_CANVAS = { width: 1090, height: 330 };

/** Small example-query suggestions shown in the Schema tab. */
export const SCHEMA_TIPS: Array<{ table: string; column: string }> = [
  { table: "customers", column: "region" },
  { table: "orders", column: "status" },
  { table: "products", column: "category" },
];

/** Column quality rules — one row per audited column: NULLs are counted
 *  separately from "bad" values (badSql). The Quality dashboard reads the
 *  per-column null/bad percentages from these. */
export const QUALITY_COLUMN_RULES: Array<{
  table: string;
  column: string;
  label: string;
  badSql: string;
}> = [
  // customers
  { table: "customers", column: "name", label: "Name present", badSql: "name IS NULL OR TRIM(name) = ''" },
  { table: "customers", column: "email", label: "Email shaped", badSql: "email IS NULL OR email NOT LIKE '%@%.%'" },
  { table: "customers", column: "region", label: "Region present", badSql: "region IS NULL OR TRIM(region) = ''" },
  { table: "customers", column: "active", label: "Active flag valid", badSql: "active IS NULL OR active NOT IN (0, 1)" },
  { table: "customers", column: "created_at", label: "Created date valid", badSql: "created_at IS NULL OR date(created_at) IS NULL" },
  // products
  { table: "products", column: "name", label: "Name present", badSql: "name IS NULL OR TRIM(name) = ''" },
  { table: "products", column: "category", label: "Category present", badSql: "category IS NULL OR TRIM(category) = ''" },
  { table: "products", column: "price", label: "Price non-negative", badSql: "price IS NULL OR price < 0" },
  { table: "products", column: "stock", label: "Stock non-negative", badSql: "stock IS NULL OR stock < 0" },
  { table: "products", column: "supplier_id", label: "Supplier link valid", badSql: "supplier_id IS NULL OR NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.id = supplier_id)" },
  // suppliers
  { table: "suppliers", column: "name", label: "Name present", badSql: "name IS NULL OR TRIM(name) = ''" },
  { table: "suppliers", column: "region", label: "Region present", badSql: "region IS NULL OR TRIM(region) = ''" },
  { table: "suppliers", column: "rating", label: "Rating in 0–5", badSql: "rating IS NULL OR rating NOT BETWEEN 0 AND 5" },
  // orders
  { table: "orders", column: "status", label: "Status present", badSql: "status IS NULL OR TRIM(status) = ''" },
  { table: "orders", column: "total", label: "Total non-negative", badSql: "total IS NULL OR total < 0" },
  { table: "orders", column: "customer_id", label: "Customer link valid", badSql: "customer_id IS NULL OR NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id)" },
  { table: "orders", column: "created_at", label: "Created date valid", badSql: "created_at IS NULL OR date(created_at) IS NULL" },
  // order_items
  { table: "order_items", column: "quantity", label: "Quantity positive", badSql: "quantity IS NULL OR quantity <= 0" },
  { table: "order_items", column: "unit_price", label: "Unit price non-negative", badSql: "unit_price IS NULL OR unit_price < 0" },
  { table: "order_items", column: "order_id", label: "Order link valid", badSql: "order_id IS NULL OR NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id)" },
  { table: "order_items", column: "product_id", label: "Product link valid", badSql: "product_id IS NULL OR NOT EXISTS (SELECT 1 FROM products p WHERE p.id = product_id)" },
];

/** Low-cardinality columns worth an enum-chaos read (distinct values + NULLs). */
export const QUALITY_ENUM_COLUMNS: Array<{ table: string; column: string }> = [
  { table: "orders", column: "status" },
  { table: "customers", column: "region" },
  { table: "customers", column: "active" },
  { table: "products", column: "category" },
  { table: "suppliers", column: "region" },
];

/** Known anomaly classes — count + one example row each, straight SQL. */
export const QUALITY_ANOMALIES: Array<{
  table: string;
  kind: string;
  whereSql: string;
  exampleColumns: string[];
}> = [
  {
    table: "orders",
    kind: "Orphan order (no matching customer)",
    whereSql: "customer_id IS NULL OR NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id)",
    exampleColumns: ["id", "customer_id", "status", "total"],
  },
  {
    table: "orders",
    kind: "Negative or missing total",
    whereSql: "total IS NULL OR total < 0",
    exampleColumns: ["id", "total", "status"],
  },
  {
    table: "order_items",
    kind: "Orphan line item (no matching product)",
    whereSql: "product_id IS NULL OR NOT EXISTS (SELECT 1 FROM products p WHERE p.id = product_id)",
    exampleColumns: ["id", "order_id", "product_id", "quantity"],
  },
  {
    table: "order_items",
    kind: "Orphan line item (no matching order)",
    whereSql: "order_id IS NULL OR NOT EXISTS (SELECT 1 FROM orders o WHERE o.id = order_id)",
    exampleColumns: ["id", "order_id", "product_id", "quantity"],
  },
  {
    table: "products",
    kind: "Orphan product (no matching supplier)",
    whereSql: "supplier_id IS NULL OR NOT EXISTS (SELECT 1 FROM suppliers s WHERE s.id = supplier_id)",
    exampleColumns: ["id", "name", "supplier_id"],
  },
];
