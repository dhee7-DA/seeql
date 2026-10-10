# One-off fixer for cases-wf8.ts (Task 41)
p = "src/lib/curriculum/cases/cases-wf8.ts"
s = open(p).read()

def swap(old, new):
    global s
    assert old in s, "MISSING: " + old[:70]
    s = s.replace(old, new, 1)

# 2276: add direction slot
swap("PARTITION BY invoice_id ORDER BY paid_on ASC, id ASC) AS next_installment",
     "PARTITION BY invoice_id ORDER BY paid_on {2}, id ASC) AS next_installment")
swap("ORDER BY invoice_id, paid_on ASC, id ASC\nLIMIT {2};`,",
     "ORDER BY invoice_id, paid_on ASC, id ASC\nLIMIT {3};`,")
swap('LEAD; LAG would borrow the previous one." },\n      { answer: "8"',
     'LEAD; LAG would borrow the previous one." },\n      { answer: "ASC", kind: "keyword", label: "the chain direction", why: "The chain runs forward in time — ASC makes next mean the later installment; DESC would reverse the cash story." },\n      { answer: "8"')
swap('distractors: ["LAG", "5"],\n    walkthrough:\n      "The partition scopes the chain to one invoice; LEAD borrows the following installment inside it; the last payment of each bill reads NULL. LAG would point the chain backwards into cash already received."',
     'distractors: ["LAG", "DESC", "5"],\n    walkthrough:\n      "The partition scopes the chain to one invoice; LEAD borrows the following installment inside it; the last payment of each bill reads NULL. LAG would point the chain backwards into cash already received, and the DESC flip would walk every bill from its last payment to its first — each next would point at older cash."')

# 2278
swap("PARTITION BY customer_id ORDER BY created_at ASC, id ASC) AS cust_next",
     "PARTITION BY customer_id ORDER BY created_at {2}, id ASC) AS cust_next")
swap("ORDER BY customer_id, created_at ASC, id ASC\nLIMIT {2};`,",
     "ORDER BY customer_id, created_at ASC, id ASC\nLIMIT {3};`,")
swap('LAG would borrow the previous basket." },\n      { answer: "10"',
     'LAG would borrow the previous basket." },\n      { answer: "ASC", kind: "keyword", label: "the walk direction", why: "The private timeline runs oldest to newest — ASC makes next the later basket; DESC would flip time." },\n      { answer: "10"')
swap('distractors: ["LAG", "5"],\n    walkthrough:\n      "The partition keeps each account\'s timeline separate; LEAD borrows the following basket; the final order of each customer reads NULL. LAG would point the column at history instead of the future."',
     'distractors: ["LAG", "DESC", "5"],\n    walkthrough:\n      "The partition keeps each account\'s timeline separate; LEAD borrows the following basket; the final order of each customer reads NULL. LAG would point the column at history instead of the future, and the DESC flip would walk every account backwards so next meant the basket before — a forecast with its arrow reversed."')

# 2283
swap('distractors: ["LAG", "category", "5"],', 'distractors: ["LAG", "memo", "5"],')

# 2284
swap("OVER (ORDER BY paid_on ASC, id ASC) AS prev_method",
     "OVER (ORDER BY paid_on {2}, id ASC) AS prev_method")
swap("ORDER BY paid_on ASC, id ASC\nLIMIT {2};`,",
     "ORDER BY paid_on ASC, id ASC\nLIMIT {3};`,")
swap('LEAD would borrow the next rail." },\n      { answer: "12"',
     'LEAD would borrow the next rail." },\n      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The walk runs oldest to newest — ASC makes previous mean earlier in time; DESC would reverse the clock." },\n      { answer: "12"')
swap('distractors: ["LEAD", "5"],\n    walkthrough:\n      "LAG borrows the previous row\'s method over the unpartitioned walk — every payment joins one chain. LEAD would borrow the following payment\'s rail, shifting the story one row forward. The first payment reads NULL because nothing precedes it."',
     'distractors: ["LEAD", "DESC", "5"],\n    walkthrough:\n      "LAG borrows the previous row\'s method over the unpartitioned walk — every payment joins one chain. LEAD would borrow the following payment\'s rail, shifting the story one row forward. The DESC flip would run the clock backwards so previous meant the future, and the first payment reads NULL because nothing precedes it."')

# 2286
swap("OVER (ORDER BY created_at ASC, id ASC) AS prev_time",
     "OVER (ORDER BY created_at {2}, id ASC) AS prev_time")
swap("ORDER BY created_at ASC, id ASC\nLIMIT {2};`,",
     "ORDER BY created_at ASC, id ASC\nLIMIT {3};`,")
swap('LEAD would borrow the next timestamp." },\n      { answer: "10"',
     'LEAD would borrow the next timestamp." },\n      { answer: "ASC", kind: "keyword", label: "the clock direction", why: "The walk runs oldest to newest — ASC makes previous mean earlier in time; DESC would reverse the clock." },\n      { answer: "10"')
swap('distractors: ["LEAD", "5"],\n    walkthrough:\n      "LAG borrows the previous created_at over the timeline walk. LEAD would borrow the following order\'s timestamp — the future, not the past. The first row\'s NULL is the store\'s opening moment: nothing was sold before it."',
     'distractors: ["LEAD", "DESC", "5"],\n    walkthrough:\n      "LAG borrows the previous created_at over the timeline walk. LEAD would borrow the following order\'s timestamp — the future, not the past. The DESC flip would reverse the clock so every previous pointed forward. The first row\'s NULL is the store\'s opening moment: nothing was sold before it."')

# 2288
swap("OVER (ORDER BY issued_on ASC, id ASC) AS prev_billed",
     "OVER (ORDER BY issued_on {2}, id ASC) AS prev_billed")
swap("ORDER BY issued_on ASC, id ASC\nLIMIT {2};`,",
     "ORDER BY issued_on ASC, id ASC\nLIMIT {3};`,")
swap('LEAD would borrow the next one." },\n      { answer: "12"',
     'LEAD would borrow the next one." },\n      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Invoices run oldest to newest — ASC makes previous the earlier bill; DESC would reverse the book." },\n      { answer: "12"')
swap('distractors: ["LEAD", "5"],', 'distractors: ["LEAD", "DESC", "5"],')

# 2290
swap("PARTITION BY vendor ORDER BY spent_on ASC, id ASC) AS prev_bill",
     "PARTITION BY vendor ORDER BY spent_on {2}, id ASC) AS prev_bill")
swap("ORDER BY vendor, spent_on ASC, id ASC\nLIMIT {2};`,",
     "ORDER BY vendor, spent_on ASC, id ASC\nLIMIT {3};`,")
swap('LAG; LEAD would borrow the next one." },\n      { answer: "10"',
     'LAG; LEAD would borrow the next one." },\n      { answer: "ASC", kind: "keyword", label: "the calendar direction", why: "Bills run oldest to newest inside the vendor — ASC makes previous the earlier charge." },\n      { answer: "10"')
swap('distractors: ["LEAD", "5"],\n    walkthrough:\n      "The partition scopes each chain to one vendor; LAG borrows the previous bill\'s amount inside it; a vendor\'s first bill reads NULL. LEAD would borrow the following bill, pointing the relationship\'s rhythm forward."',
     'distractors: ["LEAD", "DESC", "5"],\n    walkthrough:\n      "The partition scopes each chain to one vendor; LAG borrows the previous bill\'s amount inside it; a vendor\'s first bill reads NULL. LEAD would borrow the following bill, pointing the relationship\'s rhythm forward, and the DESC flip would walk every vendor backwards so previous meant their most recent charge."')

# 2292
swap('distractors: ["NTILE", "account", "6"],', 'distractors: ["NTILE", "account", "5"],')

# 2294
swap('distractors: ["LAG", "category", "5"],', 'distractors: ["LAG", "memo", "5"],')
swap('"The partition scopes each chain to one vendor; LEAD borrows the following bill\'s amount inside it. Repartitioning by category would chain across vendors within a spend type. LAG would point the rhythm backwards."',
     '"The partition scopes each chain to one vendor; LEAD borrows the following bill\'s amount inside it; the vendor\'s last bill reads NULL because nothing follows it. A partition column absent from the table would not run at all — the chip bank is real SQL, not decoration. LAG would point the rhythm backwards into cash already spent."')

# 2299
swap('"The partition scopes each chain to one account; LEAD borrows the following booking\'s date inside it; the account\'s last entry reads NULL. LAG would borrow the previous booking — history, not horizon."',
     '"The partition scopes each chain to one account; LEAD borrows the following booking\'s date inside it; the account\'s last entry reads NULL because nothing follows it in that account\'s story. LAG would borrow the previous booking instead — the history, not the horizon — and the sheet would read like a diary rather than a forecast."')

open(p, "w").write(s)
print("all fixes applied")
