// Probe: run the REAL js-runner worker source (the exact string shipped to
// the browser Blob worker) under bun with a shimmed `self`, against
// reference JS solutions for the wraps the 212 newly-wired dives use.
// If this passes, the in-app code lab will grade them correctly.

import { WORKER_SRC, type JsRunOutcome } from "../src/lib/leetcode/js-runner";
import {
  invertBinaryTree, serializeTree, kthLargest, copyRandom, flattenChild,
  dedupeK, bstIterator, encodeDecode, sameTree, lruCache,
} from "./lc-js-probe-solutions";

interface Dive { slug: string; verify: unknown }

async function main() {
  const { LC_CONTENT } = await import("../src/lib/leetcode/content/content");
  const bySlug = new Map(LC_CONTENT.map((d) => [d as Dive, (d as Dive).slug]));
  void bySlug;

  const solutions: Array<{ slug: string; code: string }> = [
    { slug: "invert-binary-tree", code: invertBinaryTree },
    { slug: "serialize-and-deserialize-binary-tree", code: serializeTree },
    { slug: "kth-largest-element-in-a-stream", code: kthLargest },
    { slug: "copy-list-with-random-pointer", code: copyRandom },
    { slug: "flatten-a-multilevel-doubly-linked-list", code: flattenChild },
    { slug: "remove-duplicates-from-sorted-array", code: dedupeK },
    { slug: "binary-search-tree-iterator", code: bstIterator },
    { slug: "encode-and-decode-strings", code: encodeDecode },
    { slug: "same-tree", code: sameTree },
    { slug: "lru-cache", code: lruCache },
  ];

  let pass = 0;
  for (const s of solutions) {
    const dive = LC_CONTENT.find((d) => d.slug === s.slug) as (Dive & { verify: { fn: string; wrap: string; normalize?: string; cases: Array<{ args: unknown[] }> } }) | undefined;
    if (!dive) { console.error(`MISSING dive ${s.slug}`); continue; }
    const outcome = await runRealHarness(s.code, dive.verify as unknown);
    const ok = outcome.ok;
    if (ok) pass++;
    console.log(`${ok ? "PASS" : "FAIL"} ${s.slug} (${dive.verify.wrap}) ${outcome.ok ? "" : outcome.error ?? JSON.stringify(outcome.results.filter((r) => !r.pass))}`);
  }
  console.log(`\njs-harness probe: ${pass}/${solutions.length} reference solutions green`);
  if (pass !== solutions.length) process.exit(1);
}

/** Evaluate the actual WORKER_SRC with a fake `self`, then push a spec
 *  through onmessage and capture postMessage. The worker's scope getter
 *  reads the GLOBAL `self` (browser reality), so plant it on globalThis. */
function runRealHarness(code: string, spec: unknown): Promise<JsRunOutcome> {
  return new Promise((resolve) => {
    const captured: unknown[] = [];
    const fakeSelf = {
      onmessage: null as ((e: { data: unknown }) => void) | null,
      postMessage: (m: unknown) => captured.push(m),
    };
    (globalThis as { self?: unknown }).self = fakeSelf;
    const fn = new Function("self", `"use strict";\n${WORKER_SRC}\n;`);
    fn(fakeSelf);
    if (!fakeSelf.onmessage) { resolve({ ok: false, passed: 0, total: 0, error: "harness did not register onmessage", results: [] }); return; }
    fakeSelf.onmessage({ data: { ...(spec as object), code } });
    resolve(captured[0] as JsRunOutcome);
  });
}

main();
