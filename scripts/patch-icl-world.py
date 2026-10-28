#!/usr/bin/env python3
import re, sys

p = "/home/z/my-project/scripts/r21-icl-world.ts"
s = open(p).read()
n0 = s

def rep(old, new, count=1):
    global s
    found = s.count(old)
    assert found == count, f"pattern x{found} (want {count}): {old[:70]!r}"
    s = s.replace(old, new)

# --- c44 type: theft -> liability
rep('claims[43].type = "theft";', 'claims[43].type = "liability";')

# --- whale block: claim 120 -> 130, Ivy -> Marcus Webb
rep("""// the whale: claim 120, property, 100000000 PAID — the only paid property claim
claims[119].type = "property";
claims[119].status = "paid";
claims[119].amount = 100000000;
claims[119].filedDate = "2026-04-14";
claims[119].lossDate = "2026-04-11";
claims[119].adjusterId = 1; // Ivy carries the whale
claims[119].contact = 4;
claims[119].decision = 9;
claims[119].payment = 12;""",
"""// the whale: claim 130, property, 100000000 PAID — the only paid property claim
claims[129].type = "property";
claims[129].status = "paid";
claims[129].amount = 100000000;
claims[129].filedDate = "2026-04-14";
claims[129].lossDate = "2026-04-11";
claims[129].adjusterId = 2; // Marcus Webb carries the whale
claims[129].contact = 4;
claims[129].decision = 9;
claims[129].payment = 12;""")

# --- aging boundaries: 125/132/140 -> 154/161/167
rep("""claims[125].filedDate = "2026-06-01"; // 30
claims[125].status = "open";
claims[132].filedDate = "2026-05-02"; // 60
claims[132].status = "under_review";
claims[140].filedDate = "2026-04-01"; // 91
claims[140].status = "open";""",
"""claims[154].filedDate = "2026-06-01"; // 30 (claim 155)
claims[154].status = "open";
claims[161].filedDate = "2026-05-02"; // 60 (claim 162)
claims[161].status = "under_review";
claims[167].filedDate = "2026-04-01"; // 91 (claim 168)
claims[167].status = "open";""")

rep("if (c.id === 126 || c.id === 133 || c.id === 141) continue;",
    "if (c.id === 155 || c.id === 162 || c.id === 168) continue;")

# --- velocity pairs: 101/102, 118/119 -> 141/142, 148/149
rep("""// velocity pairs: (101,102) same policy gap 180s; (118,119) same policy gap EXACTLY 300s
claims[100].policyId = 20;
claims[101].policyId = 20;
claims[100].filedDate = "2026-06-10";
claims[101].filedDate = "2026-06-10";
claims[117].policyId = 26;
claims[118].policyId = 26;
claims[117].filedDate = "2026-06-18";
claims[118].filedDate = "2026-06-18";""",
"""// velocity pairs: (141,142) same policy gap 180s; (148,149) same policy gap EXACTLY 300s
claims[140].policyId = 20;
claims[141].policyId = 20;
claims[140].filedDate = "2026-06-10";
claims[141].filedDate = "2026-06-10";
claims[147].policyId = 26;
claims[148].policyId = 26;
claims[147].filedDate = "2026-06-18";
claims[148].filedDate = "2026-06-18";""")

rep("""claims[100].filedTs = EPOCH("2026-06-10") + 9 * 3600; // 09:00:00
claims[101].filedTs = EPOCH("2026-06-10") + 9 * 3600 + 180; // +180s — pair 1
claims[117].filedTs = EPOCH("2026-06-18") + 10 * 3600; // 10:00:00
claims[118].filedTs = EPOCH("2026-06-18") + 10 * 3600 + 300; // +300s EXACTLY — pair 2""",
"""claims[140].filedTs = EPOCH("2026-06-10") + 9 * 3600; // claim 141 @ 09:00:00
claims[141].filedTs = EPOCH("2026-06-10") + 9 * 3600 + 180; // claim 142 +180s — pair 1
claims[147].filedTs = EPOCH("2026-06-18") + 10 * 3600; // claim 148 @ 10:00:00
claims[148].filedTs = EPOCH("2026-06-18") + 10 * 3600 + 300; // claim 149 +300s EXACTLY — pair 2""")

# --- ring: ids 71..77 -> 72..78, number offset 4399
rep("""// ---- the ring: claims 71..77 = RC-4471..4477, Kessler cluster, Meridian
const ringSpec = [
  // id type              status          amount     frs contact decision payment
  [71, "theft", "paid", 2400000, 68, 5, 3, 5],
  [72, "theft", "paid", 3100000, 71, 8, 4, 5],
  [73, "liability", "paid", 5600000, 77, 6, 2, 9],
  [74, "injury", "denied", 12000000, 82, 9, 6, null],
  [75, "theft", "paid", 1900000, 64, 7, 5, 5],
  [76, "liability", "denied", 8800000, 88, 4, 4, null],
  [77, "property", "under_review", 6200000, 91, 10, null, null],
] as const;""",
"""// ---- the ring: claims 72..78 = RC-4471..RC-4477 (number = 4399+id),
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
] as const;""")

rep("c.policyId = id <= 73 ? 1 : id <= 76 ? 2 : 3; // Kessler cluster",
    "c.policyId = id <= 74 ? 1 : id <= 77 ? 2 : 3; // Kessler cluster")
rep("c.adjusterId = id === 77 ? 7 : 1; // Ada Marsh holds the open one, Ivy the rest",
    "c.adjusterId = id === 78 ? 7 : 1; // Ada Marsh holds the open one, Ivy the rest")
rep('c.filedDate = `2026-03-${String(2 + (id - 71))}`; // burst 03-02..03-08',
    'c.filedDate = `2026-03-${String(2 + (id - 72))}`; // burst 03-02..03-08')
rep('c.lossDate = `2026-02-${String(20 + (id - 71) > 28 ? 28 : 20 + (id - 71))}`;',
    'c.lossDate = `2026-02-${String(20 + (id - 72) > 28 ? 28 : 20 + (id - 72))}`;')

# --- Ivy recount: delete the rebalance move (book split already gives her 100)
rep("""// Ivy closed recount: ring gave Ivy 5 more terminal claims (71-76 are terminal
// except 77; 71-76 = 6 claims: 4 paid + 2 denied = 6 terminal). She was at 100
// from claims 1..100 — that already counted 100; the ring ADDS 6 terminal rows
// to Ivy -> 106. Rebalance: move 6 of Ivy's claims 1..100 to other adjusters
// keeping them terminal (their payments move too). Pick ids 95..100 -> adjuster 2.
for (let id = 95; id <= 100; id++) {
  claims[id - 1].adjusterId = 2;
}
// Ivy terminal count now: claims 1..94 terminal (94) + ring terminal (6) = 100 EXACTLY""",
"""// Ivy closed recount: the book gives Ivy exactly 100 terminal claims (claims
// 1..120 minus the twenty 6th-claim bench rows; ring claim 78 was already a
// bench row). The whale went to Marcus Webb. No rebalancing needed.""")

# --- anchors: 120->130, 73->74, 71->72, 72->73, 75->76
rep("""const anchors = new Map<number, { amount: number; paidOn: string }>([
  [120, { amount: 100000000, paidOn: "2026-05-01" }],
  [44, { amount: 9800000, paidOn: "2026-05-30" }],
  [73, { amount: 5600000, paidOn: "2026-04-04" }],
  [71, { amount: 2400000, paidOn: "2026-03-25" }],
  [72, { amount: 3100000, paidOn: "2026-03-28" }],
  [75, { amount: 1900000, paidOn: "2026-04-01" }],
]);""",
"""const anchors = new Map<number, { amount: number; paidOn: string }>([
  [130, { amount: 100000000, paidOn: "2026-05-01" }],
  [44, { amount: 9800000, paidOn: "2026-05-30" }],
  [74, { amount: 5600000, paidOn: "2026-04-04" }],
  [72, { amount: 2400000, paidOn: "2026-03-25" }],
  [73, { amount: 3100000, paidOn: "2026-03-28" }],
  [76, { amount: 1900000, paidOn: "2026-04-01" }],
]);""")

# --- extra payments onto pipeline claims
rep('addPay(claims[128].id, 1400000, "2026-06-24", "ach", "pending");',
    'addPay(claims[156].id, 1400000, "2026-06-24", "ach", "pending");')
rep('addPay(claims[135].id, 2200000, "2026-06-26", "check", "pending");',
    'addPay(claims[163].id, 2200000, "2026-06-26", "check", "pending");')
rep('addPay(claims[110].id, 900000, "2026-06-11", "ach", "void");',
    'addPay(claims[138].id, 900000, "2026-06-11", "ach", "void");')
rep('addPay(claims[122].id, 3000000, "2026-06-05", "wire", "recovered"); // a clawback that DID land (non-SIU)',
    'addPay(claims[150].id, 3000000, "2026-06-05", "wire", "recovered"); // a clawback that DID land (non-SIU)')

# --- verdict plan: shift ring entries 71-77 -> 72-78
rep("""  [44, { verdict: "open", openedOn: "2026-05-28", confirmedOn: null }],
  [71, { verdict: "confirmed", openedOn: "2026-03-12", confirmedOn: "2026-04-02" }],
  [72, { verdict: "cleared", openedOn: "2026-03-14", confirmedOn: "2026-04-06" }],
  [73, { verdict: "confirmed", openedOn: "2026-03-16", confirmedOn: "2026-04-10" }],
  [74, { verdict: "cleared", openedOn: "2026-03-18", confirmedOn: "2026-04-14" }],
  [75, { verdict: "cleared", openedOn: "2026-03-20", confirmedOn: "2026-04-16" }],
  [76, { verdict: "open", openedOn: "2026-03-22", confirmedOn: null }],
  [77, { verdict: "open", openedOn: "2026-03-24", confirmedOn: null }],""",
"""  [44, { verdict: "open", openedOn: "2026-05-28", confirmedOn: null }],
  [72, { verdict: "confirmed", openedOn: "2026-03-12", confirmedOn: "2026-04-02" }],
  [73, { verdict: "cleared", openedOn: "2026-03-14", confirmedOn: "2026-04-06" }],
  [74, { verdict: "confirmed", openedOn: "2026-03-16", confirmedOn: "2026-04-10" }],
  [75, { verdict: "cleared", openedOn: "2026-03-18", confirmedOn: "2026-04-14" }],
  [76, { verdict: "cleared", openedOn: "2026-03-20", confirmedOn: "2026-04-16" }],
  [77, { verdict: "open", openedOn: "2026-03-22", confirmedOn: null }],
  [78, { verdict: "open", openedOn: "2026-03-24", confirmedOn: null }],""")

# --- claim_number offset: 4400 -> 4399 (emit + probe)
rep("`RC-${4400 + c.id}`", "`RC-${4399 + c.id}`")
rep('"RC-" + (4400 + c.id)', '"RC-" + (4399 + c.id)')

# --- probe slices + pair ids + want text
rep("const ring = claims.slice(70, 77);", "const ring = claims.slice(71, 78);")
rep("const ringDbg = claims.slice(70, 77).map", "const ringDbg = claims.slice(71, 78).map")
rep("const isPair = [a.id, b.id].every((id) => [101, 102, 118, 119].includes(id));",
    "const isPair = [a.id, b.id].every((id) => [141, 142, 148, 149].includes(id));")
rep("(want 101-102:180s, 118-119:300s)", "(want 141-142:180s, 148-149:300s)")

open(p, "w").write(s)
print(f"patched OK ({len(n0)} -> {len(s)} bytes)")
