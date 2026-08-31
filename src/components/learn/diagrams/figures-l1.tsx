"use client";

// Lesson 1 figures — databases, tables, keys, NULL.

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
  Tbl,
} from "./kit";

/* ---------------- 1.1 anatomy of a table ---------------- */

export function L1Anatomy() {
  return (
    <Figure
      title="Anatomy of a table — rows, columns, cells, types"
      h={372}
      footnote="One table = one kind of thing. One row = one record. One column = one attribute every record has. The type of a column decides what comparisons and math mean."
    >
      <H x={22} y={34} text="customers — one row per shopper" />
      {/* column callout */}
      <Label x={370} y={62} text="one column = one attribute" size={11} fill={C.violet} anchor="middle" />
      <path d="M 346 78 v -8 h 96 v 8" fill="none" stroke={C.violet} strokeWidth={1.3} />
      {/* PK chip above id */}
      <Chip x={172} y={56} text="PRIMARY KEY" tone="key" size={9.5} />
      <path d="M 194 72 v 6" stroke={C.teal} strokeWidth={1.2} />

      <Tbl
        x={170}
        y={86}
        w={488}
        title="customers"
        headers={["id", "full_name", "city", "loyalty_tier", "lifetime_value"]}
        colW={[48, 128, 96, 104, 112]}
        hlCols={[0]}
        rows={[
          ["17", "Alice Chen", "New York", "gold", "2410.50"],
          ["21", "Bruno Silva", "São Paulo", "bronze", "310.00"],
          ["24", "Chloe Dubois", "Lyon", "silver", "980.25"],
          ["27", "Dmitri Volkov", "Berlin", { t: "NULL", tone: "null" }, "1122.80"],
          ["33", "Emma Wilson", "London", "bronze", "640.00"],
        ]}
      />
      {/* row callout */}
      <path d="M 662 134 h 10 v 28 h -10" fill="none" stroke={C.emerald} strokeWidth={1.3} />
      <Label x={678} y={143} text="one row =" size={10.5} fill={C.emerald} />
      <Label x={678} y={156} text="one customer" size={10.5} fill={C.emerald} />
      <Label x={678} y={169} text="(a record)" size={9.5} fill={C.zinc5} />
      {/* NULL annotation — kept clear of the table and the type row */}
      <Arrow x1={476} y1={270} x2={452} y2={216} color={C.amber} curve={20} />
      <Label x={484} y={286} text="NULL — no value known" size={11} fill={C.amber} />
      <Label x={484} y={300} text="not 0, not an empty string" size={10} fill={C.zinc5} />
      {/* type row */}
      {[
        ["INTEGER", 170, 48],
        ["TEXT", 218, 128],
        ["TEXT", 346, 96],
        ["TEXT", 442, 104],
        ["REAL", 546, 112],
      ].map(([t, x, w]) => (
        <Label
          key={`${t as string}-${x as number}`}
          x={(x as number) + (w as number) / 2}
          y={318}
          text={t as string}
          size={9.5}
          fill={C.sky}
          anchor="middle"
          mono
        />
      ))}
      <Label x={170} y={338} text="column types — they decide how comparisons and math behave" size={10.5} fill={C.zinc5} />
    </Figure>
  );
}

/* ---------------- 1.2 the five tables and how they relate ---------------- */

function TableCard({
  x,
  y,
  w,
  name,
  rows,
  color,
  pkNote,
}: {
  x: number;
  y: number;
  w: number;
  name: string;
  rows: string;
  color: string;
  pkNote: string;
}) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={54} rx={10} fill={C.panel} stroke={C.line} />
      <circle cx={x + 14} cy={y + 17} r={4} fill={color} />
      <Label x={x + 25} y={y + 21} text={name} size={12} fill={C.zinc1} bold mono />
      <Label x={x + 14} y={y + 38} text={rows} size={9.5} fill={C.zinc5} />
      <Label x={x + 14} y={y + 50} text={pkNote} size={9} fill={C.zinc6} mono />
    </g>
  );
}

export function L1Relations() {
  return (
    <Figure
      title="The storefront map — five tables, five relationships (1 — N)"
      h={448}
      footnote="Arrows read 'one row here can point at many rows there'. The red dashed arrow is real damage: 6 orders point at customer_id 999, a customer that does not exist. You'll detect exactly this with SQL in later modules."
    >
      <Arrow x1={182} y1={207} x2={296} y2={197} color={C.sky} label="1 — N" />
      <Label x={239} y={176} text="customer_id" size={9} fill={C.zinc5} anchor="middle" mono />
      <Arrow x1={422} y1={197} x2={556} y2={197} color={C.violet} label="1 — N" />
      <Label x={489} y={182} text="order_id" size={9} fill={C.zinc5} anchor="middle" mono />
      <Arrow x1={494} y1={316} x2={608} y2={228} color={C.emerald} curve={30} label="1 — N" />
      <Label x={586} y={290} text="product_id" size={9} fill={C.zinc5} anchor="middle" mono />
      <Arrow x1={426} y1={347} x2={254} y2={347} color={C.amber} label="1 — N" />
      <Label x={340} y={362} text="product_id" size={9} fill={C.zinc5} anchor="middle" mono />
      <Arrow x1={112} y1={238} x2={186} y2={316} color={C.rose} curve={26} label="1 — N" />
      <Label x={102} y={292} text="customer_id" size={9} fill={C.zinc5} anchor="middle" mono />
      {/* broken FK */}
      <Arrow x1={240} y1={224} x2={180} y2={240} color={C.rose} dash="4 4" curve={24} />
      <Label x={252} y={244} text="6 broken rows → id 999 ∅" size={9.5} fill={C.rose} halo />

      <TableCard x={48} y={180} w={134} name="customers" rows="40 rows · the people" color={C.teal} pkNote="PK: id" />
      <TableCard x={300} y={170} w={122} name="orders" rows="150 rows · checkouts" color={C.sky} pkNote="PK: id" />
      <TableCard x={560} y={170} w={132} name="order_items" rows="328 rows · order lines" color={C.violet} pkNote="PK: id" />
      <TableCard x={426} y={320} w={122} name="products" rows="32 rows · the catalog" color={C.emerald} pkNote="PK: id" />
      <TableCard x={130} y={320} w={122} name="reviews" rows="110 rows · star ratings" color={C.amber} pkNote="PK: id" />

      <Panel x={190} y={32} w={540} h={80} title="How to read this map" tone="key">
        <Label x={210} y={74} text="order_items is the bridge: it links an order to each product in it —" size={10.5} fill={C.zinc4} />
        <Label x={210} y={90} text="that's how one checkout can contain many products (and vice versa)." size={10.5} fill={C.zinc4} />
      </Panel>
      <Legend
        x={44}
        y={430}
        items={[
          { label: "declared relationship", color: C.sky },
          { label: "broken reference (orphan)", color: C.rose },
        ]}
      />
    </Figure>
  );
}

/* ---------------- 1.3 PK → FK pointer ---------------- */

export function L1PkFk() {
  return (
    <Figure
      title="Primary key → foreign key — how a row points at exactly one other row"
      h={352}
      footnote="customers.id is the primary key (unique, never NULL). orders.customer_id is a foreign key: a customer's id copied into another table. Copy the id, and you've created a precise, permanent link."
    >
      <Tbl
        x={40}
        y={70}
        w={210}
        title="customers"
        headers={["id (PK)", "full_name"]}
        colW={[70, 140]}
        rows={[
          [{ t: "17", tone: "pass" }, "Alice Chen"],
          [{ t: "42", tone: "pass" }, "Bruno Silva"],
          ["48", "Chloe Dubois"],
        ]}
      />
      <Tbl
        x={452}
        y={70}
        w={252}
        title="orders"
        headers={["id", "customer_id (FK)", "total_amount"]}
        colW={[52, 116, 84]}
        rows={[
          ["1001", { t: "42", tone: "pass" }, "84.50"],
          ["1002", { t: "17", tone: "pass" }, "120.00"],
          ["1003", { t: "NULL", tone: "null" }, "31.20"],
          ["1004", { t: "999", tone: "bad" }, "59.99"],
        ]}
      />
      {/* pointer arrows */}
      <Arrow x1={500} y1={98} x2={262} y2={122} color={C.emerald} curve={26} label="42 → one exact customer" />
      <Arrow x1={500} y1={122} x2={262} y2={98} color={C.emerald} curve={26} />
      {/* 999 orphan */}
      <Arrow x1={560} y1={174} x2={352} y2={250} color={C.rose} dash="4 4" curve={30} />
      <Panel x={196} y={244} w={340} h={84} title="The 999 row" tone="bad">
        <Label x={214} y={288} text="points at a customer that does not exist." size={10.5} fill={C.zinc4} />
        <Label x={214} y={304} text="An orphan — nothing stops it, so queries must expect it." size={10.5} fill={C.zinc4} />
      </Panel>
      <Label x={544} y={244} text="NULL → order with no known buyer" size={10} fill={C.amber} />
      <Label x={544} y={258} text="(guest checkout, we guess)" size={9.5} fill={C.zinc5} />
      <Chip x={40} y={250} text="PK: unique, never NULL" tone="key" size={10} />
      <Chip x={40} y={274} text="FK: another table's PK" tone="pass" size={10} />
    </Figure>
  );
}

/* ---------------- 1.4 where NULL lives ---------------- */

export function L1Nulls() {
  return (
    <Figure
      title="NULL — the empty slot in a column"
      h={318}
      footnote="NULL means 'no value is known'. It behaves differently from 0 and '' in filters, sorts and aggregates — so much so that Lesson 4 is entirely about surviving it."
    >
      <Tbl
        x={40}
        y={54}
        w={330}
        title="customers · phone column"
        headers={["full_name", "phone"]}
        colW={[130, 200]}
        rows={[
          ["Alice Chen", "+1 212 555 0102"],
          ["Bruno Silva", { t: "NULL", tone: "null" }],
          ["Chloe Dubois", "+33 6 12 34 56 78"],
          ["Dmitri Volkov", "(030) 1234-567"],
          ["Emma Wilson", { t: "NULL", tone: "null" }],
          ["Farid Nasser", "+971 50 123 4567"],
          ["Grace Kim", { t: "NULL", tone: "null" }],
          ["Hiro Tanaka", "090-1234-5678"],
        ]}
      />
      <Arrow x1={280} y1={126} x2={418} y2={102} color={C.amber} curve={18} />
      <Panel x={424} y={54} w={296} h={116} title="What NULL is NOT" tone="null">
        <g>
          <Mark x={444} y={84} ok={false} />
          <Label x={458} y={88} text="zero — a real number" size={11} fill={C.zinc4} />
          <Mark x={444} y={110} ok={false} />
          <Label x={458} y={114} text="'' — an empty string they typed" size={11} fill={C.zinc4} />
          <Mark x={444} y={136} ok={false} color={C.rose} />
          <Label x={458} y={140} text="'unknown' spelled as text" size={11} fill={C.zinc4} />
        </g>
      </Panel>
      <Panel x={424} y={186} w={296} h={104} title="What NULL IS" tone="pass">
        <Label x={444} y={216} text="an empty slot: no value was given." size={11} fill={C.zinc4} />
        <Label x={444} y={236} text="Bruno, Emma and Grace never shared" size={11} fill={C.zinc4} />
        <Label x={444} y={256} text="a number — the slot stays empty." size={11} fill={C.zinc4} />
      </Panel>
      <Fade show>
        <Chip x={40} y={288} text="in this DB: phone 32% NULL · email 7.5% NULL" tone="null" size={10} />
      </Fade>
    </Figure>
  );
}
