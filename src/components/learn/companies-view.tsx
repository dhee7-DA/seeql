"use client";

// Company Interview Universe — the interview-prep wall. 8 industry domains ×
// 5 flagship companies each; every company with a live kit carries the full
// package: business brief, day-in-the-life, KPI wall, topics-to-master (with
// practice links into the SQL band), written theory Q&A, MCQs, case studies
// and a curated problem pool. Kits land domain by domain — companies without
// a kit yet show as "kit in build" so the matrix is visible from day one.

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  Building2,
  Check,
  ChevronRight,
  Code2,
  FileStack,
  Gauge,
  Hammer,
  ListChecks,
  Map,
  MessagesSquare,
  Sparkles,
  SunMedium,
  Timer,
  Trophy,
} from "lucide-react";
import { COMPANY_DOMAINS, COMPANY_META, companyKit, isKitLive } from "@/lib/companies/registry";
import type { CompanyKit } from "@/lib/companies/types";
import type { Mcq } from "@/lib/curriculum/types";
import { lcBySlug } from "@/lib/leetcode/registry";
import { useProgress } from "@/lib/curriculum/progress";
import { McqCard } from "./mcq";
import { CaseFileCard } from "./case-files";
import { MockRound, MasteryQuiz } from "./companies-quiz";
import { Btn, Panel } from "./ui/kit";
import { RichText } from "./rich-text";
import { cn } from "@/lib/utils";

/** Small status badge — tone-colored pill used across the universe views. */
function Badge({
  tone = "zinc",
  className,
  children,
}: {
  tone?: "violet" | "emerald" | "zinc";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-300",
    emerald: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
    zinc: "border-zinc-700 bg-zinc-900/80 text-zinc-400",
  } as const;
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

type CompanyTab = "brief" | "plan" | "theory" | "mcq" | "cases" | "problems" | "mock";

/** Timeline dot colors for the day-in-the-life beats — cycle per paragraph. */
const DAY_TONES = ["bg-amber-400", "bg-sky-400", "bg-violet-400", "bg-emerald-400", "bg-rose-400"];

const TABS: Array<{ id: CompanyTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { id: "brief", label: "The brief", icon: Building2 },
  { id: "mock", label: "Mock round", icon: Timer },
  { id: "plan", label: "Master plan", icon: Map },
  { id: "theory", label: "Theory Q&A", icon: MessagesSquare },
  { id: "mcq", label: "MCQs", icon: ListChecks },
  { id: "cases", label: "Case studies", icon: FileStack },
  { id: "problems", label: "Problems", icon: Code2 },
];

function diffColor(d: string): string {
  return d === "Easy" ? "text-emerald-400" : d === "Medium" ? "text-amber-400" : "text-rose-400";
}

/* ---------------- level 3: the company kit page ---------------- */

function CompanyPage({ kit, onBack, openLc }: { kit: CompanyKit; onBack: () => void; openLc: (slug: string) => void }) {
  const [tab, setTab] = useState<CompanyTab>("brief");
  const [openTheory, setOpenTheory] = useState<string | null>(kit.theory[0]?.id ?? null);
  const xpEvents = useProgress((s) => s.xpEvents);

  const solvedProblems = useMemo(
    () => kit.problems.filter((p) => xpEvents[`lc:${p.slug}`] !== undefined).length,
    [kit.problems, xpEvents],
  );
  const solvedCases = kit.cases.filter((c) => xpEvents[`case:${c.id}`] !== undefined).length;

  return (
    <div className="space-y-5">
      <Btn variant="soft" onClick={onBack} aria-label="Back to domain">
        <ArrowLeft className="h-3.5 w-3.5" /> {COMPANY_DOMAINS.find((d) => d.id === kit.domainId)?.name ?? "Domain"}
      </Btn>

      {/* header */}
      <Panel className="relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className={cn("text-lg font-bold tracking-tight", kit.accent)}>{kit.name}</h2>
              <Badge tone="violet" className="!text-[10px]">full interview kit</Badge>
            </div>
            <p className="mt-1 text-xs text-zinc-400">{kit.tagline}</p>
          </div>
          <div className="flex gap-1.5 text-[11px] text-zinc-500">
            <span className="rounded-md border border-zinc-800 px-2 py-1">{kit.problems.length} problems</span>
            <span className="rounded-md border border-zinc-800 px-2 py-1">{kit.theory.length} theory</span>
            <span className="rounded-md border border-zinc-800 px-2 py-1">{kit.mcqs.length} MCQs</span>
            <span className="rounded-md border border-zinc-800 px-2 py-1">{kit.cases.length} cases</span>
          </div>
        </div>
      </Panel>

      {/* tab strip */}
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={`${kit.name} kit sections`}>
        {TABS.map((t) => (
          <Btn key={t.id} variant="pill" active={tab === t.id} onClick={() => setTab(t.id)} aria-current={tab === t.id ? "page" : undefined}>
            <t.icon className="h-3 w-3 shrink-0" /> {t.label}
          </Btn>
        ))}
      </div>

      {/* -------- brief -------- */}
      {tab === "brief" && (
        <div className="space-y-5">
          <Panel>
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-zinc-400" />
              <h3 className="text-sm font-semibold text-zinc-100">Who they are, how they run data</h3>
            </div>
            <div className="mt-3 space-y-3">
              {kit.brief.map((p, i) => (
                <p key={i} className="text-sm leading-relaxed text-zinc-300"><RichText text={p} /></p>
              ))}
            </div>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <SunMedium className="h-4 w-4 text-amber-300" />
              <h3 className="text-sm font-semibold text-zinc-100">A day in the data team</h3>
            </div>
            <ol className="relative ml-1 mt-4 space-y-5 border-l border-zinc-800 pl-6">
              {kit.dayInLife.map((p, i) => (
                <li key={i} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-zinc-950",
                      DAY_TONES[i % DAY_TONES.length]
                    )}
                  />
                  <p className="text-sm leading-relaxed text-zinc-300"><RichText text={p} /></p>
                </li>
              ))}
            </ol>
          </Panel>

          <Panel>
            <div className="flex items-center gap-2">
              <Gauge className="h-4 w-4 text-sky-300" />
              <h3 className="text-sm font-semibold text-zinc-100">The KPI wall — numbers they live by</h3>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {kit.metrics.map((m) => (
                <div key={m.name} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
                  <div className="text-xs font-semibold text-zinc-100">{m.name}</div>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{m.what}</p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      )}

      {/* -------- master plan -------- */}
      {tab === "plan" && (
        <div className="space-y-3">
          <Panel>
            <div className="flex items-center gap-2">
              <Map className="h-4 w-4 text-emerald-300" />
              <h3 className="text-sm font-semibold text-zinc-100">Topics to master — in study order</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Each topic names why THIS company leans on it, and points at problems from the SQL band that drill exactly that move. Work them top to bottom.
            </p>
          </Panel>
          {kit.topics.map((t, i) => (
            <Panel key={t.name}>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-zinc-700 bg-zinc-900 text-[11px] font-bold text-zinc-300">{i + 1}</span>
                <div className="min-w-0">
                  <h4 className="text-sm font-semibold text-zinc-100">{t.name}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-400">{t.why}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {t.slugs.map((slug) => {
                      const ref = lcBySlug(slug);
                      const done = xpEvents[`lc:${slug}`] !== undefined;
                      return (
                        <button
                          key={slug}
                          onClick={() => openLc(slug)}
                          className={cn(
                            "inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
                            done ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300" : "border-zinc-700 bg-zinc-900 text-zinc-300 hover:border-zinc-500",
                          )}
                          title={ref ? `${ref.title} (${ref.difficulty}) — open the deep dive` : slug}
                        >
                          {done && <Check className="h-3 w-3 shrink-0" />}
                          <span className="truncate">{ref ? ref.title : slug}</span>
                          {ref && <span className={cn("shrink-0 font-mono text-[10px]", diffColor(ref.difficulty))}>{ref.difficulty[0]}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Panel>
          ))}
        </div>
      )}

      {/* -------- theory -------- */}
      {tab === "theory" && (
        <div className="space-y-3">
          <Panel>
            <div className="flex items-center gap-2">
              <MessagesSquare className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-zinc-100">Written theory — the questions interviewers say out loud</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Try answering each one out loud before revealing the model answer — the answer is written the way a strong candidate says it.
            </p>
          </Panel>
          {kit.theory.map((t) => {
            const open = openTheory === t.id;
            return (
              <Panel key={t.id}>
                <button
                  className="flex w-full items-start justify-between gap-3 text-left"
                  onClick={() => setOpenTheory(open ? null : t.id)}
                  aria-expanded={open}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="zinc" className="!text-[10px]">{t.tag}</Badge>
                      <span className="text-sm font-medium text-zinc-100">{t.q}</span>
                    </div>
                  </div>
                  <ChevronRight className={cn("mt-0.5 h-4 w-4 shrink-0 text-zinc-500 transition-transform", open && "rotate-90")} />
                </button>
                {open && <p className="mt-3 border-l-2 border-zinc-700 pl-3 text-sm leading-relaxed text-zinc-300">{t.a}</p>}
              </Panel>
            );
          })}
        </div>
      )}

      {/* -------- mcqs -------- */}
      {tab === "mcq" && (
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-sky-300" />
              <h3 className="text-sm font-semibold text-zinc-100">Screen-style MCQs — every trap they actually set</h3>
            </div>
          </Panel>
          {kit.mcqs.map((m: Mcq, i) => (
            <McqCard key={m.id} mcq={m} index={i + 1} />
          ))}
        </div>
      )}

      {/* -------- cases -------- */}
      {tab === "cases" && (
        <div className="space-y-4">
          <Panel>
            <div className="flex items-center gap-2">
              <FileStack className="h-4 w-4 text-violet-300" />
              <h3 className="text-sm font-semibold text-zinc-100">Case studies — {kit.name}&apos;s asks, on the live storefront db</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Business memos in this company&apos;s voice, graded by rebuilding the query from a chip bank — {solvedCases}/{kit.cases.length} solved so far.
            </p>
          </Panel>
          {kit.cases.map((cs) => (
            <CaseFileCard key={cs.id} cs={cs} />
          ))}
        </div>
      )}

      {/* -------- mock round -------- */}
      {tab === "mock" && <MockRound kit={kit} />}

      {/* -------- problems -------- */}
      {tab === "problems" && (
        <div className="space-y-3">
          <Panel>
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-emerald-300" />
              <h3 className="text-sm font-semibold text-zinc-100">The problem pool — {solvedProblems}/{kit.problems.length} solved</h3>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-zinc-400">
              Curated from the SQL band&apos;s {kit.name}-tagged problems, each with the company-flavored reason it keeps appearing in their screens.
            </p>
          </Panel>
          {kit.problems.map((p) => {
            const ref = lcBySlug(p.slug);
            const done = xpEvents[`lc:${p.slug}`] !== undefined;
            return (
              <Panel key={p.slug}>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {done && <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-label="solved" />}
                      <span className="text-sm font-medium text-zinc-100">{ref?.title ?? p.slug}</span>
                      {ref && <span className={cn("font-mono text-[11px]", diffColor(ref.difficulty))}>{ref.difficulty}</span>}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-zinc-400">{p.why}</p>
                  </div>
                  <Btn variant="soft" onClick={() => openLc(p.slug)} aria-label={`Open ${ref?.title ?? p.slug}`}>
                    <Sparkles className="h-3.5 w-3.5" /> Open dive
                  </Btn>
                </div>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ---------------- level 2: one domain ---------------- */

function DomainPage({ domainId, onBack, onOpen }: { domainId: string; onBack: () => void; onOpen: (id: string) => void }) {
  const domain = COMPANY_DOMAINS.find((d) => d.id === domainId);
  const [quizOpen, setQuizOpen] = useState(false);
  if (!domain) return null;
  const liveCount = domain.companies.filter(isKitLive).length;

  return (
    <div className="space-y-4">
      <Btn variant="soft" onClick={onBack} aria-label="Back to all domains">
        <ArrowLeft className="h-3.5 w-3.5" /> All domains
      </Btn>
      <Panel>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-bold tracking-tight text-zinc-100">{domain.name}</h2>
          <Badge tone={liveCount === domain.companies.length ? "emerald" : "zinc"} className="!text-[10px]">
            {liveCount}/{domain.companies.length} kits live
          </Badge>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-zinc-400">{domain.blurb}</p>
        <div className="mt-3">
          <Btn variant={quizOpen ? "primary" : "soft"} onClick={() => setQuizOpen((o) => !o)} aria-expanded={quizOpen}>
            <Trophy className="h-3.5 w-3.5" /> {quizOpen ? "Hide mastery quiz" : "Mastery quiz — 12 questions"}
          </Btn>
        </div>
        {quizOpen && (
          <div className="mt-3">
            <MasteryQuiz domain={domain} />
          </div>
        )}
      </Panel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {domain.companies.map((id) => {
          const meta = COMPANY_META[id];
          const live = isKitLive(id);
          const kit = companyKit(id);
          return (
            <button key={id} onClick={() => live && onOpen(id)} className={cn("text-left", live ? "cursor-pointer" : "cursor-default")} aria-disabled={!live}>
              <Panel className={cn("h-full transition-colors", live && "hover:border-zinc-600")}>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className={cn("text-sm font-bold", live ? "text-zinc-100" : "text-zinc-500")}>{meta.name}</div>
                    <p className={cn("mt-0.5 text-xs leading-relaxed", live ? "text-zinc-400" : "text-zinc-600")}>{meta.tagline}</p>
                  </div>
                  {live && kit ? (
                    <Badge tone="emerald" className="!text-[10px] shrink-0"><BookOpenCheck className="mr-1 inline h-3 w-3" />full kit</Badge>
                  ) : (
                    <Badge tone="zinc" className="!text-[10px] shrink-0"><Hammer className="mr-1 inline h-3 w-3" />in build</Badge>
                  )}
                </div>
                {live && kit && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5 text-[10px] text-zinc-500">
                    <span className="rounded border border-zinc-800 px-1.5 py-0.5">{kit.problems.length} problems</span>
                    <span className="rounded border border-zinc-800 px-1.5 py-0.5">{kit.topics.length} topics</span>
                    <span className="rounded border border-zinc-800 px-1.5 py-0.5">{kit.theory.length} theory</span>
                    <span className="rounded border border-zinc-800 px-1.5 py-0.5">{kit.mcqs.length} MCQs</span>
                    <span className="rounded border border-zinc-800 px-1.5 py-0.5">{kit.cases.length} cases</span>
                  </div>
                )}
              </Panel>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- level 1: the universe wall ---------------- */

function UniverseHome({ onOpen }: { onOpen: (domainId: string) => void }) {
  const totalKits = COMPANY_DOMAINS.reduce((n, d) => n + d.companies.filter(isKitLive).length, 0);
  const totalCompanies = COMPANY_DOMAINS.reduce((n, d) => n + d.companies.length, 0);

  return (
    <div className="space-y-4">
      <Panel>
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-sky-300" />
          <h2 className="text-base font-bold tracking-tight text-zinc-100">Company Interview Universe</h2>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-zinc-400">
          Eight industries, eight companies each, and — for every company with a live kit — everything they ask in SQL interviews:
          the business brief, a day in their data team, the KPIs they live by, the topics to master, written theory, MCQs, case studies and a
          curated problem pool. {totalKits} of {totalCompanies} kits live so far — new kits land domain by domain.
        </p>
      </Panel>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {COMPANY_DOMAINS.map((d) => {
          const live = d.companies.filter(isKitLive).length;
          return (
            <button key={d.id} onClick={() => onOpen(d.id)} className="text-left" aria-label={`Open domain ${d.name}`}>
              <Panel className="h-full transition-colors hover:border-zinc-600">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-zinc-100">{d.name}</h3>
                  <Badge tone={live > 0 ? "violet" : "zinc"} className="!text-[10px] shrink-0">{live}/{d.companies.length} kits</Badge>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-zinc-500">{d.blurb}</p>
                <div className="mt-2.5 flex flex-wrap gap-1">
                  {d.companies.map((id) => (
                    <span
                      key={id}
                      className={cn(
                        "rounded border px-1.5 py-0.5 text-[10px]",
                        isKitLive(id) ? "border-zinc-600 bg-zinc-800/80 text-zinc-200" : "border-zinc-800 text-zinc-600",
                      )}
                    >
                      {COMPANY_META[id].name}
                    </span>
                  ))}
                </div>
              </Panel>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ---------------- root ---------------- */

export function CompaniesView({
  initialDomain,
  initialCompany,
  openLc,
}: {
  initialDomain?: string;
  initialCompany?: string;
  openLc: (slug: string) => void;
}) {
  const [domain, setDomain] = useState<string | null>(initialDomain ?? null);
  const [company, setCompany] = useState<string | null>(initialCompany ?? null);

  if (company) {
    const kit = companyKit(company);
    if (kit) {
      return (
        <CompanyPage
          key={kit.id}
          kit={kit}
          onBack={() => setCompany(null)}
          openLc={openLc}
        />
      );
    }
  }
  if (domain) {
    return <DomainPage key={domain} domainId={domain} onBack={() => setDomain(null)} onOpen={(id) => setCompany(id)} />;
  }
  return <UniverseHome onOpen={(d) => setDomain(d)} />;
}
