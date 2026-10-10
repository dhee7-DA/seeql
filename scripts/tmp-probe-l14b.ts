// TEMP probe for l14b case authoring — deleted after use.
import { Database } from "bun:sqlite";
const db = new Database("db/custom.db", { readonly: true });
const q = (sql: string) => {
  try {
    return db.query(sql).all();
  } catch (e) {
    return `ERR: ${e instanceof Error ? e.message : String(e)}`;
  }
};
const show = (label: string, sql: string) => {
  const r = q(sql);
  console.log(`--- ${label}`);
  console.log(typeof r === "string" ? r : JSON.stringify(r));
};

// P1 roster
show("P1 roster", "SELECT id, name, region, city, active FROM customers ORDER BY id");

// P2 EU ladder
show("P2a EU <=", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE a.region='EU'");
show("P2b EU <>", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.region='EU'");
show("P2c EU =", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id WHERE a.region='EU'");
show("P2d EU <", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='EU'");

// P4 cross-region
show("P4a cross <", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.region<>b.region");
show("P4b cross <>", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<>b.id AND a.region<>b.region");
show("P4c cross =", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id=b.id AND a.region<>b.region");
show("P4d cross <=", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<=b.id AND a.region<>b.region");
show("P4e region< (a<b)", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.region<b.region");
show("P4f region<= (a<b)", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.region<=b.region");
show("P4g city thread <>", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.city<>b.city");
show("P4h id thread <>", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.id<b.id AND a.id<>b.region");

// P5 status splits
show("P5a mixed deduped", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active<>b.active");
show("P5b mixed ordered a1 b0", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=1 AND b.active=0");
show("P5c mixed < a1 b0", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=1 AND b.active=0");
show("P5d both-inactive", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=0 AND b.active=0");
show("P5e both-active deduped", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=1 AND b.active=1");
show("P5f both-active ordered", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=1 AND b.active=1");
show("P5g mixed ordered a0 b1", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=0 AND b.active=1");
show("P5h a.active=b.active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=b.active");

// P6 supplier rating pair
show("P6a filled", "SELECT a.name AS vendor_a, a.rating AS rating_a, b.name AS vendor_b, b.rating AS rating_b FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<b.id WHERE (a.rating+b.rating)/2 > 4.5");
show("P6b = guard", "SELECT a.name AS vendor_a, b.name AS vendor_b FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id=b.id WHERE (a.rating+b.rating)/2 > 4.5");
show("P6c <= guard", "SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<=b.id WHERE (a.rating+b.rating)/2 > 4.5");
show("P6d >4", "SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<b.id WHERE (a.rating+b.rating)/2 > 4");
show("P6e >4.7", "SELECT COUNT(*) FROM suppliers a JOIN suppliers b ON a.region=b.region AND a.id<b.id WHERE (a.rating+b.rating)/2 > 4.7");

// P7 budget shelf pairs
show("P7a filled AND", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<b.id WHERE a.price<100 AND b.price<100");
show("P7b OR", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<b.id WHERE a.price<100 OR b.price<100");
show("P7c supplier thread", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.category AND a.id<b.id WHERE a.price<100 AND b.price<100");
show("P7d <> guard", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<>b.id WHERE a.price<100 AND b.price<100");
show("P7e = guard", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id=b.id WHERE a.price<100 AND b.price<100");
show("P7f <= guard", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<=b.id WHERE a.price<100 AND b.price<100");

// P8 ordered region weights
show("P8a <> grouped", "SELECT a.region, COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id GROUP BY a.region ORDER BY COUNT(*) DESC, a.region");
show("P8b < grouped", "SELECT a.region, COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id GROUP BY a.region ORDER BY COUNT(*) DESC, a.region");
show("P8c = grouped", "SELECT a.region, COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id GROUP BY a.region ORDER BY COUNT(*) DESC, a.region");
show("P8d <= grouped", "SELECT a.region, COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id GROUP BY a.region ORDER BY COUNT(*) DESC, a.region");
show("P8e city thread", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.city=b.region AND a.id<>b.id");

// P9 gap report
show("P9 gaps", "SELECT a.category, a.name AS first_item, b.name AS second_item, b.price - a.price AS gap FROM products a JOIN products b ON a.category=b.category AND a.id<b.id ORDER BY gap DESC");

// P10 restock pairs
show("P10a filled", "SELECT a.name AS first_item, b.name AS second_item, a.stock + b.stock AS combined_stock FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<b.id WHERE a.stock + b.stock < 300 ORDER BY combined_stock ASC");
show("P10b category thread", "SELECT a.name AS first_item, b.name AS second_item, a.stock + b.stock AS combined_stock FROM products a JOIN products b ON a.category=b.supplier_id AND a.id<b.id WHERE a.stock + b.stock < 300 ORDER BY combined_stock ASC");
show("P10c stock thread", "SELECT COUNT(*) FROM products a JOIN products b ON a.stock=b.supplier_id AND a.id<b.id WHERE a.stock + b.stock < 300");
show("P10d > 300", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<b.id WHERE a.stock + b.stock > 300");
show("P10e = 300", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<b.id WHERE a.stock + b.stock = 300");
show("P10f >= 300", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<b.id WHERE a.stock + b.stock >= 300");

// P11 ghosts
show("P11a ghosts", "SELECT a.name AS unpaired_account, a.region FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id<b.id WHERE b.id IS NULL ORDER BY a.id");
show("P11b <> ghosts", "SELECT a.name FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE b.id IS NULL");
show("P11c = ghosts", "SELECT COUNT(*) FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id=b.id WHERE b.id IS NULL");
show("P11d <= ghosts", "SELECT COUNT(*) FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE b.id IS NULL");
show("P11e a.id IS NULL", "SELECT COUNT(*) FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.id IS NULL");
show("P11f INNER", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<b.id WHERE b.id IS NULL");
show("P11g CROSS", "SELECT COUNT(*) FROM customers a CROSS JOIN customers b ON a.region=b.region AND a.id<b.id WHERE b.id IS NULL");

// P12 vendor chain
show("P12a filled", "SELECT s.name AS vendor, a.name AS first_item, b.name AS second_item FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<b.id JOIN suppliers s ON a.supplier_id=s.id ORDER BY vendor ASC, first_item, second_item");
show("P12b category thread", "SELECT s.name AS vendor, a.name AS first_item, b.name AS second_item FROM products a JOIN products b ON a.category=b.supplier_id AND a.id<b.id JOIN suppliers s ON a.supplier_id=s.id ORDER BY vendor ASC, first_item, second_item");
show("P12c price thread", "SELECT COUNT(*) FROM products a JOIN products b ON a.price=b.supplier_id AND a.id<b.id JOIN suppliers s ON a.supplier_id=s.id");
show("P12d <>", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<>b.id JOIN suppliers s ON a.supplier_id=s.id");
show("P12e =", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id=b.id JOIN suppliers s ON a.supplier_id=s.id");
show("P12f <=", "SELECT COUNT(*) FROM products a JOIN products b ON a.supplier_id=b.supplier_id AND a.id<=b.id JOIN suppliers s ON a.supplier_id=s.id");

// P13 flag mismatch ledger
show("P13a filled", "SELECT a.region, a.name AS first_seat, b.name AS second_seat FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active<>b.active ORDER BY a.region ASC, first_seat, second_seat");
show("P13b = flags", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=b.active");
show("P13c > flags", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active>b.active");

// P14 flagship 39
show("P14a filled", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<b.id");
show("P14b LEFT", "SELECT COUNT(*) FROM customers a LEFT JOIN customers b ON a.region=b.region AND a.id<b.id");
show("P14c city thread", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.city=b.region AND a.id<b.id");
show("P14d id thread", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.id=b.region AND a.id<b.id");
show("P14e <>", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<>b.id");
show("P14f =", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id=b.id");
show("P14g <=", "SELECT COUNT(*) FROM customers a INNER JOIN customers b ON a.region=b.region AND a.id<=b.id");

// P15 active ordered call list
show("P15a filled", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=1 AND b.active=1");
show("P15b <", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=1 AND b.active=1");
show("P15c =", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id WHERE a.active=1 AND b.active=1");
show("P15d <=", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE a.active=1 AND b.active=1");
show("P15e a.active=0", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=0 AND b.active=1");
show("P15f a.active=2", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=2 AND b.active=1");

// P16 shelf census
show("P16a filled", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.category=b.category AND a.id<b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P16b <>", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.category=b.category AND a.id<>b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P16c =", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.category=b.category AND a.id=b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P16d <=", "SELECT COUNT(*) FROM products a JOIN products b ON a.category=b.category AND a.id<=b.id");
show("P16e supplier thread", "SELECT a.category, COUNT(*) AS shelf_pairs FROM products a JOIN products b ON a.supplier_id=b.category AND a.id<b.id GROUP BY a.category ORDER BY shelf_pairs DESC, a.category");
show("P16f price thread", "SELECT COUNT(*) FROM products a JOIN products b ON a.price=b.category AND a.id<b.id");

// P17 EU grid extras
show("P17a APAC grid <=", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE a.region='APAC'");
show("P17b a.city='EU'", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<=b.id WHERE a.city='EU'");

// P18 EU both-active extras
show("P18a APAC both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='APAC' AND a.active=1 AND b.active=1");
show("P18b US both-active", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='US' AND a.active=1 AND b.active=1");
show("P18c a.active slot dup", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='EU' AND a.active=1 AND a.active=1");
show("P18d bare 1 slot", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.region='EU' AND 1=1 AND b.active=1");

// P19 roll-call
show("P19a filled", "SELECT a.name AS first_seat, b.name AS second_seat FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=0 OR b.active=0 ORDER BY first_seat ASC, second_seat");
show("P19b AND", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=0 AND b.active=0");
show("P19c <>", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=0 OR b.active=0");
show("P19d =", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id=b.id WHERE a.active=0 OR b.active=0");

// P20 mixed count extras
show("P20a b.active in slot2", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=b.active AND b.active=0");
show("P20b b.active in slot3", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=1 AND b.active=b.active");
show("P20c flag 2", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<>b.id WHERE a.active=2 AND b.active=0");
show("P20d < guard", "SELECT COUNT(*) FROM customers a JOIN customers b ON a.region=b.region AND a.id<b.id WHERE a.active=1 AND b.active=0");

db.close();
console.log("done");
