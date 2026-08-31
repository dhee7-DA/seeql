"use client";

// Lesson 5 figures — ORDER BY: sort machine, directions, LIMIT/OFFSET.

import {
  Arrow,
  C,
  Chip,
  Fade,
  Figure,
  H,
  Label,
  Panel,
  Reveal,
  StepBar,
  Tbl,
  useSteps,
} from "./kit";

/* ---------------- 5.1 multi-key sort ---------------- */

export function L5Sort() {
  return (
    <Figure
      title="ORDER BY with two keys — sort by country, then break ties by total"
      h={320}
      footnote="Keys apply left to right: rows are grouped by the first key; the second key only orders rows that tie on the first. Add a final tiebreaker (id) when you need a fully reproducible order."
    >
      <Tbl
        x={22}
        y={44}
        w={220}
        title="orders — unsorted"
        headers={["country", "total", "id"]}
        colW={[86, 70, 64]}
        rows={[
          ["UK", "84.50", "1003"],
          ["DE", "120.00", "1001"],
          ["US", "84.50", "1002"],
          ["DE", "61.00", "1004"],
          ["US", "299.00", "1005"],
        ]}
        size={10.5}
      />
      {/* machine */}
      <g>
        <rect x={286} y={78} width={168} height={108} rx={12} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.55} />
        <Label x={370} y={104} text="ORDER BY" size={11.5} fill={C.violet} anchor="middle" bold mono />
        <Label x={370} y={126} text="country ASC," size={10.5} fill={C.zinc2} anchor="middle" mono />
        <Label x={370} y={142} text="total DESC" size={10.5} fill={C.zinc2} anchor="middle" mono />
        <Label x={370} y={166} text="primary → tiebreak" size={9} fill={C.zinc5} anchor="middle" />
      </g>
      <Arrow x1={246} y1={130} x2={282} y2={130} color={C.zinc5} />
      <Arrow x1={458} y1={130} x2={494} y2={130} color={C.violet} />
      <Tbl
        x={500}
        y={44}
        w={238}
        title="result — deterministic"
        titleTone="pick"
        headers={["country", "total", "id"]}
        colW={[92, 76, 70]}
        rows={[
          ["DE", "120.00", "1001"],
          ["DE", "61.00", "1004"],
          ["UK", "84.50", "1003"],
          ["US", "299.00", "1005"],
          ["US", "84.50", "1002"],
        ]}
        hlRows={[0, 1]}
        size={10.5}
      />
      <Label x={614} y={196} text="↑ ties broken inside each country" size={9.5} fill={C.zinc5} anchor="middle" />
      <Label x={22} y={242} text="why bother? without ORDER BY, row order is whatever the engine feels like —" size={10.5} fill={C.zinc4} />
      <Label x={22} y={259} text="different runs, different tools, different order. Top-N reports need ORDER BY + LIMIT." size={10.5} fill={C.zinc4} />
      <Chip x={22} y={278} text="sort is logical, not physical — the table itself is never rearranged" tone="pick" size={10} />
    </Figure>
  );
}

/* ---------------- 5.2 ASC / DESC + NULL placement ---------------- */

export function L5Direction() {
  return (
    <Figure
      title="ASC and DESC — and where NULLs land"
      h={300}
      footnote="ASC is the default (you may write it, rarely do). SQLite sorts NULLs first in ASC and last in DESC — NULLs gather at one end either way. When the extremes matter, check which end the NULLs are on."
    >
      <Panel x={22} y={30} w={340} h={116} title="ASC — smallest first (default)" tone="calc">
        {["12", "19.99", "84.5", "299"].map((t, i) => (
          <g key={t}>
            <rect x={54 + i * 74} y={66} width={58} height={30} rx={8} fill={C.skyBg} stroke={C.sky} strokeOpacity={0.4} />
            <Label x={83 + i * 74} y={85} text={t} size={11} fill={C.sky} anchor="middle" mono />
          </g>
        ))}
        <Arrow x1={54} y1={118} x2={356} y2={118} color={C.sky} label="ORDER BY price" />
      </Panel>
      <Panel x={398} y={30} w={340} h={116} title="DESC — biggest first" tone="pick">
        {["299", "84.5", "19.99", "12"].map((t, i) => (
          <g key={t}>
            <rect x={430 + i * 74} y={66} width={58} height={30} rx={8} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.4} />
            <Label x={459 + i * 74} y={85} text={t} size={11} fill={C.violet} anchor="middle" mono />
          </g>
        ))}
        <Arrow x1={430} y1={118} x2={732} y2={118} color={C.violet} label="ORDER BY price DESC" />
      </Panel>
      <Panel x={22} y={160} w={716} h={104} title="the NULL end-station" tone="null">
        <Label x={42} y={192} text="ASC:  NULL · 12 · 19.99 · 84.5 · 299      (NULL first)" size={11} fill={C.amber} mono />
        <Label x={42} y={214} text="DESC: 299 · 84.5 · 19.99 · 12 · NULL      (NULL last)" size={11} fill={C.amber} mono />
        <Label x={42} y={240} text="a 'cheapest 5' report in ASC quietly leads with empty prices — always eyeball the top rows" size={10} fill={C.zinc5} />
      </Panel>
      <Chip x={22} y={280} text="dates sort as text safely only in ISO form YYYY-MM-DD" tone="key" size={10} />
    </Figure>
  );
}

/* ---------------- 5.3 LIMIT / OFFSET window (stepper) ---------------- */

export function L5Limit() {
  const s = useSteps(3);
  const rows = [
    "299.00",
    "245.50",
    "198.00",
    "150.25",
    "120.00",
    "84.50",
    "82.50",
    "61.00",
    "31.20",
    "12.00",
  ];
  return (
    <Figure
      title="LIMIT and OFFSET — a sliding window over the sorted rows"
      h={312}
      footer={
        <StepBar
          {...s}
          captions={[
            "after ORDER BY total_amount DESC the rows have a definite order",
            "LIMIT 3 keeps only the top 3 — the top-N pattern",
            "OFFSET 2 skips the first 2, then keeps 3 → rows 3–5: the 'page 2' pattern",
          ]}
          accent={C.sky}
        />
      }
    >
      <H x={22} y={30} text="ORDER BY total_amount DESC" />
      {rows.map((t, i) => {
        const inLimit = s.step === 1 && i < 3;
        const inOffset = s.step === 2 && i >= 2 && i < 5;
        const skipped = s.step === 2 && i < 2;
        const on = inLimit || inOffset;
        return (
          <g key={i}>
            <rect
              x={22}
              y={42 + i * 26}
              width={150}
              height={22}
              rx={6}
              fill={on ? C.skyBg : skipped ? "transparent" : C.panelSoft}
              stroke={on ? C.sky : C.lineSoft}
              opacity={skipped ? 0.35 : 1}
            />
            <Label x={38} y={57 + i * 26} text={`#${i + 1}`} size={10} fill={C.zinc6} mono />
            <Label x={78} y={57 + i * 26} text={t} size={11} fill={on ? C.sky : C.zinc3} anchor="middle" mono />
            {inLimit && i === 1 && (
              <Label x={182} y={57 + i * 26} text="← LIMIT 3" size={10.5} fill={C.sky} mono />
            )}
            {inOffset && i === 3 && (
              <Label x={182} y={57 + i * 26} text="← OFFSET 2, LIMIT 3" size={10.5} fill={C.sky} mono />
            )}
            {skipped && i === 0 && (
              <Label x={182} y={57 + i * 26} text="skipped" size={10} fill={C.zinc6} italic mono />
            )}
          </g>
        );
      })}
      <Reveal show={s.step >= 1}>
        <Panel x={420} y={52} w={318} h={92} title="top-N pattern" tone="calc">
          <Label x={438} y={82} text="ORDER BY total_amount DESC" size={10} fill={C.zinc3} mono />
          <Label x={438} y={100} text="LIMIT 3" size={10} fill={C.sky} mono bold />
          <Label x={438} y={124} text="“our three biggest orders”" size={10.5} fill={C.zinc5} />
        </Panel>
      </Reveal>
      <Reveal show={s.step >= 2}>
        <Panel x={420} y={158} w={318} h={118} title="pagination" tone="calc">
          <Label x={438} y={188} text="LIMIT 3 OFFSET 2" size={10} fill={C.sky} mono bold />
          <Label x={438} y={208} text="skip 2, take 3 → results 3–5" size={10.5} fill={C.zinc4} />
          <Label x={438} y={230} text="page size 3: page 3 = LIMIT 3 OFFSET 6" size={10} fill={C.zinc5} mono />
          <Label x={438} y={252} text="syntax note: MySQL uses LIMIT 2, 3" size={9.5} fill={C.zinc6} />
        </Panel>
      </Reveal>
    </Figure>
  );
}
