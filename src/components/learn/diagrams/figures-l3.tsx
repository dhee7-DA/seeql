"use client";

// Lesson 3 figures — WHERE: funnel, boolean regions, operators, precedence.

import {
  Arrow,
  C,
  Chip,
  Fade,
  Figure,
  H,
  Label,
  Legend,
  Mark,
  Panel,
  Reveal,
  StepBar,
  Tbl,
  useSteps,
} from "./kit";

/* ---------------- 3.1 the filter funnel (stepper) ---------------- */

function Dots({
  x,
  y,
  tone,
  n = 40,
  cols = 10,
  r = 5,
  gap = 15,
  skip = [],
}: {
  x: number;
  y: number;
  tone: string;
  n?: number;
  cols?: number;
  r?: number;
  gap?: number;
  skip?: number[];
}) {
  return (
    <g>
      {Array.from({ length: n }, (_, i) =>
        skip.includes(i) ? null : (
          <circle
            key={i}
            cx={x + (i % cols) * gap + r}
            cy={y + Math.floor(i / cols) * gap + r}
            r={r}
            fill={tone}
          />
        ),
      )}
    </g>
  );
}

export function L3Funnel() {
  const s = useSteps(3);
  const atGate = s.step >= 1;
  const passed = s.step >= 2;
  return (
    <Figure
      title="WHERE is a per-row test — only TRUE rows survive"
      h={314}
      footer={
        <StepBar
          {...s}
          captions={[
            "FROM customers — 40 rows arrive, one test each",
            "WHERE country = 'DE' runs on every row: TRUE, FALSE, or NULL",
            "Only TRUE rows pass: the 7 Berliners. FALSE and NULL rows are dropped",
          ]}
          accent={C.emerald}
        />
      }
    >
      <H x={22} y={28} text="40 rows" />
      <Dots x={22} y={38} tone={C.zinc6} n={40} cols={10} />
      <Label x={22} y={130} text="FROM customers" size={10.5} fill={C.zinc5} mono />
      <Arrow x1={182} y1={96} x2={252} y2={122} color={C.zinc5} />
      {/* gate */}
      <g>
        <path d="M 258 84 h 96 v 52 l -18 20 h -60 l -18 -20 z" fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.8} />
        <Label x={306} y={106} text="WHERE" size={11} fill={C.emerald} anchor="middle" bold mono />
        <Label x={306} y={122} text="country = 'DE'" size={9.5} fill={C.zinc3} anchor="middle" mono />
        <Label x={306} y={172} text="TRUE? pass · FALSE/NULL? drop" size={9.5} fill={C.zinc5} anchor="middle" />
      </g>
      <Arrow x1={360} y1={122} x2={430} y2={122} color={C.emerald} />
      <Fade show={passed} dx={14}>
        <g>
          <Dots x={436} y={54} tone={C.emerald} n={7} cols={4} />
          <Label x={436} y={126} text="7 rows pass — Berlin" size={10.5} fill={C.emerald} mono />
        </g>
      </Fade>
      <Fade show={atGate} dx={0}>
        <g>
          <Dots x={436} y={168} tone={C.rose} n={33} cols={11} skip={[]} />
          <Mark x={428} y={172} ok={false} />
          <Label x={436} y={216} text="33 rows fail the test (incl. any NULLs —" size={10} fill={C.zinc5} />
          <Label x={436} y={230} text="a NULL comparison is never TRUE)" size={10} fill={C.zinc5} />
        </g>
      </Fade>
      <Chip x={22} y={276} text="WHERE never merges rows — it only removes them" tone="pass" size={10} />
    </Figure>
  );
}

/* ---------------- 3.2 AND / OR / NOT regions ---------------- */

export function L3Venn() {
  const a = { cx: 96, cy: 96, r: 56 };
  const b = { cx: 164, cy: 96, r: 56 };
  const one = (id: string) => (
    <g>
      <defs>
        <clipPath id={id}>
          <circle cx={b.cx} cy={b.cy} r={b.r} />
        </clipPath>
      </defs>
    </g>
  );
  return (
    <Figure
      title="AND / OR / NOT — think overlapping sets of rows"
      h={250}
      footnote="Country = 'DE' draws one circle, price < 20 draws another. AND keeps only the overlap; OR keeps both circles; NOT keeps everything outside the circle. NULL rows belong to neither circle — they fail every one of these."
    >
      {one("vennclip")}
      {/* AND panel */}
      <Panel x={22} y={30} w={238} h={182} title="AND — both true" tone="pass">
        <g transform="translate(66 58)">
          <circle cx={a.cx - 66} cy={a.cy - 58} r={a.r} fill={C.skyBg} stroke={C.sky} strokeOpacity={0.5} />
          <circle cx={b.cx - 66} cy={b.cy - 58} r={b.r} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.5} />
          <circle cx={a.cx - 66} cy={a.cy - 58} r={a.r} fill={C.emerald} fillOpacity={0.5} clipPath="url(#vennclip)" />
          <Label x={30} y={34} text="DE" size={10} fill={C.sky} bold />
          <Label x={128} y={34} text="< $20" size={10} fill={C.emerald} bold />
        </g>
        <Label x={141} y={192} text="DE and cheap" size={10.5} fill={C.emerald} anchor="middle" />
      </Panel>
      {/* OR panel */}
      <Panel x={262} y={30} w={238} h={182} title="OR — either true" tone="pick">
        <g transform="translate(306 58)">
          <circle cx={30} cy={38} r={56} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.6} />
          <circle cx={98} cy={38} r={56} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.6} />
          <Label x={30} y={42} text="DE" size={10} fill={C.violet} bold />
          <Label x={128} y={42} text="< $20" size={10} fill={C.violet} bold />
        </g>
        <Label x={381} y={192} text="DE or cheap (or both)" size={10.5} fill={C.violet} anchor="middle" />
      </Panel>
      {/* NOT panel */}
      <Panel x={502} y={30} w={238} h={182} title="NOT — outside" tone="bad">
        <g transform="translate(546 58)">
          <rect x={-8} y={-14} width={188} height={110} rx={8} fill={C.roseBg} opacity={0.4} />
          <circle cx={82} cy={40} r={52} fill={C.panel} stroke={C.rose} strokeOpacity={0.7} />
          <Label x={82} y={44} text="DE" size={10} fill={C.rose} bold anchor="middle" />
        </g>
        <Label x={621} y={192} text="everyone but DE" size={10.5} fill={C.rose} anchor="middle" />
      </Panel>
      <Label x={22} y={236} text="country = 'DE' AND price < 20   —   each side is itself a per-row test" size={10.5} fill={C.zinc4} mono />
    </Figure>
  );
}

/* ---------------- 3.3 BETWEEN / IN / LIKE ---------------- */

export function L3Operators() {
  return (
    <Figure
      title="The everyday operators — BETWEEN, IN, LIKE"
      h={330}
      footnote="BETWEEN includes both endpoints. IN is set membership — cleaner than a chain of ORs. LIKE matches text patterns: % = any run of characters, _ = exactly one."
    >
      {/* BETWEEN */}
      <Panel x={22} y={28} w={716} h={88} title="BETWEEN — a closed range" tone="calc">
        <line x1={80} y1={76} x2={560} y2={76} stroke={C.line} strokeWidth={1.4} />
        {Array.from({ length: 11 }, (_, i) => (
          <g key={i}>
            <line x1={80 + i * 48} y1={71} x2={80 + i * 48} y2={81} stroke={C.zinc6} />
          </g>
        ))}
        <rect x={320} y={68} width={192} height={16} rx={8} fill={C.emeraldBg} />
        <circle cx={320} cy={76} r={5} fill={C.emerald} />
        <circle cx={512} cy={76} r={5} fill={C.emerald} />
        <Label x={320} y={100} text="10" size={10} fill={C.emerald} anchor="middle" mono />
        <Label x={512} y={100} text="30" size={10} anchor="middle" fill={C.emerald} mono />
        <Label x={600} y={70} text="price BETWEEN 10 AND 30" size={10.5} fill={C.zinc3} mono />
        <Label x={600} y={86} text="10 and 30 themselves count" size={9.5} fill={C.emerald} />
        <Label x={240} y={70} text="excluded →" size={9.5} fill={C.zinc6} anchor="end" />
        <Label x={536} y={70} text="← excluded" size={9.5} fill={C.zinc6} />
      </Panel>
      {/* IN */}
      <Panel x={22} y={126} w={340} h={90} title="IN — membership in a list" tone="pick">
        {["DE", "AT", "CH"].map((c, i) => (
          <Chip key={c} x={66 + i * 62} y={158} text={c} tone="pick" size={10} />
        ))}
        <Chip x={252} y={158} text="FR?" tone="bad" size={10} />
        <Label x={48} y={198} text="country IN ('DE','AT','CH') — one test, three doors" size={10} fill={C.zinc4} mono />
      </Panel>
      {/* LIKE */}
      <Panel x={376} y={126} w={362} h={90} title="LIKE — pattern match on text" tone="key">
        <Label x={396} y={160} text="email LIKE '%@gmail.com'" size={10.5} fill={C.teal} mono />
        <Label x={396} y={180} text="% = anything (even empty)   _ = exactly one char" size={10} fill={C.zinc4} />
        <Label x={396} y={200} text="'%@gmail.com' matches 'ana@gmail.com' but NOT 'ana@yahoo.com'" size={9.5} fill={C.zinc5} />
      </Panel>
      {/* examples strip */}
      <Panel x={22} y={226} w={716} h={78} title="read them like sentences" tone="default">
        <Label x={40} y={264} text="product_name LIKE 'Desk%'" size={10} fill={C.zinc3} mono />
        <Label x={280} y={264} text="starts with 'Desk'" size={10} fill={C.zinc5} />
        <Label x={40} y={286} text="phone LIKE '%555%'" size={10} fill={C.zinc3} mono />
        <Label x={280} y={286} text="contains 555 anywhere" size={10} fill={C.zinc5} />
        <Label x={500} y={264} text="city LIKE '_ondon'" size={10} fill={C.zinc3} mono />
        <Label x={640} y={264} text="London, Xondon…" size={10} fill={C.zinc5} />
        <Label x={500} y={286} text="NOT IN / NOT LIKE" size={10} fill={C.zinc3} mono />
        <Label x={640} y={286} text="negate any of these" size={10} fill={C.zinc5} />
      </Panel>
    </Figure>
  );
}

/* ---------------- 3.4 operator precedence ---------------- */

export function L3Precedence() {
  return (
    <Figure
      title="Precedence trap — AND binds tighter than OR"
      h={300}
      footnote="AND groups first, always. Read a OR b AND c as a OR (b AND c). If you meant (a OR b) AND c — write the parentheses. When in doubt, parenthesize; SQL never punishes clarity."
    >
      <Panel x={22} y={28} w={340} h={226} title="how SQL reads it" tone="bad">
        <Label x={42} y={62} text="country = 'DE' OR city = 'Berlin' AND price < 20" size={10} fill={C.zinc3} mono />
        {/* tree: OR top, left DE, right AND */}
        <g>
          <rect x={140} y={86} width={54} height={22} rx={6} fill={C.roseBg} stroke={C.rose} strokeOpacity={0.6} />
          <Label x={167} y={101} text="OR" size={11} fill={C.rose} anchor="middle" bold mono />
          <rect x={62} y={140} width={92} height={22} rx={6} fill={C.panelSoft} stroke={C.line} />
          <Label x={108} y={155} text="DE?" size={10} fill={C.zinc3} anchor="middle" mono />
          <rect x={172} y={140} width={62} height={22} rx={6} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.6} />
          <Label x={203} y={155} text="AND" size={11} fill={C.emerald} anchor="middle" bold mono />
          <rect x={148} y={192} width={110} height={22} rx={6} fill={C.panelSoft} stroke={C.line} />
          <Label x={203} y={207} text="Berlin AND <$20" size={9.5} fill={C.zinc3} anchor="middle" mono />
          <Arrow x1={140} y1={106} x2={112} y2={138} color={C.zinc6} />
          <Arrow x1={194} y1={106} x2={202} y2={138} color={C.zinc6} />
          <Arrow x1={203} y1={162} x2={203} y2={190} color={C.zinc6} />
        </g>
        <Label x={42} y={236} text="= DE  OR  (Berlin AND cheap)" size={10.5} fill={C.rose} bold />
      </Panel>
      <Panel x={396} y={28} w={342} h={226} title="what you probably meant" tone="pass">
        <Label x={416} y={62} text="(country = 'DE' OR city = 'Berlin') AND price < 20" size={10} fill={C.zinc3} mono />
        <g>
          <rect x={514} y={86} width={62} height={22} rx={6} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.6} />
          <Label x={545} y={101} text="AND" size={11} fill={C.emerald} anchor="middle" bold mono />
          <rect x={420} y={140} width={120} height={22} rx={6} fill={C.panelSoft} stroke={C.line} />
          <Label x={480} y={155} text="DE OR Berlin" size={10} fill={C.zinc3} anchor="middle" mono />
          <rect x={560} y={140} width={74} height={22} rx={6} fill={C.panelSoft} stroke={C.line} />
          <Label x={597} y={155} text="price < 20" size={10} fill={C.zinc3} anchor="middle" mono />
          <Arrow x1={520} y1={106} x2={484} y2={138} color={C.zinc6} />
          <Arrow x1={570} y1={106} x2={594} y2={138} color={C.zinc6} />
        </g>
        <Label x={416} y={236} text="parentheses make the intent executable" size={10.5} fill={C.emerald} bold />
      </Panel>
      <Reveal show>
        <Label x={22} y={284} text="classic real-world bug: 'active OR vip AND spent > 100' silently includes inactive VIPs over 100" size={10.5} fill={C.amber} />
      </Reveal>
    </Figure>
  );
}

/* ---------------- 3.5 LIKE pattern matcher (stepper) ---------------- */

export function L3Like() {
  const s = useSteps(4);
  const rows = [
    { name: "Wireless Mouse M3", match: true, note: "% eats ' Mouse M3'" },
    { name: "Wireless Charger Pad", match: true, note: "% eats ' Charger Pad'" },
    { name: "Mechanical Keyboard K1", match: false, note: "M ≠ W — literal fails" },
    { name: "USB-C Cable 2m", match: false, note: "U ≠ W — literal fails" },
  ];
  const rowShown = (i: number) =>
    i < 2 ? s.step >= i + 1 : s.step === 3;
  return (
    <Figure
      title="inside LIKE 'Wireless%' — how the engine matches a pattern"
      h={310}
      footer={
        <StepBar
          {...s}
          captions={[
            "a pattern = literal characters + wildcards. Here: literal Wireless, then % = anything after",
            "'Wireless Mouse M3' starts with Wireless → % swallows ' Mouse M3' → match",
            "'Wireless Charger Pad' — same story → match",
            "the others fail at the very first character — the literal must match from the start",
          ]}
          accent={C.teal}
        />
      }
    >
      <Panel x={22} y={30} w={716} h={74} title="the pattern">
        <Chip x={186} y={44} text="'Wireless'" tone="key" size={12} />
        <Chip x={296} y={44} text="%" tone="pick" size={12} />
        <Label x={38} y={90} text="literal — must match exactly, starting at the first character" size={9} fill={C.zinc5} />
        <Label x={430} y={90} text="% — any run of characters, even none" size={9} fill={C.zinc5} />
      </Panel>

      {rows.map((r, i) => {
        const y = 120 + i * 34;
        const shown = rowShown(i);
        return (
          <g key={r.name}>
            <rect
              x={22}
              y={y}
              width={452}
              height={28}
              rx={8}
              fill={C.panelSoft}
              stroke={C.lineSoft}
              opacity={shown ? 1 : 0.4}
            />
            {shown && r.match && (
              <rect x={34} y={y + 5} width={56} height={18} rx={4} fill={C.tealBg} />
            )}
            {shown && !r.match && (
              <rect x={34} y={y + 5} width={11} height={18} rx={3} fill={C.roseBg} />
            )}
            <Label x={38} y={y + 19} text={r.name} size={11} fill={shown ? C.zinc2 : C.zinc5} mono />
            <Fade show={shown} dx={-8}>
              <Label x={210} y={y + 19} text={r.note} size={9} fill={r.match ? C.teal : C.rose} />
              <Mark x={496} y={y + 14} ok={r.match} />
              <Label
                x={512}
                y={y + 18}
                text={r.match ? "match" : "drop"}
                size={9.5}
                fill={r.match ? C.emerald : C.rose}
              />
            </Fade>
          </g>
        );
      })}

      <Panel x={548} y={120} w={190} h={132} title="wildcards">
        <Label x={562} y={172} text="%   any run, even none" size={9.5} fill={C.zinc3} mono />
        <Label x={562} y={194} text="_    exactly one character" size={9.5} fill={C.zinc3} mono />
        <Label x={562} y={216} text="NOT LIKE inverts it" size={9.5} fill={C.zinc3} mono />
        <Label x={562} y={242} text="SQLite LIKE ignores case" size={8.5} fill={C.zinc6} />
      </Panel>

      <Chip
        x={22}
        y={270}
        text="LIKE 'W%' starts-with · '%Pro%' contains · '_ouse' four letters ending -ouse"
        tone="key"
        size={10}
      />
    </Figure>
  );
}
