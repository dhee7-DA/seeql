// Domain Mastery — Logistics & Freight · 60 case studies (20 Easy / 20 Medium /
// 20 Hard). Each case = a work scenario + TWO engine-graded steps; the
// expected outputs are generated into dm-expected.ts by scripts/dm-verify.ts.
// Every number in a scenario is probe-verified (scripts/r14-freight-probe.ts).
import type { DmCase } from "../domain-packs";

export const DM_FREIGHT_CASES: DmCase[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "c01",
    difficulty: "Easy",
    company: "FedEx",
    title: "Book health check",
    scenario:
      "Monday ops standup opens with the shipment book: how much of it landed, and how do the open rows split?",
    steps: [
      { prompt: "Count delivered shipments. One column: delivered_count.", code: `SELECT COUNT(*) AS delivered_count\nFROM shipments\nWHERE status = 'delivered';`, order: "exact" },
      { prompt: "Count shipments per status. Output status and shipment_count, ordered by shipment_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS shipment_count\nFROM shipments\nGROUP BY status\nORDER BY shipment_count DESC, status ASC;`, order: "exact" },
    ],
  },
  {
    id: "c02",
    difficulty: "Easy",
    company: "UPS",
    title: "Service mix",
    scenario:
      "Network planning wants the tender mix: what the network promises, and how far freight stretches.",
    steps: [
      { prompt: "Count shipments per service. Output service and shipment_count, ordered by shipment_count descending, then service ascending.", code: `SELECT service, COUNT(*) AS shipment_count\nFROM shipments\nGROUP BY service\nORDER BY shipment_count DESC, service ASC;`, order: "exact" },
      { prompt: "Compute the rounded average distance across all shipments. One column: avg_distance_km.", code: `SELECT ROUND(AVG(distance_km), 0) AS avg_distance_km\nFROM shipments;`, order: "exact" },
    ],
  },
  {
    id: "c03",
    difficulty: "Easy",
    company: "DHL",
    title: "Hub footprint",
    scenario:
      "The network map review starts with the hub roster and its regional spread.",
    steps: [
      { prompt: "List the warehouses: warehouse_id, city, region, hub_type, ordered by warehouse_id ascending.", code: `SELECT warehouse_id, city, region, hub_type\nFROM warehouses\nORDER BY warehouse_id ASC;`, order: "exact" },
      { prompt: "Count hubs per region. Output region and hub_count, ordered by hub_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS hub_count\nFROM warehouses\nGROUP BY region\nORDER BY hub_count DESC, region ASC;`, order: "exact" },
    ],
  },
  {
    id: "c04",
    difficulty: "Easy",
    company: "Maersk",
    title: "Shipper book",
    scenario:
      "Commercial opens with the customer file: who sails under which flag, and when they joined.",
    steps: [
      { prompt: "Count customers per region. Output region and customer_count, ordered by customer_count descending, then region ascending.", code: `SELECT region, COUNT(*) AS customer_count\nFROM customers\nGROUP BY region\nORDER BY customer_count DESC, region ASC;`, order: "exact" },
      { prompt: "List the 2026 onboardings: customer_id, name, onboarded_date, ordered by onboarded_date ascending.", code: `SELECT customer_id, name, onboarded_date\nFROM customers\nWHERE onboarded_date >= '2026-01-01'\nORDER BY onboarded_date ASC;`, order: "exact" },
    ],
  },
  {
    id: "c05",
    difficulty: "Easy",
    company: "Freightline",
    title: "Claim inventory",
    scenario:
      "The claims inbox needs triage: what's filed, what's still undecided, what's already decided.",
    steps: [
      { prompt: "Count claims per status. Output status and claim_count, ordered by claim_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS claim_count\nFROM freight_claims\nGROUP BY status\nORDER BY claim_count DESC, status ASC;`, order: "exact" },
      { prompt: "Sum claimed_cents on open claims. One column: open_exposure_cents.", code: `SELECT SUM(claimed_cents) AS open_exposure_cents\nFROM freight_claims\nWHERE status = 'open';`, order: "exact" },
    ],
  },
  {
    id: "c06",
    difficulty: "Easy",
    company: "Portside",
    title: "Invoice census",
    scenario:
      "Finance opens the AR meeting with the invoice book's shape: paid, hanging, contested.",
    steps: [
      { prompt: "Count invoices per status. Output status and invoice_count, ordered by invoice_count descending, then status ascending.", code: `SELECT status, COUNT(*) AS invoice_count\nFROM invoices\nGROUP BY status\nORDER BY invoice_count DESC, status ASC;`, order: "exact" },
      { prompt: "List disputed invoices: invoice_id, customer_id, shipment_id, base_cents, ordered by invoice_id ascending.", code: `SELECT invoice_id, customer_id, shipment_id, base_cents\nFROM invoices\nWHERE status = 'disputed'\nORDER BY invoice_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c07",
    difficulty: "Easy",
    company: "FedEx",
    title: "Premium freight",
    scenario:
      "The pricing team wants the top of the freight market: the biggest quotes on the book.",
    steps: [
      { prompt: "List the top 5 shipments by freight_cents: shipment_id, customer_id, service, freight_cents, ordered by freight descending then shipment_id ascending.", code: `SELECT shipment_id, customer_id, service, freight_cents\nFROM shipments\nORDER BY freight_cents DESC, shipment_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "Count shipments quoted above 30000 cents. One column: premium_count.", code: `SELECT COUNT(*) AS premium_count\nFROM shipments\nWHERE freight_cents > 30000;`, order: "exact" },
    ],
  },
  {
    id: "c08",
    difficulty: "Easy",
    company: "UPS",
    title: "Driver roster",
    scenario:
      "Dispatch reviews the driving workforce before the weekly route assignments.",
    steps: [
      { prompt: "List drivers: driver_id, name, region, vehicle, ordered by driver_id ascending.", code: `SELECT driver_id, name, region, vehicle\nFROM drivers\nORDER BY driver_id ASC;`, order: "exact" },
      { prompt: "Count drivers per vehicle. Output vehicle and driver_count, ordered by driver_count descending, then vehicle ascending.", code: `SELECT vehicle, COUNT(*) AS driver_count\nFROM drivers\nGROUP BY vehicle\nORDER BY driver_count DESC, vehicle ASC;`, order: "exact" },
    ],
  },
  {
    id: "c09",
    difficulty: "Easy",
    company: "DHL",
    title: "The stuck board",
    scenario:
      "The exception desk starts its day: which tenders stalled, and which never left the ground.",
    steps: [
      { prompt: "List exception shipments: shipment_id, customer_id, service, ship_date, ordered by shipment_id ascending.", code: `SELECT shipment_id, customer_id, service, ship_date\nFROM shipments\nWHERE status = 'exception'\nORDER BY shipment_id ASC;`, order: "exact" },
      { prompt: "List cancelled shipments: shipment_id, customer_id, ship_date, freight_cents, ordered by shipment_id ascending.", code: `SELECT shipment_id, customer_id, ship_date, freight_cents\nFROM shipments\nWHERE status = 'cancelled'\nORDER BY shipment_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c10",
    difficulty: "Easy",
    company: "Maersk",
    title: "Overdue watch",
    scenario:
      "The promise desk scans for freight that should already have landed.",
    steps: [
      { prompt: "List in_transit shipments promised before 2026-06-15: shipment_id, customer_id, service, promised_date, ordered by promised_date ascending.", code: `SELECT shipment_id, customer_id, service, promised_date\nFROM shipments\nWHERE status = 'in_transit' AND promised_date < '2026-06-15'\nORDER BY promised_date ASC;`, order: "exact" },
      { prompt: "Count in_transit shipments. One column: in_transit_count.", code: `SELECT COUNT(*) AS in_transit_count\nFROM shipments\nWHERE status = 'in_transit';`, order: "exact" },
    ],
  },
  {
    id: "c11",
    difficulty: "Easy",
    company: "Freightline",
    title: "Scan vocabulary",
    scenario:
      "A new analyst learns the event table's shape: which scans exist and how often each fires.",
    steps: [
      { prompt: "Count events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending.", code: `SELECT event_type, COUNT(*) AS event_count\nFROM shipment_events\nGROUP BY event_type\nORDER BY event_count DESC, event_type ASC;`, order: "exact" },
      { prompt: "Count total scan events. One column: total_scans.", code: `SELECT COUNT(*) AS total_scans\nFROM shipment_events;`, order: "exact" },
    ],
  },
  {
    id: "c12",
    difficulty: "Easy",
    company: "Portside",
    title: "Lost and found",
    scenario:
      "The insurance review starts from the loss column of the claim book.",
    steps: [
      { prompt: "List lost claims: claim_id, shipment_id, claimed_cents, status, ordered by claim_id ascending.", code: `SELECT claim_id, shipment_id, claimed_cents, status\nFROM freight_claims\nWHERE claim_type = 'lost'\nORDER BY claim_id ASC;`, order: "exact" },
      { prompt: "Count claims per type. Output claim_type and claim_count, ordered by claim_count descending, then claim_type ascending.", code: `SELECT claim_type, COUNT(*) AS claim_count\nFROM freight_claims\nGROUP BY claim_type\nORDER BY claim_count DESC, claim_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c13",
    difficulty: "Easy",
    company: "FedEx",
    title: "March tenders",
    scenario:
      "The quarter review pulls March's tender diary — the month the LATAM shipper went dark.",
    steps: [
      { prompt: "List shipments tendered in March 2026: shipment_id, customer_id, service, ship_date, ordered by ship_date ascending.", code: `SELECT shipment_id, customer_id, service, ship_date\nFROM shipments\nWHERE ship_date BETWEEN '2026-03-01' AND '2026-03-31'\nORDER BY ship_date ASC;`, order: "exact" },
      { prompt: "Count March tenders. One column: march_count.", code: `SELECT COUNT(*) AS march_count\nFROM shipments\nWHERE ship_date BETWEEN '2026-03-01' AND '2026-03-31';`, order: "exact" },
    ],
  },
  {
    id: "c14",
    difficulty: "Easy",
    company: "UPS",
    title: "Segment ledger",
    scenario:
      "Sales ops splits the book by shipper segment before the QBR.",
    steps: [
      { prompt: "Count customers per segment. Output segment and customer_count, ordered by customer_count descending, then segment ascending.", code: `SELECT segment, COUNT(*) AS customer_count\nFROM customers\nGROUP BY segment\nORDER BY customer_count DESC, segment ASC;`, order: "exact" },
      { prompt: "List startup shippers: customer_id, name, region, ordered by customer_id ascending.", code: `SELECT customer_id, name, region\nFROM customers\nWHERE segment = 'startup'\nORDER BY customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c15",
    difficulty: "Easy",
    company: "DHL",
    title: "Claimed money",
    scenario:
      "The claims ledger's first line: how much money the book claims in total.",
    steps: [
      { prompt: "Sum claimed_cents over all claims. One column: total_claimed_cents.", code: `SELECT SUM(claimed_cents) AS total_claimed_cents\nFROM freight_claims;`, order: "exact" },
      { prompt: "Find the maximum claimed_cents. One column: max_claimed_cents.", code: `SELECT MAX(claimed_cents) AS max_claimed_cents\nFROM freight_claims;`, order: "exact" },
    ],
  },
  {
    id: "c16",
    difficulty: "Easy",
    company: "Maersk",
    title: "Economy lanes",
    scenario:
      "The slow-freight product review pulls its March slice and its average promise.",
    steps: [
      { prompt: "List economy shipments tendered in March 2026: shipment_id, customer_id, ship_date, promised_date, freight_cents, ordered by ship_date ascending.", code: `SELECT shipment_id, customer_id, ship_date, promised_date, freight_cents\nFROM shipments\nWHERE service = 'economy' AND ship_date BETWEEN '2026-03-01' AND '2026-03-31'\nORDER BY ship_date ASC;`, order: "exact" },
      { prompt: "Count shipments per service. Output service and shipment_count, ordered by service ascending.", code: `SELECT service, COUNT(*) AS shipment_count\nFROM shipments\nGROUP BY service\nORDER BY service ASC;`, order: "exact" },
    ],
  },
  {
    id: "c17",
    difficulty: "Easy",
    company: "Freightline",
    title: "Pending AR",
    scenario:
      "Collections opens with the pending pile and its biggest single ticket.",
    steps: [
      { prompt: "List pending invoices: invoice_id, customer_id, shipment_id, base_cents, ordered by invoice_id ascending.", code: `SELECT invoice_id, customer_id, shipment_id, base_cents\nFROM invoices\nWHERE status = 'pending'\nORDER BY invoice_id ASC;`, order: "exact" },
      { prompt: "Find the largest billed base_cents on any invoice. One column: max_base_cents.", code: `SELECT MAX(base_cents) AS max_base_cents\nFROM invoices;`, order: "exact" },
    ],
  },
  {
    id: "c18",
    difficulty: "Easy",
    company: "Portside",
    title: "Last-mile fleet",
    scenario:
      "The last-mile hub review lists its home city and checks which shipments originate where.",
    steps: [
      { prompt: "List last_mile hubs: warehouse_id, city, region, ordered by warehouse_id ascending.", code: `SELECT warehouse_id, city, region\nFROM warehouses\nWHERE hub_type = 'last_mile'\nORDER BY warehouse_id ASC;`, order: "exact" },
      { prompt: "Count shipments per origin_wh. Output origin_wh and origin_count, ordered by origin_wh ascending.", code: `SELECT origin_wh, COUNT(*) AS origin_count\nFROM shipments\nGROUP BY origin_wh\nORDER BY origin_wh ASC;`, order: "exact" },
    ],
  },
  {
    id: "c19",
    difficulty: "Easy",
    company: "FedEx",
    title: "Fuel sanity",
    scenario:
      "An intern questions the fuel math. Prove the rule holds across the whole book.",
    steps: [
      { prompt: "Count invoices where fuel_cents differs from ROUND(base_cents * 0.12). One column: violations.", code: `SELECT COUNT(*) AS violations\nFROM invoices\nWHERE fuel_cents <> CAST(ROUND(base_cents * 0.12) AS INTEGER);`, order: "exact" },
      { prompt: "Sum fuel_cents across all invoices. One column: total_fuel_cents.", code: `SELECT SUM(fuel_cents) AS total_fuel_cents\nFROM invoices;`, order: "exact" },
    ],
  },
  {
    id: "c20",
    difficulty: "Easy",
    company: "UPS",
    title: "Delivered money",
    scenario:
      "The exec dashboard's headline number: freight that actually landed.",
    steps: [
      { prompt: "Sum freight_cents on delivered shipments. One column: delivered_freight_cents.", code: `SELECT SUM(freight_cents) AS delivered_freight_cents\nFROM shipments\nWHERE status = 'delivered';`, order: "exact" },
      { prompt: "Sum freight_cents across ALL shipments regardless of status. One column: all_status_freight_cents.", code: `SELECT SUM(freight_cents) AS all_status_freight_cents\nFROM shipments;`, order: "exact" },
    ],
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "c21",
    difficulty: "Medium",
    company: "FedEx",
    title: "Shipper league table",
    scenario:
      "The commercial review ranks the shippers by delivered money — with the dormant house explicitly at zero.",
    steps: [
      { prompt: "Sum delivered freight per customer (keep everyone, zero included): customer_id, name, delivered_freight_cents, ordered by the total descending then customer_id ascending.", code: `SELECT c.customer_id, c.name, COALESCE(SUM(s.freight_cents), 0) AS delivered_freight_cents\nFROM customers c\nLEFT JOIN shipments s ON s.customer_id = c.customer_id AND s.status = 'delivered'\nGROUP BY c.customer_id, c.name\nORDER BY delivered_freight_cents DESC, c.customer_id ASC;`, order: "exact" },
      { prompt: "Count delivered shipments per customer, same LEFT JOIN discipline: customer_id, delivered_count, ordered by delivered_count descending then customer_id ascending.", code: `SELECT c.customer_id, COUNT(s.shipment_id) AS delivered_count\nFROM customers c\nLEFT JOIN shipments s ON s.customer_id = c.customer_id AND s.status = 'delivered'\nGROUP BY c.customer_id\nORDER BY delivered_count DESC, c.customer_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c22",
    difficulty: "Medium",
    company: "UPS",
    title: "Regional books",
    scenario:
      "The network scorecard compares regions on delivered money — before anyone mentions the whale.",
    steps: [
      { prompt: "Sum delivered freight per customer region: region, region_freight_cents, ordered by the total descending.", code: `SELECT c.region, SUM(s.freight_cents) AS region_freight_cents\nFROM shipments s\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE s.status = 'delivered'\nGROUP BY c.region\nORDER BY region_freight_cents DESC;`, order: "exact" },
      { prompt: "Repeat excluding customer 10: region, ex_whale_freight_cents, ordered by the total descending.", code: `SELECT c.region, SUM(s.freight_cents) AS ex_whale_freight_cents\nFROM shipments s\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE s.status = 'delivered' AND s.customer_id <> 10\nGROUP BY c.region\nORDER BY ex_whale_freight_cents DESC;`, order: "exact" },
    ],
  },
  {
    id: "c23",
    difficulty: "Medium",
    company: "DHL",
    title: "SLA scorecard",
    scenario:
      "The promise desk builds the on-time matrix per service — inclusive rule first, then strict.",
    steps: [
      { prompt: "Per service, count delivered rows on-time inclusive (delivered <= promised): service, on_time_count, ordered by service ascending.", code: `SELECT service, COUNT(*) AS on_time_count\nFROM shipments\nWHERE status = 'delivered' AND delivered_date <= promised_date\nGROUP BY service\nORDER BY service ASC;`, order: "exact" },
      { prompt: "Per service, count delivered rows late (delivered > promised): service, late_count, ordered by service ascending.", code: `SELECT service, COUNT(*) AS late_count\nFROM shipments\nWHERE status = 'delivered' AND delivered_date > promised_date\nGROUP BY service\nORDER BY service ASC;`, order: "exact" },
    ],
  },
  {
    id: "c24",
    difficulty: "Medium",
    company: "Maersk",
    title: "Billing curve",
    scenario:
      "Finance walks the half-year billing curve month by month.",
    steps: [
      { prompt: "Sum monthly invoiced money (base + fuel + accessorials): ym, month_total_cents, ordered by ym ascending.", code: `SELECT strftime('%Y-%m', issue_date) AS ym,\n       SUM(base_cents + fuel_cents + accessorial_cents) AS month_total_cents\nFROM invoices\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Count invoices per month: ym, invoice_count, ordered by ym ascending.", code: `SELECT strftime('%Y-%m', issue_date) AS ym, COUNT(*) AS invoice_count\nFROM invoices\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
    ],
  },
  {
    id: "c25",
    difficulty: "Medium",
    company: "Freightline",
    title: "Drift audit",
    scenario:
      "Revenue integrity joins invoices back to quotes and prices every repriced line.",
    steps: [
      { prompt: "List invoices whose base differs from the shipment's quoted freight: shipment_id, quoted_freight_cents, billed_base_cents, delta_cents, status, ordered by shipment_id ascending.", code: `SELECT s.shipment_id, s.freight_cents AS quoted_freight_cents,\n       i.base_cents AS billed_base_cents,\n       i.base_cents - s.freight_cents AS delta_cents,\n       i.status\nFROM invoices i\nJOIN shipments s ON s.shipment_id = i.shipment_id\nWHERE i.base_cents <> s.freight_cents\nORDER BY s.shipment_id ASC;`, order: "exact" },
      { prompt: "Sum the drift deltas across those rows. One column: total_drift_cents.", code: `SELECT SUM(i.base_cents - s.freight_cents) AS total_drift_cents\nFROM invoices i\nJOIN shipments s ON s.shipment_id = i.shipment_id\nWHERE i.base_cents <> s.freight_cents;`, order: "exact" },
    ],
  },
  {
    id: "c26",
    difficulty: "Medium",
    company: "Portside",
    title: "Dock dwell review",
    scenario:
      "The hub ops meeting prices dock time: the longest holds in the book.",
    steps: [
      { prompt: "Compute hub dwell (departed minus arrived) per shipment that has both scans; list the top 5: shipment_id, dwell_seconds, ordered by dwell descending then shipment_id ascending.", code: `SELECT a.shipment_id,\n       d.event_ts - a.event_ts AS dwell_seconds\nFROM shipment_events a\nJOIN shipment_events d ON d.shipment_id = a.shipment_id AND d.event_type = 'departed_hub'\nWHERE a.event_type = 'arrived_hub'\nORDER BY dwell_seconds DESC, a.shipment_id ASC\nLIMIT 5;`, order: "exact" },
      { prompt: "Count dwell pairs at or above a full 86400-second dock day. One column: long_dwell_count.", code: `SELECT COUNT(*) AS long_dwell_count\nFROM (SELECT a.shipment_id FROM shipment_events a\n      JOIN shipment_events d ON d.shipment_id = a.shipment_id AND d.event_type = 'departed_hub'\n      WHERE a.event_type = 'arrived_hub' AND d.event_ts - a.event_ts >= 86400);`, order: "exact" },
    ],
  },
  {
    id: "c27",
    difficulty: "Medium",
    company: "FedEx",
    title: "Driver workload",
    scenario:
      "Dispatch compares scan workload across the driving roster, zeros included.",
    steps: [
      { prompt: "Count scans per driver (LEFT JOIN, all 8): driver_id, name, scan_count, ordered by scan_count descending then driver_id ascending.", code: `SELECT d.driver_id, d.name, COUNT(e.event_id) AS scan_count\nFROM drivers d\nLEFT JOIN shipment_events e ON e.driver_id = d.driver_id\nGROUP BY d.driver_id, d.name\nORDER BY scan_count DESC, d.driver_id ASC;`, order: "exact" },
      { prompt: "Count hub scans (NULL-driver events). One column: hub_scan_count.", code: `SELECT COUNT(*) AS hub_scan_count\nFROM shipment_events\nWHERE driver_id IS NULL;`, order: "exact" },
    ],
  },
  {
    id: "c28",
    difficulty: "Medium",
    company: "UPS",
    title: "The air tax",
    scenario:
      "Billing reviews the dimensional-weight story: who pays on size, and who ties the scales.",
    steps: [
      { prompt: "List shipments lighter than their dim weight: shipment_id, weight_g, dim_weight_g, freight_cents, ordered by shipment_id ascending.", code: `SELECT shipment_id, weight_g, dim_weight_g, freight_cents\nFROM shipments\nWHERE dim_weight_g > weight_g\nORDER BY shipment_id ASC;`, order: "exact" },
      { prompt: "Sum freight_cents over those air-tax rows. One column: air_tax_freight_cents.", code: `SELECT SUM(freight_cents) AS air_tax_freight_cents\nFROM shipments\nWHERE dim_weight_g > weight_g;`, order: "exact" },
    ],
  },
  {
    id: "c29",
    difficulty: "Medium",
    company: "DHL",
    title: "Origin hub rolls",
    scenario:
      "The network team counts tenders per origin hub — the dark gateway included.",
    steps: [
      { prompt: "Count shipments per origin warehouse, keeping zero hubs: warehouse_id, city, origin_count, ordered by warehouse_id ascending.", code: `SELECT w.warehouse_id, w.city, COUNT(s.shipment_id) AS origin_count\nFROM warehouses w\nLEFT JOIN shipments s ON s.origin_wh = w.warehouse_id\nGROUP BY w.warehouse_id, w.city\nORDER BY w.warehouse_id ASC;`, order: "exact" },
      { prompt: "Sum quoted freight per origin warehouse over non-cancelled rows, keeping zero hubs: warehouse_id, tendered_freight_cents (COALESCE 0), ordered by warehouse_id ascending.", code: `SELECT w.warehouse_id, COALESCE(SUM(s.freight_cents), 0) AS tendered_freight_cents\nFROM warehouses w\nLEFT JOIN shipments s ON s.origin_wh = w.warehouse_id AND s.status <> 'cancelled'\nGROUP BY w.warehouse_id\nORDER BY w.warehouse_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c30",
    difficulty: "Medium",
    company: "Maersk",
    title: "Claim money by status",
    scenario:
      "The claims committee prices the book: counts and money per status.",
    steps: [
      { prompt: "Group claims by status: status, claim_count, claimed_total_cents, ordered by claim_count descending then status ascending.", code: `SELECT status, COUNT(*) AS claim_count, SUM(claimed_cents) AS claimed_total_cents\nFROM freight_claims\nGROUP BY status\nORDER BY claim_count DESC, status ASC;`, order: "exact" },
      { prompt: "Average claimed_cents per claim_type (rounded): claim_type, avg_claimed_cents, ordered by claim_count... by claim_type ascending.", code: `SELECT claim_type, ROUND(AVG(claimed_cents), 0) AS avg_claimed_cents\nFROM freight_claims\nGROUP BY claim_type\nORDER BY claim_type ASC;`, order: "exact" },
    ],
  },
  {
    id: "c31",
    difficulty: "Medium",
    company: "Freightline",
    title: "Aging the backlog",
    scenario:
      "AR ages the pending invoices as of 2026-07-01 for the collections call.",
    steps: [
      { prompt: "List pending invoices with age: invoice_id, customer_id, issue_date, age_days, ordered by age_days descending.", code: `SELECT invoice_id, customer_id, issue_date,\n       CAST(julianday('2026-07-01') - julianday(issue_date) AS INT) AS age_days\nFROM invoices\nWHERE status = 'pending'\nORDER BY age_days DESC;`, order: "exact" },
      { prompt: "Count pending invoices aged over 30 days. One column: over_30_count.", code: `SELECT COUNT(*) AS over_30_count\nFROM invoices\nWHERE status = 'pending'\n  AND CAST(julianday('2026-07-01') - julianday(issue_date) AS INT) > 30;`, order: "exact" },
    ],
  },
  {
    id: "c32",
    difficulty: "Medium",
    company: "Portside",
    title: "June delivery bills",
    scenario:
      "The June close joins deliveries to their invoices for the month-end review.",
    steps: [
      { prompt: "List June 2026 delivered shipments with invoice totals: shipment_id, customer_id, delivered_date, invoice_total_cents, ordered by delivered_date then shipment_id ascending.", code: `SELECT s.shipment_id, s.customer_id, s.delivered_date,\n       i.base_cents + i.fuel_cents + i.accessorial_cents AS invoice_total_cents\nFROM shipments s\nJOIN invoices i ON i.shipment_id = s.shipment_id\nWHERE s.status = 'delivered' AND s.delivered_date BETWEEN '2026-06-01' AND '2026-06-30'\nORDER BY s.delivered_date ASC, s.shipment_id ASC;`, order: "exact" },
      { prompt: "Count June 2026 delivered shipments. One column: june_delivered_count.", code: `SELECT COUNT(*) AS june_delivered_count\nFROM shipments\nWHERE status = 'delivered' AND delivered_date BETWEEN '2026-06-01' AND '2026-06-30';`, order: "exact" },
    ],
  },
  {
    id: "c33",
    difficulty: "Medium",
    company: "FedEx",
    title: "Delta histogram",
    scenario:
      "The SLA retrospective buckets every delivery by its day delta against the promise.",
    steps: [
      { prompt: "Count delivered rows per delta (delivered minus promised, in days): delta_days, shipment_count, ordered by delta ascending.", code: `SELECT CAST(julianday(delivered_date) - julianday(promised_date) AS INT) AS delta_days,\n       COUNT(*) AS shipment_count\nFROM shipments\nWHERE status = 'delivered'\nGROUP BY delta_days\nORDER BY delta_days ASC;`, order: "exact" },
      { prompt: "Count delivered rows landing exactly on the promise. One column: on_line_count.", code: `SELECT COUNT(*) AS on_line_count\nFROM shipments\nWHERE status = 'delivered' AND delivered_date = promised_date;`, order: "exact" },
    ],
  },
  {
    id: "c34",
    difficulty: "Medium",
    company: "UPS",
    title: "Cross-border lanes",
    scenario:
      "Trade compliance lists the lanes whose pickup hub sits outside the shipper's home region.",
    steps: [
      { prompt: "List cross-border shipments (hub region != customer region): shipment_id, customer_id, origin_wh, freight_cents, ordered by shipment_id ascending.", code: `SELECT s.shipment_id, s.customer_id, s.origin_wh, s.freight_cents\nFROM shipments s\nJOIN warehouses w ON w.warehouse_id = s.origin_wh\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE w.region <> c.region\nORDER BY s.shipment_id ASC;`, order: "exact" },
      { prompt: "Sum freight over those cross-border rows. One column: cross_border_freight_cents.", code: `SELECT SUM(s.freight_cents) AS cross_border_freight_cents\nFROM shipments s\nJOIN warehouses w ON w.warehouse_id = s.origin_wh\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE w.region <> c.region;`, order: "exact" },
    ],
  },
  {
    id: "c35",
    difficulty: "Medium",
    company: "DHL",
    title: "Billing books",
    scenario:
      "Account management ranks the billing books before the renewals round.",
    steps: [
      { prompt: "List the top 3 customers by invoiced money: customer_id, name, billed_total_cents, ordered by the total descending.", code: `SELECT c.customer_id, c.name,\n       SUM(i.base_cents + i.fuel_cents + i.accessorial_cents) AS billed_total_cents\nFROM customers c\nJOIN invoices i ON i.customer_id = c.customer_id\nGROUP BY c.customer_id, c.name\nORDER BY billed_total_cents DESC\nLIMIT 3;`, order: "exact" },
      { prompt: "Compute the whale's (customer 10) billed total. One column: whale_billed_cents.", code: `SELECT SUM(base_cents + fuel_cents + accessorial_cents) AS whale_billed_cents\nFROM invoices\nWHERE customer_id = 10;`, order: "exact" },
    ],
  },
  {
    id: "c36",
    difficulty: "Medium",
    company: "Maersk",
    title: "Per-hub dwell",
    scenario:
      "Hub engineering averages dock time per origin — Memphis's number is hostage to one hold.",
    steps: [
      { prompt: "Average dwell per origin warehouse (rounded): warehouse_id, avg_dwell_seconds, ordered by average descending.", code: `SELECT s.origin_wh AS warehouse_id,\n       ROUND(AVG(d.event_ts - a.event_ts), 0) AS avg_dwell_seconds\nFROM shipment_events a\nJOIN shipment_events d ON d.shipment_id = a.shipment_id AND d.event_type = 'departed_hub'\nJOIN shipments s ON s.shipment_id = a.shipment_id\nWHERE a.event_type = 'arrived_hub'\nGROUP BY s.origin_wh\nORDER BY avg_dwell_seconds DESC;`, order: "exact" },
      { prompt: "Find the maximum dwell seconds overall. One column: max_dwell_seconds.", code: `SELECT MAX(d.event_ts - a.event_ts) AS max_dwell_seconds\nFROM shipment_events a\nJOIN shipment_events d ON d.shipment_id = a.shipment_id AND d.event_type = 'departed_hub'\nWHERE a.event_type = 'arrived_hub';`, order: "exact" },
    ],
  },
  {
    id: "c37",
    difficulty: "Medium",
    company: "Freightline",
    title: "Accessorials ledger",
    scenario:
      "Pricing reviews every accessorial dollar on the book.",
    steps: [
      { prompt: "List invoices carrying accessorials: invoice_id, shipment_id, accessorial_cents, ordered by shipment_id ascending.", code: `SELECT invoice_id, shipment_id, accessorial_cents\nFROM invoices\nWHERE accessorial_cents > 0\nORDER BY shipment_id ASC;`, order: "exact" },
      { prompt: "Sum accessorial_cents across the book. One column: total_accessorials_cents.", code: `SELECT SUM(accessorial_cents) AS total_accessorials_cents\nFROM invoices;`, order: "exact" },
    ],
  },
  {
    id: "c38",
    difficulty: "Medium",
    company: "Portside",
    title: "Service economics",
    scenario:
      "Product pricing compares the three services on delivered money and per-box value.",
    steps: [
      { prompt: "Per service on delivered rows: service, service_freight_cents, avg_freight_cents (rounded), ordered by total descending.", code: `SELECT service, SUM(freight_cents) AS service_freight_cents,\n       ROUND(AVG(freight_cents), 0) AS avg_freight_cents\nFROM shipments\nWHERE status = 'delivered'\nGROUP BY service\nORDER BY service_freight_cents DESC;`, order: "exact" },
      { prompt: "Count delivered shipments per service: service, delivered_count, ordered by service ascending.", code: `SELECT service, COUNT(*) AS delivered_count\nFROM shipments\nWHERE status = 'delivered'\nGROUP BY service\nORDER BY service ASC;`, order: "exact" },
    ],
  },
  {
    id: "c39",
    difficulty: "Medium",
    company: "FedEx",
    title: "Tender calendar",
    scenario:
      "Capacity planning reads the tender calendar month by month.",
    steps: [
      { prompt: "Count shipments per ship month: ym, shipment_count, ordered by ym ascending.", code: `SELECT strftime('%Y-%m', ship_date) AS ym, COUNT(*) AS shipment_count\nFROM shipments\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Count June 2026 tenders. One column: june_tenders.", code: `SELECT COUNT(*) AS june_tenders\nFROM shipments\nWHERE ship_date BETWEEN '2026-06-01' AND '2026-06-30';`, order: "exact" },
    ],
  },
  {
    id: "c40",
    difficulty: "Medium",
    company: "UPS",
    title: "Unbilled backlog",
    scenario:
      "Finance hunts the shipments with no invoice and labels why each one is unbilled.",
    steps: [
      { prompt: "List shipments with no invoice row: shipment_id, customer_id, status, ordered by shipment_id ascending.", code: `SELECT s.shipment_id, s.customer_id, s.status\nFROM shipments s\nWHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.shipment_id = s.shipment_id)\nORDER BY s.shipment_id ASC;`, order: "exact" },
      { prompt: "Count in_transit shipments lacking an invoice. One column: unbilled_in_transit.", code: `SELECT COUNT(*) AS unbilled_in_transit\nFROM shipments s\nWHERE s.status = 'in_transit'\n  AND NOT EXISTS (SELECT 1 FROM invoices i WHERE i.shipment_id = s.shipment_id);`, order: "exact" },
    ],
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "c41",
    difficulty: "Hard",
    company: "FedEx",
    title: "The rank registry",
    scenario:
      "The analytics review rebuilds the customer leaderboard with both ranking semantics side by side.",
    steps: [
      { prompt: "Rank customers by delivered freight with RANK and DENSE_RANK: customer_id, freight_cents, rank_r, dense_r, ordered by rank_r then customer_id.", code: `WITH t AS (\n  SELECT customer_id, SUM(freight_cents) AS f\n  FROM shipments WHERE status = 'delivered'\n  GROUP BY customer_id)\nSELECT customer_id, f AS freight_cents,\n       RANK() OVER (ORDER BY f DESC) AS rank_r,\n       DENSE_RANK() OVER (ORDER BY f DESC) AS dense_r\nFROM t\nORDER BY rank_r ASC, customer_id ASC;`, order: "exact" },
      { prompt: "Build the 18000 tie registry with GROUP_CONCAT. One column: tie_registry.", code: `SELECT GROUP_CONCAT(customer_id) AS tie_registry\nFROM (SELECT customer_id, SUM(freight_cents) f\n      FROM shipments WHERE status = 'delivered'\n      GROUP BY customer_id HAVING f = 18000);`, order: "exact" },
    ],
  },
  {
    id: "c42",
    difficulty: "Hard",
    company: "UPS",
    title: "The whale dossier",
    scenario:
      "The strategy deck quantifies the whale's grip and the flip his exclusion causes.",
    steps: [
      { prompt: "One row: whale_freight_cents (customer 10 delivered), grand_total_cents, whale_share_pct (2 decimals), na_with_whale_cents, na_without_whale_cents.", code: `SELECT\n  (SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered' AND customer_id = 10) AS whale_freight_cents,\n  (SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered') AS grand_total_cents,\n  ROUND((SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered' AND customer_id = 10) * 100.0\n        / (SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered'), 2) AS whale_share_pct,\n  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n   WHERE s.status = 'delivered' AND c.region = 'NA') AS na_with_whale_cents,\n  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n   WHERE s.status = 'delivered' AND c.region = 'NA' AND s.customer_id <> 10) AS na_without_whale_cents;`, order: "exact" },
      { prompt: "Rank regions by delivered freight EXCLUDING the whale: region, ex_whale_freight_cents, rank_r, ordered by rank ascending.", code: `SELECT c.region, SUM(s.freight_cents) AS ex_whale_freight_cents,\n       RANK() OVER (ORDER BY SUM(s.freight_cents) DESC) AS rank_r\nFROM shipments s\nJOIN customers c ON c.customer_id = s.customer_id\nWHERE s.status = 'delivered' AND s.customer_id <> 10\nGROUP BY c.region\nORDER BY rank_r ASC;`, order: "exact" },
    ],
  },
  {
    id: "c43",
    difficulty: "Hard",
    company: "DHL",
    title: "The velocity wall",
    scenario:
      "Loss prevention measures scan velocity per driver and prices the 300-second line both ways.",
    steps: [
      { prompt: "One row counting same-driver scan pairs: pairs_le_300, pairs_lt_300, pairs_eq_300.", code: `SELECT COUNT(*) AS pairs_le_300,\n       SUM(CASE WHEN b.event_ts - a.event_ts < 300 THEN 1 ELSE 0 END) AS pairs_lt_300,\n       SUM(CASE WHEN b.event_ts - a.event_ts = 300 THEN 1 ELSE 0 END) AS pairs_eq_300\nFROM shipment_events a\nJOIN shipment_events b ON b.driver_id = a.driver_id\n  AND b.event_id > a.event_id AND b.event_ts > a.event_ts\nWHERE a.driver_id IS NOT NULL\n  AND b.event_ts - a.event_ts <= 300;`, order: "exact" },
      { prompt: "Count pairs at exactly 60 seconds for driver 3. One column: pairs_60.", code: `SELECT COUNT(*) AS pairs_60\nFROM shipment_events a\nJOIN shipment_events b ON b.driver_id = a.driver_id\n  AND b.event_id > a.event_id AND b.event_ts > a.event_ts\nWHERE a.driver_id = 3 AND b.event_ts - a.event_ts = 60;`, order: "exact" },
    ],
  },
  {
    id: "c44",
    difficulty: "Hard",
    company: "Maersk",
    title: "Session forensics",
    scenario:
      "The route-analytics spike sessionizes the two boundary drivers and prices the cutoff both ways.",
    steps: [
      { prompt: "Sessionize driver 5 with the 1800s cutoff: one row with strict_sessions (>1800 splits) and inclusive_sessions (>=1800 splits).", code: `WITH ordered AS (\n  SELECT event_ts,\n         LAG(event_ts) OVER (ORDER BY event_ts) AS prev_ts\n  FROM shipment_events WHERE driver_id = 5),\nflagged AS (\n  SELECT event_ts,\n         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_s,\n         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts >= 1800 THEN 1 ELSE 0 END AS new_i\n  FROM ordered)\nSELECT SUM(new_s) AS strict_sessions, SUM(new_i) AS inclusive_sessions\nFROM flagged;`, order: "exact" },
      { prompt: "Sessionize driver 3 the same strict way. One column: d3_strict_sessions.", code: `WITH ordered AS (\n  SELECT event_ts,\n         LAG(event_ts) OVER (ORDER BY event_ts) AS prev_ts\n  FROM shipment_events WHERE driver_id = 3),\nflagged AS (\n  SELECT CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_s\n  FROM ordered)\nSELECT SUM(new_s) AS d3_strict_sessions\nFROM flagged;`, order: "exact" },
    ],
  },
  {
    id: "c45",
    difficulty: "Hard",
    company: "Freightline",
    title: "Daily leaderboard",
    scenario:
      "The tender-volume review ranks ship dates — the 27000 four-way tie fronts the register.",
    steps: [
      { prompt: "Rank ship dates by tendered freight (all rows, cancelled carry 0): ship_date, day_freight_cents, rank_r, ordered by rank then date, top 8.", code: `WITH daily AS (\n  SELECT ship_date, SUM(freight_cents) AS f\n  FROM shipments GROUP BY ship_date)\nSELECT ship_date, f AS day_freight_cents,\n       RANK() OVER (ORDER BY f DESC) AS rank_r\nFROM daily\nORDER BY rank_r ASC, ship_date ASC\nLIMIT 8;`, order: "exact" },
      { prompt: "Build the tie registry for the 27000 day-total: one column, date_registry (dates in date order).", code: `SELECT GROUP_CONCAT(ship_date) AS date_registry\nFROM (SELECT ship_date, SUM(freight_cents) f\n      FROM shipments GROUP BY ship_date HAVING f = 27000\n      ORDER BY ship_date);`, order: "exact" },
    ],
  },
  {
    id: "c46",
    difficulty: "Hard",
    company: "Portside",
    title: "The aging board",
    scenario:
      "The in-transit review buckets ages against the 30-day escalation line.",
    steps: [
      { prompt: "Bucket in_transit ages as of 2026-07-01 ('0-7', '8-30' inclusive of 30, '31+'): bucket, shipment_count, ordered by bucket ascending.", code: `SELECT CASE WHEN CAST(julianday('2026-07-01') - julianday(ship_date) AS INT) <= 7 THEN '0-7'\n            WHEN CAST(julianday('2026-07-01') - julianday(ship_date) AS INT) <= 30 THEN '8-30'\n            ELSE '31+' END AS bucket,\n       COUNT(*) AS shipment_count\nFROM shipments\nWHERE status = 'in_transit'\nGROUP BY bucket\nORDER BY bucket ASC;`, order: "exact" },
      { prompt: "List in_transit rows past their promise with days past: shipment_id, service, promised_date, days_past_promise, ordered by days_past_promise descending.", code: `SELECT shipment_id, service, promised_date,\n       CAST(julianday('2026-07-01') - julianday(promised_date) AS INT) AS days_past_promise\nFROM shipments\nWHERE status = 'in_transit' AND promised_date < '2026-07-01'\nORDER BY days_past_promise DESC;`, order: "exact" },
    ],
  },
  {
    id: "c47",
    difficulty: "Hard",
    company: "FedEx",
    title: "The inclusive/strict split",
    scenario:
      "The SLA committee prices both readings of 'on time' per service in one matrix.",
    steps: [
      { prompt: "Per service: service, on_time_inclusive (delivered <= promised), on_time_strict (delivered < promised), ordered by service ascending.", code: `SELECT service,\n       SUM(CASE WHEN delivered_date <= promised_date THEN 1 ELSE 0 END) AS on_time_inclusive,\n       SUM(CASE WHEN delivered_date < promised_date THEN 1 ELSE 0 END) AS on_time_strict\nFROM shipments\nWHERE status = 'delivered'\nGROUP BY service\nORDER BY service ASC;`, order: "exact" },
      { prompt: "List the SLA-line survivors — delivered exactly on promised: shipment_id, customer_id, service, delivered_date, ordered by shipment_id ascending.", code: `SELECT shipment_id, customer_id, service, delivered_date\nFROM shipments\nWHERE status = 'delivered' AND delivered_date = promised_date\nORDER BY shipment_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c48",
    difficulty: "Hard",
    company: "UPS",
    title: "The retention gap",
    scenario:
      "Data engineering audits the scan stream: which delivered shipments predate the window, by month.",
    steps: [
      { prompt: "Count delivered shipments with no scans per ship month: ym, missing_scan_count, ordered by ym ascending.", code: `SELECT strftime('%Y-%m', s.ship_date) AS ym, COUNT(*) AS missing_scan_count\nFROM shipments s\nWHERE s.status = 'delivered'\n  AND NOT EXISTS (SELECT 1 FROM shipment_events e WHERE e.shipment_id = s.shipment_id)\nGROUP BY ym\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Count delivered shipments WITH a full delivered scan (an event of type 'delivered'). One column: scanned_deliveries.", code: `SELECT COUNT(*) AS scanned_deliveries\nFROM shipments s\nWHERE s.status = 'delivered'\n  AND EXISTS (SELECT 1 FROM shipment_events e WHERE e.shipment_id = s.shipment_id AND e.event_type = 'delivered');`, order: "exact" },
    ],
  },
  {
    id: "c49",
    difficulty: "Hard",
    company: "DHL",
    title: "The tie ledger",
    scenario:
      "The daily-freight audit registers every tie group of ship dates, biggest money first.",
    steps: [
      { prompt: "List day-total tie groups (2+ days): day_freight_cents, tie_size, date_registry (dates in date order), ordered by day_freight_cents descending.", code: `WITH daily AS (\n  SELECT ship_date, SUM(freight_cents) AS f\n  FROM shipments GROUP BY ship_date)\nSELECT f AS day_freight_cents, COUNT(*) AS tie_size,\n       GROUP_CONCAT(ship_date) AS date_registry\nFROM (SELECT ship_date, f FROM daily ORDER BY ship_date)\nGROUP BY f\nHAVING COUNT(*) >= 2\nORDER BY day_freight_cents DESC;`, order: "exact" },
      { prompt: "Count the tie groups. One column: tie_group_count.", code: `SELECT COUNT(*) AS tie_group_count\nFROM (SELECT ship_date, SUM(freight_cents) f\n      FROM shipments GROUP BY ship_date HAVING f IN\n        (SELECT f2 FROM (SELECT SUM(freight_cents) f2 FROM shipments GROUP BY ship_date) GROUP BY f2 HAVING COUNT(*) >= 2));`, order: "exact" },
    ],
  },
  {
    id: "c50",
    difficulty: "Hard",
    company: "Maersk",
    title: "The insurance line",
    scenario:
      "Risk prices the escalation threshold both ways and lists what touches it.",
    steps: [
      { prompt: "One row: ge_200000 (claims >= 200000) and gt_200000 (claims > 200000).", code: `SELECT SUM(CASE WHEN claimed_cents >= 200000 THEN 1 ELSE 0 END) AS ge_200000,\n       SUM(CASE WHEN claimed_cents > 200000 THEN 1 ELSE 0 END) AS gt_200000\nFROM freight_claims;`, order: "exact" },
      { prompt: "List the 48000 twins: claim_id, shipment_id, status, ordered by claim_id ascending.", code: `SELECT claim_id, shipment_id, status\nFROM freight_claims\nWHERE claimed_cents = 48000\nORDER BY claim_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c51",
    difficulty: "Hard",
    company: "Freightline",
    title: "The HOS ledger",
    scenario:
      "Compliance audits duty lengths against the 14-hour line, then names the exceptions.",
    steps: [
      { prompt: "Classify shifts ('over' > 50400, 'on_line' = 50400, 'legal' below): bucket, shift_count, ordered by bucket ascending.", code: `SELECT CASE WHEN end_ts - start_ts > 50400 THEN 'over'\n            WHEN end_ts - start_ts = 50400 THEN 'on_line'\n            ELSE 'legal' END AS bucket,\n       COUNT(*) AS shift_count\nFROM driver_shifts\nGROUP BY bucket\nORDER BY bucket ASC;`, order: "exact" },
      { prompt: "List the shift that runs over the line: driver_id, duty_date, duty_seconds (end_ts - start_ts). One row.", code: `SELECT driver_id, duty_date, end_ts - start_ts AS duty_seconds\nFROM driver_shifts\nWHERE end_ts - start_ts > 50400;`, order: "exact" },
    ],
  },
  {
    id: "c52",
    difficulty: "Hard",
    company: "Portside",
    title: "Duty books",
    scenario:
      "Operations totals the duty ledger per driver — the km crown and the delivery tie.",
    steps: [
      { prompt: "Per driver: driver_id, name, total_deliveries, total_km, ordered by total_km descending.", code: `SELECT d.driver_id, d.name,\n       SUM(sh.deliveries_made) AS total_deliveries,\n       SUM(sh.distance_km) AS total_km\nFROM drivers d\nJOIN driver_shifts sh ON sh.driver_id = d.driver_id\nGROUP BY d.driver_id, d.name\nORDER BY total_km DESC;`, order: "exact" },
      { prompt: "List the drivers tied at exactly 58 total deliveries: driver_id, total_deliveries, ordered by driver_id ascending.", code: `SELECT driver_id, SUM(deliveries_made) AS total_deliveries\nFROM driver_shifts\nGROUP BY driver_id\nHAVING SUM(deliveries_made) = 58\nORDER BY driver_id ASC;`, order: "exact" },
    ],
  },
  {
    id: "c53",
    difficulty: "Hard",
    company: "FedEx",
    title: "Network honest zeros",
    scenario:
      "The network scorecard keeps every hub visible — origins and scans, zeros and all.",
    steps: [
      { prompt: "Per warehouse: warehouse_id, city, origin_count, scan_count, ordered by warehouse_id ascending.", code: `SELECT w.warehouse_id, w.city,\n       (SELECT COUNT(*) FROM shipments s WHERE s.origin_wh = w.warehouse_id) AS origin_count,\n       (SELECT COUNT(*) FROM shipment_events e WHERE e.warehouse_id = w.warehouse_id) AS scan_count\nFROM warehouses w\nORDER BY w.warehouse_id ASC;`, order: "exact" },
      { prompt: "Count warehouses with zero origin shipments. One column: dark_hubs.", code: `SELECT COUNT(*) AS dark_hubs\nFROM warehouses w\nWHERE NOT EXISTS (SELECT 1 FROM shipments s WHERE s.origin_wh = w.warehouse_id);`, order: "exact" },
    ],
  },
  {
    id: "c54",
    difficulty: "Hard",
    company: "UPS",
    title: "The LATAM spine",
    scenario:
      "The region review builds the month spine for LATAM and lets March's zero speak.",
    steps: [
      { prompt: "Month spine Jan-Jun 2026 with LATAM shipment counts: ym, latam_count, ordered by ym ascending.", code: `WITH months AS (\n  SELECT '2026-01' AS ym UNION SELECT '2026-02' UNION SELECT '2026-03'\n  UNION SELECT '2026-04' UNION SELECT '2026-05' UNION SELECT '2026-06')\nSELECT m.ym,\n       (SELECT COUNT(*) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n        WHERE c.region = 'LATAM' AND strftime('%Y-%m', s.ship_date) = m.ym) AS latam_count\nFROM months m\nORDER BY m.ym ASC;`, order: "exact" },
      { prompt: "Count the months where LATAM tendered zero shipments. One column: dark_months.", code: `WITH months AS (\n  SELECT '2026-01' AS ym UNION SELECT '2026-02' UNION SELECT '2026-03'\n  UNION SELECT '2026-04' UNION SELECT '2026-05' UNION SELECT '2026-06')\nSELECT COUNT(*) AS dark_months\nFROM months m\nWHERE (SELECT COUNT(*) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n       WHERE c.region = 'LATAM' AND strftime('%Y-%m', s.ship_date) = m.ym) = 0;`, order: "exact" },
    ],
  },
  {
    id: "c55",
    difficulty: "Hard",
    company: "DHL",
    title: "Duplicate quotes",
    scenario:
      "Pricing hunts duplicate-quote lanes: same origin, same service, same money.",
    steps: [
      { prompt: "List shipments sharing origin_wh + service + freight_cents with another shipment: shipment_id, customer_id, origin_wh, service, freight_cents, ordered by freight descending then shipment_id ascending.", code: `SELECT s.shipment_id, s.customer_id, s.origin_wh, s.service, s.freight_cents\nFROM shipments s\nWHERE EXISTS (\n  SELECT 1 FROM shipments t\n  WHERE t.shipment_id <> s.shipment_id\n    AND t.origin_wh = s.origin_wh AND t.service = s.service\n    AND t.freight_cents = s.freight_cents)\nORDER BY s.freight_cents DESC, s.shipment_id ASC;`, order: "exact" },
      { prompt: "Count those duplicate-quote shipments. One column: mirror_count.", code: `SELECT COUNT(*) AS mirror_count\nFROM shipments s\nWHERE EXISTS (\n  SELECT 1 FROM shipments t\n  WHERE t.shipment_id <> s.shipment_id\n    AND t.origin_wh = s.origin_wh AND t.service = s.service\n    AND t.freight_cents = s.freight_cents);`, order: "exact" },
    ],
  },
  {
    id: "c56",
    difficulty: "Hard",
    company: "Maersk",
    title: "Running freight curve",
    scenario:
      "The half-year review draws the cumulative delivered-freight curve from the monthly bars.",
    steps: [
      { prompt: "Monthly delivered freight with a running total: ym, month_freight_cents, running_freight_cents, ordered by ym ascending.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', ship_date) AS ym, SUM(freight_cents) AS f\n  FROM shipments WHERE status = 'delivered'\n  GROUP BY ym)\nSELECT ym, f AS month_freight_cents,\n       SUM(f) OVER (ORDER BY ym) AS running_freight_cents\nFROM monthly\nORDER BY ym ASC;`, order: "exact" },
      { prompt: "Read the curve's final value (through June). One column: final_running_cents.", code: `WITH monthly AS (\n  SELECT strftime('%Y-%m', ship_date) AS ym, SUM(freight_cents) AS f\n  FROM shipments WHERE status = 'delivered'\n  GROUP BY ym)\nSELECT SUM(f) OVER (ORDER BY ym) AS final_running_cents\nFROM monthly ORDER BY ym DESC LIMIT 1;`, order: "exact" },
    ],
  },
  {
    id: "c57",
    difficulty: "Hard",
    company: "Freightline",
    title: "The claim funnel",
    scenario:
      "The claims review prices each status's share of the book in one pass.",
    steps: [
      { prompt: "Per status: status, claim_count, claimed_total_cents, pct_of_book (2 decimals), ordered by claim_count descending then status ascending.", code: `WITH by_status AS (\n  SELECT status, COUNT(*) AS n, SUM(claimed_cents) AS c\n  FROM freight_claims GROUP BY status),\ntotal AS (SELECT SUM(claimed_cents) AS t FROM freight_claims)\nSELECT b.status, b.n AS claim_count, b.c AS claimed_total_cents,\n       ROUND(b.c * 100.0 / t.t, 2) AS pct_of_book\nFROM by_status b CROSS JOIN total t\nORDER BY b.n DESC, b.status ASC;`, order: "exact" },
      { prompt: "Compute the open share of the book (2 decimals). One column: open_pct.", code: `SELECT ROUND((SELECT SUM(claimed_cents) FROM freight_claims WHERE status = 'open') * 100.0\n       / (SELECT SUM(claimed_cents) FROM freight_claims), 2) AS open_pct;`, order: "exact" },
    ],
  },
  {
    id: "c58",
    difficulty: "Hard",
    company: "Portside",
    title: "The overdue dossier",
    scenario:
      "The promise desk builds the overdue in-transit dossier with delivery-scan forensics.",
    steps: [
      { prompt: "List in_transit rows past promise as of 2026-07-01 with an out_for_delivery flag (1/0): shipment_id, customer_id, service, days_past_promise, scanned_ofd, ordered by days_past_promise descending.", code: `SELECT s.shipment_id, s.customer_id, s.service,\n       CAST(julianday('2026-07-01') - julianday(s.promised_date) AS INT) AS days_past_promise,\n       CASE WHEN EXISTS (SELECT 1 FROM shipment_events e\n                         WHERE e.shipment_id = s.shipment_id\n                           AND e.event_type = 'out_for_delivery') THEN 1 ELSE 0 END AS scanned_ofd\nFROM shipments s\nWHERE s.status = 'in_transit' AND s.promised_date < '2026-07-01'\nORDER BY days_past_promise DESC;`, order: "exact" },
      { prompt: "Count in-transit rows whose last scan is a hub departure (never scanned for delivery). One column: vanished_count.", code: `SELECT COUNT(*) AS vanished_count\nFROM shipments s\nWHERE s.status = 'in_transit'\n  AND NOT EXISTS (SELECT 1 FROM shipment_events e\n                  WHERE e.shipment_id = s.shipment_id AND e.event_type = 'out_for_delivery');`, order: "exact" },
    ],
  },
  {
    id: "c59",
    difficulty: "Hard",
    company: "FedEx",
    title: "Duty vs scans",
    scenario:
      "The workforce analytics spike joins the duty ledger to the scan stream — two systems, one roster.",
    steps: [
      { prompt: "Per driver: driver_id, name, shift_count, total_deliveries, scan_count, ordered by total_deliveries descending then driver_id ascending.", code: `SELECT d.driver_id, d.name,\n       (SELECT COUNT(*) FROM driver_shifts sh WHERE sh.driver_id = d.driver_id) AS shift_count,\n       (SELECT SUM(sh.deliveries_made) FROM driver_shifts sh WHERE sh.driver_id = d.driver_id) AS total_deliveries,\n       (SELECT COUNT(*) FROM shipment_events e WHERE e.driver_id = d.driver_id) AS scan_count\nFROM drivers d\nORDER BY total_deliveries DESC, d.driver_id ASC;`, order: "exact" },
      { prompt: "Find the longest duty spell (end_ts - start_ts). One column: max_duty_seconds.", code: `SELECT MAX(end_ts - start_ts) AS max_duty_seconds\nFROM driver_shifts;`, order: "exact" },
    ],
  },
  {
    id: "c60",
    difficulty: "Hard",
    company: "UPS",
    title: "The whale's shadow",
    scenario:
      "The closing slide: without the whale, who leads the network — and by how much does NA fall?",
    steps: [
      { prompt: "One row: emea_freight_cents (delivered), na_without_whale_cents, gap_cents = EMEA minus NA-ex-whale.", code: `SELECT\n  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n   WHERE s.status = 'delivered' AND c.region = 'EMEA') AS emea_freight_cents,\n  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n   WHERE s.status = 'delivered' AND c.region = 'NA' AND s.customer_id <> 10) AS na_without_whale_cents,\n  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n   WHERE s.status = 'delivered' AND c.region = 'EMEA') -\n  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id\n   WHERE s.status = 'delivered' AND c.region = 'NA' AND s.customer_id <> 10) AS gap_cents;`, order: "exact" },
      { prompt: "Rank ALL customers by delivered freight and list the top 4: customer_id, freight_cents, rank_r, ordered by rank ascending.", code: `WITH t AS (\n  SELECT customer_id, SUM(freight_cents) AS f\n  FROM shipments WHERE status = 'delivered'\n  GROUP BY customer_id)\nSELECT customer_id, f AS freight_cents,\n       RANK() OVER (ORDER BY f DESC) AS rank_r\nFROM t\nORDER BY rank_r ASC\nLIMIT 4;`, order: "exact" },
    ],
  },
];
