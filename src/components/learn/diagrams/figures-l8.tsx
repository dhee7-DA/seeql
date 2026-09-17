"use client";

// Lesson 8 figures — GROUP BY bucket sorter, WHERE vs HAVING, the full
// execution pipeline, alias timing, the bare-column pitfall.

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
  TONE_FG,
  useSteps,
} from "./kit";

/* ---------------- 8.1 bucket sorter (stepper) ---------------- */

const BUCKET_ROWS = [
  { cat: "Audio", price: "84.50", color: C.emerald },
  { cat: "Audio", price: "31.20", color: C.emerald },
  { cat: "Peripherals", price: "120.00", color: C.violet },
  { cat: "Audio", price: "299.00", color: C.emerald },
  { cat: "Peripherals", price: "61.00", color: C.violet },
  { cat: "Accessories", price: "12.00", color: C.sky },
];

export function L8Buckets() {
  const s = useSteps(3);
  return (
    <Figure
      title="GROUP BY sorts rows into buckets, then aggregates each bucket"
      h={330}
      footer={
        <StepBar
          {...s}
          captions={[
            "six product rows arrive, each with a category",
            "GROUP BY category drops each row into its bucket — one bucket per unique value",
            "each bucket collapses to one output row: the group key + the aggregate over its rows",
          ]}
          accent={C.violet}
        />
      }
    >
      <H x={22} y={30} text="products (sample)" />
      <Tbl
        x={22}
        y={42}
        w={220}
        title="rows"
        headers={["category", "price"]}
        colW={[120, 100]}
        rowH={26}
        rows={BUCKET_ROWS.map((r) => [{ t: r.cat, tone: "dim" as const }, r.price])}
      />
      {/* falling rows animation frame: at step 1 show colored dots mid-flight */}
      <Fade show={s.step === 1} dx={0}>
        {BUCKET_ROWS.map((r, i) => (
          <circle key={i} cx={290} cy={70 + i * 22} r={5} fill={r.color} opacity={0.85} />
        ))}
        <Label x={306} y={104} text="→ by category" size={10} fill={C.zinc5} />
      </Fade>
      <Arrow x1={248} y1={104} x2={280} y2={104} color={C.zinc5} />
      {/* buckets */}
      {[
        { name: "Audio", n: 3, sum: "414.70", y: 42, color: C.emerald },
        { name: "Peripherals", n: 2, sum: "181.00", y: 138, color: C.violet },
        { name: "Accessories", n: 1, sum: "12.00", y: 222, color: C.sky },
      ].map((b) => (
        <g key={b.name}>
          <rect x={370} y={b.y} width={200} height={74} rx={10} fill={b.color} fillOpacity={0.08} stroke={b.color} strokeOpacity={0.5} strokeDasharray="5 4" />
          <Label x={386} y={b.y + 20} text={b.name} size={11} fill={b.color} bold mono />
          {Array.from({ length: b.n }, (_, i) => (
            <circle key={i} cx={498 + (i % 4) * 16} cy={b.y + 16} r={4.5} fill={b.color} fillOpacity={0.8} />
          ))}
          <Label x={386} y={b.y + 44} text={`${b.n} row${b.n > 1 ? "s" : ""} → SUM(price) = ${b.sum}`} size={9.5} fill={C.zinc4} mono />
          <Label x={386} y={b.y + 62} text="collapses to ONE result row" size={9} fill={C.zinc6} />
        </g>
      ))}
      <Arrow x1={574} y1={168} x2={608} y2={168} color={C.zinc5} />
      <Fade show={s.step >= 2} dx={10}>
        <Tbl
          x={612}
          y={70}
          w={126}
          titleTone="pick"
          title="result"
          headers={["category", "SUM"]}
          colW={[70, 56]}
          rowH={26}
          size={9.5}
          rows={[
            ["Audio", "414.70"],
            ["Peripherals", "181.00"],
            ["Accessories", "12.00"],
          ]}
        />
        <Label x={675} y={216} text="3 rows out:" size={10} fill={C.zinc4} anchor="middle" />
        <Label x={675} y={230} text="one per bucket" size={10} fill={C.zinc4} anchor="middle" />
      </Fade>
      <Chip x={22} y={296} text="the group key is the bucket label — it's how each output row is named" tone="pick" size={10} />
    </Figure>
  );
}

/* ---------------- 8.2 WHERE vs HAVING ---------------- */

export function L8Gates() {
  return (
    <Figure
      title="WHERE filters rows — HAVING filters buckets"
      h={300}
      footnote="WHERE runs before grouping: it removes rows, so removed rows never reach a bucket. HAVING runs after: it inspects each bucket's aggregate and keeps or kills whole groups. WHERE can't see aggregates; HAVING can."
    >
      {/* row stage */}
      <H x={22} y={36} text="150 rows" />
      <g>
        {Array.from({ length: 24 }, (_, i) => (
          <circle key={i} cx={30 + (i % 12) * 13} cy={52 + Math.floor(i / 12) * 13} r={4.4} fill={C.zinc6} />
        ))}
      </g>
      {/* WHERE gate */}
      <Arrow x1={190} y1={70} x2={232} y2={70} color={C.zinc5} />
      <g>
        <path d="M 236 42 h 60 v 40 l -15 16 h -30 l -15 -16 z" fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.8} />
        <Label x={266} y={66} text="WHERE" size={10.5} fill={C.emerald} anchor="middle" bold mono />
        <Label x={266} y={116} text="status = 'delivered'" size={9} fill={C.zinc4} anchor="middle" mono />
        <Label x={266} y={130} text="drops ROWS" size={9} fill={C.emerald} anchor="middle" />
      </g>
      <Arrow x1={300} y1={70} x2={342} y2={70} color={C.emerald} />
      <Label x={320} y={58} text="fewer rows" size={9} fill={C.zinc6} anchor="middle" />
      {/* GROUP BY splitter */}
      <g>
        <path d="M 346 96 L 380 46 L 414 96 Z" fill={C.violetBg} stroke={C.violet} strokeOpacity={0.7} />
        <Label x={380} y={84} text="GROUP" size={9.5} fill={C.violet} anchor="middle" bold mono />
        <Label x={380} y={96} text="BY" size={9.5} fill={C.violet} anchor="middle" bold mono />
        <Label x={380} y={130} text="rows → buckets" size={9} fill={C.zinc4} anchor="middle" />
      </g>
      {/* buckets */}
      {[
        { y: 40, n: 5 },
        { y: 82, n: 3 },
        { y: 124, n: 2 },
      ].map((b, bi) => (
        <g key={bi}>
          <rect x={424} y={b.y} width={110} height={32} rx={8} fill={C.violetBg} stroke={C.violet} strokeOpacity={0.45} strokeDasharray="4 3" />
          {Array.from({ length: b.n }, (_, i) => (
            <circle key={i} cx={440 + i * 15} cy={b.y + 16} r={4.4} fill={C.violet} fillOpacity={0.8} />
          ))}
          <Label x={544} y={b.y + 20} text={`= ${[410, 240, 90][bi]}`} size={9.5} fill={C.zinc4} mono />
        </g>
      ))}
      <Label x={544} y={30} text="SUM per bucket" size={9} fill={C.zinc6} />
      {/* HAVING gate */}
      <Arrow x1={538} y1={76} x2={578} y2={76} color={C.zinc5} />
      <g>
        <path d="M 582 60 h 60 v 52 l -15 16 h -30 l -15 -16 z" fill={C.amberBg} stroke={C.amber} strokeOpacity={0.8} />
        <Label x={612} y={84} text="HAVING" size={10.5} fill={C.amber} anchor="middle" bold mono />
        <Label x={612} y={146} text="SUM(total) > 200" size={9} fill={C.zinc4} anchor="middle" mono />
        <Label x={612} y={160} text="drops BUCKETS" size={9} fill={C.amber} anchor="middle" />
      </g>
      <Arrow x1={646} y1={96} x2={690} y2={96} color={C.amber} />
      <Fade show>
        <g>
          <rect x={694} y={40} width={44} height={32} rx={8} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.5} />
          <Label x={716} y={60} text="410" size={10} fill={C.emerald} anchor="middle" mono />
          <Mark x={676} y={92} ok={false} />
          <Label x={694} y={96} text="240 & 90 fail" size={9} fill={C.rose} />
        </g>
      </Fade>
      <Chip x={22} y={200} text="timeline:  WHERE (rows)  →  GROUP BY  →  aggregates  →  HAVING (buckets)" tone="key" size={10} />
      <Label x={22} y={232} text="WHERE can't use SUM() — the buckets don't exist yet. HAVING can, because it runs after." size={10.5} fill={C.zinc4} />
      <Label x={22} y={252} text="on plain, ungrouped queries HAVING also works — it then judges the single grand-total row." size={10.5} fill={C.zinc6} />
      <Label x={22} y={278} text="efficiency: put anything row-level in WHERE first — HAVING after grouping does more work." size={10.5} fill={C.zinc6} />
    </Figure>
  );
}

/* ---------------- 8.3 the full execution pipeline (stepper) ---------------- */

const PIPE = [
  { key: "FROM", note: "gather the table (and, later, joins)", tone: "key" as const },
  { key: "WHERE", note: "drop rows that fail the test", tone: "pass" as const },
  { key: "GROUP BY", note: "collapse rows into buckets", tone: "pick" as const },
  { key: "HAVING", note: "drop buckets that fail", tone: "null" as const },
  { key: "SELECT", note: "compute the output columns", tone: "calc" as const },
  { key: "DISTINCT", note: "merge duplicate output rows", tone: "pick" as const },
  { key: "ORDER BY", note: "sort the final rows", tone: "calc" as const },
  { key: "LIMIT", note: "keep a window of them", tone: "bad" as const },
];

export function L8Pipeline() {
  const s = useSteps(8);
  return (
    <Figure
      title="How a SELECT actually executes — write it in one order, run it in another"
      h={318}
      footer={
        <StepBar
          {...s}
          captions={PIPE.map((p) => `${p.key} — ${p.note}`)}
          accent={C.emerald}
        />
      }
      footnote="You WRITE: SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT. It RUNS in the arrow order above. That's why ORDER BY can use aliases (SELECT ran first) and WHERE can't."
    >
      {/* write order strip */}
      <Panel x={22} y={26} w={716} h={56} title="you write it" tone="default">
        <Label x={42} y={64} text="SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT" size={10.5} fill={C.zinc4} mono />
      </Panel>
      {/* execution line */}
      <H x={22} y={116} text="the engine runs it" />
      {PIPE.map((p, i) => {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = 26 + col * 182;
        const y = 130 + row * 92;
        const on = s.step >= i;
        const active = s.step === i;
        const fg = TONE_FG[p.tone];
        return (
          <g key={p.key} opacity={on ? 1 : 0.28}>
            <rect
              x={x}
              y={y}
              width={162}
              height={44}
              rx={10}
              fill={active ? fg : "transparent"}
              fillOpacity={active ? 0.16 : 0}
              stroke={fg}
              strokeOpacity={0.65}
            />
            <Label x={x + 14} y={y + 20} text={`${i + 1}. ${p.key}`} size={11} fill={fg} bold mono />
            <Label x={x + 14} y={y + 36} text={p.note.length > 26 ? p.note.slice(0, 26) + "…" : p.note} size={8.5} fill={C.zinc5} />
            {i < 7 &&
              (col < 3 ? (
                <Arrow x1={x + 164} y1={y + 22} x2={x + 180} y2={y + 22} color={C.zinc6} w={1.2} head={6} />
              ) : (
                <Arrow
                  x1={x + 82}
                  y1={y + 46}
                  x2={x - 436}
                  y2={y + 94}
                  color={C.zinc6}
                  w={1.2}
                  curve={-46}
                  head={6}
                  dash="4 4"
                />
              ))}
          </g>
        );
      })}
      <Label x={22} y={306} text="mental model: rows are gathered → filtered → bucketed → judged → projected → deduped → sorted → trimmed" size={9.5} fill={C.zinc6} />
    </Figure>
  );
}

/* ---------------- 8.4 alias timing ---------------- */

export function L8Alias() {
  return (
    <Figure
      title="The alias rule — ORDER BY sees what SELECT made; WHERE can't"
      h={276}
      footnote="WHERE runs before SELECT, so aliases don't exist yet in the WHERE stage — use the raw column. ORDER BY runs after SELECT, so aliases work. Some engines tolerate the WHERE case; never rely on it."
    >
      <Panel x={22} y={30} w={352} h={196} title="✗ WHERE revenue > 100 — fails" tone="bad">
        <Label x={40} y={64} text="SELECT total_amount * (1 - discount)" size={9.5} fill={C.zinc3} mono />
        <Label x={40} y={80} text="       AS revenue" size={9.5} fill={C.zinc3} mono />
        <Label x={40} y={96} text="FROM order_items" size={9.5} fill={C.zinc3} mono />
        <Label x={40} y={112} text="WHERE revenue > 100" size={9.5} fill={C.rose} mono bold />
        <Label x={40} y={144} text="at WHERE time, revenue doesn't exist —" size={10} fill={C.zinc4} />
        <Label x={40} y={160} text="SELECT hasn't run yet. Repeat the expression:" size={10} fill={C.zinc4} />
        <Label x={40} y={186} text="WHERE total_amount * (1 - discount) > 100" size={9.5} fill={C.emerald} mono />
        <Label x={40} y={208} text="(NULL discount makes the whole test UNKNOWN!)" size={9.5} fill={C.amber} />
      </Panel>
      <Panel x={408} y={30} w={330} h={196} title="✓ ORDER BY revenue — works" tone="pass">
        <Label x={426} y={64} text="SELECT product_id, SUM(quantity)" size={9.5} fill={C.zinc3} mono />
        <Label x={426} y={80} text="       AS units" size={9.5} fill={C.zinc3} mono />
        <Label x={426} y={96} text="FROM order_items" size={9.5} fill={C.zinc3} mono />
        <Label x={426} y={112} text="GROUP BY product_id" size={9.5} fill={C.zinc3} mono />
        <Label x={426} y={128} text="ORDER BY units DESC" size={9.5} fill={C.emerald} mono bold />
        <Label x={426} y={158} text="GROUP BY also ran before SELECT," size={10} fill={C.zinc4} />
        <Label x={426} y={174} text="but it only groups by source columns —" size={10} fill={C.zinc4} />
        <Label x={426} y={190} text="ORDER BY is the late stage that can." size={10} fill={C.zinc4} />
      </Panel>
      <Chip x={22} y={244} text="WHERE = early (no aliases) · ORDER BY = late (aliases fine)" tone="key" size={10.5} />
    </Figure>
  );
}

/* ---------------- 8.5 bare-column pitfall ---------------- */

export function L8Pitfall() {
  return (
    <Figure
      title="Pitfall — every selected column needs a bucket or an aggregate"
      h={272}
      footnote="GROUP BY category means each output row is a bucket of categories. product_name varies inside a bucket — which one would you print? Group by BOTH columns (category, product_name) to get one row per product within category."
    >
      <Panel x={22} y={30} w={352} h={158} title="broken" tone="bad">
        <Label x={40} y={64} text="SELECT category, product_name," size={10} fill={C.zinc3} mono />
        <Label x={40} y={82} text="       SUM(price)" size={10} fill={C.zinc3} mono />
        <Label x={40} y={100} text="FROM products" size={10} fill={C.zinc3} mono />
        <Label x={40} y={118} text="GROUP BY category" size={10} fill={C.rose} mono />
        <Label x={40} y={148} text="error: product_name is neither" size={10} fill={C.rose} />
        <Label x={40} y={164} text="aggregated nor grouped" size={10} fill={C.rose} />
      </Panel>
      {/* dilemma visual */}
      <g>
        <Label x={410} y={36} text="one Audio bucket holds many product names:" size={9.5} fill={C.zinc5} />
        <rect x={410} y={44} width={120} height={30} rx={7} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.4} />
        <Label x={470} y={63} text="'USB-C Cable'" size={9.5} fill={C.zinc3} anchor="middle" mono />
        <rect x={410} y={80} width={120} height={30} rx={7} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.4} />
        <Label x={470} y={99} text="'Desk Mat'" size={9.5} fill={C.zinc3} anchor="middle" mono />
        <rect x={410} y={116} width={120} height={30} rx={7} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.4} />
        <Label x={470} y={135} text="'Webcam Stand'" size={9.5} fill={C.zinc3} anchor="middle" mono />
        <Label x={544} y={99} text="← which name" size={10} fill={C.amber} />
        <Label x={544} y={113} text="represents the" size={10} fill={C.amber} />
        <Label x={544} y={127} text="whole bucket?" size={10} fill={C.amber} />
      </g>
      <Panel x={22} y={200} w={716} h={54} title="fixed — group by the finer grain" tone="pass">
        <Label x={42} y={236} text="GROUP BY category, product_name   → one row per product, summed inside its category" size={10.5} fill={C.zinc3} mono />
      </Panel>
    </Figure>
  );
}

/* ---------------- 8.6 GROUP BY two keys (stepper) ---------------- */

export function L8MultiBuckets() {
  const s = useSteps(4);
  const rows = [
    { id: "6", city: "Dublin", status: "delivered" },
    { id: "9", city: "Dubai", status: "delivered" },
    { id: "11", city: "Dubai", status: "shipped" },
    { id: "27", city: "Dublin", status: "shipped" },
    { id: "30", city: "Dublin", status: "delivered" },
    { id: "36", city: "Dubai", status: "shipped" },
    { id: "46", city: "Dublin", status: "delivered" },
    { id: "61", city: "Dublin", status: "pending" },
    { id: "63", city: "Dubai", status: "pending" },
  ];
  const counts: Record<string, number> = {
    "Dublin|delivered": 3,
    "Dublin|pending": 1,
    "Dublin|shipped": 1,
    "Dubai|delivered": 1,
    "Dubai|pending": 1,
    "Dubai|shipped": 2,
  };
  const cities = ["Dublin", "Dubai"];
  const statuses = ["delivered", "pending", "shipped"];
  const gx = 312;
  const gy = 84;
  const cw = 100;
  const ch = 62;
  return (
    <Figure
      title="GROUP BY city, status — one bucket per combination"
      h={348}
      footer={
        <StepBar
          {...s}
          captions={[
            "nine orders stream in — grouped by two keys: city, then status",
            "key 1 splits the rows into city trays — Dublin and Dubai",
            "key 2 splits each tray again → one bucket per (city, status) pair",
            "COUNT(*) runs once per bucket → one output row per combination",
          ]}
          accent={C.violet}
        />
      }
    >
      <Tbl
        x={22}
        y={44}
        w={236}
        title="orders — 9 rows"
        headers={["id", "city", "status"]}
        colW={[44, 92, 100]}
        rows={rows.map((r) => [
          r.id,
          { t: r.city, tone: "key" as const },
          { t: r.status, tone: s.step >= 2 ? ("pick" as const) : "default" },
        ])}
        dimTable={s.step >= 1}
        size={10.5}
      />

      <Fade show={s.step >= 1} dx={-10}>
        <Arrow x1={262} y1={116} x2={304} y2={104} color={C.teal} label="key 1 · city" labelT={0.22} labelDy={-15} />
        <Arrow x1={262} y1={170} x2={304} y2={190} color={C.teal} />
      </Fade>

      {statuses.map((st, c) => (
        <Fade key={st} show={s.step >= 2} dx={0}>
          <Label
            x={gx + c * (cw + 8) + cw / 2}
            y={gy - 10}
            text={st}
            size={10}
            fill={C.violet}
            anchor="middle"
            bold
            mono
          />
        </Fade>
      ))}
      {cities.map((city, r) =>
        statuses.map((st, c) => {
          const n = counts[`${city}|${st}`];
          const x = gx + c * (cw + 8);
          const y = gy + r * (ch + 10);
          return (
            <Fade key={`${city}|${st}`} show={s.step >= 2} dx={-8}>
              <rect
                x={x}
                y={y}
                width={cw}
                height={ch}
                rx={10}
                fill={C.violetBg}
                stroke={C.violet}
                strokeOpacity={0.45}
                strokeDasharray="5 4"
              />
              <Label x={x + 12} y={y + 18} text={r === 0 ? "Dublin" : "Dubai"} size={9} fill={C.teal} mono bold />
              <Label x={x + cw - 12} y={y + 40} text={String(n)} size={20} fill={C.zinc1} anchor="end" bold mono />
              <Label x={x + 12} y={y + 46} text="orders" size={8.5} fill={C.zinc5} />
            </Fade>
          );
        }),
      )}

      <Fade show={s.step >= 3} dx={-10}>
        <Tbl
          x={640}
          y={60}
          w={98}
          title="result"
          titleTone="pick"
          headers={["city", "status", "n"]}
          colW={[36, 40, 22]}
          rows={[
            ["Dublin", "deliv.", "3"],
            ["Dublin", "pend.", "1"],
            ["Dublin", "ship.", "1"],
            ["Dubai", "deliv.", "1"],
            ["Dubai", "pend.", "1"],
            ["Dubai", "ship.", "2"],
          ]}
          size={8.5}
          rowH={22}
        />
      </Fade>

      <Chip
        x={22}
        y={318}
        text="NULL keys group together too — GROUP BY gives them one bucket of their own"
        tone="null"
        size={10}
      />
    </Figure>
  );
}

/* ---------------- 8.7 WHERE vs HAVING relay (stepper) ---------------- */
/* Ground truth: SELECT shipping_city, COUNT(*), ROUND(SUM(total_amount),2)
   FROM orders WHERE total_amount > 100 GROUP BY shipping_city
   HAVING COUNT(*) >= 4 — real orders: Dublin 4 rows / 5043.23, Dubai 5 /
   2777.39, Chicago 3 / 1037.96 (dropped). */

const RELAY_ROWS: { id: string; city: "Dublin" | "Dubai" | "Chicago"; total: string }[] = [
  { id: "6", city: "Dublin", total: "145.62" },
  { id: "27", city: "Dublin", total: "3809.09" },
  { id: "61", city: "Dublin", total: "246.76" },
  { id: "121", city: "Dublin", total: "841.76" },
  { id: "9", city: "Dubai", total: "118.15" },
  { id: "17", city: "Dubai", total: "1137.13" },
  { id: "36", city: "Dubai", total: "841.95" },
  { id: "133", city: "Dubai", total: "432.96" },
  { id: "140", city: "Dubai", total: "247.20" },
  { id: "24", city: "Chicago", total: "259.21" },
  { id: "101", city: "Chicago", total: "133.32" },
  { id: "134", city: "Chicago", total: "645.43" },
];

const RELAY_CITY_COLOR: Record<string, string> = {
  Dublin: C.violet,
  Dubai: C.amber,
  Chicago: C.sky,
};

export function L8WhereHaving() {
  const s = useSteps(5);
  const buckets = [
    { name: "Chicago", n: 3, sum: "1037.96", y: 46, pass: false },
    { name: "Dubai", n: 5, sum: "2777.39", y: 118, pass: true },
    { name: "Dublin", n: 4, sum: "5043.23", y: 190, pass: true },
  ];
  return (
    <Figure
      title="WHERE vs HAVING — a relay across the pipeline, not a rivalry"
      h={318}
      footnote="Ground truth: orders, WHERE total_amount > 100 GROUP BY shipping_city HAVING COUNT(*) >= 4. WHERE removes rows before grouping (138 of 150 die here, their totals never reach a bucket). HAVING removes whole buckets after grouping, judging each group's aggregate — it is the only place COUNT/SUM/AVG can be a filter condition."
      footer={
        <StepBar
          {...s}
          captions={[
            "150 order rows stream in — totals run from pocket change to thousands",
            "WHERE total_amount > 100 filters ROWS: 12 of 150 survive, 138 die before grouping ever happens",
            "GROUP BY shipping_city drops the 12 survivors into city buckets — Chicago 3, Dubai 5, Dublin 4",
            "HAVING COUNT(*) >= 4 judges BUCKETS: Chicago's 3-row group is dropped; Dubai and Dublin pass",
            "SELECT names each surviving bucket and prints COUNT(*) plus SUM(total_amount) — two rows out",
          ]}
          accent={C.violet}
        />
      }
    >
      {/* stage 0 — the source: 150 dim dots */}
      <H x={22} y={40} text="orders · 150 rows" />
      <g opacity={s.step >= 1 ? 0.35 : 1}>
        {Array.from({ length: 150 }, (_, i) => (
          <circle
            key={i}
            cx={24 + (i % 15) * 7.4}
            cy={52 + Math.floor(i / 15) * 8}
            r={3}
            fill={C.zinc6}
          />
        ))}
      </g>
      <Fade show={s.step >= 1} dx={0}>
        <Label x={90} y={140} text="138 dropped" size={9} fill={C.rose} anchor="middle" />
      </Fade>

      <Arrow x1={142} y1={90} x2={166} y2={90} color={C.zinc5} />

      {/* WHERE gate */}
      <g>
        <path d="M 170 64 h 54 v 38 l -13 15 h -28 l -13 -15 z" fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.8} />
        <Label x={197} y={87} text="WHERE" size={10} fill={C.emerald} anchor="middle" bold mono />
        <Label x={197} y={132} text="total_amount" size={8.5} fill={C.zinc4} anchor="middle" mono />
        <Label x={197} y={143} text="> 100" size={8.5} fill={C.zinc4} anchor="middle" mono />
        <Label x={197} y={156} text="filters ROWS" size={8.5} fill={C.emerald} anchor="middle" />
      </g>

      <Arrow x1={228} y1={90} x2={252} y2={90} color={C.emerald} />
      <Fade show={s.step >= 1} dx={8}>
        <Label x={240} y={78} text="12 survive" size={8.5} fill={C.emerald} anchor="middle" />
        {/* 12 survivors, colored by city */}
        {RELAY_ROWS.map((r, i) => (
          <circle
            key={r.id}
            cx={258 + i * 6.6}
            cy={90}
            r={4}
            fill={RELAY_CITY_COLOR[r.city]}
            fillOpacity={0.9}
          />
        ))}
      </Fade>

      <Arrow x1={330} y1={90} x2={352} y2={90} color={C.zinc5} />

      {/* GROUP BY splitter */}
      <g>
        <path d="M 356 62 L 392 62 L 374 118 Z" fill={C.violetBg} stroke={C.violet} strokeOpacity={0.7} />
        <Label x={374} y={82} text="GROUP" size={9} fill={C.violet} anchor="middle" bold mono />
        <Label x={374} y={93} text="BY" size={9} fill={C.violet} anchor="middle" bold mono />
        <Label x={374} y={132} text="shipping_city" size={8.5} fill={C.zinc4} anchor="middle" mono />
        <Label x={374} y={143} text="rows → buckets" size={8.5} fill={C.zinc4} anchor="middle" />
      </g>

      {/* buckets */}
      <Fade show={s.step >= 2} dx={10}>
        {buckets.map((b) => {
          const killed = s.step >= 3 && !b.pass;
          const col = RELAY_CITY_COLOR[b.name];
          return (
            <g key={b.name} opacity={killed ? 0.45 : 1}>
              <rect
                x={406}
                y={b.y}
                width={128}
                height={62}
                rx={9}
                fill={killed ? C.roseBg : col}
                fillOpacity={killed ? 0.1 : 0.08}
                stroke={killed ? C.rose : col}
                strokeOpacity={killed ? 0.7 : 0.5}
                strokeDasharray={killed ? undefined : "4 3"}
              />
              <Label x={418} y={b.y + 18} text={b.name} size={10} fill={killed ? C.rose : col} bold mono />
              {Array.from({ length: b.n }, (_, i) => (
                <circle key={i} cx={424 + i * 13} cy={b.y + 32} r={4} fill={killed ? C.rose : col} fillOpacity={0.8} />
              ))}
              <Label x={418} y={b.y + 52} text={`COUNT(*) = ${b.n}${killed ? " < 4" : ""}`} size={8.5} fill={C.zinc4} mono />
              {killed && (
                <Label x={540} y={b.y + 36} text="✕" size={13} fill={C.rose} anchor="middle" bold />
              )}
            </g>
          );
        })}
      </Fade>

      <Fade show={s.step >= 3} dx={0}>
        {/* HAVING gate */}
        <path d="M 546 122 h 54 v 38 l -13 15 h -28 l -13 -15 z" fill={C.violetBg} stroke={C.violet} strokeOpacity={0.85} />
        <Label x={573} y={145} text="HAVING" size={10} fill={C.violet} anchor="middle" bold mono />
        <Label x={573} y={190} text="COUNT(*) >= 4" size={8.5} fill={C.zinc4} anchor="middle" mono />
        <Label x={573} y={201} text="filters BUCKETS" size={8.5} fill={C.violet} anchor="middle" />
        {/* pass arrows from buckets through the gate to the result */}
        <Arrow x1={536} y1={77} x2={560} y2={132} color={C.zinc5} />
        <Arrow x1={536} y1={221} x2={560} y2={164} color={C.zinc5} />
      </Fade>

      {/* result */}
      <Fade show={s.step >= 4} dx={12}>
        <Arrow x1={604} y1={148} x2={618} y2={148} color={C.violet} />
        <Tbl
          x={624}
          y={96}
          w={116}
          titleTone="pick"
          title="result"
          headers={["city", "n", "SUM"]}
          colW={[48, 20, 48]}
          rowH={24}
          size={8.5}
          rows={[
            ["Dubai", "5", "2777.39"],
            ["Dublin", "4", "5043.23"],
          ]}
        />
        <Label x={698} y={204} text="2 rows out" size={9} fill={C.zinc4} anchor="middle" />
      </Fade>

      <Chip
        x={22}
        y={288}
        text="WHERE trims the crowd before buckets exist — HAVING judges each bucket after they form"
        tone="pick"
        size={10}
      />
    </Figure>
  );
}
