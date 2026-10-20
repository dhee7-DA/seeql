"use client";

// Pattern diagram — one small "shape of the query" SVG per problem, keyed by
// the problem's skill section (12 archetypes cover all 73 sections) and
// personalized with the problem's real table/column names parsed from the
// DDL. Same pastel language as the highlighter: the learner sees WHICH
// family of SQL a problem lives in before reading a word.

import { useMemo } from "react";
import { parseDdl } from "./lc-diagrams";

type Arch =
  | "filter"
  | "join"
  | "agg"
  | "rank"
  | "window"
  | "subquery"
  | "recursive"
  | "islands"
  | "timeline"
  | "ledger"
  | "graph"
  | "pivot";

const ARCH_BY_SECTION: Record<string, Arch> = {
  select: "filter", "select-2": "filter", "advanced-select": "filter", strings: "filter",
  "free-formats": "filter", "free-classics": "filter", "hackerrank-2": "filter",
  "hackerrank-3": "filter", datalemur: "filter", "datalemur-2": "filter",
  "platform-classics": "filter", "premium-warmups": "filter", "premium3-stats": "filter",
  "premium3-ops": "filter", "premium4-city": "filter", "premium3-commerce": "filter",
  joins: "join", "extra-joins": "join", "self-non-equi": "join", matchups: "join",
  "free-pairs": "join",
  aggregation: "agg", "extra-aggregation": "agg", engagement: "agg",
  "analytics-funnels": "agg", "premium-content": "agg",
  grouping: "rank", "hard-finales": "rank", "premium-finales": "rank",
  "premium2-finals": "rank", "premium3-finales": "rank", "premium5-finales": "rank",
  "premium5-league": "rank", "premium3-arena": "rank",
  "windows-2": "window", "free-windows": "window", "premium2-rankings": "window",
  "premium4-boards": "window",
  subqueries: "subquery",
  "free-org": "recursive",
  streaks: "islands", "premium4-streaks": "islands", "premium5-system": "islands",
  "extra-dates": "timeline", "premium-time": "timeline", "premium2-users": "timeline",
  "premium5-trends": "timeline", "premium4-social": "timeline", "premium2-games": "timeline",
  "premium4-flow": "timeline",
  "premium-money": "ledger", "premium4-money": "ledger", "premium2-market": "ledger",
  "premium5-market": "ledger", "premium2-orders": "ledger",
  "premium-community": "graph", "premium5-graph": "graph",
  "extra-pivots": "pivot", "premium3-mold": "pivot",
  // Data & Finance track
  "df-product-analytics": "agg", "df-growth-experiments": "timeline",
  "df-finance-core": "ledger", "df-markets-risk": "ledger",
  "df-banking-credit": "timeline", "df-fraud-aml": "graph",
  "df-accounting-close": "ledger", "df-quant-desk": "window",
};

const ARCH_LABEL: Record<Arch, string> = {
  filter: "pattern · filter & project",
  join: "pattern · join two tables",
  agg: "pattern · collapse rows into groups",
  rank: "pattern · rank & order",
  window: "pattern · window over peers",
  subquery: "pattern · query inside a query",
  recursive: "pattern · walk a hierarchy",
  islands: "pattern · gaps & islands",
  timeline: "pattern · bucket time",
  ledger: "pattern · running totals",
  graph: "pattern · follow the edges",
  pivot: "pattern · reshape the grid",
};

/* palette — mirrors the pastel clause families */
const C = {
  emerald: "#34d399", sky: "#38bdf8", violet: "#a78bfa", amber: "#fbbf24",
  rose: "#fb7185", zinc: "#a1a1aa", dim: "#52525b", lime: "#a3e635",
  fuchsia: "#e879f9", orange: "#fb923c", blue: "#60a5fa",
};
const MONO = "ui-monospace, SFMono-Regular, monospace";
const W = 860;
const H = 196;

function Box({ x, y, w, h, label, color, fillOpacity = 0.1 }: { x: number; y: number; w: number; h: number; label: string; color: string; fillOpacity?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={color} fillOpacity={fillOpacity} stroke={color} strokeOpacity={0.55} />
      <text x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle" fontFamily={MONO} fontSize={11.5} fontWeight={700} fill={color}>
        {label}
      </text>
    </g>
  );
}

function Tag({ x, y, label, color }: { x: number; y: number; label: string; color: string }) {
  const w = label.length * 6.4 + 16;
  return (
    <g>
      <rect x={x - w / 2} y={y - 10} width={w} height={20} rx={10} fill="#09090b" stroke={color} strokeOpacity={0.5} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={color}>
        {label}
      </text>
    </g>
  );
}

function Arrow({ d, color, dashed = false }: { d: string; color: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeDasharray={dashed ? "4 3" : undefined}
      markerEnd="url(#lc-pd-arrow)"
      opacity={0.9}
    />
  );
}

function CellRow({ x, y, n, color, dead = false }: { x: number; y: number; n: number; color: string; dead?: boolean }) {
  return (
    <g opacity={dead ? 0.28 : 1}>
      {Array.from({ length: n }).map((_, i) => (
        <rect key={i} x={x + i * 22} y={y} width={18} height={11} rx={2.5} fill={dead ? C.dim : color} fillOpacity={dead ? 0.5 : 0.75} />
      ))}
    </g>
  );
}

function Strike({ x1, x2, y }: { x1: number; x2: number; y: number }) {
  return <line x1={x1} x2={x2} y1={y} y2={y} stroke={C.rose} strokeWidth={1.4} opacity={0.8} />;
}

/* ------------------------------------------------------------------ */
/* the twelve archetypes                                               */
/* ------------------------------------------------------------------ */

function FilterArch({ t1 }: Names) {
  return (
    <g>
      <text x={44} y={30} fontFamily={MONO} fontSize={11.5} fontWeight={700} fill={C.blue}>{t1}</text>
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <CellRow x={44} y={40 + i * 18} n={3} color={C.blue} dead={i === 1 || i === 3} />
          {(i === 1 || i === 3) && <Strike x1={42} x2={104} y={45.5 + i * 18} />}
        </g>
      ))}
      <Arrow d={`M 168 86 L 236 86`} color={C.rose} />
      <Tag x={202} y={70} label="WHERE" color={C.rose} />
      <Box x={244} y={56} w={26} h={60} label="⧗" color={C.rose} fillOpacity={0.06} />
      <Arrow d={`M 278 86 L 346 86`} color={C.emerald} />
      <Tag x={312} y={70} label="SELECT" color={C.violet} />
      <Box x={354} y={38} w={130} h={72} label="result" color={C.emerald} />
      <CellRow x={368} y={64} n={3} color={C.emerald} />
      <CellRow x={368} y={82} n={3} color={C.emerald} />
      <Tag x={560} y={86} label="rows in → rows out, shape preserved" color={C.zinc} />
    </g>
  );
}

function JoinArch({ t1, t2, joinKey }: Names) {
  return (
    <g>
      <Box x={40} y={30} w={140} h={44} label={t1} color={C.blue} />
      <Box x={330} y={30} w={140} h={44} label={t2} color={C.violet} />
      <CellRow x={54} y={82} n={4} color={C.blue} />
      <CellRow x={344} y={82} n={4} color={C.violet} />
      <Arrow d={`M 186 52 L 322 52`} color={C.amber} dashed />
      <Tag x={254} y={38} label={`ON ${joinKey}`} color={C.amber} />
      <Arrow d={`M 254 96 C 254 122, 254 122, 254 128`} color={C.emerald} />
      <text x={140} y={144} fontFamily={MONO} fontSize={10} fontWeight={700} fill={C.emerald}>matched rows + carried columns</text>
      <rect x={120} y={152} width={270} height={34} rx={8} fill={C.emerald} fillOpacity={0.07} stroke={C.emerald} strokeOpacity={0.35} />
      <CellRow x={136} y={163} n={6} color={C.emerald} />
      <Tag x={560} y={52} label="one output row per match" color={C.zinc} />
    </g>
  );
}

function AggArch({ t1 }: Names) {
  return (
    <g>
      <Box x={30} y={26} w={110} h={128} label={t1} color={C.blue} />
      {[0, 1, 2, 3, 4].map((i) => (
        <CellRow key={i} x={42} y={46 + i * 21} n={2} color={C.blue} />
      ))}
      {[0, 1, 2].map((i) => (
        <Arrow key={i} d={`M 146 90 C 190 90, 196 ${52 + i * 38}, 240 ${52 + i * 38}`} color={C.amber} />
      ))}
      {[0, 1, 2].map((i) => (
        <g key={`g${i}`}>
          <circle cx={262} cy={52 + i * 38} r={14} fill={C.amber} fillOpacity={0.12} stroke={C.amber} strokeOpacity={0.6} />
          <text x={262} y={56 + i * 38} textAnchor="middle" fontFamily={MONO} fontSize={11} fontWeight={700} fill={C.amber}>
            Σ
          </text>
        </g>
      ))}
      <Arrow d={`M 282 90 L 330 90`} color={C.emerald} />
      <Tag x={306} y={74} label="GROUP BY" color={C.amber} />
      {[46, 40, 30].map((h, i) => (
        <rect key={i} x={340 + i * 34} y={120 - h} width={24} height={h} rx={4} fill={C.emerald} fillOpacity={0.75} />
      ))}
      <Tag x={470} y={90} label="many rows → one per group" color={C.zinc} />
    </g>
  );
}

function RankArch({ t1 }: Names) {
  return (
    <g>
      <Box x={40} y={40} w={150} h={100} label={t1} color={C.blue} />
      <CellRow x={54} y={66} n={3} color={C.blue} />
      <CellRow x={54} y={86} n={3} color={C.blue} />
      <CellRow x={54} y={106} n={3} color={C.blue} />
      <Arrow d={`M 198 90 L 268 90`} color={C.orange} />
      <Tag x={233} y={74} label="ORDER BY" color={C.orange} />
      {[40, 62, 84].map((top, i) => (
        <g key={i}>
          <rect x={300 + i * 92} y={top} width={56} height={140 - top} rx={6} fill={i === 0 ? C.amber : C.sky} fillOpacity={i === 0 ? 0.3 : 0.16} stroke={i === 0 ? C.amber : C.sky} strokeOpacity={0.5} />
          <text x={328 + i * 92} y={top + 22} textAnchor="middle" fontFamily={MONO} fontSize={13} fontWeight={800} fill={i === 0 ? C.amber : C.sky}>
            {i + 1}
          </text>
        </g>
      ))}
      <Tag x={560} y={90} label="sorted — and ties get a rule" color={C.zinc} />
    </g>
  );
}

function WindowArch({ t1 }: Names) {
  return (
    <g>
      <Box x={40} y={26} w={150} h={130} label={t1} color={C.blue} />
      {[0, 1, 2, 3].map((i) => (
        <CellRow key={i} x={54} y={52 + i * 26} n={3} color={C.blue} />
      ))}
      <rect x={252} y={62} width={120} height={44} rx={6} fill={C.sky} fillOpacity={0.1} stroke={C.sky} strokeOpacity={0.6} strokeDasharray="4 3" />
      <text x={312} y={88} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={C.sky}>
        frame · peers
      </text>
      {[0, 1, 2, 3].map((i) => (
        <CellRow key={i} x={410} y={52 + i * 26} n={3} color={C.zinc} />
      ))}
      <Arrow d={`M 226 78 C 240 78, 240 84, 250 84`} color={C.sky} />
      <Arrow d={`M 416 65 C 396 56, 380 56, 372 62`} color={C.violet} />
      <text x={388} y={48} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={C.violet}>LAG</text>
      <Arrow d={`M 470 84 C 490 92, 500 92, 516 86`} color={C.orange} />
      <text x={496} y={106} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={C.orange}>LEAD</text>
      <Tag x={610} y={90} label="rows stay — values look around" color={C.zinc} />
    </g>
  );
}

function SubqueryArch({ t1 }: Names) {
  return (
    <g>
      <Box x={50} y={30} w={300} h={130} label="" color={C.sky} fillOpacity={0.05} />
      <text x={66} y={52} fontFamily={MONO} fontSize={10} fontWeight={700} fill={C.sky}>outer query</text>
      <Box x={90} y={64} w={220} h={72} label="inner query — runs first" color={C.fuchsia} fillOpacity={0.09} />
      <Arrow d={`M 200 100 C 240 100, 260 100, 300 100`} color={C.fuchsia} />
      <Tag x={420} y={100} label="produces a value / list" color={C.fuchsia} />
      <Arrow d={`M 350 60 C 400 40, 430 40, 470 56`} color={C.sky} />
      <Tag x={560} y={40} label="outer filters against the inner result" color={C.zinc} />
      <Box x={470} y={72} w={120} h={52} label={t1} color={C.blue} />
    </g>
  );
}

function RecursiveArch({ t1 }: Names) {
  return (
    <g>
      <Box x={60} y={34} w={170} h={44} label={`${t1} (anchor)`} color={C.emerald} />
      <circle cx={145} cy={130} r={13} fill={C.violet} fillOpacity={0.15} stroke={C.violet} strokeOpacity={0.6} />
      <circle cx={255} cy={130} r={13} fill={C.violet} fillOpacity={0.15} stroke={C.violet} strokeOpacity={0.6} />
      <circle cx={365} cy={130} r={13} fill={C.violet} fillOpacity={0.15} stroke={C.violet} strokeOpacity={0.6} />
      <Arrow d={`M 145 78 C 145 104, 145 104, 145 115`} color={C.violet} />
      <Arrow d={`M 160 128 C 200 106, 214 106, 242 124`} color={C.violet} />
      <Arrow d={`M 270 128 C 310 106, 324 106, 352 124`} color={C.violet} />
      <path d="M 158 138 C 190 166, 120 166, 133 142" fill="none" stroke={C.amber} strokeWidth={1.5} strokeDasharray="4 3" markerEnd="url(#lc-pd-arrow)" />
      <Tag x={254} y={90} label="UNION ALL — one level per pass" color={C.violet} />
      <Tag x={480} y={140} label="each row walks to its children" color={C.zinc} />
    </g>
  );
}

function IslandsArch({ t1 }: Names) {
  return (
    <g>
      <text x={40} y={64} fontFamily={MONO} fontSize={10.5} fill={C.zinc}>{t1}</text>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={130 + i * 30} y={78} width={26} height={22} rx={4} fill={C.emerald} fillOpacity={0.75} />
      ))}
      {[0, 1].map((i) => (
        <rect key={`g${i}`} x={220 + i * 30} y={78} width={26} height={22} rx={4} fill="none" stroke={C.rose} strokeOpacity={0.7} strokeDasharray="3 2" />
      ))}
      {[0, 1].map((i) => (
        <rect key={`r${i}`} x={280 + i * 30} y={78} width={26} height={22} rx={4} fill={C.emerald} fillOpacity={0.75} />
      ))}
      <rect x={345} y={78} width={26} height={22} rx={4} fill="none" stroke={C.rose} strokeOpacity={0.7} strokeDasharray="3 2" />
      <Tag x={214} y={118} label="run 1" color={C.emerald} />
      <Tag x={250} y={140} label="gap = boundary" color={C.rose} />
      <Tag x={310} y={118} label="run 2" color={C.emerald} />
      <Arrow d={`M 420 89 L 480 89`} color={C.sky} />
      <Tag x={560} y={89} label="number the runs, keep the group" color={C.zinc} />
    </g>
  );
}

function TimelineArch({ t1 }: Names) {
  return (
    <g>
      {Array.from({ length: 8 }).map((_, i) => (
        <g key={i}>
          <rect x={60 + i * 44} y={56} width={34} height={26} rx={5} fill={i === 2 || i === 5 ? C.amber : C.sky} fillOpacity={i === 2 || i === 5 ? 0.3 : 0.12} stroke={i === 2 || i === 5 ? C.amber : C.sky} strokeOpacity={0.5} />
          <text x={77 + i * 44} y={72} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={C.zinc}>
            {`d${i + 1}`}
          </text>
        </g>
      ))}
      <Arrow d={`M 160 90 C 160 116, 200 116, 210 122`} color={C.amber} />
      <Arrow d={`M 292 90 C 292 116, 260 116, 252 122`} color={C.sky} />
      <Box x={160} y={126} w={104} h={36} label="week / month" color={C.sky} fillOpacity={0.07} />
      <Box x={288} y={126} w={104} h={36} label="bucket 2" color={C.amber} fillOpacity={0.07} />
      <Tag x={480} y={90} label={`${t1} rows land in date buckets`} color={C.zinc} />
    </g>
  );
}

function LedgerArch({ t1 }: Names) {
  return (
    <g>
      <text x={40} y={52} fontFamily={MONO} fontSize={10.5} fill={C.zinc}>{t1}</text>
      <line x1={44} y1={140} x2={380} y2={140} stroke={C.dim} strokeWidth={1} />
      <polyline
        points="52,126 100,118 148,124 196,96 244,102 292,72 340,64 372,70"
        fill="none"
        stroke={C.emerald}
        strokeWidth={2}
      />
      {[[52, 126], [196, 96], [292, 72], [372, 70]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={3.2} fill={C.emerald} />
      ))}
      <Arrow d={`M 420 100 L 470 100`} color={C.emerald} />
      <Tag x={530} y={100} label="SUM() OVER (ORDER BY …) — carry the past forward" color={C.zinc} />
    </g>
  );
}

function GraphArch({ t1 }: Names) {
  const nodes: Array<[number, number, string]> = [
    [110, 60, "a"], [250, 50, "b"], [380, 90, "c"], [180, 130, "d"], [320, 140, "e"],
  ];
  const edges: Array<[number, number]> = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 3]];
  return (
    <g>
      <text x={40} y={30} fontFamily={MONO} fontSize={10.5} fill={C.zinc}>{t1}</text>
      {edges.map(([a, b], i) => {
        const [x1, y1] = nodes[a];
        const [x2, y2] = nodes[b];
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={i === 1 || i === 5 ? C.amber : C.dim} strokeWidth={i === 1 || i === 5 ? 1.8 : 1.2} />;
      })}
      {nodes.map(([x, y, label], i) => (
        <g key={label}>
          <circle cx={x} cy={y} r={14} fill={C.blue} fillOpacity={0.14} stroke={C.blue} strokeOpacity={0.6} />
          <text x={x} y={y + 4} textAnchor="middle" fontFamily={MONO} fontSize={10} fill={C.blue}>{label}</text>
        </g>
      ))}
      <Tag x={540} y={90} label="rows are edges — follow paths, count hops" color={C.zinc} />
    </g>
  );
}

function PivotArch({ t1 }: Names) {
  return (
    <g>
      <text x={40} y={40} fontFamily={MONO} fontSize={10.5} fill={C.zinc}>{t1}</text>
      {[0, 1].map((r) =>
        [0, 1, 2].map((c) => (
          <rect key={`a${r}${c}`} x={80 + c * 34} y={56 + r * 24} width={28} height={18} rx={3} fill={C.blue} fillOpacity={0.16} stroke={C.blue} strokeOpacity={0.4} />
        )),
      )}
      <Arrow d={`M 200 86 C 240 86, 250 86, 286 86`} color={C.lime} />
      <Tag x={244} y={70} label="CASE / rotate" color={C.lime} />
      {[0, 1, 2].map((c) =>
        [0, 1].map((r) => (
          <rect key={`b${r}${c}`} x={300 + c * 70} y={56 + r * 24} width={60} height={18} rx={3} fill={C.lime} fillOpacity={0.14} stroke={C.lime} strokeOpacity={0.45} />
        )),
      )}
      <Tag x={520} y={86} label="long rows → wide columns" color={C.zinc} />
    </g>
  );
}

interface Names {
  t1: string;
  t2: string;
  joinKey: string;
  arch: Arch;
}

export function PatternDiagram({ sectionId, ddl }: { sectionId: string; ddl: string }) {
  const names = useMemo<Names>(() => {
    const tables = parseDdl(ddl);
    const t1 = tables[0]?.name ?? "rows";
    const t2 = tables[1]?.name ?? "lookup";
    // join key: first shared column, else first FK, else "key"
    let joinKey = "key";
    const a = tables[0]?.cols ?? [];
    const b = tables[1]?.cols ?? [];
    const shared = a.find((c) => b.some((d) => d.name === c.name));
    if (shared) joinKey = shared.name;
    else {
      const fk = a.find((c) => c.fkTo === t2);
      if (fk) joinKey = `${fk.name} = id`;
    }
    return { t1, t2, joinKey, arch: ARCH_BY_SECTION[sectionId] ?? "filter" };
  }, [sectionId, ddl]);

  const body = (() => {
    switch (names.arch) {
      case "join": return <JoinArch {...names} />;
      case "agg": return <AggArch {...names} />;
      case "rank": return <RankArch {...names} />;
      case "window": return <WindowArch {...names} />;
      case "subquery": return <SubqueryArch {...names} />;
      case "recursive": return <RecursiveArch {...names} />;
      case "islands": return <IslandsArch {...names} />;
      case "timeline": return <TimelineArch {...names} />;
      case "ledger": return <LedgerArch {...names} />;
      case "graph": return <GraphArch {...names} />;
      case "pivot": return <PivotArch {...names} />;
      default: return <FilterArch {...names} />;
    }
  })();

  return (
    <div className="overflow-hidden rounded-lg border border-zinc-800/80 bg-zinc-950/60">
      <p className="border-b border-zinc-800/60 px-3 py-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-zinc-500">
        {ARCH_LABEL[names.arch]}
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ARCH_LABEL[names.arch]}>
        <defs>
          <marker id="lc-pd-arrow" viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6.5} markerHeight={6.5} orient="auto-start-reverse">
            <path d="M0,0 L8,4 L0,8 z" fill={C.zinc} />
          </marker>
        </defs>
        {body}
      </svg>
    </div>
  );
}
