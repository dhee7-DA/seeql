"use client";

// Lesson 7 figures — aggregates: collapse machine, COUNT trio, mixing trap.

import {
  Arrow,
  C,
  Chip,
  Fade,
  Figure,
  Gate,
  H,
  Label,
  Panel,
  Reveal,
  StepBar,
  Tbl,
  useSteps,
} from "./kit";

/* ---------------- 7.1 the collapse machine ---------------- */

export function L7Collapse() {
  const vals = ["84.50", "120.00", "31.20", "299.00", "61.00", "245.50", "12.00", "198.00"];
  return (
    <Figure
      title="An aggregate collapses many rows into one value"
      h={300}
      footnote="SUM/AVG/MIN/MAX/COUNT each read the whole column and return a single number. Five different questions, same input. The input rows don't disappear — only the answer is collapsed."
    >
      <H x={22} y={30} text="total_amount — 8 known values" />
      {vals.map((t, i) => (
        <g key={i}>
          <rect
            x={22 + (i % 4) * 78}
            y={42 + Math.floor(i / 4) * 34}
            width={66}
            height={26}
            rx={7}
            fill={C.panelSoft}
            stroke={C.line}
          />
          <Label x={55 + (i % 4) * 78} y={59 + Math.floor(i / 4) * 34} text={t} size={10.5} fill={C.zinc2} anchor="middle" mono />
        </g>
      ))}
      {/* fan into 5 badges */}
      {["COUNT", "SUM", "AVG", "MIN", "MAX"].map((fn, i) => (
        <g key={fn}>
          <Arrow
            x1={330}
            y1={92}
            x2={420}
            y2={58 + i * 44}
            color={C.emerald}
            curve={14}
          />
          <rect x={426} y={44 + i * 44} width={148} height={32} rx={8} fill={C.emeraldBg} stroke={C.emerald} strokeOpacity={0.5} />
          <Label x={444} y={64 + i * 44} text={fn} size={11} fill={C.emerald} bold mono />
          <Label
            x={558}
            y={64 + i * 44}
            text={["8", "1051.20", "131.40", "12.00", "299.00"][i]}
            size={11}
            fill={C.zinc1}
            anchor="end"
            mono
          />
        </g>
      ))}
      <Panel x={600} y={44} w={138} h={218} title="answers" tone="pass">
        <Label x={612} y={76} text="how many?" size={9.5} fill={C.zinc5} />
        <Label x={612} y={120} text="how much total?" size={9.5} fill={C.zinc5} />
        <Label x={612} y={164} text="typical value?" size={9.5} fill={C.zinc5} />
        <Label x={612} y={208} text="smallest /" size={9.5} fill={C.zinc5} />
        <Label x={612} y={222} text="biggest?" size={9.5} fill={C.zinc5} />
      </Panel>
      <Chip x={22} y={272} text="aggregate = vertical: many rows ↓ one value" tone="pass" size={10} />
    </Figure>
  );
}

/* ---------------- 7.2 the COUNT trio ---------------- */

export function L7Counts() {
  const cells = [
    { t: "DE" },
    { t: "DE" },
    { t: "NULL" },
    { t: "FR" },
    { t: "DE" },
    { t: "NULL" },
    { t: "IT" },
    { t: "FR" },
    { t: "IT" },
    { t: "DE" },
  ];
  return (
    <Figure
      title="COUNT(*), COUNT(col), COUNT(DISTINCT col) — three different questions"
      h={280}
      footnote="Same column, three answers. COUNT(*) counts rows — NULLs included. COUNT(country) counts known values only. COUNT(DISTINCT country) counts unique known values. On our real data: 150 orders · 144 with a customer · 42 distinct customers."
    >
      <H x={22} y={30} text="customer_id — 10 order rows" />
      {cells.map((c, i) => (
        <g key={i}>
          <rect
            x={22 + i * 70}
            y={42}
            width={58}
            height={30}
            rx={7}
            fill={c.t === "NULL" ? C.amberBg : C.panelSoft}
            stroke={c.t === "NULL" ? C.amber : C.line}
          />
          <Label
            x={51 + i * 70}
            y={61}
            text={c.t}
            size={10.5}
            fill={c.t === "NULL" ? C.amber : C.zinc2}
            anchor="middle"
            mono
            italic={c.t === "NULL"}
          />
        </g>
      ))}
      <Label x={22} y={96} text="2 NULL cells (guest checkouts) · duplicates: DE ×4, FR ×2, IT ×2" size={10} fill={C.zinc5} />
      {/* three tallies */}
      {[
        { label: "COUNT(*)", value: "10", note: "rows + NULLs", tone: "key" as const },
        { label: "COUNT(customer_id)", value: "8", note: "skips 2 NULLs", tone: "pass" as const },
        { label: "COUNT(DISTINCT customer_id)", value: "3", note: "DE, FR, IT", tone: "pick" as const },
      ].map((t, i) => (
        <g key={t.label}>
          <rect x={22} y={116 + i * 52} width={430} height={40} rx={9} fill={C.panel} stroke={C.lineSoft} />
          <Label x={40} y={141 + i * 52} text={t.label} size={11.5} fill={C.zinc2} mono />
          <Label x={330} y={141 + i * 52} text="→" size={11} fill={C.zinc6} mono />
          <Label x={408} y={142 + i * 52} text={t.value} size={14} fill={C.emerald} anchor="end" bold mono />
          <Label x={462} y={141 + i * 52} text={t.note} size={10} fill={C.zinc5} />
        </g>
      ))}
      <Panel x={540} y={116} w={204} h={132} title="analyst reflex" tone="null">
        <Label x={556} y={146} text="COUNT(*) - COUNT(col) = 2" size={10.5} fill={C.amber} mono />
        <Label x={556} y={168} text="→ instantly quantifies" size={10} fill={C.zinc4} />
        <Label x={556} y={184} text="the missing values in" size={10} fill={C.zinc4} />
        <Label x={556} y={200} text="any column" size={10} fill={C.zinc4} />
        <Label x={556} y={222} text="AVG divides by COUNT(col)," size={10} fill={C.zinc5} />
        <Label x={556} y={238} text="not by COUNT(*) — know why" size={10} fill={C.zinc5} />
      </Panel>
      <Chip x={22} y={262} text="real numbers: 150 orders · 144 known buyers · 42 distinct buyers" tone="key" size={10} />
    </Figure>
  );
}

/* ---------------- 7.3 mixing rows and aggregates ---------------- */

export function L7Mix() {
  return (
    <Figure
      title="Can't mix a bare column with an aggregate — yet"
      h={282}
      footnote="SUM(total_amount) is one value for the whole table; order_date is 150 different values. Which date would the single row even show? The engine refuses. Lesson 8 resolves this properly with GROUP BY."
    >
      <Panel x={22} y={30} w={430} h={122} title="the illegal query" tone="bad">
        <Label x={42} y={64} text="SELECT order_date, SUM(total_amount)" size={10.5} fill={C.zinc3} mono />
        <Label x={42} y={82} text="FROM orders" size={10.5} fill={C.zinc3} mono />
        <Label x={42} y={100} text="→ error: order_date must appear in GROUP BY" size={10.5} fill={C.rose} />
        <Label x={42} y={128} text="or be used in an aggregate" size={10.5} fill={C.rose} />
      </Panel>
      <Panel x={486} y={30} w={252} h={122} title="the engine's dilemma" tone="null">
        <Label x={502} y={62} text="150 dates" size={11} fill={C.amber} mono />
        <Label x={502} y={82} text="1 sum" size={11} fill={C.emerald} mono />
        <Label x={502} y={110} text="which date pairs with" size={10} fill={C.zinc4} />
        <Label x={502} y={126} text="the single sum? No answer." size={10} fill={C.zinc4} />
      </Panel>
      {/* valid contrast */}
      <Panel x={22} y={168} w={716} h={80} title="both of these are legal" tone="pass">
        <Label x={42} y={200} text="SELECT SUM(total_amount) FROM orders                    → one row: the grand total" size={10.5} fill={C.zinc3} mono />
        <Label x={42} y={226} text="SELECT order_date, SUM(total_amount) FROM orders GROUP BY order_date → one row per date" size={10.5} fill={C.zinc3} mono />
      </Panel>
      <Label x={22} y={268} text="rule of thumb: every selected column is either inside an aggregate, or in the GROUP BY — no exceptions" size={10.5} fill={C.amber} />
    </Figure>
  );
}

/* ---------------- 7.4 aggregates over an empty set (stepper) ---------------- */

export function L7EmptySet() {
  const s = useSteps(3);
  return (
    <Figure
      title="when the filter matches zero rows — COUNT says 0, the others say NULL"
      h={322}
      footer={
        <StepBar
          {...s}
          captions={[
            "the filter matches 0 of 150 orders — yet the query still returns ONE row (an aggregate over nothing)",
            "COUNT(*) over zero rows = 0 — the one aggregate with a real empty answer",
            "SUM / AVG / MIN / MAX over zero rows = NULL — wrap with COALESCE(…, 0) when you need a visible zero",
          ]}
          accent={C.rose}
        />
      }
    >
      <Chip x={22} y={40} text="orders — 150 rows" size={10} />
      <Arrow x1={160} y1={50} x2={196} y2={50} color={C.zinc5} />
      <Gate x={200} y={28} label="WHERE" sub="total_amount > 20000" />
      <Arrow x1={262} y1={50} x2={310} y2={50} color={C.rose} />
      <Chip x={316} y={40} text="0 rows survive" tone="bad" size={10.5} />

      <Fade show={s.step >= 1}>
        <Arrow x1={370} y1={70} x2={272} y2={176} color={C.emerald} curve={24} />
        <Arrow x1={372} y1={76} x2={548} y2={176} color={C.amber} curve={-24} />
      </Fade>

      <Panel x={140} y={180} w={240} h={98} title="COUNT(*)" tone="pass">
        <Label x={260} y={242} text="0" size={30} fill={C.emerald} anchor="middle" bold mono />
        <Label x={260} y={266} text="0 is a real, honest answer" size={9.5} fill={C.zinc5} anchor="middle" />
      </Panel>

      <Panel x={420} y={180} w={240} h={98} title="SUM(total_amount)" tone="null">
        <Fade show={s.step >= 2}>
          <Label x={540} y={242} text="NULL" size={26} fill={C.amber} anchor="middle" bold mono italic />
          <Label x={540} y={266} text="nothing arrived to sum" size={9.5} fill={C.zinc5} anchor="middle" />
        </Fade>
      </Panel>

      <Reveal show={s.step >= 2}>
        <Chip
          x={22}
          y={294}
          text="fix: COALESCE(SUM(total_amount), 0) → 0"
          tone="pick"
          size={10.5}
        />
      </Reveal>
    </Figure>
  );
}
