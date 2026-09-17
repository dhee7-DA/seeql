// Run diff engine — pure functions, no React.
//
// diffLines: classic LCS line diff for the SQL text (queries are tiny, an
// O(n·m) table is perfectly fine and gives the cleanest teachable output).
//
// diffRowSets: compares two results. When both share the same column
// signature the diff is a row multiset compare (added / removed / kept);
// when the shape changed the diff is the column story instead — that IS the
// more useful answer when a query's projection changes.

import type { CellValue } from "@/lib/sql-types";

export interface LineDiff {
  type: "same" | "add" | "del";
  text: string;
}

export function diffLines(a: string, b: string): LineDiff[] {
  const A = a.split("\n");
  const B = b.split("\n");
  const n = A.length;
  const m = B.length;
  // LCS length table
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = A[i] === B[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  // walk the table
  const out: LineDiff[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      out.push({ type: "same", text: A[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ type: "del", text: A[i] });
      i++;
    } else {
      out.push({ type: "add", text: B[j] });
      j++;
    }
  }
  while (i < n) out.push({ type: "del", text: A[i++] });
  while (j < m) out.push({ type: "add", text: B[j++] });
  return out;
}

export interface RowSetDiff {
  /** false → column signatures differ; read colAdded/colRemoved instead */
  sameShape: boolean;
  colAdded: string[];
  colRemoved: string[];
  /** rows only in B (new) — key + values, capped for display */
  added: CellValue[][];
  /** rows only in A (gone) */
  removed: CellValue[][];
  /** rows present in both */
  kept: number;
  /** how many rows A / B really had (pre-cap) */
  countA: number;
  countB: number;
  /** true when the diff itself was capped (huge results) */
  capped: boolean;
}

const DIFF_CAP = 400;

const rowKey = (row: CellValue[]) => JSON.stringify(row);

export function diffRowSets(
  columnsA: string[],
  rowsA: CellValue[][],
  countA: number,
  columnsB: string[],
  rowsB: CellValue[][],
  countB: number,
): RowSetDiff {
  const norm = (cols: string[]) => cols.map((c) => c.toLowerCase()).join("\u0000");
  const sameShape = norm(columnsA) === norm(columnsB);

  if (!sameShape) {
    const setA = new Set(columnsA.map((c) => c.toLowerCase()));
    const setB = new Set(columnsB.map((c) => c.toLowerCase()));
    return {
      sameShape,
      colAdded: columnsB.filter((c) => !setA.has(c.toLowerCase())),
      colRemoved: columnsA.filter((c) => !setB.has(c.toLowerCase())),
      added: [],
      removed: [],
      kept: 0,
      countA,
      countB,
      capped: false,
    };
  }

  const mapA = new Map<string, number>();
  for (const r of rowsA) mapA.set(rowKey(r), (mapA.get(rowKey(r)) ?? 0) + 1);
  const mapB = new Map<string, number>();
  for (const r of rowsB) mapB.set(rowKey(r), (mapB.get(rowKey(r)) ?? 0) + 1);

  const added: CellValue[][] = [];
  const removed: CellValue[][] = [];
  let kept = 0;
  let capped = false;
  for (const [key, nB] of mapB) {
    const nA = mapA.get(key) ?? 0;
    if (nB > nA) {
      // (nB - nA) copies are new — but keep ONE representative row per key
      added.push(JSON.parse(key) as CellValue[]);
      if (added.length >= DIFF_CAP) { capped = true; break; }
    }
    kept += Math.min(nA, nB);
  }
  for (const [key, nA] of mapA) {
    const nB = mapB.get(key) ?? 0;
    if (nA > nB) {
      removed.push(JSON.parse(key) as CellValue[]);
      if (removed.length >= DIFF_CAP) { capped = true; break; }
    }
  }
  return { sameShape: true, colAdded: [], colRemoved: [], added, removed, kept, countA, countB, capped };
}

/** Plain-English headline for a row diff — the teaching caption. */
export function diffHeadline(d: RowSetDiff): string {
  if (!d.sameShape) {
    const parts: string[] = [];
    if (d.colAdded.length) parts.push(`+ ${d.colAdded.join(", ")}`);
    if (d.colRemoved.length) parts.push(`− ${d.colRemoved.join(", ")}`);
    return `The shape changed — run B's columns differ (${parts.join("; ")}). Row-by-row diff needs matching columns.`;
  }
  const gained = d.added.length;
  const lost = d.removed.length;
  if (gained === 0 && lost === 0)
    return `Identical results — all ${d.kept} row${d.kept === 1 ? "" : "s"} survived unchanged.`;
  const bits: string[] = [];
  if (gained) bits.push(`${gained} row${gained === 1 ? "" : "s"} appeared`);
  if (lost) bits.push(`${lost} row${lost === 1 ? "" : "s"} disappeared`);
  bits.push(`${d.kept} stayed`);
  return `${bits.join(" · ")}.`;
}
