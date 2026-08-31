"use client";

// Lesson 6 figures — DISTINCT: dedupe machine, multi-column uniqueness.

import { Arrow, C, Chip, Figure, H, Label, Panel, Tbl } from "./kit";

/* ---------------- 6.1 deduplicator ---------------- */

export function L6Dedupe() {
  const cells = [
    { t: "Berlin", dup: true },
    { t: "Dublin", dup: true },
    { t: "Berlin", dup: false },
    { t: "London", dup: true },
    { t: "Berlin", dup: false },
    { t: "Mumbai", dup: true },
    { t: "London", dup: false },
    { t: "Dublin", dup: false },
    { t: "London", dup: false },
  ];
  const uniq = ["Berlin", "Dublin", "London", "Mumbai"];
  return (
    <Figure
      title="DISTINCT collapses duplicates — one output row per unique value"
      h={316}
      footnote="SELECT DISTINCT country FROM customers: 40 rows become 4 — but only because we show the raw spellings. 'New York', 'new york' and 'NYC' are three different values to DISTINCT; deduplication is exact, not fuzzy."
    >
      <H x={22} y={30} text="country — 40 values" />
      {cells.map((c, i) => {
        const first = i === 0 || cells.slice(0, i).every((p) => p.t !== c.t);
        return (
          <g key={i}>
            <rect
              x={22 + (i % 5) * 88}
              y={42 + Math.floor(i / 5) * 30}
              width={76}
              height={24}
              rx={6}
              fill={c.dup ? (first ? C.emeraldBg : C.panelSoft) : C.panelSoft}
              stroke={first ? C.emerald : C.lineSoft}
              strokeDasharray={first ? undefined : "3 3"}
              opacity={first ? 1 : 0.55}
            />
            <Label
              x={60 + (i % 5) * 88}
              y={58 + Math.floor(i / 5) * 30}
              text={c.t}
              size={10}
              fill={first ? C.emerald : C.zinc6}
              anchor="middle"
              mono
            />
          </g>
        );
      })}
      <Label x={22} y={142} text="solid = first sighting kept · dashed = duplicate dropped" size={10} fill={C.zinc5} />
      <Arrow x1={216} y1={172} x2={300} y2={172} color={C.emerald} label="DISTINCT" />
      <g>
        {uniq.map((t, i) => (
          <g key={t}>
            <rect x={306} y={158 + i * 30} width={120} height={26} rx={7} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.5} />
            <Label x={366} y={175 + i * 30} text={t} size={11} fill={C.emerald} anchor="middle" mono />
          </g>
        ))}
        <Chip x={438} y={166} text="40 rows → 4" tone="pass" size={10.5} />
      </g>
      <Panel x={560} y={120} w={178} h={128} title="counts match" tone="calc">
        <Label x={576} y={150} text="DISTINCT city → 9" size={10} fill={C.zinc3} mono />
        <Label x={576} y={170} text="DISTINCT country → 4" size={10} fill={C.zinc3} mono />
        <Label x={576} y={190} text="…on CLEAN data. Ours has" size={10} fill={C.amber} />
        <Label x={576} y={206} text="26 'countries' — the mess" size={10} fill={C.amber} />
        <Label x={576} y={222} text="inflates every distinct count." size={10} fill={C.amber} />
      </Panel>
      <Chip x={306} y={288} text="DISTINCT applies to the WHOLE selected row, not one column" tone="key" size={10} />
    </Figure>
  );
}

/* ---------------- 6.2 multi-column uniqueness ---------------- */

export function L6Multi() {
  return (
    <Figure
      title="DISTINCT on two columns — uniqueness of the pair"
      h={296}
      footnote="With (city, loyalty_tier), a row is a duplicate only when BOTH values repeat. 'Berlin · gold' twice = duplicate; 'Berlin · gold' and 'Berlin · silver' = two different pairs, even though Berlin appears twice."
    >
      <Tbl
        x={22}
        y={40}
        w={230}
        title="customers (sample)"
        headers={["city", "loyalty_tier"]}
        colW={[110, 120]}
        rows={[
          ["Berlin", "gold"],
          ["Berlin", "silver"],
          ["Berlin", "gold"],
          ["London", "gold"],
          ["London", "gold"],
          ["Mumbai", "bronze"],
        ]}
        hlRows={[0, 2]}
        size={10.5}
      />
      <Arrow x1={256} y1={116} x2={330} y2={116} color={C.violet} label="DISTINCT" />
      <Tbl
        x={336}
        y={40}
        w={230}
        titleTone="pick"
        title="result — unique pairs"
        headers={["city", "loyalty_tier"]}
        colW={[110, 120]}
        rows={[
          ["Berlin", "gold"],
          ["Berlin", "silver"],
          ["London", "gold"],
          ["Mumbai", "bronze"],
        ]}
        size={10.5}
      />
      <Panel x={588} y={40} w={150} h={158} title="read the count" tone="pick">
        <Label x={602} y={72} text="6 rows in," size={10.5} fill={C.zinc4} />
        <Label x={602} y={90} text="4 pairs out" size={10.5} fill={C.violet} bold />
        <Label x={602} y={118} text="rows 1 & 3 were" size={10} fill={C.zinc5} />
        <Label x={602} y={134} text="identical → merged." size={10} fill={C.zinc5} />
        <Label x={602} y={162} text="Berlin still appears" size={10} fill={C.zinc5} />
        <Label x={602} y={178} text="twice — pairs differ." size={10} fill={C.zinc5} />
      </Panel>
      <Label x={22} y={250} text="DISTINCT city          → 3   (Berlin, London, Mumbai)" size={11} fill={C.zinc3} mono />
      <Label x={22} y={272} text="DISTINCT city, loyalty_tier → 4   (the gold/silver split adds one)" size={11} fill={C.zinc3} mono />
      <Label x={22} y={291} text="more columns → usually MORE distinct rows, never fewer" size={10.5} fill={C.amber} />
    </Figure>
  );
}
