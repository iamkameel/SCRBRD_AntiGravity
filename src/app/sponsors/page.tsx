import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchSponsors } from "@/lib/firestore";
import { Handshake, Globe, ExternalLink, Plus, Trophy } from "lucide-react";
import Link from "next/link";

export default async function SponsorsPage() {
  const sponsors = await fetchSponsors();
  const totalContribution = sponsors.reduce((sum: number, s: any) => sum + (s.contributionAmount || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Handshake className="h-8 w-8 text-primary" />
            Sponsors & Partners
          </h1>
          <p className="text-muted-foreground">Manage relationships with league sponsors and track contributions.</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" /> Add Sponsor
        </Button>
      </div>

      {/* Contribution Summary */}
      <Card className="mb-8 bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-white">
              <Trophy className="h-5 w-5 text-yellow-400" /> Total Sponsorship Value
            </h3>
            <span className="text-2xl font-bold text-yellow-400">R {(totalContribution || 0).toLocaleString()}</span>
          </div>
          {sponsors.length > 0 && totalContribution > 0 && (
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden flex">
              {sponsors.map((s: any, i: number) => (
                <div 
                  key={s.id || i}
                  className="h-full"
                  style={{ 
                    width: `${((s.contributionAmount || 0) / totalContribution) * 100}%`, 
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][i % 5]
                  }}
                  title={`${s.name || 'Unknown'}: R ${(s.contributionAmount || 0).toLocaleString()}`}
                />
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Sponsor Grid */}
      {sponsors.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Handshake className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No sponsors yet</h3>
          <p>Add your first sponsor to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map((sponsor: any, i: number) => (
            <Card key={sponsor.id || i} className="p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4 items-center">
                  <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-xl font-bold text-primary">
                    {(sponsor.name || 'SP').substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold leading-none mb-1">{sponsor.name || 'Unknown Sponsor'}</h3>
                    <p className="text-sm text-muted-foreground">{sponsor.industry || 'N/A'}</p>
                  </div>
                </div>
                <Badge variant={sponsor.active ? 'default' : 'secondary'}>
                  {sponsor.active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg mb-4">
                <span className="text-sm text-muted-foreground">Contribution</span>
                <span className="font-bold">R {(sponsor.contributionAmount || 0).toLocaleString()}</span>
              </div>

              <div className="flex justify-between items-center pt-2">
                {sponsor.website ? (
                  <a 
                    href={sponsor.website} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" /> Visit Website <ExternalLink className="h-3 w-3" />
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground italic">No website</span>
                )}
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Manage
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


