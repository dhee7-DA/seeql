// Round 10 — probe the Finance Core world seed BEFORE authoring content.
// Every fact the pack's statements/edges will cite must pass here first.
import Database from "bun:sqlite";
import { DM_FIN_SCHEMA } from "../src/lib/leetcode/content/dm-fin-schema";
import { DM_FIN_SEED } from "../src/lib/leetcode/content/dm-fin-seed";

const db = new Database(":memory:");
db.exec(DM_FIN_SCHEMA.ddl);
db.exec(DM_FIN_SEED);
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
check("merchants = 14", one("SELECT COUNT(*) FROM merchants") === 14);
check("transactions = 56", one("SELECT COUNT(*) FROM transactions") === 56);
const status = q(`SELECT status, COUNT(*) n FROM transactions GROUP BY status ORDER BY status`);
check("statuses 47/3/4/2", JSON.stringify(status) === JSON.stringify([{ status: "declined", n: 4 }, { status: "pending", n: 3 }, { status: "posted", n: 47 }, { status: "reversed", n: 2 }]), JSON.stringify(status));
check("auths = 36", one("SELECT COUNT(*) FROM auths") === 36);
check("transfers = 14", one("SELECT COUNT(*) FROM transfers") === 14);
const tstat = q(`SELECT status, COUNT(*) n FROM transfers GROUP BY status ORDER BY status`);
check("transfer statuses 11/2/1", JSON.stringify(tstat) === JSON.stringify([{ status: "failed", n: 2 }, { status: "pending", n: 1 }, { status: "settled", n: 11 }]), JSON.stringify(tstat));
check("alerts = 12", one("SELECT COUNT(*) FROM alerts") === 12);
const credits = one(`SELECT COUNT(*) FROM transactions WHERE direction = 'credit'`);
check("credit rows = 8", credits === 8, `${credits}`);

console.log("== planted: A5 = A7 mirror tie ==");
const vol = q(`
  SELECT account_id,
         SUM(CASE WHEN direction='debit' THEN amount_cents ELSE 0 END) debit_vol,
         ROUND(SUM(CASE WHEN direction='debit' THEN amount_cents * interchange_bps ELSE 0 END) / 10000.0, 2) fee
  FROM transactions WHERE status = 'posted' GROUP BY account_id ORDER BY account_id`) as Array<{ account_id: number; debit_vol: number; fee: number }>;
console.table(vol);
const a5 = vol.find((r) => r.account_id === 5)!;
const a7 = vol.find((r) => r.account_id === 7)!;
check("A5 vol = A7 vol = 101200", a5.debit_vol === 101200 && a7.debit_vol === 101200, `${a5.debit_vol} vs ${a7.debit_vol}`);
check("A5 fee = A7 fee = 1659.4", a5.fee === 1659.4 && a7.fee === 1659.4, `${a5.fee} vs ${a7.fee}`);
const a8 = vol.find((r) => r.account_id === 8)!;
const a9 = vol.find((r) => r.account_id === 9)!;
check("A8 vol = A9 vol = 19500", a8.debit_vol === 19500 && a9.debit_vol === 19500, `${a8.debit_vol} vs ${a9.debit_vol}`);
check("A8 fee = A9 fee = 197.3", a8.fee === 197.3 && a9.fee === 197.3, `${a8.fee} vs ${a9.fee}`);
const ranked = q(`
  SELECT account_id, debit_vol,
         RANK() OVER (ORDER BY debit_vol DESC) r,
         DENSE_RANK() OVER (ORDER BY debit_vol DESC) dr
  FROM (SELECT account_id, SUM(CASE WHEN direction='debit' THEN amount_cents ELSE 0 END) debit_vol
        FROM transactions WHERE status='posted' GROUP BY account_id)`) as Array<{ account_id: number; debit_vol: number; r: number; dr: number }>;
console.log("  volume ranking (rank/dense):", JSON.stringify(ranked));
const top = ranked.find((r) => r.r === 1)!;
check("volume leader = A2 (1250000)", top.account_id === 2 && top.debit_vol === 1250000, JSON.stringify(top));

console.log("== planted: daily lone-debit tie 02-14 vs 04-18 ==");
const daily = q(`
  SELECT txn_date, SUM(amount_cents) vol, COUNT(*) n
  FROM transactions WHERE status='posted' AND direction='debit'
  GROUP BY txn_date ORDER BY txn_date`) as Array<{ txn_date: string; vol: number; n: number }>;
const d1 = daily.find((d) => d.txn_date === "2026-02-14")!;
const d2 = daily.find((d) => d.txn_date === "2026-04-18")!;
check("02-14 = 04-18 = 62000, lone each", d1.vol === 62000 && d2.vol === 62000 && d1.n === 1 && d2.n === 1, `${d1?.vol}/${d1?.n} · ${d2?.vol}/${d2?.n}`);
const ties = daily.filter((d) => daily.filter((x) => x.vol === d.vol).length > 1);
const groups: Record<number, string[]> = {};
for (const t of ties) (groups[t.vol] ??= []).push(t.txn_date);
console.log("  daily tie groups:", JSON.stringify(groups));
check("daily tie groups = 11", Object.keys(groups).length === 11, `${Object.keys(groups).length}`);
check("62000 group has exactly 2 days", (groups[62000] ?? []).length === 2);

console.log("== planted: data traps ==");
check("A11 zero txns", one("SELECT COUNT(*) FROM transactions WHERE account_id = 11") === 0);
check("A11 zero auths", one("SELECT COUNT(*) FROM auths WHERE account_id = 11") === 0);
check("A11 has exactly 1 alert (dark-web)", one(`SELECT COUNT(*) FROM alerts WHERE account_id = 11 AND alert_type = 'dark-web'`) === 1);
check("A11 receives exactly 1 settled transfer", one(`SELECT COUNT(*) FROM transfers WHERE to_account = 11 AND status = 'settled'`) === 1);
check("M14 never transacts", one("SELECT COUNT(*) FROM transactions WHERE merchant_id = 14") === 0);
check("M14 never auths", one("SELECT COUNT(*) FROM auths WHERE merchant_id = 14") === 0);
const drift = q(`SELECT t.txn_id, t.interchange_bps txn_bps, m.fee_bps cur
  FROM transactions t JOIN merchants m ON m.merchant_id = t.merchant_id
  WHERE t.channel = 'card' AND t.interchange_bps <> m.fee_bps`) as Array<{ txn_id: number; txn_bps: number; cur: number }>;
check("card bps drift rows = 3 (ids 4, 53, 56)", drift.length === 3 && JSON.stringify(drift.map((r) => r.txn_id)) === "[4,53,56]", JSON.stringify(drift));
check("other card rows all match current rate", one(`SELECT COUNT(*) FROM transactions t JOIN merchants m ON m.merchant_id = t.merchant_id WHERE t.channel = 'card' AND t.txn_id NOT IN (4, 53, 56) AND t.interchange_bps <> m.fee_bps`) === 0);
check("non-card rows all carry bps 0", one(`SELECT COUNT(*) FROM transactions WHERE channel <> 'card' AND interchange_bps <> 0`) === 0);
const rewards = q(`SELECT txn_id, reward_cents FROM transactions WHERE reward_cents IS NOT NULL`) as Array<{ txn_id: number; reward_cents: number }>;
check("reward rows = 11", rewards.length === 11, `${rewards.length}`);
check("reward total = 10010", rewards.reduce((s, r) => s + r.reward_cents, 0) === 10010);
const dup = q(`SELECT account_id, merchant_id, txn_date, COUNT(*) n FROM transactions
  WHERE merchant_id IS NOT NULL GROUP BY account_id, merchant_id, txn_date HAVING n > 1`);
check("duplicate acct+merchant+day only A3/M11/01-19", dup.length === 1 && dup[0].account_id === 3 && dup[0].merchant_id === 11 && dup[0].txn_date === "2026-01-19", JSON.stringify(dup));
const hv = one("SELECT COUNT(*) FROM transactions WHERE amount_cents >= 1000000");
const hvStrict = one("SELECT COUNT(*) FROM transactions WHERE amount_cents > 1000000");
const hvMax = one("SELECT MAX(amount_cents) FROM transactions");
check("exactly 1 txn >= 1000000, 0 > 1000000, max = 1000000", hv === 1 && hvStrict === 0 && hvMax === 1000000, `${hv}/${hvStrict}/${hvMax}`);

console.log("== planted: structuring shape ==");
const struct = q(`SELECT account_id, txn_date, COUNT(*) n, GROUP_CONCAT(amount_cents) amts
  FROM transactions
  WHERE channel='atm' AND direction='credit' AND amount_cents >= 900000 AND amount_cents < 1000000
  GROUP BY account_id, txn_date HAVING n >= 3`) as Array<{ account_id: number; txn_date: string; n: number; amts: string }>;
check("structuring detector catches exactly A8 on 05-11", struct.length === 1 && struct[0].account_id === 8 && struct[0].txn_date === "2026-05-11" && struct[0].n === 3 && struct[0].amts === "990000,995000,998000", JSON.stringify(struct));

console.log("== planted: auth shapes ==");
const gap = one(`SELECT auth_ts - (SELECT auth_ts FROM auths WHERE auth_id = 3) FROM auths WHERE auth_id = 4`);
check("A1 session gap = 2700s", gap === 2700, `${gap}s`);
const burst = one(`SELECT COUNT(*) FROM auths WHERE account_id = 4 AND result = 'declined'
  AND auth_ts BETWEEN 1784592000 + 43200 AND 1784592000 + 43200 + 300`);
check("A4 burst = 4 declines in 5 min", burst === 4, `${burst}`);
const burstGap = one(`SELECT MAX(g) FROM (SELECT auth_ts - LAG(auth_ts) OVER (ORDER BY auth_ts) g FROM auths WHERE account_id = 4 AND result = 'declined' AND auth_ts >= 1784592000 AND auth_ts < 1784678400)`);
check("A4 decline-to-decline gaps = 90s max", burstGap === 90, `${burstGap}s`);
const a3day = one(`SELECT COUNT(*) FROM auths WHERE account_id = 3`);
check("A3 has exactly 1 auth in window", a3day === 1, `${a3day}`);
const a6day = one(`SELECT COUNT(*) FROM auths WHERE account_id = 6 AND auth_ts >= 1784678400 AND auth_ts < 1784764800`);
check("A6 07-22 single declined auth", a6day === 1 && one(`SELECT COUNT(*) FROM auths WHERE account_id = 6 AND auth_ts >= 1784678400 AND auth_ts < 1784764800 AND result='declined'`) === 1);
const ares = q(`SELECT result, COUNT(*) n FROM auths GROUP BY result ORDER BY result`);
check("auth results 26 approved / 10 declined", JSON.stringify(ares) === JSON.stringify([{ result: "approved", n: 26 }, { result: "declined", n: 10 }]), JSON.stringify(ares));
const reasons = q(`SELECT decline_reason, COUNT(*) n FROM auths WHERE result = 'declined' GROUP BY decline_reason ORDER BY n DESC, decline_reason`);
check("decline reasons 4/4/2", JSON.stringify(reasons) === JSON.stringify([{ decline_reason: "insufficient-funds", n: 4 }, { decline_reason: "limit-exceeded", n: 4 }, { decline_reason: "fraud-suspect", n: 2 }]), JSON.stringify(reasons));
const byDay = q(`SELECT strftime('%Y-%m-%d', auth_ts, 'unixepoch') d, COUNT(*) n FROM auths GROUP BY d ORDER BY d`);
check("auth days 11/11/9/5", JSON.stringify(byDay.map((r) => r.n)) === "[11,11,9,5]", JSON.stringify(byDay));
const sess = q(`
  WITH seq AS (SELECT account_id, auth_ts, LAG(auth_ts) OVER (PARTITION BY account_id ORDER BY auth_ts) prev_ts FROM auths),
  stamps AS (SELECT account_id, auth_ts,
    SUM(CASE WHEN prev_ts IS NULL OR auth_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
      OVER (PARTITION BY account_id ORDER BY auth_ts ROWS UNBOUNDED PRECEDING) sess FROM seq)
  SELECT account_id, COUNT(DISTINCT sess) sessions FROM stamps GROUP BY account_id ORDER BY account_id`) as Array<{ account_id: number; sessions: number }>;
console.log("  sessions per account (1800s cutoff):", JSON.stringify(sess));
check("A1 = 3 sessions across the window", (sess.find((r) => r.account_id === 1) ?? { sessions: 0 }).sessions === 3);
const a1d1 = one(`SELECT COUNT(DISTINCT sess) FROM (
  WITH seq AS (SELECT auth_ts, LAG(auth_ts) OVER (ORDER BY auth_ts) prev_ts FROM auths WHERE account_id = 1 AND auth_ts < 1784592000),
  stamps AS (SELECT auth_ts, SUM(CASE WHEN prev_ts IS NULL OR auth_ts - prev_ts > 1800 THEN 1 ELSE 0 END)
    OVER (ORDER BY auth_ts ROWS UNBOUNDED PRECEDING) sess FROM seq)
  SELECT sess FROM stamps)`);
check("A1 07-20 splits into 2 sessions", a1d1 === 2, `${a1d1}`);

console.log("== planted: transfers ==");
const selfT = q(`SELECT transfer_id, from_account, to_account FROM transfers WHERE from_account = to_account`);
check("exactly 1 self-transfer (A4→A4)", selfT.length === 1 && selfT[0].from_account === 4, JSON.stringify(selfT));
const lane = q(`SELECT from_account, to_account, COUNT(*) n FROM transfers GROUP BY from_account, to_account HAVING n > 1`);
check("A2→A6 fires twice", lane.length === 1 && lane[0].from_account === 2 && lane[0].to_account === 6 && lane[0].n === 2, JSON.stringify(lane));
check("largest settled transfer = 750000", one(`SELECT MAX(amount_cents) FROM transfers WHERE status = 'settled'`) === 750000);
check("failed transfer total = 95000", one(`SELECT SUM(amount_cents) FROM transfers WHERE status = 'failed'`) === 95000);

console.log("== planted: alerts ==");
const perAcct = q(`SELECT account_id, COUNT(*) n FROM alerts GROUP BY account_id ORDER BY n DESC, account_id`) as Array<{ account_id: number; n: number }>;
check("A8 leads alerts with 3", perAcct[0].account_id === 8 && perAcct[0].n === 3, JSON.stringify(perAcct));
check("7 accounts alerted", perAcct.length === 7);
const astat = q(`SELECT status, COUNT(*) n FROM alerts GROUP BY status ORDER BY status`);
check("alert statuses 2/2/3/5", JSON.stringify(astat) === JSON.stringify([{ status: "closed-confirmed", n: 2 }, { status: "closed-false", n: 2 }, { status: "investigating", n: 3 }, { status: "open", n: 5 }]), JSON.stringify(astat));
const sev = q(`SELECT severity, COUNT(*) n FROM alerts GROUP BY severity ORDER BY severity`);
check("severities 2 high / 6 medium / 4 low", JSON.stringify(sev) === JSON.stringify([{ severity: "high", n: 2 }, { severity: "low", n: 4 }, { severity: "medium", n: 6 }]), JSON.stringify(sev));
const types = q(`SELECT alert_type, COUNT(*) n FROM alerts GROUP BY alert_type ORDER BY alert_type`);
check("types: dark-web2/geo3/high-value4/structuring1/velocity2", JSON.stringify(types) === JSON.stringify([{ alert_type: "dark-web", n: 2 }, { alert_type: "geo", n: 3 }, { alert_type: "high-value", n: 4 }, { alert_type: "structuring", n: 1 }, { alert_type: "velocity", n: 2 }]), JSON.stringify(types));
const neverAlerted = q(`SELECT account_id FROM accounts WHERE account_id NOT IN (SELECT account_id FROM alerts) ORDER BY account_id`);
check("never-alerted = 1,3,5,7,12", JSON.stringify(neverAlerted.map((r) => r.account_id)) === "[1,3,5,7,12]", JSON.stringify(neverAlerted));

console.log("== shapes for content ==");
check("Dubai branch = 2 accounts", one(`SELECT COUNT(*) FROM accounts WHERE branch = 'Dubai'`) === 2);
console.log("  branches:", JSON.stringify(q(`SELECT branch, COUNT(*) n FROM accounts GROUP BY branch ORDER BY n DESC, branch`)));
console.log("  account types:", JSON.stringify(q(`SELECT account_type, COUNT(*) n FROM accounts GROUP BY account_type ORDER BY n DESC, account_type`)));
console.log("  tiers:", JSON.stringify(q(`SELECT tier, COUNT(*) n FROM accounts GROUP BY tier ORDER BY n DESC, tier`)));
console.log("  merchant categories (active vs not):", JSON.stringify(q(`
    SELECT m.category, COUNT(DISTINCT m.merchant_id) merchants,
           COUNT(DISTINCT t.merchant_id) active_merchants
    FROM merchants m LEFT JOIN transactions t ON t.merchant_id = m.merchant_id AND t.status = 'posted'
    GROUP BY m.category ORDER BY m.category`)));
console.log("  monthly posted debit:", JSON.stringify(q(`
    SELECT strftime('%Y-%m', txn_date) m, SUM(amount_cents) vol
    FROM transactions WHERE status='posted' AND direction='debit'
    GROUP BY m ORDER BY m`)));
console.log("  posted credit total:", one(`SELECT SUM(amount_cents) FROM transactions WHERE status='posted' AND direction='credit'`));
console.log("  posted debit total:", one(`SELECT SUM(amount_cents) FROM transactions WHERE status='posted' AND direction='debit'`));
console.log("  bank fee revenue on posted debits:", one(`SELECT ROUND(SUM(amount_cents * interchange_bps)/10000.0, 2) FROM transactions WHERE status='posted' AND direction='debit'`));
console.log("  fee revenue by category:", JSON.stringify(q(`
    SELECT m.category, ROUND(SUM(t.amount_cents * t.interchange_bps)/10000.0, 2) fee
    FROM transactions t JOIN merchants m ON m.merchant_id = t.merchant_id
    WHERE t.status='posted' AND t.direction='debit'
    GROUP BY m.category ORDER BY fee DESC`)));
console.log("  categories:", JSON.stringify(q(`SELECT category, COUNT(*) n FROM merchants GROUP BY category ORDER BY n DESC, category`)));
console.log("  merchant countries:", JSON.stringify(q(`SELECT country, COUNT(*) n FROM merchants GROUP BY country ORDER BY n DESC, country`)));
console.log("  channels:", JSON.stringify(q(`SELECT channel, COUNT(*) n FROM transactions GROUP BY channel ORDER BY n DESC, channel`)));
console.log("  per-account txn counts (any status):", JSON.stringify(q(`SELECT account_id, COUNT(*) n FROM transactions GROUP BY account_id ORDER BY account_id`)));

db.close();
console.log(fails === 0 ? "\nALL PROBES PASS — seed is trustworthy" : `\n${fails} PROBE(S) FAILED — fix the seed`);
