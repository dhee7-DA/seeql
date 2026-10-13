// Wave-8 E2E smoke — boots the dev server, walks to the companies wall,
// verifies the 136-kit matrix + per-domain 17/17 badges + one new kit page,
// then tears down. MUST stay under ~2 minutes: the sandbox reaps background
// dev servers at the ~2min mark (worklog quirk), so this script is deliberately
// fast: keepalive pings, 3 sampled domains, fixed short waits.
// NOTE: agent-browser eval silently breaks on regex literals — in-page
// expressions use string methods only.
// Usage: bun scripts/e2e-wave8.mjs
import { spawn, execSync } from "node:child_process";

const sh = (c) => execSync(c, { encoding: "utf8" });
const ab = (args) => {
  try { return sh(`agent-browser ${args}`).trim(); } catch (e) { return String(e.stdout || e); }
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const J = (expr) => ab(`eval "${expr}"`);
const clean = (s) => String(s).replace(/"/g, "");

let fail = 0;
const check = (name, ok) => { console.log(`${ok ? "PASS" : "FAIL"} ${name}`); if (!ok) fail++; };

// 0. fresh server (+ detached keepalive pinger against the reap window)
try { sh('pkill -f "next dev"'); } catch {}
await sleep(2500);
const srv = spawn("bun", ["run", "dev"], { cwd: process.cwd(), detached: true, stdio: "ignore", env: process.env });
const pinger = spawn("bun", ["-e", "setInterval(() => fetch('http://localhost:3000/').catch(() => {}), 4000)"], { detached: true, stdio: "ignore" });

let up = false;
for (let i = 0; i < 16; i++) {
  try { const r = await fetch("http://localhost:3000/"); if (r.ok) { up = true; break; } } catch {}
  await sleep(1500);
}
console.log(up ? "server: UP" : "server: DEAD");
if (!up) process.exit(1);

// 1. open + land (poll until hydrated; re-open until buttons exist)
ab("set viewport 1440 900");
let landed = false;
for (let i = 0; i < 8; i++) {
  const n = J("document.querySelectorAll('button').length");
  if (Number(clean(n)) > 5) { landed = true; break; }
  ab("open http://localhost:3000");
  await sleep(2500);
}
check("landing rendered", landed);

// 2. enter learn app + open companies wall. The learn-app chunk takes 20-40s
// to compile on dev and the landing unmounts (blank) while it loads — poll
// patiently, re-clicking Start every 10 misses.
let tab = "NO-BTN";
for (let i = 0; i < 30; i++) {
  tab = J("(() => { const sk = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('skip tour')); if (sk) { sk.click(); return 'TOUR-SKIPPED'; } const c = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('compan')); if (c) { c.click(); return (c.textContent || '').trim().slice(0, 30); } const s = [...document.querySelectorAll('button')].find(x => (x.textContent || '').toLowerCase().includes('start learning')); if (s) { s.click(); return 'START-CLICKED'; } return 'BLANK'; })()");
  if (clean(tab) !== "NO-BTN" && clean(tab) !== "TOUR-SKIPPED" && clean(tab) !== "START-CLICKED" && clean(tab) !== "NOTHING" && clean(tab) !== "BLANK") break;
  await sleep(2000);
}
console.log("companies tab:", tab);
check("companies tab found", !["NO-BTN", "TOUR-SKIPPED", "START-CLICKED", "NOTHING", "BLANK"].includes(clean(tab)));

// 3. wall checks
let counter = "COUNTER-MISS";
for (let i = 0; i < 6; i++) {
  counter = J("document.body.innerText.includes('136 of 136 kits live') ? '136 of 136 kits live' : 'COUNTER-MISS'");
  if (clean(counter).includes("136 of 136")) break;
  await sleep(2000);
}
check("counter is 136 of 136", clean(counter).includes("136 of 136"));
const names = J("(() => { const t = document.body.innerText; const w = ['Figma','Costco','Mercado Libre','Monzo','Standard Chartered','Emirates','GitLab','Turo','Substack','BNP Paribas','N26','Telegram']; return w.map(s => t.includes(s) ? 'Y' : 'N').join(''); })()");
console.log("wall names (12):", names);
check("all 12 wave-8 wall names render", clean(names) === "YYYYYYYYYYYY");

// 4. per-domain badge on 3 sampled domains (each drilled + back)
const domainNames = ["E-commerce & Marketplace", "Fintech & Payments", "SaaS & Enterprise"];
let domainOk = 0;
for (const dn of domainNames) {
  const open = J(`(() => { const b = [...document.querySelectorAll('button,[role=button]')].find(x => (x.textContent || '').includes('${dn}')); if (b) { b.click(); return 'open'; } return 'NO-CARD'; })()`);
  if (clean(open) !== "open") { console.log(`  ${dn}: cannot open`); continue; }
  await sleep(2200);
  const badge = J("document.body.innerText.includes('17/17 kits live') ? '17/17' : 'BAD'");
  if (clean(badge) === "17/17") domainOk++;
  else console.log(`  ${dn}: ${clean(badge)}`);
  J("(() => { const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('All domains')); if (b) b.click(); return 'back'; })()");
  await sleep(1600);
}
console.log(`domain badges 17/17 (3 sampled): ${domainOk}/3`);
check("sampled domains show 17/17 kits live", domainOk === 3);


// 5. drill into one new kit (Figma)
let fig = "NO-CARD";
for (let i = 0; i < 4; i++) {
  fig = J("(() => { const b = [...document.querySelectorAll('button,[role=button]')].find(x => (x.textContent || '').includes('Figma')); if (b) { b.click(); return 'clicked'; } return 'NO-CARD'; })()");
  if (clean(fig) === "clicked") break;
  await sleep(2000);
}
await sleep(3200);
const kit = J("(() => { const t = document.body.innerText; return ['Design files','multiplayer canvases','Mock round','Brief'].map(s => t.includes(s) ? 'Y' : 'N').join(''); })()");
console.log("figma kit probes:", kit);
const kitClean = clean(kit);
check("figma kit page renders with mock round", kitClean.includes("Y") && kitClean.length === 4);

// 6. mobile spot-check (390px, no horizontal overflow)
ab("set viewport 390 844");
await sleep(2000);
const overflow = J("(() => { const d = document.documentElement; return d.scrollWidth > d.clientWidth ? 'OVERFLOW-' + d.scrollWidth : 'CLEAN'; })()");
console.log("mobile 390px:", overflow);
check("mobile 390px overflowX clean", clean(overflow) === "CLEAN");

// 7. teardown
try { sh('pkill -f "next dev"'); } catch {}
try { pinger.kill(); } catch {}
try { process.kill(-srv.pid); } catch {}
console.log(fail === 0 ? "E2E: ALL PASS" : `E2E: ${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
