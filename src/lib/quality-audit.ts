// Data-quality audit: runs a battery of SQL checks against the live sample
// database and returns everything the Quality dashboard needs. Server-only.
//
// All check definitions (dirty rules, FK edges, enum columns, anomalies)
// live in schema-meta.ts so the app and the audit stay in sync.

import { db } from "@/lib/db";
import { ensureDatabase } from "@/lib/sample-db";
import {
  QUALITY_ANOMALIES,
  QUALITY_COLUMN_RULES,
  QUALITY_ENUM_COLUMNS,
  SCHEMA_RELATIONSHIPS,
  SCHEMA_TABLES,
} from "./schema-meta";
import type {
  QualityAnomalyReport,
  QualityEnumReport,
  QualityFkReport,
  QualityResponse,
  QualityTableReport,
  QualityTimelinePoint,
} from "./sql-types";

const SAFE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const MAX_ENUM_VALUES = 15;
const TIMELINE_TABLES: Array<{ table: string; dateCol: string; flaggedSql: string }> = [
  {
    table: "orders",
    dateCol: "created_at",
    flaggedSql: `status IS NULL OR total IS NULL OR total < 0 OR customer_id IS NULL
                 OR NOT EXISTS (SELECT 1 FROM customers c WHERE c.id = customer_id)`,
  },
];

async function rows(sql: string): Promise<Array<Record<string, unknown>>> {
  return (await db.$queryRawUnsafe(sql)) as Array<Record<string, unknown>>;
}

export async function runQualityAudit(): Promise<QualityResponse> {
  await ensureDatabase();

  /* ---- per-table column stats + score -------------------------------- */

  const tables: QualityTableReport[] = [];
  for (const t of SCHEMA_TABLES) {
    const rules = QUALITY_COLUMN_RULES.filter((r) => r.table === t.name);
    const selects = ["COUNT(*) AS __rows"];
    for (const r of rules) {
      selects.push(`SUM(CASE WHEN ${r.column} IS NULL THEN 1 ELSE 0 END) AS __null_${r.column}`);
      selects.push(`SUM(CASE WHEN ${r.badSql} THEN 1 ELSE 0 END) AS __bad_${r.column}`);
    }
    const res = await rows(`SELECT ${selects.join(", ")} FROM ${t.name}`);
    const r0 = res[0] ?? {};
    const rowCount = Number(r0.__rows ?? 0);

    const columns = rules.map((rule) => {
      const nulls = Number(r0[`__null_${rule.column}`] ?? 0);
      const bad = Number(r0[`__bad_${rule.column}`] ?? 0);
      return {
        column: rule.column,
        label: rule.label,
        total: rowCount,
        nulls,
        nullPct: rowCount > 0 ? Math.round((nulls / rowCount) * 1000) / 10 : 0,
        bad,
        badPct: rowCount > 0 ? Math.round((bad / rowCount) * 1000) / 10 : 0,
      };
    });

    const totalCells = rowCount * rules.length;
    const badCells = columns.reduce((acc, c) => acc + c.bad, 0);
    const score =
      totalCells > 0 ? Math.round(((totalCells - badCells) / totalCells) * 1000) / 10 : 100;

    tables.push({ table: t.name, rows: rowCount, score, columns });
  }

  const overallScore =
    tables.length > 0
      ? Math.round((tables.reduce((acc, t) => acc + t.score, 0) / tables.length) * 10) / 10
      : 100;

  /* ---- enum chaos ------------------------------------------------------ */

  const enums: QualityEnumReport[] = [];
  for (const e of QUALITY_ENUM_COLUMNS) {
    if (!SAFE_IDENT.test(e.table) || !SAFE_IDENT.test(e.column)) continue;
    const res = await rows(
      `SELECT ${e.column} AS v, COUNT(*) AS n FROM ${e.table} GROUP BY ${e.column} ORDER BY n DESC, v ASC`,
    );
    const values = res.slice(0, MAX_ENUM_VALUES).map((r) => ({
      value: r.v === null || r.v === undefined ? null : String(r.v),
      n: Number(r.n),
    }));
    const nulls = values.filter((v) => v.value === null).reduce((acc, v) => acc + v.n, 0);
    enums.push({ table: e.table, column: e.column, variants: res.length, nulls, values });
  }

  /* ---- FK integrity ------------------------------------------------------ */

  const fks: QualityFkReport[] = [];
  for (const rel of SCHEMA_RELATIONSHIPS) {
    const child = rel.to.table;
    const childCol = rel.to.column;
    const parent = rel.from.table;
    const parentCol = rel.from.column;
    if ([child, childCol, parent, parentCol].every((i) => SAFE_IDENT.test(i))) {
      const res = await rows(
        `SELECT COUNT(*) AS __total,
                SUM(CASE WHEN c.${childCol} IS NULL THEN 1 ELSE 0 END) AS __null_refs,
                SUM(CASE WHEN c.${childCol} IS NOT NULL AND p.${parentCol} IS NULL THEN 1 ELSE 0 END) AS __orphans
         FROM ${child} c LEFT JOIN ${parent} p ON c.${childCol} = p.${parentCol}`,
      );
      const r0 = res[0] ?? {};
      fks.push({
        childTable: child,
        childColumn: childCol,
        parentTable: parent,
        parentColumn: parentCol,
        total: Number(r0.__total ?? 0),
        nullRefs: Number(r0.__null_refs ?? 0),
        orphans: Number(r0.__orphans ?? 0),
      });
    }
  }

  /* ---- anomalies ----------------------------------------------------------- */

  const anomalies: QualityAnomalyReport[] = [];
  for (const a of QUALITY_ANOMALIES) {
    if (!a.exampleColumns.every((c) => SAFE_IDENT.test(c)) || !SAFE_IDENT.test(a.table)) continue;
    const countRes = await rows(`SELECT COUNT(*) AS n FROM ${a.table} WHERE ${a.whereSql}`);
    const count = Number(countRes[0]?.n ?? 0);
    let example: Record<string, string | number | boolean | null> | null = null;
    if (count > 0) {
      const exRes = await rows(
        `SELECT ${a.exampleColumns.join(", ")} FROM ${a.table} WHERE ${a.whereSql} LIMIT 1`,
      );
      if (exRes[0]) {
        example = Object.fromEntries(
          Object.entries(exRes[0]).map(([k, v]) => [
            k,
            v === null || v === undefined
              ? null
              : typeof v === "number" || typeof v === "boolean"
                ? v
                : typeof v === "bigint"
                  ? Number(v)
                  : String(v),
          ]),
        );
      }
    }
    anomalies.push({ table: a.table, kind: a.kind, count, example });
  }

  /* ---- monthly timelines (clean vs flagged rows) ---------------------------- */

  const timelines: Record<string, QualityTimelinePoint[]> = {};
  for (const t of TIMELINE_TABLES) {
    if (![t.table, t.dateCol].every((i) => SAFE_IDENT.test(i))) continue;
    const res = await rows(
      `SELECT strftime('%Y-%m', ${t.dateCol}) AS month,
              COUNT(*) AS total,
              SUM(CASE WHEN ${t.flaggedSql} THEN 1 ELSE 0 END) AS flagged
       FROM ${t.table}
       WHERE ${t.dateCol} IS NOT NULL AND date(${t.dateCol}) IS NOT NULL
       GROUP BY month ORDER BY month`,
    );
    timelines[t.table] = res.map((r) => ({
      month: String(r.month ?? ""),
      total: Number(r.total ?? 0),
      flagged: Number(r.flagged ?? 0),
    }));
  }

  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    overallScore,
    tables,
    enums,
    fks,
    anomalies,
    timelines,
  };
}
