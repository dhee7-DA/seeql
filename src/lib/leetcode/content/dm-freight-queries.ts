// Domain Mastery — Logistics & Freight · 60 query problems (20 Easy / 20
// Medium / 20 Hard), all reading the ONE shared world seed in
// dm-freight-seed.ts. Statements cite only probe-verified facts
// (scripts/r14-freight-probe.ts + scripts/r14-facts.txt). Expected outputs
// are engine-generated into dm-expected.ts by scripts/dm-verify.ts — never
// hand-written.
import type { DmQuery } from "../domain-packs";

export const DM_FREIGHT_QUERIES: DmQuery[] = [
  // ---------------------------------------------------------------- Easy 20
  {
    id: "q01",
    difficulty: "Easy",
    company: "FedEx",
    title: "Delivered count",
    statement:
      "The shipment book mixes delivered, in_transit, exception, returned and cancelled rows. Count how many shipments have status 'delivered'. Output a single column delivered_count with one row.",
    code: `SELECT COUNT(*) AS delivered_count
FROM shipments
WHERE status = 'delivered';`,
    order: "exact",
  },
  {
    id: "q02",
    difficulty: "Easy",
    company: "UPS",
    title: "The exception board",
    statement:
      "Four shipments are sitting in exception status — the customs hold, the damaged parcels, the lost one. List them: shipment_id, customer_id, service, ship_date, ordered by shipment_id ascending.",
    code: `SELECT shipment_id, customer_id, service, ship_date
FROM shipments
WHERE status = 'exception'
ORDER BY shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q03",
    difficulty: "Easy",
    company: "DHL",
    title: "Service catalog",
    statement:
      "List every distinct service level in the shipments table, one per row, ordered alphabetically. Single column: service.",
    code: `SELECT DISTINCT service
FROM shipments
ORDER BY service ASC;`,
    order: "exact",
  },
  {
    id: "q04",
    difficulty: "Easy",
    company: "Maersk",
    title: "Status census",
    statement:
      "Count the shipments per status. Output status and shipment_count, ordered by shipment_count descending, then status ascending. Delivered dominates; the two single-row statuses sort alphabetically.",
    code: `SELECT status, COUNT(*) AS shipment_count
FROM shipments
GROUP BY status
ORDER BY shipment_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q05",
    difficulty: "Easy",
    company: "Freightline",
    title: "March economy runs",
    statement:
      "List every economy shipment tendered in March 2026. Output shipment_id, customer_id, ship_date, promised_date and freight_cents, ordered by ship_date ascending. Note how far the promise sits past the ship date.",
    code: `SELECT shipment_id, customer_id, ship_date, promised_date, freight_cents
FROM shipments
WHERE service = 'economy'
  AND ship_date BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY ship_date ASC;`,
    order: "exact",
  },
  {
    id: "q06",
    difficulty: "Easy",
    company: "Portside",
    title: "Hub directory",
    statement:
      "List the full hub roster. Output warehouse_id, city, region and hub_type, ordered by warehouse_id ascending. One of these six gates never originates a shipment.",
    code: `SELECT warehouse_id, city, region, hub_type
FROM warehouses
ORDER BY warehouse_id ASC;`,
    order: "exact",
  },
  {
    id: "q07",
    difficulty: "Easy",
    company: "FedEx",
    title: "Driver roster",
    statement:
      "List every driver. Output driver_id, name, region and vehicle, ordered by driver_id ascending.",
    code: `SELECT driver_id, name, region, vehicle
FROM drivers
ORDER BY driver_id ASC;`,
    order: "exact",
  },
  {
    id: "q08",
    difficulty: "Easy",
    company: "UPS",
    title: "Shipper segments",
    statement:
      "Count the shippers per segment. Output segment and customer_count, ordered by customer_count descending, then segment ascending. Two startups book the smallest slice.",
    code: `SELECT segment, COUNT(*) AS customer_count
FROM customers
GROUP BY segment
ORDER BY customer_count DESC, segment ASC;`,
    order: "exact",
  },
  {
    id: "q09",
    difficulty: "Easy",
    company: "DHL",
    title: "Premium freight",
    statement:
      "List every shipment quoted above 30000 cents of freight. Output shipment_id, customer_id, service and freight_cents, ordered by freight_cents descending, then shipment_id ascending. The whale's April record tops the board.",
    code: `SELECT shipment_id, customer_id, service, freight_cents
FROM shipments
WHERE freight_cents > 30000
ORDER BY freight_cents DESC, shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q10",
    difficulty: "Easy",
    company: "Maersk",
    title: "Average lane length",
    statement:
      "Compute the average distance_km across all 58 shipments, rounded to the nearest whole kilometer. One column: avg_distance_km.",
    code: `SELECT ROUND(AVG(distance_km), 0) AS avg_distance_km
FROM shipments;`,
    order: "exact",
  },
  {
    id: "q11",
    difficulty: "Easy",
    company: "Freightline",
    title: "Disputed invoices",
    statement:
      "List every disputed invoice. Output invoice_id, customer_id, shipment_id and base_cents, ordered by invoice_id ascending. Two of the three are the repriced drift rows.",
    code: `SELECT invoice_id, customer_id, shipment_id, base_cents
FROM invoices
WHERE status = 'disputed'
ORDER BY invoice_id ASC;`,
    order: "exact",
  },
  {
    id: "q12",
    difficulty: "Easy",
    company: "Portside",
    title: "The lost one",
    statement:
      "List every freight claim of type 'lost'. Output claim_id, shipment_id, claimed_cents, status, ordered by claim_id ascending. Its claimed_cents sits exactly on the insurance line.",
    code: `SELECT claim_id, shipment_id, claimed_cents, status
FROM freight_claims
WHERE claim_type = 'lost'
ORDER BY claim_id ASC;`,
    order: "exact",
  },
  {
    id: "q13",
    difficulty: "Easy",
    company: "FedEx",
    title: "Mix by service",
    statement:
      "Count the shipments per service. Output service and shipment_count, ordered by shipment_count descending, then service ascending. Standard is the workhorse; express is the premium few.",
    code: `SELECT service, COUNT(*) AS shipment_count
FROM shipments
GROUP BY service
ORDER BY shipment_count DESC, service ASC;`,
    order: "exact",
  },
  {
    id: "q14",
    difficulty: "Easy",
    company: "UPS",
    title: "Never happened",
    statement:
      "List the cancelled shipments — tenders withdrawn before pickup, billed at zero. Output shipment_id, customer_id, ship_date, freight_cents, ordered by shipment_id ascending.",
    code: `SELECT shipment_id, customer_id, ship_date, freight_cents
FROM shipments
WHERE status = 'cancelled'
ORDER BY shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q15",
    difficulty: "Easy",
    company: "DHL",
    title: "Open exposure",
    statement:
      "Sum claimed_cents across the open claims — the money still at stake. One column: open_exposure_cents.",
    code: `SELECT SUM(claimed_cents) AS open_exposure_cents
FROM freight_claims
WHERE status = 'open';`,
    order: "exact",
  },
  {
    id: "q16",
    difficulty: "Easy",
    company: "Maersk",
    title: "Overdue in transit",
    statement:
      "List the in_transit shipments whose promised_date is before 2026-06-15 — freight that should already have landed. Output shipment_id, customer_id, service, promised_date, ordered by promised_date ascending.",
    code: `SELECT shipment_id, customer_id, service, promised_date
FROM shipments
WHERE status = 'in_transit'
  AND promised_date < '2026-06-15'
ORDER BY promised_date ASC;`,
    order: "exact",
  },
  {
    id: "q17",
    difficulty: "Easy",
    company: "Freightline",
    title: "Top 5 by freight",
    statement:
      "List the five biggest shipments by quoted freight. Output shipment_id, customer_id, service, freight_cents, ordered by freight_cents descending, then shipment_id ascending. Watch the 36000 tie — same quote, one delivered on its promise line, one still in the wind.",
    code: `SELECT shipment_id, customer_id, service, freight_cents
FROM shipments
ORDER BY freight_cents DESC, shipment_id ASC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q18",
    difficulty: "Easy",
    company: "Portside",
    title: "Scan vocabulary",
    statement:
      "Count the scan events per event_type. Output event_type and event_count, ordered by event_count descending, then event_type ascending. Pickups and hub arrivals lead; exceptions are the rare tail.",
    code: `SELECT event_type, COUNT(*) AS event_count
FROM shipment_events
GROUP BY event_type
ORDER BY event_count DESC, event_type ASC;`,
    order: "exact",
  },
  {
    id: "q19",
    difficulty: "Easy",
    company: "FedEx",
    title: "Class of 2026",
    statement:
      "List the shippers onboarded in calendar 2026. Output customer_id, name, region, onboarded_date, ordered by onboarded_date ascending. Six names — and no one joined in March.",
    code: `SELECT customer_id, name, region, onboarded_date
FROM customers
WHERE onboarded_date >= '2026-01-01'
ORDER BY onboarded_date ASC;`,
    order: "exact",
  },
  {
    id: "q20",
    difficulty: "Easy",
    company: "UPS",
    title: "Total claimed",
    statement:
      "Sum claimed_cents over the whole claim book. One column: total_claimed_cents.",
    code: `SELECT SUM(claimed_cents) AS total_claimed_cents
FROM freight_claims;`,
    order: "exact",
  },

  // -------------------------------------------------------------- Medium 20
  {
    id: "q21",
    difficulty: "Medium",
    company: "FedEx",
    title: "Delivered freight by shipper",
    statement:
      "For every customer — including those with nothing delivered — sum the freight_cents of their delivered shipments. Output customer_id, name, delivered_freight_cents (0 when none), ordered by the total descending, then customer_id ascending. The dormant potter shows up at exactly 0.",
    code: `SELECT c.customer_id, c.name, COALESCE(SUM(s.freight_cents), 0) AS delivered_freight_cents
FROM customers c
LEFT JOIN shipments s ON s.customer_id = c.customer_id AND s.status = 'delivered'
GROUP BY c.customer_id, c.name
ORDER BY delivered_freight_cents DESC, c.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q22",
    difficulty: "Medium",
    company: "UPS",
    title: "Regional books",
    statement:
      "Sum delivered freight by the customer's home region. Output region and region_freight_cents, ordered by the total descending. NA leads — but only because one shipper carries it.",
    code: `SELECT c.region, SUM(s.freight_cents) AS region_freight_cents
FROM shipments s
JOIN customers c ON c.customer_id = s.customer_id
WHERE s.status = 'delivered'
GROUP BY c.region
ORDER BY region_freight_cents DESC;`,
    order: "exact",
  },
  {
    id: "q23",
    difficulty: "Medium",
    company: "DHL",
    title: "On-time vs late",
    statement:
      "For delivered shipments, classify each as 'on_time' (delivered_date <= promised_date) or 'late', and count per service. Output service, bucket, shipment_count, ordered by service ascending, then bucket ascending. Express runs 9 on-time / 3 late under the inclusive rule.",
    code: `SELECT service,
       CASE WHEN delivered_date <= promised_date THEN 'on_time' ELSE 'late' END AS bucket,
       COUNT(*) AS shipment_count
FROM shipments
WHERE status = 'delivered'
GROUP BY service, bucket
ORDER BY service ASC, bucket ASC;`,
    order: "exact",
  },
  {
    id: "q24",
    difficulty: "Medium",
    company: "Maersk",
    title: "Monthly billing curve",
    statement:
      "Total each month's invoiced money (base + fuel + accessorials). Output the month as ym ('YYYY-MM') and month_total_cents, ordered by ym ascending. June is the record; April holds the single largest invoice.",
    code: `SELECT strftime('%Y-%m', issue_date) AS ym,
       SUM(base_cents + fuel_cents + accessorial_cents) AS month_total_cents
FROM invoices
GROUP BY ym
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q25",
    difficulty: "Medium",
    company: "Freightline",
    title: "The drift audit",
    statement:
      "Join every invoice to its shipment and flag the rows where the billed base differs from the quoted freight. Output shipment_id, quoted_freight_cents, billed_base_cents, delta_cents and invoice status, ordered by shipment_id ascending. Exactly three rows — and one of them PAID.",
    code: `SELECT s.shipment_id, s.freight_cents AS quoted_freight_cents,
       i.base_cents AS billed_base_cents,
       i.base_cents - s.freight_cents AS delta_cents,
       i.status
FROM invoices i
JOIN shipments s ON s.shipment_id = i.shipment_id
WHERE i.base_cents <> s.freight_cents
ORDER BY s.shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q26",
    difficulty: "Medium",
    company: "Portside",
    title: "Fuel rule check",
    statement:
      "Finance claims fuel_cents is always ROUND(base_cents * 0.12). Count the invoices that violate the rule — the audit expects a single row with rule_violations = 0.",
    code: `SELECT COUNT(*) AS rule_violations
FROM invoices
WHERE fuel_cents <> CAST(ROUND(base_cents * 0.12) AS INTEGER);`,
    order: "exact",
  },
  {
    id: "q27",
    difficulty: "Medium",
    company: "FedEx",
    title: "Dock dwell top 5",
    statement:
      "Hub dwell is departed_hub minus arrived_hub on the same shipment. Compute it for every shipment that has both scans and list the five longest. Output shipment_id and dwell_seconds, ordered by dwell_seconds descending. The customs hold and the marathon Rotterdam lane lead; the third row sits EXACTLY on a full 86400-second dock day.",
    code: `SELECT a.shipment_id,
       d.event_ts - a.event_ts AS dwell_seconds
FROM shipment_events a
JOIN shipment_events d ON d.shipment_id = a.shipment_id
  AND d.event_type = 'departed_hub'
WHERE a.event_type = 'arrived_hub'
ORDER BY dwell_seconds DESC, a.shipment_id ASC
LIMIT 5;`,
    order: "exact",
  },
  {
    id: "q28",
    difficulty: "Medium",
    company: "UPS",
    title: "Claims money by status",
    statement:
      "Group the claim book by status: count the claims and sum the claimed money. Output status, claim_count, claimed_total_cents, ordered by claim_count descending, then status ascending.",
    code: `SELECT status, COUNT(*) AS claim_count, SUM(claimed_cents) AS claimed_total_cents
FROM freight_claims
GROUP BY status
ORDER BY claim_count DESC, status ASC;`,
    order: "exact",
  },
  {
    id: "q29",
    difficulty: "Medium",
    company: "DHL",
    title: "Scan workload per driver",
    statement:
      "Count each driver's scan events — include every driver, even those with barely any scans. Output driver_id, name, scan_count, ordered by scan_count descending, then driver_id ascending. Driver 5 leads; a one-shipment doorstep sits at the bottom.",
    code: `SELECT d.driver_id, d.name, COUNT(e.event_id) AS scan_count
FROM drivers d
LEFT JOIN shipment_events e ON e.driver_id = d.driver_id
GROUP BY d.driver_id, d.name
ORDER BY scan_count DESC, d.driver_id ASC;`,
    order: "exact",
  },
  {
    id: "q30",
    difficulty: "Medium",
    company: "Maersk",
    title: "Shipments per origin hub",
    statement:
      "Count shipments by origin warehouse, keeping every hub in the output even the one with zero. Output warehouse_id, city, origin_count, ordered by warehouse_id ascending. The dark gateway shows its honest zero.",
    code: `SELECT w.warehouse_id, w.city, COUNT(s.shipment_id) AS origin_count
FROM warehouses w
LEFT JOIN shipments s ON s.origin_wh = w.warehouse_id
GROUP BY w.warehouse_id, w.city
ORDER BY w.warehouse_id ASC;`,
    order: "exact",
  },
  {
    id: "q31",
    difficulty: "Medium",
    company: "Freightline",
    title: "Where the money flies",
    statement:
      "Sum delivered freight per service and compute each service's average shipment value (rounded to whole cents). Output service, service_freight_cents, avg_freight_cents, ordered by service_freight_cents descending. Express carries the most money on the fewest boxes.",
    code: `SELECT service, SUM(freight_cents) AS service_freight_cents,
       ROUND(AVG(freight_cents), 0) AS avg_freight_cents
FROM shipments
WHERE status = 'delivered'
GROUP BY service
ORDER BY service_freight_cents DESC;`,
    order: "exact",
  },
  {
    id: "q32",
    difficulty: "Medium",
    company: "Portside",
    title: "Billing by shipper",
    statement:
      "Total each customer's invoiced money (base + fuel + accessorials), keeping every customer in the output. Output customer_id, name, billed_total_cents (0 when none), ordered by the total descending, then customer_id ascending.",
    code: `SELECT c.customer_id, c.name,
       COALESCE(SUM(i.base_cents + i.fuel_cents + i.accessorial_cents), 0) AS billed_total_cents
FROM customers c
LEFT JOIN invoices i ON i.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY billed_total_cents DESC, c.customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q33",
    difficulty: "Medium",
    company: "FedEx",
    title: "Delivery delta histogram",
    statement:
      "For delivered shipments compute the day delta delivered_date minus promised_date and count rows per delta. Output delta_days and shipment_count, ordered by delta_days ascending. Zero is the single SLA-line survivor; the negatives dominate.",
    code: `SELECT CAST(julianday(delivered_date) - julianday(promised_date) AS INT) AS delta_days,
       COUNT(*) AS shipment_count
FROM shipments
WHERE status = 'delivered'
GROUP BY delta_days
ORDER BY delta_days ASC;`,
    order: "exact",
  },
  {
    id: "q34",
    difficulty: "Medium",
    company: "UPS",
    title: "The air tax census",
    statement:
      "Compare weight_g against dim_weight_g on every shipment: 'dim_heavier' when the dimensional weight wins (the air-tax rows), 'equal' on the exact tie, 'actual_heavier' otherwise. Output bucket and shipment_count, ordered by bucket ascending.",
    code: `SELECT CASE WHEN dim_weight_g > weight_g THEN 'dim_heavier'
            WHEN dim_weight_g = weight_g THEN 'equal'
            ELSE 'actual_heavier' END AS bucket,
       COUNT(*) AS shipment_count
FROM shipments
GROUP BY bucket
ORDER BY bucket ASC;`,
    order: "exact",
  },
  {
    id: "q35",
    difficulty: "Medium",
    company: "DHL",
    title: "Claims by type",
    statement:
      "Group claims by claim_type: count and average claimed_cents (rounded). Output claim_type, claim_count, avg_claimed_cents, ordered by claim_count descending. One lost shipment skews the average hard.",
    code: `SELECT claim_type, COUNT(*) AS claim_count,
       ROUND(AVG(claimed_cents), 0) AS avg_claimed_cents
FROM freight_claims
GROUP BY claim_type
ORDER BY claim_count DESC;`,
    order: "exact",
  },
  {
    id: "q36",
    difficulty: "Medium",
    company: "Maersk",
    title: "June deliveries with bills",
    statement:
      "List the shipments delivered in June 2026 together with their invoice total (base + fuel + accessorials). Output shipment_id, customer_id, delivered_date, invoice_total_cents, ordered by delivered_date ascending, then shipment_id ascending.",
    code: `SELECT s.shipment_id, s.customer_id, s.delivered_date,
       i.base_cents + i.fuel_cents + i.accessorial_cents AS invoice_total_cents
FROM shipments s
JOIN invoices i ON i.shipment_id = s.shipment_id
WHERE s.status = 'delivered'
  AND s.delivered_date BETWEEN '2026-06-01' AND '2026-06-30'
ORDER BY s.delivered_date ASC, s.shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q37",
    difficulty: "Medium",
    company: "Freightline",
    title: "Top 3 billing books",
    statement:
      "Rank customers by total invoiced money (base + fuel + accessorials) and list the top three with their totals. Output customer_id, name, billed_total_cents, ordered by the total descending. The whale's book is nearly double the runner-up's.",
    code: `SELECT c.customer_id, c.name,
       SUM(i.base_cents + i.fuel_cents + i.accessorial_cents) AS billed_total_cents
FROM customers c
JOIN invoices i ON i.customer_id = c.customer_id
GROUP BY c.customer_id, c.name
ORDER BY billed_total_cents DESC
LIMIT 3;`,
    order: "exact",
  },
  {
    id: "q38",
    difficulty: "Medium",
    company: "Portside",
    title: "Average dwell per hub",
    statement:
      "Average the dock dwell (departed minus arrived) per origin warehouse over the shipments that have both scans. Output warehouse_id, avg_dwell_seconds (rounded), ordered by avg_dwell_seconds descending. The Memphis gateway's average is hostage to one customs hold.",
    code: `SELECT s.origin_wh AS warehouse_id,
       ROUND(AVG(d.event_ts - a.event_ts), 0) AS avg_dwell_seconds
FROM shipment_events a
JOIN shipment_events d ON d.shipment_id = a.shipment_id
  AND d.event_type = 'departed_hub'
JOIN shipments s ON s.shipment_id = a.shipment_id
WHERE a.event_type = 'arrived_hub'
GROUP BY s.origin_wh
ORDER BY avg_dwell_seconds DESC;`,
    order: "exact",
  },
  {
    id: "q39",
    difficulty: "Medium",
    company: "FedEx",
    title: "Tender calendar",
    statement:
      "Count shipments per ship month. Output the month as ym ('YYYY-MM') and shipment_count, ordered by ym ascending. March dips from February, June surges to twenty tenders.",
    code: `SELECT strftime('%Y-%m', ship_date) AS ym, COUNT(*) AS shipment_count
FROM shipments
GROUP BY ym
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q40",
    difficulty: "Medium",
    company: "UPS",
    title: "Pending invoice aging",
    statement:
      "As of 2026-07-01, age the pending invoices (days since issue). Output invoice_id, customer_id, issue_date, age_days, ordered by age_days descending. The oldest pending has been hanging for over seven weeks.",
    code: `SELECT invoice_id, customer_id, issue_date,
       CAST(julianday('2026-07-01') - julianday(issue_date) AS INT) AS age_days
FROM invoices
WHERE status = 'pending'
ORDER BY age_days DESC;`,
    order: "exact",
  },

  // ---------------------------------------------------------------- Hard 20
  {
    id: "q41",
    difficulty: "Hard",
    company: "FedEx",
    title: "The rank registry",
    statement:
      "Rank the shippers with delivered freight (the dormant house has none and drops out) with both RANK() and DENSE_RANK(). Output customer_id, freight_cents, rank_r, dense_r, ordered by rank_r then customer_id. Customers 3 and 6 tie at exactly 18000 — watch RANK skip while DENSE_RANK doesn't, and notice which rank value the registry never prints.",
    code: `WITH t AS (
  SELECT customer_id, SUM(freight_cents) AS f
  FROM shipments WHERE status = 'delivered'
  GROUP BY customer_id)
SELECT customer_id, f AS freight_cents,
       RANK() OVER (ORDER BY f DESC) AS rank_r,
       DENSE_RANK() OVER (ORDER BY f DESC) AS dense_r
FROM t
ORDER BY rank_r ASC, customer_id ASC;`,
    order: "exact",
  },
  {
    id: "q42",
    difficulty: "Hard",
    company: "UPS",
    title: "The whale flip",
    statement:
      "Rank the regions by delivered freight EXCLUDING customer 10 — the whale whose book props up NA. Output region, ex_whale_freight_cents, and the RANK, ordered by rank ascending. NA falls from first to second behind EMEA.",
    code: `SELECT c.region, SUM(s.freight_cents) AS ex_whale_freight_cents,
       RANK() OVER (ORDER BY SUM(s.freight_cents) DESC) AS rank_r
FROM shipments s
JOIN customers c ON c.customer_id = s.customer_id
WHERE s.status = 'delivered' AND s.customer_id <> 10
GROUP BY c.region
ORDER BY rank_r ASC;`,
    order: "exact",
  },
  {
    id: "q43",
    difficulty: "Hard",
    company: "DHL",
    title: "The 300-second wall",
    statement:
      "Velocity: self-join each driver's scans to the driver's later scans within 300 seconds. Count pairs with gap <= 300, gap < 300, and gap exactly 300 — one row, columns pairs_le_300, pairs_lt_300, pairs_eq_300. Every qualifying pair belongs to one driver's 06-23 route, and one pair sits EXACTLY on the line.",
    code: `SELECT COUNT(*) AS pairs_le_300,
       SUM(CASE WHEN b.event_ts - a.event_ts < 300 THEN 1 ELSE 0 END) AS pairs_lt_300,
       SUM(CASE WHEN b.event_ts - a.event_ts = 300 THEN 1 ELSE 0 END) AS pairs_eq_300
FROM shipment_events a
JOIN shipment_events b ON b.driver_id = a.driver_id
  AND b.event_id > a.event_id AND b.event_ts > a.event_ts
WHERE a.driver_id IS NOT NULL
  AND b.event_ts - a.event_ts <= 300;`,
    order: "exact",
  },
  {
    id: "q44",
    difficulty: "Hard",
    company: "Maersk",
    title: "Sessionize the scanner",
    statement:
      "Sessionize driver 5's scan stream with the 1800-second gap cutoff: a gap strictly over 1800s starts a new session. Output strict_sessions and inclusive_sessions (where a gap of exactly 1800 also splits) in one row. The two numbers differ — driver 5 owns a pair sitting EXACTLY on the cutoff.",
    code: `WITH ordered AS (
  SELECT event_ts,
         LAG(event_ts) OVER (ORDER BY event_ts) AS prev_ts
  FROM shipment_events WHERE driver_id = 5),
flagged AS (
  SELECT event_ts,
         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END AS new_s,
         CASE WHEN prev_ts IS NULL OR event_ts - prev_ts >= 1800 THEN 1 ELSE 0 END AS new_i
  FROM ordered)
SELECT SUM(new_s) AS strict_sessions, SUM(new_i) AS inclusive_sessions
FROM flagged;`,
    order: "exact",
  },
  {
    id: "q45",
    difficulty: "Hard",
    company: "Freightline",
    title: "Daily freight leaderboard",
    statement:
      "Total the freight tendered per ship_date (cancelled rows carry 0 and still count as a tender; undelivered rows still carry their quote) and rank the days. Output ship_date, day_freight_cents, rank_r, ordered by rank_r then ship_date, top 8 only. The top day is the whale's 96000 record; rank 6 is SHARED — 02-20 and 06-05 tie at 33000.",
    code: `WITH daily AS (
  SELECT ship_date, SUM(freight_cents) AS f
  FROM shipments GROUP BY ship_date)
SELECT ship_date, f AS day_freight_cents,
       RANK() OVER (ORDER BY f DESC) AS rank_r
FROM daily
ORDER BY rank_r ASC, ship_date ASC
LIMIT 8;`,
    order: "exact",
  },
  {
    id: "q46",
    difficulty: "Hard",
    company: "Portside",
    title: "The aging board",
    statement:
      "As of 2026-07-01, bucket the in_transit shipments by age: '0-7' days, '8-30' days (inclusive of 30 — one shipment sits EXACTLY on that line), '31+' days. Output bucket and shipment_count, ordered by bucket ascending. Move the 30-day boundary to strict and the middle bucket loses its boundary occupant.",
    code: `SELECT CASE WHEN CAST(julianday('2026-07-01') - julianday(ship_date) AS INT) <= 7 THEN '0-7'
            WHEN CAST(julianday('2026-07-01') - julianday(ship_date) AS INT) <= 30 THEN '8-30'
            ELSE '31+' END AS bucket,
       COUNT(*) AS shipment_count
FROM shipments
WHERE status = 'in_transit'
GROUP BY bucket
ORDER BY CASE bucket WHEN '0-7' THEN 1 WHEN '8-30' THEN 2 ELSE 3 END ASC;`,
    order: "exact",
  },
  {
    id: "q47",
    difficulty: "Hard",
    company: "FedEx",
    title: "The inclusive/strict split",
    statement:
      "For each service, count delivered shipments on-time under the inclusive rule (delivered <= promised) and under the strict rule (delivered < promised). Output service, on_time_inclusive, on_time_strict, ordered by service ascending. Only one service's two numbers differ — its SLA-line survivor.",
    code: `SELECT service,
       SUM(CASE WHEN delivered_date <= promised_date THEN 1 ELSE 0 END) AS on_time_inclusive,
       SUM(CASE WHEN delivered_date < promised_date THEN 1 ELSE 0 END) AS on_time_strict
FROM shipments
WHERE status = 'delivered'
GROUP BY service
ORDER BY service ASC;`,
    order: "exact",
  },
  {
    id: "q48",
    difficulty: "Hard",
    company: "UPS",
    title: "The retention gap",
    statement:
      "The scan stream only covers pickups from 2026-05-04 onward. Count delivered shipments with NO scans, grouped by ship month. Output the month as ym and missing_scan_count, ordered by ym ascending. June contributes zero — every late-window delivery scanned.",
    code: `SELECT strftime('%Y-%m', s.ship_date) AS ym, COUNT(*) AS missing_scan_count
FROM shipments s
WHERE s.status = 'delivered'
  AND NOT EXISTS (SELECT 1 FROM shipment_events e WHERE e.shipment_id = s.shipment_id)
GROUP BY ym
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q49",
    difficulty: "Hard",
    company: "DHL",
    title: "The tie registry",
    statement:
      "Among delivered-ship_date day totals, find every tie group of 2 or more days and register the dates. Output day_freight_cents, tie_size, date_registry (GROUP_CONCAT of ship_date in date order), ordered by day_freight_cents descending. Ten tie groups — the four-way 27000 leads the register.",
    code: `WITH daily AS (
  SELECT ship_date, SUM(freight_cents) AS f
  FROM shipments GROUP BY ship_date)
SELECT f AS day_freight_cents, COUNT(*) AS tie_size,
       GROUP_CONCAT(ship_date) AS date_registry
FROM (SELECT ship_date, f FROM daily ORDER BY ship_date)
GROUP BY f
HAVING COUNT(*) >= 2
ORDER BY day_freight_cents DESC;`,
    order: "exact",
  },
  {
    id: "q50",
    difficulty: "Hard",
    company: "Maersk",
    title: "The insurance line",
    statement:
      "The claims policy auto-escalates at 200000 cents. Count claims with claimed_cents >= 200000 and claims with claimed_cents > 200000 — one row, columns ge_200000 and gt_200000. The lost shipment touches the line; nothing crosses it.",
    code: `SELECT SUM(CASE WHEN claimed_cents >= 200000 THEN 1 ELSE 0 END) AS ge_200000,
       SUM(CASE WHEN claimed_cents > 200000 THEN 1 ELSE 0 END) AS gt_200000
FROM freight_claims;`,
    order: "exact",
  },
  {
    id: "q51",
    difficulty: "Hard",
    company: "Freightline",
    title: "The HOS ledger",
    statement:
      "Compute each shift's duty length (end_ts - start_ts) and classify: 'over' past the 50400-second (14h) line, 'on_line' at exactly 50400, 'legal' below. Output bucket and shift_count, ordered by bucket ascending. One shift over, one on the line, the rest legal.",
    code: `SELECT CASE WHEN end_ts - start_ts > 50400 THEN 'over'
            WHEN end_ts - start_ts = 50400 THEN 'on_line'
            ELSE 'legal' END AS bucket,
       COUNT(*) AS shift_count
FROM driver_shifts
GROUP BY bucket
ORDER BY bucket ASC;`,
    order: "exact",
  },
  {
    id: "q52",
    difficulty: "Hard",
    company: "Portside",
    title: "Driver duty books",
    statement:
      "Per driver, sum shift deliveries and shift distance. Output driver_id, name, total_deliveries, total_km, ordered by total_km descending. Driver 1 owns 3000 km — more than double anyone else — while drivers 2 and 4 tie at exactly 58 deliveries.",
    code: `SELECT d.driver_id, d.name,
       SUM(sh.deliveries_made) AS total_deliveries,
       SUM(sh.distance_km) AS total_km
FROM drivers d
JOIN driver_shifts sh ON sh.driver_id = d.driver_id
GROUP BY d.driver_id, d.name
ORDER BY total_km DESC;`,
    order: "exact",
  },
  {
    id: "q53",
    difficulty: "Hard",
    company: "FedEx",
    title: "The honest-zero network map",
    statement:
      "Build the full network rollup: for each warehouse, count the shipments originating there AND the scans recorded at it — keep all six hubs. Output warehouse_id, city, origin_count, scan_count, ordered by warehouse_id ascending. The dark gateway shows 0 and 0.",
    code: `SELECT w.warehouse_id, w.city,
       (SELECT COUNT(*) FROM shipments s WHERE s.origin_wh = w.warehouse_id) AS origin_count,
       (SELECT COUNT(*) FROM shipment_events e WHERE e.warehouse_id = w.warehouse_id) AS scan_count
FROM warehouses w
ORDER BY w.warehouse_id ASC;`,
    order: "exact",
  },
  {
    id: "q54",
    difficulty: "Hard",
    company: "UPS",
    title: "The unbilled backlog",
    statement:
      "List every shipment with no invoice row, with a flag for why it's unbilled: 'cancelled' for withdrawn tenders, 'in_transit' for freight still moving. Output shipment_id, customer_id, status, unbilled_reason, ordered by shipment_id ascending. Six rows — four of them are still on the road.",
    code: `SELECT s.shipment_id, s.customer_id, s.status,
       CASE WHEN s.status = 'cancelled' THEN 'cancelled' ELSE 'in_transit' END AS unbilled_reason
FROM shipments s
WHERE NOT EXISTS (SELECT 1 FROM invoices i WHERE i.shipment_id = s.shipment_id)
ORDER BY s.shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q55",
    difficulty: "Hard",
    company: "DHL",
    title: "The LATAM calendar",
    statement:
      "Build a month spine for Jan-Jun 2026 and count LATAM-customer shipments per month — keep the empty months visible. Output ym and latam_count, ordered by ym ascending. March is the zero: the coffee shipper went dark for a month.",
    code: `WITH months AS (
  SELECT '2026-01' AS ym UNION SELECT '2026-02' UNION SELECT '2026-03'
  UNION SELECT '2026-04' UNION SELECT '2026-05' UNION SELECT '2026-06')
SELECT m.ym,
       (SELECT COUNT(*) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id
        WHERE c.region = 'LATAM' AND strftime('%Y-%m', s.ship_date) = m.ym) AS latam_count
FROM months m
ORDER BY m.ym ASC;`,
    order: "exact",
  },
  {
    id: "q56",
    difficulty: "Hard",
    company: "Maersk",
    title: "The mirror pair",
    statement:
      "Find shipments that share the same origin warehouse, service and freight_cents with at least one other shipment — duplicate-quote lanes. Output shipment_id, customer_id, origin_wh, service, freight_cents, ordered by freight_cents descending, then shipment_id. The 36000 mirror pair leads: one delivered on its SLA line, one still in the wind.",
    code: `SELECT s.shipment_id, s.customer_id, s.origin_wh, s.service, s.freight_cents
FROM shipments s
WHERE EXISTS (
  SELECT 1 FROM shipments t
  WHERE t.shipment_id <> s.shipment_id
    AND t.origin_wh = s.origin_wh AND t.service = s.service
    AND t.freight_cents = s.freight_cents)
ORDER BY s.freight_cents DESC, s.shipment_id ASC;`,
    order: "exact",
  },
  {
    id: "q57",
    difficulty: "Hard",
    company: "Freightline",
    title: "The claim funnel",
    statement:
      "Trace the claim book end to end: count claims per status and sum their money, then also show the share of total claimed money each status holds as a percentage rounded to 2 decimals. Output status, claim_count, claimed_total_cents, pct_of_book, ordered by claim_count descending, then status ascending. Open exposure dominates the book.",
    code: `WITH by_status AS (
  SELECT status, COUNT(*) AS n, SUM(claimed_cents) AS c
  FROM freight_claims GROUP BY status),
total AS (SELECT SUM(claimed_cents) AS t FROM freight_claims)
SELECT b.status, b.n AS claim_count, b.c AS claimed_total_cents,
       ROUND(b.c * 100.0 / t.t, 2) AS pct_of_book
FROM by_status b CROSS JOIN total t
ORDER BY b.n DESC, b.status ASC;`,
    order: "exact",
  },
  {
    id: "q58",
    difficulty: "Hard",
    company: "Portside",
    title: "Running delivered freight",
    statement:
      "Cumulatively sum delivered freight by ship month and show each month's running total. Output ym, month_freight_cents, running_freight_cents, ordered by ym ascending. The curve ends at 797400 — half a year of delivered money.",
    code: `WITH monthly AS (
  SELECT strftime('%Y-%m', ship_date) AS ym, SUM(freight_cents) AS f
  FROM shipments WHERE status = 'delivered'
  GROUP BY ym)
SELECT ym, f AS month_freight_cents,
       SUM(f) OVER (ORDER BY ym) AS running_freight_cents
FROM monthly
ORDER BY ym ASC;`,
    order: "exact",
  },
  {
    id: "q59",
    difficulty: "Hard",
    company: "FedEx",
    title: "The overdue express dossier",
    statement:
      "For in_transit shipments already past their promise as of 2026-07-01, list the forensics: shipment_id, customer_id, service, promised_date, days_past_promise, and whether the shipment ever scanned 'out_for_delivery' (1/0). Output ordered by days_past_promise descending. The vanished express — 28 days past promise, never scanned for delivery — leads.",
    code: `SELECT s.shipment_id, s.customer_id, s.service, s.promised_date,
       CAST(julianday('2026-07-01') - julianday(s.promised_date) AS INT) AS days_past_promise,
       CASE WHEN EXISTS (SELECT 1 FROM shipment_events e
                         WHERE e.shipment_id = s.shipment_id
                           AND e.event_type = 'out_for_delivery') THEN 1 ELSE 0 END AS scanned_ofd
FROM shipments s
WHERE s.status = 'in_transit' AND s.promised_date < '2026-07-01'
ORDER BY days_past_promise DESC;`,
    order: "exact",
  },
  {
    id: "q60",
    difficulty: "Hard",
    company: "UPS",
    title: "The whale dossier",
    statement:
      "Prove the whale's grip in one query: compute the whale's delivered freight, the grand delivered total, the whale's percentage share (rounded to 2 decimals), and NA's delivered freight with vs without the whale — one row, columns whale_freight_cents, grand_total_cents, whale_share_pct, na_with_whale_cents, na_without_whale_cents. Excluding him, NA drops below EMEA's 298500.",
    code: `SELECT
  (SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered' AND customer_id = 10) AS whale_freight_cents,
  (SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered') AS grand_total_cents,
  ROUND((SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered' AND customer_id = 10) * 100.0
        / (SELECT SUM(freight_cents) FROM shipments WHERE status = 'delivered'), 2) AS whale_share_pct,
  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id
   WHERE s.status = 'delivered' AND c.region = 'NA') AS na_with_whale_cents,
  (SELECT SUM(s.freight_cents) FROM shipments s JOIN customers c ON c.customer_id = s.customer_id
   WHERE s.status = 'delivered' AND c.region = 'NA' AND s.customer_id <> 10) AS na_without_whale_cents;`,
    order: "exact",
  },
];
