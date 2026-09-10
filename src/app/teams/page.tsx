import { teamService } from "@/services/teamService";
import { organisationService } from "@/services/organisationService";
import { ageDivisionService } from "@/services/ageDivisionService";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Layers, Shield, Award, Users } from "lucide-react";
import { TeamsClient } from "@/components/teams/TeamsClient";
import { D } from '@/lib/design-system';

export const dynamic = 'force-dynamic';

export default async function TeamsPage() {
  const [teams, organisations, ageDivisions] = await Promise.all([
    teamService.getAll(),
    organisationService.getAll(),
    ageDivisionService.getAll()
  ]);

  return (
    <div className="space-y-12 pb-24 animate-slide-in-up">
      {/* Strategic Command Header */}
      <div className="relative p-10 rounded-[3rem] border overflow-hidden shadow-2xl" 
           style={{ background: D.surf1, borderColor: D.border }}>
        <div className="absolute inset-0 opacity-10" style={{ background: D.gradMain }} />
        <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
          <div className="h-24 w-24 rounded-3xl flex items-center justify-center shadow-inner" 
               style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
             <Layers className="h-12 w-12 text-indigo-500" />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tighter uppercase italic leading-none" 
                style={{ fontFamily: D.head, color: D.textPrimary }}>
              TEAM <span style={{ color: D.indigo }}>REGISTRY</span>
            </h1>
            <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4 opacity-60 italic" style={{ color: D.textMuted }}>
                INSTITUTIONAL TEAM IDENTITIES & RELATIONAL MANAGEMENT ENGINE
            </p>
          </div>
          <div className="lg:ml-auto w-full lg:w-auto">
             <Link href="/teams/add">
               <Button className="w-full lg:w-auto px-12 h-16 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all hover:scale-105 active:scale-95" 
                       style={{ background: D.indigo, color: 'white' }}>
                 CREATE NEW TEAM
               </Button>
             </Link>
          </div>
        </div>
      </div>

      <TeamsClient 
        teams={teams} 
        organisations={organisations} 
        ageDivisions={ageDivisions} 
      />
    </div>
  );
}
