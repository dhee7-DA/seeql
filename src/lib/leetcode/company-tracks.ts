// Company Tracks — ordered SQL practice paths for the employers with deep
// community-sourced SQL pools. A track is the company's SQL problems in
// canonical interview order (Easy → Medium → Hard, stable registry order
// within each tier), with a one-line flavor blurb so each track reads like
// a workplace, not a filter result. Solved state comes from the same honest
// ledger the rest of the band uses — no separate storage, no claim inflation.

import { LC_ALL } from "./registry";
import type { LcDifficulty, LcRef } from "./types";

const DIFF_RANK: Record<LcDifficulty, number> = { Easy: 0, Medium: 1, Hard: 2 };

/** The featured employer tracks, ordered by SQL pool depth. "LeetCode" (a
 *  source facet, not an interviewer) and the platform pseudo-tags are
 *  deliberately not in the lineup — they stay reachable via the filter. */
export const TRACK_COMPANIES: string[] = [
  "Amazon",
  "Google",
  "Meta",
  "Bloomberg",
  "Uber",
  "eBay",
  "Optum",
  "Microsoft",
];

/** One-line flavor per featured employer — what their SQL screens feel like
 *  on the ground. Interview-flavor heuristics from public report write-ups,
 *  not HR copy; the Company index already carries the sourcing caveat. */
export const COMPANY_FLAVOR: Record<string, string> = {
  Amazon: "Operational scale — orders, sessions and logistics; heavy GROUP BY, joins and running totals.",
  Google: "Analytics-clean datasets — rankings, dedupe logic and window math over events and products.",
  Meta: "Engagement metrics — DAU-style rollups, growth funnels and social-graph percentiles.",
  Bloomberg: "Market data — time-series gaps, tick-level comparisons and exchange-paced window queries.",
  Uber: "Marketplace trips — driver funnels, ride outliers and per-city performance cuts.",
  eBay: "Listings & auctions — conversion funnels, seller metrics and classic aggregation screens.",
  Optum: "Healthcare claims — patient cohorts, encounter joins and compliance-style audit queries.",
  Microsoft: "The classics — the salary/rank/temperature set Microsoft screens have reused for a decade.",
};

export function companyFlavor(name: string): string {
  return (
    COMPANY_FLAVOR[name] ??
    "Community-sourced SQL pool — grind it in difficulty order and bank the patterns."
  );
}

/** The company's SQL problems in track order: Easy → Medium → Hard, stable
 *  registry order within each tier. Works for ANY tagged company — featured
 *  or not — so every row in the Company index opens a real track. */
export function companySqlTrack(name: string): LcRef[] {
  return LC_ALL.filter((p) => p.sql && p.companies.includes(name)).sort(
    (a, b) => DIFF_RANK[a.difficulty] - DIFF_RANK[b.difficulty],
  );
}

export interface TrackMix {
  easy: number;
  medium: number;
  hard: number;
}

export function trackMix(problems: LcRef[]): TrackMix {
  const mix: TrackMix = { easy: 0, medium: 0, hard: 0 };
  for (const p of problems) {
    if (p.difficulty === "Easy") mix.easy++;
    else if (p.difficulty === "Medium") mix.medium++;
    else mix.hard++;
  }
  return mix;
}
