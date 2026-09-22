(() => {
  const q = (s) => document.querySelector(s);
  const qa = (s) => document.querySelectorAll(s).length;
  return JSON.stringify({
    seeqBuddy: qa('[data-seeq-bubble]') + 0 || !!q('[aria-label="Collapse SeeQ"], [aria-label="Open SeeQ study buddy"], [aria-label="SeeQ study buddy"]'),
    navSeeq: !!q('[data-seeq-nav="1"]'),
    miniBot: !!q('[data-seeq-nav="1"] svg'),
    burger: !!q('[aria-label="Open menu"], [aria-label="Close menu"]'),
    eyebrows: qa('p.flex.items-center.gap-3'),
    inkBtns: qa('.bg-foreground'),
    mono: getComputedStyle(document.body).fontFamily.includes('Chivo'),
    h1Weight: getComputedStyle(document.querySelector('h1')).fontWeight,
  });
})()
