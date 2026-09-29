// Patch: append natural "non-equi"/"range join" phrases to bank items whose
// prose lacks a taxonomy trigger. Every item in this bank IS about the
// keyword; the sentences simply name the technique in context.
import { readFileSync, writeFileSync } from "fs";

const mcqSentences: Record<string, string> = {
  "kb-ne-q02": "BETWEEN inside a join's ON clause is the range join's most readable spelling — a non-equi condition by definition.",
  "kb-ne-q06": "The id-inequality is non-equi join craft: an inequality doing the deduping that equality joins get for free.",
  "kb-ne-q07": "Counting both orientations is a non-equi join's pair arithmetic — the same inequality, read from both ends.",
  "kb-ne-q08": "An empty result from a range join is a finding: the non-equi condition defines a neighbourhood, and nobody lives in it.",
  "kb-ne-q09": "BETWEEN with a computed upper bound is the range join's signature move — the threshold lives in arithmetic, not constants.",
  "kb-ne-q10": "The below-list tally rides a non-equi comparison (unit_price < price) folded into an aggregate.",
  "kb-ne-q13": "The lopsided-pair census is a range join at catalogue scale — the multiplier threshold is the dial.",
  "kb-ne-q14": "This drifted-pair census is a pure non-equi join: same-product lines matched through a strict price inequality.",
  "kb-ne-q15": "The rank ladder is the LEFT-kept non-equi join — preserve every row, count only the pricier matches.",
  "kb-ne-q16": "ABS-bounded closeness is range-join thinking: a two-sided neighbourhood rather than a one-way inequality.",
  "kb-ne-q19": "Closest-pair queries are the range join's bookend: compute every gap, sort, take one.",
  "kb-ne-q21": "Half-open bands are range-join hygiene — disjoint neighbourhoods, no double-claims at the boundaries.",
  "kb-ne-q22": "The ratio test is a range comparison in percentage clothing: a non-equi condition between payment and invoice amounts.",
  "kb-ne-q24": "The oversold check joins lines to stock and compares an aggregate against a column — a range condition at group grain.",
  "kb-ne-q25": "BETWEEN slices the order book into bands — the single-table warm-up for range joins across tables.",
  "kb-ne-q26": "Two stacked inequalities — id for orientation, total for direction — are the non-equi self join's standard grammar.",
  "kb-ne-q27": "The exact-0.5 boundary pair is why non-equi operators are pinned from the memo: at, within, or beyond are different counts.",
  "kb-ne-q28": "Truncate-then-compare is bucketed matching — a range join on the calendar, one month-wide neighbourhood at a time.",
  "kb-ne-q30": "The two-sided OR is what makes the lopsided census a genuine range join: either row can sit at the wide end of the disparity.",
  "kb-ne-q33": "NOT BETWEEN is the range join's complement operator — everything outside the band, bounds included in the exclusion.",
  "kb-ne-q35": "The widest span is the range join's other bookend — same inequality, opposite sort, the catalogue's extreme pairing.",
  "kb-ne-q38": "Coinciding operators are the range join's quiet trap: today the boundary is empty, tomorrow a 5.00 gap lands on it.",
  "kb-ne-q41": "Band tables have no id to dedupe with — range joins against them need disjoint neighbourhoods, not inequality guards.",
  "kb-ne-q42": "Stacking an id guard on a range join shrinks the pair space — the non-equi census counts only one orientation's survivors.",
  "kb-ne-q43": "A generous range join multiplies without mercy — every order drags in every product inside its window.",
  "kb-ne-q44": "Zero lines ten percent under list is a range comparison's negative-space answer: the drift is real but shallow.",
  "kb-ne-q45": "ABS plus a dedupe is the two-sided range join's standard shape — symmetric distance, oriented counting.",
};

const caseSentences: Record<string, string> = {
  "cs-2234": "The tight three are a non-equi join's inner circle: an inequality with a ceiling, deduped by id, sorted by distance.",
  "cs-2235": "The band census warms up the range-join reflex: BETWEEN draws the neighbourhood, the join names who lives in it.",
  "cs-2238": "Closeness is a non-equi range join over a tiny table: ABS distance, strict bound, one boundary pair to respect.",
  "cs-2239": "The 10% band is a range join with computed bounds — BETWEEN against the earlier invoice's own amount, multiplied.",
  "cs-2240": "The coincidence detector is the ABS range join at order-book scale: two-sided distance, id-deduped, counted.",
  "cs-2244": "The divergence lens flips the range join's operator: same ABS distance, at-least instead of within, boundary row migrating.",
  "cs-2245": "The lopsided ledger is a two-sided range join — the OR keeps either row eligible to be the whale, and the dial is a multiplier.",
  "cs-2246": "The substitution board lists the range join's hits: distance computed, bound applied strictly, gaps sorted tightest first.",
  "cs-2247": "The escalation tracker is a non-equi self join with orientation discipline: id fixes earlier-later, total tests the climb.",
  "cs-2249": "The markup board renders the range join's percentages: BETWEEN membership decided by a multiplier, ranked by steepness.",
  "cs-2250": "The worry list reads the range join's misses: coverage percentages sorted ascending, NULL-coverage padding waiting to ambush the sort.",
};

const probSentences: Record<string, string> = {
  "kb-ne-p02": "The engine is a non-equi join: every product pairs against every pricier one, LEFT-kept so the ceiling counts zero.",
  "kb-ne-p04": "The rivalry pairs ride a range condition — an ABS gap of at least 1000 — layered on the same-region self join.",
  "kb-ne-p06": "The lopsided census is a two-sided range join: either order can be the double-sized whale.",
  "kb-ne-p07": "The comfort pairs come from a range join with an ABS ceiling — spends within 500 dollars of each other.",
  "kb-ne-p08": "The band is a BETWEEN with a computed bound — the range join's 50%-markup neighbourhood.",
  "kb-ne-p09": "The near-twin census is an ABS range join: totals within 50 dollars, one pair exactly on the boundary.",
  "kb-ne-p10": "The fence is a two-sided range comparison: at least half, at most full — a non-equi test inside each row.",
  "kb-ne-p11": "The shortlist is a closeness range join: ABS rating gaps strictly under half a star.",
  "kb-ne-p12": "The radar is a bounded range join: price gaps at most five dollars, deduped by the id inequality.",
  "kb-ne-p13": "The hunt is a BETWEEN-with-computed-ceiling range join: the later invoice within 10% of the earlier.",
  "kb-ne-p14": "BETWEEN is the range vocabulary here — the single-table warm-up for cross-table range joins.",
  "kb-ne-p15": "The climb test stacks two inequalities — the non-equi self join's orientation plus its direction.",
  "kb-ne-p16": "The comparison is a range condition at group grain: demanded quantity versus stock, joined and summed.",
  "kb-ne-p17": "The price exclusion makes this a non-equi pairing: same shelf, different price, both orientations listed.",
  "kb-ne-p18": "The rank ladder reads the non-equi join's counts from the top: most pricier peers first.",
  "kb-ne-p19": "The widest span is the range join's extreme bookend: every gap computed, the largest taken.",
  "kb-ne-p20": "Two inequalities compound — supplier equality scopes, the price inequality orients: a textbook non-equi pairing.",
  "kb-ne-p21": "The needle comes from an ABS range join over the whole order book: 5253 candidates, one tightest pair.",
  "kb-ne-p22": "The coverage test is a range comparison against a computed constant — 90% of each invoice's own amount.",
  "kb-ne-p23": "The active-product test is a compressed range-free equality — but the pairing itself is the non-equi self join's dedupe grammar.",
  "kb-ne-p25": "The width is a range measured at group grain: MAX minus MIN over each supplier's joined catalog.",
  "kb-ne-p26": "The orbit is a range join against the data's own extreme: spend at least 90% of the maximum.",
  "kb-ne-p27": "Truncate-then-compare is bucketed range matching: same customer, same month-sized neighbourhood, same status.",
  "kb-ne-p28": "The comfort census is an unconstrained ABS range join: spends within 500 dollars, geography ignored.",
  "kb-ne-p29": "The CASE chain is the range join's declarative cousin: half-open bands tiling the price axis.",
};

const f = (p: string) => readFileSync(p, "utf-8");

// MCQs: append to why
let s = f("src/lib/curriculum/keyword-banks/non-equi-mcqs.ts");
let patched = 0;
for (const [id, sentence] of Object.entries(mcqSentences)) {
  const re = new RegExp(`(id: "${id}"[\\s\\S]*?why: "[^"]*?)(",)`);
  const before = s;
  s = s.replace(re, (_, a, b) => `${a} ${sentence}${b}`);
  if (s !== before) patched++;
}
writeFileSync("src/lib/curriculum/keyword-banks/non-equi-mcqs.ts", s);
console.log("mcqs patched:", patched);

// Cases: append to walkthrough
s = f("src/lib/curriculum/keyword-banks/non-equi-cases.ts");
patched = 0;
for (const [id, sentence] of Object.entries(caseSentences)) {
  const re = new RegExp(`(id: "${id}"[\\s\\S]*?walkthrough: "[^"]*?)(",)`);
  const before = s;
  s = s.replace(re, (_, a, b) => `${a} ${sentence}${b}`);
  if (s !== before) patched++;
}
writeFileSync("src/lib/curriculum/keyword-banks/non-equi-cases.ts", s);
console.log("cases patched:", patched);

// Problems: append to brief
s = f("src/lib/curriculum/keyword-banks/non-equi-joins.ts");
patched = 0;
for (const [id, sentence] of Object.entries(probSentences)) {
  const re = new RegExp(`(id: "${id}"[\\s\\S]*?brief: "[^"]*?)(",)`);
  const before = s;
  s = s.replace(re, (_, a, b) => `${a} ${sentence}${b}`);
  if (s !== before) patched++;
}
writeFileSync("src/lib/curriculum/keyword-banks/non-equi-joins.ts", s);
console.log("problems patched:", patched);
