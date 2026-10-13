// Task 95-indrive — READ-ONLY probe for the 4 new cases. Deleted after use.
import { Database } from "bun:sqlite";
import { copyFileSync, rmSync } from "node:fs";
import type { CaseStudy } from "../../src/lib/curriculum/cases/types";

const COPY = "scripts/.probe-indrive.db";
copyFileSync("db/custom.db", COPY);
const db = new Database(COPY, { readonly: true });

function fill(template: string, values: Record<number, string>): string {
  return template.replace(/\{(\d+)\}/g, (_, n) => values[Number(n)] ?? `{${n}}`);
}
function normalizeCell(c: unknown): string {
  if (c === null) return "NULL";
  if (typeof c === "number") return String(c);
  if (c instanceof Uint8Array) return "<blob>";
  return String(c);
}
function canonRows(rows: unknown[][]): string {
  return JSON.stringify(rows.map((r) => r.map(normalizeCell)));
}
function runSql(sql: string): { ok: true; rows: unknown[][] } | { ok: false; error: string } {
  try {
    const res = db.query(sql).all() as Record<string, unknown>[];
    if (res.length === 0) return { ok: true, rows: [] };
    const cols = Object.keys(res[0]);
    return { ok: true, rows: res.map((r) => cols.map((c) => r[c])) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

const cases: CaseStudy[] = [
  {
    id: "cs-indrive-3",
    tier: "hard",
    topic: "t5",
    universe: "funnel",
    title: "The power-poster board",
    brief:
      "inDrive case on the storefront db (orders = posted offers, customers = riders): city ops is picking power-posters for a loyalty pilot and wants the rider board ranked by offers posted — RANK, with the tie policy visible, not hidden. Probed shape: offer counts run 24, 17, 14, 13, 5 at the top, then a FOUR-way tie at 4 posted offers (Pedro Alvarez, Keiko Sato, Isabella Rossi, Noah Meyer), then a pair at 3 (Farid Nasser, Hiro Tanaka). The board floor is 3 posted offers — the pair sits exactly on it, so the gate's value shows up in the result. Policy ask from the GM: shared rungs WITH gaps — after a four-way tie at rank 6, the next rung must land at rank 10 — and ties read alphabetically inside the rung.",
    ask: "Return qualifying riders with offer count and rank — shared rungs, gaps after ties, alphabetical inside a rung.",
    template:
      "SELECT c.name AS rider,\n       COUNT(*) AS offers_posted,\n       {1}() OVER (ORDER BY COUNT(*) DESC) AS rnk\nFROM orders o\nJOIN customers c ON c.id = o.customer_id\nGROUP BY c.id\nHAVING COUNT(*) >= {2}\nORDER BY rnk ASC, rider {3};",
    slots: [
      {
        answer: "RANK",
        kind: "keyword",
        label: "the tie policy",
        why: "The GM asked for shared rungs WITH gaps: RANK gives the four 4-offer riders rung 6 and lands the next pair at rung 10 — the gap makes the size of the tie visible. DENSE_RANK would compact those 3-offer riders to rung 7 and hide that four riders were leapfrogged; ROW_NUMBER would split the tie arbitrarily by scan order.",
      },
      {
        answer: "3",
        kind: "number",
        label: "the board floor",
        why: "The floor is 3 posted offers — the pair (Farid Nasser, Hiro Tanaka) sits exactly on it, so the gate value appears in the offers_posted column and the board self-checks. A floor of 4 deletes the rung-10 tail the tie story needs; 5 deletes the tie itself.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the within-rung order",
        why: "Inside a shared rung the board reads alphabetically: rider ASC makes the four-way tie deterministic (Isabella, Keiko, Noah, Pedro) on every run. DESC is also deterministic — but a different board each time someone 'fixes' it, so the direction is policy, stated in the header.",
      },
    ],
    distractors: ["DENSE_RANK", "ROW_NUMBER", "4", "5", "DESC"],
    walkthrough:
      "A leaderboard where the tie policy IS the deliverable. The join attaches each of the 103 posted offers to its rider, GROUP BY folds one row per rider, and RANK() OVER (ORDER BY COUNT(*) DESC) stamps shared rungs with gaps: Alice Chen 24 (rung 1), Emma Wilson 17 (2), Grace Kim 14 (3), Maya Patel 13 (4), Chloe Dubois 5 (5), then the four-way tie at 4 offers — Isabella Rossi, Keiko Sato, Noah Meyer, Pedro Alvarez all at rung 6 — then Farid Nasser and Hiro Tanaka at 3 offers, rung 10. That 6-to-10 jump is the whole read: RANK announces that four riders were leapfrogged, which DENSE_RANK (7) hides and ROW_NUMBER (7, 8) silently referees by scan order. The HAVING >= 3 floor is calibrated to the tie pair's own count, so the gate value appears in the offers_posted cells and the board self-checks; ORDER BY rnk ASC, rider ASC makes ties alphabetical and reproducible. The distractors encode the policy failures: DENSE_RANK compacts the tail to rung 7 and buries the gap; ROW_NUMBER hands the rung to whoever the engine read first; a floor of 4 deletes the rung-10 pair the story needs; 5 deletes the tie itself; and DESC alphabetizes every rung backwards — same numbers, different board, every run.",
  },
  {
    id: "cs-indrive-4",
    tier: "easy",
    topic: "s6",
    universe: "expense",
    title: "The launch-city cost stack",
    brief:
      "inDrive case on the storefront db (expenses = the city-ops cost ledger, amount_cents in INTEGER cents): the launch budget review wants the cost stack classified in ONE CASE pass — fixed (city-hub leases), demand-gen (rider acquisition) and run-rate (everything else) — with entry counts and dollars per class. Probed ledger: 36 expense entries; Rent runs 14 entries worth 16,800.00 and Ads 14 entries worth 4,570.00, while the ELSE arm sweeps Travel (3 / 2,521.00) plus Tools (5 / 1,525.00) into an 8-entry, 4,046.00 run-rate class. The review keeps classes fielding at least 8 entries — the run-rate class sits exactly on the boundary, so the gate's value appears in its own entry count and the census self-checks. Biggest spend on top.",
    ask: "Return one row per cost class: label, entry count, dollars (2dp) — biggest spend on top.",
    template:
      "SELECT CASE WHEN e.category = {1} THEN 'fixed'\n            WHEN e.category = {2} THEN 'demand-gen'\n            ELSE 'run-rate' END AS cost_class,\n       COUNT(*) AS entries,\n       ROUND(SUM(e.amount_cents) / 100.0, 2) AS spend\nFROM expenses e\nGROUP BY cost_class\nHAVING COUNT(*) >= {3}\nORDER BY spend {4};",
    slots: [
      {
        answer: "'Rent'",
        kind: "keyword",
        label: "the fixed-class literal",
        why: "Fixed means the city-hub leases: category = 'Rent' — 14 entries, 16,800.00, two-thirds of the ledger's spend. String comparison is case-sensitive here: 'rent' matches nothing and the fixed class silently vanishes into run-rate, inflating it to 21,370.00.",
      },
      {
        answer: "'Ads'",
        kind: "keyword",
        label: "the demand-gen literal",
        why: "Demand-gen is rider acquisition: category = 'Ads' — 14 entries, 4,570.00. Arm order matters: a row fires the FIRST matching arm, so 'Ads' must sit in its own arm above the ELSE catch-all or its 14 entries fold into run-rate and the review loses the acquisition line entirely.",
      },
      {
        answer: "8",
        kind: "number",
        label: "the review gate",
        why: "Classes fielding at least 8 entries make the review — and the run-rate class fields exactly 8 (Travel 3 + Tools 5), so the gate value appears in its own entries cell and the census self-checks. 9 would drop the boundary class; 7 changes nothing and reads as a typo; 15 empties the review.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-spend-first direction",
        why: "The budget review reads the biggest stack first: fixed (16,800.00) over demand-gen (4,570.00) over run-rate (4,046.00). ASC opens on run-rate and buries the rent story the meeting exists to have.",
      },
    ],
    distractors: ["'Travel'", "'fixed'", "9", "15", "ASC"],
    walkthrough:
      "One CASE, one scan, three classes — and the boundary row is the audit. The fold labels all 36 expense entries in place: Rent to fixed (14 entries, 16,800.00 — the city-hub stack), Ads to demand-gen (14, 4,570.00), and the ELSE catch-all sweeps Travel plus Tools into run-rate (8, 4,046.00). The cents rule rides the fold: SUM(amount_cents) stays in INTEGER cents exactly, and the /100.0 display-edge conversion prints dollars — the missing .0 is integer division and floors every odd-cent entry. HAVING COUNT(*) >= 8 keeps all three classes with the run-rate boundary row surviving at exactly 8, so the gate value is visible in the result; ORDER BY spend DESC reads fixed first. The distractors encode the budget-review failures: 'Travel' in the fixed arm relabels the 3-entry travel line as fixed and the hub leases fall to run-rate; 'fixed' in the demand-gen arm merges Ads into fixed — 28 entries, 21,370.00 — and the acquisition line the meeting tracks disappears; 9 drops the boundary class and the census no longer sums to 36; 15 empties the review entirely; ASC opens on run-rate. The audit identity: 14 + 14 + 8 = 36 entries — the classes reassemble the ledger or the fold is lying.",
  },
  {
    id: "cs-indrive-5",
    tier: "medium",
    topic: "j5",
    universe: "refund-audit",
    title: "Claims with no settlement rows",
    brief:
      "inDrive case on the storefront db (invoices = city billing claims, payments = driver settlement rows, amount_cents in INTEGER cents): the refund-audit desk wants the settlement queue — claims on the books with NO settlement row behind them, because the status column is a claim and the settlement rows are the ledger of record. Probed state: 28 claims on file, 22 carry at least one settlement row, 6 carry none — 15,217.00 outstanding across them — and one of the six (#28, 1,756.00) is marked paid with zero rows: the mirror of void-but-paid #11 (925.00), which HAS a row and therefore stays out of this queue. The desk clears the queue biggest-first, capped at the six claims this cycle can chase.",
    ask: "Return the queue: claim id, status, amount (2dp) — biggest claim first, capped at 6.",
    template:
      "SELECT i.id AS claim_id,\n       i.status,\n       ROUND(i.amount_cents / {1}, 2) AS claim_amount\nFROM invoices i\n{2} JOIN payments p ON p.invoice_id = {3}\nWHERE p.id {4}\nORDER BY claim_amount {5}\nLIMIT {6};",
    slots: [
      {
        answer: "100.0",
        kind: "keyword",
        label: "the cents divisor",
        why: "amount_cents is INTEGER cents: the display edge divides by 100.0 — the .0 forces real division. /1 leaves raw cents (claim 28 prints 175600), /10 shifts a decimal, and the conversion belongs once, at the edge — not inside any fold.",
      },
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the claim-side spine",
        why: "The claim is the spine: LEFT JOIN keeps all 28 claims and lets the 6 with zero settlement rows survive as NULL payment columns. INNER JOIN silently drops exactly those 6 — the queue would ship empty and the audit would miss its entire exceptions list.",
      },
      {
        answer: "i.id",
        kind: "keyword",
        label: "the claim-to-settlement key",
        why: "The FK is directional: p.invoice_id = i.id attaches each settlement row to ITS claim. p.invoice_id = p.id is a self-comparison that matches almost nothing — the join degenerates and the queue fills with unrelated claims wearing NULL amounts.",
      },
      {
        answer: "IS NULL",
        kind: "keyword",
        label: "the no-row guard",
        why: "Zero settlement rows read as NULL payment columns after the LEFT JOIN — the guard is p.id IS NULL. IS NOT NULL answers the mirror question (the 22 settled claims), and a bare '=' with NULL compares UNKNOWN and returns nothing at all.",
      },
      {
        answer: "DESC",
        kind: "keyword",
        label: "the biggest-first direction",
        why: "The desk chases money, biggest first: claim 24 at 4,937.00 leads and claim 18 at 873.00 closes the queue. ASC spends the cycle on the two smallest claims and the cap cuts the real exposure.",
      },
      {
        answer: "6",
        kind: "number",
        noVerify: true,
        label: "the cycle cap",
        why: "The team chases 6 claims this cycle — and the queue holds exactly 6 (ids 24, 26, 27, 28, 21, 18), so the cap is a workflow constant that happens to match the census. Flagged no-verify: it is a chase budget, not a probed figure; the 6-and-15,217.00 census itself is verified in the walkthrough.",
      },
    ],
    distractors: ["INNER", "IS NOT NULL", "1", "3", "=", "ASC"],
    walkthrough:
      "The anti-join is the honesty mechanism. All 28 claims ride the spine LEFT JOINed to their settlement rows; the guard WHERE p.id IS NULL keeps the 6 with zero rows — ids 24 (4,937.00), 26 (3,562.00), 27 (2,794.00), 28 (1,756.00), 21 (1,295.00), 18 (873.00) — 15,217.00 outstanding, ORDER BY claim_amount DESC, LIMIT 6 = the whole queue. The headline anomaly sits in plain sight: claim 28's status says paid but the settlement rows say never — a status that lies, which is why the queue reads rows, not statuses; and void-but-paid claim 11 (925.00) stays OUT of the queue precisely because it HAS a row — the two error modes are mirrors, and a queue built on either alone misses the other. The cents rule is the display edge: /100.0 after the fold, the .0 forcing real division. The distractors encode the audit-killing failures: INNER joins away all 6 exceptions and ships an empty queue; IS NOT NULL returns the 22 settled claims — the mirror census, plausible-looking and useless; /1 prints raw cents (175600 on claim 28); /3 divides by three; '=' with NULL compares UNKNOWN and returns nothing; ASC chases the smallest claims first and the cap truncates the exposure; LIMIT 1 ships one row as a queue. The reconciliation habit: 22 + 6 = 28 claims — the settled census plus the queue must reassemble the book before the memo goes out.",
  },
  {
    id: "cs-indrive-6",
    tier: "hard",
    topic: "t7",
    universe: "month-close",
    title: "The bar-to-bar pacing walk",
    brief:
      "inDrive case on the storefront db (orders = posted offers): month-close wants the pacing walk — fare volume per launch month WITH the move from the previous on-board month, built on LAG. Definition first, because a delta has a denominator too: the board carries only months clearing the eight-offer pacing bar, so the walk is bar-to-bar — 2024-05's move is measured against 2024-03, the previous on-board month, not against the quiet April the gate dropped. Probed walk: 2024-01 opens at 3,731.97 with a NULL baseline, 2024-02 slips -122.33, 2024-03 drops -992.56, 2024-05 lifts +293.23, 2024-07 falls -1,716.45 into the 1,193.86 trough, and 2024-09 rebounds +1,922.18 to 3,116.04 — the single biggest move on the board. Calendar order, oldest first.",
    ask: "Return each pacing month with offer count, fare volume (2dp) and the bar-to-bar move (2dp) — calendar order.",
    template:
      "SELECT STRFTIME('%Y-%m', o.created_at) AS launch_month,\n       COUNT(*) AS offers,\n       ROUND(SUM(o.total), 2) AS fare_volume,\n       ROUND(SUM(o.total) - LAG({3}) OVER (ORDER BY STRFTIME('%Y-%m', o.created_at)), 2) AS mom_delta\nFROM orders o\nGROUP BY launch_month\nHAVING COUNT(*) >= {1}\nORDER BY launch_month {2};",
    slots: [
      {
        answer: "8",
        kind: "number",
        label: "the pacing bar",
        why: "Eight posted offers is the bar a launch month must clear to stay on the board — six months make it and the bar's value appears in the offers cells (8, 9, 8, 8, 8, 9), so the gate self-checks. 7 admits five sub-bar months and re-chains every delta; 9 leaves only the two nine-offer months and the walk collapses to one move.",
      },
      {
        answer: "ASC",
        kind: "keyword",
        label: "the calendar direction",
        why: "A walk reads oldest-first: ASC opens on 2024-01's NULL baseline and every delta chases the month above it. DESC walks the story backwards — the rebound prints before the trough that caused it — and LAG quietly becomes LEAD's twin: 'next month' dressed as 'previous'.",
      },
      {
        answer: "SUM(o.total)",
        kind: "keyword",
        label: "the folded measure behind LAG",
        why: "LAG must lag the SAME fold the board prints: LAG(SUM(o.total)) over the grouped months. COUNT(*) would diff offer counts instead of dollars (the trough still shows but the fare story vanishes), and AVG(o.total) would diff per-offer averages — a real series wearing the wrong name.",
      },
    ],
    distractors: ["9", "7", "DESC", "COUNT(*)", "AVG(o.total)"],
    walkthrough:
      "A MoM walk where the population statement is the delta's denominator. GROUP BY folds the 103 offers onto the month spine; HAVING COUNT(*) >= 8 keeps the six pacing months; LAG(SUM(o.total)) OVER (ORDER BY launch_month) carries each on-board month's predecessor, and SUM minus LAG is the bar-to-bar move: 2024-01 NULL baseline (nothing precedes it — report NULL, never coalesce to zero), 2024-02 -122.33, 2024-03 -992.56, 2024-05 +293.23 against 2024-03 (April's 7 offers were gated off, so the walk skips it by definition — the brief said so), 2024-07 -1,716.45 into the 1,193.86 trough, 2024-09 +1,922.18 out of it — the biggest move on the board and the number the close leads with. The distractors encode the definition failures: a bar of 7 re-chains the walk through five sub-bar months and every delta changes; 9 reduces the board to one move; DESC walks the calendar backwards; LAG(COUNT(*)) diffs offer counts — a volume walk wearing the fare board's name; LAG(AVG(o.total)) diffs per-offer averages and calls it pacing. The habit: LAG is only as honest as the row list it walks — state which months are on the board, and the first row's NULL stays NULL.",
  },
];

let fail = 0;
for (const c of cases) {
  const n = c.slots.length;
  const correct = fill(c.template, Object.fromEntries(c.slots.map((s, i) => [i + 1, s.answer])));
  const res = runSql(correct);
  if (!res.ok) {
    console.log(`FAIL ${c.id}: correct fill errors: ${res.error}`);
    fail++;
    continue;
  }
  console.log(`\n== ${c.id} (${c.topic}/${c.tier}/${c.universe}) — ${res.rows.length} rows`);
  for (const r of res.rows) console.log("   ", r.map(normalizeCell).join(" | "));
  const cells = canonRows(res.rows);
  for (let i = 0; i < n; i++) {
    const s = c.slots[i];
    if (s.kind === "number" && !s.noVerify) {
      const hit = res.rows.some((row) => row.some((cell) => {
        const str = normalizeCell(cell);
        return str === s.answer.trim() || (!Number.isNaN(Number(s.answer)) && s.answer.trim() !== "" && Number(str) === Number(s.answer));
      }));
      console.log(`  slot ${i + 1} (${s.label}) number "${s.answer}" in cells: ${hit ? "OK" : "MISSING"}`);
      if (!hit) fail++;
    }
  }
  for (const d of c.distractors) {
    for (let i = 0; i < n; i++) {
      const values: Record<number, string> = {};
      for (let j = 0; j < n; j++) values[j + 1] = c.slots[j].answer;
      values[i + 1] = d;
      if (d === c.slots[i].answer) continue;
      const probe = fill(c.template, values);
      const pres = runSql(probe);
      if (!pres.ok) continue;
      if (canonRows(pres.rows) === cells) {
        console.log(`  AMBIGUOUS ${c.id}: "${d}" in slot ${i + 1} (${c.slots[i].label})`);
        fail++;
      }
    }
  }
}

// extra figures for prose
console.log("\n-- riders with completion vs all posters:");
console.log(db.query("SELECT COUNT(DISTINCT o.customer_id) AS with_completion FROM orders o WHERE o.status IN ('delivered','shipped')").get());
console.log(db.query("SELECT COUNT(DISTINCT customer_id) AS all_posters FROM orders").get());
console.log("-- invoice queue rows:");
console.log(db.query("SELECT i.id, i.status, i.amount_cents FROM invoices i LEFT JOIN payments p ON p.invoice_id=i.id WHERE p.id IS NULL ORDER BY i.amount_cents DESC").all());
console.log("-- expense classes:");
console.log(db.query("SELECT CASE WHEN category='Rent' THEN 'fixed' WHEN category='Ads' THEN 'demand-gen' ELSE 'run-rate' END k, COUNT(*) n, ROUND(SUM(amount_cents)/100.0,2) s FROM expenses GROUP BY k ORDER BY s DESC").all());

db.close();
rmSync(COPY, { force: true });
console.log(fail === 0 ? "\nPROBE ALL PASS" : `\nPROBE FAILURES: ${fail}`);
process.exit(fail === 0 ? 0 : 1);
