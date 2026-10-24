// LeetCode solution verifier — runs every deep-dive's Python solution
// against its verify cases with the real python3 interpreter.
// Run: bunx tsx scripts/lc-verify.ts
//
// Each problem gets a generated .py file (prelude + solution + driver that
// reads a cases JSON), executed once; results come back as JSON and are
// normalized (sortGroups/sortFlat) before comparison.
//
// The driver switch below is a 1:1 mirror of src/lib/leetcode/js-runner.ts —
// the in-app Blob worker is the source of truth; if you change a wrap there,
// change it here too (and vice versa).

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

def __build_random(pairs):
    nodes = [ListNode(p[0]) for p in pairs]
    for i, n in enumerate(nodes):
        n.next = nodes[i + 1] if i + 1 < len(nodes) else None
    for j, p in enumerate(pairs):
        nodes[j].random = nodes[p[1]] if p[1] is not None else None
    return nodes[0] if nodes else None

def __unrandom(head):
    order, cur = [], head
    while cur:
        order.append(cur)
        cur = cur.next
    idx = {id(n): i for i, n in enumerate(order)}
    return [[n.val, idx[id(n.random)] if n.random is not None else None] for n in order]

class __ChildNode:
    def __init__(self, val):
        self.val = val
        self.prev = None
        self.next = None
        self.child = None

def __build_child(seq):
    head = tail = prev = None
    for item in seq:
        if isinstance(item, list):
            if prev is not None:
                prev.child = __build_child(item)
        else:
            node = __ChildNode(item)
            node.prev = tail
            if tail is None:
                head = node
            else:
                tail.next = node
            tail = node
            prev = node
    return head
`;

/** Tree prelude: level-order builders matching js-runner toTree/unTree.
 *  Duck-typed so a solution returning its own TreeNode-like class still
 *  converts (JS has the same laxness via structural checks). */
const TREE_PRELUDE = `
class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def __btree(vals):
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
            w = vals[i]; i += 1
            if w is not None:
                node.right = TreeNode(w)
                q.append(node.right)
    return root

def __tree_level(root):
    out = []
    q = [root] if root else []
    while q:
        n = q.pop(0)
        if n is None:
            out.append(None)
            continue
        out.append(getattr(n, "val", None))
        q.append(getattr(n, "left", None))
        q.append(getattr(n, "right", None))
    while out and out[-1] is None:
        out.pop()
    return out

def __maybe_level(n):
    if n is not None and hasattr(n, "val") and hasattr(n, "left") and hasattr(n, "right"):
        return __tree_level(n)
    return n
`;

/** Driver body per wrap — reads `cases`, fills `results`. Mirrors
 *  js-runner.ts exactly (including undefined→null and ctor-op handling). */
function driver(d: LcDeepDive, voidOps: string[]): string {
  const fn = d.verify.fn;
  const f = `${fn}(*ARGS)`;
  switch (d.verify.wrap) {
    case "plain":
    case "matrix":
      return `results = []
for c in cases:
    ARGS = c["args"]
    results.append(${f})`;
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
      // fn returns the (possibly None) new head — an empty list must win
      // over the stale chain reference (mirrors js-runner.ts)
      return `results = []
for c in cases:
    h = __build(c["args"][0])
    results.append(__tolist(${fn}(h, c["args"][1])))`;
    case "listnodeInPlace":
      return `results = []
for c in cases:
    h = __build(c["args"][0])
    ${fn}(h)
    results.append(__tolist(h))`;
    case "listnodeArgs":
      return `results = []
for c in cases:
    ARGS = [__build(c["args"][0])] + list(c["args"][1:])
    results.append(__tolist(${f}))`;
    case "listnodeArray":
      return `results = []
for c in cases:
    ARGS = [__build(x) for x in c["args"][0]]
    results.append(__tolist(${f}))`;
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
    ARGS = [__btree(c["args"][0])] + list(c["args"][1:])
    results.append(__maybe_level(${f}))`;
    case "treeTwo":
      return `results = []
for c in cases:
    ARGS = [__btree(c["args"][0]), __btree(c["args"][1])] + list(c["args"][2:])
    results.append(__maybe_level(${f}))`;
    case "treeOut":
      return `results = []
for c in cases:
    ARGS = list(c["args"])
    results.append(__maybe_level(${f}))`;
    case "treeCodec":
      return `results = []
for c in cases:
    s = encode(__btree(c["args"][0]))
    if not isinstance(s, str):
        raise AssertionError("encode must return a string, got " + type(s).__name__)
    results.append(__maybe_level(decode(s)))`;
    case "codec":
      return `results = []
for c in cases:
    s = encode(*c["args"])
    if not isinstance(s, str):
        raise AssertionError("encode must return a string, got " + type(s).__name__)
    results.append(decode(s))`;
    case "inPlace":
      return `results = []
for c in cases:
    ${fn}(c["args"][0])
    results.append(c["args"][0])`;
    case "inPlaceArgs":
      return `results = []
for c in cases:
    ${fn}(*c["args"])
    results.append(c["args"][0])`;
    case "inPlaceK":
      return `results = []
for c in cases:
    k = ${fn}(c["args"][0])
    results.append([k, c["args"][0][:k]])`;
    case "inPlaceKArgs":
      return `results = []
for c in cases:
    k = ${fn}(*c["args"])
    results.append([k, c["args"][0][:k]])`;
    case "class": {
      const voidSet = JSON.stringify(voidOps);
      const ctorTree = d.verify.ctorBuild === "tree";
      return `results = []
for c in cases:
    ops = c["args"][0]
    start = 0
    ctor_args = []
    if ops and ops[0][0] == ${JSON.stringify(fn)}:
        ctor_args = ops[0][1:]
        start = 1
    ${ctorTree ? "ctor_args = [__btree(ctor_args[0])]" : ""}
    obj = ${fn}(*ctor_args[:2]) if ctor_args else ${fn}()
    case_results = []
    for op in ops[start:]:
        val = getattr(obj, op[0])(*op[1:])
        if op[0] not in ${voidSet}:
            case_results.append(None if val is None else val)
    results.append(case_results)`;
    }
  }
}

/** Non-void operation names for class-wrapped problems whose specs predate
 *  per-spec voidOps (the spec's own list always wins). */
const VOID_OPS: Record<string, string[]> = {
  MinStack: ["push", "pop"],
  TimeMap: ["set"],
};

function normalize(v: unknown, mode: string | undefined): unknown {
  const less = (a: unknown, b: unknown): number => {
    const x = a as string | number, y = b as string | number;
    return x < y ? -1 : x > y ? 1 : 0;
  };
  const byJson = (a: unknown, b: unknown): number => {
    const x = JSON.stringify(a), y = JSON.stringify(b);
    return x < y ? -1 : x > y ? 1 : 0;
  };
  if (mode === "sortGroups" && Array.isArray(v)) {
    return (v as unknown[][])
      .map((g) => [...(g as unknown[])].sort(less) as unknown)
      .sort(byJson) as unknown;
  }
  if (mode === "sortFlat" && Array.isArray(v)) {
    return [...(v as unknown[])].sort(less) as unknown;
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

    const prelude = d.verify.wrap.startsWith("listnode")
      ? LISTNODE + BUILDERS
      : d.verify.wrap.startsWith("tree") || (d.verify.wrap === "class" && d.verify.ctorBuild === "tree")
        ? TREE_PRELUDE
        : "";
    const voidOps = d.verify.voidOps ?? VOID_OPS[d.verify.fn] ?? [];
    const py = [
      "import json",
      prelude,
      d.code,
      `cases = json.load(open(${JSON.stringify(casesPath)}))`,
      driver(d, voidOps),
      "print(json.dumps(results))",
    ].join("\n");
    writeFileSync(pyPath, py);

    try {
      const stdout = execFileSync("python3", [pyPath], { encoding: "utf8", timeout: 30_000 });
      const results: unknown[] = JSON.parse(stdout.trim().split("\n").pop() ?? "[]");
      let allOk = results.length === d.verify.cases.length;
      for (let i = 0; i < d.verify.cases.length && allOk; i++) {
        const got = normalize(results[i], d.verify.normalize);
        // codec round-trips compare against the INPUT, like js-runner does
        const rawWant = d.verify.wrap === "codec" || d.verify.wrap === "treeCodec"
          ? d.verify.cases[i].args[0]
          : d.verify.cases[i].expect;
        const want = normalize(rawWant, d.verify.normalize);
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
