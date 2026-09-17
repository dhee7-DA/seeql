// Case files for lesson 35 — the Foundations capstone. 4 long-form board
// scenarios (multi-slot, full clause pipeline) against the atom matrix
// (scripts/case-matrix.md); every figure ground-truthed in
// scripts/facts-cases-out.txt.
import type { CaseStudy } from "../types";

// SQL keywords are blanked into slots too (keyword-blank pass,
// scripts/case-blank.ts): every word — keyword or figure — is placed
// from the chip pool.
export const CASES_L35: CaseStudy[] = [
  {
    id: 'l35-c01',
    title: 'The founder\'s lifecycle grid',
    brief: 'First week as the storefront\'s only analyst, and the founder wants the lifecycle grid for Monday\'s stand-up: one row per status, the order count beside the money in each, biggest pile first. You know the shape by heart now — group by status, count and sum each bucket, rank on the count. The board reads: 52 orders / $15,571.07 delivered, 30 / $11,996.72 shipped, 14 / $6,113.00 pending, 7 / $1,152.49 cancelled.',
    ask: 'Show each status with its order count and total billed, biggest count first.',
    template: '{1} status, {2}(*) {3} n, {4}(total) AS take\n{5} orders\n{6} status\n{7} {8} {9};',
    chips: ['COUNT', 'SUM', 'AVG', 'n', 'DESC', 'ASC', 'SELECT', 'AS', 'FROM', 'GROUP BY', 'ORDER BY'],
    answers: ['SELECT', 'COUNT', 'AS', 'SUM', 'FROM', 'GROUP BY', 'ORDER BY', 'n', 'DESC'],
    why: 'GROUP BY status builds the four buckets; COUNT(*) and SUM(total) both read each one (52/30/14/7 against 15,571.07 / 11,996.72 / 6,113.00 / 1,152.49); ORDER BY n DESC ranks the grid biggest-first. The founder\'s whole stand-up slide, one query.',
    notes: [
      { slot: 1, why: 'Every read statement opens with SELECT — it declares the columns the answer will show.' },
      { slot: 2, why: 'AVG would print typical baskets where the founder asked for pile sizes — the count column is COUNT.' },
      { slot: 3, why: 'AS renames the output column heading; the table itself never changes.' },
      { slot: 5, why: 'FROM names the world — the one table the rows come from. It always follows the SELECT list.' },
      { slot: 6, why: 'GROUP BY folds the rows into buckets — one output row per distinct key.' },
      { slot: 7, why: 'ORDER BY sorts the output rows — without it, row order is whatever the engine happens to return.' },
      { slot: 8, why: 'The rank key is the count\'s alias n — sorting by take would reorder the grid by money and break the biggest-pile-first promise.' },
      { slot: 9, why: 'ASC would open the board on cancelled, 7 orders — the smallest pile first is the wrong drama.' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'l35-c02',
    title: 'The big-ticket watchlist',
    brief: 'The founder\'s second ask: "the pending orders that actually hurt — five hundred dollars or more, worst first, up to ten." Five orders qualify, led by the $1,088.44 giant. Three facts braid into one query: the status gate, the money gate, and the worst-first ranking with its cap.',
    ask: 'Show up to ten pending orders of at least 500 dollars, biggest first.',
    template: '{1} id, total\n{2} orders\n{3} {4} {5} total {6} 500\n{7} total {8}\n{9} {10};',
    chips: ['status = \'pending\'', 'status = \'shipped\'', '>=', 'DESC', 'ASC', '10', 'SELECT', 'FROM', 'WHERE', 'AND', 'ORDER BY', 'LIMIT'],
    answers: ['SELECT', 'FROM', 'WHERE', 'status = \'pending\'', 'AND', '>=', 'ORDER BY', 'DESC', 'LIMIT', '10'],
    why: 'WHERE keeps pending rows with totals of at least 500 — five orders; ORDER BY total DESC ranks worst-first (1,088.44 on top); LIMIT 10 caps the watchlist, and with only five qualifying, the cap is headroom. Row filter, sort, slice — the full reading of one memo line.',
    notes: [
      { slot: 1, why: 'Every read statement opens with SELECT — it declares the columns the answer will show.' },
      { slot: 2, why: 'FROM names the world — the one table the rows come from. It always follows the SELECT list.' },
      { slot: 3, why: 'WHERE is the filter gate — it keeps only the rows that pass the predicate.' },
      { slot: 4, why: 'Shipped orders have already left the building — the watchlist watches what is stuck. The status literal is pending.' },
      { slot: 5, why: 'AND narrows — both predicates must pass for a row to survive.' },
      { slot: 7, why: 'ORDER BY sorts the output rows — without it, row order is whatever the engine happens to return.' },
      { slot: 8, why: 'ASC would open the watchlist on the smallest stuck order — worst-first means the money ranks descending.' },
      { slot: 9, why: 'LIMIT caps the output — only the first N sorted rows survive.' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'l35-c03',
    title: 'The holes audit',
    brief: 'The ops retro closes with the data-quality sweep: orders that have never shipped, counted per status, biggest hole first. The probe is IS NULL — the only legal test for blank — then the usual group-and-rank. The grid it prints: pending 14 holes, cancelled 7 — twenty-one orders with no parcel hand-off, each explainable by its status.',
    ask: 'Show the number of never-shipped orders per status, biggest hole count first.',
    template: '{1} status, {2}(*) {3} n\n{4} orders\n{5} {6}\n{7} status\n{8} {9} {10};',
    chips: ['shipped_at IS NULL', 'shipped_at = NULL', 'n', 'DESC', 'ASC', 'SELECT', 'COUNT', 'AS', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY'],
    answers: ['SELECT', 'COUNT', 'AS', 'FROM', 'WHERE', 'shipped_at IS NULL', 'GROUP BY', 'ORDER BY', 'n', 'DESC'],
    why: 'WHERE shipped_at IS NULL keeps the 21 unstamped rows; GROUP BY status buckets them (pending 14, cancelled 7); ORDER BY n DESC puts the bigger hole on top. The = NULL spelling would keep zero rows — the audit would print an empty grid and miss every hole.',
    notes: [
      { slot: 1, why: 'Every read statement opens with SELECT — it declares the columns the answer will show.' },
      { slot: 2, why: 'COUNT(*) counts rows; COUNT(column) counts only the non-null values.' },
      { slot: 3, why: 'AS renames the output column heading; the table itself never changes.' },
      { slot: 4, why: 'FROM names the world — the one table the rows come from. It always follows the SELECT list.' },
      { slot: 5, why: 'WHERE is the filter gate — it keeps only the rows that pass the predicate.' },
      { slot: 6, why: 'shipped_at = NULL is the silent killer: it matches nothing, ever. Blanks answer only to IS NULL.' },
      { slot: 7, why: 'GROUP BY folds the rows into buckets — one output row per distinct key.' },
      { slot: 8, why: 'ORDER BY sorts the output rows — without it, row order is whatever the engine happens to return.' },
      { slot: 10, why: 'ASC would lead the sweep with the seven cancelled holes — the retro reads biggest-first.' },
    ],
    difficulty: 'hard',
  },
  {
    id: 'l35-c04',
    title: 'The founder snapshot',
    brief: 'End of the first week; the founder wants the three-number snapshot for the investor note: how many orders, how much money in total, how many distinct buyers. One row, three cells: 103 orders, $34,833.28 taken, 16 customers behind them. Three aggregates — and the third needs the deduplicating keyword, because 103 orders do not mean 103 buyers.',
    ask: 'Show the order count, the total of all order totals, and the distinct buyer count — in one row.',
    template: '{1} {2} {3} orders, {4}(total) AS take, {5}({6} customer_id) AS buyers\n{7} orders;',
    chips: ['COUNT(*)', 'SUM', 'AVG', 'DISTINCT', 'ROUND', 'SELECT', 'AS', 'COUNT', 'FROM'],
    answers: ['SELECT', 'COUNT(*)', 'AS', 'SUM', 'COUNT', 'DISTINCT', 'FROM'],
    why: 'COUNT(*) counts the 103 rows; SUM(total) adds the book to 34,833.28; COUNT(DISTINCT customer_id) collapses the buyers to 16 — the keyword inside the count does the deduplicating. Three cells, one row, the whole storefront in investor language.',
    notes: [
      { slot: 1, why: 'Every read statement opens with SELECT — it declares the columns the answer will show.' },
      { slot: 2, why: 'AVG(total) in the orders cell would print the 338.19 typical basket — the note asks how many, not how typical.' },
      { slot: 3, why: 'AS renames the output column heading; the table itself never changes.' },
      { slot: 4, why: 'AVG here would report 338.19 where the note wants the 34,833.28 take. Adding money across the book is SUM.' },
      { slot: 5, why: 'COUNT(*) counts rows; COUNT(column) counts only the non-null values.' },
      { slot: 6, why: 'Without DISTINCT the buyer cell reads 103 — orders, not buyers. The deduplication happens inside the count.' },
      { slot: 7, why: 'FROM names the world — the one table the rows come from. It always follows the SELECT list.' },
    ],
    difficulty: 'hard',
  },];
