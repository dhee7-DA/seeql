"use client";

// Data & Finance art — Retail & RFM family. One real-life concept diagram
// per problem primer (860 × 210 inner <g>) + the section study flow
// ("shop → segment → campaign", 860 × 300). Same flat pastel language as
// lc-df-art-bank.tsx: palette C, mono micro-labels, 1px strokes, rounded 8
// rects, no gradients / filters / shadows / external fonts. Marker ids
// arw-dfr-1..6 + arw-dfr-s1 are unique to this family.

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

function Arrow({ d, color, dashed = false, marker = "arw-dfr-1", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* 8067 basket-depth-aov — the items join defines the basket           */
/* ------------------------------------------------------------------ */

export function ArtBasketDepthAov() {
  const bw = 26, uh = 9; // bar width / unit-block height
  const months: Array<[string, number, string, number[]]> = [
    // [month label, first bar x, color, units per order]
    ["2026-07 · depth 2.7", 84, C.sky, [3, 1, 4]],
    ["2026-08 · depth 2.0", 300, C.violet, [1, 1, 1, 1]],
    ["2026-09 · depth 4.5", 480, C.amber, [1, 12, 3, 2]],
  ];
  const aov = ["AOV 4500¢", "AOV 2525¢", "AOV 24375¢"];
  const bx = (x0: number, i: number) => x0 + i * (bw + 8);
  return (
    <g>
      <Defs id="arw-dfr-1" />
      <Note x={60} y={44} label="bar height = units in the basket" size={8.5} anchor="start" color={C.dim} />
      <line x1={60} y1={168} x2={630} y2={168} stroke={C.dim} strokeWidth={1.2} />
      {months.map(([label, x0, color, qtys], m) => {
        const lastEnd = bx(x0, qtys.length - 1) + bw;
        return (
          <g key={label}>
            {qtys.map((n, i) => {
              const bulk = m === 2 && i === 1;
              const bc = bulk ? C.rose : color;
              return (
                <g key={i}>
                  {Array.from({ length: n }).map((_, u) => (
                    <rect key={u} x={bx(x0, i)} y={160 - uh * u} width={bw} height={8}
                      fill={bc} fillOpacity={bulk ? 0.4 : 0.28} stroke={bc} strokeOpacity={0.55} />
                  ))}
                  <Note x={bx(x0, i) + bw / 2} y={169 - uh * n - 5} label={`${n}`} size={9} color={bc} weight={700} />
                </g>
              );
            })}
            {/* AOV bracket spans only the real baskets — never the ghost */}
            <path d={`M ${x0 - 4} 36 L ${x0 - 4} 30 L ${lastEnd + 4} 30 L ${lastEnd + 4} 36`} fill="none" stroke={color} strokeWidth={1.4} />
            <Note x={(x0 - 4 + lastEnd + 4) / 2} y={22} label={aov[m]} size={10} color={color} weight={700} />
            <Note x={(x0 - 4 + lastEnd + 4) / 2} y={186} label={label} size={9} color={C.zinc} />
          </g>
        );
      })}
      {/* the zero-item order — grayed out, outside every bracket */}
      <rect x={196} y={158} width={26} height={10} fill={C.zinc} fillOpacity={0.07} stroke={C.zinc} strokeOpacity={0.6} strokeDasharray="3 3" />
      <line x1={200} y1={160} x2={218} y2={166} stroke={C.rose} strokeWidth={1.4} />
      <line x1={218} y1={160} x2={200} y2={166} stroke={C.rose} strokeWidth={1.4} />
      <Note x={209} y={152} label="999¢" size={8} color={C.dim} />
      <Tag x={238} y={120} label="0 items — not a basket" color={C.rose} anchor="start" />
      <Tag x={238} y={142} label="LEFT JOIN keeps it → AOV 3625" color={C.rose} anchor="start" />
      <Arrow d="M 234 144 L 224 156" color={C.rose} dashed sw={1.2} marker="arw-dfr-1" />
      {/* the September bulk basket — one line, twelve units */}
      <Tag x={700} y={70} label="the 90000¢ bulk basket" color={C.rose} />
      <Tag x={700} y={96} label="doubled depth · multiplied AOV" color={C.rose} />
      <Arrow d="M 626 72 L 546 66" color={C.rose} sw={1.2} marker="arw-dfr-1" />
      <Note x={430} y={204} label="the items join defines the basket — a zero-item order never enters AOV or depth" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8068 repeat-purchase-rate — one-timers stay in the denominator      */
/* ------------------------------------------------------------------ */

export function ArtRepeatPurchaseRate() {
  return (
    <g>
      <Defs id="arw-dfr-2" />
      <line x1={430} y1={26} x2={430} y2={188} stroke={C.dim} strokeWidth={1} strokeDasharray="2 4" strokeOpacity={0.6} />
      {/* 2026-07 — the habit month */}
      <Tag x={150} y={30} label="2026-07 · habit month" color={C.sky} />
      <path d="M 98 92 A 32 32 0 0 1 162 92" fill="none" stroke={C.zinc} strokeWidth={5} strokeOpacity={0.18} />
      <path d="M 98 92 A 32 32 0 0 1 120.11 61.57" fill="none" stroke={C.emerald} strokeWidth={5} />
      <Note x={130} y={88} label="40.0%" size={13} color={C.emerald} weight={700} />
      <Note x={130} y={104} label="of 5 customers" size={8} color={C.dim} />
      <Note x={214} y={74} label="2+ orders · 2" size={9} anchor="start" color={C.zinc} />
      <circle cx={330} cy={70} r={6} fill={C.emerald} />
      <circle cx={354} cy={70} r={6} fill={C.emerald} />
      <Note x={214} y={88} label="one is ×4 — still counts once" size={8} anchor="start" color={C.dim} />
      <Note x={214} y={106} label="1 order · 3" size={9} anchor="start" color={C.zinc} />
      {[330, 352, 374].map((x) => (
        <circle key={x} cx={x} cy={102} r={5.5} fill="none" stroke={C.zinc} strokeWidth={1.4} />
      ))}
      <Box x={214} y={120} w={186} h={34} label="2 ÷ 5 → 40.0%" color={C.emerald} fillOpacity={0.1} fs={12} />
      <Note x={214} y={172} label="one-timers stay in the denominator" size={9} anchor="start" color={C.rose} />
      {/* 2026-08 — the promo month */}
      <Tag x={550} y={30} label="2026-08 · promo month" color={C.amber} />
      <path d="M 578 92 A 32 32 0 0 1 642 92" fill="none" stroke={C.zinc} strokeWidth={5} strokeOpacity={0.18} />
      <path d="M 578 92 A 32 32 0 0 1 581.15 78.16" fill="none" stroke={C.amber} strokeWidth={5} />
      <Note x={610} y={88} label="14.29%" size={12.5} color={C.amber} weight={700} />
      <Note x={610} y={104} label="of 7 customers" size={8} color={C.dim} />
      <Note x={694} y={74} label="2+ orders · 1" size={9} anchor="start" color={C.zinc} />
      <circle cx={790} cy={70} r={6} fill={C.emerald} />
      <Note x={694} y={106} label="1 order · 6" size={9} anchor="start" color={C.zinc} />
      {[740, 757, 774, 791, 808, 825].map((x) => (
        <circle key={x} cx={x} cy={102} r={4.5} fill="none" stroke={C.zinc} strokeWidth={1.4} />
      ))}
      <Box x={694} y={120} w={132} h={34} label="1 ÷ 7 → 14.29%" color={C.amber} fillOpacity={0.1} fs={11.5} />
      <Note x={694} y={172} label="the promo bought one-timers" size={9} anchor="start" color={C.amber} />
      <Note x={430} y={204} label="repeat rate = customers with 2+ orders ÷ every customer who ordered that month" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8069 rfm-segmentation — quintile grid + first-match ladder          */
/* ------------------------------------------------------------------ */

export function ArtRfmSegmentation() {
  const gx = 150, gy = 26, cs = 32; // grid origin / cell size
  const seg = (r: number, f: number): [string, number] =>
    r >= 4 && f >= 4 ? [C.emerald, 0.16] : r >= 4 ? [C.cyan, 0.13] : r === 3 ? [C.violet, 0.11] : f >= 4 ? [C.rose, 0.14] : [C.amber, 0.12];
  return (
    <g>
      <Defs id="arw-dfr-3" />
      {/* the 5×5 quintile grid — R runs 5 (recent) → 1 (stale) downward */}
      {[5, 4, 3, 2, 1].map((r) =>
        [1, 2, 3, 4, 5].map((f) => {
          const [color, fo] = seg(r, f);
          return (
            <rect key={`${r}-${f}`} x={gx + (f - 1) * cs} y={gy + (5 - r) * cs} width={cs - 1} height={cs - 1}
              fill={color} fillOpacity={fo} stroke={color} strokeOpacity={0.4} />
          );
        })
      )}
      {[5, 4, 3, 2, 1].map((r) => (
        <Note key={r} x={142} y={gy + (5 - r) * cs + 19} label={`${r}`} size={9} anchor="end" color={C.dim} />
      ))}
      {[1, 2, 3, 4, 5].map((f) => (
        <Note key={f} x={gx + (f - 1) * cs + 16} y={198} label={`${f}`} size={9} color={C.dim} />
      ))}
      <Note x={146} y={18} label="R ↑" size={8.5} anchor="end" color={C.zinc} />
      <Note x={146} y={198} label="F →" size={8.5} anchor="end" color={C.zinc} />
      {/* named segments in their cells (seed coverage counts) */}
      <Note x={278} y={45} label="champion ×2" size={8.5} color={C.emerald} weight={700} />
      <Note x={278} y={54} label="m ≥ 4" size={7} color={C.dim} />
      <Note x={278} y={77} label="loyal ×1" size={8.5} color={C.sky} weight={700} />
      <Note x={278} y={86} label="m < 4" size={7} color={C.dim} />
      <Note x={198} y={57} label="promising ×1" size={8.5} color={C.cyan} weight={700} />
      <Note x={198} y={70} label="recent · infrequent" size={7} color={C.dim} />
      <Note x={230} y={109} label="core ×2 — r exactly 3" size={8.5} color={C.violet} weight={700} />
      <Note x={278} y={141} label="at risk ×1" size={8.5} color={C.rose} weight={700} />
      <Note x={278} y={154} label="was frequent" size={7} color={C.dim} />
      <Note x={198} y={141} label="hibernating ×5" size={8.5} color={C.amber} weight={700} />
      <Note x={198} y={154} label="stale · quiet" size={7} color={C.dim} />
      {/* the first-match ladder */}
      <Note x={350} y={40} label="first match wins — ladder order is logic" size={9.5} anchor="start" color={C.amber} weight={700} />
      <Arrow d="M 340 50 L 340 162" color={C.dim} dashed sw={1.2} marker="arw-dfr-3" />
      <Note x={350} y={58} label="r ≥ 4 · f ≥ 4 · m ≥ 4 → champion" size={9.5} anchor="start" color={C.emerald} weight={700} />
      <Note x={350} y={78} label="r ≥ 4 · f ≥ 4 → loyal" size={9.5} anchor="start" color={C.sky} weight={700} />
      <Note x={350} y={98} label="r ≥ 4 → promising" size={9.5} anchor="start" color={C.cyan} weight={700} />
      <Note x={350} y={118} label="r ≤ 2 · f ≥ 4 → at risk" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={350} y={138} label="r ≤ 2 → hibernating" size={9.5} anchor="start" color={C.amber} weight={700} />
      <Note x={350} y={158} label="else → core" size={9.5} anchor="start" color={C.violet} weight={700} />
      {/* the two traps that move customers */}
      <rect x={560} y={48} width={268} height={48} rx={8} fill={C.rose} fillOpacity={0.05} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={572} y={66} label="the m gate: customer 3 reads (4, 4, 1)" size={9} anchor="start" color={C.rose} />
      <Note x={572} y={82} label="frequent tiny baskets — loyal, NOT champion" size={9} anchor="start" color={C.zinc} />
      <rect x={560} y={108} width={268} height={48} rx={8} fill={C.cyan} fillOpacity={0.05} stroke={C.cyan} strokeOpacity={0.35} />
      <Note x={572} y={126} label="NTILE(5) deals 12 customers into tiles" size={9} anchor="start" color={C.cyan} />
      <Note x={572} y={142} label="3·3·2·2·2 — remainder lands in the FIRST tiles" size={9} anchor="start" color={C.zinc} />
      <Note x={350} y={180} label="seed coverage: 2 champion · 1 loyal · 1 promising · 1 at risk · 2 core · 5 hibernating" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={206} label="three quintile scores, one first-match ladder — flip the r direction and champions read at risk" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8070 weeks-of-supply — stock vs the 4-week burn, the 2.0 wall       */
/* ------------------------------------------------------------------ */

export function ArtWeeksOfSupply() {
  const wk = 82, x0w = 86, yb = 150; // px per week, week-0 x, baseline
  const rows: Array<[string, string, number | null, string, string, string]> = [
    // sku, on-hand note, weeks-of-supply (null = zero-sales sentinel), bar color, wos label, label color
    ["FST-1101", "140 on hand", 0.5, C.rose, "0.5", C.rose],
    ["BND-4477", "200 on hand", 2, C.amber, "2.0", C.amber],
    ["OKG-2205", "480 on hand", 5.3, C.emerald, "5.3", C.emerald],
    ["OVR-3390", "2400 on hand", 7.5, C.zinc, "32 →", C.zinc],
    ["NOS-5512", "310 on hand", null, C.dim, "99.9 — no sales sentinel", C.rose],
  ];
  return (
    <g>
      <Defs id="arw-dfr-4" />
      {/* burn-down: units on hand vs weeks at the trailing weekly pace */}
      <line x1={x0w} y1={40} x2={x0w} y2={yb} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0w} y1={yb} x2={420} y2={yb} stroke={C.dim} strokeWidth={1.2} />
      {[0, 100, 200].map((u) => (
        <Note key={u} x={80} y={yb - u * 0.5 + 3} label={`${u}`} size={8.5} anchor="end" color={C.dim} />
      ))}
      <Note x={80} y={34} label="units on hand" size={8.5} anchor="end" color={C.zinc} />
      {/* remaining stock under each burn line */}
      <path d="M 86 80 L 127 150 L 86 150 Z" fill={C.rose} fillOpacity={0.07} />
      <path d="M 86 50 L 250 150 L 86 150 Z" fill={C.amber} fillOpacity={0.06} />
      <path d="M 86 80 L 127 150" fill="none" stroke={C.rose} strokeWidth={2.2} />
      <path d="M 86 50 L 250 150" fill="none" stroke={C.amber} strokeWidth={2.2} />
      <circle cx={86} cy={80} r={3.5} fill={C.rose} />
      <circle cx={86} cy={50} r={3.5} fill={C.amber} />
      <Note x={94} y={74} label="140" size={8.5} anchor="start" color={C.rose} weight={700} />
      <Note x={94} y={46} label="200" size={8.5} anchor="start" color={C.amber} weight={700} />
      <Note x={134} y={128} label="−280 u/wk" size={8} anchor="start" color={C.dim} />
      <Note x={180} y={90} label="−100 u/wk" size={8} anchor="start" color={C.dim} />
      <circle cx={127} cy={150} r={4} fill={C.rose} />
      <circle cx={250} cy={150} r={5} fill="none" stroke={C.amber} strokeWidth={1.6} />
      {/* the 2.0-week reorder wall */}
      <line x1={250} y1={34} x2={250} y2={154} stroke={C.rose} strokeWidth={1.4} strokeDasharray="4 3" />
      <Tag x={250} y={24} label="reorder line · 2.0 wks" color={C.rose} />
      <Note x={127} y={182} label="0.5 wks → reorder 1" size={9} color={C.rose} weight={700} />
      <Note x={268} y={182} label="exactly 2.0 → reorder 0" size={9} color={C.amber} weight={700} />
      {[0, 1, 2, 3, 4].map((w) => (
        <Note key={w} x={x0w + w * wk} y={164} label={`${w}`} size={8.5} color={C.dim} />
      ))}
      <Note x={438} y={176} label="weeks" size={8.5} anchor="start" color={C.zinc} />
      {/* the buyer's roster — one bar per sku, wall echoed at 2.0 */}
      <Note x={470} y={36} label="pace = 28-day units ÷ 4 weeks" size={9} anchor="start" color={C.zinc} />
      <line x1={640} y1={44} x2={640} y2={166} stroke={C.rose} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.45} />
      {rows.map(([sku, micro, wks, color, label, lc], i) => {
        const y = 54 + i * 26;
        return (
          <g key={sku}>
            <Note x={470} y={y + 3} label={sku} size={10} anchor="start" color={wks === null ? C.zinc : color} weight={700} />
            <Note x={470} y={y + 13} label={micro} size={7.5} anchor="start" color={C.dim} />
            {wks === null ? (
              <g>
                <rect x={580} y={y - 5} width={30} height={10} fill="none" stroke={C.zinc} strokeOpacity={0.6} strokeDasharray="3 3" />
                <Note x={618} y={y + 3} label={label} size={9} anchor="start" color={lc} weight={700} />
              </g>
            ) : (
              <g>
                <rect x={580} y={y - 5} width={wks * 30} height={10} fill={color} fillOpacity={0.3} stroke={color} strokeOpacity={0.5} />
                {wks === 7.5 ? <Arrow d={`M 805 ${y} L 818 ${y}`} color={C.zinc} dashed sw={1.4} marker="arw-dfr-4" /> : null}
                <Note x={wks === 7.5 ? 822 : 580 + wks * 30 + 8} y={y + 3} label={label} size={9} anchor="start" color={lc} weight={700} />
              </g>
            )}
          </g>
        );
      })}
      <Note x={580} y={176} label="bar = weeks of supply" size={8} anchor="start" color={C.dim} />
      <Note x={430} y={204} label="wos = on-hand ÷ weekly pace — below 2.0 reorder; zero sales → the 99.9 sentinel, never ÷0" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8071 returns-rate-by-category — pooled rate vs the 8.0% wall        */
/* ------------------------------------------------------------------ */

export function ArtReturnsRateByCategory() {
  const px0 = 560, pp = 17.857; // % ruler origin, px per percent
  const wall = px0 + 8 * pp; // 702.9 — the 8.0% wall
  const rows: Array<[string, number, number, number, string]> = [
    // category, sold units, returned units, row y, printed rate
    ["Accessories", 40, 5, 58, "12.5%"],
    ["Footwear", 200, 20, 94, "10.0%"],
    ["Outerwear", 250, 20, 130, "8.00%"],
    ["Home", 180, 0, 166, "0.0%"],
  ];
  const su = 0.96; // px per sold unit
  return (
    <g>
      <Defs id="arw-dfr-5" />
      <rect x={90} y={16} width={10} height={8} fill={C.emerald} fillOpacity={0.3} stroke={C.emerald} strokeOpacity={0.5} />
      <Note x={106} y={23} label="sold units" size={8.5} anchor="start" color={C.zinc} />
      <rect x={160} y={16} width={10} height={8} fill={C.rose} fillOpacity={0.5} stroke={C.rose} strokeOpacity={0.5} />
      <Note x={176} y={23} label="returned units" size={8.5} anchor="start" color={C.zinc} />
      {rows.map(([cat, sold, ret, y, rate]) => {
        const pct = (100 * ret) / sold;
        const flagged = pct > 8;
        const color = flagged ? C.rose : ret === 0 ? C.emerald : C.amber;
        return (
          <g key={cat}>
            <Note x={78} y={y + 2} label={cat} size={10} anchor="end" color={C.zinc} weight={700} />
            <rect x={90} y={y - 14} width={sold * su} height={11} fill={C.emerald} fillOpacity={0.22} stroke={C.emerald} strokeOpacity={0.45} />
            <Note x={90 + sold * su + 6} y={y - 6} label={`${sold} sold`} size={8} anchor="start" color={C.emerald} />
            {ret > 0 ? (
              <g>
                <rect x={90} y={y + 1} width={ret * su} height={11} fill={C.rose} fillOpacity={0.45} stroke={C.rose} strokeOpacity={0.5} />
                <Note x={90 + ret * su + 6} y={y + 9} label={`${ret} returned`} size={8} anchor="start" color={C.rose} />
              </g>
            ) : (
              <g>
                <rect x={90} y={y + 1} width={2} height={11} fill={C.zinc} fillOpacity={0.3} />
                <Note x={98} y={y + 9} label="0 returned — LEFT JOIN keeps the category" size={8} anchor="start" color={C.dim} />
              </g>
            )}
            {/* the rate strip — Outerwear touches the wall, never crosses */}
            {ret > 0 ? (
              <rect x={px0} y={y - 4} width={pct * pp} height={8} fill={color} fillOpacity={flagged ? 0.5 : 0.35} stroke={color} strokeOpacity={0.5} />
            ) : (
              <rect x={px0} y={y - 4} width={2} height={8} fill={C.zinc} fillOpacity={0.4} />
            )}
            <Note x={px0 + pct * pp + 6} y={y + 3} label={rate} size={9.5} anchor="start" color={color} weight={700} />
            <Note x={px0 + pct * pp + 6} y={y + 14} label={flagged ? "flagged" : ret === 0 ? "clean · no return rows" : "not flagged"} size={7.5} anchor="start" color={color} />
          </g>
        );
      })}
      <line x1={wall} y1={30} x2={wall} y2={184} stroke={C.rose} strokeWidth={1.4} strokeDasharray="4 3" />
      <Tag x={703} y={20} label="8.0% wall — strictly above flags" color={C.rose} />
      <line x1={px0} y1={184} x2={815} y2={184} stroke={C.dim} strokeWidth={1.2} />
      {[0, 4, 8, 12].map((v) => (
        <g key={v}>
          <line x1={px0 + v * pp} y1={184} x2={px0 + v * pp} y2={189} stroke={C.dim} strokeWidth={1.2} />
          <Note x={px0 + v * pp} y={198} label={v === 12 ? "12%" : `${v}`} size={8.5} color={C.dim} />
        </g>
      ))}
      <Note x={552} y={122} label="return %" size={8.5} anchor="end" color={C.zinc} />
      <Note x={430} y={206} label="rate = returned ÷ sold, pooled per category — averaging per-sku rates reads Outerwear 8.33 and flips the flag" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8072 cohort-repeat-revenue — the money triangle M0 / M1 / M2        */
/* ------------------------------------------------------------------ */

export function ArtCohortRepeatRevenue() {
  const rows: Array<[string, number, number | null, number | null, number]> = [
    // cohort month, m0, m1, m2 (null = not yet), row y
    ["2026-05", 15000, 2000, 4500, 50],
    ["2026-06", 12500, 3500, null, 96],
    ["2026-07", 15000, null, null, 142],
  ];
  return (
    <g>
      <Defs id="arw-dfr-6" />
      <rect x={140} y={28} width={10} height={8} fill={C.sky} fillOpacity={0.4} stroke={C.sky} strokeOpacity={0.5} />
      <Note x={156} y={35} label="M0 · first month" size={8.5} anchor="start" color={C.zinc} />
      <rect x={280} y={28} width={10} height={8} fill={C.emerald} fillOpacity={0.4} stroke={C.emerald} strokeOpacity={0.5} />
      <Note x={296} y={35} label="M1 · +1 month" size={8.5} anchor="start" color={C.zinc} />
      <rect x={370} y={28} width={10} height={8} fill={C.cyan} fillOpacity={0.4} stroke={C.cyan} strokeOpacity={0.5} />
      <Note x={386} y={35} label="M2 · +2 months" size={8.5} anchor="start" color={C.zinc} />
      {rows.map(([cohort, m0, m1, m2, y]) => {
        const m0w = m0 * 0.01;
        const m1x = 140 + m0w + 4;
        const m2x = m1 === null ? m1x + 24 : m1x + m1 * 0.01 + 4;
        return (
          <g key={cohort}>
            <Note x={130} y={y + 15} label={cohort} size={10} anchor="end" color={C.zinc} weight={700} />
            <rect x={140} y={y} width={m0w} height={24} fill={C.sky} fillOpacity={0.18} stroke={C.sky} strokeOpacity={0.5} />
            <Note x={140 + m0w / 2} y={y + 15} label={`${m0}`} size={9} color={C.sky} weight={700} />
            {m1 === null ? (
              <g>
                <rect x={m1x} y={y} width={20} height={24} fill="none" stroke={C.zinc} strokeOpacity={0.5} strokeDasharray="3 3" />
                <Note x={m1x + 10} y={y + 15} label="m1" size={7.5} color={C.dim} />
              </g>
            ) : (
              <g>
                <rect x={m1x} y={y} width={m1 * 0.01} height={24} fill={C.emerald} fillOpacity={0.28} stroke={C.emerald} strokeOpacity={0.5} />
                <Note x={m1x + (m1 * 0.01) / 2} y={y - 4} label={`${m1}`} size={8} color={C.emerald} weight={700} />
              </g>
            )}
            {m2 === null ? (
              <g>
                <rect x={m2x} y={y} width={22} height={24} fill="none" stroke={C.zinc} strokeOpacity={0.5} strokeDasharray="3 3" />
                <Note x={m2x + 11} y={y + 15} label="m2" size={7.5} color={C.dim} />
              </g>
            ) : (
              <g>
                <rect x={m2x} y={y} width={m2 * 0.01} height={24} fill={C.cyan} fillOpacity={0.28} stroke={C.cyan} strokeOpacity={0.5} />
                <Note x={m2x + (m2 * 0.01) / 2} y={y - 4} label={`${m2}`} size={8} color={C.cyan} weight={700} />
              </g>
            )}
          </g>
        );
      })}
      {/* repeat-share brackets group M1 + M2 — the slice that came back */}
      <path d="M 294 84 L 294 78 L 363 78 L 363 84" fill="none" stroke={C.dim} strokeWidth={1.2} />
      <Note x={371} y={84} label="repeat share 30.23%" size={9} anchor="start" color={C.amber} weight={700} />
      <Note x={371} y={98} label="customer 102 skipped a month — lands at offset 2" size={8} anchor="start" color={C.dim} />
      <path d="M 269 130 L 269 124 L 304 124 L 304 130" fill="none" stroke={C.dim} strokeWidth={1.2} />
      <Note x={312} y={130} label="repeat share 21.88%" size={9} anchor="start" color={C.amber} weight={700} />
      <Note x={312} y={141} label="m2 is in the future — zero for now, cohort still reports" size={8} anchor="start" color={C.dim} />
      <Note x={348} y={158} label="0.0% — youngest cohort: repeat money hasn't happened yet" size={9} anchor="start" color={C.rose} weight={700} />
      <rect x={640} y={56} width={190} height={88} rx={8} fill={C.amber} fillOpacity={0.05} stroke={C.amber} strokeOpacity={0.35} />
      <Note x={654} y={76} label="reading the triangle" size={9.5} anchor="start" color={C.amber} weight={700} />
      <Note x={654} y={94} label="young cohorts look flat —" size={9} anchor="start" color={C.zinc} />
      <Note x={654} y={110} label="M1 and M2 haven't happened" size={9} anchor="start" color={C.zinc} />
      <Note x={654} y={128} label="repeat share prices the loyalty" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={204} label="per first-order cohort: revenue at month 0, 1, 2 — repeat share is the slice that came back" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — shop → segment → campaign, the loop retention lives in */
/* ------------------------------------------------------------------ */

export function ArtStudyShopToSegment() {
  const HF = 300;
  const gate = (x: number, y: number, n: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r={8} fill="#09090b" stroke={C.amber} strokeWidth={1.2} />
      <text x={x} y={y + 3} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={700} fill={C.amber}>{n}</text>
    </g>
  );
  return (
    <g>
      <Defs id="arw-dfr-s1" />
      {/* lane 1 — the shopping flow */}
      <Box x={40} y={46} w={136} h={52} label="Browse" color={C.sky} fillOpacity={0.12} fs={12.5} />
      <Note x={108} y={114} label="the storefront" size={9} color={C.dim} />
      <Box x={224} y={46} w={150} h={52} label="First order" color={C.amber} fillOpacity={0.12} fs={12.5} />
      <Note x={299} y={114} label="basket depth · AOV" size={9} color={C.dim} />
      <Box x={422} y={46} w={150} h={52} label="Repeat orders" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Note x={497} y={114} label="the habit read" size={9} color={C.dim} />
      <Box x={620} y={46} w={200} h={52} label="RFM segment" color={C.violet} fillOpacity={0.12} fs={12.5} />
      <Note x={720} y={114} label="recency · frequency · monetary" size={9} color={C.dim} />
      <Arrow d="M 180 72 L 220 72" color={C.zinc} marker="arw-dfr-s1" />
      <Arrow d="M 378 72 L 418 72" color={C.zinc} marker="arw-dfr-s1" />
      <Arrow d="M 576 72 L 616 72" color={C.zinc} marker="arw-dfr-s1" />
      {gate(224, 46, 1)}{gate(422, 46, 2)}{gate(620, 46, 5)}
      {/* lane 2 — the side reads every stage owes */}
      <Box x={40} y={142} w={150} h={44} label="Returns wall" color={C.rose} fillOpacity={0.12} fs={11.5} />
      <Note x={95} y={198} label="strictly above 8.0 flags" size={8.5} color={C.dim} />
      <Box x={224} y={142} w={150} h={44} label="Stock on hand" color={C.cyan} fillOpacity={0.12} fs={11.5} />
      <Note x={299} y={198} label="burns at the 4-week pace" size={8.5} color={C.dim} />
      <rect x={422} y={142} width={150} height={44} rx={8} fill={C.emerald} fillOpacity={0.12} stroke={C.emerald} strokeOpacity={0.55} />
      <Note x={497} y={162} label="Cohort money" size={11} color={C.emerald} weight={700} />
      <Note x={497} y={177} label="M0 → M1 → M2" size={8.5} color={C.zinc} />
      <Box x={620} y={142} w={200} h={44} label="Campaign targeting" color={C.fuchsia} fillOpacity={0.12} fs={11.5} />
      <Note x={720} y={198} label="segments become audiences" size={8.5} color={C.dim} />
      <Arrow d="M 250 98 C 230 118, 196 128, 152 138" color={C.rose} sw={1.4} marker="arw-dfr-s1" />
      <Arrow d="M 299 98 L 299 138" color={C.cyan} sw={1.4} marker="arw-dfr-s1" />
      <Note x={306} y={130} label="ships units" size={8} anchor="start" color={C.cyan} />
      <Arrow d="M 497 98 L 497 138" color={C.emerald} sw={1.4} marker="arw-dfr-s1" />
      <Arrow d="M 720 98 L 720 138" color={C.violet} sw={1.4} marker="arw-dfr-s1" />
      {gate(40, 142, 3)}{gate(224, 142, 4)}{gate(422, 142, 6)}
      {/* the campaign loop-back — segments send shoppers to the storefront */}
      <path d="M 616 172 C 520 230, 330 238, 232 200 C 210 190, 205 150, 202 112 C 201 96, 200 88, 199 80"
        fill="none" stroke={C.fuchsia} strokeWidth={1.6} strokeDasharray="5 4" markerEnd="url(#arw-dfr-s1)" opacity={0.85} />
      <Tag x={410} y={248} label="campaigns bring buyers back" color={C.fuchsia} />
      <Note x={430} y={HF - 8} label="six gates: 1 basket 8067 · 2 repeat rate 8068 · 3 returns 8071 · 4 weeks of supply 8070 · 5 RFM 8069 · 6 revenue cohorts 8072" size={9.5} color={C.zinc} />
    </g>
  );
}

export const RETAIL_ART_W = W;
export const RETAIL_ART_H = HP;
