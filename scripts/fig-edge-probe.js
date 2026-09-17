(() => {
  const out = [];
  document.querySelectorAll("main section[data-fig]").forEach((sec) => {
    const id = sec.getAttribute("data-fig");
    sec.querySelectorAll("svg").forEach((svg, si) => {
      const vb = svg.viewBox.baseVal;
      const W = vb.width, H = vb.height;
      if (!W) return;
      svg.querySelectorAll("text").forEach((t) => {
        let b;
        try { b = t.getBBox(); } catch (e) { return; }
        if (!b || b.width === 0) return;
        const overR = b.x + b.width - (W - 2);
        const overL = 2 - b.x;
        const overB = b.y + b.height - (H + 2);
        if (overR > 0.5 || overL > 0.5 || overB > 0.5) {
          out.push({
            id, svg: si,
            text: (t.textContent || "").slice(0, 70),
            left: Math.round(b.x), right: Math.round(b.x + b.width), bottom: Math.round(b.y + b.height),
            W, H,
            overR: +overR.toFixed(1), overL: +overL.toFixed(1), overB: +overB.toFixed(1),
          });
        }
      });
    });
  });
  return JSON.stringify(out);
})()
