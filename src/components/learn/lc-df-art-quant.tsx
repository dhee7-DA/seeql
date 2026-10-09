"use client";

// Data & Finance art — Quant Desk family: one real-life concept diagram per
// problem primer + the section study flow ("from trades to risk numbers").

const C = {
  emerald: "#34d399", sky: "#38bdf8", violet: "#a78bfa", amber: "#fbbf24",
  rose: "#fb7185", zinc: "#a1a1aa", dim: "#52525b", lime: "#a3e635",
  fuchsia: "#e879f9", orange: "#fb923c", blue: "#60a5fa", cyan: "#22d3ee",
};
const MONO = "ui-monospace, SFMono-Regular, monospace";

function Box({ x, y, w, h, label, color, fillOpacity = 0.1, fs = 11.5, fw = 700 }: { x: number; y: number; w: number; h: number; label: string; color: string; fillOpacity?: number; fs?: number; fw?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={8} fill={color} fillOpacity={fillOpacity} stroke={color} strokeOpacity={0.55} />
      <text x={x + w / 2} y={y + h / 2 + fs * 0.35} textAnchor="middle" fontFamily={MONO} fontSize={fs} fontWeight={fw} fill={color}>{label}</text>
    </g>
  );
}

function Tag({ x, y, label, color, anchor = "middle" }: { x: number; y: number; label: string; color: string; anchor?: "middle" | "start" | "end" }) {
  const w = label.length * 5.9 + 14;
  const x0 = anchor === "middle" ? x - w / 2 : anchor === "start" ? x : x - w;
  return (
    <g>
      <rect x={x0} y={y - 10} width={w} height={20} rx={10} fill="#09090b" stroke={color} strokeOpacity={0.5} />
      <text x={x0 + w / 2} y={y + 3.5} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fill={color}>{label}</text>
    </g>
  );
}

function Arrow({ d, color, dashed = false, marker = "arw-dfq", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
  return (
    <path d={d} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dashed ? "4 3" : undefined} markerEnd={`url(#${marker})`} opacity={0.9} />
  );
}

function Note({ x, y, label, color = C.zinc, size = 10, anchor = "middle", weight = 400 }: { x: number; y: number; label: string; color?: string; size?: number; anchor?: "middle" | "start" | "end"; weight?: number }) {
  return <text x={x} y={y} textAnchor={anchor} fontFamily={MONO} fontSize={size} fontWeight={weight} fill={color}>{label}</text>;
}

function Defs({ id }: { id: string }) {
  return (
    <defs>
      <marker id={id} viewBox="0 0 8 8" refX={7} refY={4} markerWidth={6.5} markerHeight={6.5} orient="auto-start-reverse">
        <path d="M0,0 L8,4 L0,8 z" fill={C.zinc} />
      </marker>
    </defs>
  );
}

/* ------------------------------------------------------------------ */
/* 8043 time-weighted-return — the value line with flow breaks         */
/* ------------------------------------------------------------------ */

export function ArtTimeWeightedReturn() {
  const x0 = 84, x1 = 540, y0 = 44, y1 = 150;
  const mx = (d: number) => x0 + ((d - 1) / 29) * (x1 - x0); // Sept 1..30
  const my = (v: number) => y1 - ((v - 90000) / 30000) * (y1 - y0); // 90k..120k
  // schematic value path: 100000 → 109500 (d8) → 100000 (d18) → 108000 (d30)
  const path = `M ${mx(1)} ${my(100000)} C ${mx(4)} ${my(104000)}, ${mx(6)} ${my(107000)}, ${mx(8)} ${my(109500)} C ${mx(12)} ${my(106000)}, ${mx(15)} ${my(102000)}, ${mx(18)} ${my(100000)} C ${mx(22)} ${my(102000)}, ${mx(26)} ${my(105500)}, ${mx(30)} ${my(108000)}`;
  return (
    <g>
      <Defs id="arw-dfq-1" />
      <line x1={x0} y1={y0 - 8} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[90000, 100000, 110000, 120000].map((v) => (
        <g key={v}>
          <line x1={x0} y1={my(v)} x2={x1} y2={my(v)} stroke={C.dim} strokeOpacity={0.2} strokeDasharray="2 4" />
          <Note x={x0 - 8} y={my(v) + 3.5} label={`${v / 1000}k`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {[1, 8, 18, 30].map((d) => <Note key={d} x={mx(d)} y={y1 + 14} label={`09-${String(d).padStart(2, "0")}`} size={8.5} color={C.dim} />)}
      {/* the value line */}
      <path d={path} fill="none" stroke={C.sky} strokeWidth={2.4} />
      {/* flow markers */}
      <g>
        <Arrow d={`M ${mx(8)} ${y1 + 2} L ${mx(8)} ${my(109500) - 8}`} color={C.emerald} sw={2} marker="arw-dfq-1" />
        <Tag x={mx(8)} y={my(109500) - 22} label="+10,000 deposit (that morning)" color={C.emerald} />
      </g>
      <g>
        <Arrow d={`M ${mx(18)} ${my(100000) - 10} L ${mx(18)} ${y1 - 2}`} color={C.orange} sw={2} marker="arw-dfq-1" />
        <Tag x={mx(18)} y={my(100000) - 24} label="−5,000 withdrawal" color={C.orange} />
      </g>
      {/* sub-period brackets */}
      {[[1, 8, "r₁ = 9.5%", C.emerald], [8, 18, "r₂ = 95.89%", C.amber], [18, 30, "r₃ = 8.0%", C.violet]].map(([a, b, label, color], i) => (
        <g key={i}>
          <line x1={mx(a as number)} y1={y1 + 26} x2={mx(b as number)} y2={y1 + 26} stroke={color as string} strokeWidth={1.4} />
          <line x1={mx(a as number)} y1={y1 + 22} x2={mx(a as number)} y2={y1 + 30} stroke={color as string} strokeWidth={1.4} />
          <line x1={mx(b as number)} y1={y1 + 22} x2={mx(b as number)} y2={y1 + 30} stroke={color as string} strokeWidth={1.4} />
          <Note x={(mx(a as number) + mx(b as number)) / 2} y={y1 + 42} label={label as string} size={9.5} color={color as string} weight={700} />
        </g>
      ))}
      {/* the point */}
      <rect x={590} y={54} width={240} height={96} rx={8} fill={C.rose} fillOpacity={0.06} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={606} y={76} label="the deposit is NOT return:" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={606} y={94} label="naive (V₁−V₀)/V₀ reads −8.68%" size={9.5} anchor="start" color={C.zinc} />
      <Note x={606} y={110} label="true r₂ = (V₂ − F₂)/V₁ =" size={9.5} anchor="start" color={C.emerald} />
      <Note x={606} y={126} label="(100,000 + 5,000)/109,500" size={9.5} anchor="start" color={C.emerald} />
      <Note x={606} y={142} label="= 95.89% — the withdrawal" size={9.5} anchor="start" color={C.emerald} />
      <Note x={820} y={158} label="" size={9.5} anchor="end" color={C.zinc} />
      <Note x={430} y={202} label="chain (1+r₁)(1+r₂)(1+r₃) − 1 and deposit timing disappears" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8044 sharpe-ratio — mean over bumpiness                             */
/* ------------------------------------------------------------------ */

export function ArtSharpeRatio() {
  const cx = 280, baseY = 150, amp = 74, sigma = 40;
  const pts: string[] = [];
  for (let x = cx - 120; x <= cx + 120; x += 5) {
    const t = (x - cx) / sigma;
    pts.push(`${x === cx - 120 ? "M" : "L"} ${x} ${(baseY - amp * Math.exp(-0.5 * t * t)).toFixed(1)}`);
  }
  return (
    <g>
      <Defs id="arw-dfq-2" />
      <line x1={130} y1={baseY} x2={560} y2={baseY} stroke={C.dim} strokeWidth={1.2} />
      <path d={pts.join(" ")} fill={C.sky} fillOpacity={0.08} stroke={C.sky} strokeWidth={2} />
      {/* mean excess */}
      <line x1={cx} y1={baseY} x2={cx} y2={baseY - amp * 0.6} stroke={C.emerald} strokeWidth={1.6} />
      <Note x={cx} y={baseY + 14} label="mean excess" size={9} color={C.emerald} />
      <Note x={cx} y={baseY + 26} label="(return − 4/252)" size={8.5} color={C.emerald} />
      {/* sigma spread */}
      <path d={`M ${cx} ${baseY - amp * 0.24} C ${cx + 20} ${baseY - amp * 0.3}, ${cx + 34} ${baseY - amp * 0.14}, ${cx + 40} ${baseY - 2}`} fill="none" stroke={C.amber} strokeWidth={2} />
      <Note x={cx + 62} y={baseY - 26} label="σ daily vol" size={9.5} color={C.amber} weight={700} />
      {/* formula */}
      <Box x={600} y={48} w={228} h={56} label="Sharpe = mean(excess) / σ" color={C.lime} fillOpacity={0.08} fs={11.5} />
      <Note x={714} y={122} label="bigger return, smaller bumps" size={9.5} color={C.zinc} />
      <Note x={714} y={138} label="→ bigger number" size={9.5} color={C.zinc} />
      {/* the wrong paths */}
      <Tag x={664} y={166} label="no risk-free subtract → 0.0588 not 0.043" color={C.rose} />
      <Tag x={664} y={190} label="annualize ×252 → 15× too big" color={C.rose} />
      <Note x={280} y={202} label="population σ: sqrt(avg(x²) − avg(x)²) — SQLite's sqrt() does the heavy lifting" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8045 value-at-risk — the left tail                                  */
/* ------------------------------------------------------------------ */

export function ArtValueAtRisk() {
  const cx = 430, baseY = 150, amp = 80, sigma = 52;
  const pts: string[] = [];
  for (let x = cx - 200; x <= cx + 240; x += 5) {
    const t = (x - cx) / sigma;
    pts.push(`${x === cx - 200 ? "M" : "L"} ${x} ${(baseY - amp * Math.exp(-0.5 * t * t)).toFixed(1)}`);
  }
  const tailX = cx - 1.645 * sigma; // schematic 5% mark
  return (
    <g>
      <Defs id="arw-dfq-3" />
      <line x1={cx - 220} y1={baseY} x2={cx + 260} y2={baseY} stroke={C.dim} strokeWidth={1.2} />
      <path d={pts.join(" ")} fill={C.sky} fillOpacity={0.07} stroke={C.sky} strokeWidth={2} />
      {/* shaded left tail (worst 5%) */}
      <path d={`M ${cx - 200} ${baseY} L ${tailX} ${baseY} L ${tailX} ${baseY - amp * Math.exp(-0.5 * ((tailX - cx) / sigma) ** 2)} C ${cx - 180} ${baseY - 8}, ${cx - 195} ${baseY - 3}, ${cx - 200} ${baseY} Z`} fill={C.rose} fillOpacity={0.22} stroke="none" />
      <line x1={tailX} y1={40} x2={tailX} y2={baseY} stroke={C.rose} strokeWidth={1.5} strokeDasharray="5 4" />
      <Tag x={tailX} y={32} label="VaR95 = the 5th-worst return" color={C.rose} />
      <Note x={tailX - 10} y={baseY + 16} label="worst 5% of days" size={9} anchor="end" color={C.rose} />
      {/* ranks on the tail */}
      {[["#1", -3.19], ["#2", -2.6], ["#3", -2.2], ["#4", -1.72], ["#5", -1.31]].map(([rank, v], i) => (
        <g key={rank as string}>
          <circle cx={cx - (170 - i * 22)} cy={baseY - 10 - (i === 0 ? 8 : i * 4)} r={3.5} fill={i < 5 ? C.rose : C.zinc} />
          <Note x={cx - (170 - i * 22)} y={baseY + 30 + (i % 2) * 12} label={`${rank} ${String(v)}%`} size={7.5} color={i < 5 ? C.rose : C.zinc} />
        </g>
      ))}
      <Note x={cx + 60} y={70} label="the other 95 days live here" size={9.5} color={C.sky} />
      {/* read */}
      <rect x={620} y={96} width={212} height={62} rx={8} fill={C.rose} fillOpacity={0.06} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={636} y={118} label="var95_pct  −1.3056" size={10} anchor="start" color={C.rose} weight={700} />
      <Note x={636} y={136} label="signed: a LOSS prints negative" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={202} label="ROW_NUMBER over returns ascending, pick rn = 5 — rn=4 is the off-by-one every candidate makes" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8046 beta-benchmark — the scatter                                   */
/* ------------------------------------------------------------------ */

export function ArtBetaBenchmark() {
  const x0 = 90, x1 = 520, y0 = 40, y1 = 156; // x: benchmark, y: asset
  const px = (b: number) => x0 + ((b + 2) / 4) * (x1 - x0);
  const py = (a: number) => y1 - ((a + 2.4) / 5.6) * (y1 - y0);
  const dots: Array<[number, number]> = [
    [-1.6, -2.05], [-1.2, -1.72], [-0.8, -1.24], [-0.4, -0.55], [0.0, -0.12],
    [0.4, 0.52], [0.8, 1.02], [1.2, 1.66], [1.6, 2.3], [-1.0, -1.5],
    [0.2, 0.18], [-0.6, -0.92], [1.0, 1.4], [-1.4, -2.0], [0.6, 0.8],
  ];
  const line = (slope: number) => `M ${px(-2)} ${py(-2 * slope + 0.05)} L ${px(2)} ${py(2 * slope + 0.05)}`;
  return (
    <g>
      <Defs id="arw-dfq-4" />
      <line x1={x0} y1={y0 - 4} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <Note x={(x0 + x1) / 2} y={y1 + 22} label="benchmark return %" size={9.5} color={C.zinc} />
      <Note x={58} y={(y0 + y1) / 2} label="asset" size={9.5} color={C.zinc} />
      {/* market line (slope 1) */}
      <path d={line(1)} fill="none" stroke={C.dim} strokeWidth={1.3} strokeDasharray="4 4" />
      <Note x={px(1.55)} y={py(1.45) - 8} label="β = 1 — moves with the market" size={8.5} color={C.dim} />
      {/* fitted line slope 1.43 */}
      <path d={line(1.43)} fill="none" stroke={C.rose} strokeWidth={2.2} />
      {dots.map(([b, a], i) => <circle key={i} cx={px(b)} cy={py(a)} r={3.4} fill={C.sky} fillOpacity={0.85} />)}
      <Tag x={px(-1.2)} y={py(1.9)} label="β ≈ 1.43 — aggressive" color={C.rose} />
      {/* read */}
      <rect x={580} y={50} width={252} height={100} rx={8} fill={C.rose} fillOpacity={0.06} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={596} y={72} label="beta = cov(asset, bench) / var(bench)" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={596} y={92} label="> 1.05 aggressive · < 0.95 defensive" size={9.5} anchor="start" color={C.zinc} />
      <Note x={596} y={110} label="correlation is NOT beta — it" size={9.5} anchor="start" color={C.amber} />
      <Note x={596} y={126} label="reads 0.997 here while beta" size={9.5} anchor="start" color={C.amber} />
      <Note x={596} y={142} label="reads 1.4289" size={9.5} anchor="start" color={C.amber} />
      <Note x={430} y={202} label="a ratio of sums: (n·Σxy − ΣxΣy) / (n·Σyy − Σy²) — one SELECT, no windows" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8047 split-adjusted-position — the cliff                            */
/* ------------------------------------------------------------------ */

export function ArtSplitAdjustedPosition() {
  const x0 = 90, x1 = 560, y0 = 40, y1 = 150;
  const mx = (d: number) => x0 + ((d - 1) / 30) * (x1 - x0);
  const myRaw = (p: number) => y1 - ((p - 8000) / 14000) * (y1 - y0);
  const raw = `M ${mx(2)} ${myRaw(20000)} L ${mx(13)} ${myRaw(19500)} L ${mx(14.5)} ${myRaw(10200)} L ${mx(22)} ${myRaw(10400)} L ${mx(29)} ${myRaw(10800)}`;
  const adj = `M ${mx(2)} ${myRaw(10000)} L ${mx(13)} ${myRaw(9750)} L ${mx(14.5)} ${myRaw(10200)} L ${mx(22)} ${myRaw(10400)} L ${mx(29)} ${myRaw(10800)}`;
  return (
    <g>
      <Defs id="arw-dfq-5" />
      <line x1={x0} y1={y0 - 4} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[10000, 15000, 20000].map((p) => (
        <g key={p}>
          <line x1={x0} y1={myRaw(p)} x2={x1} y2={myRaw(p)} stroke={C.dim} strokeOpacity={0.2} strokeDasharray="2 4" />
          <Note x={x0 - 8} y={myRaw(p) + 3.5} label={`${p / 100}`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {/* the split wall */}
      <line x1={mx(15)} y1={y0 - 6} x2={mx(15)} y2={y1} stroke={C.fuchsia} strokeWidth={1.6} strokeDasharray="5 4" />
      <Tag x={mx(15)} y={y0 - 12} label="2026-09-15 · 2-for-1 split" color={C.fuchsia} />
      {/* raw vs adjusted */}
      <path d={raw} fill="none" stroke={C.rose} strokeWidth={2} strokeDasharray="6 3" />
      <path d={adj} fill="none" stroke={C.emerald} strokeWidth={2.4} />
      <Tag x={mx(8)} y={myRaw(20000) - 16} label="raw chart — fake 50% crash" color={C.rose} />
      <Tag x={mx(9)} y={myRaw(10000) + 22} label="adjusted — one continuous story" color={C.emerald} />
      {/* shares note */}
      <rect x={610} y={54} width={222} height={96} rx={8} fill={C.emerald} fillOpacity={0.06} stroke={C.emerald} strokeOpacity={0.35} />
      <Note x={626} y={76} label="buy 100 @ 20,000 ¢ pre-split" size={9.5} anchor="start" color={C.zinc} />
      <Note x={626} y={94} label="→ 200 shares @ 10,000 ¢" size={9.5} anchor="start" color={C.emerald} weight={700} />
      <Note x={626} y={112} label="same 2,000,000 ¢ of value" size={9.5} anchor="start" color={C.zinc} />
      <Note x={626} y={130} label="shares ×2, price ÷2 —" size={9.5} anchor="start" color={C.zinc} />
      <Note x={626} y={146} label="never both ways" size={9.5} anchor="start" color={C.rose} />
      <Note x={430} y={202} label="only trades BEFORE the split date adjust — and only the split's own symbol" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8048 wash-trade-detection — the round trip                          */
/* ------------------------------------------------------------------ */

export function ArtWashTradeDetection() {
  const x0 = 84, x1 = 780, ay = 118;
  const mx = (s: number) => x0 + (s / 5400) * (x1 - x0); // seconds window
  return (
    <g>
      <Defs id="arw-dfq-6" />
      <line x1={x0} y1={ay + 22} x2={x1} y2={ay + 22} stroke={C.dim} strokeWidth={1.2} />
      {[0, 1800, 3600, 5400].map((s) => (
        <g key={s}>
          <line x1={mx(s)} y1={ay + 18} x2={mx(s)} y2={ay + 26} stroke={C.dim} strokeWidth={1.2} />
          <Note x={mx(s)} y={ay + 40} label={`${s}s`} size={8.5} color={C.dim} />
        </g>
      ))}
      {/* the wash window */}
      <rect x={x0} y={ay - 34} width={mx(3600) - x0} height={50} rx={6} fill={C.rose} fillOpacity={0.07} stroke={C.rose} strokeOpacity={0.4} />
      <Note x={(x0 + mx(3600)) / 2} y={ay - 44} label="the 3600-second wash window — a buy and its sell inside here" size={9.5} color={C.rose} />
      {/* pair 1: 1s flat */}
      <circle cx={mx(60)} cy={ay - 12} r={5.5} fill={C.emerald} />
      <circle cx={mx(61)} cy={ay - 12} r={5.5} fill={C.rose} />
      <Arrow d={`M ${mx(66)} ${ay - 12} L ${mx(56)} ${ay - 12}`} color={C.zinc} sw={1.4} marker="arw-dfq-6" />
      <Tag x={mx(60)} y={ay + 62} label="1s apart · 0.0% — same price" color={C.emerald} />
      {/* pair 2: 600s +0.5% */}
      <circle cx={mx(600)} cy={ay - 12} r={5.5} fill={C.emerald} />
      <circle cx={mx(1200)} cy={ay - 12} r={5.5} fill={C.rose} />
      <path d={`M ${mx(610)} ${ay - 12} C ${mx(800)} ${ay - 46}, ${mx(1000)} ${ay - 46}, ${mx(1190)} ${ay - 12}`} fill="none" stroke={C.amber} strokeWidth={1.6} markerEnd="url(#arw-dfq-6)" />
      <Tag x={mx(900)} y={ay - 56} label="600s · +0.5% round trip" color={C.amber} />
      {/* the boundary pair */}
      <circle cx={mx(3540)} cy={ay - 12} r={5.5} fill={C.emerald} />
      <circle cx={mx(3600)} cy={ay - 12} r={5.5} fill={C.rose} />
      <Tag x={mx(3600)} y={ay + 62} label="exactly 3600s — still a pair (inclusive)" color={C.rose} />
      {/* excluded long hold */}
      <circle cx={mx(4500)} cy={ay - 12} r={5.5} fill={C.emerald} />
      <circle cx={mx(5300)} cy={ay - 12} r={5.5} fill={C.rose} />
      <Note x={mx(4900)} y={ay - 20} label="3-day hold — no flag" size={8.5} color={C.dim} />
      <Note x={430} y={202} label="self-join buy→sell on account + symbol + quantity; earliest sell wins when two match" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — from trades to risk numbers                            */
/* ------------------------------------------------------------------ */

export function ArtStudyTradesToRisk() {
  return (
    <g>
      <Defs id="arw-dfq-s1" />
      <Box x={40} y={116} w={140} h={52} label="Trades" color={C.sky} fillOpacity={0.12} fs={12} />
      <Box x={236} y={116} w={150} h={52} label="Positions" color={C.violet} fillOpacity={0.12} fs={12} />
      <Box x={442} y={116} w={150} h={52} label="Valuations" color={C.blue} fillOpacity={0.12} fs={12} />
      <Box x={648} y={116} w={150} h={52} label="Returns" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Arrow d="M 182 142 L 232 142" color={C.zinc} marker="arw-dfq-s1" />
      <Arrow d="M 388 142 L 438 142" color={C.zinc} marker="arw-dfq-s1" />
      <Arrow d="M 594 142 L 644 142" color={C.zinc} marker="arw-dfq-s1" />
      <Tag x={207} y={96} label="splits adjust here" color={C.fuchsia} />
      <Tag x={413} y={96} label="EOD marks" color={C.blue} />
      {/* metric cards */}
      <Box x={120} y={216} w={130} h={44} label="TWR" color={C.emerald} fillOpacity={0.1} fs={11.5} />
      <Box x={296} y={216} w={130} h={44} label="Sharpe" color={C.lime} fillOpacity={0.1} fs={11.5} />
      <Box x={472} y={216} w={130} h={44} label="VaR 95" color={C.rose} fillOpacity={0.1} fs={11.5} />
      <Box x={648} y={216} w={130} h={44} label="Beta" color={C.amber} fillOpacity={0.1} fs={11.5} />
      <Arrow d="M 700 170 C 700 196, 560 212, 540 222" color={C.zinc} marker="arw-dfq-s1" />
      <Note x={430} y={206} label="one returns series, four questions" size={9.5} color={C.zinc} />
      {/* who reads what */}
      <rect x={40} y={30} width={190} height={70} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={54} y={50} label="the desk" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={54} y={68} label="· fund accountant: NAV, TWR" size={9} anchor="start" color={C.emerald} />
      <Note x={54} y={84} label="· risk analyst: VaR, beta" size={9} anchor="start" color={C.rose} />
      <Note x={54} y={98} label="· surveillance: wash pairs" size={9} anchor="start" color={C.amber} />
      <Note x={430} y={292} label="Quant Desk problems walk this chain — trade to metric, with the trap at every joint" size={10} color={C.zinc} />
    </g>
  );
}
