// QA sweep: runs in the browser via agent-browser eval.
// Checks (per current page):
//  1. horizontal page overflow
//  2. SVG text clipped outside its viewBox (out-of-bounds)
//  3. overlapping SVG text labels (pairwise bbox intersection)
//  4. non-scrollable DOM elements whose content overflows (clipping bugs)
// Returns compact JSON.

(() => {
  const out = {
    path: location.href.slice(-30),
    vw: window.innerWidth,
    hOverflowPx: 0,
    svgCount: 0,
    oob: [],
    overlaps: 0,
    overlapSamples: [],
    wide: [],
  };
  const doc = document.documentElement;
  out.hOverflowPx = Math.max(0, doc.scrollWidth - window.innerWidth);

  const TOL = 3;
  document.querySelectorAll("svg").forEach((svg) => {
    const vb = svg.viewBox && svg.viewBox.baseVal;
    if (!vb || !vb.width) return;
    out.svgCount++;
    const sm = svg.getCTM();
    if (!sm) return;
    const inv = sm.inverse();
    const boxes = [];
    svg.querySelectorAll("text").forEach((t) => {
      let b;
      try {
        b = t.getBBox();
      } catch {
        return;
      }
      if (!b.width && !b.height) return;
      const m = t.getCTM();
      if (!m) return;
      const pts = [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x, b.y + b.height],
        [b.x + b.width, b.y + b.height],
      ];
      let minX = 1e9,
        minY = 1e9,
        maxX = -1e9,
        maxY = -1e9;
      for (const [x, y] of pts) {
        const d = new DOMPoint(x, y).matrixTransform(m);
        const q = new DOMPoint(d.x, d.y).matrixTransform(inv);
        if (Number.isNaN(q.x) || Number.isNaN(q.y)) return;
        minX = Math.min(minX, q.x);
        maxX = Math.max(maxX, q.x);
        minY = Math.min(minY, q.y);
        maxY = Math.max(maxY, q.y);
      }
      if (minX < -TOL || minY < -TOL || maxX > vb.width + TOL || maxY > vb.height + TOL) {
        out.oob.push({
          text: (t.textContent || "").slice(0, 36),
          box: [Math.round(minX), Math.round(minY), Math.round(maxX), Math.round(maxY)],
          vb: [Math.round(vb.width), Math.round(vb.height)],
        });
      }
      boxes.push({ minX, minY, maxX, maxY, txt: (t.textContent || "").slice(0, 26) });
    });
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i],
          b = boxes[j];
        const ox = Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX) - 4;
        const oy = Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY) - 4;
        if (ox > 2 && oy > 2) {
          out.overlaps++;
          if (out.overlapSamples.length < 5)
            out.overlapSamples.push({ a: a.txt, b: b.txt });
        }
      }
  });

  document.querySelectorAll("main div, main pre, main code, main p, main span").forEach((el) => {
    if (el.getAttribute("aria-hidden") === "true") return; // decorative (pulse halos etc.)
    if (el.closest('[aria-hidden="true"]')) return; // inside a decorative wrapper
    const cs = getComputedStyle(el);
    if (cs.overflowX === "auto" || cs.overflowX === "scroll" || cs.overflowX === "hidden") return;
    if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 2) {
      if (out.wide.length < 5)
        out.wide.push({
          tag: el.tagName,
          cls: (el.className + "").slice(0, 36),
          sw: el.scrollWidth,
          cw: el.clientWidth,
          txt: (el.textContent || "").slice(0, 28),
        });
    }
  });

  // trim oob noise
  if (out.oob.length > 6) out.oob = out.oob.slice(0, 6).concat([{ note: `+${out.oob.length - 6} more` }]);
  return JSON.stringify(out);
})()
