"use client";

// Data & Finance art — Warehouse Craft family: one real-life concept diagram per
// problem primer + the section study flow ("from raw feed to trusted reads").
// Same pastel language as the other families: palette C, mono labels, flat fills,
// no gradients/filters/shadows. Markers prefixed arw-dfw- (unique per family).

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

function Arrow({ d, color, dashed = false, marker = "arw-dfw", sw = 1.6 }: { d: string; color: string; dashed?: boolean; marker?: string; sw?: number }) {
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

/** numbered gate chip — straddles the top edge of the stage it guards */
function Gate({ x, y, n, color }: { x: number; y: number; n: number; color: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={9.5} fill="#09090b" stroke={color} strokeOpacity={0.85} strokeWidth={1.2} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontFamily={MONO} fontSize={10} fontWeight={700} fill={color}>{n}</text>
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8061 keep-latest-dedupe — the event stack collapses to one survivor */
/* ------------------------------------------------------------------ */

export function ArtKeepLatestDedupe() {
  const rows: Array<{ y: number; t: string; win?: boolean }> = [
    { y: 36, t: "e1 · placed · 09-01 10:00" },
    { y: 58, t: "e3 · paid · 09-02 11:30" },
    { y: 80, t: "e4 · shipped · 09-02 11:30", win: true },
    { y: 116, t: "e5 · placed · 09-03 09:00" },
    { y: 138, t: "e8 · cancelled · 09-04 09:30", win: true },
    { y: 164, t: "e12 · delivered · 09-05 17:25", win: true },
  ];
  const surv: Array<{ y: number; t: string }> = [
    { y: 56, t: "102 · shipped · 09-02 11:30" },
    { y: 122, t: "104 · cancelled · 09-04 09:30" },
    { y: 164, t: "106 · delivered · 09-05 17:25" },
  ];
  const brackets: Array<[number, number, string, number]> = [
    [36, 98, "102", 71], [116, 156, "104", 140], [164, 182, "106", 177],
  ];
  return (
    <g>
      <Defs id="arw-dfw-1" />
      <Note x={52} y={28} label="status_feed — every write, in arrival order" size={9.5} anchor="start" color={C.zinc} />
      <Note x={716} y={34} label="ONE ROW PER ORDER" size={9.5} weight={700} color={C.emerald} />
      {/* order brackets */}
      {brackets.map(([a, b, id, ly]) => (
        <g key={id}>
          <line x1={46} y1={a} x2={46} y2={b} stroke={C.dim} strokeWidth={1.2} />
          <Note x={40} y={ly} label={id} size={10} weight={700} anchor="end" color={C.zinc} />
        </g>
      ))}
      {/* the event stacks */}
      {rows.map((r) => (
        <g key={r.t}>
          <rect x={52} y={r.y} width={252} height={18} rx={5}
            fill={r.win ? C.emerald : C.zinc} fillOpacity={r.win ? 0.14 : 0.05}
            stroke={r.win ? C.emerald : C.dim} strokeOpacity={r.win ? 0.55 : 0.25} />
          <text x={178} y={r.y + 12.5} textAnchor="middle" fontFamily={MONO} fontSize={9}
            fontWeight={r.win ? 700 : 400} fill={r.win ? C.emerald : C.zinc}>{r.t}</text>
        </g>
      ))}
      {/* the tie pair — higher event_id wins, so e4 is circled */}
      <ellipse cx={178} cy={89} rx={132} ry={16} fill="none" stroke={C.emerald} strokeOpacity={0.8} strokeDasharray="4 3" />
      {/* survivor column */}
      {surv.map((s) => (
        <g key={s.t}>
          <rect x={596} y={s.y} width={240} height={20} rx={5} fill={C.emerald} fillOpacity={0.1} stroke={C.emerald} strokeOpacity={0.5} />
          <text x={716} y={s.y + 13.5} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={700} fill={C.emerald}>{s.t}</text>
        </g>
      ))}
      {/* winners flow right */}
      <Arrow d="M 308 89 C 430 89, 470 66, 592 66" color={C.emerald} sw={1.6} marker="arw-dfw-1" />
      <Arrow d="M 308 147 C 430 147, 470 132, 592 132" color={C.emerald} sw={1.6} marker="arw-dfw-1" />
      <Arrow d="M 308 173 C 430 173, 470 174, 592 174" color={C.emerald} sw={1.6} marker="arw-dfw-1" />
      {/* losers fade into the drop zone */}
      <path d="M 308 45 C 350 52, 376 70, 398 84" fill="none" stroke={C.zinc} strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
      <path d="M 308 67 C 350 74, 376 86, 398 96" fill="none" stroke={C.zinc} strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
      <path d="M 308 125 C 350 122, 376 112, 398 104" fill="none" stroke={C.zinc} strokeWidth={1} strokeDasharray="3 4" opacity={0.45} />
      <Tag x={470} y={90} label="older writes drop" color={C.dim} />
      <Tag x={450} y={56} label="newest write survives" color={C.emerald} />
      <Tag x={430} y={118} label="tie → higher event_id wins" color={C.emerald} />
      <path d="M 420 106 C 370 100, 330 95, 312 91" fill="none" stroke={C.emerald} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.7} markerEnd="url(#arw-dfw-1)" />
      <Note x={420} y={190} label="single-event orders pass straight through" size={8} color={C.dim} />
      <Note x={430} y={202} label="one survivor per order — the newest write wins, a timestamp tie goes to the higher event id" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8062 null-blank-audit — three defect kinds, one pass-fail gate      */
/* ------------------------------------------------------------------ */

export function ArtNullBlankAudit() {
  type CellKind = "ok" | "null" | "empty" | "ws";
  const KC: Record<CellKind, string> = { ok: C.zinc, null: C.rose, empty: C.amber, ws: C.orange };
  const rows: Array<{ y: number; id: string; email: [string, CellKind]; phone: [string, CellKind]; city: [string, CellKind]; stale?: boolean }> = [
    { y: 50, id: "1", email: ["ada@ex.io", "ok"], phone: ["555-0101", "ok"], city: ["Lisbon", "ok"] },
    { y: 71, id: "2", email: ["NULL", "null"], phone: ["555-0102", "ok"], city: ["Porto", "ok"] },
    { y: 92, id: "3", email: ["''", "empty"], phone: ["555-0103", "ok"], city: ["Madrid", "ok"] },
    { y: 113, id: "4", email: ["'···'", "ws"], phone: ["NULL", "null"], city: ["Berlin", "ok"] },
    { y: 134, id: "5", email: ["bolt@ex.io", "ok"], phone: ["'···'", "ws"], city: ["Rome", "ok"] },
    { y: 155, id: "6", email: ["iris@ex.io", "ok"], phone: ["555-0106", "ok"], city: ["Vienna", "ok"], stale: true },
  ];
  const cell = (x: number, w: number, v: [string, CellKind], y: number) => {
    if (v[1] === "ok") {
      return <text x={x + w / 2} y={y + 12} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={C.zinc}>{v[0]}</text>;
    }
    const color = KC[v[1]];
    return (
      <g>
        <rect x={x} y={y} width={w} height={17} rx={4} fill={color} fillOpacity={0.16} stroke={color} strokeOpacity={0.5} />
        <text x={x + w / 2} y={y + 12} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fontWeight={700} fill={color}>{v[0]}</text>
      </g>
    );
  };
  const tally: Array<[string, string, string]> = [
    [C.rose, "NULL — missing · 2", "88"],
    [C.amber, "'' empty string · 1", "106"],
    [C.orange, "'···' whitespace · 2", "124"],
    [C.violet, "stale — not fresh · 1", "142"],
  ];
  return (
    <g>
      <Defs id="arw-dfw-2" />
      {/* table strip */}
      <Note x={64} y={42} label="id" size={8} color={C.dim} />
      <Note x={106} y={42} label="email" size={8} anchor="start" color={C.dim} />
      <Note x={242} y={42} label="phone" size={8} anchor="start" color={C.dim} />
      <Note x={348} y={42} label="city" size={8} anchor="start" color={C.dim} />
      {rows.map((r) => (
        <g key={r.id}>
          {r.stale && <rect x={48} y={r.y - 2} width={412} height={21} rx={4} fill="none" stroke={C.violet} strokeOpacity={0.6} strokeDasharray="4 3" />}
          <text x={64} y={r.y + 12} textAnchor="middle" fontFamily={MONO} fontSize={9} fill={C.zinc}>{r.id}</text>
          {cell(106, 130, r.email, r.y)}
          {cell(242, 100, r.phone, r.y)}
          {cell(348, 108, r.city, r.y)}
          {r.stale && <rect x={50} y={r.y + 2} width={3} height={13} fill={C.violet} />}
        </g>
      ))}
      <Note x={254} y={186} label="the clean-looking row is stale — updated_at 2026-08-15" size={8} color={C.violet} />
      {/* the sweep tally */}
      <rect x={506} y={48} width={160} height={136} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={516} y={66} label="THE SWEEP COUNTS" size={9} weight={700} anchor="start" color={C.zinc} />
      {tally.map(([color, label, y]) => (
        <g key={label}>
          <rect x={516} y={Number(y) - 9} width={10} height={10} fill={color} />
          <Note x={534} y={Number(y)} label={label} size={9} anchor="start" color={color} />
        </g>
      ))}
      <Note x={516} y={162} label="blank = empty + whitespace" size={8.5} weight={700} anchor="start" color={C.amber} />
      <Note x={516} y={176} label="NULL is NOT blank" size={8.5} weight={700} anchor="start" color={C.rose} />
      {/* the gate */}
      <Arrow d="M 668 104 L 700 104" color={C.amber} marker="arw-dfw-2" />
      <Box x={706} y={84} w={122} h={40} label="DQ GATE" color={C.amber} fillOpacity={0.09} fs={11} />
      <Tag x={767} y={146} label="FAIL" color={C.rose} />
      <Note x={767} y={170} label="passes only at zero defects" size={8} color={C.zinc} />
      <Note x={430} y={202} label="three defect kinds, three separate counters — NULL is missing, not empty; the gate passes only at zero" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8063 point-in-time-asof — SCD2 windows under the as-of line         */
/* ------------------------------------------------------------------ */

export function ArtPointInTimeAsOf() {
  const xm = (m: number) => 90 + m * 66; // months since 2026-01-01
  const asof = xm(6.5); // 2026-07-15
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT"];
  type Ver = { f: number; t: number; city: string; k: "sel" | "warn" };
  const rows: Array<{ id: string; y: number; vs: Ver[] }> = [
    { id: "201", y: 58, vs: [{ f: 2, t: 10, city: "Porto", k: "sel" }] },
    { id: "202", y: 88, vs: [{ f: 0, t: 8, city: "Madrid", k: "sel" }, { f: 8, t: 10, city: "Barcelona", k: "warn" }] },
    { id: "203", y: 118, vs: [{ f: 6.5, t: 10, city: "Berlin", k: "sel" }] },
    { id: "204", y: 148, vs: [{ f: 0, t: 6.5, city: "Munich", k: "warn" }, { f: 6.5, t: 10, city: "Stuttgart", k: "sel" }] },
  ];
  return (
    <g>
      <Defs id="arw-dfw-3" />
      {/* month axis */}
      <line x1={84} y1={48} x2={760} y2={48} stroke={C.dim} strokeWidth={1.2} />
      {months.map((m, i) => (
        <g key={m}>
          <line x1={xm(i)} y1={44} x2={xm(i)} y2={48} stroke={C.dim} strokeWidth={1} />
          <Note x={xm(i)} y={38} label={m} size={7.5} color={C.dim} />
        </g>
      ))}
      {/* the as-of line */}
      <line x1={asof} y1={42} x2={asof} y2={170} stroke={C.rose} strokeWidth={1.5} strokeDasharray="5 4" />
      <Tag x={asof} y={18} label="AS-OF 2026-07-15" color={C.rose} />
      <Tag x={700} y={18} label="current ≠ as-of city" color={C.violet} />
      {/* validity windows — half-open [from, to) */}
      {rows.map((r) => (
        <g key={r.id}>
          <Note x={66} y={r.y + 12.5} label={r.id} size={10} weight={700} anchor="end" color={C.zinc} />
          {r.vs.map((v) => {
            const x = xm(v.f) + 2, w = xm(v.t) - xm(v.f) - 4;
            const sel = v.k === "sel";
            const color = sel ? C.emerald : C.rose;
            return (
              <g key={v.city}>
                <rect x={x} y={r.y} width={w} height={16} rx={3}
                  fill={color} fillOpacity={sel ? 0.16 : 0.07}
                  stroke={color} strokeOpacity={sel ? 0.7 : 0.6} strokeDasharray={sel ? undefined : "4 3"} />
                <text x={x + w / 2} y={r.y + 12} textAnchor="middle" fontFamily={MONO} fontSize={9} fontWeight={700} fill={color}>{v.city}</text>
                {/* [ opens the window */}
                <text x={x + 3} y={r.y + 13} fontFamily={MONO} fontSize={13} fontWeight={700} fill={color}>[</text>
                {/* ) hands off to the next version — 9999 on the current one */}
                <text x={x + w - 9} y={r.y + 13} fontFamily={MONO} fontSize={13} fontWeight={700} fill={color}>)</text>
                {v.t === 10 && <Note x={754} y={r.y + 12} label="9999-12-31" size={7} anchor="start" color={C.dim} />}
              </g>
            );
          })}
        </g>
      ))}
      {/* edge markers on the boundary */}
      <Note x={asof} y={114} label="✓" size={11} weight={700} color={C.emerald} />
      <Note x={asof} y={146} label="×" size={11} weight={700} color={C.rose} />
      {/* the half-open rule */}
      <Tag x={170} y={180} label="starts at as-of → counts (inclusive)" color={C.emerald} />
      <Tag x={460} y={180} label="ends at as-of → old row out (exclusive)" color={C.rose} />
      <Note x={430} y={202} label="half-open [from, to): the start day is in, the end day is out — exactly one version matches any as-of" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8064 scd2-build — LAG dedupe, then LEAD windows, then the sentinel  */
/* ------------------------------------------------------------------ */

export function ArtScd2Build() {
  const raw: Array<{ y: number; t: string; dead?: boolean }> = [
    { y: 70, t: "c1 · NYC · 02-01" },
    { y: 92, t: "c1 · NYC · 04-15", dead: true },
    { y: 114, t: "c2 · AUS · 01-10" },
    { y: 136, t: "c2 · DAL · 02-05" },
    { y: 158, t: "c2 · AUS · 03-01" },
  ];
  const lag: Array<{ y: number; t: string }> = [
    { y: 70, t: "c1 · NYC · 02-01" },
    { y: 114, t: "c2 · AUS · 01-10" },
    { y: 136, t: "c2 · DAL · 02-05" },
    { y: 158, t: "c2 · AUS · 03-01" },
  ];
  const scd: Array<{ y: number; t: string; cur?: boolean }> = [
    { y: 70, t: "c1 · NYC · 02-01 → 9999-12-31", cur: true },
    { y: 98, t: "c2 · AUS · 01-10 → 02-05" },
    { y: 126, t: "c2 · DAL · 02-05 → 03-01" },
    { y: 154, t: "c2 · AUS · 03-01 → 9999-12-31", cur: true },
  ];
  return (
    <g>
      <Defs id="arw-dfw-4" />
      {/* stage containers */}
      <rect x={40} y={44} width={216} height={134} rx={8} fill={C.zinc} fillOpacity={0.04} stroke={C.dim} strokeOpacity={0.4} />
      <rect x={296} y={44} width={192} height={134} rx={8} fill={C.zinc} fillOpacity={0.04} stroke={C.dim} strokeOpacity={0.4} />
      <rect x={536} y={44} width={288} height={134} rx={8} fill={C.zinc} fillOpacity={0.04} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={148} y={62} label="RAW CHANGE FEED" size={9} weight={700} color={C.zinc} />
      <Note x={392} y={62} label="LAG DEDUPE" size={9} weight={700} color={C.zinc} />
      <Note x={680} y={62} label="LEAD → VALIDITY WINDOWS" size={9} weight={700} color={C.zinc} />
      <Tag x={392} y={26} label="A→B→A bounce survives" color={C.violet} />
      {/* raw rows — the no-op re-affirmation is struck */}
      {raw.map((r) => (
        <g key={r.t}>
          <rect x={52} y={r.y} width={192} height={16} rx={4}
            fill={r.dead ? C.rose : C.zinc} fillOpacity={r.dead ? 0.08 : 0.05}
            stroke={r.dead ? C.rose : C.dim} strokeOpacity={r.dead ? 0.5 : 0.25} strokeDasharray={r.dead ? "3 3" : undefined} />
          <text x={148} y={r.y + 11.5} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={r.dead ? C.rose : C.zinc}>{r.t}</text>
          {r.dead && <line x1={60} y1={r.y + 8} x2={236} y2={r.y + 8} stroke={C.rose} strokeWidth={1} strokeOpacity={0.8} />}
          {r.dead && <Note x={250} y={r.y + 11.5} label="no-op" size={7} anchor="end" color={C.rose} />}
        </g>
      ))}
      {/* raw → lag: survivors pass, the no-op dies at the wall */}
      <Arrow d="M 262 78 L 302 78" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <Arrow d="M 262 122 L 302 122" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <Arrow d="M 262 144 L 302 144" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <Arrow d="M 262 166 L 302 166" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <path d="M 262 100 L 288 100" fill="none" stroke={C.rose} strokeWidth={1.2} strokeDasharray="3 3" opacity={0.8} />
      <Note x={300} y={104} label="×" size={11} weight={700} color={C.rose} />
      {/* lag rows */}
      {lag.map((r) => (
        <g key={r.t}>
          <rect x={308} y={r.y} width={168} height={16} rx={4} fill={C.zinc} fillOpacity={0.05} stroke={C.dim} strokeOpacity={0.3} />
          <text x={392} y={r.y + 11.5} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={C.zinc}>{r.t}</text>
        </g>
      ))}
      <Note x={392} y={101} label="prev city = same → drop" size={8} color={C.rose} />
      {/* lag → lead windows */}
      <Arrow d="M 492 78 C 520 78, 518 79, 544 79" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <Arrow d="M 492 122 C 518 122, 520 107, 544 107" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <Arrow d="M 492 144 C 518 144, 520 135, 544 135" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      <Arrow d="M 492 166 C 518 166, 520 163, 544 163" color={C.zinc} sw={1.3} marker="arw-dfw-4" />
      {/* SCD2 rows — sentinel rows highlighted */}
      {scd.map((r) => (
        <g key={r.t}>
          <rect x={548} y={r.y} width={264} height={18} rx={4}
            fill={r.cur ? C.emerald : C.violet} fillOpacity={r.cur ? 0.13 : 0.07}
            stroke={r.cur ? C.emerald : C.violet} strokeOpacity={r.cur ? 0.6 : 0.4} />
          <text x={680} y={r.y + 12.5} textAnchor="middle" fontFamily={MONO} fontSize={8.5}
            fontWeight={r.cur ? 700 : 400} fill={r.cur ? C.emerald : C.violet}>{r.t}</text>
        </g>
      ))}
      <Tag x={770} y={190} label="still current ★" color={C.emerald} />
      <Note x={430} y={202} label="first change opens the version, the next closes it — no-ops never become versions, the last row keeps 9999-12-31" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8065 late-arriving-restatement — late events arc back to their day  */
/* ------------------------------------------------------------------ */

export function ArtLateArrivingRestatement() {
  const days = ["09-08", "09-09", "09-10", "09-11", "09-12", "09-14", "09-15", "09-16", "09-17", "09-18"];
  const deltas = ["Δ0", "Δ+1", "Δ+3", "Δ+1", "Δ0", "Δ+1", "Δ0", "Δ+1", "Δ0", "Δ0"];
  const cx = (i: number) => 96 + i * 58 + 26;
  const arcs = [
    "M 238 124 C 238 100, 180 100, 180 78",
    "M 296 124 C 296 96, 238 96, 230 78",
    "M 346 124 C 346 90, 238 90, 238 78",
    "M 586 124 C 586 84, 238 84, 246 78",
    "M 362 124 C 362 102, 296 102, 296 78",
    "M 470 124 C 470 100, 412 100, 412 78",
    "M 594 124 C 594 100, 528 100, 528 78",
  ];
  return (
    <g>
      <Defs id="arw-dfw-5" />
      <Note x={96} y={34} label="EVENT_DATE — the day it happened" size={8.5} weight={700} anchor="start" color={C.violet} />
      <Note x={96} y={162} label="PROCESSED_DATE — the day it landed" size={8.5} weight={700} anchor="start" color={C.sky} />
      {/* day chips + delta flags */}
      {days.map((d, i) => (
        <g key={d}>
          <Note x={cx(i)} y={48} label={deltas[i]} size={8.5} weight={700} color={deltas[i] === "Δ0" ? C.dim : C.rose} />
          <rect x={96 + i * 58} y={56} width={52} height={22} rx={5} fill={C.violet} fillOpacity={0.1} stroke={C.violet} strokeOpacity={0.45} />
          <text x={cx(i)} y={70.5} textAnchor="middle" fontFamily={MONO} fontSize={7.5} fill={C.zinc}>{d}</text>
          <rect x={96 + i * 58} y={124} width={52} height={22} rx={5} fill={C.sky} fillOpacity={0.1} stroke={C.sky} strokeOpacity={0.45} />
          <text x={cx(i)} y={138.5} textAnchor="middle" fontFamily={MONO} fontSize={7.5} fill={C.zinc}>{d}</text>
        </g>
      ))}
      {/* on-time arrivals */}
      <Arrow d="M 122 124 L 122 82" color={C.emerald} sw={1.4} marker="arw-dfw-5" />
      <Arrow d="M 644 124 L 644 82" color={C.emerald} sw={1.4} marker="arw-dfw-5" />
      <Note x={114} y={104} label="on-time" size={8} anchor="end" color={C.emerald} />
      {/* late events arc back up to their true day */}
      {arcs.map((d) => <path key={d} d={d} fill="none" stroke={C.rose} strokeWidth={1.4} opacity={0.85} markerEnd="url(#arw-dfw-5)" />)}
      <Note x={413} y={80} label="backfill ×3" size={8.5} weight={700} color={C.rose} />
      {/* the read */}
      <rect x={700} y={52} width={146} height={98} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={710} y={70} label="PER EVENT_DATE" size={9} weight={700} anchor="start" color={C.zinc} />
      <Note x={710} y={90} label="true — dated that day" size={8} anchor="start" color={C.zinc} />
      <Note x={710} y={106} label="counted — landed same day" size={8} anchor="start" color={C.zinc} />
      <Note x={710} y={124} label="Δ = true − counted" size={8.5} weight={700} anchor="start" color={C.rose} />
      <Note x={710} y={140} label="Δ > 0 → day restated" size={8.5} weight={700} anchor="start" color={C.rose} />
      <Tag x={260} y={178} label="5 days flag Δ > 0 → restated" color={C.rose} />
      <Tag x={470} y={178} label="Δ0 days stay untouched" color={C.dim} />
      <Note x={430} y={202} label="late arrivals do not silently rewrite the past — each late event reopens its true day" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* 8066 snapshot-delta-detect — yesterday ⊕ today, four buckets        */
/* ------------------------------------------------------------------ */

export function ArtSnapshotDeltaDetect() {
  type K = "chg" | "rem" | "same" | "ins";
  const kColor: Record<K, string> = { chg: C.amber, rem: C.rose, same: C.emerald, ins: C.sky };
  const yest: Array<{ y: number; t: string; k: K }> = [
    { y: 44, t: "A-101 · 50,000", k: "chg" },
    { y: 63, t: "A-102 · 320,000", k: "chg" },
    { y: 82, t: "A-103 · 15,000", k: "rem" },
    { y: 101, t: "A-104 · 120,000", k: "chg" },
    { y: 120, t: "A-105 · 725,000", k: "same" },
    { y: 139, t: "A-106 · −45,000", k: "same" },
  ];
  const today: Array<{ y: number; t: string; k: K }> = [
    { y: 44, t: "A-101 · 61,250", k: "chg" },
    { y: 63, t: "A-102 · 297,500", k: "chg" },
    { y: 101, t: "A-104 · −8,500", k: "chg" },
    { y: 120, t: "A-105 · 725,000", k: "same" },
    { y: 139, t: "A-106 · −45,000", k: "same" },
    { y: 158, t: "A-109 · 27,300", k: "ins" },
    { y: 177, t: "A-110 · 98,000", k: "ins" },
  ];
  const col = (x: number, list: Array<{ y: number; t: string; k: K }>, hole?: number) => (
    <g key={x}>
      {list.map((r) => (
        <g key={r.t}>
          <rect x={x} y={r.y} width={200} height={16} rx={4} fill={kColor[r.k]} fillOpacity={0.09} stroke={kColor[r.k]} strokeOpacity={0.4} />
          <text x={x + 100} y={r.y + 11.5} textAnchor="middle" fontFamily={MONO} fontSize={8.5} fill={C.zinc}>{r.t}</text>
        </g>
      ))}
      {/* a removed key leaves a hole in today's column */}
      {hole !== undefined && <rect x={x} y={hole} width={200} height={16} rx={4} fill="none" stroke={C.dim} strokeOpacity={0.3} strokeDasharray="3 4" />}
    </g>
  );
  return (
    <g>
      <Defs id="arw-dfw-6" />
      <Note x={184} y={32} label="SNAP_YESTERDAY" size={9.5} weight={700} color={C.zinc} />
      <Note x={676} y={32} label="SNAP_TODAY" size={9.5} weight={700} color={C.zinc} />
      {col(84, yest)}
      {col(576, today, 82)}
      {/* the join, both directions */}
      <Arrow d="M 288 52 L 572 52" color={C.amber} marker="arw-dfw-6" />
      <Arrow d="M 288 71 L 572 71" color={C.amber} marker="arw-dfw-6" />
      <Arrow d="M 288 109 L 572 109" color={C.amber} marker="arw-dfw-6" />
      <Arrow d="M 288 128 L 572 128" color={C.emerald} marker="arw-dfw-6" />
      <Arrow d="M 288 147 L 572 147" color={C.emerald} marker="arw-dfw-6" />
      <Arrow d="M 288 90 L 349 90" color={C.rose} marker="arw-dfw-6" />
      <Arrow d="M 479 164 L 572 166" color={C.sky} marker="arw-dfw-6" />
      <Arrow d="M 479 172 C 510 172, 540 185, 572 185" color={C.sky} marker="arw-dfw-6" />
      {/* the four buckets */}
      <Tag x={430} y={32} label="changed · 3" color={C.amber} />
      <Tag x={415} y={90} label="removed · 1" color={C.rose} />
      <Tag x={430} y={128} label="unchanged · 2" color={C.emerald} />
      <Tag x={415} y={168} label="inserted · 2" color={C.sky} />
      <Note x={826} y={112} label="sign flip" size={7.5} anchor="end" color={C.amber} />
      <Note x={430} y={202} label="match keys from both sides — every account lands in exactly one bucket: unchanged · changed · inserted · removed" size={10} color={C.zinc} />
    </g>
  );
}

/* ------------------------------------------------------------------ */
/* study flow — from raw feed to trusted reads                         */
/* ------------------------------------------------------------------ */

export function ArtStudyIngestToTrust() {
  return (
    <g>
      <Defs id="arw-dfw-s1" />
      <Note x={430} y={24} label="gate chips follow the section's solving path 1 → 6" size={8.5} color={C.zinc} />
      {/* stage labels */}
      <Tag x={100} y={48} label="land raw · append-only" color={C.zinc} />
      <Tag x={268} y={48} label="keep-latest · 8061" color={C.violet} />
      <Tag x={436} y={48} label="null-blank audit · 8062" color={C.amber} />
      <Tag x={604} y={48} label="scd2-build · 8064" color={C.fuchsia} />
      <Tag x={768} y={48} label="as-of reads · 8063" color={C.emerald} />
      {/* the main pipe */}
      <Box x={36} y={70} w={128} h={52} label="RAW FEED" color={C.sky} fillOpacity={0.12} fs={12} />
      <Box x={204} y={70} w={128} h={52} label="DEDUPE" color={C.violet} fillOpacity={0.12} fs={12} />
      <Box x={372} y={70} w={128} h={52} label="DQ SWEEP" color={C.amber} fillOpacity={0.12} fs={12} />
      <Box x={540} y={70} w={128} h={52} label="SCD2 BUILD" color={C.fuchsia} fillOpacity={0.12} fs={12} />
      <Box x={708} y={70} w={120} h={52} label="AS-OF READS" color={C.emerald} fillOpacity={0.12} fs={11.5} />
      <Arrow d="M 168 96 L 200 96" color={C.zinc} marker="arw-dfw-s1" />
      <Arrow d="M 336 96 L 368 96" color={C.zinc} marker="arw-dfw-s1" />
      <Arrow d="M 504 96 L 536 96" color={C.zinc} marker="arw-dfw-s1" />
      <Arrow d="M 672 96 L 704 96" color={C.zinc} marker="arw-dfw-s1" />
      <Gate x={222} y={70} n={1} color={C.violet} />
      <Gate x={390} y={70} n={2} color={C.amber} />
      <Gate x={558} y={70} n={6} color={C.fuchsia} />
      <Gate x={726} y={70} n={4} color={C.emerald} />
      {/* pipe sub-notes */}
      <Note x={110} y={138} label="lands in arrival order" size={8.5} anchor="start" color={C.dim} />
      <Note x={268} y={138} label="one row per order" size={8.5} color={C.dim} />
      <Note x={436} y={138} label="NULL · blank · stale" size={8.5} color={C.dim} />
      <Note x={604} y={138} label="validity windows [from, to)" size={8.5} color={C.dim} />
      <Note x={768} y={138} label="rebuild any past day" size={8.5} color={C.dim} />
      {/* restatement station — the late-arriving loop */}
      <Box x={36} y={200} w={140} h={44} label="RESTATEMENT" color={C.rose} fillOpacity={0.1} fs={10.5} />
      <Gate x={52} y={200} n={5} color={C.rose} />
      <Arrow d="M 76 124 L 76 196" color={C.rose} sw={1.8} marker="arw-dfw-s1" />
      <Note x={84} y={162} label="late arrivals" size={8.5} anchor="start" color={C.rose} />
      <Arrow d="M 180 216 C 250 218, 320 170, 368 116" color={C.rose} dashed marker="arw-dfw-s1" />
      <Note x={272} y={238} label="corrected days re-enter the clean core" size={8} color={C.rose} />
      <Tag x={106} y={258} label="late events → rewrite the day" color={C.rose} />
      {/* snapshot delta station */}
      <Box x={372} y={200} w={128} h={44} label="SNAPSHOT DELTA" color={C.orange} fillOpacity={0.1} fs={10} />
      <Gate x={388} y={200} n={3} color={C.orange} />
      <Arrow d="M 380 124 L 380 196" color={C.orange} dashed marker="arw-dfw-s1" />
      <Note x={388} y={164} label="daily snapshots" size={8} anchor="start" color={C.orange} />
      <Arrow d="M 502 212 C 560 200, 596 168, 604 126" color={C.orange} dashed marker="arw-dfw-s1" />
      <Note x={556} y={196} label="changed rows" size={8} color={C.orange} />
      <Tag x={436} y={258} label="yesterday vs today → 4 buckets" color={C.orange} />
      {/* who trusts this pipe */}
      <rect x={676} y={192} width={152} height={88} rx={8} fill={C.zinc} fillOpacity={0.06} stroke={C.dim} strokeOpacity={0.4} />
      <Note x={690} y={212} label="who trusts this pipe" size={9.5} weight={700} anchor="start" color={C.zinc} />
      <Note x={690} y={230} label="· dashboards: as-of reads" size={8.5} anchor="start" color={C.emerald} />
      <Note x={690} y={246} label="· dq owner: the sweep" size={8.5} anchor="start" color={C.amber} />
      <Note x={690} y={262} label="· finance: restated days" size={8.5} anchor="start" color={C.rose} />
      <Note x={430} y={292} label="raw lands, dedupe picks one, DQ blocks, deltas explain, SCD2 remembers — as-of reads replay any day" size={10} color={C.zinc} />
    </g>
  );
}
