"use client";

// ER mini-diagram for SQL problems — parsed straight from the dive's DDL.
// Entity boxes (name header + column rows, PK/FK badges) with real
// relationship connectors drawn from FOREIGN KEY REFERENCES declarations,
// plus dashed "shared column name" join-hints when no explicit FK exists.
// Deterministic per schema: all 335 problems get a personalized diagram.

import { useMemo } from "react";

export interface ParsedCol {
  name: string;
  type: string;
  pk: boolean;
  fkTo?: string;
  fkCol?: string;
}
export interface ParsedTable {
  name: string;
  cols: ParsedCol[];
}

/** Parse SQLite CREATE TABLE statements — names, columns, PKs, FK targets. */
export function parseDdl(ddl: string): ParsedTable[] {
  const tables: ParsedTable[] = [];
  const re = /CREATE TABLE (?:IF NOT EXISTS )?["']?(\w+)["']?\s*\(([\s\S]*?)\);/gi;
  for (const m of ddl.matchAll(re)) {
    const name = m[1];
    const body = m[2];
    const cols: ParsedCol[] = [];
    for (const raw of body.split("\n")) {
      const line = raw.replace(/--.*$/, "").trim().replace(/,$/, "").trim();
      if (!line) continue;
      const fk = line.match(
        /FOREIGN KEY\s*\(\s*"?(\w+)"?\s*\)\s*REFERENCES\s+"?(\w+)"?\s*(?:\(\s*"?(\w+)"?\s*\))?/i,
      );
      if (fk) {
        const col = cols.find((c) => c.name === fk[1]);
        if (col) {
          col.fkTo = fk[2];
          col.fkCol = fk[3];
        }
        continue;
      }
      if (/^(PRIMARY KEY|UNIQUE|CHECK|CONSTRAINT)\b/i.test(line)) continue;
      const cm = line.match(/^["']?(\w+)["']?\s+([A-Za-z]+(?:\([^)]*\))?)\s*(.*)$/);
      if (!cm) continue;
      const fkInline = cm[3].match(/REFERENCES\s+"?(\w+)"?\s*(?:\(\s*"?(\w+)"?\s*\))?/i);
      cols.push({
        name: cm[1],
        type: cm[2],
        pk: /PRIMARY KEY/i.test(cm[3]),
        fkTo: fkInline ? fkInline[1] : undefined,
        fkCol: fkInline?.[2] || undefined,
      });
    }
    tables.push({ name, cols });
  }
  return tables;
}

/* layout constants */
const BOX_W = 196;
const HEAD_H = 30;
const ROW_H = 20;
const GAP_X = 56;
const GAP_Y = 44;
const PER_ROW = 3;

const TINTS = ["#34d399", "#38bdf8", "#a78bfa", "#fbbf24", "#fb7185", "#22d3ee"];

interface BoxGeom {
  t: ParsedTable;
  x: number;
  y: number;
  i: number;
  colY: Map<string, number>; // column name → y of its row centre
}

function boxGeoms(tables: ParsedTable[]): { boxes: BoxGeom[]; w: number; h: number } {
  const perRow = Math.min(tables.length, PER_ROW);
  const rows = Math.ceil(tables.length / PER_ROW);
  const colWidths: number[] = [];
  for (let r = 0; r < rows; r++) {
    const n = Math.min(PER_ROW, tables.length - r * PER_ROW);
    colWidths.push(n * BOX_W + (n - 1) * GAP_X);
  }
  const w = Math.max(...colWidths);
  const heights: number[] = [];
  const boxes: BoxGeom[] = [];
  tables.forEach((t, i) => {
    const r = Math.floor(i / PER_ROW);
    const inRow = i - r * PER_ROW;
    const rowW = colWidths[r];
    const offset = (w - rowW) / 2; // centre narrower rows
    const x = offset + inRow * (BOX_W + GAP_X);
    const y = heights.slice(0, r).reduce((a, b) => a + b, 0) + r * GAP_Y;
    const colY = new Map<string, number>();
    t.cols.forEach((c, j) => colY.set(c.name, y + HEAD_H + j * ROW_H + ROW_H / 2));
    boxes.push({ t, x, y, i, colY });
    heights[r] = HEAD_H + t.cols.length * ROW_H + 10;
  });
  const h = heights.reduce((a, b) => a + b, 0) + (rows - 1) * GAP_Y;
  return { boxes, w: w + 8, h };
}

/** One relationship path between two boxes (or a self-loop). */
function Connector({
  a,
  b,
  aCol,
  bCol,
  color,
  dashed,
}: {
  a: BoxGeom;
  b: BoxGeom;
  aCol: string;
  bCol?: string;
  color: string;
  dashed?: boolean;
}) {
  const y1 = a.colY.get(aCol) ?? a.y + HEAD_H;
  if (a === b) {
    // self-reference: loop out of the right edge and back
    const x0 = a.x + BOX_W;
    const d = `M ${x0} ${y1 - 4} C ${x0 + 34} ${y1 - 4}, ${x0 + 34} ${y1 + 18}, ${x0} ${y1 + 14}`;
    return (
      <g>
        <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeDasharray={dashed ? "4 3" : undefined} markerEnd="url(#lc-arrow)" />
      </g>
    );
  }
  const y2 = b.colY.get(bCol ?? b.t.cols[0]?.name ?? "") ?? b.y + HEAD_H / 2;
  const leftward = b.x + BOX_W / 2 < a.x + BOX_W / 2;
  const x1 = leftward ? a.x : a.x + BOX_W;
  const x2 = leftward ? b.x + BOX_W : b.x;
  const mx = (x1 + x2) / 2;
  const d = `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`;
  return (
    <g>
      <path d={d} fill="none" stroke={color} strokeWidth={1.6} strokeDasharray={dashed ? "4 3" : undefined} markerEnd="url(#lc-arrow)" />
    </g>
  );
}

export function ErMiniDiagram({ ddl }: { ddl: string }) {
  const { boxes, w, h, connectors } = useMemo(() => {
    const tables = parseDdl(ddl);
    const { boxes, w, h } = boxGeoms(tables);
    type Conn = { a: number; b: number; aCol: string; bCol?: string; color: string; dashed: boolean };
    const connectors: Conn[] = [];
    const usedPairs = new Set<string>();
    // 1) explicit FKs — solid rose
    boxes.forEach((box, i) => {
      for (const c of box.t.cols) {
        if (!c.fkTo) continue;
        const j = boxes.findIndex((b) => b.t.name === c.fkTo);
        if (j === -1) continue;
        const target = boxes[j];
        const bCol =
          c.fkCol ?? target.t.cols.find((x) => x.pk)?.name ?? target.t.cols[0]?.name;
        connectors.push({ a: i, b: j, aCol: c.name, bCol, color: "#fb7185", dashed: false });
        usedPairs.add(`${Math.min(i, j)}-${Math.max(i, j)}`); // whole pair connected
      }
    });
    // 2) shared-name join hints — dashed amber, only for pairs with NO explicit FK
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        if (usedPairs.has(`${i}-${j}`)) continue;
        for (const ci of boxes[i].t.cols) {
          const cj = boxes[j].t.cols.find((c) => c.name === ci.name);
          if (!cj) continue;
          if (ci.name.toLowerCase() === "id" && ci.pk && cj.pk) continue;
          connectors.push({ a: i, b: j, aCol: ci.name, bCol: ci.name, color: "#fbbf24", dashed: true });
          break; // at most one hint per pair
        }
      }
    }
    return { boxes, w, h, connectors };
  }, [ddl]);

  return (
    <div className="overflow-x-auto thin-scrollbar">
      <svg
        viewBox={`0 0 ${w} ${h}`}
        style={{ minWidth: Math.min(w, 560) }}
        className="h-auto w-full"
        role="img"
        aria-label="Schema diagram — tables and their relationships"
      >
        <defs>
          <marker id="lc-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={7} markerHeight={7} orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill="#a1a1aa" />
          </marker>
        </defs>
        {/* connectors under the boxes */}
        {connectors.map((c, k) => {
          const A = boxes[c.a];
          const B = boxes[c.b];
          return <Connector key={k} a={A} b={B} aCol={c.aCol} bCol={c.bCol} color={c.color} dashed={c.dashed} />;
        })}
        {boxes.map((box) => {
          const tint = TINTS[box.i % TINTS.length];
          const boxH = HEAD_H + box.t.cols.length * ROW_H + 10;
          return (
            <g key={box.t.name}>
              <rect x={box.x} y={box.y} width={BOX_W} height={boxH} rx={9} fill="#0d0f14" stroke="#3f3f46" />
              <rect x={box.x} y={box.y} width={BOX_W} height={HEAD_H} rx={9} fill={tint} fillOpacity={0.13} />
              <rect x={box.x} y={box.y + HEAD_H - 9} width={BOX_W} height={9} fill={tint} fillOpacity={0.13} />
              <text x={box.x + 12} y={box.y + 19.5} fontFamily="ui-monospace, monospace" fontSize={12} fontWeight={700} fill={tint}>
                {box.t.name}
              </text>
              <text x={box.x + BOX_W - 10} y={box.y + 19.5} textAnchor="end" fontFamily="ui-monospace, monospace" fontSize={9.5} fill="#71717a">
                {box.t.cols.length} cols
              </text>
              {box.t.cols.map((c, j) => {
                const ry = box.y + HEAD_H + j * ROW_H;
                return (
                  <g key={c.name}>
                    {j > 0 && <line x1={box.x + 10} x2={box.x + BOX_W - 10} y1={ry} y2={ry} stroke="#27272a" strokeWidth={0.75} />}
                    <text x={box.x + 12} y={ry + 13.5} fontFamily="ui-monospace, monospace" fontSize={10.5} fill="#d4d4d8">
                      {c.name}
                    </text>
                    <text x={box.x + BOX_W - 10} y={ry + 13.5} textAnchor="end" fontFamily="ui-monospace, monospace" fontSize={9} fill="#71717a">
                      {c.type}
                    </text>
                    {c.pk && (
                      <g>
                        <rect x={box.x + 96} y={ry + 4.5} width={20} height={11} rx={3} fill="#fbbf24" fillOpacity={0.15} />
                        <text x={box.x + 106} y={ry + 12.7} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7.5} fontWeight={700} fill="#fbbf24">
                          PK
                        </text>
                      </g>
                    )}
                    {c.fkTo && (
                      <g>
                        <rect x={box.x + 120} y={ry + 4.5} width={20} height={11} rx={3} fill="#fb7185" fillOpacity={0.15} />
                        <text x={box.x + 130} y={ry + 12.7} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={7.5} fontWeight={700} fill="#fb7185">
                          FK
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 font-mono text-[9.5px] uppercase tracking-wider text-zinc-600">
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0.5 w-4 bg-rose-400" /> foreign key
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden className="inline-block h-0.5 w-4 border-t border-dashed border-amber-400" /> shared join key
        </span>
      </p>
    </div>
  );
}
