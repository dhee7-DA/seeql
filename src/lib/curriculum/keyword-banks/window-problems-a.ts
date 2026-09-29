// Keyword Mastery bank — FIRST_VALUE & LAST_VALUE graded problems (kb-fv-i01..i24).
// Every solution executes against the seed db; gen-expected generates targets.
// Facts probed via scripts/m5-facts{,2}.ts: openers c1 152.52 / c2 752.96 /
// c3 364.71 / c4 164.17 / c5 725.34; openers > 500: c2/c5/c12/c16; closers
// c1 125.88 / c2 99.48 / c3 659.70 / c4 435.09 / c5 585.79 / c6 326.05.
import type { Problem } from "../types";
import { EXPECTED } from "../expected";

const p = (v: Omit<Problem, "expected">): Problem => ({ ...v, expected: EXPECTED[v.id] });

export const windowProblemsA: Problem[] = [
  p({
    id: "kb-fv-i01", difficulty: "easy",
    title: "The opening stamp",
    brief: "Stamp the store's OPENING ticket — the first order in the timeline — onto the five oldest orders. FIRST_VALUE reads the head of the date-ordered window and paints it on every row; the value stays 752.96 because it is an anchor, not a walk.",
    hints: ["FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS opening — the head reader needs the window ordering.", "SELECT id, total, … FROM orders ORDER BY created_at, id LIMIT 5."],
    solution: "SELECT id, total, FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS opening FROM orders ORDER BY created_at, id LIMIT 5;",
  }),
  p({
    id: "kb-fv-i02", difficulty: "easy",
    title: "The true closing ticket",
    brief: "Stamp the store's genuinely LAST order total — 585.79 — onto the three newest orders. LAST_VALUE must see the partition's tail, so the frame stretches to UNBOUNDED FOLLOWING; the default frame would mirror each row's own total instead.",
    hints: ["LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing.", "Show the three newest: ORDER BY created_at DESC, id DESC LIMIT 3."],
    solution: "SELECT id, total, LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing FROM orders ORDER BY created_at DESC, id DESC LIMIT 3;",
  }),
  p({
    id: "kb-fv-i03", difficulty: "easy",
    title: "Customer 2's opener",
    brief: "Profile customer 2's ledger: both orders stamped with THEIR OWN first order total. PARTITION BY customer_id restarts the window per account, so the anchor is 752.96 — the store's very first order belongs to this customer.",
    hints: ["PARTITION BY customer_id ORDER BY created_at, id inside FIRST_VALUE(total) OVER (…).", "WHERE customer_id = 2; ORDER BY id for the timeline."],
    solution: "SELECT id, created_at, total, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS first_order FROM orders WHERE customer_id = 2 ORDER BY id;",
  }),
  p({
    id: "kb-fv-i04", difficulty: "easy",
    title: "Bookends side by side",
    brief: "One scan, two anchors: the store's opening total (752.96) and true closing total (585.79) stamped side by side on the five oldest orders. FIRST_VALUE reads the head; LAST_VALUE needs the full frame to read the tail.",
    hints: ["Two window columns: FIRST_VALUE(total) OVER (ORDER BY created_at, id) and LAST_VALUE(total) OVER (… ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING).", "SELECT id, total, opening, closing FROM orders ORDER BY created_at, id LIMIT 5."],
    solution: "SELECT id, total, FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS opening, LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing FROM orders ORDER BY created_at, id LIMIT 5;",
  }),
  p({
    id: "kb-fv-i05", difficulty: "easy",
    title: "Sixteen openers",
    brief: "The acquisition roster: each customer's first order total, one row per account. Stage the per-customer FIRST_VALUE on every order, then DISTINCT collapses to sixteen rows because the stamp is constant per partition.",
    hints: ["Derived table: SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders.", "Outer: SELECT DISTINCT customer_id, ft … ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, ft FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders) ORDER BY customer_id;",
  }),
  p({
    id: "kb-fv-i06", difficulty: "medium",
    title: "The big-hello watchlist",
    brief: "Onboarding quality: which accounts opened with a ticket above 500? Stage the per-customer opener, collapse with DISTINCT, then filter the computed column OUTSIDE the window level — WHERE runs before windows, so the staging layer is mandatory.",
    hints: ["Derived table with FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft.", "Outer: SELECT DISTINCT customer_id, ft FROM (…) WHERE ft > 500 ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, ft FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders) WHERE ft > 500 ORDER BY customer_id;",
  }),
  p({
    id: "kb-fv-i07", difficulty: "medium",
    title: "The declining accounts",
    brief: "Flag the ledgers that shrank: closing ticket below opening ticket. Two staged columns — op from FIRST_VALUE, cl from LAST_VALUE under the full UNBOUNDED FOLLOWING frame — then the comparison outside. Customer 2's 752.96-to-99.48 slide is the poster child.",
    hints: ["Stage both: FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (same + ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl.", "Outer: SELECT DISTINCT customer_id, op, cl FROM (…) WHERE cl < op ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, op, cl FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl FROM orders) WHERE cl < op ORDER BY customer_id;",
  }),
  p({
    id: "kb-fv-i08", difficulty: "medium",
    title: "The comeback roster",
    brief: "The growth board's favorites: accounts that ENDED higher than they started. Stage the bookends per customer, keep the risers, then join to the directory for names — the join rides on the collapsed account grain, so no fan-out can touch it.",
    hints: ["Stage op (FIRST_VALUE) and cl (LAST_VALUE, full frame) per customer; DISTINCT to accounts; keep WHERE cl > op.", "JOIN customers c ON c.id = x.customer_id; SELECT c.name, x.op, x.cl ORDER BY c.name."],
    solution: "SELECT c.name, x.op, x.cl FROM (SELECT DISTINCT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl FROM orders) x JOIN customers c ON c.id = x.customer_id WHERE x.cl > x.op ORDER BY c.name;",
  }),
  p({
    id: "kb-fv-i09", difficulty: "medium",
    title: "Openers that stayed champions",
    brief: "Profile accounts whose FIRST order was also their BIGGEST: stage the timeline head (FIRST_VALUE) beside the whole-partition maximum (MAX with no ORDER BY — the window spans everything), then compare. Equality means the opener was never beaten.",
    hints: ["Stage: FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, MAX(total) OVER (PARTITION BY customer_id) AS pk.", "Outer: SELECT DISTINCT customer_id, op, pk FROM (…) WHERE op = pk ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, op, pk FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, MAX(total) OVER (PARTITION BY customer_id) AS pk FROM orders) WHERE op = pk ORDER BY customer_id;",
  }),
  p({
    id: "kb-fv-i10", difficulty: "medium",
    title: "Fourteen month openers",
    brief: "The calendar board: every month's opening ticket in one chronological list. Partition on the strftime month bucket, read the head, collapse with DISTINCT — fourteen months, fourteen openers, from 752.96 in January 2024 onward.",
    hints: ["Derived: SELECT strftime('%Y-%m', created_at) AS m, FIRST_VALUE(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at, id) AS opener FROM orders.", "Outer: SELECT DISTINCT m, opener … ORDER BY m."],
    solution: "SELECT DISTINCT m, opener FROM (SELECT strftime('%Y-%m', created_at) AS m, FIRST_VALUE(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at, id) AS opener FROM orders) ORDER BY m;",
  }),
  p({
    id: "kb-fv-i11", difficulty: "medium",
    title: "The January close-out",
    brief: "Archive January 2024 with its CLOSING ticket: every one of the month's eight orders stamped with the month's last order total. The window partitions on the month bucket; LAST_VALUE reads the tail under the full frame — not the default frame that mirrors each row.",
    hints: ["LAST_VALUE(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS month_close.", "WHERE strftime('%Y-%m', created_at) = '2024-01'; ORDER BY created_at, id."],
    solution: "SELECT id, created_at, total, LAST_VALUE(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS month_close FROM orders WHERE strftime('%Y-%m', created_at) = '2024-01' ORDER BY created_at, id;",
  }),
  p({
    id: "kb-fv-i12", difficulty: "medium",
    title: "The premium benchmark",
    brief: "Stamp the store's PREMIUM benchmark — the biggest order total, 1088.44 — onto the heavyweight tickets above 800. The head of a total-DESC window is the maximum, so FIRST_VALUE reads it once the ordering flips.",
    hints: ["FIRST_VALUE(total) OVER (ORDER BY total DESC) AS benchmark — direction puts the champion at the head.", "WHERE total > 800; ORDER BY total DESC."],
    solution: "SELECT id, total, FIRST_VALUE(total) OVER (ORDER BY total DESC) AS benchmark FROM orders WHERE total > 800 ORDER BY total DESC;",
  }),
  p({
    id: "kb-fv-i13", difficulty: "medium",
    title: "Drift from day one",
    brief: "Retention's drift read for customer 1: every order's total minus their opening ticket (152.52). The FIRST_VALUE stamp makes the baseline a column; arithmetic does the rest. Sample the three newest orders, newest first.",
    hints: ["total - FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS drift.", "WHERE customer_id = 1; ORDER BY created_at DESC, id DESC LIMIT 3."],
    solution: "SELECT id, total, total - FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS drift FROM orders WHERE customer_id = 1 ORDER BY created_at DESC, id DESC LIMIT 3;",
  }),
  p({
    id: "kb-fv-i14", difficulty: "hard",
    title: "The growth podium",
    brief: "Crown the three accounts with the widest closing-minus-opening growth. Stage both bookends (FIRST_VALUE + full-frame LAST_VALUE), compute growth outside, sort descending, take three. The frame clause lives in staging; the ambition lives in the ORDER BY.",
    hints: ["Derived: op and cl as in the bookends template; outer computes ROUND(cl - op, 2) AS growth.", "SELECT DISTINCT customer_id, op, cl, ROUND(cl - op, 2) AS growth FROM (…) ORDER BY growth DESC LIMIT 3."],
    solution: "SELECT DISTINCT customer_id, op, cl, ROUND(cl - op, 2) AS growth FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl FROM orders) ORDER BY growth DESC LIMIT 3;",
  }),
  p({
    id: "kb-fv-i15", difficulty: "hard",
    title: "The collapsed accounts",
    brief: "Fraud's relative flag: closing ticket under HALF the opening one. Stage the bookends, then the multiplier lives in the outer WHERE — cl < op * 0.5. The relative form catches proportion, not absolute size.",
    hints: ["Stage op and cl exactly as the bookends template.", "Outer: SELECT DISTINCT customer_id, op, cl FROM (…) WHERE cl < op * 0.5 ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, op, cl FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS op, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS cl FROM orders) WHERE cl < op * 0.5 ORDER BY customer_id;",
  }),
  p({
    id: "kb-fv-i16", difficulty: "hard",
    title: "Aging from the account's day one",
    brief: "The retention ledger for customer 2: every order aged in days against the account's OWN opening date. FIRST_VALUE stamps the opening DATE (a column swap from the money builds), julianday converts, subtraction ages, ROUND keeps whole days.",
    hints: ["ROUND(julianday(created_at) - julianday(FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)), 0) AS days_from_open.", "WHERE customer_id = 2; ORDER BY id."],
    solution: "SELECT id, created_at, ROUND(julianday(created_at) - julianday(FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id)), 0) AS days_from_open FROM orders WHERE customer_id = 2 ORDER BY id;",
  }),
  p({
    id: "kb-fv-i17", difficulty: "hard",
    title: "The opening-day cohort",
    brief: "Marketing's founding cohort: accounts whose first order DATE landed before 2024-02-01. Stage the opening date per customer (FIRST_VALUE over created_at), collapse with DISTINCT, cut the cohort outside — the cutoff is a decision, the staging is mechanical.",
    hints: ["Derived: SELECT customer_id, FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS fd FROM orders.", "Outer: SELECT DISTINCT customer_id, fd FROM (…) WHERE fd < '2024-02-01' ORDER BY customer_id."],
    solution: "SELECT DISTINCT customer_id, fd FROM (SELECT customer_id, FIRST_VALUE(created_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS fd FROM orders) WHERE fd < '2024-02-01' ORDER BY customer_id;",
  }),
  p({
    id: "kb-fv-i18", difficulty: "hard",
    title: "Open, close, peak — one card",
    brief: "Customer 1's account card with three stamps: opening (FIRST_VALUE over the timeline), closing (LAST_VALUE under the full frame) and peak (MAX with NO ORDER BY — the whole-partition window). Three definitions, one scan, and the distinctions are the lesson.",
    hints: ["Three OVER clauses: FIRST_VALUE(… ORDER BY created_at, id), LAST_VALUE(… ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING), MAX(total) OVER (PARTITION BY customer_id).", "WHERE customer_id = 1; ORDER BY id LIMIT 4."],
    solution: "SELECT id, total, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS opening, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing, MAX(total) OVER (PARTITION BY customer_id) AS peak FROM orders WHERE customer_id = 1 ORDER BY id LIMIT 4;",
  }),
  p({
    id: "kb-fv-i19", difficulty: "hard",
    title: "First ship of the account",
    brief: "Fulfillment audit for customer 1: stamp each shipped order with the account's FIRST shipment date. The WHERE keeps only shipped rows BEFORE the window runs, so the partition is the shipped ledger and the head read cannot land on a NULL.",
    hints: ["FIRST_VALUE(shipped_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS first_ship — note the column is shipped_at.", "WHERE customer_id = 1 AND shipped_at IS NOT NULL; ORDER BY id LIMIT 3."],
    solution: "SELECT id, created_at, shipped_at, FIRST_VALUE(shipped_at) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS first_ship FROM orders WHERE customer_id = 1 AND shipped_at IS NOT NULL ORDER BY id LIMIT 3;",
  }),
  p({
    id: "kb-fv-i20", difficulty: "hard",
    title: "The frame audit",
    brief: "The audit that proves you know WHY the frame matters: stamp the store's true closing total (585.79) onto orders 74 and 97 — including the mid-timeline 1088.44 heavyweight, whose stamp must still read the tail because the frame reaches UNBOUNDED FOLLOWING.",
    hints: ["LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing.", "WHERE id IN (74, 97); ORDER BY id."],
    solution: "SELECT id, total, LAST_VALUE(total) OVER (ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS closing FROM orders WHERE id IN (74, 97) ORDER BY id;",
  }),
  p({
    id: "kb-fv-i21", difficulty: "medium",
    title: "Rank the openers",
    brief: "Which account said hello biggest? Stage each customer's opener, then sort the collapsed roster by the opener itself, biggest first — the acquisition-size leaderboard in one staged query.",
    hints: ["Derived: SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders.", "Outer: SELECT DISTINCT customer_id, ft FROM (…) ORDER BY ft DESC."],
    solution: "SELECT DISTINCT customer_id, ft FROM (SELECT customer_id, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS ft FROM orders) ORDER BY ft DESC;",
  }),
  p({
    id: "kb-fv-i22", difficulty: "hard",
    title: "Opener against the store's opener",
    brief: "Two windows, two scopes: each customer's own opener (PARTITION BY customer_id) beside the STORE's opener (no partition — one global window). The ratio shows whose first ticket echoed the store's first day. Show customer 2 and customer 5's rows.",
    hints: ["Two columns: FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS acct_open, FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS store_open.", "WHERE customer_id IN (2, 5); ORDER BY id."],
    solution: "SELECT id, customer_id, total, FIRST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id) AS acct_open, FIRST_VALUE(total) OVER (ORDER BY created_at, id) AS store_open FROM orders WHERE customer_id IN (2, 5) ORDER BY id;",
  }),
  p({
    id: "kb-fv-i23", difficulty: "hard",
    title: "The newest stamp",
    brief: "Sync prep: every account's NEWEST order total stamped on their full ledger (LAST_VALUE under the full frame), joined to names for the ops review. Collapse to the newest rows only — DISTINCT on customer_id plus the stamp gives one row per account.",
    hints: ["Stage LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS latest, JOIN customers for names.", "Outer: SELECT DISTINCT c.name, x.latest FROM (…) x JOIN customers c ON c.id = x.customer_id ORDER BY c.name."],
    solution: "SELECT DISTINCT c.name, x.latest FROM (SELECT customer_id, LAST_VALUE(total) OVER (PARTITION BY customer_id ORDER BY created_at, id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS latest FROM orders) x JOIN customers c ON c.id = x.customer_id ORDER BY c.name;",
  }),
  p({
    id: "kb-fv-i24", difficulty: "hard",
    title: "The month-opener leaderboard",
    brief: "Which month opened biggest? Reuse the month-opener stage (FIRST_VALUE over the strftime bucket), then rank the fourteen openers by size instead of calendar. January 2024's 752.96 heads the list — the store's first month opened loud.",
    hints: ["Derived: month bucket + FIRST_VALUE(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at, id) AS opener.", "Outer: SELECT DISTINCT m, opener FROM (…) ORDER BY opener DESC."],
    solution: "SELECT DISTINCT m, opener FROM (SELECT strftime('%Y-%m', created_at) AS m, FIRST_VALUE(total) OVER (PARTITION BY strftime('%Y-%m', created_at) ORDER BY created_at, id) AS opener FROM orders) ORDER BY opener DESC;",
  }),
];
