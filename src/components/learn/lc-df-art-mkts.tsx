"use client";

// Data & Finance art — Markets & Risk family.
// One REAL-LIFE concept diagram per problem primer + the section study flow
// ("the market desk's day"). Same pastel language as lc-df-art-bank.tsx:
// dark panel, mono labels, palette C below mirrors that file's constants.

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

function Arrow({ d, color, dashed = false, marker = "arw-dfm", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* fx-exposure-report — every currency becomes one number              */
/* ------------------------------------------------------------------ */

export function ArtFxExposureReport() {
  const legs: Array<[string, string, string, string, number]> = [
    ["EUR · 120,000", "× 1.0847 · eff 09-30", "= 130,164", C.sky, 52],
    ["GBP · 45,000", "× 1.3392 · eff 09-30", "= 60,264", C.violet, 104],
    ["JPY · 9,500,000", "× 0.0067 · eff 09-30", "= 63,650", C.amber, 156],
  ];
  return (
    <g>
      <Defs id="arw-dfm-1" />
      <Note x={48} y={20} label="positions in native currency" size={9.5} anchor="start" color={C.dim} />
      <Note x={710} y={64} label="one USD number" size={9.5} color={C.emerald} />
      {/* the three books, each times its latest rate */}
      {legs.map(([book, chip, usd, color, cy], i) => (
        <g key={i}>
          <Box x={48} y={cy - 20} w={196} h={40} label={book} color={color} fillOpacity={0.12} />
          <Arrow d={`M 248 ${cy} L 284 ${cy}`} color={C.zinc} marker="arw-dfm-1" />
          <Tag x={290} y={cy} label={chip} color={color} anchor="start" />
          <Arrow
            d={i === 0 ? "M 430 52 C 490 52, 550 90, 604 90" : i === 1 ? "M 430 104 L 604 104" : "M 430 156 C 490 156, 550 118, 604 118"}
            color={C.zinc}
            marker="arw-dfm-1"
          />
          <Note x={516} y={i === 1 ? 98 : i === 0 ? 46 : 148} label={usd} size={9} color={color} />
        </g>
      ))}
      {/* the as-of boundary */}
      <line x1={470} y1={26} x2={470} y2={178} stroke={C.dim} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.5} />
      <Box x={610} y={76} w={200} h={56} label="USD 254,078" color={C.emerald} fillOpacity={0.12} fs={13} />
      <Note x={710} y={148} label="= 130,164 + 60,264 + 63,650" size={9} color={C.dim} />
      <Tag x={710} y={166} label="rn = 1 · latest ≤ 2026-10-01" color={C.violet} />
      <Note x={430} y={200} label="exposure = amount × USD-per-unit — the latest on-or-before rate makes one number per currency" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* portfolio-concentration-hhi — many small vs one big                 */
/* ------------------------------------------------------------------ */

export function ArtPortfolioConcentrationHhi() {
  return (
    <g>
      <Defs id="arw-dfm-2" />
      {/* the formula banner */}
      <Box x={350} y={16} w={160} h={28} label="HHI = Σ w² × 10000" color={C.violet} fillOpacity={0.08} fs={10.5} />
      <line x1={430} y1={56} x2={430} y2={172} stroke={C.dim} strokeWidth={1} strokeDasharray="3 4" strokeOpacity={0.5} />
      {/* left: the equal book */}
      <Note x={198} y={46} label="the equal book — five names" size={10} color={C.emerald} weight={700} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <Box x={60 + i * 58} y={64} w={44} h={44} label="20%" color={C.emerald} fillOpacity={0.14} fs={9.5} />
          <Note x={82 + i * 58} y={120} label="400" size={9} color={C.dim} />
        </g>
      ))}
      <Note x={198} y={136} label="Σ w²×10000 = 5 × 400 = 2,000" size={10} color={C.emerald} weight={700} />
      <Note x={198} y={152} label="10000 / 2000 = 5 effective names" size={9} color={C.dim} />
      <Tag x={198} y={184} label="2,000 · many small bets" color={C.emerald} />
      {/* right: the top-heavy book (side ∝ √w — area carries the share) */}
      <Note x={660} y={46} label="the top-heavy book" size={10} color={C.rose} weight={700} />
      <Box x={500} y={58} w={66} h={66} label="89%" color={C.rose} fillOpacity={0.14} fs={11} />
      <Box x={592} y={96} w={20} h={20} label="" color={C.rose} fillOpacity={0.14} />
      <Box x={628} y={104} w={12} h={12} label="" color={C.rose} fillOpacity={0.14} />
      <Note x={602} y={130} label="8%" size={9} color={C.rose} />
      <Note x={634} y={130} label="3%" size={9} color={C.rose} />
      <Note x={660} y={150} label="0.89² + 0.08² + 0.03² → 7,994" size={10} color={C.rose} weight={700} />
      <Note x={660} y={166} label="10000 / 7994 ≈ 1.25 effective names" size={9} color={C.dim} />
      <Tag x={660} y={184} label="≈ 8,000 · one name IS the book" color={C.rose} />
      <Note x={430} y={200} label="2,000 — five real positions · ≈8,000 — one bet in a portfolio costume" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* daily-balance-interest — accrual on every day-end balance           */
/* ------------------------------------------------------------------ */

export function ArtDailyBalanceInterest() {
  const x0 = 64, x1 = 540, y0 = 34, y1 = 152;
  const mx = (d: number) => x0 + ((d - 1) / 29) * (x1 - x0);
  const my = (v: number) => y1 - (v / 1800) * (y1 - y0);
  const step = `M ${mx(1)} ${my(1000)} L ${mx(6)} ${my(1000)} L ${mx(6)} ${my(1600)} L ${mx(15)} ${my(1600)} L ${mx(15)} ${my(1100)} L ${mx(22)} ${my(1100)} L ${mx(22)} ${my(1500)} L ${mx(30)} ${my(1500)}`;
  const drops: Array<[number, number]> = [
    [mx(2), my(1000)], [mx(4), my(1000)],
    [mx(7), my(1600)], [mx(13), my(1600)],
    [mx(17), my(1100)], [mx(20), my(1100)],
    [mx(25), my(1500)], [mx(29), my(1500)],
  ];
  return (
    <g>
      <Defs id="arw-dfm-3" />
      {/* axes */}
      <line x1={x0} y1={y0 - 6} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[0, 800, 1600].map((v) => (
        <g key={v}>
          <line x1={x0} y1={my(v)} x2={x1} y2={my(v)} stroke={C.dim} strokeOpacity={0.22} strokeDasharray="2 4" />
          <Note x={x0 - 8} y={my(v) + 3.5} label={v === 0 ? "0" : v === 800 ? "0.8k" : "1.6k"} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {[1, 6, 15, 22, 30].map((d) => <Note key={d} x={mx(d)} y={166} label={`${d}`} size={9} color={C.dim} />)}
      <Note x={(x0 + x1) / 2} y={180} label="day of September" size={9} color={C.dim} />
      <Note x={28} y={58} label="EOD" size={9.5} color={C.zinc} />
      <Note x={28} y={70} label="balance" size={9.5} color={C.zinc} />
      {/* the EOD balance staircase */}
      <path d={step} fill="none" stroke={C.sky} strokeWidth={2.4} />
      {([[1, 1000], [6, 1600], [15, 1100], [22, 1500], [30, 1500]] as Array<[number, number]>).map(([d, v]) => (
        <circle key={d} cx={mx(d)} cy={my(v)} r={3} fill={C.sky} />
      ))}
      {/* deposit / withdrawal steps */}
      <Arrow d={`M ${mx(6) + 7} ${my(1000) - 6} L ${mx(6) + 7} ${my(1600) + 10}`} color={C.emerald} sw={2} marker="arw-dfm-3" />
      <Tag x={mx(6) + 16} y={58} label="+600 deposit" color={C.emerald} anchor="start" />
      <Arrow d={`M ${mx(15) + 7} ${my(1600) - 8} L ${mx(15) + 7} ${my(1100) + 10}`} color={C.orange} sw={2} marker="arw-dfm-3" />
      <Tag x={mx(15) + 16} y={66} label="−500 withdrawal" color={C.orange} anchor="start" />
      <Arrow d={`M ${mx(22) + 7} ${my(1100) - 4} L ${mx(22) + 7} ${my(1500) + 8}`} color={C.emerald} sw={2} marker="arw-dfm-3" />
      <Tag x={mx(22) + 16} y={38} label="+400 deposit" color={C.emerald} anchor="start" />
      {/* one tiny drop per day-end balance */}
      {drops.map(([dx, dy], i) => (
        <g key={i}>
          <line x1={dx} y1={dy + 4} x2={dx} y2={dy + 13} stroke={C.emerald} strokeWidth={1.2} strokeDasharray="2 2" strokeOpacity={0.8} />
          <circle cx={dx} cy={dy + 17} r={2} fill={C.emerald} fillOpacity={0.85} />
        </g>
      ))}
      <Tag x={98} y={122} label="rate/365 × EOD balance" color={C.emerald} />
      {/* drops collected into the month bucket */}
      <Arrow d={`M ${mx(29)} ${my(1500) + 21} C 550 96, 580 106, 600 112`} color={C.emerald} dashed sw={1.4} marker="arw-dfm-3" />
      <Arrow d={`M ${mx(20)} ${my(1100) + 23} C 440 132, 530 142, 600 142`} color={C.emerald} dashed sw={1.4} marker="arw-dfm-3" />
      <rect x={606} y={104} width={196} height={68} rx={8} fill={C.emerald} fillOpacity={0.08} stroke={C.emerald} strokeOpacity={0.45} />
      <Note x={704} y={128} label="month interest" size={11.5} color={C.emerald} weight={700} />
      <Note x={704} y={146} label="= Σ drops" size={10} color={C.zinc} />
      <Note x={704} y={162} label="30 EODs × rate/365" size={9} color={C.dim} />
      <Note x={430} y={200} label="silent days still accrue at their EOD — the calendar spine keeps every day alive, then Σ drops" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* dividend-income-calendar — own it on ex-date, get paid              */
/* ------------------------------------------------------------------ */

export function ArtDividendIncomeCalendar() {
  return (
    <g>
      <Defs id="arw-dfm-4" />
      {/* the calendar axis */}
      <line x1={70} y1={118} x2={806} y2={118} stroke={C.dim} strokeWidth={1.2} />
      <line x1={520} y1={104} x2={520} y2={138} stroke={C.zinc} strokeWidth={1.2} strokeDasharray="3 3" />
      {/* the ex-date gate */}
      <line x1={360} y1={36} x2={360} y2={150} stroke={C.fuchsia} strokeWidth={3} />
      <Tag x={360} y={28} label="EX-DATE 10-15 — the gate" color={C.fuchsia} />
      <circle cx={360} cy={118} r={5} fill={C.fuchsia} />
      <Note x={360} y={134} label="10-15" size={9} color={C.fuchsia} />
      <circle cx={520} cy={118} r={4} fill={C.zinc} />
      <Note x={520} y={134} label="record 10-16" size={9} color={C.dim} />
      <Note x={372} y={96} label="record is bookkeeping — ex already decided" size={9} anchor="start" color={C.dim} />
      {/* the green buy — before the gate, the dividend rides along */}
      <circle cx={110} cy={92} r={4} fill={C.emerald} />
      <path d="M 110 92 C 240 44, 560 44, 714 92" fill="none" stroke={C.emerald} strokeWidth={2.4} markerEnd="url(#arw-dfm-4)" opacity={0.9} />
      <Note x={84} y={72} label="buy 10-06" size={10} anchor="start" color={C.emerald} weight={700} />
      <Tag x={240} y={48} label="$0.42 / share" color={C.emerald} />
      <Note x={150} y={136} label="before the gate — gets the dividend" size={9} anchor="start" color={C.emerald} />
      <Box x={664} y={96} w={112} h={30} label="paid 11-03" color={C.emerald} fillOpacity={0.1} fs={10.5} />
      <circle cx={720} cy={118} r={4} fill={C.emerald} />
      <Note x={720} y={140} label="pay date" size={9} color={C.emerald} />
      {/* the red buy — after the gate */}
      <circle cx={392} cy={142} r={4} fill={C.rose} />
      <Arrow d="M 398 142 L 694 142" color={C.rose} sw={2} marker="arw-dfm-4" />
      <Note x={398} y={162} label="buy 10-20 — after the gate" size={10} anchor="start" color={C.rose} weight={700} />
      <Tag x={700} y={162} label="too late — no dividend" color={C.rose} />
      <Note x={430} y={200} label="the gate is one CTE — keep ex_date > report_date; record and pay dates never decide" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* max-drawdown — the deepest fall from the highest peak               */
/* ------------------------------------------------------------------ */

export function ArtMaxDrawdown() {
  const x0 = 70, x1 = 540, y0 = 34, y1 = 156;
  const mx = (d: number) => x0 + ((d - 1) / 11) * (x1 - x0);
  const my = (v: number) => y1 - ((v - 90) / 25) * (y1 - y0);
  const nav = [100, 104, 108, 106, 102, 96, 94, 99, 103, 111, 105, 101];
  const navPath = nav.map((v, i) => `${i === 0 ? "M" : "L"} ${mx(i + 1).toFixed(1)} ${my(v).toFixed(1)}`).join(" ");
  const rm = `M ${mx(1)} ${my(100)} L ${mx(2)} ${my(100)} L ${mx(2)} ${my(104)} L ${mx(3)} ${my(104)} L ${mx(3)} ${my(108)} L ${mx(10)} ${my(108)} L ${mx(10)} ${my(111)} L ${mx(12)} ${my(111)}`;
  return (
    <g>
      <Defs id="arw-dfm-5" />
      <line x1={x0} y1={y0 - 6} x2={x0} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      <line x1={x0} y1={y1} x2={x1 + 8} y2={y1} stroke={C.dim} strokeWidth={1.2} />
      {[90, 100, 110].map((v) => (
        <g key={v}>
          <line x1={x0} y1={my(v)} x2={x1} y2={my(v)} stroke={C.dim} strokeOpacity={0.22} strokeDasharray="2 4" />
          <Note x={x0 - 8} y={my(v) + 3.5} label={`${v}`} size={9} anchor="end" color={C.dim} />
        </g>
      ))}
      {[1, 3, 7, 10, 12].map((d) => <Note key={d} x={mx(d)} y={170} label={`${d}`} size={9} color={C.dim} />)}
      <Note x={305} y={184} label="day" size={9} color={C.dim} />
      <Note x={28} y={92} label="NAV" size={9.5} color={C.zinc} />
      <Note x={28} y={104} label="(k)" size={9.5} color={C.dim} />
      {/* the equity curve and its running max */}
      <path d={rm} fill="none" stroke={C.emerald} strokeWidth={1.8} opacity={0.9} />
      <path d={navPath} fill="none" stroke={C.sky} strokeWidth={2.4} />
      {nav.map((v, i) => <circle key={i} cx={mx(i + 1)} cy={my(v)} r={2.6} fill={C.sky} />)}
      <circle cx={mx(3)} cy={my(108)} r={4.5} fill={C.emerald} />
      <circle cx={mx(7)} cy={my(94)} r={4.5} fill={C.rose} />
      <Tag x={mx(3)} y={50} label="peak 108 · day 3" color={C.emerald} />
      <Tag x={400} y={128} label="trough 94 · day 7" color={C.rose} anchor="start" />
      <Note x={500} y={44} label="running max — the peak so far" size={9.5} anchor="end" color={C.emerald} />
      {/* the deepest drop, bracketed */}
      <line x1={mx(3) + 8} y1={my(108)} x2={232} y2={my(108)} stroke={C.dim} strokeWidth={1} strokeDasharray="3 3" />
      <line x1={mx(7) - 8} y1={my(94)} x2={248} y2={my(94)} stroke={C.dim} strokeWidth={1} strokeDasharray="3 3" />
      <path d={`M 240 ${my(108)} L 240 ${my(94)} M 232 ${my(108)} L 248 ${my(108)} M 232 ${my(94)} L 248 ${my(94)}`} fill="none" stroke={C.rose} strokeWidth={1.5} />
      <Note x={256} y={106} label="−12.96%" size={11} anchor="start" color={C.rose} weight={700} />
      {/* the read-out */}
      <rect x={590} y={48} width={240} height={100} rx={8} fill={C.rose} fillOpacity={0.06} stroke={C.rose} strokeOpacity={0.35} />
      <Note x={606} y={72} label="max drawdown =" size={10.5} anchor="start" color={C.rose} weight={700} />
      <Note x={606} y={90} label="(trough − peak) ÷ peak" size={10} anchor="start" color={C.zinc} />
      <Note x={606} y={110} label="(94 − 108) ÷ 108" size={10} anchor="start" color={C.zinc} />
      <Note x={606} y={130} label="= −12.96% — day 3 → day 7" size={10.5} anchor="start" color={C.rose} weight={700} />
      <line x1={590} y1={160} x2={608} y2={160} stroke={C.emerald} strokeWidth={2} />
      <Note x={614} y={163} label="running max" size={9} anchor="start" color={C.emerald} />
      <line x1={590} y1={176} x2={608} y2={176} stroke={C.sky} strokeWidth={2} />
      <Note x={614} y={179} label="NAV" size={9} anchor="start" color={C.sky} />
      <Note x={430} y={200} label="one window pass stamps the running max — the pair scan is O(n²) and forgets the peak moves forward" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* duplicate-charge-pairs — the same charge twice                      */
/* ------------------------------------------------------------------ */

export function ArtDuplicateChargePairs() {
  const mx = (s: number) => 70 + (s / 300) * 660; // 0..300 seconds
  const ay = 120;
  return (
    <g>
      <Defs id="arw-dfm-6" />
      <Note x={70} y={24} label="one card · one merchant · same amount — only the clock decides" size={9.5} anchor="start" color={C.zinc} />
      {/* the 120-second window */}
      <rect x={70} y={100} width={mx(120) - 70} height={40} rx={6} fill={C.rose} fillOpacity={0.07} stroke={C.rose} strokeOpacity={0.4} />
      <Tag x={202} y={114} label="pair window · 0-120s" color={C.rose} />
      {/* the feed timeline */}
      <line x1={70} y1={ay} x2={806} y2={ay} stroke={C.dim} strokeWidth={1.2} />
      {[0, 60, 120, 180, 240, 300].map((s) => (
        <g key={s}>
          <line x1={mx(s)} y1={ay - 4} x2={mx(s)} y2={ay + 4} stroke={C.dim} strokeWidth={1.2} />
          <Note x={mx(s)} y={134} label={`${s}s`} size={9} color={C.dim} />
        </g>
      ))}
      {/* three identical charges */}
      {([[10, "A", 92], [100, "B", 290], [190, "C", 488]] as Array<[number, string, number]>).map(([s, n, cx]) => (
        <g key={n}>
          <circle cx={cx} cy={ay} r={5.5} fill={C.sky} />
          <Note x={n === "B" ? 300 : cx} y={98} label={`${n} · $12.00 · ${s}s`} size={9.5} anchor={n === "B" ? "start" : "middle"} color={C.sky} />
        </g>
      ))}
      {/* the clean pair, bracketed */}
      <path d={`M ${mx(10)} 74 L ${mx(100)} 74 M ${mx(10)} 68 L ${mx(10)} 80 M ${mx(100)} 68 L ${mx(100)} 80`} fill="none" stroke={C.amber} strokeWidth={2} />
      <Tag x={191} y={60} label="the pair — 90s apart · $12.00 = $12.00" color={C.amber} />
      {/* the third charge chaining on */}
      <path d={`M ${mx(100) + 6} 128 C 340 152, 440 152, ${mx(190) - 6} 128`} fill="none" stroke={C.rose} strokeWidth={1.6} strokeDasharray="4 3" markerEnd="url(#arw-dfm-6)" />
      <Tag x={389} y={168} label="chain A→B→C — not 2 clean pairs" color={C.rose} />
      <Note x={508} y={150} label="A→C = 180s — outside" size={9} anchor="start" color={C.dim} />
      <Note x={660} y={132} label="dedupe: earliest partner only" size={9} anchor="start" color={C.dim} />
      {/* the pair rule */}
      <rect x={604} y={36} width={228} height={66} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={620} y={56} label="the pair rule" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={620} y={74} label="a.charged_at ≤ b.charged_at (tie: id)" size={9} anchor="start" color={C.zinc} />
      <Note x={620} y={90} label="epoch gap BETWEEN 0 AND 120" size={9} anchor="start" color={C.zinc} />
      <Note x={430} y={200} label="same card + same merchant + same amount + gap 0-120s — the self-join that catches the double tap" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the market desk's day                                  */
/* ------------------------------------------------------------------ */

export function ArtStudyMarketDesk() {
  return (
    <g>
      <Defs id="arw-dfm-s1" />
      <Note x={430} y={22} label="the market desk's day — every joint is one problem's gate" size={10} color={C.zinc} />
      {/* rates and charges landing on the marks */}
      <Tag x={285} y={44} label="EUR 1.0847" color={C.cyan} />
      <Tag x={370} y={44} label="JPY 0.0067" color={C.cyan} />
      <line x1={285} y1={54} x2={285} y2={62} stroke={C.cyan} strokeWidth={1.2} strokeDasharray="2 2" />
      <line x1={370} y1={54} x2={370} y2={62} stroke={C.cyan} strokeWidth={1.2} strokeDasharray="2 2" />
      {/* the main pipe */}
      <Box x={36} y={64} w={150} h={52} label="Trades & positions" color={C.sky} fillOpacity={0.12} fs={11} />
      <Note x={111} y={107} label="symbol · qty · cost" size={9} color={C.dim} />
      <Box x={246} y={64} w={150} h={52} label="Daily marks" color={C.violet} fillOpacity={0.12} fs={12} />
      <Note x={321} y={107} label="FX rates · charges land" size={9} color={C.dim} />
      <Box x={456} y={64} w={150} h={52} label="Risk numbers" color={C.rose} fillOpacity={0.12} fs={12} />
      <Note x={531} y={107} label="HHI · drawdown" size={9} color={C.dim} />
      <Box x={666} y={64} w={158} h={52} label="Cash events" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Note x={745} y={107} label="interest · dividends" size={9} color={C.dim} />
      <Arrow d="M 188 90 L 242 90" color={C.zinc} marker="arw-dfm-s1" />
      <Arrow d="M 398 90 L 452 90" color={C.zinc} marker="arw-dfm-s1" />
      <Arrow d="M 608 90 L 662 90" color={C.zinc} marker="arw-dfm-s1" />
      {/* the six gates, one per problem */}
      <Note x={52} y={132} label="gates:" size={9} anchor="start" color={C.dim} />
      <Tag x={216} y={132} label="fx exposure" color={C.sky} />
      <Tag x={496} y={132} label="HHI" color={C.rose} />
      <Tag x={568} y={132} label="drawdown" color={C.fuchsia} />
      <Tag x={710} y={132} label="interest" color={C.emerald} />
      <Tag x={782} y={132} label="dividends" color={C.cyan} />
      <Tag x={321} y={246} label="duplicates" color={C.amber} />
      {/* down to surveillance on the raw feed */}
      <Arrow d="M 321 148 L 321 176" color={C.violet} marker="arw-dfm-s1" />
      <Note x={330} y={164} label="the raw feed, again" size={9} anchor="start" color={C.violet} />
      <Box x={246} y={180} w={150} h={52} label="Surveillance" color={C.amber} fillOpacity={0.12} fs={12} />
      <Note x={321} y={223} label="duplicate charges" size={9} color={C.dim} />
      {/* the report, fed by risk and cash */}
      <Arrow d="M 470 148 L 470 176" color={C.rose} marker="arw-dfm-s1" />
      <Arrow d="M 700 150 C 700 168, 650 174, 600 176" color={C.emerald} marker="arw-dfm-s1" />
      <Arrow d="M 398 206 L 452 206" color={C.zinc} marker="arw-dfm-s1" />
      <Tag x={425} y={194} label="flags" color={C.zinc} />
      <Box x={456} y={180} w={150} h={52} label="Report" color={C.blue} fillOpacity={0.12} fs={12} />
      <Note x={531} y={223} label="one number each" size={9} color={C.dim} />
      <Arrow d="M 608 206 L 638 206" color={C.blue} marker="arw-dfm-s1" />
      {/* the desk's clock */}
      <rect x={36} y={180} width={180} height={94} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={52} y={198} label="the desk's clock" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={52} y={214} label="· 09:30 — trades land" size={9} anchor="start" color={C.sky} />
      <Note x={52} y={229} label="· 16:00 — rates & charges" size={9} anchor="start" color={C.violet} />
      <Note x={52} y={244} label="· 16:05 — risk print" size={9} anchor="start" color={C.rose} />
      <Note x={52} y={259} label="· EOD — accrual, pay dates" size={9} anchor="start" color={C.emerald} />
      {/* who reads what */}
      <rect x={644} y={180} width={186} height={94} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={658} y={198} label="who reads the report" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={658} y={214} label="· PM — HHI, drawdown" size={9} anchor="start" color={C.rose} />
      <Note x={658} y={229} label="· treasury — fx exposure" size={9} anchor="start" color={C.sky} />
      <Note x={658} y={244} label="· ops — interest, dividends" size={9} anchor="start" color={C.emerald} />
      <Note x={658} y={259} label="· fraud desk — duplicates" size={9} anchor="start" color={C.amber} />
      <Note x={430} y={292} label="marks before risk, risk before the report, surveillance on the raw feed — every problem owns one gate" size={10} color={C.zinc} />
    </g>
  );
}
