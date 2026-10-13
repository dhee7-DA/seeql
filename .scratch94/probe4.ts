import { Database } from "bun:sqlite";
const db = new Database("/home/z/my-project/db/custom.db", { readonly: true });
console.log(JSON.stringify(db.query(`SELECT
 (SELECT GROUP_CONCAT(customer_id) FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING AVG(total) < 338.19)) AS below_platform,
 (SELECT GROUP_CONCAT(customer_id) FROM (SELECT customer_id FROM orders GROUP BY customer_id HAVING AVG(total) < 370.15)) AS below_account_mean`).all()));
db.close();
