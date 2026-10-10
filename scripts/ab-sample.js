const g=(el,p)=>el?getComputedStyle(el)[p]:null;
const nav=[...document.querySelectorAll('a')].find(e=>e.textContent.trim()==='Home');
const pill=nav.closest('a,div,li');
const inactive=[...document.querySelectorAll('a')].find(e=>e.textContent.trim()==='About');
const card=[...document.querySelectorAll('div')].find(e=>String(e.className).includes('rounded-xl border')||String(e.className).includes('rounded-lg border'));
const label=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()==='COMMUNITY')[0];
const check=[...document.querySelectorAll('svg')].filter(e=>e.getAttribute('class')&&e.getAttribute('class').includes('text-green'))[0];
const side=pill.closest('aside')||document.querySelector('aside,nav');
JSON.stringify({
 pillBg:g(pill,'backgroundColor'), pillRadius:g(pill,'borderRadius'),
 navFs:g(nav,'fontSize'), inactiveColor:g(inactive,'color'),
 cardBg:g(card,'backgroundColor'), cardBorder:g(card,'borderColor'), cardRadius:g(card,'borderRadius'),
 labelColor:g(label,'color'), labelFs:g(label,'fontSize'), labelLs:g(label,'letterSpacing'),
 sideBg:g(side,'backgroundColor'), sideBorder:g(side,'borderRightColor'),
 navColor:g(nav,'color'), bodyFs:g(document.body,'fontSize')
})
