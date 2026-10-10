import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const show = (label: string, sql: string) => {
  try { console.log(`--- ${label}\n${JSON.stringify(db.query(sql).all())}`); }
  catch (e) { console.log(`--- ${label}\nERR: ${e instanceof Error ? e.message : String(e)}`); }
};
show("P14a filled 39", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<b.id");
show("P15c = active ordered", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id WHERE a.active=1 AND b.active=1");
show("P16a filled census", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.category=b.category AND a.id<b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P18a APAC both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='APAC' AND a.active=1 AND b.active=1");
show("P18b US both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='US' AND a.active=1 AND b.active=1");
show("P19a OR rollcall", "SELECT a.name AS first_seat, b.name AS second_seat FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=0 OR b.active=0 ORDER BY first_seat ASC, second_seat");
show("P19c <> rollcall", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=0 OR b.active=0");
show("P19d = rollcall", "SELECT a.name AS first_seat, b.name AS second_seat FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id WHERE a.active=0 OR b.active=0");
show("P20c flag2", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=2 AND b.active=0");
show("P20d < mixed a1b0", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=1 AND b.active=0");
show("P488x <> EU both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.region='EU' AND a.active=1 AND b.active=1");
show("P488y = EU both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id WHERE a.region='EU' AND a.active=1 AND b.active=1");
show("P488z <= EU both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE a.region='EU' AND a.active=1 AND b.active=1");
show("P492x != cross", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id!=b.id AND a.region<>b.region");
db.close(); console.log("done3");
