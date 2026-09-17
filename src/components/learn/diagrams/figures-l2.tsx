"use client";

// Lesson 2 figures — SELECT & FROM: projection, *, expressions.

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

/* ---------------- 2.1 the projection machine (stepper) ---------------- */

export function L2Projection() {
  const s = useSteps(3);
  const picked = s.step >= 1;
  const out = s.step >= 2;
  return (
    <Figure
      title="SELECT is a column picker — projection keeps the rows, trims the columns"
      h={330}
      footer={
        <StepBar
          {...s}
          captions={[
            "customers has 10 columns — more than we need",
            "SELECT full_name, city, loyalty_tier → pick three columns, in the order written",
            "Every row survives; only the chosen columns come out — in that exact order",
          ]}
        />
      }
    >
      <H x={22} y={30} text="FROM customers — 40 rows × 10 columns" />
      <Tbl
        x={22}
        y={44}
        w={330}
        title="customers"
        headers={["id", "full_name", "city", "loyalty_tier", "+6 more"]}
        colW={[38, 96, 68, 84, 44]}
        rows={[
          ["17", "Alice Chen", "New York", "gold", "…"],
          ["21", "Bruno Silva", "São Paulo", "bronze", "…"],
          ["24", "Chloe Dubois", "Lyon", "silver", "…"],
          ["27", "Dmitri Volkov", "Berlin", "NULL", "…"],
          ["33", "Emma Wilson", "London", "bronze", "…"],
        ]}
        hlCols={picked ? [1, 2, 3] : []}
        dimTable={picked}
      />
      {/* gate */}
      <path
        d={`M 400 120 h 66 l -16 34 h -34 z`}
        fill={C.emeraldBg}
        stroke={C.emerald}
        strokeOpacity={0.8}
      />
      <Label x={425} y={142} text="SELECT" size={11} fill={C.emerald} anchor="middle" bold mono />
      <Label x={433} y={176} text="full_name, city," size={10} fill={C.zinc4} anchor="middle" mono />
      <Label x={433} y={189} text="loyalty_tier" size={10} fill={C.zinc4} anchor="middle" mono />
      <Arrow x1={356} y1={150} x2={396} y2={150} color={C.zinc5} />
      <Arrow x1={470} y1={150} x2={510} y2={150} color={C.emerald} />
      <Fade show={out} dx={12}>
        <Tbl
          x={514}
          y={82}
          w={224}
          titleTone="pass"
          title="result — same 40 rows"
          headers={["full_name", "city", "loyalty_tier"]}
          colW={[92, 76, 56]}
          rows={[
            ["Alice Chen", "New York", "gold"],
            ["Bruno Silva", "São Paulo", "bronze"],
            ["Chloe Dubois", "Lyon", "silver"],
            ["Dmitri Volkov", "Berlin", "NULL"],
            ["Emma Wilson", "London", "bronze"],
          ]}
          size={10.5}
        />
      </Fade>
      <Fade show={picked} dx={0}>
        <Label x={400} y={250} text="unpicked columns are dropped — not deleted," size={10.5} fill={C.zinc5} anchor="middle" />
        <Label x={400} y={265} text="just left out of this result" size={10.5} fill={C.zinc5} anchor="middle" />
      </Fade>
      <Chip x={22} y={296} text="projection: rows × chosen columns" tone="pass" size={10} />
    </Figure>
  );
}

/* ---------------- 2.2 what * means ---------------- */

export function L2Star() {
  return (
    <Figure
      title="SELECT * — every column, in schema order"
      h={280}
      footnote="* is shorthand for 'all columns'. Handy for peeking, wasteful for reports: it drags wide columns over the wire and breaks when the schema changes. Prefer naming columns in real analysis."
    >
      <H x={22} y={30} text="SELECT * FROM customers" />
      <Chip x={234} y={16} text="*" tone="pick" solid size={13} />
      <Arrow x1={246} y1={34} x2={246} y2={52} color={C.violet} />
      <Tbl
        x={22}
        y={58}
        w={710}
        title="result"
        headers={["id", "full_name", "email", "phone", "city", "country", "signup_date", "loyalty_tier", "lifetime_value", "is_active"]}
        colW={[40, 92, 118, 84, 72, 54, 70, 66, 74, 40]}
        rows={[
          ["17", "Alice Chen", "alice@…", "+1 212…", "New York", "US", "2024-01-…", "gold", "2410.50", "1"],
        ]}
        size={9.5}
      />
      <Reveal show>
        <Label x={22} y={160} text="all 10 columns come back — the same order the table was created with" size={11} fill={C.zinc4} />
        <Label x={22} y={188} text="SELECT full_name, city  ≠  SELECT city, full_name" size={12} fill={C.violet} bold mono />
        <Label x={22} y={208} text="the output follows YOUR order, not the table's" size={10.5} fill={C.zinc5} />
        <Label x={22} y={244} text="running SELECT * on a 328-row table still shows every column — wide and slow to read" size={10.5} fill={C.amber} />
      </Reveal>
    </Figure>
  );
}

/* ---------------- 2.3 SELECT computes ---------------- */

export function L2Expressions() {
  return (
    <Figure
      title="SELECT doesn't just copy — it can calculate new columns"
      h={300}
      footnote="Each output cell is computed per row: columns, literals and math mix freely. AS renames the result — a label only, it does not change the data."
    >
      <H x={22} y={30} text="SELECT product_name, price, price * 0.9 AS sale_price FROM products" />
      <Tbl
        x={22}
        y={44}
        w={252}
        title="products"
        headers={["product_name", "price"]}
        colW={[140, 112]}
        rows={[
          ["USB-C Cable", "12.00"],
          ["Desk Mat", "28.50"],
          ["Webcam Stand", "19.99"],
        ]}
      />
      {/* compute node */}
      <g>
        <rect x={330} y={92} width={104} height={72} rx={10} fill={C.skyBg} stroke={C.sky} strokeOpacity={0.6} />
        <Label x={382} y={116} text="× 0.9" size={13} fill={C.sky} anchor="middle" bold mono />
        <Label x={382} y={134} text="per row" size={9.5} fill={C.zinc5} anchor="middle" />
      </g>
      <Arrow x1={278} y1={116} x2={326} y2={122} color={C.sky} />
      <Arrow x1={438} y1={122} x2={486} y2={122} color={C.sky} />
      <Tbl
        x={490}
        y={68}
        w={248}
        titleTone="calc"
        title="result"
        headers={["product_name", "price", "sale_price"]}
        colW={[112, 62, 74]}
        rows={[
          ["USB-C Cable", "12.00", { t: "10.80", tone: "calc" }],
          ["Desk Mat", "28.50", { t: "25.65", tone: "calc" }],
          ["Webcam Stand", "19.99", { t: "17.99", tone: "calc" }],
        ]}
        size={10}
      />
      <Label x={330} y={206} text="an expression can reference columns, literals, or both:" size={10.5} fill={C.zinc4} />
      <Chip x={330} y={218} text="price * 0.9" tone="calc" size={10} />
      <Chip x={440} y={218} text="price - cost" tone="calc" size={10} />
      <Chip x={556} y={218} text="price * 1 + 0" tone="dim" size={10} />
      <Label x={22} y={258} text="AS sale_price" size={11} fill={C.violet} bold mono />
      <Label x={142} y={258} text="— alias: names the new column in the output (and in ORDER BY)" size={10.5} fill={C.zinc5} />
      <Label x={22} y={282} text="the underlying table never changes — SELECT only shapes the result" size={10.5} fill={C.zinc5} />
    </Figure>
  );
}

/* ---------------- 2.4 the result is a brand-new table ---------------- */

export function L2ResultSet() {
  return (
    <Figure
      title="every query hands you back a brand-new table"
      h={252}
      footnote="The result grid is a genuine table — rows × columns. It inherits nothing: column order is your SELECT order, column names are your AS aliases, and rows are whatever survived FROM/WHERE. You can sort it, filter it, or feed it straight into the next query."
    >
      <Tbl
        x={22}
        y={44}
        w={248}
        title="customers"
        headers={["full_name", "city", "tier"]}
        colW={[104, 88, 56]}
        rows={[
          ["Alice Chen", "New York", "BRONZE"],
          ["Bruno Silva", "São Paulo", { t: "silver", tone: "dim" }],
          ["Keiko Sato", "Nagoya", { t: "gold", tone: "dim" }],
        ]}
        hlCols={[0, 1]}
        size={10.5}
      />
      <Label x={146} y={196} text="3 of 40 rows shown" size={9.5} fill={C.zinc6} anchor="middle" />

      <Panel x={302} y={58} w={172} h={104}>
        <Label x={318} y={82} text="SELECT full_name" size={9.5} fill={C.zinc2} mono />
        <Label x={318} y={98} text="  AS customer," size={9.5} fill={C.violet} mono />
        <Label x={318} y={114} text="  city AS home_city" size={9.5} fill={C.violet} mono />
        <Label x={318} y={130} text="FROM customers" size={9.5} fill={C.zinc2} mono />
        <Label x={318} y={150} text="rename with AS ↑" size={8.5} fill={C.zinc6} />
      </Panel>

      <Arrow x1={274} y1={110} x2={298} y2={110} color={C.zinc5} label="rows in" labelT={0.5} labelDy={-8} />
      <Arrow x1={478} y1={110} x2={502} y2={110} color={C.violet} label="shaped" labelT={0.5} labelDy={-8} />

      <Tbl
        x={508}
        y={44}
        w={230}
        title="result — a new table"
        titleTone="pick"
        headers={["customer", "home_city"]}
        colW={[115, 115]}
        rows={[
          ["Alice Chen", "New York"],
          ["Bruno Silva", "São Paulo"],
          ["Keiko Sato", "Nagoya"],
        ]}
        size={10.5}
      />

      <Chip x={22} y={206} text="column order = your SELECT order" tone="calc" size={10} />
      <Chip x={268} y={206} text="column names = your AS aliases" tone="pick" size={10} />
      <Chip x={508} y={206} text="rows = whatever survived FROM" tone="key" size={10} />
    </Figure>
  );
}
