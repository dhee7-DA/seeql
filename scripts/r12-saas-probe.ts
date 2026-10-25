// Round 12 — probe the SaaS & Subscriptions world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_SAAS_SCHEMA } from "../src/lib/leetcode/content/dm-saas-schema";
import { DM_SAAS_SEED } from "../src/lib/leetcode/content/dm-saas-seed";

const db = new Database(":memory:");
db.exec(DM_SAAS_SCHEMA.ddl);
db.exec(DM_SAAS_SEED);
const q = (sql: string): Record<string, unknown>[] => db.prepare(sql).all();
const one = (sql: string): number => Object.values(db.prepare(sql).get() ?? {})[0] as number;

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? " · " + detail : ""}`);
};

console.log("== epoch openers ==");
for (const [ts, want] of [[1784505600, "2026-07-20"], [1784592000, "2026-07-21"], [1784678400, "2026-07-22"], [1784764800, "2026-07-23"]] as const) {
  const got = (q(`SELECT strftime('%Y-%m-%d', ${ts}, 'unixepoch') d`)[0] as { d: string }).d;
  check(`epoch ${ts} = ${want}`, got === want, got);
}

console.log("== counts ==");
check("accounts = 12", one("SELECT COUNT(*) FROM accounts") === 12);
const seg = q(`SELECT segment, COUNT(*) n FROM accounts GROUP BY segment ORDER BY n DESC, segment`);
check("segments Enterprise 3 / MidMarket 4 / SMB 5", JSON.stringify(seg) === JSON.stringify([{ segment: "SMB", n: 5 }, { segment: "MidMarket", n: 4 }, { segment: "Enterprise", n: 3 }]), JSON.stringify(seg));
const reg = q(`SELECT region, COUNT(*) n FROM accounts GROUP BY region ORDER BY n DESC, region`);
check("regions NA 4 / APAC 3 / EMEA 3 / LATAM 2", JSON.stringify(reg) === JSON.stringify([{ region: "NA", n: 4 }, { region: "APAC", n: 3 }, { region: "EMEA", n: 3 }, { region: "LATAM", n: 2 }]), JSON.stringify(reg));
check("accounts active 11 / churned 1", one(`SELECT COUNT(*) FROM accounts WHERE status='active'`) === 11 && one(`SELECT COUNT(*) FROM accounts WHERE status='churned'`) === 1);
check("subscriptions = 16", one("SELECT COUNT(*) FROM subscriptions") === 16);
check("current subs (end NULL) = 11", one("SELECT COUNT(*) FROM subscriptions WHERE end_date IS NULL") === 11);
check("end-dated subs = 5", one("SELECT COUNT(*) FROM subscriptions WHERE end_date IS NOT NULL") === 5);
check("invoices = 62", one("SELECT COUNT(*) FROM invoices") === 62);
const inv = q(`SELECT status, COUNT(*) n FROM invoices GROUP BY status ORDER BY n DESC, status`);
check("invoices paid 53 / failed 7 / pending 1 / refunded 1", JSON.stringify(inv) === JSON.stringify([{ status: "paid", n: 53 }, { status: "failed", n: 7 }, { status: "pending", n: 1 }, { status: "refunded", n: 1 }]), JSON.stringify(inv));
check("seats = 14", one("SELECT COUNT(*) FROM seats") === 14);
const roles = q(`SELECT role, COUNT(*) n FROM seats GROUP BY role ORDER BY n DESC, role`);
check("roles admin 10 / member 3 / viewer 1", JSON.stringify(roles) === JSON.stringify([{ role: "admin", n: 10 }, { role: "member", n: 3 }, { role: "viewer", n: 1 }]), JSON.stringify(roles));
check("events = 72", one("SELECT COUNT(*) FROM events") === 72);
const et = q(`SELECT event_type, COUNT(*) n FROM events GROUP BY event_type ORDER BY n DESC, event_type`);
check("events login 36 / report_run 18 / api_call 11 / invite 4 / export 3", JSON.stringify(et) === JSON.stringify([{ event_type: "login", n: 36 }, { event_type: "report_run", n: 18 }, { event_type: "api_call", n: 11 }, { event_type: "invite", n: 4 }, { event_type: "export", n: 3 }]), JSON.stringify(et));
check("tickets = 12", one("SELECT COUNT(*) FROM tickets") === 12);
const tp = q(`SELECT priority, COUNT(*) n FROM tickets GROUP BY priority ORDER BY n DESC, priority`);
check("ticket priority high 3 / medium 5 / low 4", JSON.stringify(tp) === JSON.stringify([{ priority: "medium", n: 5 }, { priority: "low", n: 4 }, { priority: "high", n: 3 }]), JSON.stringify(tp));
const ts2 = q(`SELECT status, COUNT(*) n FROM tickets GROUP BY status ORDER BY n DESC, status`);
check("ticket status open 4 / closed 3 / resolved 3 / investigating 2", JSON.stringify(ts2) === JSON.stringify([{ status: "open", n: 4 }, { status: "closed", n: 3 }, { status: "resolved", n: 3 }, { status: "investigating", n: 2 }]), JSON.stringify(ts2));
check("ticket resolved_date NULL exactly on 6 live", one("SELECT COUNT(*) FROM tickets WHERE resolved_date IS NULL") === 6);
check("paid_date NULL exactly on 8 (7 failed + 1 pending)", one("SELECT COUNT(*) FROM invoices WHERE paid_date IS NULL") === 8);

console.log("== planted: current MRR leaderboard + rank ties ==");
const mrr = q(`
  SELECT a.account_id id, a.name, s.mrr_cents mrr,
    RANK() OVER (ORDER BY s.mrr_cents DESC) r,
    DENSE_RANK() OVER (ORDER BY s.mrr_cents DESC) dr
  FROM accounts a JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL
  ORDER BY s.mrr_cents DESC, a.account_id`) as Array<{ id: number; name: string; mrr: number; r: number; dr: number }>;
console.table(mrr);
check("whale A10 = 100000 at rank 1", mrr.find((x) => x.r === 1)?.id === 10 && mrr.find((x) => x.r === 1)?.mrr === 100000);
check("rank-2 tie = A1+A4 at 24900 (dense 2)", mrr.filter((x) => x.r === 2).length === 2 && mrr.filter((x) => x.r === 2).every((x) => x.mrr === 24900) && mrr.filter((x) => x.r === 2).every((x) => x.dr === 2));
check("rank-4 four-way tie = A2/A6/A8/A9 at 9900 (dense 3)", mrr.filter((x) => x.r === 4).length === 4 && mrr.filter((x) => x.r === 4).every((x) => x.mrr === 9900) && mrr.filter((x) => x.r === 4).every((x) => x.dr === 3));
check("rank-8 four-way tie = A3/A5/A7/A11 at 4900 (dense 4)", mrr.filter((x) => x.r === 8).length === 4 && mrr.filter((x) => x.r === 8).every((x) => x.mrr === 4900) && mrr.filter((x) => x.r === 8).every((x) => x.dr === 4));
check("total current MRR = 209000", one("SELECT SUM(mrr_cents) FROM subscriptions WHERE end_date IS NULL") === 209000);
check("ARPA = 209000/11 = 19000", Math.round(209000 / 11) === 19000);

console.log("== planted: churn-rejoin wall ==");
check("naive churn (end-dated rows) = 54500", one("SELECT SUM(mrr_cents) FROM subscriptions WHERE end_date IS NOT NULL") === 54500);
const trueChurn = q(`
  SELECT s.account_id id, s.mrr_cents mrr FROM subscriptions s
  WHERE s.end_date IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM subscriptions n WHERE n.account_id = s.account_id AND n.start_date >= s.end_date)`) as Array<{ id: number; mrr: number }>;
check("true churn = exactly A12 at 4900", trueChurn.length === 1 && trueChurn[0].id === 12 && trueChurn[0].mrr === 4900, JSON.stringify(trueChurn));
check("A2 end-dated row has successor (start 05-01)", one(`SELECT COUNT(*) FROM subscriptions WHERE account_id = 2 AND start_date = '2026-05-01' AND end_date IS NULL`) === 1);
check("A2 has NO April invoice (churn gap)", one(`SELECT COUNT(*) FROM invoices WHERE account_id = 2 AND issued_date BETWEEN '2026-04-01' AND '2026-04-30'`) === 0);
check("A12 invoices only Mar+Apr (2)", one("SELECT COUNT(*) FROM invoices WHERE account_id = 12") === 2);
const movements = q(`
  WITH hist AS (
    SELECT sub_id, account_id, mrr_cents, start_date, end_date,
      LAG(mrr_cents) OVER (PARTITION BY account_id ORDER BY start_date) prev_mrr,
      LAG(end_date) OVER (PARTITION BY account_id ORDER BY start_date) prev_end
    FROM subscriptions)
  SELECT sub_id, account_id, mrr_cents, start_date,
    CASE WHEN prev_end IS NULL THEN 'new'
         WHEN mrr_cents > prev_mrr THEN 'expansion'
         WHEN mrr_cents < prev_mrr THEN 'contraction'
         ELSE 'flat-restart' END kind
  FROM hist ORDER BY start_date, sub_id`) as Array<{ sub_id: number; account_id: number; kind: string; mrr_cents: number; start_date: string }>;
console.log("  movement ledger:", JSON.stringify(movements));
const kind = (k: string) => movements.filter((m) => m.kind === k);
check("movement census: 12 new / 2 expansion / 1 contraction / 1 flat-restart (the rejoin)", kind("new").length === 12 && kind("expansion").length === 2 && kind("contraction").length === 1 && kind("flat-restart").length === 1, JSON.stringify(kind("flat-restart")));
check("new logos in 2026 = 6, new-logo MRR = 134500", kind("new").filter((m) => m.start_date >= "2026-01-01").length === 6 && kind("new").filter((m) => m.start_date >= "2026-01-01").reduce((a, m) => a + m.mrr_cents, 0) === 134500);
check("expansion delta = +20000 total (both on A4)", kind("expansion").reduce((a, m) => a + m.mrr_cents, 0) - (4900 + 9900) === 20000 && kind("expansion").every((m) => m.account_id === 4));
check("contraction = -15000 (A6 04-15)", kind("contraction").length === 1 && kind("contraction")[0].account_id === 6 && kind("contraction")[0].start_date === "2026-04-15");
const monthlyNew = q(`
  SELECT strftime('%Y-%m', start_date) ym, SUM(mrr_cents) new_mrr, COUNT(*) n
  FROM subscriptions s
  WHERE s.start_date = (SELECT MIN(start_date) FROM subscriptions x WHERE x.account_id = s.account_id)
    AND s.start_date >= '2026-01-01'
  GROUP BY ym ORDER BY ym`) as Array<{ ym: string; new_mrr: number; n: number }>;
console.log("  monthly new logos:", JSON.stringify(monthlyNew));
check("new-logo months: Jan 14800 x2 / Feb 9900 x1 / Mar 9800 x2 / Jun 100000 x1 — Apr+May ZERO", JSON.stringify(monthlyNew) === JSON.stringify([{ ym: "2026-01", new_mrr: 14800, n: 2 }, { ym: "2026-02", new_mrr: 9900, n: 1 }, { ym: "2026-03", new_mrr: 9800, n: 2 }, { ym: "2026-06", new_mrr: 100000, n: 1 }]));
check("April AND May = honest-zero months for new logos", !monthlyNew.some((r) => r.ym === "2026-04" || r.ym === "2026-05"));

console.log("== planted: mirror invoice multisets ==");
const ms5 = q(`SELECT amount_cents a, status st, COUNT(*) n FROM invoices WHERE account_id = 5 GROUP BY a, st ORDER BY a`);
const ms7 = q(`SELECT amount_cents a, status st, COUNT(*) n FROM invoices WHERE account_id = 7 GROUP BY a, st ORDER BY a`);
check("A5/A7 invoice (amount,status) multisets IDENTICAL", JSON.stringify(ms5) === JSON.stringify(ms7), JSON.stringify(ms5));
check("A5/A7 lifetime billed = 29400 each, 6 invoices each", one("SELECT SUM(amount_cents) FROM invoices WHERE account_id = 5") === 29400 && one("SELECT COUNT(*) FROM invoices WHERE account_id = 5") === 6 && one("SELECT SUM(amount_cents) FROM invoices WHERE account_id = 7") === 29400);
const ms8 = q(`SELECT amount_cents a, status st, COUNT(*) n FROM invoices WHERE account_id = 8 GROUP BY a, st ORDER BY a`);
const ms9 = q(`SELECT amount_cents a, status st, COUNT(*) n FROM invoices WHERE account_id = 9 GROUP BY a, st ORDER BY a`);
check("A8/A9 invoice multisets IDENTICAL (6 paid 9900s)", JSON.stringify(ms8) === JSON.stringify(ms9) && one("SELECT SUM(amount_cents) FROM invoices WHERE account_id = 8") === 59400 && one("SELECT COUNT(*) FROM invoices WHERE account_id = 9") === 6);

console.log("== planted: lines, drift and duplicates ==");
const line = one("SELECT COUNT(*) FROM subscriptions WHERE mrr_cents >= 100000 AND end_date IS NULL");
check("current subs >= 100000 = exactly 1 (A10)", line === 1);
check("current subs > 100000 = 0; max mrr = 100000", one("SELECT COUNT(*) FROM subscriptions WHERE mrr_cents > 100000") === 0 && one("SELECT MAX(mrr_cents) FROM subscriptions") === 100000);
check("invoices >= 100000 = exactly 1 (the whale invoice)", one("SELECT COUNT(*) FROM invoices WHERE amount_cents >= 100000") === 1 && one("SELECT COUNT(*) FROM invoices WHERE amount_cents > 100000") === 0);
const drift = q(`
  SELECT i.invoice_id, i.account_id, i.issued_date, i.amount_cents, s.mrr_cents sub_mrr
  FROM invoices i JOIN subscriptions s
    ON s.account_id = i.account_id AND s.start_date <= i.issued_date
   AND (s.end_date IS NULL OR s.end_date > i.issued_date)
  WHERE i.amount_cents <> s.mrr_cents ORDER BY i.invoice_id`) as Array<Record<string, unknown>>;
check("drift rows = exactly 3 (A2 x2 promo 8900, A6 17400 blend)", drift.length === 3 && drift[0].account_id === 2 && drift[1].account_id === 2 && drift[2].account_id === 6 && drift[2].amount_cents === 17400, JSON.stringify(drift));
check("A6 blend covers both plans' window (sub 9 ends 04-15, sub 10 starts 04-15)", one(`SELECT COUNT(*) FROM subscriptions WHERE account_id = 6 AND end_date = '2026-04-15'`) === 1 && one(`SELECT COUNT(*) FROM subscriptions WHERE account_id = 6 AND start_date = '2026-04-15'`) === 1);
const dup = q(`SELECT account_id, issued_date, amount_cents, COUNT(*) n FROM invoices GROUP BY account_id, issued_date, amount_cents HAVING n > 1`) as Array<Record<string, unknown>>;
check("duplicate (account,day,amount) = only A3 01-19 4900 x2", dup.length === 1 && dup[0].account_id === 3 && dup[0].issued_date === "2026-01-19" && dup[0].n === 2, JSON.stringify(dup));
check("the dup pair = one paid + one refunded", JSON.stringify(q(`SELECT status FROM invoices WHERE account_id = 3 AND issued_date = '2026-01-19' ORDER BY invoice_id`)) === JSON.stringify([{ status: "paid" }, { status: "refunded" }]));
check("refunded rows = exactly 1", one(`SELECT COUNT(*) FROM invoices WHERE status = 'refunded'`) === 1);

console.log("== planted: money totals ==");
check("issued total = 754400", one("SELECT SUM(amount_cents) FROM invoices") === 754400);
check("collected (paid) = 660300", one(`SELECT SUM(amount_cents) FROM invoices WHERE status = 'paid'`) === 660300);
check("lost = failed 84300 + pending 4900 + refunded 4900 = 94100", one(`SELECT SUM(amount_cents) FROM invoices WHERE status IN ('failed','pending','refunded')`) === 94100);
check("collection rate ~ 87.5", Math.round((660300 / 754400) * 1000) / 10 === 87.5);
const monthlyIssued = q(`
  SELECT strftime('%Y-%m', issued_date) ym, SUM(amount_cents) issued, COUNT(*) n
  FROM invoices GROUP BY ym ORDER BY ym`) as Array<{ ym: string; issued: number; n: number }>;
console.log("  monthly issued:", JSON.stringify(monthlyIssued));
check("monthly issued Jan 108900 / Feb 104100 / Mar 113900 / Apr 111500 / May 108000 / Jun 208000", JSON.stringify(monthlyIssued.map((r) => r.issued)) === JSON.stringify([108900, 104100, 113900, 111500, 108000, 208000]));
check("June MoM delta = exactly +100000 (the whale)", 208000 - 108000 === 100000);
const daily = q(`SELECT issued_date d, SUM(amount_cents) v, COUNT(*) n FROM invoices GROUP BY d ORDER BY d`) as Array<{ d: string; v: number; n: number }>;
const tie104 = daily.filter((r) => r.v === 104100);
check("daily tie 104100 twice (02-01 vs 03-01)", tie104.length === 2 && tie104.every((r) => ["2026-02-01", "2026-03-01"].includes(r.d)));
const lone4900 = daily.filter((r) => r.v === 4900);
check("SIX lone days at exactly 4900 (all single-invoice)", lone4900.length === 6 && lone4900.every((r) => r.n === 1), JSON.stringify(lone4900.map((r) => r.d)));
const peak = daily.reduce((a, r) => (r.v > a.v ? r : a), daily[0]);
check("peak day = 06-01 at 203100 (10 invoices)", peak.d === "2026-06-01" && peak.v === 203100 && peak.n === 10, JSON.stringify(peak));
const dailyPaid = q(`SELECT issued_date d, SUM(CASE WHEN status='paid' THEN amount_cents ELSE 0 END) v FROM invoices GROUP BY d ORDER BY d`) as Array<{ d: string; v: number }>;
const zeroDays = dailyPaid.filter((r) => r.v === 0);
check("zero-COLLECTION days = 04-04 and 06-04 (the 4th cadence fails)", JSON.stringify(zeroDays.map((r) => r.d)) === JSON.stringify(["2026-04-04", "2026-06-04"]));

console.log("== planted: dunning saga ==");
const failsByAcc = q(`SELECT account_id id, COUNT(*) n FROM invoices WHERE status = 'failed' GROUP BY account_id ORDER BY id`) as Array<{ id: number; n: number }>;
check("failed per account: A4 x4, A5/A7/A11 x1 each", JSON.stringify(failsByAcc) === JSON.stringify([{ id: 4, n: 4 }, { id: 5, n: 1 }, { id: 7, n: 1 }, { id: 11, n: 1 }]), JSON.stringify(failsByAcc));
check("A4 failed streak = 4 CONSECUTIVE months (Feb..May) then Jun paid", JSON.stringify(q(`SELECT strftime('%m', issued_date) m, status FROM invoices WHERE account_id = 4 ORDER BY issued_date`)) === JSON.stringify([{ m: "01", status: "paid" }, { m: "02", status: "failed" }, { m: "03", status: "failed" }, { m: "04", status: "failed" }, { m: "05", status: "failed" }, { m: "06", status: "paid" }]));
check("A4 lost to dunning = 69600", one(`SELECT SUM(amount_cents) FROM invoices WHERE account_id = 4 AND status = 'failed'`) === 69600);
check("A5/A7 each failed exactly Feb (mirror)", one(`SELECT COUNT(*) FROM invoices WHERE account_id = 5 AND status='failed' AND issued_date LIKE '2026-02%'`) === 1 && one(`SELECT COUNT(*) FROM invoices WHERE account_id = 7 AND status='failed' AND issued_date LIKE '2026-02%'`) === 1);

console.log("== planted: dormant + seatless ==");
check("A11 zero events", one("SELECT COUNT(*) FROM events WHERE account_id = 11") === 0);
check("A11 seat 11 never activated (last_active NULL)", one(`SELECT COUNT(*) FROM seats WHERE account_id = 11 AND last_active_date IS NULL`) === 1);
check("A11 owns exactly 1 ticket: high/open", JSON.stringify(q(`SELECT priority, status FROM tickets WHERE account_id = 11`)) === JSON.stringify([{ priority: "high", status: "open" }]));
check("A11 dunning signal: 1 failed invoice (April)", one(`SELECT COUNT(*) FROM invoices WHERE account_id = 11 AND status = 'failed'`) === 1);
check("A11 still pays (current sub 4900, 2 paid invoices)", one(`SELECT mrr_cents FROM subscriptions WHERE account_id = 11 AND end_date IS NULL`) === 4900 && one(`SELECT COUNT(*) FROM invoices WHERE account_id = 11 AND status='paid'`) === 2);
const seatless = q(`SELECT a.account_id id FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM seats s WHERE s.account_id = a.account_id) ORDER BY a.account_id`) as Array<{ id: number }>;
check("seatless payers = A3 and A6 only", JSON.stringify(seatless) === JSON.stringify([{ id: 3 }, { id: 6 }]), JSON.stringify(seatless));
const twoSeat = q(`SELECT account_id id, COUNT(*) n FROM seats GROUP BY account_id HAVING n = 2 ORDER BY id`) as Array<{ id: number }>;
check("2-seat club = A1/A2/A5/A8", JSON.stringify(twoSeat.map((r) => r.id)) === JSON.stringify([1, 2, 5, 8]));
check("seat 13 = only member of A2, joined 07-21", JSON.stringify(q(`SELECT seat_id, role, joined_date FROM seats WHERE account_id = 2 AND role = 'member'`)) === JSON.stringify([{ seat_id: 13, role: "member", joined_date: "2026-07-21" }]));
check("seat 12 (A12) went dark 2026-04-28 before the 04-30 churn", one(`SELECT last_active_date FROM seats WHERE seat_id = 12`) === "2026-04-28");

console.log("== planted: event clocks ==");
const gap = one(`SELECT event_ts - (SELECT event_ts FROM events WHERE event_id = 3) FROM events WHERE event_id = 4`);
check("seat-1 session gap = 2700s", gap === 2700, `${gap}s`);
const hourLine = one(`SELECT event_ts - (SELECT event_ts FROM events WHERE event_id = 47) FROM events WHERE event_id = 48`);
check("seat-1 login->export pair = EXACTLY 3600s", hourLine === 3600, `${hourLine}s`);
const allGaps = q(`
  SELECT event_ts - LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) g
  FROM events`) as Array<{ g: number | null }>;
const midGaps = allGaps.map((r) => r.g).filter((g): g is number => g !== null && g > 1800 && g <= 20000);
check("only TWO gaps inside (1800s, 20000s]: the 2700 and the 3600", JSON.stringify(midGaps.sort((a, b) => a - b)) === JSON.stringify([2700, 3600]), JSON.stringify(midGaps));
const invitePairs = one(`SELECT COUNT(*) FROM events a JOIN events b ON a.seat_id = b.seat_id AND a.event_id < b.event_id
  WHERE a.event_type = 'invite' AND b.event_type = 'invite' AND b.event_ts - a.event_ts <= 300`);
check("invite velocity pairs <= 300s = 6 (all seat 3)", invitePairs === 6);
check("ALL invites belong to seat 3 on 07-21", one(`SELECT COUNT(*) FROM events WHERE event_type = 'invite' AND NOT (seat_id = 3 AND event_ts BETWEEN 1784592000 AND 1784592000 + 86399)`) === 0);
const succ = one(`SELECT event_ts - (SELECT MAX(event_ts) FROM events WHERE event_type = 'invite') FROM events WHERE event_id = 29`);
check("seat-13 first login 200s after last invite", succ === 200, `${succ}s`);
check("seat 13 has exactly ONE event ever", one("SELECT COUNT(*) FROM events WHERE seat_id = 13") === 1);
check("seats with zero events = 11 and 12", JSON.stringify(q(`SELECT seat_id FROM seats WHERE seat_id NOT IN (SELECT seat_id FROM events) ORDER BY seat_id`)) === JSON.stringify([{ seat_id: 11 }, { seat_id: 12 }]));
const sess = q(`
  WITH seq AS (SELECT seat_id, event_id, event_ts, LAG(event_ts) OVER (PARTITION BY seat_id ORDER BY event_ts) prev_ts FROM events),
  stamps AS (SELECT seat_id, event_id, event_ts, CASE WHEN prev_ts IS NULL OR event_ts - prev_ts > 1800 THEN 1 ELSE 0 END flag FROM seq),
  marked AS (SELECT *, SUM(flag) OVER (PARTITION BY seat_id ORDER BY event_ts ROWS UNBOUNDED PRECEDING) sess FROM stamps)
  SELECT seat_id, COUNT(DISTINCT sess) n FROM marked GROUP BY seat_id ORDER BY seat_id`) as Array<{ seat_id: number; n: number }>;
console.log("  sessions @1800 per seat:", JSON.stringify(sess));
check("total sessions = 38", sess.reduce((a, r) => a + r.n, 0) === 38, `${sess.reduce((a, r) => a + r.n, 0)}`);
check("A1 (seats 1+2) = 9 sessions (seat 1: 6, seat 2: 3)", (sess.find((r) => r.seat_id === 1)?.n ?? 0) + (sess.find((r) => r.seat_id === 2)?.n ?? 0) === 9);
check("exports only from accounts 1 and 10 (A1 x2, A10 x1)", JSON.stringify(q(`SELECT account_id, COUNT(*) n FROM events WHERE event_type = 'export' GROUP BY account_id ORDER BY account_id`)) === JSON.stringify([{ account_id: 1, n: 2 }, { account_id: 10, n: 1 }]));
check("A10 whale seat active every day (4 login days)", one(`SELECT COUNT(DISTINCT strftime('%Y-%m-%d', event_ts, 'unixepoch')) FROM events WHERE seat_id = 14`) === 4);

console.log("== planted: rollups (segment / region / owner) ==");
const segMrr = q(`SELECT a.segment seg, SUM(s.mrr_cents) mrr FROM accounts a JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL GROUP BY seg ORDER BY mrr DESC`) as Array<{ seg: string; mrr: number }>;
check("segment MRR: Enterprise 134800 / SMB 44600 / MidMarket 29600", JSON.stringify(segMrr) === JSON.stringify([{ seg: "Enterprise", mrr: 134800 }, { seg: "SMB", mrr: 44600 }, { seg: "MidMarket", mrr: 29600 }]), JSON.stringify(segMrr));
check("Enterprise share = 64.5% of 209000", Math.round((134800 / 209000) * 1000) / 10 === 64.5);
const regMrr = q(`SELECT a.region rg, SUM(s.mrr_cents) mrr FROM accounts a JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL GROUP BY rg ORDER BY mrr DESC`) as Array<{ rg: string; mrr: number }>;
check("region MRR: LATAM 100000 / NA 49600 / APAC 34700 / EMEA 24700", JSON.stringify(regMrr) === JSON.stringify([{ rg: "LATAM", mrr: 100000 }, { rg: "NA", mrr: 49600 }, { rg: "APAC", mrr: 34700 }, { rg: "EMEA", mrr: 24700 }]), JSON.stringify(regMrr));
check("whale flip: NA (49600) leads LATAM-excl-whale (0)", 49600 > 0 && regMrr[0].rg === "LATAM");
const ownMrr = q(`SELECT a.owner ow, SUM(s.mrr_cents) mrr FROM accounts a JOIN subscriptions s ON s.account_id = a.account_id AND s.end_date IS NULL GROUP BY ow ORDER BY mrr DESC`) as Array<{ ow: string; mrr: number }>;
check("owner MRR: Sam Ortega 119800 / Priya Nair 49500 / Dana Whit 39700", JSON.stringify(ownMrr) === JSON.stringify([{ ow: "Sam Ortega", mrr: 119800 }, { ow: "Priya Nair", mrr: 49500 }, { ow: "Dana Whit", mrr: 39700 }]), JSON.stringify(ownMrr));
const ownEx = ownMrr.map((r) => ({ ...r, ex: r.mrr - (r.ow === "Sam Ortega" ? 100000 : 0) })).sort((a, b) => b.ex - a.ex);
check("ex-whale owner order = Priya 49500 / Dana 39700 / Sam 19800", JSON.stringify(ownEx.map((r) => r.ow)) === JSON.stringify(["Priya Nair", "Dana Whit", "Sam Ortega"]), JSON.stringify(ownEx));
const planCensus = q(`SELECT plan, COUNT(*) n, SUM(mrr_cents) vol FROM subscriptions WHERE end_date IS NULL GROUP BY plan ORDER BY vol DESC`) as Array<{ plan: string; n: number; vol: number }>;
console.log("  current plan census:", JSON.stringify(planCensus));
check("current plans: Scale x2 / Growth x4 / Starter x4 / Enterprise x1", JSON.stringify(planCensus.map((r) => r.plan)) === JSON.stringify(["Enterprise", "Scale", "Growth", "Starter"]));
check("ticketless accounts = A3/A7/A9", JSON.stringify(q(`SELECT account_id id FROM accounts a WHERE NOT EXISTS (SELECT 1 FROM tickets t WHERE t.account_id = a.account_id) ORDER BY id`)) === JSON.stringify([{ id: 3 }, { id: 7 }, { id: 9 }]));
const tix2 = q(`SELECT account_id id, COUNT(*) n FROM tickets GROUP BY account_id HAVING n = 2 ORDER BY id`) as Array<{ id: number }>;
check("2-ticket club = A2/A4/A6", JSON.stringify(tix2.map((r) => r.id)) === JSON.stringify([2, 4, 6]));
check("A4's high ticket investigating + open billing story", one(`SELECT COUNT(*) FROM tickets WHERE account_id = 4 AND priority = 'high' AND status = 'investigating'`) === 1);

console.log(fails === 0 ? "\nALL PROBES PASS" : `\n${fails} PROBE FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
