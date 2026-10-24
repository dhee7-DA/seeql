// Registry rows — the BOSS LEVEL II band (Module 12's second endgame wall):
// six ORIGINAL time-series/finance problems authored for this app — running
// VWAP breach detection, cash runway classification, cross-midnight shift
// pay, effective-dated rate blending, bilateral netting and fill-forward
// price staleness. 9xxx ids (original content, same convention as Boss
// Level I and the Data & Finance track), 7-tuple free format; the list
// starts with "SQL" so the rows are flagged into the sandbox-graded band.
import type { LcRow } from "./row";

export const SQL_BOSS2: LcRow[] = [
  [9007, "vwap-deviation-first-breach", "VWAP Deviation First Breach", 2, "SQL · Running VWAP|Threshold", "SQL · Boss Level II", "Citadel|Jane Street"],
  [9008, "runway-months-by-burn", "Runway Months by Burn", 1, "SQL · Conditional agg|Classification", "SQL · Boss Level II", "Stripe|Brex"],
  [9009, "midnight-shift-pay-split", "Midnight Shift Pay Split", 1, "SQL · Interval clipping|Date math", "SQL · Boss Level II", "UPS|Amazon"],
  [9010, "blended-rate-over-effective-dates", "Blended Rate Over Effective Dates", 2, "SQL · LEAD spans|Clipping", "SQL · Boss Level II", "Stripe|Adyen"],
  [9011, "bilateral-netting-settlement", "Bilateral Netting Settlement", 1, "SQL · Canonical pairs|Signed net", "SQL · Boss Level II", "Wise|Deloitte"],
  [9012, "price-fill-forward-staleness", "Price Fill-Forward Staleness", 2, "SQL · Recursive spine|Islands", "SQL · Boss Level II", "Bloomberg|Two Sigma"],
];
