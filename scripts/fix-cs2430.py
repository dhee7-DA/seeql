#!/usr/bin/env python3
# cs-2430 redesign — delivered-but-never-shipped (6 rows, non-empty)
path = 'src/lib/curriculum/gauntlet/m04-cases-hard-a.ts'
src = open(path, encoding='utf-8').read()

old = '''    id: "cs-2430", tier: "hard", topic: "gm4", universe: "refund-audit",
    title: "The stalled-and-never-delivered sweep",
    brief: "The refund sweep's negative pair: customers holding a pending order AND no delivered history — money stuck with no proof of fulfillment. One positive probe, one anti-probe; the AND composes opposite verdicts.",
    ask: "Rebuild the sweep: names of customers with pending orders but zero delivered orders, alphabetized.",
    template: "SELECT c.name FROM customers c WHERE {1} (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = 'pending') AND NOT {2} (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = {3}) ORDER BY c.name ASC;",
    slots: [
      { answer: "EXISTS", kind: "keyword", label: "the positive probe", why: "The sweep requires pending history — a positive witness; the NOT EXISTS chip would demand NO pending orders and empty the sweep." },
      { answer: "EXISTS", kind: "keyword", label: "the negated half", why: "NOT EXISTS reads 'no delivered order exists' — the anti-probe; the NOT EXISTS chip here would demand delivered history and invert the sweep." },
      { answer: "'delivered'", kind: "keyword", label: "the absent fate", why: "The swept accounts lack delivered proof; 'cancelled' would sweep pending-but-never-cancelled — a different mercy list." },
    ],
    distractors: ["NOT EXISTS", "'shipped'", "'cancelled'"],'''
new = '''    id: "cs-2430", tier: "hard", topic: "gm4", universe: "refund-audit",
    title: "The phantom-delivery audit",
    brief: "The data-quality sweep: customers holding a DELIVERED order but never a SHIPPED one — proof of delivery without a transit record, an operational impossibility worth six rows on this seed. One positive probe, one anti-probe; the AND composes opposite verdicts.",
    ask: "Rebuild the sweep: names of customers with delivered orders but zero shipped orders, alphabetized.",
    template: "SELECT c.name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id AND o.status = {1}) AND NOT EXISTS (SELECT 1 FROM orders o2 WHERE o2.customer_id = c.id AND o2.status = {2}) ORDER BY c.name {3};",
    slots: [
      { answer: "'delivered'", kind: "keyword", label: "the witnessed fate", why: "The positive witness is delivered history; 'pending' would sweep stuck money instead — the risk list, not the data-quality list." },
      { answer: "'shipped'", kind: "keyword", label: "the absent fate", why: "The swept accounts lack shipped records; 'delivered' there would demand delivered-minus-delivered — an empty tautology." },
      { answer: "ASC", kind: "keyword", label: "the case order", why: "Alphabetical keeps the six-name anomaly list stable for the ops ticket." },
    ],
    distractors: ["'pending'", "'delivered'", "'cancelled'", "DESC"],'''
assert old in src, 'cs-2430 body not found'
src = src.replace(old, new, 1)

i = src.find('walkthrough: "One positive verdict AND one negative: pending history exists, delivered history does not.')
assert i >= 0, 'old walkthrough not found'
j = src.find('",', i)
assert j > i
src = src[:i] + 'walkthrough: "One positive verdict AND one negative: delivered history exists, shipped history never does. The pair composes with AND — opposite polarities on the same skeleton. Probed: six customers hold delivered orders with zero transit records — the phantom-delivery anomaly the ops ticket tracks. The \'pending\' decoy rebuilds the stuck-money sweep (three names: pending but never shipped); the \'cancelled\' decoy sweeps delivered-but-never-cancelled — a clean-record list, the audit\'s opposite. The \'delivered\' decoy in the anti-probe\'s slot is the tautology trap: delivered-minus-delivered is structurally empty. Compound existence with mixed polarity is the quantifier grammar\'s full expression: EXISTS, NOT EXISTS, and the AND that composes them' + src[j:]
open(path, 'w', encoding='utf-8').write(src)
print('cs-2430 redesigned')
