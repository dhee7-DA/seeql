// Batch B3b — case files cs-056…cs-070, topic l3 (WHERE filters).
// Every figure below is audited against the live seed db by scripts/case-audit.ts.

import type { CaseStudy } from "./types";

export const casesB3b: CaseStudy[] = [
  {
    id: "cs-056",
    tier: "medium",
    topic: "l3",
    universe: "catalog",
    title: "Priced out of the impulse zone",
    brief:
      "From: Catalog content manager. Re: homepage merchandising mix.\n\nMarketing wants the homepage hero row to only carry our genuinely premium items, and we agreed anything priced above 100 counts as premium. Before they design tiles around it I need to know how much of the catalog even qualifies — give me the size of that premium shelf, not the list.",
    ask: "Count the products whose price is greater than 100.",
    template: `SELECT {1}(*)
FROM products
{2} price {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The deliverable is a shelf size, not a list — COUNT(*) returns one number. SUM would try to add the text '*' and fail on the spot.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The price condition applies to each product row before anything else happens, so WHERE is the gate. There is no grouping here, so HAVING has nothing to filter.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the comparison operator",
        why: "'Above 100' means strictly greater, so >. Flipping it to < keeps the 12 cheap items and throws away exactly the shelf you were asked to measure.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium threshold",
        why: "The merchandising bar is 100, so the comparison is price > 100. The decoy 200 would look plausible but returns an empty shelf — no product costs more than 200.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "<", "50", "200"],
    walkthrough:
      "The ask is a headcount of premium products, so COUNT(*) it is. The condition is per-product — what does this row cost? — so it belongs in WHERE with a strict greater-than: 'above 100' excludes anything priced at exactly 100.00, and > is the honest translation. Run it and the answer is 4: the Noise-Canceling Headset at 149.99, the 4K Webcam Pro at 129, the Studio Desktop Mic at 119, and the Smart Watch S at 199.99. Worth flagging back to marketing: not one of the four is an Electronics item — that category tops out at 89.99 — and widening the bar to 200 would return nothing at all, since 199.99 is the ceiling of the whole catalog.",
  },
  {
    id: "cs-057",
    tier: "medium",
    topic: "l3",
    universe: "month-close",
    title: "Big delivered orders for the revenue note",
    brief:
      "From: Financial Controller. Re: April close prep.\n\nFor the revenue-quality note I need to size the segment of fully settled business that actually moves the needle — delivered orders only, and only the ones worth more than 500. Don't send me the transactions, just tell me how many there are so I know whether this needs a paragraph or a footnote.",
    ask: "Count the delivered orders whose total is greater than 500.",
    template: `SELECT {1}(*)
FROM orders
{2} status = {3} {4} total > {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One number is requested — how many orders — so COUNT(*) is the aggregate. SUM would chase a sum of asterisks and error out.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Both conditions test individual orders before any aggregation, so WHERE is the right clause. HAVING only exists to filter grouped buckets, and none are built here.",
      },
      {
        answer: "'delivered'",
        kind: "keyword",
        label: "the status value",
        why: "Settled means delivered, so the value is the quoted string 'delivered' — quotes are not optional, bare delivered reads as a column name and the query dies.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the condition joiner",
        why: "An order must be delivered AND big — both must hold, so AND. Swapping in OR counts every delivered order plus every big order of any status, inflating the segment.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the value threshold",
        why: "The note's bar is 'worth more than 500', so total > 500. Dropping to 300 would pull in 23 orders instead of 9 — a different, much noisier segment.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "'cancelled'", "OR", "300"],
    walkthrough:
      "Two facts must be true of each order — it's delivered, and it's over 500 — so both conditions sit in WHERE joined by AND, and the deliverable is a single number, hence COUNT(*). The value wears quotes because it's a text literal; the threshold doesn't because it's numeric. Run it and the answer is 9. For context, the same 500 bar cuts the other statuses as 11 shipped and 5 pending, with zero cancellations that big — so the delivered-and-big segment is real revenue, not hope. If the controller ever loosens the bar to 300 this jumps to 23, which is exactly why the threshold belongs in the footnote next to the number.",
  },
  {
    id: "cs-058",
    tier: "medium",
    topic: "l3",
    universe: "growth",
    title: "Who can we actually visit",
    brief:
      "From: Chief of Staff. Re: Q3 roadshow planning.\n\nWe're doing in-person visits on the next trip and leadership wants them focused on our home markets — the US plus LATAM. Pull the customer names and their cities from those two regions so the ops team can build a route. Eight EU accounts don't exist for this trip; don't let them sneak in.",
    ask: "List the name and city of every customer in the US or LATAM region.",
    template: `SELECT name, city
FROM customers
{1} region {2} ({3}, {4});`,
    slots: [
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The region restriction trims customer rows before anything is returned, which is exactly what WHERE does. ORDER would sort rows, not narrow them.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the list operator",
        why: "Two allowed values make IN the tidy form — region IN ('US', 'LATAM'). Using = against a two-value list is a syntax error; you'd need OR to spell it out longhand.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the first region code",
        why: "Region codes are stored as text, so the value is quoted: 'US'. Slotting in 'EU' would silently hand you Berlin and Milan for an Americas roadshow.",
      },
      {
        answer: "'LATAM'",
        kind: "keyword",
        label: "the second region code",
        why: "The second stop is LATAM, quoted, exactly as stored — 'APAC' here would swap São Paulo for Dubai and Seoul, and the route would cross an ocean.",
      },
    ],
    distractors: ["=", "OR", "EU", "APAC"],
    walkthrough:
      "One table, two allowed region codes, names and cities out — the whole question is how to say 'US or LATAM' in one clause. IN does it: region IN ('US', 'LATAM') keeps any row whose region matches either value, and both codes wear quotes because they're text. Run it and three customers come back: Bruno Silva in São Paulo, Emma Wilson in Austin, and Jamal Wright in Chicago. The longer OR spelling (region = 'US' OR region = 'LATAM') returns the same three rows, so IN is purely the tidier form — but the temptation to write = with a list, or to let 'EU' drift into the values, would either break the query or book flights to Europe.",
  },
  {
    id: "cs-059",
    tier: "medium",
    topic: "l3",
    universe: "refund-audit",
    title: "March's single cancellation",
    brief:
      "From: refunds@ internal ticket #4571.\n\nMonthly refunds digest. For the March slice I need one line: how many orders placed in that month ended up cancelled. Finance reads this as a canary — if March cancellation crept up we reopen the goodwill policy discussion. Pair the month strictly to 2024-03, not the whole spring.",
    ask: "Count the cancelled orders created in March 2024.",
    template: `SELECT COUNT(*)
FROM orders
WHERE status = {1}
  {2} {3}('%Y-%m', created_at) = {4};`,
    slots: [
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The canary tracks cancellations, so the value is the quoted 'cancelled'. 'pending' would count a different beast — two March orders that merely haven't moved yet.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the condition joiner",
        why: "An order must be cancelled AND fall in March — both at once, so AND. Without a joiner the two conditions collide syntactically; OR would count every cancelled order plus every March order.",
      },
      {
        answer: "strftime",
        kind: "keyword",
        label: "the month extractor",
        why: "created_at is a full timestamp; strftime('%Y-%m', created_at) cuts it down to a year-month so it can be compared to '2024-03'. Plain created_at = '2024-03' would match nothing.",
      },
      {
        answer: "'2024-03'",
        kind: "keyword",
        label: "the month literal",
        why: "SQLite months are zero-padded text: '2024-03', not '2024-3'. The sloppy form compares unequal to every row and quietly reports zero cancellations — the worst kind of wrong.",
      },
    ],
    distractors: ["'pending'", "'2024-3'", "SUBSTR"],
    walkthrough:
      "The digest wants cancelled orders confined to March 2024, so two conditions join with AND: the status equals the quoted 'cancelled', and the created_at timestamp, trimmed to year-month by strftime('%Y-%m', created_at), equals '2024-03' — zero-padded, in quotes, exactly as the function emits it. The answer lands at 1. That's a healthy canary: the seven cancelled orders on file are spread across the whole year, and March contributes just one of them. For contrast, the same month holds 2 pending orders — still open, not yet cancelled — which is why the status filter and the month filter both have to be exact; loosen either one and the digest line quietly changes meaning.",
  },
  {
    id: "cs-060",
    tier: "hard",
    topic: "l3",
    universe: "pricing",
    title: "The mid-market shelf",
    brief:
      "From: Head of Product. Re: repositioning workshop prep.\n\nFor the workshop I need the shelf we call mid-market: products priced from 100 up to 300, boundaries included. List each qualifying product with its price so we can argue positioning against real ticket sizes. The sub-100 impulse items and anything premium are out of scope for this exercise.",
    ask: "List the name and price of every product priced between 100 and 300 inclusive.",
    template: `SELECT name, price
FROM products
WHERE price {1} {2} {3} {4};`,
    slots: [
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the range operator",
        why: "A closed band from 100 to 300 is precisely what BETWEEN expresses. NOT would flip it and return the twelve cheap-and-cheerful items you were told to exclude.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the range floor",
        why: "The band starts at 100 inclusive. Lowering the floor to 80 sneaks the 89.99 keyboard into a mid-market slide where it doesn't belong.",
        noVerify: true,
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the range joiner",
        why: "BETWEEN always reads BETWEEN x AND y — the AND is part of the operator's shape. OR there breaks the syntax entirely; the query never runs.",
      },
      {
        answer: "300",
        kind: "number",
        label: "the range ceiling",
        why: "The band ends at 300 inclusive. Tightening the ceiling to 150 would silently drop the headset and the watch from the workshop list.",
        noVerify: true,
      },
    ],
    distractors: ["NOT", "OR", "80", "150"],
    walkthrough:
      "A price band with both boundaries included is BETWEEN's home turf: WHERE price BETWEEN 100 AND 300 — the AND isn't a separate condition here, it's half of the operator's grammar. Run it and four products make the mid-market shelf: the Noise-Canceling Headset at 149.99, the 4K Webcam Pro at 129, the Studio Desktop Mic at 119, and the Smart Watch S at 199.99. Nothing sits exactly on either boundary, so the inclusive ends cost nothing today — but if a 100.00 product ever lands, BETWEEN keeps it while a strict pairing would drop it, which is why the workshop phrasing said 'inclusive'. As a sanity check, the same query with NOT returns the other twelve products, the cheap shelf this exercise deliberately excludes.",
  },
  {
    id: "cs-061",
    tier: "medium",
    topic: "l3",
    universe: "fraud",
    title: "Accounts outside the home corridors",
    brief:
      "From: Risk team, spot-check rotation.\n\nThis cycle's spot-check targets cross-border exposure: accounts sitting outside our two home corridors, US and EU. Those corridors carry our standard fraud controls; everywhere else runs on lighter checks, so that's where we look first. Pull the account list with each account's corridor so the analysts can tag who's in scope. Names only, no booking data yet.",
    ask: "Customer name and region for every account outside the US and EU corridors.",
    template: `SELECT {1}, region
FROM customers
WHERE region NOT {2} ({3}, {4});`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the account column",
        why: "The analysts tag accounts by name, so the list carries the name column. city would give locations without account names and force a second lookup per row.",
      },
      {
        answer: "IN",
        kind: "keyword",
        label: "the exclusion keyword",
        why: "Exclusion from a list is NOT IN — IN alone would select the home corridors, the exact accounts this sweep must skip.",
      },
      {
        answer: "'US'",
        kind: "keyword",
        label: "the first corridor",
        why: "The first home corridor is the quoted text 'US'. Bare US would be read as a column reference and the query would die.",
      },
      {
        answer: "'EU'",
        kind: "keyword",
        label: "the second corridor",
        why: "The second corridor is the quoted text 'EU' — paired with 'US' inside the NOT IN list to define everything that is out of scope.",
      },
    ],
    distractors: ["city", "IN", "'APAC'", "'LATAM'", "AND"],
    walkthrough:
      "Six accounts sit outside the home corridors: Bruno Silva in LATAM, then the APAC block — Farid Nasser, Grace Kim, Hiro Tanaka, Keiko Sato and Maya Patel. That's the sweep's scope, and the shape is worth naming: NOT IN ('US', 'EU') reads as 'exclude everything in this list', the mirror of the corridor checks we run in-cycle. The IN decoy is the quiet one — it doesn't error, it hands you the fifteen home-corridor accounts instead, a perfectly sorted list of exactly the wrong population. Two scope notes for the analysts: Keiko Sato is one of our two inactive accounts, so she's tagged but not contactable, and region is the only corridor column on file — country-level splits would need a schema change before the next cycle.",
  },
  {
    id: "cs-062",
    tier: "medium",
    topic: "l3",
    universe: "inventory",
    title: "Bulk pick lines for the wave plan",
    brief:
      "From: Warehouse ops manager. Re: Thursday pick-wave planning.\n\nPick waves are costed by line, and multi-unit lines — two units or more — slow the walkers down and need cart checks. I want to know how many of our booked order lines are in that multi-unit category so I can decide whether Thursday runs as one wave or two. Just the count of bulk lines.",
    ask: "Count the order lines whose quantity is at least 2.",
    template: `SELECT {1}(*)
FROM {2}
WHERE quantity {3} {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The plan needs one number — how many bulk lines — so COUNT(*). SUM would attempt to total the literal '*' and fail before returning anything.",
      },
      {
        answer: "order_items",
        kind: "keyword",
        label: "the line table",
        why: "Line quantities live on order_items — one row per booked line. orders carries whole tickets and has no quantity column, so the count would die there.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the threshold operator",
        why: "'Two or more' is >= — the boundary itself qualifies. > would drop every 2-unit line, and = would count only them, missing the 3-unit bulk picks.",
      },
      {
        answer: "2",
        kind: "number",
        label: "the bulk threshold",
        why: "The bulk bar is 2 units, so quantity >= 2. The threshold is policy, not a figure any result cell carries back — the answer is a single count.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "orders", ">", "=", "1"],
    walkthrough:
      "One table, one threshold, one number: COUNT(*) over order_items where quantity >= 2. The operator is >= rather than > because the brief says two or more — a 2-unit line is already a cart-check line. Run it and 158 of the 251 booked lines are bulk: 69 two-unit picks plus 89 three-unit picks, leaving 93 singles that walk in one wave. The orders decoy matters more than it looks: whole tickets have no quantity column, so pointing the count at the wrong table isn't a wrong answer, it's an error — and the wave plan ships with nothing. One quirk to log: no line on file exceeds 3 units, so today the heavy end of the threshold is exactly 3.",
  },
  {
    id: "cs-063",
    tier: "medium",
    topic: "l3",
    universe: "funnel",
    title: "January's booked volume",
    brief:
      "From: Growth marketing lead. Re: cohort kickoff baseline.\n\nThe Q1 retention cohort starts from January 2024 bookings, so I need the exact size of that month's order pool as the denominator for every downstream percentage. It must be January 2024 only — not the whole first quarter, not January 2025. One number for the deck's baseline tile.",
    ask: "Count the orders created in January 2024.",
    template: `SELECT {1}(*)
FROM orders
{2} {3}('%Y-%m', created_at) {4} {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The baseline tile is a pool size, so COUNT(*). GROUP doesn't aggregate — it can't even appear in that position without breaking the statement.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "The month test trims individual order rows before counting, which is WHERE's job. GROUP after FROM would be a syntax error, not a filter.",
      },
      {
        answer: "strftime",
        kind: "keyword",
        label: "the month extractor",
        why: "created_at stores full timestamps, so strftime('%Y-%m', created_at) reduces each one to its year-month text, comparable against the baseline literal.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the match operator",
        why: "The cohort is exactly one month, so the extracted month must equal '2024-01'. Switching to > would count every order from January 2024 onward — all 103 of them.",
      },
      {
        answer: "'2024-01'",
        kind: "keyword",
        label: "the month literal",
        why: "The baseline month is zero-padded '2024-01'. The casual '2024-1' matches no formatted month at all and would report an empty cohort.",
      },
    ],
    distractors: ["SUM", "GROUP", ">", "'2024-1'"],
    walkthrough:
      "A cohort baseline needs one number: the orders booked in exactly one month. So COUNT(*) over orders, gated by WHERE strftime('%Y-%m', created_at) = '2024-01' — the function slices each timestamp down to year-month text, and the equality pins it to January 2024, quotes and zero-padding included. The answer is 8. That sits right in this store's normal rhythm: monthly volume across the ledger runs between 6 and 9 orders, with February 2024 the peak at 9. Two near-misses to warn the team about: '2024-1' without the zero pad matches nothing and would put an empty cohort on the slide, and >= or > instead of = would silently widen the denominator to the entire 103-order history.",
  },
  {
    id: "cs-064",
    tier: "medium",
    topic: "l3",
    universe: "supplier",
    title: "Partners above the quality bar",
    brief:
      "From: Supply-chain lead. Re: annual vendor review.\n\nVendors scoring 4.4 or higher on our quality rating get first call on next year's volume commitments, and the rest go into a remediation track. Pull each qualifying supplier with its rating so I can walk into the review with the shortlist. The boundary case matters — someone sits exactly on the bar.",
    ask: "List the name and rating of every supplier rated 4.4 or higher.",
    template: `SELECT {1}, {2}
FROM suppliers
WHERE rating {3} {4};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the name column",
        why: "The review is per supplier, so the shortlist leads with name. region would list 'EU' and 'APAC' where partner names belong — different output, useless in the meeting.",
      },
      {
        answer: "rating",
        kind: "keyword",
        label: "the rating column",
        why: "The bar is set on the rating column, so the second projected column is rating — reviewers see each score next to each name. Swapping in id would print numbers nobody can referee.",
      },
      {
        answer: ">=",
        kind: "keyword",
        label: "the inclusion operator",
        why: "'4.4 or higher' includes the boundary, so >=. Strict > would drop the supplier sitting exactly at 4.4 — the very boundary case the lead flagged.",
      },
      {
        answer: "4.4",
        kind: "number",
        label: "the quality bar",
        why: "The bar itself is 4.4, and it appears verbatim in the result — Midwest Hardware Co is rated exactly 4.4. Raising the decoy to 4.6 would silently cut the shortlist to two.",
      },
    ],
    distractors: [">", "<=", "4.6", "region"],
    walkthrough:
      "The shortlist is suppliers plus their ratings, filtered on the score itself: WHERE rating >= 4.4, with the number written plainly and the comparison inclusive because the policy says '4.4 or higher'. Three partners qualify: Nordic Gadgets AB at 4.6, Midwest Hardware Co at exactly 4.4, and Alpine Audio GmbH at 4.8. Midwest is the live boundary case — with a strict > the shortlist collapses to two and a qualifying vendor would have walked into remediation by accident. The inverted <= reads just as plausible on screen but returns the three lowest scorers (4.1, 3.9, 4.0 plus Midwest), an entirely different list. Reading the column into the projection as well as the filter is deliberate: the review needs the number beside the name to justify each commitment.",
  },
  {
    id: "cs-065",
    tier: "medium",
    topic: "l3",
    universe: "expense",
    title: "Open exposure on the books",
    brief:
      "From: Ops finance spend owner. Re: weekly cash review.\n\nFor the exposure line I track every order that is still movable money: pending ones we still expect to fulfill, and cancelled ones we may have to refund. Both buckets share one property — nothing has landed. Give me the combined headcount of those two statuses; the ledger detail can wait for the weekly pack.",
    ask: "Count the orders whose status is pending or cancelled.",
    template: `SELECT {1}(*)
FROM orders
WHERE status = {2} {3} status = {4};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "One headcount is asked for, so COUNT(*). IN cannot head the select list — it's a filter operator, and SUM(*) is simply invalid.",
      },
      {
        answer: "'pending'",
        kind: "keyword",
        label: "the first status value",
        why: "The still-open bucket is the quoted 'pending'. Substituting 'delivered' would count settled revenue as exposure and scare finance for nothing.",
      },
      {
        answer: "OR",
        kind: "keyword",
        label: "the condition joiner",
        why: "A row qualifies if it's pending OR cancelled — either one — so OR joins the tests. AND demands both statuses at once, which no order can satisfy, returning zero.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the second status value",
        why: "The refund-risk bucket is the quoted 'cancelled'. 'shipped' here would add 30 in-transit orders that are neither open sales risk nor refund candidates.",
      },
    ],
    distractors: ["AND", "'delivered'", "IN", "'shipped'"],
    walkthrough:
      "Exposure means 'not settled yet', and the ledger models that as two statuses, so the filter is status = 'pending' OR status = 'cancelled' — each value quoted, joined by OR because either one qualifies a row. COUNT(*) turns it into the single headcount the review wants: 21, which decomposes exactly into the 14 pending plus 7 cancelled orders on file. The instructive near-miss is AND: an order cannot be two statuses simultaneously, so AND returns an empty set — a silently 'clean' ledger that would read as good news while hiding every open euro. Slotting 'shipped' into either value is the other trap: shipped orders are already out the door, and adding them would inflate exposure by 30 in-transit orders that no longer need deciding on.",
  },
  {
    id: "cs-066",
    tier: "medium",
    topic: "l3",
    universe: "catalog",
    title: "Everything that mentions USB",
    brief:
      "From: Catalog content manager. Re: accessory bundling sprint.\n\nWe're building a USB-accessories bundle page and first I need to see which catalog entries even reference USB in their product name. Pull each matching product with its price so the bundle team can check margin. Search the names only — descriptions aren't loaded here, and we're matching the substring, not an exact title match.",
    ask: "List the name and price of every product whose name contains USB.",
    template: `SELECT {1}, {2}
FROM products
WHERE name {3} {4};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the name column",
        why: "The search runs over product names, so the bundle list leads with name. stock would print warehouse counts where titles belong — wrong column entirely.",
      },
      {
        answer: "price",
        kind: "keyword",
        label: "the price column",
        why: "The team checks margin before bundling, so price rides along in the projection. id alone wouldn't tell them whether an item clears the bundle's margin floor.",
      },
      {
        answer: "LIKE",
        kind: "keyword",
        label: "the pattern operator",
        why: "A substring search is LIKE's job — name LIKE '%USB%'. Plain = compares the whole string and would demand a product literally titled '%USB%'.",
      },
      {
        answer: "'%USB%'",
        kind: "keyword",
        label: "the search pattern",
        why: "The wildcards make the pattern: %USB% matches USB anywhere in the name. Without them, LIKE 'USB' matches only a name that is exactly 'USB' — nothing.",
      },
    ],
    distractors: ["ORDER", "=", "'USB'", "stock"],
    walkthrough:
      "Substring matching has one correct shape here: WHERE name LIKE '%USB%', the percent signs marking 'anything may surround it'. Project name and price so the bundle team sees both the candidate and its margin at a glance. The result is a single product: the USB-C Hub 7-in-1 at 49. The two classic misfires both come back empty-handed — swapping LIKE for = turns the pattern into an exact-title comparison, which no product satisfies, and dropping the percent wildcards (LIKE 'USB') demands a product named precisely 'USB', which also doesn't exist. Both fail silently as zero rows, and a zero-row bundle page is the kind of bug that reaches staging before anyone notices. If the sprint later wants charging gear too, '%Wireless%' is a separate sweep: one product, the Wireless Mouse M3.",
  },
  {
    id: "cs-067",
    tier: "hard",
    topic: "l3",
    universe: "month-close",
    title: "The mid-tier order band",
    brief:
      "From: Financial Controller. Re: revenue mix commentary.\n\nFor the mix commentary I segment orders into bands, and this note covers the middle of the market: totals from 500 up to and including 1000. I need the size of that band — how many orders live there. The very largest ticket and the long tail of small ones are handled by other lines in the commentary.",
    ask: "Count the orders whose total is between 500 and 1000 inclusive.",
    template: `SELECT {1}(*)
FROM orders
WHERE total {2} {3} {4} {5};`,
    slots: [
      {
        answer: "COUNT",
        kind: "keyword",
        label: "the counting aggregate",
        why: "The commentary line is a band size, so COUNT(*). SUM(*) is not a thing — the aggregate and the argument don't compose that way.",
      },
      {
        answer: "BETWEEN",
        kind: "keyword",
        label: "the range operator",
        why: "A closed band from 500 to 1000 is BETWEEN's exact use case. OR in that position either breaks the statement or degenerates to counting everything.",
      },
      {
        answer: "500",
        kind: "number",
        label: "the band floor",
        why: "The band opens at 500. Raising the floor to 800 would drop 20 of the 24 orders and leave a band too thin to comment on.",
        noVerify: true,
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the range joiner",
        why: "BETWEEN x AND y — the AND is part of the operator, not a separate condition. Replacing it with OR collapses the phrase and the query fails to parse.",
      },
      {
        answer: "1000",
        kind: "number",
        label: "the band ceiling",
        why: "The band closes at 1000 inclusive. Stretching it to 2000 would pull in the one giant 1088.44 ticket that the commentary handles on its own line.",
        noVerify: true,
      },
    ],
    distractors: ["SUM", "OR", "800", "2000"],
    walkthrough:
      "This is a banded count: WHERE total BETWEEN 500 AND 1000, with the AND belonging to the BETWEEN grammar rather than joining two independent conditions. The band is inclusive at both ends, and no order sits exactly on 500, so the boundary costs nothing today. The count lands at 24. Reconciling it against the raw thresholds keeps the commentary honest: 25 orders exceed 500 in total, and exactly one of those — the 1088.44 whale — climbs past 1000, which is why the band holds 24. Squeeze the ceiling down to 800 and only 21 survive; stretch it to 2000 and the whale swims back in at 25. That one order is deliberately reported on its own line, which is precisely why the ceiling is 1000 and not 'whatever looks close'.",
  },
  {
    id: "cs-068",
    tier: "easy",
    topic: "l3",
    universe: "growth",
    title: "Dormant accounts for the win-back list",
    brief:
      "From: Chief of Staff. Re: win-back campaign targeting.\n\nWe flag an account dormant the moment it's deactivated in the CRM, and the growth team wants this quarter's win-back list built from exactly those. Pull each dormant customer's name with its active flag so the campaign tooling can ingest the rows directly. Everyone with a 1 on the flag is someone else's problem this quarter.",
    ask: "List the name and active flag of every customer whose active flag is 0.",
    template: `SELECT {1}, active
FROM customers
WHERE active {2} {3};`,
    slots: [
      {
        answer: "name",
        kind: "keyword",
        label: "the name column",
        why: "The win-back list addresses people, so name leads the projection. city would give the campaign tooling towns where contacts belong.",
      },
      {
        answer: "=",
        kind: "keyword",
        label: "the match operator",
        why: "Dormant means the flag equals 0, so =. Flipping to != selects the 14 active accounts — the exact complement of the list being built.",
      },
      {
        answer: "0",
        kind: "number",
        label: "the dormant flag value",
        why: "The dormant flag is numeric 0, and it shows up verbatim in the result rows — that's the value the tooling ingests. The decoy 1 selects every active customer instead.",
      },
    ],
    distractors: ["1", "city", "!="],
    walkthrough:
      "The flag is a plain number in storage, so the filter is WHERE active = 0 — no quotes, no function, just equality against the dormant marker. Projecting name alongside active means each returned row carries the flag itself, so the campaign tooling can verify what it ingested. Two rows come back: Dmitri Volkov, flagged 0 since joining in December 2023, and Keiko Sato, dormant since April 2024. The other 14 customers all carry a 1, which is why the != inversion would return exactly the list you don't want — the entire active base, pitched a win-back offer they have no need for. Worth noting for the deck: one dormant account per region, EU and APAC, so the win-back spend splits cleanly down the middle.",
  },
  {
    id: "cs-069",
    tier: "hard",
    topic: "l3",
    universe: "refund-audit",
    title: "Cancellations worth a phone call",
    brief:
      "From: refunds@ internal ticket #4688.\n\nEscalation round. Policy says we personally call the customer on any cancelled order worth more than 200 — below that, the automated refund email handles it. Send me the order ids with their totals for this round's call list. Last round the threshold debate ate an afternoon; the number is 200, settled.",
    ask: "List the id and total of every cancelled order whose total is greater than 200.",
    template: `SELECT {1}, total
FROM orders
{2} status = {3}
  {4} total {5} {6};`,
    slots: [
      {
        answer: "id",
        kind: "keyword",
        label: "the order identifier",
        why: "The call list references orders by id — that's what the phone agent types in. 'total' there would print the amount twice and leave nothing to look up.",
      },
      {
        answer: "WHERE",
        kind: "keyword",
        label: "the row gate",
        why: "Both conditions trim individual order rows, so WHERE. 'total' in the gate position is not a clause and the statement never parses.",
      },
      {
        answer: "'cancelled'",
        kind: "keyword",
        label: "the status value",
        why: "The escalation targets cancellations, quoted: 'cancelled'. 'pending' would route 11 unshipped orders — none of them cancelled — onto a refund call list.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the condition joiner",
        why: "An order must be cancelled AND exceed 200, so AND. OR would list every cancellation plus every big order of any status — 70 rows of mostly irrelevant calls.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the threshold operator",
        why: "'Worth more than 200' is strict >. Flipping to < keeps the five small cancellations and drops both escalations — the opposite list.",
      },
      {
        answer: "200",
        kind: "number",
        label: "the escalation threshold",
        why: "Ticket policy fixes the bar at 200, so total > 200. Easing it to 150 would add the 152.52 cancellation and widen tomorrow's call sheet.",
        noVerify: true,
      },
    ],
    distractors: ["total", "'pending'", "OR", "<", "150"],
    walkthrough:
      "The call list is cancellations above the settled bar, so two conditions in WHERE joined by AND: status = 'cancelled' and total > 200, with the id projected so agents have something to pull up. Two orders qualify: order 83 at 397.99 — the largest cancellation on file — and order 95 at 206.19, just over the line. The full cancelled book is 7 orders, and the other five all sit under 160, which is exactly why the automated email handles them and the phone rings only twice. Watch the two ways this list goes wrong: relaxing the bar to 150 adds the 152.52 order and pads the sheet, while flipping the comparison to < returns the five small fry and misses both escalations entirely.",
  },
  {
    id: "cs-070",
    tier: "medium",
    topic: "l3",
    universe: "pricing",
    title: "Premium audio, shortlist edition",
    brief:
      "From: Head of Product. Re: audio line positioning.\n\nThe audio shelf is getting a premium sub-story, and it only works if the items actually carry premium tickets. From the Audio category, I want the products priced above 100, each with its price, so we can decide which two or three anchor the story. The budget speaker and anything outside audio are not part of this conversation.",
    ask: "List the name and price of every Audio product priced above 100.",
    template: `SELECT name, price
FROM products
WHERE category = {1} {2} price {3} {4};`,
    slots: [
      {
        answer: "'Audio'",
        kind: "keyword",
        label: "the category value",
        why: "The shelf is audio, so the value is the quoted 'Audio'. 'Wearables' would swap the story onto the 199.99 watch; 'Electronics' yields nothing above 100 at all.",
      },
      {
        answer: "AND",
        kind: "keyword",
        label: "the condition joiner",
        why: "A product must be in Audio AND priced above 100 — both filters at once, so AND. OR would union the whole audio shelf with every premium item anywhere in the catalog.",
      },
      {
        answer: ">",
        kind: "keyword",
        label: "the price operator",
        why: "'Above 100' is strict >: the speaker at 59.99 misses, and nothing audio sits exactly at 100 to argue about. < would return only that same budget speaker.",
      },
      {
        answer: "100",
        kind: "number",
        label: "the premium bar",
        why: "The premium sub-story starts at 100, so price > 100. Lowering the bar to 50 would readmit the 59.99 speaker and un-premium the entire shelf.",
        noVerify: true,
      },
    ],
    distractors: ["'Wearables'", "OR", "50", "'Electronics'"],
    walkthrough:
      "Two filters must both hold — the category is Audio and the price clears 100 — so they sit in WHERE joined by AND, with the category wearing quotes as a text value. The result is a tight anchor list: the Noise-Canceling Headset at 149.99 and the Studio Desktop Mic at 119. The third audio product, the Bluetooth Speaker Mini at 59.99, fails the bar and stays on the standard shelf, which is precisely the positioning the brief wants. The OR variant is the trap worth remembering: it returns five rows, the whole audio shelf plus every premium product from other categories — the 199.99 watch, the 129 webcam — and a 'premium audio' slide built on it would be wrong on every tile. Same lesson on the bar: drop it to 50 and the speaker walks back in.",
  },
];
