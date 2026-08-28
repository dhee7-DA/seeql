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
