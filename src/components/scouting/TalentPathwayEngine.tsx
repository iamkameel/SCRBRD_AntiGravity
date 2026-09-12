"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import {
  Award,
  Bookmark,
  ChevronRight,
  GraduationCap,
  MapPin,
  Plus,
  Radar,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { D } from "@/lib/design-system";
import {
  REGIONAL_TALENT_DEMO,
  type InvitationalStatus,
  type PathwayStage,
  type ProvincialInvitational,
  type RegionalProspect,
} from "@/lib/intelligence/talentIdentificationEngine";
import {
  createProvincialInvitationalAction,
  getRegionalTalentBoardAction,
  toggleWatchlistAction,
  updateProvincialInvitationalStatusAction,
} from "@/app/actions/scoutingActions";
import { PotentialAbilityRadar } from "./PotentialAbilityRadar";

const PATHWAY_STAGES: PathwayStage[] = ["School Squad", "Zonal Select", "Provincial Invitational", "National Camp"];
const INVITATIONAL_STATUSES: InvitationalStatus[] = ["Identified", "Invited", "Confirmed", "Attended", "Selected", "Declined"];

const statusStyles: Record<InvitationalStatus, string> = {
  Identified: "bg-slate-400/10 text-slate-300 border-slate-400/20",
  Invited: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30",
  Confirmed: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  Attended: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  Selected: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  Declined: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

function nextStatus(status: InvitationalStatus): InvitationalStatus | null {
  const index = INVITATIONAL_STATUSES.indexOf(status);
  return index >= 0 && index < INVITATIONAL_STATUSES.length - 2 ? INVITATIONAL_STATUSES[index + 1] : null;
}

function invitationForLocalUpdate(prospect: RegionalProspect, patch: Partial<ProvincialInvitational>): ProvincialInvitational {
  return {
    id: prospect.invitational?.id || `local-${prospect.id}`,
    personId: prospect.id,
    personName: prospect.name,
    province: prospect.invitational?.province || "Gauteng",
    eventName: prospect.invitational?.eventName || "Provincial Invitational",
    eventDate: prospect.invitational?.eventDate || "",
    ageGroup: prospect.invitational?.ageGroup || prospect.ageGroup,
    status: prospect.invitational?.status || "Identified",
    ...patch,
    updatedAt: new Date().toISOString(),
  };
}

export function TalentPathwayEngine() {
  const [prospects, setProspects] = useState<RegionalProspect[]>(REGIONAL_TALENT_DEMO);
  const [selectedId, setSelectedId] = useState(REGIONAL_TALENT_DEMO[0].id);
  const [selectedStage, setSelectedStage] = useState<PathwayStage | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [watchlistOnly, setWatchlistOnly] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [invitee, setInvitee] = useState<RegionalProspect | null>(null);
  const [isCreatingInvitation, setIsCreatingInvitation] = useState(false);
  const [invitationForm, setInvitationForm] = useState({
    province: "Gauteng",
    eventName: "Provincial Talent Identification Invitational",
    eventDate: "",
    notes: "",
  });

  useEffect(() => {
    let active = true;
    const loadBoard = async () => {
      try {
        const result = await getRegionalTalentBoardAction();
        if (active && result.success && result.prospects.length) {
          setProspects(result.prospects);
          setSelectedId(result.prospects[0].id);
        }
      } catch (error) {
        console.error("Unable to load regional talent board:", error);
      } finally {
        if (active) setIsLoading(false);
      }
    };
    loadBoard();
    return () => { active = false; };
  }, []);

  const filteredProspects = useMemo(() => prospects.filter((prospect) => {
    const matchesSearch = !searchQuery || [prospect.name, prospect.school, prospect.region, prospect.roleArchetype]
      .some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch
      && (selectedStage === "ALL" || prospect.pathwayStage === selectedStage)
      && (!watchlistOnly || prospect.inWatchlist);
  }), [prospects, searchQuery, selectedStage, watchlistOnly]);

  const selectedProspect = prospects.find((prospect) => prospect.id === selectedId) || filteredProspects[0] || prospects[0];
  const selectedSnapshot = selectedProspect?.abilityHistory.find((snapshot) => snapshot.season === selectedSeason)
    || selectedProspect?.abilityHistory[selectedProspect.abilityHistory.length - 1];

  useEffect(() => {
    if (selectedProspect && !selectedProspect.abilityHistory.some((snapshot) => snapshot.season === selectedSeason)) {
      setSelectedSeason(selectedProspect.abilityHistory[selectedProspect.abilityHistory.length - 1]?.season || "");
    }
  }, [selectedProspect, selectedSeason]);

  const toggleWatchlist = async (prospect: RegionalProspect) => {
    const previous = prospect.inWatchlist;
    setProspects((current) => current.map((item) => item.id === prospect.id ? {
      ...item,
      inWatchlist: !previous,
      watchlistPriority: !previous ? item.watchlistPriority || "Standard" : undefined,
    } : item));

    try {
      const result = await toggleWatchlistAction(prospect.id, { priority: prospect.watchlistPriority || "Standard", region: prospect.region });
      if (result.success) return;
    } catch (error) {
      console.error("Unable to update talent watchlist:", error);
    }
    setProspects((current) => current.map((item) => item.id === prospect.id ? { ...item, inWatchlist: previous } : item));
  };

  const updateInvitationStatus = async (prospect: RegionalProspect, status: InvitationalStatus) => {
    const previous = prospect.invitational;
    const invitation = invitationForLocalUpdate(prospect, { status });
    setProspects((current) => current.map((item) => item.id === prospect.id ? {
      ...item,
      invitational: invitation,
      pathwayStage: status === "Selected" ? "National Camp" : "Provincial Invitational",
    } : item));

    if (!previous?.id || previous.id.startsWith("local-")) return;
    try {
      const result = await updateProvincialInvitationalStatusAction(previous.id, status);
      if (result.success) return;
    } catch (error) {
      console.error("Unable to update provincial invitation:", error);
    }
    setProspects((current) => current.map((item) => item.id === prospect.id ? { ...item, invitational: previous } : item));
  };

  const createInvitation = async () => {
    if (!invitee || !invitationForm.eventDate) return;
    setIsCreatingInvitation(true);
    try {
      const result = await createProvincialInvitationalAction({
        personId: invitee.id,
        personName: invitee.name,
        province: invitationForm.province,
        eventName: invitationForm.eventName,
        eventDate: invitationForm.eventDate,
        ageGroup: invitee.ageGroup,
        status: "Invited",
        notes: invitationForm.notes,
      });
      if (result.success) {
        const invitation = invitationForLocalUpdate(invitee, {
          id: result.id || `local-${invitee.id}`,
          province: invitationForm.province,
          eventName: invitationForm.eventName,
          eventDate: invitationForm.eventDate,
          notes: invitationForm.notes,
          status: "Invited",
        });
        setProspects((current) => current.map((item) => item.id === invitee.id ? { ...item, invitational: invitation, pathwayStage: "Provincial Invitational" } : item));
        setInvitee(null);
      }
    } finally {
      setIsCreatingInvitation(false);
    }
  };

  const invitationCount = prospects.filter((prospect) => prospect.invitational && prospect.invitational.status !== "Declined").length;
  const selectedCount = prospects.filter((prospect) => prospect.invitational?.status === "Selected").length;

  return (
    <div className="space-y-8 pb-12">
      <section className="rounded-[2.5rem] border p-7 md:p-9 shadow-2xl relative overflow-hidden" style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.16)_0%,transparent_60%)]" />
        <div className="relative space-y-7">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-indigo-400">
                <GraduationCap className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.28em]" style={{ fontFamily: D.mono }}>Module 14 · Regional talent identification</span>
              </div>
              <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tighter" style={{ color: D.textPrimary, fontFamily: D.head }}>
                SCOUT. <span className="italic text-indigo-400">PROJECT.</span> SELECT.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed" style={{ color: D.textSecondary }}>
                Convert field reports into a multi-season talent profile, maintain a focused watchlist, and track provincial invitations from identification through selection.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 min-w-[240px]">
              <div className="rounded-2xl border p-4" style={{ background: D.surf2, borderColor: D.border }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted, fontFamily: D.mono }}>Active invitations</p>
                <p className="mt-1 text-3xl font-black text-indigo-400" style={{ fontFamily: D.head }}>{invitationCount}</p>
              </div>
              <div className="rounded-2xl border p-4" style={{ background: D.surf2, borderColor: D.border }}>
                <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted, fontFamily: D.mono }}>Selected</p>
                <p className="mt-1 text-3xl font-black text-emerald-400" style={{ fontFamily: D.head }}>{selectedCount}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 border-t pt-6" style={{ borderColor: D.border }}>
            {PATHWAY_STAGES.map((stage) => {
              const selected = stage === selectedStage;
              const count = prospects.filter((prospect) => prospect.pathwayStage === stage).length;
              return (
                <button key={stage} onClick={() => setSelectedStage(selected ? "ALL" : stage)} className="rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5" style={{ background: selected ? `${D.indigo}18` : D.surf2, borderColor: selected ? `${D.indigo}88` : D.border }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted, fontFamily: D.mono }}>{stage}</p>
                  <div className="mt-2 flex items-center justify-between"><span className="text-2xl font-black" style={{ color: selected ? D.indigo : D.textPrimary, fontFamily: D.head }}>{count}</span><ChevronRight className="h-4 w-4" style={{ color: D.textMuted }} /></div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="grid xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)] gap-6">
        <div className="space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: D.indigo, fontFamily: D.mono }}>Regional board</p>
              <h3 className="text-2xl font-black" style={{ color: D.textPrimary, fontFamily: D.head }}>Watchlists & priority prospects</h3>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setWatchlistOnly((value) => !value)} className="h-10 rounded-xl border px-3 text-[10px] font-black uppercase tracking-widest transition-colors" style={{ background: watchlistOnly ? `${D.amber}18` : D.surf2, borderColor: watchlistOnly ? `${D.amber}80` : D.border, color: watchlistOnly ? D.amber : D.textSecondary }}><Bookmark className="mr-1.5 inline h-3.5 w-3.5" />Watchlist</button>
              <div className="relative"><Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2" style={{ color: D.textMuted }} /><input aria-label="Search regional prospects" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search athlete or region" className="h-10 w-52 rounded-xl border pl-9 pr-3 text-xs outline-none" style={{ background: D.surf2, borderColor: D.border, color: D.textPrimary }} /></div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {filteredProspects.map((prospect, index) => (
              <motion.article key={prospect.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }} className="rounded-3xl border p-5 cursor-pointer transition-all hover:border-indigo-400/50" onClick={() => setSelectedId(prospect.id)} style={{ background: selectedId === prospect.id ? `${D.indigo}0d` : D.surf1, borderColor: selectedId === prospect.id ? `${D.indigo}88` : D.border }}>
                <div className="flex justify-between gap-3">
                  <div><div className="flex items-center gap-2"><h4 className="font-black text-lg" style={{ color: D.textPrimary, fontFamily: D.head }}>{prospect.name}</h4><Badge className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-[9px]">{prospect.scoutGrade}</Badge></div><p className="mt-1 text-[11px]" style={{ color: D.textSecondary }}>{prospect.school} · {prospect.ageGroup}</p></div>
                  <button aria-label={`Toggle ${prospect.name} watchlist`} onClick={(event) => { event.stopPropagation(); toggleWatchlist(prospect); }} className="h-8 w-8 rounded-lg border transition-colors" style={{ background: prospect.inWatchlist ? `${D.amber}18` : D.surf2, borderColor: prospect.inWatchlist ? `${D.amber}66` : D.border, color: prospect.inWatchlist ? D.amber : D.textMuted }}><Bookmark className={`mx-auto h-3.5 w-3.5 ${prospect.inWatchlist ? "fill-current" : ""}`} /></button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3"><AbilityMetric label="Current ability" value={prospect.currentAbility} colour={D.sky} /><AbilityMetric label="Projected ceiling" value={prospect.projectedPotential} colour={D.indigo} /></div>
                <div className="mt-4 flex items-center justify-between gap-3"><span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted, fontFamily: D.mono }}><MapPin className="h-3 w-3" />{prospect.region}</span>{prospect.invitational ? <Badge className={`border text-[9px] ${statusStyles[prospect.invitational.status]}`}>{prospect.invitational.status}</Badge> : <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>No invite</span>}</div>
              </motion.article>
            ))}
          </div>
          {!isLoading && filteredProspects.length === 0 && <div className="rounded-2xl border p-10 text-center text-sm" style={{ background: D.surf1, borderColor: D.border, color: D.textSecondary }}>No prospects match this board filter.</div>}
        </div>

        {selectedProspect && selectedSnapshot && (
          <aside className="space-y-5">
            <div className="rounded-3xl border p-5" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400" style={{ fontFamily: D.mono }}>Multi-season projection</p><h3 className="mt-1 text-2xl font-black" style={{ color: D.textPrimary, fontFamily: D.head }}>{selectedProspect.name}</h3><p className="mt-1 text-xs" style={{ color: D.textSecondary }}>{selectedProspect.roleArchetype} · {selectedProspect.reportCount} reports</p></div><Radar className="h-5 w-5 text-indigo-400" /></div>
              <div className="mt-5 flex flex-wrap gap-2" aria-label="Season selector">{selectedProspect.abilityHistory.map((snapshot) => <button key={snapshot.season} onClick={() => setSelectedSeason(snapshot.season)} className="rounded-lg border px-3 py-1.5 text-[10px] font-black" style={{ background: selectedSnapshot.season === snapshot.season ? `${D.indigo}22` : D.surf2, borderColor: selectedSnapshot.season === snapshot.season ? `${D.indigo}88` : D.border, color: selectedSnapshot.season === snapshot.season ? D.indigo : D.textSecondary }}>{snapshot.season}</button>)}</div>
              <div className="mt-5"><PotentialAbilityRadar snapshot={selectedSnapshot} athleteName={selectedProspect.name} /></div>
              <p className="mt-4 rounded-xl border p-3 text-xs leading-relaxed italic" style={{ background: D.surf2, borderColor: D.border, color: D.textSecondary }}>&ldquo;{selectedProspect.notes}&rdquo;</p>
            </div>

            <section className="rounded-3xl border p-5" style={{ background: D.surf1, borderColor: D.border }}>
              <div className="flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400" style={{ fontFamily: D.mono }}>Provincial invitational</p><h3 className="mt-1 font-black" style={{ color: D.textPrimary, fontFamily: D.head }}>{selectedProspect.invitational?.eventName || "No active invitation"}</h3></div><Award className="h-5 w-5 text-amber-400" /></div>
              {selectedProspect.invitational ? <div className="mt-4 space-y-3"><div className="flex items-center justify-between text-xs" style={{ color: D.textSecondary }}><span>{selectedProspect.invitational.province} · {selectedProspect.invitational.ageGroup}</span><Badge className={`border text-[9px] ${statusStyles[selectedProspect.invitational.status]}`}>{selectedProspect.invitational.status}</Badge></div><p className="text-xs" style={{ color: D.textSecondary }}>{selectedProspect.invitational.eventDate || "Date to be confirmed"}</p><div className="flex gap-2">{nextStatus(selectedProspect.invitational.status) && <Button onClick={() => updateInvitationStatus(selectedProspect, nextStatus(selectedProspect.invitational!.status)!)} className="flex-1 rounded-xl text-[10px] font-black uppercase tracking-wider" style={{ background: D.indigo, color: "white" }}>Advance to {nextStatus(selectedProspect.invitational.status)}</Button>}<select aria-label="Invitation status" value={selectedProspect.invitational.status} onChange={(event) => updateInvitationStatus(selectedProspect, event.target.value as InvitationalStatus)} className="rounded-xl border px-2 text-[10px] font-bold" style={{ background: D.surf2, borderColor: D.border, color: D.textPrimary }}>{INVITATIONAL_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}</select></div></div> : <Button onClick={() => { setInvitee(selectedProspect); setInvitationForm((current) => ({ ...current, province: selectedProspect.region.includes("KwaZulu") ? "KwaZulu-Natal" : "Gauteng" })); }} className="mt-4 w-full rounded-xl text-[10px] font-black uppercase tracking-wider" style={{ background: D.indigo, color: "white" }}><Plus className="mr-1.5 h-3.5 w-3.5" />Create provincial invitation</Button>}
            </section>
          </aside>
        )}
      </section>

      <Dialog open={Boolean(invitee)} onOpenChange={(open) => !open && setInvitee(null)}>
        <DialogContent className="sm:max-w-lg" style={{ background: D.surf1, borderColor: D.border }}>
          <DialogHeader><DialogTitle style={{ color: D.textPrimary, fontFamily: D.head }}>Create provincial invitation</DialogTitle><DialogDescription>Track {invitee?.name}&apos;s selection journey independently from their scouting report.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-2"><Field label="Province"><Input value={invitationForm.province} onChange={(event) => setInvitationForm({ ...invitationForm, province: event.target.value })} /></Field><Field label="Invitational event"><Input value={invitationForm.eventName} onChange={(event) => setInvitationForm({ ...invitationForm, eventName: event.target.value })} /></Field><Field label="Event date"><Input type="date" value={invitationForm.eventDate} onChange={(event) => setInvitationForm({ ...invitationForm, eventDate: event.target.value })} /></Field><Field label="Selector notes"><Textarea value={invitationForm.notes} onChange={(event) => setInvitationForm({ ...invitationForm, notes: event.target.value })} placeholder="Attendance, workload or role allocation notes" /></Field></div>
          <DialogFooter><Button variant="ghost" onClick={() => setInvitee(null)}>Cancel</Button><Button disabled={!invitationForm.eventDate || isCreatingInvitation} onClick={createInvitation} style={{ background: D.indigo, color: "white" }}>{isCreatingInvitation ? "Creating…" : "Issue invitation"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function AbilityMetric({ label, value, colour }: { label: string; value: number; colour: string }) {
  return <div><div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest" style={{ color: D.textMuted, fontFamily: D.mono }}><span>{label}</span><span style={{ color: colour }}>{value}</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full" style={{ background: D.surf2 }}><div className="h-full rounded-full" style={{ width: `${value}%`, background: colour }} /></div></div>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <div className="grid gap-1.5"><Label className="text-[10px] font-black uppercase tracking-widest" style={{ color: D.textMuted }}>{label}</Label>{children}</div>;
}
