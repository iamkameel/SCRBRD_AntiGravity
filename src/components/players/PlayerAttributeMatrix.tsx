"use client";

import { useMemo, useState } from "react";
import { D } from "@/lib/design-system";
import { SkillAssessment, SkillDomain } from "@/types/schema_v4";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ChevronDown, ChevronUp, Lock, ShieldCheck } from "lucide-react";

interface PlayerAttributeMatrixProps {
  assessments: SkillAssessment[];
  playingRole?: string;
  onInspectAttribute?: (domain: string, attribute: string, rating: number) => void;
}

const DOMAINS: SkillDomain[] = [
  "Physical", "Mental", "Tactical", "Batting", "Bowling", "Fielding", "Wicketkeeping",
];

/** The six domains that form the profile shape; keeping is role-specific. */
const CORE_DOMAINS: SkillDomain[] = ["Batting", "Bowling", "Fielding", "Physical", "Mental", "Tactical"];

const ATTRIBUTE_MAP: Record<SkillDomain, string[]> = {
  Physical: ["Speed", "Agility", "Acceleration", "Coordination", "Balance", "Mobility", "Strength", "Power", "Endurance", "Workload"],
  Mental: ["Concentration", "Composure", "Resilience", "Confidence", "Discipline", "Intent", "Patience", "Pressure", "Reset", "Work Ethic"],
  Tactical: ["Match Awareness", "Game State", "Decision Making", "Phase Awareness", "Opposition Reading", "Option Selection", "Field Awareness", "Plan Execution", "Adaptability"],
  Batting: ["Setup", "Defensive", "Leave", "Rotation", "Gaps", "Boundary", "Range", "vs Pace", "vs Spin", "Footwork", "Tempo", "Innings Construction", "Pressure"],
  Bowling: ["Rhythm", "Release", "Control", "Line", "Length", "Pace", "Seam/Swing", "Variation", "Threat", "New Ball", "Middle Overs", "Death", "Intelligence", "Repeatability"],
  Fielding: ["Catching", "High Catching", "Slip Catching", "Ground", "Release", "Accuracy", "Power", "Reflexes", "Anticipation", "Positioning", "Boundary", "Pressure", "Comms"],
  Wicketkeeping: ["Setup", "Glove Work", "Collection", "Hands", "Standing Back", "Standing Up", "Leg Side", "Footwork", "Stumping", "Gather/Release", "Reaction", "Comms"],
};

const MAX_RATING = 9;

/** Rating bands on the 1–9 assessment scale. */
function band(rating: number) {
  if (rating >= 8) return { label: "Elite", color: "#22c55e" };
  if (rating >= 7) return { label: "Very Good", color: "#10b981" };
  if (rating >= 5) return { label: "Good", color: "#0ea5e9" };
  if (rating >= 3) return { label: "Average", color: "#f59e0b" };
  return { label: "Developing", color: "#f43f5e" };
}

interface DomainSummary {
  domain: SkillDomain;
  average: number | null;
  assessed: number;
  total: number;
}

/** Hexagonal profile shape — the six core domains at a glance. */
function ProfileHexagon({ summaries }: { summaries: DomainSummary[] }) {
  const size = 190;
  const c = size / 2;
  const r = size / 2 - 34;
  const pointAt = (i: number, radius: number) => {
    const angle = (Math.PI * 2 * i) / summaries.length - Math.PI / 2;
    return [c + radius * Math.cos(angle), c + radius * Math.sin(angle)] as const;
  };

  const rings = [0.25, 0.5, 0.75, 1];
  const gridPath = (scale: number) =>
    summaries.map((_, i) => pointAt(i, r * scale).join(",")).join(" ");

  const anyAssessed = summaries.some(s => s.average !== null);
  const shape = summaries
    .map((s, i) => pointAt(i, r * ((s.average ?? 0) / MAX_RATING)).join(","))
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto max-w-[210px]" role="img" aria-label="Profile shape across core skill domains">
      {rings.map(scale => (
        <polygon key={scale} points={gridPath(scale)} fill="none" stroke="currentColor" strokeWidth="0.6" className="text-zinc-300 dark:text-white/10" />
      ))}
      {summaries.map((_, i) => {
        const [x, y] = pointAt(i, r);
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="currentColor" strokeWidth="0.5" className="text-zinc-300 dark:text-white/10" />;
      })}

      {anyAssessed && (
        <>
          <polygon points={shape} fill="#22c55e" fillOpacity="0.22" stroke="#22c55e" strokeWidth="1.6" strokeLinejoin="round" />
          {summaries.map((s, i) => {
            if (s.average === null) return null;
            const [x, y] = pointAt(i, r * (s.average / MAX_RATING));
            return <circle key={s.domain} cx={x} cy={y} r="2.6" fill="#22c55e" />;
          })}
        </>
      )}

      {summaries.map((s, i) => {
        const [x, y] = pointAt(i, r + 17);
        return (
          <text
            key={s.domain}
            x={x}
            y={y}
            textAnchor={Math.abs(x - c) < 6 ? "middle" : x > c ? "start" : "end"}
            dominantBaseline="middle"
            className="fill-zinc-500 dark:fill-white/45"
            style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.06em" }}
          >
            {s.domain.toUpperCase()}
          </text>
        );
      })}
    </svg>
  );
}

function AttributeBar({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-white/[0.06]" />;
  }
  const { color } = band(rating);
  return (
    <div className="h-1.5 w-full rounded-full bg-zinc-200 dark:bg-white/[0.06] overflow-hidden">
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${(rating / MAX_RATING) * 100}%`, background: color }}
      />
    </div>
  );
}

export function PlayerAttributeMatrix({ assessments, playingRole, onInspectAttribute }: PlayerAttributeMatrixProps) {
  const isKeeper = !!playingRole?.toLowerCase().includes("wicketkeeper");
  const [collapsedDomains, setCollapsedDomains] = useState<Record<string, boolean>>({
    Fielding: true,
    Wicketkeeping: !isKeeper,
  });

  const toggleDomain = (domain: string) =>
    setCollapsedDomains(prev => ({ ...prev, [domain]: !prev[domain] }));

  /**
   * Ratings come only from recorded assessments. An attribute that has never
   * been assessed is null and renders as "—": a missing rating must never be
   * shown as a number, because selection and development decisions are made
   * from this matrix.
   */
  const ratingFor = useMemo(() => {
    const byKey = new Map<string, number>();
    for (const a of assessments) {
      byKey.set(`${a.domain}::${a.attributeName.toLowerCase()}`, a.rating as number);
    }
    return (domain: SkillDomain, attr: string): number | null =>
      byKey.get(`${domain}::${attr.toLowerCase()}`) ?? null;
  }, [assessments]);

  const summaries: DomainSummary[] = useMemo(
    () =>
      DOMAINS.map(domain => {
        const attrs = ATTRIBUTE_MAP[domain];
        const rated = attrs.map(a => ratingFor(domain, a)).filter((r): r is number => r !== null);
        return {
          domain,
          average: rated.length ? rated.reduce((s, r) => s + r, 0) / rated.length : null,
          assessed: rated.length,
          total: attrs.length,
        };
      }),
    [ratingFor]
  );

  const coreSummaries = useMemo(
    () => summaries.filter(s => CORE_DOMAINS.includes(s.domain)),
    [summaries]
  );

  const overall = useMemo(() => {
    const rated = summaries.filter(s => s.average !== null);
    if (!rated.length) return null;
    return rated.reduce((sum, s) => sum + (s.average as number), 0) / rated.length;
  }, [summaries]);

  const totalAssessed = summaries.reduce((s, d) => s + d.assessed, 0);
  const totalAttributes = summaries.reduce((s, d) => s + d.total, 0);

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* ── Profile card: overall, shape, domain ratings ── */}
        <div className="rounded-3xl border border-zinc-200 dark:border-white/10 bg-gradient-to-br from-zinc-50 to-white dark:from-[#11131a] dark:to-[#0a0b0f] p-6 md:p-7">
          <div className="grid gap-7 lg:grid-cols-[auto_auto_1fr] lg:items-center">
            {/* Overall */}
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div
                  className="text-5xl md:text-6xl font-black leading-none tabular-nums tracking-tighter text-zinc-900 dark:text-white"
                  style={{ fontFamily: D.head }}
                >
                  {overall === null ? "—" : overall.toFixed(1)}
                </div>
                <div
                  className="mt-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-zinc-400 dark:text-white/35"
                  style={{ fontFamily: D.mono }}
                >
                  Overall
                </div>
              </div>
              <div className="h-14 w-px bg-zinc-200 dark:bg-white/10" />
              <div className="space-y-1.5">
                <div
                  className="text-sm font-black uppercase tracking-tight text-zinc-900 dark:text-white"
                  style={{ fontFamily: D.head }}
                >
                  {playingRole || "Player"}
                </div>
                {overall !== null && (
                  <div
                    className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider"
                    style={{
                      color: band(overall).color,
                      borderColor: `${band(overall).color}55`,
                      background: `${band(overall).color}14`,
                      fontFamily: D.mono,
                    }}
                  >
                    {band(overall).label}
                  </div>
                )}
                <div className="text-[10px] font-semibold text-zinc-500 dark:text-white/40" style={{ fontFamily: D.mono }}>
                  {totalAssessed} of {totalAttributes} attributes assessed
                </div>
              </div>
            </div>

            {/* Shape */}
            <div className="flex justify-center text-zinc-400">
              <ProfileHexagon summaries={coreSummaries} />
            </div>

            {/* Domain ratings */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {summaries
                .filter(s => s.domain !== "Wicketkeeping" || isKeeper)
                .map(s => (
                  <div
                    key={s.domain}
                    className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/70 dark:bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span
                        className="text-[9px] font-black uppercase tracking-[0.14em] text-zinc-500 dark:text-white/40"
                        style={{ fontFamily: D.mono }}
                      >
                        {s.domain}
                      </span>
                      <span
                        className="text-lg font-black tabular-nums leading-none"
                        style={{
                          color: s.average === null ? undefined : band(s.average).color,
                          fontFamily: D.head,
                        }}
                      >
                        {s.average === null ? (
                          <span className="text-zinc-300 dark:text-white/20">—</span>
                        ) : (
                          s.average.toFixed(1)
                        )}
                      </span>
                    </div>
                    <div className="mt-2">
                      <AttributeBar rating={s.average} />
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {overall === null && (
            <p className="mt-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-xs font-medium text-amber-700 dark:text-amber-300">
              No skill assessments recorded for this player yet. Ratings appear here once a coach or
              analyst submits an assessment — nothing is estimated or inferred.
            </p>
          )}

          <div className="mt-5 flex items-center gap-2 text-[10px] font-semibold text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
            <ShieldCheck className="h-3 w-3" />
            Ratings are recorded by coaching and analysis staff. Players cannot assess themselves.
          </div>
        </div>

        {/* ── Attribute detail by domain ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOMAINS.map(domain => {
            const attributes = ATTRIBUTE_MAP[domain];
            const isCollapsed = collapsedDomains[domain];
            const summary = summaries.find(s => s.domain === domain)!;

            return (
              <div
                key={domain}
                className="rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/80 dark:bg-[#0c0c10]/80 overflow-hidden shadow-sm transition-all hover:border-zinc-300 dark:hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  aria-expanded={!isCollapsed}
                  className="w-full px-5 py-3.5 border-b border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-white/[0.02] flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className="text-base font-black tabular-nums leading-none w-8"
                      style={{
                        color: summary.average === null ? undefined : band(summary.average).color,
                        fontFamily: D.head,
                      }}
                    >
                      {summary.average === null ? (
                        <span className="text-zinc-300 dark:text-white/20">—</span>
                      ) : (
                        summary.average.toFixed(1)
                      )}
                    </span>
                    <h3
                      className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-900 dark:text-white truncate"
                      style={{ fontFamily: D.mono }}
                    >
                      {domain}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold text-zinc-400 dark:text-white/30" style={{ fontFamily: D.mono }}>
                      {summary.assessed}/{summary.total}
                    </span>
                    {isCollapsed ? (
                      <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
                    )}
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="p-4 space-y-2.5">
                    {attributes.map(attr => {
                      const rating = ratingFor(domain, attr);
                      const assessed = rating !== null;

                      return (
                        <Tooltip key={attr}>
                          <TooltipTrigger asChild>
                            <div
                              onClick={() => assessed && onInspectAttribute?.(domain, attr, rating)}
                              className={cn(
                                "group rounded-lg px-2.5 py-1.5 transition-colors",
                                assessed
                                  ? "cursor-pointer hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                                  : "opacity-60"
                              )}
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-bold text-zinc-700 dark:text-white/70 truncate">
                                  {attr}
                                </span>
                                <span
                                  className="text-xs font-black tabular-nums shrink-0"
                                  style={{
                                    color: assessed ? band(rating).color : undefined,
                                    fontFamily: D.mono,
                                  }}
                                >
                                  {assessed ? rating : <span className="text-zinc-300 dark:text-white/25">—</span>}
                                </span>
                              </div>
                              <div className="mt-1.5">
                                <AttributeBar rating={rating} />
                              </div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-zinc-900 text-white dark:bg-[#111] dark:border-white/10 text-[10px] max-w-[220px]">
                            {assessed ? (
                              <>
                                {attr} — {rating}/{MAX_RATING} ({band(rating).label}). Click to inspect
                                assessment history and evidence.
                              </>
                            ) : (
                              <span className="flex items-center gap-1.5">
                                <Lock className="h-3 w-3" /> Not yet assessed
                              </span>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
