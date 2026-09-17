// Joins-deck batch j3a — anti-joins on the customer axis, cs-251..cs-258.
// Every ghost corridor starts from or lands on the customer dimension. The
// signature battle is the anti-join itself: LEFT JOIN with the filter riding
// in the ON as an arm, WHERE right.id IS NULL as the ghost test, INNER/CROSS
// silently returning the complement. Two corridors need a rollup first: when
// "never" spans a fan-out (a buyer owns many orders; an order can carry
// several payment rows), the arm-filtered hop lies, so the right side is
// rolled up to distinct customers before the anti-join. Every figure quoted
// in prose was probed live against a read-only copy of the seed db
// (scripts/probe-j7a*.ts) before being written down.

import type { CaseStudy } from "../types";

export const casesJ3a: CaseStudy[] = [
  {
    id: "cs-251",
    deck: 2,
    topic: "j3",
    universe: "receivables",
    title: "Accounts that never leave money pending",
    brief:
      "From: Receivables lead. Re: authorization hygiene.\n\nThirteen pending payment authorizations worth 5,607.30 sit on the ledger right now, and the collections stand-up keeps asking who actually leaves money hanging. For once I want the clean side named: customers who have never once had a payment row stuck in pending — every attempt they make either settles or never gets attempted. A buyer owns many tickets, so the status can't just be tested on the arm as we hop; roll it up to the account level first. Eight names expected, alphabetical, with region for the desk map.",
    ask: "Every customer with no pending payment on any ticket, showing name and region, alphabetical.",
    template: `SELECT c.name, c.region
FROM customers c
{1} JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.status = {2}) s
ON s.customer_id = c.id
WHERE s.customer_id IS {3}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The clean list exists only if customers are preserved and the rollup decides who pairs: LEFT JOIN keeps all sixteen and lets never-pending accounts fall through to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the complement: the eight accounts that do leave authorizations open.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the open-authorization state",
        why: "The rollup must collect pending money, so the status reads 'pending' — quoted, it's a value. 'settled' rolls up every account on the books (all sixteen have settled at least once) and the clean list comes back empty; 'failed' flags only Emma Wilson, so fifteen names return; 'wallet' is a method, not a status — the rollup empties and all sixteen come back.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is what the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the eight accounts that do carry pending authorizations — the chase list, not the clean book — and the hygiene review would audit the wrong eight.",
      },
    ],
    distractors: ["INNER", "CROSS", "'settled'", "'failed'", "'wallet'", "NOT NULL"],
    walkthrough:
      "Eight accounts have never left a single authorization in pending: Bruno Silva, Dmitri Volkov, Farid Nasser, Hiro Tanaka, Jamal Wright, Liam O'Brien, Olivia Brown and Pedro Alvarez. The complement owns all thirteen pending rows — 5,607.30 — led by Emma Wilson (3 rows, 1,683.23) and Alice Chen (3 rows, 1,530.47); Chloe Dubois carries two worth 1,309.92. The rollup is the load-bearing part: hop customers→orders→payments with the status on the arm and WHERE p.id IS NULL, and every account on the books comes back — anyone with one settled-or-missing payment row paints a ghost, which is everyone. Rolling the pending payments up to distinct customers first makes the right side one row per offender, and LEFT JOIN + IS NULL then reads 'never'. Base rates for the desk: 91 payment rows on file, 77 settled for 24,216.51, 13 pending, and exactly 1 failed — Emma Wilson's 143.86 card attempt on order 82.",
  },
  {
    id: "cs-252",
    deck: 2,
    topic: "j3",
    universe: "logistics",
    title: "Buyers with nothing on a truck",
    brief:
      "From: Logistics desk. Re: the never-dispatched account list.\n\nCarrier billing reconciled clean for the month, which leaves the account-level question: which buyers have we never once put a shipped order on? Not which tickets — the desk has that list — the customers whose entire order history has never reached 'shipped'. Attach the city so account management can tie each name to a caller, alphabetical. Two of these are churned accounts and one owns our biggest open ticket, so expect the review to get uncomfortable.",
    ask: "Customers with no shipped order in their history, showing name and city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN orders o ON {2} = c.id AND o.status = {3}
WHERE o.id IS {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The six names exist only if orders that fail the arm fall through instead of deleting the customer: LEFT JOIN keeps every account and paints the never-shipped ones NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — keeps only the matched shipped rows and deletes exactly the people the brief asks for.",
      },
      {
        answer: "o.customer_id",
        kind: "keyword",
        label: "the order-side foreign key",
        why: "Orders point back at buyers through o.customer_id, so the pairing is o.customer_id = c.id. c.id = c.id is always true, so every customer would pair with every shipped order on file; o.id = c.id pairs a buyer with whichever shipped ticket happens to share their row number — fabricated matches no error message flags.",
      },
      {
        answer: "'shipped'",
        kind: "keyword",
        label: "the dispatch state",
        why: "The review is about tickets that left the building, so the arm reads 'shipped' — quoted, it's a value. 'delivered' re-aims it and only Liam O'Brien comes back — the one account with nothing delivered; 'pending' returns the eight accounts carrying open tickets — a different chase list.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the ghost marker",
        why: "A customer whose orders all fail the arm carries NULL where an order id would be, so the anti-join reads IS NULL. IS NOT NULL flips to the thirty matched shipped rows — the opposite of the review — and the desk would conclude everyone ships.",
      },
    ],
    distractors: ["INNER", "CROSS", "c.id", "o.id", "'delivered'", "'pending'"],
    walkthrough:
      "Six names come back: Bruno Silva (São Paulo), Chloe Dubois (Lyon), Dmitri Volkov (Tallinn), Farid Nasser (Dubai), Keiko Sato (Nagoya) and Olivia Brown (London) — seventeen orders worth 7,122.00 that have never reached a shipped state. Chloe is the biggest never-shipped value at five orders and 2,667.93; Farid's pile includes order 74 (1,088.44), the largest open ticket on file; Dmitri and Keiko are both flagged inactive — churned before anything shipped. The mechanics are the plain status anti-join: the arm o.status = 'shipped' rides in the ON, so each account pairs with its shipped tickets if any exist and falls to a single NULL-painted row if none do, and WHERE o.id IS NULL keeps exactly those ghosts. The other ten accounts own all thirty shipped tickets — 11,996.72 — so the gap is real money sitting still. Context for the caller list: each of the six has refund claims on file (one or two apiece), so these are live relationships, not dead rows — the desk should call before the month closes.",
  },
  {
    id: "cs-253",
    deck: 2,
    topic: "j3",
    universe: "month-close",
    title: "The cancellation wave never touched them",
    brief:
      "From: Financial Controller. Re: close checklist, cancellation note.\n\nThe cancelled book archives this quarter at seven tickets and 1,152.49, and the close narrative needs its flip side on one line: which accounts have never cancelled a single order? Not a low cancel rate — zero, ever. These are the accounts the retention deck can hold up as clean. Alphabetical with region, and build it so an account with no cancelled ticket still shows up — the join must not eat the very zeros it exists to find.",
    ask: "Customers with no cancelled order on file, showing name and region, alphabetical.",
    template: `SELECT c.name, c.region
FROM customers c
{1} JOIN orders o ON o.customer_id = c.id AND o.status = {2}
WHERE {3} IS {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "Twelve of sixteen accounts have no cancelled ticket, and the close needs them on the record: LEFT JOIN preserves every customer and paints the cancellation-less ones NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns only the four cancellers: the audit's exhibit, not the close's clean list.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the dead-ticket state",
        why: "The wave being studied is cancellations, so the arm reads 'cancelled' — quoted, it's a value. 'pending' returns the eight accounts with open tickets instead, 'shipped' the six with in-transit ones, 'delivered' only Liam O'Brien — real lists, all for other reviews.",
      },
      {
        answer: "o.id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker has to live on the order side: o.id IS NULL means no cancelled ticket paired. c.id IS NULL can never be true — the customer side is preserved and populated — and that spelling returns nothing where twelve names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the LEFT JOIN paints into unfilled arms, so the anti-join reads IS NULL. IS NOT NULL flips the query to the matched cancelled tickets — the seven-row wave itself — and the close note would celebrate the damage instead of the clean book.",
      },
    ],
    distractors: ["INNER", "CROSS", "'pending'", "'shipped'", "'delivered'", "c.id"],
    walkthrough:
      "Twelve of sixteen accounts have never cancelled anything: Bruno Silva, Chloe Dubois, Dmitri Volkov, Farid Nasser, Grace Kim, Hiro Tanaka, Isabella Rossi, Jamal Wright, Liam O'Brien, Noah Meyer, Olivia Brown and Pedro Alvarez. The whole cancellation wave belongs to just four accounts: Alice Chen three tickets (494.82), Keiko Sato one (397.99 — order 83), Maya Patel two (115.82) and Emma Wilson one (143.86). The mechanics are the status anti-join: the arm o.status = 'cancelled' lives in the ON, so a customer with cancelled tickets pairs with them and a customer without falls through to one ghost row, which WHERE o.id IS NULL keeps. Swap the join to INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — and the twelve clean accounts vanish; the query returns the four cancellers, upside down. Scale for the note: the cancelled book is 7 tickets / 1,152.49 against 103 orders on file — small, but it concentrates in four names, which is why the clean-twelve list is worth a line in the close.",
  },
  {
    id: "cs-254",
    deck: 2,
    topic: "j3",
    universe: "cash",
    title: "Never through the wallet rail",
    brief:
      "From: Cash desk. Re: wallet-processor coverage review.\n\nThe wallet processor wants a coverage number for the quarterly: which of our accounts have never once pushed money through their rail? Careful with the hop — a buyer owns many tickets and one ticket can carry two payment rows in different methods, so testing the method on the arm as you go customers→orders→payments lies. Roll the wallet payments up to distinct customers first, then anti-join the flag. Name and city, alphabetical.",
    ask: "Customers with no wallet payment on any ticket, showing name and city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id WHERE p.method = {2}) w
ON w.customer_id = c.id
WHERE {3} IS NULL
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The never-wallet list only survives a preserving join: LEFT JOIN keeps all sixteen customers and lets the nine wallet payers pair while the rest fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the nine payers: the complement, not the coverage gap.",
      },
      {
        answer: "'wallet'",
        kind: "keyword",
        label: "the rail under review",
        why: "The review is about the wallet rail, so the rollup reads 'wallet' — quoted, it's a value. 'card' leaves exactly one name (Olivia Brown — everyone else has carded at least once) and 'bank_transfer' leaves six — both real lists, neither answers the processor's question.",
      },
      {
        answer: "w.customer_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: w.customer_id IS NULL means this customer never appears among wallet payers. c.id IS NULL can never be true on the preserved side, and o.id doesn't exist out here at all — the orders join lives inside the derived table — so that spelling errors out.",
      },
    ],
    distractors: ["INNER", "CROSS", "'card'", "'bank_transfer'", "c.id", "o.id"],
    walkthrough:
      "Seven accounts have never used the wallet: Bruno Silva, Chloe Dubois, Farid Nasser, Isabella Rossi, Jamal Wright, Liam O'Brien and Pedro Alvarez. The rail itself is small: 16 payment rows, 4,935.04, spread over nine payers — Alice Chen leads with four rows worth 1,697.31, then Emma Wilson (3 rows, 1,172.30) and Grace Kim (3 rows, 1,023.04). The derived table is the lesson: the naive arm-filtered hop (LEFT JOIN orders, LEFT JOIN payments ON p.order_id = o.id AND p.method = 'wallet', WHERE p.id IS NULL) returns fifteen of sixteen names, because every non-wallet row on any ticket paints a ghost — order 81 alone pays by card AND wallet (81.07 plus 83.10), so its buyer ghosts on the card half. Rolling wallet payers up to distinct customers makes the right side one row per wallet user, and IS NULL finally reads 'never'. Method mix for the deck: card 62 rows / 19,859.23, wallet 16 / 4,935.04, bank_transfer 13 / 5,173.40 — wallet is the smallest rail and this is its honest coverage gap.",
  },
  {
    id: "cs-255",
    deck: 2,
    topic: "j3",
    universe: "growth",
    title: "Search never bought them",
    brief:
      "From: Growth lead. Re: channel coverage board.\n\nThe board deck's channel slide needs its honest denominator: search has bought exactly two accounts all year — everyone else arrived another way or wasn't bought at all. Pull the never-searched list: every customer search has never touched, city attached, alphabetical. Keep the channel test in the join so the two search buys pair and the other fourteen fall through visibly; the size of that gap is the argument for rebalancing spend.",
    ask: "Customers with no search-channel acquisition touch, showing name and city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN acquisitions a ON a.customer_id = c.id AND a.channel = {2}
WHERE {3} IS {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The gap only exists if customers are preserved: LEFT JOIN keeps all sixteen and lets the two search buys pair while the other fourteen fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the two search buyers: the slide's footnote, not its point.",
      },
      {
        answer: "'search'",
        kind: "keyword",
        label: "the channel under audit",
        why: "The audit is about search, so the arm reads 'search' — quoted, it's a value. 'referral' returns twelve untouched, 'retargeting' fifteen (Alice Chen's 6.00 touch is the only retargeting row on file) — and 'email' also returns fourteen: a different fourteen, with Isabella Rossi and Liam O'Brien dropping out instead of Chloe Dubois and Farid Nasser.",
      },
      {
        answer: "a.id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker has to live on the acquisition side: a.id IS NULL means no search touch paired. c.id IS NULL can never be true — the customer side is preserved and populated — and that spelling returns nothing where fourteen names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the LEFT JOIN paints into unfilled arms, so the anti-join reads IS NULL. IS NOT NULL flips the query to the two accounts search did buy — the channel's whole output, useful context but the opposite list.",
      },
    ],
    distractors: ["INNER", "CROSS", "'referral'", "'email'", "'retargeting'", "c.id"],
    walkthrough:
      "Fourteen names come back — everyone but Chloe Dubois and Farid Nasser. Search's entire ledger: touch 3, Chloe Dubois, 24.12, 2023-12-05; touch 6, Farid Nasser, 41.22, 2024-01-22 — 65.34 of spend all year. The channel board for scale: referral 4 touches, social 3, affiliate 3, search 2, email 2, retargeting 1 — search and email tie on count but not on names, which is why the count alone never proves the arm is right. The mechanics are the plain channel anti-join: the arm a.channel = 'search' rides in the ON, the two search buys pair, the other fourteen customers fall through to one NULL-painted row each, and WHERE a.id IS NULL keeps them. INNER — or CROSS with an ON — returns the two buyers and deletes the gap the slide is arguing about. Watch the near-miss the audit would never flag: swap 'search' for 'email' and the row count stays fourteen, but Isabella Rossi and Liam O'Brien leave the list while Chloe and Farid join it — always read the names, not just the row count.",
  },
  {
    id: "cs-256",
    deck: 2,
    topic: "j3",
    universe: "funnel",
    title: "No touch since the first of April",
    brief:
      "From: Growth ops. Re: Q2 reactivation list.\n\nMarketing's touch log went quiet for most of the book after the first of April: four acquisitions since, twelve accounts untouched. I want those twelve named for the reactivation sprint — customers with no acquisition row dated on or after 2024-04-01. The date rides in the join arm, and the untouched must survive the query, blanks and all — a list that silently deletes them would read as full coverage to anyone skimming it.",
    ask: "Customers with no acquisition touch dated 2024-04-01 or later, showing name and region, alphabetical.",
    template: `SELECT c.name, c.region
FROM customers c
LEFT JOIN acquisitions a ON a.customer_id = c.id AND a.acquired_at >= {1}
WHERE {2} {3} {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "'2024-04-01'",
        kind: "keyword",
        label: "the reactivation boundary",
        why: "The sprint counts touches from April first, so the arm reads '2024-04-01' — quoted, it's an ISO date value. '2024-05-01' widens the untouched list to fourteen and '2024-03-01' narrows it to ten — the boundary date is the argument, not a formatting detail.",
      },
      {
        answer: "a.id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker has to live on the acquisition side: a.id IS NULL means no post-April touch paired. c.id IS NULL can never be true — the customer side is preserved and populated — and that spelling returns nothing where twelve names belong.",
      },
      {
        answer: "IS",
        kind: "keyword",
        label: "the empty-test keyword",
        why: "Testing for the empty marker is spelled IS: a.id IS NULL. A bare column name in the operator's place breaks the statement — the predicate needs its keyword, and the sprint list needs its rows.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty marker",
        why: "NULL is what the LEFT JOIN paints into an unfilled arm, so the anti-join reads IS NULL. IS NOT NULL flips the query to the four accounts marketing did touch since the boundary — the touched book, not the reactivation list.",
      },
    ],
    distractors: ["'2024-05-01'", "'2024-03-01'", "c.id", "c.region", "NOT NULL"],
    walkthrough:
      "Twelve accounts have seen no marketing touch since April 1: Alice Chen, Bruno Silva, Chloe Dubois, Dmitri Volkov, Emma Wilson, Farid Nasser, Grace Kim, Hiro Tanaka, Isabella Rossi, Jamal Wright, Noah Meyer and Pedro Alvarez. The four who did: touch 11, Keiko Sato, affiliate, 33.46, 2024-04-02; touch 12, Liam O'Brien, email, 40.53, 2024-04-21; touch 13, Maya Patel, referral, 15.22, 2024-05-09; touch 14, Olivia Brown, affiliate, 11.68, 2024-06-11 — 100.89 since the boundary, and the whole acquisitions ledger stops at June 11. The mechanics: the date test lives in the ON as an arm filter, so pre-April touches fail it and leave the customer row NULL-painted — Alice's 2023 social buy doesn't save her from this list — and WHERE a.id IS NULL keeps the twelve. Drag the boundary to May 1 and the untouched list grows to fourteen; drop it to March 1 and it shrinks to ten. For the sprint: three of the four recent touches rode cheap channels, and Liam's 40.53 email buy is the priciest recent touch on file.",
  },
  {
    id: "cs-257",
    deck: 2,
    topic: "j3",
    universe: "refund-audit",
    title: "Never a mispick claim",
    brief:
      "From: Refund audit. Re: wrong-item exposure.\n\nWrong-item claims are the warehouse's fingerprint on our refund ledger — three on file, 281.65, and each one is a pick that left the building wrong. For the audit I want the accounts that have never received one: customers with no wrong_item claim on any order they've placed. A buyer owns many tickets, so roll the reason up to the account first — the arm alone can't say never. Thirteen names expected, with cities, alphabetical.",
    ask: "Customers with no wrong-item refund claim on any order, showing name and city, alphabetical.",
    template: `SELECT c.name, c.city
FROM customers c
{1} JOIN (SELECT DISTINCT o.customer_id AS customer_id FROM orders o JOIN refunds r ON r.order_id = o.id WHERE r.reason = {2}) x
ON x.customer_id = c.id
WHERE {3} IS {4}
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The clean list survives only a preserving join: LEFT JOIN keeps all sixteen customers, pairs the three claimants and paints the thirteen clean ones NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the three mispick accounts: the audit's subjects, not its clean list.",
      },
      {
        answer: "'wrong_item'",
        kind: "keyword",
        label: "the reason code",
        why: "The exposure being audited is mispicks, so the rollup reads 'wrong_item' — quoted, it's a value. 'damaged' leaves six clean names (damage touched ten accounts — the crowd) and 'late_delivery' twelve — real lists, neither measures the warehouse's fingerprint.",
      },
      {
        answer: "x.customer_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: x.customer_id IS NULL means this customer never appears among mispick claimants. c.id IS NULL can never be true on the preserved side, and that spelling returns nothing where thirteen names belong.",
      },
      {
        answer: "NULL",
        kind: "keyword",
        label: "the empty-marker keyword",
        why: "NULL is the placeholder the join paints where the rollup has no row, so the anti-join reads IS NULL. IS NOT NULL flips the query to the three claimant accounts — Chloe Dubois, Grace Kim and Alice Chen — the exposure itself, not the clean book.",
      },
    ],
    distractors: ["INNER", "CROSS", "'damaged'", "'late_delivery'", "c.id", "NOT NULL"],
    walkthrough:
      "Thirteen accounts have never received a wrong-item claim: Bruno Silva, Dmitri Volkov, Emma Wilson, Farid Nasser, Hiro Tanaka, Isabella Rossi, Jamal Wright, Keiko Sato, Liam O'Brien, Maya Patel, Noah Meyer, Olivia Brown and Pedro Alvarez. The mispick fingerprint belongs to three: claim 7, Chloe Dubois, 75.29 (order 34); claim 14, Grace Kim, 190.53 (order 68); claim 20, Alice Chen, 15.83 (order 86) — 281.65 in all. The rollup is the lesson: reason codes live on refunds, refunds hang off orders, and a buyer owns many orders — so the arm-filtered hop with WHERE r.id IS NULL returns all sixteen names, because every account has some order without a mispick on it. Rolling wrong_item claimants up to distinct customers makes the right side one row per offender, and IS NULL finally reads 'never'. Reason context for the audit: damaged is the crowd — ten accounts have carried one; late_delivery and changed_mind touched four accounts each; wrong_item is the rarest code on the ledger and the most concentrated.",
  },
  {
    id: "cs-258",
    deck: 2,
    topic: "j3",
    universe: "fraud",
    title: "Never split a ticket",
    brief:
      "From: Fraud spot-check. Re: installment review baseline.\n\nOur manual-review queue flags any ticket paid across two authorizations. Three exist all year — 914.71 — and before I tune the trigger I want the baseline on record: customers who have never split a ticket. A ticket splits when one order carries more than one payment row, and a buyer owns many tickets — so group the payment rows by ticket first, keep the multi-row ones, then anti-join the buyers. Name and region, alphabetical.",
    ask: "Customers with no split payment on any order, showing name and region, alphabetical.",
    template: `SELECT c.name, c.region
FROM customers c
{1} JOIN (SELECT o.customer_id AS customer_id FROM orders o JOIN payments p ON p.order_id = o.id GROUP BY o.id, o.customer_id HAVING COUNT(*) > {2}) s
ON s.customer_id = c.id
WHERE {3} IS NULL
ORDER BY c.name;`,
    slots: [
      {
        answer: "LEFT",
        kind: "keyword",
        label: "the preserving join",
        why: "The baseline is the complement of the review queue, so customers must be preserved: LEFT JOIN keeps all sixteen and lets the three splitters pair while the rest fall to NULL. INNER — or CROSS, which SQLite runs as an inner join when it carries an ON — returns the three splitting accounts: the queue's contents, not the baseline.",
      },
      {
        answer: "1",
        kind: "number",
        noVerify: true,
        label: "the split definition",
        why: "A split is MORE THAN ONE payment row on a single ticket, so the group filter reads COUNT(*) > 1 — a policy constant that never appears in the output cells. Raise it to 2 and no ticket on file qualifies: the rollup empties and all sixteen names return, a trigger that catches nothing.",
      },
      {
        answer: "s.customer_id",
        kind: "keyword",
        label: "the ghost test's column",
        why: "The marker lives on the rollup: s.customer_id IS NULL means this customer owns no splitting ticket. c.id IS NULL can never be true on the preserved side, and that spelling returns nothing where thirteen names belong.",
      },
    ],
    distractors: ["INNER", "CROSS", "2", "3", "c.id", "p.order_id"],
    walkthrough:
      "Thirteen accounts have never split a ticket: Bruno Silva, Chloe Dubois, Farid Nasser, Grace Kim, Hiro Tanaka, Isabella Rossi, Jamal Wright, Keiko Sato, Liam O'Brien, Maya Patel, Noah Meyer, Olivia Brown and Pedro Alvarez. The splits, all delivered tickets: order 33, Emma Wilson, 624.66 — 365.53 by card and 259.13 by wallet; order 81, Dmitri Volkov, 164.17 — 81.07 card plus 83.10 wallet; order 100, Alice Chen, 125.88 — two card rows, 65.97 and 59.91. That's 914.71 across three tickets, and two of the three buyers mix methods, which is exactly what the queue exists to see. The mechanics: inside the rollup the payment rows are grouped per ticket (GROUP BY o.id, o.customer_id) and HAVING COUNT(*) > 1 keeps multi-row tickets; the buyer id rides along, so the derived side is one row per splitting account, and WHERE s.customer_id IS NULL keeps everyone else. Group by customer instead of by ticket and the question changes: anyone with two payments ever gets flagged, Liam O'Brien and Olivia Brown become the only 'clean' names, and the baseline is nonsense. The rollup is what makes 'never' mean never.",
  },
];
