"use client";

// Data & Finance art — Marketing & Attribution family.
// One REAL-LIFE concept diagram per problem primer + the section study flow
// ("the spend-to-signup chain"). Same pastel language as lc-df-art-bank.tsx:
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

function Arrow({ d, color, dashed = false, marker = "arw-dfk", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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

/** Numbered study-flow gate chip — reads 1..6, one per problem. */
function Gate({ x, y, n }: { x: number; y: number; n: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill="#09090b" stroke={C.amber} strokeWidth={1.2} />
      <text x={x} y={y + 3} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={700} fill={C.amber}>{n}</text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8055 roas-by-campaign — spend bar vs attributed-revenue bar         */
/* ------------------------------------------------------------------ */

export function ArtRoasByCampaign() {
  const rows: Array<[string, number, number, string, string]> = [
    ["search-brand", 300, 1320, "4.40×", C.emerald],
    ["social-ads", 320, 721, "2.25×", C.zinc],
    ["video-ads", 400, 900, "2.25×", C.zinc],
    ["display-retargeting", 250, 388, "1.55×", C.amber],
    ["podcast-sponsorships", 180, 0, "0.00×", C.rose],
  ];
  const hOf = (v: number) => (v / 1320) * 90;
  return (
    <g>
      <Defs id="arw-dfk-1" />
      <Note x={64} y={22} label="roas = attributed revenue ÷ spend" size={9.5} anchor="start" color={C.dim} />
      {/* axis */}
      <line x1={60} y1={148} x2={560} y2={148} stroke={C.dim} strokeWidth={1.2} />
      {rows.map(([name, spend, rev, badge, tone], i) => {
        const gx = 72 + i * 100;
        const hs = hOf(spend);
        const hr = hOf(rev);
        return (
          <g key={name}>
            <rect x={gx} y={148 - hs} width={26} height={hs} rx={3} fill={C.amber} fillOpacity={0.45} />
            <Note x={gx + 13} y={148 - hs - 4} label={`$${spend}`} size={8} color={C.amber} />
            {rev > 0 ? (
              <g>
                <rect x={gx + 32} y={148 - hr} width={26} height={hr} rx={3} fill={C.emerald} fillOpacity={0.55} />
                <Note x={gx + 45} y={148 - hr - 4} label={`$${rev.toLocaleString("en-US")}`} size={8} color={C.emerald} />
              </g>
            ) : (
              <g>
                <rect x={gx + 32} y={141} width={26} height={6} rx={2} fill="none" stroke={C.rose} strokeWidth={1} strokeDasharray="3 2" />
                <Note x={gx + 45} y={137} label="$0" size={8} color={C.rose} />
              </g>
            )}
            <Tag x={gx + 29} y={36} label={badge} color={tone} />
            <Note x={gx + 29} y={162} label={name} size={8} color={C.dim} />
          </g>
        );
      })}
      <Note x={517} y={174} label="no revenue rows — kept" size={8} color={C.rose} />
      {/* the tie pair — same 2dp roas, shared rank */}
      <path d="M 201 50 L 201 54 L 301 54 L 301 50" fill="none" stroke={C.amber} strokeWidth={1.2} />
      <Note x={251} y={65} label="same 2.25 — tie shares rank 2" size={8.5} color={C.amber} />
      {/* legend */}
      <rect x={66} y={170} width={10} height={10} rx={2} fill={C.amber} fillOpacity={0.5} />
      <Note x={82} y={179} label="spend $" size={9} anchor="start" color={C.amber} />
      <rect x={150} y={170} width={10} height={10} rx={2} fill={C.emerald} fillOpacity={0.55} />
      <Note x={166} y={179} label="attributed revenue $" size={9} anchor="start" color={C.emerald} />
      {/* ranked read-out */}
      <rect x={604} y={44} width={236} height={116} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={618} y={62} label="ranked by roas" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={618} y={80} label="1  search-brand     4.40×" size={8.5} anchor="start" color={C.emerald} />
      <Note x={618} y={96} label="2  social-ads       2.25×" size={8.5} anchor="start" color={C.zinc} />
      <Note x={618} y={112} label="2  video-ads        2.25×" size={8.5} anchor="start" color={C.zinc} />
      <Note x={618} y={128} label="4  display-retgt    1.55×" size={8.5} anchor="start" color={C.amber} />
      <Note x={618} y={144} label="5  podcast          0.00×" size={8.5} anchor="start" color={C.rose} />
      <Note x={618} y={172} label="tie shares rank 2 — rank 3 is skipped" size={8.5} anchor="start" color={C.amber} />
      <Note x={618} y={186} label="podcast: spend, no revenue → 0.0× kept" size={8.5} anchor="start" color={C.rose} />
      <Note x={430} y={200} label="roas = attributed revenue ÷ spend — the campaign that spent and never converted still reports 0.0× and ranks last" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8056 first-last-touch-attribution — the 30-day lookback timeline    */
/* ------------------------------------------------------------------ */

export function ArtFirstLastTouch() {
  const dx = (d: number) => 64 + ((d + 30) / 30) * 616; // day −30 → day 0
  return (
    <g>
      <Defs id="arw-dfk-2" />
      {/* the lookback band [day −29, day 0] */}
      <rect x={dx(-29)} y={64} width={680 - dx(-29)} height={64} fill={C.sky} fillOpacity={0.06} stroke={C.sky} strokeOpacity={0.25} />
      <Note x={380} y={78} label="30-day lookback · [day −29, day 0] inclusive" size={8.5} color={C.sky} />
      {/* axis + ticks */}
      <line x1={56} y1={96} x2={700} y2={96} stroke={C.dim} strokeWidth={1.2} />
      {[-30, -29, -20, -10, 0].map((d) => (
        <line key={d} x1={dx(d)} y1={92} x2={dx(d)} y2={100} stroke={C.zinc} strokeWidth={1} />
      ))}
      <Note x={dx(-20)} y={112} label="−20" size={8.5} color={C.dim} />
      <Note x={dx(-10)} y={112} label="−10" size={8.5} color={C.dim} />
      <Note x={dx(0)} y={112} label="day 0" size={8.5} color={C.dim} />
      {/* conversion flag on day 0 */}
      <line x1={680} y1={64} x2={680} y2={140} stroke={C.fuchsia} strokeWidth={2} strokeDasharray="5 3" />
      <Tag x={668} y={152} label="conversion — day 0" color={C.fuchsia} />
      {/* the journey: first touch → middle → last touch */}
      <circle cx={dx(-18)} cy={96} r={10.5} fill="none" stroke={C.emerald} strokeWidth={1} strokeOpacity={0.5} />
      <circle cx={dx(-18)} cy={96} r={6.5} fill={C.emerald} />
      <Tag x={310} y={34} label="FIRST touch — started the journey" color={C.emerald} />
      <line x1={310} y1={46} x2={310} y2={84} stroke={C.emerald} strokeWidth={1.2} strokeDasharray="3 3" strokeOpacity={0.8} />
      <circle cx={dx(-9)} cy={96} r={4.5} fill={C.zinc} />
      <circle cx={680} cy={96} r={10.5} fill="none" stroke={C.amber} strokeWidth={1} strokeOpacity={0.5} />
      <circle cx={680} cy={96} r={6.5} fill={C.amber} />
      <Tag x={665} y={34} label="LAST touch — closed it" color={C.amber} />
      <line x1={670} y1={46} x2={679} y2={84} stroke={C.amber} strokeWidth={1.2} strokeDasharray="3 3" strokeOpacity={0.8} />
      <Note x={dx(-18)} y={124} label="Email · day −18" size={8.5} color={C.emerald} />
      <Note x={dx(-9)} y={124} label="Meta · day −9" size={8.5} color={C.zinc} />
      <Note x={680} y={124} label="Google · day 0" size={8.5} color={C.amber} />
      {/* boundary chips: day −29 in, day −30 out */}
      <line x1={dx(-29)} y1={104} x2={dx(-29)} y2={118} stroke={C.sky} strokeWidth={1} strokeDasharray="2 2" />
      <Tag x={100} y={130} label="day −29 — in (counts)" color={C.sky} />
      <circle cx={64} cy={96} r={4} fill="#09090b" stroke={C.rose} strokeWidth={1.5} />
      <line x1={64} y1={104} x2={64} y2={146} stroke={C.rose} strokeWidth={1} strokeDasharray="2 2" />
      <Tag x={90} y={158} label="day −30 — out → 'none'" color={C.rose} />
      {/* per-conversion read-out */}
      <rect x={726} y={50} width={118} height={120} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={736} y={68} label="per conversion" size={9} anchor="start" color={C.zinc} weight={700} />
      <Note x={736} y={86} label="c1  Meta → Google" size={8} anchor="start" color={C.zinc} />
      <Note x={736} y={102} label="c2  Google → Google" size={8} anchor="start" color={C.zinc} />
      <Note x={736} y={118} label="c3  Email → Email" size={8} anchor="start" color={C.zinc} />
      <Note x={736} y={134} label="c4  none → none" size={8} anchor="start" color={C.rose} />
      <Note x={736} y={150} label="c6  none → none" size={8} anchor="start" color={C.rose} />
      <Note x={736} y={164} label="no touches → 'none'" size={7.5} anchor="start" color={C.dim} />
      <Note x={430} y={200} label="the window is [day −29, day 0] inclusive — first touch claims the start, last touch claims the close; a day −30 touch never counts" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8057 email-engagement-funnel — nested bars + step rates             */
/* ------------------------------------------------------------------ */

export function ArtEmailEngagementFunnel() {
  const cx = 280;
  const stages: Array<[string, number, string, number]> = [
    ["sent", 1000, C.sky, 34],
    ["delivered", 900, C.cyan, 62],
    ["opened", 585, C.violet, 90],
    ["clicked", 176, C.fuchsia, 118],
    ["converted", 53, C.emerald, 146],
  ];
  const wOf = (v: number) => (v / 1000) * 500;
  return (
    <g>
      <Defs id="arw-dfk-3" />
      {stages.map(([name, n, color, y]) => {
        const w = wOf(n);
        return (
          <g key={name}>
            <rect x={cx - w / 2} y={y} width={w} height={20} rx={4} fill={color} fillOpacity={0.35} stroke={color} strokeOpacity={0.5} />
            {w > 80 ? (
              <Note x={cx - w / 2 + 8} y={y + 13.5} label={`${name} ${n.toLocaleString("en-US")}`} size={9.5} anchor="start" color={color} weight={700} />
            ) : null}
          </g>
        );
      })}
      <Note x={280} y={182} label="converted · 53" size={9.5} color={C.emerald} weight={700} />
      {/* step-rate arrows — each step vs its PREDECESSOR */}
      <Arrow d="M 534 44 L 534 72 L 511 72" color={C.cyan} sw={1.4} marker="arw-dfk-3" />
      <Note x={542} y={62} label="90% of sent" size={8.5} anchor="start" color={C.cyan} />
      <Arrow d="M 509 72 L 509 100 L 432 100" color={C.violet} sw={1.4} marker="arw-dfk-3" />
      <Note x={517} y={90} label="65% of delivered" size={8.5} anchor="start" color={C.violet} />
      <Arrow d="M 430 100 L 430 128 L 330 128" color={C.fuchsia} sw={1.4} marker="arw-dfk-3" />
      <Note x={438} y={118} label="30% of opened" size={8.5} anchor="start" color={C.fuchsia} />
      <Arrow d="M 328 128 L 328 156 L 299 156" color={C.emerald} sw={1.4} marker="arw-dfk-3" />
      <Note x={336} y={146} label="30% of clicked" size={8.5} anchor="start" color={C.emerald} />
      {/* the converter who never clicked — the funnel is not strictly nested */}
      <Arrow d="M 150 112 C 90 140, 130 158, 263 151" color={C.rose} dashed sw={1.4} marker="arw-dfk-3" />
      <Note x={60} y={172} label="a converter who never clicked" size={8} anchor="start" color={C.rose} />
      {/* the rate rules */}
      <rect x={612} y={32} width={232} height={152} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={626} y={52} label="each rate ÷ the PREVIOUS step" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={626} y={72} label="open  = opened ÷ delivered" size={8.5} anchor="start" color={C.sky} />
      <Note x={626} y={88} label="click = clicked ÷ opened" size={8.5} anchor="start" color={C.sky} />
      <Tag x={626} y={108} label="not ÷ sent — the spam trap" color={C.amber} anchor="start" />
      <Note x={626} y={132} label="converted can skip clicked —" size={8.5} anchor="start" color={C.rose} />
      <Note x={626} y={146} label="someone buys without clicking" size={8.5} anchor="start" color={C.rose} />
      <Note x={626} y={166} label="a user counts once per step" size={8.5} anchor="start" color={C.dim} />
      <Note x={430} y={200} label="sent → delivered → opened → clicked → converted — every step's rate divides by the step right above it" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8058 linear-multi-touch — one conversion's credit, sliced evenly    */
/* ------------------------------------------------------------------ */

export function ArtLinearMultiTouch() {
  const slices: Array<[number, string, string]> = [
    [136.5, C.sky, "Email"],
    [257.5, C.violet, "Meta"],
    [378.5, C.sky, "Email"],
    [499.5, C.amber, "Google"],
  ];
  return (
    <g>
      <Defs id="arw-dfk-4" />
      <Box x={56} y={24} w={190} h={32} label="conversion #7 · credit 1.00" color={C.sky} fillOpacity={0.1} fs={10.5} />
      {/* the conversion's in-window touches */}
      <line x1={76} y1={84} x2={560} y2={84} stroke={C.dim} strokeWidth={1.2} />
      {([[120, C.sky, "Email", "day −12"], [250, C.violet, "Meta", "day −7"], [360, C.sky, "Email", "day −2"], [540, C.amber, "Google", "day 0"]] as Array<[number, string, string, string]>).map(([x, color, ch, day]) => (
        <g key={day}>
          <circle cx={x} cy={84} r={5} fill={color} />
          <Note x={x} y={68} label={ch} size={8.5} color={color} />
          <Note x={x} y={102} label={day} size={8} color={C.dim} />
        </g>
      ))}
      {/* the credit bar — n = 4 equal slices */}
      <line x1={120} y1={90} x2={136.5} y2={116} stroke={C.sky} strokeWidth={1.2} strokeDasharray="2 3" strokeOpacity={0.8} />
      <line x1={250} y1={90} x2={257.5} y2={116} stroke={C.violet} strokeWidth={1.2} strokeDasharray="2 3" strokeOpacity={0.8} />
      <line x1={360} y1={90} x2={378.5} y2={116} stroke={C.sky} strokeWidth={1.2} strokeDasharray="2 3" strokeOpacity={0.8} />
      <line x1={540} y1={90} x2={499.5} y2={116} stroke={C.amber} strokeWidth={1.2} strokeDasharray="2 3" strokeOpacity={0.8} />
      {slices.map(([sx, color], i) => (
        <g key={i}>
          <rect x={76 + i * 121} y={118} width={121} height={22} fill={color} fillOpacity={0.4} stroke={color} strokeOpacity={0.6} strokeWidth={1} />
          <Note x={sx} y={132} label="0.25" size={9} color={color} weight={700} />
        </g>
      ))}
      <Note x={318} y={156} label="4 in-window touches → 1.0 ÷ 4 = 0.25 each · slices sum to 1.00" size={9} color={C.zinc} />
      {/* slices flow to the per-channel totals */}
      <Arrow d="M 566 122 C 590 100, 600 70, 690 62" color={C.sky} dashed sw={1.2} marker="arw-dfk-4" />
      <Arrow d="M 566 129 L 690 95" color={C.amber} dashed sw={1.2} marker="arw-dfk-4" />
      <Arrow d="M 566 136 C 590 160, 600 140, 690 128" color={C.violet} dashed sw={1.2} marker="arw-dfk-4" />
      {/* channel totals after 4 conversions */}
      <rect x={612} y={30} width={236} height={150} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={622} y={48} label="channel totals — 4 conversions in" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={622} y={68} label="Email" size={9.5} anchor="start" color={C.sky} weight={700} />
      <rect x={700} y={56} width={125} height={14} rx={3} fill={C.sky} fillOpacity={0.5} />
      <Note x={831} y={68} label="1.25" size={9} anchor="start" color={C.sky} weight={700} />
      <Note x={622} y={84} label="five quarters, never a whole" size={8} anchor="start" color={C.dim} />
      <Note x={622} y={100} label="Google" size={9.5} anchor="start" color={C.amber} weight={700} />
      <rect x={700} y={88} width={100} height={14} rx={3} fill={C.amber} fillOpacity={0.5} />
      <Note x={806} y={100} label="1.00" size={9} anchor="start" color={C.amber} weight={700} />
      <Note x={622} y={116} label="one whole credit (n = 1)" size={8} anchor="start" color={C.dim} />
      <Note x={622} y={132} label="Meta" size={9.5} anchor="start" color={C.violet} weight={700} />
      <rect x={700} y={120} width={75} height={14} rx={3} fill={C.violet} fillOpacity={0.5} />
      <Note x={781} y={132} label="0.75" size={9} anchor="start" color={C.violet} weight={700} />
      <Note x={622} y={148} label="halves and quarters" size={8} anchor="start" color={C.dim} />
      <Tag x={722} y={170} label="1.25 of quarters beats 1.00 whole" color={C.emerald} />
      {/* the fraction rules */}
      <Tag x={150} y={178} label="credit per touch = 1.0 ÷ n" color={C.violet} />
      <Tag x={420} y={178} label="sum the fractions first, round last" color={C.amber} />
      <Note x={430} y={200} label="linear attribution pays every in-window touch its equal slice — assisters finally show up in the totals" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8059 budget-pacing — cumulative spend vs the budget line            */
/* ------------------------------------------------------------------ */

export function ArtBudgetPacing() {
  const mx = (d: number) => 64 + ((d - 1) / 19) * 496;
  const my = (v: number) => 150 - (v / 650) * 110;
  const path = (pts: number[][]) => pts.map((p, i) => `${i === 0 ? "M" : "L"} ${mx(p[0]).toFixed(1)} ${my(p[1]).toFixed(1)}`).join(" ");
  const loader = [[1, 220], [2, 410], [3, 570], [4, 592], [5, 606], [6, 615], [7, 621], [8, 626], [10, 630], [12, 632], [15, 634], [20, 636]];
  const climber = [[1, 60], [2, 115], [3, 175], [4, 230], [5, 290], [6, 340], [7, 395], [8, 450], [9, 520], [10, 560], [12, 600], [14, 622], [16, 635], [18, 644], [20, 650]];
  const toucher = [[1, 40], [2, 90], [3, 150], [4, 210], [5, 270], [6, 330], [7, 390], [8, 440], [9, 470], [10, 490], [11, 500], [13, 500], [16, 500], [20, 500]];
  return (
    <g>
      <Defs id="arw-dfk-5" />
      {/* axes */}
      <line x1={64} y1={30} x2={64} y2={150} stroke={C.dim} strokeWidth={1.2} />
      <line x1={64} y1={150} x2={570} y2={150} stroke={C.dim} strokeWidth={1.2} />
      <line x1={64} y1={my(250)} x2={560} y2={my(250)} stroke={C.dim} strokeOpacity={0.22} strokeDasharray="2 4" />
      <Note x={56} y={my(250) + 3.5} label="250" size={8.5} anchor="end" color={C.dim} />
      <Note x={56} y={153.5} label="0" size={8.5} anchor="end" color={C.dim} />
      <Note x={56} y={my(500) + 3.5} label="500" size={8.5} anchor="end" color={C.violet} />
      <Note x={30} y={88} label="cum" size={9} color={C.zinc} />
      <Note x={30} y={100} label="spend" size={9} color={C.zinc} />
      {[1, 3, 6, 9, 12, 15, 18, 20].map((d) => (
        <Note key={d} x={mx(d)} y={168} label={`${d}`} size={8.5} color={C.dim} />
      ))}
      <Note x={560} y={180} label="day" size={9} anchor="end" color={C.dim} />
      {/* the budget line */}
      <line x1={64} y1={my(500)} x2={570} y2={my(500)} stroke={C.violet} strokeWidth={1.4} strokeDasharray="6 4" />
      <Tag x={520} y={56} label="budget 500.00" color={C.violet} />
      {/* the three cumulative walks */}
      <path d={path(toucher)} fill="none" stroke={C.emerald} strokeWidth={1.8} />
      <path d={path(climber)} fill="none" stroke={C.amber} strokeWidth={2} />
      <path d={path(loader)} fill="none" stroke={C.rose} strokeWidth={2.2} />
      {/* first breach — front loader, day 3 */}
      <circle cx={mx(3)} cy={my(570)} r={5} fill={C.rose} />
      <line x1={mx(3)} y1={my(570) + 5} x2={mx(3)} y2={150} stroke={C.rose} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.7} />
      <line x1={mx(3) + 6} y1={my(570) - 4} x2={148} y2={38} stroke={C.rose} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.7} />
      <Tag x={150} y={30} label="first breach · day 3" color={C.rose} />
      {/* first breach — steady climber, day 9 */}
      <circle cx={mx(9)} cy={my(520)} r={5} fill={C.amber} />
      <line x1={mx(9)} y1={my(520) + 5} x2={mx(9)} y2={150} stroke={C.amber} strokeWidth={1} strokeDasharray="3 3" strokeOpacity={0.7} />
      <Tag x={300} y={80} label="first breach — day 9" color={C.amber} />
      {/* the exactly-at-budget toucher — never strictly over */}
      <circle cx={mx(11)} cy={my(500)} r={3.5} fill={C.emerald} />
      <Tag x={330} y={102} label="touches 500 — never crosses" color={C.emerald} />
      <Note x={330} y={120} label="no breach row — excluded" size={8} anchor="start" color={C.emerald} />
      {/* legend */}
      <line x1={64} y1={182} x2={80} y2={182} stroke={C.rose} strokeWidth={2.5} />
      <Note x={84} y={185} label="front-loader" size={8.5} anchor="start" color={C.rose} />
      <line x1={152} y1={182} x2={168} y2={182} stroke={C.amber} strokeWidth={2.5} />
      <Note x={172} y={185} label="steady climber" size={8.5} anchor="start" color={C.amber} />
      <line x1={250} y1={182} x2={266} y2={182} stroke={C.emerald} strokeWidth={2.5} />
      <Note x={270} y={185} label="the toucher" size={8.5} anchor="start" color={C.emerald} />
      {/* the read-out */}
      <rect x={612} y={36} width={232} height={124} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={626} y={56} label="first breach day — strictly over" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={626} y={78} label="front-loader · day 3 · +70.00" size={9} anchor="start" color={C.rose} />
      <Note x={626} y={96} label="steady climber · day 9 · +20.00" size={9} anchor="start" color={C.amber} />
      <Note x={626} y={114} label="toucher · never over — no row" size={9} anchor="start" color={C.emerald} />
      <Note x={626} y={138} label="500.01 breaches · 500.00 does not" size={8.5} anchor="start" color={C.violet} />
      <Note x={626} y={152} label="the FIRST crossing, not every one" size={8} anchor="start" color={C.dim} />
      <Note x={430} y={200} label="cumulative spend per campaign, day by day — the answer is the FIRST day the line stands strictly above the budget line" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8060 channel-ltv-vs-cac — CAC out vs 90-day revenue in              */
/* ------------------------------------------------------------------ */

export function ArtChannelLtvVsCac() {
  const channels: Array<[string, string, number, number, number, number, string]> = [
    // name, color, cac $, cac px, rev90 $, rev90 px, ratio
    ["google-search", C.sky, 40, 96, 128, 307, "3.2×"],
    ["meta-social", C.violet, 12, 29, 9.6, 23, "0.8×"],
    ["email-lifecycle", C.cyan, 25, 60, 72.5, 174, "2.9×"],
  ];
  return (
    <g>
      <Defs id="arw-dfk-6" />
      <Note x={170} y={30} label="CAC paid out vs first-90-days revenue in — per customer, same origin" size={8.5} anchor="start" color={C.dim} />
      <Note x={525} y={30} label="ltv ÷ cac" size={8} anchor="start" color={C.dim} />
      {channels.map(([name, color, cac, cacPx, rev, revPx, ratio], i) => {
        const top = 38 + i * 44;
        const good = parseFloat(ratio) >= 1;
        return (
          <g key={name}>
            <Note x={60} y={top + 17} label={name} size={9.5} anchor="start" color={color} weight={700} />
            <rect x={170} y={top + 8} width={cacPx} height={10} rx={2} fill={C.rose} fillOpacity={0.5} />
            <Note x={170 + cacPx + 6} y={top + 17} label={`$${cac}`} size={8.5} anchor="start" color={C.rose} />
            <rect x={170} y={top + 24} width={revPx} height={10} rx={2} fill={C.emerald} fillOpacity={0.55} />
            <Note x={170 + revPx + 6} y={top + 33} label={`$${rev}`} size={8.5} anchor="start" color={C.emerald} />
            <Note x={525} y={top + 33} label={ratio} size={10.5} anchor="start" color={good ? C.emerald : C.rose} weight={700} />
          </g>
        );
      })}
      {/* one customer's 90-day clock */}
      <Note x={60} y={179} label="the 90-day clock" size={9} anchor="start" color={C.zinc} />
      <rect x={170} y={168} width={395.6} height={16} fill={C.emerald} fillOpacity={0.06} stroke={C.emerald} strokeOpacity={0.25} />
      <line x1={170} y1={176} x2={570} y2={176} stroke={C.dim} strokeWidth={1.2} />
      {[0, 30, 60, 89, 90].map((d) => (
        <line key={d} x1={170 + d * 4.444} y1={172} x2={170 + d * 4.444} y2={180} stroke={C.zinc} strokeWidth={1} />
      ))}
      <Note x={170} y={190} label="0" size={8} color={C.dim} />
      <Note x={303} y={190} label="d30" size={8} color={C.dim} />
      <Note x={437} y={190} label="d60" size={8} color={C.dim} />
      <Note x={560} y={190} label="d89" size={8} anchor="end" color={C.dim} />
      <Note x={574} y={190} label="d90" size={8} anchor="start" color={C.dim} />
      <circle cx={170} cy={176} r={4} fill={C.sky} />
      <circle cx={565.6} cy={176} r={4} fill={C.emerald} />
      <circle cx={570} cy={176} r={4} fill="#09090b" stroke={C.rose} strokeWidth={1.5} />
      <Note x={560} y={160} label="day 89 — in" size={8} anchor="end" color={C.emerald} />
      <Note x={574} y={160} label="d90 — out" size={8} anchor="start" color={C.rose} />
      <Note x={556} y={179} label="in-window: [acq, acq + 89]" size={8} anchor="end" color={C.emerald} />
      <Tag x={352} y={176} label="payback — day 41" color={C.amber} />
      {/* the read-out */}
      <rect x={612} y={32} width={232} height={150} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={626} y={52} label="rev90 — the customer's own clock" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={626} y={72} label="orders in [acq, acq + 89] days" size={8.5} anchor="start" color={C.emerald} />
      <Note x={626} y={88} label="acquisition day counts in" size={8.5} anchor="start" color={C.emerald} />
      <Tag x={626} y={108} label="not the report's calendar" color={C.fuchsia} anchor="start" />
      <Note x={626} y={132} label="zero-order customers stay in" size={8.5} anchor="start" color={C.dim} />
      <Note x={626} y={146} label="the denominator — no cherry-picking" size={8.5} anchor="start" color={C.dim} />
      <Note x={626} y={168} label="ratio = rev90 per customer ÷ cac" size={8.5} anchor="start" color={C.zinc} />
      <Note x={430} y={205} label="90 days of revenue per acquired customer against what the channel paid to acquire them — each customer runs their own clock" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the spend-to-signup chain                              */
/* ------------------------------------------------------------------ */

export function ArtStudySpendToSignup() {
  return (
    <g>
      <Defs id="arw-dfk-s1" />
      <Note x={430} y={20} label="the marketing chain — budget → spend → touches → conversion → revenue" size={10} color={C.zinc} />
      {/* who reads the chain */}
      <rect x={36} y={40} width={200} height={68} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={50} y={56} label="who reads the chain" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={50} y={72} label="· growth — ROAS board (1)" size={8.5} anchor="start" color={C.sky} />
      <Note x={50} y={86} label="· CRM — email funnel (3)" size={8.5} anchor="start" color={C.cyan} />
      <Note x={50} y={100} label="· finance — LTV vs CAC (6)" size={8.5} anchor="start" color={C.emerald} />
      {/* the attribution fork above the touch stage */}
      <Note x={444} y={42} label="attribution models — who gets the credit" size={9} color={C.zinc} />
      <Box x={334} y={52} w={100} h={34} label="first touch" color={C.sky} fillOpacity={0.12} fs={10} />
      <Box x={454} y={52} w={100} h={34} label="last touch" color={C.sky} fillOpacity={0.12} fs={10} />
      <Box x={566} y={52} w={100} h={34} label="linear 1/n" color={C.violet} fillOpacity={0.12} fs={10} />
      <Gate x={444} y={69} n={2} />
      <Gate x={660} y={69} n={4} />
      <Arrow d="M 414 118 L 386 90" color={C.sky} marker="arw-dfk-s1" />
      <Arrow d="M 444 118 L 504 90" color={C.sky} marker="arw-dfk-s1" />
      <Arrow d="M 474 118 L 614 90" color={C.violet} marker="arw-dfk-s1" />
      {/* the ROAS read-out looping revenue back onto spend */}
      <path d="M 740 118 C 630 100, 440 100, 338 118" fill="none" stroke={C.amber} strokeWidth={1.4} strokeDasharray="5 4" markerEnd="url(#arw-dfk-s1)" opacity={0.9} />
      <Gate x={535} y={104} n={1} />
      <Tag x={770} y={98} label="ROAS = revenue ÷ spend" color={C.amber} />
      {/* the main pipe */}
      <Box x={36} y={118} w={128} h={50} label="Budget" color={C.sky} fillOpacity={0.12} fs={12} />
      <Box x={204} y={118} w={130} h={50} label="Spend" color={C.amber} fillOpacity={0.12} fs={12} />
      <Box x={374} y={118} w={140} h={50} label="Touches" color={C.cyan} fillOpacity={0.12} fs={12} />
      <Box x={552} y={118} w={130} h={50} label="Conversion" color={C.violet} fillOpacity={0.12} fs={11.5} />
      <Box x={720} y={118} w={126} h={50} label="Revenue" color={C.emerald} fillOpacity={0.12} fs={12} />
      <Arrow d="M 168 143 L 200 143" color={C.zinc} marker="arw-dfk-s1" />
      <Arrow d="M 338 143 L 370 143" color={C.zinc} marker="arw-dfk-s1" />
      <Arrow d="M 518 143 L 548 143" color={C.zinc} marker="arw-dfk-s1" />
      <Arrow d="M 686 143 L 716 143" color={C.zinc} marker="arw-dfk-s1" />
      <Note x={112} y={186} label="this month's plan" size={8.5} anchor="start" color={C.dim} />
      <Note x={617} y={186} label="the signup — one user's yes" size={8.5} color={C.dim} />
      {/* the supporting stages */}
      <Arrow d="M 269 172 L 269 202" color={C.amber} marker="arw-dfk-s1" />
      <Box x={196} y={206} w={150} h={44} label="Pacing watch" color={C.amber} fillOpacity={0.12} fs={11.5} />
      <Gate x={342} y={218} n={5} />
      <Note x={271} y={262} label="cum spend vs budget" size={8.5} color={C.dim} />
      <Arrow d="M 444 202 L 444 172" color={C.cyan} marker="arw-dfk-s1" />
      <Box x={386} y={206} w={140} h={44} label="Email funnel" color={C.cyan} fillOpacity={0.12} fs={11.5} />
      <Gate x={522} y={218} n={3} />
      <Arrow d="M 783 172 L 783 202" color={C.emerald} marker="arw-dfk-s1" />
      <Box x={676} y={206} w={170} h={44} label="90-day LTV vs CAC" color={C.emerald} fillOpacity={0.12} fs={11} />
      <Gate x={842} y={218} n={6} />
      <Note x={761} y={262} label="does the channel pay back?" size={8.5} color={C.dim} />
      {/* the budget loop — today's LTV read sets tomorrow's budget */}
      <path d="M 761 250 L 761 268 L 100 268 L 100 172" fill="none" stroke={C.emerald} strokeWidth={1.6} strokeDasharray="4 3" markerEnd="url(#arw-dfk-s1)" opacity={0.9} />
      <Tag x={450} y={268} label="LTV read sets next month's budget" color={C.emerald} />
      {/* the gate legend — one per problem */}
      <Note x={430} y={292} label="gates: 1 ROAS (8055) · 2 first/last (8056) · 3 email funnel (8057) · 4 multi-touch (8058) · 5 pacing (8059) · 6 channel LTV (8060)" size={8.5} color={C.zinc} />
    </g>
  );
}

export const MKTG_ART_W = 860;
export const MKTG_ART_H_PRIMER = 210;
export const MKTG_ART_H_STUDY = 300;
