// Browser-side overflow audit: measure every <text> in the lesson's deep-dive
// figures against the 720x300 viewBox.
(() => {
  const out = [];
  for (const svg of [...document.querySelectorAll("main svg")]) {
    const vb = svg.viewBox.baseVal;
    if (!vb || vb.width !== 720) continue; // only curriculum figures
    const bad = [];
    for (const t of svg.querySelectorAll("text")) {
      const b = t.getBBox();
      if (b.x + b.width > 716 || b.y + b.height > 298.5 || b.x < 2) {
        bad.push({ txt: t.textContent.slice(0, 48), right: Math.round(b.x + b.width), bottom: Math.round(b.y + b.height) });
      }
    }
    if (bad.length) out.push({ fig: svg.getAttribute("aria-label")?.slice(0, 40), bad });
  }
  return JSON.stringify(out.length ? out : "ALL CLEAN");
})()
