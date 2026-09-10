import { fetchDivisions, fetchTeams } from "@/lib/firestore";
import { Button } from "@/components/ui/button";
import { Layers, Plus } from "lucide-react";
import Link from "next/link";
import { D } from "@/lib/design-system";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { DivisionCard } from "@/components/divisions/DivisionCard";

export default async function DivisionsPage() {
  const [divisions, teams] = await Promise.all([
    fetchDivisions(),
    fetchTeams()
  ]);

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Header */}
      <SectionHeader 
        title="Divisions & Units"
        sub="Institutional age groups and competitive divisions. Squad allocation management."
        icon={<Layers className="w-5 h-5 text-indigo-400" />}
        actions={
          <Link href="/divisions/add">
            <Button className="h-11 px-8 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-indigo-500/20" 
                    style={{ background: D.indigo, color: 'white' }}>
              <Plus className="mr-2 h-4 w-4" />
              ADD DIVISION
            </Button>
          </Link>
        }
      />

      {/* Divisions Grid */}
      <div className="grid gap-6">
        {divisions.map((division: any, index: number) => (
          <DivisionCard 
            key={division.id} 
            division={division} 
            teams={teams} 
            index={index} 
          />
        ))}

        {divisions.length === 0 && (
          <div className="p-24 rounded-[3rem] border border-dashed text-center space-y-4"
               style={{ background: D.surf1, borderColor: D.border }}>
            <div className="h-20 w-20 rounded-3xl flex items-center justify-center mx-auto opacity-20"
                 style={{ background: D.surf2, border: `1px solid ${D.border}` }}>
              <Layers className="h-10 w-10 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold uppercase italic" style={{ color: D.textPrimary, fontFamily: D.head }}>
                No Divisions Found
              </h3>
              <p className="text-sm font-medium" style={{ color: D.textMuted }}>
                Define your first age group division to start organizing squads.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

