#!/bin/bash
# Focused check: domain pages list 5 full-kit company cards each; Uber kit opens.
cd /home/z/my-project
agent-browser close --all 2>/dev/null || true
agent-browser set viewport 1440 900
agent-browser open "http://localhost:3000/#learn" >/dev/null
sleep 6
agent-browser eval "(() => { const b=[...document.querySelectorAll('button')].find(x=>/skip tour/i.test(x.textContent||'')); if(b) b.click(); return 'ok'; })()" >/dev/null

clickByDom () {  # $1 JS predicate body using variable 'e' over clickable elements
  agent-browser eval "(() => { const els=[...document.querySelectorAll('button,div[role=button]')]; const el=els.find($1); if(el){el.click(); return 'clicked:'+(el.textContent||'').replace(/\s+/g,' ').slice(0,45);} return 'NOT FOUND'; })()" | tr -d '\\'
}

clickByDom "e => /Company screens/i.test(e.textContent||'')" >/dev/null; sleep 1.5
clickByDom "e => /Ride-hailing & Mobility/.test(e.textContent||'') && !e.textContent.includes('Company')" >/dev/null; sleep 1.5
TXT=$(agent-browser eval "(() => { const cards=[...document.querySelectorAll('button,div[role=button]')].filter(e=>/full kit|in build/i.test(e.textContent||'')); return 'fullkit-cards='+cards.filter(c=>/full kit/i.test(c.textContent)).length+' inbuild='+cards.filter(c=>/in build/i.test(c.textContent)).length+' | '+cards.map(c=>(c.textContent||'').replace(/\s+/g,' ').slice(0,26)).join(' ;; '); })()" | tr -d '\\')
echo "MOBILITY DOMAIN: $TXT"

echo "UBER CARD: $(clickByDom "e => /^Uber/.test((e.textContent||'').trim()) && /full kit/i.test(e.textContent||'')")"; sleep 1.5
H=$(agent-browser eval "(() => { const h=[...document.querySelectorAll('h1,h2,h3')].find(x=>(x.textContent||'').trim()==='Uber'); const tabs=['The brief','Master plan','Theory Q&A','MCQs','Case studies','Problems']; return h? 'uber-kit-header OK; tab buttons='+tabs.filter(t=>[...document.querySelectorAll('button')].some(b=>(b.textContent||'').trim()===t)).length : 'NO UBER HEADER'; })()" | tr -d '\\')
echo "UBER KIT: $H"

# wall stat line
clickByDom "e => e.textContent && e.textContent.trim().startsWith('←')" >/dev/null; sleep 1
clickByDom "e => e.textContent && /Universe/.test(e.textContent)" >/dev/null; sleep 1.5
STAT=$(agent-browser eval "(() => { const t=(document.querySelector('main')?.innerText||''); const line=t.split('\n').find(l=>/\d+\s*(full kits|kits|\/\s*40|of 40)/i.test(l)); return line || t.slice(0,200); })()" | tr -d '\\')
echo "WALL STAT: $STAT"
