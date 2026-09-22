(() => {
  const qa = (s) => document.querySelectorAll(s).length;
  return JSON.stringify({
    tilesAnim: qa('[data-seeq-tile^="state-"]'),
    tilesShape: qa('[data-seeq-tile^="shape-"]'),
    tilesExpr: qa('[data-seeq-tile^="expr-"]'),
    tilesColour: qa('[data-seeq-tile^="colour-"]'),
    toolRows: qa('button[aria-current]'),
    navRows: qa('aside button'),
  });
})()
