// Company Interview Universe — types. Client-safe.
//
// The universe is organized as DOMAINS (industries) × 17 companies
// each (136-company matrix). Every company carries a KIT: everything that company asks in SQL
// interviews, wrapped in the day-to-day business context its data teams
// actually live in. Kits land domain by domain (see worklog); the registry
// always lists the full matrix so the structure is visible
// before every kit is authored.

import type { Mcq } from "@/lib/curriculum/types";
import type { CaseStudy } from "@/lib/curriculum/cases/types";

/** One KPI the company's data org lives by. */
export interface CompanyMetric {
  /** Short KPI name, e.g. "GMV", "Fill rate". */
  name: string;
  /** What it measures and why that company watches it weekly. */
  what: string;
}

/** One skill family to master for this company's screens. */
export interface CompanyTopic {
  /** Topic name, e.g. "Window ranking". */
  name: string;
  /** Why THIS company leans on it (their business reality, not generic). */
  why: string;
  /** Practice problems from the SQL band that drill exactly this. */
  slugs: string[];
}

/** One written interview theory question with a model answer. */
export interface TheoryQa {
  /** Stable id, e.g. "amz-t1" — unique across the whole universe. */
  id: string;
  /** The question, verbatim as an interviewer would say it. */
  q: string;
  /** The model answer — what a strong candidate says out loud. */
  a: string;
  /** One-word family tag, e.g. "joins", "windows". */
  tag: string;
}

/** One curated problem from the SQL band + why this company asks it. */
export interface CompanyProblem {
  slug: string;
  /** The company-flavored framing: which real workflow this query mirrors. */
  why: string;
}

/** The full per-company interview kit. */
export interface CompanyKit {
  /** Stable id, e.g. "amazon" — registry key. */
  id: string;
  domainId: string;
  name: string;
  /** One-line positioning under the name. */
  tagline: string;
  /** Tailwind text-color class for the accent chip, e.g. "text-amber-400". */
  accent: string;
  /** 3–4 paragraphs: what the company is, its scale, its data org, its interview style. */
  brief: string[];
  /** 3 paragraphs: what a data analyst/engineer here actually does all day. */
  dayInLife: string[];
  /** The KPI wall. */
  metrics: CompanyMetric[];
  /** Topics to master, in study order. */
  topics: CompanyTopic[];
  /** Written theory questions with model answers. */
  theory: TheoryQa[];
  /** Multiple-choice questions (graded by the shared McqCard machinery). */
  mcqs: Mcq[];
  /** Case studies on the storefront db (graded by the shared CaseFileCard machinery). */
  cases: CaseStudy[];
  /** Curated problem pool with per-problem company whys. */
  problems: CompanyProblem[];
}

/** One industry domain grouping five flagship companies. */
export interface CompanyDomain {
  /** Stable id, e.g. "ecom". */
  id: string;
  name: string;
  blurb: string;
  /** Company kit ids in display order. */
  companies: string[];
}
