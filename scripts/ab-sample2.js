(() => {
const gs=(el,p)=>el?getComputedStyle(el)[p]:null;
let el=[...document.querySelectorAll('a')].find(e=>e.textContent.trim()==='Home');
let pill=el; for(let i=0;i<5;i++){pill=pill.parentElement; if(gs(pill,'backgroundColor')!=='rgba(0, 0, 0, 0)') break;}
const price=[...document.querySelectorAll('div')].find(e=>e.textContent.startsWith('$49')&&e.querySelector('button'));
const label=[...document.querySelectorAll('*')].filter(e=>e.children.length===0&&e.textContent.trim()==='COMMUNITY')[0];
window.__AB={ pillTag:pill.tagName, pillBg:gs(pill,'backgroundColor'), pillRadius:gs(pill,'borderRadius'), pillPad:gs(pill,'padding'), pillH:pill.getBoundingClientRect().height,
 priceBg:gs(price,'backgroundColor'), priceBorder:gs(price,'borderColor'), priceRadius:gs(price,'borderRadius'),
 labelColor:label?gs(label,'color'):null, labelFs:label?gs(label,'fontSize'):null, labelLs:label?gs(label,'letterSpacing'):null };
return 'ok';
})()
