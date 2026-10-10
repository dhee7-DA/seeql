"use client";

// Data & Finance art — Product Analytics family.
// One REAL-LIFE concept diagram per problem primer + the section study flow
// ("the product analytics loop"). Same pastel language as lc-pattern.tsx:
// dark panel, mono labels, the palette C below mirrors that file's constants.

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

function Arrow({ d, color, dashed = false, marker = "arw-dfp", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* dau-wau-stickiness — DAU inside the WAU envelope                    */
/* ------------------------------------------------------------------ */

export function ArtDauWauStickiness() {
  const x0 = 70, x1 = 560, yBase = 150;
  const dayW = (x1 - x0) / 14;
  const mx = (d: number) => x0 + (d - 0.5) * dayW;
  const my = (v: number) => yBase - (v / 1500) * 88;
  const dau = [520, 480, 610, 560, 640, 590, 700, 540, 580, 660, 610, 690, 1450, 620];
  const wauY = 54;
  const bandX0 = x0 + 7 * dayW; // trailing-7 window starts at day 8
  return (
    <g>
      <Defs id="arw-dfp-1" />
      {/* the WAU envelope — uniques over the trailing 7 days */}
      <line x1={x0 - 4} y1={wauY} x2={x1 + 8} y2={wauY} stroke={C.amber} strokeWidth={1.8} strokeDasharray="5 4" opacity={0.9} />
      <Note x={x0 + 4} y={wauY - 6} label="WAU ≈ 4,800 — unique users in the trailing 7 days" size={9} anchor="start" color={C.amber} />
      {/* the trailing-7 window itself */}
      <rect x={bandX0} y={wauY + 4} width={x1 - bandX0} height={yBase - wauY - 4} fill={C.sky} fillOpacity={0.05} stroke={C.sky} strokeOpacity={0.35} strokeDasharray="3 4" />
      <Note x={420} y={wauY + 16} label="trailing-7 window" size={9} color={C.sky} weight={700} />
      {/* axes */}
      <line x1={x0} y1={yBase} x2={x1 + 8} y2={yBase} stroke={C.dim} strokeWidth={1.2} />
      {dau.map((v, i) => (
        <g key={i}>
          <rect x={mx(i + 1) - 11} y={my(v)} width={22} height={yBase - my(v)} rx={3}
            fill={i === 12 ? C.rose : C.sky} fillOpacity={i === 12 ? 0.55 : 0.4} />
          <Note x={mx(i + 1)} y={yBase + 14} label={`${i + 1}`} size={9} color={C.dim} />
        </g>
      ))}
      <Note x={(x0 + x1) / 2} y={yBase + 30} label="day" size={9.5} color={C.zinc} />
      {/* campaign spike vs an organic day */}
      <circle cx={mx(13)} cy={my(1450)} r={4.5} fill={C.rose} />
      <Tag x={mx(13) + 16} y={88} label="one-off spike" color={C.rose} anchor="start" />
      <Tag x={mx(10)} y={96} label="organic day" color={C.sky} />
      {/* the stickiness bracket — bar top up to the envelope */}
      <line x1={249} y1={wauY} x2={249} y2={my(590) - 4} stroke={C.emerald} strokeWidth={1.2} />
      <line x1={244} y1={wauY} x2={254} y2={wauY} stroke={C.emerald} strokeWidth={1.2} />
      <line x1={244} y1={my(590) - 4} x2={254} y2={my(590) - 4} stroke={C.emerald} strokeWidth={1.2} />
      <Note x={257} y={88} label="DAU ÷ WAU" size={9} anchor="start" color={C.emerald} />
      {/* read-out */}
      <rect x={644} y={44} width={192} height={118} rx={8} fill={C.sky} fillOpacity={0.06} stroke={C.sky} strokeOpacity={0.35} />
      <Note x={658} y={66} label="stickiness = DAU ÷ WAU" size={10} anchor="start" color={C.sky} weight={700} />
      <Note x={658} y={86} label="spike day: 1450 ÷ 4800" size={9.5} anchor="start" color={C.rose} />
      <Note x={658} y={102} label="           = 30% (inflated)" size={9.5} anchor="start" color={C.rose} />
      <Note x={658} y={122} label="organic:    690 ÷ 4800" size={9.5} anchor="start" color={C.zinc} />
      <Note x={658} y={138} label="           = 14% (real level)" size={9.5} anchor="start" color={C.zinc} />
      <Note x={658} y={154} label="spike exits the window in 7d" size={9.5} anchor="start" color={C.amber} />
      <Note x={W / 2} y={HP - 8} label="WAU = uniques in the trailing 7 days — one campaign lifts DAU 2× but barely moves the 7-day uniques" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* growth-accounting — the four levers of the user total               */
/* ------------------------------------------------------------------ */

export function ArtGrowthAccounting() {
  return (
    <g>
      <Defs id="arw-dfp-2" />
      {/* the three inflows */}
      <Box x={40} y={28} w={150} h={38} label="NEW" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Note x={115} y={78} label="first event ever · +1,200" size={9} color={C.emerald} />
      <Box x={40} y={86} w={150} h={38} label="RETAINED" color={C.sky} fillOpacity={0.12} fs={12} />
      <Note x={115} y={136} label="active both months · +8,600" size={9} color={C.sky} />
      <Box x={40} y={144} w={150} h={38} label="RESURRECTED" color={C.amber} fillOpacity={0.12} fs={11} />
      <Note x={115} y={194} label="back after 90+ days · +180" size={9} color={C.amber} />
      {/* inflow arrows into TOTAL */}
      <Arrow d="M 194 47 L 326 95" color={C.emerald} sw={2} marker="arw-dfp-2" />
      <Arrow d="M 194 105 L 326 105" color={C.sky} sw={2} marker="arw-dfp-2" />
      <Arrow d="M 194 163 L 326 115" color={C.amber} sw={2} marker="arw-dfp-2" />
      <Note x={263} y={64} label="+" size={14} color={C.zinc} weight={700} />
      <Note x={263} y={98} label="+" size={14} color={C.zinc} weight={700} />
      <Note x={263} y={132} label="+" size={14} color={C.zinc} weight={700} />
      <Box x={330} y={83} w={150} h={44} label="TOTAL" color={C.violet} fillOpacity={0.14} fs={13} />
      <Note x={405} y={139} label="month-end actives" size={9} color={C.violet} />
      {/* the one outflow */}
      <Arrow d="M 482 105 L 566 105" color={C.rose} sw={2} marker="arw-dfp-2" />
      <Note x={524} y={97} label="−" size={14} color={C.rose} weight={700} />
      <Box x={570} y={83} w={150} h={44} label="CHURNED" color={C.rose} fillOpacity={0.12} fs={12} />
      <Note x={645} y={139} label="no event this month · −900" size={9} color={C.rose} />
      {/* the identity */}
      <rect x={560} y={152} width={262} height={44} rx={8} fill={C.amber} fillOpacity={0.07} stroke={C.amber} strokeOpacity={0.35} />
      <Note x={574} y={170} label="end = start + new + resurrected − churned" size={9.5} anchor="start" color={C.amber} />
      <Note x={574} y={188} label="net = end − start — the four levers" size={9.5} anchor="start" color={C.amber} />
      <Note x={W / 2} y={HP - 8} label="growth accounting is a (cohort × month) grid — every active user lands in exactly one of the four buckets" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* funnel-step-conversion — overall vs stepwise, same funnel           */
/* ------------------------------------------------------------------ */

export function ArtFunnelStepConversion() {
  const cx = 240;
  const stages: Array<{ name: string; n: string; w0: number; w1: number; color: string; step: string }> = [
    { name: "visit", n: "5,000", w0: 360, w1: 216, color: C.sky, step: "" },
    { name: "signup", n: "1,000", w0: 216, w1: 130, color: C.violet, step: "÷ prev · 20%" },
    { name: "activate", n: "400", w0: 130, w1: 78, color: C.amber, step: "÷ prev · 40%" },
    { name: "pay", n: "100", w0: 78, w1: 44, color: C.emerald, step: "÷ prev · 25%" },
  ];
  return (
    <g>
      <Defs id="arw-dfp-3" />
      {/* the overall reading — one bracket over the whole funnel */}
      <path d={`M ${cx - 180} 26 L ${cx - 180} 21 L ${cx + 180} 21 L ${cx + 180} 26`} fill="none" stroke={C.amber} strokeWidth={1.4} />
      <Note x={cx} y={14} label="overall: visit→pay — 100 ÷ 5,000 = 2.0%" size={9.5} color={C.amber} weight={700} />
      {/* the narrowing funnel */}
      {stages.map((s, i) => {
        const y = 28 + i * 42;
        return (
          <g key={s.name}>
            <polygon
              points={`${cx - s.w0 / 2},${y} ${cx + s.w0 / 2},${y} ${cx + s.w1 / 2},${y + 30} ${cx - s.w1 / 2},${y + 30}`}
              fill={s.color} fillOpacity={0.12} stroke={s.color} strokeOpacity={0.55} />
            <Note x={cx} y={y + 19} label={`${s.name} · ${s.n}`} size={i === 3 ? 9.5 : 10} color={s.color} weight={700} />
          </g>
        );
      })}
      {/* the stepwise reading — a bracket per stage */}
      {stages.slice(1).map((s, i) => {
        const y = 28 + (i + 1) * 42;
        return (
          <g key={s.name}>
            <path d={`M ${cx - s.w0 / 2} ${y - 10} L ${cx - s.w0 / 2} ${y - 5} L ${cx + s.w0 / 2} ${y - 5} L ${cx + s.w0 / 2} ${y - 10}`}
              fill="none" stroke={C.zinc} strokeWidth={1.2} opacity={0.8} />
            <Note x={cx + s.w0 / 2 + 8} y={y - 2} label={s.step} size={9} anchor="start" color={C.zinc} />
          </g>
        );
      })}
      {/* the two-readings panel */}
      <rect x={540} y={30} width={290} height={122} rx={8} fill={C.violet} fillOpacity={0.06} stroke={C.violet} strokeOpacity={0.35} />
      <Note x={554} y={52} label="same funnel — two readings" size={10.5} anchor="start" color={C.violet} weight={700} />
      <Note x={554} y={74} label="overall:  100 ÷ 5,000  =  2.0%" size={9.5} anchor="start" color={C.amber} />
      <Note x={554} y={92} label="stepwise: 20% × 40% × 25%" size={9.5} anchor="start" color={C.zinc} />
      <Note x={554} y={108} label="          = 2.0% (they compose)" size={9.5} anchor="start" color={C.zinc} />
      <Note x={554} y={130} label="avg step: (20+40+25) ÷ 3 = 28.3%" size={9.5} anchor="start" color={C.rose} />
      <Tag x={685} y={170} label="2.0% ≠ 28.3% — name the reading" color={C.rose} />
      <Note x={W / 2} y={HP - 8} label={"\"our funnel converts 20%\" usually means step 1 — the overall number is 20% × 40% × 25% = 2.0%"} size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* cohort-retention-matrix — the triangle, read down a column          */
/* ------------------------------------------------------------------ */

export function ArtCohortRetentionMatrix() {
  const gx = 150, colW = 96, rowH = 36, gy = 54;
  const cohorts: Array<{ m: string; vals: Array<number | null> }> = [
    { m: "Jan", vals: [100, 42, 27] },
    { m: "Feb", vals: [100, 38, null] },
    { m: "Mar", vals: [100, null, null] },
  ];
  return (
    <g>
      <Defs id="arw-dfp-4" />
      <Note x={294} y={28} label="months since signup (age) →" size={9} color={C.dim} />
      <Note x={142} y={46} label="cohort" size={9} anchor="end" color={C.dim} />
      {["M0", "M1", "M2"].map((h, j) => (
        <Note key={h} x={gx + j * colW + colW / 2} y={46} label={h} size={10} color={C.zinc} weight={700} />
      ))}
      {/* the cells — fading left to right, stair-step empty lower right */}
      {cohorts.map((row, i) => (
        <g key={row.m}>
          <Note x={142} y={gy + i * rowH + 22} label={row.m} size={10.5} anchor="end" color={C.zinc} weight={700} />
          {row.vals.map((v, j) => {
            const x = gx + j * colW, y = gy + i * rowH;
            return v === null ? (
              <g key={j}>
                <rect x={x} y={y} width={colW} height={rowH} fill="none" stroke={C.dim} strokeOpacity={0.35} strokeDasharray="3 4" />
                <Note x={x + colW / 2} y={y + rowH / 2 + 4} label="—" size={10} color={C.dim} />
              </g>
            ) : (
              <g key={j}>
                <rect x={x} y={y} width={colW} height={rowH} fill={C.emerald} fillOpacity={0.07 + (v / 100) * 0.25} stroke={C.emerald} strokeOpacity={0.45} />
                <Note x={x + colW / 2} y={y + rowH / 2 + 4} label={`${v}%`} size={10.5} color={C.emerald} weight={700} />
              </g>
            );
          })}
        </g>
      ))}
      {/* the stair-step frontier of the not-yet-observed triangle */}
      <path d={`M ${gx + 2 * colW} ${gy + rowH} L ${gx + 2 * colW} ${gy + 2 * rowH} L ${gx + colW} ${gy + 2 * rowH} L ${gx + colW} ${gy + 3 * rowH}`}
        fill="none" stroke={C.rose} strokeWidth={1.8} strokeDasharray="5 4" opacity={0.85} />
      <Arrow d="M 316 164 L 262 150" color={C.rose} dashed marker="arw-dfp-4" />
      <Tag x={294} y={178} label="too young — not observed yet" color={C.rose} />
      {/* same-age highlight on the M1 column */}
      <rect x={gx + colW} y={gy} width={colW} height={3 * rowH} fill={C.amber} fillOpacity={0.04} stroke={C.amber} strokeOpacity={0.5} strokeDasharray="4 3" />
      <Arrow d={`M 448 ${gy + 4} L 448 ${gy + 3 * rowH - 6}`} color={C.amber} marker="arw-dfp-4" />
      <Note x={456} y={100} label="read down:" size={9.5} anchor="start" color={C.amber} weight={700} />
      <Note x={456} y={114} label="same age" size={9.5} anchor="start" color={C.amber} />
      {/* the two reads */}
      <rect x={530} y={54} width={300} height={112} rx={8} fill={C.amber} fillOpacity={0.06} stroke={C.amber} strokeOpacity={0.35} />
      <Note x={544} y={76} label="how to read the triangle" size={10.5} anchor="start" color={C.amber} weight={700} />
      <Note x={544} y={96} label="down a column  = one age, all cohorts" size={9.5} anchor="start" color={C.zinc} />
      <Note x={544} y={114} label="across a row   = one cohort aging" size={9.5} anchor="start" color={C.zinc} />
      <Note x={544} y={132} label="Feb M1 38% vs Jan M1 42%" size={9.5} anchor="start" color={C.emerald} />
      <Note x={544} y={150} label="→ same-age comparison, fair fight" size={9.5} anchor="start" color={C.emerald} />
      <Note x={W / 2} y={HP - 8} label="never compare Feb's M1 with Jan's M2 (different ages) — read DOWN a column for the same-age read" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* sessionize-events — 30-minute gap walls cut the stream              */
/* ------------------------------------------------------------------ */

export function ArtSessionizeEvents() {
  const axisY = 132;
  const sessions: Array<{ x: number; w: number; label: string; color: string; dots: number[] }> = [
    { x: 76, w: 226, label: "session 1 · 7 events", color: C.sky, dots: [92, 118, 146, 178, 210, 246, 282] },
    { x: 352, w: 212, label: "session 2 · 6 events", color: C.violet, dots: [368, 402, 438, 478, 516, 548] },
    { x: 612, w: 182, label: "session 3 · 5 events", color: C.amber, dots: [628, 662, 700, 742, 778] },
  ];
  return (
    <g>
      <Defs id="arw-dfp-5" />
      <Note x={490} y={26} label="each dot = one event row — (user_id, event_ts), time-ordered" size={9} color={C.zinc} />
      {/* the time axis */}
      <line x1={56} y1={axisY} x2={806} y2={axisY} stroke={C.dim} strokeWidth={1.2} />
      {[[80, "10:00"], [300, "10:30"], [520, "11:00"], [740, "11:30"]].map(([tx, tl]) => (
        <g key={tl as string}>
          <line x1={tx as number} y1={axisY - 3} x2={tx as number} y2={axisY + 3} stroke={C.dim} strokeWidth={1.2} />
          <Note x={tx as number} y={axisY + 16} label={tl as string} size={9} color={C.dim} />
        </g>
      ))}
      {/* event dots */}
      {sessions.map((s) => s.dots.map((dx) => (
        <circle key={`${s.label}-${dx}`} cx={dx} cy={axisY} r={4} fill={s.color} opacity={0.9} />
      )))}
      {/* the three session boxes the walls produce */}
      {sessions.map((s) => (
        <g key={s.label}>
          <rect x={s.x} y={88} width={s.w} height={36} rx={8} fill={s.color} fillOpacity={0.08} stroke={s.color} strokeOpacity={0.55} />
          <Note x={s.x + s.w / 2} y={110} label={s.label} size={10} color={s.color} weight={700} />
        </g>
      ))}
      {/* the 30-minute gap walls */}
      <line x1={330} y1={54} x2={330} y2={150} stroke={C.rose} strokeWidth={1.6} strokeDasharray="5 4" opacity={0.9} />
      <line x1={590} y1={54} x2={590} y2={150} stroke={C.rose} strokeWidth={1.6} strokeDasharray="5 4" opacity={0.9} />
      <Tag x={330} y={44} label="wall: gap > 30 min" color={C.rose} />
      <Note x={590} y={48} label="wall" size={9} color={C.rose} />
      {/* the measured gaps */}
      <Arrow d="M 286 158 L 364 158" color={C.rose} sw={1.4} marker="arw-dfp-5" />
      <Arrow d="M 364 158 L 286 158" color={C.rose} sw={1.4} marker="arw-dfp-5" />
      <Note x={325} y={174} label="36 min > 30 → cut" size={9} color={C.rose} weight={700} />
      <Arrow d="M 552 158 L 624 158" color={C.zinc} sw={1.4} marker="arw-dfp-5" />
      <Arrow d="M 624 158 L 552 158" color={C.zinc} sw={1.4} marker="arw-dfp-5" />
      <Note x={588} y={174} label="52 min > 30 → cut" size={9} color={C.zinc} />
      <Note x={W / 2} y={HP - 8} label="sessionize = sort by (user_id, event_ts), lag() the previous event, start a new session when the gap passes 30 min" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* ab-test-conversion-lift — one lift, two denominators                */
/* ------------------------------------------------------------------ */

export function ArtAbTestConversionLift() {
  const my = (p: number) => 170 - (p / 6) * 120;
  return (
    <g>
      <Defs id="arw-dfp-6" />
      {/* chart frame */}
      <line x1={60} y1={44} x2={60} y2={170} stroke={C.dim} strokeWidth={1.2} />
      <line x1={60} y1={170} x2={500} y2={170} stroke={C.dim} strokeWidth={1.2} />
      <Note x={60} y={36} label="conv %" size={9} color={C.zinc} />
      {[2, 4, 6].map((p) => (
        <g key={p}>
          <line x1={60} y1={my(p)} x2={500} y2={my(p)} stroke={C.dim} strokeOpacity={0.25} strokeDasharray="2 4" />
          <Note x={54} y={my(p) + 3.5} label={`${p}%`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      <Note x={54} y={173} label="0" size={9} anchor="end" color={C.dim} />
      {/* the two arms */}
      <rect x={120} y={my(5)} width={120} height={170 - my(5)} rx={6} fill={C.sky} fillOpacity={0.16} stroke={C.sky} strokeOpacity={0.55} />
      <Note x={180} y={108} label="control" size={11} color={C.sky} weight={700} />
      <Note x={180} y={126} label="5.0%" size={12} color={C.sky} weight={700} />
      <rect x={340} y={my(5.5)} width={120} height={170 - my(5.5)} rx={6} fill={C.emerald} fillOpacity={0.16} stroke={C.emerald} strokeOpacity={0.55} />
      <Note x={400} y={98} label="treatment" size={11} color={C.emerald} weight={700} />
      <Note x={400} y={116} label="5.5%" size={12} color={C.emerald} weight={700} />
      {/* the lift bracket between the two tops */}
      <path d={`M 244 ${my(5)} L 310 ${my(5)} L 310 ${my(5.5)} L 336 ${my(5.5)}`} fill="none" stroke={C.rose} strokeWidth={1.6} />
      <Tag x={310} y={46} label="+0.5pp lift" color={C.rose} />
      {/* denominators under each arm */}
      <Note x={180} y={188} label="n = 4,000 · 200 conversions" size={9.5} color={C.zinc} />
      <Note x={400} y={188} label="n = 1,000 · 55 conversions" size={9.5} color={C.zinc} />
      {/* the read */}
      <rect x={540} y={44} width={290} height={116} rx={8} fill={C.rose} fillOpacity={0.06} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={554} y={66} label="one lift, two denominators" size={10.5} anchor="start" color={C.rose} weight={700} />
      <Note x={554} y={88} label="control    n = 4,000 → 200 conv" size={9.5} anchor="start" color={C.zinc} />
      <Note x={554} y={106} label="treatment  n = 1,000 →  55 conv" size={9.5} anchor="start" color={C.zinc} />
      <Note x={554} y={128} label="lift: +0.5pp absolute · +10% relative" size={9.5} anchor="start" color={C.emerald} />
      <Note x={554} y={146} label="evidence per arm: 4,000 vs 1,000 users" size={9.5} anchor="start" color={C.amber} />
      <Note x={W / 2} y={HP - 8} label="always ship n with the % — 5.5% of 1,000 is much weaker evidence than 5.0% of 4,000" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the product analytics loop                             */
/* ------------------------------------------------------------------ */

export function ArtStudyProductLoop() {
  return (
    <g>
      <Defs id="arw-dfp-s1" />
      <Note x={430} y={22} label="instrument → watch → slice → test → decide → instrument again" size={9.5} color={C.zinc} />
      {/* the pipeline */}
      <Box x={40} y={60} w={170} h={52} label="instrument events" color={C.sky} fillOpacity={0.12} fs={12} />
      <Note x={125} y={103} label="plan_event fired everywhere" size={9} color={C.dim} />
      <Box x={240} y={60} w={170} h={52} label="dashboards" color={C.violet} fillOpacity={0.12} fs={12} />
      <Note x={325} y={103} label="DAU · WAU · totals" size={9} color={C.dim} />
      <Box x={440} y={60} w={170} h={52} label="funnels & cohorts" color={C.amber} fillOpacity={0.12} fs={12} />
      <Note x={525} y={103} label="drop-off · same-age reads" size={9} color={C.dim} />
      <Box x={640} y={60} w={170} h={52} label="experiment" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Note x={725} y={103} label="one change · two arms" size={9} color={C.dim} />
      <Arrow d="M 212 86 L 236 86" color={C.zinc} marker="arw-dfp-s1" />
      <Arrow d="M 412 86 L 436 86" color={C.zinc} marker="arw-dfp-s1" />
      <Arrow d="M 612 86 L 636 86" color={C.zinc} marker="arw-dfp-s1" />
      {/* the six gates — one per problem */}
      <Tag x={125} y={44} label="sessionize" color={C.sky} />
      <Tag x={325} y={134} label="dau-wau" color={C.violet} />
      <Tag x={325} y={158} label="growth accounting" color={C.violet} />
      <Tag x={525} y={134} label="funnel" color={C.amber} />
      <Tag x={525} y={158} label="cohort matrix" color={C.amber} />
      <Tag x={725} y={44} label="A/B lift" color={C.emerald} />
      {/* decide — the loop's fork */}
      <Arrow d="M 725 114 L 692 166" color={C.rose} marker="arw-dfp-s1" />
      <Box x={548} y={170} w={190} h={48} label="decide — ship / kill" color={C.rose} fillOpacity={0.12} fs={12} />
      {/* the return arrow — the loop closes */}
      <Arrow d="M 548 194 L 125 194 L 125 118" color={C.emerald} dashed marker="arw-dfp-s1" />
      <Tag x={330} y={212} label="each decision re-plans the events" color={C.emerald} />
      <Note x={36} y={246} label="the return arrow is the whole job:" size={9} anchor="start" color={C.dim} />
      <Note x={36} y={260} label="today's ship/kill decides what" size={9} anchor="start" color={C.dim} />
      <Note x={36} y={274} label="gets instrumented next sprint" size={9} anchor="start" color={C.dim} />
      <Note x={430} y={292} label="every Product Analytics problem reads one station of this loop — and the loop never terminates" size={10} color={C.zinc} />
    </g>
  );
}
