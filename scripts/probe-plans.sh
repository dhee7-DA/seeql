#!/usr/bin/env bash
# Probe REAL EXPLAIN QUERY PLAN shapes for the perf-lab detective cases.
# Runs against the live dev server (:3000) — /api/perf rolls everything back.
set -u
BASE=http://localhost:3000

probe() {
  local label="$1"; shift
  local sql="$1"; shift
  echo "================ $label ================"
  local payload
  payload=$(python3 - "$sql" "$@" << 'PYEOF'
import json, sys
sql = sys.argv[1]
indexes = [a for a in sys.argv[2:] if a]
print(json.dumps({"sql": sql, "indexes": indexes}))
PYEOF
)
  curl -s --max-time 60 -X POST "$BASE/api/perf" -H "Content-Type: application/json" -d "$payload" | python3 -c '
import json, sys
d = json.load(sys.stdin)
if not d.get("ok"):
    print("ERROR:", d.get("error")); sys.exit(0)
def show(tag, plan):
    if plan is None: return
    print("  --- %s ---" % tag)
    for r in plan:
        print("   [%s->%s] %s" % (r["id"], r["parent"], r["detail"]))
show("BEFORE", d["before"])
show("AFTER", d["after"])
print("  rows: %s" % d["rowCount"])
'
}

probe "D1 customer lookup" \
  "SELECT id, status, total FROM orders WHERE customer_id = 7;" \
  "CREATE INDEX idx_orders_customer ON orders(customer_id)"

probe "D2 pending queue (filter+sort)" \
  "SELECT id, created_at FROM orders WHERE status = 'pending' ORDER BY created_at DESC;" \
  "CREATE INDEX idx_orders_status_created ON orders(status, created_at)"

probe "D3 overdue ladder" \
  "SELECT number, due_on, amount_cents FROM invoices WHERE status = 'unpaid' ORDER BY due_on;" \
  "CREATE INDEX idx_invoices_status_due ON invoices(status, due_on)"

probe "D4 join drag (supplier region)" \
  "SELECT p.name, s.name AS supplier FROM products p JOIN suppliers s ON s.id = p.supplier_id WHERE s.region = 'NORTH';" \
  "CREATE INDEX idx_suppliers_region ON suppliers(region)"

probe "D5 ledger range" \
  "SELECT entry_date, debit_cents, credit_cents FROM ledger_entries WHERE account = 'accounts_receivable' AND entry_date >= '2024-04-01' AND entry_date < '2024-07-01';" \
  "CREATE INDEX idx_ledger_account_date ON ledger_entries(account, entry_date)"

probe "D6 unique email" \
  "SELECT name, city FROM customers WHERE email = 'liam.carter@example.com';" \
  "CREATE UNIQUE INDEX idx_customers_email ON customers(email)"

probe "D7 order_items join filter" \
  "SELECT o.id, o.total, p.name FROM orders o JOIN order_items oi ON oi.order_id = o.id JOIN products p ON p.id = oi.product_id WHERE o.status = 'shipped';" \
  "CREATE INDEX idx_orders_status ON orders(status)"

probe "D8 covering scan check" \
  "SELECT customer_id FROM orders WHERE customer_id = 7;" \
  "CREATE INDEX idx_orders_customer ON orders(customer_id)"
