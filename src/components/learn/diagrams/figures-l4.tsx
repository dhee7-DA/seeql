"use client";

// Lesson 4 figures — NULL: three-valued logic, the WHERE black hole,
// IS NULL vs = NULL, aggregates skipping NULLs.

import {
  Arrow,
  C,
  Chip,
  Fade,
  Figure,
  H,
  Label,
  Mark,
  Panel,
  Reveal,
  StepBar,
  Tbl,
  useSteps,
} from "./kit";

/* ---------------- 4.1 three-valued logic ---------------- */

const TV = { T: C.emerald, F: C.rose, U: C.amber } as const;

function TVCell({
  x,
  y,
  v,
  w = 56,
  h = 30,
}: {
  x: number;
  y: number;
  v: "T" | "F" | "U";
  w?: number;
  h?: number;
}) {
  const label = v === "T" ? "TRUE" : v === "F" ? "FALSE" : "UNKNOWN";
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={6} fill={TV[v]} fillOpacity={v === "U" ? 0.12 : 0.16} stroke={TV[v]} strokeOpacity={0.5} />
      <Label x={x + w / 2} y={y + h / 2 + 4} text={label} size={9.5} fill={TV[v]} anchor="middle" bold mono />
    </g>
  );
}

export function L4Truth() {
  const and = [
    ["T", "F", "U"],
    ["F", "F", "F"],
    ["U", "F", "U"],
  ] as const;
  const or = [
    ["T", "T", "T"],
    ["T", "F", "U"],
    ["T", "U", "U"],
  ] as const;
  return (
    <Figure
      title="Three-valued logic — TRUE, FALSE and UNKNOWN"
      h={330}
      footnote="Any comparison touching NULL yields UNKNOWN, not FALSE. AND with UNKNOWN stays UNKNOWN (it could still go either way); OR with TRUE is TRUE (one TRUE is enough). WHERE keeps only TRUE — UNKNOWN is silently dropped."
    >
      {/* AND matrix */}
      <H x={30} y={44} text="x AND y" color={C.emerald} />
      {["x = TRUE", "x = FALSE", "x = UNKNOWN"].map((t, i) => (
        <Label key={t} x={118} y={78 + i * 36} text={t} size={9.5} fill={C.zinc5} anchor="end" />
      ))}
      {["y=T", "y=F", "y=U"].map((t, i) => (
        <Label key={t} x={130 + i * 62 + 28} y={62} text={t} size={9.5} fill={C.zinc5} anchor="middle" mono />
      ))}
      {and.map((row, r) =>
        row.map((v, c) => (
          <TVCell key={`${r}${c}`} x={130 + c * 62} y={70 + r * 36} v={v} w={56} />
        )),
      )}
      {/* OR matrix */}
      <H x={420} y={44} text="x OR y" color={C.violet} />
      {["x = TRUE", "x = FALSE", "x = UNKNOWN"].map((t, i) => (
        <Label key={t} x={508} y={78 + i * 36} text={t} size={9.5} fill={C.zinc5} anchor="end" />
      ))}
      {["y=T", "y=F", "y=U"].map((t, i) => (
        <Label key={t} x={520 + i * 62 + 28} y={62} text={t} size={9.5} fill={C.zinc5} anchor="middle" mono />
      ))}
      {or.map((row, r) =>
        row.map((v, c) => (
          <TVCell key={`${r}${c}`} x={520 + c * 62} y={70 + r * 36} v={v} w={56} />
        )),
      )}
      <Reveal show>
        <Panel x={30} y={196} w={700} h={104} title="why this matters" tone="null">
          <Label x={50} y={234} text="NULL AND TRUE  → UNKNOWN   (the NULL might have made it TRUE… or not)" size={11} fill={C.amber} mono />
          <Label x={50} y={254} text="NULL OR TRUE   → TRUE      (one side already settles it)" size={11} fill={C.emerald} mono />
          <Label x={50} y={274} text="NULL OR FALSE  → UNKNOWN   (same trap as AND — dropped by WHERE)" size={11} fill={C.amber} mono />
          <Label x={50} y={292} text="NOT UNKNOWN    → UNKNOWN   (even 'opposite of unknown' is unknown)" size={11} fill={C.amber} mono />
        </Panel>
      </Reveal>
    </Figure>
  );
}

/* ---------------- 4.2 the NULL black hole (stepper) ---------------- */

export function L4BlackHole() {
  const s = useSteps(3);
  const testing = s.step >= 1;
  const verdict = s.step >= 2;
  const rows = [
    { id: "101", total: "145.00", kind: "pass" },
    { id: "102", total: "82.50", kind: "bad" },
    { id: "103", total: "NULL", kind: "null" },
    { id: "104", total: "299.99", kind: "pass" },
    { id: "105", total: "61.00", kind: "bad" },
    { id: "106", total: "NULL", kind: "null" },
  ] as const;
  return (
    <Figure
      title="The NULL black hole — WHERE x > 100 swallows unknowns"
      h={334}
      footer={
        <StepBar
          {...s}
          captions={[
            "six orders arrive at the filter",
            "each row is tested: total_amount > 100",
            "TRUE passes · FALSE fails · UNKNOWN (NULL) vanishes — it is not kept, ever",
          ]}
          accent={C.amber}
        />
      }
    >
      <Tbl
        x={22}
        y={40}
        w={172}
        title="orders"
        headers={["id", "total"]}
        colW={[64, 108]}
        rowH={26}
        rows={rows.map((r) => [
          r.id,
          r.kind === "null"
            ? { t: "NULL", tone: "null" as const }
            : { t: r.total, tone: (r.kind === "pass" ? "pass" : "bad") as "pass" | "bad" },
        ])}
      />
      <Arrow x1={200} y1={118} x2={252} y2={130} color={C.zinc5} />
      {/* test rig */}
      <Fade show={testing} dx={10}>
        <g>
          <rect x={258} y={86} width={130} height={88} rx={10} fill={C.panel} stroke={C.line} />
          <Label x={323} y={110} text="total > 100 ?" size={11} fill={C.zinc2} anchor="middle" mono />
          <Label x={323} y={130} text="145 > 100 → TRUE" size={9.5} fill={C.emerald} anchor="middle" mono />
          <Label x={323} y={146} text="82 > 100 → FALSE" size={9.5} fill={C.rose} anchor="middle" mono />
          <Label x={323} y={162} text="NULL > 100 → UNKNOWN" size={9.5} fill={C.amber} anchor="middle" mono />
        </g>
      </Fade>
      {/* three exits */}
      <Fade show={verdict} dx={0}>
        <Arrow x1={394} y1={98} x2={470} y2={72} color={C.emerald} />
        <Label x={480} y={68} text="TRUE → kept" size={10.5} fill={C.emerald} mono />
        <Chip x={478} y={80} text="rows 101, 104" tone="pass" size={9.5} />
        <Arrow x1={394} y1={130} x2={470} y2={158} color={C.rose} />
        <Label x={480} y={154} text="FALSE → dropped" size={10.5} fill={C.rose} mono />
        <Chip x={478} y={166} text="rows 102, 105" tone="bad" size={9.5} />
        <Arrow x1={394} y1={162} x2={470} y2={236} color={C.amber} dash="4 3" curve={26} />
        <Label x={480} y={240} text="UNKNOWN → swallowed" size={10.5} fill={C.amber} mono />
        <Chip x={478} y={252} text="rows 103, 106 ∅" tone="null" size={9.5} />
        <Label x={480} y={286} text="NULL rows are NOT in the result —" size={10} fill={C.zinc4} />
        <Label x={480} y={300} text="and NOT in the rejects either. They vanish." size={10} fill={C.amber} />
      </Fade>
      <Chip x={22} y={288} text="WHERE keeps TRUE only — neither FALSE nor UNKNOWN" tone="null" size={10} />
    </Figure>
  );
}

/* ---------------- 4.3 = NULL vs IS NULL ---------------- */

export function L4IsNull() {
  return (
    <Figure
      title="Testing for NULL — the only door is IS NULL"
      h={296}
      footnote="= NULL is a comparison, and comparisons with NULL yield UNKNOWN — the row is dropped, every time, for every row with a NULL. IS NULL is not a comparison; it's a dedicated check that returns TRUE for empty slots."
    >
      {/* broken rig */}
      <Panel x={22} y={30} w={340} h={228} title="phone = NULL  ✗  filters everything out" tone="bad">
        <Label x={42} y={64} text="SELECT * FROM customers" size={10} fill={C.zinc3} mono />
        <Label x={42} y={80} text="WHERE phone = NULL" size={10} fill={C.rose} mono bold />
        <Label x={42} y={110} text="for a row with phone = '555…':" size={10} fill={C.zinc5} />
        <Label x={62} y={128} text="'555…' = NULL → UNKNOWN" size={10} fill={C.amber} mono />
        <Label x={42} y={152} text="for a row with phone = NULL:" size={10} fill={C.zinc5} />
        <Label x={62} y={170} text="NULL = NULL → UNKNOWN (!)" size={10} fill={C.amber} mono />
        <Label x={42} y={200} text="nothing is ever TRUE → zero rows," size={10.5} fill={C.rose} />
        <Label x={42} y={216} text="with no error to warn you" size={10.5} fill={C.rose} />
        <Mark x={340} y={46} ok={false} size={8} />
      </Panel>
      {/* correct rig */}
      <Panel x={398} y={30} w={340} h={228} title="phone IS NULL  ✓  finds the empty slots" tone="pass">
        <Label x={418} y={64} text="SELECT * FROM customers" size={10} fill={C.zinc3} mono />
        <Label x={418} y={80} text="WHERE phone IS NULL" size={10} fill={C.emerald} mono bold />
        <Label x={418} y={110} text="reads like English: 'phone has no value'" size={10} fill={C.zinc5} />
        <Label x={418} y={134} text="empty slot → TRUE → row is kept" size={10.5} fill={C.emerald} mono />
        <Label x={418} y={158} text="sibling: phone IS NOT NULL" size={10.5} fill={C.emerald} mono />
        <Label x={418} y={182} text="→ rows that do have a value" size={10} fill={C.zinc5} />
        <Label x={418} y={212} text="also the only way to find them for" size={10} fill={C.zinc5} />
        <Label x={418} y={228} text="COUNT / reporting (Lesson 7 & 8 use this a lot)" size={10} fill={C.zinc5} />
        <Mark x={716} y={46} ok size={8} />
      </Panel>
      <Label x={22} y={282} text="never write = NULL. If a query returns suspiciously few rows, this is the first bug to look for." size={10.5} fill={C.amber} />
    </Figure>
  );
}

/* ---------------- 4.4 aggregates skip NULLs ---------------- */

export function L4AggNull() {
  const cells = ["120", "80", "NULL", "200", "NULL"];
  return (
    <Figure
      title="Aggregates skip NULLs — silently"
      h={280}
      footnote="SUM/AVG/MIN/MAX ignore NULL cells entirely; COUNT(column) counts only non-NULLs; COUNT(*) counts rows. Five orders, three with known totals: AVG(total_amount) divides by 3, not 5 — the average quietly pretends the unknowns don't exist."
    >
      <H x={22} y={30} text="five orders' total_amount" />
      {cells.map((t, i) => (
        <g key={i}>
          <rect
            x={22 + i * 74}
            y={42}
            width={64}
            height={34}
            rx={8}
            fill={t === "NULL" ? C.amberBg : C.panelSoft}
            stroke={t === "NULL" ? C.amber : C.line}
          />
          <Label
            x={54 + i * 74}
            y={64}
            text={t}
            size={12}
            fill={t === "NULL" ? C.amber : C.zinc2}
            anchor="middle"
            mono
            italic={t === "NULL"}
          />
        </g>
      ))}
      <Label x={22} y={100} text="rows 3 and 5 are unknown — watch each aggregate:" size={10.5} fill={C.zinc5} />
      <Panel x={22} y={116} w={340} h={132} title="what they return" tone="calc">
        <Label x={42} y={146} text="COUNT(*)        → 5" size={11} fill={C.zinc2} mono />
        <Label x={42} y={168} text="COUNT(total)    → 3" size={11} fill={C.emerald} mono />
        <Label x={42} y={190} text="SUM(total)      → 400" size={11} fill={C.emerald} mono />
        <Label x={42} y={212} text="AVG(total)      → 133.33  (400 / 3)" size={11} fill={C.emerald} mono />
        <Label x={42} y={234} text="MIN(total)      → 80" size={11} fill={C.zinc2} mono />
      </Panel>
      <Panel x={398} y={116} w={340} h={132} title="the trap" tone="null">
        <Label x={418} y={146} text="AVG divided by 3 — not 5. If the two" size={10.5} fill={C.zinc4} />
        <Label x={418} y={164} text="unknowns were small orders, the true" size={10.5} fill={C.zinc4} />
        <Label x={418} y={182} text="average is lower. The report won't tell you." size={10.5} fill={C.zinc4} />
        <Label x={418} y={210} text="hedge: report COUNT(total) next to AVG," size={10} fill={C.amber} />
        <Label x={418} y={228} text="or COUNT(*) - COUNT(total) = missing count" size={10} fill={C.amber} mono />
      </Panel>
      <Chip x={22} y={258} text="COUNT(*) counts rows · COUNT(col) counts values" tone="key" size={10} />
    </Figure>
  );
}

/* ---------------- 4.5 NULL is contagious in math (stepper) ---------------- */

export function L4Contagion() {
  const s = useSteps(3);
  return (
    <Figure
      title="NULL is contagious — any math with NULL produces NULL"
      h={300}
      footer={
        <StepBar
          {...s}
          captions={[
            "the expression runs once per row: price × 1.10, rounded to cents",
            "rows with a real price compute normally: 34.50 → 37.95 · 129.00 → 141.90",
            "the row with price NULL → NULL markup. Missing + math = missing",
          ]}
          accent={C.amber}
        />
      }
    >
      <Tbl
        x={22}
        y={44}
        w={252}
        title="products"
        headers={["product_name", "price"]}
        colW={[162, 90]}
        rows={[
          ["Wireless Mouse M3", "34.50"],
          ["4K Webcam Pro", "129.00"],
          ["Studio Desktop Mic", { t: "NULL", tone: "null" }],
        ]}
        size={10.5}
      />
      <Panel x={312} y={78} w={188} h={52}>
        <Label x={406} y={100} text="ROUND(price * 1.10, 2)" size={10.5} fill={C.sky} anchor="middle" mono />
        <Label x={406} y={118} text="runs once per row" size={8.5} fill={C.zinc6} anchor="middle" />
      </Panel>
      <Arrow x1={278} y1={104} x2={308} y2={104} color={C.zinc5} />
      <Arrow x1={504} y1={104} x2={530} y2={104} color={C.sky} />
      <Tbl
        x={536}
        y={44}
        w={202}
        title="markup"
        titleTone="calc"
        headers={["price_with_markup"]}
        colW={[202]}
        rows={[
          [{ t: "37.95", tone: s.step >= 1 ? "pass" : "dim" }],
          [{ t: "141.90", tone: s.step >= 1 ? "pass" : "dim" }],
          [{ t: "NULL", tone: s.step >= 2 ? "null" : "dim" }],
        ]}
        size={10.5}
      />

      <Reveal show={s.step >= 2}>
        <Panel x={22} y={186} w={716} h={58} title="why NULL is the honest answer" tone="null">
          <Label x={42} y={224} text="Studio Desktop Mic has no price — 10% of unknown is still unknown: NULL in → NULL out." size={10} fill={C.zinc3} />
          <Label x={42} y={240} text="a fake 0.00 would quietly read as a free microphone." size={10} fill={C.amber} />
        </Panel>
      </Reveal>
      <Chip
        x={22}
        y={262}
        text="COALESCE(price, 0) * 1.10 → 0.00 — deliberate fake-zero: only when zero truly is the policy"
        tone="pick"
        size={10}
      />
    </Figure>
  );
}

/* ---------------- 4.6 COALESCE fallback chain (stepper) ---------------- */

export function L4Coalesce() {
  const s = useSteps(4);
  return (
    <Figure
      title="COALESCE(phone, 'n/a') — scan left to right, first non-NULL wins"
      h={336}
      footer={
        <StepBar
          {...s}
          captions={[
            "COALESCE evaluates its arguments left to right and returns the first non-NULL one",
            "Bruno Silva's phone IS NULL — empty, so the scan moves to the next candidate",
            "the fallback 'n/a' wins — the grid shows n/a instead of an empty cell",
            "Bob Martin has a real number — it wins immediately; the fallback is never consulted",
          ]}
          accent={C.violet}
        />
      }
    >
      <Panel x={22} y={30} w={716} h={84}>
        <H x={38} y={54} text="the arguments — scanned left to right" />
        <rect x={44} y={64} width={170} height={30} rx={8} fill={C.tealBg} stroke={C.teal} strokeOpacity={0.55} />
        <Label x={129} y={84} text="phone" size={11.5} fill={C.teal} anchor="middle" mono bold />
        <Arrow x1={218} y1={79} x2={256} y2={79} color={C.zinc6} />
        <rect x={260} y={64} width={120} height={30} rx={8} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.55} />
        <Label x={320} y={84} text="'n/a'" size={11.5} fill={C.violet} anchor="middle" mono bold />
        <Label x={44} y={110} text="candidate 1 — the real value" size={9} fill={C.zinc5} />
        <Label x={260} y={110} text="candidate 2 — the fallback" size={9} fill={C.zinc5} />
      </Panel>

      {/* lane A — NULL phone */}
      <Chip x={22} y={148} text="Bruno Silva" size={10} />
      <rect x={150} y={140} width={130} height={34} rx={8} fill={C.amberBg} stroke={C.amber} strokeOpacity={s.step >= 1 ? 0.9 : 0.4} />
      <Label x={215} y={162} text="NULL" size={11.5} fill={C.amber} anchor="middle" mono italic />
      <Fade show={s.step >= 1} dx={-6}>
        <Label x={150} y={192} text="empty → keep scanning" size={9} fill={C.amber} />
      </Fade>
      <Fade show={s.step >= 2}>
        <Arrow x1={284} y1={157} x2={326} y2={157} color={C.amber} />
        <rect x={330} y={140} width={100} height={34} rx={8} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.7} />
        <Label x={380} y={162} text="'n/a'" size={11.5} fill={C.violet} anchor="middle" mono bold />
        <Arrow x1={434} y1={157} x2={554} y2={157} color={C.violet} />
        <Chip x={560} y={147} text="n/a" tone="pick" solid size={11} />
      </Fade>

      {/* lane B — real phone */}
      <Chip x={22} y={228} text="Bob Martin" size={10} />
      <rect x={150} y={220} width={130} height={34} rx={8} fill={C.tealBg} stroke={C.teal} strokeOpacity={0.6} />
      <Label x={215} y={242} text="'555.0132'" size={11} fill={C.teal} anchor="middle" mono />
      <Fade show={s.step >= 3}>
        <Arrow x1={284} y1={237} x2={554} y2={231} color={C.teal} curve={-26} label="first argument wins" labelDy={-8} />
        <Chip x={560} y={222} text="'555.0132'" tone="key" solid size={10} />
        <rect x={330} y={220} width={100} height={34} rx={8} fill="none" stroke={C.zinc6} strokeDasharray="4 4" />
        <Label x={380} y={242} text="'n/a'" size={11} fill={C.zinc6} anchor="middle" mono />
        <Label x={330} y={270} text="never consulted" size={9} fill={C.zinc6} />
      </Fade>

      <Chip
        x={22}
        y={300}
        text="COALESCE never drops the row — it only fills the displayed value"
        tone="key"
        size={10}
      />
    </Figure>
  );
}
