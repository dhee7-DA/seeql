// The algorithm sandbox — runs user JavaScript against a problem's verify
// spec inside a Blob-backed Web Worker.
//
// Why a Blob worker: zero bundler coupling (no new Worker(new URL(...)) for
// Turbopack to chase), and a hard timeout is real — the main thread can
// terminate a worker mid-loop, which no main-thread trick can do. The worker
// has no DOM access; everything crossing the boundary is JSON-native, which
// is exactly what LcVerify cases already are ("JSON-native args").
//
// The harness speaks the SAME wrap/normalize vocabulary the deep dives were
// authored with (LcWrap / LcNormalize in types.ts): listnode chains, class
// op-sequences, codec round-trips, order-insensitive group outputs.

import type { LcVerify } from "./types";

export interface JsCaseResult {
  i: number;
  pass: boolean;
  got?: string;
  expected?: string;
  error?: string;
}

export interface JsRunOutcome {
  ok: boolean;
  passed: number;
  total: number;
  /** Harness-level failure (syntax error, timeout) — no per-case data. */
  error?: string;
  results: JsCaseResult[];
}

const TIMEOUT_MS = 3000;

/* The worker source. Deliberately NO template literals inside — this whole
 * blob is itself a template literal on the main thread. */
const WORKER_SRC = String.raw`
"use strict";

class ListNode {
  constructor(val, next) { this.val = val; this.next = next === undefined ? null : next; }
}

function toChain(values) {
  var head = new ListNode(values[0]);
  var cur = head;
  for (var i = 1; i < values.length; i++) { cur.next = new ListNode(values[i]); cur = cur.next; }
  return head;
}

function toChainCycle(values, pos) {
  if (!values || values.length === 0) return null;
  var head = toChain(values);
  if (pos >= 0) {
    var tail = head;
    while (tail.next) tail = tail.next;
    var join = head;
    for (var i = 0; i < pos; i++) join = join.next;
    tail.next = join;
  }
  return head;
}

function toArray(head) {
  var out = [], cur = head, guard = 0;
  while (cur && guard++ < 200000) { out.push(cur.val); cur = cur.next; }
  return out;
}

function toRandom(spec) {
  var nodes = [];
  for (var i = 0; i < spec.length; i++) nodes.push({ val: spec[i][0], next: null, random: null });
  for (var j = 0; j < nodes.length; j++) {
    if (spec[j][1] !== null && spec[j][1] !== undefined) nodes[j].random = nodes[spec[j][1]];
    if (j) nodes[j - 1].next = nodes[j];
  }
  return nodes.length ? nodes[0] : null;
}

function unRandom(head) {
  var map = new Map(), order = [], cur = head, i = 0;
  while (cur) { map.set(cur, i); order.push(cur); cur = cur.next; i++; }
  return order.map(function (n) { return [n.val, n.random ? map.get(n.random) : null]; });
}

function toChildChain(seq) {
  var head = null, tail = null, prev = null;
  for (var i = 0; i < seq.length; i++) {
    var item = seq[i];
    if (Array.isArray(item)) {
      if (prev) prev.child = toChildChain(item);
    } else {
      var node = { val: item, next: null, prev: tail || null, child: null };
      if (!tail) head = node; else tail.next = node;
      tail = node; prev = node;
    }
  }
  return head;
}

function toTree(vals) {
  if (!vals || !vals.length) return null;
  function N(v) { return { val: v, left: null, right: null }; }
  var root = N(vals[0]);
  var q = [root], i = 1;
  while (q.length && i < vals.length) {
    var node = q.shift();
    if (i < vals.length) { var v = vals[i++]; if (v !== null && v !== undefined) { node.left = N(v); q.push(node.left); } }
    if (i < vals.length) { var w = vals[i++]; if (w !== null && w !== undefined) { node.right = N(w); q.push(node.right); } }
  }
  return root;
}

function unTree(root) {
  var out = [], q = root ? [root] : [];
  while (q.length) {
    var n = q.shift();
    if (!n) { out.push(null); continue; }
    out.push(n.val); q.push(n.left); q.push(n.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}

function maybeTree(n) {
  return n && typeof n === "object" && "val" in n && "left" in n && "right" in n ? unTree(n) : n;
}

function deepEq(a, b) {
  if (a === b) return true;
  if (typeof a === "number" && typeof b === "number") return isNaN(a) && isNaN(b) ? true : a === b;
  if (a === null || b === null || a === undefined || b === undefined) return a === b;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (var i = 0; i < a.length; i++) if (!deepEq(a[i], b[i])) return false;
    return true;
  }
  if (typeof a === "object" && typeof b === "object") {
    var ka = Object.keys(a), kb = Object.keys(b);
    if (ka.length !== kb.length) return false;
    for (var j = 0; j < ka.length; j++) {
      if (!Object.prototype.hasOwnProperty.call(b, ka[j])) return false;
      if (!deepEq(a[ka[j]], b[ka[j]])) return false;
    }
    return true;
  }
  return false;
}

var less = function (x, y) { return x < y ? -1 : x > y ? 1 : 0; };

function normalizeBoth(out, expected, mode) {
  if (mode === "sortFlat") {
    return [[].concat(out).sort(less), [].concat(expected).sort(less)];
  }
  if (mode === "sortGroups") {
    var norm = function (groups) {
      return groups.map(function (g) { return [].concat(g).sort(less); })
        .sort(function (x, y) { return JSON.stringify(x) < JSON.stringify(y) ? -1 : 1; });
    };
    return [norm(out), norm(expected)];
  }
  return [out, expected];
}

function show(v) {
  try { return JSON.stringify(v); } catch (e) { return String(v); }
}

self.onmessage = function (event) {
  var spec = event.data; // { code, fn, wrap, normalize, cases }
  var results = [];

  var scope;
  try {
    var codecPart = spec.wrap === "codec"
      ? ", encode: (typeof encode === 'function' && encode !== self.encode) ? encode : (typeof encFn !== 'undefined' ? encFn : undefined)" +
        ", decode: (typeof decode === 'function' && decode !== self.decode) ? decode : (typeof decFn !== 'undefined' ? decFn : undefined)"
      : "";
    scope = new Function(
      '"use strict";' + spec.code +
      ";return { F: (typeof " + spec.fn + " !== 'undefined') ? " + spec.fn + " : undefined" + codecPart + " };"
    )();
  } catch (err) {
    self.postMessage({ ok: false, passed: 0, total: spec.cases.length, error: "Could not run your code — " + err.message, results: [] });
    return;
  }

  var userFn = scope.F;
  if (typeof userFn !== "function" && spec.wrap !== "codec") {
    self.postMessage({ ok: false, passed: 0, total: spec.cases.length, error: "Define a function named " + spec.fn + " (function " + spec.fn + "(...) { ... }).", results: [] });
    return;
  }
  if (spec.wrap === "codec" && (typeof scope.encode !== "function" || typeof scope.decode !== "function")) {
    self.postMessage({ ok: false, passed: 0, total: spec.cases.length, error: "Codec problems need both encode(strs) and decode(s) defined.", results: [] });
    return;
  }

  var passed = 0;
  for (var c = 0; c < spec.cases.length; c++) {
    var kase = spec.cases[c];
    var args = kase.args;
    var expected = kase.expect;
    var out;
    try {
      switch (spec.wrap) {
        case "listnode":
          out = toArray(userFn(toChain(args[0])));
          break;
        case "listnodeTwo":
          out = toArray(userFn(toChain(args[0]), toChain(args[1])));
          break;
        case "listnodeCycle":
          out = userFn(toChainCycle(args[0], args[1]));
          break;
        case "listnodeIdx":
        case "listnodeInPlace": {
          var chain = toChain(args[0]);
          var ret = spec.wrap === "listnodeIdx" ? userFn(chain, args[1]) : userFn(chain);
          out = toArray(ret instanceof ListNode ? ret : chain);
          break;
        }
        case "listnodeArgs": {
          var rest = args.slice(1);
          out = toArray(userFn.apply(null, [toChain(args[0])].concat(rest)));
          break;
        }
        case "listnodeArray": {
          var chains = [];
          for (var ai = 0; ai < args[0].length; ai++) chains.push(toChain(args[0][ai]));
          out = toArray(userFn.apply(null, chains));
          break;
        }
        case "listnodeRandom":
          out = unRandom(userFn(toRandom(args[0])));
          break;
        case "listnodeChild":
          out = toArray(userFn(toChildChain(args[0])));
          break;
        case "tree":
          out = maybeTree(userFn.apply(null, [toTree(args[0])].concat(args.slice(1))));
          break;
        case "treeTwo":
          out = maybeTree(userFn.apply(null, [toTree(args[0]), toTree(args[1])].concat(args.slice(2))));
          break;
        case "treeOut":
          out = maybeTree(userFn.apply(null, args));
          break;
        case "treeCodec": {
          var s2 = scope.encode.apply(null, [toTree(args[0])]);
          if (typeof s2 !== "string") throw new Error("encode must return a string, got " + typeof s2);
          out = maybeTree(scope.decode(s2));
          expected = args[0];
          break;
        }
        case "codec": {
          var s = scope.encode.apply(null, args);
          if (typeof s !== "string") throw new Error("encode must return a string, got " + typeof s);
          out = scope.decode(s);
          expected = args[0]; // round-trip: decode(encode(x)) deep-equals x
          break;
        }
        case "inPlace":
          userFn(args[0]);
          out = args[0];
          break;
        case "inPlaceArgs":
          userFn.apply(null, args);
          out = args[0];
          break;
        case "inPlaceK": {
          var k = userFn(args[0]);
          out = [k, args[0].slice(0, k)];
          break;
        }
        case "inPlaceKArgs": {
          var k2 = userFn.apply(null, args);
          out = [k2, args[0].slice(0, k2)];
          break;
        }
        case "class": {
          var ops = args[0];
          var start = 0;
          var ctorArgs = [];
          if (ops.length && ops[0][0] === spec.fn) { ctorArgs = ops[0].slice(1); start = 1; }
          if (spec.ctorBuild === "tree") ctorArgs = [toTree(ctorArgs[0])];
          var inst = new userFn(ctorArgs[0], ctorArgs[1]);
          var voids = spec.voidOps || [];
          out = [];
          for (var oi = start; oi < ops.length; oi++) {
            var op = ops[oi];
            var r = inst[op[0]].apply(inst, op.slice(1));
            if (voids.indexOf(op[0]) === -1) out.push(r === undefined ? null : r);
          }
          break;
        }
        default: // plain / matrix
          out = userFn.apply(null, args);
      }
    } catch (err) {
      results.push({ i: c, pass: false, error: "Case " + (c + 1) + " threw — " + (err && err.message ? err.message : String(err)) });
      continue;
    }

    var pair = normalizeBoth(out, expected, spec.normalize || "none");
    var ok = deepEq(pair[0], pair[1]);
    if (ok) { passed++; results.push({ i: c, pass: true }); }
    else {
      results.push({ i: c, pass: false, got: show(pair[0]), expected: show(pair[1]) });
    }
  }

  self.postMessage({ ok: passed === spec.cases.length, passed: passed, total: spec.cases.length, results: results });
};
`;

export function runJsSpec(code: string, verify: LcVerify): Promise<JsRunOutcome> {
  return new Promise((resolve) => {
    let worker: Worker | null = null;
    let url: string | null = null;
    const timer = setTimeout(() => {
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve({
        ok: false,
        passed: 0,
        total: verify.cases.length,
        error: `Time limit exceeded (${TIMEOUT_MS / 1000}s) — if your loop is unbounded, check the exit condition.`,
        results: [],
      });
    }, TIMEOUT_MS);

    const finish = (outcome: JsRunOutcome) => {
      clearTimeout(timer);
      worker?.terminate();
      if (url) URL.revokeObjectURL(url);
      resolve(outcome);
    };

    try {
      const blob = new Blob([WORKER_SRC], { type: "text/javascript" });
      url = URL.createObjectURL(blob);
      worker = new Worker(url);
      worker.onmessage = (e: MessageEvent<JsRunOutcome>) => finish(e.data);
      worker.onerror = (e) =>
        finish({
          ok: false,
          passed: 0,
          total: verify.cases.length,
          error: `Worker error — ${e.message || "your code crashed the sandbox"}`,
          results: [],
        });
      worker.postMessage({
        code,
        fn: verify.fn,
        wrap: verify.wrap,
        normalize: verify.normalize ?? "none",
        cases: verify.cases,
        voidOps: verify.voidOps ?? [],
        ctorBuild: verify.ctorBuild ?? null,
      });
    } catch (err) {
      finish({
        ok: false,
        passed: 0,
        total: verify.cases.length,
        error: `Could not start the sandbox — ${err instanceof Error ? err.message : String(err)}`,
        results: [],
      });
    }
  });
}
