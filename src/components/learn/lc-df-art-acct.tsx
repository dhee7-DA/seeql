"use client";

// Data & Finance art — Accounting & Close family: one real-life concept
// diagram per problem primer + the section study flow ("the month-end close").

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

function Arrow({ d, color, dashed = false, marker = "arw-dfa", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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
/* 8037 trial-balance-check — the scale                                */
/* ------------------------------------------------------------------ */

export function ArtTrialBalanceCheck() {
  // two pans: cash (balanced) and payroll (tilted +2000)
  return (
    <g>
      <Defs id="arw-dfa-1" />
      {/* beam */}
      <line x1={120} y1={70} x2={440} y2={58} stroke={C.zinc} strokeWidth={3} />
      <line x1={280} y1={64} x2={280} y2={96} stroke={C.dim} strokeWidth={2.5} />
      {/* left pan — debits */}
      <line x1={124} y1={71} x2={118} y2={96} stroke={C.dim} strokeWidth={1.4} />
      <line x1={124} y1={71} x2={130} y2={96} stroke={C.dim} strokeWidth={1.4} />
      <Box x={70} y={98} w={108} h={34} label="debits" color={C.sky} fillOpacity={0.12} fs={11} />
      <Note x={124} y={150} label="575,000" size={10.5} color={C.sky} weight={700} />
      <Note x={124} y={166} label="cash — balanced" size={9} color={C.emerald} />
      {/* right pan — credits */}
      <line x1={436} y1={59} x2={430} y2={84} stroke={C.dim} strokeWidth={1.4} />
      <line x1={436} y1={59} x2={442} y2={84} stroke={C.dim} strokeWidth={1.4} />
      <Box x={382} y={86} w={108} h={34} label="credits" color={C.violet} fillOpacity={0.12} fs={11} />
      <Note x={436} y={140} label="575,000" size={10.5} color={C.violet} weight={700} />
      <Note x={436} y={156} label="every account nets clean" size={9} color={C.emerald} />
      {/* the broken account */}
      <Box x={560} y={40} w={250} h={54} label="payroll_expense" color={C.rose} fillOpacity={0.1} fs={11.5} />
      <Note x={685} y={114} label="debits 202,000 · credits 200,000" size={9.5} color={C.rose} />
      <Box x={600} y={126} w={170} h={30} label="delta = +2,000 ¢" color={C.rose} fillOpacity={0.14} fs={11} />
      <Tag x={685} y={182} label="the one row the controller must clear before the close" color={C.rose} />
      <Note x={430} y={202} label="delta_cents = debit − credit per account — the trial balance is a GROUP BY with an opinion" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8038 ar-aging-schedule — the aging conveyor                         */
/* ------------------------------------------------------------------ */

export function ArtArAgingSchedule() {
  const bins: Array<[string, string, number]> = [
    ["current", C.emerald, 90000], ["1-30", C.lime, 60000], ["31-60", C.amber, 45000],
    ["61-90", C.orange, 30000], ["over 90", C.rose, 25000],
  ];
  const bw = 128, gap = 22, x0 = 52, y0 = 74;
  return (
    <g>
      <Defs id="arw-dfa-2" />
      <Note x={430} y={34} label="customer 501 — every invoice drops into the bin its age picks" size={10} color={C.zinc} />
      {bins.map(([label, color, amt], i) => {
        const x = x0 + i * (bw + gap);
        return (
          <g key={label}>
            <path d={`M ${x} ${y0} h ${bw} l -14 44 h -${bw - 28} z`} fill={color} fillOpacity={0.14} stroke={color} strokeOpacity={0.6} />
            <Note x={x + bw / 2} y={y0 + 60} label={label} size={10} color={color} weight={700} />
            <Note x={x + bw / 2} y={y0 + 76} label={`${amt.toLocaleString("en-US")} ¢`} size={9.5} color={color} />
            <Note x={x + bw / 2} y={y0 - 10} label={`days past due ${["≤ 0", "1-30", "31-60", "61-90", "≥ 91"][i]}`} size={8} color={C.dim} />
          </g>
        );
      })}
      {/* invoices falling in */}
      {bins.map(([label, color], i) => {
        const x = x0 + i * (bw + gap) + bw / 2;
        return (
          <g key={`inv${label}`}>
            <rect x={x - 16} y={40} width={32} height={18} rx={3} fill="none" stroke={color} strokeOpacity={0.6} />
            <line x1={x} y1={58} x2={x} y2={y0 - 2} stroke={color} strokeOpacity={0.4} strokeDasharray="2 3" markerEnd="url(#arw-dfa-2)" />
          </g>
        );
      })}
      {/* the total */}
      <Box x={236} y={162} w={220} h={30} label="total_outstanding 250,000 ¢" color={C.zinc} fillOpacity={0.07} fs={10.5} />
      <Tag x={560} y={177} label="fully paid → excluded · overpaid (negative) → excluded" color={C.dim} />
      <Note x={430} y={202} label="CAST(julianday(as-of) − julianday(due_date)) — exact on date-only strings, the bucket edge is where audits bite" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8039 balance-rollforward — the equation                             */
/* ------------------------------------------------------------------ */

export function ArtBalanceRollforward() {
  return (
    <g>
      <Defs id="arw-dfa-3" />
      <Box x={48} y={48} w={150} h={48} label="opening_cents" color={C.sky} fillOpacity={0.1} fs={11} />
      <Note x={148} y={112} label="125,000" size={10.5} color={C.sky} weight={700} />
      <Note x={216} y={78} label="+" size={18} color={C.zinc} weight={700} />
      <Box x={238} y={48} w={140} h={48} label="debits" color={C.amber} fillOpacity={0.1} fs={11} />
      <Note x={308} y={112} label="the month's activity" size={9} color={C.amber} />
      <Note x={396} y={78} label="−" size={18} color={C.zinc} weight={700} />
      <Box x={418} y={48} w={140} h={48} label="credits" color={C.violet} fillOpacity={0.1} fs={11} />
      <Note x={488} y={112} label="(same month window)" size={9} color={C.violet} />
      <Note x={576} y={78} label="=" size={18} color={C.zinc} weight={700} />
      <Box x={598} y={44} w={170} h={56} label="closing_cents" color={C.emerald} fillOpacity={0.12} fs={12.5} />
      <Note x={683} y={116} label="what the next period opens with" size={9} color={C.emerald} />
      {/* the carry-forward trap */}
      <rect x={48} y={140} width={720} height={44} rx={8} fill={C.rose} fillOpacity={0.07} stroke={C.rose} strokeOpacity={0.4} />
      <Note x={64} y={158} label="the trap row:" size={9.5} anchor="start" color={C.rose} weight={700} />
      <Note x={160} y={158} label="an account with opening_cents but ZERO September lines must still ship —" size={9.5} anchor="start" color={C.zinc} />
      <Note x={64} y={176} label="INNER JOIN journal_lines erases it (closing = opening, totals COALESCE to 0)" size={9.5} anchor="start" color={C.rose} />
      <Note x={430} y={202} label="auditors read the rollforward first — every bridge must close to the cent" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8040 fifo-inventory-cogs — the crate stack                          */
/* ------------------------------------------------------------------ */

export function ArtFifoInventoryCogs() {
  const layers = [
    { id: "B3", cost: "310 ¢/u", left: 130, color: C.violet },
    { id: "B2", cost: "320 ¢/u", left: 110, color: C.amber },
    { id: "B1", cost: "300 ¢/u", left: 20, color: C.emerald },
  ];
  const x0 = 90, lw = 260, lh = 30, gap = 8;
  const baseY = 158;
  return (
    <g>
      <Defs id="arw-dfa-4" />
      <Note x={250} y={36} label="the crate stack — oldest batch at the BOTTOM, consumed FIRST" size={10} color={C.zinc} />
      {layers.map((l, i) => {
        const y = baseY - (i + 1) * (lh + gap) + gap;
        return (
          <g key={l.id}>
            <rect x={x0} y={y} width={lw} height={lh} rx={6} fill={l.color} fillOpacity={0.14} stroke={l.color} strokeOpacity={0.6} />
            <Note x={x0 + 14} y={y + 20} label={`${l.id} · ${l.cost}`} size={10} anchor="start" color={l.color} weight={700} />
            <Note x={x0 + lw - 14} y={y + 20} label={`${l.left} units left`} size={9.5} anchor="end" color={l.color} />
          </g>
        );
      })}
      {/* consumption arrows from the bottom layer */}
      <Arrow d={`M ${x0 - 8} ${baseY - 8} C ${x0 - 44} ${baseY - 30}, ${x0 - 44} ${baseY - 70}, ${x0 - 8} ${baseY - 96}`} color={C.rose} sw={2} marker="arw-dfa-4" />
      <Note x={x0 - 30} y={baseY + 18} label="sales eat from the bottom" size={9.5} anchor="start" color={C.rose} />
      {/* sale table */}
      <rect x={430} y={52} width={396} height={106} rx={8} fill={C.emerald} fillOpacity={0.05} stroke={C.emerald} strokeOpacity={0.35} />
      <Note x={446} y={72} label="sale" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={520} y={72} label="units" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={600} y={72} label="layers consumed" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={726} y={72} label="cogs_cents" size={9.5} anchor="start" color={C.zinc} weight={700} />
      {[["S1", "80", "80 × B1", "24,000"], ["S2", "60", "20 B1 + 40 B2", "18,800"], ["S3", "180", "110 B2 + 70 B3", "56,900"]].map((r, i) => (
        <g key={i}>
          {r.map((cell, j) => (
            <Note key={j} x={[446, 520, 600, 726][j]} y={94 + i * 20} label={cell} size={9.5} anchor="start" color={j === 3 ? C.emerald : C.zinc} weight={j === 3 ? 700 : 400} />
          ))}
        </g>
      ))}
      <Note x={430} y={202} label="a clamp per layer — MIN(cum supply − cum sold, batch units, cum sold through − cum supply before)" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8041 deferred-revenue — cash now, revenue later                     */
/* ------------------------------------------------------------------ */

export function ArtDeferredRevenue() {
  const months = ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10"];
  const recognized = [false, true, true, true, false]; // sub 1: Jun start → Jul..Sep in report window
  const bw = 118, gap = 26, x0 = 100, y0 = 88;
  return (
    <g>
      <Defs id="arw-dfa-5" />
      {/* the cash */}
      <Box x={60} y={30} w={220} h={40} label="cash collected up front — 120,000 ¢" color={C.sky} fillOpacity={0.1} fs={10.5} />
      <Note x={170} y={86} label="NOT revenue yet — a liability called deferred revenue" size={9.5} color={C.sky} />
      {/* month strip */}
      {months.map((m, i) => {
        const x = x0 + i * (bw + gap);
        const on = recognized[i];
        return (
          <g key={m}>
            <rect x={x} y={y0} width={bw} height={44} rx={8} fill={on ? C.emerald : C.dim} fillOpacity={on ? 0.12 : 0.05} stroke={on ? C.emerald : C.dim} strokeOpacity={0.5} strokeDasharray={on ? undefined : "4 3"} />
            <Note x={x + bw / 2} y={y0 + 20} label={m} size={10.5} color={on ? C.emerald : C.dim} weight={700} />
            <Note x={x + bw / 2} y={y0 + 36} label={on ? "+10,000 ¢" : "—"} size={9.5} color={on ? C.emerald : C.dim} />
            <Arrow d={`M 170 72 L ${x + bw / 2} ${y0 - 4}`} color={on ? C.emerald : C.dim} dashed={!on} marker="arw-dfa-5" sw={on ? 1.6 : 1} />
          </g>
        );
      })}
      {/* term boundary */}
      <rect x={x0 + 4 * (bw + gap)} y={y0 - 6} width={bw + 10} height={56} rx={8} fill="none" stroke={C.rose} strokeOpacity={0.5} strokeDasharray="4 3" />
      <Tag x={x0 + 4 * (bw + gap) + bw / 2 + 5} y={y0 + 66} label="term_months = 12 → Oct is month index 4, still inside" color={C.rose} />
      <Tag x={560} y={162} label="sub 3: Jan start, 6 months — July would be index 6: OUTSIDE 0..5" color={C.rose} />
      <Note x={430} y={202} label="month label = strftime('%Y-%m', date(start_date, '+' || idx || ' months')) — service months, no proration" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8042 journal-gap-detection — the number strip                       */
/* ------------------------------------------------------------------ */

export function ArtJournalGapDetection() {
  const missing = new Set([1004, 1005, 1010]);
  const nums = Array.from({ length: 12 }, (_, i) => 1001 + i);
  const bw = 54, gap = 14, x0 = 84, y0 = 84;
  return (
    <g>
      <Defs id="arw-dfa-6" />
      <Note x={430} y={40} label="journal_entries.doc_no — a sequence the system assigns and never reuses" size={10} color={C.zinc} />
      {nums.map((n, i) => {
        const x = x0 + i * (bw + gap);
        const gone = missing.has(n);
        return (
          <g key={n}>
            <rect x={x} y={y0} width={bw} height={38} rx={6}
              fill={gone ? "none" : C.blue} fillOpacity={gone ? 0 : 0.1}
              stroke={gone ? C.rose : C.blue} strokeOpacity={gone ? 0.8 : 0.5} strokeDasharray={gone ? "4 3" : undefined} />
            <text x={x + bw / 2} y={y0 + 24} textAnchor="middle" fontFamily={MONO} fontSize={10.5} fontWeight={700} fill={gone ? C.rose : C.blue} opacity={gone ? 0.7 : 1}>
              {gone ? `${n}` : `${n}`}
            </text>
            {gone && <Note x={x + bw / 2} y={y0 - 8} label="void" size={8} color={C.rose} />}
          </g>
        );
      })}
      {/* the recursive spine */}
      <rect x={84} y={148} width={700} height={40} rx={8} fill={C.fuchsia} fillOpacity={0.06} stroke={C.fuchsia} strokeOpacity={0.35} />
      <Note x={100} y={164} label="WITH RECURSIVE seq(n): anchor MIN(doc_no), step n+1 while n < MAX —" size={9.5} anchor="start" color={C.fuchsia} />
      <Note x={100} y={180} label="then NOT IN (SELECT doc_no …) → 1004, 1005, 1010" size={9.5} anchor="start" color={C.fuchsia} weight={700} />
      <Note x={430} y={210} label="a gap is proof something was deleted or voided — completeness testing, audit 101" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — the month-end close                                    */
/* ------------------------------------------------------------------ */

export function ArtStudyMonthClose() {
  return (
    <g>
      <Defs id="arw-dfa-s1" />
      {/* sub-ledgers */}
      <Box x={40} y={30} w={150} h={40} label="AR sub-ledger" color={C.sky} fillOpacity={0.1} fs={10.5} />
      <Box x={40} y={82} w={150} h={40} label="AP sub-ledger" color={C.violet} fillOpacity={0.1} fs={10.5} />
      <Box x={40} y={134} w={150} h={40} label="Inventory" color={C.amber} fillOpacity={0.1} fs={10.5} />
      <Box x={40} y={186} w={150} h={40} label="Payroll" color={C.orange} fillOpacity={0.1} fs={10.5} />
      {/* journal + GL */}
      <Box x={276} y={100} w={160} h={52} label="Journal entries" color={C.blue} fillOpacity={0.12} fs={11.5} />
      <Arrow d="M 192 50 C 240 66, 248 100, 272 114" color={C.zinc} marker="arw-dfa-s1" />
      <Arrow d="M 192 102 L 272 120" color={C.zinc} marker="arw-dfa-s1" />
      <Arrow d="M 192 154 C 240 140, 248 126, 272 126" color={C.zinc} marker="arw-dfa-s1" />
      <Arrow d="M 192 206 C 240 190, 248 152, 272 140" color={C.zinc} marker="arw-dfa-s1" />
      <Box x={500} y={100} w={150} h={52} label="General ledger" color={C.emerald} fillOpacity={0.12} fs={11.5} />
      <Arrow d="M 438 126 L 496 126" color={C.zinc} marker="arw-dfa-s1" />
      <Tag x={467} y={106} label="post" color={C.zinc} />
      {/* trial balance + statements */}
      <Box x={500} y={196} w={150} h={48} label="Trial balance" color={C.rose} fillOpacity={0.1} fs={11.5} />
      <Arrow d="M 575 154 L 575 192" color={C.zinc} marker="arw-dfa-s1" />
      <Box x={706} y={196} w={120} h={48} label="Statements" color={C.fuchsia} fillOpacity={0.12} fs={11.5} />
      <Arrow d="M 652 220 L 702 220" color={C.zinc} marker="arw-dfa-s1" />
      {/* gates */}
      <rect x={280} y={196} width={196} height={86} rx={8} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={294} y={216} label="the close's gates" size={9.5} anchor="start" color={C.zinc} weight={700} />
      <Note x={294} y={234} label="· trial-balance-check" size={9} anchor="start" color={C.rose} />
      <Note x={294} y={250} label="· balance-rollforward" size={9} anchor="start" color={C.emerald} />
      <Note x={294} y={266} label="· gl-reconciliation" size={9} anchor="start" color={C.amber} />
      <Note x={294} y={282} label="· journal-gap-detection" size={9} anchor="start" color={C.fuchsia} />
      {/* day markers */}
      <Tag x={340} y={88} label="all month — entries land daily" color={C.blue} />
      <Tag x={575} y={86} label="day 1-3: post &amp; reconcile" color={C.emerald} />
      <Tag x={700} y={176} label="day 4-5: tie out, then report" color={C.fuchsia} />
      <Note x={430} y={300} label="Accounting & Close problems each test one gate — FIFO and deferred revenue feed the inventory and revenue lines" size={10} color={C.zinc} />
    </g>
  );
}
