// lc-round21-redo — rebuilds the Insurance & Claims Ops world after the
// workspace rollback. Deterministic (no RNG): every wall is hand-placed and
// probed. Emits the seed INSERTs to scripts/r21-icl-seed.sql and prints the
// probe facts the content banks will cite.
//
// Walls (from the round-21 design record):
//   - whale payment EXACTLY 100000000 = 45.29% of the 220800000 paid book;
//     type-board flips to liability ex-whale (whale is the ONLY paid property claim)
//   - c05 reopen_count EXACTLY 6 = the reopen ceiling (>=6 vs >6 splits 2 vs 1)
//   - FRS wall at 60: claims planted at 59/60/61 (>=60 vs >60 differ by the two 60s)
//   - the leak: claim 44's 9800000 paid while its SIU case is still open — savings 0
//   - aging boundary rows EXACTLY 30/60/91 days before the 2026-07-01 as-of
//   - ring: claims 71..77 = RC-4471..RC-4477 (contiguous), clocks avg 7/4/6, 4 paid
//   - Ivy (adjuster 1) closed EXACTLY 100 claims
//   - velocity: 2 same-policy filing pairs <= 300s apart (gaps 180s and EXACTLY 300s)
import { writeFileSync } from "node:fs";

const EPOCH = (date: string) => Math.floor(new Date(date + "T00:00:00Z").getTime() / 1000);
const D = (s: string) => `'${s}'`;
const V = (v: unknown) => (v === null ? "NULL" : typeof v === "string" ? `'${v.replace(/'/g, "''")}'` : String(v));
const ins = (table: string, cols: string[], rows: unknown[][]) =>
  `INSERT INTO ${table} (${cols.join(", ")}) VALUES\n` + rows.map((r) => `  (${r.map(V).join(", ")})`).join(",\n") + ";\n";

// ---------------------------------------------------------------- carriers
const carriers: unknown[][] = [
  [1, "Meridian Mutual", "MER", "Hartford", 1958],
  [2, "Ridgeway", "RDG", "Leeds", 1972],
  [3, "Harborline Assurance", "HBR", "Rotterdam", 1981],
  [4, "Crestpoint Indemnity", "CRS", "Toronto", 1964],
  [5, "Bluepine Mutual", "BLP", "Denver", 1990],
  [6, "Atlas Casualty", "ATL", "Singapore", 2003],
];

// ---------------------------------------------------------------- adjusters
const adjusters: unknown[][] = [
  [1, "Ivy Chen", "field", "NA", "2015-03-02"],
  [2, "Marcus Webb", "field", "NA", "2017-06-12"],
  [3, "Priya Nair", "desk", "EMEA", "2016-09-01"],
  [4, "Tom Okafor", "field", "EMEA", "2019-01-21"],
  [5, "Lena Fischer", "desk", "APAC", "2014-11-11"],
  [6, "Diego Santos", "field", "LATAM", "2020-02-03"],
  [7, "Ada Marsh", "siu", "NA", "2012-07-15"],
  [8, "Ravi Patel", "desk", "NA", "2021-05-19"],
];

// ---------------------------------------------------------------- policies
// 36 policies across carriers and types. Ring holder = Kessler (Meridian).
const holders = [
  "Kessler", "Osei", "Brightwater", "Nunoz", "Halloran", "Vance", "Whitfield",
  "Abara", "Lindqvist", "Marchetti", "Oyler", "Duarte", "Fenn", "Grimaldi",
  "Hask", "Iversen", "Jandali", "Keane", "Lomeli", "Mabry", "Nwosu", "Okabe",
  "Petrosian", "Quist", "Ravel", "Sorrell", "Tanaka", "Umland", "Vasquez",
  "Wexler", "Xiang", "Yarrow", "Zamora", "Bellweather", "Croft", "Delacroix",
];
const policyTypes = ["auto", "home", "commercial_property", "umbrella"] as const;
const policies: unknown[][] = holders.map((h, i) => {
  const id = i + 1;
  const holder = id <= 3 ? "Kessler Holdings" : `${h} Holdings`;
  const carrier = (id % 6) + 1;
  // policies 1-3 are the Kessler ring cluster at Meridian (carrier 1)
  const fixedCarrier = id <= 3 ? 1 : carrier;
  const type = id <= 3 ? (["home", "auto", "commercial_property"] as const)[id - 1] : policyTypes[i % 4];
  const premium = 48000 + ((id * 7919) % 40) * 2500;
  const eff = `2025-${String(((id * 3) % 12) + 1).padStart(2, "0")}-${String(((id * 7) % 27) + 1).padStart(2, "0")}`;
  return [id, `PL-2025-${String(1000 + id)}`, fixedCarrier, holder, type, premium, eff, "2026-12-31", "active"];
});
// one lapsed policy for honest-zero work
policies[34][8] = "lapsed";

// ---------------------------------------------------------------- claims
// 170 claims, RC-4401..RC-4570 (claim_number = RC-(4399+id)). Terminal
// statuses: denied / closed / paid. Non-terminal: open / under_review /
// approved. The closed book is claims 1..120 (all terminal); the live
// pipeline is claims 121..170.
type Claim = {
  id: number; policyId: number; carrierId: number; adjusterId: number;
  type: string; status: string; filedDate: string; lossDate: string; filedTs: number;
  amount: number; frs: number; reopen: number;
  contact: number | null; decision: number | null; payment: number | null;
};
const claims: Claim[] = [];
const TYPES = ["liability", "property", "injury", "theft", "flood"] as const;
const TERMINAL = new Set(["paid", "closed", "denied"]);

function addClaim(
  id: number, opts: Partial<Claim> = {},
) {
  const policyId = opts.policyId ?? ((id * 7) % 36) + 1;
  const claim: Claim = {
    id,
    policyId,
    carrierId: opts.carrierId ?? (policies[policyId - 1][2] as number),
    adjusterId: opts.adjusterId ?? ((id * 5) % 8) + 1,
    type: opts.type ?? TYPES[id % 5],
    status: opts.status ?? "open",
    filedDate: opts.filedDate ?? `2026-${String(((id * 4) % 6) + 1).padStart(2, "0")}-${String(((id * 11) % 27) + 1).padStart(2, "0")}`,
    lossDate: opts.lossDate ?? `2026-${String(((id * 4) % 6) + 1).padStart(2, "0")}-${String(((id * 13) % 27) + 1).padStart(2, "0")}`,
    filedTs: 0, // set in the filedTs pass below
    amount: opts.amount ?? 200000 + ((id * 91733) % 90) * 50000,
    frs: opts.frs ?? 8 + ((id * 37) % 45),
    reopen: opts.reopen ?? (id % 3 === 0 ? 1 : 0),
    contact: opts.contact ?? null,
    decision: opts.decision ?? null,
    payment: opts.payment ?? null,
  };
  if (opts.reopen !== undefined) claim.reopen = opts.reopen;
  claims.push(claim);
}

// ---- the closed book: claims 1..120 ALL terminal. Adjuster split: every
// 6th claim goes to the bench (adjusters 2-8), the rest to Ivy (adjuster 1)
// -> Ivy owns EXACTLY 100 book claims. All terminal, none property (the
// whale is the only paid property claim in the world).
for (let id = 1; id <= 120; id++) {
  const status = id % 20 < 12 ? "paid" : id % 20 < 17 ? "denied" : "closed";
  const decided = status === "denied" ? null : 2 + (id % 9);
  const defType = TYPES[id % 5];
  const type = defType === "property" ? ["liability", "injury", "theft"][id % 3] : defType;
  // claim 72 is ring property (the ring spec hands it to Ivy) — keep it out
  // of her book count so the takeover is net-zero
  // claims 71/72 sit near the ring — 71 goes to the bench (the ring hands
  // 72-77 to Ivy, which would otherwise put her one over the ceiling)
  const adjusterId = id % 6 === 0 || id === 71 ? ((Math.floor(id / 6) - 1) % 7) + 2 : 1;
  addClaim(id, {
    adjusterId,
    status,
    type,
    contact: 3 + (id % 11),
    decision: decided,
    payment: status === "paid" ? 3 + (id % 8) : null,
  });
}
// ---- claims 121..170: the live book (open pipeline), adjusters 2-8
for (let id = 121; id <= 170; id++) {
  const status = id % 5 === 0 ? "under_review" : id % 7 === 0 ? "approved" : "open";
  addClaim(id, { adjusterId: ((id - 121) % 7) + 2, status, contact: id % 12 === 0 ? null : 1 + (id % 14) });
}
// ---- wall placements ----
// c05: reopen EXACTLY 6 (the ceiling row); c92: 7 (over it)
claims[4].reopen = 6;
claims[91].reopen = 7;
// FRS wall: two claims EXACTLY 60, two at 59, two at 61 (>=60 vs >60 differ by 2)
claims[9].frs = 60;
claims[27].frs = 60;
claims[14].frs = 59;
claims[33].frs = 59;
claims[41].frs = 61;
claims[55].frs = 61;
// c44 THE LEAK: FRS 74, SIU opened 05-28 still unconfirmed, 9800000 paid 05-30
claims[43].frs = 74;
claims[43].type = "liability";
claims[43].status = "paid";
claims[43].amount = 9800000;
claims[43].filedDate = "2026-05-10";
claims[43].lossDate = "2026-05-08";
// the whale: claim 130, property, 100000000 PAID — the only paid property claim
claims[129].type = "property";
claims[129].status = "paid";
claims[129].amount = 100000000;
claims[129].filedDate = "2026-04-14";
claims[129].lossDate = "2026-04-11";
claims[129].adjusterId = 2; // Marcus Webb carries the whale
claims[129].contact = 4;
claims[129].decision = 9;
claims[129].payment = 12;
// aging boundary rows: open claims EXACTLY 30 / 60 / 91 days before 2026-07-01
claims[154].filedDate = "2026-06-01"; // 30 (claim 155)
claims[154].status = "open";
claims[161].filedDate = "2026-05-02"; // 60 (claim 162)
claims[161].status = "under_review";
claims[167].filedDate = "2026-04-01"; // 91 (claim 168)
claims[167].status = "open";
// make sure no OTHER open claim sits on 30/60/91: force the pipeline filedDates
// away from those lines
for (const c of claims) {
  if (c.id === 155 || c.id === 162 || c.id === 168) continue;
  if (!TERMINAL.has(c.status)) {
    const d = new Date(c.filedDate + "T00:00:00Z");
    const aging = Math.round((Date.UTC(2026, 6, 1) - d.getTime()) / 86400000);
    if (aging === 30 || aging === 60 || aging === 91) {
      c.filedDate = "2026-06-03";
      c.lossDate = "2026-06-01";
    }
  }
}
// velocity pairs: (141,142) same policy gap 180s; (148,149) same policy gap EXACTLY 300s
claims[140].policyId = 20;
claims[141].policyId = 20;
claims[140].filedDate = "2026-06-10";
claims[141].filedDate = "2026-06-10";
claims[147].policyId = 26;
claims[148].policyId = 26;
claims[147].filedDate = "2026-06-18";
claims[148].filedDate = "2026-06-18";
// filed_ts pass — epoch seconds. Default: spread across the filed day.
// Velocity pairs get exact timestamps; then a safety pass nudges any
// UNINTENDED same-policy pair within 300s of each other.
for (const c of claims) c.filedTs = EPOCH(c.filedDate) + ((c.id * 3763) % 86400);
claims[140].filedTs = EPOCH("2026-06-10") + 9 * 3600; // claim 141 @ 09:00:00
claims[141].filedTs = EPOCH("2026-06-10") + 9 * 3600 + 180; // claim 142 +180s — pair 1
claims[147].filedTs = EPOCH("2026-06-18") + 10 * 3600; // claim 148 @ 10:00:00
claims[148].filedTs = EPOCH("2026-06-18") + 10 * 3600 + 300; // claim 149 +300s EXACTLY — pair 2
for (let i = 0; i < claims.length; i++) {
  for (let j = i + 1; j < claims.length; j++) {
    const a = claims[i], b = claims[j];
    if (a.policyId !== b.policyId) continue;
    const isPair = [a.id, b.id].every((id) => [141, 142, 148, 149].includes(id));
    if (isPair && Math.abs(a.filedTs - b.filedTs) <= 300) continue;
    if (!isPair && Math.abs(a.filedTs - b.filedTs) <= 600) {
      b.filedTs = a.filedTs + 3600 + j * 61; // push apart, stay same day-ish
    }
  }
}
// ---- the ring: claims 72..78 = RC-4471..RC-4477 (number = 4399+id),
// Kessler cluster at Meridian. Clocks average EXACTLY 7/4/6; four paid.
const ringSpec = [
  // id type         status          amount     frs contact decision payment
  [72, "theft", "paid", 2400000, 68, 5, 3, 5],
  [73, "theft", "paid", 3100000, 71, 8, 4, 5],
  [74, "liability", "paid", 5600000, 77, 6, 2, 9],
  [75, "injury", "denied", 12000000, 82, 9, 6, null],
  [76, "theft", "paid", 1900000, 64, 7, 5, 5],
  [77, "liability", "denied", 8800000, 88, 4, 4, null],
  [78, "property", "under_review", 6200000, 91, 10, null, null],
] as const;
for (const [id, type, status, amount, frs, contact, decision, payment] of ringSpec) {
  const c = claims[id - 1];
  c.policyId = id <= 74 ? 1 : id <= 77 ? 2 : 3; // Kessler cluster
  c.carrierId = 1; // Meridian Mutual
  c.adjusterId = id === 78 ? 7 : 1; // Ada Marsh holds the open one, Ivy the rest
  c.type = type; c.status = status; c.amount = amount; c.frs = frs;
  c.contact = contact; c.decision = decision; c.payment = payment;
  c.filedDate = `2026-03-${String(2 + (id - 72)).padStart(2, "0")}`; // burst 03-02..03-08
  c.lossDate = `2026-02-${String(20 + (id - 72) > 28 ? 28 : 20 + (id - 72))}`;
}
// Ivy closed recount: the book gives Ivy exactly 100 terminal claims (claims
// 1..120 minus the twenty 6th-claim bench rows; ring claim 78 was already a
// bench row). The whale went to Marcus Webb. No rebalancing needed.

// ---------------------------------------------------------------- payments
// Paid book EXACTLY 220800000: whale 100000000 (property) + liability 61300000
// + injury 28500000 + theft 17000000 + flood 14000000. Property ex-whale = 0.
type Pay = { id: number; claimId: number; amount: number; paidOn: string; method: string; status: string };
const payments: Pay[] = [];
let payId = 1;
function addPay(claimId: number, amount: number, paidOn: string, method: string, status = "paid") {
  payments.push({ id: payId++, claimId, amount, paidOn, method, status });
}
// claim status paid => a paid payment; denied/closed => none (closed = withdrawn without pay)
const paidClaims = claims.filter((c) => c.status === "paid");
// distribute liability/injury/theft/flood paid totals across their paid claims
const buckets: Record<string, { total: number; claims: number[] }> = {
  liability: { total: 61300000, claims: [] },
  injury: { total: 28500000, claims: [] },
  theft: { total: 17000000, claims: [] },
  flood: { total: 14000000, claims: [] },
  property: { total: 100000000, claims: [] },
};
for (const c of paidClaims) buckets[c.type].claims.push(c.id);
// fixed anchors: whale (property), c44 leak (theft 9800000), ring 73 (liability 5600000),
// ring 71/72/75 (theft 2400000/3100000/1900000)
const anchors = new Map<number, { amount: number; paidOn: string }>([
  [130, { amount: 100000000, paidOn: "2026-05-01" }],
  [44, { amount: 9800000, paidOn: "2026-05-30" }],
  [74, { amount: 5600000, paidOn: "2026-04-04" }],
  [72, { amount: 2400000, paidOn: "2026-03-25" }],
  [73, { amount: 3100000, paidOn: "2026-03-28" }],
  [76, { amount: 1900000, paidOn: "2026-04-01" }],
]);
for (const [type, b] of Object.entries(buckets)) {
  const anchored = b.claims.filter((id) => anchors.has(id));
  let used = anchored.reduce((a, id) => a + (anchors.get(id) as { amount: number }).amount, 0);
  const rest = b.claims.filter((id) => !anchors.has(id));
  if (type === "property") {
    // whale is the ONLY paid property claim — rest must be empty
    if (rest.length > 0) throw new Error("unexpected extra paid property claims: " + rest.join(","));
    for (const id of anchored) addPay(id, (anchors.get(id) as { amount: number }).amount, (anchors.get(id) as { paidOn: string }).paidOn, "wire");
    continue;
  }
  const remaining = b.total - used;
  const n = rest.length;
  if (n === 0) throw new Error(`bucket ${type} has no free claims`);
  const base = Math.floor(remaining / n);
  let rem = remaining - base * n;
  rest.forEach((id, i) => {
    const amt = base + (i < rem ? 1 : 0);
    addPay(id, amt, claims[id - 1].filedDate.slice(0, 8) + "20", i % 3 === 0 ? "ach" : i % 3 === 1 ? "wire" : "check");
  });
  // emit the anchored payments themselves (they were only subtracted so far)
  for (const id of anchored) {
    const a = anchors.get(id) as { amount: number; paidOn: string };
    addPay(id, a.amount, a.paidOn, "wire");
  }
  used = b.total;
  void used;
}
// pending + void + recovered extras (never counted in the paid book)
addPay(claims[156].id, 1400000, "2026-06-24", "ach", "pending");
addPay(claims[163].id, 2200000, "2026-06-26", "check", "pending");
addPay(claims[138].id, 900000, "2026-06-11", "ach", "void");
addPay(claims[150].id, 3000000, "2026-06-05", "wire", "recovered"); // a clawback that DID land (non-SIU)

// ---------------------------------------------------------------- siu_cases
// 12 referrals: every claim with frs >= 60. verdict: confirmed (confirmed_on set),
// cleared (set), open (NULL). c44 must stay OPEN. Ring: 71 confirmed, 72 cleared,
// 73 confirmed, 74 cleared, 75 cleared, 76 open (denied claim), 77 open.
const referred = claims.filter((c) => c.frs >= 60).map((c) => c.id);
const verdictPlan = new Map<number, { verdict: string; openedOn: string; confirmedOn: string | null }>([
  [44, { verdict: "open", openedOn: "2026-05-28", confirmedOn: null }],
  [72, { verdict: "confirmed", openedOn: "2026-03-12", confirmedOn: "2026-04-02" }],
  [73, { verdict: "cleared", openedOn: "2026-03-14", confirmedOn: "2026-04-06" }],
  [74, { verdict: "confirmed", openedOn: "2026-03-16", confirmedOn: "2026-04-10" }],
  [75, { verdict: "cleared", openedOn: "2026-03-18", confirmedOn: "2026-04-14" }],
  [76, { verdict: "cleared", openedOn: "2026-03-20", confirmedOn: "2026-04-16" }],
  [77, { verdict: "open", openedOn: "2026-03-22", confirmedOn: null }],
  [78, { verdict: "open", openedOn: "2026-03-24", confirmedOn: null }],
  [10, { verdict: "confirmed", openedOn: "2026-02-10", confirmedOn: "2026-03-05" }],
  [28, { verdict: "cleared", openedOn: "2026-02-20", confirmedOn: "2026-03-15" }],
  [42, { verdict: "confirmed", openedOn: "2026-03-01", confirmedOn: "2026-03-28" }],
  [56, { verdict: "cleared", openedOn: "2026-03-05", confirmedOn: "2026-04-01" }],
]);
for (const id of referred) {
  if (!verdictPlan.has(id)) throw new Error(`referred claim ${id} has no verdict plan`);
}

// ---------------------------------------------------------------- emit
const parts: string[] = [];
parts.push(ins("carriers", ["carrier_id", "name", "code", "hq_city", "founded"], carriers));
parts.push(ins("adjusters", ["adjuster_id", "name", "team", "region", "hired_on"], adjusters));
parts.push(ins("policies", ["policy_id", "policy_number", "carrier_id", "holder_name", "policy_type", "premium_cents", "effective_date", "expiry_date", "status"], policies));
parts.push(
  ins(
    "claims",
    ["claim_id", "claim_number", "policy_id", "carrier_id", "adjuster_id", "claim_type", "status", "filed_date", "loss_date", "filed_ts", "amount_cents", "fraud_risk_score", "reopen_count", "first_contact_days", "decision_days", "payment_days"],
    claims.map((c) => [c.id, `RC-${4399 + c.id}`, c.policyId, c.carrierId, c.adjusterId, c.type, c.status, c.filedDate, c.lossDate, c.filedTs, c.amount, c.frs, c.reopen, c.contact, c.decision, c.payment]),
  ),
);
parts.push(ins("payments", ["payment_id", "claim_id", "amount_cents", "paid_on", "method", "status"], payments.map((p, i) => [i + 1, p.claimId, p.amount, p.paidOn, p.method, p.status])));
parts.push(
  ins(
    "siu_cases",
    ["siu_id", "claim_id", "opened_on", "confirmed_on", "verdict"],
    referred.map((id, i) => {
      const v = verdictPlan.get(id) as { verdict: string; openedOn: string; confirmedOn: string | null };
      return [i + 1, id, v.openedOn, v.confirmedOn, v.verdict];
    }),
  ),
);
const sql = parts.join("\n");
writeFileSync("/home/z/my-project/scripts/r21-icl-seed.sql", sql);

// ---------------------------------------------------------------- probe
const facts: string[] = [];
const paidByType = new Map<string, number>();
let paidTotal = 0;
for (const p of payments) {
  if (p.status !== "paid") continue;
  const t = claims[p.claimId - 1].type;
  paidByType.set(t, (paidByType.get(t) ?? 0) + p.amount);
  paidTotal += p.amount;
}
facts.push(`paid total = ${paidTotal} (want 220800000)`);
for (const [t, v] of [...paidByType.entries()].sort((a, b) => b[1] - a[1])) facts.push(`paid ${t} = ${v}`);
const whaleShare = Math.round((100000000 / paidTotal) * 10000) / 100;
facts.push(`whale share = ${whaleShare}% (want 45.29)`);
const ivyClosed = claims.filter((c) => c.adjusterId === 1 && TERMINAL.has(c.status)).length;
facts.push(`Ivy closed = ${ivyClosed} (want 100)`);
const ring = claims.slice(71, 78);
const avg = (arr: (number | null)[]) => {
  const xs = arr.filter((x): x is number => x !== null);
  return xs.length ? Math.round((xs.reduce((a, b) => a + b, 0) / xs.length) * 100) / 100 : null;
};
facts.push(`ring numbers = ${ring.map((c) => "RC-" + (4399 + c.id)).join(",")}`);
facts.push(`ring avg contact/decision/payment = ${avg(ring.map((c) => c.contact))}/${avg(ring.map((c) => c.decision))}/${avg(ring.map((c) => c.payment))} (want 7/4/6)`);
const ringPaid = ring.filter((c) => c.status === "paid").length;
facts.push(`ring paid = ${ringPaid} (want 4)`);
const re6 = claims.filter((c) => c.reopen >= 6).map((c) => c.id);
const reOver6 = claims.filter((c) => c.reopen > 6).map((c) => c.id);
facts.push(`reopen >=6: [${re6}] (>6: [${reOver6}]) (want [5,92] vs [92])`);
const frs60 = claims.filter((c) => c.frs >= 60).length;
const frsOver60 = claims.filter((c) => c.frs > 60).length;
facts.push(`FRS >=60: ${frs60} vs >60: ${frsOver60} (differ by the two 60s)`);
const leak = payments.filter((p) => p.status === "paid" && (verdictPlan.get(p.claimId)?.verdict === "open"));
facts.push(`leak payments (paid + SIU open) = ${leak.map((p) => `${p.claimId}:${p.amount}`).join(", ")} (want 44:9800000)`);
const voidable = leak.filter((p) => p.status === "pending").reduce((a, p) => a + p.amount, 0);
facts.push(`voidable savings = ${voidable} (want 0)`);
const aging = (d: string) => Math.round((Date.UTC(2026, 6, 1) - new Date(d + "T00:00:00Z").getTime()) / 86400000);
const openAging = claims.filter((c) => !TERMINAL.has(c.status)).map((c) => aging(c.filedDate));
facts.push(`open aging boundary rows: 30s=${openAging.filter((a) => a === 30).length} 60s=${openAging.filter((a) => a === 60).length} 91s=${openAging.filter((a) => a === 91).length} (want 1/1/1)`);
facts.push(`open pipeline size = ${openAging.length}, aging buckets <=30:${openAging.filter((a) => a <= 30).length} 31-60:${openAging.filter((a) => a > 30 && a <= 60).length} 61-90:${openAging.filter((a) => a > 60 && a <= 90).length} 91+:${openAging.filter((a) => a > 90).length}`);
// velocity: same-policy claims with filed_ts within 300s of each other
const velPairs: string[] = [];
for (let i = 0; i < claims.length; i++) {
  for (let j = i + 1; j < claims.length; j++) {
    const a = claims[i], b = claims[j];
    if (a.policyId === b.policyId && Math.abs(a.filedTs - b.filedTs) <= 300) {
      velPairs.push(`${a.id}-${b.id}:${Math.abs(a.filedTs - b.filedTs)}s`);
    }
  }
}
facts.push(`velocity pairs <=300s = [${velPairs.join(", ")}] (want 141-142:180s, 148-149:300s)`);
// debug: adjuster terminal census
const adjTerm = new Map<number, number>();
for (const c of claims) if (TERMINAL.has(c.status)) adjTerm.set(c.adjusterId, (adjTerm.get(c.adjusterId) ?? 0) + 1);
facts.push(`terminal per adjuster = ${[...adjTerm.entries()].sort((a, b) => a[0] - b[0]).map(([a, n]) => `adj${a}:${n}`).join(" ")}`);
const ringDbg = claims.slice(71, 78).map((c) => `${c.id}:adj${c.adjusterId}:${c.status}`).join(" ");
facts.push(`ring rows = ${ringDbg}`);
console.log(facts.join("\n"));
console.log(`\nseed sql bytes = ${sql.length}, claims = ${claims.length}, payments = ${payments.length}, siu = ${referred.length}`);
