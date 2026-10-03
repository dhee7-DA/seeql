// LeetCode solution verifier — runs every deep-dive's Python solution
// against its verify cases with the real python3 interpreter.
// Run: bunx tsx scripts/lc-verify.ts
//
// Each problem gets a generated .py file (prelude + solution + driver that
// reads a cases JSON), executed once; results come back as JSON and are
// normalized (sortGroups/sortFlat) before comparison.

import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { LC_CONTENT } from "../src/lib/leetcode/content/content";
import type { LcDeepDive } from "../src/lib/leetcode/types";

const TMP = "/home/z/my-project/.lc-verify";

/** Python prelude: ListNode for linked-list wraps. */
const LISTNODE = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
`;

/** Builders used by the listnode* drivers. */
const BUILDERS = `
def __build(vals):
    head = None
    for v in reversed(vals):
        head = ListNode(v, head)
    return head

def __build_cycle(vals, pos):
    nodes = [ListNode(v) for v in vals]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    head = nodes[0] if nodes else None
    if pos >= 0 and nodes:
        nodes[-1].next = nodes[pos]
    return head

def __tolist(node):
    out = []
    while node:
        out.append(node.val)
        node = node.next
    return out
`;

/** Driver body per wrap — reads `cases`, fills `results`. */
function driver(d: LcDeepDive, voidOps: string[]): string {
  const fn = d.verify.fn;
  switch (d.verify.wrap) {
    case "plain":
    case "matrix":
      return `results = []
for c in cases:
    results.append(${fn}(*c["args"]))`;
    case "listnode":
      return `results = []
for c in cases:
    results.append(__tolist(${fn}(__build(c["args"][0]))))`;
    case "listnodeTwo":
      return `results = []
for c in cases:
    results.append(__tolist(${fn}(__build(c["args"][0]), __build(c["args"][1]))))`;
    case "listnodeCycle":
      return `results = []
for c in cases:
    results.append(bool(${fn}(__build_cycle(c["args"][0], c["args"][1]))))`;
    case "listnodeIdx":
      return `results = []
for c in cases:
    results.append(__tolist(${fn}(__build(c["args"][0]), c["args"][1])))`;
    case "listnodeInPlace":
      return `results = []
for c in cases:
    h = __build(c["args"][0])
    ${fn}(h)
    results.append(__tolist(h))`;
    case "codec":
      return `results = []
for c in cases:
    results.append(decode(encode(c["args"][0])))`;
    case "class": {
      const voidSet = JSON.stringify(voidOps);
      return `results = []
for c in cases:
    obj = ${fn}()
    case_results = []
    for op in c["args"][0]:
        name, rest = op[0], op[1:]
        val = getattr(obj, name)(*rest)
        if name not in ${voidSet}:
            case_results.append(val)
    results.append(case_results)`;
    }
  }
}

/** Non-void operation names for class-wrapped problems. */
const VOID_OPS: Record<string, string[]> = {
  MinStack: ["push", "pop"],
  TimeMap: ["set"],
};

function normalize(v: unknown, mode: string | undefined): unknown {
  if (mode === "sortGroups" && Array.isArray(v)) {
    return (v as unknown[][]).map((g) => [...(g as unknown[])].sort()).sort() as unknown;
  }
  if (mode === "sortFlat" && Array.isArray(v)) {
    return [...v].sort() as unknown;
  }
  return v;
}

function eq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function main(): void {
  rmSync(TMP, { recursive: true, force: true });
  mkdirSync(TMP, { recursive: true });

  let pass = 0;
  const failures: string[] = [];

  for (const d of LC_CONTENT) {
    const cases = d.verify.cases.map((c) => ({ args: c.args }));
    const casesPath = join(TMP, `${d.slug}.cases.json`);
    const pyPath = join(TMP, `${d.slug}.py`);
    writeFileSync(casesPath, JSON.stringify(cases));

    const prelude = d.verify.wrap.startsWith("listnode") ? LISTNODE + BUILDERS : "";
    const py = [
      "import json",
      prelude,
      d.code,
      `cases = json.load(open(${JSON.stringify(casesPath)}))`,
      driver(d, VOID_OPS[d.verify.fn] ?? []),
      'print(json.dumps(results))',
    ].join("\n");
    writeFileSync(pyPath, py);

    try {
      const stdout = execFileSync("python3", [pyPath], { encoding: "utf8", timeout: 30_000 });
      const results: unknown[] = JSON.parse(stdout.trim().split("\n").pop() ?? "[]");
      let allOk = results.length === d.verify.cases.length;
      for (let i = 0; i < d.verify.cases.length && allOk; i++) {
        const got = normalize(results[i], d.verify.normalize);
        const want = normalize(d.verify.cases[i].expect, d.verify.normalize);
        if (!eq(got, want)) {
          allOk = false;
          failures.push(
            `${d.slug} case ${i + 1}: got ${JSON.stringify(got)} · want ${JSON.stringify(want)}`,
          );
        }
      }
      if (allOk) pass++;
      else console.error(`FAIL ${d.slug}`);
    } catch (err) {
      failures.push(`${d.slug}: python error — ${(err as Error).message.split("\n").slice(-4).join("\n")}`);
      console.error(`ERR  ${d.slug}`);
    }
  }

  console.log(`\nlc-verify: ${pass}/${LC_CONTENT.length} problems verified, ${failures.length} failing`);
  for (const f of failures) console.error("  - " + f);
  if (failures.length) process.exit(1);
}

main();
