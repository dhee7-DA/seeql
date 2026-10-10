import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const show = (label: string, sql: string) => {
  try { console.log(`--- ${label}\n${JSON.stringify(db.query(sql).all())}`); }
  catch (e) { console.log(`--- ${label}\nERR: ${e instanceof Error ? e.message : String(e)}`); }
};
show("P2e EU no-guard grid", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region WHERE a.region='EU'");
show("P14d id thread", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.id=b.region AND a.id<b.id");
show("P14e <>", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<>b.id");
show("P14f =", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id=b.id");
show("P14g <=", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<=b.id");
show("P19chain <> in OR slot", "SELECT a.name, b.name FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active = 0 <> b.active = 0 ORDER BY a.name, b.name");
show("P19chain = in OR slot", "SELECT a.name, b.name FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active = 0 = b.active = 0 ORDER BY a.name, b.name");
show("P7chain = in AND slot", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<b.id WHERE a.price < 100 = b.price < 100");
show("P15e a0 ordered", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=0 AND b.active=1");
show("P15f a2 ordered", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=2 AND b.active=1");
show("P18c a.active dup", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='EU' AND a.active=1 AND a.active=1");
show("P18d bare1", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='EU' AND 1=1 AND b.active=1");
show("P20b b.active slot3", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=1 AND b.active=b.active");
show("P20a b.active slot2", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=b.active AND b.active=0");
show("P16b <> census", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.category=b.category AND a.id<>b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P16c = census", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.category=b.category AND a.id=b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P16d <= census", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<=b.id");
show("P16e supplier thread", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.category AND a.id<b.id");
show("P16f price thread", "SELECT COUNT(*) FROM products a JOIN products b ON a.price=b.category AND a.id<b.id");
show("P92x region>= with a<b", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.region>=b.region");
show("P92y region> with a<b", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.region>b.region");
show("P493x a-b gap order", "SELECT a.category, a.name AS first_item, b.name AS second_item, a.price - b.price AS gap FROM products a JOIN products b ON a.category=b.category AND a.id<b.id ORDER BY gap DESC");
show("P493y sum gap order", "SELECT a.name, b.name, b.price + a.price AS gap FROM products a JOIN products b ON a.category=b.category AND a.id<b.id ORDER BY gap DESC");
show("P493z = guard", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id=b.id");
show("P493w <= guard", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<=b.id");
show("P485x APAC <=", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE a.region='APAC'");
show("P486x <= flag", "SELECT a.name AS vendor_a, a.rating AS rating_a, b.name AS vendor_b, b.rating AS rating_b FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<=b.id WHERE (a.rating + b.rating) / 2 > 4.5");
show("P486y <> flag", "SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<>b.id WHERE (a.rating + b.rating) / 2 > 4.5");
show("P486z = flag", "SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id=b.id WHERE (a.rating + b.rating) / 2 > 4.5");
show("P486w 3.9", "SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<b.id WHERE (a.rating + b.rating) / 2 > 3.9");
show("P491x city thread grouped", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.city=b.region AND a.id<>b.id");
show("P495x a.id isnull full", "SELECT a.name FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.id IS NULL");
db.close(); console.log("done2");
