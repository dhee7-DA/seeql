// Keyword Mastery bank — EXISTS graded problems (kb-ex-i01..i18).
// Probed facts: 16/0 membership, status reach delivered 15 / pending 8 /
// cancelled 4 / shipped 10, shipped∩pending 5, customers w/o cancelled 12,
// <=1 cancelled 14, ≥1 order above 800 → 4 holders, 40 Electronics baskets,
// 46 Audio, active filter 97/6, pending>500 group-probe 5 holders.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const subqueryProblemsB: Problem[] = [
  p({
    id: "kb-ex-i01", difficulty: "easy",
    title: "Buyers via EXISTS",
    brief: "The existence spelling of the buyers query: keep customers for whom a matching order row EXISTS. The probe correlates on customer id and stops at the first hit; SELECT 1 inside signals that projected values are irrelevant. Sixteen buyers pass.",
    hints: ["SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id).", "The correlation o.customer_id = c.id is the scope — without it the probe ignores the row it tests. ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i02", difficulty: "easy",
    title: "Ghosts via NOT EXISTS",
    brief: "The NULL-safe anti-join: customers with NO order row. NOT EXISTS flips the probe; unlike NOT IN it cannot be poisoned by NULLs in the compared column. The seed's honest answer is empty — everyone bought.",
    hints: ["Swap EXISTS for NOT EXISTS in the buyers probe.", "Keep the correlation; ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id) ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i03", difficulty: "easy",
    title: "Delivered-history holders",
    brief: "Probe with a segment filter: customers holding at least one DELIVERED order. The probe's WHERE carries both the correlation and the status test — fifteen of the sixteen qualify; one customer has never seen a delivered ticket.",
    hints: ["EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered').", "Pull id and name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i04", difficulty: "easy",
    title: "Pending-history holders",
    brief: "Same probe, pending flavor: eight customers hold at least one pending order — the undecided-money watchlist. The probe stays per-row; the status literal moves the question from 'any order' to 'any pending order'.",
    hints: ["Change the status literal to 'pending' in the delivered-holders probe.", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i05", difficulty: "easy",
    title: "Clean-record customers",
    brief: "The retention trust list: customers with NO cancelled order. NOT EXISTS with a cancelled filter — twelve customers carry zero cancellations. This is the anti-existence pattern that survives NULL data untouched.",
    hints: ["NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled').", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'cancelled') ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i06", difficulty: "medium",
    title: "The double-wait list",
    brief: "Two ANDed probes: customers holding BOTH a delivered order AND a pending one — proven buyers currently stuck. Eight customers make the list (the pending holders all have delivered history on this seed).",
    hints: ["WHERE EXISTS (… 'delivered') AND EXISTS (… 'pending') — two independent correlated probes.", "Each probe carries its own alias; ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'pending') ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i07", difficulty: "medium",
    title: "Shipped-and-stuck",
    brief: "The ops overlap: customers with a shipped order AND a pending one — five customers waiting in two queues at once. Two probes, two aliases, one AND. The union-side twin (OR) would count 13.",
    hints: ["Probe one filters 'shipped', probe two 'pending' — AND them.", "SELECT name FROM customers c; ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'shipped') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'pending') ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i08", difficulty: "medium",
    title: "Big-ticket holders",
    brief: "Existence with a threshold: customers holding at least one order above 800. The probe carries the correlation plus total > 800 — four holders. If you counted orders instead of holders, several customers would contribute multiple rows.",
    hints: ["EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 800).", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.total > 800) ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i09", difficulty: "medium",
    title: "Electronics baskets",
    brief: "Order-grain existence: orders containing at least one Electronics LINE. The probe joins items to products inside the EXISTS, scoped by oi.order_id = o.id — forty of the 103 baskets qualify.",
    hints: ["SELECT id, total FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category = 'Electronics').", "ORDER BY id."],
    solution: "SELECT id, total FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category = 'Electronics') ORDER BY id ASC;",
  }),
  p({
    id: "kb-ex-i10", difficulty: "medium",
    title: "Audio-free baskets",
    brief: "Anti-existence at basket level: orders with NO Audio line. The probe joins and hunts Audio; NOT EXISTS keeps the baskets where the hunt fails — 57 of 103. (Audio appears in 46 baskets; 103 − 46 = 57.)",
    hints: ["Swap the category to 'Audio' and flip to NOT EXISTS in the Electronics-baskets query.", "ORDER BY id."],
    solution: "SELECT id, total FROM orders o WHERE NOT EXISTS (SELECT 1 FROM order_items oi INNER JOIN products p ON p.id = oi.product_id WHERE oi.order_id = o.id AND p.category = 'Audio') ORDER BY id ASC;",
  }),
  p({
    id: "kb-ex-i11", difficulty: "medium",
    title: "Active-ledger orders",
    brief: "Probe the directory from the ledger side: orders whose customer carries active = 1. Two customers are deactivated (Dmitri Volkov, Keiko Sato), so their 6 orders drop — 97 survive. The probe direction is outer-orders → probe-customers.",
    hints: ["SELECT id FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 1).", "ORDER BY id."],
    solution: "SELECT id FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 1) ORDER BY id ASC;",
  }),
  p({
    id: "kb-ex-i12", difficulty: "medium",
    title: "Dormant-account orders",
    brief: "The mirror cut: orders belonging to the INACTIVE pair. NOT EXISTS with active = 1 — or EXISTS with active = 0; the honest six rows are the same. Pull customer_id too so the audit can see whose orders they are.",
    hints: ["WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 0).", "SELECT id, customer_id FROM orders o; ORDER BY id."],
    solution: "SELECT id, customer_id FROM orders o WHERE EXISTS (SELECT 1 FROM customers c WHERE c.id = o.customer_id AND c.active = 0) ORDER BY id ASC;",
  }),
  p({
    id: "kb-ex-i13", difficulty: "hard",
    title: "Grouped probe: pending over 500",
    brief: "EXISTS can host aggregation: customers whose TOTAL pending spend (grouped, summed) exceeds 500. The probe groups by customer inside, HAVING compares the sum — five holders. Per-row existence of a GROUPED result.",
    hints: ["EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) > 500).", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) > 500) ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i14", difficulty: "hard",
    title: "The pending-half fraud probe",
    brief: "Nested existence: customers whose pending total is at least HALF their lifetime spend. The probe sums pending per customer and compares against a correlated lifetime scalar; exactly one customer qualifies — Farid Nasser at 74.6%.",
    hints: ["EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) / 2.0).", "SELECT id, name; ORDER BY name."],
    solution: "SELECT id, name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' GROUP BY o.customer_id HAVING SUM(o.total) >= (SELECT SUM(o2.total) FROM orders o2 WHERE o2.customer_id = c.id) / 2.0) ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i15", difficulty: "hard",
    title: "The triple-fate survivors",
    brief: "Three ANDed probes: customers holding delivered AND shipped AND cancelled history. Each fate needs its own probe — one row can never witness three statuses. The survivors are the store's full-journey customers.",
    hints: ["Three EXISTS clauses, aliases o/o2/o3, statuses delivered/shipped/cancelled.", "SELECT name; ORDER BY name."],
    solution: "SELECT name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'delivered') AND EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = 'shipped') AND EXISTS (SELECT 1 FROM orders o3 WHERE o3.customer_id = c.id AND o3.status = 'cancelled') ORDER BY name ASC;",
  }),
  p({
    id: "kb-ex-i16", difficulty: "hard",
    title: "Pure-Accessories baskets",
    brief: "'ONLY X' needs two probes: the basket has at least one item, AND no item sits outside Accessories. The second probe joins products and hunts category <> 'Accessories'; NOT EXISTS proves purity. The honest count on this seed is small but real.",
    hints: ["WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id) AND NOT EXISTS (SELECT 1 FROM order_items oi2 INNER JOIN products p ON p.id = oi2.product_id WHERE oi2.order_id = o.id AND p.category <> 'Accessories').", "SELECT id, total FROM orders o; ORDER BY id."],
    solution: "SELECT id, total FROM orders o WHERE EXISTS (SELECT 1 FROM order_items oi WHERE oi.order_id = o.id) AND NOT EXISTS (SELECT 1 FROM order_items oi2 INNER JOIN products p ON p.id = oi2.product_id WHERE oi2.order_id = o.id AND p.category <> 'Accessories') ORDER BY id ASC;",
  }),
  p({
    id: "kb-ex-i17", difficulty: "hard",
    title: "Flag column via SELECT EXISTS",
    brief: "Existence as a projected column: every customer listed with a 1/0 has_pending flag. The probe lives in the SELECT list — sixteen rows, eight flagged. Filtering would drop rows; flagging keeps the whole roster visible.",
    hints: ["SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AS has_pending FROM customers c.", "ORDER BY name."],
    solution: "SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AS has_pending FROM customers c ORDER BY c.name ASC;",
  }),
  p({
    id: "kb-ex-i18", difficulty: "hard",
    title: "Latest-order status ledger",
    brief: "Per-customer recency audit: for each customer, EXISTS checks whether their LATEST order (MAX id) is pending — nested probes. The inner probe scopes the max-id test to the outer customer; the flag column carries the verdict.",
    hints: ["SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' AND o.id = (SELECT MAX(o2.id) FROM orders o2 WHERE o2.customer_id = c.id)) AS latest_pending FROM customers c.", "ORDER BY name."],
    solution: "SELECT c.name, EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending' AND o.id = (SELECT MAX(o2.id) FROM orders o2 WHERE o2.customer_id = c.id)) AS latest_pending FROM customers c ORDER BY c.name ASC;",
  }),
];
