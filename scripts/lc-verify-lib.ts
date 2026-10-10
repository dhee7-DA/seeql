// Shared engine for the LeetCode solution verifier (scripts/lc-verify.ts and
// scripts/lc-verify-file.ts). Runs each deep-dive's Python solution against
// its verify cases with the real python3 interpreter.
//
// The wrap vocabulary mirrors src/lib/leetcode/js-runner.ts — keep the two
// in sync (js-runner is the in-app JS harness, this is the offline Python one).

import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { LcDeepDive } from "../src/lib/leetcode/types";

/** Python prelude: ListNode for linked-list wraps. */
export const LISTNODE = `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
`;

/** Builders used by the listnode* drivers. */
export const BUILDERS = `
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

def __build_random(spec):
    nodes = [ListNode(v) for v, _ in spec]
    for i, (_, r) in enumerate(spec):
        if r is not None:
            nodes[i].random = nodes[r]
        if i:
            nodes[i - 1].next = nodes[i]
    return nodes[0] if nodes else None

def __unrandom(head):
    index = {}
    order = []
    cur = head
    while cur:
        index[id(cur)] = len(order)
        order.append(cur)
        cur = cur.next
    return [[n.val, index[id(n.random)] if n.random is not None else None] for n in order]

def __build_child(seq):
    head = None
    tail = None
    prev = None
    for item in seq:
        if isinstance(item, list):
            if prev is not None:
                prev.child = __build_child(item)
        else:
            node = ListNode(item)
            node.prev = tail
            if tail is None:
                head = node
            else:
                tail.next = node
            tail = node
            prev = node
    return head
`;

/** Tree prelude: TreeNode + level-order build/serialize (LeetCode style). */
export const TREE = `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def __tree(vals):
    if not vals:
        return None
    root = TreeNode(vals[0])
    q = [root]
    i = 1
    while q and i < len(vals):
        node = q.pop(0)
        if i < len(vals):
            v = vals[i]; i += 1
            if v is not None:
                node.left = TreeNode(v)
                q.append(node.left)
        if i < len(vals):
            v = vals[i]; i += 1
            if v is not None:
                node.right = TreeNode(v)
                q.append(node.right)
    return root

def __untree(root):
    out = []
    q = [root] if root else []
    while q:
        n = q.pop(0)
        if n is None:
            out.append(None)
        else:
            out.append(n.val)
            q.append(n.left)
            q.append(n.right)
    while out and out[-1] is None:
        out.pop()
    return out

def __maybe_tree(n):
    return __untree(n) if isinstance(n, TreeNode) else n
`;

/** Driver body per wrap — reads `cases`, fills `results`. */
export function driver(d: LcDeepDive): string {
  const fn = d.verify.fn;
  switch (d.verify.wrap) {
    case "plain":
    case "matrix":
      return `results = []
for c in cases:
    results.append(${fn}(*c["args"]))`;
    case "inPlace":
      return `results = []
for c in cases:
    ${fn}(c["args"][0])
    results.append(c["args"][0])`;
    case "inPlaceArgs":
      return `results = []
for c in cases:
    ${fn}(c["args"][0], *c["args"][1:])
    results.append(c["args"][0])`;
    case "inPlaceK":
      return `results = []
for c in cases:
    k = ${fn}(c["args"][0])
    results.append([k, c["args"][0][:k]])`;
    case "inPlaceKArgs":
      return `results = []
for c in cases:
    k = ${fn}(c["args"][0], *c["args"][1:])
    results.append([k, c["args"][0][:k]])`;
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
    case "listnodeArgs":
      return `results = []
for c in cases:
    results.append(__tolist(${fn}(__build(c["args"][0]), *c["args"][1:])))`;
    case "listnodeArray":
      return `results = []
for c in cases:
    chains = [__build(a) for a in c["args"][0]]
    results.append(__tolist(${fn}(*chains)))`;
    case "listnodeInPlace":
      return `results = []
for c in cases:
    h = __build(c["args"][0])
    ${fn}(h)
    results.append(__tolist(h))`;
    case "listnodeRandom":
      return `results = []
for c in cases:
    results.append(__unrandom(${fn}(__build_random(c["args"][0]))))`;
    case "listnodeChild":
      return `results = []
for c in cases:
    results.append(__tolist(${fn}(__build_child(c["args"][0]))))`;
    case "tree":
      return `results = []
for c in cases:
    results.append(__maybe_tree(${fn}(__tree(c["args"][0]), *c["args"][1:])))`;
    case "treeTwo":
      return `results = []
for c in cases:
    results.append(__maybe_tree(${fn}(__tree(c["args"][0]), __tree(c["args"][1]), *c["args"][2:])))`;
    case "treeOut":
      return `results = []
for c in cases:
    results.append(__maybe_tree(${fn}(*c["args"])))`;
    case "treeCodec":
      return `results = []
for c in cases:
    results.append(__maybe_tree(decode(encode(__tree(c["args"][0])))))`;
    case "codec":
      return `results = []
for c in cases:
    results.append(decode(encode(c["args"][0])))`;
    case "class": {
      const voidOps = JSON.stringify(d.verify.voidOps ?? []);
      const ctorArgs =
        d.verify.ctorBuild === "tree" ? "[__tree(ctor_args[0])]" : "ctor_args";
      return `results = []
for c in cases:
    ops = c["args"][0]
    if ops and ops[0][0] == ${JSON.stringify(fn)}:
        ctor_args = ops[0][1:]
        obj = ${fn}(*${ctorArgs})
        ops = ops[1:]
    else:
        obj = ${fn}()
    case_results = []
    for op in ops:
        val = getattr(obj, op[0])(*op[1:])
        if op[0] not in ${voidOps}:
            case_results.append(val)
    results.append(case_results)`;
    }
  }
}

export function normalize(v: unknown, mode: string | undefined): unknown {
  if (mode === "sortGroups" && Array.isArray(v)) {
    return (v as unknown[][]).map((g) => [...(g as unknown[])].sort()).sort() as unknown;
  }
  if (mode === "sortFlat" && Array.isArray(v)) {
    return [...v].sort() as unknown;
  }
  return v;
}

export function eq(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function needsPrelude(d: LcDeepDive): string {
  const w = d.verify.wrap;
  let pre = "";
  if (w.startsWith("listnode")) pre += LISTNODE + BUILDERS;
  if (w.startsWith("tree") || d.verify.ctorBuild === "tree") pre += TREE;
  return pre;
}

export interface VerifyReport {
  pass: number;
  total: number;
  failures: string[];
}

/** Verify a batch of dives. Uses a private mkdtemp dir so concurrent runs
 *  (parallel authoring agents) never collide. */
export function verifyDives(dives: LcDeepDive[], label = "lc-verify"): VerifyReport {
  const tmp = mkdtempSync(join(tmpdir(), "lc-verify-"));
  let pass = 0;
  const failures: string[] = [];
  try {
    for (const d of dives) {
      const cases = d.verify.cases.map((c) => ({ args: c.args }));
      const casesPath = join(tmp, `${d.slug}.cases.json`);
      const pyPath = join(tmp, `${d.slug}.py`);
      writeFileSync(casesPath, JSON.stringify(cases));

      const py = [
        "import json",
        needsPrelude(d),
        d.code,
        `cases = json.load(open(${JSON.stringify(casesPath)}))`,
        driver(d),
        "print(json.dumps(results))",
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
        const msg = (err as Error).message.split("\n").slice(-4).join("\n");
        failures.push(`${d.slug}: python error — ${msg}`);
        console.error(`ERR  ${d.slug}`);
      }
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  console.log(`\n${label}: ${pass}/${dives.length} problems verified, ${failures.length} failing`);
  for (const f of failures) console.error("  - " + f);
  return { pass, total: dives.length, failures };
}
