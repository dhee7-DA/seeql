import type { Lesson } from "../types";
import { EXPECTED } from "../expected";

export const lesson56: Lesson = {
  id: "lesson-56",
  num: 56,
  title: "Reconciliation — when books disagree",
  blurb: "Double-entry legs, the trial balance, and two real discrepancies planted in the store's books — found with anti-joins and settled with math",
  minutes: 16,
  blocks: [
    {
      kind: "p",
      text: "So far the books have been *evidence*: invoices here, payments there. The `ledger_entries` table is the **story about the evidence** — double-entry bookkeeping, five centuries old and still undefeated. Every event writes TWO legs that mirror each other: billing a customer debits *accounts_receivable* and credits *sales_revenue*; receiving cash debits *cash* and credits *accounts_receivable*; spending debits *operating_expenses* and credits *cash*. Debits and credits always move in pairs — which means the books can *prove themselves*. And when proof meets evidence, reconciliation begins.",
    },
    { kind: "diagram", figure: "fin5-trial-balance" },
    { kind: "h", text: "The trial balance — the books checking themselves" },
    {
      kind: "code",
      caption: "One row per account: total debits, total credits",
      sql: `SELECT account,
       ROUND(SUM(debit_cents) / 100.0, 2) AS debits,
       ROUND(SUM(credit_cents) / 100.0, 2) AS credits
FROM ledger_entries
GROUP BY account
ORDER BY account;
-- accounts_receivable  86052.0 debit · 69612.0 credit
-- cash                 69612.0 debit · 25416.0 credit
-- operating_expenses   25416.0 debit ·      0.0
-- sales_revenue             0.0 · 86052.0 credit`,
    },
    {
      kind: "bullets",
      items: [
        "The grand test: total debits ($181,080.00) must equal total credits ($181,080.00). Ours do — because every event wrote both legs. If they ever disagree, SOMETHING is missing from the books, row by row.",
        "Individual accounts are *supposed* to have nets: AR's net debit of $16,440.00 is money owed to the store; cash's net debit of $44,196.00 is money in the bank; revenue's credit balance is income earned. Only the WHOLE book must balance.",
        "Direction is convention, not ethics: assets and expenses grow with DEBITS; revenue grows with CREDITS. Memorize the three account behaviors and every net reads like a sentence.",
      ],
    },
    { kind: "h", text: "When the story contradicts the evidence" },
    {
      kind: "p",
      text: "A balanced trial balance proves the ledger is *self-consistent* — not that it's *true*. The ledger's AR net says $16,440.00. The invoices table says open AR is $15,609.00. Both cannot be right, and SQL finds the liar. This store has exactly two discrepancies planted in it — the kinds real accountants spend closing week hunting.",
    },
    {
      kind: "code",
      caption: "Catch #1 — a 'paid' invoice with no payment evidence",
      sql: `SELECT i.number, ROUND(i.amount_cents / 100.0, 2) AS amount
FROM invoices i
WHERE i.status = 'paid'
  AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id);
-- INV-2025-028 · 1756.0   someone marked it paid. no money arrived.`,
    },
    {
      kind: "code",
      caption: "Catch #2 — money received against a VOID invoice",
      sql: `SELECT i.number, p.paid_on,
       ROUND(p.amount_cents / 100.0, 2) AS refund_owed
FROM payments p
JOIN invoices i ON i.id = p.invoice_id
WHERE i.status = 'void';
-- INV-2024-011 · 2024-08-20 · 925.0   customer paid, bill was cancelled.`,
    },
    {
      kind: "bullets",
      items: [
        "**Catch #1** is an anti-join (lesson 13): status claims 'paid', the payments table holds no evidence. `NOT EXISTS` asks 'is there ANY row?' — and the answer, one $1,756.00 invoice later, is no.",
        "**Catch #2** is the mirror image: evidence exists (a $925.00 card payment) but the invoice it settles was voided. That's not revenue and not AR — it's a **refund owed** to Liam.",
        "Now the AR gap decomposes perfectly: economic truth is open AR ($15,609.00) + the uncollected 'paid' ghost ($1,756.00) = $17,365.00. The ledger says $16,440.00 — short by exactly the $925.00 it credited AR for the void payment that no AR debit ever balanced. Every dollar of disagreement is now *named*.",
      ],
    },
    {
      kind: "warn",
      text: "The ledger was BUILT from the payments table — so it faithfully credited AR for the void payment and never noticed invoice 28's missing money. Garbage in, balanced garbage out. That's why reconciliation compares INDEPENDENT sources, and why 'the books balance' is the start of the audit, not the end.",
    },
    { kind: "h", text: "The reconciliation mindset" },
    {
      kind: "bullets",
      items: [
        "Two independent sources, one figure (AR). Compute both. Difference them. Every cent of the difference must be explained by a named row — 'unexplained: $0.00' is the goal, called **tying out**.",
        "The hunting tools are all old friends: NOT EXISTS for one-sided evidence (lesson 13), LEFT JOIN … IS NULL for the same in reverse, FULL OUTER JOIN (lesson 34) when you need BOTH orphan directions in one pass.",
        "Fixes happen in a transaction (lesson 44): post the missing $1,756.00 payment, raise the $925.00 refund — all-or-nothing, because a half-fixed ledger is a NEW discrepancy.",
      ],
    },
    {
      kind: "dialect",
      db: "sqlite",
      text: "SQLite runs the whole close: trial balance, anti-joins, FULL OUTER JOIN via its 3.39+ engine. Booleans are integers, so `(rev > prev)` style flags compose with aggregates freely.",
    },
    {
      kind: "dialect",
      db: "postgres",
      text: "Postgres accounting schemas lean on NUMERIC ledgers and CONSTRAINT triggers that block unbalanced entry pairs at INSERT time — prevention, where SQLite teaches detection.",
    },
    {
      kind: "dialect",
      db: "mysql",
      text: "Identical SQL shapes; MySQL 8's CHECK constraints (enforced since 8.0.16) can assert `debit_cents = 0 OR credit_cents = 0` per leg — one real-world guardrail for this schema.",
    },
    {
      kind: "tip",
      text: "Balance proves bookkeeping; reconciliation proves truth. Trial balance → anti-joins for claims without evidence → name every cent of the gap. When the difference ties to zero, the close is done — and this store's closes with two named catches and a refund to process.",
    },
  ],
  mcqs: [
    {
      id: "l56-q1",
      prompt: "Billing a customer writes two ledger legs: debit accounts_receivable, credit sales_revenue. Why two?",
      choices: [
        "One for the customer, one for the store",
        "Double-entry: value must appear on both sides of the books — what we're owed (AR) and what we earned (revenue) — so every event self-documents and the books can prove balance",
        "SQLite requires two rows per INSERT",
        "So the memo field fits",
      ],
      answer: 1,
      why: "The pair IS the control. If only revenue were written, nothing would remind the books that money is now owed; if only AR, income would never appear. Two legs = a complete sentence about one event.",
      notes: [
        { choice: 0, why: "Both legs belong to the STORE's books — the customer has their own. The split is between two aspects of one event: claim and income." },
      ],
    },
    {
      id: "l56-q2",
      prompt: "The trial balance: total debits $181,080.00 = total credits. What does that prove?",
      choices: [
        "Every number in the books is correct",
        "The ledger is self-consistent — every debit had a matching credit — but says nothing about whether the entries reflect reality",
        "The store is profitable",
        "All invoices are paid",
      ],
      answer: 1,
      why: "Balance is arithmetic, not truth. The ledger dutifully balanced while carrying a phantom 'paid' invoice and a refund-shaped hole — both found only by comparing against independent evidence.",
      notes: [
        { choice: 0, why: "If balance implied correctness, reconciliation departments wouldn't exist. Balanced garbage is still balanced." },
      ],
    },
    {
      id: "l56-q3",
      prompt: "Why is `NOT EXISTS (SELECT 1 FROM payments …)` the right tool for catch #1, over `COUNT(*) = 0` or a LEFT JOIN?",
      choices: [
        "NOT EXISTS is the only syntax SQLite supports",
        "It asks a pure existence question, stops at the first match, and reads as the business sentence: 'no payment exists for this invoice'",
        "LEFT JOIN can't compare two tables",
        "COUNT would need a GROUP BY",
      ],
      answer: 1,
      why: "Lesson 13's anti-join in its cleanest form. (A LEFT JOIN … IS NULL works too — NOT EXISTS just states intent and lets the engine stop early.)",
      notes: [
        { choice: 3, why: "COUNT works fine inside a correlated subquery — but EXISTS says 'do I even care how many?' which is both faster and truer to the question." },
      ],
    },
    {
      id: "l56-q4",
      prompt: "The $925.00 payment on voided INV-2024-011 — what IS that money, economically?",
      choices: [
        "Revenue — money arrived, money counts",
        "A reduction of AR — the ledger already credited it correctly",
        "A refund owed: cash received for a bill that was cancelled — a liability until returned to the customer",
        "An expense",
      ],
      answer: 2,
      why: "The invoice was voided — the store has no right to the money. It's not revenue, not receivable; it's the store's debt to Liam until refunded. Books that keep it as either revenue or AR are lying by $925.00.",
      notes: [
        { choice: 1, why: "The ledger DID credit AR for it — which is precisely the bug: AR was credited with no matching debit, sinking the ledger's AR below the invoice-side truth by exactly $925.00." },
      ],
    },
    {
      id: "l56-q5",
      prompt: "Ledger AR nets to $16,440.00; open invoices total $15,609.00; the ghost invoice adds $1,756.00; the void payment accounts for $925.00. How do these tie?",
      choices: [
        "They don't — the books are broken beyond analysis",
        "15,609 + 1,756 = 17,365 economic AR; the ledger is short exactly 925 (its unbalanced void credit) — every cent of the gap is named",
        "16,440 − 15,609 = 831, matching the ghost",
        "The ghost and the void cancel out exactly",
      ],
      answer: 1,
      why: "Tying out: economic truth = open + uncollected ghost = 17,365. Ledger = truth − 925. Nothing is 'off by a rounding' — reconciliation ends when the difference is fully EXPLAINED, and here it is, to the cent.",
      notes: [
        { choice: 3, why: "1756 ≠ 925 — they don't cancel; they sit on opposite sides of the gap. Both must be named separately." },
      ],
    },
    {
      id: "l56-q6",
      prompt: "Why does the ledger's AR net ($16,440.00) credit-side include the void payment at all?",
      choices: [
        "A typo in the seed data",
        "The ledger was generated FROM the payments table — it recorded every payment as an AR credit, with no way to know one payment's invoice was later voided",
        "SQLite ignores status in aggregates",
        "The void happened after the ledger closed",
      ],
      answer: 1,
      why: "Single-source pipelines inherit their source's blindness. The ledger trusted payments unconditionally — which is exactly why an INDEPENDENT check against invoices is not optional bureaucracy.",
      notes: [
        { choice: 3, why: "Sequence doesn't save you — even in order, a pipeline that never re-checks status propagates the void payment forever." },
      ],
    },
    {
      id: "l56-q7",
      prompt: "Which account's net balance represents cash in the bank, and what's its sign?",
      choices: [
        "sales_revenue, credit $86,052.00",
        "cash, net DEBIT $44,196.00 — debits (collections in) exceed credits (expenses out)",
        "operating_expenses, debit $25,416.00",
        "accounts_receivable, net debit $16,440.00",
      ],
      answer: 1,
      why: "Cash is an asset: money arriving is a debit, money spent is a credit. Net debit $44,196.00 = $69,612 collected − $25,416 spent. The revenue credit is income, not a bank balance.",
      notes: [
        { choice: 3, why: "AR is money OWED, not money held — customers' promises, not the bank account. Different asset, different phone call." },
      ],
    },
    {
      id: "l56-q8",
      prompt: "You need BOTH mismatch directions in one result: paid-status invoices without payments AND payments without a live paid invoice. Which join shape?",
      choices: [
        "Two UNIONed anti-join queries",
        "FULL OUTER JOIN invoices to payments with IS NULL checks on both sides — one pass, both orphans",
        "INNER JOIN with a WHERE filter",
        "CROSS JOIN and manual scanning",
      ],
      answer: 1,
      why: "FULL OUTER keeps unmatched rows from BOTH sides (lesson 34) — the reconciliation swiss army knife. Here the second direction needs status-awareness (the void payment IS matched to an invoice, just a void one), so in practice: FULL OUTER for orphans + a status query for the void catch.",
      notes: [
        { choice: 0, why: "Two anti-joins UNIONed work perfectly well — the FULL OUTER is the elegant single pass when both directions share one join key." },
      ],
    },
    {
      id: "l56-q9",
      prompt: "Why must the FIXES (post the missing payment, raise the refund) run inside a transaction?",
      choices: [
        "Transactions are faster",
        "Half-applied fixes create NEW discrepancies — post one leg without its mirror and the trial balance itself breaks; all-or-nothing is the whole point of lesson 44",
        "SQLite requires transactions for UPDATE",
        "To lock other users out of the invoices table",
      ],
      answer: 1,
      why: "The double-entry contract doesn't pause for repairs. A fix is itself bookkeeping — two balancing legs, committed atomically, or rolled back entirely.",
      notes: [
        { choice: 2, why: "Single UPDATEs autocommit fine — the transaction isn't about syntax, it's about the INVARIANT: the books must never rest unbalanced, even for a millisecond." },
      ],
    },
    {
      id: "l56-q10",
      prompt: "Cash's ledger legs: debits $69,612.00 (collections) and credits $25,416.00 (expenses). But $925.00 of those collections is refund-owed. What's the TRUE cash position?",
      choices: [
        "$44,196.00 — the ledger is right",
        "$45,121.00 — add the refund back",
        "$43,271.00 — the $925.00 must eventually LEAVE (refund to Liam), so true spendable cash is 44,196 − 925",
        "$69,612.00 — expenses haven't cleared yet",
      ],
      answer: 2,
      why: "The $925.00 sits in the bank but isn't the store's — it's a liability wearing a deposit's clothes. Recognizing the refund turns one number into honest two: cash $43,271.00 + refund payable $925.00 = the same $44,196.00, told truthfully.",
      notes: [
        { choice: 0, why: "The ledger IS internally right — and economically overstated by exactly its blind spot. Reconciliation's whole personality in one question." },
      ],
    },
    {
      id: "l56-q11",
      prompt: "A junior proposes fixing the AR gap by editing the ledger's AR credit from 69,612 to 68,687. What's wrong with that?",
      choices: [
        "Nothing — the numbers match the invoice side",
        "It breaks the trial balance (debits would exceed credits by 925) and erases the audit trail — fixes must be new balancing entries that NAME the correction, never silent edits",
        "The number should be 68,000",
        "Ledger rows are read-only in SQLite",
      ],
      answer: 1,
      why: "Two sins in one edit: unbalanced books, and a vanished explanation. Real corrections are posted as visible adjusting entries — 'refund due to customer, INV-2024-011' — so the next reconciler can see what happened and why.",
      notes: [
        { choice: 0, why: "Matching one side by editing the other is how 925 problems become 1,850 problems — the unbalanced trial balance now flags EVERY account, not just AR." },
      ],
    },
  ],
  problems: [
    {
      id: "l56-p1",
      title: "The trial balance",
      brief: "The books' self-check: `account`, `debits` and `credits` = ROUND(SUM(…)/100.0, 2), one row per account, alphabetical. Four rows; grand totals must match at $181,080.00.",
      hints: [
        "One GROUP BY, two aggregates — the whole control is a module-1 skeleton on finance legs.",
        "Shape: SELECT account, ROUND(SUM(debit_cents)/100.0, 2) AS debits, ROUND(SUM(credit_cents)/100.0, 2) AS credits FROM ledger_entries GROUP BY account ORDER BY account;",
      ],
      difficulty: "easy",
      solution:
        "SELECT account,\n  ROUND(SUM(debit_cents) / 100.0, 2) AS debits,\n  ROUND(SUM(credit_cents) / 100.0, 2) AS credits\nFROM ledger_entries\nGROUP BY account\nORDER BY account;",
      mistakes: [
        { test: "where\\s+account", message: "No filter — the trial balance is EVERY account, or the totals can't prove anything." },
        { test: "sum\\s*\\(\\s*debit_cents\\s*\\+\\s*credit_cents", message: "Debits and credits are SEPARATE columns — summing them together erases the one check this report exists to make." },
        { test: "having\\s+sum", message: "No threshold — accounts with zero activity on one side still belong (revenue's 0.0 debits is informative)." },
      ],
      expected: EXPECTED["l56-p1"],
      ordered: true,
    },
    {
      id: "l56-p2",
      title: "Net worth of each account",
      brief: "The same scan, told as nets: `account`, `net` = ROUND((SUM(debit) − SUM(credit))/100.0, 2), biggest net first. Cash lands at 44196.0; revenue goes negative.",
      hints: [
        "Subtract the two aggregates in the SELECT — same level, so one query, no CTE needed.",
        "Shape: SELECT account, ROUND((SUM(debit_cents) - SUM(credit_cents))/100.0, 2) AS net FROM ledger_entries GROUP BY account ORDER BY net DESC, account;",
      ],
      difficulty: "medium",
      solution:
        "SELECT account,\n  ROUND((SUM(debit_cents) - SUM(credit_cents)) / 100.0, 2) AS net\nFROM ledger_entries\nGROUP BY account\nORDER BY net DESC, account;",
      mistakes: [
        { test: "abs\\s*\\(", message: "The SIGN is the information — revenue's −86052 means 'credit-natured, income'. ABS destroys the account's direction." },
        { test: "credit_cents\\s*-\\s*debit_cents", message: "Reversed — net = debits − credits keeps assets positive (cash +44196) and revenue negative (income). Flipping it tells the opposite story." },
        { test: "order\\s+by\\s+account\\s*(;|asc)$", message: "Alphabetical is fine for the trial balance, but the brief ranks by net: ORDER BY net DESC." },
      ],
      expected: EXPECTED["l56-p2"],
      ordered: true,
    },
    {
      id: "l56-p3",
      title: "The ghost payment",
      brief: "Find the catch: invoices marked 'paid' that have NO payment rows. Output `number` and `amount` (dollars). One row — the books bug.",
      hints: [
        "Anti-join time: WHERE status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = invoices.id).",
        "Shape: SELECT number, ROUND(amount_cents/100.0, 2) AS amount FROM invoices i WHERE status = 'paid' AND NOT EXISTS (SELECT 1 FROM payments p WHERE p.invoice_id = i.id);",
      ],
      difficulty: "medium",
      solution:
        "SELECT number,\n  ROUND(amount_cents / 100.0, 2) AS amount\nFROM invoices i\nWHERE status = 'paid'\n  AND NOT EXISTS (\n    SELECT 1 FROM payments p\n    WHERE p.invoice_id = i.id\n  );",
      mistakes: [
        { test: "\\bjoin\\s+payments(?!.*is\\s+null)", message: "An INNER join silently drops exactly the rows you're hunting — invoices with no payment match. Use NOT EXISTS (or LEFT JOIN … IS NULL)." },
        { test: "status\\s*=\\s*'open'|status\\s*!=\\s*'paid'", message: "The ghost CLAIMS to be paid — filter status = 'paid' and demand the missing evidence." },
        { test: "\\bcount\\s*\\(", message: "One row per ghost invoice with its amount — COUNT collapses the answer into a number and loses the invoice number." },
      ],
      expected: EXPECTED["l56-p3"],
      ordered: true,
    },
    {
      id: "l56-p4",
      title: "The refund list",
      brief: "The other direction: payments sitting against VOID invoices. Output `number`, `paid_on`, `refund` = ROUND(amount_cents/100.0, 2). One row, $925.00 owed back to Liam.",
      hints: [
        "Inner join payments → invoices, filter i.status = 'void' — the evidence that survived a cancelled bill.",
        "Shape: SELECT i.number, p.paid_on, ROUND(p.amount_cents/100.0, 2) AS refund FROM payments p JOIN invoices i ON i.id = p.invoice_id WHERE i.status = 'void';",
      ],
      difficulty: "medium",
      solution:
        "SELECT i.number, p.paid_on,\n  ROUND(p.amount_cents / 100.0, 2) AS refund\nFROM payments p\nJOIN invoices i ON i.id = p.invoice_id\nWHERE i.status = 'void';",
      mistakes: [
        { test: "status\\s*!=\\s*'void'|status\\s*=\\s*'open'", message: "The refund hides on VOID invoices specifically — paid and open invoices' payments are legitimate collections." },
        { test: "select\\s+i\\.number\\s*,\\s*i\\.issued_on", message: "That's the invoice's ISSUE date — the finance team needs when the money ARRIVED: p.paid_on." },
        { test: "\\bsum\\s*\\(", message: "One payment, one row — SUM would answer 'total refunds' but lose the invoice number and date the finance team needs to act." },
      ],
      expected: EXPECTED["l56-p4"],
      ordered: true,
    },
    {
      id: "l56-p5",
      title: "The bank balance",
      brief: "How much cash do the books show? One column `cash_balance` = ROUND((SUM(debits) − SUM(credits))/100.0, 2) over the cash account's legs.",
      hints: [
        "Cash is an asset: collections debit it, expenses credit it. Filter account = 'cash', net the two sums.",
        "Shape: SELECT ROUND((SUM(debit_cents) - SUM(credit_cents))/100.0, 2) AS cash_balance FROM ledger_entries WHERE account = 'cash';",
      ],
      difficulty: "easy",
      solution:
        "SELECT ROUND(\n  (SUM(debit_cents) - SUM(credit_cents)) / 100.0, 2) AS cash_balance\nFROM ledger_entries\nWHERE account = 'cash';",
      mistakes: [
        { test: "\\ball\\s+ledger|without\\s+where|from\\s+ledger_entries\\s*;", message: "Without WHERE account = 'cash' you're netting the ENTIRE book — always zero by construction, and useless as a bank figure." },
        { test: "credit_cents\\s*-\\s*debit", message: "Sign flip — cash DEBITS are money in. Reversed, the store looks $44k overdrawn." },
        { test: "\\bavg\\b|\\bcount\\b", message: "One net number is asked — the average or count of legs tells you nothing about the balance." },
      ],
      expected: EXPECTED["l56-p5"],
    },
    {
      id: "l56-p6",
      title: "Tie out the AR gap",
      brief: "The reconciliation's heart, one row, two columns: `ledger_ar` (AR net from ledger_entries) and `invoice_ar` (open-invoice outstanding total), both dollars. They disagree by exactly the void payment's $925.00.",
      hints: [
        "Two independent aggregates from two tables — each in its own subquery, side by side in one SELECT.",
        "Shape: SELECT ROUND((SELECT SUM(debit_cents) - SUM(credit_cents) FROM ledger_entries WHERE account = 'accounts_receivable')/100.0, 2) AS ledger_ar, ROUND((SELECT SUM(i.amount_cents - COALESCE((SELECT SUM(p.amount_cents) FROM payments p WHERE p.invoice_id = i.id), 0)) FROM invoices i WHERE i.status = 'open')/100.0, 2) AS invoice_ar;",
      ],
      difficulty: "hard",
      solution:
        "SELECT\n  ROUND((SELECT SUM(debit_cents) - SUM(credit_cents)\n         FROM ledger_entries\n         WHERE account = 'accounts_receivable') / 100.0, 2) AS ledger_ar,\n  ROUND((SELECT SUM(i.amount_cents - COALESCE(\n           (SELECT SUM(p.amount_cents) FROM payments p\n            WHERE p.invoice_id = i.id), 0))\n         FROM invoices i\n         WHERE i.status = 'open') / 100.0, 2) AS invoice_ar;",
      mistakes: [
        { test: "\\bjoin\\s+ledger_entries[^;]*invoices", message: "There's no key linking ledger legs to invoices (the ledger is monthly summaries) — join them and you get a cartesian blob. Keep the two truths in separate scopes." },
        { test: "ledger_ar[^;]*from\\s+invoices|invoice_ar[^;]*from\\s+ledger", message: "Swapped sources — the LEDGER number lives in ledger_entries; the INVOICE number in invoices + payments. The mismatch only means something when each number comes from its own world." },
        { test: "status\\s*=\\s*'paid'", message: "The invoice-side AR counts OPEN invoices — paid history nets to zero, and including the paid ghost belongs in the EXPLANATION (l56-p3), not this baseline." },
      ],
      expected: EXPECTED["l56-p6"],
    },
  ],
  takeaway: "The trial balance proves bookkeeping; reconciliation proves truth — anti-join the claims against the evidence, name every cent of the gap, and fix forward with balanced entries.",
};
