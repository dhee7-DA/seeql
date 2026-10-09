"use client";

// Data & Finance art — Fraud & AML family: one real-life concept diagram per
// problem primer + the section study flow ("the payments pipeline").

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

function Arrow({ d, color, dashed = false, marker = "arw-dff", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* 8031 structuring-detection — deposits under the CTR wall            */
/* ------------------------------------------------------------------ */

export function ArtStructuringDetection() {
  const wallY = 56;
  const baseY = 168;
  const scale = 0.00009; // cents → px
  const deposits: Array<[number, number, string, string]> = [
    [120, 260000, "2,600", C.rose], [180, 260000, "2,600", C.rose],
    [240, 260000, "2,600", C.rose], [300, 260000, "2,600", C.rose],
    [420, 1200000, "12,000", C.emerald], [540, 450000, "4,500", C.zinc], [600, 450000, "4,500", C.zinc],
  ];
  return (
    <g>
      <Defs id="arw-dff-1" />
      {/* the wall */}
      <line x1={70} y1={wallY} x2={800} y2={wallY} stroke={C.rose} strokeWidth={1.6} strokeDasharray="6 4" />
      <Tag x={770} y={wallY - 14} label="CTR wall — $10,000" color={C.rose} anchor="end" />
      <Note x={76} y={wallY - 14} label="cash reports anything at or above this line" size={9.5} anchor="start" color={C.rose} />
      <line x1={70} y1={baseY} x2={800} y2={baseY} stroke={C.dim} strokeWidth={1.2} />
      {deposits.map(([x, amt, label, color], i) => {
        const h = amt * scale;
        return (
          <g key={i}>
            <rect x={x} y={baseY - h} width={40} height={h} rx={4} fill={color} fillOpacity={0.4} stroke={color} strokeOpacity={0.7} />
            <Note x={x + 20} y={baseY + 16} label={label} size={9} color={color} />
          </g>
        );
      })}
      {/* structuring group annotation */}
      <rect x={108} y={wallY + 8} width={244} height={baseY - wallY - 12} rx={8} fill="none" stroke={C.rose} strokeOpacity={0.6} strokeDasharray="3 3" />
      <Tag x={230} y={baseY - 224 + 196} label="4 × under the wall, day total 10,400 — FLAGGED" color={C.rose} />
      <Tag x={510} y={wallY + 22} label="legitimately reported — single deposit AT the wall is not structuring" color={C.emerald} />
      <Tag x={570} y={wallY + 74} label="two deposits, count < 3 — not flagged" color={C.zinc} />
      <Note x={430} y={202} label="every slice under the wall, the SUM over it — that gap is the crime" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8032 transaction-velocity — buckets on a time axis                  */
/* ------------------------------------------------------------------ */

export function ArtTransactionVelocity() {
  const x0 = 70, x1 = 790, ay = 120;
  const bucketW = 120;
  const dots: Array<[number, number, string]> = [
    [86, 11, C.rose], [102, 11, C.rose], [118, 11, C.rose], [134, 11, C.rose], [150, 11, C.rose],
    [268, 12, C.amber], [292, 12, C.amber], [322, 12, C.amber],
    [474, 13, C.zinc], [486, 13, C.zinc],
    [502, 13, C.zinc], [514, 13, C.zinc],
    [668, 14, C.sky], [690, 14, C.sky], [712, 14, C.sky], [740, 14, C.dim],
  ];
  return (
    <g>
      <Defs id="arw-dff-2" />
      {/* 300-second buckets */}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <g key={i}>
          <rect x={x0 + i * bucketW} y={ay - 52} width={bucketW - 4} height={86} rx={6}
            fill={(i % 2 === 0 ? C.violet : C.blue)} fillOpacity={0.05} stroke={(i % 2 === 0 ? C.violet : C.blue)} strokeOpacity={0.3} />
          <Note x={x0 + i * bucketW + (bucketW - 4) / 2} y={ay + 48} label={`300s`} size={8.5} color={C.dim} />
        </g>
      ))}
      <line x1={x0} y1={ay + 20} x2={x1} y2={ay + 20} stroke={C.dim} strokeWidth={1.2} />
      {dots.map(([x, card, color], i) => (
        <g key={i}>
          <circle cx={x} cy={ay - 18} r={4.5} fill={color} fillOpacity={0.9} />
          <line x1={x} y1={ay - 12} x2={x} y2={ay + 20} stroke={color} strokeOpacity={0.4} strokeWidth={1} />
          <Note x={x} y={ay + 34} label={`${card}`} size={8.5} color={color} />
        </g>
      ))}
      {/* flags */}
      <Tag x={150} y={ay - 66} label="card 11 — 5 purchases, count ≥ 4 → FLAG" color={C.rose} />
      <Tag x={300} y={ay - 66} label="card 12 — 3 × big, total ≥ 500,000 → FLAG" color={C.amber} />
      <Tag x={494} y={ay - 66} label="card 13 — the burst straddles the edge: neither bucket flags" color={C.zinc} />
      <Tag x={704} y={ay - 66} label="card 14 — refund (dim) never counts" color={C.sky} />
      <Note x={430} y={202} label="window_start = (txn_ts / 300) * 300 — integer math, purchases only" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8033 circular-transfers — the boomerang                             */
/* ------------------------------------------------------------------ */

export function ArtCircularTransfers() {
  return (
    <g>
      <Defs id="arw-dff-3" />
      {/* accounts */}
      <circle cx={170} cy={100} r={34} fill={C.sky} fillOpacity={0.12} stroke={C.sky} strokeOpacity={0.6} />
      <Note x={170} y={104} label="A" size={15} color={C.sky} weight={700} />
      <circle cx={420} cy={100} r={34} fill={C.amber} fillOpacity={0.12} stroke={C.amber} strokeOpacity={0.6} />
      <Note x={420} y={104} label="B" size={15} color={C.amber} weight={700} />
      {/* out and back */}
      <path d="M 206 84 C 280 58, 312 58, 384 84" fill="none" stroke={C.amber} strokeWidth={2} markerEnd="url(#arw-dff-3)" />
      <Tag x={296} y={54} label="A → B · 700,000 ¢ · day 0" color={C.amber} />
      <path d="M 384 118 C 312 146, 278 146, 206 118" fill="none" stroke={C.emerald} strokeWidth={2} markerEnd="url(#arw-dff-3)" />
      <Tag x={296} y={162} label="B → A · 700,000 ¢ · day 0" color={C.emerald} />
      {/* the wall */}
      <line x1={170} y1={30} x2={170} y2={196} stroke={C.dim} strokeOpacity={0.5} strokeWidth={1} strokeDasharray="3 4" />
      <Note x={170} y={22} label="outbound" size={9} color={C.dim} />
      {/* the chain that is NOT a pair */}
      <circle cx={620} cy={62} r={26} fill={C.zinc} fillOpacity={0.08} stroke={C.dim} strokeOpacity={0.6} />
      <Note x={620} y={66} label="A" size={12} color={C.zinc} />
      <circle cx={726} cy={62} r={26} fill={C.zinc} fillOpacity={0.08} stroke={C.dim} strokeOpacity={0.6} />
      <Note x={726} y={66} label="B" size={12} color={C.zinc} />
      <circle cx={673} cy={138} r={26} fill={C.zinc} fillOpacity={0.08} stroke={C.dim} strokeOpacity={0.6} />
      <Note x={673} y={142} label="C" size={12} color={C.zinc} />
      <Arrow d={`M 648 56 L 698 56`} color={C.dim} dashed marker="arw-dff-3" />
      <Arrow d={`M 718 86 L 688 116`} color={C.dim} dashed marker="arw-dff-3" />
      <Arrow d={`M 656 136 C 620 128, 606 108, 604 90`} color={C.dim} dashed marker="arw-dff-3" />
      <Tag x={676} y={188} label="A→B→C→A is a CHAIN — the pair join never matches it" color={C.zinc} />
      <Tag x={452} y={100} label="7-day wall: 604,800 s" color={C.violet} />
      <Note x={430} y={216} label="one self-join: t2.from = t1.to AND t2.to = t1.from AND t2 lands back inside the window" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8034 amount-anomaly-zscore — the customer's own bell curve          */
/* ------------------------------------------------------------------ */

export function ArtAmountAnomalyZscore() {
  const cx = 300, baseY = 158, amp = 92;
  const bell = (x: number, sigma: number) => {
    const t = (x - cx) / sigma;
    return baseY - amp * Math.exp(-0.5 * t * t);
  };
  const sigma = 42;
  const pts: string[] = [];
  for (let x = cx - 130; x <= cx + 130; x += 6) pts.push(`${x === cx - 130 ? "M" : "L"} ${x} ${bell(x, sigma).toFixed(1)}`);
  const zx = 620; // the flagged transaction
  return (
    <g>
      <Defs id="arw-dff-4" />
      <line x1={cx - 150} y1={baseY} x2={zx + 60} y2={baseY} stroke={C.dim} strokeWidth={1.2} />
      <path d={pts.join(" ")} fill={C.sky} fillOpacity={0.08} stroke={C.sky} strokeWidth={2} />
      {/* sigma bands */}
      {[1, 2, 3].map((k) => (
        <g key={k}>
          <line x1={cx + k * sigma} y1={baseY - amp * Math.exp(-0.5 * k * k)} x2={cx + k * sigma} y2={baseY} stroke={C.sky} strokeOpacity={0.4} strokeDasharray="3 3" />
          <Note x={cx + k * sigma} y={baseY + 14} label={`+${k}σ`} size={8.5} color={C.sky} />
        </g>
      ))}
      <Note x={cx} y={baseY + 14} label="mean 50,000 ¢" size={9} color={C.zinc} />
      <Tag x={cx - 74} y={54} label="this customer's baseline — 5 recent txns" color={C.sky} />
      {/* the 3σ wall */}
      <line x1={cx + 3 * sigma} y1={44} x2={cx + 3 * sigma} y2={baseY} stroke={C.rose} strokeWidth={1.4} strokeDasharray="5 4" />
      <Note x={cx + 3 * sigma} y={38} label="z = 3 wall" size={9} anchor="middle" color={C.rose} />
      {/* flagged txn */}
      <circle cx={zx} cy={baseY - 20} r={5.5} fill={C.rose} />
      <line x1={zx} y1={baseY - 14} x2={zx} y2={baseY} stroke={C.rose} strokeWidth={1.4} />
      <Note x={zx} y={baseY + 14} label="89,000 ¢" size={9} anchor="middle" color={C.rose} />
      <Tag x={zx} y={64} label="z = 55.15 — flagged" color={C.rose} />
      <Note x={zx} y={80} label="(raw z drives the flag," size={8.5} anchor="middle" color={C.dim} />
      <Note x={zx} y={92} label="ROUND only for display)" size={8.5} anchor="middle" color={C.dim} />
      {/* the quiet counter-example */}
      <circle cx={cx + 2.4 * sigma} cy={baseY - 8} r={4} fill={C.emerald} />
      <Tag x={cx + 2.4 * sigma} y={118} label="wide-baseline customer: same jump, no flag" color={C.emerald} />
      <Note x={430} y={202} label="anomaly = (amount − mean) / σ against the customer's OWN history — not a global rule" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8035 chargeback-rate-ranking — the 1% wall                          */
/* ------------------------------------------------------------------ */

export function ArtChargebackRateRanking() {
  const baseY = 160;
  const scale = 22; // pct → px
  const rows: Array<[string, number, string]> = [
    ["102", 0.5, C.emerald], ["104", 1.0, C.zinc], ["106", 1.01, C.amber],
    ["101", 2.0, C.rose], ["103", 2.0, C.rose], ["105", 5.0, C.rose],
  ];
  const bw = 62, gap = 46, x0 = 90;
  return (
    <g>
      <Defs id="arw-dff-5" />
      <line x1={64} y1={baseY} x2={800} y2={baseY} stroke={C.dim} strokeWidth={1.2} />
      {rows.map(([id, rate, color], i) => {
        const x = x0 + i * (bw + gap);
        const h = rate * scale;
        return (
          <g key={id}>
            <rect x={x} y={baseY - h} width={bw} height={h} rx={5} fill={color} fillOpacity={0.35} stroke={color} strokeOpacity={0.7} />
            <Note x={x + bw / 2} y={baseY - h - 8} label={`${rate.toFixed(2)}%`} size={9.5} color={color} weight={700} />
            <Note x={x + bw / 2} y={baseY + 16} label={`m-${id}`} size={9} color={C.zinc} />
          </g>
        );
      })}
      {/* the wall */}
      <line x1={64} y1={baseY - 1.0 * scale} x2={800} y2={baseY - 1.0 * scale} stroke={C.rose} strokeWidth={1.5} strokeDasharray="6 4" />
      <Tag x={782} y={baseY - 1.0 * scale - 14} label="processor wall — 1.0% (strict >)" color={C.rose} anchor="end" />
      <Tag x={x0 + 1 * (bw + gap) + bw / 2} y={baseY - 1.0 * scale + 26} label="exactly 1.0 stays — strict >" color={C.zinc} />
      <Tag x={x0 + 3 * (bw + gap) + bw / 2} y={92} label="tie at 2.0 — merchant_id breaks it" color={C.rose} />
      <Note x={430} y={202} label="refunds never touch the denominator: rate = chargebacks ÷ (settled + chargebacks)" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8036 dormant-reactivation — silent, then burst                      */
/* ------------------------------------------------------------------ */

export function ArtDormantReactivation() {
  const x0 = 80, x1 = 800, ay = 110;
  const mx = (day: number) => x0 + (day / 275) * (x1 - x0); // day 0 = 2026-01-01
  const dOf = (m: string, d: number) => ({ Jan: 0, Feb: 31, Mar: 59, Apr: 90, May: 120, Jun: 151, Jul: 181, Aug: 212, Sep: 243 } as Record<string, number>)[m] + d - 1;
  const oldLogins: number[] = [dOf("Apr", 12), dOf("Apr", 25), dOf("May", 18), dOf("May", 30)];
  const septLogins: number[] = [dOf("Sep", 1), dOf("Sep", 3), dOf("Sep", 9), dOf("Sep", 15), dOf("Sep", 20)];
  return (
    <g>
      <Defs id="arw-dff-6" />
      {/* month rail */}
      <line x1={x0} y1={ay + 26} x2={x1} y2={ay + 26} stroke={C.dim} strokeWidth={1.2} />
      {(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"] as const).map((m, i) => (
        <Note key={m} x={mx(dOf(m === "Jan" ? "Feb" : m === "Feb" ? "Mar" : m === "Mar" ? "Apr" : m === "Apr" ? "May" : m === "May" ? "Jun" : m === "Jun" ? "Jul" : m === "Jul" ? "Aug" : "Sep", 1) - 14)} y={ay + 42} label={m} size={8.5} color={C.dim} />
      ))}
      {/* the dormant gap */}
      <rect x={mx(dOf("Jun", 1))} y={ay - 44} width={mx(dOf("Sep", 1)) - mx(dOf("Jun", 1))} height={62} rx={6} fill={C.rose} fillOpacity={0.07} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={(mx(dOf("Jun", 1)) + mx(dOf("Sep", 1))) / 2} y={ay - 52} label="zero logins Jun–Aug — the dormant window" size={9.5} color={C.rose} />
      {/* logins */}
      {oldLogins.map((d, i) => (
        <g key={`o${i}`}>
          <circle cx={mx(d)} cy={ay - 12} r={5} fill={C.sky} fillOpacity={0.85} />
          <Note x={mx(d)} y={ay + 12} label="login" size={7.5} color={C.sky} />
        </g>
      ))}
      {septLogins.map((d, i) => (
        <g key={`s${i}`}>
          <circle cx={mx(d)} cy={ay - 12} r={6} fill={C.rose} />
          <circle cx={mx(d)} cy={ay - 12} r={10} fill="none" stroke={C.rose} strokeOpacity={0.45} />
        </g>
      ))}
      <Tag x={mx(dOf("Sep", 9))} y={ay - 66} label="September burst — reactivation_date" color={C.rose} />
      {/* prior login marker */}
      <line x1={mx(dOf("May", 30))} y1={ay + 26} x2={mx(dOf("May", 30))} y2={ay - 24} stroke={C.emerald} strokeWidth={1.4} strokeDasharray="4 3" />
      <Tag x={mx(dOf("May", 18))} y={ay + 62} label="prior_login_date — dormant_days counts from here" color={C.emerald} />
      {/* kyc tag */}
      <Tag x={712} y={ay - 66} label="kyc_verified = 0 — the compliance gate" color={C.amber} />
      <Note x={430} y={202} label="silent for a season, then a burst — and never verified: the takeover queue" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the payments pipeline                                  */
/* ------------------------------------------------------------------ */

export function ArtStudyPaymentsPipeline() {
  return (
    <g>
      <Defs id="arw-dff-s1" />
      <Box x={36} y={64} w={140} h={52} label="Card swipe" color={C.sky} fillOpacity={0.12} fs={12} />
      <Box x={226} y={64} w={150} h={52} label="Authorization" color={C.violet} fillOpacity={0.12} fs={12} />
      <Box x={426} y={64} w={130} h={52} label="Capture" color={C.blue} fillOpacity={0.12} fs={12} />
      <Box x={606} y={64} w={140} h={52} label="Settlement" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Arrow d="M 178 90 L 222 90" color={C.zinc} marker="arw-dff-s1" />
      <Arrow d="M 378 90 L 422 90" color={C.zinc} marker="arw-dff-s1" />
      <Arrow d="M 558 90 L 602 90" color={C.zinc} marker="arw-dff-s1" />
      {/* fraud screens under the pipe */}
      <rect x={210} y={136} width={182} height={40} rx={8} fill={C.rose} fillOpacity={0.08} stroke={C.rose} strokeOpacity={0.45} />
      <Note x={301} y={152} label="velocity screen" size={9.5} color={C.rose} weight={700} />
      <Note x={301} y={167} label="transaction-velocity" size={8.5} color={C.rose} />
      <rect x={440} y={136} width={152} height={40} rx={8} fill={C.amber} fillOpacity={0.08} stroke={C.amber} strokeOpacity={0.45} />
      <Note x={516} y={152} label="duplicate check" size={9.5} color={C.amber} weight={700} />
      <Note x={516} y={167} label="duplicate-charge-pairs" size={8.5} color={C.amber} />
      <rect x={640} y={136} width={160} height={40} rx={8} fill={C.fuchsia} fillOpacity={0.08} stroke={C.fuchsia} strokeOpacity={0.45} />
      <Note x={720} y={152} label="AML surveillance" size={9.5} color={C.fuchsia} weight={700} />
      <Note x={720} y={167} label="structuring · circular" size={8.5} color={C.fuchsia} />
      {/* dispute loop */}
      <Box x={590} y={214} w={170} h={48} label="Dispute / chargeback" color={C.orange} fillOpacity={0.12} fs={11} />
      <path d="M 676 118 C 700 160, 690 200, 678 210" fill="none" stroke={C.orange} strokeWidth={1.7} strokeDasharray="4 3" markerEnd="url(#arw-dff-s1)" />
      <Tag x={675} y={286} label="chargeback-rate-ranking — over the 1% wall gets dropped" color={C.orange} />
      {/* analyst side */}
      <rect x={36} y={136} width={152} height={126} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={50} y={156} label="the analyst's queue" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={50} y={174} label="· z-score anomalies" size={9} anchor="start" color={C.rose} />
      <Note x={50} y={190} label="· dormant reactivations" size={9} anchor="start" color={C.amber} />
      <Note x={50} y={206} label="· velocity breaches" size={9} anchor="start" color={C.violet} />
      <Note x={50} y={222} label="· round-trip transfers" size={9} anchor="start" color={C.fuchsia} />
      <Note x={50} y={244} label="every hit is a human" size={8.5} anchor="start" color={C.dim} />
      <Note x={50} y={258} label="review — false" size={8.5} anchor="start" color={C.dim} />
      <Note x={50} y={272} label="positives cost trust" size={8.5} anchor="start" color={C.dim} />
      <Note x={430} y={294} label="every Fraud & AML problem sits at one gate of this pipeline" size={10} color={C.zinc} />
    </g>
  );
}
