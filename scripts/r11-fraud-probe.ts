// Round 11 — probe the Fraud & AML world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_FRAUD_SCHEMA } from "../src/lib/leetcode/content/dm-fraud-schema";
import { DM_FRAUD_SEED } from "../src/lib/leetcode/content/dm-fraud-seed";

const db = new Database(":memory:");
db.exec(DM_FRAUD_SCHEMA.ddl);
db.exec(DM_FRAUD_SEED);
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
check("users = 12", one("SELECT COUNT(*) FROM users") === 12);
check("devices = 14", one("SELECT COUNT(*) FROM devices") === 14);
check("p2p = 56", one("SELECT COUNT(*) FROM p2p") === 56);
const status = q(`SELECT status, COUNT(*) n FROM p2p GROUP BY status ORDER BY status`);
check("p2p statuses 5/3/46/2", JSON.stringify(status) === JSON.stringify([{ status: "failed", n: 5 }, { status: "pending", n: 3 }, { status: "reversed", n: 2 }, { status: "settled", n: 46 }]), JSON.stringify(status));
check("logins = 72", one("SELECT COUNT(*) FROM logins") === 72);
const lres = q(`SELECT result, COUNT(*) n FROM logins GROUP BY result ORDER BY result`);
check("logins 10 failed / 62 success", JSON.stringify(lres) === JSON.stringify([{ result: "failed", n: 10 }, { result: "success", n: 62 }]), JSON.stringify(lres));
const reasons = q(`SELECT fail_reason, COUNT(*) n FROM logins WHERE result = 'failed' GROUP BY fail_reason ORDER BY n DESC, fail_reason`);
check("fail reasons 2fa 2 / blocked-ip 3 / wrong-password 5", JSON.stringify(reasons) === JSON.stringify([{ fail_reason: "wrong-password", n: 5 }, { fail_reason: "blocked-ip", n: 3 }, { fail_reason: "2fa-failed", n: 2 }]), JSON.stringify(reasons));
const geo = q(`SELECT ip_country, COUNT(*) n FROM logins GROUP BY ip_country ORDER BY n DESC, ip_country`);
check("ip_country NG6/RU1/UK5/US21/SG39", JSON.stringify(geo) === JSON.stringify([{ ip_country: "SG", n: 39 }, { ip_country: "US", n: 21 }, { ip_country: "NG", n: 6 }, { ip_country: "UK", n: 5 }, { ip_country: "RU", n: 1 }]), JSON.stringify(geo));
check("disputes = 12", one("SELECT COUNT(*) FROM disputes") === 12);
check("cases = 12", one("SELECT COUNT(*) FROM cases") === 12);
const chan = q(`SELECT channel, COUNT(*) n FROM p2p GROUP BY channel ORDER BY n DESC, channel`);
console.log("  channels:", JSON.stringify(chan));

console.log("== planted: U5 = U7 mirror tie ==");
const sent = q(`
  SELECT sender_id u, COUNT(*) n, SUM(amount_cents) vol
  FROM p2p WHERE status = 'settled' GROUP BY sender_id ORDER BY vol DESC`) as Array<{ u: number; n: number; vol: number }>;
console.table(sent);
const u5 = sent.find((r) => r.u === 5)!;
const u7 = sent.find((r) => r.u === 7)!;
check("U5 vol = U7 vol = 581200, 9 rows each", u5.vol === 581200 && u7.vol === 581200 && u5.n === 9 && u7.n === 9, `${u5?.vol}/${u5?.n} vs ${u7?.vol}/${u7?.n}`);
const ms5 = q(`SELECT amount_cents a, channel c, COUNT(*) n FROM p2p WHERE sender_id = 5 AND status = 'settled' GROUP BY a, c ORDER BY a`);
const ms7 = q(`SELECT amount_cents a, channel c, COUNT(*) n FROM p2p WHERE sender_id = 7 AND status = 'settled' GROUP BY a, c ORDER BY a`);
check("U5/U7 settled (amount,channel) multisets IDENTICAL", JSON.stringify(ms5) === JSON.stringify(ms7), JSON.stringify(ms5));
check("everyday mirror subtotal = 101200 each", one(`SELECT SUM(amount_cents) FROM p2p WHERE sender_id = 5 AND status = 'settled' AND amount_cents < 100000`) === 101200);
const u8 = sent.find((r) => r.u === 8)!;
const u9 = sent.find((r) => r.u === 9)!;
check("U8 vol = U9 vol = 19500, 3 rows each", u8.vol === 19500 && u9.vol === 19500 && u8.n === 3 && u9.n === 3, `${u8?.vol} vs ${u9?.vol}`);
const ranked = q(`
  SELECT u, vol, RANK() OVER (ORDER BY vol DESC) r, DENSE_RANK() OVER (ORDER BY vol DESC) dr
  FROM (SELECT sender_id u, SUM(amount_cents) vol FROM p2p WHERE status = 'settled' GROUP BY sender_id)`) as Array<{ u: number; vol: number; r: number; dr: number }>;
console.log("  sent ranking (rank/dense):", JSON.stringify(ranked));
check("sent leader = U2 (2015000)", ranked.find((r) => r.r === 1)?.u === 2 && ranked.find((r) => r.r === 1)?.vol === 2015000);
check("rank-3 tie = U5+U7 at 581200", ranked.filter((r) => r.r === 3).length === 2 && ranked.filter((r) => r.r === 3).every((r) => r.vol === 581200));
check("rank-9 tie = U8+U9 at 19500", ranked.filter((r) => r.r === 9).length === 2 && ranked.filter((r) => r.r === 9).every((r) => r.vol === 19500));
const recv = q(`
  SELECT r.u, r.vol, RANK() OVER (ORDER BY r.vol DESC) rk
  FROM (SELECT receiver_id u, SUM(amount_cents) vol FROM p2p WHERE status = 'settled' GROUP BY receiver_id) r`) as Array<{ u: number; vol: number; rk: number }>;
console.log("  received ranking:", JSON.stringify(recv));
check("received leader = U9 (1965900)", recv.find((r) => r.rk === 1)?.u === 9 && recv.find((r) => r.rk === 1)?.vol === 1965900);
check("received #2 = U6 (1564700)", recv.find((r) => r.rk === 2)?.u === 6 && recv.find((r) => r.rk === 2)?.vol === 1564700);

console.log("== planted: mule ring ==");
const fanout = q(`SELECT sender_id, p2p_date, COUNT(DISTINCT receiver_id) rec, COUNT(*) n, MIN(amount_cents) lo, MAX(amount_cents) hi
  FROM p2p WHERE status = 'settled' GROUP BY sender_id, p2p_date HAVING COUNT(DISTINCT receiver_id) >= 3 AND MAX(amount_cents) < 500000`) as Array<Record<string, unknown>>;
check("fan-out detector: exactly U2 on 04-02 (4 receivers, 490000)", fanout.length === 1 && fanout[0].sender_id === 2 && fanout[0].p2p_date === "2026-04-02" && fanout[0].rec === 4 && fanout[0].lo === 490000, JSON.stringify(fanout));
const fanin = q(`SELECT receiver_id, p2p_date, COUNT(DISTINCT sender_id) snd, COUNT(*) n, SUM(amount_cents) total
  FROM p2p WHERE status = 'settled' GROUP BY receiver_id, p2p_date HAVING COUNT(DISTINCT sender_id) >= 3`) as Array<Record<string, unknown>>;
check("fan-in detector: exactly U9 on 04-03 (4 senders, 1920000)", fanin.length === 1 && fanin[0].receiver_id === 9 && fanin[0].p2p_date === "2026-04-03" && fanin[0].snd === 4 && fanin[0].total === 1920000, JSON.stringify(fanin));
const skim = q(`SELECT fo.sender_id, fo.receiver_id, fo.amount_cents inp, fi.amount_cents out_
  FROM p2p fo JOIN p2p fi ON fi.sender_id = fo.receiver_id AND fi.p2p_date = '2026-04-03'
  WHERE fo.sender_id = 2 AND fo.p2p_date = '2026-04-02' AND fo.status = 'settled' AND fi.status = 'settled'`) as Array<Record<string, unknown>>;
check("hand-off join = 4 legs, skim 10000 each", skim.length === 4 && skim.every((r) => Number(r.inp) - Number(r.out_) === 10000), JSON.stringify(skim));
check("all 8 mule legs carry risk >= 90", one(`SELECT COUNT(*) FROM p2p WHERE p2p_id BETWEEN 23 AND 30 AND risk_score >= 90`) === 8);

console.log("== planted: lines and boundaries ==");
const edd = one("SELECT COUNT(*) FROM p2p WHERE amount_cents >= 500000 AND status = 'settled'");
check("settled rows >= 500000 = exactly 1 (the wire)", edd === 1, `${edd}`);
check("all 8 mule legs < 500000", one(`SELECT COUNT(*) FROM p2p WHERE p2p_id BETWEEN 23 AND 30 AND amount_cents >= 500000`) === 0);
const sar = one("SELECT COUNT(*) FROM p2p WHERE amount_cents >= 1000000");
const sarStrict = one("SELECT COUNT(*) FROM p2p WHERE amount_cents > 1000000");
const sarMax = one("SELECT MAX(amount_cents) FROM p2p");
check("exactly 1 p2p >= 1000000, 0 > 1000000, max = 1000000", sar === 1 && sarStrict === 0 && sarMax === 1000000, `${sar}/${sarStrict}/${sarMax}`);
check("the 1000000 row = U10 -> U6 bank settled on 06-15", JSON.stringify(q(`SELECT sender_id, receiver_id, channel, status, p2p_date FROM p2p WHERE amount_cents = 1000000`)) === JSON.stringify([{ sender_id: 10, receiver_id: 6, channel: "bank", status: "settled", p2p_date: "2026-06-15" }]));
check("risk_score >= 80 rows = 11", one("SELECT COUNT(*) FROM p2p WHERE risk_score >= 80") === 11, `${one("SELECT COUNT(*) FROM p2p WHERE risk_score >= 80")}`);
check("risk_score < 30 rows = 42", one("SELECT COUNT(*) FROM p2p WHERE risk_score < 30") === 42, `${one("SELECT COUNT(*) FROM p2p WHERE risk_score < 30")}`);
check("risk_score 30-79 rows = 3", one("SELECT COUNT(*) FROM p2p WHERE risk_score >= 30 AND risk_score < 80") === 3, `${one("SELECT COUNT(*) FROM p2p WHERE risk_score >= 30 AND risk_score < 80")}`);

console.log("== planted: duplicate lane ==");
const dup = q(`SELECT sender_id, receiver_id, p2p_date, COUNT(*) n FROM p2p GROUP BY sender_id, receiver_id, p2p_date HAVING n > 1`);
check("duplicate sender+receiver+day only U3->U5 01-19", dup.length === 1 && dup[0].sender_id === 3 && dup[0].receiver_id === 5 && dup[0].p2p_date === "2026-01-19", JSON.stringify(dup));

console.log("== planted: dormant + unused ==");
check("U11 zero p2p (any direction)", one("SELECT COUNT(*) FROM p2p WHERE sender_id = 11 OR receiver_id = 11") === 0);
check("U11 zero logins", one("SELECT COUNT(*) FROM logins WHERE user_id = 11") === 0);
check("U11 owns exactly 1 case (kyc, investigating)", JSON.stringify(q(`SELECT case_type, status FROM cases WHERE user_id = 11`)) === JSON.stringify([{ case_type: "kyc", status: "investigating" }]));
const unusedDevices = q(`SELECT d.device_id FROM devices d WHERE d.device_id NOT IN (SELECT device_id FROM logins) ORDER BY d.device_id`);
check("never-used devices = 11 and 14", JSON.stringify(unusedDevices.map((r) => r.device_id)) === "[11,14]", JSON.stringify(unusedDevices));
check("device 14 trusted=1 yet unused", one("SELECT trusted FROM devices WHERE device_id = 14") === 1);
check("U3 exactly 1 login", one("SELECT COUNT(*) FROM logins WHERE user_id = 3") === 1);

console.log("== planted: auth-style shapes (logins) ==");
const gap = one(`SELECT login_ts - (SELECT login_ts FROM logins WHERE login_id = 3) FROM logins WHERE login_id = 4`);
check("U1 session gap = 2700s", gap === 2700, `${gap}s`);
const burst = one(`SELECT COUNT(*) FROM logins WHERE user_id = 4 AND result = 'failed'
  AND login_ts BETWEEN 1784592000 + 43200 AND 1784592000 + 43200 + 300`);
check("U4 burst = 5 failed in 5 min", burst === 5, `${burst}`);
const burstGap = one(`SELECT MAX(g) FROM (SELECT login_ts - LAG(login_ts) OVER (ORDER BY login_ts) g FROM logins WHERE user_id = 4 AND result = 'failed' AND login_ts >= 1784592000 AND login_ts < 1784678400)`);
check("U4 fail-to-fail gaps = 60s max", burstGap === 60, `${burstGap}s`);
const succAfter = one(`SELECT login_ts - (SELECT MAX(login_ts) FROM logins WHERE user_id = 4 AND result = 'failed') FROM logins WHERE login_id = 31`);
check("U4 success 200s after last failure", succAfter === 200, `${succAfter}s`);
const pairs = one(`SELECT COUNT(*) FROM logins a JOIN logins b ON a.user_id = b.user_id AND a.login_id < b.login_id
  WHERE a.result = 'failed' AND b.result = 'failed' AND b.login_ts - a.login_ts <= 300`);
check("failed self-join pairs <= 300s = 11", pairs === 11, `${pairs}`);
const imp = q(`SELECT a.login_id a_id, b.login_id b_id, a.user_id, a.ip_country from_c, b.ip_country to_c, b.login_ts - a.login_ts gap
  FROM logins a JOIN logins b ON a.user_id = b.user_id AND a.login_id < b.login_id
  WHERE a.ip_country <> b.ip_country AND b.login_ts - a.login_ts <= 3600`) as Array<Record<string, unknown>>;
check("impossible-travel pairs = exactly 1 (U1 US->SG 3600s)", imp.length === 1 && imp[0].user_id === 1 && imp[0].from_c === "US" && imp[0].to_c === "SG" && imp[0].gap === 3600, JSON.stringify(imp));
const sess = q(`
  WITH seq AS (SELECT user_id, login_ts, LAG(login_ts) OVER (PARTITION BY user_id ORDER BY login_ts) prev_ts FROM logins),
  stamps AS (SELECT user_id, login_ts,
    SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
      OVER (PARTITION BY user_id ORDER BY login_ts ROWS UNBOUNDED PRECEDING) sess FROM seq)
  SELECT user_id, COUNT(DISTINCT sess) sessions FROM stamps GROUP BY user_id ORDER BY user_id`) as Array<{ user_id: number; sessions: number }>;
console.log("  sessions per user (1800s cutoff):", JSON.stringify(sess));
check("U1 = 5 sessions across the window", (sess.find((r) => r.user_id === 1) ?? { sessions: 0 }).sessions === 5);
const u1d1 = one(`SELECT COUNT(DISTINCT sess) FROM (
  WITH seq AS (SELECT login_ts, LAG(login_ts) OVER (ORDER BY login_ts) prev_ts FROM logins WHERE user_id = 1 AND login_ts < 1784592000),
  stamps AS (SELECT login_ts, SUM(CASE WHEN prev_ts IS NULL OR login_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
    OVER (ORDER BY login_ts ROWS UNBOUNDED PRECEDING) sess FROM seq)
  SELECT sess FROM stamps)`);
check("U1 07-20 splits into 2 sessions", u1d1 === 2, `${u1d1}`);
const byDay = q(`SELECT strftime('%Y-%m-%d', login_ts, 'unixepoch') d, COUNT(*) n FROM logins GROUP BY d ORDER BY d`);
check("login days 22/22/15/13", JSON.stringify(byDay.map((r) => r.n)) === "[22,22,15,13]", JSON.stringify(byDay));
const u9geo = q(`SELECT ip_country, COUNT(*) n FROM logins WHERE user_id = 9 GROUP BY ip_country ORDER BY ip_country`);
check("U9 logins: RU 1 / SG 3", JSON.stringify(u9geo) === JSON.stringify([{ ip_country: "RU", n: 1 }, { ip_country: "SG", n: 3 }]), JSON.stringify(u9geo));

console.log("== planted: daily volume ties ==");
const daily = q(`
  SELECT p2p_date, SUM(amount_cents) vol, COUNT(*) n
  FROM p2p WHERE status = 'settled'
  GROUP BY p2p_date ORDER BY p2p_date`) as Array<{ p2p_date: string; vol: number; n: number }>;
check("settled days = 37", daily.length === 37, `${daily.length}`);
check("top day = 04-02 fan-out 1960000", daily[0].p2p_date === "2026-04-02" || daily.find((d) => d.vol === 1960000)?.p2p_date === "2026-04-02");
const ties = daily.filter((d) => daily.filter((x) => x.vol === d.vol).length > 1);
const groups: Record<number, string[]> = {};
for (const t of ties) (groups[t.vol] ??= []).push(t.p2p_date);
console.log("  daily tie groups:", JSON.stringify(groups));
check("daily tie groups = 9", Object.keys(groups).length === 9, `${Object.keys(groups).length}`);
const dr8 = q(`SELECT * FROM (
  SELECT p2p_date, vol, DENSE_RANK() OVER (ORDER BY vol DESC) dr FROM (
    SELECT p2p_date, SUM(amount_cents) vol FROM p2p WHERE status = 'settled' GROUP BY p2p_date)) WHERE dr <= 8 ORDER BY dr, p2p_date`) as Array<Record<string, unknown>>;
console.log("  dense top-8 days:", JSON.stringify(dr8));
check("dense top-8 returns 10 rows (rank-8 three-way 24900)", dr8.length === 10, `${dr8.length}`);

console.log("== planted: disputes ==");
const drift = q(`SELECT d.dispute_id, d.amount_cents claim, p.amount_cents actual
  FROM disputes d JOIN p2p p ON p.p2p_id = d.p2p_id WHERE d.amount_cents <> p.amount_cents`) as Array<Record<string, unknown>>;
check("dispute amount drift = 3 (ids 4,5,12)", drift.length === 3 && JSON.stringify(drift.map((r) => r.dispute_id)) === "[4,5,12]", JSON.stringify(drift));
const dreason = q(`SELECT reason, COUNT(*) n FROM disputes GROUP BY reason ORDER BY n DESC, reason`);
check("reasons unauthorized6/INR3/dup2/other1", JSON.stringify(dreason) === JSON.stringify([{ reason: "unauthorized", n: 6 }, { reason: "item-not-received", n: 3 }, { reason: "duplicate", n: 2 }, { reason: "other", n: 1 }]), JSON.stringify(dreason));
const dstat = q(`SELECT status, COUNT(*) n FROM disputes GROUP BY status ORDER BY status`);
check("dispute statuses cancelled2/lost3/open4/won3", JSON.stringify(dstat) === JSON.stringify([{ status: "cancelled", n: 2 }, { status: "lost", n: 3 }, { status: "open", n: 4 }, { status: "won", n: 3 }]), JSON.stringify(dstat));
const claim = q(`SELECT user_id, COUNT(*) n FROM disputes GROUP BY user_id ORDER BY n DESC, user_id`);
check("U8 leads disputes with 3", claim[0].user_id === 8 && claim[0].n === 3, JSON.stringify(claim));
check("all disputed p2p rows are settled", one(`SELECT COUNT(*) FROM disputes d JOIN p2p p ON p.p2p_id = d.p2p_id WHERE p.status <> 'settled'`) === 0);

console.log("== planted: cases ==");
const perUser = q(`SELECT user_id, COUNT(*) n FROM cases GROUP BY user_id ORDER BY n DESC, user_id`) as Array<{ user_id: number; n: number }>;
check("U2 leads cases with 3", perUser[0].user_id === 2 && perUser[0].n === 3, JSON.stringify(perUser));
check("7 users cased", perUser.length === 7);
const cstat = q(`SELECT status, COUNT(*) n FROM cases GROUP BY status ORDER BY status`);
check("case statuses cf2/cc2/inv2/open6", JSON.stringify(cstat) === JSON.stringify([{ status: "closed-confirmed", n: 2 }, { status: "closed-false", n: 2 }, { status: "investigating", n: 2 }, { status: "open", n: 6 }]), JSON.stringify(cstat));
const sev = q(`SELECT severity, COUNT(*) n FROM cases GROUP BY severity ORDER BY severity`);
check("severities high3/low4/medium5", JSON.stringify(sev) === JSON.stringify([{ severity: "high", n: 3 }, { severity: "low", n: 4 }, { severity: "medium", n: 5 }]), JSON.stringify(sev));
const ctype = q(`SELECT case_type, COUNT(*) n FROM cases GROUP BY case_type ORDER BY n DESC, case_type`);
check("types aml3/abuse1/fraud7/kyc1", JSON.stringify(ctype) === JSON.stringify([{ case_type: "fraud", n: 7 }, { case_type: "aml", n: 3 }, { case_type: "abuse", n: 1 }, { case_type: "kyc", n: 1 }]), JSON.stringify(ctype));
check("SARs filed = 3", one("SELECT COUNT(*) FROM cases WHERE sar_filed = 1") === 3);
check("all SARs on aml cases", one("SELECT COUNT(*) FROM cases WHERE sar_filed = 1 AND case_type <> 'aml'") === 0);
const closedNull = q(`SELECT case_id FROM cases WHERE closed_date IS NULL AND status LIKE 'closed%'`);
check("closed cases always have closed_date", closedNull.length === 0, JSON.stringify(closedNull));
const openDated = q(`SELECT case_id FROM cases WHERE closed_date IS NOT NULL AND status NOT LIKE 'closed%'`);
check("live cases never have closed_date", openDated.length === 0, JSON.stringify(openDated));
const neverCased = q(`SELECT user_id FROM users WHERE user_id NOT IN (SELECT user_id FROM cases) ORDER BY user_id`);
check("never-cased = 3,5,7,10,12", JSON.stringify(neverCased.map((r) => r.user_id)) === "[3,5,7,10,12]", JSON.stringify(neverCased));

console.log("== shapes for content ==");
console.log("  user statuses:", JSON.stringify(q(`SELECT status, COUNT(*) n FROM users GROUP BY status ORDER BY n DESC, status`)));
console.log("  kyc tiers:", JSON.stringify(q(`SELECT kyc_tier, COUNT(*) n FROM users GROUP BY kyc_tier ORDER BY n DESC, kyc_tier`)));
console.log("  countries:", JSON.stringify(q(`SELECT country, COUNT(*) n FROM users GROUP BY country ORDER BY n DESC, country`)));
console.log("  devices trusted:", JSON.stringify(q(`SELECT trusted, COUNT(*) n FROM devices GROUP BY trusted`)));
console.log("  device os:", JSON.stringify(q(`SELECT os, COUNT(*) n FROM devices GROUP BY os ORDER BY n DESC, os`)));
console.log("  logins per device:", JSON.stringify(q(`SELECT d.device_id, COUNT(l.login_id) n FROM devices d LEFT JOIN logins l ON l.device_id = d.device_id GROUP BY d.device_id ORDER BY d.device_id`)));
console.log("  logins per user:", JSON.stringify(q(`SELECT u.user_id, COUNT(l.login_id) n FROM users u LEFT JOIN logins l ON l.user_id = u.user_id GROUP BY u.user_id ORDER BY u.user_id`)));
console.log("  high-risk (>=80) rows:", JSON.stringify(q(`SELECT p2p_id, sender_id, receiver_id, amount_cents, risk_score FROM p2p WHERE risk_score >= 80 ORDER BY p2p_id`)));
console.log("  monthly settled sent:", JSON.stringify(q(`SELECT strftime('%Y-%m', p2p_date) m, SUM(amount_cents) vol, COUNT(*) n FROM p2p WHERE status = 'settled' GROUP BY m ORDER BY m`)));
console.log("  channel volume (settled):", JSON.stringify(q(`SELECT channel, SUM(amount_cents) vol, COUNT(*) n FROM p2p WHERE status = 'settled' GROUP BY channel ORDER BY vol DESC`)));
console.log("  risk avg by channel (settled):", JSON.stringify(q(`SELECT channel, ROUND(AVG(risk_score), 1) avg_risk FROM p2p WHERE status = 'settled' GROUP BY channel ORDER BY avg_risk DESC`)));
console.log("  disputes by month:", JSON.stringify(q(`SELECT strftime('%Y-%m', filed_date) m, COUNT(*) n FROM disputes GROUP BY m ORDER BY m`)));
console.log("  case open->close days:", JSON.stringify(q(`SELECT case_id, JULIANDAY(closed_date) - JULIANDAY(opened_date) days FROM cases WHERE closed_date IS NOT NULL ORDER BY case_id`)));
console.log("  users by received (any status):", JSON.stringify(q(`SELECT receiver_id u, SUM(amount_cents) vol FROM p2p WHERE status = 'settled' GROUP BY receiver_id ORDER BY vol DESC`)));

db.close();
console.log(fails === 0 ? "\nALL PROBES PASS — seed is trustworthy" : `\n${fails} PROBE(S) FAILED — fix the seed`);
