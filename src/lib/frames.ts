// Window-frame playground engine — enhancement #5.
//
// Pure TypeScript (no imports) so BOTH the client view and the SQLite
// cross-validation script (scripts/validate-frames.ts) share one exact
// implementation. The view displays SQLite's own output for every computed
// value; this engine supplies the frame-MEMBERSHIP highlights (which rows
// feed each result) and the validator proves those highlights match what
// SQLite's window machinery actually used, across a large spec matrix.
//
// Teaching dataset: 12 days of sales, deliberately riddled with ties —
// every distinct sales value appears 2–4 times, so RANGE's peer-folding and
// GROUPS' group-stepping are visible no matter which slice you look at.
// Values also repeat ACROSS regions, so PARTITION BY demos stay interesting.

export type FrameUnit = "rows" | "range" | "groups";

export type BoundKind =
  | "unbounded-preceding"
  | "n-preceding"
  | "current-row"
  | "n-following"
  | "unbounded-following";

export type ExcludeMode = "no-others" | "current-row" | "group" | "ties";

export type FrameFn = "sum" | "avg" | "count" | "min" | "max" | "first" | "last";

export interface FrameConfig {
  fn: FrameFn;
  partition: boolean;
  orderCol: "sales" | "day";
  dir: "asc" | "desc";
  /** "default" = omit the frame clause entirely (SQLite's silent default). */
  frameMode: "default" | "custom";
  unit: FrameUnit;
  start: BoundKind;
  startN: number;
  end: BoundKind;
  endN: number;
  exclude: ExcludeMode;
}

export interface FrameRow {
  day: number;
  region: string;
  sales: number;
}

/** The one true dataset — day-ordered, region-interleaved, tie-heavy. */
export const FRAME_DATASET: FrameRow[] = [
  { day: 1, region: "web", sales: 120 },
  { day: 2, region: "web", sales: 95 },
  { day: 3, region: "web", sales: 120 },
  { day: 4, region: "web", sales: 310 },
  { day: 5, region: "web", sales: 95 },
  { day: 6, region: "web", sales: 480 },
  { day: 7, region: "store", sales: 310 },
  { day: 8, region: "store", sales: 310 },
  { day: 9, region: "store", sales: 95 },
  { day: 10, region: "store", sales: 120 },
  { day: 11, region: "store", sales: 480 },
  { day: 12, region: "store", sales: 310 },
];

export const DEFAULT_FRAME_CONFIG: FrameConfig = {
  fn: "sum",
  partition: false,
  orderCol: "day",
  dir: "asc",
  frameMode: "default",
  unit: "rows",
  start: "unbounded-preceding",
  startN: 1,
  end: "current-row",
  endN: 1,
  exclude: "no-others",
};

/** What SQLite silently uses when the frame clause is omitted (with ORDER BY). */
export const DEFAULT_FRAME_SENTENCE =
  "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW";

// ---- presets ---------------------------------------------------------------

export interface FramePreset {
  id: string;
  label: string;
  why: string;
  config: FrameConfig;
}

const preset = (id: string, label: string, why: string, patch: Partial<FrameConfig>): FramePreset => ({
  id,
  label,
  why,
  config: { ...DEFAULT_FRAME_CONFIG, ...patch },
});

export const FRAME_PRESETS: FramePreset[] = [
  preset("running", "Running total", "The default frame: everything from the start up to — and including — you.", {}),
  preset(
    "mavg",
    "3-day moving avg",
    "An explicit ROWS frame clips history to exactly three rows, so the window slides.",
    { fn: "avg", frameMode: "custom", unit: "rows", start: "n-preceding", startN: 2, end: "current-row" },
  ),
  preset(
    "range-peers",
    "RANGE folds peers",
    "Order by sales: the default frame is RANGE, so tied values step together as one block.",
    { fn: "sum", orderCol: "sales" },
  ),
  preset(
    "rows-peers",
    "…same, but ROWS",
    "ROWS counts physical rows: the ties split into one row per step. Compare with RANGE.",
    { fn: "sum", orderCol: "sales", frameMode: "custom", unit: "rows", start: "unbounded-preceding", end: "current-row" },
  ),
  preset(
    "groups",
    "GROUPS: 1 group back",
    "GROUPS counts peer-GROUPS, not rows: '1 preceding' means one tied block, whatever its size.",
    { fn: "avg", orderCol: "sales", frameMode: "custom", unit: "groups", start: "n-preceding", startN: 1, end: "current-row" },
  ),
  preset(
    "last-trap",
    "The LAST_VALUE trap",
    "Value functions read the frame's END — and the default frame ends at the current row. You.",
    { fn: "last" },
  ),
  preset(
    "last-fixed",
    "…the fix",
    "Stretch the frame to UNBOUNDED FOLLOWING and LAST_VALUE finally sees the whole partition.",
    { fn: "last", frameMode: "custom", unit: "rows", start: "unbounded-preceding", end: "unbounded-following" },
  ),
  preset(
    "excl-ties",
    "EXCLUDE TIES",
    "Same frame, minus the tied neighbours — watch COUNT drop on every tie block.",
    {
      fn: "count",
      orderCol: "sales",
      frameMode: "custom",
      unit: "rows",
      start: "unbounded-preceding",
      end: "unbounded-following",
      exclude: "ties",
    },
  ),
];

// ---- ordering + segments ---------------------------------------------------

export type OrderKey = (r: FrameRow) => number;

export function orderKeyOf(cfg: FrameConfig): OrderKey {
  return cfg.orderCol === "sales" ? (r) => r.sales : (r) => r.day;
}

/** Client-side preview of SQLite's working order (stable within ties). */
export function orderedRows(cfg: FrameConfig): FrameRow[] {
  const key = orderKeyOf(cfg);
  const sgn = cfg.dir === "asc" ? 1 : -1;
  const base = cfg.partition
    ? [...FRAME_DATASET].sort((a, b) => (a.region < b.region ? -1 : a.region > b.region ? 1 : 0))
    : [...FRAME_DATASET];
  return base
    .map((r, i) => ({ r, i }))
    .sort((a, b) => sgn * (key(a.r) - key(b.r)) || a.i - b.i)
    .map((x) => x.r);
}

/**
 * Split working-order rows into contiguous partition segments.
 * SQLite groups partition rows contiguously in its output, so runs are safe.
 */
export function partitionSegments(rows: FrameRow[], partition: boolean): Array<[number, number]> {
  if (!partition || rows.length === 0) return rows.length ? [[0, rows.length - 1]] : [];
  const segs: Array<[number, number]> = [];
  let start = 0;
  for (let i = 1; i <= rows.length; i++) {
    if (i === rows.length || rows[i].region !== rows[start].region) {
      segs.push([start, i - 1]);
      start = i;
    }
  }
  return segs;
}

// ---- frame membership ------------------------------------------------------

/**
 * Frame members (positions into `rows`) for the output row at position `i`.
 * `rows` must be in working order (SQLite's output order is ideal — for ROWS
 * units membership is positional, so feeding the engine's own order makes the
 * highlight provably identical to what SQLite used).
 * Returns positions sorted ascending; empty array = empty frame (NULL aggregate).
 */
export function frameMembers(rows: FrameRow[], i: number, cfg: FrameConfig): number[] {
  const key = orderKeyOf(cfg);
  const seg = partitionSegments(rows, cfg.partition).find(([a, b]) => i >= a && i <= b);
  if (!seg) return [];
  const [lo0, hi0] = seg;
  const n = hi0 - lo0 + 1;
  const at = (p: number) => rows[p];

  if (cfg.frameMode === "default") {
    // Omitted clause = RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW.
    // Directional: "everything before me in SORT order" — under DESC that is
    // every value >= mine. Compare in sort-order space (c = d·key).
    const d = cfg.dir === "asc" ? 1 : -1;
    const members: number[] = [];
    const cur = d * key(at(i));
    for (let p = lo0; p <= hi0; p++) if (d * key(at(p)) <= cur) members.push(p);
    return applyExclude(members, rows, i, cfg, key);
  }

  let members: number[];
  if (cfg.unit === "rows") {
    const s =
      cfg.start === "unbounded-preceding" ? lo0 : cfg.start === "n-preceding" ? i - cfg.startN : i;
    const e =
      cfg.end === "unbounded-following" ? hi0 : cfg.end === "n-following" ? i + cfg.endN : i;
    const cs = Math.max(s, lo0);
    const ce = Math.min(e, hi0);
    members = [];
    for (let p = cs; p <= ce; p++) members.push(p);
    if (s > e) members = []; // raw start past raw end → empty (SQLite agrees; validator proves it)
  } else if (cfg.unit === "range") {
    // RANGE compares VALUES, but PRECEDING/FOLLOWING follow the SORT order —
    // work in sort-order space (c = d·key, d = +1 asc / -1 desc): there,
    // "n preceding" is always c_cur - n and unbounded-preceding is -Inf.
    const d = cfg.dir === "asc" ? 1 : -1;
    const cur = d * key(at(i));
    const sRaw =
      cfg.start === "unbounded-preceding" ? -Infinity : cfg.start === "n-preceding" ? cur - cfg.startN : cur;
    const eRaw =
      cfg.end === "unbounded-following" ? Infinity : cfg.end === "n-following" ? cur + cfg.endN : cur;
    members = [];
    for (let p = lo0; p <= hi0; p++) {
      const c = d * key(at(p));
      if (c >= sRaw && c <= eRaw) members.push(p);
    }
  } else {
    // groups — peer-group indices in sort order
    const groupOf = new Map<number, number>();
    let g = -1;
    let prev: number | null = null;
    for (let p = lo0; p <= hi0; p++) {
      const k = key(at(p));
      if (prev === null || k !== prev) g++;
      groupOf.set(p, g);
      prev = k;
    }
    const G = g + 1;
    const gi = groupOf.get(i) as number;
    const s =
      cfg.start === "unbounded-preceding" ? 0 : cfg.start === "n-preceding" ? gi - cfg.startN : gi;
    const e =
      cfg.end === "unbounded-following" ? G - 1 : cfg.end === "n-following" ? gi + cfg.endN : gi;
    const cs = Math.max(s, 0);
    const ce = Math.min(e, G - 1);
    members = [];
    for (let p = lo0; p <= hi0; p++) {
      const pg = groupOf.get(p) as number;
      if (pg >= cs && pg <= ce) members.push(p);
    }
    if (s > e) members = [];
  }

  return applyExclude(members, rows, i, cfg, key);
}

/** EXCLUDE CURRENT ROW / GROUP / TIES — post-pass on the raw frame. */
function applyExclude(
  members: number[],
  rows: FrameRow[],
  i: number,
  cfg: FrameConfig,
  key: OrderKey,
): number[] {
  if (cfg.frameMode === "default" || cfg.exclude === "no-others") {
    return members; // EXCLUDE belongs to the frame clause; default mode ships none
  }
  const cur = key(rows[i]);
  switch (cfg.exclude) {
    case "current-row":
      return members.filter((p) => p !== i);
    case "group":
      return members.filter((p) => key(rows[p]) !== cur);
    case "ties":
      return members.filter((p) => p === i || key(rows[p]) !== cur);
    default:
      return members;
  }
}

// ---- aggregates (validator ground-truth helper) ----------------------------

export function aggregateOver(
  members: number[],
  rows: FrameRow[],
  fn: FrameFn,
): number | null {
  if (fn === "first" || fn === "last") {
    if (members.length === 0) return null;
    const pos = fn === "first" ? Math.min(...members) : Math.max(...members);
    return rows[pos].sales;
  }
  const vals = members.map((p) => rows[p].sales);
  if (fn === "count") return vals.length; // COUNT over an empty frame is 0, not NULL
  if (vals.length === 0) return null;
  switch (fn) {
    case "sum":
      return vals.reduce((a, b) => a + b, 0);
    case "avg":
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    case "min":
      return Math.min(...vals);
    case "max":
      return Math.max(...vals);
  }
}

// ---- SQL rendering ---------------------------------------------------------

const FN_SQL: Record<FrameFn, string> = {
  sum: "SUM(sales)",
  avg: "AVG(sales)",
  count: "COUNT(*)",
  min: "MIN(sales)",
  max: "MAX(sales)",
  first: "FIRST_VALUE(sales)",
  last: "LAST_VALUE(sales)",
};

const BOUND_SQL: Record<BoundKind, (n: number) => string> = {
  "unbounded-preceding": () => "UNBOUNDED PRECEDING",
  "n-preceding": (n) => `${n} PRECEDING`,
  "current-row": () => "CURRENT ROW",
  "n-following": (n) => `${n} FOLLOWING`,
  "unbounded-following": () => "UNBOUNDED FOLLOWING",
};

const EXCLUDE_SQL: Record<ExcludeMode, string> = {
  "no-others": "EXCLUDE NO OTHERS",
  "current-row": "EXCLUDE CURRENT ROW",
  group: "EXCLUDE GROUP",
  ties: "EXCLUDE TIES",
};

/** The exact statement the view sends — and the validator replays. */
export function buildSql(cfg: FrameConfig): string {
  const values = FRAME_DATASET.map((r) => `  (${r.day}, '${r.region}', ${r.sales})`).join(",\n");
  const over: string[] = [];
  if (cfg.partition) over.push("PARTITION BY region");
  over.push(`ORDER BY ${cfg.orderCol} ${cfg.dir.toUpperCase()}`);
  if (cfg.frameMode === "custom") {
    over.push(
      `${cfg.unit.toUpperCase()} BETWEEN ${BOUND_SQL[cfg.start](cfg.startN)} AND ${BOUND_SQL[cfg.end](cfg.endN)}`,
    );
    if (cfg.exclude !== "no-others") over.push(EXCLUDE_SQL[cfg.exclude]);
  }
  return [
    "WITH days(day, region, sales) AS (VALUES",
    values,
    ")",
    "SELECT",
    "  day, region, sales,",
    `  ${FN_SQL[cfg.fn]} OVER (`,
    ...over.map((line) => `    ${line}`),
    "  ) AS window_value",
    "FROM days;",
  ].join("\n");
}

// ---- display helpers -------------------------------------------------------

/** Sentence for the current frame, in playground vocabulary. */
export function frameSentence(cfg: FrameConfig): string {
  if (cfg.frameMode === "default") return `default frame — silently ${DEFAULT_FRAME_SENTENCE}`;
  const body = `${cfg.unit.toUpperCase()} BETWEEN ${BOUND_SQL[cfg.start](cfg.startN)} AND ${BOUND_SQL[cfg.end](cfg.endN)}`;
  return cfg.exclude === "no-others" ? body : `${body} ${EXCLUDE_SQL[cfg.exclude]}`;
}

/** SQLite prints floats with full precision — round for the big readout. */
export function formatValue(v: number | null): string {
  if (v === null) return "NULL";
  if (Number.isInteger(v)) return v.toLocaleString("en-US");
  return Number(v.toFixed(2)).toLocaleString("en-US", { maximumFractionDigits: 2 });
}
