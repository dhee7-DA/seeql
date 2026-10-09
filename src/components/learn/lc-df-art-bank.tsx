"use client";

// Data & Finance art — Banking & Credit Risk family.
// One REAL-LIFE concept diagram per problem primer + the section study flow
// ("the life of a loan"). Same pastel language as lc-pattern.tsx: dark panel,
// mono labels, the palette C below mirrors that file's constants.

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

function Arrow({ d, color, dashed = false, marker = "arw-dfb", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* 8025 vintage-default-curves — the vintage curve itself              */
/* ------------------------------------------------------------------ */

export function ArtVintageDefaultCurves() {
  // chart frame
  const x0 = 74, x1 = 560, y0 = 36, y1 = 156; // plot area
  const mx = (mob: number) => x0 + ((mob - 1) / 5) * (x1 - x0);
  const my = (pct: number) => y1 - (pct / 60) * (y1 - y0); // 0..60% scale
  const jan = [[1, 0], [2, 0], [3, 25], [4, 25], [5, 50], [6, 50]];
  const feb = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 25]];
  const mar = [[1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]];
  const path = (pts: number[][]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${mx(p[0])} ${my(p[1])}`).join(" ");
  return (
    <g>
      <Defs id="arw-dfb-1" />
      {/* axes */}
      <line x1={x0} y1={y0 - 6} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[0, 20, 40, 60].map((p) => (
        <g key={p}>
          <line x1={x0} y1={my(p)} x2={x1} y2={my(p)} stroke={C.dim} strokeOpacity={0.25} strokeDasharray="2 4" />
          <Note x={x0 - 6} y={my(p) + 3.5} label={`${p}%`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {[1, 2, 3, 4, 5, 6].map((m) => <Note key={m} x={mx(m)} y={y1 + 14} label={`${m}`} size={9} color={C.dim} />)}
      <Note x={(x0 + x1) / 2} y={y1 + 30} label="months on book (mob)" size={9.5} color={C.zinc} />
      <Note x={24} y={(y0 + y1) / 2} label="cum default" size={9.5} color={C.zinc} />
      <Note x={24} y={(y0 + y1) / 2 + 12} label="(cohort)" size={9.5} color={C.zinc} />
      {/* cohort curves — cumulative, step up and stay */}
      <path d={path(jan)} fill="none" stroke={C.rose} strokeWidth={2.2} />
      {jan.map((p, i) => <circle key={i} cx={mx(p[0])} cy={my(p[1])} r={3} fill={C.rose} />)}
      <path d={path(feb)} fill="none" stroke={C.amber} strokeWidth={2.2} />
      {feb.map((p, i) => <circle key={i} cx={mx(p[0])} cy={my(p[1])} r={3} fill={C.amber} />)}
      <path d={path(mar)} fill="none" stroke={C.emerald} strokeWidth={2.2} />
      {mar.map((p, i) => <circle key={i} cx={mx(p[0])} cy={my(p[1])} r={3} fill={C.emerald} />)}
      {/* annotations at the steps */}
      <Tag x={mx(3) + 4} y={my(25) - 16} label="2026-01: 2 of 4 by mob 3 → 25%" color={C.rose} anchor="start" />
      <Tag x={mx(5) - 6} y={my(50) - 16} label="loan 2 defaults at mob 5 → 50%" color={C.rose} anchor="end" />
      <Tag x={mx(6)} y={my(25) + 22} label="2026-02: first default lands at mob 6" color={C.amber} anchor="end" />
      {/* legend + the SQL shape */}
      <Box x={620} y={40} w={12} h={12} label="" color={C.rose} /> <Note x={640} y={50} label="vintage 2026-01" size={10.5} anchor="start" color={C.rose} />
      <Box x={620} y={62} w={12} h={12} label="" color={C.amber} /> <Note x={640} y={72} label="vintage 2026-02" size={10.5} anchor="start" color={C.amber} />
      <Box x={620} y={84} w={12} h={12} label="" color={C.emerald} /> <Note x={640} y={94} label="vintage 2026-03" size={10.5} anchor="start" color={C.emerald} />
      <rect x={612} y={112} width={216} height={62} rx={8} fill={C.violet} fillOpacity={0.07} stroke={C.violet} strokeOpacity={0.35} />
      <Note x={624} y={130} label="defaults_so_far = SUM(new)" size={9.5} anchor="start" color={C.violet} />
      <Note x={624} y={146} label="  OVER (PARTITION BY" size={9.5} anchor="start" color={C.violet} />
      <Note x={624} y={162} label="  origination_month ORDER BY mob)" size={9.5} anchor="start" color={C.violet} />
      <Note x={430} y={200} label="a curve that steps up and never steps down — defaults are CUMULATIVE" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8026 delinquency-roll-rates — the state machine                     */
/* ------------------------------------------------------------------ */

export function ArtDelinquencyRollRates() {
  const buckets = ["current", "d1_30", "d31_60", "d61_90", "d90_plus"];
  const colors = [C.emerald, C.lime, C.amber, C.orange, C.rose];
  const bw = 128, bh = 40, gap = 24;
  const x0 = 48, yc = 84;
  return (
    <g>
      <Defs id="arw-dfb-2" />
      {buckets.map((b, i) => (
        <g key={b}>
          <Box x={x0 + i * (bw + gap)} y={yc} w={bw} h={bh} label={b} color={colors[i]} fillOpacity={0.12} />
          <Note x={x0 + i * (bw + gap) + bw / 2} y={yc + bh + 16} label={`${i + 1}`} size={9} color={C.dim} />
        </g>
      ))}
      {/* roll forward — the worsening flow */}
      {buckets.slice(0, -1).map((b, i) => (
        <g key={`f${b}`}>
          <Arrow d={`M ${x0 + i * (bw + gap) + bw + 2} ${yc + 10} L ${x0 + (i + 1) * (bw + gap) - 2} ${yc + 10}`} color={C.rose} sw={2} marker="arw-dfb-2" />
          <Note x={x0 + i * (bw + gap) + bw + gap / 2} y={yc + 2} label="roll" size={8.5} color={C.rose} />
        </g>
      ))}
      {/* cures — the recovering flow, arcing back underneath */}
      <Arrow d={`M ${x0 + bw + 34} ${yc + bh - 4} C ${x0 + bw - 10} ${yc + bh + 34}, ${x0 + 60} ${yc + bh + 34}, ${x0 + 58} ${yc + bh + 2}`} color={C.emerald} sw={2} marker="arw-dfb-2" />
      <Note x={x0 + bw / 2 + 10} y={yc + bh + 40} label="cure (d1_30 → current)" size={9.5} color={C.emerald} />
      <Arrow d={`M ${x0 + 2 * (bw + gap) + 40} ${yc + bh - 4} C ${x0 + 2 * (bw + gap) - 30} ${yc + bh + 58}, ${x0 + 20} ${yc + bh + 58}, ${x0 + 16} ${yc + bh + 2}`} color={C.emerald} sw={2} marker="arw-dfb-2" />
      <Note x={x0 + 190} y={yc + bh + 62} label="deep cure (d61_90 → current)" size={9.5} color={C.emerald} />
      {/* stays */}
      <Tag x={x0 + bw / 2} y={yc - 22} label="stay: current → current · 2" color={C.emerald} />
      <Tag x={x0 + 4 * (bw + gap) + bw / 2} y={yc - 22} label="stay: d90_plus → d90_plus" color={C.rose} />
      {/* the read */}
      <rect x={560} y={152} width={272} height={44} rx={8} fill={C.amber} fillOpacity={0.07} stroke={C.amber} strokeOpacity={0.35} />
      <Note x={574} y={170} label="transition matrix: one row per observed" size={9.5} anchor="start" color={C.amber} />
      <Note x={574} y={186} label="(bucket_from, bucket_to) pair" size={9.5} anchor="start" color={C.amber} />
      <Note x={430} y={202} label="severity order is a CASE, never alphabetical — the matrix must read like a map" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8027 credit-utilization-bands — the gauge                           */
/* ------------------------------------------------------------------ */

export function ArtCreditUtilizationBands() {
  const gx = 64, gw = 620, gy = 86, gh = 30;
  const px = (pct: number) => gx + (pct / 100) * gw;
  const bands: Array<[number, number, string, string]> = [
    [0, 30, "low", C.emerald], [30, 60, "moderate", C.lime], [60, 90, "high", C.amber], [90, 100, "maxed", C.rose],
  ];
  return (
    <g>
      <Defs id="arw-dfb-3" />
      {/* the gauge */}
      {bands.map(([a, b, label, color]) => (
        <g key={label}>
          <rect x={px(a)} y={gy} width={px(b) - px(a) - 2} height={gh} rx={6} fill={color} fillOpacity={0.18} stroke={color} strokeOpacity={0.5} />
          <Note x={(px(a) + px(b)) / 2} y={gy + gh + 16} label={label} size={10} color={color} weight={700} />
          <Note x={px(a)} y={gy - 10} label={`${a}%`} size={9} anchor={a === 0 ? "start" : "middle"} color={C.dim} />
        </g>
      ))}
      <Note x={px(100)} y={gy - 10} label="100%" size={9} anchor="end" color={C.dim} />
      {/* boundary pins */}
      {[30, 60, 90].map((p) => (
        <g key={p}>
          <line x1={px(p)} y1={gy - 4} x2={px(p)} y2={gy + gh + 4} stroke={C.zinc} strokeWidth={1.2} strokeDasharray="3 3" />
          <Tag x={px(p)} y={gy - 26} label={`${p}.0 → next band`} color={C.zinc} />
        </g>
      ))}
      {/* the seeded cards as needles */}
      {[[0, "0.0"], [24.9, "24.9"], [61.5, "61.5"], [97.3, "97.3"]].map(([p, label]) => (
        <g key={label as string}>
          <line x1={px(p as number)} y1={gy + gh + 20} x2={px(p as number)} y2={gy - 16} stroke={C.sky} strokeWidth={1.6} />
          <Tag x={px(p as number)} y={gy + gh + 34} label={label as string} color={C.sky} />
        </g>
      ))}
      {/* the two boundary cards */}
      <Tag x={px(30)} y={gy + gh + 56} label="exactly 30.0 → moderate" color={C.lime} />
      <Tag x={px(90)} y={gy + gh + 56} label="exactly 90.0 → maxed" color={C.rose} />
      <Note x={430} y={202} label="utilization = latest statement balance ÷ credit limit — the 30% line is where scores start to ache" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8028 expected-credit-loss — PD × LGD × EAD                          */
/* ------------------------------------------------------------------ */

export function ArtExpectedCreditLoss() {
  const rows: Array<[string, string, string, string, number]> = [
    ["prime", "0.5%", "40%", "1,200,000", 2400],
    ["near-prime", "2.0%", "45%", "700,000", 6300],
    ["subprime", "6.5%", "55%", "400,000", 14300],
  ];
  const maxEcl = 14300;
  return (
    <g>
      <Defs id="arw-dfb-4" />
      {/* the formula — three blocks multiplied into the loss */}
      <Box x={48} y={30} w={150} h={40} label="PD · will it default?" color={C.sky} fillOpacity={0.09} fs={10.5} />
      <Note x={216} y={55} label="×" size={16} color={C.zinc} weight={700} />
      <Box x={236} y={30} w={170} h={40} label="LGD · how much is lost?" color={C.amber} fillOpacity={0.09} fs={10.5} />
      <Note x={424} y={55} label="×" size={16} color={C.zinc} weight={700} />
      <Box x={444} y={30} w={160} h={40} label="EAD · what's owed?" color={C.violet} fillOpacity={0.09} fs={10.5} />
      <Arrow d={`M 614 50 L 664 50`} color={C.zinc} marker="arw-dfb-4" />
      <Box x={674} y={28} w={140} h={44} label="ECL ¢" color={C.rose} fillOpacity={0.12} fs={13} />
      {/* per-segment rows — the sum of products */}
      {rows.map(([name, pd, lgd, ead, ecl], i) => {
        const y = 104 + i * 30;
        return (
          <g key={name}>
            <Note x={64} y={y + 12} label={name} size={10.5} anchor="start" color={i === 2 ? C.rose : i === 1 ? C.amber : C.emerald} weight={700} />
            <Note x={190} y={y + 12} label={pd} size={10} anchor="start" color={C.sky} />
            <Note x={252} y={y + 12} label={lgd} size={10} anchor="start" color={C.amber} />
            <Note x={330} y={y + 12} label={`${ead} ¢`} size={10} anchor="start" color={C.violet} />
            <rect x={470} y={y} width={(ecl / maxEcl) * 250} height={18} rx={4} fill={C.rose} fillOpacity={0.55} />
            <Note x={470 + (ecl / maxEcl) * 250 + 10} y={y + 13} label={`${ecl} ¢`} size={10} anchor="start" color={C.rose} weight={700} />
          </g>
        );
      })}
      <Note x={64} y={200} label="ECL = SUM(ead × pd × lgd) — a sum of PRODUCTS; the product of sums is the classic wrong answer" size={10} anchor="start" color={C.zinc} />
      <Note x={820} y={200} label="" size={10} anchor="end" color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8029 risk-based-pricing — the rate sheet ladder                     */
/* ------------------------------------------------------------------ */

export function ArtRiskBasedPricing() {
  const tiers: Array<[string, number, string]> = [
    ["300-619", 18.9, "deep subprime"],
    ["620-719", 12.5, "near-prime"],
    ["720-850", 7.9, "prime"],
  ];
  const x0 = 90, bw = 150, gap = 60, ybase = 150;
  const hOf = (apr: number) => (apr / 20) * 96;
  return (
    <g>
      <Defs id="arw-dfb-5" />
      {tiers.map(([range, apr, label], i) => {
        const x = x0 + i * (bw + gap);
        const h = hOf(apr);
        const color = i === 0 ? C.rose : i === 1 ? C.amber : C.emerald;
        return (
          <g key={range}>
            <rect x={x} y={ybase - h} width={bw} height={h} rx={8} fill={color} fillOpacity={0.16} stroke={color} strokeOpacity={0.55} />
            <Note x={x + bw / 2} y={ybase - h - 10} label={`${apr}% APR`} size={11.5} color={color} weight={700} />
            <Note x={x + bw / 2} y={ybase + 18} label={`score ${range}`} size={10} color={C.zinc} weight={700} />
            <Note x={x + bw / 2} y={ybase + 34} label={label} size={9} color={C.dim} />
          </g>
        );
      })}
      {/* boundary pins */}
      <Tag x={x0 + bw + gap / 2} y={52} label="620 → tier 2 (BETWEEN is inclusive)" color={C.amber} />
      <Arrow d={`M ${x0 + bw + gap / 2} 60 L ${x0 + bw + gap / 2} ${ybase - hOf(12.5) - 4}`} color={C.amber} dashed marker="arw-dfb-5" />
      {/* the override */}
      <Tag x={x0 + 2 * (bw + gap) + bw / 2} y={96} label="override 6.4% — the desk beats the sheet" color={C.fuchsia} />
      <Arrow d={`M ${x0 + 2 * (bw + gap) + bw / 2} 104 L ${x0 + 2 * (bw + gap) + bw / 2} ${ybase - hOf(7.9) + 26}`} color={C.fuchsia} dashed marker="arw-dfb-5" />
      <Note x={430} y={202} label="COALESCE(override, sheet) — the underwriter's exception always wins the row" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8030 prepayment-detection — the balance walk, cut short             */
/* ------------------------------------------------------------------ */

export function ArtPrepaymentDetection() {
  // scheduled balance curve vs actual early payoff (loan 2: term 6, payoff month 5)
  const x0 = 84, x1 = 520, y0 = 40, y1 = 156;
  const mx = (m: number) => x0 + ((m - 1) / 11) * (x1 - x0);
  const my = (bal: number) => y1 - (bal / 60000) * (y1 - y0);
  // loan 2: 40000 principal-ish walk (schematic values for the shape)
  const sched = [40000, 33680, 27300, 20880, 14420, 7920, 1378].map((b, i) => [i + 1, b] as number[]);
  const actual: number[][] = [[1, 40000], [2, 33680], [3, 27300], [4, 20880], [5, 0]];
  const path = (pts: number[][]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${mx(p[0])} ${my(p[1])}`).join(" ");
  const area = `${path(actual)} L ${mx(5)} ${y1} L ${mx(1)} ${y1} Z`;
  return (
    <g>
      <Defs id="arw-dfb-6" />
      <line x1={x0} y1={y0 - 6} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[0, 20000, 40000, 60000].map((b) => (
        <g key={b}>
          <line x1={x0} y1={my(b)} x2={x1} y2={my(b)} stroke={C.dim} strokeOpacity={0.22} strokeDasharray="2 4" />
          <Note x={x0 - 8} y={my(b) + 3.5} label={b === 0 ? "0" : `${b / 1000}k`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {[1, 3, 5, 7, 9, 11, 12].map((m) => <Note key={m} x={mx(m)} y={y1 + 14} label={`${m}`} size={9} color={C.dim} />)}
      <Note x={(x0 + x1) / 2} y={y1 + 30} label="month" size={9.5} color={C.zinc} />
      {/* the area the bank never collects */}
      <path d={area} fill={C.rose} fillOpacity={0.10} stroke="none" />
      {/* scheduled */}
      <path d={path(sched)} fill="none" stroke={C.zinc} strokeWidth={1.8} strokeDasharray="5 4" />
      <Tag x={mx(9)} y={my(12000) - 2} label="scheduled walk — 6 more months of interest" color={C.zinc} />
      {/* actual payoff */}
      <path d={path(actual)} fill="none" stroke={C.emerald} strokeWidth={2.4} />
      {actual.map((p, i) => <circle key={i} cx={mx(p[0])} cy={my(p[1])} r={3.2} fill={C.emerald} />)}
      <Tag x={mx(5) + 8} y={my(0) - 16} label="payoff — balance clears at month 5" color={C.emerald} anchor="start" />
      <Tag x={mx(4)} y={y0 + 4} label="shaded = interest the bank never collects (savings_cents)" color={C.rose} anchor="start" />
      {/* read-out */}
      <rect x={576} y={64} width={252} height={92} rx={8} fill={C.emerald} fillOpacity={0.06} stroke={C.emerald} strokeOpacity={0.35} />
      <Note x={592} y={86} label="loan 2 · months_taken 5 of 6" size={10} anchor="start" color={C.emerald} weight={700} />
      <Note x={592} y={104} label="actual_interest_cents   2013" size={9.5} anchor="start" color={C.zinc} />
      <Note x={592} y={120} label="scheduled_interest_cents 2115" size={9.5} anchor="start" color={C.zinc} />
      <Note x={592} y={136} label="savings_cents = 2115 - 2013 = 102" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={430} y={200} label="two walks over the same loan — the recursive schedule and what the borrower actually did" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the life of a loan                                     */
/* ------------------------------------------------------------------ */

export function ArtStudyLoanLife() {
  const WF = 860, HF = 300;
  return (
    <g>
      <Defs id="arw-dfb-s1" />
      {/* origination */}
      <Box x={40} y={54} w={168} h={56} label="Origination" color={C.sky} fillOpacity={0.12} fs={12.5} />
      <Note x={124} y={92} label="score → tier → APR sheet" size={9} color={C.dim} />
      <Tag x={124} y={40} label="risk-based-pricing" color={C.sky} />
      {/* servicing */}
      <Box x={268} y={54} w={168} h={56} label="Servicing" color={C.violet} fillOpacity={0.12} fs={12.5} />
      <Note x={352} y={92} label="amortization month by month" size={9} color={C.dim} />
      <Arrow d={`M 210 82 L 264 82`} color={C.zinc} marker="arw-dfb-s1" />
      <Tag x={238} y={68} label="setup" color={C.zinc} />
      {/* healthy path */}
      <Box x={496} y={20} w={172} h={48} label="Paid off" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Arrow d={`M 438 64 L 492 48`} color={C.emerald} marker="arw-dfb-s1" />
      <Tag x={466} y={38} label="full term or prepay" color={C.emerald} />
      <Tag x={582} y={86} label="prepayment-detection" color={C.emerald} />
      {/* delinquency stair */}
      <Box x={496} y={120} w={120} h={40} label="DPD 1-30" color={C.lime} fillOpacity={0.12} fs={10.5} />
      <Box x={636} y={120} w={120} h={40} label="DPD 31-60" color={C.amber} fillOpacity={0.12} fs={10.5} />
      <Box x={776} y={120} w={60} h={40} label="90+" color={C.rose} fillOpacity={0.12} fs={10.5} />
      <Arrow d={`M 438 92 C 470 100, 470 132, 492 138`} color={C.amber} marker="arw-dfb-s1" />
      <Tag x={452} y={124} label="misses a cycle" color={C.amber} />
      <Arrow d={`M 616 140 L 632 140`} color={C.rose} marker="arw-dfb-s1" />
      <Arrow d={`M 756 140 L 772 140`} color={C.rose} marker="arw-dfb-s1" />
      <Tag x={694} y={106} label="delinquency-roll-rates" color={C.amber} />
      <Tag x={700} y={178} label="delinquency-buckets · vintage-default-curves" color={C.rose} />
      {/* cure arc back to servicing */}
      <path d={`M 540 164 C 480 216, 380 216, 340 114`} fill="none" stroke={C.emerald} strokeWidth={1.8} strokeDasharray="4 3" markerEnd="url(#arw-dfb-s1)" />
      <Tag x={430} y={216} label="cure — back to current" color={C.emerald} />
      {/* default + recovery */}
      <Box x={496} y={236} w={200} h={44} label="Default → Recovery" color={C.rose} fillOpacity={0.12} fs={11.5} />
      <Arrow d={`M 806 164 C 806 210, 720 244, 700 250`} color={C.rose} marker="arw-dfb-s1" />
      <Tag x={762} y={272} label="ECL = PD × LGD × EAD" color={C.rose} />
      <Tag x={560} y={272} label="expected-credit-loss" color={C.rose} />
      {/* desk annotations */}
      <rect x={40} y={152} width={196} height={122} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={54} y={172} label="who reads this pipe" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={54} y={190} label="· origination: pricing desk" size={9} anchor="start" color={C.sky} />
      <Note x={54} y={206} label="· servicer: the schedule" size={9} anchor="start" color={C.violet} />
      <Note x={54} y={222} label="· collections: the roll matrix" size={9} anchor="start" color={C.amber} />
      <Note x={54} y={238} label="· credit risk: vintages + ECL" size={9} anchor="start" color={C.rose} />
      <Note x={54} y={258} label="utilization sits upstream —" size={9} anchor="start" color={C.cyan} />
      <Note x={54} y={272} label="the score that set the limit" size={9} anchor="start" color={C.cyan} />
      <Note x={430} y={HF - 6} label="every SQL problem in Banking & Credit Risk reads one leg of this pipe" size={10} color={C.zinc} />
    </g>
  );
}

export const BANK_ART_W = W;
export const BANK_ART_H = HP;
