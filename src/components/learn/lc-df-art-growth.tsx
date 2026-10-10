"use client";

// Data & Finance art — Growth & Experiments family: one real-life concept
// diagram per problem primer + the section study flow ("the life of an
// experiment"). Same pastel language as lc-df-art-bank.tsx: dark panel,
// mono labels, palette C, 1.2px zinc axes, rounded 8 rects, flat fills only.

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

function Arrow({ d, color, dashed = false, marker = "arw-dfg", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* week-over-week-churn — churn leaves last week's porch               */
/* ------------------------------------------------------------------ */

export function ArtWeekOverWeekChurn() {
  const w1rows = [74, 102, 130, 158];
  const wrows = [88, 120, 152];
  return (
    <g>
      <Defs id="arw-dfg-1" />
      {/* the two week columns */}
      <Tag x={140} y={38} label="W-1 · 8 actives" color={C.sky} />
      <Tag x={320} y={38} label="W · 6 actives" color={C.violet} />
      <Box x={80} y={48} w={120} h={128} label="" color={C.sky} fillOpacity={0.07} />
      <Box x={260} y={48} w={120} h={128} label="" color={C.violet} fillOpacity={0.07} />
      {w1rows.map((y) => [115, 165].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={C.emerald} />))}
      {wrows.map((y) => [295, 345].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r={5} fill={C.emerald} />))}
      {/* the two that left — ghosted between the columns */}
      {[102, 158].map((y) => (
        <g key={y}>
          <Arrow d={`M 204 ${y} L 218 ${y}`} color={C.rose} dashed sw={1.4} marker="arw-dfg-1" />
          <circle cx={232} cy={y} r={5} fill={C.rose} fillOpacity={0.08} stroke={C.rose} strokeOpacity={0.7} strokeDasharray="2 2" />
        </g>
      ))}
      <Note x={230} y={192} label="2 gone" color={C.rose} size={9} weight={700} />
      {/* arrow to the rate */}
      <Arrow d="M 384 112 C 450 112, 490 94, 552 92" color={C.zinc} marker="arw-dfg-1" />
      <Note x={462} y={130} label="churned ÷ started" size={9} color={C.zinc} />
      <Box x={560} y={62} w={190} h={52} label="2 ÷ 8 = 25%" color={C.rose} fillOpacity={0.1} fs={12.5} />
      <Tag x={655} y={46} label="churn rate" color={C.rose} />
      <Note x={572} y={134} label="numerator: in W-1, gone in W" size={9.5} anchor="start" color={C.zinc} />
      <Note x={572} y={152} label="denominator: W-1's 8 — not W's 6" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={572} y={170} label="the base that can churn is last week's" size={9} anchor="start" color={C.dim} />
      <Note x={430} y={202} label="denominator = the week that left — churn ÷ last week's actives, never this week's" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* median-time-to-convert — the median outruns the mean                */
/* ------------------------------------------------------------------ */

export function ArtMedianTimeToConvert() {
  const x0 = 150, x1 = 790, dmax = 90;
  const xd = (d: number) => x0 + (d / dmax) * (x1 - x0);
  const users: Array<[string, number]> = [
    ["u1", 2], ["u2", 4], ["u3", 7], ["u4", 9], ["u5", 14], ["u6", 90],
  ];
  const rows = [46, 70, 94, 118, 142, 166];
  const medianD = 8, meanD = 21;
  return (
    <g>
      <Defs id="arw-dfg-2" />
      {users.map(([u, d], i) => {
        const y = rows[i];
        return (
          <g key={u}>
            <Note x={126} y={y + 3} label={u} size={9} anchor="end" color={C.dim} />
            <line x1={x0} y1={y} x2={xd(d)} y2={y} stroke={C.dim} strokeWidth={1.2} strokeOpacity={0.6} />
            <circle cx={x0} cy={y} r={3.5} fill={C.sky} />
            <circle cx={xd(d)} cy={y} r={4} fill={C.emerald} />
            <Note x={d === dmax ? xd(d) - 10 : xd(d) + 10} y={y + 3} label={`${d}d`} size={8.5} anchor={d === dmax ? "end" : "start"} color={d === dmax ? C.rose : C.dim} />
          </g>
        );
      })}
      <Note x={x0} y={30} label="signup" size={8.5} color={C.dim} />
      <Note x={x1} y={30} label="convert" size={8.5} color={C.dim} />
      {/* the two markers */}
      <line x1={xd(medianD)} y1={36} x2={xd(medianD)} y2={178} stroke={C.emerald} strokeWidth={1.6} />
      <Tag x={xd(medianD)} y={28} label="median 8d" color={C.emerald} />
      <line x1={xd(meanD)} y1={36} x2={xd(meanD)} y2={178} stroke={C.amber} strokeWidth={1.6} />
      <Tag x={xd(meanD)} y={28} label="mean 21d" color={C.amber} />
      {/* the straggler */}
      <Tag x={760} y={154} label="one 90d straggler" color={C.rose} anchor="end" />
      <Arrow d="M 706 158 C 730 158, 760 160, 778 164" color={C.rose} dashed sw={1.4} marker="arw-dfg-2" />
      {/* day axis */}
      <line x1={x0} y1={180} x2={x1 + 4} y2={180} stroke={C.dim} strokeWidth={1.2} />
      {[0, 15, 30, 45, 60, 75, 90].map((d) => (
        <g key={d}>
          <line x1={xd(d)} y1={180} x2={xd(d)} y2={185} stroke={C.dim} strokeWidth={1.2} />
          <Note x={xd(d)} y={196} label={`${d}`} size={9} color={C.dim} />
        </g>
      ))}
      <Note x={430} y={206} label="days from signup → convert — the median sits in the pack, the mean chases the tail" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* rolling-7d-actives — the trailing window that never sums            */
/* ------------------------------------------------------------------ */

export function ArtRolling7dActives() {
  const xd = (d: number) => 80 + (d - 1) * 69; // D1..D10
  const active = [1, 2, 4, 5, 7];
  const both = [4, 5, 7]; // inside W1 and W2
  return (
    <g>
      <Defs id="arw-dfg-3" />
      <Note x={62} y={40} label="u7 active 5 of the 7 days" size={9.5} anchor="start" color={C.sky} />
      <Note x={700} y={40} label="in both windows — still one user" size={9} anchor="end" color={C.amber} />
      {/* the two sliding 7-day windows */}
      <rect x={62} y={70} width={448} height={76} rx={8} fill={C.emerald} fillOpacity={0.06} stroke={C.emerald} strokeOpacity={0.5} strokeDasharray="5 4" />
      <rect x={271} y={70} width={446} height={76} rx={8} fill={C.sky} fillOpacity={0.06} stroke={C.sky} strokeOpacity={0.5} strokeDasharray="5 4" />
      <Tag x={286} y={58} label="D1→D7 · distinct = 5" color={C.emerald} />
      <Tag x={494} y={58} label="D4→D10 · distinct = 3" color={C.sky} />
      <Arrow d="M 358 58 L 422 58" color={C.zinc} dashed sw={1.4} marker="arw-dfg-3" />
      <Note x={390} y={44} label="slides" size={8.5} color={C.zinc} />
      {/* the day axis */}
      <line x1={60} y1={118} x2={716} y2={118} stroke={C.dim} strokeWidth={1.2} />
      <Note x={52} y={122} label="u7" size={10} anchor="end" color={C.zinc} weight={700} />
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
        <g key={d}>
          {active.includes(d)
            ? <circle cx={xd(d)} cy={118} r={5} fill={C.emerald} />
            : <circle cx={xd(d)} cy={118} r={4} fill="none" stroke={C.dim} strokeOpacity={0.6} />}
          {both.includes(d) && <circle cx={xd(d)} cy={118} r={8} fill="none" stroke={C.amber} strokeOpacity={0.8} strokeWidth={1.2} />}
          <Note x={xd(d)} y={140} label={`D${d}`} size={9} color={C.dim} />
        </g>
      ))}
      {/* count it once — the badges */}
      <Box x={210} y={158} w={60} h={36} label="×5" color={C.rose} fillOpacity={0.1} fs={14} />
      <line x1={216} y1={162} x2={264} y2={190} stroke={C.rose} strokeWidth={2.5} />
      <Note x={282} y={180} label="SUM of dailies — u7 counted five times" size={9.5} anchor="start" color={C.rose} />
      <Box x={530} y={158} w={60} h={36} label="×1" color={C.emerald} fillOpacity={0.12} fs={14} />
      <Note x={602} y={180} label="COUNT(DISTINCT u7) — once per window" size={9.5} anchor="start" color={C.emerald} />
      <Note x={430} y={206} label="actives in a window = COUNT(DISTINCT user) — never the SUM of daily counts" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* usage-tier-percentiles — where you stand in the line                */
/* ------------------------------------------------------------------ */

export function ArtUsageTierPercentiles() {
  const x0 = 70, x1 = 800;
  const xp = (pr: number) => x0 + pr * (x1 - x0);
  // 10 users sorted by 30d usage; the tie (48m) shares rank 7 → pr 0.667
  const users: Array<[number, number, string]> = [
    // [percent_rank, usage_minutes, tier]
    [0, 2, "dormant"], [1 / 9, 5, "dormant"], [2 / 9, 9, "dormant"],
    [3 / 9, 14, "casual"], [4 / 9, 22, "casual"],
    [5 / 9, 35, "regular"], [6 / 9, 48, "regular"], [6 / 9, 48, "regular"],
    [8 / 9, 80, "power"], [1, 120, "power"],
  ];
  const tierColor: Record<string, string> = {
    dormant: C.zinc, casual: C.cyan, regular: C.amber, power: C.emerald,
  };
  const cuts = [0.25, 0.5, 0.75];
  const samePr = (a: number, b: number) => Math.round(a * 1000) === Math.round(b * 1000);
  return (
    <g>
      <Defs id="arw-dfg-4" />
      <Note x={70} y={24} label="10 users sorted by 30d usage" size={9.5} anchor="start" color={C.zinc} />
      <Tag x={557} y={40} label="tied — rank 7 for both → 0.667" color={C.fuchsia} />
      {/* dots on the line — tied dots split ±8px around their shared rank */}
      {users.map(([pr, mins, tier], i) => {
        const x = xp(pr);
        const prevTie = i > 0 && samePr(users[i - 1][0], pr);
        const nextTie = i < users.length - 1 && samePr(users[i + 1][0], pr);
        const dx = prevTie ? x - 8 : nextTie ? x + 8 : x;
        return (
          <g key={i}>
            {!prevTie && <line x1={x} y1={92} x2={x} y2={142} stroke={C.dim} strokeWidth={1} strokeDasharray="2 3" strokeOpacity={0.7} />}
            <circle cx={dx} cy={84} r={5.5} fill={tierColor[tier]} />
            {!prevTie && <Note x={x} y={64} label={`${mins}m`} size={8.5} color={C.dim} />}
          </g>
        );
      })}
      {/* percentile cut lines */}
      {cuts.map((p) => (
        <g key={p}>
          <line x1={xp(p)} y1={56} x2={xp(p)} y2={140} stroke={C.amber} strokeWidth={1.2} strokeDasharray="4 3" strokeOpacity={0.85} />
          <Note x={xp(p)} y={134} label={p.toFixed(2)} size={8.5} color={C.amber} weight={700} />
        </g>
      ))}
      {/* the PERCENT_RANK ruler */}
      <line x1={x0} y1={148} x2={x1} y2={148} stroke={C.zinc} strokeWidth={1.2} />
      {users.map(([pr], i) => <line key={i} x1={xp(pr)} y1={144} x2={xp(pr)} y2={152} stroke={C.dim} strokeWidth={1.2} />)}
      {cuts.map((p) => <line key={p} x1={xp(p)} y1={140} x2={xp(p)} y2={156} stroke={C.amber} strokeWidth={1.4} />)}
      <Note x={x1 + 10} y={151} label="0 → 1" size={9} anchor="start" color={C.zinc} />
      {/* the tiers the cuts carve */}
      {([["dormant", 0, 0.25], ["casual", 0.25, 0.5], ["regular", 0.5, 0.75], ["power", 0.75, 1]] as Array<[string, number, number]>).map(([tier, a, b]) => (
        <g key={tier}>
          <rect x={xp(a)} y={158} width={xp(b) - xp(a) - 2} height={22} rx={6} fill={tierColor[tier]} fillOpacity={0.1} stroke={tierColor[tier]} strokeOpacity={0.4} />
          <Note x={(xp(a) + xp(b)) / 2} y={172} label={tier} size={9} color={tierColor[tier]} weight={700} />
        </g>
      ))}
      <Note x={430} y={206} label="PERCENT_RANK = (rank-1)/(n-1) — two users at 48m share 0.667; the next dot jumps to 0.889" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* ab-sample-ratio-mismatch — the gate before the lift                 */
/* ------------------------------------------------------------------ */

export function ArtAbSampleRatioMismatch() {
  const gx = 60, gw = 400, gy = 70, gh = 36;
  return (
    <g>
      <Defs id="arw-dfg-5" />
      <Note x={gx} y={36} label="10,000 sessions in" size={9.5} anchor="start" color={C.sky} />
      {/* the observed split gauge */}
      <rect x={gx} y={gy} width={gw * 0.53 - 2} height={gh} rx={6} fill={C.sky} fillOpacity={0.15} stroke={C.sky} strokeOpacity={0.55} />
      <rect x={gx + gw * 0.53 + 2} y={gy} width={gw * 0.47 - 2} height={gh} rx={6} fill={C.violet} fillOpacity={0.15} stroke={C.violet} strokeOpacity={0.55} />
      <Note x={gx + gw * 0.265} y={gy + gh / 2 + 4} label="A · 53%" size={11} color={C.sky} weight={700} />
      <Note x={gx + gw * 0.735} y={gy + gh / 2 + 4} label="B · 47%" size={11} color={C.violet} weight={700} />
      {/* expected divider + tolerance band */}
      <line x1={gx + gw * 0.5} y1={gy - 6} x2={gx + gw * 0.5} y2={gy + gh + 6} stroke={C.zinc} strokeWidth={1.2} strokeDasharray="4 3" />
      <rect x={gx + gw * 0.48} y={gy - 6} width={gw * 0.04} height={gh + 12} fill="none" stroke={C.amber} strokeWidth={1.2} strokeDasharray="3 3" strokeOpacity={0.9} />
      <Tag x={gx + gw * 0.5} y={48} label="expected 50/50" color={C.zinc} />
      <Tag x={gx + gw * 0.5} y={132} label="tolerance ±2pt" color={C.amber} />
      {/* the gate */}
      <Arrow d="M 466 88 L 518 88" color={C.zinc} marker="arw-dfg-5" />
      <circle cx={560} cy={88} r={30} fill={C.rose} fillOpacity={0.07} stroke={C.rose} strokeWidth={2} />
      <line x1={547} y1={75} x2={573} y2={101} stroke={C.rose} strokeWidth={3.5} />
      <line x1={573} y1={75} x2={547} y2={101} stroke={C.rose} strokeWidth={3.5} />
      <Tag x={560} y={138} label="SRM — experiment invalid" color={C.rose} />
      <Note x={560} y={156} label="fix the split before reading numbers" size={8.5} color={C.dim} />
      {/* the blocked road to the lift */}
      <path d="M 598 88 L 686 88" fill="none" stroke={C.dim} strokeWidth={1.4} strokeDasharray="4 3" markerEnd="url(#arw-dfg-5)" opacity={0.35} />
      <path d="M 744 56 L 802 56 L 802 120 L 744 120" fill="none" stroke={C.dim} strokeWidth={1.4} opacity={0.55} />
      <Note x={770} y={84} label="lift +4.1%" size={12} color={C.dim} weight={700} />
      <Note x={770} y={102} label="control vs treatment" size={8.5} color={C.dim} />
      <Tag x={770} y={142} label="unreadable until SRM clears" color={C.dim} />
      <Note x={430} y={202} label="SRM check: 5300 vs 5000 expected — if the split is off, the lift is fiction" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* feature-adoption-windows — clocks that start at signup              */
/* ------------------------------------------------------------------ */

export function ArtFeatureAdoptionWindows() {
  const cal0 = 190, day = 16.25; // Mar 1 → x 190, 40 days wide
  const cx = (d: number) => cal0 + d * day;
  return (
    <g>
      <Defs id="arw-dfg-6" />
      <Note x={430} y={18} label="one feature launch — two personal clocks" size={10} color={C.zinc} weight={700} />
      {/* shared calendar axis */}
      <line x1={cal0} y1={44} x2={840} y2={44} stroke={C.dim} strokeWidth={1.2} />
      {([[0, "Mar 1"], [9, "Mar 10"], [19, "Mar 20"], [30, "Mar 31"], [40, "Apr 10"]] as Array<[number, string]>).map(([d, label]) => (
        <g key={label}>
          <line x1={cx(d)} y1={40} x2={cx(d)} y2={48} stroke={C.dim} strokeWidth={1.2} />
          <Note x={cx(d)} y={34} label={label} size={9} color={C.dim} />
        </g>
      ))}
      {/* user A — signs up Mar 1, adopts day 5 (inside 7d) */}
      <Tag x={182} y={92} label="A · signs up Mar 1" color={C.sky} anchor="end" />
      <circle cx={cal0} cy={92} r={5.5} fill={C.amber} />
      <line x1={cal0} y1={92} x2={cx(30)} y2={92} stroke={C.zinc} strokeWidth={1.6} />
      <rect x={cal0} y={86} width={cx(5) - cal0} height={12} fill={C.emerald} fillOpacity={0.16} />
      <circle cx={cx(5)} cy={92} r={5} fill={C.emerald} />
      <Tag x={282} y={70} label="adopted day 5 — inside the 7-day window" color={C.emerald} anchor="start" />
      {([[7, "+7d"], [14, "+14d"], [30, "+30d"]] as Array<[number, string]>).map(([d, label]) => (
        <g key={label}>
          <line x1={cx(d)} y1={84} x2={cx(d)} y2={100} stroke={C.zinc} strokeWidth={1.2} />
          <Note x={cx(d)} y={112} label={label} size={8.5} color={C.dim} />
        </g>
      ))}
      <Note x={cal0} y={112} label="d0" size={8.5} color={C.amber} />
      {/* user B — signs up Mar 10, adopts day 11 (misses 7d, inside 14d) */}
      <Tag x={328} y={148} label="B · signs up Mar 10" color={C.violet} anchor="end" />
      <circle cx={cx(9)} cy={148} r={5.5} fill={C.amber} />
      <line x1={cx(9)} y1={148} x2={cx(39)} y2={148} stroke={C.zinc} strokeWidth={1.6} />
      <rect x={cx(9)} y={142} width={cx(20) - cx(9)} height={12} fill={C.amber} fillOpacity={0.16} />
      <circle cx={cx(20)} cy={148} r={5} fill={C.amber} />
      <Tag x={515} y={126} label="adopted day 11 — misses 7d, inside 14d" color={C.amber} />
      {([[16, "+7d"], [23, "+14d"], [39, "+30d"]] as Array<[number, string]>).map(([d, label]) => (
        <g key={label}>
          <line x1={cx(d)} y1={140} x2={cx(d)} y2={156} stroke={C.zinc} strokeWidth={1.2} />
          <Note x={cx(d)} y={170} label={label} size={8.5} color={C.dim} />
        </g>
      ))}
      <Note x={cx(9)} y={170} label="d0" size={8.5} color={C.amber} />
      <Note x={430} y={206} label="windows run off each user's own clock — same 7/14/30d gates, different absolute dates" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the life of an experiment                              */
/* ------------------------------------------------------------------ */

export function ArtStudyExperimentLife() {
  const HF = 300;
  const gate = (x: number, y: number, n: number) => (
    <g key={n}>
      <circle cx={x} cy={y} r={8} fill="#09090b" stroke={C.amber} strokeWidth={1.2} />
      <text x={x} y={y + 3} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={700} fill={C.amber}>{n}</text>
    </g>
  );
  return (
    <g>
      <Defs id="arw-dfg-s1" />
      {/* hypothesis → design → run → SRM gate */}
      <Box x={40} y={50} w={140} h={52} label="Hypothesis" color={C.sky} fillOpacity={0.12} fs={12} />
      <Note x={110} y={118} label="we think B beats A" size={9} color={C.dim} />
      <Box x={230} y={50} w={160} h={52} label="Design" color={C.violet} fillOpacity={0.12} fs={12} />
      <Note x={310} y={118} label="split · power · MDE" size={9} color={C.dim} />
      <Box x={440} y={50} w={140} h={52} label="Run" color={C.cyan} fillOpacity={0.12} fs={12} />
      <Note x={510} y={118} label="50/50 traffic" size={9} color={C.dim} />
      <Box x={630} y={50} w={120} h={52} label="SRM gate" color={C.rose} fillOpacity={0.12} fs={12} />
      <Note x={690} y={118} label="counts vs plan?" size={9} color={C.dim} />
      {gate(738, 62, 5)}
      <Arrow d="M 184 76 L 226 76" color={C.zinc} marker="arw-dfg-s1" />
      <Arrow d="M 394 76 L 436 76" color={C.zinc} marker="arw-dfg-s1" />
      <Arrow d="M 584 76 L 626 76" color={C.zinc} marker="arw-dfg-s1" />
      <Note x={608} y={134} label="the gate before any lift" size={9} color={C.rose} />
      {/* the read — four gates live here */}
      <Arrow d="M 690 106 L 690 144" color={C.zinc} marker="arw-dfg-s1" />
      <rect x={556} y={150} width={272} height={118} rx={8} fill={C.amber} fillOpacity={0.05} stroke={C.amber} strokeOpacity={0.45} />
      <Note x={572} y={172} label="Read — lift · medians · tiers" size={11} anchor="start" color={C.amber} weight={700} />
      {([[1, "WoW churn — 2 ÷ last week's actives"], [2, "time-to-convert — median, not mean"], [3, "rolling 7d actives — DISTINCT, ×1"], [4, "usage tiers — PERCENT_RANK 0→1"]] as Array<[number, string]>).map(([n, label], i) => {
        const y = 194 + i * 20;
        return (
          <g key={n}>
            {gate(582, y - 3.5, n)}
            <Note x={598} y={y} label={label} size={9.5} anchor="start" color={C.zinc} />
          </g>
        );
      })}
      {/* decide → monitor, with the loop back */}
      <Arrow d="M 552 176 L 504 176" color={C.zinc} marker="arw-dfg-s1" />
      <Box x={350} y={150} w={150} h={52} label="Decide" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Tag x={388} y={232} label="ship" color={C.emerald} />
      <Tag x={452} y={232} label="kill" color={C.rose} />
      <Arrow d="M 346 176 L 314 176" color={C.zinc} marker="arw-dfg-s1" />
      <Box x={160} y={150} w={150} h={52} label="Monitor" color={C.lime} fillOpacity={0.12} fs={12} />
      <Note x={235} y={232} label="7/14/30d windows" size={9} color={C.dim} />
      {gate(298, 162, 6)}
      <path d="M 168 208 C 100 242, 52 200, 55 110" fill="none" stroke={C.cyan} strokeWidth={1.8} strokeDasharray="4 3" markerEnd="url(#arw-dfg-s1)" />
      <Tag x={104} y={250} label="loop: next experiment" color={C.cyan} />
      {/* the gate legend — one per problem */}
      <Note x={430} y={HF - 8} label="six gates, one per problem: 1 WoW churn · 2 time-to-convert · 3 rolling actives · 4 usage tiers · 5 SRM check · 6 adoption windows" size={9.5} color={C.zinc} />
    </g>
  );
}

export const GROWTH_ART_W = W;
export const GROWTH_ART_H = HP;
