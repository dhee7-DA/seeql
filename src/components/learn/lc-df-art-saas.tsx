"use client";

// Data & Finance art — SaaS & Subscriptions family.
// One REAL-LIFE concept diagram per problem primer + the section study flow
// ("the subscription loop"). Same pastel language as lc-df-art-bank.tsx /
// lc-df-art-mkts.tsx: dark panel, mono labels, palette C below, flat design.

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

function Arrow({ d, color, dashed = false, marker = "arw-dfs", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* 8049 trial-to-paid-funnel — weekly funnel + the 14-day window       */
/* ------------------------------------------------------------------ */

export function ArtTrialToPaidFunnel() {
  // three weekly funnel columns — bucket by the MONDAY of the signup week
  const groups: Array<{ wk: string; x: number; t: number; a: number; c: number }> = [
    { wk: "wk 04-06", x: 64, t: 6, a: 4, c: 3 },
    { wk: "wk 04-13", x: 202, t: 7, a: 6, c: 2 },
    { wk: "wk 04-20", x: 340, t: 5, a: 2, c: 2 },
  ];
  const bar = (v: number) => 150 - v * 12; // top y, 12px per signup
  return (
    <g>
      <Defs id="arw-dfs-1" />
      {/* legend */}
      <rect x={64} y={16} width={10} height={10} fill={C.sky} fillOpacity={0.5} />
      <Note x={78} y={24} label="trials" size={9.5} anchor="start" color={C.sky} />
      <rect x={140} y={16} width={10} height={10} fill={C.violet} fillOpacity={0.5} />
      <Note x={154} y={24} label="activated" size={9.5} anchor="start" color={C.violet} />
      <rect x={214} y={16} width={10} height={10} fill={C.emerald} fillOpacity={0.5} />
      <Note x={228} y={24} label="converted" size={9.5} anchor="start" color={C.emerald} />
      {/* the weekly bars */}
      {groups.map((g) => (
        <g key={g.wk}>
          <rect x={g.x} y={bar(g.t)} width={30} height={g.t * 12} fill={C.sky} fillOpacity={0.35} stroke={C.sky} strokeOpacity={0.6} />
          <rect x={g.x + 36} y={bar(g.a)} width={30} height={g.a * 12} fill={C.violet} fillOpacity={0.35} stroke={C.violet} strokeOpacity={0.6} />
          <rect x={g.x + 72} y={bar(g.c)} width={30} height={g.c * 12} fill={C.emerald} fillOpacity={0.35} stroke={C.emerald} strokeOpacity={0.6} />
          <Note x={g.x + 15} y={bar(g.t) - 4} label={`${g.t}`} size={9} color={C.sky} weight={700} />
          <Note x={g.x + 51} y={bar(g.a) - 4} label={`${g.a}`} size={9} color={C.violet} weight={700} />
          <Note x={g.x + 87} y={bar(g.c) - 4} label={`${g.c}`} size={9} color={C.emerald} weight={700} />
          <Note x={g.x + 51} y={164} label={g.wk} size={9.5} color={C.zinc} />
        </g>
      ))}
      <line x1={56} y1={150} x2={452} y2={150} stroke={C.dim} strokeWidth={1.2} />
      <Tag x={253} y={180} label="activation ≠ conversion" color={C.amber} />
      {/* the 14-day window */}
      <line x1={470} y1={18} x2={470} y2={178} stroke={C.dim} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.5} />
      <Tag x={560} y={30} label="the 14-day trial window" color={C.violet} />
      <rect x={520} y={106} width={193} height={28} fill={C.violet} fillOpacity={0.12} stroke={C.violet} strokeOpacity={0.4} />
      <Note x={520} y={100} label="signup" size={9} color={C.sky} />
      <circle cx={520} cy={120} r={5} fill={C.sky} />
      <line x1={520} y1={106} x2={520} y2={134} stroke={C.violet} strokeWidth={1} />
      <line x1={713} y1={106} x2={713} y2={134} stroke={C.violet} strokeWidth={1} />
      <Note x={508} y={150} label="day 0" size={9} anchor="start" color={C.dim} />
      <Note x={713} y={150} label="day 14" size={9} color={C.dim} />
      <circle cx={644} cy={120} r={5} fill={C.emerald} />
      <Tag x={644} y={86} label="day 9 · counts" color={C.emerald} />
      <circle cx={782} cy={120} r={5} fill={C.rose} />
      <Tag x={786} y={158} label="day 19 · outside" color={C.rose} />
      <Note x={665} y={178} label="days since signup" size={9} color={C.dim} />
      <Note x={676} y={190} label="activation must land inside — day 15+ never counts" size={9} color={C.dim} />
      <Note x={430} y={202} label="one denominator: both pcts divide by the week's TRIALS — a convert who never activated still counts" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8050 plan-migration-paths — the tier ladder and its three arrows    */
/* ------------------------------------------------------------------ */

export function ArtPlanMigrationPaths() {
  return (
    <g>
      <Defs id="arw-dfs-2" />
      {/* rank axis */}
      <line x1={56} y1={60} x2={56} y2={184} stroke={C.dim} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.6} />
      <Note x={50} y={80} label="r3" size={9} anchor="end" color={C.dim} />
      <Note x={50} y={126} label="r2" size={9} anchor="end" color={C.dim} />
      <Note x={50} y={172} label="r1" size={9} anchor="end" color={C.dim} />
      {/* the ladder */}
      <Box x={72} y={148} w={136} h={40} label="free · rank 1" color={C.sky} fillOpacity={0.12} />
      <Box x={268} y={102} w={136} h={40} label="pro · rank 2" color={C.violet} fillOpacity={0.12} />
      <Box x={468} y={102} w={136} h={40} label="plus · rank 2" color={C.violet} fillOpacity={0.12} />
      <Box x={664} y={56} w={136} h={40} label="business · rank 3" color={C.emerald} fillOpacity={0.12} />
      <Note x={734} y={42} label="higher tier_rank = better plan" size={9} color={C.dim} />
      {/* the three directions */}
      <Arrow d="M 210 146 C 236 140, 250 132, 262 124" color={C.emerald} sw={2} marker="arw-dfs-2" />
      <Tag x={218} y={118} label="upgrade" color={C.emerald} />
      <Arrow d="M 406 122 L 462 122" color={C.amber} sw={2} marker="arw-dfs-2" />
      <Tag x={435} y={88} label="lateral · equal rank" color={C.amber} />
      <Arrow d="M 666 98 C 646 104, 628 108, 610 112" color={C.rose} sw={2} marker="arw-dfs-2" />
      <Tag x={652} y={128} label="downgrade" color={C.rose} />
      {/* the gap convention */}
      <Tag x={600} y={180} label="03 free · 04 gone · 05 pro — still a consecutive pair" color={C.emerald} />
      <Note x={430} y={202} label="direction comes from tier_rank, not the plan name — same-rank switches are lateral, same-plan pairs emit no row" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8051 mrr-waterfall — start + new + expansion − contraction − churned */
/* ------------------------------------------------------------------ */

export function ArtMrrWaterfall() {
  const y1 = 164; // baseline
  const px = (v: number) => (v / 60000) * 100; // 1px per 600 cents
  const top = (cum: number) => y1 - px(cum);
  // cumulative walk: 42000 → 54000 → 60000 → 56000 → 48000
  const bars: Array<{ x: number; y: number; h: number; color: string }> = [
    { x: 72, y: top(42000), h: px(42000), color: C.sky },
    { x: 166, y: top(54000), h: px(12000), color: C.emerald },
    { x: 260, y: top(60000), h: px(6000), color: C.lime },
    { x: 354, y: top(60000), h: px(4000), color: C.orange },
    { x: 448, y: top(56000), h: px(8000), color: C.rose },
    { x: 552, y: top(48000), h: px(48000), color: C.violet },
  ];
  return (
    <g>
      <Defs id="arw-dfs-3" />
      <Tag x={150} y={30} label="month 2026-08 · mrr movement" color={C.sky} />
      <Note x={40} y={100} label="mrr ¢" size={9} color={C.dim} />
      <line x1={56} y1={y1} x2={640} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {/* the waterfall bars */}
      {bars.map((b, i) => (
        <rect key={i} x={b.x} y={b.y} width={64} height={b.h} fill={b.color} fillOpacity={0.35} stroke={b.color} strokeOpacity={0.6} />
      ))}
      {/* connectors at each cumulative level */}
      {[[top(42000), 136, 166], [top(54000), 230, 260], [top(60000), 324, 354], [top(56000), 418, 448], [top(48000), 512, 552]].map(([cy, a, b], i) => (
        <line key={i} x1={a} y1={cy} x2={b} y2={cy} stroke={C.dim} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.7} />
      ))}
      {/* cents labels */}
      <Note x={104} y={top(42000) - 8} label="42,000 ¢" size={10} color={C.sky} weight={700} />
      <Note x={198} y={top(54000) - 8} label="+12,000" size={10} color={C.emerald} weight={700} />
      <Note x={292} y={top(60000) - 8} label="+6,000" size={10} color={C.lime} weight={700} />
      <Note x={386} y={top(60000) - 8} label="−4,000" size={10} color={C.orange} weight={700} />
      <Note x={480} y={top(56000) - 8} label="−8,000" size={10} color={C.rose} weight={700} />
      <Note x={584} y={top(48000) - 8} label="48,000 ¢" size={10} color={C.violet} weight={700} />
      {/* movement names */}
      {["start mrr", "new", "expansion", "contraction", "churned", "ending mrr"].map((n, i) => (
        <Note key={n} x={72 + i * 94} y={180} label={n} size={9.5} color={C.zinc} />
      ))}
      {/* the two traps */}
      <rect x={660} y={44} width={180} height={118} rx={8} fill={C.violet} fillOpacity={0.06} stroke={C.violet} strokeOpacity={0.35} />
      <Note x={676} y={66} label="the two classic traps" size={9.5} anchor="start" color={C.violet} weight={700} />
      <Note x={676} y={88} label="churned = the PRIOR month's" size={9} anchor="start" color={C.zinc} />
      <Note x={676} y={102} label="mrr — the row is gone" size={9} anchor="start" color={C.zinc} />
      <Note x={676} y={124} label="expansion needs BOTH rows" size={9} anchor="start" color={C.zinc} />
      <Note x={676} y={138} label="— new customers are 'new'" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={202} label="ending = start + new + expansion − contraction − churned — every movement reads the customer's own prior row (LAG)" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8052 net-revenue-retention — the cohort bar, the ghost seat, NRR    */
/* ------------------------------------------------------------------ */

export function ArtNetRevenueRetention() {
  const y1 = 170; // baseline
  const px = (v: number) => v / 300; // 1px per 300 cents
  return (
    <g>
      <Defs id="arw-dfs-4" />
      <Note x={168} y={56} label="the M0 bar — the frozen denominator" size={9.5} color={C.violet} />
      <Note x={608} y={30} label="the M3 bar — two seats + one ghost" size={9.5} color={C.rose} />
      <line x1={100} y1={y1} x2={680} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {/* M0: x 14,000 + y 10,000 + z 6,000 = 30,000 */}
      <rect x={120} y={y1 - px(6000)} width={96} height={px(6000)} fill={C.violet} fillOpacity={0.3} stroke={C.violet} strokeOpacity={0.55} />
      <rect x={120} y={y1 - px(16000)} width={96} height={px(10000)} fill={C.sky} fillOpacity={0.3} stroke={C.sky} strokeOpacity={0.55} />
      <rect x={120} y={y1 - px(30000)} width={96} height={px(14000)} fill={C.emerald} fillOpacity={0.3} stroke={C.emerald} strokeOpacity={0.55} />
      <Note x={168} y={y1 - px(3000) + 3} label="z 6,000" size={9} color={C.violet} />
      <Note x={168} y={y1 - px(11000) + 3} label="y 10,000" size={9} color={C.sky} />
      <Note x={168} y={y1 - px(23000) + 3} label="x 14,000" size={9} color={C.emerald} />
      {/* M3: x expands to 24,000, y contracts to 9,000, z churns to 0 */}
      <rect x={560} y={y1 - px(9000)} width={96} height={px(9000)} fill={C.sky} fillOpacity={0.3} stroke={C.sky} strokeOpacity={0.55} />
      <rect x={560} y={y1 - px(33000)} width={96} height={px(24000)} fill={C.emerald} fillOpacity={0.3} stroke={C.emerald} strokeOpacity={0.55} />
      <rect x={560} y={y1 - px(33000) - 20} width={96} height={20} fill={C.rose} fillOpacity={0.05} stroke={C.rose} strokeOpacity={0.6} strokeDasharray="4 3" />
      <Note x={608} y={y1 - px(4500) + 3} label="y 9,000 ▼" size={9} color={C.sky} />
      <Note x={608} y={y1 - px(21000) + 3} label="x 24,000 ▲" size={9} color={C.emerald} />
      <Note x={668} y={54} label="z — gone · contributes 0" size={9} anchor="start" color={C.rose} />
      <Note x={668} y={70} label="seat kept in the denominator" size={9} anchor="start" color={C.dim} />
      {/* the flow + badge */}
      <Arrow d="M 224 150 L 552 150" color={C.zinc} marker="arw-dfs-4" />
      <Note x={388} y={166} label="same cohort · +3 months" size={9} color={C.zinc} />
      <Note x={410} y={68} label="x's +10,000 covers y's −1,000 and z's −6,000" size={9} color={C.zinc} />
      <Box x={320} y={84} w={180} h={56} label="" color={C.emerald} fillOpacity={0.12} />
      <text x={410} y={108} textAnchor="middle" fontFamily={MONO} fontSize={15} fontWeight={700} fill={C.emerald}>NRR 110.0%</text>
      <Note x={410} y={128} label="= 33,000 ÷ 30,000 ¢" size={9.5} color={C.zinc} />
      <Note x={168} y={186} label="M0 · 2026-03" size={9.5} color={C.zinc} />
      <Note x={608} y={186} label="M3 · 2026-06" size={9.5} color={C.zinc} />
      {/* the rule */}
      <rect x={664} y={92} width={176} height={92} rx={8} fill={C.blue} fillOpacity={0.06} stroke={C.blue} strokeOpacity={0.35} />
      <Note x={680} y={112} label="the NRR rule" size={9.5} anchor="start" color={C.blue} weight={700} />
      <Note x={680} y={132} label="denominator frozen at m0" size={9} anchor="start" color={C.zinc} />
      <Note x={680} y={148} label="churned seats: 0 in m3," size={9} anchor="start" color={C.zinc} />
      <Note x={680} y={162} label="never removed" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={202} label="m3 = cohort month + 3 months (not +90 days) — churned customers pay 0 but stay in the denominator" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8053 ltv-cac-payback — CAC vs LTV per channel + the payback month   */
/* ------------------------------------------------------------------ */

export function ArtLtvCacPayback() {
  const channels: Array<{ name: string; color: string; cac: number; ltv: number; ratio: string; y: number }> = [
    { name: "organic", color: C.emerald, cac: 3200, ltv: 40000, ratio: "×12.50", y: 44 },
    { name: "paid-sticky", color: C.sky, cac: 9600, ltv: 96000, ratio: "×10.00", y: 92 },
    { name: "paid-leaky", color: C.rose, cac: 9000, ltv: 15000, ratio: "×1.67", y: 140 },
  ];
  const px = (v: number) => v / 300; // 1px per 300 cents
  const fmt = (v: number) => v.toLocaleString("en-US");
  return (
    <g>
      <Defs id="arw-dfs-5" />
      <rect x={64} y={16} width={10} height={10} fill={C.amber} fillOpacity={0.5} />
      <Note x={78} y={24} label="CAC — what a customer costs" size={9.5} anchor="start" color={C.amber} />
      <Note x={294} y={24} label="colored bar = LTV — arpu × 0.80 ÷ churn" size={9.5} anchor="start" color={C.zinc} />
      {/* three channel rows */}
      {channels.map((ch) => (
        <g key={ch.name}>
          <Note x={64} y={ch.y} label={ch.name} size={10.5} anchor="start" color={ch.color} weight={700} />
          <rect x={140} y={ch.y + 4} width={px(ch.cac)} height={12} fill={C.amber} fillOpacity={0.4} stroke={C.amber} strokeOpacity={0.6} />
          <rect x={140} y={ch.y + 21} width={px(ch.ltv)} height={12} fill={ch.color} fillOpacity={0.35} stroke={ch.color} strokeOpacity={0.6} />
          <Note x={140 + px(ch.cac) + 6} y={ch.y + 13} label={`CAC ${fmt(ch.cac)} ¢`} size={9} anchor="start" color={C.amber} />
          <Note x={140 + px(ch.ltv) + 6} y={ch.y + 30} label={`LTV ${fmt(ch.ltv)} ¢`} size={9} anchor="start" color={ch.color} />
          <Tag x={510} y={ch.y + 17} label={ch.ratio} color={ch.color} />
        </g>
      ))}
      {/* payback panel for paid-sticky */}
      <line x1={548} y1={30} x2={548} y2={176} stroke={C.dim} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.5} />
      <Tag x={620} y={34} label="payback · paid-sticky" color={C.sky} />
      <Note x={584} y={52} label="cumulative margin" size={9} anchor="start" color={C.dim} />
      <Note x={584} y={64} label="arpu × 0.80 per month" size={9} anchor="start" color={C.dim} />
      <line x1={580} y1={150} x2={834} y2={150} stroke={C.dim} strokeWidth={1.2} />
      <path
        d="M 580 150 L 611.3 150 L 611.3 138 L 642.5 138 L 642.5 126 L 673.8 126 L 673.8 114 L 705 114 L 705 102 L 736.3 102 L 736.3 90 L 767.5 90 L 767.5 78 L 798.8 78 L 798.8 66 L 830 66"
        fill="none" stroke={C.emerald} strokeWidth={2}
      />
      <line x1={580} y1={102} x2={836} y2={102} stroke={C.amber} strokeWidth={1.2} strokeDasharray="4 3" />
      <Note x={836} y={98} label="CAC 9,600 ¢" size={9} anchor="end" color={C.amber} />
      <line x1={705} y1={102} x2={705} y2={150} stroke={C.dim} strokeWidth={1} strokeDasharray="2 3" />
      <circle cx={705} cy={102} r={4.5} fill={C.emerald} />
      <Tag x={705} y={130} label="payback month 4" color={C.emerald} />
      {[0, 2, 4, 6, 8].map((m) => (
        <Note key={m} x={580 + m * 31.25} y={164} label={`${m}`} size={9} color={C.dim} />
      ))}
      <Note x={705} y={180} label="month" size={9} color={C.dim} />
      <Note x={430} y={202} label="ltv_to_cac ranks channels — paid-sticky's bigger LTV still loses to organic's ratio; payback = cac ÷ (arpu × 0.80)" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8054 winback-recovery — the 90-day window, day 90 in, day 91 out    */
/* ------------------------------------------------------------------ */

export function ArtWinbackRecovery() {
  const day = (d: number) => 84 + d * 5.95; // day 0 at x=84, 120 days wide
  return (
    <g>
      <Defs id="arw-dfs-6" />
      {/* the per-reason read-out */}
      <rect x={476} y={30} width={280} height={64} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={490} y={45} label="one row per cancel_reason" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={490} y={60} label="price  5 churned · 3 back · 60.0%" size={9} anchor="start" color={C.amber} />
      <Note x={490} y={74} label="bugs   4 churned · 0 back · 0.0%" size={9} anchor="start" color={C.rose} />
      <Note x={490} y={88} label="zero-recovery reasons still report" size={9} anchor="start" color={C.dim} />
      {/* the timeline */}
      <rect x={84} y={124} width={536} height={32} fill={C.amber} fillOpacity={0.1} stroke={C.amber} strokeOpacity={0.45} />
      <Note x={360} y={152} label="90-day winback window" size={9.5} color={C.amber} weight={700} />
      <line x1={64} y1={140} x2={812} y2={140} stroke={C.dim} strokeWidth={1.2} />
      <circle cx={84} cy={140} r={5.5} fill={C.rose} />
      <Note x={98} y={136} label="churn" size={9} anchor="start" color={C.rose} />
      {/* the inclusive boundary */}
      <line x1={620} y1={104} x2={620} y2={172} stroke={C.fuchsia} strokeWidth={2} />
      <Tag x={620} y={108} label="day 90 · INCLUSIVE" color={C.fuchsia} />
      {/* three resubs: inside, on the boundary, one day late */}
      <circle cx={day(34)} cy={140} r={5} fill={C.emerald} />
      <Tag x={day(34)} y={106} label="day 34 · recovered" color={C.emerald} />
      <circle cx={620} cy={132} r={5} fill={C.emerald} />
      <Tag x={612} y={176} label="ON day 90 · counts" color={C.emerald} anchor="end" />
      <circle cx={626} cy={148} r={4.5} fill={C.rose} />
      <Tag x={634} y={176} label="day 91 · outside" color={C.rose} anchor="start" />
      {[0, 30, 60, 90, 120].map((d) => (
        <Note key={d} x={day(d)} y={170} label={`${d}`} size={9} color={C.dim} />
      ))}
      <Note x={441} y={186} label="days since churn" size={9} color={C.dim} />
      <Note x={430} y={202} label="recovery = resub within [churn_date, churn_date + 90] inclusive — grade per churn EVENT; avg days over recovered only" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the subscription loop, six numbered gates              */
/* ------------------------------------------------------------------ */

function Gate({ x, y, n, color }: { x: number; y: number; n: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9} fill="#09090b" stroke={color} strokeOpacity={0.9} strokeWidth={1.2} />
      <text x={x} y={y + 3.2} textAnchor="middle" fontFamily={MONO} fontSize={9.5} fontWeight={700} fill={color}>{n}</text>
    </g>
  );
}

export function ArtStudyRevenueLifecycle() {
  return (
    <g>
      <Defs id="arw-dfs-s1" />
      <Note x={430} y={22} label="the subscription loop — signup → activate → convert → expand or churn → winback → around again" size={10} color={C.zinc} />
      {/* acquisition + the live pipe */}
      <Box x={40} y={64} w={128} h={48} label="Channel spend" color={C.amber} fillOpacity={0.12} fs={11.5} />
      <Note x={104} y={106} label="spend ÷ customers = cac" size={8.5} color={C.dim} />
      <Box x={208} y={64} w={120} h={48} label="Subscribe" color={C.sky} fillOpacity={0.12} fs={12} />
      <Note x={268} y={106} label="trial or resub starts" size={8.5} color={C.dim} />
      <Box x={376} y={64} w={120} h={48} label="Activate" color={C.violet} fillOpacity={0.12} fs={12} />
      <Note x={436} y={106} label="key event ≤ 14 d" size={8.5} color={C.dim} />
      <Box x={544} y={64} w={120} h={48} label="Convert" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Note x={604} y={106} label="paying · mrr begins" size={8.5} color={C.dim} />
      <Arrow d="M 168 88 L 204 88" color={C.zinc} marker="arw-dfs-s1" />
      <Arrow d="M 328 88 L 372 88" color={C.zinc} marker="arw-dfs-s1" />
      <Arrow d="M 496 88 L 540 88" color={C.zinc} marker="arw-dfs-s1" />
      {/* the monthly ledger and its readouts */}
      <Box x={544} y={156} w={124} h={48} label="MRR waterfall" color={C.blue} fillOpacity={0.12} fs={11.5} />
      <Note x={606} y={198} label="+new +exp −con −churn" size={8.5} color={C.dim} />
      <Arrow d="M 606 112 L 606 152" color={C.zinc} marker="arw-dfs-s1" />
      <Box x={352} y={156} w={124} h={48} label="Plan changes" color={C.fuchsia} fillOpacity={0.12} fs={11.5} />
      <Note x={414} y={198} label="up · down · lateral" size={8.5} color={C.dim} />
      <Arrow d="M 556 112 C 538 138, 516 162, 482 176" color={C.zinc} marker="arw-dfs-s1" />
      <Box x={724} y={232} w={108} h={44} label="Cohort NRR" color={C.cyan} fillOpacity={0.12} fs={11.5} />
      <Note x={778} y={270} label="m3 ÷ m0" size={8.5} color={C.dim} />
      <Arrow d="M 668 186 C 698 194, 714 212, 720 238" color={C.zinc} marker="arw-dfs-s1" />
      {/* the fork out of the ledger */}
      <Box x={568} y={240} w={104} h={44} label="Churn" color={C.rose} fillOpacity={0.12} fs={11.5} />
      <Note x={620} y={278} label="row vanishes" size={8.5} color={C.dim} />
      <Arrow d="M 606 204 L 606 236" color={C.zinc} marker="arw-dfs-s1" />
      <Box x={368} y={240} w={124} h={44} label="Winback" color={C.amber} fillOpacity={0.12} fs={11.5} />
      <Note x={430} y={278} label="resub ≤ day 90" size={8.5} color={C.dim} />
      <Arrow d="M 564 262 L 496 262" color={C.zinc} marker="arw-dfs-s1" />
      {/* the loop-back — resubs re-enter paid */}
      <Arrow d="M 364 262 C 250 262, 150 248, 150 196 C 150 148, 168 116, 202 102" color={C.amber} dashed sw={1.8} marker="arw-dfs-s1" />
      <Tag x={262} y={242} label="resub re-enters — the loop closes" color={C.amber} />
      {/* the six numbered gates */}
      <Gate x={186} y={88} n={5} color={C.amber} />
      <Note x={186} y={52} label="unit economics · 8053" size={9} color={C.amber} />
      <Gate x={350} y={88} n={1} color={C.sky} />
      <Note x={350} y={52} label="trial funnel · 8049" size={9} color={C.sky} />
      <Gate x={532} y={142} n={2} color={C.fuchsia} />
      <Note x={508} y={142} label="migrations · 8050" size={9} anchor="end" color={C.fuchsia} />
      <Gate x={606} y={132} n={3} color={C.blue} />
      <Note x={592} y={136} label="waterfall · 8051" size={9} anchor="end" color={C.blue} />
      <Gate x={703} y={205} n={4} color={C.cyan} />
      <Note x={716} y={200} label="NRR · 8052" size={9} anchor="start" color={C.cyan} />
      <Gate x={530} y={262} n={6} color={C.amber} />
      <Note x={526} y={293} label="winback · 8054" size={9} color={C.amber} />
      {/* who reads the loop */}
      <rect x={704} y={36} width={136} height={92} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={718} y={54} label="who reads the loop" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={718} y={72} label="growth — funnel" size={9} anchor="start" color={C.sky} />
      <Note x={718} y={88} label="finance — waterfall" size={9} anchor="start" color={C.blue} />
      <Note x={718} y={104} label="CS — NRR · winback" size={9} anchor="start" color={C.cyan} />
      <Note x={718} y={120} label="CFO — LTV ÷ CAC" size={9} anchor="start" color={C.emerald} />
      <Note x={36} y={292} label="every SaaS & Subscriptions problem guards one numbered gate of this loop" size={10} anchor="start" color={C.zinc} />
    </g>
  );
}
