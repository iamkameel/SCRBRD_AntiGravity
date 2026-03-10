import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Shield, Layers } from "lucide-react";
import { Team } from "@/lib/store";

interface TeamCardProps {
  team: any;
  school?: any;
  viewMode?: 'grid' | 'list';
}

export function TeamCard({ team, viewMode = 'grid' }: TeamCardProps) {
  const organisationName = team.organisation?.name || 'Unknown Organisation';
  const divisionName = team.ageDivision?.name || 'Unknown Division';
  
  // Generate fallback avatar if no logo is available
  const fallbackSchoolLogo = team.organisation?.name 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(team.organisation.name)}&background=random&color=fff`
    : '';
    
  // In V4, we use organisation logo as primary fallback
  const displayLogoUrl = fallbackSchoolLogo;

  if (viewMode === 'list') {
    return (
      <Card className="hover:shadow-md transition-shadow group border-l-4 border-l-transparent hover:border-l-primary overflow-hidden">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors font-heading italic">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{organisationName}</p>
            </div>
            <div className="hidden md:flex items-center gap-6 mr-4">
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Division</div>
                <div className="font-medium text-sm">{divisionName}</div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Class</div>
                <div className="font-medium text-sm">{team.teamClass?.label || '-'}</div>
              </div>
            </div>
            <Link href={`/teams/${team.id}`}>
              <Button variant="outline" size="sm" className="hover:bg-primary hover:text-primary-foreground font-heading italic">View</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-500 group border border-primary/10 hover:border-primary/30 bg-card/50 backdrop-blur-sm">
      <CardContent className="p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 shrink-0 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20 shadow-inner group-hover:scale-105 transition-transform">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-xl truncate group-hover:text-primary transition-colors font-heading italic tracking-tight">{team.name}</h3>
            <p className="text-sm text-muted-foreground truncate italic">
              {organisationName}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 p-4 bg-primary/5 rounded-xl border border-primary/10">
          <div>
            <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Division</div>
            <div className="font-medium text-sm truncate">{divisionName}</div>
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground mb-1 uppercase tracking-widest font-bold">Class</div>
            <div className="font-medium text-sm">{team.teamClass?.label || '-'}</div>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant="outline" className="flex-1 justify-center py-1.5 bg-background/50 text-xs font-heading italic">
            Relational V4
          </Badge>
          {team.teamClass?.code && (
            <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0 text-xs">
              {team.teamClass.code}
            </Badge>
          )}
        </div>

        <Link href={`/teams/${team.id}`} className="block pt-2">
          <Button className="w-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 font-heading italic group-hover:translate-y-[-2px] transition-transform">
            Manage Squad
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
