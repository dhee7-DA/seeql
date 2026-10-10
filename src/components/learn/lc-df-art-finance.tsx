"use client";

// Data & Finance art — Finance Core family: one real-life concept diagram per
// problem primer + the section study flow ("from contracts to numbers").
// Same pastel language as lc-df-art-bank.tsx: dark panel, mono labels,
// palette C below mirrors that file's constants.

const C = {
  emerald: "#34d399", sky: "#38bdf8", violet: "#a78bfa", amber: "#fbbf24",
  rose: "#fb7185", zinc: "#a1a1aa", dim: "#52525b", lime: "#a3e635",
  fuchsia: "#e879f9", orange: "#fb923c", blue: "#60a5fa", cyan: "#22d3ee",
};
const MONO = "ui-monospace, SFMono-Regular, monospace";
const W = 860;
const HP = 210; // primer height

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

function Arrow({ d, color, dashed = false, marker = "arw-dfn", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* loan-amortization-schedule — the falling balance stair              */
/* ------------------------------------------------------------------ */

export function ArtLoanAmortizationSchedule() {
  const x0 = 64, x1 = 430, y0 = 38, y1 = 158;
  const my = (bal: number) => y1 - (bal / 12000) * (y1 - y0);
  // 12,000 loan · 12% APR · 6 × 2,035 payments → balance after each month
  const stair = "M 64 38 L 125 38 L 125 57.2 L 186 57.2 L 186 76.5 L 247 76.5 L 247 96 L 308 96 L 308 115.8 L 369 115.8 L 369 135.7 L 430 135.7 L 430 158";
  const drops: Array<[number, number]> = [[125, 57.2], [186, 76.5], [247, 96], [308, 115.8], [369, 135.7], [430, 158]];
  return (
    <g>
      <Defs id="arw-dfn-1" />
      {/* axes */}
      <line x1={x0} y1={y0 - 6} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[0, 4000, 8000, 12000].map((b) => (
        <g key={b}>
          <line x1={x0} y1={my(b)} x2={x1} y2={my(b)} stroke={C.dim} strokeOpacity={0.22} strokeDasharray="2 4" />
          <Note x={x0 - 8} y={my(b) + 3.5} label={b === 0 ? "0" : `${b / 1000}k`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {[1, 2, 3, 4, 5, 6].map((m) => <Note key={m} x={x0 + (m * (x1 - x0)) / 6} y={172} label={`${m}`} size={9} color={C.dim} />)}
      <Note x={247} y={188} label="month" size={9.5} color={C.zinc} />
      <Note x={28} y={92} label="balance" size={9.5} color={C.zinc} />
      {/* the falling stair */}
      <path d={`${stair} L 430 158 L 64 158 Z`} fill={C.emerald} fillOpacity={0.05} stroke="none" />
      <path d={stair} fill="none" stroke={C.emerald} strokeWidth={2.2} />
      {drops.map(([dx, dy], i) => <circle key={i} cx={dx} cy={dy} r={i === 0 ? 3.4 : 2.4} fill={i === 0 ? C.amber : C.emerald} />)}
      {/* one payment, exploded: interest slice over principal slice */}
      <path d="M 129 52 C 260 40, 380 44, 500 62" fill="none" stroke={C.amber} strokeWidth={1.3} strokeDasharray="4 3" />
      <Tag x={528} y={46} label="month-1 payment, split" color={C.amber} />
      <rect x={506} y={58} width={44} height={16} rx={3} fill={C.amber} fillOpacity={0.4} stroke={C.amber} strokeOpacity={0.7} />
      <rect x={506} y={74} width={44} height={84} rx={3} fill={C.sky} fillOpacity={0.16} stroke={C.sky} strokeOpacity={0.6} />
      <Note x={528} y={69} label="120 ¢" size={8.5} color={C.amber} weight={700} />
      <Note x={528} y={112} label="1,915 ¢" size={10} color={C.sky} weight={700} />
      <Note x={528} y={127} label="principal" size={8.5} color={C.sky} />
      {/* payment bracket */}
      <path d="M 552 58 L 558 58 L 558 158 L 552 158" fill="none" stroke={C.zinc} strokeWidth={1.3} />
      <Note x={568} y={106} label="payment" size={9.5} anchor="start" color={C.zinc} />
      <Note x={568} y={121} label="2,035 ¢" size={10.5} anchor="start" color={C.zinc} weight={700} />
      {/* the formula panel */}
      <rect x={652} y={96} width={190} height={54} rx={8} fill={C.violet} fillOpacity={0.06} stroke={C.violet} strokeOpacity={0.35} />
      <Note x={666} y={112} label="the monthly split" size={9} anchor="start" color={C.violet} weight={700} />
      <Note x={666} y={129} label="interest = rate/12 × balance" size={9.5} anchor="start" color={C.amber} />
      <Note x={666} y={145} label="principal = payment − interest" size={9.5} anchor="start" color={C.sky} />
      <Note x={430} y={202} label="every payment is identical — only the split moves: interest falls, principal rises" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* delinquency-buckets — the DPD aging clock                           */
/* ------------------------------------------------------------------ */

export function ArtDelinquencyBuckets() {
  const buckets = ["current", "dpd 1-30", "dpd 31-60", "dpd 61-90", "dpd 90+"];
  const colors = [C.emerald, C.lime, C.amber, C.orange, C.rose];
  const bw = 132, bh = 40, step = 150;
  const x0 = 40;
  return (
    <g>
      <Defs id="arw-dfn-2" />
      <Tag x={106} y={34} label="on time stays current" color={C.emerald} />
      <Tag x={280} y={34} label="→ ages one cycle per missed payment" color={C.rose} />
      {/* the descending stair of buckets */}
      {buckets.map((b, i) => (
        <Box key={b} x={x0 + i * step} y={52 + i * 20} w={bw} h={bh} label={b} color={colors[i]} fillOpacity={0.12} />
      ))}
      <Note x={706} y={186} label="loss window" size={9} color={C.dim} />
      {/* aging arrows — each one steps down and right */}
      {buckets.slice(0, -1).map((b, i) => (
        <Arrow key={`a${b}`} d={`M ${x0 + i * step + bw + 2} ${72 + i * 20} L ${x0 + (i + 1) * step - 2} ${92 + i * 20}`} color={C.rose} sw={2} marker="arw-dfn-2" />
      ))}
      {/* cure — one arrow climbing back left */}
      <path d="M 250 112 C 220 150, 130 142, 100 98" fill="none" stroke={C.emerald} strokeWidth={2} markerEnd="url(#arw-dfn-2)" opacity={0.9} />
      <Tag x={150} y={158} label="cure — pays up" color={C.emerald} />
      {/* default — off the right edge */}
      <Arrow d="M 774 152 L 848 172" color={C.rose} sw={2.2} marker="arw-dfn-2" />
      <Tag x={786} y={142} label="default" color={C.rose} anchor="start" />
      <Note x={410} y={176} label="dpd = today − oldest unpaid due date" size={9.5} color={C.zinc} />
      <Note x={430} y={202} label="oldest unpaid installment rules the bucket — max(dpd) per loan picks the bucket" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* portfolio-weights — your slice of the pie                           */
/* ------------------------------------------------------------------ */

export function ArtPortfolioWeights() {
  // donut: center (150,108) R 64 / r 34 · 40/30/20/10 from the top, clockwise
  const slices: Array<[string, string]> = [
    ["M 150 44 A 64 64 0 0 1 187.6 159.8 L 170 135.5 A 34 34 0 0 0 150 74 Z", C.emerald],
    ["M 187.6 159.8 A 64 64 0 0 1 89.1 127.8 L 117.7 118.5 A 34 34 0 0 0 170 135.5 Z", C.sky],
    ["M 89.1 127.8 A 64 64 0 0 1 112.4 56.2 L 130 80.5 A 34 34 0 0 0 117.7 118.5 Z", C.amber],
    ["M 112.4 56.2 A 64 64 0 0 1 150 44 L 150 74 A 34 34 0 0 0 130 80.5 Z", C.violet],
  ];
  const rows: Array<[string, number, string]> = [
    ["equities", 40, C.emerald], ["bonds", 30, C.sky], ["cash", 20, C.amber], ["alts", 10, C.violet],
  ];
  return (
    <g>
      <Defs id="arw-dfn-3" />
      {/* the pie */}
      {slices.map(([d, color], i) => (
        <path key={i} d={d} fill={color} fillOpacity={0.16} stroke={color} strokeOpacity={0.7} strokeWidth={1.4} />
      ))}
      <Note x={150} y={104} label="the book" size={10} color={C.zinc} weight={700} />
      <Note x={150} y={118} label="4 positions" size={8.5} color={C.dim} />
      {/* slice labels with leaders */}
      <path d="M 214 86 L 244 72" fill="none" stroke={C.emerald} strokeWidth={1} strokeOpacity={0.6} />
      <Note x={248} y={76} label="equities 40%" size={10.5} anchor="start" color={C.emerald} weight={700} />
      <path d="M 128 172 L 116 186" fill="none" stroke={C.sky} strokeWidth={1} strokeOpacity={0.6} />
      <Note x={112} y={194} label="bonds 30%" size={10.5} color={C.sky} weight={700} />
      <path d="M 84 86 L 66 78" fill="none" stroke={C.amber} strokeWidth={1} strokeOpacity={0.6} />
      <Note x={62} y={74} label="cash 20%" size={10.5} anchor="end" color={C.amber} weight={700} />
      <path d="M 130 42 L 130 34" fill="none" stroke={C.violet} strokeWidth={1} strokeOpacity={0.6} />
      <Note x={130} y={26} label="alts 10%" size={10.5} color={C.violet} weight={700} />
      {/* the same weights as bars */}
      {rows.map(([name, pct, color], i) => {
        const y = 44 + i * 38;
        return (
          <g key={name}>
            <Note x={540} y={y + 17} label={name} size={10.5} anchor="end" color={color} weight={700} />
            <rect x={550} y={y} width={(pct / 40) * 240} height={26} rx={6} fill={color} fillOpacity={0.16} stroke={color} strokeOpacity={0.55} />
            <Note x={550 + (pct / 40) * 240 + 10} y={y + 17} label={`${pct}%`} size={10} anchor="start" color={color} weight={700} />
          </g>
        );
      })}
      {/* one shared denominator bracket */}
      <path d="M 830 40 L 838 40 L 838 184 L 830 184" fill="none" stroke={C.zinc} strokeWidth={1.3} />
      <Note x={838} y={30} label="total" size={9.5} color={C.zinc} weight={700} />
      <Note x={838} y={198} label="100%" size={9} color={C.dim} />
      <Note x={430} y={202} label="weights always sum to 100% — after any trade, every slice renormalizes" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* settlement-fails-aging — T+2 and the fail clock                     */
/* ------------------------------------------------------------------ */

export function ArtSettlementFailsAging() {
  return (
    <g>
      <Defs id="arw-dfn-4" />
      {/* the day rail */}
      <Arrow d="M 56 84 L 508 84" color={C.dim} sw={1.6} marker="arw-dfn-4" />
      {[120, 260, 400].map((tx) => <line key={tx} x1={tx} y1={78} x2={tx} y2={90} stroke={C.dim} strokeWidth={1.2} />)}
      <Note x={120} y={104} label="T" size={10} color={C.zinc} weight={700} />
      <Note x={120} y={120} label="trade date" size={8.5} color={C.dim} />
      <Note x={260} y={104} label="T+1" size={10} color={C.zinc} weight={700} />
      <Note x={400} y={104} label="T+2" size={10} color={C.zinc} weight={700} />
      <Note x={400} y={120} label="promise date" size={8.5} color={C.dim} />
      {/* the gate */}
      <line x1={514} y1={54} x2={514} y2={114} stroke={C.zinc} strokeWidth={2} strokeOpacity={0.7} />
      <line x1={526} y1={54} x2={526} y2={114} stroke={C.zinc} strokeWidth={2} strokeOpacity={0.7} />
      <Tag x={520} y={40} label="settlement gate — T+2" color={C.cyan} />
      {/* trades walking the rail */}
      <Tag x={150} y={64} label="trade a" color={C.sky} />
      <Tag x={290} y={64} label="trade b" color={C.sky} />
      <Tag x={470} y={64} label="trade c" color={C.sky} />
      <circle cx={150} cy={84} r={4.5} fill={C.sky} fillOpacity={0.8} />
      <circle cx={290} cy={84} r={4.5} fill={C.sky} fillOpacity={0.8} />
      <circle cx={470} cy={84} r={4.5} fill={C.sky} fillOpacity={0.8} />
      {/* through the gate → green */}
      <Arrow d="M 528 84 L 640 84" color={C.emerald} sw={2} marker="arw-dfn-4" />
      <Note x={586} y={70} label="delivered →" size={9} anchor="start" color={C.emerald} />
      <Box x={648} y={64} w={150} h={40} label="settled" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Note x={723} y={120} label="delivery vs payment, done" size={9} color={C.dim} />
      {/* the one that misses → the fail clock */}
      <path d="M 474 90 C 500 130, 560 150, 588 158" fill="none" stroke={C.rose} strokeWidth={1.6} strokeDasharray="4 3" markerEnd="url(#arw-dfn-4)" opacity={0.9} />
      <Tag x={672} y={134} label="fail — missed the gate" color={C.rose} />
      <rect x={580} y={153} width={70} height={16} rx={4} fill={C.rose} fillOpacity={0.06} stroke={C.rose} strokeOpacity={0.4} />
      <rect x={650} y={153} width={80} height={16} rx={4} fill={C.rose} fillOpacity={0.12} stroke={C.rose} strokeOpacity={0.4} />
      <rect x={730} y={153} width={110} height={16} rx={4} fill={C.rose} fillOpacity={0.18} stroke={C.rose} strokeOpacity={0.4} />
      <Note x={615} y={165} label="1-3d" size={9} color={C.rose} />
      <Note x={690} y={165} label="4-7d" size={9} color={C.rose} />
      <Note x={785} y={165} label="8+ d" size={9} color={C.rose} weight={700} />
      <circle cx={592} cy={161} r={5} fill={C.rose} fillOpacity={0.6} />
      <Note x={588} y={146} label="days late" size={9} anchor="start" color={C.rose} />
      <Note x={838} y={146} label="worse →" size={9} anchor="end" color={C.rose} />
      <Tag x={785} y={190} label="buy-in risk" color={C.rose} />
      {/* read-out */}
      <rect x={48} y={136} width={200} height={56} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={62} y={154} label="fail = delivery missed" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={62} y={170} label="aging starts at T+2" size={9} anchor="start" color={C.zinc} />
      <Note x={62} y={186} label="buy-in: broker must source" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={202} label="T+2 is a promise date — the fail clock only starts when delivery doesn't happen" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* realized-pnl-average-cost — the average-cost ledger                 */
/* ------------------------------------------------------------------ */

export function ArtRealizedPnlAverageCost() {
  return (
    <g>
      <Defs id="arw-dfn-5" />
      {/* price rail */}
      <line x1={748} y1={32} x2={748} y2={172} stroke={C.dim} strokeWidth={1.2} />
      {[44, 62, 98, 134].map((ty) => <line key={ty} x1={742} y1={ty} x2={754} y2={ty} stroke={C.dim} strokeWidth={1.2} />)}
      <Note x={736} y={48} label="$15" size={10} anchor="end" color={C.rose} weight={700} />
      <Note x={736} y={66} label="$14" size={10} anchor="end" color={C.violet} />
      <Note x={736} y={102} label="$12" size={10} anchor="end" color={C.emerald} weight={700} />
      <Note x={736} y={138} label="$10" size={10} anchor="end" color={C.sky} />
      <Note x={748} y={190} label="price / share" size={9} color={C.dim} />
      {/* the two buy lots at their own prices */}
      <Note x={191} y={34} label="two lots in, one average out" size={9.5} color={C.zinc} />
      <rect x={96} y={121} width={190} height={26} rx={6} fill={C.sky} fillOpacity={0.14} stroke={C.sky} strokeOpacity={0.55} />
      <Note x={191} y={138} label="buy 100 @ $10" size={10} color={C.sky} weight={700} />
      <rect x={96} y={49} width={190} height={26} rx={6} fill={C.violet} fillOpacity={0.14} stroke={C.violet} strokeOpacity={0.55} />
      <Note x={191} y={66} label="buy 100 @ $14" size={10} color={C.violet} weight={700} />
      {/* pooling into one average */}
      <Arrow d="M 288 64 C 320 64, 322 88, 348 94" color={C.violet} marker="arw-dfn-5" />
      <Arrow d="M 288 132 C 320 132, 322 110, 348 102" color={C.sky} marker="arw-dfn-5" />
      <Box x={352} y={78} w={170} h={40} label="avg cost $12.00" color={C.emerald} fillOpacity={0.12} />
      <Note x={420} y={152} label="(100·$10 + 100·$14) ÷ 200 = $12" size={9} color={C.zinc} />
      <line x1={524} y1={98} x2={742} y2={98} stroke={C.emerald} strokeWidth={1.2} strokeDasharray="3 4" strokeOpacity={0.6} />
      {/* the sell at market */}
      <Tag x={560} y={30} label="sell 100 @ $15 mkt" color={C.rose} />
      <path d="M 505 74 C 570 46, 640 40, 738 44" fill="none" stroke={C.rose} strokeWidth={1.8} strokeDasharray="5 4" markerEnd="url(#arw-dfn-5)" opacity={0.9} />
      {/* realized P&L bracket */}
      <path d="M 700 44 L 692 44 L 692 98 L 700 98" fill="none" stroke={C.rose} strokeWidth={1.4} />
      <Note x={684} y={64} label="realized +$3 / sh" size={9.5} anchor="end" color={C.rose} weight={700} />
      <Note x={684} y={80} label="+$300 on 100 sh" size={9} anchor="end" color={C.zinc} />
      <Note x={430} y={202} label="a sell never moves the average — realized P&L = (market − avg) × shares sold" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* gl-reconciliation — two books, one truth                            */
/* ------------------------------------------------------------------ */

export function ArtGlReconciliation() {
  const gx = 140, sx = 500, rw = 180, rh = 20;
  const rows: Array<[number, string, string, string]> = [
    [66, "cr 4,200", "inv 101 · 4,200", "match"],
    [90, "cr 3,980", "inv 103 · 3,980", "match"],
    [114, "", "inv 104 · 1,110", "sub-only"],
    [138, "cr 980 · ×2", "", "gl-only"],
    [162, "cr 1,040", "inv 105 · 1,040", "match"],
  ];
  return (
    <g>
      <Defs id="arw-dfn-6" />
      <Note x={84} y={36} label="two books," size={10} color={C.zinc} weight={700} />
      <Note x={84} y={50} label="one truth" size={10} color={C.zinc} weight={700} />
      <Box x={gx} y={24} w={rw} h={30} label="GL — control" color={C.sky} fillOpacity={0.1} fs={11} />
      <Box x={sx} y={24} w={rw} h={30} label="sub-ledger — detail" color={C.violet} fillOpacity={0.1} fs={11} />
      <Note x={410} y={62} label="row by row" size={9} color={C.dim} />
      {rows.map(([y, gl, sub, kind]) => {
        const cy = y + rh / 2;
        return (
          <g key={y}>
            {gl ? (
              <g>
                <rect x={gx} y={y} width={rw} height={rh} rx={4} fill={kind === "gl-only" ? C.amber : C.zinc} fillOpacity={kind === "gl-only" ? 0.12 : 0.06} stroke={kind === "gl-only" ? C.amber : C.dim} strokeOpacity={0.55} />
                <Note x={gx + rw / 2} y={cy + 3.5} label={gl} size={9.5} color={kind === "gl-only" ? C.amber : C.zinc} weight={kind === "gl-only" ? 700 : 400} />
              </g>
            ) : (
              <rect x={gx} y={y} width={rw} height={rh} rx={4} fill="none" stroke={C.dim} strokeDasharray="3 3" />
            )}
            {sub ? (
              <g>
                <rect x={sx} y={y} width={rw} height={rh} rx={4} fill={kind === "sub-only" ? C.rose : C.zinc} fillOpacity={kind === "sub-only" ? 0.12 : 0.06} stroke={kind === "sub-only" ? C.rose : C.dim} strokeOpacity={0.55} />
                <Note x={sx + rw / 2} y={cy + 3.5} label={sub} size={9.5} color={kind === "sub-only" ? C.rose : C.zinc} weight={kind === "sub-only" ? 700 : 400} />
              </g>
            ) : (
              <rect x={sx} y={y} width={rw} height={rh} rx={4} fill="none" stroke={C.dim} strokeDasharray="3 3" />
            )}
            {kind === "match" ? (
              <g>
                <line x1={326} y1={cy} x2={494} y2={cy} stroke={C.dim} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.4} />
                <Note x={410} y={cy + 3.5} label="✓" size={9} color={C.emerald} />
              </g>
            ) : kind === "sub-only" ? (
              <Arrow d={`M 496 ${cy} L 324 ${cy}`} color={C.rose} dashed sw={1.4} marker="arw-dfn-6" />
            ) : (
              <Arrow d={`M 324 ${cy} L 496 ${cy}`} color={C.amber} dashed sw={1.4} marker="arw-dfn-6" />
            )}
          </g>
        );
      })}
      <Note x={692} y={131} label="← missing in GL" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={128} y={155} label="double-counted →" size={9.5} anchor="end" color={C.amber} weight={700} />
      {/* the delta badge */}
      <rect x={330} y={188} width={200} height={20} rx={8} fill={C.emerald} fillOpacity={0.07} stroke={C.emerald} strokeOpacity={0.45} />
      <Note x={430} y={202} label="Δ = 0 when clean" size={10} color={C.emerald} weight={700} />
      <Note x={690} y={202} label="totals can agree while rows disagree" size={9} color={C.dim} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — from contracts to numbers                              */
/* ------------------------------------------------------------------ */

export function ArtStudyMoneyPipeline() {
  const gates: Array<[number, string]> = [
    [378, "amortization"], [474, "DPD buckets"], [555, "weights"],
    [637, "fails aging"], [732, "realized P&L"], [819, "GL recon"],
  ];
  return (
    <g>
      <Defs id="arw-dfn-s1" />
      {/* the four stages */}
      <Tag x={100} y={34} label="the promise" color={C.sky} />
      <Box x={32} y={48} w={136} h={52} label="Contracts" color={C.sky} fillOpacity={0.12} fs={12.5} />
      <Note x={100} y={93} label="loan · trade — signed" size={8.5} color={C.dim} />
      <Tag x={276} y={34} label="the record" color={C.violet} />
      <Box x={208} y={48} w={136} h={52} label="Service" color={C.violet} fillOpacity={0.12} fs={12.5} />
      <Note x={276} y={93} label="payments · positions" size={8.5} color={C.dim} />
      <Tag x={479} y={34} label="the math" color={C.amber} />
      <Box x={384} y={48} w={190} h={52} label="Measure" color={C.amber} fillOpacity={0.12} fs={12.5} />
      <Note x={479} y={93} label="activity → numbers" size={8.5} color={C.dim} />
      <Tag x={684} y={34} label="the check" color={C.cyan} />
      <Box x={614} y={48} w={140} h={52} label="Reconcile" color={C.cyan} fillOpacity={0.12} fs={12.5} />
      <Note x={684} y={93} label="GL vs sub-ledger" size={8.5} color={C.dim} />
      {/* hand-offs */}
      <Arrow d="M 170 74 L 204 74" color={C.zinc} marker="arw-dfn-s1" />
      <Note x={188} y={66} label="sign" size={8.5} color={C.dim} />
      <Arrow d="M 346 74 L 380 74" color={C.zinc} marker="arw-dfn-s1" />
      <Note x={364} y={66} label="events" size={8.5} color={C.dim} />
      <Arrow d="M 576 74 L 610 74" color={C.zinc} marker="arw-dfn-s1" />
      <Note x={594} y={66} label="ledgers" size={8.5} color={C.dim} />
      {/* the gate rail — six doors, one per problem */}
      <path d="M 479 102 L 479 148" fill="none" stroke={C.amber} strokeWidth={1.4} strokeDasharray="4 3" />
      <path d="M 372 150 L 822 150" fill="none" stroke={C.amber} strokeWidth={1.2} strokeDasharray="4 3" strokeOpacity={0.7} />
      <Note x={585} y={142} label="the six gates" size={9} color={C.amber} weight={700} />
      {gates.map(([cx, label], i) => (
        <g key={label}>
          <line x1={cx} y1={150} x2={cx} y2={156} stroke={C.amber} strokeWidth={1.2} />
          <circle cx={cx} cy={164} r={8} fill="#09090b" stroke={C.amber} strokeWidth={1.4} />
          <text x={cx} y={167.5} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={700} fill={C.amber}>{i + 1}</text>
          <Tag x={cx} y={182} label={label} color={C.amber} />
        </g>
      ))}
      {/* report — the numbers go out */}
      <Arrow d="M 704 102 C 698 150, 726 182, 752 212" color={C.emerald} sw={1.8} marker="arw-dfn-s1" />
      <Tag x={800} y={132} label="numbers out" color={C.emerald} />
      <Box x={700} y={216} w={140} h={44} label="Report" color={C.emerald} fillOpacity={0.12} fs={12.5} />
      <Note x={770} y={276} label="investors · risk · finance" size={9} color={C.dim} />
      {/* who owns each gate */}
      <rect x={32} y={208} width={262} height={86} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={46} y={224} label="who owns each gate" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={46} y={237} label="· servicer: amortization" size={9} anchor="start" color={C.violet} />
      <Note x={46} y={248} label="· collections: DPD buckets" size={9} anchor="start" color={C.lime} />
      <Note x={46} y={259} label="· portfolio desk: weights" size={9} anchor="start" color={C.emerald} />
      <Note x={46} y={270} label="· settlements: fails aging" size={9} anchor="start" color={C.orange} />
      <Note x={46} y={281} label="· trading desk: realized P&L" size={9} anchor="start" color={C.sky} />
      <Note x={46} y={292} label="· controllers: GL recon" size={9} anchor="start" color={C.cyan} />
      {/* the read */}
      <Note x={490} y={240} label="every problem in Finance Core reads one door of this pipe" size={10} color={C.zinc} />
      <Note x={490} y={258} label="contracts → service → measure → reconcile → report" size={9} color={C.dim} />
      <Note x={490} y={284} label="measure is where the pipeline gets its numbers — reconcile proves them" size={10} color={C.zinc} />
    </g>
  );
}

export const FINANCE_ART_W = W;
export const FINANCE_ART_H = HP;
